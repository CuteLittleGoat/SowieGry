// Sowa w Chmurach (Analiza 3, E6e): samouczek pierwszego lotu (kroki, warunki, limity czasu, dymek do zdeptania
// obok gałązki) i instrukcja „chmury” (karty, grafiki z atlasu).
import assert from "node:assert/strict";
import { test } from "node:test";
import { guideFor } from "../../shared/meta/guides-data.js";
import { SPRITES } from "../../shared/world/catalog.js";
import { OWL } from "../../SowaWChmurach/config.js";
import { createRun } from "../../SowaWChmurach/game.js";
import { TUTORIAL_DYMEK, TUTORIAL_STEPS, createTutorial } from "../../SowaWChmurach/tutorial.js";

const STEP = 1 / 120;

function fakeState() {
  return {
    phase: "run",
    height: 2,
    leafCount: 0,
    owl: { x: 4.5, y: 2 },
    lastSafe: { x: 2, y: 5 },
  };
}

test("samouczek: pięć kroków — przeciągnij, wyżej, liść, Pracu, ratunek; warunki i limity czasu", () => {
  assert.deepEqual(
    TUTORIAL_STEPS.map((item) => item.id),
    ["przeciagnij", "wyzej", "lisc", "pracu", "ratunek"],
  );
  const prompts = [];
  const hazards = [];
  let done = 0;
  const tutorial = createTutorial({
    onPrompt: (item) => prompts.push(item),
    onDone: () => (done += 1),
    addHazard: (...args) => hazards.push(args),
  });
  const state = fakeState();
  state.owl.x = 8.6;
  tutorial.update(state, STEP);
  assert.equal(prompts.at(-1).id, "przeciagnij");
  assert.equal(prompts.at(-1).gesture, "drag");
  assert.equal(prompts.at(-1).step, 1);
  assert.equal(prompts.at(-1).steps, 5);
  // 1) Przesunięcie w bok (także przez krawędź kolumny) o 1,5 m.
  for (const x of [8.8, 0.1, 0.4, 0.7, 1]) {
    state.owl.x = x;
    tutorial.update(state, STEP);
  }
  assert.equal(tutorial.progress().id, "przeciagnij", "1,4 m to za mało");
  state.owl.x = 1.2;
  tutorial.update(state, STEP);
  assert.equal(tutorial.progress().id, "wyzej");
  // Krok bez limitu czasu czeka na warunek: 12 m wyżej.
  tutorial.update(state, 60);
  assert.equal(tutorial.progress().id, "wyzej");
  state.height = 14;
  tutorial.update(state, STEP);
  assert.equal(tutorial.progress().id, "lisc");
  // 2) Liść albo 15 s.
  tutorial.update(state, 14.9);
  assert.equal(tutorial.progress().id, "lisc");
  tutorial.update(state, 0.2);
  assert.equal(tutorial.progress().id, "pracu", "limit czasu kroku z liściem");
  // 3) Dymek obok ostatniej gałązki (w stronę środka kolumny), nieruchomy; gest w jego stronę.
  assert.equal(hazards.length, 1);
  const [kind, hx, hy, extra] = hazards[0];
  assert.equal(kind, "dymek");
  assert.ok(Math.abs(hx - (2 + TUTORIAL_DYMEK.side)) < 1e-9, `x ${hx}`);
  assert.ok(Math.abs(hy - (5 + TUTORIAL_DYMEK.above)) < 1e-9, `y ${hy}`);
  assert.deepEqual(extra, { speed: 0 });
  state.owl.x = 1;
  tutorial.update(state, STEP);
  assert.equal(prompts.at(-1).gesture, "swipe-right");
  state.owl.x = 4;
  tutorial.update(state, STEP);
  assert.equal(prompts.at(-1).gesture, "swipe-left");
  tutorial.handleEvent({ type: "leaf" });
  tutorial.update(state, STEP);
  assert.equal(tutorial.progress().id, "pracu");
  tutorial.handleEvent({ type: "stomp", kind: "dymek" });
  tutorial.update(state, STEP);
  assert.equal(tutorial.progress().id, "ratunek");
  // 4) Ratunek — informacja na 5 s, potem koniec.
  tutorial.update(state, 4.9);
  assert.equal(done, 0);
  tutorial.update(state, 0.2);
  assert.equal(done, 1);
  assert.equal(tutorial.done(), true);
  assert.equal(prompts.at(-1), null);
  assert.equal(tutorial.progress(), null);
  tutorial.update(state, 10);
  assert.equal(done, 1, "koniec tylko raz");
});

