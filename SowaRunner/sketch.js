// ============================================
//  DLA SUFKI — Endless Runner (p5.js) — vLevels
//  Wklej CAŁOŚĆ do sketch.js
//  Start screen: wybór poziomu trudności (Easy / Normal / Cute-chaos)
//  Sterowanie na starcie: 1/2/3 lub klik w przyciski, Spacja/klik = start
// ============================================

// =====================
// STATES
// =====================
const ST_START = 0;
const ST_RUNNER = 1;
const ST_MINIGAME = 2;

let state = ST_START;

// =====================
// POZIOMY TRUDNOŚCI
// =====================
// Uwaga: te wartości są faktycznie używane przez grę (przez activeCFG).
// Wybór trudności jest na ekranie startowym (1/2/3 lub klik).
const DIFFICULTIES = [
  {
    id: "easy",
    name: "Easy",
    desc: "Hu!",
    // =====================
    // POZIOMY TRUDNOŚCI
    // =====================
    maxSpeed: 9.2,
    speedRampPerSec: 0.045,
    hazardGapMinPx: 260,
    hazardGapMaxPx: 420,
    platformChance: 0.012
  },
  {
    id: "normal",
    name: "Normal",
    desc: "Me?",
    // =====================
    // POZIOMY TRUDNOŚCI
    // =====================
    maxSpeed: 11.0,
    speedRampPerSec: 0.085,
    hazardGapMinPx: 170,
    hazardGapMaxPx: 300,
    platformChance: 0.012
  },
  {
    id: "chaos",
    name: "Cute-chaos",
    desc: "AAAAA!",
    // =====================
    // POZIOMY TRUDNOŚCI
    // =====================
    maxSpeed: 11.6,
    speedRampPerSec: 0.11,
    hazardGapMinPx: 140,
    hazardGapMaxPx: 260,
    platformChance: 0.018
  }
];

let selectedDifficultyIndex = 0;
let activeCFG = null;

// touch control
const TOUCH_ACTION_COOLDOWN_MS = 240;
let lastTouchActionMillis = -Infinity;

// UI layout helpers
const DIFFICULTY_UI = {
  width: 190,
  height: 74,
  gap: 20
};
const START_BUTTON_UI = {
  width: 280,
  height: 92,
  yOffset: 62
};

// =====================
// CONFIG (stałe elementy)
// =====================
const BASE = {
  baseSpeed: 5.4,

  gravity: 1.18,
  jumpPower: -16.4,
  doubleJumpPower: -15.6,

  // leaves / powerup
  spawnLeafChance: 0.032,
  spawnGoatChance: 0.0022,

  // hazard weights (typ przeszkody przy spawnie)
  hazardWeights: {
    hole: 0.28,
    wall: 0.28,
    pracu: 0.26,
    amic: 0.18
  },

  miniTimeLimitSec: 15,

  // lives
  startLives: 3,
  maxLives: 5,
  invulnSec: 3.0,

  // whale rewards
  whalePoints: 140,
  whaleExtraLifeBonusPoints: 320
};

const DESIGN_WIDTH = 920;
const DESIGN_HEIGHT = 520;
const DESIGN_GROUND_OFFSET = 110;

let layoutScaleX = 1;
let layoutScaleY = 1;

const sx = (v) => v * layoutScaleX;
const sy = (v) => v * layoutScaleY;

// =====================
// WORLD / SCORE
// =====================
let groundY;
let speed;
let score = 0;
let startMillis = 0;
let elapsedSec = 0;

let lastScore = 0;
let lastTime = 0;

// =====================
// PLAYER
// =====================
let owl;
let lives = BASE.startLives;
let invulnTimer = 0;

// =====================
// OBJECTS
// =====================
let leaves = [];
let holes = [];
let walls = [];
let platforms = [];
let amicStations = [];
let goats = [];
let pracuTexts = [];

// background
let clouds = [];
let trees = [];

// =====================
// SPAWN CONTROL
// =====================
let hazardGapLeftPx = 0;

// =====================
// MINI-GAME
// =====================
let whale;
let miniStartMillis = 0;
let miniTimeLeft = BASE.miniTimeLimitSec;
let faleWords = [];

// =====================
// SOUND (WebAudio, no p5.sound needed)
// =====================
let audio = {
  ready: false,
  ctx: null,
  master: null,
  waves: { src: null, filter: null, gain: null, playing: false },
  hootCooldown: 0,
  goatCooldown: 0
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  updateLayout(DESIGN_WIDTH, DESIGN_HEIGHT);

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) ensureAudio();
    });
  }

  // default difficulty
  applyDifficulty(selectedDifficultyIndex);

  seedBackground();
  resetRunner(true);
}

function updateLayout(prevWidth = width, prevHeight = height) {
  const scaleX = width / prevWidth;
  const scaleY = height / prevHeight;

  layoutScaleX = width / DESIGN_WIDTH;
  layoutScaleY = height / DESIGN_HEIGHT;

  groundY = height - sy(DESIGN_GROUND_OFFSET);
  hazardGapLeftPx *= scaleX;

  rescaleGameObjects(scaleX, scaleY);
}

