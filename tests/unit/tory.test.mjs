// Sowie Tory (Analiza 3, E5): rzutnia perspektywiczna, ruch sowy, kolizje według typu przeszkody, wzory
// (każdy do przejścia z każdego toru), generator trasy i bieg przez całą kampanię z prostym autopilotem.
import assert from "node:assert/strict";
import { test } from "node:test";
import { BOARS, DIFFICULTIES, LANES, MOVING, OBSTACLE_TYPES, OWL, PROJECTION, TRACK } from "../../SowieTory/config.js";
import { comboLevel, createRun, moverTrigger, speedAt } from "../../SowieTory/game.js";
import { OBSTACLES, collides, laneOf, obstacleShape } from "../../SowieTory/obstacles.js";
import { OBSTACLE_CODES, PATTERNS, allowedOn, createTrack, gapAfter, tierAt } from "../../SowieTory/patterns.js";
import { createOwlBody, owlTop, stepOwl } from "../../SowieTory/physics.js";
import {
  ROAD_WIDTH,
  computeProjection,
  depthAtScreenY,
  fogAt,
  laneX,
  project,
  visibleSeconds,
} from "../../SowieTory/projection.js";
import { STAGES, STAGE_COUNT, stageKind } from "../../SowieTory/stages.js";

const STEP = 1 / 120;
const MIN_SPEED = DIFFICULTIES.chill.speedStart * 0.85; // Chill w Trybie Przytulnym
const MAX_SPEED = DIFFICULTIES.chaos.speedMax + DIFFICULTIES.chaos.stageStep * (STAGE_COUNT - 1);

// ---------- Rzutnia ----------

test("rzutnia: w pionie droga przy sowie zajmuje 84% szerokości, sowa na 80% wysokości, horyzont na 30%", () => {
  for (const [width, height] of [
    [320, 568],
    [375, 667],
    [390, 844],
    [412, 915],
  ]) {
    const layout = computeProjection({ width, height });
    assert.equal(layout.portrait, true);
    const left = project(layout, -ROAD_WIDTH / 2, 0, 0);
    const right = project(layout, ROAD_WIDTH / 2, 0, 0);
    assert.ok(Math.abs(right.x - left.x - width * PROJECTION.roadShare) < 1e-6, `${width}×${height}`);
    assert.ok(Math.abs(left.y - height * PROJECTION.owlScreenY) < 1e-6);
    // Punkt zbiegu: bardzo daleko droga schodzi do horyzontu na środku ekranu.
    const far = project(layout, 0, 0, 1e6);
    assert.ok(Math.abs(far.y - height * PROJECTION.horizon) < 0.5 && Math.abs(far.x - width / 2) < 1e-6);
    // Odwrotność rzutu dla drogi i skala malejąca z głębokością.
    for (const z of [0, 5, 20, 60]) {
      const point = project(layout, 0, 0, z);
      assert.ok(Math.abs(depthAtScreenY(layout, point.y) - z) < 1e-6);
    }
    assert.ok(project(layout, 0, 0, 30).scale < project(layout, 0, 0, 10).scale);
    assert.equal(project(layout, 0, 0, -PROJECTION.cameraBack), null, "punkt za kamerą");
  }
});

test("rzutnia: w poziomie droga na środku (najwyżej 115% wysokości), scenografia po bokach", () => {
  const layout = computeProjection({ width: 844, height: 390 });
  assert.equal(layout.portrait, false);
  const width = project(layout, ROAD_WIDTH / 2, 0, 0).x - project(layout, -ROAD_WIDTH / 2, 0, 0).x;
  assert.ok(Math.abs(width - 390 * PROJECTION.roadHeightShare) < 1e-6);
  assert.ok(width < 844 * 0.6);
  assert.ok(Math.abs(layout.horizonY - 390 * PROJECTION.horizonLandscape) < 1e-6);
});

