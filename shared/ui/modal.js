// Okno modalne: na telefonie wysuwany od dołu arkusz (w zasięgu kciuka), fokus uwięziony w oknie,
// Escape i dotknięcie tła zamykają, po zamknięciu fokus wraca na poprzedni element.
import { ICONS } from "./icons.js";

let counter = 0;

export function focusableIn(element) {
  return [
    ...element.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((node) => !node.hidden && node.offsetParent !== null);
}

/**
 * openModal({ title, content (Node | tekst), actions: [{ label, primary, onClick(close) }], onClose, root, className })
 * → { element, body, close() }
 */
export function openModal({
  title,
  content = "",
  actions = [],
  onClose = () => {},
  root = document.body,
  className = "",
} = {}) {
  const previous = document.activeElement;
  const id = `sowie-modal-${(counter += 1)}`;
  const backdrop = document.createElement("div");
  backdrop.className = `sowie-ui-backdrop ${className}`.trim();
  backdrop.innerHTML = `
    <section class="sowie-ui-sheet" role="dialog" aria-modal="true" aria-labelledby="${id}">
      <header class="sowie-ui-sheet-header">
        <h2 id="${id}"></h2>
        <button type="button" class="sowie-ui-icon-button" data-modal-close aria-label="Zamknij">${ICONS.close}</button>
      </header>
      <div class="sowie-ui-sheet-body" data-modal-body></div>
      <div class="sowie-ui-sheet-actions" data-modal-actions></div>
    </section>`;
  backdrop.querySelector(`#${id}`).textContent = title;
  const body = backdrop.querySelector("[data-modal-body]");
  if (content instanceof Node) body.appendChild(content);
  else body.textContent = String(content);
  const actionsNode = backdrop.querySelector("[data-modal-actions]");
  let closed = false;

  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKey, true);
    backdrop.remove();
    if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    onClose();
  }

  for (const action of actions) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = action.primary ? "sowie-ui-button is-primary" : "sowie-ui-button";
    button.textContent = action.label;
    button.addEventListener("click", () => action.onClick?.(close));
    actionsNode.appendChild(button);
  }
  if (!actions.length) actionsNode.hidden = true;

  function onKey(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === "Tab") {
      const nodes = focusableIn(backdrop);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop || event.target.closest("[data-modal-close]")) close();
  });
  // Dotknięcia w oknie nie trafiają do planszy gry pod spodem.
  backdrop.addEventListener("pointerdown", (event) => event.stopPropagation());
  document.addEventListener("keydown", onKey, true);
  root.appendChild(backdrop);
  const first = actionsNode.querySelector(".is-primary") || backdrop.querySelector("[data-modal-close]");
  first.focus({ preventScroll: true });
  return { element: backdrop, body, close };
}
