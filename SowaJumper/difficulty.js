// Poziomy trudności dla SowaJumper — ładowane po script.js.
const JUMPER_DIFFICULTIES = {
  chill: {
    label: "Chill",
    desc: "4 życia, bliższe platformy, mocniejsze wybicia",
    gravity: 0.38,
    jumpPower: 12.4,
    goatPower: 25.5,
    amicPower: 37,
    lives: 4,
    gapMult: 0.90
  },
  arcade: {
    label: "Arcade",
    desc: "standardowa wersja gry",
    gravity: 0.42,
    jumpPower: 11.8,
    goatPower: 23,
    amicPower: 34,
    lives: 3,
    gapMult: 1.00
  },
  chaos: {
    label: "Chaos",
    desc: "3 życia, dalsze platformy, słabsze ratunki",
    gravity: 0.48,
    jumpPower: 11.1,
    goatPower: 21.5,
    amicPower: 31.5,
    lives: 3,
    gapMult: 1.16
  }
};

state.difficultyKey = localStorage.getItem("sowaJumperDifficulty") || "arcade";
let activeJumperDifficulty = JUMPER_DIFFICULTIES[state.difficultyKey] || JUMPER_DIFFICULTIES.arcade;

const originalJumperStartGame = startGame;
const originalJumperGap = platformGapForHeight;

function setJumperDifficulty(key) {
  if (!JUMPER_DIFFICULTIES[key]) return;
  state.difficultyKey = key;
  activeJumperDifficulty = JUMPER_DIFFICULTIES[key];
  localStorage.setItem("sowaJumperDifficulty", key);
  applyJumperDifficulty();
  renderJumperDifficultyButtons();
}

function applyJumperDifficulty() {
  const d = activeJumperDifficulty;
  state.gravity = d.gravity;
  state.jumpPower = d.jumpPower;
  state.goatPower = d.goatPower;
  state.amicPower = d.amicPower;
  state.maxLives = Math.max(d.lives, state.maxLives || d.lives);
}

platformGapForHeight = function patchedPlatformGapForHeight(meters) {
  return originalJumperGap(meters) * activeJumperDifficulty.gapMult;
};

startGame = function patchedStartGame() {
  applyJumperDifficulty();
  originalJumperStartGame();
  state.lives = activeJumperDifficulty.lives;
  state.maxLives = Math.max(activeJumperDifficulty.lives, state.maxLives || activeJumperDifficulty.lives);
  updateHud();
};

function createJumperDifficultyPanel() {
  const style = document.createElement("style");
  style.textContent = `
    .difficulty-panel {
      position: absolute;
      z-index: 20;
      left: 50%;
      top: max(108px, calc(env(safe-area-inset-top) + 96px));
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      padding: 8px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.72);
      box-shadow: 0 12px 28px rgba(40, 70, 90, 0.13);
      backdrop-filter: blur(8px);
    }
    .difficulty-panel button {
      border: 0;
      border-radius: 13px;
      padding: 8px 10px;
      min-width: 82px;
      font: 800 0.78rem "Trebuchet MS", system-ui, sans-serif;
      color: #2a1f2d;
      background: rgba(255,255,255,.82);
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
      .difficulty-panel { top: max(86px, calc(env(safe-area-inset-top) + 78px)); gap: 5px; padding: 6px; }
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

const jumperDifficultyPanel = createJumperDifficultyPanel();
function renderJumperDifficultyButtons() {
  jumperDifficultyPanel.innerHTML = "";
  Object.entries(JUMPER_DIFFICULTIES).forEach(([key, data], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = key === state.difficultyKey ? "active" : "";
    button.innerHTML = `${index + 1}. ${data.label}<small>${data.desc}</small>`;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setJumperDifficulty(key);
    });
    jumperDifficultyPanel.appendChild(button);
  });
}

window.addEventListener("keydown", (event) => {
  if (state.scene !== "title" && state.scene !== "gameover") return;
  if (event.key === "1") setJumperDifficulty("chill");
  if (event.key === "2") setJumperDifficulty("arcade");
  if (event.key === "3") setJumperDifficulty("chaos");
});

function syncJumperDifficultyPanel() {
  jumperDifficultyPanel.style.display = (state.scene === "title" || state.scene === "gameover") ? "flex" : "none";
  requestAnimationFrame(syncJumperDifficultyPanel);
}

function loadJumperModule(src) {
  const script = document.createElement("script");
  script.src = src;
  document.body.appendChild(script);
}

applyJumperDifficulty();
renderJumperDifficultyButtons();
syncJumperDifficultyPanel();
loadJumperModule("extra-lives.js");
loadJumperModule("bonus-fix.js");
