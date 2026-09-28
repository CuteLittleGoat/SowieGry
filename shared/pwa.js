// Rejestracja service workera SowieGry (PWA: instalacja na telefonie, start bez zasięgu).
// sw.js leży w katalogu głównym strony, więc obejmuje menu i wszystkie gry.
(() => {
  "use strict";

  const script = document.currentScript?.src;
  const secure = location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname);
  if (script && secure && "serviceWorker" in navigator) {
    const base = new URL("../", script);
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(new URL("sw.js", base).href, { scope: base.href })
        .catch((error) => console.warn("SowieGry: service worker niedostępny", error));
    });
  }

  // Android / Chrome: zdarzenie instalacji zapamiętujemy od razu (może przyjść, zanim wczyta się menu).
  let installEvent = null;
  const installListeners = new Set();
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installEvent = event;
    installListeners.forEach((listener) => listener(true));
  });
  window.addEventListener("appinstalled", () => {
    installEvent = null;
    installListeners.forEach((listener) => listener(false));
  });

  window.SowiePwa = Object.freeze({
    // Czy gra działa jako zainstalowana aplikacja (bez paska przeglądarki).
    standalone: () => window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true,
    // Czy przeglądarka pozwala zainstalować aplikację przyciskiem (Android / Chrome).
    canPrompt: () => Boolean(installEvent),
    // Pokazuje systemowe okno instalacji; zwraca "accepted", "dismissed" albo null.
    async prompt() {
      if (!installEvent) return null;
      const event = installEvent;
      installEvent = null;
      event.prompt();
      const choice = await event.userChoice.catch(() => null);
      return choice?.outcome || null;
    },
    onInstallChange(listener) {
      installListeners.add(listener);
      return () => installListeners.delete(listener);
    },
  });
})();
