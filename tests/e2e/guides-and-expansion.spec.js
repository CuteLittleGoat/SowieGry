const { test, expect, waitForCloud } = require("./fixtures");

// Instrukcje gier w menu i Sowia Akademia. Od E8e wszystkie gry są przebudowane — mają własne „Jak grać?”, zadania
// i kontrakty (testy w tests/e2e/telefon/: ucieczka, tory, chmury, ogrody-nowe, lacz); dawny dok z instrukcją,
// Akademią i panelem rozszerzeń nie jest już ładowany przez żadną grę.

function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("favicon.ico"))
      errors.push(`console: ${message.text()}`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400 && !response.url().includes("favicon.ico")) {
      errors.push(`http ${response.status()}: ${response.url()}`);
    }
  });
  return errors;
}

test("menu oferuje osobną instrukcję każdej gry i zadania Sowiej Akademii", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?seed=guides-menu&testNow=1783656000000", { waitUntil: "load" });

  await expect(page.locator(".game-card")).toHaveCount(5);
  await expect(page.locator("[data-guide]")).toHaveCount(5);
  // Nowe menu nie dokleja starych przycisków Akademii i Galerii do nagłówka.
  await expect(page.locator("#academyButton, #galleryButton")).toHaveCount(0);

  await page.locator('[data-guide="runner"]').click();
  await expect(page.getByRole("dialog")).toContainText("Jak grać — Sowia Ucieczka");
  await expect(page.getByRole("dialog")).toContainText("Szybowanie");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator('[data-guide="runner"]')).toBeFocused();

  await page.locator('[data-guide="sowa3"]').click();
  await expect(page.getByRole("dialog")).toContainText("Jak grać — Sowie Tory");
  await expect(page.getByRole("dialog")).toContainText("Zmiana toru");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(errors).toEqual([]);
});

test("Sowia Akademia nalicza misję tylko raz i zachowuje nagrody", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?seed=academy-test&testNow=1783656000000", { waitUntil: "load" });
  await waitForCloud(page);

  const result = await page.evaluate(() => {
    const before = window.SowieAcademy.snapshot();
    window.SowieAcademy.record("runner", "runnerDistance", 5000, "max");
    const afterFirst = window.SowieAcademy.snapshot();
    window.SowieAcademy.record("runner", "runnerDistance", 5000, "max");
    const afterSecond = window.SowieAcademy.snapshot();
    return {
      beforeXp: before.xp,
      firstXp: afterFirst.xp,
      secondXp: afterSecond.xp,
      firstFeathers: afterFirst.feathers,
      secondFeathers: afterSecond.feathers,
    };
  });

  expect(result.firstXp).toBeGreaterThanOrEqual(result.beforeXp);
  expect(result.secondXp).toBe(result.firstXp);
  expect(result.secondFeathers).toBe(result.firstFeathers);

  // Zadania Akademii w nowym wyglądzie: zakładka „Sowa”.
  await page.getByRole("tab", { name: "Sowa" }).click();
  const tasks = page.locator('[data-owl-card="zadania"]');
  await expect(tasks).toContainText("Zadania");
  await expect(tasks.locator("[data-task]")).toHaveCount(4);
  await expect(tasks.locator('[data-task="weekly"]')).toContainText("Zagraj w 3 różne gry");
  await expect(page.locator('[data-owl-card="profil"]')).toContainText(`Piórka: ${result.secondFeathers}`);
  expect(errors).toEqual([]);
});
