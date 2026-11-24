// Sowia Dziupla — katalog miejsc i ozdób, stan w profilu, odblokowania, półka z roślinkami z gier (Analiza 7, D1).
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { DECOR, FREE_DECOR, PREMIUM_DECOR, SHELF, SLOTS, decorById, decorForSlot } from "../../shared/dziupla/items.js";
import {
  defaultDziupla,
  isUnlocked,
  markSeen,
  normalizeDziupla,
  placeDecor,
  resolvePlaced,
  shelfPlants,
  shelfSlots,
  unlockContext,
} from "../../shared/dziupla/state.js";
import { CATALOG } from "../../shared/meta/wypluffki.js";

const require = createRequire(import.meta.url);
const { defaultProfile } = require("../../shared/sowie-cloud.js");

const profileWith = (metrics = {}, extra = {}) => ({ academy: { xp: 0, metrics, achievements: {} }, ...extra });

test("katalog: unikalne id, każda ozdoba w znanym miejscu, każde miejsce ma ozdobę domyślną z katalogu", () => {
  const ids = DECOR.map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length);
  const slots = new Set(SLOTS.map((slot) => slot.id));
  for (const entry of DECOR) {
    assert.ok(slots.has(entry.slot), entry.id);
    assert.ok(entry.label && entry.text !== "", entry.id);
    assert.ok(entry.start || entry.goals || entry.feathers || entry.premium, `${entry.id}: skąd ją wziąć`);
    if (entry.feathers) assert.ok(Number.isInteger(entry.feathers) && entry.feathers > 0, entry.id);
  }
  for (const slot of SLOTS) {
    if (slot.photo || slot.default === null) continue;
    assert.equal(decorById(slot.default)?.slot, slot.id, slot.id);
    assert.equal(decorById(slot.default)?.start, true, `${slot.id}: domyślna od początku`);
  }
  assert.equal(decorForSlot("wyglad").length, 12);
});