function rescaleGameObjects(scaleX, scaleY) {
  if (!isFinite(scaleX) || !isFinite(scaleY)) return;

  const rescaleArray = (arr, keysX, keysY) => {
    if (!arr) return;
    for (const item of arr) {
      for (const k of keysX) item[k] *= scaleX;
      for (const k of keysY) item[k] *= scaleY;
    }
  };

  if (owl) {
    owl.x *= scaleX;
    owl.y *= scaleY;
    owl.r *= scaleY;
    owl.vy *= scaleY;
  }

  rescaleArray(leaves, ["x"], ["y"]);
  rescaleArray(holes, ["x", "w"], []);
  rescaleArray(walls, ["x", "w"], ["y", "h"]);
  rescaleArray(platforms, ["x", "w"], ["y", "h"]);
  rescaleArray(amicStations, ["x", "w"], ["y", "h", "roofH"]);

  rescaleArray(goats, ["x", "vx"], ["y", "vy"]);
  rescaleArray(pracuTexts, ["x", "w"], ["y", "h"]);
  rescaleArray(clouds, ["x"], ["y"]);
  rescaleArray(trees, ["x"], ["y"]);

  if (whale) {
    whale.x *= scaleX;
    whale.y *= scaleY;
    whale.vx *= scaleX;
    whale.vy *= scaleY;
  }

  for (const f of faleWords) {
    f.x *= scaleX;
    f.y *= scaleY;
    f.vx *= scaleX;
    f.vy *= scaleY;
  }
}

function applyDifficulty(idx) {
  selectedDifficultyIndex = constrain(idx, 0, DIFFICULTIES.length - 1);
  const d = DIFFICULTIES[selectedDifficultyIndex];

  // merge BASE + difficulty overrides
  activeCFG = {
    ...BASE,
    ...d
  };

  // Also keep these accessible as globals through activeCFG
}

function resetRunner(keepLast = false) {
  speed = BASE.baseSpeed;
  score = 0;
  elapsedSec = 0;
  startMillis = millis();

  lives = BASE.startLives;
  invulnTimer = 0;

  owl = {
    x: sx(160),
    y: groundY - sy(30),
    r: sy(30),
    vy: 0,
    jumpsLeft: 2,
    wingPhase: 0,
    blink: 0
  };

  leaves = [];
  holes = [];
  walls = [];
  platforms = [];
  amicStations = [];
  goats = [];
  pracuTexts = [];

  if (!keepLast) {
    lastScore = 0;
    lastTime = 0;
  }

  hazardGapLeftPx = random(activeCFG.hazardGapMinPx, activeCFG.hazardGapMaxPx);
  holes.push({ x: -sx(1000), w: sx(10) });
}

function draw() {
  if (state === ST_START) {
    drawStartScreen();
    return;
  }
  if (state === ST_RUNNER) {
    drawRunner();
    return;
  }
  if (state === ST_MINIGAME) {
    drawMiniGame();
    return;
  }
}

// =====================
// INPUT
// =====================
function keyPressed() {
  if (key === '1') applyDifficulty(0);
  if (key === '2') applyDifficulty(1);
  if (key === '3') applyDifficulty(2);

  if (key === ' ') handlePrimaryAction();
  if (key === 'r' || key === 'R') toStartScreen();
}

function mousePressed() {
  if (wasRecentTouch()) return;
  ensureAudio();

  // click on buttons in start screen
  if (state === ST_START) {
    const hit = hitTestDifficultyButtons(mouseX, mouseY);
    if (hit !== -1) {
      applyDifficulty(hit);
      return;
    }

    if (hitTestStartButton(mouseX, mouseY)) {
      handlePrimaryAction();
      return;
    }
  }
  handlePrimaryAction();
}

function windowResized() {
  const prevWidth = width;
  const prevHeight = height;
  resizeCanvas(windowWidth, windowHeight);
  updateLayout(prevWidth, prevHeight);
}

function touchStarted() {
  ensureAudio();

  if (state === ST_START) {
    const hit = hitTestDifficultyButtons(mouseX, mouseY);
    if (hit !== -1) {
      applyDifficulty(hit);
      recordTouchAction();
      return false;
    }

    if (hitTestStartButton(mouseX, mouseY)) {
      recordTouchAction();
      handlePrimaryAction();
      return false;
    }
  }

  if (shouldThrottleTouch()) return false;
  handlePrimaryAction();
  return false;
}

function handlePrimaryAction() {
  ensureAudio();

  if (state === ST_START) {
    resetRunner(true);
    state = ST_RUNNER;
    return;
  }
  if (state === ST_RUNNER) {
    tryJump();
  }
}

function shouldThrottleTouch() {
  const now = millis();
  if (now - lastTouchActionMillis < TOUCH_ACTION_COOLDOWN_MS) return true;
  lastTouchActionMillis = now;
  return false;
}

function recordTouchAction() {
  lastTouchActionMillis = millis();
}

function wasRecentTouch() {
  return millis() - lastTouchActionMillis < TOUCH_ACTION_COOLDOWN_MS;
}

function tryJump() {
  if (owl.jumpsLeft <= 0) return;

  const isDouble = (owl.jumpsLeft === 1);
  owl.vy = (owl.jumpsLeft === 2) ? BASE.jumpPower : BASE.doubleJumpPower;
  owl.jumpsLeft--;
  owl.wingPhase = 0;

  if (isDouble) playHoot();
}

