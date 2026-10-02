// Sowa w Chmurach — wszystkie parametry gry w jednym miejscu (Analiza 2, rozdz. 3.3; plan: Analiza 3, E6).
// Jednostki: metry i sekundy. Świat: kolumna szeroka na 9 m (x od 0 do 9, przejście przez krawędź na drugą
// stronę), y — wysokość w górę od ziemi (ogródek na y = 0).

// Identyfikator w bazie i w rejestrze gier zostaje „jumper” (reguły Firestore).
export const GAME_ID = "jumper";

// Kolumna gry: w pionie cała szerokość ekranu = 9 m; w poziomie i na komputerze kolumna na środku (widać
// co najmniej `minVisible` m wysokości). `height` — wysokość widoku, według której działa logika (kamera,
// upadek, generator) — taka sama na każdym telefonie; wyższy ekran pokazuje więcej nieba nad sową.
export const WORLD = Object.freeze({ width: 9, height: 16, minVisible: 14.5 });

// Kamera jedzie tylko w górę: sowa najwyżej 55% wysokości widoku nad dolną krawędzią. Upadek — sowa 1,2 m
// pod dolną krawędzią. Platformy powstają do 32 m nad dolną krawędzią, znikają 6 m pod nią.
export const CAMERA = Object.freeze({ owlShare: 0.55, fallMargin: 1.2, ahead: 32, behind: 6 });

// Sowa: wybicie 15,5 m/s przy g = 30 m/s² — szczyt 4,0 m po 0,52 s. Przeciąganie palcem przesuwa sowę
// o `drag` × przesunięcie palca (w metrach świata), najwyżej `dragSpeed` m/s; klawiatura przyspiesza
// o `keyAccel` m/s² do `keySpeed`, bez klawisza prędkość wygasa (`keyDecay` 1/s). Pole lądowania: stopy
// ±`foot` m, pole zbierania: koło `reach` m wokół środka sowy (`center` m nad stopami).
export const OWL = Object.freeze({
  drawSize: 1.15,
  gravity: 30,
  jumpVelocity: 15.5,
  maxFall: 22,
  drag: 1.25,
  dragSpeed: 14,
  keyAccel: 42,
  keySpeed: 9,
  keyDecay: 9,
  foot: 0.28,
  center: 0.55,
  reach: 0.75,
  invulnerable: 1.5,
});

// Szczyt zwykłego wybicia (m) — z niego generator liczy największy odstęp między platformami.
export const APEX = (OWL.jumpVelocity * OWL.jumpVelocity) / (2 * OWL.gravity);

// Poziomy trudności. Życia jak w obecnej grze: Chill 4, Arcade 3, Chaos 3. `gap` — mnożnik odstępów między
// platformami, `hard` — mnożnik szansy na trudne platformy (chmurka, huśtawka, krucha gałązka).
export const DIFFICULTIES = Object.freeze({
  chill: Object.freeze({ label: "Chill", lives: 4, gap: 0.85, hard: 0.7 }),
  arcade: Object.freeze({ label: "Arcade", lives: 3, gap: 1, hard: 1 }),
  chaos: Object.freeze({ label: "Chaos", lives: 3, gap: 1.12, hard: 1.3 }),
});
export const DIFFICULTY_ORDER = Object.freeze(["chill", "arcade", "chaos"]);
// Tryb Przytulny (Chill + ustawienie profilu): czas gry płynie wolniej, ostatnie życie zostaje.
export const COZY_TIME = 0.85;

// Sześć czytelnych typów platform (zamiast 12): szerokość (m), wybicie (mnożnik prędkości), punkty za
// odbicie. `solid` — pewna platforma (cel ratunku).
export const PLATFORM_TYPES = Object.freeze({
  galazka: Object.freeze({ label: "Gałązka", width: 1.9, bounce: 1, points: 0, solid: true }),
  lisc: Object.freeze({ label: "Liść Monstery", width: 1.6, bounce: 1.45, points: 10, solid: true }),
  chmurka: Object.freeze({ label: "Chmurka", width: 1.9, bounce: 1, points: 0, solid: false }),
  hustawka: Object.freeze({ label: "Huśtawka", width: 1.8, bounce: 1, points: 0, solid: true }),
  balkon: Object.freeze({ label: "Balkon", width: 3.4, bounce: 1, points: 0, solid: true }),
  krucha: Object.freeze({ label: "Krucha gałązka", width: 1.7, bounce: 0, points: 0, solid: false }),
});
// Huśtawka: ±1,4 m w ciągu 3,2 s. Chmurka znika 0,35 s po odbiciu, krucha gałązka spada 0,5 s.
export const SWING = Object.freeze({ amplitude: 1.4, period: 3.2 });
export const FADE = Object.freeze({ chmurka: 0.35, krucha: 0.5 });

