// Menu główne SowieGry (Analiza 2, rozdz. 4.1) — telefon w pionie najpierw.
// Zakładki: Gry (kręta ścieżka kart), Jak grać (instrukcje), Galeria (zdjęcia sów), Sowa (profil i ustawienia).
// Klasyczne skrypty strony (SowieCloud, SowieAcademy, SowieOwlGallery, SowiePwa) wykonują się przed tym modułem.
import { connectAudioSettings, createAudio } from "../engine/audio.js";
import { createLoop } from "../engine/loop.js";
import { createAtlas } from "../engine/sprites.js";
import { guideFor } from "../meta/guides-data.js";
import { taskProgress } from "../meta/progress.js";
import { renderGuide } from "../ui/guide-view.js";
import { ICONS } from "../ui/icons.js";
import { openModal } from "../ui/modal.js";
import { createToasts } from "../ui/toasts.js";
import { SPRITES, SVG_BASE } from "../world/catalog.js";
import { createOwlAnimator, drawOwl } from "../world/owl.js";
import { cloudStatusHtml, cloudStatusInfo } from "./cloud-status.js";
import { createGalleryTab } from "./gallery.js";
import { createArtState, drawCardArt, renderGameCards } from "./games.js";
import { renderGuidesTab } from "./guides.js";
import { renderInstallCard } from "./install.js";
import { createOwlTab } from "./owl-tab.js";

const cloud = window.SowieCloud;
const platform = window.SowiePlatform;
const TABS = ["gry", "jak-grac", "galeria", "sowa"];
const AUDIO_BASE = new URL("../../assets/audio/", import.meta.url).href;
const MENU_SOUNDS = ["klik", "hu-hu", "zakup", "rekord"];
const GREETINGS = [
  "Hu-hu! W co dziś gramy?",
  "Hu-hu! Miło Cię widzieć!",
  "Pracu Pracu znowu coś kombinuje…",
  "Kózki uciekły do szklarni!",
  "Liście monstery same się nie zbiorą!",
];
const dpr = () => Math.min(2, window.devicePixelRatio || 1);
const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
const calm = () =>
  Boolean(motionQuery?.matches) || document.documentElement.classList.contains("sowie-reduced-effects");
const profile = () => cloud?.profile?.() || {};
const cosmetic = () => profile().cosmetics?.selected || "none";

// ---------- Ikony, komunikaty ----------

for (const node of document.querySelectorAll("[data-icon]")) node.innerHTML = ICONS[node.dataset.icon] || "";
const settingsButton = document.querySelector("[data-open-settings]");
settingsButton.innerHTML = ICONS.settings;

const toasts = createToasts({ root: document.body });
// Akademia i Galeria wysyłają komunikaty przez window.SowieNotifications (w grach: shared/notification-manager.js).
window.SowieNotifications ||= {
  toast({ title = "", detail = "", reward = "", kind = "info" } = {}) {
    const text = [title, detail, reward].filter(Boolean).join(" · ");
    return toasts.show(text, { kind: kind === "important" || kind === "mission" ? "reward" : "info", duration: 3200 });
  },
};

// ---------- Atlas postaci i dźwięk ----------

const atlas = createAtlas({ catalog: SPRITES, baseUrl: SVG_BASE });
let audio = null;

// Efekt po odblokowaniu dźwięku (pierwsze dotknięcie); przy pierwszym użyciu czeka na wczytanie pliku.
function sound(name) {
  if (!audio?.state().unlocked) return;
  audio.preload([name]).then(() => {
    try {
      audio.play(name);
    } catch (_error) {
      // Brak dźwięku nie przeszkadza w menu.
    }
  });
}

fetch(new URL("audio.json", AUDIO_BASE))
  .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`audio.json: ${response.status}`))))
  .then((manifest) => {
    audio = createAudio({ manifest, baseUrl: AUDIO_BASE, preloadOnUnlock: MENU_SOUNDS });
    connectAudioSettings(audio, cloud);
    audio.bindUnlock(window);
    // Cicha muzyka menu po pierwszym dotknięciu (zgodnie z ustawieniami: głośność muzyki > 0).
    audio.onChange((state) => {
      owlTab.updateAudio();
      if (state.unlocked && !state.music && state.volumes.music > 0 && state.volumes.master > 0) {
        audio.playMusic("menu").catch(() => {});
      }
    });
    owlTab.updateAudio();
  })
  .catch((error) => console.warn("SowieGry: menu bez dźwięku", error));

