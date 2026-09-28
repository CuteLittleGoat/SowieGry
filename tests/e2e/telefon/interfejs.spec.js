// Sowie Laboratorium, dział „Interfejs”: HUD, komunikaty (1 naraz w grze), menu pauzy, auto-pauza, wyniki i okno.
const { test, expect, setVisibility, waitForCloud, watchErrors } = require("../fixtures");

async function openInterface(page) {
  const errors = watchErrors(page);
  await page.goto("/lab/?seed=interfejs&dzial=interfejs", { waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction(() => window.SowieLab?.interface()?.state().running && window.SowieLab.atlas.ready());
  return errors;
}

const demo = (page, expression) =>
  page.evaluate(`(() => { const ui = window.SowieLab.interface(); return ${expression}; })()`);

test("HUD i komunikaty: wynik, liście, życia, power-up i jeden komunikat u góry planszy", async ({ page }) => {
  const errors = await openInterface(page);
  const stage = await page.locator("[data-ui-stage]").boundingBox();

  // Pauza w lewym górnym rogu, min. 48 px.
  const pauseButton = page.locator(".sowie-hud-pause");
  const pauseBox = await pauseButton.boundingBox();
  expect(pauseBox.width).toBeGreaterThanOrEqual(48);
  expect(pauseBox.height).toBeGreaterThanOrEqual(48);
  expect(pauseBox.x - stage.x).toBeLessThan(stage.width / 3);

  await page.getByRole("button", { name: "Liść +10" }).tap();
  await page.getByRole("button", { name: "Złoty liść +50" }).tap();
  await expect(page.locator("[data-hud-score]")).toHaveText("60");
  await expect(page.locator("[data-hud-leaves]")).toHaveText("6");
  await page.getByRole("button", { name: "Kózka: Tarcza" }).tap();
  await expect(page.locator(".sowie-hud-powerup")).toHaveCount(1);
  await expect(page.locator(".sowie-hud-powerup")).toContainText("Tarcza");

  await page.getByRole("button", { name: "5 komunikatów naraz" }).tap();
  const chips = page.locator(".sowie-toast-chip:not(.is-leaving)");
  await expect(chips).toHaveCount(1);
  const state = await demo(page, "ui.toasts.state()");
  expect(state.inGame).toBe(true);
  expect(state.queued.length).toBeLessThanOrEqual(3);
  // Komunikat w górnej części planszy — sowa biegnie przy dolnej krawędzi.
  const chip = await chips.first().boundingBox();
  expect(chip.y + chip.height).toBeLessThan(stage.y + stage.height * 0.45);

  // Tarcza chroni przed trafieniem, drugie trafienie odbiera życie.
  await page.getByRole("button", { name: "Trafienie (Pracu)" }).tap();
  expect(await demo(page, "ui.hud.state().lives")).toBe(3);
  await page.getByRole("button", { name: "Trafienie (Pracu)" }).tap();
  await expect.poll(() => demo(page, "ui.hud.state().lives")).toBe(2);
  await expect(page.locator("[data-hud-lives]")).toHaveAttribute("aria-label", "Życia: 2 z 3");

  // SowieProgress liczy zdarzenia biegu.
  const run = await page.evaluate(() => window.SowieProgress.current());
  expect(run.leaves).toMatchObject({ zielony: 1, zloty: 5, total: 6 });
  expect(run.goats).toEqual({ tarcza: 1 });
  expect(run.hits.pracu).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test("menu pauzy: ustawienia i garderoba zapisane w profilu, instrukcja, wznowienie z odliczaniem, auto-pauza", async ({
  page,
}) => {
  const errors = await openInterface(page);
  await page.evaluate(() => window.SowieLab.soundReady);
  await page.locator(".sowie-hud-pause").tap();
  const dialog = page.getByRole("dialog", { name: "Pauza" });
  await expect(dialog).toBeVisible();
  const resume = dialog.getByRole("button", { name: "Wznów" });
  expect((await resume.boundingBox()).height).toBeGreaterThanOrEqual(56);
  for (const name of ["Zacznij od nowa", "Jak grać", "Ustawienia", "Garderoba", "Wyjdź do menu"]) {
    const box = await dialog.getByRole("button", { name }).boundingBox();
    expect(box.height, name).toBeGreaterThanOrEqual(48);
  }
  expect(await demo(page, "ui.shell.state()")).toBe("paused");

  // Ustawienia: suwak muzyki i Tryb Przytulny.
  await dialog.getByRole("button", { name: "Ustawienia" }).tap();
  const music = dialog.locator('[data-volume="music"]');
  await music.fill("40");
  expect(await page.evaluate(() => window.SowieCloud.profile().settings.volumeMusic)).toBe(40);
  const cozy = dialog.getByRole("button", { name: /Tryb Przytulny/ });
  await cozy.tap();
  await expect(cozy).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => window.SowieCloud.profile().settings.cozy)).toBe(true);
  await dialog.getByRole("button", { name: "Gotowe" }).tap();

  // Garderoba: odblokowana kokardka.
  await dialog.getByRole("button", { name: "Garderoba" }).tap();
  await dialog.getByRole("button", { name: "Kokardka" }).tap();
  expect(await page.evaluate(() => window.SowieCloud.profile().cosmetics.selected)).toBe("bow");
  await dialog.getByRole("button", { name: "Gotowe" }).tap();

  // Instrukcja w oknie (karty przewijane w bok).
  await dialog.getByRole("button", { name: "Jak grać" }).tap();
  const guide = page.getByRole("dialog", { name: "Jak grać — Poznaj Sowi Świat" });
  await expect(guide).toBeVisible();
  await expect(guide.locator(".sowie-guide-card")).toHaveCount(7);
  await guide.getByRole("button", { name: "Rozumiem" }).tap();
  await expect(guide).toBeHidden();

  // Wznów → odliczanie 3-2-1 → gra.
  await dialog.getByRole("button", { name: "Wznów" }).tap();
  await expect(page.locator(".sowie-ui-pause .sowie-countdown")).toHaveText("3");
  await expect.poll(() => demo(page, "ui.shell.state()"), { timeout: 6000 }).toBe("running");
  await expect(dialog).toBeHidden();

  // Auto-pauza po przejściu do innej aplikacji.
  await setVisibility(page, "hidden");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Witaj z powrotem");
  await setVisibility(page, "visible");
  expect(errors).toEqual([]);
});

test("ekran wyników: wynik, nowy rekord, top 10, zadania i „Jeszcze raz”", async ({ page }) => {
  const errors = await openInterface(page);
  await page.getByRole("button", { name: "Złoty liść +50" }).tap();
  await page.getByRole("button", { name: "Koniec gry" }).tap();
  const results = page.getByRole("dialog", { name: "Koniec biegu!" });
  await expect(results).toBeVisible();
  await expect(results.locator("[data-results-score]")).toHaveText("50");
  await expect(results.locator("[data-results-record]")).toContainText("Nowy rekord!");
  await expect(results.locator("[data-results-rank]")).toContainText("1. miejsce");
  await expect(results.locator("[data-results-tasks] li")).toHaveCount(2);
  await expect(results).toContainText("Złap 2 złote liście");
  const again = results.getByRole("button", { name: "Jeszcze raz" });
  expect((await again.boundingBox()).height).toBeGreaterThanOrEqual(56);
  await again.tap();
  await expect(results).toBeHidden();
  await expect(page.locator("[data-hud-score]")).toHaveText("0");
  expect(await demo(page, "ui.state().running")).toBe(true);
  expect(errors).toEqual([]);
});
