// Sowie Ogrody (SowieOgrody/index.html; od E7e zamiast dawnej gry). Ogród na płótnie (stuknięcie zbiera liście),
// HUD z liśćmi i konewką, cel rozdziału, dolny panel z zakładkami, okna: powitanie (postęp offline, przeniesienie
// dawnego postępu) i Wielkie Przesadzanie.
//
// Zapis: stan v3 w polu `state` dokumentu gry `sowiegry_gry/ogrody` (`SowieCloud.saveGameState`, `saveVersion: 3`,
// podsumowanie do profil.records.ogrody). Wczytanie: stan z pola `preview` (zapis z czasu podglądu, E7b–E7d —
// przenoszony do `state`, a `preview` znika w tym samym zapisie), inaczej `state` (v3 albo dawny v2 — migracja).
import { connectAudioSettings, createAudio } from "../../shared/engine/audio.js";
import { createAtlas } from "../../shared/engine/sprites.js";
import { guideFor } from "../../shared/meta/guides-data.js";
import { EVENTS, progress } from "../../shared/meta/progress.js";
import { linkSpecies } from "../../shared/meta/shop.js";
import { createToasts, openModal, renderGuide } from "../../shared/ui/index.js";
import { SPRITES, SVG_BASE } from "../../shared/world/catalog.js";
import { createOwlAnimator } from "../../shared/world/owl.js";
import { COLORS } from "../../shared/world/tokens.js";
import {
  BAY_MUSIC,
  CHAPTERS,
  GAME_ID,
  GAME_SOUNDS,
  GARDEN_EVENTS,
  GARDEN_MUSIC,
  GOAT_REWARDS,
  PLANTS,
  SAVE_VERSION,
  UPGRADES,
} from "./config.js";
import { formatNumber, formatTime, hasUpgrade, plantById, prestigeSeeds, production, waterStats } from "./economy.js";
import { chapterIndex, createGarden } from "./garden.js";
import { createPanel } from "./panel.js";
import { createGardenRenderer, gardenUnit } from "./render.js";
import { defaultState, loadState } from "./state.js";
import { createTutorial } from "./tutorial.js";
import { claimContract, dailyContracts, ensureDaily } from "./daily.js";

// Pole zapisu z czasu podglądu (E7b–E7d) — przy pierwszym wejściu po podmianie przenoszone do `state`.
const PREVIEW_FIELD = "preview";
const GUIDE_ID = GAME_ID; // instrukcja „ogrody” w shared/meta/guides-data.js
const AUDIO_BASE = new URL("../../assets/audio/", import.meta.url).href;
// Zapis: co 30 s w tle gry, po ważnej akcji po 2 s (saveGameState z `immediate`), przy zejściu do tła od razu.
const SAVE_EVERY = 30;
// Metryki dla Sowiej Akademii (misje dnia i tygodnia, zdjęcia Galerii) — co 5 s gry.
const PROGRESS_EVERY = 5;

const cloud = window.SowieCloud;
const root = document.querySelector("[data-ogrod]");
const canvas = root.querySelector("[data-canvas]");
const leavesNode = root.querySelector("[data-leaves]");
const lpsNode = root.querySelector("[data-lps]");
const waterButton = root.querySelector("[data-water]");
const goalNode = root.querySelector("[data-goal]");
const alertsNode = root.querySelector("[data-alerts]");
const alertButtons = Object.fromEntries(
  [...alertsNode.querySelectorAll("[data-alert]")].map((node) => [node.dataset.alert, node]),
);
const truckTapsNode = root.querySelector("[data-truck-taps]");
const splashNode = root.querySelector("[data-splash]");
const splashFill = root.querySelector("[data-splash-fill]");
const bayHud = root.querySelector("[data-bay-hud]");
const tutorialNode = root.querySelector("[data-tutorial]");

const atlas = createAtlas({ catalog: SPRITES, baseUrl: SVG_BASE });
// Gatunek sowy z Sowiego Butiku (przekolorowanie części sowy w atlasie).
linkSpecies(atlas);
const animator = createOwlAnimator();
const renderer = createGardenRenderer({ canvas, atlas });
// Jeden komunikat naraz, u góry (jak w trakcie gry) — nie zasłania panelu.
const toasts = createToasts({ root, isInGame: () => true });

// Komunikaty Sowiej Akademii i Galerii Sów (wołają toast({ title, detail, reward })) — jako komunikaty ogrodu.
window.SowieNotifications ||= {
  toast({ title = "", detail = "", reward = "" } = {}) {
    toasts.show([title, detail, reward].filter(Boolean).join(" · "), { kind: "reward", duration: 3200 });
  },
};

