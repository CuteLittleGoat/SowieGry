// Sowia Akademia (Analiza 2, rozdz. 4.2; Analiza 3, E9b) — jeden system postępu dla wszystkich gier: zadania dnia
// (3, z różnych gier) i zadanie tygodnia → XP i piórka, trwałe osiągnięcia, poziom gracza. Metryki pochodzą wprost
// ze zdarzeń SowieProgress (`academyCalls`), a stan jest w profilu (`profil.academy`) przez SowieCloud.
// Zastępuje klasyczny shared/sowie-academy.js (wersja 2 zapisu — dane przechodzą bez strat) i „most” z okresu
// przejściowego E4–E8. W przeglądarce instaluje `window.SowieAcademy` (Galeria i zakładka „Sowa” czytają migawkę).
import { EVENTS } from "./progress-events.js";

export const VERSION = 3;

// Zadania dnia: game — gra (różne gry w jednym dniu) albo "any" (zdarzenia z dowolnej gry zręcznościowej);
// type "max" — najlepszy wynik dnia, "delta" — przyrost metryki od początku dnia.
export const TASK_POOL = Object.freeze([
  {
    id: "runner-distance",
    game: "runner",
    metric: "runnerDistance",
    type: "max",
    target: 500,
    label: "Przebiegnij 500 m w Sowiej Ucieczce",
  },
  {
    id: "runner-score",
    game: "runner",
    metric: "runnerScore",
    type: "max",
    target: 1200,
    label: "Zdobądź 1200 pkt w Sowiej Ucieczce",
  },
  {
    id: "jumper-height",
    game: "jumper",
    metric: "jumperHeight",
    type: "max",
    target: 120,
    label: "Wznieś się na 120 m w Sowie w Chmurach",
  },
  {
    id: "jumper-streak",
    game: "jumper",
    metric: "jumperStreak",
    type: "max",
    target: 5,
    label: "Wyląduj idealnie 5 razy z rzędu w Sowie w Chmurach",
  },
  {
    id: "sowa3-score",
    game: "sowa3",
    metric: "sowa3Score",
    type: "max",
    target: 900,
    label: "Zdobądź 900 pkt w Sowich Torach",
  },
  {
    id: "sowa3-combo",
    game: "sowa3",
    metric: "sowa3Combo",
    type: "max",
    target: 6,
    label: "Osiągnij combo 6 w Sowich Torach",
  },
  {
    id: "ogrody-clicks",
    game: "ogrody",
    metric: "ogrodyClicks",
    type: "delta",
    target: 30,
    label: "Zbierz liście ręcznie 30 razy w Sowich Ogrodach",
  },
  {
    id: "ogrody-buys",
    game: "ogrody",
    metric: "ogrodyBuys",
    type: "delta",
    target: 8,
    label: "Kup 8 roślin lub ulepszeń w Sowich Ogrodach",
  },
  {
    id: "ogrody-watering",
    game: "ogrody",
    metric: "ogrodyWatering",
    type: "delta",
    target: 3,
    label: "Podlej ogród 3 razy",
  },
  {
    id: "szklarnia-rooms",
    game: "szklarnia",
    metric: "szklarniaRooms",
    type: "max",
    target: 4,
    label: "Odnów 4 pomieszczenia w Łącz i Hoduj",
  },
  {
    id: "szklarnia-goats",
    game: "szklarnia",
    metric: "szklarniaGoats",
    type: "delta",
    target: 2,
    label: "Użyj 2 kózek w Łącz i Hoduj",
  },
  {
    id: "szklarnia-hybrid",
    game: "szklarnia",
    metric: "szklarniaHybrids",
    type: "max",
    target: 1,
    label: "Wyhoduj hybrydę w Łącz i Hoduj",
  },
  {
    id: "any-leaves",
    game: "any",
    metric: "leaves",
    type: "delta",
    target: 150,
    label: "Zbierz 150 liści w grach zręcznościowych",
  },
  { id: "any-goats", game: "any", metric: "goatsCaught", type: "delta", target: 3, label: "Złap 3 skaczące kózki" },
  { id: "any-near", game: "any", metric: "nearMisses", type: "delta", target: 5, label: "Zrób 5 uników „O włos!”" },
  {
    id: "any-whale",
    game: "any",
    metric: "whaleRides",
    type: "delta",
    target: 1,
    label: "Wybierz się na przygodę z humbakiem",
  },
]);