test("mgła i czas widoczności: liczone w głębokości, co najmniej 2 s przy największej prędkości", () => {
  const layout = computeProjection({ width: 375, height: 667 });
  assert.equal(fogAt(layout, 10), 0);
  assert.equal(fogAt(layout, PROJECTION.farZ + 5), 1);
  assert.ok(fogAt(layout, (PROJECTION.fogStart + PROJECTION.farZ) / 2) === 0.5);
  assert.ok(visibleSeconds(MAX_SPEED) >= 2, `${visibleSeconds(MAX_SPEED)} s`);
  assert.ok(visibleSeconds(DIFFICULTIES.arcade.speedMax) >= 2.8);
  assert.equal(laneX(-1), -LANES.width);
});

// ---------- Ruch sowy ----------

function simulate(body, commands, seconds) {
  const events = [];
  const frames = Math.round(seconds / STEP);
  let apex = 0;
  let airborne = 0;
  for (let frame = 0; frame < frames; frame += 1) {
    const controls = { left: false, right: false, up: false, down: false, ...(commands[frame] || {}) };
    stepOwl(body, controls, STEP, events);
    apex = Math.max(apex, body.y);
    if (!body.grounded) airborne += STEP;
  }
  return { events, apex, airborne };
}

test("sowa: skok ok. 1,3 m i 0,66 s w powietrzu, ślizg 0,7 s, zmiana toru w ok. 0,11 s, szybkie lądowanie", () => {
  const jump = createOwlBody();
  const result = simulate(jump, { 0: { up: true } }, 1.2);
  // Krok 1/120 s (półjawny Euler) daje szczyt o ok. v·dt/2 niższy niż wzór.
  assert.ok(Math.abs(result.apex - (OWL.jumpVelocity * OWL.jumpVelocity) / (2 * OWL.gravity)) < 0.05);
  assert.ok(result.apex > 1.2 && result.apex < 1.4, `szczyt ${result.apex}`);
  assert.ok(Math.abs(result.airborne - 0.66) < 0.03, `w powietrzu ${result.airborne}`);
  assert.deepEqual(result.events, ["jump", "land"]);

  const slide = createOwlBody();
  const sliding = simulate(slide, { 0: { down: true } }, 0.3);
  assert.deepEqual(sliding.events, ["slide"]);
  assert.equal(owlTop(slide), OWL.slideHeight);
  simulate(slide, {}, 0.5);
  assert.equal(slide.slide, 0);
  assert.equal(owlTop(slide), OWL.height);

  const lane = createOwlBody();
  let frames = 0;
  stepOwl(lane, { right: true }, STEP);
  frames += 1;
  while (lane.x < laneX(1)) {
    stepOwl(lane, {}, STEP);
    frames += 1;
  }
  assert.ok(Math.abs(frames * STEP - LANES.width / OWL.laneSpeed) < 0.02);
  // Skrajny tor: dalej w prawo nic się nie dzieje.
  assert.deepEqual(stepOwl(lane, { right: true }, STEP), []);

  // Przesunięcie w dół w powietrzu: szybkie lądowanie i od razu ślizg; w górę w ślizgu — skok.
  const dive = createOwlBody();
  const diving = simulate(dive, { 0: { up: true }, 20: { down: true } }, 0.45);
  assert.deepEqual(diving.events, ["jump", "land", "slide"]);
  assert.ok(dive.grounded && dive.slide > 0);
  simulate(dive, { 0: { up: true } }, 0.05);
  assert.equal(dive.slide, 0);
  assert.equal(dive.grounded, false);
  // Bufor: przesunięcie w górę tuż przed lądowaniem też skacze.
  const buffered = createOwlBody();
  simulate(buffered, { 0: { up: true } }, 0.6);
  assert.equal(buffered.grounded, false);
  const again = simulate(buffered, { 0: { up: true } }, 0.2);
  assert.ok(again.events.includes("jump"));
});

// ---------- Przeszkody ----------

