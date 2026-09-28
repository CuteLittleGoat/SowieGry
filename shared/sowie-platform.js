// SowiePlatform: rejestr gier, stałe, zdarzenia i obsługa ?seed= / ?testNow=. Zapis postępu: shared/sowie-cloud.js.
(() => {
  "use strict";

  // Rejestr gier. Identyfikatory (id) są stałe — są wpisane w opublikowane reguły Firestore.
  // kind: "arcade" (rozgrywki z wynikiem) albo "idle" (pełny stan gry); dailyMetric: wartość rekordu wyzwania dnia;
  // preview: nowa wersja gry w osobnym folderze (Analiza 3, „Podgląd przed podmianą”).
  const GAME_REGISTRY = Object.freeze([
    {
      id: "runner",
      name: "SowaRunner",
      path: "SowaRunner/",
      icon: "🏃",
      kind: "arcade",
      dailyMetric: "distance",
      // Nowa wersja w podglądzie (E4): ten sam identyfikator i te same rekordy.
      preview: Object.freeze({ path: "SowiaUcieczka/", name: "Sowia Ucieczka" }),
    },
    { id: "jumper", name: "SowaJumper", path: "SowaJumper/", icon: "🪶", kind: "arcade", dailyMetric: "height" },
    { id: "sowa3", name: "Sowa3", path: "Sowa3/", icon: "🛣️", kind: "arcade", dailyMetric: "score" },
    { id: "ogrody", name: "Sowie Ogrody", path: "SowieOgrody/", icon: "🌿", kind: "idle", saveVersion: 2 },
    { id: "szklarnia", name: "Sowia Szklarnia", path: "SowiaSzklarnia/", icon: "🏡", kind: "idle", saveVersion: 1 },
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