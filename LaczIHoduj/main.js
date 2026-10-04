// Łącz i Hoduj — strona gry (prototyp, kroki 8.0–8.1): wczytanie i zapis stanu (pole `preview` dokumentu
// `sowiegry_gry/szklarnia` — dawna Szklarnia zostaje bez zmian), pętla, przeciąganie roślin z uniesieniem nad palec,
// zaznaczanie stuknięciem (bez przeciągania), Sowia doniczka, kompostownik, hybrydy, nowe łańcuchy w doniczce,
// komunikaty i haki testowe.
import { connectAudioSettings, createAudio } from "../shared/engine/audio.js";
import { EVENTS, progress } from "../shared/meta/progress.js";
import { createToasts } from "../shared/ui/index.js";
import { COLORS } from "../shared/world/tokens.js";
import { canMerge, hybridOf, itemName } from "./board.js";
import { BOARD, COMPOST_LEAVES, GAME_ID, GAME_SOUNDS, GREENHOUSE_MUSIC, POT, PREVIEW_FIELD } from "./config.js";
import { createGame, defaultState, loadState } from "./game.js";
import { createBoardRenderer, LIFT } from "./render.js";

// Zapis: co 20 s gry, po połączeniu po 2 s, przy zejściu do tła od razu.
const SAVE_EVERY = 20;
const IMPORTANT_DELAY = 2000;
// Przeciąganie zaczyna się po przesunięciu palca o tyle pikseli (krótsze — stuknięcie).
const DRAG_START = 8;

const cloud = window.SowieCloud;
const AUDIO_BASE = new URL("../assets/audio/", import.meta.url).href;
const root = document.querySelector("[data-lacz]");
const canvas = root.querySelector("[data-canvas]");
const leavesNode = root.querySelector("[data-leaves]");
const hintNode = root.querySelector("[data-hint]");
const potButton = root.querySelector("[data-pot]");
const chargesNode = root.querySelector("[data-charges]");
const compostButton = root.querySelector("[data-compost]");

const renderer = createBoardRenderer({ canvas, cols: BOARD.cols, rows: BOARD.rows });
const toasts = createToasts({ root, isInGame: () => true });
window.SowieNotifications ||= { notify: (message) => toasts.show(message) };

let game = createGame({ state: defaultState() });
let ready = false;
let selected = -1;
let press = null;
let lastFrame = 0;
let saveTimer = 0;
let hudTimer = 0;
// Testy e2e: logika wstrzymana w klatkach (hak `hold`).
let testHold = false;
// Silnik dźwięku (po wczytaniu audio.json) — efekty i motyw szklarni (uwaga właściciela L1).
let audio = null;

function play(name, options) {
  try {
    return audio?.play(name, options) || null;
  } catch {
    return null;
  }
}

// ---------- Zapis ----------

function save({ immediate = false, flush = false } = {}) {
  if (!ready || !cloud?.updateGame) return;
  game.state.savedAt = Date.now();
  cloud.updateGame(
    GAME_ID,
    { [PREVIEW_FIELD]: JSON.stringify(game.state) },
    immediate ? { delayMs: IMPORTANT_DELAY } : undefined,
  );
  if (flush) cloud.flush?.();
}

// ---------- Interfejs ----------

function hint(text) {
  if (hintNode.textContent !== text) hintNode.textContent = text;
}

function updateHud() {
  const { state } = game;
  leavesNode.textContent = state.leaves.toLocaleString("pl-PL");
  chargesNode.textContent = `${Math.floor(state.pot.charges)}/${POT.max}`;
  potButton.setAttribute(
    "aria-label",
    `Sowia doniczka — nasionko na wolne pole, ładunki ${Math.floor(state.pot.charges)} z ${POT.max}`,
  );
}

