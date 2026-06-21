// Trzy czytelne pasy i bezpieczny spawn w mini-grze z humbakiem.
(() => {
  const laneFractions = [0.22, 0.5, 0.78];

  function bonusLaneX(lane) {
    return state.width * laneFractions[lane];
  }

  function safeObstacleLane(y) {
    const lanes = [0, 1, 2];
    const blocked = new Set();
    for (const obstacle of bonusPracu) {
      if (Math.abs(obstacle.y - y) < 150 && Number.isInteger(obstacle.lane)) blocked.add(obstacle.lane);
    }
    const available = lanes.filter((lane) => !blocked.has(lane));
    if (available.length <= 1 && blocked.size >= 2) return null;
    const pool = available.length ? available : lanes;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  spawnBonusLeaf = function spawnLaneBonusLeaf(initial = false) {
    const lane = Math.floor(rand(0, 3));
    bonusLeaves.push({
      lane,
      x: bonusLaneX(lane),
      y: initial ? rand(-state.height * .7, state.height * .52) : rand(-260, -60),
      size: rand(20, 30),
      spin: rand(0, Math.PI * 2),
      fall: rand(2.4, 4.1),
      drift: 0,
      _cuteVariant: Math.random() < .10 ? "gold" : "normal",
    });
  };

  spawnBonusPracu = function spawnLaneBonusPracu(initial = false) {
    const y = initial ? rand(-state.height * .95, state.height * .34) : rand(-360, -110);
    const lane = safeObstacleLane(y);
    if (lane === null) {
      spawnBonusLeaf(initial);
      return;
    }
    const laneWidth = state.width * .24;
    bonusPracu.push({
      lane,
      x: bonusLaneX(lane),
      y,
      width: clamp(laneWidth * .72, 92, 128),
      height: 34,
      wave: rand(0, Math.PI * 2),
      fall: rand(2.8, 4.8),
      drift: 0,
    });
  };

  const previousDrawBonus = drawBonus;
  drawBonus = function drawThreeLaneBonus() {
    drawBonusLaneGuides();
    previousDrawBonus();
    drawBonusWarnings();
  };

  function drawBonusLaneGuides() {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.24)";
    ctx.lineWidth = 2;
    [0.36, 0.64].forEach((fraction) => {
      ctx.beginPath();
      ctx.moveTo(state.width * fraction, 48);
      ctx.lineTo(state.width * fraction, state.height - 90);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawBonusWarnings() {
    ctx.save();
    for (const obstacle of bonusPracu) {
      if (obstacle.y > 36 || obstacle.y < -170) continue;
      const pulse = 1 + Math.sin(state.time * .018 + obstacle.wave) * .15;
      ctx.translate(0, 0);
      ctx.fillStyle = "rgba(255,214,90,.92)";
      ctx.beginPath();
      ctx.moveTo(obstacle.x, 18 - 12 * pulse);
      ctx.lineTo(obstacle.x - 12 * pulse, 18 + 10 * pulse);
      ctx.lineTo(obstacle.x + 12 * pulse, 18 + 10 * pulse);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#2a1f2d";
      ctx.font = "900 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("!", obstacle.x, 21);
    }
    ctx.restore();
  }
})();
