// Sowie Trójki — stałe gry (Analiza 5): identyfikator, rodzaje kafelków (kształt i kolor tła, obrazek, nazwy),
// moce, przeszkody, punkty, Radość Sówki i czasy animacji. Identyfikatory rodzajów, mocy i przeszkód są na zawsze
// (zapis gry i poziomy) — nowe tylko dopisujemy.
import { COLORS } from "../shared/world/tokens.js";

export const GAME_ID = "trojki";
export const SAVE_VERSION = 1;
// Plansza ma zawsze 8 kolumn; rzędów 8 albo 9 (zależnie od poziomu).
export const COLS = 8;
export const MAX_ROWS = 9;

// Sześć rodzajów kafelków — każdy z innym kształtem i kolorem tła (Analiza 5, rozdz. 5.1).
export const KINDS = Object.freeze(["lisc", "zloty", "humbak", "kozka", "truskawka", "storczyk"]);

// forms — liczba pojedyncza (biernik po „Zbierz…”), mnoga 2–4, mnoga 5+ (dopełniacz): „Zbierz 20 truskawek”.
export const KIND_INFO = Object.freeze({
  lisc: {
    name: "Liść Monstery",
    forms: ["Liść Monstery", "Liście Monstery", "Liści Monstery"],
    shape: "square",
    color: COLORS.zloto,
    sprite: "lisc-zielony",
  },
  zloty: {
    name: "Złoty liść",
    forms: ["złoty liść", "złote liście", "złotych liści"],
    shape: "circle",
    color: COLORS.niebieski,
    sprite: "lisc-zloty",
  },
  humbak: {
    name: "Humbak",
    forms: ["humbaka", "humbaki", "humbaków"],
    shape: "heart",
    color: COLORS.policzki,
    sprite: "trojki-humbak",
  },
  kozka: {
    name: "Kózka",
    forms: ["kózkę", "kózki", "kózek"],
    shape: "star",
    color: COLORS.fiolet,
    sprite: "trojki-kozka",
  },
  truskawka: {
    name: "Truskawka",
    forms: ["truskawkę", "truskawki", "truskawek"],
    shape: "hexagon",
    color: COLORS.monstera,
    sprite: "trojki-truskawka",
  },
  storczyk: {
    name: "Storczyk",
    forms: ["storczyk", "storczyki", "storczyków"],
    shape: "diamond",
    color: COLORS.pomaranczowy,
    sprite: "trojki-storczyk",
  },
});

// Moce (Analiza 5, rozdz. 6.5): Pióro (4 w linii; kierunek jak linia), Pisklę (kwadrat 2 × 2), Bąbel (L, T, +),
// Tęczowy liść (5 w linii).
export const SPECIALS = Object.freeze(["pioro", "piskle", "babel", "teczowy"]);
export const SPECIAL_INFO = Object.freeze({
  pioro: { name: "Pióro", points: 60, joy: 5 },
  piskle: { name: "Pisklę", points: 60, joy: 5 },
  babel: { name: "Bąbel", points: 120, joy: 5 },
  teczowy: { name: "Tęczowy liść", points: 200, joy: 5 },
});

// Przeszkody (rozdz. 7.1): karteczka Pracu i skrzynia Amic — 1–3 warstwy; kanister Amic — tylko moce; telefon Pracu
// — 2 trafienia; taśma Amic — na kafelku (kafelek się nie rusza).
export const BLOCKS = Object.freeze(["note", "crate", "canister", "phone"]);
export const BLOCK_INFO = Object.freeze({
  note: { name: "karteczka Pracu", forms: ["karteczkę Pracu", "karteczki Pracu", "karteczek Pracu"], maxLayers: 3 },
  crate: { name: "skrzynia Amic", forms: ["skrzynię Amic", "skrzynie Amic", "skrzyń Amic"], maxLayers: 3 },
  canister: { name: "kanister Amic", forms: ["kanister Amic", "kanistry Amic", "kanistrów Amic"], maxLayers: 1 },
  phone: { name: "telefon Pracu", forms: ["telefon Pracu", "telefony Pracu", "telefonów Pracu"], maxLayers: 2 },
});

// Cele poziomu (rozdz. 7.2).
export const GOAL_TYPES = Object.freeze(["score", "collect", "notes", "crates", "phones", "eggs"]);
export const GOAL_VERBS = Object.freeze({
  score: "Zdobądź",
  collect: "Zbierz",
  notes: "Zerwij",
  crates: "Rozbij",
  phones: "Wyłącz",
  eggs: "Sprowadź",
});
export const EGG_FORMS = Object.freeze(["jajko", "jajka", "jajek"]);

// Punkty (rozdz. 6.4).
export const POINTS = Object.freeze({
  tile: 20, // × numer kaskady przy dopasowaniu; zbity mocą — 20
  layer: 50, // warstwa przeszkody
  egg: 500, // jajko w gnieździe
  finaleMove: 100, // każdy ruch zamieniony w Humbaczym Finale
});

// Radość Sówki (rozdz. 8.4): +1 za kafelek × numer kaskady, +5 za powstałą moc, +8 za odpaloną moc, +12 za
// połączenie dwóch mocy; pełna = 100 → Sowia pomoc (3 Pióra, bez zabierania ruchu).
export const JOY = Object.freeze({ max: 100, tile: 1, created: 5, fired: 8, combo: 12, helpFeathers: 3 });

// Bezpiecznik kaskad (rozdz. 14.3) i liczba prób mieszania.
export const MAX_WAVES = 50;
export const SHUFFLE_TRIES = 50;

// Prezent od Sówki (rozdz. 6.9): raz na podejście, gdy cel zrobiony co najmniej w 75%; Tryb Przytulny — +5 ruchów.
export const GIFT = Object.freeze({ moves: 3, share: 0.75, cozyMoves: 5 });

// Teksty combo nad planszą (rozdz. 6.3): ×2 … ×6+.
export const COMBO_WORDS = Object.freeze(["", "", "Ładnie!", "Super!", "Ekstra!", "Sowiście!", "Hu-hu-hura!"]);
export const comboWord = (count) => COMBO_WORDS[Math.min(COMBO_WORDS.length - 1, count)] || "";

/** Polska liczba mnoga: 1 → forms[0], 2–4 (bez 12–14) → forms[1], inaczej forms[2]. */
export function plural(count, forms) {
  const n = Math.abs(Math.floor(Number(count) || 0));
  if (n === 1) return forms[0];
  const tens = n % 100;
  const units = n % 10;
  if (units >= 2 && units <= 4 && (tens < 12 || tens > 14)) return forms[1];
  return forms[2];
}

const formatPl = (value) => new Intl.NumberFormat("pl-PL").format(Math.floor(Number(value) || 0));

/** Opis celu słowami: „Zbierz 20 truskawek”, „Zerwij 6 karteczek Pracu”, „Zdobądź 1 500 punktów”. */
export function goalText(goal) {
  const count = goal.count;
  if (goal.type === "score") return `Zdobądź ${formatPl(count)} punktów`;
  if (goal.type === "collect") return `Zbierz ${count} ${plural(count, KIND_INFO[goal.kind]?.forms || ["", "", ""])}`;
  if (goal.type === "eggs") return `Sprowadź ${count} ${plural(count, EGG_FORMS)} do gniazda`;
  const block = { notes: "note", crates: "crate", phones: "phone" }[goal.type];
  return `${GOAL_VERBS[goal.type]} ${count} ${plural(count, BLOCK_INFO[block].forms)}`;
}
