// Sowa w Chmurach (wersja podglądowa nowej SowaJumper, Analiza 3, E6) na telefonach: start, przeciąganie palcem
// (ruch względny), klawiatura, strefy wysokości, ratunek kózki, pauza, koniec lotu z wynikami i zapis rekordu
// „jumper” (wynik i wysokość) w chmurze.
const { test, expect, swipe: swipeFrom, waitForCloud, watchErrors } = require("../fixtures");
const { cloudUrl, readDoc, uniqueProject } = require("../emulator");

async function openGame(page, url = "/SowaWChmurach/?seed=chmury-e2e") {
  await page.goto(url, { waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction(() => window.SowaWChmurach?.ready?.() && window.SowaWChmurach.atlasReady(), null, {
    timeout: 20_000,
  });
}

const state = (page) => page.evaluate(() => window.SowaWChmurach.state());

// Przeciągnięcie palcem w bok w dolnej części planszy.
async function drag(page, dx) {
  const box = await page.locator("[data-stage]").boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height * 0.82;
  await swipeFrom(page, { x, y }, { x: x + dx, y }, 6);
}

test("Sowa w Chmurach: przeciąganie palcem przesuwa sowę w bok, klawiatura, sowa sama odbija się w górę", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  await expect(page.getByRole("heading", { name: "Sowa w Chmurach" })).toBeVisible();
  await expect(page.locator("[data-preview]")).toContainText("Wersja podglądowa");
  await page.locator("[data-start]").click();
  await expect(page.locator("[data-title]")).toBeHidden();
  expect(await page.evaluate(() => window.SowaWChmurach.screen())).toBe("playing");
  await expect(page.locator(".chmury-height")).toContainText("m · Ogródek");

  // Sowa sama się wybija (z ziemi ogródka).
  await expect.poll(async () => (await state(page)).owl.y, { timeout: 10_000 }).toBeGreaterThan(0.5);
  // Przeciągnięcie o 60 px w prawo: sowa o 60 px × (metry na piksel) × 1,25 w prawo (ruch względny).
  const before = (await state(page)).owl.x;
  const meters = 60 * (await page.evaluate(() => window.SowaWChmurach.metersPerPixel()));
  await drag(page, 60);
  await expect
    .poll(async () => (await state(page)).owl.x, { timeout: 5000 })
    .toBeCloseTo((before + meters * 1.25) % 9, 1);
  // Klawiatura: ← trzymane przesuwa sowę w lewo.
  const right = (await state(page)).owl.x;
  await page.keyboard.down("ArrowLeft");
  await expect.poll(async () => (await state(page)).owl.x, { timeout: 5000 }).toBeLessThan(right - 0.5);
  await page.keyboard.up("ArrowLeft");
  expect(errors).toEqual([]);
});

test("Sowa w Chmurach: strefa Blok po 150 m, upadek — kózka ratuje sowę (−1 życie)", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-start]").click();
  await page.evaluate(() => window.SowaWChmurach.warp(160));
  await expect(page.locator(".sowie-toast-chip", { hasText: "Strefa: Blok!" })).toBeVisible();
  await expect(page.locator(".chmury-height")).toContainText("m · Blok");
  expect((await state(page)).lives).toBe(3);
  await page.evaluate(() => window.SowaWChmurach.fall());
  await expect.poll(async () => (await state(page)).phase).toBe("rescue");
  await expect(page.locator(".sowie-toast-chip", { hasText: "Kózka łapie sowę" })).toBeVisible();
  expect((await state(page)).lives).toBe(2);
  await page.evaluate(() => window.SowaWChmurach.advance(2));
  expect((await state(page)).phase).toBe("run");
  expect((await state(page)).rescues).toBe(1);
  expect(errors).toEqual([]);
});

test("Sowa w Chmurach: dymek Pracu zdeptany z góry (+50), sterowiec Amic trafia (−1 życie)", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-start]").click();
  // Logika krokami po 1/120 s (bez czekania na klatki): sowa opada, pod jej stopami dymek.
  const result = await page.evaluate(() => {
    const game = window.SowaWChmurach;
    game.warp(60);
    for (let index = 0; index < 240 && game.state().owl.vy > -3; index += 1) game.advance(1 / 120);
    const before = game.state();
    game.hazard("dymek", 0, -0.36, { phase: -before.time * 2 });
    for (let index = 0; index < 10 && game.state().stomps === 0; index += 1) game.advance(1 / 120);
    const after = game.state();
    return { stomps: after.stomps, gained: after.score - before.score, vy: after.owl.vy };
  });
  expect(result.stomps).toBe(1);
  expect(result.gained).toBeGreaterThanOrEqual(50);
  expect(result.vy).toBeGreaterThan(15);
  await page.evaluate(() => {
    window.SowaWChmurach.hazard("sterowiec", 0.3, 0.6);
    window.SowaWChmurach.advance(1 / 60);
  });
  await expect(page.locator(".sowie-toast-chip", { hasText: "Sterowiec Amic!" })).toBeVisible();
  const hit = await state(page);
  expect(hit.hits).toBe(1);
  expect(hit.lives).toBe(2);
  expect(errors).toEqual([]);
});

