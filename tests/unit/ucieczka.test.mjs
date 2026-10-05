// Sowia Ucieczka (Analiza 3, E4): fizyka sowy, kamera i czas reakcji, wzory przeszkód (każdy do przejścia),
// generator trasy, Chmura Pracu, punktacja.
import assert from "node:assert/strict";
import { test } from "node:test";
import { reactionTime, moverTriggerDistance, targetZoom } from "../../SowiaUcieczka/camera.js";
import {
  CLOUD,
  DIFFICULTIES,
  MAX_SPEED,
  MIN_SPEED,
  OWL,
  PHYSICS,
  PLATFORM_LEVELS,
  SCORE,
  VIEW,
} from "../../SowiaUcieczka/config.js";
import { comboLevel, createRun, createWorld, speedAt } from "../../SowiaUcieczka/game.js";
import { OBSTACLES, obstacleBox, overlaps } from "../../SowiaUcieczka/obstacles.js";
import { createTrack, PATTERNS, tierAt } from "../../SowiaUcieczka/patterns.js";
import { createOwlBody, jumpApex, owlBox, pressDown, stepOwl } from "../../SowiaUcieczka/physics.js";
import { SPRITES } from "../../shared/world/catalog.js";

const DT = 1 / 120;
const flatWorld = () => createWorld();

function run(body, controls, seconds, world = flatWorld(), speed = 0, events = []) {
  for (let t = 0; t < seconds; t += DT) stepOwl(body, controls, DT, world, events, speed);
  return events;
}

// ---------- Fizyka ----------

test("skok: szczyt ok. 2,6 j., podwójny skok wyżej, lądowanie przywraca podwójny skok", () => {
  assert.ok(Math.abs(jumpApex() - 2.58) < 0.01);
  const body = createOwlBody();
  const controls = { jump: true, down: false, hold: false, holdTime: 0 };
  let top = 0;
  const events = [];
  for (let t = 0; t < 1.2; t += DT) {
    stepOwl(body, controls, DT, flatWorld(), events);
    top = Math.min(top, body.y);
  }
  assert.ok(top < -2.5 && top > -2.65, `szczyt ${top}`);
  assert.equal(body.grounded, true);
  assert.deepEqual(
    events.map((event) => event.type),
    ["jump", "land"],
  );
  // Podwójny skok w szczycie: razem ok. 4,5 j.
  controls.jump = true;
  run(body, controls, 0.37);
  controls.jump = true;
  let peak = 0;
  for (let t = 0; t < 1.5; t += DT) {
    stepOwl(body, controls, DT, flatWorld());
    peak = Math.min(peak, body.y);
  }
  assert.ok(peak < -4.3 && peak > -4.6, `podwójny ${peak}`);
  assert.equal(body.jumps, 1, "po lądowaniu znów jest podwójny skok");
});

test("coyote time i bufor skoku", () => {
  // Zejście z krawędzi platformy: przez 0,1 s można jeszcze skoczyć jak z ziemi.
  const world = flatWorld();
  world.platforms.push({ x: -5, width: 5, y: -PLATFORM_LEVELS[0], level: 1 });
  const body = createOwlBody(-0.5);
  body.y = -PLATFORM_LEVELS[0];
  body.surface = body.y;
  const controls = { jump: false, down: false, hold: false, holdTime: 0 };
  // Krawędź wybacza pół szerokości sowy: zejście przy x = 0,4 (po 0,18 s), sprawdzamy po 0,2 s.
  run(body, controls, 0.2, world, 5);
  assert.equal(body.grounded, false);
  assert.ok(body.coyote > 0);
  controls.jump = true;
  const events = run(body, controls, DT, world, 5);
  assert.equal(events[0].type, "jump");
  assert.equal(body.jumps, 1, "skok z coyote nie zużywa podwójnego");

  // Bufor: stuknięcie 0,1 s przed lądowaniem daje skok od razu po lądowaniu.
  const falling = createOwlBody();
  falling.grounded = false;
  falling.jumps = 0;
  falling.y = -0.6;
  falling.vy = 6;
  const types = [];
  stepOwl(falling, { jump: true, down: false, hold: false, holdTime: 0 }, DT, flatWorld(), types);
  run(falling, { jump: false, down: false, hold: false, holdTime: 0 }, 0.2, flatWorld(), 0, types);
  assert.deepEqual(types.map((event) => event.type).slice(0, 2), ["land", "jump"]);
});

