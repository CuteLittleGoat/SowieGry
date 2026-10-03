// Sowie Ogrody — nowa odsłona (Analiza 3, E7a): ekonomia, silnik ogrodu (stuknięcia, zakupy, konewka, rozdziały,
// Wielkie Przesadzanie, drzewko prestiżu, offline), migracja stanu v2 → v3 i symulator tempa progresji (od E7c
// ze zdarzeniami; same zdarzenia — tests/unit/ogrody-zdarzenia.test.mjs).
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CHAPTERS,
  OFFLINE,
  PLANTS,
  PRESTIGE,
  PRESTIGE_TREE,
  SAVE_VERSION,
  UPGRADES,
  WATER,
} from "../../SowieOgrody/ogrod/config.js";
import {
  formatNumber,
  formatTime,
  maxAffordable,
  milestoneMultiplier,
  plantById,
  plantCost,
  plantStage,
  prestigeSeeds,
  production,
} from "../../SowieOgrody/ogrod/economy.js";
import { chapterIndex, chapterOpen, createGarden } from "../../SowieOgrody/ogrod/garden.js";
import { defaultState, loadState, migrateV2 } from "../../SowieOgrody/ogrod/state.js";

const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} ≠ ${expected} ± ${tolerance}`);

// Ogród z zegarem testu (ms).
function garden(state = defaultState(0)) {
  const clock = { now: 0 };
  return { clock, garden: createGarden({ state, now: () => clock.now }) };
}

test("dane: 6 rozdziałów z 3–5 celami, 11 roślin od tańszych do droższych, ulepszenia i drzewko prestiżu 3 × 3", () => {
  assert.deepEqual(
    CHAPTERS.map((chapter) => chapter.id),
    ["parapet", "balkon", "dzialka", "basen", "szklarnia", "arboretum"],
  );
  for (const chapter of CHAPTERS) assert.ok(chapter.goals.length >= 3 && chapter.goals.length <= 5, chapter.id);
  for (let index = 1; index < PLANTS.length; index += 1) {
    const [before, after] = [PLANTS[index - 1], PLANTS[index]];
    assert.ok(after.cost > before.cost * 5 && after.prod > before.prod * 3, after.id);
    // Czas zwrotu (cena / produkcja) rośnie z każdym gatunkiem.
    assert.ok(after.cost / after.prod > before.cost / before.prod, `${after.id}: zwrot`);
  }
  for (const plant of PLANTS)
    assert.ok(
      CHAPTERS.some((chapter) => chapter.id === plant.chapter),
      plant.id,
    );
  for (const upgrade of UPGRADES)
    assert.ok(
      CHAPTERS.some((chapter) => chapter.id === upgrade.chapter),
      upgrade.id,
    );
  const branches = [...new Set(PRESTIGE_TREE.map((node) => node.branch))];
  assert.deepEqual(branches, ["Korzenie", "Woda", "Sen"]);
  for (const branch of branches) assert.equal(PRESTIGE_TREE.filter((node) => node.branch === branch).length, 3);
  // Cele rozdziałów wskazują istniejące rośliny i ulepszenia.
  for (const goal of CHAPTERS.flatMap((chapter) => chapter.goals)) {
    if (goal.kind === "plant") assert.ok(plantById(goal.plant), goal.id);
    if (goal.kind === "upgrade")
      assert.ok(
        UPGRADES.some((upgrade) => upgrade.id === goal.upgrade),
        goal.id,
      );
  }
});

test("ceny: suma ciągu geometrycznego, maksymalny zakup, kamienie milowe ×2 od 25 i od 100, etapy wyglądu", () => {
  const monstera = plantById("monstera");
  assert.equal(plantCost(monstera, 0, 1), 15);
  let sum = 0;
  for (let index = 0; index < 10; index += 1) sum += monstera.cost * monstera.growth ** (3 + index);
  near(plantCost(monstera, 3, 10), Math.ceil(sum), 1, "10 sztuk od 3");
  assert.equal(plantCost(monstera, 5, 0), 0);
  const max = maxAffordable(monstera, 0, 1000);
  assert.ok(max.cost <= 1000 && plantCost(monstera, 0, max.amount + 1) > 1000, `${max.amount} sztuk`);
  assert.deepEqual(maxAffordable(monstera, 0, 10), { amount: 0, cost: 0 });
  assert.deepEqual([0, 24, 25, 99, 100, 300].map(milestoneMultiplier), [1, 1, 2, 2, 4, 4]);
  assert.deepEqual([0, 1, 9, 10, 25, 50, 100].map(plantStage), [0, 1, 1, 2, 3, 4, 5]);
});

test("produkcja: rośliny × ulepszenia × kamienie milowe; konewka, złota kózka, telefon Pracu i ciężarówka Amic", () => {
  const state = defaultState(0);
  state.plants = { monstera: 25, pilea: 2 };
  const base = production(state, 0);
  near(base.lps, 25 * 0.2 * 2 + 2 * 1, 1e-9, "bez ulepszeń");
  assert.equal(base.tap, 1);
  state.upgrades = { ziemia: 1, polki: 1, rekawiczki: 1, koszyk: 1 };
  const upgraded = production(state, 0);
  near(upgraded.lps, (25 * 0.2 * 2 + 2) * 1.5 * 2, 1e-9, "ziemia ×1,5, półki ×2");
  near(upgraded.tap, 3 + upgraded.lps * 0.02, 1e-9, "stuknięcie ×3 + 2% produkcji");
  state.upgrades.konewka = 1;
  state.effects = { watered: 1000, boost: 1000, pracu: 1000 };
  const boosted = production(state, 500);
  near(boosted.lps, upgraded.lps * WATER.multiplier * 3 * 0.7, 1e-6, "podlane ×2, kózka ×3, telefon ×0,7");
  near(boosted.base, upgraded.lps, 1e-9, "baza bez premii");
  assert.equal(production(state, 1000).boost, 1, "premie wygasają");
  state.blocked = "monstera";
  near(production(state, 2000).lps, 2 * 1.5 * 2, 1e-9, "Monstera pod ciężarówką nie produkuje");
});

test("silnik: stuknięcia, zakupy (×1, ×10, max), rozdziały odblokowują rośliny i ulepszenia po kolei", () => {
  const { garden: g } = garden();
  const state = g.state;
  assert.equal(chapterIndex(state), 0);
  assert.equal(g.buyPlant("monstera"), false, "bez liści");
  for (let index = 0; index < 30; index += 1) g.tap();
  assert.equal(state.leaves, 30);
  assert.equal(g.buyPlant("monstera"), true);
  assert.equal(state.leaves, 15);
  assert.equal(g.buyPlant("paproc"), false, "Paproć dopiero na Balkonie");
  assert.equal(chapterOpen(state, "balkon"), false);
  state.leaves = 10_000;
  assert.ok(g.buyPlant("monstera", 4));
  assert.equal(state.plants.monstera, 5);
  assert.ok(g.buyPlant("pilea", "max"));
  const events = g.takeEvents();
  assert.ok(events.some((event) => event.type === "chapter" && event.id === "parapet" && event.next === "balkon"));
  assert.equal(chapterIndex(state), 1);
  assert.equal(chapterOpen(state, "balkon"), true);
  assert.ok(state.plants.pilea >= 10);
  assert.ok(events.some((event) => event.type === "milestone" && event.id === "pilea" && event.owned === 10));
  assert.equal(g.buyUpgrade("kompost"), false, "Kompostownik dopiero na Działce");
  state.leaves = 2000;
  assert.ok(g.buyUpgrade("konewka"));
  assert.equal(g.buyUpgrade("konewka"), false, "drugi raz nie");
  assert.equal(state.can.charges, WATER.charges);
  const goals = g.goals();
  assert.equal(goals.chapter.id, "balkon");
  assert.equal(goals.goals.find((goal) => goal.id === "konewka").done, true);
  assert.equal(goals.goals.find((goal) => goal.id === "water3").done, false);
});

test("konewka: 3 ładunki, podlanie ×2 na 45 s (kolejne wydłuża), ładunek co 60 s, Zraszacz ×3 i co 40 s", () => {
  const { clock, garden: g } = garden();
  const state = g.state;
  state.chapters = { parapet: true };
  state.leaves = 2000;
  g.buyUpgrade("konewka");
  state.plants.monstera = 10;
  const dry = production(state, clock.now).lps;
  assert.ok(g.water());
  near(production(state, clock.now).lps, dry * 2, 1e-9, "×2");
  assert.equal(state.effects.watered, 45_000);
  assert.ok(g.water());
  assert.equal(state.effects.watered, 90_000, "drugie podlanie wydłuża");
  assert.ok(g.water());
  assert.equal(g.water(), false, "pusta konewka");
  assert.equal(state.stats.waterings, 3);
  for (let index = 0; index < 60; index += 1) g.update(1);
  assert.equal(state.can.charges, 1, "ładunek po 60 s");
  state.chapters.balkon = true;
  state.leaves = 1e6;
  assert.ok(g.buyUpgrade("zraszacz"));
  for (let index = 0; index < 40; index += 1) g.update(1);
  assert.equal(state.can.charges, 2, "z Zraszaczem co 40 s");
  clock.now = 200_000;
  assert.ok(g.water());
  near(production(state, clock.now).lps / production(state, 1e12).lps, 3, 1e-9, "Zraszacz ×3");
});

test("Wielkie Przesadzanie: po Szklarni i 10 mld liści; reset cyklu, zostają nasiona, drzewko, rozdziały, statystyki", () => {
  const { garden: g } = garden();
  const state = g.state;
  state.chapters = { parapet: true, balkon: true, dzialka: true, basen: true };
  state.runLeaves = 5e10;
  assert.equal(prestigeSeeds(state), 0, "Szklarnia nieukończona");
  state.chapters.szklarnia = true;
  assert.equal(prestigeSeeds(state), Math.floor(Math.sqrt(5e10 / PRESTIGE.divisor)));
  state.runLeaves = PRESTIGE.minRunLeaves - 1;
  assert.equal(prestigeSeeds(state), 0, "za mało liści w cyklu");
  state.runLeaves = 4e10;
  state.leaves = 1e9;
  state.plants = { monstera: 80, bonsai: 7 };
  state.upgrades = { ziemia: 1, konewka: 1 };
  state.seeds = 2;
  state.stats.taps = 500;
  state.lifetimeLeaves = 9e10;
  assert.equal(g.prestige(), 6);
  assert.equal(state.seeds, 8);
  assert.deepEqual(state.plants, {});
  assert.deepEqual(state.upgrades, {});
  assert.equal(state.leaves, 0);
  assert.equal(state.runLeaves, 0);
  assert.equal(state.lifetimeLeaves, 9e10);
  assert.equal(state.stats.prestiges, 1);
  assert.equal(state.stats.taps, 500);
  assert.equal(state.chapters.szklarnia, true, "rozdziały zostają");
  assert.equal(chapterIndex(state), 5, "Arboretum");
  assert.equal(g.prestige(), 0, "od razu drugi raz nie (0 liści w cyklu)");
  assert.ok(g.takeEvents().some((event) => event.type === "prestige" && event.seeds === 6));
});

test("drzewko prestiżu: wymagany poprzedni węzeł, koszt ×1,6 za poziom, limit poziomów; efekty", () => {
  const { garden: g } = garden();
  const state = g.state;
  state.seeds = 100;
  assert.equal(g.buyPrestige("szybkiStart"), false, "wymaga Korzeni");
  assert.ok(g.buyPrestige("korzenie"));
  assert.ok(g.buyPrestige("korzenie"));
  assert.equal(state.seeds, 100 - 1 - 2);
  assert.ok(g.buyPrestige("szybkiStart"));
  for (let index = 0; index < 5; index += 1) g.buyPrestige("senni");
  assert.equal(state.prestige.senni, 5);
  assert.equal(g.buyPrestige("senni"), false, "limit 5");
  state.plants = { monstera: 10 };
  near(production(state, 0).lps, 10 * 0.2 * 1.5, 1e-9, "Korzenie 2 × 25%");
  // Szybki parapet: nowy cykl z 25 Monsterami.
  state.chapters = { parapet: true, balkon: true, dzialka: true, basen: true, szklarnia: true };
  state.runLeaves = 2e10;
  g.prestige();
  assert.equal(state.plants.monstera, 25);
});

test("offline: 50% produkcji bazowej (bez premii), limit 4 h, poniżej minuty nic; konewka ładuje się; Senni +10%", () => {
  const { garden: g } = garden();
  const state = g.state;
  state.plants = { monstera: 10 };
  state.effects.watered = 1e12;
  const result = g.applyOffline(3600);
  near(result.leaves, 10 * 0.2 * 3600 * OFFLINE.efficiency, 1e-6, "1 h");
  assert.equal(result.seconds, 3600);
  assert.equal(g.applyOffline(30).leaves, 0, "pół minuty");
  const capped = g.applyOffline(10 * 3600);
  assert.equal(capped.seconds, OFFLINE.cap);
  state.prestige = { senni: 2, glebokiSen: 1 };
  const better = g.applyOffline(10 * 3600);
  assert.equal(better.seconds, OFFLINE.cap + 2 * 3600);
  near(better.leaves / better.seconds, 10 * 0.2 * (OFFLINE.efficiency + 0.2), 1e-6, "Senni 2 × 10%");
  state.upgrades.konewka = 1;
  state.can.charges = 0;
  g.applyOffline(150);
  assert.equal(state.can.charges, 2);
  assert.ok(g.takeEvents().some((event) => event.type === "offline"));
  assert.ok(state.stats.offlineLeaves > 0);
});

test("migracja stanu v2 → v3: rośliny pod nowymi nazwami, ulepszenia z odpowiednikiem, zwroty, rozdziały ze stref", () => {
  const old = {
    version: 2,
    createdAt: 1000,
    lastSavedAt: 5000,
    leaves: 12_345,
    water: 400,
    prestigeSeeds: 3,
    lifetimeLeaves: 9_000_000,
    currentRunLeaves: 2_000_000,
    zone: "plot",
    unlocked: ["parapet", "balcony", "plot"],
    plants: { monstera: 40, fern: 12, alocasia: 3, cactus: 2, nonsense: 9 },
    upgrades: { softGloves: 1, betterSoil: 1, wateringCan: 1, cuteLabels: 1, autoHarvestI: 1 },
    prestige: { roots: 2, sleepy: 1 },
    stats: { clicks: 777, watering: 5, buys: 60, prestiges: 1, golden: 4, bestLps: 321 },
    achievements: { firstPlant: 123 },
  };
  const { state, report } = migrateV2(old, 9000);
  assert.equal(state.version, SAVE_VERSION);
  assert.deepEqual(state.plants, { monstera: 40, paproc: 12, alokazja: 3, kaktus: 2 });
  assert.deepEqual(state.upgrades, { rekawiczki: 1, ziemia: 1, konewka: 1 });
  // Zwrot: Urocze etykietki 1000 + Pomocna konewka 3500 liści; Korzenie 1 + ceil(1,55) + Senni 2 nasion.
  assert.equal(report.refundLeaves, 4500);
  assert.equal(state.leaves, 12_345 + 4500);
  assert.equal(report.refundSeeds, 1 + 2 + 2);
  assert.equal(state.seeds, 3 + 5);
  assert.deepEqual(state.prestige, {});
  near(state.splash, 0.4, 1e-9, "woda → Plusk-o-metr");
  assert.deepEqual(state.chapters, { parapet: true, balkon: true });
  assert.equal(chapterIndex(state), 2, "Działka — jak dawna strefa");
  assert.equal(state.runLeaves, 2_000_000);
  assert.equal(state.lifetimeLeaves, 9_000_000);
  assert.equal(state.savedAt, 5000);
  assert.equal(state.stats.taps, 777);
  assert.equal(state.stats.prestiges, 1);
  assert.equal(state.stats.goats, 4);
  assert.equal(state.can.charges, 3);
  assert.deepEqual(state.achievements, { firstPlant: 123 });
  // Odczyt: brak stanu → nowy; v2 → migracja; v3 → bez zmian (uzupełnione pola).
  assert.equal(loadState(null, 1).state.leaves, 0);
  assert.ok(loadState(old, 1).report);
  const again = loadState(JSON.parse(JSON.stringify(state)), 1);
  assert.equal(again.report, null);
  assert.deepEqual(again.state.plants, state.plants);
  assert.equal(loadState({ version: 3, leaves: "zepsute" }, 1).state.leaves, 0);
});

test("liczby i czas po polsku", () => {
  assert.deepEqual([0, 7.5, 12, 999, 1500, 12_340, 2_500_000, 3.2e9, 4e12].map(formatNumber), [
    "0",
    "7,5",
    "12",
    "999",
    "1,5 tys.",
    "12,3 tys.",
    "2,5 mln",
    "3,2 mld",
    "4 bln",
  ]);
  assert.deepEqual([35, 250, 600, 3 * 3600 + 5 * 60].map(formatTime), ["35 s", "4 min 10 s", "10 min", "3 h 05 min"]);
});

// Generator liczb z ziarnem (powtarzalny symulator): mulberry32.
function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Symulator tempa: bot jak aktywny gracz — `taps` stuknięć/s, podlewa, kupuje ulepszenia (najtańsze), rośliny
// z celów rozdziału, potem najopłacalniejsze; reaguje na zdarzenia (telefon odrzuca po 2 s, ciężarówkę przegania
// po 3 s, złotą kózkę łapie w 80% po 1,5 s, Zatokę Humbaka zaczyna od razu i łapie `bay` liści); po przesadzaniu
// inwestuje nasiona. Zwraca czasy (min) i liczniki zdarzeń.
function simulate({ taps = 2, cycles = 1, hours = 8, bay = 0.7, seed = 7 } = {}) {
  const random = seeded(seed);
  const clock = { now: 0 };
  const g = createGarden({ state: defaultState(0), now: () => clock.now, random: seeded(seed + 1) });
  const state = g.state;
  const chapters = {};
  const prestiges = [];
  let tapCredit = 0;
  let truckSince = null;
  let goatDecided = false;
  const decided = new Set();
  for (let second = 0; second < hours * 3600; second += 1) {
    tapCredit += taps;
    while (tapCredit >= 1) {
      g.tap();
      tapCredit -= 1;
    }
    g.water();
    for (const upgrade of g.upgrades().sort((a, b) => a.cost - b.cost)) {
      if (!state.upgrades[upgrade.id] && upgrade.cost <= state.leaves) g.buyUpgrade(upgrade.id);
    }
    for (const goal of g.goals().goals) if (!goal.done && goal.kind === "plant") g.buyPlant(goal.plant, 1);
    for (let count = 0; count < 50; count += 1) {
      const best = g.bestPlant();
      if (!best || best.cost > state.leaves) break;
      g.buyPlant(best.plant.id, 1);
    }
    // Zdarzenia.
    if (state.phone && state.phone.time >= 2) g.hangUp();
    if (state.truck) {
      truckSince ??= second;
      if (second - truckSince >= 3) while (state.truck) g.shooTruck();
    } else truckSince = null;
    if (state.goat && state.goat.time >= 1.5 && !goatDecided) {
      goatDecided = true;
      if (random() < 0.8) g.catchGoat();
    }
    if (!state.goat) goatDecided = false;
    if (state.splash >= 1 && !state.bay) g.startBay();
    // Krok sekundy (w Zatoce — po 0,1 s, łapanie liści na szczycie lotu).
    const substeps = state.bay ? 10 : 1;
    for (let index = 0; index < substeps; index += 1) {
      clock.now += 1000 / substeps;
      g.update(1 / substeps);
      for (const leaf of state.bay?.leaves || []) {
        if (decided.has(leaf.id) || leaf.vy < 0) continue;
        decided.add(leaf.id);
        if (random() < bay) g.catchLeaf(leaf.x, leaf.y);
      }
      if (!state.bay) decided.clear();
    }
    for (const event of g.takeEvents()) if (event.type === "chapter") chapters[event.id] ??= (second + 1) / 60;
    if (prestigeSeeds(state) > 0) {
      prestiges.push((second + 1) / 60);
      g.prestige();
      for (let round = 0; round < 20; round += 1) {
        for (const node of ["korzenie", "szybkiStart", "pamiecPlusku", "senni", "studnia", "pamiecNasion"]) {
          g.buyPrestige(node);
        }
      }
      if (prestiges.length >= cycles) break;
    }
  }
  return { chapters, prestiges, stats: { ...state.stats } };
}

test("symulator: aktywna gra ze zdarzeniami — rozdziały po kolei, pierwsze Wielkie Przesadzanie po 2–3 h, kolejne cykle krótsze", () => {
  const active = simulate({ taps: 2, cycles: 3 });
  // Zdarzenia naprawdę się dzieją: kózka co ok. 2 min, Zatoka Humbaka co 5–10 min, telefon i ciężarówka co kilka min.
  const minutes = active.prestiges[2];
  const { goats, bays, calls, trucks } = active.stats;
  assert.ok(goats > minutes / 3 && goats < minutes, `kózki: ${goats} w ${minutes} min`);
  assert.ok(bays > minutes / 10 && bays < minutes / 5, `Zatoki: ${bays} w ${minutes} min`);
  assert.ok(calls > minutes / 5 && trucks > minutes / 8, `telefony ${calls}, ciężarówki ${trucks}`);
  const times = CHAPTERS.slice(0, 5).map((chapter) => active.chapters[chapter.id]);
  for (let index = 1; index < times.length; index += 1) assert.ok(times[index] > times[index - 1], `${times}`);
  assert.ok(times[0] < 3, `Parapet po ${times[0]} min`);
  assert.ok(times[1] < 20, `Balkon po ${times[1]} min`);
  const [first, second, third] = active.prestiges;
  assert.ok(first >= 120 && first <= 180, `pierwsze przesadzanie po ${first} min`);
  assert.ok(second - first < first * 0.75, `drugi cykl ${second - first} min`);
  assert.ok(third - second <= second - first, `trzeci cykl ${third - second} min`);
  // Spokojniejsza gra (stuknięcie co 2 s) — wolniej, ale też w kilka godzin.
  const calm = simulate({ taps: 0.5, bay: 0.4 });
  assert.ok(calm.prestiges[0] > first && calm.prestiges[0] < 240, `spokojnie: ${calm.prestiges[0]} min`);
});
