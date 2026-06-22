// Czwarta plansza Sowa3: stacja paliw Amic.
// Moduł dodaje scenografię, spawny i wygląd przeszkód bez przebudowy bazowego silnika.
(() => {
  "use strict";

  const AMIC_STAGE_INDEX = 3;
  const core = window.SowieCore;

  if (!STAGES.some((stage) => stage.short === "Amic")) {
    STAGES.push({
      name: "Stacja paliw Amic",
      short: "Amic",
      sky: ["#8fc9e8", "#f4f7ef"],
      floor: "#777c78",
      accent: "#39a949",
      length: 1220,
    });
  }

  const previousChooseSpawnType = chooseSowa3BaseSpawnType;
  chooseSowa3BaseSpawnType = function chooseAmicStageSpawnType() {
    if (state.stage !== AMIC_STAGE_INDEX) return previousChooseSpawnType();

    const difficulty = sowa3ActiveDifficulty();
    if (Math.random() < difficulty.obstacleSkip) return "leaf";

    const roll = Math.random();
    if (roll < 0.28) return "leaf";
    if (roll < 0.56) return "amic";   // dystrybutor paliwa
    if (roll < 0.80) return "cart";   // samochód
    return "block";                   // worki ze śmieciami
  };

  const previousLabelFor = labelFor;
  labelFor = function labelForAmicStage(type) {
    if (state.stage === AMIC_STAGE_INDEX) {
      if (type === "amic") return "Dystrybutor paliwa blokuje tor!";
      if (type === "cart") return "Samochód na podjeździe!";
      if (type === "block") return "Worki ze śmieciami!";
    }
    return previousLabelFor(type);
  };

  const previousDrawScene = drawScene;
  drawScene = function drawSceneWithAmicStation() {
    if (state.stage === AMIC_STAGE_INDEX) {
      drawAmicStationScene();
      return;
    }
    previousDrawScene();
  };

  const previousDrawAmic = drawAmic;
  drawAmic = function drawAmicObstacle(x, y, scale) {
    if (state.stage === AMIC_STAGE_INDEX) {
      drawAmicFuelPump(x, y, scale);
      return;
    }
    drawRecoloredAmicStation(x, y, scale);
  };

  const previousDrawCart = drawCart;
  drawCart = function drawAmicStageCar(x, y, scale) {
    if (state.stage === AMIC_STAGE_INDEX) {
      drawFuelStationCar(x, y, scale);
      return;
    }
    previousDrawCart(x, y, scale);
  };

  const previousDrawBlock = drawBlock;
  drawBlock = function drawAmicStageTrash(x, y, scale) {
    if (state.stage === AMIC_STAGE_INDEX) {
      drawTrashBags(x, y, scale);
      return;
    }
    previousDrawBlock(x, y, scale);
  };

  const previousNextStage = nextStage;
  nextStage = function nextStageWithAmicMusic() {
    previousNextStage();
    if (state.stage === AMIC_STAGE_INDEX) core?.startMusic("market");
  };

  const previousDrawOverlay = drawOverlay;
  drawOverlay = function drawOverlayWithFourStages() {
    previousDrawOverlay();
    if (state.mode !== "title" && state.mode !== "over") return;

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.94)";
    ctx.fillRect(0, state.h * .535, state.w, state.h * .145);
    ctx.fillStyle = "#2b2733";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `${14 * unit()}px sans-serif`;
    ctx.fillText("Przeszkody zależą od planszy: m.in. telefony, palety, auta i dystrybutory.", state.w / 2, state.h * .58);
    ctx.fillText("Plansze: supermarket, wystawa kwiatów, blokowisko PRL i stacja paliw Amic.", state.w / 2, state.h * .635);
    ctx.restore();
  };

  function drawAmicStationScene() {
    const w = state.w;
    const h = state.h;
    const horizon = h * 0.23;
    const bottom = h - 48;

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#8fc9e8");
    sky.addColorStop(0.34, "#dcecf1");
    sky.addColorStop(1, "#d8d6ce");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    drawAmicTreeLine(w, horizon);
    drawAmicShop(w, h, horizon);
    drawAmicCanopy(w, h, horizon);
    drawAmicBackgroundPumps(w, h, horizon);
    drawAmicForecourt(w, horizon, bottom);
    drawAmicSideDetails(w, h, bottom);
  }

  function drawAmicTreeLine(w, horizon) {
    ctx.fillStyle = "#78946f";
    ctx.fillRect(0, horizon - 18, w, 42);
    for (let i = 0; i < 18; i += 1) {
      const x = i * (w / 17);
      const radius = 15 + (i % 4) * 5;
      ctx.fillStyle = i % 3 === 0 ? "#6f8f67" : i % 3 === 1 ? "#829c72" : "#5f805f";
      ctx.beginPath();
      ctx.arc(x, horizon - 22 - (i % 3) * 7, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawAmicShop(w, h, horizon) {
    const x = w * .02;
    const y = horizon - h * .045;
    const shopW = w * .31;
    const shopH = h * .24;

    ctx.fillStyle = "#cfd7d7";
    round(x, y, shopW, shopH, 5, true);
    ctx.fillStyle = "#9db2bd";
    path([[x, y], [x + shopW, y], [x + shopW * .90, y - 22], [x + shopW * .08, y - 22]], true);

    ctx.fillStyle = "#41525a";
    round(x + shopW * .08, y + shopH * .34, shopW * .34, shopH * .54, 3, true);
    round(x + shopW * .49, y + shopH * .34, shopW * .39, shopH * .54, 3, true);
    ctx.fillStyle = "rgba(183,228,245,.52)";
    ctx.fillRect(x + shopW * .11, y + shopH * .38, shopW * .28, shopH * .32);
    ctx.fillRect(x + shopW * .52, y + shopH * .38, shopW * .33, shopH * .32);

    ctx.fillStyle = "#ffffff";
    round(x + shopW * .22, y + 8, shopW * .58, 37, 8, true);
    drawAmicLogo(x + shopW * .31, y + 26, 0.48);
    ctx.fillStyle = "#d62f3d";
    ctx.font = `900 ${15 * unit()}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("amic", x + shopW * .39, y + 26);
    ctx.fillStyle = "#42534b";
    ctx.font = `bold ${7 * unit()}px sans-serif`;
    ctx.fillText("MARKET", x + shopW * .39, y + 37);
  }

  function drawAmicCanopy(w, h, horizon) {
    const x = w * .25;
    const y = horizon - h * .09;
    const canopyW = w * .73;
    const canopyH = h * .075;

    ctx.fillStyle = "rgba(0,0,0,.14)";
    path([[x + 10, y + canopyH], [x + canopyW, y + canopyH], [x + canopyW - 28, y + canopyH + 15], [x + 30, y + canopyH + 15]], true);

    ctx.fillStyle = "#ffffff";
    round(x, y, canopyW, canopyH, 4, true);
    ctx.fillStyle = "#35a84b";
    ctx.fillRect(x, y + canopyH - 12, canopyW, 12);
    ctx.fillStyle = "#56b94d";
    path([[x + canopyW * .68, y], [x + canopyW, y], [x + canopyW, y + canopyH], [x + canopyW * .57, y + canopyH]], true);
    ctx.fillStyle = "#f3d443";
    path([[x + canopyW * .61, y], [x + canopyW * .66, y], [x + canopyW * .54, y + canopyH], [x + canopyW * .49, y + canopyH]], true);

    drawAmicLogo(x + 42, y + canopyH * .45, 0.72);
    ctx.fillStyle = "#d62f3d";
    ctx.font = `900 ${21 * unit()}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("amic", x + 67, y + canopyH * .45);
    ctx.fillStyle = "#4b564f";
    ctx.font = `bold ${8 * unit()}px sans-serif`;
    ctx.fillText("ENERGY", x + 117, y + canopyH * .49);

    const columns = [x + canopyW * .16, x + canopyW * .46, x + canopyW * .77];
    for (const columnX of columns) {
      ctx.fillStyle = "#f3f5f3";
      round(columnX - 9, y + canopyH, 18, h * .235, 3, true);
      ctx.fillStyle = "#35a84b";
      ctx.fillRect(columnX - 9, y + canopyH + h * .14, 18, 14);
      ctx.fillStyle = "#d62f3d";
      ctx.fillRect(columnX + 5, y + canopyH + 8, 4, h * .20);
    }
  }

  function drawAmicBackgroundPumps(w, h, horizon) {
    drawSmallBackgroundPump(w * .39, horizon + h * .10, .52);
    drawSmallBackgroundPump(w * .60, horizon + h * .115, .48);
    drawSmallBackgroundPump(w * .82, horizon + h * .10, .52);
  }

  function drawSmallBackgroundPump(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#f6f6f4";
    round(-24, -28, 48, 64, 5, true);
    ctx.fillStyle = "#29363a";
    round(-15, -18, 30, 20, 3, true);
    ctx.fillStyle = "#35a84b";
    ctx.fillRect(-24, 15, 48, 11);
    ctx.fillStyle = "#d62f3d";
    ctx.fillRect(15, -28, 6, 64);
    ctx.restore();
  }

  function drawAmicForecourt(w, horizon, bottom) {
    const asphalt = ctx.createLinearGradient(0, horizon, 0, bottom);
    asphalt.addColorStop(0, "#9a9d98");
    asphalt.addColorStop(1, "#666b68");
    ctx.fillStyle = asphalt;
    path([[w * .405, horizon], [w * .595, horizon], [w * .945, bottom], [w * .055, bottom]], true);

    ctx.strokeStyle = "rgba(255,255,255,.40)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 10; i += 1) {
      const t = i / 10;
      const eased = t * t;
      const y = horizon + (bottom - horizon) * eased;
      const left = w * .405 + (w * .055 - w * .405) * eased;
      const right = w * .595 + (w * .945 - w * .595) * eased;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(255,255,255,.86)";
    ctx.lineWidth = 2;
    [-.5, .5].forEach((lane) => {
      ctx.beginPath();
      ctx.moveTo(w / 2 + lane * w * .035, horizon);
      ctx.lineTo(w / 2 + lane * w * .32, bottom);
      ctx.stroke();
    });

    ctx.fillStyle = "rgba(255,255,255,.76)";
    path([[w * .15, bottom - 42], [w * .28, bottom - 42], [w * .34, bottom - 34], [w * .28, bottom - 26], [w * .15, bottom - 26]], true);
    path([[w * .85, bottom - 42], [w * .72, bottom - 42], [w * .66, bottom - 34], [w * .72, bottom - 26], [w * .85, bottom - 26]], true);
  }

  function drawAmicSideDetails(w, h, bottom) {
    ctx.fillStyle = "#d8d03e";
    round(5, h * .61, 14, h * .16, 5, true);
    round(w - 19, h * .61, 14, h * .16, 5, true);

    ctx.fillStyle = "#53595a";
    round(w * .04, bottom - 76, 42, 50, 5, true);
    ctx.fillStyle = "#202526";
    ctx.fillRect(w * .04 + 6, bottom - 66, 30, 8);

    ctx.fillStyle = "#5f8758";
    for (let i = 0; i < 4; i += 1) {
      const x = w * (.88 + i * .025);
      ctx.beginPath();
      ctx.ellipse(x, bottom - 82 - (i % 2) * 6, 13, 31, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawAmicLogo(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e32f3f";
    ctx.beginPath();
    ctx.arc(0, 0, 16, -Math.PI * .35, Math.PI * .33);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f1d43d";
    ctx.beginPath();
    ctx.arc(0, 0, 16, Math.PI * .33, Math.PI * .98);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2fa84a";
    ctx.beginPath();
    ctx.arc(0, 0, 16, Math.PI * .98, Math.PI * 1.65);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawRecoloredAmicStation(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = "rgba(0,0,0,.25)";
    ellipse(0, 46, 86, 13);

    ctx.fillStyle = "#f7f8f6";
    round(-44, -30, 88, 70, 9, true);
    ctx.fillStyle = "#35a84b";
    ctx.fillRect(-44, 18, 88, 13);
    ctx.fillStyle = "#d62f3d";
    ctx.fillRect(31, -30, 7, 70);

    ctx.fillStyle = "#ffffff";
    round(-54, -52, 108, 24, 7, true);
    ctx.fillStyle = "#35a84b";
    ctx.fillRect(-54, -35, 108, 7);
    ctx.fillStyle = "#f0d43f";
    path([[18, -52], [32, -52], [18, -28], [4, -28]], true);

    drawAmicLogo(-29, -40, .56);
    ctx.fillStyle = "#d62f3d";
    ctx.font = "900 16px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("amic", -12, -40);

    ctx.fillStyle = "#273337";
    round(-25, -17, 50, 26, 4, true);
    ctx.fillStyle = "#e9f3ee";
    ctx.fillRect(-17, -10, 20, 9);
    ctx.restore();
  }

  function drawAmicFuelPump(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = "rgba(0,0,0,.28)";
    ellipse(0, 52, 70, 12);

    ctx.fillStyle = "#f5f6f4";
    round(-31, -55, 62, 101, 8, true);
    ctx.fillStyle = "#35a84b";
    ctx.fillRect(-31, 21, 62, 16);
    ctx.fillStyle = "#d62f3d";
    ctx.fillRect(22, -55, 7, 101);

    ctx.fillStyle = "#263337";
    round(-21, -40, 42, 29, 4, true);
    ctx.fillStyle = "#a9d5ce";
    ctx.fillRect(-14, -33, 20, 9);
    ctx.fillStyle = "#ffffff";
    round(-18, -5, 36, 18, 3, true);
    ctx.fillStyle = "#d62f3d";
    ctx.font = "900 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("amic", 0, 4);

    ctx.strokeStyle = "#1d2426";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-31, -25);
    ctx.bezierCurveTo(-52, -20, -48, 17, -37, 27);
    ctx.stroke();
    ctx.fillStyle = "#1d2426";
    round(-43, 20, 12, 25, 3, true);

    ctx.strokeStyle = "#2a3032";
    ctx.lineWidth = 3;
    ctx.strokeRect(-26, 43, 52, 6);
    ctx.restore();
  }

  function drawFuelStationCar(x, y, scale) {
    ctx.save();
    ctx.translate(x, y + Math.sin(state.time * .006 + x) * 1.5);
    ctx.scale(scale, scale);

    ctx.fillStyle = "rgba(0,0,0,.28)";
    ellipse(0, 47, 86, 13);

    ctx.fillStyle = "#6d7880";
    round(-43, -16, 86, 56, 12, true);
    ctx.fillStyle = "#87949b";
    path([[-29, -16], [-17, -42], [18, -42], [31, -16]], true);
    ctx.fillStyle = "#bfe0e8";
    path([[-22, -18], [-13, -36], [13, -36], [23, -18]], true);

    ctx.fillStyle = "#e9eef0";
    round(-35, 10, 18, 12, 4, true);
    round(17, 10, 18, 12, 4, true);
    ctx.fillStyle = "#202426";
    round(-24, 27, 48, 8, 3, true);
    ctx.fillStyle = "#d8d7c7";
    round(-13, 20, 26, 10, 2, true);

    ctx.fillStyle = "#25292a";
    ellipse(-29, 39, 15, 15);
    ellipse(29, 39, 15, 15);
    ctx.restore();
  }

  function drawTrashBags(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = "rgba(0,0,0,.26)";
    ellipse(0, 43, 78, 12);

    drawBag(-25, 8, 1.00, "#202426");
    drawBag(4, 4, 1.16, "#303638");
    drawBag(30, 13, .86, "#1d2526");
    ctx.fillStyle = "#4b7351";
    round(-43, 27, 22, 13, 4, true);
    ctx.restore();
  }

  function drawBag(x, y, scale, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-18, 28);
    ctx.quadraticCurveTo(-23, 4, -13, -15);
    ctx.quadraticCurveTo(0, -25, 13, -15);
    ctx.quadraticCurveTo(23, 5, 18, 28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -16);
    ctx.lineTo(2, -24);
    ctx.lineTo(10, -15);
    ctx.stroke();
    ctx.restore();
  }
})();
