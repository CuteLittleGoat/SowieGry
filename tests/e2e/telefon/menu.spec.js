// Menu główne na telefonach (Analiza 2, rozdz. 4.1; Analiza 3, E3 — „Gotowe, gdy”):
// wybór gry, instrukcje, galeria (odblokowane, zablokowane, przeglądarka), zakładka „Sowa”,
// cele dotyku ≥ 48 px i układ od 320 × 568 bez przewijania w bok.
const { test, expect, waitForCloud, watchErrors, DEVICE_KEY } = require("../fixtures");
const { cloudUrl, readDoc, seedDoc, uniqueProject } = require("../emulator");

async function openMenu(page, query = "seed=menu-telefon&testNow=1783656000000") {
  await page.goto(`/?${query}`, { waitUntil: "load" });
  await waitForCloud(page);
  await expect(page.locator(".game-card")).toHaveCount(5);
}

// Gest w przeglądarce zdjęć: zdarzenia wskaźnika (jak palec) na scenie zdjęcia.
async function gesture(page, points) {
  await page.evaluate((steps) => {
    const stage = document.querySelector("[data-viewer-stage]");
    const box = stage.getBoundingClientRect();
    for (const [type, dx, dy] of steps) {
      stage.dispatchEvent(
        new PointerEvent(type, {
          pointerId: 7,
          pointerType: "touch",
          isPrimary: true,
          bubbles: true,
          clientX: box.left + box.width / 2 + dx,
          clientY: box.top + box.height / 2 + dy,
        }),
      );
    }
  }, points);
}

