// Sowie Trójki — stan zapisu (Analiza 5, rozdz. 13.1): domyślny, wczytanie (normalizacja, nieznane pola zostają),
// łączenie dwóch zapisów („więcej wygrywa” — nic się nie cofa), wynik poziomu i podsumowanie do profilu. Zapis do
// chmury włącza się dopiero, gdy gra jest w rejestrze i w regułach Firestore (bramka zapisu — rozdz. 13.1a); do
// tego czasu podgląd trzyma postęp w pamięci strony.
import { SAVE_VERSION, SPECIALS } from "./config.js";

const count = (value) => Math.max(0, Math.floor(Number(value) || 0));
const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

export function defaultState() {
  return {
    version: SAVE_VERSION,
    unlocked: 1,
    levels: {},
    stats: {
      plays: 0,
      wins: 0,
      matches: 0,
      specials: Object.fromEntries(SPECIALS.map((special) => [special, 0])),
      bestCombo: 0,
      owlets: 0,
      helps: 0,
    },
    tutorial: { done: false, seen: [] },
    attempt: 0,
    savedAt: 0,
  };
}

function normalizeLevel(entry) {
  const value = isObject(entry) ? entry : {};
  return {
    ...value,
    stars: Math.min(3, count(value.stars)),
    best: count(value.best),
    wins: count(value.wins),
    tries: count(value.tries),
  };
}

/** Wczytanie zapisu (obiekt albo JSON): uzupełnione pola, liczby w granicach, nieznane pola zostają. */
export function loadState(input) {
  let raw = input;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = null;
    }
  }
  const base = defaultState();
  if (!isObject(raw)) return base;
  const levels = {};
  for (const [id, entry] of Object.entries(isObject(raw.levels) ? raw.levels : {})) {
    if (/^\d+$/.test(id)) levels[id] = normalizeLevel(entry);
  }
  const stats = isObject(raw.stats) ? raw.stats : {};
  const specials = isObject(stats.specials) ? stats.specials : {};
  const tutorial = isObject(raw.tutorial) ? raw.tutorial : {};
  return {
    ...raw,
    version: SAVE_VERSION,
    unlocked: Math.max(1, count(raw.unlocked)),
    levels,
    stats: {
      ...stats,
      plays: count(stats.plays),
      wins: count(stats.wins),
      matches: count(stats.matches),
      specials: { ...specials, ...Object.fromEntries(SPECIALS.map((special) => [special, count(specials[special])])) },
      bestCombo: count(stats.bestCombo),
      owlets: count(stats.owlets),
      helps: count(stats.helps),
    },
    tutorial: {
      ...tutorial,
      done: Boolean(tutorial.done),
      seen: [
        ...new Set((Array.isArray(tutorial.seen) ? tutorial.seen : []).filter((item) => typeof item === "string")),
      ],
    },
    attempt: count(raw.attempt),
    savedAt: count(raw.savedAt),
  };
}

/**
 * Łączenie dwóch zapisów (drugi telefon): na każdym poziomie więcej gwiazdek i lepszy wynik, wyższe `unlocked`,
 * większe liczniki, suma obejrzanych nowości — nic nie może się cofnąć (lekcja z uwagi G3).
 */
export function mergeStates(first, second) {
  const a = loadState(first);
  const b = loadState(second);
  const levels = { ...a.levels };
  for (const [id, entry] of Object.entries(b.levels)) {
    const mine = levels[id];
    levels[id] = mine
      ? {
          ...mine,
          ...entry,
          stars: Math.max(mine.stars, entry.stars),
          best: Math.max(mine.best, entry.best),
          wins: Math.max(mine.wins, entry.wins),
          tries: Math.max(mine.tries, entry.tries),
        }
      : entry;
  }
  const max = (key) => Math.max(a.stats[key], b.stats[key]);
  return {
    ...b,
    ...a,
    unlocked: Math.max(a.unlocked, b.unlocked),
    levels,
    stats: {
      ...b.stats,
      ...a.stats,
      plays: max("plays"),
      wins: max("wins"),
      matches: max("matches"),
      bestCombo: max("bestCombo"),
      owlets: max("owlets"),
      helps: max("helps"),
      specials: Object.fromEntries(
        SPECIALS.map((special) => [special, Math.max(a.stats.specials[special], b.stats.specials[special])]),
      ),
    },
    tutorial: {
      ...b.tutorial,
      ...a.tutorial,
      done: a.tutorial.done || b.tutorial.done,
      seen: [...new Set([...a.tutorial.seen, ...b.tutorial.seen])],
    },
    attempt: Math.max(a.attempt, b.attempt),
    savedAt: Math.max(a.savedAt, b.savedAt),
  };
}

/** Wynik podejścia: liczniki, gwiazdki i najlepszy wynik poziomu, odblokowanie następnego. */
export function recordResult(state, levelId, { won, stars = 0, score = 0, stats = null, totalLevels = 45 }) {
  const id = String(levelId);
  const entry = normalizeLevel(state.levels[id]);
  entry.tries += 1;
  state.stats.plays += 1;
  if (won) {
    entry.wins += 1;
    entry.stars = Math.max(entry.stars, Math.min(3, stars));
    entry.best = Math.max(entry.best, count(score));
    state.stats.wins += 1;
    state.unlocked = Math.min(totalLevels, Math.max(state.unlocked, Number(levelId) + 1));
  }
  if (stats) {
    state.stats.matches += count(stats.matches);
    state.stats.bestCombo = Math.max(state.stats.bestCombo, count(stats.bestCombo));
    state.stats.owlets += count(stats.eggs);
    state.stats.helps += count(stats.helps);
    for (const special of SPECIALS) state.stats.specials[special] += count(stats.created?.[special]);
  }
  state.levels[id] = entry;
  return state;
}

/** Podsumowanie do profilu (karta i okno „Rekordy” w menu — po włączeniu gry do menu). */
export function summaryOf(state) {
  const entries = Object.entries(state.levels);
  return {
    level: entries.filter(([, entry]) => entry.wins > 0).reduce((best, [id]) => Math.max(best, Number(id)), 0),
    stars: entries.reduce((sum, [, entry]) => sum + entry.stars, 0),
    three: entries.filter(([, entry]) => entry.stars >= 3).length,
    bestCombo: state.stats.bestCombo,
    owlets: state.stats.owlets,
  };
}
