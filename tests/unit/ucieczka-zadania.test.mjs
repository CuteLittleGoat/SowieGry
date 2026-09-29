// Sowia Ucieczka — zadania biegu i Sowi mnożnik (Analiza 2, rozdz. 3.1; Analiza 3, E4 zadanie 4.4).
import assert from "node:assert/strict";
import test from "node:test";
import {
  LEVEL_MAX,
  TASKS,
  TASK_BY_ID,
  TASK_SLOTS,
  createTaskTracker,
  describeTasks,
  levelFor,
  normalizeTasks,
  pickTask,
  taskTarget,
  taskTier,
} from "../../SowiaUcieczka/tasks.js";
import { DIFFICULTIES, PHYSICS, SCORE } from "../../SowiaUcieczka/config.js";
import { createRun } from "../../SowiaUcieczka/game.js";

const DT = 1 / 60;
// Wzór testowy z jedną przeszkodą.
const single = (kind) => ({
  id: `test-${kind}`,
  tier: 0,
  length: 12,
  tags: [],
  items: [{ type: "obstacle", kind, x: 8 }],
});

function sequence(values) {
  let index = 0;
  return () => values[index++ % values.length];
}

test("pula zadań: unikalne identyfikatory, 5 progów celów rosnących, opis z liczbą", () => {
  assert.ok(TASKS.length >= 15);
  assert.equal(new Set(TASKS.map((task) => task.id)).size, TASKS.length);
  for (const task of TASKS) {
    assert.ok(["run", "total"].includes(task.scope), task.id);
    assert.equal(task.targets.length, 5, task.id);
    task.targets.forEach((value, index) => assert.ok(index === 0 || value >= task.targets[index - 1], task.id));
    assert.ok(task.count || task.peak || task.glide, task.id);
    assert.ok(task.text(task.targets[0]).length > 8, task.id);
  }
  // Przykłady z Analizy 2.
  assert.equal(TASK_BY_ID["slizg-znak"].text(3), "Prześlizgnij się pod 3 znakami Amic");
  assert.equal(TASK_BY_ID["kozka-magnes"].text(1), "Złap Kózkę Magnes");
  assert.equal(TASK_BY_ID["liscie-bieg"].text(80), "Zbierz 80 liści w jednym biegu");
  assert.equal(TASK_BY_ID.biom.text(4000), "Dobiegnij do biomu Plaża");
});

test("Sowi mnożnik: poziom 1–20, +1 co 3 ukończone zadania; progi trudności co 4 poziomy", () => {
  assert.equal(levelFor(0), 1);
  assert.equal(levelFor(2), 1);
  assert.equal(levelFor(3), 2);
  assert.equal(levelFor(57), 20);
  assert.equal(levelFor(500), LEVEL_MAX);
  assert.equal(taskTier(1), 0);
  assert.equal(taskTier(5), 1);
  assert.equal(taskTier(20), 4);
  assert.equal(taskTarget(TASK_BY_ID["liscie-bieg"], 1), 40);
  assert.equal(taskTarget(TASK_BY_ID["liscie-bieg"], 20), 200);
});

test("stan z bazy: zawsze 3 różne zadania z różnych grup; nieznane zadania wypadają", () => {
  const fresh = normalizeTasks(null, sequence([0.1, 0.5, 0.9]));
  assert.equal(fresh.active.length, TASK_SLOTS);
  assert.equal(fresh.level, 1);
  assert.equal(new Set(fresh.active.map((slot) => TASK_BY_ID[slot.id].group)).size, TASK_SLOTS);
  const repaired = normalizeTasks(
    {
      completed: 7,
      active: [
        { id: "nie-ma-takiego", progress: 3 },
        { id: "o-wlos", progress: 4 },
        { id: "o-wlos", progress: 1 },
      ],
    },
    sequence([0.3]),
  );
  assert.equal(repaired.level, 3);
  assert.equal(repaired.active.length, 3);
  assert.deepEqual(repaired.active[0], { id: "o-wlos", progress: 4 });
  assert.equal(new Set(repaired.active.map((slot) => slot.id)).size, 3);
  // Nowe zadanie nie powtarza właśnie ukończonego.
  for (let index = 0; index < 20; index += 1) {
    const next = pickTask([{ id: "combo" }, { id: "humbak" }], Math.random, ["o-wlos"]);
    assert.ok(!["combo", "humbak", "o-wlos"].includes(next.id));
  }
});

