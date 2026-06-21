// Ostateczna blokada wszystkich warstw aktualizacji podczas pauzy.
(() => {
  let wasPaused = false;
  let pauseStartedAt = 0;

  function shiftFutureTimestamp(target, key, delta) {
    if (Number(target?.[key] || 0) > pauseStartedAt) target[key] += delta;
  }

  function isPaused() {
    const badge = document.querySelector(".sowie-paused-badge");
    const modal = document.querySelector(".sowie-modal-backdrop");
    const paused = Boolean((badge && !badge.hidden) || (modal && !modal.hidden));
    const current = now();

    if (paused && !wasPaused) {
      wasPaused = true;
      pauseStartedAt = current;
    } else if (!paused && wasPaused) {
      const pausedFor = Math.max(0, current - pauseStartedAt);
      shiftFutureTimestamp(state, "messageUntil", pausedFor);
      shiftFutureTimestamp(state, "invincibleUntil", pausedFor);
      shiftFutureTimestamp(owl, "_cuteHurtUntil", pausedFor);
      shiftFutureTimestamp(owl, "_cuteSquashUntil", pausedFor);
      for (const platform of platforms) {
        if (platform.brokenAt) platform.brokenAt += pausedFor;
      }
      wasPaused = false;
      pauseStartedAt = 0;
    }

    return paused;
  }

  const previousUpdateGame = updateGame;
  updateGame = function pausedSafeJumperGame(delta) {
    if (isPaused()) return;
    previousUpdateGame(delta);
  };

  const previousUpdateBonus = updateBonus;
  updateBonus = function pausedSafeJumperBonus(delta) {
    if (isPaused()) return;
    previousUpdateBonus(delta);
  };

  const previousUpdateTitle = updateTitle;
  updateTitle = function pausedSafeJumperTitle(delta) {
    if (isPaused()) return;
    previousUpdateTitle(delta);
  };
})();
