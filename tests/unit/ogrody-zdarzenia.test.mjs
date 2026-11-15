// Sowie Ogrody — zdarzenia aktywnej gry (Analiza 3, E7c1): telefon Pracu Pracu, ciężarówka Amic, złota kózka,
// Plusk-o-metr i Zatoka Humbaka; nieobecność bez kar; od uwag O11 i O12 (2026-11-15) ulepszenia rozdziałów 15–22
// i gałąź „Przyjaciele” drzewka prestiżu, które zmieniają zdarzenia.
import assert from "node:assert/strict";
import { test } from "node:test";
import { GARDEN_EVENTS, GOAT_REWARDS } from "../../SowieOgrody/ogrod/config.js";
import { production } from "../../SowieOgrody/ogrod/economy.js";
import {
  bayDuration,
  bayMultiplier,
  goatBonus,
  goatInterval,
  goatRewardText,
  truckInterval,
} from "../../SowieOgrody/ogrod/events.js";
import { createGarden } from "../../SowieOgrody/ogrod/garden.js";
import { defaultState, loadState } from "../../SowieOgrody/ogrod/state.js";

// Losowanie z kolejki (powtarzalne testy): kolejne wartości, potem 0,5.
const queue =
  (...values) =>
  () =>
    values.length ? values.shift() : 0.5;

function garden({ state = defaultState(0), random = queue() } = {}) {
  const clock = { now: 0 };
  const g = createGarden({ state, now: () => clock.now, random });
  const step = (seconds, dt = 1) => {
    for (let time = 0; time < seconds; time += dt) {
      clock.now += dt * 1000;
      g.update(dt);
    }
  };
  return { clock, g, state: g.state, step };
}

const open = (state, ...chapters) => {
  for (const id of chapters) state.chapters[id] = true;
  return state;
};

test("telefon Pracu: dopiero od Balkonu; dzwoni do odrzucenia (produkcja ×0,7), Tryb samolotowy milknie po 10 s", () => {
  const calm = garden();
  calm.state.plants.monstera = 10;
  calm.step(GARDEN_EVENTS.pracu.first + 5);
  assert.equal(calm.state.phone, null, "na Parapecie telefon nie dzwoni");

  const { g, state, step, clock } = garden({ state: open(defaultState(0), "parapet") });
  state.plants.monstera = 10;
  const before = production(state, clock.now).lps;
  step(GARDEN_EVENTS.pracu.first);
  assert.ok(state.phone, "dzwoni po odliczeniu");
  assert.ok(g.takeEvents().some((event) => event.type === "pracu"));
  assert.ok(Math.abs(production(state, clock.now).lps - before * 0.7) < 1e-9);
  step(600);
  assert.ok(state.phone, "bez odrzucenia dzwoni dalej");
  assert.equal(g.hangUp(), true);
  assert.equal(state.phone, null);
  assert.ok(Math.abs(production(state, clock.now).lps - before) < 1e-9);
  assert.equal(state.stats.calls, 1);
  // Następny telefon po 120–240 s gry; z Trybem samolotowym milknie sam.
  assert.ok(state.timers.pracu >= 120 && state.timers.pracu <= 240, `${state.timers.pracu}`);
  state.upgrades.samolot = 1;
  step(state.timers.pracu);
  assert.ok(state.phone);
  g.takeEvents();
  step(GARDEN_EVENTS.pracu.airplane);
  assert.equal(state.phone, null);
  assert.deepEqual(
    g.takeEvents().find((event) => event.type === "pracuEnd"),
    { type: "pracuEnd", auto: true },
  );
});

