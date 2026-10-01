// Sowie Tory — strona gry: Sowi Silnik (widok, pętla, gesty, powłoka telefonu), wspólny interfejs (HUD, pauza,
// wyniki, komunikaty), dźwięk, SowieProgress i zapis w chmurze (SowieCloud.submitRun, identyfikator „sowa3”).
// Po mecie planszy: finał z basenem (tapnięcie skraca go po pierwszym obejrzeniu — `finishSeen` w dokumencie gry),
// rejs „Humbacze Tory” (muzyka humbaka) i okno podsumowania planszy z gwiazdkami.
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
import { DIFFICULTIES, DIFFICULTY_ORDER, FEVER, GAME_ID, GAME_SOUNDS, GOATS, TRACK } from "./config.js";
import { GARDEN } from "./finale.js";
import { createRun } from "./game.js";
import { createRenderer } from "./render.js";
import { STAGES } from "./stages.js";
import { WHALE } from "./whale.js";

const cloud = window.SowieCloud;
const params = new URLSearchParams(location.search);
const AUDIO_BASE = new URL("../assets/audio/", import.meta.url).href;
const GUIDE_ID = GAME_ID;
// Diagnostyka i zrzuty: ?plansza=1…4 zaczyna bieg od wybranej planszy kampanii.
const START_STAGE = Math.min(STAGES.length - 1, Math.max(0, (Number.parseInt(params.get("plansza"), 10) || 1) - 1));

const stage = document.querySelector("[data-stage]");
const canvas = document.querySelector("[data-canvas]");
const titleNode = document.querySelector("[data-title]");
const recordNode = document.querySelector("[data-record]");
const cozyNode = document.querySelector("[data-cozy]");
const difficultyGroup = document.querySelector("[data-difficulty]");

// Adaptacyjna rozdzielczość płótna jak w Sowiej Ucieczce: najwyżej DPR 2, przy < 50 kl./s przez 3 s — 1,5, potem 1.
let dprCap = 2;
const view = createView({
  canvas,
  getSize: () => {
    const rect = stage.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  },
  getDpr: () => Math.min(window.devicePixelRatio || 1, dprCap),
});
const atlas = createAtlas({ catalog: SPRITES, baseUrl: SVG_BASE });
const renderer = createRenderer({ canvas, view, atlas });
const particles = createParticles({ max: 200 });
const animator = createOwlAnimator();

let audio = null;
let game = null;
let screen = "title"; // title | playing | results
let difficulty = "arcade";
let gameReady = false;
let hitStop = 0;
let summaryModal = null;
let lastLeafPopup = -1;
let previousCombo = 1;
let lastFrame = 0;
let boarHint = false;
const drag = { used: false };

const settings = () => cloud?.profile?.()?.settings || {};
const cosmetic = () => cloud?.profile?.()?.cosmetics?.selected || "none";
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
const hud = createHud({ root: stage, onPause: () => shell.pause("gracz"), maxLives: DIFFICULTIES.chill.lives });
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

// Pasek planszy: „1/4 · Biedronka” i postęp do mety.
const progressNode = document.createElement("div");
progressNode.className = "tory-progress";
progressNode.hidden = true;
progressNode.innerHTML =
  '<span data-stage-name></span><span class="tory-progress-bar" aria-hidden="true"><span></span></span>';
stage.appendChild(progressNode);
const progressName = progressNode.querySelector("[data-stage-name]");
const progressFill = progressNode.querySelector(".tory-progress-bar span");
let progressShown = "";

// W rejsie pasek pokazuje „Humbacze Tory · 0:14” i pozostały czas.
function updateProgress(state) {
  const whale = state.phase === "whale" && state.ride;
  const left = whale ? Math.max(0, WHALE.duration - state.ride.time) : 0;
  const share = whale ? left / WHALE.duration : Math.min(1, state.stageDistance / TRACK.stageLength);
  const key = `${state.stage}|${whale ? `h${Math.ceil(left)}` : ""}|${Math.round(share * 100)}`;
  if (key === progressShown) return;
  progressShown = key;
  progressNode.classList.toggle("is-whale", Boolean(whale));
  progressName.textContent = whale
    ? `Humbacze Tory · 0:${String(Math.ceil(left)).padStart(2, "0")}`
    : `${state.stage + 1}/${STAGES.length} · ${STAGES[state.stage].short}`;
  progressFill.style.transform = `scaleX(${share})`;
}

