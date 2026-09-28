// Ekran wyników (Analiza 2, rozdz. 4.3): wynik, animacja nowego rekordu, zebrane liście, miejsce w osobistym top 10,
// postęp zadań, nowo odblokowane zdjęcie oraz przyciski „Jeszcze raz” (duży, w zasięgu kciuka) i „Menu”.
import { formatNumber } from "./hud.js";
import { ICONS } from "./icons.js";

const LEAF = new URL("../../assets/svg/liscie/zielony.svg", import.meta.url).href;
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  );

const reducedMotion = () =>
  document.documentElement.classList.contains("sowie-reduced-effects") ||
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

export function createResults({ root, onAgain = () => {}, onMenu = () => globalThis.location?.assign?.("../") } = {}) {
  const overlay = document.createElement("div");
  overlay.className = "sowie-ui-results";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "sowieResultsTitle");
  overlay.addEventListener("pointerdown", (event) => event.stopPropagation());
  root.appendChild(overlay);
  let frame = 0;

  function countUp(node, target) {
    cancelAnimationFrame(frame);
    if (reducedMotion() || target <= 0) {
      node.textContent = formatNumber(target);
      return;
    }
    const started = performance.now();
    const step = (time) => {
      const t = Math.min(1, (time - started) / 800);
      node.textContent = formatNumber(target * (1 - (1 - t) ** 3));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  }

  overlay.addEventListener("click", (event) => {
    const action = event.target.closest("[data-results]")?.dataset.results;
    if (action === "again") {
      api.hide();
      onAgain();
    } else if (action === "menu") onMenu();
  });

  const api = {
    element: overlay,
    /**
     * show({ title, score, best, isRecord, leaves, rank, tasks: [{ label, progress, target, done, newlyDone }],
     *        photo: { title, src }, extra: [{ label, value }], messages: [{ text }] })
     */
    show(summary = {}) {
      const score = Math.floor(Number(summary.score) || 0);
      const tasks = (summary.tasks || [])
        .map((task) => {
          const share = task.target > 0 ? Math.min(1, task.progress / task.target) : 0;
          return `<li class="${task.done ? "is-done" : ""}${task.newlyDone ? " is-new" : ""}">
            <span class="sowie-ui-task-label">${escapeHtml(task.label)}</span>
            <span class="sowie-ui-task-bar" aria-hidden="true"><span style="transform:scaleX(${share})"></span></span>
            <span class="sowie-ui-task-value">${task.done ? "Gotowe!" : `${formatNumber(task.progress)} / ${formatNumber(task.target)}`}</span>
          </li>`;
        })
        .join("");
      const extra = (summary.extra || [])
        .map(
          (item) =>
            `<div class="sowie-ui-stat"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`,
        )
        .join("");
      const messages = (summary.messages || []).map((item) => `<li>${escapeHtml(item.text)}</li>`).join("");
      overlay.innerHTML = `<div class="sowie-ui-results-card">
        <h2 id="sowieResultsTitle">${escapeHtml(summary.title || "Koniec gry!")}</h2>
        ${summary.isRecord ? `<p class="sowie-ui-record" data-results-record>${ICONS.star}<span>Nowy rekord!</span></p>` : ""}
        <div class="sowie-ui-score" data-results-score aria-label="Wynik: ${score}">0</div>
        ${!summary.isRecord && Number.isFinite(Number(summary.best)) ? `<p class="sowie-ui-best">Rekord: ${formatNumber(summary.best)}</p>` : ""}
        <div class="sowie-ui-stats">
          <div class="sowie-ui-stat"><span>Liście</span><strong><img src="${LEAF}" alt="" width="22" height="22" /> ${formatNumber(summary.leaves)}</strong></div>
          ${Number(summary.rank) > 0 ? `<div class="sowie-ui-stat" data-results-rank><span>Twoje top 10</span><strong>${Number(summary.rank)}. miejsce</strong></div>` : ""}
          ${extra}
        </div>
        ${tasks ? `<h3>Zadania</h3><ul class="sowie-ui-tasks" data-results-tasks>${tasks}</ul>` : ""}
        ${messages ? `<ul class="sowie-ui-messages">${messages}</ul>` : ""}
        ${summary.photo ? `<figure class="sowie-ui-photo" data-results-photo><img src="${escapeHtml(summary.photo.src)}" alt="" /><figcaption>Nowe zdjęcie w Galerii: ${escapeHtml(summary.photo.title)}</figcaption></figure>` : ""}
        <div class="sowie-ui-results-actions">
          <button type="button" class="sowie-ui-button is-primary is-big" data-results="again">${ICONS.restart}<span>Jeszcze raz</span></button>
          <button type="button" class="sowie-ui-button is-quiet" data-results="menu">${ICONS.home}<span>Menu</span></button>
        </div>
      </div>`;
      overlay.hidden = false;
      overlay.classList.toggle("is-record", Boolean(summary.isRecord));
      countUp(overlay.querySelector("[data-results-score]"), score);
      overlay.querySelector('[data-results="again"]').focus({ preventScroll: true });
    },
    hide() {
      cancelAnimationFrame(frame);
      overlay.hidden = true;
      overlay.innerHTML = "";
    },
    isOpen: () => !overlay.hidden,
    destroy() {
      api.hide();
      overlay.remove();
    },
  };
  return api;
}
