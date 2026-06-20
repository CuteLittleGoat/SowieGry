// Dodatkowe przeszkody zależne od planszy Sowa3.
// Supermarket: palety z towarem.
// Wystawa kwiatów: ludzie.
// Blokowisko PRL: dziki.

const sowa3StageObstacles = [];
let sowa3StageObstacleTimer = 1400;

const originalSowa3StartForStageObstacles = startGame;
const originalSowa3NextForStageObstacles = nextStage;
const originalSowa3UpdateForStageObstacles = update;
const originalSowa3DrawObjectsForStageObstacles = drawObjects;

startGame = function patchedSowa3StartWithStageObstacles() {
  sowa3StageObstacles.length = 0;
  sowa3StageObstacleTimer = 1400;
  originalSowa3StartForStageObstacles();
};

nextStage = function patchedSowa3NextWithStageObstacles() {
  sowa3StageObstacles.length = 0;
  sowa3StageObstacleTimer = 1300;
  originalSowa3NextForStageObstacles();
};

update = function patchedSowa3UpdateWithStageObstacles(dt) {
  originalSowa3UpdateForStageObstacles(dt);
  updateSowa3StageObstacles(dt);
};

drawObjects = function patchedSowa3DrawObjectsWithStageObstacles() {
  originalSowa3DrawObjectsForStageObstacles();
  [...sowa3StageObstacles].sort((a, b) => b.z - a.z).forEach((o) => {
    const x = laneX(o.lane, o.z);
    const y = roadY(o.z);
    const sc = scaleAt(o.z);
    if (o.type === "pallet") drawSowa3Pallet(x, y, sc, o.phase);
    if (o.type === "person") drawSowa3ExpoPersonObstacle(x, y, sc, o.phase, o.variant);
    if (o.type === "boar") drawSowa3Boar(x, y, sc, o.phase);
  });
};

function updateSowa3StageObstacles(dt) {
  if (state.mode !== "run") return;

  sowa3StageObstacleTimer -= dt;
  if (sowa3StageObstacleTimer <= 0) {
    if (state.stage === 0) spawnSowa3StageObstacle("pallet");
    if (state.stage === 1) spawnSowa3StageObstacle("person");
    if (state.stage === 2) spawnSowa3StageObstacle("boar");

    const difficulty = state.difficultyKey || "arcade";
    const difficultyMult = difficulty === "chill" ? 1.18 : difficulty === "chaos" ? 0.82 : 1;
    const stageMult = state.stage === 1 ? 0.86 : state.stage === 2 ? 0.92 : 1;
    sowa3StageObstacleTimer = rand(2100, 3600) * difficultyMult * stageMult;
  }

  for (let i = sowa3StageObstacles.length - 1; i >= 0; i -= 1) {
    const o = sowa3StageObstacles[i];
    o.z -= state.speed * dt * .001;
    o.phase += dt * 0.006;

    if (o.z < .12 && !o.hit) {
      const sameLane = Math.round(state.lane) === o.lane;
      if (sameLane) {
        o.hit = true;
        damage(labelForSowa3StageObstacle(o.type));
      }
    }

    if (o.z < -.08 || o.hit) sowa3StageObstacles.splice(i, 1);
  }
}

function labelForSowa3StageObstacle(type) {
  if (type === "pallet") return "Paleta z towarem!";
  if (type === "person") return "Tłum na wystawie kwiatów!";
  if (type === "boar") return "Dzik na osiedlu!";
  return "Przeszkoda!";
}

function spawnSowa3StageObstacle(type) {
  const lane = [-1, 0, 1][Math.floor(rand(0, 3))];
  sowa3StageObstacles.push({
    type,
    lane,
    z: 1.08,
    hit: false,
    phase: rand(0, Math.PI * 2),
    variant: Math.floor(rand(0, 5)),
  });
}

function drawSowa3Pallet(x, y, sc, phase) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);

  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.beginPath();
  ctx.ellipse(0, 48, 74, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#8a4f2a";
  round(-46, 24, 92, 18, 4, true);
  ctx.fillStyle = "#5c351f";
  ctx.fillRect(-41, 35, 18, 10);
  ctx.fillRect(-8, 35, 18, 10);
  ctx.fillRect(25, 35, 18, 10);

  const colors = ["#ffd43a", "#f05a28", "#5fbf58", "#f4f4f4", "#d63b3b"];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4 - Math.floor(row / 2); col += 1) {
      const bx = -42 + col * 28 + row * 5;
      const by = 8 - row * 23 + Math.sin(phase + row + col) * 1.2;
      ctx.fillStyle = colors[(row + col) % colors.length];
      round(bx, by, 25, 21, 4, true);
      ctx.fillStyle = "rgba(255,255,255,.42)";
      ctx.fillRect(bx + 5, by + 5, 15, 5);
    }
  }

  ctx.fillStyle = "#ff6a28";
  round(-34, -74, 68, 28, 5, true);
  ctx.fillStyle = "#1e1b22";
  ctx.font = "900 12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PALETA", 0, -60);
  ctx.restore();
}