test("szybowanie przy przytrzymaniu, ślizg, szybkie opadanie i zeskok z platformy", () => {
  const body = createOwlBody();
  const controls = { jump: true, down: false, hold: true, holdTime: 0 };
  const events = [];
  for (let t = 0; t < 1; t += DT) {
    controls.holdTime += DT;
    stepOwl(body, controls, DT, flatWorld(), events);
  }
  assert.ok(events.some((event) => event.type === "glideStart"));
  assert.ok(body.vy <= PHYSICS.glideFall + 1e-9, "opadanie ograniczone");
  assert.ok(!body.grounded, "szybowanie wydłuża lot");

  const ground = createOwlBody();
  pressDown(ground, events);
  assert.ok(ground.sliding > 0);
  owlBox(ground, (ground.box = {}));
  assert.ok(Math.abs(ground.box.top + OWL.slideHeight) < 1e-9, "ślizg obniża pole kolizji");

  const air = createOwlBody();
  const airControls = { jump: true, down: false, hold: false, holdTime: 0 };
  run(air, airControls, 0.2);
  airControls.down = true;
  const landing = run(air, airControls, 0.5);
  assert.ok(landing.some((event) => event.type === "dive"));
  assert.ok(air.sliding > 0, "po szybkim opadaniu ślizg");

  const world = flatWorld();
  world.platforms.push({ x: -5, width: 10, y: -2.2, level: 1 });
  const onPlatform = createOwlBody();
  onPlatform.y = -2.2;
  onPlatform.surface = -2.2;
  const dropControls = { jump: false, down: true, hold: false, holdTime: 0 };
  run(onPlatform, dropControls, 0.6, world);
  assert.equal(onPlatform.y, 0, "zeskok przez platformę na ziemię");
});

test("platformy: wskakuje się od dołu, ląduje z góry; poziomy osiągalne skokiem", () => {
  const world = flatWorld();
  world.platforms.push({ x: -10, width: 30, y: -PLATFORM_LEVELS[0], level: 1 });
  const body = createOwlBody();
  const controls = { jump: true, down: false, hold: false, holdTime: 0 };
  run(body, controls, 1, world);
  assert.equal(body.y, -PLATFORM_LEVELS[0], "skok z ziemi na poziom 1");
  controls.jump = true;
  world.platforms.push({ x: -10, width: 30, y: -PLATFORM_LEVELS[1], level: 2 });
  world.platforms.sort((a, b) => a.x - b.x || b.y - a.y);
  run(body, controls, 1, world);
  assert.equal(body.y, -PLATFORM_LEVELS[1], "z poziomu 1 na poziom 2");
  assert.ok(jumpApex() > PLATFORM_LEVELS[0] + 0.3);
  assert.ok(PLATFORM_LEVELS[2] - PLATFORM_LEVELS[1] < jumpApex() - 0.3);
});

// ---------- Kamera ----------

test("czas reakcji ≥ 1,1 s na 320 × 568 w pionie przy największej prędkości (kamera się oddala)", () => {
  for (const [cssWidth, cssHeight] of [
    [320, 568],
    [360, 800],
    [390, 844],
    [430, 932],
    [844, 390],
    [1280, 720],
  ]) {
    for (const speed of [MIN_SPEED, 7, MAX_SPEED]) {
      const time = reactionTime({ cssWidth, cssHeight, speed });
      assert.ok(time >= VIEW.reactionRequired, `${cssWidth}×${cssHeight} przy ${speed} j./s: ${time.toFixed(2)} s`);
    }
  }
  // Oddalenie nie przekracza minimum czytelności.
  assert.ok(targetZoom(11, MAX_SPEED) >= VIEW.minZoom);
  assert.ok(targetZoom(11, MIN_SPEED) === 1);
  // Obiekty szybsze od świata (wózek, maile) ruszają co najmniej 1,1 s przed zderzeniem.
  for (const speed of [MIN_SPEED, MAX_SPEED]) {
    for (const extra of [2, 2.5]) {
      const lead = moverTriggerDistance(speed, extra) / (speed + extra);
      assert.ok(lead >= VIEW.reactionRequired, `wózek ${speed}+${extra}: ${lead}`);
    }
  }
});

