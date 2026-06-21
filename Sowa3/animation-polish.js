// Przechylenie, reakcje, gwiazdki i ślad bąbelków dla sowy w Sowa3.
(() => {
  const core = window.SowieCore;
  const bubbles = [];
  let bubbleTimer = 0;

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

  const previousUpdate = update;
  update = function animatedSowa3Update(dt) {
    previousUpdate(dt);
    updateSowa3Bubbles(dt);
  };

  function updateSowa3Bubbles(dt) {
    bubbleTimer -= dt;
    const enabled = core?.selectedCosmetic() === "bubbleTrail" && state.mode === "run";
    const interval = core?.settings().reducedEffects ? 300 : 135;
    if (enabled && bubbleTimer <= 0) {
      bubbleTimer = interval;
      bubbles.push({
        x: laneX(state.lane, 0),
        y: state.h * .79 + rand(-8, 10),
        r: rand(3, 7),
        life: 1050,
        vy: rand(-.7, -.25),
      });
    }
    for (let i = bubbles.length - 1; i >= 0; i -= 1) {
      const bubble = bubbles[i];
      bubble.y += bubble.vy;
      bubble.life -= dt;
      if (bubble.life <= 0) bubbles.splice(i, 1);
    }
  }

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

  const previousDrawParticles = drawParticles;
  drawParticles = function drawSowa3ParticlesAndBubbles() {
    drawSowa3Bubbles();
    previousDrawParticles();
  };

  function drawSowa3Bubbles() {
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