// Kliknięcia przycisków i odnośników.
document.addEventListener("click", (event) => {
  if (event.target.closest("button:not([disabled]), a[href]")) sound("klik");
});

// ---------- Zakładki ----------

const tabButtons = [...document.querySelectorAll("[data-tab]")];
const panels = [...document.querySelectorAll("[data-panel]")];
let current = "gry";
const shownOnce = new Set();

function selectTab(id, { focus = false, scroll = true } = {}) {
  if (!TABS.includes(id)) id = "gry";
  const changed = id !== current;
  current = id;
  for (const button of tabButtons) {
    const on = button.dataset.tab === id;
    button.setAttribute("aria-selected", String(on));
    button.tabIndex = on ? 0 : -1;
  }
  for (const panel of panels) panel.hidden = panel.dataset.panel !== id;
  // Adres pokazuje zakładkę (#galeria…); odnośnik do instrukcji jednej gry (#jak-grac-runner) zostaje bez zmian.
  const hash = id === "gry" ? "" : `#${id}`;
  const guideLink = id === "jak-grac" && location.hash.startsWith("#jak-grac-");
  if (!guideLink && location.hash !== hash) {
    history.replaceState(null, "", `${location.pathname}${location.search}${hash}`);
  }
  if (changed && scroll) window.scrollTo({ top: 0 });
  onShow(id);
  if (focus) tabButtons.find((button) => button.dataset.tab === id)?.focus();
}

const tablist = document.querySelector("[role=tablist]");
tablist.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tab]");
  if (button) selectTab(button.dataset.tab);
});
tablist.addEventListener("keydown", (event) => {
  const index = TABS.indexOf(current);
  const next = {
    ArrowRight: (index + 1) % TABS.length,
    ArrowLeft: (index - 1 + TABS.length) % TABS.length,
    Home: 0,
    End: TABS.length - 1,
  }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  selectTab(TABS[next], { focus: true });
});

function onShow(id) {
  const first = !shownOnce.has(id);
  shownOnce.add(id);
  if (id === "jak-grac" && (first || guidesDirty)) renderGuides();
  else if (id === "galeria") galleryTab.render();
  else if (id === "sowa") renderOwlTab();
  if (id === "gry") requestAnimationFrame(layout);
}

// ---------- Nagłówek: stan zapisu, sówka, zadania ----------

const statusNode = document.querySelector("[data-cloud-status]");
function showStatus(status) {
  const mode = cloud?.mode?.() || "firestore";
  statusNode.dataset.state = mode === "memory" ? "test" : status;
  statusNode.innerHTML = cloudStatusHtml(status, mode);
  statusNode.setAttribute("aria-label", `Zapis: ${cloudStatusInfo(status, mode).long}`);
  owlTab.updateStatus(status);
}

const heroButton = document.querySelector("[data-hero-owl]");
const heroCanvas = heroButton.querySelector("canvas");
const heroText = document.querySelector("[data-hero-text]");
const heroTasks = document.querySelector("[data-hero-tasks]");
const hero = { owl: createOwlAnimator(), jump: -1, cheer: 0, greeting: 0 };

heroButton.addEventListener("click", () => {
  hero.jump = 0;
  hero.greeting = (hero.greeting + 1) % GREETINGS.length;
  heroText.textContent = GREETINGS[hero.greeting];
  sound("hu-hu");
  if (calm()) drawHero();
});

function renderHeroTasks() {
  const tasks = taskProgress(window.SowieAcademy?.snapshot?.()).filter((task) => task.id !== "weekly");
  if (!tasks.length) {
    heroTasks.replaceChildren();
    return;
  }
  const done = tasks.filter((task) => task.done).length;
  heroTasks.innerHTML = `${tasks.map((task) => `<span class="menu-dot${task.done ? " is-done" : ""}" aria-hidden="true"></span>`).join("")}<span class="menu-hero-count">Zadania dnia: ${done} / ${tasks.length}</span>`;
}