// =====================
// START SCREEN (with difficulty selection)
// =====================
function drawStartScreen() {
  drawSky();
  drawParallaxBackground(0.5);
  drawGroundAndHills(0);

  // card
  push();
  textAlign(CENTER, CENTER);
  fill(0, 0, 0, 70);
  rect(width / 2 - 270, height / 2 - 165, 540, 330, 18);

  fill(255);
  textSize(46);
  textStyle(BOLD);
  text("Dla sufki", width / 2, height / 2 - 120);

  textStyle(NORMAL);
  textSize(15);
  fill(255, 235);
  text("Wybierz poziom trudności (1 / 2 / 3 albo klik):", width / 2, height / 2 - 78);
  pop();

  drawDifficultyButtons();
  drawStartButton();

  // instructions
  push();
  textAlign(CENTER, CENTER);
  fill(255, 240);
  textSize(17);
  text("Spacja / Start / tap — start lub skok    |    Podwójny skok: 2x", width / 2, height / 2 + 160);

  fill(255, 210);
  textSize(14);
  text("Zbieraj liście • Unikaj przeszkód • Koza = mini-gra (+życie / bonus)", width / 2, height / 2 + 186);

  fill(255, 180);
  textSize(13);
  text("Jeśli dźwięk jest wstrzymany przez przeglądarkę, pierwszy tap go włączy.", width / 2, height / 2 + 138);

  if (lastTime > 0) {
    fill(255, 230);
    textSize(16);
    text(`Ostatni wynik: ${floor(lastScore)} pkt  •  Czas: ${formatTime(lastTime)}`, width / 2, height / 2 + 214);
  }
  pop();

  // mascot
  push();
  translate(width / 2, groundY - sy(18));
  drawCuteOwl(0, 0, 1.25, 0.10, true);
  pop();
}

function drawDifficultyButtons() {
  for (let i = 0; i < DIFFICULTIES.length; i++) {
    const { x, y, w, h } = getDifficultyButtonRect(i);
    const isSel = i === selectedDifficultyIndex;

    push();
    noStroke();
    fill(isSel ? color(255, 255, 255, 230) : color(255, 255, 255, 140));
    rect(x, y, w, h, 16);

    fill(0, isSel ? 210 : 170);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(18);
    text(`${i + 1}. ${DIFFICULTIES[i].name}`, x + w / 2, y + 24);

    textStyle(NORMAL);
    textSize(12);
    fill(0, isSel ? 180 : 140);
    text(DIFFICULTIES[i].desc, x + w / 2, y + h - 22);
    pop();
  }
}

function hitTestDifficultyButtons(mx, my) {
  for (let i = 0; i < DIFFICULTIES.length; i++) {
    const { x, y, w, h } = getDifficultyButtonRect(i, 12);
    if (mx >= x && mx <= x + w && my >= y && my <= y + h) return i;
  }
  return -1;
}

function getDifficultyButtonRect(idx, extraPadding = 0) {
  const cx = width / 2;
  const y = height / 2 - 20;
  const w = DIFFICULTY_UI.width + extraPadding * 2;
  const h = DIFFICULTY_UI.height + extraPadding * 2;
  const gap = DIFFICULTY_UI.gap;

  const baseX = cx - (DIFFICULTY_UI.width * 1.5 + gap) + idx * (DIFFICULTY_UI.width + gap);
  const x = baseX - extraPadding;

  return { x, y: y - extraPadding, w, h };
}

function drawStartButton() {
  const { x, y, w, h } = getStartButtonRect();

  push();
  noStroke();
  fill(0, 0, 0, 60);
  rect(x - 6, y + 6, w + 12, h + 12, 18);

  fill(color(255, 234, 167, 235));
  rect(x, y, w, h, 18);

  fill(60, 40, 0);
  textAlign(CENTER, CENTER);
  textSize(24);
  textStyle(BOLD);
  text("Start / Skok", x + w / 2, y + h / 2 - 6);

  textStyle(NORMAL);
  textSize(13);
  text("Spacja lub tapnięcie", x + w / 2, y + h / 2 + 18);
  pop();
}

function getStartButtonRect() {
  const w = START_BUTTON_UI.width;
  const h = START_BUTTON_UI.height;
  const x = width / 2 - w / 2;
  const y = height / 2 + START_BUTTON_UI.yOffset;
  return { x, y, w, h };
}

function hitTestStartButton(mx, my) {
  const { x, y, w, h } = getStartButtonRect();
  return mx >= x && mx <= x + w && my >= y && my <= y + h;
}

// =====================
// RUNNER
// =====================
function drawRunner() {
  const dt = deltaTime / 1000;
  tickAudio(dt);

  elapsedSec = (millis() - startMillis) / 1000;
  speed = min(activeCFG.maxSpeed, BASE.baseSpeed + elapsedSec * activeCFG.speedRampPerSec);

  drawSky();
  drawParallaxBackground(speed);
  drawGroundAndHills(speed);

  spawnLogic();

  updatePlatforms();
  updateHoles();
  updateWalls();
  updateAmic();
  updatePracuTexts();
  updateGoats();
  updateLeaves();

  updateOwl(dt);
  drawPlayer();

  drawHUD();

  score += 0.09;

  if (goatsOnScreen()) playGoat();
}

// =====================
// SPAWN LOGIC
// =====================
function spawnLogic() {
  // leaves
  if (random() < BASE.spawnLeafChance) {
    leaves.push({
      x: width + sx(40),
      y: random(groundY - sy(190), groundY - sy(70)),
      kind: random() < 0.55 ? "monstera" : "alocasia",
      spin: random(TWO_PI),
      bob: random(TWO_PI)
    });
  }

  // goat
  if (random() < BASE.spawnGoatChance) {
    goats.push(newGoat(width + sx(80)));
  }

  // platform (difficulty controlled)
  if (random() < activeCFG.platformChance) {
    const py = random(groundY - sy(205), groundY - sy(125));
    platforms.push({ x: width + sx(200), y: py, w: random(sx(160), sx(240)), h: sy(18) });
  }

  // hazard gap in px
  hazardGapLeftPx -= speed;
  if (hazardGapLeftPx > 0) return;

  const type = pickHazardType();
  let hazardWidth = sx(80);
  if (type === "hole") {
    const w = random(sx(48), sx(90));
    holes.push({ x: width + sx(60), w });
    hazardWidth = w;
  } else if (type === "wall") {
    const h = random(sy(50), sy(78));
    walls.push({ x: width + sx(60), y: groundY - h, w: sx(38), h });
    hazardWidth = sx(38);
  } else if (type === "pracu") {
    const y = random(groundY - sy(220), groundY - sy(120));
    pracuTexts.push(newPracu(width + sx(140), y));
    hazardWidth = sx(190);
  } else if (type === "amic") {
    amicStations.push({ x: width + sx(60), y: groundY - sy(70), w: sx(112), h: sy(70), roofH: sy(14) });
    hazardWidth = sx(112);
  }

  const jumpStats = computeJumpStats(speed);
  const baseGap = random(activeCFG.hazardGapMinPx, activeCFG.hazardGapMaxPx);
  const recoveryGap = max(0, jumpStats.airDistance * 0.55 - hazardWidth * 0.35);
  hazardGapLeftPx = max(baseGap, recoveryGap);
}