test("samouczek: krok Pracu kończy też trafienie (w samouczku bez utraty serduszka) i limit 14 s; dymek przy prawej krawędzi w lewo", () => {
  const hazards = [];
  const tutorial = createTutorial({ addHazard: (...args) => hazards.push(args) });
  const state = fakeState();
  state.lastSafe = { x: 7.5, y: 40 };
  tutorial.update(state, STEP);
  state.owl.x = 6.1;
  tutorial.update(state, STEP);
  state.height = 20;
  tutorial.update(state, STEP);
  state.leafCount = 1;
  tutorial.update(state, STEP);
  assert.equal(tutorial.progress().id, "pracu");
  assert.ok(Math.abs(hazards[0][1] - (7.5 - TUTORIAL_DYMEK.side)) < 1e-9);
  tutorial.handleEvent({ type: "hit", kind: "dymek" });
  tutorial.update(state, STEP);
  assert.equal(tutorial.progress().id, "ratunek");

  const slow = createTutorial();
  const other = fakeState();
  slow.update(other, STEP);
  other.owl.x = 6.5;
  slow.update(other, STEP);
  other.height = 20;
  slow.update(other, STEP);
  other.leafCount = 3;
  slow.update(other, STEP);
  slow.update(other, 13.9);
  assert.equal(slow.progress().id, "pracu");
  slow.update(other, 0.2);
  assert.equal(slow.progress().id, "ratunek");
});

test("samouczek w locie: dymek obok gałązki nie trafia wznoszącej się sowy, a przesunięcie na szczycie skoku go depcze", () => {
  const run = createRun({ seed: "samouczek", hazards: false, extras: false, safe: true });
  run.warp(30);
  // Sowa ląduje na balkonie pod sobą i zaczyna się od niego odbijać.
  let landed = false;
  for (let index = 0; index < 600 && !landed; index += 1) {
    run.update(STEP);
    landed = run.takeEvents().some((event) => event.type === "bounce");
  }
  assert.ok(landed && run.state.lastSafe, "odbicie od balkonu");
  const base = run.state.lastSafe;
  const tutorial = createTutorial({ addHazard: (kind, x, y, extra) => run.addHazard(kind, x, y, extra) });
  // Krok „Pracu” od razu (pierwsze trzy warunki spełnione sztucznie).
  tutorial.update({ ...run.state, height: 0 }, STEP);
  tutorial.update({ ...run.state, owl: { ...run.state.owl, x: run.state.owl.x + 2 }, height: 0 }, STEP);
  tutorial.update({ ...run.state, height: 50 }, STEP);
  tutorial.update({ ...run.state, height: 50, leafCount: 99 }, STEP);
  assert.equal(tutorial.progress().id, "pracu");
  assert.equal(run.state.hazards.length, 1);
  const dymek = run.state.hazards[0];
  // Do następnego odbicia od balkonu i przez wznoszenie — bez trafienia.
  let events = [];
  let bounced = false;
  for (let index = 0; index < 600; index += 1) {
    const vy = run.state.owl.vy;
    run.update(STEP);
    events.push(...run.takeEvents());
    if (events.some((event) => event.type === "bounce")) bounced = true;
    if (bounced && vy > 0 && run.state.owl.vy <= 0) break;
  }
  assert.ok(bounced);
  assert.equal(events.filter((event) => event.type === "hit").length, 0, "wznoszenie obok dymku bez trafienia");
  // Na szczycie skoku przesunięcie nad dymek (ruch palca × 1,25 = odległość w bok).
  run.steer((dymek.x0 - run.state.owl.x) / OWL.drag);
  events = [];
  for (let index = 0; index < 240; index += 1) {
    run.update(STEP);
    events.push(...run.takeEvents());
    if (events.some((event) => event.type === "stomp")) break;
  }
  const stomp = events.find((event) => event.type === "stomp");
  assert.ok(stomp, "zdeptany dymek");
  tutorial.handleEvent(stomp);
  tutorial.update(run.state, STEP);
  assert.equal(tutorial.progress().id, "ratunek");
  assert.equal(base.y + TUTORIAL_DYMEK.above, dymek.y0);
});

test("instrukcja „chmury”: tytuł, opis, karty o sterowaniu, platformach, Pracu i Amic, kózkach, oceanie — z grafikami z atlasu", () => {
  const guide = guideFor("chmury");
  assert.equal(guide.id, "chmury");
  assert.equal(guide.title, "Sowa w Chmurach");
  assert.ok(guide.summary.length > 40);
  assert.deepEqual(
    guide.cards.map((card) => card.id),
    ["cel", "sterowanie", "platformy", "pracu-amic", "kozki", "ocean", "ratunek"],
  );
  for (const card of guide.cards) {
    assert.ok(card.title && card.text, card.id);
    assert.ok(SPRITES[card.sprite], `${card.id}: brak grafiki ${card.sprite}`);
  }
  assert.match(guide.cards.find((card) => card.id === "sterowanie").text, /Przeciągnij palcem/);
  assert.match(guide.cards.find((card) => card.id === "ocean").text, /fontann/);
});
