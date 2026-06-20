const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const heightValue = document.getElementById("heightValue");
const livesValue = document.getElementById("livesValue");
const scoreValue = document.getElementById("scoreValue");

const state = {
  scene: "title",
  width: 0,
  height: 0,
  dpr: 1,
  gravity: 0.42,
  jumpPower: 11.8,
  goatPower: 23,
  amicPower: 34,
  wind: 0,
  score: 0,
  bestScore: Number(localStorage.getItem("sowaJumperBestScore") || 0),
  bestHeight: Number(localStorage.getItem("sowaJumperBestHeight") || 0),
  lastScore: 0,
  lastHeight: 0,
  heightMeters: 0,
  lives: 3,
  maxLives: 5,
  cameraY: 0,
  invincibleUntil: 0,
  shake: 0,
  message: "",
  messageUntil: 0,
  time: 0,
  bonusTime: 0,
  bonusDuration: 13,
  bonusScore: 0,
};

const owl = {
  x: 0,
  y: 0,
  radius: 18,
  vx: 0,
  vy: 0,
  flap: 0,
  blink: 0,
};

const input = {
  left: false,
  right: false,
  pointerId: null,
};

const platforms = [];
const goats = [];
const leaves = [];
const whales = [];
const pracuTexts = [];
const clouds = [];
const particles = [];
const bonusLeaves = [];
const bonusPracu = [];

const rand = (min, max) => Math.random() * (max - min) + min;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const now = () => performance.now();

function resize() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  state.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.width = Math.floor(state.width * state.dpr);
  canvas.height = Math.floor(state.height * state.dpr);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
}

function getHeightMeters(y = state.cameraY) {
  return Math.max(0, Math.round(-y / 10));
}

function platformGapForHeight(meters) {
  if (meters < 20) return rand(56, 76);
  if (meters < 60) return rand(72, 98);
  if (meters < 140) return rand(86, 118);
  return rand(100, 138);
}

function createPlatform(y, forcedType = null) {
  const meters = getHeightMeters(y);
  const baseW = clamp(state.width * rand(0.19, 0.27), 86, 148);
  let type = forcedType || "normal";
  if (!forcedType) {
    const r = Math.random();
    if (meters > 35 && r < 0.14) type = "amic";
    else if (meters > 80 && r < 0.30) type = "moving";
    else if (meters > 150 && r < 0.45) type = "crumbly";
  }

  const platform = {
    x: rand(24, Math.max(30, state.width - baseW - 24)),
    y,
    width: baseW,
    height: 18,
    type,
    touched: false,
    brokenAt: 0,
  };

  if (type === "moving") {
    platform.baseX = platform.x;
    platform.vx = rand(0.35, 0.85) * (Math.random() < 0.5 ? -1 : 1);
    platform.range = rand(34, 76);
  }

  return platform;
}

function spawnOnPlatform(platform) {
  const meters = getHeightMeters(platform.y);

  if (platform.type !== "amic" && Math.random() < 0.36) {
    leaves.push({
      x: platform.x + rand(18, platform.width - 18),
      y: platform.y - rand(42, 88),
      size: rand(19, 26),
      spin: rand(0, Math.PI * 2),
      taken: false,
    });
  }

  if ((platform.type === "normal" || platform.type === "moving") && meters > 22 && Math.random() < 0.24) {
    goats.push({
      x: platform.x + platform.width / 2,
      y: platform.y - 22,
      vx: rand(0.45, 0.85) * (Math.random() < 0.5 ? -1 : 1),
      vy: 0,
      size: 21,
      platform,
      used: false,
      phase: rand(0, Math.PI * 2),
    });
  }

  if (meters > 45 && Math.random() < 0.10) {
    whales.push({
      x: platform.x + platform.width / 2,
      y: platform.y - rand(86, 130),
      size: 32,
      phase: rand(0, Math.PI * 2),
      taken: false,
    });
  }

  if (meters > 35 && Math.random() < 0.14) {
    pracuTexts.push({
      x: rand(42, state.width - 42),
      y: platform.y - rand(36, 90),
      width: 108,
      height: 34,
      vx: rand(-0.28, 0.28),
      phase: rand(0, Math.PI * 2),
    });
  }
}

function seedClouds() {
  clouds.length = 0;
  const count = Math.ceil(state.width / 90) + 8;
  for (let i = 0; i < count; i += 1) {
    clouds.push({
      x: rand(-80, state.width + 80),
      y: rand(-state.height * 0.7, state.height),
      size: rand(34, 90),
      speed: rand(0.08, 0.22),
      alpha: rand(0.26, 0.72),
    });
  }
}