function pickHazardType() {
  const w = BASE.hazardWeights;
  const total = w.hole + w.wall + w.pracu + w.amic;
  let r = random(total);
  if ((r -= w.hole) < 0) return "hole";
  if ((r -= w.wall) < 0) return "wall";
  if ((r -= w.pracu) < 0) return "pracu";
  return "amic";
}

function computeJumpStats(runSpeed) {
  let y = 0;
  let vy = BASE.jumpPower;
  let minY = 0;
  let distance = 0;
  let frames = 0;
  let doubleUsed = false;

  while (frames < 240) {
    y += vy;
    vy += BASE.gravity;
    distance += runSpeed;
    frames++;

    if (!doubleUsed && vy >= 0) {
      vy = BASE.doubleJumpPower;
      doubleUsed = true;
    }

    minY = min(minY, y);

    if (doubleUsed && y >= 0 && vy >= 0) break;
  }

  return { maxHeight: -minY, airDistance: distance, frames };
}

// =====================
// OWL PHYSICS + DAMAGE
// =====================
function updateOwl(dt) {
  if (invulnTimer > 0) invulnTimer = max(0, invulnTimer - dt);

  owl.vy += BASE.gravity;
  owl.y += owl.vy;

  // platforms landing
  let landed = false;
  for (const p of platforms) {
    const top = p.y;
    const left = p.x;
    const right = p.x + p.w;

    const wasAbove = (owl.y - owl.vy) <= top - owl.r;
    const withinX = owl.x + owl.r > left && owl.x - owl.r < right;
    const falling = owl.vy >= 0;

    if (withinX && falling && wasAbove && owl.y + owl.r >= top) {
      owl.y = top - owl.r;
      owl.vy = 0;
      landed = true;
    }
  }

  // AMIC roof landing
  for (const a of amicStations) {
    const roofTop = a.y;
    const roofMargin = a.roofH || sy(14);
    const left = a.x - sx(6);
    const right = a.x + a.w + sx(6);

    const wasAbove = (owl.y - owl.vy) <= roofTop - owl.r;
    const withinX = owl.x + owl.r > left && owl.x - owl.r < right;
    const falling = owl.vy >= 0;

    if (withinX && falling && wasAbove && owl.y + owl.r >= roofTop - 1) {
      owl.y = roofTop - owl.r;
      owl.vy = 0;
      landed = true;
    }

    // If we skim the roof edge slightly below the top, allow a gentle snap upwards.
    const isNearRoof = owl.y + owl.r > roofTop && owl.y + owl.r < roofTop + roofMargin;
    if (withinX && falling && isNearRoof && wasAbove) {
      owl.y = roofTop - owl.r;
      owl.vy = 0;
      landed = true;
    }
  }

  // ground & holes
  const inHole = isOverHole(owl.x);
  if (!inHole) {
    if (owl.y > groundY - owl.r) {
      owl.y = groundY - owl.r;
      owl.vy = 0;
      landed = true;
    }
  } else {
    if (owl.y > groundY + sy(35)) {
      takeHit();
      owl.y = groundY - owl.r;
      owl.vy = 0;
      landed = true;
    }
  }

  if (landed) owl.jumpsLeft = 2;

  if (invulnTimer <= 0) {
    if (collideWithWalls() || collideWithAmic() || collideWithPracu()) {
      takeHit();
    }
  }

  owl.blink -= 1;
  if (owl.blink < -220) owl.blink = random(35, 90);
}

function takeHit() {
  if (invulnTimer > 0) return;
  lives -= 1;
  invulnTimer = BASE.invulnSec;

  if (lives <= 0) {
    lastScore = score;
    lastTime = elapsedSec;
    toStartScreen();
  }
}

function toStartScreen() {
  stopWaves();
  state = ST_START;
}

// =====================
// COLLISIONS
// =====================
function isOverHole(x) {
  for (const h of holes) if (x > h.x && x < h.x + h.w) return true;
  return false;
}

function collideCircleRect(cx, cy, cr, rx, ry, rw, rh) {
  const nx = constrain(cx, rx, rx + rw);
  const ny = constrain(cy, ry, ry + rh);
  const dx = cx - nx;
  const dy = cy - ny;
  return (dx * dx + dy * dy) <= cr * cr;
}

function collideWithWalls() {
  for (const w of walls) if (collideCircleRect(owl.x, owl.y, owl.r, w.x, w.y, w.w, w.h)) return true;
  return false;
}
function collideWithAmic() {
  for (const a of amicStations) {
    const roofMargin = (a.roofH || sy(14));
    const onRoof = owl.y + owl.r <= a.y + roofMargin;
    if (onRoof) continue;
    if (collideCircleRect(owl.x, owl.y, owl.r, a.x, a.y, a.w, a.h)) return true;
  }
  return false;
}
function collideWithPracu() {
  for (const t of pracuTexts) if (collideCircleRect(owl.x, owl.y, owl.r, t.x - t.w / 2, t.y - t.h / 2, t.w, t.h)) return true;
  return false;
}

