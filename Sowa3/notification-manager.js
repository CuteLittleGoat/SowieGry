// Kompaktowy menedżer powiadomień dla Sowa3.
(() => {
  "use strict";

  const core = window.SowieCore;
  if (!core) return;

  const MAX_VISIBLE = 2;
  const MAX_QUEUE = 5;
  const DEFAULT_DURATION = 2500;
  const IMPORTANT_DURATION = 4000;
  const MERGE_WINDOW = 1800;
  const LEAVE_DURATION = 220;

  const visible = [];
  const queue = [];
  let stack = null;
  let sequence = 0;
  let pendingMission = null;
  let pendingMissionTimer = 0;
  const originalToast = core.toast;

  function installStyles() {
    if (document.querySelector("style[data-sowa3-notifications]")) return;
    const style = document.createElement("style");
    style.dataset.sowa3Notifications = "true";
    style.textContent = `
      .sowie-toast-stack.sowa3-notification-stack {
        top: auto;
        bottom: max(8vh, calc(env(safe-area-inset-bottom) + 14px));
        width: min(82vw, 360px);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        gap: 7px;
      }

      .sowie-toast-stack.sowa3-notification-stack > .sowie-toast:not([data-sowa3-managed]) {
        display: none !important;
      }

      .sowie-toast-stack.sowa3-notification-stack .sowie-toast {
        box-sizing: border-box;
        width: 100%;
        min-height: 42px;
        padding: 9px 13px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.91);
        box-shadow: 0 8px 20px rgba(43, 39, 51, 0.15);
        font: 800 14px/1.25 system-ui, sans-serif;
        animation: sowa3ToastIn 180ms ease-out both;
        transition: opacity 180ms ease, transform 180ms ease;
        backdrop-filter: blur(8px);
      }

      .sowie-toast-stack.sowa3-notification-stack .sowie-toast.is-older {
        opacity: 0.7;
        transform: scale(0.96);
      }

      .sowie-toast-stack.sowa3-notification-stack .sowie-toast.is-important {
        padding: 11px 14px;
        background: rgba(255, 248, 220, 0.96);
        box-shadow: 0 9px 22px rgba(43, 39, 51, 0.18), inset 0 0 0 2px rgba(255, 214, 90, 0.55);
      }

      .sowie-toast-stack.sowa3-notification-stack .sowie-toast.is-leaving {
        opacity: 0;
        transform: translateY(8px) scale(0.96);
      }

      .sowa3-toast-title,
      .sowa3-toast-detail,
      .sowa3-toast-reward {
        display: block;
      }

      .sowa3-toast-title {
        font-size: 14px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }

      .sowa3-toast-detail {
        margin-top: 2px;
        font-weight: 800;
      }

      .sowa3-toast-reward {
        margin-top: 3px;
        font-size: 13px;
        font-weight: 750;
      }

      @keyframes sowa3ToastIn {
        from { opacity: 0; transform: translateY(8px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @media (max-height: 620px), (orientation: landscape) {
        .sowie-toast-stack.sowa3-notification-stack {
          bottom: max(12px, env(safe-area-inset-bottom));
          width: min(70vw, 350px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function attachStack(candidate) {
    if (!candidate || candidate === stack) return;
    stack = candidate;
    stack.classList.add("sowa3-notification-stack");

    for (const node of Array.from(stack.children)) {
      if (!node.dataset.sowa3Managed) ingestLegacyNode(node);
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement) || node.dataset.sowa3Managed) continue;
          ingestLegacyNode(node);
        }
      }
    });
    observer.observe(stack, { childList: true });
  }

  function findStack() {
    attachStack(document.querySelector(".sowie-toast-stack"));
  }

  function ingestLegacyNode(node) {
    const text = (node.textContent || "").trim();
    node.remove();
    if (text) receive(text);
  }

  function normalize(input, options = {}) {
    if (input && typeof input === "object") {
      const text = String(input.text || input.detail || "").trim();
      return {
        id: ++sequence,
        text,
        title: input.title ? String(input.title) : "",
        detail: input.detail ? String(input.detail) : "",
        reward: input.reward ? String(input.reward) : "",
        kind: input.kind === "important" || input.kind === "mission" ? "important" : "normal",
        duration: Number(input.duration) || (input.kind === "important" || input.kind === "mission" ? IMPORTANT_DURATION : DEFAULT_DURATION),
        mergeKey: String(input.mergeKey || text || input.title || "notification"),
        amount: Number.isFinite(Number(input.amount)) ? Number(input.amount) : null,
        count: 1,
        total: Number.isFinite(Number(input.amount)) ? Number(input.amount) : null,
        createdAt: performance.now(),
        lastAt: performance.now(),
        node: null,
        timer: 0,
        removeTimer: 0,
      };
    }

    const rawText = String(input || "").trim();
    const amountMatch = rawText.match(/^(.*?)(?:\s+)([+-]\d+)$/);
    const baseText = amountMatch ? amountMatch[1].trim() : rawText;
    const amount = amountMatch ? Number(amountMatch[2]) : null;
    return {
      id: ++sequence,
      text: baseText,
      title: "",
      detail: "",
      reward: "",
      kind: options.kind === "important" ? "important" : "normal",
      duration: Number(options.duration) || (options.kind === "important" ? IMPORTANT_DURATION : DEFAULT_DURATION),
      mergeKey: String(options.mergeKey || baseText || rawText || "notification"),
      amount,
      count: 1,
      total: amount,
      createdAt: performance.now(),
      lastAt: performance.now(),
      node: null,
      timer: 0,
      removeTimer: 0,
    };
  }

  function receive(input, options = {}) {
    const rawText = typeof input === "string" ? input.trim() : "";

    if (rawText.startsWith("Misja ukończona:")) {
      flushPendingMission();
      pendingMission = rawText.slice("Misja ukończona:".length).trim();
      pendingMissionTimer = window.setTimeout(() => {
        const mission = pendingMission;
        pendingMission = null;
        pendingMissionTimer = 0;
        enqueue(normalize({
          title: "Misja ukończona",
          detail: mission,
          kind: "important",
          duration: IMPORTANT_DURATION,
          mergeKey: `mission:${mission}`,
        }));
      }, 80);
      return;
    }

    if (rawText.startsWith("Nagroda:") && pendingMission) {
      const mission = pendingMission;
      const reward = rawText.slice("Nagroda:".length).trim();
      window.clearTimeout(pendingMissionTimer);
      pendingMission = null;
      pendingMissionTimer = 0;
      enqueue(normalize({
        title: "Misja ukończona",
        detail: mission,
        reward: `Nagroda: ${reward}`,
        kind: "important",
        duration: IMPORTANT_DURATION,
        mergeKey: `mission:${mission}`,
      }));
      return;
    }

    flushPendingMission();
    const item = normalize(input, options);
    if (!item.text && !item.title && !item.detail) return;
    enqueue(item);
  }

  function flushPendingMission() {
    if (!pendingMission) return;
    const mission = pendingMission;
    window.clearTimeout(pendingMissionTimer);
    pendingMission = null;
    pendingMissionTimer = 0;
    enqueue(normalize({
      title: "Misja ukończona",
      detail: mission,
      kind: "important",
      duration: IMPORTANT_DURATION,
      mergeKey: `mission:${mission}`,
    }));
  }

  function findMergeTarget(item) {
    const now = performance.now();
    return [...visible, ...queue].find((candidate) => (
      candidate.mergeKey === item.mergeKey && now - candidate.lastAt <= MERGE_WINDOW
    ));
  }

  function enqueue(item) {
    findStack();
    const target = findMergeTarget(item);
    if (target) {
      target.count += 1;
      target.lastAt = performance.now();
      if (item.amount !== null) target.total = Number(target.total || 0) + item.amount;
      if (target.node) {
        renderItem(target);
        scheduleRemoval(target);
      }
      return;
    }

    if (visible.length < MAX_VISIBLE) {
      show(item);
      return;
    }

    if (item.kind === "important") queue.unshift(item);
    else queue.push(item);

    while (queue.length > MAX_QUEUE) {
      const regularIndex = queue.findIndex((queued) => queued.kind !== "important");
      queue.splice(regularIndex >= 0 ? regularIndex : queue.length - 1, 1);
    }
  }

  function show(item) {
    if (!stack) findStack();
    if (!stack) {
      queue.unshift(item);
      return;
    }

    const node = document.createElement("div");
    node.className = `sowie-toast${item.kind === "important" ? " is-important" : ""}`;
    node.dataset.sowa3Managed = "true";
    item.node = node;
    visible.push(item);
    stack.appendChild(node);
    renderItem(item);
    updateVisibleStyles();
    scheduleRemoval(item);
  }

  function renderItem(item) {
    if (!item.node) return;
    item.node.replaceChildren();

    if (item.title) {
      const title = document.createElement("span");
      title.className = "sowa3-toast-title";
      title.textContent = item.title;
      item.node.appendChild(title);
    }

    const mainText = item.detail || formatCompactText(item);
    if (mainText) {
      const detail = document.createElement("span");
      detail.className = "sowa3-toast-detail";
      detail.textContent = mainText;
      item.node.appendChild(detail);
    }

    if (item.reward) {
      const reward = document.createElement("span");
      reward.className = "sowa3-toast-reward";
      reward.textContent = item.reward;
      item.node.appendChild(reward);
    }
  }

  function formatCompactText(item) {
    if (item.count > 1 && item.total !== null) {
      const sign = item.total >= 0 ? "+" : "";
      return `${item.text} ×${item.count} — łącznie ${sign}${item.total}`;
    }
    if (item.count > 1) return `${item.text} ×${item.count}`;
    if (item.amount !== null) {
      const sign = item.amount >= 0 ? "+" : "";
      return `${item.text} ${sign}${item.amount}`;
    }
    return item.text;
  }

  function scheduleRemoval(item) {
    window.clearTimeout(item.timer);
    window.clearTimeout(item.removeTimer);
    item.node?.classList.remove("is-leaving");
    item.timer = window.setTimeout(() => {
      item.node?.classList.add("is-leaving");
      item.removeTimer = window.setTimeout(() => remove(item), LEAVE_DURATION);
    }, item.duration);
  }

  function remove(item) {
    window.clearTimeout(item.timer);
    window.clearTimeout(item.removeTimer);
    const index = visible.indexOf(item);
    if (index >= 0) visible.splice(index, 1);
    item.node?.remove();
    item.node = null;
    updateVisibleStyles();
    fillVisibleSlots();
  }

  function updateVisibleStyles() {
    visible.forEach((item, index) => {
      item.node?.classList.toggle("is-older", index < visible.length - 1);
    });
  }

  function fillVisibleSlots() {
    while (visible.length < MAX_VISIBLE && queue.length > 0) {
      show(queue.shift());
    }
  }

  installStyles();

  const bodyObserver = new MutationObserver(findStack);
  bodyObserver.observe(document.documentElement, { childList: true, subtree: true });
  findStack();

  core.toast = function managedToast(input, options) {
    receive(input, options);
  };

  window.Sowa3Notifications = {
    toast: receive,
    getState: () => ({
      visible: visible.map((item) => formatCompactText(item)),
      queued: queue.map((item) => formatCompactText(item)),
    }),
    restoreOriginalToast: () => {
      core.toast = originalToast;
    },
  };
})();
