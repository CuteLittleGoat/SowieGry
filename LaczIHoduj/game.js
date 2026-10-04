// Łącz i Hoduj — stan gry (wersja 2) i silnik (czysta logika, bez DOM): Sowia doniczka z ładunkami, ruchy
// z łączeniem, kompostownik, liście monstery, statystyki i zdarzenia dla interfejsu.
import { BOARD, CHAINS, COMPOST_LEAVES, HYBRIDS, MERGE_LEAVES, POT, SAVE_VERSION, START_ITEMS } from "./config.js";
import { createBoard, maxLevel, moveItem, removeItem, serializeCells, spawnItem } from "./board.js";

/** Łańcuchy doniczki dostępne przy danej liczbie połączeń (`stats.merges`). */
export const potChains = (merges) => POT.chains.filter((entry) => merges >= entry.unlock);

/** Łańcuch nasionka z doniczki: losowanie z wagami spośród odblokowanych. */
export function pickChain(merges, random = Math.random) {
  const list = potChains(merges);
  const total = list.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = random() * total;
  for (const entry of list) {
    roll -= entry.weight;
    if (roll < 0) return entry.chain;
  }
  return list.at(-1).chain;
}

const number = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

/** Nowy stan: plansza z przedmiotami startowymi, pełna doniczka. */
export function defaultState(now = Date.now()) {
  const board = createBoard(BOARD);
  for (const [index, level] of START_ITEMS) board.cells[index] = { chain: POT.chain, level };
  return {
    version: SAVE_VERSION,
    createdAt: now,
    savedAt: now,
    cells: serializeCells(board),
    leaves: 0,
    pot: { charges: POT.max, progress: 0 },
    stats: { merges: 0, spawns: 0, composted: 0, best: 2, moves: 0, hybrids: 0 },
  };
}

/** Stan z zapisu (pole `preview`) albo nowy; brakujące i niepoprawne pola — wartości domyślne. */
export function loadState(raw, now = Date.now()) {
  if (!raw || typeof raw !== "object" || Number(raw.version) !== SAVE_VERSION) return defaultState(now);
  const base = defaultState(now);
  return {
    ...base,
    ...raw,
    cells: serializeCells(createBoard({ ...BOARD, cells: raw.cells })),
    leaves: number(raw.leaves),
    pot: {
      charges: Math.min(POT.max, Math.max(0, number(raw.pot?.charges))),
      progress: Math.min(1, Math.max(0, number(raw.pot?.progress))),
    },
    stats: { ...base.stats, ...(raw.stats || {}) },
    version: SAVE_VERSION,
  };
}

/**
 * createGame({ state, random }) → { state, board, update(dt), tapPot(), move(from, to), compost(index),
 * takeEvents() }. Zdarzenia: spawn { index, item }, potEmpty, boardFull, move { from, to }, swap { from, to },
 * merge { from, to, item, leaves, top }, hybrid { from, to, item, leaves }, unlock { chain, name },
 * compost { index, item, leaves }.
 */
export function createGame({ state = defaultState(), random = Math.random } = {}) {
  const board = createBoard({ ...BOARD, cells: state.cells });
  const events = [];
  const emit = (type, data = {}) => events.push({ type, ...data });
  const sync = () => {
    state.cells = serializeCells(board);
  };

  function update(dt) {
    const pot = state.pot;
    if (pot.charges >= POT.max) {
      pot.progress = 0;
      return;
    }
    pot.progress += dt / POT.regen;
    while (pot.progress >= 1 && pot.charges < POT.max) {
      pot.progress -= 1;
      pot.charges += 1;
    }
    if (pot.charges >= POT.max) pot.progress = 0;
  }

  // Sowia doniczka: nasionko na losowym wolnym polu (bez ładunku albo bez miejsca — nic, z podpowiedzią).
  function tapPot() {
    if (state.pot.charges < 1) {
      emit("potEmpty");
      return -1;
    }
    const item = { chain: pickChain(state.stats.merges, random), level: 1 };
    const index = spawnItem(board, item, random);
    if (index < 0) {
      emit("boardFull");
      return -1;
    }
    state.pot.charges -= 1;
    state.stats.spawns += 1;
    sync();
    emit("spawn", { index, item });
    return index;
  }

  function move(from, to) {
    const result = moveItem(board, from, to);
    if (result.type === "none") return result;
    state.stats.moves += 1;
    const unlocked = potChains(state.stats.merges).length;
    if (result.type === "merge") {
      const leaves = MERGE_LEAVES[result.item.level] || 0;
      state.leaves += leaves;
      state.stats.merges += 1;
      state.stats.best = Math.max(state.stats.best, result.item.level);
      emit("merge", { from, to, item: result.item, leaves, top: result.item.level >= maxLevel(result.item.chain) });
    } else if (result.type === "hybrid") {
      const leaves = HYBRIDS[result.item.chain].leaves;
      state.leaves += leaves;
      state.stats.merges += 1;
      state.stats.hybrids += 1;
      emit("hybrid", { from, to, item: result.item, leaves });
    } else emit(result.type, { from, to });
    // Nowy łańcuch w doniczce po przekroczeniu progu połączeń.
    for (const entry of potChains(state.stats.merges).slice(unlocked)) {
      emit("unlock", { chain: entry.chain, name: CHAINS[entry.chain].name });
    }
    sync();
    return result;
  }

  // Kompostownik: usuwa przedmiot (zwalnia pole) za kilka liści — wyjście z zapchanej planszy.
  function compost(index) {
    const item = removeItem(board, index);
    if (!item) return null;
    const leaves = HYBRIDS[item.chain]?.compost ?? (COMPOST_LEAVES[item.level] || 0);
    state.leaves += leaves;
    state.stats.composted += 1;
    sync();
    emit("compost", { index, item, leaves });
    return item;
  }

  return { state, board, update, tapPot, move, compost, takeEvents: () => events.splice(0, events.length) };
}
