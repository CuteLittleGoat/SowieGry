// Dostępność modali definiowanych bezpośrednio przez poszczególne gry.
(() => {
  "use strict";

  const selector = ".garden-modal-backdrop, .greenhouse-modal-backdrop";
  const returnFocus = new WeakMap();

  function focusables(root) {
    return Array.from(root.querySelectorAll(
      "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
    )).filter((element) => !element.hidden && element.getClientRects().length > 0);
  }

  function enhance(backdrop) {
    if (!(backdrop instanceof HTMLElement) || backdrop.dataset.a11yModal === "true") return;
    backdrop.dataset.a11yModal = "true";
    const dialog = backdrop.firstElementChild;
    if (dialog) {
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      if (!dialog.hasAttribute("aria-label") && !dialog.hasAttribute("aria-labelledby")) {
        const heading = dialog.querySelector("h1, h2, h3");
        if (heading) {
          heading.id ||= `${backdrop.id || "sowie"}-title`;
          dialog.setAttribute("aria-labelledby", heading.id);
        }
      }
    }

    const observer = new MutationObserver(() => {
      if (!backdrop.hidden) {
        returnFocus.set(backdrop, document.activeElement);
        window.setTimeout(() => focusables(backdrop)[0]?.focus(), 0);
      } else {
        const previous = returnFocus.get(backdrop);
        previous?.focus?.({ preventScroll: true });
      }
    });
    observer.observe(backdrop, { attributes: true, attributeFilter: ["hidden"] });

    backdrop.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const cancel = backdrop.querySelector("#offlineClose, #resetCancel, #prestigeCancel, [data-close]");
        if (cancel) cancel.click();
        else backdrop.hidden = true;
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables(backdrop);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  document.querySelectorAll(selector).forEach(enhance);
  const pageObserver = new MutationObserver(() => document.querySelectorAll(selector).forEach(enhance));
  pageObserver.observe(document.body, { childList: true, subtree: true });
})();