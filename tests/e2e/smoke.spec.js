const { test, expect, waitForCloud } = require("./fixtures");

const games = [
  {
    // Sowia Ucieczka (E4, zastąpiła SowaRunner): moduły ES, bez SowieCore; Spacja na ekranie tytułowym startuje bieg.
    id: "runner",
    name: "Sowia Ucieczka",
    path: "/SowiaUcieczka/",
    marker: "[data-stage] canvas",
    action: "keyboard",
    started: "window.SowiaUcieczka.screen() === 'playing'",
    ready: "window.SowiaUcieczka?.ready?.() === true",
    core: false,
  },
  {
    // Sowa w Chmurach (E6, zastąpiła SowaJumper): moduły ES, bez SowieCore; przycisk „Graj” na ekranie tytułowym.
    id: "jumper",
    name: "Sowa w Chmurach",
    path: "/SowaWChmurach/",
    marker: "[data-stage] canvas",
    action: "[data-start]",
    started: "window.SowaWChmurach.screen() === 'playing'",
    ready: "window.SowaWChmurach?.ready?.() === true",
    core: false,
  },
  {
    // Sowie Tory (E5, zastąpiły Sowa3): moduły ES, bez SowieCore; przycisk „Graj” na ekranie tytułowym.
    id: "sowa3",
    name: "Sowie Tory",
    path: "/SowieTory/",
    marker: "[data-stage] canvas",
    action: "[data-start]",
    started: "window.SowieTory.screen() === 'playing'",
    ready: "window.SowieTory?.ready?.() === true",
    core: false,
  },
  {
    // Nowa odsłona Sowich Ogrodów (E7, od E7e w SowieOgrody/index.html): stuknięcie w ogród zbiera liście.
    id: "ogrody",
    name: "Sowie Ogrody",
    path: "/SowieOgrody/",
    marker: "[data-canvas]",
    action: "[data-canvas]",
    started: "window.SowieOgrody.state().stats.taps >= 1",
    ready: "window.SowieOgrody?.ready?.() === true",
    core: false,
  },
  {
    id: "szklarnia",
    name: "Sowia Szklarnia",
    path: "/SowiaSzklarnia/",
    marker: "#greenhouseCanvas",
    action: "#clickButton",
    started: "window.SowieIdleGame.snapshot().stats.clicks === 1",
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
    .poll(() =>
      page.evaluate((core) => Boolean(window.SowiePlatform && (!core || window.SowieCore)), game.core !== false),
    )
    .toBe(true);
  await waitForCloud(page);
  if (game.ready) await page.waitForFunction(game.ready);
  return errors;
}

test("menu główne jest generowane z rejestru pięciu gier", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/?seed=menu-audit", { waitUntil: "load" });
  const cards = page.locator(".game-card");
  await expect(cards).toHaveCount(5);
  const menuText = (await cards.allTextContents()).join(" ");
  for (const game of games) expect(menuText).toContain(game.name);
  await expect(page.getByRole("tab", { name: "Gry" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab")).toHaveCount(4);
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
    // Rozgrywka ruszyła po wczytaniu postępu z SowieCloud (tu: tryb pamięci).
    await expect.poll(() => page.evaluate(game.started)).toBe(true);
    const profile = await page.evaluate(() => window.SowieCloud.profile());
    expect(profile.schemaVersion).toBe(1);
    expect(profile.cosmetics.selected).toBe("none");
    expect(errors).toEqual([]);
  });
}

test("gry używają wspólnego menedżera powiadomień", async ({ page }) => {
  // Wspólny menedżer powiadomień mają już tylko dawne gry idle (SowieCore).
  const errors = await openGame(
    page,
    games.find((game) => game.id === "szklarnia"),
  );
  await page.evaluate(() => window.SowieCore.toast({ text: "Test", amount: 1, mergeKey: "audit" }));
  await page.evaluate(() => window.SowieCore.toast({ text: "Test", amount: 2, mergeKey: "audit" }));
  // Dawna Szklarnia może przy starcie trzymać komunikaty w kolejce (np. za oknem „Sowa doglądała szklarni”) —
  // liczy się jeden scalony wpis (widoczny albo w kolejce).
  const merged = await page.evaluate(() => {
    const { visible, queued } = window.SowieNotifications.getState();
    return [...visible, ...queued].filter((text) => text.startsWith("Test"));
  });
  expect(merged).toEqual(["Test ×2 — łącznie +3"]);
  expect(errors).toEqual([]);
});
