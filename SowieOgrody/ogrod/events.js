// Sowie Ogrody — zdarzenia aktywnej gry (Analiza 2, rozdz. 3.4; Analiza 3 E7c): telefon Pracu Pracu (przerywnik:
// produkcja ×0,7, dopóki go nie odrzucisz), ciężarówka Amic (zastawia grządkę, przegania się stuknięciami), złota
// kózka (losowa premia), Plusk-o-metr i Zatoka Humbaka (20 s łapania liści z combo). Odliczanie biegnie tylko
// w czasie gry, a nieobecność nigdy nie jest karana: `clear()` (przy postępie offline) usuwa telefon i ciężarówkę.
// Czysta logika — rysowanie w render.js, przyciski w main.js.
import { GARDEN_EVENTS as CONFIG, GOAT_REWARDS, PLANTS } from "./config.js";
import { hasUpgrade, prestigeLevel, production } from "./economy.js";

// Bezpiecznik: telefon nie dzwoni dłużej niż 30 min (np. zapomniana karta).
const RING_LIMIT_MS = 30 * 60 * 1000;

/** Losowy czas z przedziału [od, do] (s). */
const between = (random, [min, max]) => min + random() * (max - min);

/** Przedział pojawiania się złotej kózki z Kozim szczęściem (−15% za poziom). */
export function goatInterval(state) {
  const luck = 1 - CONFIG.goat.luck * prestigeLevel(state, "kozieSzczescie");
  return CONFIG.goat.every.map((value) => value * luck);
}

/** Mnożnik nagrody Zatoki Humbaka za złapany liść przy danym combo (z Echem humbaka). */
export function bayMultiplier(state, combo) {
  const { comboStep, comboMax, echo } = CONFIG.bay;
  return (1 + comboStep * Math.min(combo, comboMax)) * (1 + echo * prestigeLevel(state, "echoHumbaka"));
}

/**
 * createEvents({ state, now, random, emit, isOpen(chapterId), addLeaves(n), harvest() }) — silnik zdarzeń
 * podpinany w garden.js. Zwraca { update(dt), hangUp(), shooTruck(), catchGoat(), addSplash(n), startBay(),
 * catchLeaf(x, y, rx, ry), clear() }.
 */
