// Zamienia przypisania innerHTML panelu zarządzania na lekki morph DOM.
// Dzięki temu fokus, przewijanie i delegowane nasłuchiwacze nie znikają przy odświeżaniu danych.
(() => {
  "use strict";

  const panel = document.getElementById("panelContent");
  if (!panel) return;

  const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
  if (!descriptor?.get || !descriptor?.set) return;

  function syncAttributes(current, next) {
    for (const attribute of Array.from(current.attributes)) {
      if (!next.hasAttribute(attribute.name)) current.removeAttribute(attribute.name);
    }
    for (const attribute of Array.from(next.attributes)) {
      if (current.getAttribute(attribute.name) !== attribute.value) {
        current.setAttribute(attribute.name, attribute.value);
      }
    }
  }

  function syncNode(current, next) {
    if (!current || !next) return;
    if (current.nodeType !== next.nodeType || current.nodeName !== next.nodeName) {
      current.replaceWith(next.cloneNode(true));
      return;
    }
    if (current.nodeType === Node.TEXT_NODE) {
      if (current.nodeValue !== next.nodeValue) current.nodeValue = next.nodeValue;
      return;
    }
    if (!(current instanceof Element) || !(next instanceof Element)) return;

    const wasFocused = document.activeElement === current;
    const selection = wasFocused && "selectionStart" in current
      ? [current.selectionStart, current.selectionEnd]
      : null;
    const preservedValue = wasFocused && "value" in current ? current.value : undefined;

    syncAttributes(current, next);
    syncChildren(current, next);

    if (wasFocused) {
      if (preservedValue !== undefined) current.value = preservedValue;
      current.focus({ preventScroll: true });
      if (selection && typeof current.setSelectionRange === "function") {
        current.setSelectionRange(selection[0], selection[1]);
      }
    }
  }

  function childKey(node, index) {
    if (!(node instanceof Element)) return `text:${index}`;
    return node.dataset.key || node.id || `${node.nodeName}:${node.getAttribute("data-tab") || ""}:${node.getAttribute("data-build") || ""}:${node.getAttribute("data-buy-plant") || ""}:${index}`;
  }

  function syncChildren(currentParent, nextParent) {
    const currentChildren = Array.from(currentParent.childNodes);
    const nextChildren = Array.from(nextParent.childNodes);
    const keyed = new Map(currentChildren.map((node, index) => [childKey(node, index), node]));

    nextChildren.forEach((nextChild, index) => {
      const key = childKey(nextChild, index);
      let currentChild = keyed.get(key) || currentParent.childNodes[index];
      if (!currentChild) {
        currentParent.appendChild(nextChild.cloneNode(true));
        return;
      }
      if (currentParent.childNodes[index] !== currentChild) {
        currentParent.insertBefore(currentChild, currentParent.childNodes[index] || null);
      }
      syncNode(currentChild, nextChild);
      keyed.delete(key);
    });

    const expected = nextChildren.length;
    while (currentParent.childNodes.length > expected) currentParent.lastChild.remove();
  }

  Object.defineProperty(panel, "innerHTML", {
    configurable: true,
    get() {
      return descriptor.get.call(this);
    },
    set(markup) {
      const template = document.createElement("template");
      template.innerHTML = String(markup);
      syncChildren(this, template.content);
    },
  });

  panel.dataset.stablePanel = "true";
})();