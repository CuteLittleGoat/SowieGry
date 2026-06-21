// Ładuje pakiet cute dopiero po dynamicznych modułach difficulty.js.
(() => {
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    const ready = typeof resetJumperSafetyState === "function" && typeof drawJumperHeart === "function" && typeof startBonus === "function";
    if (!ready && attempts < 200) return;
    window.clearInterval(timer);
    const script = document.createElement("script");
    script.src = "cute-rework.js";
    script.async = false;
    document.body.appendChild(script);
  }, 20);
})();
