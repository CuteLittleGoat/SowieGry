// Sowie Ogrody — nowa odsłona (od E7e gra „ogrody” w SowieOgrody/index.html; Analiza 3 E7) na telefonach: stukanie
// w ogród, zakupy, cel rozdziału, zakładki panelu, konewka, przeniesienie dawnego postępu (stan v2 w emulatorze)
// i zapisu z czasu podglądu (pole `preview`) do pola `state`, postęp po powrocie z tła i układ na najmniejszym telefonie.
const { test, expect, waitForCloud, watchErrors, setVisibility, swipe } = require("../fixtures");
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
  await expect(page.locator("[data-goal]")).toContainText("Rozdział 1/14: Parapet");
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
  await expect(page.locator("[data-goal]")).toContainText("Rozdział 2/14: Balkon");
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
  await expect(page.locator("[data-goal]")).toContainText("Rozdział 2/14: Balkon");
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

test("Sowie Ogrody: zapis z czasu podglądu (pole `preview`) staje się stanem gry (emulator)", async ({
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
  await openGarden(page, cloudUrl("/SowieOgrody/", project));
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
    // Uwaga O4: obok zakładek przycisk „Rozwiń listę” (44 × 44 px) — napisy zakładek się nie nakładają ani nie
    // wychodzą poza zakładkę, a ostatnia zakładka kończy się przed przyciskiem.
    const layout = await page.evaluate(() => {
      const range = document.createRange();
      const tabs = [...document.querySelectorAll(".ogrod-tab")].map((tab) => {
        range.selectNodeContents(tab);
        const text = range.getBoundingClientRect();
        const box = tab.getBoundingClientRect();
        return { left: box.left, right: box.right, textLeft: text.left, textRight: text.right };
      });
      const expand = document.querySelector("[data-expand]").getBoundingClientRect();
      return { tabs, expand: { left: expand.left, width: expand.width, height: expand.height } };
    });
    for (const [index, tab] of layout.tabs.entries()) {
      expect(tab.textLeft).toBeGreaterThanOrEqual(tab.left - 0.5);
      expect(tab.textRight).toBeLessThanOrEqual(tab.right + 0.5);
      if (index) expect(tab.textLeft).toBeGreaterThan(layout.tabs[index - 1].textRight);
    }
    expect(layout.expand.width).toBeGreaterThanOrEqual(44);
    expect(layout.expand.height).toBeGreaterThanOrEqual(44);
    expect(layout.tabs.at(-1).right).toBeLessThanOrEqual(layout.expand.left);
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

// Wszystkie rozdziały do Szklarni otwarte (hakami testowymi gry, jak w teście Parapetu) — 10 roślin na liście
// (do Mutanta monstery). Cele kosztują ok. 100 mln liści, więc zostaje ok. 900 mln.
async function openToGreenhouse(page) {
  await page.evaluate(() => {
    const g = window.SowieOgrody;
    g.give(1e9);
    g.tap(30);
    g.buy("monstera", 30);
    g.buy("pilea", 1);
    g.upgrade("konewka");
  });
  for (let index = 0; index < 3; index += 1) await page.locator("[data-water]").click();
  await page.evaluate(() => {
    const g = window.SowieOgrody;
    g.buy("paproc", 5);
    g.buy("alokazja", 10);
    g.buy("kaktus", 5);
    g.advance(0.2);
    g.buy("slonecznik", 10);
    g.buy("storczyk", 5);
    g.advance(0.2);
  });
  await expect(page.locator("[data-goal]")).toContainText("Szklarnia");
}

test("lista roślin (uwaga O4): przy Sowie zakupowej karty nie są budowane od nowa, ostatnia roślina zostaje w widoku", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGarden(page);
  await openToGreenhouse(page);
  // Liście tylko na Sową zakupową (30 mld): reszta (ok. 900 mln) nie wystarczy na Mutanta monstery (12,5 mld), więc
  // Szklarnia się nie kończy i układ listy (nowy rozdział — nowa roślina) się nie zmienia.
  await page.evaluate(() => {
    window.SowieOgrody.give(3e10);
    window.SowieOgrody.upgrade("zakupy");
  });
  // Zakładka Rośliny jest wybrana od startu (stuknięcie w nią przebudowałoby listę przy najbliższym odświeżeniu).
  // Cel i panel odświeżają się w tym samym kroku, więc lista jest już zbudowana dla Szklarni.
  await expect(page.getByRole("tab", { name: "Rośliny" })).toHaveAttribute("aria-selected", "true");
  const panel = page.locator("[data-panel]");
  const last = panel.locator("[data-plant]").last();
  await expect(last).toHaveAttribute("data-plant", "mutant");
  // Znacznik na kartach i przewinięcie listy do końca.
  await page.evaluate(() => {
    for (const card of document.querySelectorAll("[data-plant]")) card.dataset.mark = "1";
    const node = document.querySelector("[data-panel]");
    node.scrollTop = node.scrollHeight;
  });
  const bought = (await state(page)).stats.buys;
  // Sowa zakupowa kupuje co 0,5 s — po 2 s lista wciąż ma te same karty (bez przebudowy) i stoi na dole.
  await expect.poll(async () => (await state(page)).stats.buys, { timeout: 10_000 }).toBeGreaterThan(bought + 2);
  const after = await page.evaluate(() => {
    const node = document.querySelector("[data-panel]");
    return {
      marked: [...node.querySelectorAll("[data-plant]")].every((card) => card.dataset.mark === "1"),
      atBottom: node.scrollTop + node.clientHeight >= node.scrollHeight - 2,
    };
  });
  expect(after.marked, "karty nie są budowane od nowa przy zakupie").toBe(true);
  // Lista nie wraca na górę (przy przebudowie `innerHTML` przewinięcie skakało) i zostaje na samym dole — karty mają
  // stałą wysokość, choć liczby w opisach się zmieniają (panel może tylko urosnąć, gdy wykonany cel znika z listy).
  expect(after.atBottom, "lista zostaje przewinięta na dół").toBe(true);
  const panelBox = await panel.boundingBox();
  const buyBox = await last.locator('[data-amount="1"]').boundingBox();
  expect(buyBox.y + buyBox.height).toBeLessThanOrEqual(panelBox.y + panelBox.height + 1);
  expect(buyBox.y).toBeGreaterThanOrEqual(panelBox.y - 1);
  // Liczba sztuk i ceny odświeżają się w miejscu.
  const monstera = (await state(page)).plants.monstera;
  await expect(panel.locator('[data-plant="monstera"] [data-owned]')).toHaveText(`×${monstera}`);
  expect(errors).toEqual([]);
});

test("lista roślin (uwaga O4): „Rozwiń listę” zwija ogród do paska i daje liście więcej miejsca", async ({ page }) => {
  const errors = watchErrors(page);
  await openGarden(page);
  const panel = page.locator("[data-panel]");
  const expand = page.locator("[data-expand]");
  const portrait = await page.evaluate(() => innerHeight > innerWidth && innerWidth < 900);
  if (!portrait) {
    // Telefon poziomo i komputer mają panel obok ogrodu na całą wysokość — przycisku nie ma.
    await expect(expand).toBeHidden();
    expect(errors).toEqual([]);
    return;
  }
  const before = (await panel.boundingBox()).height;
  await expect(expand).toHaveAttribute("aria-pressed", "false");
  await expand.click();
  await expect(expand).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-goal]")).toBeHidden();
  const open = (await panel.boundingBox()).height;
  expect(open).toBeGreaterThan(before * 1.6);
  const garden = await page.locator("[data-canvas]").boundingBox();
  expect(garden.height).toBeGreaterThanOrEqual(60);
  await expand.click();
  await expect(expand).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("[data-goal]")).toBeVisible();
  expect(Math.abs((await panel.boundingBox()).height - before)).toBeLessThan(2);
  expect(errors).toEqual([]);
});