function handleEvents() {
  for (const event of game.takeEvents()) {
    switch (event.type) {
      case "spawn":
        renderer.pop(event.index);
        play("lisc", { pitch: 1.25, volume: 0.6 });
        break;
      case "move":
      case "swap":
        play("ladowanie", { volume: 0.55 });
        break;
      case "merge": {
        renderer.pop(event.to);
        const center = renderer.cellCenter(event.to);
        if (event.leaves) renderer.popup(`+${event.leaves}`, center.x, center.y - 10, COLORS.bialy, 18);
        hint(`${itemName(event.item)}!`);
        // Połączenie: wyższy ton na wyższym poziomie; szczyt łańcucha — fanfara.
        play("polaczenie", { pitch: 0.9 + event.item.level * 0.1 });
        if (event.top) play("rekord", { volume: 0.8 });
        if (event.top) {
          toasts.show(
            `${itemName(event.item)}! Szczyt łańcucha — skrzyżuj ją z innym szczytem albo skompostuj za ${COMPOST_LEAVES[event.item.level]} liści`,
            { kind: "reward", key: "szczyt", priority: 2 },
          );
        }
        save({ immediate: true });
        break;
      }
      case "hybrid": {
        renderer.pop(event.to);
        const center = renderer.cellCenter(event.to);
        renderer.popup(`+${event.leaves}`, center.x, center.y - 10, COLORS.zloto, 20);
        hint(`Hybryda: ${itemName(event.item)}!`);
        play("polaczenie", { pitch: 1.5 });
        play("rekord", { volume: 0.9 });
        toasts.show(`Nowa hybryda: ${itemName(event.item)}! +${event.leaves} liści`, {
          kind: "reward",
          key: "hybryda",
          priority: 2,
        });
        save({ immediate: true });
        break;
      }
      case "unlock":
        toasts.show(`Nowa roślina w Sowiej doniczce: ${event.name}!`, {
          kind: "reward",
          key: "nowa-roslina",
          priority: 2,
        });
        break;
      case "compost": {
        const center = renderer.cellCenter(event.index);
        renderer.popup(`+${event.leaves}`, center.x, center.y - 10, COLORS.monsteraJasna, 18);
        hint(`Kompost: ${itemName(event.item)} → +${event.leaves} liści`);
        play("slizg", { pitch: 0.8, volume: 0.7 });
        save({ immediate: true });
        break;
      }
      case "potEmpty":
        play("klik", { pitch: 0.6, volume: 0.5 });
        toasts.show("Doniczka się ładuje — nasionko co 3 sekundy", { kind: "info", key: "doniczka" });
        break;
      case "boardFull":
        play("klik", { pitch: 0.6, volume: 0.5 });
        toasts.show("Brak miejsca na półkach — połącz albo skompostuj roślinę", { kind: "warn", key: "pelno" });
        break;
      default:
        break;
    }
  }
}

// ---------- Ruchy: przeciąganie i stuknięcia ----------

function localPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

