// Wypluffki (Analiza 7b): portfel w SowieCloud (`cloud.bank`, MemoryBackend) i katalog z zasadami
// (shared/meta/wypluffki.js). Testy reguł Firestore portfela — tests/rules/firestore-rules.test.mjs.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import {
  CATALOG,
  CODE_ALPHABET,
  CODE_PATTERN,
  DAILY_DISCOUNT,
  EGG,
  KINDS,
  MAX_PENDING,
  PACKAGES,
  RARITY,
  VIP_LEVELS,
  buyEgg,
  buyItem,
  dailyOfferId,
  drawEgg,
  eggPool,
  forSale,
  generateCode,
  itemById,
  ownedIds,
  priceFor,
  requestTopUp,
  vipLevel,
} from "../../shared/meta/wypluffki.js";

const require = createRequire(import.meta.url);
const {
  MemoryBackend,
  createCloud,
  checkAdminPassword,
  normalizeWallet,
  PATHS,
  DEVICE_KEY,
  WALLET_CODE,
} = require("../../shared/sowie-cloud.js");

const platform = {
  GAME_REGISTRY: [],
  COSMETICS: { none: {}, bow: {} },
  DEFAULT_SETTINGS: {},
  DEFAULT_MISSIONS: {},
  DEFAULT_STATS: {},
};

function storage(device = { unlocked: true, deviceId: "d-test01" }) {
  const map = new Map([[DEVICE_KEY, JSON.stringify(device)]]);
  return { map, getItem: (key) => (map.has(key) ? map.get(key) : null), setItem: (key, value) => map.set(key, value) };
}

function makeCloud({ backend = new MemoryBackend({ now: () => 1_000 }), device, online = () => true } = {}) {
  const store = storage(device);
  const cloud = createCloud({
    platform,
    storage: store,
    connect: async () => backend,
    now: () => 1_000,
    isOnline: online,
    logError: (...args) => {
      throw new Error(args.map(String).join(" "));
    },
  });
  return { cloud, backend, store };
}

const admin = (cloud) => assert.equal(cloud.bank.unlockAdmin(" KoziAdmin "), true);
const walletDoc = (backend) => backend.docs.get(PATHS.wallet);
const historyDocs = (backend) =>
  [...backend.docs.entries()].filter(([path]) => path.startsWith(`${PATHS.walletHistory}/`)).map(([, data]) => data);

// --- hasło i normalizacja ---------------------------------------------------------------------

test("hasło admina „KoziAdmin”: bez wielkości liter i spacji na końcach", () => {
  for (const ok of ["KoziAdmin", "koziadmin", " KOZIADMIN ", "koziAdmin\n"]) assert.equal(checkAdminPassword(ok), true);
  for (const bad of ["kozi admin", "huhu", "", null, "koziadmin!"]) assert.equal(checkAdminPassword(bad), false);
});

test("normalizeWallet: liczby całkowite ≥ 0, dziennik zakupów, nieznane pola zostają", () => {
  const wallet = normalizeWallet({
    saldo: "12.7",
    doladowano: -5,
    kupione: { "skorka:zlota": { at: 5, cena: 1499 }, "stroj:pirat": null },
    promocja: { procent: 150, do: 99 },
    zNowszejWersji: { x: 1 },
  });
  assert.equal(wallet.saldo, 12);
  assert.equal(wallet.doladowano, 0);
  assert.deepEqual(wallet.kupione["skorka:zlota"], { at: 5, cena: 1499 });
  assert.deepEqual(wallet.kupione["stroj:pirat"], { at: 0, cena: 0 });
  assert.deepEqual(wallet.promocja, { procent: 90, do: 99 });
  assert.deepEqual(wallet.zNowszejWersji, { x: 1 });
  assert.equal(normalizeWallet(null).saldo, 0);
  assert.equal(normalizeWallet({ ostatnieDoladowanie: { kwota: 5 } }).ostatnieDoladowanie.kod, null);
});

// --- panel admina ---------------------------------------------------------------------------------

test("bez hasła admina operacje panelu są odrzucane; „Wyloguj” zapomina panel na urządzeniu", async () => {
  const { cloud, store } = makeCloud();
  assert.deepEqual(await cloud.bank.create({ prezent: 500 }), { ok: false, reason: "admin" });
  assert.equal(cloud.bank.unlockAdmin("huhu"), false);
  admin(cloud);
  assert.equal(JSON.parse(store.map.get(DEVICE_KEY)).admin, true);
  cloud.bank.lockAdmin();
  assert.equal(cloud.bank.isAdmin(), false);
});