function initTitle() {
  resize();
  state.scene = "title";
  state.cameraY = 0;
  state.heightMeters = 0;
  state.score = 0;
  state.lives = 3;
  state.message = "";
  state.invincibleUntil = 0;
  state.shake = 0;

  owl.x = state.width * 0.5;
  owl.y = state.height * 0.58;
  owl.vx = 0;
  owl.vy = -state.jumpPower;
  owl.radius = clamp(state.width * 0.045, 16, 22);

  platforms.length = 0;
  goats.length = 0;
  leaves.length = 0;
  whales.length = 0;
  pracuTexts.length = 0;
  particles.length = 0;
  bonusLeaves.length = 0;
  bonusPracu.length = 0;
  seedClouds();

  let y = state.height - 78;
  while (y > state.height * 0.16) {
    const p = createPlatform(y, Math.random() < 0.16 ? "amic" : "normal");
    platforms.push(p);
    y -= rand(62, 88);
  }

  updateHud();
}

function startGame() {
  resize();
  state.scene = "playing";
  state.cameraY = 0;
  state.score = 0;
  state.heightMeters = 0;
  state.lives = 3;
  state.invincibleUntil = now() + 1800;
  state.message = "Leć wysoko!";
  state.messageUntil = now() + 1800;
  state.shake = 0;

  owl.x = state.width * 0.5;
  owl.y = state.height * 0.62;
  owl.vx = 0;
  owl.vy = -state.jumpPower * 0.8;
  owl.radius = clamp(state.width * 0.045, 16, 22);

  platforms.length = 0;
  goats.length = 0;
  leaves.length = 0;
  whales.length = 0;
  pracuTexts.length = 0;
  particles.length = 0;
  seedClouds();

  const first = createPlatform(state.height - 74, "normal");
  first.x = state.width * 0.5 - first.width / 2;
  platforms.push(first);

  let y = state.height - 142;
  while (y > -800) {
    const p = createPlatform(y);
    platforms.push(p);
    spawnOnPlatform(p);
    y -= platformGapForHeight(getHeightMeters(y));
  }
}

function addParticles(x, y, count, label = "") {
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x,
      y,
      vx: rand(-2.1, 2.1),
      vy: rand(-3.6, -0.8),
      life: rand(360, 820),
      maxLife: 820,
      size: rand(2, 5),
      label: i === 0 ? label : "",
    });
  }
}

function damage(reason) {
  if (now() < state.invincibleUntil || state.scene !== "playing") return;
  state.lives -= 1;
  state.invincibleUntil = now() + 2200;
  state.shake = 16;
  state.message = reason;
  state.messageUntil = now() + 1700;
  addParticles(owl.x, owl.y - state.cameraY, 16, "-1");

  if (state.lives <= 0) {
    endGame();
    return;
  }

  owl.x = state.width * 0.5;
  owl.y = state.cameraY + state.height * 0.52;
  owl.vx = 0;
  owl.vy = -state.amicPower * 0.75;
}

function endGame() {
  state.scene = "gameover";
  state.lastScore = Math.floor(state.score);
  state.lastHeight = state.heightMeters;
  state.bestScore = Math.max(state.bestScore, state.lastScore);
  state.bestHeight = Math.max(state.bestHeight, state.lastHeight);
  localStorage.setItem("sowaJumperBestScore", String(state.bestScore));
  localStorage.setItem("sowaJumperBestHeight", String(state.bestHeight));
}

function updateTitle(delta) {
  owl.vy += state.gravity;
  owl.vx = Math.sin(state.time / 700) * 1.25;
  owl.x += owl.vx;
  owl.y += owl.vy;

  if (owl.x < -owl.radius) owl.x = state.width + owl.radius;
  if (owl.x > state.width + owl.radius) owl.x = -owl.radius;

  for (const p of platforms) {
    if (owl.vy > 0 && owl.x > p.x - owl.radius && owl.x < p.x + p.width + owl.radius && owl.y + owl.radius > p.y && owl.y + owl.radius < p.y + p.height + 8) {
      owl.vy = p.type === "amic" ? -state.jumpPower * 1.55 : -state.jumpPower;
      addParticles(owl.x, p.y, 4);
    }
  }

  if (owl.y > state.height + 50) {
    owl.x = state.width * 0.5;
    owl.y = state.height * 0.52;
    owl.vy = -state.jumpPower;
  }

  updateAmbient(delta);
}

