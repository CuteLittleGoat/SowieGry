// Wspólne zachowania prezentacyjne. Runtime nie podmienia metod SowieCore ani gier.
(() => {
  "use strict";

  function applySharedLayout() {
    const toolbar = document.querySelector(".sowie-toolbar");
    if (toolbar) toolbar.style.flexDirection = "column";

    const hud = document.querySelector(".hud");
    if (hud && hud.children.length >= 4) {
      hud.style.gridTemplateColumns = window.innerWidth <= 700
        ? "repeat(4, minmax(0, 1fr))"
        : "repeat(4, minmax(70px, auto))";
    }
  }

  function syncReducedMotion() {
    const systemPrefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const profilePrefersReducedMotion = Boolean(window.SowieCore?.settings?.().reducedEffects);
    document.documentElement.classList.toggle(
      "sowie-reduced-effects",
      systemPrefersReducedMotion || profilePrefersReducedMotion,
    );
  }

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionQuery.addEventListener?.("change", syncReducedMotion);
  window.addEventListener("resize", applySharedLayout, { passive: true });
  window.SowiePlatform?.on?.("profile:changed", syncReducedMotion);

  applySharedLayout();
  syncReducedMotion();
})();