// Płynność (Analiza 6, W0–W1): ogranicznik klatek (ekrany 60/90/120/144 Hz), automat płynności (poziomy ostrości,
// schodzenie i powrót, tryby), pamięć wyboru na urządzeniu (SowieCloud.devicePrefs), licznik `?perf=1` i pętla
// z limitem 60 klatek/s oraz 30 krokami nadrabiania.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { createLoop } from "../../shared/engine/loop.js";
import { createPerfMeter, perfEnabled } from "../../shared/engine/perf-meter.js";
import {
  AUTO_MAX_LEVEL,
  QUALITY_LEVELS,
  createFrameLimiter,
  createQuality,
  deviceQualityStore,
} from "../../shared/engine/quality.js";

const require = createRequire(import.meta.url);
const { MemoryBackend, createCloud, DEVICE_KEY } = require("../../shared/sowie-cloud.js");

// Ile klatek narysuje ogranicznik w ciągu `seconds` przy ekranie `hz` (z drganiem czasu klatki ±`jitter` ms).
function rendered(limiter, hz, seconds = 2, jitter = 0) {
  let count = 0;
  const frames = Math.round(hz * seconds);
  for (let index = 0; index < frames; index += 1) {
    const wobble = jitter ? (index % 2 ? jitter : -jitter) / 1000 : 0;
    if (limiter.tick(1 / hz + wobble)) count += 1;
  }
  return count / seconds;
}

test("ogranicznik klatek: najwyżej 60 na sekundę przy ekranach 60, 90, 120 i 144 Hz, 30 w oszczędzaniu", () => {
  assert.equal(rendered(createFrameLimiter(60), 60), 60, "60 Hz — każda klatka");
  assert.equal(rendered(createFrameLimiter(60), 60, 2, 0.4), 60, "60 Hz z drganiem czasu — dalej każda klatka");
  // Pierwsza klatka po starcie zawsze rysowana — stąd ±1 klatka na 2 s.
  assert.ok(Math.abs(rendered(createFrameLimiter(60), 120) - 60) <= 0.5, "120 Hz — co druga");
  assert.ok(Math.abs(rendered(createFrameLimiter(60), 90) - 60) <= 1, "90 Hz — dwie z trzech");
  assert.ok(Math.abs(rendered(createFrameLimiter(60), 144) - 60) <= 2, "144 Hz");
  assert.ok(Math.abs(rendered(createFrameLimiter(30), 60) - 30) <= 0.5, "oszczędzanie — 30");
  assert.ok(Math.abs(rendered(createFrameLimiter(30), 120) - 30) <= 0.5, "oszczędzanie przy 120 Hz — 30");
  // Wolny telefon (20 kl./s) — rysuje każdą klatkę, którą dostaje, bez „nadrabiania” seriami.
  const slow = createFrameLimiter(60);
  assert.equal(rendered(slow, 20), 20);
  const limiter = createFrameLimiter(60);
  limiter.setRate(30);
  assert.equal(limiter.rate(), 30);
  limiter.reset();
  assert.equal(limiter.tick(0.001), true, "po reset() pierwsza klatka zawsze rysowana");
});

function memoryStore(initial = {}, legacy = false) {
  const writes = [];
  let value = { ...initial };
  return {
    writes,
    get: () => ({ ...value }),
    set(next) {
      value = { ...next };
      writes.push({ ...next });
    },
    legacySaver: () => legacy,
  };
}

// `fps` klatek na sekundę przez `seconds` sekund.
function feed(quality, fps, seconds) {
  for (let index = 0; index < Math.round(fps * seconds); index += 1) quality.sample(1 / fps);
}

test("automat płynności: po 3 s poniżej 50 kl./s schodzi poziom niżej, najwyżej do poziomu 2", () => {
  const store = memoryStore();
  const quality = createQuality({ store });
  const changes = [];
  quality.onChange((change) => changes.push(change));
  assert.equal(quality.mode(), "auto");
  assert.equal(quality.level(), 0);
  assert.equal(quality.dpr(2.75), 2, "ostrość 2 na ekranie 2,75 (Redmi Note 10 Pro)");
  feed(quality, 40, 2.5);
  assert.equal(quality.level(), 0, "2,5 s to za mało");
  feed(quality, 40, 1);
  assert.equal(quality.level(), 1);
  assert.equal(quality.dpr(2.75), 1.5);
  feed(quality, 40, 3.2);
  assert.equal(quality.level(), 2);
  assert.equal(quality.dpr(2.75), 1);
  assert.equal(quality.particleScale(), 0.5);
  assert.equal(quality.canLower(), false);
  feed(quality, 30, 10);
  assert.equal(quality.level(), AUTO_MAX_LEVEL, "sam nie schodzi do 30 kl./s");
  assert.equal(quality.fps(), 60);
  assert.deepEqual(
    changes.map((change) => [change.level, change.reason]),
    [
      [1, "slow"],
      [2, "slow"],
    ],
  );
  assert.deepEqual(store.get(), { mode: "auto", level: 2 }, "poziom zapamiętany na urządzeniu");
});

