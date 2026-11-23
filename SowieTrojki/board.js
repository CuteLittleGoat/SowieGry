// Sowie Trójki — logika planszy (Analiza 5, rozdz. 6, 7 i 14.3): czysta, bez strony i rysowania, z ziarnem losowania
// (to samo ziarno = ta sama gra). Wynik każdego ruchu to oś czasu kroków dla animacji: `swap`, `swapBack`, `clear`,
// `create`, `fire`, `damage`, `tape`, `fall`, `hatch`, `phone`, `shuffle`.
//
// Plansza: `rows × cols` pól (indeks = rząd × cols + kolumna, rząd 0 u góry). Pole: `{ hole, nest, spawner, item,
// block }`; przedmiot `item`: `{ id, kind, special, dir, egg, tape }` — zwykły kafelek ma `kind` (rodzaj), moc ma
// `special` (pioro z `dir` "h"/"v", piskle, babel, teczowy) i nie ma rodzaju (nie pasuje do trójek), jajko `egg: true`;
// `tape: 1` — taśma Amic (kafelek się nie rusza). Przeszkoda `block`: `{ type, layers }` zajmuje całe pole.
import { createRng } from "../shared/engine/rng.js";
import { COLS, KINDS, MAX_WAVES, SHUFFLE_TRIES } from "./config.js";

// ---------- Budowa planszy z poziomu ----------

// Znaki planszy poziomu (Analiza 5, rozdz. 9.4): `.` pole, `#` dziura, `K` karteczka (1 warstwa), `D` karteczka
// (2 warstwy), `E` karteczka (3), `S` skrzynia (1), `B` skrzynia (2), `C` kanister, `T` telefon, `t` kafelek w taśmie,
// `J` jajko, `G` gniazdo (pole w dolnym rzędzie), `W` wylot nowych kafelków (bez `W` — górne pole każdej kolumny),
// `1`–`6` kafelek ustalonego rodzaju (samouczek).
export const BOARD_CHARS = Object.freeze({
  ".": {},
  "#": { hole: true },
  K: { block: { type: "note", layers: 1 } },
  D: { block: { type: "note", layers: 2 } },
  E: { block: { type: "note", layers: 3 } },
  S: { block: { type: "crate", layers: 1 } },
  B: { block: { type: "crate", layers: 2 } },
  C: { block: { type: "canister", layers: 1 } },
  T: { block: { type: "phone", layers: 2 } },
  t: { tape: 1 },
  J: { egg: true },
  G: { nest: true },
  W: { spawner: true },
});

export const index = (board, row, col) => row * board.cols + col;
export const rowOf = (board, cell) => Math.floor(cell / board.cols);
export const colOf = (board, cell) => cell % board.cols;

function makeItem(board, fields) {
  board.nextId += 1;
  return { id: board.nextId, kind: null, special: null, dir: null, egg: false, tape: 0, ...fields };
}

/**
 * createBoard(poziom, { seed, rng }) → plansza z maski poziomu, wypełniona kafelkami bez gotowych trójek
 * i z co najmniej jednym ruchem. `poziom.board` — tablica napisów (8 znaków), `poziom.kinds` — rodzaje kafelków.
 */
export function createBoard(level, { seed = "trojki", rng = null } = {}) {
  const rows = level.board.length;
  const cols = COLS;
  const board = {
    rows,
    cols,
    cells: [],
    kinds: [...(level.kinds || KINDS.slice(0, 4))],
    rng: rng || createRng(seed),
    nextId: 0,
  };
  const explicitSpawners = level.board.some((line) => line.includes("W"));
  level.board.forEach((line, row) => {
    if (line.length !== cols)
      throw new Error(`Poziom ${level.id}: rząd ${row + 1} ma ${line.length} pól zamiast ${cols}`);
    for (const char of line) {
      const info = BOARD_CHARS[char] || (/[1-6]/.test(char) ? { fixed: KINDS[Number(char) - 1] } : null);
      if (!info) throw new Error(`Poziom ${level.id}: nieznany znak „${char}”`);
      board.cells.push({
        hole: Boolean(info.hole),
        nest: Boolean(info.nest),
        spawner: Boolean(info.spawner),
        block: info.block ? { ...info.block } : null,
        item: null,
        start: info,
      });
    }
  });
  // Wyloty: bez `W` — najwyższe pole bez dziury i przeszkody w każdej kolumnie.
  if (!explicitSpawners) {
    for (let col = 0; col < cols; col += 1) {
      for (let row = 0; row < rows; row += 1) {
        const cell = board.cells[index(board, row, col)];
        if (cell.hole) continue;
        cell.spawner = true;
        break;
      }
    }
  }
  fillStart(board);
  for (const cell of board.cells) delete cell.start;
  return board;
}

// Rodzaj, który nie tworzy trójki ani kwadratu 2 × 2 z polami już wypełnionymi (z lewej i z góry).
function safeKind(board, cell, kinds) {
  const row = rowOf(board, cell);
  const col = colOf(board, cell);
  const kindAt = (r, c) => {
    if (r < 0 || c < 0 || c >= board.cols) return null;
    const item = board.cells[index(board, r, c)].item;
    return item && !item.special && !item.egg ? item.kind : null;
  };
  const banned = new Set();
  const left1 = kindAt(row, col - 1);
  if (left1 && left1 === kindAt(row, col - 2)) banned.add(left1);
  const up1 = kindAt(row - 1, col);
  if (up1 && up1 === kindAt(row - 2, col)) banned.add(up1);
  if (left1 && left1 === up1 && left1 === kindAt(row - 1, col - 1)) banned.add(left1);
  const allowed = kinds.filter((kind) => !banned.has(kind));
  return board.rng.pick(allowed.length ? allowed : kinds);
}