test("przeszkody: niska — skok, wysoka — ślizg, pełna — zmiana toru; obie rodziny, sąsiedni tor bezpieczny", () => {
  const families = new Set(Object.values(OBSTACLES).map((item) => item.family));
  assert.deepEqual([...families].sort(), ["amic", "pracu"]);
  for (const type of ["low", "high", "full"]) {
    for (const family of ["pracu", "amic"]) {
      assert.ok(
        Object.values(OBSTACLES).some((item) => item.type === type && item.family === family),
        `${type} / ${family}`,
      );
    }
  }
  const at = (kind, lane = 0) => ({ kind, lane });
  const standing = createOwlBody();
  const jumping = { ...createOwlBody(), y: 1, grounded: false };
  const sliding = { ...createOwlBody(), slide: 0.5 };
  assert.equal(collides(standing, at("teczka"), 0), true);
  assert.equal(collides(jumping, at("teczka"), 0), false);
  assert.equal(collides(sliding, at("teczka"), 0), true);
  assert.equal(collides(standing, at("dymek"), 0), true);
  assert.equal(collides(sliding, at("dymek"), 0), false);
  assert.equal(collides(jumping, at("dymek"), 0), true, "skok nie przechodzi pod wysoką przeszkodą");
  assert.equal(collides(jumping, at("dystrybutor"), 0), true);
  assert.equal(collides(sliding, at("dystrybutor"), 0), true);
  assert.equal(collides(standing, at("dystrybutor", 1), 0), false, "sąsiedni tor");
  assert.equal(collides(standing, at("teczka"), 2), false, "jeszcze przed sową");
  assert.equal(collides(standing, at("cysterna"), -8), true, "długa cysterna zajmuje tor na dłużej");
  assert.equal(collides(standing, at("cysterna"), -11), false);
  assert.equal(obstacleShape("cysterna").depth, 10);
  assert.throws(() => obstacleShape("rower"), /Nieznana przeszkoda/);
  // Skórki plansz zachowują sposób omijania (typ); samochód na stacji Amic jest długi.
  for (const stage of STAGES) {
    for (const [from, to] of Object.entries(stage.remap)) {
      assert.equal(OBSTACLES[to].type, OBSTACLES[from].type, `${stage.id}: ${from} → ${to}`);
      assert.ok(OBSTACLES[to].sprite || OBSTACLES[to].prop, `${to}: rysunek`);
    }
  }
  assert.equal(stageKind(0, "wozek"), "wozek-sklepowy");
  assert.equal(stageKind(3, "wozek"), "samochod");
  assert.equal(stageKind(2, "wozek"), "wozek");
  assert.equal(obstacleShape("samochod").depth, 4.5);
  assert.equal(OBSTACLE_TYPES[obstacleShape("stojak").type].action, "ślizg");
  assert.equal(laneOf(laneX(1) - 0.3), 1);
});

// ---------- Wzory ----------

test("wzory: co najmniej 30, 4 progi, oddech, wzory plansz, poprawne tory i przeszkody wszystkich typów", () => {
  assert.ok(PATTERNS.length >= 30, `wzory: ${PATTERNS.length}`);
  // Każda plansza ma własne wzory (np. kasy w Biedronce, podjazd na stacji Amic), a wzory ogólne są wszędzie.
  for (const stage of STAGES) {
    assert.ok(
      PATTERNS.some((item) => item.stages?.includes(stage.id)),
      `wzory planszy ${stage.id}`,
    );
    assert.ok(PATTERNS.filter((item) => allowedOn(item, stage.id)).length >= 24, `pula planszy ${stage.id}`);
  }
  for (const item of PATTERNS) {
    for (const id of item.stages || [])
      assert.ok(
        STAGES.some((stage) => stage.id === id),
        `${item.id}: plansza ${id}`,
      );
  }
  assert.equal(new Set(PATTERNS.map((item) => item.id)).size, PATTERNS.length);
  for (const tier of [0, 1, 2, 3])
    assert.ok(
      PATTERNS.some((item) => item.tier === tier),
      `próg ${tier}`,
    );
  assert.ok(PATTERNS.some((item) => item.tags.includes("breather")));
  const kinds = new Set();
  for (const item of PATTERNS) {
    for (const part of item.items) {
      assert.ok([-1, 0, 1].includes(part.lane), `${item.id}: tor`);
      assert.ok(part.z >= 0 && part.z <= item.length, `${item.id}: element poza wzorem`);
      if (part.type === "obstacle") kinds.add(part.kind);
    }
  }
  for (const kind of Object.values(OBSTACLE_CODES)) assert.ok(kinds.has(kind), `brak przeszkody ${kind} we wzorach`);
  assert.ok(
    PATTERNS.some((item) => item.items.some((part) => part.moveTo !== undefined)),
    "ruchomy telefon",
  );
});

