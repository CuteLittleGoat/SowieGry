// Łącz i Hoduj (gra „szklarnia”, od E8e zamiast Sowiej Szklarni; Analiza 3, E8) na telefonach: przeciąganie
// z uniesieniem nad palec i łączenie, zaznaczanie stuknięciem, Sowia doniczka, kompostownik (przeciągnięcie
// i przycisk), hybrydy i nowe łańcuchy w doniczce, zamówienia sąsiadek (stuknięcie karty, przeciągnięcie rośliny na
// kartę), odnawianie pomieszczeń szklarni (okno z portfela), przeszkody Pracu i Amic, kózki-wzmacniacze, Basen
// Humbaka, pełna plansza, zapis w polu `state` (wersja 2) z pakietem startowym z dawnej Szklarni i przeniesieniem zapisu
// z czasu podglądu (`preview`, emulator), plansza 7 × 9 z polami ≥ 44 px na najmniejszym
// telefonie i telefon poziomo (plansza obrócona do 9 × 7, przyciski z boku).
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
  // Ładowanie doniczki wstrzymane — ładunek nie wraca w trakcie wolnego testu.
  await game(page, "hold", true);
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

// Przeciągnięcie rośliny z pola `from` na kartę zamówienia `slot` (cel — punkt palca nad kartą).
async function dragToOrder(page, from, slot) {
  const start = await cellPoint(page, from);
  const box = await page.locator(`[data-order="${slot}"]`).boundingBox();
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 5, start.y - 12, { steps: 3 });
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
  await expect(page.locator(`[data-order="${slot}"]`)).toHaveClass(/is-target/);
  await page.mouse.up();
}

test("Łącz i Hoduj: zamówienia sąsiadek — stuknięcie gotowej karty, podpowiedź, przeciągnięcie rośliny na kartę", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  const orders = page.locator("[data-order]");
  await expect(orders).toHaveCount(3);
  for (let slot = 0; slot < 3; slot += 1) {
    const box = await orders.nth(slot).boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  }
  expect((await game(page, "orders")).map((order) => order.neighbor)).toEqual(["puszczyk", "plomykowka", "pojdzka"]);
  // Gotowe zamówienie (na starcie są dwa kiełki): ✓ na karcie, stuknięcie oddaje kiełek za liście i gwiazdkę.
  await game(page, "setOrder", 0, "monstera", 2, 1);
  await expect(orders.nth(0)).toHaveClass(/is-ready/);
  await expect(orders.nth(0)).toHaveAttribute("aria-label", /Pani Puszczykowa prosi: Kiełek .*stuknij, żeby oddać/);
  await orders.nth(0).click();
  let board = await cells(page);
  expect(board[38]).toBeNull();
  expect(board[39]).toEqual({ chain: "monstera", level: 2 });
  await expect(page.locator("[data-hint]")).toHaveText("Pani Puszczykowa dziękuje! +4 liści, +1 ⭐");
  await expect(page.getByText("Pani Puszczykowa dziękuje za Kiełek! +4 liści · +1 ⭐")).toBeVisible();
  await expect(page.locator("[data-leaves]")).toHaveText("4");
  await expect(page.locator("[data-stars]")).toHaveText("1");
  let state = await game(page, "state");
  expect(state.stats.orders).toBe(1);
  expect(state.orders[0].neighbor).toBe("puszczyk");
  // Zamówienie bez roślin na półkach: podpowiedź, czego chce sąsiadka.
  await game(page, "setOrder", 1, "pilea", 4, 1);
  await expect(orders.nth(1)).not.toHaveClass(/is-ready/);
  await orders.nth(1).click();
  await expect(page.locator("[data-hint]")).toHaveText("Płomykówka Pola prosi: Pilea");
  // Przeciągnięcie nasionka na kartę zamówienia nasionek: oddaje właśnie przeciągnięte.
  await game(page, "setOrder", 2, "monstera", 1, 1);
  await dragToOrder(page, 31, 2);
  board = await cells(page);
  // Pole 31 jest wolne po oddaniu nasionka — drugie zamówienie przywołuje kózkę (GOAT_RULES.orderAt), która
  // może wskoczyć na losowe wolne pole, także to; nasionka już na nim nie ma.
  expect(board[31]?.chain ?? null).toBeNull();
  expect(board[30]).toEqual({ chain: "monstera", level: 1 });
  await expect(page.locator("[data-stars]")).toHaveText("2");
  // Roślina, której sąsiadka nie chce — zostaje na półce.
  await dragToOrder(page, 30, 1);
  await expect(page.locator("[data-hint]")).toHaveText("Płomykówka Pola prosi: Pilea, nie Nasionko");
  expect((await cells(page))[30]).toEqual({ chain: "monstera", level: 1 });
  state = await game(page, "state");
  expect(state.stats.orders).toBe(2);
  expect(errors).toEqual([]);
});

