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

// Sowie sąsiadki (krok 8.1, E8b2): każda ma zawsze jedno zamówienie; `color` — chustka (ramka karty, główka sowy).
export const NEIGHBORS = Object.freeze([
  Object.freeze({ id: "puszczyk", name: "Pani Puszczykowa", color: "#a8784f" }),
  Object.freeze({ id: "plomykowka", name: "Płomykówka Pola", color: "#e7b45c" }),
  Object.freeze({ id: "pojdzka", name: "Pójdźka Pela", color: "#8f9bb8" }),
]);

// Zamówienia: najwyższy poziom rośnie co `levelEvery` wykonanych zamówień (od `startLevel` do 5, zakres 3 poziomów);
// poziomy do `pairUpTo` czasem po dwie sztuki; od `hybridFrom` zamówień czasem hybryda (gdy jej składniki są
// w doniczce). Nagroda: liście za sztukę (według poziomu) i gwiazdki odnowy za zamówienie (+1 za drugą sztukę).
export const ORDERS = Object.freeze({
  startLevel: 2,
  levelEvery: 3,
  pairUpTo: 3,
  pairChance: 0.35,
  hybridFrom: 8,
  hybridChance: 0.15,
  leaves: Object.freeze([0, 2, 4, 9, 20, 45]),
  stars: Object.freeze([0, 1, 1, 1, 2, 3]),
  hybridLeaves: 90,
  hybridStars: 4,
});

// Pomieszczenia szklarni (krok 8.1, E8b3; nazwy i ikony z dawnej Sowiej Szklarni — Płotek Antykozi zmienia się
// w Kozi Zakątek, bo kozy są teraz pomocnicami): odnawiane po kolei, etap po etapie, za gwiazdki odnowy (`cost` za
// etap). Odnowione pomieszczenie daje ułatwienie (`perk` — opis dla gracza; działanie w `game.js`, `PERKS`).
const room = (id, icon, name, cost, steps, perk) =>
  Object.freeze({ id, icon, name, cost, steps: Object.freeze(steps), perk });
export const ROOMS = Object.freeze([
  room(
    "potting",
    "🪴",
    "Doniczarnia",
    1,
    ["Zamieść podłogę", "Umyj szyby", "Ustaw stół do sadzenia"],
    "Sowia doniczka mieści 2 ładunki więcej",
  ),
  room("grow", "🌿", "Sala Upraw", 2, ["Napraw półki", "Zawieś lampy", "Rozłóż maty"], "Doniczka ładuje się co 2,5 s"),
  room(
    "water",
    "💧",
    "Zraszalnia",
    2,
    ["Podłącz wodę", "Zamontuj zraszacze", "Postaw beczkę na deszczówkę", "Wymaluj kafelki"],
    "Niektóre nasionka z doniczki od razu kiełkują",
  ),
  room(
    "seedling",
    "🌱",
    "Sadzonkarnia",
    3,
    ["Ustaw skrzynki", "Wsyp świeżą ziemię", "Podpisz tabliczki", "Rozwieś girlandę"],
    "Doniczka ładuje się co 2 s",
  ),
  room(
    "compost",
    "🪱",
    "Kompostownia",
    3,
    ["Zbuduj skrzynię", "Zaproś dżdżownice", "Ustaw łopatki", "Posadź nasturcje"],
    "Kompost daje 2 razy więcej liści",
  ),
  room(
    "cross",
    "🧬",
    "Krzyżówkarium",
    3,
    ["Wstaw stół do krzyżowania", "Ustaw lupy", "Powieś mapę hybryd", "Zamontuj termometr", "Postaw złotą doniczkę"],
    "Hybrydy dają o połowę więcej liści",
  ),
  room(
    "goats",
    "🐐",
    "Kozi Zakątek",
    4,
    ["Postaw płotek z kokardką", "Wnieś siano", "Ustaw poidełko", "Zawieś dzwoneczki", "Zbuduj kozi domek"],
    "Kózki pomagają: nasionko z doniczki ląduje obok takiego samego",
  ),
  room(
    "pollen",
    "🔬",
    "Laboratorium Pyłku",
    4,
    ["Ustaw mikroskop", "Umyj pędzelki", "Ustaw słoiczki na pyłek", "Zawieś lampę", "Zamontuj wentylator"],
    "Zamówienia roślin 4. i 5. poziomu oraz hybryd: +1 gwiazdka",
  ),
  room(
    "nap",
    "🌙",
    "Kącik Drzemki",
    4,
    [
      "Rozłóż poduszki",
      "Zawieś hamak",
      "Postaw lampkę",
      "Przyklej gwiazdki na sufit",
      "Ustaw półkę z książkami",
      "Przynieś kocyk",
    ],
    "Doniczka ładuje się też, gdy gra jest zamknięta",
  ),
  room(
    "command",
    "🦉",
    "Sowie Centrum",
    5,
    [
      "Ustaw biurko",
      "Podłącz tablicę",
      "Zawieś mapę szklarni",
      "Postaw globus",
      "Ustaw lunetę",
      "Powieś portret Sówki",
    ],
    "Zamówienia dają o połowę więcej liści",
  ),
]);

