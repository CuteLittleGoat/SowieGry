// Sowia Ucieczka — logika biegu (bez DOM i bez rysowania; testy jednostkowe i symulacje w Node).
// Stan w jednym obiekcie; zdarzenia (skok, liść, trafienie, „O włos!”…) trafiają do kolejki `events`,
// z której korzysta strona (dźwięk, komunikaty, cząsteczki, SowieProgress).
import { createRng } from "../shared/engine/rng.js";
import { CLOUD, COZY_SPEED, DIFFICULTIES, PHYSICS, PLATFORM_LEVELS, SCORE, TRACK } from "./config.js";
import { moverTriggerDistance } from "./camera.js";
import { OBSTACLES, obstacleBox, overlaps } from "./obstacles.js";
import { createTrack, gapAfter, PATTERNS } from "./patterns.js";
import { createOwlBody, owlBox, stepOwl } from "./physics.js";

// Prędkość w chwili t (s): łagodny wzrost przez rampSeconds (ease-out).
export function speedAt(time, difficulty = "arcade", cozy = false) {
  const config = DIFFICULTIES[difficulty] || DIFFICULTIES.arcade;
  const u = Math.min(1, Math.max(0, time / config.rampSeconds));
  const speed = config.speedStart + (config.speedMax - config.speedStart) * (1 - (1 - u) * (1 - u));
  return cozy ? speed * COZY_SPEED : speed;
}

// Poziom combo (×1–×5): +1 co 10 liści bez trafienia.
export const comboLevel = (streak) => Math.min(SCORE.comboMax, 1 + Math.floor(streak / SCORE.comboStep));

/**
 * Świat: podłoże z dziurami i platformy jednostronne (wskakuje się od dołu, ląduje z góry).
 * Obiekty w tablicach posortowanych po x; stare usuwane za sową.
 */
export function createWorld() {
  const holes = [];
  const platforms = [];

  function groundAt(x, half) {
    // Sowa stoi na ziemi, dopóki środek (± 0,25 j.) nie jest w całości nad dziurą — gra wybacza.
    const left = x - Math.min(half, 0.25);
    const right = x + Math.min(half, 0.25);
    for (const item of holes) {
      if (item.x > right) break;
      if (left >= item.x && right <= item.x + item.width) return false;
    }
    return true;
  }

  return {
    holes,
    platforms,
    groundAt,
    surfaceAt(x, half, y) {
      if (y >= 0) return groundAt(x, half) ? 0 : null;
      for (const item of platforms) {
        if (item.x > x + half) break;
        if (Math.abs(item.y - y) < 1e-6 && x + half > item.x && x - half < item.x + item.width) return item.y;
      }
      return null;
    },
    surfaceBelow(x, half, previous, bottom, dropping) {
      let best = null;
      for (const item of platforms) {
        if (item.x > x + half) break;
        if (x + half <= item.x || x - half >= item.x + item.width) continue;
        if (dropping !== null && item.y <= dropping + 1e-6) continue;
        if (previous <= item.y + 1e-6 && bottom >= item.y && (best === null || item.y < best)) best = item.y;
      }
      if (best !== null) return best;
      if (previous <= 1e-6 && bottom >= 0 && groundAt(x, half)) return 0;
      return null;
    },
    cleanup(before) {
      while (holes.length && holes[0].x + holes[0].width < before) holes.shift();
      while (platforms.length && platforms[0].x + platforms[0].width < before) platforms.shift();
    },
  };
}

const HIT_FAMILY = { dziura: "dziura" };

