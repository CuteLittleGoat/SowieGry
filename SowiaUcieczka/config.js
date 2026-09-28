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

export const MIN_SPEED = DIFFICULTIES.chill.speedStart * COZY_SPEED;
export const MAX_SPEED = Math.max(...Object.values(DIFFICULTIES).map((item) => item.speedMax));

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
});

// Generator: odstęp między wzorami (j.) rośnie z prędkością; po trudnym wzorze — „oddech”.
export const TRACK = Object.freeze({ gapSeconds: 0.45, gapMin: 3, lookahead: 40, cleanupBehind: 12, recent: 3 });
