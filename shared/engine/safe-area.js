// Bezpieczne obszary ekranu (wycięcie, Dynamic Island, pasek domowy) w pikselach CSS.
// Zmiennych env() nie da się odczytać wprost z JS, więc mierzymy ukryty element z paddingiem env().

let probe = null;

export function measureSafeAreas() {
  if (typeof document === "undefined" || !document.body) return { top: 0, right: 0, bottom: 0, left: 0 };
  if (!probe) {
    probe = document.createElement("div");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText =
      "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;" +
      "padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px);";
    document.body.appendChild(probe);
  }
  const style = getComputedStyle(probe);
  return {
    top: Number.parseFloat(style.paddingTop) || 0,
    right: Number.parseFloat(style.paddingRight) || 0,
    bottom: Number.parseFloat(style.paddingBottom) || 0,
    left: Number.parseFloat(style.paddingLeft) || 0,
  };
}
