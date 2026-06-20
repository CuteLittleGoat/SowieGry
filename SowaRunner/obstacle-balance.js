// Balans przeszkód SowaRunner.
// Wymusza większe odstępy między przeszkodami blokującymi,
// aby przy wysokiej prędkości nie powstawały układy bez reakcji.

const RUNNER_GAP_MULT = [1.28, 1.18, 1.12];
const RUNNER_EXTRA_GAP = [110, 92, 78];
let runnerLastHazardType = null;

function runnerBalancedGap(config, extra = 0) {
  const mult = RUNNER_GAP_MULT[level] || RUNNER_GAP_MULT[1];
  const bonus = (RUNNER_EXTRA_GAP[level] || RUNNER_EXTRA_GAP[1]) * s;
  return random(config[3], config[4]) * mult + bonus + extra;
}

function runnerChooseHazard() {
  let type;
  const roll = random();
  if (roll < 0.24) type = "hole";
  else if (roll < 0.48) type = "wall";
  else if (roll < 0.72) type = "pracu";
  else type = "amic";

  if (type === runnerLastHazardType && random() < 0.72) {
    const alternatives = ["hole", "wall", "pracu", "amic"].filter((item) => item !== runnerLastHazardType);
    type = alternatives[Math.floor(random(alternatives.length))];
  }

  runnerLastHazardType = type;
  return type;
}

spawnStuff = function balancedRunnerSpawnStuff(dt, config) {
  spawn.leaf -= dt;
  if (spawn.leaf <= 0) {
    spawn.leaf = random(0.65, 1.22);
    leaves.push({
      x: width + 50,
      y: random(ground - 205 * s, ground - 86 * s),
      r: random(18, 26) * s,
      rot: random(TWO_PI),
      bob: random(TWO_PI)
    });
  }

  spawn.plat -= dt;
  if (spawn.plat <= 0) {
    spawn.plat = random(3.4, 5.6);
    plats.push({
      x: width + 80,
      y: random(ground - 178 * s, ground - 118 * s),
      w: random(130, 210) * s,
      h: 17 * s
    });
  }

  spawn.goat -= dt;
  if (spawn.goat <= 0) {
    spawn.goat = random(5.8, 9.4);
    goats.push({
      x: width + 80,
      y: ground - 22 * s,
      r: 23 * s,
      vy: random(-8, -12) * s,
      ph: random(TWO_PI),
      used: false
    });
  }

  spawn.whale -= dt;
  if (spawn.whale <= 0) {
    spawn.whale = random(25, 38);
    whales.push({
      x: width + 90,
      y: random(ground - 185 * s, ground - 130 * s),
      r: 34 * s,
      ph: random(TWO_PI)
    });
  }

  spawn.gap -= spd * 60 * dt;
  if (spawn.gap > 0) return;

  const hazard = runnerChooseHazard();
  if (hazard === "hole") {
    const w = random(46, 82) * s;
    holes.push({ x: width + 60, w });
    spawn.gap = runnerBalancedGap(config, w * 0.75 + 40 * s);
  } else if (hazard === "wall") {
    const h = random(48, 78) * s;
    walls.push({ x: width + 60, y: ground - h, w: 34 * s, h });
    spawn.gap = runnerBalancedGap(config, 64 * s);
  } else if (hazard === "pracu") {
    pracu.push({
      x: width + 70,
      y: random(ground - 190 * s, ground - 104 * s),
      w: 116 * s,
      h: 34 * s,
      wave: random(TWO_PI)
    });
    spawn.gap = runnerBalancedGap(config, 96 * s);
  } else {
    amic.push({ x: width + 60, y: ground - 74 * s, w: 118 * s, h: 74 * s, roof: 16 * s });
    spawn.gap = runnerBalancedGap(config, 110 * s);
  }
};
