const { test, expect, waitForCloud } = require("./fixtures");
const { cloudUrl, readDoc, seedDoc, uniqueProject } = require("./emulator");

function watchRuntimeErrors(page) {
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

test("Galeria Sów w menu: odblokowane i zablokowane zdjęcia, przeglądarka, ulubione i tło menu", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/?seed=owl-gallery&testNow=1783656000000", { waitUntil: "load" });
  await waitForCloud(page);

  await page.getByRole("tab", { name: "Galeria" }).click();
  const panel = page.locator("#galeria");
  await expect(panel.locator("[data-gallery-count]")).toHaveText("1 / 30");
  await expect(panel.locator(".menu-tile")).toHaveCount(30);
  await expect(panel.locator(".menu-tile.is-locked")).toHaveCount(29);
  // Zablokowane: wymaganie i pasek postępu; siatka używa miniatur WebP zamiast pełnych zdjęć.
  await expect(panel.locator(".menu-tile.is-locked [role=progressbar]")).toHaveCount(29);
  await expect(panel.locator('[data-photo="owl-02"] .menu-tile-need')).not.toBeEmpty();
  await expect(panel.locator('[data-photo="owl-01"] img')).toHaveAttribute("src", /gallery-thumbs\/.+-400\.webp$/);
  await expect(panel.locator('[data-open-photo="owl-01"]')).toHaveClass(/is-new/);

  await panel.getByRole("button", { name: "Do zdobycia" }).click();
  await expect(panel.locator(".menu-tile")).toHaveCount(29);
  await panel.getByRole("button", { name: "Odblokowane" }).click();
  await expect(panel.locator(".menu-tile")).toHaveCount(1);
  await panel.getByRole("button", { name: "Wszystkie" }).click();

  const tile = panel.locator('[data-open-photo="owl-01"]');
  await tile.click();
  const viewer = page.getByRole("dialog", { name: /^Zdjęcie: / });
  await expect(viewer).toBeVisible();
  await expect(viewer.locator("[data-viewer-count]")).toHaveText("1 / 1");
  await expect(viewer.getByRole("link", { name: "źródło: Pexels" })).toHaveAttribute(
    "href",
    /pexels\.com\/photo\/13681325/,
  );
  await viewer.getByRole("button", { name: "Ulubione" }).click();
  await expect(viewer.getByRole("button", { name: "Ulubione" })).toHaveAttribute("aria-pressed", "true");
  await viewer.getByRole("button", { name: "Tło menu" }).click();
  await expect(page.locator("body")).toHaveClass(/has-photo/);

  // Stan galerii jest w profilu SowieCloud (profil.gallery).
  const saved = await page.evaluate(() => window.SowieCloud.profile().gallery);
  expect(saved.favorite).toBe("owl-01");
  expect(saved.background).toBe("owl-01");
  expect(saved.viewed).toContain("owl-01");

  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
  await expect(tile).toBeFocused();
  await expect(tile).not.toHaveClass(/is-new/);
  await expect(tile.locator(".menu-tile-heart")).toBeVisible();
  expect(errors).toEqual([]);
});

test("osiągnięcia Akademii z Firestore trwale odblokowują komplet trzydziestu fotografii", async ({
  page,
}, testInfo) => {
  // Profil zapisany wcześniej w bazie (emulator) — jak postęp z innego urządzenia.
  const project = uniqueProject(testInfo);
  await seedDoc(project, "sowiegry/profil", {
    schemaVersion: 1,
    academy: {
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
    },
  });

  const errors = watchRuntimeErrors(page);
  await page.goto(cloudUrl("/?seed=owl-unlocks&testNow=1783656000000", project), { waitUntil: "load" });
  await waitForCloud(page);
  await page.getByRole("tab", { name: "Galeria" }).click();
  const panel = page.locator("#galeria");

  await expect(panel.locator("[data-gallery-count]")).toHaveText("30 / 30");
  await expect(panel.locator(".menu-tile.is-locked")).toHaveCount(0);
  await expect(panel.locator("[data-open-photo] img")).toHaveCount(30);

  // Przeglądarka przechodzi między odblokowanymi zdjęciami (strzałki na klawiaturze, przyciski).
  await panel.locator('[data-open-photo="owl-01"]').click();
  const viewer = page.getByRole("dialog", { name: /^Zdjęcie: / });
  await expect(viewer.locator("[data-viewer-count]")).toHaveText("1 / 30");
  await page.keyboard.press("ArrowRight");
  await expect(viewer.locator("[data-viewer-count]")).toHaveText("2 / 30");
  await viewer.getByRole("button", { name: "Poprzednie zdjęcie" }).click();
  await viewer.getByRole("button", { name: "Poprzednie zdjęcie" }).click();
  await expect(viewer.locator("[data-viewer-count]")).toHaveText("30 / 30");
  await viewer.getByRole("button", { name: "Zamknij zdjęcie" }).click();
  await expect(viewer).toBeHidden();

  await page.evaluate(() => window.SowieCloud.flush());
  const profile = await readDoc(project, "sowiegry/profil");
  expect(profile.gallery.unlocked).toHaveLength(30);
  expect(profile.academy.xp).toBeGreaterThanOrEqual(6000);
  expect(errors).toEqual([]);
});

// Obecne gry mają przycisk Galerii w doku; przebudowane (Sowia Ucieczka) — Galerię w zakładce menu głównego.
test("Galeria Sów jest dostępna bezpośrednio z każdej obecnej gry", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  const paths = ["/SowaJumper/", "/Sowa3/", "/SowieOgrody/", "/SowiaSzklarnia/"];

  for (const [index, path] of paths.entries()) {
    await page.goto(`${path}?seed=gallery-game-${index}&testNow=1783656000000`, { waitUntil: "load" });
    await waitForCloud(page);
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
