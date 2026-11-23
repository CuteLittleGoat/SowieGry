// Sowie Trójki — strona gry (Analiza 5, rozdz. 4, 8, 10, 13 i 14.4; podgląd przed kartą w menu — decyzja 10):
// mapa poziomów, karta startu, plansza z gestami (przesunięcie palcem albo dwa stuknięcia, klawiatura), animacje osi
// czasu ruchu, Sówka z boku planszy (reżyser reakcji, dymki, Radość i Sowia pomoc), podpowiedź po 5 s, wygrana
// z Humbaczym Finałem i gwiazdkami, przegrana z prezentem od Sówki, pauza i ustawienia (wspólne menu pauzy),
// automat płynności (Analiza 6) i haki testowe `window.SowieTrojki`.
//
// Zapis: dopóki gry nie ma w rejestrze SowiePlatform (i w regułach Firestore), postęp jest tylko w pamięci strony
// (podgląd — wszystkie poziomy otwarte); bramka zapisu w SowieCloud i tak nie wyśle dokumentu gry spoza listy.
import { connectAudioSettings, createAudio } from "../shared/engine/audio.js";
import { createPerfMeter } from "../shared/engine/perf-meter.js";
import { createFrameLimiter, createQuality } from "../shared/engine/quality.js";
import { createSlowBanner } from "../shared/engine/shell.js";
import { createAtlas } from "../shared/engine/sprites.js";
import { linkSpecies } from "../shared/meta/shop.js";
import { createPauseMenu, createToasts, ICONS, openModal, renderGuide } from "../shared/ui/index.js";
import { SVG_BASE } from "../shared/world/catalog.js";
import { adjacent, boardToText, setLayout, swappable } from "./board.js";
import { GAME_ID, JOY, KIND_INFO, comboWord, goalText } from "./config.js";
import { createLevelRun } from "./game.js";
import { GUIDE } from "./guide.js";
import { LEVELS, levelById } from "./levels.js";
import { renderMap } from "./map.js";
import { createOwlDirector } from "./owl-director.js";
import { createOwlView } from "./owl-view.js";
import { createBoardRenderer } from "./render.js";
import { defaultState, loadState, recordResult, summaryOf } from "./state.js";
import { TROJKI_SPRITES } from "./tiles.js";
import { showHand, showIntro } from "./tutorial.js";

const AUDIO_BASE = new URL("../assets/audio/", import.meta.url).href;
const MUSIC = "ogrod";
const FINALE_MUSIC = "humbak";
const GAME_SOUNDS = ["klik", "polaczenie", "hu-hu", "rekord", "koniec-gry", "humbak-plusk", "lisc-teczowy", "dzwonek"];
// Podpowiedź po 5 s bez ruchu (w Trybie Przytulnym po 3 s), sen Sówki po 40 s.
const HINT_AFTER = 5;
const HINT_AFTER_COZY = 3;
const SLEEP_AFTER = 40;

const root = document.querySelector("[data-trojki]");
const mapScreen = root.querySelector("[data-map-screen]");
const mapNode = root.querySelector("[data-map]");
const gameNode = root.querySelector("[data-game]");
const boardCanvas = root.querySelector("[data-board]");
const owlCanvas = root.querySelector("[data-owl]");
const owlButton = root.querySelector("[data-owl-button]");
const owlArea = root.querySelector("[data-owl-area]");
const boardWrap = root.querySelector("[data-board-wrap]");
const bubbleNode = root.querySelector("[data-bubble]");
const comboNode = root.querySelector("[data-combo]");
const handNode = root.querySelector("[data-hand]");
const movesNode = root.querySelector("[data-moves]");
const goalsNode = root.querySelector("[data-goals]");
const scoreNode = root.querySelector("[data-score]");
const starFill = root.querySelector("[data-star-fill]");
const joyFill = root.querySelector("[data-joy]");
const helpButton = root.querySelector("[data-help]");
const titleNode = root.querySelector("[data-level-title]");
const liveNode = root.querySelector("[data-live]");
const previewNote = root.querySelector("[data-preview]");

const cloud = window.SowieCloud || null;
const platform = window.SowiePlatform || null;
const params = new URLSearchParams(location.search);
// Zapis w chmurze dopiero, gdy gra jest w rejestrze (i w regułach Firestore) — Analiza 5, rozdz. 13.1a.
const SAVE_ENABLED = Boolean(platform?.GAME_REGISTRY?.some?.((entry) => entry.id === GAME_ID));
const PREVIEW = !SAVE_ENABLED;

const settings = () => cloud?.profile?.()?.settings || {};
const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
const reducedMotion = () =>
  Boolean(motionQuery?.matches) || document.documentElement.classList.contains("sowie-reduced-effects");
