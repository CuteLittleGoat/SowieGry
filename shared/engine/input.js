import { measureSafeAreas } from "./safe-area.js";

// Gesty w dowolnym miejscu planszy: stuknięcie, przytrzymanie, przesunięcie (swipe) i przeciąganie.
// Martwe strefy przy lewej/prawej krawędzi (systemowy gest „cofnij”) i przy dolnej (pasek domowy iPhone'a).
// Rozpoznawanie jest czystą logiką (testy jednostkowe), a bindInput() podpina je do zdarzeń przeglądarki.

export const DEFAULTS = Object.freeze({
  holdMs: 180, // po tylu ms bez ruchu zaczyna się przytrzymanie
  moveTolerance: 12, // ruch mniejszy niż tyle px to nadal stuknięcie/przytrzymanie
  swipeDistance: 24, // swipe: co najmniej 24 px …
  swipeMs: 200, // … w czasie do 200 ms
  deadZone: Object.freeze({ left: 18, right: 18, bottom: 20 }),
});

export function inDeadZone(x, y, width, height, deadZone = DEFAULTS.deadZone, safeBottom = 0) {
  return x < deadZone.left || x > width - deadZone.right || y > height - deadZone.bottom - safeBottom;
}

export function swipeDirection(dx, dy) {
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

export function createGestureRecognizer(options = {}) {
  const config = { ...DEFAULTS, ...options, deadZone: { ...DEFAULTS.deadZone, ...(options.deadZone || {}) } };
  const emit = options.onGesture || (() => {});
  let size = { width: options.width ?? Infinity, height: options.height ?? Infinity, safeBottom: 0 };
  let pointer = null; // aktywny wskaźnik (obsługujemy jeden — pierwszy palec)

  function send(type, extra = {}) {
    const event = { type, x: pointer?.x ?? 0, y: pointer?.y ?? 0, ...extra };
    emit(event);
    return event;
  }

  function distance() {
    return Math.hypot(pointer.x - pointer.x0, pointer.y - pointer.y0);
  }

  return {
    config,
    setSize(width, height, safeBottom = 0) {
      size = { width, height, safeBottom };
    },
    down(id, x, y, time) {
      if (pointer) return null;
      if (inDeadZone(x, y, size.width, size.height, config.deadZone, size.safeBottom)) {
        emit({ type: "ignored", x, y, reason: "martwa-strefa" });
        return null;
      }
      pointer = { id, x0: x, y0: y, t0: time, x, y, state: "pending" };
      return send("press");
    },
    move(id, x, y, time) {
      if (!pointer || pointer.id !== id) return null;
      pointer.x = x;
      pointer.y = y;
      const dx = x - pointer.x0;
      const dy = y - pointer.y0;
      const moved = distance();
      if (pointer.state === "pending") {
        if (moved >= config.swipeDistance && time - pointer.t0 <= config.swipeMs) {
          pointer.state = "swiped";
          return send("swipe", { direction: swipeDirection(dx, dy), dx, dy });
        }
        if (moved >= config.moveTolerance && time - pointer.t0 > config.swipeMs) {
          pointer.state = "drag";
          send("dragstart", { dx, dy });
          return send("drag", { dx, dy });
        }
        return null;
      }
      if (pointer.state === "hold" && moved >= config.moveTolerance) {
        pointer.state = "drag";
        send("holdend");
        send("dragstart", { dx, dy });
        return send("drag", { dx, dy });
      }
      if (pointer.state === "drag") return send("drag", { dx, dy });
      return null;
    },
    // Wywoływane z pętli (lub zegara) — wykrywa przytrzymanie.
    update(time) {
      if (pointer?.state === "pending" && time - pointer.t0 >= config.holdMs && distance() < config.moveTolerance) {
        pointer.state = "hold";
        return send("holdstart");
      }
      return null;
    },
    up(id, x, y, time) {
      if (!pointer || pointer.id !== id) return null;
      if (x !== undefined) {
        pointer.x = x;
        pointer.y = y;
      }
      const state = pointer.state;
      if (state === "pending") {
        const moved = distance();
        if (moved >= config.swipeDistance && time - pointer.t0 <= config.swipeMs) {
          send("swipe", { direction: swipeDirection(pointer.x - pointer.x0, pointer.y - pointer.y0) });
        } else if (moved < config.moveTolerance) {
          if (time - pointer.t0 < config.holdMs) send("tap");
          else {
            send("holdstart");
            send("holdend");
          }
        }
      } else if (state === "hold") send("holdend");
      else if (state === "drag") send("dragend", { dx: pointer.x - pointer.x0, dy: pointer.y - pointer.y0 });
      const release = send("release", { duration: time - pointer.t0 });
      pointer = null;
      return release;
    },
    cancel(id) {
      if (!pointer || pointer.id !== id) return;
      if (pointer.state === "hold") send("holdend");
      if (pointer.state === "drag") send("dragend", { dx: 0, dy: 0 });
      send("release", { cancelled: true });
      pointer = null;
    },
    isActive: () => Boolean(pointer),
  };
}

// Klawiatura (komputer to drugi plan, ale działa): Spacja/↑/W = akcja, ↓/S, ←/A, →/D = kierunki,
// P = pauza, Esc = menu.
export const KEY_MAP = Object.freeze({
  Space: "action",
  ArrowUp: "action",
  KeyW: "action",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  KeyP: "pause",
  Escape: "menu",
});

// Podpina rozpoznawanie gestów do elementu planszy. Zwraca funkcję odpinającą.
export function bindInput(element, onGesture, options = {}) {
  const recognizer = createGestureRecognizer({ ...options, onGesture });
  const keys = new Set();
  const now = () => performance.now();
  const safeBottom = () => options.getSafeBottom?.() ?? measureSafeAreas().bottom;

  function local(event) {
    const rect = element.getBoundingClientRect();
    recognizer.setSize(rect.width, rect.height, safeBottom());
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  const onDown = (event) => {
    if (event.button !== undefined && event.button > 0) return;
    const point = local(event);
    if (recognizer.down(event.pointerId, point.x, point.y, now())) {
      element.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    }
  };
  const onMove = (event) => {
    const point = local(event);
    recognizer.move(event.pointerId, point.x, point.y, now());
  };
  const onUp = (event) => {
    const point = local(event);
    recognizer.up(event.pointerId, point.x, point.y, now());
  };
  const onCancel = (event) => recognizer.cancel(event.pointerId);
  const onKeyDown = (event) => {
    const action = KEY_MAP[event.code];
    if (!action || event.target?.closest?.("input, textarea, select")) return;
    event.preventDefault();
    if (event.repeat) return;
    keys.add(action);
    if (action === "action") onGesture({ type: "press", source: "keyboard" });
    else if (["down", "left", "right"].includes(action))
      onGesture({ type: "swipe", direction: action, source: "keyboard" });
    else onGesture({ type: action, source: "keyboard" });
  };
  const onKeyUp = (event) => {
    const action = KEY_MAP[event.code];
    if (!action) return;
    keys.delete(action);
    if (action === "action") onGesture({ type: "release", source: "keyboard" });
  };
  const blockMenu = (event) => event.preventDefault();

  let timer = setInterval(() => recognizer.update(now()), 30);
  element.addEventListener("pointerdown", onDown);
  element.addEventListener("pointermove", onMove);
  element.addEventListener("pointerup", onUp);
  element.addEventListener("pointercancel", onCancel);
  element.addEventListener("contextmenu", blockMenu);
  if (options.keyboard !== false) {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
  }

  return {
    recognizer,
    isKeyDown: (action) => keys.has(action),
    unbind() {
      clearInterval(timer);
      timer = null;
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointercancel", onCancel);
      element.removeEventListener("contextmenu", blockMenu);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    },
  };
}