export function createRun({
  difficulty = "arcade",
  seed = Date.now(),
  cozy = false,
  random = null,
  patterns = PATTERNS,
  startDistance = 0,
} = {}) {
  const rng = random || createRng(seed).next;
  const config = DIFFICULTIES[difficulty] ? difficulty : "arcade";
  const world = createWorld();
  const track = createTrack({ difficulty: config, random: rng, patterns });
  const owl = createOwlBody(startDistance);
  const controls = { jump: false, down: false, hold: false, holdTime: 0 };
  const obstacles = [];
  const leaves = [];
  const events = [];
  const box = { left: 0, right: 0, top: 0, bottom: 0 };
  const other = { left: 0, right: 0, top: 0, bottom: 0 };

  const state = {
    difficulty: config,
    cozy: Boolean(cozy) && config === "chill",
    time: 0,
    speed: speedAt(0, config, cozy),
    distance: 0,
    owl,
    world,
    obstacles,
    leaves,
    trackEnd: startDistance + 6,
    patternCount: 0,
    cloud: CLOUD.steps,
    sinceHit: 0,
    invulnerable: 0,
    stunned: 0,
    score: 0,
    leafPoints: 0,
    leafCount: 0,
    streak: 0,
    combo: 1,
    bestCombo: 1,
    nearMisses: 0,
    hits: 0,
    ended: false,
    endReason: null,
    pendingPress: 0,
    patterns: [],
  };

  function emit(type, detail = {}) {
    events.push({ type, ...detail });
  }

  // Wzór → obiekty świata (od pozycji `start`).
  function place(chosen, start) {
    for (const item of chosen.items) {
      const base = item.level ? -PLATFORM_LEVELS[item.level - 1] : 0;
      if (item.type === "obstacle") {
        obstacles.push({
          kind: item.kind,
          family: OBSTACLES[item.kind].family,
          x: start + item.x,
          x0: start + item.x,
          base: item.height !== undefined ? base - item.height : base,
          vx: item.vx || 0,
          active: !item.vx,
          warned: false,
          phase: rng() * Math.PI * 2,
          passed: false,
          hit: false,
          closest: Infinity,
          pattern: chosen.id,
        });
      } else if (item.type === "leaf") {
        leaves.push({ kind: item.kind, x: start + item.x, y: base - item.height, taken: false, phase: rng() * 6 });
      } else if (item.type === "platform") {
        world.platforms.push({
          x: start + item.x,
          width: item.width,
          y: -PLATFORM_LEVELS[item.level - 1],
          level: item.level,
        });
      } else if (item.type === "hole") {
        world.holes.push({ x: start + item.x, width: item.width });
      }
    }
    obstacles.sort((a, b) => a.x - b.x);
    leaves.sort((a, b) => a.x - b.x);
    world.platforms.sort((a, b) => a.x - b.x);
    world.holes.sort((a, b) => a.x - b.x);
  }

  function spawn() {
    while (state.trackEnd < owl.x + TRACK.lookahead) {
      const chosen = track.choose(state.trackEnd - startDistance);
      place(chosen, state.trackEnd);
      state.patterns.push(chosen.id);
      if (state.patterns.length > 12) state.patterns.shift();
      state.patternCount += 1;
      state.trackEnd += chosen.length + gapAfter(state.speed, config);
    }
  }

  function hit(by, variant = null) {
    if (state.ended || state.invulnerable > 0) return false;
    state.hits += 1;
    state.cloud -= 1;
    state.sinceHit = 0;
    state.invulnerable = CLOUD.invulnerable;
    state.stunned = 0.5;
    // Trafienie obniża combo o 1 poziom (nie do zera).
    state.streak = Math.max(0, (state.combo - 2) * SCORE.comboStep);
    state.combo = comboLevel(state.streak);
    emit("hit", { by, variant, cloud: state.cloud });
    if (state.cloud <= 0) {
      if (state.cozy) state.cloud = 1;
      else end("chmura");
    }
    return true;
  }

  function end(reason = "gracz") {
    if (state.ended) return;
    state.ended = true;
    state.endReason = reason;
    emit("end", { reason });
  }

  function collect(item) {
    item.taken = true;
    const points = SCORE.leaf[item.kind];
    const count = SCORE.leafCount[item.kind];
    state.streak += count;
    state.combo = comboLevel(state.streak);
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    const gained = points * state.combo;
    state.leafPoints += gained;
    state.leafCount += count;
    emit("leaf", { kind: item.kind, points: gained, count, combo: state.combo, x: item.x, y: item.y });
  }

  function updateObjects(dt) {
    owlBox(owl, box);
    // Przeszkody.
    for (const item of obstacles) {
      if (item.x - 4 > owl.x + 30) break;
      if (!item.active && owl.x >= item.x - moverTriggerDistance(state.speed, item.vx)) {
        item.active = true;
        emit("warning", { kind: item.kind, family: item.family });
      }
      if (item.active && item.vx) item.x += item.vx * dt;
      if (item.passed || item.hit) continue;
      obstacleBox(item, state.time, other);
      if (other.left > box.right + 0.5) continue;
      if (overlaps(box, other)) {
        item.hit = true;
        if (hit(item.family, item.kind)) item.passed = true;
        continue;
      }
      // „O włos!”: najmniejszy odstęp w pionie, gdy sowa jest nad / pod przeszkodą.
      if (box.right > other.left && box.left < other.right) {
        const gap = Math.max(other.top - box.bottom, box.top - other.bottom);
        item.closest = Math.min(item.closest, gap);
      }
      if (other.right < box.left) {
        item.passed = true;
        if (item.closest < SCORE.nearMissGap && state.invulnerable <= 0) {
          state.nearMisses += 1;
          emit("nearMiss", { kind: item.kind, family: item.family, bonus: SCORE.nearMiss });
        }
      }
    }
    // Liście (okrąg 0,4 j. z polem sowy).
    for (const item of leaves) {
      if (item.x > box.right + 0.5) break;
      if (item.taken || item.x < box.left - 0.5) continue;
      const dx = Math.max(box.left - item.x, 0, item.x - box.right);
      const dy = Math.max(box.top - item.y, 0, item.y - box.bottom);
      if (dx * dx + dy * dy <= 0.4 * 0.4) collect(item);
    }
  }

  function cleanup() {
    const before = owl.x - TRACK.cleanupBehind;
    while (obstacles.length && obstacles[0].x < before && (obstacles[0].passed || obstacles[0].hit)) obstacles.shift();
    while (leaves.length && leaves[0].x < before) leaves.shift();
    world.cleanup(before);
  }

  const api = {
    state,
    events,
    controls,
    // Wejście: dotknięcie (touch — skok po 60 ms bez przesunięcia albo po puszczeniu), klawiatura — od razu.
    press(source = "touch") {
      if (state.ended) return;
      controls.hold = true;
      controls.holdTime = 0;
      if (source === "keyboard") controls.jump = true;
      else state.pendingPress = PHYSICS.pressDelay;
    },
    release() {
      controls.hold = false;
      if (state.pendingPress > 0) {
        state.pendingPress = 0;
        controls.jump = true;
      }
    },
    swipe(direction) {
      if (state.ended) return;
      if (direction === "down") {
        state.pendingPress = 0;
        controls.down = true;
      } else if (direction === "up" && state.pendingPress > 0) {
        state.pendingPress = 0;
        controls.jump = true;
      }
    },
    update(dt) {
      if (state.ended) return;
      state.time += dt;
      state.speed = speedAt(state.time, config, state.cozy);
      if (state.pendingPress > 0) {
        state.pendingPress -= dt;
        if (state.pendingPress <= 0) {
          state.pendingPress = 0;
          controls.jump = true;
        }
      }
      if (controls.hold) controls.holdTime += dt;
      const before = owl.x;
      stepOwl(owl, controls, dt, world, events, state.speed);
      const moved = owl.x - before;
      state.distance = owl.x - startDistance;
      state.sinceHit += moved;
      state.invulnerable = Math.max(0, state.invulnerable - dt);
      state.stunned = Math.max(0, state.stunned - dt);
      // Chmura Pracu oddala się o krok po 400 m bez trafienia.
      if (state.sinceHit >= CLOUD.recoverDistance && state.cloud < CLOUD.steps) {
        state.cloud += 1;
        state.sinceHit = 0;
        emit("cloudBack", { cloud: state.cloud });
      }
      // Wpadnięcie do dziury: trafienie i powrót na ziemię za dziurą.
      if (owl.y > PHYSICS.holeDepth) {
        const holeItem = world.holes.find((item) => owl.x >= item.x - 1 && owl.x <= item.x + item.width + 1);
        hit(HIT_FAMILY.dziura, "dziura");
        state.invulnerable = Math.max(state.invulnerable, CLOUD.invulnerable);
        owl.x = holeItem ? holeItem.x + holeItem.width + 0.6 : owl.x + 1;
        owl.y = 0;
        owl.vy = 0;
        owl.grounded = true;
        owl.surface = 0;
        owl.diving = false;
        owl.gliding = false;
        emit("fall");
      }
      spawn();
      updateObjects(dt);
      state.score = Math.floor(state.distance * SCORE.perMeter) + state.leafPoints + state.nearMisses * SCORE.nearMiss;
      cleanup();
    },
    end,
    hit,
    // Pierwsze wzory od razu (przed pierwszą klatką).
    prime() {
      spawn();
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
        nearMisses: state.nearMisses,
        hits: state.hits,
        durationMs: Math.round(state.time * 1000),
        difficulty: state.difficulty,
      };
    },
  };
  api.prime();
  return api;
}