test("tło ogrodu (uwaga O7): w Kolekcji wybór tła z ukończonych rozdziałów albo „Automatyczne”", async ({ page }) => {
  const errors = watchErrors(page);
  await openGarden(page);
  await page.getByRole("tab", { name: "Kolekcja" }).click();
  const scenes = page.locator(".ogrod-scenes [data-scene]");
  await expect(scenes).toHaveCount(1);
  await expect(page.locator('[data-scene="auto"]')).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => {
    window.SowieOgrody.tap(30);
    window.SowieOgrody.give(5000);
    window.SowieOgrody.buy("monstera", 5);
    window.SowieOgrody.buy("pilea", 1);
  });
  await expect(page.locator("[data-goal]")).toContainText("Balkon");
  await expect(scenes).toHaveCount(2);
  expect(await page.evaluate(() => window.SowieOgrody.scene())).toBe("balkon");
  await page.locator('[data-scene="parapet"]').click();
  await expect(page.locator('[data-scene="parapet"]')).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => window.SowieOgrody.scene())).toBe("parapet");
  expect((await state(page)).scene).toBe("parapet");
  await page.locator('[data-scene="auto"]').click();
  await expect(page.locator('[data-scene="auto"]')).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => window.SowieOgrody.scene())).toBe("balkon");
  expect(errors).toEqual([]);
});

