// Sowa w Chmurach — logika biegu (bez DOM): sowa sama odbija się od platform, gracz steruje w bok; kamera
// jedzie tylko w górę; upadek pod ekran = ratunek (kózka odnosi sowę na ostatnią pewną platformę, −1 życie);
// wynik = wysokość + liście × combo + premie. Zdarzenia dla strony gry (dźwięk, komunikaty, SowieProgress).
import { createRng } from "../shared/engine/rng.js";
import { CAMERA, COZY_TIME, DIFFICULTIES, OWL, PLATFORM_TYPES, RESCUE, SCORE, WORLD, ZONES } from "./config.js";
import { createGenerator } from "./generator.js";
import { createOwlBody, steerBy, stepOwl, wrapDelta, wrapX } from "./physics.js";
import { createPlatform, isPerfect, land, landsOn, updatePlatforms } from "./platforms.js";

export const comboLevel = (chain) => Math.min(SCORE.comboMax, 1 + Math.floor(chain / SCORE.comboStep));

// Indeks strefy wysokości (Ogródek, Blok, Chmury, Zorza, Kosmos).
export function zoneAt(height) {
  let index = 0;
  for (let i = 0; i < ZONES.length; i += 1) if (height >= ZONES[i].from) index = i;
  return index;
}

// Premia za idealne lądowanie przy serii `streak`.
export const perfectBonus = (streak) => SCORE.perfect * Math.min(streak, SCORE.perfectMax);

/**
 * createRun({ difficulty, seed, cozy, random, safe }) — `random` zastępuje generator z ziarnem (testy),
 * `safe` — ratunek bez utraty życia (samouczek).
 */
