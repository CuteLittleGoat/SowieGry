// Service worker SowieGry (PWA): start bez zasięgu i szybkie ponowne wejścia.
// Wersjonowana pamięć podręczna — przy każdej zmianie listy SHELL albo strategii podnieś VERSION.
// Nie obsługuje żądań do Firestore (firestore.googleapis.com) — zapisami offline zajmuje się SDK (IndexedDB).
const VERSION = "sowiegry-v10";
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
  "assets/fonts/fredoka-500.woff2",
  "assets/fonts/fredoka-700.woff2",
  "config/firebase-config.js",
  "shared/cute-ui.css",
  "shared/world/tokens.css",
  "shared/ui/ui.css",
  "shared/menu/menu.css",
  "shared/sowie-platform.js",
  "shared/sowie-cloud.js",
  "shared/password-gate.js",
  "shared/pwa.js",
  "shared/owl-gallery.js",
  "shared/menu/menu.js",
  "shared/menu/games.js",
  "shared/menu/gallery.js",
  "shared/menu/guides.js",
  "shared/menu/owl-tab.js",
  "shared/menu/install.js",
  "shared/menu/cloud-status.js",
  "shared/engine/assets.js",
  "shared/engine/audio.js",
  "shared/engine/loop.js",
  "shared/engine/sprites.js",
  "shared/meta/guides-data.js",
  "shared/meta/academy.js",
  "shared/meta/progress.js",
  "shared/meta/progress-events.js",
  "shared/meta/missions.js",
  "shared/ui/guide-view.js",
  "shared/ui/icons.js",
  "shared/ui/modal.js",
  "shared/ui/toasts.js",
  "shared/world/catalog.js",
  "shared/world/owl.js",
  "shared/world/tokens.js",
  "assets/audio/audio.json",
  "assets/audio/sfx/klik.mp3",
  "assets/audio/sfx/hu-hu.mp3",
  "assets/audio/sfx/zakup.mp3",
  "assets/audio/sfx/rekord.mp3",
  "assets/svg/amic/barierka.svg",
  "assets/svg/amic/cysterna.svg",
  "assets/svg/amic/dystrybutor.svg",
  "assets/svg/amic/kanister.svg",
  "assets/svg/amic/sterowiec.svg",
  "assets/svg/amic/wozek.svg",
  "assets/svg/amic/znak-cen.svg",
  "assets/svg/garderoba/babelek.svg",
  "assets/svg/garderoba/babelki.svg",
  "assets/svg/garderoba/czapka.svg",
  "assets/svg/garderoba/kapelusz-ogrodnika.svg",
  "assets/svg/garderoba/kokardka.svg",
  "assets/svg/garderoba/okulary.svg",
  "assets/svg/garderoba/plecak-szelki.svg",
  "assets/svg/garderoba/plecak.svg",
  "assets/svg/garderoba/szalik.svg",
  "assets/svg/garderoba/wianek.svg",
  "assets/svg/humbak/humbak.svg",
  "assets/svg/humbak/plusk.svg",
  "assets/svg/interfejs/serduszko-doniczka.svg",
  "assets/svg/interfejs/serduszko-puste.svg",
  "assets/svg/kozki/koza-magnes.svg",
  "assets/svg/kozki/koza-podwajaczka.svg",
  "assets/svg/kozki/koza-skok.svg",
  "assets/svg/kozki/koza-sprezynka.svg",
  "assets/svg/kozki/koza-tarcza.svg",
  "assets/svg/kozki/koza-turbo.svg",
  "assets/svg/kozki/koza.svg",
  "assets/svg/liscie/teczowy.svg",
  "assets/svg/liscie/zielony.svg",
  "assets/svg/liscie/zloty.svg",
  "assets/svg/pracu/budzik.svg",
  "assets/svg/pracu/dymek.svg",
  "assets/svg/pracu/mail.svg",
  "assets/svg/pracu/tablica.svg",
  "assets/svg/pracu/teczka.svg",
  "assets/svg/pracu/telefon.svg",
  "assets/svg/sowa/cialo.svg",
  "assets/svg/sowa/gwiazdki.svg",
  "assets/svg/sowa/oczy-oszolomione.svg",
  "assets/svg/sowa/oczy-radosc.svg",
  "assets/svg/sowa/oczy-zamkniete.svg",
  "assets/svg/sowa/oczy.svg",
  "assets/svg/sowa/skrzydlo-lewe.svg",
  "assets/svg/sowa/skrzydlo-prawe.svg",
  "assets/svg/sowa/stopa-lewa.svg",
  "assets/svg/sowa/stopa-prawa.svg",
  "assets/svg/sowa/zrenice.svg",
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
