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
  // Rozdziały 7–14 (uwaga O3, 2026-11-01: „dużo plansz”) — dopisane na końcu, identyfikatory na zawsze.
  {
    id: "palmiarnia",
    name: "Palmiarnia",
    goals: [
      { id: "palma10", text: "Kup 10 Palm", kind: "plant", plant: "palma", target: 10 },
      { id: "strelicja5", text: "Kup 5 Strelicji", kind: "plant", plant: "strelicja", target: 5 },
      { id: "kopula", text: "Kup Szklaną kopułę", kind: "upgrade", upgrade: "kopula", target: 1 },
    ],
  },
  {
    id: "dzungla",
    name: "Dżungla",
    goals: [
      { id: "bambus10", text: "Kup 10 Bambusów", kind: "plant", plant: "bambus", target: 10 },
      { id: "dzbanecznik5", text: "Kup 5 Dzbaneczników", kind: "plant", plant: "dzbanecznik", target: 5 },
      { id: "lpsdzungla", text: "Produkuj 10 bln liści na sekundę", kind: "lps", target: 1e13 },
    ],
  },
  {
    id: "japonski",
    name: "Ogród japoński",
    goals: [
      { id: "sakura10", text: "Kup 10 Wiśni sakura", kind: "plant", plant: "sakura", target: 10 },
      { id: "klon5", text: "Kup 5 Klonów japońskich", kind: "plant", plant: "klon", target: 5 },
      { id: "latarnia", text: "Kup Kamienną latarnię", kind: "upgrade", upgrade: "latarnia", target: 1 },
    ],
  },
  {
    id: "oaza",
    name: "Pustynna oaza",
    goals: [
      { id: "agawa10", text: "Kup 10 Agaw", kind: "plant", plant: "agawa", target: 10 },
      { id: "daktylowiec5", text: "Kup 5 Daktylowców", kind: "plant", plant: "daktylowiec", target: 5 },
      { id: "przesadzanie6", text: "Zrób 6 Wielkich Przesadzań", kind: "prestige", target: 6 },
    ],
  },
  {
    id: "zimowy",
    name: "Ogród zimowy",
    goals: [
      { id: "ciemiernik10", text: "Kup 10 Ciemierników", kind: "plant", plant: "ciemiernik", target: 10 },
      { id: "ostrokrzew5", text: "Kup 5 Ostrokrzewów", kind: "plant", plant: "ostrokrzew", target: 5 },
      { id: "grzejnik", text: "Kup Grzejnik szklarniowy", kind: "upgrade", upgrade: "grzejnik", target: 1 },
    ],
  },
  {
    id: "wodny",
    name: "Wodny ogród",
    goals: [
      { id: "grzybienie10", text: "Kup 10 Grzybieni", kind: "plant", plant: "grzybienie", target: 10 },
      { id: "wiktoria5", text: "Kup 5 Wiktorii królewskich", kind: "plant", plant: "wiktoria", target: 5 },
      { id: "przesadzanie10", text: "Zrób 10 Wielkich Przesadzań", kind: "prestige", target: 10 },
    ],
  },
  {
    id: "dach",
    name: "Ogród na dachu",
    goals: [
      { id: "lawenda10", text: "Kup 10 Lawend", kind: "plant", plant: "lawenda", target: 10 },
      { id: "figowiec5", text: "Kup 5 Figowców", kind: "plant", plant: "figowiec", target: 5 },
      { id: "panele", text: "Kup Panele słoneczne", kind: "upgrade", upgrade: "panele", target: 1 },
    ],
  },
  {
    id: "ksiezycowy",
    name: "Księżycowy ogród",
    goals: [
      { id: "ksiezycowa10", text: "Kup 10 Księżycowych monster", kind: "plant", plant: "ksiezycowa", target: 10 },
      { id: "gwiezdny5", text: "Kup 5 Gwiezdnych kwiatów", kind: "plant", plant: "gwiezdny", target: 5 },
      { id: "przesadzanie15", text: "Zrób 15 Wielkich Przesadzań", kind: "prestige", target: 15 },
    ],
  },
]);

