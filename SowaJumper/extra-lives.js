// Mechanika zdobywania dodatkowych żyć dla SowaJumper.
const jumperLifePickups = [];
const originalJumperSpawnOnPlatformForLives = spawnOnPlatform;
const originalJumperUpdateGameForLives = updateGame;
const originalJumperDrawWorldForLives = drawWorld;
const originalJumperStartGameForLives = startGame;

spawnOnPlatform = function patchedSpawnOnPlatformWithLives(platform) {
  originalJumperSpawnOnPlatformForLives(platform);
  const meters = getHeightMeters(platform.y);
  const canSpawn = meters > 35 && platform.type !== "amic" && Math.random() < 0.055;
  if (canSpawn) {
    jumperLifePickups.push({
      x: platform.x + rand(22, Math.max(24, platform.width - 22)),
      y: platform.y - rand(82, 128),
      size: rand(18, 25),
      phase: rand(0, Math.PI * 2)
    });
  }
};

startGame = function patchedStartGameWithLives() {
  jumperLifePickups.length = 0;
  originalJumperStartGameForLives();
};

updateGame = function patchedUpdateGameWithLives(delta) {
  originalJumperUpdateGameForLives(delta);
  const bottom = state.cameraY + state.height + 220;
  for (let i = jumperLifePickups.length - 1; i >= 0; i -= 1) {
    const heart = jumperLifePickups[i];
    const hy = heart.y + Math.sin(state.time / 330 + heart.phase) * 6;
    if (Math.hypot(owl.x - heart.x, owl.y - hy) < owl.radius + heart.size * 0.9) {
      if (state.lives < state.maxLives) {
        state.lives += 1;
        state.message = "Dodatkowe życie!";
        state.messageUntil = now() + 1300;
        addParticles(heart.x, hy - state.cameraY, 14, "+1 ❤");
      } else {
        state.score += 100;
        state.message = "Maks żyć: +100 pkt";
        state.messageUntil = now() + 1200;
        addParticles(heart.x, hy - state.cameraY, 14, "+100");
      }
      jumperLifePickups.splice(i, 1);
      updateHud();
    } else if (heart.y > bottom) {
      jumperLifePickups.splice(i, 1);
    }
  }
};

drawWorld = function patchedDrawWorldWithLives() {
  originalJumperDrawWorldForLives();
  for (const heart of jumperLifePickups) {
    drawJumperHeart(heart.x, heart.y - state.cameraY + Math.sin(state.time / 330 + heart.phase) * 6, heart.size);
  }
};

function drawJumperHeart(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 24;
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.ellipse(0, 4, 34, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff4f72";
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.bezierCurveTo(-34, 2, -20, -24, 0, -10);
  ctx.bezierCurveTo(20, -24, 34, 2, 0, 22);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.beginPath();
  ctx.ellipse(-8, -7, 5, 3, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