function updateGame(delta) {
  handleMovement(delta);

  const difficulty = 1 + state.heightMeters / 320;
  owl.vy += state.gravity * Math.min(1.28, difficulty);
  owl.x += owl.vx;
  owl.y += owl.vy;

  if (owl.x < -owl.radius) owl.x = state.width + owl.radius;
  if (owl.x > state.width + owl.radius) owl.x = -owl.radius;

  for (const p of platforms) {
    if (p.type === "moving") {
      p.x = p.baseX + Math.sin(state.time / 900 * p.vx) * p.range;
    }
  }

  collidePlatforms();
  updateGoats();
  updateLeaves();
  updateWhales();
  updatePracu();
  updateParticles(delta);

  if (owl.y < state.cameraY + state.height * 0.38) {
    state.cameraY = owl.y - state.height * 0.38;
  }

  state.heightMeters = getHeightMeters(state.cameraY);
  state.score += Math.max(0, -owl.vy) * 0.018 + 0.012;

  generateWorld();
  cleanupWorld();

  if (owl.y - state.cameraY > state.height + 88) {
    damage("Sowa spadła poza kadr!");
  }

  updateAmbient(delta);
  updateHud();
}

function handleMovement(delta) {
  const accel = 0.62;
  const maxSpeed = clamp(state.width * 0.011, 4.5, 7.0);

  if (input.left) owl.vx -= accel;
  if (input.right) owl.vx += accel;
  if (!input.left && !input.right) owl.vx *= 0.92;

  owl.vx = clamp(owl.vx, -maxSpeed, maxSpeed);
  owl.flap += delta * (Math.abs(owl.vy) > 1 ? 0.020 : 0.010);
}

function collidePlatforms() {
  if (owl.vy < 0) return;
  for (const p of platforms) {
    if (p.type === "crumbly" && p.brokenAt) continue;

    const wasAbove = owl.y - owl.vy + owl.radius <= p.y + 4;
    const withinX = owl.x + owl.radius > p.x && owl.x - owl.radius < p.x + p.width;
    const onTop = owl.y + owl.radius >= p.y && owl.y + owl.radius <= p.y + p.height + 12;

    if (wasAbove && withinX && onTop) {
      owl.y = p.y - owl.radius;
      if (p.type === "amic") {
        owl.vy = -state.amicPower;
        state.score += 18;
        state.message = "Amic! Katapulta!";
        state.messageUntil = now() + 1100;
        addParticles(owl.x, p.y - state.cameraY, 18, "+18");
      } else {
        owl.vy = -state.jumpPower;
        addParticles(owl.x, p.y - state.cameraY, 5);
      }

      if (p.type === "crumbly") {
        p.brokenAt = now();
        state.message = "Krusząca platforma!";
        state.messageUntil = now() + 900;
      }

      return;
    }
  }
}

function updateGoats() {
  for (const goat of goats) {
    goat.phase += 0.08;
    goat.x += goat.vx;
    const left = goat.platform.x + 14;
    const right = goat.platform.x + goat.platform.width - 14;
    if (goat.x < left || goat.x > right) goat.vx *= -1;
    goat.y = goat.platform.y - 23 + Math.sin(goat.phase) * 5;

    const dist = Math.hypot(owl.x - goat.x, owl.y - goat.y);
    if (dist < owl.radius + goat.size * 0.72) {
      owl.vy = -state.goatPower;
      state.score += goat.used ? 3 : 35;
      goat.used = true;
      state.message = "Koza wybija sowę!";
      state.messageUntil = now() + 1000;
      addParticles(goat.x, goat.y - state.cameraY, 14, "+35");
    }
  }
}

function updateLeaves() {
  for (let i = leaves.length - 1; i >= 0; i -= 1) {
    const leaf = leaves[i];
    leaf.spin += 0.03;
    const bobY = leaf.y + Math.sin(state.time / 400 + leaf.spin) * 5;
    if (Math.hypot(owl.x - leaf.x, owl.y - bobY) < owl.radius + leaf.size * 0.82) {
      state.score += 25;
      addParticles(leaf.x, bobY - state.cameraY, 12, "+25");
      leaves.splice(i, 1);
    }
  }
}

