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

// WebKit można wyłączyć tylko lokalnie i tylko jawnie (środowisko bez przeglądarki WebKit).
// W CI zmienna nie jest ustawiana, więc WebKit biegnie zawsze.
const skipWebkit = process.env.SOWIE_E2E_BEZ_WEBKIT === "1" && !process.env.CI;
if (skipWebkit) {
  console.warn("[playwright] SOWIE_E2E_BEZ_WEBKIT=1 — projekty WebKit pominięte w tym uruchomieniu (tylko lokalnie).");
}

const phoneProjects = PHONE_PROFILES.flatMap((profile) =>
  ENGINES.filter((engine) => !(skipWebkit && engine === "webkit")).map((engine) => ({
    name: `telefon-${profile.id}-${engine}`,
    testDir: "./tests/e2e/telefon",
    use: { ...profile.device, browserName: engine },
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
    {
      // Testy obecnych (starych) gier zostają na desktopowym Chromium.
      name: "desktop-chromium",
      testIgnore: "**/telefon/**",
      use: { ...devices["Desktop Chrome"] },
    },
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