const clock = () => performance.now() / 1000;

// ---------- Płynność, atlas, plansza, Sówka ----------

const quality = createQuality();
const limiter = createFrameLimiter(quality.fps());
const getDpr = () => quality.dpr(window.devicePixelRatio || 1);
const atlas = createAtlas({ catalog: TROJKI_SPRITES, baseUrl: SVG_BASE });
const renderer = createBoardRenderer({
  canvas: boardCanvas,
  atlas,
  getDpr,
  particleScale: () => quality.particleScale(),
  reducedMotion,
});
const owlView = createOwlView({
  canvas: owlCanvas,
  atlas,
  getDpr,
  cosmetic: () => cloud?.profile?.()?.cosmetics?.selected || "none",
  reducedMotion,
  particleScale: () => quality.particleScale(),
});
// Gatunek sowy z Sowiego Butiku (przekolorowanie części sowy w atlasie) — po zmianie obrazki kafelków od nowa.
linkSpecies(atlas, { onChange: () => renderer.clearCaches() });
const director = createOwlDirector({ quips: () => settings().quips !== false, reducedMotion });
const meter = createPerfMeter({ quality, canvas: boardCanvas });
const slowBanner = createSlowBanner({ stage: root, page: true, onEnable: () => quality.setMode("saver") });
quality.onStruggle(() => {
  if (quality.mode() !== "saver") slowBanner.show();
});
quality.onChange(() => resize());

let audio = null;
let progressState = defaultState();
let screen = "map";
let level = null;
let run = null;
let attempt = 0;
let locked = false;
let selected = -1;
let cursor = -1;
let press = null;
let idle = 0;
let hintShown = false;
let sleeping = false;
let handMove = null;
let ready = false;
let testHold = false;
let helpAnnounced = false;
let bubbleTimer = null;
let lastInteraction = 0;
// Komunikaty (jeden naraz w grze) — po zmiennych stanu (createToasts od razu pyta o ekran).
const toasts = createToasts({ root, isInGame: () => screen === "game" });
void toasts;

function play(name, options) {
  try {
    return audio?.play(name, options) || null;
  } catch {
    return null;
  }
}

function announce(text) {
  if (liveNode) liveNode.textContent = text;
}

// ---------- Rozmiar ----------

// Pion: wiersz planszy ma dokładnie jej wysokość (--board-h), resztę zajmuje Sówka; kolumna Sówki rośnie
// z wysokością jej pola (--owl-w). Dymek stoi obok głowy Sówki (--bubble-x/--bubble-y). W poziomie te zmienne
// nie są używane (style.css ma własną siatkę kolumn).
function fitLayout() {
  if (run) {
    const cols = run.board.cols;
    const cell = Math.floor(boardWrap.clientWidth / cols);
    gameNode.style.setProperty("--board-h", `${cell * run.board.rows + 12}px`);
  }
  const area = owlArea.getBoundingClientRect();
  const owlWidth = Math.round(Math.max(96, Math.min(area.height * 0.8, area.width * 0.5)));
  owlArea.style.setProperty("--owl-w", `${owlWidth}px`);
}

function placeBubble() {
  const area = owlArea.getBoundingClientRect();
  const box = owlCanvas.getBoundingClientRect();
  const head = owlView.head();
  owlArea.style.setProperty("--bubble-x", `${Math.round(box.left - area.left + head.right + 10)}px`);
  owlArea.style.setProperty("--bubble-y", `${Math.round(box.top - area.top + head.top + head.size * 0.2)}px`);
}

function resize() {
  fitLayout();
  renderer.resize();
  owlView.resize();
  placeBubble();
  const cell = renderer.cellSize();
  const owl = owlCanvas.getBoundingClientRect().height * 0.78;
  const ratio = getDpr();
  const needed = Math.max(64, cell * 0.8, owl / 1.2) * ratio;
  if (!atlas.ready() || needed > atlas.pixelsPerUnit() * 1.15) {
    atlas
      .ensure(needed)
      .then(() => renderer.clearCaches())
      .catch(() => {});
  }
  if (handMove) placeHand(handMove);
}
window.addEventListener("resize", resize);
new ResizeObserver(() => resize()).observe(gameNode);

// ---------- Mapa i start poziomu ----------

const menuLink = root.querySelector("[data-menu-link]");
const mapButton = root.querySelector("[data-to-map]");
const pauseButton = root.querySelector("[data-pause]");

