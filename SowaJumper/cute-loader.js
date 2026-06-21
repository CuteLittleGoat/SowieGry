// Ładuje pakiet cute dopiero po dynamicznych modułach difficulty.js.
(() => {
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    const ready = typeof resetJumperSafetyState === "function" && typeof drawJumperHeart === "function" && typeof startBonus === "function";

    if (!ready) {
      if (attempts >= 200) {
        window.clearInterval(timer);
        console.error("SowaJumper: nie załadowano wymaganych modułów extra-lives, bonus-fix lub safety-balance.");
        window.SowieCore?.toast("Błąd ładowania modułów SowaJumper");
      }
      return;
    }

    window.clearInterval(timer);

    const cute = document.createElement("script");
    cute.src = "cute-rework.js";
    cute.async = false;
    cute.addEventListener("load", () => {
      const lanes = document.createElement("script");
      lanes.src = "bonus-lanes.js";
      lanes.async = false;
      lanes.addEventListener("load", () => {
        const animation = document.createElement("script");
        animation.src = "animation-polish.js";
        animation.async = false;
        animation.addEventListener("load", () => {
          const expansion = document.createElement("script");
          expansion.src = "platform-expansion.js";
          expansion.async = false;
          expansion.addEventListener("load", () => {
            const pause = document.createElement("script");
            pause.src = "pause-final.js";
            pause.async = false;
            document.body.appendChild(pause);
          });
          document.body.appendChild(expansion);
        });
        document.body.appendChild(animation);
      });
      document.body.appendChild(lanes);
    });
    document.body.appendChild(cute);
  }, 20);
})();