// Akademia i Galeria: w trakcie biegu komunikaty czekają na ekran wyników (Analiza 2, rozdz. 4.3).
let collectingResults = false;
window.SowieNotifications ||= {
  toast({ title = "", detail = "", reward = "" } = {}) {
    const text = [title, detail, reward].filter(Boolean).join(" · ");
    if (inGame() || collectingResults) toasts.defer(text);
    else toasts.show(text, { kind: "reward", duration: 3200 });
  },
};
progress.linkProfile({
  onMission: ({ label, rewardLabel }) =>
    window.SowieNotifications?.toast?.({ title: "Misja ukończona", detail: label, reward: `Nagroda: ${rewardLabel}` }),
});

function play(name, options) {
  try {
    return audio?.play(name, options) || null;
  } catch (_error) {
    return null;
  }
}

// Muzyka: pieśń humbaka w rejsie; przy wyłączonej muzyce pliku nie pobieramy.
const musicOn = () => settings().music !== false;
function playMusic(name) {
  if (!musicOn()) return;
  audio?.playMusic?.(name)?.catch?.(() => {});
}

// ---------- Ekran tytułowy ----------

function selectDifficulty(level, { save = true } = {}) {
  difficulty = DIFFICULTIES[level] ? level : "arcade";
  for (const button of difficultyGroup.querySelectorAll("[data-level]")) {
    button.setAttribute("aria-pressed", String(button.dataset.level === difficulty));
  }
  cozyNode.hidden = !cozyEnabled();
  showRecord();
  if (save) cloud?.updateGame?.(GAME_ID, { difficulty }, { delayMs: 2000 });
}

function showRecord() {
  if (!cloud?.isReady?.()) {
    recordNode.textContent = "Wczytuję rekordy…";
    return;
  }
  const best = cloud.records(GAME_ID, difficulty);
  recordNode.textContent = best.bestScore
    ? `Rekord (${DIFFICULTIES[difficulty].label}): ${Math.floor(best.bestScore).toLocaleString("pl-PL")} pkt`
    : `Jeszcze bez rekordu na poziomie ${DIFFICULTIES[difficulty].label}.`;
}

function openGuide(trigger) {
  openModal({
    title: `Jak grać — ${guideFor(GUIDE_ID).title}`,
    content: renderGuide(guideFor(GUIDE_ID), { atlas, sprites: SPRITES }),
    root: stage,
    className: "is-guide",
    actions: [{ label: "Rozumiem", primary: true, onClick: (close) => close() }],
    onClose: () => trigger?.focus?.({ preventScroll: true }),
  });
}

difficultyGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-level]");
  if (button) selectDifficulty(button.dataset.level);
});
titleNode.querySelector("[data-start]").addEventListener("click", () => startRun());
titleNode.querySelector("[data-guide]").addEventListener("click", (event) => openGuide(event.currentTarget));

// ---------- Bieg ----------

function seedFor() {
  const seed = params.get("seed");
  return seed ? `${seed}:${difficulty}` : `${Date.now()}:${Math.random()}`;
}

