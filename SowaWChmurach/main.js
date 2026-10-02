// Sowa w Chmurach — strona gry: Sowi Silnik (widok, pętla, gesty, powłoka telefonu), wspólny interfejs (HUD,
// pauza, wyniki, komunikaty), dźwięk, SowieProgress i zapis w chmurze (SowieCloud.submitRun, identyfikator
// „jumper”: wynik i wysokość). Sterowanie: przeciąganie palcem w bok w dowolnym miejscu planszy (ruch względny),
// klawisze ←/→/A/D.
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
import { DIFFICULTIES, FEVER, GAME_ID, GAME_SOUNDS, GOATS, HAZARDS, OCEAN, WORLD, ZONES } from "./config.js";
import { createRun } from "./game.js";
import { createRenderer } from "./render.js";
import { sideAngle, tiltSpeed } from "./tilt.js";

const cloud = window.SowieCloud;
const params = new URLSearchParams(location.search);
const AUDIO_BASE = new URL("../assets/audio/", import.meta.url).href;
// Instrukcja: na razie przewodnik obecnej gry (shared/meta/guides-data.js, klucz „jumper”).
const GUIDE_ID = GAME_ID;

const stage = document.querySelector("[data-stage]");
const canvas = document.querySelector("[data-canvas]");
const titleNode = document.querySelector("[data-title]");
const recordNode = document.querySelector("[data-record]");
const cozyNode = document.querySelector("[data-cozy]");
const difficultyGroup = document.querySelector("[data-difficulty]");
const tiltButton = document.querySelector("[data-tilt]");
const tiltNote = document.querySelector("[data-tilt-note]");

// Adaptacyjna rozdzielczość płótna: najwyżej DPR 2, przy < 50 kl./s przez 3 s — 1,5, potem 1.
let dprCap = 2;
const view = createView({
  canvas,
  minWorld: { width: WORLD.width, height: WORLD.minVisible },
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
let lastFrame = 0;
let lastDragX = 0;
let lastLeafPopup = -1;

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
  endAction: { label: "Zakończ lot", visible: () => Boolean(game?.state.cozy), onClick: () => game?.end("gracz") },
});
const results = createResults({ root: stage, onAgain: () => startRun(), onMenu: () => location.assign("../") });

// Pasek wysokości: „123 m · Ogródek” i postęp do następnej strefy.
const heightNode = document.createElement("div");
heightNode.className = "chmury-height";
heightNode.hidden = true;
heightNode.innerHTML =
  '<span data-height></span><span class="chmury-height-bar" aria-hidden="true"><span></span></span>';
stage.appendChild(heightNode);
const heightText = heightNode.querySelector("[data-height]");
const heightFill = heightNode.querySelector(".chmury-height-bar span");
let heightShown = "";

// W Niebiańskim Oceanie pasek pokazuje „Niebiański Ocean · 0:14” i pozostały czas (klasa `is-ocean`).
function updateHeight(state) {
  const ocean = state.phase === "ocean" && state.ocean;
  const left = ocean ? Math.max(0, OCEAN.duration - state.ocean.bonus.state.time) : 0;
  const meters = Math.floor(state.height);
  const zone = ZONES[state.zone];
  const next = ZONES[state.zone + 1];
  const share = ocean ? left / OCEAN.duration : next ? (state.height - zone.from) / (next.from - zone.from) : 1;
  const key = ocean
    ? `o${Math.ceil(left)}|${Math.round(share * 100)}`
    : `${meters}|${state.zone}|${Math.round(share * 100)}`;
  if (key === heightShown) return;
  heightShown = key;
  heightNode.classList.toggle("is-ocean", Boolean(ocean));
  heightText.textContent = ocean
    ? `Niebiański Ocean · 0:${String(Math.ceil(left)).padStart(2, "0")}`
    : `${meters.toLocaleString("pl-PL")} m · ${zone.name}`;
  heightFill.style.transform = `scaleX(${Math.min(1, Math.max(0, share))})`;
}

