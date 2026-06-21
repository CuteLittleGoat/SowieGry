(() => {
  "use strict";

  const STORAGE_KEY = "sowieGryProfile";
  const DEFAULT_PROFILE = {
    version: 1,
    unlockedCosmetics: ["none", "bow"],
    selectedCosmetic: "none",
    settings: {
      music: true,
      sfx: true,
      quips: true,
      reducedEffects: false,
    },
    missions: {
      leaves20: { progress: 0, target: 20, done: false, reward: "glasses" },
      extraLife: { progress: 0, target: 1, done: false, reward: "flowerCrown" },
      nearMiss3: { progress: 0, target: 3, done: false, reward: "scarf" },
      chaosFinish: { progress: 0, target: 1, done: false, reward: "gardenerHat" },
      combo4: { progress: 0, target: 1, done: false, reward: "bubbleTrail" },
      runner1000: { progress: 0, target: 1000, done: false, reward: "cap" },
      jumper250: { progress: 0, target: 250, done: false, reward: "backpack" },
    },
    stats: {
      leaves: 0,
      nearMisses: 0,
      extraLives: 0,
      finishes: 0,
      maxCombo: 1,
      runnerDistance: 0,
      jumperHeight: 0,
    },
  };

  const COSMETICS = {
    none: { label: "Bez dodatku", icon: "🦉" },
    bow: { label: "Kokardka", icon: "🎀" },
    glasses: { label: "Okulary", icon: "😎" },
    flowerCrown: { label: "Wianek", icon: "🌸" },
    gardenerHat: { label: "Kapelusz ogrodnika", icon: "👒" },
    cap: { label: "Czapka z daszkiem", icon: "🧢" },
    scarf: { label: "Szalik", icon: "🧣" },
    backpack: { label: "Plecak", icon: "🎒" },
    bubbleTrail: { label: "Ślad bąbelków", icon: "🫧" },
  };

  const MISSION_LABELS = {
    leaves20: "Zbierz 20 liści monster",
    extraLife: "Zdobądź dodatkowe życie",
    nearMiss3: "Wykonaj 3 uniki „O włos!”",
    chaosFinish: "Ukończ etap na poziomie Chaos",
    combo4: "Osiągnij combo ×4",
    runner1000: "Przebiegnij 1000 m w SowaRunner",
    jumper250: "Osiągnij 250 m w SowaJumper",
  };

  const QUIPS = [
    "Hu-hu! Ale lot!",
    "Pracu Pracu? Nie dzisiaj!",
    "Skrzydła w gotowości!",
    "Monstera zauważona!",
    "Basen już blisko!",
  ];

  let profile = loadProfile();
  let gameAdapter = null;
  let audioContext = null;
  let musicTimer = null;
  let musicStep = 0;
  let debugNode = null;
  let lastQuipAt = 0;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeProfile(raw) {
    const result = clone(DEFAULT_PROFILE);
    if (!raw || typeof raw !== "object") return result;
    result.version = 1;
    result.unlockedCosmetics = Array.from(new Set([
      ...DEFAULT_PROFILE.unlockedCosmetics,
      ...(Array.isArray(raw.unlockedCosmetics) ? raw.unlockedCosmetics : []),
    ])).filter((key) => COSMETICS[key]);
    result.selectedCosmetic = COSMETICS[raw.selectedCosmetic] ? raw.selectedCosmetic : "none";
    result.settings = { ...result.settings, ...(raw.settings || {}) };
    result.stats = { ...result.stats, ...(raw.stats || {}) };
    for (const [key, mission] of Object.entries(result.missions)) {
      const saved = raw.missions?.[key];
      if (saved) result.missions[key] = { ...mission, ...saved };
    }
    return result;
  }

  function loadProfile() {
    try {
      return mergeProfile(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
    } catch (_error) {
      return clone(DEFAULT_PROFILE);
    }
  }

  function saveProfile() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  function unlockCosmetic(key, announce = true) {
    if (!COSMETICS[key] || profile.unlockedCosmetics.includes(key)) return false;
    profile.unlockedCosmetics.push(key);
    saveProfile();
    if (announce) toast(`Odblokowano: ${COSMETICS[key].label}!`);
    play("unlock");
    return true;
  }

  function selectCosmetic(key) {
    if (!profile.unlockedCosmetics.includes(key)) return false;
    profile.selectedCosmetic = key;
    saveProfile();
    renderWardrobe();
    toast(`Wybrano: ${COSMETICS[key].label}`);
    return true;
  }

  function progressMission(key, amount = 1) {
    const mission = profile.missions[key];
    if (!mission || mission.done) return false;
    mission.progress = Math.min(mission.target, Number(mission.progress || 0) + amount);
    if (mission.progress >= mission.target) {
      mission.done = true;
      unlockCosmetic(mission.reward, false);
      toast(`Misja ukończona: ${MISSION_LABELS[key]}`);
      toast(`Nagroda: ${COSMETICS[mission.reward]?.label || mission.reward}`);
      play("mission");
    }
    saveProfile();
    renderMissions();
    return mission.done;
  }

  function recordStat(key, value, mode = "add") {
    if (!(key in profile.stats)) profile.stats[key] = 0;
    if (mode === "max") profile.stats[key] = Math.max(Number(profile.stats[key] || 0), value);
    else profile.stats[key] = Number(profile.stats[key] || 0) + value;
    saveProfile();
  }

  function ensureAudio() {
    if (audioContext) return audioContext;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
    return audioContext;
  }

  function resumeAudio() {
    const context = ensureAudio();
    if (context?.state === "suspended") context.resume().catch(() => {});
  }

  function tone(frequency, duration = 0.12, volume = 0.045, type = "sine", delay = 0) {
    if (!profile.settings.sfx) return;
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
    if (!profile.settings.sfx) return;
    resumeAudio();
    const map = {
      leaf: [[660, .08, .035, "sine", 0], [880, .10, .03, "sine", .055]],
      heart: [[520, .11, .04, "triangle", 0], [780, .15, .04, "triangle", .07]],
      jump: [[330, .08, .025, "triangle", 0]],
      hurt: [[150, .18, .05, "sawtooth", 0]],
      near: [[920, .08, .035, "sine", 0]],
      combo: [[620, .08, .03, "triangle", 0], [820, .10, .03, "triangle", .06]],
      goat: [[210, .12, .035, "square", 0], [260, .12, .025, "square", .08]],
      whale: [[180, .22, .04, "sine", 0], [130, .28, .03, "sine", .06]],
      phone: [[740, .08, .03, "square", 0], [620, .08, .03, "square", .11]],
      boar: [[95, .25, .04, "sawtooth", 0]],
      splash: [[280, .16, .035, "sine", 0], [420, .12, .025, "sine", .04]],
      mission: [[520, .10, .04, "triangle", 0], [660, .10, .04, "triangle", .08], [880, .16, .04, "triangle", .16]],
      unlock: [[740, .10, .04, "triangle", 0], [980, .18, .04, "triangle", .08]],
    };
    for (const args of map[name] || map.leaf) tone(...args);
  }

  function startMusic(theme = "default") {
    stopMusic();
    if (!profile.settings.music) return;
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
      if (!profile.settings.music || document.hidden) return;
      const context = ensureAudio();
      if (!context || context.state !== "running") return;
      const frequency = melody[musicStep % melody.length];
      musicStep += 1;
      const previousSfx = profile.settings.sfx;
      profile.settings.sfx = true;
      tone(frequency, 0.19, 0.012, "triangle", 0);
      profile.settings.sfx = previousSfx;
    }, 430);
  }

  function stopMusic() {
    if (musicTimer) window.clearInterval(musicTimer);
    musicTimer = null;
  }

  function toast(text) {
    ensureUi();
    const stack = document.querySelector(".sowie-toast-stack");
    if (!stack) return;
    const node = document.createElement("div");
    node.className = "sowie-toast";
    node.textContent = text;
    stack.appendChild(node);
    window.setTimeout(() => node.remove(), 2850);
  }

  function maybeQuip(text = null) {
    if (!profile.settings.quips) return;
    const now = performance.now();
    if (now - lastQuipAt < 6500) return;
    lastQuipAt = now;
    toast(text || QUIPS[Math.floor(Math.random() * QUIPS.length)]);
  }

  function toggleSetting(key) {
    if (!(key in profile.settings)) return;
    profile.settings[key] = !profile.settings[key];
    saveProfile();
    if (key === "music") {
      if (profile.settings.music) startMusic(gameAdapter?.musicTheme?.() || "default");
      else stopMusic();
    }
    renderSettings();
  }

  function registerGame(adapter) {
    gameAdapter = adapter || null;
    ensureUi();
    if (profile.settings.music) startMusic(adapter?.musicTheme?.() || "default");
  }

  function togglePause() {
    if (!gameAdapter?.getPaused || !gameAdapter?.setPaused) return;
    const next = !gameAdapter.getPaused();
    gameAdapter.setPaused(next);
    const badge = document.querySelector(".sowie-paused-badge");
    if (badge) badge.hidden = !next;
  }

  function openModal(tab = "wardrobe") {
    ensureUi();
    const backdrop = document.querySelector(".sowie-modal-backdrop");
    if (!backdrop) return;
    backdrop.hidden = false;
    backdrop.dataset.tab = tab;
    renderModal(tab);
    if (gameAdapter?.setPaused) gameAdapter.setPaused(true);
    const badge = document.querySelector(".sowie-paused-badge");
    if (badge) badge.hidden = true;
  }

  function closeModal() {
    const backdrop = document.querySelector(".sowie-modal-backdrop");
    if (backdrop) backdrop.hidden = true;
  }

  function renderModal(tab) {
    const modal = document.querySelector(".sowie-modal");
    if (!modal) return;
    if (tab === "settings") renderSettings();
    else if (tab === "missions") renderMissions();
    else renderWardrobe();
  }

  function renderWardrobe() {
    const backdrop = document.querySelector(".sowie-modal-backdrop");
    const modal = document.querySelector(".sowie-modal");
    if (!modal || backdrop?.dataset.tab !== "wardrobe") return;
    modal.innerHTML = `<h2>Garderoba sowy</h2><div class="sowie-modal-grid"></div><div class="sowie-modal-actions"><button data-close>Zamknij</button></div>`;
    const grid = modal.querySelector(".sowie-modal-grid");
    for (const [key, item] of Object.entries(COSMETICS)) {
      const unlocked = profile.unlockedCosmetics.includes(key);
      const card = document.createElement("div");
      card.className = `sowie-cosmetic-card${profile.selectedCosmetic === key ? " is-selected" : ""}`;
      card.innerHTML = `<strong>${item.icon} ${item.label}</strong><div>${unlocked ? "Odblokowane" : "🔒 Zablokowane"}</div>`;
      const button = document.createElement("button");
      button.textContent = profile.selectedCosmetic === key ? "Wybrane" : "Wybierz";
      button.disabled = !unlocked;
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
    modal.innerHTML = `<h2>Ustawienia</h2><div data-settings></div><div class="sowie-modal-actions"><button data-close>Zamknij</button></div>`;
    const holder = modal.querySelector("[data-settings]");
    const rows = [
      ["music", "Muzyka"],
      ["sfx", "Efekty dźwiękowe"],
      ["quips", "Komentarze sowy"],
      ["reducedEffects", "Ograniczone efekty"],
    ];
    for (const [key, label] of rows) {
      const row = document.createElement("div");
      row.className = "sowie-setting-row";
      row.innerHTML = `<strong>${label}</strong>`;
      const button = document.createElement("button");
      button.textContent = profile.settings[key] ? "Włączone" : "Wyłączone";
      button.addEventListener("click", () => toggleSetting(key));
      row.appendChild(button);
      holder.appendChild(row);
    }
    modal.querySelector("[data-close]")?.addEventListener("click", closeModal);
  }

  function renderMissions() {
    const backdrop = document.querySelector(".sowie-modal-backdrop");
    const modal = document.querySelector(".sowie-modal");
    if (!modal || backdrop?.dataset.tab !== "missions") return;
    modal.innerHTML = `<h2>Misje</h2><div data-missions></div><div class="sowie-modal-actions"><button data-close>Zamknij</button></div>`;
    const holder = modal.querySelector("[data-missions]");
    for (const [key, mission] of Object.entries(profile.missions)) {
      const card = document.createElement("div");
      card.className = "sowie-mission-card";
      const pct = Math.round((mission.progress / mission.target) * 100);
      card.innerHTML = `<strong>${mission.done ? "✅" : "⭐"} ${MISSION_LABELS[key]}</strong><div>${Math.floor(mission.progress)} / ${mission.target} • nagroda: ${COSMETICS[mission.reward]?.label || mission.reward}</div><div class="sowie-progress"><span style="width:${Math.min(100, pct)}%"></span></div>`;
      holder.appendChild(card);
    }
    modal.querySelector("[data-close]")?.addEventListener("click", closeModal);
  }

  function ensureUi() {
    if (document.querySelector(".sowie-toolbar")) return;
    const toolbar = document.createElement("div");
    toolbar.className = "sowie-toolbar";
    toolbar.innerHTML = `
      <button type="button" data-pause aria-label="Pauza">⏸</button>
      <button type="button" data-wardrobe aria-label="Garderoba">🎀</button>
      <button type="button" data-missions aria-label="Misje">⭐</button>
      <button type="button" data-settings aria-label="Ustawienia">⚙</button>
    `;
    document.body.appendChild(toolbar);

    const stack = document.createElement("div");
    stack.className = "sowie-toast-stack";
    document.body.appendChild(stack);

    const backdrop = document.createElement("div");
    backdrop.className = "sowie-modal-backdrop";
    backdrop.hidden = true;
    backdrop.innerHTML = `<section class="sowie-modal" role="dialog" aria-modal="true"></section>`;
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
    toolbar.querySelector("[data-wardrobe]").addEventListener("click", () => openModal("wardrobe"));
    toolbar.querySelector("[data-missions]").addEventListener("click", () => openModal("missions"));
    toolbar.querySelector("[data-settings]").addEventListener("click", () => openModal("settings"));

    if (new URLSearchParams(location.search).get("debug") === "1") {
      debugNode = document.createElement("div");
      debugNode.className = "sowie-debug";
      debugNode.textContent = "debug";
      document.body.appendChild(debugNode);
    }
  }

  function setDebugData(data) {
    if (!debugNode) return;
    debugNode.textContent = typeof data === "string"
      ? data
      : Object.entries(data || {}).map(([key, value]) => `${key}: ${value}`).join("\n");
  }

  function drawCanvasCosmetic(ctx, x, y, scale = 1, rotation = 0, key = profile.selectedCosmetic) {
    if (!ctx || key === "none") return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    if (key === "bow") {
      ctx.fillStyle = "#ff5f82";
      ctx.beginPath();
      ctx.ellipse(-10, 0, 12, 8, -0.35, 0, Math.PI * 2);
      ctx.ellipse(10, 0, 12, 8, 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffd65a";
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (key === "glasses") {
      ctx.strokeStyle = "#26242c";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-13, 0, 10, 0, Math.PI * 2);
      ctx.arc(13, 0, 10, 0, Math.PI * 2);
      ctx.moveTo(-3, 0);
      ctx.lineTo(3, 0);
      ctx.stroke();
    } else if (key === "flowerCrown") {
      ["#ff7aa2", "#ffd65a", "#8fd36b", "#b58cff", "#ff9d5c"].forEach((color, index) => {
        const px = (index - 2) * 9;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, Math.abs(index - 2) * 2, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (key === "gardenerHat") {
      ctx.fillStyle = "#e5bd64";
      ctx.beginPath();
      ctx.ellipse(0, 3, 34, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-16, -14, 32, 17);
      ctx.fillStyle = "#4faf68";
      ctx.fillRect(-16, -2, 32, 5);
    } else if (key === "cap") {
      ctx.fillStyle = "#4d8fd6";
      ctx.beginPath();
      ctx.arc(0, 0, 19, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-3, -2, 29, 7);
    } else if (key === "scarf") {
      ctx.fillStyle = "#ff5f82";
      ctx.fillRect(-22, -3, 44, 8);
      ctx.fillRect(10, 2, 9, 25);
    } else if (key === "backpack") {
      ctx.fillStyle = "#6d4e9b";
      ctx.beginPath();
      ctx.roundRect?.(-12, -10, 24, 31, 7);
      if (ctx.roundRect) ctx.fill();
      else ctx.fillRect(-12, -10, 24, 31);
    }

    ctx.restore();
  }

  function selectedCosmetic() {
    return profile.selectedCosmetic;
  }

  function settings() {
    return profile.settings;
  }

  function getProfile() {
    return profile;
  }

  window.addEventListener("pointerdown", resumeAudio, { once: true, passive: true });
  window.addEventListener("keydown", resumeAudio, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    if (profile.settings.music && gameAdapter) startMusic(gameAdapter.musicTheme?.() || "default");
  });

  window.SowieCore = {
    COSMETICS,
    getProfile,
    settings,
    selectedCosmetic,
    registerGame,
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
  };
})();
