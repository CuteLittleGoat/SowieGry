// Sowie Tory — finał planszy (Analiza 2, rozdz. 3.2): działka z okrągłym basenem ogrodowym i sekwencja ok. 4 s —
// sowa biegnie do środka → wybija się → wskakuje do basenu (plusk i bąbelki) → przemiana w humbaka z fontanną.
// Czysta logika osi czasu (testy jednostkowe); rysuje render.js. Po pierwszym pełnym obejrzeniu (`finishSeen`
// w dokumencie gry `sowiegry_gry/sowa3`) tapnięcie skraca finał.

// Czas faz (s), w tej kolejności.
export const FINALE = Object.freeze({ run: 1.2, jump: 0.7, splash: 0.7, morph: 1.4 });
export const FINALE_ORDER = Object.freeze(["run", "jump", "splash", "morph"]);
export const FINALE_DURATION = FINALE_ORDER.reduce((sum, phase) => sum + FINALE[phase], 0);

// Faza i postęp (0–1) w chwili `t` od początku finału; po końcu — { phase: "done", progress: 1 }.
export function finalePhase(t) {
  let start = 0;
  for (const phase of FINALE_ORDER) {
    if (t < start + FINALE[phase]) return { phase, progress: Math.max(0, (t - start) / FINALE[phase]) };
    start += FINALE[phase];
  }
  return { phase: "done", progress: 1 };
}

// Działka: środek basenu (m przed miejscem, w którym sowa zaczyna finał), promień, wysokość ścianki i lustra wody.
export const GARDEN = Object.freeze({ poolZ: 4.8, poolRadius: 2.3, wall: 0.9, water: 0.75, runTo: 1.8, leap: 2 });

const easeOut = (p) => p * (2 - p);
const easeInOut = (p) => p * p * (3 - 2 * p);

// Sowa w finale (m): bieg do basenu, łuk skoku, zanurzenie; potem niewidoczna. `startX` — gdzie była na torze.
export function finaleOwl(state, startX = 0) {
  const { phase, progress: p } = finalePhase(state.t);
  if (phase === "run") return { x: startX * (1 - easeInOut(p)), y: 0, z: GARDEN.runTo * easeOut(p), alpha: 1 };
  if (phase === "jump") {
    const z = GARDEN.runTo + (GARDEN.poolZ - GARDEN.runTo) * p;
    return { x: 0, y: GARDEN.leap * 4 * p * (1 - p) + GARDEN.water * p, z, alpha: 1 };
  }
  if (phase === "splash" && p < 0.35) {
    return { x: 0, y: GARDEN.water - p * 1.2, z: GARDEN.poolZ, alpha: 1 - p / 0.35 };
  }
  return null;
}

// Humbak wynurzający się z basenu (przemiana): wysokość nad wodą (m), skala 0,6–1 i fontanna (0–1).
export function finaleWhale(state) {
  const { phase, progress: p } = finalePhase(state.t);
  if (phase === "done") return { y: GARDEN.water + 0.5, scale: 1, spout: 0 };
  if (phase !== "morph") return null;
  const rise = easeOut(Math.min(1, p / 0.6));
  return {
    y: GARDEN.water - 0.4 + rise * 0.9,
    scale: 0.6 + rise * 0.4,
    spout: p > 0.45 ? Math.sin(((p - 0.45) / 0.55) * Math.PI) : 0,
  };
}

// Zdarzenie wysyłane przy wejściu w fazę (dźwięk, cząsteczki).
const PHASE_EVENTS = Object.freeze({ jump: "finaleJump", splash: "finaleSplash", morph: "finaleMorph" });

/**
 * Finał: `createFinale({ seen })` → { state, update(dt) → zdarzenia, skip() → czy skrócono, done() }.
 * `seen` — finał był już raz obejrzany do końca (tylko wtedy `skip()` działa). Zdarzenia: `finaleJump`,
 * `finaleSplash`, `finaleMorph`, `finaleDone { skipped }`.
 */
export function createFinale({ seen = false } = {}) {
  const state = { t: 0, phase: "run", progress: 0, seen: Boolean(seen), skipped: false };

  function finish(events) {
    state.phase = "done";
    state.progress = 1;
    events.push({ type: "finaleDone", skipped: state.skipped });
  }

  return {
    state,
    update(dt) {
      const events = [];
      if (state.phase === "done") return events;
      state.t = Math.min(FINALE_DURATION, state.t + dt);
      const next = finalePhase(state.t);
      // Przy dużym kroku czasu (np. po pauzie) zdarzenia pominiętych faz też się pojawiają, po kolei.
      const from = FINALE_ORDER.indexOf(state.phase);
      const to = next.phase === "done" ? FINALE_ORDER.length : FINALE_ORDER.indexOf(next.phase);
      for (let index = from + 1; index <= Math.min(to, FINALE_ORDER.length - 1); index += 1) {
        const type = PHASE_EVENTS[FINALE_ORDER[index]];
        if (type) events.push({ type });
      }
      if (next.phase === "done") finish(events);
      else {
        state.phase = next.phase;
        state.progress = next.progress;
      }
      return events;
    },
    skip() {
      if (!state.seen || state.phase === "done") return [];
      state.skipped = true;
      state.t = FINALE_DURATION;
      const events = [];
      finish(events);
      return events;
    },
    done: () => state.phase === "done",
  };
}
