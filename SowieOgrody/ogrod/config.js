// Sowie Ogrody (nowa odsłona, Analiza 2 rozdz. 3.4; Analiza 3 E7) — wszystkie dane gry: rośliny, ulepszenia,
// rozdziały z celami, drzewko prestiżu, konewka, offline. Liczby dobrane symulatorem ekonomii
// (tests/unit/ogrody-ekonomia.test.mjs): pierwsze Wielkie Przesadzanie po ok. 2–3 h gry.

export const GAME_ID = "ogrody";
// Wersja stanu w dokumencie gry (`saveVersion`): 2 — dawny script.js, 3 — nowa odsłona (migracja w state.js).
export const SAVE_VERSION = 3;

// Rozdziały (zamiast suchych stref): każdy ma cele; wykonanie wszystkich odblokowuje następny rozdział.
// Cel: { id, text, kind, target, plant? } — rodzaje: plant (posiadane sztuki rośliny), upgrade (kupione
// ulepszenie), taps (stuknięcia w ogród), water (podlewania), lps (produkcja liści/s), runLeaves (liście
// w obecnym cyklu), prestige (liczba Wielkich Przesadzań).
export const CHAPTERS = Object.freeze([
  {
    id: "parapet",
    name: "Parapet",
    goals: [
      { id: "monstera5", text: "Kup 5 Monster", kind: "plant", plant: "monstera", target: 5 },
      { id: "taps30", text: "Zbierz liście 30 stuknięciami", kind: "taps", target: 30 },
      { id: "pilea1", text: "Kup Pileę", kind: "plant", plant: "pilea", target: 1 },
    ],
  },
  {
    id: "balkon",
    name: "Balkon",
    goals: [
      { id: "monstera25", text: "Kup 25 Monster", kind: "plant", plant: "monstera", target: 25 },
      { id: "konewka", text: "Kup konewkę sowy", kind: "upgrade", upgrade: "konewka", target: 1 },
      { id: "water3", text: "Podlej rośliny 3 razy", kind: "water", target: 3 },
      { id: "paproc5", text: "Kup 5 Paproci", kind: "plant", plant: "paproc", target: 5 },
    ],
  },
  {
    id: "dzialka",
    name: "Działka",
    goals: [
      { id: "alokazja10", text: "Kup 10 Alokazji", kind: "plant", plant: "alokazja", target: 10 },
      { id: "kaktus5", text: "Kup 5 Kaktusów", kind: "plant", plant: "kaktus", target: 5 },
      { id: "lps500", text: "Produkuj 500 liści na sekundę", kind: "lps", target: 500 },
    ],
  },
  {
    id: "basen",
    name: "Basen",
    goals: [
      { id: "slonecznik10", text: "Kup 10 Słoneczników", kind: "plant", plant: "slonecznik", target: 10 },
      { id: "storczyk5", text: "Kup 5 Storczyków", kind: "plant", plant: "storczyk", target: 5 },
      { id: "lps20k", text: "Produkuj 20 tys. liści na sekundę", kind: "lps", target: 20_000 },
    ],
  },
  {
    id: "szklarnia",
    name: "Szklarnia",
    goals: [
      { id: "lotos10", text: "Kup 10 Lotosów", kind: "plant", plant: "lotos", target: 10 },
      { id: "bonsai5", text: "Kup 5 Bonsai", kind: "plant", plant: "bonsai", target: 5 },
      { id: "mutant1", text: "Wyhoduj Mutanta monstery", kind: "plant", plant: "mutant", target: 1 },
      { id: "run10b", text: "Zbierz 10 mld liści w tym cyklu", kind: "runLeaves", target: 1e10 },
    ],
  },
  {
    id: "arboretum",
    name: "Arboretum",
    goals: [
      { id: "przesadzanie", text: "Zrób Wielkie Przesadzanie", kind: "prestige", target: 1 },
      { id: "drzewko5", text: "Wyhoduj 5 Drzewek złotych liści", kind: "plant", plant: "zloteDrzewko", target: 5 },
      { id: "przesadzanie3", text: "Zrób 3 Wielkie Przesadzania", kind: "prestige", target: 3 },
    ],
  },
]);

