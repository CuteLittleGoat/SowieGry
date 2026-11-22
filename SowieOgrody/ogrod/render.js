// Sowie Ogrody — rysowanie ogrodu na płótnie (piksele CSS): tło bieżącego rozdziału, półka z roślinami (każdy
// gatunek w doniczce i z własnym rysunkiem z plants.js, wszystkie w jednej przesuwanej linii — shelf.js; roślina
// rośnie i bujnieje z kamieniami milowymi), sowa ogrodniczka z atlasu Sowiego Świata, krople po podlaniu, napisy „+N”
// po stuknięciu i cząsteczki liści.
// Wydajność (Analiza 6, W2): tło rozdziału rysowane do osobnej warstwy najwyżej 15 razy na sekundę (ruchome ozdoby
// dalej się ruszają), rośliny jako gotowe obrazki odświeżane po kolei (najwyżej 2 na klatkę, każda ok. 15 razy na
// sekundę — kołysanie i mruganie zostają, a przesuwanie półki to tylko kopiowanie obrazków), w Zatoce Humbaka pod wodą
// leży jedno „zdjęcie” ogrodu zamiast rysowania go co klatkę; limit cząsteczek z automatu płynności.
import { drawOwl } from "../../shared/world/owl.js";
import { COLORS, font } from "../../shared/world/tokens.js";
import { GARDEN_EVENTS } from "./config.js";
import { formatNumber } from "./economy.js";
import { drawSceneDecor, NEW_SCENES } from "./decor.js";
import { createPlantShapes } from "./plants.js";
import { sceneId } from "./garden.js";
import { placeShelf, plantScale, shelfLayout } from "./shelf.js";

// Tło rozdziału: [niebo u góry, niebo u dołu, podłoże].
const SCENES = {
  parapet: ["#fff4fa", "#dff6ff", "#f4d7a0"],
  balkon: ["#cdeeff", "#fff6e3", "#c9c3d3"],
  dzialka: ["#bfe9ff", "#e7ffe6", "#a8d977"],
  basen: ["#bfe9ff", "#dff5fb", "#9fd9e8"],
  szklarnia: ["#dfffee", "#b9efd3", "#8fcf9a"],
  arboretum: ["#e8f7d4", "#c8ebb0", "#7fbf62"],
  // Rozdziały od 7. (uwagi O3 i O9) — decor.js.
  ...NEW_SCENES,
};

// Skala rysunku względem ogrodu telefonu (360 × 260 px CSS): rośliny i sowa rosną razem z płótnem (komputer),
// ale nie maleją poniżej 0,85 ani nie rosną ponad 2.
export function gardenUnit(width, height) {
  return Math.min(2, Math.max(0.85, Math.min(width / 360, height / 260)));
}

/**
 * createGardenRenderer({ canvas, atlas, scroll }) — `scroll`: przesuwanie półki z shelf.js (`createShelfScroll`);
 * renderer co klatkę podaje mu układ półki (`sync`) i przesuwa go o czas klatki (`update`). Bez niego półka stoi
 * na początku linii.
 */