function showScreen(next) {
  screen = next;
  gameNode.hidden = next !== "game";
  mapScreen.hidden = next !== "map";
  // W grze w lewym górnym rogu „Mapa” (powrót do poziomów), na mapie — „Menu” (menu główne SowieGry).
  menuLink.hidden = next === "game";
  mapButton.hidden = next !== "game";
  // Pauza tylko w grze (na mapie nie ma czego wstrzymywać).
  pauseButton.hidden = next !== "game";
  if (next === "map") titleNode.textContent = "Sowie Trójki";
}

function showMap() {
  showScreen("map");
  previewNote.hidden = !PREVIEW;
  renderMap(mapNode, {
    state: progressState,
    current: Math.min(LEVELS.length, progressState.unlocked),
    open: PREVIEW,
    onPick: (id) => openStartCard(id),
  });
}

function goalsList(target) {
  const list = document.createElement("ul");
  list.className = "trojki-goal-list";
  for (const goal of target.goals) {
    const item = document.createElement("li");
    item.textContent = goalText(goal);
    list.append(item);
  }
  return list;
}

function openStartCard(id) {
  const target = levelById(id);
  if (!target) return;
  play("klik");
  const content = document.createElement("div");
  content.className = "trojki-start";
  const moves = document.createElement("p");
  moves.innerHTML = `Ruchy: <strong>${target.moves}</strong>`;
  const stars = progressState.levels[id]?.stars || 0;
  const earned = document.createElement("p");
  earned.className = "trojki-start-stars";
  earned.textContent = [0, 1, 2].map((index) => (index < stars ? "★" : "☆")).join(" ");
  earned.setAttribute("aria-label", `Gwiazdki: ${stars} z 3`);
  content.append(goalsList(target), moves, earned);
  openModal({
    title: `Poziom ${id}`,
    content,
    className: "trojki-start-modal",
    actions: [
      {
        label: "Graj",
        primary: true,
        onClick: (close) => {
          close();
          startLevel(id);
        },
      },
    ],
  });
}

async function startLevel(id, { skipIntro = false } = {}) {
  level = levelById(id);
  if (!level) return;
  attempt += 1;
  progressState.attempt += 1;
  run = createLevelRun(level, { attempt: progressState.attempt, cozy: Boolean(settings().cozy) });
  showScreen("game");
  titleNode.textContent = `Poziom ${level.id}`;
  selected = -1;
  cursor = -1;
  locked = false;
  idle = 0;
  hintShown = false;
  sleeping = false;
  helpAnnounced = false;
  gameNode.style.setProperty("--rows", String(run.board.rows));
  resize();
  renderer.setBoard(run.board);
  renderer.select(-1);
  renderer.setHint(null);
  updateHud();
  hideBubble();
  audio?.playMusic(MUSIC)?.catch?.(() => {});
  if (!skipIntro) {
    await showIntro(level, {
      seen: progressState.tutorial.seen,
      onSeen: (key) => progressState.tutorial.seen.push(key),
    });
  }
  const first = level.goals[0];
  react({ type: "start", text: first ? `${goalText(first).replace(/^Zbierz/, "Zbierzmy")}!` : null });
  announce(`Poziom ${level.id}. ${level.goals.map(goalText).join(". ")}. Ruchy: ${run.state.moves}.`);
  // Ręka samouczka na pierwszych poziomach (z kartą „Nowość”) — do pierwszego ruchu.
  if (level.id <= 2 || level.intro === "zamiana") showHint(true);
}

// ---------- HUD ----------

function goalIcon(goal) {
  const icon = document.createElement("canvas");
  icon.className = "trojki-goal-icon";
  icon.width = 56;
  icon.height = 56;
  icon.setAttribute("aria-hidden", "true");
  const context = icon.getContext("2d");
  const draw = () => {
    context.clearRect(0, 0, 56, 56);
    if (goal.type === "collect") {
      context.fillStyle = KIND_INFO[goal.kind].color;
      context.beginPath();
      context.arc(28, 28, 24, 0, Math.PI * 2);
      context.fill();
      atlas.draw(context, KIND_INFO[goal.kind].sprite, 28, 29, { width: 36 });
    } else if (goal.type === "eggs") atlas.draw(context, "trojki-jajko", 28, 28, { width: 44 });
    else if (goal.type === "phones") atlas.draw(context, "pracu-telefon", 28, 28, { width: 46 });
    else if (goal.type === "crates") {
      context.fillStyle = "#c9a47e";
      context.fillRect(8, 8, 40, 40);
      context.fillStyle = "#d9303e";
      context.fillRect(24, 8, 8, 40);
    } else if (goal.type === "notes") {
      context.fillStyle = "#ffe680";
      context.fillRect(8, 8, 40, 40);
      context.fillStyle = "#e8465a";
      context.beginPath();
      context.arc(36, 20, 7, 0, Math.PI * 2);
      context.fill();
    } else {
      context.fillStyle = "#f4c542";
      context.font = '700 40px "Fredoka", system-ui';
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("★", 28, 30);
    }
  };
  if (atlas.ready()) draw();
  else
    atlas
      .ensure(64)
      .then(draw)
      .catch(() => {});
  return icon;
}