// =====================
// DRAW PLAYER
// =====================
function drawPlayer() {
  const inAir = (owl.y < groundY - owl.r - 1) && (abs(owl.vy) > 0.01);
  if (inAir) owl.wingPhase += 0.30;
  else owl.wingPhase *= 0.9;

  const flap = inAir ? sin(owl.wingPhase) : 0;

  if (invulnTimer > 0) {
    const visible = (frameCount % 8) < 4;
    if (!visible) return;
  }

  push();
  translate(owl.x, owl.y);
  drawCuteOwl(0, 0, 1.0, flap, false);
  pop();
}

function drawCuteOwl(x, y, s, flap, mascotMode) {
  push();
  translate(x, y);
  scale(s);

  noStroke();
  fill(0, 0, 0, 45);
  ellipse(0, owl.r + 28, 60, 14);

  const wingAngle = (mascotMode ? 0.10 : 0.0) + flap * 0.62;

  push();
  rotate(-wingAngle);
  fill(150, 105, 72);
  ellipse(-34, -2, 36, 54);
  fill(170, 125, 92, 140);
  ellipse(-34, 2, 22, 34);
  pop();

  push();
  rotate(wingAngle);
  fill(150, 105, 72);
  ellipse(34, -2, 36, 54);
  fill(170, 125, 92, 140);
  ellipse(34, 2, 22, 34);
  pop();

  fill(175, 125, 90);
  ellipse(0, 0, 74, 82);

  fill(240, 226, 205);
  ellipse(0, 12, 48, 54);

  fill(220, 205, 185);
  ellipse(-19, -10, 32, 32);
  ellipse(19, -10, 32, 32);

  const blinking = (owl.blink > 0 && !mascotMode);
  if (!blinking) {
    fill(255);
    ellipse(-18, -12, 19, 19);
    ellipse(18, -12, 19, 19);
    fill(30);
    ellipse(-18, -12, 7, 7);
    ellipse(18, -12, 7, 7);
    fill(255, 255, 255, 180);
    ellipse(-20, -15, 4, 4);
    ellipse(16, -15, 4, 4);
  } else {
    stroke(70, 45, 35);
    strokeWeight(3);
    noFill();
    arc(-18, -12, 18, 12, 0, PI);
    arc(18, -12, 18, 12, 0, PI);
    noStroke();
  }

  noStroke();
  fill(248, 198, 70);
  triangle(0, -2, -8, 9, 8, 9);

  fill(255, 160, 170, 80);
  ellipse(-28, 4, 11, 8);
  ellipse(28, 4, 11, 8);

  pop();
}

// =====================
// LEAVES
// =====================
function updateLeaves() {
  for (let i = leaves.length - 1; i >= 0; i--) {
    const l = leaves[i];
    l.x -= speed;
    l.spin += 0.03;
    const bob = sin((frameCount * 0.06) + l.bob) * 7;

    drawLeafPickup(l.x, l.y + bob, l.kind, l.spin);

    if (dist(owl.x, owl.y, l.x, l.y + bob) < 46) {
      score += (l.kind === "monstera") ? 14 : 18;
      leaves.splice(i, 1);
      continue;
    }
    if (l.x < -110) leaves.splice(i, 1);
  }
}

function drawLeafPickup(x, y, kind, rot) {
  push();
  translate(x, y);
  rotate(rot * 0.15);
  noStroke();
  fill(255, 255, 255, 35);
  ellipse(0, 0, 66, 48);
  if (kind === "monstera") drawMonsteraLeaf();
  else drawAlocasiaLeaf();
  pop();
}

function drawMonsteraLeaf() {
  noStroke();
  fill(50, 165, 95);
  beginShape();
  vertex(0, -34);
  bezierVertex(28, -38, 44, -12, 32, 10);
  bezierVertex(24, 30, 12, 40, 0, 46);
  bezierVertex(-12, 40, -24, 30, -32, 10);
  bezierVertex(-44, -12, -28, -38, 0, -34);
  endShape(CLOSE);

  fill(78, 195, 120, 190);
  beginShape();
  vertex(0, -30);
  bezierVertex(22, -32, 34, -10, 26, 10);
  bezierVertex(20, 26, 10, 36, 0, 40);
  bezierVertex(-10, 36, -20, 26, -26, 10);
  bezierVertex(-34, -10, -22, -32, 0, -30);
  endShape(CLOSE);

  fill(0, 0, 0, 35);
  ellipse(-12, -2, 20, 13);
  ellipse(12, -2, 20, 13);
  ellipse(0, 14, 22, 13);

  fill(180, 220, 255, 245);
  ellipse(-12, -2, 15, 10);
  ellipse(12, -2, 15, 10);
  ellipse(0, 14, 17, 10);

  stroke(30, 120, 70, 170);
  strokeWeight(3);
  line(0, -30, 0, 42);
  strokeWeight(2);
  line(0, -18, -18, -10);
  line(0, -18, 18, -10);
  line(0, -2, -22, 8);
  line(0, -2, 22, 8);
  line(0, 12, -18, 24);
  line(0, 12, 18, 24);
  noStroke();

  stroke(30, 120, 70, 220);
  strokeWeight(4);
  line(0, 42, 0, 60);
  noStroke();
}

