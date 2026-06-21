// Kompletny pakiet „cute polish” dla SowaJumper.
(() => {
  "use strict";

  const core = window.SowieCore;
  const cute = {
    paused: false,
    combo: 1,
    chain: 0,
    bestCombo: 1,
    nearMisses: 0,
    collectedLeaves: 0,
    feverMs: 0,
    feverSpawnMs: 0,
    feathers: [],
    lastLives: state.lives,
    lastHeight: 0,
    lastRestBand: -1,
    bonusCombo: 1,
    bonusChain: 0,
    lastScene: state.scene,
  };

  const comboCard = document.createElement("div");
  comboCard.className = "hud-card";
  comboCard.innerHTML = `<span class="hud-label">Combo</span><strong id="jumperComboValue" class="hud-value">×1</strong>`;
  document.querySelector(".hud")?.appendChild(comboCard);
  const comboValue = comboCard.querySelector("#jumperComboValue");

  function resetCute() {
    cute.combo = 1;
    cute.chain = 0;
    cute.bestCombo = 1;
    cute.nearMisses = 0;
    cute.collectedLeaves = 0;
    cute.feverMs = 0;
    cute.feverSpawnMs = 0;
    cute.feathers.length = 0;
    cute.lastLives = state.lives;
    cute.lastHeight = 0;
    cute.lastRestBand = -1;
    cute.bonusCombo = 1;
    cute.bonusChain = 0;
    cute.lastScene = state.scene;
    updateComboHud();
  }

  function addCombo(amount = 1) {
    cute.chain += amount;
    const previous = cute.combo;
    cute.combo = cute.chain >= 35 ? 5 : cute.chain >= 22 ? 4 : cute.chain >= 12 ? 3 : cute.chain >= 5 ? 2 : 1;
    cute.bestCombo = Math.max(cute.bestCombo, cute.combo);
    core?.recordStat("maxCombo", cute.bestCombo, "max");
    if (cute.combo !== previous) {
      core?.play("combo");
      core?.toast(`Combo ×${cute.combo}!`);
      if (cute.combo >= 4) core?.progressMission("combo4", 1);
    }
    updateComboHud();
  }

  function resetCombo() {
    cute.combo = 1;
    cute.chain = 0;
    updateComboHud();
  }

  function updateComboHud() {
    if (!comboValue) return;
    comboValue.textContent = `×${cute.combo}`;
    comboValue.style.color = cute.combo >= 4 ? "#d63b75" : "";
  }

  const previousCreatePlatform = createPlatform;
  createPlatform = function cuteCreatePlatform(y, forcedType = null) {
    const platform = previousCreatePlatform(y, forcedType);
    if (forcedType) return platform;
    const meters = getHeightMeters(y);
    const restBand = Math.floor(meters / 150);
    if (meters >= 120 && restBand > cute.lastRestBand) {
      cute.lastRestBand = restBand;
      platform.type = "rest";
      platform.width = clamp(state.width * .52, 180, 310);
      platform.x = state.width / 2 - platform.width / 2;
      platform._cuteRest = true;
      return platform;
    }

    if (platform.type === "normal") {
      const roll = Math.random();
      if (meters > 60 && roll < .10) platform.type = "cushion";
      else if (meters > 120 && roll < .18) platform.type = "cloud";
      else if (meters > 200 && roll < .24) platform.type = "leafpad";
      else if (meters > 90 && roll < .30) platform.type = "balcony";
    }
    return platform;
  };

  const previousSpawnOnPlatform = spawnOnPlatform;
  spawnOnPlatform = function cuteSpawnOnPlatform(platform) {
    if (platform.type === "rest") {
      leaves.push({
        x: platform.x + platform.width / 2,
        y: platform.y - 54,
        size: 25,
        spin: rand(0, Math.PI * 2),
        taken: false,
        _cuteVariant: "gold",
      });
      return;
    }
    previousSpawnOnPlatform(platform);
  };

  function assignLeafVariants() {
    for (const leaf of leaves) {
      if (leaf._cuteVariant) continue;
      const roll = Math.random();
      leaf._cuteVariant = roll < .045 ? "rainbow" : roll < .15 ? "gold" : "normal";
    }
    for (const leaf of bonusLeaves) {
      if (leaf._cuteVariant) continue;
      leaf._cuteVariant = Math.random() < .10 ? "gold" : "normal";
    }
  }

  function snapshotLeaves(list) {
    return list.map((leaf) => ({ leaf, x: leaf.x, y: leaf.y, variant: leaf._cuteVariant || "normal" }));
  }

  function processCollected(before, list, bonus = false) {
    for (const entry of before) {
      if (list.includes(entry.leaf)) continue;
      const close = bonus
        ? Math.hypot(owl.x - entry.x, owl.y - entry.y) < 120
        : Math.hypot(owl.x - entry.x, owl.y - entry.y) < 150;
      if (!close) continue;
      cute.collectedLeaves += 1;
      addCombo(1);
      core?.play("leaf");
      core?.recordStat("leaves", 1);
      core?.progressMission("leaves20", 1);
      if (entry.variant === "gold") {
        const extra = (bonus ? 70 : 55) * cute.combo;
        state.score += extra;
        addParticles(owl.x, owl.y - state.cameraY, 10, `ZŁOTY +${extra}`);
      } else if (entry.variant === "rainbow") {
        state.score += 90 * cute.combo;
        cute.feverMs = 9000;
        core?.toast("Tęczowa monstera! 🌈");
      } else if (cute.combo > 1) {
        state.score += 25 * (cute.combo - 1);
      }
      if (cute.collectedLeaves % 8 === 0) {
        cute.feverMs = 8000;
        core?.toast("Gorączka monster! 🌿");
        core?.play("mission");
      }
    }
  }

  function updateFever(delta) {
    if (cute.feverMs <= 0 || state.scene !== "playing") return;
    cute.feverMs -= delta;
    cute.feverSpawnMs -= delta;
    if (cute.feverSpawnMs <= 0) {
      cute.feverSpawnMs = 700;
      const visible = platforms.filter((platform) => platform.y < state.cameraY + state.height * .8 && platform.y > state.cameraY - state.height * .8);
      const platform = visible[Math.floor(Math.random() * visible.length)];
      if (platform) {
        leaves.push({
          x: platform.x + rand(20, Math.max(24, platform.width - 20)),
          y: platform.y - rand(48, 82),
          size: rand(19, 25),
          spin: rand(0, Math.PI * 2),
          taken: false,
          _cuteVariant: Math.random() < .16 ? "gold" : "normal",
        });
      }
    }
  }

  function processNearMisses() {
    if (state.scene !== "playing") return;
    for (const obstacle of pracuTexts) {
      if (obstacle._cuteNearChecked) continue;
      const verticalPassed = owl.y < obstacle.y - obstacle.height * .7;
      if (!verticalPassed) continue;
      obstacle._cuteNearChecked = true;
      const dx = Math.abs(owl.x - obstacle.x);
      const safeEdge = obstacle.width / 2 + owl.radius;
      if (dx > safeEdge && dx < safeEdge + 40) {
        const bonus = 30 * cute.combo;
        state.score += bonus;
        cute.nearMisses += 1;
        addCombo(2);
        addParticles(owl.x, owl.y - state.cameraY, 10, `O WŁOS +${bonus}`);
        core?.play("near");
        core?.recordStat("nearMisses", 1);
        core?.progressMission("nearMiss3", 1);
      }
    }
  }

  function updateFeathers(delta) {
    if (Math.abs(owl.vx) > 2 && !core?.settings().reducedEffects && Math.random() < delta * .003) {
      cute.feathers.push({ x: owl.x, y: owl.y - state.cameraY + 12, vx: -owl.vx * .25, vy: rand(-.7, .5), life: 560, rot: rand(-1, 1) });
    }
    for (let i = cute.feathers.length - 1; i >= 0; i -= 1) {
      const feather = cute.feathers[i];
      feather.x += feather.vx;
      feather.y += feather.vy;
      feather.life -= delta;
      feather.rot += delta * .002;
      if (feather.life <= 0) cute.feathers.splice(i, 1);
    }
  }

  function detectTransitions(previousLives, previousScene) {
    if (state.lives < previousLives) {
      resetCombo();
      core?.play("hurt");
    } else if (state.lives > previousLives) {
      core?.play("heart");
      core?.recordStat("extraLives", state.lives - previousLives);
      core?.progressMission("extraLife", state.lives - previousLives);
    }
    if (previousScene === "bonus" && state.scene === "playing") {
      core?.play("whale");
      core?.toast(`Humbakowy wynik: +${state.bonusScore} pkt`);
    }
  }

  const previousStartGame = startGame;
  startGame = function cuteJumperStart() {
    previousStartGame();
    resetCute();
    core?.startMusic("jumper");
  };

  const previousUpdateGame = updateGame;
  updateGame = function cuteJumperUpdate(delta) {
    if (cute.paused) return;
    assignLeafVariants();
    const beforeLeaves = snapshotLeaves(leaves);
    const previousLives = state.lives;
    const previousScene = state.scene;
    previousUpdateGame(delta);
    processCollected(beforeLeaves, leaves, false);
    processNearMisses();
    updateFever(delta);
    updateFeathers(delta);
    detectTransitions(previousLives, previousScene);
    core?.recordStat("jumperHeight", state.heightMeters, "max");
    const mission = core?.getProfile().missions.jumper250;
    if (mission && !mission.done) core?.progressMission("jumper250", Math.max(0, state.heightMeters - mission.progress));
    core?.setDebugData({ game: "SowaJumper", scene: state.scene, height: state.heightMeters, platforms: platforms.length, combo: cute.combo, fever: Math.ceil(cute.feverMs / 1000), pracu: pracuTexts.length });
  };

  const previousUpdateBonus = updateBonus;
  updateBonus = function cuteJumperBonus(delta) {
    if (cute.paused) return;
    assignLeafVariants();
    const beforeLeaves = snapshotLeaves(bonusLeaves);
    const previousScene = state.scene;
    previousUpdateBonus(delta);
    processCollected(beforeLeaves, bonusLeaves, true);
    detectTransitions(state.lives, previousScene);
  };

  const previousUpdateTitle = updateTitle;
  updateTitle = function cuteJumperTitle(delta) {
    if (cute.paused) return;
    previousUpdateTitle(delta);
  };

  const previousCollidePlatforms = collidePlatforms;
  collidePlatforms = function cuteJumperLandings() {
    const wasFalling = owl.vy >= 0;
    const beforeY = owl.y;
    previousCollidePlatforms();
    if (!wasFalling || owl.vy >= 0 || beforeY === owl.y) return;
    const platform = platforms.find((item) => Math.abs((item.y - owl.radius) - owl.y) < 3 && owl.x >= item.x - owl.radius && owl.x <= item.x + item.width + owl.radius);
    if (!platform) return;
    const center = platform.x + platform.width / 2;
    if (Math.abs(owl.x - center) < platform.width * .18) {
      const bonus = 18 * cute.combo;
      state.score += bonus;
      addCombo(1);
      core?.play("combo");
      state.message = `Idealne lądowanie! +${bonus}`;
      state.messageUntil = now() + 900;
    }
    if (platform.type === "cushion") {
      owl.vy = -state.jumpPower * 1.35;
      state.message = "Miękka poduszka!";
      state.messageUntil = now() + 900;
    } else if (platform.type === "cloud") {
      owl.vy = -state.jumpPower * 1.12;
    } else if (platform.type === "leafpad") {
      owl.vy = -state.jumpPower * 1.22;
      state.score += 12;
    } else if (platform.type === "rest") {
      owl.vy = -state.jumpPower * .92;
      state.invincibleUntil = now() + 1400;
      core?.toast("Chwila oddechu ☕");
    }
  };

  const previousDrawBackground = drawBackground;
  drawBackground = function cuteJumperBackground() {
    previousDrawBackground();
    const meters = state.heightMeters || getHeightMeters();
    ctx.save();
    if (meters < 100) drawCityZone();
    else if (meters < 250) drawRoofZone();
    else if (meters < 450) drawCloudZone();
    else if (meters < 700) drawNightZone();
    else drawOwlSkyZone();
    ctx.restore();
  };

  function drawCityZone() {
    ctx.globalAlpha = .18;
    ctx.fillStyle = "#6b7e92";
    for (let i = 0; i < 9; i += 1) {
      const x = i * state.width / 8 - 15;
      const h = 70 + (i % 3) * 28;
      ctx.fillRect(x, state.height - h, state.width / 10, h);
    }
  }

  function drawRoofZone() {
    ctx.globalAlpha = .16;
    ctx.fillStyle = "#ad6f5c";
    for (let i = 0; i < 7; i += 1) {
      const x = i * state.width / 6;
      const y = state.height - 55 - (i % 2) * 24;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 42, y - 32);
      ctx.lineTo(x + 84, y);
      ctx.fill();
    }
  }

  function drawCloudZone() {
    ctx.globalAlpha = .12;
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 6; i += 1) ctx.fillRect(0, state.height * (.18 + i * .14), state.width, 18);
  }

  function drawNightZone() {
    ctx.globalAlpha = .28;
    ctx.fillStyle = "#24345f";
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#fff4bd";
    for (let i = 0; i < 35; i += 1) {
      const x = (i * 79) % state.width;
      const y = (i * 47) % state.height;
      ctx.beginPath();
      ctx.arc(x, y, 1.5 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawOwlSkyZone() {
    const rainbow = ctx.createLinearGradient(0, 0, state.width, state.height);
    rainbow.addColorStop(0, "rgba(255,95,130,.10)");
    rainbow.addColorStop(.5, "rgba(255,214,90,.10)");
    rainbow.addColorStop(1, "rgba(79,175,104,.10)");
    ctx.fillStyle = rainbow;
    ctx.fillRect(0, 0, state.width, state.height);
  }

  const previousDrawPlatform = drawPlatform;
  drawPlatform = function cuteDrawPlatform(platform) {
    if (!["cushion", "cloud", "leafpad", "balcony", "rest"].includes(platform.type)) {
      previousDrawPlatform(platform);
      return;
    }
    const y = platform.y - state.cameraY;
    if (y < -120 || y > state.height + 120) return;
    ctx.save();
    if (platform.type === "cloud") {
      ctx.fillStyle = "rgba(255,255,255,.92)";
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        ctx.ellipse(platform.x + platform.width * (i + .5) / 5, y + 5, platform.width / 4.2, 16 + (i % 2) * 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (platform.type === "cushion") {
      ctx.fillStyle = "#ff9fba";
      roundRect(platform.x, y - 3, platform.width, platform.height + 8, 13, true);
      ctx.strokeStyle = "rgba(255,255,255,.65)";
      ctx.lineWidth = 2;
      ctx.strokeRect(platform.x + 12, y + 2, platform.width - 24, platform.height - 2);
    } else if (platform.type === "leafpad") {
      ctx.fillStyle = "#4faf68";
      ctx.beginPath();
      ctx.ellipse(platform.x + platform.width / 2, y + 4, platform.width / 2, 14, -.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2d7c3f";
      ctx.beginPath();
      ctx.moveTo(platform.x + platform.width / 2, y - 8);
      ctx.lineTo(platform.x + platform.width / 2, y + 16);
      ctx.stroke();
    } else if (platform.type === "balcony") {
      ctx.fillStyle = "#b4a99d";
      roundRect(platform.x, y, platform.width, platform.height, 5, true);
      ctx.strokeStyle = "#6e7373";
      ctx.lineWidth = 3;
      for (let bx = platform.x + 8; bx < platform.x + platform.width; bx += 18) {
        ctx.beginPath();
        ctx.moveTo(bx, y - 25);
        ctx.lineTo(bx, y);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(platform.x, y - 24);
      ctx.lineTo(platform.x + platform.width, y - 24);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#f1d59a";
      roundRect(platform.x, y - 2, platform.width, platform.height + 5, 9, true);
      ctx.fillStyle = "#fff";
      roundRect(platform.x + platform.width * .14, y - 34, platform.width * .24, 28, 8, true);
      ctx.fillStyle = "#8a5b3d";
      ctx.fillRect(platform.x + platform.width * .22, y - 27, 5, 13);
      ctx.fillStyle = "#4faf68";
      ctx.beginPath();
      ctx.arc(platform.x + platform.width * .72, y - 16, 13, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const previousDrawWorld = drawWorld;
  drawWorld = function cuteJumperWorld() {
    previousDrawWorld();
    drawLeafAuras();
    drawFeathers();
  };

  function drawLeafAuras() {
    for (const leaf of leaves) {
      if (leaf._cuteVariant === "normal") continue;
      const y = leaf.y - state.cameraY + Math.sin(state.time / 400 + leaf.spin) * 5;
      ctx.save();
      ctx.globalAlpha = .65;
      ctx.strokeStyle = leaf._cuteVariant === "gold" ? "#ffd65a" : `hsl(${(state.time * .08) % 360} 85% 65%)`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(leaf.x, y, leaf.size * 1.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawFeathers() {
    for (const feather of cute.feathers) {
      ctx.save();
      ctx.globalAlpha = clamp(feather.life / 560, 0, 1);
      ctx.translate(feather.x, feather.y);
      ctx.rotate(feather.rot);
      ctx.fillStyle = "#ead4b8";
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const previousDrawOwl = drawOwl;
  drawOwl = function cuteJumperOwl(x, y, radius, invincible = false) {
    previousDrawOwl(x, y, radius, invincible);
    core?.drawCanvasCosmetic(ctx, x, y - radius * 1.55, radius / 18, owl.vx * .025);
  };

  const previousDrawOverlay = drawOverlay;
  drawOverlay = function cuteJumperOverlay() {
    previousDrawOverlay();
    if (cute.feverMs > 0 && state.scene === "playing") {
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,.84)";
      roundRect(state.width / 2 - 95, 124, 190, 34, 16, true);
      ctx.fillStyle = "#2d7c3f";
      ctx.font = "900 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`GORĄCZKA 🌿 ${Math.ceil(cute.feverMs / 1000)} s`, state.width / 2, 142);
      ctx.restore();
    }
    if (state.scene === "gameover") {
      ctx.save();
      ctx.fillStyle = "#2a1f2d";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`O włos: ${cute.nearMisses} • Najlepsze combo: ×${cute.bestCombo}`, state.width / 2, state.height * .58);
      ctx.restore();
    }
  };

  core?.registerGame({
    getPaused: () => cute.paused,
    setPaused: (value) => { cute.paused = Boolean(value); },
    musicTheme: () => "jumper",
  });

  resetCute();
})();
