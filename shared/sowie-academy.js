(() => {
  "use strict";

  const KEY = "sowieGryAcademy";
  const VERSION = 2;
  const MISSION_POOL = Object.freeze([
    { id: "runner-distance", game: "runner", metric: "runnerDistance", type: "max", target: 500, label: "Przebiegnij 500 m w SowaRunner" },
    { id: "runner-score", game: "runner", metric: "runnerScore", type: "max", target: 1200, label: "Zdobądź 1200 pkt w SowaRunner" },
    { id: "jumper-height", game: "jumper", metric: "jumperHeight", type: "max", target: 120, label: "Wznieś się na 120 m w SowaJumper" },
    { id: "jumper-streak", game: "jumper", metric: "jumperStreak", type: "max", target: 5, label: "Zrób serię 5 precyzyjnych lądowań" },
    { id: "sowa3-score", game: "sowa3", metric: "sowa3Score", type: "max", target: 900, label: "Zdobądź 900 pkt w Sowa3" },
    { id: "sowa3-combo", game: "sowa3", metric: "sowa3Combo", type: "max", target: 6, label: "Osiągnij combo 6 w Sowa3" },
    { id: "ogrody-clicks", game: "ogrody", metric: "ogrodyClicks", type: "delta", target: 30, label: "Zbierz liście ręcznie 30 razy" },
    { id: "ogrody-buys", game: "ogrody", metric: "ogrodyBuys", type: "delta", target: 8, label: "Kup 8 roślin lub ulepszeń w Ogrodach" },
    { id: "ogrody-watering", game: "ogrody", metric: "ogrodyWatering", type: "delta", target: 3, label: "Podlej ogród 3 razy" },
    { id: "szklarnia-rooms", game: "szklarnia", metric: "szklarniaRooms", type: "max", target: 4, label: "Posiadaj 4 pomieszczenia w Szklarni" },
    { id: "szklarnia-goats", game: "szklarnia", metric: "szklarniaGoats", type: "delta", target: 2, label: "Przegoń 2 kozy w Szklarni" },
    { id: "szklarnia-hybrid", game: "szklarnia", metric: "szklarniaHybrids", type: "max", target: 1, label: "Odkryj hybrydę w Szklarni" },
  ]);

  const listeners = new Set();
  let modal = null;
  let previousFocus = null;

  function dayKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }

  function weekKey(date = new Date()) {
    const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = copy.getUTCDay() || 7;
    copy.setUTCDate(copy.getUTCDate() - day + 1);
    return copy.toISOString().slice(0, 10);
  }

  function hash(value) {
    let result = 2166136261;
    for (const character of String(value)) {
      result ^= character.charCodeAt(0);
      result = Math.imul(result, 16777619);
    }
    return result >>> 0;
  }

  function defaultState() {
    return {
      version: VERSION,
      xp: 0,
      feathers: 0,
      metrics: {},
      daily: null,
      weekly: null,
      awards: {},
      updatedAt: Date.now(),
    };
  }

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!raw || typeof raw !== "object") return defaultState();
      return {
        ...defaultState(),
        ...raw,
        version: VERSION,
        metrics: { ...(raw.metrics || {}) },
        awards: { ...(raw.awards || {}) },
      };
    } catch (_error) {
      return defaultState();
    }
  }

  let academy = load();

  function save() {
    academy.version = VERSION;
    academy.updatedAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(academy));
    const data = snapshot();
    for (const listener of listeners) listener(data);
    window.dispatchEvent(new CustomEvent("sowie:academy-changed", { detail: data }));
  }

  function levelInfo(xp = academy.xp) {
    let level = 1;
    let remaining = Math.max(0, xp);
    let needed = 100;
    while (remaining >= needed) {
      remaining -= needed;
      level += 1;
      needed = 100 + (level - 1) * 35;
    }
    return { level, current: remaining, needed };
  }

  function createDaily() {
    const day = dayKey();
    const seed = hash(day);
    const pool = [...MISSION_POOL];
    const selected = [];
    const games = new Set();
    let cursor = seed;
    while (selected.length < 3 && pool.length) {
      cursor = Math.imul(cursor ^ (cursor >>> 15), 2246822519) >>> 0;
      const index = cursor % pool.length;
      const candidate = pool.splice(index, 1)[0];
      if (games.has(candidate.game) && pool.some((entry) => !games.has(entry.game))) continue;
      games.add(candidate.game);
      selected.push({
        ...candidate,
        key: `${day}:${candidate.id}`,
        baseline: candidate.type === "delta" ? Number(academy.metrics[candidate.metric] || 0) : 0,
        complete: false,
        rewarded: false,
      });
    }
    return { day, metrics: {}, missions: selected };
  }

  function createWeekly() {
    return {
      week: weekKey(),
      games: [],
      target: 3,
      complete: false,
      rewarded: false,
    };
  }

  function ensurePeriods() {
    let changed = false;
    if (!academy.daily || academy.daily.day !== dayKey()) {
      academy.daily = createDaily();
      changed = true;
    } else if (!academy.daily.metrics || typeof academy.daily.metrics !== "object") {
      academy.daily.metrics = {};
      changed = true;
    }
    if (!academy.weekly || academy.weekly.week !== weekKey()) {
      academy.weekly = createWeekly();
      changed = true;
    }
    return changed;
  }

  function missionProgress(mission) {
    if (mission.type === "max") return Math.max(0, Number(academy.daily?.metrics?.[mission.metric] || 0));
    const value = Number(academy.metrics[mission.metric] || 0);
    return Math.max(0, value - Number(mission.baseline || 0));
  }

  function notify(title, detail, reward = "") {
    window.SowieNotifications?.toast?.({ title, detail, reward, kind: "mission" });
  }

  function grant(id, xp, feathers, message = "Nagroda Akademii") {
    if (academy.awards[id]) return false;
    academy.awards[id] = Date.now();
    academy.xp += Math.max(0, Number(xp) || 0);
    academy.feathers += Math.max(0, Number(feathers) || 0);
    notify(message, "Cel ukończony!", `+${xp} XP · +${feathers} piórek`);
    return true;
  }

  function evaluate() {
    ensurePeriods();
    let changed = false;
    for (const mission of academy.daily.missions) {
      const complete = missionProgress(mission) >= mission.target;
      if (complete !== mission.complete) {
        mission.complete = complete;
        changed = true;
      }
      if (complete && !mission.rewarded) {
        mission.rewarded = true;
        changed = grant(`daily:${mission.key}`, 50, 5, "Misja dzienna") || changed;
      }
    }
    const weeklyComplete = academy.weekly.games.length >= academy.weekly.target;
    if (weeklyComplete !== academy.weekly.complete) {
      academy.weekly.complete = weeklyComplete;
      changed = true;
    }
    if (weeklyComplete && !academy.weekly.rewarded) {
      academy.weekly.rewarded = true;
      changed = grant(`weekly:${academy.weekly.week}`, 140, 15, "Misja tygodniowa") || changed;
    }
    return changed;
  }

  function record(gameId, metric, value = 1, mode = "max") {
    let changed = ensurePeriods();
    const numeric = Number(value) || 0;
    const previous = Number(academy.metrics[metric] || 0);
    let next = previous;
    if (mode === "add") next = previous + numeric;
    else if (mode === "set") next = numeric;
    else next = Math.max(previous, numeric);
    if (next !== previous) {
      academy.metrics[metric] = next;
      changed = true;
    }

    const dailyMetrics = academy.daily.metrics;
    const dailyPrevious = Number(dailyMetrics[metric] || 0);
    let dailyNext = dailyPrevious;
    if (mode === "add") dailyNext = dailyPrevious + numeric;
    else if (mode === "set") dailyNext = numeric;
    else dailyNext = Math.max(dailyPrevious, numeric);
    if (dailyNext !== dailyPrevious) {
      dailyMetrics[metric] = dailyNext;
      changed = true;
    }

    if (gameId && !academy.weekly.games.includes(gameId)) {
      academy.weekly.games.push(gameId);
      changed = true;
    }
    changed = evaluate() || changed;
    if (changed) save();
    return snapshot();
  }

  function award(id, xp = 25, feathers = 3, message = "Nagroda dodatkowa") {
    const changed = ensurePeriods() || grant(id, xp, feathers, message);
    if (changed) save();
    return Boolean(academy.awards[id]);
  }

  function snapshot() {
    ensurePeriods();
    const info = levelInfo();
    return JSON.parse(JSON.stringify({ ...academy, level: info.level, levelXp: info.current, nextLevelXp: info.needed }));
  }

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("section");
    modal.className = "sowie-modal-backdrop";
    modal.hidden = true;
    modal.innerHTML = `
      <article class="sowie-modal-card" role="dialog" aria-modal="true" aria-labelledby="academyTitle">
        <h2 id="academyTitle">🎓 Sowia Akademia</h2>
        <div data-academy-content></div>
        <div class="sowie-modal-actions"><button type="button" data-academy-close>Zamknij</button></div>
      </article>`;
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-academy-close]")) close();
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

  function render() {
    if (!modal) return;
    const changed = evaluate();
    if (changed) save();
    const data = snapshot();
    const info = levelInfo();
    const content = modal.querySelector("[data-academy-content]");
    const missions = data.daily.missions.map((mission) => {
      const progress = Math.min(mission.target, missionProgress(mission));
      const percent = Math.min(100, progress / mission.target * 100);
      return `<article class="sowie-mission-card" data-complete="${mission.complete}">
        <strong>${mission.complete ? "✅" : "🪶"} ${mission.label}</strong>
        <div>${Math.floor(progress)} / ${mission.target}</div>
        <div class="sowie-progress"><span style="width:${percent}%"></span></div>
      </article>`;
    }).join("");
    const weeklyPercent = Math.min(100, data.weekly.games.length / data.weekly.target * 100);
    content.innerHTML = `
      <p>Zadania wspólne zachęcają do odwiedzania różnych gier. Nagrody są przyznawane automatycznie.</p>
      <div class="sowie-academy-grid">
        <div class="sowie-academy-stat"><span>Poziom</span><strong>${info.level}</strong></div>
        <div class="sowie-academy-stat"><span>Piórka</span><strong>${data.feathers}</strong></div>
        <div class="sowie-academy-stat"><span>XP</span><strong>${info.current}/${info.needed}</strong><div class="sowie-progress"><span style="width:${Math.min(100, info.current / info.needed * 100)}%"></span></div></div>
      </div>
      <h3>Misje dzienne</h3>
      <div class="sowie-mission-list">${missions}</div>
      <h3>Misja tygodniowa</h3>
      <article class="sowie-mission-card" data-complete="${data.weekly.complete}">
        <strong>${data.weekly.complete ? "✅" : "🗺️"} Zagraj w ${data.weekly.target} różne gry</strong>
        <div>${data.weekly.games.length} / ${data.weekly.target}</div>
        <div class="sowie-progress"><span style="width:${weeklyPercent}%"></span></div>
      </article>`;
  }

  function open(trigger = document.activeElement) {
    const node = ensureModal();
    previousFocus = trigger instanceof HTMLElement ? trigger : null;
    render();
    node.hidden = false;
    node.querySelector("[data-academy-close]").focus();
  }

  function close() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    previousFocus?.focus?.();
    previousFocus = null;
  }

  function attachButton() {
    if (document.getElementById("academyButton") || document.querySelector("[data-academy-fab]")) return;
    const onMenu = Boolean(document.querySelector("[data-game-cards]"));
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = onMenu ? "🎓 Sowia Akademia" : "🎓";
    button.title = "Sowia Akademia";
    button.setAttribute("aria-label", "Otwórz Sowią Akademię");
    if (onMenu) {
      button.id = "academyButton";
      button.className = "sowie-academy-button";
      let actions = document.querySelector(".sowie-header-actions");
      const wardrobe = document.getElementById("cosmeticsButton");
      if (!actions && wardrobe?.parentElement) {
        actions = document.createElement("div");
        actions.className = "sowie-header-actions";
        wardrobe.parentElement.insertBefore(actions, wardrobe);
        actions.appendChild(wardrobe);
      }
      (actions || document.querySelector("header") || document.body).appendChild(button);
    } else {
      button.className = "sowie-tool-button";
      button.dataset.academyFab = "true";
      (window.SowieGameGuides?.getDock?.() || document.body).appendChild(button);
    }
    button.addEventListener("click", () => open(button));
  }

  const initialized = ensurePeriods() || evaluate();
  if (initialized || !localStorage.getItem(KEY)) save();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attachButton, { once: true });
  else attachButton();

  window.SowieAcademy = Object.freeze({
    record,
    award,
    snapshot,
    open,
    close,
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
})();
