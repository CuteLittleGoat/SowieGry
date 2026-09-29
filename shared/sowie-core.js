(() => {
  "use strict";

  const platform = window.SowiePlatform;
  const cloud = window.SowieCloud;
  if (!platform || !cloud) {
    console.error("Brak SowiePlatform lub SowieCloud. Załaduj shared/sowie-platform.js i shared/sowie-cloud.js przed sowie-core.js.");
    return;
  }

  const COSMETICS = platform.COSMETICS;
  const MISSION_LABELS = {
    leaves20: "Zbierz 20 liści monster",
    extraLife: "Zdobądź dodatkowe życie",
    nearMiss3: "Wykonaj 3 uniki „O włos!”",
    chaosFinish: "Ukończ etap na poziomie Chaos",
    combo4: "Osiągnij combo ×4",
    runner1000: "Przebiegnij 1000 m w Sowiej Ucieczce",
    jumper250: "Osiągnij 250 m w SowaJumper",
  };
  const QUIPS = [
    "Hu-hu! Ale lot!",
    "Pracu Pracu? Nie dzisiaj!",
    "Skrzydła w gotowości!",
    "Monstera zauważona!",
    "Basen już blisko!",
  ];

  // Profil jest w SowieCloud (Firestore). Zawsze czytamy bieżący obiekt — po starcie chmury jest podmieniany.
  const profile = () => cloud.profile();
  const SETTINGS_DELAY_MS = 1000;
  const CLOUD_STATUS_LABELS = {
    haslo: "czeka na hasło",
    laczenie: "łączenie…",
    online: "zapisano w chmurze ☁️",
    offline: "tryb offline — postęp nie jest zapisywany",
    zapisywanie: "zapisywanie…",
    blad: "błąd zapisu — spróbujemy ponownie",
  };
  let gameAdapter = null;
  let audioContext = null;
  let musicTimer = 0;
  let musicStep = 0;
  let debugNode = null;
  let lastQuipAt = 0;
  let modalReturnFocus = null;
  let pausedBeforeModal = false;
  const lastSoundAt = new Map();

  function profileChanged() {
    platform.emit("profile:changed", { profile: profile() });
  }

  function getProfile() {
    return profile();
  }

  function settings() {
    return profile().settings;
  }

  function selectedCosmetic() {
    return profile().cosmetics.selected;
  }

  function unlockCosmetic(key, announce = true) {
    if (!cloud.isReady()) {
      cloud.ready.then(() => unlockCosmetic(key, announce));
      return false;
    }
    if (!COSMETICS[key] || profile().cosmetics.unlocked.includes(key)) return false;
    cloud.updateProfile((data) => data.cosmetics.unlocked.push(key), { delayMs: SETTINGS_DELAY_MS });
    profileChanged();
    platform.emit("cosmetic:unlocked", { key });
    if (announce) toast(`Odblokowano: ${COSMETICS[key].label}!`);
    play("unlock");
    return true;
  }

  function selectCosmetic(key) {
    if (!cloud.isReady() || !profile().cosmetics.unlocked.includes(key) || !COSMETICS[key]) return false;
    cloud.updateProfile((data) => (data.cosmetics.selected = key), { delayMs: SETTINGS_DELAY_MS });
    profileChanged();
    renderWardrobe();
    toast(`Wybrano: ${COSMETICS[key].label}`);
    platform.emit("cosmetic:selected", { key });
    return true;
  }

  function progressMission(key, amount = 1) {
    if (!cloud.isReady()) {
      cloud.ready.then(() => progressMission(key, amount));
      return false;
    }
    const mission = profile().missions[key];
    if (!mission || mission.done) return false;
    const throttleMs = key === "runner1000" || key === "jumper250" ? 500 : 0;
    if (throttleMs && !platform.shouldRun(`mission:${key}`, throttleMs)) return false;
    cloud.updateProfile(() => {
      mission.progress = Math.min(mission.target, Number(mission.progress || 0) + Number(amount || 0));
      if (mission.progress >= mission.target) mission.done = true;
    });
    if (mission.done) {
      unlockCosmetic(mission.reward, false);
      toast({
        title: "Misja ukończona",
        detail: MISSION_LABELS[key] || key,
        reward: `Nagroda: ${COSMETICS[mission.reward]?.label || mission.reward}`,
        kind: "important",
        mergeKey: `mission:${key}`,
      });
      play("mission");
    }
    renderMissions();
    platform.emit("mission:progress", { key, mission: { ...mission } });
    return mission.done;
  }

  // Statystyki ogólne profilu. Dawne statystyki dublujące rekordy gier (np. runnerDistance) są pomijane —
  // rekordy zapisuje SowieCloud.submitRun() / saveGameState().
  function recordStat(key, value, mode = "add") {
    const number = Number(value);
    if (!Number.isFinite(number) || !(key in platform.DEFAULT_STATS)) return false;
    if (mode === "max") {
      if (!cloud.isReady()) {
        cloud.ready.then(() => recordStat(key, number, mode));
        return true;
      }
      if (number > Number(profile().stats[key] || 0)) cloud.updateProfile((data) => (data.stats[key] = number));
    } else {
      cloud.increment(`stats.${key}`, number);
    }
    platform.emit("stat:recorded", { key, value: profile().stats[key], mode });
    return true;
  }

  function ensureAudio() {
    if (audioContext) return audioContext;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
    return audioContext;
  }

  function resumeAudio() {
    const context = ensureAudio();
    if (context?.state === "suspended") context.resume().catch(() => {});
  }

  function tone(frequency, duration = 0.12, volume = 0.045, type = "sine", delay = 0) {
    if (!profile().settings.sfx) return;
    const context = ensureAudio();
    if (!context) return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function play(name) {
    if (!profile().settings.sfx) return false;
    const now = performance.now();
    const previous = lastSoundAt.get(name) ?? -Infinity;
    if (now - previous < 90) return false;
    lastSoundAt.set(name, now);
    resumeAudio();
    const sounds = {
      leaf: [[660, 0.08, 0.035, "sine", 0], [880, 0.1, 0.03, "sine", 0.055]],
      heart: [[520, 0.11, 0.04, "triangle", 0], [780, 0.15, 0.04, "triangle", 0.07]],
      jump: [[330, 0.08, 0.025, "triangle", 0]],
      hurt: [[150, 0.18, 0.05, "sawtooth", 0]],
      near: [[920, 0.08, 0.035, "sine", 0]],
      combo: [[620, 0.08, 0.03, "triangle", 0], [820, 0.1, 0.03, "triangle", 0.06]],
      goat: [[210, 0.12, 0.035, "square", 0], [260, 0.12, 0.025, "square", 0.08]],
      whale: [[180, 0.22, 0.04, "sine", 0], [130, 0.28, 0.03, "sine", 0.06]],
      phone: [[740, 0.08, 0.03, "square", 0], [620, 0.08, 0.03, "square", 0.11]],
      boar: [[95, 0.25, 0.04, "sawtooth", 0]],
      splash: [[280, 0.16, 0.035, "sine", 0], [420, 0.12, 0.025, "sine", 0.04]],
      mission: [[520, 0.1, 0.04, "triangle", 0], [660, 0.1, 0.04, "triangle", 0.08], [880, 0.16, 0.04, "triangle", 0.16]],
      unlock: [[740, 0.1, 0.04, "triangle", 0], [980, 0.18, 0.04, "triangle", 0.08]],
    };
    for (const args of sounds[name] || sounds.leaf) tone(...args);
    return true;
  }

  function stopMusic() {
    if (musicTimer) window.clearInterval(musicTimer);
    musicTimer = 0;
  }

  function startMusic(theme = "default") {
    stopMusic();
    if (!profile().settings.music) return;
    resumeAudio();
    const melodies = {
      default: [392, 494, 587, 494, 440, 523, 659, 523],
      runner: [330, 392, 494, 392, 349, 440, 523, 440],
      jumper: [440, 523, 659, 784, 659, 587, 523, 494],
      market: [392, 440, 494, 587, 494, 440, 392, 330],
      flowers: [523, 659, 784, 659, 587, 698, 880, 698],
      estate: [294, 349, 392, 349, 330, 392, 440, 392],
    };
    const melody = melodies[theme] || melodies.default;
    musicStep = 0;
    musicTimer = window.setInterval(() => {
      if (!profile().settings.music || document.hidden) return;
      const context = ensureAudio();
      if (!context || context.state !== "running") return;
      const frequency = melody[musicStep % melody.length];
      musicStep += 1;
      tone(frequency, 0.19, 0.012, "triangle", 0);
    }, 430);
  }

  function toast(input) {
    ensureUi();
    const stack = document.querySelector(".sowie-toast-stack");
    if (!stack) return;
    const node = document.createElement("div");
    node.className = "sowie-toast";
    node.setAttribute("role", "status");
    node.textContent = typeof input === "string"
      ? input
      : [input?.title, input?.detail, input?.reward].filter(Boolean).join(" — ");
    stack.appendChild(node);
    window.setTimeout(() => node.remove(), Number(input?.duration) || 2850);
  }

  function maybeQuip(text = null) {
    if (!profile().settings.quips) return;
    const now = performance.now();
    if (now - lastQuipAt < 6500) return;
    lastQuipAt = now;
    toast(text || QUIPS[Math.floor(Math.random() * QUIPS.length)]);
  }

  function toggleSetting(key) {
    if (!cloud.isReady() || !(key in profile().settings)) return;
    cloud.updateProfile((data) => (data.settings[key] = !data.settings[key]), { delayMs: SETTINGS_DELAY_MS });
    const value = profile().settings[key];
    if (key === "reducedEffects") document.documentElement.classList.toggle("sowie-reduced-effects", value);
    profileChanged();
    if (key === "music") {
      if (value) startMusic(gameAdapter?.musicTheme?.() || "default");
      else stopMusic();
    }
    renderSettings();
  }

  function registerGame(adapter) {
    gameAdapter = adapter || null;
    // Gra zręcznościowa: komunikaty w trakcie gry idą na górę ekranu (nie zasłaniają sowy).
    document.documentElement.classList.toggle("sowie-arcade", Boolean(gameAdapter?.isPlaying));
    ensureUi();
    if (profile().settings.music) startMusic(adapter?.musicTheme?.() || "default");
    platform.emit("game:registered", { adapter: gameAdapter });
  }

  // Czy trwa rozgrywka (bieg, wspinaczka) i nie ma pauzy — dla komunikatów (max 1 naraz w trakcie gry).
  function isPlaying() {
    return Boolean(gameAdapter?.isPlaying?.() && !gameAdapter.getPaused?.());
  }

  function togglePause() {
    if (!gameAdapter?.getPaused || !gameAdapter?.setPaused) return;
    const next = !gameAdapter.getPaused();
    gameAdapter.setPaused(next);
    const badge = document.querySelector(".sowie-paused-badge");
    if (badge) badge.hidden = !next;
    platform.emit(next ? "game:pause" : "game:resume");
  }

  function focusableElements(root) {
    return Array.from(root.querySelectorAll(
      "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
    )).filter((element) => !element.hidden && element.getClientRects().length > 0);
  }

  function setBackgroundInert(enabled) {
    const backdrop = document.querySelector(".sowie-modal-backdrop");
    for (const child of document.body.children) {
      if (child === backdrop) continue;
      if (enabled) child.setAttribute("inert", "");
      else child.removeAttribute("inert");
    }
  }

  function openModal(tab = "wardrobe", opener = document.activeElement) {
    ensureUi();
    const backdrop = document.querySelector(".sowie-modal-backdrop");
    if (!backdrop) return;
    modalReturnFocus = opener instanceof HTMLElement ? opener : null;
    pausedBeforeModal = Boolean(gameAdapter?.getPaused?.());
    if (gameAdapter?.setPaused) gameAdapter.setPaused(true);
    backdrop.dataset.tab = tab;
    backdrop.hidden = false;
    setBackgroundInert(true);
    renderModal(tab);
    window.setTimeout(() => focusableElements(backdrop)[0]?.focus(), 0);
    platform.emit("modal:open", { tab });
  }

  function closeModal() {
    const backdrop = document.querySelector(".sowie-modal-backdrop");
    if (!backdrop || backdrop.hidden) return;
    backdrop.hidden = true;
    setBackgroundInert(false);
    if (gameAdapter?.setPaused) gameAdapter.setPaused(pausedBeforeModal);
    const badge = document.querySelector(".sowie-paused-badge");
    if (badge) badge.hidden = !pausedBeforeModal;
    modalReturnFocus?.focus?.();
    platform.emit("modal:close");
  }

  function renderModal(tab) {
    if (tab === "settings") renderSettings();
    else if (tab === "missions") renderMissions();
    else renderWardrobe();
  }

  function modalShell(title, body) {
    return `<h2 id="sowieModalTitle">${title}</h2>${body}<div class="sowie-modal-actions"><button type="button" data-close>Zamknij</button></div>`;
  }

  function renderWardrobe() {
    const backdrop = document.querySelector(".sowie-modal-backdrop");
    const modal = document.querySelector(".sowie-modal");
    if (!modal || backdrop?.dataset.tab !== "wardrobe") return;
    modal.innerHTML = modalShell("Garderoba sowy", `<p>Wybrany element jest używany we wszystkich ${platform.GAME_REGISTRY.length} grach.</p><div class="sowie-modal-grid" data-cosmetics></div>`);
    const grid = modal.querySelector("[data-cosmetics]");
    const { unlocked: unlockedList, selected } = profile().cosmetics;
    for (const [key, item] of Object.entries(COSMETICS)) {
      const unlocked = unlockedList.includes(key);
      const card = document.createElement("div");
      card.className = `sowie-cosmetic-card${selected === key ? " is-selected" : ""}`;
      card.innerHTML = `<strong>${item.icon} ${item.label}</strong><div>${unlocked ? "Odblokowane" : "🔒 Zablokowane"}</div>`;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = selected === key ? "Wybrane" : "Wybierz";
      button.disabled = !unlocked || selected === key;
      button.addEventListener("click", () => selectCosmetic(key));
      card.appendChild(button);
      grid.appendChild(card);
    }
    modal.querySelector("[data-close]")?.addEventListener("click", closeModal);
  }

  function renderSettings() {
    const backdrop = document.querySelector(".sowie-modal-backdrop");
    const modal = document.querySelector(".sowie-modal");
    if (!modal || backdrop?.dataset.tab !== "settings") return;
    modal.innerHTML = modalShell("Ustawienia", `<div data-settings></div><div class="sowie-cloud-tools"><p class="sowie-cloud-state">Zapis postępu: <strong data-cloud-status></strong></p><button type="button" data-lock-device>Wyloguj to urządzenie</button></div>`);
    const holder = modal.querySelector("[data-settings]");
    for (const [key, label] of [["music", "Muzyka"], ["sfx", "Efekty dźwiękowe"], ["quips", "Komentarze sowy"], ["reducedEffects", "Ograniczone efekty"]]) {
      const row = document.createElement("div");
      row.className = "sowie-setting-row";
      row.innerHTML = `<strong>${label}</strong>`;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = profile().settings[key] ? "Włączone" : "Wyłączone";
      button.setAttribute("aria-pressed", String(Boolean(profile().settings[key])));
      button.addEventListener("click", () => toggleSetting(key));
      row.appendChild(button);
      holder.appendChild(row);
    }
    renderCloudStatus();
    modal.querySelector("[data-lock-device]")?.addEventListener("click", () => {
      toast("Wylogowuję to urządzenie…");
      cloud.lock();
    });
    modal.querySelector("[data-close]")?.addEventListener("click", closeModal);
  }

  function renderCloudStatus() {
    const node = document.querySelector(".sowie-modal [data-cloud-status]");
    if (!node) return;
    const status = cloud.status();
    node.textContent =
      cloud.mode?.() === "memory" && !cloud.offlineReason() ? "tryb testowy (pamięć)" : CLOUD_STATUS_LABELS[status] || status;
  }

  function renderMissions() {
    const backdrop = document.querySelector(".sowie-modal-backdrop");
    const modal = document.querySelector(".sowie-modal");
    if (!modal || backdrop?.dataset.tab !== "missions") return;
    modal.innerHTML = modalShell("Misje", `<div data-missions></div>`);
    const holder = modal.querySelector("[data-missions]");
    for (const [key, mission] of Object.entries(profile().missions)) {
      const card = document.createElement("div");
      card.className = "sowie-mission-card";
      const percentage = Math.round((mission.progress / mission.target) * 100);
      card.innerHTML = `<strong>${mission.done ? "✅" : "⭐"} ${MISSION_LABELS[key] || key}</strong><div>${Math.floor(mission.progress)} / ${mission.target} • nagroda: ${COSMETICS[mission.reward]?.label || mission.reward}</div><div class="sowie-progress"><span style="width:${Math.min(100, percentage)}%"></span></div>`;
      holder.appendChild(card);
    }
    modal.querySelector("[data-close]")?.addEventListener("click", closeModal);
  }

  function ensureUi() {
    if (document.querySelector(".sowie-toolbar")) return;
    const toolbar = document.createElement("div");
    toolbar.className = "sowie-toolbar";
    toolbar.setAttribute("aria-label", "Narzędzia SowieGry");
    toolbar.innerHTML = `<button type="button" data-pause aria-label="Pauza">⏸</button><button type="button" data-wardrobe aria-label="Garderoba">🎀</button><button type="button" data-missions aria-label="Misje">⭐</button><button type="button" data-settings aria-label="Ustawienia">⚙</button>`;
    document.body.appendChild(toolbar);

    const stack = document.createElement("div");
    stack.className = "sowie-toast-stack";
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);

    const backdrop = document.createElement("div");
    backdrop.className = "sowie-modal-backdrop";
    backdrop.hidden = true;
    backdrop.innerHTML = `<section class="sowie-modal" role="dialog" aria-modal="true" aria-labelledby="sowieModalTitle"></section>`;
    backdrop.addEventListener("pointerdown", (event) => {
      if (event.target === backdrop) closeModal();
    });
    document.body.appendChild(backdrop);

    const paused = document.createElement("div");
    paused.className = "sowie-paused-badge";
    paused.hidden = true;
    paused.textContent = "Pauza 🦉";
    document.body.appendChild(paused);

    toolbar.querySelector("[data-pause]").addEventListener("click", togglePause);
    toolbar.querySelector("[data-wardrobe]").addEventListener("click", (event) => openModal("wardrobe", event.currentTarget));
    toolbar.querySelector("[data-missions]").addEventListener("click", (event) => openModal("missions", event.currentTarget));
    toolbar.querySelector("[data-settings]").addEventListener("click", (event) => openModal("settings", event.currentTarget));

    if (new URLSearchParams(location.search).get("debug") === "1") {
      debugNode = document.createElement("div");
      debugNode.className = "sowie-debug";
      document.body.appendChild(debugNode);
    }
  }

  function setDebugData(data) {
    if (!debugNode) return;
    debugNode.textContent = typeof data === "string"
      ? data
      : Object.entries(data || {}).map(([key, value]) => `${key}: ${value}`).join("\n");
  }

  function drawCanvasCosmetic(context, x, y, scale = 1, rotation = 0, key = profile().cosmetics.selected) {
    if (!context || key === "none") return;
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.scale(scale, scale);
    if (key === "bow") {
      context.fillStyle = "#ff5f82";
      context.beginPath();
      context.ellipse(-10, 0, 12, 8, -0.35, 0, Math.PI * 2);
      context.ellipse(10, 0, 12, 8, 0.35, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#ffd65a";
      context.beginPath();
      context.arc(0, 0, 5, 0, Math.PI * 2);
      context.fill();
    } else if (key === "glasses") {
      context.strokeStyle = "#26242c";
      context.lineWidth = 3;
      context.beginPath();
      context.arc(-13, 0, 10, 0, Math.PI * 2);
      context.arc(13, 0, 10, 0, Math.PI * 2);
      context.moveTo(-3, 0);
      context.lineTo(3, 0);
      context.stroke();
    } else if (key === "flowerCrown") {
      ["#ff7aa2", "#ffd65a", "#8fd36b", "#b58cff", "#ff9d5c"].forEach((color, index) => {
        context.fillStyle = color;
        context.beginPath();
        context.arc((index - 2) * 9, Math.abs(index - 2) * 2, 6, 0, Math.PI * 2);
        context.fill();
      });
    } else if (key === "gardenerHat") {
      context.fillStyle = "#e5bd64";
      context.beginPath();
      context.ellipse(0, 3, 34, 8, 0, 0, Math.PI * 2);
      context.fill();
      context.fillRect(-16, -14, 32, 17);
      context.fillStyle = "#4faf68";
      context.fillRect(-16, -2, 32, 5);
    } else if (key === "cap") {
      context.fillStyle = "#4d8fd6";
      context.beginPath();
      context.arc(0, 0, 19, Math.PI, Math.PI * 2);
      context.fill();
      context.fillRect(-3, -2, 29, 7);
    } else if (key === "scarf") {
      context.fillStyle = "#ff5f82";
      context.fillRect(-22, -3, 44, 8);
      context.fillRect(10, 2, 9, 25);
    } else if (key === "backpack") {
      context.fillStyle = "#6d4e9b";
      if (context.roundRect) {
        context.beginPath();
        context.roundRect(-12, -10, 24, 31, 7);
        context.fill();
      } else context.fillRect(-12, -10, 24, 31);
    }
    context.restore();
  }

  function applyProfile() {
    document.documentElement.classList.toggle("sowie-reduced-effects", Boolean(profile().settings.reducedEffects));
    profileChanged();
  }

  applyProfile();
  cloud.ready.then(() => {
    applyProfile();
    if (gameAdapter && profile().settings.music) startMusic(gameAdapter.musicTheme?.() || "default");
    else if (!profile().settings.music) stopMusic();
  });
  cloud.onProfileReload(applyProfile);
  cloud.onStatus(renderCloudStatus);
  window.addEventListener("pointerdown", resumeAudio, { once: true, passive: true });
  window.addEventListener("keydown", resumeAudio, { once: true });
  // Zapis przy przejściu w tło obsługuje SowieCloud (visibilitychange → flush).
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && profile().settings.music && gameAdapter) startMusic(gameAdapter.musicTheme?.() || "default");
  });
  window.addEventListener("keydown", (event) => {
    const backdrop = document.querySelector(".sowie-modal-backdrop");
    if (!backdrop || backdrop.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = focusableElements(backdrop);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.SowieCore = {
    COSMETICS,
    getProfile,
    settings,
    selectedCosmetic,
    registerGame,
    isPlaying,
    progressMission,
    recordStat,
    unlockCosmetic,
    selectCosmetic,
    play,
    startMusic,
    stopMusic,
    toast,
    maybeQuip,
    setDebugData,
    drawCanvasCosmetic,
    openModal,
    closeModal,
    emit: platform.emit,
    on: platform.on,
  };
})();