function fillStart(board) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    board.cells.forEach((cell, at) => {
      cell.item = null;
      const start = cell.start || {};
      if (cell.hole || cell.block) return;
      if (start.egg) cell.item = makeItem(board, { egg: true });
      else if (start.fixed) cell.item = makeItem(board, { kind: start.fixed });
      else cell.item = makeItem(board, { kind: safeKind(board, at, board.kinds), tape: start.tape ? 1 : 0 });
    });
    if (!findGroups(board).length && listMoves(board).length) return;
  }
  // Ustalone kafelki samouczka mogły zablokować ruchy — wtedy mieszanie (zachowuje ustalone pola, gdy się da).
  shuffle(board, []);
}

/** Kopia planszy (np. do podpowiedzi i symulatora); `rng` — osobny generator kopii (domyślnie w tym samym stanie). */
export function cloneBoard(board, rng = null) {
  const copy = rng || createRng(1);
  if (!rng) copy.setState(board.rng.getState());
  return {
    rows: board.rows,
    cols: board.cols,
    kinds: [...board.kinds],
    rng: copy,
    nextId: board.nextId,
    cells: board.cells.map((cell) => ({
      hole: cell.hole,
      nest: cell.nest,
      spawner: cell.spawner,
      block: cell.block ? { ...cell.block } : null,
      item: cell.item ? { ...cell.item } : null,
    })),
  };
}

// Znaki ustawienia przedmiotów (`setLayout`): `1`–`6` kafelek rodzaju, `a`–`f` kafelek rodzaju 1–6 w taśmie,
// `h` / `v` Pióro poziome / pionowe, `q` Pisklę, `o` Bąbel, `r` Tęczowy liść, `j` jajko, `-` puste pole, `.` bez zmian.
const LAYOUT_SPECIALS = Object.freeze({
  h: ["pioro", "h"],
  v: ["pioro", "v"],
  q: ["piskle"],
  o: ["babel"],
  r: ["teczowy"],
});

/** Ustawia przedmioty na planszy według napisów (samouczek, testy). Pola z dziurą i przeszkodą pomija. */
export function setLayout(board, rows) {
  rows.forEach((line, row) => {
    [...line].forEach((char, col) => {
      const cell = board.cells[index(board, row, col)];
      if (!cell || cell.hole || cell.block || char === ".") return;
      if (char === "-") cell.item = null;
      else if (/[1-6]/.test(char)) cell.item = makeItem(board, { kind: KINDS[Number(char) - 1] });
      else if (/[a-f]/.test(char)) cell.item = makeItem(board, { kind: KINDS[char.charCodeAt(0) - 97], tape: 1 });
      else if (char === "j") cell.item = makeItem(board, { egg: true });
      else if (LAYOUT_SPECIALS[char]) {
        const [special, dir = null] = LAYOUT_SPECIALS[char];
        cell.item = makeItem(board, { special, dir });
      } else throw new Error(`setLayout: nieznany znak „${char}”`);
    });
  });
  return board;
}

// ---------- Zapytania ----------

const isTile = (item) => Boolean(item && item.kind && !item.special && !item.egg);
// Przedmiot, który spada (kafelek bez taśmy, moc, jajko).
const falls = (item) => Boolean(item && !item.tape);
const fillable = (cell) => !cell.hole && !cell.block;

/** Czy pole można przesunąć (zamiana): przedmiot bez taśmy, bez przeszkody. */
export function swappable(board, cell) {
  const target = board.cells[cell];
  return Boolean(target && !target.hole && !target.block && target.item && !target.item.tape);
}

export function neighbors(board, cell) {
  const row = rowOf(board, cell);
  const col = colOf(board, cell);
  const list = [];
  if (row > 0) list.push(cell - board.cols);
  if (row < board.rows - 1) list.push(cell + board.cols);
  if (col > 0) list.push(cell - 1);
  if (col < board.cols - 1) list.push(cell + 1);
  return list;
}

export const adjacent = (board, a, b) =>
  (Math.abs(a - b) === 1 && rowOf(board, a) === rowOf(board, b)) || Math.abs(a - b) === board.cols;

/** Ile kafelków każdego rodzaju jest na planszy (`{ rodzaj: liczba }`). */
export function kindCounts(board) {
  const counts = {};
  for (const cell of board.cells) if (isTile(cell.item)) counts[cell.item.kind] = (counts[cell.item.kind] || 0) + 1;
  return counts;
}

/** Najliczniejszy rodzaj na planszy (remis — wcześniejszy na liście rodzajów poziomu). */
export function mostCommonKind(board) {
  const counts = kindCounts(board);
  let best = null;
  for (const kind of board.kinds) if (counts[kind] && (!best || counts[kind] > counts[best])) best = kind;
  return best;
}

// ---------- Dopasowania ----------

