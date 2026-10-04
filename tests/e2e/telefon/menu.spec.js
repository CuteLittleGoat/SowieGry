// Menu główne na telefonach (Analiza 2, rozdz. 4.1; Analiza 3, E3 — „Gotowe, gdy”):
// wybór gry, instrukcje, galeria (odblokowane, zablokowane, przeglądarka), zakładka „Sowa”,
// cele dotyku ≥ 48 px i układ od 320 × 568 bez przewijania w bok.
const { test, expect, waitForCloud, watchErrors, DEVICE_KEY } = require("../fixtures");
const { cloudUrl, seedDoc, uniqueProject } = require("../emulator");

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
  for (const name of ["Sowia Ucieczka", "SowaJumper", "Sowa3", "Sowie Ogrody", "Sowia Szklarnia"]) {
    await expect(cards.filter({ hasText: name })).toHaveCount(1);
  }
  // Rekord z profilu (tu: jeszcze bez gry) zastępuje szkielet karty po wczytaniu chmury.
  await expect(page.locator(".game-card-record.is-loading")).toHaveCount(0);
  await expect(page.locator('[data-game="runner"] [data-record]')).toHaveText(/Jeszcze bez rekordu/);
  // Sowia Ucieczka zastąpiła SowaRunner (E4f): karta „runner” prowadzi do nowej gry, ma znaczek „Nowe!”,
  // a przycisku wersji podglądowej już nie ma.
  await expect(page.locator('[data-play="runner"]')).toHaveAttribute("href", "SowiaUcieczka/");
  await expect(page.locator('[data-game="runner"] .game-card-new')).toHaveText("Nowe!");
  // Sowie Tory (E5) w podglądzie: karta Sowa3 prowadzi do obecnej gry i ma przycisk nowej wersji.
  await expect(page.locator('[data-play="sowa3"]')).toHaveAttribute("href", "Sowa3/");
  await expect(page.locator("[data-preview]")).toHaveCount(4);
  await expect(page.locator('[data-preview="sowa3"]')).toHaveAttribute("href", "SowieTory/");
  await expect(page.locator('[data-preview="sowa3"]')).toContainText("Wypróbuj nową wersję: Sowie Tory");
  // Sowa w Chmurach (E6) w podglądzie: karta SowaJumper prowadzi do obecnej gry i ma przycisk nowej wersji.
  await expect(page.locator('[data-play="jumper"]')).toHaveAttribute("href", "SowaJumper/");
  await expect(page.locator('[data-preview="jumper"]')).toHaveAttribute("href", "SowaWChmurach/");
  await expect(page.locator('[data-preview="jumper"]')).toContainText("Wypróbuj nową wersję: Sowa w Chmurach");
  // Nowe Sowie Ogrody (E7) w podglądzie: ten sam folder, strona nowa.html.
  await expect(page.locator('[data-play="ogrody"]')).toHaveAttribute("href", "SowieOgrody/");
  await expect(page.locator('[data-preview="ogrody"]')).toHaveAttribute("href", "SowieOgrody/nowa.html");
  await expect(page.locator('[data-preview="ogrody"]')).toContainText("Wypróbuj nową wersję: nowe Sowie Ogrody");
  await expect(page.locator('[data-preview="szklarnia"]')).toHaveAttribute("href", "LaczIHoduj/");
  await expect(page.locator('[data-preview="szklarnia"]')).toContainText("Wypróbuj nową wersję: Łącz i Hoduj");
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

test("rekordy gry z trybami (Sowa3 / Sowie Tory): Kampania i Nieskończony osobno (emulator)", async ({
  page,
}, testInfo) => {
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
  const records = page.getByRole("dialog", { name: /Rekordy — Sowa3/ });
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
  const dialog = page.getByRole("dialog", { name: "Jak grać — SowaJumper" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".sowie-guide-card")).toHaveCount(5);
  await expect(dialog.locator(".sowie-gesture-demo")).toHaveCount(1);
  await dialog.getByRole("button", { name: "Rozumiem" }).click();
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();

  await page.getByRole("tab", { name: "Jak grać" }).click();
  const panel = page.locator("#jak-grac");
  await expect(panel.locator(".menu-guide")).toHaveCount(6);
  await expect(panel.locator(".menu-guide").first()).toContainText("Poznaj Sowi Świat");
  // Karty sterowania mają animowaną demonstrację gestu: po jednej w obecnych grach i trzy w Sowiej Ucieczce
  // (skok — stuknięcie, szybowanie — przytrzymanie, ślizg — przesunięcie w dół).
  await expect(panel.locator(".sowie-gesture-demo")).toHaveCount(7);
  await expect(panel.locator("#jak-grac-runner .sowie-gesture-demo")).toHaveCount(3);
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
  // Cele Akademii odblokowują kolejne zdjęcia (1000 m w Sowiej Ucieczce, 250 m w SowaJumper).
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