let goalsKey = "";
function updateHud() {
  if (!run) return;
  const state = run.state;
  movesNode.textContent = String(state.moves);
  movesNode.parentElement.classList.toggle("is-low", state.moves <= 3);
  scoreNode.textContent = new Intl.NumberFormat("pl-PL").format(state.score);
  const top = level.stars[2] || 1;
  starFill.style.transform = `scaleX(${Math.min(1, state.score / top)})`;
  starFill.parentElement.dataset.stars = String(
    state.score >= level.stars[2] ? 3 : state.score >= level.stars[1] ? 2 : state.score > 0 ? 1 : 0,
  );
  const key = `${level.id}:${attempt}`;
  if (goalsKey !== key) {
    goalsKey = key;
    goalsNode.replaceChildren(
      ...state.goals.map((goal, at) => {
        const item = document.createElement("li");
        item.dataset.goal = String(at);
        item.title = goalText(goal);
        const count = document.createElement("span");
        count.dataset.goalCount = "";
        item.append(goalIcon(goal), count);
        return item;
      }),
    );
  }
  state.goals.forEach((goal, at) => {
    const item = goalsNode.children[at];
    if (!item) return;
    const done = goal.done >= goal.count;
    item.classList.toggle("is-done", done);
    const text =
      goal.type === "score" ? `${Math.min(goal.done, goal.count)}` : `${Math.max(0, goal.count - goal.done)}`;
    item.lastChild.textContent = done ? "✓" : text;
    item.setAttribute("aria-label", `${goalText(goal)}: ${done ? "zrobione" : `zostało ${text}`}`);
  });
  joyFill.style.transform = `scaleX(${Math.min(1, state.joy / JOY.max)})`;
  const full = state.joy >= JOY.max && state.phase === "play";
  helpButton.disabled = !full;
  root.classList.toggle("is-help-ready", full);
  if (full && !helpAnnounced) {
    helpAnnounced = true;
    react({ type: "helpReady" });
  }
  if (!full) helpAnnounced = false;
}

// ---------- Sówka ----------

function hideBubble() {
  bubbleNode.hidden = true;
  if (bubbleTimer) clearTimeout(bubbleTimer);
  bubbleTimer = null;
}

function showBubble(text) {
  if (!text) return;
  bubbleNode.textContent = text;
  bubbleNode.hidden = false;
  bubbleNode.animate?.(
    [
      { transform: "scale(0.6)", opacity: 0 },
      { transform: "scale(1.05)", opacity: 1, offset: 0.6 },
      { transform: "scale(1)", opacity: 1 },
    ],
    { duration: 220, easing: "ease-out" },
  );
  if (bubbleTimer) clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(hideBubble, 1800);
}

const OWL_SOUNDS = Object.freeze({
  hu: ["hu-hu", { volume: 0.35, pitch: 1.25 }],
  huhu: ["hu-hu", { volume: 0.6 }],
  huhuhu: ["hu-hu", { volume: 0.75, pitch: 1.1 }],
  trel: ["hu-hu", { volume: 0.85, pitch: 1.35 }],
  hura: ["rekord", { volume: 0.7 }],
  ojej: ["hu-hu", { volume: 0.5, pitch: 0.75 }],
  chichot: ["hu-hu", { volume: 0.5, pitch: 1.6 }],
  chrr: ["hu-hu", { volume: 0.25, pitch: 0.6 }],
});

