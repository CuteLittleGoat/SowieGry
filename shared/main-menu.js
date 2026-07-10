// Menu główne korzysta z tego samego rejestru, profilu i modala co gry.
(() => {
  "use strict";

  const platform = window.SowiePlatform;
  const core = window.SowieCore;
  if (!platform || !core) return;

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
    button.querySelector("[data-cosmetic-icon]")?.replaceChildren(selected.icon);
    const label = button.querySelector("[data-cosmetic-label]");
    if (label) label.textContent = `Garderoba: ${selected.label}`;
  }

  button.addEventListener("click", () => core.openModal("wardrobe", button));
  platform.on("profile:changed", refreshButton);
  window.addEventListener("pageshow", refreshButton);
  refreshButton();
})();