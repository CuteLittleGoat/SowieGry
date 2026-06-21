// Garderoba dostępna bezpośrednio z głównego menu SowieGry.
(() => {
  "use strict";

  const PROFILE_KEY = "sowieGryProfile";
  const COSMETICS = {
    none: { label: "Bez dodatku", icon: "🦉" },
    bow: { label: "Kokardka", icon: "🎀" },
    glasses: { label: "Okulary", icon: "😎" },
    flowerCrown: { label: "Wianek", icon: "🌸" },
    gardenerHat: { label: "Kapelusz ogrodnika", icon: "👒" },
    cap: { label: "Czapka z daszkiem", icon: "🧢" },
    scarf: { label: "Szalik", icon: "🧣" },
    backpack: { label: "Plecak", icon: "🎒" },
    bubbleTrail: { label: "Ślad bąbelków", icon: "🫧" },
  };

  function readProfile() {
    try {
      const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
      if (profile && typeof profile === "object") return profile;
    } catch (_error) {
      // W razie uszkodzonego zapisu pokaż tylko elementy startowe.
    }
    return {
      unlockedCosmetics: ["none", "bow"],
      selectedCosmetic: "none",
    };
  }

  function saveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  const button = document.getElementById("cosmeticsButton");
  if (!button) return;

  const backdrop = document.createElement("div");
  backdrop.className = "sowie-modal-backdrop";
  backdrop.hidden = true;
  backdrop.innerHTML = `<section class="sowie-modal" role="dialog" aria-modal="true" aria-labelledby="wardrobeTitle"></section>`;
  document.body.appendChild(backdrop);

  const toastStack = document.createElement("div");
  toastStack.className = "sowie-toast-stack";
  document.body.appendChild(toastStack);

  function toast(text) {
    const node = document.createElement("div");
    node.className = "sowie-toast";
    node.textContent = text;
    toastStack.appendChild(node);
    window.setTimeout(() => node.remove(), 2850);
  }

  function refreshButton() {
    const profile = readProfile();
    const selected = COSMETICS[profile.selectedCosmetic] || COSMETICS.none;
    const icon = button.querySelector("[data-cosmetic-icon]");
    const label = button.querySelector("[data-cosmetic-label]");
    if (icon) icon.textContent = selected.icon;
    if (label) label.textContent = `Garderoba: ${selected.label}`;
  }

  function selectCosmetic(key) {
    const profile = readProfile();
    const unlocked = Array.isArray(profile.unlockedCosmetics) ? profile.unlockedCosmetics : ["none", "bow"];
    if (!unlocked.includes(key) || !COSMETICS[key]) return;
    profile.unlockedCosmetics = unlocked;
    profile.selectedCosmetic = key;
    saveProfile(profile);
    renderWardrobe();
    refreshButton();
    toast(`Wybrano: ${COSMETICS[key].label}`);
  }

  function closeWardrobe() {
    backdrop.hidden = true;
    button.focus();
  }

  function renderWardrobe() {
    const modal = backdrop.querySelector(".sowie-modal");
    const profile = readProfile();
    const unlocked = new Set(Array.isArray(profile.unlockedCosmetics) ? profile.unlockedCosmetics : ["none", "bow"]);
    if (!COSMETICS[profile.selectedCosmetic] || !unlocked.has(profile.selectedCosmetic)) {
      profile.selectedCosmetic = "none";
      saveProfile(profile);
    }

    modal.innerHTML = `
      <h2 id="wardrobeTitle">Garderoba sowy</h2>
      <p class="sowie-modal-intro">Wybrany element będzie używany we wszystkich trzech grach.</p>
      <div class="sowie-modal-grid" data-cosmetics></div>
      <div class="sowie-modal-actions"><button type="button" data-close>Zamknij</button></div>
    `;

    const grid = modal.querySelector("[data-cosmetics]");
    Object.entries(COSMETICS).forEach(([key, item]) => {
      const isUnlocked = unlocked.has(key);
      const isSelected = profile.selectedCosmetic === key;
      const card = document.createElement("div");
      card.className = `sowie-cosmetic-card${isSelected ? " is-selected" : ""}`;
      card.innerHTML = `<strong>${item.icon} ${item.label}</strong><div>${isUnlocked ? "Odblokowane" : "🔒 Nagroda za misję"}</div>`;

      const choose = document.createElement("button");
      choose.type = "button";
      choose.textContent = isSelected ? "Wybrane" : "Wybierz";
      choose.disabled = !isUnlocked || isSelected;
      choose.addEventListener("click", () => selectCosmetic(key));
      card.appendChild(choose);
      grid.appendChild(card);
    });

    modal.querySelector("[data-close]")?.addEventListener("click", closeWardrobe);
  }

  function openWardrobe() {
    renderWardrobe();
    backdrop.hidden = false;
    backdrop.querySelector("button:not([disabled])")?.focus();
  }

  button.addEventListener("click", openWardrobe);
  backdrop.addEventListener("pointerdown", (event) => {
    if (event.target === backdrop) closeWardrobe();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !backdrop.hidden) closeWardrobe();
  });

  window.addEventListener("pageshow", refreshButton);
  refreshButton();
})();
