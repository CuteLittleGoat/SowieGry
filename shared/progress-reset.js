// Warstwa zgodności. Właściwe migracje i kopie zapasowe obsługuje SowiePlatform.
(() => {
  "use strict";

  if (!window.SowiePlatform && document.currentScript?.src) {
    const platformUrl = new URL("sowie-platform.js", document.currentScript.src).href;
    document.write(`<script src="${platformUrl}"><\/script>`);
  }

  if (!window.SowiePlatform) {
    console.error("Nie udało się załadować SowiePlatform.");
    return;
  }

  window.SowiePlatform.migrateLegacyStorage();
})();