export const DAILY_REWARD = Object.freeze({ xp: 50, feathers: 5 });
export const WEEKLY = Object.freeze({ target: 3, xp: 140, feathers: 15, label: "Zagraj w 3 różne gry w tym tygodniu" });

// Osiągnięcia (trwałe): goals — lista [źródło, próg] jak w Galerii (źródło: metryka, "level" albo "feathers").
export const ACHIEVEMENTS = Object.freeze([
  {
    id: "pierwsze-kroki",
    icon: "🗺️",
    label: "Pierwsze kroki",
    text: "Zagraj w każdą z pięciu gier.",
    goals: [
      ["runnerVisits", 1],
      ["jumperVisits", 1],
      ["sowa3Visits", 1],
      ["ogrodyVisits", 1],
      ["szklarniaVisits", 1],
    ],
    xp: 100,
    feathers: 10,
  },
  {
    id: "zbieraczka",
    icon: "🍃",
    label: "Zbieraczka liści",
    text: "Zbierz 1000 liści w grach zręcznościowych.",
    goals: [["leaves", 1000]],
    xp: 80,
    feathers: 8,
  },
  {
    id: "kozia-przyjaciolka",
    icon: "🐐",
    label: "Kozia przyjaciółka",
    text: "Złap 25 skaczących kózek.",
    goals: [["goatsCaught", 25]],
    xp: 80,
    feathers: 8,
  },
  {
    id: "mistrzyni-unikow",
    icon: "💨",
    label: "Mistrzyni uników",
    text: "Zrób 50 uników „O włos!”.",
    goals: [["nearMisses", 50]],
    xp: 80,
    feathers: 8,
  },
  {
    id: "przyjaciolka-humbaka",
    icon: "🐋",
    label: "Przyjaciółka humbaka",
    text: "Przeżyj 10 przygód z humbakiem.",
    goals: [["whaleRides", 10]],
    xp: 80,
    feathers: 8,
  },
  {
    id: "maratonka",
    icon: "🏃",
    label: "Maratonka",
    text: "Przebiegnij 3000 m w Sowiej Ucieczce.",
    goals: [["runnerDistance", 3000]],
    xp: 100,
    feathers: 10,
  },
  {
    id: "mistrzyni-torow",
    icon: "🛣️",
    label: "Mistrzyni Torów",
    text: "Ukończ kampanię Sowich Torów.",
    goals: [["sowa3Finishes", 1]],
    xp: 100,
    feathers: 10,
  },
  {
    id: "podniebna",
    icon: "🪶",
    label: "Podniebna",
    text: "Wznieś się na 1000 m w Sowie w Chmurach.",
    goals: [["jumperHeight", 1000]],
    xp: 100,
    feathers: 10,
  },
  {
    id: "ogrodniczka",
    icon: "🌿",
    label: "Wielka ogrodniczka",
    text: "Wykonaj Wielkie Przesadzanie w Sowich Ogrodach.",
    goals: [["ogrodyPrestiges", 1]],
    xp: 100,
    feathers: 10,
  },
  {
    id: "architektka",
    icon: "🏡",
    label: "Architektka szklarni",
    text: "Odnów wszystkie 10 pomieszczeń w Łącz i Hoduj.",
    goals: [["szklarniaRooms", 10]],
    xp: 120,
    feathers: 12,
  },
  {
    id: "hodowczyni",
    icon: "🧬",
    label: "Hodowczyni hybryd",
    text: "Wyhoduj 5 hybryd w Łącz i Hoduj.",
    goals: [["szklarniaHybrids", 5]],
    xp: 80,
    feathers: 8,
  },
  {
    id: "wytrwala",
    icon: "🎮",
    label: "Wytrwała sówka",
    text: "Rozegraj 50 biegów i lotów.",
    goals: [["runs", 50]],
    xp: 80,
    feathers: 8,
  },
  {
    id: "prymuska",
    icon: "🎓",
    label: "Prymuska Akademii",
    text: "Osiągnij 10. poziom Akademii.",
    goals: [["level", 10]],
    xp: 150,
    feathers: 15,
  },
]);

