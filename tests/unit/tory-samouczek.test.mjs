// Sowie Tory (Analiza 3, E5e): samouczek pierwszego biegu — 4 kroki (zmiana toru, skok, ślizg, kózka); gra stoi,
// dopóki gracz nie wykona pokazanego ruchu; inne ruchy są pomijane; po samouczku bez trafień.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createRun } from "../../SowieTory/game.js";
import { TUTORIAL_PATTERNS, TUTORIAL_STEPS, createTutorial } from "../../SowieTory/tutorial.js";

const STEP = 1 / 120;
const DIRECTION = { "swipe-left": "left", "swipe-right": "right", "swipe-up": "up", "swipe-down": "down" };

function setup() {
  const prompts = [];
  let done = 0;
  const run = createRun({ seed: "samouczek", difficulty: "arcade", intro: TUTORIAL_PATTERNS, safe: true });
  const tutorial = createTutorial({ onPrompt: (item) => prompts.push(item), onDone: () => (done += 1) });
  const tick = () => {
    tutorial.update(run.state);
    if (!tutorial.frozen()) run.update(STEP);
    for (const event of run.takeEvents()) tutorial.handleEvent(event);
  };
  return { run, tutorial, prompts, tick, done: () => done };
}

test("samouczek: 4 wzory wstępne i 4 kroki (tor, skok, ślizg, kózka)", () => {
  assert.deepEqual(
    TUTORIAL_PATTERNS.map((item) => item.id),
    ["samouczek-tor", "samouczek-skok", "samouczek-slizg", "samouczek-kozka"],
  );
  assert.deepEqual(
    TUTORIAL_STEPS.map((item) => item.pattern),
    TUTORIAL_PATTERNS.map((item) => item.id),
  );
  assert.ok(TUTORIAL_PATTERNS.every((item) => item.tags.includes("samouczek")));
});

test("samouczek: gra stoi przed przeszkodą, zły ruch nic nie daje, pokazany ruch wznawia; koniec bez trafień", () => {
  const { run, tutorial, prompts, tick, done } = setup();
  const gestures = [];
  const safeHits = [];
  for (let frame = 0; frame < 120 * 60 && !tutorial.done(); frame += 1) {
    tick();
    if (!tutorial.frozen()) continue;
    const progress = tutorial.progress();
    gestures.push(progress.gesture);
    const frozenAt = run.state.stageDistance;
    for (let wait = 0; wait < 30; wait += 1) tick();
    assert.equal(run.state.stageDistance, frozenAt, "gra stoi");
    // Zły ruch (inny kierunek) jest pomijany.
    const wrong = progress.gesture === "swipe-up" ? "down" : "up";
    assert.equal(tutorial.accept(wrong), false);
    assert.equal(tutorial.frozen(), true);
    const direction = DIRECTION[progress.gesture];
    assert.equal(tutorial.accept(direction), true);
    run.input(direction);
    assert.equal(tutorial.frozen(), false);
    for (const event of run.takeEvents()) if (event.type === "safeHit") safeHits.push(event);
  }
  for (let frame = 0; frame < 120; frame += 1) {
    run.update(STEP);
    for (const event of run.takeEvents()) if (event.type === "safeHit") safeHits.push(event);
  }
  assert.equal(done(), 1);
  assert.equal(tutorial.done(), true);
  assert.deepEqual(gestures.slice(0, 3), ["swipe-left", "swipe-up", "swipe-down"]);
  assert.equal(gestures.length, 4, "kózka po zmianie toru w lewo — trzeba wrócić na środek");
  assert.equal(gestures[3], "swipe-right");
  assert.deepEqual(safeHits, [], "żadnego trafienia przy właściwych ruchach");
  assert.equal(run.state.goatCount, 1, "kózka złapana");
  assert.equal(prompts.at(-1), null);
  assert.ok(prompts.some((item) => item?.step === 4 && item.steps === 4));
});

test("samouczek: ruch tuż przed zatrzymaniem zalicza każdy krok bez zatrzymania", () => {
  const run = createRun({ seed: "samouczek-2", difficulty: "arcade", intro: TUTORIAL_PATTERNS, safe: true });
  const tutorial = createTutorial();
  const starts = new Map();
  const moved = new Set();
  let frozen = 0;
  for (let frame = 0; frame < 120 * 60 && !tutorial.done(); frame += 1) {
    tutorial.update(run.state);
    if (tutorial.frozen()) frozen += 1;
    run.update(STEP);
    for (const event of run.takeEvents()) {
      tutorial.handleEvent(event);
      if (event.type === "pattern") starts.set(event.id, event.start);
    }
    const index = tutorial.progress().step - 1;
    const item = TUTORIAL_STEPS[index];
    if (!item || moved.has(index) || !starts.has(item.pattern)) continue;
    const z = starts.get(item.pattern) + item.target - run.state.stageDistance;
    // Gracz „wie, co robić”: ruch 1 m przed miejscem zatrzymania (krok 4: w lewo — z toru 1 na środek, do kózki).
    if (z <= item.freeze(run.state.speed) + 1) {
      moved.add(index);
      const direction = ["right", "up", "down", "left"][index];
      if (tutorial.accept(direction)) run.input(direction);
    }
  }
  assert.equal(tutorial.done(), true);
  assert.equal(frozen, 0, "żadnego zatrzymania");
  assert.equal(run.state.owl.lane, 0);
  assert.equal(run.state.goatCount, 1, "kózka złapana");
});

test("samouczek: sowa już na torze kózki — krok 4 bez zatrzymania", () => {
  const { run, tutorial, tick } = setup();
  const gestures = [];
  for (let frame = 0; frame < 120 * 60 && !tutorial.done(); frame += 1) {
    tick();
    if (!tutorial.frozen()) continue;
    const { gesture } = tutorial.progress();
    gestures.push(gesture);
    tutorial.accept(DIRECTION[gesture]);
    run.input(DIRECTION[gesture]);
    // Po ominięciu telefonu wraca na środek — kózka czeka na środkowym torze.
    if (gestures.length === 1) {
      for (let wait = 0; wait < 60; wait += 1) tick();
      tutorial.accept("right");
      run.input("right");
    }
  }
  assert.equal(tutorial.done(), true);
  assert.deepEqual(gestures, ["swipe-left", "swipe-up", "swipe-down"]);
  assert.equal(run.state.goatCount, 1);
});
