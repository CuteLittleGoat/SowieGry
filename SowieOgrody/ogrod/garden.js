// Sowie Ogrody — silnik ogrodu (czysta logika, bez DOM; ten sam kod w grze i w symulatorze ekonomii).
// Czas: `now()` w ms (gra — Date.now, symulator — własny zegar); premie na czas trzymamy jako „do kiedy”.
import { CHAPTERS, PLANTS, PRESTIGE_TREE, UPGRADES } from "./config.js";
import {
  hasUpgrade,
  maxAffordable,
  milestoneMultiplier,
  offlineStats,
  plantById,
  plantCost,
  prestigeById,
  prestigeCost,
  prestigeLevel,
  prestigeSeeds,
  production,
  upgradeById,
  waterStats,
} from "./economy.js";
import { defaultState } from "./state.js";

/** Indeks bieżącego rozdziału: pierwszy nieukończony (po ostatnim — ostatni). */
export function chapterIndex(state) {
  const index = CHAPTERS.findIndex((chapter) => !state.chapters?.[chapter.id]);
  return index < 0 ? CHAPTERS.length - 1 : index;
}

/** Czy rozdział `id` jest dostępny (bieżący albo wcześniejszy). */
export function chapterOpen(state, id) {
  return CHAPTERS.findIndex((chapter) => chapter.id === id) <= chapterIndex(state);
}

/** Postęp celu: { value, target, done }. */
export function goalProgress(state, goal, lps = production(state).base) {
  const value =
    goal.kind === "plant"
      ? state.plants?.[goal.plant] || 0
      : goal.kind === "upgrade"
        ? Number(hasUpgrade(state, goal.upgrade))
        : goal.kind === "taps"
          ? state.stats.taps
          : goal.kind === "water"
            ? state.stats.waterings
            : goal.kind === "lps"
              ? lps
              : goal.kind === "runLeaves"
                ? state.runLeaves
                : goal.kind === "prestige"
                  ? state.stats.prestiges
                  : 0;
  return { value, target: goal.target, done: value >= goal.target };
}

/**
 * createGarden({ state, now }) → silnik: `update(dt)`, `tap()`, `buyPlant(id, ile | "max")`, `buyUpgrade(id)`,
 * `water()`, `prestige()`, `buyPrestige(id)`, `applyOffline(s)`, `goals()`, `bestPlant()`, `takeEvents()`.
 * Zdarzenia: tap { gain }, plant { id, amount, cost, owned, stage? }, milestone { id, owned }, upgrade { id },
 * water { until }, chapter { id, next }, prestige { seeds }, prestigeNode { id, level }, offline { seconds, leaves }.
 */
