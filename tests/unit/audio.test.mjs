// Testy jednostkowe dźwięku: manifest i pliki MP3, funkcje pomocnicze silnika audio, silnik na atrapie Web Audio.
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  alignByFingerprint,
  createAudio,
  decodeFingerprint,
  DEFAULT_VOLUMES,
  findOnset,
  loopPoints,
  MAX_VOICES,
  variedRate,
  volumesFromSettings,
  volumeToGain,
} from "../../shared/engine/audio.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const audioRoot = join(root, "assets/audio");
const manifest = JSON.parse(readFileSync(join(audioRoot, "audio.json"), "utf8"));

test("manifest dźwięków: ok. 25 efektów, muzyka menu i humbaka, pliki MP3, razem poniżej 3 MB", () => {
  const sfx = Object.entries(manifest.sfx);
  assert.ok(sfx.length >= 25, `efekty: ${sfx.length}`);
  for (const name of [
    "skok",
    "lisc",
    "trafienie-pracu",
    "trafienie-amic",
    "koza-meee",
    "humbak-plusk",
    "rekord",
    "koniec-gry",
    "odliczanie",
    "klik",
    "polaczenie",
    "zakup",
  ]) {
    assert.ok(manifest.sfx[name], name);
  }
  assert.deepEqual(Object.keys(manifest.music).sort(), ["humbak", "menu"]);
  let total = 0;
  for (const [name, item] of [...sfx, ...Object.entries(manifest.music)]) {
    const path = join(audioRoot, item.file);
    assert.ok(existsSync(path), item.file);
    const data = readFileSync(path);
    assert.equal(data.length, item.bytes, `${name}: rozmiar`);
    // Nagłówek ramki MPEG (synchronizacja 11 bitów) albo znacznik ID3.
    assert.ok(
      (data[0] === 0xff && (data[1] & 0xe0) === 0xe0) || data.toString("latin1", 0, 3) === "ID3",
      `${name}: to nie MP3`,
    );
    assert.ok(item.duration > 0 && Math.abs(item.samples / manifest.sampleRate - item.duration) < 0.001, name);
    assert.ok(item.volume > 0 && item.volume <= 1, name);
    assert.match(item.label, /\S/, name);
    if (item.loop) assert.equal(decodeFingerprint(item.fingerprint).length, 4096, `${name}: odcisk pętli`);
    total += statSync(path).size;
  }
  assert.ok(manifest.music.menu.loop && manifest.music.humbak.loop && manifest.sfx.szybowanie.loop);
  assert.ok(total < 3 * 1024 * 1024, `razem ${total} B`);
  assert.match(readFileSync(join(audioRoot, "LICENSES.md"), "utf8"), /CC0/);
});

test("głośność: suwak 0–100 → wzmocnienie, ustawienia profilu i stare przełączniki", () => {
  assert.equal(volumeToGain(0), 0);
  assert.equal(volumeToGain(100), 1);
  assert.equal(volumeToGain(50), 0.25);
  assert.equal(volumeToGain(150), 1);
  assert.equal(volumeToGain(-5), 0);
  assert.deepEqual(volumesFromSettings({}), DEFAULT_VOLUMES);
  assert.deepEqual(volumesFromSettings({ volumeMaster: 30, volumeMusic: 40, volumeSfx: 101 }), {
    master: 30,
    music: 40,
    sfx: 100,
  });
  assert.deepEqual(volumesFromSettings({ music: false, sfx: false, volumeMusic: 90 }), {
    master: 80,
    music: 0,
    sfx: 0,
  });
});