function drawHero() {
  if (!atlas.ready()) return;
  const size = heroCanvas.clientWidth || 112;
  const pixels = Math.round(size * dpr());
  if (heroCanvas.width !== pixels) {
    heroCanvas.width = pixels;
    heroCanvas.height = pixels;
  }
  const context = heroCanvas.getContext("2d");
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, pixels, pixels);
  const unit = pixels / 1.7;
  context.setTransform(unit, 0, 0, unit, 0, 0);
  const t = hero.jump >= 0 ? hero.jump / 0.55 : -1;
  const lift = t >= 0 && t <= 1 ? 4 * 0.28 * t * (1 - t) : 0;
  drawOwl(context, atlas, 0.85, 1.6 - lift, {
    state: hero.owl.state(),
    size: 1.1,
    cosmetic: cosmetic(),
    lift: lift / 0.28,
  });
}

function updateHero(step) {
  if (hero.jump >= 0) {
    hero.jump += step;
    hero.owl.set("skok");
    if (hero.jump > 0.55) {
      hero.jump = -1;
      hero.cheer = 1.1;
      hero.owl.land(0.8);
    }
  } else if (hero.cheer > 0) {
    hero.cheer -= step;
    hero.owl.set("radosc");
  } else hero.owl.set("stoi");
  hero.owl.update(step);
}

// ---------- Zakładka „Gry” ----------

const pathRoot = document.querySelector("[data-game-path]");
const cards = renderGameCards({
  root: pathRoot,
  platform,
  onGuide: (gameId, trigger) => openGuide(gameId, trigger),
});
for (const card of cards.cards) card.art = createArtState();

function openGuide(gameId, trigger) {
  const guide = guideFor(gameId);
  const game = platform.GAME_REGISTRY.find((entry) => entry.id === gameId);
  if (!guide) return;
  openModal({
    title: `Jak grać — ${guide.title}`,
    content: renderGuide(guide, { atlas, sprites: SPRITES }),
    className: "is-guide",
    actions: [
      { label: "Rozumiem", onClick: (close) => close() },
      { label: "Graj", primary: true, onClick: () => game && location.assign(game.path) },
    ],
    onClose: () => trigger?.focus?.({ preventScroll: true }),
  });
}

function updateRecords() {
  cards.updateRecords(profile().records || {}, Boolean(cloud?.isReady?.()));
  requestAnimationFrame(layout);
}

// Rozmiar płócien kart i ścieżka (po zmianie szerokości, obrocie telefonu, wczytaniu rekordów).
function layout() {
  if (current !== "gry") return;
  cards.layoutPath();
  for (const card of cards.cards) {
    const box = card.canvas.getBoundingClientRect();
    if (!box.width) continue;
    const width = Math.round(box.width * dpr());
    const height = Math.round(box.height * dpr());
    if (card.canvas.width !== width || card.canvas.height !== height) {
      card.canvas.width = width;
      card.canvas.height = height;
      card.dirty = true;
    }
  }
  if (calm()) drawStatic();
}

new ResizeObserver(() => layout()).observe(pathRoot);

// Rysujemy tylko karty widoczne na ekranie.
const visibility = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const card = cards.cards.find((item) => item.canvas === entry.target);
    if (card) card.visible = entry.isIntersecting;
  }
});
for (const card of cards.cards) visibility.observe(card.canvas);

function drawCard(card, time) {
  if (!atlas.ready() || !card.canvas.width) return;
  const context = card.canvas.getContext("2d");
  const scale = dpr();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, card.canvas.width, card.canvas.height);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  card.art.cosmetic = cosmetic();
  drawCardArt(context, atlas, card.game.id, time, card.canvas.width / scale, card.canvas.height / scale, card.art);
  card.dirty = false;
}

// Ograniczenie ruchu: jedna nieruchoma klatka zamiast animacji.
function drawStatic() {
  for (const card of cards.cards) drawCard(card, 0.3);
  drawHero();
}

let time = 0;
let frames = 0;
const loop = createLoop({
  step: 1 / 60,
  update(step) {
    time += step;
    updateHero(step);
    for (const card of cards.cards) card.art.owl.update(step);
  },
  render() {
    frames += 1;
    drawHero();
    if (current !== "gry") return;
    for (const card of cards.cards) if (card.visible || card.dirty) drawCard(card, time);
  },
});
loop.setRenderRate(30);

function startAnimation() {
  if (!atlas.ready()) return;
  if (calm()) {
    loop.stop();
    drawStatic();
  } else loop.start();
}
motionQuery?.addEventListener?.("change", startAnimation);

// ---------- Zakładka „Jak grać” ----------

