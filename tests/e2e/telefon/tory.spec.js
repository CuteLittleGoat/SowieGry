// Sowie Tory (wersja podglądowa nowej Sowa3, Analiza 3, E5) na telefonach: start, przesunięcia palcem (tor, skok,
// ślizg), stuknięcia przy bokach, klawiatura, pauza, koniec biegu z wynikami i zapis rekordu „sowa3” w chmurze.
const { test, expect, swipe: swipeFrom, waitForCloud, watchErrors } = require("../fixtures");
const { cloudUrl, readDoc, seedDoc, uniqueProject } = require("../emulator");

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

  // Bieg trwa: dystans rośnie (czekamy na stan gry, nie na zegar — w WebKit w CI klatki bywają wolniejsze, a pętla
  // robi najwyżej 12 kroków po 1/120 s na klatkę, więc czas gry płynie wtedy wolniej niż rzeczywisty).
  const before = (await state(page)).stageDistance;
  await expect.poll(async () => (await state(page)).stageDistance, { timeout: 10_000 }).toBeGreaterThan(before + 10);
  expect((await state(page)).speed).toBeGreaterThan(12);
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
  await openGame(page, cloudUrl("/SowieTory/?seed=tory-wyniki", project));
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
  // Dwa wejścia strony — w WebKit w CI wczytanie bywa wolne.
  test.setTimeout(60_000);
  const errors = watchErrors(page);
  await openGame(page, "/SowieTory/?seed=tory-plansze&plansza=4");
  await page.locator("[data-start]").click();
  await expect(page.locator(".tory-progress")).toContainText("4/4 · Stacja Amic");
  expect((await state(page)).stageIndex).toBe(3);

  await openGame(page, "/SowieTory/?seed=tory-dziki&plansza=3");
  await page.locator('[data-level="chill"]').click();
  await page.locator("[data-start]").click();
  await expect(page.locator(".tory-progress")).toContainText("3/4 · Blokowisko PRL");
  // Przeskok tuż przed pierwszą szarżą: strzałka i podpowiedź, potem dzik biegnie torem sowy. Logika wstrzymana
  // (hold) i przewijana krokami po 0,25 s (advance) — w WebKit w CI klatki bywają tak wolne, że w 30 s czasu
  // rzeczywistego gra nie dobiegała do szarży (CI 5dc56b1).
  await page.evaluate(() => {
    window.SowieTory.hold(true);
    window.SowieTory.warp(125);
  });
  const boarPhase = (phase) =>
    page.evaluate((wanted) => {
      for (let step = 0; step < 160; step += 1) {
        if (window.SowieTory.state().boars.some((item) => item.phase === wanted)) return true;
        window.SowieTory.advance(0.25);
      }
      return false;
    }, phase);
  expect(await boarPhase("warning")).toBe(true);
  await expect(page.locator(".sowie-toast-chip", { hasText: "Dzik szarżuje!" })).toBeVisible();
  expect(await boarPhase("charge")).toBe(true);
  expect(errors).toEqual([]);
});