test("Sowa w Chmurach: kózki — Rakietka, Tarcza i Gorączka Monster w komunikatach i chipach HUD", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-start]").click();
  const before = (await state(page)).owl.y;
  await page.evaluate(() => window.SowaWChmurach.goat("turbo"));
  await expect(page.locator(".sowie-toast-chip", { hasText: "Rakietka!" })).toBeVisible();
  await expect(page.locator(".sowie-hud-powerup", { hasText: "Rakietka" })).toBeVisible();
  // Rakietka: 3 s lotu w górę (logika przewinięta krokami — w WebKit w CI klatki bywają wolne).
  await page.evaluate(() => window.SowaWChmurach.advance(1.5));
  expect((await state(page)).owl.y).toBeGreaterThan(before + 20);
  await page.evaluate(() => window.SowaWChmurach.advance(2));
  await expect(page.locator(".sowie-hud-powerup", { hasText: "Rakietka" })).toBeHidden();
  await page.evaluate(() => {
    window.SowaWChmurach.goat("tarcza");
    window.SowaWChmurach.fever();
  });
  await expect(page.locator(".sowie-hud-powerup", { hasText: "Tarcza" })).toBeVisible();
  await expect(page.locator(".sowie-hud-powerup", { hasText: "Gorączka" })).toBeVisible();
  const extras = await page.evaluate(() => window.SowaWChmurach.extras());
  expect(extras.fever).toBeGreaterThan(7);
  expect(extras.powerups.tarcza).toBeGreaterThan(14);
  expect((await state(page)).goats).toBe(2);
  expect(errors).toEqual([]);
});

test("Sowa w Chmurach: pauza z HUD i wznowienie przez odliczanie", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-start]").click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Pauza" }).click();
  const menu = page.getByRole("dialog", { name: "Pauza" });
  await expect(menu).toBeVisible();
  const frozen = (await state(page)).owl.y;
  await page.waitForTimeout(500);
  expect((await state(page)).owl.y).toBe(frozen);
  await menu.getByRole("button", { name: "Wznów" }).click();
  await expect(page.locator(".sowie-countdown")).toHaveText("3");
  await expect.poll(async () => (await state(page)).owl.y, { timeout: 8000 }).not.toBe(frozen);
  expect(errors).toEqual([]);
});

test("Sowa w Chmurach: koniec lotu — wyniki z wysokością i rekord „jumper” zapisany w profilu (emulator)", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await openGame(page, cloudUrl("/SowaWChmurach/?seed=chmury-wyniki", project));
  await page.locator("[data-start]").click();
  await page.evaluate(() => window.SowaWChmurach.warp(40));
  await page.evaluate(() => window.SowaWChmurach.end());
  const results = page.getByRole("dialog", { name: /Koniec lotu/ });
  await expect(results).toBeVisible();
  await expect(results).toContainText("Nowy rekord!");
  await expect(results).toContainText("Wysokość");
  await expect(results).toContainText("Ratunki kózki");
  const recorded = await page.evaluate(() => window.SowieCloud.records("jumper", "arcade"));
  expect(recorded.bestHeight).toBeGreaterThanOrEqual(40);
  expect(recorded.bestScore).toBeGreaterThanOrEqual(40);
  await page.evaluate(() => window.SowieCloud.flush());
  const profile = await readDoc(project, "sowiegry/profil");
  expect(profile.records.jumper.arcade.bestHeight).toBe(recorded.bestHeight);
  await results.getByRole("button", { name: "Jeszcze raz" }).click();
  await expect(results).toBeHidden();
  expect((await state(page)).height).toBeLessThan(15);
  expect(errors).toEqual([]);
});

test.describe("Sowa w Chmurach — najmniejszy telefon (320 × 568)", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("karta tytułowa, HUD i pasek wysokości mieszczą się bez przewijania w bok", async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);
    const card = await page.locator(".chmury-title-card").boundingBox();
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.x + card.width).toBeLessThanOrEqual(320);
    await page.locator("[data-start]").click();
    const height = await page.locator(".chmury-height").boundingBox();
    const pause = await page.getByRole("button", { name: "Pauza" }).boundingBox();
    expect(height.y).toBeGreaterThanOrEqual(pause.y + pause.height - 4);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});
