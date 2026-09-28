// Powłoka telefonu: auto-pauza (przejście do innej aplikacji, blokada ekranu, powiadomienie, obrót),
// powrót z odliczaniem 3-2-1, monitor płynności i tryb „Oszczędzanie baterii” (30 kl./s, mniej cząsteczek).

// Monitor płynności (czysta logika): gdy przez `windowSeconds` gra działa poniżej `threshold` kl./s,
// wywołuje onSlow() — jeden raz, do czasu reset().
export function createPerfMonitor({ threshold = 45, windowSeconds = 5, onSlow = () => {} } = {}) {
  let slowFor = 0;
  let fired = false;
  return {
    sample(fps, dt) {
      if (fired) return false;
      slowFor = fps < threshold ? slowFor + dt : 0;
      if (slowFor >= windowSeconds) {
        fired = true;
        onSlow();
        return true;
      }
      return false;
    },
    reset() {
      slowFor = 0;
      fired = false;
    },
    slowFor: () => slowFor,
  };
}

// Stan pauzy (czysta logika): "running" → "paused" → "countdown" (3, 2, 1) → "running".
// Przerwy liczą się tylko w aktywnej rozgrywce (setActive(true)); na ekranach tytułowych nie pauzujemy.
export function createPauseController({
  loop,
  countdownFrom = 3,
  tickMs = 1000,
  schedule = setTimeout,
  cancel = clearTimeout,
  onChange = () => {},
} = {}) {
  let state = "running";
  let active = false;
  let reason = null;
  let count = 0;
  let timer = null;

  function set(next, extra = {}) {
    state = next;
    onChange({ state, reason, count, ...extra });
  }

  function stopTimer() {
    if (timer !== null) cancel(timer);
    timer = null;
  }

  function tick() {
    count -= 1;
    if (count <= 0) {
      timer = null;
      loop?.resume();
      set("running");
      return;
    }
    set("countdown");
    timer = schedule(tick, tickMs);
  }

  return {
    setActive(value) {
      active = Boolean(value);
      if (!active && state !== "running") {
        stopTimer();
        loop?.resume();
        set("running");
      }
    },
    isActive: () => active,
    pause(why = "gracz") {
      if (!active) return false;
      stopTimer();
      reason = why;
      loop?.pause();
      set("paused");
      return true;
    },
    // Powrót zawsze przez odliczanie (chyba że countdownFrom = 0).
    resume() {
      if (state !== "paused") return false;
      if (countdownFrom <= 0) {
        loop?.resume();
        set("running");
        return true;
      }
      count = countdownFrom;
      set("countdown");
      timer = schedule(tick, tickMs);
      return true;
    },
    state: () => state,
    reason: () => reason,
    count: () => count,
  };
}