// Przeszukiwanie ruchów (BFS): czy da się przejść wzór bez trafienia przy stałej prędkości, startując z danego toru?
// Decyzje co 1/10 s (gracz ma mniej okazji niż w grze, więc wzór przechodzi tym pewniej): nic / ← / → / ↑ / ↓. Ruchomy telefon: strzałka i przejazd liczone z odległości (stała prędkość).
function solvable(chosen, speed, startLane = 0) {
  const step = 1 / 60;
  const startZ = -6;
  const obstacles = chosen.items.filter((item) => item.type === "obstacle");
  const finish = Math.max(0, ...obstacles.map((item) => item.z + obstacleShape(item.kind).depth)) + 1;
  const frames = Math.ceil((finish - startZ) / speed / step) + 2;
  const trigger = moverTrigger(speed);
  const placed = (item, owlZ) => {
    if (item.moveTo === undefined) return item;
    const since = (trigger - (item.z - owlZ)) / speed - MOVING.warning;
    return { ...item, moveProgress: Math.max(0, Math.min(1, since / MOVING.switchTime)) };
  };
  let layer = [createOwlBody(startLane)];
  for (let frame = 0; frame < frames; frame += 1) {
    const owlZ = startZ + speed * step * (frame + 1);
    const next = new Map();
    for (const node of layer) {
      const options = frame % 6 === 0 ? ["none", "left", "right", "up", "down"] : ["none"];
      for (const action of options) {
        const body = { ...node };
        stepOwl(body, { [action]: true }, step);
        if (obstacles.some((item) => collides(body, placed(item, owlZ), item.z - owlZ))) continue;
        const key = [
          body.lane,
          Math.round(body.x * 10),
          Math.round(body.y * 10),
          Math.round(body.vy),
          body.grounded ? 1 : 0,
          Math.round(body.slide * 10),
          body.buffer > 0 ? 1 : 0,
          body.diving ? 1 : 0,
        ].join("|");
        if (!next.has(key)) next.set(key, body);
      }
    }
    layer = [...next.values()];
    if (!layer.length) return false;
  }
  return true;
}

test("każdy wzór na każdej planszy (po zamianie skórek) da się przejść z każdego toru przy najmniejszej i największej prędkości", () => {
  const failures = [];
  // Ten sam układ przeszkód (wzór bez skórek planszy) sprawdzamy raz.
  const checked = new Set();
  STAGES.forEach((stage, index) => {
    for (const chosen of PATTERNS.filter((item) => allowedOn(item, stage.id))) {
      const skinned = {
        ...chosen,
        items: chosen.items.map((part) =>
          part.type === "obstacle" ? { ...part, kind: stageKind(index, part.kind) } : part,
        ),
      };
      const key = JSON.stringify(skinned.items.filter((part) => part.type === "obstacle"));
      if (checked.has(key)) continue;
      checked.add(key);
      for (const speed of [MIN_SPEED, DIFFICULTIES.arcade.speedMax, MAX_SPEED]) {
        for (const lane of [-1, 0, 1]) {
          if (!solvable(skinned, speed, lane)) {
            failures.push(`${stage.id}: ${chosen.id} przy ${speed.toFixed(1)} m/s z toru ${lane}`);
          }
        }
      }
    }
  });
  assert.deepEqual(failures, []);
});

