// Testy startowe na profilach telefonów (Analiza 3, E0.2).
const { test, expect, watchErrors } = require("../fixtures");

const pages = [
  { name: "Menu główne", path: "/", marker: ".game-card" },
  { name: "Sowia Ucieczka", path: "/SowiaUcieczka/", marker: "[data-stage] canvas" },
  { name: "Sowa w Chmurach", path: "/SowaWChmurach/", marker: "[data-stage] canvas" },
  { name: "Sowie Tory", path: "/SowieTory/", marker: "[data-stage] canvas" },
  { name: "Sowie Ogrody", path: "/SowieOgrody/", marker: "[data-canvas]" },
  { name: "Łącz i Hoduj", path: "/LaczIHoduj/", marker: "[data-canvas]" },
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

// Stare adresy gier (SowaRunner/, Sowa3/, SowaJumper/, SowiaSzklarnia/, SowieOgrody/nowa.html) przekierowywały do
// nowych gier (E4f–E8e) — usunięte w zadaniu 9.5 (2026-11-02); test architektury pilnuje, że ich nie ma.

test("menu główne mieści się w szerokości telefonu", async ({ page }) => {
  await page.goto("/?seed=telefon-szerokosc", { waitUntil: "load" });
  await expect(page.locator(".game-card").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
