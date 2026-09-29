// Sowie Tory — wszystkie parametry gry w jednym miejscu (Analiza 2, rozdz. 3.2; plan: Analiza 3, E5).
// Jednostki: metry i sekundy. Świat: x — w bok (środek drogi 0), y — w górę od drogi, z — w głąb od sowy.

// Identyfikator w bazie i w rejestrze gier zostaje „sowa3” (reguły Firestore).
export const GAME_ID = "sowa3";

// Trzy tory co 1,6 m: −1 (lewy), 0 (środkowy), 1 (prawy).
export const LANES = Object.freeze({ count: 3, width: 1.6, min: -1, max: 1 });

// Rzutnia: kamera 4,2 m za sową; w pionie droga przy sowie zajmuje 84% szerokości ekranu, w poziomie najwyżej
// 115% wysokości (droga na środku, scenografia po bokach). Mgła od 38 m, przeszkody pojawiają się na 64 m.
export const PROJECTION = Object.freeze({
  cameraBack: 4.2,
  roadShare: 0.84,
  roadHeightShare: 1.15,
  horizon: 0.3,
  horizonLandscape: 0.24,
  owlScreenY: 0.8,
  farZ: 64,
  fogStart: 38,
});

// Sowa: skok (szczyt 1,3 m po 0,33 s, w powietrzu 0,66 s), ślizg 0,7 s, zmiana toru ok. 0,11 s.
export const OWL = Object.freeze({
  drawSize: 1.25,
  halfWidth: 0.42, // pole kolizji w bok (gra wybacza: mniej niż rysunek)
  halfDepth: 0.3, // pole kolizji w głąb
  height: 1.2,
  slideHeight: 0.55,
  jumpVelocity: 7.9,
  gravity: 24,
  fastFall: 70, // przesunięcie w dół w powietrzu: szybkie lądowanie, potem ślizg
  slideTime: 0.7,
  laneSpeed: 15, // m/s w bok
  jumpBuffer: 0.14, // przesunięcie w górę tuż przed lądowaniem też skacze
  invulnerable: 1.5, // po trafieniu
});

// Poziomy trudności: prędkość na planszy rośnie od speedStart do speedMax, a każda kolejna plansza kampanii
// dodaje stageStep. Życia jak w obecnej grze: Chill 4, Arcade 3, Chaos 2. gap — mnożnik odstępów między wzorami.
export const DIFFICULTIES = Object.freeze({
  chill: { label: "Chill", speedStart: 11, speedMax: 15, stageStep: 0.6, lives: 4, gap: 1.25 },
  arcade: { label: "Arcade", speedStart: 13, speedMax: 18, stageStep: 0.8, lives: 3, gap: 1 },
  chaos: { label: "Chaos", speedStart: 15, speedMax: 21, stageStep: 1, lives: 2, gap: 0.82 },
});
export const DIFFICULTY_ORDER = Object.freeze(["chill", "arcade", "chaos"]);
// Tryb Przytulny (ustawienie profilu, tylko z poziomem Chill): wolniej i bez końca gry.
export const COZY_SPEED = 0.85;

// Długość planszy (m) — ok. 75 s biegu; odstęp między wzorami przeszkód (m, przy prędkości 13 m/s; rośnie
// z prędkością, żeby czas między wzorami był stały).
export const TRACK = Object.freeze({
  stageLength: 1200,
  startClear: 40, // pierwsze metry bez przeszkód
  finishClear: 60, // ostatnie metry przed metą bez przeszkód
  gap: 22,
  gapSpeed: 13,
});

// Typy przeszkód według sposobu omijania (Analiza 2, rozdz. 3.2).
// low — skok (górna krawędź `top`), high — ślizg (dolna krawędź `bottom`), full — zmiana toru.
export const OBSTACLE_TYPES = Object.freeze({
  low: { top: 0.7, depth: 0.7, action: "skok" },
  high: { bottom: 0.85, top: 2.1, depth: 0.5, action: "ślizg" },
  full: { top: 2.2, depth: 1, action: "zmiana toru" },
});
// Ruchoma przeszkoda (telefon Pracu) zmienia tor: strzałka ostrzega 0,8 s przed ruchem, przejazd trwa 0,35 s
// i kończy się co najmniej 0,6 s przed dotarciem do sowy.
export const MOVING = Object.freeze({ warning: 0.8, switchTime: 0.35, lead: 0.6 });

// Pościg dzików (tylko plansza PRL, Analiza 2, rozdz. 3.2): pierwszy dzik po ok. 140 m, potem co 110–170 m
// jeden dzik wyrywa się ze stada i szarżuje torem sowy — strzałka przy dolnej krawędzi toru 1 s wcześniej.
// Dzik biegnie o `speed` m/s szybciej niż sowa (od `start` m za nią); trzeba zmienić tor. `fairLook` — ile
// sekund przed sowę sprawdzamy, czy jest wolny tor ucieczki (inaczej szarża czeka `retry` m).
export const BOARS = Object.freeze({
  first: 140,
  every: Object.freeze([110, 170]),
  warning: 1,
  speed: 9,
  start: -3.5,
  halfWidth: 0.5,
  lastClear: 150,
  fairLook: 2.4,
  retry: 15,
  bonus: 30,
});

// Punktacja: liść 10 pkt × combo (×1–×5), combo rośnie co 8 liści bez trafienia, trafienie obniża o 1 poziom.
export const SCORE = Object.freeze({
  leaf: 10,
  comboStep: 8,
  comboMax: 5,
  perMeter: 0.5,
  stageBonus: 250,
  noHitBonus: 300,
});

// Liście: w torze na wysokości 0,6 m, zbierane w promieniu 0,7 m (w bok) i 0,8 m (w głąb).
export const LEAVES = Object.freeze({ height: 0.6, reachX: 0.7, reachZ: 0.8, spacing: 3 });

// Efekty wczytywane po pierwszym dotknięciu (tylko używane przez grę).
export const GAME_SOUNDS = Object.freeze([
  "skok",
  "slizg",
  "ladowanie",
  "lisc",
  "trafienie-pracu",
  "trafienie-amic",
  "zycie",
  "rekord",
  "koniec-gry",
  "odliczanie",
  "odliczanie-start",
  "hu-hu",
  "dzwonek",
  "polaczenie",
]);
