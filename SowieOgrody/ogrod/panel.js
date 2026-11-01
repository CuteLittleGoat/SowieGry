// Sowie Ogrody — dolny panel (telefon) / prawa kolumna (komputer): 4 zakładki — Rośliny (zakup ×1 / ×10 / max),
// Ulepszenia, Prestiż (Wielkie Przesadzanie i drzewko), Kolekcja (kontrakty, rozdziały, tło ogrodu, statystyki).
// DOM zakładki budowany od nowa tylko przy zmianie układu (zakładka, rozdział, kupione ulepszenie, poziom drzewka,
// odebrany kontrakt, tło); liczby, ceny i dostępność przycisków odświeżane w miejscu przy każdym odświeżeniu.
// Uwaga O4 (2026-11-01): przebudowa listy przy każdym zakupie — z „Sową zakupową” 2 razy na sekundę — przerywała na
// iPhonie przewijanie i „ostatnich roślin w ogóle nie dało się zobaczyć”.
import { CHAPTERS, PLANTS, PRESTIGE_TREE, UPGRADES } from "./config.js";
import {
  formatNumber,
  hasUpgrade,
  maxAffordable,
  milestoneMultiplier,
  plantCost,
  plantStage,
  prestigeCost,
  prestigeLevel,
  prestigeSeeds,
  production,
} from "./economy.js";
import { dailyContracts } from "./daily.js";
import { chapterIndex, chapterOpen } from "./garden.js";

export const TABS = Object.freeze([
  { id: "rosliny", label: "Rośliny" },
  { id: "ulepszenia", label: "Ulepszenia" },
  { id: "prestiz", label: "Prestiż" },
  { id: "kolekcja", label: "Kolekcja" },
]);

const MILESTONE_STEPS = [10, 25, 50, 100];
const escape = (text) => String(text).replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);

// Zmiana tekstu i atrybutów tylko wtedy, gdy wartość jest inna (bez zbędnego przeliczania układu co odświeżenie).
function setText(node, text) {
  if (node && node.textContent !== text) node.textContent = text;
}
function setDisabled(node, disabled) {
  if (node && node.disabled !== disabled) node.disabled = disabled;
}

// ---------- Rośliny ----------

/** Opis rośliny: produkcja sztuki, kamień milowy i ile brakuje do następnego. */
function plantInfo(state, plant, prod) {
  const owned = state.plants[plant.id] || 0;
  const next = MILESTONE_STEPS.find((step) => owned < step);
  const each = owned ? prod.perPlant[plant.id] / owned : plant.prod * prod.global;
  const boost = milestoneMultiplier(owned);
  return `${formatNumber(each)} liści/s za sztukę${boost > 1 ? ` · kamień ×${boost}` : ""}${next ? ` · do ${next}: ${next - owned}` : ""}`;
}

// Karta rośliny: nazwa z liczbą sztuk i opis w dwóch krótkich wierszach, pod nimi trzy przyciski z cenami
// (Kup — 1 sztuka, ×10, max — ile Cię stać). Liczby wypełnia `refreshPlants`.
function plantsHtml(state) {
  return PLANTS.filter((plant) => chapterOpen(state, plant.chapter))
    .map(
      (plant) => `<article class="ogrod-card is-plant" data-plant="${plant.id}">
        <span class="ogrod-swatch" style="--kolor: ${plant.color}" aria-hidden="true"></span>
        <div class="ogrod-card-text">
          <h3>${escape(plant.name)} <span class="ogrod-owned" data-owned></span></h3>
          <p data-info></p>
        </div>
        <div class="ogrod-buy">
          <button type="button" class="sowie-ui-button is-primary" data-buy="${plant.id}" data-amount="1">
            <span>Kup</span><span data-cost></span>
          </button>
          <button type="button" class="sowie-ui-button is-stacked" data-buy="${plant.id}" data-amount="10">
            <span>×10</span><span data-cost></span>
          </button>
          <button type="button" class="sowie-ui-button is-stacked" data-buy="${plant.id}" data-amount="max">
            <span data-max-label>max</span><span data-cost></span>
          </button>
        </div>
      </article>`,
    )
    .join("");
}

function refreshPlants(content, state, now) {
  const prod = production(state, now);
  for (const card of content.querySelectorAll("[data-plant]")) {
    const plant = PLANTS.find((item) => item.id === card.dataset.plant);
    if (!plant) continue;
    const owned = state.plants[plant.id] || 0;
    setText(card.querySelector("[data-owned]"), `×${owned}`);
    setText(card.querySelector("[data-info]"), plantInfo(state, plant, prod));
    for (const button of card.querySelectorAll("[data-buy]")) {
      const amount = button.dataset.amount;
      let cost;
      let affordable;
      if (amount === "max") {
        const best = maxAffordable(plant, owned, state.leaves);
        cost = best.amount > 0 ? best.cost : plantCost(plant, owned, 1);
        affordable = best.amount > 0;
        setText(button.querySelector("[data-max-label]"), best.amount > 1 ? `max ×${best.amount}` : "max");
      } else {
        cost = plantCost(plant, owned, Number(amount));
        affordable = cost <= state.leaves;
      }
      setText(button.querySelector("[data-cost]"), formatNumber(cost));
      setDisabled(button, !affordable);
    }
  }
}