// Gry zręcznościowe (liczniki całego biegu); inne źródła zdarzeń, np. Laboratorium, nie zmieniają Akademii.
export const ARCADE_GAMES = Object.freeze(["runner", "jumper", "sowa3"]);

const number = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);

/** Dzień (UTC) zadań: „2026-10-05”. */
export function dayKey(ms = Date.now()) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Tydzień (poniedziałek UTC): „2026-10-05”. */
export function weekKey(ms = Date.now()) {
  const date = new Date(ms);
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() - day + 1);
  return copy.toISOString().slice(0, 10);
}

function hash(value) {
  let result = 2166136261;
  for (const character of String(value)) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

/** Poziom z XP: 100 XP na 2. poziom, każdy kolejny o 35 XP więcej. → { level, current, needed } */
export function levelInfo(xp = 0) {
  let level = 1;
  let remaining = Math.max(0, Number(xp) || 0);
  let needed = 100;
  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = 100 + (level - 1) * 35;
  }
  return { level, current: remaining, needed };
}

export function defaultAcademy(now = Date.now()) {
  return {
    version: VERSION,
    xp: 0,
    feathers: 0,
    metrics: {},
    daily: null,
    weekly: null,
    awards: {},
    achievements: {},
    updatedAt: now,
  };
}

/** Stan z profilu (wersja 2 dawnej Akademii albo 3) → kopia robocza w wersji 3. */
export function normalizeAcademy(raw, now = Date.now()) {
  if (!raw || typeof raw !== "object") return defaultAcademy(now);
  return JSON.parse(
    JSON.stringify({
      ...defaultAcademy(now),
      ...raw,
      version: VERSION,
      xp: Math.max(0, Number(raw.xp) || 0),
      feathers: Math.max(0, Number(raw.feathers) || 0),
      metrics: { ...(raw.metrics || {}) },
      awards: { ...(raw.awards || {}) },
      achievements: { ...(raw.achievements || {}) },
    }),
  );
}

/** Zadania dnia: 3 z puli, deterministycznie z daty, z różnych gier (grupa "any" liczy się jak jedna gra). */
export function createDaily(state, now = Date.now()) {
  const day = dayKey(now);
  const pool = [...TASK_POOL];
  const selected = [];
  const games = new Set();
  let cursor = hash(day);
  while (selected.length < 3 && pool.length) {
    cursor = Math.imul(cursor ^ (cursor >>> 15), 2246822519) >>> 0;
    const candidate = pool.splice(cursor % pool.length, 1)[0];
    if (games.has(candidate.game) && pool.some((entry) => !games.has(entry.game))) continue;
    games.add(candidate.game);
    selected.push({
      ...candidate,
      key: `${day}:${candidate.id}`,
      baseline: candidate.type === "delta" ? Number(state.metrics[candidate.metric] || 0) : 0,
      complete: false,
      rewarded: false,
    });
  }
  return { day, metrics: {}, missions: selected };
}

export function createWeekly(now = Date.now()) {
  return { week: weekKey(now), games: [], target: WEEKLY.target, complete: false, rewarded: false };
}

/** Wartość źródła celu (osiągnięcia, zdjęcia Galerii): poziom, piórka albo metryka. */
export function goalValue(state, source) {
  if (source === "level") return levelInfo(state.xp).level;
  if (source === "feathers") return Number(state.feathers || 0);
  return Number(state.metrics?.[source] || 0);
}

/** Postęp osiągnięcia: { share 0–1, goals: [{ source, target, value, done }], done }. */
export function achievementProgress(achievement, state) {
  const goals = achievement.goals.map(([source, target]) => {
    const value = goalValue(state, source);
    return { source, target, value: Math.min(value, target), done: value >= target };
  });
  const share = goals.reduce((sum, goal) => sum + goal.value / goal.target, 0) / goals.length;
  return { share, goals, done: goals.every((goal) => goal.done) };
}

