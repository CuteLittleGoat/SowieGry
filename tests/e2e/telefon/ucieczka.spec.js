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

test("kózka daje power-up w HUD, pełny Plusk-o-metr uruchamia rejs na humbaku, nowy biom ma komunikat", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-start]").click();
  await page.waitForTimeout(600);
  const splash = page.locator(".ucieczka-splash");
  await expect(splash).toBeVisible();
  await expect(splash).toHaveAttribute("aria-valuenow", "0");

  await page.evaluate(() => window.SowiaUcieczka.goat("tarcza"));
  await expect(page.locator(".sowie-hud-powerup", { hasText: "Tarcza" })).toBeVisible();
  expect((await page.evaluate(() => window.SowiaUcieczka.powerups())).tarcza).toBeGreaterThan(0);

  await page.evaluate(() => window.SowiaUcieczka.fillSplash());
  await expect.poll(() => page.evaluate(() => Boolean(window.SowiaUcieczka.bonus()))).toBe(true);
  await expect(splash).toHaveClass(/is-bonus/);
  await expect(splash).toHaveAttribute("aria-label", /Rejs na humbaku/);
  await expect(page.locator(".sowie-toast-chip", { hasText: "Rejs na humbaku!" })).toBeVisible();
  const box = await page.locator("[data-stage]").boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.5);
  await expect.poll(() => page.evaluate(() => window.SowiaUcieczka.bonus()?.y ?? 0)).toBeLessThan(-0.5);

  await page.evaluate(() => window.SowiaUcieczka.warp(1000));
  await expect(page.locator(".sowie-toast-chip", { hasText: "Miasto" })).toBeVisible();
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

test("zadania biegu: ukończone w biegu, po biegu nowe zadania i wyższy Sowi mnożnik (emulator)", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  await seedDoc(project, "sowiegry/profil/sowiegry_gry/runner", {
    tasks: {
      level: 1,
      completed: 2,
      active: [
        { id: "kozka-magnes", progress: 0 },
        { id: "humbak", progress: 0 },
        { id: "o-wlos", progress: 1 },
      ],
    },
  });
  const errors = watchErrors(page);
  await openGame(page, cloudUrl("/SowiaUcieczka/?seed=ucieczka-zadania", project));
  await expect(page.locator("[data-multiplier]")).toHaveText("×1");
  await page.locator("[data-tasks]").click();
  const dialog = page.getByRole("dialog", { name: "Zadania biegu" });
  await expect(dialog).toContainText("Złap Kózkę Magnes");
  await expect(dialog).toContainText("Popłyń na humbaku");
  await expect(dialog).toContainText("1 / 5");
  await dialog.getByRole("button", { name: "Do biegu!" }).click();
  await expect(dialog).toBeHidden();

  await page.locator("[data-start]").click();
  await page.waitForTimeout(500);
  await page.evaluate(() => window.SowiaUcieczka.goat("magnes"));
  await expect(page.locator(".sowie-toast-chip", { hasText: "Zadanie wykonane: Złap Kózkę Magnes" })).toBeVisible();
  await page.evaluate(() => window.SowiaUcieczka.fillSplash());
  await expect
    .poll(() => page.evaluate(() => window.SowiaUcieczka.tasks().list.filter((task) => task.done).length))
    .toBe(2);
  await page.evaluate(() => window.SowiaUcieczka.end());
  const results = page.getByRole("dialog", { name: /Koniec biegu/ });
  await expect(results).toContainText("Sowi mnożnik ×2!");
  await expect(results.locator("[data-results-tasks] li.is-new", { hasText: "Kózkę Magnes" })).toHaveCount(1);
  await expect(results.locator("[data-results-tasks] li.is-new", { hasText: "humbaku" })).toHaveCount(1);
  await expect(page.locator("[data-multiplier]")).toHaveText("×2");

  await page.evaluate(() => window.SowieCloud.flush());
  const doc = await readDoc(project, "sowiegry/profil/sowiegry_gry/runner");
  expect(doc.tasks.completed).toBe(4);
  expect(doc.tasks.level).toBe(2);
  expect(doc.tasks.active).toHaveLength(3);
  const ids = doc.tasks.active.map((task) => task.id);
  expect(ids).not.toContain("kozka-magnes");
  expect(ids).not.toContain("humbak");
  expect(doc.tasks.active.find((task) => task.id === "o-wlos").progress).toBeGreaterThanOrEqual(1);
  expect(doc.top10.arcade).toHaveLength(1);

  // Następny bieg liczy dystans z Sowim mnożnikiem ×2.
  await results.getByRole("button", { name: "Jeszcze raz" }).click();
  expect((await state(page)).multiplier).toBe(2);
  expect(errors).toEqual([]);
});