test("Sowie Ogrody (uwagi O2, O3): ogród po sześciu rozdziałach dostaje Palmiarnię — nic nie ginie, nowe rośliny i tło (emulator)", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  // Ogród gracza sprzed P4: ukończone wszystkie dawne rozdziały, rośliny, ulepszenia, nasiona i drzewko.
  const finished = {
    version: 3,
    leaves: 5e11,
    runLeaves: 6e11,
    lifetimeLeaves: 9e12,
    seeds: 40,
    plants: { monstera: 120, bonsai: 30, mutant: 12, zloteDrzewko: 8 },
    upgrades: { konewka: 1, zakupy: 1, rosa: 1 },
    prestige: { korzenie: 4, senni: 2 },
    chapters: { parapet: true, balkon: true, dzialka: true, basen: true, szklarnia: true, arboretum: true },
    stats: { prestiges: 3, taps: 900 },
    tutorialDone: true,
  };
  await seedDoc(project, "sowiegry/profil/sowiegry_gry/ogrody", {
    state: JSON.stringify(finished),
    saveVersion: 3,
  });
  const errors = watchErrors(page);
  await openGarden(page, cloudUrl("/SowieOgrody/", project));
  // Nowy rozdział zamiast „ukończonego” Arboretum; postęp bez zmian.
  await expect(page.locator("[data-goal]")).toContainText("Rozdział 7/14: Palmiarnia");
  await expect(page.locator("[data-goal]")).toContainText("Kup");
  const loaded = await state(page);
  expect(loaded.plants).toMatchObject(finished.plants);
  expect(loaded.upgrades).toMatchObject(finished.upgrades);
  expect(loaded.prestige).toMatchObject(finished.prestige);
  expect(loaded.seeds).toBe(40);
  expect(loaded.chapters).toMatchObject(finished.chapters);
  // Nowe rośliny Palmiarni na liście, Dżungli jeszcze nie.
  await expect(page.locator('[data-plant="palma"]')).toContainText("Palma");
  await expect(page.locator('[data-plant="strelicja"]')).toBeVisible();
  await expect(page.locator('[data-plant="bambus"]')).toHaveCount(0);
  // Ulepszenia Palmiarni i nawozy; w drzewku czwarta gałąź.
  await page.getByRole("tab", { name: "Ulepszenia" }).click();
  await expect(page.locator('[data-upgrade-card="kopula"]')).toContainText("Szklana kopuła");
  await expect(page.locator('[data-upgrade-card="nawoz-palma"]')).toBeVisible();
  await page.getByRole("tab", { name: "Prestiż" }).click();
  await expect(page.locator('[data-node="sloneczneKorzenie"]')).toContainText("Słoneczne korzenie");
  // Tło: automatycznie Palmiarnia, w Kolekcji wybór także Arboretum.
  expect(await page.evaluate(() => window.SowieOgrody.scene())).toBe("palmiarnia");
  await page.getByRole("tab", { name: "Kolekcja" }).click();
  await expect(page.locator(".ogrod-scenes [data-scene]")).toHaveCount(7);
  await page.locator('[data-scene="arboretum"]').click();
  expect(await page.evaluate(() => window.SowieOgrody.scene())).toBe("arboretum");
  // Rośliny Palmiarni w ogrodzie (własne kształty z decor.js) — rysują się bez błędów.
  await page.evaluate(() => {
    window.SowieOgrody.give(1e14);
    window.SowieOgrody.buy("palma", 10);
    window.SowieOgrody.buy("strelicja", 5);
  });
  await expect.poll(async () => (await state(page)).plants.strelicja).toBe(5);
  await page.waitForTimeout(300);
  // Zapis: rozdziały i rośliny w bazie bez strat, nazwa bieżącego rozdziału w podsumowaniu.
  await page.evaluate(() => window.SowieCloud.flush());
  await expect
    .poll(async () => {
      const doc = await readDoc(project, "sowiegry/profil/sowiegry_gry/ogrody");
      const saved = JSON.parse(doc.state);
      return [saved.chapters?.arboretum, saved.plants?.zloteDrzewko, saved.scene, doc.summary?.zone];
    })
    .toEqual([true, 8, "arboretum", "Palmiarnia"]);
  expect(errors).toEqual([]);
});

// Półka (uwaga z 2026-11-11): „rośliny były duże i przesuwały się w linii tak, aby można było widzieć wszystkie i aby
// nie znikały z półki i nie robiły się małe” — strzałki po bokach ogrodu i przesunięcie palcem.
const shelfInfo = (page) => page.evaluate(() => window.SowieOgrody.shelf());
const shelfArrow = (page, side) => page.locator(`[data-shelf="${side}"]`);

