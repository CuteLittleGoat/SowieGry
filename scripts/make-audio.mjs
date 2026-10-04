// Generator dźwięków SowieGry: efekty i muzyka syntetyzowane w kodzie (własna twórczość, CC0),
// zapis do MP3 (@breezystack/lamejs) i manifestu assets/audio/audio.json.
// Uruchomienie: node scripts/make-audio.mjs (wynik jest w repozytorium; wynik jest powtarzalny — stałe ziarno).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Mp3Encoder } from "@breezystack/lamejs";

const SR = 44100;
const TAU = Math.PI * 2;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "audio");
const ONSET_THRESHOLD = 0.02;

// ---------- narzędzia ----------

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let random = mulberry32(2026);

const samples = (seconds) => Math.max(1, Math.round(seconds * SR));
const buffer = (seconds) => new Float32Array(samples(seconds));
const NOTE_INDEX = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
// Częstotliwość nuty, np. note("A4") = 440, note("C#5"), note("Bb3").
function note(name) {
  const match = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  const semitone =
    NOTE_INDEX[match[1]] + (match[2] === "#" ? 1 : match[2] === "b" ? -1 : 0) + (Number(match[3]) - 4) * 12;
  return 440 * 2 ** (semitone / 12);
}

// Obwiednia ADSR (sekundy): atak liniowy, zanik wykładniczy do podtrzymania, wybrzmienie po czasie trwania.
function envelope(t, duration, { a = 0.005, d = 0.1, s = 0.6, r = 0.1 } = {}) {
  if (t < a) return t / a;
  const held = t < duration ? s + (1 - s) * Math.exp(-(t - a) / Math.max(d, 1e-4)) : 0;
  if (t < duration) return held;
  const atEnd = s + (1 - s) * Math.exp(-(duration - a) / Math.max(d, 1e-4));
  return atEnd * Math.exp(-(t - duration) / Math.max(r, 1e-4));
}

// Oscylator o ograniczonym paśmie (suma harmonicznych do połowy częstotliwości próbkowania — bez aliasingu).
function bandLimited(wave, phase, frequency) {
  if (wave === "sine") return Math.sin(TAU * phase);
  const limit = Math.min(40, Math.floor(SR / 2 / Math.max(frequency, 1)));
  let value = 0;
  for (let n = 1; n <= limit; n += 1) {
    if (wave === "square") {
      if (n % 2) value += Math.sin(TAU * phase * n) / n;
    } else if (wave === "saw") {
      value += Math.sin(TAU * phase * n) / n;
    } else if (wave === "triangle") {
      if (n % 2) value += ((n % 4 === 1 ? 1 : -1) * Math.sin(TAU * phase * n)) / (n * n);
    }
  }
  if (wave === "square") return (4 / Math.PI) * value;
  if (wave === "saw") return (2 / Math.PI) * value;
  return (8 / (Math.PI * Math.PI)) * value;
}

// Głos: fala, częstotliwość (liczba albo funkcja czasu), obwiednia, vibrato, filtr dolnoprzepustowy, panorama.
function voice(out, start, duration, options) {
  const {
    frequency,
    wave = "sine",
    env = {},
    gain = 0.5,
    vibrato = null,
    lowpass = null,
    pan = 0,
    harmonics = null,
  } = options;
  const release = env.r ?? 0.1;
  const total = samples(duration + release * 5);
  const first = samples(start);
  const channels = Array.isArray(out) ? out : [out];
  const panGains =
    channels.length === 2 ? [Math.cos(((pan + 1) * Math.PI) / 4), Math.sin(((pan + 1) * Math.PI) / 4)] : [1];
  let phase = random();
  let filtered = 0;
  for (let index = 0; index < total; index += 1) {
    const at = first + index;
    if (at >= channels[0].length) break;
    const t = index / SR;
    let f = typeof frequency === "function" ? frequency(t) : frequency;
    if (vibrato && t > (vibrato.delay || 0)) f *= 1 + vibrato.depth * Math.sin(TAU * vibrato.rate * t);
    phase += f / SR;
    let value;
    if (wave === "noise") value = random() * 2 - 1;
    else if (harmonics) {
      value = 0;
      for (const [n, amplitude] of harmonics) if (f * n < SR / 2) value += amplitude * Math.sin(TAU * phase * n);
    } else value = bandLimited(wave, phase, f);
    if (lowpass) {
      const cutoff = typeof lowpass === "function" ? lowpass(t) : lowpass;
      const alpha = 1 - Math.exp((-TAU * cutoff) / SR);
      filtered += alpha * (value - filtered);
      value = filtered;
    }
    const level = envelope(t, duration, env) * gain;
    if (level < 1e-5 && t > duration) break;
    channels.forEach((channel, c) => (channel[at] += value * level * panGains[c]));
  }
}

// Filtr pasmowy (biquad RBJ) — formanty głosów (hu-hu, meee, „pracu!”).
function bandpass(data, center, q = 4) {
  const w = (TAU * center) / SR;
  const alpha = Math.sin(w) / (2 * q);
  const a0 = 1 + alpha;
  const b0 = alpha / a0;
  const b2 = -alpha / a0;
  const a1 = (-2 * Math.cos(w)) / a0;
  const a2 = (1 - alpha) / a0;
  const result = new Float32Array(data.length);
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let index = 0; index < data.length; index += 1) {
    const x = data[index];
    const y = b0 * x + b2 * x2 - a1 * y1 - a2 * y2;
    result[index] = y;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
  }
  return result;
}

function highpass(data, cutoff) {
  const alpha = Math.exp((-TAU * cutoff) / SR);
  const result = new Float32Array(data.length);
  let previousIn = 0;
  let previousOut = 0;
  for (let index = 0; index < data.length; index += 1) {
    previousOut = alpha * (previousOut + data[index] - previousIn);
    previousIn = data[index];
    result[index] = previousOut;
  }
  return result;
}

function add(target, source, offset = 0, gain = 1) {
  const first = samples(offset);
  for (let index = 0; index < source.length && first + index < target.length; index += 1) {
    target[first + index] += source[index] * gain;
  }
  return target;
}

// Szum w obwiedni (plusk, szelest, werbel).
function noiseBurst(duration, { a = 0.002, d = 0.05, s = 0, r = 0.05, gain = 0.5, lowpass = null } = {}) {
  const out = buffer(duration + r * 5);
  voice(out, 0, duration, { wave: "noise", env: { a, d, s, r }, gain, lowpass });
  return out;
}

// Echo (linia opóźniająca ze sprzężeniem).
function echo(data, delay = 0.18, feedback = 0.35) {
  const offset = samples(delay);
  const result = new Float32Array(data.length + offset * 6);
  result.set(data);
  for (let index = offset; index < result.length; index += 1) result[index] += result[index - offset] * feedback;
  return result;
}

// Prosty pogłos (4 filtry grzebieniowe + 2 wszechprzepustowe, jak Schroeder).
function reverb(data, { size = 1, mix = 0.18 } = {}) {
  const combs = [1557, 1617, 1491, 1422].map((length) => Math.round(length * size));
  const tail = samples(1.2 * size);
  const wet = new Float32Array(data.length + tail);
  for (const length of combs) {
    const line = new Float32Array(length);
    let position = 0;
    let store = 0;
    for (let index = 0; index < wet.length; index += 1) {
      const input = index < data.length ? data[index] : 0;
      const output = line[position];
      store = output * 0.8 + store * 0.2;
      line[position] = input + store * 0.78;
      position = (position + 1) % length;
      wet[index] += output / combs.length;
    }
  }
  for (const length of [556, 441]) {
    const line = new Float32Array(length);
    let position = 0;
    for (let index = 0; index < wet.length; index += 1) {
      const input = wet[index];
      const buffered = line[position];
      wet[index] = -input + buffered;
      line[position] = input + buffered * 0.5;
      position = (position + 1) % length;
    }
  }
  const result = new Float32Array(wet.length);
  for (let index = 0; index < result.length; index += 1)
    result[index] = (index < data.length ? data[index] : 0) * (1 - mix) + wet[index] * mix;
  return result;
}

function trimSilence(data, threshold = 1e-4) {
  let end = data.length;
  while (end > 1 && Math.abs(data[end - 1]) < threshold) end -= 1;
  return data.slice(0, Math.min(data.length, end + samples(0.01)));
}

