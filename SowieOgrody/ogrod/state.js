// Sowie Ogrody — stan gry (wersja 3) i migracja ze stanu wersji 2 (dawny script.js, zapisany w Firestore w E1).
// Zasada migracji: nic nie ginie — rośliny przechodzą 1:1 (nowe nazwy), ulepszenia z odpowiednikiem przechodzą,
// pozostałe są zwracane w liściach (koszt), drzewko prestiżu zwracane w nasionach (do ponownego wydania), woda
// zamienia się w Plusk-o-metr, ukończone rozdziały wynikają z odblokowanych dawniej stref.
import { CHAPTERS, GARDEN_EVENTS, SAVE_VERSION, UPGRADES } from "./config.js";

export function defaultState(now = Date.now()) {
  return {
    version: SAVE_VERSION,
    createdAt: now,
    savedAt: now,
    leaves: 0,
    runLeaves: 0,
    lifetimeLeaves: 0,
    seeds: 0,
    plants: {},
    upgrades: {},
    prestige: {},
    // Ukończone rozdziały (zostają po Wielkim Przesadzaniu): { parapet: true, … }.
    chapters: {},
    can: { charges: 0, progress: 0 },
    // Premie na czas (ms, do kiedy): watered — podlanie, boost — złota kózka, pracu — dzwoniący telefon,
    // frenzy — kozi szał.
    effects: { watered: 0, boost: 0, pracu: 0, frenzy: 0 },
    // Plusk-o-metr 0–1 (Zatoka Humbaka przy 1).
    splash: 0,
    // Gatunek zastawiony ciężarówką Amic (nie produkuje) albo null.
    blocked: null,
    // Zdarzenia (events.js): odliczanie do następnych (s gry), dzwoniący telefon { time } i ciężarówka { taps }
    // (zostają w zapisie), złota kózka { time, reward, dir } i trwająca Zatoka Humbaka (nie przetrwają wczytania).
    timers: { pracu: GARDEN_EVENTS.pracu.first, truck: GARDEN_EVENTS.truck.first, goat: GARDEN_EVENTS.goat.first },
    phone: null,
    truck: null,
    goat: null,
    bay: null,
    stats: {
      taps: 0,
      waterings: 0,
      buys: 0,
      prestiges: 0,
      seedsEarned: 0,
      bestLps: 0,
      offlineLeaves: 0,
      goats: 0,
      bays: 0,
      calls: 0,
      trucks: 0,
    },
    achievements: {},
    // Samouczek pierwszego wejścia (E7d2) ukończony albo pominięty.
    tutorialDone: false,
    // Kontrakty dnia (E7d3, daily.js): { date, baseline, claimed } albo null przed pierwszym wejściem.
    daily: null,
  };
}

// Dawne identyfikatory (v2) → nowe.
const PLANT_IDS = {
  monstera: "monstera",
  pilea: "pilea",
  fern: "paproc",
  alocasia: "alokazja",
  cactus: "kaktus",
  orchid: "storczyk",
  bonsai: "bonsai",
  mutant: "mutant",
  goldTree: "zloteDrzewko",
};
const UPGRADE_IDS = {
  softGloves: "rekawiczki",
  betterSoil: "ziemia",
  wateringCan: "konewka",
  leafBasket: "koszyk",
  balconyShelves: "polki",
  compostBox: "kompost",
  smallSprinkler: "zraszacz",
  greenhouseLamps: "lampy",
  monsterFertilizer: "nawoz",
  smartBuyerPlants: "zakupy",
};
// Ceny dawnych ulepszeń bez odpowiednika (zwrot w liściach) i dawnego drzewka prestiżu (koszt bazowy, ×1,55
// za poziom — zwrot w nasionach).
const OLD_UPGRADE_COST = {
  fastBeak: 2000,
  gardenRhythm: 20000,
  cuteLabels: 1000,
  bigSprinkler: 80000,
  whalePool: 250000,
  autoHarvestI: 3500,
  autoHarvestII: 65000,
  autoClicker: 120000,
  goatAssistant: 420000,
  deliveryManager: 9000000,
  offlineGardeners: 25000000,
};
const OLD_PRESTIGE_COST = {
  roots: 1,
  fastStart: 3,
  seedMemory: 6,
  waterMemory: 2,
  waterStart: 4,
  whaleEcho: 7,
  sleepy: 2,
  deepSleep: 4,
  nightShift: 8,
  goatWisdom: 5,
  amic: 5,
  smartRoots: 9,
};
// Dawne strefy → ukończone rozdziały (strefa odblokowana = poprzednie rozdziały ukończone).
const ZONE_CHAPTERS = {
  parapet: 0,
  balcony: 1,
  plot: 2,
  pool: 3,
  greenhouse: 4,
  center: 4,
  arboretum: 5,
};

