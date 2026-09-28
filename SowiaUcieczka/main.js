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
import { CLOUD, DIFFICULTIES, DIFFICULTY_ORDER, GAME_ID, VIEW } from "./config.js";
import { createRun } from "./game.js";
import { createRenderer } from "./render.js";

const cloud = window.SowieCloud;
const params = new URLSearchParams(location.search);
const AUDIO_BASE = new URL("../assets/audio/", import.meta.url).href;
const GUIDE_ID = "ucieczka";

const stage = document.querySelector("[data-stage]");
const canvas = document.querySelector("[data-canvas]");
const titleNode = document.querySelector("[data-title]");
const recordNode = document.querySelector("[data-record]");
const cozyNode = document.querySelector("[data-cozy]");
const difficultyGroup = document.querySelector("[data-difficulty]");

const view = createView({
  canvas,
  minWorld: VIEW.minWorld,
  getSize: () => {
    const rect = stage.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  },
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

const settings = () => cloud?.profile?.()?.settings || {};
const cosmetic = () => cloud?.profile?.()?.cosmetics?.selected || "none";
const reducedMotion = () =>
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) || Boolean(settings().reducedEffects);
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

// Akademia i Galeria: w trakcie biegu komunikaty czekają na ekran wyników (Analiza 2, rozdz. 4.3).
window.SowieNotifications ||= {
  toast({ title = "", detail = "", reward = "" } = {}) {
    const text = [title, detail, reward].filter(Boolean).join(" · ");
    if (inGame()) toasts.defer(text);
    else toasts.show(text, { kind: "reward", duration: 3200 });
  },
};

function play(name, options) {
  try {
    return audio?.play(name, options) || null;
  } catch (_error) {
    return null;
  }
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
    ? `Rekord (${DIFFICULTIES[difficulty].label}): ${Math.floor(best.bestScore).toLocaleString("pl-PL")} pkt · ${Math.floor(best.bestDistance || 0).toLocaleString("pl-PL")} m`
    : `Jeszcze bez rekordu na poziomie ${DIFFICULTIES[difficulty].label}.`;
}

difficultyGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-level]");
  if (button) selectDifficulty(button.dataset.level);
});
titleNode.querySelector("[data-start]").addEventListener("click", () => startRun());
titleNode.querySelector("[data-guide]").addEventListener("click", (event) => openGuide(event.currentTarget));

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

// ---------- Bieg ----------

function seedFor() {
  // Ziarno: ?seed= (testy, wyzwanie dnia) albo losowe.
  return params.get("seed") ? `${params.get("seed")}:${difficulty}` : `${Date.now()}:${Math.random()}`;
}

function startRun() {
  // Bieg dopiero po wczytaniu dokumentu gry (top 10 i rekordy dnia) — inaczej zapis nadpisałby top 10.
  if (!gameReady) return;
  results.hide();
  toasts.clear();
  renderer.clearPopups();
  particles.clear();
  game = createRun({ difficulty, seed: seedFor(), cozy: cozyEnabled() });
  screen = "playing";
  titleNode.hidden = true;
  hud.show();
  hud.setScore(0, { animate: false });
  hud.setLeaves(0);
  hud.setLives(CLOUD.steps, CLOUD.steps);
  hud.setPowerups([]);
  animator.set("bieg");
  view.lockScale(true);
  camera.track(game.state.owl, game.state.speed, view.layout(), 0, { snap: true });
  shell.setActive(true);
  progress.beginRun(GAME_ID, { difficulty, daily: params.get("daily") === "1" });
  cloud?.updateGame?.(GAME_ID, { difficulty }, { delayMs: 2000 });
  toasts.refresh();
  if (game.state.cozy) toasts.show("Tryb Przytulny — bez końca gry", { kind: "success" });
}

function finishRun() {
  if (screen !== "playing") return;
  screen = "results";
  shell.setActive(false);
  glideVoice?.stop?.(0.1);
  glideVoice = null;
  view.lockScale(false);
  hud.hide();
  const summary = game.summary();
  const saved = cloud?.submitRun?.(GAME_ID, {
    score: summary.score,
    distance: summary.distance,
    leaves: summary.leaves,
    difficulty: summary.difficulty,
    durationMs: summary.durationMs,
  });
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
    tasks: run.tasks,
    extra: [
      { label: "Dystans", value: `${summary.distance.toLocaleString("pl-PL")} m` },
      { label: "Najlepsze combo", value: `×${summary.bestCombo}` },
      { label: "O włos!", value: String(summary.nearMisses) },
    ],
    messages: toasts.takeDeferred(),
  });
}

// Zdarzenia biegu → dźwięk, komunikaty, cząsteczki, SowieProgress.
const HIT_TEXT = {
  pracu: "Ojej! Pracu Pracu!",
  amic: "Twarde lądowanie w Amic!",
  dziura: "Dziura w trasie!",
};

function handleEvents() {
  for (const event of game.takeEvents()) {
    const owl = game.state.owl;
    switch (event.type) {
      case "jump":
        play("skok");
        break;
      case "doubleJump":
        play("podwojny-skok");
        particles.emit(owl.x, owl.y, { count: 6, speed: 2, tint: COLORS.bialy, radius: 0.08 });
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
        renderer.popup(`O włos! +${event.bonus}`, owl.x + 0.4, owl.y - 1.6, COLORS.zloto, 30);
        progress.emit(EVENTS.NEAR_MISS, { by: event.family });
        break;
      case "warning":
        if (event.family === "pracu") play("dzwonek", { volume: 0.7 });
        break;
      case "cloudBack":
        play("zycie");
        toasts.show("Chmura Pracu się oddala!", { kind: "success", key: "chmura" });
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

function update(step) {
  const layout = view.layout();
  if (screen === "playing" && game) {
    if (hitStop > 0) hitStop -= step;
    else if (shell.state() === "running") {
      game.update(step);
      handleEvents();
    }
    const owl = game.state.owl;
    if (game.state.stunned > 0) animator.set("oszolomienie");
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

function render() {
  const now = performance.now();
  const dt = lastFrame ? Math.min(0.1, (now - lastFrame) / 1000) : 0;
  lastFrame = now;
  if (!game) return;
  renderer.draw({ state: game.state, animator, cosmetic: cosmetic(), particles, dt, showCloud: screen !== "title" });
  if (screen === "playing") {
    hud.setScore(game.state.score);
    hud.setLeaves(game.state.leafCount);
    hud.setLives(game.state.cloud, CLOUD.steps);
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
    audio = createAudio({ manifest, baseUrl: AUDIO_BASE });
    connectAudioSettings(audio, cloud);
    audio.bindUnlock(window, { ignore: (event) => Boolean(event.target?.closest?.("a[href]")) });
  })
  .catch((error) => console.warn("SowiaUcieczka: bez dźwięku", error));

shell.onChange?.((change) => {
  if (change.state === "countdown") play(change.count > 1 ? "odliczanie" : "odliczanie-start");
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
  camera: () => ({ x: camera.x, y: camera.y, zoom: camera.zoom }),
  atlasReady: () => atlas.ready(),
});