test("ciężarówka Amic: od Działki zastawia gatunek (nie produkuje), 3 stuknięcia ją przeganiają, Kozi kurier — 1", () => {
  const { g, state, step, clock } = garden({ state: open(defaultState(0), "parapet", "balkon"), random: queue(0, 0) });
  Object.assign(state.plants, { monstera: 50, pilea: 10, paproc: 5 });
  state.timers.goat = 1e9; // bez kózki (nie zużywa losowań)
  step(GARDEN_EVENTS.truck.first);
  assert.ok(state.truck, "ciężarówka przyjechała");
  // Zastawia najbardziej wydajny gatunek (z losowaniem 0 → pierwszy z trzech najlepszych).
  const prod = production({ ...state, blocked: null }, clock.now);
  const top = Object.entries(prod.perPlant).sort((a, b) => b[1] - a[1])[0][0];
  assert.equal(state.blocked, top);
  assert.equal(production(state, clock.now).perPlant[top], 0);
  g.takeEvents();
  assert.equal(g.shooTruck(), true);
  assert.equal(g.shooTruck(), true);
  assert.ok(state.truck, "po 2 stuknięciach stoi");
  g.shooTruck();
  assert.equal(state.truck, null);
  assert.equal(state.blocked, null);
  assert.deepEqual(
    g.takeEvents().map((event) => event.type),
    ["truckTap", "truckTap", "truckEnd"],
  );
  state.upgrades.kurier = 1;
  step(state.timers.truck);
  assert.ok(state.truck);
  g.shooTruck();
  assert.equal(state.truck, null, "Kozi kurier: jedno stuknięcie");
  assert.equal(state.stats.trucks, 2);
});

test("złota kózka: co 60–120 s (Kozie szczęście częściej), 7 s na złapanie; 4 premie i Plusk-o-metr", () => {
  assert.deepEqual(goatInterval(defaultState(0)), GARDEN_EVENTS.goat.every);
  const lucky = defaultState(0);
  lucky.prestige.kozieSzczescie = 2;
  assert.deepEqual(
    goatInterval(lucky).map((value) => Math.round(value)),
    GARDEN_EVENTS.goat.every.map((value) => Math.round(value * 0.7)),
  );
  assert.deepEqual(
    GOAT_REWARDS.map((reward) => reward.id),
    ["boost", "instant", "frenzy", "splash"],
  );
  // Ucieka po 7 s.
  const missed = garden();
  missed.step(GARDEN_EVENTS.goat.first);
  assert.ok(missed.state.goat);
  missed.step(GARDEN_EVENTS.goat.visible);
  assert.equal(missed.state.goat, null);
  assert.ok(missed.g.takeEvents().some((event) => event.type === "goatGone"));

  // Każda premia: losowanie wybiera premię (0 → boost, 0,25 → instant, 0,5 → frenzy, 0,75 → splash).
  const results = {};
  for (const [index, reward] of GOAT_REWARDS.entries()) {
    const { g, state, step, clock } = garden({ random: queue(index / 4 + 0.01) });
    state.plants.monstera = 100;
    step(GARDEN_EVENTS.goat.first);
    assert.equal(state.goat.reward, reward.id);
    const leaves = state.leaves;
    const taps = state.stats.taps;
    assert.equal(g.catchGoat(), reward.id);
    results[reward.id] = { state, step, clock, leaves, taps };
  }
  {
    const { state, clock } = results.boost;
    assert.equal(state.effects.boost, clock.now + GARDEN_EVENTS.boost.duration * 1000);
  }
  {
    const { state, leaves, clock } = results.instant;
    const gained = state.leaves - leaves;
    assert.ok(Math.abs(gained - production(state, clock.now).base * GARDEN_EVENTS.instant) < 1e-6, `${gained}`);
  }
  {
    // Kozi szał: 8 zbiorów/s przez 15 s (liście jak ze stuknięć), bez licznika stuknięć.
    const { state, step, clock, taps } = results.frenzy;
    const before = state.leaves;
    const prod = production(state, clock.now);
    step(GARDEN_EVENTS.frenzy.duration);
    const expected = (prod.lps + GARDEN_EVENTS.frenzy.taps * prod.tap) * GARDEN_EVENTS.frenzy.duration;
    assert.ok(Math.abs(state.leaves - before - expected) < 1e-6, `${state.leaves - before} ≠ ${expected}`);
    assert.equal(state.stats.taps, taps);
    step(5);
    assert.ok(state.leaves - before - expected < prod.lps * 5 + 1e-6, "po 15 s koniec szału");
  }
  assert.equal(results.splash.state.splash, GARDEN_EVENTS.splash.goat + GARDEN_EVENTS.splash.reward);
  assert.equal(results.boost.state.splash, GARDEN_EVENTS.splash.goat);
  assert.equal(results.boost.state.stats.goats, 1);
});

