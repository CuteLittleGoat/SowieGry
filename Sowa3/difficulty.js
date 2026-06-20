// Poziomy trudności dla Sowa3 — ładowane po script.js.
const SOWA3_DIFFICULTIES = {
  chill: {
    label: "Chill",
    desc: "4 życia, wolniej, częściej punkty",
    lives: 4,
    speedStart: 0.28,
    stageBonus: 0.025,
    spawnMult: 1.18,
    obstacleSkip: 0.24,
    scoreMult: 0.85
  },
  arcade: {
    label: "Arcade",
    desc: "standardowy runner",
    lives: 3,
    speedStart: 0.34,
    stageBonus: 0.035,
    spawnMult: 1.00,
    obstacleSkip: 0.08,
    scoreMult: 1.00
  },
  chaos: {
    label: "Chaos",
    desc: "2 życia, szybciej i ciaśniej",
    lives: 2,
    speedStart: 0.40,
    stageBonus: 0.050,
    spawnMult: 0.78,
    obstacleSkip: 0.00,
    scoreMult: 1.25
  }
};

state.difficultyKey = localStorage.getItem("sowa3Difficulty") || "arcade";
let activeSowa3Difficulty = SOWA3_DIFFICULTIES[state.difficultyKey] || SOWA3_DIFFICULTIES.arcade;

const originalSowa3Start = startGame;
const originalSowa3NextStage = nextStage;
const originalSowa3SpawnObject = spawnObject;
const originalSowa3Update = update;

function setSowa3Difficulty(key) {
  if (!SOWA3_DIFFICULTIES[key]) return;
  state.difficultyKey = key;
  activeSowa3Difficulty = SOWA3_DIFFICULTIES[key];
  localStorage.setItem("sowa3Difficulty", key);
  applySowa3Difficulty(false);
  renderSowa3DifficultyButtons();
}

function applySowa3Difficulty(resetLives) {
  const d = activeSowa3Difficulty;
  state.speed = d.speedStart + state.stage * d.stageBonus;
  if (resetLives) state.lives = d.lives;
}

startGame = function patchedSowa3StartGame() {
  originalSowa3Start();
  applySowa3Difficulty(true);
  updateHud();
};

nextStage = function patchedSowa3NextStage() {
  originalSowa3NextStage();
  applySowa3Difficulty(false);
  updateHud();
};

spawnObject = function patchedSowa3SpawnObject() {
  const d = activeSowa3Difficulty;
  if (Math.random() < d.obstacleSkip) {
    const lane = [-1, 0, 1][Math.floor(rand(0, 3))];
    objects.push({ type: "leaf", lane, z: 1.08, hit: false, phase: rand(0, Math.PI * 2) });
    return;
  }
  originalSowa3SpawnObject();
};

update = function patchedSowa3Update(dt) {
  const beforeScore = state.score;
  originalSowa3Update(dt);
  if (state.mode === "run") {
    const d = activeSowa3Difficulty;
    const delta = state.score - beforeScore;
    if (delta > 0 && d.scoreMult !== 1) state.score = beforeScore + delta * d.scoreMult;
    state.spawn *= d.spawnMult;
    state.speed = Math.max(state.speed, d.speedStart + state.stage * d.stageBonus);
  }
};

function createSowa3DifficultyPanel() {
  const style = document.createElement("style");
  style.textContent = `
    .difficulty-panel {
      position: absolute;
      z-index: 20;
      left: 50%;
      top: max(108px, calc(env(safe-area-inset-top) + 94px));
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      padding: 8px;
      border-radius: 18px;
      background: rgba(255, 255, 255, .76);
      box-shadow: 0 12px 28px rgba(40, 70, 90, .14);
      backdrop-filter: blur(8px);
    }
    .difficulty-panel button {
      border: 0;
      border-radius: 13px;
      padding: 8px 10px;
      min-width: 82px;
      font: 800 .78rem "Trebuchet MS", system-ui, sans-serif;
      color: #2b2733;
      background: rgba(255,255,255,.84);
      cursor: pointer;
    }
    .difficulty-panel button small {
      display: block;
      margin-top: 2px;
      font-weight: 600;
      font-size: .58rem;
      opacity: .68;
    }
    .difficulty-panel button.active {
      background: #fff0a8;
      box-shadow: inset 0 0 0 2px rgba(238, 170, 65, .85);
    }
    @media (max-width: 700px) {
      .difficulty-panel { top: max(82px, calc(env(safe-area-inset-top) + 76px)); gap: 5px; padding: 6px; }
      .difficulty-panel button { min-width: 0; padding: 7px 8px; font-size: .68rem; }
      .difficulty-panel button small { display: none; }
    }
  `;
  document.head.appendChild(style);

  const panel = document.createElement("div");
  panel.className = "difficulty-panel";
  panel.setAttribute("aria-label", "Poziom trudności");
  document.querySelector(".game-shell")?.appendChild(panel);
  return panel;
}

const sowa3DifficultyPanel = createSowa3DifficultyPanel();
function renderSowa3DifficultyButtons() {
  sowa3DifficultyPanel.innerHTML = "";
  Object.entries(SOWA3_DIFFICULTIES).forEach(([key, data], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = key === state.difficultyKey ? "active" : "";
    button.innerHTML = `${index + 1}. ${data.label}<small>${data.desc}</small>`;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setSowa3Difficulty(key);
    });
    sowa3DifficultyPanel.appendChild(button);
  });
}

window.addEventListener("keydown", (event) => {
  if (state.mode !== "title" && state.mode !== "over") return;
  if (event.key === "1") setSowa3Difficulty("chill");
  if (event.key === "2") setSowa3Difficulty("arcade");
  if (event.key === "3") setSowa3Difficulty("chaos");
});

function syncSowa3DifficultyPanel() {
  sowa3DifficultyPanel.style.display = (state.mode === "title" || state.mode === "over") ? "flex" : "none";
  requestAnimationFrame(syncSowa3DifficultyPanel);
}

renderSowa3DifficultyButtons();
syncSowa3DifficultyPanel();
