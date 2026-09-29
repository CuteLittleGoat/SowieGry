// Sowie Tory (wersja podglądowa nowej Sowa3, Analiza 3, E5) na telefonach: start, przesunięcia palcem (tor, skok,
// ślizg), stuknięcia przy bokach, klawiatura, pauza, koniec biegu z wynikami i zapis rekordu „sowa3” w chmurze.
const { test, expect, swipe: swipeFrom, waitForCloud, watchErrors } = require("../fixtures");
const { cloudUrl, readDoc, uniqueProject } = require("../emulator");

async function openGame(page, url = "/SowieTory/?seed=tory-e2e") {
  await page.goto(url, { waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction(() => window.SowieTory?.ready?.() && window.SowieTory.atlasReady(), null, {
    timeout: 20_000,
  });
}

const state = (page) => page.evaluate(() => window.SowieTory.state());

// Szybkie przesunięcie palcem (≥ 24 px w < 200 ms) ze środka planszy.
async function swipe(page, dx, dy) {
  const box = await page.locator("[data-stage]").boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height * 0.55;
  await swipeFrom(page, { x, y }, { x: x + dx, y: y + dy });
}

test("Sowie Tory: przesunięcia zmieniają tor, w górę — skok, w dół — ślizg; stuknięcia przy bokach i klawiatura", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  await expect(page.getByRole("heading", { name: "Sowie Tory" })).toBeVisible();
  await expect(page.locator("[data-preview]")).toContainText("Wersja podglądowa");
  await page.locator("[data-start]").click();
  await expect(page.locator("[data-title]")).toBeHidden();
  expect(await page.evaluate(() => window.SowieTory.screen())).toBe("playing");
  await expect(page.locator(".tory-progress")).toContainText("1/4 · Biedronka");

  await swipe(page, -90, 0);
  await expect.poll(async () => (await state(page)).owl.lane).toBe(-1);
  await swipe(page, 90, 0);
  await swipe(page, 90, 0);
  await expect.poll(async () => (await state(page)).owl.lane).toBe(1);
  await swipe(page, 0, -90);
  await expect.poll(async () => (await state(page)).owl.y).toBeGreaterThan(0.2);
  await expect.poll(async () => (await state(page)).owl.grounded).toBe(true);
  await swipe(page, 0, 90);
  await expect.poll(async () => (await state(page)).owl.slide).toBeGreaterThan(0);

  // Stuknięcie w lewej części ekranu — tor w lewo; klawiatura: ← / →.
  const box = await page.locator("[data-stage]").boundingBox();
  await page.mouse.click(box.x + box.width * 0.2, box.y + box.height * 0.55);
  await expect.poll(async () => (await state(page)).owl.lane).toBe(0);
  await page.keyboard.press("ArrowLeft");
  await expect.poll(async () => (await state(page)).owl.lane).toBe(-1);
  await page.keyboard.press("ArrowRight");
  await expect.poll(async () => (await state(page)).owl.lane).toBe(0);

  const before = (await state(page)).stageDistance;
  await page.waitForTimeout(1500);
  const after = await state(page);
  expect(after.stageDistance).toBeGreaterThan(before + 10);
  expect(after.speed).toBeGreaterThan(12);
  expect(errors).toEqual([]);
});

test("Sowie Tory: pauza z HUD i wznowienie przez odliczanie", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-start]").click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Pauza" }).click();
  const menu = page.getByRole("dialog", { name: "Pauza" });
  await expect(menu).toBeVisible();
  const frozen = (await state(page)).stageDistance;
  await page.waitForTimeout(500);
  expect((await state(page)).stageDistance).toBe(frozen);
  await menu.getByRole("button", { name: "Wznów" }).click();
  await expect(page.locator(".sowie-countdown")).toHaveText("3");
  await expect.poll(async () => (await state(page)).stageDistance, { timeout: 8000 }).toBeGreaterThan(frozen + 5);
  expect(errors).toEqual([]);
});

test("Sowie Tory: koniec biegu — wyniki z planszami i rekord „sowa3” zapisany w profilu (emulator)", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await openGame(page, cloudUrl("/SowieTory/", project));
  await page.locator("[data-start]").click();
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.SowieTory.end());
  const results = page.getByRole("dialog", { name: /Koniec biegu/ });
  await expect(results).toBeVisible();
  await expect(results).toContainText("Nowy rekord!");
  await expect(results).toContainText("Plansze");
  await expect(results).toContainText("0 / 4");
  const recorded = await page.evaluate(() => window.SowieCloud.records("sowa3", "arcade"));
  expect(recorded.bestScore).toBeGreaterThan(0);
  await page.evaluate(() => window.SowieCloud.flush());
  const profile = await readDoc(project, "sowiegry/profil");
  expect(profile.records.sowa3.arcade.bestScore).toBe(recorded.bestScore);
  await results.getByRole("button", { name: "Jeszcze raz" }).click();
  await expect(results).toBeHidden();
  expect((await state(page)).stageDistance).toBeLessThan(15);
  expect(errors).toEqual([]);
});