// Rośliny (generatory liści): cena `cost` × `growth`^posiadane, produkcja `prod` liści/s za sztukę. Kamienie
// milowe (MILESTONES) podwajają produkcję gatunku i zmieniają jego wygląd w ogrodzie.
export const PLANTS = Object.freeze([
  { id: "monstera", name: "Monstera", chapter: "parapet", cost: 15, prod: 0.2, growth: 1.13, color: "#3fae6a" },
  { id: "pilea", name: "Pilea", chapter: "parapet", cost: 140, prod: 1, growth: 1.134, color: "#72bd68" },
  { id: "paproc", name: "Paproć", chapter: "balkon", cost: 1_400, prod: 5, growth: 1.138, color: "#4b9e72" },
  { id: "alokazja", name: "Alokazja", chapter: "balkon", cost: 13_000, prod: 25, growth: 1.142, color: "#417b64" },
  { id: "kaktus", name: "Kaktus", chapter: "dzialka", cost: 120_000, prod: 120, growth: 1.146, color: "#5ba760" },
  { id: "slonecznik", name: "Słonecznik", chapter: "dzialka", cost: 1.2e6, prod: 620, growth: 1.15, color: "#f4c542" },
  { id: "storczyk", name: "Storczyk", chapter: "basen", cost: 1.1e7, prod: 3_100, growth: 1.154, color: "#d96faf" },
  { id: "lotos", name: "Lotos", chapter: "basen", cost: 1e8, prod: 16_000, growth: 1.158, color: "#ff9fb2" },
  { id: "bonsai", name: "Bonsai", chapter: "szklarnia", cost: 1.3e9, prod: 78_000, growth: 1.162, color: "#3f8b5b" },
  {
    id: "mutant",
    name: "Mutant monstery",
    chapter: "szklarnia",
    cost: 1.25e10,
    prod: 390_000,
    growth: 1.166,
    color: "#2e8b57",
  },
  {
    id: "zloteDrzewko",
    name: "Drzewko złotych liści",
    chapter: "arboretum",
    cost: 9e10,
    prod: 2e6,
    growth: 1.17,
    color: "#d99a1e",
  },
]);

// Kamienie milowe gatunku: przy tylu sztukach nowy wygląd w ogrodzie; `MILESTONE_BOOST` — mnożnik produkcji
// gatunku od danego progu (razem ×4 przy 100 sztukach).
export const MILESTONES = Object.freeze([10, 25, 50, 100]);
export const MILESTONE_BOOST = Object.freeze({ 25: 2, 100: 2 });

// Stuknięcie w ogród: `base` liści + `lpsShare` × produkcja/s (po ulepszeniach).
export const TAP = Object.freeze({ base: 1, lpsShare: 0 });

// Konewka sowy (od ulepszenia „konewka”): `charges` ładunków, ładunek co `regen` s; podlanie — produkcja
// × `multiplier` przez `duration` s.
export const WATER = Object.freeze({ charges: 3, regen: 60, multiplier: 2, duration: 45 });

// Postęp offline (gdy gra jest zamknięta albo w tle): `efficiency` produkcji, najwyżej `cap` s.
export const OFFLINE = Object.freeze({ efficiency: 0.5, cap: 4 * 3600, min: 60 });