let garden = createGarden({ state: defaultState() });
let ready = false;
let saveTimer = 0;
let lastFrame = 0;
let hudTimer = 0;
let hiddenAt = 0;
let happyTime = 0;
let progressTimer = 0;
// Kozi szał: zbiory sumowane i pokazywane napisem co 0,4 s (8 zbiorów/s to za dużo napisów).
let harvestGain = 0;
let harvestTimer = 0;
// Testy e2e: logika wstrzymana w klatkach (hak `hold`) — przesuwa ją tylko `advance`; rysowanie i HUD działają.
let testHold = false;
// Silnik dźwięku (po wczytaniu audio.json); stuknięcia grają najwyżej co 70 ms (szybkie stukanie nie dudni).
let audio = null;
let lastTapSound = 0;
// Samouczek pierwszego wejścia (E7d2) — trwa, dopóki nie ukończony albo pominięty.
let tutorial = null;
let tutorialSkipped = false;
// Kontrakty dnia gotowe do odbioru, o których już był komunikat (w tej wizycie).
const contractsAnnounced = new Set();

const now = () => Date.now();

// ---------- Dźwięk ----------

function play(name, options) {
  try {
    return audio?.play(name, options) || null;
  } catch {
    return null;
  }
}

function playMusic(name) {
  if (audio?.currentMusic?.() === name) return;
  audio?.playMusic?.(name)?.catch?.(() => {});
}
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
  if (!ready || !cloud?.saveGameState) return;
  const { state } = garden;
  state.savedAt = now();
  // Podsumowanie do profilu (menu: karta i okno „Rekordy”): liście, przesadzania, bieżący rozdział.
  const summary = {
    lifetimeLeaves: Math.floor(state.lifetimeLeaves),
    prestiges: state.stats.prestiges,
    zone: CHAPTERS[chapterIndex(state)]?.name || "",
  };
  cloud.saveGameState(GAME_ID, state, { immediate, saveVersion: SAVE_VERSION, summary });
  if (flush) cloud.flush?.();
}

// ---------- Interfejs ----------

const panel = createPanel({
  root,
  // Dźwięk zakupu tylko dla zakupów gracza (Sowa zakupowa kupuje po cichu).
  onBuy: (id, amount) => {
    if (garden.buyPlant(id, amount)) play("zakup", { volume: 0.7 });
  },
  onUpgrade: (id) => garden.buyUpgrade(id),
  onPrestige: () => confirmPrestige(),
  onNode: (id) => garden.buyPrestige(id),
  onClaim: (id) => claimDaily(id),
  // Powtórzenie samouczka z zakładki Kolekcja (uwaga właściciela G1).
  onTutorial: () => startTutorial(),
});

// Kontrakty dnia (E7d3): nagroda przez SowieProgress (zdarzenie `award` → SowieAcademy.award; ten sam identyfikator
// co w dawnej grze — tego samego dnia raz), komunikat, zapis po 2 s.
function claimDaily(id) {
  const item = claimContract(garden.state, id, now());
  if (!item) return;
  progress.emit(EVENTS.AWARD, { id: item.award, xp: item.xp, feathers: item.feathers, label: "Kontrakt ogrodniczy" });
  play("powerup-start");
  toasts.show(`Kontrakt wykonany: ${item.label} (+${item.xp} XP, +${item.feathers} piórka)`, {
    kind: "reward",
    key: `kontrakt-${id}`,
    priority: 2,
  });
  panel.refresh();
  save({ immediate: true });
}

// Komunikat, gdy kontrakt jest gotowy do odbioru (raz na wizytę); przy okazji nowy dzień — nowa linia bazowa.
function checkContracts() {
  for (const item of dailyContracts(garden.state, now())) {
    const key = `${garden.state.daily.date}:${item.id}`;
    if (!item.done || item.claimed || contractsAnnounced.has(key)) continue;
    contractsAnnounced.add(key);
    toasts.show(`Kontrakt gotowy: ${item.label} — odbierz w zakładce Kolekcja`, {
      kind: "reward",
      key: `gotowy-${item.id}`,
    });
  }
}

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
  updateEvents();
  if (ready) checkContracts();
}