// Normalizacja szczytu (domyślnie −1 dBFS) z miękkim obcięciem.
function normalize(data, peak = 0.89) {
  let max = 0;
  for (const value of data) max = Math.max(max, Math.abs(value));
  const scale = max > 0 ? peak / max : 1;
  for (let index = 0; index < data.length; index += 1)
    data[index] = Math.tanh(data[index] * scale * 1.1) / Math.tanh(1.1);
  return data;
}

function fadeOut(data, seconds = 0.01) {
  const length = Math.min(data.length, samples(seconds));
  for (let index = 0; index < length; index += 1) data[data.length - 1 - index] *= index / length;
  return data;
}

// ---------- efekty (ok. 25) ----------

const glide =
  (from, to, time, curve = 1) =>
  (t) =>
    from + (to - from) * Math.min(1, (t / time) ** curve);

const EFFECTS = {
  skok: {
    label: "Skok",
    volume: 0.7,
    render() {
      const out = buffer(0.3);
      voice(out, 0, 0.12, {
        wave: "square",
        frequency: glide(280, 720, 0.12, 0.7),
        env: { a: 0.003, d: 0.08, s: 0.3, r: 0.05 },
        gain: 0.25,
        lowpass: 3500,
      });
      voice(out, 0, 0.12, {
        frequency: glide(280, 720, 0.12, 0.7),
        env: { a: 0.003, d: 0.1, s: 0.4, r: 0.05 },
        gain: 0.4,
      });
      return out;
    },
  },
  "podwojny-skok": {
    label: "Podwójny skok",
    volume: 0.7,
    render() {
      const out = buffer(0.4);
      voice(out, 0, 0.08, {
        wave: "square",
        frequency: glide(500, 900, 0.08),
        env: { a: 0.002, d: 0.05, s: 0.3, r: 0.03 },
        gain: 0.22,
        lowpass: 4000,
      });
      voice(out, 0.08, 0.12, {
        wave: "square",
        frequency: glide(700, 1300, 0.12),
        env: { a: 0.002, d: 0.08, s: 0.3, r: 0.05 },
        gain: 0.22,
        lowpass: 4500,
      });
      voice(out, 0.08, 0.15, { frequency: 2600, env: { a: 0.002, d: 0.06, s: 0, r: 0.08 }, gain: 0.12 });
      return out;
    },
  },
  szybowanie: {
    label: "Szybowanie (pętla)",
    volume: 0.35,
    loop: true,
    render() {
      // Pętla 2 s: szum pasmowy z wolnym „falowaniem”; zapętlenie bez szwu (renderowanie po okręgu).
      const length = samples(2);
      const noise = new Float32Array(length * 2);
      for (let index = 0; index < noise.length; index += 1) noise[index] = random() * 2 - 1;
      const band = bandpass(noise, 700, 0.9);
      const out = new Float32Array(length);
      for (let index = 0; index < length; index += 1) {
        const t = index / SR;
        const swell = 0.55 + 0.45 * Math.sin(TAU * 0.5 * t);
        // przenikanie drugiej kopii — koniec płynnie przechodzi w początek
        const mix = index / length;
        out[index] = (band[index + length] * (1 - mix) + band[index] * mix) * swell;
      }
      return out;
    },
  },
  slizg: {
    label: "Ślizg",
    volume: 0.6,
    render() {
      const out = buffer(0.45);
      voice(out, 0, 0.3, {
        wave: "noise",
        env: { a: 0.01, d: 0.3, s: 0.5, r: 0.1 },
        gain: 0.35,
        lowpass: glide(3000, 600, 0.35),
      });
      voice(out, 0, 0.25, { frequency: glide(300, 140, 0.25), env: { a: 0.01, d: 0.2, s: 0.3, r: 0.08 }, gain: 0.25 });
      return out;
    },
  },
  ladowanie: {
    label: "Lądowanie",
    volume: 0.6,
    render() {
      const out = buffer(0.25);
      voice(out, 0, 0.08, { frequency: glide(190, 55, 0.08), env: { a: 0.001, d: 0.06, s: 0.2, r: 0.05 }, gain: 0.8 });
      add(out, noiseBurst(0.03, { d: 0.02, gain: 0.25, lowpass: 1800 }));
      return out;
    },
  },
  lisc: {
    label: "Liść",
    volume: 0.55,
    maxVoices: 4,
    minGap: 0.03,
    render() {
      const out = buffer(0.35);
      voice(out, 0, 0.02, {
        frequency: note("E6"),
        env: { a: 0.001, d: 0.12, s: 0, r: 0.12 },
        gain: 0.5,
        harmonics: [
          [1, 1],
          [2, 0.25],
          [3, 0.08],
        ],
      });
      voice(out, 0.012, 0.02, { frequency: note("B6"), env: { a: 0.001, d: 0.08, s: 0, r: 0.1 }, gain: 0.2 });
      return out;
    },
  },
  "lisc-zloty": {
    label: "Złoty liść",
    volume: 0.6,
    render() {
      const out = buffer(0.7);
      [note("E6"), note("B6"), note("E7")].forEach((frequency, index) =>
        voice(out, index * 0.06, 0.03, {
          frequency,
          env: { a: 0.001, d: 0.2, s: 0, r: 0.25 },
          gain: 0.35,
          harmonics: [
            [1, 1],
            [2, 0.3],
            [3, 0.1],
          ],
        }),
      );
      add(
        out,
        noiseBurst(0.3, { a: 0.01, d: 0.2, gain: 0.05 }).map((value, index) => value * Math.sin(index / 30)),
        0.1,
      );
      return out;
    },
  },
  "lisc-teczowy": {
    label: "Tęczowy liść",
    volume: 0.65,
    render() {
      const out = buffer(1.0);
      ["C6", "E6", "G6", "C7", "E7"].forEach((name, index) =>
        voice(out, index * 0.05, 0.04, {
          frequency: note(name),
          env: { a: 0.001, d: 0.25, s: 0, r: 0.3 },
          gain: 0.3,
          harmonics: [
            [1, 1],
            [2, 0.3],
            [4, 0.1],
          ],
        }),
      );
      voice(out, 0.25, 0.3, {
        wave: "triangle",
        frequency: note("C7"),
        env: { a: 0.01, d: 0.3, s: 0.2, r: 0.3 },
        gain: 0.12,
        vibrato: { rate: 9, depth: 0.01 },
      });
      return out;
    },
  },
  "goraczka-start": {
    label: "Start Gorączki Monster",
    volume: 0.7,
    render() {
      const out = buffer(1.3);
      voice(out, 0, 0.5, {
        wave: "noise",
        env: { a: 0.3, d: 0.3, s: 0.6, r: 0.1 },
        gain: 0.25,
        lowpass: glide(400, 6000, 0.5),
      });
      for (const name of ["C5", "E5", "G5", "C6"]) {
        voice(out, 0.5, 0.35, {
          wave: "saw",
          frequency: note(name),
          env: { a: 0.005, d: 0.25, s: 0.4, r: 0.3 },
          gain: 0.12,
          lowpass: 3000,
        });
      }
      voice(out, 0.5, 0.2, { frequency: glide(140, 50, 0.15), env: { a: 0.001, d: 0.12, s: 0, r: 0.1 }, gain: 0.7 });
      return out;
    },
  },
  "trafienie-pracu": {
    label: "Trafienie przez Pracu („pracu!”)",
    volume: 0.7,
    render() {
      // Dwa piski „pra-cu!” z formantami (pisk dymka).
      const raw = buffer(0.5);
      voice(raw, 0, 0.12, {
        wave: "saw",
        frequency: glide(700, 1100, 0.1),
        env: { a: 0.005, d: 0.1, s: 0.6, r: 0.03 },
        gain: 0.5,
        vibrato: { rate: 30, depth: 0.03 },
      });
      voice(raw, 0.16, 0.16, {
        wave: "saw",
        frequency: glide(1000, 560, 0.16),
        env: { a: 0.005, d: 0.15, s: 0.5, r: 0.05 },
        gain: 0.5,
        vibrato: { rate: 30, depth: 0.03 },
      });
      const formant = add(bandpass(raw, 1300, 2.5), bandpass(raw, 2700, 4), 0, 0.6);
      return add(formant, noiseBurst(0.02, { gain: 0.2, lowpass: 5000 }));
    },
  },
  "trafienie-amic": {
    label: "Trafienie przez Amic (bonk)",
    volume: 0.7,
    render() {
      // Metaliczne „bonk”: składowe nieharmoniczne i niskie tąpnięcie.
      const out = buffer(0.8);
      for (const [frequency, gain, decay] of [
        [220, 0.5, 0.25],
        [563, 0.3, 0.2],
        [1130, 0.2, 0.12],
        [1790, 0.12, 0.08],
        [2650, 0.08, 0.05],
      ]) {
        voice(out, 0, 0.005, { frequency, env: { a: 0.001, d: decay, s: 0, r: decay }, gain });
      }
      voice(out, 0, 0.06, { frequency: glide(120, 60, 0.06), env: { a: 0.001, d: 0.05, s: 0.3, r: 0.06 }, gain: 0.6 });
      return out;
    },
  },
  "koza-meee": {
    label: "Kózka („meee”)",
    volume: 0.6,
    render() {
      // Beczenie: piła z szybkim drżeniem (18 Hz) i formantami „e”.
      const raw = buffer(0.8);
      voice(raw, 0, 0.5, {
        wave: "saw",
        frequency: glide(470, 400, 0.5),
        env: { a: 0.03, d: 0.4, s: 0.7, r: 0.1 },
        gain: 0.5,
        vibrato: { rate: 18, depth: 0.05 },
      });
      const tremolo = raw.map((value, index) => value * (0.7 + 0.3 * Math.sin((TAU * 18 * index) / SR)));
      return add(bandpass(tremolo, 600, 3), bandpass(tremolo, 2300, 5), 0, 0.8);
    },
  },
  "powerup-start": {
    label: "Start power-upu",
    volume: 0.6,
    render() {
      const out = buffer(0.6);
      ["C5", "E5", "G5", "C6", "E6"].forEach((name, index) =>
        voice(out, index * 0.05, 0.05, {
          wave: "square",
          frequency: note(name),
          env: { a: 0.002, d: 0.06, s: 0.4, r: 0.05 },
          gain: 0.16,
          lowpass: 5000,
        }),
      );
      return out;
    },
  },
  "powerup-koniec": {
    label: "Koniec power-upu",
    volume: 0.55,
    render() {
      const out = buffer(0.6);
      ["E6", "C6", "G5", "C5"].forEach((name, index) =>
        voice(out, index * 0.07, 0.06, {
          wave: "square",
          frequency: note(name),
          env: { a: 0.002, d: 0.06, s: 0.3, r: 0.06 },
          gain: 0.14,
          lowpass: 3500,
        }),
      );
      return out;
    },
  },
  "humbak-plusk": {
    label: "Plusk humbaka",
    volume: 0.7,
    render() {
      const out = buffer(1.2);
      add(out, noiseBurst(0.25, { a: 0.005, d: 0.25, s: 0.1, r: 0.3, gain: 0.6, lowpass: glide(5000, 900, 0.5) }));
      voice(out, 0, 0.1, { frequency: glide(160, 60, 0.1), env: { a: 0.002, d: 0.1, s: 0.2, r: 0.1 }, gain: 0.5 });
      // bąbelki: krótkie sinusy o rosnącej wysokości
      for (let index = 0; index < 9; index += 1) {
        const base = 500 + random() * 900;
        voice(out, 0.15 + random() * 0.6, 0.03, {
          frequency: glide(base, base * 1.8, 0.03),
          env: { a: 0.002, d: 0.03, s: 0, r: 0.03 },
          gain: 0.15,
        });
      }
      return out;
    },
  },
  "humbak-piesn": {
    label: "Zawołanie humbaka",
    volume: 0.6,
    render() {
      const raw = buffer(2.2);
      const contour = (t) =>
        t < 0.7 ? 300 + (520 - 300) * (t / 0.7) : 520 - (520 - 260) * Math.min(1, (t - 0.7) / 1.1);
      voice(raw, 0, 1.7, {
        frequency: contour,
        env: { a: 0.2, d: 1, s: 0.8, r: 0.3 },
        gain: 0.5,
        vibrato: { rate: 5, depth: 0.015, delay: 0.3 },
        harmonics: [
          [1, 1],
          [2, 0.35],
          [3, 0.12],
        ],
        lowpass: 1500,
      });
      return reverb(echo(raw, 0.22, 0.3), { size: 1.3, mix: 0.3 });
    },
  },
  "bonus-start": {
    label: "Start bonusu",
    volume: 0.7,
    render() {
      const out = buffer(1.4);
      [
        ["C5", 0],
        ["E5", 0.1],
        ["G5", 0.2],
        ["C6", 0.3],
      ].forEach(([name, at], index) =>
        voice(out, at, index === 3 ? 0.5 : 0.08, {
          wave: "square",
          frequency: note(name),
          env: { a: 0.003, d: 0.1, s: 0.5, r: 0.2 },
          gain: 0.14,
          lowpass: 4500,
          vibrato: index === 3 ? { rate: 6, depth: 0.01, delay: 0.1 } : null,
        }),
      );
      for (const name of ["C4", "G4", "E5"])
        voice(out, 0.3, 0.5, {
          wave: "triangle",
          frequency: note(name),
          env: { a: 0.01, d: 0.4, s: 0.4, r: 0.25 },
          gain: 0.15,
        });
      return out;
    },
  },
  zycie: {
    label: "Dodatkowe życie",
    volume: 0.65,
    render() {
      const out = buffer(0.9);
      ["G5", "C6", "E6", "G6"].forEach((name, index) =>
        voice(out, index * 0.09, 0.05, {
          frequency: note(name),
          env: { a: 0.002, d: 0.2, s: 0, r: 0.3 },
          gain: 0.35,
          harmonics: [
            [1, 1],
            [2, 0.4],
            [3, 0.15],
          ],
        }),
      );
      return out;
    },
  },
  rekord: {
    label: "Nowy rekord",
    volume: 0.7,
    render() {
      const out = buffer(2.0);
      [
        ["C5", 0, 0.1],
        ["E5", 0.12, 0.1],
        ["G5", 0.24, 0.1],
        ["C6", 0.36, 0.7],
      ].forEach(([name, at, length]) =>
        voice(out, at, length, {
          wave: "square",
          frequency: note(name),
          env: { a: 0.003, d: 0.15, s: 0.55, r: 0.3 },
          gain: 0.13,
          lowpass: 4000,
          vibrato: length > 0.5 ? { rate: 6, depth: 0.012, delay: 0.15 } : null,
        }),
      );
      for (const name of ["C4", "E4", "G4", "C5"])
        voice(out, 0.36, 0.7, {
          wave: "triangle",
          frequency: note(name),
          env: { a: 0.02, d: 0.5, s: 0.5, r: 0.4 },
          gain: 0.1,
        });
      for (let index = 0; index < 8; index += 1) {
        voice(out, 0.4 + index * 0.07, 0.02, {
          frequency: note("C7") * (1 + random() * 0.5),
          env: { a: 0.001, d: 0.08, s: 0, r: 0.1 },
          gain: 0.08,
        });
      }
      return out;
    },
  },
  klik: {
    label: "Kliknięcie",
    volume: 0.45,
    minGap: 0.03,
    render() {
      const out = buffer(0.08);
      voice(out, 0, 0.01, { frequency: glide(1800, 1100, 0.02), env: { a: 0.001, d: 0.02, s: 0, r: 0.02 }, gain: 0.5 });
      add(out, noiseBurst(0.004, { d: 0.004, gain: 0.15, lowpass: 6000 }));
      return out;
    },
  },
  zakup: {
    label: "Zakup",
    volume: 0.6,
    render() {
      const out = buffer(0.5);
      voice(out, 0, 0.06, {
        wave: "square",
        frequency: note("B5"),
        env: { a: 0.002, d: 0.05, s: 0.6, r: 0.02 },
        gain: 0.15,
        lowpass: 5000,
      });
      voice(out, 0.06, 0.2, {
        wave: "square",
        frequency: note("E6"),
        env: { a: 0.002, d: 0.15, s: 0.4, r: 0.15 },
        gain: 0.15,
        lowpass: 5000,
      });
      return out;
    },
  },
  polaczenie: {
    label: "Połączenie (merge)",
    volume: 0.6,
    render() {
      const out = buffer(0.6);
      voice(out, 0, 0.1, { frequency: glide(620, 300, 0.1), env: { a: 0.002, d: 0.08, s: 0.3, r: 0.05 }, gain: 0.5 });
      voice(out, 0.1, 0.03, {
        frequency: note("G6"),
        env: { a: 0.001, d: 0.2, s: 0, r: 0.25 },
        gain: 0.35,
        harmonics: [
          [1, 1],
          [2, 0.3],
        ],
      });
      voice(out, 0.14, 0.03, { frequency: note("D7"), env: { a: 0.001, d: 0.15, s: 0, r: 0.2 }, gain: 0.2 });
      return out;
    },
  },
  odliczanie: {
    label: "Odliczanie (3, 2, 1)",
    volume: 0.55,
    render() {
      const out = buffer(0.25);
      voice(out, 0, 0.1, {
        wave: "triangle",
        frequency: note("A5"),
        env: { a: 0.002, d: 0.1, s: 0.6, r: 0.05 },
        gain: 0.5,
      });
      return out;
    },
  },
  "odliczanie-start": {
    label: "Odliczanie — start",
    volume: 0.6,
    render() {
      const out = buffer(0.55);
      voice(out, 0, 0.3, {
        wave: "triangle",
        frequency: note("E6"),
        env: { a: 0.002, d: 0.2, s: 0.6, r: 0.12 },
        gain: 0.5,
      });
      voice(out, 0, 0.3, { frequency: note("E5"), env: { a: 0.002, d: 0.2, s: 0.5, r: 0.12 }, gain: 0.3 });
      return out;
    },
  },
  "koniec-gry": {
    label: "Koniec gry (smutne „hu-hu”)",
    volume: 0.7,
    render() {
      return hoots([
        [note("G4"), note("F4"), 0, 0.28],
        [note("E4"), note("C4"), 0.42, 0.42],
      ]);
    },
  },
  "hu-hu": {
    label: "Sowa „hu-hu!”",
    volume: 0.65,
    render() {
      return hoots([
        [note("A4"), note("A4"), 0, 0.2],
        [note("C5"), note("D5"), 0.3, 0.3],
      ]);
    },
  },
  dzwonek: {
    label: "Dzwonek (zapowiedź Pracu)",
    volume: 0.55,
    render() {
      // Krótki dzwonek telefonu: dwa tony z drżeniem 20 Hz, dwa razy.
      const out = buffer(0.7);
      for (const at of [0, 0.3]) {
        for (const frequency of [1400, 1750]) {
          voice(out, at, 0.18, {
            frequency,
            env: { a: 0.003, d: 0.1, s: 0.6, r: 0.05 },
            gain: 0.18,
            vibrato: { rate: 20, depth: 0.004 },
          });
        }
      }
      return out.map((value, index) => value * (0.6 + 0.4 * Math.sin((TAU * 20 * index) / SR)));
    },
  },
};

