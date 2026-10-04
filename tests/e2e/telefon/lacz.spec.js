// Łącz i Hoduj (nowa Sowia Szklarnia — prototyp, Analiza 3, E8 kroki 8.0–8.1) na telefonach: przeciąganie
// z uniesieniem nad palec i łączenie, zaznaczanie stuknięciem, Sowia doniczka, kompostownik (przeciągnięcie
// i przycisk), hybrydy i nowe łańcuchy w doniczce, pełna plansza, zapis w osobnym polu `preview` (emulator), plansza
// 7 × 9 z polami ≥ 44 px na najmniejszym telefonie i telefon poziomo (plansza obrócona do 9 × 7, przyciski z boku).
const { test, expect, waitForCloud, watchErrors } = require("../fixtures");
const { cloudUrl, readDoc, seedDoc, uniqueProject } = require("../emulator");

async function openGame(page, url = "/LaczIHoduj/") {
  await page.goto(url, { waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction(() => window.LaczIHoduj?.ready?.(), null, { timeout: 20_000 });
}

const cells = (page) => page.evaluate(() => window.LaczIHoduj.cells());
const game = (page, name, ...args) => page.evaluate(([call, rest]) => window.LaczIHoduj[call](...rest), [name, args]);

// Środek pola w układzie strony.
async function cellPoint(page, index) {
  const box = await page.locator("[data-canvas]").boundingBox();
  const center = await game(page, "cellCenter", index);
  return { x: box.x + center.x, y: box.y + center.y };
}

// Przeciągnięcie z pola `from` tak, żeby uniesiony nad palcem przedmiot spadł na pole `to`.
async function drag(page, from, to) {
  const start = await cellPoint(page, from);
  const end = await cellPoint(page, to);
  const lift = await game(page, "lift");
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 5, start.y + 12, { steps: 3 });
  await page.mouse.move(end.x, end.y + lift, { steps: 8 });
  await page.mouse.up();
}

test("Łącz i Hoduj: przeciągnięcie nasionka na nasionko — kiełek i liście; stuknięcia: zaznacz i połącz", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  await expect(page.getByRole("heading", { name: "Łącz i Hoduj" })).toBeVisible();
  // Dźwięk (uwaga L1): motyw szklarni zamówiony od razu (zagra po pierwszym dotknięciu).
  await expect.poll(() => game(page, "music"), { timeout: 10_000 }).toBe("szklarnia");
  // Płótno przylega do siatki (bez pustego szkła nad i pod półkami); plansza obrócona tylko na telefonie poziomo.
  const canvasBox = await page.locator("[data-canvas]").boundingBox();
  expect((await game(page, "cellCenter", 0)).y - (await game(page, "cellSize")) / 2).toBeLessThanOrEqual(24);
  expect(canvasBox.height).toBeLessThanOrEqual((await game(page, "cellCenter", 62)).y + 40);
  const viewport = page.viewportSize();
  expect(await game(page, "transposed")).toBe(viewport.width > viewport.height);
  const start = await cells(page);
  expect(start[30]).toEqual({ chain: "monstera", level: 1 });
  expect(start[31]).toEqual({ chain: "monstera", level: 1 });
  await drag(page, 30, 31);
  let board = await cells(page);
  expect(board[30]).toBeNull();
  expect(board[31]).toEqual({ chain: "monstera", level: 2 });
  await expect(page.locator("[data-hint]")).toHaveText("Kiełek!");
  await expect(page.locator("[data-leaves]")).toHaveText("1");
  // Stuknięcia: zaznaczenie kiełka na polu 38, potem pole 39 (też kiełek) — sadzonka.
  const a = await cellPoint(page, 38);
  const b = await cellPoint(page, 39);
  await page.mouse.click(a.x, a.y);
  expect(await game(page, "selected")).toBe(38);
  await expect(page.locator("[data-hint]")).toContainText("Kiełek — stuknij pole albo kompost");
  await page.mouse.click(b.x, b.y);
  board = await cells(page);
  expect(board[39]).toEqual({ chain: "monstera", level: 3 });
  expect(await game(page, "selected")).toBe(-1);
  await expect(page.locator("[data-leaves]")).toHaveText("4");
  // Przeciągnięcie na pole z inną rośliną — zamiana miejscami.
  await drag(page, 24, 39);
  board = await cells(page);
  expect(board[24]).toEqual({ chain: "monstera", level: 3 });
  expect(board[39]).toEqual({ chain: "monstera", level: 1 });
  expect(errors).toEqual([]);
});

