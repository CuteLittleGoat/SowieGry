// Rozszerzenia dawnej Sowiej Szklarni: cele laboratorium i album cech.
// Stan dnia (gry/{id}.daily) i album cech (gry/szklarnia.traitAlbum) zapisuje SowieCloud.
// Gry idle udostępniają swój stan przez window.SowieIdleGame.snapshot().
(() => {
  "use strict";

  const gameId = window.SowieGameGuides?.detectGameId?.() || detectFromPath();
  if (!gameId) return;

  const academy = window.SowieAcademy;
  const cloud = window.SowieCloud;
  const day = new Date().toISOString().slice(0, 10);
  let featureModal = null;
  let featureRenderer = null;
  let previousFocus = null;
  let hud = null;

  function detectFromPath() {
    const path = location.pathname.toLowerCase();
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
    hud.textContent = text;
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
    // SowaRunner, Sowa3, SowaJumper i dawne Sowie Ogrody zastąpiły przebudowane gry (moduły ES, własne zadania,
    // combo i kontrakty dnia) — bez tego skryptu.
    if (gameId === "szklarnia") initializeGreenhouse();
  }
})();
