// Poprawki wizualne Sowa3: supermarket jak polski dyskont i blokowisko z wielkiej płyty.
// Plik nadpisuje tylko renderowanie tła/scenerii, bez zmian w mechanice gry.

const originalSowa3DrawScene = drawScene;

drawScene = function polishedSowa3DrawScene() {
  if (state.stage === 0) {
    drawDiscountMarketScene();
    return;
  }
  if (state.stage === 2) {
    drawPrlEstateScene();
    return;
  }
  originalSowa3DrawScene();
};

function drawDiscountMarketScene() {
  const w = state.w;
  const h = state.h;
  const horizon = h * 0.23;
  const bottom = h - 48;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#f0dfd1");
  bg.addColorStop(0.27, "#fff7e8");
  bg.addColorStop(1, "#e3d7c8");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  drawMarketCeiling(w, h, horizon);
  drawMarketShelves(w, h, horizon, bottom);
  drawMarketPromos(w, h, horizon);
  drawMarketStacks(w, h, bottom);
  drawMarketFloor(w, h, horizon, bottom);
}

function drawMarketCeiling(w, h, horizon) {
  ctx.fillStyle = "#c9a995";
  ctx.fillRect(0, 0, w, horizon + 10);

  ctx.strokeStyle = "rgba(92,70,58,.28)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i += 1) {
    const x = (i / 11) * w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(w / 2 + (x - w / 2) * 0.18, horizon + 8);
    ctx.stroke();
  }
  for (let y = 18; y < horizon; y += 26) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + 4);
    ctx.stroke();
  }

  drawFluorescentLine(w * 0.12, 0, w * 0.43, horizon + 6, 4);
  drawFluorescentLine(w * 0.88, 0, w * 0.57, horizon + 6, 4);
  drawFluorescentLine(w * 0.50, 0, w * 0.50, horizon + 2, 5);
}

function drawFluorescentLine(x1, y1, x2, y2, widthPx) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.92)";
  ctx.lineWidth = widthPx;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.28)";
  ctx.lineWidth = widthPx + 7;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawMarketShelves(w, h, horizon, bottom) {
  drawShelfWall(true, w, h, horizon, bottom);
  drawShelfWall(false, w, h, horizon, bottom);
}

function drawShelfWall(left, w, h, horizon, bottom) {
  const side = left ? -1 : 1;
  const nearInner = w / 2 + side * w * 0.36;
  const nearOuter = left ? 0 : w;
  const farInner = w / 2 + side * w * 0.075;
  const farOuter = w / 2 + side * w * 0.24;

  ctx.fillStyle = "#25222a";
  path([[farOuter, horizon + 8], [farInner, horizon + 36], [nearInner, bottom - 54], [nearOuter, bottom - 10]], true);

  ctx.fillStyle = "#f45a21";
  path([[farOuter, horizon + 6], [farInner, horizon + 20], [nearInner, bottom - 82], [nearOuter, bottom - 48]], true);

  const rows = 6;
  for (let r = 0; r < rows; r += 1) {
    const z0 = r / rows;
    const z1 = (r + 0.72) / rows;
    const yA = horizon + 34 + z0 * (bottom - horizon - 86);
    const yB = horizon + 34 + z1 * (bottom - horizon - 86);
    const innerA = farInner + (nearInner - farInner) * z0;
    const outerA = farOuter + (nearOuter - farOuter) * z0;
    const innerB = farInner + (nearInner - farInner) * z1;
    const outerB = farOuter + (nearOuter - farOuter) * z1;

    ctx.fillStyle = r % 2 ? "#5e3b31" : "#704236";
    path([[outerA, yA], [innerA, yA + 6], [innerB, yB], [outerB, yB + 4]], true);

    const items = 8;
    for (let i = 0; i < items; i += 1) {
      const t = i / items;
      const xa = outerA + (innerA - outerA) * t;
      const xb = outerB + (innerB - outerB) * t;
      const x = xa + (xb - xa) * 0.6;
      const y = yA + (yB - yA) * 0.62;
      const size = 8 + z0 * 16;
      ctx.fillStyle = ["#fff3b0", "#e8453c", "#8bdc6a", "#5aa6ff", "#f5f5f5"][i % 5];
      round(x - size * 0.45, y - size * 0.6, size, size * 1.15, Math.max(2, size * 0.12), true);
    }

    if (r % 2 === 0) {
      ctx.fillStyle = "#ff6a28";
      const labelX = outerB + (innerB - outerB) * 0.22;
      round(labelX - 18, yB - 10, 36, 18, 4, true);
      ctx.fillStyle = "#1d1a1f";
      ctx.font = `bold ${Math.max(7, 10 * unit())}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("-30%", labelX, yB + 3);
    }
  }
}

function drawMarketPromos(w, h, horizon) {
  drawSuperCenaSign(w * 0.64, horizon - 72, 142 * unit(), 70 * unit());
  drawSuperCenaSign(w * 0.48, horizon - 28, 70 * unit(), 36 * unit(), 0.72);
  drawHangingPrice(w * 0.72, horizon + 55, "2⁹⁹");
  drawHangingPrice(w * 0.30, horizon + 78, "6⁹⁹");
}

function drawSuperCenaSign(x, y, w, h, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#1e1b22";
  round(x - w / 2, y, w, h, 4, true);
  ctx.fillStyle = "#ff6428";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${Math.max(14, h * 0.31)}px sans-serif`;
  ctx.fillText("SUPER", x, y + h * 0.34);
  ctx.fillText("CENA!", x, y + h * 0.68);
  ctx.restore();
}

function drawHangingPrice(x, y, price) {
  ctx.strokeStyle = "rgba(0,0,0,.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 52);
  ctx.lineTo(x, y - 10);
  ctx.stroke();
  ctx.fillStyle = "#ff6a28";
  round(x - 30, y - 10, 60, 36, 5, true);
  ctx.fillStyle = "#1f1b1e";
  ctx.textAlign = "center";
  ctx.font = `900 ${18 * unit()}px sans-serif`;
  ctx.fillText(price, x, y + 14);
}

function drawMarketStacks(w, h, bottom) {
  drawProductStack(w * 0.18, bottom - 88, 0.95, ["#fff0b5", "#e84235", "#5aa6ff"]);
  drawProductStack(w * 0.80, bottom - 94, 1.05, ["#ffd33d", "#52b35f", "#ed5b2a"]);
  drawProductStack(w * 0.64, bottom - 126, 0.74, ["#ffcd3a", "#e84235", "#1e1b22"]);
}

function drawProductStack(x, y, scale, colors) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4 - Math.floor(row / 2); col += 1) {
      const bx = (col - 1.5) * 34 + row * 4;
      const by = -row * 23;
      ctx.fillStyle = colors[(row + col) % colors.length];
      round(bx, by, 30, 22, 4, true);
      ctx.fillStyle = "rgba(255,255,255,.35)";
      ctx.fillRect(bx + 5, by + 5, 20, 5);
    }
  }
  ctx.restore();
}

