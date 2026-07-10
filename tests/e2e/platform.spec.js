const { test, expect } = require("@playwright/test");

function watchRuntimeErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("favicon.ico")) errors.push(message.text());
  });
  return errors;
}

test("migracja profilu zachowuje postęp i tworzy kopię", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "sowieGryProfile",
      JSON.stringify({
        version: 1,
        unlockedCosmetics: ["none", "bow", "glasses"],
        selectedCosmetic: "glasses",
        settings: { music: false },
        stats: { leaves: 123 },
      }),
    );
  });

  await page.goto("/SowaJumper/?seed=migration", { waitUntil: "load" });
  const result = await page.evaluate(() => ({
    profile: JSON.parse(localStorage.getItem("sowieGryProfile")),
    backups: Object.keys(localStorage).filter((key) => key.startsWith("sowieGryBackup:sowieGryProfile")),
  }));

  expect(result.profile.schemaVersion).toBe(2);
  expect(result.profile.stats.leaves).toBe(123);
  expect(result.profile.selectedCosmetic).toBe("glasses");
  expect(result.profile.settings.music).toBe(false);
  expect(result.backups.length).toBeGreaterThan(0);
});

for (const idleGame of [
  { path: "/SowieOgrody/", button: "#clickButton", key: "sowieOgrodySave" },
  { path: "/SowiaSzklarnia/", button: "#clickButton", key: "sowiaSzklarniaSave" },
]) {
  test(`${idleGame.key} zapisuje i odtwarza stan`, async ({ page }) => {
    const errors = watchRuntimeErrors(page);
    await page.goto(`${idleGame.path}?seed=persistence`, { waitUntil: "load" });
    await page.locator(idleGame.button).click({ clickCount: 3 });
    await page.evaluate(() => window.SowieIdleSave.requestSave("test"));

    const beforeReload = await page.evaluate((key) => localStorage.getItem(key), idleGame.key);
    expect(beforeReload).toBeTruthy();
    const savedAt = JSON.parse(beforeReload).lastSavedAt;

    await page.reload({ waitUntil: "load" });
    const afterReload = await page.evaluate((key) => localStorage.getItem(key), idleGame.key);
    expect(afterReload).toBeTruthy();
    expect(JSON.parse(afterReload).lastSavedAt).toBeGreaterThanOrEqual(savedAt);
    expect(errors).toEqual([]);
  });
}

test("panel szklarni zachowuje fokus podczas cyklicznego odświeżania", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/SowiaSzklarnia/?seed=focus", { waitUntil: "load" });
  await expect(page.locator("#panelContent")).toHaveAttribute("data-stable-panel", "true");

  const saveButton = page.locator("#panelContent [data-save]");
  await expect(saveButton).toBeVisible();
  await saveButton.focus();
  await expect(saveButton).toBeFocused();
  await page.waitForTimeout(1600);
  await expect(saveButton).toBeFocused();
  expect(errors).toEqual([]);
});

test("modal wspólny przechwytuje fokus, zamyka się Escape i przywraca fokus", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/SowaJumper/?seed=modal", { waitUntil: "load" });
  const opener = page.locator("[data-settings]");
  await opener.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.querySelector(".sowie-modal-backdrop")?.contains(document.activeElement)))
    .toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  expect(errors).toEqual([]);
});

test("eksport i import zapisu odtwarza profil", async ({ page }) => {
  await page.goto("/Sowa3/?seed=export", { waitUntil: "load" });
  const restored = await page.evaluate(() => {
    const profile = window.SowiePlatform.readProfile();
    profile.stats.leaves = 987;
    window.SowiePlatform.writeProfile(profile);
    const backup = window.SowiePlatform.exportData();
    localStorage.removeItem("sowieGryProfile");
    window.SowiePlatform.importData(backup);
    return window.SowiePlatform.readProfile().stats.leaves;
  });
  expect(restored).toBe(987);
});

test("preferencja ograniczenia ruchu wyłącza animacje", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "load" });
  const duration = await page.locator(".creature").first().evaluate((element) => getComputedStyle(element).animationDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.01);
});
