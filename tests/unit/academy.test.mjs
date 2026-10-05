// Testy jednostkowe Sowiej Akademii (shared/meta/academy.js, Analiza 3, E9b): zadania dnia i tygodnia, osiągnięcia,
// poziom, piórka i zgodność z zapisem dawnej Akademii (wersja 2).
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ACHIEVEMENTS,
  academyCalls,
  achievementProgress,
  createAcademyState,
  createDaily,
  dayKey,
  defaultAcademy,
  levelInfo,
  normalizeAcademy,
  TASK_POOL,
  VERSION,
  weekKey,
} from "../../shared/meta/academy.js";
import { EVENTS } from "../../shared/meta/progress-events.js";

const MONDAY = Date.UTC(2026, 9, 5, 12); // poniedziałek 5.10.2026
const DAY = 24 * 60 * 60 * 1000;

test("dzień i tydzień zadań (UTC, tydzień od poniedziałku) oraz poziom z XP", () => {
  assert.equal(dayKey(MONDAY), "2026-10-05");
  assert.equal(weekKey(MONDAY), "2026-10-05");
  assert.equal(weekKey(MONDAY + 6 * DAY), "2026-10-05");
  assert.equal(weekKey(MONDAY + 7 * DAY), "2026-10-12");
  assert.deepEqual(levelInfo(0), { level: 1, current: 0, needed: 100 });
  assert.deepEqual(levelInfo(100), { level: 2, current: 0, needed: 135 });
  assert.deepEqual(levelInfo(250), { level: 3, current: 15, needed: 170 });
});

test("zapis dawnej Akademii (wersja 2) przechodzi bez strat do wersji 3", () => {
  const old = {
    version: 2,
    xp: 320,
    feathers: 17,
    metrics: { runnerDistance: 900, ogrodyClicks: 12 },
    awards: { "weekly:2026-09-28": 1 },
    daily: { day: "2026-10-05", metrics: {}, missions: [] },
    weekly: { week: "2026-10-05", games: ["runner"], target: 3, complete: false, rewarded: false },
  };
  const state = normalizeAcademy(old, MONDAY);
  assert.equal(state.version, VERSION);
  assert.equal(state.xp, 320);
  assert.equal(state.feathers, 17);
  assert.deepEqual(state.metrics, old.metrics);
  assert.deepEqual(state.awards, old.awards);
  assert.deepEqual(state.achievements, {});
  assert.deepEqual(state.weekly.games, ["runner"]);
  assert.deepEqual(normalizeAcademy(null, MONDAY), defaultAcademy(MONDAY));
});

test("zadania dnia: 3 z puli, z różnych gier, deterministyczne dla daty, z punktem startu dla przyrostów", () => {
  const state = defaultAcademy(MONDAY);
  state.metrics = { ogrodyClicks: 40, leaves: 300, goatsCaught: 9, nearMisses: 4, whaleRides: 2, szklarniaGoats: 5 };
  for (let day = 0; day < 30; day += 1) {
    const daily = createDaily(state, MONDAY + day * DAY);
    assert.equal(daily.missions.length, 3);
    assert.equal(new Set(daily.missions.map((mission) => mission.game)).size, 3, `dzień ${day}`);
    assert.deepEqual(createDaily(state, MONDAY + day * DAY), daily);
    for (const mission of daily.missions) {
      assert.ok(TASK_POOL.some((task) => task.id === mission.id));
      assert.equal(mission.baseline, mission.type === "delta" ? Number(state.metrics[mission.metric] || 0) : 0);
    }
  }
});

test("każda metryka zadań i osiągnięć pochodzi ze zdarzeń gier (academyCalls) albo z poziomu", () => {
  const run = { leaves: 1, goats: 1, nearMisses: 1, whales: 1, fevers: 1 };
  const events = [
    [EVENTS.RUN_ENDED, { gameId: "runner", score: 1, distance: 1, bestChain: 1, run }],
    [EVENTS.RUN_ENDED, { gameId: "jumper", score: 1, height: 1, bestStreak: 1, run }],
    [EVENTS.RUN_ENDED, { gameId: "sowa3", score: 1, bestCombo: 1, finished: true, run }],
    [EVENTS.IDLE, { gameId: "ogrody", lifetimeLeaves: 1, clicks: 1, buys: 1, watering: 1, prestiges: 1, plants: 1 }],
    [EVENTS.IDLE, { gameId: "szklarnia", rooms: 1, plants: 1, goats: 1, hybrids: 1 }],
    ...["runner", "jumper", "sowa3", "ogrody", "szklarnia"].map((gameId) => [EVENTS.VISIT, { gameId }]),
  ];
  const metrics = new Set(events.flatMap(([type, detail]) => academyCalls(type, detail).map((call) => call[1])));
  for (const task of TASK_POOL) assert.ok(metrics.has(task.metric), task.id);
  for (const achievement of ACHIEVEMENTS) {
    for (const [source] of achievement.goals) assert.ok(source === "level" || metrics.has(source), achievement.id);
  }
  assert.equal(new Set(ACHIEVEMENTS.map((achievement) => achievement.id)).size, ACHIEVEMENTS.length);
});

