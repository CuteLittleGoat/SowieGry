// Łącz i Hoduj (nowa Sowia Szklarnia; Analiza 2, rozdz. 3.5; Analiza 3, E8) — dane gry. Prototyp (krok 8.0):
// plansza 7 × 9 półek szklarni, jeden łańcuch — Monstera, Sowia doniczka i kompostownik.

// Identyfikator w bazie (stały — reguły Firestore) i wersja stanu nowej gry (dawna Szklarnia zapisuje wersję 1).
export const GAME_ID = "szklarnia";
export const SAVE_VERSION = 2;
// Podgląd zapisuje stan w osobnym polu dokumentu gry — pole `state` (wersja 1) zostaje dla dawnej Szklarni.
export const PREVIEW_FIELD = "preview";

// Plansza: kolumny × rzędy (pole na telefonie co najmniej 44 px).
export const BOARD = Object.freeze({ cols: 7, rows: 9 });

// Łańcuchy roślin: połączenie dwóch takich samych przedmiotów daje następny poziom; najwyższy już się nie łączy.
export const CHAINS = Object.freeze({
  monstera: Object.freeze({
    name: "Monstera",
    color: "#3fae6a",
    levels: Object.freeze(["Nasionko", "Kiełek", "Sadzonka", "Monstera", "Złota Monstera"]),
  }),
});

// Sowia doniczka: stuknięcie kładzie nasionko na losowym wolnym polu; ładunki (najwyżej `max`) wracają co `regen` s.
export const POT = Object.freeze({ max: 12, regen: 3, chain: "monstera" });

// Liście monstery: za połączenie — według poziomu wyniku; za kompost — według poziomu usuniętego przedmiotu.
export const MERGE_LEAVES = Object.freeze([0, 0, 1, 3, 8, 20]);
export const COMPOST_LEAVES = Object.freeze([0, 1, 2, 4, 10, 25]);

// Nowa gra: kilka przedmiotów na start (indeks pola, poziom), żeby od razu było co łączyć.
export const START_ITEMS = Object.freeze([
  [30, 1],
  [31, 1],
  [24, 1],
  [38, 2],
  [39, 2],
]);
