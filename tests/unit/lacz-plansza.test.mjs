// Łącz i Hoduj (nowa Sowia Szklarnia, Analiza 3, E8 — kroki 8.0–8.1): plansza 7 × 9, łączenie w łańcuchach,
// hybrydy, Sowia doniczka, kompostownik, zamówienia sąsiadek, odnawianie pomieszczeń z ułatwieniami, zapis stanu
// i to, że plansza nigdy nie blokuje się bez wyjścia.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canMerge,
  cellIndex,
  hybridOf,
  isTop,
  mergeablePairs,
  cellPosition,
  createBoard,
  emptyCells,
  exits,
  itemName,
  maxLevel,
  moveItem,
  spawnItem,
  spawnNear,
} from "../../LaczIHoduj/board.js";
import {
  BOARD,
  CHAINS,
  COMPOST_LEAVES,
  HYBRIDS,
  MERGE_LEAVES,
  NEIGHBORS,
  ORDERS,
  PERKS,
  POT,
  ROOMS,
  SAVE_VERSION,
} from "../../LaczIHoduj/config.js";
import {
  RENOVATION_STEPS,
  createGame,
  defaultState,
  hasPerk,
  potMax,
  potRegen,
  renovation,
  loadState,
  makeOrder,
  orderCells,
  orderLevels,
  orderReward,
  pickChain,
  potChains,
  validOrder,
} from "../../LaczIHoduj/game.js";

const seed = (level) => ({ chain: "monstera", level });
const queue =
  (...values) =>
  () =>
    values.length ? values.shift() : 0;

test("dane: plansza 7 × 9, łańcuch Monstery w 5 poziomach, doniczka, nagrody rosną z poziomem", () => {
  assert.deepEqual(BOARD, { cols: 7, rows: 9 });
  assert.deepEqual(CHAINS.monstera.levels, ["Nasionko", "Kiełek", "Sadzonka", "Monstera", "Złota Monstera"]);
  assert.equal(maxLevel("monstera"), 5);
  assert.equal(itemName(seed(3)), "Sadzonka");
  assert.equal(SAVE_VERSION, 2);
  assert.ok(POT.max >= 10 && POT.regen > 0);
  for (const list of [MERGE_LEAVES, COMPOST_LEAVES]) {
    for (let level = 2; level < list.length; level += 1) assert.ok(list[level] > list[level - 1]);
  }
});

test("ruchy: przeniesienie na wolne pole, połączenie takich samych, zamiana różnych; najwyższy poziom się nie łączy", () => {
  const board = createBoard(BOARD);
  assert.equal(board.cells.length, 63);
  assert.equal(cellIndex(board, 2, 3), 23);
  assert.deepEqual(cellPosition(board, 23), { col: 2, row: 3 });
  board.cells[0] = seed(1);
  board.cells[1] = seed(1);
  board.cells[2] = seed(2);
  assert.deepEqual(moveItem(board, 0, 10), { type: "move", item: seed(1) });
  assert.equal(board.cells[0], null);
  assert.deepEqual(moveItem(board, 10, 1), { type: "merge", item: seed(2) });
  assert.equal(board.cells[10], null);
  assert.deepEqual(board.cells[1], seed(2));
  assert.deepEqual(moveItem(board, 1, 2), { type: "merge", item: seed(3) });
  board.cells[5] = seed(1);
  assert.equal(moveItem(board, 5, 2).type, "swap");
  assert.deepEqual(board.cells[2], seed(1));
  assert.deepEqual(board.cells[5], seed(3));
  assert.equal(moveItem(board, 5, 5).type, "none");
  assert.equal(moveItem(board, 20, 21).type, "none", "z pustego pola");
  board.cells[30] = seed(5);
  board.cells[31] = seed(5);
  assert.equal(canMerge(seed(5), seed(5)), false);
  assert.equal(moveItem(board, 30, 31).type, "swap");
});