// Czy punkt ekranu jest nad kompostownikiem (cel upuszczenia).
function overCompost(event) {
  const rect = compostButton.getBoundingClientRect();
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

// Pole, na które spadnie uniesiony przedmiot (pod przedmiotem, nie pod palcem).
function dropTarget(point) {
  return renderer.cellAt(point.x, point.y - renderer.layout().size * LIFT);
}

function moveTo(from, to) {
  const result = game.move(from, to);
  handleEvents();
  updateHud();
  return result;
}

function compostAt(index) {
  if (game.compost(index)) {
    handleEvents();
    updateHud();
  }
}

canvas.addEventListener("pointerdown", (event) => {
  if (!ready) return;
  const point = localPoint(event);
  const index = renderer.cellAt(point.x, point.y);
  press = { index, start: point, point, dragging: false, compost: false, id: event.pointerId };
  if (index >= 0 && game.board.cells[index]) canvas.setPointerCapture?.(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!press || event.pointerId !== press.id) return;
  press.point = localPoint(event);
  if (!press.dragging && game.board.cells[press.index]) {
    const distance = Math.hypot(press.point.x - press.start.x, press.point.y - press.start.y);
    if (distance >= DRAG_START) {
      press.dragging = true;
      selected = -1;
      play("klik", { pitch: 1.2, volume: 0.6 });
    }
  }
  if (press.dragging) {
    press.compost = overCompost(event);
    compostButton.classList.toggle("is-target", press.compost);
  }
});

function finishPress(event, cancelled = false) {
  if (!press || event.pointerId !== press.id) return;
  const current = press;
  press = null;
  compostButton.classList.remove("is-target");
  if (cancelled) return;
  if (current.dragging) {
    if (overCompost(event)) compostAt(current.index);
    else {
      const target = dropTarget(localPoint(event));
      if (target >= 0) moveTo(current.index, target);
    }
    return;
  }
  // Stuknięcie: zaznaczenie rośliny, potem stuknięcie w pole docelowe (to samo — odznaczenie).
  const index = current.index;
  if (index < 0) return;
  if (selected < 0) {
    if (game.board.cells[index]) {
      selected = index;
      play("klik", { pitch: 1.2, volume: 0.6 });
      hint(`${itemName(game.board.cells[index])} — stuknij pole albo kompost`);
    }
    return;
  }
  if (index !== selected) moveTo(selected, index);
  selected = -1;
}

canvas.addEventListener("pointerup", (event) => finishPress(event));
canvas.addEventListener("pointercancel", (event) => finishPress(event, true));

potButton.addEventListener("click", () => {
  if (!ready) return;
  game.tapPot();
  handleEvents();
  updateHud();
});

compostButton.addEventListener("click", () => {
  if (!ready) return;
  if (selected >= 0) {
    compostAt(selected);
    selected = -1;
  } else {
    toasts.show("Przeciągnij roślinę na kompost albo zaznacz ją i stuknij tutaj", { kind: "info", key: "kompost" });
  }
});

// ---------- Pętla ----------

function dragView() {
  if (!press?.dragging) return null;
  const target = press.compost ? -1 : dropTarget(press.point);
  const source = game.board.cells[press.index];
  const kind = press.compost
    ? "compost"
    : target >= 0 &&
        target !== press.index &&
        (canMerge(source, game.board.cells[target]) || hybridOf(source, game.board.cells[target]))
      ? "merge"
      : "move";
  return { from: press.index, x: press.point.x, y: press.point.y, target: target === press.index ? -1 : target, kind };
}

function frame(time) {
  const dt = lastFrame ? Math.min(0.25, (time - lastFrame) / 1000) : 0;
  lastFrame = time;
  if (ready && !testHold) {
    game.update(dt);
    saveTimer += dt;
    if (saveTimer >= SAVE_EVERY) {
      saveTimer = 0;
      save();
    }
  }
  renderer.draw({ cells: game.board.cells, selected, drag: dragView(), time: time / 1000, dt });
  hudTimer += dt;
  if (hudTimer >= 0.2 || !dt) {
    hudTimer = 0;
    updateHud();
  }
  requestAnimationFrame(frame);
}

// Rozmiar planszy idzie za gniazdem (obrót telefonu, okno, wczytana czcionka zmienia wysokość nagłówka); opis
// płótna mówi, jak plansza jest ułożona (obrócona — 9 kolumn, 7 rzędów).
function fitBoard() {
  renderer.resize();
  const { transposed } = renderer.layout();
  const [across, down] = transposed ? [BOARD.rows, BOARD.cols] : [BOARD.cols, BOARD.rows];
  canvas.setAttribute("aria-label", `Półki szklarni: ${across} kolumn, ${down} rzędów`);
}

window.addEventListener("resize", fitBoard);
if (window.ResizeObserver) new ResizeObserver(fitBoard).observe(canvas.parentElement);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) save({ flush: true });
  lastFrame = 0;
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
  game = createGame({ state: loadState(raw, Date.now()) });
  ready = true;
  if (!raw) save({ immediate: true });
  progress.emit(EVENTS.VISIT, { gameId: GAME_ID });
  updateHud();
}

fitBoard();
requestAnimationFrame(frame);

// Dźwięk: manifest, ustawienia głośności z profilu, odblokowanie dotknięciem i motyw szklarni (gra od razu po
// odblokowaniu — silnik wznawia kontekst w geście zakończonym).
fetch(new URL("audio.json", AUDIO_BASE))
  .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`audio.json: ${response.status}`))))
  .then((manifest) => {
    audio = createAudio({ manifest, baseUrl: AUDIO_BASE, preloadOnUnlock: GAME_SOUNDS });
    connectAudioSettings(audio, cloud);
    audio.bindUnlock(window, { ignore: (event) => Boolean(event.target?.closest?.("a[href]")) });
    audio.playMusic(GREENHOUSE_MUSIC)?.catch?.(() => {});
  })
  .catch((error) => console.warn("LaczIHoduj: dźwięk", error));
start().catch((error) => console.warn("LaczIHoduj: start", error));

// Dostęp dla testów e2e.
window.LaczIHoduj = Object.freeze({
  ready: () => ready,
  state: () => JSON.parse(JSON.stringify(game.state)),
  cells: () => JSON.parse(JSON.stringify(game.board.cells)),
  cellCenter: (index) => renderer.cellCenter(index),
  cellSize: () => renderer.layout().size,
  transposed: () => renderer.layout().transposed,
  lift: () => renderer.layout().size * LIFT,
  selected: () => selected,
  place: (index, level, chain = POT.chain) => {
    game.board.cells[index] = level ? { chain, level } : null;
    game.state.cells = game.board.cells.map((item) => (item ? { ...item } : null));
  },
  move: (from, to) => moveTo(from, to).type,
  tapPot: () => {
    const index = game.tapPot();
    handleEvents();
    updateHud();
    return index;
  },
  hold: (on = true) => {
    testHold = Boolean(on);
  },
  music: () => audio?.currentMusic?.() ?? null,
  save: () => save({ flush: true }),
});
