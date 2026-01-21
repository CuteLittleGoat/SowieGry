const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const heightValue = document.getElementById("heightValue");
const livesValue = document.getElementById("livesValue");
const scoreValue = document.getElementById("scoreValue");

const state = {
  width: 0,
  height: 0,
  dpr: window.devicePixelRatio || 1,
  gravity: 0.45,
  jumpPower: 12,
  boostPower: 16,
  catapultPower: 19,
  deathCatapultPower: 17,
  maxLives: 5,
  invincibleUntil: 0,
  cameraY: 0,
  highestY: 0,
  score: 0,
  lives: 3,
  worldSpeed: 0,
  phase: "title",
};

const owl = {
  x: 0,
  y: 0,
  radius: 18,
  vx: 0,
  vy: 0,
};

const input = {
  left: false,
  right: false,
};

const platforms = [];
const goats = [];
const whales = [];
const leaves = [];
const clouds = [];
const pracuTexts = [];

const fonts = [
  "bold 16px 'Comic Sans MS'",
  "italic 18px 'Baloo 2'",
  "bold 22px 'Trebuchet MS'",
  "16px 'Arial Rounded MT Bold'",
  "20px 'Georgia'",
];

function resize() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  state.dpr = window.devicePixelRatio || 1;
  canvas.width = state.width * state.dpr;
  canvas.height = state.height * state.dpr;
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function getHeightMeters(y) {
  return Math.max(0, Math.round(-y / 10));
}

function platformGap(y) {
  const heightMeters = getHeightMeters(y);
  if (heightMeters < 10) {
    return rand(35, 55);
  }
  if (heightMeters < 25) {
    return rand(50, 75);
  }
  return rand(55, 85);
}

function createPlatform(y) {
  const width = rand(90, 140);
  const height = 20;
  const heightMeters = getHeightMeters(y);
  let type = "normal";
  if (heightMeters >= 75 && Math.random() < 0.35) {
    type = "breakable";
  } else if (heightMeters >= 50 && Math.random() < 0.3) {
    type = "moving";
  } else if (heightMeters >= 25 && Math.random() < 0.28) {
    type = "catapult";
  }
  const platform = {
    x: rand(20, state.width - width - 20),
    y,
    width,
    height,
    type,
  };
  if (type === "moving") {
    platform.vx = rand(0.4, 0.9) * (Math.random() < 0.5 ? -1 : 1);
    platform.range = rand(35, 70);
    platform.baseX = platform.x;
  }
  if (type === "breakable") {
    platform.broken = false;
    platform.breakTime = 0;
  }
  return platform;
}

function spawnGoat(platform) {
  if (platform.type !== "normal" && platform.type !== "moving") {
    return;
  }
  if (getHeightMeters(platform.y) >= 20 && Math.random() < 0.35) {
    goats.push({
      x: platform.x + platform.width / 2,
      y: platform.y - 18,
      vx: Math.random() < 0.5 ? -0.6 : 0.6,
      size: 18,
      platform,
      boostUsed: false,
    });
  }
}

function spawnWhale(y) {
  if (getHeightMeters(y) >= 30 && Math.random() < 0.2) {
    whales.push({
      x: rand(40, state.width - 40),
      y: y - rand(120, 300),
      size: 26,
      taken: false,
    });
  }
}

function spawnLeaf(y) {
  if (Math.random() < 0.3) {
    leaves.push({
      x: rand(30, state.width - 30),
      y: y - rand(80, 220),
      type: Math.random() < 0.5 ? "monstera" : "alocasia",
      size: rand(18, 28),
      taken: false,
    });
  }
}

function spawnCloud() {
  clouds.push({
    x: rand(0, state.width),
    y: rand(0, state.height),
    size: rand(40, 90),
    speed: rand(0.2, 0.6),
    opacity: rand(0.4, 0.8),
  });
}

function spawnPracuText() {
  pracuTexts.push({
    x: rand(-80, state.width + 80),
    y: state.height - rand(30, 80),
    speed: rand(0.5, 1.2),
    font: fonts[Math.floor(rand(0, fonts.length))],
    size: rand(14, 28),
  });
}