// ---------- Ulepszenia ----------

function upgradesHtml(state) {
  const list = UPGRADES.filter((upgrade) => chapterOpen(state, upgrade.chapter));
  const open = list.filter((upgrade) => !hasUpgrade(state, upgrade.id)).sort((a, b) => a.cost - b.cost);
  const bought = list.filter((upgrade) => hasUpgrade(state, upgrade.id));
  const card = (
    upgrade,
    done,
  ) => `<article class="ogrod-card is-row${done ? " is-done" : ""}" data-upgrade-card="${upgrade.id}">
      <div class="ogrod-card-text"><h3>${escape(upgrade.name)}</h3><p>${escape(upgrade.text)}</p></div>
      ${
        done
          ? `<span class="ogrod-done">Kupione</span>`
          : `<button type="button" class="sowie-ui-button is-primary" data-upgrade="${upgrade.id}"><span>Kup</span><span>${formatNumber(upgrade.cost)}</span></button>`
      }
    </article>`;
  const next = CHAPTERS[chapterIndex(state) + 1];
  return `${open.map((upgrade) => card(upgrade, false)).join("") || `<p class="ogrod-empty">Wszystkie ulepszenia tego rozdziału kupione.</p>`}
    ${next ? `<p class="ogrod-note">Kolejne ulepszenia po ukończeniu rozdziału „${escape(CHAPTERS[chapterIndex(state)].name)}”.</p>` : ""}
    ${bought.length ? `<h3 class="ogrod-subtitle">Kupione</h3>${bought.map((upgrade) => card(upgrade, true)).join("")}` : ""}`;
}

function refreshUpgrades(content, state) {
  for (const button of content.querySelectorAll("[data-upgrade]")) {
    const upgrade = UPGRADES.find((item) => item.id === button.dataset.upgrade);
    setDisabled(button, !upgrade || upgrade.cost > state.leaves);
  }
}

// ---------- Prestiż ----------

const prestigeLabel = (seeds) =>
  seeds ? `Wielkie Przesadzanie (+${formatNumber(seeds)} nasion)` : "Wielkie Przesadzanie — po Szklarni i 10 mld liści";

function prestigeHtml(state) {
  const branches = [...new Set(PRESTIGE_TREE.map((node) => node.branch))];
  return `<section class="ogrod-prestige">
      <p>Wielkie Przesadzanie zaczyna ogród od nowa (rośliny, ulepszenia i liście), ale daje <strong>nasiona</strong> na
      stałe ulepszenia. Rozdziały i drzewko zostają.</p>
      <p class="ogrod-seeds">Nasiona: <strong data-seeds></strong><span data-seeds-now></span></p>
      <button type="button" class="sowie-ui-button is-primary is-big" data-prestige></button>
    </section>
    ${branches
      .map(
        (branch) =>
          `<h3 class="ogrod-subtitle">${escape(branch)}</h3>${PRESTIGE_TREE.filter((node) => node.branch === branch)
            .map((node) => {
              const level = prestigeLevel(state, node.id);
              const locked = node.req && prestigeLevel(state, node.req) <= 0;
              const maxed = level >= node.max;
              const before = locked ? PRESTIGE_TREE.find((item) => item.id === node.req) : null;
              return `<article class="ogrod-card is-row${maxed ? " is-done" : ""}" data-node="${node.id}">
              <div class="ogrod-card-text"><h3>${escape(node.name)} <span class="ogrod-owned">${level}/${node.max}</span></h3><p>${escape(node.text)}${before ? ` Najpierw: ${escape(before.name)}.` : ""}</p></div>
              ${
                maxed
                  ? `<span class="ogrod-done">Maks.</span>`
                  : `<button type="button" class="sowie-ui-button" data-node-buy="${node.id}" ${locked ? "disabled" : ""}>${locked ? "🔒" : `${prestigeCost(state, node)} 🌰`}</button>`
              }
            </article>`;
            })
            .join("")}`,
      )
      .join("")}`;
}