function drawSowa3ExpoPersonObstacle(x, y, sc, phase, variant = 0) {
  ctx.save();
  ctx.translate(x, y + Math.sin(phase * 2.4) * 2.5);
  ctx.scale(sc, sc);

  ctx.fillStyle = "rgba(0,0,0,.24)";
  ctx.beginPath();
  ctx.ellipse(0, 50, 54, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  const coats = ["#3e4b52", "#c96b4c", "#4e6b45", "#ba456a", "#2f5f8f"];
  const bags = ["#111111", "#263238", "#704c2f", "#194d35", "#5b3a78"];
  const skin = ["#e7c3a3", "#d7a980", "#f0cfaf"][variant % 3];

  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -38, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = ["#593b2f", "#2b211f", "#d6a044", "#7a3a2a", "#6a625c"][variant % 5];
  ctx.beginPath();
  ctx.ellipse(0, -47, 15, 8, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = coats[variant % coats.length];
  round(-18, -24, 36, 54, 8, true);

  ctx.fillStyle = "rgba(255,255,255,.78)";
  round(-13, -18, 26, 12, 5, true);
  ctx.fillStyle = "#7ddc7b";
  ctx.font = "bold 8px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ROŚL", 0, -9);

  ctx.strokeStyle = coats[variant % coats.length];
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-15, -12);
  ctx.lineTo(-32, 10 + Math.sin(phase * 3) * 4);
  ctx.moveTo(15, -12);
  ctx.lineTo(30, 8 + Math.cos(phase * 3) * 4);
  ctx.stroke();

  ctx.strokeStyle = "#262626";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-8, 28);
  ctx.lineTo(-11, 52);
  ctx.moveTo(8, 28);
  ctx.lineTo(12, 52);
  ctx.stroke();

  ctx.fillStyle = bags[variant % bags.length];
  round(24, 10, 18, 23, 4, true);
  ctx.strokeStyle = bags[variant % bags.length];
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(33, 10, 8, Math.PI, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#2e7d32";
  ctx.beginPath();
  ctx.ellipse(-36, 4, 10, 22, -0.4, 0, Math.PI * 2);
  ctx.ellipse(-24, -4, 9, 20, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9b5b32";
  round(-38, 17, 22, 15, 4, true);

  ctx.restore();
}

function drawSowa3Boar(x, y, sc, phase) {
  ctx.save();
  ctx.translate(x, y + Math.sin(phase * 2) * 2);
  ctx.scale(sc, sc);

  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.beginPath();
  ctx.ellipse(0, 46, 72, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5a4034";
  ctx.beginPath();
  ctx.ellipse(0, 4, 46, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4a342b";
  ctx.beginPath();
  ctx.ellipse(34, 0, 24, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3a2924";
  ctx.beginPath();
  ctx.moveTo(22, -15);
  ctx.lineTo(31, -34);
  ctx.lineTo(39, -12);
  ctx.closePath();
  ctx.moveTo(42, -12);
  ctx.lineTo(55, -28);
  ctx.lineTo(55, -5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1f1715";
  ctx.beginPath();
  ctx.ellipse(43, -4, 3, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#f0e4d8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(49, 7);
  ctx.quadraticCurveTo(59, 13, 65, 5);
  ctx.moveTo(42, 8);
  ctx.quadraticCurveTo(32, 16, 26, 8);
  ctx.stroke();

  ctx.strokeStyle = "#2a201c";
  ctx.lineWidth = 6;
  for (let i = -1; i <= 1; i += 1) {
    const lx = -18 + i * 24 + Math.sin(phase * 3 + i) * 2;
    ctx.beginPath();
    ctx.moveTo(lx, 22);
    ctx.lineTo(lx - 3, 44);
    ctx.stroke();
  }

  ctx.strokeStyle = "#3a2924";
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-30 + i * 13, -14);
    ctx.lineTo(-24 + i * 13, 18);
    ctx.stroke();
  }

  ctx.restore();
}
