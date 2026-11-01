// Testy jednostkowe Sowiego Butiku (shared/meta/shop.js) i gatunków sów (shared/world/species.js), E9c.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  APOLOGY,
  apologyDue,
  buy,
  GOAT_LEVELS,
  goatTimeFactor,
  grantApology,
  linkSpecies,
  OUTFIT_PRICES,
  SAVE_DELAY_MS,
  selectSpecies,
  selectedSpecies,
  shopOffer,
  shopState,
  SPECIES_PRICES,
} from "../../shared/meta/shop.js";
import { DEFAULT_SPECIES, OWL_PALETTE, recolorOwl, SPECIES, speciesTransform } from "../../shared/world/species.js";
import { COSMETIC_SPRITES } from "../../shared/world/owl.js";

// Zdarzenia okna (sowie:shop-changed) — w Node globalThis nie jest celem zdarzeń.
const events = new EventTarget();
globalThis.addEventListener = events.addEventListener.bind(events);
globalThis.removeEventListener = events.removeEventListener.bind(events);
globalThis.dispatchEvent = events.dispatchEvent.bind(events);

const svg = (file) => readFileSync(new URL(`../../assets/svg/${file}`, import.meta.url), "utf8");

// Chmura w pamięci (jak SowieCloud: profile, updateProfile, isReady) i Akademia z piórkami.
function fakeCloud(profile = {}) {
  const state = { cosmetics: { unlocked: ["none", "bow"], selected: "none" }, ...profile };
  let saves = 0;
  let lastDelay;
  return {
    profile: () => state,
    isReady: () => true,
    updateProfile(mutator, options = {}) {
      mutator(state);
      saves += 1;
      lastDelay = options.delayMs;
    },
    saves: () => saves,
    lastDelay: () => lastDelay,
  };
}
function fakeAcademy(feathers, level = 1) {
  const data = { feathers, level };
  return {
    snapshot: () => ({ ...data }),
    spend(cost) {
      if (data.feathers < cost) return false;
      data.feathers -= cost;
      return true;
    },
    feathers: () => data.feathers,
  };
}

