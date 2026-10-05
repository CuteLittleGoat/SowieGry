// Okno „Rekordy” na telefonie (emulator Firestore). Od E6f wszystkie gry zręcznościowe są przebudowane —
// rekordy, top 10 na poziom i liczba rozgrywek są w menu głównym (zakładka „Sowa” → „Rekordy”).
const { test, expect, waitForCloud, watchErrors } = require("../fixtures");
const { cloudUrl, uniqueProject } = require("../emulator");

test("rekordy gry: top 10 na poziom, wysokość i liczba rozgrywek (Sowa w Chmurach)", async ({ page }, testInfo) => {
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await page.goto(cloudUrl("/SowaWChmurach/?seed=daily-rekordy", project), { waitUntil: "load" });
  await waitForCloud(page);

  // Dwa loty na poziomie Arcade — ten sam zapis zbiorczy, który robi gra na koniec lotu.
  await page.evaluate(async () => {
    for (const [score, height] of [
      [900, 40],
      [1234, 77],
    ]) {
      window.SowieCloud.submitRun("jumper", { score, height, leaves: 2, difficulty: "arcade" });
    }
    await window.SowieCloud.flush();
  });
  expect(errors).toEqual([]);

  // Menu w nowej karcie tego samego telefonu zamiast przejścia w tej samej — WebKit zgłasza przerwane przejściem
  // długie zapytania kanału Firestore jako błędy strony („…due to access control checks”), jak w tory.spec.js.
  const menu = await page.context().newPage();
  await page.close();
  const menuErrors = watchErrors(menu);
  await menu.goto(cloudUrl("/?seed=daily-rekordy", project), { waitUntil: "load" });
  await waitForCloud(menu);
  await menu.getByRole("tab", { name: "Sowa" }).tap();
  await menu.locator('[data-records="jumper"]').tap();
  const dialog = menu.getByRole("dialog", { name: /Rekordy — Sowa w Chmurach/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("[data-best]")).toHaveText(/1\s?234 pkt/);
  await expect(dialog).toContainText("Wysokość");
  await expect(dialog.locator(".menu-top li")).toHaveCount(2);
  await expect(dialog.locator(".menu-top li").first()).toContainText(/1\s?234 pkt · 77 m/);

  // Inny poziom trudności ma własne rekordy.
  await dialog.getByRole("button", { name: "Chaos" }).tap();
  await expect(dialog.getByRole("button", { name: "Chaos" })).toHaveAttribute("aria-pressed", "true");
  await expect(dialog).toContainText("Brak rozgrywek na tym poziomie");
  await expect(dialog.locator("[data-best]")).toHaveText("0 pkt");
  expect(menuErrors).toEqual([]);
});