test("Łącz i Hoduj: samouczek — kroki z akcją zaliczają się same, „Dalej” i pominięcie; powtórzenie i „Jak grać?” z okna pomieszczeń", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  const bubble = page.locator("[data-tutorial]");
  await expect(bubble).toBeVisible();
  await expect(bubble).toContainText("Samouczek · krok 1 z 5");
  await expect(bubble).toContainText("Przeciągnij nasionko na takie samo");
  await drag(page, 30, 31);
  await expect(bubble).toContainText("krok 2 z 5");
  await page.locator("[data-pot]").click();
  await expect(bubble).toContainText("krok 3 z 5");
  // Krok zamówienia: stuknięcie gotowej karty (kiełki są na półkach).
  await game(page, "setOrder", 0, "monstera", 2, 1);
  await page.locator('[data-order="0"]').click();
  await expect(bubble).toContainText("krok 4 z 5");
  await bubble.getByRole("button", { name: "Dalej" }).click();
  await expect(bubble).toContainText("krok 5 z 5");
  await bubble.getByRole("button", { name: "Dalej" }).click();
  await expect(bubble).toBeHidden();
  await expect(page.getByText("Świetnie! Szklarnia jest Twoja — miłego łączenia!")).toBeVisible();
  expect((await game(page, "state")).tutorialDone).toBe(true);
  // Powtórzenie z okna pomieszczeń, potem pominięcie (✕).
  await page.locator("[data-rooms]").click();
  await page
    .getByRole("dialog", { name: "Pomieszczenia szklarni" })
    .getByRole("button", { name: "Powtórz samouczek" })
    .click();
  await expect(bubble).toContainText("krok 1 z 5");
  await bubble.getByRole("button", { name: "Pomiń samouczek" }).click();
  await expect(bubble).toBeHidden();
  // „Jak grać?” — przewodnik Łącz i Hoduj z kartami.
  await page.locator("[data-rooms]").click();
  await page.getByRole("dialog", { name: "Pomieszczenia szklarni" }).getByRole("button", { name: "Jak grać?" }).click();
  const guide = page.getByRole("dialog", { name: "Jak grać — Łącz i Hoduj" });
  await expect(guide).toBeVisible();
  await expect(guide.locator(".sowie-guide-card")).toHaveCount(7);
  await expect(guide).toContainText("Basen Humbaka");
  await guide.locator("[data-modal-actions]").getByRole("button", { name: "Zamknij" }).click();
  await expect(guide).toBeHidden();
  expect(errors).toEqual([]);
});

