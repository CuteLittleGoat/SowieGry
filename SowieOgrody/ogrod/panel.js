// Sowie Ogrody — dolny panel (telefon) / prawa kolumna (komputer): 4 zakładki — Rośliny (zakup ×1 / ×10 / max),
// Ulepszenia, Prestiż (Wielkie Przesadzanie i drzewko), Kolekcja (rozdziały, statystyki). DOM budowany od nowa
// tylko przy zmianie zawartości (klucz z liczb), a przyciski reagują na stan liści co odświeżenie.
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

function plantsHtml(state, now) {
  const prod = production(state, now);
  return PLANTS.filter((plant) => chapterOpen(state, plant.chapter))
    .map((plant) => {
      const owned = state.plants[plant.id] || 0;
      const next = MILESTONE_STEPS.find((step) => owned < step);
      const each = owned ? prod.perPlant[plant.id] / owned : plant.prod * prod.global;
      return `<article class="ogrod-card" data-plant="${plant.id}">
        <span class="ogrod-swatch" style="--kolor: ${plant.color}" aria-hidden="true"></span>
        <div class="ogrod-card-text">
          <h3>${escape(plant.name)} <span class="ogrod-owned" data-owned>×${owned}</span></h3>
          <p>${formatNumber(each)} liści/s za sztukę${milestoneMultiplier(owned) > 1 ? ` · kamień ×${milestoneMultiplier(owned)}` : ""}${next ? ` · do ${next}: ${next - owned}` : ""}</p>
        </div>
        <div class="ogrod-buy">
          <button type="button" class="sowie-ui-button is-primary" data-buy="${plant.id}" data-amount="1">
            <span>Kup</span><span data-cost="1">${formatNumber(plantCost(plant, owned, 1))}</span>
          </button>
          <button type="button" class="sowie-ui-button" data-buy="${plant.id}" data-amount="10">×10</button>
          <button type="button" class="sowie-ui-button" data-buy="${plant.id}" data-amount="max">max</button>
        </div>
      </article>`;
    })
    .join("");
}

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