function updateWhales() {
  for (let i = whales.length - 1; i >= 0; i -= 1) {
    const whale = whales[i];
    whale.phase += 0.035;
    const wy = whale.y + Math.sin(whale.phase) * 8;
    if (Math.hypot(owl.x - whale.x, owl.y - wy) < owl.radius + whale.size * 0.85) {
      whales.splice(i, 1);
      startBonus();
      return;
    }
  }
}

function updatePracu() {
  for (const t of pracuTexts) {
    t.x += t.vx;
    t.y += Math.sin(state.time / 500 + t.phase) * 0.18;
    if (t.x < 32 || t.x > state.width - 32) t.vx *= -1;
    if (circleRect(owl.x, owl.y, owl.radius, t.x - t.width / 2, t.y - t.height / 2, t.width, t.height)) {
      damage("Pracu Pracu zbiło rytm!");
    }
  }
}

function generateWorld() {
  let topY = platforms.reduce((min, p) => Math.min(min, p.y), Infinity);
  const targetTop = state.cameraY - state.height * 1.4;
  while (topY > targetTop) {
    const nextY = topY - platformGapForHeight(getHeightMeters(topY));
    const p = createPlatform(nextY);
    platforms.push(p);
    spawnOnPlatform(p);
    topY = nextY;
  }
}

function cleanupWorld() {
  const bottom = state.cameraY + state.height + 200;
  for (let i = platforms.length - 1; i >= 0; i -= 1) {
    const p = platforms[i];
    if ((p.type === "crumbly" && p.brokenAt && now() - p.brokenAt > 360) || p.y > bottom) {
      platforms.splice(i, 1);
    }
  }
  for (let i = goats.length - 1; i >= 0; i -= 1) if (goats[i].y > bottom) goats.splice(i, 1);
  for (let i = leaves.length - 1; i >= 0; i -= 1) if (leaves[i].y > bottom) leaves.splice(i, 1);
  for (let i = whales.length - 1; i >= 0; i -= 1) if (whales[i].y > bottom) whales.splice(i, 1);
  for (let i = pracuTexts.length - 1; i >= 0; i -= 1) if (pracuTexts[i].y > bottom) pracuTexts.splice(i, 1);
}

function startBonus() {
  state.scene = "bonus";
  state.bonusTime = state.bonusDuration;
  state.bonusScore = 0;
  state.message = "Humbakowy bonus!";
  state.messageUntil = now() + 1400;
  bonusLeaves.length = 0;
  bonusPracu.length = 0;
  owl.x = state.width * 0.5;
  owl.y = state.height * 0.46;
  owl.vx = 0;
  owl.vy = 0;
  for (let i = 0; i < 12; i += 1) spawnBonusLeaf(true);
  for (let i = 0; i < 4; i += 1) spawnBonusPracu(true);
}

function spawnBonusLeaf(initial = false) {
  bonusLeaves.push({
    x: initial ? rand(36, state.width - 36) : state.width + rand(40, 180),
    y: rand(state.height * 0.22, state.height * 0.74),
    size: rand(20, 30),
    spin: rand(0, Math.PI * 2),
  });
}

function spawnBonusPracu(initial = false) {
  bonusPracu.push({
    x: initial ? rand(80, state.width - 80) : state.width + rand(120, 260),
    y: rand(state.height * 0.22, state.height * 0.72),
    width: 112,
    height: 34,
    wave: rand(0, Math.PI * 2),
  });
}