function drawMarketFloor(w, h, horizon, bottom) {
  const leftTop = w * 0.43;
  const rightTop = w * 0.57;
  const leftBottom = w * 0.07;
  const rightBottom = w * 0.93;

  ctx.fillStyle = "rgba(232,220,205,.94)";
  path([[leftTop, horizon], [rightTop, horizon], [rightBottom, bottom], [leftBottom, bottom]], true);

  ctx.strokeStyle = "rgba(118,105,96,.32)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 11; i += 1) {
    const z = i / 10;
    const y = roadY(1 - z);
    ctx.beginPath();
    ctx.moveTo(w * 0.12, y);
    ctx.lineTo(w * 0.88, y);
    ctx.stroke();
  }
  for (let i = -6; i <= 6; i += 1) {
    const xb = w / 2 + i * w * 0.075;
    ctx.beginPath();
    ctx.moveTo(w / 2 + i * w * 0.01, horizon);
    ctx.lineTo(xb, bottom);
    ctx.stroke();
  }

  drawLaneGuides(w, horizon, bottom, "rgba(255,255,255,.85)");
}

function drawPrlEstateScene() {
  const w = state.w;
  const h = state.h;
  const horizon = h * 0.25;
  const bottom = h - 48;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#d8e1ea");
  bg.addColorStop(0.45, "#eef0ec");
  bg.addColorStop(1, "#c6c0b6");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  drawBirds(w, h);
  drawPrlBlock(w * 0.18, h * 0.13, w * 0.22, h * 0.45, "#b6b0a6", "#8d8175");
  drawPrlBlock(w * 0.43, h * 0.08, w * 0.30, h * 0.55, "#c3aa86", "#8e735a");
  drawPrlBlock(w * 0.70, h * 0.16, w * 0.22, h * 0.42, "#aab1ae", "#747c7c");

  drawBareTree(w * 0.09, h * 0.58, 1.0);
  drawBareTree(w * 0.84, h * 0.56, 1.25);
  drawPoplar(w * 0.29, h * 0.54, 1.05);

  ctx.fillStyle = "#958f86";
  path([[w * 0.40, horizon], [w * 0.60, horizon], [w * 0.91, bottom], [w * 0.09, bottom]], true);

  ctx.fillStyle = "rgba(120,132,92,.46)";
  path([[0, horizon + 60], [w * 0.35, horizon + 30], [w * 0.10, bottom], [0, bottom]], true);
  path([[w, horizon + 50], [w * 0.65, horizon + 35], [w * 0.90, bottom], [w, bottom]], true);

  drawPaving(w, h, horizon, bottom);
  drawLaneGuides(w, horizon, bottom, "rgba(255,255,255,.62)");
}

