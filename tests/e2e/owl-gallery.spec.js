const { test, expect } = require("@playwright/test");

function watchRuntimeErrors(page) {
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

test("Galeria Sów pokazuje nagrody, źródło i zapisuje ulubioną fotografię", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/?seed=owl-gallery&testNow=1783656000000", { waitUntil: "load" });

  const opener = page.getByRole("button", { name: "Otwórz Galerię Sów" });
  await expect(opener).toBeVisible();
  await opener.click();

  const dialog = page.getByRole("dialog", { name: "🖼️ Galeria Sów" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("[data-gallery-progress]")).toHaveText("1/30 odblokowanych");
  await expect(dialog.locator("[data-gallery-photo]")).toHaveCount(30);
  await expect(dialog.locator(".sowie-gallery-card.is-locked")).toHaveCount(29);
  await expect(dialog.locator(".sowie-gallery-thumb img")).toHaveCount(1);

  await dialog.locator("[data-gallery-open='owl-01']").click();
  await expect(dialog.locator(".sowie-gallery-detail img")).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Pexels" })).toHaveAttribute("href", /pexels\.com\/photo\/13681325/);
  await dialog.getByRole("button", { name: "☆ Ustaw jako ulubioną" }).click();

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("sowieOwlGallery") || "null"));
  expect(saved.favorite).toBe("owl-01");
  expect(saved.viewed).toContain("owl-01");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  expect(errors).toEqual([]);
});

test("osiągnięcia Akademii trwale odblokowują komplet trzydziestu fotografii", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "sowieGryAcademy",
      JSON.stringify({
        version: 2,
        xp: 6000,
        feathers: 150,
        metrics: {
          runnerDistance: 6000,
          runnerScore: 6000,
          runnerLeafChain: 20,
          runnerVisits: 1,
          jumperHeight: 1000,
          jumperScore: 5000,
          jumperStreak: 20,
          jumperVisits: 1,
          sowa3Score: 6000,
          sowa3Combo: 20,
          sowa3Finishes: 3,
          sowa3Visits: 1,
          ogrodyLeaves: 50000,
          ogrodyClicks: 500,
          ogrodyBuys: 100,
          ogrodyWatering: 50,
          ogrodyPlants: 100,
          ogrodyPrestiges: 2,
          ogrodyVisits: 1,
          szklarniaRooms: 10,
          szklarniaPlants: 30,
          szklarniaGoats: 20,
          szklarniaHybrids: 5,
          szklarniaVisits: 1,
        },
        daily: null,
        weekly: null,
        awards: {},
      }),
    );
  });

  const errors = watchRuntimeErrors(page);
  await page.goto("/?seed=owl-unlocks&testNow=1783656000000", { waitUntil: "load" });
  await page.getByRole("button", { name: "Otwórz Galerię Sów" }).click();
  const dialog = page.getByRole("dialog", { name: "🖼️ Galeria Sów" });

  await expect(dialog.locator("[data-gallery-progress]")).toHaveText("30/30 odblokowanych");
  await expect(dialog.locator(".sowie-gallery-card.is-locked")).toHaveCount(0);
  await expect(dialog.locator(".sowie-gallery-thumb img")).toHaveCount(30);

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("sowieOwlGallery") || "null"));
  expect(saved.unlocked).toHaveLength(30);
  expect(errors).toEqual([]);
});

test("Galeria Sów jest dostępna bezpośrednio z każdej gry", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  const paths = ["/SowaRunner/", "/SowaJumper/", "/Sowa3/", "/SowieOgrody/", "/SowiaSzklarnia/"];

  for (const [index, path] of paths.entries()) {
    await page.goto(`${path}?seed=gallery-game-${index}&testNow=1783656000000`, { waitUntil: "load" });
    const opener = page.locator("[data-gallery-fab]");
    await expect(opener).toBeVisible({ timeout: 15_000 });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "🖼️ Galeria Sów" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-gallery-photo]")).toHaveCount(30);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }

  expect(errors).toEqual([]);
});
