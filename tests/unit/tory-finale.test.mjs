// Sowie Tory (Analiza 3, E5c): finał planszy z basenem (oś czasu ok. 4 s, skracanie tylko po pierwszym
// obejrzeniu) i „Humbacze Tory” (20 s, trzy morskie tory, wyskok, liście w kółkach, bez obrażeń).
import assert from "node:assert/strict";
import { test } from "node:test";
import { createRng } from "../../shared/engine/rng.js";
import { STARS, TRACK } from "../../SowieTory/config.js";
import {
  FINALE,
  FINALE_DURATION,
  FINALE_ORDER,
  GARDEN,
  createFinale,
  finaleOwl,
  finalePhase,
  finaleWhale,
} from "../../SowieTory/finale.js";
import { createRun, stageStars } from "../../SowieTory/game.js";
import { WHALE, createWhaleRide, whaleRings } from "../../SowieTory/whale.js";

const STEP = 1 / 60;

test("finał: ok. 4 s w kolejności bieg → skok → plusk → przemiana, zdarzenia przy wejściu w fazę", () => {
  assert.ok(FINALE_DURATION >= 3.5 && FINALE_DURATION <= 4.5, `${FINALE_DURATION} s`);
  assert.deepEqual(FINALE_ORDER, ["run", "jump", "splash", "morph"]);
  assert.equal(finalePhase(0).phase, "run");
  assert.equal(finalePhase(FINALE.run + 0.01).phase, "jump");
  assert.equal(finalePhase(FINALE_DURATION).phase, "done");
  const finale = createFinale();
  const types = [];
  let time = 0;
  while (!finale.done() && time < 10) {
    types.push(...finale.update(STEP).map((event) => event.type));
    time += STEP;
  }
  assert.deepEqual(types, ["finaleJump", "finaleSplash", "finaleMorph", "finaleDone"]);
  assert.ok(Math.abs(time - FINALE_DURATION) < STEP * 2);
});

test("finał: pierwszy raz nie da się skrócić, po obejrzeniu tapnięcie kończy od razu; duży krok nie gubi zdarzeń", () => {
  const first = createFinale({ seen: false });
  first.update(0.5);
  assert.deepEqual(first.skip(), []);
  assert.equal(first.done(), false);
  const again = createFinale({ seen: true });
  again.update(0.5);
  assert.deepEqual(again.skip(), [{ type: "finaleDone", skipped: true }]);
  assert.equal(again.done(), true);
  assert.deepEqual(again.skip(), []);
  // Po pauzie (jeden krok 10 s) wszystkie zdarzenia faz po kolei.
  const paused = createFinale();
  assert.deepEqual(
    paused.update(10).map((event) => event.type),
    ["finaleJump", "finaleSplash", "finaleMorph", "finaleDone"],
  );
});

test("Humbacze Tory: kółka co 9 m na trzech torach, co trzeci rząd wysoko, złote rzadko; 20 s rejsu", () => {
  const rings = whaleRings(createRng("humbak").next);
  assert.ok(rings.length >= 25);
  for (const ring of rings) {
    assert.ok([-1, 0, 1].includes(ring.lane));
    assert.ok([WHALE.lowY, WHALE.highY].includes(ring.y));
    assert.ok(ring.at >= WHALE.firstRing && ring.at < WHALE.duration * WHALE.speed);
  }
  const rows = new Set(rings.map((ring) => ring.at));
  const high = rings.filter((ring) => ring.y === WHALE.highY);
  assert.ok(high.length > 0 && high.length < rings.length / 2);
  assert.ok(rings.some((ring) => ring.gold));
  assert.ok(rows.size >= 25);
  const ride = createWhaleRide({ random: createRng("rejs").next });
  let time = 0;
  while (!ride.done()) {
    ride.update(STEP);
    time += STEP;
  }
  assert.ok(Math.abs(time - WHALE.duration) < STEP * 2);
  assert.equal(ride.remaining(), 0);
  assert.deepEqual(ride.update(STEP), []);
});