function drawAlocasiaLeaf() {
  noStroke();
  fill(45, 175, 125);
  beginShape();
  vertex(0, -46);
  bezierVertex(24, -36, 34, -10, 20, 8);
  bezierVertex(14, 20, 12, 32, 0, 48);
  bezierVertex(-12, 32, -14, 20, -20, 8);
  bezierVertex(-34, -10, -24, -36, 0, -46);
  endShape(CLOSE);

  stroke(235, 255, 245, 210);
  strokeWeight(2.6);
  line(0, -42, 0, 46);
  strokeWeight(2);
  line(0, -24, -18, -10);
  line(0, -24, 18, -10);
  line(0, -6, -22, 8);
  line(0, -6, 22, 8);
  line(0, 12, -18, 28);
  line(0, 12, 18, 28);
  noStroke();

  noFill();
  stroke(25, 95, 70, 130);
  strokeWeight(1.8);
  beginShape();
  vertex(0, -46);
  bezierVertex(24, -36, 34, -10, 20, 8);
  bezierVertex(14, 20, 12, 32, 0, 48);
  bezierVertex(-12, 32, -14, 20, -20, 8);
  bezierVertex(-34, -10, -24, -36, 0, -46);
  endShape(CLOSE);
  noStroke();

  stroke(235, 255, 245, 190);
  strokeWeight(3.8);
  line(0, 48, 0, 66);
  noStroke();
}

// =====================
// HOLES / WALLS / PLATFORMS / AMIC / PRACU
// =====================
function updateHoles() {
  for (let i = holes.length - 1; i >= 0; i--) {
    holes[i].x -= speed;
    if (holes[i].x < -420) holes.splice(i, 1);
  }
  for (const h of holes) {
    noStroke();
    fill(18, 26, 38, 230);
    rect(h.x, groundY, h.w, height - groundY);
    fill(0, 0, 0, 60);
    rect(h.x, groundY, h.w, 8);
  }
}

function updateWalls() {
  for (let i = walls.length - 1; i >= 0; i--) {
    walls[i].x -= speed;
    if (walls[i].x < -320) walls.splice(i, 1);
  }
  for (const w of walls) {
    noStroke();
    fill(75, 75, 105, 240);
    rect(w.x, w.y, w.w, w.h, 10);
    fill(255, 255, 255, 35);
    rect(w.x + 6, w.y + 12, w.w - 12, 6, 6);
  }
}

function updatePlatforms() {
  for (let i = platforms.length - 1; i >= 0; i--) {
    platforms[i].x -= speed;
    if (platforms[i].x < -460) platforms.splice(i, 1);
  }
  for (const p of platforms) {
    noStroke();
    fill(90, 125, 155, 220);
    rect(p.x, p.y, p.w, p.h, 10);
    fill(255, 255, 255, 40);
    rect(p.x + 10, p.y + 4, p.w - 20, 4, 6);
  }
}

function updateAmic() {
  for (let i = amicStations.length - 1; i >= 0; i--) {
    amicStations[i].x -= speed;
    if (amicStations[i].x < -340) amicStations.splice(i, 1);
  }
  for (const a of amicStations) {
    push();
    translate(a.x, a.y);
    noStroke();
    const roofH = a.roofH || sy(14);
    fill(240, 85, 95);
    rect(-sx(10), -roofH, a.w + sx(20), roofH + sy(6), 12);
    fill(255, 255, 255, 120);
    rect(-sx(6), -roofH + sy(4), a.w + sx(12), sy(5), 8);
    fill(250);
    rect(0, 0, a.w, a.h, 10);
    fill(230, 60, 70);
    rect(-6, -14, a.w + 12, 18, 8);
    fill(255);
    rect(14, 14, a.w - 28, 26, 6);
    fill(20);
    textSize(16);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Amic", a.w / 2, 27);
    fill(200);
    rect(12, a.h - 26, 18, 22, 4);
    rect(a.w - 30, a.h - 26, 18, 22, 4);
    pop();
  }
}

function newPracu(x, y) {
  return { x, y, text: "Pracu Pracu!", w: sx(190), h: sy(40), wob: random(TWO_PI) };
}

function updatePracuTexts() {
  for (let i = pracuTexts.length - 1; i >= 0; i--) {
    const t = pracuTexts[i];
    t.x -= speed + 1.2;
    t.wob += 0.07;
    t.y += sin(t.wob) * 0.35;
    drawPracu(t);
    if (t.x < -280) pracuTexts.splice(i, 1);
  }
}

function drawPracu(t) {
  push();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(26);
  fill(255, 210, 70, 240);
  stroke(120, 80, 20, 180);
  strokeWeight(3);
  text(t.text, t.x, t.y);
  noStroke();
  fill(255, 255, 255, 90);
  textSize(12);
  text("✦", t.x + 76, t.y - 16);
  pop();
}

// =====================
// GOATS
// =====================
function newGoat(x) {
  return { x, y: groundY - sy(6), vx: random(-1.2, 2.0), vy: random(-12, -9), bob: random(TWO_PI) };
}

function updateGoats() {
  for (let i = goats.length - 1; i >= 0; i--) {
    const g = goats[i];
    g.x -= speed;
    g.x += g.vx;

    g.vy += 0.72;
    g.y += g.vy;

    if (g.y > groundY - sy(6)) {
      g.y = groundY - sy(6);
      g.vy = random(-12, -9);
      if (random() < 0.35) g.vx *= -1;
      g.vx = constrain(g.vx + random(-0.35, 0.35), -2.2, 2.2);
    }

    drawCuteGoat(g.x, g.y);

    if (dist(owl.x, owl.y, g.x, g.y) < 56) {
      goats.splice(i, 1);
      startMiniGame();
      continue;
    }
    if (g.x < -240) goats.splice(i, 1);
  }
}

function goatsOnScreen() {
  for (const g of goats) if (g.x > -200 && g.x < width + 200) return true;
  return false;
}