function startRun() {
  // Bieg dopiero po wczytaniu dokumentu gry (top 10) — inaczej zapis nadpisałby top 10.
  if (!gameReady) return;
  results.hide();
  toasts.clear();
  renderer.clearPopups();
  particles.clear();
  closeSummary();
  audio?.stopMusic?.();
  game = createRun({
    difficulty,
    seed: seedFor(),
    cozy: cozyEnabled(),
    startStage: START_STAGE,
    finishSeen: Boolean(cloud?.game?.(GAME_ID)?.finishSeen),
  });
  previousCombo = 1;
  boarHint = false;
  screen = "playing";
  titleNode.hidden = true;
  hud.show();
  hud.setScore(0, { animate: false });
  hud.setLeaves(0);
  hud.setLives(game.state.lives, game.state.maxLives);
  hud.setPowerups([]);
  progressNode.hidden = false;
  progressShown = "";
  animator.set("bieg");
  view.lockScale(true);
  shell.setActive(true);
  progress.beginRun(GAME_ID, { difficulty });
  cloud?.updateGame?.(GAME_ID, { difficulty }, { delayMs: 2000 });
  toasts.refresh();
  if (game.state.cozy) toasts.show("Tryb Przytulny — bez końca gry", { kind: "success" });
  audio?.unduck?.();
}

function finishRun() {
  if (screen !== "playing") return;
  screen = "results";
  closeSummary();
  audio?.stopMusic?.();
  shell.setActive(false);
  view.lockScale(false);
  hud.hide();
  progressNode.hidden = true;
  const summary = game.summary();
  const saved = cloud?.submitRun?.(GAME_ID, {
    score: summary.score,
    distance: summary.distance,
    leaves: summary.leaves,
    difficulty,
    durationMs: Math.round(game.state.time * 1000),
  });
  collectingResults = true;
  const run = progress.endRun({
    score: summary.score,
    distance: summary.distance,
    finished: summary.finished,
    bestCombo: summary.bestCombo,
  });
  collectingResults = false;
  const isRecord = Boolean(saved?.newRecord);
  play(isRecord ? "rekord" : "koniec-gry");
  animator.set(isRecord || summary.finished ? "radosc" : "oszolomienie");
  toasts.clear();
  results.show({
    title: summary.finished ? "Kampania ukończona!" : "Koniec biegu!",
    score: summary.score,
    best: saved?.best?.bestScore ?? summary.score,
    isRecord,
    leaves: summary.leaves,
    rank: saved?.place || 0,
    tasks: run.tasks || [],
    extra: [
      { label: "Plansze", value: `${summary.stages} / ${STAGES.length}` },
      { label: "Gwiazdki", value: `${summary.stars} / ${STAGES.length * 3}` },
      { label: "Dystans", value: `${summary.distance.toLocaleString("pl-PL")} m` },
      { label: "Najlepsze combo", value: `×${summary.bestCombo}` },
      { label: "O włos!", value: String(summary.nearMisses) },
      { label: "Uniki przed dzikami", value: String(summary.boarsDodged) },
      { label: "Złapane kózki", value: String(summary.goats) },
      { label: "Trafienia", value: String(summary.hits) },
    ],
    messages: toasts.takeDeferred(),
  });
}

// Podsumowanie planszy po rejsie humbaka: gwiazdki, liście, trafienia; „Dalej” — następna plansza (po ostatniej
// — wyniki kampanii). Najlepsze gwiazdki planszy trafiają do dokumentu gry (`stars.<plansza>`).
function closeSummary() {
  const modal = summaryModal;
  summaryModal = null;
  modal?.close();
}

