// Rozszerzenia gier: serie, precyzja, combo, wyzwanie dnia, kontrakty i album cech.
// Stan dnia (gry/{id}.daily) i album cech (gry/szklarnia.traitAlbum) zapisuje SowieCloud.
// Gry idle udostępniają swój stan przez window.SowieIdleGame.snapshot().
(() => {
  "use strict";

  const gameId = window.SowieGameGuides?.detectGameId?.() || detectFromPath();
  if (!gameId) return;

  const academy = window.SowieAcademy;
  const cloud = window.SowieCloud;
  const day = new Date().toISOString().slice(0, 10);
  const isDaily = new URLSearchParams(location.search).get("daily") === "1";
  let featureModal = null;
  let featureRenderer = null;
  let previousFocus = null;
  let hud = null;

  function detectFromPath() {
    const path = location.pathname.toLowerCase();
    if (path.includes("sowajumper")) return "jumper";
    if (path.includes("sowieogrody")) return "ogrody";
    if (path.includes("sowiaszklarnia")) return "szklarnia";
    return null;
  }

  // Stan gry idle (tylko odczyt) — od gry, a nie z pamięci przeglądarki.
  function idleSnapshot() {
    return window.SowieIdleGame?.snapshot?.() || {};
  }

  // Kontrakty dnia: { date, baseline, claimed } w dokumencie gry; z poprzedniego dnia są zastępowane.
  function dailyState() {
    const daily = cloud?.game(gameId)?.daily;
    return daily && daily.date === day ? daily : { date: day, baseline: null, claimed: {} };
  }

  function saveDailyState(daily) {
    cloud?.updateGame(gameId, (doc) => {
      doc.daily = JSON.parse(JSON.stringify(daily));
    });
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

  // Rekord wyzwania dnia zapisuje gra przez SowieCloud.submitRun() (gry/{id}.dailyBest).

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
    const data = dailyState();
    data.claimed ||= {};
    if (data.claimed[id]) return;
    const objective = currentObjectives().find((entry) => entry.id === id);
    if (!objective || objective.progress < objective.target) return;
    const awardId = `feature:${gameId}:${day}:${id}`;
    if (academy?.award?.(awardId, objective.xp || 30, objective.feathers || 4, objective.rewardLabel || "Cel dodatkowy")) {
      data.claimed[id] = true;
      saveDailyState(data);
      renderFeature();
    }
  }

  let objectivesProvider = () => [];
  function currentObjectives() {
    return objectivesProvider();
  }

  function objectiveCards(objectives) {
    const state = dailyState();
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
        }
        previousVy = owl.vy;
        previousLives = state.lives;
        previousScene = state.scene;
      } catch (_error) {
        // Stan pojawia się po uruchomieniu głównego skryptu gry.
      }
    }, 100);
  }

  function initializeGardens() {
    attachFeatureButton("Kontrakty ogrodnicze");
    let expansion = { claimed: {}, baseline: { clicks: 0, buys: 0, watering: 0 } };
    let save = {};
    let started = false;

    // Stan bazowy dnia liczony od pierwszego uruchomienia danego dnia (po wczytaniu stanu gry z chmury).
    window.SowieIdleGame?.ready?.then(() => {
      save = idleSnapshot();
      const daily = dailyState();
      if (!daily.baseline) {
        daily.baseline = {
          clicks: Number(save.stats?.clicks || 0),
          buys: Number(save.stats?.buys || 0),
          watering: Number(save.stats?.watering || 0),
        };
        saveDailyState(daily);
      }
      expansion = daily;
      started = true;
    });

    objectivesProvider = () => {
      save = idleSnapshot();
      return [
        { id: "clicks", label: "Zbierz liście ręcznie 25 razy", progress: Number(save.stats?.clicks || 0) - expansion.baseline.clicks, target: 25, xp: 30, feathers: 4, rewardLabel: "Kontrakt ogrodniczy" },
        { id: "buys", label: "Kup 6 roślin lub ulepszeń", progress: Number(save.stats?.buys || 0) - expansion.baseline.buys, target: 6, xp: 35, feathers: 4, rewardLabel: "Kontrakt ogrodniczy" },
        { id: "watering", label: "Podlej ogród 2 razy", progress: Number(save.stats?.watering || 0) - expansion.baseline.watering, target: 2, xp: 30, feathers: 4, rewardLabel: "Kontrakt ogrodniczy" },
      ];
    };

    featureRenderer = () => `<p>Codzienne kontrakty dają XP i piórka do Sowiej Akademii. Postęp jest liczony od pierwszego uruchomienia danego dnia.</p><div class="sowie-feature-list">${objectiveCards(currentObjectives())}</div>`;

    window.setInterval(() => {
      if (!started) return;
      save = idleSnapshot();
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
    let save = {};
    let expansion = { claimed: {}, baseline: { rooms: 0, plants: 0, goats: 0 } };
    let album = { traits: [] };
    let started = false;

    window.SowieIdleGame?.ready?.then(() => {
      save = idleSnapshot();
      const daily = dailyState();
      if (!daily.baseline) {
        daily.baseline = {
          rooms: Number(save.rooms?.length || 0),
          plants: Number(save.plants?.length || 0),
          goats: Number(save.stats?.goatsScared || 0),
        };
        saveDailyState(daily);
      }
      expansion = daily;
      const stored = cloud?.game("szklarnia")?.traitAlbum;
      album = { traits: Array.isArray(stored) ? [...stored] : [] };
      started = true;
    });

    function traitName(key) {
      const [growth, smell] = key.split("|");
      const growthName = { fast: "szybki wzrost", slow: "cierpliwy wzrost", normal: "zwykły wzrost" }[growth] || growth;
      const smellName = { boring: "nudny zapach", normal: "zwykły zapach", tasty: "smaczny zapach", irresistible: "nieodparty zapach" }[smell] || smell;
      return `${growthName} · ${smellName}`;
    }

    function refreshTraits() {
      if (!started) return;
      save = idleSnapshot();
      const present = new Set((save.plants || []).map((plant) => `${plant.traits?.growth || "normal"}|${plant.traits?.smell || "normal"}`));
      let changed = false;
      for (const trait of present) {
        if (!album.traits.includes(trait)) {
          album.traits.push(trait);
          academy?.award?.(`trait:${trait}`, 10, 1, "Nowa cecha w albumie");
          changed = true;
        }
      }
      if (changed) {
        const traits = [...album.traits];
        cloud?.updateGame("szklarnia", (doc) => {
          doc.traitAlbum = traits;
        });
      }
    }

    objectivesProvider = () => {
      save = idleSnapshot();
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
      if (!started) return;
      refreshTraits();
      save = idleSnapshot();
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
    // SowaRunner zastąpiła Sowia Ucieczka, a Sowa3 — Sowie Tory (moduły ES, własne zadania) — bez tego skryptu.
    if (gameId === "jumper") initializeJumper();
    else if (gameId === "ogrody") initializeGardens();
    else if (gameId === "szklarnia") initializeGreenhouse();
  }
})();
