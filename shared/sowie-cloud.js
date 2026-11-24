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
  // Wersja demo (E10) — znacznik tej karty w sessionStorage (nigdy w localStorage).
  const DEMO_KEY = "sowiegry:demo";
  const GAME_IDS = Object.freeze(["runner", "jumper", "sowa3", "ogrody", "szklarnia", "trojki"]);
  const EMULATOR = Object.freeze({ host: "127.0.0.1", port: 8080, projectId: "demo-sowiegry" });

  const PATHS = Object.freeze({
    meta: "sowiegry/meta",
    profile: "sowiegry/profil",
    game: (gameId) => `sowiegry/profil/sowiegry_gry/${gameId}`,
    history: (gameId) => `sowiegry/profil/sowiegry_gry/${gameId}/sowiegry_historia`,
    // Wypluffki (Analiza 7b, rozdz. 12): portfel gracza, prośby o doładowanie i wyciąg z konta.
    wallet: "sowiegry_wypluffki/portfel",
    walletRequests: "sowiegry_wypluffki/portfel/wypluffki_prosby",
    walletRequest: (kod) => `sowiegry_wypluffki/portfel/wypluffki_prosby/${kod}`,
    walletHistory: "sowiegry_wypluffki/portfel/wypluffki_historia",
  });

  // Sowi Bank (Analiza 7b): hasło panelu admina zaszyte w kodzie, jak hasło gracza (decyzja właściciela 2026-11-24 —
  // jeden gracz i jeden admin, bez zaawansowanych zabezpieczeń). Porównanie po trim i małych literach.
  const HASLO_ADMINA = "koziadmin";
  const WALLET_VERSION = 1;
  const BANK_LIMITS = Object.freeze({ maxSaldo: 10_000_000, maxKwota: 100_000, maxNotka: 120, maxPromo: 90 });
  // Kod prośby o doładowanie: HU-XXXX-XX bez znaków łatwych do pomylenia (0/O, 1/I) — ten sam wzór co w regułach.
  const WALLET_CODE = /^HU-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{2}$/;
  // Identyfikator rzeczy w dzienniku zakupów: „rodzaj:nazwa” (np. „skorka:zlota”).
  const WALLET_ITEM = /^[a-z0-9]+:[a-z0-9-]+$/;

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

  // Liczniki profilu: zapisywane wyłącznie przez increment(), więc sumują się poprawnie z kilku urządzeń.
  const PROFILE_COUNTERS = Object.freeze([
    "stats.leaves",
    "stats.nearMisses",
    "stats.extraLives",
    "stats.finishes",
    ...GAME_IDS.map((gameId) => `records.${gameId}.runs`),
  ]);

  // Ścieżka w bazie należy do gry spoza GAME_IDS? (bramka zapisu — Analiza 5, rozdz. 13.1a)
  const GAME_PATH = /^sowiegry\/profil\/sowiegry_gry\/([^/]+)/;
  function allowedGamePath(path) {
    const match = GAME_PATH.exec(String(path || ""));
    return !match || GAME_IDS.includes(match[1]);
  }
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

  function checkAdminPassword(value) {
    return normalizePassword(value) === HASLO_ADMINA;
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

  // Klucz rekordów i top 10 w `records.<gra>` i `top10`: sam poziom (np. „arcade”) albo — dla trybu gry z osobnymi
  // rekordami — „<tryb>-<poziom>” (np. „nieskonczony-arcade”). Tryb domyślny („kampania” albo brak) = sam poziom,
  // więc wcześniejsze rekordy zostają tam, gdzie były.
  function recordKey(difficulty = "arcade", mode = null) {
    const level = String(difficulty || "arcade");
    if (!mode || mode === "kampania") return level;
    return `${String(mode)}-${level}`;
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
    // Stroje kupione w Sowim Butiku są też w dzienniku zakupów (`shop.purchases`, klucze „outfit:<strój>”). Dziennik
    // zapisuje się po jednym kluczu, więc nie gubi wpisów, a tablica `cosmetics.unlocked` zapisuje się w całości —
    // zapis ze strony ze starszym profilem mógł z niej usunąć zakup (uwaga G3). Suma przywraca takie stroje.
    const purchases = isPlainObject(input.shop?.purchases) ? Object.keys(input.shop.purchases) : [];
    const bought = purchases.filter((key) => key.startsWith("outfit:")).map((key) => key.slice("outfit:".length));
    result.cosmetics = {
      unlocked: Array.from(new Set([...base.cosmetics.unlocked, ...(cosmetics.unlocked || []), ...bought])).filter(
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

  // Portfel Wypluffków z bazy → stan w pamięci (Analiza 7b, rozdz. 12.1). Liczby całkowite ≥ 0, dziennik zakupów
  // jako mapa „id → { at, cena }”; nieznane pola (np. z nowszej wersji) zostają — nic nie ginie.
  function normalizeWallet(raw) {
    const input = isPlainObject(raw) ? raw : {};
    const int = (value) => Math.max(0, Math.floor(Number(value) || 0));
    const kupione = {};
    for (const [id, entry] of Object.entries(isPlainObject(input.kupione) ? input.kupione : {})) {
      kupione[id] = { at: Number(entry?.at) || 0, cena: int(entry?.cena) };
    }
    const last = isPlainObject(input.ostatnieDoladowanie) ? input.ostatnieDoladowanie : null;
    const promo = isPlainObject(input.promocja) ? input.promocja : null;
    return {
      ...input,
      schemaVersion: Number.isInteger(input.schemaVersion) ? input.schemaVersion : WALLET_VERSION,
      saldo: int(input.saldo),
      doladowano: int(input.doladowano),
      wydano: int(input.wydano),
      kupione,
      ostatnieDoladowanie: last
        ? {
            kwota: int(last.kwota),
            notka: typeof last.notka === "string" ? last.notka : "",
            kod: typeof last.kod === "string" && last.kod ? last.kod : null,
            at: Number(last.at) || 0,
          }
        : null,
      ogloszenie: typeof input.ogloszenie === "string" ? input.ogloszenie : "",
      promocja:
        promo && int(promo.procent) > 0
          ? { procent: Math.min(BANK_LIMITS.maxPromo, int(promo.procent)), do: Number(promo.do) || 0 }
          : null,
      zmieniono: Number(input.zmieniono) || 0,
    };
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

    // Transakcja (Sowi Bank): odczyt dokumentów `paths`, `compute(dokumenty)` → { ops, result } i zapis ops.
    // Transakcje idą po kolei (łańcuch obietnic), więc dwie naraz nie przeczytają tego samego salda.
    transact(paths, compute) {
      const run = async () => {
        const docs = await Promise.all(paths.map((path) => this.getDoc(path)));
        const { ops = [], result } = compute(docs);
        if (ops.length) await this.commit(ops);
        return result;
      };
      const task = (this.txChain || Promise.resolve()).then(run, run);
      this.txChain = task.catch(() => {});
      return task;
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
      // Transakcja Firestore (Sowi Bank, tylko z siecią): odczyty, potem zapisy z `compute(dokumenty)`. Przy
      // konflikcie SDK powtarza całą funkcję, dlatego `compute` jest czysta (bez skutków ubocznych).
      transact(paths, compute) {
        return fs.runTransaction(db, async (transaction) => {
          const snapshots = await Promise.all(paths.map((path) => transaction.get(ref(path))));
          const { ops = [], result } = compute(snapshots.map((entry) => (entry.exists() ? read(entry) : null)));
          for (const op of ops) {
            if (op.type === "set") transaction.set(ref(op.path), toFirestore(op.data), { merge: true });
            else if (op.type === "add") transaction.set(fs.doc(fs.collection(db, op.collection)), toFirestore(op.data));
            else if (op.type === "delete") transaction.delete(ref(op.path));
          }
          return result;
        });
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
    // Gry, które same łączą swój stan z nowszym zapisem z innego urządzenia (Sowie Trójki — „nic się nie cofa”):
    // zamiast pytania „wczytać nowszy postęp?” dostają dokument z bazy (gameId → handler(dokument)).
    const mergeHandlers = new Map();
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
    // Zapisy profilu z tej strony: wysłane i zakończone (refreshProfileFromServer: odpowiedź starsza niż zapis).
    let profileWrites = 0;
    let profileSettled = 0;
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

    // SowieGry nie kasuje niczego z localStorage (domena jest wspólna z innymi stronami). Od zadania 9.5 (2026-11-02)
    // nie ma też jednorazowego sprzątania dawnych kluczy sprzed zapisu w chmurze; pole `cleaned` z tamtych czasów
    // zostaje we wpisie urządzenia bez znaczenia (wpis jest tylko uzupełniany).
    let device = readDevice();
    writeDevice({
      unlocked: Boolean(device.unlocked),
      deviceId: typeof device.deviceId === "string" && device.deviceId ? device.deviceId : randomId(),
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

    // Profil z serwera po starcie z pamięci telefonu (zmiany z innego urządzenia). Odpowiedź przychodzi z opóźnieniem
    // (wolna sieć) i może pokazywać stan sprzed zapisu z tej strony — np. sprzed zakupu w Sowim Butiku, który już
    // poszedł do bazy. Taka odpowiedź nie może podmienić profilu (uwaga G3: zakup „cofał się” po chwili), więc
    // pomijamy ją, gdy w czasie zapytania strona zapisała profil albo zapis był jeszcze w drodze.
    async function refreshProfileFromServer() {
      const writesBefore = profileWrites;
      const unsettledBefore = profileSettled < profileWrites;
      let fresh = null;
      try {
        fresh = await backend.getDoc(PATHS.profile, "server");
      } catch (_error) {
        return;
      }
      if (!fresh || unsettledBefore || profileWrites !== writesBefore || hasLocalProfileChanges()) return;
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
          const merge = mergeHandlers.get(gameId);
          if (merge) {
            // Gra łączy zapisy sama: numer zapisu z bazy, żeby następny zapis tej strony go przewyższył.
            local.rev = remoteRev;
            try {
              merge(clone(data));
            } catch (error) {
              logError("SowieCloud: łączenie zapisu gry nie powiodło się", error);
            }
            return;
          }
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
        // Numer zapisu profilu w tej paczce (buildOps) — po zakończeniu zapisu profil przestaje być „w drodze”.
        const profileSeq = ops.some((op) => op.path === PATHS.profile) ? profileWrites : 0;
        const settle = () => {
          if (profileSeq) profileSettled = Math.max(profileSettled, profileSeq);
        };
        const task = Promise.resolve()
          .then(() => backend.commit(ops))
          .then(
            () => {
              inFlight -= 1;
              settle();
              refreshStatus();
            },
            (error) => {
              inFlight -= 1;
              settle();
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
          profileWrites += 1;
        }
      }
      profileBase = clone(profile);
      profileIncrements.clear();

      for (const [gameId, doc] of games) {
        if (unknownGames.has(gameId)) continue;
        const increments = gameIncrements.get(gameId);
        // Bramka zapisu (Analiza 5, rozdz. 13.1a): dokument gry spoza GAME_IDS (ta sama lista co w regułach
        // Firestore) zostaje w pamięci strony — baza odrzuciłaby całą paczkę, razem ze zmianami profilu.
        if (!GAME_IDS.includes(gameId)) {
          gameBases.set(gameId, clone(doc));
          increments?.clear();
          continue;
        }
        const patch = diff(gameBases.get(gameId), doc, isGameCounter);
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
      // Historia i jej przycinanie też tylko dla gier z GAME_IDS (bramka zapisu).
      ops.push(...pendingOps.splice(0).filter((op) => allowedGamePath(op.path || op.collection)));
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

    // `mode` — tryb gry z osobnymi rekordami (np. Sowie Tory: „nieskonczony”); bez trybu — rekordy poziomu jak dotąd.
    function records(gameId, difficulty, mode) {
      const entry = profile.records?.[gameId] || {};
      if (!difficulty) return entry;
      return entry[recordKey(difficulty, mode)] || {};
    }

    function topRuns(gameId, difficulty = "arcade", mode) {
      return loadGame(gameId).then((doc) => clone(doc.top10?.[recordKey(difficulty, mode)] || []));
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
      const key = recordKey(difficulty, result.mode);
      const entry = { score: Math.floor(Number(result.score) || 0), difficulty, at: now() };
      if (key !== difficulty) entry.mode = String(result.mode);
      for (const key of ["distance", "height", "leaves", "durationMs"]) {
        if (Number.isFinite(Number(result[key])) && result[key] !== null && result[key] !== undefined) {
          entry[key] = Math.floor(Number(result[key]));
        }
      }
      entry.daily = Boolean(result.daily);
      entry.seed = result.seed ?? null;

      profile.records ||= {};
      const record = (profile.records[gameId] ||= {});
      const best = (record[key] ||= {});
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
      const top = insertTop(doc.top10[key], entry, TOP_LIMIT);
      doc.top10[key] = top.list;

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

    // --- Sowi Bank: portfel Wypluffków (Analiza 7b, rozdz. 8 i 12) ---------------------------
    // Wypluffki są na niby: saldo zmienia admin w panelu `Admin/`, gra tylko wydaje. Zakupy i operacje panelu idą
    // transakcjami (tylko z siecią), prośby o doładowanie zwykłym zapisem (bez sieci czekają w kolejce SDK).
    let wallet = null;
    let walletKnown = false;
    let walletWatch = null;
    let walletLoading = null;
    const walletListeners = new Set();

    function setWallet(raw) {
      wallet = raw ? normalizeWallet(raw) : null;
      walletKnown = true;
      for (const listener of walletListeners) {
        try {
          listener(clone(wallet));
        } catch (error) {
          logError("SowieCloud: błąd odbiorcy portfela", error);
        }
      }
    }

    // Jednorazowy odczyt (pamięć telefonu, potem serwer). Nieznany portfel (np. brak reguł) zostaje „nieznany”.
    async function loadWallet() {
      await ready;
      walletLoading ||= readDoc(PATHS.wallet).then((result) => {
        walletLoading = null;
        if (result.known) setWallet(result.data);
        return clone(wallet);
      });
      return walletLoading;
    }

    // Nasłuch portfela (doładowanie od admina widać od razu). Startuje przy pierwszym odbiorcy.
    function onWallet(listener) {
      walletListeners.add(listener);
      if (walletKnown) listener(clone(wallet));
      ready.then(() => {
        if (!walletWatch && backend) {
          walletWatch = backend.subscribe(PATHS.wallet, (data, meta = {}) => {
            if (data || !meta.fromCache) setWallet(data);
          });
          if (!walletKnown) loadWallet();
        }
      });
      return () => walletListeners.delete(listener);
    }

    // Bank działa z siecią i z prawdziwą bazą (albo z pamięcią w testach — ?cloud=memory). Bez SDK — „offline”.
    function bankAvailable() {
      if (!isReadyFlag) return "laczenie";
      if (!isOnline() || fallbackReason === "sdk" || !backend?.transact) return "offline";
      return "online";
    }

    function bankFail(reason) {
      const error = new Error(`Sowi Bank: ${reason}`);
      error.bankReason = reason;
      return error;
    }

    async function bankTransaction(paths, compute) {
      await ready;
      if (bankAvailable() !== "online") return { ok: false, reason: "offline" };
      try {
        const result = await backend.transact(paths, compute);
        return { ok: true, ...(result || {}) };
      } catch (error) {
        if (error?.bankReason) return { ok: false, reason: error.bankReason };
        logError("SowieCloud: operacja Sowiego Banku nie powiodła się", error);
        return { ok: false, reason: "blad" };
      }
    }

    const toInt = (value) => Math.floor(Number(value));
    const validAmount = (value) => Number.isInteger(value) && value > 0 && value <= BANK_LIMITS.maxKwota;
    const note = (value) =>
      String(value ?? "")
        .trim()
        .slice(0, BANK_LIMITS.maxNotka);
    const historyOp = (entry) => ({
      type: "add",
      collection: PATHS.walletHistory,
      data: { ...entry, at: serverTime() },
    });
    const walletOp = (data) => ({ type: "set", path: PATHS.wallet, data: { ...data, zmieniono: serverTime() } });

    // Gracz: zakup rzeczy za Wypluffki (cenę liczy wywołujący z katalogu — shared/meta/wypluffki.js).
    function buyPremium({ id, price } = {}) {
      const cena = toInt(price);
      if (!WALLET_ITEM.test(String(id || "")) || !validAmount(cena))
        return Promise.resolve({ ok: false, reason: "unknown" });
      return bankTransaction([PATHS.wallet], ([raw]) => {
        if (!raw) throw bankFail("brak-portfela");
        const current = normalizeWallet(raw);
        if (current.kupione[id]) throw bankFail("owned");
        if (current.saldo < cena) throw bankFail("saldo");
        const saldo = current.saldo - cena;
        return {
          ops: [
            walletOp({ saldo, wydano: current.wydano + cena, kupione: { [id]: { at: serverTime(), cena } } }),
            historyOp({ zmiana: -cena, saldoPo: saldo, rodzaj: "zakup", kod: id }),
          ],
          result: { saldo, id, cena },
        };
      });
    }

    // Gracz: prośba o doładowanie („Hu-hu w kolejce”). Zwykły zapis — bez sieci czeka w kolejce SDK.
    async function requestTopUp({ kod, pakiet, kwota } = {}) {
      const amount = toInt(kwota);
      if (!WALLET_CODE.test(String(kod || "")) || typeof pakiet !== "string" || !pakiet || !validAmount(amount)) {
        return { ok: false, reason: "unknown" };
      }
      await ready;
      const data = { kod, pakiet: pakiet.slice(0, 40), kwota: amount, status: "czeka", at: serverTime() };
      commitNow([{ type: "set", path: PATHS.walletRequest(kod), data }]);
      return { ok: true, kod, pakiet: data.pakiet, kwota: amount, at: now() };
    }

    async function listRows(collection, limit) {
      await ready;
      try {
        const rows = await backend.query(collection, { orderBy: "at", direction: "desc", limit });
        return rows.map((row) => ({ ...row.data, id: row.id }));
      } catch (error) {
        console.warn("SowieCloud: nie udało się wczytać listy Sowiego Banku", error);
        return [];
      }
    }

    // --- Sowi Bank: panel admina (hasło „KoziAdmin”) ---------------------------------------------
    function isAdmin() {
      return Boolean(device.admin);
    }

    // Hasło admina odblokowuje też połączenie z bazą na tym urządzeniu (panel nie pyta o hasło gracza).
    function unlockAdmin(password) {
      if (!checkAdminPassword(password)) return false;
      writeDevice({ admin: true, unlocked: true });
      unlockResolve();
      refreshStatus();
      return true;
    }

    function lockAdmin() {
      writeDevice({ admin: false });
    }

    function adminTransaction(paths, compute) {
      if (!isAdmin()) return Promise.resolve({ ok: false, reason: "admin" });
      return bankTransaction(paths, compute);
    }

    // Założenie portfela (pierwsze wejście do panelu), opcjonalnie z prezentem powitalnym.
    function createWallet({ prezent = 0, notka = "" } = {}) {
      const amount = toInt(prezent) || 0;
      if (amount && !validAmount(amount)) return Promise.resolve({ ok: false, reason: "kwota" });
      return adminTransaction([PATHS.wallet], ([raw]) => {
        if (raw) throw bankFail("istnieje");
        const text = note(notka);
        const ops = [
          walletOp({
            schemaVersion: WALLET_VERSION,
            saldo: amount,
            doladowano: amount,
            wydano: 0,
            kupione: {},
            ogloszenie: "",
            promocja: null,
            ostatnieDoladowanie: amount ? { kwota: amount, notka: text, kod: null, at: serverTime() } : null,
            utworzono: serverTime(),
          }),
        ];
        if (amount)
          ops.push(historyOp({ zmiana: amount, saldoPo: amount, rodzaj: "doladowanie", kod: null, notka: text }));
        return { ops, result: { saldo: amount } };
      });
    }

    // Doładowanie: ręczne albo z prośby (`kod`) — prośbę da się zatwierdzić tylko raz. `bonus` — rzeczy z pakietu.
    function topUp({ kwota, notka = "", kod = null, bonus = [] } = {}) {
      const amount = toInt(kwota);
      if (!validAmount(amount)) return Promise.resolve({ ok: false, reason: "kwota" });
      if (kod && !WALLET_CODE.test(String(kod))) return Promise.resolve({ ok: false, reason: "kod" });
      const paths = kod ? [PATHS.wallet, PATHS.walletRequest(kod)] : [PATHS.wallet];
      return adminTransaction(paths, ([raw, request]) => {
        if (!raw) throw bankFail("brak-portfela");
        if (kod && !request) throw bankFail("brak-prosby");
        if (kod && request.status !== "czeka") throw bankFail("zalatwione");
        const current = normalizeWallet(raw);
        const saldo = current.saldo + amount;
        if (saldo > BANK_LIMITS.maxSaldo) throw bankFail("kwota");
        const text = note(notka);
        const data = {
          saldo,
          doladowano: current.doladowano + amount,
          ostatnieDoladowanie: { kwota: amount, notka: text, kod: kod || null, at: serverTime() },
        };
        const gifts = (Array.isArray(bonus) ? bonus : []).filter((id) => WALLET_ITEM.test(id) && !current.kupione[id]);
        if (gifts.length) data.kupione = Object.fromEntries(gifts.map((id) => [id, { at: serverTime(), cena: 0 }]));
        const ops = [
          walletOp(data),
          historyOp({ zmiana: amount, saldoPo: saldo, rodzaj: "doladowanie", kod: kod || null, notka: text }),
        ];
        if (kod) {
          ops.push({
            type: "set",
            path: PATHS.walletRequest(kod),
            data: { status: "zatwierdzone", kwotaPrzyznana: amount, notka: text, zalatwiono: serverTime() },
          });
        }
        return { ops, result: { saldo } };
      });
    }

    function rejectRequest({ kod, notka = "" } = {}) {
      if (!WALLET_CODE.test(String(kod || ""))) return Promise.resolve({ ok: false, reason: "kod" });
      return adminTransaction([PATHS.walletRequest(kod)], ([request]) => {
        if (!request) throw bankFail("brak-prosby");
        if (request.status !== "czeka") throw bankFail("zalatwione");
        return {
          ops: [
            {
              type: "set",
              path: PATHS.walletRequest(kod),
              data: { status: "odrzucone", kwotaPrzyznana: 0, notka: note(notka), zalatwiono: serverTime() },
            },
          ],
          result: {},
        };
      });
    }

    // Korekta: odjęcie Wypluffków (np. pomyłka) — saldo nie spada poniżej zera.
    function correct({ kwota, notka = "" } = {}) {
      const amount = toInt(kwota);
      if (!validAmount(amount)) return Promise.resolve({ ok: false, reason: "kwota" });
      return adminTransaction([PATHS.wallet], ([raw]) => {
        if (!raw) throw bankFail("brak-portfela");
        const current = normalizeWallet(raw);
        if (current.saldo < amount) throw bankFail("saldo");
        const saldo = current.saldo - amount;
        return {
          ops: [
            walletOp({ saldo, doladowano: Math.max(0, current.doladowano - amount) }),
            historyOp({ zmiana: -amount, saldoPo: saldo, rodzaj: "korekta", kod: null, notka: note(notka) }),
          ],
          result: { saldo },
        };
      });
    }

    // Zwrot zakupu: rzecz znika z dziennika, Wypluffki wracają.
    function refund({ id, notka = "" } = {}) {
      if (!WALLET_ITEM.test(String(id || ""))) return Promise.resolve({ ok: false, reason: "unknown" });
      return adminTransaction([PATHS.wallet], ([raw]) => {
        if (!raw) throw bankFail("brak-portfela");
        const current = normalizeWallet(raw);
        const item = current.kupione[id];
        if (!item) throw bankFail("brak");
        const saldo = current.saldo + item.cena;
        return {
          ops: [
            walletOp({ saldo, wydano: Math.max(0, current.wydano - item.cena), kupione: { [id]: deleteValue() } }),
            historyOp({ zmiana: item.cena, saldoPo: saldo, rodzaj: "zwrot", kod: id, notka: note(notka) }),
          ],
          result: { saldo, cena: item.cena },
        };
      });
    }

    // Ogłoszenie na górze Butiku i promocja procentowa na rzeczy za Wypluffki (do wybranego dnia).
    function announce({ ogloszenie = "", promocja = null } = {}) {
      const procent = toInt(promocja?.procent);
      const until = Number(promocja?.do) || 0;
      const promo =
        promocja && procent > 0 && procent <= BANK_LIMITS.maxPromo && until > 0 ? { procent, do: until } : null;
      if (promocja && !promo) return Promise.resolve({ ok: false, reason: "promocja" });
      return adminTransaction([PATHS.wallet], ([raw]) => {
        if (!raw) throw bankFail("brak-portfela");
        return { ops: [walletOp({ ogloszenie: note(ogloszenie), promocja: promo })], result: {} };
      });
    }

    const bank = Object.freeze({
      wallet: () => clone(wallet),
      known: () => walletKnown,
      load: loadWallet,
      onWallet,
      available: bankAvailable,
      buy: buyPremium,
      requestTopUp,
      requests: (limit = 20) => listRows(PATHS.walletRequests, limit),
      history: (limit = 30) => listRows(PATHS.walletHistory, limit),
      isAdmin,
      unlockAdmin,
      lockAdmin,
      create: createWallet,
      topUp,
      reject: rejectRequest,
      correct,
      refund,
      announce,
    });

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
      // Łączenie stanu gry idle z nowszym zapisem z innego urządzenia (zamiast pytania); null — wyłącza.
      setMergeHandler(gameId, handler) {
        if (typeof handler === "function") mergeHandlers.set(gameId, handler);
        else mergeHandlers.delete(gameId);
      },
      onProfileReload,
      offlineReason: () => fallbackReason,
      backendKind: () => backend?.kind || null,
      deviceId: () => device.deviceId,
      // Ustawienia tylko tego urządzenia (np. „Płynność” — Analiza 6, W1): we wpisie urządzenia obok odblokowania
      // hasłem, nigdy w bazie (profil jest wspólny dla wszystkich urządzeń, a każde ma inną moc).
      devicePrefs: () => clone(isPlainObject(device.prefs) ? device.prefs : {}),
      setDevicePrefs(patch = {}) {
        if (!isPlainObject(patch)) return;
        writeDevice({ prefs: { ...(isPlainObject(device.prefs) ? device.prefs : {}), ...clone(patch) } });
      },
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
      bank,
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
    HASLO_ADMINA,
    WALLET_VERSION,
    BANK_LIMITS,
    WALLET_CODE,
    WALLET_ITEM,
    SCHEMA_VERSION,
    DEVICE_KEY,
    GAME_IDS,
    PATHS,
    DELAYS,
    PROFILE_COUNTERS,
    EMULATOR,
    MemoryBackend,
    createCloud,
    createFirestoreBackend,
    checkPassword,
    checkAdminPassword,
    normalizePassword,
    normalizeWallet,
    diff,
    applyPatch,
    insertTop,
    recordKey,
    trimDaily,
    trimAwards,
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

  // Wersja demo (E10, uwaga właściciela G2): strona demo.html (`<html data-sowie-demo>`) albo `?demo=1` włącza ją
  // w tej karcie, `?demo=0` wyłącza. W demo postęp jest tylko w pamięci strony (MemoryBackend, bez hasła, bez
  // Firestore i bez localStorage), nie ma Akademii, Butiku ani Galerii, a wejście do menu głównego (np. „Menu”
  // w grze) prowadzi do demo.html.
  function resolveDemo() {
    const page = document.documentElement.hasAttribute("data-sowie-demo");
    const value = new URLSearchParams(location.search).get("demo");
    try {
      if (page || value === "1") sessionStorage.setItem(DEMO_KEY, "1");
      else if (value === "0") sessionStorage.removeItem(DEMO_KEY);
      return page || sessionStorage.getItem(DEMO_KEY) === "1";
    } catch (_error) {
      return page || value === "1";
    }
  }

  const demo = resolveDemo();
  // Katalog strony (folder z index.html) z adresu tego skryptu: shared/sowie-cloud.js → katalog nadrzędny.
  const siteRoot = new URL("../", document.currentScript?.src || location.href);
  if (demo) {
    document.documentElement.classList.add("sowie-demo");
    const page = new URL(location.pathname, location.origin).href;
    if (page === siteRoot.href || page === new URL("index.html", siteRoot).href) {
      location.replace(new URL("demo.html", siteRoot).href);
    }
  }

  // Pamięć „urządzenia” w demo: odblokowane, nic nie trafia do localStorage.
  function demoStorage() {
    const items = new Map([[DEVICE_KEY, JSON.stringify({ unlocked: true, deviceId: "demo" })]]);
    return {
      get length() {
        return items.size;
      },
      key: (index) => [...items.keys()][index] ?? null,
      getItem: (key) => (items.has(key) ? items.get(key) : null),
      setItem: (key, value) => items.set(key, String(value)),
      removeItem: (key) => items.delete(key),
    };
  }

  // Tryb: ?cloud=memory | emulator | firestore (zapamiętany w tej karcie); w demo zawsze pamięć.
  // Na localhost domyślnie pamięć — lokalne uruchomienie nigdy nie zapisuje do produkcyjnej bazy.
  function resolveMode() {
    if (demo) return { mode: "memory", project: EMULATOR.projectId };
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
  // Bieżąca gra po folderze strony — także wersja podglądowa (preview.path) z tym samym identyfikatorem.
  const currentGame =
    platform.GAME_REGISTRY.find((entry) =>
      [entry.path, entry.preview?.path].some((path) => path && location.pathname.includes(`/${path}`)),
    ) || null;
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
    storage: demo ? demoStorage() : window.localStorage,
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
    demo,
    gameId: () => currentGame?.id || null,
    helpers: Object.freeze({ trimAwards, trimDaily, dayKey, recordKey }),
  });

  // Telefon: przejście do innej aplikacji / blokada ekranu — wysyłamy kolejkę od razu.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") cloud.flush();
  });
  window.addEventListener("pagehide", () => cloud.flush());
  window.addEventListener("online", () => cloud.flush());
})();