// Zdarzenia: przyciski reakcji, Plusk-o-metr, licznik Zatoki Humbaka.
function updateEvents() {
  const state = garden.state;
  alertButtons.pracu.hidden = !state.phone;
  alertButtons.truck.hidden = !state.truck;
  if (state.truck) {
    const need = hasUpgrade(state, "kurier") ? 1 : GARDEN_EVENTS.truck.taps;
    truckTapsNode.textContent = `${state.truck.taps}/${need}`;
  }
  alertButtons.goat.hidden = !state.goat;
  alertButtons.bay.hidden = !(state.splash >= 1) || Boolean(state.bay);
  bayHud.hidden = !state.bay;
  if (state.bay) {
    bayHud.querySelector("[data-bay-time]").textContent = `${Math.max(0, Math.ceil(state.bay.time))} s`;
    bayHud.querySelector("[data-bay-combo]").textContent = `combo ×${state.bay.combo}`;
  }
  splashNode.hidden = Boolean(state.bay) || (state.splash <= 0 && !hasUpgrade(state, "konewka"));
  splashFill.style.transform = `scaleX(${Math.min(1, state.splash)})`;
  splashNode.setAttribute("aria-label", `Plusk-o-metr: ${Math.round(Math.min(1, state.splash) * 100)}%`);
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
        play("rekord");
        save({ immediate: true });
        break;
      }
      case "milestone": {
        play("hu-hu", { volume: 0.8 });
        const plant = plantById(event.id);
        toasts.show(
          `${plant.name}: ${event.owned} sztuk!${event.owned === 25 || event.owned === 100 ? " Produkcja ×2" : " Nowy wygląd"}`,
          { kind: "success", key: `kamien-${event.id}-${event.owned}` },
        );
        break;
      }
      case "upgrade":
        play("zakup");
        toasts.show(`Kupiono: ${UPGRADES.find((item) => item.id === event.id).name}`, { kind: "success" });
        save({ immediate: true });
        break;
      case "water": {
        play("humbak-plusk", { volume: 0.6 });
        const size = renderer.size();
        renderer.popup("Podlane!", size.width / 2, size.height * 0.3, COLORS.woda, 22);
        renderer.burst(size.width / 2, size.height * 0.3, 14, COLORS.woda);
        break;
      }
      case "prestige":
        play("rekord");
        toasts.show(`Wielkie Przesadzanie! +${formatNumber(event.seeds)} nasion`, { kind: "reward", priority: 2 });
        save({ immediate: true, flush: true });
        break;
      case "prestigeNode":
        save({ immediate: true });
        break;
      case "pracu":
        play("dzwonek");
        toasts.show("Dzwoni Pracu Pracu! Odrzuć telefon — do tego czasu produkcja −30%", {
          kind: "warn",
          key: "pracu",
          priority: 1,
        });
        break;
      case "pracuEnd":
        play("klik");
        if (event.auto) toasts.show("Tryb samolotowy wyciszył telefon Pracu Pracu", { kind: "info", key: "samolot" });
        else {
          const target = renderer.hits().phone;
          renderer.popup("Cisza!", target?.x ?? 40, target?.y ?? 40, COLORS.bialy, 18);
        }
        break;
      case "truck":
        play("trafienie-amic", { volume: 0.7 });
        toasts.show(`Ciężarówka Amic zastawiła: ${plantById(event.plant).name}! Stuknij ją, żeby odjechała`, {
          kind: "warn",
          key: "ciezarowka",
          priority: 1,
        });
        break;
      case "truckTap": {
        play("klik");
        const target = renderer.hits().truck;
        if (target)
          renderer.popup(`${event.taps}/${event.need}`, target.x, target.y - target.r * 0.6, COLORS.bialy, 18);
        break;
      }
      case "truckEnd":
        play("zycie");
        toasts.show("Ciężarówka Amic odjechała — grządka wolna!", { kind: "success", key: "ciezarowka-koniec" });
        break;
      case "goat":
        play("koza-meee", { volume: 0.8 });
        break;
      case "goatCaught": {
        play("powerup-start");
        const reward = GOAT_REWARDS.find((item) => item.id === event.reward);
        toasts.show(reward.text, { kind: "reward", key: `kozka-${event.reward}`, priority: 2 });
        const size = renderer.size();
        if (event.leaves)
          renderer.popup(`+${formatNumber(event.leaves)}`, size.width / 2, size.height * 0.4, COLORS.zloto, 24);
        renderer.burst(size.width / 2, size.height * 0.5, 12, COLORS.zloto);
        happyTime = 1;
        break;
      }
      case "harvest":
        harvestGain += event.gain;
        break;
      case "bayReady":
        play("hu-hu");
        toasts.show("Plusk-o-metr pełny! Zatoka Humbaka czeka", { kind: "reward", key: "zatoka-gotowa", priority: 2 });
        break;
      case "bay":
        play("bonus-start");
        playMusic(BAY_MUSIC);
        toasts.show("Zatoka Humbaka! Łap liście z fontanny", { kind: "info", key: "zatoka" });
        break;
      case "bayCatch": {
        play("lisc-zloty", { pitch: 1 + Math.min(event.combo, 10) * 0.03 });
        const size = renderer.size();
        const x = event.x * size.width;
        const y = event.y * size.height;
        renderer.popup(
          `+${formatNumber(event.gain)}${event.combo > 1 ? ` ×${event.combo}` : ""}`,
          x,
          y,
          COLORS.bialy,
          18,
        );
        renderer.burst(x, y, 5);
        break;
      }
      case "bayEnd":
        play("powerup-koniec");
        playMusic(GARDEN_MUSIC);
        toasts.show(`Zatoka Humbaka: złapane liście — ${event.caught}, razem +${formatNumber(event.reward)}`, {
          kind: "reward",
          key: "zatoka-koniec",
          priority: 2,
        });
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

