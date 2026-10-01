// Sowie Tory — logika biegu (bez DOM i bez rysowania; testy jednostkowe i symulacje w Node).
// Stan w jednym obiekcie; zdarzenia (skok, liść, trafienie…) trafiają do kolejki `events`, z której korzysta
// strona (dźwięk, komunikaty, cząsteczki, SowieProgress). Położenia przeszkód i liści: `at` — metry od początku
// planszy; głębokość przed sową z = at − stageDistance. Po mecie planszy: finał z basenem (finale.js), rejs
// „Humbacze Tory” (whale.js) i podsumowanie z gwiazdkami; dopiero potem następna plansza. Dodatki w odstępach między
// wzorami (kózki, serduszka) i tęczowy liść w oddechach mają osobny generator — nie zmieniają trasy.
import { createRng } from "../shared/engine/rng.js";
import {
  BOARS,
  COZY_SPEED,
  DIFFICULTIES,
  EXTRA_LIFE,
  FEVER,
  GOATS,
  LEAVES,
  MOVING,
  OWL,
  PROJECTION,
  SCORE,
  STARS,
  TRACK,
} from "./config.js";
import { createFinale } from "./finale.js";
import { catchesGoat, pickGoat } from "./goats.js";
import { OBSTACLES, collides, obstacleShape, obstacleX } from "./obstacles.js";
import { createTrack, gapAfter, PATTERNS } from "./patterns.js";
import { createOwlBody, stepOwl } from "./physics.js";
import { laneX } from "./projection.js";
import { STAGES, STAGE_COUNT, stageKind } from "./stages.js";
import { WHALE, createWhaleRide } from "./whale.js";

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