test("przeszukiwanie wykrywa wzór nie do przejścia (kontrola testu)", () => {
  const wall = {
    id: "sciana",
    length: 12,
    tags: [],
    items: [-1, 0, 1].map((lane) => ({ type: "obstacle", kind: "dystrybutor", lane, z: 8 })),
  };
  assert.equal(solvable(wall, 13), false);
  // Cysterny zajmują boczne tory przez 10 m, a w ich połowie środkowy tor zamyka dystrybutor.
  const trap = {
    id: "pulapka",
    length: 12,
    tags: [],
    items: [
      { type: "obstacle", kind: "cysterna", lane: -1, z: 0 },
      { type: "obstacle", kind: "cysterna", lane: 1, z: 0 },
      { type: "obstacle", kind: "dystrybutor", lane: 0, z: 4 },
    ],
  };
  for (const lane of [-1, 0, 1]) assert.equal(solvable(trap, 20, lane), false, `z toru ${lane}`);
});

// ---------- Generator i bieg ----------

test("generator: progi według dystansu kampanii, co 4. wzór oddech, bez powtórki dwóch ostatnich", () => {
  assert.equal(tierAt(0), 0);
  assert.equal(tierAt(299), 0);
  assert.equal(tierAt(300), 1);
  assert.equal(tierAt(900), 2);
  assert.equal(tierAt(5000), 3);
  let seed = 1;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const track = createTrack({ random });
  const chosen = Array.from({ length: 40 }, () => track.choose(200));
  chosen.forEach((item, index) => {
    if ((index + 1) % 4 === 0) assert.ok(item.tags.includes("breather"), `${index}: ${item.id}`);
    else assert.ok(item.tier <= 0 && !item.tags.includes("breather"), `${index}: ${item.id}`);
    if (index >= 1) assert.notEqual(item.id, chosen[index - 1].id);
  });
  const late = Array.from({ length: 30 }, () => track.choose(4000));
  assert.ok(late.some((item) => item.tier === 3));
  // Wzory wstępne (samouczek) idą najpierw.
  const intro = createTrack({ random, intro: ["t0-teczka", "t0-dymek"] });
  assert.deepEqual([intro.choose(0).id, intro.choose(0).id], ["t0-teczka", "t0-dymek"]);
  // Odstęp po wzorze: stały czas przy każdej prędkości.
  assert.ok(Math.abs(gapAfter(26) / 26 - gapAfter(13) / 13) < 1e-9);
  assert.ok(gapAfter(13, "chaos") < gapAfter(13, "chill"));
});

test("prędkość rośnie na planszy i z każdą planszą; combo ×1–×5; plansze w kolejności z obecnej gry", () => {
  assert.equal(speedAt(0, "arcade", 0), DIFFICULTIES.arcade.speedStart);
  assert.equal(speedAt(1, "arcade", 0), DIFFICULTIES.arcade.speedMax);
  assert.ok(speedAt(0.5, "arcade", 2) > speedAt(0.5, "arcade", 1));
  assert.ok(speedAt(0.5, "chaos") > speedAt(0.5, "chill"));
  assert.ok(Math.abs(speedAt(0.5, "chill", 0, true) - speedAt(0.5, "chill") * 0.85) < 1e-9);
  assert.equal(comboLevel(0), 1);
  assert.equal(comboLevel(1000), 5);
  assert.deepEqual(
    STAGES.map((item) => item.id),
    ["biedronka", "festiwal", "prl", "amic"],
  );
  assert.equal(STAGES[0].name, "Sowa w sklepie Biedronka");
  assert.equal(STAGES[2].name, "Sowa uciekająca przed dzikami na blokowisku z PRL");
  assert.deepEqual(Object.fromEntries(Object.entries(DIFFICULTIES).map(([key, value]) => [key, value.lives])), {
    chill: 4,
    arcade: 3,
    chaos: 2,
  });
});