// Półka bez czekania na animację (WebKit w CI rysuje klatki nierówno, a podjazd rusza dopiero w najbliższej
// klatce): hak `settleShelf` wykonuje prośby i kończy dojazd od razu, potem jedna klatka — rysunek, miejsca zdarzeń
// (`hit`) i strzałki z położenia docelowego.
async function settle(page) {
  await page.evaluate(() => window.SowieOgrody.settleShelf());
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
  return shelfInfo(page);
}

// Ogród z logiką wstrzymaną (bez zdarzeń losowych) i półką po starcie (koniec pustej linii) — przed zmianą roślin.
async function quietGarden(page) {
  await openGarden(page);
  await ogrod(page, "hold", true);
  await settle(page);
}

test("półka (uwaga z 2026-11-11): wszystkie 27 gatunków w jednej linii, bez zmniejszania; strzałki pokazują każdy", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await quietGarden(page);
  // Jeden gatunek: roślina na środku ogrodu, bez strzałek.
  await ogrod(page, "setPlants", { monstera: 1 });
  const alone = await settle(page);
  expect(Object.keys(alone.spots)).toEqual(["monstera"]);
  expect(alone.scrollable).toBe(false);
  await expect(shelfArrow(page, "prev")).toBeHidden();
  await expect(shelfArrow(page, "next")).toBeHidden();
  // Wszystkie gatunki: każdy na półce (dawniej najwyżej 12), Monstera tej samej wielkości co sama.
  const ids = await ogrod(page, "plants");
  await ogrod(page, "setPlants", Object.fromEntries(ids.map((id) => [id, 1])));
  const full = await settle(page);
  expect(Object.keys(full.spots).length).toBe(27);
  expect(full.spots.monstera.scale).toBeCloseTo(alone.spots.monstera.scale, 9);
  // Jedna linia: ta sama wysokość, kolejność rozdziałów, odstęp co najmniej miejsce na roślinę (64 jednostki).
  const spots = ids.map((id) => full.spots[id]);
  for (const [index, spot] of spots.entries()) {
    expect(spot.y).toBe(spots[0].y);
    expect(spot.scale).toBeCloseTo(alone.spots.monstera.scale, 9);
    if (index) expect(spot.x - spots[index - 1].x).toBeGreaterThanOrEqual(64 * full.unit - 0.01);
  }
  // Półka stoi na początku linii: strzałka w lewo ukryta, w prawo widoczna (co najmniej 44 × 44 px).
  expect(full.scrollable).toBe(true);
  expect(full.offset).toBe(0);
  await expect(shelfArrow(page, "prev")).toBeHidden();
  await expect(shelfArrow(page, "next")).toBeVisible();
  const arrowBox = await shelfArrow(page, "next").boundingBox();
  expect(arrowBox.width).toBeGreaterThanOrEqual(44);
  expect(arrowBox.height).toBeGreaterThanOrEqual(44);
  // Strzałka w prawo do końca linii: każdy gatunek choć raz w ogrodzie.
  const seen = new Set(Object.keys(full.spots).filter((id) => full.spots[id].visible));
  let presses = 0;
  while ((await shelfInfo(page)).canNext) {
    await shelfArrow(page, "next").click();
    const info = await settle(page);
    for (const [id, spot] of Object.entries(info.spots)) if (spot.visible) seen.add(id);
    presses += 1;
    expect(presses).toBeLessThan(20);
  }
  expect([...seen].sort()).toEqual([...ids].sort());
  const end = await shelfInfo(page);
  expect(end.offset).toBeCloseTo(end.max, 3);
  await expect(shelfArrow(page, "next")).toBeHidden();
  await expect(shelfArrow(page, "prev")).toBeVisible();
  // Strzałka w lewo wraca do początku linii (mniej więcej tyle samo stron).
  let back = 0;
  while ((await shelfInfo(page)).canPrev) {
    await shelfArrow(page, "prev").click();
    await settle(page);
    back += 1;
    expect(back).toBeLessThanOrEqual(presses + 1);
  }
  expect((await shelfInfo(page)).offset).toBe(0);
  await expect(shelfArrow(page, "prev")).toBeHidden();
  // Klawiatura: fokus na ogrodzie, ← → przesuwają półkę.
  await page.locator("[data-canvas]").focus();
  await page.keyboard.press("ArrowRight");
  expect((await settle(page)).offset).toBeGreaterThan(0);
  await page.keyboard.press("ArrowLeft");
  expect((await settle(page)).offset).toBe(0);
  expect((await state(page)).stats.taps).toBe(0);
  expect(errors).toEqual([]);
});

