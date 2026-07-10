// Warstwa zgodności. Właściwe migracje i kopie zapasowe obsługuje SowiePlatform.
(() => {
  "use strict";

  if (!window.SowiePlatform) {
    console.error("SowiePlatform musi zostać załadowany przed progress-reset.js.");
    return;
  }

  window.SowiePlatform.migrateLegacyStorage();
})();