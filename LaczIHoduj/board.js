// Łącz i Hoduj — plansza (czysta logika, bez DOM): pola, przenoszenie, łączenie, zamiana, wolne pola, przeszkody
// i wyjścia z zapchanej planszy. Przedmiot: { chain, level } (poziom od 1), puste pole: null. Przeszkody (krok 8.2)
// leżą w osobnej warstwie `blocks` (ta sama długość): null albo { type, hits } — karteczka Pracu („note”) zasłania
// pole razem z przedmiotem, telefon Pracu („phone”) i skrzynia Amic („crate”) zajmują puste pole.
import { CHAINS, HYBRIDS } from "./config.js";

/** Rodzaje przeszkód: `covers` — leży na polu (przedmiot pod spodem zostaje), inaczej zajmuje puste pole. */
export const BLOCKS = Object.freeze({
  note: Object.freeze({ covers: true }),
  phone: Object.freeze({ covers: false }),
  crate: Object.freeze({ covers: false }),
});

/** Najwyższy poziom łańcucha. */
export const maxLevel = (chain) => CHAINS[chain]?.levels.length ?? 0;

/** Nazwa przedmiotu, np. „Kiełek”. */
export const itemName = (item) => (item ? (CHAINS[item.chain]?.levels[item.level - 1] ?? "") : "");

/**
 * Nowa plansza `cols × rows` (opcjonalnie z polami i przeszkodami z zapisu — niepoprawne przedmioty i przeszkody
 * znikają; przeszkoda zajmująca pole, na którym jest przedmiot, też znika — przedmiot gracza ważniejszy).
 */
export function createBoard({ cols, rows, cells = null, blocks = null }) {
  const size = cols * rows;
  const list = Array.from({ length: size }, (_, index) => {
    const item = cells?.[index];
    return item && CHAINS[item.chain] && item.level >= 1 && item.level <= maxLevel(item.chain)
      ? { chain: item.chain, level: Math.floor(item.level) }
      : null;
  });
  const layer = Array.from({ length: size }, (_, index) => {
    const block = blocks?.[index];
    if (!block || !BLOCKS[block.type]) return null;
    if (!BLOCKS[block.type].covers && list[index]) return null;
    const hits = Math.floor(Number(block.hits));
    return { type: block.type, hits: Number.isFinite(hits) && hits > 0 ? hits : 0 };
  });
  return { cols, rows, cells: list, blocks: layer };
}

export const cellIndex = (board, col, row) => row * board.cols + col;
export const cellPosition = (board, index) => ({ col: index % board.cols, row: Math.floor(index / board.cols) });

/** Czy pole jest wolne (bez przedmiotu i bez przeszkody). */
export const isFree = (board, index) => !board.cells[index] && !board.blocks?.[index];

/** Indeksy wolnych pól. */
export const emptyCells = (board) =>
  board.cells.reduce((list, _, index) => (isFree(board, index) ? (list.push(index), list) : list), []);

/** Sąsiednie pola (góra, dół, lewo, prawo). */
export function neighbors(board, index) {
  const { col, row } = cellPosition(board, index);
  const list = [];
  for (const [dc, dr] of [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ]) {
    const c = col + dc;
    const r = row + dr;
    if (c >= 0 && r >= 0 && c < board.cols && r < board.rows) list.push(cellIndex(board, c, r));
  }
  return list;
}

/** Czy dwa przedmioty się połączą (ten sam łańcuch i poziom, poniżej najwyższego). */
export const canMerge = (a, b) =>
  Boolean(a && b && a.chain === b.chain && a.level === b.level && a.level < maxLevel(a.chain));

/** Czy przedmiot ma najwyższy poziom swojego łańcucha (hybryda — zawsze). */
export const isTop = (item) => Boolean(item && item.level >= maxLevel(item.chain));

/**
 * Hybryda z dwóch różnych roślin najwyższego poziomu (kolejność dowolna) → identyfikator z `HYBRIDS` albo null.
 * Np. Złota Monstera + Złota Pilea → „monpilea”; Monpilea + Alopaproć → „zlotolistka”.
 */
export function hybridOf(a, b) {
  if (!isTop(a) || !isTop(b) || a.chain === b.chain) return null;
  for (const [id, recipe] of Object.entries(HYBRIDS)) {
    const [x, y] = recipe.parents;
    if ((a.chain === x && b.chain === y) || (a.chain === y && b.chain === x)) return id;
  }
  return null;
}