function showStageSummary(event) {
  const stageInfo = STAGES[event.stage];
  const content = document.createElement("div");
  content.className = "tory-summary";
  const stars = document.createElement("p");
  stars.className = "tory-stars";
  stars.setAttribute("aria-label", `Gwiazdki: ${event.stars.count} z 3`);
  stars.dataset.stars = String(event.stars.count);
  for (let index = 0; index < 3; index += 1) {
    const star = document.createElement("span");
    star.textContent = "★";
    star.className = index < event.stars.count ? "is-earned" : "";
    star.setAttribute("aria-hidden", "true");
    stars.appendChild(star);
  }
  const list = document.createElement("ul");
  list.className = "tory-summary-list";
  for (const [earned, text] of [
    [true, "Plansza ukończona"],
    [event.stars.leaves, `Liście: ${event.leaves} z ${event.leafTotal} (gwiazdka od 60%)`],
    [event.stars.noHit, event.hits ? `Trafienia: ${event.hits}` : "Bez trafienia"],
  ]) {
    const item = document.createElement("li");
    item.className = earned ? "is-earned" : "";
    item.textContent = `${earned ? "★" : "☆"} ${text}`;
    list.appendChild(item);
  }
  const whale = document.createElement("li");
  whale.textContent = `Liście z Humbaczych Torów: ${event.whaleLeaves}`;
  list.appendChild(whale);
  const score = document.createElement("li");
  score.textContent = `Wynik: ${Math.floor(game.state.score).toLocaleString("pl-PL")} pkt`;
  list.appendChild(score);
  content.append(stars, list);
  cloud?.updateGame?.(GAME_ID, (doc) => {
    doc.stars = doc.stars && typeof doc.stars === "object" ? doc.stars : {};
    doc.stars[stageInfo.id] = Math.max(Number(doc.stars[stageInfo.id]) || 0, event.stars.count);
  });
  summaryModal = openModal({
    title: `${event.stage + 1}/${STAGES.length} · ${stageInfo.short} — ukończona!`,
    content,
    root: stage,
    className: "is-stage-summary",
    actions: [
      {
        label: event.last ? "Zobacz wyniki" : "Dalej",
        primary: true,
        onClick: (close) => close(),
      },
    ],
    onClose: () => {
      summaryModal = null;
      if (screen === "playing" && game?.state.phase === "stageEnd") game.nextStage();
    },
  });
}

// Zdarzenia biegu → dźwięk, komunikaty, cząsteczki, SowieProgress.
const point = { x: 0, y: 0, scale: 0 };
const GOAT_LABELS = Object.freeze({
  sprezynka: "Kózka Sprężynka — super-skok!",
  tarcza: "Kózka Tarcza — jedno trafienie gratis!",
  magnes: "Kózka Magnes — liście lecą do sowy!",
  turbo: "Kózia jazda! Koza przeskakuje wszystko",
  podwajaczka: "Kózka Podwajaczka — liście ×2!",
});
const GOAT_PITCH = Object.freeze({ sprezynka: 1.15, tarcza: 0.95, magnes: 1.05, turbo: 0.9, podwajaczka: 1.1 });

// Chipy power-upów w HUD: kózki na czas, Kózia jazda i Gorączka Monster.
function powerupList(state) {
  const list = Object.entries(state.powerups).map(([kind, remaining]) => ({
    kind,
    remaining,
    total: GOATS.duration[kind],
  }));
  if (state.riding > 0) {
    list.push({ kind: "turbo", remaining: state.riding, total: GOATS.duration.turbo, label: "Kózia jazda" });
  }
  if (state.fever > 0) list.push({ kind: "goraczka", remaining: state.fever, total: FEVER.duration });
  return list;
}

function burst(x, y, z, options) {
  const screenPoint = renderer.toScreen(x, y, z, point);
  if (!screenPoint) return;
  const ppm = screenPoint.scale;
  particles.emit(screenPoint.x, screenPoint.y, {
    ...options,
    speed: (options.speed ?? 3) * ppm,
    radius: (options.radius ?? 0.1) * ppm,
    fall: 6 * ppm,
  });
}

