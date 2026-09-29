// Sowia Ucieczka — strona gry: Sowi Silnik (widok, pętla, gesty, powłoka telefonu), wspólny interfejs
// (HUD, pauza, wyniki, komunikaty), dźwięk, SowieProgress i zapis w chmurze (SowieCloud.submitRun).
import { connectAudioSettings, createAudio } from "../shared/engine/audio.js";
import { bindInput } from "../shared/engine/input.js";
import { createLoop } from "../shared/engine/loop.js";
import { createParticles } from "../shared/engine/particles.js";
import { createShell } from "../shared/engine/shell.js";
import { createAtlas } from "../shared/engine/sprites.js";
import { createView } from "../shared/engine/view.js";
import { guideFor } from "../shared/meta/guides-data.js";
import { EVENTS, progress } from "../shared/meta/progress.js";
import { createHud, createPauseMenu, createResults, createToasts, openModal, renderGuide } from "../shared/ui/index.js";
import { SPRITES, SVG_BASE } from "../shared/world/catalog.js";
import { createOwlAnimator } from "../shared/world/owl.js";
import { COLORS } from "../shared/world/tokens.js";
import { createRunCamera } from "./camera.js";
import { BIOMES } from "./backgrounds.js";
import { CLOUD, DIFFICULTIES, DIFFICULTY_ORDER, FEVER, GAME_ID, GAME_SOUNDS, GOATS, VIEW, WHALE } from "./config.js";
import { createRun } from "./game.js";
import { TUTORIAL_PATTERNS, tierAt } from "./patterns.js";
import { createRenderer } from "./render.js";
import { createTutorial } from "./tutorial.js";
import { LEVEL_MAX, TASKS_PER_LEVEL, createTaskTracker, describeTasks, normalizeTasks } from "./tasks.js";

const cloud = window.SowieCloud;
const params = new URLSearchParams(location.search);
const AUDIO_BASE = new URL("../assets/audio/", import.meta.url).href;
const GUIDE_ID = "ucieczka";
// Wyzwanie dnia (?daily=1): ta sama trasa przez cały dzień (ziarno z daty), zawsze poziom Arcade.
const DAILY = params.get("daily") === "1";
const todayKey = () => cloud?.helpers?.dayKey?.(Date.now()) || new Date().toISOString().slice(0, 10);

const stage = document.querySelector("[data-stage]");
const canvas = document.querySelector("[data-canvas]");
const titleNode = document.querySelector("[data-title]");
const recordNode = document.querySelector("[data-record]");
const cozyNode = document.querySelector("[data-cozy]");
const difficultyGroup = document.querySelector("[data-difficulty]");
const dailyNote = document.querySelector("[data-daily-note]");
const dailyLink = document.querySelector("[data-daily]");
const tasksButton = document.querySelector("[data-tasks]");

// Adaptacyjna rozdzielczość płótna: najwyżej DPR 2; gdy bieg przez 3 s ma średnio < 50 kl./s, 1,5, potem 1
// (słabszy telefon: płynność ważniejsza niż ostrość). Zmniejszamy tylko w trakcie biegu, nigdy nie zwiększamy.
let dprCap = 2;
const view = createView({
  canvas,
  minWorld: VIEW.minWorld,
  getSize: () => {
    const rect = stage.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  },
  getDpr: () => Math.min(window.devicePixelRatio || 1, dprCap),
});
const camera = createRunCamera();
const atlas = createAtlas({ catalog: SPRITES, baseUrl: SVG_BASE });
const renderer = createRenderer({ canvas, view, camera, atlas });
const particles = createParticles({ max: 240 });
const animator = createOwlAnimator();

let audio = null;
let game = null;
let screen = "title"; // title | playing | results
let difficulty = "arcade";
let hitStop = 0;
let gameReady = false;
let previousCombo = 1;
let glideVoice = null;
let lastFrame = 0;
// Zadania biegu: stan z dokumentu gry (po wczytaniu) i śledzenie bieżącego biegu.
let tasksData = normalizeTasks(null);
let tracker = null;
let lastQuip = -Infinity;
let startQuip = false;
// Samouczek: przy pierwszym biegu (brak `tutorialDone` w dokumencie gry), z „Jak grać?” albo z ?samouczek=1.
let tutorial = null;
let forceTutorial = params.get("samouczek") === "1";

const settings = () => cloud?.profile?.()?.settings || {};
const cosmetic = () => cloud?.profile?.()?.cosmetics?.selected || "none";
// Ograniczenie ruchu: ustawienie systemu (zapamiętane, bez pytania matchMedia w każdej klatce) albo profilu.
const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
const reducedMotion = () => Boolean(motionQuery?.matches) || Boolean(settings().reducedEffects);
const cozyEnabled = () => difficulty === "chill" && Boolean(settings().cozy);

// ---------- Interfejs ----------

