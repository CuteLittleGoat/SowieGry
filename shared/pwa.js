// Rejestracja service workera SowieGry (PWA: instalacja na telefonie, start bez zasięgu).
// sw.js leży w katalogu głównym strony, więc obejmuje menu i wszystkie gry.
(() => {
  "use strict";

  const script = document.currentScript?.src;
  if (!script || !("serviceWorker" in navigator)) return;
  const secure = location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname);
  if (!secure) return;
  const base = new URL("../", script);

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(new URL("sw.js", base).href, { scope: base.href })
      .catch((error) => console.warn("SowieGry: service worker niedostępny", error));
  });

  // Czy gra działa jako zainstalowana aplikacja (bez paska przeglądarki).
  window.SowiePwa = Object.freeze({
    standalone: () => window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true,
  });
})();