test("Sowie Tory: meta → finał z basenem → Humbacze Tory → podsumowanie z gwiazdkami → plansza 2 (emulator)", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await openGame(page, cloudUrl("/SowieTory/?seed=tory-final", project));
  const music = () => page.evaluate(() => window.SowieTory.music());
  await page.locator("[data-start]").click();
  // Muzyka: motyw planszy w biegu, cisza w finale, pieśń humbaka w rejsie, motyw następnej planszy.
  await expect.poll(music, { timeout: 10_000 }).toBe("tory-biedronka");
  await page.evaluate(() => window.SowieTory.warp(1200));
  await expect.poll(async () => (await state(page)).phase).toBe("finale");
  expect((await state(page)).finishSeen).toBe(false);
  expect(await music()).toBe(null);

  // Pierwszy finał: stuknięcie go nie skraca.
  const box = await page.locator("[data-stage]").boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.55);
  expect((await state(page)).phase).toBe("finale");
  await expect.poll(async () => (await state(page)).phase, { timeout: 15_000 }).toBe("whale");
  await expect(page.locator(".sowie-toast-chip", { hasText: "Humbacze Tory!" })).toBeVisible();
  expect(await music()).toBe("humbak");
  await expect(page.locator(".tory-progress")).toContainText("Humbacze Tory · 0:");
  await page.evaluate(() => window.SowieCloud.flush());
  expect((await readDoc(project, "sowiegry/profil/sowiegry_gry/sowa3")).finishSeen).toBe(true);

  // Rejs: w prawo — tor humbaka, w górę — wyskok.
  await swipe(page, 90, 0);
  await expect.poll(async () => (await state(page)).ride.lane).toBe(1);
  await swipe(page, 0, -90);
  await expect.poll(async () => (await state(page)).ride.airborne).toBe(true);
  // Reszta 20-sekundowego rejsu (logika z testów jednostkowych) — przewinięta, bez renderowania każdej klatki.
  await page.evaluate(() => window.SowieTory.advance(25));

  const summary = page.getByRole("dialog", { name: /1\/4 · Biedronka — ukończona!/ });
  await expect(summary).toBeVisible({ timeout: 15_000 });
  await expect(summary).toContainText("Plansza ukończona");
  await expect(summary).toContainText("Liście z Humbaczych Torów");
  const stars = Number(await summary.locator("[data-stars]").getAttribute("data-stars"));
  expect(stars).toBeGreaterThanOrEqual(1);
  await summary.getByRole("button", { name: "Dalej" }).click();
  await expect(summary).toBeHidden();
  await expect(page.locator(".tory-progress")).toContainText("2/4 · Festiwal");
  expect((await state(page)).phase).toBe("run");
  await expect.poll(music).toBe("tory-festiwal");
  await page.evaluate(() => window.SowieCloud.flush());
  expect((await readDoc(project, "sowiegry/profil/sowiegry_gry/sowa3")).stars.biedronka).toBe(stars);

  // Drugi finał: już obejrzany — stuknięcie przechodzi od razu do rejsu.
  await page.evaluate(() => window.SowieTory.warp(1200));
  await expect.poll(async () => (await state(page)).phase).toBe("finale");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.55);
  await expect.poll(async () => (await state(page)).phase, { timeout: 2000 }).toBe("whale");
  expect(errors).toEqual([]);
});

test("Sowie Tory: kózki (Kózia jazda, Tarcza) i Gorączka Monster — komunikaty i chipy w HUD obok paska planszy", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page, "/SowieTory/?seed=tory-kozy&plansza=2");
  await page.locator("[data-start]").click();
  await expect(page.locator(".tory-progress")).toContainText("2/4 · Festiwal");
  await page.waitForTimeout(600);

  await page.evaluate(() => window.SowieTory.goat("turbo"));
  await expect(page.locator(".sowie-toast-chip", { hasText: "Kózia jazda!" })).toBeVisible();
  const ride = page.locator(".sowie-hud-powerup", { hasText: "Kózia jazda" });
  await expect(ride).toBeVisible();
  expect((await state(page)).riding).toBeGreaterThan(0);
  expect((await state(page)).goats).toBe(1);

  await page.evaluate(() => window.SowieTory.goat("tarcza"));
  await expect(page.locator(".sowie-hud-powerup", { hasText: "Tarcza" })).toBeVisible();
  await page.evaluate(() => window.SowieTory.fever());
  await expect(page.locator(".sowie-hud-powerup", { hasText: "Gorączka" })).toBeVisible();
  expect((await state(page)).fever).toBeGreaterThan(0);

  // Chipy power-upów (prawa kolumna) nie zasłaniają paska planszy (lewa strona pod pauzą).
  const progress = await page.locator(".tory-progress").boundingBox();
  for (const chip of await page.locator(".sowie-hud-powerup").all()) {
    const box = await chip.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(progress.x + progress.width - 1);
  }
  expect(errors).toEqual([]);
});

