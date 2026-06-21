// Kompletny pakiet „cute polish” dla Sowa3.
(() => {
  "use strict";

  const core = window.SowieCore;
  const BLOCKERS = new Set(["amic", "shift", "magda", "cart", "pot", "block", "pallet", "person", "boar"]);
  const stateCute = {
    paused: false,
    combo: 1,
    chain: 0,
    bestCombo: 1,
    leavesToFever: 0,
    feverMs: 0,
    feverSpawnMs: 0,
    featherTrail: [],
    lastLane: 0,
    lastStage: state.stage,
    lastLives: state.lives,
    lastMode: state.mode,
    nearMisses: 0,
    collectedLeaves: 0,
    summary: null,
  };

  const comboCard = document.createElement("div");
  comboCard.className = "hud-card";
  comboCard.innerHTML = `<span>Combo</span><strong id="comboValue">×1</strong>`;
  document.querySelector(".hud")?.appendChild(comboCard);
  const comboValue = comboCard.querySelector("#comboValue");

  function resetCuteRun() {
    stateCute.combo = 1;
    stateCute.chain = 0;
    stateCute.bestCombo = 1;
    stateCute.leavesToFever = 0;
    stateCute.feverMs = 0;
    stateCute.feverSpawnMs = 0;
    stateCute.featherTrail.length = 0;
    stateCute.lastLane = state.lane;
    stateCute.lastStage = state.stage;
    stateCute.lastLives = state.lives;
    stateCute.lastMode = state.mode;
    stateCute.nearMisses = 0;
    stateCute.collectedLeaves = 0;
    stateCute.summary = null;
    updateComboHud();
  }

  function addCombo(amount = 1) {
    stateCute.chain += amount;
    const previous = stateCute.combo;
    if (stateCute.chain >= 35) stateCute.combo = 5;
    else if (stateCute.chain >= 22) stateCute.combo = 4;
    else if (stateCute.chain >= 12) stateCute.combo = 3;
    else if (stateCute.chain >= 5) stateCute.combo = 2;
    else stateCute.combo = 1;
    stateCute.bestCombo = Math.max(stateCute.bestCombo, stateCute.combo);
    core?.recordStat("maxCombo", stateCute.bestCombo, "max");
    if (stateCute.combo !== previous) {
      core?.play("combo");
      core?.toast(`Combo ×${stateCute.combo}!`);
      if (stateCute.combo >= 4) core?.progressMission("combo4", 1);
    }
    updateComboHud();
  }

  function resetCombo() {
    stateCute.chain = 0;
    stateCute.combo = 1;
    updateComboHud();
  }

  function updateComboHud() {
    if (!comboValue) return;
    comboValue.textContent = `×${stateCute.combo}`;
    comboValue.style.transform = stateCute.combo > 1 ? "scale(1.08)" : "scale(1)";
    comboValue.style.color = stateCute.combo >= 4 ? "#d63b75" : "";
  }

  function assignLeafVariants() {
    for (const object of objects) {
      if (object.type !== "leaf" || object._cuteVariant) continue;
      const roll = Math.random();
      object._cuteVariant = roll < 0.045 ? "rainbow" : roll < 0.15 ? "gold" : "normal";
    }
  }

  function snapshotLeaves() {
    return objects.filter((object) => object.type === "leaf").map((object) => ({
      object,
      lane: object.lane,
      z: object.z,
      variant: object._cuteVariant || "normal",
    }));
  }

  function processCollectedLeaves(beforeLeaves) {
    for (const entry of beforeLeaves) {
      if (objects.includes(entry.object)) continue;
      if (entry.z > 0.18 || Math.round(state.lane) !== entry.lane) continue;
      stateCute.collectedLeaves += 1;
      stateCute.leavesToFever += 1;
      addCombo(1);
      core?.play("leaf");
      core?.recordStat("leaves", 1);
      core?.progressMission("leaves20", 1);

      if (entry.variant === "gold") {
        state.score += 100 * stateCute.combo;
        burst(laneX(entry.lane, Math.max(0, entry.z)), roadY(Math.max(0, entry.z)), `ZŁOTY +${100 * stateCute.combo}`, "#e5aa19");
      } else if (entry.variant === "rainbow") {
        state.score += 150 * stateCute.combo;
        stateCute.feverMs = Math.max(stateCute.feverMs, 9000);
        burst(laneX(entry.lane, Math.max(0, entry.z)), roadY(Math.max(0, entry.z)), "TĘCZOWA!", "#c75cff");
      } else if (stateCute.combo > 1) {
        state.score += 50 * (stateCute.combo - 1);
      }

      if (stateCute.leavesToFever >= 8) {
        stateCute.leavesToFever = 0;
        stateCute.feverMs = 8000;
        core?.toast("Gorączka monster! 🌿");
        core?.play("mission");
      }
    }
  }

  function updateFever(dt) {
    if (stateCute.feverMs <= 0 || state.mode !== "run") return;
    stateCute.feverMs -= dt;
    stateCute.feverSpawnMs -= dt;
    if (stateCute.feverSpawnMs <= 0) {
      stateCute.feverSpawnMs = 650;
      const lane = [-1, 0, 1][Math.floor(rand(0, 3))];
      objects.push({ type: "leaf", lane, z: 1.08, hit: false, phase: rand(0, Math.PI * 2), _cuteVariant: Math.random() < 0.18 ? "gold" : "normal" });
    }
  }

  function allBlockers() {
    const list = objects.filter((object) => BLOCKERS.has(object.type));
    if (typeof sowa3StageObstacles !== "undefined") list.push(...sowa3StageObstacles.filter((object) => BLOCKERS.has(object.type)));
    return list;
  }

  function processNearMisses() {
    if (state.mode !== "run") return;
    for (const object of allBlockers()) {
      if (object._cuteNearChecked || object.z > 0.04) continue;
      object._cuteNearChecked = true;
      const laneDistance = Math.abs(Math.round(state.lane) - Math.round(object.lane));
      if (laneDistance !== 1) continue;
      const bonus = 30 * stateCute.combo;
      state.score += bonus;
      stateCute.nearMisses += 1;
      addCombo(2);
      core?.play("near");
      core?.toast(`O włos! +${bonus}`);
      core?.recordStat("nearMisses", 1);
      core?.progressMission("nearMiss3", 1);
    }
  }

  function setupMovingStageObstacles() {
    if (typeof sowa3StageObstacles === "undefined") return;
    for (const object of sowa3StageObstacles) {
      if (object._cuteMoveReady || (object.type !== "person" && object.type !== "boar")) continue;
      object._cuteMoveReady = true;
      if (Math.random() > (object.type === "boar" ? 0.42 : 0.28)) continue;
      const options = [-1, 0, 1].filter((lane) => lane !== object.lane);
      object._cuteTargetLane = options[Math.floor(Math.random() * options.length)];
      object._cuteMoved = false;
    }
  }

  function updateMovingStageObstacles() {
    if (typeof sowa3StageObstacles === "undefined") return;
    for (const object of sowa3StageObstacles) {
      if (object._cuteTargetLane === undefined || object._cuteMoved) continue;
      if (object.z < 0.72 && object.z > 0.48) object._cuteWarning = true;
      if (object.z <= 0.48) {
        object.lane = object._cuteTargetLane;
        object._cuteMoved = true;
        object._cuteWarning = false;
        core?.maybeQuip(object.type === "boar" ? "Dzik zmienia tor!" : "Uwaga, ktoś wchodzi w alejkę!");
      }
    }
  }

  function updateFeathers(dt) {
    if (Math.abs(state.lane - stateCute.lastLane) > 0.035 && state.mode === "run") {
      if (!core?.settings().reducedEffects && Math.random() < 0.35) {
        stateCute.featherTrail.push({
          x: laneX(state.lane, 0),
          y: state.h * 0.79,
          vx: (stateCute.lastLane - state.lane) * 80,
          vy: rand(-20, 10),
          life: 520,
          rot: rand(-1, 1),
        });
      }
    }
    stateCute.lastLane = state.lane;
    for (let i = stateCute.featherTrail.length - 1; i >= 0; i -= 1) {
      const feather = stateCute.featherTrail[i];
      feather.x += feather.vx * dt * 0.001;
      feather.y += feather.vy * dt * 0.001;
      feather.life -= dt;
      feather.rot += dt * 0.002;
      if (feather.life <= 0) stateCute.featherTrail.splice(i, 1);
    }
  }

  function handleTransitions(previousMode, previousStage, previousLives) {
    if (state.lives < previousLives) resetCombo();
    if (state.lives > previousLives) {
      core?.play("heart");
      core?.recordStat("extraLives", state.lives - previousLives);
      core?.progressMission("extraLife", state.lives - previousLives);
    }
    if (previousMode === "run" && state.mode === "finish") {
      stateCute.summary = {
        score: Math.floor(state.score),
        leaves: stateCute.collectedLeaves,
        near: stateCute.nearMisses,
        combo: stateCute.bestCombo,
      };
      core?.recordStat("finishes", 1);
      if (state.difficultyKey === "chaos") core?.progressMission("chaosFinish", 1);
      core?.play("splash");
    }
    if (state.stage !== previousStage) {
      stateCute.lastStage = state.stage;
      const themes = ["market", "flowers", "estate"];
      core?.startMusic(themes[state.stage] || "default");
    }
  }

  const previousStartGame = startGame;
  startGame = function cuteStartGame() {
    previousStartGame();
    resetCuteRun();
    core?.startMusic(["market", "flowers", "estate"][state.stage]);
  };

  const previousUpdate = update;
  update = function cuteUpdate(dt) {
    if (stateCute.paused) return;
    assignLeafVariants();
    setupMovingStageObstacles();
    updateMovingStageObstacles();
    const beforeLeaves = snapshotLeaves();
    const previousLives = state.lives;
    const previousMode = state.mode;
    const previousStage = state.stage;
    previousUpdate(dt);
    processCollectedLeaves(beforeLeaves);
    processNearMisses();
    updateFever(dt);
    updateFeathers(dt);
    handleTransitions(previousMode, previousStage, previousLives);
    core?.setDebugData({
      game: "Sowa3",
      mode: state.mode,
      stage: state.stage + 1,
      blockers: allBlockers().length,
      combo: stateCute.combo,
      fever: Math.max(0, Math.ceil(stateCute.feverMs / 1000)),
      objects: objects.length,
    });
  };

  const previousDrawObjects = drawObjects;
  drawObjects = function cuteDrawObjects() {
    previousDrawObjects();
    drawLeafVariantAuras();
    drawObstacleWarnings();
  };

  function drawLeafVariantAuras() {
    for (const object of objects) {
      if (object.type !== "leaf" || object._cuteVariant === "normal") continue;
      const x = laneX(object.lane, object.z);
      const y = roadY(object.z);
      const scale = scaleAt(object.z);
      ctx.save();
      ctx.globalAlpha = 0.55 + Math.sin(state.time * 0.008 + object.phase) * 0.18;
      ctx.strokeStyle = object._cuteVariant === "gold" ? "#ffd65a" : `hsl(${(state.time * 0.08) % 360} 85% 65%)`;
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.arc(x, y, 31 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawObstacleWarnings() {
    if (typeof sowa3StageObstacles === "undefined") return;
    for (const object of sowa3StageObstacles) {
      if (!object._cuteWarning) continue;
      const x = laneX(object.lane, object.z);
      const y = roadY(object.z) - 42 * scaleAt(object.z);
      ctx.save();
      ctx.fillStyle = "rgba(255,214,90,.92)";
      ctx.beginPath();
      ctx.arc(x, y, 14 * scaleAt(object.z), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2b2733";
      ctx.font = `900 ${14 * scaleAt(object.z)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(object._cuteTargetLane > object.lane ? "→" : "←", x, y);
      ctx.restore();
    }
  }

  const previousDrawOwl = drawOwl;
  drawOwl = function cuteDrawOwl() {
    previousDrawOwl();
    if (state.mode === "finish") return;
    const x = laneX(state.lane, 0);
    const y = state.h * 0.78;
    const tilt = (state.targetLane - state.lane) * 0.24;
    core?.drawCanvasCosmetic(ctx, x, y - 38, 1.05, tilt);
  };

  const previousDrawParticles = drawParticles;
  drawParticles = function cuteDrawParticles() {
    drawFeathers();
    previousDrawParticles();
  };

  function drawFeathers() {
    for (const feather of stateCute.featherTrail) {
      ctx.save();
      ctx.globalAlpha = clamp(feather.life / 520, 0, 1);
      ctx.translate(feather.x, feather.y);
      ctx.rotate(feather.rot);
      ctx.fillStyle = "#ead4b8";
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const previousDrawOverlay = drawOverlay;
  drawOverlay = function cuteDrawOverlay() {
    previousDrawOverlay();
    if (stateCute.feverMs > 0 && state.mode === "run") {
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,.82)";
      round(state.w / 2 - 100, state.h * 0.19, 200, 34, 15, true);
      ctx.fillStyle = "#2d7c3f";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `900 ${14 * unit()}px sans-serif`;
      ctx.fillText(`GORĄCZKA 🌿 ${Math.ceil(stateCute.feverMs / 1000)} s`, state.w / 2, state.h * 0.19 + 18);
      ctx.restore();
    }
    if (state.mode === "finish" && stateCute.summary && state.finishElapsed > 2500) drawStageSummary();
  };

  function drawStageSummary() {
    const summary = stateCute.summary;
    const width = Math.min(state.w * 0.78, 390);
    const x = state.w / 2 - width / 2;
    const y = state.h * 0.40;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.9)";
    round(x, y, width, 132, 24, true);
    ctx.fillStyle = "#2b2733";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${20 * unit()}px sans-serif`;
    const grade = summary.near >= 5 ? "Królowa alejek" : summary.combo >= 4 ? "Sowi zawodnik" : "Spokojny lot";
    ctx.fillText(grade, state.w / 2, y + 27);
    ctx.font = `bold ${14 * unit()}px sans-serif`;
    ctx.fillText(`Liście: ${summary.leaves}  •  O włos: ${summary.near}`, state.w / 2, y + 64);
    ctx.fillText(`Najlepsze combo: ×${summary.combo}  •  Wynik: ${summary.score}`, state.w / 2, y + 92);
    ctx.restore();
  }

  core?.registerGame({
    getPaused: () => stateCute.paused,
    setPaused: (value) => { stateCute.paused = Boolean(value); },
    musicTheme: () => ["market", "flowers", "estate"][state.stage] || "default",
  });

  resetCuteRun();
})();