function react(event) {
  const command = director.handle(event, clock());
  if (!command) return null;
  if (command.sound && OWL_SOUNDS[command.sound]) play(...OWL_SOUNDS[command.sound]);
  showBubble(command.bubble);
  if (command.reaction === "fly") {
    const box = boardCanvas.getBoundingClientRect();
    owlView.fly({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
  }
  return command;
}

function wake() {
  idle = 0;
  if (sleeping) {
    sleeping = false;
    director.stop();
    react({ type: "giggle" });
  }
}

// ---------- Ruchy ----------

function canAct() {
  return Boolean(run) && screen === "game" && run.state.phase === "play" && !locked && !pause.isOpen();
}

function noteInteraction() {
  lastInteraction = performance.now();
  wake();
  if (hintShown) {
    hintShown = false;
    renderer.setHint(null);
  }
}

function placeHand(move) {
  const box = boardCanvas.getBoundingClientRect();
  const wrap = handNode.parentElement.getBoundingClientRect();
  const from = renderer.cellCenter(move.a);
  const to = renderer.cellCenter(move.b ?? move.a);
  showHand(handNode, {
    from: { x: from.x + box.left - wrap.left, y: from.y + box.top - wrap.top },
    to: { x: to.x + box.left - wrap.left, y: to.y + box.top - wrap.top },
  });
}

function showHint(withHand = false) {
  if (!run || run.state.phase !== "play") return;
  const move = run.hint();
  if (!move) return;
  hintShown = true;
  renderer.setHint(move);
  if (withHand) {
    handMove = move;
    placeHand(move);
  }
}

function hideHand() {
  handMove = null;
  showHand(handNode, null);
}

function handleResult(result, { source = "move" } = {}) {
  if (!result) return;
  if (!result.valid) {
    renderer.play(result.steps);
    if (result.steps.some((step) => step.type === "swapBack")) play("klik", { pitch: 0.6, volume: 0.5 });
    for (const event of result.events || []) react(event);
    return;
  }
  locked = true;
  hideHand();
  renderer.select(-1);
  renderer.setHint(null);
  selected = -1;
  hintShown = false;
  const move = result.events.find((event) => event.type === "move" || event.type === "help");
  if (move) {
    if (move.combo >= 2) showCombo(move.combo);
    if (move.created.length) play("lisc-teczowy", { volume: 0.5, pitch: 1.2 });
    if (move.fired.length) play("humbak-plusk", { volume: 0.55 });
    if (move.eggs) react({ type: "egg" });
    if (move.goalsDone.length) {
      react({ type: "goal" });
      announce(`Cel zrobiony: ${move.goalsDone.map((at) => goalText(run.state.goals[at])).join(", ")}.`);
    }
    if (move.shuffled) react({ type: "shuffle" });
  }
  const waves = new Set(result.steps.filter((step) => step.type === "clear").map((step) => step.wave));
  [...waves].forEach((wave, index) =>
    setTimeout(() => play("polaczenie", { pitch: 1 + index * 0.08, volume: 0.6 }), index * 260),
  );
  for (const event of result.events) {
    if (event.type === "move" || event.type === "help") react(event);
    else if (["lowMoves", "half", "gift", "cozy"].includes(event.type)) react(event);
  }
  if (source === "help") react({ type: "help" });
  renderer.play(result.steps, {
    onDone: () => {
      renderer.sync(run.board);
      locked = false;
      updateHud();
      afterAnimation();
    },
  });
  updateHud();
}

function showCombo(count) {
  const word = comboWord(count);
  if (!word) return;
  comboNode.textContent = `${word} ×${count}`;
  comboNode.hidden = false;
  comboNode
    .animate?.(
      [
        { transform: "translate(-50%, -50%) scale(0.4)", opacity: 0 },
        { transform: "translate(-50%, -50%) scale(1.15)", opacity: 1, offset: 0.25 },
        { transform: "translate(-50%, -60%) scale(1)", opacity: 1, offset: 0.75 },
        { transform: "translate(-50%, -75%) scale(0.95)", opacity: 0 },
      ],
      { duration: 1100, easing: "ease-out" },
    )
    .finished?.then?.(() => {
      comboNode.hidden = true;
    });
}

function afterAnimation() {
  if (!run) return;
  if (run.state.phase === "finale") startFinale();
  else if (run.state.phase === "lost") showLose();
}

function attemptSwap(a, b) {
  if (!canAct()) return;
  noteInteraction();
  play("klik", { volume: 0.4 });
  handleResult(run.swap(a, b));
}

function tapCell(cell) {
  if (!canAct()) return;
  noteInteraction();
  const item = run.board.cells[cell]?.item;
  if (item?.special && (selected === -1 || selected === cell)) {
    handleResult(run.tap(cell));
    return;
  }
  if (selected >= 0 && selected !== cell && adjacent(run.board, selected, cell)) {
    const from = selected;
    selected = -1;
    renderer.select(-1);
    attemptSwap(from, cell);
    return;
  }
  if (selected === cell || !swappable(run.board, cell)) {
    selected = -1;
  } else {
    selected = cell;
    play("klik", { volume: 0.3, pitch: 1.3 });
  }
  renderer.select(selected);
}

function useHelp() {
  if (!canAct() || run.state.joy < JOY.max) return;
  noteInteraction();
  handleResult(run.help(), { source: "help" });
}

function startFinale() {
  locked = true;
  react({ type: "finale" });
  audio?.playMusic(FINALE_MUSIC)?.catch?.(() => {});
  const finale = run.finale();
  if (finale.feathers) play("humbak-plusk", { volume: 0.7 });
  renderer.play(finale.steps, {
    onDone: () => {
      renderer.sync(run.board);
      updateHud();
      showWin(finale);
    },
  });
  updateHud();
}

function finishRecord(won) {
  recordResult(progressState, level.id, {
    won,
    stars: run.state.stars,
    score: run.state.score,
    stats: run.state.stats,
    totalLevels: LEVELS.length,
  });
  save();
}

function showWin() {
  finishRecord(true);
  const stars = run.state.stars;
  react({ type: "won", stars });
  play("rekord");
  announce(`Wygrana! Gwiazdki: ${stars} z 3. Punkty: ${run.state.score}.`);
  const content = document.createElement("div");
  content.className = "trojki-result";
  const starRow = document.createElement("p");
  starRow.className = "trojki-result-stars";
  starRow.setAttribute("aria-label", `Gwiazdki: ${stars} z 3`);
  [0, 1, 2].forEach((index) => {
    const star = document.createElement("span");
    star.textContent = index < stars ? "★" : "☆";
    star.className = index < stars ? "is-earned" : "";
    star.style.animationDelay = `${index * 0.25}s`;
    starRow.append(star);
  });
  const score = document.createElement("p");
  score.innerHTML = `Punkty: <strong data-result-score>${new Intl.NumberFormat("pl-PL").format(run.state.score)}</strong>`;
  content.append(starRow, score);
  const next = levelById(level.id + 1);
  locked = true;
  openModal({
    title: stars >= 3 ? "Trzy gwiazdki!" : "Brawo!",
    content,
    className: "trojki-result-modal is-win",
    actions: [
      { label: "Mapa", onClick: (close) => close() || showMap() },
      ...(next
        ? [
            {
              label: "Dalej",
              primary: true,
              onClick: (close) => {
                close();
                openStartCard(next.id);
              },
            },
          ]
        : []),
    ],
    onClose: () => {
      locked = false;
      if (screen === "game" && run?.state.phase !== "play") showMap();
    },
  });
}

function missingText() {
  const left = run.state.goals.filter((goal) => goal.done < goal.count);
  if (!left.length) return "";
  const goal = left[0];
  const rest = goal.count - goal.done;
  return `Brakowało: ${goalText({ ...goal, count: rest }).replace(/^\S+\s/, "")}.`;
}

function showLose() {
  finishRecord(false);
  react({ type: "lose" });
  play("koniec-gry");
  announce(`Koniec ruchów. ${missingText()}`);
  const content = document.createElement("div");
  content.className = "trojki-result";
  const text = document.createElement("p");
  text.textContent = missingText();
  content.append(text);
  locked = true;
  openModal({
    title: "Ojej, zabrakło ruchów",
    content,
    className: "trojki-result-modal is-lose",
    actions: [
      { label: "Mapa", onClick: (close) => close() || showMap() },
      {
        label: "Spróbuj jeszcze raz",
        primary: true,
        onClick: (close) => {
          close();
          startLevel(level.id, { skipIntro: true });
        },
      },
    ],
    onClose: () => {
      locked = false;
      if (screen === "game" && run?.state.phase !== "play") showMap();
    },
  });
}

// ---------- Zapis ----------

function save() {
  progressState.savedAt = Date.now();
  if (!SAVE_ENABLED || !cloud?.saveGameState) return;
  cloud.saveGameState(GAME_ID, progressState, { immediate: true, saveVersion: 1, summary: summaryOf(progressState) });
}

async function loadProgress() {
  if (!SAVE_ENABLED || !cloud?.loadGameState) return;
  try {
    const saved = await cloud.loadGameState(GAME_ID);
    if (saved) progressState = loadState(saved);
  } catch {
    // brak zapisu — zaczynamy od nowa
  }
}

// ---------- Gesty i klawiatura ----------

function canvasPoint(event) {
  const box = boardCanvas.getBoundingClientRect();
  return { x: event.clientX - box.left, y: event.clientY - box.top };
}

boardCanvas.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  if (run && locked && renderer.busy()) {
    // Stuknięcie w trakcie spadania przyspiesza animację (rozdz. 6.1).
    renderer.skip();
    return;
  }
  if (!canAct()) return;
  const point = canvasPoint(event);
  const cell = renderer.cellAt(point.x, point.y);
  noteInteraction();
  if (cell < 0) return;
  press = { id: event.pointerId, cell, x: point.x, y: point.y, moved: false };
  try {
    boardCanvas.setPointerCapture(event.pointerId);
  } catch {
    // syntetyczny wskaźnik (testy)
  }
});

