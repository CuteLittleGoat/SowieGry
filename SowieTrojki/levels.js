// Sowie Trójki — 45 poziomów w 3 rozdziałach (Analiza 5, rozdz. 9): Sowia Łąka (1–15), Ogródek Sówki (16–30), Staw
// Humbaka (31–45). Plansza rysowana znakami (`board.js`, BOARD_CHARS): `.` pole, `#` dziura, `K`/`D`/`E` karteczka
// Pracu z 1/2/3 warstwami, `S`/`B` skrzynia Amic z 1/2 warstwami, `C` kanister Amic, `T` telefon Pracu, `t` kafelek
// w taśmie, `J` jajko, `G` gniazdo, `1`–`6` kafelek ustalonego rodzaju (samouczek). Liczba ruchów i progi gwiazdek
// ustawione symulatorem (`bot.js`, `scripts/trojki-strojenie.mjs`); trudność według „piły” (rozdz. 9.3).
import { createBoard, findGroups, listMoves } from "./board.js";
import { GOAL_TYPES, KINDS } from "./config.js";

export const CHAPTERS = Object.freeze([
  { id: "laka", name: "Sowia Łąka", from: 1, to: 15 },
  { id: "ogrodek", name: "Ogródek Sówki", from: 16, to: 30 },
  { id: "staw", name: "Staw Humbaka", from: 31, to: 45 },
]);

// Karty „Nowość” przed poziomem (rozdz. 10).
export const INTROS = Object.freeze({
  zamiana: {
    title: "Zamiana",
    text: "Przesuń kafelek palcem na sąsiednie pole, żeby ułożyć trzy takie same w rzędzie albo w kolumnie.",
  },
  pioro: { title: "Pióro", text: "Cztery w linii dają Pióro — stuknij je albo przesuń, a przeleci przez cały rząd." },
  combo: {
    title: "Combo",
    text: "Gdy po spadnięciu ułożą się kolejne trójki, to combo — Sówka cieszy się coraz bardziej!",
  },
  karteczka: {
    title: "Karteczka Pracu",
    text: "Zerwij karteczkę, układając trójki tuż obok niej. Cyfra mówi, ile warstw zostało.",
  },
  babel: {
    title: "Bąbel",
    text: "Ułożenie w kształcie L albo T daje Bąbel — pęka z pluskiem i zbija wszystko dookoła.",
  },
  piskle: { title: "Pisklę", text: "Kwadrat 2 × 2 daje Pisklę — leci tam, gdzie najbardziej pomoże w celu." },
  skrzynia: {
    title: "Skrzynia Amic",
    text: "Rozbij skrzynię trójkami obok albo mocą. Cyfra mówi, ile uderzeń zostało.",
  },
  jajko: { title: "Jajka", text: "Sprowadź jajko do gniazda na dole — pisklę wykluje się i poleci do Sówki." },
  teczowy: {
    title: "Tęczowy liść",
    text: "Pięć w linii daje Tęczowy liść — zamień go z kafelkiem, a zbije wszystkie takie same.",
  },
  tasma: {
    title: "Taśma Amic",
    text: "Kafelka w taśmie nie da się przesunąć. Ułóż go w trójkę albo trafi go mocą — taśma pęknie.",
  },
  kanister: {
    title: "Kanister Amic",
    text: "Kanister rozbijesz tylko mocą: Piórem, Bąblem, Pisklęciem albo Tęczowym liściem.",
  },
  telefon: {
    title: "Telefon Pracu",
    text: "Gdy w ruchu nie trafisz karteczki ani telefonu, telefon dzwoni i przykleja nową karteczkę. Wyłącz go dwoma trafieniami.",
  },
});

const FOUR = ["lisc", "zloty", "humbak", "truskawka"];
const FIVE = ["lisc", "zloty", "humbak", "kozka", "truskawka"];
const FIVE_B = ["lisc", "zloty", "humbak", "truskawka", "storczyk"];
const FIVE_C = ["lisc", "zloty", "kozka", "truskawka", "storczyk"];
const SIX = [...KINDS];

const OPEN8 = ["........", "........", "........", "........", "........", "........", "........", "........"];
const OPEN9 = [...OPEN8, "........"];

const goal = {
  collect: (kind, count) => ({ type: "collect", kind, count }),
  score: (count) => ({ type: "score", count }),
  notes: (count) => ({ type: "notes", count }),
  crates: (count) => ({ type: "crates", count }),
  phones: (count) => ({ type: "phones", count }),
  eggs: (count) => ({ type: "eggs", count }),
};

