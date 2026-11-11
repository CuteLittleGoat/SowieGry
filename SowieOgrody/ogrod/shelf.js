// Sowie Ogrody — półka z roślinami (uwaga z testów 2026-11-11: „rośliny były duże i przesuwały się w linii tak, aby
// można było widzieć wszystkie i aby nie znikały z półki i nie robiły się małe”). Wszystkie posiadane gatunki stoją
// w jednej linii, każdy w miejscu na swoją wielkość (etap wyglądu), więc rośliny nie maleją, gdy przybywa gatunków,
// i żaden nie znika z półki. Linię przesuwa się w bok: strzałkami po bokach ogrodu, palcem albo myszą (z rozpędem),
// klawiszami ← → i kółkiem myszy. Czysta logika bez DOM i płótna, w jednostkach ogrodu (piksele CSS / gardenUnit —
// przesunięcie nie zmienia się przy obrocie telefonu); rysuje render.js, gesty i strzałki podpina main.js.
import { PLANTS } from "./config.js";
import { plantStage } from "./economy.js";

export const SHELF = Object.freeze({
  // Powiększenie roślin względem rysunku sprzed zmiany (pełna wielkość w jednym rzędzie).
  scale: 1.2,
  // Szerokość miejsca na roślinę według etapu wyglądu 1–5 (jednostki ogrodu): liście i podpis „×N” bez tłoku.
  slots: Object.freeze([0, 64, 70, 80, 96, 120]),
  // Gdy linia jest dłuższa od ogrodu najwyżej o 8%, miejsca zwężają się do szerokości ogrodu (bez przewijania o kilka
  // pikseli); rośliny zostają tej samej wielkości.
  squeeze: 0.08,
  // Doniczki stoją na 87% wysokości ogrodu (pod nimi podpis „×N”).
  baseline: 0.87,
  // Przesunięcie palca o co najmniej tyle pikseli to przesuwanie, a nie stuknięcie.
  dragThreshold: 10,
  // Rozpęd po puszczeniu palca: wytracanie (1/s), najmniejsza prędkość (jednostki/s).
  friction: 3.5,
  minSpeed: 12,
  // Dojazd do celu (strzałka, kółko myszy, pokazanie rośliny): tempo zbliżania się (1/s).
  ease: 10,
});

/** Gatunki na półce: wszystkie posiadane, w kolejności z PLANTS (od Parapetu po Księżycowy ogród). */
export function shelfPlants(state) {
  return PLANTS.filter((item) => (state.plants?.[item.id] || 0) > 0);
}

/** Skala rysunku rośliny: rośnie z etapem wyglądu, nie zależy od liczby gatunków na półce. */
export function plantScale(stage, unit) {
  return (0.7 + stage * 0.12) * unit * SHELF.scale;
}

/**
 * Układ półki (jednostki ogrodu) dla ogrodu szerokiego na `view` jednostek: rośliny jedna obok drugiej, każda
 * w miejscu `SHELF.slots[etap]`. Gdy wszystkie się mieszczą, rozstawione są na całą szerokość ogrodu: w równych
 * miejscach (jak dawniej — np. dwie na 1/4 i 3/4), a gdy równe miejsce byłoby za ciasne dla największej — wolne
 * miejsce dzielone jest po równo; gdy linia jest dłuższa najwyżej o `SHELF.squeeze`, miejsca się zwężają.
 * → { items: [{ item, id, stage, start, width, center }], content, view, max } (`max` — największe przesunięcie).
 */
export function shelfLayout(state, view) {
  const owned = shelfPlants(state);
  const stages = owned.map((item) => plantStage(state.plants[item.id]));
  const widths = stages.map((stage) => SHELF.slots[Math.min(Math.max(stage, 1), SHELF.slots.length - 1)]);
  const total = widths.reduce((sum, width) => sum + width, 0);
  const fits = total <= view * (1 + SHELF.squeeze);
  const even = owned.length ? view / owned.length : 0;
  const ratio = fits && total > view ? view / total : 1;
  const extra = fits && total < view && owned.length ? (view - total) / owned.length : 0;
  const equal = fits && total < view && widths.every((width) => width <= even);
  let start = 0;
  const items = owned.map((item, index) => {
    const width = equal ? even : widths[index] * ratio + extra;
    const entry = { item, id: item.id, stage: stages[index], start, width, center: start + width / 2 };
    start += width;
    return entry;
  });
  return { items, content: start, view, max: Math.max(0, start - view) };
}

/**
 * Prędkość palca (px/s) z ruchu w ostatnich `windowMs` ms; gdy palec stanął przed puszczeniem (ponad połowę okna)
 * albo ruch trwał krócej niż 16 ms (np. zdarzenia wysłane naraz) — 0; najwyżej ±6000 px/s.
 */
export function createVelocity(windowMs = 100) {
  const minSpan = 16;
  const maxSpeed = 6000;
  let samples = [];
  return {
    reset() {
      samples = [];
    },
    add(x, time) {
      samples.push({ x, time });
      samples = samples.filter((sample) => time - sample.time <= windowMs);
    },
    value(time) {
      if (samples.length < 2) return 0;
      const first = samples[0];
      const last = samples[samples.length - 1];
      if (time - last.time > windowMs / 2) return 0;
      const span = last.time - first.time;
      if (span < minSpan) return 0;
      return Math.max(-maxSpeed, Math.min(maxSpeed, ((last.x - first.x) / span) * 1000));
    },
  };
}