// Akademia i Galeria: w trakcie lotu komunikaty czekają na ekran wyników (Analiza 2, rozdz. 4.3).
let collectingResults = false;
window.SowieNotifications ||= {
  notify(message) {
    if (screen === "playing" || collectingResults) toasts.defer(message);
    else toasts.show(message);
  },
};
progress.linkProfile?.(cloud);

function play(name, options) {
  try {
    return audio?.play(name, options) || null;
  } catch (_error) {
    return null;
  }
}

// Muzyka: pieśń humbaka w Niebiańskim Oceanie; przy wyłączonej muzyce pliku nie pobieramy.
const musicOn = () => settings().music !== false;
function playMusic(name) {
  if (!musicOn()) return;
  audio?.playMusic?.(name)?.catch?.(() => {});
}

// ---------- Przechylanie telefonu ----------

// Opcja gry (zapis `sowiegry_gry/jumper.tilt`), tylko na telefonach z czujnikiem orientacji. iPhone wymaga zgody
// (`DeviceOrientationEvent.requestPermission`) — o nią pytamy wyłącznie po stuknięciu (przełącznik albo Start).
const tiltSupported =
  typeof window.DeviceOrientationEvent !== "undefined" && Boolean(window.matchMedia?.("(pointer: coarse)")?.matches);
const tiltNeedsPermission = tiltSupported && typeof window.DeviceOrientationEvent.requestPermission === "function";
let tiltOn = false;
let tiltGranted = !tiltNeedsPermission;
// Ostatni kąt przechyłu w bok (°); null — czujnik jeszcze nic nie przysłał.
let tiltAngle = null;

function onOrientation(event) {
  if (event.gamma == null && event.beta == null) return;
  const angle = window.screen?.orientation?.angle ?? (Number(window.orientation) || 0);
  tiltAngle = sideAngle(event, angle);
}

async function requestTilt() {
  if (!tiltNeedsPermission) return true;
  try {
    tiltGranted = (await window.DeviceOrientationEvent.requestPermission()) === "granted";
  } catch {
    tiltGranted = false;
  }
  return tiltGranted;
}

function setTiltOn(value, { save = true } = {}) {
  tiltOn = value;
  if (value) window.addEventListener("deviceorientation", onOrientation);
  else {
    window.removeEventListener("deviceorientation", onOrientation);
    tiltAngle = null;
  }
  tiltButton.setAttribute("aria-pressed", String(value));
  tiltButton.textContent = value ? "Przechylanie: włączone" : "Przechylanie: wyłączone";
  if (save) cloud?.updateGame?.(GAME_ID, { tilt: value }, { delayMs: 2000 });
}

tiltButton.hidden = !tiltSupported;
tiltButton.addEventListener("click", async () => {
  if (tiltOn) {
    setTiltOn(false);
    return;
  }
  if (!(await requestTilt())) {
    tiltNote.textContent = "Bez zgody na czujnik ruchu — steruj palcem.";
    tiltNote.hidden = false;
    return;
  }
  tiltNote.hidden = true;
  setTiltOn(true);
});

// ---------- Ekran tytułowy ----------