test("Łącz i Hoduj: odnawianie pomieszczeń — okno z portfela, etapy za gwiazdki, Doniczarnia powiększa doniczkę", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  const wallet = page.locator("[data-rooms]");
  const box = await wallet.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await expect(wallet).not.toHaveClass(/is-ready/);
  await game(page, "setStars", 3);
  await expect(wallet).toHaveClass(/is-ready/);
  await expect(wallet).toHaveAttribute("aria-label", /3 gwiazdek odnowy/);
  await wallet.click();
  const dialog = page.getByRole("dialog", { name: "Pomieszczenia szklarni" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".lacz-room")).toHaveCount(10);
  await expect(dialog.locator('[data-room="grow"]')).toContainText("🔒 Najpierw: Doniczarnia");
  // Trzy etapy Doniczarni po 1 gwiazdce.
  for (const step of ["Zamieść podłogę", "Umyj szyby", "Ustaw stół do sadzenia"]) {
    await dialog.getByRole("button", { name: `Odnów: ${step} — ⭐ 1` }).click();
  }
  await expect(
    page.getByText("Odnowione pomieszczenie: 🪴 Doniczarnia! Sowia doniczka mieści 2 ładunki więcej"),
  ).toBeVisible();
  await expect(dialog.locator('[data-room="potting"]')).toHaveClass(/is-done/);
  await expect(dialog.locator('[data-room="potting"]')).toContainText("3/3");
  // Sala Upraw: za mało gwiazdek — przycisk wyłączony.
  await expect(dialog.getByRole("button", { name: "Odnów: Napraw półki — ⭐ 2" })).toBeDisabled();
  await expect(dialog.locator('[data-room="grow"]')).toContainText("Potrzeba 2 ⭐ (masz 0).");
  await dialog.getByRole("button", { name: "Zamknij" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator("[data-stars]")).toHaveText("0");
  await expect(page.locator("[data-charges]")).toHaveText("12/14");
  expect((await game(page, "state")).renovation).toBe(3);
  // Sowia Akademia: odnowione pomieszczenia jako „pomieszczenia w Szklarni” (raport co 5 s gry albo hakiem).
  await game(page, "reportProgress");
  const metrics = await page.evaluate(() => window.SowieAcademy.snapshot().metrics);
  expect(metrics.szklarniaRooms).toBe(1);
  expect(metrics.szklarniaVisits).toBeGreaterThanOrEqual(1);
  expect(metrics.szklarniaPlants).toBe(5);
  expect(errors).toEqual([]);
});

test("Łącz i Hoduj: karteczka Pracu (roślina pod nią stoi, 3 stuknięcia ją odklejają), skrzynia Amic po 2 połączeniach obok (kózka w środku)", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  await game(page, "setBlock", 30, "note");
  await drag(page, 30, 31);
  let board = await cells(page);
  expect(board[30]).toEqual({ chain: "monstera", level: 1 });
  expect(board[31]).toEqual({ chain: "monstera", level: 1 });
  const point = await cellPoint(page, 30);
  await page.mouse.click(point.x, point.y);
  await expect(page.locator("[data-hint]")).toHaveText("Odklejasz karteczkę… jeszcze 2 stuknięcia");
  await page.mouse.click(point.x, point.y);
  await expect(page.locator("[data-hint]")).toHaveText("Odklejasz karteczkę… jeszcze 1 stuknięcie");
  await page.mouse.click(point.x, point.y);
  await expect(page.locator("[data-hint]")).toHaveText("Karteczka odklejona!");
  expect((await game(page, "blocks"))[30]).toBeNull();
  // Skrzynia obok pola 31: dwa połączenia na polu 31 ją otwierają.
  await game(page, "setBlock", 32, "crate");
  await drag(page, 30, 31);
  await expect(page.locator("[data-hint]")).toHaveText("Skrzynia Amic: jeszcze 1 połączenie obok");
  await drag(page, 38, 31);
  await expect(page.locator("[data-hint]")).toHaveText(/^Skrzynia otwarta! W środku Kózka .+\. \+5 liści, \+1 ⭐$/);
  board = await cells(page);
  expect(board[31]).toEqual({ chain: "monstera", level: 3 });
  expect((await game(page, "blocks"))[32]).toBeNull();
  expect(board[32].goat).toBeTruthy();
  await expect(page.locator("[data-stars]")).toHaveText("1");
  await expect(page.locator("[data-leaves]")).toHaveText("9");
  expect(errors).toEqual([]);
});

