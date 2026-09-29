// Silnik dźwięku Sowiego Silnika (Analiza 2, rozdz. 2.4): Web Audio z szynami master / muzyka / efekty,
// suwaki 0–100, limit głosów, odstępy na dźwięk, wariacja wysokości ±5%, ściszanie muzyki, wyciszenie w tle,
// odblokowanie przy pierwszym dotknięciu (iOS), audioSession „ambient” i opcjonalne wibracje.

export const DEFAULT_VOLUMES = Object.freeze({ master: 80, music: 60, sfx: 80 });
export const MAX_VOICES = 16;
export const PITCH_VARIATION = 0.05;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Suwak 0–100 → wzmocnienie (krzywa kwadratowa — głośność „na ucho” zmienia się równomiernie).
export function volumeToGain(value) {
  const normalized = clamp(Number(value) || 0, 0, 100) / 100;
  return normalized * normalized;
}

// Pierwsza próbka głośniejsza niż próg (początek dźwięku po zdekodowaniu MP3).
export function findOnset(data, threshold = 0.02, limit = data.length) {
  const end = Math.min(limit, data.length);
  for (let index = 0; index < end; index += 1) if (Math.abs(data[index]) > threshold) return index;
  return 0;
}

/**
 * Punkty pętli bez szwu niezależnie od dekodera MP3: dekoder może (albo nie) dodać opóźnienie kodera na początku.
 * decodedOnset — początek dźwięku w zdekodowanym buforze (s), onset — początek w oryginale (s, z manifestu),
 * duration — długość oryginału (s). Zwraca przesunięcie startu i granice pętli w buforze.
 */
export function loopPoints({ decodedOnset, onset, duration, bufferDuration }) {
  const offset = clamp(decodedOnset - onset, 0, 0.2);
  const loopEnd = Math.min(bufferDuration ?? offset + duration, offset + duration);
  return { offset, loopStart: offset, loopEnd };
}

/**
 * Jedno okrążenie pętli jako osobny bufor: `frames` próbek od próbki `start` (bez opóźnienia dekodera na początku
 * i ciszy na końcu). Taki bufor gra w całości z `loop = true` — bez loopStart / loopEnd i bez przesunięcia startu,
 * czyli najprostszą, jednakową we wszystkich przeglądarkach ścieżką Web Audio.
 * createBuffer(kanały, próbki, częstotliwość) — z kontekstu audio. Zwraca oryginał, gdy nie ma czego przycinać.
 */
export function trimToLoop(buffer, start, frames, createBuffer) {
  const from = clamp(Math.round(start), 0, buffer.length);
  const to = Math.min(buffer.length, from + Math.round(frames));
  if (to - from < 2 || (from === 0 && to === buffer.length)) return buffer;
  const trimmed = createBuffer(buffer.numberOfChannels, to - from, buffer.sampleRate);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    trimmed.getChannelData(channel).set(buffer.getChannelData(channel).subarray(from, to));
  }
  return trimmed;
}

// Base64 → Int8Array (odcisk początku pętli z manifestu).
export function decodeFingerprint(base64) {
  const text = globalThis.atob ? globalThis.atob(base64) : Buffer.from(base64, "base64").toString("binary");
  const bytes = new Int8Array(text.length);
  for (let index = 0; index < text.length; index += 1) bytes[index] = (text.charCodeAt(index) << 24) >> 24;
  return bytes;
}

/**
 * Przesunięcie (s), przy którym zdekodowany bufor najlepiej pasuje do odcisku początku oryginału
 * (znormalizowana korelacja, co druga próbka). Działa także, gdy kontekst ma inną częstotliwość (np. 48 kHz).
 */
