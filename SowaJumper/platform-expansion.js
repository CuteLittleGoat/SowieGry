// Additional platform variants for SowaJumper.
(() => {
  const baseCreate = createPlatform;
  const baseUpdate = updateGame;
  const baseCollide = collidePlatforms;
  const baseDraw = drawPlatform;

  function uiPaused() {
    const badge = document.querySelector(".sowie-paused-badge");
    const modal = document.querySelector(".sowie-modal-backdrop");
    return Boolean((badge && !badge.hidden) || (modal && !modal.hidden));
  }

  createPlatform = function expandedCreate(y, forcedType = null) {
    const platform = baseCreate(y, forcedType);
    if (forcedType || platform.type !== "normal") return platform;
    const meters = getHeightMeters(y);
    const roll = Math.random();
    if (meters > 180 && roll < 0.06) platform.type = "rotating";
    else if (meters > 240 && roll < 0.11) platform.type = "temporary";
    else if (meters > 110 && roll < 0.16) platform.type = "springGoat";
    platform.extraPhase = rand(0, Math.PI * 2);
    platform.touchedAt = 0;
    return platform;
  };

  updateGame = function expandedUpdate(delta) {
    if (uiPaused()) return;
    baseUpdate(delta);
    const current = now();
    for (const platform of platforms) platform.extraPhase = (platform.extraPhase || 0) + delta * 0.003;
    for (let i = platforms.length - 1; i >= 0; i -= 1) {
      const platform = platforms[i];
      if (platform.type === "temporary" && platform.touchedAt && current - platform.touchedAt > 720) platforms.splice(i, 1);
    }
  };

  collidePlatforms = function expandedCollide() {
    const falling = owl.vy >= 0;
    baseCollide();
    if (!falling || owl.vy >= 0) return;
    const landed = platforms.find((platform) => Math.abs(owl.y - (platform.y - owl.radius)) < 4 && owl.x + owl.radius > platform.x && owl.x - owl.radius < platform.x + platform.width);
    if (!landed) return;
    if (landed.type === "temporary" && !landed.touchedAt) {
      landed.touchedAt = now();
      state.message = "Platforma zaraz zniknie!";
      state.messageUntil = now() + 850;
    }
    if (landed.type === "springGoat") {
      owl.vy = -state.goatPower * 1.08;
      state.score += 35;
      addParticles(owl.x, landed.y - state.cameraY, 15, "+35");
      window.SowieCore?.play("goat");
    }
    if (landed.type === "rotating") state.score += 15;
  };

  drawPlatform = function expandedDraw(platform) {
    if (!["rotating", "temporary", "springGoat"].includes(platform.type)) return baseDraw(platform);
    const y = platform.y - state.cameraY;
    if (y < -120 || y > state.height + 120) return;
    ctx.save();
    if (platform.type === "rotating") {
      ctx.translate(platform.x + platform.width / 2, y + platform.height / 2);
      ctx.rotate(Math.sin(platform.extraPhase || 0) * 0.11);
      ctx.fillStyle = "#8d7ac2";
      roundRect(-platform.width / 2, -platform.height / 2, platform.width, platform.height, 9, true);
      ctx.fillStyle = "#ffd65a";
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (platform.type === "temporary") {
      const remaining = platform.touchedAt ? Math.max(0, 1 - (now() - platform.touchedAt) / 720) : 1;
      ctx.globalAlpha = 0.35 + remaining * 0.65;
      ctx.fillStyle = "#9fd7ed";
      roundRect(platform.x, y, platform.width, platform.height, 9, true);
    } else {
      ctx.fillStyle = "#74b966";
      roundRect(platform.x, y, platform.width, platform.height, 9, true);
      const gx = platform.x + platform.width / 2;
      const gy = y - 12 + Math.sin(platform.extraPhase || 0) * 3;
      ctx.fillStyle = "#ffffff";
      roundRect(gx - 20, gy - 18, 40, 23, 9, true);
      roundRect(gx + 10, gy - 27, 20, 18, 7, true);
    }
    ctx.restore();
  };
})();
