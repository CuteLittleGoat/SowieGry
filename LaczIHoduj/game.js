// Łącz i Hoduj — stan gry (wersja 2) i silnik (czysta logika, bez DOM): Sowia doniczka z ładunkami, ruchy
// z łączeniem, kompostownik, zamówienia sowich sąsiadek, liście monstery, gwiazdki odnowy, statystyki i zdarzenia
// dla interfejsu.
import {
  BOARD,
  CHAINS,
  COMPOST_LEAVES,
  HYBRIDS,
  MERGE_LEAVES,
  NEIGHBORS,
  ORDERS,
  POT,
  SAVE_VERSION,
  START_ITEMS,
} from "./config.js";
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

// ---------- Zamówienia sąsiadek ----------

/** Sąsiadka po kluczu (`NEIGHBORS`) albo null. */
export const neighborOf = (id) => NEIGHBORS.find((entry) => entry.id === id) || null;

/** Zakres poziomów zamówień przy `done` wykonanych zamówieniach: najwyższy rośnie do 5, zakres 3 poziomów (od 2). */
export function orderLevels(done) {
  const max = Math.min(5, ORDERS.startLevel + Math.floor(done / ORDERS.levelEvery));
  return { min: Math.max(2, max - 2), max };
}

// Jedno losowanie zamówienia (bez sprawdzania powtórek).
function drawOrder(neighbor, done, merges, random) {
  const unlocked = potChains(merges).map((entry) => entry.chain);
  // Hybrydy, których oba składniki są w doniczce (Złotolistka — z hybryd — nie trafia do zamówień).
  const hybrids = Object.keys(HYBRIDS).filter((id) => HYBRIDS[id].parents.every((chain) => unlocked.includes(chain)));
  if (done >= ORDERS.hybridFrom && hybrids.length && random() < ORDERS.hybridChance) {
    return {
      neighbor,
      chain: hybrids[Math.min(hybrids.length - 1, Math.floor(random() * hybrids.length))],
      level: 1,
      count: 1,
    };
  }
  const { min, max } = orderLevels(done);
  const chain = pickChain(merges, random);
  const level = Math.min(max, min + Math.floor(random() * (max - min + 1)));
  const count = level <= ORDERS.pairUpTo && random() < ORDERS.pairChance ? 2 : 1;
  return { neighbor, chain, level, count };
}

/**
 * Nowe zamówienie sąsiadki `{ neighbor, chain, level, count }`: roślina z łańcucha losowanego jak w doniczce, poziom
 * z `orderLevels(done)`, czasem dwie sztuki, czasem hybryda; do 5 prób, żeby nie powtórzyć zamówień z `taken`.
 */
export function makeOrder(neighbor, { done = 0, merges = 0 } = {}, random = Math.random, taken = []) {
  let order = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    order = drawOrder(neighbor, done, merges, random);
    const repeated = taken.some((other) => other && other.chain === order.chain && other.level === order.level);
    if (!repeated) break;
  }
  return order;
}

/** Czy zapisane zamówienie jest poprawne dla sąsiadki `neighbor` (znany łańcuch, poziom, 1–2 sztuki). */
export function validOrder(order, neighbor) {
  return Boolean(
    order &&
    typeof order === "object" &&
    order.neighbor === neighbor &&
    CHAINS[order.chain] &&
    Number.isInteger(order.level) &&
    order.level >= 1 &&
    order.level <= maxLevel(order.chain) &&
    (order.count === 1 || order.count === 2),
  );
}

/** Nagroda za zamówienie: `{ leaves, stars }` (hybryda — stała; roślina — liście za sztukę, gwiazdki +1 za drugą). */
export function orderReward(order) {
  if (CHAINS[order.chain]?.hybrid) return { leaves: ORDERS.hybridLeaves, stars: ORDERS.hybridStars };
  return {
    leaves: (ORDERS.leaves[order.level] || 0) * order.count,
    stars: (ORDERS.stars[order.level] || 1) + order.count - 1,
  };
}

/**
 * Pola z przedmiotami do oddania (`count` sztuk tego samego łańcucha i poziomu; najpierw pole `prefer`, np.
 * przeciągnięte) albo null, gdy na planszy jest ich za mało.
 */
