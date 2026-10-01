// Sowie Tory (Analiza 3, E5d1): skaczące kózki (ruch między torami, losowanie, łapanie, efekty — Sprężynka, Tarcza,
// Magnes, Kózia jazda, Podwajaczka), Gorączka Monster (tęczowy liść, deszcz liści bez przeszkód), dodatkowe życia.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createRng } from "../../shared/engine/rng.js";
import { EXTRA_LIFE, FEVER, GOATS, LEAVES, OWL, TRACK } from "../../SowieTory/config.js";
import { createRun } from "../../SowieTory/game.js";
import { GOAT_MOTION, GOAT_ORDER, catchesGoat, goatPose, pickGoat } from "../../SowieTory/goats.js";
import { obstacleShape } from "../../SowieTory/obstacles.js";
import { createOwlBody } from "../../SowieTory/physics.js";
import { laneX } from "../../SowieTory/projection.js";

const STEP = 1 / 120;

test("kózka: stoi 0,6 s na torze, skacze łukiem 0,4 s na sąsiedni i z powrotem; łapana tylko w pobliżu", () => {
  const goat = { lanes: [0, 1], phase: 0 };
  assert.deepEqual(goatPose(goat, 0.3), { x: 0, y: 0, lane: 0, hopping: false });
  const middle = goatPose(goat, GOAT_MOTION.rest + GOAT_MOTION.hop / 2);
  assert.ok(Math.abs(middle.x - laneX(1) / 2) < 1e-9 && Math.abs(middle.y - GOATS.hopHeight) < 1e-9);
  assert.equal(middle.hopping, true);
  const cycle = GOAT_MOTION.rest + GOAT_MOTION.hop;
  assert.deepEqual(goatPose(goat, cycle + 0.1), { x: laneX(1), y: 0, lane: 1, hopping: false });
  assert.equal(goatPose(goat, cycle * 2 + 0.1).x, 0);
  const owl = createOwlBody(0);
  assert.equal(catchesGoat(owl, goat, 0.5, 0.2), true);
  assert.equal(catchesGoat(owl, goat, GOATS.reachZ + 0.1, 0.2), false);
  assert.equal(catchesGoat(owl, goat, 0, cycle + 0.1), false, "kózka na sąsiednim torze");
  assert.equal(catchesGoat(createOwlBody(1), goat, 0, cycle + 0.1), true);
});

test("kózki: pięć rodzajów, losowanie z wagami bez powtórzenia poprzedniej", () => {
  assert.deepEqual([...GOAT_ORDER].sort(), Object.keys(GOATS.weights).sort());
  const random = createRng("kozy").next;
  const counts = {};
  let last = null;
  for (let index = 0; index < 3000; index += 1) {
    const kind = pickGoat(random, last);
    assert.notEqual(kind, last);
    counts[kind] = (counts[kind] || 0) + 1;
    last = kind;
  }
  for (const kind of GOAT_ORDER) assert.ok(counts[kind] > 400, `${kind}: ${counts[kind]}`);
  assert.ok(counts.tarcza > counts.turbo, "tarcza częściej niż Kózia jazda");
});

// Bieg w trybie bezpiecznym bez sterowania przez całą planszę; zbiera kózki, serduszka i liście, które się pojawiły.
function scanStage(seed, startStage = 0) {
  const run = createRun({ seed, difficulty: "arcade", safe: true, startStage });
  const goats = new Set();
  const hearts = new Set();
  const rainbows = new Set();
  const obstacles = new Set();
  const patterns = [];
  for (let time = 0; time < 120 && run.state.phase === "run"; time += STEP) {
    run.update(STEP);
    for (const event of run.takeEvents()) if (event.type === "pattern") patterns.push(event);
    for (const goat of run.state.goats) goats.add(goat);
    for (const heart of run.state.hearts) hearts.add(heart);
    for (const leaf of run.state.leaves) if (leaf.kind === "teczowy") rainbows.add(leaf);
    for (const item of run.state.obstacles) obstacles.add(item);
  }
  return { run, goats: [...goats], hearts: [...hearts], rainbows: [...rainbows], obstacles: [...obstacles], patterns };
}