/**
 * Zdarzenie SowieProgress → lista wywołań record(gra, metryka, wartość, tryb) (czysta funkcja). Koniec biegu:
 * metryki gry (wynik, dystans / wysokość, combo, seria, ukończenie) i liczniki z całego biegu (`detail.run`: liście,
 * kózki, uniki, humbak, gorączka) do zadań „z dowolnej gry” i osiągnięć; gry idle — postęp; wizyta — licznik wizyt.
 */
export function academyCalls(type, detail = {}) {
  const calls = [];
  const push = (gameId, metric, value, mode = "max") => {
    const numeric = number(value);
    if (numeric !== null) calls.push([gameId, metric, numeric, mode]);
  };
  const game = detail.gameId;
  if (type === EVENTS.RUN_ENDED) {
    if (game === "runner") {
      push(game, "runnerScore", detail.score);
      push(game, "runnerDistance", detail.distance);
      push(game, "runnerLeafChain", detail.bestChain);
    } else if (game === "jumper") {
      push(game, "jumperScore", detail.score);
      push(game, "jumperHeight", detail.height);
      push(game, "jumperStreak", detail.bestStreak);
    } else if (game === "sowa3") {
      push(game, "sowa3Score", detail.score);
      push(game, "sowa3Combo", detail.bestCombo);
      if (detail.finished) push(game, "sowa3Finishes", 1, "add");
    }
    if (ARCADE_GAMES.includes(game) && detail.run) {
      const run = detail.run;
      push(game, "runs", 1, "add");
      if (run.leaves > 0) push(game, "leaves", run.leaves, "add");
      if (run.goats > 0) push(game, "goatsCaught", run.goats, "add");
      if (run.nearMisses > 0) push(game, "nearMisses", run.nearMisses, "add");
      if (run.whales > 0) push(game, "whaleRides", run.whales, "add");
      if (run.fevers > 0) push(game, "fevers", run.fevers, "add");
    }
  } else if (type === EVENTS.IDLE) {
    if (game === "ogrody") {
      push(game, "ogrodyLeaves", detail.lifetimeLeaves);
      push(game, "ogrodyClicks", detail.clicks, "set");
      push(game, "ogrodyBuys", detail.buys, "set");
      push(game, "ogrodyWatering", detail.watering, "set");
      push(game, "ogrodyPrestiges", detail.prestiges, "set");
      push(game, "ogrodyPlants", detail.plants);
    } else if (game === "szklarnia") {
      push(game, "szklarniaRooms", detail.rooms);
      push(game, "szklarniaPlants", detail.plants);
      push(game, "szklarniaGoats", detail.goats, "set");
      push(game, "szklarniaHybrids", detail.hybrids);
    }
  } else if (type === EVENTS.VISIT && game) {
    push(game, `${game}Visits`, 1, "add");
  }
  return calls;
}

/** Zadania z migawki (ekran wyników, zakładka „Sowa”): 3 zadania dnia z postępem i zadanie tygodnia. */
export function taskProgress(snapshot) {
  if (!snapshot?.daily) return [];
  const metrics = snapshot.metrics || {};
  const daily = (snapshot.daily.missions || []).map((mission) => {
    const progress =
      mission.type === "max"
        ? Number(snapshot.daily.metrics?.[mission.metric] || 0)
        : Number(metrics[mission.metric] || 0) - Number(mission.baseline || 0);
    return {
      id: mission.id,
      label: mission.label,
      progress: Math.max(0, Math.min(mission.target, progress)),
      target: mission.target,
      done: Boolean(mission.complete) || progress >= mission.target,
    };
  });
  const weekly = snapshot.weekly
    ? [
        {
          id: "weekly",
          label: WEEKLY.label,
          progress: Math.min(snapshot.weekly.target, snapshot.weekly.games?.length || 0),
          target: snapshot.weekly.target,
          done: Boolean(snapshot.weekly.complete),
        },
      ]
    : [];
  return [...daily, ...weekly];
}

