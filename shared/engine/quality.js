// Automat płynności (Analiza 6, W1) — wspólny dla wszystkich gier i menu.
// Poziomy: 0 — ostrość 2 i wszystkie efekty; 1 — ostrość 1,5; 2 — ostrość 1 i połowa cząsteczek; 3 — jak 2 i rysowanie
// 30 razy na sekundę („Oszczędzanie baterii”). Tryby: „auto” (gra sama schodzi poziom niżej, gdy przez 3 s rysuje
// średnio < 50 klatek/s, i wraca poziom wyżej po 20 s ≥ 58 klatek/s, najwyżej raz na minutę; sama schodzi najwyżej do
// poziomu 2), „sharp” („Zawsze ostro” — poziom 0) i „saver” („Oszczędzanie baterii” — poziom 3).
// Limit klatek: na ekranach 90/120 Hz przeglądarka woła klatki częściej, a gra rysuje najwyżej 60 (30) razy na sekundę.
// Tryb i poziom automatu zapamiętuje urządzenie (SowieCloud.devicePrefs) — nie profil, wspólny dla wszystkich urządzeń.

export const QUALITY_MODES = Object.freeze(["auto", "sharp", "saver"]);

export const QUALITY_LEVELS = Object.freeze([
  Object.freeze({ level: 0, dpr: 2, particles: 1, fps: 60 }),
  Object.freeze({ level: 1, dpr: 1.5, particles: 1, fps: 60 }),
  Object.freeze({ level: 2, dpr: 1, particles: 0.5, fps: 60 }),
  Object.freeze({ level: 3, dpr: 1, particles: 0.5, fps: 30 }),
]);

// Ustawienie „Płynność” (menu: Sowa → Ustawienia, menu pauzy w grach) — nazwy i krótkie opisy trybów.
export const QUALITY_LABELS = Object.freeze({
  auto: "Automatyczna",
  sharp: "Zawsze ostro",
  saver: "Oszczędzanie baterii",
});
export const QUALITY_NOTES = Object.freeze({
  auto: "Gdy telefon nie nadąża, gra sama trochę zmniejsza ostrość, żeby była płynna.",
  sharp: "Zawsze najostrzejszy obraz — na słabszym telefonie gra może się ciąć.",
  saver: "30 klatek na sekundę i mniej efektów — telefon mniej się grzeje i dłużej działa na baterii.",
});

/** Przyciski wyboru „Płynność” (HTML): `chipClass` — klasa przycisku w danym miejscu (menu albo menu pauzy). */
export function qualityChoiceHtml(mode, chipClass) {
  const buttons = QUALITY_MODES.map(
    (key) =>
      `<button type="button" class="${chipClass}" role="radio" aria-checked="${key === mode}" aria-pressed="${key === mode}" data-quality="${key}">${QUALITY_LABELS[key]}</button>`,
  ).join("");
  return `<div class="sowie-quality" role="radiogroup" aria-label="Płynność"><span class="sowie-quality-title">Płynność</span><div class="sowie-quality-options">${buttons}</div><small data-quality-note>${QUALITY_NOTES[mode] || ""}</small></div>`;
}

/** Zaznacza wybrany tryb w grupie przycisków `root` (po kliknięciu) i podmienia opis. */
export function markQualityChoice(root, mode) {
  for (const button of root.querySelectorAll("[data-quality]")) {
    const on = button.dataset.quality === mode;
    button.setAttribute("aria-checked", String(on));
    button.setAttribute("aria-pressed", String(on));
  }
  const note = root.querySelector("[data-quality-note]");
  if (note) note.textContent = QUALITY_NOTES[mode] || "";
}

// Najniższy poziom, do którego automat schodzi sam (poziom 3 — tylko z wyboru „Oszczędzanie baterii”).
export const AUTO_MAX_LEVEL = 2;

const clampLevel = (value) => Math.max(0, Math.min(QUALITY_LEVELS.length - 1, Math.floor(Number(value) || 0)));

