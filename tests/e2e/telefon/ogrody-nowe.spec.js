// Sowie Ogrody — nowa odsłona (od E7e gra „ogrody” w SowieOgrody/index.html; Analiza 3 E7) na telefonach: stukanie
// w ogród, zakupy, cel rozdziału, zakładki panelu, konewka, przeniesienie dawnego postępu (stan v2 w emulatorze)
// i zapisu z czasu podglądu (pole `preview`) do pola `state`, postęp po powrocie z tła i układ na najmniejszym telefonie.
const { test, expect, waitForCloud, watchErrors, setVisibility } = require("../fixtures");
const { cloudUrl, readDoc, seedDoc, uniqueProject } = require("../emulator");

async function openGarden(page, url = "/SowieOgrody/") {
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

test("nowe Sowie Ogrody: dawny postęp (stan v2) przechodzi bez strat i zapisuje się jako stan v3 (emulator)", async ({
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
  await openGarden(page, cloudUrl("/SowieOgrody/", project));
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
  // Stan v3 zastępuje dawny v2 w polu `state` (saveVersion 3), podsumowanie trafia do profilu.
  const saved = JSON.parse(doc.state);
  expect(saved.version).toBe(3);
  expect(saved.plants.paproc).toBe(4);
  expect(doc.saveVersion).toBe(3);
  expect(doc.preview).toBeUndefined();
  const profile = await readDoc(project, "sowiegry/profil");
  expect(profile.records.ogrody.zone).toBe("Balkon");
  expect(profile.records.ogrody.lifetimeLeaves).toBeGreaterThanOrEqual(0);

  // Ponowne wejście (nowa karta): stan v3 z pola `state`, bez okna przeniesienia.
  const again = await page.context().newPage();
  await page.close();
  const errorsAgain = watchErrors(again);
  await openGarden(again, cloudUrl("/SowieOgrody/", project));
  expect((await again.evaluate(() => window.SowieOgrody.state())).plants.paproc).toBe(4);
  await expect(again.getByRole("dialog", { name: "Witaj w nowym ogrodzie!" })).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(errorsAgain).toEqual([]);
});

test("Sowie Ogrody: zapis z czasu podglądu (pole `preview`) staje się stanem gry, a stary adres nowa.html przekierowuje (emulator)", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  const fromPreview = {
    version: 3,
    leaves: 50,
    runLeaves: 500,
    lifetimeLeaves: 500,
    plants: { monstera: 7 },
    tutorialDone: true,
  };
  await seedDoc(project, "sowiegry/profil/sowiegry_gry/ogrody", {
    state: JSON.stringify({ version: 2, stats: { clicks: 5 } }),
    saveVersion: 2,
    preview: JSON.stringify(fromPreview),
  });
  const errors = watchErrors(page);
  await openGarden(page, cloudUrl("/SowieOgrody/nowa.html", project));
  await expect(page).toHaveURL(/\/SowieOgrody\/\?/);
  expect((await state(page)).plants.monstera).toBe(7);
  await expect(page.getByRole("dialog", { name: "Witaj w nowym ogrodzie!" })).toHaveCount(0);
  await page.evaluate(() => window.SowieCloud.flush());
  await expect
    .poll(async () => {
      const doc = await readDoc(project, "sowiegry/profil/sowiegry_gry/ogrody");
      return [doc.preview === undefined, JSON.parse(doc.state).plants?.monstera, doc.saveVersion];
    })
    .toEqual([true, 7, 3]);
  expect(errors).toEqual([]);
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

// Zdarzenia aktywnej gry (E7c2): wywoływane od razu hakiem `trigger`, obsługiwane przyciskami i stuknięciem w płótno.
const ogrod = (page, call, ...args) => page.evaluate(([name, rest]) => window.SowieOgrody[name](...rest), [call, args]);

async function grownGarden(page) {
  await openGarden(page);
  await page.evaluate(() => {
    window.SowieOgrody.give(1e6);
    window.SowieOgrody.buy("monstera", 30);
    window.SowieOgrody.buy("pilea", 10);
  });
}

async function clickCanvas(page, point) {
  const box = await page.locator("[data-canvas]").boundingBox();
  await page.mouse.click(box.x + point.x, box.y + point.y);
}

test("nowe Sowie Ogrody: telefon Pracu (produkcja −30% do odrzucenia) i ciężarówka Amic (3 stuknięcia)", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await grownGarden(page);
  const full = await ogrod(page, "production");
  expect(await ogrod(page, "trigger", "pracu")).toBe(true);
  const phone = page.locator('[data-alert="pracu"]');
  await expect(phone).toBeVisible();
  await expect(page.locator(".sowie-toast-chip", { hasText: "Dzwoni Pracu Pracu!" })).toBeVisible();
  expect((await ogrod(page, "production")) / full).toBeCloseTo(0.7, 5);
  await phone.click();
  await expect(phone).toBeHidden();
  expect((await ogrod(page, "production")) / full).toBeCloseTo(1, 5);

  // Ciężarówka: dwa stuknięcia w cysternę na płótnie, trzecie przyciskiem.
  expect(await ogrod(page, "trigger", "truck")).toBe(true);
  const truck = page.locator('[data-alert="truck"]');
  await expect(truck).toContainText("0/3");
  const blocked = (await ogrod(page, "events")).blocked;
  expect(["monstera", "pilea"]).toContain(blocked);
  await expect.poll(() => ogrod(page, "hit", "truck")).not.toBeNull();
  const spot = await ogrod(page, "hit", "truck");
  await clickCanvas(page, spot);
  await clickCanvas(page, spot);
  await expect(truck).toContainText("2/3");
  expect((await ogrod(page, "state")).stats.taps).toBe(0);
  await truck.click();
  await expect(truck).toBeHidden();
  // Komunikat o odjeździe ma najniższy priorytet (w pełnej kolejce może ustąpić) — sprawdzamy stan ogrodu.
  const after = await ogrod(page, "events");
  expect(after.blocked).toBeNull();
  expect(after.truck).toBeNull();
  expect((await ogrod(page, "production")) / full).toBeCloseTo(1, 5);
  expect(errors).toEqual([]);
});

test("nowe Sowie Ogrody: złota kózka (×3 na 30 s), Plusk-o-metr i Zatoka Humbaka z łapaniem liści", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await grownGarden(page);
  const full = await ogrod(page, "production");
  expect(await ogrod(page, "trigger", "goat", "boost")).toBe(true);
  const goat = page.locator('[data-alert="goat"]');
  await expect(goat).toBeVisible();
  await goat.click();
  await expect(goat).toBeHidden();
  // Muzyka (po pierwszym dotknięciu): motyw ogrodu, w Zatoce pieśń humbaka, potem znowu ogród.
  const music = () => ogrod(page, "music");
  await expect.poll(music, { timeout: 10_000 }).toBe("ogrod");
  await expect(page.locator(".sowie-toast-chip", { hasText: "Złota kózka: produkcja ×3 przez 30 s!" })).toBeVisible();
  expect((await ogrod(page, "production")) / full).toBeCloseTo(3, 5);
  expect((await ogrod(page, "events")).splash).toBeCloseTo(0.1, 5);

  // Plusk-o-metr pełny → przycisk Zatoki; liście z fontanny (logika wstrzymana — liść stoi w miejscu stuknięcia).
  await ogrod(page, "fillSplash");
  const bayButton = page.locator('[data-alert="bay"]');
  await expect(bayButton).toBeVisible();
  await bayButton.click();
  await expect(bayButton).toBeHidden();
  const hud = page.locator("[data-bay-hud]");
  await expect(hud).toBeVisible();
  await expect.poll(music, { timeout: 10_000 }).toBe("humbak");
  await ogrod(page, "hold", true);
  await ogrod(page, "advance", 0.5);
  const { bay } = await ogrod(page, "events");
  expect(bay.leaves.length).toBeGreaterThan(0);
  const box = await page.locator("[data-canvas]").boundingBox();
  const leaf = bay.leaves[0];
  const before = (await ogrod(page, "state")).leaves;
  await clickCanvas(page, { x: leaf.x * box.width, y: leaf.y * box.height });
  await expect(hud).toContainText("combo ×1");
  expect((await ogrod(page, "state")).leaves).toBeGreaterThan(before);
  // Koniec po 20 s: komunikat z liczbą złapanych liści.
  await ogrod(page, "advance", 21);
  await expect(hud).toBeHidden();
  await expect.poll(music, { timeout: 10_000 }).toBe("ogrod");
  await expect(page.locator(".sowie-toast-chip", { hasText: "Zatoka Humbaka: złapane liście — 1" })).toBeVisible({
    timeout: 10_000,
  });
  expect((await ogrod(page, "state")).stats.bays).toBe(1);
  expect(errors).toEqual([]);
});

test("nowe Sowie Ogrody: samouczek pierwszego wejścia (4 kroki), zapis w stanie gry i „Jak grać?” z „Zagraj samouczek” (emulator)", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await openGarden(page, cloudUrl("/SowieOgrody/", project));
  const bubble = page.locator("[data-tutorial]");
  // 1. Stuknięcia (podpowiedź nie zasłania ogrodu — stuknięcia przechodzą do płótna).
  await expect(bubble).toContainText("krok 1 z 4");
  await expect(bubble).toContainText("Stuknij w ogród");
  await expect(bubble.locator(".sowie-gesture-demo")).toHaveAttribute("data-gesture", "tap");
  await expect(bubble.locator("[data-tutorial-next]")).toBeHidden();
  const garden = page.locator("[data-canvas]");
  const box = await garden.boundingBox();
  for (let index = 0; index < 5; index += 1)
    await garden.click({ position: { x: 40 + index * 30, y: box.height * 0.3 } });
  // 2. Zakup Monstery.
  await expect(bubble).toContainText("krok 2 z 4");
  await expect(bubble).toContainText("Kup Monsterę");
  await page.evaluate(() => window.SowieOgrody.give(15));
  await page.locator('[data-buy="monstera"][data-amount="1"]').click();
  // 3. i 4. Kroki informacyjne — „Dalej”.
  await expect(bubble).toContainText("krok 3 z 4");
  await bubble.getByRole("button", { name: "Dalej" }).click();
  await expect(bubble).toContainText("krok 4 z 4");
  await expect(bubble).toContainText("łap złotą kózkę");
  await bubble.getByRole("button", { name: "Dalej" }).click();
  await expect(bubble).toBeHidden();
  await expect(page.locator(".sowie-toast-chip", { hasText: "Świetnie! Ogród jest Twój" })).toBeVisible({
    timeout: 10_000,
  });
  expect(await page.evaluate(() => window.SowieOgrody.tutorial())).toBeNull();
  await page.evaluate(() => window.SowieCloud.flush());
  const doc = await readDoc(project, "sowiegry/profil/sowiegry_gry/ogrody");
  expect(JSON.parse(doc.state).tutorialDone).toBe(true);

  // Ponowne wejście (nowa karta): bez samouczka; „Jak grać?” — instrukcja i „Zagraj samouczek”.
  const again = await page.context().newPage();
  await page.close();
  const errorsAgain = watchErrors(again);
  await openGarden(again, cloudUrl("/SowieOgrody/", project));
  await expect(again.locator("[data-tutorial]")).toBeHidden();
  await again.getByRole("button", { name: "Jak grać?" }).click();
  const guide = again.getByRole("dialog", { name: "Jak grać — Sowie Ogrody" });
  await expect(guide).toBeVisible();
  await expect(guide).toContainText("Wielkie Przesadzanie");
  await expect(guide).toContainText("Zatoce Humbaka");
  await guide.getByRole("button", { name: "Zagraj samouczek" }).click();
  await expect(guide).toBeHidden();
  await expect(again.locator("[data-tutorial]")).toContainText("krok 1 z 4");
  // „Pomiń” kończy samouczek bez komunikatu.
  await again.locator("[data-tutorial]").getByRole("button", { name: "Pomiń samouczek" }).click();
  await expect(again.locator("[data-tutorial]")).toBeHidden();
  // Kolekcja: „Powtórz samouczek” (uwaga G1).
  await again.getByRole("tab", { name: "Kolekcja" }).click();
  await again.getByRole("button", { name: "Powtórz samouczek" }).click();
  await expect(again.locator("[data-tutorial]")).toContainText("krok 1 z 4");
  expect(errors).toEqual([]);
  expect(errorsAgain).toEqual([]);
});