export function createEvents({ state, now, random = Math.random, emit, isOpen, addLeaves, harvest }) {
  let frenzyCredit = 0;

  function ring() {
    state.phone = { time: 0 };
    state.effects.pracu = now() + RING_LIMIT_MS;
    state.stats.calls += 1;
    emit("pracu");
  }

  function hangUp(auto = false) {
    if (!state.phone) return false;
    state.phone = null;
    state.effects.pracu = 0;
    emit("pracuEnd", { auto });
    return true;
  }

  // Ciężarówka zastawia gatunek, który teraz najwięcej produkuje (z kilku największych — losowo).
  function arriveTruck() {
    const prod = production(state, now());
    const owned = PLANTS.filter((plant) => (state.plants[plant.id] || 0) > 0).sort(
      (a, b) => prod.perPlant[b.id] - prod.perPlant[a.id],
    );
    if (!owned.length) return;
    const plant = owned[Math.floor(random() * Math.min(3, owned.length))];
    state.blocked = plant.id;
    state.truck = { taps: 0 };
    state.stats.trucks += 1;
    emit("truck", { plant: plant.id });
  }

  function shooTruck() {
    if (!state.truck) return false;
    state.truck.taps += 1;
    const need = hasUpgrade(state, "kurier") ? 1 : CONFIG.truck.taps;
    if (state.truck.taps >= need) {
      const plant = state.blocked;
      state.truck = null;
      state.blocked = null;
      emit("truckEnd", { plant });
    } else emit("truckTap", { taps: state.truck.taps, need });
    return true;
  }

  function spawnGoat() {
    const reward = GOAT_REWARDS[Math.floor(random() * GOAT_REWARDS.length)].id;
    state.goat = { time: 0, reward, dir: random() < 0.5 ? 1 : -1 };
    emit("goat", { reward });
  }

  function addSplash(amount) {
    if (state.bay) return;
    const before = state.splash;
    state.splash = Math.min(1, state.splash + amount);
    if (before < 1 && state.splash >= 1) emit("bayReady");
  }

  function catchGoat() {
    if (!state.goat) return null;
    const { reward } = state.goat;
    state.goat = null;
    state.stats.goats += 1;
    let leaves = 0;
    if (reward === "boost") {
      state.effects.boost = Math.max(now(), state.effects.boost || 0) + CONFIG.boost.duration * 1000;
    } else if (reward === "instant") {
      leaves = production(state, now()).base * CONFIG.instant;
      addLeaves(leaves);
    } else if (reward === "frenzy") {
      state.effects.frenzy = Math.max(now(), state.effects.frenzy || 0) + CONFIG.frenzy.duration * 1000;
    }
    addSplash(CONFIG.splash.goat + (reward === "splash" ? CONFIG.splash.reward : 0));
    emit("goatCaught", { reward, leaves });
    return reward;
  }

  function startBay() {
    if (state.splash < 1 || state.bay) return false;
    state.splash = 0;
    state.bay = {
      time: CONFIG.bay.duration,
      spawn: 0,
      combo: 0,
      bestCombo: 0,
      caught: 0,
      missed: 0,
      reward: 0,
      leaves: [],
      next: 1,
    };
    emit("bay");
    return true;
  }

  // Liść z fontanny humbaka: współrzędne 0–1 płótna (x — szerokość, y — wysokość, w dół).
  function spawnLeaf(bay) {
    const { fountain, speed, spread } = CONFIG.bay;
    bay.leaves.push({
      id: bay.next,
      x: fountain[0],
      y: fountain[1],
      vx: (random() * 2 - 1) * spread,
      vy: -(speed[0] + random() * (speed[1] - speed[0])),
    });
    bay.next += 1;
  }

  /** Stuknięcie w Zatoce: najbliższy liść w elipsie (rx, ry — promień w ułamkach płótna) → nagroda z combo. */
  function catchLeaf(x, y, rx = 0.09, ry = 0.07) {
    const bay = state.bay;
    if (!bay) return 0;
    let best = null;
    for (const leaf of bay.leaves) {
      const distance = ((leaf.x - x) / rx) ** 2 + ((leaf.y - y) / ry) ** 2;
      if (distance <= 1 && (!best || distance < best.distance)) best = { leaf, distance };
    }
    if (!best) return 0;
    bay.leaves.splice(bay.leaves.indexOf(best.leaf), 1);
    bay.combo += 1;
    bay.bestCombo = Math.max(bay.bestCombo, bay.combo);
    const gain = production(state, now()).base * CONFIG.bay.leafSeconds * bayMultiplier(state, bay.combo);
    addLeaves(gain);
    bay.caught += 1;
    bay.reward += gain;
    emit("bayCatch", { gain, combo: bay.combo, x: best.leaf.x, y: best.leaf.y });
    return gain;
  }

  function updateBay(dt) {
    const bay = state.bay;
    bay.time -= dt;
    bay.spawn -= dt;
    while (bay.spawn <= 0 && bay.time > 0) {
      spawnLeaf(bay);
      bay.spawn += CONFIG.bay.every;
    }
    for (const leaf of bay.leaves) {
      leaf.vy += CONFIG.bay.gravity * dt;
      leaf.x += leaf.vx * dt;
      leaf.y += leaf.vy * dt;
    }
    const fallen = bay.leaves.filter((leaf) => leaf.y > 1.05);
    if (fallen.length) {
      bay.missed += fallen.length;
      bay.combo = 0;
      bay.leaves = bay.leaves.filter((leaf) => leaf.y <= 1.05);
    }
    if (bay.time <= 0) {
      state.bay = null;
      state.stats.bays += 1;
      emit("bayEnd", { caught: bay.caught, missed: bay.missed, reward: bay.reward, bestCombo: bay.bestCombo });
    }
  }

  function update(dt) {
    if (state.bay) updateBay(dt);
    // Kozi szał: kózka zbiera liście za Ciebie (stuknięcia bez licznika) — za część kroku przed końcem szału.
    const frenzy = Math.min(dt, Math.max(0, ((state.effects.frenzy || 0) - now()) / 1000 + dt));
    if (frenzy > 0) {
      frenzyCredit += frenzy * CONFIG.frenzy.taps;
      while (frenzyCredit >= 1) {
        frenzyCredit -= 1;
        harvest();
      }
    } else frenzyCredit = 0;
    const timers = state.timers;
    if (state.phone) {
      state.phone.time += dt;
      if (hasUpgrade(state, "samolot") && state.phone.time >= CONFIG.pracu.airplane) hangUp(true);
    } else if (isOpen(CONFIG.pracu.chapter)) {
      timers.pracu -= dt;
      if (timers.pracu <= 0) {
        ring();
        timers.pracu = between(random, CONFIG.pracu.every);
      }
    }
    if (!state.truck && isOpen(CONFIG.truck.chapter)) {
      timers.truck -= dt;
      if (timers.truck <= 0) {
        arriveTruck();
        timers.truck = between(random, CONFIG.truck.every);
      }
    }
    if (state.goat) {
      state.goat.time += dt;
      if (state.goat.time >= CONFIG.goat.visible) {
        state.goat = null;
        emit("goatGone");
      }
    } else if (!state.bay) {
      timers.goat -= dt;
      if (timers.goat <= 0) {
        spawnGoat();
        timers.goat = between(random, goatInterval(state));
      }
    }
  }

  /** Nieobecność: telefon milknie, ciężarówka odjeżdża, kózka znika (bez kar i bez komunikatów). */
  function clear() {
    state.phone = null;
    state.effects.pracu = 0;
    state.truck = null;
    state.blocked = null;
    state.goat = null;
  }

  return { update, hangUp, shooTruck, catchGoat, addSplash, startBay, catchLeaf, clear };
}
