// Sterowanie finałem Sowa3 i zmiana muzyki między planszami.
(() => {
  const core = window.SowieCore;
  const themes = ["market", "flowers", "estate"];
  const previousNextStage = nextStage;

  nextStage = function nextStageWithMusic() {
    previousNextStage();
    core?.startMusic(themes[state.stage] || "default");
  };

  canvas.addEventListener("pointerdown", () => {
    if (state.mode !== "finish") return;
    const seen = localStorage.getItem("sowa3FinishSeen") === "1";
    if (!seen || (state.finishElapsed || 0) < 2200) return;
    state.finishTimer = Math.min(state.finishTimer, 30);
  }, { capture: true });

  const previousUpdateFinish = updateFinish;
  updateFinish = function finishWithSeenFlag(dt) {
    const wasFinish = state.mode === "finish";
    previousUpdateFinish(dt);
    if (wasFinish && (state.finishElapsed || 0) > 2500) {
      localStorage.setItem("sowa3FinishSeen", "1");
    }
  };
})();
