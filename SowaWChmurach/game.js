// Sowa w Chmurach — logika biegu (bez DOM): sowa sama odbija się od platform, gracz steruje w bok; kamera
// jedzie tylko w górę; upadek pod ekran = ratunek (kózka odnosi sowę na ostatnią pewną platformę, −1 życie);
// przeszkody Pracu (do zdeptania) i Amic (do ominięcia) — trafienie: −1 życie; wynik = wysokość + liście × combo
// + premie. Zdarzenia dla strony gry (dźwięk, komunikaty, SowieProgress).
import { createRng } from "../shared/engine/rng.js";
import {
  CAMERA,
  COZY_TIME,
  DIFFICULTIES,
  EXTRAS,
  FEVER,
  GOATS,
  HAZARDS,
  OWL,
  PLATFORM_TYPES,
  RESCUE,
  SCORE,
  WORLD,
  ZONES,
} from "./config.js";
import { catchesGoat, createExtrasPlanner, goatPose } from "./extras.js";
import { createGenerator } from "./generator.js";
import { canisterX, contact, createHazard, createHazardPlanner, hazardPose, nextCanisterDelay } from "./hazards.js";
import { createOwlBody, steerBy, stepOwl, wrapDelta, wrapX } from "./physics.js";
import { createPlatform, isPerfect, land, landsOn, updatePlatforms } from "./platforms.js";

export const comboLevel = (chain) => Math.min(SCORE.comboMax, 1 + Math.floor(chain / SCORE.comboStep));

// Indeks strefy wysokości (Ogródek, Blok, Chmury, Zorza, Kosmos).
export function zoneAt(height) {
  let index = 0;
  for (let i = 0; i < ZONES.length; i += 1) if (height >= ZONES[i].from) index = i;
  return index;
}

// Premia za idealne lądowanie przy serii `streak`.
export const perfectBonus = (streak) => SCORE.perfect * Math.min(streak, SCORE.perfectMax);

/**
 * createRun({ difficulty, seed, cozy, random, safe, hazards, extras }) — `random` zastępuje generatory z ziarnem
 * (testy), `safe` — ratunek i trafienia bez utraty życia (samouczek), `hazards: false` — bez przeszkód, `extras:
 * false` — bez kózek, serduszek i tęczowych liści (testy rdzenia).
 */
