const { test, expect } = require("@playwright/test");

const games = [
  { id: "runner", name: "SowaRunner", path: "/SowaRunner/", marker: "canvas", action: "keyboard" },
  { id: "jumper", name: "SowaJumper", path: "/SowaJumper/", marker: "#game", action: "keyboard" },
  { id: "sowa3", name: "Sowa3", path: "/Sowa3/", marker: "#game", action: "keyboard" },
  { id: "ogrody", name: "Sowie Ogrody", path: "/SowieOgrody/", marker: "#gardenCanvas", action: "#clickButton" },
  {
    id: "szklarnia",
    name: "Sowia Szklarnia",
    path: "/SowiaSzklarnia/",
    marker: "#greenhouseCanvas",
    action: "#clickButton",
  },
];

function watchRuntimeErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (!text.includes("favicon.ico")) errors.push(`console: ${text}`);
  });
  page.on("response", (response) => {
    if (response.status() < 400 || response.url().includes("favicon.ico")) return;
    errors.push(`http ${response.status()}: ${response.url()}`);
  });
  return errors;
}

async function openGame(page, game) {
  const errors = watchRuntimeErrors(page);
  await page.goto(`${game.path}?seed=${game.id}-audit&testNow=1783656000000`, { waitUntil: "load" });
  await expect(page.locator(game.marker).first()).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(() => page.evaluate(() => Boolean(window.SowiePlatform && window.SowieCore)))
    .toBe(true);
  return errors;
}

test("menu główne jest generowane z rejestru pięciu gier", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/?seed=menu-audit", { waitUntil: "load" });
  await expect(page.locator(".game-card")).toHaveCount(5);
  await expect(page.locator(".game-card").allTextContents()).resolves.toEqual(
    expect.arrayContaining(games.map((game) => expect.stringContaining(game.name))),
  );
  await expect(page.locator("#cosmeticsButton")).toBeVisible();
  expect(errors).toEqual([]);
});

for (const game of games) {
  test(`${game.name} uruchamia się i reaguje na podstawową akcję`, async ({ page }) => {
    const errors = await openGame(page, game);

    if (game.action === "keyboard") {
      await page.keyboard.press("Space");
      await page.keyboard.press("ArrowRight");
    } else {
      await page.locator(game.action).click();
    }

    await page.waitForTimeout(700);
    const profile = await page.evaluate(() => JSON.parse(localStorage.getItem("sowieGryProfile") || "null"));
    expect(profile?.schemaVersion).toBe(2);
    expect(errors).toEqual([]);
  });
}

test("gry używają wspólnego menedżera powiadomień", async ({ page }) => {
  const errors = await openGame(page, games[1]);
  await page.evaluate(() => window.SowieCore.toast({ text: "Test", amount: 1, mergeKey: "audit" }));
  await page.evaluate(() => window.SowieCore.toast({ text: "Test", amount: 2, mergeKey: "audit" }));
  await expect(page.locator(".sowie-notification-stack .sowie-toast")).toHaveCount(1);
  await expect(page.locator(".sowie-notification-stack .sowie-toast")).toContainText("łącznie +3");
  expect(errors).toEqual([]);
});