test("hasło admina odblokowuje też połączenie na nowym urządzeniu (bez hasła gracza)", async () => {
  const { cloud } = makeCloud({ device: { unlocked: false, deviceId: "d-admin1" } });
  assert.equal(cloud.isReady(), false);
  admin(cloud);
  await cloud.ready;
  assert.equal(cloud.isReady(), true);
});

test("założenie portfela z prezentem powitalnym: saldo, wpis w historii, drugi raz — „istnieje”", async () => {
  const { cloud, backend } = makeCloud();
  admin(cloud);
  const result = await cloud.bank.create({ prezent: 500, notka: "Witamy w Sowim Banku!" });
  assert.equal(result.ok, true);
  const wallet = walletDoc(backend);
  assert.equal(wallet.saldo, 500);
  assert.equal(wallet.doladowano, 500);
  assert.equal(wallet.wydano, 0);
  assert.deepEqual(wallet.kupione, {});
  assert.equal(wallet.ostatnieDoladowanie.notka, "Witamy w Sowim Banku!");
  assert.deepEqual(
    historyDocs(backend).map(({ zmiana, saldoPo, rodzaj }) => ({ zmiana, saldoPo, rodzaj })),
    [{ zmiana: 500, saldoPo: 500, rodzaj: "doladowanie" }],
  );
  assert.deepEqual(await cloud.bank.create({}), { ok: false, reason: "istnieje" });
});

test("doładowanie z prośby: zatwierdzenie tylko raz (podwójne stuknięcie nie doładuje dwa razy), bonus z pakietu", async () => {
  const { cloud, backend } = makeCloud();
  admin(cloud);
  await cloud.bank.create({});
  const request = await cloud.bank.requestTopUp({ kod: "HU-7F3K-2Q", pakiet: "startowy", kwota: 300 });
  assert.equal(request.ok, true);
  await cloud.flush();
  const [first, second] = await Promise.all([
    cloud.bank.topUp({ kwota: 300, kod: "HU-7F3K-2Q", notka: "Piękne hu-hu", bonus: ["stroj:nowicjusz"] }),
    cloud.bank.topUp({ kwota: 300, kod: "HU-7F3K-2Q", bonus: ["stroj:nowicjusz"] }),
  ]);
  assert.equal(first.ok, true);
  assert.deepEqual(second, { ok: false, reason: "zalatwione" });
  const wallet = walletDoc(backend);
  assert.equal(wallet.saldo, 300);
  assert.deepEqual(wallet.kupione["stroj:nowicjusz"], { at: 1_000, cena: 0 });
  assert.equal(wallet.ostatnieDoladowanie.kod, "HU-7F3K-2Q");
  const saved = backend.docs.get(PATHS.walletRequest("HU-7F3K-2Q"));
  assert.equal(saved.status, "zatwierdzone");
  assert.equal(saved.kwotaPrzyznana, 300);
  assert.equal((await cloud.bank.requests())[0].status, "zatwierdzone");
});

test("odrzucenie, korekta i zwrot zachowują saldo = doładowano − wydano", async () => {
  const { cloud, backend } = makeCloud();
  admin(cloud);
  await cloud.bank.create({ prezent: 1000 });
  await cloud.bank.requestTopUp({ kod: "HU-AAAA-BB", pakiet: "garstka", kwota: 100 });
  await cloud.flush();
  assert.equal((await cloud.bank.reject({ kod: "HU-AAAA-BB", notka: "Koza się nie przestraszyła" })).ok, true);
  assert.equal(backend.docs.get(PATHS.walletRequest("HU-AAAA-BB")).status, "odrzucone");
  assert.deepEqual(await cloud.bank.topUp({ kwota: 100, kod: "HU-AAAA-BB" }), { ok: false, reason: "zalatwione" });

  assert.equal((await cloud.bank.buy({ id: "skorka:zlota", price: 499 })).ok, true);
  assert.equal((await cloud.bank.correct({ kwota: 100, notka: "pomyłka" })).ok, true);
  assert.deepEqual(await cloud.bank.correct({ kwota: 5000 }), { ok: false, reason: "saldo" });
  const refund = await cloud.bank.refund({ id: "skorka:zlota", notka: "kupione przez pomyłkę" });
  assert.equal(refund.ok, true);
  assert.equal(refund.cena, 499);
  const wallet = walletDoc(backend);
  assert.equal(wallet.kupione["skorka:zlota"], undefined);
  assert.equal(wallet.saldo, 900);
  assert.equal(wallet.saldo, wallet.doladowano - wallet.wydano);
  assert.deepEqual(
    historyDocs(backend).map((entry) => entry.rodzaj),
    ["doladowanie", "zakup", "korekta", "zwrot"],
  );
  assert.deepEqual(await cloud.bank.refund({ id: "skorka:zlota" }), { ok: false, reason: "brak" });
});