function runsOf(board) {
  const runs = [];
  const kindAt = (row, col) => {
    const item = board.cells[index(board, row, col)].item;
    return isTile(item) ? item.kind : null;
  };
  for (let row = 0; row < board.rows; row += 1) {
    let start = 0;
    for (let col = 1; col <= board.cols; col += 1) {
      const same = col < board.cols && kindAt(row, col) && kindAt(row, col) === kindAt(row, start);
      if (same) continue;
      if (kindAt(row, start) && col - start >= 3) {
        runs.push({ dir: "h", kind: kindAt(row, start), cells: range(start, col).map((c) => index(board, row, c)) });
      }
      start = col;
    }
  }
  for (let col = 0; col < board.cols; col += 1) {
    let start = 0;
    for (let row = 1; row <= board.rows; row += 1) {
      const same = row < board.rows && kindAt(row, col) && kindAt(row, col) === kindAt(start, col);
      if (same) continue;
      if (kindAt(start, col) && row - start >= 3) {
        runs.push({ dir: "v", kind: kindAt(start, col), cells: range(start, row).map((r) => index(board, r, col)) });
      }
      start = row;
    }
  }
  return runs;
}

function squaresOf(board) {
  const squares = [];
  for (let row = 0; row < board.rows - 1; row += 1) {
    for (let col = 0; col < board.cols - 1; col += 1) {
      const cells = [index(board, row, col), index(board, row, col + 1)];
      cells.push(cells[0] + board.cols, cells[1] + board.cols);
      const items = cells.map((cell) => board.cells[cell].item);
      if (items.every(isTile) && items.every((item) => item.kind === items[0].kind)) {
        squares.push({ kind: items[0].kind, cells });
      }
    }
  }
  return squares;
}

const range = (from, to) => Array.from({ length: to - from }, (_, offset) => from + offset);

/**
 * Ułożenia na planszy: odcinki ≥ 3 w rzędzie i kolumnie oraz kwadraty 2 × 2 tego samego rodzaju; odcinki i kwadraty
 * mające wspólne pole łączą się w jedno ułożenie (L, T, +). Rodzaj mocy według pierwszeństwa: Tęczowy liść (5 w linii)
 * > Bąbel (oba kierunki, ≥ 5 pól) > Pióro (4 w linii) > Pisklę (kwadrat) > zwykłe. → `[{ kind, cells, special, dir }]`
 */
export function findGroups(board) {
  const parts = [
    ...runsOf(board).map((run) => ({ ...run, square: false })),
    ...squaresOf(board).map((sq) => ({ ...sq, square: true })),
  ];
  if (!parts.length) return [];
  // Łączenie części ze wspólnymi polami (union-find po indeksach części).
  const parent = parts.map((_, at) => at);
  const find = (at) => (parent[at] === at ? at : (parent[at] = find(parent[at])));
  const owner = new Map();
  parts.forEach((part, at) => {
    for (const cell of part.cells) {
      if (owner.has(cell)) parent[find(at)] = find(owner.get(cell));
      else owner.set(cell, at);
    }
  });
  const groups = new Map();
  parts.forEach((part, at) => {
    const root = find(at);
    if (!groups.has(root)) groups.set(root, { kind: part.kind, cells: new Set(), parts: [] });
    const group = groups.get(root);
    group.parts.push(part);
    for (const cell of part.cells) group.cells.add(cell);
  });
  return [...groups.values()].map((group) => {
    const lines = group.parts.filter((part) => !part.square);
    const longest = lines.reduce((best, line) => (line.cells.length > (best?.cells.length || 0) ? line : best), null);
    const both = lines.some((line) => line.dir === "h") && lines.some((line) => line.dir === "v");
    let special = null;
    let dir = null;
    if (longest && longest.cells.length >= 5) special = "teczowy";
    else if (both && group.cells.size >= 5) special = "babel";
    else if (longest && longest.cells.length === 4) {
      special = "pioro";
      dir = longest.dir;
    } else if (group.parts.some((part) => part.square)) special = "piskle";
    return { kind: group.kind, cells: [...group.cells].sort((a, b) => a - b), special, dir };
  });
}

// Czy pole jest częścią ułożenia (szybkie sprawdzenie dla listy ruchów).
function matchAt(board, cell) {
  const item = board.cells[cell].item;
  if (!isTile(item)) return false;
  const row = rowOf(board, cell);
  const col = colOf(board, cell);
  const same = (r, c) =>
    r >= 0 &&
    r < board.rows &&
    c >= 0 &&
    c < board.cols &&
    board.cells[index(board, r, c)].item?.kind === item.kind &&
    isTile(board.cells[index(board, r, c)].item);
  let horizontal = 1;
  for (let c = col - 1; same(row, c); c -= 1) horizontal += 1;
  for (let c = col + 1; same(row, c); c += 1) horizontal += 1;
  if (horizontal >= 3) return true;
  let vertical = 1;
  for (let r = row - 1; same(r, col); r -= 1) vertical += 1;
  for (let r = row + 1; same(r, col); r += 1) vertical += 1;
  if (vertical >= 3) return true;
  for (const [dr, dc] of [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ]) {
    if (same(row + dr, col) && same(row, col + dc) && same(row + dr, col + dc)) return true;
  }
  return false;
}

/**
 * Możliwe ruchy: zamiany dające ułożenie, zamiany z mocą (zawsze dozwolone) i stuknięcia w moc.
 * → `[{ type: "swap", a, b } | { type: "tap", a }]`
 */
