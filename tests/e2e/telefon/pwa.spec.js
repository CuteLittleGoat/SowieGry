// PWA: service worker zapisuje menu w pamięci podręcznej — SowieGry startują bez zasięgu.
const fs = require("fs");
const path = require("path");
const { test, expect, waitForCloud, watchErrors } = require("../fixtures");

test.use({ serviceWorkers: "allow" });

// Lista plików powłoki i wersja pamięci prosto z sw.js (te same, których używa service worker).
const SW_SOURCE = fs.readFileSync(path.join(__dirname, "../../../sw.js"), "utf8");
const CACHE_VERSION = SW_SOURCE.match(/const VERSION = "([^"]+)"/)[1];
function shellFiles() {
  const list = SW_SOURCE.match(/const SHELL = \[([\s\S]*?)\];/)[1];
  return [...list.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

test("menu startuje bez zasięgu po pierwszej wizycie", async ({ page, context, browserName }) => {
  const errors = watchErrors(page);
  await page.goto("/?seed=pwa", { waitUntil: "load" });
  await waitForCloud(page);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.reload({ waitUntil: "load" });
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  // Wszystkie pliki powłoki są w pamięci podręcznej bieżącej wersji.
  const missing = await page.evaluate(
    async ({ files, version }) => {
      const cache = await caches.open(version);
      const results = await Promise.all(files.map(async (file) => ((await cache.match(file)) ? null : file)));
      return results.filter(Boolean);
    },
    { files: shellFiles(), version: CACHE_VERSION },
  );
  expect(missing).toEqual([]);

  // Start bez sieci. Playwright w WebKit nie obsługuje przeładowania strony w trybie offline
  // przez service worker („WebKit encountered an internal error”), więc tam kończymy na sprawdzeniu pamięci.
  if (browserName === "chromium") {
    await context.setOffline(true);
    await page.reload({ waitUntil: "load" });
    await waitForCloud(page);
    await expect(page.locator(".game-card")).toHaveCount(5);
    await expect(page.getByRole("tab")).toHaveCount(4);
    // Grafiki postaci (SVG w pamięci startowej) też są dostępne bez sieci.
    await page.waitForFunction(() => window.SowieMenu?.atlas?.ready?.() === true);
    await context.setOffline(false);
  }
  expect(errors).toEqual([]);
});