// Warstwa tła i obrazki roślin: najwyżej tyle odświeżeń na sekundę; obrazków roślin w pamięci najwyżej tyle.
export const BACKGROUND_FPS = 15;
export const PLANT_FPS = 15;
export const PLANT_REFRESH_PER_FRAME = 2;
export const PLANT_SPRITES = 24;
// Pudełko rysunku rośliny względem środka dna doniczki (skala 1): [w lewo, w prawo, w górę] dla każdego gatunku —
// zmierzone na etapach 1–5 w 8 chwilach ruchu (+4 / +5 px zapasu); nieznany gatunek — `PLANT_BOX` (największe).
export const PLANT_BOX = Object.freeze({ left: 52, right: 52, up: 112, down: 4 });
export const PLANT_BOUNDS = Object.freeze({
  monstera: [41, 48, 70],
  pilea: [25, 28, 61],
  paproc: [37, 36, 62],
  alokazja: [37, 36, 70],
  kaktus: [21, 21, 68],
  slonecznik: [26, 23, 89],
  storczyk: [21, 33, 62],
  lotos: [25, 21, 71],
  bonsai: [31, 33, 61],
  mutant: [42, 42, 68],
  zloteDrzewko: [26, 25, 77],
  palma: [39, 44, 106],
  strelicja: [49, 48, 76],
  bambus: [27, 25, 78],
  dzbanecznik: [40, 39, 61],
  sakura: [32, 31, 67],
  klon: [24, 29, 79],
  agawa: [26, 25, 64],
  daktylowiec: [29, 28, 91],
  ciemiernik: [36, 35, 59],
  ostrokrzew: [27, 26, 68],
  grzybienie: [34, 33, 42],
  wiktoria: [30, 23, 43],
  lawenda: [18, 17, 65],
  figowiec: [27, 26, 66],
  ksiezycowa: [47, 46, 68],
  gwiezdny: [17, 16, 65],
  belladonna: [23, 22, 66],
  mandragora: [21, 20, 49],
  tojad: [20, 19, 70],
  dynia: [31, 29, 49],
  kwiatPaproci: [22, 21, 75],
  muchomor: [28, 27, 57],
  smoczeDrzewo: [32, 31, 75],
  ognisty: [30, 27, 100],
  krysztalowaRoza: [22, 25, 74],
  dzwonek: [35, 35, 69],
  naparstnica: [17, 16, 70],
  tulipan: [21, 20, 69],
  chmurnik: [27, 30, 73],
  sowiStorczyk: [35, 18, 58],
  feniks: [26, 24, 97],
  drzewoZycia: [35, 34, 100],
});

// Stała faza ruchu gatunku (kołysanie, rozglądanie się) — niezależna od położenia na półce.
function phaseOf(id) {
  let hash = 7;
  for (const character of String(id)) hash = (hash * 31 + character.charCodeAt(0)) % 997;
  return 200 + hash;
}

const defaultDpr = () => Math.min(2, globalThis.devicePixelRatio || 1);

/**
 * createGardenRenderer({ canvas, atlas, scroll, getDpr, particleScale }) — `scroll`: przesuwanie półki z shelf.js
 * (`createShelfScroll`); renderer co klatkę podaje mu układ półki (`sync`) i przesuwa go o czas klatki (`update`).
 * Bez niego półka stoi na początku linii. `getDpr` — ostrość płótna (automat płynności), `particleScale` — 0–1,
 * `refreshRate` — ile razy na sekundę odświeżać tło i obrazki roślin (15; na słabszym telefonie mniej).
 */