// Zdarzenia aktywnej gry (Analiza 2, rozdz. 3.4; E7c) — czasy w s gry (nieobecność się nie liczy), `first` — pierwsze
// po tylu s, potem co `every` [od, do]; `chapter` — od którego rozdziału zdarzenie się pojawia.
// - pracu: dzwoniący telefon (produkcja × `penalty`, dopóki go nie odrzucisz; Tryb samolotowy — sam po `airplane` s);
// - truck: ciężarówka Amic zastawia gatunek (nie produkuje) — `taps` stuknięć ją przegania (Kozi kurier — 1);
// - goat: złota kózka widoczna `visible` s; Kozie szczęście skraca odstępy o `luck` za poziom; premie (GOAT_REWARDS):
//   `boost` (× `multiplier` na `duration` s), `instant` (tyle s produkcji), `frenzy` (`taps` zbiorów/s przez
//   `duration` s), `splash.reward` (Plusk-o-metr); każda złapana kózka dodaje też `splash.goat`, podlanie `splash.water`;
// - bay: Zatoka Humbaka (pełny Plusk-o-metr) — `duration` s, liść z fontanny (`fountain`, ułamki płótna) co `every` s,
//   prędkość w górę `speed` [od, do], na boki ± `spread`, grawitacja `gravity` (ułamki płótna/s); złapany liść =
//   `leafSeconds` s produkcji × (1 + `comboStep` × combo, combo do `comboMax`) × (1 + `echo` × Echo humbaka).
export const GARDEN_EVENTS = Object.freeze({
  pracu: { chapter: "balkon", first: 150, every: [120, 240], penalty: 0.7, airplane: 10 },
  truck: { chapter: "dzialka", first: 120, every: [180, 300], taps: 3 },
  goat: { first: 75, every: [60, 120], visible: 7, luck: 0.15 },
  boost: { duration: 30, multiplier: 3 },
  instant: 60,
  frenzy: { duration: 15, taps: 8 },
  splash: { water: 0.05, goat: 0.1, reward: 0.4 },
  bay: {
    duration: 20,
    every: 0.45,
    fountain: [0.5, 0.78],
    speed: [1, 1.35],
    spread: 0.18,
    gravity: 1.15,
    leafSeconds: 3,
    comboStep: 0.1,
    comboMax: 10,
    echo: 0.25,
  },
});

// Premie złotej kózki (losowane po równo); `text` — komunikat po złapaniu.
export const GOAT_REWARDS = Object.freeze([
  { id: "boost", text: "Złota kózka: produkcja ×3 przez 30 s!" },
  { id: "instant", text: "Złota kózka: liście z minuty produkcji!" },
  { id: "frenzy", text: "Kozi szał! Kózka zbiera liście przez 15 s" },
  { id: "splash", text: "Złota kózka: Plusk-o-metr +50%!" },
]);

// Ulepszenia (jednorazowe, na cykl): efekt `{ global?, tap?, tapLps?, chapter?: { id: mnożnik }, plant?: { id:
// mnożnik }, water?: { multiplier?, regen?, charges? }, autobuy?, airplane? }`.
export const UPGRADES = Object.freeze([
  {
    id: "rekawiczki",
    name: "Miękkie rękawiczki",
    chapter: "parapet",
    cost: 60,
    text: "Stuknięcia ×3.",
    effect: { tap: 3 },
  },
  {
    id: "ziemia",
    name: "Lepsza ziemia",
    chapter: "parapet",
    cost: 400,
    text: "Wszystkie rośliny ×1,5.",
    effect: { global: 1.5 },
  },
  {
    id: "konewka",
    name: "Konewka sowy",
    chapter: "balkon",
    cost: 1500,
    text: "Podlewanie: produkcja ×2 przez 45 s (3 ładunki).",
    effect: {},
  },
  {
    id: "koszyk",
    name: "Koszyk na liście",
    chapter: "balkon",
    cost: 6000,
    text: "Stuknięcie daje też 2% produkcji/s.",
    effect: { tapLps: 0.02 },
  },
  {
    id: "polki",
    name: "Półki balkonowe",
    chapter: "balkon",
    cost: 25_000,
    text: "Rośliny Parapetu i Balkonu ×2.",
    effect: { chapter: { parapet: 2, balkon: 2 } },
  },
  {
    id: "kompost",
    name: "Kompostownik",
    chapter: "dzialka",
    cost: 300_000,
    text: "Wszystkie rośliny ×1,5.",
    effect: { global: 1.5 },
  },
  {
    id: "zraszacz",
    name: "Zraszacz",
    chapter: "dzialka",
    cost: 800_000,
    text: "Podlewanie ×3 i ładunek co 40 s.",
    effect: { water: { multiplier: 3, regen: 40 } },
  },
  {
    id: "grzadki",
    name: "Wysokie grządki",
    chapter: "dzialka",
    cost: 2.5e6,
    text: "Rośliny Działki ×2.",
    effect: { chapter: { dzialka: 2 } },
  },
  {
    id: "samolot",
    name: "Tryb samolotowy",
    chapter: "dzialka",
    cost: 5e6,
    text: "Telefon Pracu Pracu milknie sam po 10 s.",
    effect: { airplane: 10 },
  },
  {
    id: "pompa",
    name: "Pompa basenowa",
    chapter: "basen",
    cost: 1e8,
    text: "Rośliny Basenu ×2.",
    effect: { chapter: { basen: 2 } },
  },
  {
    id: "nawozMonster",
    name: "Nawóz monster",
    chapter: "basen",
    cost: 4e7,
    text: "Monstera ×5.",
    effect: { plant: { monstera: 5 } },
  },
  {
    id: "kurier",
    name: "Kozi kurier",
    chapter: "basen",
    cost: 2e8,
    text: "Ciężarówka Amic odjeżdża po jednym stuknięciu.",
    effect: { courier: 1 },
  },
  {
    id: "lampy",
    name: "Lampy szklarniowe",
    chapter: "szklarnia",
    cost: 5e9,
    text: "Rośliny Szklarni ×2.",
    effect: { chapter: { szklarnia: 2 } },
  },
  {
    id: "nawoz",
    name: "Nawóz z kompostu",
    chapter: "szklarnia",
    cost: 1.5e10,
    text: "Wszystkie rośliny ×1,5.",
    effect: { global: 1.5 },
  },
  {
    id: "zakupy",
    name: "Sowa zakupowa",
    chapter: "szklarnia",
    cost: 3e10,
    text: "Sowa sama kupuje najopłacalniejsze rośliny.",
    effect: { autobuy: 1 },
  },
  {
    id: "rosa",
    name: "Poranna rosa",
    chapter: "arboretum",
    cost: 3e11,
    text: "Wszystkie rośliny ×3.",
    effect: { global: 3 },
  },
]);