export function createRun({
  difficulty = "arcade",
  seed = "sowa",
  cozy = false,
  random = null,
  safe = false,
  hazards = true,
  extras = true,
} = {}) {
  const info = DIFFICULTIES[difficulty];
  if (!info) throw new Error(`Nieznany poziom trudności: ${difficulty}`);
  const rng = random ? { next: random } : createRng(`${seed}|trasa`);
  const generator = createGenerator({ random: rng.next, difficulty });
  // Przeszkody mają osobny generator losowy — trasa platform nie zależy od nich.
  const hazardRng = random ? { next: random } : createRng(`${seed}|przeszkody`);
  const planner = hazards ? createHazardPlanner({ random: hazardRng.next, difficulty }) : null;
  // Dodatki (kózki, serduszka, tęczowe liście) — też z osobnego generatora.
  const extrasRng = random ? { next: random } : createRng(`${seed}|dodatki`);
  const extrasPlanner = extras ? createExtrasPlanner({ random: extrasRng.next }) : null;
  let lastPath = null;
  const pose = { x: 0, y: 0 };
  const goatAt = { x: 0, y: 0, hopping: false };
  const events = [];
  const emit = (type, detail = {}) => events.push({ type, ...detail });

  const state = {
    difficulty,
    cozy: Boolean(cozy) && difficulty === "chill",
    safe: Boolean(safe),
    phase: "run", // run | rescue | over
    time: 0,
    owl: createOwlBody(WORLD.width / 2, 0),
    keys: { left: false, right: false },
    lives: info.lives,
    maxLives: info.lives,
    // Dolna krawędź widoku (m); na starcie 1 m ziemi ogródka pod sową.
    cameraBottom: -1,
    height: 0,
    zone: 0,
    platforms: [],
    leaves: [],
    hazards: [],
    goats: [],
    hearts: [],
    // Moce kózek na czas: { tarcza, magnes, podwajaczka } → pozostałe sekundy.
    powerups: {},
    // Rakietka (kózka Turbo): pozostały czas lotu w górę; Sprężynka: lot w górę po wystrzale.
    rocket: 0,
    spring: false,
    fever: 0,
    // Znaczniki kanistrów: { x, at (czas spadania) }.
    warnings: [],
    canisterIn: hazards ? nextCanisterDelay(hazardRng.next, difficulty) : Infinity,
    lastSafe: null,
    rescue: null,
    invulnerable: 0,
    leafCount: 0,
    leafPoints: 0,
    bonusPoints: 0,
    chain: 0,
    combo: 1,
    bestCombo: 1,
    perfectStreak: 0,
    bestStreak: 0,
    perfects: 0,
    bounces: 0,
    rescues: 0,
    hits: 0,
    goatCount: 0,
    fevers: 0,
    livesGained: 0,
    stomps: 0,
    score: 0,
    endReason: null,
  };
  // Start: sowa na ziemi ogródka od razu się wybija.
  state.owl.vy = OWL.jumpVelocity;

  function spawn() {
    const before = state.platforms.length;
    generator.fill(state.cameraBottom + CAMERA.ahead, state.platforms, state.leaves);
    // Planiści przeszkód i dodatków dla każdej nowej pary kolejnych platform ścieżki.
    for (let index = before; index < state.platforms.length; index += 1) {
      const platform = state.platforms[index];
      if (!platform.path) continue;
      if (lastPath) {
        planner?.plan(lastPath, platform, state.hazards);
        extrasPlanner?.plan(lastPath, platform, state.goats, state.hearts, state.leaves);
      }
      lastPath = platform;
    }
  }

  function cleanup() {
    const limit = state.cameraBottom - CAMERA.behind;
    state.platforms = state.platforms.filter(
      (item) => !item.gone && (item.y >= limit || item === state.lastSafe || item === state.rescue?.target),
    );
    state.leaves = state.leaves.filter((item) => !item.taken && item.y >= limit);
    state.goats = state.goats.filter((item) => !item.taken && Math.max(item.from.y, item.to.y) >= limit);
    state.hearts = state.hearts.filter((item) => !item.taken && item.y >= limit);
    state.hazards = state.hazards.filter((item) => {
      if (item.gone) return false;
      const at = hazardPose(item, state.time, pose);
      const half = HAZARDS.kinds[item.kind].halfW;
      // Wlatujące z boku znikają po przelocie przez kolumnę; kanister — pod dolną krawędzią.
      if (item.born !== null && item.speed && (at.x < -half - 1 || at.x > WORLD.width + half + 1)) return false;
      return at.y >= (item.kind === "kanister" ? state.cameraBottom - 2 : limit);
    });
  }

  function loseLife() {
    if (state.safe) return;
    state.lives = state.cozy ? Math.max(1, state.lives - 1) : state.lives - 1;
  }

  // Combo spada o jeden poziom, seria idealnych lądowań się kończy.
  function breakChain() {
    state.perfectStreak = 0;
    state.chain = Math.max(0, (state.combo - 2) * SCORE.comboStep);
    state.combo = comboLevel(state.chain);
  }

  // Przeszkody: wejście w widok (rój maili, sterowiec), kanistry ze znacznikiem, zdeptania i trafienia.
  function updateHazards(previousY, dt) {
    const owl = state.owl;
    for (const item of state.hazards) {
      if (item.born === null && item.y0 - HAZARDS.kinds[item.kind].halfH <= state.cameraBottom + HAZARDS.viewAhead) {
        item.born = state.time;
      }
    }
    if (planner && state.height >= HAZARDS.canister.from) {
      state.canisterIn -= dt;
      if (state.canisterIn <= 0) {
        const x = canisterX(owl.x, hazardRng.next);
        state.warnings.push({ x, at: state.time + HAZARDS.canister.warning });
        state.canisterIn = nextCanisterDelay(hazardRng.next, state.difficulty);
        emit("warning", { kind: "kanister", x });
      }
    }
    for (let index = state.warnings.length - 1; index >= 0; index -= 1) {
      const warning = state.warnings[index];
      if (state.time < warning.at) continue;
      state.warnings.splice(index, 1);
      state.hazards.push(
        createHazard("kanister", warning.x, state.cameraBottom + HAZARDS.canister.startAbove, { born: state.time }),
      );
    }
    for (const item of state.hazards) {
      if (item.gone || item.born === null) continue;
      hazardPose(item, state.time, pose);
      const result = contact(owl, previousY, item, state.time, pose);
      if (result === "stomp") {
        const kind = HAZARDS.kinds[item.kind];
        item.gone = true;
        owl.vy = OWL.jumpVelocity * HAZARDS.stompBounce;
        owl.y = Math.max(owl.y, pose.y + kind.halfH);
        state.stomps += 1;
        state.bonusPoints += kind.points;
        addChain();
        emit("stomp", { kind: item.kind, family: item.family, x: pose.x, y: pose.y, points: kind.points });
      } else if (result === "hit" && state.invulnerable <= 0 && state.rocket <= 0 && !state.spring) {
        if (state.powerups.tarcza > 0) {
          // Tarcza przyjmuje trafienie.
          delete state.powerups.tarcza;
          state.invulnerable = 1;
          emit("shield", { kind: item.kind, family: item.family });
          continue;
        }
        state.hits += 1;
        state.invulnerable = HAZARDS.invulnerable;
        breakChain();
        loseLife();
        emit("hit", { kind: item.kind, family: item.family, x: pose.x, y: pose.y, lives: state.lives });
        if (state.lives <= 0) {
          state.lives = 0;
          finish("trafienie");
          return;
        }
      }
    }
  }

  function addChain(amount = 1) {
    const previous = state.combo;
    state.chain += amount;
    state.combo = comboLevel(state.chain);
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    if (state.combo > previous) emit("combo", { combo: state.combo });
  }

  function updateScore() {
    state.score = Math.floor(state.height * SCORE.perMeter) + state.leafPoints + state.bonusPoints;
  }

  function bounceFrom(platform) {
    const owl = state.owl;
    const result = land(platform);
    if (result.bounce <= 0) {
      // Krucha gałązka łamie się pod sową — bez odbicia, sowa spada dalej.
      emit("crack", { x: platform.x, y: platform.y });
      return;
    }
    owl.y = platform.y;
    owl.vy = OWL.jumpVelocity * result.bounce;
    state.bounces += 1;
    if (result.points) state.bonusPoints += result.points;
    const perfect = isPerfect(owl, platform);
    if (perfect) {
      state.perfectStreak += 1;
      state.perfects += 1;
      state.bestStreak = Math.max(state.bestStreak, state.perfectStreak);
      const bonus = perfectBonus(state.perfectStreak);
      state.bonusPoints += bonus;
      addChain();
      emit("perfect", { streak: state.perfectStreak, bonus });
    } else {
      state.perfectStreak = 0;
    }
    if (PLATFORM_TYPES[platform.type].solid) state.lastSafe = platform;
    emit("bounce", { platform: platform.type, x: owl.x, y: platform.y, perfect, points: result.points });
    if (platform.type === "chmurka") emit("puff", { x: platform.x, y: platform.y });
    if (platform.type === "balkon" && !platform.visited) {
      platform.visited = true;
      emit("balcony", { y: platform.y });
    }
  }

  function landings(previousY) {
    const owl = state.owl;
    if (owl.vy > 0) return;
    // Ziemia ogródka (y = 0) jest zawsze — także pod ekranem, zanim kamera odjedzie wyżej niż margines upadku.
    let best = null;
    for (const platform of state.platforms) {
      if (landsOn(owl, previousY, platform) && (!best || platform.y > best.y)) best = platform;
    }
    if (best) bounceFrom(best);
    else if (previousY >= 0 && owl.y <= 0) {
      owl.y = 0;
      owl.vy = OWL.jumpVelocity;
      state.perfectStreak = 0;
      emit("bounce", { platform: "ziemia", x: owl.x, y: 0, perfect: false, points: 0 });
    }
  }

  // Mnożnik liści: Podwajaczka × Gorączka Monster.
  const leafMultiplier = () => (state.powerups.podwajaczka > 0 ? 2 : 1) * (state.fever > 0 ? FEVER.multiplier : 1);

  function collectLeaves() {
    const owl = state.owl;
    const centerY = owl.y + OWL.center;
    for (const leaf of state.leaves) {
      if (leaf.taken) continue;
      if (Math.hypot(wrapDelta(owl.x, leaf.x), centerY - leaf.y) > OWL.reach) continue;
      leaf.taken = true;
      const combo = state.combo;
      const multiplier = leafMultiplier();
      const base = leaf.kind === "zloty" ? SCORE.goldLeaf : leaf.kind === "teczowy" ? EXTRAS.rainbowPoints : SCORE.leaf;
      const count = (leaf.kind === "zloty" ? 5 : 1) * multiplier;
      const points = base * combo * multiplier;
      state.leafCount += count;
      state.leafPoints += points;
      emit("leaf", { kind: leaf.kind, x: leaf.x, y: leaf.y, count, points, combo, multiplier });
      addChain();
      if (leaf.kind === "teczowy") startFever();
    }
  }

  // Gorączka Monster (tęczowy liść): liście × 2 i deszcz liści nad platformami ścieżki przed sową.
  function startFever() {
    state.fever = FEVER.duration;
    state.fevers += 1;
    emit("fever", { duration: FEVER.duration });
  }

  function feverRain() {
    const owl = state.owl;
    for (const platform of state.platforms) {
      if (!platform.path || platform.feverRain || platform.type === "hustawka") continue;
      if (platform.y < owl.y - 1 || platform.y > owl.y + FEVER.ahead) continue;
      platform.feverRain = true;
      for (let index = 0; index < FEVER.column; index += 1) {
        state.leaves.push({
          x: platform.baseX,
          y: platform.y + 1.2 + index,
          kind: "zielony",
          taken: false,
          extra: true,
        });
      }
    }
  }

  // Złapana kózka: +50 pkt i moc.
  function catchGoat(goat) {
    const owl = state.owl;
    goat.taken = true;
    state.goatCount += 1;
    state.bonusPoints += GOATS.bonus;
    addChain();
    emit("goat", { kind: goat.kind, bonus: GOATS.bonus, x: owl.x, y: owl.y });
    if (goat.kind === "sprezynka") {
      owl.vy = Math.sqrt(2 * OWL.gravity * GOATS.springHeight);
      state.spring = true;
      emit("spring", { height: GOATS.springHeight });
    } else if (goat.kind === "turbo") {
      state.rocket = GOATS.duration.turbo;
      owl.vy = GOATS.rocketSpeed;
      emit("rocketStart", { duration: GOATS.duration.turbo });
    } else {
      state.powerups[goat.kind] = GOATS.duration[goat.kind];
      emit("powerupStart", { kind: goat.kind, duration: GOATS.duration[goat.kind] });
    }
  }

  // Moce na czas, Rakietka, Sprężynka, Gorączka; kózki, serduszka i Magnes.
  function updateExtras(dt) {
    const owl = state.owl;
    for (const [kind, left] of Object.entries(state.powerups)) {
      if (left - dt > 0) state.powerups[kind] = left - dt;
      else {
        delete state.powerups[kind];
        emit("powerupEnd", { kind });
      }
    }
    if (state.rocket > 0) {
      state.rocket = Math.max(0, state.rocket - dt);
      owl.vy = GOATS.rocketSpeed;
      if (state.rocket === 0) {
        state.invulnerable = Math.max(state.invulnerable, GOATS.afterRocket);
        emit("rocketEnd", {});
      }
    }
    if (state.spring && owl.vy <= 0) {
      state.spring = false;
      state.invulnerable = Math.max(state.invulnerable, 0.5);
    }
    if (state.fever > 0) {
      state.fever = Math.max(0, state.fever - dt);
      if (state.fever === 0) emit("feverEnd", {});
      else feverRain();
    }
    for (const goat of state.goats) {
      if (!goat.taken && catchesGoat(owl, goat, state.time, goatPose(goat, state.time, goatAt))) catchGoat(goat);
    }
    const centerY = owl.y + HAZARDS.owlCenter;
    for (const heart of state.hearts) {
      if (heart.taken || Math.hypot(wrapDelta(heart.x, owl.x), centerY - heart.y) > HAZARDS.owlRadius + 0.4) continue;
      heart.taken = true;
      if (state.lives < state.maxLives) {
        state.lives += 1;
        state.livesGained += 1;
        emit("life", { lives: state.lives, x: heart.x, y: heart.y });
      } else {
        state.bonusPoints += EXTRAS.heartBonus;
        emit("lifeBonus", { bonus: EXTRAS.heartBonus, x: heart.x, y: heart.y });
      }
    }
    if (state.powerups.magnes > 0) {
      const step = GOATS.magnetSpeed * dt;
      for (const leaf of state.leaves) {
        if (leaf.taken) continue;
        const dx = wrapDelta(leaf.x, owl.x);
        const dy = centerY - leaf.y;
        const distance = Math.hypot(dx, dy);
        if (distance > GOATS.magnetReach || distance < 1e-6) continue;
        const move = Math.min(1, step / distance);
        leaf.x = wrapX(leaf.x + dx * move);
        leaf.y += dy * move;
        leaf.pulled = true;
      }
    }
  }

  // Cel ratunku: ostatnia pewna platforma, jeśli jest w widoku; inaczej najniższa pewna w widoku; w ostateczności
  // nowy balkon nad dolną krawędzią.
  function rescueTarget() {
    const low = state.cameraBottom + RESCUE.minAbove;
    const high = state.cameraBottom + RESCUE.searchAbove;
    const usable = (item) =>
      item && !item.gone && !item.spent && PLATFORM_TYPES[item.type].solid && item.y >= low && item.y <= high;
    if (usable(state.lastSafe)) return state.lastSafe;
    let best = null;
    for (const item of state.platforms) if (usable(item) && (!best || item.y < best.y)) best = item;
    if (best) return best;
    const fallback = createPlatform("balkon", WORLD.width / 2, state.cameraBottom + RESCUE.fallbackY, { path: false });
    state.platforms.push(fallback);
    return fallback;
  }

  function startRescue() {
    const owl = state.owl;
    state.rescues += 1;
    state.rocket = 0;
    state.spring = false;
    breakChain();
    loseLife();
    if (state.lives <= 0) {
      state.lives = 0;
      finish("upadek");
      return;
    }
    const target = rescueTarget();
    state.phase = "rescue";
    state.rescue = { time: 0, fromX: owl.x, fromY: state.cameraBottom - 1, target };
    owl.pending = 0;
    owl.vx = 0;
    owl.vy = 0;
    emit("rescue", { lives: state.lives });
  }

  function updateRescue(dt) {
    const owl = state.owl;
    const rescue = state.rescue;
    rescue.time += dt;
    const k = Math.min(1, rescue.time / RESCUE.duration);
    const ease = k * k * (3 - 2 * k);
    const target = rescue.target;
    owl.x = wrapX(rescue.fromX + wrapDelta(rescue.fromX, target.x) * ease);
    owl.y = rescue.fromY + (target.y - rescue.fromY) * ease + Math.sin(Math.PI * k) * 1.5;
    if (k < 1) return;
    owl.x = target.x;
    owl.y = target.y;
    owl.vy = OWL.jumpVelocity;
    state.lastSafe = target;
    state.rescue = null;
    state.phase = "run";
    state.invulnerable = OWL.invulnerable;
    emit("rescued", { x: owl.x, y: owl.y });
  }

  function finish(reason) {
    if (state.phase === "over") return;
    state.phase = "over";
    state.endReason = reason;
    updateScore();
    emit("over", { reason });
  }

  function update(rawDt) {
    if (state.phase === "over") return;
    const dt = rawDt * (state.cozy ? COZY_TIME : 1);
    state.time += dt;
    state.invulnerable = Math.max(0, state.invulnerable - dt);
    updatePlatforms(state.platforms, state.time, dt);
    if (state.phase === "rescue") {
      updateRescue(dt);
      return;
    }
    const owl = state.owl;
    const previousY = owl.y;
    stepOwl(owl, state.keys, dt);
    updateExtras(dt);
    // Najpierw przeszkody (zdeptanie odbija sowę, zanim wyląduje na platformie pod przeszkodą).
    updateHazards(previousY, dt);
    if (state.phase === "over") return;
    landings(previousY);
    collectLeaves();
    if (owl.y > state.height) {
      state.height = owl.y;
      const zone = zoneAt(state.height);
      if (zone !== state.zone) {
        state.zone = zone;
        emit("zone", { zone, id: ZONES[zone].id, name: ZONES[zone].name });
      }
    }
    state.cameraBottom = Math.max(state.cameraBottom, owl.y - CAMERA.owlShare * WORLD.height);
    spawn();
    cleanup();
    updateScore();
    if (owl.y < state.cameraBottom - CAMERA.fallMargin) startRescue();
  }

  spawn();

  return {
    state,
    update,
    takeEvents: () => events.splice(0),
    // Przeciąganie palcem: przesunięcie w metrach świata.
    steer(meters) {
      if (state.phase === "run") steerBy(state.owl, meters);
    },
    setKeys(left, right) {
      state.keys.left = Boolean(left);
      state.keys.right = Boolean(right);
    },
    setSafe(value) {
      state.safe = Boolean(value);
    },
    end(reason = "gracz") {
      finish(reason);
    },
    // Testy i diagnostyka: kózka `kind` złapana od razu; Gorączka Monster od razu.
    giveGoat(kind) {
      if (state.phase !== "run" || !GOATS.weights[kind]) return;
      const at = { x: state.owl.x, y: state.owl.y };
      catchGoat({ kind, from: at, to: at, phase: 0, taken: false });
    },
    giveFever() {
      if (state.phase === "run") startFever();
    },
    // Testy i diagnostyka: przeszkoda `kind` w miejscu (x, y) — od razu w ruchu.
    addHazard(kind, x, y, extra = {}) {
      const item = createHazard(kind, x, y, { born: state.time, ...extra });
      state.hazards.push(item);
      return item;
    },
    // Testy i diagnostyka: sowa `meters` wyżej, na świeżej trasie, z balkonem pod stopami.
    warp(meters) {
      if (state.phase !== "run") return;
      const owl = state.owl;
      const y = owl.y + Math.max(0, meters);
      state.platforms = [];
      state.leaves = [];
      state.hazards = [];
      state.warnings = [];
      state.goats = [];
      state.hearts = [];
      const base = createPlatform("balkon", Math.min(Math.max(owl.x, 2), WORLD.width - 2), y - 0.5, { path: false });
      generator.skipTo(base.y, base.x);
      state.platforms.push(base);
      lastPath = base;
      owl.x = base.x;
      owl.y = y;
      owl.vy = 0;
      state.lastSafe = base;
      state.height = Math.max(state.height, y);
      const zone = zoneAt(state.height);
      if (zone !== state.zone) {
        state.zone = zone;
        emit("zone", { zone, id: ZONES[zone].id, name: ZONES[zone].name });
      }
      state.cameraBottom = Math.max(state.cameraBottom, y - CAMERA.owlShare * WORLD.height);
      spawn();
    },
    summary() {
      updateScore();
      return {
        score: state.score,
        height: Math.floor(state.height),
        leaves: state.leafCount,
        bestCombo: state.bestCombo,
        bestStreak: state.bestStreak,
        perfects: state.perfects,
        bounces: state.bounces,
        rescues: state.rescues,
        hits: state.hits,
        stomps: state.stomps,
        goats: state.goatCount,
        fevers: state.fevers,
        livesGained: state.livesGained,
        zone: ZONES[state.zone].id,
        difficulty: state.difficulty,
      };
    },
  };
}