export function listMoves(board) {
  const moves = [];
  for (let cell = 0; cell < board.cells.length; cell += 1) {
    if (!swappable(board, cell)) continue;
    const item = board.cells[cell].item;
    if (item.special) moves.push({ type: "tap", a: cell });
    for (const other of [cell + 1, cell + board.cols]) {
      if (other >= board.cells.length || !adjacent(board, cell, other) || !swappable(board, other)) continue;
      const second = board.cells[other].item;
      if (item.special || second.special) {
        moves.push({ type: "swap", a: cell, b: other });
        continue;
      }
      swapItems(board, cell, other);
      const valid = matchAt(board, cell) || matchAt(board, other);
      swapItems(board, cell, other);
      if (valid) moves.push({ type: "swap", a: cell, b: other });
    }
  }
  return moves;
}

function swapItems(board, a, b) {
  const first = board.cells[a].item;
  board.cells[a].item = board.cells[b].item;
  board.cells[b].item = first;
}

// ---------- Ruch gracza ----------

/**
 * Zamiana dwóch sąsiednich pól. Niedozwolona (bez ułożenia i bez mocy) — plansza bez zmian, kroki `swap`
 * i `swapBack`, `valid: false`. Dozwolona — rozstrzygnięcie z kaskadami (`resolve`).
 * `goals` — wskazówki celów dla Pisklęcia (`targetsOf`). → `{ valid, steps, stats }`
 */
export function trySwap(board, a, b, { goals = null } = {}) {
  if (!adjacent(board, a, b) || !swappable(board, a) || !swappable(board, b)) {
    return { valid: false, steps: [{ type: "blocked", a, b }], stats: emptyStats() };
  }
  const first = board.cells[a].item;
  const second = board.cells[b].item;
  const steps = [{ type: "swap", a, b }];
  if (first.special && second.special) {
    // Połączenie dwóch mocy — w polu, na które gracz przesunął kafelek.
    board.cells[a].item = null;
    board.cells[b].item = null;
    return resolve(board, { steps, combo: { first, second, at: b }, moved: [a, b], goals });
  }
  swapItems(board, a, b);
  if (first.special || second.special) {
    const specialAt = first.special ? b : a;
    const special = board.cells[specialAt].item;
    const other = board.cells[specialAt === a ? b : a].item;
    board.cells[specialAt].item = null;
    const targetKind = special.special === "teczowy" ? (isTile(other) ? other.kind : mostCommonKind(board)) : null;
    return resolve(board, { steps, fires: [{ at: specialAt, item: special, targetKind }], moved: [a, b], goals });
  }
  if (!matchAt(board, a) && !matchAt(board, b)) {
    swapItems(board, a, b);
    steps.push({ type: "swapBack", a, b });
    return { valid: false, steps, stats: emptyStats() };
  }
  return resolve(board, { steps, moved: [b, a], goals });
}

/** Stuknięcie w moc (zabiera ruch): Tęczowy liść zabiera najliczniejszy rodzaj. → `{ valid, steps, stats }` */
export function tapSpecial(board, at, { goals = null } = {}) {
  const item = board.cells[at]?.item;
  if (!item?.special || item.tape) return { valid: false, steps: [], stats: emptyStats() };
  board.cells[at].item = null;
  const targetKind = item.special === "teczowy" ? mostCommonKind(board) : null;
  return resolve(board, { steps: [{ type: "tap", a: at }], fires: [{ at, item, targetKind }], moved: [at], goals });
}

/**
 * Odpalenie mocy spoza planszy (Sowia pomoc — Pióra zrzucone przez Sówkę, Humbaczy Finał): `fires` — lista
 * `{ at, item }` (przedmioty spoza planszy). → `{ valid: true, steps, stats }`
 */
export function dropPowers(board, fires, { goals = null, scoreAsPower = true } = {}) {
  return resolve(board, { steps: [], fires, moved: [], goals, scoreAsPower });
}

function emptyStats() {
  return {
    waves: 0,
    combo: 0,
    cleared: {},
    clearedByMatch: 0,
    clearedByPower: 0,
    created: [],
    fired: [],
    comboSwap: null,
    layers: { note: 0, crate: 0, canister: 0, phone: 0 },
    removed: { note: 0, crate: 0, canister: 0, phone: 0 },
    eggs: 0,
    tapes: 0,
    score: 0,
    scoreByWave: [],
    phoneSpread: null,
    shuffled: false,
    hitNoteOrPhone: false,
  };
}

// ---------- Moce ----------

// Pola trafione przez moc w polu `at` (bez samego pola mocy dla Pisklęcia — to liczy `fireAt`).
function areaOf(board, at, item, extra = {}) {
  const row = rowOf(board, at);
  const col = colOf(board, at);
  const square = (radius) => {
    const cells = [];
    for (let r = row - radius; r <= row + radius; r += 1) {
      for (let c = col - radius; c <= col + radius; c += 1) {
        if (r >= 0 && r < board.rows && c >= 0 && c < board.cols) cells.push(index(board, r, c));
      }
    }
    return cells;
  };
  const rowCells = (r) => range(0, board.cols).map((c) => index(board, r, c));
  const colCells = (c) => range(0, board.rows).map((r) => index(board, r, c));
  const plus = (cell) => [cell, ...neighbors(board, cell)];
  switch (extra.mode || item.special) {
    case "pioro":
      return item.dir === "v" ? colCells(col) : rowCells(row);
    case "babel":
      return square(2);
    case "piskle":
      return plus(at);
    case "cross":
      return [...new Set([...rowCells(row), ...colCells(col)])];
    case "bigCross": {
      const cells = new Set();
      for (let d = -1; d <= 1; d += 1) {
        if (row + d >= 0 && row + d < board.rows) rowCells(row + d).forEach((cell) => cells.add(cell));
        if (col + d >= 0 && col + d < board.cols) colCells(col + d).forEach((cell) => cells.add(cell));
      }
      return [...cells];
    }
    case "bigBubble":
      return square(3);
    case "all":
      return range(0, board.cells.length);
    default:
      return [at];
  }
}

