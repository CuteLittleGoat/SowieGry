// Sowie Laboratorium na telefonie: gesty z martwymi strefami, auto-pauza z odliczaniem, oszczędzanie baterii.
const { test, expect, setVisibility, waitForCloud, watchErrors } = require("../fixtures");

async function openLab(page) {
  const errors = watchErrors(page);
  await page.goto("/lab/?seed=laboratorium&dzial=gesty", { waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction(() => Boolean(window.SowieLab));
  const stage = await page.locator("[data-stage]").boundingBox();
  return { errors, stage, cx: stage.x + stage.width / 2, cy: stage.y + stage.height / 2 };
}

async function swipe(page, from, to) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 3 });
  await page.mouse.up();
}

test("gesty: stuknięcie, przesunięcia, przytrzymanie i martwe strefy przy krawędziach", async ({ page }) => {
  const { errors, stage, cx, cy } = await openLab(page);
  const last = page.locator("[data-last-gesture]");

  await page.touchscreen.tap(cx, cy);
  await expect(last).toHaveText("Stuknięcie");

  for (const [dx, dy, text] of [
    [-90, 0, "Przesunięcie w lewo"],
    [90, 0, "Przesunięcie w prawo"],
    [0, -90, "Przesunięcie w górę"],
    [0, 90, "Przesunięcie w dół"],
  ]) {
    await swipe(page, { x: cx, y: cy }, { x: cx + dx, y: cy + dy });
    await expect(last).toHaveText(text);
  }

  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await expect(last).toHaveText("Przytrzymanie");
  await page.mouse.up();
  await expect(page.locator("[data-gesture-log]")).toContainText("Przytrzymanie");

  // Gest od lewej krawędzi (systemowe „cofnij”) i przy pasku domowym jest pomijany.
  await swipe(page, { x: stage.x + 5, y: cy }, { x: stage.x + 120, y: cy });
  await expect(last).toHaveText("Martwa strefa (gest pominięty)");
  await page.touchscreen.tap(cx, cy);
  await expect(last).toHaveText("Stuknięcie");
  await page.touchscreen.tap(stage.x + stage.width - 4, cy);
  await expect(last).toHaveText("Martwa strefa (gest pominięty)");
  await page.touchscreen.tap(cx, cy);
  await page.touchscreen.tap(cx, stage.y + stage.height - 5);
  await expect(last).toHaveText("Martwa strefa (gest pominięty)");

  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test("auto-pauza po przejściu w tło i powrót przez odliczanie 3-2-1", async ({ page }) => {
  const { errors } = await openLab(page);
  await setVisibility(page, "hidden");
  const dialog = page.getByRole("dialog", { name: "Pauza" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Witaj z powrotem");
  expect(await page.evaluate(() => window.SowieLab.loop.isPaused())).toBe(true);
  await setVisibility(page, "visible");

  const resume = dialog.getByRole("button", { name: "Graj dalej" });
  const box = await resume.boundingBox();
  const viewport = page.viewportSize();
  expect(box.height).toBeGreaterThanOrEqual(48);
  expect(box.y + box.height / 2).toBeGreaterThan(viewport.height / 2);
  await resume.tap();
  await expect(page.locator(".sowie-countdown")).toHaveText("3");
  await expect(page.locator(".sowie-countdown")).toHaveText("2", { timeout: 2500 });
  await expect(dialog).toBeHidden({ timeout: 5000 });
  expect(await page.evaluate(() => window.SowieLab.loop.isPaused())).toBe(false);
  expect(errors).toEqual([]);
});

test("informacje o urządzeniu i tryb „Oszczędzanie baterii” zapisany w profilu", async ({ page }) => {
  const { errors } = await openLab(page);
  await page.getByRole("button", { name: "Informacje" }).tap();
  await expect(page.locator('[data-info="fps"]')).toHaveText(/\d+ kl\.\/s/);
  await expect(page.locator('[data-info="safe"]')).toContainText("góra");
  await expect(page.locator('[data-info="mode"]')).toHaveText("przeglądarka");

  const saver = page.getByRole("button", { name: "Oszczędzanie baterii" });
  await saver.tap();
  await expect(saver).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-info="saver"]')).toHaveText("włączone (30 kl./s)");
  expect(await page.evaluate(() => window.SowieCloud.profile().settings.batterySaver)).toBe(true);

  await page.getByRole("button", { name: "Pokaż propozycję oszczędzania" }).tap();
  await expect(page.locator(".sowie-slow-banner")).toContainText("Oszczędzanie baterii");
  await page.getByRole("button", { name: "Nie teraz" }).tap();
  await expect(page.locator(".sowie-slow-banner")).toHaveCount(0);

  await page.getByRole("button", { name: "Test pauzy i odliczania" }).tap();
  await expect(page.getByRole("dialog", { name: "Pauza" })).toBeVisible();
  expect(errors).toEqual([]);
});