/**
 * Ogranicznik klatek: tick(czas od poprzedniej klatki przeglądarki w s) → czy rysować tę klatkę. Każda klatka
 * dokłada „budżet” rate·dt; rysujemy, gdy budżet ≥ 0,9 (tolerancja na drgania czasu klatki przy 60 Hz). Przy 60 Hz
 * rysuje każdą klatkę, przy 120 Hz co drugą, przy 90 Hz dwie z trzech — średnio 60 na sekundę.
 */
export function createFrameLimiter(rate = 60) {
  let perSecond = Math.max(1, Number(rate) || 60);
  let budget = 1;
  return {
    tick(deltaSeconds) {
      const delta = Math.max(0, Number(deltaSeconds) || 0);
      budget = Math.min(1.5, budget + delta * perSecond);
      if (budget < 0.9) return false;
      budget = Math.max(-0.5, budget - 1);
      return true;
    },
    setRate(value) {
      perSecond = Math.max(1, Number(value) || 60);
    },
    rate: () => perSecond,
    // Następna klatka na pewno rysowana (np. po zmianie ekranu albo przy wznowieniu).
    reset() {
      budget = 1;
    },
  };
}

/** Pamięć trybu i poziomu na tym urządzeniu: SowieCloud (wpis urządzenia), inaczej tylko w pamięci strony. */
export function deviceQualityStore(cloud = globalThis.SowieCloud) {
  let memory = {};
  return {
    get() {
      try {
        const prefs = cloud?.devicePrefs?.();
        if (prefs && typeof prefs === "object") return { ...(prefs.quality || {}) };
      } catch {
        // brak SowieCloud — pamięć strony
      }
      return { ...memory };
    },
    set(value) {
      memory = { ...value };
      try {
        cloud?.setDevicePrefs?.({ quality: { ...value } });
      } catch {
        // brak SowieCloud — zostaje w pamięci strony
      }
    },
    // Dawne ustawienie profilu „Oszczędzanie baterii” (przed W1) — gdy urządzenie nie ma jeszcze własnego wyboru.
    legacySaver() {
      try {
        return Boolean(cloud?.profile?.()?.settings?.batterySaver);
      } catch {
        return false;
      }
    },
  };
}

/**
 * createQuality({ store, mode, level, ... }) → automat płynności.
 * sample(dt, cel) — czas od poprzedniej narysowanej klatki (s) i docelowa liczba klatek/s (60, w spokoju albo
 * oszczędzaniu 30 — liczy się stosunek do celu), wołany przy każdym rysowaniu; level(), mode(), settings()
 * → { level, dpr, particles, fps }, dpr(urządzenie) → ostrość płótna, setMode(tryb), onChange(słuchacz),
 * onStruggle(słuchacz) — gra nie nadąża (< 45 kl./s przez 5 s) mimo najniższego poziomu automatu.
 */