// ---------- Samouczek i „Jak grać?” ----------

function showTutorial(item) {
  tutorialNode.hidden = !item;
  if (!item) return;
  tutorialNode.querySelector("[data-tutorial-step]").textContent = `Samouczek · krok ${item.step} z ${item.steps}`;
  const demo = tutorialNode.querySelector(".sowie-gesture-demo");
  demo.hidden = !item.gesture;
  if (item.gesture) demo.dataset.gesture = item.gesture;
  tutorialNode.querySelector("[data-tutorial-text]").textContent = item.text;
  tutorialNode.querySelector("[data-tutorial-next]").hidden = !item.next;
}

function tutorialFinished() {
  tutorial = null;
  if (!tutorialSkipped) {
    play("zycie", { pitch: 1.2 });
    toasts.show("Świetnie! Ogród jest Twój — powodzenia!", { kind: "success", key: "samouczek-koniec", priority: 3 });
  }
  if (!garden.state.tutorialDone) {
    garden.state.tutorialDone = true;
    save({ immediate: true });
  }
  // Prośba z menu („Powtórz samouczki we wszystkich grach” — `tutorialDone: false` w dokumencie gry) spełniona.
  if (cloud?.game?.(GAME_ID)?.tutorialDone === false) cloud.updateGame?.(GAME_ID, { tutorialDone: true });
}

function startTutorial() {
  tutorialSkipped = false;
  tutorial = createTutorial({ state: garden.state, onStep: showTutorial, onDone: tutorialFinished });
}

tutorialNode.querySelector("[data-tutorial-next]").addEventListener("click", () => tutorial?.next(garden.state));
tutorialNode.querySelector("[data-tutorial-skip]").addEventListener("click", () => {
  tutorialSkipped = true;
  tutorial?.skip();
});

function openGuide(trigger) {
  openModal({
    title: `Jak grać — ${guideFor(GUIDE_ID).title}`,
    content: renderGuide(guideFor(GUIDE_ID), { atlas, sprites: SPRITES }),
    root,
    className: "is-guide",
    actions: [
      {
        label: "Zagraj samouczek",
        onClick: (close) => {
          close();
          startTutorial();
        },
      },
      { label: "Rozumiem", primary: true, onClick: (close) => close() },
    ],
    onClose: () => trigger?.focus?.({ preventScroll: true }),
  });
}

root.querySelector("[data-guide]").addEventListener("click", (event) => openGuide(event.currentTarget));

// ---------- Stuknięcia ----------

function tapAt(x, y) {
  if (!ready) return;
  const gain = garden.tap();
  const time = performance.now();
  if (time - lastTapSound > 70) {
    lastTapSound = time;
    play("lisc", { volume: 0.6 });
  }
  renderer.popup(`+${formatNumber(gain)}`, x, y, COLORS.bialy, 20);
  renderer.burst(x, y, 6);
  happyTime = 0.4;
}

// Stuknięcie w płótno: w Zatoce Humbaka — łapanie liścia; inaczej najpierw zdarzenie pod palcem (kózka, telefon,
// ciężarówka), a na pustym miejscu — zbiór liści.
function pointAt(x, y) {
  if (!ready) return;
  const state = garden.state;
  if (state.bay) {
    const size = renderer.size();
    garden.catchLeaf(x / size.width, y / size.height, 40 / size.width, 40 / size.height);
  } else {
    const target = renderer.hit(x, y);
    if (target === "goat") garden.catchGoat();
    else if (target === "phone") garden.hangUp();
    else if (target === "truck") garden.shooTruck();
    else {
      tapAt(x, y);
      return;
    }
  }
  handleEvents();
  updateEvents();
}

