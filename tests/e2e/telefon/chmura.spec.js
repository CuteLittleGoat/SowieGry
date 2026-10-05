// SowieCloud na telefonie: hasło „huhu”, zapis w Firestore (emulator), drugie urządzenie, powrót z tła.
const { test, expect, newDevice, setVisibility, waitForCloud, watchErrors, DEVICE_KEY } = require("../fixtures");
const { cloudUrl, listDocs, readDoc, uniqueProject } = require("../emulator");

function deviceOptions(testInfo) {
  const { viewport, screen, userAgent, deviceScaleFactor, isMobile, hasTouch, baseURL } = testInfo.project.use;
  return { viewport, screen, userAgent, deviceScaleFactor, isMobile, hasTouch, baseURL };
}

test.describe("ekran „Hasło sowy”", () => {
  test.use({ odblokowane: false });

  test("jest wygodny na telefonie i wpuszcza po wpisaniu huhu", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/?seed=haslo", { waitUntil: "load" });
    const gate = page.getByRole("dialog", { name: "Hasło sowy" });
    await expect(gate).toBeVisible();

    const input = gate.getByLabel("Hasło", { exact: true });
    const submit = gate.getByRole("button", { name: "Wejdź" });
    await expect(input).toHaveAttribute("autocapitalize", "none");
    await expect(input).toHaveAttribute("autocorrect", "off");
    await expect(input).toHaveAttribute("spellcheck", "false");
    await expect(input).toHaveAttribute("enterkeyhint", "go");
    expect(await input.evaluate((node) => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(16);

    // Przycisk „Wejdź”: min. 48 px, w całości na ekranie i w dolnej połowie (zasięg kciuka).
    const viewport = page.viewportSize();
    const box = await submit.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(48);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    expect(box.y + box.height / 2).toBeGreaterThan(viewport.height / 2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    // Pole, oczko i przycisk mieszczą się w całości w szerokości ekranu (od 320 px).
    for (const element of [input, gate.getByRole("button", { name: "Pokaż hasło" }), submit]) {
      const rect = await element.boundingBox();
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(viewport.width);
    }

    await input.tap();
    expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(1);
    await input.fill("hu hu");
    await submit.tap();
    await expect(gate.getByRole("alert")).toHaveText("Hu-hu? To nie to hasło 🦉");
    await expect(gate).toBeVisible();

    await gate.getByRole("button", { name: "Pokaż hasło" }).tap();
    await expect(input).toHaveAttribute("type", "text");
    await input.fill(" Huhu ");
    await input.press("Enter");
    await expect(gate).toBeHidden();
    await waitForCloud(page);
    await expect(page.locator(".game-card").first()).toBeVisible();

    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys).toEqual([DEVICE_KEY]);
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).unlocked, DEVICE_KEY)).toBe(true);

    await page.reload({ waitUntil: "load" });
    await waitForCloud(page);
    await expect(page.getByRole("dialog", { name: "Hasło sowy" })).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("pisanie hasła nie uruchamia gry pod spodem", async ({ page }) => {
    const errors = watchErrors(page);
    // Sowia Ucieczka (zastąpiła SowaRunner): Spacja na ekranie tytułowym startuje bieg — pisanie hasła nie może.
    await page.goto("/SowiaUcieczka/?seed=haslo-gra", { waitUntil: "load" });
    const gate = page.getByRole("dialog", { name: "Hasło sowy" });
    const input = gate.getByLabel("Hasło", { exact: true });
    // Ekran hasła przykrywa także kartę tytułową gry (przycisk Start).
    await expect(page.locator("[data-start]")).toHaveCount(1);
    const covered = await page.evaluate(() => {
      const rect = document.querySelector("[data-start]").getBoundingClientRect();
      const top = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return Boolean(top?.closest(".sowie-gate"));
    });
    expect(covered).toBe(true);
    await input.tap();
    await input.pressSequentially(" huhu ");
    await expect(input).toHaveValue(" huhu ");
    expect(await page.evaluate(() => window.SowiaUcieczka.screen())).toBe("title");
    await input.press("Enter");
    await expect(gate).toBeHidden();
    await waitForCloud(page);
    await page.waitForFunction(() => window.SowiaUcieczka.ready());
    expect(await page.evaluate(() => window.SowiaUcieczka.screen())).toBe("title");

    // Po wejściu stuknięcie w „Start” zaczyna bieg.
    await page.locator("[data-start]").tap();
    await expect.poll(() => page.evaluate(() => window.SowiaUcieczka.screen())).toBe("playing");
    expect(errors).toEqual([]);
  });
});