/**
 * Najbardziej pomocne pole dla Pisklęcia (i Sowiej pomocy): przeszkody z celów, kafelki zbieranego rodzaju, pole pod
 * jajkiem; inaczej losowy kafelek. `goals` — `{ kinds: Set, blocks: Set, eggs }` (co jeszcze trzeba zrobić).
 * `skip` — pola już wybrane (kilka piskląt leci do różnych celów).
 */
export function targetsOf(board, goals, skip = new Set()) {
  const scored = [];
  board.cells.forEach((cell, at) => {
    if (cell.hole || skip.has(at)) return;
    let score = 0;
    if (cell.block) {
      const type = cell.block.type;
      score = goals?.blocks?.has(type) ? 60 + cell.block.layers : type === "phone" ? 30 : 20;
    } else if (cell.item) {
      if (cell.item.egg || cell.item.special) return;
      if (goals?.kinds?.has(cell.item.kind)) score = 30;
      else score = 5;
      if (cell.item.tape) score += 10;
      // Pole pod jajkiem — jajko spadnie bliżej gniazda.
      const above = at - board.cols;
      if (goals?.eggs && above >= 0 && board.cells[above].item?.egg) score += 50;
    } else return;
    scored.push({ at, score: score + board.rng.next() });
  });
  scored.sort((x, y) => y.score - x.score);
  return scored.map((entry) => entry.at);
}

// ---------- Rozstrzyganie ruchu ----------

/**
 * Pętla „moce → ułożenia → przeszkody → spadanie i nowe kafelki → jajka” aż do spokoju (bezpiecznik `MAX_WAVES`
 * fal). Na końcu ruchu: telefon Pracu dokleja karteczkę (gdy w ruchu nie trafiono karteczki ani telefonu) i — gdy
 * nie ma ruchów — mieszanie. → `{ valid: true, steps, stats }`
 */
function resolve(board, { steps, fires = [], combo = null, moved = [], goals = null, scoreAsPower = false }) {
  const stats = emptyStats();
  let queue = fires.map((fire) => ({ ...fire, chained: false }));
  let first = true;
  if (combo) {
    const result = comboFires(board, combo, goals, stats, steps);
    queue = result;
  }
  for (let wave = 1; wave <= MAX_WAVES; wave += 1) {
    const clearsBefore = stats.clearedByMatch + stats.clearedByPower;
    const waveSteps = [];
    // 1) Moce (z ruchu i reakcje łańcuchowe w tej samej fali).
    while (queue.length) {
      const fire = queue.shift();
      const chained = fireAt(board, fire, goals, stats, waveSteps, wave);
      for (const next of chained) queue.push({ ...next, chained: true });
    }
    // 2) Ułożenia.
    const groups = findGroups(board);
    if (groups.length) {
      stats.combo += 1;
      clearGroups(board, groups, wave, first ? moved : [], stats, waveSteps, scoreAsPower);
    }
    first = false;
    const clearedNow = stats.clearedByMatch + stats.clearedByPower > clearsBefore;
    const anything = waveSteps.length > 0;
    steps.push(...waveSteps);
    if (!anything && !clearedNow) break;
    stats.waves = wave;
    // 3) Spadanie i nowe kafelki; jajka w gnieździe wykluwają się (i znowu spadanie).
    gravityAndEggs(board, stats, steps, wave);
    if (wave === MAX_WAVES) stats.guard = true;
  }
  // Telefon Pracu dzwoni: gdy w ruchu nie trafiono karteczki ani telefonu — nowa karteczka obok.
  spreadPhone(board, stats, steps);
  // Brak ruchów — Sówka miesza planszę (bez kary).
  if (!listMoves(board).length) {
    shuffle(board, steps);
    stats.shuffled = true;
  }
  return { valid: true, steps, stats };
}

// Połączenie dwóch mocy (rozdz. 6.6) → kolejka odpaleń.
function comboFires(board, { first, second, at }, goals, stats, steps) {
  const kinds = [first.special, second.special].sort();
  const key = kinds.join("+");
  stats.comboSwap = key;
  steps.push({ type: "combo", at, specials: [first.special, second.special] });
  const has = (name) => kinds.includes(name);
  if (key === "teczowy+teczowy") return [{ at, item: { special: "all" }, mode: "all" }];
  if (has("teczowy")) {
    // Wszystkie kafelki najliczniejszego rodzaju zamieniają się w drugą moc i odpalają po kolei.
    const other = first.special === "teczowy" ? second : first;
    const kind = mostCommonKind(board);
    const fires = [];
    board.cells.forEach((cell, cellAt) => {
      if (!isTile(cell.item) || cell.item.kind !== kind) return;
      const dir = other.special === "pioro" ? (board.rng.chance(0.5) ? "h" : "v") : null;
      const item = makeItem(board, { special: other.special, dir });
      cell.item = item;
      steps.push({ type: "create", at: cellAt, item: { ...item }, from: at });
      fires.push({ at: cellAt, item });
    });
    for (const fire of fires) board.cells[fire.at].item = null;
    return fires.length ? fires : [{ at, item: other }];
  }
  if (key === "pioro+pioro") return [{ at, item: first, mode: "cross" }];
  if (key === "babel+pioro") return [{ at, item: first, mode: "bigCross" }];
  if (key === "babel+babel") return [{ at, item: first, mode: "bigBubble" }];
  if (key === "piskle+piskle") return [{ at, item: first, mode: "owlets", count: 3 }];
  // Pisklę + Pióro / Bąbel: pisklę zanosi drugą moc do celu i tam ją odpala.
  const carried = first.special === "piskle" ? second : first;
  return [{ at, item: { special: "piskle" }, carry: carried }];
}

