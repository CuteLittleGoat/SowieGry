// Testy jednostkowe SowieProgress (most do Sowiej Akademii) i struktury instrukcji guides-data.js.
import assert from "node:assert/strict";
import { test } from "node:test";
import { bridgeCalls, createProgress, EVENTS, taskProgress } from "../../shared/meta/progress.js";
import { GESTURES, GUIDES, guideFor, validateGuide } from "../../shared/meta/guides-data.js";
import { SPRITES } from "../../shared/world/catalog.js";

test("most do Akademii: metryki z końca biegu, postępu gier idle i wizyt", () => {
  assert.deepEqual(bridgeCalls(EVENTS.RUN_ENDED, { gameId: "runner", score: 1500, distance: 820, bestChain: 6 }), [
    ["runner", "runnerScore", 1500, "max"],
    ["runner", "runnerDistance", 820, "max"],
    ["runner", "runnerLeafChain", 6, "max"],
  ]);
  assert.deepEqual(bridgeCalls(EVENTS.RUN_ENDED, { gameId: "jumper", score: 900, height: 140, bestStreak: 3 }), [
    ["jumper", "jumperScore", 900, "max"],
    ["jumper", "jumperHeight", 140, "max"],
    ["jumper", "jumperStreak", 3, "max"],
  ]);
  assert.deepEqual(bridgeCalls(EVENTS.RUN_ENDED, { gameId: "sowa3", score: 700, bestCombo: 5, finished: true }), [
    ["sowa3", "sowa3Score", 700, "max"],
    ["sowa3", "sowa3Combo", 5, "max"],
    ["sowa3", "sowa3Finishes", 1, "add"],
  ]);
  assert.deepEqual(
    bridgeCalls(EVENTS.IDLE, {
      gameId: "ogrody",
      lifetimeLeaves: 5000,
      clicks: 80,
      buys: 21,
      watering: 9,
      prestiges: 1,
      plants: 18,
    }),
    [
      ["ogrody", "ogrodyLeaves", 5000, "max"],
      ["ogrody", "ogrodyClicks", 80, "set"],
      ["ogrody", "ogrodyBuys", 21, "set"],
      ["ogrody", "ogrodyWatering", 9, "set"],
      ["ogrody", "ogrodyPrestiges", 1, "set"],
      ["ogrody", "ogrodyPlants", 18, "max"],
    ],
  );
  assert.deepEqual(bridgeCalls(EVENTS.IDLE, { gameId: "szklarnia", rooms: 4, plants: 6, goats: 2, hybrids: 1 }), [
    ["szklarnia", "szklarniaRooms", 4, "max"],
    ["szklarnia", "szklarniaPlants", 6, "max"],
    ["szklarnia", "szklarniaGoats", 2, "set"],
    ["szklarnia", "szklarniaHybrids", 1, "max"],
  ]);
  assert.deepEqual(bridgeCalls(EVENTS.VISIT, { gameId: "runner" }), [["runner", "runnerVisits", 1, "add"]]);
  // Brak wartości → brak wywołania; nieznana gra → nic.
  assert.deepEqual(bridgeCalls(EVENTS.RUN_ENDED, { gameId: "runner", score: 10 }), [
    ["runner", "runnerScore", 10, "max"],
  ]);
  assert.deepEqual(bridgeCalls(EVENTS.RUN_ENDED, { gameId: "laboratorium", score: 10 }), []);
  assert.deepEqual(bridgeCalls(EVENTS.LEAF, { gameId: "runner" }), []);
});

test("zadania z migawki Akademii: misje dnia (max i delta) oraz misja tygodnia", () => {
  const snapshot = {
    metrics: { ogrodyClicks: 40 },
    daily: {
      metrics: { runnerDistance: 350 },
      missions: [
        {
          id: "runner-distance",
          label: "Przebiegnij 500 m",
          metric: "runnerDistance",
          type: "max",
          target: 500,
          complete: false,
        },
        {
          id: "ogrody-clicks",
          label: "Zbierz liście 30 razy",
          metric: "ogrodyClicks",
          type: "delta",
          target: 30,
          baseline: 5,
          complete: true,
        },
      ],
    },
    weekly: { games: ["runner", "ogrody"], target: 3, complete: false },
  };
  assert.deepEqual(taskProgress(snapshot), [
    { id: "runner-distance", label: "Przebiegnij 500 m", progress: 350, target: 500, done: false },
    { id: "ogrody-clicks", label: "Zbierz liście 30 razy", progress: 30, target: 30, done: true },
    { id: "weekly", label: "Zagraj w 3 różne gry w tym tygodniu", progress: 2, target: 3, done: false },
  ]);
  assert.deepEqual(taskProgress(null), []);
});