boardCanvas.addEventListener("pointermove", (event) => {
  if (!press || press.id !== event.pointerId) return;
  const point = canvasPoint(event);
  const dx = point.x - press.x;
  const dy = point.y - press.y;
  const cell = renderer.cellSize();
  const threshold = cell / 3;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) {
    renderer.setDrag({
      cell: press.cell,
      dx: Math.max(-0.2, Math.min(0.2, dx / cell)),
      dy: Math.max(-0.2, Math.min(0.2, dy / cell)),
    });
    return;
  }
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const cols = run.board.cols;
  const row = Math.floor(press.cell / cols);
  const col = press.cell % cols;
  let target = -1;
  if (horizontal && dx > 0 && col < cols - 1) target = press.cell + 1;
  else if (horizontal && dx < 0 && col > 0) target = press.cell - 1;
  else if (!horizontal && dy > 0 && row < run.board.rows - 1) target = press.cell + cols;
  else if (!horizontal && dy < 0 && row > 0) target = press.cell - cols;
  const from = press.cell;
  press = null;
  renderer.setDrag(null);
  selected = -1;
  renderer.select(-1);
  if (target >= 0) attemptSwap(from, target);
});

function endPress(event, cancelled) {
  if (!press || press.id !== event.pointerId) return;
  const cell = press.cell;
  press = null;
  renderer.setDrag(null);
  if (!cancelled) tapCell(cell);
}
boardCanvas.addEventListener("pointerup", (event) => endPress(event, false));
boardCanvas.addEventListener("pointercancel", (event) => endPress(event, true));

