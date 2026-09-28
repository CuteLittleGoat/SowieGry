// Okno „🏆 Rekordy”: rekordy osobiste z SowieCloud (Analiza 1, rozdział 8).
// Gry zręcznościowe: najlepsze wyniki, top 10 na poziom trudności, ostatnie gry, rekordy wyzwania dnia.
// Gry idle: podsumowanie postępu (profil.records).
(() => {
  "use strict";

  const cloud = window.SowieCloud;
  const platform = window.SowiePlatform;
  const gameId = cloud?.gameId?.();
  const game = platform?.GAME_REGISTRY.find((entry) => entry.id === gameId);
  if (!cloud || !game) return;

  const DIFFICULTIES = [
    ["chill", "Chill"],
    ["arcade", "Arcade"],
    ["chaos", "Chaos"],
  ];
  const DIFFICULTY_LABELS = Object.fromEntries(DIFFICULTIES);
  const IDLE_SUMMARY = {
    ogrody: [
      ["lifetimeLeaves", "Liście w całej grze"],
      ["prestiges", "Wielkie Przesadzania"],
      ["zone", "Strefa"],
    ],
    szklarnia: [
      ["lifetimeLeaves", "Liście w całej grze"],
      ["rooms", "Pomieszczenia"],
      ["hybrids", "Odkryte hybrydy"],
    ],
  };

  let modal = null;
  let previousFocus = null;
  let difficulty = "arcade";
  let historyRequest = 0;

  const escapeHtml = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
    );
  const formatNumber = (value) => Math.floor(Number(value) || 0).toLocaleString("pl-PL");
  const formatDate = (ms) =>
    Number.isFinite(Number(ms)) && Number(ms) > 0
      ? new Date(Number(ms)).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })
      : "";

  // Dodatkowa wartość wyniku (dystans / wysokość) w zależności od gry.
  function extra(row) {
    if (Number.isFinite(Number(row.distance)) && gameId === "runner") return ` · ${formatNumber(row.distance)} m`;
    if (Number.isFinite(Number(row.height))) return ` · ${formatNumber(row.height)} m`;
    return "";
  }

  function currentDifficulty() {
    if (gameId === "runner" && typeof RUNNER_LEVEL_IDS !== "undefined" && typeof level !== "undefined") {
      return RUNNER_LEVEL_IDS[level] || "arcade";
    }
    if (typeof state !== "undefined" && DIFFICULTY_LABELS[state?.difficultyKey]) return state.difficultyKey;
    return DIFFICULTY_LABELS[cloud.game(gameId).difficulty] ? cloud.game(gameId).difficulty : "arcade";
  }

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("section");
    modal.className = "sowie-modal-backdrop sowie-records-backdrop";
    modal.hidden = true;
    modal.innerHTML = `
      <article class="sowie-modal-card sowie-records-modal" role="dialog" aria-modal="true" aria-labelledby="recordsTitle">
        <h2 id="recordsTitle">🏆 Rekordy — ${escapeHtml(game.name)}</h2>
        <div data-records-content></div>
        <div class="sowie-modal-actions"><button type="button" class="sowie-feature-button" data-records-close>Zamknij</button></div>
      </article>`;
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-records-close]")) close();
      const tab = event.target.closest("[data-records-difficulty]");
      if (tab) {
        difficulty = tab.dataset.recordsDifficulty;
        render();
        modal.querySelector(`[data-records-difficulty="${difficulty}"]`)?.focus();
      }
    });
    modal.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    });
    document.body.appendChild(modal);
    return modal;
  }

  function arcadeView() {
    const best = cloud.records(gameId, difficulty);
    const all = cloud.records(gameId);
    const doc = cloud.game(gameId);
    const top = doc.top10?.[difficulty] || [];
    const metricLabel = gameId === "runner" ? "Dystans" : gameId === "jumper" ? "Wysokość" : null;
    const metricValue = gameId === "runner" ? best.bestDistance : best.bestHeight;
    const tabs = DIFFICULTIES.map(
      ([key, label]) =>
        `<button type="button" class="sowie-feature-button" data-records-difficulty="${key}" aria-pressed="${key === difficulty}">${label}</button>`,
    ).join("");
    const topRows = top.length
      ? `<ol class="sowie-records-list" data-records-top>${top
          .map(
            (row) =>
              `<li><strong>${formatNumber(row.score)} pkt</strong>${extra(row)} <span>${formatDate(row.at)}</span></li>`,
          )
          .join("")}</ol>`
      : `<p data-records-top>Brak rozgrywek na tym poziomie. Zagraj, żeby ustanowić rekord!</p>`;
    const dailyEntries = Object.entries(doc.dailyBest || {})
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 7);
    const unit = platform.GAME_REGISTRY.find((entry) => entry.id === gameId)?.dailyMetric === "score" ? " pkt" : " m";
    const daily = dailyEntries.length
      ? `<ul class="sowie-records-list" data-records-daily>${dailyEntries
          .map(([day, value]) => `<li><strong>${formatNumber(value)}${unit}</strong> <span>${escapeHtml(day)}</span></li>`)
          .join("")}</ul>`
      : `<p data-records-daily>Jeszcze bez wyzwań dnia (przycisk ✨ w grze).</p>`;
    return `
      <div class="sowie-records-tabs" role="group" aria-label="Poziom trudności">${tabs}</div>
      <div class="sowie-academy-grid sowie-records-summary">
        <div class="sowie-academy-stat"><span>Najlepszy wynik</span><strong data-records-best>${formatNumber(best.bestScore)}</strong></div>
        ${metricLabel ? `<div class="sowie-academy-stat"><span>${metricLabel}</span><strong>${formatNumber(metricValue)} m</strong></div>` : ""}
        <div class="sowie-academy-stat"><span>Rozgrywki (wszystkie poziomy)</span><strong>${formatNumber(all.runs)}</strong></div>
      </div>
      <h3>Top 10 — ${DIFFICULTY_LABELS[difficulty]}</h3>
      ${topRows}
      <h3>Ostatnie gry</h3>
      <div data-records-history><p>Wczytuję…</p></div>
      <h3>Wyzwanie dnia</h3>
      ${daily}`;
  }

  function idleView() {
    const summary = cloud.records(gameId);
    const rows = (IDLE_SUMMARY[gameId] || [])
      .map(([key, label]) => {
        const value = summary[key];
        const shown = typeof value === "number" ? formatNumber(value) : escapeHtml(value ?? "—");
        return `<div class="sowie-academy-stat"><span>${label}</span><strong>${shown}</strong></div>`;
      })
      .join("");
    return `<p>Postęp tej gry zapisuje się w chmurze i jest taki sam na każdym urządzeniu.</p>
      <div class="sowie-academy-grid sowie-records-summary">${rows}</div>`;
  }

  async function renderHistory() {
    const holder = modal?.querySelector("[data-records-history]");
    if (!holder) return;
    const request = (historyRequest += 1);
    try {
      const rows = await cloud.history(gameId, 10);
      if (request !== historyRequest || !modal || modal.hidden) return;
      holder.innerHTML = rows.length
        ? `<ol class="sowie-records-list">${rows
            .map(
              (row) =>
                `<li><strong>${formatNumber(row.score)} pkt</strong>${extra(row)} <span>${escapeHtml(
                  DIFFICULTY_LABELS[row.difficulty] || row.difficulty || "",
                )}${row.daily ? " · wyzwanie dnia" : ""} · ${formatDate(row.at)}</span></li>`,
            )
            .join("")}</ol>`
        : "<p>Brak zapisanych rozgrywek.</p>";
    } catch (_error) {
      if (request === historyRequest) holder.innerHTML = "<p>Nie udało się wczytać ostatnich gier.</p>";
    }
  }

  function render() {
    if (!modal) return;
    const content = modal.querySelector("[data-records-content]");
    if (!cloud.isReady()) {
      content.innerHTML = "<p>Wczytuję rekordy…</p>";
      cloud.ready.then(() => !modal.hidden && render());
      return;
    }
    if (game.kind === "idle") {
      content.innerHTML = idleView();
      return;
    }
    content.innerHTML = arcadeView();
    renderHistory();
  }

  function open(trigger = document.activeElement) {
    const node = ensureModal();
    previousFocus = trigger instanceof HTMLElement ? trigger : null;
    difficulty = currentDifficulty();
    node.hidden = false;
    render();
    // Bez przewijania karty do przycisku na dole — na telefonie widać od razu tytuł i poziomy.
    node.querySelector("[data-records-close]").focus({ preventScroll: true });
  }

  function close() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    previousFocus?.focus?.();
    previousFocus = null;
  }

  function attachButton() {
    if (document.querySelector("[data-records-fab]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sowie-tool-button";
    button.dataset.recordsFab = "true";
    button.textContent = "🏆";
    button.title = "Rekordy";
    button.setAttribute("aria-label", "Otwórz rekordy");
    button.addEventListener("click", () => open(button));
    (window.SowieGameGuides?.getDock?.() || document.body).appendChild(button);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attachButton, { once: true });
  else attachButton();

  window.SowieRecords = Object.freeze({ open, close });
})();