test("Łącz i Hoduj: kózki — Skoczek stuknięciem łączy pary, Dżoker przeciągnięty na roślinę, Taran rozbija kanister", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  // Skoczek: na starcie są pary nasionek (30, 31) i kiełków (38, 39) — stuknięcie łączy obie.
  await game(page, "placeGoat", 0, "skoczek");
  let point = await cellPoint(page, 0);
  await page.mouse.click(point.x, point.y);
  await expect(page.locator("[data-hint]")).toHaveText("Kózka Skoczek połączyła pary roślin (2)");
  let board = await cells(page);
  expect(board[0]).toBeNull();
  expect(board.filter((item) => item?.level === 3)).toHaveLength(1);
  // Dżoker przeciągnięty na Pileę (poziom 3) — Pilea rośnie do poziomu 4.
  await game(page, "placeGoat", 49, "dzoker");
  await game(page, "place", 50, 3, "pilea");
  await drag(page, 49, 50);
  await expect(page.locator("[data-hint]")).toHaveText("Kózka Dżoker pomogła roślinie urosnąć");
  board = await cells(page);
  expect(board[50]).toEqual({ chain: "pilea", level: 4 });
  expect(board[49]).toBeNull();
  // Taran: stuknięcie zaznacza go z podpowiedzią, stuknięcie kanistra go rozbija.
  await game(page, "placeGoat", 56, "taran");
  await game(page, "setBlock", 57, "canister");
  point = await cellPoint(page, 56);
  await page.mouse.click(point.x, point.y);
  await expect(page.locator("[data-hint]")).toHaveText(
    "Kózka Taran: przeciągnij ją na kanister, skrzynię, telefon albo karteczkę",
  );
  expect(await game(page, "selected")).toBe(56);
  point = await cellPoint(page, 57);
  await page.mouse.click(point.x, point.y);
  await expect(page.locator("[data-hint]")).toHaveText("Kózka Taran rozbiła przeszkodę!");
  expect((await game(page, "blocks"))[57]).toBeNull();
  expect((await cells(page))[56]).toBeNull();
  expect((await game(page, "state")).stats.goats).toBe(3);
  expect(errors).toEqual([]);
});

test("Łącz i Hoduj: Basen Humbaka — zaproszenie, runda na wodzie (darmowa doniczka, punkty), wynik i nagroda", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  const invite = page.locator("[data-pool]");
  await expect(invite).toBeHidden();
  await game(page, "setPoolReady", true);
  await expect(invite).toBeVisible();
  const box = await invite.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
  await invite.click();
  await expect(invite).toBeHidden();
  await expect(page.locator("[data-lacz]")).toHaveClass(/is-pool/);
  await expect(page.locator("[data-charges]")).toHaveText("∞");
  await expect(page.locator("[data-compost]")).toBeDisabled();
  await expect(page.locator("[data-hint]")).toContainText("🐋 Basen Humbaka:");
  const main = await cells(page);
  // Połączenie dwóch kiełków w basenie: punkty (poziom 3 → 45), plansza szklarni bez zmian.
  await game(page, "hold", true);
  await game(page, "poolPlace", 0, 2);
  await game(page, "poolPlace", 1, 2);
  await drag(page, 0, 1);
  const state = await game(page, "pool");
  expect(state.score).toBe(45);
  expect(state.cells[1]).toEqual({ chain: "monstera", level: 3 });
  expect(await cells(page)).toEqual(main);
  // Darmowa doniczka: nasionko bez zużycia ładunku.
  const filled = state.cells.filter(Boolean).length;
  await page.locator("[data-pot]").click();
  expect((await game(page, "pool")).cells.filter(Boolean).length).toBe(filled + 1);
  expect((await game(page, "state")).pot.charges).toBe(12);
  // Koniec rundy: okno wyniku, rekord, kózka na półkach szklarni, zaproszenie zużyte.
  await game(page, "endPool");
  const dialog = page.getByRole("dialog", { name: "Basen Humbaka" });
  await expect(dialog).toContainText("Wynik: 45 pkt — nowy rekord! 🏆");
  await expect(dialog).toContainText("Nagroda: kózki na półkach (1), +4 liści, +1 ⭐");
  await dialog.getByRole("button", { name: "Wracam do szklarni" }).click();
  await expect(page.locator("[data-lacz]")).not.toHaveClass(/is-pool/);
  const after = await game(page, "state");
  expect(after.poolBest).toBe(45);
  expect(after.poolReady).toBe(false);
  expect(after.cells.filter((item) => item?.goat)).toHaveLength(1);
  await expect(invite).toBeHidden();
  expect(errors).toEqual([]);
});

