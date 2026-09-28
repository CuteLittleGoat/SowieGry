import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const cloudModule = require("../../shared/sowie-cloud.js");
const {
  MemoryBackend,
  createCloud,
  checkPassword,
  cleanupOldKeys,
  diff,
  applyPatch,
  insertTop,
  trimDaily,
  trimAwards,
  PATHS,
  DEVICE_KEY,
} = cloudModule;

const platform = {
  GAME_REGISTRY: [
    { id: "runner", kind: "arcade", dailyMetric: "distance" },
    { id: "jumper", kind: "arcade", dailyMetric: "height" },
    { id: "sowa3", kind: "arcade", dailyMetric: "score" },
    { id: "ogrody", kind: "idle" },
    { id: "szklarnia", kind: "idle" },
  ],
  COSMETICS: { none: {}, bow: {}, glasses: {} },
  DEFAULT_SETTINGS: { music: true, sfx: true, quips: true, reducedEffects: false },
  DEFAULT_MISSIONS: { leaves20: { progress: 0, target: 20, done: false, reward: "glasses" } },
  DEFAULT_STATS: { leaves: 0, nearMisses: 0, extraLives: 0, finishes: 0, maxCombo: 1 },
};
const gameKinds = { runner: "arcade", jumper: "arcade", sowa3: "arcade", ogrody: "idle", szklarnia: "idle" };

const tick = () => new Promise((resolve) => setImmediate(resolve));

function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    get length() {
      return map.size;
    },
    key: (index) => [...map.keys()][index] ?? null,
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

function fakeClock(start = Date.UTC(2026, 8, 27, 10, 0, 0)) {
  let current = start;
  let sequence = 0;
  const tasks = new Map();
  return {
    now: () => current,
    timers: {
      setTimeout(fn, ms) {
        sequence += 1;
        tasks.set(sequence, { at: current + Math.max(0, ms), fn });
        return sequence;
      },
      clearTimeout(id) {
        tasks.delete(id);
      },
    },
    async advance(ms) {
      const end = current + ms;
      for (;;) {
        const next = [...tasks.entries()].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > end) break;
        tasks.delete(next[0]);
        current = next[1].at;
        next[1].fn();
        await tick();
      }
      current = end;
      await tick();
    },
  };
}

function unlockedStorage(extra = {}) {
  return fakeStorage({
    [DEVICE_KEY]: JSON.stringify({ unlocked: true, deviceId: "d-test01", cleaned: true }),
    ...extra,
  });
}

function makeCloud({ backend, storage = unlockedStorage(), clock = fakeClock(), gameId = null, ...rest } = {}) {
  const shared = backend || new MemoryBackend({ now: clock.now });
  const cloud = createCloud({
    platform,
    storage,
    connect: async () => shared,
    gameId,
    gameKinds,
    now: clock.now,
    timers: clock.timers,
    logError: (...args) => {
      throw new Error(args.map(String).join(" "));
    },
    ...rest,
  });
  return { cloud, backend: shared, storage, clock };
}

test("hasło: bez wielkości liter i spacji na końcach, ale spacja w środku jest błędem", () => {
  for (const ok of ["huhu", " Huhu ", "HUHU", "\thuHU\n"]) assert.equal(checkPassword(ok), true, ok);
  for (const bad of ["hu hu", "", "huhu!", "huh", null, undefined])
    assert.equal(checkPassword(bad), false, String(bad));
});

test("sprzątanie kasuje wyłącznie klucze i prefiksy SowieGry z listy", () => {
  const storage = fakeStorage({
    sowieGryProfile: "{}",
    sowieGryAcademy: "{}",
    sowieOwlGallery: "{}",
    sowaRunnerBestScore: "10",
    sowa3FinishSeen: "1",
    sowieOgrodySave: "{}",
    sowieSzklarniaTraitAlbum: "{}",
    "sowieGryBackup:sowieGryProfile:v1": "{}",
    "sowieExpansion:ogrody:2026-09-27": "{}",
    "sowieDailyBest:2026-09-27:runner:distance": "5",
    dataslate: "inny projekt",
    "character_builder:postac": "inny projekt",
    audioFavorites: "inny projekt",
    sowieNiezwiazany: "nie ma go na liście",
  });
  const removed = cleanupOldKeys(storage);
  assert.equal(removed.length, 10);
  assert.deepEqual([...storage.map.keys()].sort(), [
    "audioFavorites",
    "character_builder:postac",
    "dataslate",
    "sowieNiezwiazany",
  ]);
});