// Odpalenie mocy w polu `at` → lista mocy trafionych po drodze (reakcja łańcuchowa).
function fireAt(board, fire, goals, stats, steps, wave) {
  const { at, item } = fire;
  const chained = [];
  const hitCells = [];
  const special = fire.mode === "all" ? "all" : item.special;
  stats.fired.push(fire.mode && fire.mode !== "owlets" ? fire.mode : special);
  if (fire.chained) stats.combo += 1;
  let targets = [];
  if (special === "teczowy") {
    const kind = fire.targetKind || mostCommonKind(board);
    board.cells.forEach((cell, cellAt) => {
      if (isTile(cell.item) && cell.item.kind === kind) hitCells.push(cellAt);
    });
    steps.push({ type: "fire", at, special: "teczowy", kind, cells: [...hitCells], wave });
  } else if (special === "piskle" || fire.mode === "owlets") {
    // Pisklę: najpierw 4 sąsiednie pola, potem lot do celu i jeszcze raz (cel + 4 sąsiednie).
    const count = fire.mode === "owlets" ? 3 : 1;
    const skip = new Set();
    hitCells.push(...areaOf(board, at, { special: "piskle" }));
    for (let owlet = 0; owlet < count; owlet += 1) {
      const target =
        targetsOf(board, goals, skip).find((cell) => !hitCells.includes(cell)) ?? targetsOf(board, goals, skip)[0];
      if (target === undefined) break;
      skip.add(target);
      targets.push(target);
      if (fire.carry) {
        // Niesiona moc odpala się w celu.
        chained.push({ at: target, item: fire.carry });
      } else hitCells.push(...areaOf(board, target, { special: "piskle" }));
    }
    steps.push({
      type: "fire",
      at,
      special: "piskle",
      targets,
      carry: fire.carry?.special || null,
      cells: [...new Set(hitCells)],
      wave,
    });
  } else {
    const area = areaOf(board, at, item, { mode: fire.mode });
    hitCells.push(...area);
    steps.push({ type: "fire", at, special: fire.mode || special, dir: item.dir || null, cells: [...area], wave });
  }
  stats.joyFired = (stats.joyFired || 0) + 1;
  // Trafienia: każde pole najwyżej raz na odpalenie.
  for (const cellAt of new Set(hitCells)) {
    const cell = board.cells[cellAt];
    if (cell.hole) continue;
    if (cell.block) {
      damageBlock(board, cellAt, stats, steps, wave, true);
      continue;
    }
    const target = cell.item;
    if (!target || target.egg) continue;
    if (target.special) {
      cell.item = null;
      chained.push({ at: cellAt, item: target, targetKind: null });
      continue;
    }
    if (target.tape) {
      target.tape = 0;
      stats.tapes += 1;
      steps.push({ type: "tape", at: cellAt, wave });
      continue;
    }
    cell.item = null;
    stats.clearedByPower += 1;
    stats.cleared[target.kind] = (stats.cleared[target.kind] || 0) + 1;
    stats.score += 20;
    steps.push({ type: "clear", at: cellAt, item: { ...target }, by: "power", wave });
  }
  return chained;
}

function damageBlock(board, at, stats, steps, wave, byPower) {
  const cell = board.cells[at];
  const block = cell.block;
  if (!block) return;
  if (block.type === "canister" && !byPower) return;
  block.layers -= 1;
  stats.layers[block.type] += 1;
  stats.score += 50;
  if (block.type === "note" || block.type === "phone") stats.hitNoteOrPhone = true;
  const removed = block.layers <= 0;
  if (removed) {
    stats.removed[block.type] += 1;
    cell.block = null;
  }
  steps.push({ type: "damage", at, block: block.type, layers: Math.max(0, block.layers), removed, wave });
}

// Zbicie ułożeń: kafelki znikają (kafelek w taśmie — tylko taśma pęka), w ułożeniu z mocą powstaje moc, przeszkody
// obok ułożenia tracą warstwę (każda najwyżej raz na ułożenie).
function clearGroups(board, groups, wave, moved, stats, steps, scoreAsPower) {
  for (const group of groups) {
    const cleared = [];
    for (const cellAt of group.cells) {
      const item = board.cells[cellAt].item;
      if (!item) continue;
      if (item.tape) {
        item.tape = 0;
        stats.tapes += 1;
        steps.push({ type: "tape", at: cellAt, wave });
        continue;
      }
      board.cells[cellAt].item = null;
      cleared.push(cellAt);
      stats.clearedByMatch += 1;
      stats.cleared[item.kind] = (stats.cleared[item.kind] || 0) + 1;
      stats.score += scoreAsPower ? 20 : 20 * wave;
      steps.push({ type: "clear", at: cellAt, item: { ...item }, by: "match", wave });
    }
    // Przeszkody obok ułożenia.
    const touched = new Set();
    for (const cellAt of group.cells) {
      for (const near of neighbors(board, cellAt)) {
        if (board.cells[near].block && !touched.has(near)) touched.add(near);
      }
    }
    for (const near of touched) damageBlock(board, near, stats, steps, wave, false);
    // Moc w miejscu przesuniętego kafelka (jeśli w ułożeniu), inaczej najbliżej środka ułożenia.
    if (group.special && cleared.length) {
      const at =
        moved.find((cell) => group.cells.includes(cell) && !board.cells[cell].item) ?? centerOf(board, cleared);
      const item = makeItem(board, { special: group.special, dir: group.dir });
      board.cells[at].item = item;
      stats.created.push(group.special);
      stats.score += { pioro: 60, piskle: 60, babel: 120, teczowy: 200 }[group.special];
      steps.push({ type: "create", at, item: { ...item }, kind: group.kind, wave });
    }
  }
}

