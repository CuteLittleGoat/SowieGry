// Sowie Laboratorium — strona testowa do sprawdzania Sowiego Silnika na telefonie (Analiza 3, E2).
import { bindInput, createLoop, createShell, createView, DEFAULTS, measureSafeAreas } from "../shared/engine/index.js";
import { COSMETIC_SPRITES } from "../shared/world/owl.js";
import { createCharactersPanel } from "./characters.js";

const lab = document.querySelector("[data-lab]");
const stage = document.querySelector("[data-stage]");
const canvas = document.querySelector("[data-gesture-canvas]");
const context = canvas.getContext("2d");
const lastGesture = document.querySelector("[data-last-gesture]");
const log = document.querySelector("[data-gesture-log]");
const fpsNode = document.querySelector("[data-fps]");

const LABELS = {
  press: "Dotknięcie",
  tap: "Stuknięcie",
  holdstart: "Przytrzymanie",
  holdend: "Koniec przytrzymania",
  swipe: "Przesunięcie",
  dragstart: "Przeciąganie",
  drag: "Przeciąganie",
  dragend: "Koniec przeciągania",
  release: "Puszczenie",
  ignored: "Martwa strefa (gest pominięty)",
  pause: "Pauza (klawisz P)",
  menu: "Menu (Esc)",
};
const DIRECTIONS = { up: "w górę", down: "w dół", left: "w lewo", right: "w prawo" };

const view = createView({
  canvas,
  getSize: () => {
    const rect = stage.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  },
});
const trail = [];
let safe = measureSafeAreas();
let flash = 0;

function describe(event) {
  const label = LABELS[event.type] || event.type;
  return event.type === "swipe" ? `${label} ${DIRECTIONS[event.direction] || ""}`.trim() : label;
}

function onGesture(event) {
  if (event.type === "drag" || event.type === "release") return;
  if (event.type === "press") {
    trail.length = 0;
    flash = 1;
  }
  if (event.type === "pause") shell.pause("gracz");
  const text = describe(event);
  lastGesture.textContent = text;
  lastGesture.dataset.type = event.type === "swipe" ? `swipe-${event.direction}` : event.type;
  const item = document.createElement("li");
  item.textContent = `${new Date().toLocaleTimeString("pl-PL")} · ${text}`;
  log.prepend(item);
  while (log.children.length > 6) log.lastElementChild.remove();
}