test("Sowia doniczka: nasionko na losowym wolnym polu, ładunki wracają co 3 s, pełna plansza — nic", () => {
  const game = createGame({ state: defaultState(0), random: queue(0) });
  const free = emptyCells(game.board);
  const index = game.tapPot();
  assert.equal(index, free[0]);
  assert.deepEqual(game.board.cells[index], seed(1));
  assert.equal(game.state.pot.charges, POT.max - 1);
  assert.deepEqual(game.state.cells[index], seed(1), "stan zsynchronizowany");
  game.update(POT.regen - 0.1);
  assert.equal(game.state.pot.charges, POT.max - 1);
  game.update(0.2);
  assert.equal(game.state.pot.charges, POT.max);
  game.state.pot.charges = 0;
  assert.equal(game.tapPot(), -1);
  assert.equal(game.takeEvents().at(-1).type, "potEmpty");
  game.state.pot.charges = 3;
  for (const cell of emptyCells(game.board)) game.board.cells[cell] = seed(5);
  assert.equal(game.tapPot(), -1);
  assert.equal(game.takeEvents().at(-1).type, "boardFull");
  assert.equal(game.state.pot.charges, 3, "bez miejsca ładunek zostaje");
  assert.equal(spawnItem(game.board, seed(1)), -1);
});

test("łączenie daje liście i statystyki; Złota Monstera to szczyt łańcucha; kompost zwalnia pole za liście", () => {
  const state = defaultState(0);
  const game = createGame({ state });
  game.board.cells.fill(null);
  game.board.cells[0] = seed(4);
  game.board.cells[1] = seed(4);
  game.move(0, 1);
  const merge = game.takeEvents().find((event) => event.type === "merge");
  assert.deepEqual(merge, { type: "merge", from: 0, to: 1, item: seed(5), leaves: MERGE_LEAVES[5], top: true });
  assert.equal(state.leaves, MERGE_LEAVES[5]);
  assert.equal(state.stats.merges, 1);
  assert.equal(state.stats.best, 5);
  assert.deepEqual(game.compost(1), seed(5));
  assert.equal(state.leaves, MERGE_LEAVES[5] + COMPOST_LEAVES[5]);
  assert.equal(game.board.cells[1], null);
  assert.equal(game.compost(1), null, "puste pole");
  assert.equal(state.stats.composted, 1);
});

test("plansza nigdy nie blokuje się bez wyjścia: pełna i bez par wciąż ma kompost, po nim doniczka znowu działa", () => {
  const game = createGame({ state: defaultState(0), random: queue(0.5) });
  const levels = [1, 2, 3, 4, 5];
  // Pełna plansza bez żadnej pary do połączenia: po jednym przedmiocie z poziomów 1–4 i reszta Złotych Monster.
  game.board.cells = game.board.cells.map((_, index) => seed(index < 4 ? levels[index] : 5));
  assert.deepEqual(exits(game.board), { merges: 0, empty: 0, compost: 63 });
  assert.equal(game.tapPot(), -1);
  // Wyjście: kompost zwalnia pole, a doniczka znowu kładzie nasionko — teraz jest para (dwa nasionka).
  game.compost(10);
  const spawned = game.tapPot();
  assert.equal(spawned, 10);
  assert.equal(exits(game.board).merges, 1);
  // Losowe plansze: zawsze jest jakieś wyjście (połączenie, wolne pole albo kompost).
  let value = 1;
  const random = () => (value = (value * 16807) % 2147483647) / 2147483647;
  for (let round = 0; round < 200; round += 1) {
    const board = createBoard(BOARD);
    board.cells = board.cells.map(() => (random() < 0.85 ? seed(1 + Math.floor(random() * 5)) : null));
    const way = exits(board);
    assert.ok(way.merges > 0 || way.empty > 0 || way.compost > 0, `runda ${round}`);
  }
});