test("Plusk-o-metr: podlewanie i kózki go napełniają; pełny → Zatoka Humbaka (20 s, liście z combo, Echo humbaka)", () => {
  const { g, state, step, clock } = garden({ random: queue() });
  state.plants.monstera = 100;
  state.upgrades.konewka = 1;
  state.can.charges = 3;
  g.water();
  assert.equal(state.splash, GARDEN_EVENTS.splash.water);
  assert.equal(g.startBay(), false, "niepełny");
  state.splash = 0.95;
  g.takeEvents();
  g.water();
  assert.equal(state.splash, 1);
  assert.ok(g.takeEvents().some((event) => event.type === "bayReady"));
  assert.equal(g.startBay(), true);
  assert.equal(state.splash, 0);
  assert.ok(state.bay);
  assert.equal(g.startBay(), false, "druga naraz — nie");
  // W czasie Zatoki Plusk-o-metr nie rośnie, a kózki nie przychodzą.
  g.water();
  assert.equal(state.splash, 0);
  state.timers.goat = 0;
  // Liście wylatują z fontanny co 0,45 s; złapany liść = `leafSeconds` s produkcji × combo.
  step(1, 0.05);
  assert.equal(state.goat, null);
  assert.ok(state.bay.leaves.length >= 2);
  const leaf = state.bay.leaves[0];
  const base = production(state, clock.now).base;
  const gain = g.catchLeaf(leaf.x, leaf.y);
  assert.ok(Math.abs(gain - base * GARDEN_EVENTS.bay.leafSeconds * bayMultiplier(state, 1)) < 1e-6);
  assert.equal(g.catchLeaf(5, 5), 0, "pudło");
  const second = state.bay.leaves[0];
  g.catchLeaf(second.x, second.y);
  assert.equal(state.bay.combo, 2);
  // Upadły liść zeruje combo.
  step(4, 0.05);
  assert.equal(state.bay.combo, 0);
  assert.ok(state.bay.missed > 0);
  step(GARDEN_EVENTS.bay.duration, 0.05);
  assert.equal(state.bay, null);
  const end = g.takeEvents().find((event) => event.type === "bayEnd");
  assert.equal(end.caught, 2);
  assert.equal(end.bestCombo, 2);
  assert.equal(state.stats.bays, 1);
  // Echo humbaka: +25% za poziom; combo do ×2 (10 liści).
  const echo = defaultState(0);
  echo.prestige.echoHumbaka = 2;
  assert.equal(bayMultiplier(echo, 0), 1.5);
  assert.equal(bayMultiplier(defaultState(0), 25), 2);
});

test("nieobecność bez kar: offline liczy produkcję bez ciężarówki i telefonu, a potem ich nie ma", () => {
  const { g, state, step } = garden({ state: open(defaultState(0), "parapet", "balkon") });
  Object.assign(state.plants, { monstera: 50, pilea: 10 });
  state.timers.goat = 1e9;
  step(GARDEN_EVENTS.truck.first);
  state.phone = { time: 3 };
  state.effects.pracu = 10 ** 15;
  assert.ok(state.blocked);
  const full = production({ ...state, blocked: null, effects: {} }, 0).base;
  const before = state.leaves;
  const offline = g.applyOffline(3600);
  assert.ok(Math.abs(offline.leaves - full * 3600 * 0.5) < 1e-6);
  assert.ok(Math.abs(state.leaves - before - offline.leaves) < 1e-6);
  assert.equal(state.truck, null);
  assert.equal(state.blocked, null);
  assert.equal(state.phone, null);
  assert.equal(state.effects.pracu, 0);
});