test("Łącz i Hoduj: Sowia doniczka, kompostownik (przeciągnięcie i przycisk), pełne półki", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page);
  const before = (await cells(page)).filter(Boolean).length;
  await page.locator("[data-pot]").click();
  await expect(page.locator("[data-charges]")).toHaveText("11/12");
  expect((await cells(page)).filter(Boolean).length).toBe(before + 1);
  // Kompost przeciągnięciem: kiełek z pola 38 na przycisk kompostownika (podświetlony w trakcie).
  const from = await cellPoint(page, 38);
  const compost = await page.locator("[data-compost]").boundingBox();
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 4, from.y + 14, { steps: 3 });
  await page.mouse.move(compost.x + compost.width / 2, compost.y + compost.height / 2, { steps: 8 });
  await expect(page.locator("[data-compost]")).toHaveClass(/is-target/);
  await page.mouse.up();
  expect((await cells(page))[38]).toBeNull();
  await expect(page.locator("[data-compost]")).not.toHaveClass(/is-target/);
  await expect(page.locator("[data-hint]")).toHaveText("Kompost: Kiełek → +2 liści");
  // Kompost przyciskiem: zaznaczona roślina.
  const seedPoint = await cellPoint(page, 24);
  await page.mouse.click(seedPoint.x, seedPoint.y);
  await page.locator("[data-compost]").click();
  expect((await cells(page))[24]).toBeNull();
  // Pełne półki: doniczka podpowiada, a ładunek zostaje.
  await page.evaluate(() => {
    for (let index = 0; index < 63; index += 1) window.LaczIHoduj.place(index, 5);
  });
  await page.locator("[data-pot]").click();
  await expect(page.locator(".sowie-toast-chip", { hasText: "Brak miejsca na półkach" })).toBeVisible();
  await expect(page.locator("[data-charges]")).toHaveText("11/12");
  expect(errors).toEqual([]);
});

test("Łącz i Hoduj: dwa różne szczyty łańcuchów — hybryda; po 10 połączeniach Pilea w Sowiej doniczce", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  // Złota Monstera przeciągnięta na Złotą Pileę — hybryda Monpilea Przytulna (+60 liści).
  await game(page, "place", 0, 5, "monstera");
  await game(page, "place", 1, 5, "pilea");
  await drag(page, 0, 1);
  let board = await cells(page);
  expect(board[0]).toBeNull();
  expect(board[1]).toEqual({ chain: "monpilea", level: 1 });
  await expect(page.locator("[data-hint]")).toHaveText("Hybryda: Monpilea Przytulna!");
  await expect(page.locator("[data-leaves]")).toHaveText("60");
  await expect(page.getByText("Nowa hybryda: Monpilea Przytulna! +60 liści")).toBeVisible();
  expect((await game(page, "state")).stats.hybrids).toBe(1);
  // Hybryda nie łączy się z taką samą — zamiana miejscami.
  await game(page, "place", 2, 1, "monpilea");
  expect(await game(page, "move", 2, 1)).toBe("swap");
  // Kolejne połączenia (hak `move`): po 10. w doniczce pojawia się Pilea.
  for (let round = 0; round < 9; round += 1) {
    await game(page, "place", 2, 1);
    await game(page, "place", 3, 1);
    expect(await game(page, "move", 2, 3)).toBe("merge");
  }
  expect((await game(page, "state")).stats.merges).toBe(10);
  await expect(page.getByText("Nowa roślina w Sowiej doniczce: Pilea!")).toBeVisible({ timeout: 15_000 });
  expect(errors).toEqual([]);
});