const loop = createLoop({ update, render });
const shell = createShell({
  stage,
  loop,
  overlay: false,
  onBatterySaver: (on) => particles.setDensity(on ? 0.4 : reducedMotion() ? 0.5 : 1),
});
const inGame = () => screen === "playing" && shell.state() === "running";
const hud = createHud({ root: stage, onPause: () => shell.pause("gracz"), maxLives: CLOUD.steps });
hud.hide();
const toasts = createToasts({ root: stage, isInGame: inGame });
const pause = createPauseMenu({
  root: stage,
  shell,
  gameId: GUIDE_ID,
  audio: () => audio,
  atlas,
  sprites: SPRITES,
  onRestart: () => startRun(),
  onResume: () => toasts.refresh(),
  onExit: () => location.assign("../"),
  endAction: { label: "Zakończ bieg", visible: () => Boolean(game?.state.cozy), onClick: () => game?.end("gracz") },
});
const results = createResults({ root: stage, onAgain: () => startRun(), onMenu: () => location.assign("../") });

// Plusk-o-metr (pod przyciskiem pauzy): 60 liści albo 3 bąbelki → „Rejs na humbaku”; w rejsie — pozostały czas.
const splashNode = document.createElement("div");
splashNode.className = "ucieczka-splash";
splashNode.hidden = true;
splashNode.setAttribute("role", "progressbar");
splashNode.setAttribute("aria-valuemin", "0");
splashNode.setAttribute("aria-valuemax", "100");
splashNode.innerHTML =
  '<img src="../assets/svg/humbak/humbak.svg" alt="" width="34" height="17" /><span class="ucieczka-splash-bar"><span></span></span>';
stage.appendChild(splashNode);
const splashFill = splashNode.querySelector(".ucieczka-splash-bar span");
let splashShown = -1;

function updateSplash(state) {
  const bonus = state.bonus;
  const share = bonus ? Math.max(0, bonus.time / WHALE.duration) : state.splash;
  const percent = Math.round(share * 100);
  if (percent === splashShown && splashNode.classList.contains("is-bonus") === Boolean(bonus)) return;
  splashShown = percent;
  splashFill.style.transform = `scaleX(${share})`;
  splashNode.classList.toggle("is-bonus", Boolean(bonus));
  splashNode.setAttribute("aria-valuenow", String(percent));
  splashNode.setAttribute(
    "aria-label",
    bonus ? `Rejs na humbaku: ${Math.ceil(bonus.time)} s` : `Plusk-o-metr: ${percent}%`,
  );
}

// Samouczek: podpowiedź w górnej części planszy (sowa biegnie nisko, przy lewej krawędzi) z animacją gestu.
const tutorialNode = document.createElement("div");
tutorialNode.className = "ucieczka-tutorial";
tutorialNode.hidden = true;
tutorialNode.setAttribute("role", "status");
tutorialNode.setAttribute("aria-live", "assertive");
tutorialNode.innerHTML =
  '<span class="ucieczka-tutorial-step" data-tutorial-step></span><span class="sowie-gesture-demo" aria-hidden="true"><span class="sowie-gesture-finger"></span></span><p data-tutorial-text></p>';
stage.appendChild(tutorialNode);

function showTutorialPrompt(item) {
  tutorialNode.hidden = !item;
  if (!item) return;
  tutorialNode.querySelector("[data-tutorial-step]").textContent = `Samouczek · krok ${item.step} z ${item.steps}`;
  tutorialNode.querySelector(".sowie-gesture-demo").dataset.gesture = item.gesture;
  tutorialNode.querySelector("[data-tutorial-text]").textContent = item.text;
}

function wantsTutorial() {
  if (forceTutorial) return true;
  return !DAILY && !params.get("seed") && !cloud?.game?.(GAME_ID)?.tutorialDone;
}

function tutorialFinished() {
  game?.setSafe(false);
  tutorial = null;
  play("zakup");
  toasts.show("Świetnie! Teraz uciekaj przed Chmurą Pracu!", { kind: "success", key: "samouczek", priority: 2 });
  cloud?.updateGame?.(GAME_ID, { tutorialDone: true });
}

const GOAT_TEXT = {
  sprezynka: "Kózka Sprężynka — super-skok!",
  tarcza: "Kózka Tarcza — chroni przed 1 trafieniem",
  magnes: "Kózka Magnes — przyciąga liście",
  turbo: "Kózka Turbo — sprint bez obrażeń!",
  podwajaczka: "Kózka Podwajaczka — liście ×2",
};

// Akademia i Galeria: w trakcie biegu komunikaty czekają na ekran wyników (Analiza 2, rozdz. 4.3).
window.SowieNotifications ||= {
  toast({ title = "", detail = "", reward = "" } = {}) {
    const text = [title, detail, reward].filter(Boolean).join(" · ");
    if (inGame()) toasts.defer(text);
    else toasts.show(text, { kind: "reward", duration: 3200 });
  },
};

// Muzyka: motyw biegu („ucieczka”, 125 BPM) i pieśń humbaka w rejsie; przy wyłączonej muzyce pliku nie pobieramy.
const musicOn = () => settings().music !== false;
function playMusic(name) {
  if (!musicOn()) return;
  audio?.playMusic?.(name)?.catch?.(() => {});
}

