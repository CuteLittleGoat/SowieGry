// Sowie Laboratorium, dział „Postacie”: atlas grafik z SVG, czcionka Fredoka i podgląd garderoby na telefonie.
const { test, expect, waitForCloud, watchErrors } = require("../fixtures");

test("postacie z atlasu są narysowane, a garderoba zmienia dodatek na animowanej sowie", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/lab/?seed=postacie", { waitUntil: "load" });
  await waitForCloud(page);
  await expect(page.getByRole("button", { name: "Postacie" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-characters-status]")).toContainText("Atlas gotowy", { timeout: 15000 });

  // Wszystkie grafiki z katalogu są w atlasie.
  const missing = await page.evaluate(async () => {
    const { SPRITES } = await import("../shared/world/catalog.js");
    return Object.keys(SPRITES).filter((name) => !window.SowieLab.atlas.has(name));
  });
  expect(missing).toEqual([]);
  expect(await page.evaluate(() => window.SowieLab.atlas.names().length)).toBeGreaterThanOrEqual(50);

  // Czcionka Fredoka z polskimi znakami jest wczytana (napisy w atlasie i nagłówki).
  expect(await page.evaluate(() => document.fonts.check('700 16px "Fredoka"', "Zażółć"))).toBe(true);

  // Każdy dział ma narysowane piksele (nie jest pusty).
  for (const section of ["sowka", "garderoba", "kozki", "humbak", "pracu", "amic", "liscie"]) {
    const canvas = page.locator(`[data-section="${section}"] canvas`);
    await canvas.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        canvas.evaluate((node) => {
          const data = node.getContext("2d").getImageData(0, 0, node.width, node.height).data;
          let painted = 0;
          for (let index = 3; index < data.length; index += 16) if (data[index] > 200) painted += 1;
          return painted;
        }),
      )
      .toBeGreaterThan(500);
  }

  // Wybór dodatku z garderoby (przyciski ≥ 44 px).
  const chip = page.getByRole("button", { name: "Kokardka" });
  await chip.scrollIntoViewIfNeeded();
  expect((await chip.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await chip.tap();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Bez dodatku" })).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => window.SowieLab.characters.cosmetic())).toBe("bow");

  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});