// prettier-ignore
const LEVEL_LIST = [
  // ---------- Rozdział 1: Sowia Łąka ----------
  { id: 1, moves: 20, kinds: FOUR, difficulty: "latwy", intro: "zamiana", goals: [goal.collect("lisc", 25)], board: OPEN8 },
  {
    id: 2, moves: 18, kinds: FOUR, difficulty: "latwy", intro: "pioro", goals: [goal.score(5000)],
    board: ["........", "........", "........", "........", "........", "....1...", "..11.1..", "........"],
  },
  { id: 3, moves: 20, kinds: FOUR, difficulty: "latwy", intro: "combo", goals: [goal.collect("truskawka", 25), goal.collect("zloty", 25)], board: OPEN8 },
  {
    id: 4, moves: 20, kinds: FOUR, difficulty: "latwy", intro: "karteczka", goals: [goal.notes(6)],
    board: ["........", "........", "...KK...", "..K..K..", "..K..K..", "........", "........", "........"],
  },
  {
    id: 5, moves: 22, kinds: FIVE, difficulty: "sredni", intro: "babel", goals: [goal.collect("humbak", 35)],
    board: ["........", "........", "........", "........", "...3....", "...3....", ".33.....", "........"],
  },
  {
    id: 6, moves: 22, kinds: FIVE, difficulty: "sredni", goals: [goal.notes(10)],
    board: ["........", "K......K", ".D....D.", "..K..K..", "...DD...", "..K..K..", "........", "........"],
  },
  {
    id: 7, moves: 20, kinds: FIVE, difficulty: "latwy", intro: "piskle", goals: [goal.collect("kozka", 30), goal.notes(6)],
    board: ["........", "........", "K.K..K.K", "........", "...44...", "...4....", "..K..K..", "........"],
  },
  {
    id: 8, moves: 22, kinds: FIVE, difficulty: "sredni", intro: "skrzynia", goals: [goal.crates(8)],
    board: ["........", "........", "........", "BS....SB", "........", "........", "BS....SB", "........"],
  },
  { id: 9, moves: 20, kinds: FIVE_B, difficulty: "latwy", goals: [goal.collect("storczyk", 45)], board: OPEN8 },
  {
    id: 10, moves: 25, kinds: FIVE, difficulty: "sredni", intro: "jajko", goals: [goal.eggs(2)],
    board: ["..J..J..", "........", "........", "........", "........", "........", "........", "GGGGGGGG"],
  },
  {
    id: 11, moves: 24, kinds: FIVE, difficulty: "sredni", goals: [goal.notes(12), goal.crates(4)],
    board: ["........", "KK....KK", "K..BB..K", "...BB...", "K......K", "KK....KK", "........", "........"],
  },
  { id: 12, moves: 20, kinds: FIVE, difficulty: "latwy", goals: [goal.collect("lisc", 50)], board: OPEN8 },
  {
    id: 13, moves: 22, kinds: FIVE, difficulty: "latwy", intro: "tasma", goals: [goal.collect("zloty", 35)],
    board: ["........", "........", ".t....t.", "..t..t..", "...tt...", "..t..t..", ".t....t.", "........"],
  },
  {
    id: 14, moves: 26, kinds: FIVE, difficulty: "sredni", goals: [goal.eggs(3), goal.notes(6)],
    board: [".J..J..J", "........", "K......K", ".K....K.", "..K..K..", "........", "........", "GGGGGGGG"],
  },
  {
    id: 15, moves: 28, kinds: FIVE, difficulty: "trudny", goals: [goal.notes(12), goal.eggs(2)],
    board: ["..J..J..", "........", "DD....DD", "D......D", "........", "D......D", "DD....DD", "GGGGGGGG"],
  },
  // ---------- Rozdział 2: Ogródek Sówki ----------
  {
    id: 16, moves: 22, kinds: FIVE_B, difficulty: "latwy", goals: [goal.collect("truskawka", 40), goal.collect("storczyk", 35)],
    board: ["#......#", "........", "........", "........", "........", "........", "........", "........", "#......#"],
  },
  {
    id: 17, moves: 24, kinds: FIVE, difficulty: "sredni", goals: [goal.crates(8)],
    board: ["........", "........", "..BSSB..", "........", "........", "..BSSB..", "........", "........", "........"],
  },
  {
    id: 18, moves: 24, kinds: FIVE_B, difficulty: "latwy", goals: [goal.eggs(3)],
    board: ["J..J..J.", "........", "........", "...##...", "...##...", "........", "........", "........", "GGGGGGGG"],
  },
  {
    id: 19, moves: 24, kinds: FIVE, difficulty: "sredni", intro: "kanister", goals: [goal.collect("humbak", 45)],
    board: ["........", "........", "........", "..C..C..", "........", "........", "..C..C..", "........", "........"],
  },
  {
    id: 20, moves: 24, kinds: FIVE, difficulty: "trudny", goals: [goal.notes(14), goal.collect("kozka", 30)],
    board: ["........", "K.K..K.K", ".K.KK.K.", "........", "........", ".K.KK.K.", "K.K..K.K", "........", "........"],
  },
  { id: 21, moves: 24, kinds: SIX, difficulty: "latwy", goals: [goal.collect("lisc", 35), goal.collect("zloty", 35)], board: OPEN9 },
  {
    id: 22, moves: 26, kinds: FIVE_B, difficulty: "sredni", goals: [goal.eggs(3), goal.crates(6)],
    board: ["J...J..J", "........", "........", "S.S..S.S", "........", ".S....S.", "........", "........", "GGGGGGGG"],
  },
  {
    id: 23, moves: 26, kinds: FIVE, difficulty: "sredni", goals: [goal.notes(12)],
    board: ["........", "........", "DDD..DDD", "........", "........", "DDD..DDD", "........", "........", "........"],
  },
  {
    id: 24, moves: 22, kinds: FIVE_B, difficulty: "latwy", goals: [goal.collect("storczyk", 50)],
    board: ["##....##", "#......#", "........", "........", "........", "........", "........", "#......#", "##....##"],
  },
  {
    id: 25, moves: 26, kinds: FIVE, difficulty: "sredni", intro: "telefon", goals: [goal.phones(2), goal.notes(6)],
    board: ["........", "........", "..K..K..", ".KT..TK.", "..K..K..", "........", "........", "........", "........"],
  },
  {
    id: 26, moves: 28, kinds: FIVE_C, difficulty: "sredni", goals: [goal.crates(12), goal.eggs(2)],
    board: ["..J..J..", "........", "BB....BB", "S......S", "........", "S......S", "BB....BB", "........", "GGGGGGGG"],
  },
  { id: 27, moves: 24, kinds: FIVE_B, difficulty: "latwy", goals: [goal.collect("truskawka", 50), goal.collect("humbak", 35)], board: OPEN9 },
  {
    id: 28, moves: 28, kinds: FIVE, difficulty: "latwy", goals: [goal.phones(3)],
    board: ["........", "........", "...T....", "........", "......T.", "........", ".T......", "........", "........"],
  },
  {
    id: 29, moves: 26, kinds: FIVE_C, difficulty: "sredni", goals: [goal.notes(12), goal.collect("kozka", 35)],
    board: ["........", "C......C", "KK.KK.KK", "........", "...CC...", "........", "KK.KK.KK", "C......C", "........"],
  },
  {
    id: 30, moves: 30, kinds: FIVE, difficulty: "trudny", goals: [goal.eggs(4), goal.phones(2)],
    board: ["J.J..J.J", "........", "........", "..T..T..", "........", "........", "........", "........", "GGGGGGGG"],
  },
  // ---------- Rozdział 3: Staw Humbaka ----------
  { id: 31, moves: 24, kinds: FIVE, difficulty: "latwy", goals: [goal.collect("humbak", 60)], board: OPEN9 },
  {
    id: 32, moves: 28, kinds: FIVE_B, difficulty: "sredni", goals: [goal.crates(14)],
    board: ["........", "B.B..B.B", "........", ".B.BB.B.", "........", "B.B..B.B", "........", "...BB...", "........"],
  },
  {
    id: 33, moves: 28, kinds: FIVE, difficulty: "sredni", goals: [goal.notes(16), goal.eggs(2)],
    board: ["...JJ...", "........", "KKK..KKK", "K......K", "........", "K......K", "KKK..KKK", "........", "GGGGGGGG"],
  },
  { id: 34, moves: 26, kinds: SIX, difficulty: "trudny", goals: [goal.collect("zloty", 40), goal.collect("kozka", 40)], board: OPEN9 },
  {
    id: 35, moves: 28, kinds: FIVE_C, difficulty: "latwy", goals: [goal.phones(3), goal.crates(4)],
    board: ["........", "........", ".T..B...", "....B.T.", "........", "..B.....", ".B...T..", "........", "........"],
  },
  {
    id: 36, moves: 28, kinds: FIVE_B, difficulty: "latwy", goals: [goal.eggs(4)],
    board: ["J.J..J.J", "........", "...##...", "........", "#......#", "........", "...##...", "........", "GGGGGGGG"],
  },
  {
    id: 37, moves: 30, kinds: FIVE, difficulty: "sredni", goals: [goal.notes(18)],
    board: ["........", "EEE..EEE", "........", "........", "DD.DD.DD", "........", "........", "KKK..KKK", "........"],
  },
  { id: 38, moves: 24, kinds: SIX, difficulty: "sredni", goals: [goal.collect("storczyk", 50)], board: OPEN9 },
  {
    id: 39, moves: 30, kinds: FIVE_C, difficulty: "trudny", goals: [goal.crates(16), goal.phones(2)],
    board: ["........", "SBBS.SBS", "........", "..T..T..", "........", "SBS.SBBS", "........", "SSSS.SSS", "........"],
  },
  {
    id: 40, moves: 30, kinds: FIVE, difficulty: "latwy", goals: [goal.eggs(3), goal.notes(12), goal.collect("lisc", 35)],
    board: ["J..J..J.", "........", "KK.KK.KK", "........", "........", "KK.KK.KK", "........", "........", "GGGGGGGG"],
  },
  { id: 41, moves: 24, kinds: FIVE, difficulty: "latwy", goals: [goal.collect("lisc", 70)], board: OPEN9 },
  {
    id: 42, moves: 28, kinds: FIVE_B, difficulty: "sredni", goals: [goal.collect("zloty", 50), goal.crates(6)],
    board: ["........", "t.t..t.t", ".S....S.", "..t..t..", "S......S", "..t..t..", ".S....S.", "t.t..t.t", "........"],
  },
  {
    id: 43, moves: 30, kinds: FIVE, difficulty: "latwy", goals: [goal.phones(4)],
    board: ["........", ".T....T.", "........", "........", "...##...", "........", "........", ".T....T.", "........"],
  },
  {
    id: 44, moves: 32, kinds: FIVE_C, difficulty: "sredni", goals: [goal.eggs(4), goal.crates(10)],
    board: ["J.J..J.J", "........", "S.S..S.S", "........", ".B....B.", "........", "S.S..S.S", "........", "GGGGGGGG"],
  },
  {
    id: 45, moves: 34, kinds: FIVE, difficulty: "trudny", goals: [goal.notes(12), goal.eggs(3), goal.phones(2)],
    board: ["J..J..J.", "........", "DDD..DDD", "..T..T..", "........", "DD....DD", "D......D", "........", "GGGGGGGG"],
  },
];

