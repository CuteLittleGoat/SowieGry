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

test("Sowa w Chmurach: Niebiański Ocean — 20 s na humbakach z pieśnią, pasek czasu, powrót do lotu", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-start]").click();
  const music = () => page.evaluate(() => window.SowaWChmurach.music());
  const height = (await state(page)).height;
  await page.evaluate(() => window.SowaWChmurach.ocean());
  await expect(page.locator(".sowie-toast-chip", { hasText: "Niebiański Ocean!" })).toBeVisible();
  await expect(page.locator(".chmury-height")).toContainText("Niebiański Ocean · 0:");
  await expect(page.locator(".chmury-height")).toHaveClass(/is-ocean/);
  await expect.poll(music, { timeout: 10_000 }).toBe("humbak");
  expect((await state(page)).phase).toBe("ocean");
  // Logika przewinięta krokami: 20 s oceanu (sowa nie spada), potem znowu lot z tej samej wysokości.
  await page.evaluate(() => window.SowaWChmurach.advance(21));
  expect((await state(page)).phase).toBe("run");
  await expect(page.locator(".sowie-toast-chip", { hasText: "Koniec oceanu" })).toBeVisible();
  await expect(page.locator(".chmury-height")).toContainText("m · Ogródek");
  expect(await music()).toBe(null);
  const after = await state(page);
  expect(after.lives).toBe(3);
  expect(after.rescues).toBe(0);
  expect(after.height).toBeGreaterThanOrEqual(height);
  expect(errors).toEqual([]);
});

// Przechył w prawo o 20° (oś zależna od obrotu ekranu: pion — gamma, poziom — beta) jako zdarzenie czujnika.
async function tiltRight(page) {
  await page.evaluate(() => {
    const angle = window.screen.orientation?.angle ?? 0;
    const event = new Event("deviceorientation");
    Object.defineProperties(event, {
      beta: { value: angle === 90 ? 20 : angle === 270 ? -20 : 0 },
      gamma: { value: angle === 0 ? 20 : angle === 180 ? -20 : 0 },
    });
    window.dispatchEvent(event);
  });
}

test("Sowa w Chmurach: przechylanie telefonu — przełącznik, zapis w dokumencie gry (emulator), przechył przesuwa sowę", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  const url = cloudUrl("/SowaWChmurach/?seed=chmury-przechyl", project);
  await openGame(page, url);
  const toggle = page.locator("[data-tilt]");
  if (!(await page.evaluate(() => window.SowaWChmurach.tilt().supported))) {
    // Bez czujnika orientacji przełącznika nie ma (przeciąganie i klawiatura zostają).
    await expect(toggle).toBeHidden();
    expect(errors).toEqual([]);
    return;
  }
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(toggle).toHaveText("Przechylanie: wyłączone");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveText("Przechylanie: włączone");
  expect(await page.evaluate(() => window.SowieCloud.game("jumper").tilt)).toBe(true);
  await page.evaluate(() => window.SowieCloud.flush());
  expect((await readDoc(project, "sowiegry/profil/sowiegry_gry/jumper")).tilt).toBe(true);

  // Po przeładowaniu przełącznik pamięta ustawienie.
  await openGame(page, url);
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.locator("[data-start]").click();
  const x0 = (await state(page)).owl.x;
  await tiltRight(page);
  expect((await page.evaluate(() => window.SowaWChmurach.tilt())).angle).toBe(20);
  // Sowa jedzie w prawo (przesunięcie liczone z przejściem przez krawędź kolumny).
  await expect
    .poll(async () => (((((await state(page)).owl.x - x0 + 13.5) % 9) + 9) % 9) - 4.5, { timeout: 8000 })
    .toBeGreaterThan(1);
  expect(errors).toEqual([]);
});

test("Sowa w Chmurach: przechylanie na iPhonie — odmowa zgody zostawia sterowanie palcem, zgoda włącza", async ({
  page,
}) => {
  const errors = watchErrors(page);
  // Atrapa zgody z iOS: `DeviceOrientationEvent.requestPermission` zwraca odpowiedź ustawioną w teście.
  await page.addInitScript(() => {
    window.__zgoda = "denied";
    if (window.DeviceOrientationEvent) window.DeviceOrientationEvent.requestPermission = async () => window.__zgoda;
  });
  await openGame(page);
  const toggle = page.locator("[data-tilt]");
  if (!(await page.evaluate(() => window.SowaWChmurach.tilt().supported))) {
    await expect(toggle).toBeHidden();
    expect(errors).toEqual([]);
    return;
  }
  expect((await page.evaluate(() => window.SowaWChmurach.tilt())).granted).toBe(false);
  await toggle.click();
  await expect(page.locator("[data-tilt-note]")).toHaveText("Bez zgody na czujnik ruchu — steruj palcem.");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.evaluate(() => (window.__zgoda = "granted"));
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-tilt-note]")).toBeHidden();
  expect((await page.evaluate(() => window.SowaWChmurach.tilt())).granted).toBe(true);
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
