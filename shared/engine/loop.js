// Pętla gry ze stałym krokiem symulacji (domyślnie 1/120 s) i interpolacją rysowania.
// update(step) liczy fizykę zawsze tym samym krokiem, render(alpha) dostaje ułamek kroku do interpolacji.

export const STEP = 1 / 120;

export function createLoop({
  update,
  render,
  step = STEP,
  maxFrame = 0.25,
  maxSteps = 12,
  raf = (callback) => requestAnimationFrame(callback),
  caf = (id) => cancelAnimationFrame(id),
}) {
  let running = false;
  let paused = false;
  let last = null;
  let accumulator = 0;
  let frameId = null;
  let fps = 60;
  let renderInterval = 0;
  let sinceRender = Infinity;
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

    sinceRender += delta;
    if (sinceRender + 1e-6 >= renderInterval) {
      sinceRender = 0;
      render(paused ? 0 : accumulator / step);
    }
    for (const listener of frameListeners) listener({ delta, fps, steps });
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
    },
    isPaused: () => paused,
    isRunning: () => running,
    fps: () => fps,
    // 60 (co klatkę) albo np. 30 w trybie „Oszczędzanie baterii”.
    setRenderRate(perSecond) {
      renderInterval = perSecond >= 60 ? 0 : 1 / perSecond;
    },
    onFrame(listener) {
      frameListeners.add(listener);
      return () => frameListeners.delete(listener);
    },
  };
}