test("pierwsze uruchomienie: ekran hasła, potem meta i profil w bazie, w pamięci zostaje tylko klucz urządzenia", async () => {
  const storage = fakeStorage({
    sowieGryProfile: "{}",
    sowa3Best: "12",
    "sowieDailyBest:x": "1",
    dataslate: "zostaje",
  });
  const { cloud, backend } = makeCloud({ storage });
  assert.equal(cloud.status(), "haslo");
  assert.equal(cloud.isUnlocked(), false);
  assert.deepEqual([...storage.map.keys()].sort(), [DEVICE_KEY, "dataslate"].sort());

  let readyNow = false;
  cloud.ready.then(() => {
    readyNow = true;
  });
  await tick();
  assert.equal(readyNow, false, "bez hasła gra nie startuje");

  assert.equal(cloud.unlock("hu hu"), false);
  assert.equal(cloud.unlock(" HuHu "), true);
  await cloud.ready;
  await tick();

  const deviceEntry = JSON.parse(storage.getItem(DEVICE_KEY));
  assert.equal(deviceEntry.unlocked, true);
  assert.equal(deviceEntry.cleaned, true);
  assert.match(deviceEntry.deviceId, /^d-[0-9a-z]{6}$/);

  const meta = await backend.getDoc(PATHS.meta);
  assert.equal(meta.schemaVersion, 1);
  assert.deepEqual(meta.games, ["runner", "jumper", "sowa3", "ogrody", "szklarnia"]);
  const profile = await backend.getDoc(PATHS.profile);
  assert.equal(profile.schemaVersion, 1);
  assert.equal(profile.name, "Sowa");
  assert.deepEqual(profile.cosmetics, { unlocked: ["none", "bow"], selected: "none" });
  assert.ok(Object.keys(profile).length <= 30, "reguły: profil ma najwyżej 30 pól");
});

test("drugie uruchomienie nie zapisuje meta ani profilu ponownie", async () => {
  const backend = new MemoryBackend();
  const first = makeCloud({ backend });
  await first.cloud.ready;
  await tick();
  const commitsAfterFirst = backend.commits.length;
  const second = makeCloud({ backend });
  await second.cloud.ready;
  await tick();
  assert.equal(backend.commits.length, commitsAfterFirst);
});

test("submitRun: rekordy per poziom, top 10, licznik rozgrywek, historia i rekord dnia w jednym zapisie", async () => {
  const { cloud, backend, clock } = makeCloud({ gameId: "runner" });
  await cloud.ready;
  await tick();
  const before = backend.commits.length;

  const first = cloud.submitRun("runner", { score: 500, distance: 120, leaves: 9, difficulty: "arcade", daily: true });
  await tick();
  assert.equal(backend.commits.length, before + 1, "jeden zapis zbiorczy na rozgrywkę");
  assert.equal(first.newRecord, true);
  assert.equal(first.place, 1);

  const second = cloud.submitRun("runner", { score: 300, distance: 200, difficulty: "arcade", daily: true });
  await tick();
  assert.equal(second.newRecord, false);
  assert.equal(second.place, 2);
  cloud.submitRun("runner", { score: 900, distance: 50, difficulty: "chaos" });
  await tick();

  assert.deepEqual(cloud.records("runner", "arcade"), { bestScore: 500, bestDistance: 200 });
  assert.deepEqual(cloud.records("runner", "chaos"), { bestScore: 900, bestDistance: 50 });

  const profile = await backend.getDoc(PATHS.profile);
  assert.equal(profile.records.runner.runs, 3);
  assert.equal(profile.records.runner.arcade.bestScore, 500);
  const gameDoc = await backend.getDoc(PATHS.game("runner"));
  assert.deepEqual(
    gameDoc.top10.arcade.map((row) => row.score),
    [500, 300],
  );
  const today = new Date(clock.now()).toISOString().slice(0, 10);
  assert.deepEqual(gameDoc.dailyBest, { [today]: 200 }, "rekord dnia Runnera to dystans");
  const history = await cloud.history("runner", 10);
  assert.equal(history.length, 3);
  assert.ok(
    history.every((row) => typeof row.score === "number"),
    "reguły: wpis historii ma liczbowe score",
  );
  assert.deepEqual(
    (await cloud.topRuns("runner", "chaos")).map((row) => row.score),
    [900],
  );
});

test("historia jest przycinana do 50 wpisów", async () => {
  const { cloud, backend } = makeCloud({ gameId: "sowa3" });
  await cloud.ready;
  for (let index = 0; index < 75; index += 1) {
    cloud.submitRun("sowa3", { score: index, difficulty: "arcade" });
    await tick();
    await tick();
  }
  const rows = await backend.query(PATHS.history("sowa3"), { limit: 1000 });
  assert.ok(rows.length <= 60, `historia ma ${rows.length} wpisów`);
  const gameDoc = await backend.getDoc(PATHS.game("sowa3"));
  assert.equal(gameDoc.historyCount, rows.length);
  assert.equal(Math.min(...rows.map((row) => row.data.score)), 75 - rows.length, "usunięte są najstarsze");
  assert.equal(gameDoc.top10.arcade.length, 10);
});