function play(name, options) {
  try {
    return audio?.play(name, options) || null;
  } catch (_error) {
    return null;
  }
}

// ---------- Ekran tytułowy ----------

function selectDifficulty(level, { save = true } = {}) {
  difficulty = DIFFICULTIES[level] && !DAILY ? level : "arcade";
  for (const button of difficultyGroup.querySelectorAll("[data-level]")) {
    button.setAttribute("aria-pressed", String(button.dataset.level === difficulty));
  }
  cozyNode.hidden = !cozyEnabled();
  showRecord();
  if (save && !DAILY) cloud?.updateGame?.(GAME_ID, { difficulty }, { delayMs: 2000 });
}

function showRecord() {
  showDaily();
  if (!cloud?.isReady?.()) {
    recordNode.textContent = "Wczytuję rekordy…";
    return;
  }
  const best = cloud.records(GAME_ID, difficulty);
  recordNode.textContent = best.bestScore
    ? `Rekord (${DIFFICULTIES[difficulty].label}): ${Math.floor(best.bestScore).toLocaleString("pl-PL")} pkt · ${Math.floor(best.bestDistance || 0).toLocaleString("pl-PL")} m`
    : `Jeszcze bez rekordu na poziomie ${DIFFICULTIES[difficulty].label}.`;
}

// Wyzwanie dnia: odnośnik z zachowaniem pozostałych parametrów adresu (np. ?cloud=emulator w testach).
function setupDaily() {
  const url = new URL(location.href);
  url.searchParams.delete("seed");
  if (DAILY) url.searchParams.delete("daily");
  else url.searchParams.set("daily", "1");
  dailyLink.href = `${url.pathname}${url.search}`;
  dailyLink.textContent = DAILY ? "Zwykły bieg" : "Wyzwanie dnia";
  for (const button of difficultyGroup.querySelectorAll("[data-level]")) button.disabled = DAILY;
}

function showDaily() {
  dailyNote.hidden = !DAILY;
  if (!DAILY) return;
  const best = cloud?.isReady?.() ? Number(cloud.game(GAME_ID)?.dailyBest?.[todayKey()]) || 0 : 0;
  dailyNote.textContent = `Wyzwanie dnia (Arcade): dziś cały dzień ta sama trasa. ${
    best ? `Dzisiaj najdalej: ${best.toLocaleString("pl-PL")} m.` : "Dziś jeszcze bez wyniku."
  }`;
}

function showTasks() {
  tasksButton.querySelector("[data-multiplier]").textContent = `×${tasksData.level}`;
  tasksButton.setAttribute("aria-label", `Zadania biegu, Sowi mnożnik ×${tasksData.level}`);
}

// Okno zadań: 3 aktywne zadania z postępem i opis Sowiego mnożnika.
function openTasks(trigger) {
  const content = document.createElement("div");
  const intro = document.createElement("p");
  intro.className = "ucieczka-tasks-intro";
  intro.textContent = `Sowi mnożnik ×${tasksData.level} mnoży punkty za dystans. Każde ${TASKS_PER_LEVEL} ukończone zadania podnoszą go o 1 (najwyżej ×${LEVEL_MAX}). Ukończone zadania: ${tasksData.completed}.`;
  const list = document.createElement("ul");
  list.className = "sowie-ui-tasks";
  list.dataset.tasksList = "";
  for (const task of describeTasks(tasksData)) {
    const item = document.createElement("li");
    const share = task.target > 0 ? Math.min(1, task.progress / task.target) : 0;
    item.innerHTML = `<span class="sowie-ui-task-label"></span><span class="sowie-ui-task-bar" aria-hidden="true"><span style="transform:scaleX(${share})"></span></span><span class="sowie-ui-task-value"></span>`;
    item.querySelector(".sowie-ui-task-label").textContent = task.label;
    item.querySelector(".sowie-ui-task-value").textContent =
      task.scope === "run" ? "w 1 biegu" : `${task.progress} / ${task.target}`;
    list.appendChild(item);
  }
  content.append(intro, list);
  openModal({
    title: "Zadania biegu",
    content,
    root: stage,
    actions: [{ label: "Do biegu!", primary: true, onClick: (close) => close() }],
    onClose: () => trigger?.focus?.({ preventScroll: true }),
  });
}

difficultyGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-level]");
  if (button) selectDifficulty(button.dataset.level);
});
titleNode.querySelector("[data-start]").addEventListener("click", () => startRun());
titleNode.querySelector("[data-guide]").addEventListener("click", (event) => openGuide(event.currentTarget));
tasksButton.addEventListener("click", (event) => openTasks(event.currentTarget));
setupDaily();

function openGuide(trigger) {
  openModal({
    title: `Jak grać — ${guideFor(GUIDE_ID).title}`,
    content: renderGuide(guideFor(GUIDE_ID), { atlas, sprites: SPRITES }),
    root: stage,
    className: "is-guide",
    actions: [
      {
        label: "Zagraj samouczek",
        onClick: (close) => {
          close();
          forceTutorial = true;
          startRun();
        },
      },
      { label: "Rozumiem", primary: true, onClick: (close) => close() },
    ],
    onClose: () => trigger?.focus?.({ preventScroll: true }),
  });
}