function updateBonus(delta) {
  state.bonusTime -= delta / 1000;
  const move = (state.width < 700 ? 5.2 : 6.4);
  if (input.left) owl.x -= move;
  if (input.right) owl.x += move;
  owl.x = clamp(owl.x, 28, state.width - 28);
  owl.y = state.height * 0.47 + Math.sin(state.time / 270) * 10;

  const scroll = clamp(state.width * 0.007, 3.4, 6.2);
  for (let i = bonusLeaves.length - 1; i >= 0; i -= 1) {
    const l = bonusLeaves[i];
    l.x -= scroll;
    l.spin += 0.05;
    if (Math.hypot(owl.x - l.x, owl.y - l.y) < owl.radius + l.size * 0.8) {
      state.bonusScore += 35;
      state.score += 35;
      addParticles(l.x, l.y, 10, "+35");
      bonusLeaves.splice(i, 1);
      spawnBonusLeaf();
    } else if (l.x < -80) {
      bonusLeaves.splice(i, 1);
      spawnBonusLeaf();
    }
  }

  for (let i = bonusPracu.length - 1; i >= 0; i -= 1) {
    const p = bonusPracu[i];
    p.x -= scroll * 0.9;
    p.y += Math.sin(state.time / 360 + p.wave) * 0.45;
    if (circleRect(owl.x, owl.y, owl.radius, p.x - p.width / 2, p.y - p.height / 2, p.width, p.height)) {
      state.bonusScore = Math.max(0, state.bonusScore - 20);
      state.score = Math.max(0, state.score - 20);
      state.shake = 10;
      addParticles(owl.x, owl.y, 10, "-20");
      bonusPracu.splice(i, 1);
      spawnBonusPracu();
    } else if (p.x < -120) {
      bonusPracu.splice(i, 1);
      spawnBonusPracu();
    }
  }

  updateParticles(delta);
  updateAmbient(delta);
  updateHud();

  if (state.bonusTime <= 0) {
    state.scene = "playing";
    owl.y = state.cameraY + state.height * 0.44;
    owl.vy = -state.amicPower * 0.85;
    state.message = `Bonus: +${state.bonusScore} pkt`;
    state.messageUntil = now() + 1600;
    state.invincibleUntil = now() + 1400;
  }
}

function updateAmbient(delta) {
  for (const c of clouds) {
    c.y += c.speed * delta * 0.03;
    if (c.y - state.cameraY * 0.12 > state.height + 120) {
      c.y = state.cameraY * 0.12 - rand(100, 220);
      c.x = rand(-100, state.width + 100);
    }
  }

  if (state.shake > 0) state.shake *= 0.86;
}

function updateParticles(delta) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    p.life -= delta;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function circleRect(cx, cy, cr, rx, ry, rw, rh) {
  const nx = clamp(cx, rx, rx + rw);
  const ny = clamp(cy, ry, ry + rh);
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < cr * cr;
}

function updateHud() {
  heightValue.textContent = `${state.heightMeters || 0} m`;
  scoreValue.textContent = `${Math.floor(state.score)}`;
  livesValue.textContent = `${state.lives}`;
}

function draw() {
  ctx.save();
  ctx.clearRect(0, 0, state.width, state.height);
  if (state.shake > 0) ctx.translate(rand(-state.shake, state.shake), rand(-state.shake, state.shake));

  drawBackground();

  if (state.scene === "bonus") {
    drawBonus();
  } else {
    drawWorld();
    drawOwl(owl.x, owl.y - state.cameraY, owl.radius, state.scene !== "title" && now() < state.invincibleUntil);
  }

  drawParticles();
  drawOverlay();

  ctx.restore();
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, state.height);
  g.addColorStop(0, "#bfe7ff");
  g.addColorStop(0.52, "#dff6ff");
  g.addColorStop(1, "#f3fff0");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, state.width, state.height);

  for (const c of clouds) {
    drawCloud(c.x, c.y - state.cameraY * 0.12, c.size, c.alpha);
  }

  ctx.fillStyle = "rgba(255,255,255,0.24)";
  for (let i = 0; i < 4; i += 1) {
    const y = state.height * (0.18 + i * 0.18) - (state.cameraY * (0.03 + i * 0.01) % 90);
    ctx.fillRect(0, y, state.width, 2);
  }
}