// ---------- Przeszkody i wzory ----------

test("przeszkody: rodziny Pracu i Amic, grafiki w katalogu, pola kolizji", () => {
  const families = Object.values(OBSTACLES).map((item) => item.family);
  assert.ok(families.filter((family) => family === "pracu").length >= 4);
  assert.ok(families.filter((family) => family === "amic").length >= 4);
  for (const [kind, item] of Object.entries(OBSTACLES)) {
    if (item.sprite) assert.ok(SPRITES[item.sprite], `${kind}: brak grafiki ${item.sprite}`);
    assert.ok(item.box[0] > 0 && item.box[1] > 0, kind);
  }
  // Dymek i znak: stojąca sowa zderza się, ślizgająca przechodzi pod spodem.
  for (const kind of ["dymek", "znak"]) {
    const box = obstacleBox({ kind, x: 0, base: 0, phase: 0 }, 0);
    const standing = owlBox(createOwlBody(0));
    const sliding = createOwlBody(0);
    sliding.sliding = 1;
    assert.ok(overlaps(standing, box), `${kind}: stojąca sowa`);
    assert.ok(!overlaps(owlBox(sliding), box), `${kind}: ślizg`);
  }
});

test("co najmniej 30 wzorów w 4 progach; unikalne identyfikatory; oddech w każdym progu", () => {
  assert.ok(PATTERNS.length >= 30, `wzorów: ${PATTERNS.length}`);
  assert.equal(new Set(PATTERNS.map((item) => item.id)).size, PATTERNS.length);
  for (const tier of [0, 1, 2, 3]) {
    const list = PATTERNS.filter((item) => item.tier === tier);
    assert.ok(list.length >= 6, `próg ${tier}: ${list.length}`);
    assert.ok(
      list.some((item) => item.tags.includes("breather")),
      `próg ${tier}: oddech`,
    );
  }
  const kinds = new Set(
    PATTERNS.flatMap((item) => item.items.filter((part) => part.type === "obstacle").map((part) => part.kind)),
  );
  for (const kind of ["dymek", "telefon", "mail", "karteczki-dol", "dystrybutor", "cysterna", "znak", "wozek"]) {
    assert.ok(kinds.has(kind), `brak przeszkody ${kind} we wzorach`);
  }
  for (const item of PATTERNS) {
    for (const part of item.items) {
      if (part.x !== undefined) assert.ok(part.x >= 0 && part.x <= item.length, `${item.id}: element poza wzorem`);
    }
  }
});

