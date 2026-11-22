// Licznik płynności `?perf=1` (Analiza 6, W0): w rogu ekranu klatki na sekundę (narysowane przez grę), najdłuższa
// klatka z ostatnich 5 s, ile razy na sekundę przeglądarka woła klatki (60 / 90 / 120 — odświeżanie ekranu), ostrość
// płótna, poziom automatu płynności i pamięć skryptów (Chrome). Bez `?perf=1` nic nie robi i nic nie kosztuje.

export const PERF_PARAM = "perf";

export function perfEnabled(search = globalThis.location?.search || "") {
  return new URLSearchParams(search).get(PERF_PARAM) === "1";
}

const NOOP = Object.freeze({ enabled: false, frame() {}, destroy() {}, stats: () => null, node: null });

/**
 * createPerfMeter({ enabled, quality, canvas, now, raf, caf, root }) → { frame(), stats(), destroy() }.
 * `frame()` — gra woła przy każdym narysowaniu klatki; `canvas` — płótno (albo funkcja zwracająca płótno) do
 * odczytu ostrości; `quality` — automat płynności (shared/engine/quality.js).
 */
export function createPerfMeter({
  enabled = perfEnabled(),
  quality = null,
  canvas = null,
  now = () => performance.now(),
  raf = (callback) => requestAnimationFrame(callback),
  caf = (id) => cancelAnimationFrame(id),
  root = globalThis.document?.body,
} = {}) {
  if (!enabled) return NOOP;
  let rafFrames = 0;
  let drawn = 0;
  let lastDrawn = null;
  let windowStart = now();
  // Najdłuższe odstępy między narysowanymi klatkami w kolejnych półsekundach (10 ostatnich = 5 s).
  const longest = [0];
  let rafId = null;
  let last = { fps: 0, rafRate: 0, longestMs: 0 };

  const node = globalThis.document?.createElement?.("div") || null;
  if (node) {
    node.className = "sowie-perf-meter";
    node.setAttribute("aria-hidden", "true");
    Object.assign(node.style, {
      position: "fixed",
      left: "max(6px, env(safe-area-inset-left))",
      bottom: "max(6px, env(safe-area-inset-bottom))",
      zIndex: "2147483000",
      pointerEvents: "none",
      padding: "4px 7px",
      borderRadius: "8px",
      background: "rgba(59, 47, 74, 0.82)",
      color: "#ffffff",
      font: "600 11px/1.35 system-ui, sans-serif",
      whiteSpace: "pre",
    });
    node.textContent = "pomiar…";
    root?.appendChild(node);
  }

  const canvasOf = () => (typeof canvas === "function" ? canvas() : canvas);

  function report() {
    const time = now();
    const seconds = Math.max(0.001, (time - windowStart) / 1000);
    const fps = drawn / seconds;
    const rafRate = rafFrames / seconds;
    const longestMs = Math.max(...longest);
    last = { fps, rafRate, longestMs };
    windowStart = time;
    drawn = 0;
    rafFrames = 0;
    longest.push(0);
    if (longest.length > 10) longest.shift();
    if (!node) return;
    const target = canvasOf();
    const box = target?.getBoundingClientRect?.();
    const ratio = target && box?.width ? (target.width / box.width).toFixed(2) : "—";
    const level = quality ? `${quality.level()} (${quality.mode()})` : "—";
    const memory = globalThis.performance?.memory?.usedJSHeapSize;
    const lines = [
      `${fps.toFixed(0)} kl./s · najdł. ${longestMs.toFixed(0)} ms`,
      `ekran ${rafRate.toFixed(0)}/s · ostrość ${ratio}`,
      `automat ${level}${memory ? ` · ${(memory / 1048576).toFixed(0)} MB` : ""}`,
    ];
    node.textContent = lines.join("\n");
  }

  function tick() {
    rafFrames += 1;
    if (now() - windowStart >= 500) report();
    rafId = raf(tick);
  }
  rafId = raf(tick);

  return {
    enabled: true,
    node,
    frame() {
      const time = now();
      if (lastDrawn !== null) longest[longest.length - 1] = Math.max(longest[longest.length - 1], time - lastDrawn);
      lastDrawn = time;
      drawn += 1;
    },
    stats: () => ({ ...last }),
    destroy() {
      if (rafId !== null) caf(rafId);
      rafId = null;
      node?.remove?.();
    },
  };
}
