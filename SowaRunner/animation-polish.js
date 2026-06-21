// Squash-and-stretch, reakcje, gwiazdki i ślad bąbelków w SowaRunner.
(() => {
  const core = window.SowieCore;
  const bubbles = [];
  let bubbleTimer = 0;

  const previousHit = hit;
  hit = function animatedRunnerHit(message) {
    const before = lives;
    previousHit(message);
    if (lives < before) {
      owl._cuteHurtUntil = millis() + 900;
      core?.play(message.includes("Koza") ? "goat" : "hurt");
      core?.maybeQuip("Ojej! Piórka w nieładzie!");
    }
  };

  const previousJump = jump;
  jump = function animatedRunnerJump() {
    const beforeVy = owl.vy;
    previousJump();
    if (owl.vy < beforeVy) core?.play("jump");
  };

  const previousLandRect = landRect;
  landRect = function animatedRunnerLanding(x, y, w, h) {
    const wasFalling = owl.vy >= 0;
    const result = previousLandRect(x, y, w, h);
    if (result && wasFalling) owl._cuteSquashUntil = millis() + 150;
    return result;
  };

  const previousUpdateRun = updateRun;
  updateRun = function animatedRunnerUpdate(dt) {
    previousUpdateRun(dt);
    updateRunnerBubbles(dt);
  };

  function updateRunnerBubbles(dt) {
    bubbleTimer -= dt;
    const enabled = core?.selectedCosmetic() === "bubbleTrail" && mode === SCREEN.RUN;
    const interval = core?.settings().reducedEffects ? .30 : .13;
    if (enabled && bubbleTimer <= 0) {
      bubbleTimer = interval;
      bubbles.push({ x: owl.x - owl.r * .65, y: owl.y + random(-8, 12) * s, r: random(3, 7) * s, life: 1.05, vy: random(-16, -7) * s });
    }
    for (let i = bubbles.length - 1; i >= 0; i -= 1) {
      const bubble = bubbles[i];
      bubble.x -= spd * 16 * dt;
      bubble.y += bubble.vy * dt;
      bubble.life -= dt;
      if (bubble.life <= 0) bubbles.splice(i, 1);
    }
  }

  const previousDrawOwl = drawOwl;
  drawOwl = function animatedRunnerOwl() {
    const squash = Math.max(0, (owl._cuteSquashUntil || 0) - millis());
    const hurt = Math.max(0, (owl._cuteHurtUntil || 0) - millis());
    const sx = squash > 0 ? 1.12 : owl.vy < -7 * s ? .94 : 1;
    const sy = squash > 0 ? .86 : owl.vy < -7 * s ? 1.08 : 1;
    const tilt = constrain(owl.vy * .012, -.20, .20);

    push();
    translate(owl.x, owl.y);
    rotate(tilt);
    scale(sx, sy);
    const oldX = owl.x, oldY = owl.y;
    owl.x = 0;
    owl.y = 0;
    previousDrawOwl();
    owl.x = oldX;
    owl.y = oldY;
    pop();

    if (hurt > 0) drawRunnerStars(hurt / 900);
  };

  const previousDrawParts = drawParts;
  drawParts = function drawRunnerPartsAndBubbles() {
    drawRunnerBubbles();
    previousDrawParts();
  };

  function drawRunnerBubbles() {
    push();
    noFill();
    strokeWeight(1.5 * s);
    for (const bubble of bubbles) {
      stroke(180, 238, 255, constrain(bubble.life, 0, 1) * 210);
      ellipse(bubble.x, bubble.y, bubble.r * 2, bubble.r * 2);
    }
    pop();
  }

  function drawRunnerStars(alpha) {
    push();
    translate(owl.x, owl.y - owl.r * 1.45);
    noStroke();
    fill(255, 214, 90, 230 * alpha);
    for (let i = 0; i < 3; i += 1) {
      const angle = frameCount * .08 + i * TWO_PI / 3;
      const x = cos(angle) * 26 * s;
      const y = sin(angle) * 8 * s;
      ellipse(x, y, 7 * s, 7 * s);
    }
    pop();
  }
})();