// Przeszukiwanie ruchów (BFS): czy da się przejść wzór bez trafienia przy stałej prędkości?
// Decyzje co 1/15 s: nic / dotknięcie (skok + przytrzymanie) / puszczenie / przesunięcie w dół.
function solvable(chosen, speed) {
  const world = createWorld();
  const obstacles = [];
  for (const item of chosen.items) {
    const base = item.level ? -PLATFORM_LEVELS[item.level - 1] : 0;
    if (item.type === "obstacle") {
      obstacles.push({
        kind: item.kind,
        x0: item.x,
        base: item.height !== undefined ? base - item.height : base,
        vx: item.vx || 0,
        phase: 0,
      });
    } else if (item.type === "platform") {
      world.platforms.push({ x: item.x, width: item.width, y: -PLATFORM_LEVELS[item.level - 1] });
    } else if (item.type === "hole") world.holes.push({ x: item.x, width: item.width });
  }
  world.platforms.sort((a, b) => a.x - b.x);
  world.holes.sort((a, b) => a.x - b.x);
  const step = 1 / 60;
  const startX = -4;
  const frames = Math.ceil((chosen.length + 6) / speed / step);
  // Położenie ruchomej przeszkody zależy tylko od numeru klatki (x sowy = startX + v·t).
  const positions = obstacles.map((item) => {
    const list = new Float64Array(frames + 2);
    let x = item.x0;
    let active = !item.vx;
    for (let frame = 0; frame <= frames + 1; frame += 1) {
      const owlX = startX + speed * step * frame;
      if (!active && owlX >= item.x0 - moverTriggerDistance(speed, item.vx)) active = true;
      if (active && frame > 0) x += item.vx * step;
      list[frame] = x;
    }
    return list;
  });
  // Meta: za ostatnią przeszkodą i dziurą (dalej wzór zawiera już tylko liście).
  const finish =
    Math.max(
      0,
      ...obstacles.map((item) => item.x0 + OBSTACLES[item.kind].box[0] / 2),
      ...world.holes.map((item) => item.x + item.width),
    ) + 1;
  const box = {};
  const other = {};
  const clone = (value) => ({ ...value });
  let layer = [{ body: createOwlBody(startX), hold: false, holdTime: 0 }];
  for (let frame = 0; frame < frames; frame += 1) {
    const next = new Map();
    for (const node of layer) {
      const options = frame % 4 === 0 ? ["none", node.hold ? "release" : "press", "down"] : ["none"];
      for (const action of options) {
        const body = clone(node.body);
        const controls = { jump: false, down: false, hold: node.hold, holdTime: node.holdTime };
        if (action === "press") {
          controls.jump = true;
          controls.hold = true;
          controls.holdTime = 0;
        } else if (action === "release") controls.hold = false;
        else if (action === "down") controls.down = true;
        if (controls.hold) controls.holdTime += step;
        stepOwl(body, controls, step, world, null, speed);
        if (body.y > PHYSICS.holeDepth) continue;
        owlBox(body, box);
        const time = (frame + 1) * step;
        let crashed = false;
        for (let index = 0; index < obstacles.length; index += 1) {
          const item = obstacles[index];
          obstacleBox({ kind: item.kind, x: positions[index][frame + 1], base: item.base, phase: 0 }, time, other);
          if (overlaps(box, other)) {
            crashed = true;
            break;
          }
        }
        if (crashed) continue;
        // Stany „prawie takie same” łączymy (siatka 0,1 j. i 0,5 j./s) — przeszukiwanie zostaje szybkie.
        const key = [
          Math.round(body.y * 10),
          Math.round(body.vy * 2),
          body.jumps,
          body.grounded ? 1 : 0,
          body.sliding > 0 ? Math.round(body.sliding * 10) : 0,
          controls.hold ? (controls.holdTime >= PHYSICS.glideDelay ? 2 : 1) : 0,
          Math.round(body.glideTime * 5),
          body.diving ? 1 : 0,
          body.dropping ?? "n",
          body.coyote > 0 ? 1 : 0,
        ].join("|");
        if (!next.has(key)) next.set(key, { body, hold: controls.hold, holdTime: controls.holdTime });
      }
    }
    layer = [...next.values()];
    if (!layer.length) return false;
    if (layer.some((node) => node.body.x > finish && node.body.y <= 0)) return true;
  }
  return layer.length > 0;
}

test("każdy wzór da się przejść bez trafienia przy najmniejszej i największej prędkości", () => {
  const failures = [];
  for (const chosen of PATTERNS) {
    for (const speed of [MIN_SPEED, 7, MAX_SPEED]) {
      if (!solvable(chosen, speed)) failures.push(`${chosen.id} przy ${speed.toFixed(2)} j./s`);
    }
  }
  assert.deepEqual(failures, []);
});

test("przeszukiwanie wykrywa wzór nie do przejścia (kontrola testu)", () => {
  const impossible = {
    id: "mur",
    length: 12,
    tags: [],
    items: [
      { type: "obstacle", kind: "karteczki-dol", x: 6, level: 0 },
      { type: "obstacle", kind: "cysterna", x: 6.5, level: 0 },
      { type: "obstacle", kind: "karteczki-gora", x: 6, level: 0, height: -1.2 },
    ],
  };
  assert.equal(solvable(impossible, 7), false);
});

// ---------- Generator i bieg ----------