test("Sowie Tory: ukończona kampania odblokowuje tryb Nieskończony — pętla plansz i osobny rekord (emulator)", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const project = uniqueProject(testInfo);
  await seedDoc(project, "sowiegry/profil/sowiegry_gry/sowa3", { finishSeen: true });
  const errors = watchErrors(page);
  const url = cloudUrl("/SowieTory/?seed=tory-petla&plansza=4", project);
  await openGame(page, url);
  const endlessChip = page.locator('[data-mode="nieskonczony"]');
  await expect(endlessChip).toBeDisabled();
  await expect(page.locator("[data-mode-note]")).toContainText("Ukończ kampanię");

  // Ostatnia plansza kampanii: meta → finał (obejrzany — stuknięcie skraca) → rejs → „Zobacz wyniki”.
  await page.locator("[data-start]").click();
  await page.evaluate(() => window.SowieTory.warp(1200));
  await expect.poll(async () => (await state(page)).phase).toBe("finale");
  const box = await page.locator("[data-stage]").boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.55);
  await expect.poll(async () => (await state(page)).phase, { timeout: 5000 }).toBe("whale");
  // 20 s rejsu humbaka (logika z testów jednostkowych) — przewinięte.
  await page.evaluate(() => window.SowieTory.advance(25));
  const summary = page.getByRole("dialog", { name: /4\/4 · Stacja Amic — ukończona!/ });
  await expect(summary).toBeVisible({ timeout: 15_000 });
  await summary.getByRole("button", { name: "Zobacz wyniki" }).click();
  const results = page.getByRole("dialog", { name: "Kampania ukończona!" });
  await expect(results).toBeVisible();
  await expect(results).toContainText("Odblokowano tryb Nieskończony!");
  await page.evaluate(() => window.SowieCloud.flush());
  expect((await readDoc(project, "sowiegry/profil/sowiegry_gry/sowa3")).endlessUnlocked).toBe(true);
  expect(errors).toEqual([]);

  // Ponowne wejście (nowa karta tego samego telefonu): tryb Nieskończony dostępny; po 4. planszy znowu 1.
  // Nowa karta zamiast przejścia w tej samej — WebKit zgłasza przerwane przejściem długie zapytania kanału
  // Firestore jako błędy strony („…due to access control checks”).
  const again = await page.context().newPage();
  await page.close();
  const errorsAgain = watchErrors(again);
  await openGame(again, url);
  const chip = again.locator('[data-mode="nieskonczony"]');
  await expect(chip).toBeEnabled();
  await expect(again.locator("[data-mode-note]")).toBeHidden();
  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await expect(again.locator("[data-record]")).toContainText("Nieskończony");
  await again.locator("[data-start]").click();
  expect((await state(again)).mode).toBe("nieskonczony");
  await again.evaluate(() => window.SowieTory.warp(1200));
  // Obejrzany finał w trybie Nieskończonym skraca się sam.
  await expect.poll(async () => (await state(again)).phase, { timeout: 5000 }).toBe("whale");
  await again.evaluate(() => window.SowieTory.advance(25));
  const next = again.getByRole("dialog", { name: /4\/4 · Stacja Amic — ukończona!/ });
  await expect(next).toBeVisible({ timeout: 15_000 });
  await next.getByRole("button", { name: "Dalej" }).click();
  await expect(again.locator(".tory-progress")).toContainText("1/4 · Biedronka · okr. 2");
  expect((await state(again)).loop).toBe(1);
  await again.evaluate(() => window.SowieTory.end());
  const endless = again.getByRole("dialog", { name: "Koniec trybu Nieskończonego!" });
  await expect(endless).toBeVisible();
  await expect(endless).toContainText("Plansze (okrążenia)");
  await again.evaluate(() => window.SowieCloud.flush());
  const profile = await readDoc(project, "sowiegry/profil");
  expect(profile.records.sowa3["nieskonczony-arcade"].bestScore).toBeGreaterThan(0);
  const doc = await readDoc(project, "sowiegry/profil/sowiegry_gry/sowa3");
  expect(doc.top10["nieskonczony-arcade"][0].mode).toBe("nieskonczony");
  expect(errorsAgain).toEqual([]);
});

test("Sowie Tory: przycisk „Samouczek” na ekranie tytułowym uruchamia samouczek od nowa (uwaga G1)", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await openGame(page);
  await page.locator("[data-tutorial-replay]").click();
  await expect(page.locator("[data-title]")).toBeHidden();
  const first = await page.evaluate(() => {
    const game = window.SowieTory;
    game.hold(true);
    for (let time = 0; time < 20 && !game.tutorial()?.frozen; time += 0.05) game.advance(0.05);
    return game.tutorial();
  });
  expect(first.frozen).toBe(true);
  await expect(page.locator(".tory-tutorial")).toContainText("krok 1 z 4");
  expect(errors).toEqual([]);
});