canvas.addEventListener("pointerdown", (event) => {
  const rect = canvas.getBoundingClientRect();
  pointAt(event.clientX - rect.left, event.clientY - rect.top);
});
alertsNode.addEventListener("click", (event) => {
  const button = event.target.closest("[data-alert]");
  if (!button || !ready) return;
  const type = button.dataset.alert;
  if (type === "pracu") garden.hangUp();
  else if (type === "truck") garden.shooTruck();
  else if (type === "goat") garden.catchGoat();
  else if (type === "bay") garden.startBay();
  handleEvents();
  updateEvents();
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
  if (ready && !testHold) {
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
  harvestTimer += dt;
  if (harvestGain > 0 && harvestTimer >= 0.4) {
    const size = renderer.size();
    renderer.popup(
      `+${formatNumber(harvestGain)}`,
      size.width * (0.3 + Math.random() * 0.4),
      size.height * 0.55,
      COLORS.zloto,
      16,
    );
    harvestGain = 0;
    harvestTimer = 0;
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
    tutorial?.update(garden.state);
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
  const fromPreview = Boolean(raw);
  if (!raw) raw = (await cloud?.loadGameState?.(GAME_ID)) ?? null;
  const { state, report } = loadState(raw, now());
  garden = createGarden({ state, now });
  // Czas nieobecności: od ostatniego zapisu dokumentu (znacznik serwera `updatedAt`), inaczej z zapisu stanu.
  const last = Number(doc.updatedAt) || Number(state.savedAt) || now();
  const offline = garden.applyOffline((now() - last) / 1000);
  garden.takeEvents();
  ready = true;
  ensureDaily(garden.state, now());
  if (fromPreview) {
    // Zapis z czasu podglądu staje się stanem gry; pole `preview` znika (ten sam zapis do bazy).
    cloud.updateGame(GAME_ID, (gameDoc) => {
      delete gameDoc[PREVIEW_FIELD];
    });
  }
  if (report || fromPreview) save({ immediate: true });
  progress.emit(EVENTS.VISIT, { gameId: GAME_ID });
  reportProgress();
  welcome({ offline, report });
  // Menu („Powtórz samouczki we wszystkich grach”) ustawia w dokumencie gry `tutorialDone: false`.
  if (doc.tutorialDone === false) garden.state.tutorialDone = false;
  if (!garden.state.tutorialDone) startTutorial();
  updateHud();
  panel.render(garden.state, now());
}

resize();
requestAnimationFrame(frame);

// Dźwięk: manifest, ustawienia głośności z profilu, odblokowanie pierwszym dotknięciem (wymóg przeglądarek);
// muzyka ogrodu gra od odblokowania (w Zatoce — pieśń humbaka).
fetch(new URL("audio.json", AUDIO_BASE))
  .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`audio.json: ${response.status}`))))
  .then((manifest) => {
    audio = createAudio({ manifest, baseUrl: AUDIO_BASE, preloadOnUnlock: GAME_SOUNDS });
    connectAudioSettings(audio, cloud);
    audio.bindUnlock(window, { ignore: (event) => Boolean(event.target?.closest?.("a[href]")) });
    playMusic(garden.state.bay ? BAY_MUSIC : GARDEN_MUSIC);
  })
  .catch((error) => console.warn("SowieOgrody: bez dźwięku", error));
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
  // Zdarzenia (E7c2): stan, wywołanie od razu, pełny Plusk-o-metr, miejsca do stuknięcia na płótnie.
  events: () => {
    const state = garden.state;
    return JSON.parse(
      JSON.stringify({
        phone: state.phone,
        truck: state.truck,
        blocked: state.blocked,
        goat: state.goat,
        bay: state.bay,
        splash: state.splash,
        timers: state.timers,
        effects: state.effects,
      }),
    );
  },
  trigger: (type, option) => {
    const done = garden.trigger(type, option);
    handleEvents();
    updateHud();
    return done;
  },
  fillSplash: () => {
    garden.state.splash = 1;
    updateHud();
  },
  hit: (name) => renderer.hits()[name] ?? null,
  music: () => audio?.currentMusic?.() ?? null,
  tutorial: () => tutorial?.progress() ?? null,
  contracts: () => dailyContracts(garden.state, now()),
  // Testy: wstrzymanie logiki w klatkach (np. liście Zatoki stoją w miejscu do stuknięcia); `advance` działa dalej.
  hold: (on = true) => {
    testHold = Boolean(on);
  },
});