boardCanvas.addEventListener("keydown", (event) => {
  if (!run || event.altKey || event.ctrlKey || event.metaKey) return;
  const cols = run.board.cols;
  const rows = run.board.rows;
  const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  if (moves[event.key]) {
    event.preventDefault();
    noteInteraction();
    const [dx, dy] = moves[event.key];
    if (selected >= 0) {
      const col = (selected % cols) + dx;
      const row = Math.floor(selected / cols) + dy;
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        const from = selected;
        selected = -1;
        renderer.select(-1);
        attemptSwap(from, row * cols + col);
      }
      return;
    }
    const start = cursor >= 0 ? cursor : Math.floor(rows / 2) * cols + Math.floor(cols / 2);
    const col = Math.max(0, Math.min(cols - 1, (start % cols) + dx));
    const row = Math.max(0, Math.min(rows - 1, Math.floor(start / cols) + dy));
    cursor = row * cols + col;
    renderer.select(cursor);
    announce(`Kolumna ${col + 1}, rząd ${row + 1}`);
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (cursor < 0) return;
    tapCell(cursor);
    if (selected < 0) renderer.select(cursor);
  } else if (event.key === "Escape") {
    selected = -1;
    renderer.select(cursor);
  }
});

owlButton.addEventListener("click", () => {
  wake();
  if (run?.state.joy >= JOY.max && canAct()) useHelp();
  else react({ type: "giggle" });
});
helpButton.addEventListener("click", () => useHelp());

// ---------- Pauza, instrukcja, tło ----------

const pause = createPauseMenu({
  root,
  shell: null,
  gameId: GAME_ID,
  guide: GUIDE,
  audio: () => audio,
  atlas,
  sprites: TROJKI_SPRITES,
  onResume: () => {
    lastInteraction = performance.now();
  },
  onRestart: () => {
    if (level) startLevel(level.id, { skipIntro: true });
  },
  onExit: () => location.assign("../"),
});

pauseButton.addEventListener("click", () => {
  if (screen === "game") pause.open("gracz");
});
root.querySelectorAll("[data-guide]").forEach((button) =>
  button.addEventListener("click", () => {
    const content = renderGuide(GUIDE, { atlas, sprites: TROJKI_SPRITES });
    openModal({
      title: "Jak grać — Sowie Trójki",
      content,
      className: "is-guide",
      actions: [{ label: "Rozumiem", primary: true, onClick: (close) => close() }],
    });
  }),
);
mapButton.addEventListener("click", () => {
  if (screen === "game") showMap();
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    if (screen === "game" && run?.state.phase === "play" && !pause.isOpen()) pause.open("tlo");
    save();
  }
  lastRaf = 0;
  lastFrame = 0;
  limiter.reset();
});

// ---------- Pętla ----------

function busy() {
  return (
    Boolean(press) ||
    performance.now() - lastInteraction < 1500 ||
    renderer.animating() ||
    owlView.animating() ||
    Boolean(director.current(clock())) ||
    hintShown ||
    Boolean(handMove)
  );
}

let lastRaf = 0;
let lastFrame = 0;