test("wyzwanie dnia: ziarno z daty, poziom Arcade, rekord dnia w dokumencie gry (emulator)", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await openGame(page, cloudUrl("/SowiaUcieczka/?daily=1", project));
  const today = await page.evaluate(() => window.SowieCloud.helpers.dayKey(Date.now()));
  expect(await page.evaluate(() => window.SowiaUcieczka.seed())).toBe(`daily-${today}-runner`);
  await expect(page.locator("[data-daily-note]")).toContainText("Dziś jeszcze bez wyniku");
  await expect(page.locator('[data-level="arcade"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-level="chaos"]')).toBeDisabled();
  const back = page.locator("[data-daily]");
  await expect(back).toHaveText("Zwykły bieg");
  expect(await back.getAttribute("href")).not.toContain("daily=1");
  expect(await back.getAttribute("href")).toContain("cloud=emulator");

  await page.locator("[data-start]").click();
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.SowiaUcieczka.end());
  const results = page.getByRole("dialog", { name: /Koniec biegu/ });
  await expect(results).toContainText("Wyzwanie dnia zapisane");
  const { distance } = await state(page);
  await page.evaluate(() => window.SowieCloud.flush());
  const doc = await readDoc(project, "sowiegry/profil/sowiegry_gry/runner");
  expect(doc.dailyBest[today]).toBe(distance);
  expect(doc.top10.arcade[0]).toMatchObject({ daily: true, seed: `daily-${today}-runner` });
  await expect(page.locator("[data-daily-note]")).toContainText(
    `Dzisiaj najdalej: ${distance.toLocaleString("pl-PL")} m`,
  );
  expect(errors).toEqual([]);
});

async function swipeDown(page, x, y) {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 80, { steps: 4 });
  await page.mouse.up();
}

