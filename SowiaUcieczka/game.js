// Sowia Ucieczka — logika biegu (bez DOM i bez rysowania; testy jednostkowe i symulacje w Node).
// Stan w jednym obiekcie; zdarzenia (skok, liść, trafienie, „O włos!”…) trafiają do kolejki `events`,
// z której korzysta strona (dźwięk, komunikaty, cząsteczki, SowieProgress).
import { createRng } from "../shared/engine/rng.js";
import {
  BIOME_COUNT,
  BIOME_LENGTH,
  CLOUD,
  COZY_SPEED,
  DIFFICULTIES,
  FEVER,
  GOATS,
  LOOP_SPEEDUP,
  PHYSICS,
  PLATFORM_LEVELS,
  SCORE,
  SPLASH,
  TRACK,
  WHALE,
} from "./config.js";
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

// Biom na danym dystansie: indeks 0–5 (co 1000 m) i numer okrążenia (po 6000 m od nowa, szybciej).
export function biomeAt(distance) {
  const index = Math.floor(Math.max(0, distance) / BIOME_LENGTH);
  return { index: index % BIOME_COUNT, loop: Math.floor(index / BIOME_COUNT) };
}

// Mnożnik prędkości okrążenia: +5% za każde kolejne, najwyżej +10%.
export function loopFactor(distance) {
  return 1 + Math.min(LOOP_SPEEDUP.max, biomeAt(distance).loop * LOOP_SPEEDUP.step);
}

