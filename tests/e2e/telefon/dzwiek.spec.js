// Sowie Laboratorium, dział „Dźwięk”: odblokowanie dotknięciem, efekty, muzyka, ściszanie i suwaki zapisane w profilu.
const { test, expect, waitForCloud, watchErrors } = require("../fixtures");

test("dźwięk startuje po dotknięciu, gra efekty i muzykę, a suwaki zapisują się w profilu", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/lab/?seed=dzwiek&dzial=dzwiek", { waitUntil: "load" });
  await waitForCloud(page);
  await page.evaluate(() => window.SowieLab.soundReady);
  const status = page.locator("[data-audio-status]");
  await expect(status).toContainText("czeka na dotknięcie");

  // Wszystkie przyciski dźwięku są wygodne dla palca.
  const buttons = page.locator('[data-panel="dzwiek"] .lab-sound-grid button');
  expect(await buttons.count()).toBeGreaterThanOrEqual(29);
  for (const box of await buttons.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height))) {
    expect(box).toBeGreaterThanOrEqual(48);
  }

  // Pierwsze dotknięcie odblokowuje dźwięk i gra efekt.
  await page.getByRole("button", { name: "Skok", exact: true }).tap();
  await expect(status).toContainText("Dźwięk: działa");
  await expect
    .poll(() => page.evaluate(async () => (await window.SowieLab.soundReady).audio.stats().played))
    .toBeGreaterThanOrEqual(1);
  await expect(status).toContainText(/efekty wczytane: (2[5-9]|3\d)\//);
  expect(await page.evaluate(async () => (await window.SowieLab.soundReady).audio.stats().failed)).toBe(0);

  // Muzyka menu w pętli, ściszanie i zatrzymanie.
  const menu = page.getByRole("button", { name: "Motyw menu" });
  await menu.scrollIntoViewIfNeeded();
  await menu.tap();
  await expect(menu).toHaveAttribute("aria-pressed", "true");
  const loop = await page.evaluate(async () => {
    const { audio } = await window.SowieLab.soundReady;
    return { music: audio.currentMusic(), context: audio.state().context };
  });
  expect(loop).toEqual({ music: "menu", context: "running" });
  const duck = page.getByRole("button", { name: "Ścisz muzykę (jak w bonusie)" });
  await duck.tap();
  await expect(duck).toHaveAttribute("aria-pressed", "true");
  await duck.tap();
  await expect(duck).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Pieśń humbaka" }).tap();
  await expect(page.getByRole("button", { name: "Pieśń humbaka" })).toHaveAttribute("aria-pressed", "true");
  await expect(menu).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Zatrzymaj muzykę" }).tap();
  await expect(page.getByRole("button", { name: "Pieśń humbaka" })).toHaveAttribute("aria-pressed", "false");

  // Suwak głośności muzyki: silnik i profil (settings.volumeMusic).
  const slider = page.locator('[data-volume="music"]');
  await slider.scrollIntoViewIfNeeded();
  await slider.fill("35");
  await expect(page.locator('[data-volume-value="music"]')).toHaveText("35");
  expect(await page.evaluate(async () => (await window.SowieLab.soundReady).audio.volume("music"))).toBe(35);
  expect(await page.evaluate(() => window.SowieCloud.profile().settings.volumeMusic)).toBe(35);

  // Seria liści (combo) gra kolejne, coraz wyższe dźwięki.
  const before = await page.evaluate(async () => (await window.SowieLab.soundReady).audio.stats().played);
  await page.getByRole("button", { name: "Seria liści (combo)" }).tap();
  await expect
    .poll(
      async () => (await page.evaluate(async () => (await window.SowieLab.soundReady).audio.stats().played)) - before,
    )
    .toBeGreaterThanOrEqual(8);

  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});
