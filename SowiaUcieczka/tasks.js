// Sowia Ucieczka — zadania biegu i Sowi mnożnik (Analiza 2, rozdz. 3.1).
// Zawsze 3 aktywne zadania. Każde 3 ukończone podnoszą stały Sowi mnożnik (poziom 1–20), który mnoży punkty
// za dystans. Zadania „w jednym biegu” liczą się od zera w każdym biegu, pozostałe sumują się między biegami.
// Stan w dokumencie gry (sowiegry_gry/runner, pole `tasks`): { level, completed, active: [{ id, progress }] }.
import { PLATFORM_LEVELS } from "./config.js";

export const TASK_SLOTS = 3;
export const LEVEL_MAX = 20;
export const TASKS_PER_LEVEL = 3;

// Trudność zadań rośnie z Sowim mnożnikiem: próg 0–4 (co 4 poziomy).
export const taskTier = (level) => Math.max(0, Math.min(4, Math.floor((level - 1) / 4)));

// Poziom mnożnika z liczby ukończonych zadań.
export const levelFor = (completed) => Math.min(LEVEL_MAX, 1 + Math.floor(Math.max(0, completed) / TASKS_PER_LEVEL));

const BIOME_NAMES = ["Miasto", "Osiedle PRL", "Stacja Amic", "Plaża", "Noc nad morzem"];
const TOP_PLATFORM = -PLATFORM_LEVELS[PLATFORM_LEVELS.length - 1];