export function createRun({ difficulty = "arcade", seed = "sowa", cozy = false, random = null, safe = false } = {}) {
  const info = DIFFICULTIES[difficulty];
  if (!info) throw new Error(`Nieznany poziom trudności: ${difficulty}`);
  const rng = random ? { next: random } : createRng(`${seed}|trasa`);
  const generator = createGenerator({ random: rng.next, difficulty });
  const events = [];
  const emit = (type, detail = {}) => events.push({ type, ...detail });

  const state = {
    difficulty,
    cozy: Boolean(cozy) && difficulty === "chill",
    safe: Boolean(safe),
    phase: "run", // run | rescue | over
    time: 0,
    owl: createOwlBody(WORLD.width / 2, 0),
    keys: { left: false, right: false },
    lives: info.lives,
    maxLives: info.lives,
    // Dolna krawędź widoku (m); na starcie 1 m ziemi ogródka pod sową.
    cameraBottom: -1,
    height: 0,
    zone: 0,
    platforms: [],
    leaves: [],
    lastSafe: null,
    rescue: null,
    invulnerable: 0,
    leafCount: 0,
    leafPoints: 0,
    bonusPoints: 0,
    chain: 0,
    combo: 1,
    bestCombo: 1,
    perfectStreak: 0,
    bestStreak: 0,
    perfects: 0,
    bounces: 0,
    rescues: 0,
    score: 0,
    endReason: null,
  };
  // Start: sowa na ziemi ogródka od razu się wybija.
  state.owl.vy = OWL.jumpVelocity;

  function spawn() {
    generator.fill(state.cameraBottom + CAMERA.ahead, state.platforms, state.leaves);
  }

  function cleanup() {
    const limit = state.cameraBottom - CAMERA.behind;
    state.platforms = state.platforms.filter(
      (item) => !item.gone && (item.y >= limit || item === state.lastSafe || item === state.rescue?.target),
    );
    state.leaves = state.leaves.filter((item) => !item.taken && item.y >= limit);
  }

  function addChain(amount = 1) {
    const previous = state.combo;
    state.chain += amount;
    state.combo = comboLevel(state.chain);
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    if (state.combo > previous) emit("combo", { combo: state.combo });
  }

  function updateScore() {
    state.score = Math.floor(state.height * SCORE.perMeter) + state.leafPoints + state.bonusPoints;
  }

  function bounceFrom(platform) {
    const owl = state.owl;
    const result = land(platform);
    if (result.bounce <= 0) {
      // Krucha gałązka łamie się pod sową — bez odbicia, sowa spada dalej.
      emit("crack", { x: platform.x, y: platform.y });
      return;
    }
    owl.y = platform.y;
    owl.vy = OWL.jumpVelocity * result.bounce;
    state.bounces += 1;
    if (result.points) state.bonusPoints += result.points;
    const perfect = isPerfect(owl, platform);
    if (perfect) {
      state.perfectStreak += 1;
      state.perfects += 1;
      state.bestStreak = Math.max(state.bestStreak, state.perfectStreak);
      const bonus = perfectBonus(state.perfectStreak);
      state.bonusPoints += bonus;
      addChain();
      emit("perfect", { streak: state.perfectStreak, bonus });
    } else {
      state.perfectStreak = 0;
    }
    if (PLATFORM_TYPES[platform.type].solid) state.lastSafe = platform;
    emit("bounce", { platform: platform.type, x: owl.x, y: platform.y, perfect, points: result.points });
    if (platform.type === "chmurka") emit("puff", { x: platform.x, y: platform.y });
    if (platform.type === "balkon" && !platform.visited) {
      platform.visited = true;
      emit("balcony", { y: platform.y });
    }
  }

  function landings(previousY) {
    const owl = state.owl;
    if (owl.vy > 0) return;
    // Ziemia ogródka (y = 0) jest zawsze — także pod ekranem, zanim kamera odjedzie wyżej niż margines upadku.
    let best = null;
    for (const platform of state.platforms) {
      if (landsOn(owl, previousY, platform) && (!best || platform.y > best.y)) best = platform;
    }
    if (best) bounceFrom(best);
    else if (previousY >= 0 && owl.y <= 0) {
      owl.y = 0;
      owl.vy = OWL.jumpVelocity;
      state.perfectStreak = 0;
      emit("bounce", { platform: "ziemia", x: owl.x, y: 0, perfect: false, points: 0 });
    }
  }

  function collectLeaves() {
    const owl = state.owl;
    const centerY = owl.y + OWL.center;
    for (const leaf of state.leaves) {
      if (leaf.taken) continue;
      if (Math.hypot(wrapDelta(owl.x, leaf.x), centerY - leaf.y) > OWL.reach) continue;
      leaf.taken = true;
      const gold = leaf.kind === "zloty";
      const count = gold ? 5 : 1;
      const combo = state.combo;
      const points = (gold ? SCORE.goldLeaf : SCORE.leaf) * combo;
      state.leafCount += count;
      state.leafPoints += points;
      emit("leaf", { kind: leaf.kind, x: leaf.x, y: leaf.y, count, points, combo });
      addChain();
    }
  }

  // Cel ratunku: ostatnia pewna platforma, jeśli jest w widoku; inaczej najniższa pewna w widoku; w ostateczności
  // nowy balkon nad dolną krawędzią.
  function rescueTarget() {
    const low = state.cameraBottom + RESCUE.minAbove;
    const high = state.cameraBottom + RESCUE.searchAbove;
    const usable = (item) =>
      item && !item.gone && !item.spent && PLATFORM_TYPES[item.type].solid && item.y >= low && item.y <= high;
    if (usable(state.lastSafe)) return state.lastSafe;
    let best = null;
    for (const item of state.platforms) if (usable(item) && (!best || item.y < best.y)) best = item;
    if (best) return best;
    const fallback = createPlatform("balkon", WORLD.width / 2, state.cameraBottom + RESCUE.fallbackY, { path: false });
    state.platforms.push(fallback);
    return fallback;
  }

  function startRescue() {
    const owl = state.owl;
    state.rescues += 1;
    state.perfectStreak = 0;
    // Combo spada o jeden poziom.
    state.chain = Math.max(0, (state.combo - 2) * SCORE.comboStep);
    state.combo = comboLevel(state.chain);
    if (!state.safe) state.lives = state.cozy ? Math.max(1, state.lives - 1) : state.lives - 1;
    if (state.lives <= 0) {
      state.lives = 0;
      finish("upadek");
      return;
    }
    const target = rescueTarget();
    state.phase = "rescue";
    state.rescue = { time: 0, fromX: owl.x, fromY: state.cameraBottom - 1, target };
    owl.pending = 0;
    owl.vx = 0;
    owl.vy = 0;
    emit("rescue", { lives: state.lives });
  }

  function updateRescue(dt) {
    const owl = state.owl;
    const rescue = state.rescue;
    rescue.time += dt;
    const k = Math.min(1, rescue.time / RESCUE.duration);
    const ease = k * k * (3 - 2 * k);
    const target = rescue.target;
    owl.x = wrapX(rescue.fromX + wrapDelta(rescue.fromX, target.x) * ease);
    owl.y = rescue.fromY + (target.y - rescue.fromY) * ease + Math.sin(Math.PI * k) * 1.5;
    if (k < 1) return;
    owl.x = target.x;
    owl.y = target.y;
    owl.vy = OWL.jumpVelocity;
    state.lastSafe = target;
    state.rescue = null;
    state.phase = "run";
    state.invulnerable = OWL.invulnerable;
    emit("rescued", { x: owl.x, y: owl.y });
  }

  function finish(reason) {
    if (state.phase === "over") return;
    state.phase = "over";
    state.endReason = reason;
    updateScore();
    emit("over", { reason });
  }

  function update(rawDt) {
    if (state.phase === "over") return;
    const dt = rawDt * (state.cozy ? COZY_TIME : 1);
    state.time += dt;
    state.invulnerable = Math.max(0, state.invulnerable - dt);
    updatePlatforms(state.platforms, state.time, dt);
    if (state.phase === "rescue") {
      updateRescue(dt);
      return;
    }
    const owl = state.owl;
    const previousY = owl.y;
    stepOwl(owl, state.keys, dt);
    landings(previousY);
    collectLeaves();
    if (owl.y > state.height) {
      state.height = owl.y;
      const zone = zoneAt(state.height);
      if (zone !== state.zone) {
        state.zone = zone;
        emit("zone", { zone, id: ZONES[zone].id, name: ZONES[zone].name });
      }
    }
    state.cameraBottom = Math.max(state.cameraBottom, owl.y - CAMERA.owlShare * WORLD.height);
    spawn();
    cleanup();
    updateScore();
    if (owl.y < state.cameraBottom - CAMERA.fallMargin) startRescue();
  }

  spawn();

  return {
    state,
    update,
    takeEvents: () => events.splice(0),
    // Przeciąganie palcem: przesunięcie w metrach świata.
    steer(meters) {
      if (state.phase === "run") steerBy(state.owl, meters);
    },
    setKeys(left, right) {
      state.keys.left = Boolean(left);
      state.keys.right = Boolean(right);
    },
    setSafe(value) {
      state.safe = Boolean(value);
    },
    end(reason = "gracz") {
      finish(reason);
    },
    // Testy i diagnostyka: sowa `meters` wyżej, na świeżej trasie, z balkonem pod stopami.
    warp(meters) {
      if (state.phase !== "run") return;
      const owl = state.owl;
      const y = owl.y + Math.max(0, meters);
      state.platforms = [];
      state.leaves = [];
      const base = createPlatform("balkon", Math.min(Math.max(owl.x, 2), WORLD.width - 2), y - 0.5, { path: false });
      generator.skipTo(base.y, base.x);
      state.platforms.push(base);
      owl.x = base.x;
      owl.y = y;
      owl.vy = 0;
      state.lastSafe = base;
      state.height = Math.max(state.height, y);
      const zone = zoneAt(state.height);
      if (zone !== state.zone) {
        state.zone = zone;
        emit("zone", { zone, id: ZONES[zone].id, name: ZONES[zone].name });
      }
      state.cameraBottom = Math.max(state.cameraBottom, y - CAMERA.owlShare * WORLD.height);
      spawn();
    },
    summary() {
      updateScore();
      return {
        score: state.score,
        height: Math.floor(state.height),
        leaves: state.leafCount,
        bestCombo: state.bestCombo,
        bestStreak: state.bestStreak,
        perfects: state.perfects,
        bounces: state.bounces,
        rescues: state.rescues,
        zone: ZONES[state.zone].id,
        difficulty: state.difficulty,
      };
    },
  };
}