function refreshPrestige(content, state) {
  const seeds = prestigeSeeds(state);
  setText(content.querySelector("[data-seeds]"), formatNumber(state.seeds));
  setText(content.querySelector("[data-seeds-now]"), seeds ? ` · teraz +${formatNumber(seeds)}` : "");
  const button = content.querySelector("[data-prestige]");
  setText(button, prestigeLabel(seeds));
  setDisabled(button, !seeds);
  for (const node of content.querySelectorAll("[data-node-buy]")) {
    const entry = PRESTIGE_TREE.find((item) => item.id === node.dataset.nodeBuy);
    const locked = entry.req && prestigeLevel(state, entry.req) <= 0;
    setDisabled(node, Boolean(locked) || prestigeCost(state, entry) > state.seeds);
  }
}

// ---------- Kolekcja ----------

// Kontrakty dnia (E7d3): postęp i „Odbierz” (XP i piórka Sowiej Akademii).
function contractsHtml(state, now) {
  return `<section class="ogrod-contracts" aria-label="Kontrakty dnia">
    <h3 class="ogrod-subtitle">Kontrakty dnia</h3>
    ${dailyContracts(state, now)
      .map(
        (item) => `<article class="ogrod-card is-row${item.claimed ? " is-done" : ""}" data-contract="${item.id}">
        <div class="ogrod-card-text"><h3>${escape(item.label)}</h3><p><span data-contract-progress></span> · +${item.xp} XP · +${item.feathers} piórka</p></div>
        ${
          item.claimed
            ? `<span class="ogrod-done">Odebrano ✓</span>`
            : `<button type="button" class="sowie-ui-button is-primary" data-claim="${item.id}">Odbierz</button>`
        }
      </article>`,
      )
      .join("")}
  </section>`;
}

// Tło ogrodu (uwaga O7): „Automatyczne” (bieżący rozdział) albo tło dowolnego ukończonego rozdziału.
function scenesHtml(state) {
  const chosen = state.scene && state.scene !== "auto" ? state.scene : "auto";
  const done = CHAPTERS.filter((chapter) => state.chapters?.[chapter.id]);
  const chip = (id, label) =>
    `<button type="button" class="ogrod-chip" data-scene="${id}" aria-pressed="${chosen === id}">${escape(label)}</button>`;
  return `<h3 class="ogrod-subtitle">Tło ogrodu</h3>
    <div class="ogrod-scenes" role="group" aria-label="Tło ogrodu">${chip("auto", "Automatyczne")}${done
      .map((chapter) => chip(chapter.id, chapter.name))
      .join("")}</div>
    <p class="ogrod-note">${
      done.length
        ? "Automatyczne — tło bieżącego rozdziału. Możesz też wybrać tło każdego ukończonego rozdziału."
        : "Ukończ pierwszy rozdział, a jego tło będzie można wybrać na stałe."
    }</p>`;
}

const STATS = Object.freeze([
  ["lifetimeLeaves", "Liście z całej gry", (state) => formatNumber(state.lifetimeLeaves)],
  ["runLeaves", "Liście w tym cyklu", (state) => formatNumber(state.runLeaves)],
  ["bestLps", "Najlepsza produkcja", (state) => `${formatNumber(state.stats.bestLps)}/s`],
  ["lps", "Produkcja teraz", (state, now) => `${formatNumber(production(state, now).lps)}/s`],
  ["taps", "Stuknięcia", (state) => formatNumber(state.stats.taps)],
  ["waterings", "Podlewania", (state) => formatNumber(state.stats.waterings)],
  ["buys", "Kupione rośliny", (state) => formatNumber(state.stats.buys)],
  ["prestiges", "Wielkie Przesadzania", (state) => formatNumber(state.stats.prestiges)],
  ["offlineLeaves", "Liście z offline", (state) => formatNumber(state.stats.offlineLeaves)],
]);

function collectionHtml(state, now) {
  const index = chapterIndex(state);
  const kinds = PLANTS.filter((plant) => (state.plants[plant.id] || 0) > 0);
  return `${contractsHtml(state, now)}
    <h3 class="ogrod-subtitle">Rozdziały</h3>
    <ol class="ogrod-chapters">${CHAPTERS.map(
      (chapter, position) =>
        `<li class="${state.chapters[chapter.id] ? "is-done" : position === index ? "is-current" : ""}">${escape(chapter.name)}</li>`,
    ).join("")}</ol>
    ${scenesHtml(state)}
    <h3 class="ogrod-subtitle">Gatunki w ogrodzie (${kinds.length}/${PLANTS.length})</h3>
    <p class="ogrod-note" data-kinds></p>
    <h3 class="ogrod-subtitle">Statystyki</h3>
    <dl class="ogrod-stats">${STATS.map(([id, label]) => `<div><dt>${label}</dt><dd data-stat="${id}"></dd></div>`).join("")}</dl>
    <button type="button" class="sowie-ui-button ogrod-tutorial-replay" data-tutorial-replay>Powtórz samouczek</button>`;
}