/**
 * createShelfScroll({ instant }) — przesuwanie półki (jednostki ogrodu; przesunięcie 0 = początek linii z lewej).
 * `instant()` → true: bez animacji i rozpędu (ograniczony ruch w systemie albo „Efekty” wyłączone w ustawieniach).
 * Każda klatka: `sync(shelfLayout(...))` (nowe granice; przy zmianie układu widok trzyma się pierwszej widocznej
 * rośliny, a stojący na końcu linii zostaje na końcu), potem `update(dt)`. Sterowanie: `grab()` / `drag(dx)` /
 * `release(prędkość)` (palec), `page(±1)` (strzałka: roślina ucięta przy krawędzi staje się pierwszą z drugiej
 * strony), `nudge(dx)` (kółko myszy), `reveal(id, { center })` (pokazanie rośliny w najbliższej klatce), `toEnd()`
 * (koniec linii w najbliższej klatce). `info()` → { offset, max, view, scrollable, canPrev, canNext, moving }.
 */
export function createShelfScroll({ instant = () => false } = {}) {
  let offset = 0;
  let target = 0;
  let velocity = 0;
  // idle — stoi, drag — prowadzi palec, fling — jedzie z rozpędu, glide — dojeżdża do celu.
  let mode = "idle";
  let max = 0;
  let view = 0;
  let items = [];
  let pending = null;

  const clamp = (value) => Math.min(max, Math.max(0, value));
  const aim = () => (mode === "glide" ? target : offset);

  function glideTo(value) {
    target = clamp(value);
    velocity = 0;
    if (instant() || Math.abs(target - offset) < 0.5) {
      offset = target;
      mode = "idle";
    } else mode = "glide";
  }

  // Cała roślina w widoku (przy `center` — na środku); gdy już widać ją całą, półka stoi.
  function reveal({ id, center }) {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    if (center) glideTo(item.center - view / 2);
    else if (item.start < offset) glideTo(item.start);
    else if (item.start + item.width > offset + view) glideTo(item.start + item.width - view);
  }

  return {
    sync(layout) {
      const atEnd = max > 0 && offset >= max - 0.5 && mode === "idle";
      // Kotwica: pierwsza roślina widoczna teraz (w poprzednim układzie) — w nowym widok przesuwa się razem z nią.
      const anchor = items.find((entry) => entry.start + entry.width > offset);
      const same = anchor && layout.items.find((entry) => entry.id === anchor.id);
      const shift = same ? same.start - anchor.start : 0;
      items = layout.items;
      view = layout.view;
      max = layout.max;
      offset = clamp(offset + shift);
      target = clamp(target + shift);
      if (atEnd) offset = target = max;
      if (pending?.end) {
        offset = target = max;
        velocity = 0;
        mode = "idle";
      } else if (pending && mode !== "drag") reveal(pending);
      pending = null;
    },
    update(dt) {
      if (mode === "fling") {
        offset += velocity * dt;
        velocity *= Math.exp(-SHELF.friction * dt);
        if (offset <= 0 || offset >= max) {
          offset = clamp(offset);
          velocity = 0;
        }
        if (Math.abs(velocity) < SHELF.minSpeed) {
          velocity = 0;
          mode = "idle";
        }
        target = offset;
      } else if (mode === "glide") {
        offset += (target - offset) * (1 - Math.exp(-SHELF.ease * dt));
        if (Math.abs(target - offset) < 0.5) {
          offset = target;
          mode = "idle";
        }
      }
    },
    grab() {
      mode = "drag";
      velocity = 0;
      target = offset;
    },
    drag(dx) {
      if (mode !== "drag") return;
      offset = clamp(offset + dx);
      target = offset;
    },
    release(speed = 0) {
      if (mode !== "drag") return;
      velocity = instant() ? 0 : speed;
      mode = Math.abs(velocity) >= SHELF.minSpeed && max > 0 ? "fling" : "idle";
      if (mode === "idle") velocity = 0;
    },
    page(direction) {
      if (mode === "drag") return;
      const base = aim();
      let next;
      if (direction > 0) {
        const item = items.find((entry) => entry.start + entry.width > base + view + 0.5);
        next = item ? item.start : max;
      } else {
        const item = items.findLast((entry) => entry.start < base - 0.5);
        next = item ? item.start + item.width - view : 0;
      }
      glideTo(next);
    },
    nudge(dx) {
      if (mode === "drag") return;
      glideTo(aim() + dx);
    },
    reveal(id, { center = false } = {}) {
      pending = { id, center };
    },
    toEnd() {
      pending = { end: true };
    },
    offset: () => offset,
    info() {
      const position = aim();
      return {
        offset,
        max,
        view,
        scrollable: max > 0.5,
        canPrev: position > 0.5,
        canNext: position < max - 0.5,
        moving: mode !== "idle",
      };
    },
  };
}
