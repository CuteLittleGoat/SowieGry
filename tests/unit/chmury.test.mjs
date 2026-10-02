// Sowa w Chmurach (Analiza 3, E6a): fizyka sowy (wybicie, przejście przez krawędź, przeciąganie względne,
// klawiatura), sześć typów platform, generator z gwarancją przejścia, ratunek zamiast upadku, punktacja, strefy
// i autopilot, który wspina się na każdym poziomie bez ratunku. Testy rdzenia biegną bez przeszkód
// (`hazards: false`); przeszkody Pracu i Amic — tests/unit/chmury-przeszkody.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  APEX,
  CAMERA,
  DIFFICULTIES,
  GENERATOR,
  OWL,
  PLATFORM_TYPES,
  RESCUE,
  SCORE,
  SWING,
  WORLD,
  ZONES,
} from "../../SowaWChmurach/config.js";
import { comboLevel, createRun, perfectBonus, zoneAt } from "../../SowaWChmurach/game.js";
import { MAX_GAP, baseGap, createGenerator, hardChance, xRange } from "../../SowaWChmurach/generator.js";
import { apexOf, createOwlBody, flightTime, steerBy, stepOwl, wrapDelta, wrapX } from "../../SowaWChmurach/physics.js";
import { createPlatform, isPerfect, land, landsOn, platformX, updatePlatforms } from "../../SowaWChmurach/platforms.js";
import { createRng } from "../../shared/engine/rng.js";

