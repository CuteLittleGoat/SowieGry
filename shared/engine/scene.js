// Sceny gry (np. Ładowanie → Tytuł → Gra → Pauza → Bonus → Wyniki) z krótkim przejściem (ściemnienie).

export function createScenes({ transition = 0.25 } = {}) {
  const scenes = new Map();
  let current = null;
  let currentName = null;
  let pending = null;
  let fade = 0; // 0 = brak zasłony, 1 = pełne ściemnienie
  let phase = "idle"; // "out" → zmiana sceny → "in"

  function enter(name, params) {
    current?.exit?.();
    current = scenes.get(name);
    currentName = name;
    current?.enter?.(params);
  }

  return {
    add(name, scene) {
      scenes.set(name, scene);
      return this;
    },
    go(name, params = {}, { instant = false } = {}) {
      if (!scenes.has(name)) throw new Error(`Nieznana scena: ${name}`);
      if (instant || !current || transition <= 0) {
        enter(name, params);
        return;
      }
      pending = { name, params };
      phase = "out";
    },
    update(dt) {
      if (phase === "out") {
        fade = Math.min(1, fade + dt / (transition / 2));
        if (fade >= 1) {
          enter(pending.name, pending.params);
          pending = null;
          phase = "in";
        }
      } else if (phase === "in") {
        fade = Math.max(0, fade - dt / (transition / 2));
        if (fade <= 0) phase = "idle";
      }
      current?.update?.(dt);
    },
    render(context, alpha) {
      current?.render?.(context, alpha);
    },
    // Scena odbiera gesty.
    gesture(event) {
      current?.gesture?.(event);
    },
    fade: () => fade,
    current: () => currentName,
  };
}