// Pole najbliżej środka ułożenia (remis: niżej, potem bardziej w lewo).
function centerOf(board, cells) {
  const rows = cells.map((cell) => rowOf(board, cell));
  const cols = cells.map((cell) => colOf(board, cell));
  const meanRow = rows.reduce((a, b) => a + b, 0) / cells.length;
  const meanCol = cols.reduce((a, b) => a + b, 0) / cells.length;
  return [...cells].sort((a, b) => {
    const da = (rowOf(board, a) - meanRow) ** 2 + (colOf(board, a) - meanCol) ** 2;
    const db = (rowOf(board, b) - meanRow) ** 2 + (colOf(board, b) - meanCol) ** 2;
    return da - db || rowOf(board, b) - rowOf(board, a) || colOf(board, a) - colOf(board, b);
  })[0];
}

// ---------- Spadanie ----------

// Czy pole `cell` (puste) dostanie kafelek z góry tej samej kolumny (spadający przedmiot albo wylot).
function feedsFromAbove(board, cell) {
  for (let at = cell; at >= 0; at -= board.cols) {
    const target = board.cells[at];
    if (at !== cell) {
      if (target.hole || target.block) return false;
      if (target.item) return falls(target.item);
    }
    if (target.spawner && !target.item) return true;
  }
  return false;
}

/**
 * Grawitacja w krokach (każdy przedmiot przesuwa się najwyżej o jedno pole na krok): w dół, a gdy pole pod
 * przeszkodą, dziurą albo taśmą nie dostanie kafelka z góry — ukosem z górnego sąsiada; puste wyloty dostają nowe
 * kafelki. Każdy przedmiot dostaje drogę (lista pól) do płynnej animacji. → `{ moves: [{ item, path, spawned }] }`
 */
export function applyGravity(board) {
  const paths = new Map();
  const note = (item, from, to, spawned = false) => {
    if (!paths.has(item.id)) paths.set(item.id, { item, path: [from], spawned });
    paths.get(item.id).path.push(to);
  };
  for (let tick = 0; tick < board.rows * 4 + 8; tick += 1) {
    let moved = false;
    const busy = new Set();
    for (let row = board.rows - 1; row >= 0; row -= 1) {
      for (let col = 0; col < board.cols; col += 1) {
        const at = index(board, row, col);
        const cell = board.cells[at];
        if (!fillable(cell) || cell.item || busy.has(at)) continue;
        const above = row > 0 ? at - board.cols : -1;
        if (above >= 0 && fillable(board.cells[above]) && falls(board.cells[above].item) && !busy.has(above)) {
          cell.item = board.cells[above].item;
          board.cells[above].item = null;
          note(cell.item, above, at);
          busy.add(at);
          moved = true;
          continue;
        }
        if (cell.spawner) {
          cell.item = makeItem(board, { kind: board.rng.pick(board.kinds) });
          note(cell.item, -1 - col, at, true);
          busy.add(at);
          moved = true;
          continue;
        }
        // Pole czekające na kafelek z góry bierze ukosem tylko przedmiot uwięziony nad dziurą, przeszkodą albo taśmą
        // (np. jajko nad dziurą — inaczej nigdy nie dotarłoby do gniazda); pole bez dopływu z góry — każdy, który nie
        // ma dokąd spaść w dół.
        const fed = feedsFromAbove(board, at);
        // Ukos: z lewego, potem z prawego górnego sąsiada.
        for (const dc of [-1, 1]) {
          if (row === 0 || col + dc < 0 || col + dc >= board.cols) continue;
          const source = at - board.cols + dc;
          const from = board.cells[source];
          if (busy.has(source) || !fillable(from) || !falls(from.item)) continue;
          const below = source + board.cols;
          const belowCell = board.cells[below];
          if (fillable(belowCell) && !belowCell.item) continue;
          const stuck = !fillable(belowCell) || Boolean(belowCell.item?.tape);
          if (fed && !stuck) continue;
          cell.item = from.item;
          from.item = null;
          note(cell.item, source, at);
          busy.add(at);
          moved = true;
          break;
        }
      }
    }
    if (!moved) break;
  }
  return { moves: [...paths.values()] };
}

function gravityAndEggs(board, stats, steps, wave) {
  for (let round = 0; round < 10; round += 1) {
    const fall = applyGravity(board);
    if (fall.moves.length)
      steps.push({ type: "fall", moves: fall.moves.map((move) => ({ ...move, item: { ...move.item } })), wave });
    const hatched = [];
    board.cells.forEach((cell, at) => {
      if (cell.nest && cell.item?.egg) {
        hatched.push(at);
        cell.item = null;
      }
    });
    if (!hatched.length) return;
    for (const at of hatched) {
      stats.eggs += 1;
      stats.score += 500;
      steps.push({ type: "hatch", at, wave });
    }
  }
}