const STEP = 1 / 120;
const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} ≠ ${expected} ± ${tolerance}`);

// Autopilot: po każdym odbiciu wybiera najniższą osiągalną platformę nad sobą (bez kruchych gałązek) i przesuwa
// sowę nad jej środek (jak przeciąganie palcem).
function autopilot(run, { goal, maxTime = 900, onEvent = () => {} }) {
  let base = 0;
  let velocity = OWL.jumpVelocity;
  let target = null;
  while (run.state.height < goal && run.state.phase !== "over" && run.state.time < maxTime) {
    const state = run.state;
    if (state.phase === "run") {
      const reach = base + apexOf(velocity) * 0.92;
      if (!target || target.spent || target.gone) {
        target = null;
        for (const item of state.platforms) {
          if (item.spent || item.gone || item.type === "krucha") continue;
          if (item.y > base + 0.3 && item.y <= reach && (!target || item.y < target.y)) target = item;
        }
      }
      state.owl.pending = 0;
      if (target) run.steer(wrapDelta(state.owl.x, target.x) / OWL.drag);
    }
    run.update(STEP);
    for (const event of run.takeEvents()) {
      onEvent(event);
      if (event.type === "bounce" || event.type === "rescued") {
        base = state.owl.y;
        velocity = state.owl.vy;
        target = null;
      }
    }
  }
  return run;
}

test("sowa: wybicie 15,5 m/s — szczyt ok. 4 m po ok. 0,52 s; lot do platformy 3,3 m wyżej", () => {
  near(APEX, 4.0, 0.01, "szczyt");
  near(apexOf(), APEX, 1e-9, "apexOf");
  const owl = createOwlBody(4.5, 0);
  owl.vy = OWL.jumpVelocity;
  let top = 0;
  let time = 0;
  while (owl.vy > 0) {
    stepOwl(owl, {}, STEP);
    time += STEP;
    top = Math.max(top, owl.y);
  }
  near(top, APEX, 0.08, "szczyt w symulacji");
  near(time, OWL.jumpVelocity / OWL.gravity, 0.02, "czas do szczytu");
  assert.ok(flightTime(MAX_GAP) > 0.6 && flightTime(MAX_GAP) < 0.8);
  assert.equal(flightTime(APEX + 0.1), null);
});

test("sowa: przejście przez krawędź kolumny i najkrótsza odległość w bok", () => {
  assert.equal(wrapX(9.5), 0.5);
  assert.equal(wrapX(-0.25), 8.75);
  near(wrapDelta(8.5, 0.5), 1, 1e-9, "w prawo przez krawędź");
  near(wrapDelta(0.5, 8.5), -1, 1e-9, "w lewo przez krawędź");
  near(wrapDelta(2, 6), 4, 1e-9, "bez krawędzi");
  const owl = createOwlBody(8.9, 10);
  steerBy(owl, 0.4 / OWL.drag);
  for (let index = 0; index < 10; index += 1) stepOwl(owl, {}, STEP);
  near(owl.x, 0.3, 1e-6, "po przejściu");
});

test("przeciąganie: sowa przesuwa się o przesunięcie palca × 1,25, najwyżej 14 m/s, bez dryfu po puszczeniu", () => {
  const owl = createOwlBody(2, 10);
  steerBy(owl, 2);
  stepOwl(owl, {}, STEP);
  near(owl.x, 2 + OWL.dragSpeed * STEP, 1e-9, "limit prędkości");
  for (let index = 0; index < 60; index += 1) stepOwl(owl, {}, STEP);
  near(owl.x, 2 + 2 * OWL.drag, 1e-9, "pełne przesunięcie");
  assert.equal(owl.vx, 0, "bez dryfu");
  assert.equal(owl.facing, 1);
  steerBy(owl, -0.5);
  stepOwl(owl, {}, STEP);
  assert.equal(owl.facing, -1);
});

test("klawiatura: ←/→ przyspieszają do 9 m/s, bez klawisza sowa wyhamowuje", () => {
  const owl = createOwlBody(4.5, 10);
  for (let index = 0; index < 60; index += 1) stepOwl(owl, { right: true }, STEP);
  near(owl.vx, OWL.keySpeed, 1e-9, "prędkość");
  for (let index = 0; index < 120; index += 1) stepOwl(owl, {}, STEP);
  assert.equal(owl.vx, 0);
  for (let index = 0; index < 30; index += 1) stepOwl(owl, { left: true, right: true }, STEP);
  assert.equal(owl.vx, 0, "oba klawisze — stoi");
});

test("platformy: sześć typów, lądowanie tylko z góry, w zasięgu stóp, także przez krawędź", () => {
  assert.deepEqual(Object.keys(PLATFORM_TYPES), ["galazka", "lisc", "chmurka", "hustawka", "balkon", "krucha"]);
  const platform = createPlatform("galazka", 4, 10);
  const owl = createOwlBody(4.5, 9.98);
  owl.vy = -5;
  assert.equal(landsOn(owl, 10.02, platform), true);
  assert.equal(landsOn({ ...owl, vy: 5 }, 10.02, platform), false, "od dołu przelatuje");
  assert.equal(landsOn(owl, 9.99, platform), false, "był już pod spodem");
  assert.equal(landsOn({ ...owl, x: 4 + 0.95 + OWL.foot + 0.01 }, 10.02, platform), false, "za daleko w bok");
  const edge = createPlatform("galazka", 1, 10);
  assert.equal(landsOn({ ...owl, x: 8.9 }, 10.02, edge), true, "przez krawędź");
  assert.equal(isPerfect({ x: 4.2 }, platform), true);
  assert.equal(isPerfect({ x: 4.4 }, platform), false);
  assert.throws(() => createPlatform("trampolina", 1, 1), /Nieznany typ/);
});

test("platformy: liść Monstery wybija wyżej (+10 pkt), chmurka znika po odbiciu, krucha gałązka łamie się bez odbicia", () => {
  const leaf = createPlatform("lisc", 4, 10);
  assert.deepEqual(land(leaf), { bounce: 1.45, points: 10 });
  assert.ok(apexOf(OWL.jumpVelocity * 1.45) > 8);
  const cloud = createPlatform("chmurka", 4, 10);
  assert.equal(land(cloud).bounce, 1);
  assert.equal(cloud.spent, true);
  updatePlatforms([cloud], 0, 0.2);
  assert.equal(cloud.gone, false);
  updatePlatforms([cloud], 0, 0.2);
  assert.equal(cloud.gone, true);
  const brittle = createPlatform("krucha", 4, 10);
  assert.equal(land(brittle).bounce, 0);
  assert.equal(brittle.spent, true);
  assert.equal(landsOn({ x: 4, y: 9.9, vy: -3 }, 10.1, brittle), false, "złamana nie przyjmie lądowania");
});

test("platformy: huśtawka kołysze się ±1,4 m w 3,2 s, balkon jest szeroki", () => {
  const swing = createPlatform("hustawka", 4.5, 10, { phase: 0 });
  near(platformX(swing, SWING.period / 4), 4.5 + SWING.amplitude, 1e-9, "wychylenie");
  near(platformX(swing, SWING.period), 4.5, 1e-9, "okres");
  updatePlatforms([swing], SWING.period * 0.75, STEP);
  near(swing.x, 4.5 - SWING.amplitude, 1e-9, "w drugą stronę");
  assert.ok(PLATFORM_TYPES.balkon.width > 3);
  const [min, max] = xRange("hustawka");
  assert.ok(min - SWING.amplitude - PLATFORM_TYPES.hustawka.width / 2 >= 0);
  assert.ok(max + SWING.amplitude + PLATFORM_TYPES.hustawka.width / 2 <= WORLD.width);
});

function generate(seed, difficulty, until = 2000) {
  const platforms = [];
  const leaves = [];
  const generator = createGenerator({ random: createRng(seed).next, difficulty });
  generator.fill(until, platforms, leaves);
  return { platforms, leaves, path: platforms.filter((item) => item.path) };
}

test("generator: ścieżka zawsze osiągalna — odstęp ≤ 82% szczytu wybicia, krok w bok ≤ 3,6 m (także bez chmurek), wszystko w kolumnie", () => {
  for (const difficulty of Object.keys(DIFFICULTIES)) {
    for (const seed of ["a", "b", "c"]) {
      const { platforms, path } = generate(`gen-${seed}`, difficulty);
      assert.equal(path[0].y, GENERATOR.firstY);
      assert.ok(MAX_GAP < APEX);
      for (let index = 1; index < path.length; index += 1) {
        const gap = path[index].y - path[index - 1].y;
        // Za chmurką odstęp może być mniejszy (0,6 m) — platforma za nią musi być osiągalna i bez chmurki.
        assert.ok(gap >= 0.6 - 1e-9 && gap <= MAX_GAP + 1e-9, `${difficulty} odstęp ${gap}`);
      }
      // Chmurka znika po odbiciu: ścieżka bez chmurek też jest osiągalna (odstęp i krok od ostatniej pewnej).
      const solid = path.filter((item) => item.type !== "chmurka");
      for (let index = 1; index < solid.length; index += 1) {
        const gap = solid[index].y - solid[index - 1].y;
        assert.ok(gap <= MAX_GAP + 1e-9, `${difficulty} bez chmurki: ${gap}`);
        const step = Math.abs(solid[index].baseX - solid[index - 1].baseX);
        if (solid[index].type !== "balkon") assert.ok(step <= GENERATOR.maxStep + 1e-9, `krok ${step}`);
      }
      for (const item of platforms) {
        const [min, max] = xRange(item.type);
        assert.ok(item.baseX >= min - 1e-9 && item.baseX <= max + 1e-9, `${item.type} poza kolumną`);
      }
      assert.ok(
        path.every((item) => item.type !== "krucha"),
        "krucha gałązka nigdy na ścieżce",
      );
    }
  }
});

test("generator: trudne platformy od swoich wysokości, najwyżej 2 pod rząd; balkon co 150 m; pułapki z dala od ścieżki", () => {
  const { platforms, path } = generate("gen-typy", "chaos", 3000);
  for (const item of platforms) {
    if (GENERATOR.hardFrom[item.type] !== undefined) assert.ok(item.y >= GENERATOR.hardFrom[item.type], item.type);
  }
  let run = 0;
  for (const item of path) {
    run = item.type === "chmurka" || item.type === "hustawka" ? run + 1 : 0;
    assert.ok(run <= GENERATOR.hardStreak);
  }
  const balconies = path.filter((item) => item.type === "balkon").map((item) => Math.floor(item.y / 150));
  assert.deepEqual(
    balconies,
    Array.from({ length: 20 }, (_, index) => index + 1),
  );
  for (const type of ["lisc", "chmurka", "hustawka", "krucha", "galazka"]) {
    assert.ok(
      platforms.some((item) => item.type === type),
      type,
    );
  }
  for (const trap of platforms.filter((item) => !item.path)) {
    const neighbours = path.filter((item) => Math.abs(item.y - trap.y) < MAX_GAP);
    for (const item of neighbours.filter((other) => other.y < trap.y).slice(-1)) {
      assert.ok(Math.abs(wrapDelta(item.baseX, trap.baseX)) >= GENERATOR.extraSpacing - 1e-9);
    }
  }
  assert.equal(hardChance("chmurka", 10, "arcade"), 0);
  assert.ok(hardChance("chmurka", 500, "chaos") > hardChance("chmurka", 500, "chill"));
});

test("generator: odstępy rosną z wysokością, Chill bliżej niż Chaos; powtarzalność z ziarnem; liście nad ścieżką", () => {
  assert.ok(baseGap(0) < baseGap(600) && baseGap(600) < baseGap(1200));
  assert.ok(baseGap(800, "chill") < baseGap(800, "arcade") && baseGap(800, "arcade") < baseGap(800, "chaos"));
  assert.ok(baseGap(5000, "chaos") <= MAX_GAP);
  const first = generate("powtorz", "arcade", 500);
  const second = generate("powtorz", "arcade", 500);
  assert.deepEqual(
    first.platforms.map((item) => [item.type, item.x, item.y]),
    second.platforms.map((item) => [item.type, item.x, item.y]),
  );
  const { leaves, path } = generate("liscie", "arcade", 1500);
  assert.ok(leaves.length > 100);
  assert.ok(leaves.some((leaf) => leaf.kind === "zloty"));
  for (const leaf of leaves) {
    assert.ok(path.some((item) => Math.abs(item.baseX - leaf.x) < 1e-9 && leaf.y > item.y && leaf.y - item.y < APEX));
  }
});

test("bieg: start z ziemi ogródka, kamera tylko w górę, wynik = wysokość + liście + premie", () => {
  const run = createRun({ seed: "start", hazards: false });
  assert.equal(run.state.owl.y, 0);
  assert.equal(run.state.owl.vy, OWL.jumpVelocity);
  assert.equal(run.state.lives, DIFFICULTIES.arcade.lives);
  autopilot(run, { goal: 120 });
  const state = run.state;
  assert.ok(state.cameraBottom > 100);
  assert.ok(state.cameraBottom <= state.height - CAMERA.owlShare * WORLD.height + 1e-6);
  assert.equal(state.score, Math.floor(state.height) + state.leafPoints + state.bonusPoints);
  assert.ok(state.platforms.every((item) => item.y >= state.cameraBottom - CAMERA.behind || item === state.lastSafe));
  assert.ok(Math.max(...state.platforms.map((item) => item.y)) >= state.cameraBottom + CAMERA.ahead - MAX_GAP);
});

test("bieg: liście (złoty = 5 liści, 50 pkt) i combo co 8 w serii; idealne lądowania 2 pkt × seria", () => {
  assert.equal(comboLevel(0), 1);
  assert.equal(comboLevel(8), 2);
  assert.equal(comboLevel(100), SCORE.comboMax);
  assert.equal(perfectBonus(1), 2);
  assert.equal(perfectBonus(4), 8);
  assert.equal(perfectBonus(30), 20);
  const run = createRun({ seed: "liscie", hazards: false });
  const events = [];
  autopilot(run, { goal: 400, onEvent: (event) => events.push(event) });
  const leaves = events.filter((event) => event.type === "leaf");
  assert.ok(leaves.length > 10);
  for (const event of leaves) {
    assert.equal(event.points, (event.kind === "zloty" ? 50 : 10) * event.combo);
    assert.equal(event.count, event.kind === "zloty" ? 5 : 1);
  }
  assert.equal(
    run.state.leafCount,
    leaves.reduce((sum, event) => sum + event.count, 0),
  );
  const perfects = events.filter((event) => event.type === "perfect");
  assert.ok(perfects.length > 5);
  for (const event of perfects) assert.equal(event.bonus, perfectBonus(event.streak));
  assert.ok(events.some((event) => event.type === "combo" && event.combo >= 2));
  assert.ok(run.state.bestStreak >= 2);
});

test("ratunek: upadek pod ekran — kózka odnosi sowę na ostatnią pewną platformę (−1 życie), po ostatnim życiu koniec", () => {
  const run = createRun({ seed: "upadek", hazards: false });
  autopilot(run, { goal: 60 });
  const events = [];
  for (let fall = 1; fall <= 3; fall += 1) {
    const state = run.state;
    state.owl.y = state.cameraBottom - CAMERA.fallMargin - 0.5;
    state.owl.vy = -10;
    run.update(STEP);
    events.push(...run.takeEvents());
    if (fall < 3) {
      assert.equal(state.phase, "rescue");
      assert.equal(state.lives, DIFFICULTIES.arcade.lives - fall);
      const target = state.rescue.target;
      assert.ok(PLATFORM_TYPES[target.type].solid);
      assert.ok(target.y >= state.cameraBottom + RESCUE.minAbove);
      for (let index = 0; index < 120 * RESCUE.duration + 2; index += 1) run.update(STEP);
      events.push(...run.takeEvents());
      assert.equal(state.phase, "run");
      near(state.owl.y, target.y, 0.2, "sowa na platformie");
      assert.ok(state.invulnerable > 0);
    }
  }
  assert.equal(run.state.phase, "over");
  assert.equal(run.state.endReason, "upadek");
  assert.deepEqual(
    events.map((event) => event.type).filter((type) => ["rescue", "rescued", "over"].includes(type)),
    ["rescue", "rescued", "rescue", "rescued", "over"],
  );
  assert.equal(run.summary().rescues, 3);
});

test("ratunek: Tryb Przytulny zostawia ostatnie życie, tryb bezpieczny nie zabiera życia; koniec na życzenie", () => {
  const cozy = createRun({ seed: "przytulny", difficulty: "chill", cozy: true, hazards: false });
  assert.equal(cozy.state.cozy, true);
  for (let fall = 0; fall < 6; fall += 1) {
    cozy.state.owl.y = cozy.state.cameraBottom - 3;
    cozy.update(STEP);
    for (let index = 0; index < 200; index += 1) cozy.update(STEP);
  }
  assert.equal(cozy.state.lives, 1);
  assert.notEqual(cozy.state.phase, "over");
  assert.equal(createRun({ difficulty: "arcade", cozy: true }).state.cozy, false, "tylko na Chill");
  const safe = createRun({ seed: "bezpieczny", safe: true, hazards: false });
  safe.state.owl.y = safe.state.cameraBottom - 3;
  safe.update(STEP);
  assert.equal(safe.state.lives, DIFFICULTIES.arcade.lives);
  safe.end("gracz");
  assert.equal(safe.state.phase, "over");
  assert.deepEqual(safe.takeEvents().at(-1), { type: "over", reason: "gracz" });
});

test("bieg: krucha gałązka łamie się pod sową, chmurka znika po odbiciu", () => {
  const run = createRun({ seed: "pulapki", hazards: false });
  const owl = run.state.owl;
  run.state.platforms = [createPlatform("krucha", 4.5, 5, { path: false }), createPlatform("chmurka", 4.5, 3)];
  owl.x = 4.5;
  owl.y = 5.05;
  owl.vy = -2;
  run.state.leaves = [];
  let first = [];
  for (let index = 0; index < 30 && first.length === 0; index += 1) {
    run.update(STEP);
    first = run.takeEvents();
  }
  assert.equal(first[0].type, "crack");
  assert.ok(owl.vy < 0 && owl.y < 5, "bez odbicia");
  for (let index = 0; index < 120 && !run.state.platforms[1].spent; index += 1) run.update(STEP);
  const events = run.takeEvents().map((event) => event.type);
  assert.ok(events.includes("bounce") && events.includes("puff"));
  assert.ok(owl.vy > 0);
});

test("strefy: Ogródek → Blok (150 m) → Chmury (400 m) → Zorza (800 m) → Kosmos (1500 m)", () => {
  assert.deepEqual(
    ZONES.map((zone) => [zone.id, zone.from]),
    [
      ["ogrodek", 0],
      ["blok", 150],
      ["chmury", 400],
      ["zorza", 800],
      ["kosmos", 1500],
    ],
  );
  assert.equal(zoneAt(149), 0);
  assert.equal(zoneAt(150), 1);
  assert.equal(zoneAt(2000), 4);
});

test("autopilot wspina się na 1600 m bez ratunku na każdym poziomie: strefy, balkony, pułapki ominięte", () => {
  for (const difficulty of Object.keys(DIFFICULTIES)) {
    for (const seed of ["auto-1", "auto-2"]) {
      const events = [];
      const run = autopilot(createRun({ seed, difficulty, hazards: false }), {
        goal: 1600,
        onEvent: (event) => events.push(event),
      });
      const state = run.state;
      assert.ok(state.height >= 1600, `${difficulty}/${seed}: ${state.height} m`);
      assert.equal(state.rescues, 0, `${difficulty}/${seed}: ratunki`);
      assert.equal(state.lives, DIFFICULTIES[difficulty].lives);
      assert.deepEqual(
        events.filter((event) => event.type === "zone").map((event) => event.id),
        ["blok", "chmury", "zorza", "kosmos"],
      );
      assert.ok(events.filter((event) => event.type === "balcony").length >= 6);
      assert.ok(events.some((event) => event.type === "bounce" && event.platform === "lisc"));
      assert.ok(events.some((event) => event.type === "puff"));
      // Tempo jak w krótkiej sesji na telefonie: Ogródek (150 m) w niecałą minutę.
      assert.ok(state.time < 700);
    }
  }
});

test("warp (testy): sowa wyżej na balkonie, trasa dalej osiągalna", () => {
  const run = createRun({ seed: "warp", hazards: false });
  run.warp(500);
  const state = run.state;
  assert.ok(state.owl.y >= 500);
  assert.equal(state.lastSafe.type, "balkon");
  assert.equal(state.zone, zoneAt(state.height));
  autopilot(run, { goal: 600 });
  assert.ok(run.state.height >= 600);
  assert.equal(run.state.rescues, 0);
  const summary = run.summary();
  assert.deepEqual(Object.keys(summary).sort(), [
    "bestCombo",
    "bestStreak",
    "bounces",
    "difficulty",
    "height",
    "hits",
    "leaves",
    "perfects",
    "rescues",
    "score",
    "stomps",
    "zone",
  ]);
});