test("Łącz i Hoduj: zapis w polu `preview` — dawna Szklarnia (pole `state`) bez zmian, plansza wraca po wejściu (emulator)", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  const old = JSON.stringify({ leaves: 1234, rooms: [{ id: "r1" }], plants: [] });
  await seedDoc(project, "sowiegry/profil/sowiegry_gry/szklarnia", { state: old, saveVersion: 1 });
  const errors = watchErrors(page);
  await openGame(page, cloudUrl("/LaczIHoduj/", project));
  await drag(page, 30, 31);
  await game(page, "save");
  await page.evaluate(() => window.SowieCloud.flush());
  const doc = await readDoc(project, "sowiegry/profil/sowiegry_gry/szklarnia");
  expect(doc.state).toBe(old);
  const saved = JSON.parse(doc.preview);
  expect(saved.version).toBe(2);
  expect(saved.cells[31]).toEqual({ chain: "monstera", level: 2 });
  expect(saved.stats.merges).toBe(1);

  const again = await page.context().newPage();
  await page.close();
  const errorsAgain = watchErrors(again);
  await openGame(again, cloudUrl("/LaczIHoduj/", project));
  expect((await again.evaluate(() => window.LaczIHoduj.cells()))[31]).toEqual({ chain: "monstera", level: 2 });
  await expect(again.locator("[data-leaves]")).toHaveText("1");
  expect(errors).toEqual([]);
  expect(errorsAgain).toEqual([]);
});

test.describe("Łącz i Hoduj — najmniejszy telefon (320 × 568)", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("plansza 7 × 9 cała na ekranie, pole ≥ 44 px, przyciski ≥ 44 px, bez przewijania w bok", async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page);
    expect(await game(page, "cellSize")).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const first = await cellPoint(page, 0);
    const last = await cellPoint(page, 62);
    const size = await game(page, "cellSize");
    expect(first.x - size / 2).toBeGreaterThanOrEqual(0);
    expect(last.x + size / 2).toBeLessThanOrEqual(320);
    expect(last.y + size / 2).toBeLessThanOrEqual(568);
    for (const selector of ["[data-pot]", "[data-compost]"]) {
      const box = await page.locator(selector).boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.y + box.height).toBeLessThanOrEqual(568);
    }
    expect(errors).toEqual([]);
  });
});

for (const [width, height] of [
  [844, 390],
  [667, 375],
]) {
  test.describe(`Łącz i Hoduj — telefon poziomo (${width} × ${height})`, () => {
    test.use({ viewport: { width, height } });

    test("plansza obrócona do 9 × 7 z polami ≥ 44 px, przyciski z boku, przeciąganie łączy", async ({ page }) => {
      const errors = watchErrors(page);
      await openGame(page);
      expect(await game(page, "transposed")).toBe(true);
      await expect(page.locator("[data-canvas]")).toHaveAttribute("aria-label", "Półki szklarni: 9 kolumn, 7 rzędów");
      const size = await game(page, "cellSize");
      expect(size).toBeGreaterThanOrEqual(44);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true);
      const canvas = await page.locator("[data-canvas]").boundingBox();
      for (const selector of ["[data-pot]", "[data-compost]"]) {
        const box = await page.locator(selector).boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(canvas.x + canvas.width);
        expect(box.y + box.height).toBeLessThanOrEqual(height);
      }
      // Pole 30 i 31 (dwa nasionka) leżą w obróconej planszy jedno pod drugim — przeciągnięcie je łączy.
      const first = await cellPoint(page, 30);
      const second = await cellPoint(page, 31);
      expect(Math.abs(first.x - second.x)).toBeLessThan(1);
      expect(second.y).toBeGreaterThan(first.y);
      await drag(page, 30, 31);
      const board = await cells(page);
      expect(board[30]).toBeNull();
      expect(board[31]).toEqual({ chain: "monstera", level: 2 });
      expect(errors).toEqual([]);
    });
  });
}
