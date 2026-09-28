// Okno „🏆 Rekordy” na telefonie (emulator Firestore).
const { test, expect, waitForCloud, watchErrors } = require("../fixtures");
const { cloudUrl, uniqueProject } = require("../emulator");

test("rekordy gry: top 10 na poziom, ostatnie gry i wyzwanie dnia", async ({ page }, testInfo) => {
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await page.goto(cloudUrl("/SowaJumper/?seed=daily-rekordy&daily=1", project), { waitUntil: "load" });
  await waitForCloud(page);

  // Dwie rozgrywki na poziomie Arcade (koniec gry jak po utracie ostatniego życia).
  await page.evaluate(async () => {
    for (const [score, height] of [
      [900, 40],
      [1234, 77],
    ]) {
      state.scene = "playing";
      state.score = score;
      state.heightMeters = height;
      endGame();
    }
    await window.SowieCloud.flush();
  });

  await page.locator("[data-records-fab]").tap();
  const dialog = page.getByRole("dialog", { name: "🏆 Rekordy — SowaJumper" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("[data-records-best]")).toHaveText(/1\s?234/);
  await expect(dialog.locator("[data-records-top] li")).toHaveCount(2);
  await expect(dialog.locator("[data-records-top] li").first()).toContainText(/1\s?234 pkt · 77 m/);
  await expect(dialog.locator("[data-records-history] li")).toHaveCount(2);
  await expect(dialog.locator("[data-records-history] li").first()).toContainText("wyzwanie dnia");
  await expect(dialog.locator("[data-records-daily] li")).toHaveCount(1);
  await expect(dialog.locator("[data-records-daily] li")).toContainText("77 m");

  // Inny poziom trudności ma własne rekordy.
  await dialog.getByRole("button", { name: "Chaos" }).tap();
  await expect(dialog.getByRole("button", { name: "Chaos" })).toHaveAttribute("aria-pressed", "true");
  await expect(dialog.locator("[data-records-top]")).toContainText("Brak rozgrywek na tym poziomie");
  await expect(dialog.locator("[data-records-best]")).toHaveText("0");

  await dialog.getByRole("button", { name: "Zamknij" }).tap();
  await expect(dialog).toBeHidden();
  expect(errors).toEqual([]);
});

test("rekordy gry idle pokazują podsumowanie postępu", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/SowieOgrody/?seed=rekordy-idle", { waitUntil: "load" });
  await waitForCloud(page);
  await page.locator("#clickButton").tap();
  await page.evaluate(() => window.SowieCloud.flush());
  await page.locator("[data-records-fab]").tap();
  const dialog = page.getByRole("dialog", { name: "🏆 Rekordy — Sowie Ogrody" });
  await expect(dialog).toContainText("Liście w całej grze");
  await expect(dialog).toContainText("Wielkie Przesadzania");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  expect(errors).toEqual([]);
});
