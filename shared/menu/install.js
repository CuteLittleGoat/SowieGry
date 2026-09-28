// Karta „Zainstaluj SowieGry na telefonie” (PWA). Widoczna, dopóki strona nie działa jako aplikacja.
// Android / Chrome: przycisk (systemowe okno instalacji z shared/pwa.js). iPhone / iPad: instrukcja „Do ekranu
// początkowego”. Inne przeglądarki: krótka wskazówka, a przycisk pojawia się, gdy przeglądarka pozwoli instalować.
import { ICONS } from "../ui/icons.js";

export function isIos(nav = globalThis.navigator) {
  return /iPad|iPhone|iPod/.test(nav?.userAgent || "") || (nav?.platform === "MacIntel" && nav?.maxTouchPoints > 1);
}

export function renderInstallCard(slot, { pwa = globalThis.window?.SowiePwa, nav = globalThis.navigator } = {}) {
  if (!slot) return () => {};

  function render() {
    if (!pwa || pwa.standalone()) {
      slot.replaceChildren();
      return;
    }
    const card = document.createElement("section");
    card.className = "menu-install";
    card.dataset.install = pwa.canPrompt() ? "android" : isIos(nav) ? "ios" : "inne";
    card.setAttribute("aria-label", "Zainstaluj SowieGry na telefonie");
    if (pwa.canPrompt()) {
      card.innerHTML = `
        <h3>Zainstaluj SowieGry na telefonie</h3>
        <p>Gry otworzysz jedną ikoną, na pełnym ekranie — także bez zasięgu.</p>
        <button type="button" class="menu-button is-primary" data-install-button>${ICONS.download}<span>Zainstaluj</span></button>`;
      card.querySelector("[data-install-button]").addEventListener("click", async () => {
        const outcome = await pwa.prompt();
        if (outcome === "accepted") slot.replaceChildren();
        else render();
      });
    } else if (isIos(nav)) {
      card.innerHTML = `
        <h3>Zainstaluj SowieGry na telefonie</h3>
        <p>Dodaj SowieGry do ekranu początkowego, a gry otworzą się jak aplikacja:</p>
        <ol>
          <li>Stuknij <strong>Udostępnij</strong> <span class="menu-inline-icon">${ICONS.share}</span> na dole Safari.</li>
          <li>Wybierz <strong>Do ekranu początkowego</strong>.</li>
          <li>Stuknij <strong>Dodaj</strong>.</li>
        </ol>`;
    } else {
      card.innerHTML = `
        <h3>Zainstaluj SowieGry na telefonie</h3>
        <p>W menu przeglądarki wybierz <strong>Zainstaluj aplikację</strong> albo <strong>Dodaj do ekranu głównego</strong>.</p>`;
    }
    slot.replaceChildren(card);
  }

  render();
  return pwa?.onInstallChange?.(render) || (() => {});
}