function handleEvents() {
  for (const event of game.takeEvents()) {
    const owl = game.state.owl;
    switch (event.type) {
      case "jump":
        play("skok");
        break;
      case "slide":
        play("slizg");
        burst(owl.x, 0.1, 0.3, { count: 5, speed: 1.5, tint: COLORS.kozaCien, radius: 0.07 });
        break;
      case "land":
        animator.land(0.6);
        break;
      case "leaf": {
        play(event.kind === "zloty" ? "lisc-zloty" : event.kind === "teczowy" ? "lisc-teczowy" : "lisc", {
          pitch: event.kind === "zielony" ? 1 + (game.state.streak % 10) * 0.04 : 1,
        });
        // Cząsteczki i napis przy sowie (liść przyciągany Magnesem leci z innego toru).
        burst(owl.x, 0.7, 0, {
          count: event.kind === "zielony" ? 4 : 10,
          speed: 2.2,
          tint: event.kind === "zloty" ? COLORS.zloto : event.kind === "teczowy" ? COLORS.fiolet : COLORS.monsteraJasna,
          radius: 0.08,
        });
        // Napis punktów: zawsze dla złotego i tęczowego, dla zwykłych przy combo / mnożniku — najwyżej co 0,25 s.
        const special = event.kind !== "zielony";
        if (special || ((event.combo > 1 || event.multiplier > 1) && game.state.time - lastLeafPopup >= 0.25)) {
          if (!special) lastLeafPopup = game.state.time;
          const at = renderer.toScreen(owl.x, 1.6, 0, point);
          if (at) renderer.popup(`+${event.points}`, at.x, at.y, event.kind === "zloty" ? COLORS.zloto : COLORS.bialy);
        }
        progress.emit(EVENTS.LEAF, { kind: event.kind, count: event.count, points: event.points });
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
        play(event.family === "pracu" ? "trafienie-pracu" : "trafienie-amic", {
          pitch: event.family === "dzik" ? 0.75 : 1,
        });
        audio?.vibrate?.(30);
        burst(owl.x, 1, 0, { count: 10, speed: 3, tint: COLORS.zloto, radius: 0.09 });
        toasts.show(event.label, { kind: "warn", key: "hit" });
        progress.emit(EVENTS.HIT, { by: event.family, variant: event.kind });
        break;
      case "nearMiss": {
        play("polaczenie", { volume: 0.7 });
        const at = renderer.toScreen(owl.x, 2.2, 0, point);
        if (at) renderer.popup(`O włos! +${event.bonus}`, at.x, at.y, COLORS.zloto, 24);
        progress.emit(EVENTS.NEAR_MISS, { by: event.family });
        break;
      }
      case "warning":
        play("dzwonek", { volume: 0.7 });
        break;
      // Pościg dzików (PRL): strzałka przy dolnej krawędzi toru, szarża, unik.
      case "boarWarning":
        play("dzwonek", { volume: 0.8, pitch: 0.6 });
        if (!boarHint) {
          boarHint = true;
          toasts.show("Dzik szarżuje! Gdy miga strzałka, zmień tor.", { kind: "warn", key: "dzik", priority: 2 });
        }
        break;
      case "boarCharge":
        play("ladowanie", { volume: 0.8, pitch: 0.7 });
        break;
      // Kózki: „meee”, +50 pkt i efekt; Turbo to tu Kózia jazda.
      case "goat": {
        const label = GOAT_LABELS[event.kind];
        play("koza-meee", { pitch: GOAT_PITCH[event.kind] ?? 1 });
        audio?.vibrate?.(20);
        burst(owl.x, 1, 0.5, { count: 12, speed: 3, tint: COLORS.koza, radius: 0.09 });
        const at = renderer.toScreen(owl.x, 2.2, 0, point);
        if (at) renderer.popup(`+${event.bonus}`, at.x, at.y, COLORS.zloto, 24);
        toasts.show(label, { kind: "reward", key: "kozka", priority: 1 });
        progress.emit(EVENTS.GOAT, { kind: event.kind });
        break;
      }
      case "spring":
        play("skok", { pitch: 1.25 });
        break;
      case "powerupStart":
      case "rideStart":
        play("powerup-start");
        break;
      case "rideHop":
        play("skok", { pitch: 0.85, volume: 0.6 });
        break;
      case "powerupEnd":
      case "rideEnd":
        play("powerup-koniec");
        break;
      case "shield":
        play("polaczenie", { pitch: 1.2 });
        burst(owl.x, 1, 0, { count: 14, speed: 3.5, tint: COLORS.niebieski, radius: 0.09 });
        toasts.show("Tarcza pękła — nic się nie stało!", { kind: "success", key: "tarcza" });
        break;
      case "life":
        play("zycie");
        toasts.show("Dodatkowe życie!", { kind: "reward", key: "zycie" });
        progress.emit(EVENTS.LIFE, {});
        break;
      case "lifeBonus": {
        play("zycie", { pitch: 1.2 });
        const at = renderer.toScreen(owl.x, 2.2, 0, point);
        if (at) renderer.popup(`Maks żyć: +${event.bonus} pkt`, at.x, at.y, COLORS.zloto, 22);
        break;
      }
      case "fever":
        play("goraczka-start");
        toasts.show(`Gorączka Monster! Liście ×${event.multiplier}`, { kind: "reward", key: "fever", priority: 1 });
        progress.emit(EVENTS.FEVER, {});
        break;
      case "boarDodge": {
        play("polaczenie", { volume: 0.7, pitch: 0.9 });
        const at = renderer.toScreen(owl.x, 2.2, 0, point);
        if (at) renderer.popup(`Unik przed dzikiem! +${event.bonus}`, at.x, at.y, COLORS.zloto, 22);
        break;
      }
      case "stage":
        if (event.stage > 0 || screen === "playing") {
          toasts.show(`Plansza ${event.stage + 1}: ${STAGES[event.stage].name}`, {
            kind: "success",
            key: `stage-${event.stage}`,
          });
        }
        break;
      // Meta: działka z basenem, sowa wskakuje do wody i zmienia się w humbaka.
      case "finish":
        play("zycie");
        toasts.show(
          event.seen
            ? `Meta! +${event.bonus} · Stuknij, żeby pominąć finał`
            : `Meta: ogród działkowy z basenem! +${event.bonus}`,
          // Krótko: znika przed przemianą w humbaka (w poziomie komunikat leży nad basenem).
          { kind: "reward", key: `meta-${event.stage}`, priority: 2, duration: 1800 },
        );
        break;
      case "finaleJump":
        play("skok");
        break;
      case "finaleSplash":
        play("humbak-plusk");
        burst(0, GARDEN.water, GARDEN.poolZ, { count: 18, speed: 3.5, tint: COLORS.wodaJasna, radius: 0.1 });
        break;
      case "finaleMorph":
        play("humbak-piesn", { volume: 0.8 });
        break;
      case "finishSeen":
        cloud?.updateGame?.(GAME_ID, { finishSeen: true });
        break;
      // Humbacze Tory: 20 s rejsu, przesunięcia zmieniają tor, w górę — wyskok; bez obrażeń.
      case "whaleStart":
        play("bonus-start");
        playMusic("humbak");
        toasts.show("Humbacze Tory! Przesuwaj palcem: tor i wyskok do kółek", {
          kind: "reward",
          key: "humbak",
          priority: 2,
        });
        break;
      case "whaleLeap":
        play("skok", { pitch: 0.7 });
        break;
      case "whaleSplash":
        play("humbak-plusk", { volume: 0.7 });
        burst(game.state.ride.x, 0.1, 0.4, { count: 12, speed: 3, tint: COLORS.wodaJasna, radius: 0.09 });
        break;
      case "whaleLeaf": {
        play(event.kind === "zloty" ? "lisc-zloty" : "lisc");
        const ride = game.state.ride;
        burst(ride.x, ride.y + 0.6, 0.4, {
          count: event.kind === "zloty" ? 10 : 5,
          speed: 2.2,
          tint: event.kind === "zloty" ? COLORS.zloto : COLORS.monsteraJasna,
          radius: 0.08,
        });
        const at = renderer.toScreen(ride.x, ride.y + 1.8, 0.4, point);
        if (at) renderer.popup(`+${event.points}`, at.x, at.y, event.kind === "zloty" ? COLORS.zloto : COLORS.bialy);
        progress.emit(EVENTS.LEAF, { kind: event.kind, count: event.count, points: event.points });
        break;
      }
      case "whaleEnd":
        audio?.stopMusic?.();
        progress.emit(EVENTS.WHALE, { leaves: event.leaves });
        break;
      case "stageEnd":
        play("zycie");
        showStageSummary(event);
        break;
      case "over":
        finishRun();
        break;
      default:
        break;
    }
  }
}

// ---------- Pętla ----------

function update(step) {
  if (screen === "playing" && game) {
    if (hitStop > 0) hitStop -= step;
    else if (shell.state() === "running") {
      game.update(step);
      handleEvents();
    }
    const owl = game.state.owl;
    const phase = game.state.phase;
    if (phase === "finale") animator.set(game.state.finale?.phase === "run" ? "bieg" : "skok");
    else if (phase === "whale" || phase === "stageEnd") animator.set("radosc");
    else if (!owl.grounded) animator.set("skok");
    else animator.set("bieg");
    animator.update(step, { vy: -owl.vy });
  } else {
    if (screen === "title") animator.set("stoi");
    animator.update(step);
  }
  particles.update(step);
}

// Tryb diagnostyczny (?debug=1).
const DEBUG = params.get("debug") === "1";
const debugNode = DEBUG ? document.createElement("pre") : null;
if (debugNode) {
  debugNode.className = "tory-debug";
  debugNode.setAttribute("aria-hidden", "true");
  stage.appendChild(debugNode);
}
let debugTime = 0;
let debugFrames = 0;
let perfTime = 0;
let perfFrames = 0;

function adaptResolution(dt) {
  if (screen !== "playing" || shell.state() !== "running" || dt <= 0) {
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
    `kl./s ${fps.toFixed(0)} · DPR ${view.layout().pixelRatio} · ${screen}`,
    `v ${state.speed.toFixed(1)} m/s · plansza ${state.stage + 1} · ${Math.floor(state.stageDistance)} m`,
    `wzór ${state.patterns.at(-1) ?? "—"}`,
    `tor ${state.owl.lane} · przeszkody ${state.obstacles.length} · liście ${state.leaves.length}`,
    `combo ×${state.combo} · życia ${state.lives}`,
  ].join("\n");
}

function render() {
  const now = performance.now();
  const dt = lastFrame ? Math.min(0.1, (now - lastFrame) / 1000) : 0;
  lastFrame = now;
  if (!game) return;
  adaptResolution(dt);
  updateDebug(dt);
  renderer.draw({ state: game.state, animator, cosmetic: cosmetic(), particles, dt });
  if (screen === "playing") {
    const state = game.state;
    hud.setScore(state.score);
    hud.setLeaves(state.leafCount);
    hud.setLives(state.lives, state.maxLives);
    hud.setPowerups(powerupList(state));
    updateProgress(state);
  }
}

// ---------- Gesty ----------

// Przesunięcie palcem: ←/→ tor, ↑ skok, ↓ ślizg. Wolniejsze przesunięcie (przeciąganie) też działa — raz na dotyk.
// Stuknięcie: lewa i prawa część ekranu zmieniają tor, środek — skok. Martwe strefy przy krawędziach (gest „cofnij”).
function steer(direction) {
  game.input(direction);
}

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
  // Finał z basenem: stuknięcie (albo klawisz) skraca go — tylko po pierwszym pełnym obejrzeniu.
  if (game.state.phase === "finale") {
    if (gesture.type === "tap" || (gesture.type === "press" && gesture.source === "keyboard")) game.skipFinale();
    return;
  }
  if (game.state.phase !== "run" && game.state.phase !== "whale") return;
  if (gesture.type === "press" && gesture.source === "keyboard") steer("up");
  else if (gesture.type === "swipe") {
    drag.used = true;
    steer(gesture.direction);
  } else if (gesture.type === "dragstart") drag.used = false;
  else if (gesture.type === "drag" && !drag.used && Math.hypot(gesture.dx, gesture.dy) >= 36) {
    drag.used = true;
    steer(
      Math.abs(gesture.dx) >= Math.abs(gesture.dy)
        ? gesture.dx > 0
          ? "right"
          : "left"
        : gesture.dy > 0
          ? "down"
          : "up",
    );
  } else if (gesture.type === "tap") {
    const width = stage.getBoundingClientRect().width;
    steer(gesture.x < width * 0.33 ? "left" : gesture.x > width * 0.67 ? "right" : "up");
  }
});