function initGame() {
  resize();
  platforms.length = 0;
  goats.length = 0;
  whales.length = 0;
  leaves.length = 0;
  clouds.length = 0;
  pracuTexts.length = 0;

  owl.x = state.width / 2;
  owl.y = state.height * 0.65;
  owl.vx = 0;
  owl.vy = 0;
  input.left = false;
  input.right = false;

  state.cameraY = 0;
  state.highestY = owl.y;
  state.score = 0;
  state.lives = 3;
  state.invincibleUntil = 0;
  state.phase = "playing";

  let y = state.height - 60;
  while (y > -600) {
    const platform = createPlatform(y);
    platforms.push(platform);
    spawnGoat(platform);
    spawnLeaf(platform.y);
    spawnWhale(platform.y);
    y -= platformGap(y);
  }

  for (let i = 0; i < 12; i += 1) {
    spawnCloud();
  }

  for (let i = 0; i < 10; i += 1) {
    spawnPracuText();
  }
}

function initTitle() {
  resize();
  platforms.length = 0;
  goats.length = 0;
  whales.length = 0;
  leaves.length = 0;
  clouds.length = 0;
  pracuTexts.length = 0;

  owl.x = state.width / 2;
  owl.y = state.height * 0.55;
  owl.vx = 0;
  owl.vy = -state.jumpPower;
  input.left = false;
  input.right = false;

  state.cameraY = 0;
  state.highestY = owl.y;
  state.score = 0;
  state.lives = 3;
  state.invincibleUntil = 0;
  state.phase = "title";

  let y = state.height - 80;
  while (y > state.height * 0.2) {
    platforms.push(createPlatform(y));
    y -= rand(60, 90);
  }

  for (let i = 0; i < 10; i += 1) {
    spawnCloud();
  }

  for (let i = 0; i < 6; i += 1) {
    spawnPracuText();
  }
}

function handleInput() {
  const speed = 4.2;
  if (input.left) {
    owl.vx = -speed;
  } else if (input.right) {
    owl.vx = speed;
  } else {
    owl.vx *= 0.85;
  }
}

function resetAfterFall() {
  state.lives -= 1;
  if (state.lives <= 0) {
    state.lives = 3;
    state.score = 0;
    state.cameraY = 0;
    state.highestY = owl.y;
  }
  owl.x = state.width / 2;
  owl.y = state.height / 2;
  owl.vy = -state.deathCatapultPower;
  owl.vx = 0;
  state.invincibleUntil = performance.now() + 3000;
}

function updateTitle(delta) {
  owl.vy += state.gravity;
  owl.vx = Math.sin(performance.now() / 600) * 1.4;
  owl.x += owl.vx;
  owl.y += owl.vy;

  if (owl.x < -owl.radius) {
    owl.x = state.width + owl.radius;
  } else if (owl.x > state.width + owl.radius) {
    owl.x = -owl.radius;
  }

  for (const platform of platforms) {
    if (
      owl.vy > 0 &&
      owl.x > platform.x - owl.radius &&
      owl.x < platform.x + platform.width + owl.radius &&
      owl.y + owl.radius > platform.y &&
      owl.y + owl.radius < platform.y + platform.height + 6
    ) {
      owl.vy = -state.jumpPower;
    }
  }

  if (owl.y > state.height + 40) {
    owl.x = state.width / 2;
    owl.y = state.height * 0.55;
    owl.vy = -state.jumpPower;
  }

  for (const cloud of clouds) {
    cloud.y += cloud.speed * delta * 0.05;
    if (cloud.y > state.height + 120) {
      cloud.y = -rand(80, 200);
      cloud.x = rand(0, state.width);
    }
  }

  for (const text of pracuTexts) {
    text.x += text.speed;
    if (text.x > state.width + 100) {
      text.x = -120;
      text.font = fonts[Math.floor(rand(0, fonts.length))];
      text.size = rand(14, 28);
    }
  }

  heightValue.textContent = "0 m";
  livesValue.textContent = "3";
  scoreValue.textContent = "0";
}

