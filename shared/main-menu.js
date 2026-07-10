// Menu główne korzysta z tego samego rejestru, profilu i modala co gry.
(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src;
  if (!window.SowiePlatform && scriptUrl) {
    document.write(`<script src="${new URL("sowie-platform.js", scriptUrl).href}"><\/script>`);
  }
  if (!window.SowieCore && scriptUrl) {
    document.write(`<script src="${new URL("sowie-core.js", scriptUrl).href}"><\/script>`);
  }
  if (!window.SowieNotifications && scriptUrl) {
    document.write(`<script src="${new URL("notification-manager.js", scriptUrl).href}"><\/script>`);
  }

  const platform = window.SowiePlatform;
  const core = window.SowieCore;
  if (!platform || !core) {
    console.error("Menu SowieGry nie mogło załadować wspólnych modułów.");
    return;
  }

  const descriptions = {
    runner: "Dynamiczny endless runner z sówką, kozami i humbakami.",
    jumper: "Skacz wysoko i zbieraj punkty w stylu retro arcade.",
    sowa3: "Trzytorowy runner: supermarket, kwiaty, blokowisko i meta na działce.",
    ogrody: "Idle incremental: sadź rośliny, podlewaj i automatyzuj ogród.",
    szklarnia: "Buduj szklarnię, krzyżuj gatunki i przeganiaj kozy okrzykiem „SIO!”.",
  };

  const cards = document.querySelector("[data-game-cards], .cards");
  if (cards) {
    cards.replaceChildren(...platform.GAME_REGISTRY.map((game) => {
      const link = document.createElement("a");
      link.className = "game-card";
      link.href = game.path;
      link.dataset.gameId = game.id;
      link.innerHTML = `<h2>${game.icon} ${game.name}</h2><p>${descriptions[game.id] || "Sowia przygoda czeka!"}</p>`;
      return link;
    }));
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
})();