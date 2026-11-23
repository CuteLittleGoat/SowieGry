// Sowie Trójki (Analiza 5; od M5 w menu i z zapisem) na telefonach: mapa 45 poziomów, karta startu i „Nowość”, zamiana przesunięciem
// palca i dwoma stuknięciami, zła zamiana bez utraty ruchu, combo z Tęczowym Liściem i radość Sówki, Sowia pomoc bez
// kosztu ruchu, wygrana z Humbaczym Finałem i gwiazdkami, prezent Sówki i „Spróbuj jeszcze raz” od razu (bez żyć),
// Tryb Przytulny włączony w pauzie, układ ekranu (pole ≥ 34 px, Sówka i „Sowia pomoc” w oknie), licznik ?perf=1.
// Zapis (od M5): stan gry w dokumencie `trojki`, podsumowanie w profilu, po ponownym otwarciu postęp jest (emulator).
const { test, expect, swipe, waitForCloud, watchErrors } = require("../fixtures");
const { cloudUrl, readDoc, seedDoc, uniqueProject } = require("../emulator");

// Plansza 8 × 8 bez gotowych trójek (rodzaje: 1 Liść Monstery, 2 Złoty Liść, 3 Humbak, 4 Kózka, 5 Truskawka,
// 6 Storczyk). Zamiana pól 0 ↔ 1 (lewy górny róg) niczego nie układa.
const BASE = ["34563456", "56345634", "34563456", "56345634", "34563456", "56345634", "34563456", "56345634"];
// Zamiana 50 ↔ 58 (pionowo, 3. kolumna) układa pięć Liści w dolnym rzędzie → Tęczowy Liść.
const RAINBOW = [...BASE.slice(0, 6), "34163456", "11211634"];
// Zamiana 58 ↔ 59 (poziomo, dolny rząd) układa trzy Złote Liście — bez Liści Monstery (cel poziomu 1).
const THREE_GOLD = [...BASE.slice(0, 7), "22625634"];