test("stan: nowa gra z przedmiotami startowymi, zapis i wczytanie, niepoprawne pola i inna wersja — od nowa", () => {
  const state = defaultState(1000);
  assert.equal(state.version, 2);
  assert.equal(state.cells.length, 63);
  assert.ok(state.cells.filter(Boolean).length >= 4);
  assert.ok(exits(createBoard({ ...BOARD, cells: state.cells })).merges >= 2, "od razu jest co łączyć");
  const copy = JSON.parse(JSON.stringify({ ...state, leaves: 42 }));
  copy.cells[0] = { chain: "palma", level: 2 };
  copy.cells[1] = { chain: "monstera", level: 9 };
  copy.pot.charges = 99;
  const loaded = loadState(copy, 2000);
  assert.equal(loaded.leaves, 42);
  assert.equal(loaded.cells[0], null);
  assert.equal(loaded.cells[1], null);
  assert.equal(loaded.pot.charges, POT.max);
  assert.equal(loadState({ version: 1, leaves: 5 }, 0).leaves, 0, "stan dawnej Szklarni (v1) — nowa gra");
  assert.equal(loadState(null, 0).cells.length, 63);
});

test("cztery łańcuchy po 5 poziomów i trzy hybrydy z dawnej Szklarni; doniczka odblokowuje łańcuchy z połączeniami", () => {
  for (const chain of ["monstera", "pilea", "paproc", "kaktus"]) {
    assert.equal(maxLevel(chain), 5, chain);
    assert.equal(CHAINS[chain].hybrid, undefined);
  }
  assert.equal(itemName({ chain: "kaktus", level: 5 }), "Kwitnący Kaktus");
  for (const id of Object.keys(HYBRIDS)) {
    assert.equal(CHAINS[id].hybrid, true);
    assert.equal(maxLevel(id), 1);
    for (const parent of HYBRIDS[id].parents) assert.ok(CHAINS[parent], `${id}: ${parent}`);
  }
  assert.deepEqual(
    potChains(0).map((entry) => entry.chain),
    ["monstera"],
  );
  assert.deepEqual(
    potChains(30).map((entry) => entry.chain),
    ["monstera", "pilea", "paproc"],
  );
  assert.equal(potChains(60).length, 4);
  // Losowanie z wagami (monstera 4, pilea 3, paproć 2, kaktus 2 — razem 11).
  assert.equal(
    pickChain(0, () => 0.99),
    "monstera",
  );
  assert.equal(
    pickChain(100, () => 0),
    "monstera",
  );
  assert.equal(
    pickChain(100, () => 5 / 11),
    "pilea",
  );
  assert.equal(
    pickChain(100, () => 8 / 11),
    "paproc",
  );
  assert.equal(
    pickChain(100, () => 0.999),
    "kaktus",
  );
});

test("hybrydy: dwie różne rośliny najwyższego poziomu z przepisu (kolejność dowolna); hybryda się nie łączy z taką samą", () => {
  const top = (chain) => ({ chain, level: maxLevel(chain) });
  assert.equal(hybridOf(top("monstera"), top("pilea")), "monpilea");
  assert.equal(hybridOf(top("pilea"), top("monstera")), "monpilea");
  assert.equal(hybridOf(top("kaktus"), top("paproc")), "alopaproc");
  assert.equal(hybridOf(top("monpilea"), top("alopaproc")), "zlotolistka");
  assert.equal(hybridOf(top("monstera"), top("kaktus")), null, "bez przepisu");
  assert.equal(hybridOf({ chain: "monstera", level: 4 }, top("pilea")), null, "nie najwyższy poziom");
  assert.equal(hybridOf(top("monstera"), top("monstera")), null);
  assert.ok(isTop(top("zlotolistka")));
  const board = createBoard(BOARD);
  board.cells[0] = top("monstera");
  board.cells[1] = top("pilea");
  board.cells[2] = top("monpilea");
  board.cells[3] = top("monpilea");
  assert.equal(mergeablePairs(board), 1, "jedna para do hybrydy, dwie Monpilee się nie łączą");
  assert.deepEqual(moveItem(board, 0, 1), { type: "hybrid", item: { chain: "monpilea", level: 1 } });
  assert.equal(board.cells[0], null);
  assert.equal(moveItem(board, 2, 3).type, "swap");

  // W grze: liście za hybrydę, statystyka, kompost hybrydy, odblokowanie łańcucha po progu połączeń.
  const game = createGame({ state: defaultState(0), random: queue(0) });
  game.board.cells.fill(null);
  game.board.cells[0] = top("paproc");
  game.board.cells[1] = top("kaktus");
  game.state.stats.merges = 9;
  game.move(0, 1);
  const events = game.takeEvents();
  assert.deepEqual(
    events.find((event) => event.type === "hybrid"),
    {
      type: "hybrid",
      from: 0,
      to: 1,
      item: { chain: "alopaproc", level: 1 },
      leaves: HYBRIDS.alopaproc.leaves,
    },
  );
  assert.deepEqual(
    events.find((event) => event.type === "unlock"),
    { type: "unlock", chain: "pilea", name: "Pilea" },
  );
  assert.equal(game.state.leaves, HYBRIDS.alopaproc.leaves);
  assert.equal(game.state.stats.hybrids, 1);
  assert.equal(game.state.stats.merges, 10);
  game.compost(1);
  assert.equal(game.state.leaves, HYBRIDS.alopaproc.leaves + HYBRIDS.alopaproc.compost);
  // Zapis i wczytanie zachowują hybrydy i inne łańcuchy.
  game.board.cells[5] = top("zlotolistka");
  game.board.cells[6] = { chain: "kaktus", level: 3 };
  const loaded = loadState(JSON.parse(JSON.stringify({ ...game.state, cells: game.board.cells })), 0);
  assert.deepEqual(loaded.cells[5], top("zlotolistka"));
  assert.deepEqual(loaded.cells[6], { chain: "kaktus", level: 3 });
});

