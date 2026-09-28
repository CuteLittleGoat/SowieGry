// Sowia Ucieczka — wszystkie parametry gry w jednym miejscu (balans: Analiza 2, rozdz. 3.1 i 9 „Ryzyka”).
// Jednostki: świat w jednostkach logicznych (1 j. = 1 m dystansu), czas w sekundach. Oś y rośnie w dół,
// ziemia to y = 0, więc wysokość nad ziemią jest ujemna.

export const GAME_ID = "runner";

// Fizyka sowy.
export const PHYSICS = Object.freeze({
  gravity: 38, // j./s²
  jumpVelocity: 14, // skok: szczyt 2,58 j. po 0,37 s, w powietrzu ok. 0,74 s
  doubleJumpVelocity: 12, // podwójny skok: +1,89 j.
  maxFall: 22,
  glideFall: 1.6, // szybowanie: stała prędkość opadania
  glideBrake: 40, // hamowanie do prędkości szybowania
  glideMaxTime: 1.5, // szybowanie na jedno wybicie
  glideDelay: 0.15, // przytrzymanie dłuższe niż tyle od dotknięcia = szybowanie (krótkie stuknięcie nie szybuje)
  fastFall: 18, // przesunięcie w dół w powietrzu: szybkie opadanie
  slideTime: 0.6, // ślizg
  coyote: 0.1, // skok tuż po zejściu z krawędzi
  jumpBuffer: 0.12, // stuknięcie tuż przed lądowaniem
  pressDelay: 0.06, // dotyk: po tylu sekundach bez przesunięcia dotknięcie to skok (a nie ślizg)
  holeDepth: 1.2, // wpadnięcie do dziury głębiej niż tyle = trafienie
});

// Sowa: rysunek 1,2 j., pole kolizji ok. 80% rysunku (gra wybacza).
export const OWL = Object.freeze({
  drawSize: 1.2,
  hitWidth: 0.8,
  hitHeight: 1.0,
  slideWidth: 0.96,
  slideHeight: 0.55,
  screenX: 0.18, // sowa przy lewej krawędzi (18% szerokości)
});

// Poziomy platform (wysokość górnej krawędzi nad ziemią).
export const PLATFORM_LEVELS = Object.freeze([2.2, 4.2, 6.2]);
export const PLATFORM_THICKNESS = 0.35;

// Poziomy trudności: prędkość rośnie przez rampSeconds od speedStart do speedMax.
// tierScale skaluje progi dystansu wzorów (Chaos szybciej dochodzi do trudnych wzorów).
export const DIFFICULTIES = Object.freeze({
  chill: { label: "Chill", speedStart: 5, speedMax: 7.5, rampSeconds: 200, tierScale: 1.4, gap: 1.25 },
  arcade: { label: "Arcade", speedStart: 6, speedMax: 9, rampSeconds: 180, tierScale: 1, gap: 1 },
  chaos: { label: "Chaos", speedStart: 7, speedMax: 10.5, rampSeconds: 150, tierScale: 0.6, gap: 0.8 },
});
export const DIFFICULTY_ORDER = Object.freeze(["chill", "arcade", "chaos"]);
// Tryb Przytulny (ustawienie profilu, tylko z poziomem Chill): wolniej i bez końca gry.
export const COZY_SPEED = 0.85;

// Biomy co 1000 m (Łąka → Miasto → Osiedle PRL → Stacja Amic → Plaża → Noc nad morzem), potem pętla:
// każde kolejne okrążenie +5% prędkości (najwyżej +10%).
export const BIOME_LENGTH = 1000;
export const BIOME_COUNT = 6;
export const LOOP_SPEEDUP = Object.freeze({ step: 0.05, max: 0.1 });

export const MIN_SPEED = DIFFICULTIES.chill.speedStart * COZY_SPEED;
// Największa prędkość, przy której trzeba zdążyć zareagować (Turbo daje nietykalność, więc się nie liczy).
export const MAX_SPEED = Math.max(...Object.values(DIFFICULTIES).map((item) => item.speedMax)) * (1 + LOOP_SPEEDUP.max);

// Progi dystansu wzorów (m, mnożone przez tierScale): 0 — rozgrzewka, 1–3 — coraz trudniej.
export const TIER_DISTANCE = Object.freeze([0, 300, 900, 1800]);