test("progi wzorów rosną z dystansem (Chaos szybciej, Chill wolniej)", () => {
  assert.equal(tierAt(0, "arcade"), 0);
  assert.equal(tierAt(350, "arcade"), 1);
  assert.equal(tierAt(1000, "arcade"), 2);
  assert.equal(tierAt(2000, "arcade"), 3);
  assert.equal(tierAt(350, "chill"), 0);
  assert.equal(tierAt(600, "chaos"), 2);
});

test("generator: najpierw oddech, bez powtórzeń ostatnich 3, oddech po trudnym wzorze, powtarzalny z ziarnem", () => {
  const pick = (seed) => {
    const track = createTrack({ difficulty: "arcade", random: createSeeded(seed) });
    return Array.from({ length: 60 }, (_, index) => track.choose(index * 60).id);
  };
  const first = pick("a");
  assert.deepEqual(first, pick("a"), "to samo ziarno — ta sama trasa");
  assert.ok(PATTERNS.find((item) => item.id === first[0]).tags.includes("breather"));
  for (let index = 1; index < first.length; index += 1) {
    const window = first.slice(Math.max(0, index - 3), index);
    assert.ok(!window.includes(first[index]), `powtórzenie ${first[index]}`);
    const previous = PATTERNS.find((item) => item.id === first[index - 1]);
    if (previous.tags.includes("hard")) {
      assert.ok(PATTERNS.find((item) => item.id === first[index]).tags.includes("breather"), "oddech po trudnym");
    }
  }
});