test("Sowie Tory: samouczek pierwszego biegu — gra czeka na pokazany ruch, 4 kroki, zapis w dokumencie gry (emulator)", async ({
  page,
}, testInfo) => {
  // Kroki samouczka zależą od czasu gry: logika wstrzymana w klatkach (`hold`) i przewijana porcjami (`advance`) —
  // w WebKit w CI klatki bywają wolniejsze niż czas rzeczywisty (wcześniej koniec samouczka nie nadchodził w 30 s).
  test.setTimeout(90_000);
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await openGame(page, cloudUrl("/SowieTory/", project));
  await page.locator("[data-start]").click();
  await page.evaluate(() => window.SowieTory.hold(true));
  const prompt = page.locator(".tory-tutorial");
  const demo = prompt.locator(".sowie-gesture-demo");
  // Logika porcjami po 0,05 s, aż samouczek zatrzyma grę przed przeszkodą albo się skończy (najwyżej `seconds` s).
  const advanceToPrompt = (seconds = 20) =>
    page.evaluate((limit) => {
      const game = window.SowieTory;
      for (let time = 0; time < limit; time += 0.05) {
        game.advance(0.05);
        const now = game.tutorial();
        if (!now || now.frozen) return now;
      }
      return game.tutorial();
    }, seconds);
  // Ruch przyjęty: krótki krok logiki (podpowiedź znika, gra rusza).
  const resume = () => page.evaluate(() => window.SowieTory.advance(0.05));

  // 1. Zmiana toru: gra stoi (także w zwykłych klatkach — bez `hold`); stuknięcie w środek (skok) nic nie daje,
  // przesunięcie w lewo — wznawia.
  expect((await advanceToPrompt()).frozen).toBe(true);
  await expect(prompt).toContainText("Telefon na torze!");
  await expect(prompt).toContainText("krok 1 z 4");
  await expect(demo).toHaveAttribute("data-gesture", "swipe-left");
  await page.evaluate(() => window.SowieTory.hold(false));
  const frozen = (await state(page)).stageDistance;
  await page.waitForTimeout(400);
  expect((await state(page)).stageDistance).toBe(frozen);
  await page.evaluate(() => window.SowieTory.hold(true));
  const box = await page.locator("[data-stage]").boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.55);
  await resume();
  await expect(prompt).toBeVisible();
  expect((await page.evaluate(() => window.SowieTory.tutorial())).frozen).toBe(true);
  await swipe(page, -90, 0);
  await resume();
  await expect(prompt).toBeHidden();

  // 2. Skok, 3. ślizg, 4. kózka na środkowym torze (sowa jest na lewym — w prawo).
  expect((await advanceToPrompt()).frozen).toBe(true);
  await expect(prompt).toContainText("Teczki");
  await expect(demo).toHaveAttribute("data-gesture", "swipe-up");
  await swipe(page, 0, -90);
  await resume();
  await expect(prompt).toBeHidden();
  expect((await advanceToPrompt()).frozen).toBe(true);
  await expect(prompt).toContainText("Dymki");
  await expect(demo).toHaveAttribute("data-gesture", "swipe-down");
  await swipe(page, 0, 90);
  await resume();
  await expect(prompt).toBeHidden();
  expect((await advanceToPrompt()).frozen).toBe(true);
  await expect(prompt).toContainText("Kózka!");
  await expect(demo).toHaveAttribute("data-gesture", "swipe-right");
  await swipe(page, 90, 0);
  await resume();
  await expect(prompt).toBeHidden();

  expect(await advanceToPrompt(10)).toBeNull();
  await expect(page.locator(".sowie-toast-chip", { hasText: "Świetnie! Teraz sama trasa" })).toBeVisible({
    timeout: 10_000,
  });
  expect(await page.evaluate(() => window.SowieTory.tutorial())).toBeNull();
  // Po samouczku tryb bezpieczny się kończy (sowa bez ruchu może już trafić w zwykłą przeszkodę) — brak trafień
  // przy właściwych ruchach sprawdza test jednostkowy; tu: kózka z kroku 4 złapana.
  expect((await state(page)).goats).toBe(1);
  await page.evaluate(() => window.SowieCloud.flush());
  expect((await readDoc(project, "sowiegry/profil/sowiegry_gry/sowa3")).tutorialDone).toBe(true);

  // Kolejny bieg już bez samouczka (logika znowu w klatkach — koniec biegu i wyniki obsługuje pętla).
  await page.evaluate(() => {
    window.SowieTory.hold(false);
    window.SowieTory.end();
  });
  await page
    .getByRole("dialog", { name: /Koniec biegu/ })
    .getByRole("button", { name: "Jeszcze raz" })
    .click();
  expect(await page.evaluate(() => window.SowieTory.tutorial())).toBeNull();
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
