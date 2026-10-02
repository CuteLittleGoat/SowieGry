// Sowa w Chmurach (Analiza 3, E6c1): skaczące kózki i ich moce (Sprężynka, Rakietka, Tarcza, Magnes,
// Podwajaczka), tęczowy liść i Gorączka Monster, serduszka; rozmieszczenie z osobnym generatorem losowym.
import assert from "node:assert/strict";
import { test } from "node:test";
import { EXTRAS, FEVER, GOATS, HAZARDS, OWL, SCORE } from "../../SowaWChmurach/config.js";
import { GOAT_ORDER, catchesGoat, createExtrasPlanner, goatPose, pickGoat } from "../../SowaWChmurach/extras.js";
import { createRun } from "../../SowaWChmurach/game.js";
import { createGenerator } from "../../SowaWChmurach/generator.js";
import { createRng } from "../../shared/engine/rng.js";

const STEP = 1 / 120;
const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} ≠ ${expected} ± ${tolerance}`);

// Lot bez przeszkód i bez kózek na trasie (moce z `giveGoat`), sowa na balkonie 50 m wyżej, bez sterowania.
function flight(seed = "dodatki") {
  const run = createRun({ seed, hazards: false, extras: false });
  run.warp(50);
  for (let index = 0; index < 60; index += 1) run.update(STEP);
  run.takeEvents();
  return run;
}

const advance = (run, seconds, events = []) => {
  for (let index = 0; index < Math.round(seconds * 120); index += 1) {
    run.update(STEP);
    events.push(...run.takeEvents());
  }
  return events;
};

test("kózka: postój na platformie, skok łukiem na następną i z powrotem; losowanie bez powtórek; złapanie", () => {
  const goat = { kind: "tarcza", from: { x: 2, y: 10 }, to: { x: 5, y: 12 }, phase: 0, taken: false };
  assert.deepEqual({ ...goatPose(goat, 0.5) }, { x: 2, y: 10, hopping: false });
  const middle = goatPose(goat, GOATS.rest + GOATS.hop / 2);
  assert.equal(middle.hopping, true);
  near(middle.x, 3.5, 1e-9, "w połowie skoku w bok");
  near(middle.y, 11 + GOATS.arc + 1, 1e-9, "łuk nad prostą");
  const landed = goatPose(goat, GOATS.rest + GOATS.hop + 0.1);
  assert.deepEqual([landed.x, landed.y, landed.hopping], [5, 12, false]);
  const back = goatPose(goat, 2 * (GOATS.rest + GOATS.hop) + 0.1);
  assert.deepEqual([back.x, back.y], [2, 10]);
  // Przez krawędź kolumny — najkrótszą drogą.
  const edge = { kind: "magnes", from: { x: 8.5, y: 0 }, to: { x: 0.5, y: 0 }, phase: 0 };
  near(goatPose(edge, GOATS.rest + GOATS.hop / 2).x, 9, 1e-9, "przez krawędź");
  const random = createRng("kozy").next;
  let last = null;
  const seen = new Set();
  for (let index = 0; index < 200; index += 1) {
    const kind = pickGoat(random, last);
    assert.notEqual(kind, last);
    seen.add(kind);
    last = kind;
  }
  assert.deepEqual([...seen].sort(), [...GOAT_ORDER].sort());
  assert.equal(catchesGoat({ x: 2.3, y: 10.1 }, goat, 0.5), true);
  assert.equal(catchesGoat({ x: 3.5, y: 10.1 }, goat, 0.5), false);
});

test("planista dodatków: kózki co 120–200 m między stałymi platformami, serduszka co 300–450 m, tęczowe liście od 100 m", () => {
  for (const seed of ["d-1", "d-2", "d-3"]) {
    const platforms = [];
    createGenerator({ random: createRng(`${seed}|trasa`).next, difficulty: "arcade" }).fill(2500, platforms, []);
    const path = platforms.filter((item) => item.path);
    const planner = createExtrasPlanner({ random: createRng(`${seed}|dodatki`).next });
    const goats = [];
    const hearts = [];
    const leaves = [];
    let perPair = 0;
    for (let index = 1; index < path.length; index += 1) {
      const before = goats.length + hearts.length + leaves.length;
      planner.plan(path[index - 1], path[index], goats, hearts, leaves);
      perPair = Math.max(perPair, goats.length + hearts.length + leaves.length - before);
    }
    assert.equal(perPair, 1, "najwyżej jeden dodatek na parę platform");
    assert.ok(goats[0].to.y >= GOATS.first);
    for (let index = 1; index < goats.length; index += 1) {
      assert.ok(goats[index].to.y - goats[index - 1].to.y >= GOATS.every[0] - 1e-9, `${seed}: odstęp kózek`);
    }
    assert.ok(goats.length >= 10 && goats.length <= 2500 / GOATS.every[0] + 1, `${seed}: ${goats.length} kózek`);
    for (const goat of goats) {
      const from = path.find((item) => item.y === goat.from.y);
      const to = path.find((item) => item.y === goat.to.y);
      assert.ok(["galazka", "balkon", "lisc"].includes(from.type) && ["galazka", "balkon", "lisc"].includes(to.type));
      assert.ok(GOAT_ORDER.includes(goat.kind));
    }
    for (let index = 1; index < hearts.length; index += 1) {
      assert.ok(hearts[index].y - hearts[index - 1].y >= EXTRAS.heartEvery[0] - 1e-9);
    }
    assert.ok(hearts.length >= 3);
    assert.ok(leaves.every((leaf) => leaf.kind === "teczowy" && leaf.y >= EXTRAS.rainbowFrom));
    assert.ok(leaves.length >= 4);
  }
});

test("dodatki nie zmieniają trasy platform ani przeszkód", () => {
  const snapshot = (extras) => {
    const run = createRun({ seed: "niezalezne", extras });
    run.warp(400);
    return {
      platforms: run.state.platforms.map((item) => [item.type, item.x, item.y]),
      hazards: run.state.hazards.map((item) => [item.kind, item.x0, item.y0]),
    };
  };
  assert.deepEqual(snapshot(true), snapshot(false));
});

test("Sprężynka: wystrzał na ok. 40 m, w locie w górę przeszkody nie trafiają", () => {
  const run = flight("sprezynka");
  const state = run.state;
  const start = state.owl.y;
  const events = [];
  run.giveGoat("sprezynka");
  events.push(...run.takeEvents());
  assert.deepEqual(
    events.map((event) => event.type),
    ["goat", "spring"],
  );
  near(state.owl.vy, Math.sqrt(2 * OWL.gravity * GOATS.springHeight), 1e-9, "prędkość");
  run.addHazard("sterowiec", state.owl.x, start + 10);
  let top = start;
  while (state.owl.vy > 0) {
    run.update(STEP);
    top = Math.max(top, state.owl.y);
  }
  near(top - start, GOATS.springHeight, 1, "wysokość");
  assert.equal(state.hits, 0);
  assert.equal(state.spring, false);
  assert.equal(state.goatCount, 1);
  assert.ok(state.bonusPoints >= GOATS.bonus);
});

test("Rakietka (kózka Turbo): 3 s lotu w górę 18 m/s bez trafień, potem 1 s nietykalności", () => {
  const run = flight("rakietka");
  const state = run.state;
  const start = state.owl.y;
  run.giveGoat("turbo");
  run.addHazard("sterowiec", state.owl.x, start + 20);
  const events = advance(run, GOATS.duration.turbo + STEP * 2);
  near(state.owl.y - start, GOATS.rocketSpeed * GOATS.duration.turbo, 1, "wzlot");
  assert.equal(state.hits, 0);
  assert.equal(state.rocket, 0);
  assert.ok(events.some((event) => event.type === "rocketStart" || event.type === "rocketEnd"));
  assert.ok(events.some((event) => event.type === "rocketEnd"));
  assert.ok(state.invulnerable > 0.9);
});

test("Tarcza przyjmuje trafienie; Podwajaczka podwaja liście; moce mijają po swoim czasie", () => {
  const run = flight("tarcza");
  const state = run.state;
  run.giveGoat("tarcza");
  run.addHazard("kanister", state.owl.x, state.owl.y + 0.6);
  const hit = advance(run, STEP * 2);
  assert.ok(hit.some((event) => event.type === "shield"));
  assert.equal(state.lives, 3);
  assert.equal(state.hits, 0);
  assert.equal(state.powerups.tarcza, undefined);
  run.giveGoat("podwajaczka");
  const combo = state.combo;
  state.leaves.push({ x: state.owl.x, y: state.owl.y + 0.55, kind: "zielony", taken: false });
  const leaf = advance(run, STEP).find((event) => event.type === "leaf");
  assert.equal(leaf.multiplier, 2);
  assert.equal(leaf.count, 2);
  assert.equal(leaf.points, SCORE.leaf * combo * 2);
  const ended = advance(run, GOATS.duration.podwajaczka + 0.1);
  assert.ok(ended.some((event) => event.type === "powerupEnd" && event.kind === "podwajaczka"));
  assert.deepEqual(state.powerups, {});
});

test("Magnes: liście z 4 m lecą do sowy i są zbierane", () => {
  const run = flight("magnes");
  const state = run.state;
  state.leaves = [
    { x: state.owl.x + 3, y: state.owl.y + 0.5, kind: "zielony", taken: false },
    { x: state.owl.x - 2, y: state.owl.y + 2, kind: "zielony", taken: false },
    { x: state.owl.x + 4.4, y: state.owl.y + 6, kind: "zielony", taken: false },
  ];
  const far = state.leaves[2];
  run.giveGoat("magnes");
  const events = advance(run, 0.6);
  assert.equal(events.filter((event) => event.type === "leaf").length >= 2, true);
  assert.equal(far.taken, false, "dalej niż 4 m — zostaje");
});

test("tęczowy liść: 100 pkt × combo i Gorączka Monster 8 s — liście ×2 i deszcz liści nad platformami", () => {
  const run = flight("goraczka");
  const state = run.state;
  const before = state.leaves.length;
  state.leaves.push({ x: state.owl.x, y: state.owl.y + 0.55, kind: "teczowy", taken: false });
  const events = advance(run, 0.1);
  const rainbow = events.find((event) => event.type === "leaf" && event.kind === "teczowy");
  assert.equal(rainbow.points, EXTRAS.rainbowPoints * rainbow.combo);
  assert.ok(events.some((event) => event.type === "fever"));
  assert.ok(state.fever > FEVER.duration - 0.2);
  assert.ok(state.leaves.filter((leaf) => leaf.extra).length >= FEVER.column, "deszcz liści");
  assert.ok(state.leaves.length > before);
  state.leaves.push({ x: state.owl.x, y: state.owl.y + 0.55, kind: "zielony", taken: false });
  const doubled = advance(run, STEP).find((event) => event.type === "leaf");
  assert.equal(doubled.multiplier, FEVER.multiplier);
  const ended = advance(run, FEVER.duration);
  assert.ok(ended.some((event) => event.type === "feverEnd"));
  assert.equal(run.summary().fevers, 1);
});

test("serduszko: brakujące życie wraca; przy pełnych życiach +100 pkt", () => {
  const run = flight("serce");
  const state = run.state;
  state.lives = 2;
  state.hearts.push({ x: state.owl.x, y: state.owl.y + HAZARDS.owlCenter, taken: false });
  const gained = advance(run, STEP);
  assert.ok(gained.some((event) => event.type === "life"));
  assert.equal(state.lives, 3);
  const bonus = state.bonusPoints;
  state.hearts.push({ x: state.owl.x, y: state.owl.y + HAZARDS.owlCenter, taken: false });
  const extra = advance(run, STEP);
  assert.ok(extra.some((event) => event.type === "lifeBonus"));
  assert.equal(state.bonusPoints - bonus, EXTRAS.heartBonus);
  assert.equal(run.summary().livesGained, 1);
});

test("kózki w locie: pojawiają się na trasie i złapana kózka daje moc", () => {
  const run = createRun({ seed: "kozy-trasa", hazards: false });
  run.warp(200);
  const state = run.state;
  assert.ok(state.goats.length >= 1, "kózka przed sową");
  const goat = state.goats[0];
  const pose = goatPose(goat, state.time);
  state.owl.x = pose.x;
  state.owl.y = pose.y;
  state.owl.vy = 0;
  const events = advance(run, STEP);
  assert.ok(events.some((event) => event.type === "goat" && event.kind === goat.kind));
  assert.equal(goat.taken, true);
  assert.equal(run.summary().goats, 1);
});