test("zamówienia: trzy sąsiadki, poziomy rosną z wykonanymi zamówieniami, pary, hybrydy i nagrody", () => {
  const state = defaultState(0);
  assert.equal(state.orders.length, NEIGHBORS.length);
  state.orders.forEach((order, slot) => {
    assert.ok(validOrder(order, NEIGHBORS[slot].id), JSON.stringify(order));
    assert.equal(order.chain, "monstera", "na starcie w doniczce jest tylko Monstera");
    assert.equal(order.level, 2, "pierwsze zamówienia — Kiełek");
  });
  assert.deepEqual(orderLevels(0), { min: 2, max: 2 });
  assert.deepEqual(orderLevels(3), { min: 2, max: 3 });
  assert.deepEqual(orderLevels(9), { min: 3, max: 5 });
  assert.deepEqual(orderLevels(100), { min: 3, max: 5 });
  // Losowanie: łańcuch (wagi doniczki), poziom w zakresie, para tylko do poziomu 3.
  assert.deepEqual(makeOrder("puszczyk", { done: 0, merges: 0 }, queue(0, 0, 0)), {
    neighbor: "puszczyk",
    chain: "monstera",
    level: 2,
    count: 2,
  });
  assert.deepEqual(makeOrder("pojdzka", { done: 9, merges: 100 }, queue(0.5, 5 / 11, 0.99)), {
    neighbor: "pojdzka",
    chain: "pilea",
    level: 5,
    count: 1,
  });
  // Hybryda od 8 zamówień, gdy jej składniki są w doniczce (Monpilea po odblokowaniu Pilei).
  assert.equal(makeOrder("puszczyk", { done: 7, merges: 100 }, queue(0, 0, 0, 0)).chain, "monstera");
  assert.deepEqual(makeOrder("puszczyk", { done: 8, merges: 10 }, queue(0, 0)), {
    neighbor: "puszczyk",
    chain: "monpilea",
    level: 1,
    count: 1,
  });
  // Bez powtórek zamówień innych sąsiadek (kolejna próba losowania).
  const taken = [{ neighbor: "plomykowka", chain: "monstera", level: 2, count: 1 }];
  const fresh = makeOrder("puszczyk", { done: 3, merges: 0 }, queue(0, 0, 0.9, 0, 0.99, 0.9), taken);
  assert.deepEqual(fresh, { neighbor: "puszczyk", chain: "monstera", level: 3, count: 1 });
  // Nagrody.
  assert.deepEqual(orderReward({ chain: "monstera", level: 2, count: 1 }), { leaves: ORDERS.leaves[2], stars: 1 });
  assert.deepEqual(orderReward({ chain: "pilea", level: 3, count: 2 }), { leaves: ORDERS.leaves[3] * 2, stars: 2 });
  assert.deepEqual(orderReward({ chain: "kaktus", level: 5, count: 1 }), { leaves: ORDERS.leaves[5], stars: 3 });
  assert.deepEqual(orderReward({ chain: "monpilea", level: 1, count: 1 }), {
    leaves: ORDERS.hybridLeaves,
    stars: ORDERS.hybridStars,
  });
  // Niepoprawne zamówienia.
  assert.equal(validOrder({ neighbor: "puszczyk", chain: "palma", level: 2, count: 1 }, "puszczyk"), false);
  assert.equal(validOrder({ neighbor: "puszczyk", chain: "monstera", level: 6, count: 1 }, "puszczyk"), false);
  assert.equal(validOrder({ neighbor: "puszczyk", chain: "monstera", level: 2, count: 3 }, "puszczyk"), false);
  assert.equal(validOrder({ neighbor: "pojdzka", chain: "monstera", level: 2, count: 1 }, "puszczyk"), false);
});

