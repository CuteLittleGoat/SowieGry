// Interfejs SowieCloud: ekran „Hasło sowy”, sówka ładowania, pasek trybu offline i pytanie o nowszy postęp.
// Projektowane najpierw pod telefon w pionie (Analiza 1, rozdział 5). Logika hasła jest w shared/sowie-cloud.js.
(() => {
  "use strict";

  const cloud = window.SowieCloud;
  if (!cloud) {
    console.error("Brak SowieCloud. Załaduj shared/sowie-cloud.js przed password-gate.js.");
    return;
  }

  // Zdarzenia z nakładek nie mogą dotrzeć do gry (np. p5 nasłuchuje dotyku i klawiszy na window).
  const ISOLATED_EVENTS = [
    "keydown",
    "keyup",
    "keypress",
    "pointerdown",
    "pointerup",
    "pointermove",
    "mousedown",
    "mouseup",
    "touchstart",
    "touchmove",
    "touchend",
    "click",
    "wheel",
    "contextmenu",
  ];

  let gate = null;
  let loading = null;
  let loadingTimer = 0;
  let offlineBar = null;
  let dialog = null;

  function isolate(node) {
    for (const type of ISOLATED_EVENTS) node.addEventListener(type, (event) => event.stopPropagation());
  }

  function whenDom(fn) {
    if (document.body) fn();
    else document.addEventListener("DOMContentLoaded", fn, { once: true });
  }

  // --- ekran hasła ----------------------------------------------------------------

  function syncViewport() {
    const viewport = window.visualViewport;
    const root = document.documentElement;
    if (!viewport) return;
    root.style.setProperty("--sowie-gate-height", `${Math.round(viewport.height)}px`);
    root.style.setProperty("--sowie-gate-top", `${Math.round(viewport.offsetTop)}px`);
  }

  function buildGate() {
    const node = document.createElement("div");
    node.className = "sowie-gate";
    node.setAttribute("role", "dialog");
    node.setAttribute("aria-modal", "true");
    node.setAttribute("aria-labelledby", "sowieGateTitle");
    node.innerHTML = `
      <div class="sowie-gate-hero">
        <div class="sowie-gate-owl" aria-hidden="true">🦉</div>
        <h1 id="sowieGateTitle">Hasło sowy</h1>
        <p>Wpisz hasło, żeby wejść do SowieGry. Na tym urządzeniu wystarczy zrobić to raz.</p>
      </div>
      <form class="sowie-gate-form" novalidate>
        <label class="sowie-gate-label" for="sowieGatePassword">Hasło</label>
        <div class="sowie-gate-field">
          <input id="sowieGatePassword" name="haslo" type="password" autocomplete="off" autocapitalize="none"
            autocorrect="off" spellcheck="false" enterkeyhint="go" inputmode="text" />
          <button type="button" class="sowie-gate-eye" aria-label="Pokaż hasło" aria-pressed="false">👁</button>
        </div>
        <p class="sowie-gate-error" role="alert" hidden>Hu-hu? To nie to hasło 🦉</p>
        <button type="submit" class="sowie-gate-submit">Wejdź</button>
      </form>`;
    isolate(node);

    const form = node.querySelector("form");
    const input = node.querySelector("input");
    const eye = node.querySelector(".sowie-gate-eye");
    const error = node.querySelector(".sowie-gate-error");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (cloud.unlock(input.value)) {
        hideGate();
        return;
      }
      error.hidden = false;
      node.classList.remove("is-wrong");
      void node.offsetWidth;
      node.classList.add("is-wrong");
      input.select();
    });
    input.addEventListener("input", () => {
      error.hidden = true;
    });
    eye.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      eye.setAttribute("aria-pressed", String(show));
      eye.setAttribute("aria-label", show ? "Ukryj hasło" : "Pokaż hasło");
      input.focus({ preventScroll: true });
    });
    // Fokus zostaje w oknie hasła (Tab krąży między polem, oczkiem i przyciskiem).
    node.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const items = [input, eye, node.querySelector(".sowie-gate-submit")];
      const index = items.indexOf(document.activeElement);
      event.preventDefault();
      items[(index + (event.shiftKey ? items.length - 1 : 1)) % items.length].focus();
    });
    return node;
  }

  function keepFocusInGate(event) {
    if (gate && !gate.contains(event.target)) gate.querySelector("input")?.focus({ preventScroll: true });
  }

  function showGate() {
    whenDom(() => {
      if (gate || cloud.isUnlocked()) return;
      gate = buildGate();
      document.body.appendChild(gate);
      document.documentElement.classList.add("sowie-gate-open");
      syncViewport();
      window.visualViewport?.addEventListener("resize", syncViewport);
      window.visualViewport?.addEventListener("scroll", syncViewport);
      document.addEventListener("focusin", keepFocusInGate);
      gate.querySelector("input").focus({ preventScroll: true });
    });
  }

  function hideGate() {
    if (!gate) return;
    gate.remove();
    gate = null;
    document.documentElement.classList.remove("sowie-gate-open");
    window.visualViewport?.removeEventListener("resize", syncViewport);
    window.visualViewport?.removeEventListener("scroll", syncViewport);
    document.removeEventListener("focusin", keepFocusInGate);
  }

  // --- sówka ładowania ----------------------------------------------------------------

  function showLoading() {
    if (loading || loadingTimer) return;
    // Krótkie opóźnienie: przy powrocie do gry (cache) sówka w ogóle się nie pokazuje.
    loadingTimer = window.setTimeout(() => {
      loadingTimer = 0;
      whenDom(() => {
        if (loading || cloud.isReady()) return;
        loading = document.createElement("div");
        loading.className = "sowie-cloud-loading";
        loading.setAttribute("role", "status");
        loading.innerHTML = `<div class="sowie-cloud-owl" aria-hidden="true">🦉</div><p>Wczytuję postęp…</p>`;
        isolate(loading);
        document.body.appendChild(loading);
      });
    }, 200);
  }

  function hideLoading() {
    window.clearTimeout(loadingTimer);
    loadingTimer = 0;
    loading?.remove();
    loading = null;
  }

  // --- pasek trybu offline --------------------------------------------------------------

  function showOfflineBar() {
    if (offlineBar || !cloud.offlineReason()) return;
    whenDom(() => {
      offlineBar = document.createElement("div");
      offlineBar.className = "sowie-cloud-offline";
      offlineBar.setAttribute("role", "status");
      offlineBar.textContent = "Tryb offline — postęp z tej sesji nie zostanie zapisany.";
      document.body.appendChild(offlineBar);
    });
  }

  // --- nowszy postęp z innego urządzenia -------------------------------------------------

  function showConflict(conflict) {
    whenDom(() => {
      dialog?.remove();
      dialog = document.createElement("div");
      dialog.className = "sowie-cloud-dialog";
      dialog.setAttribute("role", "alertdialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", "sowieCloudConflictTitle");
      dialog.innerHTML = `
        <div class="sowie-cloud-dialog-card">
          <h2 id="sowieCloudConflictTitle">Nowszy postęp 🦉</h2>
          <p>Na innym urządzeniu zapisano nowszy postęp — wczytać?</p>
          <div class="sowie-cloud-dialog-actions">
            <button type="button" data-cloud-load>Wczytaj</button>
            <button type="button" data-cloud-keep>Zostań przy tym</button>
          </div>
        </div>`;
      isolate(dialog);
      dialog.querySelector("[data-cloud-load]").addEventListener("click", () => {
        dialog.remove();
        dialog = null;
        conflict.decide(true);
      });
      dialog.querySelector("[data-cloud-keep]").addEventListener("click", () => {
        dialog.remove();
        dialog = null;
        conflict.decide(false);
      });
      document.body.appendChild(dialog);
      dialog.querySelector("[data-cloud-load]").focus({ preventScroll: true });
    });
  }

  cloud.onConflict(showConflict);
  cloud.onStatus((status) => {
    if (status === "haslo") {
      hideLoading();
      showGate();
      return;
    }
    hideGate();
    if (status === "laczenie" && !cloud.isReady()) showLoading();
    else hideLoading();
    if (cloud.isReady()) showOfflineBar();
  });

  window.SowiePasswordGate = Object.freeze({ show: showGate, hide: hideGate });
})();
