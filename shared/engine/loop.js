// Pętla gry ze stałym krokiem symulacji (domyślnie 1/120 s) i interpolacją rysowania.
// update(step) liczy fizykę zawsze tym samym krokiem, render(alpha) dostaje ułamek kroku do interpolacji.
// Rysowanie najwyżej 60 razy na sekundę (Analiza 6, W1: ekrany 90/120 Hz wołają klatki częściej), w trybie
// „Oszczędzanie baterii” 30. Symulacja nadrabia do 0,25 s na klatkę (30 kroków) — dawniej 12 kroków (0,1 s), przez co
// na bardzo wolnym telefonie gra zwalniała (Analiza 6, przyczyna P7).
import { createFrameLimiter } from "./quality.js";

export const STEP = 1 / 120;

export function createLoop({
  update,
  render,
  step = STEP,
  maxFrame = 0.25,
  maxSteps = 30,
  raf = (callback) => requestAnimationFrame(callback),
  caf = (id) => cancelAnimationFrame(id),
}) {
  let running = false;
  let paused = false;
  let last = null;
  let accumulator = 0;
  let frameId = null;
  let fps = 60;
  const limiter = createFrameLimiter(60);
  const frameListeners = new Set();

  // Jedna klatka; `time` w milisekundach (jak w requestAnimationFrame).
  function tick(time) {
    const delta = last === null ? step : Math.min(maxFrame, Math.max(0, (time - last) / 1000));
    last = time;
    if (delta > 0) fps = fps * 0.9 + (1 / delta) * 0.1;

    let steps = 0;
    if (!paused) {
      accumulator += delta;
      while (accumulator >= step && steps < maxSteps) {
        update(step);
        accumulator -= step;
        steps += 1;
      }
      // Za wolne urządzenie: zamiast „spirali śmierci” gubimy zaległy czas.
      if (steps === maxSteps) accumulator = 0;
    }

    const rendered = limiter.tick(delta);
    if (rendered) render(paused ? 0 : accumulator / step);
    for (const listener of frameListeners) listener({ delta, fps, steps, rendered });
    return steps;
  }

  function frame(time) {
    if (!running) return;
    tick(time);
    frameId = raf(frame);
  }

  return {
    tick,
    start() {
      if (running) return;
      running = true;
      last = null;
      frameId = raf(frame);
    },
    stop() {
      running = false;
      if (frameId !== null) caf(frameId);
      frameId = null;
    },
    pause() {
      paused = true;
    },
    resume() {
      if (!paused) return;
      paused = false;
      last = null;
      accumulator = 0;
      limiter.reset();
    },
    isPaused: () => paused,
    isRunning: () => running,
    fps: () => fps,
    // Najwyżej 60 klatek/s (ekran 60 Hz — każda klatka, 120 Hz — co druga) albo np. 30 w „Oszczędzaniu baterii”.
    setRenderRate(perSecond) {
      limiter.setRate(Math.min(60, Number(perSecond) || 60));
    },
    renderRate: () => limiter.rate(),
    onFrame(listener) {
      frameListeners.add(listener);
      return () => frameListeners.delete(listener);
    },
  };
}
