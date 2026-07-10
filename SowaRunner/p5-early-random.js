// Moduły dekoracyjne SowaRunner inicjalizują część stanu przed setup() p5.
// Ten zgodny fallback korzysta z deterministycznego Math.random w trybie testowym.
(() => {
  "use strict";

  if (typeof window.random === "function") return;

  window.random = (minimum, maximum) => {
    const value = Math.random();
    if (Array.isArray(minimum)) return minimum[Math.floor(value * minimum.length)];
    if (minimum === undefined) return value;
    if (maximum === undefined) return value * Number(minimum);
    return Number(minimum) + value * (Number(maximum) - Number(minimum));
  };
})();