// Prosty autopilot: wybiera tor z najdalszą pełną przeszkodą, skacze przed niską i ślizga się pod wysoką.
function autopilot(run) {
  const { state } = run;
  const owl = state.owl;
  const ahead = state.obstacles
    .map((item) => ({ item, z: item.at - state.stageDistance, shape: obstacleShape(item.kind) }))
    .filter((entry) => entry.z + entry.shape.depth > -0.4 && entry.z < 30);
  const blocked = (lane) => {
    let nearest = Infinity;
    for (const entry of ahead) {
      const lanes = entry.item.moveTo === undefined ? [entry.item.lane] : [entry.item.lane, entry.item.moveTo];
      if (entry.shape.type === "full" && lanes.includes(lane)) nearest = Math.min(nearest, Math.max(0, entry.z));
    }
    return nearest;
  };
  const best = [-1, 0, 1]
    .map((lane) => ({ lane, free: blocked(lane) - Math.abs(lane - owl.lane) * 3 }))
    .sort((a, b) => b.free - a.free || Math.abs(a.lane - owl.lane) - Math.abs(b.lane - owl.lane))[0];
  // Dzik szarżuje w torze sowy (strzałka) — uciekamy na najlepszy inny tor.
  const boar = state.boars.find((item) => !item.passed && !item.hit && item.lane === owl.lane);
  if (boar) {
    const escape = [-1, 0, 1]
      .filter((lane) => Math.abs(lane - owl.lane) === 1)
      .map((lane) => ({ lane, free: blocked(lane) - Math.abs(lane - owl.lane) * 3 }))
      .sort((a, b) => b.free - a.free)[0];
    run.input(escape.lane < owl.lane ? "left" : "right");
    return;
  }
  // Nie wjeżdża (ani nie przejeżdża) przez tor, w którym dzik jeszcze szarżuje obok sowy.
  const charging = state.boars.some(
    (item) =>
      !item.passed &&
      !item.hit &&
      Math.min(owl.lane, best.lane) <= item.lane &&
      item.lane <= Math.max(owl.lane, best.lane),
  );
  if (blocked(owl.lane) < 25 && best.lane !== owl.lane && !charging) run.input(best.lane < owl.lane ? "left" : "right");
  for (const entry of ahead) {
    if (entry.item.lane !== owl.lane || entry.z <= 0) continue;
    if (entry.shape.type === "low" && entry.z < state.speed * 0.16 && owl.grounded) run.input("up");
    // Wysoka: ślizg; w powietrzu (tuż po skoku nad niską) — w dół = szybkie lądowanie i ślizg, gdy pod sową
    // nie ma już niskiej przeszkody.
    const overLow = ahead.some(
      (other) =>
        other.shape.type === "low" &&
        other.item.lane === owl.lane &&
        other.z < 1.5 &&
        other.z + other.shape.depth > -0.5,
    );
    if (entry.shape.type === "high" && entry.z < state.speed * 0.3 && owl.slide <= 0.05 && (owl.grounded || !overLow))
      run.input("down");
  }
}

function playCampaign(options) {
  const run = createRun(options);
  const seen = [];
  for (let time = 0; time < 600 && run.state.phase !== "over"; time += STEP) {
    autopilot(run);
    run.update(STEP);
    for (const event of run.takeEvents()) {
      seen.push(event);
      if (event.type === "stageEnd") run.nextStage();
    }
  }
  return { run, seen };
}

