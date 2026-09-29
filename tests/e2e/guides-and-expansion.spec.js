const { test, expect, waitForCloud } = require("./fixtures");

// Obecne gry (dok z instrukcją, Akademią i panelem mechaniki). Sowia Ucieczka (runner) ma własną instrukcję,
// zadania biegu i wyzwanie dnia — testy w tests/e2e/telefon/ucieczka.spec.js.
const games = [
  { id: "jumper", path: "/SowaJumper/", title: "SowaJumper", feature: "Precyzja i wyzwanie dnia SowaJumper" },
  { id: "sowa3", path: "/Sowa3/", title: "Sowa3", feature: "Combo i wyzwanie dnia Sowa3" },
  { id: "ogrody", path: "/SowieOgrody/", title: "Sowie Ogrody", feature: "Kontrakty ogrodnicze" },
  { id: "szklarnia", path: "/SowiaSzklarnia/", title: "Sowia Szklarnia", feature: "Album cech i cele laboratorium" },
];

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
  expect(errors).toEqual([]);
});

for (const game of games) {
  test(`${game.title} udostępnia instrukcję, Akademię i panel nowej mechaniki`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(`${game.path}?seed=${game.id}-guide&testNow=1783656000000`, { waitUntil: "load" });

    await expect(page.locator(`[data-game-guide-fab="${game.id}"]`)).toBeVisible();
    await expect(page.locator("[data-academy-fab]")).toBeVisible();
    await expect(page.getByRole("button", { name: game.feature })).toBeVisible();

    await page.locator(`[data-game-guide-fab="${game.id}"]`).click();
    await expect(page.getByRole("dialog")).toContainText(`Instrukcja — ${game.title}`);
    await page.getByRole("button", { name: "Rozumiem" }).click();

    await page.getByRole("button", { name: game.feature }).click();
    await expect(page.getByRole("dialog")).toContainText(/wyzwanie dnia|kontrakty|album cech/i);
    await page.getByRole("button", { name: "Zamknij" }).click();

    expect(errors).toEqual([]);
  });
}

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