/**
 * Ruch przedmiotu z pola `from` na pole `to` → { type: "none" | "move" | "merge" | "hybrid" | "swap", item }:
 * puste pole — przeniesienie; taki sam przedmiot — połączenie w następny poziom (na polu docelowym); dwie różne
 * rośliny najwyższego poziomu z przepisu `HYBRIDS` — hybryda (na polu docelowym); inny przedmiot — zamiana;
 * pole z przeszkodą (źródło albo cel) — "none".
 */
export function moveItem(board, from, to) {
  const source = board.cells[from];
  if (from === to || !source || to < 0 || to >= board.cells.length) return { type: "none" };
  // Przedmiot pod karteczką nie rusza się, a na przeszkodę nic nie spada.
  if (board.blocks?.[from] || board.blocks?.[to]) return { type: "none" };
  const target = board.cells[to];
  if (!target) {
    board.cells[to] = source;
    board.cells[from] = null;
    return { type: "move", item: source };
  }
  if (canMerge(source, target)) {
    const item = { chain: source.chain, level: source.level + 1 };
    board.cells[to] = item;
    board.cells[from] = null;
    return { type: "merge", item };
  }
  const hybrid = hybridOf(source, target);
  if (hybrid) {
    const item = { chain: hybrid, level: 1 };
    board.cells[to] = item;
    board.cells[from] = null;
    return { type: "hybrid", item };
  }
  board.cells[to] = source;
  board.cells[from] = target;
  return { type: "swap", item: source };
}

/** Przedmiot na losowym wolnym polu → indeks albo -1 (plansza pełna). */
export function spawnItem(board, item, random = Math.random) {
  const free = emptyCells(board);
  if (!free.length) return -1;
  const index = free[Math.floor(random() * free.length)];
  board.cells[index] = { ...item };
  return index;
}

/**
 * Kopia przedmiotu na losowym wolnym polu **obok** (góra, dół, lewo, prawo) takiego samego przedmiotu → indeks;
 * gdy takiego miejsca nie ma — jak `spawnItem` (losowe wolne pole albo -1).
 */
export function spawnNear(board, item, random = Math.random) {
  const near = new Set();
  board.cells.forEach((other, index) => {
    if (!other || other.chain !== item.chain || other.level !== item.level) return;
    for (const target of neighbors(board, index)) if (isFree(board, target)) near.add(target);
  });
  if (!near.size) return spawnItem(board, item, random);
  const free = [...near].sort((a, b) => a - b);
  const index = free[Math.floor(random() * free.length)];
  board.cells[index] = { ...item };
  return index;
}

/** Usunięcie przedmiotu (kompostownik) → usunięty przedmiot albo null. */
export function removeItem(board, index) {
  const item = board.cells[index];
  if (!item || board.blocks?.[index]) return null;
  board.cells[index] = null;
  return item;
}

/**
 * Pary do połączenia na planszy (każdy przedmiot może trafić w dowolne miejsce, więc liczy się sam skład): takie
 * same przedmioty poniżej najwyższego poziomu i pary do hybrydy (po jednej na przepis, jeśli są oba składniki);
 * przedmioty pod karteczkami się nie liczą.
 */
export function mergeablePairs(board) {
  const counts = new Map();
  const tops = new Set();
  for (const [index, item] of board.cells.entries()) {
    if (!item || board.blocks?.[index]) continue;
    if (isTop(item)) {
      tops.add(item.chain);
      continue;
    }
    const key = `${item.chain}:${item.level}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let pairs = 0;
  for (const count of counts.values()) pairs += Math.floor(count / 2);
  for (const recipe of Object.values(HYBRIDS)) if (recipe.parents.every((chain) => tops.has(chain))) pairs += 1;
  return pairs;
}

/**
 * Wyjścia z sytuacji: { merges, empty, compost, notes } — pary do połączenia, wolne pola (Sowia doniczka),
 * przedmioty do kompostu (bez karteczki) i karteczki do odklejenia stuknięciami. Plansza nigdy nie blokuje się bez
 * wyjścia: pełna i bez par wciąż ma kompost albo karteczki, które zwalniają pole.
 */
export function exits(board) {
  let compost = 0;
  let notes = 0;
  board.cells.forEach((item, index) => {
    const block = board.blocks?.[index];
    if (block?.type === "note") notes += 1;
    else if (item && !block) compost += 1;
  });
  return { merges: mergeablePairs(board), empty: emptyCells(board).length, compost, notes };
}

/** Kopia pól do zapisu. */
export const serializeCells = (board) =>
  board.cells.map((item) => (item ? { chain: item.chain, level: item.level } : null));

/** Kopia przeszkód do zapisu. */
export const serializeBlocks = (board) =>
  (board.blocks || []).map((block) => (block ? { type: block.type, hits: block.hits } : null));
