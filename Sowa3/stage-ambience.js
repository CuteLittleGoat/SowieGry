// Dodatkowe, wyłącznie boczne lub górne dekoracje plansz Sowa3.
(() => {
  const previousScene = drawScene;

  drawScene = function drawSceneWithSideAmbience() {
    previousScene();
    if (state.stage === 0) drawMarketSideAmbience();
    else if (state.stage === 1) drawFlowerSideAmbience();
    else drawEstateSideAmbience();
  };

  function drawMarketSideAmbience() {
    const w = state.w, h = state.h;
    ctx.save();
    // Automat/piekarnia po lewej stronie.
    ctx.fillStyle = "#5c4035";
    round(8, h * .47, w * .16, h * .29, 9, true);
    ctx.fillStyle = "#f6d28c";
    round(18, h * .51, w * .12, h * .13, 6, true);
    ctx.fillStyle = "#fff4d6";
    ctx.font = `900 ${12 * unit()}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("PIECZYWO", 8 + w * .08, h * .49);
    for (let i = 0; i < 6; i += 1) {
      ctx.fillStyle = i % 2 ? "#c98d4b" : "#e6b869";
      ctx.beginPath();
      ctx.ellipse(30 + (i % 3) * 28, h * .55 + Math.floor(i / 3) * 35, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pracownik z paleciakiem wyłącznie przy prawym brzegu.
    const px = w - 48;
    const py = h * .60;
    ctx.fillStyle = "#294f73";
    round(px - 14, py - 38, 28, 46, 8, true);
    ctx.fillStyle = "#e5b995";
    ctx.beginPath();
    ctx.arc(px, py - 48, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#4d5962";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px - 18, py + 4);
    ctx.lineTo(px - 42, py + 27);
    ctx.lineTo(w - 2, py + 27);
    ctx.stroke();
    ctx.restore();
  }

  function drawFlowerSideAmbience() {
    const w = state.w, h = state.h;
    ctx.save();
    // Boczne wózki pełne roślin.
    drawPlantCart(18, h * .58, 1);
    drawPlantCart(w - 88, h * .62, .92);

    // Delikatne zraszacze tylko z boków.
    ctx.strokeStyle = "rgba(170,235,255,.30)";
    ctx.lineWidth = 2;
    for (let side = 0; side < 2; side += 1) {
      const originX = side === 0 ? 14 : w - 14;
      for (let i = 0; i < 6; i += 1) {
        ctx.beginPath();
        ctx.arc(originX, h * (.32 + i * .07), 35 + i * 8, side === 0 ? -0.7 : Math.PI + .7, side === 0 ? .7 : Math.PI - .7, side !== 0);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawPlantCart(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#626b6d";
    round(0, 0, 72, 18, 5, true);
    ctx.fillStyle = "#30373a";
    ctx.beginPath();
    ctx.arc(14, 22, 7, 0, Math.PI * 2);
    ctx.arc(58, 22, 7, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 5; i += 1) {
      const px = 8 + i * 14;
      ctx.fillStyle = "#9a613b";
      round(px, -12, 12, 13, 3, true);
      ctx.fillStyle = ["#4faf68", "#2d7c3f", "#76bd55"][i % 3];
      ctx.beginPath();
      ctx.ellipse(px + 6, -22, 10, 20, (i - 2) * .16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawEstateSideAmbience() {
    const w = state.w, h = state.h;
    ctx.save();
    // Trzepak i ławka po lewej.
    ctx.strokeStyle = "#596166";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(18, h * .62);
    ctx.lineTo(18, h * .78);
    ctx.moveTo(w * .16, h * .62);
    ctx.lineTo(w * .16, h * .78);
    ctx.moveTo(18, h * .64);
    ctx.lineTo(w * .16, h * .64);
    ctx.stroke();
    ctx.fillStyle = "#72503a";
    round(w - w * .18, h * .71, w * .17, 13, 4, true);
    ctx.fillStyle = "#4e5559";
    ctx.fillRect(w - w * .165, h * .72, 5, 34);
    ctx.fillRect(w - w * .045, h * .72, 5, 34);

    // Kot wysoko na prawym balkonie.
    const catX = w * .88, catY = h * .25;
    ctx.fillStyle = "#6b584a";
    ctx.beginPath();
    ctx.ellipse(catX, catY, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(catX - 8, catY - 13);
    ctx.lineTo(catX - 4, catY - 25);
    ctx.lineTo(catX, catY - 13);
    ctx.moveTo(catX + 2, catY - 13);
    ctx.lineTo(catX + 7, catY - 25);
    ctx.lineTo(catX + 10, catY - 12);
    ctx.fill();
    ctx.strokeStyle = "#6b584a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(catX + 12, catY + 5, 14, -1.2, 1.4);
    ctx.stroke();

    // Gołębie jedynie wysoko.
    ctx.strokeStyle = "rgba(45,48,52,.55)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i += 1) {
      const bx = w * .10 + i * w * .10;
      const by = h * .08 + Math.sin(state.time * .001 + i) * 12;
      ctx.beginPath();
      ctx.moveTo(bx - 7, by);
      ctx.quadraticCurveTo(bx, by - 7, bx + 7, by);
      ctx.stroke();
    }
    ctx.restore();
  }
})();