export function alignByFingerprint(data, sampleRate, fingerprint, fingerprintRate = 44100, maxLagSeconds = 0.1) {
  const ratio = sampleRate / fingerprintRate;
  const maxLag = Math.min(
    Math.round(maxLagSeconds * sampleRate),
    data.length - Math.ceil(fingerprint.length * ratio) - 1,
  );
  let bestLag = 0;
  let best = -Infinity;
  let fingerprintEnergy = 0;
  for (let index = 0; index < fingerprint.length; index += 2)
    fingerprintEnergy += fingerprint[index] * fingerprint[index];
  for (let lag = 0; lag <= maxLag; lag += 1) {
    let sum = 0;
    let energy = 0;
    for (let index = 0; index < fingerprint.length; index += 2) {
      const value = data[lag + Math.round(index * ratio)];
      sum += value * fingerprint[index];
      energy += value * value;
    }
    const score = energy > 0 ? sum / Math.sqrt(energy * fingerprintEnergy) : -Infinity;
    if (score > best) {
      best = score;
      bestLag = lag;
    }
  }
  return bestLag / sampleRate;
}

// Wybór zmiennej wysokości: pitch × (1 ± 5%).
export function variedRate(pitch = 1, random = Math.random, variation = PITCH_VARIATION) {
  return pitch * (1 + (random() * 2 - 1) * variation);
}

/**
 * Ustawienia z profilu → głośności szyn. Stare przełączniki music / sfx (false) wyciszają szynę,
 * nowe suwaki volumeMaster / volumeMusic / volumeSfx (0–100) ustawiają poziom.
 */
export function volumesFromSettings(settings = {}) {
  const pick = (key, fallback) =>
    Number.isFinite(Number(settings[key])) ? clamp(Number(settings[key]), 0, 100) : fallback;
  return {
    master: pick("volumeMaster", DEFAULT_VOLUMES.master),
    music: settings.music === false ? 0 : pick("volumeMusic", DEFAULT_VOLUMES.music),
    sfx: settings.sfx === false ? 0 : pick("volumeSfx", DEFAULT_VOLUMES.sfx),
  };
}

/**
 * createAudio({ manifest, baseUrl, createContext, fetchImpl, random, doc, nav, preloadOnUnlock })
 * manifest — zawartość assets/audio/audio.json; baseUrl — adres katalogu assets/audio/;
 * preloadOnUnlock — lista efektów wczytywanych po odblokowaniu (domyślnie wszystkie; menu potrzebuje kilku).
 */