test("nowe Sowie Ogrody: menu prosi o powtórzenie samouczka (`tutorialDone: false` w dokumencie gry) — samouczek wraca, po nim prośba spełniona (emulator)", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await openGarden(page, cloudUrl("/SowieOgrody/", project));
  await page.locator("[data-tutorial]").getByRole("button", { name: "Pomiń samouczek" }).click();
  // To samo, co robi przycisk w menu (zakładka Sowa → „Powtórz samouczki we wszystkich grach”).
  await page.evaluate(() => {
    window.SowieCloud.updateGame("ogrody", { tutorialDone: false });
    return window.SowieCloud.flush();
  });
  const requested = await readDoc(project, "sowiegry/profil/sowiegry_gry/ogrody");
  expect(JSON.parse(requested.state).tutorialDone).toBe(true);
  expect(requested.tutorialDone).toBe(false);

  const again = await page.context().newPage();
  await page.close();
  const errorsAgain = watchErrors(again);
  await openGarden(again, cloudUrl("/SowieOgrody/", project));
  const bubble = again.locator("[data-tutorial]");
  await expect(bubble).toContainText("krok 1 z 4");
  await bubble.getByRole("button", { name: "Pomiń samouczek" }).click();
  await expect(bubble).toBeHidden();
  await again.evaluate(() => window.SowieCloud.flush());
  const after = await readDoc(project, "sowiegry/profil/sowiegry_gry/ogrody");
  expect(after.tutorialDone).toBe(true);
  expect(JSON.parse(after.state).tutorialDone).toBe(true);
  expect(errors).toEqual([]);
  expect(errorsAgain).toEqual([]);
});