const guidesRoot = document.querySelector("[data-guides]");
let guidesDirty = false;

function renderGuides() {
  renderGuidesTab({ root: guidesRoot, atlas });
  guidesDirty = !atlas.ready();
}

// ---------- Zakładka „Galeria” ----------

const galleryTab = createGalleryTab({
  root: document.querySelector("#galeria"),
  gallery: () => window.SowieOwlGallery,
  academy: () => window.SowieAcademy,
  onSound: sound,
  onBackground: applyBackground,
});

// Zdjęcie z galerii jako tło menu (miniatura 600 px pod półprzezroczystym niebem).
function applyBackground() {
  const gallery = window.SowieOwlGallery;
  if (!gallery?.isLoaded?.()) return;
  const id = gallery.snapshot().background;
  const photo = gallery.PHOTOS.find((item) => item.id === id);
  document.body.classList.toggle("has-photo", Boolean(photo));
  if (photo) document.body.style.setProperty("--menu-photo", `url("${gallery.thumbUrl(photo, 600)}")`);
  else document.body.style.removeProperty("--menu-photo");
}

// ---------- Zakładka „Sowa” ----------

const owlTab = createOwlTab({
  root: document.querySelector("[data-owl-tab]"),
  cloud,
  platform,
  academy: () => window.SowieAcademy,
  audio: () => audio,
  atlas: () => atlas,
  onCosmetic: () => {
    for (const card of cards.cards) card.dirty = true;
    hero.jump = 0;
    if (calm()) drawStatic();
  },
});
let offOwlInstall = () => {};

function renderOwlTab() {
  offOwlInstall();
  owlTab.render();
  offOwlInstall = renderInstallCard(document.querySelector('[data-install-slot="sowa"]'));
}

settingsButton.addEventListener("click", () => {
  selectTab("sowa");
  const target = document.getElementById("ustawienia");
  target?.scrollIntoView({ block: "start", behavior: calm() ? "auto" : "smooth" });
  target?.focus({ preventScroll: true });
});

renderInstallCard(document.querySelector("#gry [data-install-slot]"));

// ---------- Dane z chmury ----------

function refreshAll() {
  const settings = profile().settings || {};
  document.documentElement.classList.toggle("sowie-reduced-effects", Boolean(settings.reducedEffects));
  updateRecords();
  renderHeroTasks();
  applyBackground();
  for (const card of cards.cards) card.dirty = true;
  if (current === "sowa") renderOwlTab();
  if (current === "galeria") galleryTab.render();
  startAnimation();
}

cloud?.onStatus?.(showStatus);
cloud?.ready?.then(refreshAll);
cloud?.onProfileReload?.(refreshAll);
window.addEventListener("sowie:academy-changed", () => {
  renderHeroTasks();
  if (current === "sowa") renderOwlTab();
  if (current === "galeria") galleryTab.render();
});
window.addEventListener("sowie:gallery-changed", () => {
  applyBackground();
  if (current === "galeria" && !galleryTab.viewer()) galleryTab.render();
});
// Powrót z gry przyciskiem „wstecz” (strona z pamięci podręcznej przeglądarki) — świeże rekordy i zadania.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) location.reload();
});

atlas
  .ensure(80 * dpr())
  .then(() => {
    for (const card of cards.cards) card.dirty = true;
    if (guidesDirty && current !== "jak-grac") renderGuides();
    if (current === "sowa") owlTab.drawProfileOwl();
    layout();
    startAnimation();
  })
  .catch((error) => console.warn("SowieGry: nie udało się przygotować grafik menu", error));

// ---------- Start ----------

updateRecords();
renderHeroTasks();
// Adres z zakładką (#galeria, #sowa…) albo z instrukcją jednej gry (#jak-grac-runner).
const startHash = decodeURIComponent(location.hash.slice(1));
const guideLink = /^jak-grac-.+/.test(startHash);
selectTab(guideLink ? "jak-grac" : startHash, { scroll: false });
if (guideLink) document.getElementById(startHash)?.scrollIntoView({ block: "start" });

// Dostęp dla testów e2e i Laboratorium.
window.SowieMenu = Object.freeze({
  selectTab,
  tab: () => current,
  atlas,
  audio: () => audio,
  gallery: galleryTab,
  owl: owlTab,
  frames: () => frames,
  animating: () => loop.isRunning(),
});
