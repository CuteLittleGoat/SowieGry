// Testy startowe na profilach telefonów (Analiza 3, E0.2).
const { test, expect, watchErrors } = require("../fixtures");

const pages = [
  { name: "Menu główne", path: "/", marker: ".game-card" },
  { name: "Sowia Ucieczka", path: "/SowiaUcieczka/", marker: "[data-stage] canvas" },
  { name: "SowaJumper", path: "/SowaJumper/", marker: "#game" },
  { name: "Sowie Tory", path: "/SowieTory/", marker: "[data-stage] canvas" },
  { name: "Sowie Ogrody", path: "/SowieOgrody/", marker: "#gardenCanvas" },
  { name: "Sowia Szklarnia", path: "/SowiaSzklarnia/", marker: "#greenhouseCanvas" },
];

for (const entry of pages) {
  test(`${entry.name} otwiera się na telefonie bez błędów`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(`${entry.path}?seed=telefon-start&testNow=1783656000000`, { waitUntil: "load" });
    await expect(page.locator(entry.marker).first()).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
}

// SowaRunner zastąpiła Sowia Ucieczka (E4f): stare adresy i zakładki prowadzą do nowej gry z parametrami adresu.
test("stary adres SowaRunner przekierowuje do Sowiej Ucieczki z parametrami", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/SowaRunner/?daily=1", { waitUntil: "load" });
  await expect(page).toHaveURL(/\/SowiaUcieczka\/\?daily=1$/);
  await expect(page.getByRole("heading", { name: "Sowia Ucieczka" })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("[data-daily-note]")).toBeVisible();
  expect(errors).toEqual([]);
});

// Sowa3 zastąpiły Sowie Tory (E5f): stary adres prowadzi do nowej gry z parametrami (tu: plansza 2).
test("stary adres Sowa3 przekierowuje do Sowich Torów z parametrami", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/Sowa3/?plansza=2&seed=przekierowanie", { waitUntil: "load" });
  await expect(page).toHaveURL(/\/SowieTory\/\?plansza=2&seed=przekierowanie$/);
  await expect(page.getByRole("heading", { name: "Sowie Tory" })).toBeVisible({ timeout: 15_000 });
  await page.waitForFunction(() => window.SowieTory?.ready?.(), null, { timeout: 15_000 });
  await page.locator("[data-start]").click();
  await expect(page.locator(".tory-progress")).toContainText("2/4");
  expect(errors).toEqual([]);
});

test("menu główne mieści się w szerokości telefonu", async ({ page }) => {
  await page.goto("/?seed=telefon-szerokosc", { waitUntil: "load" });
  await expect(page.locator(".game-card").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