const number = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

/** Stan v2 → v3. Zwraca { state, report } (report — co zwrócono, do okna powitalnego i testów). */
export function migrateV2(old, now = Date.now()) {
  const state = defaultState(now);
  const report = { refundLeaves: 0, refundSeeds: 0, splash: 0 };
  state.createdAt = number(old.createdAt) || now;
  state.savedAt = number(old.lastSavedAt) || now;
  state.leaves = number(old.leaves);
  state.lifetimeLeaves = number(old.lifetimeLeaves);
  state.runLeaves = number(old.currentRunLeaves ?? old.lifetimeLeaves);
  state.seeds = number(old.prestigeSeeds);
  for (const [oldId, count] of Object.entries(old.plants || {})) {
    const id = PLANT_IDS[oldId];
    if (id && number(count) > 0) state.plants[id] = Math.floor(number(count));
  }
  for (const [oldId, bought] of Object.entries(old.upgrades || {})) {
    if (!bought) continue;
    const id = UPGRADE_IDS[oldId];
    if (id && UPGRADES.some((upgrade) => upgrade.id === id)) state.upgrades[id] = 1;
    else report.refundLeaves += OLD_UPGRADE_COST[oldId] || 0;
  }
  for (const [oldId, level] of Object.entries(old.prestige || {})) {
    const base = OLD_PRESTIGE_COST[oldId] || 0;
    for (let index = 0; index < number(level); index += 1) report.refundSeeds += Math.ceil(base * 1.55 ** index);
  }
  state.leaves += report.refundLeaves;
  state.seeds += report.refundSeeds;
  // Woda: 1000 wody = pełny Plusk-o-metr (najwyżej pełny).
  report.splash = Math.min(1, number(old.water) / 1000);
  state.splash = report.splash;
  const unlocked = Array.isArray(old.unlocked) ? old.unlocked : [old.zone || "parapet"];
  const reached = Math.max(0, ...unlocked.map((zone) => ZONE_CHAPTERS[zone] ?? 0));
  for (let index = 0; index < reached; index += 1) state.chapters[CHAPTERS[index].id] = true;
  const stats = old.stats || {};
  Object.assign(state.stats, {
    taps: number(stats.clicks),
    waterings: number(stats.watering),
    buys: number(stats.buys),
    prestiges: number(stats.prestiges),
    seedsEarned: number(stats.totalPrestigeSeeds),
    bestLps: number(stats.bestLps),
    offlineLeaves: number(stats.offlineLeaves),
    goats: number(stats.golden),
    trucks: number(stats.deliveries),
  });
  state.achievements = { ...(old.achievements || {}) };
  if (state.upgrades.konewka) state.can.charges = 3;
  return { state, report };
}

/** Stan z dokumentu gry (dowolna wersja albo brak) → poprawny stan v3. */
export function loadState(raw, now = Date.now()) {
  if (!raw || typeof raw !== "object") return { state: defaultState(now), report: null };
  if (Number(raw.version) !== SAVE_VERSION) return migrateV2(raw, now);
  const base = defaultState(now);
  const state = {
    ...base,
    ...raw,
    plants: { ...(raw.plants || {}) },
    upgrades: { ...(raw.upgrades || {}) },
    prestige: { ...(raw.prestige || {}) },
    chapters: { ...(raw.chapters || {}) },
    can: { ...base.can, ...(raw.can || {}) },
    effects: { ...base.effects, ...(raw.effects || {}) },
    timers: { ...base.timers, ...(raw.timers || {}) },
    stats: { ...base.stats, ...(raw.stats || {}) },
    achievements: { ...(raw.achievements || {}) },
    goat: null,
    bay: null,
  };
  for (const key of ["leaves", "runLeaves", "lifetimeLeaves", "seeds", "splash"]) state[key] = number(state[key]);
  // Zatoka przerwana zamknięciem gry — Plusk-o-metr wraca pełny (można zagrać jeszcze raz).
  if (raw.bay) state.splash = 1;
  if (!state.truck) state.blocked = null;
  if (!state.phone) state.effects.pracu = 0;
  state.version = SAVE_VERSION;
  return { state, report: null };
}
