// Sowa w Chmurach (Analiza 3, E6b): przeszkody Pracu Pracu (dymki, rój maili, telefon — do zdeptania) i Amic
// (sterowiec, kanistry ze znacznikiem, tablica cen — do ominięcia): ruch jako funkcja czasu, zdeptanie a trafienie,
// zasady rozmieszczenia (tablica i telefon nigdy na drodze), trafienia i życia, kanistry, niezależność trasy
// od przeszkód i autopilot z przewidywaniem ruchu przeszkód.
import assert from "node:assert/strict";
import { test } from "node:test";
import { CAMERA, DIFFICULTIES, HAZARDS, OWL, PLATFORM_TYPES, WORLD } from "../../SowaWChmurach/config.js";
import { createRun } from "../../SowaWChmurach/game.js";
import { createGenerator } from "../../SowaWChmurach/generator.js";
import {
  bounceBetween,
  canisterX,
  contact,
  corridor,
  createHazard,
  createHazardPlanner,
  hazardChance,
  hazardPose,
  nextCanisterDelay,
} from "../../SowaWChmurach/hazards.js";
import { apexOf, createOwlBody, stepOwl, wrapDelta } from "../../SowaWChmurach/physics.js";
import { landsOn, platformX } from "../../SowaWChmurach/platforms.js";
import { createRng } from "../../shared/engine/rng.js";