// ---------- Bieg ----------

// Ziarno: ?seed= (testy), wyzwanie dnia (data) albo losowe.
function baseSeed() {
  if (params.get("seed")) return params.get("seed");
  return DAILY ? `daily-${todayKey()}-${GAME_ID}` : null;
}

function seedFor() {
  const seed = baseSeed();
  return seed ? `${seed}:${difficulty}` : `${Date.now()}:${Math.random()}`;
}

function startRun() {
  // Bieg dopiero po wczytaniu dokumentu gry (top 10 i rekordy dnia) — inaczej zapis nadpisałby top 10.
  if (!gameReady) return;
  results.hide();
  toasts.clear();
  renderer.clearPopups();
  particles.clear();
  tracker = createTaskTracker({ saved: tasksData });
  const withTutorial = wantsTutorial();
  forceTutorial = false;
  game = createRun({
    difficulty,
    seed: seedFor(),
    cozy: cozyEnabled(),
    multiplier: tracker.multiplier,
    intro: withTutorial ? TUTORIAL_PATTERNS : [],
    safe: withTutorial,
  });
  tutorial = withTutorial ? createTutorial({ onPrompt: showTutorialPrompt, onDone: tutorialFinished }) : null;
  showTutorialPrompt(null);
  lastQuip = -Infinity;
  startQuip = false;
  screen = "playing";
  titleNode.hidden = true;
  hud.show();
  hud.setScore(0, { animate: false });
  hud.setLeaves(0);
  hud.setLives(CLOUD.steps, CLOUD.steps);
  hud.setPowerups([]);
  splashNode.hidden = false;
  splashShown = -1;
  animator.set("bieg");
  view.lockScale(true);
  camera.track(game.state.owl, game.state.speed, view.layout(), 0, { snap: true });
  shell.setActive(true);
  progress.beginRun(GAME_ID, { difficulty, daily: DAILY });
  if (!DAILY) cloud?.updateGame?.(GAME_ID, { difficulty }, { delayMs: 2000 });
  toasts.refresh();
  if (game.state.cozy) toasts.show("Tryb Przytulny — bez końca gry", { kind: "success" });
  if (DAILY) toasts.show("Wyzwanie dnia — powodzenia!", { kind: "success" });
  if (tutorial) toasts.show("Samouczek: 4 krótkie kroki. Chmura Pracu poczeka!", { kind: "info", key: "samouczek" });
  audio?.unduck?.();
  playMusic("ucieczka");
}

function finishRun() {
  if (screen !== "playing") return;
  screen = "results";
  shell.setActive(false);
  glideVoice?.stop?.(0.1);
  glideVoice = null;
  view.lockScale(false);
  hud.hide();
  splashNode.hidden = true;
  showTutorialPrompt(null);
  tutorial = null;
  audio?.stopMusic?.();
  const summary = game.summary();
  // Zadania: ukończone wymieniamy, Sowi mnożnik rośnie co 3 zadania; zapis razem z wynikiem (ten sam zapis zbiorczy).
  const taskList = tracker.list();
  const outcome = tracker.finish();
  tasksData = outcome.data;
  cloud?.updateGame?.(GAME_ID, (doc) => {
    doc.tasks = structuredClone(outcome.data);
  });
  showTasks();
  const saved = cloud?.submitRun?.(GAME_ID, {
    score: summary.score,
    distance: summary.distance,
    leaves: summary.leaves,
    difficulty: summary.difficulty,
    durationMs: summary.durationMs,
    daily: DAILY,
    seed: baseSeed(),
  });
  showDaily();
  const run = progress.endRun({
    score: summary.score,
    distance: summary.distance,
    bestChain: summary.bestCombo,
  });
  const isRecord = Boolean(saved?.newRecord);
  play(isRecord ? "rekord" : "koniec-gry");
  animator.set(isRecord ? "radosc" : "oszolomienie");
  toasts.clear();
  results.show({
    title: game.state.endReason === "chmura" ? "Chmura Pracu Cię dogoniła!" : "Koniec biegu!",
    score: summary.score,
    best: saved?.best?.bestScore ?? summary.score,
    isRecord,
    leaves: summary.leaves,
    rank: saved?.place || 0,
    tasks: [...taskList, ...(run.tasks || [])],
    extra: [
      { label: "Dystans", value: `${summary.distance.toLocaleString("pl-PL")} m` },
      { label: "Sowi mnożnik", value: `×${summary.multiplier}` },
      { label: "Najlepsze combo", value: `×${summary.bestCombo}` },
      { label: "O włos!", value: String(summary.nearMisses) },
      { label: "Idealnie!", value: String(summary.perfects) },
      { label: "Kózki", value: String(summary.goats) },
      { label: "Rejsy na humbaku", value: String(summary.bonuses) },
    ],
    messages: [
      ...(outcome.levelUp
        ? [{ text: `Sowi mnożnik ×${outcome.level}! Następny bieg liczy dystans ×${outcome.level}.` }]
        : []),
      ...(DAILY ? [{ text: "Wyzwanie dnia zapisane — jutro nowa trasa." }] : []),
      ...toasts.takeDeferred(),
    ],
  });
}