function updateGame(delta) {
  handleInput();
  const now = performance.now();

  for (const platform of platforms) {
    if (platform.type === "moving") {
      platform.x += platform.vx * delta * 0.06;
      if (platform.x < platform.baseX - platform.range || platform.x > platform.baseX + platform.range) {
        platform.vx *= -1;
      }
    }
  }

  owl.vy += state.gravity;
  owl.x += owl.vx;
  owl.y += owl.vy;

  if (owl.x < -owl.radius) {
    owl.x = state.width + owl.radius;
  } else if (owl.x > state.width + owl.radius) {
    owl.x = -owl.radius;
  }

  for (const platform of platforms) {
    if (platform.type === "breakable" && platform.broken) {
      continue;
    }
    if (
      owl.vy > 0 &&
      owl.x > platform.x - owl.radius &&
      owl.x < platform.x + platform.width + owl.radius &&
      owl.y + owl.radius > platform.y &&
      owl.y + owl.radius < platform.y + platform.height + 6
    ) {
      if (platform.type === "catapult") {
        owl.vy = -state.catapultPower;
      } else {
        owl.vy = -state.jumpPower;
      }
      if (platform.type === "breakable") {
        platform.broken = true;
        platform.breakTime = now;
      }
    }
  }

  for (const goat of goats) {
    goat.x += goat.vx;
    if (goat.x < goat.platform.x + 8 || goat.x > goat.platform.x + goat.platform.width - 8) {
      goat.vx *= -1;
    }
    const dist = Math.hypot(owl.x - goat.x, owl.y - goat.y);
    if (dist < owl.radius + goat.size * 0.6) {
      owl.vy = -state.boostPower;
      if (!goat.boostUsed) {
        state.score += 25;
        goat.boostUsed = true;
      }
    }
  }

  for (const whale of whales) {
    if (whale.taken) continue;
    const dist = Math.hypot(owl.x - whale.x, owl.y - whale.y);
    if (dist < owl.radius + whale.size * 0.6) {
      if (state.lives < state.maxLives) {
        state.lives += 1;
      } else {
        state.score += 50;
      }
      whale.taken = true;
    }
  }

  for (const leaf of leaves) {
    if (leaf.taken) continue;
    const dist = Math.hypot(owl.x - leaf.x, owl.y - leaf.y);
    if (dist < owl.radius + leaf.size * 0.6) {
      state.score += leaf.type === "monstera" ? 30 : 20;
      leaf.taken = true;
    }
  }

  const bottomLimit = state.height + 40;
  if (owl.y - state.cameraY > bottomLimit) {
    if (now > state.invincibleUntil) {
      resetAfterFall();
    }
  }

  const pracuBandY = state.height - 30;
  if (owl.y - state.cameraY > pracuBandY && now > state.invincibleUntil) {
    resetAfterFall();
  }

  if (owl.y < state.highestY) {
    state.highestY = owl.y;
    state.score += Math.abs(owl.vy) * 0.02;
  }

  state.cameraY = Math.min(state.cameraY, owl.y - state.height * 0.35);

  const topSpawnY = state.cameraY - 200;
  while (platforms[platforms.length - 1].y > topSpawnY) {
    const last = platforms[platforms.length - 1];
    const nextPlatform = createPlatform(last.y - platformGap(last.y));
    platforms.push(nextPlatform);
    spawnGoat(nextPlatform);
    spawnLeaf(nextPlatform.y);
    spawnWhale(nextPlatform.y);
  }

  while (platforms.length > 0 && platforms[0].y - state.cameraY > state.height + 120) {
    platforms.shift();
  }

  for (let i = platforms.length - 1; i >= 0; i -= 1) {
    const platform = platforms[i];
    if (platform.type === "breakable" && platform.broken && now - platform.breakTime > 400) {
      platforms.splice(i, 1);
    }
  }

  for (const cloud of clouds) {
    cloud.y += cloud.speed * delta * 0.05;
    if (cloud.y - state.cameraY > state.height + 120) {
      cloud.y = state.cameraY - rand(80, 200);
      cloud.x = rand(0, state.width);
    }
  }

  for (const text of pracuTexts) {
    text.x += text.speed;
    if (text.x > state.width + 100) {
      text.x = -120;
      text.font = fonts[Math.floor(rand(0, fonts.length))];
      text.size = rand(14, 28);
    }
  }

  heightValue.textContent = `${Math.max(0, Math.round(-state.cameraY / 10))} m`;
  livesValue.textContent = `${state.lives}`;
  scoreValue.textContent = `${Math.floor(state.score)}`;
}

