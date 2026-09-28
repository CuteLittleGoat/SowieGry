// SowieCloud — jedyny moduł SowieGry, który rozmawia z Firestore i używa pamięci przeglądarki.
// Specyfikacja: Analizy/ANALIZA_1_Firestore_zapis_postepu.md (rozdziały 3–7 i 12).
// Dane: kolekcja "sowiegry" (dokumenty "meta" i "profil") oraz podkolekcje "sowiegry_gry" i "sowiegry_historia".
(() => {
  "use strict";

  const SDK_VERSION = "12.19.0";
  const SDK_URL = `https://www.gstatic.com/firebasejs/${SDK_VERSION}`;
  const APP_NAME = "sowiegry";
  const HASLO_GRACZA = "huhu";
  const SCHEMA_VERSION = 1;
  const DEVICE_KEY = "sowiegry:urzadzenie";
  const MODE_KEY = "sowiegry:tryb-chmury";
  const GAME_IDS = Object.freeze(["runner", "jumper", "sowa3", "ogrody", "szklarnia"]);
  const EMULATOR = Object.freeze({ host: "127.0.0.1", port: 8080, projectId: "demo-sowiegry" });

  const PATHS = Object.freeze({
    meta: "sowiegry/meta",
    profile: "sowiegry/profil",
    game: (gameId) => `sowiegry/profil/sowiegry_gry/${gameId}`,
    history: (gameId) => `sowiegry/profil/sowiegry_gry/${gameId}/sowiegry_historia`,
  });

  // Opóźnienia zapisów (Analiza 1, rozdział 6).
  const DELAYS = Object.freeze({
    profile: 30_000,
    settings: 1_000,
    game: 1_000,
    idle: 30_000,
    idleImportant: 2_000,
  });

  const TOP_LIMIT = 10;
  const HISTORY_LIMIT = 50;
  const HISTORY_TRIM_AT = 60;
  const DAILY_DAYS = 30;
  const AWARD_DAYS = 30;

  // Stare klucze SowieGry do jednorazowego skasowania (Analiza 1, rozdział 12). Nigdy clear().
  const STARE_KLUCZE = Object.freeze([
    "sowieGryProfile",
    "sowieGryMigrationsVersion",
    "sowieGryAcademy",
    "sowieOwlGallery",
    "sowaRunnerBestScore",
    "sowaRunnerBestDistance",
    "sowaJumperBestScore",
    "sowaJumperBestHeight",
    "sowaJumperDifficulty",
    "sowa3Best",
    "sowa3Difficulty",
    "sowa3FinishSeen",
    "sowieOgrodySave",
    "sowiaSzklarniaSave",
    "sowieSzklarniaTraitAlbum",
  ]);
  const STARE_PREFIKSY = Object.freeze(["sowieGryBackup:", "sowieExpansion:", "sowieDailyBest:"]);

  // Liczniki profilu: zapisywane wyłącznie przez increment(), więc sumują się poprawnie z kilku urządzeń.
  const PROFILE_COUNTERS = Object.freeze([
    "stats.leaves",
    "stats.nearMisses",
    "stats.extraLives",
    "stats.finishes",
    ...GAME_IDS.map((gameId) => `records.${gameId}.runs`),
  ]);
  const GAME_COUNTERS = Object.freeze(["historyCount"]);

  // Znaczniki operacji specjalnych; backend zamienia je na increment() / serverTimestamp() / deleteField().
  const OP = "__sowieOp";
  const increment = (n) => ({ [OP]: "increment", n: Number(n) || 0 });
  const serverTime = () => ({ [OP]: "serverTime" });
  const deleteValue = () => ({ [OP]: "delete" });
  const isOp = (value) => Boolean(value && typeof value === "object" && OP in value);

  // ---------------------------------------------------------------------------
  // Funkcje pomocnicze (czyste, testowane jednostkowo)
  // ---------------------------------------------------------------------------

  function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value) && !isOp(value);
  }

  function sameValue(a, b) {
    if (a === b) return true;
    if (typeof a === "number" && typeof b === "number") return Number.isNaN(a) && Number.isNaN(b);
    if (Array.isArray(a) && Array.isArray(b)) return JSON.stringify(a) === JSON.stringify(b);
    return false;
  }

  function normalizePassword(value) {
    return String(value ?? "")
      .trim()
      .toLowerCase();
  }

  function checkPassword(value) {
    return normalizePassword(value) === HASLO_GRACZA;
  }

  function dayKey(ms = Date.now()) {
    return new Date(ms).toISOString().slice(0, 10);
  }

  function getPath(target, path) {
    let node = target;
    for (const key of path) {
      if (!node || typeof node !== "object") return undefined;
      node = node[key];
    }
    return node;
  }

  function setPath(target, path, value) {
    let node = target;
    path.slice(0, -1).forEach((key) => {
      if (!isPlainObject(node[key])) node[key] = {};
      node = node[key];
    });
    node[path[path.length - 1]] = value;
    return target;
  }

  // Różnica dwóch stanów jako zagnieżdżony obiekt do zapisu z { merge: true }.
  // Zmienione liście — nowa wartość, usunięte klucze — znacznik delete, tablice — w całości.
  // Ścieżki liczników są pomijane (zapisywane osobno przez increment()).
  function diff(before, after, isCounter = () => false, prefix = []) {
    const patch = {};
    let changed = false;
    const base = isPlainObject(before) ? before : {};
    const next = isPlainObject(after) ? after : {};
    for (const key of new Set([...Object.keys(base), ...Object.keys(next)])) {
      const path = [...prefix, key];
      if (isCounter(path.join("."))) continue;
      const hasNext = Object.prototype.hasOwnProperty.call(next, key) && next[key] !== undefined;
      const hasBase = Object.prototype.hasOwnProperty.call(base, key) && base[key] !== undefined;
      if (!hasNext) {
        if (hasBase) {
          patch[key] = deleteValue();
          changed = true;
        }
        continue;
      }
      const value = next[key];
      if (isPlainObject(value) && (!hasBase || isPlainObject(base[key]))) {
        const nested = diff(hasBase ? base[key] : {}, value, isCounter, path);
        if (nested) {
          patch[key] = nested;
          changed = true;
        }
        continue;
      }
      if (!hasBase || !sameValue(base[key], value)) {
        patch[key] = clone(value);
        changed = true;
      }
    }
    return changed ? patch : null;
  }

  // Zastosowanie zapisu { merge: true } ze znacznikami (MemoryBackend i testy).
  function applyPatch(target, patch, nowMs = Date.now()) {
    const result = isPlainObject(target) ? target : {};
    for (const [key, value] of Object.entries(patch || {})) {
      if (isOp(value)) {
        if (value[OP] === "delete") delete result[key];
        else if (value[OP] === "increment") result[key] = (Number(result[key]) || 0) + value.n;
        else if (value[OP] === "serverTime") result[key] = nowMs;
      } else if (isPlainObject(value)) {
        result[key] = applyPatch(isPlainObject(result[key]) ? result[key] : {}, value, nowMs);
      } else {
        result[key] = clone(value);
      }
    }
    return result;
  }

  // Wstawia wynik do listy top N (malejąco po score). Zwraca listę i miejsce (1..N) albo null.
  function insertTop(list, entry, limit = TOP_LIMIT) {
    const rows = Array.isArray(list) ? list.slice() : [];
    let index = rows.findIndex((row) => Number(entry.score) > Number(row.score));
    if (index === -1) index = rows.length;
    if (index >= limit) return { list: rows.slice(0, limit), place: null };
    rows.splice(index, 0, entry);
    return { list: rows.slice(0, limit), place: index + 1 };
  }

  function cutoffDay(today, days) {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() - (days - 1));
    return date.toISOString().slice(0, 10);
  }

  // Zostawia wpisy z ostatnich `days` dni (klucze RRRR-MM-DD).
  function trimDaily(map, today, days = DAILY_DAYS) {
    const cutoff = cutoffDay(today, days);
    const result = {};
    for (const [key, value] of Object.entries(map || {})) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key) && key >= cutoff) result[key] = value;
    }
    return result;
  }

  // Usuwa nagrody dzienne (daily:*, feature:*) starsze niż `days` dni; nagrody trwałe zostają.
  function trimAwards(awards, today, days = AWARD_DAYS) {
    const cutoff = cutoffDay(today, days);
    const result = {};
    for (const [key, value] of Object.entries(awards || {})) {
      if (/^(daily|feature):/.test(key)) {
        const date = key.match(/\d{4}-\d{2}-\d{2}/)?.[0];
        if (date && date < cutoff) continue;
      }
      result[key] = value;
    }
    return result;
  }

  function isOldKey(key) {
    return STARE_KLUCZE.includes(key) || STARE_PREFIKSY.some((prefix) => String(key).startsWith(prefix));
  }

  // Kasuje wyłącznie klucze SowieGry z listy (Analiza 1, rozdział 12). Zwraca skasowane klucze.
  function cleanupOldKeys(storage) {
    const keys = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key != null && isOldKey(key)) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
    return keys;
  }

  // Znaczniki czasu Firestore (Timestamp) → milisekundy, żeby profil w pamięci był zwykłym JSON-em.
  function normalizeValue(value) {
    if (value && typeof value === "object") {
      if (typeof value.toMillis === "function") return value.toMillis();
      if (Array.isArray(value)) return value.map(normalizeValue);
      const result = {};
      for (const [key, entry] of Object.entries(value)) result[key] = normalizeValue(entry);
      return result;
    }
    return value;
  }

  function randomId(prefix = "d-") {
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
    const bytes = new Uint8Array(6);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
    else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
    return prefix + Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  }

  function defaultProfile(platform) {
    return {
      schemaVersion: SCHEMA_VERSION,
      name: "Sowa",
      settings: clone(platform.DEFAULT_SETTINGS),
      cosmetics: { unlocked: ["none", "bow"], selected: "none" },
      missions: clone(platform.DEFAULT_MISSIONS),
      stats: clone(platform.DEFAULT_STATS),
      academy: { xp: 0, feathers: 0, metrics: {}, daily: null, weekly: null, awards: {} },
      gallery: { unlocked: ["owl-01"], viewed: [], favorite: null },
      records: {},
    };
  }

  // Uzupełnia wczytany profil wartościami domyślnymi (profil powstał w starszej wersji albo jest niepełny).
  function normalizeProfile(raw, platform) {
    const base = defaultProfile(platform);
    const input = isPlainObject(raw) ? raw : {};
    const result = { ...base, ...input };
    // Znaczniki czasu serwera nie są częścią stanu w pamięci (zapisuje je tylko serwer).
    delete result.createdAt;
    delete result.updatedAt;
    delete result.lastSeenAt;
    result.schemaVersion = SCHEMA_VERSION;
    result.settings = { ...base.settings, ...(isPlainObject(input.settings) ? input.settings : {}) };
    result.stats = { ...base.stats, ...(isPlainObject(input.stats) ? input.stats : {}) };
    result.missions = {};
    for (const [key, defaults] of Object.entries(base.missions)) {
      result.missions[key] = { ...defaults, ...(isPlainObject(input.missions?.[key]) ? input.missions[key] : {}) };
    }
    const cosmetics = isPlainObject(input.cosmetics) ? input.cosmetics : {};
    const known = Object.keys(platform.COSMETICS || {});
    result.cosmetics = {
      unlocked: Array.from(new Set([...base.cosmetics.unlocked, ...(cosmetics.unlocked || [])])).filter(
        (key) => !known.length || known.includes(key),
      ),
      selected: "none",
    };
    if (result.cosmetics.unlocked.includes(cosmetics.selected)) result.cosmetics.selected = cosmetics.selected;
    result.academy = { ...base.academy, ...(isPlainObject(input.academy) ? input.academy : {}) };
    result.gallery = { ...base.gallery, ...(isPlainObject(input.gallery) ? input.gallery : {}) };
    result.records = isPlainObject(input.records) ? input.records : {};
    return result;
  }

  // ---------------------------------------------------------------------------
  // MemoryBackend: testy (?cloud=memory), awaria CDN, tryb offline bez SDK
  // ---------------------------------------------------------------------------

  class MemoryBackend {
    constructor({ now = () => Date.now() } = {}) {
      this.kind = "memory";
      this.docs = new Map();
      this.listeners = new Map();
      this.commits = [];
      this.sequence = 0;
      this.now = now;
    }

    async getDoc(path) {
      return this.docs.has(path) ? clone(this.docs.get(path)) : null;
    }

    async commit(ops) {
      this.commits.push(clone(ops));
      const touched = new Set();
      for (const op of ops) {
        if (op.type === "set") {
          this.docs.set(op.path, applyPatch(this.docs.get(op.path) || {}, op.data, this.now()));
          touched.add(op.path);
        } else if (op.type === "add") {
          this.sequence += 1;
          const path = `${op.collection}/m-${String(this.sequence).padStart(6, "0")}`;
          this.docs.set(path, applyPatch({}, op.data, this.now()));
        } else if (op.type === "delete") {
          this.docs.delete(op.path);
          touched.add(op.path);
        }
      }
      for (const path of touched) {
        for (const listener of this.listeners.get(path) || []) {
          listener(clone(this.docs.get(path) ?? null), { fromCache: false, pendingWrites: false });
        }
      }
    }

    async query(collection, { orderBy = "at", direction = "desc", limit = 10 } = {}) {
      const prefix = `${collection}/`;
      const rows = [...this.docs.entries()]
        .filter(([path]) => path.startsWith(prefix) && !path.slice(prefix.length).includes("/"))
        .map(([path, data]) => ({ id: path.slice(prefix.length), path, data: clone(data) }));
      rows.sort((a, b) => {
        const delta = (Number(a.data[orderBy]) || 0) - (Number(b.data[orderBy]) || 0) || a.id.localeCompare(b.id);
        return direction === "desc" ? -delta : delta;
      });
      return rows.slice(0, limit);
    }

    subscribe(path, listener) {
      if (!this.listeners.has(path)) this.listeners.set(path, new Set());
      this.listeners.get(path).add(listener);
      return () => this.listeners.get(path)?.delete(listener);
    }

    // Liczba zapisów dokumentu (do testów limitów).
    writesTo(path) {
      return this.commits.filter((ops) => ops.some((op) => op.type === "set" && op.path === path)).length;
    }
  }

  // ---------------------------------------------------------------------------
  // FirestoreBackend: Firebase JS SDK 12.19.0 (modularny) z CDN, cache w IndexedDB
  // ---------------------------------------------------------------------------

  async function createFirestoreBackend({ config, emulator = null, sdkUrl = SDK_URL }) {
    const [appSdk, fs] = await Promise.all([
      import(`${sdkUrl}/firebase-app.js`),
      import(`${sdkUrl}/firebase-firestore.js`),
    ]);
    // Nazwana aplikacja — nie koliduje z domyślną aplikacją innego projektu na tej samej domenie.
    const app = appSdk.getApps().find((entry) => entry.name === APP_NAME) || appSdk.initializeApp(config, APP_NAME);
    const db = fs.initializeFirestore(app, {
      localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }),
      ignoreUndefinedProperties: true,
    });
    if (emulator) fs.connectFirestoreEmulator(db, emulator.host, emulator.port);

    const ref = (path) => fs.doc(db, path);
    const read = (snapshot) => normalizeValue(snapshot.data({ serverTimestamps: "estimate" }));

    function toFirestore(value) {
      if (isOp(value)) {
        if (value[OP] === "increment") return fs.increment(value.n);
        if (value[OP] === "serverTime") return fs.serverTimestamp();
        return fs.deleteField();
      }
      if (Array.isArray(value)) return value.map(toFirestore);
      if (value && typeof value === "object") {
        const result = {};
        for (const [key, entry] of Object.entries(value)) result[key] = toFirestore(entry);
        return result;
      }
      return value;
    }

    return {
      kind: "firestore",
      async getDoc(path, source = "default") {
        const target = ref(path);
        const snapshot =
          source === "cache"
            ? await fs.getDocFromCache(target)
            : source === "server"
              ? await fs.getDocFromServer(target)
              : await fs.getDoc(target);
        return snapshot.exists() ? read(snapshot) : null;
      },
      commit(ops) {
        const batch = fs.writeBatch(db);
        for (const op of ops) {
          if (op.type === "set") batch.set(ref(op.path), toFirestore(op.data), { merge: true });
          else if (op.type === "add") batch.set(fs.doc(fs.collection(db, op.collection)), toFirestore(op.data));
          else if (op.type === "delete") batch.delete(ref(op.path));
        }
        return batch.commit();
      },
      async query(collection, { orderBy = "at", direction = "desc", limit = 10 } = {}) {
        const snapshot = await fs.getDocs(
          fs.query(fs.collection(db, collection), fs.orderBy(orderBy, direction), fs.limit(limit)),
        );
        return snapshot.docs.map((entry) => ({ id: entry.id, path: entry.ref.path, data: read(entry) }));
      },
      subscribe(path, listener) {
        return fs.onSnapshot(
          ref(path),
          (snapshot) =>
            listener(snapshot.exists() ? read(snapshot) : null, {
              fromCache: snapshot.metadata.fromCache,
              pendingWrites: snapshot.metadata.hasPendingWrites,
            }),
          (error) => console.warn("SowieCloud: nasłuch dokumentu przerwany", error),
        );
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Silnik SowieCloud: bramka hasła, magazyn w pamięci, kolejka zapisów
  // ---------------------------------------------------------------------------

  function createCloud(options) {
    const {
      platform,
      storage,
      connect,
      gameId: currentGameId = null,
      now = () => Date.now(),
      timers = { setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: (id) => clearTimeout(id) },
      emit = () => {},
      onLock = () => {},
      reload = () => {},
      isOnline = () => true,
      logError = (...args) => console.error(...args),
      gameKinds = {},
    } = options;

    const statusListeners = new Set();
    const conflictListeners = new Set();
    const profileListeners = new Set();
    const readyQueue = [];
    const profileCounters = new Set(PROFILE_COUNTERS);
    const profileIncrements = new Map();
    const games = new Map();
    const gameBases = new Map();
    const gameIncrements = new Map();
    const unknownGames = new Set();
    const pendingOps = [];
    const pendingCommits = new Set();

    let status = "laczenie";
    let backend = null;
    let isReadyFlag = false;
    let profileKnown = false;
    let profile = defaultProfile(platform);
    let profileBase = clone(profile);
    let fallbackReason = null;
    let timer = null;
    let dueAt = Infinity;
    let inFlight = 0;
    let unlockResolve = null;
    let readyResolve = null;

    const unlocked = new Promise((resolve) => {
      unlockResolve = resolve;
    });
    const ready = new Promise((resolve) => {
      readyResolve = resolve;
    });

    // --- urządzenie -----------------------------------------------------------
    function readDevice() {
      try {
        const raw = JSON.parse(storage.getItem(DEVICE_KEY) || "null");
        if (raw && typeof raw === "object") return raw;
      } catch (_error) {
        // Uszkodzony wpis — tworzymy nowy.
      }
      return {};
    }

    function writeDevice(patch) {
      device = { ...device, ...patch };
      try {
        storage.setItem(DEVICE_KEY, JSON.stringify(device));
      } catch (_error) {
        // Pamięć przeglądarki niedostępna (np. tryb prywatny) — odblokowanie działa do końca sesji.
      }
    }

    let device = readDevice();
    const removedKeys = device.cleaned ? [] : cleanupOldKeys(storage);
    writeDevice({
      unlocked: Boolean(device.unlocked),
      deviceId: typeof device.deviceId === "string" && device.deviceId ? device.deviceId : randomId(),
      cleaned: true,
    });

    // --- status -----------------------------------------------------------------
    function setStatus(next) {
      if (next === status) return;
      status = next;
      for (const listener of statusListeners) listener(status);
      emit("cloud:status", { status });
    }

    function settledStatus() {
      if (!isReadyFlag) return device.unlocked ? "laczenie" : "haslo";
      if (inFlight > 0 && isOnline()) return "zapisywanie";
      if (backend?.kind !== "firestore" || !profileKnown || !isOnline()) return "offline";
      return "online";
    }

    function refreshStatus() {
      if (status === "blad" && inFlight > 0) return;
      setStatus(settledStatus());
    }

    // --- bramka hasła -----------------------------------------------------------
    function isUnlocked() {
      return Boolean(device.unlocked);
    }

    function unlock(password) {
      if (!checkPassword(password)) return false;
      writeDevice({ unlocked: true });
      unlockResolve();
      refreshStatus();
      return true;
    }

    async function lock() {
      try {
        await Promise.race([flush(), new Promise((resolve) => timers.setTimeout(resolve, 1500))]);
      } finally {
        writeDevice({ unlocked: false });
        onLock();
      }
    }

    // --- pomocnicze -------------------------------------------------------------
    function whenReady(fn) {
      if (isReadyFlag) return fn();
      readyQueue.push(fn);
      return undefined;
    }

    function isGameCounter(path) {
      return GAME_COUNTERS.includes(path);
    }

    function schedule(delayMs) {
      const target = now() + Math.max(0, delayMs);
      if (target >= dueAt && timer !== null) return;
      if (timer !== null) timers.clearTimeout(timer);
      dueAt = target;
      timer = timers.setTimeout(
        () => {
          timer = null;
          dueAt = Infinity;
          flush();
        },
        Math.max(0, target - now()),
      );
    }

    function ensureGameDoc(gameId) {
      if (!games.has(gameId)) {
        games.set(gameId, {});
        gameBases.set(gameId, {});
      }
      return games.get(gameId);
    }

    async function readDoc(path) {
      // Najpierw cache (natychmiastowy start na telefonie), potem serwer.
      let cached = null;
      try {
        cached = await backend.getDoc(path, "cache");
      } catch (_error) {
        cached = null;
      }
      if (cached) return { data: cached, known: true, fromCache: backend.kind === "firestore" };
      try {
        return { data: await backend.getDoc(path, "server"), known: true, fromCache: false };
      } catch (_error) {
        return { data: null, known: false, fromCache: false };
      }
    }

    function hasLocalProfileChanges() {
      return profileIncrements.size > 0 || Boolean(diff(profileBase, profile, (path) => profileCounters.has(path)));
    }

    // --- start ------------------------------------------------------------------
    async function start() {
      if (!device.unlocked) {
        setStatus("haslo");
        await unlocked;
      }
      setStatus("laczenie");
      try {
        backend = await connect();
      } catch (error) {
        console.warn("SowieCloud: brak połączenia z Firestore, tryb offline.", error);
        fallbackReason = "sdk";
        backend = new MemoryBackend({ now });
      }

      const ops = [];
      // sowiegry/meta — tworzone raz (Analiza 1, rozdział 2: „utworzenie kolekcji”).
      const meta = await readDoc(PATHS.meta);
      if (meta.known && !meta.data) {
        ops.push({
          type: "set",
          path: PATHS.meta,
          data: { schemaVersion: SCHEMA_VERSION, createdAt: serverTime(), games: [...GAME_IDS] },
        });
      }

      // sowiegry/profil — jedyny profil gracza.
      const loaded = await readDoc(PATHS.profile);
      profileKnown = loaded.known;
      if (loaded.data) {
        profile = normalizeProfile(loaded.data, platform);
        profileBase = clone(loaded.data);
        delete profileBase.createdAt;
        delete profileBase.updatedAt;
        delete profileBase.lastSeenAt;
      } else {
        profile = defaultProfile(platform);
        profileBase = clone(profile);
        if (loaded.known) {
          ops.push({
            type: "set",
            path: PATHS.profile,
            data: { ...clone(profile), createdAt: serverTime(), updatedAt: serverTime(), lastSeenAt: serverTime() },
          });
        }
      }
      if (!profileKnown && !fallbackReason) fallbackReason = "profil";

      // Dokument bieżącej gry.
      if (currentGameId) await loadGameDoc(currentGameId);

      if (ops.length) commitNow(ops);

      isReadyFlag = true;
      refreshStatus();
      readyQueue.splice(0).forEach((fn) => {
        try {
          fn();
        } catch (error) {
          logError("SowieCloud: błąd zadania po starcie", error);
        }
      });
      readyResolve(api);
      emit("cloud:ready", { status });

      if (loaded.fromCache) refreshProfileFromServer();
      if (currentGameId && gameKinds[currentGameId] === "idle") watchIdleGame(currentGameId);
    }

    async function loadGameDoc(gameId) {
      const result = await readDoc(PATHS.game(gameId));
      if (!result.known) unknownGames.add(gameId);
      else unknownGames.delete(gameId);
      games.set(gameId, clone(result.data) || {});
      gameBases.set(gameId, clone(result.data) || {});
      return games.get(gameId);
    }

    async function refreshProfileFromServer() {
      let fresh = null;
      try {
        fresh = await backend.getDoc(PATHS.profile, "server");
      } catch (_error) {
        return;
      }
      if (!fresh || hasLocalProfileChanges()) return;
      profile = normalizeProfile(fresh, platform);
      profileBase = clone(fresh);
      delete profileBase.createdAt;
      delete profileBase.updatedAt;
      delete profileBase.lastSeenAt;
      for (const listener of profileListeners) listener(profile);
      emit("cloud:profile-reloaded", {});
    }

    // Dwa urządzenia naraz w grze idle: nowszy `rev` z innego urządzenia → pytanie o wczytanie.
    function watchIdleGame(gameId) {
      backend.subscribe(PATHS.game(gameId), (data, meta) => {
        if (!data || meta.fromCache || meta.pendingWrites) return;
        const local = games.get(gameId) || {};
        const remoteRev = Number(data.rev) || 0;
        if (remoteRev > (Number(local.rev) || 0) && data.deviceId && data.deviceId !== device.deviceId) {
          const decide = (load) => {
            if (load) reload();
            else local.rev = remoteRev;
          };
          if (!conflictListeners.size) decide(false);
          for (const listener of conflictListeners) listener({ gameId, rev: remoteRev, decide });
        }
      });
    }

    // --- zapisy -----------------------------------------------------------------
    // Wysyła zapis zbiorczy. Zwrócona obietnica czeka także na zapisy wysłane wcześniej
    // (flush() = „wszystko, co zmieniono, dotarło do bazy”; offline — do czasu powrotu sieci).
    function commitNow(ops) {
      if (ops.length) {
        inFlight += 1;
        refreshStatus();
        const task = Promise.resolve()
          .then(() => backend.commit(ops))
          .then(
            () => {
              inFlight -= 1;
              refreshStatus();
            },
            (error) => {
              inFlight -= 1;
              setStatus("blad");
              logError("SowieCloud: zapis w Firestore nie powiódł się", error);
            },
          );
        pendingCommits.add(task);
        task.then(() => pendingCommits.delete(task));
      }
      return Promise.all([...pendingCommits]).then(() => undefined);
    }

    function buildOps() {
      const ops = [];
      if (profileKnown) {
        const patch = diff(profileBase, profile, (path) => profileCounters.has(path));
        if (patch || profileIncrements.size) {
          const data = patch || {};
          for (const [path, amount] of profileIncrements) setPath(data, path.split("."), increment(amount));
          data.schemaVersion = SCHEMA_VERSION;
          data.updatedAt = serverTime();
          data.lastSeenAt = serverTime();
          ops.push({ type: "set", path: PATHS.profile, data });
        }
      }
      profileBase = clone(profile);
      profileIncrements.clear();

      for (const [gameId, doc] of games) {
        if (unknownGames.has(gameId)) continue;
        const patch = diff(gameBases.get(gameId), doc, isGameCounter);
        const increments = gameIncrements.get(gameId);
        if (patch || increments?.size) {
          const data = patch || {};
          for (const [path, amount] of increments || []) setPath(data, path.split("."), increment(amount));
          if (patch && "state" in patch) data.savedAt = serverTime();
          data.updatedAt = serverTime();
          ops.push({ type: "set", path: PATHS.game(gameId), data });
        }
        gameBases.set(gameId, clone(doc));
        increments?.clear();
      }
      ops.push(...pendingOps.splice(0));
      return ops;
    }

    function flush() {
      if (timer !== null) timers.clearTimeout(timer);
      timer = null;
      dueAt = Infinity;
      if (!isReadyFlag || !backend) return ready.then(() => flush());
      return commitNow(buildOps());
    }

    // --- profil -----------------------------------------------------------------
    function getProfile() {
      return profile;
    }

    function updateProfile(mutator, { delayMs = DELAYS.profile } = {}) {
      if (!isReadyFlag) {
        whenReady(() => updateProfile(mutator, { delayMs }));
        return profile;
      }
      mutator(profile);
      schedule(delayMs);
      return profile;
    }

    function incrementProfile(path, amount = 1, { delayMs = DELAYS.profile } = {}) {
      const value = Number(amount) || 0;
      if (!value) return;
      if (!isReadyFlag) {
        whenReady(() => incrementProfile(path, value, { delayMs }));
        return;
      }
      profileCounters.add(path);
      const parts = path.split(".");
      setPath(profile, parts, (Number(getPath(profile, parts)) || 0) + value);
      profileIncrements.set(path, (profileIncrements.get(path) || 0) + value);
      schedule(delayMs);
    }

    function onProfileReload(listener) {
      profileListeners.add(listener);
      return () => profileListeners.delete(listener);
    }

    // --- gry ----------------------------------------------------------------------
    function game(gameId) {
      return games.get(gameId) || {};
    }

    async function loadGame(gameId) {
      await ready;
      if (games.has(gameId)) return games.get(gameId);
      return loadGameDoc(gameId);
    }

    function updateGame(gameId, mutator, { delayMs = DELAYS.game } = {}) {
      if (!isReadyFlag) {
        whenReady(() => updateGame(gameId, mutator, { delayMs }));
        return;
      }
      const doc = ensureGameDoc(gameId);
      if (typeof mutator === "function") mutator(doc);
      else Object.assign(doc, mutator);
      schedule(delayMs);
    }

    function incrementGame(gameId, path, amount) {
      const doc = ensureGameDoc(gameId);
      const parts = path.split(".");
      setPath(doc, parts, (Number(getPath(doc, parts)) || 0) + amount);
      if (!gameIncrements.has(gameId)) gameIncrements.set(gameId, new Map());
      const map = gameIncrements.get(gameId);
      map.set(path, (map.get(path) || 0) + amount);
    }

    function records(gameId, difficulty) {
      const entry = profile.records?.[gameId] || {};
      if (!difficulty) return entry;
      return entry[difficulty] || {};
    }

    function topRuns(gameId, difficulty = "arcade") {
      return loadGame(gameId).then((doc) => clone(doc.top10?.[difficulty] || []));
    }

    async function history(gameId, limit = 10) {
      await ready;
      const rows = await backend.query(PATHS.history(gameId), { orderBy: "at", direction: "desc", limit });
      return rows.map((row) => row.data);
    }

    // Koniec rozgrywki: rekordy, top 10, statystyki, historia, rekord dnia (1 zapis zbiorczy).
    function submitRun(gameId, result = {}) {
      if (!isReadyFlag) {
        whenReady(() => submitRun(gameId, result));
        return null;
      }
      const difficulty = String(result.difficulty || "arcade");
      const entry = { score: Math.floor(Number(result.score) || 0), difficulty, at: now() };
      for (const key of ["distance", "height", "leaves", "durationMs"]) {
        if (Number.isFinite(Number(result[key])) && result[key] !== null && result[key] !== undefined) {
          entry[key] = Math.floor(Number(result[key]));
        }
      }
      entry.daily = Boolean(result.daily);
      entry.seed = result.seed ?? null;

      profile.records ||= {};
      const record = (profile.records[gameId] ||= {});
      const best = (record[difficulty] ||= {});
      // Rekord (max) zapisujemy tylko przy poprawie — Firestore nie ma operacji „max”.
      const newRecord = entry.score > (Number(best.bestScore) || 0);
      for (const [key, field] of [
        ["score", "bestScore"],
        ["distance", "bestDistance"],
        ["height", "bestHeight"],
      ]) {
        if (key in entry && entry[key] > (Number(best[field]) || 0)) best[field] = entry[key];
      }
      record.lastPlayedAt = entry.at;
      incrementProfile(`records.${gameId}.runs`, 1, { delayMs: 0 });

      const doc = ensureGameDoc(gameId);
      doc.top10 ||= {};
      const top = insertTop(doc.top10[difficulty], entry, TOP_LIMIT);
      doc.top10[difficulty] = top.list;

      if (entry.daily) {
        const metric = platform.GAME_REGISTRY?.find((item) => item.id === gameId)?.dailyMetric || "score";
        const today = dayKey(entry.at);
        const value = Number(entry[metric] ?? entry.score) || 0;
        doc.dailyBest = trimDaily(
          { ...(doc.dailyBest || {}), [today]: Math.max(Number(doc.dailyBest?.[today]) || 0, value) },
          today,
        );
      }

      pendingOps.push({ type: "add", collection: PATHS.history(gameId), data: { ...entry, at: serverTime() } });
      incrementGame(gameId, "historyCount", 1);
      flush();
      if ((Number(doc.historyCount) || 0) > HISTORY_TRIM_AT) trimHistory(gameId);
      return { newRecord, place: top.place, best: clone(best) };
    }

    // Przycina historię do 50 najnowszych wpisów (bez polityki TTL — Analiza 1, rozdział 4.3).
    async function trimHistory(gameId) {
      const doc = ensureGameDoc(gameId);
      const excess = (Number(doc.historyCount) || 0) - HISTORY_LIMIT;
      if (excess <= 0) return 0;
      let rows = [];
      try {
        rows = await backend.query(PATHS.history(gameId), { orderBy: "at", direction: "asc", limit: excess });
      } catch (error) {
        console.warn("SowieCloud: nie udało się przyciąć historii", error);
        return 0;
      }
      if (!rows.length) return 0;
      rows.forEach((row) => pendingOps.push({ type: "delete", path: row.path }));
      incrementGame(gameId, "historyCount", -rows.length);
      await flush();
      return rows.length;
    }

    // --- gry idle -----------------------------------------------------------------
    async function loadGameState(gameId) {
      const doc = await loadGame(gameId);
      if (typeof doc.state !== "string") return null;
      try {
        return JSON.parse(doc.state);
      } catch (_error) {
        return null;
      }
    }

    function saveGameState(gameId, state, { immediate = false, summary = null, saveVersion = null } = {}) {
      if (!isReadyFlag) {
        whenReady(() => saveGameState(gameId, state, { immediate, summary, saveVersion }));
        return;
      }
      const doc = ensureGameDoc(gameId);
      const serialized = JSON.stringify(state);
      doc.saveVersion = Number(saveVersion ?? state?.version ?? 1) || 1;
      if (doc.state !== serialized) {
        doc.state = serialized;
        doc.clientSavedAt = now();
        doc.deviceId = device.deviceId;
        doc.rev = (Number(doc.rev) || 0) + 1;
      }
      if (summary && typeof summary === "object") {
        doc.summary = clone(summary);
        profile.records ||= {};
        profile.records[gameId] = { ...(profile.records[gameId] || {}), ...clone(summary) };
      }
      schedule(immediate ? DELAYS.idleImportant : DELAYS.idle);
    }

    // --- API ------------------------------------------------------------------------
    const api = Object.freeze({
      ready,
      isReady: () => isReadyFlag,
      status: () => status,
      onStatus(listener) {
        statusListeners.add(listener);
        listener(status);
        return () => statusListeners.delete(listener);
      },
      onConflict(listener) {
        conflictListeners.add(listener);
        return () => conflictListeners.delete(listener);
      },
      onProfileReload,
      offlineReason: () => fallbackReason,
      backendKind: () => backend?.kind || null,
      deviceId: () => device.deviceId,
      removedKeys: () => removedKeys.slice(),
      isUnlocked,
      unlock,
      lock,
      profile: getProfile,
      updateProfile,
      increment: incrementProfile,
      records,
      submitRun,
      topRuns,
      history,
      game,
      loadGame,
      updateGame,
      loadGameState,
      saveGameState,
      flush,
    });

    start().catch((error) => {
      setStatus("blad");
      logError("SowieCloud: start nie powiódł się", error);
    });

    return api;
  }

  const internals = {
    SDK_VERSION,
    SDK_URL,
    HASLO_GRACZA,
    SCHEMA_VERSION,
    DEVICE_KEY,
    GAME_IDS,
    PATHS,
    DELAYS,
    STARE_KLUCZE,
    STARE_PREFIKSY,
    PROFILE_COUNTERS,
    EMULATOR,
    MemoryBackend,
    createCloud,
    createFirestoreBackend,
    checkPassword,
    normalizePassword,
    diff,
    applyPatch,
    insertTop,
    trimDaily,
    trimAwards,
    cleanupOldKeys,
    isOldKey,
    normalizeProfile,
    defaultProfile,
    normalizeValue,
    dayKey,
  };

  if (typeof module === "object" && module.exports) module.exports = internals;

  // ---------------------------------------------------------------------------
  // Start w przeglądarce
  // ---------------------------------------------------------------------------

  if (typeof window === "undefined" || typeof document === "undefined") return;

  const platform = window.SowiePlatform;
  if (!platform) {
    console.error("Brak SowiePlatform. Załaduj shared/sowie-platform.js przed sowie-cloud.js.");
    return;
  }

  // Tryb: ?cloud=memory | emulator | firestore (zapamiętany w tej karcie).
  // Na localhost domyślnie pamięć — lokalne uruchomienie nigdy nie zapisuje do produkcyjnej bazy.
  function resolveMode() {
    const params = new URLSearchParams(location.search);
    let choice = null;
    const fromUrl = params.get("cloud");
    if (fromUrl) {
      choice = { mode: fromUrl, project: params.get("projekt") };
      try {
        sessionStorage.setItem(MODE_KEY, JSON.stringify(choice));
      } catch (_error) {
        // Brak sessionStorage — tryb obowiązuje tylko na tej stronie.
      }
    } else {
      try {
        choice = JSON.parse(sessionStorage.getItem(MODE_KEY) || "null");
      } catch (_error) {
        choice = null;
      }
    }
    const allowed = ["memory", "emulator", "firestore"];
    if (!choice || !allowed.includes(choice.mode)) {
      const local = ["localhost", "127.0.0.1", "[::1]", "::1"].includes(location.hostname);
      choice = { mode: local ? "memory" : "firestore", project: null };
    }
    const project =
      typeof choice.project === "string" && /^demo-[a-z0-9-]{1,50}$/.test(choice.project)
        ? choice.project
        : EMULATOR.projectId;
    return { mode: choice.mode, project };
  }

  const { mode, project } = resolveMode();
  const currentGame = platform.GAME_REGISTRY.find((entry) => location.pathname.includes(`/${entry.path}`)) || null;
  const gameKinds = Object.fromEntries(platform.GAME_REGISTRY.map((entry) => [entry.id, entry.kind]));

  // Import SDK startuje od razu, równolegle z ekranem gry (także gdy czeka ekran hasła).
  const backendPromise =
    mode === "memory"
      ? null
      : mode === "emulator"
        ? createFirestoreBackend({
            config: { apiKey: "demo-api-key", projectId: project, appId: "demo-sowiegry" },
            emulator: { host: EMULATOR.host, port: EMULATOR.port },
          })
        : window.firebaseConfig
          ? createFirestoreBackend({ config: window.firebaseConfig })
          : Promise.reject(new Error("Brak config/firebase-config.js"));
  backendPromise?.catch(() => {});

  const cloud = createCloud({
    platform,
    storage: window.localStorage,
    connect: () => (backendPromise ? backendPromise : Promise.resolve(new MemoryBackend())),
    gameId: currentGame?.id || null,
    gameKinds,
    emit: platform.emit,
    onLock: () => location.reload(),
    reload: () => location.reload(),
    isOnline: () => navigator.onLine !== false,
  });

  // Wyzwanie dnia (?daily=1) i ziarno (?seed=) trafiają do historii i rekordów dnia bez zmian w grach.
  const urlParams = new URLSearchParams(location.search);
  window.SowieCloud = Object.freeze({
    ...cloud,
    submitRun: (gameId, result = {}) =>
      cloud.submitRun(gameId, { daily: urlParams.get("daily") === "1", seed: urlParams.get("seed"), ...result }),
    mode: () => mode,
    gameId: () => currentGame?.id || null,
    helpers: Object.freeze({ trimAwards, trimDaily, dayKey }),
  });

  // Telefon: przejście do innej aplikacji / blokada ekranu — wysyłamy kolejkę od razu.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") cloud.flush();
  });
  window.addEventListener("pagehide", () => cloud.flush());
  window.addEventListener("online", () => cloud.flush());
})();
