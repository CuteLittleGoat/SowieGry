// Sowia Ucieczka na telefonach (Analiza 3, E4 i rozdz. 3): start, 5 s biegu z ziarnem, skok, pauza i wznowienie,
// obrót telefonu bez resetu biegu, ukrycie karty, ekran wyników, układ 320 × 568 i zapis w chmurze (emulator).
const { test, expect, waitForCloud, setVisibility, watchErrors } = require("../fixtures");
const { cloudUrl, readDoc, seedDoc, uniqueProject } = require("../emulator");

async function openGame(page, url = "/SowiaUcieczka/?seed=ucieczka-e2e") {
  await page.goto(url, { waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction(() => window.SowiaUcieczka?.ready?.() && window.SowiaUcieczka.atlasReady(), null, {
    timeout: 20_000,
  });
}

const state = (page) => page.evaluate(() => window.SowiaUcieczka.state());

test("start, 5 s biegu z ziarnem i skok po stuknięciu w dowolnym miejscu", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await expect(page.getByRole("heading", { name: "Sowia Ucieczka" })).toBeVisible();
  await expect(page.locator('[data-level="arcade"]')).toHaveAttribute("aria-pressed", "true");
  await page.locator("[data-start]").click();
  await expect(page.locator("[data-title]")).toBeHidden();
  expect(await page.evaluate(() => window.SowiaUcieczka.screen())).toBe("playing");
  await expect(page.getByRole("button", { name: "Pauza" })).toBeVisible();

  const box = await page.locator("[data-stage]").boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.5);
  await expect.poll(async () => (await state(page)).owl.y).toBeLessThan(-0.5);
  await page.waitForTimeout(5000);
  const after = await state(page);
  expect(after.distance).toBeGreaterThan(25);
  expect(after.speed).toBeGreaterThan(6);
  expect(errors).toEqual([]);
});

test("pauza z HUD, wznowienie przez odliczanie 3-2-1; ukrycie karty też pauzuje", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-start]").click();
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: "Pauza" }).click();
  const menu = page.getByRole("dialog", { name: "Pauza" });
  await expect(menu).toBeVisible();
  const frozen = (await state(page)).distance;
  await page.waitForTimeout(600);
  expect((await state(page)).distance).toBe(frozen);
  await menu.getByRole("button", { name: "Wznów" }).click();
  await expect(page.locator(".sowie-countdown")).toHaveText("3");
  await expect.poll(async () => (await state(page)).distance, { timeout: 8000 }).toBeGreaterThan(frozen + 2);

  await setVisibility(page, "hidden");
  await setVisibility(page, "visible");
  await expect(menu).toBeVisible();
  await expect(menu).toContainText("Witaj z powrotem");
  expect(errors).toEqual([]);
});

test("obrót telefonu wstrzymuje bieg, ale go nie resetuje", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-start]").click();
  await page.waitForTimeout(1500);
  const before = await state(page);
  const size = page.viewportSize();
  await page.setViewportSize({ width: size.height, height: size.width });
  const menu = page.getByRole("dialog", { name: "Pauza" });
  await expect(menu).toBeVisible();
  const paused = await state(page);
  expect(paused.distance).toBeGreaterThanOrEqual(before.distance);
  expect(paused.durationMs).toBeGreaterThanOrEqual(before.durationMs);
  await menu.getByRole("button", { name: "Wznów" }).click();
  await expect.poll(async () => (await state(page)).distance, { timeout: 8000 }).toBeGreaterThan(paused.distance + 2);
  expect(await page.evaluate(() => window.SowiaUcieczka.screen())).toBe("playing");
  expect(errors).toEqual([]);
});

test("koniec biegu: wyniki z rekordem i top 10, „Jeszcze raz” zaczyna nowy bieg", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-start]").click();
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.SowiaUcieczka.end());
  const results = page.getByRole("dialog", { name: /Koniec biegu/ });
  await expect(results).toBeVisible();
  await expect(results).toContainText("Nowy rekord!");
  await expect(results).toContainText("1. miejsce");
  await expect(results).toContainText("Dystans");
  const again = results.getByRole("button", { name: "Jeszcze raz" });
  await expect(again).toBeInViewport();
  const recorded = await page.evaluate(() => window.SowieCloud.records("runner", "arcade"));
  expect(recorded.bestScore).toBeGreaterThan(0);
  await again.click();
  await expect(results).toBeHidden();
  expect(await page.evaluate(() => window.SowiaUcieczka.screen())).toBe("playing");
  expect((await state(page)).distance).toBeLessThan(10);
  expect(errors).toEqual([]);
});

test.describe("najmniejszy telefon (320 × 568)", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("ekran tytułowy i HUD mieszczą się bez nakładania i przewijania w bok", async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);
    await expect(page.locator("[data-start]")).toBeInViewport();
    await page.locator("[data-start]").click();
    const boxes = await page.evaluate(() =>
      ["[data-hud-score]", "[data-hud-leaves]", "[data-hud-lives]", ".sowie-hud button"].map((selector) => {
        const rect = document.querySelector(selector).getBoundingClientRect();
        return { selector, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      }),
    );
    for (const item of boxes) {
      expect(item.left, item.selector).toBeGreaterThanOrEqual(0);
      expect(item.right, item.selector).toBeLessThanOrEqual(320);
    }
    const [score, , lives, pause] = boxes;
    for (const [a, b] of [
      [pause, score],
      [score, lives],
    ]) {
      expect(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});

test("zapis w chmurze: rekord w profilu, a wcześniejsze top 10 zostaje (emulator)", async ({ page }, testInfo) => {
  const project = uniqueProject(testInfo);
  await seedDoc(project, "sowiegry/profil", { schemaVersion: 1, records: { runner: { arcade: { bestScore: 5000 } } } });
  await seedDoc(project, "sowiegry/profil/sowiegry_gry/runner", {
    top10: {
      arcade: [{ score: 5000, distance: 1200, difficulty: "arcade", at: 1783656000000, daily: false, seed: null }],
    },
  });
  const errors = watchErrors(page);
  await openGame(page, cloudUrl("/SowiaUcieczka/?seed=ucieczka-chmura", project));
  await expect(page.locator("[data-record]")).toContainText("5000");
  await page.locator("[data-start]").click();
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.SowiaUcieczka.end());
  await expect(page.getByRole("dialog", { name: /Koniec biegu/ })).toContainText("2. miejsce");
  await page.evaluate(() => window.SowieCloud.flush());
  const game = await readDoc(project, "sowiegry/profil/sowiegry_gry/runner");
  expect(game.top10.arcade.map((row) => row.score)[0]).toBe(5000);
  expect(game.top10.arcade).toHaveLength(2);
  const profile = await readDoc(project, "sowiegry/profil");
  expect(profile.records.runner.arcade.bestScore).toBe(5000);
  expect(profile.records.runner.runs).toBe(1);
  expect(errors).toEqual([]);
});