test("pomocnicy: początek dźwięku, punkty pętli, wariacja wysokości ±5%", () => {
  const data = new Float32Array(100);
  data[37] = 0.5;
  assert.equal(findOnset(data, 0.02), 37);
  assert.equal(findOnset(new Float32Array(10), 0.02), 0);
  const points = loopPoints({ decodedOnset: 0.03, onset: 0.005, duration: 2, bufferDuration: 2.1 });
  assert.ok(Math.abs(points.offset - 0.025) < 1e-9 && points.loopStart === points.offset);
  assert.ok(Math.abs(points.loopEnd - 2.025) < 1e-9);
  assert.equal(loopPoints({ decodedOnset: 0.03, onset: 0, duration: 2, bufferDuration: 1.5 }).loopEnd, 1.5);
  assert.equal(loopPoints({ decodedOnset: 0, onset: 0.01, duration: 1 }).offset, 0);
  assert.equal(loopPoints({ decodedOnset: 5, onset: 0, duration: 1 }).offset, 0.2);
  assert.equal(
    variedRate(1, () => 0),
    0.95,
  );
  assert.equal(
    variedRate(1, () => 1),
    1.05,
  );
  assert.equal(
    variedRate(2, () => 0.5),
    2,
  );
});

test("odcisk pętli: dokładne przesunięcie dekodera także przy 48 kHz", () => {
  let seed = 1;
  const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const original = Float32Array.from({ length: 6000 }, (_, index) => Math.sin(index * 0.05) * 0.5 + noise() * 0.3);
  const fingerprint = Int8Array.from(original.slice(0, 4096), (value) => Math.round(value * 127));
  const base64 = Buffer.from(fingerprint.buffer).toString("base64");
  assert.deepEqual([...decodeFingerprint(base64)], [...fingerprint]);
  for (const delay of [0, 529, 1105, 1524]) {
    const decoded = new Float32Array(delay + original.length);
    decoded.set(original, delay);
    const lag = alignByFingerprint(decoded, 44100, fingerprint, 44100);
    assert.equal(Math.round(lag * 44100), delay);
  }
  // Kontekst 48 kHz: bufor przepróbkowany liniowo.
  const delay = 1105;
  const resampled = new Float32Array(Math.round(((delay + original.length) * 48000) / 44100));
  for (let index = 0; index < resampled.length; index += 1) {
    const position = (index * 44100) / 48000 - delay;
    const left = Math.floor(position);
    const fraction = position - left;
    resampled[index] = left < 0 ? 0 : (original[left] ?? 0) * (1 - fraction) + (original[left + 1] ?? 0) * fraction;
  }
  const lag = alignByFingerprint(resampled, 48000, fingerprint, 44100);
  assert.ok(Math.abs(lag * 44100 - delay) <= 2, `przesunięcie ${lag * 44100}`);
});

// ---------- atrapa Web Audio ----------

function fakeParam(value = 1) {
  return {
    value,
    ramps: [],
    cancelScheduledValues() {},
    setValueAtTime(next) {
      this.value = next;
    },
    linearRampToValueAtTime(next, time) {
      this.ramps.push([next, time]);
      this.value = next;
    },
  };
}

function fakeContext() {
  const context = {
    state: "suspended",
    currentTime: 0,
    sampleRate: 44100,
    destination: { name: "destination" },
    started: [],
    suspended: 0,
    createGain: () => ({ gain: fakeParam(1), connect() {} }),
    createStereoPanner: () => ({ pan: fakeParam(0), connect() {} }),
    createBuffer: () => ({}),
    createBufferSource() {
      const source = {
        playbackRate: fakeParam(1),
        connect() {},
        start(time, offset) {
          source.startedAt = [time, offset];
          context.started.push(source);
        },
        stop() {
          source.stopped = true;
        },
      };
      return source;
    },
    decodeAudioData(_data, resolve) {
      const buffer = { duration: 1.2, sampleRate: 44100, getChannelData: () => new Float32Array(44100) };
      resolve(buffer);
      return Promise.resolve(buffer);
    },
    resume() {
      context.state = "running";
      return Promise.resolve();
    },
    suspend() {
      context.suspended += 1;
      return Promise.resolve();
    },
  };
  return context;
}