function refreshCollection(content, state, now) {
  for (const item of dailyContracts(state, now)) {
    const card = content.querySelector(`[data-contract="${item.id}"]`);
    setText(card?.querySelector("[data-contract-progress]"), `${item.progress}/${item.target}`);
    setDisabled(card?.querySelector("[data-claim]"), !item.done);
  }
  const kinds = PLANTS.filter((plant) => (state.plants[plant.id] || 0) > 0);
  setText(
    content.querySelector("[data-kinds]"),
    kinds.map((plant) => `${plant.name} — etap ${plantStage(state.plants[plant.id])}/5`).join(" · ") ||
      "Jeszcze pusto — kup pierwszą Monsterę.",
  );
  for (const [id, , value] of STATS) setText(content.querySelector(`[data-stat="${id}"]`), value(state, now));
}

/**
 * createPanel({ root, onBuy, onUpgrade, onPrestige, onNode, onClaim, onTutorial, onScene }) → { setTab(id), tab(),
 * render(state, now), refresh() } (`refresh` — przebudowa zawartości przy następnym `render`).
 * `root` — element z `[data-tabs]` (przyciski zakładek) i `[data-panel]` (zawartość).
 */
export function createPanel({
  root,
  onBuy,
  onUpgrade,
  onPrestige,
  onNode,
  onClaim = () => {},
  onTutorial = () => {},
  onScene = () => {},
}) {
  const tabsNode = root.querySelector("[data-tabs]");
  const content = root.querySelector("[data-panel]");
  let current = "rosliny";
  let key = "";
  tabsNode.innerHTML = TABS.map(
    (tab) =>
      `<button type="button" role="tab" class="ogrod-tab" data-tab="${tab.id}" aria-selected="${tab.id === current}">${tab.label}</button>`,
  ).join("");
  tabsNode.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab]");
    if (button) api.setTab(button.dataset.tab);
  });
  content.addEventListener("click", (event) => {
    const buy = event.target.closest("[data-buy]");
    if (buy && !buy.disabled) {
      const amount = buy.dataset.amount === "max" ? "max" : Number(buy.dataset.amount);
      onBuy(buy.dataset.buy, amount);
      return;
    }
    const upgrade = event.target.closest("[data-upgrade]");
    if (upgrade && !upgrade.disabled) return onUpgrade(upgrade.dataset.upgrade);
    if (event.target.closest("[data-prestige]") && !event.target.closest("[data-prestige]").disabled)
      return onPrestige();
    const node = event.target.closest("[data-node-buy]");
    if (node && !node.disabled) return onNode(node.dataset.nodeBuy);
    const claim = event.target.closest("[data-claim]");
    if (claim && !claim.disabled) return onClaim(claim.dataset.claim);
    const scene = event.target.closest("[data-scene]");
    if (scene) return onScene(scene.dataset.scene);
    if (event.target.closest("[data-tutorial-replay]")) onTutorial();
  });

  // Klucz układu zakładki: zmienia się tylko, gdy trzeba zbudować zawartość od nowa (nie przy zakupie rośliny).
  function contentKey(state) {
    const base = [current, chapterIndex(state)];
    if (current === "ulepszenia") base.push(Object.keys(state.upgrades).length);
    if (current === "prestiz") base.push(JSON.stringify(state.prestige), Math.floor(state.seeds));
    if (current === "kolekcja") {
      base.push(
        JSON.stringify(state.daily?.claimed || {}),
        state.daily?.date || "",
        state.scene || "auto",
        JSON.stringify(state.chapters),
        PLANTS.filter((plant) => (state.plants[plant.id] || 0) > 0).length,
      );
    }
    return base.join("|");
  }

  function refreshContent(state, now) {
    if (current === "rosliny") refreshPlants(content, state, now);
    else if (current === "ulepszenia") refreshUpgrades(content, state);
    else if (current === "prestiz") refreshPrestige(content, state);
    else refreshCollection(content, state, now);
  }

  const api = {
    tab: () => current,
    refresh() {
      key = "";
    },
    setTab(id) {
      if (!TABS.some((tab) => tab.id === id)) return;
      current = id;
      key = "";
      for (const button of tabsNode.querySelectorAll("[data-tab]")) {
        button.setAttribute("aria-selected", String(button.dataset.tab === id));
      }
    },
    render(state, now) {
      const next = contentKey(state);
      if (next !== key) {
        key = next;
        content.innerHTML =
          current === "rosliny"
            ? plantsHtml(state)
            : current === "ulepszenia"
              ? upgradesHtml(state)
              : current === "prestiz"
                ? prestigeHtml(state)
                : collectionHtml(state, now);
      }
      refreshContent(state, now);
    },
  };
  return api;
}
