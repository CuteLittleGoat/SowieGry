// Sowie Ogrody — nowa odsłona (podgląd SowieOgrody/nowa.html, Analiza 3 E7b) na telefonach: stukanie w ogród,
// zakupy, cel rozdziału, zakładki panelu, konewka, przeniesienie dawnego postępu (stan v2 w emulatorze) z zapisem
// w osobnym polu `preview`, postęp po powrocie z tła i układ na najmniejszym telefonie.
const { test, expect, waitForCloud, watchErrors, setVisibility } = require("../fixtures");
const { cloudUrl, readDoc, seedDoc, uniqueProject } = require("../emulator");

async function openGarden(page, url = "/SowieOgrody/nowa.html") {
  await page.goto(url, { waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction(() => window.SowieOgrody?.ready?.(), null, { timeout: 20_000 });
}

const state = (page) => page.evaluate(() => window.SowieOgrody.state());

test("nowe Sowie Ogrody: stuknięcia zbierają liście, pierwsza Monstera, cel rozdziału i zakładki panelu", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGarden(page);
  await expect(page.locator("[data-goal]")).toContainText("Rozdział 1/6: Parapet");
  await expect(page.locator("[data-goal]")).toContainText("Kup 5 Monster");
  const garden = page.locator("[data-canvas]");
  for (let index = 0; index < 16; index += 1) await garden.click({ position: { x: 60 + index * 4, y: 60 } });
  await expect.poll(async () => (await state(page)).stats.taps).toBe(16);
  expect((await state(page)).leaves).toBe(16);
  await expect(page.locator("[data-leaves]")).toHaveText("16");
  // Sowia Akademia dostaje wizytę od razu, a stuknięcia — przy najbliższym raporcie (co 5 s gry).
  const metrics = () => page.evaluate(() => window.SowieAcademy.snapshot().metrics);
  expect((await metrics()).ogrodyVisits).toBeGreaterThanOrEqual(1);
  await expect.poll(async () => (await metrics()).ogrodyClicks, { timeout: 10_000 }).toBe(16);
  // Zakładka Rośliny: Monstera za 15 liści.
  const monstera = page.locator('[data-plant="monstera"]');
  await expect(monstera).toContainText("Monstera");
  await monstera.locator('[data-buy="monstera"][data-amount="1"]').click();
  await expect.poll(async () => (await state(page)).plants.monstera).toBe(1);
  await expect(monstera.locator("[data-owned]")).toHaveText("×1");
  // Bez liści przyciski zakupu są wyłączone; Pilea z Parapetu widoczna, Paproć (Balkon) jeszcze nie.
  await expect(monstera.locator('[data-amount="max"]')).toBeDisabled();
  await expect(page.locator('[data-plant="pilea"]')).toBeVisible();
  await expect(page.locator('[data-plant="paproc"]')).toHaveCount(0);
  // Pozostałe zakładki.
  await page.getByRole("tab", { name: "Ulepszenia" }).click();
  await expect(page.locator("[data-panel]")).toContainText("Miękkie rękawiczki");
  await page.getByRole("tab", { name: "Prestiż" }).click();
  await expect(page.locator("[data-prestige]")).toBeDisabled();
  await expect(page.locator("[data-panel]")).toContainText("Starożytne korzenie");
  await page.getByRole("tab", { name: "Kolekcja" }).click();
  await expect(page.locator("[data-panel]")).toContainText("Statystyki");
  await expect(page.locator("[data-panel]")).toContainText("Stuknięcia");
  expect(errors).toEqual([]);
});

test("nowe Sowie Ogrody: Parapet ukończony → Balkon, konewka z zakładki Ulepszenia i podlewanie", async ({ page }) => {
  const errors = watchErrors(page);
  await openGarden(page);
  await page.evaluate(() => {
    window.SowieOgrody.tap(30);
    window.SowieOgrody.give(5000);
    window.SowieOgrody.buy("monstera", 5);
    window.SowieOgrody.buy("pilea", 1);
  });
  await expect(
    page.locator(".sowie-toast-chip", { hasText: "Rozdział „Parapet” ukończony! Teraz: Balkon" }),
  ).toBeVisible();
  await expect(page.locator("[data-goal]")).toContainText("Rozdział 2/6: Balkon");
  await expect(page.locator('[data-plant="paproc"]')).toBeVisible();
  await page.getByRole("tab", { name: "Ulepszenia" }).click();
  await page.locator('[data-upgrade="konewka"]').click();
  await expect.poll(async () => (await state(page)).upgrades.konewka).toBe(1);
  const water = page.locator("[data-water]");
  await expect(water).toBeVisible();
  await expect(water.locator("[data-charges]")).toHaveText("3/3");
  await water.click();
  await expect(water.locator("[data-charges]")).toHaveText("2/3");
  await expect(water).toHaveClass(/is-active/);
  expect((await state(page)).stats.waterings).toBe(1);
  expect(errors).toEqual([]);
});

test("nowe Sowie Ogrody: dawny postęp (stan v2) przechodzi bez strat, podgląd zapisuje osobno (emulator)", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  const old = {
    version: 2,
    lastSavedAt: Date.now(),
    leaves: 5000,
    water: 500,
    prestigeSeeds: 2,
    lifetimeLeaves: 900_000,
    currentRunLeaves: 400_000,
    zone: "balcony",
    unlocked: ["parapet", "balcony"],
    plants: { monstera: 30, pilea: 12, fern: 4 },
    upgrades: { softGloves: 1, wateringCan: 1, cuteLabels: 1 },
    prestige: { roots: 1 },
    stats: { clicks: 321, prestiges: 0 },
  };
  const oldJson = JSON.stringify(old);
  await seedDoc(project, "sowiegry/profil/sowiegry_gry/ogrody", { state: oldJson, saveVersion: 2 });
  const errors = watchErrors(page);
  await openGarden(page, cloudUrl("/SowieOgrody/nowa.html", project));
  const dialog = page.getByRole("dialog", { name: "Witaj w nowym ogrodzie!" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("strong").first()).toHaveText("1 tys."); // zwrot za Urocze etykietki (1000 liści)
  await expect(dialog).not.toContainText("<strong>");
  await dialog.getByRole("button", { name: "Do ogrodu" }).click();
  const migrated = await state(page);
  expect(migrated.version).toBe(3);
  expect(migrated.plants).toEqual({ monstera: 30, pilea: 12, paproc: 4 });
  expect(migrated.upgrades).toEqual({ rekawiczki: 1, konewka: 1 });
  expect(migrated.seeds).toBe(3);
  expect(migrated.stats.taps).toBe(321);
  await expect(page.locator("[data-goal]")).toContainText("Rozdział 2/6: Balkon");
  await page.evaluate(() => window.SowieOgrody.save());
  await page.evaluate(() => window.SowieCloud.flush());
  const doc = await readDoc(project, "sowiegry/profil/sowiegry_gry/ogrody");
  expect(doc.state).toBe(oldJson);
  const preview = JSON.parse(doc.preview);
  expect(preview.version).toBe(3);
  expect(preview.plants.paproc).toBe(4);

  // Ponowne wejście (nowa karta): stan z pola `preview`, bez okna przeniesienia.
  const again = await page.context().newPage();
  await page.close();
  const errorsAgain = watchErrors(again);
  await openGarden(again, cloudUrl("/SowieOgrody/nowa.html", project));
  expect((await again.evaluate(() => window.SowieOgrody.state())).plants.paproc).toBe(4);
  await expect(again.getByRole("dialog", { name: "Witaj w nowym ogrodzie!" })).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(errorsAgain).toEqual([]);
});

test("nowe Sowie Ogrody: powrót z tła po 10 minutach — okno „Witaj z powrotem!” z tym, co urosło", async ({ page }) => {
  const errors = watchErrors(page);
  await openGarden(page);
  await page.evaluate(() => {
    window.SowieOgrody.give(1000);
    window.SowieOgrody.buy("monstera", 10);
  });
  const before = (await state(page)).leaves;
  await setVisibility(page, "hidden");
  await page.evaluate(() => {
    const realNow = Date.now;
    Date.now = () => realNow() + 10 * 60 * 1000;
  });
  await setVisibility(page, "visible");
  const dialog = page.getByRole("dialog", { name: "Witaj z powrotem!" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Sowa doglądała ogrodu przez");
  await expect(dialog.locator("strong").first()).toHaveText(/^10 min( [0-9] s)?$/);
  expect((await state(page)).leaves).toBeGreaterThan(before + 100);
  expect(errors).toEqual([]);
});

test.describe("nowe Sowie Ogrody — najmniejszy telefon (320 × 568)", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("ogród, cel i panel mieszczą się bez przewijania w bok; przyciski zakupu mają co najmniej 44 px", async ({
    page,
  }) => {
    const errors = watchErrors(page);
    await openGarden(page);
    await page.evaluate(() => window.SowieOgrody.give(100));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const garden = await page.locator("[data-canvas]").boundingBox();
    expect(garden.height).toBeGreaterThanOrEqual(150);
    for (const locator of [
      page.locator('[data-buy="monstera"][data-amount="1"]'),
      page.getByRole("tab", { name: "Rośliny" }),
    ]) {
      const box = await locator.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(errors).toEqual([]);
  });
});