export function createGardenRenderer({
  canvas,
  atlas,
  scroll = null,
  getDpr = defaultDpr,
  particleScale = () => 1,
  refreshRate = () => BACKGROUND_FPS,
}) {
  const screen = canvas.getContext("2d");
  // Bieżący cel rysowania: ekran albo warstwa w pamięci (tło, zdjęcie ogrodu do Zatoki).
  let context = screen;
  const popups = [];
  const particles = [];
  let size = { width: 0, height: 0, ratio: 1 };
  // Miejsca roślin (piksele CSS: środek doniczki u dołu, skala rysunku, czy środek jest w ogrodzie) — do ciężarówki,
  // napisów i testów; także rośliny przesunięte poza ogród.
  const spots = new Map();
  // Warstwa tła, obrazki roślin (klucz → { canvas, ctx, shapes, … }, kolejność = ostatnie użycie), zdjęcie do Zatoki.
  const background = { canvas: null, key: "", time: -Infinity };
  const sprites = new Map();
  let bayShot = null;
  // Szerokości podpisów „×N” (mierzenie tekstu co klatkę jest drogie).
  const labelWidths = new Map();
  // Liczniki pracy (testy i licznik `?perf=1`).
  const stats = { frames: 0, backgroundRenders: 0, plantRenders: 0, gardenDraws: 0, bayShots: 0 };

  const layer = (width, height) => {
    const target = globalThis.document.createElement("canvas");
    target.width = Math.max(1, Math.ceil(width));
    target.height = Math.max(1, Math.ceil(height));
    return target;
  };

  function clearCaches() {
    background.canvas = null;
    background.key = "";
    sprites.clear();
    bayShot = null;
    labelWidths.clear();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = getDpr();
    size = { width: Math.max(1, rect.width), height: Math.max(1, rect.height), ratio };
    const width = Math.round(size.width * ratio);
    const height = Math.round(size.height * ratio);
    // Bez zmiany rozmiaru nie ruszamy płótna (przypisanie czyści je i zajmuje pamięć od nowa).
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    clearCaches();
  }

  // Rysuje `paint()` na warstwie w pamięci (`target`), w pikselach CSS ogrodu.
  function paintOn(target, paint) {
    const ctx = target.getContext("2d");
    ctx.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);
    const previous = context;
    context = ctx;
    try {
      paint();
    } finally {
      context = previous;
    }
  }

  function roundRect(x, y, width, height, radius) {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.fill();
  }

  function drawBackground(chapterId, time) {
    const { width, height } = size;
    const [top, bottom, ground] = SCENES[chapterId] || SCENES.parapet;
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, bottom);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    const floor = height * 0.6;
    if (drawSceneDecor(context, chapterId, width, height, floor, time)) {
      // Rozdziały od 7.: dekoracje z decor.js.
    } else if (chapterId === "parapet") {
      // Okno: rama i szprosy, za szybą chmurka.
      context.fillStyle = "rgba(255, 255, 255, 0.7)";
      roundRect(width * 0.12, height * 0.06, width * 0.76, height * 0.5, 20);
      context.strokeStyle = "rgba(86, 120, 150, 0.3)";
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(width * 0.5, height * 0.07);
      context.lineTo(width * 0.5, height * 0.55);
      context.moveTo(width * 0.13, height * 0.3);
      context.lineTo(width * 0.87, height * 0.3);
      context.stroke();
    } else if (chapterId === "balkon") {
      context.strokeStyle = COLORS.szaryCiemny;
      context.lineWidth = 3;
      for (let x = 10; x < width; x += 26) {
        context.beginPath();
        context.moveTo(x, floor - height * 0.2);
        context.lineTo(x, floor);
        context.stroke();
      }
      context.fillStyle = COLORS.szaryCiemny;
      context.fillRect(0, floor - height * 0.2, width, 5);
    } else if (chapterId === "dzialka") {
      context.fillStyle = COLORS.bialy;
      for (let x = 6; x < width; x += 22) context.fillRect(x, floor - height * 0.12, 9, height * 0.12);
      context.fillRect(0, floor - height * 0.09, width, 5);
    } else if (chapterId === "basen") {
      context.fillStyle = COLORS.woda;
      context.beginPath();
      context.ellipse(width * 0.8, floor - 6, width * 0.16, 14, 0, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "rgba(255, 255, 255, 0.6)";
      context.beginPath();
      context.ellipse(width * 0.8 + Math.sin(time) * 6, floor - 9, width * 0.08, 4, 0, 0, Math.PI * 2);
      context.fill();
    } else if (chapterId === "szklarnia") {
      context.strokeStyle = "rgba(78, 130, 105, 0.35)";
      context.lineWidth = 3;
      for (let x = width * 0.1; x <= width * 0.9; x += width * 0.16) {
        context.beginPath();
        context.moveTo(x, height * 0.05);
        context.lineTo(x, floor);
        context.stroke();
      }
    } else {
      context.fillStyle = "rgba(63, 174, 106, 0.35)";
      for (const [x, r] of [
        [0.12, 46],
        [0.88, 56],
        [0.32, 30],
      ]) {
        context.beginPath();
        context.arc(width * x, floor - r, r, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.fillStyle = ground;
    context.fillRect(0, floor, width, height - floor);
    context.fillStyle = "rgba(59, 47, 74, 0.08)";
    context.fillRect(0, floor, width, 4);
  }

  // Roślina w doniczce: `stage` 1–5 (kamienie milowe) — wielkość i wygląd. Wielkość zależy tylko od etapu i ogrodu
  // (`plantScale`), nie od liczby gatunków na półce. Od uwagi O10 każdy gatunek ma własny rysunek (plants.js);
  // liście-elipsy w kolorze gatunku (jak dawniej wszystkie rośliny rozdziałów 1–6) zostają tylko jako zapas dla
  // nieznanego kształtu.
  // Roślina w doniczce na bieżącym celu (`context`) rysunkami `plantShapes` (z plants.js, związanymi z tym celem).
  function plant(plantShapes, item, x, y, stage, time, scale) {
    const potWidth = 26 * scale;
    context.fillStyle = COLORS.doniczka;
    roundRect(x - potWidth / 2, y - 20 * scale, potWidth, 20 * scale, 5);
    context.fillStyle = "rgba(59, 47, 74, 0.15)";
    context.fillRect(x - potWidth / 2, y - 20 * scale, potWidth, 4);
    if (item.shape && plantShapes[item.shape]) {
      context.save();
      plantShapes[item.shape](item, x, y - 20 * scale, scale, stage, time);
      context.restore();
      return;
    }
    const leaves = 2 + stage;
    context.fillStyle = item.color;
    for (let index = 0; index < leaves; index += 1) {
      const angle = -Math.PI / 2 + (index - (leaves - 1) / 2) * 0.42 + Math.sin(time * 1.6 + index + x) * 0.05;
      const length = (16 + stage * 4) * scale;
      context.save();
      context.translate(x, y - 20 * scale);
      context.rotate(angle + Math.PI / 2);
      context.beginPath();
      context.ellipse(0, -length / 2, 6 * scale, length / 2, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
    if (stage >= 5) {
      context.fillStyle = COLORS.zloto;
      context.beginPath();
      context.arc(x, y - 20 * scale - (24 + stage * 4) * scale, 5 * scale, 0, Math.PI * 2);
      context.fill();
    }
  }

  // Obrazek rośliny (gatunek × etap × skala × ostrość) w pamięci: nowy rysowany od razu, istniejący odświeżany
  // najwyżej `PLANT_FPS` razy na sekundę i tylko gdy w tej klatce jest jeszcze miejsce (`allowRefresh`) — koszt
  // rozkłada się na klatki. Najdawniej używane obrazki wypadają ponad `PLANT_SPRITES`.
  function plantSprite(item, stage, scale, time, allowRefresh) {
    const key = `${item.id}|${stage}|${scale.toFixed(3)}|${size.ratio}`;
    let sprite = sprites.get(key);
    if (!sprite) {
      const [left, right, up] = PLANT_BOUNDS[item.id] || [PLANT_BOX.left, PLANT_BOX.right, PLANT_BOX.up];
      const width = (left + right) * scale;
      const height = (up + PLANT_BOX.down) * scale;
      const target = layer(width * size.ratio, height * size.ratio);
      sprite = {
        canvas: target,
        ctx: target.getContext("2d"),
        shapes: null,
        width,
        height,
        ax: left * scale,
        ay: up * scale,
        time: -Infinity,
        refreshed: false,
      };
      sprite.shapes = createPlantShapes(sprite.ctx);
    } else sprites.delete(key);
    sprites.set(key, sprite);
    while (sprites.size > PLANT_SPRITES) sprites.delete(sprites.keys().next().value);
    const stale = time - sprite.time >= 1 / Math.min(PLANT_FPS, refreshRate()) || time < sprite.time;
    sprite.refreshed = sprite.time === -Infinity || (stale && allowRefresh);
    if (sprite.refreshed) {
      const ctx = sprite.ctx;
      ctx.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
      ctx.clearRect(0, 0, sprite.width, sprite.height);
      const phase = phaseOf(item.id);
      ctx.translate(sprite.ax - phase, 0);
      const previous = context;
      context = ctx;
      try {
        plant(sprite.shapes, item, phase, sprite.ay, stage, time, scale);
      } finally {
        context = previous;
      }
      sprite.time = time;
      stats.plantRenders += 1;
    }
    return sprite;
  }

  // Warstwa tła rozdziału: przerysowana przy zmianie rozdziału, rozmiaru albo ostrości i najwyżej `BACKGROUND_FPS`
  // razy na sekundę (ruchome ozdoby rozdziałów dalej się ruszają), na ekranie co klatkę jedno kopiowanie.
  function backgroundLayer(chapterId, time) {
    const key = `${chapterId}|${size.width}x${size.height}@${size.ratio}`;
    if (!background.canvas || background.key !== key) {
      background.canvas = layer(size.width * size.ratio, size.height * size.ratio);
      background.key = key;
      background.time = -Infinity;
    }
    if (time - background.time >= 1 / Math.min(BACKGROUND_FPS, refreshRate()) || time < background.time) {
      paintOn(background.canvas, () => drawBackground(chapterId, time));
      background.time = time;
      stats.backgroundRenders += 1;
    }
    context.drawImage(background.canvas, 0, 0, size.width, size.height);
  }

  // Półka (uwaga z 2026-11-11): wszystkie posiadane gatunki w jednej linii na podłodze, w pełnej wielkości; linia
  // przesuwa się w bok (`scroll`). Rysowane tylko rośliny w ogrodzie albo tuż przy jego krawędzi (liście wystają poza
  // miejsce). Podpisy „×N” na końcu, na jasnych plakietkach, żeby nie chowały się pod liśćmi.
  function shelf(state, time, dt) {
    const { width, height } = size;
    const unit = gardenUnit(width, height);
    const layout = shelfLayout(state, width / unit);
    scroll?.sync(layout);
    scroll?.update(dt);
    const offset = scroll ? scroll.offset() : 0;
    const { y, label, places } = placeShelf(layout, offset, { width, height, unit });
    const margin = 80 * unit;
    spots.clear();
    const placed = [];
    for (const { entry, x, scale, visible } of places) {
      spots.set(entry.id, { x, y, scale, visible });
      if (x > -margin && x < width + margin) placed.push({ ...entry, x });
    }
    let refreshes = 0;
    for (const { item, x, stage } of placed) {
      const scale = plantScale(stage, unit);
      const sprite = plantSprite(item, stage, scale, time, refreshes < PLANT_REFRESH_PER_FRAME);
      if (sprite.refreshed) refreshes += 1;
      context.drawImage(sprite.canvas, x - sprite.ax, y - sprite.ay, sprite.width, sprite.height);
    }
    const labelFont = font(Math.round(11 * label));
    context.font = labelFont;
    context.textAlign = "center";
    for (const { item, x } of placed) {
      const text = `×${formatNumber(state.plants[item.id])}`;
      const labelKey = `${labelFont}|${text}`;
      let textWidth = labelWidths.get(labelKey);
      if (textWidth === undefined) {
        if (labelWidths.size > 200) labelWidths.clear();
        textWidth = context.measureText(text).width;
        labelWidths.set(labelKey, textWidth);
      }
      context.fillStyle = "rgba(255, 255, 255, 0.75)";
      roundRect(x - textWidth / 2 - 4 * label, y + 2 * label, textWidth + 8 * label, 14 * label, 7 * label);
      context.fillStyle = COLORS.kontur;
      context.fillText(text, x, y + 13 * label);
    }
  }

  // Sowa ogrodniczka (bez wybranej garderoby — w kapeluszu ogrodnika) stoi na środku, stopy na podłożu.
  function owl(animator, cosmetic) {
    if (!atlas?.ready?.() || !animator) return;
    const { width, height } = size;
    const owlSize = Math.min(height * 0.36, width * 0.32, 96 * gardenUnit(width, height));
    drawOwl(context, atlas, width / 2, height * 0.6, {
      state: animator.state(),
      size: owlSize,
      cosmetic: cosmetic === "none" ? "gardenerHat" : cosmetic,
    });
  }

  // ---------- Zdarzenia (E7c) ----------
  // Miejsca do stuknięcia (piksele CSS): telefon, ciężarówka, kózka — `hit(x, y)` w main.js.
  const hits = { phone: null, truck: null, goat: null };

  // Telefon Pracu Pracu dzwoni w lewym górnym rogu ogrodu: drży, rozchodzą się fale dzwonka.
  function phone(state, time) {
    hits.phone = null;
    if (!state.phone) return;
    const unit = gardenUnit(size.width, size.height);
    const box = 44 * unit;
    const x = 12 + box / 2;
    const y = 12 + box / 2;
    context.strokeStyle = COLORS.pracu;
    context.lineWidth = 3;
    for (let ring = 0; ring < 2; ring += 1) {
      const phase = (time * 1.5 + ring * 0.5) % 1;
      context.globalAlpha = 1 - phase;
      context.beginPath();
      context.arc(x, y, box * (0.55 + phase * 0.5), -0.9, 0.9);
      context.stroke();
    }
    context.globalAlpha = 1;
    const rotation = Math.sin(time * 38) * 0.14;
    if (!(atlas?.ready?.() && atlas.draw(context, "pracu-telefon", x, y, { width: box, height: box, rotation }))) {
      context.fillStyle = COLORS.pracu;
      roundRect(x - box * 0.3, y - box * 0.45, box * 0.6, box * 0.9, 8);
    }
    hits.phone = { x, y, r: box * 0.75 };
  }

  // Ciężarówka Amic (cysterna) stoi na zastawionej grządce; nad nią licznik stuknięć.
  function truck(state) {
    hits.truck = null;
    if (!state.truck || !state.blocked) return;
    const spot = spots.get(state.blocked);
    if (!spot) return;
    const unit = gardenUnit(size.width, size.height);
    const width = Math.min(size.width * 0.34, 120 * unit);
    const height = width / 2;
    if (!(atlas?.ready?.() && atlas.draw(context, "amic-cysterna", spot.x, spot.y, { width, height }))) {
      context.fillStyle = COLORS.amicCzerwony;
      roundRect(spot.x - width / 2, spot.y - height, width, height * 0.8, 8);
    }
    hits.truck = { x: spot.x, y: spot.y - height / 2, r: width / 2 };
  }

  // Złota kózka przebiega przez ogród (7 s), podskakując; złota poświata.
  function goat(state, visible) {
    hits.goat = null;
    if (!state.goat) return;
    const unit = gardenUnit(size.width, size.height);
    const box = 54 * unit;
    const share = Math.min(1, state.goat.time / visible);
    const span = size.width + box * 2;
    const x = state.goat.dir > 0 ? -box + share * span : size.width + box - share * span;
    const hop = Math.abs(Math.sin(share * Math.PI * 7));
    const y = size.height * 0.64 - hop * 26 * unit;
    const glow = context.createRadialGradient(x, y - box * 0.45, 4, x, y - box * 0.45, box * 0.9);
    glow.addColorStop(0, "rgba(255, 210, 74, 0.7)");
    glow.addColorStop(1, "rgba(255, 210, 74, 0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(x, y - box * 0.45, box * 0.9, 0, Math.PI * 2);
    context.fill();
    const name = hop > 0.3 ? "kozka-sprezynka-skok" : "kozka-sprezynka";
    if (!(
      atlas?.ready?.() && atlas.draw(context, name, x, y, { width: box, height: box, flipX: state.goat.dir < 0 })
    )) {
      context.fillStyle = COLORS.zloto;
      roundRect(x - box * 0.4, y - box * 0.7, box * 0.8, box * 0.6, 10);
    }
    hits.goat = { x, y: y - box * 0.45, r: box * 0.8 };
  }

  // Zatoka Humbaka: woda zasłania ogród, humbak w fontannie u dołu, liście lecą (współrzędne 0–1).
  function bay(state, time, fountain) {
    if (!state.bay) return;
    const { width, height } = size;
    const water = context.createLinearGradient(0, 0, 0, height);
    water.addColorStop(0, "rgba(191, 233, 255, 0.92)");
    water.addColorStop(1, "rgba(92, 200, 232, 0.95)");
    context.fillStyle = water;
    context.fillRect(0, 0, width, height);
    context.fillStyle = "rgba(255, 255, 255, 0.5)";
    for (let wave = 0; wave < 3; wave += 1) {
      const y = height * (0.3 + wave * 0.2);
      context.beginPath();
      for (let x = 0; x <= width; x += 12) context.lineTo(x, y + Math.sin(x / 30 + time * 2 + wave) * 4);
      context.lineTo(width, y + 6);
      context.lineTo(0, y + 6);
      context.fill();
    }
    // Humbak tuż pod fontanną (plusk wychodzi z grzbietu w punkcie `fountain`), cały w kadrze.
    const whaleWidth = Math.min(width * 0.46, height * (1 - fountain[1]) * 2.4, 220);
    const [fx, fy] = fountain;
    if (atlas?.ready?.()) {
      atlas.draw(context, "humbak", fx * width, fy * height + whaleWidth * 0.18, {
        width: whaleWidth,
        height: whaleWidth / 2,
      });
      atlas.draw(context, "plusk", fx * width, fy * height, { width: whaleWidth * 0.42, height: whaleWidth * 0.42 });
    }
    context.fillStyle = COLORS.monstera;
    for (const leaf of state.bay.leaves) {
      const x = leaf.x * width;
      const y = leaf.y * height;
      if (!(
        atlas?.ready?.() && atlas.draw(context, "lisc-zielony", x, y, { width: 30, height: 30, rotation: leaf.vx * 3 })
      )) {
        context.beginPath();
        context.ellipse(x, y, 12, 8, leaf.vx * 3, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  function water(state, now, time) {
    if ((state.effects?.watered || 0) <= now) return;
    const { width, height } = size;
    context.fillStyle = "rgba(92, 200, 232, 0.55)";
    for (let index = 0; index < 18; index += 1) {
      const x = ((index * 97.3) % 1) * width + ((index * 53) % width);
      const y = ((time * 120 + index * 47) % (height * 0.7)) + height * 0.05;
      context.beginPath();
      context.ellipse(x % width, y, 2, 5, 0, 0, Math.PI * 2);
      context.fill();
    }
  }

  function effects(dt) {
    for (const item of particles) {
      item.age += dt;
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.vy += 260 * dt;
      context.globalAlpha = Math.max(0, 1 - item.age / item.life);
      context.fillStyle = item.color;
      context.beginPath();
      context.ellipse(item.x, item.y, 4, 2.5, item.age * 6, 0, Math.PI * 2);
      context.fill();
    }
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      if (particles[index].age >= particles[index].life) particles.splice(index, 1);
    }
    context.textAlign = "center";
    let currentFont = "";
    for (const item of popups) {
      item.age += dt;
      context.globalAlpha = Math.max(0, 1 - item.age / 1);
      // Czcionkę ustawiamy tylko przy zmianie rozmiaru (ustawianie co napis jest drogie).
      const popupFont = font(item.size);
      if (popupFont !== currentFont) {
        context.font = popupFont;
        currentFont = popupFont;
      }
      context.lineWidth = 4;
      context.strokeStyle = COLORS.kontur;
      context.fillStyle = item.color;
      const y = item.y - item.age * 50;
      context.strokeText(item.text, item.x, y);
      context.fillText(item.text, item.x, y);
    }
    for (let index = popups.length - 1; index >= 0; index -= 1) if (popups[index].age >= 1) popups.splice(index, 1);
    context.globalAlpha = 1;
  }

  return {
    resize,
    spots,
    size: () => size,
    /** Miejsca zdarzeń do stuknięcia (piksele CSS): { phone, truck, goat } — { x, y, r } albo null. */
    hits: () => ({ ...hits }),
    /** Co jest pod palcem: "goat" | "phone" | "truck" | null (kózka pierwsza — ucieka). */
    hit(x, y) {
      for (const name of ["goat", "phone", "truck"]) {
        const target = hits[name];
        if (target && Math.hypot(x - target.x, y - target.y) <= target.r) return name;
      }
      return null;
    },
    popup(text, x, y, color = COLORS.bialy, textSize = 20) {
      popups.push({ text, x, y, color, size: textSize, age: 0 });
      // Na słabszym telefonie (automat płynności) mniej napisów naraz.
      const limit = particleScale() < 1 ? 8 : 12;
      while (popups.length > limit) popups.shift();
    },
    burst(x, y, count = 8, color = COLORS.monsteraJasna) {
      const scaled = Math.max(1, Math.round(count * particleScale()));
      for (let index = 0; index < scaled; index += 1) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 220,
          vy: -80 - Math.random() * 160,
          age: 0,
          life: 0.6 + Math.random() * 0.4,
          color,
        });
      }
      const limit = Math.round(120 * Math.max(0.25, particleScale()));
      if (particles.length > limit) particles.splice(0, particles.length - limit);
    },
    /** Czy trwają efekty (cząsteczki, napisy) — gra rysuje wtedy pełne 60 klatek/s. */
    animating: () => particles.length > 0 || popups.length > 0,
    /** Liczniki pracy (testy, `?perf=1`): klatki, przerysowania tła i roślin, rysowania ogrodu, zdjęcia do Zatoki. */
    stats: () => ({ ...stats, sprites: sprites.size, particles: particles.length, popups: popups.length }),
    draw({ state, now, time, dt = 0, animator = null, cosmetic = "none" }) {
      if (!size.width) resize();
      stats.frames += 1;
      context = screen;
      context.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
      if (state.bay) {
        // Zatoka Humbaka: woda (92–95% krycia) zasłania ogród — pod nią jedno „zdjęcie” ogrodu z chwili wejścia
        // zamiast rysowania tła, sowy i roślin co klatkę (dawniej najcięższa chwila gry — Analiza 6, P3).
        const key = `${size.width}x${size.height}@${size.ratio}`;
        if (!bayShot || bayShot.key !== key) {
          bayShot = { key, canvas: layer(size.width * size.ratio, size.height * size.ratio) };
          paintOn(bayShot.canvas, () => {
            drawBackground(sceneId(state), time);
            owl(animator, cosmetic);
            shelf(state, time, 0);
          });
          stats.bayShots += 1;
        }
        context.drawImage(bayShot.canvas, 0, 0, size.width, size.height);
        bay(state, time, GARDEN_EVENTS.bay.fountain);
        effects(dt);
        return;
      }
      bayShot = null;
      stats.gardenDraws += 1;
      backgroundLayer(sceneId(state), time);
      owl(animator, cosmetic);
      shelf(state, time, dt);
      truck(state);
      goat(state, GARDEN_EVENTS.goat.visible);
      phone(state, time);
      water(state, now, time);
      effects(dt);
    },
  };
}