// ---------- Start strony ----------

function resize() {
  view.resize();
}
window.addEventListener("resize", resize);
window.visualViewport?.addEventListener?.("resize", resize);

// Scena na ekranie tytułowym: sowa na pustej alejce sklepu (bieg jeszcze nie ruszył).
game = createRun({ difficulty, seed: "tytul" });
resize();
loop.start();

atlas
  .ensure(
    Math.min(220, renderer.layout().focal / renderer.layout().cameraBack) * Math.min(2, window.devicePixelRatio || 1),
  )
  .catch((error) => console.warn("SowieTory: grafiki", error));

fetch(new URL("audio.json", AUDIO_BASE))
  .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`audio.json: ${response.status}`))))
  .then((manifest) => {
    audio = createAudio({ manifest, baseUrl: AUDIO_BASE, preloadOnUnlock: GAME_SOUNDS });
    connectAudioSettings(audio, cloud);
    audio.bindUnlock(window, { ignore: (event) => Boolean(event.target?.closest?.("a[href]")) });
  })
  .catch((error) => console.warn("SowieTory: bez dźwięku", error));

shell.onChange?.((change) => {
  if (change.state === "countdown") play(change.count > 1 ? "odliczanie" : "odliczanie-start");
  if (change.state === "paused") audio?.duck?.(0.3);
  else if (change.state === "running") audio?.unduck?.();
});