test("zamówienia w grze: oddanie roślin z planszy (najpierw przeciągnięta), liście i gwiazdki, nowe zamówienie, zapis", () => {
  const game = createGame({ state: defaultState(0), random: queue(0) });
  game.board.cells.fill(null);
  game.state.orders[0] = { neighbor: "puszczyk", chain: "pilea", level: 3, count: 2 };
  game.board.cells[4] = { chain: "pilea", level: 3 };
  assert.equal(game.orderCells(0), null, "jedna sztuka z dwóch");
  assert.equal(game.deliver(0), null);
  assert.deepEqual(game.takeEvents(), [{ type: "orderMissing", slot: 0, order: game.state.orders[0] }]);
  game.board.cells[9] = { chain: "pilea", level: 3 };
  game.board.cells[20] = { chain: "pilea", level: 3 };
  assert.deepEqual(orderCells(game.board.cells, game.state.orders[0], 20), [20, 4], "najpierw pole przeciągnięte");
  assert.deepEqual(game.orderCells(0), [4, 9]);
  const order = game.state.orders[0];
  assert.deepEqual(game.deliver(0, 20), { leaves: ORDERS.leaves[3] * 2, stars: 2 });
  assert.equal(game.board.cells[20], null);
  assert.equal(game.board.cells[4], null);
  assert.deepEqual(game.board.cells[9], { chain: "pilea", level: 3 });
  assert.equal(game.state.leaves, ORDERS.leaves[3] * 2);
  assert.equal(game.state.stars, 2);
  assert.equal(game.state.stats.orders, 1);
  assert.equal(game.state.cells[20], null, "stan planszy zsynchronizowany");
  const events = game.takeEvents();
  assert.deepEqual(events[0], {
    type: "order",
    slot: 0,
    order,
    cells: [20, 4],
    leaves: ORDERS.leaves[3] * 2,
    stars: 2,
  });
  assert.equal(events[1].type, "newOrder");
  assert.ok(validOrder(game.state.orders[0], "puszczyk"), "sąsiadka od razu prosi o coś nowego");
  assert.deepEqual(events[1].order, game.state.orders[0]);
  // Hybryda w zamówieniu.
  game.state.orders[1] = { neighbor: "plomykowka", chain: "monpilea", level: 1, count: 1 };
  game.board.cells[30] = { chain: "monpilea", level: 1 };
  assert.deepEqual(game.deliver(1), { leaves: ORDERS.hybridLeaves, stars: ORDERS.hybridStars });
  // Zapis i wczytanie: zamówienia i gwiazdki zostają; niepoprawne zamówienie i stan sprzed zamówień — nowe.
  const saved = JSON.parse(JSON.stringify(game.state));
  const loaded = loadState(saved, 0);
  assert.deepEqual(loaded.orders, saved.orders);
  assert.equal(loaded.stars, saved.stars);
  saved.orders[2] = { neighbor: "pojdzka", chain: "palma", level: 2, count: 1 };
  saved.stars = -5;
  const repaired = loadState(saved, 0, queue(0));
  assert.ok(validOrder(repaired.orders[2], "pojdzka"));
  assert.deepEqual(repaired.orders[0], saved.orders[0]);
  assert.equal(repaired.stars, 0);
  const old = JSON.parse(JSON.stringify(saved));
  delete old.orders;
  delete old.stars;
  delete old.stats.orders;
  const upgraded = loadState(old, 0);
  assert.equal(upgraded.orders.length, 3);
  assert.equal(upgraded.stars, 0);
  assert.equal(upgraded.stats.orders, 0);
});

