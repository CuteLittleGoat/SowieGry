// Przechylenie, reakcje i gwiazdki dla sowy w Sowa3.
(() => {
  const core = window.SowieCore;

  const previousDamage = damage;
  damage = function animatedSowa3Damage(reason) {
    const before = state.lives;
    previousDamage(reason);
    if (state.lives < before) {
      state._cuteHurtUntil = now() + 900;
      if (reason.includes("Dzik")) core?.play("boar");
      else if (reason.includes("Telefon") || reason.includes("zmianę")) core?.play("phone");
      else core?.play("hurt");
      core?.maybeQuip(reason.includes("Dzik") ? "Dzik! Dzik! Dzik!" : "Ojej! Zmieniam tor!");
    }
  };

  const previousDrawOwl = drawOwl;
  drawOwl = function animatedSowa3Owl() {
    if (state.mode === "finish") {
      previousDrawOwl();
      return;
    }

    const x = laneX(state.lane, 0);
    const y = state.h * .78;
    const hurt = Math.max(0, (state._cuteHurtUntil || 0) - now());
    const laneDelta = state.targetLane - state.lane;
    const tilt = clamp(laneDelta * .32, -.26, .26);
    const stretch = 1 + Math.min(.08, Math.abs(laneDelta) * .06);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(1 / stretch, stretch);
    ctx.translate(-x, -y);
    previousDrawOwl();
    ctx.restore();

    if (hurt > 0) drawSowa3Stars(x, y - 52, hurt / 900);
  };

  function drawSowa3Stars(x, y, alpha) {
    ctx.save();
    ctx.fillStyle = `rgba(255,214,90,${Math.max(0, Math.min(1, alpha))})`;
    for (let i = 0; i < 3; i += 1) {
      const angle = state.time * .008 + i * Math.PI * 2 / 3;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * 34, y + Math.sin(angle) * 9, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
})();