// Kózka: wysokość podskoku (łuk co hopPeriod s).
export function goatLift(time, phase = 0) {
  const t = ((time + phase) % GOATS.hopPeriod) / GOATS.hopPeriod;
  return t < 0.7 ? GOATS.hopHeight * 4 * (t / 0.7) * (1 - t / 0.7) : 0;
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
    // E4c: kózki, bąbelki, power-upy, Gorączka Monster, Plusk-o-metr, „Rejs na humbaku”, biomy.
    goats: [],
    bubbles: [],
    powerups: { tarcza: 0, magnes: 0, turbo: 0, podwajaczka: 0 },
    fever: 0,
    riding: null,
    splash: 0,
    bonus: null,
    bonusCount: 0,
    bonusPoints: 0,
    goatCount: 0,
    goatPoints: 0,
    smashed: 0,
    nextGoatAt: 0,
    nextBubbleAt: 0,
    biome: 0,
    loop: 0,
  };
  state.nextGoatAt = GOATS.every[0] * 0.5 + rng() * (GOATS.every[1] - GOATS.every[0]) * 0.5;
  state.nextBubbleAt = SPLASH.bubbleEvery[0] + rng() * (SPLASH.bubbleEvery[1] - SPLASH.bubbleEvery[0]);

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

  const GOAT_KINDS = Object.keys(GOATS.weights);
  let lastGoat = null;
  function pickGoat() {
    const pool = GOAT_KINDS.filter((kind) => kind !== lastGoat);
    let pick = rng() * pool.reduce((sum, kind) => sum + GOATS.weights[kind], 0);
    for (const kind of pool) {
      pick -= GOATS.weights[kind];
      if (pick < 0) return (lastGoat = kind);
    }
    return (lastGoat = pool[pool.length - 1]);
  }

  function spawn() {
    if (state.bonus) return;
    while (state.trackEnd < owl.x + TRACK.lookahead) {
      const start = state.trackEnd;
      const chosen = track.choose(start - startDistance);
      place(chosen, start);
      // Gorączka Monster: dodatkowy rząd liści nad wzorem (bez dodatkowych przeszkód).
      if (state.fever > 0) {
        for (let x = start + 1; x < start + chosen.length - 0.5; x += FEVER.extraSpacing) {
          leaves.push({ kind: "zielony", x, y: -FEVER.extraHeight, taken: false, phase: rng() * 6 });
        }
        leaves.sort((a, b) => a.x - b.x);
      }
      state.patterns.push(chosen.id);
      if (state.patterns.length > 12) state.patterns.shift();
      state.patternCount += 1;
      const gap = gapAfter(state.speed, config);
      // Kózka albo bąbelek humbaka na środku odstępu między wzorami.
      const middle = start + chosen.length + gap / 2 - startDistance;
      if (middle >= state.nextGoatAt) {
        state.goats.push({ kind: pickGoat(), x: middle + startDistance, phase: rng(), taken: false });
        state.nextGoatAt = middle + GOATS.every[0] + rng() * (GOATS.every[1] - GOATS.every[0]);
      } else if (middle >= state.nextBubbleAt) {
        state.bubbles.push({ x: middle + startDistance, y: -SPLASH.bubbleHeight, taken: false, phase: rng() * 6 });
        state.nextBubbleAt = middle + SPLASH.bubbleEvery[0] + rng() * (SPLASH.bubbleEvery[1] - SPLASH.bubbleEvery[0]);
      }
      state.trackEnd += chosen.length + gap;
    }
  }

  function hit(by, variant = null) {
    if (state.ended || state.invulnerable > 0 || state.powerups.turbo > 0 || state.bonus) return false;
    // Tarcza pochłania jedno trafienie.
    if (state.powerups.tarcza > 0) {
      state.powerups.tarcza = 0;
      state.invulnerable = 1;
      emit("shieldBreak", { by, variant });
      return false;
    }
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
    // Podwajaczka i Gorączka Monster: liście ×2 (razem ×4).
    const multiplier = (state.powerups.podwajaczka > 0 ? 2 : 1) * (state.fever > 0 ? FEVER.multiplier : 1);
    const points = SCORE.leaf[item.kind] * multiplier;
    const count = SCORE.leafCount[item.kind] * multiplier;
    if (!state.bonus) state.splash = Math.min(1, state.splash + SCORE.leafCount[item.kind] / SPLASH.leaves);
    state.streak += count;
    state.combo = comboLevel(state.streak);
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    const gained = points * state.combo;
    state.leafPoints += gained;
    state.leafCount += count;
    if (state.bonus) {
      state.bonus.points += gained;
      state.bonus.leaves += count;
    }
    emit("leaf", { kind: item.kind, points: gained, count, combo: state.combo, x: item.x, y: item.y });
    if (item.kind === "teczowy") {
      if (state.fever <= 0) emit("fever");
      state.fever = FEVER.duration;
    }
  }

  // Złapana kózka: +50 pkt i efekt (Sprężynka od razu, pozostałe na czas).
  function catchGoat(goat) {
    goat.taken = true;
    state.goatCount += 1;
    state.goatPoints += GOATS.bonus;
    state.riding = { kind: goat.kind, time: GOATS.ride };
    if (goat.kind === "sprezynka") {
      owl.vy = -GOATS.springVelocity;
      owl.grounded = false;
      owl.jumps = 1;
      owl.sliding = 0;
      owl.diving = false;
    } else {
      state.powerups[goat.kind] = GOATS.duration[goat.kind];
    }
    emit("goat", { kind: goat.kind, x: goat.x, bonus: GOATS.bonus });
  }

  // ---------- „Rejs na humbaku” ----------

  function startBonus() {
    const from = owl.x - 1;
    const keep = (list) => list.filter((item) => item.x < from);
    obstacles.splice(0, obstacles.length, ...keep(obstacles));
    leaves.splice(0, leaves.length, ...keep(leaves));
    state.goats = keep(state.goats);
    state.bubbles = keep(state.bubbles);
    world.platforms.splice(0, world.platforms.length, ...world.platforms.filter((item) => item.x + item.width < from));
    world.holes.splice(0, world.holes.length, ...world.holes.filter((item) => item.x + item.width < from));
    Object.assign(owl, { y: 0, vy: 0, grounded: true, surface: 0, sliding: 0, gliding: false, diving: false });
    state.splash = 0;
    state.bonusCount += 1;
    state.bonus = { time: WHALE.duration, y: 0, vy: 0, leafTimer: 0.6, points: 0, leaves: 0 };
    emit("bonusStart");
  }

  function endBonus() {
    const bonus = state.bonus;
    const premium = WHALE.bonus + bonus.leaves * WHALE.perLeaf;
    state.bonusPoints += premium;
    state.bonus = null;
    leaves.splice(0, leaves.length, ...leaves.filter((item) => item.x < owl.x - 1));
    Object.assign(owl, { y: 0, vy: 0, grounded: true, surface: 0, jumps: 1 });
    state.invulnerable = Math.max(state.invulnerable, 1);
    state.trackEnd = owl.x + 6;
    track.rest();
    emit("bonusEnd", { premium, leaves: bonus.leaves });
  }

  function updateBonus(dt) {
    const bonus = state.bonus;
    bonus.time -= dt;
    owl.x += state.speed * dt;
    // Stuknięcie: humbak wyskakuje z wody (tylko z wody).
    if (controls.jump) {
      controls.jump = false;
      if (bonus.y >= -0.05) {
        bonus.vy = -WHALE.jumpVelocity;
        emit("whaleJump");
      }
    }
    controls.down = false;
    bonus.vy += WHALE.gravity * dt;
    bonus.y += bonus.vy * dt;
    if (bonus.y > 0) {
      if (bonus.vy > 6) emit("whaleSplash", { x: owl.x });
      bonus.y = 0;
      bonus.vy = 0;
    }
    owl.y = bonus.y - 0.55;
    owl.vy = bonus.vy;
    // Łuki liści w powietrzu przed humbakiem.
    bonus.leafTimer -= dt;
    if (bonus.leafTimer <= 0 && bonus.time > 1.5) {
      bonus.leafTimer = WHALE.leafEvery;
      const start = owl.x + 13 + state.speed;
      const peak = 2.2 + rng() * 2.4;
      for (let index = 0; index < 5; index += 1) {
        const u = index / 4;
        leaves.push({
          kind: index === 2 && rng() < 0.25 ? "zloty" : "zielony",
          x: start + index * 1.1,
          y: -(1 + (peak - 1) * 4 * u * (1 - u)),
          taken: false,
          phase: rng() * 6,
        });
      }
    }
    const cx = owl.x;
    const cy = owl.y - 0.4;
    for (const item of leaves) {
      if (item.x > cx + WHALE.reach + 0.5) break;
      if (item.taken || item.x < cx - WHALE.reach - 0.5) continue;
      if ((item.x - cx) ** 2 + (item.y - cy) ** 2 <= WHALE.reach ** 2) collect(item);
    }
    if (bonus.time <= 0) endBonus();
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
        if (state.powerups.turbo > 0) {
          // Turbo: sowa przebija się przez przeszkodę bez obrażeń.
          state.smashed += 1;
          emit("smash", { kind: item.kind, family: item.family, x: item.x });
        } else if (hit(item.family, item.kind)) item.passed = true;
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
    // Magnes: liście w promieniu 3,5 j. lecą do sowy.
    if (state.powerups.magnes > 0) {
      const cx = owl.x;
      const cy = owl.y - 0.5;
      for (const item of leaves) {
        if (item.x > cx + GOATS.magnetRadius) break;
        if (item.taken || item.x < cx - GOATS.magnetRadius) continue;
        const dx = cx - item.x;
        const dy = cy - item.y;
        const distance = Math.hypot(dx, dy);
        if (distance > GOATS.magnetRadius || distance < 1e-6) continue;
        const step = Math.min(distance, GOATS.magnetPull * dt);
        item.x += (dx / distance) * step;
        item.y += (dy / distance) * step;
      }
    }
    // Kózki (skaczą łukami; złapanie z dowolnej strony).
    for (const goat of state.goats) {
      if (goat.taken || Math.abs(goat.x - owl.x) > 2) continue;
      const gy = -goatLift(state.time, goat.phase) - 0.5;
      const dx = Math.max(box.left - goat.x, 0, goat.x - box.right);
      const dy = Math.max(box.top - gy, 0, gy - box.bottom);
      if (dx * dx + dy * dy <= GOATS.radius * GOATS.radius) catchGoat(goat);
    }
    // Bąbelki humbaka (1/3 Plusk-o-metru).
    for (const bubble of state.bubbles) {
      if (bubble.taken || Math.abs(bubble.x - owl.x) > 2) continue;
      const dx = Math.max(box.left - bubble.x, 0, bubble.x - box.right);
      const dy = Math.max(box.top - bubble.y, 0, bubble.y - box.bottom);
      if (dx * dx + dy * dy <= 0.45 * 0.45) {
        bubble.taken = true;
        state.splash = Math.min(1, state.splash + 1 / SPLASH.bubbles);
        emit("bubble", { x: bubble.x, y: bubble.y, splash: state.splash });
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
    state.goats = state.goats.filter((goat) => goat.x >= before);
    state.bubbles = state.bubbles.filter((bubble) => bubble.x >= before);
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
      const base = speedAt(state.time, config, state.cozy) * loopFactor(state.distance);
      state.speed = state.powerups.turbo > 0 ? base * GOATS.turboSpeed : base;
      // Czasy power-upów i Gorączki.
      for (const key of Object.keys(state.powerups)) {
        if (state.powerups[key] > 0) {
          state.powerups[key] = Math.max(0, state.powerups[key] - dt);
          if (state.powerups[key] === 0) {
            if (key === "turbo") state.invulnerable = Math.max(state.invulnerable, 1);
            emit("powerupEnd", { kind: key });
          }
        }
      }
      if (state.fever > 0) {
        state.fever = Math.max(0, state.fever - dt);
        if (state.fever === 0) emit("feverEnd");
      }
      if (state.riding) {
        state.riding.time -= dt;
        if (state.riding.time <= 0) state.riding = null;
      }
      if (state.pendingPress > 0) {
        state.pendingPress -= dt;
        if (state.pendingPress <= 0) {
          state.pendingPress = 0;
          controls.jump = true;
        }
      }
      if (controls.hold) controls.holdTime += dt;
      const before = owl.x;
      if (state.bonus) updateBonus(dt);
      else stepOwl(owl, controls, dt, world, events, state.speed);
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
      // Nowy biom co 1000 m.
      const biome = biomeAt(state.distance);
      if (biome.index !== state.biome || biome.loop !== state.loop) {
        state.biome = biome.index;
        state.loop = biome.loop;
        emit("biome", { index: biome.index, loop: biome.loop });
      }
      spawn();
      if (!state.bonus) updateObjects(dt);
      // Pełny Plusk-o-metr: „Rejs na humbaku” (na ziemi, nie w trakcie szybowania przez dziurę).
      if (!state.bonus && state.splash >= 1 && owl.grounded && owl.surface === 0) startBonus();
      state.score =
        Math.floor(state.distance * SCORE.perMeter) +
        state.leafPoints +
        state.nearMisses * SCORE.nearMiss +
        state.goatPoints +
        state.bonusPoints;
      cleanup();
    },
    end,
    hit,
    // Testy i diagnostyka: kózka od razu, pełny Plusk-o-metr.
    giveGoat(kind) {
      catchGoat({ kind, x: owl.x, taken: false });
    },
    fillSplash() {
      state.splash = 1;
    },
    // Testy i zrzuty: przeskok o `meters` do przodu (czysta trasa od nowego miejsca, np. do innego biomu).
    warp(meters) {
      const keep = (list) => list.filter((item) => item.x < owl.x - 1);
      obstacles.splice(0, obstacles.length, ...keep(obstacles));
      leaves.splice(0, leaves.length, ...keep(leaves));
      state.goats = keep(state.goats);
      state.bubbles = keep(state.bubbles);
      world.platforms.splice(0, world.platforms.length);
      world.holes.splice(0, world.holes.length);
      owl.x += meters;
      Object.assign(owl, { y: 0, vy: 0, grounded: true, surface: 0 });
      state.distance = owl.x - startDistance;
      state.nextGoatAt = Math.max(state.nextGoatAt, state.distance);
      state.nextBubbleAt = Math.max(state.nextBubbleAt, state.distance);
      state.trackEnd = owl.x + 6;
      track.rest();
    },
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
        goats: state.goatCount,
        bonuses: state.bonusCount,
        smashed: state.smashed,
      };
    },
  };
  api.prime();
  return api;
}
