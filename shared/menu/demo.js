// Menu wersji demo (E10, uwaga właściciela G2 — demo.html): karty pięciu gier z ilustracjami jak w menu głównym,
// „Jak grać?” i muzyka menu, bez Galerii, zakładki „Sowa”, rekordów i hasła. Postęp gier jest tylko w pamięci strony
// (SowieCloud w trybie demo — shared/sowie-cloud.js), a odnośniki „Graj” mają `?demo=1`.
import { createAudio } from "../engine/audio.js";
import { createLoop } from "../engine/loop.js";
import { createAtlas } from "../engine/sprites.js";
import { guideFor } from "../meta/guides-data.js";
import { renderGuide } from "../ui/guide-view.js";
import { openModal } from "../ui/modal.js";
import { SPRITES, SVG_BASE } from "../world/catalog.js";
import { createOwlAnimator, drawOwl } from "../world/owl.js";
import { createArtState, drawCardArt, renderGameCards } from "./games.js";

const platform = window.SowiePlatform;
const AUDIO_BASE = new URL("../../assets/audio/", import.meta.url).href;
const MENU_SOUNDS = ["klik", "hu-hu"];
const GREETINGS = [
  "Hu-hu! To wersja pokazowa — wybierz grę i graj od razu!",
  "Hu-hu! Miło Cię widzieć!",
  "Pracu Pracu znowu coś kombinuje…",
  "Kózki uciekły do szklarni!",
];
const dpr = () => Math.min(2, window.devicePixelRatio || 1);
const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
const calm = () => Boolean(motionQuery?.matches);

/** Adres gry w wersji demo (znacznik `demo=1` w adresie — działa także bez pamięci karty przeglądarki). */
export function demoGameUrl(path) {
  return `${path}?demo=1`;
}

// ---------- Dźwięk: efekty i muzyka menu po pierwszym dotknięciu; przycisk wycisza muzykę (tylko w tej karcie) ----------

const soundButton = document.querySelector("[data-demo-sound]");
let audio = null;
let musicOn = true;

function updateSoundButton() {
  soundButton.textContent = musicOn ? "🔊" : "🔇";
  soundButton.setAttribute("aria-pressed", String(musicOn));
  soundButton.setAttribute("aria-label", musicOn ? "Muzyka w menu: włączona" : "Muzyka w menu: wyłączona");
}
updateSoundButton();

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
    audio.bindUnlock(window, { ignore: (event) => Boolean(event.target?.closest?.("a[href]")) });
    audio.onChange((state) => {
      if (state.unlocked && musicOn && !state.music) audio.playMusic("menu").catch(() => {});
    });
  })
  .catch((error) => console.warn("SowieGry demo: menu bez dźwięku", error));

soundButton.addEventListener("click", () => {
  musicOn = !musicOn;
  updateSoundButton();
  if (!audio) return;
  if (musicOn) audio.playMusic("menu").catch(() => {});
  else audio.stopMusic();
});

document.addEventListener("click", (event) => {
  if (event.target.closest("button:not([disabled])")) sound("klik");
});

// ---------- Sówka w dymku ----------

const atlas = createAtlas({ catalog: SPRITES, baseUrl: SVG_BASE });
const heroButton = document.querySelector("[data-hero-owl]");
const heroCanvas = heroButton.querySelector("canvas");
const heroText = document.querySelector("[data-hero-text]");
const hero = { owl: createOwlAnimator(), jump: -1, cheer: 0, greeting: 0 };

heroButton.addEventListener("click", () => {
  hero.jump = 0;
  hero.greeting = (hero.greeting + 1) % GREETINGS.length;
  heroText.textContent = GREETINGS[hero.greeting];
  sound("hu-hu");
  if (calm()) drawHero();
});

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
  drawOwl(context, atlas, 0.85, 1.6 - lift, { state: hero.owl.state(), size: 1.1, lift: lift / 0.28 });
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

// ---------- Karty gier ----------

const pathRoot = document.querySelector("[data-game-path]");
const cards = renderGameCards({ root: pathRoot, platform, onGuide: (gameId, trigger) => openGuide(gameId, trigger) });
for (const card of cards.cards) {
  card.art = createArtState();
  card.card.querySelector("[data-play]").href = demoGameUrl(card.game.path);
}

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
      { label: "Graj", primary: true, onClick: () => game && location.assign(demoGameUrl(game.path)) },
    ],
    onClose: () => trigger?.focus?.({ preventScroll: true }),
  });
}

function layout() {
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
  drawCardArt(context, atlas, card.game.id, time, card.canvas.width / scale, card.canvas.height / scale, card.art);
  card.dirty = false;
}

function drawStatic() {
  for (const card of cards.cards) drawCard(card, 0.3);
  drawHero();
}

let time = 0;
const loop = createLoop({
  step: 1 / 60,
  update(step) {
    time += step;
    updateHero(step);
    for (const card of cards.cards) card.art.owl.update(step);
  },
  render() {
    drawHero();
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

atlas
  .ensure(80 * dpr())
  .then(() => {
    for (const card of cards.cards) card.dirty = true;
    layout();
    startAnimation();
  })
  .catch((error) => console.warn("SowieGry demo: nie udało się przygotować grafik", error));

requestAnimationFrame(layout);

// Dostęp dla testów e2e.
window.SowieDemo = Object.freeze({
  atlas,
  audio: () => audio,
  musicOn: () => musicOn,
  animating: () => loop.isRunning(),
});
