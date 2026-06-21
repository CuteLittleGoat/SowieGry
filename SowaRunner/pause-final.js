// Ostateczna blokada aktualizacji i animacji podczas pauzy.
(() => {
  function runnerUiPaused() {
    const badge = document.querySelector(".sowie-paused-badge");
    const modal = document.querySelector(".sowie-modal-backdrop");
    return Boolean((badge && !badge.hidden) || (modal && !modal.hidden));
  }

  const previousUpdateRun = updateRun;
  updateRun = function pausedSafeRunnerUpdate(dt) {
    if (runnerUiPaused()) return;
    previousUpdateRun(dt);
  };

  const previousUpdateWhale = updateWhale;
  updateWhale = function pausedSafeRunnerWhale(dt) {
    if (runnerUiPaused()) return;
    previousUpdateWhale(dt);
  };

  const previousUpdateParts = updateParts;
  updateParts = function pausedSafeRunnerParts(dt) {
    if (runnerUiPaused()) return;
    previousUpdateParts(dt);
  };

  // drawBg() przesuwa chmury podczas rysowania. Przy pauzie pozwalamy mu
  // odmalować pełne tło, ale przywracamy ich pozycje po renderze.
  const previousDrawBg = drawBg;
  drawBg = function pausedSafeRunnerBackground() {
    if (!runnerUiPaused()) {
      previousDrawBg();
      return;
    }
    const positions = clouds.map((cloud) => cloud.x);
    previousDrawBg();
    clouds.forEach((cloud, index) => { cloud.x = positions[index]; });
  };

  // Bazowy draw() wygasza shake podczas rysowania. Zachowujemy jego wartość,
  // aby pauza nie zmieniała również tego efektu.
  const previousDraw = draw;
  draw = function pausedSafeRunnerDraw() {
    if (!runnerUiPaused()) {
      previousDraw();
      return;
    }
    const savedShake = shake;
    previousDraw();
    shake = savedShake;
  };
})();