test("gatunki: 7 sów (Sówka + 6 z Analizy 2), pełne palety, ceny i poziomy w Butiku", () => {
  assert.deepEqual(
    SPECIES.map((item) => item.label),
    ["Sówka", "Puszczyk", "Pójdźka", "Uszatka", "Płomykówka", "Śnieżna", "Puchacz"],
  );
  assert.equal(DEFAULT_SPECIES, "sowka");
  for (const item of SPECIES) {
    assert.deepEqual(Object.keys(item.colors).sort(), Object.keys(OWL_PALETTE).sort(), item.id);
    for (const color of Object.values(item.colors)) assert.match(color, /^#[0-9a-f]{6}$/, item.id);
    if (item.id !== DEFAULT_SPECIES) assert.ok(SPECIES_PRICES[item.id]?.price > 0, item.id);
  }
  // Ceny rosną razem z wymaganym poziomem Akademii.
  const offers = Object.values(SPECIES_PRICES);
  for (let index = 1; index < offers.length; index += 1) {
    assert.ok(offers[index].price > offers[index - 1].price && offers[index].level > offers[index - 1].level);
  }
});

test("przekolorowanie: tylko kolory Sówki w plikach sowa/*.svg, jedno przejście, kontur bez zmian", () => {
  const body = svg("sowa/cialo.svg");
  const snowy = recolorOwl(body, "sniezna");
  for (const color of Object.values(OWL_PALETTE)) assert.ok(!snowy.toLowerCase().includes(color), color);
  assert.ok(snowy.includes("#eef1f6") && snowy.includes("#3b2f4a") && snowy.includes("#ff9fb2"));
  assert.equal(recolorOwl(body, "sowka"), body);
  assert.equal(recolorOwl(body, "nie-ma"), body);
  assert.equal(recolorOwl("#B07A52", "puszczyk"), "#8c7b6b", "wielkość liter bez znaczenia");
  assert.equal(speciesTransform("sowka"), null);
  assert.equal(speciesTransform("nie-ma"), null);
  const transform = speciesTransform("puchacz");
  assert.notEqual(transform("sowa/skrzydlo-lewe.svg", svg("sowa/skrzydlo-lewe.svg")), svg("sowa/skrzydlo-lewe.svg"));
  const goat = svg("kozki/koza-skok.svg");
  assert.equal(transform("kozki/koza-skok.svg", goat), goat, "inne grafiki bez zmian");
});

test("stan Butiku: domyślny, odporny na złe dane; mnożnik kózek z poziomu ulepszenia", () => {
  assert.deepEqual(shopState({}), {
    version: 1,
    species: { owned: ["sowka"], selected: "sowka" },
    goatLevel: 0,
    purchases: {},
  });
  const messy = shopState({
    shop: { species: { owned: ["puszczyk", 7, "nie-ma"], selected: "uszatka" }, goatLevel: 9 },
  });
  assert.deepEqual(messy.species, { owned: ["sowka", "puszczyk"], selected: "sowka" });
  assert.equal(messy.goatLevel, GOAT_LEVELS.length);
  assert.equal(goatTimeFactor({}), 1);
  assert.equal(goatTimeFactor({ shop: { goatLevel: 2 } }), 1.4);
  assert.equal(selectedSpecies({ shop: { species: { owned: ["puchacz"], selected: "puchacz" } } }), "puchacz");
});

test("oferta: posiadane, zablokowane poziomem i dostępne za piórka", () => {
  const profile = { cosmetics: { unlocked: ["none", "bow", "glasses"] }, shop: { goatLevel: 1 } };
  const offer = shopOffer(profile, { feathers: 45, level: 2 }, { glasses: { label: "Okulary" } });
  assert.equal(offer.feathers, 45);
  assert.equal(offer.outfits.length, Object.keys(OUTFIT_PRICES).length);
  assert.equal(offer.outfits.find((item) => item.key === "glasses").owned, true);
  assert.equal(offer.outfits.find((item) => item.key === "glasses").label, "Okulary");
  assert.equal(offer.outfits.find((item) => item.key === "crown").affordable, false);
  const species = Object.fromEntries(offer.species.map((item) => [item.key, item]));
  assert.equal(species.sowka.owned && species.sowka.selected, true);
  assert.equal(species.puszczyk.affordable, true);
  assert.equal(species.pojdzka.affordable, false, "50 piórek > 45");
  assert.equal(species.uszatka.locked, true, "poziom 3");
  assert.deepEqual(offer.goat.next, {
    id: "goat:2",
    key: "2",
    label: "Kózki ×1.4",
    price: 60,
    owned: false,
    level: 1,
    locked: false,
    affordable: false,
  });
  // Każdy strój z cennika ma nakładkę w garderobie.
  for (const key of Object.keys(OUTFIT_PRICES)) assert.ok(COSMETIC_SPRITES[key], key);
});

test("zakupy: piórka z Akademii, strój do garderoby, gatunek wybrany od razu, kolejne poziomy kózek", () => {
  const cloud = fakeCloud();
  const academy = fakeAcademy(200, 3);
  const events = [];
  globalThis.addEventListener("sowie:shop-changed", () => events.push("changed"));
  assert.deepEqual(buy("outfit:crown", { cloud, academy, now: () => 5 }), { ok: true });
  assert.ok(cloud.profile().cosmetics.unlocked.includes("crown"));
  assert.equal(academy.feathers(), 120);
  assert.deepEqual(buy("outfit:crown", { cloud, academy }), { ok: false, reason: "owned" });
  assert.deepEqual(buy("species:puchacz", { cloud, academy }), { ok: false, reason: "level" });
  assert.deepEqual(buy("species:uszatka", { cloud, academy, now: () => 6 }), { ok: true });
  assert.deepEqual(cloud.profile().shop.species, { owned: ["sowka", "uszatka"], selected: "uszatka" });
  assert.deepEqual(cloud.profile().shop.purchases, { "outfit:crown": 5, "species:uszatka": 6 });
  assert.deepEqual(buy("goat:2", { cloud, academy }), { ok: false, reason: "unknown" }, "najpierw poziom 1");
  assert.deepEqual(buy("goat:1", { cloud, academy }), { ok: true });
  assert.equal(goatTimeFactor(cloud.profile()), 1.2);
  assert.deepEqual(buy("goat:2", { cloud, academy }), { ok: false, reason: "feathers" });
  assert.equal(academy.feathers(), 30, "nieudany zakup nie zabiera piórek");
  assert.deepEqual(buy("outfit:crown", { cloud: { ...cloud, isReady: () => false }, academy }), {
    ok: false,
    reason: "offline",
  });
  assert.equal(selectSpecies("sowka", { cloud }), true);
  assert.equal(selectSpecies("sowka", { cloud }), false, "już wybrana");
  assert.equal(selectSpecies("puchacz", { cloud }), false, "nieposiadana");
  assert.equal(selectedSpecies(cloud.profile()), "sowka");
  assert.equal(events.length, 4);
});

test("uwaga G3: gatunki i kózki także z dziennika zakupów, wybór i zakup zapisują się od razu", () => {
  // Tablica posiadanych gatunków nadpisana zapisem ze strony ze starszym profilem — dziennik zakupów ma Płomykówkę.
  const profile = {
    shop: {
      species: { owned: ["sowka", "sniezna"], selected: "sniezna" },
      goatLevel: 0,
      purchases: { "species:sniezna": 1, "species:plomykowka": 2, "goat:1": 3, "species:nie-ma": 4 },
    },
  };
  assert.deepEqual(shopState(profile).species, { owned: ["sowka", "sniezna", "plomykowka"], selected: "sniezna" });
  assert.equal(shopState(profile).goatLevel, 1);
  const cloud = fakeCloud(profile);
  assert.equal(selectSpecies("plomykowka", { cloud }), true, "Płomykówkę da się wybrać");
  assert.ok(SAVE_DELAY_MS <= 1000);
  assert.equal(cloud.lastDelay(), SAVE_DELAY_MS, "wybór zapisuje się od razu, a nie po 30 s");
  assert.deepEqual(cloud.profile().shop.species, {
    owned: ["sowka", "sniezna", "plomykowka"],
    selected: "plomykowka",
  });
  assert.deepEqual(buy("species:puszczyk", { cloud, academy: fakeAcademy(100, 6), now: () => 9 }), { ok: true });
  assert.equal(cloud.lastDelay(), SAVE_DELAY_MS, "zakup zapisuje się od razu");
  assert.deepEqual(cloud.profile().shop.species.owned, ["sowka", "sniezna", "plomykowka", "puszczyk"]);
});

test("uwaga G3: przeprosinowe piórka — raz, tylko z zakupem gatunku sprzed poprawki", () => {
  const academy = () => {
    const awards = {};
    let feathers = 0;
    return {
      snapshot: () => ({ awards: { ...awards }, feathers }),
      award(id, xp, amount) {
        if (!awards[id]) {
          awards[id] = 1;
          feathers += amount;
        }
        return true;
      },
      feathers: () => feathers,
    };
  };
  const tester = academy();
  const before = fakeCloud({ shop: { purchases: { "species:sniezna": APOLOGY.before - 60_000 } } });
  assert.equal(apologyDue(before.profile()), true);
  assert.equal(grantApology({ cloud: before, academy: tester }), true);
  assert.equal(grantApology({ cloud: before, academy: tester }), false, "tylko raz");
  assert.equal(tester.feathers(), APOLOGY.feathers);
  assert.equal(APOLOGY.feathers, 50);
  const after = fakeCloud({ shop: { purchases: { "species:sniezna": APOLOGY.before + 60_000, "outfit:crown": 1 } } });
  assert.equal(apologyDue(after.profile()), false, "zakup po poprawce i strój — bez przeprosin");
  assert.equal(grantApology({ cloud: fakeCloud({}), academy: academy() }), false, "bez zakupów — nic");
  assert.equal(grantApology({ cloud: { ...before, isReady: () => false }, academy: academy() }), false);
});

test("linkSpecies: atlas dostaje przekolorowanie po wczytaniu chmury i po zmianie w Butiku", async () => {
  const cloud = fakeCloud({ shop: { species: { owned: ["puszczyk"], selected: "puszczyk" } } });
  let reload = null;
  cloud.ready = Promise.resolve();
  cloud.onProfileReload = (listener) => (reload = listener);
  const calls = [];
  const atlas = {
    setTransform(fn) {
      calls.push(fn);
      return Promise.resolve(true);
    },
  };
  const changes = [];
  const off = linkSpecies(atlas, { getCloud: () => cloud, onChange: (species) => changes.push(species) });
  await cloud.ready;
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(calls.length, 1);
  assert.equal(calls[0]("sowa/cialo.svg", "#b07a52"), "#8c7b6b");
  assert.deepEqual(changes, ["puszczyk"]);
  reload();
  assert.equal(calls.length, 1, "ten sam gatunek — bez przebudowy");
  selectSpecies("sowka", { cloud });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(calls.length, 2);
  assert.equal(calls[1], null, "Sówka — bez przekolorowania");
  off();
  cloud.profile().shop.species.selected = "puszczyk";
  reload();
  assert.equal(calls.length, 2, "po odłączeniu nic");
});