// Rośliny (generatory liści): cena `cost` × `growth`^posiadane, produkcja `prod` liści/s za sztukę. Kamienie
// milowe (MILESTONES) podwajają produkcję gatunku i zmieniają jego wygląd w ogrodzie.
const PLANT_LIST = Object.freeze([
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
  // Rośliny rozdziałów 7–14 (uwaga O2): `shape` — kształt w ogrodzie (decor.js), `accent` — drugi kolor.
  {
    id: "palma",
    name: "Palma",
    chapter: "palmiarnia",
    cost: 2.7e11,
    prod: 5e6,
    growth: 1.17,
    color: "#3c9a5c",
    accent: "#8b5a2b",
    shape: "palm",
  },
  {
    id: "strelicja",
    name: "Strelicja",
    chapter: "palmiarnia",
    cost: 2.97e12,
    prod: 2.5e7,
    growth: 1.17,
    color: "#3f8b5b",
    accent: "#ff8c2e",
    shape: "bird",
  },
  {
    id: "bambus",
    name: "Bambus",
    chapter: "dzungla",
    cost: 3.27e13,
    prod: 1.25e8,
    growth: 1.17,
    color: "#7cc35a",
    accent: "#5a9a3a",
    shape: "stalks",
  },
  {
    id: "dzbanecznik",
    name: "Dzbanecznik",
    chapter: "dzungla",
    cost: 3.59e14,
    prod: 6.25e8,
    growth: 1.17,
    color: "#5ba760",
    accent: "#c0392b",
    shape: "pitcher",
  },
  {
    id: "sakura",
    name: "Wiśnia sakura",
    chapter: "japonski",
    cost: 3.95e15,
    prod: 3.12e9,
    growth: 1.17,
    color: "#ffb7cf",
    accent: "#8b5a2b",
    shape: "tree",
  },
  {
    id: "klon",
    name: "Klon japoński",
    chapter: "japonski",
    cost: 4.35e16,
    prod: 1.56e10,
    growth: 1.17,
    color: "#d9433f",
    accent: "#7a4b2a",
    shape: "tree",
  },
  {
    id: "agawa",
    name: "Agawa",
    chapter: "oaza",
    cost: 4.78e17,
    prod: 7.81e10,
    growth: 1.17,
    color: "#6fa89a",
    accent: "#e8d36a",
    shape: "rosette",
  },
  {
    id: "daktylowiec",
    name: "Daktylowiec",
    chapter: "oaza",
    cost: 5.26e18,
    prod: 3.91e11,
    growth: 1.17,
    color: "#4f8a3c",
    accent: "#c98a3a",
    shape: "palm",
  },
  {
    id: "ciemiernik",
    name: "Ciemiernik",
    chapter: "zimowy",
    cost: 5.79e19,
    prod: 1.95e12,
    growth: 1.17,
    color: "#2e6b4a",
    accent: "#fffaf2",
    shape: "flower",
  },
  {
    id: "ostrokrzew",
    name: "Ostrokrzew",
    chapter: "zimowy",
    cost: 6.37e20,
    prod: 9.77e12,
    growth: 1.17,
    color: "#1f6b45",
    accent: "#e8303e",
    shape: "tree",
  },
  {
    id: "grzybienie",
    name: "Grzybienie",
    chapter: "wodny",
    cost: 6.37e21,
    prod: 4.88e13,
    growth: 1.17,
    color: "#3fae6a",
    accent: "#ffb7cf",
    shape: "pad",
  },
  {
    id: "wiktoria",
    name: "Wiktoria królewska",
    chapter: "wodny",
    cost: 6.37e22,
    prod: 2.44e14,
    growth: 1.17,
    color: "#2e8b57",
    accent: "#fffaf2",
    shape: "pad",
  },
  {
    id: "lawenda",
    name: "Lawenda",
    chapter: "dach",
    cost: 5.73e23,
    prod: 1.22e15,
    growth: 1.17,
    color: "#7f6fd1",
    accent: "#5a9a3a",
    shape: "stalks",
  },
  {
    id: "figowiec",
    name: "Figowiec",
    chapter: "dach",
    cost: 5.16e24,
    prod: 6.1e15,
    growth: 1.17,
    color: "#3f8b5b",
    accent: "#7a3f8a",
    shape: "fig",
  },
  {
    id: "ksiezycowa",
    name: "Księżycowa monstera",
    chapter: "ksiezycowy",
    cost: 4.64e25,
    prod: 3.05e16,
    growth: 1.17,
    color: "#9fe3ff",
    accent: "#e9ffd8",
    shape: "glow",
  },
  {
    id: "gwiezdny",
    name: "Gwiezdny kwiat",
    chapter: "ksiezycowy",
    cost: 4.18e26,
    prod: 1.53e17,
    growth: 1.17,
    color: "#ffe27a",
    accent: "#b9a6ff",
    shape: "star",
  },
]);