test("pierwsze połączenie tworzy sowiegry/meta i sowiegry/profil", async ({ page }, testInfo) => {
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await page.goto(cloudUrl("/?seed=bootstrap", project), { waitUntil: "load" });
  await waitForCloud(page);
  await expect.poll(() => readDoc(project, "sowiegry/profil")).not.toBeNull();

  const meta = await readDoc(project, "sowiegry/meta");
  expect(meta.schemaVersion).toBe(1);
  expect(meta.games).toEqual(["runner", "jumper", "sowa3", "ogrody", "szklarnia"]);
  expect(typeof meta.createdAt).toBe("number");
  const profile = await readDoc(project, "sowiegry/profil");
  expect(profile.schemaVersion).toBe(1);
  expect(profile.name).toBe("Sowa");
  expect(profile.cosmetics).toEqual({ unlocked: ["none", "bow"], selected: "none" });
  expect(Object.keys(profile).length).toBeLessThanOrEqual(30);
  // Po potwierdzeniu zapisu przez bazę status przechodzi z „zapisywanie” w „online”.
  await expect.poll(() => page.evaluate(() => window.SowieCloud.status())).toBe("online");
  expect(errors).toEqual([]);
});

test("rekord zrobiony na telefonie widać na drugim urządzeniu", async ({ page, browser }, testInfo) => {
  const project = uniqueProject(testInfo);
  const url = cloudUrl("/SowaWChmurach/?seed=rekord", project);
  const errors = watchErrors(page);
  await page.goto(url, { waitUntil: "load" });
  await waitForCloud(page);

  // Koniec lotu w Sowie w Chmurach — ten sam zapis zbiorczy, który robi gra (SowieCloud.submitRun).
  await page.evaluate(async () => {
    window.SowieCloud.submitRun("jumper", { score: 1234, height: 77, leaves: 3, difficulty: "arcade" });
    await window.SowieCloud.flush();
  });
  const profile = await readDoc(project, "sowiegry/profil");
  expect(profile.records.jumper.runs).toBe(1);
  expect(profile.records.jumper.arcade).toEqual({ bestScore: 1234, bestHeight: 77 });
  const gameDoc = await readDoc(project, "sowiegry/profil/sowiegry_gry/jumper");
  expect(gameDoc.top10.arcade[0]).toMatchObject({ score: 1234, height: 77, difficulty: "arcade" });
  const history = await listDocs(project, "sowiegry/profil/sowiegry_gry/jumper/sowiegry_historia");
  expect(history).toHaveLength(1);
  expect(history[0]).toMatchObject({ score: 1234, height: 77 });

  const second = await newDevice(browser, deviceOptions(testInfo));
  try {
    const other = await second.context.newPage();
    const otherErrors = watchErrors(other);
    await other.goto(url, { waitUntil: "load" });
    await waitForCloud(other);
    expect(await other.evaluate(() => window.SowieCloud.records("jumper", "arcade"))).toEqual({
      bestScore: 1234,
      bestHeight: 77,
    });
    // Ekran tytułowy gry na drugim urządzeniu pokazuje rekord z chmury.
    await other.waitForFunction(() => window.SowaWChmurach?.ready?.());
    await expect(other.locator("[data-record]")).toContainText(/1\s?234/);
    expect(await other.evaluate(() => window.SowieCloud.deviceId())).not.toBe(
      await page.evaluate(() => window.SowieCloud.deviceId()),
    );
    expect(otherErrors).toEqual([]);
    expect(second.blocked).toEqual([]);
  } finally {
    await second.context.close();
  }
  expect(errors).toEqual([]);
});

test("po powrocie z tła gra idle dolicza postęp offline i zapisuje stan", async ({ page }, testInfo) => {
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await page.goto(cloudUrl("/SowieOgrody/?seed=tlo", project), { waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction(() => window.SowieOgrody?.ready?.(), null, { timeout: 20_000 });
  await page.evaluate(() => {
    window.SowieOgrody.give(1000);
    window.SowieOgrody.buy("monstera", 10);
    window.SowieOgrody.tap(1);
  });

  // Przejście do innej aplikacji: stan (v3, pole `state`) trafia do bazy od razu.
  await setVisibility(page, "hidden");
  await expect
    .poll(async () => JSON.parse((await readDoc(project, "sowiegry/profil/sowiegry_gry/ogrody"))?.state || "{}"))
    .toMatchObject({ version: 3, plants: { monstera: 10 } });

  // 10 minut w tle, potem powrót.
  await page.evaluate(() => {
    const realNow = Date.now;
    Date.now = () => realNow() + 10 * 60 * 1000;
  });
  await setVisibility(page, "visible");
  const dialog = page.getByRole("dialog", { name: "Witaj z powrotem!" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Sowa doglądała ogrodu");
  expect(errors).toEqual([]);
});