async function openGame(page, testInfo, extra = "") {
  const project = uniqueProject(testInfo);
  await page.goto(cloudUrl("/SowieTrojki/", project, extra), { waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction(() => window.SowieTrojki?.ready?.(), null, { timeout: 20_000 });
  return project;
}

const state = (page) => page.evaluate(() => window.SowieTrojki.state());
const owl = (page) => page.evaluate(() => window.SowieTrojki.owl());
const quiet = (page) => page.waitForFunction(() => !window.SowieTrojki.busy(), null, { timeout: 20_000 });

// Poziom od razu (bez karty startu i „Nowości”), po wczytaniu obrazków i po powitaniu Sówki (macha 1,4 s —
// słabsze reakcje nie przerywają ważniejszej, więc testy reakcji czekają na spokój).
async function startLevel(page, id, layout = null) {
  await page.evaluate((level) => window.SowieTrojki.start(level), id);
  await page.waitForFunction(() => window.SowieTrojki.screen() === "game" && window.SowieTrojki.atlasReady(), null, {
    timeout: 20_000,
  });
  if (layout) await page.evaluate((rows) => window.SowieTrojki.setLayout(rows), layout);
  await expect.poll(async () => (await owl(page)).current, { timeout: 5_000 }).toBeNull();
}

// Środek pola planszy w oknie (px).
async function cellPoint(page, cell) {
  const box = await page.locator("[data-board]").boundingBox();
  const center = await page.evaluate((at) => window.SowieTrojki.cellCenter(at), cell);
  return { x: box.x + center.x, y: box.y + center.y };
}

async function swipeCells(page, a, b) {
  await swipe(page, await cellPoint(page, a), await cellPoint(page, b));
}

async function tapCell(page, cell) {
  const point = await cellPoint(page, cell);
  await page.mouse.click(point.x, point.y);
}

test("Sowie Trójki: mapa 45 poziomów (otwarty pierwszy), karta startu, „Nowość” i ruch przesunięciem palca", async ({
  page,
}, testInfo) => {
  const errors = watchErrors(page);
  await openGame(page, testInfo);
  await expect(page.getByRole("heading", { name: "Sowie Trójki" })).toBeVisible();
  await expect(page.locator("[data-preview]")).toBeHidden();
  expect(await page.evaluate(() => window.SowieTrojki.preview())).toBe(false);
  // Nowy gracz: otwarty tylko poziom 1 (pozostałe z kłódką); na mapie „Menu”, bez pauzy.
  await expect(page.locator(".trojki-level")).toHaveCount(45);
  await expect(page.locator(".trojki-level:disabled")).toHaveCount(44);
  await expect(page.locator("[data-menu-link]")).toBeVisible();
  await expect(page.locator(".trojki-pause")).toBeHidden();
  await expect(page.locator(".sowie-perf-meter")).toHaveCount(0);

  await page.locator(".trojki-level").first().click();
  const card = page.getByRole("dialog");
  await expect(card).toContainText("Poziom 1");
  await expect(card).toContainText("Zbierz 25 Liści Monstery");
  await card.getByRole("button", { name: "Graj" }).click();
  // „Nowość” przed pierwszym poziomem: jak zamieniać kafelki.
  await page.getByRole("dialog").getByRole("button", { name: "Rozumiem" }).click();
  await expect(page.locator("[data-level-title]")).toHaveText("Poziom 1");
  await expect(page.locator("[data-to-map]")).toBeVisible();
  await expect(page.locator("[data-menu-link]")).toBeHidden();
  await expect(page.locator(".trojki-pause")).toBeVisible();
  await expect(page.locator("[data-hand]")).toBeVisible();
  await page.waitForFunction(() => window.SowieTrojki.atlasReady(), null, { timeout: 20_000 });
  await expect.poll(async () => (await owl(page)).current, { timeout: 5_000 }).toBeNull();

  const before = await state(page);
  await expect(page.locator("[data-moves]")).toHaveText(String(before.moves));
  const hint = await page.evaluate(() => window.SowieTrojki.hint());
  expect(hint.type).toBe("swap");
  await swipeCells(page, hint.a, hint.b);
  await expect.poll(async () => (await state(page)).moves).toBe(before.moves - 1);
  await quiet(page);
  const after = await state(page);
  expect(after.score).toBeGreaterThan(0);
  expect(after.stats.matches).toBeGreaterThan(0);
  await expect(page.locator("[data-moves]")).toHaveText(String(before.moves - 1));
  await expect(page.locator("[data-hand]")).toBeHidden();
  // Każda trójka cieszy Sówkę (podskok albo więcej).
  expect(["hop", "wings", "double", "salto", "fly", "lean", "thumbs"]).toContain((await owl(page)).last.reaction);

  // „Mapa” wraca do poziomów.
  await page.locator("[data-to-map]").click();
  await expect(page.locator("[data-map-screen]")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sowie Trójki" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("Sowie Trójki: zła zamiana nie zabiera ruchu, dwa stuknięcia zamieniają, pięć w rzędzie — Tęczowy Liść i salto Sówki", async ({
  page,
}, testInfo) => {
  const errors = watchErrors(page);
  await openGame(page, testInfo);
  await startLevel(page, 1, RAINBOW);
  const moves = (await state(page)).moves;

  await swipeCells(page, 0, 1);
  await expect.poll(async () => (await state(page)).stats.invalid).toBe(1);
  await quiet(page);
  expect((await state(page)).moves).toBe(moves);
  expect((await owl(page)).last.reaction).toBe("tilt");
  await expect.poll(async () => (await owl(page)).current, { timeout: 5_000 }).toBeNull();

  await tapCell(page, 50);
  await tapCell(page, 58);
  await expect.poll(async () => (await state(page)).moves).toBe(moves - 1);
  await quiet(page);
  const after = await state(page);
  expect(after.stats.created.teczowy).toBeGreaterThanOrEqual(1);
  const reaction = (await owl(page)).last;
  expect(reaction.level).toBeGreaterThanOrEqual(4);
  expect(["salto", "fly"]).toContain(reaction.reaction);
  expect(after.joy).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("Sowie Trójki: Sowia pomoc przy pełnej Radości zrzuca Pióra, a ruch nie przepada", async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await openGame(page, testInfo);
  await startLevel(page, 3);
  await expect(page.locator("[data-help]")).toBeDisabled();
  await page.evaluate(() => window.SowieTrojki.setJoy(100));
  await expect(page.locator("[data-help]")).toBeEnabled();
  await expect(page.locator("[data-trojki]")).toHaveClass(/is-help-ready/);
  const before = await state(page);
  await page.locator("[data-help]").click();
  await expect.poll(async () => (await state(page)).stats.helps).toBe(1);
  await quiet(page);
  const after = await state(page);
  expect(after.moves).toBe(before.moves);
  expect(after.joy).toBeLessThan(100);
  expect(after.stats.fired).toBeGreaterThanOrEqual(3);
  expect((await owl(page)).last.reaction).toMatch(/fly|wings/);
  await expect(page.locator("[data-help]")).toBeDisabled();
  expect(errors).toEqual([]);
});

test("Sowie Trójki: wygrana — Humbaczy Finał, gwiazdki, „Dalej”; postęp zapisany w chmurze i po ponownym otwarciu", async ({
  page,
}, testInfo) => {
  const errors = watchErrors(page);
  const project = await openGame(page, testInfo);
  await startLevel(page, 1, THREE_GOLD);
  await page.evaluate(() => {
    window.SowieTrojki.setGoalDone(0, 25);
    window.SowieTrojki.setMoves(3);
  });
  await swipeCells(page, 58, 59);
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText(/Brawo!|Trzy gwiazdki!/, { timeout: 20_000 });
  const result = await state(page);
  expect(result.phase).toBe("won");
  expect(result.stars).toBeGreaterThanOrEqual(1);
  // Finał: pozostałe ruchy zamieniły się w Pióra (ruchów już nie ma).
  expect(result.moves).toBe(0);
  expect((await owl(page)).last.reaction).toBe("dance");
  const progress = await page.evaluate(() => window.SowieTrojki.progress());
  expect(progress.levels["1"]).toMatchObject({ wins: 1, tries: 1, stars: result.stars });
  expect(progress.unlocked).toBe(2);

  await dialog.getByRole("button", { name: "Dalej" }).click();
  await expect(page.getByRole("dialog")).toContainText("Poziom 2");
  // Zapis w chmurze (od M5): stan gry w dokumencie `trojki`, podsumowanie w profilu (karta w menu i „Rekordy”).
  await page.evaluate(() => window.SowieCloud.flush());
  const doc = await readDoc(project, "sowiegry/profil/sowiegry_gry/trojki");
  const saved = JSON.parse(doc.state);
  expect(saved.levels["1"].stars).toBe(result.stars);
  expect(saved.unlocked).toBe(2);
  expect(doc.saveVersion).toBe(1);
  const profile = await readDoc(project, "sowiegry/profil");
  expect(profile.records.trojki).toMatchObject({ level: 1, stars: result.stars });
  // Ponowne otwarcie: poziom 2 otwarty, przy poziomie 1 zdobyte gwiazdki.
  await page.reload({ waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction(() => window.SowieTrojki?.ready?.(), null, { timeout: 20_000 });
  await expect(page.locator(".trojki-level:disabled")).toHaveCount(43);
  await expect(page.locator('[data-level="1"]')).toHaveClass(/is-done/);
  expect((await page.evaluate(() => window.SowieTrojki.progress())).levels["1"].stars).toBe(result.stars);
  expect(errors).toEqual([]);
});

test("Sowie Trójki w Sowiej Akademii i Galerii: wejście kończy „Pierwsze kroki”, wygrana trafia do metryk (emulator)", async ({
  page,
}, testInfo) => {
  const errors = watchErrors(page);
  // Profil zapisany wcześniej (emulator): wizyty w pięciu pozostałych grach — do „Pierwszych kroków” i zdjęcia 26
  // brakuje tylko Sowich Trójek.
  const project = uniqueProject(testInfo);
  await seedDoc(project, "sowiegry/profil", {
    schemaVersion: 1,
    academy: {
      version: 2,
      xp: 0,
      feathers: 0,
      metrics: { runnerVisits: 1, jumperVisits: 1, sowa3Visits: 1, ogrodyVisits: 1, szklarniaVisits: 1 },
      achievements: {},
      daily: null,
      weekly: null,
      awards: {},
    },
  });
  await page.goto(cloudUrl("/SowieTrojki/", project), { waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction(() => window.SowieTrojki?.ready?.(), null, { timeout: 20_000 });
  // Akademia działa na stronie gry (<body data-sowie-game="trojki">), komunikaty pokazuje gra.
  await expect(page.locator(".sowie-toast-chip", { hasText: "Osiągnięcie: Pierwsze kroki" })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator(".sowie-toast-chip", { hasText: "Nowa fotografia w Galerii Sów!" })).toBeVisible();

  // Wygrana poziomu 1 → metryki Trójek; komunikaty są nad oknem wyniku (arkusz od dołu).
  await startLevel(page, 1, THREE_GOLD);
  await page.evaluate(() => {
    window.SowieTrojki.setGoalDone(0, 25);
    window.SowieTrojki.setMoves(3);
  });
  await swipeCells(page, 58, 59);
  await expect(page.getByRole("dialog")).toContainText(/Brawo!|Trzy gwiazdki!/, { timeout: 20_000 });
  const toastLayer = await page.evaluate(() => {
    const style = getComputedStyle(document.querySelector(".trojki .sowie-toasts"));
    const backdrop = getComputedStyle(document.querySelector(".sowie-ui-backdrop"));
    return { position: style.position, toasts: Number(style.zIndex), backdrop: Number(backdrop.zIndex) };
  });
  expect(toastLayer.position).toBe("fixed");
  expect(toastLayer.toasts).toBeGreaterThan(toastLayer.backdrop);
  const { stars } = await state(page);

  await page.evaluate(() => window.SowieCloud.flush());
  const profile = await readDoc(project, "sowiegry/profil");
  expect(profile.academy.metrics).toMatchObject({
    trojkiVisits: 1,
    trojkiWins: 1,
    trojkiLevels: 1,
    trojkiStars: stars,
  });
  expect(profile.academy.achievements["pierwsze-kroki"]).toBeTruthy();
  expect(profile.gallery.unlocked).toContain("owl-26");
  expect(errors).toEqual([]);
});

test("Sowie Trójki: przy ¾ celu Sówka daje 3 ruchy, potem przegrana i „Spróbuj jeszcze raz” od razu", async ({
  page,
}, testInfo) => {
  const errors = watchErrors(page);
  await openGame(page, testInfo);
  await startLevel(page, 1, THREE_GOLD);
  const moves = (await state(page)).moves;
  await page.evaluate(() => {
    window.SowieTrojki.setGoalDone(0, 19);
    window.SowieTrojki.setMoves(1);
  });
  await swipeCells(page, 58, 59);
  await expect.poll(async () => (await state(page)).giftUsed).toBe(true);
  await quiet(page);
  expect(await state(page)).toMatchObject({ phase: "play", moves: 3 });
  await expect(page.locator("[data-moves]")).toHaveText("3");
  expect((await owl(page)).last.reaction).toBe("gift");

  await page.evaluate((rows) => {
    window.SowieTrojki.setLayout(rows);
    window.SowieTrojki.setMoves(1);
  }, THREE_GOLD);
  await swipeCells(page, 58, 59);
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Ojej, zabrakło ruchów", { timeout: 20_000 });
  await expect(dialog).toContainText("Brakowało");
  expect((await state(page)).phase).toBe("lost");
  expect((await owl(page)).last.reaction).toBe("sad");

  await dialog.getByRole("button", { name: "Spróbuj jeszcze raz" }).click();
  await expect.poll(async () => (await state(page)).phase).toBe("play");
  expect(await state(page)).toMatchObject({ moves, giftUsed: false });
  const progress = await page.evaluate(() => window.SowieTrojki.progress());
  expect(progress.levels["1"]).toMatchObject({ wins: 0, tries: 1 });
  expect(errors).toEqual([]);
});

test("Sowie Trójki: Tryb Przytulny włączony w pauzie działa od razu — zamiast przegranej 5 ruchów", async ({
  page,
}, testInfo) => {
  const errors = watchErrors(page);
  await openGame(page, testInfo);
  await startLevel(page, 1, THREE_GOLD);
  await page.locator(".trojki-pause").click();
  const pause = page.locator(".sowie-ui-pause");
  await pause.getByRole("button", { name: "Ustawienia" }).click();
  const cozy = pause.locator('[data-setting="cozy"]');
  await cozy.click();
  await expect(cozy).toHaveAttribute("aria-pressed", "true");
  await pause.getByRole("button", { name: "Gotowe" }).click();
  await pause.getByRole("button", { name: "Wznów" }).click();
  await expect(pause).toBeHidden();

  await page.evaluate(() => {
    window.SowieTrojki.setGoalDone(0, 0);
    window.SowieTrojki.setMoves(1);
  });
  await tapCell(page, 58);
  await tapCell(page, 59);
  await expect.poll(async () => (await state(page)).moves, { timeout: 10_000 }).toBe(5);
  await quiet(page);
  expect((await state(page)).phase).toBe("play");
  expect((await owl(page)).last.reaction).toBe("gift");
  expect(errors).toEqual([]);
});

test("Sowie Trójki: układ ekranu — pole ≥ 34 px, Sówka i „Sowia pomoc” w oknie, poziomo Sówka z lewej i cele z prawej", async ({
  page,
}, testInfo) => {
  const errors = watchErrors(page);
  await openGame(page, testInfo);
  await startLevel(page, 7);
  expect(await page.evaluate(() => window.SowieTrojki.cellSize())).toBeGreaterThanOrEqual(34);
  const viewport = page.viewportSize();
  const box = async (selector) => page.locator(selector).boundingBox();
  const board = await box("[data-board]");
  const owlBox = await box("[data-owl]");
  const help = await box("[data-help]");
  const bar = await box(".trojki-bar");
  expect(owlBox.height).toBeGreaterThan(60);
  expect(help.y + help.height).toBeLessThanOrEqual(viewport.height + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1)).toBe(true);
  if (viewport.width > viewport.height) {
    expect(owlBox.x + owlBox.width).toBeLessThanOrEqual(board.x + 1);
    expect(bar.x).toBeGreaterThanOrEqual(board.x + board.width - 1);
  } else {
    expect(bar.y + bar.height).toBeLessThanOrEqual(board.y + 1);
    expect(owlBox.y).toBeGreaterThanOrEqual(board.y + board.height - 1);
  }
  expect(errors).toEqual([]);
});

test("Sowie Trójki: licznik ?perf=1 pokazuje klatki i ostrość planszy", async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await openGame(page, testInfo, "&perf=1");
  await startLevel(page, 2);
  await expect(page.locator(".sowie-perf-meter")).toContainText("ostrość");
  const quality = await page.evaluate(() => window.SowieTrojki.quality());
  expect(quality.canvasWidth).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