export function orderCells(cells, order, prefer = -1) {
  const same = (item) => item && item.chain === order.chain && item.level === order.level;
  const found = [];
  if (prefer >= 0 && same(cells[prefer])) found.push(prefer);
  for (let index = 0; index < cells.length && found.length < order.count; index += 1) {
    if (index !== prefer && same(cells[index])) found.push(index);
  }
  return found.length >= order.count ? found.slice(0, order.count) : null;
}

// Zamówienia trzech sąsiadek (poprawne z zapisu zostają, brakujące i niepoprawne — nowe).
function fillOrders(saved, stats, random) {
  const orders = [];
  NEIGHBORS.forEach((entry, slot) => {
    const order = Array.isArray(saved) ? saved[slot] : null;
    orders.push(
      validOrder(order, entry.id)
        ? { neighbor: order.neighbor, chain: order.chain, level: order.level, count: order.count }
        : makeOrder(entry.id, { done: stats.orders, merges: stats.merges }, random, orders),
    );
  });
  return orders;
}

/** Nowy stan: plansza z przedmiotami startowymi, pełna doniczka, zamówienia trzech sąsiadek. */
export function defaultState(now = Date.now(), random = Math.random) {
  const board = createBoard(BOARD);
  for (const [index, level] of START_ITEMS) board.cells[index] = { chain: POT.chain, level };
  return {
    version: SAVE_VERSION,
    createdAt: now,
    savedAt: now,
    cells: serializeCells(board),
    leaves: 0,
    stars: 0,
    pot: { charges: POT.max, progress: 0 },
    orders: fillOrders(null, { orders: 0, merges: 0 }, random),
    stats: { merges: 0, spawns: 0, composted: 0, best: 2, moves: 0, hybrids: 0, orders: 0 },
  };
}

/** Stan z zapisu (pole `preview`) albo nowy; brakujące i niepoprawne pola — wartości domyślne. */
export function loadState(raw, now = Date.now(), random = Math.random) {
  if (!raw || typeof raw !== "object" || Number(raw.version) !== SAVE_VERSION) return defaultState(now, random);
  const base = defaultState(now, random);
  const stats = { ...base.stats, ...(raw.stats || {}) };
  return {
    ...base,
    ...raw,
    cells: serializeCells(createBoard({ ...BOARD, cells: raw.cells })),
    leaves: number(raw.leaves),
    pot: {
      charges: Math.min(POT.max, Math.max(0, number(raw.pot?.charges))),
      progress: Math.min(1, Math.max(0, number(raw.pot?.progress))),
    },
    stars: Math.max(0, number(raw.stars)),
    orders: fillOrders(raw.orders, stats, random),
    stats,
    version: SAVE_VERSION,
  };
}

/**
 * createGame({ state, random }) → { state, board, update(dt), tapPot(), move(from, to), compost(index),
 * orderCells(slot, prefer), deliver(slot, prefer), takeEvents() }. Zdarzenia: spawn { index, item }, potEmpty,
 * boardFull, move { from, to }, swap { from, to }, merge { from, to, item, leaves, top },
 * hybrid { from, to, item, leaves }, unlock { chain, name }, compost { index, item, leaves },
 * order { slot, order, cells, leaves, stars }, newOrder { slot, order }, orderMissing { slot, order }.
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

  // Zamówienie sąsiadki: oddanie roślin z planszy za liście i gwiazdki; sąsiadka od razu prosi o coś nowego.
  function deliver(slot, prefer = -1) {
    const order = state.orders[slot];
    if (!order) return null;
    const cells = orderCells(board.cells, order, prefer);
    if (!cells) {
      emit("orderMissing", { slot, order });
      return null;
    }
    for (const index of cells) removeItem(board, index);
    const reward = orderReward(order);
    state.leaves += reward.leaves;
    state.stars += reward.stars;
    state.stats.orders += 1;
    sync();
    emit("order", { slot, order, cells, ...reward });
    const others = state.orders.filter((_, index) => index !== slot);
    state.orders[slot] = makeOrder(order.neighbor, { done: state.stats.orders, merges: state.stats.merges }, random, [
      order,
      ...others,
    ]);
    emit("newOrder", { slot, order: state.orders[slot] });
    return reward;
  }

  return {
    state,
    board,
    update,
    tapPot,
    move,
    compost,
    orderCells: (slot, prefer = -1) =>
      state.orders[slot] ? orderCells(board.cells, state.orders[slot], prefer) : null,
    deliver,
    takeEvents: () => events.splice(0, events.length),
  };
}