// Liczba etapów odnowy do końca pomieszczenia `id` włącznie.
const stepsThrough = (id) => {
  let total = 0;
  for (const entry of ROOMS) {
    total += entry.steps.length;
    if (entry.id === id) return total;
  }
  return total;
};

test("pomieszczenia: 10 z dawnej Szklarni odnawianych po kolei etapami za gwiazdki", () => {
  assert.equal(ROOMS.length, 10);
  assert.deepEqual(
    ROOMS.map((entry) => entry.name),
    [
      "Doniczarnia",
      "Sala Upraw",
      "Zraszalnia",
      "Sadzonkarnia",
      "Kompostownia",
      "Krzyżówkarium",
      "Kozi Zakątek",
      "Laboratorium Pyłku",
      "Kącik Drzemki",
      "Sowie Centrum",
    ],
  );
  assert.equal(RENOVATION_STEPS, 45);
  for (let index = 1; index < ROOMS.length; index += 1) {
    assert.ok(ROOMS[index].cost >= ROOMS[index - 1].cost, "koszt etapu nie maleje");
  }
  assert.deepEqual(renovation(0), { index: 0, room: ROOMS[0], step: 0, finished: [] });
  assert.deepEqual(renovation(4), { index: 1, room: ROOMS[1], step: 1, finished: ["potting"] });
  assert.equal(renovation(RENOVATION_STEPS).room, null);
  assert.equal(renovation(RENOVATION_STEPS).finished.length, 10);

  const game = createGame({ state: defaultState(0), random: queue(0) });
  assert.equal(game.state.renovation, 0);
  assert.equal(game.renovate(), null, "bez gwiazdek");
  assert.deepEqual(game.takeEvents(), [{ type: "renovateMissing", room: "potting", need: 1 }]);
  game.state.stars = 4;
  assert.deepEqual(game.renovate(), { room: "potting", step: 0, name: "Zamieść podłogę", roomDone: false });
  game.renovate();
  assert.deepEqual(game.renovate(), { room: "potting", step: 2, name: "Ustaw stół do sadzenia", roomDone: true });
  assert.equal(game.state.stars, 1);
  assert.equal(game.state.renovation, 3);
  assert.ok(hasPerk(game.state, "potting"));
  assert.equal(game.potMax(), POT.max + PERKS.potBonus);
  // Sala Upraw kosztuje 2 gwiazdki za etap.
  assert.equal(game.renovate(), null);
  assert.equal(game.takeEvents().at(-1).need, 1);
  // Doniczka po Doniczarni ładuje się do 14.
  game.state.pot.charges = POT.max;
  game.update(POT.regen * 3);
  assert.equal(game.state.pot.charges, POT.max + PERKS.potBonus);
});

