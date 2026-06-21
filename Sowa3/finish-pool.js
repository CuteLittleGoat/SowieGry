// Finał planszy Sowa3: działka, wskok do basenu i przemiana sowy w humbaka.

const originalSowa3DrawOwlForFinish = drawOwl;

state.finishElapsed = 0;
state.finishDuration = 4300;
state.finishSequenceActive = false;
state.finishTransformed = false;
state.finishAnnounced = false;

updateFinish = function updateSowa3PoolFinish(dt) {
  if (state.mode !== "finish") {
    state.finishSequenceActive = false;
    state.finishElapsed = 0;
    state.finishTransformed = false;
    state.finishAnnounced = false;
    return;
  }

  if (!state.finishSequenceActive) {
    state.finishSequenceActive = true;
    state.finishElapsed = 0;
    state.finishTimer = state.finishDuration;
    state.finishTransformed = false;
    state.finishAnnounced = false;
    objects.length = 0;
  }

  state.finishElapsed += dt;
  state.finishTimer -= dt;
  state.time += dt;
  state.lane += (0 - state.lane) * Math.min(1, dt * 0.012);
  state.targetLane = 0;

  if (state.finishElapsed >= 1650 && !state.finishTransformed) {
    state.finishTransformed = true;
    state.shake = Math.max(state.shake, 4);
    burst(state.w * 0.5, state.h * 0.66, "CHLUP!", "#3ebcf2");
  }

  if (state.finishElapsed >= 1900 && !state.finishAnnounced) {
    state.finishAnnounced = true;
    say("Sowa zmieniła się w humbaka!", 1800);
  }

  if (state.finishTimer <= 0) {
    state.mode = "run";
    state.finishSequenceActive = false;
    state.finishElapsed = 0;
    state.finishTransformed = false;
    state.finishAnnounced = false;
    nextStage();
  }
};