/**
 * Akademia na danych w pamięci: createAcademyState({ state, now, notify }) → { record, award, evaluate, snapshot,
 * state() }. Czysta logika (bez chmury) — `notify(tytuł, opis, nagroda)` dla komunikatów. Zwracane `changed`
 * mówi, czy trzeba zapisać stan.
 */
export function createAcademyState({ state = defaultAcademy(), now = () => Date.now(), notify = () => {} } = {}) {
  let academy = normalizeAcademy(state, now());

  function ensurePeriods() {
    let changed = false;
    if (!academy.daily || academy.daily.day !== dayKey(now())) {
      academy.daily = createDaily(academy, now());
      changed = true;
    } else if (!academy.daily.metrics || typeof academy.daily.metrics !== "object") {
      academy.daily.metrics = {};
      changed = true;
    }
    if (!academy.weekly || academy.weekly.week !== weekKey(now())) {
      academy.weekly = createWeekly(now());
      changed = true;
    }
    return changed;
  }

  function missionProgress(mission) {
    if (mission.type === "max") return Math.max(0, Number(academy.daily?.metrics?.[mission.metric] || 0));
    return Math.max(0, Number(academy.metrics[mission.metric] || 0) - Number(mission.baseline || 0));
  }

  function grant(id, xp, feathers, title, detail = "Cel ukończony!") {
    if (academy.awards[id]) return false;
    academy.awards[id] = now();
    academy.xp += Math.max(0, Number(xp) || 0);
    academy.feathers += Math.max(0, Number(feathers) || 0);
    notify(title, detail, `+${xp} XP · +${feathers} piórek`);
    return true;
  }

  function evaluate() {
    let changed = ensurePeriods();
    for (const mission of academy.daily.missions) {
      const complete = missionProgress(mission) >= mission.target;
      if (complete !== mission.complete) {
        mission.complete = complete;
        changed = true;
      }
      if (complete && !mission.rewarded) {
        mission.rewarded = true;
        changed =
          grant(`daily:${mission.key}`, DAILY_REWARD.xp, DAILY_REWARD.feathers, "Zadanie dnia", mission.label) ||
          changed;
      }
    }
    const weeklyComplete = academy.weekly.games.length >= academy.weekly.target;
    if (weeklyComplete !== academy.weekly.complete) {
      academy.weekly.complete = weeklyComplete;
      changed = true;
    }
    if (weeklyComplete && !academy.weekly.rewarded) {
      academy.weekly.rewarded = true;
      changed =
        grant(`weekly:${academy.weekly.week}`, WEEKLY.xp, WEEKLY.feathers, "Zadanie tygodnia", WEEKLY.label) || changed;
    }
    // Osiągnięcia (po kolei, bo nagroda XP może od razu spełnić osiągnięcie za poziom).
    for (let pass = 0; pass < 2; pass += 1) {
      for (const achievement of ACHIEVEMENTS) {
        if (academy.achievements[achievement.id]) continue;
        if (!achievementProgress(achievement, academy).done) continue;
        academy.achievements[achievement.id] = now();
        grant(
          `achievement:${achievement.id}`,
          achievement.xp,
          achievement.feathers,
          `Osiągnięcie: ${achievement.label}`,
          achievement.text,
        );
        changed = true;
      }
    }
    return changed;
  }

  function apply(target, metric, value, mode) {
    const previous = Number(target[metric] || 0);
    const next = mode === "add" ? previous + value : mode === "set" ? value : Math.max(previous, value);
    if (next === previous) return false;
    target[metric] = next;
    return true;
  }

  return {
    record(gameId, metric, value = 1, mode = "max") {
      let changed = ensurePeriods();
      const numeric = Number(value) || 0;
      changed = apply(academy.metrics, metric, numeric, mode) || changed;
      changed = apply(academy.daily.metrics, metric, numeric, mode) || changed;
      if (gameId && !academy.weekly.games.includes(gameId)) {
        academy.weekly.games.push(gameId);
        changed = true;
      }
      return evaluate() || changed;
    },
    award(id, xp = 25, feathers = 3, title = "Nagroda dodatkowa") {
      const changed = ensurePeriods();
      return grant(id, xp, feathers, title) || changed;
    },
    // Wydanie piórek (Sowi Butik): false, gdy za mało.
    spend(feathers) {
      const cost = Math.max(0, Math.floor(Number(feathers) || 0));
      if (academy.feathers < cost) return false;
      academy.feathers -= cost;
      return true;
    },
    evaluate,
    state: () => academy,
    replace(next) {
      academy = normalizeAcademy(next, now());
    },
    snapshot() {
      ensurePeriods();
      const info = levelInfo(academy.xp);
      return JSON.parse(
        JSON.stringify({ ...academy, level: info.level, levelXp: info.current, nextLevelXp: info.needed }),
      );
    },
  };
}

