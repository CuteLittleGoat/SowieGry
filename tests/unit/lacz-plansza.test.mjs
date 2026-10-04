// Łącz i Hoduj (nowa Sowia Szklarnia, Analiza 3, E8 — prototyp 8.0): plansza 7 × 9, łączenie w łańcuchu Monstery,
// Sowia doniczka, kompostownik, zapis stanu i to, że plansza nigdy nie blokuje się bez wyjścia.
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
} from "../../LaczIHoduj/board.js";
import { BOARD, CHAINS, COMPOST_LEAVES, HYBRIDS, MERGE_LEAVES, POT, SAVE_VERSION } from "../../LaczIHoduj/config.js";
import { createGame, defaultState, loadState, pickChain, potChains } from "../../LaczIHoduj/game.js";

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
