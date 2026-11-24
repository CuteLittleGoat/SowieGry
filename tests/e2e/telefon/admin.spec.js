// Panel admina Sowiego Banku `Admin/` (Analiza 7b, rozdz. 8 — etap W2) na telefonie, emulator Firestore.
// Nowe urządzenie bez hasła gracza: hasło „KoziAdmin” odblokowuje panel i połączenie z bazą.
const { test, expect, newDevice, waitForCloud, watchErrors } = require("../fixtures");
const { cloudUrl, readDoc, seedDoc, uniqueProject } = require("../emulator");

test.use({ odblokowane: false });

async function openPanel(page, project) {
  await page.goto(cloudUrl("/Admin/", project), { waitUntil: "load" });
  await expect(page.getByRole("heading", { name: "Sowi Bank" })).toBeVisible();
  await page.getByLabel("Hasło admina").fill("KoziAdmin");
  await page.getByRole("button", { name: "Wejdź" }).tap();
  await expect(page.locator("[data-admin-panel]")).toBeVisible();
  await waitForCloud(page);
}

test("Panel admina: hasło, portfel z prezentem, prośba ze zrzutu zatwierdzona raz, doładowanie i korekta (emulator)", async ({
  page,
  browser,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  const errors = watchErrors(page);
  await page.goto(cloudUrl("/Admin/", project), { waitUntil: "load" });
  await expect(page.getByRole("heading", { name: "Sowi Bank" })).toBeVisible();
  await expect(page.locator("[data-admin-panel]")).toBeHidden();

  // Złe hasło (hasło gracza) — komunikat; „KoziAdmin” — panel.
  await page.getByLabel("Hasło admina").fill("huhu");
  await page.getByRole("button", { name: "Wejdź" }).tap();
  await expect(page.getByRole("alert")).toHaveText("To nie to hasło 🐐");
  await page.getByLabel("Hasło admina").fill("KoziAdmin");
  await page.getByRole("button", { name: "Wejdź" }).tap();
  await waitForCloud(page);
  await expect(page.getByRole("heading", { name: "Portfel gracza jeszcze nie istnieje" })).toBeVisible();

  // Założenie portfela z prezentem powitalnym 500.
  await page.getByRole("button", { name: "Załóż portfel gracza" }).tap();
  await expect(page.locator("[data-admin-message]")).toHaveText("Portfel założony — prezent 500 Wypluffków.");
  await expect(page.locator("[data-admin-saldo]")).toHaveText("500");
  await expect(page.locator("[data-admin-stats]")).toContainText("VIP: 🐟 Płotka");

  // Gracz (drugie urządzenie) prosi o doładowanie — „Kieszeń Wypluffków”, kod ze zrzutu ekranu.
  const { context: player } = await newDevice(browser, testInfo.project.use);
  const playerPage = await player.newPage();
  await playerPage.goto(cloudUrl("/", project), { waitUntil: "load" });
  await waitForCloud(playerPage);
  const request = await playerPage.evaluate(async () => {
    const result = await window.SowieCloud.bank.requestTopUp({ kod: "HU-7F3K-2Q", pakiet: "kieszen", kwota: 550 });
    await window.SowieCloud.flush();
    return result;
  });
  expect(request.ok).toBe(true);

  await page.getByRole("button", { name: "Odśwież" }).tap();
  const queued = page.locator('[data-request="HU-7F3K-2Q"]');
  await expect(queued).toContainText("Kieszeń Wypluffków");
  await expect(page.locator("[data-admin-pending]")).toHaveText("1");
  await expect(page).toHaveTitle("(1) Sowi Bank");
  await queued.getByRole("button", { name: "Zatwierdź 550" }).tap();
  const confirm = page.locator("[data-admin-confirm]");
  await expect(confirm).toContainText("Zatwierdzić HU-7F3K-2Q: +550 Wypluffków (Kieszeń Wypluffków)?");
  await confirm.getByRole("button", { name: "Zatwierdź" }).tap();
  await expect(page.locator("[data-admin-message]")).toHaveText("Zatwierdzono HU-7F3K-2Q: +550 Wypluffków.");
  await expect(page.locator("[data-admin-saldo]")).toHaveText("1050");
  await expect(page.locator("[data-admin-pending]")).toHaveText("0");
  await expect(page).toHaveTitle("Sowi Bank");
  await expect(page.locator("[data-admin-done]")).toContainText(
    "HU-7F3K-2Q · Kieszeń Wypluffków · zatwierdzone ✅ +550",
  );

  // Gracz widzi doładowanie z notką (powiadomienie „wpłynęło…” w Dziupli korzysta z tego pola).
  const seen = await playerPage.evaluate(async () => window.SowieCloud.bank.load());
  expect(seen.saldo).toBe(1050);
  expect(seen.ostatnieDoladowanie).toMatchObject({ kwota: 550, notka: "Za piękne hu-hu!", kod: "HU-7F3K-2Q" });
  await player.close();

  // Doładowanie ręczne (+100 z notką) i korekta (−50).
  await page.getByRole("button", { name: "+100", exact: true }).tap();
  await page.locator("[data-manual-note]").fill("Prezent od admina");
  await page.getByRole("button", { name: "Doładuj", exact: true }).tap();
  await expect(confirm).toContainText("Doładować konto gracza?");
  await confirm.getByRole("button", { name: "Tak, doładuj" }).tap();
  await expect(page.locator("[data-admin-saldo]")).toHaveText("1150");
  await page.getByRole("button", { name: "+50", exact: true }).tap();
  await page.getByRole("button", { name: "Odejmij (korekta)" }).tap();
  await confirm.getByRole("button", { name: "Tak, odejmij" }).tap();
  await expect(page.locator("[data-admin-message]")).toHaveText("Odjęto 50 Wypluffków.");
  await expect(page.locator("[data-admin-saldo]")).toHaveText("1100");
  await expect(page.locator("[data-admin-history] li")).toHaveCount(4);
  await expect(page.locator("[data-admin-history] li").first()).toContainText("−50 · Korekta");

  const wallet = await readDoc(project, "sowiegry_wypluffki/portfel");
  expect(wallet).toMatchObject({ saldo: 1100, doladowano: 1100, wydano: 0 });
  expect((await readDoc(project, "sowiegry_wypluffki/portfel/wypluffki_prosby/HU-7F3K-2Q")).status).toBe(
    "zatwierdzone",
  );
  expect(errors).toEqual([]);
});

test("Panel admina: zwrot zakupu, ogłoszenie z promocją, „Wyloguj” wraca do hasła (emulator)", async ({
  page,
}, testInfo) => {
  const project = uniqueProject(testInfo);
  await seedDoc(project, "sowiegry_wypluffki/portfel", {
    schemaVersion: 1,
    saldo: 501,
    doladowano: 1000,
    wydano: 499,
    kupione: { "skorka:zlota": { at: Date.now(), cena: 499 } },
  });
  const errors = watchErrors(page);
  await openPanel(page, project);
  await expect(page.locator("[data-admin-saldo]")).toHaveText("501");

  const bought = page.locator('[data-item="skorka:zlota"]');
  await expect(bought).toContainText("Złota · 499");
  await bought.getByRole("button", { name: "Zwrot" }).tap();
  await expect(page.locator("[data-admin-confirm]")).toContainText("Zwrócić „Złota”? Gracz odzyska 499 Wypluffków.");
  await page.getByRole("button", { name: "Tak, zwróć" }).tap();
  await expect(page.locator("[data-admin-message]")).toHaveText("Zwrócono „Złota” (+499).");
  await expect(page.locator("[data-admin-saldo]")).toHaveText("1000");
  await expect(page.locator("[data-admin-bought]")).toHaveText("Gracz jeszcze nic nie kupił.");

  const until = new Date(Date.now() + 7 * 24 * 3600 * 1000).toLocaleDateString("sv-SE");
  await page.getByLabel("Ogłoszenie na górze Butiku").fill("Black Friday w Sowim Banku!");
  await page.getByLabel("Promocja (%)").fill("30");
  await page.getByLabel("do dnia").fill(until);
  await page.getByRole("button", { name: "Zapisz ogłoszenie i promocję" }).tap();
  await expect(page.locator("[data-admin-message]")).toHaveText("Zapisano ogłoszenie i promocję.");
  const wallet = await readDoc(project, "sowiegry_wypluffki/portfel");
  expect(wallet.ogloszenie).toBe("Black Friday w Sowim Banku!");
  expect(wallet.promocja.procent).toBe(30);
  expect(wallet.promocja.do).toBeGreaterThan(Date.now());
  expect(wallet).toMatchObject({ saldo: 1000, wydano: 0 });

  await page.getByRole("button", { name: "Wyloguj" }).tap();
  await expect(page.getByLabel("Hasło admina")).toBeVisible();
  expect(errors).toEqual([]);
});
