// Widok: świat w jednostkach logicznych, a nie w pikselach. Skala jest dobierana tak, żeby zawsze było
// widać co najmniej `minWorld` (np. 9 × 16 jednostek w pionie) — czas reakcji nie zależy od telefonu.
// Rozdzielczość płótna = rozmiar CSS × DPR (maksymalnie 2).

// Czysta funkcja: układ dla danego rozmiaru. `lockedScale` zachowuje skalę (np. w trakcie gry, gdy chowa
// się pasek adresu), chyba że widoczny świat skurczyłby się o więcej niż `tolerance` względem `minWorld`.
export function computeLayout({
  cssWidth,
  cssHeight,
  minWorld,
  dpr = 1,
  maxDpr = 2,
  lockedScale = null,
  tolerance = 0.15,
}) {
  const width = Math.max(1, cssWidth);
  const height = Math.max(1, cssHeight);
  const pixelRatio = Math.min(maxDpr, Math.max(1, dpr || 1));
  const fitScale = Math.min(width / minWorld.width, height / minWorld.height);
  let scale = fitScale;
  if (lockedScale) {
    const tooSmall =
      width / lockedScale < minWorld.width * (1 - tolerance) ||
      height / lockedScale < minWorld.height * (1 - tolerance);
    scale = tooSmall ? fitScale : lockedScale;
  }
  return {
    cssWidth: width,
    cssHeight: height,
    pixelRatio,
    scale,
    worldWidth: width / scale,
    worldHeight: height / scale,
    canvasWidth: Math.round(width * pixelRatio),
    canvasHeight: Math.round(height * pixelRatio),
  };
}

// Kamera wskazuje punkt świata na środku ekranu.
export function worldToScreen(layout, camera, wx, wy, out = { x: 0, y: 0 }) {
  const k = layout.scale * (camera?.zoom ?? 1);
  out.x = (wx - (camera?.x ?? 0) - (camera?.shakeX ?? 0)) * k + layout.cssWidth / 2;
  out.y = (wy - (camera?.y ?? 0) - (camera?.shakeY ?? 0)) * k + layout.cssHeight / 2;
  return out;
}

export function screenToWorld(layout, camera, sx, sy, out = { x: 0, y: 0 }) {
  const k = layout.scale * (camera?.zoom ?? 1);
  out.x = (sx - layout.cssWidth / 2) / k + (camera?.x ?? 0) + (camera?.shakeX ?? 0);
  out.y = (sy - layout.cssHeight / 2) / k + (camera?.y ?? 0) + (camera?.shakeY ?? 0);
  return out;
}

export function createView({
  canvas,
  minWorld = { width: 9, height: 16 },
  maxDpr = 2,
  getSize = () => {
    const rect = (canvas.parentElement || canvas).getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  },
  getDpr = () => globalThis.devicePixelRatio || 1,
}) {
  let layout = null;
  let locked = false;
  const listeners = new Set();

  function resize() {
    const size = getSize();
    layout = computeLayout({
      cssWidth: size.width,
      cssHeight: size.height,
      minWorld,
      dpr: getDpr(),
      maxDpr,
      lockedScale: locked && layout ? layout.scale : null,
    });
    if (canvas.width !== layout.canvasWidth) canvas.width = layout.canvasWidth;
    if (canvas.height !== layout.canvasHeight) canvas.height = layout.canvasHeight;
    canvas.style.width = `${layout.cssWidth}px`;
    canvas.style.height = `${layout.cssHeight}px`;
    for (const listener of listeners) listener(layout);
    return layout;
  }

  return {
    resize,
    layout: () => layout || resize(),
    // Transformacja kontekstu 2D: dalsze rysowanie w jednostkach świata.
    apply(context, camera) {
      const current = layout || resize();
      const k = current.pixelRatio * current.scale * (camera?.zoom ?? 1);
      const origin = worldToScreen(current, camera, 0, 0);
      context.setTransform(k, 0, 0, k, origin.x * current.pixelRatio, origin.y * current.pixelRatio);
    },
    // Transformacja do rysowania w pikselach CSS (np. HUD na płótnie).
    applyScreen(context) {
      const current = layout || resize();
      context.setTransform(current.pixelRatio, 0, 0, current.pixelRatio, 0, 0);
    },
    toScreen: (camera, wx, wy, out) => worldToScreen(layout || resize(), camera, wx, wy, out),
    toWorld: (camera, sx, sy, out) => screenToWorld(layout || resize(), camera, sx, sy, out),
    lockScale(value = true) {
      locked = Boolean(value);
    },
    onResize(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
