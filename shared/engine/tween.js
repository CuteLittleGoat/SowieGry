// Animacje wartości w czasie (tween) i funkcje łagodzenia (easing).

export const ease = Object.freeze({
  linear: (t) => t,
  quadIn: (t) => t * t,
  quadOut: (t) => t * (2 - t),
  quadInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  cubicOut: (t) => 1 - (1 - t) ** 3,
  sineInOut: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  backOut: (t) => {
    const s = 1.70158;
    return 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;
  },
  elasticOut: (t) => (t === 0 || t === 1 ? t : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
});

export function createTweens() {
  const active = [];

  return {
    // Animuje pola `props` obiektu `target` do podanych wartości w `duration` sekund.
    to(target, props, duration, { easing = ease.quadOut, delay = 0, onDone = null } = {}) {
      const from = {};
      for (const key of Object.keys(props)) from[key] = target[key];
      const tween = { target, from, props, duration: Math.max(1e-6, duration), delay, time: 0, easing, onDone };
      active.push(tween);
      return tween;
    },
    cancel(tween) {
      const index = active.indexOf(tween);
      if (index >= 0) active.splice(index, 1);
    },
    cancelFor(target) {
      for (let index = active.length - 1; index >= 0; index -= 1) {
        if (active[index].target === target) active.splice(index, 1);
      }
    },
    update(dt) {
      for (let index = active.length - 1; index >= 0; index -= 1) {
        const tween = active[index];
        if (tween.delay > 0) {
          tween.delay -= dt;
          if (tween.delay > 0) continue;
          dt = -tween.delay;
          tween.delay = 0;
        }
        tween.time = Math.min(tween.duration, tween.time + dt);
        const progress = tween.easing(tween.time / tween.duration);
        for (const key of Object.keys(tween.props)) {
          tween.target[key] = tween.from[key] + (tween.props[key] - tween.from[key]) * progress;
        }
        if (tween.time >= tween.duration) {
          active.splice(index, 1);
          tween.onDone?.(tween.target);
        }
      }
    },
    count: () => active.length,
  };
}