// Kamera i widok.
export const VIEW = Object.freeze({
  // Widok w pionie: 11 j. szerokości (przy powiększeniu 1); w poziomie co najmniej 10 j. wysokości.
  minWorld: Object.freeze({ width: 11, height: 10 }),
  groundScreenY: 0.8, // ziemia na 80% wysokości ekranu
  titleGroundScreenY: 0.42, // ekran tytułowy: sowa nad kartą z przyciskami
  hudWorld: 2.2, // miejsce na HUD u góry (j.): sowa nie wchodzi pod HUD
  reactionTarget: 1.2, // kamera oddala się, żeby przeszkoda była widoczna ≥ 1,2 s (wymaganie: ≥ 1,1 s)
  reactionRequired: 1.1,
  minZoom: 0.6,
  zoomRate: 1.5, // płynne oddalanie
  followRate: 6,
  // Obiekty szybsze od świata (wózek Amic, rój maili) ruszają, gdy sowa jest tak daleko (w sekundach),
  // i od razu dostają ostrzeżenie „!” przy prawej krawędzi.
  moverLead: 1.3,
});

// Chmura Pracu = życia (3 kroki). 400 m bez trafienia oddala chmurę o krok.
export const CLOUD = Object.freeze({ steps: 3, recoverDistance: 400, invulnerable: 1.5 });

// Punktacja (rozdział 3.1): dystans + liście × combo + premie.
export const SCORE = Object.freeze({
  perMeter: 1,
  leaf: { zielony: 10, zloty: 50, teczowy: 100 },
  leafCount: { zielony: 1, zloty: 5, teczowy: 1 },
  nearMiss: 25,
  nearMissGap: 0.35,
  comboStep: 10, // +1 poziom combo co 10 liści bez trafienia
  comboMax: 5,
  // „Idealnie!”: lądowanie na platformie w środkowych 36% jej szerokości → 20 pkt × combo i +1 do serii.
  perfect: 20,
  perfectZone: 0.18,
  perfectCooldown: 0.5,
});

// Generator: odstęp między wzorami (j.) rośnie z prędkością; po trudnym wzorze — „oddech”.
export const TRACK = Object.freeze({ gapSeconds: 0.45, gapMin: 3, lookahead: 40, cleanupBehind: 12, recent: 3 });

// Skaczące kózki (power-upy, Analiza 2, rozdz. 2.2): pojawiają się co 180–320 m w odstępie między wzorami.
export const GOATS = Object.freeze({
  every: Object.freeze([180, 320]),
  hopHeight: 1.3,
  hopPeriod: 1.1,
  radius: 0.6,
  bonus: 50,
  weights: Object.freeze({ sprezynka: 1, tarcza: 1.2, magnes: 1, turbo: 0.8, podwajaczka: 1 }),
  duration: Object.freeze({ tarcza: 15, magnes: 8, turbo: 4, podwajaczka: 10 }),
  springVelocity: 20, // Sprężynka: super-skok (ok. 5,3 j.)
  turboSpeed: 1.5, // Turbo: sprint ×1,5 z nietykalnością
  magnetRadius: 3.5,
  magnetPull: 14,
  ride: 1.2, // złapana kózka przez chwilę jedzie na grzbiecie sowy
});

// Gorączka Monster (tęczowy liść): 8 s, liście ×2 i gęstsze układy liści, bez dodatkowych przeszkód.
export const FEVER = Object.freeze({ duration: 8, multiplier: 2, extraHeight: 3.1, extraSpacing: 1.3 });

// Plusk-o-metr: 60 liści albo 3 bąbelki humbaka → „Rejs na humbaku”.
export const SPLASH = Object.freeze({
  leaves: 60,
  bubbles: 3,
  bubbleEvery: Object.freeze([500, 900]),
  bubbleHeight: 2.6,
});

// „Rejs na humbaku”: 20 s bez przeszkód, stuknięcie = humbak wyskakuje z wody, łuki liści w powietrzu.
export const WHALE = Object.freeze({
  duration: 20,
  jumpVelocity: 12.5,
  gravity: 24,
  bonus: 200, // + 10 pkt za każdy liść z rejsu
  perLeaf: 10,
  leafEvery: 1.3,
  reach: 0.9,
});