test("automat płynności: wraca poziom wyżej po 20 s ≥ 58 kl./s, najwyżej raz na minutę; przerwy się nie liczą", () => {
  // Start od zapamiętanego poziomu; licznik czasu od zmiany startuje z zapasem (minuta), więc po 20 s szybkich
  // klatek pierwszy powrót jest dozwolony od razu.
  const fresh = createQuality({ store: memoryStore({ mode: "auto", level: 2 }) });
  assert.equal(fresh.level(), 2, "start od zapamiętanego poziomu");
  feed(fresh, 60, 19);
  assert.equal(fresh.level(), 2, "19 s to za mało");
  feed(fresh, 60, 2);
  assert.equal(fresh.level(), 1);
  feed(fresh, 60, 25);
  assert.equal(fresh.level(), 1, "kolejny powrót dopiero po minucie od zmiany");
  feed(fresh, 60, 40);
  assert.equal(fresh.level(), 0);
  // Celowe 30 klatek/s w spokoju (cel 30) to nie spowolnienie; 20 z celu 30 — już tak.
  const idle = createQuality({ store: memoryStore() });
  for (let index = 0; index < 30 * 10; index += 1) idle.sample(1 / 30, 30);
  assert.equal(idle.level(), 0, "30 z 30 — w porządku");
  for (let index = 0; index < 20 * 4; index += 1) idle.sample(1 / 20, 30);
  assert.equal(idle.level(), 1, "20 z 30 — za wolno");
  // Długie przerwy (karta w tle) nie są pomiarem.
  const paused = createQuality({ store: memoryStore() });
  for (let index = 0; index < 20; index += 1) paused.sample(2);
  assert.equal(paused.level(), 0);
});

test("tryby: „Zawsze ostro” i „Oszczędzanie baterii”; dawne ustawienie profilu; pamięć na urządzeniu", () => {
  const store = memoryStore();
  const quality = createQuality({ store });
  assert.equal(quality.setMode("saver"), true);
  assert.deepEqual(quality.settings(), QUALITY_LEVELS[3]);
  assert.equal(quality.fps(), 30);
  feed(quality, 20, 10);
  assert.equal(quality.level(), 3, "w oszczędzaniu automat nie działa");
  quality.setMode("sharp");
  assert.equal(quality.level(), 0);
  assert.equal(quality.dpr(3), 2);
  feed(quality, 20, 10);
  assert.equal(quality.level(), 0, "„Zawsze ostro” — bez schodzenia");
  quality.setMode("auto");
  assert.equal(quality.level(), 0);
  assert.equal(quality.setMode("nieznany"), false);
  assert.deepEqual(store.get(), { mode: "auto", level: 0 });
  // Urządzenie bez własnego wyboru, a w profilu dawne „Oszczędzanie baterii” — tryb oszczędzania.
  assert.equal(createQuality({ store: memoryStore({}, true) }).mode(), "saver");
  // Własny wybór urządzenia wygrywa z profilem.
  assert.equal(createQuality({ store: memoryStore({ mode: "sharp" }, true) }).mode(), "sharp");
  // Ekran o gęstości 1 — ostrość nigdy poniżej 1.
  assert.equal(createQuality({ store: memoryStore() }).dpr(1), 1);
});

test("propozycja „Oszczędzania baterii” (W6): gdy automat zszedł najniżej albo „Zawsze ostro” i dalej < 45 kl./s przez 5 s", () => {
  const quality = createQuality({ store: memoryStore() });
  const calls = [];
  quality.onStruggle((detail) => calls.push(detail));
  feed(quality, 30, 6.2);
  assert.equal(quality.level(), 2, "najpierw automat schodzi (3 s + 3 s)");
  assert.equal(calls.length, 0, "na poziomach 0 i 1 bez propozycji");
  feed(quality, 30, 4.5);
  assert.equal(calls.length, 0, "4 s na najniższym poziomie to za mało");
  feed(quality, 30, 1.5);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].mode, "auto");
  assert.equal(calls[0].level, 2);
  feed(quality, 30, 20);
  assert.equal(calls.length, 1, "tylko raz");
  // 47 kl./s: dość wolno, żeby automat schodził (< 50), ale za mało na propozycję (< 45).
  const mild = createQuality({ store: memoryStore({ mode: "auto", level: 2 }) });
  let mildCalls = 0;
  mild.onStruggle(() => (mildCalls += 1));
  feed(mild, 47, 10);
  assert.equal(mildCalls, 0);
  // „Zawsze ostro”: propozycja po 5 s; w „Oszczędzaniu baterii” nigdy; po zmianie trybu może paść znowu.
  const sharp = createQuality({ store: memoryStore(), mode: "sharp" });
  let sharpCalls = 0;
  const off = sharp.onStruggle(() => (sharpCalls += 1));
  feed(sharp, 30, 5.5);
  assert.equal(sharpCalls, 1);
  sharp.setMode("saver");
  feed(sharp, 20, 10);
  assert.equal(sharpCalls, 1, "w oszczędzaniu bez propozycji");
  sharp.setMode("sharp");
  feed(sharp, 30, 5.5);
  assert.equal(sharpCalls, 2, "po zmianie trybu znowu");
  off();
  sharp.setMode("auto");
  sharp.setMode("sharp");
  feed(sharp, 30, 6);
  assert.equal(sharpCalls, 2, "po odpięciu słuchacza cisza");
});

