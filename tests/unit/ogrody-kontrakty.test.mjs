// Sowie Ogrody — nowa odsłona (Analiza 3, E7d3): kontrakty dnia (dawne „Kontrakty ogrodnicze”).
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  claimContract,
  contractAward,
  DAILY_CONTRACTS,
  dailyContracts,
  dayKey,
  ensureDaily,
} from "../../SowieOgrody/ogrod/daily.js";
import { createGarden } from "../../SowieOgrody/ogrod/garden.js";
import { defaultState, loadState } from "../../SowieOgrody/ogrod/state.js";

const DAY = Date.UTC(2026, 9, 4, 10, 0, 0);

test("kontrakty dnia: 25 stuknięć, 6 roślin, 2 podlania — od linii bazowej pierwszego wejścia danego dnia", () => {
  assert.deepEqual(
    DAILY_CONTRACTS.map((item) => [item.id, item.stat, item.target, item.xp, item.feathers]),
    [
      ["clicks", "taps", 25, 30, 4],
      ["buys", "buys", 6, 35, 4],
      ["watering", "waterings", 2, 30, 4],
    ],
  );
  assert.equal(dayKey(DAY), "2026-10-04");
  assert.equal(contractAward("2026-10-04", "clicks"), "feature:ogrody:2026-10-04:clicks");
  const state = defaultState(0);
  Object.assign(state.stats, { taps: 100, buys: 40, waterings: 7 });
  assert.deepEqual(ensureDaily(state, DAY), {
    date: "2026-10-04",
    baseline: { taps: 100, buys: 40, waterings: 7 },
    claimed: {},
  });
  state.stats.taps = 120;
  state.stats.buys = 50;
  let list = dailyContracts(state, DAY);
  assert.deepEqual(
    list.map((item) => [item.id, item.progress, item.done]),
    [
      ["clicks", 20, false],
      ["buys", 6, true],
      ["watering", 0, false],
    ],
  );
  // Odbiór: tylko wykonany i tylko raz.
  assert.equal(claimContract(state, "clicks", DAY), null);
  const claimed = claimContract(state, "buys", DAY);
  assert.equal(claimed.award, "feature:ogrody:2026-10-04:buys");
  assert.equal(claimed.xp, 35);
  assert.equal(claimContract(state, "buys", DAY), null);
  list = dailyContracts(state, DAY);
  assert.equal(list.find((item) => item.id === "buys").claimed, true);
  // Następny dzień: nowa linia bazowa, nic odebranego.
  const next = DAY + 24 * 3600 * 1000;
  assert.deepEqual(
    dailyContracts(state, next).map((item) => [item.progress, item.claimed]),
    [
      [0, false],
      [0, false],
      [0, false],
    ],
  );
  assert.deepEqual(state.daily.baseline, { taps: 120, buys: 50, waterings: 7 });
});

test("kontrakty dnia w stanie: zapis i wczytanie, zostają po Wielkim Przesadzaniu", () => {
  const state = defaultState(0);
  assert.equal(state.daily, null);
  ensureDaily(state, DAY);
  state.daily.claimed.clicks = true;
  const { state: loaded } = loadState(JSON.parse(JSON.stringify(state)), DAY);
  assert.deepEqual(loaded.daily, state.daily);
  // Przesadzanie (po Szklarni, przy 10 mld liści cyklu) nie zeruje dnia kontraktów.
  const clock = { now: DAY };
  const g = createGarden({ state: loaded, now: () => clock.now, events: false });
  for (const id of ["parapet", "balkon", "dzialka", "basen", "szklarnia"]) g.state.chapters[id] = true;
  g.state.runLeaves = 2e10;
  assert.ok(g.prestige() > 0);
  assert.deepEqual(g.state.daily, state.daily);
});