stage.addEventListener("pointermove", (event) => {
  if (event.buttons === 0 && event.pointerType === "mouse") return;
  const rect = stage.getBoundingClientRect();
  trail.push({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  if (trail.length > 40) trail.shift();
});
bindInput(stage, onGesture);

function drawStage() {
  const layout = view.layout();
  view.applyScreen(context);
  const { cssWidth: width, cssHeight: height } = layout;
  context.clearRect(0, 0, width, height);
  // Martwe strefy przy krawędziach i przy dolnej krawędzi (+ pasek domowy).
  const zone = DEFAULTS.deadZone;
  context.fillStyle = "rgba(232, 70, 90, 0.18)";
  context.fillRect(0, 0, zone.left, height);
  context.fillRect(width - zone.right, 0, zone.right, height);
  context.fillRect(0, height - zone.bottom - safe.bottom, width, zone.bottom + safe.bottom);
  context.fillStyle = "rgba(59, 47, 74, 0.55)";
  context.font = "600 12px system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText("martwa strefa", width / 2, height - 6 - safe.bottom);
  // Ślad palca.
  if (trail.length > 1) {
    context.strokeStyle = "#3fae6a";
    context.lineWidth = 6;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(trail[0].x, trail[0].y);
    for (const point of trail) context.lineTo(point.x, point.y);
    context.stroke();
  }
  if (flash > 0 && trail.length) {
    const point = trail[trail.length - 1];
    context.fillStyle = `rgba(244, 197, 66, ${flash})`;
    context.beginPath();
    context.arc(point.x, point.y, 28, 0, Math.PI * 2);
    context.fill();
  }
}

// Dział „Postacie”: atlas grafik i animacje wszystkich postaci.
const characters = createCharactersPanel({ root: document.querySelector("[data-characters]") });
const charactersStatus = document.querySelector("[data-characters-status]");
const cosmeticsGroup = document.querySelector("[data-cosmetics]");
for (const key of Object.keys(COSMETIC_SPRITES)) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.dataset.cosmetic = key;
  chip.textContent = window.SowiePlatform?.COSMETICS?.[key]?.label || key;
  chip.setAttribute("aria-pressed", String(key === characters.cosmetic()));
  chip.addEventListener("click", () => {
    characters.setCosmetic(key);
    for (const other of cosmeticsGroup.children) other.setAttribute("aria-pressed", String(other === chip));
  });
  cosmeticsGroup.append(chip);
}
let activeTab = "postacie";

function refreshCharacters() {
  const started = performance.now();
  return characters
    .resize()
    .then((rebuilt) => {
      if (rebuilt) {
        const ms = Math.round(performance.now() - started);
        const count = characters.atlas.names().length;
        charactersStatus.textContent = `Atlas gotowy: ${count} grafik w ${ms} ms. Postacie ruszają się same.`;
      }
    })
    .catch((error) => {
      charactersStatus.textContent = "Nie udało się narysować postaci.";
      console.error(error);
    });
}

const loop = createLoop({
  update: (dt) => {
    flash = Math.max(0, flash - dt * 2);
    if (activeTab === "postacie") characters.update(dt);
  },
  render: () => {
    if (activeTab === "gesty") drawStage();
    else if (activeTab === "postacie") characters.render();
  },
});
const shell = createShell({ stage: lab, loop });

// Działy (?dzial=gesty otwiera od razu wybrany dział).
const tabs = [...document.querySelectorAll("[data-tab]")];
function showTab(name) {
  activeTab = tabs.some((tab) => tab.dataset.tab === name) ? name : "postacie";
  for (const tab of tabs) tab.setAttribute("aria-pressed", String(tab.dataset.tab === activeTab));
  for (const panel of document.querySelectorAll("[data-panel]")) panel.hidden = panel.dataset.panel !== activeTab;
  // Auto-pauza działa w dziale gestów (jak w trakcie gry).
  shell.setActive(activeTab === "gesty");
  view.resize();
  if (activeTab === "postacie") refreshCharacters();
}
for (const tab of tabs) tab.addEventListener("click", () => showTab(tab.dataset.tab));

// Informacje o urządzeniu.
const info = (key, value) => {
  const node = document.querySelector(`[data-info="${key}"]`);
  if (node && node.textContent !== value) node.textContent = value;
};
function refreshInfo() {
  const fps = Math.round(loop.fps());
  fpsNode.textContent = `${fps} kl./s`;
  info("fps", `${fps} kl./s`);
  info("screen", `${window.innerWidth} × ${window.innerHeight} px`);
  const vv = window.visualViewport;
  info("viewport", vv ? `${Math.round(vv.width)} × ${Math.round(vv.height)} px` : "—");
  info("dpr", `${window.devicePixelRatio || 1} (rysowanie: ${view.layout().pixelRatio})`);
  safe = measureSafeAreas();
  info("safe", `góra ${safe.top} · dół ${safe.bottom} · lewo ${safe.left} · prawo ${safe.right}`);
  info("mode", window.SowiePwa?.standalone() ? "aplikacja (ekran główny)" : "przeglądarka");
  info("sw", navigator.serviceWorker?.controller ? "gotowa" : "jeszcze nie");
  info("online", navigator.onLine === false ? "brak zasięgu" : "jest");
  info("cloud", window.SowieCloud?.status?.() || "—");
  info("saver", shell.batterySaver() ? "włączone (30 kl./s)" : "wyłączone");
  document.querySelector('[data-action="saver"]').setAttribute("aria-pressed", String(shell.batterySaver()));
}
setInterval(refreshInfo, 500);

document.querySelector('[data-action="pause"]').addEventListener("click", () => {
  shell.setActive(true);
  shell.pause("gracz");
});
document.querySelector('[data-action="saver"]').addEventListener("click", () => {
  shell.setBatterySaver(!shell.batterySaver());
  refreshInfo();
});
document.querySelector('[data-action="slow"]').addEventListener("click", () => shell.showSlowBanner());
document.querySelector('[data-action="safe"]').addEventListener("click", (event) => {
  const overlay = document.querySelector("[data-safe-overlay]");
  overlay.hidden = !overlay.hidden;
  event.currentTarget.setAttribute("aria-pressed", String(!overlay.hidden));
});
shell.onChange(() => {
  document.documentElement.dataset.shellState = shell.state();
});

window.addEventListener("resize", () => {
  view.resize();
  if (activeTab === "postacie") refreshCharacters();
});
view.resize();
showTab(new URLSearchParams(location.search).get("dzial") || "postacie");
refreshInfo();
loop.start();

// Dostęp dla testów e2e.
window.SowieLab = Object.freeze({ loop, shell, view, characters, atlas: characters.atlas });
