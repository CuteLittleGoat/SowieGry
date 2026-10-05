// Komunikaty w grach zręcznościowych: w trakcie gry najwyżej 1 naraz, u góry ekranu — nie zasłaniają sowy.
const { test, expect, waitForCloud, watchErrors } = require("../fixtures");

// Sowa w Chmurach (E6, zastąpiła SowaJumper — ostatnią grę zręcznościową na SowieCore): komunikaty z
// shared/ui/toasts.js — w locie 1 naraz, u góry planszy.
test("Sowa w Chmurach: w trakcie gry 1 komunikat u góry ekranu", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/SowaWChmurach/?seed=komunikaty", { waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction(() => window.SowaWChmurach?.ready?.());
  await page.locator("[data-start]").click();
  await expect.poll(() => page.evaluate(() => window.SowaWChmurach.screen())).toBe("playing");

  await page.evaluate(() => {
    window.SowaWChmurach.goat("magnes");
    window.SowaWChmurach.fever();
  });
  const toasts = page.locator(".sowie-toast-chip:not(.is-leaving)");
  await expect(toasts).toHaveCount(1);
  const viewport = page.viewportSize();
  const box = await toasts.first().boundingBox();
  expect(box.y + box.height).toBeLessThan(viewport.height * 0.45);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  // Kolejne komunikaty czekają i pokazują się po kolei.
  await expect(page.locator(".sowie-toast-chip", { hasText: "Gorączka Monster" })).toBeVisible({ timeout: 12_000 });
  expect(errors).toEqual([]);
});

// Sowia Ucieczka (E4, zastąpiła SowaRunner): komunikaty z shared/ui/toasts.js — w biegu 1 naraz, u góry planszy.
test("Sowia Ucieczka: w trakcie gry 1 komunikat u góry ekranu", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/SowiaUcieczka/?seed=komunikaty", { waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction(() => window.SowiaUcieczka?.ready?.());
  await page.locator("[data-start]").click();
  await expect.poll(() => page.evaluate(() => window.SowiaUcieczka.screen())).toBe("playing");

  // Trzy komunikaty naraz: dwie kózki i trafienie pochłonięte przez Tarczę.
  await page.evaluate(() => {
    window.SowiaUcieczka.goat("tarcza");
    window.SowiaUcieczka.goat("magnes");
    window.SowiaUcieczka.hit("pracu");
  });
  const toasts = page.locator(".sowie-toast-chip:not(.is-leaving)");
  await expect(toasts).toHaveCount(1);
  await expect(toasts.first()).toContainText("Kózka Tarcza");

  // Komunikat jest w górnej części ekranu (sowa i tor zostają odsłonięte) i nie wychodzi poza szerokość.
  const viewport = page.viewportSize();
  const box = await toasts.first().boundingBox();
  expect(box.y + box.height).toBeLessThan(viewport.height * 0.45);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  // Kolejne komunikaty czekają i pokazują się po kolei.
  await expect(page.locator(".sowie-toast-chip", { hasText: "Kózka Magnes" })).toBeVisible({ timeout: 8000 });
  expect(errors).toEqual([]);
});

// Sowie Tory (E5, zastąpiły Sowa3): komunikaty z shared/ui/toasts.js — w biegu 1 naraz, u góry planszy.
test("Sowie Tory: w trakcie gry 1 komunikat u góry ekranu", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/SowieTory/?seed=komunikaty&plansza=2", { waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction(() => window.SowieTory?.ready?.());
  await page.locator("[data-start]").click();
  await expect.poll(() => page.evaluate(() => window.SowieTory.screen())).toBe("playing");

  // Kózka i Gorączka Monster naraz: widać pierwszy komunikat, drugi czeka w kolejce.
  await page.evaluate(() => {
    window.SowieTory.goat("turbo");
    window.SowieTory.fever();
  });
  const toasts = page.locator(".sowie-toast-chip:not(.is-leaving)");
  await expect(toasts).toHaveCount(1);
  await expect(toasts.first()).toContainText("Kózia jazda!");

  const viewport = page.viewportSize();
  const box = await toasts.first().boundingBox();
  expect(box.y + box.height).toBeLessThan(viewport.height * 0.45);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  await expect(page.locator(".sowie-toast-chip", { hasText: "Gorączka Monster!" })).toBeVisible({ timeout: 8000 });
  expect(errors).toEqual([]);
});
