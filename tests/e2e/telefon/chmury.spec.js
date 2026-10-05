// Sowa w Chmurach (gra „jumper”, od E6f zamiast SowaJumper; Analiza 3, E6) na telefonach: start, przeciąganie palcem
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
  await expect(page.locator("[data-preview]")).toHaveCount(0);
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
  // Logika wstrzymana (`hold`) i przewijana `advance` — wolne klatki pod obciążeniem nie dokładają trafień ani
  // drugiego upadku między krokami testu.
  await page.evaluate(() => {
    window.SowaWChmurach.hold(true);
    window.SowaWChmurach.warp(160);
    window.SowaWChmurach.advance(0.1);
  });
  await expect(page.locator(".sowie-toast-chip", { hasText: "Strefa: Blok!" })).toBeVisible();
  await expect(page.locator(".chmury-height")).toContainText("m · Blok");
  expect((await state(page)).lives).toBe(3);
  await page.evaluate(() => {
    window.SowaWChmurach.fall();
    window.SowaWChmurach.advance(0.1);
  });
  expect((await state(page)).phase).toBe("rescue");
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
  // Logika krokami po 1/120 s (bez czekania na klatki): sowa opada, pod jej stopami dymek. Klatki nie ruszają logiki
  // (hold) — między krokami testu sowa nie złapie żadnej kózki z trasy.
  const result = await page.evaluate(() => {
    const game = window.SowaWChmurach;
    game.hold(true);
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
  // Rakietka trwa 3 s czasu gry — logikę przesuwa tylko `advance` (wolne klatki WebKit w CI nie skrócą sprawdzania).
  await page.evaluate(() => window.SowaWChmurach.hold(true));
  // Kózka działa tylko w zwykłym locie (nie w czasie ratunku po upadku w pierwszych, wolnych klatkach WebKit).
  await page.evaluate(() => {
    const game = window.SowaWChmurach;
    for (let time = 0; time < 10 && game.state().phase !== "run"; time += 0.05) game.advance(0.05);
  });
  expect((await state(page)).phase).toBe("run");
  // Logika stoi, więc nowe komunikaty nie przychodzą: kolejka pustoszeje (start lotu i ewentualne z pierwszych klatek)
  // i komunikat kózki pojawia się od razu, a nie po kilku innych.
  await expect(page.locator(".sowie-toast-chip")).toHaveCount(0, { timeout: 15_000 });
  const before = (await state(page)).owl.y;
  await page.evaluate(() => {
    window.SowaWChmurach.goat("turbo");
    window.SowaWChmurach.advance(1 / 120);
  });
  expect((await state(page)).goats).toBe(1);
  await expect(page.locator(".sowie-toast-chip", { hasText: "Rakietka!" })).toBeVisible();
  await expect(page.locator(".sowie-hud-powerup", { hasText: "Rakietka" })).toBeVisible();
  // Rakietka: 3 s lotu w górę (logika przewinięta krokami).
  await page.evaluate(() => window.SowaWChmurach.advance(1.5));
  expect((await state(page)).owl.y).toBeGreaterThan(before + 20);
  await page.evaluate(() => window.SowaWChmurach.advance(2));
  await expect(page.locator(".sowie-hud-powerup", { hasText: "Rakietka" })).toBeHidden();
  await page.evaluate(() => {
    window.SowaWChmurach.goat("tarcza");
    window.SowaWChmurach.fever();
    window.SowaWChmurach.advance(1 / 120);
  });
  await expect(page.locator(".sowie-hud-powerup", { hasText: "Tarcza" })).toBeVisible();
  await expect(page.locator(".sowie-hud-powerup", { hasText: "Gorączka" })).toBeVisible();
  const extras = await page.evaluate(() => window.SowaWChmurach.extras());
  expect(extras.fever).toBeGreaterThan(7);
  expect(extras.powerups.tarcza).toBeGreaterThan(14);
  expect((await state(page)).goats).toBe(2);
  expect(errors).toEqual([]);
});

