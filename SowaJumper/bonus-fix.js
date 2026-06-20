// Poprawka mini-gry z humbakiem dla SowaJumper.
// Zmienia bonus na układ, w którym obiekty spadają z góry na dół,
// a gracz realnie omija przeszkody ruchem lewo/prawo.

startBonus = function fixedStartBonus() {
  state.scene = "bonus";
  state.bonusTime = state.bonusDuration;
  state.bonusScore = 0;
  state.message = "Humbakowy bonus!";
  state.messageUntil = now() + 1400;

  bonusLeaves.length = 0;
  bonusPracu.length = 0;
  particles.length = 0;

  owl.x = state.width * 0.5;
  owl.y = state.height * 0.76;
  owl.vx = 0;
  owl.vy = 0;

  for (let i = 0; i < 9; i += 1) spawnBonusLeaf(true);
  for (let i = 0; i < 5; i += 1) spawnBonusPracu(true);
};

spawnBonusLeaf = function fixedSpawnBonusLeaf(initial = false) {
  bonusLeaves.push({
    x: rand(36, state.width - 36),
    y: initial ? rand(-state.height * 0.70, state.height * 0.52) : rand(-260, -60),
    size: rand(20, 30),
    spin: rand(0, Math.PI * 2),
    fall: rand(2.4, 4.1),
    drift: rand(-0.55, 0.55),
  });
};

spawnBonusPracu = function fixedSpawnBonusPracu(initial = false) {
  bonusPracu.push({
    x: rand(76, state.width - 76),
    y: initial ? rand(-state.height * 0.95, state.height * 0.34) : rand(-360, -110),
    width: 116,
    height: 34,
    wave: rand(0, Math.PI * 2),
    fall: rand(2.8, 4.8),
    drift: rand(-0.35, 0.35),
  });
};

updateBonus = function fixedUpdateBonus(delta) {
  state.bonusTime -= delta / 1000;

  const move = clamp(state.width * 0.0105, 4.7, 8.2);
  if (input.left) owl.x -= move;
  if (input.right) owl.x += move;
  owl.x = clamp(owl.x, 30, state.width - 30);
  owl.y = state.height * 0.76 + Math.sin(state.time / 320) * 8;

  const difficultyFall = 1 + (state.bonusDuration - state.bonusTime) * 0.045;

  for (let i = bonusLeaves.length - 1; i >= 0; i -= 1) {
    const l = bonusLeaves[i];
    l.y += l.fall * difficultyFall;
    l.x += l.drift + Math.sin(state.time / 470 + l.spin) * 0.18;
    l.x = clamp(l.x, 28, state.width - 28);
    l.spin += 0.05;

    if (Math.hypot(owl.x - l.x, owl.y - l.y) < owl.radius + l.size * 0.82) {
      state.bonusScore += 35;
      state.score += 35;
      addParticles(l.x, l.y, 10, "+35");
      bonusLeaves.splice(i, 1);
      spawnBonusLeaf(false);
    } else if (l.y > state.height + 70) {
      bonusLeaves.splice(i, 1);
      spawnBonusLeaf(false);
    }
  }

  for (let i = bonusPracu.length - 1; i >= 0; i -= 1) {
    const p = bonusPracu[i];
    p.y += p.fall * difficultyFall;
    p.x += p.drift + Math.sin(state.time / 360 + p.wave) * 0.32;
    p.x = clamp(p.x, 62, state.width - 62);

    if (circleRect(owl.x, owl.y, owl.radius, p.x - p.width / 2, p.y - p.height / 2, p.width, p.height)) {
      state.bonusScore = Math.max(0, state.bonusScore - 25);
      state.score = Math.max(0, state.score - 25);
      state.shake = 10;
      addParticles(owl.x, owl.y, 10, "-25");
      bonusPracu.splice(i, 1);
      spawnBonusPracu(false);
    } else if (p.y > state.height + 70) {
      bonusPracu.splice(i, 1);
      spawnBonusPracu(false);
    }
  }

  updateParticles(delta);
  updateAmbient(delta);
  updateHud();

  if (state.bonusTime <= 0) {
    state.scene = "playing";
    owl.y = state.cameraY + state.height * 0.44;
    owl.vy = -state.amicPower * 0.85;
    state.message = `Bonus: +${state.bonusScore} pkt`;
    state.messageUntil = now() + 1600;
    state.invincibleUntil = now() + 1400;
  }
};

drawBonus = function fixedDrawBonus() {
  ctx.save();
  ctx.fillStyle = "rgba(95, 190, 230, 0.16)";
  ctx.fillRect(0, 0, state.width, state.height);

  for (let i = 0; i < 6; i += 1) {
    const y = ((state.time * 0.07 + i * 92) % (state.height + 120)) - 80;
    ctx.strokeStyle = "rgba(255,255,255,0.48)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(state.width * 0.25, y + 22, state.width * 0.75, y - 22, state.width, y + 6);
    ctx.stroke();
  }
  ctx.restore();

  drawWhale(state.width * 0.5, state.height * 0.88 + Math.sin(state.time / 450) * 8, 68);

  for (const l of bonusLeaves) drawMonstera(l.x, l.y, l.size, l.spin);
  for (const p of bonusPracu) drawPracu(p.x, p.y, p.width, p.height);
  drawOwl(owl.x, owl.y, owl.radius, false);

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.80)";
  roundRect(18, state.height - 74, state.width - 36, 46, 18, true);
  ctx.fillStyle = "#2a1f2d";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 18px 'Baloo 2', sans-serif";
  ctx.fillText(`Humbakowy bonus: ${Math.ceil(state.bonusTime)} s  •  +${state.bonusScore} pkt`, state.width / 2, state.height - 51);
  ctx.restore();
};