test("kózki i serduszka stoją w odstępach między wzorami (nigdy przy przeszkodzie), nie w ostatnich 150 m", () => {
  for (const seed of [1, 2, 3, 4]) {
    const { goats, hearts, obstacles, patterns } = scanStage(seed);
    assert.ok(goats.length >= 2, `ziarno ${seed}: kózki ${goats.length}`);
    for (const item of [...goats, ...hearts]) {
      assert.ok(item.at < TRACK.stageLength - GOATS.lastClear);
      const inside = patterns.some((pattern) => item.at > pattern.start && item.at < pattern.start + pattern.length);
      assert.equal(inside, false, `ziarno ${seed}: dodatek na ${item.at} m we wzorze`);
      for (const obstacle of obstacles) {
        const depth = obstacleShape(obstacle.kind).depth;
        assert.ok(item.at < obstacle.at - 3 || item.at > obstacle.at + depth + 3, `przeszkoda przy ${item.at} m`);
      }
    }
    const goatSpots = goats.map((item) => item.at);
    for (let index = 1; index < goatSpots.length; index += 1) {
      assert.ok(goatSpots[index] - goatSpots[index - 1] >= GOATS.every[0]);
    }
    for (const goat of goats) assert.equal(Math.abs(goat.lanes[1] - goat.lanes[0]), 1);
    const heartSpots = hearts.map((item) => item.at);
    for (let index = 1; index < heartSpots.length; index += 1) {
      assert.ok(heartSpots[index] - heartSpots[index - 1] >= EXTRA_LIFE.every[0]);
    }
  }
});

test("tęczowy liść tylko w oddechach, najczęściej na festiwalu roślin", () => {
  let festival = 0;
  let shop = 0;
  for (let seed = 1; seed <= 10; seed += 1) {
    const one = scanStage(`tecza-${seed}`, 0);
    const two = scanStage(`tecza-${seed}`, 1);
    shop += one.rainbows.length;
    festival += two.rainbows.length;
    for (const { rainbows, patterns } of [one, two]) {
      for (const leaf of rainbows) {
        const host = patterns.find((pattern) => leaf.at >= pattern.start && leaf.at <= pattern.start + pattern.length);
        assert.ok(host && host.id.includes("oddech"), `tęczowy liść poza oddechem: ${host?.id}`);
      }
    }
  }
  assert.ok(festival > shop, `festiwal ${festival}, Biedronka ${shop}`);
  assert.ok(festival > 0);
});

// Bieg bez przeszkód (tylko oddechy) do sprawdzania efektów.
function calmRun(options = {}) {
  const breathers = [
    { id: "cisza", tier: 0, length: 14, tags: ["breather"], stages: null, items: [] },
    {
      id: "liscie",
      tier: 0,
      length: 14,
      tags: ["pusty"],
      stages: null,
      items: [-1, 0, 1].flatMap((lane) => [0, 3, 6, 9].map((z) => ({ type: "leaf", lane, z, y: LEAVES.height }))),
    },
  ];
  return createRun({ seed: "spokój", difficulty: "arcade", patterns: breathers, ...options });
}

function advance(run, seconds) {
  const seen = [];
  for (let time = 0; time < seconds; time += STEP) {
    run.update(STEP);
    seen.push(...run.takeEvents());
  }
  return seen;
}

test("Sprężynka: od razu super-skok (szczyt ok. 2,1 m); Tarcza: przyjmuje jedno trafienie i znika po 15 s", () => {
  const run = calmRun();
  advance(run, 0.5);
  run.giveGoat("sprezynka");
  let peak = 0;
  const seen = [];
  for (let time = 0; time < 1.2; time += STEP) {
    run.update(STEP);
    seen.push(...run.takeEvents());
    peak = Math.max(peak, run.state.owl.y);
  }
  assert.ok(seen.some((event) => event.type === "spring"));
  assert.ok(Math.abs(peak - GOATS.springVelocity ** 2 / (2 * OWL.gravity)) < 0.1, `szczyt ${peak}`);
  assert.equal(run.state.goatCount, 1);

  const shielded = createRun({ seed: 5, difficulty: "arcade" });
  shielded.giveGoat("tarcza");
  assert.equal(shielded.state.powerups.tarcza, GOATS.duration.tarcza);
  const events = [];
  for (let time = 0; time < 30 && shielded.state.hits === 0; time += STEP) {
    shielded.update(STEP);
    events.push(...shielded.takeEvents());
  }
  const shieldAt = events.findIndex((event) => event.type === "shield");
  assert.ok(shieldAt >= 0, "tarcza przyjęła trafienie");
  assert.equal(shielded.state.lives, shielded.state.maxLives - 1, "drugie trafienie już zabiera życie");
  assert.equal(shielded.state.powerups.tarcza, undefined);
  const late = calmRun();
  late.giveGoat("tarcza");
  const ended = advance(late, GOATS.duration.tarcza + 0.1);
  assert.ok(ended.some((event) => event.type === "powerupEnd" && event.kind === "tarcza"));
});