test("śledzenie: zdarzenia i stan biegu posuwają zadania; ukończenie zgłaszane raz", () => {
  const tracker = createTaskTracker({
    saved: {
      completed: 2,
      active: [
        { id: "slizg-znak", progress: 2 },
        { id: "liscie-bieg", progress: 30 },
        { id: "bez-trafienia", progress: 0 },
      ],
    },
  });
  assert.equal(tracker.level, 1);
  assert.equal(tracker.multiplier, 1);
  // „W jednym biegu” — od zera; „łącznie” — od zapisanego postępu.
  assert.deepEqual(
    tracker.list().map((task) => task.progress),
    [2, 0, 0],
  );
  assert.deepEqual(tracker.handle({ type: "pass", kind: "znak", under: false }), []);
  assert.deepEqual(tracker.handle({ type: "pass", kind: "dymek", under: true }), []);
  const done = tracker.handle({ type: "pass", kind: "znak", under: true });
  assert.deepEqual(done, [{ id: "slizg-znak", label: "Prześlizgnij się pod 3 znakami Amic" }]);
  assert.deepEqual(tracker.handle({ type: "pass", kind: "znak", under: true }), []);
  tracker.handle({ type: "leaf", kind: "zloty", count: 5 });
  assert.equal(tracker.list()[1].progress, 5);
  // Bez trafienia: trafienie zeruje odcinek.
  tracker.tick({ distance: 250, bestCombo: 1, owl: {} }, 0.1);
  tracker.handle({ type: "hit" });
  tracker.tick({ distance: 500, bestCombo: 1, owl: {} }, 0.1);
  assert.equal(tracker.list()[2].progress, 250);
  assert.deepEqual(tracker.tick({ distance: 551, bestCombo: 1, owl: {} }, 0.1), [
    { id: "bez-trafienia", label: "Przebiegnij 300 m bez trafienia" },
  ]);
  const result = tracker.finish();
  assert.deepEqual(result.finished, ["slizg-znak", "bez-trafienia"]);
  assert.equal(result.data.completed, 4);
  assert.equal(result.levelUp, true);
  assert.equal(result.level, 2);
  assert.equal(result.data.active.length, 3);
  // Niedokończone „w jednym biegu” wraca do zera; ukończone zastąpione innymi.
  assert.deepEqual(result.data.active[1], { id: "liscie-bieg", progress: 0 });
  assert.ok(!result.data.active.some((slot) => ["slizg-znak", "bez-trafienia"].includes(slot.id)));
});

test("szybowanie liczy czas, platforma — tylko najwyższa, kózka — właściwy rodzaj; opis do wyników", () => {
  const tracker = createTaskTracker({
    saved: {
      active: [
        { id: "szybowanie", progress: 9.5 },
        { id: "platforma-gora", progress: 0 },
        { id: "kozka-magnes", progress: 0 },
      ],
    },
  });
  tracker.tick({ distance: 10, bestCombo: 1, owl: { gliding: false } }, 1);
  assert.equal(tracker.list()[0].progress, 9);
  assert.equal(tracker.tick({ distance: 10, bestCombo: 1, owl: { gliding: true } }, 0.6).length, 1);
  assert.deepEqual(tracker.handle({ type: "land", surface: -4.2 }), []);
  assert.equal(tracker.handle({ type: "land", surface: -6.2 }).length, 1);
  assert.deepEqual(tracker.handle({ type: "goat", kind: "turbo" }), []);
  assert.equal(tracker.handle({ type: "goat", kind: "magnes" }).length, 1);
  assert.ok(tracker.list().every((task) => task.done && task.newlyDone));
  const described = describeTasks(
    { level: 1, active: [{ id: "o-wlos", progress: 7 }] },
    {
      "o-wlos": true,
    },
  );
  assert.deepEqual(described[0], {
    id: "o-wlos",
    label: "Zdobądź 5 × „O włos!”",
    scope: "total",
    progress: 5,
    target: 5,
    done: true,
    newlyDone: true,
  });
});