function frame(time) {
  requestAnimationFrame(frame);
  const rafDelta = lastRaf ? (time - lastRaf) / 1000 : 0;
  lastRaf = time;
  const target = busy() ? quality.fps() : Math.min(30, quality.fps());
  if (limiter.rate() !== target) limiter.setRate(target);
  if (lastFrame && !limiter.tick(rafDelta)) return;
  const dt = lastFrame ? Math.min(0.1, (time - lastFrame) / 1000) : 0;
  lastFrame = time;
  quality.sample(dt, target);
  meter.frame();
  if (screen !== "game" || !run) return;
  if (!testHold) renderer.update(dt);
  renderer.draw(dt);
  owlView.draw(dt, director.current(clock()), clock());
  // Podpowiedź po kilku sekundach bez ruchu, sen Sówki po 40 s.
  if (canAct()) {
    idle += dt;
    const after = settings().cozy ? HINT_AFTER_COZY : HINT_AFTER;
    if (!hintShown && idle >= after) {
      showHint();
      react({ type: "think" });
    }
    if (!sleeping && idle >= SLEEP_AFTER) {
      sleeping = true;
      react({ type: "sleep" });
    }
  }
}

// ---------- Start ----------

(async function start() {
  if (previewNote) previewNote.hidden = !PREVIEW;
  try {
    await cloud?.ready;
  } catch {
    // bez chmury — gra działa w pamięci
  }
  await loadProgress();
  ready = true;
  if (params.get("poziom")) {
    await startLevel(Number(params.get("poziom")) || 1, { skipIntro: params.get("nowosc") !== "1" });
  } else showMap();
  resize();
})();
requestAnimationFrame(frame);

fetch(new URL("audio.json", AUDIO_BASE))
  .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`audio.json: ${response.status}`))))
  .then((manifest) => {
    audio = createAudio({ manifest, baseUrl: AUDIO_BASE, preloadOnUnlock: GAME_SOUNDS });
    if (cloud) connectAudioSettings(audio, cloud);
    audio.bindUnlock(window, { ignore: (event) => Boolean(event.target?.closest?.("a[href]")) });
    if (screen === "game") audio.playMusic(MUSIC)?.catch?.(() => {});
  })
  .catch(() => {});

pauseButton.innerHTML = ICONS.pause;

// ---------- Haki testowe ----------

function settle() {
  for (let round = 0; round < 30 && (renderer.busy() || locked); round += 1) {
    renderer.skip();
    if (!renderer.busy() && locked && run?.state.phase === "play") locked = false;
  }
}

window.SowieTrojki = Object.freeze({
  ready: () => ready,
  atlasReady: () => atlas.ready(),
  screen: () => screen,
  preview: () => PREVIEW,
  level: () => level?.id ?? null,
  state: () =>
    run
      ? JSON.parse(
          JSON.stringify({
            phase: run.state.phase,
            moves: run.state.moves,
            score: run.state.score,
            joy: run.state.joy,
            stars: run.state.stars,
            goals: run.state.goals,
            giftUsed: run.state.giftUsed,
            stats: run.state.stats,
          }),
        )
      : null,
  progress: () => JSON.parse(JSON.stringify(progressState)),
  board: () => (run ? boardToText(run.board) : null),
  start: (id = 1, options = {}) => startLevel(id, { skipIntro: true, ...options }),
  map: () => showMap(),
  setLayout: (rows) => {
    setLayout(run.board, rows);
    renderer.sync(run.board);
  },
  setGoalDone: (at, done) => {
    run.state.goals[at].done = done;
    updateHud();
  },
  setMoves: (moves) => {
    run.state.moves = moves;
    updateHud();
  },
  setJoy: (value) => {
    run.state.joy = value;
    updateHud();
  },
  swap: (a, b) => attemptSwap(a, b),
  tap: (cell) => tapCell(cell),
  help: () => useHelp(),
  hint: () => run?.hint() ?? null,
  cellCenter: (cell) => renderer.cellCenter(cell),
  cellSize: () => renderer.cellSize(),
  busy: () => locked || renderer.busy(),
  settle,
  hold: (on = true) => {
    testHold = Boolean(on);
  },
  owl: () => ({ last: director.last(), current: director.current(clock()), view: owlView.state() }),
  bubble: () => (bubbleNode.hidden ? null : bubbleNode.textContent),
  music: () => audio?.currentMusic?.() ?? null,
  renderStats: () => renderer.stats(),
  quality: () => ({
    level: quality.level(),
    mode: quality.mode(),
    dpr: renderer.size().ratio,
    canvasWidth: boardCanvas.width,
    fps: limiter.rate(),
    busy: busy(),
  }),
  setQualityLevel: (value) => quality.setAutoLevel(value),
});