function prestigeHtml(state) {
  const seeds = prestigeSeeds(state);
  const branches = [...new Set(PRESTIGE_TREE.map((node) => node.branch))];
  return `<section class="ogrod-prestige">
      <p>Wielkie Przesadzanie zaczyna ogród od nowa (rośliny, ulepszenia i liście), ale daje <strong>nasiona</strong> na
      stałe ulepszenia. Rozdziały i drzewko zostają.</p>
      <p class="ogrod-seeds">Nasiona: <strong data-seeds>${formatNumber(state.seeds)}</strong>${seeds ? ` · teraz +${formatNumber(seeds)}` : ""}</p>
      <button type="button" class="sowie-ui-button is-primary is-big" data-prestige ${seeds ? "" : "disabled"}>
        ${seeds ? `Wielkie Przesadzanie (+${formatNumber(seeds)} nasion)` : "Wielkie Przesadzanie — po Szklarni i 10 mld liści"}
      </button>
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

// Kontrakty dnia (E7d3): postęp i „Odbierz” (XP i piórka Sowiej Akademii).
function contractsHtml(state, now) {
  return `<section class="ogrod-contracts" aria-label="Kontrakty dnia">
    <h3 class="ogrod-subtitle">Kontrakty dnia</h3>
    ${dailyContracts(state, now)
      .map(
        (item) => `<article class="ogrod-card is-row${item.claimed ? " is-done" : ""}" data-contract="${item.id}">
        <div class="ogrod-card-text"><h3>${escape(item.label)}</h3><p><span data-contract-progress>${item.progress}/${item.target}</span> · +${item.xp} XP · +${item.feathers} piórka</p></div>
        ${
          item.claimed
            ? `<span class="ogrod-done">Odebrano ✓</span>`
            : `<button type="button" class="sowie-ui-button is-primary" data-claim="${item.id}" ${item.done ? "" : "disabled"}>Odbierz</button>`
        }
      </article>`,
      )
      .join("")}
  </section>`;
}

function collectionHtml(state, now) {
  const index = chapterIndex(state);
  const stats = state.stats;
  const rows = [
    ["Liście z całej gry", formatNumber(state.lifetimeLeaves)],
    ["Liście w tym cyklu", formatNumber(state.runLeaves)],
    ["Najlepsza produkcja", `${formatNumber(stats.bestLps)}/s`],
    ["Produkcja teraz", `${formatNumber(production(state, now).lps)}/s`],
    ["Stuknięcia", formatNumber(stats.taps)],
    ["Podlewania", formatNumber(stats.waterings)],
    ["Kupione rośliny", formatNumber(stats.buys)],
    ["Wielkie Przesadzania", formatNumber(stats.prestiges)],
    ["Liście z offline", formatNumber(stats.offlineLeaves)],
  ];
  const kinds = PLANTS.filter((plant) => (state.plants[plant.id] || 0) > 0);
  return `${contractsHtml(state, now)}
    <h3 class="ogrod-subtitle">Rozdziały</h3>
    <ol class="ogrod-chapters">${CHAPTERS.map(
      (chapter, position) =>
        `<li class="${state.chapters[chapter.id] ? "is-done" : position === index ? "is-current" : ""}">${escape(chapter.name)}</li>`,
    ).join("")}</ol>
    <h3 class="ogrod-subtitle">Gatunki w ogrodzie (${kinds.length}/${PLANTS.length})</h3>
    <p class="ogrod-note">${kinds.map((plant) => `${escape(plant.name)} — etap ${plantStage(state.plants[plant.id])}/5`).join(" · ") || "Jeszcze pusto — kup pierwszą Monsterę."}</p>
    <h3 class="ogrod-subtitle">Statystyki</h3>
    <dl class="ogrod-stats">${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>
    <p class="ogrod-note">Wersja podglądowa nowej odsłony. Postęp zapisuje się osobno — dawna gra (<a href="./">Sowie Ogrody</a>) zostaje bez zmian.</p>`;
}

/**
 * createPanel({ root, onBuy, onUpgrade, onPrestige, onNode, onClaim }) → { setTab(id), tab(), render(state, now),
 * refresh() } (`refresh` — przebudowa zawartości przy następnym `render`).
 * `root` — element z `[data-tabs]` (przyciski zakładek) i `[data-panel]` (zawartość).
 */
export function createPanel({ root, onBuy, onUpgrade, onPrestige, onNode, onClaim = () => {} }) {
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
    if (claim && !claim.disabled) onClaim(claim.dataset.claim);
  });

  // Klucz zawartości zakładki: zmienia się przy zakupie, nowym rozdziale, przesadzaniu (nie co klatkę).
  function contentKey(state) {
    return [
      current,
      chapterIndex(state),
      JSON.stringify(state.plants),
      Object.keys(state.upgrades).length,
      JSON.stringify(state.prestige),
      Math.floor(state.seeds),
      prestigeSeeds(state),
      current === "kolekcja" ? Math.floor(Date.now() / 2000) : 0,
      current === "kolekcja" ? JSON.stringify(state.daily?.claimed || {}) : "",
    ].join("|");
  }

  // Dostępność przycisków (co odświeżenie): stać / nie stać.
  function refreshButtons(state) {
    for (const button of content.querySelectorAll("[data-buy]")) {
      const plant = PLANTS.find((item) => item.id === button.dataset.buy);
      const owned = state.plants[plant.id] || 0;
      const amount = button.dataset.amount;
      const affordable =
        amount === "max"
          ? maxAffordable(plant, owned, state.leaves).amount > 0
          : plantCost(plant, owned, Number(amount)) <= state.leaves;
      button.disabled = !affordable;
      if (amount === "10") button.textContent = `×10`;
    }
    for (const button of content.querySelectorAll("[data-upgrade]")) {
      const upgrade = UPGRADES.find((item) => item.id === button.dataset.upgrade);
      button.disabled = upgrade.cost > state.leaves;
    }
    for (const button of content.querySelectorAll("[data-node-buy]")) {
      const node = PRESTIGE_TREE.find((item) => item.id === button.dataset.nodeBuy);
      const locked = node.req && prestigeLevel(state, node.req) <= 0;
      button.disabled = locked || prestigeCost(state, node) > state.seeds;
    }
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
            ? plantsHtml(state, now)
            : current === "ulepszenia"
              ? upgradesHtml(state)
              : current === "prestiz"
                ? prestigeHtml(state)
                : collectionHtml(state, now);
      }
      refreshButtons(state);
    },
  };
  return api;
}