export function createQuality({
  store = deviceQualityStore(),
  mode: initialMode = null,
  level: initialLevel = null,
  downFps = 50,
  downAfter = 3,
  upFps = 58,
  upAfter = 20,
  upCooldown = 60,
  struggleFps = 45,
  struggleAfter = 5,
} = {}) {
  const saved = store?.get?.() || {};
  let mode = QUALITY_MODES.includes(initialMode)
    ? initialMode
    : QUALITY_MODES.includes(saved.mode)
      ? saved.mode
      : store?.legacySaver?.()
        ? "saver"
        : "auto";
  let autoLevel = Math.min(AUTO_MAX_LEVEL, clampLevel(initialLevel ?? saved.level ?? 0));
  const listeners = new Set();
  const struggleListeners = new Set();
  // Okno pomiaru (1 s), kolejne wolne / szybkie sekundy i czas od ostatniej zmiany poziomu.
  let windowTime = 0;
  let windowFrames = 0;
  let windowExpected = 0;
  let slowSeconds = 0;
  let fastSeconds = 0;
  let sinceChange = upCooldown;
  // Propozycja „Oszczędzania baterii” (W6): kolejne sekundy < `struggleFps` na najniższym poziomie automatu (albo
  // w trybie „Zawsze ostro”) i czy propozycja już padła (raz, do zmiany trybu).
  let struggleSeconds = 0;
  let struggled = false;

  const level = () => (mode === "sharp" ? 0 : mode === "saver" ? 3 : autoLevel);
  const settings = () => QUALITY_LEVELS[level()];

  function notify(reason) {
    store?.set?.({ mode, level: autoLevel });
    const detail = { ...settings(), mode, reason };
    for (const listener of listeners) listener(detail);
  }

  function setAutoLevel(next, reason) {
    const value = Math.min(AUTO_MAX_LEVEL, clampLevel(next));
    if (value === autoLevel) return false;
    autoLevel = value;
    slowSeconds = 0;
    fastSeconds = 0;
    struggleSeconds = 0;
    sinceChange = 0;
    if (mode === "auto") notify(reason);
    else store?.set?.({ mode, level: autoLevel });
    return true;
  }

  return {
    QUALITY_LEVELS,
    level,
    mode: () => mode,
    settings,
    autoLevel: () => autoLevel,
    /** Ostrość płótna: najwyżej tyle, ile ma ekran urządzenia, i najwyżej tyle, ile pozwala poziom (≥ 1). */
    dpr(deviceRatio = globalThis.devicePixelRatio || 1) {
      return Math.max(1, Math.min(Number(deviceRatio) || 1, settings().dpr));
    },
    particleScale: () => settings().particles,
    fps: () => settings().fps,
    /** Czy automat może jeszcze zejść niżej (gdy nie — gra może zaproponować „Oszczędzanie baterii”). */
    canLower: () => mode === "auto" && autoLevel < AUTO_MAX_LEVEL,
    setMode(next) {
      if (!QUALITY_MODES.includes(next) || next === mode) return false;
      mode = next;
      slowSeconds = 0;
      fastSeconds = 0;
      struggleSeconds = 0;
      struggled = false;
      notify("mode");
      return true;
    },
    sample(deltaSeconds, target = 60) {
      const delta = Number(deltaSeconds) || 0;
      // Przerwa (karta w tle, pauza, wczytywanie) — nie liczymy.
      if (delta <= 0 || delta > 0.5) return false;
      sinceChange += delta;
      if (mode === "saver") return false;
      windowTime += delta;
      windowFrames += 1;
      // Ile klatek powinno być przy celu (np. w spokoju gra celowo rysuje 30 — to nie jest „wolno”).
      windowExpected += delta * Math.max(1, Math.min(60, Number(target) || 60));
      if (windowTime < 1) return false;
      // Klatki/s w przeliczeniu na cel 60 (40 z 60 → 40; 30 z 30 → 60; 20 z 30 → 40).
      const fps = (windowFrames / windowExpected) * 60;
      windowTime = 0;
      windowFrames = 0;
      windowExpected = 0;
      // Automat nie ma już dokąd zejść (albo „Zawsze ostro”), a gra dalej nie nadąża — propozycja oszczędzania.
      const bottom = mode !== "auto" || autoLevel >= AUTO_MAX_LEVEL;
      struggleSeconds = bottom && fps < struggleFps ? struggleSeconds + 1 : 0;
      if (struggleSeconds >= struggleAfter && !struggled) {
        struggled = true;
        const detail = { fps, mode, level: level() };
        for (const listener of struggleListeners) listener(detail);
      }
      if (mode !== "auto") return false;
      if (fps < downFps) {
        slowSeconds += 1;
        fastSeconds = 0;
      } else if (fps >= upFps) {
        fastSeconds += 1;
        slowSeconds = 0;
      } else {
        slowSeconds = 0;
        fastSeconds = 0;
      }
      if (slowSeconds >= downAfter && autoLevel < AUTO_MAX_LEVEL) return setAutoLevel(autoLevel + 1, "slow");
      if (fastSeconds >= upAfter && autoLevel > 0 && sinceChange >= upCooldown)
        return setAutoLevel(autoLevel - 1, "fast");
      return false;
    },
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** Gra nie nadąża mimo najniższego poziomu automatu (albo w trybie „Zawsze ostro”) — raz, do zmiany trybu. */
    onStruggle(listener) {
      struggleListeners.add(listener);
      return () => struggleListeners.delete(listener);
    },
    // Testy i Laboratorium: poziom automatu od razu.
    setAutoLevel: (next) => setAutoLevel(next, "test"),
  };
}