test("zadanie dnia daje 50 XP i 5 piórek raz; zadanie tygodnia — 3 różne gry", () => {
  let clock = MONDAY;
  const toasts = [];
  const academy = createAcademyState({ now: () => clock, notify: (...args) => toasts.push(args) });
  const mission = academy.snapshot().daily.missions.find((item) => item.type === "max");
  assert.ok(mission, "w puli dnia jest zadanie typu max");
  assert.equal(academy.record(mission.game, mission.metric, mission.target - 1), true);
  assert.equal(academy.state().xp, 0);
  academy.record(mission.game, mission.metric, mission.target);
  assert.equal(academy.state().xp, 50);
  assert.equal(academy.state().feathers, 5);
  assert.deepEqual(toasts[0], ["Zadanie dnia", mission.label, "+50 XP · +5 piórek"]);
  assert.equal(academy.record(mission.game, mission.metric, mission.target), false, "bez zmiany — bez zapisu");
  assert.equal(academy.state().xp, 50);

  const games = ["runner", "jumper", "sowa3", "ogrody", "szklarnia"].filter((game) => game !== mission.game);
  academy.record(games[0], "test", 1);
  academy.record(games[1], "test", 1);
  const weekly = academy.snapshot().weekly;
  assert.equal(weekly.complete, true);
  assert.equal(academy.state().awards[`weekly:${weekKey(MONDAY)}`], MONDAY);
  assert.equal(academy.state().xp, 50 + 140);
  assert.equal(academy.state().feathers, 5 + 15);

  // Nowy dzień: nowe zadania; nowy tydzień: lista gier od zera.
  clock = MONDAY + 7 * DAY;
  const next = academy.snapshot();
  assert.equal(next.daily.day, "2026-10-12");
  assert.deepEqual(next.weekly.games, []);
});

test("osiągnięcia: postęp z metryk, nagroda raz, a XP z nagrody może od razu dać „Prymuskę”", () => {
  const toasts = [];
  const academy = createAcademyState({ now: () => MONDAY, notify: (...args) => toasts.push(args) });
  const collector = ACHIEVEMENTS.find((item) => item.id === "zbieraczka");
  assert.deepEqual(achievementProgress(collector, { metrics: { leaves: 250 } }).share, 0.25);
  academy.record("runner", "leaves", 999, "add");
  assert.equal(academy.state().achievements.zbieraczka, undefined);
  academy.record("runner", "leaves", 1, "add");
  assert.equal(academy.state().achievements.zbieraczka, MONDAY);
  assert.equal(academy.state().awards["achievement:zbieraczka"], MONDAY);
  assert.ok(toasts.some(([title]) => title === "Osiągnięcie: Zbieraczka liści"));
  const xp = academy.state().xp;
  academy.record("runner", "leaves", 5000, "add");
  assert.equal(academy.state().xp, xp, "nagroda za osiągnięcie tylko raz");

  // Wiele celów („Pierwsze kroki”: wizyty we wszystkich grach).
  for (const game of ["runner", "jumper", "sowa3", "ogrody"]) academy.record(game, `${game}Visits`, 1, "add");
  assert.equal(academy.state().achievements["pierwsze-kroki"], undefined);
  academy.record("szklarnia", "szklarniaVisits", 1, "add");
  assert.equal(academy.state().achievements["pierwsze-kroki"], MONDAY);

  // Poziom 10 od 2160 XP: 2100 XP + 80 XP za „Zbieraczkę” → „Prymuska” w tym samym przeliczeniu.
  const near = createAcademyState({ state: { xp: 2100, metrics: {} }, now: () => MONDAY });
  assert.equal(near.snapshot().level, 9);
  near.record("runner", "leaves", 1000, "add");
  assert.equal(near.snapshot().level, 10);
  assert.equal(near.state().achievements.prymuska, MONDAY);
});

test("piórka: wydatek tylko przy wystarczającym saldzie, nagroda dodatkowa raz", () => {
  const academy = createAcademyState({ state: { feathers: 12 }, now: () => MONDAY });
  assert.equal(academy.spend(20), false);
  assert.equal(academy.spend(10), true);
  assert.equal(academy.state().feathers, 2);
  assert.equal(academy.award("gallery:complete", 100, 10, "Kompletna Galeria Sów"), true);
  assert.equal(academy.award("gallery:complete", 100, 10, "Kompletna Galeria Sów"), false);
  assert.equal(academy.state().feathers, 12);
});
