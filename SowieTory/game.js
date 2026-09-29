// Sowie Tory — logika biegu (bez DOM i bez rysowania; testy jednostkowe i symulacje w Node).
// Stan w jednym obiekcie; zdarzenia (skok, liść, trafienie…) trafiają do kolejki `events`, z której korzysta
// strona (dźwięk, komunikaty, cząsteczki, SowieProgress). Położenia przeszkód i liści: `at` — metry od początku
// planszy; głębokość przed sową z = at − stageDistance.
import { createRng } from "../shared/engine/rng.js";
import { BOARS, COZY_SPEED, DIFFICULTIES, LEAVES, MOVING, OWL, PROJECTION, SCORE, TRACK } from "./config.js";
import { OBSTACLES, collides, obstacleShape, obstacleX } from "./obstacles.js";
import { createTrack, gapAfter, PATTERNS } from "./patterns.js";
import { createOwlBody, stepOwl } from "./physics.js";
import { laneX } from "./projection.js";
import { STAGES, STAGE_COUNT, stageKind } from "./stages.js";

// Prędkość (m/s) na planszy `stage` przy postępie `progress` (0–1): łagodny wzrost, każda plansza szybsza.
export function speedAt(progress, difficulty = "arcade", stage = 0, cozy = false) {
  const config = DIFFICULTIES[difficulty] || DIFFICULTIES.arcade;
  const u = Math.min(1, Math.max(0, progress));
  const ramp = 1 - (1 - u) * (1 - u);
  const speed = config.speedStart + (config.speedMax - config.speedStart) * ramp + stage * config.stageStep;
  return cozy ? speed * COZY_SPEED : speed;
}

// Poziom combo (×1–×5): +1 co SCORE.comboStep liści bez trafienia.
export const comboLevel = (streak) => Math.min(SCORE.comboMax, 1 + Math.floor(streak / SCORE.comboStep));

// Odległość (m), z której ruchomy telefon zaczyna ostrzegać strzałką (przy danej prędkości).
export const moverTrigger = (speed) => speed * (MOVING.warning + MOVING.switchTime + MOVING.lead);