export function createAudio({
  manifest,
  baseUrl,
  createContext = () => {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    return AudioContextClass ? new AudioContextClass({ latencyHint: "interactive" }) : null;
  },
  fetchImpl = (url) => globalThis.fetch(url),
  random = Math.random,
  doc = globalThis.document,
  nav = globalThis.navigator,
  preloadOnUnlock = null,
} = {}) {
  let context = null;
  let buses = null;
  let unlocked = false;
  const volumes = { ...DEFAULT_VOLUMES };
  let vibration = true;
  const buffers = new Map();
  const loading = new Map();
  const lastPlayed = new Map();
  const voices = [];
  const listeners = new Set();
  const stats = { played: 0, skipped: 0, failed: 0 };
  let music = null;
  let ducked = false;

  const emit = () => listeners.forEach((listener) => listener(api.state()));
  const entry = (kind, name) => manifest?.[kind]?.[name];
  const now = () => context?.currentTime ?? 0;

  function setGain(node, value, time = 0.05) {
    if (!node || !context) return;
    const at = now();
    node.gain.cancelScheduledValues(at);
    node.gain.setValueAtTime(node.gain.value, at);
    node.gain.linearRampToValueAtTime(value, at + time);
  }

  function applyVolumes() {
    if (!buses) return;
    setGain(buses.master, volumeToGain(volumes.master));
    setGain(buses.music, volumeToGain(volumes.music));
    setGain(buses.sfx, volumeToGain(volumes.sfx));
  }

  function ensureContext() {
    if (context) return context;
    // Safari 17+: dźwięk gry nie przerywa muzyki z innych aplikacji i respektuje przełącznik wyciszenia.
    try {
      if (nav?.audioSession) nav.audioSession.type = "ambient";
    } catch (_error) {
      // starsze przeglądarki
    }
    context = createContext();
    if (!context) return null;
    const master = context.createGain();
    const musicBus = context.createGain();
    const duck = context.createGain();
    const sfx = context.createGain();
    musicBus.connect(duck);
    duck.connect(master);
    sfx.connect(master);
    master.connect(context.destination);
    buses = { master, music: musicBus, duck, sfx };
    master.gain.value = volumeToGain(volumes.master);
    musicBus.gain.value = volumeToGain(volumes.music);
    sfx.gain.value = volumeToGain(volumes.sfx);
    context.onstatechange = emit;
    return context;
  }

  async function decode(arrayBuffer) {
    // Starsze Safari: tylko wersja z wywołaniami zwrotnymi.
    return new Promise((resolve, reject) => {
      const result = context.decodeAudioData(arrayBuffer, resolve, reject);
      if (result?.then) result.then(resolve, reject);
    });
  }

  function load(kind, name) {
    const key = `${kind}:${name}`;
    if (buffers.has(key)) return Promise.resolve(buffers.get(key));
    if (loading.has(key)) return loading.get(key);
    const item = entry(kind, name);
    if (!item || !ensureContext()) return Promise.resolve(null);
    const request = fetchImpl(new URL(item.file, baseUrl).href)
      .then((response) => {
        if (!response.ok) throw new Error(`${item.file}: ${response.status}`);
        return response.arrayBuffer();
      })
      .then(decode)
      .then((audioBuffer) => {
        const data = audioBuffer.getChannelData(0);
        // Pętle: dokładne dopasowanie odciskiem; krótkie efekty: pierwsza głośna próbka (wystarczy do ucięcia ciszy).
        const decodedOnset = item.fingerprint
          ? alignByFingerprint(data, audioBuffer.sampleRate, decodeFingerprint(item.fingerprint), manifest.sampleRate) +
            item.onset
          : findOnset(data, manifest.onsetThreshold ?? 0.02, Math.min(data.length, audioBuffer.sampleRate)) /
            audioBuffer.sampleRate;
        const points = loopPoints({
          decodedOnset,
          onset: item.onset,
          duration: item.duration,
          bufferDuration: audioBuffer.duration,
        });
        // Pętle (muzyka, szybowanie): osobny bufor z jednym okrążeniem, długość z liczby próbek oryginału
        // (przeliczonej na częstotliwość kontekstu); efekty: cały bufor, start od pierwszej głośnej próbki.
        const rate = audioBuffer.sampleRate;
        const frames = item.samples
          ? (item.samples * rate) / (manifest.sampleRate || rate)
          : (points.loopEnd - points.offset) * rate;
        const loaded = item.loop
          ? {
              buffer: trimToLoop(audioBuffer, points.offset * rate, frames, (...args) => context.createBuffer(...args)),
              offset: 0,
              item,
            }
          : { buffer: audioBuffer, offset: points.offset, item };
        buffers.set(key, loaded);
        emit();
        return loaded;
      })
      .catch((error) => {
        stats.failed += 1;
        console.warn(`SowieGry: nie udało się wczytać dźwięku ${name}`, error);
        return null;
      })
      .finally(() => loading.delete(key));
    loading.set(key, request);
    return request;
  }

  function running() {
    return unlocked && context && context.state === "running";
  }

  function stopVoice(voice, fade = 0.03) {
    const index = voices.indexOf(voice);
    if (index >= 0) voices.splice(index, 1);
    try {
      const at = now();
      voice.gain.gain.cancelScheduledValues(at);
      voice.gain.gain.setValueAtTime(voice.gain.gain.value, at);
      voice.gain.gain.linearRampToValueAtTime(0, at + fade);
      voice.source.stop(at + fade + 0.01);
    } catch (_error) {
      // już zatrzymany
    }
  }

  function start(loaded, { bus, volume = 1, rate = 1, pan = 0, loop = false }) {
    const source = context.createBufferSource();
    source.buffer = loaded.buffer;
    source.playbackRate.value = rate;
    // Bufor pętli to dokładnie jedno okrążenie (trimToLoop) — gra w całości, bez punktów pętli.
    if (loop) source.loop = true;
    const gain = context.createGain();
    gain.gain.value = volume * (loaded.item.volume ?? 1);
    let last = gain;
    if (pan && context.createStereoPanner) {
      const panner = context.createStereoPanner();
      panner.pan.value = clamp(pan, -1, 1);
      gain.connect(panner);
      last = panner;
    }
    source.connect(gain);
    last.connect(bus);
    if (loaded.offset > 0) source.start(now(), loaded.offset);
    else source.start(now());
    return { source, gain };
  }

  const api = {
    // Odblokowanie (musi być wywołane w obsłudze dotknięcia / klawisza).
    unlock() {
      if (!ensureContext()) return Promise.resolve(false);
      unlocked = true;
      // iOS: krótki cichy bufor w geście użytkownika „budzi” wyjście audio.
      try {
        const silent = context.createBuffer(1, 1, context.sampleRate);
        const source = context.createBufferSource();
        source.buffer = silent;
        source.connect(context.destination);
        source.start(0);
      } catch (_error) {
        // bez znaczenia
      }
      const resumed = context.state === "running" ? Promise.resolve() : context.resume?.() || Promise.resolve();
      return Promise.resolve(resumed)
        .catch(() => {})
        .then(() => {
          emit();
          api.preload(preloadOnUnlock || undefined);
          return context.state === "running";
        });
    },
    // Odblokowanie przy pierwszym dotknięciu / klawiszu; zwraca funkcję sprzątającą.
    // ignore(zdarzenie) → true pomija gest (np. stuknięcie w odnośnik, po którym strona i tak się zmieni —
    // pobieranie dźwięków zostałoby przerwane).
    bindUnlock(target = globalThis.window, { ignore = () => false } = {}) {
      if (!target?.addEventListener) return () => {};
      const events = ["pointerdown", "touchend", "keydown"];
      const handler = (event) => {
        if (ignore(event)) return;
        api.unlock();
        events.forEach((type) => target.removeEventListener(type, handler, true));
      };
      events.forEach((type) => target.addEventListener(type, handler, true));
      return () => events.forEach((type) => target.removeEventListener(type, handler, true));
    },
    // Wczytuje efekty (muzyka jest ładowana leniwie przy pierwszym odtworzeniu).
    preload(names = Object.keys(manifest?.sfx || {})) {
      return Promise.all(names.map((name) => load("sfx", name)));
    },
    loaded: (name) => buffers.has(`sfx:${name}`),
    // Efekt: pitch (np. rosnący z combo), volume 0–1, pan −1…1, variation (±5%).
    play(name, { pitch = 1, volume = 1, pan = 0, variation = true } = {}) {
      const item = entry("sfx", name);
      if (!item) throw new Error(`Nieznany dźwięk: ${name}`);
      if (!running() || volumes.sfx <= 0 || volumes.master <= 0) {
        stats.skipped += 1;
        return null;
      }
      const loaded = buffers.get(`sfx:${name}`);
      if (!loaded) {
        load("sfx", name);
        stats.skipped += 1;
        return null;
      }
      const time = now();
      if (time - (lastPlayed.get(name) ?? -Infinity) < (item.minGap ?? 0.05)) {
        stats.skipped += 1;
        return null;
      }
      const same = voices.filter((voice) => voice.name === name);
      if (same.length >= (item.maxVoices ?? 3)) stopVoice(same[0]);
      if (voices.length >= MAX_VOICES) stopVoice(voices[0]);
      const rate = variation ? variedRate(pitch, random) : pitch;
      const { source, gain } = start(loaded, { bus: buses.sfx, volume, rate, pan, loop: item.loop });
      const voice = { name, source, gain, startedAt: time, rate };
      voices.push(voice);
      source.onended = () => {
        const index = voices.indexOf(voice);
        if (index >= 0) voices.splice(index, 1);
      };
      lastPlayed.set(name, time);
      stats.played += 1;
      return { stop: (fade) => stopVoice(voice, fade), rate };
    },
    // Muzyka: ładowana przy pierwszym użyciu, przenikanie z poprzednią.
    async playMusic(name, { fade = 0.8 } = {}) {
      if (!entry("music", name)) throw new Error(`Nieznana muzyka: ${name}`);
      if (music?.name === name) return true;
      const previous = music;
      music = { name, voice: null };
      emit();
      const loaded = await load("music", name);
      if (!loaded || music?.name !== name || !context) return false;
      const voice = start(loaded, { bus: buses.music, volume: 0, loop: true });
      voice.gain.gain.setValueAtTime(0, now());
      voice.gain.gain.linearRampToValueAtTime(loaded.item.volume ?? 1, now() + fade);
      music.voice = voice;
      if (previous?.voice) stopVoice(previous.voice, fade);
      emit();
      return true;
    },
    stopMusic({ fade = 0.6 } = {}) {
      if (music?.voice) stopVoice(music.voice, fade);
      music = null;
      emit();
    },
    currentMusic: () => music?.name ?? null,
    // Ściszanie muzyki (np. na czas pieśni humbaka albo komunikatu).
    duck(amount = 0.35, { attack = 0.25 } = {}) {
      ensureContext();
      ducked = true;
      setGain(buses?.duck, clamp(amount, 0, 1), attack);
      emit();
    },
    unduck({ release = 0.6 } = {}) {
      ducked = false;
      setGain(buses?.duck, 1, release);
      emit();
    },
    setVolume(bus, value) {
      if (!(bus in volumes)) throw new Error(`Nieznana szyna: ${bus}`);
      volumes[bus] = clamp(Math.round(Number(value) || 0), 0, 100);
      applyVolumes();
      emit();
    },
    volume: (bus) => volumes[bus],
    applySettings(settings = {}) {
      Object.assign(volumes, volumesFromSettings(settings));
      vibration = settings.vibration !== false;
      applyVolumes();
      emit();
    },
    setVibration(on) {
      vibration = Boolean(on);
      emit();
    },
    // Wibracje (Android; iPhone nie obsługuje navigator.vibrate).
    vibrate(pattern = 30) {
      if (!vibration || typeof nav?.vibrate !== "function") return false;
      try {
        return nav.vibrate(pattern);
      } catch (_error) {
        return false;
      }
    },
    canVibrate: () => typeof nav?.vibrate === "function",
    state: () => ({
      unlocked,
      context: context?.state ?? "brak",
      session: nav?.audioSession?.type ?? null,
      loaded: [...buffers.keys()].filter((key) => key.startsWith("sfx:")).length,
      voices: voices.length,
      music: music?.name ?? null,
      ducked,
      volumes: { ...volumes },
      vibration,
    }),
    stats: () => ({ ...stats }),
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    context: () => context,
  };

  // Wyciszenie w tle (inna aplikacja, blokada ekranu) i wznowienie po powrocie.
  doc?.addEventListener?.("visibilitychange", () => {
    if (!context) return;
    if (doc.visibilityState === "hidden") context.suspend?.().catch?.(() => {});
    else if (unlocked) context.resume?.().catch?.(() => {});
  });

  return api;
}

/**
 * Łączy dźwięk z profilem SowieCloud: ustawienia z profilu → silnik, zmiany suwaków → profil (po 1 s).
 * Zwraca funkcję zapisu: save({ volumeMusic: 40 }).
 */
export function connectAudioSettings(audio, cloud = globalThis.window?.SowieCloud) {
  if (!cloud) return () => {};
  const apply = () => audio.applySettings(cloud.profile()?.settings || {});
  cloud.ready?.then(apply);
  cloud.onProfileReload?.(apply);
  return (changes) =>
    cloud.updateProfile?.(
      (profile) => {
        Object.assign(profile.settings, changes);
      },
      { delayMs: 1000 },
    );
}
