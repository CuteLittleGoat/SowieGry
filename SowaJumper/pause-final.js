// Ostateczna blokada wszystkich warstw aktualizacji podczas pauzy.
(() => {
  function isPaused() {
    const badge = document.querySelector(".sowie-paused-badge");
    const modal = document.querySelector(".sowie-modal-backdrop");
    return Boolean((badge && !badge.hidden) || (modal && !modal.hidden));
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