export function createRun({
  difficulty = "arcade",
  seed = Date.now(),
  cozy = false,
  random = null,
  patterns = PATTERNS,
  intro = [],
  safe = false,
  startStage = 0,
} = {}) {
  const rng = random || createRng(seed).next;
  const level = DIFFICULTIES[difficulty] ? difficulty : "arcade";
  const lives = DIFFICULTIES[level].lives;
  const owl = createOwlBody(0);
  const obstacles = [];
  const leaves = [];
  const events = [];
  const controls = { left: false, right: false, up: false, down: false };
  let track = createTrack({ random: rng, patterns, intro });
  let lastLaneChange = -Infinity;
  const boars = [];
  const chaseOn = (stage) => Boolean(STAGES[stage % STAGE_COUNT].chase);
  const firstBoar = (stage) => (chaseOn(stage) ? BOARS.first + rng() * 30 : Infinity);

  const state = {
    difficulty: level,
    cozy: Boolean(cozy),
    safe: Boolean(safe),
    phase: "run", // run | stageEnd | over
    time: 0,
    stage: startStage,
    stageTime: 0,
    stageDistance: 0,
    distance: 0,
    speed: speedAt(0, level, startStage, cozy),
    lives,
    maxLives: lives,
    invulnerable: 0,
    hits: 0,
    stageHits: 0,
    stageLeaves: 0,
    leafCount: 0,
    leafPoints: 0,
    bonusPoints: 0,
    streak: 0,
    combo: 1,
    bestCombo: 1,
    nearMisses: 0,
    score: 0,
    trackEnd: TRACK.startClear,
    patterns: [],
    stagesDone: 0,
    owl,
    obstacles,
    leaves,
    // Pościg dzików (plansza PRL): szarżujące dziki (z — względem sowy) i dystans następnej szarży.
    boars,
    nextBoarAt: firstBoar(startStage),
    boarsDodged: 0,
    endReason: null,
  };

  function emit(type, detail = {}) {
    events.push({ type, ...detail });
  }

  function place(chosen, start) {
    for (const item of chosen.items) {
      if (item.type === "obstacle") {
        obstacles.push({
          // Skórka planszy: np. wózek → wózek sklepowy w Biedronce, samochód na stacji Amic.
          kind: stageKind(state.stage, item.kind),
          lane: item.lane,
          at: start + item.z,
          moveTo: item.moveTo,
          moveProgress: item.moveTo === undefined ? undefined : 0,
          warnedAt: null,
          passed: false,
          hit: false,
        });
      } else {
        leaves.push({ lane: item.lane, at: start + item.z, y: item.y, kind: item.kind || "zielony", taken: false });
      }
    }
    obstacles.sort((a, b) => a.at - b.at);
    leaves.sort((a, b) => a.at - b.at);
  }

  // Nowe wzory przed sową aż do granicy widoczności; ostatnie metry planszy bez przeszkód (meta).
  function spawn() {
    const limit = TRACK.stageLength - TRACK.finishClear;
    while (state.trackEnd < state.stageDistance + PROJECTION.farZ + 10) {
      const start = state.trackEnd;
      const chosen = track.choose(state.stage * TRACK.stageLength + start, STAGES[state.stage % STAGE_COUNT].id);
      if (start + chosen.length > limit) {
        state.trackEnd = Infinity;
        break;
      }
      place(chosen, start);
      state.patterns.push(chosen.id);
      if (state.patterns.length > 12) state.patterns.shift();
      emit("pattern", { id: chosen.id, start, length: chosen.length });
      state.trackEnd = start + chosen.length + gapAfter(state.speed, level);
    }
  }

  function updateScore() {
    state.score =
      Math.floor((state.stage * TRACK.stageLength + state.stageDistance) * SCORE.perMeter) +
      state.leafPoints +
      state.bonusPoints;
  }

  // Trafienie przeszkodą (`item` z listy) albo dzikiem (`info` z etykietą).
  function hit(item, info = OBSTACLES[item.kind]) {
    item.hit = true;
    if (state.safe) {
      emit("safeHit", { kind: item.kind });
      return;
    }
    state.hits += 1;
    state.stageHits += 1;
    state.invulnerable = OWL.invulnerable;
    // Trafienie obniża combo o 1 poziom (nie do zera).
    state.streak = Math.max(0, (state.combo - 2) * SCORE.comboStep);
    state.combo = comboLevel(state.streak);
    state.lives -= 1;
    if (state.cozy) state.lives = Math.max(1, state.lives);
    emit("hit", { kind: item.kind, family: info.family, label: info.label, lives: state.lives });
    if (state.lives <= 0) end("trafienia");
  }

  function collect(item) {
    item.taken = true;
    const points = item.kind === "zloty" ? 50 : SCORE.leaf;
    const count = item.kind === "zloty" ? 5 : 1;
    const before = state.combo;
    state.streak += 1;
    state.combo = comboLevel(state.streak);
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    const gained = points * state.combo;
    state.leafPoints += gained;
    state.leafCount += count;
    state.stageLeaves += count;
    emit("leaf", { kind: item.kind, lane: item.lane, points: gained, count, combo: state.combo });
    if (state.combo > before) emit("combo", { value: state.combo });
  }

  function updateMovers(dt) {
    const trigger = moverTrigger(state.speed);
    for (const item of obstacles) {
      if (item.moveTo === undefined) continue;
      const z = item.at - state.stageDistance;
      if (item.warnedAt === null) {
        if (z > trigger) continue;
        item.warnedAt = state.time;
        emit("warning", { kind: item.kind, lane: item.lane, to: item.moveTo });
      }
      const since = state.time - item.warnedAt - MOVING.warning;
      if (since > 0) item.moveProgress = Math.min(1, item.moveProgress + dt / MOVING.switchTime);
      if (item.moveProgress >= 1) {
        item.lane = item.moveTo;
        item.moveTo = undefined;
        item.moveProgress = undefined;
      }
    }
  }

  function checkObstacles() {
    for (const item of obstacles) {
      const z = item.at - state.stageDistance;
      if (z > 3) break;
      if (item.hit || item.passed) continue;
      const shape = obstacleShape(item.kind);
      if (z + shape.depth < -OWL.halfDepth) {
        item.passed = true;
        // „O włos!”: pełna przeszkoda minięta tuż po zmianie toru, w sąsiednim torze.
        if (
          shape.type === "full" &&
          state.time - lastLaneChange < 0.45 &&
          Math.abs(owl.x - obstacleX(item)) < laneX(1) * 1.2
        ) {
          state.nearMisses += 1;
          state.bonusPoints += 25;
          emit("nearMiss", { kind: item.kind, family: OBSTACLES[item.kind].family, bonus: 25 });
        }
        continue;
      }
      if (state.invulnerable > 0) continue;
      if (collides(owl, item, z)) hit(item);
    }
  }

  // Czy obok toru `lane` (sąsiedni tor — ucieczka bez przebiegania przez trzeci tor) nie ma pełnych przeszkód
  // od sowy do `ahead` m przed nią (ucieczka przed dzikiem)?
  function escapeLane(lane, ahead) {
    return [-1, 0, 1].some((other) => {
      if (Math.abs(other - lane) !== 1) return false;
      return !obstacles.some((item) => {
        const z = item.at - state.stageDistance;
        const shape = obstacleShape(item.kind);
        if (shape.type !== "full" || z > ahead || z + shape.depth < -1) return false;
        return item.lane === other || item.moveTo === other;
      });
    });
  }

  // Pościg dzików: szarża w torze sowy (strzałka 1 s wcześniej), tylko gdy jest wolny tor ucieczki.
  function updateBoars(dt) {
    if (
      !boars.length &&
      state.stageDistance >= state.nextBoarAt &&
      state.stageDistance < TRACK.stageLength - BOARS.lastClear
    ) {
      if (escapeLane(owl.lane, state.speed * BOARS.fairLook)) {
        boars.push({ lane: owl.lane, z: BOARS.start, time: 0, phase: "warning", hit: false, passed: false });
        emit("boarWarning", { lane: owl.lane });
      } else state.nextBoarAt = state.stageDistance + BOARS.retry;
    }
    for (let index = boars.length - 1; index >= 0; index -= 1) {
      const boar = boars[index];
      boar.time += dt;
      if (boar.phase === "warning") {
        if (boar.time < BOARS.warning) continue;
        boar.phase = "charge";
        emit("boarCharge", { lane: boar.lane });
      }
      boar.z += BOARS.speed * dt;
      const near = Math.abs(boar.z) < OWL.halfDepth + 0.4;
      const sameLane = Math.abs(owl.x - laneX(boar.lane)) < OWL.halfWidth + BOARS.halfWidth;
      if (!boar.hit && !boar.passed && near && sameLane && state.invulnerable <= 0) {
        hit(boar, { family: "dzik", label: "Dzik! Uciekaj na inny tor!" });
      }
      if (!boar.hit && !boar.passed && boar.z > OWL.halfDepth + 0.4) {
        boar.passed = true;
        state.boarsDodged += 1;
        state.bonusPoints += BOARS.bonus;
        emit("boarDodge", { lane: boar.lane, bonus: BOARS.bonus });
      }
      if (boar.z > PROJECTION.farZ * 0.6) {
        boars.splice(index, 1);
        state.nextBoarAt = state.stageDistance + BOARS.every[0] + rng() * (BOARS.every[1] - BOARS.every[0]);
      }
    }
  }

  function checkLeaves() {
    for (const item of leaves) {
      const z = item.at - state.stageDistance;
      if (z > LEAVES.reachZ) break;
      if (item.taken || z < -LEAVES.reachZ) continue;
      if (Math.abs(owl.x - laneX(item.lane)) < LEAVES.reachX && Math.abs(owl.y + 0.5 - item.y) < 0.9) collect(item);
    }
  }

  function cleanup() {
    const before = state.stageDistance - 12;
    while (obstacles.length && obstacles[0].at < before) obstacles.shift();
    while (leaves.length && leaves[0].at < before) leaves.shift();
  }

  function end(reason) {
    if (state.phase === "over") return;
    state.phase = "over";
    state.endReason = reason;
    updateScore();
    emit("over", { reason });
  }

  function finishStage() {
    state.phase = "stageEnd";
    state.stagesDone += 1;
    state.bonusPoints += SCORE.stageBonus;
    const noHit = state.stageHits === 0;
    if (noHit) state.bonusPoints += SCORE.noHitBonus;
    updateScore();
    emit("stageEnd", {
      stage: state.stage,
      leaves: state.stageLeaves,
      hits: state.stageHits,
      bonus: SCORE.stageBonus + (noHit ? SCORE.noHitBonus : 0),
      last: state.stage + 1 >= STAGE_COUNT,
    });
  }

  const api = {
    state,
    events,
    // Gest albo klawisz: "left" | "right" | "up" | "down" — wykonany w najbliższym kroku.
    input(direction) {
      if (direction in controls) controls[direction] = true;
    },
    update(dt) {
      if (state.phase !== "run") return;
      state.time += dt;
      state.stageTime += dt;
      state.speed = speedAt(state.stageDistance / TRACK.stageLength, level, state.stage, state.cozy);
      const moved = state.speed * dt;
      state.stageDistance += moved;
      state.distance += moved;
      state.invulnerable = Math.max(0, state.invulnerable - dt);
      const motion = stepOwl(owl, controls, dt);
      controls.left = controls.right = controls.up = controls.down = false;
      for (const type of motion) {
        if (type === "lane") lastLaneChange = state.time;
        emit(type, { lane: owl.lane });
      }
      spawn();
      updateMovers(dt);
      checkObstacles();
      if (state.phase === "run" && chaseOn(state.stage)) updateBoars(dt);
      if (state.phase !== "run") return;
      checkLeaves();
      cleanup();
      updateScore();
      if (state.stageDistance >= TRACK.stageLength) finishStage();
    },
    // Następna plansza (po finale); po ostatniej — koniec kampanii.
    nextStage() {
      if (state.phase !== "stageEnd") return false;
      if (state.stage + 1 >= STAGE_COUNT) {
        end("kampania");
        return false;
      }
      state.stage += 1;
      state.stageTime = 0;
      state.stageDistance = 0;
      state.stageHits = 0;
      state.stageLeaves = 0;
      state.trackEnd = TRACK.startClear;
      obstacles.length = 0;
      leaves.length = 0;
      boars.length = 0;
      state.nextBoarAt = firstBoar(state.stage);
      Object.assign(owl, createOwlBody(owl.lane));
      state.invulnerable = 1;
      state.phase = "run";
      emit("stage", { stage: state.stage });
      return true;
    },
    end,
    setSafe(value) {
      state.safe = Boolean(value);
    },
    // Testy i diagnostyka: przeskok o `meters` (czysta trasa od nowego miejsca).
    warp(meters) {
      obstacles.length = 0;
      leaves.length = 0;
      boars.length = 0;
      state.stageDistance = Math.min(TRACK.stageLength - 1, state.stageDistance + meters);
      state.distance += meters;
      state.trackEnd = state.stageDistance + 10;
      if (chaseOn(state.stage)) state.nextBoarAt = Math.max(state.nextBoarAt, state.stageDistance + 20);
      track = createTrack({ random: rng, patterns });
    },
    takeEvents() {
      return events.splice(0, events.length);
    },
    summary() {
      return {
        score: state.score,
        distance: Math.floor(state.distance),
        leaves: state.leafCount,
        bestCombo: state.bestCombo,
        hits: state.hits,
        nearMisses: state.nearMisses,
        boarsDodged: state.boarsDodged,
        stages: state.stagesDone,
        stage: state.stage,
        finished: state.endReason === "kampania",
      };
    },
  };
  emit("stage", { stage: state.stage });
  return api;
}