test("Magnes przyciąga liście z sąsiednich torów, Podwajaczka podwaja liście; oba mijają po swoim czasie", () => {
  const plain = calmRun();
  const plainLanes = advance(plain, 12)
    .filter((event) => event.type === "leaf")
    .map((event) => event.lane);
  assert.ok(plainLanes.length > 0 && plainLanes.every((lane) => lane === 0), "bez magnesu tylko własny tor");
  const magnet = calmRun();
  magnet.giveGoat("magnes");
  const pulled = advance(magnet, 12).filter((event) => event.type === "leaf" && event.lane !== 0);
  assert.ok(pulled.length >= 8, `liście z sąsiednich torów: ${pulled.length}`);
  assert.equal(magnet.state.powerups.magnes, undefined, "magnes mija po 8 s");

  const double = calmRun();
  double.giveGoat("podwajaczka");
  const seen = advance(double, 5);
  const leaf = seen.find((event) => event.type === "leaf");
  assert.equal(leaf.count, 2);
  assert.equal(leaf.multiplier, 2);
  assert.ok(double.state.powerups.podwajaczka > 0);
});

test("Kózia jazda: 8 s szybciej, bez trafień i z automatycznym skokiem nad przeszkodami; potem 1,5 s nietykalności", () => {
  const run = createRun({ seed: 7, difficulty: "arcade" });
  advance(run, 3);
  const before = run.state.speed;
  run.giveGoat("turbo");
  const seen = advance(run, 0.1);
  assert.ok(seen.some((event) => event.type === "rideStart"));
  assert.ok(run.state.speed > before * 1.1);
  const during = advance(run, GOATS.duration.turbo);
  assert.equal(run.state.hits, 0, "bez sterowania i bez trafień na kozie");
  assert.ok(
    during.some((event) => event.type === "rideHop"),
    "koza przeskakuje przeszkody",
  );
  assert.ok(during.some((event) => event.type === "rideEnd"));
  assert.equal(run.state.riding, 0);
  assert.ok(run.state.invulnerable > 1);
});

test("Gorączka Monster: tęczowy liść (100 pkt) → 8 s liści ×2 i deszcz liści poza przeszkodami, bez nowych przeszkód", () => {
  const run = createRun({ seed: 11, difficulty: "arcade", safe: true });
  advance(run, 4);
  const obstaclesBefore = run.state.obstacles.length;
  const leavesBefore = run.state.leaves.length;
  // Tęczowy liść prosto pod sową.
  run.state.leaves.unshift({ lane: run.state.owl.lane, at: run.state.stageDistance + 0.2, y: 0.6, kind: "teczowy" });
  const seen = advance(run, STEP * 2);
  const rainbow = seen.find((event) => event.type === "leaf" && event.kind === "teczowy");
  assert.equal(rainbow.points, FEVER.points * rainbow.combo);
  assert.ok(seen.some((event) => event.type === "fever"));
  assert.equal(run.state.fever > FEVER.duration - 0.1, true);
  assert.equal(run.state.obstacles.length, obstaclesBefore);
  assert.ok(run.state.leaves.length > leavesBefore + 20, "deszcz liści");
  for (const leaf of run.state.leaves.filter((item) => item.extra)) {
    for (const item of run.state.obstacles) {
      if (item.lane !== leaf.lane && item.moveTo !== leaf.lane) continue;
      const depth = obstacleShape(item.kind).depth;
      assert.ok(leaf.at <= item.at - FEVER.rainClear || leaf.at >= item.at + depth + FEVER.rainClear);
    }
  }
  const next = advance(run, 3).find((event) => event.type === "leaf" && event.kind === "zielony");
  assert.equal(next.multiplier, FEVER.multiplier);
  const after = advance(run, FEVER.duration);
  assert.ok(after.some((event) => event.type === "feverEnd"));
  assert.equal(run.state.fevers, 1);
});

test("serduszko: dodatkowe życie, a przy pełnych życiach +150 pkt; power-upy kończą się na mecie", () => {
  const run = calmRun();
  run.state.lives = run.state.maxLives - 1;
  run.state.hearts.push({ at: run.state.stageDistance + 3, lane: 0, taken: false });
  const seen = advance(run, 0.5);
  assert.ok(seen.some((event) => event.type === "life"));
  assert.equal(run.state.lives, run.state.maxLives);
  run.state.hearts.push({ at: run.state.stageDistance + 3, lane: 0, taken: false });
  const bonus = advance(run, 0.5).find((event) => event.type === "lifeBonus");
  assert.equal(bonus.bonus, EXTRA_LIFE.fullBonus);
  run.giveGoat("magnes");
  run.giveGoat("turbo");
  run.warp(TRACK.stageLength);
  advance(run, 0.2);
  assert.equal(run.state.phase, "finale");
  assert.deepEqual(run.state.powerups, {});
  assert.equal(run.state.riding, 0);
});

test("dodatki mają osobny generator: to samo ziarno — te same kózki; kózki nie zmieniają trasy przeszkód", () => {
  const first = scanStage(21);
  const second = scanStage(21);
  assert.deepEqual(
    first.goats.map((item) => [item.kind, item.at]),
    second.goats.map((item) => [item.kind, item.at]),
  );
  assert.deepEqual(
    first.patterns.map((item) => item.id),
    second.patterns.map((item) => item.id),
  );
});
