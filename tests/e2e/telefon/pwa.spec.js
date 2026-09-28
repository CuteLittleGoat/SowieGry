// PWA: service worker zapisuje menu w pamięci podręcznej — SowieGry startują bez zasięgu.
const fs = require("fs");
const path = require("path");
const { test, expect, waitForCloud, watchErrors } = require("../fixtures");

test.use({ serviceWorkers: "allow" });

// Lista plików powłoki prosto z sw.js (ta sama, którą service worker zapisuje przy instalacji).
function shellFiles() {
  const source = fs.readFileSync(path.join(__dirname, "../../../sw.js"), "utf8");
  const list = source.match(/const SHELL = \[([\s\S]*?)\];/)[1];
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
  const missing = await page.evaluate(async (files) => {
    const cache = await caches.open("sowiegry-v1");
    const results = await Promise.all(files.map(async (file) => ((await cache.match(file)) ? null : file)));
    return results.filter(Boolean);
  }, shellFiles());
  expect(missing).toEqual([]);

  // Start bez sieci. Playwright w WebKit nie obsługuje przeładowania strony w trybie offline
  // przez service worker („WebKit encountered an internal error”), więc tam kończymy na sprawdzeniu pamięci.
  if (browserName === "chromium") {
    await context.setOffline(true);
    await page.reload({ waitUntil: "load" });
    await waitForCloud(page);
    await expect(page.locator(".game-card")).toHaveCount(5);
    await expect(page.locator("#cosmeticsButton")).toBeVisible();
    await context.setOffline(false);
  }
  expect(errors).toEqual([]);
});