test("ułatwienia pomieszczeń: doniczka, kiełki, kózki, kompost, hybrydy, zamówienia, Kącik Drzemki; zapis odnowy", () => {
  const at = (id) => ({ ...defaultState(0), renovation: stepsThrough(id) });
  assert.equal(potRegen(defaultState(0)), POT.regen);
  assert.equal(potRegen(at("grow")), PERKS.regenGrow);
  assert.equal(potRegen(at("seedling")), PERKS.regenSeedling);
  assert.equal(potMax(at("water")), POT.max + PERKS.potBonus);

  // Zraszalnia: kiełek z doniczki, gdy losowanie < 0,15 (kolejność: łańcuch, kiełek, pole).
  let game = createGame({ state: at("water"), random: queue(0, 0.1, 0) });
  game.board.cells.fill(null);
  assert.deepEqual(game.board.cells[game.tapPot()], { chain: "monstera", level: 2 });
  game = createGame({ state: at("water"), random: queue(0, 0.5, 0) });
  game.board.cells.fill(null);
  assert.deepEqual(game.board.cells[game.tapPot()], { chain: "monstera", level: 1 });

  // Kozi Zakątek: nasionko obok takiego samego (sąsiednie wolne pole), bez takiego — gdziekolwiek.
  const board = createBoard(BOARD);
  board.cells[cellIndex(board, 3, 4)] = seed(1);
  board.cells[cellIndex(board, 3, 3)] = seed(2);
  const placed = spawnNear(board, seed(1), () => 0);
  const { col, row } = cellPosition(board, placed);
  assert.equal(Math.abs(col - 3) + Math.abs(row - 4), 1, "obok nasionka");
  const empty = createBoard(BOARD);
  assert.equal(
    spawnNear(empty, seed(1), () => 0),
    0,
  );
  game = createGame({ state: at("goats"), random: queue(0, 0.9, 0.99) });
  game.board.cells.fill(null);
  game.board.cells[0] = seed(1);
  const index = game.tapPot();
  assert.ok(index === 1 || index === BOARD.cols, `nasionko obok pola 0, a jest na ${index}`);

  // Kompostownia: 2 × liście za kompost; Krzyżówkarium: hybryda × 1,5.
  game = createGame({ state: at("cross"), random: queue(0) });
  game.board.cells.fill(null);
  game.board.cells[5] = { chain: "monstera", level: 3 };
  game.compost(5);
  assert.equal(game.state.leaves, COMPOST_LEAVES[3] * PERKS.compostFactor);
  game.board.cells[0] = { chain: "monstera", level: 5 };
  game.board.cells[1] = { chain: "pilea", level: 5 };
  game.move(0, 1);
  assert.equal(game.state.leaves, COMPOST_LEAVES[3] * 2 + Math.round(HYBRIDS.monpilea.leaves * PERKS.hybridFactor));

  // Zamówienia: Laboratorium Pyłku (+1 gwiazdka za poziom 4–5 i hybrydę), Sowie Centrum (liście × 1,5).
  const big = { chain: "pilea", level: 4, count: 1 };
  assert.deepEqual(orderReward(big, stepsThrough("goats")), { leaves: ORDERS.leaves[4], stars: 2 });
  assert.deepEqual(orderReward(big, stepsThrough("pollen")), { leaves: ORDERS.leaves[4], stars: 3 });
  assert.deepEqual(orderReward({ chain: "monstera", level: 2, count: 1 }, stepsThrough("pollen")), {
    leaves: ORDERS.leaves[2],
    stars: 1,
  });
  assert.deepEqual(orderReward(big, RENOVATION_STEPS), { leaves: Math.round(ORDERS.leaves[4] * 1.5), stars: 3 });

  // Zapis: odnowa zostaje, poza zakresem — przycięta; ładunki do pojemności doniczki.
  const saved = JSON.parse(JSON.stringify({ ...at("potting"), savedAt: 1000 }));
  saved.pot.charges = 99;
  assert.equal(loadState(saved, 1000).renovation, 3);
  assert.equal(loadState(saved, 1000).pot.charges, POT.max + PERKS.potBonus);
  assert.equal(loadState({ ...saved, renovation: 999 }, 1000).renovation, RENOVATION_STEPS);
  assert.equal(loadState({ ...saved, renovation: -4 }, 1000).renovation, 0);
  // Kącik Drzemki: doniczka ładuje się, gdy gra jest zamknięta (bez niego — nie).
  const sleepy = { ...JSON.parse(JSON.stringify(at("nap"))), savedAt: 0 };
  sleepy.pot = { charges: 0, progress: 0 };
  assert.equal(loadState(sleepy, 10_000).pot.charges, Math.floor(10 / PERKS.regenSeedling));
  const awake = { ...JSON.parse(JSON.stringify(at("pollen"))), savedAt: 0 };
  awake.pot = { charges: 0, progress: 0 };
  assert.equal(loadState(awake, 10_000).pot.charges, 0);
});