test("półka (uwaga z 2026-11-11): przesunięcie palcem przesuwa linię i nie zbiera liści; stuknięcie dalej zbiera", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await quietGarden(page);
  const ids = await ogrod(page, "plants");
  await ogrod(page, "setPlants", Object.fromEntries(ids.map((id) => [id, 25])));
  const start = await settle(page);
  expect(start.scrollable).toBe(true);
  expect(start.offset).toBe(0);
  const box = await page.locator("[data-canvas]").boundingBox();
  const y = box.y + box.height * 0.8;
  const left = { x: box.x + box.width * 0.25, y };
  const right = { x: box.x + box.width * 0.75, y };
  // Palec w lewo — linia w lewo (widać rośliny z prawej) co najmniej o drogę palca (więcej tylko z rozpędu).
  await swipe(page, right, left);
  const moved = await settle(page);
  expect(moved.offset).toBeGreaterThanOrEqual((box.width * 0.5) / moved.unit - 0.1);
  await expect(shelfArrow(page, "prev")).toBeVisible();
  // Palec w prawo — z powrotem do początku linii; przesunięcia nie są stuknięciami.
  await swipe(page, left, right);
  const returned = await settle(page);
  expect(returned.offset).toBeLessThan(moved.offset);
  if (moved.offset <= (box.width * 0.5) / moved.unit + 0.1) expect(returned.offset).toBeCloseTo(0, 3);
  const after = await state(page);
  expect(after.stats.taps).toBe(0);
  expect(after.leaves).toBe(0);
  // Ruch w pionie też nie jest stuknięciem, ale półki nie przesuwa.
  const before = (await shelfInfo(page)).offset;
  await swipe(page, { x: left.x, y: box.y + box.height * 0.5 }, { x: left.x + 4, y: box.y + box.height * 0.9 });
  expect((await settle(page)).offset).toBeCloseTo(before, 3);
  expect((await state(page)).stats.taps).toBe(0);
  // Stuknięcie bez ruchu (palcem i myszą) zbiera liście w miejscu dotknięcia.
  await page.touchscreen.tap(left.x, y);
  await page.mouse.click(right.x, y);
  await expect.poll(async () => (await state(page)).stats.taps).toBe(2);
  expect((await state(page)).leaves).toBe(2);
  expect(errors).toEqual([]);
});

test("półka (uwaga z 2026-11-11): nowy gatunek i ciężarówka Amic — półka podjeżdża, żeby było je widać", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await quietGarden(page);
  const ids = await ogrod(page, "plants");
  // Wszystkie gatunki poza Monsterą; półka na końcu linii (Monstera byłaby poza ogrodem z lewej).
  await ogrod(page, "setPlants", Object.fromEntries(ids.slice(1).map((id) => [id, 10])));
  expect((await settle(page)).scrollable).toBe(true);
  let presses = 0;
  while ((await shelfInfo(page)).canNext) {
    await shelfArrow(page, "next").click();
    await settle(page);
    presses += 1;
    expect(presses).toBeLessThan(20);
  }
  // Pierwsza Monstera — półka wraca na początek linii i Monsterę widać.
  await ogrod(page, "give", 100);
  expect(await ogrod(page, "buy", "monstera", 1)).toBe(true);
  const first = await settle(page);
  expect(first.spots.monstera.visible).toBe(true);
  expect(first.offset).toBe(0);
  // Ciężarówka Amic zastawia jedną z najbardziej wydajnych roślin (koniec linii, poza ogrodem) — półka podjeżdża
  // (zastawiona roślina na środek, a przy końcu linii jak najbliżej środka) i cysternę da się stuknąć na płótnie.
  expect(await ogrod(page, "trigger", "truck")).toBe(true);
  const blocked = (await ogrod(page, "events")).blocked;
  expect(ids.slice(-3)).toContain(blocked);
  const shown = await settle(page);
  expect(shown.offset).toBeGreaterThan(0);
  expect(shown.spots[blocked].visible).toBe(true);
  const garden = await page.locator("[data-canvas]").boundingBox();
  const hit = await ogrod(page, "hit", "truck");
  expect(hit).not.toBeNull();
  expect(hit.x).toBeGreaterThan(0);
  expect(hit.x).toBeLessThan(garden.width);
  await clickCanvas(page, hit);
  await expect(page.locator('[data-alert="truck"]')).toContainText("1/3");
  expect((await state(page)).stats.taps).toBe(0);
  expect(errors).toEqual([]);
});
