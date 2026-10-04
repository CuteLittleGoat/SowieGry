// Łącz i Hoduj (nowa Sowia Szklarnia; Analiza 2, rozdz. 3.5; Analiza 3, E8) — dane gry. Prototyp (krok 8.0):
// plansza 7 × 9 półek szklarni, Sowia doniczka i kompostownik; krok 8.1 (E8b1): cztery łańcuchy roślin
// odblokowywane w doniczce i hybrydy z dawnej Szklarni.

// Identyfikator w bazie (stały — reguły Firestore) i wersja stanu nowej gry (dawna Szklarnia zapisuje wersję 1).
export const GAME_ID = "szklarnia";
export const SAVE_VERSION = 2;
// Podgląd zapisuje stan w osobnym polu dokumentu gry — pole `state` (wersja 1) zostaje dla dawnej Szklarni.
export const PREVIEW_FIELD = "preview";

// Plansza: kolumny × rzędy (pole na telefonie co najmniej 44 px).
export const BOARD = Object.freeze({ cols: 7, rows: 9 });

// Łańcuchy roślin: połączenie dwóch takich samych przedmiotów daje następny poziom; najwyższy już się nie łączy
// z takim samym. Hybrydy (`hybrid: true`, jeden poziom) powstają z dwóch różnych roślin najwyższego poziomu
// (`HYBRIDS`) — rośliny i hybrydy z dawnej Sowiej Szklarni (Monstera Miziasta, Pilea Pieniążek, Paproć Puchata,
// Kaktus Pracu; Monpilea Przytulna, Alopaproć Wachlarzowa, Złotolistka).
export const CHAINS = Object.freeze({
  monstera: Object.freeze({
    name: "Monstera",
    color: "#3fae6a",
    levels: Object.freeze(["Nasionko", "Kiełek", "Sadzonka", "Monstera", "Złota Monstera"]),
  }),
  pilea: Object.freeze({
    name: "Pilea",
    color: "#72bd68",
    levels: Object.freeze(["Ziarenko pilei", "Listek pilei", "Pieniążek", "Pilea", "Złota Pilea"]),
  }),
  paproc: Object.freeze({
    name: "Paproć",
    color: "#4b9e72",
    levels: Object.freeze(["Zarodnik", "Pastorał", "Młoda paproć", "Paproć", "Złota Paproć"]),
  }),
  kaktus: Object.freeze({
    name: "Kaktus",
    color: "#5ba760",
    levels: Object.freeze(["Pestka kaktusa", "Kuleczka", "Kaktusik", "Kaktus", "Kwitnący Kaktus"]),
  }),
  monpilea: Object.freeze({
    name: "Monpilea",
    color: "#68c582",
    hybrid: true,
    levels: Object.freeze(["Monpilea Przytulna"]),
  }),
  alopaproc: Object.freeze({
    name: "Alopaproć",
    color: "#3fa976",
    hybrid: true,
    levels: Object.freeze(["Alopaproć Wachlarzowa"]),
  }),
  zlotolistka: Object.freeze({
    name: "Złotolistka",
    color: "#caa34a",
    hybrid: true,
    levels: Object.freeze(["Złotolistka"]),
  }),
});

// Hybrydy: para (dowolna kolejność) → hybryda; liście za skrzyżowanie i za kompost hybrydy.
export const HYBRIDS = Object.freeze({
  monpilea: Object.freeze({ parents: Object.freeze(["monstera", "pilea"]), leaves: 60, compost: 50 }),
  alopaproc: Object.freeze({ parents: Object.freeze(["paproc", "kaktus"]), leaves: 60, compost: 50 }),
  zlotolistka: Object.freeze({ parents: Object.freeze(["monpilea", "alopaproc"]), leaves: 200, compost: 150 }),
});

// Sowia doniczka: stuknięcie kładzie nasionko na losowym wolnym polu; ładunki (najwyżej `max`) wracają co `regen` s.
// `chain` — łańcuch startowy; `chains` — łańcuchy doniczki z wagą losowania i liczbą połączeń, od której wchodzą.
export const POT = Object.freeze({
  max: 12,
  regen: 3,
  chain: "monstera",
  chains: Object.freeze([
    Object.freeze({ chain: "monstera", weight: 4, unlock: 0 }),
    Object.freeze({ chain: "pilea", weight: 3, unlock: 10 }),
    Object.freeze({ chain: "paproc", weight: 2, unlock: 30 }),
    Object.freeze({ chain: "kaktus", weight: 2, unlock: 60 }),
  ]),
});

// Liście monstery: za połączenie — według poziomu wyniku; za kompost — według poziomu usuniętego przedmiotu.
export const MERGE_LEAVES = Object.freeze([0, 0, 1, 3, 8, 20]);
export const COMPOST_LEAVES = Object.freeze([0, 1, 2, 4, 10, 25]);

// Dźwięk (uwaga właściciela L1): efekty wczytywane po pierwszym dotknięciu (tylko używane) i motyw szklarni.
export const GAME_SOUNDS = Object.freeze(["klik", "ladowanie", "polaczenie", "lisc", "rekord", "slizg"]);
export const GREENHOUSE_MUSIC = "szklarnia";

// Nowa gra: kilka przedmiotów na start (indeks pola, poziom), żeby od razu było co łączyć.
export const START_ITEMS = Object.freeze([
  [30, 1],
  [31, 1],
  [24, 1],
  [38, 2],
  [39, 2],
]);
