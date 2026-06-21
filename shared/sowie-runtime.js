// Drobne zabezpieczenia wspólnego rdzenia: throttling zapisu, audio i obsługa modali.
(() => {
  const core = window.SowieCore;
  if (!core) return;

  let adapter = null;
  let pausedBeforeModal = false;

  const originalRegisterGame = core.registerGame;
  core.registerGame = function registerGameWithRuntime(gameAdapter) {
    adapter = gameAdapter || null;
    return originalRegisterGame(gameAdapter);
  };

  // Kilka nakładających się modułów może zgłosić ten sam efekt w jednej klatce.
  // Krótki debounce usuwa zdublowane dźwięki bez blokowania kolejnych zdarzeń.
  const lastSoundAt = new Map();
  const originalPlay = core.play;
  core.play = function playWithoutDuplicates(name) {
    const current = performance.now();
    const previous = lastSoundAt.get(name) || -Infinity;
    if (current - previous < 90) return false;
    lastSoundAt.set(name, current);
    return originalPlay(name);
  };

  const lastCalls = new Map();
  const originalRecordStat = core.recordStat;
  core.recordStat = function throttledRecordStat(key, value, mode = "add") {
    if (key !== "runnerDistance" && key !== "jumperHeight") {
      return originalRecordStat(key, value, mode);
    }
    const current = performance.now();
    const previous = lastCalls.get(`stat:${key}`) || 0;
    if (current - previous < 750) return false;
    lastCalls.set(`stat:${key}`, current);
    return originalRecordStat(key, value, mode);
  };

  const originalProgressMission = core.progressMission;
  core.progressMission = function throttledMission(key, amount = 1) {
    if (key !== "runner1000" && key !== "jumper250") {
      return originalProgressMission(key, amount);
    }
    const current = performance.now();
    const previous = lastCalls.get(`mission:${key}`) || 0;
    if (current - previous < 500) return false;
    lastCalls.set(`mission:${key}`, current);
    return originalProgressMission(key, amount);
  };

  // Zapamiętaj, czy gra była już zapauzowana przed otwarciem modalu.
  document.addEventListener("pointerdown", (event) => {
    const opener = event.target.closest?.("[data-wardrobe], [data-missions], [data-settings]");
    if (opener) pausedBeforeModal = Boolean(adapter?.getPaused?.());
  }, true);

  function restorePauseAfterModal() {
    window.setTimeout(() => {
      const backdrop = document.querySelector(".sowie-modal-backdrop");
      if (backdrop && !backdrop.hidden) return;
      adapter?.setPaused?.(pausedBeforeModal);
      const badge = document.querySelector(".sowie-paused-badge");
      if (badge) badge.hidden = !pausedBeforeModal;
    }, 0);
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest?.("[data-close]")) restorePauseAfterModal();
    if (event.target.classList?.contains("sowie-modal-backdrop")) restorePauseAfterModal();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const backdrop = document.querySelector(".sowie-modal-backdrop");
    if (backdrop && !backdrop.hidden) {
      backdrop.hidden = true;
      restorePauseAfterModal();
    } else if (adapter?.getPaused?.()) {
      adapter.setPaused(false);
      const badge = document.querySelector(".sowie-paused-badge");
      if (badge) badge.hidden = true;
    }
  });
})();