// Strojenie symulatorem (`node scripts/trojki-strojenie.mjs 60`, 2026-11-23): [ruchy, próg ★★, próg ★★★]; ★ — za
// wygraną. Ruchy = percentyl ruchów potrzebnych symulatorowi według trudności (łatwy 97%, średni 85%, trudniejszy
// 65%, najmniej 8); ★★ — mediana wyników wygranych, ★★★ — 85. percentyl. Ruchy w `LEVEL_LIST` to punkt wyjścia.
// prettier-ignore
const TUNING = {
  1: [8, 7300, 11900],
  2: [8, 9600, 11200],
  3: [8, 8800, 11400],
  4: [8, 6600, 8900],
  5: [13, 8300, 10400],
  6: [9, 5100, 6300],
  7: [17, 9700, 12200],
  8: [9, 5300, 7200],
  9: [16, 9400, 11700],
  10: [13, 7500, 9100],
  11: [10, 5700, 7800],
  12: [21, 12000, 14200],
  13: [15, 7500, 10000],
  14: [15, 10800, 13400],
  15: [14, 8800, 12400],
  16: [15, 9800, 12200],
  17: [8, 4700, 6200],
  18: [23, 12500, 15600],
  19: [14, 9500, 13400],
  20: [10, 7300, 9400],
  21: [26, 10300, 13400],
  22: [11, 8100, 11200],
  23: [11, 6600, 9100],
  24: [21, 12200, 14600],
  25: [8, 4900, 7000],
  26: [14, 9800, 11800],
  27: [18, 11600, 13600],
  28: [9, 5500, 7400],
  29: [13, 8300, 10700],
  30: [9, 8800, 10500],
  31: [21, 13900, 17500],
  32: [11, 7500, 9900],
  33: [13, 8400, 10600],
  34: [21, 9500, 11700],
  35: [11, 6600, 8700],
  36: [28, 16700, 19200],
  37: [15, 9800, 11900],
  38: [27, 11900, 14200],
  39: [8, 5700, 8000],
  40: [19, 12000, 15200],
  41: [22, 15800, 18700],
  42: [14, 10300, 12000],
  43: [11, 6000, 7900],
  44: [14, 10700, 13300],
  45: [15, 11700, 14400],
};