test("autopilot przechodzi całą kampanię (4 plansze, w Arcade ok. 75 s każda) bez trafienia", () => {
  // Chaos 6: skok nad teczką i od razu dymek przy 23,6 m/s — w powietrzu w dół = szybkie lądowanie i ślizg.
  for (const [seed, difficulty] of [
    [1, "arcade"],
    [2, "arcade"],
    [3, "arcade"],
    [6, "chaos"],
  ]) {
    const { run, seen } = playCampaign({ seed, difficulty });
    const summary = run.summary();
    assert.equal(run.state.endReason, "kampania", `ziarno ${seed}`);
    assert.equal(summary.finished, true);
    assert.equal(summary.hits, 0, `ziarno ${seed}: trafienia`);
    assert.equal(summary.stages, STAGE_COUNT);
    assert.ok(summary.leaves > 50, `liście ${summary.leaves}`);
    assert.deepEqual(
      seen.filter((event) => event.type === "stage").map((event) => event.stage),
      [0, 1, 2, 3],
    );
    // Każda plansza: meta z premią (550 bez trafienia), finał, rejs humbaka i podsumowanie z gwiazdkami.
    const finishes = seen.filter((event) => event.type === "finish");
    assert.equal(finishes.length, 4);
    assert.ok(finishes.every((event) => event.bonus === 550));
    assert.equal(seen.filter((event) => event.type === "whaleStart").length, 4);
    const ends = seen.filter((event) => event.type === "stageEnd");
    assert.equal(ends.length, 4);
    assert.equal(ends.at(-1).last, true);
    assert.ok(ends.every((event) => event.hits === 0 && event.stars.noHit && event.stars.count >= 2));
    assert.equal(
      summary.stars,
      ends.reduce((sum, event) => sum + event.stars.count, 0),
    );
    // Blokowisko PRL: dziki szarżują, a autopilot za każdym razem ucieka na inny tor.
    assert.ok(summary.boarsDodged >= 3, `uniki przed dzikami: ${summary.boarsDodged}`);
    const warnings = seen.filter((event) => event.type === "boarWarning");
    assert.equal(warnings.length, summary.boarsDodged);
    if (difficulty === "arcade") {
      for (const event of finishes) assert.ok(event.seconds > 60 && event.seconds < 90, `plansza: ${event.seconds} s`);
    }
    // Ostatnie metry planszy bez przeszkód (meta).
    assert.ok(seen.filter((event) => event.type === "pattern").every((event) => event.start < TRACK.stageLength));
  }
});

test("tryb Nieskończony: autopilot przechodzi dwa okrążenia (8 plansz) bez trafienia", () => {
  const run = createRun({ seed: 4, difficulty: "arcade", mode: "nieskonczony" });
  const stages = [];
  for (let time = 0; time < 1200 && run.state.phase !== "over" && stages.length < 8; time += STEP) {
    autopilot(run);
    run.update(STEP);
    for (const event of run.takeEvents()) {
      if (event.type === "stageEnd") {
        stages.push(event.stage);
        run.nextStage();
      }
    }
  }
  assert.deepEqual(stages, [0, 1, 2, 3, 0, 1, 2, 3]);
  assert.equal(run.state.hits, 0);
  assert.equal(run.state.loop, 2);
});

test("bieg: bez ruchu sowa traci życia i bieg się kończy; Tryb Przytulny i tryb bezpieczny nie kończą biegu", () => {
  const idle = createRun({ seed: 5, difficulty: "arcade" });
  for (let time = 0; time < 120 && idle.state.phase === "run"; time += STEP) idle.update(STEP);
  assert.equal(idle.state.phase, "over");
  assert.equal(idle.state.endReason, "trafienia");
  assert.equal(idle.state.lives, 0);
  const events = idle.takeEvents();
  const hits = events.filter((event) => event.type === "hit");
  assert.equal(hits.length, DIFFICULTIES.arcade.lives);
  assert.ok(hits.every((event) => typeof event.label === "string" && ["pracu", "amic"].includes(event.family)));

  const cozy = createRun({ seed: 5, difficulty: "chill", cozy: true });
  for (let time = 0; time < 60; time += STEP) cozy.update(STEP);
  assert.equal(cozy.state.phase, "run");
  assert.equal(cozy.state.lives, 1);
  assert.ok(cozy.state.hits > DIFFICULTIES.chill.lives);

  const safe = createRun({ seed: 5, safe: true });
  for (let time = 0; time < 30; time += STEP) safe.update(STEP);
  assert.equal(safe.state.hits, 0);
  assert.ok(safe.takeEvents().some((event) => event.type === "safeHit"));

  // Ziarno → ta sama trasa.
  const a = createRun({ seed: "powtorka" });
  const b = createRun({ seed: "powtorka" });
  for (let time = 0; time < 20; time += STEP) {
    a.update(STEP);
    b.update(STEP);
  }
  assert.deepEqual(a.state.patterns, b.state.patterns);
  assert.equal(a.state.score, b.state.score);
});

