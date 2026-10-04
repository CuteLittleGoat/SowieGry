// Łącz i Hoduj — stan gry (wersja 2) i silnik (czysta logika, bez DOM): Sowia doniczka z ładunkami, ruchy
// z łączeniem, kompostownik, zamówienia sowich sąsiadek, liście monstery, gwiazdki odnowy, odnawianie pomieszczeń
// szklarni z ułatwieniami, statystyki i zdarzenia dla interfejsu.
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
  START_ITEMS,
} from "./config.js";
import { createBoard, maxLevel, moveItem, removeItem, serializeCells, spawnItem, spawnNear } from "./board.js";

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

// ---------- Pomieszczenia szklarni ----------

/** Liczba wszystkich etapów odnowy (wszystkie pomieszczenia). */
export const RENOVATION_STEPS = ROOMS.reduce((sum, entry) => sum + entry.steps.length, 0);

/**
 * Stan odnowy po `done` etapach → { index, room, step, finished }: pomieszczenie w toku (`index` w `ROOMS`, `room`;
 * po odnowieniu wszystkich — `index = ROOMS.length`, `room = null`), etapy już zrobione w nim (`step`) i klucze
 * pomieszczeń odnowionych (`finished`). Pomieszczenia odnawia się po kolei.
 */
export function renovation(done) {
  let left = Math.max(0, Math.floor(number(done)));
  const finished = [];
  for (let index = 0; index < ROOMS.length; index += 1) {
    const steps = ROOMS[index].steps.length;
    if (left < steps) return { index, room: ROOMS[index], step: left, finished };
    left -= steps;
    finished.push(ROOMS[index].id);
  }
  return { index: ROOMS.length, room: null, step: 0, finished };
}

/** Czy pomieszczenie `id` jest odnowione w stanie gry (ułatwienie działa). */
export const hasPerk = (state, id) => renovation(state.renovation).finished.includes(id);

/** Pojemność doniczki (Doniczarnia: +2). */
export const potMax = (state) => POT.max + (hasPerk(state, "potting") ? PERKS.potBonus : 0);

/** Co ile sekund wraca ładunek (Sala Upraw: 2,5 s; Sadzonkarnia: 2 s). */
export function potRegen(state) {
  if (hasPerk(state, "seedling")) return PERKS.regenSeedling;
  if (hasPerk(state, "grow")) return PERKS.regenGrow;
  return POT.regen;
}

/** Ładowanie doniczki o `dt` sekund (pełna — postęp 0). */
export function chargePot(state, dt) {
  const pot = state.pot;
  const max = potMax(state);
  if (pot.charges >= max) {
    pot.progress = 0;
    return;
  }
  pot.progress += Math.max(0, dt) / potRegen(state);
  while (pot.progress >= 1 && pot.charges < max) {
    pot.progress -= 1;
    pot.charges += 1;
  }
  if (pot.charges >= max) pot.progress = 0;
}

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

/**
 * Nagroda za zamówienie: `{ leaves, stars }` (hybryda — stała; roślina — liście za sztukę, gwiazdki +1 za drugą);
 * przy `done` etapach odnowy: Laboratorium Pyłku — +1 gwiazdka za poziom 4–5 i hybrydę, Sowie Centrum — liście ×1,5.
 */