// Zdarzenia biegu → dźwięk, komunikaty, cząsteczki, SowieProgress.
const HIT_TEXT = {
  pracu: "Ojej! Pracu Pracu!",
  amic: "Twarde lądowanie w Amic!",
  dziura: "Dziura w trasie!",
};

// Komentarze sowy (ustawienie „Komentarze sowy”): najwyżej co 15 s i tylko gdy nie ma innego komunikatu.
const QUIPS = {
  start: "Skrzydła w gotowości!",
  high: "Hu-hu! Ale lot!",
  pracu: "Pracu Pracu? Nie dzisiaj!",
  golden: "Monstera zauważona!",
  beach: "Basen już blisko!",
};

function quip(text) {
  if (settings().quips === false || !game) return;
  if (game.state.time - lastQuip < 15) return;
  const current = toasts.state();
  if (current.visible.length || current.queued.length) return;
  lastQuip = game.state.time;
  play("hu-hu", { volume: 0.5 });
  toasts.show(text, { kind: "info", key: "quip", duration: 1800 });
}

// Ukończone zadanie biegu: komunikat od razu (to postęp tej gry, nie Akademii).
function tasksDone(list) {
  for (const done of list) {
    play("zakup");
    toasts.show(`Zadanie wykonane: ${done.label}`, { kind: "reward", key: `task-${done.id}`, priority: 1 });
  }
}

// „O włos!” w wariantach ze starej gry: nad Amic, obok Pracu.
function nearMissText(event) {
  if (event.family === "pracu") return "Pracu Pracu minięte!";
  if (event.family === "amic" && event.over) return "O włos nad Amic!";
  return "O włos!";
}