function drawBackground() {
  ctx.fillStyle = "#bfe7ff";
  ctx.fillRect(0, 0, state.width, state.height);

  for (const cloud of clouds) {
    ctx.save();
    ctx.globalAlpha = cloud.opacity;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y - state.cameraY * 0.2, cloud.size, cloud.size * 0.6, 0, 0, Math.PI * 2);
    ctx.ellipse(cloud.x + cloud.size * 0.6, cloud.y - state.cameraY * 0.2 + 4, cloud.size * 0.7, cloud.size * 0.45, 0, 0, Math.PI * 2);
    ctx.ellipse(cloud.x - cloud.size * 0.6, cloud.y - state.cameraY * 0.2 + 6, cloud.size * 0.5, cloud.size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawPlatform(platform) {
  let fill = "#ffffff";
  let stroke = "#f3c6c6";
  if (platform.type === "moving") {
    fill = "#e8f5ff";
    stroke = "#8bc5ff";
  } else if (platform.type === "catapult") {
    fill = "#e6ffec";
    stroke = "#4caf50";
  } else if (platform.type === "breakable") {
    fill = platform.broken ? "rgba(255, 224, 178, 0.4)" : "#ffe0b2";
    stroke = "#f57c00";
  }
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(platform.x, platform.y - state.cameraY, platform.width, platform.height, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = platform.type === "catapult" ? "#2e7d32" : "#d32f2f";
  ctx.font = "bold 12px 'Baloo 2'";
  ctx.textAlign = "center";
  let label = "amic";
  if (platform.type === "moving") label = "ruch";
  if (platform.type === "catapult") label = "boost";
  if (platform.type === "breakable") label = platform.broken ? "pęk" : "kruch";
  ctx.fillText(label, platform.x + platform.width / 2, platform.y - state.cameraY + 14);
}

function drawGoat(goat) {
  ctx.save();
  ctx.translate(goat.x, goat.y - state.cameraY);
  ctx.strokeStyle = "#7c5a4a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, 8);
  ctx.lineTo(-8, 18);
  ctx.moveTo(0, 8);
  ctx.lineTo(0, 18);
  ctx.moveTo(8, 8);
  ctx.lineTo(8, 18);
  ctx.moveTo(14, 8);
  ctx.lineTo(14, 18);
  ctx.stroke();

  ctx.fillStyle = "#3b2f2f";
  ctx.fillRect(-10, 18, 4, 3);
  ctx.fillRect(-2, 18, 4, 3);
  ctx.fillRect(6, 18, 4, 3);
  ctx.fillRect(12, 18, 4, 3);

  ctx.fillStyle = "#fff6ea";
  ctx.strokeStyle = "#d8b9a5";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-goat.size / 1.5, -goat.size / 2, goat.size * 1.2, goat.size, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#3b2f2f";
  ctx.beginPath();
  ctx.arc(-4, -2, 2, 0, Math.PI * 2);
  ctx.arc(4, -2, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#c49a6c";
  ctx.beginPath();
  ctx.moveTo(-8, -10);
  ctx.lineTo(-14, -16);
  ctx.lineTo(-6, -18);
  ctx.moveTo(8, -10);
  ctx.lineTo(14, -16);
  ctx.lineTo(6, -18);
  ctx.stroke();
  ctx.restore();
}

function drawWhale(whale) {
  if (whale.taken) return;
  ctx.save();
  ctx.translate(whale.x, whale.y - state.cameraY);
  ctx.fillStyle = "#8fd3ff";
  ctx.strokeStyle = "#4fa3d1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, whale.size, whale.size * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#2a1f2d";
  ctx.beginPath();
  ctx.arc(-6, -4, 2.4, 0, Math.PI * 2);
  ctx.arc(6, -4, 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 6, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLeaf(leaf) {
  if (leaf.taken) return;
  ctx.save();
  ctx.translate(leaf.x, leaf.y - state.cameraY);
  ctx.rotate(leaf.type === "monstera" ? 0.2 : -0.3);
  ctx.fillStyle = leaf.type === "monstera" ? "#4caf50" : "#5fc88a";
  ctx.strokeStyle = "#2f7a4f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, leaf.size, leaf.size * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawOwl() {
  ctx.save();
  ctx.translate(owl.x, owl.y - state.cameraY);
  if (performance.now() < state.invincibleUntil) {
    ctx.globalAlpha = 0.6;
  }
  const flap = Math.sin(performance.now() / 120) * 0.5;
  ctx.strokeStyle = "#b58b66";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-10, 4);
  ctx.lineTo(-22, 8 + flap * 6);
  ctx.moveTo(10, 4);
  ctx.lineTo(22, 8 - flap * 6);
  ctx.stroke();

  ctx.fillStyle = "#f2d7aa";
  ctx.strokeStyle = "#b58b66";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, owl.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-8, -4, 6, 0, Math.PI * 2);
  ctx.arc(8, -4, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3b2f2f";
  ctx.beginPath();
  ctx.arc(-8, -4, 2.5, 0, Math.PI * 2);
  ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f39c12";
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(-4, 8);
  ctx.lineTo(4, 8);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#b58b66";
  ctx.beginPath();
  ctx.moveTo(-12, 8);
  ctx.lineTo(-20, 14);
  ctx.moveTo(12, 8);
  ctx.lineTo(20, 14);
  ctx.stroke();
  ctx.restore();
}

function drawPracuTexts() {
  for (const text of pracuTexts) {
    ctx.save();
    ctx.font = text.font;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.strokeStyle = "#ff6b6b";
    ctx.lineWidth = 2;
    ctx.textAlign = "center";
    ctx.fillText("Pracu Pracu", text.x, text.y);
    ctx.strokeText("Pracu Pracu", text.x, text.y);
    ctx.restore();
  }
}

function draw() {
  drawBackground();
  drawPracuTexts();

  for (const platform of platforms) {
    drawPlatform(platform);
  }

  for (const leaf of leaves) {
    drawLeaf(leaf);
  }

  for (const whale of whales) {
    drawWhale(whale);
  }

  for (const goat of goats) {
    drawGoat(goat);
  }

  drawOwl();

  if (state.phase === "title") {
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#2a1f2d";
    ctx.textAlign = "center";
    ctx.font = "bold 40px 'Baloo 2'";
    ctx.fillText("Sowa Jumper", state.width / 2, state.height * 0.38);
    ctx.font = "18px 'Baloo 2'";
    ctx.fillText("Naciśnij dowolny klawisz lub kliknij, aby rozpocząć", state.width / 2, state.height * 0.45);
    ctx.font = "16px 'Baloo 2'";
    ctx.fillText("Sowa skacze po platformach — złap rytm!", state.width / 2, state.height * 0.5);
    ctx.restore();
  }
}

let lastTime = performance.now();
function loop(time) {
  const delta = time - lastTime;
  lastTime = time;
  if (state.phase === "title") {
    updateTitle(delta);
  } else {
    updateGame(delta);
  }
  draw();
  requestAnimationFrame(loop);
}

function playHoot() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(320, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  oscillator.connect(gain).connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.5);
}

function bindInput() {
  window.addEventListener("keydown", (event) => {
    if (state.phase === "title") {
      initGame();
    }
    if (event.key === "ArrowLeft" || event.key === "a") input.left = true;
    if (event.key === "ArrowRight" || event.key === "d") input.right = true;
    if (event.key === " ") playHoot();
  });

  window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key === "a") input.left = false;
    if (event.key === "ArrowRight" || event.key === "d") input.right = false;
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (state.phase === "title") {
      initGame();
    }
    const midpoint = state.width / 2;
    if (event.clientX < midpoint) {
      input.left = true;
      input.right = false;
    } else {
      input.right = true;
      input.left = false;
    }
    playHoot();
  });

  canvas.addEventListener("pointerup", () => {
    input.left = false;
    input.right = false;
  });

  canvas.addEventListener("pointercancel", () => {
    input.left = false;
    input.right = false;
  });
}

window.addEventListener("resize", () => {
  resize();
});

initTitle();
bindInput();
requestAnimationFrame(loop);