// Powłoka w przeglądarce. `stage` — element planszy (.sowie-stage), `loop` — pętla gry.
export function createShell({ stage, loop, onBatterySaver = () => {}, overlay = true, strings = {} } = {}) {
  const text = {
    paused: "Pauza",
    resume: "Graj dalej",
    reasons: {
      tlo: "Witaj z powrotem 🦉",
      fokus: "Gra czeka na Ciebie",
      obrot: "Ekran się obrócił",
      gracz: "Odpocznij chwilę",
    },
    slow: "Gra trochę zwalnia. Włączyć tryb „Oszczędzanie baterii”?",
    enable: "Włącz",
    dismiss: "Nie teraz",
    ...strings,
  };
  const listeners = new Set();
  let pauseNode = null;
  let slowNode = null;
  let batterySaver = Boolean(globalThis.SowieCloud?.profile?.().settings?.batterySaver);

  const controller = createPauseController({
    loop,
    onChange(change) {
      if (overlay) renderOverlay(change);
      for (const listener of listeners) listener(change);
    },
  });

  function renderOverlay({ state, reason, count }) {
    if (state === "running") {
      pauseNode?.remove();
      pauseNode = null;
      return;
    }
    if (!pauseNode) {
      pauseNode = document.createElement("div");
      pauseNode.className = "sowie-pause-overlay";
      pauseNode.setAttribute("role", "dialog");
      pauseNode.setAttribute("aria-modal", "true");
      pauseNode.setAttribute("aria-label", text.paused);
      pauseNode.addEventListener("pointerdown", (event) => event.stopPropagation());
      stage.appendChild(pauseNode);
    }
    if (state === "paused") {
      pauseNode.innerHTML = `<div class="sowie-pause-card"><h2>${text.paused}</h2><p>${text.reasons[reason] || ""}</p>
        <button type="button" class="sowie-pause-resume" data-shell-resume>${text.resume}</button></div>`;
      const button = pauseNode.querySelector("[data-shell-resume]");
      button.addEventListener("click", () => controller.resume());
      button.focus({ preventScroll: true });
    } else if (state === "countdown") {
      pauseNode.innerHTML = `<div class="sowie-countdown" aria-live="assertive">${count}</div>`;
    }
  }

  const onVisibility = () => {
    if (document.visibilityState === "hidden") controller.pause("tlo");
  };
  const onBlur = () => controller.pause("fokus");
  const onOrientation = () => controller.pause("obrot");
  const orientationQuery = window.matchMedia?.("(orientation: portrait)");

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("blur", onBlur);
  window.addEventListener("pagehide", onVisibility);
  orientationQuery?.addEventListener?.("change", onOrientation);
  // iOS: blokada powiększania gestem szczypania poza pozwolonymi miejscami.
  const blockGesture = (event) => event.preventDefault();
  stage.addEventListener("gesturestart", blockGesture);
  stage.addEventListener("dblclick", blockGesture);

  const monitor = createPerfMonitor({
    onSlow: () => {
      if (!batterySaver) showSlowBanner();
    },
  });
  const offFrame = loop?.onFrame?.(({ fps, delta }) => {
    if (controller.isActive() && controller.state() === "running" && !document.hidden) monitor.sample(fps, delta);
  });

  function showSlowBanner() {
    if (slowNode) return;
    slowNode = document.createElement("div");
    slowNode.className = "sowie-slow-banner";
    slowNode.setAttribute("role", "status");
    slowNode.innerHTML = `<p>${text.slow}</p><div><button type="button" data-shell-saver>${text.enable}</button>
      <button type="button" data-shell-dismiss>${text.dismiss}</button></div>`;
    slowNode.addEventListener("pointerdown", (event) => event.stopPropagation());
    slowNode.querySelector("[data-shell-saver]").addEventListener("click", () => {
      setBatterySaver(true);
      hideSlowBanner();
    });
    slowNode.querySelector("[data-shell-dismiss]").addEventListener("click", hideSlowBanner);
    stage.appendChild(slowNode);
  }

  function hideSlowBanner() {
    slowNode?.remove();
    slowNode = null;
  }

  function setBatterySaver(on) {
    batterySaver = Boolean(on);
    loop?.setRenderRate?.(batterySaver ? 30 : 60);
    onBatterySaver(batterySaver);
    globalThis.SowieCloud?.updateProfile?.((profile) => (profile.settings.batterySaver = batterySaver), {
      delayMs: 1000,
    });
    for (const listener of listeners) listener({ state: controller.state(), batterySaver });
  }

  setBatterySaver(batterySaver);
  globalThis.SowieCloud?.ready?.then(() => {
    const saved = Boolean(globalThis.SowieCloud.profile().settings?.batterySaver);
    if (saved !== batterySaver) setBatterySaver(saved);
  });

  return {
    pause: (reason) => controller.pause(reason),
    resume: () => controller.resume(),
    setActive: (value) => controller.setActive(value),
    state: () => controller.state(),
    setBatterySaver,
    batterySaver: () => batterySaver,
    showSlowBanner,
    monitor,
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("pagehide", onVisibility);
      orientationQuery?.removeEventListener?.("change", onOrientation);
      stage.removeEventListener("gesturestart", blockGesture);
      stage.removeEventListener("dblclick", blockGesture);
      offFrame?.();
      pauseNode?.remove();
      hideSlowBanner();
    },
  };
}