test("Sowie Tory: plansze w kolejności z obecnej gry, na blokowisku PRL szarżujący dzik ze strzałką (?plansza=)", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page, "/SowieTory/?seed=tory-plansze&plansza=4");
  await page.locator("[data-start]").click();
  await expect(page.locator(".tory-progress")).toContainText("4/4 · Stacja Amic");
  expect((await state(page)).stageIndex).toBe(3);

  await openGame(page, "/SowieTory/?seed=tory-dziki&plansza=3");
  await page.locator('[data-level="chill"]').click();
  await page.locator("[data-start]").click();
  await expect(page.locator(".tory-progress")).toContainText("3/4 · Blokowisko PRL");
  // Przeskok tuż przed pierwszą szarżą: strzałka i podpowiedź, potem dzik biegnie torem sowy.
  await page.evaluate(() => window.SowieTory.warp(125));
  await expect(page.locator(".sowie-toast-chip", { hasText: "Dzik szarżuje!" })).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(async () => (await state(page)).boars.some((item) => item.phase === "charge"), { timeout: 5000 })
    .toBe(true);
  expect(errors).toEqual([]);
});

test("Sowie Tory: meta → finał z basenem → Humbacze Tory → podsumowanie z gwiazdkami → plansza 2 (emulator)", async ({
  page,
}, testInfo) => {
  // Rejs humbaka trwa 20 s w czasie rzeczywistym — dłuższy limit testu (WebKit w CI).
  test.setTimeout(120_000);
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await openGame(page, cloudUrl("/SowieTory/", project));
  await page.locator("[data-start]").click();
  await page.evaluate(() => window.SowieTory.warp(1200));
  await expect.poll(async () => (await state(page)).phase).toBe("finale");
  expect((await state(page)).finishSeen).toBe(false);

  // Pierwszy finał: stuknięcie go nie skraca.
  const box = await page.locator("[data-stage]").boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.55);
  expect((await state(page)).phase).toBe("finale");
  await expect.poll(async () => (await state(page)).phase, { timeout: 15_000 }).toBe("whale");
  await expect(page.locator(".sowie-toast-chip", { hasText: "Humbacze Tory!" })).toBeVisible();
  await expect(page.locator(".tory-progress")).toContainText("Humbacze Tory · 0:");
  await page.evaluate(() => window.SowieCloud.flush());
  expect((await readDoc(project, "sowiegry/profil/sowiegry_gry/sowa3")).finishSeen).toBe(true);

  // Rejs: w prawo — tor humbaka, w górę — wyskok.
  await swipe(page, 90, 0);
  await expect.poll(async () => (await state(page)).ride.lane).toBe(1);
  await swipe(page, 0, -90);
  await expect.poll(async () => (await state(page)).ride.airborne).toBe(true);

  const summary = page.getByRole("dialog", { name: /1\/4 · Biedronka — ukończona!/ });
  await expect(summary).toBeVisible({ timeout: 40_000 });
  await expect(summary).toContainText("Plansza ukończona");
  await expect(summary).toContainText("Liście z Humbaczych Torów");
  const stars = Number(await summary.locator("[data-stars]").getAttribute("data-stars"));
  expect(stars).toBeGreaterThanOrEqual(1);
  await summary.getByRole("button", { name: "Dalej" }).click();
  await expect(summary).toBeHidden();
  await expect(page.locator(".tory-progress")).toContainText("2/4 · Festiwal");
  expect((await state(page)).phase).toBe("run");
  await page.evaluate(() => window.SowieCloud.flush());
  expect((await readDoc(project, "sowiegry/profil/sowiegry_gry/sowa3")).stars.biedronka).toBe(stars);

  // Drugi finał: już obejrzany — stuknięcie przechodzi od razu do rejsu.
  await page.evaluate(() => window.SowieTory.warp(1200));
  await expect.poll(async () => (await state(page)).phase).toBe("finale");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.55);
  await expect.poll(async () => (await state(page)).phase, { timeout: 2000 }).toBe("whale");
  expect(errors).toEqual([]);
});

test.describe("Sowie Tory — najmniejszy telefon (320 × 568)", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("karta tytułowa i HUD mieszczą się bez przewijania w bok", async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);
    const card = await page.locator(".tory-title-card").boundingBox();
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.x + card.width).toBeLessThanOrEqual(320);
    await page.locator("[data-start]").click();
    const progress = await page.locator(".tory-progress").boundingBox();
    const pause = await page.getByRole("button", { name: "Pauza" }).boundingBox();
    expect(progress.y).toBeGreaterThanOrEqual(pause.y + pause.height - 4);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});