test("liczniki sumują się z dwóch urządzeń, a rekord zapisuje się tylko przy poprawie", async () => {
  const backend = new MemoryBackend();
  const a = makeCloud({ backend });
  const b = makeCloud({
    backend,
    storage: fakeStorage({ [DEVICE_KEY]: JSON.stringify({ unlocked: true, deviceId: "d-drugi", cleaned: true }) }),
  });
  await Promise.all([a.cloud.ready, b.cloud.ready]);
  await tick();

  a.cloud.increment("stats.leaves", 3);
  b.cloud.increment("stats.leaves", 4);
  a.cloud.submitRun("jumper", { score: 100, height: 40, difficulty: "arcade" });
  b.cloud.submitRun("jumper", { score: 250, height: 90, difficulty: "arcade" });
  await tick();
  await a.cloud.flush();
  await b.cloud.flush();
  // Urządzenie A zmienia tylko ustawienie — nie może nadpisać rekordu z urządzenia B.
  a.cloud.updateProfile((profile) => {
    profile.settings.music = false;
  });
  await a.cloud.flush();

  const profile = await backend.getDoc(PATHS.profile);
  assert.equal(profile.stats.leaves, 7);
  assert.equal(profile.records.jumper.runs, 2);
  assert.equal(profile.records.jumper.arcade.bestScore, 250);
  assert.equal(profile.records.jumper.arcade.bestHeight, 90);
  assert.equal(profile.settings.music, false);
});

test("gra idle robi najwyżej 120 zapisów na godzinę, a ważna akcja zapisuje się po 2 s", async () => {
  const clock = fakeClock();
  const { cloud, backend } = makeCloud({ clock, gameId: "ogrody" });
  await cloud.ready;
  await tick();
  const path = PATHS.game("ogrody");
  const start = backend.writesTo(path);
  for (let second = 0; second < 3600; second += 1) {
    cloud.saveGameState("ogrody", { version: 2, leaves: second }, { summary: { lifetimeLeaves: second } });
    if (second % 3 === 0) cloud.updateProfile((profile) => (profile.academy.xp = second));
    await clock.advance(1000);
  }
  const writes = backend.writesTo(path) - start;
  assert.ok(writes <= 120, `${writes} zapisów w godzinę`);
  assert.ok(writes >= 100, `${writes} zapisów — postęp powinien zapisywać się regularnie`);

  const beforeImportant = backend.writesTo(path);
  cloud.saveGameState("ogrody", { version: 2, leaves: -1 }, { immediate: true });
  await clock.advance(1999);
  assert.equal(backend.writesTo(path), beforeImportant);
  await clock.advance(1);
  assert.equal(backend.writesTo(path), beforeImportant + 1);

  const doc = await backend.getDoc(path);
  assert.deepEqual(JSON.parse(doc.state), { version: 2, leaves: -1 });
  assert.equal(doc.saveVersion, 2);
  assert.equal(doc.deviceId, "d-test01");
  assert.ok(doc.rev > 100);
  assert.deepEqual(await cloud.loadGameState("ogrody"), { version: 2, leaves: -1 });
  const profile = await backend.getDoc(PATHS.profile);
  assert.equal(profile.records.ogrody.lifetimeLeaves, 3599);
});

test("flush wysyła kolejkę od razu (przejście aplikacji w tło)", async () => {
  const { cloud, backend } = makeCloud();
  await cloud.ready;
  await tick();
  cloud.updateProfile((profile) => {
    profile.missions.leaves20.progress = 7;
  });
  assert.equal((await backend.getDoc(PATHS.profile)).missions.leaves20.progress, 0);
  await cloud.flush();
  assert.equal((await backend.getDoc(PATHS.profile)).missions.leaves20.progress, 7);
});

test("zmiany sprzed startu są stosowane do wczytanego profilu, a nie do wartości domyślnych", async () => {
  const backend = new MemoryBackend();
  await backend.commit([
    {
      type: "set",
      path: PATHS.profile,
      data: { schemaVersion: 1, academy: { xp: 500, feathers: 9, metrics: {}, daily: null, weekly: null, awards: {} } },
    },
  ]);
  const { cloud } = makeCloud({ backend });
  cloud.updateProfile((profile) => {
    profile.academy.feathers += 1;
  });
  cloud.increment("stats.leaves", 2);
  await cloud.ready;
  await cloud.flush();
  const saved = await backend.getDoc(PATHS.profile);
  assert.equal(saved.academy.xp, 500);
  assert.equal(saved.academy.feathers, 10);
  assert.equal(saved.stats.leaves, 2);
});