test("Humbacze Tory: autopilot (zmiana toru i wyskok przed wysokim kółkiem) zbiera prawie każdy rząd", () => {
  for (const seed of ["a", "b", "c", "d"]) {
    const ride = createWhaleRide({ random: createRng(`humbak-${seed}`).next });
    const { state } = ride;
    const rows = new Set(state.rings.map((ring) => ring.at));
    while (!ride.done()) {
      const next = state.rings.find((ring) => !ring.taken && ring.at - state.distance > -WHALE.reachZ);
      if (next) {
        const row = state.rings.filter((ring) => ring.at === next.at);
        const target = row.reduce((best, ring) =>
          Math.abs(ring.lane - state.lane) < Math.abs(best.lane - state.lane) ? ring : best,
        );
        if (target.lane < state.lane) ride.input("left");
        else if (target.lane > state.lane) ride.input("right");
        const z = target.at - state.distance;
        if (target.y === WHALE.highY && z < WHALE.speed * 0.5 && !state.airborne) ride.input("up");
      }
      ride.update(STEP);
    }
    const rowsTaken = new Set(state.rings.filter((ring) => ring.taken).map((ring) => ring.at));
    assert.ok(rowsTaken.size >= rows.size * 0.9, `${seed}: ${rowsTaken.size} / ${rows.size}`);
  }
});

test("Humbacze Tory: bez ruchu humbak zbiera tylko niskie kółka na swoim torze; wyskok ląduje po ok. 1 s", () => {
  const ride = createWhaleRide({ random: createRng("spokojnie").next, lane: 0 });
  while (!ride.done()) ride.update(STEP);
  const { state } = ride;
  for (const ring of state.rings.filter((item) => item.taken)) {
    assert.equal(ring.lane, 0);
    assert.equal(ring.y, WHALE.lowY);
  }
  const leap = createWhaleRide({ random: createRng("wyskok").next });
  leap.input("up");
  const types = leap.update(STEP).map((event) => event.type);
  assert.ok(types.includes("whaleLeap"));
  let air = 0;
  let peak = 0;
  while (leap.state.airborne) {
    leap.update(STEP);
    peak = Math.max(peak, leap.state.y);
    air += STEP;
  }
  assert.ok(air > 0.9 && air < 1.1, `${air} s`);
  assert.ok(peak > 2 && peak < 2.4, `${peak} m`);
});

test("finał: sowa biegnie do basenu, skacze łukiem i znika w wodzie; humbak wynurza się z fontanną", () => {
  const finale = createFinale();
  const owlAt = [];
  while (!finale.done()) {
    finale.update(STEP);
    owlAt.push({ phase: finale.state.phase, owl: finaleOwl(finale.state, 1.6), whale: finaleWhale(finale.state) });
  }
  const run = owlAt.filter((item) => item.phase === "run");
  assert.ok(run.at(-1).owl.z > GARDEN.runTo - 0.2 && Math.abs(run.at(-1).owl.x) < 0.05);
  assert.ok(run.every((item) => item.owl.y === 0 && item.whale === null));
  const jump = owlAt.filter((item) => item.phase === "jump").map((item) => item.owl.y);
  assert.ok(Math.max(...jump) > GARDEN.wall + 0.5, "łuk skoku nad ścianką basenu");
  assert.ok(
    owlAt.some((item) => item.phase === "splash" && item.owl === null),
    "sowa znika w pluśnięciu",
  );
  const morph = owlAt.filter((item) => item.phase === "morph");
  assert.ok(morph.every((item) => item.owl === null && item.whale));
  assert.ok(
    morph.some((item) => item.whale.spout > 0.5),
    "fontanna",
  );
  assert.ok(morph.at(-1).whale.y > GARDEN.water, "humbak nad wodą");
});

test("gwiazdki planszy: ★ ukończenie, ★ liście (co najmniej 60% wystawionych), ★ bez trafienia", () => {
  assert.equal(STARS.leafShare, 0.6);
  assert.deepEqual(stageStars({ hits: 0, leaves: 60, total: 100 }), { count: 3, leaves: true, noHit: true });
  assert.deepEqual(stageStars({ hits: 2, leaves: 60, total: 100 }), { count: 2, leaves: true, noHit: false });
  assert.deepEqual(stageStars({ hits: 0, leaves: 59, total: 100 }), { count: 2, leaves: false, noHit: true });
  assert.deepEqual(stageStars({ hits: 1, leaves: 0, total: 0 }), { count: 1, leaves: false, noHit: false });
});

