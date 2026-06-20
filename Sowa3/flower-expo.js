// Poprawione tło etapu wystawy kwiatów: hala, alejki, stojaki i dużo roślin.
// Ładowane po visual-polish.js, więc dopisuje obsługę stage === 1.

const previousSowa3DrawSceneWithVisualPolish = drawScene;

drawScene = function flowerExpoDrawScene() {
  if (state.stage === 1) {
    drawFlowerExpoScene();
    return;
  }
  previousSowa3DrawSceneWithVisualPolish();
};

function drawFlowerExpoScene() {
  const w = state.w;
  const h = state.h;
  const horizon = h * 0.23;
  const bottom = h - 48;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#17191c");
  bg.addColorStop(0.38, "#303438");
  bg.addColorStop(1, "#d3d2ca");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  drawExpoCeiling(w, h, horizon);
  drawExpoBackWall(w, h, horizon);
  drawExpoFloor(w, h, horizon, bottom);
  drawExpoPlantRacks(w, h, horizon, bottom);
  drawExpoCrowdHints(w, h);
  drawLaneGuides(w, horizon, bottom, "rgba(255,255,255,.72)");
}

function drawExpoCeiling(w, h, horizon) {
  ctx.fillStyle = "#101214";
  ctx.fillRect(0, 0, w, horizon + 28);

  for (let i = 0; i < 5; i += 1) {
    const x = w * (0.16 + i * 0.17);
    ctx.strokeStyle = "rgba(255,255,255,.88)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(w / 2 + (x - w / 2) * 0.12, horizon + 18);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,.16)";
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(w / 2 + (x - w / 2) * 0.12, horizon + 18);
    ctx.stroke();
  }

  for (let i = 0; i < 34; i += 1) {
    const x = (i % 17) * (w / 17) + 12;
    const y = 18 + Math.floor(i / 17) * 30;
    ctx.fillStyle = "rgba(255,255,220,.92)";
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,220,.08)";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawExpoBackWall(w, h, horizon) {
  ctx.fillStyle = "#151719";
  ctx.fillRect(0, horizon - 8, w, 48);

  ctx.fillStyle = "rgba(255,255,255,.92)";
  round(w * 0.38, h * 0.10, w * 0.24, 48, 8, true);
  ctx.fillStyle = "#2d7c3f";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${17 * unit()}px sans-serif`;
  ctx.fillText("FESTIWAL", w * 0.50, h * 0.12);
  ctx.fillText("ROŚLIN", w * 0.50, h * 0.145);

  ctx.fillStyle = "#2fae62";
  ctx.beginPath();
  ctx.ellipse(w * 0.58, h * 0.125, 12 * unit(), 22 * unit(), -0.35, 0, Math.PI * 2);
  ctx.fill();
}

function drawExpoFloor(w, h, horizon, bottom) {
  const leftTop = w * 0.43;
  const rightTop = w * 0.57;
  const leftBottom = w * 0.07;
  const rightBottom = w * 0.93;

  ctx.fillStyle = "#d9d8d0";
  path([[leftTop, horizon], [rightTop, horizon], [rightBottom, bottom], [leftBottom, bottom]], true);

  ctx.strokeStyle = "rgba(92,92,92,.20)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 11; i += 1) {
    const z = i / 10;
    const y = roadY(1 - z);
    ctx.beginPath();
    ctx.moveTo(w * 0.10, y);
    ctx.lineTo(w * 0.90, y);
    ctx.stroke();
  }

  for (let i = -7; i <= 7; i += 1) {
    const xb = w / 2 + i * w * 0.06;
    ctx.beginPath();
    ctx.moveTo(w / 2 + i * w * 0.008, horizon);
    ctx.lineTo(xb, bottom);
    ctx.stroke();
  }
}

function drawExpoPlantRacks(w, h, horizon, bottom) {
  const rows = [
    { y: h * 0.30, count: 7, scale: 0.46 },
    { y: h * 0.39, count: 6, scale: 0.58 },
    { y: h * 0.50, count: 5, scale: 0.76 },
    { y: h * 0.64, count: 4, scale: 1.00 }
  ];

  rows.forEach((row, rowIndex) => {
    for (let i = 0; i < row.count; i += 1) {
      const span = w * 0.80;
      const start = (w - span) / 2;
      const x = start + (i / Math.max(1, row.count - 1)) * span;
      const sideGap = Math.abs(x - w / 2) < w * 0.10 ? w * 0.14 : 0;
      drawExpoPlantRack(x + Math.sign(x - w / 2 || 1) * sideGap, row.y, row.scale, rowIndex + i);
    }
  });
}

function drawExpoPlantRack(x, y, scale, seed = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = "rgba(0,0,0,.16)";
  ctx.beginPath();
  ctx.ellipse(0, 82, 90, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#626b6d";
  ctx.lineWidth = 3;
  ctx.strokeRect(-58, -54, 116, 128);

  for (let shelf = 0; shelf < 4; shelf += 1) {
    const yy = -40 + shelf * 30;
    ctx.beginPath();
    ctx.moveTo(-58, yy);
    ctx.lineTo(58, yy);
    ctx.stroke();

    for (let p = 0; p < 6; p += 1) {
      const px = -48 + p * 18;
      drawExpoPottedPlant(px, yy - 6, 0.85 + ((p + seed) % 3) * 0.14, shelf + seed + p);
    }
  }

  ctx.fillStyle = "#f0d93a";
  round(52, -36, 16, 34, 2, true);
  ctx.fillStyle = "#1e1e1e";
  ctx.font = "bold 7px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CENA", 60, -17);

  ctx.restore();
}

function drawExpoPottedPlant(x, y, scale, variant) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#8c5c36";
  round(-6, 8, 12, 10, 2, true);

  const greens = ["#2d7c3f", "#3a9b4b", "#5cab4f", "#1d6a38", "#72b044"];
  const accents = ["#ae42c6", "#d84a7a", "#8ecf5b", "#6bc96d", "#f2d24b"];

  ctx.fillStyle = greens[variant % greens.length];
  ctx.beginPath();
  ctx.ellipse(-4, 3, 9, 15, -0.35, 0, Math.PI * 2);
  ctx.ellipse(5, 2, 9, 15, 0.35, 0, Math.PI * 2);
  ctx.ellipse(0, -4, 8, 17, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = accents[variant % accents.length];
  if (variant % 2 === 0) {
    ctx.beginPath();
    ctx.arc(0, -1, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(-4, -4, 8, 5);
  }

  ctx.restore();
}

function drawExpoCrowdHints(w, h) {
  const people = [
    [w * 0.21, h * 0.70, 0.82, "#31363a", "#d94f4f"],
    [w * 0.36, h * 0.77, 0.94, "#4c565d", "#63a0d9"],
    [w * 0.54, h * 0.72, 0.88, "#37413f", "#d7b56a"],
    [w * 0.70, h * 0.76, 0.94, "#2e3438", "#de8b6e"],
    [w * 0.82, h * 0.68, 0.80, "#44504a", "#78b76c"]
  ];

  people.forEach(([x, y, sc, coat, accent]) => drawExpoBackgroundPerson(x, y, sc, coat, accent));
}

function drawExpoBackgroundPerson(x, y, scale, coatColor, accentColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = "rgba(0,0,0,.16)";
  ctx.beginPath();
  ctx.ellipse(0, 34, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e6c3a5";
  ctx.beginPath();
  ctx.arc(0, -14, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = coatColor;
  round(-9, -6, 18, 28, 4, true);

  ctx.fillStyle = accentColor;
  round(-6, -2, 12, 10, 3, true);

  ctx.strokeStyle = "#2c2c2c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-4, 22);
  ctx.lineTo(-5, 36);
  ctx.moveTo(4, 22);
  ctx.lineTo(5, 36);
  ctx.stroke();

  ctx.restore();
}