// Generator: odstęp między kolejnymi platformami ścieżki rośnie z wysokością od `gapStart` do `gapEnd`
// (pełny przy `gapHeight` m), ±`gapJitter`, nigdy więcej niż `maxGapShare` szczytu wybicia. Krok w bok
// najwyżej `maxStep` m. Trudne platformy od podanej wysokości, z szansą rosnącą do `hardChance`; najwyżej
// `hardStreak` trudne pod rząd. Balkon co `balconyEvery` m. Dodatkowa platforma (pewna albo krucha
// gałązka-pułapka) z szansą `extraChance`, co najmniej `extraSpacing` m w bok od ścieżki.
export const GENERATOR = Object.freeze({
  firstY: 1.6,
  gapStart: 1.5,
  gapEnd: 2.9,
  gapHeight: 1200,
  gapJitter: 0.35,
  maxGapShare: 0.82,
  maxStep: 3.6,
  margin: 0.15,
  hardFrom: Object.freeze({ lisc: 30, chmurka: 60, hustawka: 100, krucha: 40 }),
  hardChance: Object.freeze({ lisc: 0.08, chmurka: 0.12, hustawka: 0.14 }),
  hardStreak: 2,
  balconyEvery: 150,
  extraChance: 0.3,
  extraKrucha: 0.5,
  extraSpacing: 2.4,
});

// Liście Monstery: kolumna 1–3 liści nad platformą ścieżki (co 1 m od 1,2 m), z szansą `chance`; złoty liść
// (5 liści, 50 pkt) na szczycie co `goldEvery`-tej kolumny.
export const LEAVES = Object.freeze({ chance: 0.45, first: 1.2, step: 1, max: 3, goldEvery: 9 });

// Punktacja: 1 pkt za metr wysokości (rekord biegu), liść 10 pkt × combo (złoty 50), combo co 8 w serii
// (liście i idealne lądowania) do ×5; idealne lądowanie (środkowe 30% platformy) — 2 pkt × długość serii
// (najwyżej 10).
export const SCORE = Object.freeze({
  perMeter: 1,
  leaf: 10,
  goldLeaf: 50,
  comboStep: 8,
  comboMax: 5,
  perfectShare: 0.3,
  perfect: 2,
  perfectMax: 10,
});

// Ratunek zamiast upadku: kózka łapie sowę i w 1,4 s odnosi ją na ostatnią pewną platformę (−1 życie).
export const RESCUE = Object.freeze({ duration: 1.4, minAbove: 1, searchAbove: 10, fallbackY: 3 });

// Strefy wysokości (Analiza 2, rozdz. 3.3): kolory nieba (góra, dół) i nazwy.
export const ZONES = Object.freeze([
  Object.freeze({ id: "ogrodek", name: "Ogródek", from: 0, sky: ["#bfe9ff", "#fff6e3"] }),
  Object.freeze({ id: "blok", name: "Blok", from: 150, sky: ["#a8dcf5", "#ffe1c4"] }),
  Object.freeze({ id: "chmury", name: "Chmury", from: 400, sky: ["#8fcff2", "#dff5fb"] }),
  Object.freeze({ id: "zorza", name: "Zorza", from: 800, sky: ["#2d3b6e", "#4f9f8f"] }),
  Object.freeze({ id: "kosmos", name: "Kosmos", from: 1500, sky: ["#14122b", "#3b2f4a"] }),
]);

// Efekty wczytywane po pierwszym dotknięciu (tylko używane przez grę).
export const GAME_SOUNDS = Object.freeze([
  "skok",
  "podwojny-skok",
  "ladowanie",
  "lisc",
  "lisc-zloty",
  "polaczenie",
  "trafienie-amic",
  "koza-meee",
  "zycie",
  "rekord",
  "koniec-gry",
  "odliczanie",
  "odliczanie-start",
  "hu-hu",
]);