export function orderReward(order, done = 0) {
  const hybrid = Boolean(CHAINS[order.chain]?.hybrid);
  const reward = hybrid
    ? { leaves: ORDERS.hybridLeaves, stars: ORDERS.hybridStars }
    : {
        leaves: (ORDERS.leaves[order.level] || 0) * order.count,
        stars: (ORDERS.stars[order.level] || 1) + order.count - 1,
      };
  const finished = renovation(done).finished;
  if (finished.includes("pollen") && (hybrid || order.level >= 4)) reward.stars += PERKS.pollenStars;
  if (finished.includes("command")) reward.leaves = Math.round(reward.leaves * PERKS.commandFactor);
  return reward;
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
    renovation: 0,
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
  const done = Math.min(RENOVATION_STEPS, Math.max(0, Math.floor(number(raw.renovation))));
  const state = {
    ...base,
    ...raw,
    cells: serializeCells(createBoard({ ...BOARD, cells: raw.cells })),
    leaves: number(raw.leaves),
    renovation: done,
    pot: {
      charges: Math.min(potMax({ renovation: done }), Math.max(0, Math.floor(number(raw.pot?.charges)))),
      progress: Math.min(1, Math.max(0, number(raw.pot?.progress))),
    },
    stars: Math.max(0, number(raw.stars)),
    orders: fillOrders(raw.orders, stats, random),
    stats,
    version: SAVE_VERSION,
  };
  // Kącik Drzemki: doniczka ładowała się, gdy gra była zamknięta.
  if (hasPerk(state, "nap")) chargePot(state, (now - number(raw.savedAt)) / 1000);
  return state;
}

/**
 * createGame({ state, random }) → { state, board, update(dt), tapPot(), move(from, to), compost(index),
 * orderCells(slot, prefer), deliver(slot, prefer), renovate(), potMax(), takeEvents() }. Zdarzenia: spawn { index, item }, potEmpty,
 * boardFull, move { from, to }, swap { from, to }, merge { from, to, item, leaves, top },
 * hybrid { from, to, item, leaves }, unlock { chain, name }, compost { index, item, leaves },
 * order { slot, order, cells, leaves, stars }, newOrder { slot, order }, orderMissing { slot, order },
 * renovate { room, step, name, roomDone }, renovateMissing { room, need }.
 */
export function createGame({ state = defaultState(), random = Math.random } = {}) {
  const board = createBoard({ ...BOARD, cells: state.cells });
  const events = [];
  const emit = (type, data = {}) => events.push({ type, ...data });
  const sync = () => {
    state.cells = serializeCells(board);
  };

  function update(dt) {
    chargePot(state, dt);
  }

  // Sowia doniczka: nasionko na losowym wolnym polu (bez ładunku albo bez miejsca — nic, z podpowiedzią).
  function tapPot() {
    if (state.pot.charges < 1) {
      emit("potEmpty");
      return -1;
    }
    const chain = pickChain(state.stats.merges, random);
    // Zraszalnia: czasem od razu kiełek; Kozi Zakątek: nasionko obok takiego samego.
    const sprout = hasPerk(state, "water") && random() < PERKS.sproutChance;
    const item = { chain, level: sprout ? 2 : 1 };
    const index = hasPerk(state, "goats") ? spawnNear(board, item, random) : spawnItem(board, item, random);
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
      const base = HYBRIDS[result.item.chain].leaves;
      const leaves = hasPerk(state, "cross") ? Math.round(base * PERKS.hybridFactor) : base;
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
    const base = HYBRIDS[item.chain]?.compost ?? (COMPOST_LEAVES[item.level] || 0);
    const leaves = hasPerk(state, "compost") ? base * PERKS.compostFactor : base;
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
    const reward = orderReward(order, state.renovation);
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

  // Odnowa: kolejny etap pomieszczenia w toku za gwiazdki (za mało — zdarzenie z brakującą liczbą).
  function renovate() {
    const status = renovation(state.renovation);
    if (!status.room) return null;
    const { room } = status;
    if (state.stars < room.cost) {
      emit("renovateMissing", { room: room.id, need: room.cost - state.stars });
      return null;
    }
    state.stars -= room.cost;
    state.renovation += 1;
    const roomDone = status.step + 1 >= room.steps.length;
    const result = { room: room.id, step: status.step, name: room.steps[status.step], roomDone };
    emit("renovate", result);
    return result;
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
    renovate,
    potMax: () => potMax(state),
    takeEvents: () => events.splice(0, events.length),
  };
}