function drawCloud(x, y, size, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.42, 0, 0, Math.PI * 2);
  ctx.ellipse(x - size * 0.52, y + 5, size * 0.55, size * 0.34, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.54, y + 4, size * 0.64, size * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWorld() {
  for (const p of platforms) drawPlatform(p);
  for (const leaf of leaves) drawMonstera(leaf.x, leaf.y - state.cameraY + Math.sin(state.time / 400 + leaf.spin) * 5, leaf.size, leaf.spin);
  for (const whale of whales) drawWhale(whale.x, whale.y - state.cameraY + Math.sin(whale.phase) * 8, whale.size);
  for (const goat of goats) drawGoat(goat.x, goat.y - state.cameraY, goat.size, goat.phase, goat.used);
  for (const t of pracuTexts) drawPracu(t.x, t.y - state.cameraY, t.width, t.height);
}

function drawPlatform(p) {
  const y = p.y - state.cameraY;
  if (y < -100 || y > state.height + 100) return;
  if (p.type === "amic") {
    drawAmic(p.x, y, p.width);
    return;
  }

  ctx.save();
  const alpha = p.type === "crumbly" && p.brokenAt ? 0.45 : 1;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = p.type === "moving" ? "rgba(95, 142, 190, 0.90)" : p.type === "crumbly" ? "rgba(145, 118, 94, 0.88)" : "rgba(85, 130, 160, 0.88)";
  roundRect(p.x, y, p.width, p.height, 9, true);
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  roundRect(p.x + 10, y + 4, p.width - 20, 4, 4, true);
  if (p.type === "crumbly") {
    ctx.strokeStyle = "rgba(80,45,30,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x + p.width * 0.35, y + 3);
    ctx.lineTo(p.x + p.width * 0.48, y + p.height - 4);
    ctx.moveTo(p.x + p.width * 0.62, y + 3);
    ctx.lineTo(p.x + p.width * 0.54, y + p.height - 4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawAmic(x, y, w) {
  const h = w * 0.54;
  ctx.save();
  ctx.translate(x, y - h + 16);
  const scale = w / 120;
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(60, 70, 64, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  roundRect(2, 10, 116, 64, 12, true);
  ctx.fillStyle = "#f24b58";
  roundRect(-8, 0, 136, 20, 12, true);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  roundRect(4, 5, 112, 5, 5, true);
  ctx.fillStyle = "#f24b58";
  roundRect(18, 28, 84, 28, 8, true);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px 'Baloo 2', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Amic", 60, 42);
  ctx.fillStyle = "#cfd4d8";
  roundRect(18, 58, 18, 18, 4, true);
  roundRect(84, 58, 18, 18, 4, true);
  ctx.restore();
}

function drawGoat(x, y, size, phase, used) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 24;
  ctx.scale(s, s);
  const hop = Math.sin(phase) * 3;
  ctx.globalAlpha = used ? 0.72 : 1;
  ctx.fillStyle = "rgba(0,0,0,0.23)";
  ctx.beginPath();
  ctx.ellipse(0, 24, 28, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  roundRect(-25, -25 + hop, 50, 32, 12, true);
  ctx.fillStyle = "#f7f7f7";
  roundRect(17, -33 + hop, 25, 24, 10, true);
  ctx.strokeStyle = "#9b9b9b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(26, -34 + hop);
  ctx.lineTo(20, -47 + hop);
  ctx.moveTo(36, -34 + hop);
  ctx.lineTo(43, -47 + hop);
  ctx.stroke();
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.ellipse(26, -23 + hop, 2.4, 2.4, 0, 0, Math.PI * 2);
  ctx.ellipse(36, -23 + hop, 2.4, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,150,165,0.8)";
  ctx.beginPath();
  ctx.ellipse(24, -16 + hop, 3.8, 2.5, 0, 0, Math.PI * 2);
  ctx.ellipse(38, -16 + hop, 3.8, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6b6b6b";
  roundRect(-18, 5 + hop, 7, 18, 3, true);
  roundRect(0, 5 + hop, 7, 18, 3, true);
  roundRect(14, 5 + hop, 7, 18, 3, true);
  ctx.restore();
}

function drawWhale(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 36;
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(0,0,0,0.20)";
  ctx.beginPath();
  ctx.ellipse(2, 27, 46, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#72caee";
  ctx.beginPath();
  ctx.ellipse(0, 0, 44, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#61bfe4";
  ctx.beginPath();
  ctx.moveTo(39, 0);
  ctx.lineTo(66, -18);
  ctx.lineTo(66, 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#d4fbff";
  ctx.beginPath();
  ctx.ellipse(-8, 10, 30, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.ellipse(-23, -6, 3, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath();
  ctx.arc(6, -26, 3, 0, Math.PI * 2);
  ctx.arc(16, -32, 2.4, 0, Math.PI * 2);
  ctx.arc(25, -27, 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMonstera(x, y, size, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(rot) * 0.18);
  const s = size / 32;
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 34, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#32a65f";
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.bezierCurveTo(28, -38, 44, -12, 32, 10);
  ctx.bezierCurveTo(24, 30, 12, 40, 0, 46);
  ctx.bezierCurveTo(-12, 40, -24, 30, -32, 10);
  ctx.bezierCurveTo(-44, -12, -28, -38, 0, -34);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(95,210,130,0.72)";
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.bezierCurveTo(20, -30, 32, -9, 24, 10);
  ctx.bezierCurveTo(18, 25, 8, 35, 0, 39);
  ctx.bezierCurveTo(-8, 35, -18, 25, -24, 10);
  ctx.bezierCurveTo(-32, -9, -20, -30, 0, -28);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(20,110,65,0.72)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(0, 43);
  ctx.moveTo(0, -12);
  ctx.lineTo(-20, -3);
  ctx.moveTo(0, -12);
  ctx.lineTo(20, -3);
  ctx.moveTo(0, 8);
  ctx.lineTo(-21, 20);
  ctx.moveTo(0, 8);
  ctx.lineTo(21, 20);
  ctx.stroke();
  ctx.fillStyle = "rgba(190,235,255,0.82)";
  ctx.beginPath();
  ctx.ellipse(-13, -3, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(13, -3, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(0, 17, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPracu(x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  const pulse = 1 + Math.sin(state.time / 210) * 0.04;
  ctx.scale(pulse, pulse);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.strokeStyle = "#ff5e68";
  ctx.lineWidth = 4;
  roundRect(-w / 2, -h / 2, w, h, 10, true, true);
  ctx.fillStyle = "#e84855";
  ctx.font = "bold 18px 'Baloo 2', 'Comic Sans MS', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Pracu Pracu", 0, 1);
  ctx.restore();
}

function drawOwl(x, y, r, invincible = false) {
  ctx.save();
  ctx.translate(x, y);
  if (invincible && Math.floor(state.time / 90) % 2 === 0) ctx.globalAlpha = 0.55;
  const s = r / 18;
  ctx.scale(s, s);
  const flap = Math.sin(owl.flap) * 0.55;
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath();
  ctx.ellipse(0, 42, 30, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.rotate(-0.18 - flap * 0.45);
  ctx.fillStyle = "#9b6e48";
  ctx.beginPath();
  ctx.ellipse(-31, 0, 16, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.rotate(0.18 + flap * 0.45);
  ctx.fillStyle = "#9b6e48";
  ctx.beginPath();
  ctx.ellipse(31, 0, 16, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#b98258";
  ctx.beginPath();
  ctx.ellipse(0, 0, 36, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f1dfc5";
  ctx.beginPath();
  ctx.ellipse(0, 11, 23, 27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ddcbb7";
  ctx.beginPath();
  ctx.ellipse(-17, -10, 16, 16, 0, 0, Math.PI * 2);
  ctx.ellipse(17, -10, 16, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  const blink = Math.sin(state.time / 900) > 0.94;
  if (!blink) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(-17, -12, 9, 9, 0, 0, Math.PI * 2);
    ctx.ellipse(17, -12, 9, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.ellipse(-17, -12, 3.4, 3.4, 0, 0, Math.PI * 2);
    ctx.ellipse(17, -12, 3.4, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = "#593827";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-17, -12, 8, 0, Math.PI);
    ctx.arc(17, -12, 8, 0, Math.PI);
    ctx.stroke();
  }
  ctx.fillStyle = "#f6c74a";
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.lineTo(-8, 9);
  ctx.lineTo(8, 9);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBonus() {
  drawWhale(state.width * 0.5, state.height * 0.77 + Math.sin(state.time / 450) * 10, 72);
  ctx.save();
  ctx.fillStyle = "rgba(95, 190, 230, 0.20)";
  ctx.beginPath();
  ctx.ellipse(state.width * 0.5, state.height * 0.80, state.width * 0.56, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (const l of bonusLeaves) drawMonstera(l.x, l.y, l.size, l.spin);
  for (const p of bonusPracu) drawPracu(p.x, p.y, p.width, p.height);
  drawOwl(owl.x, owl.y, owl.radius, false);

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.76)";
  roundRect(18, state.height - 74, state.width - 36, 46, 18, true);
  ctx.fillStyle = "#2a1f2d";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 18px 'Baloo 2', sans-serif";
  ctx.fillText(`Humbakowy bonus: ${Math.ceil(state.bonusTime)} s  •  +${state.bonusScore} pkt`, state.width / 2, state.height - 51);
  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    const a = clamp(p.life / p.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    if (p.label) {
      ctx.fillStyle = "#2a1f2d";
      ctx.font = "bold 18px 'Baloo 2', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.label, p.x, p.y);
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawOverlay() {
  if (state.scene === "playing") {
    drawMessage();
    return;
  }

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillRect(0, 0, state.width, state.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#2a1f2d";

  if (state.scene === "title") {
    ctx.font = "900 44px 'Baloo 2', 'Comic Sans MS', sans-serif";
    ctx.fillText("Sowa Jumper", state.width / 2, state.height * 0.28);
    ctx.font = "18px 'Baloo 2', sans-serif";
    ctx.fillText("Skacz po platformach, łap monstery i szukaj humbaka.", state.width / 2, state.height * 0.36);
    ctx.font = "bold 19px 'Baloo 2', sans-serif";
    ctx.fillText("Tap / klik / spacja — start", state.width / 2, state.height * 0.45);
    ctx.font = "15px 'Baloo 2', sans-serif";
    ctx.fillText("Lewo/prawo: połowy ekranu albo A/D/strzałki", state.width / 2, state.height * 0.51);
    ctx.fillText(`Rekord: ${state.bestHeight} m • ${state.bestScore} pkt`, state.width / 2, state.height * 0.58);
  }

  if (state.scene === "gameover") {
    ctx.font = "900 42px 'Baloo 2', 'Comic Sans MS', sans-serif";
    ctx.fillText("Koniec lotu", state.width / 2, state.height * 0.30);
    ctx.font = "20px 'Baloo 2', sans-serif";
    ctx.fillText(`Wysokość: ${state.lastHeight} m`, state.width / 2, state.height * 0.40);
    ctx.fillText(`Punkty: ${state.lastScore}`, state.width / 2, state.height * 0.46);
    ctx.font = "15px 'Baloo 2', sans-serif";
    ctx.fillText(`Rekord: ${state.bestHeight} m • ${state.bestScore} pkt`, state.width / 2, state.height * 0.53);
    ctx.font = "bold 18px 'Baloo 2', sans-serif";
    ctx.fillText("Tap / klik / spacja — jeszcze raz", state.width / 2, state.height * 0.64);
  }

  ctx.restore();
}

function drawMessage() {
  if (!state.message || now() > state.messageUntil) return;
  ctx.save();
  ctx.globalAlpha = clamp((state.messageUntil - now()) / 600, 0, 1);
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  roundRect(state.width / 2 - 138, 72, 276, 42, 18, true);
  ctx.fillStyle = "#2a1f2d";
  ctx.font = "bold 18px 'Baloo 2', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(state.message, state.width / 2, 94);
  ctx.restore();
}

function roundRect(x, y, w, h, r, fill = false, stroke = false) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function loop(t) {
  const delta = Math.min(40, t - (state.time || t));
  state.time = t;

  if (state.scene === "title") updateTitle(delta);
  else if (state.scene === "playing") updateGame(delta);
  else if (state.scene === "bonus") updateBonus(delta);
  else updateAmbient(delta);

  draw();
  requestAnimationFrame(loop);
}

function setPointerDirection(event) {
  const midpoint = state.width / 2;
  input.left = event.clientX < midpoint;
  input.right = event.clientX >= midpoint;
}

window.addEventListener("keydown", (event) => {
  if (event.key === " " || event.key === "Enter") {
    if (state.scene === "title" || state.scene === "gameover") startGame();
    event.preventDefault();
  }
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") input.left = true;
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") input.right = true;
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") input.left = false;
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") input.right = false;
});

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture?.(event.pointerId);
  input.pointerId = event.pointerId;
  if (state.scene === "title" || state.scene === "gameover") {
    startGame();
    return;
  }
  setPointerDirection(event);
});

canvas.addEventListener("pointermove", (event) => {
  if (input.pointerId === event.pointerId && (state.scene === "playing" || state.scene === "bonus")) {
    setPointerDirection(event);
  }
});

function clearPointer(event) {
  if (input.pointerId === event.pointerId) {
    input.left = false;
    input.right = false;
    input.pointerId = null;
  }
}

canvas.addEventListener("pointerup", clearPointer);
canvas.addEventListener("pointercancel", clearPointer);
window.addEventListener("blur", () => {
  input.left = false;
  input.right = false;
});

window.addEventListener("resize", () => {
  const oldW = state.width || window.innerWidth;
  const oldH = state.height || window.innerHeight;
  resize();
  const sx = state.width / oldW;
  const sy = state.height / oldH;
  owl.x *= sx;
  owl.y *= sy;
  state.cameraY *= sy;
  for (const arr of [platforms, goats, leaves, whales, pracuTexts]) {
    for (const item of arr) {
      if ("x" in item) item.x *= sx;
      if ("y" in item) item.y *= sy;
      if ("width" in item) item.width *= sx;
      if ("height" in item) item.height *= sy;
    }
  }
});

initTitle();
requestAnimationFrame(loop);