function drawCuteGoat(x, y) {
  push();
  translate(x, y);
  const hop = sin(frameCount * 0.25) * 2;

  noStroke();
  fill(0, 0, 0, 40);
  ellipse(0, 24, 56, 12);

  fill(255);
  rect(-24, -28 + hop, 48, 34, 12);
  fill(255, 255, 255, 120);
  ellipse(-10, -16 + hop, 16, 14);
  ellipse(6, -18 + hop, 14, 12);

  fill(252);
  rect(18, -34 + hop, 24, 24, 10);

  stroke(180);
  strokeWeight(3);
  line(27, -36 + hop, 22, -48 + hop);
  line(36, -36 + hop, 41, -48 + hop);
  noStroke();

  fill(25);
  ellipse(26, -24 + hop, 4, 4);
  ellipse(36, -24 + hop, 4, 4);

  fill(255, 160, 170, 90);
  ellipse(24, -18 + hop, 7, 5);
  ellipse(38, -18 + hop, 7, 5);

  fill(90);
  rect(-16, 6 + hop, 7, 18, 3);
  rect(-2, 6 + hop, 7, 18, 3);
  rect(12, 6 + hop, 7, 18, 3);

  pop();
}

// =====================
// MINI-GAME (FALE + whales + lives/bonus)
// =====================
function startMiniGame() {
  state = ST_MINIGAME;

  whale = { x: width / 2, y: height / 2, vx: random(-3.8, 3.8), vy: random(-3.0, 3.0), wob: random(TWO_PI) };
  miniStartMillis = millis();
  miniTimeLeft = BASE.miniTimeLimitSec;

  faleWords = [];
  for (let i = 0; i < 6; i++) {
    faleWords.push({
      x: random(80, width - 80),
      y: random(80, height - 80),
      vx: random(-2.8, 2.8),
      vy: random(-2.0, 2.0),
      s: random(18, 28)
    });
  }

  startWaves();
}

function drawMiniGame() {
  background(35, 115, 200);

  const t = (millis() - miniStartMillis) / 1000;
  miniTimeLeft = max(0, BASE.miniTimeLimitSec - t);

  for (const f of faleWords) {
    f.x += f.vx;
    f.y += f.vy;
    if (f.x < 40 || f.x > width - 40) f.vx *= -1;
    if (f.y < 40 || f.y > height - 40) f.vy *= -1;

    push();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(f.s);
    fill(90, 190, 255, 180);
    text("FALE", f.x, f.y);
    pop();
  }

  whale.wob += 0.08;
  whale.x += whale.vx + sin(whale.wob) * 0.6;
  whale.y += whale.vy + cos(whale.wob * 0.9) * 0.5;
  if (whale.x < 60 || whale.x > width - 60) whale.vx *= -1;
  if (whale.y < 60 || whale.y > height - 60) whale.vy *= -1;

  drawCuteWhale(whale.x, whale.y);

  if (dist(mouseX, mouseY, whale.x, whale.y) < 44) {
    score += BASE.whalePoints;

    if (lives < BASE.maxLives) lives += 1;
    else score += BASE.whaleExtraLifeBonusPoints;

    stopWaves();
    state = ST_RUNNER;
    return;
  }

  if (miniTimeLeft <= 0) {
    stopWaves();
    state = ST_RUNNER;
    return;
  }

  push();
  fill(255);
  textStyle(BOLD);
  textSize(18);
  textAlign(LEFT, TOP);
  text("ZŁAP HUMBAKA!", 18, 16);
  textStyle(NORMAL);
  textSize(16);
  text(`Czas: ${miniTimeLeft.toFixed(1)} s`, 18, 44);
  fill(255, 230);
  textSize(14);
  text("Najedź kursorem / palcem na humbaka", 18, 68);
  pop();
}

function drawCuteWhale(x, y) {
  push();
  translate(x, y);

  noStroke();
  fill(0, 0, 0, 30);
  ellipse(0, 34, 96, 16);

  fill(125, 205, 238);
  ellipse(0, 0, 102, 56);

  fill(115, 195, 228);
  triangle(48, 0, 78, -20, 78, 20);

  fill(205, 248, 255, 210);
  ellipse(-8, 12, 68, 30);

  fill(30);
  ellipse(-26, -6, 7, 7);
  fill(255, 255, 255, 210);
  ellipse(-27, -7, 2.5, 2.5);

  noFill();
  stroke(30, 85);
  strokeWeight(3);
  arc(-18, 4, 28, 18, 0, PI);
  noStroke();

  fill(200, 245, 255, 180);
  ellipse(10, -30, 10, 16);
  ellipse(22, -34, 8, 12);

  pop();
}

// =====================
// HUD
// =====================
function drawHUD() {
  push();
  fill(0, 140);
  rect(12, 12, 340, 78, 12);

  fill(255);
  textAlign(LEFT, TOP);

  textStyle(BOLD);
  textSize(16);
  text(`Punkty: ${floor(score)}`, 22, 18);
  text(`Życia: ${lives}/${BASE.maxLives}`, 200, 18);

  textStyle(NORMAL);
  textSize(14);
  text(`Czas: ${formatTime(elapsedSec)}`, 22, 44);
  text(`Skoki: ${owl.jumpsLeft}/2`, 200, 44);

  if (invulnTimer > 0) {
    fill(255, 220);
    textSize(12);
    text(`Nietykalność: ${invulnTimer.toFixed(1)}s`, 22, 64);
  }

  pop();
}

function formatTime(sec) {
  const s = floor(sec);
  const m = floor(s / 60);
  const r = s % 60;
  return `${m}:${nf(r, 2)}`;
}