// Pohukiwanie sowy: sinus z oddechem, formant ok. 450 Hz; każde [od, do, start, długość].
function hoots(parts) {
  const out = buffer(1.4);
  for (const [from, to, start, length] of parts) {
    voice(out, start, length, {
      frequency: glide(from, to, length),
      env: { a: 0.05, d: 0.3, s: 0.8, r: 0.12 },
      gain: 0.55,
      harmonics: [
        [1, 1],
        [2, 0.15],
        [3, 0.05],
      ],
      vibrato: { rate: 6, depth: 0.01 },
    });
    const breath = noiseBurst(length, { a: 0.04, d: 0.2, s: 0.5, r: 0.1, gain: 0.25 });
    add(out, bandpass(breath, from * 1.1, 6), start, 0.5);
  }
  return reverb(out, { size: 0.8, mix: 0.15 });
}

// ---------- muzyka ----------

// Renderowanie „po okręgu”: to, co wybrzmiewa po końcu pętli, trafia na jej początek (pętla bez szwu).
function circular(length, render) {
  const extended = [new Float32Array(length + samples(4)), new Float32Array(length + samples(4))];
  render(extended);
  return extended.map((channel) => {
    const loop = channel.slice(0, length);
    for (let index = length; index < channel.length; index += 1) loop[(index - length) % length] += channel[index];
    return loop;
  });
}