test("Sowa w Chmurach: Niebiański Ocean — 20 s na humbakach z pieśnią, sterowanie palcem, pasek czasu, powrót do lotu", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-start]").click();
  const music = () => page.evaluate(() => window.SowaWChmurach.music());
  // Muzyka: motyw lotu, w oceanie pieśń humbaka, po oceanie znowu motyw lotu.
  await expect.poll(music, { timeout: 10_000 }).toBe("chmury");
  const height = (await state(page)).height;
  await page.evaluate(() => window.SowaWChmurach.ocean());
  await expect(page.locator(".sowie-toast-chip", { hasText: "Niebiański Ocean!" })).toBeVisible();
  await expect(page.locator(".chmury-height")).toContainText("Niebiański Ocean · 0:");
  await expect(page.locator(".chmury-height")).toHaveClass(/is-ocean/);
  await expect.poll(music, { timeout: 10_000 }).toBe("humbak");
  expect((await state(page)).phase).toBe("ocean");
  // W oceanie sowa idzie za palcem (uwaga właściciela C1 — przeciąganie działało tylko w locie): logika wstrzymana,
  // przeciągnięcie o 60 px w prawo i 1 s logiki — sowa przesunięta o 60 px × (metry na piksel) × 1,25.
  await page.evaluate(() => window.SowaWChmurach.hold(true));
  const oceanX = (await state(page)).owl.x;
  const oceanMeters = 60 * (await page.evaluate(() => window.SowaWChmurach.metersPerPixel()));
  await drag(page, 60);
  await page.evaluate(() => window.SowaWChmurach.advance(1));
  expect((await state(page)).phase).toBe("ocean");
  expect((await state(page)).owl.x).toBeCloseTo((oceanX + oceanMeters * 1.25) % 9, 1);
  // Logika przewinięta krokami: reszta 20 s oceanu (sowa nie spada), potem znowu lot z tej samej wysokości; klatki
  // logiki nie ruszają (hold), więc po oceanie sowa nie zdąży spaść przed sprawdzeniem żyć.
  await page.evaluate(() => window.SowaWChmurach.advance(20));
  expect((await state(page)).phase).toBe("run");
  await expect(page.locator(".sowie-toast-chip", { hasText: "Koniec oceanu" })).toBeVisible();
  await expect(page.locator(".chmury-height")).toContainText("m · Ogródek");
  await expect.poll(music).toBe("chmury");
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

  expect(errors).toEqual([]);

  // Ponowne wejście (nowa karta tego samego telefonu — WebKit zgłasza przerwane przejściem długie zapytania kanału
  // Firestore jako błędy strony): przełącznik pamięta ustawienie.
  const again = await page.context().newPage();
  await page.close();
  const errorsAgain = watchErrors(again);
  await openGame(again, url);
  await expect(again.locator("[data-tilt]")).toHaveAttribute("aria-pressed", "true");
  await again.locator("[data-start]").click();
  const x0 = (await state(again)).owl.x;
  await tiltRight(again);
  expect((await again.evaluate(() => window.SowaWChmurach.tilt())).angle).toBe(20);
  // Sowa jedzie w prawo (przesunięcie liczone z przejściem przez krawędź kolumny).
  await expect
    .poll(async () => (((((await state(again)).owl.x - x0 + 13.5) % 9) + 9) % 9) - 4.5, { timeout: 8000 })
    .toBeGreaterThan(1);
  expect(errorsAgain).toEqual([]);
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