// =====================
// AUDIO (WebAudio)
// =====================
function ensureAudio() {
  if (audio.ctx && audio.ctx.state === "suspended") {
    audio.ctx.resume();
  }

  if (audio.ready) return;
  audio.ready = true;

  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    audio.ctx = new AC();
    audio.master = audio.ctx.createGain();
    audio.master.gain.value = 0.35;
    audio.master.connect(audio.ctx.destination);

    audio.waves.filter = audio.ctx.createBiquadFilter();
    audio.waves.filter.type = "lowpass";
    audio.waves.filter.frequency.value = 700;
    audio.waves.filter.Q.value = 0.7;

    audio.waves.gain = audio.ctx.createGain();
    audio.waves.gain.gain.value = 0.0;

    audio.waves.filter.connect(audio.waves.gain);
    audio.waves.gain.connect(audio.master);

    if (audio.ctx.state === "suspended") audio.ctx.resume();
  } catch (e) {}
}

function tickAudio(dt) {
  audio.hootCooldown = max(0, audio.hootCooldown - dt);
  audio.goatCooldown = max(0, audio.goatCooldown - dt);
}

function playHoot() {
  if (!audio.ctx || !audio.master) return;
  if (audio.hootCooldown > 0) return;
  audio.hootCooldown = 0.15;

  try {
    const ctx = audio.ctx;

    hootTone(320, 0.14);
    setTimeout(() => hootTone(260, 0.18), 120);

    function hootTone(freq, dur) {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;

      const t0 = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.14, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(g);
      g.connect(audio.master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    }
  } catch (e) {}
}

function playGoat() {
  if (!audio.ctx || !audio.master) return;
  if (audio.goatCooldown > 0) return;
  if (!goatsOnScreen()) return;

  audio.goatCooldown = random(1.8, 3.0);

  try {
    const ctx = audio.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = "square";
    osc.frequency.value = 520;

    const t0 = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.08, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);

    osc.frequency.setValueAtTime(520, t0);
    osc.frequency.linearRampToValueAtTime(430, t0 + 0.10);

    osc.connect(g);
    g.connect(audio.master);
    osc.start(t0);
    osc.stop(t0 + 0.22);
  } catch (e) {}
}

function startWaves() {
  if (!audio.ctx || !audio.waves.filter || !audio.waves.gain) return;
  if (audio.waves.playing) {
    fadeWavesTo(0.11, 0.4);
    return;
  }

  try {
    const ctx = audio.ctx;
    const dur = 1.0;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    src.connect(audio.waves.filter);
    src.start();

    audio.waves.src = src;
    audio.waves.playing = true;

    fadeWavesTo(0.11, 0.5);
  } catch (e) {}
}

function stopWaves() {
  if (!audio.ctx || !audio.waves.gain) return;
  fadeWavesTo(0.0, 0.35);

  setTimeout(() => {
    try {
      if (audio.waves.src) {
        audio.waves.src.stop();
        audio.waves.src.disconnect();
      }
    } catch (e) {}
    audio.waves.src = null;
    audio.waves.playing = false;
  }, 420);
}

function fadeWavesTo(target, sec) {
  try {
    const ctx = audio.ctx;
    const g = audio.waves.gain.gain;
    const t0 = ctx.currentTime;
    g.cancelScheduledValues(t0);
    g.setValueAtTime(g.value, t0);
    g.linearRampToValueAtTime(target, t0 + sec);
  } catch (e) {}
}

// =====================
// BACKGROUND
// =====================
function seedBackground() {
  clouds = [];
  trees = [];

  for (let i = 0; i < 8; i++) {
    clouds.push({ x: random(width), y: random(sy(40), sy(180)), s: random(0.7, 1.3), sp: random(0.2, 0.6) });
  }
  for (let i = 0; i < 10; i++) {
    trees.push({ x: random(width), y: groundY + sy(28), s: random(0.8, 1.3), sp: random(0.4, 0.9) });
  }
}

function drawSky() {
  noStroke();
  for (let y = 0; y < height; y += 2) {
    const t = y / height;
    fill(180 - 30 * t, 220 - 40 * t, 255 - 15 * t);
    rect(0, y, width, 2);
  }
}

function drawParallaxBackground(spd) {
  for (const c of clouds) {
    c.x -= (spd * 0.35) * c.sp;
    if (c.x < -150) c.x = width + 150;
    push();
    translate(c.x, c.y);
    scale(c.s);
    noStroke();
    fill(255, 255, 255, 220);
    ellipse(0, 0, 92, 48);
    ellipse(-34, 6, 62, 36);
    ellipse(34, 8, 64, 34);
    pop();
  }

  for (const t of trees) {
    t.x -= (spd * 0.85) * t.sp;
    if (t.x < -90) t.x = width + 90;
    push();
    translate(t.x, t.y);
    scale(t.s);
    noStroke();
    fill(110, 80, 55);
    rect(-6, -46, 12, 46, 4);
    fill(60, 160, 95);
    ellipse(0, -60, 56, 56);
    ellipse(-18, -52, 44, 44);
    ellipse(18, -52, 44, 44);
    pop();
  }
}

function drawGroundAndHills(spd) {
  noStroke();
  fill(120, 200, 150, 130);
  for (let i = 0; i < 7; i++) {
    const spacing = sx(180);
    const hx = (i * spacing) - ((frameCount * (spd * 0.35)) % spacing);
    ellipse(hx, groundY + sy(10), sx(240), sy(120));
  }
  fill(80, 185, 110);
  rect(0, groundY, width, height - groundY);
  fill(0, 0, 0, 25);
  rect(0, groundY + sy(24), width, sy(44));
}