function drums(channels, beat, pattern, bars, { kick = 0.7, snare = 0.3, hat = 0.12 } = {}) {
  const kickSound = buffer(0.3);
  voice(kickSound, 0, 0.12, { frequency: glide(130, 45, 0.12), env: { a: 0.001, d: 0.12, s: 0.1, r: 0.08 }, gain: 1 });
  const snareSound = highpass(noiseBurst(0.12, { d: 0.08, gain: 0.8, lowpass: 7000 }), 900);
  voice(snareSound, 0, 0.04, { frequency: 190, env: { a: 0.001, d: 0.05, s: 0, r: 0.04 }, gain: 0.4 });
  const hatSound = highpass(noiseBurst(0.03, { d: 0.02, gain: 0.8 }), 6000);
  for (let bar = 0; bar < bars; bar += 1) {
    for (let step = 0; step < 16; step += 1) {
      const at = (bar * 16 + step) * (beat / 4);
      const symbol = pattern[step];
      const [left, right] = channels;
      if (symbol === "k") {
        add(left, kickSound, at, kick);
        add(right, kickSound, at, kick);
      } else if (symbol === "s") {
        add(left, snareSound, at, snare);
        add(right, snareSound, at, snare * 0.9);
      }
      if (step % 2 === 0) {
        add(left, hatSound, at, hat * (step % 4 === 0 ? 1 : 0.6));
        add(right, hatSound, at + 0.004, hat * 0.8);
      }
    }
  }
}

// Motyw menu: pogodny, 112 BPM, C-dur, 8 taktów (ok. 17 s).
function menuTheme() {
  const bpm = 112;
  const beat = 60 / bpm;
  const bars = 8;
  const length = samples(bars * 4 * beat);
  const chords = [
    ["C3", "C4", "E4", "G4"],
    ["A2", "A3", "C4", "E4"],
    ["F2", "F3", "A3", "C4"],
    ["G2", "G3", "B3", "D4"],
    ["C3", "C4", "E4", "G4"],
    ["A2", "A3", "C4", "E4"],
    ["F2", "F3", "A3", "C4"],
    ["G2", "G3", "B3", "D4"],
  ];
  // Melodia: [nuta, początek w ćwierćnutach, długość w ćwierćnutach].
  const melody = [
    ["E5", 0, 1],
    ["G5", 1, 1],
    ["A5", 2, 0.5],
    ["G5", 2.5, 0.5],
    ["E5", 3, 1],
    ["C5", 4, 1],
    ["D5", 5, 0.5],
    ["E5", 5.5, 0.5],
    ["C5", 6, 2],
    ["F5", 8, 1],
    ["A5", 9, 1],
    ["G5", 10, 0.5],
    ["F5", 10.5, 0.5],
    ["E5", 11, 1],
    ["D5", 12, 1.5],
    ["E5", 13.5, 0.5],
    ["D5", 14, 1],
    ["G4", 15, 1],
    ["E5", 16, 1],
    ["G5", 17, 1],
    ["C6", 18, 1],
    ["B5", 19, 0.5],
    ["A5", 19.5, 0.5],
    ["G5", 20, 1],
    ["E5", 21, 1],
    ["C5", 22, 2],
    ["F5", 24, 0.5],
    ["E5", 24.5, 0.5],
    ["D5", 25, 1],
    ["A5", 26, 1],
    ["G5", 27, 1],
    ["D5", 28, 1],
    ["E5", 29, 0.5],
    ["D5", 29.5, 0.5],
    ["C5", 30, 2],
  ];
  return circular(length, (channels) => {
    chords.forEach((chord, bar) => {
      const at = bar * 4 * beat;
      // bas: pół nuty prymy i kwinty
      const root = note(chord[0]);
      [0, 2].forEach((offset, index) =>
        voice(channels, at + offset * beat, beat * 1.6, {
          wave: "triangle",
          frequency: root * (index ? 1.5 : 1),
          env: { a: 0.005, d: 0.3, s: 0.5, r: 0.1 },
          gain: 0.32,
        }),
      );
      // akordy: marimba na „i” (ósemki 2 i 4)
      for (const step of [1, 3, 5, 7]) {
        chord.slice(1).forEach((name, index) =>
          voice(channels, at + step * (beat / 2), 0.05, {
            frequency: note(name),
            env: { a: 0.002, d: 0.25, s: 0, r: 0.25 },
            gain: 0.09,
            harmonics: [
              [1, 1],
              [4, 0.15],
            ],
            pan: (index - 1) * 0.4,
          }),
        );
      }
    });
    for (const [name, start, length] of melody) {
      voice(channels, start * beat, length * beat * 0.9, {
        wave: "square",
        frequency: note(name),
        env: { a: 0.01, d: 0.2, s: 0.5, r: 0.12 },
        gain: 0.11,
        lowpass: 2600,
        vibrato: { rate: 5.5, depth: 0.008, delay: 0.15 },
        pan: 0.1,
      });
      voice(channels, start * beat, 0.05, {
        frequency: note(name) * 2,
        env: { a: 0.002, d: 0.12, s: 0, r: 0.12 },
        gain: 0.05,
        pan: -0.2,
      });
    }
    drums(channels, beat, ["k", "", "", "", "s", "", "", "", "k", "", "k", "", "s", "", "", ""], bars, {
      kick: 0.55,
      snare: 0.18,
      hat: 0.07,
    });
  });
}

