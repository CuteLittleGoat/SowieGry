// Sowie Ogrody — ekonomia (czysta logika, bez DOM): ceny roślin, kamienie milowe, produkcja liści z ulepszeniami,
// prestiżem i premiami na czas, siła stuknięcia, nasiona Wielkiego Przesadzania, formatowanie liczb.
import {
  MILESTONE_BOOST,
  MILESTONES,
  OFFLINE,
  PLANTS,
  PRESTIGE,
  PRESTIGE_TREE,
  TAP,
  UPGRADES,
  WATER,
} from "./config.js";

export const plantById = (id) => PLANTS.find((plant) => plant.id === id) || null;
export const upgradeById = (id) => UPGRADES.find((upgrade) => upgrade.id === id) || null;
export const prestigeById = (id) => PRESTIGE_TREE.find((node) => node.id === id) || null;

/** Cena `amount` kolejnych sztuk rośliny przy `owned` posiadanych (suma ciągu geometrycznego). */
export function plantCost(plant, owned, amount = 1) {
  if (amount <= 0) return 0;
  const first = plant.cost * plant.growth ** owned;
  return Math.ceil((first * (plant.growth ** amount - 1)) / (plant.growth - 1));
}

/** Ile sztuk rośliny da się kupić za `leaves` (najwyżej `limit`) i za ile. */
export function maxAffordable(plant, owned, leaves, limit = 1000) {
  const first = plant.cost * plant.growth ** owned;
  if (leaves < first) return { amount: 0, cost: 0 };
  let amount = Math.floor(Math.log((leaves * (plant.growth - 1)) / first + 1) / Math.log(plant.growth));
  amount = Math.max(0, Math.min(limit, amount));
  while (amount > 0 && plantCost(plant, owned, amount) > leaves) amount -= 1;
  return { amount, cost: plantCost(plant, owned, amount) };
}

/** Mnożnik kamieni milowych gatunku (MILESTONE_BOOST: ×2 od 25 sztuk, kolejne ×2 od 100). */
export function milestoneMultiplier(owned) {
  return Object.entries(MILESTONE_BOOST).reduce(
    (value, [step, boost]) => (owned >= Number(step) ? value * boost : value),
    1,
  );
}

/** Etap wyglądu gatunku w ogrodzie: 0 (brak), 1 (pierwsza sztuka), +1 za każdy kamień milowy. */
export function plantStage(owned) {
  if (owned <= 0) return 0;
  return 1 + MILESTONES.filter((step) => owned >= step).length;
}

export const prestigeLevel = (state, id) => Number(state.prestige?.[id] || 0);
export const hasUpgrade = (state, id) => Boolean(state.upgrades?.[id]);

/** Koszt następnego poziomu węzła prestiżu. */
export function prestigeCost(state, node) {
  return Math.ceil(node.cost * 1.6 ** prestigeLevel(state, node.id));
}

/** Konewka: liczba ładunków, odnowienie (s), mnożnik i czas podlania (s) — z ulepszeniami i prestiżem. */
export function waterStats(state) {
  let { charges, regen, multiplier, duration } = WATER;
  for (const upgrade of UPGRADES) {
    if (!hasUpgrade(state, upgrade.id) || !upgrade.effect.water) continue;
    multiplier = upgrade.effect.water.multiplier ?? multiplier;
    regen = upgrade.effect.water.regen ?? regen;
  }
  charges += prestigeLevel(state, "studnia");
  duration += prestigeLevel(state, "pamiecPlusku") * 15;
  return { charges, regen, multiplier, duration };
}

/** Postęp offline: skuteczność i limit (s) z prestiżem. */
export function offlineStats(state) {
  return {
    efficiency: OFFLINE.efficiency + prestigeLevel(state, "senni") * 0.1,
    cap: OFFLINE.cap + prestigeLevel(state, "glebokiSen") * 2 * 3600,
  };
}

