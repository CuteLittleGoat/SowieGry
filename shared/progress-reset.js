// Warstwa zgodności. Właściwe migracje i kopie zapasowe obsługuje SowiePlatform.
(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src;

  function loadPlatform() {
    if (window.SowiePlatform) return Promise.resolve(window.SowiePlatform);
    if (!scriptUrl) return Promise.reject(new Error("Brak adresu skryptu zgodności."));

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL("sowie-platform.js", scriptUrl).href;
      script.async = false;
      script.addEventListener("load", () => resolve(window.SowiePlatform), { once: true });
      script.addEventListener("error", () => reject(new Error("Nie udało się pobrać SowiePlatform.")), { once: true });
      document.head.appendChild(script);
    });
  }

  const ready = window.SowiePlatformReady || loadPlatform();
  window.SowiePlatformReady = ready;
  ready
    .then((platform) => {
      if (!platform) throw new Error("SowiePlatform nie zainicjalizował API.");
      platform.migrateLegacyStorage();
      return platform;
    })
    .catch((error) => console.error(error.message));
})();