test("ogłoszenie i promocja admina; zła promocja odrzucona", async () => {
  const { cloud, backend } = makeCloud();
  admin(cloud);
  await cloud.bank.create({});
  assert.equal(
    (await cloud.bank.announce({ ogloszenie: " Black Friday! ", promocja: { procent: 30, do: 5_000 } })).ok,
    true,
  );
  assert.equal(walletDoc(backend).ogloszenie, "Black Friday!");
  assert.deepEqual(walletDoc(backend).promocja, { procent: 30, do: 5_000 });
  assert.deepEqual(await cloud.bank.announce({ promocja: { procent: 95, do: 5_000 } }), {
    ok: false,
    reason: "promocja",
  });
  assert.equal((await cloud.bank.announce({ ogloszenie: "" })).ok, true);
  assert.equal(walletDoc(backend).promocja, null);
});

// --- gracz ------------------------------------------------------------------------------------------

test("zakup gracza: za mało Wypluffków, sukces, drugi raz — „owned”; bez portfela i bez sieci", async () => {
  let online = true;
  const { cloud, backend } = makeCloud({ online: () => online });
  assert.deepEqual(await cloud.bank.buy({ id: "stroj:pirat", price: 399 }), { ok: false, reason: "brak-portfela" });
  admin(cloud);
  await cloud.bank.create({ prezent: 300 });
  assert.deepEqual(await cloud.bank.buy({ id: "stroj:pirat", price: 399 }), { ok: false, reason: "saldo" });
  assert.deepEqual(await cloud.bank.buy({ id: "zle id", price: 10 }), { ok: false, reason: "unknown" });
  const bought = await cloud.bank.buy({ id: "glos:echo", price: 149 });
  assert.deepEqual(bought, { ok: true, saldo: 151, id: "glos:echo", cena: 149 });
  assert.deepEqual(await cloud.bank.buy({ id: "glos:echo", price: 149 }), { ok: false, reason: "owned" });
  assert.equal(walletDoc(backend).wydano, 149);
  online = false;
  assert.equal(cloud.bank.available(), "offline");
  assert.deepEqual(await cloud.bank.buy({ id: "glos:bas", price: 149 }), { ok: false, reason: "offline" });
});

test("dwa zakupy naraz nie wydadzą tych samych Wypluffków (transakcje po kolei)", async () => {
  const { cloud, backend } = makeCloud();
  admin(cloud);
  await cloud.bank.create({ prezent: 500 });
  const results = await Promise.all([
    cloud.bank.buy({ id: "stroj:pirat", price: 399 }),
    cloud.bank.buy({ id: "stroj:koza", price: 499 }),
  ]);
  assert.deepEqual(
    results.map((result) => result.ok),
    [true, false],
  );
  assert.equal(results[1].reason, "saldo");
  assert.equal(walletDoc(backend).saldo, 101);
});

test("nasłuch portfela: doładowanie z innego urządzenia (panel) widać od razu", async () => {
  const backend = new MemoryBackend({ now: () => 1_000 });
  const { cloud: player } = makeCloud({ backend });
  const { cloud: panel } = makeCloud({ backend, device: { unlocked: true, deviceId: "d-admin1" } });
  const seen = [];
  player.bank.onWallet((wallet) => seen.push(wallet?.saldo ?? null));
  await player.ready;
  await new Promise((resolve) => setImmediate(resolve));
  admin(panel);
  await panel.bank.create({ prezent: 500 });
  await panel.bank.topUp({ kwota: 550, notka: "Za piękne hu-hu!" });
  assert.deepEqual(seen, [null, 500, 1050]);
  assert.equal(player.bank.wallet().ostatnieDoladowanie.notka, "Za piękne hu-hu!");
});