function handleEvents() {
  for (const event of game.takeEvents()) {
    const owl = game.state.owl;
    tutorial?.handleEvent(event);
    if (tracker && screen === "playing") tasksDone(tracker.handle(event));
    switch (event.type) {
      case "jump":
        play("skok");
        break;
      case "doubleJump":
        play("podwojny-skok");
        particles.emit(owl.x, owl.y, { count: 6, speed: 2, tint: COLORS.bialy, radius: 0.08 });
        if (owl.y < -3) quip(QUIPS.high);
        break;
      case "glideStart":
        glideVoice?.stop?.(0.05);
        glideVoice = play("szybowanie", { variation: false });
        break;
      case "glideEnd":
        glideVoice?.stop?.(0.15);
        glideVoice = null;
        break;
      case "slide":
        play("slizg");
        particles.emit(owl.x - 0.3, owl.y, { count: 5, speed: 1.5, tint: COLORS.kozaCien, radius: 0.07, angle: -2.6 });
        break;
      case "land":
        animator.land(Math.min(1, event.impact / 20));
        if (event.impact > 12) {
          play("ladowanie", { volume: 0.6 });
          particles.emit(owl.x, owl.y, { count: 5, speed: 1.4, tint: COLORS.kozaCien, radius: 0.07 });
        }
        break;
      case "leaf": {
        const name = event.kind === "zielony" ? "lisc" : `lisc-${event.kind}`;
        play(name, { pitch: event.kind === "zielony" ? 1 + (game.state.streak % 10) * 0.04 : 1 });
        particles.emit(event.x, event.y, {
          count: event.kind === "zielony" ? 4 : 10,
          speed: 2.2,
          tint:
            event.kind === "zloty" ? COLORS.zloto : event.kind === "teczowy" ? COLORS.policzki : COLORS.monsteraJasna,
          radius: 0.08,
        });
        if (event.kind !== "zielony" || event.combo > 1) {
          renderer.popup(
            `+${event.points}`,
            event.x,
            event.y - 0.3,
            event.kind === "zloty" ? COLORS.zloto : COLORS.bialy,
          );
        }
        progress.emit(EVENTS.LEAF, { kind: event.kind, count: event.count, points: event.points });
        if (event.kind === "zloty") quip(QUIPS.golden);
        if (event.combo > previousCombo) {
          toasts.show(`Combo ×${event.combo}!`, { kind: "reward", key: "combo" });
          progress.emit(EVENTS.COMBO, { value: event.combo });
        }
        previousCombo = event.combo;
        break;
      }
      case "hit":
        hitStop = 0.06;
        previousCombo = game.state.combo;
        play(event.by === "pracu" ? "trafienie-pracu" : "trafienie-amic");
        audio?.vibrate?.(30);
        if (!reducedMotion()) camera.shake(0.55);
        particles.emit(owl.x, owl.y - 0.8, { count: 10, speed: 3, tint: COLORS.zloto, radius: 0.09 });
        toasts.show(HIT_TEXT[event.by] || "Ojej!", { kind: "warn", key: "hit" });
        if (event.by === "pracu" || event.by === "amic")
          progress.emit(EVENTS.HIT, { by: event.by, variant: event.variant });
        break;
      case "nearMiss":
        play("polaczenie", { volume: 0.7 });
        renderer.popup(`${nearMissText(event)} +${event.bonus}`, owl.x + 0.4, owl.y - 1.6, COLORS.zloto, 30);
        progress.emit(EVENTS.NEAR_MISS, { by: event.family });
        if (event.family === "pracu") quip(QUIPS.pracu);
        break;
      case "perfect":
        play("lisc-zloty", { pitch: 1.25, volume: 0.8 });
        particles.emit(event.x, event.y, {
          count: 8,
          speed: 2,
          tint: COLORS.monsteraJasna,
          radius: 0.08,
          angle: -Math.PI / 2,
        });
        renderer.popup(`Idealnie! +${event.bonus}`, event.x, event.y - 1.5, COLORS.monsteraJasna, 30);
        break;
      case "warning":
        if (event.family === "pracu") play("dzwonek", { volume: 0.7 });
        break;
      case "cloudBack":
        play("zycie");
        toasts.show("Chmura Pracu się oddala!", { kind: "success", key: "chmura" });
        break;
      case "goat":
        play("koza-meee");
        play("powerup-start");
        audio?.vibrate?.(20);
        particles.emit(event.x, owl.y - 0.6, { count: 12, speed: 3, tint: COLORS.zloto, radius: 0.09 });
        renderer.popup(`+${event.bonus}`, event.x, owl.y - 1.5, COLORS.zloto);
        toasts.show(GOAT_TEXT[event.kind] || "Kózka!", { kind: "reward", key: `goat-${event.kind}` });
        progress.emit(EVENTS.GOAT, { kind: event.kind });
        if (event.kind === "sprezynka") quip(QUIPS.high);
        break;
      case "powerupEnd":
        play("powerup-koniec");
        break;
      case "shieldBreak":
        play("powerup-koniec");
        particles.emit(owl.x, owl.y - 0.6, { count: 14, speed: 3.5, tint: COLORS.niebieski, radius: 0.08 });
        toasts.show("Tarcza pękła — nic się nie stało!", { kind: "success", key: "tarcza" });
        break;
      case "smash":
        play("trafienie-amic", { volume: 0.4, pitch: 1.3 });
        particles.emit(event.x, owl.y - 0.6, { count: 10, speed: 4, tint: COLORS.pomaranczowy, radius: 0.09 });
        break;
      case "fever":
        play("goraczka-start");
        toasts.show(`Gorączka Monster! Liście ×${FEVER.multiplier}`, { kind: "reward", key: "fever" });
        progress.emit(EVENTS.FEVER, {});
        break;
      case "bubble":
        play("humbak-plusk", { volume: 0.5, pitch: 1.4 });
        particles.emit(event.x, event.y, { count: 10, speed: 2.5, tint: COLORS.wodaJasna, radius: 0.08 });
        break;
      case "bonusStart":
        play("bonus-start");
        play("humbak-plusk");
        playMusic("humbak");
        toasts.show("Rejs na humbaku! Stukaj, żeby humbak wyskakiwał", { kind: "reward", key: "bonus" });
        break;
      case "whaleJump":
        play("skok", { pitch: 0.7 });
        break;
      case "whaleSplash":
        play("humbak-plusk", { volume: 0.7 });
        particles.emit(event.x, 0, { count: 16, speed: 4, tint: COLORS.wodaJasna, radius: 0.1, spread: 1.6 });
        break;
      case "bonusEnd":
        playMusic("ucieczka");
        play("zycie");
        toasts.show(`Humbacza premia +${event.premium}`, { kind: "reward", key: "bonus" });
        progress.emit(EVENTS.WHALE, { leaves: event.leaves });
        break;
      case "biome":
        if (event.index !== 0 || event.loop > 0) {
          toasts.show(
            event.loop > 0 && event.index === 0 ? "Kolejne okrążenie — szybciej!" : BIOMES[event.index].name,
            {
              kind: "success",
              key: `biome-${event.loop}-${event.index}`,
            },
          );
        }
        if (BIOMES[event.index]?.id === "plaza") quip(QUIPS.beach);
        break;
      case "end":
        finishRun();
        break;
      default:
        break;
    }
  }
}

// ---------- Pętla ----------

// Garderoba „Ślad bąbelków” (bubbleTrail): bąbelki zostają za sową i unoszą się (jak w SowaRunner).
let bubbleTimer = 0;
function bubbleTrail(step) {
  bubbleTimer -= step;
  if (bubbleTimer > 0) return;
  bubbleTimer = 0.12;
  if (cosmetic() !== "bubbleTrail" || reducedMotion()) return;
  const owl = game.state.owl;
  particles.emit(owl.x - 0.45, owl.y - 0.55, {
    count: 1,
    speed: 0.8,
    angle: Math.PI,
    spread: 1.2,
    lifetime: 1,
    radius: 0.1,
    fall: -1.5,
    tint: COLORS.wodaJasna,
  });
}

