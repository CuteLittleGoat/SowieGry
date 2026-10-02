// Sowa w Chmurach — oprawa stref w tle (E6d): dekoracje rysowane kodem w pikselach ekranu, z paralaksą (dalsze
// warstwy przesuwają się wolniej niż kamera) i płynnym przejściem między strefami (te same 60 m co kolory nieba).
// Delikatne kolory i przezroczystość — platformy, liście i przeszkody zawsze czytelne na tle. Po bokach kolumny
// (telefon poziomo, komputer) oprawa wypełnia cały ekran.
import { COLORS } from "../shared/world/tokens.js";
import { WORLD, ZONES } from "./config.js";

// Przejście między strefami: ostatnie `BLEND` m przed granicą (jak kolory nieba w `skyAt`).
export const BLEND = 60;

/** Udział każdej strefy w oprawie na wysokości `height` (tablica jak `ZONES`, suma 1). */
export function zoneWeights(height) {
  const weights = ZONES.map(() => 0);
  let index = 0;
  while (index + 1 < ZONES.length && height >= ZONES[index + 1].from) index += 1;
  const next = ZONES[index + 1];
  const blend = next ? Math.min(1, Math.max(0, (height - (next.from - BLEND)) / BLEND)) : 0;
  weights[index] = 1 - blend;
  if (next) weights[index + 1] = blend;
  return weights;
}