test("prośba o doładowanie: poprawny kod i kwota; zły kod odrzucony", async () => {
  const { cloud, backend } = makeCloud();
  assert.deepEqual(await cloud.bank.requestTopUp({ kod: "HU-0000-11", pakiet: "garstka", kwota: 100 }), {
    ok: false,
    reason: "unknown",
  });
  const result = await cloud.bank.requestTopUp({ kod: "HU-9AB2-XC", pakiet: "garstka", kwota: 100 });
  assert.equal(result.ok, true);
  await cloud.flush();
  assert.deepEqual(backend.docs.get(PATHS.walletRequest("HU-9AB2-XC")), {
    kod: "HU-9AB2-XC",
    pakiet: "garstka",
    kwota: 100,
    status: "czeka",
    at: 1_000,
  });
});

// --- katalog (shared/meta/wypluffki.js) ------------------------------------------------------------------

test("katalog: unikalne id, znane rodzaje i rzadkości, ceny całkowite, wyjątki opisane", () => {
  const ids = CATALOG.map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const entry of CATALOG) {
    assert.match(entry.id, /^[a-z0-9]+:[a-z0-9-]+$/, entry.id);
    assert.ok(entry.kind in KINDS, entry.id);
    assert.ok(entry.rarity in RARITY, entry.id);
    assert.ok(Number.isInteger(entry.cena) && entry.cena >= 0, entry.id);
    assert.ok(entry.label && entry.text, entry.id);
    if (entry.cena === 0) assert.ok(entry.pakiet || entry.vip, `${entry.id}: cena 0 tylko dla pakietu albo VIP`);
    if (entry.kind === "dziupla") assert.ok(entry.slot, `${entry.id}: miejsce w Dziupli`);
    if (entry.kind === "skorka") assert.deepEqual(Object.keys(entry.colors), ["dark", "body", "face", "belly", "beak"]);
    if (entry.wyjatek) assert.equal(entry.wyjatek, "polka");
  }
  // Tylko wygląd: żadna rzecz nie ma pól, które gry czytają jako działanie (Analiza 7b, rozdz. 10).
  for (const entry of CATALOG) {
    for (const key of ["factor", "mnoznik", "bonusPiorka", "xp", "feathers", "zycia", "czas"]) {
      assert.equal(key in entry, false, `${entry.id}: ${key}`);
    }
  }
});

test("Sowia Farma dopiero po wdrożeniu Farmy; pakiet i VIP nie są w sprzedaży", () => {
  assert.equal(
    forSale().some((entry) => entry.kind === "farma"),
    false,
  );
  assert.ok(forSale(["farma"]).some((entry) => entry.kind === "farma"));
  for (const id of ["stroj:nowicjusz", "dziupla:humbak-vip"]) {
    assert.equal(
      forSale(["farma"]).some((entry) => entry.id === id),
      false,
    );
  }
});

test("pakiety: kwoty 100–6500, jeden Pakiet Startowy z bonusem z katalogu", () => {
  assert.deepEqual(
    PACKAGES.map((pack) => pack.kwota),
    [300, 100, 550, 1200, 2600, 6500],
  );
  const once = PACKAGES.filter((pack) => pack.raz);
  assert.deepEqual(
    once.map((pack) => pack.id),
    ["startowy"],
  );
  for (const id of once[0].bonus) assert.equal(itemById(id)?.pakiet, "startowy");
  for (const pack of PACKAGES) assert.match(pack.cena, /Hu-hu/);
});

test("VIP: Płotka → Śledź → Delfin → Humbak; Pluszowy Humbak VIP od 15 000 wydanych", () => {
  assert.deepEqual(
    VIP_LEVELS.map((level) => level.min),
    [0, 1000, 5000, 15000],
  );
  assert.equal(vipLevel(0).id, "plotka");
  assert.equal(vipLevel(999).brakuje, 1);
  assert.equal(vipLevel(5000).id, "delfin");
  assert.equal(vipLevel(20000).next, null);
  assert.equal(ownedIds({ wydano: 14999, kupione: {} }).has("dziupla:humbak-vip"), false);
  assert.equal(ownedIds({ wydano: 15000, kupione: {} }).has("dziupla:humbak-vip"), true);
});

