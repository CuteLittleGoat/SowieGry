// Sowa w Chmurach (Analiza 3, E6c2): Niebiański Ocean — humbak-gejzer co ok. 300 m, fontanna zaczyna 20-sekundowy
// bonus: grzbiety humbaków wybijają, morze chmur nie pozwala spaść, liście w rzędach; potem powrót nad gejzer.
import assert from "node:assert/strict";
import { test } from "node:test";
import { OCEAN, OWL } from "../../SowaWChmurach/config.js";
import { createRun } from "../../SowaWChmurach/game.js";
import { createGenerator } from "../../SowaWChmurach/generator.js";
import { createGeyserPlanner, createOcean, inFountain, whaleX } from "../../SowaWChmurach/ocean.js";
import { apexOf, stepOwl } from "../../SowaWChmurach/physics.js";
import { createRng } from "../../shared/engine/rng.js";

const STEP = 1 / 120;
const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} ≠ ${expected} ± ${tolerance}`);

test("fontanna gejzeru: słup ±0,6 m nad humbakiem", () => {
  const geyser = { x: 4, y: 100 };
  assert.equal(inFountain({ x: 4.3, y: 101 }, geyser), true);
  assert.equal(inFountain({ x: 4.8, y: 101 }, geyser), false, "za daleko w bok");
  assert.equal(inFountain({ x: 4, y: 99.9 }, geyser), false, "za nisko");
  assert.equal(inFountain({ x: 4, y: 104 }, geyser), false, "za wysoko");
});

test("gejzery: pierwszy od 300 m, potem co 260–340 m, tylko na gałązce albo balkonie ścieżki", () => {
  const platforms = [];
  createGenerator({ random: createRng("ocean|trasa").next, difficulty: "arcade" }).fill(3000, platforms, []);
  const path = platforms.filter((item) => item.path);
  const planner = createGeyserPlanner({ random: createRng("ocean").next });
  const geysers = [];
  for (let index = 1; index < path.length; index += 1) planner.plan(path[index - 1], path[index], geysers);
  assert.ok(geysers[0].y >= OCEAN.first);
  assert.ok(geysers.length >= 7 && geysers.length <= 10, `${geysers.length} gejzerów`);
  for (let index = 1; index < geysers.length; index += 1) {
    assert.ok(geysers[index].y - geysers[index - 1].y >= OCEAN.every[0] - 1e-9);
  }
  for (const geyser of geysers) {
    const platform = path.find((item) => item.y === geyser.y);
    assert.ok(["galazka", "balkon"].includes(platform.type));
    assert.equal(geyser.x, platform.baseX);
  }
});

test("ocean: trzy humbaki-trampoliny, rzędy liści, morze chmur — upadek niemożliwy, koniec po 20 s", () => {
  const ocean = createOcean({ random: createRng("morze").next, base: 50, x: 4.5 });
  const { whales, leaves } = ocean.state;
  assert.deepEqual(
    whales.map((whale) => whale.level),
    [...OCEAN.levels],
  );
  for (const whale of whales)
    assert.ok(Math.abs(whale.speed) >= OCEAN.speed[0] && Math.abs(whale.speed) <= OCEAN.speed[1]);
  assert.equal(leaves.length, OCEAN.leafRows.length * OCEAN.leavesPerRow);
  assert.ok(leaves.some((leaf) => leaf.kind === "zloty"));
  // Sowa spada na grzbiet najniższego humbaka.
  const whale = whales[0];
  const owl = { x: whaleX(whale, 0), y: 50 + whale.level + 0.05, vy: -5 };
  const previous = owl.y;
  owl.y -= 0.1;
  const bounce = ocean.update(owl, previous, STEP);
  assert.equal(bounce[0].type, "oceanBounce");
  assert.equal(owl.vy, OCEAN.bounce);
  // Bez sterowania: nigdy pod morzem chmur, liście zbierane w locie.
  const body = { x: 0.3, y: 52, vx: 0, vy: 0, pending: 0, dragged: false, facing: 1 };
  let lowest = Infinity;
  let floors = 0;
  const collected = [];
  while (!ocean.done()) {
    const before = body.y;
    stepOwl(body, {}, STEP);
    for (const event of ocean.update(body, before, STEP)) {
      if (event.type === "oceanFloor") floors += 1;
      if (event.type === "oceanLeaf") collected.push(event);
    }
    lowest = Math.min(lowest, body.y);
  }
  assert.ok(lowest >= 50 - 1e-9, "nie spada pod bazę");
  assert.ok(floors >= 1);
  near(ocean.state.time, OCEAN.duration, STEP * 2, "20 s");
  for (const event of collected) assert.equal(event.points, OCEAN.points * event.count);
  assert.equal(
    ocean.state.collected,
    collected.reduce((sum, event) => sum + event.count, 0),
  );
});

test("ocean: każdy humbak osiągalny, najwyższe liście w zasięgu, całość pod HUD-em także w poziomie (widok 14,5 m)", () => {
  const jump = apexOf(OCEAN.bounce);
  assert.ok(apexOf(OCEAN.floorBounce) >= OCEAN.levels[0] + 0.5, "z morza chmur na pierwszego humbaka");
  for (let index = 1; index < OCEAN.levels.length; index += 1) {
    assert.ok(OCEAN.levels[index - 1] + jump >= OCEAN.levels[index] + 0.5, `humbak ${index + 1}`);
  }
  const top = OCEAN.levels.at(-1) + jump;
  assert.ok(OCEAN.leafRows.at(-1) + 0.3 <= top + OWL.center + OWL.reach - 0.2, "najwyższy rząd liści");
  assert.ok(OCEAN.baseAbove + top + OWL.drawSize <= 12.5, `szczyt skoku: ${OCEAN.baseAbove + top + OWL.drawSize} m`);
});

test("lot: fontanna zaczyna ocean, moce stoją, po 20 s sowa wraca nad gejzer z wybiciem i nietykalnością", () => {
  const run = createRun({ seed: "ocean-lot", hazards: false, extras: false });
  run.warp(120);
  for (let index = 0; index < 60; index += 1) run.update(STEP);
  const state = run.state;
  const height = state.height;
  const camera = state.cameraBottom;
  run.giveGoat("magnes");
  // Gejzer pod sową — sowa w fontannie.
  state.geysers.push({ x: state.owl.x, y: state.owl.y - 1, taken: false });
  run.update(STEP);
  const events = run.takeEvents();
  assert.ok(events.some((event) => event.type === "oceanStart"));
  assert.equal(state.phase, "ocean");
  const magnet = state.powerups.magnes;
  const geyser = state.ocean.geyser;
  const base = state.ocean.bonus.state.base;
  const all = [];
  let lowest = Infinity;
  while (state.phase === "ocean") {
    run.update(STEP);
    all.push(...run.takeEvents());
    if (state.phase === "ocean") lowest = Math.min(lowest, state.owl.y);
  }
  assert.ok(lowest >= base - 1e-9);
  assert.equal(state.powerups.magnes, magnet, "moce stoją w oceanie");
  assert.equal(state.height, height, "ocean nie liczy się do wysokości");
  assert.equal(state.cameraBottom, camera);
  const end = all.find((event) => event.type === "oceanEnd");
  assert.ok(end);
  assert.equal(state.rescues, 0);
  near(state.owl.x, geyser.x, 1e-9, "nad gejzerem");
  near(state.owl.y, geyser.y + 0.5, 0.3, "nad gejzerem");
  assert.ok(state.invulnerable >= OCEAN.exitInvulnerable - 0.1);
  assert.ok(state.owl.vy > OWL.jumpVelocity);
  assert.equal(run.summary().oceans, 1);
  assert.equal(geyser.taken, true);
});

test("gejzery na trasie lotu (z dodatkami) i ocean z haka testowego", () => {
  const run = createRun({ seed: "ocean-trasa", hazards: false });
  run.warp(320);
  assert.ok(run.state.geysers.length >= 1, "gejzer przed sową");
  run.giveOcean();
  assert.equal(run.state.phase, "ocean");
  for (let index = 0; index < 120 * (OCEAN.duration + 0.5); index += 1) run.update(STEP);
  assert.equal(run.state.phase, "run");
});
