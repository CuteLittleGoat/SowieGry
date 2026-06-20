// Mechanika zdobywania dodatkowych żyć dla SowaRunner.
let runnerLifePickups = [];
let runnerLifeTimer = 8;
const originalRunnerStartForLives = start;
const originalRunnerUpdateRunForLives = updateRun;
const originalRunnerDrawWorldForLives = drawWorld;

start = function patchedRunnerStartWithLives() {
  runnerLifePickups = [];
  runnerLifeTimer = random(7, 12);
  originalRunnerStartForLives();
};

updateRun = function patchedRunnerUpdateRunWithLives(dt) {
  originalRunnerUpdateRunForLives(dt);
  updateRunnerLifePickups(dt);
};

drawWorld = function patchedRunnerDrawWorldWithLives() {
  originalRunnerDrawWorldForLives();
  for (const h of runnerLifePickups) drawRunnerHeart(h.x, h.y + sin(t * 4 + h.bob) * 7 * s, h.r);
};

function updateRunnerLifePickups(dt) {
  if (mode !== SCREEN.RUN) return;
  runnerLifeTimer -= dt;
  if (runnerLifeTimer <= 0) {
    runnerLifePickups.push({
      x: width + 70,
      y: random(ground - 205 * s, ground - 92 * s),
      r: random(18, 25) * s,
      bob: random(TWO_PI)
    });
    runnerLifeTimer = random(13, 22) * (level === 0 ? 0.9 : level === 2 ? 1.2 : 1);
  }

  const dx = spd * 60 * dt;
  for (let i = runnerLifePickups.length - 1; i >= 0; i--) {
    const h = runnerLifePickups[i];
    h.x -= dx;
    const hy = h.y + sin(t * 4 + h.bob) * 7 * s;
    if (dist(owl.x, owl.y, h.x, hy) < owl.r + h.r) {
      if (lives < 5) {
        lives += 1;
        say("Dodatkowe życie!", 1.1);
        burst(h.x, hy, 14, "+1 ❤");
      } else {
        score += 120;
        say("Maks żyć: +120 pkt", 1.0);
        burst(h.x, hy, 14, "+120");
      }
      runnerLifePickups.splice(i, 1);
    } else if (h.x < -90) {
      runnerLifePickups.splice(i, 1);
    }
  }
}

function drawRunnerHeart(x, y, r) {
  push();
  translate(x, y);
  scale(r / 24);
  noStroke();
  fill(255, 255, 255, 120);
  ellipse(0, 4, 34, 28);
  fill(255, 79, 114);
  beginShape();
  vertex(0, 22);
  bezierVertex(-34, 2, -20, -24, 0, -10);
  bezierVertex(20, -24, 34, 2, 0, 22);
  endShape(CLOSE);
  fill(255, 210);
  ellipse(-8, -7, 8, 5);
  pop();
}
