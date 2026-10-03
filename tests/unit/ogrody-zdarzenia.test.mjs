// Sowie Ogrody — zdarzenia aktywnej gry (Analiza 3, E7c1): telefon Pracu Pracu, ciężarówka Amic, złota kózka,
// Plusk-o-metr i Zatoka Humbaka; nieobecność bez kar.
import assert from "node:assert/strict";
import { test } from "node:test";
import { GARDEN_EVENTS, GOAT_REWARDS } from "../../SowieOgrody/ogrod/config.js";
import { production } from "../../SowieOgrody/ogrod/economy.js";
import { bayMultiplier, goatInterval } from "../../SowieOgrody/ogrod/events.js";
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
