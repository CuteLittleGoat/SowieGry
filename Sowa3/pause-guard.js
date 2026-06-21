(() => {
  const baseUpdate = update;
  update = function guardedUpdate(dt) {
    const pauseBadge = document.querySelector('.sowie-paused-badge');
    const modal = document.querySelector('.sowie-modal-backdrop');
    if ((pauseBadge && !pauseBadge.hidden) || (modal && !modal.hidden)) return;
    baseUpdate(dt);
  };
})();
