(() => {
  "use strict";

  // Treść instrukcji jest w shared/meta/guides-data.js (jedno źródło dla menu, gier i menu pauzy).
  // Ten klasyczny skrypt wczytuje moduł dynamicznie (import()) przy starcie strony.
  const scriptUrl = document.currentScript?.src || new URL("shared/game-guides.js", location.href).href;
  const guidesReady = import(new URL("meta/guides-data.js", scriptUrl).href).then((module) => module.GUIDES);
  const gameName = (gameId) => window.SowiePlatform?.GAME_REGISTRY.find((entry) => entry.id === gameId)?.name || gameId;

  let modal = null;
  let previousFocus = null;

  function detectGameId() {
    const path = location.pathname.toLowerCase();
    if (path.includes("sowajumper")) return "jumper";
    if (path.includes("sowieogrody")) return "ogrody";
    if (path.includes("sowiaszklarnia")) return "szklarnia";
    return null;
  }

  function getDock() {
    let dock = document.querySelector(".sowie-tool-dock");
    if (!dock) {
      dock = document.createElement("div");
      dock.className = "sowie-tool-dock";
      dock.setAttribute("aria-label", "Narzędzia gry");
      document.body.appendChild(dock);
    }
    return dock;
  }

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("section");
    modal.className = "sowie-modal-backdrop";
    modal.hidden = true;
    modal.innerHTML = `
      <article class="sowie-modal-card" role="dialog" aria-modal="true" aria-labelledby="sowieGuideTitle">
        <h2 id="sowieGuideTitle"></h2>
        <p class="sowie-guide-summary" data-guide-summary></p>
        <div data-guide-cards></div>
        <div class="sowie-modal-actions"><button type="button" data-guide-close>Rozumiem</button></div>
      </article>`;
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-guide-close]")) close();
    });
    modal.addEventListener("keydown", trapFocus);
    document.body.appendChild(modal);
    return modal;
  }

  // Karty przewodnika jako kolejne sekcje: tytuł, tekst i wskazówka.
  function renderCards(node, cards) {
    node.replaceChildren(
      ...cards.flatMap((card) => {
        const title = document.createElement("h3");
        title.textContent = card.title;
        const text = document.createElement("p");
        text.textContent = card.tip ? `${card.text} ${card.tip}` : card.text;
        return [title, text];
      }),
    );
  }

  async function open(gameId, trigger = document.activeElement) {
    const guide = (await guidesReady)[gameId];
    if (!guide) return false;
    const node = ensureModal();
    previousFocus = trigger instanceof HTMLElement ? trigger : null;
    node.querySelector("#sowieGuideTitle").textContent = `Instrukcja — ${guide.title}`;
    node.querySelector("[data-guide-summary]").textContent = guide.summary;
    renderCards(node.querySelector("[data-guide-cards]"), guide.cards);
    node.hidden = false;
    document.body.classList.add("sowie-modal-open");
    node.querySelector("[data-guide-close]").focus();
    return true;
  }

  function close() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("sowie-modal-open");
    previousFocus?.focus?.();
    previousFocus = null;
  }

  function trapFocus(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")]
      .filter((element) => !element.disabled && !element.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function attachGameButton() {
    const gameId = detectGameId();
    if (!gameId || document.querySelector("[data-game-guide-fab]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sowie-tool-button";
    button.dataset.gameGuideFab = gameId;
    button.dataset.gameGuide = gameId;
    button.title = "Instrukcja gry";
    button.setAttribute("aria-label", `Instrukcja gry ${gameName(gameId)}`);
    button.textContent = "❓";
    getDock().appendChild(button);
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-game-guide]");
    if (!trigger) return;
    event.preventDefault();
    open(trigger.dataset.gameGuide, trigger);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attachGameButton, { once: true });
  else attachGameButton();

  window.SowieGameGuides = Object.freeze({ ready: guidesReady, open, close, detectGameId, getDock });
})();
