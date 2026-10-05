// Łącz i Hoduj — stan gry (wersja 2) i silnik (czysta logika, bez DOM): Sowia doniczka z ładunkami, ruchy
// z łączeniem, kompostownik, zamówienia sowich sąsiadek, liście monstery, gwiazdki odnowy, odnawianie pomieszczeń
// szklarni z ułatwieniami, przeszkody Pracu i Amic, statystyki i zdarzenia dla interfejsu.
import {
  BOARD,
  CHAINS,
  COMPOST_LEAVES,
  HYBRIDS,
  MERGE_LEAVES,
  NEIGHBORS,
  OBSTACLES,
  ORDERS,
  PERKS,
  POT,
  ROOMS,
  SAVE_VERSION,
  START_ITEMS,
} from "./config.js";
import {
  cellPosition,
  createBoard,
  emptyCells,
  maxLevel,
  moveItem,
  neighbors,
  removeItem,
  serializeBlocks,
  serializeCells,
  spawnItem,
  spawnNear,
} from "./board.js";

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
 * przeciągnięte; bez przedmiotów pod karteczkami z `blocks`) albo null, gdy na planszy jest ich za mało.
 */
export function orderCells(cells, order, prefer = -1, blocks = null) {
  const same = (item) => item && item.chain === order.chain && item.level === order.level;
  const free = (index) => same(cells[index]) && !blocks?.[index];
  const found = [];
  if (prefer >= 0 && free(prefer)) found.push(prefer);
  for (let index = 0; index < cells.length && found.length < order.count; index += 1) {
    if (index !== prefer && free(index)) found.push(index);
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
    blocks: serializeBlocks(board),
    phoneMoves: 0,
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
  const board = createBoard({ ...BOARD, cells: raw.cells, blocks: raw.blocks });
  const state = {
    ...base,
    ...raw,
    cells: serializeCells(board),
    blocks: serializeBlocks(board),
    phoneMoves: Math.min(OBSTACLES.ringEvery - 1, Math.max(0, Math.floor(number(raw.phoneMoves)))),
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
 * orderCells(slot, prefer), tapBlock(index), deliver(slot, prefer), renovate(), potMax(), takeEvents() }. Zdarzenia: spawn { index, item }, potEmpty,
 * boardFull, move { from, to }, swap { from, to }, merge { from, to, item, leaves, top },
 * hybrid { from, to, item, leaves }, unlock { chain, name }, compost { index, item, leaves },
 * order { slot, order, cells, leaves, stars }, newOrder { slot, order }, orderMissing { slot, order },
 * renovate { room, step, name, roomDone }, renovateMissing { room, need }; przeszkody: crate { index },
 * phone { index }, note { index, from }, noteTap { index, left }, noteGone { index }, blockHit { index, block, left },
 * phoneGone { index }, crateOpen { index, leaves, stars }, blockInfo { index, block }.
 */
export function createGame({ state = defaultState(), random = Math.random } = {}) {
  const board = createBoard({ ...BOARD, cells: state.cells, blocks: state.blocks });
  const events = [];
  const emit = (type, data = {}) => events.push({ type, ...data });
  const sync = () => {
    state.cells = serializeCells(board);
    state.blocks = serializeBlocks(board);
  };
  const count = (type) => board.blocks.filter((block) => block?.type === type).length;
  const pick = (list) => list[Math.min(list.length - 1, Math.floor(random() * list.length))];

  // ---------- Przeszkody ----------

  // Pracu Pracu zostawia telefon na losowym wolnym polu.
  function placePhone() {
    const free = emptyCells(board);
    if (!free.length) return -1;
    const index = pick(free);
    board.blocks[index] = { type: "phone", hits: 0 };
    state.phoneMoves = 0;
    emit("phone", { index });
    return index;
  }

  // Telefon dzwoni: karteczka na polu w promieniu `reach` (najpierw pola z roślinami bez karteczki, potem wolne).
  function ring() {
    const phone = board.blocks.findIndex((block) => block?.type === "phone");
    if (phone < 0) return -1;
    const at = cellPosition(board, phone);
    const near = board.cells
      .map((_, index) => index)
      .filter((index) => {
        const { col, row } = cellPosition(board, index);
        return Math.max(Math.abs(col - at.col), Math.abs(row - at.row)) <= OBSTACLES.reach && !board.blocks[index];
      });
    const planted = near.filter((index) => board.cells[index]);
    const list = planted.length ? planted : near;
    if (!list.length) return -1;
    const index = pick(list);
    board.blocks[index] = { type: "note", hits: 0 };
    emit("note", { index, from: phone });
    return index;
  }

  // Połączenie na polu `index`: karteczki obok znikają, telefon i skrzynie obok dostają uderzenie.
  function hitAround(index) {
    for (const other of neighbors(board, index)) {
      const block = board.blocks[other];
      if (!block) continue;
      if (block.type === "note") {
        board.blocks[other] = null;
        emit("noteGone", { index: other });
        continue;
      }
      block.hits += 1;
      const need = block.type === "phone" ? OBSTACLES.phoneHits : OBSTACLES.crateHits;
      if (block.hits < need) {
        emit("blockHit", { index: other, block: block.type, left: need - block.hits });
        continue;
      }
      board.blocks[other] = null;
      if (block.type === "phone") {
        state.phoneMoves = 0;
        emit("phoneGone", { index: other });
      } else {
        state.leaves += OBSTACLES.crateLeaves;
        state.stars += OBSTACLES.crateStars;
        emit("crateOpen", { index: other, leaves: OBSTACLES.crateLeaves, stars: OBSTACLES.crateStars });
      }
    }
  }

  /** Stuknięcie przeszkody: karteczka — odklejanie (`noteTaps` stuknięć), inne — podpowiedź. */
  function tapBlock(index) {
    const block = board.blocks[index];
    if (!block) return null;
    if (block.type !== "note") {
      emit("blockInfo", { index, block: block.type });
      return block.type;
    }
    block.hits += 1;
    if (block.hits >= OBSTACLES.noteTaps) {
      board.blocks[index] = null;
      emit("noteGone", { index });
    } else emit("noteTap", { index, left: OBSTACLES.noteTaps - block.hits });
    sync();
    return block.type;
  }

  function update(dt) {
    chargePot(state, dt);
  }

  // Sowia doniczka: nasionko na losowym wolnym polu (bez ładunku albo bez miejsca — nic, z podpowiedzią).
  function tapPot() {
    if (state.pot.charges < 1) {
      emit("potEmpty");
      return -1;
    }
    // Amic: czasem skrzynia zamiast nasionka (od kilku zamówień, najwyżej dwie naraz).
    if (state.stats.orders >= OBSTACLES.crateFrom && count("crate") < OBSTACLES.maxCrates) {
      if (random() < OBSTACLES.crateChance) {
        const free = emptyCells(board);
        if (free.length) {
          const index = pick(free);
          board.blocks[index] = { type: "crate", hits: 0 };
          state.pot.charges -= 1;
          sync();
          emit("crate", { index });
          return index;
        }
      }
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
      hitAround(to);
    } else if (result.type === "hybrid") {
      const base = HYBRIDS[result.item.chain].leaves;
      const leaves = hasPerk(state, "cross") ? Math.round(base * PERKS.hybridFactor) : base;
      state.leaves += leaves;
      state.stats.merges += 1;
      state.stats.hybrids += 1;
      emit("hybrid", { from, to, item: result.item, leaves });
      hitAround(to);
    } else emit(result.type, { from, to });
    // Telefon Pracu dzwoni co `ringEvery` ruchów.
    if (count("phone")) {
      state.phoneMoves += 1;
      if (state.phoneMoves >= OBSTACLES.ringEvery) {
        state.phoneMoves = 0;
        ring();
      }
    }
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
    const cells = orderCells(board.cells, order, prefer, board.blocks);
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
    // Pracu Pracu przychodzi z telefonem po kilku zamówieniach (gdy telefonu nie ma).
    const since = state.stats.orders - OBSTACLES.phoneFrom;
    if (since >= 0 && since % OBSTACLES.phoneEvery === 0 && !count("phone")) placePhone();
    sync();
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
      state.orders[slot] ? orderCells(board.cells, state.orders[slot], prefer, board.blocks) : null,
    tapBlock,
    deliver,
    renovate,
    potMax: () => potMax(state),
    takeEvents: () => events.splice(0, events.length),
  };
}
