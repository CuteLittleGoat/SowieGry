// Dodatkowe wydarzenia SowaRunner: przeciwny wiatr i znaki ostrzegawcze.
(() => {
  const core = window.SowieCore;
  let windTimer = 18;
  let windWarning = 0;
  let windActive = 0;
  let windStrength = 0;

  const previousUpdateRun = updateRun;
  updateRun = function runnerUpdateWithWind(dt) {
    previousUpdateRun(dt);
    if (mode !== SCREEN.RUN) return;

    if (windActive > 0) {
      windActive -= dt;
      owl.vy += windStrength * dt * 60 * s;
      if (windActive <= 0) {
        windStrength = 0;
        windTimer = random(18, 28);
        core?.toast("Wiatr ucichł 🌤️");
      }
      return;
    }

    if (windWarning > 0) {
      windWarning -= dt;
      if (windWarning <= 0) {
        windActive = 5.5;
        windStrength = .055;
        core?.toast("Przeciwny wiatr! 🌬️");
      }
      return;
    }

    windTimer -= dt;
    if (windTimer <= 0) {
      windWarning = 1.7;
      core?.toast("Uwaga: nadciąga wiatr…");
    }
  };

  const previousDrawWorld = drawWorld;
  drawWorld = function runnerWorldWithWarnings() {
    previousDrawWorld();
    drawWindLines();
    drawNearestHazardSign();
  };

  function drawWindLines() {
    if (windActive <= 0) return;
    push();
    noFill();
    stroke(255, 255, 255, 115);
    strokeWeight(2 * s);
    for (let i = 0; i < 7; i += 1) {
      const y = height * (.18 + i * .085);
      const shift = (t * 110 + i * 73) % (width + 180);
      beginShape();
      for (let x = -160; x < width + 120; x += 34) {
        vertex(x + shift - width, y + sin((x + t * 90) * .025 + i) * 7 * s);
      }
      endShape();
    }
    pop();
  }

  function nearestHazard() {
    const candidates = [];
    for (const item of holes) candidates.push({ x: item.x, type: "dziura" });
    for (const item of walls) candidates.push({ x: item.x, type: "ściana" });
    for (const item of amic) candidates.push({ x: item.x, type: "Amic" });
    for (const item of pracu) candidates.push({ x: item.x, type: "Pracu" });
    return candidates
      .filter((item) => item.x > width * .65 && item.x < width + 220 * s)
      .sort((a, b) => a.x - b.x)[0] || null;
  }

  function drawNearestHazardSign() {
    const hazard = nearestHazard();
    if (!hazard) return;
    const x = width - 48 * s;
    const y = ground - 92 * s;
    push();
    noStroke();
    fill(255, 214, 90, 235);
    triangle(x, y - 24 * s, x - 25 * s, y + 20 * s, x + 25 * s, y + 20 * s);
    fill(43, 39, 51);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(11 * s);
    text(hazard.type, x, y + 7 * s);
    stroke(84, 76, 65);
    strokeWeight(4 * s);
    line(x, y + 20 * s, x, ground);
    pop();
  }
})();