test("Sowi mnożnik mnoży punkty za dystans; podsumowanie biegu ma mnożnik i „Idealnie!”", () => {
  const game = createRun({ difficulty: "arcade", seed: "mnoznik", multiplier: 3 });
  for (let t = 0; t < 8; t += DT) {
    game.state.invulnerable = 1e9;
    game.update(DT);
  }
  const state = game.state;
  const extras = state.leafPoints + state.nearMisses * SCORE.nearMiss + state.goatPoints + state.bonusPoints;
  assert.equal(state.score - extras - state.perfectPoints, Math.floor(state.distance * 3));
  assert.equal(game.summary().multiplier, 3);
  assert.equal(game.summary().perfects, state.perfects);
  assert.equal(createRun({ seed: "x", multiplier: 0 }).state.multiplier, 1);
});

test("„Idealnie!”: lądowanie w środku platformy daje 20 pkt × combo i +1 do serii; przy krawędzi — nic", () => {
  for (const [offset, expected] of [
    [0, true],
    [1.2, false],
  ]) {
    const game = createRun({ difficulty: "arcade", seed: "idealnie", patterns: [single("teczka")] });
    const owl = game.state.owl;
    // Platforma (poziom 1) tak, by sowa spadła na nią w środku (albo przy krawędzi).
    // Spadek z 1 j. nad platformą trwa ok. √(2 / g) s przy prędkości startowej Arcade.
    const land = owl.x + DIFFICULTIES.arcade.speedStart * Math.sqrt(2 / PHYSICS.gravity);
    game.state.world.platforms.push({ x: land - 1.5 - offset, width: 3, y: -2.2, level: 1 });
    Object.assign(owl, { y: -3.2, vy: 0, grounded: false, surface: 0 });
    const streak = game.state.streak;
    let perfect = null;
    for (let t = 0; t < 0.6 && !owl.grounded; t += DT) {
      game.update(DT);
      perfect ||= game.takeEvents().find((event) => event.type === "perfect");
    }
    assert.equal(owl.surface, -2.2, "wylądowała na platformie");
    assert.equal(Boolean(perfect), expected, `przesunięcie ${offset}`);
    if (expected) {
      assert.equal(perfect.bonus, SCORE.perfect * game.state.combo);
      assert.equal(game.state.streak, streak + 1);
      assert.equal(game.state.perfectPoints, perfect.bonus);
    }
  }
});

test("mijanie przeszkód: zdarzenie „pass” mówi, czy dołem (ślizg pod znakiem), czy górą (skok nad telefonem)", () => {
  const run = (kind, act) => {
    const game = createRun({ difficulty: "arcade", seed: `pass-${kind}`, patterns: [single(kind)] });
    game.prime();
    const events = [];
    for (let t = 0; t < 5; t += DT) {
      const owl = game.state.owl;
      const next = game.state.obstacles.find((item) => !item.passed && !item.hit && item.x > owl.x);
      if (next) act(game, next.x - owl.x);
      game.update(DT);
      events.push(...game.takeEvents());
    }
    return { game, passes: events.filter((event) => event.type === "pass") };
  };
  const under = run("znak", (game, ahead) => {
    if (ahead < 1.3 && game.state.owl.grounded && !game.state.owl.sliding) game.swipe("down");
  });
  assert.ok(under.passes.length >= 2);
  assert.ok(under.passes.every((event) => event.kind === "znak" && event.under && !event.over));
  assert.equal(under.game.state.hits, 0);
  const over = run("telefon", (game, ahead) => {
    if (ahead < 1.6 && game.state.owl.grounded) {
      game.press("keyboard");
      game.release();
    }
  });
  assert.ok(over.passes.length >= 2);
  assert.ok(over.passes.every((event) => event.kind === "telefon" && event.over && !event.under));
  assert.equal(over.game.state.hits, 0);
});

test("seria liści (Akademia: runnerLeafChain): liście od ostatniego trafienia, trafienie zeruje; najlepsza w podsumowaniu", () => {
  const game = createRun({ difficulty: "arcade", seed: "seria", patterns: [single("teczka")] });
  const owl = game.state.owl;
  const give = () => {
    game.state.leaves.push({ kind: "zielony", x: owl.x + 0.2, y: -0.5, taken: false, phase: 0 });
    game.state.leaves.sort((a, b) => a.x - b.x);
    game.update(DT);
  };
  for (let index = 0; index < 6; index += 1) give();
  assert.equal(game.state.leafChain, 6);
  game.hit("pracu");
  assert.equal(game.state.leafChain, 0);
  game.state.invulnerable = 0;
  give();
  give();
  assert.equal(game.state.leafChain, 2);
  assert.equal(game.summary().bestChain, 6);
});
