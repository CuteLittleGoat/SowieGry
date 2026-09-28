// Service worker SowieGry (PWA): start bez zasięgu i szybkie ponowne wejścia.
// Wersjonowana pamięć podręczna — przy każdej zmianie listy SHELL albo strategii podnieś VERSION.
// Nie obsługuje żądań do Firestore (firestore.googleapis.com) — zapisami offline zajmuje się SDK (IndexedDB).
const VERSION = "sowiegry-v1";
const SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/icons/icon.svg",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png",
  "assets/icons/apple-touch-icon.png",
  "assets/icons/favicon-32.png",
  "config/firebase-config.js",
  "shared/cute-ui.css",
  "shared/main-menu.css",
  "shared/game-enhancements.css",
  "shared/owl-gallery.css",
  "shared/sowie-platform.js",
  "shared/sowie-cloud.js",
  "shared/password-gate.js",
  "shared/pwa.js",
  "shared/sowie-core.js",
  "shared/notification-manager.js",
  "shared/game-guides.js",
  "shared/sowie-academy.js",
  "shared/owl-gallery.js",
  "shared/main-menu.js",
];
// Firebase JS SDK (przypięta wersja, pliki niezmienne) — pobierany w tle; błąd nie blokuje instalacji.
const SDK = [
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js",
];
const NETWORK_TIMEOUT_MS = 4000;
const STATIC = /\.(png|jpe?g|webp|gif|svg|ico|woff2?|mp3|ogg|wav)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then(async (cache) => {
      await cache.addAll(SHELL.map((path) => new Request(path, { cache: "reload" })));
      await cache.addAll(SDK).catch(() => {});
      await self.skipWaiting();
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith("sowiegry-") && key !== VERSION).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function store(request, response) {
  if (response && response.ok && (response.type === "basic" || response.type === "cors")) {
    const cache = await caches.open(VERSION);
    await cache.put(request, response.clone());
  }
  return response;
}

// Kod i strony: najpierw sieć (aktualizacje z GitHub Pages od razu), przy braku sieci lub po 4 s — pamięć.
async function networkFirst(request) {
  const cached = caches.match(request, { ignoreSearch: request.mode === "navigate" });
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), NETWORK_TIMEOUT_MS)),
    ]);
    return await store(request, response);
  } catch (error) {
    const hit = await cached;
    if (hit) return hit;
    if (request.mode === "navigate") {
      const menu = await caches.match("./");
      if (menu) return menu;
    }
    throw error;
  }
}

// Obrazki, czcionki, dźwięki i SDK: najpierw pamięć.
async function cacheFirst(request) {
  const hit = await caches.match(request);
  if (hit) return hit;
  return store(request, await fetch(request));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(STATIC.test(url.pathname) ? cacheFirst(request) : networkFirst(request));
  } else if (url.href.startsWith("https://www.gstatic.com/firebasejs/12.19.0/")) {
    event.respondWith(cacheFirst(request));
  }
});