drawAllotment = function drawSowa3PoolFinishScene() {
  const w = state.w;
  const h = state.h;
  const y = h * 0.23;

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#c9efff");
  sky.addColorStop(0.44, "#f7fbde");
  sky.addColorStop(1, "#8ecb74");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Drzewa i krzewy wyłącznie u góry i przy bokach.
  drawFinishTreeLine(w, h, y);
  drawFinishSideGarden(w, h, y);

  // Czysta trawa prowadząca do centralnego basenu.
  const grass = ctx.createLinearGradient(0, y, 0, h);
  grass.addColorStop(0, "#96d47c");
  grass.addColorStop(1, "#68ad58");
  ctx.fillStyle = grass;
  ctx.fillRect(0, y, w, h - y);

  drawFinishFence(w, h, y);
  drawReferencePool(w * 0.5, h * 0.69, Math.min(w * 0.31, h * 0.19));

  ctx.fillStyle = "rgba(255,255,255,.86)";
  round(w * 0.22, h * 0.30, w * 0.56, 60, 22, true);
  ctx.fillStyle = "#2b2733";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${22 * unit()}px sans-serif`;
  ctx.fillText("Meta: ogród działkowy!", w * 0.5, h * 0.30 + 31);
};

function drawFinishTreeLine(w, h, y) {
  for (let i = 0; i < 12; i += 1) {
    const x = (i / 11) * w;
    const crownY = y + 18 + Math.sin(i * 1.7) * 9;
    ctx.fillStyle = i % 2 ? "#3e7f43" : "#4e9650";
    ctx.beginPath();
    ctx.arc(x, crownY, 38 + (i % 3) * 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#77543c";
    ctx.fillRect(x - 4, crownY + 24, 8, 42);
  }
}

function drawFinishSideGarden(w, h, y) {
  for (let side = 0; side < 2; side += 1) {
    const baseX = side === 0 ? w * 0.06 : w * 0.94;
    for (let i = 0; i < 7; i += 1) {
      const x = baseX + (side === 0 ? 1 : -1) * (i % 2) * 26;
      const py = y + 110 + i * 46;
      ctx.fillStyle = i % 3 === 0 ? "#f07ea6" : i % 3 === 1 ? "#f4d35e" : "#7dcb6f";
      ctx.beginPath();
      ctx.arc(x, py, 11 + (i % 2) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#337c3d";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, py + 9);
      ctx.lineTo(x, py + 25);
      ctx.stroke();
    }
  }
}

function drawFinishFence(w, h, y) {
  ctx.strokeStyle = "rgba(122,89,58,.72)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, y + 78);
  ctx.lineTo(w, y + 78);
  ctx.stroke();
  for (let x = 10; x < w; x += 34) {
    ctx.beginPath();
    ctx.moveTo(x, y + 54);
    ctx.lineTo(x, y + 100);
    ctx.stroke();
  }
}

function drawReferencePool(x, y, radius) {
  ctx.save();
  ctx.translate(x, y);

  // Cień.
  ctx.fillStyle = "rgba(20,40,30,.24)";
  ctx.beginPath();
  ctx.ellipse(0, radius * 0.48, radius * 1.16, radius * 0.30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Szara, pionowo ryflowana ścianka basenu.
  const wallTop = -radius * 0.20;
  const wallHeight = radius * 0.78;
  const wallGradient = ctx.createLinearGradient(-radius, 0, radius, 0);
  wallGradient.addColorStop(0, "#555c60");
  wallGradient.addColorStop(0.48, "#8f979a");
  wallGradient.addColorStop(1, "#4e565a");
  ctx.fillStyle = wallGradient;
  ctx.beginPath();
  ctx.moveTo(-radius, wallTop);
  ctx.bezierCurveTo(-radius, wallTop + wallHeight * 0.34, -radius * 0.92, wallTop + wallHeight, 0, wallTop + wallHeight);
  ctx.bezierCurveTo(radius * 0.92, wallTop + wallHeight, radius, wallTop + wallHeight * 0.34, radius, wallTop);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(45,50,53,.32)";
  ctx.lineWidth = 1;
  for (let gx = -radius + 7; gx < radius; gx += 7) {
    const edge = Math.abs(gx / radius);
    const topY = wallTop + edge * edge * radius * 0.07;
    const bottomY = wallTop + wallHeight - edge * edge * radius * 0.07;
    ctx.beginPath();
    ctx.moveTo(gx, topY);
    ctx.lineTo(gx, bottomY);
    ctx.stroke();
  }

  // Niebieski rant.
  ctx.lineWidth = Math.max(9, radius * 0.075);
  ctx.strokeStyle = "#159ed7";
  ctx.beginPath();
  ctx.ellipse(0, wallTop, radius, radius * 0.34, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Woda.
  const water = ctx.createLinearGradient(0, wallTop - radius * 0.25, 0, wallTop + radius * 0.2);
  water.addColorStop(0, "#39d5f3");
  water.addColorStop(1, "#0b91dd");
  ctx.fillStyle = water;
  ctx.beginPath();
  ctx.ellipse(0, wallTop, radius * 0.94, radius * 0.29, 0, 0, Math.PI * 2);
  ctx.fill();

  // Delikatne fale.
  ctx.strokeStyle = "rgba(220,250,255,.58)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const waveY = wallTop - radius * 0.10 + i * radius * 0.05;
    const shift = Math.sin(state.time * 0.004 + i) * radius * 0.08;
    ctx.beginPath();
    ctx.ellipse(shift, waveY, radius * (0.58 - i * 0.045), radius * 0.055, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

drawOwl = function drawOwlOrFinishWhale() {
  if (state.mode !== "finish") {
    originalSowa3DrawOwlForFinish();
    return;
  }

  const elapsed = state.finishElapsed || 0;
  const w = state.w;
  const h = state.h;
  const poolX = w * 0.5;
  const poolY = h * 0.655;

  if (elapsed < 1650) {
    const approach = clamp(elapsed / 850, 0, 1);
    const jumpT = clamp((elapsed - 850) / 800, 0, 1);
    const startX = laneX(state.lane, 0);
    const x = startX + (poolX - startX) * approach;
    const runY = h * 0.78 - approach * h * 0.08;
    const jumpArc = Math.sin(jumpT * Math.PI) * h * 0.22;
    const y = runY - jumpArc;
    drawFinishOwlAt(x, y, 1.05 - jumpT * 0.16, jumpT);
  } else {
    const emerge = clamp((elapsed - 1650) / 500, 0, 1);
    drawFinishSplash(poolX, poolY, elapsed);
    drawFinishWhale(poolX, poolY + 18 - emerge * 28, 0.52 + emerge * 0.28, elapsed);
  }
};

function drawFinishOwlAt(x, y, scale, jumpT) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(jumpT * Math.PI) * 0.18);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(0,0,0,.18)";
  ctx.beginPath();
  ctx.ellipse(0, 44, 40, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9b6a45";
  wing(-26, 0, -0.75);
  wing(26, 0, 0.75);
  ctx.fillStyle = "#b77b50";
  ellipse(0, 0, 58, 70);
  ctx.fillStyle = "#f0dfc7";
  ellipse(0, 12, 38, 44);
  ctx.fillStyle = "#fff";
  ellipse(-15, -12, 15, 15);
  ellipse(15, -12, 15, 15);
  ctx.fillStyle = "#222";
  ellipse(-15, -12, 5, 5);
  ellipse(15, -12, 5, 5);
  ctx.fillStyle = "#f6c74a";
  tri(0, -1, -7, 9, 7, 9);
  ctx.restore();
}

function drawFinishSplash(x, y, elapsed) {
  const t = clamp((elapsed - 1650) / 750, 0, 1);
  if (t >= 1) return;
  ctx.save();
  ctx.strokeStyle = `rgba(210,250,255,${1 - t})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(x, y, 28 + t * 85, 8 + t * 22, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = `rgba(120,225,255,${1 - t})`;
  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2;
    const dist = 18 + t * 62;
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * dist, y - Math.sin(angle) * dist * 0.42 - t * 24, 4 * (1 - t) + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFinishWhale(x, y, scale, elapsed) {
  ctx.save();
  ctx.translate(x, y + Math.sin(elapsed * 0.006) * 3);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#4a9fca";
  ctx.beginPath();
  ctx.ellipse(0, 0, 94, 42, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-43, -2);
  ctx.quadraticCurveTo(-70, -26, -82, -10);
  ctx.quadraticCurveTo(-68, 0, -82, 15);
  ctx.quadraticCurveTo(-60, 22, -43, 7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#7bc7e8";
  ctx.beginPath();
  ctx.ellipse(17, 8, 48, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1f2a32";
  ctx.beginPath();
  ctx.arc(30, -9, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#17333e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(35, 2, 12, 0.25, 1.7);
  ctx.stroke();

  ctx.fillStyle = "#4a9fca";
  ctx.beginPath();
  ctx.ellipse(5, -22, 22, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