export const LEVELS = Object.freeze(
  LEVEL_LIST.map((level) => {
    const chapter = CHAPTERS.find((entry) => level.id >= entry.from && level.id <= entry.to).id;
    const [moves, two, three] = TUNING[level.id] || [level.moves, level.moves * 400, level.moves * 600];
    return Object.freeze({ ...level, chapter, moves, stars: [0, two, three] });
  }),
);

export const levelById = (id) => LEVELS.find((level) => level.id === Number(id)) || null;

const count = (level, chars) =>
  level.board
    .join("")
    .split("")
    .filter((char) => chars.includes(char)).length;

/**
 * Sprawdzenie poziomu (rozdz. 9.4): wymiary (8 kolumn, 8–9 rzędów), znane znaki, 1–3 cele, rodzaje 4–6 z rodzajami
 * celów, cele możliwe do zrobienia (karteczki, skrzynie, telefony, jajka i gniazda na planszy), najwyżej 4 rodzaje
 * elementów (przeszkody i cele), rosnące progi gwiazdek, plansza startowa bez trójek i z ruchem. → lista problemów
 */
export function validateLevel(level) {
  const problems = [];
  const fail = (text) => problems.push(`poziom ${level.id}: ${text}`);
  if (level.board.length < 8 || level.board.length > 9) fail("8–9 rzędów");
  if (level.board.some((line) => line.length !== 8)) fail("8 kolumn");
  if (!level.goals.length || level.goals.length > 3) fail("1–3 cele");
  if (level.kinds.length < 4 || level.kinds.length > 6) fail("4–6 rodzajów");
  if (level.moves < 8 || level.moves > 40) fail("ruchy 8–40");
  for (const item of level.goals) {
    if (!GOAL_TYPES.includes(item.type)) fail(`nieznany cel ${item.type}`);
    if (item.type === "collect" && !level.kinds.includes(item.kind)) fail(`rodzaj celu ${item.kind} poza planszą`);
    if (!(item.count > 0)) fail("liczba w celu");
  }
  const notes = count(level, "KDE");
  const crates = count(level, "SB");
  const phones = count(level, "T");
  const eggs = count(level, "J");
  const nests = level.board
    .at(-1)
    .split("")
    .filter((char) => char === "G").length;
  const want = (type) => level.goals.find((item) => item.type === type)?.count || 0;
  if (want("notes") > notes) fail(`karteczek ${notes} < ${want("notes")}`);
  if (want("crates") > crates) fail(`skrzyń ${crates} < ${want("crates")}`);
  if (want("phones") > phones) fail(`telefonów ${phones} < ${want("phones")}`);
  if (want("eggs") > eggs) fail(`jajek ${eggs} < ${want("eggs")}`);
  if (eggs && !nests) fail("jajka bez gniazd w dolnym rzędzie");
  if (level.board.slice(0, -1).some((line) => line.includes("G"))) fail("gniazdo tylko w dolnym rzędzie");
  const elements = new Set(
    level.goals.map((item) => item.type).filter((type) => type !== "collect" && type !== "score"),
  );
  if (count(level, "C")) elements.add("canister");
  if (count(level, "t")) elements.add("tape");
  if (elements.size > 4) fail("za dużo rodzajów elementów");
  if (!(level.stars[1] < level.stars[2])) fail("progi gwiazdek");
  try {
    const board = createBoard(level, { seed: `sprawdzenie:${level.id}` });
    if (findGroups(board).length) fail("gotowe trójki na starcie");
    if (!listMoves(board).length) fail("brak ruchu na starcie");
  } catch (error) {
    fail(String(error.message || error));
  }
  return problems;
}
