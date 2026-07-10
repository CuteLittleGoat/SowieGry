// Wspólny, kompaktowy menedżer powiadomień dla wszystkich gier.
(() => {
  "use strict";

  const core = window.SowieCore;
  if (!core) return;

  const MAX_VISIBLE = 2;
  const MAX_QUEUE = 5;
  const MERGE_WINDOW_MS = 1800;
  const visible = [];
  const queue = [];
  let stack = null;
  let sequence = 0;
  const originalToast = core.toast;

  function installStyles() {
    if (document.querySelector("style[data-sowie-notifications]")) return;
    const style = document.createElement("style");
    style.dataset.sowieNotifications = "true";
    style.textContent = `
      .sowie-toast-stack.sowie-notification-stack {
        top: auto;
        bottom: max(8vh, calc(env(safe-area-inset-bottom) + 14px));
        width: min(82vw, 360px);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        gap: 7px;
      }
      .sowie-notification-stack .sowie-toast {
        box-sizing: border-box;
        width: 100%;
        min-height: 42px;
        padding: 9px 13px;
        animation: sowieManagedToastIn 180ms ease-out both;
        transition: opacity 180ms ease, transform 180ms ease;
      }
      .sowie-notification-stack .sowie-toast.is-older { opacity: .7; transform: scale(.96); }
      .sowie-notification-stack .sowie-toast.is-important {
        background: rgba(255,248,220,.96);
        box-shadow: 0 9px 22px rgba(43,39,51,.18), inset 0 0 0 2px rgba(255,214,90,.55);
      }
      .sowie-notification-stack .sowie-toast.is-leaving { opacity: 0; transform: translateY(8px) scale(.96); }
      .sowie-toast-title,.sowie-toast-detail,.sowie-toast-reward { display:block; }
      .sowie-toast-title { font-weight: 900; text-transform: uppercase; letter-spacing: .02em; }
      .sowie-toast-reward { margin-top: 3px; font-size: 13px; }
      @keyframes sowieManagedToastIn { from { opacity:0; transform:translateY(8px) scale(.96); } to { opacity:1; transform:none; } }
      @media (prefers-reduced-motion: reduce) {
        .sowie-notification-stack .sowie-toast { animation: none; transition: none; }
      }
    `;
    document.head.appendChild(style);
  }

  function findStack() {
    const candidate = document.querySelector(".sowie-toast-stack");
    if (!candidate || candidate === stack) return;
    stack = candidate;
    stack.classList.add("sowie-notification-stack");
  }

  function normalize(input, options = {}) {
    const object = input && typeof input === "object" ? input : { text: input };
    const text = String(object.text || object.detail || "").trim();
    const amountMatch = text.match(/^(.*?)(?:\s+)([+-]\d+)$/);
    const amount = Number.isFinite(Number(object.amount))
      ? Number(object.amount)
      : amountMatch
        ? Number(amountMatch[2])
        : null;
    const baseText = amountMatch ? amountMatch[1].trim() : text;
    const important = object.kind === "important" || object.kind === "mission" || options.kind === "important";
    return {
      id: ++sequence,
      title: object.title ? String(object.title) : "",
      text: baseText,
      detail: object.detail ? String(object.detail) : "",
      reward: object.reward ? String(object.reward) : "",
      important,
      duration: Number(object.duration || options.duration) || (important ? 4000 : 2500),
      mergeKey: String(object.mergeKey || options.mergeKey || baseText || object.title || sequence),
      amount,
      total: amount,
      count: 1,
      lastAt: performance.now(),
      node: null,
      timer: 0,
    };
  }

  function displayText(item) {
    if (item.count > 1 && item.total !== null) {
      return `${item.text} ×${item.count} — łącznie ${item.total >= 0 ? "+" : ""}${item.total}`;
    }
    if (item.count > 1) return `${item.text} ×${item.count}`;
    if (item.amount !== null) return `${item.text} ${item.amount >= 0 ? "+" : ""}${item.amount}`;
    return item.detail || item.text;
  }

  function render(item) {
    item.node.replaceChildren();
    if (item.title) {
      const title = document.createElement("span");
      title.className = "sowie-toast-title";
      title.textContent = item.title;
      item.node.appendChild(title);
    }
    const detailText = item.detail || displayText(item);
    if (detailText) {
      const detail = document.createElement("span");
      detail.className = "sowie-toast-detail";
      detail.textContent = detailText;
      item.node.appendChild(detail);
    }
    if (item.reward) {
      const reward = document.createElement("span");
      reward.className = "sowie-toast-reward";
      reward.textContent = item.reward;
      item.node.appendChild(reward);
    }
  }

  function scheduleRemoval(item) {
    clearTimeout(item.timer);
    item.timer = window.setTimeout(() => {
      item.node?.classList.add("is-leaving");
      window.setTimeout(() => remove(item), 220);
    }, item.duration);
  }

  function updateStyles() {
    visible.forEach((item, index) => item.node?.classList.toggle("is-older", index < visible.length - 1));
  }

  function show(item) {
    findStack();
    if (!stack) {
      queue.unshift(item);
      return;
    }
    const node = document.createElement("div");
    node.className = `sowie-toast${item.important ? " is-important" : ""}`;
    node.setAttribute("role", "status");
    item.node = node;
    visible.push(item);
    stack.appendChild(node);
    render(item);
    updateStyles();
    scheduleRemoval(item);
  }

  function remove(item) {
    clearTimeout(item.timer);
    const index = visible.indexOf(item);
    if (index >= 0) visible.splice(index, 1);
    item.node?.remove();
    item.node = null;
    updateStyles();
    while (visible.length < MAX_VISIBLE && queue.length) show(queue.shift());
  }

  function receive(input, options = {}) {
    findStack();
    const item = normalize(input, options);
    if (!item.title && !item.text && !item.detail) return;
    const target = [...visible, ...queue].find(
      (candidate) => candidate.mergeKey === item.mergeKey && performance.now() - candidate.lastAt <= MERGE_WINDOW_MS,
    );
    if (target) {
      target.count += 1;
      target.lastAt = performance.now();
      if (item.amount !== null) target.total = Number(target.total || 0) + item.amount;
      if (target.node) {
        render(target);
        scheduleRemoval(target);
      }
      return;
    }
    if (visible.length < MAX_VISIBLE) show(item);
    else {
      if (item.important) queue.unshift(item);
      else queue.push(item);
      while (queue.length > MAX_QUEUE) {
        const regularIndex = queue.findIndex((queued) => !queued.important);
        queue.splice(regularIndex >= 0 ? regularIndex : queue.length - 1, 1);
      }
    }
  }

  installStyles();
  findStack();
  const observer = new MutationObserver(findStack);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  core.toast = receive;

  window.SowieNotifications = {
    toast: receive,
    getState: () => ({ visible: visible.map(displayText), queued: queue.map(displayText) }),
    restoreOriginalToast: () => { core.toast = originalToast; },
  };
})();