function update(step) {
  const layout = view.layout();
  if (screen === "playing" && game) {
    if (hitStop > 0) hitStop -= step;
    else if (shell.state() === "running") {
      // Samouczek zatrzymuje grę przed przeszkodą, dopóki gracz nie wykona pokazanego ruchu.
      if (!tutorial?.frozen()) {
        game.update(step);
        handleEvents();
        if (tracker && screen === "playing") tasksDone(tracker.tick(game.state, step));
        if (!startQuip && game.state.time > 1.2 && !tutorial) {
          startQuip = true;
          quip(QUIPS.start);
        }
        bubbleTrail(step);
      }
      if (screen === "playing") tutorial?.update(game.state);
    }
    const owl = game.state.owl;
    if (game.state.bonus) animator.set(game.state.bonus.y < -0.1 ? "radosc" : "stoi");
    else if (game.state.stunned > 0) animator.set("oszolomienie");
    else if (!owl.grounded) animator.set(owl.gliding ? "szybowanie" : "skok");
    else animator.set("bieg");
    animator.update(step, { vy: owl.vy });
    camera.track(owl, game.state.speed, layout, step);
  } else {
    if (screen === "title") animator.set("stoi");
    animator.update(step);
    if (game) {
      camera.track(game.state.owl, 0.1, layout, step, {
        groundScreenY: screen === "title" ? VIEW.titleGroundScreenY : VIEW.groundScreenY,
      });
    }
  }
  camera.update(step, { reducedMotion: reducedMotion() });
  particles.update(step);
}

// Tryb diagnostyczny (?debug=1): panel w prawym dolnym rogu, odświeżany 4 razy na sekundę.
const DEBUG = params.get("debug") === "1";
const debugNode = DEBUG ? document.createElement("pre") : null;
if (debugNode) {
  debugNode.className = "ucieczka-debug";
  debugNode.setAttribute("aria-hidden", "true");
  stage.appendChild(debugNode);
}
let debugTime = 0;
let debugFrames = 0;
let perfTime = 0;
let perfFrames = 0;

function adaptResolution(dt) {
  if (screen !== "playing" || shell.state() !== "running" || tutorial?.frozen() || dt <= 0) {
    perfTime = 0;
    perfFrames = 0;
    return;
  }
  perfTime += dt;
  perfFrames += 1;
  if (perfTime < 3) return;
  const fps = perfFrames / perfTime;
  perfTime = 0;
  perfFrames = 0;
  if (fps >= 50 || Math.min(window.devicePixelRatio || 1, dprCap) <= 1) return;
  dprCap = dprCap > 1.5 ? 1.5 : 1;
  view.resize();
}

function updateDebug(dt) {
  if (!debugNode || !game) return;
  debugFrames += 1;
  debugTime += dt;
  if (debugTime < 0.25) return;
  const fps = debugFrames / debugTime;
  debugFrames = 0;
  debugTime = 0;
  const state = game.state;
  debugNode.textContent = [
    `kl./s ${fps.toFixed(0)} · DPR ${view.layout().pixelRatio} · ${screen}${tutorial ? " · samouczek" : ""}`,
    `v ${state.speed.toFixed(2)} j./s · zoom ${camera.zoom.toFixed(2)}`,
    `dystans ${Math.floor(state.distance)} m · próg ${tierAt(state.distance, state.difficulty)}`,
    `wzór ${state.patterns.at(-1) ?? "—"}`,
    `biom ${BIOMES[state.biome].name} · okrążenie ${state.loop + 1}`,
    `przeszkody ${state.obstacles.length} · liście ${state.leaves.length} · kózki ${state.goats.length}`,
    `combo ×${state.combo} · mnożnik ×${state.multiplier} · chmura ${state.cloud}`,
    `plusk ${Math.round(state.splash * 100)}%${state.bonus ? ` · rejs ${state.bonus.time.toFixed(1)} s` : ""}`,
  ].join("\n");
}

function render() {
  const now = performance.now();
  const dt = lastFrame ? Math.min(0.1, (now - lastFrame) / 1000) : 0;
  lastFrame = now;
  if (!game) return;
  adaptResolution(dt);
  updateDebug(dt);
  renderer.draw({
    state: game.state,
    animator,
    cosmetic: cosmetic(),
    particles,
    dt,
    showCloud: screen !== "title",
    reducedMotion: reducedMotion(),
  });
  if (screen === "playing") {
    const state = game.state;
    hud.setScore(state.score);
    hud.setLeaves(state.leafCount);
    hud.setLives(state.cloud, CLOUD.steps);
    const active = Object.entries(state.powerups)
      .filter(([, remaining]) => remaining > 0)
      .map(([kind, remaining]) => ({ kind, remaining, total: GOATS.duration[kind] }));
    if (state.fever > 0) active.push({ kind: "goraczka", remaining: state.fever, total: FEVER.duration });
    hud.setPowerups(active);
    updateSplash(state);
  }
}

// ---------- Gesty ----------