// Liczby ułatwień z odnowionych pomieszczeń.
export const PERKS = Object.freeze({
  potBonus: 2,
  regenGrow: 2.5,
  regenSeedling: 2,
  sproutChance: 0.15,
  compostFactor: 2,
  hybridFactor: 1.5,
  pollenStars: 1,
  commandFactor: 1.5,
});

// Przeszkody (krok 8.2, E8c1). Pracu Pracu: telefon pojawia się po `phoneFrom` zamówieniach i potem co `phoneEvery`
// zamówień (gdy go nie ma); co `ringEvery` ruchów dzwoni i przykleja karteczkę na pole w promieniu `reach` (najpierw
// pola z roślinami); karteczka znika po połączeniu obok albo po `noteTaps` stuknięciach; telefon — po `phoneHits`
// połączeniach obok. Amic: od `crateFrom` zamówień doniczka z szansą `crateChance` kładzie skrzynię (najwyżej
// `maxCrates` naraz); `crateHits` połączeń obok ją otwiera — w środku kózka (E8c2), liście i gwiazdki. Od
// `canisterFrom` zamówień i potem co `canisterEvery` (gdy go nie ma) Amic stawia kanister — nieruchomy, usuwa go tylko
// Kózka Taran.
export const OBSTACLES = Object.freeze({
  phoneFrom: 4,
  phoneEvery: 4,
  ringEvery: 10,
  reach: 2,
  noteTaps: 3,
  phoneHits: 2,
  crateFrom: 3,
  crateChance: 0.06,
  maxCrates: 2,
  crateHits: 2,
  crateLeaves: 5,
  crateStars: 1,
  canisterFrom: 8,
  canisterEvery: 6,
});

// Kózki-wzmacniacze (krok 8.2, E8c2): przedmioty na planszy `{ goat }`. `use` — "tap" (stuknięcie uruchamia moc)
// albo "drag" (przeciągnięcie na roślinę lub przeszkodę); `color` — chustka; `weight` — szansa przy losowaniu.
export const GOATS = Object.freeze({
  skoczek: Object.freeze({
    name: "Kózka Skoczek",
    color: "#4d9de0",
    use: "tap",
    weight: 3,
    text: "skacze po półkach i łączy do 3 par takich samych roślin",
  }),
  zjadaczka: Object.freeze({
    name: "Kózka Zjadaczka",
    color: "#ff9d4d",
    use: "tap",
    weight: 2,
    text: "zjada karteczki Pracu w swoim rzędzie i kolumnie",
  }),
  dzoker: Object.freeze({
    name: "Kózka Dżoker",
    color: "#9b6ddb",
    use: "drag",
    weight: 3,
    text: "pasuje do każdej rośliny — połącz ją z dowolną, a roślina urośnie",
  }),
  sprezynka: Object.freeze({
    name: "Kózka Sprężynka",
    color: "#f4c542",
    use: "tap",
    weight: 2,
    text: "podskakuje i podnosi o 1 poziom rośliny wokół siebie",
  }),
  taran: Object.freeze({
    name: "Kózka Taran",
    color: "#d9303e",
    use: "drag",
    weight: 1,
    text: "przeciągnij ją na przeszkodę — usuwa kanister Amic, skrzynię, telefon albo karteczkę",
  }),
});

// Kózki z zamówień: po zamówieniu, gdy `stats.orders % orderEvery === orderAt` (2., 6., 10.…); Skoczek łączy najwyżej
// `jumpPairs` par.
export const GOAT_RULES = Object.freeze({ orderEvery: 4, orderAt: 2, jumpPairs: 3 });

// Dźwięk (uwaga właściciela L1): efekty wczytywane po pierwszym dotknięciu (tylko używane) i motyw szklarni.
export const GAME_SOUNDS = Object.freeze([
  "klik",
  "ladowanie",
  "polaczenie",
  "lisc",
  "rekord",
  "slizg",
  "dzwonek",
  "trafienie-pracu",
  "trafienie-amic",
  "zakup",
  "koza-meee",
  "powerup-start",
]);
export const GREENHOUSE_MUSIC = "szklarnia";

// Nowa gra: kilka przedmiotów na start (indeks pola, poziom), żeby od razu było co łączyć.
export const START_ITEMS = Object.freeze([
  [30, 1],
  [31, 1],
  [24, 1],
  [38, 2],
  [39, 2],
]);