test("ruchomy telefon: strzałka 0,8 s przed ruchem, przejazd na sąsiedni tor przed dotarciem do sowy", () => {
  const run = createRun({
    seed: 1,
    patterns: PATTERNS.filter((item) => item.id === "t2-ruchomy"),
  });
  let warning = null;
  let moved = null;
  for (let time = 0; time < 8 && moved === null; time += STEP) {
    run.update(STEP);
    for (const event of run.takeEvents()) {
      if (event.type === "warning" && !warning) warning = { ...event, time: run.state.time };
    }
    const mover = run.state.obstacles.find((item) => item.kind === "telefon");
    if (warning && mover && mover.moveTo === undefined && mover.lane !== warning.lane) {
      moved = { time: run.state.time, z: mover.at - run.state.stageDistance, lane: mover.lane };
    }
  }
  assert.ok(warning, "strzałka ostrzegawcza");
  assert.equal(warning.lane, 0);
  assert.equal(warning.to, 1);
  assert.ok(moved, "telefon zmienił tor");
  assert.equal(moved.lane, 1);
  assert.ok(Math.abs(moved.time - warning.time - MOVING.warning - MOVING.switchTime) < 0.05);
  assert.ok(moved.z > run.state.speed * MOVING.lead * 0.9, `zostało ${moved.z.toFixed(1)} m`);
});

test("pościg dzików: tylko na blokowisku PRL, strzałka 1 s przed szarżą, dzik trafia sowę, która nie zmieni toru", () => {
  // Plansze bez pościgu: żadnego dzika.
  for (const stage of [0, 1, 3]) {
    const run = createRun({ seed: 3, startStage: stage, cozy: true, difficulty: "chill" });
    for (let time = 0; time < 40; time += STEP) run.update(STEP);
    assert.equal(run.takeEvents().filter((event) => event.type.startsWith("boar")).length, 0, `plansza ${stage}`);
  }
  // PRL bez przeszkód (tylko dziki): sowa stoi w torze — strzałka, po 1 s szarża, trafienie „dzik”.
  const idle = createRun({ seed: 3, startStage: 2, patterns: PATTERNS.filter((item) => item.id === "t0-oddech") });
  const events = [];
  for (let time = 0; time < 30 && !events.some((event) => event.type === "hit"); time += STEP) {
    idle.update(STEP);
    for (const event of idle.takeEvents()) events.push({ ...event, time: idle.state.time });
  }
  const warning = events.find((event) => event.type === "boarWarning");
  const charge = events.find((event) => event.type === "boarCharge");
  const hit = events.find((event) => event.type === "hit");
  assert.ok(warning && charge && hit, "strzałka, szarża i trafienie");
  assert.equal(warning.lane, 0);
  assert.ok(Math.abs(charge.time - warning.time - BOARS.warning) < 0.02);
  assert.equal(hit.family, "dzik");
  assert.match(hit.label, /Dzik/);
  assert.ok(idle.state.stageDistance >= BOARS.first, "pierwszy dzik po ok. 140 m");
  // Ta sama plansza, ale sowa ucieka na inny tor po strzałce: unik i premia.
  const dodge = createRun({ seed: 3, startStage: 2, patterns: PATTERNS.filter((item) => item.id === "t0-oddech") });
  let dodged = null;
  for (let time = 0; time < 30 && !dodged; time += STEP) {
    if (dodge.state.boars.some((item) => item.lane === dodge.state.owl.lane)) dodge.input("left");
    dodge.update(STEP);
    dodged = dodge.takeEvents().find((event) => event.type === "boarDodge") || null;
  }
  assert.ok(dodged, "unik przed dzikiem");
  assert.equal(dodged.bonus, BOARS.bonus);
  assert.equal(dodge.state.hits, 0);
  assert.equal(dodge.summary().boarsDodged, 1);
});
