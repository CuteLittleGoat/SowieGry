// Sowie Ogrody — nowa odsłona: strona podglądu (SowieOgrody/nowa.html). Ogród na płótnie (stuknięcie zbiera liście),
// HUD z liśćmi i konewką, cel rozdziału, dolny panel z zakładkami, okna: powitanie (postęp offline, przeniesienie
// dawnego postępu) i Wielkie Przesadzanie.
//
// Zapis w czasie podglądu: stan v3 w polu `preview` dokumentu gry `sowiegry_gry/ogrody` (pole `state` z wersją 2
// zostaje dla dawnej gry — można do niej wrócić bez strat). Pierwsze wejście: stan z `preview`, a gdy go nie ma —
// migracja dawnego stanu (v2). Po podmianie (E7e) gra zapisze v3 przez `saveGameState`.
import { createAtlas } from "../../shared/engine/sprites.js";
import { EVENTS, progress } from "../../shared/meta/progress.js";
import { createToasts, openModal } from "../../shared/ui/index.js";
import { SPRITES, SVG_BASE } from "../../shared/world/catalog.js";
import { createOwlAnimator } from "../../shared/world/owl.js";
import { COLORS } from "../../shared/world/tokens.js";
import { CHAPTERS, GAME_ID, PLANTS, UPGRADES } from "./config.js";
import { formatNumber, formatTime, hasUpgrade, plantById, prestigeSeeds, production, waterStats } from "./economy.js";
import { chapterIndex, createGarden } from "./garden.js";
import { createPanel } from "./panel.js";
import { createGardenRenderer, gardenUnit } from "./render.js";
import { defaultState, loadState } from "./state.js";

const PREVIEW_FIELD = "preview";
// Zapis: co 30 s w tle gry, po ważnej akcji po 2 s, przy zejściu do tła od razu.
const SAVE_EVERY = 30;
const IMPORTANT_DELAY = 2000;
// Metryki dla Sowiej Akademii (misje dnia i tygodnia, zdjęcia Galerii) — co 5 s gry.
const PROGRESS_EVERY = 5;

const cloud = window.SowieCloud;
const root = document.querySelector("[data-ogrod]");
const canvas = root.querySelector("[data-canvas]");
const leavesNode = root.querySelector("[data-leaves]");
const lpsNode = root.querySelector("[data-lps]");
const waterButton = root.querySelector("[data-water]");
const goalNode = root.querySelector("[data-goal]");

const atlas = createAtlas({ catalog: SPRITES, baseUrl: SVG_BASE });
const animator = createOwlAnimator();
const renderer = createGardenRenderer({ canvas, atlas });
// Jeden komunikat naraz, u góry (jak w trakcie gry) — nie zasłania panelu.
const toasts = createToasts({ root, isInGame: () => true });

// Komunikaty Sowiej Akademii i Galerii Sów — jako zwykłe komunikaty ogrodu.
window.SowieNotifications ||= { notify: (message) => toasts.show(message) };

let garden = createGarden({ state: defaultState() });
let ready = false;
let saveTimer = 0;
let lastFrame = 0;
let hudTimer = 0;
let hiddenAt = 0;
let happyTime = 0;
let progressTimer = 0;

const now = () => Date.now();
const cosmetic = () => cloud?.profile?.()?.cosmetics?.selected || "none";

// ---------- Sowia Akademia ----------

// Most SowieProgress → SowieAcademy (te same metryki co dawna gra: liście, stuknięcia, zakupy, podlewania,
// przesadzania, rośliny); Akademia zapisuje tylko zmienione wartości.
function reportProgress() {
  const { state } = garden;
  progress.emit(EVENTS.IDLE, {
    gameId: GAME_ID,
    lifetimeLeaves: Math.floor(state.lifetimeLeaves),
    clicks: state.stats.taps,
    buys: state.stats.buys,
    watering: state.stats.waterings,
    prestiges: state.stats.prestiges,
    plants: Object.values(state.plants).reduce((sum, count) => sum + count, 0),
  });
}

// ---------- Zapis ----------

