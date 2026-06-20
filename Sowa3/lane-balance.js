// Balans torów Sowa3.
// Ten moduł pilnuje, aby przeszkody blokujące nie pojawiały się zbyt blisko siebie
// i żeby gra nie tworzyła sytuacji bez możliwego toru ucieczki.

const SOWA3_BLOCKER_TYPES = new Set([
  "amic",
  "shift",
  "magda",
  "cart",
  "pot",
  "block",
  "pallet",
  "person",
  "boar"
]);

const SOWA3_SPAWN_Z = 1.08;
const SOWA3_MIN_BLOCKER_GAP = {
  chill: 0.43,
  arcade: 0.36,
  chaos: 0.31
};

let sowa3LastBlockerLane = null;

function sowa3DifficultyKey() {
  return state.difficultyKey || "arcade";
}

function sowa3ActiveDifficulty() {
  return SOWA3_DIFFICULTIES[sowa3DifficultyKey()] || SOWA3_DIFFICULTIES.arcade;
}

function sowa3MinBlockerGap() {
  return SOWA3_MIN_BLOCKER_GAP[sowa3DifficultyKey()] || SOWA3_MIN_BLOCKER_GAP.arcade;
}

function isSowa3Blocker(type) {
  return SOWA3_BLOCKER_TYPES.has(type);
}

function sowa3CurrentBlockers() {
  const result = [];

  if (typeof objects !== "undefined" && Array.isArray(objects)) {
    for (const object of objects) {
      if (!object.hit && isSowa3Blocker(object.type)) {
        result.push({ lane: object.lane, z: object.z, type: object.type });
      }
    }
  }

  if (typeof sowa3StageObstacles !== "undefined" && Array.isArray(sowa3StageObstacles)) {
    for (const object of sowa3StageObstacles) {
      if (!object.hit && isSowa3Blocker(object.type)) {
        result.push({ lane: object.lane, z: object.z, type: object.type });
      }
    }
  }

  return result;
}

function canSpawnSowa3Blocker() {
  const gap = sowa3MinBlockerGap();
  return !sowa3CurrentBlockers().some((object) => {
    return object.z > SOWA3_SPAWN_Z - gap && object.z < SOWA3_SPAWN_Z + 0.04;
  });
}

function pickSowa3SafeBlockerLane() {
  if (!canSpawnSowa3Blocker()) return null;

  const lanes = [-1, 0, 1];
  const candidates = lanes.filter((lane) => lane !== sowa3LastBlockerLane);
  const pool = candidates.length ? candidates : lanes;
  const lane = pool[Math.floor(rand(0, pool.length))];
  sowa3LastBlockerLane = lane;
  return lane;
}

function addSowa3LeafInsteadOfBlockedObstacle() {
  const lane = [-1, 0, 1][Math.floor(rand(0, 3))];
  objects.push({ type: "leaf", lane, z: SOWA3_SPAWN_Z, hit: false, phase: rand(0, Math.PI * 2) });
}

function chooseSowa3BaseSpawnType() {
  const difficulty = sowa3ActiveDifficulty();

  if (Math.random() < difficulty.obstacleSkip) return "leaf";

  const roll = Math.random();
  let type = "leaf";
  if (roll < 0.26) type = "leaf";
  else if (roll < 0.46) type = "amic";
  else if (roll < 0.68) type = "shift";
  else if (roll < 0.86) type = "magda";
  else type = "cart";

  if (state.stage === 1 && Math.random() < 0.24) type = "pot";
  if (state.stage === 2 && Math.random() < 0.24) type = "block";

  return type;
}

spawnObject = function balancedSowa3SpawnObject() {
  const type = chooseSowa3BaseSpawnType();

  if (!isSowa3Blocker(type)) {
    const lane = [-1, 0, 1][Math.floor(rand(0, 3))];
    objects.push({ type, lane, z: SOWA3_SPAWN_Z, hit: false, phase: rand(0, Math.PI * 2) });
    return;
  }

  const lane = pickSowa3SafeBlockerLane();
  if (lane === null) {
    if (Math.random() < 0.55) addSowa3LeafInsteadOfBlockedObstacle();
    return;
  }

  objects.push({ type, lane, z: SOWA3_SPAWN_Z, hit: false, phase: rand(0, Math.PI * 2) });
};

const originalSowa3StageObstacleSpawn = spawnSowa3StageObstacle;
spawnSowa3StageObstacle = function balancedSowa3StageObstacleSpawn(type) {
  if (!isSowa3Blocker(type)) {
    return originalSowa3StageObstacleSpawn(type);
  }

  const lane = pickSowa3SafeBlockerLane();
  if (lane === null) return false;

  sowa3StageObstacles.push({
    type,
    lane,
    z: SOWA3_SPAWN_Z,
    hit: false,
    phase: rand(0, Math.PI * 2),
    variant: Math.floor(rand(0, 5)),
  });
  return true;
};
