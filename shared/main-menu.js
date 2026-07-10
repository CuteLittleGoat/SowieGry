// Menu główne korzysta z tego samego rejestru, profilu i modala co gry.
(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src;

  function loadSibling(name, globalName) {
    if (window[globalName]) return Promise.resolve(window[globalName]);
    if (!scriptUrl) return Promise.reject(new Error(`Brak adresu dla modułu ${name}.`));

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(name, scriptUrl).href;
      script.async = false;
      script.addEventListener("load", () => resolve(window[globalName]), { once: true });
      script.addEventListener("error", () => reject(new Error(`Nie udało się pobrać ${name}.`)), { once: true });
      document.head.appendChild(script);
    });
  }

  async function initialize() {
    const platform = await (window.SowiePlatformReady || loadSibling("sowie-platform.js", "SowiePlatform"));
    const core = await loadSibling("sowie-core.js", "SowieCore");
    await loadSibling("notification-manager.js", "SowieNotifications");
    const guides = window.SowieGameGuides || await loadSibling("game-guides.js", "SowieGameGuides");

    if (!platform || !core || !guides) throw new Error("Menu SowieGry nie mogło zainicjalizować wspólnych modułów.");

    const descriptions = {
      runner: "Dynamiczny endless runner z seriami liści i codzienną trasą.",
      jumper: "Skacz wysoko, ląduj precyzyjnie i buduj serię.",
      sowa3: "Trzytorowy runner z combo, planszami i wyzwaniem dnia.",
      ogrody: "Idle incremental: sadź, podlewaj, automatyzuj i wykonuj kontrakty.",
      szklarnia: "Buduj szklarnię, odkrywaj cechy, krzyżuj gatunki i przeganiaj kozy.",
    };

    const cards = document.querySelector("[data-game-cards], .cards");
    if (cards) {
      cards.replaceChildren(
        ...platform.GAME_REGISTRY.map((game) => {
          const shell = document.createElement("article");
          shell.className = "game-card-shell";
          shell.dataset.gameId = game.id;

          const link = document.createElement("a");
          link.className = "game-card";
          link.href = game.path;
          link.dataset.gameId = game.id;
          link.innerHTML = `<h2>${game.icon} ${game.name}</h2><p>${descriptions[game.id] || "Sowia przygoda czeka!"}</p>`;

          const guideButton = document.createElement("button");
          guideButton.type = "button";
          guideButton.className = "sowie-card-guide";
          guideButton.dataset.gameGuide = game.id;
          guideButton.textContent = `❓ Jak grać w ${game.name}`;
          guideButton.setAttribute("aria-label", `Otwórz instrukcję gry ${game.name}`);

          shell.append(link, guideButton);
          return shell;
        }),
      );
    }

    const button = document.getElementById("cosmeticsButton");
    if (!button) return;

    function refreshButton() {
      const profile = core.getProfile();
      const selected = platform.COSMETICS[profile.selectedCosmetic] || platform.COSMETICS.none;
      const icon = button.querySelector("[data-cosmetic-icon]");
      const label = button.querySelector("[data-cosmetic-label]");
      if (icon) icon.textContent = selected.icon;
      if (label) label.textContent = `Garderoba: ${selected.label}`;
    }

    button.addEventListener("click", () => core.openModal("wardrobe", button));
    platform.on("profile:changed", refreshButton);
    window.addEventListener("pageshow", refreshButton);
    refreshButton();
  }

  initialize().catch((error) => console.error(error.message));
})();