function setup(extra = {}) {
  const context = fakeContext();
  const listeners = {};
  const doc = { visibilityState: "visible", addEventListener: (type, handler) => (listeners[type] = handler) };
  const vibrations = [];
  const nav = { vibrate: (pattern) => (vibrations.push(pattern), true), ...extra.nav };
  let fetches = 0;
  const audio = createAudio({
    manifest,
    baseUrl: "https://example.test/assets/audio/",
    createContext: () => context,
    fetchImpl: async () => {
      fetches += 1;
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };
    },
    random: () => 0.5,
    doc,
    nav,
  });
  return { audio, context, doc, listeners, vibrations, fetches: () => fetches };
}

test("silnik audio: odblokowanie, efekty z limitem głosów i odstępów, wariacja wysokości", async () => {
  const { audio, context } = setup();
  assert.equal(audio.play("skok"), null, "przed odblokowaniem cisza");
  assert.equal(audio.stats().skipped, 1);
  assert.equal(await audio.unlock(), true);
  await audio.preload();
  assert.equal(audio.state().loaded, Object.keys(manifest.sfx).length);
  const handle = audio.play("skok", { pitch: 1.5 });
  assert.ok(handle);
  assert.equal(handle.rate, 1.5);
  assert.equal(audio.play("skok"), null, "za krótki odstęp");
  context.currentTime = 1;
  assert.ok(audio.play("skok"));
  assert.throws(() => audio.play("nie-ma"), /Nieznany dźwięk/);

  // Limit głosów jednego dźwięku (lisc: 4) — najstarszy jest zatrzymywany.
  for (let index = 0; index < 6; index += 1) {
    context.currentTime += 0.1;
    audio.play("lisc");
  }
  assert.ok(audio.state().voices <= MAX_VOICES);
  assert.ok(context.started.filter((source) => source.stopped).length >= 2);
  assert.equal(audio.stats().played, 8);
});

test("silnik audio: muzyka w pętli z przenikaniem, ściszanie, suwaki, ustawienia, tło i wibracje", async () => {
  const { audio, context, doc, listeners, vibrations } = setup();
  await audio.unlock();
  assert.equal(await audio.playMusic("menu"), true);
  assert.equal(audio.currentMusic(), "menu");
  const menuSource = context.started.at(-1);
  assert.equal(menuSource.loop, true);
  assert.ok(menuSource.loopEnd > menuSource.loopStart);
  await audio.playMusic("humbak");
  assert.equal(menuSource.stopped, true, "poprzedni utwór wygaszony");
  audio.duck(0.3);
  assert.equal(audio.state().ducked, true);
  audio.unduck();
  assert.equal(audio.state().ducked, false);
  audio.stopMusic();
  assert.equal(audio.currentMusic(), null);
  await assert.rejects(audio.playMusic("disco"), /Nieznana muzyka/);

  audio.setVolume("music", 35.4);
  assert.equal(audio.volume("music"), 35);
  assert.throws(() => audio.setVolume("bas", 1));
  audio.applySettings({ volumeMaster: 50, sfx: false, vibration: false });
  assert.deepEqual(audio.state().volumes, { master: 50, music: 60, sfx: 0 });
  assert.equal(audio.play("klik"), null, "efekty wyłączone");
  assert.equal(audio.vibrate(30), false);
  audio.setVibration(true);
  assert.equal(audio.vibrate(30), true);
  assert.deepEqual(vibrations, [30]);

  doc.visibilityState = "hidden";
  listeners.visibilitychange();
  assert.equal(context.suspended, 1);
});

test("silnik audio: sesja „ambient” w Safari i brak Web Audio", async () => {
  const session = {};
  const { audio } = setup({ nav: { audioSession: session } });
  await audio.unlock();
  assert.equal(session.type, "ambient");
  assert.equal(audio.state().session, "ambient");
  const silent = createAudio({
    manifest,
    baseUrl: "https://example.test/",
    createContext: () => null,
    doc: null,
    nav: {},
  });
  assert.equal(await silent.unlock(), false);
  assert.equal(silent.canVibrate(), false);
});