test("stan: zdarzenia w zapisie; kózka i trwająca Zatoka nie przetrwają wczytania (Plusk-o-metr wraca pełny)", () => {
  const state = defaultState(0);
  assert.deepEqual(state.timers, {
    pracu: GARDEN_EVENTS.pracu.first,
    truck: GARDEN_EVENTS.truck.first,
    goat: GARDEN_EVENTS.goat.first,
  });
  const saved = JSON.parse(
    JSON.stringify({ ...state, goat: { time: 1, reward: "boost", dir: 1 }, bay: { time: 5, leaves: [] } }),
  );
  const { state: loaded } = loadState(saved, 0);
  assert.equal(loaded.goat, null);
  assert.equal(loaded.bay, null);
  assert.equal(loaded.splash, 1);
  // Stan sprzed E7c (bez liczników) dostaje domyślne.
  const old = JSON.parse(JSON.stringify(defaultState(0)));
  delete old.timers;
  assert.deepEqual(loadState(old, 0).state.timers, state.timers);
});

test("silnik bez zdarzeń (`events: false`): ani telefonu, ani ciężarówki, ani kózki", () => {
  const clock = { now: 0 };
  const g = createGarden({ state: open(defaultState(0), "parapet", "balkon"), now: () => clock.now, events: false });
  g.state.plants.monstera = 50;
  for (let second = 0; second < 900; second += 1) {
    clock.now += 1000;
    g.update(1);
  }
  assert.equal(g.state.phone, null);
  assert.equal(g.state.truck, null);
  assert.equal(g.state.goat, null);
  assert.deepEqual(g.state.timers, defaultState(0).timers);
});

test("trigger (testy e2e): telefon, ciężarówka i kózka z wybraną premią od razu; drugi raz — nie", () => {
  const { g, state } = garden({ state: open(defaultState(0), "parapet") });
  state.plants.monstera = 20;
  assert.equal(g.trigger("pracu"), true);
  assert.ok(state.phone);
  assert.equal(g.trigger("pracu"), false);
  assert.equal(g.trigger("truck"), true);
  assert.equal(state.blocked, "monstera");
  assert.equal(g.trigger("goat", "instant"), true);
  assert.equal(state.goat.reward, "instant");
  assert.equal(g.trigger("goat", "boost"), false);
  assert.equal(g.trigger("burza"), false);
  assert.deepEqual(
    g.takeEvents().map((event) => event.type),
    ["pracu", "truck", "goat"],
  );
});

