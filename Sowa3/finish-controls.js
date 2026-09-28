// Sterowanie finałem Sowa3, pauza, dodatkowe detale i zmiana muzyki między planszami.
(() => {
  const core = window.SowieCore;
  const themes = ["market", "flowers", "estate"];
  const previousNextStage = nextStage;

  nextStage = function nextStageWithMusic() {
    previousNextStage();
    core?.startMusic(themes[state.stage] || "default");
  };

  function finishUiPaused() {
    const badge = document.querySelector(".sowie-paused-badge");
    const modal = document.querySelector(".sowie-modal-backdrop");
    return Boolean((badge && !badge.hidden) || (modal && !modal.hidden));
  }

  canvas.addEventListener("pointerdown", () => {
    if (state.mode !== "finish" || finishUiPaused()) return;
    const seen = window.SowieCloud?.game("sowa3").finishSeen === true;
    if (!seen || (state.finishElapsed || 0) < 2200) return;
    state.finishTimer = Math.min(state.finishTimer, 30);
  }, { capture: true });

  const previousUpdateFinish = updateFinish;
  updateFinish = function finishWithSeenFlag(dt) {
    if (finishUiPaused()) return;
    const wasFinish = state.mode === "finish";
    previousUpdateFinish(dt);
    // Po pierwszym pełnym obejrzeniu finał można skracać (sowiegry_gry/sowa3.finishSeen w SowieCloud).
    if (wasFinish && (state.finishElapsed || 0) > 2500 && window.SowieCloud?.game("sowa3").finishSeen !== true) {
      window.SowieCloud?.updateGame("sowa3", { finishSeen: true });
    }
  };

  const details = document.createElement("script");
  details.src = "finish-details.js";
  details.async = false;
  document.body.appendChild(details);

  window.addEventListener("load", () => {
    const pauseGuard = document.createElement("script");
    pauseGuard.src = "pause-guard.js";
    pauseGuard.async = false;
    document.body.appendChild(pauseGuard);
  }, { once: true });
})();