// Telefon Pracu (rozdz. 7.1): gdy w ruchu nie trafiono karteczki ani telefonu, jeden telefon dokleja karteczkę
// (1 warstwa) na sąsiednim zwykłym kafelku.
function spreadPhone(board, stats, steps) {
  if (stats.hitNoteOrPhone) return;
  const options = [];
  board.cells.forEach((cell, at) => {
    if (cell.block?.type !== "phone") return;
    for (const near of neighbors(board, at)) {
      const target = board.cells[near];
      if (!target.block && isTile(target.item) && !target.item.tape) options.push({ from: at, at: near });
    }
  });
  if (!options.length) return;
  const choice = board.rng.pick(options);
  const target = board.cells[choice.at];
  const item = target.item;
  target.item = null;
  target.block = { type: "note", layers: 1 };
  stats.phoneSpread = choice;
  steps.push({ type: "phone", from: choice.from, at: choice.at, item: { ...item } });
}

// ---------- Mieszanie ----------

/**
 * Mieszanie (rozdz. 6.7): ruchome zwykłe kafelki zamieniają się miejscami (Fisher–Yates z ziarnem), aż nie ma trójek
 * i jest ruch (do `SHUFFLE_TRIES` prób; potem nowe rodzaje dla tych pól). Kroki: `shuffle` z drogami kafelków.
 */
export function shuffle(board, steps = []) {
  const cells = [];
  board.cells.forEach((cell, at) => {
    if (fillable(cell) && isTile(cell.item) && !cell.item.tape) cells.push(at);
  });
  const original = cells.map((at) => board.cells[at].item);
  for (let attempt = 0; attempt < SHUFFLE_TRIES * 2; attempt += 1) {
    const items = attempt < SHUFFLE_TRIES ? board.rng.shuffle([...original]) : original.map((item) => ({ ...item }));
    cells.forEach((at, position) => {
      board.cells[at].item = items[position];
    });
    if (attempt >= SHUFFLE_TRIES) {
      // Nowe rodzaje: wypełnienie jak na starcie (bez trójek).
      for (const at of cells) board.cells[at].item = null;
      for (const at of cells) board.cells[at].item = makeItem(board, { kind: safeKind(board, at, board.kinds) });
    }
    if (!findGroups(board).length && listMoves(board).length) break;
  }
  const moves = cells.map((at) => {
    const item = board.cells[at].item;
    const from = cells[original.findIndex((entry) => entry.id === item.id)];
    return { item: { ...item }, from: from === undefined ? at : from, to: at };
  });
  steps.push({ type: "shuffle", moves });
  return steps;
}

// ---------- Sprawdzenie planszy ----------

/**
 * Pola, do których może dotrzeć nowy kafelek: od wylotów w dół i ukosem w dół przez pola bez dziury, przeszkody
 * i kafelka w taśmie. Pole poza tym zbiorem (np. zamknięte od góry telefonem i karteczkami) może chwilowo stać puste —
 * zapełni się, gdy przeszkody znikną.
 */
export function reachableCells(board) {
  const open = (at) => fillable(board.cells[at]) && !board.cells[at].item?.tape;
  const seen = new Set();
  const queue = [];
  board.cells.forEach((cell, at) => {
    if (cell.spawner && open(at)) {
      seen.add(at);
      queue.push(at);
    }
  });
  while (queue.length) {
    const at = queue.shift();
    const row = rowOf(board, at);
    const col = colOf(board, at);
    if (row === board.rows - 1) continue;
    for (const dc of [0, -1, 1]) {
      if (col + dc < 0 || col + dc >= board.cols) continue;
      const next = at + board.cols + dc;
      if (seen.has(next) || !open(next)) continue;
      seen.add(next);
      queue.push(next);
    }
  }
  return seen;
}

/** Niezmienniki po ruchu (testy): osiągalne pola mają przedmiot, brak gotowych ułożeń, jest ruch. */
export function checkInvariants(board) {
  const problems = [];
  const reachable = reachableCells(board);
  board.cells.forEach((cell, at) => {
    if (cell.hole && (cell.item || cell.block)) problems.push(`dziura ${at} nie jest pusta`);
    if (fillable(cell) && !cell.item && reachable.has(at)) problems.push(`puste pole ${at}`);
    if (cell.block && (cell.block.layers < 1 || cell.block.layers > 3))
      problems.push(`warstwy ${at}: ${cell.block.layers}`);
  });
  if (findGroups(board).length) problems.push("gotowe ułożenie po ruchu");
  if (!listMoves(board).length) problems.push("brak ruchów");
  return problems;
}

/** Plansza jako napisy (testy, diagnostyka): rodzaj — pierwsza litera, moce — wielkie litery, przeszkody — znaki. */
export function boardToText(board) {
  const lines = [];
  for (let row = 0; row < board.rows; row += 1) {
    let line = "";
    for (let col = 0; col < board.cols; col += 1) {
      const cell = board.cells[index(board, row, col)];
      if (cell.hole) line += "#";
      else if (cell.block) line += { note: "K", crate: "S", canister: "C", phone: "T" }[cell.block.type];
      else if (!cell.item) line += " ";
      else if (cell.item.egg) line += "J";
      else if (cell.item.special) line += { pioro: "P", piskle: "Q", babel: "O", teczowy: "R" }[cell.item.special];
      else line += String(KINDS.indexOf(cell.item.kind) + 1);
    }
    lines.push(line);
  }
  return lines;
}