// Definicje: `scope` — "run" (w jednym biegu) albo "total" (łącznie); `targets` — cel dla progów 0–4;
// `count(event)` — przyrost ze zdarzenia gry; `peak(stats)` — wartość z biegu (dystans, combo…);
// `group` — w jednej grupie najwyżej jedno aktywne zadanie.
export const TASKS = Object.freeze([
  {
    id: "liscie-bieg",
    scope: "run",
    group: "liscie",
    targets: [40, 80, 120, 160, 200],
    text: (n) => `Zbierz ${n} liści w jednym biegu`,
    count: (event) => (event.type === "leaf" ? event.count : 0),
  },
  {
    id: "dystans-bieg",
    scope: "run",
    group: "dystans",
    targets: [500, 1000, 1500, 2200, 3000],
    text: (n) => `Przebiegnij ${n} m w jednym biegu`,
    peak: (stats) => stats.distance,
  },
  {
    id: "biom",
    scope: "run",
    group: "dystans",
    targets: [1000, 2000, 3000, 4000, 5000],
    text: (n) => `Dobiegnij do biomu ${BIOME_NAMES[Math.round(n / 1000) - 1] || "Noc nad morzem"}`,
    peak: (stats) => stats.distance,
  },
  {
    id: "bez-trafienia",
    scope: "run",
    group: "dystans",
    targets: [300, 500, 800, 1000, 1500],
    text: (n) => `Przebiegnij ${n} m bez trafienia`,
    peak: (stats) => stats.bestNoHit,
  },
  {
    id: "slizg-znak",
    scope: "total",
    group: "slizg",
    targets: [3, 5, 8, 10, 12],
    text: (n) => `Prześlizgnij się pod ${n} znakami Amic`,
    count: (event) => (event.type === "pass" && event.kind === "znak" && event.under ? 1 : 0),
  },
  {
    id: "slizg-dymek",
    scope: "total",
    group: "slizg",
    targets: [3, 5, 8, 10, 12],
    text: (n) => `Prześlizgnij się pod ${n} dymkami Pracu`,
    count: (event) => (event.type === "pass" && event.kind === "dymek" && event.under ? 1 : 0),
  },
  ...[
    ["magnes", "Magnes"],
    ["turbo", "Turbo"],
    ["sprezynka", "Sprężynka"],
    ["tarcza", "Tarcza"],
  ].map(([kind, name]) => ({
    id: `kozka-${kind}`,
    scope: "total",
    group: "kozka",
    targets: [1, 1, 2, 2, 3],
    text: (n) => (n === 1 ? `Złap Kózkę ${name}` : `Złap Kózkę ${name} ${n} razy`),
    count: (event) => (event.type === "goat" && event.kind === kind ? 1 : 0),
  })),
  {
    id: "kozki-bieg",
    scope: "run",
    group: "kozki",
    targets: [2, 3, 4, 5, 6],
    text: (n) => `Złap ${n} kózki w jednym biegu`,
    count: (event) => (event.type === "goat" ? 1 : 0),
  },
  {
    id: "o-wlos",
    scope: "total",
    group: "o-wlos",
    targets: [5, 10, 15, 20, 30],
    text: (n) => `Zdobądź ${n} × „O włos!”`,
    count: (event) => (event.type === "nearMiss" ? 1 : 0),
  },
  {
    id: "combo",
    scope: "run",
    group: "combo",
    targets: [3, 4, 5, 5, 5],
    text: (n) => `Dojdź do combo ×${n}`,
    peak: (stats) => stats.bestCombo,
  },
  {
    id: "humbak",
    scope: "total",
    group: "humbak",
    targets: [1, 2, 3, 4, 5],
    text: (n) => (n === 1 ? "Popłyń na humbaku" : `Popłyń na humbaku ${n} razy`),
    count: (event) => (event.type === "bonusStart" ? 1 : 0),
  },
  {
    id: "babelki",
    scope: "total",
    group: "humbak",
    targets: [3, 5, 8, 10, 12],
    text: (n) => `Złap ${n} bąbelków humbaka`,
    count: (event) => (event.type === "bubble" ? 1 : 0),
  },
  {
    id: "zlote",
    scope: "total",
    group: "liscie",
    targets: [5, 10, 15, 20, 30],
    text: (n) => `Zbierz ${n} złotych liści`,
    count: (event) => (event.type === "leaf" && event.kind === "zloty" ? 1 : 0),
  },
  {
    id: "goraczka",
    scope: "total",
    group: "goraczka",
    targets: [1, 2, 3, 4, 5],
    text: (n) => (n === 1 ? "Włącz Gorączkę Monster" : `Włącz Gorączkę Monster ${n} razy`),
    count: (event) => (event.type === "fever" ? 1 : 0),
  },
  {
    id: "podwojny",
    scope: "run",
    group: "skoki",
    targets: [10, 20, 30, 40, 50],
    text: (n) => `Wykonaj ${n} podwójnych skoków w jednym biegu`,
    count: (event) => (event.type === "doubleJump" ? 1 : 0),
  },
  {
    id: "szybowanie",
    scope: "total",
    group: "skoki",
    targets: [10, 20, 30, 45, 60],
    text: (n) => `Szybuj łącznie ${n} s`,
    glide: true,
  },
  {
    id: "turbo-przebij",
    scope: "total",
    group: "turbo",
    targets: [3, 5, 8, 10, 15],
    text: (n) => `Przebij ${n} przeszkód w Turbo`,
    count: (event) => (event.type === "smash" ? 1 : 0),
  },
  {
    id: "idealnie",
    scope: "total",
    group: "ladowanie",
    targets: [3, 5, 8, 10, 15],
    text: (n) => `Wyląduj „Idealnie!” ${n} razy`,
    count: (event) => (event.type === "perfect" ? 1 : 0),
  },
  {
    id: "platforma-gora",
    scope: "total",
    group: "ladowanie",
    targets: [1, 2, 3, 4, 5],
    text: (n) => (n === 1 ? "Wyląduj na najwyższej platformie" : `Wyląduj ${n} razy na najwyższej platformie`),
    count: (event) => (event.type === "land" && event.surface <= TOP_PLATFORM + 1e-6 ? 1 : 0),
  },
]);

export const TASK_BY_ID = Object.freeze(Object.fromEntries(TASKS.map((task) => [task.id, task])));

export const taskTarget = (task, level) => task.targets[taskTier(level)];

// Nowe zadanie: spoza aktywnych i spoza ich grup (a jeśli się nie da — spoza aktywnych).
export function pickTask(active, random = Math.random, avoid = []) {
  const ids = new Set(active.map((slot) => slot.id));
  const groups = new Set(active.map((slot) => TASK_BY_ID[slot.id]?.group));
  let pool = TASKS.filter((task) => !ids.has(task.id) && !groups.has(task.group) && !avoid.includes(task.id));
  if (!pool.length) pool = TASKS.filter((task) => !ids.has(task.id));
  return { id: pool[Math.floor(random() * pool.length) % pool.length].id, progress: 0 };
}