showRecord();
cloud?.ready
  ?.then(() => cloud.loadGame(GAME_ID))
  .then(() => {
    gameReady = true;
    const saved = cloud.game(GAME_ID)?.difficulty;
    selectDifficulty(DIFFICULTY_ORDER.includes(saved) ? saved : difficulty, { save: false });
    document.documentElement.classList.toggle("sowie-reduced-effects", Boolean(settings().reducedEffects));
    particles.setDensity(shell.batterySaver() ? 0.4 : reducedMotion() ? 0.5 : 1);
    progress.emit(EVENTS.VISIT, { gameId: GAME_ID });
  })
  .catch((error) => console.warn("SowieTory: chmura", error));

// Dostęp dla testów e2e.
window.SowieTory = Object.freeze({
  screen: () => screen,
  ready: () => gameReady,
  atlasReady: () => atlas.ready(),
  state: () =>
    game
      ? {
          ...game.summary(),
          phase: game.state.phase,
          speed: game.state.speed,
          lives: game.state.lives,
          stageDistance: game.state.stageDistance,
          stageIndex: game.state.stage,
          boars: game.state.boars.map((item) => ({ lane: item.lane, phase: item.phase, z: item.z })),
          finishSeen: game.state.finishSeen,
          finale: game.state.finale ? { phase: game.state.finale.phase, t: game.state.finale.t } : null,
          powerups: { ...game.state.powerups },
          riding: game.state.riding,
          fever: game.state.fever,
          goats: game.state.goatCount,
          ride: game.state.ride
            ? {
                lane: game.state.ride.lane,
                y: game.state.ride.y,
                airborne: game.state.ride.airborne,
                time: game.state.ride.time,
                collected: game.state.ride.collected,
              }
            : null,
          owl: { ...game.state.owl },
        }
      : null,
  start: (level) => {
    if (level) selectDifficulty(level, { save: false });
    startRun();
  },
  end: () => game?.end("gracz"),
  warp: (meters) => game?.warp(meters),
  goat: (kind) => game?.giveGoat(kind),
  fever: () => game?.giveFever(),
  extras: () =>
    game
      ? {
          goats: game.state.goats
            .filter((item) => !item.taken)
            .map((item) => ({ kind: item.kind, lanes: [...item.lanes], z: item.at - game.state.stageDistance })),
          hearts: game.state.hearts
            .filter((item) => !item.taken)
            .map((item) => ({ lane: item.lane, z: item.at - game.state.stageDistance })),
        }
      : null,
  obstacles: () =>
    game
      ? game.state.obstacles.map((item) => ({
          kind: item.kind,
          lane: item.lane,
          z: item.at - game.state.stageDistance,
        }))
      : [],
});