export function createGarden({ state = defaultState(), now = () => Date.now() } = {}) {
  const events = [];
  const emit = (type, data = {}) => events.push({ type, ...data });
  let autobuyTimer = 0;

  function addLeaves(amount) {
    state.leaves += amount;
    state.runLeaves += amount;
    state.lifetimeLeaves += amount;
  }

  // Rozdziały: kolejno, dopóki cele bieżącego są wykonane.
  function checkChapters() {
    const lps = production(state, now()).base;
    for (;;) {
      const index = chapterIndex(state);
      const chapter = CHAPTERS[index];
      if (state.chapters[chapter.id]) return;
      if (!chapter.goals.every((goal) => goalProgress(state, goal, lps).done)) return;
      state.chapters[chapter.id] = true;
      emit("chapter", { id: chapter.id, next: CHAPTERS[index + 1]?.id || null });
    }
  }

  // Najopłacalniejsza roślina (przyrost produkcji / cena) wśród dostępnych.
  function bestPlant() {
    let best = null;
    const prod = production(state, now());
    for (const plant of PLANTS) {
      if (!chapterOpen(state, plant.chapter)) continue;
      const owned = state.plants[plant.id] || 0;
      const cost = plantCost(plant, owned, 1);
      const per = owned ? prod.perPlant[plant.id] / prod.boost / owned / milestoneMultiplier(owned) : null;
      const unit = per ?? plant.prod * prod.global;
      const gain = unit * milestoneMultiplier(owned + 1) * (owned + 1) - unit * milestoneMultiplier(owned) * owned;
      const value = gain / cost;
      if (!best || value > best.value) best = { plant, cost, value };
    }
    return best;
  }

  function buyPlant(id, amount = 1) {
    const plant = plantById(id);
    if (!plant || !chapterOpen(state, plant.chapter)) return false;
    const owned = state.plants[id] || 0;
    const count = amount === "max" ? maxAffordable(plant, owned, state.leaves).amount : Math.floor(amount);
    if (count <= 0) return false;
    const cost = plantCost(plant, owned, count);
    if (cost > state.leaves) return false;
    state.leaves -= cost;
    state.plants[id] = owned + count;
    state.stats.buys += count;
    emit("plant", { id, amount: count, cost, owned: state.plants[id] });
    const passed = [10, 25, 50, 100].filter((step) => owned < step && state.plants[id] >= step);
    for (const step of passed) emit("milestone", { id, owned: step });
    checkChapters();
    return true;
  }

  function buyUpgrade(id) {
    const upgrade = upgradeById(id);
    if (!upgrade || hasUpgrade(state, id) || !chapterOpen(state, upgrade.chapter)) return false;
    if (upgrade.cost > state.leaves) return false;
    state.leaves -= upgrade.cost;
    state.upgrades[id] = 1;
    if (id === "konewka") state.can.charges = waterStats(state).charges;
    emit("upgrade", { id });
    checkChapters();
    return true;
  }

  function water() {
    if (!hasUpgrade(state, "konewka") || state.can.charges < 1) return false;
    const stats = waterStats(state);
    state.can.charges -= 1;
    const start = Math.max(now(), state.effects.watered || 0);
    state.effects.watered = start + stats.duration * 1000;
    state.stats.waterings += 1;
    emit("water", { until: state.effects.watered });
    checkChapters();
    return true;
  }

  function tap() {
    const gain = production(state, now()).tap;
    addLeaves(gain);
    state.stats.taps += 1;
    emit("tap", { gain });
    checkChapters();
    return gain;
  }

  function prestige() {
    const seeds = prestigeSeeds(state);
    if (seeds <= 0) return 0;
    const keep = {
      seeds: state.seeds + seeds,
      prestige: { ...state.prestige },
      chapters: { ...state.chapters },
      lifetimeLeaves: state.lifetimeLeaves,
      stats: { ...state.stats, prestiges: state.stats.prestiges + 1, seedsEarned: state.stats.seedsEarned + seeds },
      achievements: { ...state.achievements },
      createdAt: state.createdAt,
      splash: state.splash,
    };
    const fresh = defaultState(now());
    for (const key of Object.keys(state)) delete state[key];
    Object.assign(state, fresh, keep);
    const start = prestigeLevel(state, "szybkiStart") * 25;
    if (start) state.plants.monstera = start;
    emit("prestige", { seeds });
    checkChapters();
    return seeds;
  }

  function buyPrestige(id) {
    const node = prestigeById(id);
    if (!node || prestigeLevel(state, id) >= node.max) return false;
    if (node.req && prestigeLevel(state, node.req) <= 0) return false;
    const cost = prestigeCost(state, node);
    if (cost > state.seeds) return false;
    state.seeds -= cost;
    state.prestige[id] = prestigeLevel(state, id) + 1;
    if (id === "studnia" && hasUpgrade(state, "konewka")) state.can.charges += 1;
    emit("prestigeNode", { id, level: state.prestige[id] });
    return true;
  }

  /** Postęp offline za `seconds` s nieobecności (bez premii na czas): liście = produkcja × czas × skuteczność. */
  function applyOffline(seconds) {
    const stats = offlineStats(state);
    const used = Math.min(Math.max(0, seconds), stats.cap);
    if (used < 60) return { seconds: 0, leaves: 0 };
    const leaves = production(state, 0).base * used * stats.efficiency;
    addLeaves(leaves);
    state.stats.offlineLeaves += leaves;
    // Konewka ładuje się także w czasie nieobecności.
    if (hasUpgrade(state, "konewka")) {
      const water = waterStats(state);
      state.can.charges = Math.min(water.charges, state.can.charges + Math.floor(used / water.regen));
    }
    emit("offline", { seconds: used, leaves });
    checkChapters();
    return { seconds: used, leaves };
  }

  function update(dt) {
    const prod = production(state, now());
    addLeaves(prod.lps * dt);
    state.stats.bestLps = Math.max(state.stats.bestLps, prod.lps);
    if (hasUpgrade(state, "konewka")) {
      const water = waterStats(state);
      if (state.can.charges < water.charges) {
        state.can.progress += dt / water.regen;
        while (state.can.progress >= 1 && state.can.charges < water.charges) {
          state.can.progress -= 1;
          state.can.charges += 1;
        }
      } else state.can.progress = 0;
    }
    if (hasUpgrade(state, "zakupy")) {
      autobuyTimer += dt;
      if (autobuyTimer >= 0.5) {
        autobuyTimer = 0;
        const best = bestPlant();
        if (best && best.cost <= state.leaves) buyPlant(best.plant.id, 1);
      }
    }
    checkChapters();
  }

  return {
    state,
    update,
    tap,
    buyPlant,
    buyUpgrade,
    water,
    prestige,
    buyPrestige,
    applyOffline,
    bestPlant,
    goals: () => {
      const chapter = CHAPTERS[chapterIndex(state)];
      const lps = production(state, now()).base;
      return {
        chapter,
        done: Boolean(state.chapters[chapter.id]),
        goals: chapter.goals.map((goal) => ({ ...goal, ...goalProgress(state, goal, lps) })),
      };
    },
    upgrades: () => UPGRADES.filter((upgrade) => chapterOpen(state, upgrade.chapter)),
    prestigeTree: () => PRESTIGE_TREE,
    takeEvents: () => events.splice(0, events.length),
  };
}
