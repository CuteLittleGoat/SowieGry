// Komunikaty (Analiza 2, rozdz. 4.3): w trakcie gry najwyżej 1 naraz — u góry, pod HUD, żeby nie zasłaniać sowy;
// poza grą do 3 przy dolnej krawędzi. Te same komunikaty w krótkim czasie łączą się („×2”).
// Postęp zadań odkładamy (defer) i pokazujemy dopiero na ekranie wyników.

export const TOAST_DEFAULTS = Object.freeze({
  maxInGame: 1,
  maxOutside: 3,
  maxQueue: 3,
  duration: 2200,
  mergeMs: 1800,
});

export function createToasts({ root, isInGame = () => false, now = () => performance.now(), ...options } = {}) {
  const config = { ...TOAST_DEFAULTS, ...options };
  const container = document.createElement("div");
  container.className = "sowie-toasts";
  container.setAttribute("role", "status");
  container.setAttribute("aria-live", "polite");
  root.appendChild(container);
  const visible = [];
  const queue = [];
  const deferred = [];
  let sequence = 0;

  const limit = () => (isInGame() ? config.maxInGame : config.maxOutside);
  const label = (item) => (item.count > 1 ? `${item.text} ×${item.count}` : item.text);

  function render(item) {
    item.node.textContent = label(item);
  }

  function schedule(item) {
    clearTimeout(item.timer);
    item.timer = setTimeout(() => leave(item), item.duration);
  }

  function leave(item) {
    item.node?.classList.add("is-leaving");
    setTimeout(() => remove(item), 200);
  }

  function remove(item) {
    clearTimeout(item.timer);
    const index = visible.indexOf(item);
    if (index >= 0) visible.splice(index, 1);
    item.node?.remove();
    item.node = null;
    pump();
  }

  function display(item) {
    const node = document.createElement("div");
    node.className = `sowie-toast-chip is-${item.kind}`;
    item.node = node;
    render(item);
    container.appendChild(node);
    visible.push(item);
    schedule(item);
  }

  function pump() {
    container.classList.toggle("is-in-game", Boolean(isInGame()));
    while (visible.length < limit() && queue.length) display(queue.shift());
    // Po wejściu do gry nadmiar znika od najstarszych.
    while (visible.length > limit()) remove(visible[0]);
  }

  const api = {
    element: container,
    // show(tekst, { kind: "info" | "success" | "warn" | "reward", duration, key, priority })
    show(text, { kind = "info", duration = config.duration, key = text, priority = 0 } = {}) {
      const message = String(text || "").trim();
      if (!message) return null;
      const at = now();
      const same = [...visible, ...queue].find((item) => item.key === key && at - item.at <= config.mergeMs);
      if (same) {
        same.count += 1;
        same.at = at;
        if (same.node) {
          render(same);
          schedule(same);
        }
        return same.id;
      }
      const item = {
        id: (sequence += 1),
        text: message,
        kind,
        duration,
        key,
        priority,
        count: 1,
        at,
        node: null,
        timer: 0,
      };
      if (visible.length < limit()) display(item);
      else {
        queue.push(item);
        queue.sort((a, b) => b.priority - a.priority || a.id - b.id);
        while (queue.length > config.maxQueue) queue.pop();
      }
      return item.id;
    },
    // Komunikat na później (np. postęp zadania w trakcie biegu) — odbiera go ekran wyników.
    defer(text, options = {}) {
      deferred.push({ text: String(text), kind: options.kind || "reward" });
    },
    takeDeferred() {
      return deferred.splice(0, deferred.length);
    },
    // Wywołaj po zmianie stanu gry (start / koniec biegu, pauza).
    refresh: pump,
    clear() {
      queue.length = 0;
      for (const item of [...visible]) remove(item);
    },
    state: () => ({ visible: visible.map(label), queued: queue.map(label), inGame: Boolean(isInGame()) }),
    destroy() {
      api.clear();
      container.remove();
    },
  };
  pump();
  return api;
}
