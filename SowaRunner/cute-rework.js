// Kompletny pakiet „cute polish” dla SowaRunner.
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
    fever: 0,
    feverSpawn: 0,
    eventTimer: 12,
    eventType: null,
    eventLeft: 0,
    lastLives: lives,
    feathers: [],
    lastOwlY: 0,
  };

  function resetCute() {
    cute.combo = 1;
    cute.chain = 0;
    cute.bestCombo = 1;
    cute.nearMisses = 0;
    cute.collectedLeaves = 0;
    cute.fever = 0;
    cute.feverSpawn = 0;
    cute.eventTimer = random(10, 16);
    cute.eventType = null;
    cute.eventLeft = 0;
    cute.lastLives = lives;
    cute.feathers.length = 0;
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
  }

  function resetCombo() {
    cute.combo = 1;
    cute.chain = 0;
  }

  function assignLeafVariants() {
    for (const leaf of leaves) {
      if (leaf._cuteVariant) continue;
      const roll = random();
      leaf._cuteVariant = roll < .045 ? "rainbow" : roll < .15 ? "gold" : "normal";
    }
  }

  function snapshotLeaves() {
    return leaves.map((leaf) => ({ leaf, x: leaf.x, variant: leaf._cuteVariant || "normal" }));
  }

  function processLeaves(before) {
    for (const entry of before) {
      if (leaves.includes(entry.leaf)) continue;
      if (Math.abs(entry.x - owl.x) > 100 * s) continue;
      cute.collectedLeaves += 1;
      addCombo(1);
      core?.play("leaf");
      core?.recordStat("leaves", 1);
      core?.progressMission("leaves20", 1);
      if (entry.variant === "gold") {
        score += 70 * cute.combo;
        burst(owl.x, owl.y, 12, `ZŁOTY +${70 * cute.combo}`);
      } else if (entry.variant === "rainbow") {
        score += 100 * cute.combo;
        cute.fever = 9;
        core?.toast("Tęczowa monstera! 🌈");
      } else if (cute.combo > 1) {
        score += 35 * (cute.combo - 1);
      }
      if (cute.collectedLeaves % 8 === 0) {
        cute.fever = 8;
        core?.toast("Gorączka monster! 🌿");
        core?.play("mission");
      }
    }
  }

  function updateFever(dt) {
    if (cute.fever <= 0 || mode !== SCREEN.RUN) return;
    cute.fever -= dt;
    cute.feverSpawn -= dt;
    if (cute.feverSpawn <= 0) {
      cute.feverSpawn = .48;
      leaves.push({
        x: width + random(30, 140),
        y: random(ground - 210 * s, ground - 88 * s),
        r: random(18, 25) * s,
        rot: random(TWO_PI),
        bob: random(TWO_PI),
        _cuteVariant: random() < .16 ? "gold" : "normal",
      });
    }
  }

  function awardNear(label) {
    const bonus = 25 * cute.combo;
    score += bonus;
    cute.nearMisses += 1;
    addCombo(2);
    core?.play("near");
    core?.toast(`${label || "O włos!"} +${bonus}`);
    core?.recordStat("nearMisses", 1);
    core?.progressMission("nearMiss3", 1);
  }

  function processNearMisses() {
    if (mode !== SCREEN.RUN) return;
    for (const wall of walls) {
      if (wall._cuteNear || wall.x + wall.w > owl.x - owl.r) continue;
      wall._cuteNear = true;
      if (owl.y + owl.r < wall.y + 22 * s) awardNear("O włos nad ścianą!");
    }
    for (const station of amic) {
      if (station._cuteNear || station.x + station.w > owl.x - owl.r) continue;
      station._cuteNear = true;
      if (owl.y + owl.r < station.y + station.roof + 18 * s) awardNear("O włos nad Amic!");
    }
    for (const text of pracu) {
      if (text._cuteNear || text.x + text.w / 2 > owl.x - owl.r) continue;
      text._cuteNear = true;
      if (Math.abs(owl.y - text.y) < text.h + owl.r * 1.6) awardNear("Pracu Pracu minięte!");
    }
    for (const hole of holes) {
      if (hole._cuteNear || hole.x + hole.w > owl.x - owl.r) continue;
      hole._cuteNear = true;
      if (owl.y < ground - owl.r - 12 * s) awardNear("Skok o włos!");
    }
  }

  function updateEvents(dt) {
    if (mode !== SCREEN.RUN) return;
    if (cute.eventType) {
      cute.eventLeft -= dt;
      if (cute.eventType === "monsterRain" && random() < dt * 2.2) {
        leaves.push({ x: width + random(30, 170), y: random(ground - 230 * s, ground - 90 * s), r: random(18, 25) * s, rot: random(TWO_PI), bob: random(TWO_PI), _cuteVariant: "normal" });
      }
      if (cute.eventType === "goatParade" && random() < dt * .55 && goats.length < 3) {
        goats.push({ x: width + random(80, 220), y: ground - 22 * s, r: 23 * s, vy: random(-9, -12) * s, ph: random(TWO_PI), used: false });
      }
      if (cute.eventLeft <= 0) {
        cute.eventType = null;
        cute.eventTimer = random(15, 24);
      }
      return;
    }
    cute.eventTimer -= dt;
    if (cute.eventTimer > 0) return;
    cute.eventType = random() < .55 ? "monsterRain" : "goatParade";
    cute.eventLeft = 6;
    core?.toast(cute.eventType === "monsterRain" ? "Deszcz monster! 🌿" : "Kozi maraton! 🐐");
    core?.maybeQuip();
  }

  function updateFeathers(dt) {
    const airborne = owl.y < ground - owl.r - 4 * s;
    if (airborne && !core?.settings().reducedEffects && random() < dt * 2.8) {
      cute.feathers.push({ x: owl.x - 18 * s, y: owl.y + 10 * s, vx: random(-28, -8) * s, vy: random(-14, 10) * s, life: .7, rot: random(-1, 1) });
    }
    for (let i = cute.feathers.length - 1; i >= 0; i--) {
      const feather = cute.feathers[i];
      feather.x += feather.vx * dt;
      feather.y += feather.vy * dt;
      feather.life -= dt;
      feather.rot += dt * 2;
      if (feather.life <= 0) cute.feathers.splice(i, 1);
    }
  }

  const previousStart = start;
  start = function cuteRunnerStart() {
    previousStart();
    resetCute();
    core?.startMusic("runner");
  };

  const previousUpdateRun = updateRun;
  updateRun = function cuteRunnerUpdate(dt) {
    if (cute.paused) return;
    assignLeafVariants();
    const beforeLeaves = snapshotLeaves();
    const previousLives = lives;
    previousUpdateRun(dt);
    processLeaves(beforeLeaves);
    processNearMisses();
    updateFever(dt);
    updateEvents(dt);
    updateFeathers(dt);
    if (lives < previousLives) {
      resetCombo();
      core?.play("hurt");
    } else if (lives > previousLives) {
      core?.play("heart");
      core?.recordStat("extraLives", lives - previousLives);
      core?.progressMission("extraLife", lives - previousLives);
    }
    core?.recordStat("runnerDistance", Math.max(0, distM - Number(core?.getProfile().stats.runnerDistance || 0)), "add");
    core?.progressMission("runner1000", Math.max(0, distM - Number(core?.getProfile().missions.runner1000.progress || 0)));
    core?.setDebugData({ game: "SowaRunner", mode, speed: spd.toFixed(2), obstacles: holes.length + walls.length + pracu.length + amic.length, combo: cute.combo, fever: cute.fever.toFixed(1), event: cute.eventType || "-" });
  };

  const previousUpdateWhale = updateWhale;
  updateWhale = function cuteRunnerWhale(dt) {
    if (cute.paused) return;
    previousUpdateWhale(dt);
  };

  const previousLandRect = landRect;
  landRect = function cutePerfectLanding(x, y, w, h) {
    const landed = previousLandRect(x, y, w, h);
    if (landed) {
      const center = x + w / 2;
      const margin = w * .18;
      if (owl.x > center - margin && owl.x < center + margin && performance.now() - (owl._cutePerfectAt || 0) > 500) {
        owl._cutePerfectAt = performance.now();
        const bonus = 20 * cute.combo;
        score += bonus;
        addCombo(1);
        core?.toast(`Idealnie! +${bonus}`);
        core?.play("combo");
      }
    }
    return landed;
  };

  const previousDrawBg = drawBg;
  drawBg = function cuteRunnerBackground() {
    previousDrawBg();
    const cycle = (t % 90) / 90;
    const night = Math.max(0, Math.sin((cycle - .55) * Math.PI * 2));
    if (night > .05) {
      noStroke();
      fill(42, 55, 88, 65 * night);
      rect(0, 0, width, height);
      fill(255, 244, 190, 170 * night);
      ellipse(width * .82, height * .16, 34 * s, 34 * s);
    } else {
      fill(255, 223, 116, 155);
      noStroke();
      ellipse(width * .82, height * .16, 42 * s, 42 * s);
    }
  };

  const previousDrawWorld = drawWorld;
  drawWorld = function cuteRunnerWorld() {
    previousDrawWorld();
    drawLeafAuras();
    drawFeathers();
  };

  function drawLeafAuras() {
    for (const leaf of leaves) {
      if (leaf._cuteVariant === "normal") continue;
      push();
      noFill();
      strokeWeight(4 * s);
      if (leaf._cuteVariant === "gold") stroke(255, 207, 65, 170);
      else stroke((frameCount * 5) % 255, 140, 235, 180);
      ellipse(leaf.x, leaf.y + Math.sin(t * 4 + leaf.bob) * 8 * s, leaf.r * 2.8, leaf.r * 2.8);
      pop();
    }
  }

  function drawFeathers() {
    for (const feather of cute.feathers) {
      push();
      translate(feather.x, feather.y);
      rotate(feather.rot);
      noStroke();
      fill(234, 212, 184, constrain(feather.life / .7, 0, 1) * 210);
      ellipse(0, 0, 7 * s, 15 * s);
      pop();
    }
  }

  const previousDrawOwl = drawOwl;
  drawOwl = function cuteRunnerOwl() {
    previousDrawOwl();
    push();
    const cosmeticScale = owl.r / 28;
    const y = owl.y - 36 * cosmeticScale;
    core?.drawCanvasCosmetic(drawingContext, owl.x, y, cosmeticScale, owl.vy * .008);
    pop();
  };

  const previousDrawHud = drawHud;
  drawHud = function cuteRunnerHud() {
    previousDrawHud();
    push();
    noStroke();
    const cardW = 90 * s;
    fill(255, 224);
    rect(10 * s, 12 * s, cardW, 44 * s, 14 * s);
    fill(cute.combo >= 4 ? color(214, 59, 117) : color(38, 34, 44));
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(11 * s);
    text("COMBO", 10 * s + cardW / 2, 25 * s);
    textSize(18 * s);
    text(`×${cute.combo}`, 10 * s + cardW / 2, 44 * s);
    if (cute.fever > 0) {
      fill(255, 245);
      rect(108 * s, 12 * s, 132 * s, 44 * s, 14 * s);
      fill(45, 124, 63);
      textSize(13 * s);
      text(`GORĄCZKA ${Math.ceil(cute.fever)} s`, 174 * s, 35 * s);
    }
    pop();
  };

  const previousOverScreen = overScreen;
  overScreen = function cuteRunnerOver() {
    previousOverScreen();
    push();
    fill(38, 34, 44);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(14 * s);
    text(`O włos: ${cute.nearMisses} • Najlepsze combo: ×${cute.bestCombo}`, width / 2, height * .56);
    pop();
  };

  core?.registerGame({
    getPaused: () => cute.paused,
    setPaused: (value) => { cute.paused = Boolean(value); },
    musicTheme: () => "runner",
  });

  resetCute();
})();
