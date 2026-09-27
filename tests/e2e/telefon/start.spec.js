// Testy startowe na profilach telefonów (Analiza 3, E0.2).
const { test, expect, watchErrors } = require("../fixtures");

const pages = [
  { name: "Menu główne", path: "/", marker: ".game-card" },
  { name: "SowaRunner", path: "/SowaRunner/", marker: "canvas" },
  { name: "SowaJumper", path: "/SowaJumper/", marker: "#game" },
  { name: "Sowa3", path: "/Sowa3/", marker: "#game" },
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

test("menu główne mieści się w szerokości telefonu", async ({ page }) => {
  await page.goto("/?seed=telefon-szerokosc", { waitUntil: "load" });
  await expect(page.locator(".game-card").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