test("oferta dnia: ta sama dla daty, nigdy posiadana; rabat 20%, lepszy z oferty i promocji, nie oba", () => {
  const offer = dailyOfferId("2026-11-24");
  assert.equal(offer, dailyOfferId("2026-11-24"));
  assert.notEqual(dailyOfferId("2026-11-24", new Set([offer])), offer);
  assert.equal(dailyOfferId("2026-11-24", new Set(forSale().map((entry) => entry.id))), null);
  const entry = itemById(offer);
  const daily = priceFor(entry, { dayKey: "2026-11-24" });
  assert.equal(daily.rabat.procent, DAILY_DISCOUNT);
  assert.equal(daily.cena, Math.floor((entry.cena * 80) / 100));
  const wallet = { kupione: {}, wydano: 0, promocja: { procent: 50, do: 2_000 } };
  assert.equal(priceFor(entry, { dayKey: "2026-11-24", wallet, nowMs: 1_000 }).rabat.zrodlo, "promocja");
  assert.equal(priceFor(entry, { dayKey: "2026-11-24", wallet, nowMs: 3_000 }).rabat.zrodlo, "oferta");
  assert.deepEqual(priceFor(itemById("glos:echo"), {}), { cena: 149, bazowa: 149, rabat: null });
});

test("kod prośby: HU-XXXX-XX z alfabetu bez 0/O i 1/I (ten sam wzór co w regułach i SowieCloud)", () => {
  assert.equal(CODE_ALPHABET.length, 32);
  assert.doesNotMatch(CODE_ALPHABET, /[01IO]/);
  for (let index = 0; index < 50; index += 1) {
    const code = generateCode();
    assert.match(code, CODE_PATTERN);
    assert.match(code, WALLET_CODE);
  }
  assert.equal(
    generateCode(() => 0),
    "HU-AAAA-AA",
  );
  assert.equal(
    generateCode(() => 0.999),
    "HU-9999-99",
  );
});

test("jajko-niespodzianka: tylko rzeczy Sówki bez Mitycznego Puchu, bez powtórek, szanse sumują się do 1", () => {
  assert.equal(
    Object.values(EGG.szanse).reduce((sum, value) => sum + value, 0),
    1,
  );
  const pool = eggPool();
  assert.ok(pool.length > 10);
  assert.ok(pool.every((entry) => EGG.kinds.includes(entry.kind) && entry.rarity !== "mityczny" && entry.cena > 0));
  const owned = new Set();
  for (let index = 0; index < pool.length; index += 1) {
    const prize = drawEgg(owned, () => (index * 0.137) % 1);
    assert.ok(prize && !owned.has(prize.id));
    owned.add(prize.id);
  }
  assert.equal(drawEgg(owned), null);
  // Tylko legendarne zostały → losuje legendarną, mimo szansy 5%.
  const onlyLegendary = new Set(pool.filter((entry) => entry.rarity !== "legendarny").map((entry) => entry.id));
  assert.equal(drawEgg(onlyLegendary, () => 0).rarity, "legendarny");
});

test("buyItem / buyEgg / requestTopUp z chmurą: cena z oferty, kolejka najwyżej 3, Pakiet Startowy raz", async () => {
  const { cloud, backend } = makeCloud();
  admin(cloud);
  await cloud.bank.create({ prezent: 3000 });
  await cloud.bank.load();
  assert.deepEqual(await buyItem("farma:konewka-humbak", { cloud }), { ok: false, reason: "niedostepne" });
  assert.deepEqual(await buyItem("brak:rzeczy", { cloud }), { ok: false, reason: "unknown" });
  const offer = dailyOfferId("2026-11-24");
  const bought = await buyItem(offer, { cloud, dayKey: "2026-11-24" });
  assert.equal(bought.ok, true);
  assert.equal(bought.cena, priceFor(itemById(offer), { dayKey: "2026-11-24" }).cena);
  await cloud.bank.load();
  assert.deepEqual(await buyItem(offer, { cloud }), { ok: false, reason: "owned" });

  const egg = await buyEgg({ cloud, random: () => 0 });
  assert.equal(egg.ok, true);
  assert.equal(walletDoc(backend).kupione[egg.item.id].cena, EGG.cena);

  const first = await requestTopUp("startowy", { cloud, random: () => 0.5 });
  assert.equal(first.ok, true);
  assert.match(first.kod, CODE_PATTERN);
  await cloud.flush();
  assert.deepEqual(await requestTopUp("startowy", { cloud }), { ok: false, reason: "raz" });
  let calls = 0;
  const codes = () => ((calls += 1) * 0.0731) % 1;
  for (let step = 1; step < MAX_PENDING; step += 1) {
    assert.equal((await requestTopUp("garstka", { cloud, random: codes })).ok, true);
    await cloud.flush();
  }
  assert.deepEqual(await requestTopUp("garstka", { cloud }), { ok: false, reason: "kolejka" });
});