test("Łącz i Hoduj: klawiatura — strzałki i Enter łączą, D — doniczka, Delete — kompost, ramka kursora", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  await game(page, "hold", true);
  const canvas = page.locator("[data-canvas]");
  await canvas.focus();
  // Pierwszy Enter stawia kursor na środku planszy (pole 31 — nasionko), drugi zaznacza roślinę.
  await page.keyboard.press("Enter");
  expect(await game(page, "cursor")).toBe(31);
  await expect(page.locator("[data-hint]")).toHaveText("Kolumna 4, rząd 5: Nasionko");
  await page.keyboard.press("Enter");
  expect(await game(page, "selected")).toBe(31);
  // Pole 30 leży na ekranie na lewo od 31 (w obróconej planszy — nad nim).
  await page.keyboard.press((await game(page, "transposed")) ? "ArrowUp" : "ArrowLeft");
  expect(await game(page, "cursor")).toBe(30);
  await page.keyboard.press("Enter");
  let board = await cells(page);
  expect(board[30]).toEqual({ chain: "monstera", level: 2 });
  expect(board[31]).toBeNull();
  // D — Sowia doniczka.
  await page.keyboard.press("d");
  await expect(page.locator("[data-charges]")).toHaveText("11/12");
  // Delete — kompost rośliny pod kursorem.
  await page.keyboard.press("Delete");
  board = await cells(page);
  expect(board[30]).toBeNull();
  await expect(page.locator("[data-hint]")).toHaveText("Kompost: Kiełek → +2 liści");
  expect(errors).toEqual([]);
});

