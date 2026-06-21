// Squash-and-stretch, reakcje i gwiazdki dla sowy w SowaRunner.
(() => {
  const core = window.SowieCore;

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