// Motyw Sowiej Ucieczki: bieg, 125 BPM, G-dur (G–e–C–D), 8 taktów (ok. 15 s): bas ósemkami z oktawą na „i”,
// krótkie akordy marimby, skoczna melodia i perkusja z dodatkowym uderzeniem stopy (napęd biegu).
function runTheme() {
  const bpm = 125;
  const beat = 60 / bpm;
  const bars = 8;
  const length = samples(bars * 4 * beat);
  const chords = [
    ["G2", "G3", "B3", "D4"],
    ["E2", "E3", "G3", "B3"],
    ["C3", "C4", "E4", "G4"],
    ["D3", "D4", "F#4", "A4"],
    ["G2", "G3", "B3", "D4"],
    ["E2", "E3", "G3", "B3"],
    ["C3", "C4", "E4", "G4"],
    ["D3", "D4", "F#4", "A4"],
  ];
  // Melodia: [nuta, początek w ćwierćnutach, długość w ćwierćnutach].
  const melody = [
    ["B4", 0, 0.5],
    ["D5", 0.5, 0.5],
    ["G5", 1, 1],
    ["F#5", 2, 0.5],
    ["G5", 2.5, 0.5],
    ["D5", 3, 1],
    ["E5", 4, 0.5],
    ["G5", 4.5, 0.5],
    ["B5", 5, 1],
    ["A5", 6, 0.5],
    ["G5", 6.5, 0.5],
    ["E5", 7, 1],
    ["C5", 8, 0.5],
    ["E5", 8.5, 0.5],
    ["G5", 9, 1],
    ["A5", 10, 0.5],
    ["G5", 10.5, 0.5],
    ["E5", 11, 1],
    ["D5", 12, 1],
    ["F#5", 13, 0.5],
    ["A5", 13.5, 0.5],
    ["D6", 14, 1.5],
    ["C6", 15.5, 0.5],
    ["B5", 16, 0.5],
    ["A5", 16.5, 0.5],
    ["G5", 17, 1],
    ["D5", 18, 0.5],
    ["G5", 18.5, 0.5],
    ["B5", 19, 1],
    ["G5", 20, 0.5],
    ["E5", 20.5, 0.5],
    ["B4", 21, 1],
    ["E5", 22, 0.5],
    ["F#5", 22.5, 0.5],
    ["G5", 23, 1],
    ["E5", 24, 0.5],
    ["G5", 24.5, 0.5],
    ["C6", 25, 1],
    ["B5", 26, 0.5],
    ["A5", 26.5, 0.5],
    ["G5", 27, 1],
    ["A5", 28, 1],
    ["F#5", 29, 0.5],
    ["E5", 29.5, 0.5],
    ["D5", 30, 1],
    ["A4", 31, 1],
  ];
  return circular(length, (channels) => {
    chords.forEach((chord, bar) => {
      const at = bar * 4 * beat;
      const root = note(chord[0]);
      // bas: ósemki prymy, na „i” oktawa wyżej
      for (let step = 0; step < 8; step += 1) {
        voice(channels, at + step * (beat / 2), beat * 0.4, {
          wave: "triangle",
          frequency: root * (step % 2 ? 2 : 1),
          env: { a: 0.004, d: 0.12, s: 0.4, r: 0.06 },
          gain: step % 2 ? 0.18 : 0.3,
        });
      }
      // akordy: krótka marimba na „i” (ósemki 2, 4, 6, 8)
      for (const step of [1, 3, 5, 7]) {
        chord.slice(1).forEach((name, index) =>
          voice(channels, at + step * (beat / 2), 0.04, {
            frequency: note(name),
            env: { a: 0.002, d: 0.18, s: 0, r: 0.18 },
            gain: 0.08,
            harmonics: [
              [1, 1],
              [4, 0.15],
            ],
            pan: (index - 1) * 0.4,
          }),
        );
      }
    });
    for (const [name, start, length] of melody) {
      voice(channels, start * beat, length * beat * 0.85, {
        wave: "square",
        frequency: note(name),
        env: { a: 0.008, d: 0.15, s: 0.45, r: 0.08 },
        gain: 0.1,
        lowpass: 3000,
        vibrato: { rate: 6, depth: 0.006, delay: 0.12 },
        pan: 0.1,
      });
      voice(channels, start * beat, 0.04, {
        frequency: note(name) * 2,
        env: { a: 0.002, d: 0.1, s: 0, r: 0.1 },
        gain: 0.045,
        pan: -0.2,
      });
    }
    drums(channels, beat, ["k", "", "", "", "s", "", "", "k", "k", "", "", "", "s", "", "k", ""], bars, {
      kick: 0.6,
      snare: 0.22,
      hat: 0.09,
    });
  });
}

// Motywy plansz Sowich Torów (E5e): wspólny układ jak motyw Sowiej Ucieczki — bas, marimba na „i”, melodia
// z dzwoneczkiem oktawę wyżej i perkusja; każda plansza ma własne tempo, tonację, barwę melodii i rytm.
// `bars` — melodia w taktach: [nuta | "-" (pauza), długość w ćwierćnutach], każdy takt = 4 ćwierćnuty.
function stageTheme({ bpm, chords, bars, lead, leadGain = 0.1, lowpass = 3000, bass = "eighths", drums: kit }) {
  const beat = 60 / bpm;
  const length = samples(chords.length * 4 * beat);
  const melody = [];
  bars.forEach((bar, index) => {
    let at = index * 4;
    for (const [name, duration] of bar) {
      if (name !== "-") melody.push([name, at, duration]);
      at += duration;
    }
    if (Math.abs(at - (index + 1) * 4) > 1e-9) throw new Error(`Motyw planszy, takt ${index + 1}: zła długość`);
  });
  return circular(length, (channels) => {
    chords.forEach((chord, bar) => {
      const at = bar * 4 * beat;
      const root = note(chord[0]);
      if (bass === "eighths") {
        for (let step = 0; step < 8; step += 1) {
          voice(channels, at + step * (beat / 2), beat * 0.4, {
            wave: "triangle",
            frequency: root * (step % 2 ? 2 : 1),
            env: { a: 0.004, d: 0.12, s: 0.4, r: 0.06 },
            gain: step % 2 ? 0.17 : 0.28,
          });
        }
      } else {
        [0, 2].forEach((offset, index) =>
          voice(channels, at + offset * beat, beat * 1.6, {
            wave: "triangle",
            frequency: root * (index ? 1.5 : 1),
            env: { a: 0.005, d: 0.3, s: 0.5, r: 0.1 },
            gain: 0.3,
          }),
        );
      }
      for (const step of [1, 3, 5, 7]) {
        chord.slice(1).forEach((name, index) =>
          voice(channels, at + step * (beat / 2), 0.04, {
            frequency: note(name),
            env: { a: 0.002, d: 0.2, s: 0, r: 0.2 },
            gain: 0.075,
            harmonics: [
              [1, 1],
              [4, 0.15],
            ],
            pan: (index - 1) * 0.4,
          }),
        );
      }
    });
    for (const [name, start, duration] of melody) {
      voice(channels, start * beat, duration * beat * 0.85, {
        wave: lead,
        frequency: note(name),
        env: { a: 0.008, d: 0.15, s: 0.45, r: 0.08 },
        gain: leadGain,
        lowpass,
        vibrato: { rate: 6, depth: lead === "sine" ? 0.01 : 0.006, delay: 0.12 },
        pan: 0.1,
      });
      voice(channels, start * beat, 0.04, {
        frequency: note(name) * 2,
        env: { a: 0.002, d: 0.1, s: 0, r: 0.1 },
        gain: 0.04,
        pan: -0.2,
      });
    }
    drums(channels, beat, kit.pattern, chords.length, kit.gains);
  });
}