// Wielkie Przesadzanie (prestiż): dostępne po ukończeniu rozdziału `after` i przy co najmniej `minRunLeaves`
// liści w obecnym cyklu (także przy kolejnych przesadzaniach); nasiona = floor(√(liście cyklu / `divisor`) ×
// (1 + Pamięć nasion)), najmniej `min`.
export const PRESTIGE = Object.freeze({ after: "szklarnia", minRunLeaves: 1e10, divisor: 1e9, min: 1 });

// Drzewko prestiżu: 3 gałęzie po 3 węzły; koszt poziomu = `cost` × 1,6^poziom (zaokrąglony w górę).
export const PRESTIGE_TREE = Object.freeze([
  {
    id: "korzenie",
    branch: "Korzenie",
    name: "Starożytne korzenie",
    cost: 1,
    max: 10,
    text: "+25% produkcji za poziom.",
  },
  {
    id: "szybkiStart",
    branch: "Korzenie",
    name: "Szybki parapet",
    cost: 3,
    max: 3,
    req: "korzenie",
    text: "Nowy cykl startuje z 25 Monsterami za poziom.",
  },
  {
    id: "pamiecNasion",
    branch: "Korzenie",
    name: "Pamięć nasion",
    cost: 5,
    max: 5,
    req: "szybkiStart",
    text: "+10% nasion za poziom.",
  },
  {
    id: "pamiecPlusku",
    branch: "Woda",
    name: "Pamięć plusku",
    cost: 1,
    max: 5,
    text: "Podlewanie trwa o 15 s dłużej za poziom.",
  },
  {
    id: "studnia",
    branch: "Woda",
    name: "Głęboka studnia",
    cost: 2,
    max: 3,
    req: "pamiecPlusku",
    text: "+1 ładunek konewki za poziom.",
  },
  {
    id: "echoHumbaka",
    branch: "Woda",
    name: "Echo humbaka",
    cost: 4,
    max: 5,
    req: "studnia",
    text: "Zatoka Humbaka daje +25% za poziom.",
  },
  { id: "senni", branch: "Sen", name: "Senni ogrodnicy", cost: 1, max: 5, text: "+10% postępu offline za poziom." },
  {
    id: "glebokiSen",
    branch: "Sen",
    name: "Głęboki sen",
    cost: 2,
    max: 4,
    req: "senni",
    text: "+2 h limitu offline za poziom.",
  },
  {
    id: "kozieSzczescie",
    branch: "Sen",
    name: "Kozie szczęście",
    cost: 4,
    max: 3,
    req: "glebokiSen",
    text: "Złote kózki przychodzą częściej.",
  },
]);
