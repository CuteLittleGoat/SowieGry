// Strefa czytelności Sowa3.
// Wszystkie dekoracje pozostają przy bokach albo nad horyzontem.
// Po narysowaniu scenografii moduł ponownie rysuje czysty korytarz gry,
// zanim zostaną narysowane przeszkody, pickupy i sowa.

const previousSowa3DrawSceneForVisibility = drawScene;

drawScene = function visibilitySafeSowa3DrawScene() {
  previousSowa3DrawSceneForVisibility();
  drawSowa3GameplayCorridor();
};

function drawSowa3GameplayCorridor() {
  const w = state.w;
  const h = state.h;
  const horizon = state.stage === 2 ? h * 0.25 : h * 0.23;
  const bottom = h - 48;

  // Korytarz jest celowo szerszy od trzech torów, aby dekoracje
  // nie stykały się optycznie z przeszkodami ani sową.
  const topLeft = w * 0.405;
  const topRight = w * 0.595;
  const bottomLeft = w * 0.055;
  const bottomRight = w * 0.945;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(topLeft, horizon);
  ctx.lineTo(topRight, horizon);
  ctx.lineTo(bottomRight, bottom);
  ctx.lineTo(bottomLeft, bottom);
  ctx.closePath();
  ctx.clip();

  if (state.stage === 0) drawClearMarketCorridor(w, horizon, bottom);
  else if (state.stage === 1) drawClearExpoCorridor(w, horizon, bottom);
  else drawClearEstateCorridor(w, horizon, bottom);

  ctx.restore();
  drawSafeLaneGuides(w, horizon, bottom);
}

function fillGameplayTrapezoid(w, horizon, bottom, fillStyle) {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(w * 0.405, horizon);
  ctx.lineTo(w * 0.595, horizon);
  ctx.lineTo(w * 0.945, bottom);
  ctx.lineTo(w * 0.055, bottom);
  ctx.closePath();
  ctx.fill();
}

function drawClearMarketCorridor(w, horizon, bottom) {
  const gradient = ctx.createLinearGradient(0, horizon, 0, bottom);
  gradient.addColorStop(0, "#eee5d8");
  gradient.addColorStop(1, "#d8cbbc");
  fillGameplayTrapezoid(w, horizon, bottom, gradient);
  ctx.strokeStyle = "rgba(110,98,88,.28)";
  ctx.lineWidth = 1;
  drawGameplayPerspectiveGrid(w, horizon, bottom, 11, 13);
}

function drawClearExpoCorridor(w, horizon, bottom) {
  const gradient = ctx.createLinearGradient(0, horizon, 0, bottom);
  gradient.addColorStop(0, "#ecebe6");
  gradient.addColorStop(1, "#c9c8c1");
  fillGameplayTrapezoid(w, horizon, bottom, gradient);
  ctx.strokeStyle = "rgba(90,90,86,.20)";
  ctx.lineWidth = 1;
  drawGameplayPerspectiveGrid(w, horizon, bottom, 10, 12);
}

function drawClearEstateCorridor(w, horizon, bottom) {
  const gradient = ctx.createLinearGradient(0, horizon, 0, bottom);
  gradient.addColorStop(0, "#aaa59e");
  gradient.addColorStop(1, "#85817b");
  fillGameplayTrapezoid(w, horizon, bottom, gradient);
  ctx.strokeStyle = "rgba(62,59,55,.24)";
  ctx.lineWidth = 1;
  drawGameplayPerspectiveGrid(w, horizon, bottom, 9, 11);

  // Płaskie pęknięcia nawierzchni nie zasłaniają torów.
  ctx.strokeStyle = "rgba(55,52,48,.18)";
  for (let i = 0; i < 7; i += 1) {
    const y = horizon + (i + 2) * (bottom - horizon) / 10;
    const spread = (y - horizon) / Math.max(1, bottom - horizon);
    const x = w * 0.5 + (i % 2 ? -1 : 1) * w * (0.035 + spread * 0.13);
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 2);
    ctx.lineTo(x, y + 3);
    ctx.lineTo(x + 8, y - 1);
    ctx.stroke();
  }
}

function drawGameplayPerspectiveGrid(w, horizon, bottom, horizontalCount, verticalCount) {
  for (let i = 1; i < horizontalCount; i += 1) {
    const t = i / horizontalCount;
    const eased = t * t;
    const y = horizon + (bottom - horizon) * eased;
    const left = w * 0.405 + (w * 0.055 - w * 0.405) * eased;
    const right = w * 0.595 + (w * 0.945 - w * 0.595) * eased;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }

  for (let i = 1; i < verticalCount; i += 1) {
    const t = i / verticalCount;
    const topX = w * 0.405 + (w * 0.595 - w * 0.405) * t;
    const bottomX = w * 0.055 + (w * 0.945 - w * 0.055) * t;
    ctx.beginPath();
    ctx.moveTo(topX, horizon);
    ctx.lineTo(bottomX, bottom);
    ctx.stroke();
  }
}

function drawSafeLaneGuides(w, horizon, bottom) {
  ctx.strokeStyle = "rgba(255,255,255,.72)";
  ctx.lineWidth = 2;
  [-0.5, 0.5].forEach((lane) => {
    ctx.beginPath();
    ctx.moveTo(w / 2 + lane * w * 0.035, horizon);
    ctx.lineTo(w / 2 + lane * w * 0.32, bottom);
    ctx.stroke();
  });
}