test("nowe ulepszenia (uwaga O11): strach na wróble — ciężarówka 2× rzadziej, koniczyna — kózki o 25% częściej, Echo groty — Zatoka +10 s", () => {
  const state = defaultState(0);
  assert.deepEqual(truckInterval(state), GARDEN_EVENTS.truck.every);
  assert.equal(bayDuration(state), GARDEN_EVENTS.bay.duration);
  state.upgrades.strachNaWroble = 1;
  assert.deepEqual(
    truckInterval(state),
    GARDEN_EVENTS.truck.every.map((value) => value * 2),
  );
  state.upgrades.koniczyna = 1;
  assert.deepEqual(
    goatInterval(state),
    GARDEN_EVENTS.goat.every.map((value) => value / 1.25),
  );
  state.prestige.kozieSzczescie = 2;
  assert.deepEqual(
    goatInterval(state).map((value) => Math.round(value * 100)),
    GARDEN_EVENTS.goat.every.map((value) => Math.round(((value * 0.7) / 1.25) * 100)),
  );
  state.upgrades.echoGroty = 1;
  assert.equal(bayDuration(state), GARDEN_EVENTS.bay.duration + 10);

  // W silniku: po przyjeździe następna ciężarówka za 360–600 s (losowanie 0,5 → środek przedziału, 480 s), Zatoka
  // trwa 30 s.
  const { g, state: live, step } = garden({ random: queue() });
  open(live, "parapet", "balkon");
  live.plants.monstera = 10;
  live.upgrades.strachNaWroble = 1;
  live.upgrades.echoGroty = 1;
  step(GARDEN_EVENTS.truck.first);
  assert.ok(live.truck, "pierwsza ciężarówka po 120 s");
  assert.equal(live.timers.truck, GARDEN_EVENTS.truck.every[0] + GARDEN_EVENTS.truck.every[1]);
  live.splash = 1;
  assert.ok(g.startBay());
  assert.equal(live.bay.time, GARDEN_EVENTS.bay.duration + 10);
});

test("gałąź „Przyjaciele” (uwaga O12): Złota obroża — premie kózki +25% za poziom (z komunikatem), Latarnia humbaka — Zatoka +4 s", () => {
  const plain = defaultState(0);
  assert.equal(goatBonus(plain), 1);
  for (const reward of GOAT_REWARDS) assert.equal(goatRewardText(plain, reward.id), reward.text);
  const collared = defaultState(0);
  collared.prestige.zlotaObroza = 2;
  assert.equal(goatBonus(collared), 1.5);
  assert.equal(goatRewardText(collared, "boost"), "Złota kózka: produkcja ×3 przez 45 s!");
  assert.equal(goatRewardText(collared, "instant"), "Złota kózka: liście z 1 min 30 s produkcji!");
  assert.equal(goatRewardText(collared, "frenzy"), "Kozi szał! Kózka zbiera liście przez 23 s");
  assert.equal(goatRewardText(collared, "splash"), "Złota kózka: Plusk-o-metr +70%!");
  // Premie w silniku: dłuższe ×3 i kozi szał, więcej liści i Plusk-o-metru.
  const results = {};
  for (const [index, reward] of GOAT_REWARDS.entries()) {
    const state = defaultState(0);
    state.prestige.zlotaObroza = 2;
    const run = garden({ state, random: queue(index / 4 + 0.01) });
    run.state.plants.monstera = 100;
    run.step(GARDEN_EVENTS.goat.first);
    const leaves = run.state.leaves;
    assert.equal(run.g.catchGoat(), reward.id);
    results[reward.id] = { ...run, leaves };
  }
  assert.equal(results.boost.state.effects.boost, results.boost.clock.now + GARDEN_EVENTS.boost.duration * 1.5 * 1000);
  assert.equal(
    results.frenzy.state.effects.frenzy,
    results.frenzy.clock.now + GARDEN_EVENTS.frenzy.duration * 1.5 * 1000,
  );
  const { state, clock, leaves } = results.instant;
  const gained = state.leaves - leaves;
  const expected = production(state, clock.now).base * GARDEN_EVENTS.instant * 1.5;
  assert.ok(Math.abs(gained - expected) < 1e-6, `${gained} ≠ ${expected}`);
  assert.ok(
    Math.abs(results.splash.state.splash - (GARDEN_EVENTS.splash.goat + GARDEN_EVENTS.splash.reward * 1.5)) < 1e-9,
  );
  // Latarnia humbaka: +4 s za poziom (razem z Echem groty).
  const lantern = defaultState(0);
  lantern.prestige.latarniaHumbaka = 3;
  assert.equal(bayDuration(lantern), GARDEN_EVENTS.bay.duration + 12);
  lantern.upgrades.echoGroty = 1;
  assert.equal(bayDuration(lantern), GARDEN_EVENTS.bay.duration + 22);
});
