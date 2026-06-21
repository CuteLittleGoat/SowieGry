// Squash-and-stretch, reakcje, gwiazdki i ślad bąbelków w SowaJumper.
(() => {
  const core = window.SowieCore;
  const bubbles = [];
  let bubbleTimer = 0;

  const previousDamage = damage;
  damage = function animatedJumperDamage(reason) {
    const before = state.lives;
    previousDamage(reason);
    if (state.lives < before) {
      owl._cuteHurtUntil = now() + 900;
      core?.play("hurt");
      core?.maybeQuip("Ojej! Następna platforma będzie moja!");
    }
  };

  const previousCollide = collidePlatforms;
  collidePlatforms = function animatedJumperLanding() {
    const wasFalling = owl.vy >= 0;
    previousCollide();
    if (wasFalling && owl.vy < 0) {
      owl._cuteSquashUntil = now() + 160;
      core?.play("jump");
    }
  };

  const previousUpdateGame = updateGame;
  updateGame = function animatedJumperUpdate(delta) {
    previousUpdateGame(delta);
    updateJumperBubbles(delta);
  };

  const previousUpdateBonus = updateBonus;
  updateBonus = function animatedJumperBonus(delta) {
    previousUpdateBonus(delta);
    updateJumperBubbles(delta);
  };

  function updateJumperBubbles(delta) {
    bubbleTimer -= delta;
    const enabled = core?.selectedCosmetic() === "bubbleTrail" && (state.scene === "playing" || state.scene === "bonus");
    const interval = core?.settings().reducedEffects ? 300 : 135;
    if (enabled && bubbleTimer <= 0) {
      bubbleTimer = interval;
      const screenY = state.scene === "bonus" ? owl.y : owl.y - state.cameraY;
      bubbles.push({
        x: owl.x - owl.vx * 2,
        y: screenY + rand(-8, 12),
        r: rand(3, 7),
        life: 1050,
        vy: rand(-0.8, -0.25),
      });
    }
    for (let i = bubbles.length - 1; i >= 0; i -= 1) {
      const bubble = bubbles[i];
      bubble.y += bubble.vy;
      bubble.life -= delta;
      if (bubble.life <= 0) bubbles.splice(i, 1);
    }
  }

  const previousDrawOwl = drawOwl;
  drawOwl = function animatedJumperOwl(x, y, radius, invincible = false) {
    const squash = Math.max(0, (owl._cuteSquashUntil || 0) - now());
    const hurt = Math.max(0, (owl._cuteHurtUntil || 0) - now());
    const sx = squash > 0 ? 1.13 : owl.vy < -8 ? .94 : 1;
    const sy = squash > 0 ? .86 : owl.vy < -8 ? 1.08 : 1;
    const tilt = clamp(owl.vx * .035, -.24, .24);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(sx, sy);
    previousDrawOwl(0, 0, radius, invincible);
    ctx.restore();

    if (hurt > 0) drawJumperStars(x, y - radius * 1.6, hurt / 900);
  };

  const previousDrawParticles = drawParticles;
  drawParticles = function drawJumperParticlesAndBubbles() {
    drawJumperBubbles();
    previousDrawParticles();
  };

  function drawJumperBubbles() {
    ctx.save();
    ctx.lineWidth = 1.5;
    for (const bubble of bubbles) {
      ctx.strokeStyle = `rgba(170,232,255,${clamp(bubble.life / 1050, 0, 1) * .82})`;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawJumperStars(x, y, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = `rgba(255,214,90,${Math.max(0, Math.min(1, alpha))})`;
    for (let i = 0; i < 3; i += 1) {
      const angle = state.time * .008 + i * Math.PI * 2 / 3;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 28, Math.sin(angle) * 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
})();