test("Łącz i Hoduj: pakiet startowy z dawnej Szklarni (stan v1), zapis w polu `state` (wersja 2), plansza wraca po wejściu (emulator)", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  const old = JSON.stringify({
    leaves: 1234,
    lifetimeLeaves: 4000,
    rooms: [
      { id: "r1", type: "potting" },
      { id: "r2", type: "grow" },
      { id: "r3", type: "grow" },
    ],
    discovered: ["monstera", "pilea", "monpilea"],
    stats: { hybrids: 1 },
    plants: [],
  });
  await seedDoc(project, "sowiegry/profil/sowiegry_gry/szklarnia", { state: old, saveVersion: 1 });
  const errors = watchErrors(page);
  await openGame(page, cloudUrl("/LaczIHoduj/", project));
  // Pakiet startowy: 4000 / 20 = 200 liści, odnowione Doniczarnia i Sala Upraw (dwa rodzaje pomieszczeń),
  // 2 gwiazdki i Kózka Dżoker za hybrydę.
  await expect(
    page.getByText(
      "Pakiet startowy z dawnej Szklarni: +200 liści, +2 ⭐, Kózka Dżoker. Odnowione pomieszczenia: Doniczarnia, Sala Upraw.",
    ),
  ).toBeVisible();
  await expect(page.locator("[data-leaves]")).toHaveText("200");
  await expect(page.locator("[data-stars]")).toHaveText("2");
  await expect(page.locator("[data-charges]")).toHaveText("14/14");
  expect((await cells(page)).filter((item) => item?.goat === "dzoker")).toHaveLength(1);
  await drag(page, 30, 31);
  await game(page, "save");
  await page.evaluate(() => window.SowieCloud.flush());
  const doc = await readDoc(project, "sowiegry/profil/sowiegry_gry/szklarnia");
  // Stan nowej gry zastępuje dawny (v1) w polu `state`; podsumowanie trafia do profilu.
  const saved = JSON.parse(doc.state);
  expect(saved.version).toBe(2);
  expect(doc.saveVersion).toBe(2);
  expect(doc.preview).toBeUndefined();
  const profile = await readDoc(project, "sowiegry/profil");
  expect(profile.records.szklarnia).toMatchObject({ rooms: 2, orders: 0, poolBest: 0 });
  expect(saved.cells[31]).toEqual({ chain: "monstera", level: 2 });
  expect(saved.stats.merges).toBe(1);
  expect(saved.starter).toBe(true);
  expect(saved.renovation).toBe(6);

  const again = await page.context().newPage();
  await page.close();
  const errorsAgain = watchErrors(again);
  await openGame(again, cloudUrl("/LaczIHoduj/", project));
  expect((await again.evaluate(() => window.LaczIHoduj.cells()))[31]).toEqual({ chain: "monstera", level: 2 });
  await expect(again.locator("[data-leaves]")).toHaveText("201");
  // Pakiet tylko raz.
  await expect(again.getByText(/Pakiet startowy/)).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(errorsAgain).toEqual([]);
});

test("Łącz i Hoduj: zapis z czasu podglądu (`preview`) staje się stanem gry, stary adres Sowiej Szklarni przekierowuje (emulator)", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  // Zapis podglądu (stan v2 z pakietem startowym już przyznanym, 37 liści) — wzięty z gry bez emulatora (pamięć).
  await openGame(page, "/LaczIHoduj/?seed=podglad");
  const preview = await page.evaluate(() => ({ ...window.LaczIHoduj.state(), leaves: 37, starter: true }));
  // Obok dawny stan Szklarni (v1) — przy zapisie z podglądu pakiet startowy nie wraca.
  await seedDoc(project, "sowiegry/profil/sowiegry_gry/szklarnia", {
    state: JSON.stringify({ version: 1, leaves: 900, lifetimeLeaves: 9000, rooms: [{ id: "r1", type: "grow" }] }),
    saveVersion: 1,
    preview: JSON.stringify(preview),
  });
  const other = await page.context().newPage();
  await page.close();
  const errors = watchErrors(other);
  await openGame(other, cloudUrl("/SowiaSzklarnia/", project));
  await expect(other).toHaveURL(/\/LaczIHoduj\/\?/);
  await expect(other.locator("[data-leaves]")).toHaveText("37");
  await expect(other.getByText(/Pakiet startowy/)).toHaveCount(0);
  await other.evaluate(() => window.SowieCloud.flush());
  await expect
    .poll(async () => {
      const doc = await readDoc(project, "sowiegry/profil/sowiegry_gry/szklarnia");
      return [doc.preview === undefined, JSON.parse(doc.state).leaves, doc.saveVersion];
    })
    .toEqual([true, 37, 2]);
  expect(errors).toEqual([]);
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
    for (const selector of ["[data-pot]", "[data-compost]", "[data-order]"]) {
      for (const box of await page
        .locator(selector)
        .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()))) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width).toBeLessThanOrEqual(320);
        expect(box.y + box.height).toBeLessThanOrEqual(568);
      }
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
      for (const selector of ["[data-pot]", "[data-compost]", "[data-order]"]) {
        for (const box of await page
          .locator(selector)
          .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()))) {
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.x).toBeGreaterThanOrEqual(canvas.x + canvas.width);
          expect(box.y + box.height).toBeLessThanOrEqual(height);
        }
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