test("SowieProgress: bieg liczy liście, kózki, trafienia i combo, a koniec biegu trafia do Akademii", () => {
  const recorded = [];
  const awards = [];
  let distance = 0;
  const academy = {
    record: (...args) => {
      recorded.push(args);
      if (args[1] === "runnerDistance") distance = Math.max(distance, args[2]);
    },
    award: (...args) => awards.push(args),
    snapshot: () => ({
      metrics: {},
      daily: {
        metrics: { runnerDistance: distance },
        missions: [{ id: "runner-distance", label: "500 m", metric: "runnerDistance", type: "max", target: 500 }],
      },
      weekly: { games: [], target: 3 },
    }),
  };
  let clock = 1000;
  const progress = createProgress({ getAcademy: () => academy, now: () => clock });
  const seen = [];
  const off = progress.on("*", (detail, type) => seen.push(type));
  assert.throws(() => progress.endRun({}), /beginRun/);
  assert.throws(() => progress.emit("coś:nowego"), /Nieznane zdarzenie/);

  progress.beginRun("runner", { difficulty: "arcade" });
  progress.emit(EVENTS.LEAF, { kind: "zielony", points: 10 });
  progress.emit(EVENTS.LEAF, { kind: "zloty", points: 50, count: 5 });
  progress.emit(EVENTS.LEAF, { kind: "teczowy", points: 100 });
  progress.emit(EVENTS.GOAT, { kind: "magnes" });
  progress.emit(EVENTS.GOAT, { kind: "magnes" });
  progress.emit(EVENTS.HIT, { by: "amic" });
  progress.emit(EVENTS.NEAR_MISS, { by: "pracu" });
  progress.emit(EVENTS.COMBO, { value: 4 });
  progress.emit(EVENTS.COMBO, { value: 2 });
  progress.emit(EVENTS.FEVER);
  progress.emit(EVENTS.WHALE, { leaves: 30 });
  progress.emit(EVENTS.AWARD, { id: "test:nagroda", xp: 10, feathers: 1, label: "Test" });
  const current = progress.current();
  assert.deepEqual(current.leaves, { zielony: 1, zloty: 5, teczowy: 1, total: 7 });
  assert.equal(current.leafPoints, 160);
  assert.deepEqual(current.goats, { magnes: 2 });
  assert.deepEqual(current.hits, { pracu: 0, amic: 1 });
  assert.equal(current.nearMisses, 1);
  assert.equal(current.bestCombo, 4);
  assert.equal(current.fevers, 1);
  assert.equal(current.whales, 1);
  assert.deepEqual(awards, [["test:nagroda", 10, 1, "Test"]]);

  clock = 61000;
  const summary = progress.endRun({ score: 1234, distance: 620, bestChain: 5 });
  assert.equal(summary.durationMs, 60000);
  assert.equal(summary.score, 1234);
  assert.equal(summary.bestCombo, 4);
  assert.deepEqual(recorded, [
    ["runner", "runnerScore", 1234, "max"],
    ["runner", "runnerDistance", 620, "max"],
    ["runner", "runnerLeafChain", 5, "max"],
  ]);
  assert.deepEqual(summary.tasks[0], {
    id: "runner-distance",
    label: "500 m",
    progress: 500,
    target: 500,
    done: true,
    advanced: true,
    newlyDone: true,
  });
  assert.equal(progress.current(), null);
  assert.equal(seen[0], EVENTS.RUN_STARTED);
  assert.equal(seen.at(-1), EVENTS.RUN_ENDED);
  off();
  progress.emit(EVENTS.VISIT, { gameId: "jumper" });
  assert.equal(seen.at(-1), EVENTS.RUN_ENDED, "odłączony słuchacz");
});

test("instrukcje: struktura przewodników, gesty i grafiki z katalogu", () => {
  for (const guide of Object.values(GUIDES)) assert.deepEqual(validateGuide(guide, { sprites: SPRITES }), [], guide.id);
  assert.equal(guideFor("swiat").cards.length, 7);
  assert.equal(guideFor("nie-ma"), null);
  assert.ok(GESTURES.tap && GESTURES["swipe-down"] && GESTURES.drag);
  assert.deepEqual(
    validateGuide(
      {
        id: "x",
        title: "X",
        summary: "S",
        cards: [{ id: "a", title: "A", text: "T", gesture: "skok", sprite: "brak" }],
      },
      { sprites: SPRITES },
    ),
    ["karta a: nieznany gest skok", "karta a: brak grafiki brak"],
  );
  assert.deepEqual(validateGuide(null), ["brak przewodnika"]);
});

test("instrukcje obecnych gier: każda gra z rejestru ma przewodnik (treść z dawnego game-guides.js)", async () => {
  const { readFileSync } = await import("node:fs");
  const { GUIDE_ORDER } = await import("../../shared/meta/guides-data.js");
  const platform = readFileSync(new URL("../../shared/sowie-platform.js", import.meta.url), "utf8");
  const ids = [...platform.matchAll(/id: "(runner|jumper|sowa3|ogrody|szklarnia)"/g)].map((match) => match[1]);
  assert.deepEqual(GUIDE_ORDER, ["swiat", ...ids]);
  for (const id of ids) {
    const guide = guideFor(id);
    // Analiza 2, rozdz. 4.1: 4–6 kart; przebudowane gry mają więcej mechanik — do 8 kart (zaakceptowane podglądy).
    assert.ok(guide.cards.length >= 4 && guide.cards.length <= 8, id);
    // Łącz i Hoduj (gra logiczna) zaczyna od karty „Łączenie” — samej zasady gry; pozostałe od „Cel gry”.
    assert.equal(guide.cards[0].title, id === "szklarnia" ? "Łączenie" : "Cel gry");
    assert.ok(
      guide.cards.some((card) => card.gesture),
      `${id}: karta sterowania z gestem`,
    );
  }
  // „runner” to od E4 Sowia Ucieczka.
  assert.equal(guideFor("runner").title, "Sowia Ucieczka");
  assert.match(guideFor("runner").summary, /Chmurą Pracu/);
  // „sowa3” to od E5f Sowie Tory, „jumper” od E6f — Sowa w Chmurach.
  assert.equal(guideFor("sowa3").title, "Sowie Tory");
  assert.equal(guideFor("sowa3").id, "sowa3");
  assert.equal(guideFor("jumper").title, "Sowa w Chmurach");
  assert.equal(guideFor("jumper").id, "jumper");
  // „szklarnia” to od E8e Łącz i Hoduj, „ogrody” od E7e — nowa odsłona Sowich Ogrodów.
  assert.equal(guideFor("szklarnia").title, "Łącz i Hoduj");
  assert.equal(guideFor("ogrody").cards.length, 7);
});