test("nowe Sowie Ogrody: kontrakt dnia — 25 stuknięć, komunikat, „Odbierz” w Kolekcji, nagroda w Sowiej Akademii", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGarden(page);
  const xpBefore = await page.evaluate(() => window.SowieAcademy.snapshot().xp);
  await page.evaluate(() => window.SowieOgrody.tap(25));
  await expect(
    page.locator(".sowie-toast-chip", { hasText: "Kontrakt gotowy: Zbierz liście 25 stuknięciami" }),
  ).toBeVisible({ timeout: 10_000 });
  await page.getByRole("tab", { name: "Kolekcja" }).click();
  const card = page.locator('[data-contract="clicks"]');
  await expect(card).toContainText("25/25");
  await expect(page.locator('[data-contract="buys"] [data-claim]')).toBeDisabled();
  await card.getByRole("button", { name: "Odbierz" }).click();
  await expect(card).toContainText("Odebrano ✓");
  await expect(page.locator(".sowie-toast-chip", { hasText: "Kontrakt wykonany" })).toBeVisible({ timeout: 10_000 });
  const academy = await page.evaluate(() => window.SowieAcademy.snapshot());
  const day = new Date().toISOString().slice(0, 10);
  expect(academy.awards[`feature:ogrody:${day}:clicks`]).toBeTruthy();
  expect(academy.xp).toBeGreaterThanOrEqual(xpBefore + 30);
  const claimed = await page.evaluate(() => window.SowieOgrody.contracts().find((item) => item.id === "clicks"));
  expect(claimed.claimed).toBe(true);
  expect(errors).toEqual([]);
});
