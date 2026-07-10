const { test, expect } = require("@playwright/test");

const games = [
  { id: "runner", path: "/SowaRunner/", title: "SowaRunner", feature: "Serie i wyzwanie dnia SowaRunner" },
  { id: "jumper", path: "/SowaJumper/", title: "SowaJumper", feature: "Precyzja i wyzwanie dnia SowaJumper" },
  { id: "sowa3", path: "/Sowa3/", title: "Sowa3", feature: "Combo i wyzwanie dnia Sowa3" },
  { id: "ogrody", path: "/SowieOgrody/", title: "Sowie Ogrody", feature: "Kontrakty ogrodnicze" },
  { id: "szklarnia", path: "/SowiaSzklarnia/", title: "Sowia Szklarnia", feature: "Album cech i cele laboratorium" },
];

function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("favicon.ico")) errors.push(`console: ${message.text()}`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400 && !response.url().includes("favicon.ico")) {
      errors.push(`http ${response.status()}: ${response.url()}`);
    }
  });
  return errors;
}

test("menu oferuje osobną instrukcję każdej gry i Sowią Akademię", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?seed=guides-menu&testNow=1783656000000", { waitUntil: "load" });

  await expect(page.locator(".game-card")).toHaveCount(5);
  await expect(page.locator("[data-game-guide]")).toHaveCount(5);
  await expect(page.locator("#academyButton")).toBeVisible();

  await page.locator('[data-game-guide="runner"]').click();
  await expect(page.getByRole("dialog")).toContainText("Instrukcja — SowaRunner");
  await expect(page.getByRole("dialog")).toContainText("Jak grać");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
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

  await page.locator("#academyButton").click();
  await expect(page.getByRole("dialog")).toContainText("Sowia Akademia");
  await expect(page.getByRole("dialog")).toContainText("Misje dzienne");
  expect(errors).toEqual([]);
});
