// Squash-and-stretch, reakcje i gwiazdki dla sowy w SowaJumper.
(() => {
  const core = window.SowieCore;

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