test("zakładka „Gry”: pięć kart z rejestru, „Graj” otwiera grę", async ({ page }) => {
  const errors = watchErrors(page);
  await openMenu(page);
  await expect(page.getByRole("tab", { name: "Gry" })).toHaveAttribute("aria-selected", "true");
  const cards = page.locator(".game-card");
  for (const name of ["Sowia Ucieczka", "Sowa w Chmurach", "Sowie Tory", "Sowie Ogrody", "Łącz i Hoduj"]) {
    await expect(cards.filter({ hasText: name })).toHaveCount(1);
  }
  // Rekord z profilu (tu: jeszcze bez gry) zastępuje szkielet karty po wczytaniu chmury.
  await expect(page.locator(".game-card-record.is-loading")).toHaveCount(0);
  await expect(page.locator('[data-game="runner"] [data-record]')).toHaveText(/Jeszcze bez rekordu/);
  // Sowia Ucieczka zastąpiła SowaRunner (E4f): karta „runner” prowadzi do nowej gry, ma znaczek „Nowe!”,
  // a przycisku wersji podglądowej już nie ma.
  await expect(page.locator('[data-play="runner"]')).toHaveAttribute("href", "SowiaUcieczka/");
  await expect(page.locator('[data-game="runner"] .game-card-new')).toHaveText("Nowe!");
  // Sowie Tory zastąpiły Sowa3 (E5f): karta „sowa3” prowadzi do nowej gry i ma znaczek „Nowe!”.
  await expect(page.locator('[data-play="sowa3"]')).toHaveAttribute("href", "SowieTory/");
  await expect(page.locator('[data-game="sowa3"] .game-card-new')).toHaveText("Nowe!");
  await expect(page.locator('[data-preview="sowa3"]')).toHaveCount(0);
  // Sowa w Chmurach zastąpiła SowaJumper (E6f): karta „jumper” prowadzi do nowej gry i ma znaczek „Nowe!”.
  await expect(page.locator('[data-play="jumper"]')).toHaveAttribute("href", "SowaWChmurach/");
  await expect(page.locator('[data-game="jumper"] .game-card-new')).toHaveText("Nowe!");
  // Od E8e wszystkie gry są przebudowane — żadna karta nie ma już przycisku wersji podglądowej.
  await expect(page.locator("[data-preview]")).toHaveCount(0);
  // Nowa odsłona Sowich Ogrodów zastąpiła dawną grę (E7e) w tym samym folderze: „Nowe!”, bez podglądu.
  await expect(page.locator('[data-play="ogrody"]')).toHaveAttribute("href", "SowieOgrody/");
  await expect(page.locator('[data-game="ogrody"] .game-card-new')).toHaveText("Nowe!");
  // Łącz i Hoduj zastąpiła Sowią Szklarnię (E8e): karta „szklarnia” prowadzi do nowej gry i ma znaczek „Nowe!”.
  await expect(page.locator('[data-play="szklarnia"]')).toHaveAttribute("href", "LaczIHoduj/");
  await expect(page.locator('[data-game="szklarnia"] .game-card-new')).toHaveText("Nowe!");
  // Ilustracje rysują postacie z atlasu.
  await page.waitForFunction(() => window.SowieMenu.atlas.ready() && window.SowieMenu.frames() > 3);

  // Stuknięcie w „Graj” nie zaczyna pobierać dźwięków menu (strona zaraz się zmienia; WebKit zgłasza
  // przerwane pobieranie jako błąd strony).
  const audioRequests = [];
  page.on("request", (request) => {
    if (/assets\/audio\/(sfx|music)\//.test(request.url())) audioRequests.push(request.url());
  });
  await page.locator('[data-play="runner"]').click();
  await expect(page).toHaveURL(/\/SowiaUcieczka\/$/);
  // Menu nie pobiera dźwięków po stuknięciu; gra wczytuje swoje dopiero po pierwszym dotknięciu na swojej stronie.
  expect(audioRequests).toEqual([]);
  await expect(page.locator("[data-stage] canvas")).toBeVisible({ timeout: 15_000 });
  expect(errors).toEqual([]);
});

test("rekord osobisty na karcie pochodzi z profilu w chmurze (emulator)", async ({ page }, testInfo) => {
  const project = uniqueProject(testInfo);
  await seedDoc(project, "sowiegry/profil", {
    schemaVersion: 1,
    records: {
      runner: { arcade: { bestScore: 900, bestDistance: 1250 }, chaos: { bestDistance: 400 } },
      sowa3: { chill: { bestScore: 15300 } },
      ogrody: { lifetimeLeaves: 4200 },
    },
  });
  const errors = watchErrors(page);
  await page.goto(cloudUrl("/?seed=menu-rekordy", project), { waitUntil: "load" });
  await waitForCloud(page);
  await expect(page.locator('[data-game="runner"] [data-record]')).toHaveText("Rekord: 1250 m");
  await expect(page.locator('[data-game="sowa3"] [data-record]')).toHaveText(/Rekord: 15\s300 pkt/);
  await expect(page.locator('[data-game="ogrody"] [data-record]')).toHaveText("Liście: 4200");
  await expect(page.locator('[data-game="jumper"] [data-record]')).toHaveText(/Jeszcze bez rekordu/);
  expect(errors).toEqual([]);
});

test("rekordy gry z trybami (Sowie Tory): Kampania i Nieskończony osobno (emulator)", async ({ page }, testInfo) => {
  const project = uniqueProject(testInfo);
  await seedDoc(project, "sowiegry/profil", {
    schemaVersion: 1,
    records: { sowa3: { runs: 3, arcade: { bestScore: 4100 }, "nieskonczony-arcade": { bestScore: 9900 } } },
  });
  await seedDoc(project, "sowiegry/profil/sowiegry_gry/sowa3", {
    top10: {
      arcade: [{ score: 4100, difficulty: "arcade", at: 1783656000000 }],
      "nieskonczony-arcade": [{ score: 9900, difficulty: "arcade", mode: "nieskonczony", at: 1783656000000 }],
    },
  });
  const errors = watchErrors(page);
  await page.goto(cloudUrl("/?seed=menu-tryby", project), { waitUntil: "load" });
  await waitForCloud(page);
  // Karta gry pokazuje rekord kampanii.
  await expect(page.locator('[data-game="sowa3"] [data-record]')).toHaveText(/Rekord: 4\s?100 pkt/);
  await page.getByRole("tab", { name: "Sowa" }).click();
  await page.locator('[data-records="sowa3"]').click();
  const records = page.getByRole("dialog", { name: /Rekordy — Sowie Tory/ });
  await expect(records.getByRole("button", { name: "Kampania" })).toHaveAttribute("aria-pressed", "true");
  await expect(records.locator("[data-best]")).toHaveText(/4\s?100 pkt/);
  await expect(records).toContainText("Top 10 — Kampania, Arcade");
  await records.getByRole("button", { name: "Nieskończony" }).click();
  await expect(records.getByRole("button", { name: "Nieskończony" })).toHaveAttribute("aria-pressed", "true");
  await expect(records.locator("[data-best]")).toHaveText(/9\s?900 pkt/);
  await expect(records).toContainText("Top 10 — Nieskończony, Arcade");
  await expect(records.locator(".menu-top li")).toHaveCount(1);
  await expect(records.locator(".menu-top li")).toContainText(/9\s?900 pkt/);
  expect(errors).toEqual([]);
});

test("instrukcje: „Jak grać?” na karcie i zakładka z kartami wszystkich gier", async ({ page }) => {
  const errors = watchErrors(page);
  await openMenu(page);

  const button = page.locator('[data-guide="jumper"]');
  await button.click();
  const dialog = page.getByRole("dialog", { name: "Jak grać — Sowa w Chmurach" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".sowie-guide-card")).toHaveCount(7);
  await expect(dialog.locator(".sowie-gesture-demo")).toHaveCount(1);
  await dialog.getByRole("button", { name: "Rozumiem" }).click();
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();

  await page.getByRole("tab", { name: "Jak grać" }).click();
  const panel = page.locator("#jak-grac");
  await expect(panel.locator(".menu-guide")).toHaveCount(6);
  await expect(panel.locator(".menu-guide").first()).toContainText("Poznaj Sowi Świat");
  // Karty sterowania mają animowaną demonstrację gestu: po jednej w obecnych grach i po trzy w Sowiej Ucieczce
  // (skok — stuknięcie, szybowanie — przytrzymanie, ślizg — przesunięcie w dół) i Sowich Torach (zmiana toru,
  // skok — przesunięcie w górę, ślizg — w dół).
  // Od E8e Łącz i Hoduj ma dwie (przeciągnięcie — łączenie, stuknięcie — doniczka).
  await expect(panel.locator(".sowie-gesture-demo")).toHaveCount(10);
  await expect(panel.locator("#jak-grac-szklarnia .sowie-gesture-demo")).toHaveCount(2);
  await expect(panel.locator("#jak-grac-runner .sowie-gesture-demo")).toHaveCount(3);
  await expect(panel.locator("#jak-grac-sowa3 .sowie-gesture-demo")).toHaveCount(3);
  expect(errors).toEqual([]);
});

test("odnośnik do instrukcji jednej gry i przełączanie zakładek z klawiatury", async ({ page }) => {
  await page.goto("/?seed=menu-odnosnik#jak-grac-sowa3", { waitUntil: "load" });
  await expect(page.getByRole("tab", { name: "Jak grać" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#jak-grac-sowa3")).toBeInViewport();

  const tab = page.getByRole("tab", { name: "Jak grać" });
  await tab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Galeria" })).toBeFocused();
  await expect(page.locator("#galeria")).toBeVisible();
  await expect(page).toHaveURL(/#galeria$/);
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Sowa" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(page.getByRole("tab", { name: "Gry" })).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveURL(/\/\?seed=menu-odnosnik$/);
});

test("galeria: nowe zdjęcia, zablokowane z postępem i przeglądarka z gestami", async ({ page }) => {
  const errors = watchErrors(page);
  await openMenu(page);
  // Cele Akademii odblokowują kolejne zdjęcia (1000 m w Sowiej Ucieczce, 250 m w Sowie w Chmurach).
  await page.evaluate(() => {
    window.SowieAcademy.record("runner", "runnerDistance", 1500);
    window.SowieAcademy.record("jumper", "jumperHeight", 300);
  });
  await page.getByRole("tab", { name: "Galeria" }).click();
  const panel = page.locator("#galeria");
  await expect(panel.locator("[data-gallery-count]")).toHaveText("3 / 30");
  await expect(panel.locator(".menu-tile.is-new")).toHaveCount(3);
  await expect(panel.locator(".menu-tile.is-locked")).toHaveCount(27);
  const locked = panel.locator(".menu-tile.is-locked").first();
  await expect(locked.locator(".menu-tile-lock")).toBeVisible();
  await expect(locked.locator("[role=progressbar]")).toHaveAttribute("aria-valuenow", /^\d+$/);

  await panel.locator("[data-open-photo]").first().click();
  const viewer = page.getByRole("dialog", { name: /^Zdjęcie: / });
  await expect(viewer.locator("[data-viewer-count]")).toHaveText("1 / 3");
  // Przesunięcie w lewo — następne zdjęcie; w prawo — poprzednie.
  await gesture(page, [
    ["pointerdown", 80, 0],
    ["pointermove", 20, 0],
    ["pointermove", -60, 0],
    ["pointerup", -60, 0],
  ]);
  await expect(viewer.locator("[data-viewer-count]")).toHaveText("2 / 3");
  await gesture(page, [
    ["pointerdown", -80, 0],
    ["pointermove", 0, 0],
    ["pointermove", 80, 0],
    ["pointerup", 80, 0],
  ]);
  await expect(viewer.locator("[data-viewer-count]")).toHaveText("1 / 3");
  // Podwójne stuknięcie powiększa, kolejne wraca do całego zdjęcia.
  await gesture(page, [
    ["pointerdown", 10, 10],
    ["pointerup", 10, 10],
    ["pointerdown", 10, 10],
    ["pointerup", 10, 10],
  ]);
  expect(await page.evaluate(() => window.SowieMenu.gallery.viewer().state().scale)).toBe(2.5);
  await gesture(page, [
    ["pointerdown", 10, 10],
    ["pointerup", 10, 10],
    ["pointerdown", 10, 10],
    ["pointerup", 10, 10],
  ]);
  expect(await page.evaluate(() => window.SowieMenu.gallery.viewer().state().scale)).toBe(1);
  // Przesunięcie w dół zamyka przeglądarkę.
  await gesture(page, [
    ["pointerdown", 0, -60],
    ["pointermove", 0, 0],
    ["pointermove", 0, 80],
    ["pointerup", 0, 80],
  ]);
  await expect(viewer).toBeHidden();
  await expect(panel.locator(".menu-tile.is-new")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("zakładka „Sowa”: garderoba, ustawienia, rekordy i wylogowanie urządzenia", async ({ page }) => {
  const errors = watchErrors(page);
  await openMenu(page);

  // Przycisk ustawień w nagłówku prowadzi do ustawień w zakładce „Sowa”.
  await page.locator("[data-open-settings]").click();
  await expect(page.getByRole("tab", { name: "Sowa" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#ustawienia")).toBeFocused();

  const bow = page.locator('[data-cosmetic="bow"]');
  await bow.click();
  await expect(bow).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-cosmetic="glasses"]')).toBeDisabled();
  await expect(page.locator('[data-owl-card="garderoba"]')).toContainText("Zbierz 20 liści monster (0 / 20)");

  await page.locator('[data-setting="cozy"]').click();
  await expect(page.locator('[data-setting="cozy"]')).toHaveAttribute("aria-pressed", "true");
  await page.locator('[data-setting="effects"]').click();
  await expect(page.locator("html")).toHaveClass(/sowie-reduced-effects/);
  await page.locator('[data-volume="music"]').fill("0");
  const settings = await page.evaluate(() => ({
    cosmetic: window.SowieCloud.profile().cosmetics.selected,
    ...window.SowieCloud.profile().settings,
  }));
  expect(settings).toMatchObject({ cosmetic: "bow", cozy: true, reducedEffects: true, volumeMusic: 0, music: false });

  await page.locator('[data-records="runner"]').click();
  const records = page.getByRole("dialog", { name: "Rekordy — Sowia Ucieczka" });
  await expect(records).toContainText("Brak rozgrywek na tym poziomie");
  await records.getByRole("button", { name: "Chaos" }).click();
  await expect(records.getByRole("button", { name: "Chaos" })).toHaveAttribute("aria-pressed", "true");
  await expect(records).toContainText("Top 10 — Chaos");
  await records.locator("[data-modal-actions] button").click();
  await expect(records).toBeHidden();

  await page.getByRole("button", { name: "Wyloguj to urządzenie" }).click();
  const confirm = page.getByRole("dialog", { name: "Wylogować to urządzenie?" });
  await confirm.getByRole("button", { name: "Anuluj" }).click();
  await expect(confirm).toBeHidden();
  await page.getByRole("button", { name: "Wyloguj to urządzenie" }).click();
  await Promise.all([page.waitForEvent("load"), confirm.getByRole("button", { name: "Wyloguj" }).click()]);
  await expect(page.getByRole("dialog", { name: "Hasło sowy" })).toBeVisible();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).unlocked, DEVICE_KEY)).toBe(false);
  expect(errors).toEqual([]);
});

test("zakładka „Sowa”: osiągnięcia Sowiej Akademii z postępem i nagrodą (E9b)", async ({ page }) => {
  const errors = watchErrors(page);
  await openMenu(page);
  await page.getByRole("tab", { name: "Sowa" }).click();
  const card = page.locator('[data-owl-card="osiagniecia"]');
  await expect(card.locator("[data-achievements-count]")).toHaveText("0 / 13");
  await expect(card.locator('[data-achievement="zbieraczka"]')).toContainText("0 / 1000");

  await page.evaluate(() => window.SowieAcademy.record("runner", "leaves", 1000, "add"));
  await expect(card.locator("[data-achievements-count]")).toHaveText("1 / 13");
  const collector = card.locator("li").first();
  await expect(collector).toHaveAttribute("data-achievement", "zbieraczka");
  await expect(collector).toHaveClass(/is-done/);
  await expect(collector).toContainText("Zdobyte!");
  await expect(page.getByText("Osiągnięcie: Zbieraczka liści")).toBeVisible();
  const academy = await page.evaluate(() => window.SowieCloud.profile().academy);
  expect(academy.version).toBe(3);
  expect(academy.achievements.zbieraczka).toBeGreaterThan(0);
  expect(academy.awards["achievement:zbieraczka"]).toBeGreaterThan(0);
  expect(academy.feathers).toBeGreaterThanOrEqual(8);
  expect(errors).toEqual([]);
});

// Odsetek „ciepłych” pikseli sówki w profilu (czerwony − niebieski > 60) wśród nieprzezroczystych, gdy atlas jest
// gotowy: rudobrązowa Sówka ok. 30%, szarobrązowy Puszczyk ok. 3%. Bez porównywania dokładnych pikseli — WebKit
// inaczej zarządza kolorem obrazków SVG i przy ponownym rysowaniu daje minimalnie inne piksele.
const profileOwlWarmShare = (page) =>
  page.evaluate(() => {
    const canvas = document.querySelector("[data-profile-owl]");
    if (!window.SowieMenu?.atlas?.ready?.() || !canvas?.width) return null;
    const data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    let warm = 0;
    let count = 0;
    for (let index = 0; index < data.length; index += 4) {
      if (data[index + 3] < 200) continue;
      count += 1;
      if (data[index] - data[index + 2] > 60) warm += 1;
    }
    return count > 500 ? (100 * warm) / count : null;
  });

test("zakładka „Sowa”: Sowi Butik — gatunek sowy, dłuższe kózki i strój za piórka (E9c)", async ({ page }) => {
  const errors = watchErrors(page);
  await openMenu(page);
  await page.evaluate(() => window.SowieAcademy.award("test:piorka", 0, 100, "Piórka do testu"));
  await page.getByRole("tab", { name: "Sowa" }).click();
  const shop = page.locator('[data-owl-card="butik"]');
  await expect(shop.locator("[data-shop-feathers]")).toHaveText("🪶 100 piórek");
  await expect(shop.locator('[data-species="sowka"]')).toHaveAttribute("aria-pressed", "true");
  await expect(shop.locator('[data-shop-item="species:uszatka"]')).toContainText("Poziom 3");
  await expect(page.locator('[data-owl-card="garderoba"]')).toContainText("W Sowim Butiku za 80 piórek");
  await expect.poll(() => profileOwlWarmShare(page)).toBeGreaterThan(15); // Sówka
  const dialog = page.getByRole("dialog", { name: "Kupić w Sowim Butiku?" });

  // Gatunek: zakup z potwierdzeniem, od razu wybrany, sówka w profilu w kolorach Puszczyka.
  await shop.locator('[data-buy="species:puszczyk"]').click();
  await expect(dialog).toContainText("Puszczyk za 40 piórek (masz 100).");
  await dialog.getByRole("button", { name: "Kup", exact: true }).click();
  await expect(page.getByText("Kupione: Puszczyk!")).toBeVisible();
  await expect(shop.locator('[data-species="puszczyk"]')).toHaveAttribute("aria-pressed", "true");
  await expect(shop.locator("[data-shop-feathers]")).toHaveText("🪶 60 piórek");
  // Atlas przebudowany z kolorami Puszczyka — sówka w profilu jest szarobrązowa.
  await expect.poll(() => profileOwlWarmShare(page)).toBeLessThan(10);

  // Dłuższe kózki: poziom 1 (×1,2); na poziom 2 (60 piórek) już nie starcza.
  await shop.locator('[data-buy="goat:1"]').click();
  await dialog.getByRole("button", { name: "Anuluj" }).click();
  await expect(shop.locator("[data-shop-feathers]")).toHaveText("🪶 60 piórek");
  await shop.locator('[data-buy="goat:1"]').click();
  await dialog.getByRole("button", { name: "Kup", exact: true }).click();
  await expect(shop.locator("[data-goat-level]")).toContainText("Teraz: ×1,2 (poziom 1 z 3)");
  await expect(shop.locator('[data-buy="goat:2"]')).toBeDisabled();

  // Strój: Muszka do garderoby; Korona (80) za droga.
  await expect(shop.locator('[data-buy="outfit:crown"]')).toBeDisabled();
  await shop.locator('[data-buy="outfit:bowTie"]').click();
  await dialog.getByRole("button", { name: "Kup", exact: true }).click();
  await expect(shop.locator('[data-shop-item="outfit:bowTie"]')).toHaveCount(0);
  await expect(page.locator('[data-cosmetic="bowTie"]')).toBeEnabled();
  await expect(shop.locator("[data-shop-feathers]")).toHaveText("🪶 0 piórek");

  // Powrót do Sówki — bez zakupu.
  await shop.locator('[data-species="sowka"]').click();
  await expect(shop.locator('[data-species="sowka"]')).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => profileOwlWarmShare(page)).toBeGreaterThan(15);
  const profile = await page.evaluate(() => window.SowieCloud.profile());
  expect(profile.shop).toMatchObject({ goatLevel: 1, species: { owned: ["sowka", "puszczyk"], selected: "sowka" } });
  expect(Object.keys(profile.shop.purchases).sort()).toEqual(["goat:1", "outfit:bowTie", "species:puszczyk"]);
  expect(profile.cosmetics.unlocked).toContain("bowTie");
  expect(profile.academy.feathers).toBe(0);
  expect(errors).toEqual([]);
});

test("zakładka „Sowa”: „Powtórz samouczki we wszystkich grach” — `tutorialDone: false` w dokumentach gier z samouczkiem (emulator, uwaga G1)", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  await seedDoc(project, "sowiegry/profil/sowiegry_gry/runner", {
    tutorialDone: true,
    top10: { arcade: [{ score: 1250, difficulty: "arcade", at: 1783656000000 }] },
  });
  const errors = watchErrors(page);
  await page.goto(cloudUrl("/?seed=menu-samouczki", project), { waitUntil: "load" });
  await waitForCloud(page);
  await page.getByRole("tab", { name: "Sowa" }).click();
  const button = page.getByRole("button", { name: "Powtórz samouczki we wszystkich grach" });
  await button.click();
  const confirm = page.getByRole("dialog", { name: "Powtórzyć samouczki?" });
  await confirm.getByRole("button", { name: "Anuluj" }).click();
  await expect(confirm).toBeHidden();
  await button.click();
  await confirm.getByRole("button", { name: "Powtórz" }).click();
  await expect(page.locator("[data-tutorials-reset]")).toContainText("Samouczki wrócą przy następnym wejściu");
  await page.evaluate(() => window.SowieCloud.flush());
  for (const gameId of ["runner", "sowa3", "jumper", "ogrody", "szklarnia"]) {
    expect((await readDoc(project, `sowiegry/profil/sowiegry_gry/${gameId}`)).tutorialDone, gameId).toBe(false);
  }
  // Reszta dokumentu gry bez zmian (Top 10 zostaje) — zapis tylko pola `tutorialDone`.
  expect((await readDoc(project, "sowiegry/profil/sowiegry_gry/runner")).top10.arcade[0].score).toBe(1250);
  expect(errors).toEqual([]);
});

test.describe("najmniejszy telefon (320 × 568)", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("każda zakładka mieści się w szerokości, a cele dotyku mają co najmniej 48 px", async ({ page }) => {
    const errors = watchErrors(page);
    await openMenu(page);
    for (const tab of ["Gry", "Jak grać", "Galeria", "Sowa"]) {
      await page.getByRole("tab", { name: tab }).click();
      await page.waitForTimeout(200);
      // Mierzymy po zakończeniu animacji (np. obrót nowego zdjęcia w Galerii trwa 0,9 s — w trakcie kafelek jest
      // wizualnie wąski); nieskończone animacje tła (chmury) pomijamy.
      await page.evaluate(() =>
        Promise.all(
          document
            .getAnimations()
            .filter((animation) => animation.effect?.getComputedTiming?.().iterations !== Infinity)
            .map((animation) => animation.finished.catch(() => null)),
        ),
      );
      const report = await page.evaluate(() => {
        const small = [...document.querySelectorAll("button, a[href], input, [role=tab]")]
          .filter((node) => node.offsetParent !== null && !node.closest(".sowie-guide-cards"))
          .map((node) => {
            const box = node.getBoundingClientRect();
            return { name: (node.getAttribute("aria-label") || node.textContent).trim().slice(0, 40), box };
          })
          .filter(({ box }) => box.width < 48 || box.height < 48)
          .map(({ name, box }) => `${name}: ${Math.round(box.width)}×${Math.round(box.height)}`);
        return { overflow: document.documentElement.scrollWidth - window.innerWidth, small };
      });
      expect(report.overflow, tab).toBeLessThanOrEqual(0);
      expect(report.small, tab).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
});