function save({ immediate = false, flush = false } = {}) {
  if (!ready || !cloud?.updateGame) return;
  garden.state.savedAt = now();
  const options = immediate ? { delayMs: IMPORTANT_DELAY } : undefined;
  cloud.updateGame(GAME_ID, { [PREVIEW_FIELD]: JSON.stringify(garden.state) }, options);
  if (flush) cloud.flush?.();
}

// ---------- Interfejs ----------

const panel = createPanel({
  root,
  onBuy: (id, amount) => garden.buyPlant(id, amount),
  onUpgrade: (id) => garden.buyUpgrade(id),
  onPrestige: () => confirmPrestige(),
  onNode: (id) => garden.buyPrestige(id),
});

function updateHud() {
  const state = garden.state;
  const prod = production(state, now());
  leavesNode.textContent = formatNumber(state.leaves);
  lpsNode.textContent = `${formatNumber(prod.lps)} liści/s`;
  const can = hasUpgrade(state, "konewka");
  const stats = waterStats(state);
  waterButton.hidden = !can;
  waterButton.disabled = state.can.charges < 1;
  waterButton.querySelector("[data-charges]").textContent = `${Math.floor(state.can.charges)}/${stats.charges}`;
  const watered = (state.effects.watered || 0) - now();
  waterButton.classList.toggle("is-active", watered > 0);
  waterButton.setAttribute(
    "aria-label",
    `Podlej rośliny — ładunki ${Math.floor(state.can.charges)} z ${stats.charges}${watered > 0 ? `, podlane jeszcze ${Math.ceil(watered / 1000)} s` : ""}`,
  );
  renderGoals();
}

let goalKey = "";
function renderGoals() {
  const { chapter, goals, done } = garden.goals();
  const key = `${chapter.id}|${goals.map((goal) => `${goal.done}:${Math.floor(Math.min(goal.value, goal.target))}`).join(",")}|${done}`;
  if (key === goalKey) return;
  goalKey = key;
  const position = chapterIndex(garden.state) + 1;
  const finished = goals.filter((goal) => goal.done).length;
  // Na liście tylko niewykonane cele (oszczędność miejsca na małych telefonach); w nagłówku licznik.
  goalNode.innerHTML = `<h2><span>Rozdział ${position}/${CHAPTERS.length}: ${chapter.name}</span><span>${done ? "ukończony ✓" : `${finished}/${goals.length} ✓`}</span></h2>
    <ul>${goals
      .filter((goal) => !goal.done)
      .map(
        (goal) =>
          `<li class="${goal.done ? "is-done" : ""}"><span>${goal.text}</span><span>${goal.done ? "✓" : goal.kind === "lps" || goal.kind === "runLeaves" ? `${formatNumber(goal.value)}/${formatNumber(goal.target)}` : `${Math.floor(goal.value)}/${goal.target}`}</span></li>`,
      )
      .join("")}</ul>`;
}

function handleEvents() {
  for (const event of garden.takeEvents()) {
    switch (event.type) {
      case "chapter": {
        const done = CHAPTERS.find((chapter) => chapter.id === event.id);
        const next = CHAPTERS.find((chapter) => chapter.id === event.next);
        toasts.show(
          next ? `Rozdział „${done.name}” ukończony! Teraz: ${next.name}` : `Rozdział „${done.name}” ukończony!`,
          {
            kind: "reward",
            key: `rozdzial-${event.id}`,
            priority: 2,
          },
        );
        happyTime = 2;
        save({ immediate: true });
        break;
      }
      case "milestone": {
        const plant = plantById(event.id);
        toasts.show(
          `${plant.name}: ${event.owned} sztuk!${event.owned === 25 || event.owned === 100 ? " Produkcja ×2" : " Nowy wygląd"}`,
          { kind: "success", key: `kamien-${event.id}-${event.owned}` },
        );
        break;
      }
      case "upgrade":
        toasts.show(`Kupiono: ${UPGRADES.find((item) => item.id === event.id).name}`, { kind: "success" });
        save({ immediate: true });
        break;
      case "water": {
        const size = renderer.size();
        renderer.popup("Podlane!", size.width / 2, size.height * 0.3, COLORS.woda, 22);
        renderer.burst(size.width / 2, size.height * 0.3, 14, COLORS.woda);
        break;
      }
      case "prestige":
        toasts.show(`Wielkie Przesadzanie! +${formatNumber(event.seeds)} nasion`, { kind: "reward", priority: 2 });
        save({ immediate: true, flush: true });
        break;
      case "prestigeNode":
        save({ immediate: true });
        break;
      default:
        break;
    }
  }
}