function selectDifficulty(level, { save = true } = {}) {
  if (!DIFFICULTIES[level]) return;
  difficulty = level;
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
  const label = DIFFICULTIES[difficulty].label;
  recordNode.textContent = best.bestHeight
    ? `Rekord (${label}): ${Math.floor(best.bestHeight).toLocaleString("pl-PL")} m · ${Math.floor(best.bestScore || 0).toLocaleString("pl-PL")} pkt`
    : `Jeszcze bez rekordu: ${label}.`;
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
titleNode.querySelector("[data-start]").addEventListener("click", () => {
  // Zapisane przechylanie na iPhonie: zgoda w geście Startu (po przeładowaniu strony trzeba zapytać ponownie).
  if (tiltOn && !tiltGranted) requestTilt();
  startRun();
});
titleNode.querySelector("[data-guide]").addEventListener("click", (event) => openGuide(event.currentTarget));

// ---------- Lot ----------

function seedFor() {
  const seed = params.get("seed");
  return seed ? `${seed}:${difficulty}` : `${Date.now()}:${Math.random()}`;
}

function startRun() {
  // Lot dopiero po wczytaniu dokumentu gry (top 10) — inaczej zapis nadpisałby top 10.
  if (!gameReady) return;
  results.hide();
  toasts.clear();
  renderer.clearPopups();
  particles.clear();
  audio?.stopMusic?.();
  game = createRun({ difficulty, seed: seedFor(), cozy: cozyEnabled() });
  canisterHint = false;
  screen = "playing";
  titleNode.hidden = true;
  hud.show();
  hud.setScore(0, { animate: false });
  hud.setLeaves(0);
  hud.setLives(game.state.lives, game.state.maxLives);
  hud.setPowerups([]);
  heightNode.hidden = false;
  heightShown = "";
  animator.set("skok");
  view.lockScale(true);
  shell.setActive(true);
  progress.beginRun(GAME_ID, { difficulty });
  cloud?.updateGame?.(GAME_ID, { difficulty }, { delayMs: 2000 });
  toasts.refresh();
  toasts.show(game.state.cozy ? "Tryb Przytulny — bez końca gry" : "Leć wysoko!", { kind: "success" });
  audio?.unduck?.();
}

function finishRun() {
  if (screen !== "playing") return;
  screen = "results";
  audio?.stopMusic?.();
  shell.setActive(false);
  view.lockScale(false);
  hud.hide();
  heightNode.hidden = true;
  const summary = game.summary();
  const saved = cloud?.submitRun?.(GAME_ID, {
    score: summary.score,
    height: summary.height,
    leaves: summary.leaves,
    difficulty,
    durationMs: Math.round(game.state.time * 1000),
  });
  collectingResults = true;
  const run = progress.endRun({
    score: summary.score,
    height: summary.height,
    bestStreak: summary.bestStreak,
    bestCombo: summary.bestCombo,
  });
  collectingResults = false;
  const isRecord = Boolean(saved?.newRecord);
  play(isRecord ? "rekord" : "koniec-gry");
  animator.set(isRecord ? "radosc" : "oszolomienie");
  toasts.clear();
  results.show({
    title: "Koniec lotu!",
    score: summary.score,
    best: saved?.best?.bestScore ?? summary.score,
    isRecord,
    leaves: summary.leaves,
    rank: saved?.place || 0,
    tasks: run.tasks || [],
    extra: [
      { label: "Wysokość", value: `${summary.height.toLocaleString("pl-PL")} m` },
      {
        label: "Rekord wysokości",
        value: `${Math.max(summary.height, saved?.best?.bestHeight || 0).toLocaleString("pl-PL")} m`,
      },
      { label: "Strefa", value: ZONES.find((zone) => zone.id === summary.zone)?.name || "" },
      { label: "Najlepsze combo", value: `×${summary.bestCombo}` },
      { label: "Idealne lądowania", value: `${summary.perfects} (seria ${summary.bestStreak})` },
      { label: "Przebite Pracu", value: String(summary.stomps) },
      { label: "Złapane kózki", value: String(summary.goats) },
      { label: "Niebiański Ocean", value: String(summary.oceans) },
      { label: "Trafienia", value: String(summary.hits) },
      { label: "Ratunki kózki", value: String(summary.rescues) },
    ],
    messages: toasts.takeDeferred(),
  });
}

// Komunikaty trafień (Pracu — tekst z obecnej gry).
const HIT_TEXT = Object.freeze({
  dymek: "Pracu Pracu zbiło rytm!",
  mail: "Rój maili! Pracu Pracu zbiło rytm!",
  telefon: "Telefon od Pracu Pracu! Zbiło rytm!",
  sterowiec: "Sterowiec Amic! Omijaj go z daleka.",
  kanister: "Kanister Amic spadł na sowę!",
  tablica: "Tablica cen Amic na drodze!",
});
let canisterHint = false;

// Komunikaty kózek (złapanie = moc).
const GOAT_TEXT = Object.freeze({
  sprezynka: "Kózka Sprężynka — wystrzał w górę!",
  tarcza: "Kózka Tarcza — jedno trafienie gratis!",
  magnes: "Kózka Magnes — liście lecą do sowy!",
  turbo: "Rakietka! Kózka niesie sowę w górę",
  podwajaczka: "Kózka Podwajaczka — liście ×2!",
});

// Chipy mocy w HUD: moce na czas, Rakietka (rodzaj „turbo” z etykietą) i Gorączka.
function powerupList(state) {
  const list = Object.entries(state.powerups).map(([kind, remaining]) => ({
    kind,
    remaining,
    total: GOATS.duration[kind],
  }));
  if (state.rocket > 0) {
    list.push({ kind: "turbo", remaining: state.rocket, total: GOATS.duration.turbo, label: "Rakietka" });
  }
  if (state.fever > 0) list.push({ kind: "goraczka", remaining: state.fever, total: FEVER.duration });
  return list;
}

// Cząsteczki w świecie (oś y w dół w rysowaniu: y ekranu = −wysokość).
function burst(x, y, options = {}) {
  particles.emit(x, -y, { speed: 3, radius: 0.09, fall: 6, ...options });
}

function handleEvents() {
  for (const event of game.takeEvents()) {
    switch (event.type) {
      case "bounce":
        if (event.platform === "lisc") {
          play("podwojny-skok");
          renderer.popup(`Sprężysty liść! +${event.points}`, event.x, event.y + 1.4, COLORS.monsteraJasna, 20);
          burst(event.x, event.y, { count: 8, tint: COLORS.monsteraJasna });
        } else {
          play("skok", { volume: 0.35, pitch: event.platform === "chmurka" ? 1.2 : 1 });
          burst(event.x, event.y, { count: 4, speed: 2, tint: COLORS.nieboDol, angle: -Math.PI / 2, spread: 2 });
        }
        break;
      case "perfect":
        renderer.popup(`Idealnie! +${event.bonus}`, game.state.owl.x, game.state.owl.y + 1.6, COLORS.zloto, 18);
        break;
      case "puff":
        play("polaczenie", { volume: 0.5, pitch: 1.3 });
        burst(event.x, event.y, { count: 10, tint: COLORS.bialy, radius: 0.14 });
        break;
      case "crack":
        play("ladowanie", { pitch: 0.6 });
        toasts.show("Krucha gałązka!", { kind: "info", key: "krucha", duration: 1200 });
        burst(event.x, event.y, { count: 6, tint: "#7a4a2e" });
        break;
      case "balcony":
        play("zycie", { volume: 0.6 });
        toasts.show("Balkon — chwila oddechu ☕", { kind: "success", key: "balkon" });
        break;
      case "leaf": {
        if (event.kind === "teczowy") play("lisc-teczowy");
        else play(event.kind === "zloty" ? "lisc-zloty" : "lisc", { pitch: 1 + Math.min(4, event.combo - 1) * 0.05 });
        burst(event.x, event.y, {
          count: event.kind === "zloty" ? 10 : 5,
          tint: event.kind === "zloty" ? COLORS.zloto : COLORS.monsteraJasna,
        });
        const now = game.state.time;
        if (event.kind !== "zielony" || now - lastLeafPopup > 0.25) {
          lastLeafPopup = now;
          renderer.popup(
            `+${event.points}`,
            event.x,
            event.y + 0.5,
            event.kind === "zloty" ? COLORS.zloto : COLORS.bialy,
          );
        }
        progress.emit(EVENTS.LEAF, { kind: event.kind, count: event.count, points: event.points });
        break;
      }
      case "combo":
        toasts.show(`Combo ×${event.combo}!`, { kind: "reward", key: "combo" });
        progress.emit(EVENTS.COMBO, { value: event.combo });
        break;
      case "zone":
        play("hu-hu");
        toasts.show(`Strefa: ${event.name}!`, { kind: "reward", key: `strefa-${event.id}`, priority: 1 });
        break;
      // Pracu zdeptany z góry: punkty i wybicie.
      case "stomp": {
        play("podwojny-skok");
        play("polaczenie", { volume: 0.5, pitch: 0.8 });
        const text =
          event.kind === "telefon"
            ? "Telefon wyciszony!"
            : event.kind === "mail"
              ? "Mail usunięty!"
              : "Pracu przebity!";
        renderer.popup(`${text} +${event.points}`, event.x, event.y + 0.8, COLORS.zloto, 20);
        burst(event.x, event.y, { count: 12, tint: COLORS.pracu, radius: 0.1 });
        break;
      }
      case "hit":
        play(event.family === "pracu" ? "trafienie-pracu" : "trafienie-amic");
        audio?.vibrate?.(30);
        burst(game.state.owl.x, game.state.owl.y + 0.6, { count: 10, tint: COLORS.policzki });
        toasts.show(HIT_TEXT[event.kind] || "Auć!", { kind: "warn", key: "trafienie", priority: 2 });
        progress.emit(EVENTS.HIT, { by: event.family, variant: event.kind });
        break;
      case "warning":
        play("dzwonek", { volume: 0.6 });
        if (!canisterHint) {
          canisterHint = true;
          toasts.show("Kanister Amic! Uciekaj spod pomarańczowego znacznika.", { kind: "warn", key: "kanister" });
        }
        break;
      case "goat":
        play("koza-meee", { pitch: event.kind === "turbo" ? 0.9 : 1.1 });
        audio?.vibrate?.(20);
        burst(event.x, event.y + 0.6, { count: 12, tint: COLORS.zloto, radius: 0.1 });
        renderer.popup(`+${event.bonus}`, event.x, event.y + 1.6, COLORS.zloto);
        toasts.show(GOAT_TEXT[event.kind], { kind: "reward", key: "kozka", priority: 1 });
        progress.emit(EVENTS.GOAT, { kind: event.kind });
        break;
      case "spring":
        play("podwojny-skok", { pitch: 1.2 });
        break;
      case "rocketStart":
      case "powerupStart":
        play(event.type === "rocketStart" ? "bonus-start" : "powerup-start");
        break;
      case "rocketEnd":
      case "powerupEnd":
        play("powerup-koniec");
        break;
      case "shield":
        play("polaczenie");
        burst(game.state.owl.x, game.state.owl.y + 0.6, { count: 14, tint: COLORS.niebieski, radius: 0.1 });
        toasts.show("Tarcza pękła — nic się nie stało!", { kind: "success", key: "tarcza", priority: 2 });
        break;
      case "life":
        play("zycie");
        toasts.show("Dodatkowe życie!", { kind: "success", key: "zycie" });
        progress.emit(EVENTS.LIFE, {});
        break;
      case "lifeBonus":
        play("zycie", { pitch: 1.2 });
        renderer.popup(`Maks żyć: +${event.bonus} pkt`, event.x, event.y + 0.6, COLORS.serce, 20);
        break;
      case "fever":
        play("goraczka-start");
        toasts.show("Tęczowa monstera! Gorączka Monster — liście ×2 🌿", {
          kind: "reward",
          key: "goraczka",
          priority: 2,
        });
        progress.emit(EVENTS.FEVER, {});
        break;
      // Niebiański Ocean: 20 s na grzbietach humbaków w chmurach.
      case "oceanStart":
        play("bonus-start");
        play("humbak-piesn", { volume: 0.8 });
        playMusic("humbak");
        toasts.show("Niebiański Ocean! Odbijaj się od humbaków i zbieraj liście", {
          kind: "reward",
          key: "ocean",
          priority: 2,
        });
        break;
      case "oceanBounce":
        play("humbak-plusk", { volume: 0.5 });
        burst(event.x, event.y, { count: 8, tint: COLORS.wodaJasna, radius: 0.1 });
        break;
      case "oceanFloor":
        play("ladowanie", { volume: 0.4, pitch: 1.3 });
        break;
      case "oceanLeaf":
        play(event.kind === "zloty" ? "lisc-zloty" : "lisc");
        burst(event.x, event.y, { count: 5, tint: event.kind === "zloty" ? COLORS.zloto : COLORS.monsteraJasna });
        renderer.popup(
          `+${event.points}`,
          event.x,
          event.y + 0.5,
          event.kind === "zloty" ? COLORS.zloto : COLORS.bialy,
        );
        progress.emit(EVENTS.LEAF, { kind: event.kind, count: event.count, points: event.points });
        break;
      case "oceanEnd":
        audio?.stopMusic?.();
        play("humbak-plusk");
        toasts.show(`Koniec oceanu · liście: ${event.leaves}`, { kind: "success", key: "ocean-koniec" });
        progress.emit(EVENTS.WHALE, { leaves: event.leaves });
        break;
      case "rescue":
        play("koza-meee");
        audio?.vibrate?.(30);
        toasts.show("Ojej! Kózka łapie sowę — następna gałązka będzie moja!", {
          kind: "warn",
          key: "ratunek",
          priority: 2,
        });
        break;
      case "rescued":
        play("ladowanie");
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
    if (shell.state() === "running") {
      game.setKeys(input.isKeyDown("left"), input.isKeyDown("right"));
      game.setTilt(tiltOn && tiltAngle !== null ? tiltSpeed(tiltAngle) : null);
      game.update(step);
      handleEvents();
    }
    const owl = game.state.owl;
    if (game.state.phase === "rescue") animator.set("oszolomienie");
    else if (game.state.phase === "ocean") animator.set(owl.vy > 0 ? "radosc" : "szybowanie");
    else animator.set(owl.vy > 0 ? "skok" : "szybowanie");
    animator.update(step, { vy: owl.vy });
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
  debugNode.className = "chmury-debug";
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
    `wys. ${state.owl.y.toFixed(1)} m · kamera ${state.cameraBottom.toFixed(1)} · ${ZONES[state.zone].name}`,
    `x ${state.owl.x.toFixed(2)} · vx ${state.owl.vx.toFixed(1)} · vy ${state.owl.vy.toFixed(1)}`,
    `platformy ${state.platforms.length} · liście ${state.leaves.length} · przeszkody ${state.hazards.length}`,
    `combo ×${state.combo} · seria ${state.perfectStreak} · życia ${state.lives}`,
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
    updateHeight(state);
  }
}

// ---------- Gesty ----------

// Przeciąganie w dowolnym miejscu planszy (najwygodniej w dolnej części — palec nie zasłania sowy): sowa
// przesuwa się w bok o tyle, o ile palec (ruch względny). Bez rozpoznawania „swipe” (swipeMs: −1) — każdy ruch
// palca dłuższy niż 12 px to przeciąganie. Klawiatura: ←/→/A/D (trzymane); Spacja/↑ na ekranie tytułowym — start.
const input = bindInput(
  stage,
  (gesture) => {
    if (screen !== "playing" || !game) {
      if (screen === "title" && gesture.type === "press" && gesture.source === "keyboard") startRun();
      return;
    }
    if (gesture.type === "pause" || gesture.type === "menu") {
      shell.pause("gracz");
      return;
    }
    if (shell.state() !== "running") return;
    if (gesture.type === "press" && gesture.source !== "keyboard") lastDragX = 0;
    else if (gesture.type === "drag") {
      game.steer((gesture.dx - lastDragX) * renderer.metersPerPixel());
      lastDragX = gesture.dx;
    }
  },
  { swipeMs: -1 },
);

// ---------- Start strony ----------

function resize() {
  view.resize();
}
window.addEventListener("resize", resize);
window.visualViewport?.addEventListener?.("resize", resize);

// Scena na ekranie tytułowym: sowa w ogródku pod pierwszymi gałązkami.
game = createRun({ difficulty, seed: "tytul" });
game.state.owl.vy = 0;
resize();
loop.start();

atlas
  .ensure(Math.max(48, view.layout().scale) * Math.min(2, window.devicePixelRatio || 1))
  .catch((error) => console.warn("SowaWChmurach: grafiki", error));

fetch(new URL("audio.json", AUDIO_BASE))
  .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`audio.json: ${response.status}`))))
  .then((manifest) => {
    audio = createAudio({ manifest, baseUrl: AUDIO_BASE, preloadOnUnlock: GAME_SOUNDS });
    connectAudioSettings(audio, cloud);
    audio.bindUnlock(window, { ignore: (event) => Boolean(event.target?.closest?.("a[href]")) });
  })
  .catch((error) => console.warn("SowaWChmurach: bez dźwięku", error));

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
    selectDifficulty(DIFFICULTIES[saved] ? saved : difficulty, { save: false });
    if (tiltSupported && cloud.game(GAME_ID)?.tilt === true) setTiltOn(true, { save: false });
  })
  .catch((error) => console.warn("SowaWChmurach: chmura", error));

