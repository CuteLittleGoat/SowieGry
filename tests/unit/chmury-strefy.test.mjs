// Sowa w Chmurach (Analiza 3, E6d): oprawa stref (udziały stref zgodne z kolorami nieba, rysowanie każdej strefy)
// i przechylanie telefonu (kąt w bok według obrotu ekranu, martwa strefa, nasycenie, ruch sowy, pierwszeństwo
// przeciągania i klawiatury).
import assert from "node:assert/strict";
import { test } from "node:test";
import { TILT, WORLD, ZONES } from "../../SowaWChmurach/config.js";
import { createRun } from "../../SowaWChmurach/game.js";
import { createOwlBody, stepOwl, steerBy, wrapDelta } from "../../SowaWChmurach/physics.js";
import { mix, skyAt } from "../../SowaWChmurach/render.js";
import { BLEND, createScenery, zoneWeights } from "../../SowaWChmurach/scenery.js";
import { sideAngle, tiltSpeed } from "../../SowaWChmurach/tilt.js";

const STEP = 1 / 120;
const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} ≠ ${expected} ± ${tolerance}`);

// Atrapa kontekstu 2D: liczy wypełnienia i obrysy, pamięta przezroczystość.
function fakeContext() {
  const calls = { fill: 0, stroke: 0, fillRect: 0 };
  const target = {
    globalAlpha: 1,
    calls,
    createLinearGradient: () => ({ addColorStop() {} }),
    fill: () => (calls.fill += 1),
    stroke: () => (calls.stroke += 1),
    fillRect: () => (calls.fillRect += 1),
  };
  return new Proxy(target, {
    get: (object, key) => (key in object ? object[key] : () => {}),
    set: (object, key, value) => {
      object[key] = value;
      return true;
    },
  });
}

test("strefy: udziały w oprawie sumują się do 1 i przechodzą płynnie w ostatnich 60 m — jak kolory nieba", () => {
  assert.equal(BLEND, 60);
  assert.deepEqual(zoneWeights(0), [1, 0, 0, 0, 0]);
  assert.deepEqual(zoneWeights(ZONES[1].from), [0, 1, 0, 0, 0]);
  assert.deepEqual(zoneWeights(5000), [0, 0, 0, 0, 1]);
  const half = zoneWeights(ZONES[2].from - BLEND / 2);
  near(half[1], 0.5, 1e-9, "połowa przejścia Blok → Chmury");
  near(half[2], 0.5, 1e-9, "połowa przejścia Blok → Chmury");
  for (let height = 0; height <= 2200; height += 7) {
    const weights = zoneWeights(height);
    near(
      weights.reduce((sum, value) => sum + value, 0),
      1,
      1e-9,
      `suma na ${height} m`,
    );
    assert.ok(weights.filter((value) => value > 0).length <= 2, `najwyżej dwie strefy na ${height} m`);
    // Kolor nieba to ta sama mieszanka dwóch stref.
    const index = weights.findIndex((value) => value > 0);
    const next = ZONES[index + 1];
    const expected = next ? mix(ZONES[index].sky[0], next.sky[0], weights[index + 1]) : ZONES[index].sky[0];
    assert.equal(skyAt(height)[0], expected, `niebo na ${height} m`);
  }
});

test("oprawa: każda strefa coś rysuje, przezroczystość wraca do 1, także w poziomie (szerszy ekran)", () => {
  for (const layout of [
    { cssWidth: 390, cssHeight: 844, scale: 390 / WORLD.width },
    { cssWidth: 844, cssHeight: 390, scale: 390 / WORLD.minVisible },
  ]) {
    for (const zone of ZONES) {
      const context = fakeContext();
      const scenery = createScenery({ context });
      const bottom = zone.from + 20;
      const weights = scenery.draw(layout, bottom, 3.5);
      assert.deepEqual(weights, zoneWeights(bottom + WORLD.height / 2));
      const drawn = context.calls.fill + context.calls.stroke + context.calls.fillRect;
      assert.ok(drawn >= 3, `${zone.id}: ${drawn} kształtów`);
      assert.equal(context.globalAlpha, 1, `${zone.id}: przezroczystość`);
    }
  }
});

test("przechylanie: kąt w bok według obrotu ekranu (pion — gamma, poziom — beta ze znakiem strony)", () => {
  const tilt = { beta: 12, gamma: -7 };
  assert.equal(sideAngle(tilt, 0), -7);
  assert.equal(sideAngle(tilt, 90), 12);
  assert.equal(sideAngle(tilt, 180), 7);
  assert.equal(sideAngle(tilt, 270), -12);
  assert.equal(sideAngle(tilt, -90), -12);
  assert.equal(sideAngle({ beta: null, gamma: null }, 0), 0);
  assert.equal(sideAngle({}, 90), 0);
});

test("przechylanie: martwa strefa 3°, pełna prędkość od 25°, liniowo pomiędzy, przycięcie i złe dane", () => {
  assert.equal(tiltSpeed(0), 0);
  assert.equal(tiltSpeed(TILT.dead), 0);
  assert.equal(tiltSpeed(-2.5), 0);
  near(tiltSpeed(14), ((14 - TILT.dead) / (TILT.full - TILT.dead)) * TILT.speed, 1e-9, "14°");
  near(tiltSpeed(-14), -tiltSpeed(14), 1e-9, "symetria");
  assert.equal(tiltSpeed(TILT.full), TILT.speed);
  assert.equal(tiltSpeed(60), TILT.speed);
  assert.equal(tiltSpeed(-170), -TILT.speed);
  assert.equal(tiltSpeed(Number.NaN), 0);
  assert.equal(tiltSpeed(undefined), 0);
});

test("ruch z przechylania: płynne dojście do prędkości, stop w martwej strefie; przeciąganie i klawisze mają pierwszeństwo", () => {
  const body = createOwlBody(4.5, 50);
  let moved = 0;
  for (let index = 0; index < 60; index += 1) {
    const before = body.x;
    stepOwl(body, { tilt: TILT.speed }, STEP);
    moved += wrapDelta(before, body.x);
  }
  near(body.vx, TILT.speed, 0.1, "po 0,5 s prawie pełna prędkość");
  assert.ok(moved > 3, `przesunięcie ${moved} m`);
  assert.equal(body.facing, 1);
  for (let index = 0; index < 120; index += 1) stepOwl(body, { tilt: 0 }, STEP);
  assert.equal(body.vx, 0, "w martwej strefie sowa staje");
  // Przeciąganie wygrywa z przechylaniem, po nim przechylanie rusza od zera (bez dryfu).
  steerBy(body, 1);
  stepOwl(body, { tilt: -TILT.speed }, STEP);
  assert.ok(body.vx > 0, "przeciąganie w prawo mimo przechyłu w lewo");
  while (Math.abs(body.pending) > 1e-6) stepOwl(body, { tilt: -TILT.speed }, STEP);
  stepOwl(body, { tilt: -TILT.speed }, STEP);
  assert.ok(body.vx < 0 && body.vx > -2, `po przeciąganiu od zera: ${body.vx}`);
  // Klawisz wygrywa z przechylaniem.
  for (let index = 0; index < 30; index += 1) stepOwl(body, { right: true, tilt: -TILT.speed }, STEP);
  assert.ok(body.vx > 0, "klawisz → w prawo");
  // Bez przechylania (null) — zwykłe wygaszanie po klawiszu.
  stepOwl(body, { tilt: null }, STEP);
  assert.ok(body.vx > 0 && body.vx < 9);
});

test("lot: setTilt przesuwa sowę w bok, null wyłącza; działa też w Niebiańskim Oceanie", () => {
  const run = createRun({ seed: "przechyl", hazards: false, extras: false });
  for (let index = 0; index < 30; index += 1) run.update(STEP);
  run.setTilt(TILT.speed);
  let moved = 0;
  for (let index = 0; index < 120; index += 1) {
    const before = run.state.owl.x;
    run.update(STEP);
    moved += wrapDelta(before, run.state.owl.x);
  }
  assert.ok(moved > 6, `w prawo o ${moved} m w 1 s`);
  run.setTilt(Number.NaN);
  assert.equal(run.state.keys.tilt, null);
  run.setTilt(-TILT.speed);
  run.giveOcean();
  moved = 0;
  for (let index = 0; index < 120; index += 1) {
    const before = run.state.owl.x;
    run.update(STEP);
    moved += wrapDelta(before, run.state.owl.x);
  }
  assert.equal(run.state.phase, "ocean");
  assert.ok(moved < -6, `w oceanie w lewo o ${moved} m`);
});
