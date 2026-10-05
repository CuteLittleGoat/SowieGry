// SowiePlatform: rejestr gier, stałe, zdarzenia i obsługa ?seed= / ?testNow=. Zapis postępu: shared/sowie-cloud.js.
(() => {
  "use strict";

  // Rejestr gier. Identyfikatory (id) są stałe — są wpisane w opublikowane reguły Firestore.
  // kind: "arcade" (rozgrywki z wynikiem) albo "idle" (pełny stan gry); dailyMetric: wartość rekordu wyzwania dnia;
  // rebuilt: gra przebudowana (karta w menu ma znaczek „Nowe!”);
  // preview: nowa wersja gry w osobnym folderze przed podmianą (Analiza 3, „Podgląd przed podmianą”);
  // modes: tryby gry z osobnymi rekordami (pierwszy — domyślny, rekordy pod samym poziomem; SowieCloud.recordKey).
  const GAME_REGISTRY = Object.freeze([
    // Sowia Ucieczka (E4) zastąpiła SowaRunner: ten sam identyfikator i te same rekordy; SowaRunner/ przekierowuje.
    {
      id: "runner",
      name: "Sowia Ucieczka",
      path: "SowiaUcieczka/",
      icon: "🏃",
      kind: "arcade",
      dailyMetric: "distance",
      rebuilt: true,
    },
    // Sowa w Chmurach (E6) zastąpiła SowaJumper: ten sam identyfikator i te same rekordy; SowaJumper/ przekierowuje.
    {
      id: "jumper",
      name: "Sowa w Chmurach",
      path: "SowaWChmurach/",
      icon: "🪶",
      kind: "arcade",
      dailyMetric: "height",
      rebuilt: true,
    },
    // Sowie Tory (E5) zastąpiły Sowa3: ten sam identyfikator i te same rekordy; Sowa3/ przekierowuje.
    {
      id: "sowa3",
      name: "Sowie Tory",
      path: "SowieTory/",
      icon: "🛣️",
      kind: "arcade",
      dailyMetric: "score",
      rebuilt: true,
      // Kampania i tryb Nieskończony (po kampanii) mają osobne rekordy i top 10.
      modes: Object.freeze([
        Object.freeze({ id: "kampania", label: "Kampania" }),
        Object.freeze({ id: "nieskonczony", label: "Nieskończony" }),
      ]),
    },
    // Nowa odsłona Sowich Ogrodów (E7) zastąpiła dawną grę w tym samym folderze; SowieOgrody/nowa.html przekierowuje.
    {
      id: "ogrody",
      name: "Sowie Ogrody",
      path: "SowieOgrody/",
      icon: "🌿",
      kind: "idle",
      saveVersion: 3,
      rebuilt: true,
    },
    // Łącz i Hoduj (E8) zastąpiła Sowią Szklarnię: ten sam identyfikator i dokument gry; SowiaSzklarnia/ przekierowuje.
    {
      id: "szklarnia",
      name: "Łącz i Hoduj",
      path: "LaczIHoduj/",
      icon: "🏡",
      kind: "idle",
      saveVersion: 2,
      rebuilt: true,
    },
  ]);

  const COSMETICS = Object.freeze({
    none: { label: "Bez dodatku", icon: "🦉" },
    bow: { label: "Kokardka", icon: "🎀" },
    glasses: { label: "Okulary", icon: "😎" },
    flowerCrown: { label: "Wianek", icon: "🌸" },
    gardenerHat: { label: "Kapelusz ogrodnika", icon: "👒" },
    cap: { label: "Czapka z daszkiem", icon: "🧢" },
    scarf: { label: "Szalik", icon: "🧣" },
    backpack: { label: "Plecak", icon: "🎒" },
    bubbleTrail: { label: "Ślad bąbelków", icon: "🫧" },
    // Nowe stroje z Sowiego Butiku (E9c) — tylko za piórka.
    crown: { label: "Korona", icon: "👑" },
    bowTie: { label: "Muszka", icon: "🎀" },
    headphones: { label: "Słuchawki", icon: "🎧" },
    beanie: { label: "Czapka z pomponem", icon: "🧶" },
  });

  const DEFAULT_SETTINGS = Object.freeze({
    music: true,
    sfx: true,
    quips: true,
    reducedEffects: false,
  });

  const DEFAULT_MISSIONS = Object.freeze({
    leaves20: { progress: 0, target: 20, done: false, reward: "glasses" },
    extraLife: { progress: 0, target: 1, done: false, reward: "flowerCrown" },
    nearMiss3: { progress: 0, target: 3, done: false, reward: "scarf" },
    chaosFinish: { progress: 0, target: 1, done: false, reward: "gardenerHat" },
    combo4: { progress: 0, target: 1, done: false, reward: "bubbleTrail" },
    runner1000: { progress: 0, target: 1000, done: false, reward: "cap" },
    jumper250: { progress: 0, target: 250, done: false, reward: "backpack" },
  });

  // Liczniki ogólne profilu. Rekordy gier są w profil.records (SowieCloud).
  const DEFAULT_STATS = Object.freeze({
    leaves: 0,
    nearMisses: 0,
    extraLives: 0,
    finishes: 0,
    maxCombo: 1,
  });

  const eventTarget = new EventTarget();
  const throttles = new Map();

  function emit(type, detail = {}) {
    eventTarget.dispatchEvent(new CustomEvent(type, { detail }));
  }

  function on(type, listener, options) {
    eventTarget.addEventListener(type, listener, options);
    return () => eventTarget.removeEventListener(type, listener, options);
  }

  function shouldRun(key, intervalMs) {
    const now = performance.now();
    const previous = throttles.get(key) ?? -Infinity;
    if (now - previous < intervalMs) return false;
    throttles.set(key, now);
    return true;
  }

  function hashSeed(value) {
    let hash = 2166136261;
    for (const character of String(value)) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0 || 1;
  }

  function createRng(seed) {
    let state = hashSeed(seed);
    return () => {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
  }

  const params = new URLSearchParams(location.search);
  const seed = params.get("seed");
  const seededRandom = seed ? createRng(seed) : null;
  const testNow = Number(params.get("testNow"));
  if (seededRandom) Math.random = seededRandom;
  if (Number.isFinite(testNow) && testNow > 0) {
    const startedAt = performance.now();
    Date.now = () => Math.floor(testNow + performance.now() - startedAt);
  }

  const platform = Object.freeze({
    GAME_REGISTRY,
    COSMETICS,
    DEFAULT_SETTINGS,
    DEFAULT_MISSIONS,
    DEFAULT_STATS,
    emit,
    on,
    shouldRun,
    createRng,
    random: () => Math.random(),
    now: () => Date.now(),
  });

  window.SowiePlatform = platform;
})();