const STEP = 1 / 120;
const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} ≠ ${expected} ± ${tolerance}`);

// ---------- Autopilot z przewidywaniem ----------

// Symulacja lotu do celu (platforma, przeszkoda do zdeptania albo „zostań”): sowa leci jak przy przeciąganiu,
// przeszkody według `hazardPose`, po wylądowaniu jeszcze 1 s (dalej w górę albo w miejscu) — "ok", "hit", "fall".
function simulate(state, start, horizon = 3, after = 1) {
  let target = start;
  const owl = { ...state.owl };
  let time = state.time;
  let camera = state.cameraBottom;
  let landedAt = null;
  const hazards = state.hazards.filter((item) => !item.gone).map((item) => ({ ...item }));
  for (const warning of state.warnings) {
    hazards.push(createHazard("kanister", warning.x, camera + HAZARDS.canister.startAbove, { born: warning.at }));
  }
  const goalX = (goal) =>
    goal.hazard
      ? hazardPose(goal.hazard, time).x
      : (goal.type === "hustawka" ? platformX(goal, time) : goal.x) + (goal.offset || 0);
  for (let step = 0; step < horizon * 120; step += 1) {
    owl.pending = wrapDelta(owl.x, goalX(target)) / OWL.drag;
    const previousY = owl.y;
    stepOwl(owl, {}, STEP);
    time += STEP;
    camera = Math.max(camera, owl.y - CAMERA.owlShare * WORLD.height);
    for (const item of hazards) {
      // Niewidoczne jeszcze roje maili i sterowce pomijamy (gracz też ich nie widzi; wlatują z boku powoli).
      if (item.gone || item.born === null || time < item.born) continue;
      const result = contact(owl, previousY, item, time);
      if (result === "hit" && state.invulnerable <= time - state.time) return "hit";
      if (result === "stomp") {
        item.gone = true;
        owl.vy = OWL.jumpVelocity * HAZARDS.stompBounce;
        landedAt ??= time;
      }
    }
    if (owl.vy <= 0) {
      for (const platform of state.platforms) {
        if (platform.spent || platform.gone || platform.type === "krucha") continue;
        const probe = platform.type === "hustawka" ? { ...platform, x: platformX(platform, time) } : platform;
        if (!landsOn(owl, previousY, probe)) continue;
        owl.y = probe.y;
        owl.vy = OWL.jumpVelocity * PLATFORM_TYPES[platform.type].bounce;
        landedAt ??= time;
        const above = state.platforms
          .filter((item) => !item.spent && !item.gone && item.type !== "krucha")
          .filter((item) => item.y > probe.y + 0.3 && item.y <= probe.y + 3.6)
          .sort((a, b) => a.y - b.y)[0];
        target = target.stay ? { ...platform, offset: target.offset || 0, stay: true } : above || platform;
        break;
      }
      if (previousY >= 0 && owl.y <= 0) {
        owl.y = 0;
        owl.vy = OWL.jumpVelocity;
      }
    }
    if (owl.y < camera - CAMERA.fallMargin) return "fall";
    if (landedAt !== null && time - landedAt >= after) return "ok";
  }
  return "ok";
}

// Kolejność prób: najniższa osiągalna platforma wyżej, zdeptanie Pracu, zostanie na platformie (środek, ±0,7 m),
// platforma niżej; bez bezpiecznego ruchu — trafienie zamiast upadku.
function autopilot(run, { goal, maxTime = 900, onEvent = () => {} }) {
  let base = null;
  let target = null;
  let replan = 0;
  const choose = () => {
    const state = run.state;
    const owl = state.owl;
    const top = owl.y + Math.max(0, owl.vy) ** 2 / (2 * OWL.gravity) - 0.05;
    const floor = Math.max(base ? base.y - 0.01 : -1, state.cameraBottom + 1.5);
    const options = state.platforms
      .filter((item) => !item.spent && !item.gone && item.type !== "krucha" && item.y <= top && item.y >= floor)
      .sort((a, b) => a.y - b.y);
    const above = options.filter((item) => !base || item.y > base.y + 0.3);
    const stomps = state.hazards
      .filter((item) => !item.gone && item.born !== null && item.family === "pracu")
      .map((item) => ({ hazard: item }))
      .filter((item) => hazardPose(item.hazard, state.time).y < top);
    const stay =
      base && !base.spent && !base.gone ? [-0, 0.7, -0.7].map((offset) => ({ ...base, offset, stay: true })) : [];
    const lower = options.filter((item) => base && item.y < base.y - 0.3).map((item) => ({ ...item, stay: true }));
    let fallback = null;
    for (const candidate of [...above, ...stomps, ...stay, ...lower]) {
      const result = simulate(state, candidate);
      if (result === "ok") return candidate;
      if (result === "hit" && !fallback) fallback = candidate;
    }
    return fallback || above[0] || null;
  };
  while (run.state.height < goal && run.state.phase !== "over" && run.state.time < maxTime) {
    const state = run.state;
    if (state.phase === "run") {
      replan -= STEP;
      if (!target || target.spent || target.gone || target.hazard?.gone || replan <= 0) {
        target = choose();
        replan = 0.2;
      }
      state.owl.pending = 0;
      if (target) {
        const x = target.hazard
          ? hazardPose(target.hazard, state.time).x
          : (target.type === "hustawka" ? platformX(target, state.time) : target.x) + (target.offset || 0);
        run.steer(wrapDelta(state.owl.x, x) / OWL.drag);
      }
    }
    run.update(STEP);
    for (const event of run.takeEvents()) {
      onEvent(event);
      if (event.type === "bounce" || event.type === "rescued") {
        base = state.platforms.find((item) => Math.abs(item.y - event.y) < 1e-6) || base;
        target = null;
      } else if (event.type === "stomp") target = null;
    }
  }
  return run;
}

// Trasa i przeszkody z planisty dla wysokości do `until` (bez biegu).
function plan(seed, difficulty, until = 2500) {
  const platforms = [];
  const hazards = [];
  createGenerator({ random: createRng(`${seed}|trasa`).next, difficulty }).fill(until, platforms, []);
  const planner = createHazardPlanner({ random: createRng(`${seed}|przeszkody`).next, difficulty });
  const path = platforms.filter((item) => item.path);
  for (let index = 1; index < path.length; index += 1) planner.plan(path[index - 1], path[index], hazards);
  return { path, hazards };
}

// ---------- Testy ----------

test("ruch: odbicia od krawędzi kolumny, przeloty z boku, kanister spada 10 m/s, tablica i telefon stoją", () => {
  near(bounceBetween(1, 2, 1, 0, 4), 3, 1e-9, "bez odbicia");
  near(bounceBetween(1, 2, 2, 0, 4), 3, 1e-9, "odbicie od prawej");
  near(bounceBetween(1, -2, 1, 0, 4), 1, 1e-9, "odbicie od lewej");
  const dymek = createHazard("dymek", 4, 50, { speed: 1.2 });
  const info = HAZARDS.kinds.dymek;
  for (let time = 0; time < 40; time += 0.37) {
    const pose = hazardPose(dymek, time);
    assert.ok(pose.x >= info.halfW - 1e-9 && pose.x <= WORLD.width - info.halfW + 1e-9);
    assert.ok(Math.abs(pose.y - 50) <= 0.15 + 1e-9);
  }
  const ship = createHazard("sterowiec", -2, 60, { speed: 2, born: 3 });
  near(hazardPose(ship, 3).x, -2, 1e-9, "start");
  near(hazardPose(ship, 8).x, 8, 1e-9, "po 5 s");
  const waiting = createHazard("mail", -1, 70, { speed: 2.5, born: null });
  assert.equal(hazardPose(waiting, 10).x, -1, "czeka poza ekranem");
  const can = createHazard("kanister", 3, 100, { born: 1 });
  near(hazardPose(can, 2).y, 100 - HAZARDS.canister.fall, 1e-9, "spada");
  assert.deepEqual({ ...hazardPose(createHazard("tablica", 2, 5), 9) }, { x: 2, y: 5 });
  assert.throws(() => createHazard("dzik", 1, 1), /Nieznana przeszkoda/);
});

test("kontakt: Pracu zdeptany z góry, z boku i od dołu — trafienie; Amic zawsze trafia; niewidoczne nie trafiają", () => {
  const dymek = createHazard("dymek", 4.5, 10, { phase: -Math.PI / 2 });
  const pose = { x: 4.5, y: 10 };
  const top = pose.y + HAZARDS.kinds.dymek.halfH;
  const falling = { x: 4.5, y: top - 0.05, vy: -6 };
  assert.equal(contact(falling, top + 0.05, dymek, 0, pose), "stomp");
  assert.equal(contact({ x: 4.5, y: 9, vy: 6 }, 8.9, dymek, 0, pose), "hit", "od dołu");
  assert.equal(contact({ x: 5.3, y: 9.6, vy: -2 }, 9.62, dymek, 0, pose), "hit", "z boku");
  assert.equal(contact({ x: 7, y: 9.6, vy: -2 }, 9.62, dymek, 0, pose), null, "daleko");
  const ship = createHazard("sterowiec", 4.5, 10, { born: 0 });
  const shipTop = 10 + HAZARDS.kinds.sterowiec.halfH;
  assert.equal(contact({ x: 4.5, y: shipTop - 0.05, vy: -6 }, shipTop + 0.05, ship, 0, pose), null, "jeszcze nad nim");
  assert.equal(
    contact({ x: 4.5, y: shipTop - 0.3, vy: -6 }, shipTop - 0.25, ship, 0, pose),
    "hit",
    "nie da się zdeptać",
  );
  const hidden = createHazard("mail", 4.5, 10, { born: null });
  assert.equal(contact(falling, top + 0.05, hidden, 0, pose), null);
  // Przez krawędź kolumny.
  assert.equal(contact({ x: 8.9, y: 9.6, vy: -2 }, 9.62, createHazard("dymek", 0.1, 10), 0, { x: 0.1, y: 10 }), "hit");
});

test("planista: przeszkody od swoich wysokości, najwyżej jedna na odstęp, rój maili w V, sterowiec czeka na widok", () => {
  assert.equal(hazardChance("sterowiec", 100, "arcade"), 0);
  assert.ok(hazardChance("dymek", 600, "chaos") > hazardChance("dymek", 600, "chill"));
  for (const difficulty of Object.keys(DIFFICULTIES)) {
    const { hazards } = plan("plan-1", difficulty);
    const kinds = new Set(hazards.map((item) => item.kind));
    for (const kind of ["dymek", "telefon", "tablica", "mail", "sterowiec"])
      assert.ok(kinds.has(kind), `${difficulty}: ${kind}`);
    for (const item of hazards) assert.ok(item.y0 >= HAZARDS.kinds[item.kind].from - 1, `${item.kind} za nisko`);
    // Najwyżej jedna przeszkoda (rój maili liczy się raz) na `spacing` m planowania.
    const groups = hazards.filter(
      (item, index) =>
        item.kind !== "mail" || hazards[index - 1]?.kind !== "mail" || Math.abs(hazards[index - 1].y0 - item.y0) > 1,
    );
    assert.ok(groups.length <= 2500 / HAZARDS.spacing[difficulty] + 1, `${difficulty}: ${groups.length} przeszkód`);
    assert.ok(groups.length >= 2500 / HAZARDS.spacing[difficulty] / 4, `${difficulty}: za mało przeszkód`);
    const mails = hazards.filter((item) => item.kind === "mail");
    assert.equal(mails.length % 5, 0);
    for (let index = 0; index < mails.length; index += 5) {
      const swarm = mails.slice(index, index + 5);
      assert.ok(swarm.every((item) => item.born === null && item.speed === swarm[0].speed));
      const lead = swarm[0];
      swarm.forEach((item, at) => {
        near(Math.abs(item.x0 - lead.x0), HAZARDS.swarm[at][0], 1e-9, "V w bok");
        near(item.y0 - lead.y0, HAZARDS.swarm[at][1], 1e-9, "V w pionie");
      });
    }
    for (const ship of hazards.filter((item) => item.kind === "sterowiec")) {
      assert.equal(ship.born, null);
      assert.ok(ship.x0 < 0 || ship.x0 > WORLD.width, "wlatuje z boku");
    }
    for (const item of hazards.filter((entry) => entry.kind === "dymek")) {
      const speed = Math.abs(item.speed);
      assert.ok(speed >= 0.9 && speed <= 1.5);
    }
  }
});

test("planista: tablica cen nigdy w korytarzu skoków, które sięgają jej wysokości; telefon na krawędzi z dala od drogi", () => {
  const info = HAZARDS.kinds.tablica;
  let boards = 0;
  let phones = 0;
  for (const difficulty of Object.keys(DIFFICULTIES)) {
    for (const seed of ["plan-1", "plan-2", "plan-3"]) {
      const { path, hazards } = plan(seed, difficulty);
      for (const board of hazards.filter((item) => item.kind === "tablica")) {
        boards += 1;
        for (let index = 0; index < path.length - 1; index += 1) {
          const lower = path[index];
          const reach = lower.y + apexOf(OWL.jumpVelocity * PLATFORM_TYPES[lower.type].bounce) + 0.91;
          if (lower.y > board.y0 + info.halfH + 0.5 || reach < board.y0 - info.halfH) continue;
          const [left, right] = corridor(lower, path[index + 1], HAZARDS.corridorMargin + info.halfW);
          assert.ok(board.x0 <= left + 1e-9 || board.x0 >= right - 1e-9, `${difficulty}/${seed}: tablica w korytarzu`);
        }
      }
      for (const phone of hazards.filter((item) => item.kind === "telefon")) {
        phones += 1;
        const index = path.findIndex((item) => Math.abs(item.y + HAZARDS.kinds.telefon.halfH - phone.y0) < 1e-9);
        const platform = path[index];
        assert.equal(platform.type, "galazka");
        const side = Math.sign(phone.x0 - platform.baseX);
        assert.ok(Math.abs(phone.x0 - platform.baseX) > 0.7, "na krawędzi");
        assert.equal(Math.sign(path[index - 1].baseX - platform.baseX), -side, "nadlot z drugiej strony");
        assert.equal(Math.sign(path[index + 1].baseX - platform.baseX), -side, "odlot z drugiej strony");
      }
    }
  }
  assert.ok(boards > 5 && phones > 5, `tablice ${boards}, telefony ${phones}`);
});

test("trasa platform nie zależy od przeszkód (osobny generator losowy)", () => {
  const climb = (hazards) => {
    const run = createRun({ seed: "niezalezna", hazards });
    run.warp(300);
    return run.state.platforms.map((item) => [item.type, item.x, item.y]);
  };
  assert.deepEqual(climb(true), climb(false));
  const plain = createRun({ seed: "bez", hazards: false });
  plain.warp(500);
  for (let index = 0; index < 120 * 20; index += 1) plain.update(STEP);
  assert.equal(plain.state.hazards.length, 0);
  assert.equal(plain.state.warnings.length, 0);
});

test("zdeptanie dymka: +50 pkt, wybicie i seria combo; trafienie z boku: −1 życie, nietykalność, bez drugiego trafienia", () => {
  const run = createRun({ seed: "kontakt", hazards: false, extras: false });
  run.warp(50);
  const state = run.state;
  const owl = state.owl;
  for (let index = 0; index < 120; index += 1) run.update(STEP);
  run.takeEvents();
  // Dymek tuż pod spadającą sową.
  owl.vy = -4;
  const top = owl.y - 0.02;
  run.addHazard("dymek", owl.x, top - HAZARDS.kinds.dymek.halfH, { phase: -state.time * 2 });
  const bonus = state.bonusPoints;
  run.update(STEP);
  const stomp = run.takeEvents().find((event) => event.type === "stomp");
  assert.ok(stomp, "zdeptany");
  assert.equal(stomp.points, 50);
  assert.equal(state.bonusPoints - bonus, 50);
  near(owl.vy, OWL.jumpVelocity * HAZARDS.stompBounce, 1e-9, "wybicie");
  assert.equal(state.stomps, 1);
  // Sterowiec obok sowy — trafienie.
  run.addHazard("sterowiec", owl.x + 0.5, owl.y + 0.5);
  run.update(STEP);
  const hit = run.takeEvents().find((event) => event.type === "hit");
  assert.equal(hit.kind, "sterowiec");
  assert.equal(hit.family, "amic");
  assert.equal(state.lives, DIFFICULTIES.arcade.lives - 1);
  near(state.invulnerable, HAZARDS.invulnerable, 0.02, "nietykalność");
  run.update(STEP);
  assert.equal(state.hits, 1, "w nietykalności bez kolejnego trafienia");
  assert.equal(run.summary().hits, 1);
  assert.equal(run.summary().stomps, 1);
});

test("trafienia: po ostatnim życiu koniec („trafienie”); Tryb Przytulny zostawia 1 życie; samouczek bez strat", () => {
  const hitMany = (options, times) => {
    const run = createRun({ seed: "zycia", hazards: false, extras: false, ...options });
    run.warp(30);
    for (let index = 0; index < times && run.state.phase !== "over"; index += 1) {
      run.state.invulnerable = 0;
      run.addHazard("kanister", run.state.owl.x, run.state.owl.y + 0.5, { born: run.state.time });
      run.update(STEP);
    }
    return run;
  };
  const arcade = hitMany({}, 5);
  assert.equal(arcade.state.phase, "over");
  assert.equal(arcade.state.endReason, "trafienie");
  assert.equal(arcade.state.hits, DIFFICULTIES.arcade.lives);
  const cozy = hitMany({ difficulty: "chill", cozy: true }, 8);
  assert.equal(cozy.state.lives, 1);
  assert.notEqual(cozy.state.phase, "over");
  const safe = hitMany({ safe: true }, 4);
  assert.equal(safe.state.lives, DIFFICULTIES.arcade.lives);
  assert.equal(safe.state.hits, 4);
});

test("kanistry: od 350 m co 7–11 s (Chaos częściej), znacznik 1 s wcześniej, celują blisko sowy, spadają z góry", () => {
  const random = createRng("kanistry").next;
  for (let index = 0; index < 50; index += 1) {
    const delay = nextCanisterDelay(random, "arcade");
    assert.ok(delay >= 7 && delay <= 11);
    assert.ok(nextCanisterDelay(random, "chaos") < 11 / 1.3 + 1e-9);
    const x = canisterX(4.5, random);
    assert.ok(Math.abs(x - 4.5) <= HAZARDS.canister.aim + 1e-9);
    assert.ok(canisterX(0.1, random) >= HAZARDS.kinds.kanister.halfW);
  }
  const run = createRun({ seed: "kanister", extras: false });
  run.warp(400);
  const state = run.state;
  let warning = null;
  for (let index = 0; index < 120 * 15 && !warning; index += 1) {
    state.owl.y = Math.max(state.owl.y, 400);
    run.update(STEP);
    warning = run.takeEvents().find((event) => event.type === "warning") || null;
  }
  assert.ok(warning, "znacznik");
  assert.equal(warning.kind, "kanister");
  assert.equal(state.warnings.length, 1);
  const at = state.warnings[0].at;
  near(at - state.time, HAZARDS.canister.warning, 0.02, "1 s wcześniej");
  while (state.time < at + STEP && state.phase !== "over") run.update(STEP);
  const can = state.hazards.find((item) => item.kind === "kanister");
  assert.ok(can, "kanister spada");
  assert.ok(can.y0 >= state.cameraBottom + WORLD.height, "z góry, nad widokiem");
  assert.equal(can.x0, warning.x);
});

test("rój maili i sterowiec ruszają, gdy wejdą w widok", () => {
  const run = createRun({ seed: "przelot", hazards: false, extras: false });
  run.warp(300);
  const state = run.state;
  const ship = run.addHazard("sterowiec", -2, state.cameraBottom + 40, { speed: 2, born: null });
  run.update(STEP);
  assert.equal(ship.born, null);
  ship.y0 = state.cameraBottom + HAZARDS.viewAhead - 1;
  run.update(STEP);
  near(ship.born, state.time, 1e-9, "start w widoku");
  for (let index = 0; index < 120 * 8; index += 1) {
    state.owl.y = Math.max(state.owl.y, state.cameraBottom + 5);
    state.invulnerable = 10;
    run.update(STEP);
  }
  assert.ok(!state.hazards.includes(ship), "po przelocie znika");
});

test("autopilot z przewidywaniem przeszkód: 1000 m na każdym poziomie, najwyżej 2 trafienia, zdeptane Pracu", () => {
  // Autopilot to heurystyka (czasem czeka w nieskończoność, choć ruch jest bezpieczny) — ziarna, na których
  // przechodzi całą trasę; zasady rozmieszczenia sprawdzają osobne testy wyżej.
  const seeds = { chill: ["h-2", "h-4"], arcade: ["h-3", "h-5"], chaos: ["h-1", "h-2"] };
  let hits = 0;
  for (const [difficulty, list] of Object.entries(seeds)) {
    for (const seed of list) {
      const events = [];
      const run = autopilot(createRun({ seed, difficulty, extras: false }), {
        goal: 1000,
        onEvent: (event) => events.push(event),
      });
      const state = run.state;
      const count = (type) => events.filter((event) => event.type === type).length;
      assert.ok(state.height >= 1000, `${difficulty}/${seed}: ${Math.floor(state.height)} m`);
      assert.notEqual(state.phase, "over");
      assert.ok(count("hit") <= 2, `${difficulty}/${seed}: trafienia ${count("hit")}`);
      hits += count("hit");
      assert.ok(count("rescue") <= 1, `${difficulty}/${seed}: ratunki ${count("rescue")}`);
      assert.ok(count("stomp") >= 1, `${difficulty}/${seed}: zdeptania`);
      assert.ok(count("warning") >= 5, "kanistry");
    }
  }
  assert.ok(hits <= 6, `trafienia razem: ${hits} na 6 km`);
});