function createSeeded(seed) {
  let state = 2166136261;
  for (const character of String(seed)) state = Math.imul(state ^ character.charCodeAt(0), 16777619);
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

test("prędkość rośnie od startu do maksimum poziomu; Tryb Przytulny wolniej i tylko w Chill", () => {
  for (const [key, config] of Object.entries(DIFFICULTIES)) {
    assert.equal(speedAt(0, key), config.speedStart);
    assert.ok(Math.abs(speedAt(config.rampSeconds, key) - config.speedMax) < 1e-9);
    assert.ok(speedAt(config.rampSeconds / 2, key) > (config.speedStart + config.speedMax) / 2, "ease-out");
  }
  assert.ok(speedAt(10, "chill", true) < speedAt(10, "chill"));
  assert.equal(createRun({ difficulty: "arcade", cozy: true, seed: 1 }).state.cozy, false);
  assert.equal(createRun({ difficulty: "chill", cozy: true, seed: 1 }).state.cozy, true);
});

test("Chmura Pracu: trafienie przybliża chmurę, 400 m bez trafienia ją oddala, 3 trafienia kończą bieg", () => {
  const game = createRun({ difficulty: "arcade", seed: "chmura" });
  assert.equal(game.state.cloud, CLOUD.steps);
  assert.equal(game.hit("pracu", "dymek"), true);
  assert.equal(game.state.cloud, 2);
  assert.equal(game.hit("amic", "dystrybutor"), false, "chwila nietykalności po trafieniu");
  game.state.invulnerable = 0;
  game.state.sinceHit = CLOUD.recoverDistance;
  game.update(DT);
  assert.equal(game.state.cloud, 3);
  for (let index = 0; index < 3; index += 1) {
    game.state.invulnerable = 0;
    game.hit("pracu");
  }
  assert.equal(game.state.ended, true);
  assert.equal(game.state.endReason, "chmura");
  assert.ok(game.takeEvents().some((event) => event.type === "end"));

  const cozy = createRun({ difficulty: "chill", cozy: true, seed: "chmura" });
  for (let index = 0; index < 5; index += 1) {
    cozy.state.invulnerable = 0;
    cozy.hit("pracu");
  }
  assert.equal(cozy.state.ended, false, "Tryb Przytulny: bez końca gry");
  assert.equal(cozy.state.cloud, 1);
});

test("combo ×1–×5 co 10 liści, trafienie obniża o 1 poziom; wynik = dystans + liście × combo + premie", () => {
  assert.equal(comboLevel(0), 1);
  assert.equal(comboLevel(9), 1);
  assert.equal(comboLevel(10), 2);
  assert.equal(comboLevel(100), SCORE.comboMax);
  const game = createRun({ difficulty: "arcade", seed: "liscie" });
  game.state.streak = 25;
  game.state.combo = comboLevel(25);
  game.hit("pracu");
  assert.equal(game.state.combo, 2);
  game.state.leafPoints = 120;
  game.state.nearMisses = 2;
  game.update(DT);
  assert.equal(game.state.score, Math.floor(game.state.distance) + 120 + 2 * SCORE.nearMiss);
});

test("bieg z ziarnem jest powtarzalny, a bot bez ruchu w końcu zostaje dogoniony przez chmurę", () => {
  const simulate = (seed) => {
    const game = createRun({ difficulty: "arcade", seed });
    for (let t = 0; t < 60 && !game.state.ended; t += DT) game.update(DT);
    return game.summary();
  };
  const a = simulate("dzien");
  assert.deepEqual(a, simulate("dzien"));
  assert.ok(a.hits >= 3, "stojąca w miejscu sowa zbiera trafienia");
  assert.ok(a.distance > 40 && a.leaves > 0, "bieg trwa i sowa zbiera liście po drodze");
});

test("dotyk: skok po 60 ms albo po puszczeniu; przesunięcie w dół zamiast skoku daje ślizg", () => {
  const game = createRun({ difficulty: "arcade", seed: "dotyk" });
  game.press("touch");
  game.update(0.03);
  assert.equal(game.state.owl.grounded, true, "jeszcze czeka (może to przesunięcie)");
  game.update(0.04);
  assert.equal(game.state.owl.grounded, false, "po 60 ms skok");
  game.release();

  const slide = createRun({ difficulty: "arcade", seed: "dotyk" });
  slide.press("touch");
  slide.update(0.02);
  slide.swipe("down");
  slide.release();
  slide.update(0.02);
  assert.equal(slide.state.owl.grounded, true);
  assert.ok(slide.state.owl.sliding > 0);

  const tap = createRun({ difficulty: "arcade", seed: "dotyk" });
  tap.press("touch");
  tap.release();
  tap.update(DT);
  assert.equal(tap.state.owl.grounded, false, "krótkie stuknięcie od razu skacze");
});

// ---------- E4c: kózki, Gorączka, Plusk-o-metr, „Rejs na humbaku”, biomy ----------

const { biomeAt, goatLift, loopFactor } = await import("../../SowiaUcieczka/game.js");
const { BIOMES, biomeBlend, mixColor } = await import("../../SowiaUcieczka/backgrounds.js");
const { FEVER, GOATS, SPLASH, WHALE, BIOME_LENGTH } = await import("../../SowiaUcieczka/config.js");

const runFor = (game, seconds, each = () => {}) => {
  for (let t = 0; t < seconds && !game.state.ended; t += DT) {
    each(game);
    game.update(DT);
  }
};

test("kózki pojawiają się co 180–320 m w odstępach między wzorami, skaczą łukami i każda ma grafikę", () => {
  const game = createRun({ difficulty: "arcade", seed: "kozki" });
  const start = game.state.owl.x;
  const spawned = new Map();
  runFor(game, 120, (current) => {
    current.state.invulnerable = 1e9;
    current.state.splash = 0; // bez rejsu na humbaku (w rejsie nie ma kózek)
    for (const goat of current.state.goats) spawned.set(goat.x, goat.kind);
  });
  assert.ok(game.state.distance > 700);
  const positions = [...spawned.keys()].sort((a, b) => a - b);
  assert.ok(positions.length >= 3, `co najmniej 3 kózki na ${Math.round(game.state.distance)} m`);
  assert.ok(positions[0] - start >= GOATS.every[0] * 0.5, "pierwsza kózka po 90 m");
  const longest = Math.max(...PATTERNS.map((item) => item.length));
  for (let index = 1; index < positions.length; index += 1) {
    const gap = positions[index] - positions[index - 1];
    assert.ok(gap >= GOATS.every[0] && gap <= GOATS.every[1] + longest + 10, `odstęp kózek ${gap}`);
  }
  // Dwie kolejne kózki nigdy nie są tego samego rodzaju.
  const kinds = positions.map((x) => spawned.get(x));
  assert.ok(kinds.every((kind, index) => index === 0 || kind !== kinds[index - 1]));
  for (const kind of Object.keys(GOATS.weights)) {
    assert.ok(SPRITES[`kozka-${kind}`] && SPRITES[`kozka-${kind}-skok`], kind);
  }
  assert.equal(goatLift(0), 0);
  assert.ok(goatLift(GOATS.hopPeriod * 0.35) > GOATS.hopHeight * 0.99);
});

test("kózki: Sprężynka — super-skok, Tarcza — chroni raz, Turbo — sprint bez obrażeń, Magnes i Podwajaczka", () => {
  const spring = createRun({ difficulty: "arcade", seed: "sprezynka" });
  spring.giveGoat("sprezynka");
  let top = 0;
  runFor(spring, 1, (game) => (top = Math.min(top, game.state.owl.y)));
  assert.ok(top < -5, `super-skok ${top}`);
  assert.ok(spring.state.goatPoints === GOATS.bonus);

  const shield = createRun({ difficulty: "arcade", seed: "tarcza" });
  shield.giveGoat("tarcza");
  assert.equal(shield.hit("pracu"), false);
  assert.equal(shield.state.cloud, CLOUD.steps, "tarcza pochłonęła trafienie");
  assert.equal(shield.state.powerups.tarcza, 0);
  assert.ok(shield.takeEvents().some((event) => event.type === "shieldBreak"));

  const turbo = createRun({ difficulty: "arcade", seed: "turbo" });
  const normal = turbo.state.speed;
  turbo.giveGoat("turbo");
  turbo.update(DT);
  assert.ok(Math.abs(turbo.state.speed / normal - GOATS.turboSpeed) < 0.01);
  assert.equal(turbo.hit("amic"), false, "turbo: nietykalność");
  runFor(turbo, GOATS.duration.turbo + 0.1);
  assert.ok(turbo.state.powerups.turbo === 0 && turbo.state.invulnerable > 0, "po turbo chwila nietykalności");

  const magnet = createRun({ difficulty: "arcade", seed: "magnes" });
  magnet.giveGoat("magnes");
  const owl = magnet.state.owl;
  magnet.state.leaves.push({ kind: "zielony", x: owl.x + 2.5, y: -2.5, taken: false, phase: 0 });
  magnet.state.leaves.sort((a, b) => a.x - b.x);
  const before = magnet.state.leafCount;
  runFor(magnet, 0.4);
  assert.ok(magnet.state.leafCount > before, "magnes przyciągnął liść poza zasięgiem skoku");

  const double = createRun({ difficulty: "arcade", seed: "podwajaczka" });
  double.giveGoat("podwajaczka");
  const o = double.state.owl;
  double.state.leaves.push({ kind: "zielony", x: o.x + 0.2, y: -0.5, taken: false, phase: 0 });
  double.state.leaves.sort((a, b) => a.x - b.x);
  double.update(DT);
  assert.equal(double.state.leafCount, 2, "podwójne liście");
});

test("tęczowy liść: Gorączka Monster 8 s — liście ×2 i dodatkowy rząd liści nad kolejnymi wzorami", () => {
  const game = createRun({ difficulty: "arcade", seed: "goraczka" });
  const owl = game.state.owl;
  game.state.leaves.push({ kind: "teczowy", x: owl.x + 0.2, y: -0.5, taken: false, phase: 0 });
  game.state.leaves.sort((a, b) => a.x - b.x);
  game.update(DT);
  assert.ok(game.takeEvents().some((event) => event.type === "fever"));
  assert.ok(game.state.fever > FEVER.duration - 0.1);
  const high = () => game.state.leaves.filter((item) => Math.abs(item.y + FEVER.extraHeight) < 1e-9).length;
  const extraBefore = high();
  game.state.invulnerable = 1e9;
  runFor(game, 3, (current) => (current.state.invulnerable = 1e9));
  assert.ok(high() > extraBefore, "gęstsze liście w czasie gorączki");
  const count = game.state.leafCount;
  game.state.leaves.push({ kind: "zielony", x: owl.x + 0.2, y: -0.5, taken: false, phase: 0 });
  game.state.leaves.sort((a, b) => a.x - b.x);
  game.update(DT);
  assert.equal(game.state.leafCount - count, FEVER.multiplier);
});

test("Plusk-o-metr: 60 liści albo 3 bąbelki; pełny — „Rejs na humbaku” 20 s bez przeszkód, potem premia", () => {
  assert.equal(SPLASH.leaves, 60);
  const game = createRun({ difficulty: "arcade", seed: "humbak" });
  const owl = game.state.owl;
  for (let index = 0; index < SPLASH.bubbles; index += 1) {
    game.state.bubbles.push({ x: owl.x + 0.1, y: -0.5, taken: false, phase: 0 });
    game.update(DT);
  }
  assert.ok(game.state.bonus, "3 bąbelki uruchamiają rejs");
  assert.equal(game.state.splash, 0);
  assert.equal(game.state.obstacles.filter((item) => item.x > owl.x).length, 0, "bez przeszkód w rejsie");
  assert.equal(game.hit("pracu"), false, "w rejsie bez obrażeń");
  // Stuknięcie: humbak wyskakuje z wody.
  game.press("keyboard");
  game.release();
  game.update(DT);
  game.update(0.2);
  assert.ok(game.state.bonus.y < -1, "humbak w powietrzu");
  let before = game.state.patternCount;
  for (let time = 0; game.state.bonus && time < WHALE.duration + 1; time += DT) {
    before = game.state.patternCount;
    game.update(DT);
  }
  assert.equal(game.state.bonus, null);
  const events = game.takeEvents();
  const end = events.find((event) => event.type === "bonusEnd");
  assert.ok(end && end.premium >= WHALE.bonus);
  assert.ok(game.state.bonusPoints >= WHALE.bonus);
  assert.ok(events.some((event) => event.type === "whaleJump"));
  // Po rejsie trasa wraca od oddechu.
  assert.ok(game.state.patternCount > before);
  const next = PATTERNS.find((item) => item.id === game.state.patterns.at(before - game.state.patternCount));
  assert.ok(next.tags.includes("breather"), `po rejsie oddech, a jest ${next.id}`);
});

test("biomy co 1000 m (6), przenikanie 60 m, kolejne okrążenie szybciej (najwyżej +10%)", () => {
  assert.equal(BIOMES.length, 6);
  assert.deepEqual(
    BIOMES.map((item) => item.name),
    ["Łąka", "Miasto", "Osiedle PRL", "Stacja Amic", "Plaża", "Noc nad morzem"],
  );
  assert.deepEqual(biomeAt(999), { index: 0, loop: 0 });
  assert.deepEqual(biomeAt(1000), { index: 1, loop: 0 });
  assert.deepEqual(biomeAt(6 * BIOME_LENGTH + 10), { index: 0, loop: 1 });
  assert.equal(loopFactor(100), 1);
  assert.ok(Math.abs(loopFactor(6500) - 1.05) < 1e-9);
  assert.ok(Math.abs(loopFactor(30000) - 1.1) < 1e-9);
  const blend = biomeBlend(1030);
  assert.equal(blend.current.id, "miasto");
  assert.equal(blend.previous.id, "laka");
  assert.ok(Math.abs(blend.t - 0.5) < 1e-9);
  assert.equal(biomeBlend(500).t, 1);
  assert.equal(mixColor("#000000", "#ffffff", 0.5), "rgb(128, 128, 128)");
  const game = createRun({ difficulty: "arcade", seed: "biom" });
  game.warp(1000);
  game.update(DT);
  assert.ok(game.takeEvents().some((event) => event.type === "biome" && event.index === 1));
});

test("Sowi Butik: dłuższe działanie kózek (goatTime) mnoży czas power-upów, w granicach 1–2", () => {
  const longer = createRun({ difficulty: "arcade", seed: "butik", goatTime: 1.4 });
  assert.equal(longer.state.goatTime, 1.4);
  longer.giveGoat("magnes");
  assert.ok(Math.abs(longer.state.powerups.magnes - GOATS.duration.magnes * 1.4) < 1e-9);
  assert.equal(createRun({ seed: "butik", goatTime: 5 }).state.goatTime, 2);
  assert.equal(createRun({ seed: "butik", goatTime: "x" }).state.goatTime, 1);
  assert.equal(createRun({ seed: "butik" }).state.goatTime, 1);
});
