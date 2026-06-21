// Drobne zabezpieczenia wspólnego rdzenia: throttling zapisu i obsługa modali.
(() => {
  const core = window.SowieCore;
  if (!core) return;

  let adapter = null;
  const originalRegisterGame = core.registerGame;
  core.registerGame = function registerGameWithRuntime(gameAdapter) {
    adapter = gameAdapter || null;
    return originalRegisterGame(gameAdapter);
  };

  const lastCalls = new Map();
  const originalRecordStat = core.recordStat;
  core.recordStat = function throttledRecordStat(key, value, mode = "add") {
    if (key !== "runnerDistance" && key !== "jumperHeight") {
      return originalRecordStat(key, value, mode);
    }
    const now = performance.now();
    const previous = lastCalls.get(`stat:${key}`) || 0;
    if (now - previous < 750) return false;
    lastCalls.set(`stat:${key}`, now);
    return originalRecordStat(key, value, mode);
  };

  const originalProgressMission = core.progressMission;
  core.progressMission = function throttledMission(key, amount = 1) {
    if (key !== "runner1000" && key !== "jumper250") {
      return originalProgressMission(key, amount);
    }
    const now = performance.now();
    const previous = lastCalls.get(`mission:${key}`) || 0;
    if (now - previous < 500) return false;
    lastCalls.set(`mission:${key}`, now);
    return originalProgressMission(key, amount);
  };

  function resumeAfterModal() {
    window.setTimeout(() => {
      const backdrop = document.querySelector(".sowie-modal-backdrop");
      if (backdrop && !backdrop.hidden) return;
      adapter?.setPaused?.(false);
      const badge = document.querySelector(".sowie-paused-badge");
      if (badge) badge.hidden = true;
    }, 0);
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest?.("[data-close]")) resumeAfterModal();
    if (event.target.classList?.contains("sowie-modal-backdrop")) resumeAfterModal();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const backdrop = document.querySelector(".sowie-modal-backdrop");
    if (backdrop && !backdrop.hidden) {
      backdrop.hidden = true;
      resumeAfterModal();
    } else if (adapter?.getPaused?.()) {
      adapter.setPaused(false);
      const badge = document.querySelector(".sowie-paused-badge");
      if (badge) badge.hidden = true;
    }
  });
})();
