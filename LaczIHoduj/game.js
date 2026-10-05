// Łącz i Hoduj — stan gry (wersja 2) i silnik (czysta logika, bez DOM): Sowia doniczka z ładunkami, ruchy
// z łączeniem, kompostownik, zamówienia sowich sąsiadek, liście monstery, gwiazdki odnowy, odnawianie pomieszczeń
// szklarni z ułatwieniami, przeszkody Pracu i Amic, kózki-wzmacniacze, statystyki i zdarzenia dla interfejsu.
import {
  BOARD,
  CHAINS,
  COMPOST_LEAVES,
  GOAT_RULES,
  GOATS,
  HYBRIDS,
  MERGE_LEAVES,
  NEIGHBORS,
  OBSTACLES,
  ORDERS,
  PERKS,
  POOL,
  POT,
  ROOMS,
  SAVE_VERSION,
  START_ITEMS,
} from "./config.js";
import {
  canGrow,
  cellPosition,
  createBoard,
  emptyCells,
  isGoat,
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

/**
 * Nagroda za wynik w Basenie Humbaka: { goats, leaves, stars } — kózki (1 + po jednej za progi `POOL.goatScores`),
 * liście (wynik / 10), gwiazdki (1, od `POOL.starScore` — 2).
 */
export function poolReward(score) {
  return {
    goats: 1 + POOL.goatScores.filter((limit) => score >= limit).length,
    leaves: Math.floor(score / 10),
    stars: score >= POOL.starScore ? 2 : 1,
  };
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
    poolReady: false,
    poolBest: 0,
    leaves: 0,
    stars: 0,
    renovation: 0,
    pot: { charges: POT.max, progress: 0 },
    orders: fillOrders(null, { orders: 0, merges: 0 }, random),
    stats: { merges: 0, spawns: 0, composted: 0, best: 2, moves: 0, hybrids: 0, orders: 0, goats: 0, pools: 0 },
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
    poolReady: raw.poolReady === true,
    poolBest: Math.max(0, Math.floor(number(raw.poolBest))),
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
 * orderCells(slot, prefer), tapBlock(index), useGoat(index), deliver(slot, prefer), renovate(), finishPool(score),
 * potMax(), takeEvents() }. Zdarzenia: spawn { index, item }, potEmpty,
 * boardFull, move { from, to }, swap { from, to }, merge { from, to, item, leaves, top },
 * hybrid { from, to, item, leaves }, unlock { chain, name }, compost { index, item, leaves },
 * order { slot, order, cells, leaves, stars }, newOrder { slot, order }, orderMissing { slot, order },
 * renovate { room, step, name, roomDone }, renovateMissing { room, need }; przeszkody: crate { index },
 * phone { index }, note { index, from }, noteTap { index, left }, noteGone { index }, blockHit { index, block, left },
 * phoneGone { index }, crateOpen { index, goat, leaves, stars }, blockInfo { index, block }, canister { index },
 * canisterGone { index }; kózki: goat { index, goat, from }, goatUsed { index, goat, count }, goatIdle { index, goat },
 * goatHint { index, goat }, grow { index, item }; Basen Humbaka: poolReady, poolDone { score, best, record, goats,
 * leaves, stars }.
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

  // Połączenie na polu `index`: karteczki obok znikają, telefon i skrzynie obok dostają uderzenie (kanister — nic).
  function hitAround(index) {
    for (const other of neighbors(board, index)) {
      const block = board.blocks[other];
      if (!block) continue;
      if (block.type === "note") {
        board.blocks[other] = null;
        emit("noteGone", { index: other });
        continue;
      }
      // Kanister Amic nie reaguje na połączenia (usuwa go tylko Kózka Taran).
      if (block.type === "canister") continue;
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
      } else openCrate(other);
    }
  }

  // Otwarta skrzynia Amic: w jej miejscu kózka, do tego liście i gwiazdki.
  function openCrate(index) {
    board.blocks[index] = null;
    const goat = pickGoat();
    board.cells[index] = { goat };
    state.leaves += OBSTACLES.crateLeaves;
    state.stars += OBSTACLES.crateStars;
    emit("crateOpen", { index, goat, leaves: OBSTACLES.crateLeaves, stars: OBSTACLES.crateStars });
  }

  // ---------- Kózki ----------

  /** Losowanie kózki: przy kanistrze bez Tarana na planszy — Taran, inaczej według wag `GOATS`. */
  function pickGoat() {
    const ram = board.cells.some((item) => item?.goat === "taran");
    if (count("canister") && !ram) return "taran";
    const list = Object.entries(GOATS);
    let roll = random() * list.reduce((sum, [, goat]) => sum + goat.weight, 0);
    for (const [id, goat] of list) {
      roll -= goat.weight;
      if (roll < 0) return id;
    }
    return list.at(-1)[0];
  }

  // Roślina, która może urosnąć o poziom (nie hybryda, poniżej szczytu, bez przeszkody).
  const growable = (index) => canGrow(board.cells[index]) && !board.blocks[index];

  // Połączenie zaliczone graczowi: liście, statystyki, zdarzenie i przeszkody obok.
  function scoreMerge(from, to, item) {
    const leaves = MERGE_LEAVES[item.level] || 0;
    state.leaves += leaves;
    state.stats.merges += 1;
    state.stats.best = Math.max(state.stats.best, item.level);
    emit("merge", { from, to, item, leaves, top: item.level >= maxLevel(item.chain) });
    hitAround(to);
  }

  function used(index, goat, amount = 1) {
    state.stats.goats += 1;
    emit("goatUsed", { index, goat, count: amount });
  }

  // Kózka Taran na przeszkodzie: przeszkoda znika (skrzynia się otwiera).
  function ram(index) {
    const block = board.blocks[index];
    if (block.type === "crate") {
      openCrate(index);
      return;
    }
    board.blocks[index] = null;
    if (block.type === "note") emit("noteGone", { index });
    else if (block.type === "phone") {
      state.phoneMoves = 0;
      emit("phoneGone", { index });
    } else emit("canisterGone", { index });
  }

  // Przeciągnięcie z kózką: Taran na przeszkodę, Dżoker na roślinę albo roślina na Dżokera → { type: "goat" }.
  function goatMove(from, to) {
    const source = board.cells[from];
    const target = board.cells[to];
    if (board.blocks[from]) return null;
    if (source?.goat === "taran" && board.blocks[to]) {
      board.cells[from] = null;
      ram(to);
      used(from, "taran");
      return { type: "goat" };
    }
    const jokerOnPlant = source?.goat === "dzoker" && growable(to);
    const plantOnJoker = target?.goat === "dzoker" && growable(from);
    if (!jokerOnPlant && !plantOnJoker) return null;
    const plant = jokerOnPlant ? target : source;
    const item = { chain: plant.chain, level: plant.level + 1 };
    board.cells[to] = item;
    board.cells[from] = null;
    scoreMerge(from, to, item);
    used(jokerOnPlant ? from : to, "dzoker");
    return { type: "goat" };
  }

  // Skoczek: do `jumpPairs` losowych par takich samych roślin łączy się (wynik na późniejszym polu pary).
  function jump() {
    const groups = new Map();
    board.cells.forEach((item, index) => {
      if (!growable(index)) return;
      const key = `${item.chain}:${item.level}`;
      groups.set(key, [...(groups.get(key) || []), index]);
    });
    const pairs = [];
    for (const list of groups.values())
      for (let at = 0; at + 1 < list.length; at += 2) pairs.push([list[at], list[at + 1]]);
    let done = 0;
    while (pairs.length && done < GOAT_RULES.jumpPairs) {
      const [a, b] = pairs.splice(Math.min(pairs.length - 1, Math.floor(random() * pairs.length)), 1)[0];
      const item = { chain: board.cells[b].chain, level: board.cells[b].level + 1 };
      board.cells[b] = item;
      board.cells[a] = null;
      scoreMerge(a, b, item);
      done += 1;
    }
    return done;
  }

  // Zjadaczka: karteczki w rzędzie i kolumnie kózki znikają.
  function eat(index) {
    const at = cellPosition(board, index);
    let done = 0;
    board.blocks.forEach((block, other) => {
      if (block?.type !== "note") return;
      const { col, row } = cellPosition(board, other);
      if (col !== at.col && row !== at.row) return;
      board.blocks[other] = null;
      emit("noteGone", { index: other });
      done += 1;
    });
    return done;
  }

  // Sprężynka: rośliny na 8 polach wokół kózki rosną o poziom (bez liści za połączenie).
  function spring(index) {
    const at = cellPosition(board, index);
    let done = 0;
    board.cells.forEach((item, other) => {
      const { col, row } = cellPosition(board, other);
      if (other === index || Math.max(Math.abs(col - at.col), Math.abs(row - at.row)) > 1 || !growable(other)) return;
      const grown = { chain: item.chain, level: item.level + 1 };
      board.cells[other] = grown;
      state.stats.best = Math.max(state.stats.best, grown.level);
      emit("grow", { index: other, item: grown });
      done += 1;
    });
    return done;
  }

  /** Stuknięcie kózki: moc (Skoczek, Zjadaczka, Sprężynka) albo podpowiedź (Dżoker i Taran — przeciąga się je). */
  function useGoat(index) {
    const item = board.cells[index];
    if (!isGoat(item) || board.blocks[index]) return null;
    const kind = item.goat;
    if (GOATS[kind].use !== "tap") {
      emit("goatHint", { index, goat: kind });
      return null;
    }
    const unlocked = potChains(state.stats.merges).length;
    const done = kind === "skoczek" ? jump() : kind === "zjadaczka" ? eat(index) : spring(index);
    if (!done) {
      emit("goatIdle", { index, goat: kind });
      return null;
    }
    board.cells[index] = null;
    used(index, kind, done);
    announceUnlocks(unlocked);
    sync();
    return { goat: kind, count: done };
  }

  // Nowe łańcuchy w doniczce po przekroczeniu progu połączeń.
  function announceUnlocks(before) {
    for (const entry of potChains(state.stats.merges).slice(before)) {
      emit("unlock", { chain: entry.chain, name: CHAINS[entry.chain].name });
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
    if (from === to || to < 0 || to >= board.cells.length) return { type: "none" };
    const unlocked = potChains(state.stats.merges).length;
    const result = goatMove(from, to) || moveItem(board, from, to);
    if (result.type === "none") return result;
    state.stats.moves += 1;
    if (result.type === "merge") scoreMerge(from, to, result.item);
    else if (result.type === "hybrid") {
      const base = HYBRIDS[result.item.chain].leaves;
      const leaves = hasPerk(state, "cross") ? Math.round(base * PERKS.hybridFactor) : base;
      state.leaves += leaves;
      state.stats.merges += 1;
      state.stats.hybrids += 1;
      emit("hybrid", { from, to, item: result.item, leaves });
      hitAround(to);
    } else if (result.type !== "goat") emit(result.type, { from, to });
    // Telefon Pracu dzwoni co `ringEvery` ruchów.
    if (count("phone")) {
      state.phoneMoves += 1;
      if (state.phoneMoves >= OBSTACLES.ringEvery) {
        state.phoneMoves = 0;
        ring();
      }
    }
    announceUnlocks(unlocked);
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
    // Amic stawia kanister (nieruchomy — usuwa go tylko Kózka Taran).
    const sinceCanister = state.stats.orders - OBSTACLES.canisterFrom;
    if (sinceCanister >= 0 && sinceCanister % OBSTACLES.canisterEvery === 0 && !count("canister")) {
      const free = emptyCells(board);
      if (free.length) {
        const index = pick(free);
        board.blocks[index] = { type: "canister", hits: 0 };
        emit("canister", { index });
      }
    }
    // Co `POOL.every` zamówień humbak zaprasza do basenu (zaproszenie czeka, aż gracz z niego skorzysta).
    if (state.stats.orders % POOL.every === 0 && !state.poolReady) {
      state.poolReady = true;
      emit("poolReady");
    }
    // Sąsiadka w podzięce przysyła kózkę.
    if (state.stats.orders % GOAT_RULES.orderEvery === GOAT_RULES.orderAt) {
      const free = emptyCells(board);
      if (free.length) {
        const index = pick(free);
        const goat = pickGoat();
        board.cells[index] = { goat };
        emit("goat", { index, goat, from: order.neighbor });
      }
    }
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

  // Koniec rundy w Basenie Humbaka: rekord, nagroda (kózki na wolnych polach, liście, gwiazdki), zaproszenie zużyte.
  function finishPool(score) {
    const value = Math.max(0, Math.floor(number(score)));
    const reward = poolReward(value);
    const record = value > state.poolBest;
    state.poolBest = Math.max(state.poolBest, value);
    state.poolReady = false;
    state.stats.pools += 1;
    state.leaves += reward.leaves;
    state.stars += reward.stars;
    const goats = [];
    for (let count = 0; count < reward.goats; count += 1) {
      const free = emptyCells(board);
      if (!free.length) break;
      const index = pick(free);
      const goat = pickGoat();
      board.cells[index] = { goat };
      goats.push({ index, goat });
    }
    sync();
    emit("poolDone", { score: value, best: state.poolBest, record, goats, leaves: reward.leaves, stars: reward.stars });
    return { ...reward, record, goats };
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
    useGoat,
    deliver,
    renovate,
    finishPool,
    potMax: () => potMax(state),
    takeEvents: () => events.splice(0, events.length),
  };
}
