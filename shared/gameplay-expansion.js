(() => {
  "use strict";

  const gameId = window.SowieGameGuides?.detectGameId?.() || detectFromPath();
  if (!gameId) return;

  const academy = window.SowieAcademy;
  const day = new Date().toISOString().slice(0, 10);
  const isDaily = new URLSearchParams(location.search).get("daily") === "1";
  let featureModal = null;
  let featureRenderer = null;
  let previousFocus = null;
  let hud = null;

  function detectFromPath() {
    const path = location.pathname.toLowerCase();
    if (path.includes("sowarunner")) return "runner";
    if (path.includes("sowajumper")) return "jumper";
    if (path.includes("sowa3")) return "sowa3";
    if (path.includes("sowieogrody")) return "ogrody";
    if (path.includes("sowiaszklarnia")) return "szklarnia";
    return null;
  }

  function safeJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null") || fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getDock() {
    if (window.SowieGameGuides?.getDock) return window.SowieGameGuides.getDock();
    let dock = document.querySelector(".sowie-tool-dock");
    if (!dock) {
      dock = document.createElement("div");
      dock.className = "sowie-tool-dock";
      document.body.appendChild(dock);
    }
    return dock;
  }

  function createHud() {
    hud = document.createElement("div");
    hud.className = "sowie-expansion-hud";
    hud.setAttribute("role", "status");
    hud.setAttribute("aria-live", "polite");
    document.body.appendChild(hud);
    return hud;
  }

  function setHud(text) {
    if (!hud) createHud();
    hud.innerHTML = `${text}${isDaily ? '<span class="sowie-daily-badge">WYZWANIE DNIA</span>' : ""}`;
  }

  function startDaily() {
    const url = new URL(location.href);
    url.searchParams.set("seed", `daily-${day}-${gameId}`);
    url.searchParams.set("daily", "1");
    location.href = url.href;
  }

  function updateDailyBest(metric, value) {
    if (!isDaily) return;
    const key = `sowieDailyBest:${day}:${gameId}:${metric}`;
    const previous = Number(localStorage.getItem(key) || 0);
    if (value > previous) localStorage.setItem(key, String(Math.floor(value)));
  }

  function ensureFeatureModal() {
    if (featureModal) return featureModal;
    featureModal = document.createElement("section");
    featureModal.className = "sowie-modal-backdrop";
    featureModal.hidden = true;
    featureModal.innerHTML = `
      <article class="sowie-modal-card" role="dialog" aria-modal="true" aria-labelledby="featureTitle">
        <h2 id="featureTitle">✨ Rozszerzenia gry</h2>
        <div data-feature-content></div>
        <div class="sowie-modal-actions"><button type="button" data-feature-close>Zamknij</button></div>
      </article>`;
    featureModal.addEventListener("click", (event) => {
      if (event.target === featureModal || event.target.closest("[data-feature-close]")) closeFeature();
      const claim = event.target.closest("[data-feature-claim]");
      if (claim) claimFeature(claim.dataset.featureClaim);
      if (event.target.closest("[data-start-daily]")) startDaily();
    });
    featureModal.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFeature();
      }
    });
    document.body.appendChild(featureModal);
    return featureModal;
  }

  function openFeature(trigger) {
    const modal = ensureFeatureModal();
    previousFocus = trigger instanceof HTMLElement ? trigger : null;
    renderFeature();
    modal.hidden = false;
    modal.querySelector("[data-feature-close]").focus();
  }

  function closeFeature() {
    if (!featureModal || featureModal.hidden) return;
    featureModal.hidden = true;
    previousFocus?.focus?.();
    previousFocus = null;
  }

  function renderFeature() {
    if (!featureModal || !featureRenderer) return;
    featureModal.querySelector("[data-feature-content]").innerHTML = featureRenderer();
  }

  function attachFeatureButton(label = "Nowości") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sowie-tool-button";
    button.textContent = "✨";
    button.title = label;
    button.setAttribute("aria-label", label);
    button.addEventListener("click", () => openFeature(button));
    getDock().appendChild(button);
  }

  function dailyPanel(description) {
    const active = isDaily
      ? `<p><strong>Dzisiejsza trasa jest aktywna.</strong> Losowość jest stała dla daty ${day}, więc każda próba ma taki sam układ.</p>`
      : `<button class="sowie-feature-button" type="button" data-start-daily>Uruchom wyzwanie dnia</button>`;
    return `<article class="sowie-feature-card"><h3>Wyzwanie dnia</h3><p>${description}</p>${active}</article>`;
  }

  function claimFeature(id) {
    const stateKey = `sowieExpansion:${gameId}:${day}`;
    const data = safeJson(stateKey, { claimed: {} });
    data.claimed ||= {};
    if (data.claimed[id]) return;
    const objective = currentObjectives().find((entry) => entry.id === id);
    if (!objective || objective.progress < objective.target) return;
    const awardId = `feature:${gameId}:${day}:${id}`;
    if (academy?.award?.(awardId, objective.xp || 30, objective.feathers || 4, objective.rewardLabel || "Cel dodatkowy")) {
      data.claimed[id] = true;
      saveJson(stateKey, data);
      renderFeature();
    }
  }

  let objectivesProvider = () => [];
  function currentObjectives() {
    return objectivesProvider();
  }

  function objectiveCards(objectives) {
    const state = safeJson(`sowieExpansion:${gameId}:${day}`, { claimed: {} });
    return objectives.map((objective) => {
      const progress = Math.min(objective.target, Math.max(0, objective.progress));
      const complete = progress >= objective.target;
      const claimed = Boolean(state.claimed?.[objective.id]);
      return `<article class="sowie-feature-card">
        <strong>${claimed ? "✅" : complete ? "🎁" : "🪶"} ${objective.label}</strong>
        <div>${Math.floor(progress)} / ${objective.target}</div>
        <div class="sowie-progress"><span style="width:${Math.min(100, progress / objective.target * 100)}%"></span></div>
        <button class="sowie-feature-button" type="button" data-feature-claim="${objective.id}" ${complete && !claimed ? "" : "disabled"}>${claimed ? "Odebrano" : "Odbierz nagrodę"}</button>
      </article>`;
    }).join("");
  }

  function initializeRunner() {
    attachFeatureButton("Serie i wyzwanie dnia SowaRunner");
    let previousMode = null;
    let previousLives = null;
    let previousScore = 0;
    let chain = 0;
    let bestChain = 0;

    featureRenderer = () => `${dailyPanel("Przebiegnij jak najdalej na identycznej trasie dnia i porównuj własne próby.")}
      <article class="sowie-feature-card"><h3>Seria liści</h3><p>Zbieranie kolejnych liści bez utraty życia zwiększa serię. Każdy następny liść daje rosnącą premię punktową.</p><strong>Najlepsza seria tej sesji: ${bestChain}</strong></article>`;

    window.setInterval(() => {
      try {
        if (typeof mode === "undefined" || typeof score === "undefined" || typeof lives === "undefined") return;
        const running = typeof SCREEN !== "undefined" && mode === SCREEN.RUN;
        const over = typeof SCREEN !== "undefined" && mode === SCREEN.OVER;
        if (previousLives !== null && lives < previousLives) chain = 0;
        if (running) {
          const delta = score - previousScore;
          if (delta >= 24 && delta <= 120) {
            chain += 1;
            bestChain = Math.max(bestChain, chain);
            const bonus = Math.min(60, chain * 4);
            score += bonus;
            academy?.record?.("runner", "runnerLeafChain", bestChain, "max");
          }
          previousScore = score;
          setHud(`🍃 Seria liści: ${chain} · premia następnego: +${Math.min(60, (chain + 1) * 4)}`);
        } else {
          previousScore = score;
        }
        if (over && previousMode !== mode) {
          academy?.record?.("runner", "runnerDistance", Number(distM || 0), "max");
          academy?.record?.("runner", "runnerScore", Number(score || 0), "max");
          updateDailyBest("distance", Number(distM || 0));
        }
        previousLives = lives;
        previousMode = mode;
      } catch (_error) {
        // Gra może jeszcze inicjalizować globalny stan.
      }
    }, 140);
  }

  function initializeJumper() {
    attachFeatureButton("Precyzja i wyzwanie dnia SowaJumper");
    let previousScene = null;
    let previousVy = 0;
    let previousLives = null;
    let streak = 0;
    let bestStreak = 0;

    featureRenderer = () => `${dailyPanel("Wspinaj się po codziennie ustalonym układzie platform. Rekord dnia jest zapisywany oddzielnie.")}
      <article class="sowie-feature-card"><h3>Precyzyjne lądowania</h3><p>Lądowanie w środkowych 44% platformy zwiększa serię i dodaje punkty. Nieprecyzyjne lądowanie lub utrata życia zerują serię.</p><strong>Najlepsza seria: ${bestStreak}</strong></article>`;

    window.setInterval(() => {
      try {
        if (typeof state === "undefined" || typeof owl === "undefined" || typeof platforms === "undefined") return;
        if (previousLives !== null && state.lives < previousLives) streak = 0;
        if (state.scene === "playing" && previousVy > 1 && owl.vy < -1) {
          const feet = owl.y + owl.radius;
          let nearest = null;
          let distance = Infinity;
          for (const platform of platforms) {
            const gap = Math.abs(feet - platform.y);
            if (gap < distance) {
              nearest = platform;
              distance = gap;
            }
          }
          if (nearest && distance < 30) {
            const center = nearest.x + nearest.width / 2;
            const precise = Math.abs(owl.x - center) <= nearest.width * 0.22;
            if (precise) {
              streak += 1;
              bestStreak = Math.max(bestStreak, streak);
              state.score += streak * 4;
              academy?.record?.("jumper", "jumperStreak", bestStreak, "max");
            } else streak = 0;
          }
        }
        if (state.scene === "playing") setHud(`🎯 Precyzja: ${streak} · premia lądowania: +${(streak + 1) * 4}`);
        if (state.scene === "gameover" && previousScene !== state.scene) {
          academy?.record?.("jumper", "jumperHeight", Number(state.lastHeight || state.heightMeters || 0), "max");
          academy?.record?.("jumper", "jumperScore", Number(state.lastScore || state.score || 0), "max");
          updateDailyBest("height", Number(state.lastHeight || state.heightMeters || 0));
        }
        previousVy = owl.vy;
        previousLives = state.lives;
        previousScene = state.scene;
      } catch (_error) {
        // Stan pojawia się po uruchomieniu głównego skryptu gry.
      }
    }, 100);
  }

  function initializeSowa3() {
    attachFeatureButton("Combo i wyzwanie dnia Sowa3");
    let previousMode = null;
    let previousScore = 0;
    let previousLives = null;
    let combo = 0;
    let bestCombo = 0;

    featureRenderer = () => `${dailyPanel("Przejedź codzienną, deterministyczną trasę i uzyskaj najwyższy wynik bez zmiany układu losowego.")}
      <article class="sowie-feature-card"><h3>Combo liści</h3><p>Każdy kolejny liść bez kolizji zwiększa combo. Co trzeci poziom combo podnosi premię za następne liście.</p><strong>Najlepsze combo: ${bestCombo}</strong></article>`;

    window.setInterval(() => {
      try {
        if (typeof state === "undefined" || !state || typeof state.score !== "number") return;
        if (previousLives !== null && state.lives < previousLives) combo = 0;
        if (state.mode === "run") {
          const delta = state.score - previousScore;
          if (delta >= 44 && delta <= 85) {
            combo += 1;
            bestCombo = Math.max(bestCombo, combo);
            const bonus = Math.floor(combo / 3) * 12;
            state.score += bonus;
            academy?.record?.("sowa3", "sowa3Combo", bestCombo, "max");
          }
          previousScore = state.score;
          setHud(`⚡ Combo: ${combo} · mnożnik: x${(1 + Math.floor(combo / 3) * 0.25).toFixed(2)}`);
        } else previousScore = state.score;
        if (state.mode === "finish" && previousMode !== "finish") academy?.record?.("sowa3", "sowa3Finishes", 1, "add");
        if (state.mode === "over" && previousMode !== "over") {
          academy?.record?.("sowa3", "sowa3Score", Number(state.score || 0), "max");
          updateDailyBest("score", Number(state.score || 0));
        }
        previousLives = state.lives;
        previousMode = state.mode;
      } catch (_error) {
        // Główna gra może jeszcze przygotowywać stan.
      }
    }, 120);
  }

  function initializeGardens() {
    attachFeatureButton("Kontrakty ogrodnicze");
    const stateKey = `sowieExpansion:ogrody:${day}`;
    let expansion = safeJson(stateKey, null);
    let save = safeJson("sowieOgrodySave", {});
    if (!expansion) {
      expansion = {
        claimed: {},
        baseline: {
          clicks: Number(save.stats?.clicks || 0),
          buys: Number(save.stats?.buys || 0),
          watering: Number(save.stats?.watering || 0),
        },
      };
      saveJson(stateKey, expansion);
    }

    objectivesProvider = () => {
      save = safeJson("sowieOgrodySave", save || {});
      return [
        { id: "clicks", label: "Zbierz liście ręcznie 25 razy", progress: Number(save.stats?.clicks || 0) - expansion.baseline.clicks, target: 25, xp: 30, feathers: 4, rewardLabel: "Kontrakt ogrodniczy" },
        { id: "buys", label: "Kup 6 roślin lub ulepszeń", progress: Number(save.stats?.buys || 0) - expansion.baseline.buys, target: 6, xp: 35, feathers: 4, rewardLabel: "Kontrakt ogrodniczy" },
        { id: "watering", label: "Podlej ogród 2 razy", progress: Number(save.stats?.watering || 0) - expansion.baseline.watering, target: 2, xp: 30, feathers: 4, rewardLabel: "Kontrakt ogrodniczy" },
      ];
    };

    featureRenderer = () => `<p>Codzienne kontrakty dają XP i piórka do Sowiej Akademii. Postęp jest liczony od pierwszego uruchomienia danego dnia.</p><div class="sowie-feature-list">${objectiveCards(currentObjectives())}</div>`;

    window.setInterval(() => {
      save = safeJson("sowieOgrodySave", save || {});
      const plantCount = Object.values(save.plants || {}).reduce((sum, value) => sum + Number(value || 0), 0);
      academy?.record?.("ogrody", "ogrodyLeaves", Number(save.lifetimeLeaves || 0), "max");
      academy?.record?.("ogrody", "ogrodyClicks", Number(save.stats?.clicks || 0), "set");
      academy?.record?.("ogrody", "ogrodyBuys", Number(save.stats?.buys || 0), "set");
      academy?.record?.("ogrody", "ogrodyWatering", Number(save.stats?.watering || 0), "set");
      academy?.record?.("ogrody", "ogrodyPrestiges", Number(save.stats?.prestiges || 0), "set");
      academy?.record?.("ogrody", "ogrodyPlants", plantCount, "max");
      setHud(`📋 Kontrakty: ${currentObjectives().filter((entry) => entry.progress >= entry.target).length}/3 gotowe`);
      if (featureModal && !featureModal.hidden) renderFeature();
    }, 2500);
  }

  function initializeGreenhouse() {
    attachFeatureButton("Album cech i cele laboratorium");
    const stateKey = `sowieExpansion:szklarnia:${day}`;
    const albumKey = "sowieSzklarniaTraitAlbum";
    let save = safeJson("sowiaSzklarniaSave", {});
    let expansion = safeJson(stateKey, null);
    let album = safeJson(albumKey, { traits: [] });
    if (!expansion) {
      expansion = {
        claimed: {},
        baseline: {
          rooms: Number(save.rooms?.length || 0),
          plants: Number(save.plants?.length || 0),
          goats: Number(save.stats?.goatsScared || 0),
        },
      };
      saveJson(stateKey, expansion);
    }

    function traitName(key) {
      const [growth, smell] = key.split("|");
      const growthName = { fast: "szybki wzrost", slow: "cierpliwy wzrost", normal: "zwykły wzrost" }[growth] || growth;
      const smellName = { boring: "nudny zapach", normal: "zwykły zapach", tasty: "smaczny zapach", irresistible: "nieodparty zapach" }[smell] || smell;
      return `${growthName} · ${smellName}`;
    }

    function refreshTraits() {
      save = safeJson("sowiaSzklarniaSave", save || {});
      const present = new Set((save.plants || []).map((plant) => `${plant.traits?.growth || "normal"}|${plant.traits?.smell || "normal"}`));
      let changed = false;
      for (const trait of present) {
        if (!album.traits.includes(trait)) {
          album.traits.push(trait);
          academy?.award?.(`trait:${trait}`, 10, 1, "Nowa cecha w albumie");
          changed = true;
        }
      }
      if (changed) saveJson(albumKey, album);
    }

    objectivesProvider = () => {
      save = safeJson("sowiaSzklarniaSave", save || {});
      return [
        { id: "rooms", label: "Zbuduj lub rozwiń kolekcję o 1 pomieszczenie", progress: Number(save.rooms?.length || 0) - expansion.baseline.rooms, target: 1, xp: 35, feathers: 4, rewardLabel: "Cel laboratorium" },
        { id: "plants", label: "Zasadź 2 nowe rośliny", progress: Number(save.plants?.length || 0) - expansion.baseline.plants, target: 2, xp: 30, feathers: 4, rewardLabel: "Cel laboratorium" },
        { id: "goats", label: "Przegoń 2 kozy", progress: Number(save.stats?.goatsScared || 0) - expansion.baseline.goats, target: 2, xp: 35, feathers: 4, rewardLabel: "Cel laboratorium" },
      ];
    };

    featureRenderer = () => {
      refreshTraits();
      const chips = album.traits.length
        ? album.traits.map((trait) => `<span class="sowie-trait-chip">${traitName(trait)}</span>`).join("")
        : "<p>Album jest jeszcze pusty. Sadź rośliny, aby odkrywać cechy.</p>";
      return `<p>Cele laboratorium odnawiają się codziennie. Każda nowa kombinacja cech trafia na stałe do albumu i daje małą nagrodę.</p>
        <h3>Dzisiejsze cele</h3><div class="sowie-feature-list">${objectiveCards(currentObjectives())}</div>
        <h3>Album cech (${album.traits.length})</h3><div class="sowie-trait-chips">${chips}</div>`;
    };

    window.setInterval(() => {
      refreshTraits();
      save = safeJson("sowiaSzklarniaSave", save || {});
      academy?.record?.("szklarnia", "szklarniaRooms", Number(save.rooms?.length || 0), "max");
      academy?.record?.("szklarnia", "szklarniaPlants", Number(save.plants?.length || 0), "max");
      academy?.record?.("szklarnia", "szklarniaGoats", Number(save.stats?.goatsScared || 0), "set");
      academy?.record?.("szklarnia", "szklarniaHybrids", Number(save.stats?.hybrids || 0), "max");
      setHud(`🧬 Album cech: ${album.traits.length} · cele: ${currentObjectives().filter((entry) => entry.progress >= entry.target).length}/3`);
      if (featureModal && !featureModal.hidden) renderFeature();
    }, 2500);
  }

  academy?.record?.(gameId, `${gameId}Visits`, 1, "add");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else initialize();

  function initialize() {
    if (gameId === "runner") initializeRunner();
    else if (gameId === "jumper") initializeJumper();
    else if (gameId === "sowa3") initializeSowa3();
    else if (gameId === "ogrody") initializeGardens();
    else if (gameId === "szklarnia") initializeGreenhouse();
  }
})();
