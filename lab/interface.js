// Dział „Interfejs” Sowiego Laboratorium: HUD, komunikaty (1 naraz w grze), menu pauzy z odliczaniem,
// ekran wyników, okno z instrukcją i SowieProgress — na małej planszy z biegnącą sową.
import { createShell, drawShadow } from "../shared/engine/index.js";
import { EVENTS, progress } from "../shared/meta/progress.js";
import { guideFor } from "../shared/meta/guides-data.js";
import { createHud, createPauseMenu, createResults, createToasts, openModal, renderGuide } from "../shared/ui/index.js";
import { SPRITES } from "../shared/world/catalog.js";
import { createOwlAnimator, drawOwl } from "../shared/world/owl.js";
import { COLORS } from "../shared/world/tokens.js";

const GAME_ID = "laboratorium";
const MAX_LIVES = 3;
// Przykładowe zadania, gdy strona nie ma Sowiej Akademii (Laboratorium nie zmienia prawdziwych misji).
const DEMO_TASKS = [
  { id: "demo-liscie", label: "Zbierz 20 liści w jednym biegu", target: 20 },
  { id: "demo-zloty", label: "Złap 2 złote liście", target: 2 },
];

export function createInterfaceDemo({ root, loop, atlas, soundReady }) {
  const stage = root.querySelector("[data-ui-stage]");
  const canvas = stage.querySelector("canvas");
  const context = canvas.getContext("2d");
  const owl = createOwlAnimator();
  owl.set("bieg");
  let audio = null;
  soundReady?.then((panel) => (audio = panel?.audio ?? null));
  const state = {
    score: 0,
    leaves: 0,
    golden: 0,
    lives: MAX_LIVES,
    best: 0,
    running: false,
    top: [],
    shield: 0,
    time: 0,
  };
  let active = false;

  const shell = createShell({ stage, loop, overlay: false });
  const inGame = () => active && state.running && shell.state() === "running" && !results.isOpen();
  const hud = createHud({ root: stage, onPause: () => shell.pause("gracz"), maxLives: MAX_LIVES });
  const toasts = createToasts({ root: stage, isInGame: inGame });
  const pause = createPauseMenu({
    root: stage,
    shell,
    gameId: "swiat",
    audio: () => audio,
    atlas,
    sprites: SPRITES,
    onRestart: () => startRun(),
    onResume: () => toasts.refresh(),
  });
  const results = createResults({ root: stage, onAgain: () => startRun() });

  function play(name, options) {
    audio?.play(name, options);
  }

  function startRun() {
    results.hide();
    Object.assign(state, { score: 0, leaves: 0, golden: 0, lives: MAX_LIVES, running: true, shield: 0 });
    progress.beginRun(GAME_ID, { difficulty: "arcade" });
    hud.setScore(0, { animate: false });
    hud.setLeaves(0);
    hud.setLives(MAX_LIVES, MAX_LIVES);
    hud.setPowerups([]);
    owl.set("bieg");
    shell.setActive(active);
    toasts.refresh();
  }

  function endRun() {
    if (!state.running) return;
    state.running = false;
    shell.setActive(false);
    owl.set(state.lives > 0 ? "radosc" : "oszolomienie");
    const summary = progress.endRun({ score: state.score, distance: Math.round(state.time * 8) });
    const isRecord = state.score > state.best;
    state.best = Math.max(state.best, state.score);
    state.top = [...state.top, state.score].sort((a, b) => b - a).slice(0, 10);
    const tasks = summary.tasks.length
      ? summary.tasks
      : DEMO_TASKS.map((task) => {
          const value = task.id === "demo-zloty" ? state.golden : summary.leaves.total;
          return { ...task, progress: Math.min(task.target, value), done: value >= task.target };
        });
    if (isRecord) play("rekord");
    else play("koniec-gry");
    toasts.clear();
    results.show({
      title: state.lives > 0 ? "Koniec biegu!" : "Ojej, piórka w nieładzie!",
      score: state.score,
      best: state.best,
      isRecord,
      leaves: summary.leaves.total,
      rank: state.top.indexOf(state.score) + 1,
      tasks,
      extra: [{ label: "Kózki", value: String(Object.values(summary.goats).reduce((sum, value) => sum + value, 0)) }],
      messages: toasts.takeDeferred(),
    });
  }

  function addLeaf(kind) {
    if (!state.running) return;
    const points = { zielony: 10, zloty: 50, teczowy: 100 }[kind];
    const count = kind === "zloty" ? 5 : 1;
    progress.emit(EVENTS.LEAF, { kind, points, count });
    state.leaves += count;
    state.score += points;
    hud.setScore(state.score);
    hud.setLeaves(state.leaves);
    play(kind === "zielony" ? "lisc" : `lisc-${kind}`);
    if (kind === "zloty") {
      state.golden += 1;
      toasts.show("Złoty liść! +50", { kind: "reward", key: "zloty" });
      toasts.defer(`Zadanie „Złap 2 złote liście”: ${Math.min(2, state.golden)} / 2`);
    }
  }

  const actions = {
    lisc: () => addLeaf("zielony"),
    zloty: () => addLeaf("zloty"),
    kozka: () => {
      if (!state.running) return;
      progress.emit(EVENTS.GOAT, { kind: "tarcza" });
      state.shield = 10;
      play("koza-meee");
      toasts.show("Tarcza! Chroni przed 1 trafieniem", { kind: "success", key: "tarcza" });
    },
    trafienie: () => {
      if (!state.running) return;
      if (state.shield > 0) {
        state.shield = 0;
        toasts.show("Tarcza pękła — nic się nie stało!", { kind: "success" });
        return;
      }
      progress.emit(EVENTS.HIT, { by: "pracu", variant: "dymek" });
      state.lives -= 1;
      hud.setLives(state.lives, MAX_LIVES);
      play("trafienie-pracu");
      audio?.vibrate(25);
      owl.set("oszolomienie");
      setTimeout(() => state.running && owl.set("bieg"), 900);
      toasts.show("Ojej! Pracu pracu!", { kind: "warn", key: "trafienie" });
      if (state.lives <= 0) setTimeout(endRun, 600);
    },
    komunikaty: () => {
      ["O włos nad Amic! +25", "Seria liści ×3", "Uwaga: nadciąga wiatr…", "Combo ×4!", "Brawo!"].forEach(
        (text, index) => toasts.show(text, { priority: index === 2 ? 1 : 0 }),
      );
    },
    pauza: () => shell.pause("gracz"),
    koniec: () => endRun(),
    okno: () => {
      openModal({
        title: "Poznaj Sowi Świat",
        content: renderGuide(guideFor("swiat"), { atlas, sprites: SPRITES }),
        root: document.body,
        actions: [{ label: "Rozumiem", primary: true, onClick: (close) => close() }],
      });
    },
  };
  root.addEventListener("click", (event) => {
    const action = event.target.closest("[data-ui-action]")?.dataset.uiAction;
    if (action && actions[action]) {
      audio?.unlock();
      actions[action]();
    }
  });

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = stage.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }

  function update(dt) {
    owl.update(dt);
    if (!state.running || shell.state() !== "running") return;
    state.time += dt;
    if (state.shield > 0) {
      state.shield = Math.max(0, state.shield - dt);
      hud.setPowerups(state.shield > 0 ? [{ kind: "tarcza", remaining: state.shield, total: 10 }] : []);
    }
  }

  function render() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, COLORS.nieboGora);
    sky.addColorStop(1, COLORS.nieboDol);
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);
    const ground = height - 40;
    context.fillStyle = COLORS.monstera;
    context.fillRect(0, ground, width, 40);
    context.fillStyle = COLORS.monsteraCiemna;
    const offset = (state.time * 120) % 40;
    for (let x = -offset; x < width; x += 40) context.fillRect(x, ground, 20, 6);
    if (!atlas.ready()) return;
    const unit = 64;
    context.save();
    context.translate(width * 0.3, ground);
    context.scale(unit, unit);
    drawShadow(context, 0, 0, 0.84);
    drawOwl(context, atlas, 0, 0, { state: owl.state(), shadow: false });
    context.restore();
  }

  return {
    hud,
    toasts,
    pause,
    results,
    shell,
    state: () => ({ ...state, inGame: inGame() }),
    setActive(value) {
      active = value;
      shell.setActive(value && state.running);
      resize();
      if (value && !state.running && !results.isOpen()) startRun();
      toasts.refresh();
    },
    resize,
    update,
    render,
  };
}