export const PLANTS = PLANT_LIST;

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

// Dźwięki (E7d1): efekty z assets/audio/audio.json wczytywane po pierwszym dotknięciu; muzyka — motyw „ogrod”,
// w Zatoce Humbaka pieśń „humbak”.
export const GAME_SOUNDS = Object.freeze([
  "lisc",
  "lisc-zloty",
  "zakup",
  "hu-hu",
  "rekord",
  "humbak-plusk",
  "dzwonek",
  "klik",
  "trafienie-amic",
  "zycie",
  "koza-meee",
  "powerup-start",
  "powerup-koniec",
  "bonus-start",
]);
export const GARDEN_MUSIC = "ogrod";
export const BAY_MUSIC = "humbak";

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
// mnożnik }, water?: { multiplier?, regen?, charges? }, offline? (s dłuższego limitu offline), autobuy?, airplane? }`.
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
  // Ulepszenia rozdziałów 7–14 (uwaga O6).
  {
    id: "kopula",
    name: "Szklana kopuła",
    chapter: "palmiarnia",
    cost: 1.35e11,
    text: "Rośliny Palmiarni ×2.",
    effect: { chapter: { palmiarnia: 2 } },
  },
  {
    id: "parnik",
    name: "Ciepła para",
    chapter: "palmiarnia",
    cost: 1.08e12,
    text: "Wszystkie rośliny ×1,5.",
    effect: { global: 1.5 },
  },
  {
    id: "mgielka",
    name: "Mgiełka",
    chapter: "palmiarnia",
    cost: 2.43e12,
    text: "Podlewanie ×4 i ładunek co 30 s.",
    effect: { water: { multiplier: 4, regen: 30 } },
  },
  {
    id: "liany",
    name: "Liany",
    chapter: "dzungla",
    cost: 1.63e13,
    text: "Rośliny Dżungli ×2.",
    effect: { chapter: { dzungla: 2 } },
  },
  {
    id: "deszcz",
    name: "Tropikalny deszcz",
    chapter: "dzungla",
    cost: 1.31e14,
    text: "Wszystkie rośliny ×1,5.",
    effect: { global: 1.5 },
  },
  {
    id: "rekawiceOgrodnika",
    name: "Rękawice ogrodnika",
    chapter: "dzungla",
    cost: 2.94e14,
    text: "Stuknięcie daje też 5% produkcji/s.",
    effect: { tapLps: 0.05 },
  },
  {
    id: "latarnia",
    name: "Kamienna latarnia",
    chapter: "japonski",
    cost: 1.98e15,
    text: "Rośliny Ogrodu japońskiego ×2.",
    effect: { chapter: { japonski: 2 } },
  },
  {
    id: "cierpliwosc",
    name: "Cierpliwość mistrza",
    chapter: "japonski",
    cost: 1.58e16,
    text: "Wszystkie rośliny ×1,5.",
    effect: { global: 1.5 },
  },
  {
    id: "konewkaBambusowa",
    name: "Bambusowa konewka",
    chapter: "japonski",
    cost: 3.56e16,
    text: "Konewka: +2 ładunki.",
    effect: { water: { charges: 2 } },
  },
  {
    id: "studniaOazy",
    name: "Studnia w oazie",
    chapter: "oaza",
    cost: 2.39e17,
    text: "Rośliny Oazy ×2.",
    effect: { chapter: { oaza: 2 } },
  },
  {
    id: "karawana",
    name: "Karawana",
    chapter: "oaza",
    cost: 1.91e18,
    text: "Wszystkie rośliny ×1,5.",
    effect: { global: 1.5 },
  },
  {
    id: "cienPalm",
    name: "Cień palm",
    chapter: "oaza",
    cost: 4.3e18,
    text: "Ogród rośnie bez Ciebie o 4 h dłużej.",
    effect: { offline: 4 * 3600 },
  },
  {
    id: "grzejnik",
    name: "Grzejnik szklarniowy",
    chapter: "zimowy",
    cost: 2.89e19,
    text: "Rośliny Ogrodu zimowego ×2.",
    effect: { chapter: { zimowy: 2 } },
  },
  {
    id: "kakao",
    name: "Kubek kakao",
    chapter: "zimowy",
    cost: 2.32e20,
    text: "Wszystkie rośliny ×1,5.",
    effect: { global: 1.5 },
  },
  {
    id: "szronoweRekawiczki",
    name: "Szronowe rękawiczki",
    chapter: "zimowy",
    cost: 5.21e20,
    text: "Stuknięcia ×5.",
    effect: { tap: 5 },
  },
  {
    id: "pompaStawu",
    name: "Pompa do stawu",
    chapter: "wodny",
    cost: 3.18e21,
    text: "Rośliny Wodnego ogrodu ×2.",
    effect: { chapter: { wodny: 2 } },
  },
  {
    id: "zloteRybki",
    name: "Złote rybki",
    chapter: "wodny",
    cost: 2.55e22,
    text: "Wszystkie rośliny ×1,5.",
    effect: { global: 1.5 },
  },
  {
    id: "fontanna",
    name: "Fontanna",
    chapter: "wodny",
    cost: 5.73e22,
    text: "Podlewanie ×5.",
    effect: { water: { multiplier: 5 } },
  },
  {
    id: "panele",
    name: "Panele słoneczne",
    chapter: "dach",
    cost: 2.86e23,
    text: "Rośliny Ogrodu na dachu ×2.",
    effect: { chapter: { dach: 2 } },
  },
  {
    id: "kompostMiejski",
    name: "Miejski kompost",
    chapter: "dach",
    cost: 2.29e24,
    text: "Wszystkie rośliny ×1,5.",
    effect: { global: 1.5 },
  },
  {
    id: "sasiedzi",
    name: "Pomocni sąsiedzi",
    chapter: "dach",
    cost: 5.16e24,
    text: "Stuknięcie daje też 10% produkcji/s.",
    effect: { tapLps: 0.1 },
  },
  {
    id: "swietliki",
    name: "Świetliki",
    chapter: "ksiezycowy",
    cost: 2.32e25,
    text: "Rośliny Księżycowego ogrodu ×2.",
    effect: { chapter: { ksiezycowy: 2 } },
  },
  {
    id: "ksiezycowaRosa",
    name: "Księżycowa rosa",
    chapter: "ksiezycowy",
    cost: 1.86e26,
    text: "Wszystkie rośliny ×2.",
    effect: { global: 2 },
  },
  {
    id: "senSowy",
    name: "Sen sowy",
    chapter: "ksiezycowy",
    cost: 4.18e26,
    text: "Ogród rośnie bez Ciebie o 8 h dłużej.",
    effect: { offline: 8 * 3600 },
  },
  // Nawozy gatunków (uwaga O6): każda roślina poza Monsterą (ma „Nawóz monster”) ×2, cena 1000 × cena
  // pierwszej sztuki, w rozdziale rośliny.
  ...PLANT_LIST.filter((plant) => plant.id !== "monstera").map((plant) => ({
    id: `nawoz-${plant.id}`,
    name: `Nawóz: ${plant.name}`,
    chapter: plant.chapter,
    cost: plant.cost * 1000,
    text: `${plant.name} ×2.`,
    effect: { plant: { [plant.id]: 2 } },
  })),
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
    max: 20,
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
    max: 10,
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
  // 4. gałąź „Słońce” (uwaga O6): na nowe rozdziały i więcej nasion.
  {
    id: "sloneczneKorzenie",
    branch: "Słońce",
    name: "Słoneczne korzenie",
    cost: 8,
    max: 100,
    text: "Produkcja ×1,1 za poziom (mnoży się).",
  },
  {
    id: "porannyStart",
    branch: "Słońce",
    name: "Poranny start",
    cost: 12,
    max: 3,
    req: "sloneczneKorzenie",
    text: "Nowy cykl startuje z ulepszeniami Parapetu i Balkonu (poziom 1), Działki (2) i Basenu (3).",
  },
  {
    id: "wieczneLato",
    branch: "Słońce",
    name: "Wieczne lato",
    cost: 20,
    max: 5,
    req: "porannyStart",
    text: "Rośliny rozdziałów od Palmiarni +50% za poziom.",
  },
]);