function hash(value) {
  const x = Math.sin(value * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

// Reszta z dzielenia zawsze nieujemna (warstwy powtarzane co `period`).
const wrap = (value, period) => ((value % period) + period) % period;

// Gwiazdozbiór humbaka: łamane (punkty w metrach względem środka, oś y w górę) — tułów z ogonem, długa płetwa
// piersiowa i fontanna nad głową.
const WHALE_LINES = [
  [
    [-1.6, 0.1],
    [-0.9, 0.45],
    [0, 0.55],
    [0.9, 0.35],
    [1.5, 0],
    [0.8, -0.35],
    [-0.4, -0.4],
    [-1.6, 0.1],
    [-2.3, 0.55],
    [-2.2, -0.3],
    [-1.6, 0.1],
  ],
  [
    [0.4, -0.37],
    [0, -1],
  ],
  [
    [1, 0.5],
    [0.85, 1],
  ],
  [
    [1, 0.5],
    [1.3, 0.95],
  ],
];

export function createScenery({ context }) {
  // Ogródek: pnącza z liśćmi Monstery wzdłuż obu krawędzi ekranu (paralaksa 0,6) i drzewa w oddali przy ziemi.
  function garden(layout, bottom, alpha) {
    const k = layout.scale;
    const shift = bottom * k * 0.6;
    context.lineWidth = Math.max(2, 0.08 * k);
    context.strokeStyle = COLORS.monsteraCiemna;
    context.fillStyle = COLORS.monstera;
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? 0.3 * k : layout.cssWidth - 0.3 * k;
      context.globalAlpha = alpha * 0.45;
      context.beginPath();
      for (let y = 0; y <= layout.cssHeight; y += 0.2 * k) {
        const x = x0 + Math.sin((y + shift) / k) * 0.15 * k * side;
        if (y === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
      for (let y = wrap(shift, 1.5 * k) - 1.5 * k; y < layout.cssHeight + k; y += 1.5 * k) {
        const x = x0 + Math.sin((y + shift) / k) * 0.15 * k * side;
        context.beginPath();
        context.ellipse(x - side * 0.25 * k, y, 0.28 * k, 0.14 * k, side * 0.5, 0, Math.PI * 2);
        context.fill();
      }
    }
    // Drzewa w oddali (paralaksa 0,5): korony z trzech kół nad pniem, pod nimi łagodne wzgórza (także po bokach
    // kolumny w poziomie); na starcie (dolna krawędź −1 m) stoją na ziemi ogródka, potem opadają wolniej niż świat.
    const ground = layout.cssHeight - k + (bottom + 1) * k * 0.5;
    if (ground < layout.cssHeight + 6 * k) {
      for (let index = 0; index < 5; index += 1) {
        const x = (index + 0.3 + hash(index * 3.7) * 0.4) * (layout.cssWidth / 5);
        const size = (1 + hash(index * 1.9) * 0.6) * k;
        context.globalAlpha = alpha * 0.35;
        context.fillStyle = COLORS.sowaCiemna;
        context.fillRect(x - 0.08 * k, ground - 2.2 * size, 0.16 * k, 2.2 * size);
        context.fillStyle = COLORS.monsteraJasna;
        for (const [dx, dy, r] of [
          [0, -2.4, 0.9],
          [-0.6, -2, 0.65],
          [0.6, -2, 0.65],
        ]) {
          context.beginPath();
          context.arc(x + dx * size, ground + dy * size, r * size, 0, Math.PI * 2);
          context.fill();
        }
      }
      context.globalAlpha = alpha * 0.5;
      context.fillStyle = COLORS.monsteraJasna;
      context.beginPath();
      context.moveTo(0, layout.cssHeight + 1);
      for (let x = 0; x <= layout.cssWidth + 12; x += 12) {
        context.lineTo(x, ground - (0.3 + 0.25 * Math.sin(x / (1.9 * k) + 1)) * k);
      }
      context.lineTo(layout.cssWidth + 12, layout.cssHeight + 1);
      context.closePath();
      context.fill();
    }
  }

  // Blok: ściany bloku przy obu krawędziach ekranu (paralaksa 0,6) — okna (niektóre świecą), co drugie piętro
  // balkonik z balustradą.
  function block(layout, bottom, alpha) {
    const k = layout.scale;
    const floor = 3 * k;
    const shift = bottom * k * 0.6;
    const wall = Math.max(1.4 * k, (layout.cssWidth - 9 * k) / 2 + 1.4 * k);
    for (const side of [-1, 1]) {
      const left = side < 0 ? 0 : layout.cssWidth - wall;
      context.globalAlpha = alpha * 0.5;
      context.fillStyle = "#efe2cf";
      context.fillRect(left, 0, wall, layout.cssHeight);
      const first = wrap(shift, floor) - floor;
      for (let y = first; y < layout.cssHeight + floor; y += floor) {
        const level = Math.round((y - shift) / floor);
        context.fillStyle = COLORS.szary;
        context.fillRect(left, y, wall, 0.12 * k);
        const columns = Math.max(1, Math.floor(wall / (1.1 * k)));
        for (let column = 0; column < columns; column += 1) {
          const wx = left + (column + 0.5) * (wall / columns) - 0.3 * k;
          const lit = hash(level * 13.1 + column * 7.3 + side) > 0.7;
          context.fillStyle = lit ? "#ffe9a8" : "#cfe8f7";
          context.fillRect(wx, y + 0.8 * k, 0.6 * k, 0.8 * k);
          context.fillStyle = COLORS.szaryCiemny;
          context.fillRect(wx, y + 1.18 * k, 0.6 * k, 0.04 * k);
        }
        if (level % 2 === 0) {
          const bx = side < 0 ? left + wall - 1.3 * k : left;
          context.fillStyle = COLORS.szaryCiemny;
          context.fillRect(bx, y + 2.1 * k, 1.3 * k, 0.08 * k);
          for (let rail = 0; rail <= 4; rail += 1)
            context.fillRect(bx + rail * 0.32 * k, y + 1.7 * k, 0.04 * k, 0.4 * k);
          context.fillRect(bx, y + 1.7 * k, 1.3 * k, 0.05 * k);
        }
      }
    }
  }

  // Chmury: duże, miękkie chmury za kolumną (paralaksa 0,5).
  function bigClouds(layout, bottom, alpha) {
    const k = layout.scale;
    const span = layout.cssHeight + 8 * k;
    context.fillStyle = COLORS.bialy;
    for (let index = 0; index < 4; index += 1) {
      const size = (2.4 + hash(index * 6.1) * 1.6) * k;
      const x = hash(index * 2.3) * layout.cssWidth;
      const y = wrap(hash(index * 8.7) * span + bottom * k * 0.5, span) - 4 * k;
      context.globalAlpha = alpha * (0.35 + 0.2 * hash(index * 3.3));
      context.beginPath();
      context.ellipse(x, y, size, size * 0.42, 0, 0, Math.PI * 2);
      context.ellipse(x - size * 0.55, y + size * 0.1, size * 0.55, size * 0.32, 0, 0, Math.PI * 2);
      context.ellipse(x + size * 0.5, y - size * 0.12, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
      context.fill();
    }
  }

  // Zorza: trzy wąskie, falujące wstęgi-zasłony w górnej części ekranu (zielona, turkusowa, różowa) — jasna krawędź
  // u góry, w dół zanikają; prawie nieruchome względem ekranu (paralaksa 0,05).
  function aurora(layout, bottom, time, alpha) {
    const k = layout.scale;
    const colors = ["123, 224, 176", "111, 214, 224", "255, 154, 213"];
    colors.forEach((rgb, index) => {
      const base = layout.cssHeight * (0.12 + index * 0.11) + wrap(bottom * k * 0.05, layout.cssHeight * 0.06);
      const depth = (0.7 + index * 0.15) * k;
      const wave = (x) => base + Math.sin(x / (2.6 * k) + time * (0.35 + index * 0.12) + index * 2) * 0.45 * k;
      const gradient = context.createLinearGradient(0, base - 0.5 * k, 0, base + depth + 0.5 * k);
      gradient.addColorStop(0, `rgba(${rgb}, 0)`);
      gradient.addColorStop(0.3, `rgba(${rgb}, 0.5)`);
      gradient.addColorStop(1, `rgba(${rgb}, 0)`);
      context.globalAlpha = alpha * 0.55;
      context.fillStyle = gradient;
      context.beginPath();
      context.moveTo(-10, wave(-10));
      for (let x = 2; x <= layout.cssWidth + 10; x += 12) context.lineTo(x, wave(x));
      for (let x = layout.cssWidth + 10; x >= -10; x -= 12) context.lineTo(x, wave(x) + depth);
      context.closePath();
      context.fill();
    });
  }

  // Kosmos: planety (jedna z pierścieniem) i humbaki-gwiazdozbiory (paralaksa 0,15).
  function space(layout, bottom, alpha) {
    const k = layout.scale;
    const span = layout.cssHeight * 2;
    const shift = bottom * k * 0.15;
    const planets = [
      { x: 0.2, y: 0.15, r: 0.9, color: COLORS.pomaranczowy, ring: true },
      { x: 0.8, y: 0.85, r: 0.6, color: COLORS.fiolet, ring: false },
      { x: 0.65, y: 1.45, r: 1.1, color: COLORS.woda, ring: false },
    ];
    for (const planet of planets) {
      const x = planet.x * layout.cssWidth;
      const y = wrap(planet.y * layout.cssHeight + shift, span) - layout.cssHeight * 0.5;
      context.globalAlpha = alpha * 0.55;
      context.fillStyle = planet.color;
      context.beginPath();
      context.arc(x, y, planet.r * k, 0, Math.PI * 2);
      context.fill();
      if (planet.ring) {
        context.strokeStyle = COLORS.zloto;
        context.lineWidth = Math.max(2, 0.1 * k);
        context.beginPath();
        context.ellipse(x, y, planet.r * 1.7 * k, planet.r * 0.45 * k, -0.3, 0, Math.PI * 2);
        context.stroke();
      }
    }
    // Gwiazdozbiory humbaków: gwiazdy (kółka) połączone cienkimi liniami; drugi humbak odbity w poziomie.
    for (let index = 0; index < 2; index += 1) {
      const cx = (0.3 + index * 0.45) * layout.cssWidth;
      const cy = wrap((0.4 + index * 0.9) * layout.cssHeight + shift * 0.7, span) - layout.cssHeight * 0.5;
      const flip = index ? -1 : 1;
      const scale = 0.9 * k;
      const at = ([x, y]) => [cx + x * scale * flip, cy - y * scale];
      context.globalAlpha = alpha * 0.45;
      context.strokeStyle = COLORS.bialy;
      context.lineWidth = 1;
      for (const line of WHALE_LINES) {
        context.beginPath();
        line.forEach((star, n) => {
          const [px, py] = at(star);
          if (n === 0) context.moveTo(px, py);
          else context.lineTo(px, py);
        });
        context.stroke();
      }
      context.globalAlpha = alpha * 0.9;
      context.fillStyle = COLORS.bialy;
      for (const line of WHALE_LINES) {
        for (const star of line) {
          const [px, py] = at(star);
          context.beginPath();
          context.arc(px, py, 2, 0, Math.PI * 2);
          context.fill();
        }
      }
    }
  }

  return {
    /**
     * Oprawa za światem gry (po niebie, przed chmurkami i gwiazdami tła; piksele ekranu). `bottom` — dolna krawędź
     * widoku (m), udziały stref liczone jak kolory nieba (środek widoku logiki). Zwraca udziały stref.
     */
    draw(layout, bottom, time) {
      const weights = zoneWeights(Math.max(0, bottom + WORLD.height / 2));
      const [ogrodek, blok, chmury, zorza, kosmos] = weights;
      if (ogrodek > 0) garden(layout, bottom, ogrodek);
      if (blok > 0) block(layout, bottom, blok);
      if (chmury > 0) bigClouds(layout, bottom, chmury);
      if (zorza > 0) aurora(layout, bottom, time, zorza);
      if (kosmos > 0) space(layout, bottom, kosmos);
      context.globalAlpha = 1;
      return weights;
    },
  };
}
