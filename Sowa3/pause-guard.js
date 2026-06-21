// Końcowa blokada wszystkich warstw aktualizacji podczas pauzy.
(() => {
  const baseUpdate = update;
  let wasPaused = false;
  let pauseStartedAt = 0;

  function guardedPauseState() {
    const pauseBadge = document.querySelector(".sowie-paused-badge");
    const modal = document.querySelector(".sowie-modal-backdrop");
    const paused = Boolean((pauseBadge && !pauseBadge.hidden) || (modal && !modal.hidden));
    const current = now();

    if (paused && !wasPaused) {
      wasPaused = true;
      pauseStartedAt = current;
    } else if (!paused && wasPaused) {
      const pausedFor = Math.max(0, current - pauseStartedAt);
      if (state.messageUntil > pauseStartedAt) state.messageUntil += pausedFor;
      if ((state._cuteHurtUntil || 0) > pauseStartedAt) state._cuteHurtUntil += pausedFor;
      wasPaused = false;
      pauseStartedAt = 0;
    }

    return paused;
  }

  update = function guardedUpdate(dt) {
    if (guardedPauseState()) return;
    baseUpdate(dt);
  };
})();
