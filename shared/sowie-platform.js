(() => {
  "use strict";

  const PROFILE_KEY = "sowieGryProfile";
  const PROFILE_SCHEMA_VERSION = 2;
  const BACKUP_PREFIX = "sowieGryBackup";

  const GAME_REGISTRY = Object.freeze([
    { id: "runner", name: "SowaRunner", path: "SowaRunner/", icon: "🏃", saveVersion: 1, stats: ["runnerDistance"] },
    { id: "jumper", name: "SowaJumper", path: "SowaJumper/", icon: "🪶", saveVersion: 1, stats: ["jumperHeight"] },
    { id: "sowa3", name: "Sowa3", path: "Sowa3/", icon: "🛣️", saveVersion: 1, stats: ["finishes", "maxCombo"] },
    { id: "ogrody", name: "Sowie Ogrody", path: "SowieOgrody/", icon: "🌿", saveVersion: 2, stats: ["ogrodyLeaves", "ogrodyGardenLevel"] },
    { id: "szklarnia", name: "Sowia Szklarnia", path: "SowiaSzklarnia/", icon: "🏡", saveVersion: 1, stats: ["szklarniaLeaves", "szklarniaRooms"] },
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

  const DEFAULT_STATS = Object.freeze({
    leaves: 0,
    nearMisses: 0,
    extraLives: 0,
    finishes: 0,
    maxCombo: 1,
    runnerDistance: 0,
    jumperHeight: 0,
    ogrodyLeaves: 0,
    ogrodyGardenLevel: 0,
    szklarniaLeaves: 0,
    szklarniaRooms: 0,
  });

  const eventTarget = new EventTarget();
  const throttles = new Map();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createDefaultProfile() {
    return {
      schemaVersion: PROFILE_SCHEMA_VERSION,
      version: PROFILE_SCHEMA_VERSION,
      updatedAt: Date.now(),
      unlockedCosmetics: ["none", "bow"],
      selectedCosmetic: "none",
      settings: clone(DEFAULT_SETTINGS),
      missions: clone(DEFAULT_MISSIONS),
      stats: clone(DEFAULT_STATS),
    };
  }

  function safeParse(value, fallback = null) {
    try {
      return JSON.parse(value);
    } catch (_error) {
      return fallback;
    }
  }

  function backupValue(key, value, fromVersion = 0) {
    if (value == null) return;
    const backupKey = `${BACKUP_PREFIX}:${key}:v${fromVersion}`;
    if (!localStorage.getItem(backupKey)) localStorage.setItem(backupKey, value);
  }

  function migrateProfile(raw) {
    const input = raw && typeof raw === "object" ? clone(raw) : {};
    let version = Number(input.schemaVersion ?? input.version ?? 0);

    if (version < 1) {
      input.version = 1;
      version = 1;
    }
    if (version < 2) {
      input.schemaVersion = 2;
      input.version = 2;
      input.updatedAt = Date.now();
      version = 2;
    }

    const result = createDefaultProfile();
    result.schemaVersion = PROFILE_SCHEMA_VERSION;
    result.version = PROFILE_SCHEMA_VERSION;
    result.updatedAt = Number(input.updatedAt) || Date.now();
    result.unlockedCosmetics = Array.from(new Set([
      ...result.unlockedCosmetics,
      ...(Array.isArray(input.unlockedCosmetics) ? input.unlockedCosmetics : []),
    ])).filter((key) => COSMETICS[key]);
    result.selectedCosmetic = result.unlockedCosmetics.includes(input.selectedCosmetic)
      ? input.selectedCosmetic
      : "none";
    result.settings = { ...result.settings, ...(input.settings || {}) };
    result.stats = { ...result.stats, ...(input.stats || {}) };
    for (const [key, defaults] of Object.entries(result.missions)) {
      result.missions[key] = { ...defaults, ...(input.missions?.[key] || {}) };
    }
    return result;
  }

  function readProfile() {
    const stored = localStorage.getItem(PROFILE_KEY);
    const raw = safeParse(stored, null);
    const migrated = migrateProfile(raw);
    if (!stored || JSON.stringify(raw) !== JSON.stringify(migrated)) {
      if (stored) backupValue(PROFILE_KEY, stored, Number(raw?.schemaVersion ?? raw?.version ?? 0));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(migrated));
    }
    return migrated;
  }

  function writeProfile(profile) {
    const normalized = migrateProfile(profile);
    normalized.updatedAt = Date.now();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(normalized));
    emit("profile:changed", { profile: clone(normalized) });
    return normalized;
  }

  function migrateKnownSave(key, expectedVersion) {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const raw = safeParse(stored, null);
    if (!raw || typeof raw !== "object") return null;
    const current = Number(raw.schemaVersion ?? raw.version ?? 0);
    if (current >= expectedVersion && raw.schemaVersion === expectedVersion) return raw;
    backupValue(key, stored, current);
    const migrated = { ...raw, version: expectedVersion, schemaVersion: expectedVersion };
    localStorage.setItem(key, JSON.stringify(migrated));
    emit("save:migrated", { key, from: current, to: expectedVersion });
    return migrated;
  }

  function migrateLegacyStorage() {
    readProfile();
    migrateKnownSave("sowieOgrodySave", 2);
    migrateKnownSave("sowiaSzklarniaSave", 1);
    localStorage.setItem("sowieGryMigrationsVersion", String(PROFILE_SCHEMA_VERSION));
  }

  function allowedExportKey(key) {
    return key.startsWith("sowie") || [
      "sowaRunnerBestScore",
      "sowaRunnerBestDistance",
      "sowaJumperBestScore",
      "sowaJumperBestHeight",
      "sowa3Best",
      "sowa3FinishSeen",
    ].includes(key);
  }

  function exportData() {
    const records = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && allowedExportKey(key)) records[key] = localStorage.getItem(key);
    }
    return JSON.stringify({
      format: "SowieGrySave",
      schemaVersion: PROFILE_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      records,
    }, null, 2);
  }

  function downloadExport() {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sowie-gry-zapis-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importData(input) {
    const data = typeof input === "string" ? safeParse(input, null) : input;
    if (!data || data.format !== "SowieGrySave" || !data.records || typeof data.records !== "object") {
      throw new Error("Nieprawidłowy format kopii SowieGry.");
    }
    for (const [key, value] of Object.entries(data.records)) {
      if (!allowedExportKey(key) || typeof value !== "string") continue;
      const previous = localStorage.getItem(key);
      if (previous != null) backupValue(key, previous, "import");
      localStorage.setItem(key, value);
    }
    migrateLegacyStorage();
    emit("save:imported", { keys: Object.keys(data.records) });
    return true;
  }

  function importFile(file) {
    if (!(file instanceof Blob)) return Promise.reject(new Error("Nie wybrano pliku."));
    return file.text().then(importData);
  }

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
    PROFILE_KEY,
    PROFILE_SCHEMA_VERSION,
    GAME_REGISTRY,
    COSMETICS,
    DEFAULT_SETTINGS,
    DEFAULT_MISSIONS,
    DEFAULT_STATS,
    createDefaultProfile,
    readProfile,
    writeProfile,
    migrateLegacyStorage,
    migrateKnownSave,
    exportData,
    downloadExport,
    importData,
    importFile,
    emit,
    on,
    shouldRun,
    createRng,
    random: () => Math.random(),
    now: () => Date.now(),
  });

  window.SowiePlatform = platform;
  migrateLegacyStorage();
})();