// Sowa w Chmurach (E6e): motyw lotu — 100 BPM, G-dur (G–e–C–D ×2), lekki flet (sinus bez filtra) w górę po
// akordach, bas półnutami, delikatna perkusja — spokojna wspinaczka.
const cloudTheme = () =>
  stageTheme({
    bpm: 100,
    chords: [
      ["G2", "G3", "B3", "D4"],
      ["E2", "E3", "G3", "B3"],
      ["C3", "C4", "E4", "G4"],
      ["D3", "D4", "F#4", "A4"],
      ["G2", "G3", "B3", "D4"],
      ["E2", "E3", "G3", "B3"],
      ["C3", "C4", "E4", "G4"],
      ["D3", "D4", "F#4", "A4"],
    ],
    bars: [
      [
        ["D5", 0.5],
        ["G5", 0.5],
        ["B5", 1],
        ["A5", 0.5],
        ["G5", 0.5],
        ["D5", 1],
      ],
      [
        ["E5", 0.5],
        ["G5", 0.5],
        ["B5", 1],
        ["D6", 1],
        ["B5", 1],
      ],
      [
        ["C5", 0.5],
        ["E5", 0.5],
        ["G5", 1],
        ["A5", 0.5],
        ["G5", 0.5],
        ["E5", 1],
      ],
      [
        ["D5", 1],
        ["F#5", 0.5],
        ["A5", 0.5],
        ["D6", 2],
      ],
      [
        ["B5", 0.5],
        ["A5", 0.5],
        ["G5", 1],
        ["D5", 1],
        ["G5", 1],
      ],
      [
        ["G5", 0.5],
        ["B5", 0.5],
        ["E6", 1],
        ["D6", 0.5],
        ["B5", 0.5],
        ["G5", 1],
      ],
      [
        ["E5", 0.5],
        ["G5", 0.5],
        ["C6", 1],
        ["B5", 0.5],
        ["A5", 0.5],
        ["G5", 1],
      ],
      [
        ["A5", 1],
        ["F#5", 0.5],
        ["A5", 0.5],
        ["G5", 2],
      ],
    ],
    lead: "sine",
    leadGain: 0.18,
    lowpass: null,
    bass: "half",
    drums: {
      pattern: ["k", "", "", "", "", "", "s", "", "", "", "k", "", "", "", "s", ""],
      gains: { kick: 0.4, snare: 0.1, hat: 0.05 },
    },
  });

// Biedronka: sklepowy dżingiel, 118 BPM, F-dur (F–d–B–C), marimba w melodii, równy rytm „zakupów”.
const shopTheme = () =>
  stageTheme({
    bpm: 118,
    chords: [
      ["F2", "F3", "A3", "C4"],
      ["D2", "D3", "F3", "A3"],
      ["Bb2", "Bb3", "D4", "F4"],
      ["C3", "C4", "E4", "G4"],
      ["F2", "F3", "A3", "C4"],
      ["D2", "D3", "F3", "A3"],
      ["Bb2", "Bb3", "D4", "F4"],
      ["C3", "C4", "E4", "G4"],
    ],
    bars: [
      [
        ["C5", 0.5],
        ["F5", 0.5],
        ["A5", 1],
        ["G5", 0.5],
        ["F5", 0.5],
        ["A5", 1],
      ],
      [
        ["D5", 0.5],
        ["F5", 0.5],
        ["A5", 1],
        ["C6", 1],
        ["A5", 1],
      ],
      [
        ["Bb4", 0.5],
        ["D5", 0.5],
        ["F5", 1],
        ["G5", 0.5],
        ["F5", 0.5],
        ["D5", 1],
      ],
      [
        ["C5", 1],
        ["E5", 0.5],
        ["G5", 0.5],
        ["C6", 2],
      ],
      [
        ["A5", 0.5],
        ["G5", 0.5],
        ["F5", 1],
        ["C5", 1],
        ["F5", 1],
      ],
      [
        ["F5", 0.5],
        ["A5", 0.5],
        ["D6", 1],
        ["C6", 0.5],
        ["A5", 0.5],
        ["F5", 1],
      ],
      [
        ["D5", 0.5],
        ["F5", 0.5],
        ["Bb5", 1],
        ["A5", 0.5],
        ["G5", 0.5],
        ["F5", 1],
      ],
      [
        ["G5", 1],
        ["E5", 1],
        ["C5", 1],
        ["-", 1],
      ],
    ],
    lead: "triangle",
    leadGain: 0.16,
    drums: {
      pattern: ["k", "", "", "", "s", "", "", "", "k", "", "k", "", "s", "", "", ""],
      gains: { kick: 0.55, snare: 0.2, hat: 0.08 },
    },
  });

// Festiwal roślin: pogodnie i lekko, 104 BPM, A-dur (A–fis–D–E), flet (sinus z vibrato), bas półnutami.
const festivalTheme = () =>
  stageTheme({
    bpm: 104,
    chords: [
      ["A2", "A3", "C#4", "E4"],
      ["F#2", "F#3", "A3", "C#4"],
      ["D2", "D3", "F#3", "A3"],
      ["E2", "E3", "G#3", "B3"],
      ["A2", "A3", "C#4", "E4"],
      ["F#2", "F#3", "A3", "C#4"],
      ["D2", "D3", "F#3", "A3"],
      ["E2", "E3", "G#3", "B3"],
    ],
    bars: [
      [
        ["E5", 1],
        ["A5", 1],
        ["C#6", 1.5],
        ["B5", 0.5],
      ],
      [
        ["A5", 1],
        ["F#5", 1],
        ["A5", 2],
      ],
      [
        ["D5", 0.5],
        ["F#5", 0.5],
        ["A5", 1],
        ["B5", 1],
        ["A5", 1],
      ],
      [
        ["G#5", 1],
        ["E5", 1],
        ["B4", 2],
      ],
      [
        ["E5", 0.5],
        ["A5", 0.5],
        ["C#6", 1],
        ["E6", 1],
        ["C#6", 1],
      ],
      [
        ["B5", 1],
        ["A5", 0.5],
        ["F#5", 0.5],
        ["C#6", 2],
      ],
      [
        ["B5", 0.5],
        ["A5", 0.5],
        ["F#5", 1],
        ["D5", 1],
        ["F#5", 1],
      ],
      [
        ["E5", 1],
        ["G#5", 1],
        ["A5", 2],
      ],
    ],
    lead: "sine",
    leadGain: 0.2,
    lowpass: null,
    bass: "half",
    drums: {
      pattern: ["k", "", "", "", "", "", "s", "", "k", "", "", "", "", "", "s", ""],
      gains: { kick: 0.45, snare: 0.14, hat: 0.06 },
    },
  });

// Blokowisko PRL: pościg dzików, 132 BPM, a-moll (a–F–G–E), szybki kwadratowy syntezator i gęsta perkusja.
const prlTheme = () =>
  stageTheme({
    bpm: 132,
    chords: [
      ["A2", "A3", "C4", "E4"],
      ["F2", "F3", "A3", "C4"],
      ["G2", "G3", "B3", "D4"],
      ["E2", "E3", "G#3", "B3"],
      ["A2", "A3", "C4", "E4"],
      ["F2", "F3", "A3", "C4"],
      ["G2", "G3", "B3", "D4"],
      ["E2", "E3", "G#3", "B3"],
    ],
    bars: [
      [
        ["A4", 0.5],
        ["C5", 0.5],
        ["E5", 0.5],
        ["A5", 0.5],
        ["G5", 0.5],
        ["E5", 0.5],
        ["C5", 1],
      ],
      [
        ["F4", 0.5],
        ["A4", 0.5],
        ["C5", 0.5],
        ["F5", 0.5],
        ["E5", 0.5],
        ["C5", 0.5],
        ["A4", 1],
      ],
      [
        ["G4", 0.5],
        ["B4", 0.5],
        ["D5", 0.5],
        ["G5", 0.5],
        ["F5", 0.5],
        ["D5", 0.5],
        ["B4", 1],
      ],
      [
        ["E5", 0.5],
        ["G#5", 0.5],
        ["B5", 0.5],
        ["E6", 0.5],
        ["D6", 1],
        ["B5", 1],
      ],
      [
        ["A5", 1],
        ["G5", 0.5],
        ["E5", 0.5],
        ["C5", 1],
        ["E5", 1],
      ],
      [
        ["F5", 1],
        ["E5", 0.5],
        ["C5", 0.5],
        ["A4", 1],
        ["C5", 1],
      ],
      [
        ["D5", 1],
        ["B4", 0.5],
        ["G4", 0.5],
        ["B4", 1],
        ["D5", 1],
      ],
      [
        ["E5", 0.5],
        ["D5", 0.5],
        ["C5", 0.5],
        ["B4", 0.5],
        ["G#4", 2],
      ],
    ],
    lead: "square",
    leadGain: 0.09,
    lowpass: 2600,
    drums: {
      pattern: ["k", "", "k", "", "s", "", "k", "", "k", "", "k", "", "s", "", "k", "k"],
      gains: { kick: 0.6, snare: 0.24, hat: 0.1 },
    },
  });