function drawPrlBlock(x, y, w, h, wallColor, sideColor) {
  ctx.fillStyle = sideColor;
  path([[x + w * 0.84, y + h * 0.03], [x + w, y + h * 0.11], [x + w, y + h], [x + w * 0.84, y + h * 0.94]], true);
  ctx.fillStyle = wallColor;
  round(x, y, w * 0.86, h, 2, true);

  ctx.fillStyle = "rgba(80,70,64,.12)";
  for (let yy = y + 28; yy < y + h; yy += h / 8) {
    ctx.fillRect(x, yy, w * 0.86, 1);
  }

  const cols = 4;
  const rows = 8;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const wx = x + 14 + c * (w * 0.18);
      const wy = y + 18 + r * (h * 0.105);
      ctx.fillStyle = (r + c) % 5 === 0 ? "#f0df9a" : "#dfe7e8";
      ctx.fillRect(wx, wy, w * 0.08, h * 0.045);
      ctx.strokeStyle = "rgba(70,65,62,.35)";
      ctx.strokeRect(wx, wy, w * 0.08, h * 0.045);
      if (c % 2 === 0) {
        ctx.fillStyle = ["#7d5a55", "#8b8e84", "#6f776f"][r % 3];
        ctx.fillRect(wx - 3, wy + h * 0.045, w * 0.105, h * 0.025);
      }
    }
  }

  ctx.fillStyle = "rgba(92,78,65,.20)";
  ctx.fillRect(x + w * 0.02, y + h * 0.02, w * 0.04, h * 0.92);
}

function drawPaving(w, h, horizon, bottom) {
  ctx.strokeStyle = "rgba(80,74,68,.26)";
  ctx.lineWidth = 1;
  for (let y = horizon + 10; y < bottom; y += 34) {
    ctx.beginPath();
    ctx.moveTo(w * 0.12, y);
    ctx.lineTo(w * 0.88, y + 4);
    ctx.stroke();
  }
  for (let x = w * 0.16; x < w * 0.86; x += w * 0.08) {
    ctx.beginPath();
    ctx.moveTo(w / 2 + (x - w / 2) * 0.08, horizon);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(190,190,184,.55)";
  for (let i = 0; i < 16; i += 1) {
    const x = (i * 97) % w;
    const y = horizon + 40 + ((i * 53) % (bottom - horizon - 60));
    ctx.fillRect(x, y, 16 + (i % 4) * 8, 3);
  }
}

function drawBareTree(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "#302c27";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 85);
  ctx.lineTo(0, 15);
  ctx.stroke();
  drawBranch(0, 24, -28, -44, 3);
  drawBranch(0, 32, 32, -40, 3);
  drawBranch(0, 45, -44, -24, 2);
  drawBranch(0, 50, 46, -18, 2);
  ctx.restore();
}

function drawBranch(x, y, dx, dy, widthPx) {
  ctx.strokeStyle = "rgba(44,40,36,.88)";
  ctx.lineWidth = widthPx;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dx, y + dy);
  ctx.stroke();
  if (widthPx > 1) {
    ctx.lineWidth = widthPx - 1;
    ctx.beginPath();
    ctx.moveTo(x + dx * 0.65, y + dy * 0.65);
    ctx.lineTo(x + dx * 0.95 - 16, y + dy * 0.95 - 14);
    ctx.moveTo(x + dx * 0.70, y + dy * 0.70);
    ctx.lineTo(x + dx * 1.02 + 12, y + dy * 0.92 - 11);
    ctx.stroke();
  }
}

function drawPoplar(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(67,76,57,.46)";
  ctx.beginPath();
  ctx.ellipse(0, -35, 16, 95, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3a342d";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.lineTo(0, -86);
  ctx.stroke();
  ctx.restore();
}

function drawBirds(w, h) {
  ctx.strokeStyle = "rgba(35,35,35,.55)";
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 9; i += 1) {
    const x = w * 0.62 + i * 21;
    const y = h * 0.08 + Math.sin(i) * 19;
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.quadraticCurveTo(x, y - 5, x + 5, y);
    ctx.stroke();
  }
}

function drawLaneGuides(w, horizon, bottom, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  [-0.5, 0.5].forEach((l) => {
    ctx.beginPath();
    ctx.moveTo(w / 2 + l * w * 0.035, horizon);
    ctx.lineTo(w / 2 + l * w * 0.32, bottom);
    ctx.stroke();
  });
}