test("samouczek pierwszego biegu: gra czeka na pokazany ruch, 4 kroki bez trafień, potem zapis w dokumencie gry (emulator)", async ({
  page,
}, testInfo) => {
  // Długi scenariusz (4 kroki biegu): w WebKit w CI trwa dłużej niż domyślne 30 s, a między krokami gra biegnie
  // kilka sekund — dlatego dłuższy limit testu i czekania na kolejną podpowiedź.
  test.setTimeout(90_000);
  const step = { timeout: 15_000 };
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await openGame(page, cloudUrl("/SowiaUcieczka/", project));
  await page.locator("[data-start]").click();
  const prompt = page.locator(".ucieczka-tutorial");
  const box = await page.locator("[data-stage]").boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  // 1. Skok: gra stoi, dopóki gracz nie stuknie.
  await expect(prompt).toContainText("Stuknij ekran — skok nad telefonem!", step);
  await expect(prompt).toContainText("krok 1 z 4");
  await expect(prompt.locator(".sowie-gesture-demo")).toHaveAttribute("data-gesture", "tap");
  const frozen = (await state(page)).distance;
  await page.waitForTimeout(400);
  expect((await state(page)).distance).toBe(frozen);
  await page.mouse.click(cx, cy);
  await expect(prompt).toBeHidden(step);

  // 2. Ślizg: stuknięcie nie wznawia gry, przesunięcie w dół — tak.
  await expect(prompt).toContainText("Przesuń palcem w dół", step);
  await expect(prompt.locator(".sowie-gesture-demo")).toHaveAttribute("data-gesture", "swipe-down");
  await page.mouse.click(cx, cy);
  await page.waitForTimeout(200);
  await expect(prompt).toBeVisible();
  await swipeDown(page, cx, cy - 60);
  await expect(prompt).toBeHidden(step);

  // 3. Podwójny skok na wysoką platformę.
  await expect(prompt).toContainText("Liście na wysokiej platformie", step);
  await page.mouse.click(cx, cy);
  await expect(prompt).toContainText("podwójny skok", step);
  await page.mouse.click(cx, cy);
  await expect(prompt).toBeHidden(step);

  // 4. Szybowanie: palec trzymany do lądowania za dziurą.
  await expect(prompt).toContainText("szybowanie", step);
  await expect(prompt.locator(".sowie-gesture-demo")).toHaveAttribute("data-gesture", "hold");
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await expect.poll(async () => (await state(page)).owl.grounded).toBe(false);
  await expect.poll(async () => (await state(page)).owl.grounded, { timeout: 8000 }).toBe(true);
  await page.mouse.up();

  await expect(
    page.locator(".sowie-toast-chip", { hasText: "Świetnie! Teraz uciekaj przed Chmurą Pracu!" }),
  ).toBeVisible(step);
  expect(await page.evaluate(() => window.SowiaUcieczka.tutorial())).toBeNull();
  expect((await state(page)).hits).toBe(0);
  await page.evaluate(() => window.SowieCloud.flush());
  const doc = await readDoc(project, "sowiegry/profil/sowiegry_gry/runner");
  expect(doc.tutorialDone).toBe(true);

  // Kolejny bieg już bez samouczka.
  await page.evaluate(() => window.SowiaUcieczka.end());
  await page
    .getByRole("dialog", { name: /Koniec biegu/ })
    .getByRole("button", { name: "Jeszcze raz" })
    .click();
  expect(await page.evaluate(() => window.SowiaUcieczka.tutorial())).toBeNull();
  expect(errors).toEqual([]);
});

test("„Jak grać?” na ekranie tytułowym uruchamia samouczek od nowa", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-guide]").click();
  const guide = page.getByRole("dialog", { name: /Jak grać/ });
  await guide.getByRole("button", { name: "Zagraj samouczek" }).click();
  await expect(guide).toBeHidden();
  expect(await page.evaluate(() => window.SowiaUcieczka.screen())).toBe("playing");
  await expect(page.locator(".ucieczka-tutorial")).toContainText("krok 1 z 4");
  expect(errors).toEqual([]);
});

test("tryb diagnostyczny ?debug=1: panel z klatkami na sekundę, prędkością i bieżącym wzorem", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page, "/SowiaUcieczka/?seed=ucieczka-debug&debug=1");
  await page.locator("[data-start]").click();
  const panel = page.locator(".ucieczka-debug");
  await expect(panel).toContainText("kl./s");
  await expect(panel).toContainText(/wzór r0-/);
  await expect(panel).toContainText("biom Łąka");
  const box = await panel.boundingBox();
  const viewport = page.viewportSize();
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  expect(errors).toEqual([]);
});

test("misje garderoby: 1000 m w biegu kończy misję i odblokowuje Czapkę z daszkiem (jak w dawnym SowaRunner)", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  expect(await page.evaluate(() => window.SowieCloud.profile().missions.runner1000.done)).toBe(false);
  await page.locator("[data-start]").click();
  await page.waitForTimeout(300);
  await page.evaluate(() => window.SowiaUcieczka.warp(1100));
  await expect.poll(async () => (await state(page)).distance).toBeGreaterThan(1000);
  await page.evaluate(() => window.SowiaUcieczka.end());
  const results = page.getByRole("dialog", { name: /Koniec biegu/ });
  await expect(results).toContainText("Misja ukończona");
  await expect(results).toContainText("Nagroda: Czapka z daszkiem");
  const profile = await page.evaluate(() => window.SowieCloud.profile());
  expect(profile.missions.runner1000).toMatchObject({ progress: 1000, done: true });
  expect(profile.cosmetics.unlocked).toContain("cap");
  expect(errors).toEqual([]);
});
