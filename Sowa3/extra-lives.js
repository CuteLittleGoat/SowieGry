// Mechanika zdobywania dodatkowych żyć dla Sowa3.
const sowa3LifePickups = [];
let sowa3LifeTimer = 6200;
const originalSowa3StartForLives = startGame;
const originalSowa3NextStageForLives = nextStage;
const originalSowa3UpdateForLives = update;
const originalSowa3DrawObjectsForLives = drawObjects;

startGame = function patchedSowa3StartWithLives() {
  sowa3LifePickups.length = 0;
  sowa3LifeTimer = 5200;
  originalSowa3StartForLives();
};

nextStage = function patchedSowa3NextStageWithLives() {
  sowa3LifePickups.length = 0;
  sowa3LifeTimer = 4800;
  originalSowa3NextStageForLives();
};

update = function patchedSowa3UpdateWithLives(dt) {
  originalSowa3UpdateForLives(dt);
  updateSowa3LifePickups(dt);
};

drawObjects = function patchedSowa3DrawObjectsWithLives() {
  originalSowa3DrawObjectsForLives();
  [...sowa3LifePickups].sort((a, b) => b.z - a.z).forEach((life) => {
    drawSowa3Heart(laneX(life.lane, life.z), roadY(life.z) + Math.sin(state.time / 260 + life.phase) * 6, scaleAt(life.z));
  });
};

function updateSowa3LifePickups(dt) {
  if (state.mode !== "run") return;
  sowa3LifeTimer -= dt;
  if (sowa3LifeTimer <= 0) {
    const lane = [-1, 0, 1][Math.floor(rand(0, 3))];
    sowa3LifePickups.push({ lane, z: 1.08, phase: rand(0, Math.PI * 2), hit: false });
    const difficulty = state.difficultyKey || "arcade";
    sowa3LifeTimer = rand(10500, 16500) * (difficulty === "chill" ? 0.82 : difficulty === "chaos" ? 1.25 : 1);
  }

  for (let i = sowa3LifePickups.length - 1; i >= 0; i -= 1) {
    const life = sowa3LifePickups[i];
    life.z -= state.speed * dt * .001;
    if (life.z < .12 && !life.hit) {
      const sameLane = Math.round(state.lane) === life.lane;
      if (sameLane) {
        life.hit = true;
        if (state.lives < 5) {
          state.lives += 1;
          say("Dodatkowe życie!", 1200);
          burst(laneX(life.lane, life.z), roadY(life.z), "+1 ❤", "#ff4f72");
        } else {
          state.score += 150;
          say("Maks żyć: +150 pkt", 1100);
          burst(laneX(life.lane, life.z), roadY(life.z), "+150", "#ff4f72");
        }
        updateHud();
      }
    }
    if (life.z < -.08 || life.hit) sowa3LifePickups.splice(i, 1);
  }
}

function drawSowa3Heart(x, y, sc) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ellipse(0, 4, 42, 32);
  ctx.fillStyle = "#ff4f72";
  ctx.beginPath();
  ctx.moveTo(0, 25);
  ctx.bezierCurveTo(-38, 2, -22, -27, 0, -11);
  ctx.bezierCurveTo(22, -27, 38, 2, 0, 25);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.72)";
  ctx.beginPath();
  ctx.ellipse(-9, -8, 5, 3, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