// Gwiazdki planszy: ★ za ukończenie, ★ za co najmniej STARS.leafShare wystawionych liści, ★ bez trafienia.
export function stageStars({ hits, leaves, total }) {
  const leafStar = total > 0 && leaves >= total * STARS.leafShare;
  const noHit = hits === 0;
  return { count: 1 + (leafStar ? 1 : 0) + (noHit ? 1 : 0), leaves: leafStar, noHit };
}

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
  finishSeen = false,
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
  let finale = null;
  let ride = null;
  const boars = [];
  const goats = [];
  const hearts = [];
  const chaseOn = (stage) => Boolean(STAGES[stage % STAGE_COUNT].chase);
  const firstBoar = (stage) => (chaseOn(stage) ? BOARS.first + rng() * 30 : Infinity);
  // Osobny generator dodatków planszy (kózki, serduszka, tęczowy liść).
  const extrasRng = (stage) => random || createRng(`${seed}|dodatki|${stage}`).next;
  let extras = extrasRng(startStage);
  let lastGoat = null;
  const between = ([min, max]) => min + extras() * (max - min);

  const state = {
    difficulty: level,
    cozy: Boolean(cozy),
    safe: Boolean(safe),
    phase: "run", // run | finale | whale | stageEnd | over
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
    stageLeafTotal: 0, // liście wystawione na planszy (złoty = 5) — do gwiazdki za liście
    stageWhaleLeaves: 0,
    stageStars: [], // gwiazdki ukończonych plansz: { count, leaves, noHit }
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
    // Kózki i serduszka w odstępach między wzorami; power-upy: rodzaj → pozostały czas (s).
    goats,
    hearts,
    nextGoatAt: 0,
    nextHeartAt: 0,
    powerups: {},
    riding: 0, // Kózia jazda (Turbo): pozostały czas
    fever: 0, // Gorączka Monster: pozostały czas
    goatCount: 0,
    livesGained: 0,
    fevers: 0,
    // Finał z basenem: stan osi czasu (finale.js), położenie sowy w bok na mecie; po pierwszym pełnym
    // obejrzeniu (`finishSeen` w dokumencie gry) finał można skrócić tapnięciem.
    finishSeen: Boolean(finishSeen),
    finale: null,
    finaleX: 0,
    // Rejs „Humbacze Tory” (whale.js).
    ride: null,
    endReason: null,
  };

  function emit(type, detail = {}) {
    events.push({ type, ...detail });
  }

  function resetExtras() {
    goats.length = 0;
    hearts.length = 0;
    state.nextGoatAt = TRACK.startClear + between(GOATS.every) * 0.5;
    state.nextHeartAt = between(EXTRA_LIFE.every);
  }
  resetExtras();

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
        state.stageLeafTotal += item.kind === "zloty" ? 5 : 1;
      }
    }
    obstacles.sort((a, b) => a.at - b.at);
    leaves.sort((a, b) => a.at - b.at);
  }

  // Deszcz liści Gorączki: co FEVER.rainSpacing m na każdym torze, ale nie bliżej niż FEVER.rainClear m od przeszkody
  // w tym torze (bez dodatkowych przeszkód i bez liści w przeszkodach). Nie liczą się do gwiazdki za liście.
  function rainBetween(from, to) {
    const end = Math.min(to, TRACK.stageLength - TRACK.finishClear);
    for (let at = Math.ceil(from / FEVER.rainSpacing) * FEVER.rainSpacing; at < end; at += FEVER.rainSpacing) {
      for (const lane of [-1, 0, 1]) {
        const blocked = obstacles.some((item) => {
          if (item.lane !== lane && item.moveTo !== lane) return false;
          const depth = obstacleShape(item.kind).depth;
          return at > item.at - FEVER.rainClear && at < item.at + depth + FEVER.rainClear;
        });
        if (!blocked) leaves.push({ lane, at, y: LEAVES.height, kind: "zielony", taken: false, extra: true });
      }
    }
    leaves.sort((a, b) => a.at - b.at);
  }

  // Dodatki w odstępie po wzorze (`from`…`to`): kózka albo serduszko w środku odstępu; w oddechu tęczowy liść.
  function placeExtras(chosen, start, gapEnd) {
    const middle = (start + chosen.length + gapEnd) / 2;
    const room = middle < TRACK.stageLength - GOATS.lastClear;
    if (room && middle >= state.nextGoatAt) {
      const first = extras() < 0.5 ? -1 : 0;
      lastGoat = pickGoat(extras, lastGoat);
      goats.push({ kind: lastGoat, at: middle, lanes: [first, first + 1], phase: extras(), taken: false });
      state.nextGoatAt = middle + between(GOATS.every);
    } else if (room && middle >= state.nextHeartAt) {
      hearts.push({ at: middle, lane: Math.floor(extras() * 3) - 1, taken: false });
      state.nextHeartAt = middle + between(EXTRA_LIFE.every);
    }
    const stageId = STAGES[state.stage % STAGE_COUNT].id;
    const chance = FEVER.chance[stageId] ?? FEVER.chance.default;
    if (chosen.tags.includes("breather") && state.fever <= 0 && extras() < chance) {
      leaves.push({
        lane: Math.floor(extras() * 3) - 1,
        at: start + chosen.length / 2,
        y: LEAVES.height,
        kind: "teczowy",
        taken: false,
      });
      leaves.sort((a, b) => a.at - b.at);
    }
    if (state.fever > 0) rainBetween(start, Math.min(gapEnd, state.stageDistance + state.speed * state.fever));
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
      placeExtras(chosen, start, state.trackEnd);
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
    // Kózka Tarcza przyjmuje jedno trafienie.
    if (state.powerups.tarcza > 0) {
      delete state.powerups.tarcza;
      state.invulnerable = 1;
      emit("shield", { kind: item.kind });
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

  // Mnożnik liści: Podwajaczka ×2, Gorączka Monster ×2 (razem ×4).
  const leafMultiplier = () => (state.powerups.podwajaczka > 0 ? 2 : 1) * (state.fever > 0 ? FEVER.multiplier : 1);

  function startFever() {
    state.fever = FEVER.duration;
    state.fevers += 1;
    emit("fever", { duration: FEVER.duration, multiplier: FEVER.multiplier });
    rainBetween(state.stageDistance + 4, Math.min(state.trackEnd, state.stageDistance + state.speed * FEVER.duration));
  }

  function collect(item) {
    item.taken = true;
    const multiplier = item.kind === "teczowy" ? 1 : leafMultiplier();
    const base = item.kind === "zloty" ? 50 : item.kind === "teczowy" ? FEVER.points : SCORE.leaf;
    const points = base * multiplier;
    const count = (item.kind === "zloty" ? 5 : 1) * multiplier;
    const before = state.combo;
    state.streak += 1;
    state.combo = comboLevel(state.streak);
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    const gained = points * state.combo;
    state.leafPoints += gained;
    state.leafCount += count;
    state.stageLeaves += count;
    emit("leaf", { kind: item.kind, lane: item.lane, points: gained, count, combo: state.combo, multiplier });
    if (state.combo > before) emit("combo", { value: state.combo });
    if (item.kind === "teczowy") startFever();
  }

  // Złapana kózka: +50 pkt i efekt (Sprężynka od razu, pozostałe na czas; Turbo = Kózia jazda).
  function catchGoat(goat) {
    goat.taken = true;
    state.goatCount += 1;
    state.bonusPoints += GOATS.bonus;
    emit("goat", { kind: goat.kind, bonus: GOATS.bonus });
    if (goat.kind === "sprezynka") {
      owl.vy = GOATS.springVelocity;
      owl.grounded = false;
      owl.slide = 0;
      owl.diving = false;
      emit("spring");
    } else if (goat.kind === "turbo") {
      state.riding = GOATS.duration.turbo;
      emit("rideStart", { duration: state.riding });
    } else {
      state.powerups[goat.kind] = GOATS.duration[goat.kind];
      emit("powerupStart", { kind: goat.kind, duration: GOATS.duration[goat.kind] });
    }
  }

  // Kózki i serduszka przed sową (łapane dotknięciem).
  function checkExtras() {
    for (const goat of goats) {
      const z = goat.at - state.stageDistance;
      if (z > 2) break;
      if (!goat.taken && catchesGoat(owl, goat, z, state.time)) catchGoat(goat);
    }
    for (const heart of hearts) {
      const z = heart.at - state.stageDistance;
      if (z > 2) break;
      if (heart.taken || Math.abs(z) > LEAVES.reachZ) continue;
      if (Math.abs(owl.x - laneX(heart.lane)) >= LEAVES.reachX || owl.y > EXTRA_LIFE.height + 1) continue;
      heart.taken = true;
      if (state.lives < state.maxLives) {
        state.lives += 1;
        state.livesGained += 1;
        emit("life", { lives: state.lives });
      } else {
        state.bonusPoints += EXTRA_LIFE.fullBonus;
        emit("lifeBonus", { bonus: EXTRA_LIFE.fullBonus });
      }
    }
  }

  // Liczniki power-upów, Kózia jazda (automatyczny skok nad przeszkodą w torze) i Gorączka.
  function updatePowerups(dt) {
    for (const kind of Object.keys(state.powerups)) {
      state.powerups[kind] -= dt;
      if (state.powerups[kind] > 0) continue;
      delete state.powerups[kind];
      emit("powerupEnd", { kind });
    }
    if (state.fever > 0) {
      state.fever = Math.max(0, state.fever - dt);
      if (state.fever === 0) emit("feverEnd");
    }
    if (state.riding <= 0) return;
    state.riding = Math.max(0, state.riding - dt);
    if (state.riding === 0) {
      state.invulnerable = Math.max(state.invulnerable, GOATS.afterRide);
      emit("rideEnd");
      return;
    }
    const ahead = obstacles.some((item) => {
      const z = item.at - state.stageDistance;
      return !item.passed && z > 0 && z < state.speed * GOATS.rideLook && Math.abs(obstacleX(item) - owl.x) < 1;
    });
    if (ahead && owl.grounded) {
      owl.vy = GOATS.rideJump;
      owl.grounded = false;
      owl.slide = 0;
      emit("rideHop");
    }
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
      if (state.invulnerable > 0 || state.riding > 0) continue;
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
      if (!boar.hit && !boar.passed && near && sameLane && state.invulnerable <= 0 && state.riding <= 0) {
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

  // Liście; z Magnesem liście do GOATS.magnetReachZ m przed sową lecą do niej (`pull` 0–1 — także do rysowania).
  function checkLeaves(dt) {
    const magnet = state.powerups.magnes > 0;
    for (const item of leaves) {
      const z = item.at - state.stageDistance;
      if (z > (magnet ? GOATS.magnetReachZ : LEAVES.reachZ)) break;
      if (item.taken || z < -LEAVES.reachZ) continue;
      if (magnet) item.pull = Math.min(1, (item.pull || 0) + dt * 5);
      if (z > LEAVES.reachZ) continue;
      const near = Math.abs(owl.x - laneX(item.lane)) < LEAVES.reachX && Math.abs(owl.y + 0.5 - item.y) < 0.9;
      if (near || item.pull > 0) collect(item);
    }
  }

  function cleanup() {
    const before = state.stageDistance - 12;
    while (obstacles.length && obstacles[0].at < before) obstacles.shift();
    while (leaves.length && leaves[0].at < before) leaves.shift();
    while (goats.length && goats[0].at < before) goats.shift();
    while (hearts.length && hearts[0].at < before) hearts.shift();
  }

  function end(reason) {
    if (state.phase === "over") return;
    state.phase = "over";
    state.endReason = reason;
    updateScore();
    emit("over", { reason });
  }

  // Meta planszy: premia i początek finału z basenem.
  function finishStage() {
    state.phase = "finale";
    state.stagesDone += 1;
    const bonus = SCORE.stageBonus + (state.stageHits === 0 ? SCORE.noHitBonus : 0);
    state.bonusPoints += bonus;
    updateScore();
    boars.length = 0;
    // Power-upy, Kózia jazda i Gorączka kończą się na mecie.
    state.powerups = {};
    state.riding = 0;
    state.fever = 0;
    state.finaleX = owl.x;
    finale = createFinale({ seen: state.finishSeen });
    state.finale = finale.state;
    emit("finish", {
      stage: state.stage,
      bonus,
      seconds: state.stageTime,
      seen: state.finishSeen,
      last: state.stage + 1 >= STAGE_COUNT,
    });
  }

  // Zdarzenia osi czasu finału; po końcu (także skróconym) — rejs humbaka.
  function finaleEvents(list) {
    for (const event of list) {
      emit(event.type, event);
      if (event.type !== "finaleDone") continue;
      if (!state.finishSeen) {
        state.finishSeen = true;
        emit("finishSeen");
      }
      // Osobny generator: kółka rejsu nie zmieniają trasy kolejnych plansz.
      ride = createWhaleRide({ random: random || createRng(`${seed}|humbak|${state.stage}`).next, lane: 0 });
      state.ride = ride.state;
      state.stageWhaleLeaves = 0;
      state.phase = "whale";
      emit("whaleStart", { duration: WHALE.duration });
    }
  }

  // Rejs: liście z kółek liczą się do wyniku (bez combo); po 20 s — podsumowanie planszy.
  function updateWhale(dt) {
    for (const event of ride.update(dt)) {
      if (event.type !== "whaleLeaf") {
        emit(event.type, event);
        continue;
      }
      const count = event.kind === "zloty" ? 5 : 1;
      const points = WHALE.points * count;
      state.leafPoints += points;
      state.leafCount += count;
      state.stageWhaleLeaves += count;
      emit("whaleLeaf", { ...event, count, points });
    }
    updateScore();
    if (!ride.done()) return;
    const stars = stageStars({ hits: state.stageHits, leaves: state.stageLeaves, total: state.stageLeafTotal });
    state.stageStars.push(stars);
    state.phase = "stageEnd";
    emit("whaleEnd", { leaves: state.stageWhaleLeaves });
    emit("stageEnd", {
      stage: state.stage,
      stars,
      leaves: state.stageLeaves,
      leafTotal: state.stageLeafTotal,
      whaleLeaves: state.stageWhaleLeaves,
      hits: state.stageHits,
      last: state.stage + 1 >= STAGE_COUNT,
    });
  }

  const api = {
    state,
    events,
    // Gest albo klawisz: "left" | "right" | "up" | "down" — wykonany w najbliższym kroku (w rejsie steruje
    // humbakiem: tor i wyskok; w finale nic nie robi).
    input(direction) {
      if (state.phase === "whale") ride.input(direction);
      else if (direction in controls) controls[direction] = true;
    },
    update(dt) {
      if (state.phase === "finale" || state.phase === "whale") {
        state.time += dt;
        if (state.phase === "finale") finaleEvents(finale.update(dt));
        else updateWhale(dt);
        return;
      }
      if (state.phase !== "run") return;
      state.time += dt;
      state.stageTime += dt;
      state.speed =
        speedAt(state.stageDistance / TRACK.stageLength, level, state.stage, state.cozy) *
        (state.riding > 0 ? GOATS.rideSpeed : 1);
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
      updatePowerups(dt);
      updateMovers(dt);
      checkObstacles();
      if (state.phase === "run" && chaseOn(state.stage)) updateBoars(dt);
      if (state.phase !== "run") return;
      checkExtras();
      checkLeaves(dt);
      cleanup();
      updateScore();
      if (state.stageDistance >= TRACK.stageLength) finishStage();
    },
    // Tapnięcie w finale: skraca go tylko po pierwszym pełnym obejrzeniu. Zwraca, czy skrócono.
    skipFinale() {
      if (state.phase !== "finale") return false;
      const list = finale.skip();
      finaleEvents(list);
      return list.length > 0;
    },
    setFinishSeen(value) {
      state.finishSeen = Boolean(value);
      if (finale) finale.state.seen = state.finishSeen;
    },
    // Następna plansza (po podsumowaniu); po ostatniej — koniec kampanii.
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
      state.stageLeafTotal = 0;
      state.stageWhaleLeaves = 0;
      state.trackEnd = TRACK.startClear;
      obstacles.length = 0;
      leaves.length = 0;
      boars.length = 0;
      extras = extrasRng(state.stage);
      resetExtras();
      state.nextBoarAt = firstBoar(state.stage);
      Object.assign(owl, createOwlBody(ride ? ride.state.lane : owl.lane));
      finale = null;
      ride = null;
      state.finale = null;
      state.ride = null;
      state.invulnerable = 1;
      state.phase = "run";
      emit("stage", { stage: state.stage });
      return true;
    },
    end,
    setSafe(value) {
      state.safe = Boolean(value);
    },
    // Testy i diagnostyka: kózka od razu złapana; Gorączka Monster od razu.
    giveGoat(kind) {
      if (state.phase === "run") catchGoat({ kind, taken: false });
    },
    giveFever() {
      if (state.phase === "run") startFever();
    },
    // Testy i diagnostyka: przeskok o `meters` (czysta trasa od nowego miejsca; tylko w biegu).
    warp(meters) {
      if (state.phase !== "run") return;
      obstacles.length = 0;
      leaves.length = 0;
      boars.length = 0;
      goats.length = 0;
      hearts.length = 0;
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
        stars: state.stageStars.reduce((sum, item) => sum + item.count, 0),
        goats: state.goatCount,
        fevers: state.fevers,
        stage: state.stage,
        finished: state.endReason === "kampania",
      };
    },
  };
  emit("stage", { stage: state.stage });
  return api;
}
