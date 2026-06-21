// Boczne, urocze detale finału działki: koza na leżaku i grill.
(() => {
  const baseDrawAllotment = drawAllotment;

  drawAllotment = function drawAllotmentWithCuteDetails() {
    baseDrawAllotment();
    drawLoungingGoat();
    drawSideGrill();
  };

  function drawLoungingGoat() {
    const w = state.w, h = state.h;
    const x = w * .13, y = h * .76;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-.16);
    ctx.fillStyle = "#f4d76e";
    round(-48, 8, 96, 16, 7, true);
    ctx.strokeStyle = "#6b584a";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-38, 24); ctx.lineTo(-28, 58);
    ctx.moveTo(38, 24); ctx.lineTo(28, 58);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    round(-29, -14, 58, 31, 13, true);
    round(18, -25, 30, 25, 11, true);
    ctx.strokeStyle = "#9b9b9b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(27, -24); ctx.lineTo(21, -38);
    ctx.moveTo(38, -24); ctx.lineTo(45, -38);
    ctx.stroke();
    ctx.fillStyle = "#26242c";
    ctx.beginPath();
    ctx.arc(28, -14, 2.5, 0, Math.PI * 2);
    ctx.arc(39, -14, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSideGrill() {
    const w = state.w, h = state.h;
    const x = w * .88, y = h * .76;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#383b3e";
    ctx.beginPath();
    ctx.ellipse(0, 0, 42, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#26282a";
    ctx.fillRect(-24, -5, 48, 9);
    ctx.strokeStyle = "#4b4f52";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-14, 8); ctx.lineTo(-22, 52);
    ctx.moveTo(14, 8); ctx.lineTo(22, 52);
    ctx.stroke();
    ctx.fillStyle = "rgba(235,235,235,.42)";
    for (let i = 0; i < 4; i += 1) {
      const drift = Math.sin(state.time * .002 + i) * 5;
      ctx.beginPath();
      ctx.arc(-8 + i * 6 + drift, -24 - i * 12, 7 + i, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
})();