// Stan z bazy → poprawny stan (nieznane zadania wypadają, braki uzupełniamy).
export function normalizeTasks(saved, random = Math.random) {
  const completed = Math.max(0, Math.floor(Number(saved?.completed) || 0));
  const active = [];
  for (const slot of Array.isArray(saved?.active) ? saved.active : []) {
    if (active.length >= TASK_SLOTS) break;
    if (!TASK_BY_ID[slot?.id] || active.some((item) => item.id === slot.id)) continue;
    active.push({ id: slot.id, progress: Math.max(0, Number(slot.progress) || 0) });
  }
  while (active.length < TASK_SLOTS) active.push(pickTask(active, random));
  return { level: levelFor(completed), completed, active };
}

// Opis zadań do wyświetlenia (ekran tytułowy, wyniki).
export function describeTasks(data, extra = {}) {
  return data.active.map((slot) => {
    const task = TASK_BY_ID[slot.id];
    const target = taskTarget(task, data.level);
    const progress = Math.min(target, Math.floor(slot.progress));
    return {
      id: slot.id,
      label: task.text(target),
      scope: task.scope,
      progress,
      target,
      done: slot.progress >= target,
      newlyDone: Boolean(extra[slot.id]),
    };
  });
}

/**
 * Śledzenie zadań w jednym biegu.
 * createTaskTracker({ saved, random }) → { level, multiplier, data, handle(event), tick(state, dt), list(), finish() }
 * handle/tick zwracają listę zadań ukończonych właśnie teraz ([{ id, label }]).
 */
export function createTaskTracker({ saved = null, random = Math.random } = {}) {
  const data = normalizeTasks(saved, random);
  const level = data.level;
  const slots = data.active.map((slot) => {
    const task = TASK_BY_ID[slot.id];
    const start = task.scope === "run" ? 0 : slot.progress;
    return {
      task,
      target: taskTarget(task, level),
      progress: start,
      done: start >= taskTarget(task, level),
      fresh: false,
    };
  });
  const stats = { distance: 0, bestCombo: 1, bestNoHit: 0, hitAt: 0 };

  function advance(slot, value, mode) {
    if (slot.done) return null;
    slot.progress = mode === "peak" ? Math.max(slot.progress, value) : slot.progress + value;
    if (slot.progress < slot.target) return null;
    slot.done = true;
    slot.fresh = true;
    return { id: slot.task.id, label: slot.task.text(slot.target) };
  }

  return {
    level,
    multiplier: level,
    handle(event) {
      if (event.type === "hit") stats.hitAt = stats.distance;
      const finished = [];
      for (const slot of slots) {
        const value = slot.task.count?.(event) || 0;
        if (value > 0) {
          const done = advance(slot, value, "add");
          if (done) finished.push(done);
        }
      }
      return finished;
    },
    tick(state, dt) {
      stats.distance = Math.max(stats.distance, Math.floor(state.distance));
      stats.bestCombo = Math.max(stats.bestCombo, state.bestCombo || 1);
      stats.bestNoHit = Math.max(stats.bestNoHit, stats.distance - stats.hitAt);
      const finished = [];
      for (const slot of slots) {
        let done = null;
        if (slot.task.peak) done = advance(slot, slot.task.peak(stats), "peak");
        else if (slot.task.glide && state.owl?.gliding) done = advance(slot, dt, "add");
        if (done) finished.push(done);
      }
      return finished;
    },
    list: () =>
      slots.map((slot) => ({
        id: slot.task.id,
        label: slot.task.text(slot.target),
        progress: Math.min(slot.target, Math.floor(slot.progress)),
        target: slot.target,
        done: slot.done,
        newlyDone: slot.fresh,
      })),
    // Koniec biegu: ukończone zadania wymieniamy, zadania „w jednym biegu” wracają do zera.
    finish() {
      let completed = data.completed;
      const finishedIds = [];
      const active = slots.map((slot) => {
        if (!slot.done) {
          const progress = slot.task.scope === "run" ? 0 : Math.round(slot.progress * 10) / 10;
          return { id: slot.task.id, progress };
        }
        completed += 1;
        finishedIds.push(slot.task.id);
        return null;
      });
      // Na miejsce ukończonych — nowe zadania (inne niż właśnie ukończone).
      for (let index = 0; index < active.length; index += 1) {
        if (!active[index]) active[index] = pickTask(active.filter(Boolean), random, finishedIds);
      }
      const next = { level: levelFor(completed), completed, active };
      return { data: next, finished: finishedIds, levelUp: next.level > level, level: next.level };
    },
  };
}