// Treść okna z własnego HTML gry (stałe teksty i sformatowane liczby) — openModal wstawia tekst, a węzeł bez zmian.
function fragment(markup) {
  const node = document.createElement("div");
  node.innerHTML = markup;
  return node;
}

function confirmPrestige() {
  const seeds = prestigeSeeds(garden.state);
  if (!seeds) return;
  openModal({
    title: "Wielkie Przesadzanie",
    content: fragment(
      `<p>Ogród zacznie się od nowa: rośliny, ulepszenia i liście wrócą do zera. Dostaniesz <strong>${formatNumber(seeds)}</strong> nasion na stałe ulepszenia w drzewku prestiżu. Ukończone rozdziały zostają.</p>`,
    ),
    root,
    actions: [
      { label: "Jeszcze nie", onClick: (close) => close() },
      {
        label: "Przesadzaj!",
        primary: true,
        onClick: (close) => {
          close();
          garden.prestige();
          panel.setTab("prestiz");
        },
      },
    ],
  });
}

// Okno powitalne: co urosło pod nieobecność; przy pierwszym wejściu — przeniesienie dawnego postępu.
function welcome({ offline, report }) {
  const parts = [];
  if (report) {
    parts.push(
      `<p>Twój ogród przeniósł się do nowej odsłony. Rośliny i pasujące ulepszenia zostały${report.refundLeaves ? `, a za pozostałe dostajesz <strong>${formatNumber(report.refundLeaves)}</strong> liści` : ""}${report.refundSeeds ? `; drzewko prestiżu zwraca <strong>${formatNumber(report.refundSeeds)}</strong> nasion do wydania od nowa` : ""}.</p>`,
    );
  }
  if (offline?.leaves > 0) {
    parts.push(
      `<p>Sowa doglądała ogrodu przez <strong>${formatTime(offline.seconds)}</strong>. Urosło: <strong>+${formatNumber(offline.leaves)}</strong> liści.</p>`,
    );
  }
  if (!parts.length) return;
  openModal({
    title: report ? "Witaj w nowym ogrodzie!" : "Witaj z powrotem!",
    content: fragment(parts.join("")),
    root,
    actions: [{ label: "Do ogrodu", primary: true, onClick: (close) => close() }],
  });
}

// ---------- Stuknięcia ----------

function tapAt(x, y) {
  if (!ready) return;
  const gain = garden.tap();
  renderer.popup(`+${formatNumber(gain)}`, x, y, COLORS.bialy, 20);
  renderer.burst(x, y, 6);
  happyTime = 0.4;
}

canvas.addEventListener("pointerdown", (event) => {
  const rect = canvas.getBoundingClientRect();
  tapAt(event.clientX - rect.left, event.clientY - rect.top);
});
canvas.addEventListener("keydown", (event) => {
  if (event.key !== " " && event.key !== "Enter") return;
  event.preventDefault();
  const size = renderer.size();
  tapAt(size.width / 2, size.height * 0.45);
});
waterButton.addEventListener("click", () => garden.water());

// ---------- Pętla ----------

function frame(time) {
  const dt = lastFrame ? Math.min(0.25, (time - lastFrame) / 1000) : 0;
  lastFrame = time;
  if (ready) {
    garden.update(dt);
    handleEvents();
    saveTimer += dt;
    if (saveTimer >= SAVE_EVERY) {
      saveTimer = 0;
      save();
    }
    progressTimer += dt;
    if (progressTimer >= PROGRESS_EVERY) {
      progressTimer = 0;
      reportProgress();
    }
  }
  happyTime = Math.max(0, happyTime - dt);
  animator.set(happyTime > 0 ? "radosc" : "stoi");
  animator.update(dt);
  renderer.draw({ state: garden.state, now: now(), time: time / 1000, dt, animator, cosmetic: cosmetic() });
  hudTimer += dt;
  if (hudTimer >= 0.2 || !dt) {
    hudTimer = 0;
    updateHud();
    panel.render(garden.state, now());
  }
  requestAnimationFrame(frame);
}

