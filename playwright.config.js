const { defineConfig, devices } = require("@playwright/test");

// Profile telefonów (Analiza 3, E0.2). Każdy profil biegnie w Chromium i WebKit (Safari).
const PHONE_PROFILES = [
  { id: "iphone-se", device: devices["iPhone SE"] },
  { id: "iphone-13", device: devices["iPhone 13"] },
  { id: "pixel-7", device: devices["Pixel 7"] },
  {
    id: "android-360x800",
    device: {
      userAgent:
        "Mozilla/5.0 (Linux; Android 14; SM-A145R) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
      viewport: { width: 360, height: 800 },
      screen: { width: 360, height: 800 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    },
  },
  { id: "iphone-13-poziomo", device: devices["iPhone 13 landscape"] },
];

const ENGINES = ["chromium", "webkit"];

// WebKit (silnik Safari) biegnie tylko na profilach iPhone'ów — na telefonach z Androidem działa Chrome, który
// sprawdzają projekty Chromium (krok T0, 2026-11-24; Analiza 8, rozdz. 17.4).
const WEBKIT_PROFILES = new Set(["iphone-se", "iphone-13", "iphone-13-poziomo"]);

// SOWIE_E2E_SILNIK=chromium | webkit — tylko jeden silnik. W GitHubie biegną dwa równoległe zadania: „jakość +
// Chromium” i „WebKit” (.github/workflows/js-check.yml). Bez zmiennej — oba silniki.
const engineOnly = ENGINES.includes(process.env.SOWIE_E2E_SILNIK) ? process.env.SOWIE_E2E_SILNIK : null;

// WebKit można też wyłączyć lokalnie (środowisko bez przeglądarki WebKit) — w CI ta zmienna jest ignorowana.
const localNoWebkit = process.env.SOWIE_E2E_BEZ_WEBKIT === "1" && !process.env.CI;
if (localNoWebkit) {
  console.warn("[playwright] SOWIE_E2E_BEZ_WEBKIT=1 — projekty WebKit pominięte w tym uruchomieniu (tylko lokalnie).");
}
const skipWebkit = localNoWebkit || engineOnly === "chromium";
const skipChromium = engineOnly === "webkit";

// Chromium z innego miejsca niż pobrane przez Playwrighta — tylko lokalnie i tylko jawnie (kontener, w którym są
// przeglądarki dla innej wersji Playwrighta niż przypięta w package.json). W CI zmienna nie jest ustawiana.
const chromiumPath = process.env.CI ? "" : process.env.SOWIE_CHROMIUM || "";
const chromiumLaunch = chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {};

const phoneProjects = PHONE_PROFILES.flatMap((profile) =>
  ENGINES.filter((engine) =>
    engine === "webkit" ? !skipWebkit && WEBKIT_PROFILES.has(profile.id) : !skipChromium,
  ).map((engine) => ({
    name: `telefon-${profile.id}-${engine}`,
    testDir: "./tests/e2e/telefon",
    use: { ...profile.device, browserName: engine, ...(engine === "chromium" ? chromiumLaunch : {}) },
  })),
);

module.exports = defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Service worker (PWA) wyłączony w testach — nie przechwytuje żądań; testy PWA włączają go jawnie.
    serviceWorkers: "block",
  },
  projects: [
    // Testy obecnych (starych) gier zostają na desktopowym Chromium.
    ...(skipChromium
      ? []
      : [
          {
            name: "desktop-chromium",
            testIgnore: "**/telefon/**",
            use: { ...devices["Desktop Chrome"], ...chromiumLaunch },
          },
        ]),
    // Nowe testy biegną od początku na profilach telefonów.
    ...phoneProjects,
  ],
  webServer: {
    command: "npm run serve",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