/**
 * Produkcja w chwili `now` (ms): { lps, base (bez premii na czas), perPlant, global, tap, boost (mnożnik premii),
 * blocked (gatunek zastawiony ciężarówką) }. Premie na czas (`state.effects`): `watered` (do kiedy, mnożnik
 * konewki), `boost` (złota kózka: ×3), `pracu` (dzwoniący telefon: ×0,7); `state.blocked` — gatunek pod ciężarówką
 * Amic nie produkuje.
 */
export function production(state, now = 0) {
  let global = 1 + prestigeLevel(state, "korzenie") * 0.25;
  let tap = TAP.base;
  let tapLps = TAP.lpsShare;
  const chapterMult = {};
  const plantMult = {};
  for (const upgrade of UPGRADES) {
    if (!hasUpgrade(state, upgrade.id)) continue;
    const effect = upgrade.effect;
    if (effect.global) global *= effect.global;
    if (effect.tap) tap *= effect.tap;
    if (effect.tapLps) tapLps += effect.tapLps;
    for (const [id, value] of Object.entries(effect.chapter || {})) chapterMult[id] = (chapterMult[id] || 1) * value;
    for (const [id, value] of Object.entries(effect.plant || {})) plantMult[id] = (plantMult[id] || 1) * value;
  }
  const effects = state.effects || {};
  let boost = 1;
  if ((effects.watered || 0) > now) boost *= waterStats(state).multiplier;
  if ((effects.boost || 0) > now) boost *= 3;
  if ((effects.pracu || 0) > now) boost *= 0.7;
  const perPlant = {};
  let base = 0;
  for (const plant of PLANTS) {
    const owned = state.plants?.[plant.id] || 0;
    const value =
      state.blocked === plant.id
        ? 0
        : owned *
          plant.prod *
          global *
          (chapterMult[plant.chapter] || 1) *
          (plantMult[plant.id] || 1) *
          milestoneMultiplier(owned);
    perPlant[plant.id] = value * boost;
    base += value;
  }
  const lps = base * boost;
  return { lps, base, perPlant, global, boost, tap: tap + lps * tapLps };
}

/** Nasiona za Wielkie Przesadzanie teraz (0, gdy jeszcze niedostępne). */
export function prestigeSeeds(state) {
  if (!state.chapters?.[PRESTIGE.after] || (state.runLeaves || 0) < PRESTIGE.minRunLeaves) return 0;
  const base = Math.sqrt(Math.max(0, state.runLeaves || 0) / PRESTIGE.divisor);
  return Math.max(PRESTIGE.min, Math.floor(base * (1 + prestigeLevel(state, "pamiecNasion") * 0.1)));
}

const SUFFIXES = ["", " tys.", " mln", " mld", " bln", " bld", " tryl.", " tryld"];

/** Liczba po polsku: do 1000 — całe (poniżej 10 z jednym miejscem po przecinku), wyżej z przyrostkiem. */
export function formatNumber(value) {
  if (!Number.isFinite(value)) return "0";
  const sign = value < 0 ? "−" : "";
  let amount = Math.abs(value);
  if (amount < 1000) {
    const text = amount < 10 && amount % 1 ? amount.toFixed(1) : String(Math.floor(amount));
    return sign + text.replace(".", ",");
  }
  let index = 0;
  while (amount >= 1000 && index < SUFFIXES.length - 1) {
    amount /= 1000;
    index += 1;
  }
  const digits = amount >= 100 ? 0 : amount >= 10 ? 1 : 2;
  const text = amount
    .toFixed(digits)
    .replace(/\.?0+$/, "")
    .replace(".", ",");
  return sign + text + SUFFIXES[index];
}

/** Czas po polsku: „2 h 05 min”, „4 min 10 s”, „35 s”. */
export function formatTime(seconds) {
  const value = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  if (hours) return `${hours} h ${String(minutes).padStart(2, "0")} min`;
  if (minutes) return `${minutes} min ${value % 60} s`;
  return `${value} s`;
}