test("SowieCloud: ustawienia urządzenia we wpisie urządzenia, nigdy w bazie; automat korzysta z nich", async () => {
  const map = new Map([[DEVICE_KEY, JSON.stringify({ unlocked: true, deviceId: "d-test01" })]]);
  const storage = {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
  const backend = new MemoryBackend();
  const cloud = createCloud({
    platform: {
      GAME_REGISTRY: [],
      COSMETICS: { none: {} },
      DEFAULT_SETTINGS: { batterySaver: false },
      DEFAULT_MISSIONS: {},
      DEFAULT_STATS: {},
    },
    storage,
    connect: async () => backend,
    gameKinds: {},
  });
  await cloud.ready;
  assert.deepEqual(cloud.devicePrefs(), {});
  const store = deviceQualityStore(cloud);
  const quality = createQuality({ store });
  quality.setMode("sharp");
  assert.deepEqual(cloud.devicePrefs(), { quality: { mode: "sharp", level: 0 } });
  const device = JSON.parse(map.get(DEVICE_KEY));
  assert.equal(device.unlocked, true, "odblokowanie urządzenia zostaje");
  assert.equal(device.deviceId, "d-test01");
  assert.deepEqual(device.prefs, { quality: { mode: "sharp", level: 0 } });
  cloud.setDevicePrefs({ inne: 1 });
  assert.deepEqual(cloud.devicePrefs(), { quality: { mode: "sharp", level: 0 }, inne: 1 }, "dopisuje, nie kasuje");
  await cloud.flush();
  assert.equal(
    backend.commits.flat().some((op) => JSON.stringify(op).includes("quality")),
    false,
    "nic nie trafia do bazy",
  );
  // Nowe wejście na tym samym urządzeniu pamięta wybór.
  assert.equal(createQuality({ store: deviceQualityStore(cloud) }).mode(), "sharp");
});

test("licznik ?perf=1: bez parametru nic nie robi, z parametrem liczy klatki gry i ekranu", () => {
  assert.equal(perfEnabled("?perf=1"), true);
  assert.equal(perfEnabled("?cloud=memory"), false);
  const off = createPerfMeter({ enabled: false });
  assert.equal(off.enabled, false);
  off.frame();
  assert.equal(off.stats(), null);

  let time = 0;
  const callbacks = [];
  const meter = createPerfMeter({
    enabled: true,
    now: () => time,
    raf: (callback) => callbacks.push(callback),
    caf: () => {},
    root: null,
  });
  // Ekran 120 Hz, gra rysuje co drugą klatkę; jedna klatka gry spóźniona (50 ms).
  for (let index = 0; index < 120; index += 1) {
    time += 1000 / 120;
    if (index === 60) time += 50;
    if (index % 2 === 0) meter.frame();
    callbacks.shift()?.();
  }
  const stats = meter.stats();
  assert.ok(stats.rafRate > 100, `ekran: ${stats.rafRate}`);
  assert.ok(stats.fps > 45 && stats.fps < 65, `gra: ${stats.fps}`);
  assert.ok(stats.longestMs >= 50, `najdłuższa: ${stats.longestMs}`);
  meter.destroy();
});

test("pętla: rysuje najwyżej 60 razy na sekundę przy 120 Hz i nadrabia do 0,25 s czasu gry", () => {
  let renders = 0;
  let steps = 0;
  const loop = createLoop({ update: () => (steps += 1), render: () => (renders += 1), raf: () => 0, caf: () => {} });
  let time = 0;
  loop.tick(time);
  for (let frame = 0; frame < 240; frame += 1) loop.tick((time += 1000 / 120));
  assert.ok(Math.abs(renders - 1 - 120) <= 1, `klatek rysowanych przy 120 Hz przez 2 s: ${renders - 1}`);
  assert.ok(Math.abs(steps - 1 - 240) <= 1, `symulacja bez zmian: ${steps}`);
  assert.equal(loop.renderRate(), 60);
  // Klatka 200 ms (bardzo wolny telefon) — czas gry nie ginie (dawniej najwyżej 0,1 s na klatkę).
  const before = steps;
  loop.tick((time += 200));
  assert.equal(steps - before, 24);
});