// Stacja Amic: jazda na całego, 126 BPM, D-dur (D–h–G–A), piłokształtny syntezator z filtrem, bas ósemkami.
const stationTheme = () =>
  stageTheme({
    bpm: 126,
    chords: [
      ["D2", "D3", "F#3", "A3"],
      ["B1", "B2", "D3", "F#3"],
      ["G2", "G3", "B3", "D4"],
      ["A2", "A3", "C#4", "E4"],
      ["D2", "D3", "F#3", "A3"],
      ["B1", "B2", "D3", "F#3"],
      ["G2", "G3", "B3", "D4"],
      ["A2", "A3", "C#4", "E4"],
    ],
    bars: [
      [
        ["D5", 0.5],
        ["F#5", 0.5],
        ["A5", 1],
        ["F#5", 0.5],
        ["A5", 0.5],
        ["D6", 1],
      ],
      [
        ["B4", 0.5],
        ["D5", 0.5],
        ["F#5", 1],
        ["B5", 1],
        ["A5", 1],
      ],
      [
        ["G5", 0.5],
        ["F#5", 0.5],
        ["E5", 0.5],
        ["D5", 0.5],
        ["B4", 1],
        ["D5", 1],
      ],
      [
        ["E5", 1],
        ["A5", 1],
        ["C#6", 1],
        ["A5", 1],
      ],
      [
        ["D6", 0.5],
        ["C#6", 0.5],
        ["A5", 1],
        ["F#5", 0.5],
        ["A5", 0.5],
        ["D6", 1],
      ],
      [
        ["B5", 0.5],
        ["A5", 0.5],
        ["F#5", 1],
        ["D5", 1],
        ["F#5", 1],
      ],
      [
        ["G5", 1],
        ["B5", 1],
        ["D6", 0.5],
        ["B5", 0.5],
        ["G5", 1],
      ],
      [
        ["A5", 0.5],
        ["G5", 0.5],
        ["F#5", 0.5],
        ["E5", 0.5],
        ["D5", 2],
      ],
    ],
    lead: "saw",
    leadGain: 0.08,
    lowpass: 2200,
    drums: {
      pattern: ["k", "", "", "", "s", "", "", "k", "k", "", "", "", "s", "", "", ""],
      gains: { kick: 0.6, snare: 0.22, hat: 0.1 },
    },
  });

// Motyw humbaka: ocean, wolno, 72 BPM, D-dur, 8 taktów (ok. 27 s): pady, pieśń wieloryba, krople.
function whaleTheme() {
  const bpm = 72;
  const beat = 60 / bpm;
  const bars = 8;
  const length = samples(bars * 4 * beat);
  const chords = [
    ["D3", "F#3", "A3", "C#4"],
    ["B2", "D3", "F#3", "A3"],
    ["G2", "B2", "D3", "F#3"],
    ["A2", "C#3", "E3", "A3"],
    ["D3", "F#3", "A3", "C#4"],
    ["B2", "D3", "F#3", "A3"],
    ["G2", "B2", "D3", "F#3"],
    ["A2", "C#3", "E3", "G3"],
  ];
  const song = [
    [0, "A4", "D5", 2.5],
    [8, "F#5", "B4", 3],
    [16, "D5", "A5", 2],
    [20, "A5", "E5", 2.5],
    [26, "C#5", "D5", 3],
  ];
  const channels = circular(length, (output) => {
    const [left, right] = output;
    chords.forEach((chord, bar) => {
      const at = bar * 4 * beat;
      chord.forEach((name, index) => {
        const frequency = note(name);
        for (const [detune, pan] of [
          [0.997, -0.6],
          [1.003, 0.6],
        ]) {
          voice(output, at, 4 * beat, {
            wave: "saw",
            frequency: frequency * detune,
            env: { a: 1.2, d: 2, s: 0.8, r: 1.5 },
            gain: 0.05,
            lowpass: 900,
            pan: pan * (index % 2 ? 1 : -1),
          });
        }
      });
      voice(output, at, 4 * beat, { frequency: note(chord[0]) / 2, env: { a: 0.8, d: 2, s: 0.7, r: 1.2 }, gain: 0.22 });
      // krople: rzadkie, wysokie dźwięki marimby
      for (const step of [1.5, 3]) {
        const name = chord[(bar + Math.round(step * 2)) % chord.length];
        voice(output, at + step * beat, 0.04, {
          frequency: note(name) * 4,
          env: { a: 0.002, d: 0.3, s: 0, r: 0.3 },
          gain: 0.06,
          harmonics: [
            [1, 1],
            [3, 0.1],
          ],
          pan: step > 2 ? 0.5 : -0.5,
        });
      }
    });
    for (const [start, from, to, length] of song) {
      const a = note(from);
      const b = note(to);
      const call = buffer(length * beat + 3);
      voice(call, 0, length * beat, {
        frequency: (t) => a + (b - a) * (0.5 - 0.5 * Math.cos(Math.min(1, t / (length * beat)) * Math.PI)),
        env: { a: 0.4, d: 1.5, s: 0.7, r: 0.8 },
        gain: 0.16,
        harmonics: [
          [1, 1],
          [2, 0.3],
          [3, 0.1],
        ],
        vibrato: { rate: 4.5, depth: 0.012, delay: 0.4 },
        lowpass: 1400,
      });
      const wet = echo(call, beat * 0.75, 0.35);
      add(left, wet, start * beat, 0.9);
      add(right, wet, start * beat + 0.012, 0.8);
    }
    // szum fal (bardzo cichy)
    const waves = new Float32Array(left.length);
    let low = 0;
    for (let index = 0; index < waves.length; index += 1) {
      low += 0.01 * (random() * 2 - 1 - low);
      waves[index] = low * (0.5 + 0.5 * Math.sin((TAU * index) / SR / 6.6)) * 2.2;
    }
    add(left, waves, 0, 0.35);
    add(right, waves, 0, 0.3);
  });
  return channels.map((channel) => reverb(channel, { size: 1.4, mix: 0.25 }).slice(0, length));
}

// ---------- zapis ----------

function onsetOf(channel) {
  for (let index = 0; index < channel.length; index += 1) if (Math.abs(channel[index]) > ONSET_THRESHOLD) return index;
  return 0;
}

function toInt16(channel) {
  const result = new Int16Array(channel.length);
  for (let index = 0; index < channel.length; index += 1)
    result[index] = Math.max(-1, Math.min(1, channel[index])) * 32767;
  return result;
}

function encode(channels, kbps) {
  const encoder = new Mp3Encoder(channels.length, SR, kbps);
  const ints = channels.map(toInt16);
  const parts = [];
  for (let index = 0; index < ints[0].length; index += 1152) {
    const chunk = ints.map((channel) => channel.subarray(index, index + 1152));
    const data = channels.length === 2 ? encoder.encodeBuffer(chunk[0], chunk[1]) : encoder.encodeBuffer(chunk[0]);
    if (data.length) parts.push(Buffer.from(data));
  }
  const tail = encoder.flush();
  if (tail.length) parts.push(Buffer.from(tail));
  return Buffer.concat(parts);
}

// „Odcisk” początku pętli: pierwsze 4096 próbek kanału 0 jako Int8 w base64. Silnik szuka go w zdekodowanym
// buforze (korelacja), bo dekodery MP3 różnie traktują opóźnienie kodera — dzięki temu pętla nie ma szwu.
const FINGERPRINT_LENGTH = 4096;
function fingerprintOf(channel) {
  const bytes = new Int8Array(FINGERPRINT_LENGTH);
  for (let index = 0; index < FINGERPRINT_LENGTH; index += 1)
    bytes[index] = Math.round(Math.max(-1, Math.min(1, channel[index] || 0)) * 127);
  return Buffer.from(bytes.buffer).toString("base64");
}

function write(kind, name, channels, kbps, meta) {
  const file = `${kind}/${name}.mp3`;
  const target = join(OUT, file);
  mkdirSync(dirname(target), { recursive: true });
  const data = encode(channels, kbps);
  writeFileSync(target, data);
  const length = channels[0].length;
  return {
    file,
    bytes: data.length,
    duration: Number((length / SR).toFixed(4)),
    samples: length,
    onset: Number((onsetOf(channels[0]) / SR).toFixed(5)),
    ...meta,
    ...(meta.loop ? { fingerprint: fingerprintOf(channels[0]) } : {}),
  };
}