test("Sowa w Chmurach: samouczek pierwszego lotu — 5 kroków z podpowiedzią, bez utraty serduszek, zapis w dokumencie gry (emulator)", async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000);
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await openGame(page, cloudUrl("/SowaWChmurach/?samouczek=1&seed=chmury-samouczek", project));
  await page.locator("[data-start]").click();
  const prompt = page.locator(".chmury-tutorial");
  const tutorial = () => page.evaluate(() => window.SowaWChmurach.tutorial());
  // Logika porcjami po 0,05 s, aż samouczek dojdzie do kroku `step` (najwyżej `seconds` s czasu gry).
  const advanceUntil = (step, seconds) =>
    page.evaluate(
      ([target, limit]) => {
        const game = window.SowaWChmurach;
        for (let time = 0; time < limit && (game.tutorial()?.step ?? 99) < target; time += 0.05) game.advance(0.05);
        return game.tutorial();
      },
      [step, seconds],
    );
  // Logika tylko krokami (hold) — kroki samouczka zależą od czasu gry.
  await page.evaluate(() => window.SowaWChmurach.hold(true));
  await page.evaluate(() => window.SowaWChmurach.advance(1 / 120));
  await expect(prompt).toBeVisible();
  await expect(prompt).toContainText("Samouczek · krok 1 z 5");
  await expect(prompt).toContainText("Przeciągnij palcem w bok");
  await expect(prompt.locator(".sowie-gesture-demo")).toHaveAttribute("data-gesture", "drag");
  // 1) Przeciągnięcie w bok.
  await page.evaluate(() => {
    window.SowaWChmurach.steer(2);
    window.SowaWChmurach.advance(0.5);
  });
  await expect(prompt).toContainText("krok 2 z 5");
  // 2) Wyżej: 12 m.
  await page.evaluate(() => {
    window.SowaWChmurach.warp(14);
    window.SowaWChmurach.advance(1 / 120);
  });
  await expect(prompt).toContainText("krok 3 z 5");
  // 3) Liść albo 15 s; 4) Pracu — dymek obok gałązki, zdeptanie / trafienie albo 14 s.
  expect((await advanceUntil(4, 15.5)).id).toBe("pracu");
  await expect(prompt).toContainText("krok 4 z 5");
  expect((await page.evaluate(() => window.SowaWChmurach.hazards())).some((item) => item.kind === "dymek")).toBe(true);
  expect((await advanceUntil(5, 14.5)).id).toBe("ratunek");
  await expect(prompt).toContainText("krok 5 z 5");
  // W samouczku serduszka zostają (tryb bezpieczny), także po upadku.
  await page.evaluate(() => {
    window.SowaWChmurach.fall();
    window.SowaWChmurach.advance(2);
  });
  expect((await state(page)).lives).toBe(3);
  await advanceUntil(6, 6);
  await expect(prompt).toBeHidden();
  expect(await tutorial()).toBeNull();
  await expect(page.locator(".sowie-toast-chip", { hasText: "Świetnie! Teraz sama wspinaczka" })).toBeVisible({
    timeout: 10_000,
  });
  await page.evaluate(() => window.SowieCloud.flush());
  expect((await readDoc(project, "sowiegry/profil/sowiegry_gry/jumper")).tutorialDone).toBe(true);
  expect(errors).toEqual([]);
});

test("Sowa w Chmurach: „Jak grać?” — instrukcja Sowy w Chmurach i „Zagraj samouczek”", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-guide]").click();
  const dialog = page.getByRole("dialog", { name: "Jak grać — Sowa w Chmurach" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Niebiański Ocean");
  await dialog.getByRole("button", { name: "Zagraj samouczek" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator(".chmury-tutorial")).toContainText("Samouczek · krok 1 z 5");
  expect(errors).toEqual([]);
});

test("Sowa w Chmurach: przycisk „Samouczek” na ekranie tytułowym (uwaga G1)", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-tutorial-replay]").click();
  await expect(page.locator("[data-title]")).toBeHidden();
  await expect(page.locator(".chmury-tutorial")).toContainText("Samouczek · krok 1 z 5");
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
  // Po odliczaniu gra rusza. W WebKit w CI czas gry płynie wolniej niż rzeczywisty (CI 40decd2: sowa nie ruszyła
  // w 8 s), więc czekamy na koniec odliczania, a ruch sprawdzamy, przewijając logikę o 0,5 s (hak `advance`).
  await expect(page.locator(".sowie-countdown")).toBeHidden({ timeout: 15_000 });
  await page.evaluate(() => {
    window.SowaWChmurach.hold(true);
    window.SowaWChmurach.advance(0.5);
  });
  expect((await state(page)).owl.y).not.toBe(frozen);
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