bindInput(stage, (gesture) => {
  if (screen !== "playing" || !game) {
    if (screen === "title" && gesture.type === "press" && gesture.source === "keyboard") startRun();
    return;
  }
  if (gesture.type === "pause" || gesture.type === "menu") {
    shell.pause("gracz");
    return;
  }
  if (shell.state() !== "running") return;
  // Samouczek: w zatrzymaniu przepuszczamy tylko pokazany ruch (przesunięcie w górę = skok).
  if (tutorial) {
    const kind =
      gesture.type === "press" || (gesture.type === "swipe" && gesture.direction === "up")
        ? "press"
        : gesture.type === "swipe" && gesture.direction === "down"
          ? "down"
          : gesture.type === "release"
            ? "release"
            : "other";
    if (!tutorial.accept(kind)) return;
  }
  if (gesture.type === "press") game.press(gesture.source === "keyboard" ? "keyboard" : "touch");
  else if (gesture.type === "release") game.release();
  else if (gesture.type === "swipe") game.swipe(gesture.direction);
});

// ---------- Start strony ----------

function resize() {
  view.resize();
  if (game) {
    camera.track(game.state.owl, game.state.speed, view.layout(), 0, {
      snap: screen !== "playing",
      groundScreenY: screen === "title" ? VIEW.titleGroundScreenY : VIEW.groundScreenY,
    });
  }
}
window.addEventListener("resize", resize);
window.visualViewport?.addEventListener?.("resize", resize);

// Scena na ekranie tytułowym: sowa na pustej łące (bieg jeszcze nie ruszył).
game = createRun({ difficulty, seed: "tytul" });
game.state.obstacles.length = 0;
resize();
camera.track(game.state.owl, 0.1, view.layout(), 0, { snap: true, groundScreenY: VIEW.titleGroundScreenY });
loop.start();

atlas
  .ensure(64 * Math.min(2, window.devicePixelRatio || 1))
  .catch((error) => console.warn("SowiaUcieczka: grafiki", error));

fetch(new URL("audio.json", AUDIO_BASE))
  .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`audio.json: ${response.status}`))))
  .then((manifest) => {
    audio = createAudio({ manifest, baseUrl: AUDIO_BASE, preloadOnUnlock: GAME_SOUNDS });
    connectAudioSettings(audio, cloud);
    audio.bindUnlock(window, { ignore: (event) => Boolean(event.target?.closest?.("a[href]")) });
  })
  .catch((error) => console.warn("SowiaUcieczka: bez dźwięku", error));

shell.onChange?.((change) => {
  if (change.state === "countdown") play(change.count > 1 ? "odliczanie" : "odliczanie-start");
  // Pauza: muzyka ciszej; po odliczaniu wraca.
  if (change.state === "paused") audio?.duck?.(0.3);
  else if (change.state === "running") audio?.unduck?.();
});

showRecord();
cloud?.ready
  ?.then(() => cloud.loadGame(GAME_ID))
  .then(() => {
    gameReady = true;
    // Pierwsze wejście (albo naprawiony stan): wylosowane zadania zapisujemy, żeby nie zmieniały się po odświeżeniu.
    const savedTasks = cloud.game(GAME_ID)?.tasks ?? null;
    tasksData = normalizeTasks(savedTasks);
    if (JSON.stringify(savedTasks) !== JSON.stringify(tasksData)) {
      cloud.updateGame(GAME_ID, (doc) => {
        doc.tasks = structuredClone(tasksData);
      });
    }
    showTasks();
    const saved = cloud.game(GAME_ID)?.difficulty;
    selectDifficulty(DIFFICULTY_ORDER.includes(saved) ? saved : difficulty, { save: false });
    document.documentElement.classList.toggle("sowie-reduced-effects", Boolean(settings().reducedEffects));
    particles.setDensity(shell.batterySaver() ? 0.4 : reducedMotion() ? 0.5 : 1);
    progress.emit(EVENTS.VISIT, { gameId: GAME_ID });
  })
  .catch((error) => console.warn("SowiaUcieczka: chmura", error));

// Dostęp dla testów e2e.
window.SowiaUcieczka = Object.freeze({
  screen: () => screen,
  ready: () => gameReady,
  state: () =>
    game ? { ...game.summary(), cloud: game.state.cloud, speed: game.state.speed, owl: { ...game.state.owl } } : null,
  start: (level) => {
    if (level) selectDifficulty(level, { save: false });
    startRun();
  },
  end: () => game?.end("gracz"),
  hit: (by = "pracu") => game?.hit(by),
  goat: (kind) => game?.giveGoat(kind),
  fillSplash: () => game?.fillSplash(),
  warp: (meters) => game?.warp(meters),
  bonus: () => (game?.state.bonus ? { ...game.state.bonus } : null),
  tasks: () => ({ ...tasksData, list: tracker && screen === "playing" ? tracker.list() : describeTasks(tasksData) }),
  seed: () => baseSeed(),
  tutorial: () => (tutorial ? tutorial.progress() : null),
  powerups: () => (game ? { ...game.state.powerups, fever: game.state.fever } : null),
  camera: () => ({ x: camera.x, y: camera.y, zoom: camera.zoom }),
  atlasReady: () => atlas.ready(),
});