test("warunki ozdób odwołują się do istniejących liczników Sowiej Akademii", async () => {
  const academy = await readFile("shared/meta/academy.js", "utf8");
  const known = new Set(["level", "feathers", "achievements"]);
  for (const [, metric] of academy.matchAll(/push\(game, "([a-zA-Z0-9]+)"/g)) known.add(metric);
  for (const entry of [...FREE_DECOR, ...SHELF.extra]) {
    for (const [source, target] of entry.goals || []) {
      assert.ok(known.has(source), `${entry.id || entry.slot}: ${source}`);
      assert.ok(target > 0);
    }
  }
});

test("ozdoby premium to ozdoby Dziupli z katalogu Wypluffków (bez miejsc półki)", () => {
  const fromCatalog = CATALOG.filter((entry) => entry.kind === "dziupla" && entry.slot !== "polka").map((e) => e.id);
  assert.deepEqual(
    PREMIUM_DECOR.map((entry) => entry.id),
    fromCatalog,
  );
  for (const entry of PREMIUM_DECOR) assert.equal(entry.premium, entry.id);
});

test("normalizeDziupla: brak pola, uszkodzone, nieznana ozdoba i nieznane pola zostają", () => {
  assert.deepEqual(normalizeDziupla(null), defaultDziupla());
  assert.deepEqual(normalizeDziupla("zepsute"), defaultDziupla());
  const state = normalizeDziupla({
    placed: { okno: "okno:z-nowszej-wersji", zabawka: null, sufit: 5 },
    seen: { x: "7" },
    extra: 1,
  });
  assert.equal(state.placed.okno, "okno:z-nowszej-wersji");
  assert.equal(state.placed.zabawka, null);
  assert.equal(state.placed.sufit, "sufit:zarowka");
  assert.deepEqual(state.seen, { x: 7 });
  assert.equal(state.extra, 1);
  assert.equal(defaultDziupla().placed["polka-1"], "ogrody:monstera");
});

test("odblokowanie: od początku, za granie (liczniki Akademii), za piórka (dziennik zakupów), za Wypluffki", () => {
  const fresh = unlockContext({ profile: profileWith() });
  assert.equal(isUnlocked(decorById("okno:laka"), fresh), true);
  assert.equal(isUnlocked(decorById("okno:ocean"), fresh), false);
  assert.equal(isUnlocked(decorById("pinezki:serduszka"), fresh), false);
  assert.equal(isUnlocked(decorById("dziupla:tron"), fresh), false);
  const played = unlockContext({
    profile: profileWith({ whaleRides: 3 }, { shop: { purchases: { "decor:pinezki:serduszka": 1 } } }),
    wallet: { kupione: { "dziupla:tron": { cena: 999 } }, wydano: 999 },
  });
  assert.equal(isUnlocked(decorById("okno:ocean"), played), true);
  assert.equal(isUnlocked(decorById("pinezki:serduszka"), played), true);
  assert.equal(isUnlocked(decorById("dziupla:tron"), played), true);
  // Storczykowa: za granie albo za 100 piórek.
  const storczykowa = decorById("wyglad:storczykowa");
  assert.equal(isUnlocked(storczykowa, unlockContext({ profile: profileWith({ ogrodyChapters: 21 }) })), true);
  assert.equal(
    isUnlocked(storczykowa, unlockContext({ profile: { shop: { purchases: { "decor:wyglad:storczykowa": 1 } } } })),
    true,
  );
  // Nagroda VIP „Humbak” bez zakupu.
  assert.equal(
    isUnlocked(decorById("dziupla:humbak-vip"), unlockContext({ wallet: { kupione: {}, wydano: 15000 } })),
    true,
  );
});

test("półka: 3 miejsca, 4. za 5. poziom albo Wypluffki, 5. za 14 rozdziałów Ogrodów albo Wypluffki", () => {
  assert.equal(shelfSlots(unlockContext({ profile: profileWith() })), 3);
  // 5. poziom Akademii = 100 + 135 + 170 + 205 = 610 XP.
  assert.equal(shelfSlots(unlockContext({ profile: { academy: { xp: 610 } } })), 4);
  assert.equal(shelfSlots(unlockContext({ profile: { academy: { xp: 610, metrics: { ogrodyChapters: 14 } } } })), 5);
  assert.equal(shelfSlots(unlockContext({ wallet: { kupione: { "dziupla:polka-4": {}, "dziupla:polka-5": {} } } })), 5);
});

test("roślinki z gier: Ogrody z rozdziałów, Łącz i Hoduj z połączeń i najlepszego poziomu, Trójki z postępu", () => {
  const available = (context) =>
    shelfPlants(context)
      .filter((plant) => plant.available)
      .map((plant) => plant.id);
  const fresh = available(unlockContext({ profile: profileWith() }));
  assert.deepEqual(fresh, ["ogrody:monstera", "ogrody:pilea", "lacz:monstera:4"]);
  const advanced = available(
    unlockContext({
      profile: profileWith(
        { ogrodyChapters: 21, szklarniaBest: 6, trojkiLevels: 15 },
        { records: { szklarnia: { merges: 100 } } },
      ),
    }),
  );
  assert.ok(advanced.includes("ogrody:sowiStorczyk"));
  assert.ok(advanced.includes("ogrody:drzewoZycia"));
  assert.ok(advanced.includes("lacz:storczyk:6"));
  assert.ok(!advanced.includes("lacz:storczyk:7"));
  assert.ok(!advanced.includes("lacz:slonecznik:4"));
  assert.ok(advanced.includes("trojki:storczyk"));
  const all = shelfPlants(unlockContext({ profile: profileWith() }));
  assert.equal(all.length, 43 + 9 * 4 + 2);
  assert.ok(all.every((plant) => plant.label && plant.text));
});

test("w pokoju: zablokowana, obca albo nieznana ozdoba → domyślna (zapis bez zmian); „pusto” tylko gdzie wolno", () => {
  const context = unlockContext({ profile: profileWith({ whaleRides: 3 }) });
  const dziupla = {
    placed: {
      okno: "okno:ocean",
      sufit: "sufit:ksiezyc",
      dywan: "okno:chmury",
      zabawka: "zabawka:z-nowszej-wersji",
      roslina: null,
      wyglad: null,
      obrazek: "owl-40",
      "polka-2": "ogrody:pilea",
      "polka-3": "ogrody:drzewoZycia",
      "polka-4": "ogrody:monstera",
    },
  };
  const placed = resolvePlaced(dziupla, context);
  assert.equal(placed.okno, "okno:ocean");
  assert.equal(placed.sufit, "sufit:zarowka");
  assert.equal(placed.dywan, "dywan:rozowy");
  assert.equal(placed.zabawka, null);
  assert.equal(placed.roslina, null);
  assert.equal(placed.wyglad, "wyglad:jasne-drewno");
  assert.equal(placed.obrazek, "owl-01");
  assert.equal(placed["polka-2"], "ogrody:pilea");
  assert.equal(placed["polka-3"], null);
  assert.equal(placed["polka-4"], null, "4. miejsce jeszcze zamknięte");
  assert.equal(dziupla.placed.zabawka, "zabawka:z-nowszej-wersji");
});

test("placeDecor i markSeen: zmiana jednego miejsca, „pusto”, nieznane miejsce odrzucone", () => {
  const profile = {};
  assert.equal(placeDecor(profile, "okno", "okno:ocean"), true);
  assert.equal(placeDecor(profile, "okno", "okno:ocean"), false);
  assert.equal(placeDecor(profile, "polka-2", "ogrody:pilea"), true);
  assert.equal(placeDecor(profile, "zabawka", null), true);
  assert.equal(placeDecor(profile, "piwnica", "x"), false);
  assert.equal(profile.dziupla.placed.okno, "okno:ocean");
  assert.equal(profile.dziupla.placed["polka-2"], "ogrody:pilea");
  assert.equal(profile.dziupla.placed.zabawka, null);
  assert.equal(markSeen(profile, "okno:ocean", 5), true);
  assert.equal(markSeen(profile, "okno:ocean", 9), false);
  assert.deepEqual(profile.dziupla.seen, { "okno:ocean": 5 });
});

test("profil z polem dziupla ma ≤ 30 pól najwyższego poziomu (reguła Firestore)", () => {
  const platform = { DEFAULT_SETTINGS: {}, DEFAULT_MISSIONS: {}, DEFAULT_STATS: {} };
  const profile = {
    ...defaultProfile(platform),
    shop: {},
    dziupla: defaultDziupla(),
    createdAt: 1,
    updatedAt: 1,
    lastSeenAt: 1,
  };
  assert.ok(Object.keys(profile).length <= 30, String(Object.keys(profile).length));
});
