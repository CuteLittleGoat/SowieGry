// PWA: service worker zapisuje menu w pamięci podręcznej — SowieGry startują bez zasięgu.
const { test, expect, waitForCloud, watchErrors } = require("../fixtures");

test.use({ serviceWorkers: "allow" });

test("menu startuje bez zasięgu po pierwszej wizycie", async ({ page, context }) => {
  const errors = watchErrors(page);
  await page.goto("/?seed=pwa", { waitUntil: "load" });
  await waitForCloud(page);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.reload({ waitUntil: "load" });
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await context.setOffline(true);
  await page.reload({ waitUntil: "load" });
  await waitForCloud(page);
  await expect(page.locator(".game-card")).toHaveCount(5);
  await expect(page.locator("#cosmeticsButton")).toBeVisible();
  await context.setOffline(false);
  expect(errors).toEqual([]);
});