// Bieg w trybie bezpiecznym od razu na koniec planszy (przeskok), potem kroki aż do podsumowania.
function toFinish(options = {}) {
  const run = createRun({ seed: "finał", difficulty: "arcade", safe: true, ...options });
  run.warp(TRACK.stageLength);
  const seen = [];
  for (let time = 0; time < 2 && run.state.phase === "run"; time += STEP) {
    run.update(STEP);
    seen.push(...run.takeEvents());
  }
  return { run, seen };
}

test("koniec planszy: finał → rejs humbaka 20 s → podsumowanie z gwiazdkami → następna plansza", () => {
  const { run, seen } = toFinish();
  assert.equal(run.state.phase, "finale");
  const finish = seen.find((event) => event.type === "finish");
  assert.equal(finish.stage, 0);
  assert.equal(finish.seen, false);
  // Pierwszy raz finału nie da się skrócić, a sterowanie nic nie robi.
  assert.equal(run.skipFinale(), false);
  run.input("left");
  const types = [];
  for (let time = 0; time < 30 && run.state.phase !== "stageEnd"; time += STEP) {
    if (run.state.phase === "whale" && time % 1 < STEP) run.input("up");
    run.update(STEP);
    types.push(...run.takeEvents().map((event) => event.type));
  }
  assert.equal(run.state.phase, "stageEnd");
  for (const type of ["finaleJump", "finaleSplash", "finaleMorph", "finaleDone", "finishSeen", "whaleStart"]) {
    assert.ok(types.includes(type), type);
  }
  assert.ok(types.includes("whaleLeap") && types.includes("whaleLeaf") && types.includes("whaleEnd"));
  assert.ok(types.indexOf("finaleDone") < types.indexOf("whaleStart"));
  assert.equal(run.state.finishSeen, true);
  assert.ok(run.state.stageWhaleLeaves > 0);
  assert.equal(run.state.stageStars.length, 1);
  assert.equal(run.state.lives, run.state.maxLives, "rejs bez obrażeń");
  assert.equal(run.nextStage(), true);
  assert.equal(run.state.phase, "run");
  assert.equal(run.state.stage, 1);
  assert.equal(run.state.ride, null);
  assert.equal(run.state.stageLeafTotal, 0);
  // Druga plansza: finał już obejrzany — tapnięcie przechodzi od razu do rejsu.
  run.warp(TRACK.stageLength);
  for (let time = 0; time < 2 && run.state.phase === "run"; time += STEP) run.update(STEP);
  assert.equal(run.state.phase, "finale");
  run.update(0.3);
  assert.equal(run.skipFinale(), true);
  assert.equal(run.state.phase, "whale");
  const events = run.takeEvents().map((event) => event.type);
  assert.ok(events.includes("finaleDone") && !events.includes("finishSeen"));
});

test("finał obejrzany w poprzedniej wizycie (finishSeen z dokumentu gry) można skrócić od razu", () => {
  const { run, seen } = toFinish({ finishSeen: true });
  assert.equal(seen.find((event) => event.type === "finish").seen, true);
  assert.equal(run.skipFinale(), true);
  assert.equal(run.state.phase, "whale");
  const late = toFinish();
  late.run.setFinishSeen(true);
  assert.equal(late.run.skipFinale(), true);
});

test("rejs: przesunięcia sterują humbakiem, liście z kółek podnoszą wynik i licznik liści", () => {
  const { run } = toFinish({ finishSeen: true });
  run.skipFinale();
  const before = { score: run.state.score, leaves: run.state.leafCount };
  run.input("right");
  run.update(STEP);
  assert.equal(run.state.ride.lane, 1);
  run.input("down");
  run.update(STEP);
  assert.equal(run.state.ride.lane, 1, "w dół nic nie robi");
  for (let time = 0; time < 25 && run.state.phase === "whale"; time += STEP) run.update(STEP);
  const gained = run.state.leafCount - before.leaves;
  assert.equal(gained, run.state.stageWhaleLeaves);
  assert.ok(run.state.score >= before.score + gained * WHALE.points);
});
