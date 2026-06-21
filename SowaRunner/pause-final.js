// Ostateczna blokada aktualizacji podczas pauzy.
(() => {
  const previousUpdateRun = updateRun;
  updateRun = function pausedSafeRunnerUpdate(dt) {
    const badge = document.querySelector(".sowie-paused-badge");
    const modal = document.querySelector(".sowie-modal-backdrop");
    const paused = Boolean((badge && !badge.hidden) || (modal && !modal.hidden));
    if (paused) return;
    previousUpdateRun(dt);
  };

  const previousUpdateWhale = updateWhale;
  updateWhale = function pausedSafeRunnerWhale(dt) {
    const badge = document.querySelector(".sowie-paused-badge");
    const modal = document.querySelector(".sowie-modal-backdrop");
    const paused = Boolean((badge && !badge.hidden) || (modal && !modal.hidden));
    if (paused) return;
    previousUpdateWhale(dt);
  };
})();