function resize() {
  renderer.resize();
  const size = renderer.size();
  const owl = Math.min(size.height * 0.36, size.width * 0.32, 96 * gardenUnit(size.width, size.height));
  atlas.ensure(Math.max(64, owl / 1.15) * Math.min(2, window.devicePixelRatio || 1)).catch(() => {});
}

window.addEventListener("resize", resize);

// Powrót z tła: postęp za czas nieobecności (jak offline); zejście do tła — zapis od razu.
document.addEventListener("visibilitychange", () => {
  if (!ready) return;
  if (document.hidden) {
    hiddenAt = now();
    save({ flush: true });
    return;
  }
  if (!hiddenAt) return;
  const seconds = (now() - hiddenAt) / 1000;
  hiddenAt = 0;
  lastFrame = 0;
  const offline = garden.applyOffline(seconds);
  garden.takeEvents();
  if (offline.leaves > 0) welcome({ offline });
});
window.addEventListener("pagehide", () => save({ flush: true }));

// ---------- Start ----------

async function start() {
  await cloud?.ready;
  await cloud?.loadGame?.(GAME_ID);
  const doc = cloud?.game?.(GAME_ID) || {};
  let raw = null;
  if (typeof doc[PREVIEW_FIELD] === "string") {
    try {
      raw = JSON.parse(doc[PREVIEW_FIELD]);
    } catch {
      raw = null;
    }
  }
  if (!raw) raw = (await cloud?.loadGameState?.(GAME_ID)) ?? null;
  const { state, report } = loadState(raw, now());
  // Zdarzenia aktywnej gry (telefon, ciężarówka, kózka, Zatoka) — na ekranie od E7c2; do tego czasu wyłączone.
  garden = createGarden({ state, now, events: false });
  // Czas nieobecności: od ostatniego zapisu dokumentu (znacznik serwera `updatedAt`), inaczej z zapisu stanu.
  const last = Number(doc.updatedAt) || Number(state.savedAt) || now();
  const offline = garden.applyOffline((now() - last) / 1000);
  garden.takeEvents();
  ready = true;
  if (report) save({ immediate: true });
  progress.emit(EVENTS.VISIT, { gameId: GAME_ID });
  reportProgress();
  welcome({ offline, report });
  updateHud();
  panel.render(garden.state, now());
}

resize();
requestAnimationFrame(frame);
start().catch((error) => console.warn("SowieOgrody: start", error));

// Dostęp dla testów e2e (logika i stan bez czekania na klatki).
window.SowieOgrody = Object.freeze({
  ready: () => ready,
  atlasReady: () => atlas.ready(),
  state: () => JSON.parse(JSON.stringify(garden.state)),
  production: () => production(garden.state, now()).lps,
  tap: (count = 1) => {
    for (let index = 0; index < count; index += 1) garden.tap();
    handleEvents();
  },
  give: (leaves) => {
    garden.state.leaves += leaves;
    garden.state.runLeaves += leaves;
    garden.state.lifetimeLeaves += leaves;
  },
  buy: (id, amount = 1) => {
    const result = garden.buyPlant(id, amount);
    handleEvents();
    return result;
  },
  upgrade: (id) => {
    const result = garden.buyUpgrade(id);
    handleEvents();
    return result;
  },
  advance: (seconds) => {
    for (let index = Math.round(seconds * 10); index > 0; index -= 1) garden.update(0.1);
    handleEvents();
  },
  offline: (seconds) => {
    const result = garden.applyOffline(seconds);
    garden.takeEvents();
    welcome({ offline: result });
    return result;
  },
  goals: () => garden.goals(),
  tab: (id) => panel.setTab(id),
  plants: () => PLANTS.map((plant) => plant.id),
  save: () => save({ flush: true }),
});