// Dostęp dla testów e2e.
window.SowaWChmurach = Object.freeze({
  screen: () => screen,
  ready: () => gameReady,
  atlasReady: () => atlas.ready(),
  state: () =>
    game
      ? {
          ...game.summary(),
          phase: game.state.phase,
          lives: game.state.lives,
          cameraBottom: game.state.cameraBottom,
          time: game.state.time,
          zoneIndex: game.state.zone,
          owl: { ...game.state.owl },
        }
      : null,
  platforms: () =>
    game
      ? game.state.platforms.map((item) => ({
          type: item.type,
          x: item.x,
          y: item.y,
          width: item.width,
          spent: item.spent,
        }))
      : [],
  start: (level) => {
    if (level) selectDifficulty(level, { save: false });
    startRun();
  },
  end: () => game?.end("gracz"),
  warp: (meters) => game?.warp(meters),
  steer: (meters) => game?.steer(meters),
  metersPerPixel: () => renderer.metersPerPixel(),
  // Testy: przeszkoda `kind` (dymek, mail, telefon, sterowiec, kanister, tablica) `dx`, `dy` m od sowy, od razu w ruchu.
  hazard: (kind, dx = 0, dy = 2, extra = {}) => {
    if (!game || !HAZARDS.kinds[kind]) return;
    const owl = game.state.owl;
    game.addHazard(kind, owl.x + dx, owl.y + dy, extra);
  },
  goat: (kind) => game?.giveGoat(kind),
  fever: () => game?.giveFever(),
  ocean: () => game?.giveOcean(),
  tilt: () => ({ supported: tiltSupported, on: tiltOn, granted: tiltGranted, angle: tiltAngle }),
  music: () => audio?.currentMusic?.() ?? null,
  extras: () =>
    game
      ? {
          goats: game.state.goats.filter((item) => !item.taken).map((item) => ({ kind: item.kind, from: item.from })),
          hearts: game.state.hearts.filter((item) => !item.taken).length,
          geysers: game.state.geysers.filter((item) => !item.taken).map((item) => ({ x: item.x, y: item.y })),
          rocket: game.state.rocket,
          fever: game.state.fever,
          powerups: { ...game.state.powerups },
        }
      : null,
  hazards: () =>
    game ? game.state.hazards.filter((item) => !item.gone).map((item) => ({ kind: item.kind, born: item.born })) : [],
  // Testy: sowa pod dolną krawędzią ekranu (upadek → ratunek kózki).
  fall: () => {
    if (game?.state.phase === "run") game.state.owl.y = game.state.cameraBottom - 3;
  },
  // Testy: przewinięcie logiki gry o `seconds` (krok 1/120 s, bez czekania na klatki — WebKit w CI bywa wolny).
  advance: (seconds) => {
    if (!game || screen !== "playing") return;
    for (let index = Math.round(seconds * 120); index > 0 && screen === "playing"; index -= 1) {
      game.update(1 / 120);
      handleEvents();
    }
  },
});
