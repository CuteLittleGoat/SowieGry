// Ładuje pakiet cute dopiero po dynamicznych modułach difficulty.js.
(() => {
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    const ready = typeof resetJumperSafetyState === "function" && typeof drawJumperHeart === "function" && typeof startBonus === "function";
    if (!ready && attempts < 200) return;
    window.clearInterval(timer);

    const cute = document.createElement("script");
    cute.src = "cute-rework.js";
    cute.async = false;
    cute.addEventListener("load", () => {
      const lanes = document.createElement("script");
      lanes.src = "bonus-lanes.js";
      lanes.async = false;
      document.body.appendChild(lanes);
    });
    document.body.appendChild(cute);
  }, 20);
})();