/**
 * Akademia strony: stan z profilu po `SowieCloud.ready`, zapis `updateProfile` (nagrody dzienne starsze niż 30 dni
 * przycinane — `helpers.trimAwards`), zdarzenie okna `sowie:academy-changed` i słuchacze `onChange`.
 */
export function createAcademy({ getCloud = () => globalThis.SowieCloud, now = () => Date.now(), notify } = {}) {
  const listeners = new Set();
  const toast =
    notify ||
    ((title, detail, reward) => globalThis.SowieNotifications?.toast?.({ title, detail, reward, kind: "mission" }));
  const core = createAcademyState({ now, notify: (...args) => toast(...args) });
  let loaded = false;

  function publish() {
    const data = core.snapshot();
    for (const listener of listeners) listener(data);
    globalThis.dispatchEvent?.(new CustomEvent("sowie:academy-changed", { detail: data }));
  }

  function save() {
    const cloud = getCloud();
    if (!loaded || !cloud?.updateProfile) return;
    const state = core.state();
    state.version = VERSION;
    state.updatedAt = now();
    if (cloud.helpers?.trimAwards) state.awards = cloud.helpers.trimAwards(state.awards, dayKey(now()));
    const stored = JSON.parse(JSON.stringify(state));
    cloud.updateProfile((profile) => {
      profile.academy = stored;
    });
    publish();
  }

  function load() {
    core.replace(getCloud()?.profile?.()?.academy);
    loaded = true;
    if (core.evaluate()) save();
    else publish();
  }

  const whenLoaded = (fn) => {
    if (loaded) return fn();
    getCloud()?.ready?.then(() => fn());
    return undefined;
  };

  const api = {
    record(gameId, metric, value = 1, mode = "max") {
      whenLoaded(() => {
        if (core.record(gameId, metric, value, mode)) save();
      });
      return core.snapshot();
    },
    award(id, xp, feathers, title) {
      whenLoaded(() => {
        if (core.award(id, xp, feathers, title)) save();
      });
      return Boolean(core.state().awards[id]);
    },
    spend(feathers) {
      if (!loaded || !core.spend(feathers)) return false;
      save();
      return true;
    },
    // Zdarzenie SowieProgress → metryki (academyCalls) i nagroda `award`.
    handle(type, detail = {}) {
      for (const call of academyCalls(type, detail)) api.record(...call);
      if (type === EVENTS.AWARD && detail.id) {
        api.award(detail.id, detail.xp ?? 25, detail.feathers ?? 3, detail.label || "Nagroda");
      }
    },
    snapshot: () => core.snapshot(),
    achievements: () => {
      const state = core.state();
      return ACHIEVEMENTS.map((achievement) => ({
        ...achievement,
        unlockedAt: state.achievements[achievement.id] || null,
        progress: achievementProgress(achievement, state),
      }));
    },
    isLoaded: () => loaded,
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
  };

  const cloud = getCloud();
  cloud?.ready?.then(load);
  cloud?.onProfileReload?.(load);
  return api;
}

// Jedna Akademia na stronę — tylko menu (`data-sowie-menu`) i gry (`data-sowie-game`) z SowieCloud; Laboratorium
// i testy jednostkowe jej nie tworzą.
export const academy =
  typeof window !== "undefined" &&
  window.SowieCloud &&
  window.document?.querySelector?.("[data-sowie-menu], [data-sowie-game]")
    ? (window.SowieAcademy ||= Object.freeze(createAcademy()))
    : null;
