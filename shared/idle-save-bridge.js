// Wywołuje istniejącą akcję zapisu gry niezależnie od fazy requestAnimationFrame.
(() => {
  "use strict";

  const AUTOSAVE_INTERVAL_MS = 7000;
  const panel = document.getElementById("panelContent");
  if (!panel) return;

  let lastSaveAt = performance.now();
  let timer = 0;

  function requestSave(reason = "auto") {
    const button = document.createElement("button");
    button.type = "button";
    button.hidden = true;
    button.dataset.save = reason;
    button.dataset.saveManual = reason;
    panel.appendChild(button);
    button.click();
    button.remove();
    window.SowiePlatform?.emit?.("save:requested", { reason });
    lastSaveAt = performance.now();
  }

  function schedule() {
    clearTimeout(timer);
    const elapsed = performance.now() - lastSaveAt;
    timer = window.setTimeout(() => {
      requestSave("auto");
      schedule();
    }, Math.max(250, AUTOSAVE_INTERVAL_MS - elapsed));
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) requestSave("visibilitychange");
  });
  window.addEventListener("pagehide", () => requestSave("pagehide"));
  window.addEventListener("beforeunload", () => requestSave("beforeunload"));

  schedule();
  window.SowieIdleSave = { requestSave };
})();