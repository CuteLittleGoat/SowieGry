// Wersja demo (E10, uwaga właściciela G2): demo.html z własnym menu, bez hasła, bez zapisu (pamięć strony, nic
// w localStorage), bez Akademii i Galerii, bez wyboru poziomu trudności; „Menu” w grze wraca do demo.
const { test, expect, newDevice, watchErrors } = require("../fixtures");

// Urządzenie bez wpisanego hasła — w pełnej wersji pokazałby się ekran „Hasło sowy”.
async function lockedDevice(browser, testInfo) {
  const { context, blocked } = await newDevice(browser, testInfo.project.use, { unlocked: false });
  return { context, blocked, page: await context.newPage() };
}

test("demo.html: własne menu bez hasła, karty z „?demo=1”, instrukcja, muzyka; „Menu” w grze wraca do demo", async ({
  browser,
}, testInfo) => {
  const { context, blocked, page } = await lockedDevice(browser, testInfo);
  const errors = watchErrors(page);
  await page.goto("/demo.html", { waitUntil: "load" });
  await expect(page.locator(".game-card")).toHaveCount(5);
  await expect(page.locator(".demo-badge")).toHaveText("Wersja demo");
  await expect(page.getByRole("dialog", { name: "Hasło sowy" })).toHaveCount(0);
  await expect(page.locator("[data-demo-note]")).toContainText("Bez logowania i bez zapisu");
  await expect(page.locator('[data-play="runner"]')).toHaveAttribute("href", "SowiaUcieczka/?demo=1");
  await expect(page.locator('[data-play="szklarnia"]')).toHaveAttribute("href", "LaczIHoduj/?demo=1");
  await expect(page.locator(".game-card-record").first()).toBeHidden();
  await expect(page.locator(".game-card-new").first()).toBeHidden();
  await expect(page.locator(".menu-tabs")).toHaveCount(0);
  await page.waitForFunction(() => window.SowieDemo?.atlas?.ready?.());

  // Instrukcja gry jak w menu głównym.
  await page.locator('[data-guide="sowa3"]').click();
  const guide = page.getByRole("dialog", { name: "Jak grać — Sowie Tory" });
  await expect(guide).toBeVisible();
  await guide.getByRole("button", { name: "Rozumiem" }).click();
  await expect(guide).toBeHidden();

  // Wyciszenie muzyki menu.
  const sound = page.locator("[data-demo-sound]");
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await expect(sound).toHaveAccessibleName("Muzyka w menu: wyłączona");

  // Gra w demo: bez hasła, bez wyboru poziomu trudności i wyzwania dnia, bez Akademii i Galerii.
  await page.locator('[data-play="runner"]').click();
  await expect(page).toHaveURL(/\/SowiaUcieczka\/\?demo=1$/);
  await page.waitForFunction(() => window.SowiaUcieczka?.ready?.(), null, { timeout: 20_000 });
  await expect(page.getByRole("dialog", { name: "Hasło sowy" })).toHaveCount(0);
  await expect(page.locator("[data-difficulty]")).toBeHidden();
  await expect(page.locator("[data-daily]")).toBeHidden();
  await expect(page.locator("[data-start]")).toBeVisible();
  expect(
    await page.evaluate(() => ({
      demo: window.SowieCloud.demo,
      mode: window.SowieCloud.mode(),
      academy: typeof window.SowieAcademy,
      gallery: typeof window.SowieOwlGallery,
      demoClass: document.documentElement.classList.contains("sowie-demo"),
    })),
  ).toEqual({ demo: true, mode: "memory", academy: "undefined", gallery: "undefined", demoClass: true });

  // „Menu” (odnośnik do menu głównego) w karcie demo prowadzi do demo.html.
  await page.getByRole("link", { name: "Menu" }).click();
  await expect(page).toHaveURL(/\/demo\.html$/);
  await expect(page.locator(".game-card")).toHaveCount(5);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  expect(await page.evaluate(() => sessionStorage.getItem("sowiegry:demo"))).toBe("1");

  // ?demo=0 wyłącza demo w tej karcie: pełna wersja z ekranem hasła.
  await page.goto("/?demo=0", { waitUntil: "load" });
  await expect(page.getByRole("dialog", { name: "Hasło sowy" })).toBeVisible();
  expect(blocked).toEqual([]);
  expect(errors).toEqual([]);
  await context.close();
});

const GAMES = [
  ["Sowie Tory", "/SowieTory/", "SowieTory"],
  ["Sowa w Chmurach", "/SowaWChmurach/", "SowaWChmurach"],
  ["Sowie Ogrody", "/SowieOgrody/", "SowieOgrody"],
  ["Łącz i Hoduj", "/LaczIHoduj/", "LaczIHoduj"],
];

for (const [name, path, api] of GAMES) {
  test(`${name} w wersji demo: bez hasła, tylko pamięć (także przy ?cloud=emulator), nic w localStorage`, async ({
    browser,
  }, testInfo) => {
    const { context, blocked, page } = await lockedDevice(browser, testInfo);
    const errors = watchErrors(page);
    await page.goto(`${path}?demo=1&cloud=emulator`, { waitUntil: "load" });
    await page.waitForFunction((key) => window[key]?.ready?.(), api, { timeout: 20_000 });
    await expect(page.getByRole("dialog", { name: "Hasło sowy" })).toHaveCount(0);
    for (const node of await page.locator("[data-difficulty], [data-modes]").all()) await expect(node).toBeHidden();
    expect(
      await page.evaluate(() => ({
        demo: window.SowieCloud.demo,
        mode: window.SowieCloud.mode(),
        academy: typeof window.SowieAcademy,
        storage: Object.keys(localStorage),
      })),
    ).toEqual({ demo: true, mode: "memory", academy: "undefined", storage: [] });
    expect(blocked).toEqual([]);
    expect(errors).toEqual([]);
    await context.close();
  });
}
