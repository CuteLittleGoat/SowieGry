const { test, expect, waitForCloud, setVisibility, watchErrors, DEVICE_KEY } = require("./fixtures");
const { cloudUrl, readDoc, uniqueProject } = require("./emulator");

test.describe("pierwsze uruchomienie nowej wersji", () => {
  test.use({ odblokowane: false });

  test("kasuje wyłącznie stare klucze SowieGry, a dane innych stron zostają", async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem("przygotowane")) return;
      sessionStorage.setItem("przygotowane", "1");
      const old = {
        sowieGryProfile: "{}",
        sowieGryMigrationsVersion: "2",
        sowieGryAcademy: "{}",
        sowieOwlGallery: "{}",
        sowaRunnerBestScore: "10",
        sowaJumperDifficulty: "chaos",
        sowa3FinishSeen: "1",
        sowieOgrodySave: "{}",
        sowiaSzklarniaSave: "{}",
        sowieSzklarniaTraitAlbum: "{}",
        "sowieGryBackup:sowieGryProfile:v1": "{}",
        "sowieExpansion:ogrody:2026-09-27": "{}",
        "sowieDailyBest:2026-09-27:runner:distance": "5",
        dataslate: "dane drugiego projektu",
        "character_builder:karta": "dane drugiego projektu",
      };
      for (const [key, value] of Object.entries(old)) localStorage.setItem(key, value);
    });

    await page.goto("/?seed=cleanup", { waitUntil: "load" });
    await expect(page.getByRole("dialog", { name: "Hasło sowy" })).toBeVisible();
    const keys = await page.evaluate(() => Object.keys(localStorage).sort());
    expect(keys).toEqual(["character_builder:karta", "dataslate", "sowiegry:urzadzenie"]);
    const device = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), DEVICE_KEY);
    expect(device.unlocked).toBe(false);
    expect(device.cleaned).toBe(true);
    expect(device.deviceId).toMatch(/^d-[0-9a-z]{6}$/);
  });
});

for (const idleGame of [
  { id: "ogrody", path: "/SowieOgrody/" },
  { id: "szklarnia", path: "/SowiaSzklarnia/" },
]) {
  test(`${idleGame.id}: stan gry zapisuje się w Firestore i wraca po przeładowaniu`, async ({ page }, testInfo) => {
    const project = uniqueProject(testInfo);
    const errors = watchErrors(page);
    await page.goto(cloudUrl(`${idleGame.path}?seed=persistence`, project), { waitUntil: "load" });
    await waitForCloud(page);
    await page.locator("#clickButton").click({ clickCount: 3 });
    await expect.poll(() => page.evaluate(() => window.SowieIdleGame.snapshot().stats.clicks)).toBe(3);

    // Przejście do innej aplikacji: gra zapisuje stan, a SowieCloud wysyła go od razu.
    await setVisibility(page, "hidden");
    await expect
      .poll(async () =>
        JSON.parse((await readDoc(project, `sowiegry/profil/sowiegry_gry/${idleGame.id}`))?.state || "{}"),
      )
      .toMatchObject({ stats: { clicks: 3 } });

    await page.reload({ waitUntil: "load" });
    await waitForCloud(page);
    await expect.poll(() => page.evaluate(() => window.SowieIdleGame.snapshot().stats.clicks)).toBe(3);
    const doc = await readDoc(project, `sowiegry/profil/sowiegry_gry/${idleGame.id}`);
    expect(doc.rev).toBeGreaterThanOrEqual(1);
    expect(doc.deviceId).toMatch(/^d-/);
    expect(typeof doc.savedAt).toBe("number");
    expect(errors).toEqual([]);
  });
}

test("panel szklarni zachowuje fokus podczas cyklicznego odświeżania", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/SowiaSzklarnia/?seed=focus", { waitUntil: "load" });
  await waitForCloud(page);
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
  const errors = watchErrors(page);
  await page.goto("/SowaJumper/?seed=modal", { waitUntil: "load" });
  await waitForCloud(page);
  const opener = page.getByRole("button", { name: "Ustawienia", exact: true });
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

test("ustawienia zapisują się w profilu, pokazują stan zapisu i pozwalają wylogować urządzenie", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await page.goto(cloudUrl("/SowaJumper/?seed=settings", project), { waitUntil: "load" });
  await waitForCloud(page);
  await page.getByRole("button", { name: "Ustawienia", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Ustawienia" });
  await expect(dialog).toContainText("Zapis postępu");
  await expect(dialog.locator("[data-cloud-status]")).toHaveText(/zapisano w chmurze|zapisywanie/);
  await expect(dialog).not.toContainText("Eksportuj");
  await expect(dialog).not.toContainText("Importuj");

  await dialog.locator(".sowie-setting-row", { hasText: "Muzyka" }).getByRole("button").click();
  await expect.poll(async () => (await readDoc(project, "sowiegry/profil"))?.settings?.music).toBe(false);

  await dialog.getByRole("button", { name: "Wyloguj to urządzenie" }).click();
  await expect(page.getByRole("dialog", { name: "Hasło sowy" })).toBeVisible();
  const device = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), DEVICE_KEY);
  expect(device.unlocked).toBe(false);
  expect(errors).toEqual([]);
});

test("preferencja ograniczenia ruchu wyłącza animacje", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "load" });
  const duration = await page
    .locator(".menu-cloud")
    .first()
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.01);
  // Ilustracje kart: jedna nieruchoma klatka zamiast pętli animacji.
  await page.waitForFunction(() => window.SowieMenu?.atlas?.ready?.() === true);
  expect(await page.evaluate(() => window.SowieMenu.animating())).toBe(false);
});
