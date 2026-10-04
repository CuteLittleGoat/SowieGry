// Łącz i Hoduj — plansza (czysta logika, bez DOM): pola, przenoszenie, łączenie, zamiana, wolne pola i wyjścia
// z zapchanej planszy. Przedmiot: { chain, level } (poziom od 1), puste pole: null.
import { CHAINS, HYBRIDS } from "./config.js";

/** Najwyższy poziom łańcucha. */
export const maxLevel = (chain) => CHAINS[chain]?.levels.length ?? 0;

/** Nazwa przedmiotu, np. „Kiełek”. */
export const itemName = (item) => (item ? (CHAINS[item.chain]?.levels[item.level - 1] ?? "") : "");

/** Nowa plansza `cols × rows` (opcjonalnie z polami z zapisu — niepoprawne przedmioty stają się pustymi polami). */
export function createBoard({ cols, rows, cells = null }) {
  const size = cols * rows;
  const list = Array.from({ length: size }, (_, index) => {
    const item = cells?.[index];
    return item && CHAINS[item.chain] && item.level >= 1 && item.level <= maxLevel(item.chain)
      ? { chain: item.chain, level: Math.floor(item.level) }
      : null;
  });
  return { cols, rows, cells: list };
}

export const cellIndex = (board, col, row) => row * board.cols + col;
export const cellPosition = (board, index) => ({ col: index % board.cols, row: Math.floor(index / board.cols) });

/** Indeksy wolnych pól. */
export const emptyCells = (board) =>
  board.cells.reduce((list, item, index) => (item ? list : (list.push(index), list)), []);

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
 * rośliny najwyższego poziomu z przepisu `HYBRIDS` — hybryda (na polu docelowym); inny przedmiot — zamiana.
 */
export function moveItem(board, from, to) {
  const source = board.cells[from];
  if (from === to || !source || to < 0 || to >= board.cells.length) return { type: "none" };
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

/** Usunięcie przedmiotu (kompostownik) → usunięty przedmiot albo null. */
export function removeItem(board, index) {
  const item = board.cells[index];
  if (!item) return null;
  board.cells[index] = null;
  return item;
}

/**
 * Pary do połączenia na planszy (każdy przedmiot może trafić w dowolne miejsce, więc liczy się sam skład): takie
 * same przedmioty poniżej najwyższego poziomu i pary do hybrydy (po jednej na przepis, jeśli są oba składniki).
 */
export function mergeablePairs(board) {
  const counts = new Map();
  const tops = new Set();
  for (const item of board.cells) {
    if (!item) continue;
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
 * Wyjścia z sytuacji: { merges, empty, compost } — pary do połączenia, wolne pola (Sowia doniczka), przedmioty do
 * kompostu. Plansza nigdy nie blokuje się bez wyjścia: pełna i bez par wciąż ma kompost, który zwalnia pole.
 */
export function exits(board) {
  const filled = board.cells.filter(Boolean).length;
  return { merges: mergeablePairs(board), empty: board.cells.length - filled, compost: filled };
}

/** Kopia pól do zapisu. */
export const serializeCells = (board) =>
  board.cells.map((item) => (item ? { chain: item.chain, level: item.level } : null));