// Nagrania właściciela (opcjonalne): assets/audio/glosy/<nazwa-efektu>.wav (PCM 16 bit, dowolna częstotliwość,
// mono albo stereo) zastępuje syntezowany efekt, np. glosy/hu-hu.wav, glosy/trafienie-pracu.wav.
function readWav(path) {
  const file = readFileSync(path);
  if (file.toString("ascii", 0, 4) !== "RIFF" || file.toString("ascii", 8, 12) !== "WAVE")
    throw new Error(`${path}: to nie jest plik WAV`);
  let offset = 12;
  let format = null;
  while (offset + 8 <= file.length) {
    const id = file.toString("ascii", offset, offset + 4);
    const size = file.readUInt32LE(offset + 4);
    const body = offset + 8;
    if (id === "fmt ") {
      format = {
        code: file.readUInt16LE(body),
        channels: file.readUInt16LE(body + 2),
        rate: file.readUInt32LE(body + 4),
        bits: file.readUInt16LE(body + 14),
      };
    } else if (id === "data" && format) {
      if (format.code !== 1 || format.bits !== 16) throw new Error(`${path}: potrzebny WAV PCM 16 bit`);
      const frames = Math.floor(size / (2 * format.channels));
      const mono = new Float32Array(frames);
      for (let frame = 0; frame < frames; frame += 1) {
        let sum = 0;
        for (let channel = 0; channel < format.channels; channel += 1)
          sum += file.readInt16LE(body + (frame * format.channels + channel) * 2) / 32768;
        mono[frame] = sum / format.channels;
      }
      // przepróbkowanie liniowe do 44,1 kHz
      const length = Math.round((frames * SR) / format.rate);
      const result = new Float32Array(length);
      for (let index = 0; index < length; index += 1) {
        const position = (index * format.rate) / SR;
        const left = Math.floor(position);
        const fraction = position - left;
        result[index] = (mono[left] ?? 0) * (1 - fraction) + (mono[left + 1] ?? mono[left] ?? 0) * fraction;
      }
      return result;
    }
    offset = body + size + (size % 2);
  }
  throw new Error(`${path}: brak danych dźwięku`);
}

const manifest = { version: 1, sampleRate: SR, onsetThreshold: ONSET_THRESHOLD, sfx: {}, music: {} };

for (const [name, effect] of Object.entries(EFFECTS)) {
  random = mulberry32(name.length * 7919 + name.charCodeAt(0));
  const recording = join(OUT, "glosy", `${name}.wav`);
  const recorded = existsSync(recording);
  let data = recorded ? readWav(recording) : effect.render();
  if (!effect.loop) data = fadeOut(trimSilence(data));
  normalize(data);
  manifest.sfx[name] = write("sfx", name, [data], 64, {
    label: effect.label,
    volume: effect.volume,
    loop: Boolean(effect.loop),
    maxVoices: effect.maxVoices ?? 3,
    minGap: effect.minGap ?? 0.06,
    ...(recorded ? { recorded: true } : {}),
  });
}

// Sowie Ogrody (E7d1): motyw ogrodu — 84 BPM, F-dur (F–d–B–C ×2), miękki trójkąt z filtrem (spokojne
// popołudnie na działce), bas półnutami, cicha perkusja — muzyka do gry idle, która nie męczy w tle.
const gardenTheme = () =>
  stageTheme({
    bpm: 84,
    chords: [
      ["F2", "F3", "A3", "C4"],
      ["D2", "D3", "F3", "A3"],
      ["Bb2", "Bb3", "D4", "F4"],
      ["C3", "C4", "E4", "G4"],
      ["F2", "F3", "A3", "C4"],
      ["D2", "D3", "F3", "A3"],
      ["Bb2", "Bb3", "D4", "F4"],
      ["C3", "C4", "E4", "G4"],
    ],
    bars: [
      [
        ["A5", 1],
        ["C6", 0.5],
        ["A5", 0.5],
        ["G5", 1],
        ["F5", 1],
      ],
      [
        ["D5", 0.5],
        ["F5", 0.5],
        ["A5", 1],
        ["G5", 1],
        ["F5", 1],
      ],
      [
        ["D5", 1],
        ["F5", 0.5],
        ["Bb5", 0.5],
        ["A5", 1],
        ["G5", 1],
      ],
      [
        ["E5", 0.5],
        ["G5", 0.5],
        ["C6", 1],
        ["Bb5", 1],
        ["G5", 1],
      ],
      [
        ["F5", 0.5],
        ["A5", 0.5],
        ["C6", 1],
        ["D6", 0.5],
        ["C6", 0.5],
        ["A5", 1],
      ],
      [
        ["A5", 1],
        ["F5", 0.5],
        ["D5", 0.5],
        ["F5", 2],
      ],
      [
        ["G5", 0.5],
        ["A5", 0.5],
        ["Bb5", 1],
        ["A5", 0.5],
        ["G5", 0.5],
        ["F5", 1],
      ],
      [
        ["E5", 1],
        ["G5", 1],
        ["F5", 2],
      ],
    ],
    lead: "triangle",
    leadGain: 0.16,
    lowpass: 2400,
    bass: "half",
    drums: {
      pattern: ["k", "", "", "", "", "", "", "", "k", "", "", "", "s", "", "", ""],
      gains: { kick: 0.3, snare: 0.06, hat: 0.035 },
    },
  });

// Muzyka: [nazwa, synteza, opis, kb/s] — motyw biegu 80 kb/s i pieśń humbaka 64 kb/s (lżejsze: Sowia Ucieczka
// ma budżet < 800 KB razem z rejsem na humbaku).
for (const [name, render, meta, kbps] of [
  ["menu", menuTheme, { label: "Motyw menu", bpm: 112, volume: 0.55 }, 96],
  ["humbak", whaleTheme, { label: "Pieśń humbaka (bonus)", bpm: 72, volume: 0.6 }, 64],
  ["ucieczka", runTheme, { label: "Sowia Ucieczka — bieg", bpm: 125, volume: 0.5 }, 80],
  // Sowie Tory: motyw na każdą planszę, 48 kb/s (4 motywy + pieśń humbaka + efekty mieszczą się w 800 KB).
  ["tory-biedronka", shopTheme, { label: "Sowie Tory — sklep Biedronka", bpm: 118, volume: 0.5 }, 48],
  ["tory-festiwal", festivalTheme, { label: "Sowie Tory — festiwal roślin", bpm: 104, volume: 0.5 }, 48],
  ["tory-prl", prlTheme, { label: "Sowie Tory — blokowisko PRL", bpm: 132, volume: 0.5 }, 48],
  ["tory-amic", stationTheme, { label: "Sowie Tory — stacja Amic", bpm: 126, volume: 0.5 }, 48],
  // Sowa w Chmurach: motyw lotu, 48 kb/s (z efektami i pieśnią humbaka w budżecie 800 KB).
  ["chmury", cloudTheme, { label: "Sowa w Chmurach — lot", bpm: 100, volume: 0.5 }, 48],
  // Sowie Ogrody: motyw ogrodu, 48 kb/s (z efektami i pieśnią humbaka w budżecie 800 KB).
  ["ogrod", gardenTheme, { label: "Sowie Ogrody — ogród", bpm: 84, volume: 0.45 }, 48],
]) {
  random = mulberry32(name.length * 104729);
  const channels = render();
  const peak = Math.max(
    ...channels.map((channel) => channel.reduce((max, value) => Math.max(max, Math.abs(value)), 0)),
  );
  for (const channel of channels)
    for (let index = 0; index < channel.length; index += 1)
      channel[index] = Math.tanh((channel[index] / peak) * 0.8 * 1.2) / Math.tanh(1.2);
  manifest.music[name] = write("music", name, channels, kbps, { ...meta, loop: true });
}

writeFileSync(join(OUT, "audio.json"), `${JSON.stringify(manifest, null, 2)}\n`);
const total = [...Object.values(manifest.sfx), ...Object.values(manifest.music)].reduce(
  (sum, item) => sum + item.bytes,
  0,
);
console.log(
  `efekty: ${Object.keys(manifest.sfx).length}, muzyka: ${Object.keys(manifest.music).length}, razem ${(total / 1024).toFixed(0)} KB`,
);