test("nowszy stan gry idle z innego urządzenia wywołuje pytanie o wczytanie", async () => {
  const backend = new MemoryBackend();
  const a = makeCloud({ backend, gameId: "szklarnia" });
  const b = makeCloud({
    backend,
    gameId: "szklarnia",
    storage: fakeStorage({ [DEVICE_KEY]: JSON.stringify({ unlocked: true, deviceId: "d-drugi", cleaned: true }) }),
  });
  await Promise.all([a.cloud.ready, b.cloud.ready]);
  const seen = [];
  const seenByA = [];
  b.cloud.onConflict((conflict) => seen.push(conflict));
  a.cloud.onConflict((conflict) => seenByA.push(conflict));
  a.cloud.saveGameState("szklarnia", { version: 1, leaves: 5 }, { immediate: true });
  await a.cloud.flush();
  assert.equal(seenByA.length, 0, "własny zapis nie jest konfliktem");
  assert.equal(seen.length, 1);
  assert.equal(seen[0].gameId, "szklarnia");
  assert.equal(seen[0].rev, 1);
  seen[0].decide(false);
  b.cloud.saveGameState("szklarnia", { version: 1, leaves: 6 });
  await b.cloud.flush();
  assert.equal((await backend.getDoc(PATHS.game("szklarnia"))).rev, 2, "po odmowie zapis nadpisuje nowszą wersję");
  assert.equal(seenByA.length, 1, "teraz to urządzenie A widzi nowszy stan z B");
});

test("lock() zapisuje kolejkę i wylogowuje urządzenie", async () => {
  let locked = 0;
  const { cloud, storage, backend } = makeCloud({ onLock: () => (locked += 1) });
  await cloud.ready;
  cloud.updateProfile((profile) => (profile.settings.sfx = false));
  await cloud.lock();
  assert.equal(locked, 1);
  assert.equal(JSON.parse(storage.getItem(DEVICE_KEY)).unlocked, false);
  assert.equal((await backend.getDoc(PATHS.profile)).settings.sfx, false);
});

test("różnica i scalanie: diff + applyPatch odtwarzają stan, liczniki są pomijane", () => {
  const before = { a: 1, nested: { keep: true, drop: 2, list: [1, 2] }, stats: { leaves: 5 }, old: "x" };
  const after = { a: 2, nested: { keep: true, list: [1, 2, 3], added: { deep: "y" } }, stats: { leaves: 9 } };
  const patch = diff(before, after, (path) => path === "stats.leaves");
  assert.deepEqual(Object.keys(patch).sort(), ["a", "nested", "old"]);
  const applied = applyPatch(JSON.parse(JSON.stringify(before)), patch);
  assert.deepEqual(applied, { ...after, stats: { leaves: 5 } });
  assert.equal(diff(after, JSON.parse(JSON.stringify(after))), null);
});

test("top 10, rekordy dnia (30 dni) i nagrody dzienne (30 dni) są przycinane", () => {
  let list = [];
  for (let score = 1; score <= 12; score += 1) list = insertTop(list, { score }).list;
  assert.deepEqual(
    list.map((row) => row.score),
    [12, 11, 10, 9, 8, 7, 6, 5, 4, 3],
  );
  assert.equal(insertTop(list, { score: 2 }).place, null);
  assert.equal(insertTop(list, { score: 100 }).place, 1);

  const daily = trimDaily({ "2026-09-27": 5, "2026-08-29": 4, "2026-08-28": 3, junk: 1 }, "2026-09-27");
  assert.deepEqual(daily, { "2026-09-27": 5, "2026-08-29": 4 });

  const awards = trimAwards(
    {
      "daily:2026-09-27:runner-distance": 1,
      "daily:2026-08-01:runner-distance": 1,
      "feature:ogrody:2026-08-01:clicks": 1,
      "weekly:2026-08-03": 1,
      "trait:fast|tasty": 1,
      "gallery:complete": 1,
    },
    "2026-09-27",
  );
  assert.deepEqual(Object.keys(awards).sort(), [
    "daily:2026-09-27:runner-distance",
    "gallery:complete",
    "trait:fast|tasty",
    "weekly:2026-08-03",
  ]);
});

test("wersja SDK w kodzie jest przypięta i zgodna z pakietem używanym w testach", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(cloudModule.SDK_VERSION, "12.19.0");
  assert.equal(pkg.devDependencies.firebase, cloudModule.SDK_VERSION);
  assert.equal(cloudModule.SDK_URL, "https://www.gstatic.com/firebasejs/12.19.0");
});
