// Sowia Ucieczka — tła biomów (co 1000 m) i ocean „Rejsu na humbaku”. Warstwy paralaksy rysowane kodem
// (kształty w kolorach palety), bez emoji i bez logotypów. Przejście między biomami: 60 m przenikania.
import { COLORS } from "../shared/world/tokens.js";
import { BIOME_COUNT, BIOME_LENGTH } from "./config.js";

const BLEND = 60; // m przenikania na początku nowego biomu

// Warstwy: typ (hills, skyline, blocks, canopies, sea, dunes, stars), paralaksa (0 = nieruchoma względem ekranu
// przy kamerze, 1 = jak świat), kolory i odstępy. deco — drobne elementy blisko toru.
export const BIOMES = Object.freeze([
  {
    id: "laka",
    name: "Łąka",
    sky: ["#bfe9ff", "#fff6e3"],
    ground: { top: COLORS.monstera, topDark: COLORS.monsteraCiemna, fill: "#c98f5e", fillDark: "#a8714a" },
    layers: [
      { type: "hills", factor: 0.75, color: "#a8dcc0", height: 2.2, spacing: 7 },
      { type: "hills", factor: 0.45, color: "#7fcf9c", height: 1.1, spacing: 4 },
    ],
    deco: "flowers",
  },
  {
    id: "miasto",
    name: "Miasto",
    sky: ["#cfe7ff", "#fff1e0"],
    ground: { top: "#b8b3c4", topDark: "#8e879e", fill: "#9c95ad", fillDark: "#847c96" },
    layers: [
      { type: "skyline", factor: 0.78, color: "#c3cde0", window: "#e7eefa", spacing: 2.4, min: 3, max: 7 },
      { type: "skyline", factor: 0.5, color: "#9fb0cc", window: "#fff2b8", spacing: 2.8, min: 2, max: 4.5 },
    ],
    deco: "lamps",
  },
  {
    id: "prl",
    name: "Osiedle PRL",
    sky: ["#d8e6f2", "#f6efe3"],
    ground: { top: "#8fbf7a", topDark: "#6f9e5c", fill: "#b9b0a4", fillDark: "#9d9387" },
    layers: [
      { type: "blocks", factor: 0.8, color: "#d6cfc3", window: "#a9b8cf", spacing: 7, height: 6 },
      { type: "blocks", factor: 0.55, color: "#e6d8b8", window: "#8fa2c0", spacing: 9, height: 4.2 },
    ],
    deco: "trzepak",
  },
  {
    id: "stacja",
    name: "Stacja Amic",
    sky: ["#bfe9ff", "#fff6e3"],
    ground: { top: "#8c8698", topDark: "#6f6a7b", fill: "#7d7590", fillDark: "#6a6380" },
    layers: [
      { type: "hills", factor: 0.8, color: "#b9dcc8", height: 1.6, spacing: 8 },
      { type: "canopies", factor: 0.55, color: COLORS.bialy, spacing: 12 },
    ],
    deco: "dashes",
  },
  {
    id: "plaza",
    name: "Plaża",
    sky: ["#9fe0ff", "#fff3d6"],
    ground: { top: "#f7e3ae", topDark: "#e8c97f", fill: "#f1d596", fillDark: "#e0bd78" },
    layers: [
      { type: "sea", factor: 0.9, color: COLORS.woda, light: COLORS.wodaJasna, level: 1.4 },
      { type: "dunes", factor: 0.55, color: "#f3dfa8", height: 0.9, spacing: 5 },
    ],
    deco: "umbrellas",
  },
  {
    id: "noc",
    name: "Noc nad morzem",
    sky: ["#232b57", "#4b3f72"],
    night: true,
    ground: { top: "#7a6a94", topDark: "#5f5179", fill: "#8f7a9e", fillDark: "#6f5d82" },
    layers: [
      { type: "stars", factor: 0.95 },
      { type: "sea", factor: 0.9, color: "#2d4c7c", light: "#6f86b8", level: 1.4 },
      { type: "dunes", factor: 0.55, color: "#5a4f7d", height: 0.9, spacing: 5 },
    ],
    deco: "fireflies",
  },
]);

export const OCEAN = Object.freeze({
  id: "ocean",
  name: "Ocean",
  sky: ["#9fe0ff", "#e8f8ff"],
  night: false,
});

function hash(value) {
  const x = Math.sin(value * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function parse(hex) {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

// Mieszanie kolorów #rrggbb (t = 0 → a, 1 → b).
export function mixColor(a, b, t) {
  if (a === b || t >= 1) return b;
  if (t <= 0) return a;
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const mix = (x, y) => Math.round(x + (y - x) * t);
  return `rgb(${mix(ar, br)}, ${mix(ag, bg)}, ${mix(ab, bb)})`;
}

// Biom na dystansie i przenikanie z poprzednim (pierwsze 60 m nowego biomu).
export function biomeBlend(distance) {
  const index = Math.floor(Math.max(0, distance) / BIOME_LENGTH);
  const current = BIOMES[index % BIOME_COUNT];
  const local = Math.max(0, distance) - index * BIOME_LENGTH;
  if (index === 0 || local >= BLEND) return { current, previous: current, t: 1 };
  return { current, previous: BIOMES[(index - 1) % BIOME_COUNT], t: local / BLEND };
}

export function groundStyle(blend) {
  const { current, previous, t } = blend;
  const out = {};
  for (const key of Object.keys(current.ground)) out[key] = mixColor(previous.ground[key], current.ground[key], t);
  return out;
}

export function skyColors(blend) {
  const { current, previous, t } = blend;
  return [mixColor(previous.sky[0], current.sky[0], t), mixColor(previous.sky[1], current.sky[1], t)];
}

// ---------- Warstwy (jednostki świata; y = 0 ziemia) ----------

function repeat(camera, bounds, factor, spacing, draw) {
  const shift = camera.x * factor;
  const start = Math.floor((bounds.left - shift) / spacing) - 1;
  const end = Math.ceil((bounds.right - shift) / spacing) + 1;
  for (let index = start; index <= end; index += 1) draw(index * spacing + shift, index);
}

const LAYERS = {
  hills(context, camera, bounds, layer, seed) {
    const shift = camera.x * layer.factor;
    const spacing = layer.spacing;
    const start = Math.floor((bounds.left - shift) / spacing) - 1;
    const end = Math.ceil((bounds.right - shift) / spacing) + 1;
    context.fillStyle = layer.color;
    context.beginPath();
    context.moveTo(bounds.left - spacing, 1);
    for (let index = start; index <= end; index += 1) {
      const x = index * spacing + shift;
      const h = layer.height * (0.6 + hash(index * 7.3 + seed) * 0.6);
      context.lineTo(x - spacing / 2, 0.2);
      context.quadraticCurveTo(x, -h * 2, x + spacing / 2, 0.2);
    }
    context.lineTo(bounds.right + spacing, 1);
    context.closePath();
    context.fill();
  },
  dunes(context, camera, bounds, layer, seed) {
    LAYERS.hills(context, camera, bounds, layer, seed);
  },
  skyline(context, camera, bounds, layer, seed) {
    repeat(camera, bounds, layer.factor, layer.spacing, (x, index) => {
      const width = layer.spacing * (0.55 + hash(index + seed) * 0.35);
      const height = layer.min + hash(index * 3.7 + seed) * (layer.max - layer.min);
      context.fillStyle = layer.color;
      context.fillRect(x, -height, width, height + 0.3);
      context.fillStyle = layer.window;
      for (let wy = -height + 0.4; wy < -0.4; wy += 0.7) {
        for (let wx = x + 0.25; wx < x + width - 0.3; wx += 0.55) {
          if (hash(wx * 3.1 + wy * 7.7) > 0.35) context.fillRect(wx, wy, 0.22, 0.3);
        }
      }
    });
  },
  // Bloki z wielkiej płyty: szerokie prostokąty z siatką okien i balkonami.
  blocks(context, camera, bounds, layer, seed) {
    repeat(camera, bounds, layer.factor, layer.spacing, (x, index) => {
      if (hash(index * 1.9 + seed) < 0.2) return;
      const width = layer.spacing * 0.7;
      const height = layer.height * (0.8 + hash(index + seed) * 0.35);
      context.fillStyle = layer.color;
      context.fillRect(x, -height, width, height + 0.3);
      context.fillStyle = layer.window;
      for (let wy = -height + 0.35; wy < -0.5; wy += 0.6) {
        for (let wx = x + 0.3; wx < x + width - 0.3; wx += 0.5) context.fillRect(wx, wy, 0.26, 0.3);
      }
      context.fillStyle = "rgba(59, 47, 74, 0.12)";
      for (let wy = -height + 0.7; wy < -0.5; wy += 1.2) context.fillRect(x, wy, width, 0.08);
    });
  },
  // Wiaty stacji: słupy i płaski dach w bieli z czerwonym i zielonym pasem (bez logotypu).
  canopies(context, camera, bounds, layer, seed) {
    repeat(camera, bounds, layer.factor, layer.spacing, (x, index) => {
      if (hash(index * 2.3 + seed) < 0.3) return;
      const width = 6;
      context.fillStyle = COLORS.szary;
      context.fillRect(x + 0.8, -3, 0.3, 3.2);
      context.fillRect(x + width - 1.1, -3, 0.3, 3.2);
      context.fillStyle = layer.color;
      context.fillRect(x, -3.6, width, 0.6);
      context.fillStyle = COLORS.amicCzerwony;
      context.fillRect(x, -3.6, width, 0.18);
      context.fillStyle = COLORS.amicZielony;
      context.fillRect(x, -3.12, width, 0.12);
    });
  },
  sea(context, camera, bounds, layer, seed, time) {
    const top = -layer.level;
    context.fillStyle = layer.color;
    context.fillRect(bounds.left - 1, top, bounds.right - bounds.left + 2, layer.level + 0.4);
    context.strokeStyle = layer.light;
    context.lineWidth = 0.06;
    repeat(camera, bounds, layer.factor, 1.6, (x, index) => {
      const y = top + 0.25 + hash(index + seed) * (layer.level - 0.5);
      const wave = Math.sin(time * 1.5 + index) * 0.1;
      context.beginPath();
      context.moveTo(x + wave, y);
      context.lineTo(x + 0.6 + wave, y);
      context.stroke();
    });
  },
  stars(context, camera, bounds, layer, seed, time) {
    context.fillStyle = "#fff6d8";
    const alpha = context.globalAlpha;
    repeat(camera, bounds, layer.factor, 1.3, (x, index) => {
      const y = bounds.top + 1 + hash(index * 5.1 + seed) * (Math.abs(bounds.top) * 0.75);
      const twinkle = 0.5 + 0.5 * Math.sin(time * 2 + index);
      context.globalAlpha = alpha * (0.4 + 0.6 * twinkle);
      context.beginPath();
      context.arc(x + hash(index) * 0.8, y, 0.05 + hash(index * 9.1) * 0.04, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = alpha;
    // Księżyc (prawie nieruchomy).
    const moonX = camera.x + (bounds.right - camera.x) * 0.55;
    const moonY = bounds.top + 3.2;
    context.fillStyle = "#fff3c4";
    context.beginPath();
    context.arc(moonX, moonY, 0.9, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#232b57";
    context.beginPath();
    context.arc(moonX + 0.4, moonY - 0.25, 0.8, 0, Math.PI * 2);
    context.fill();
  },
};

// Drobiazgi przy torze (paralaksa 0,25): kwiaty, latarnie, trzepaki, pasy na asfalcie, parasole, świetliki.
const DECO = {
  flowers(context, camera, bounds, time) {
    repeat(camera, bounds, 0.25, 1.7, (x, index) => {
      if (hash(index * 4.4) < 0.4) return;
      context.strokeStyle = COLORS.monsteraCiemna;
      context.lineWidth = 0.05;
      context.beginPath();
      context.moveTo(x, 0.05);
      context.lineTo(x + Math.sin(time + index) * 0.04, -0.45);
      context.stroke();
      context.fillStyle = [COLORS.policzki, COLORS.zloto, COLORS.bialy][((index % 3) + 3) % 3];
      context.beginPath();
      context.arc(x, -0.5, 0.12, 0, Math.PI * 2);
      context.fill();
    });
  },
  lamps(context, camera, bounds) {
    repeat(camera, bounds, 0.25, 6, (x) => {
      context.fillStyle = COLORS.szaryCiemny;
      context.fillRect(x, -2.6, 0.12, 2.7);
      context.fillRect(x - 0.3, -2.7, 0.5, 0.12);
      context.fillStyle = "#fff2b8";
      context.beginPath();
      context.arc(x - 0.28, -2.52, 0.13, 0, Math.PI * 2);
      context.fill();
    });
  },
  trzepak(context, camera, bounds) {
    repeat(camera, bounds, 0.25, 11, (x, index) => {
      if (hash(index * 2.7) < 0.4) return;
      context.strokeStyle = COLORS.szaryCiemny;
      context.lineWidth = 0.09;
      context.beginPath();
      context.moveTo(x, 0.05);
      context.lineTo(x, -1.4);
      context.moveTo(x + 2, 0.05);
      context.lineTo(x + 2, -1.4);
      context.moveTo(x - 0.1, -1.35);
      context.lineTo(x + 2.1, -1.35);
      context.stroke();
    });
  },
  dashes(context, camera, bounds) {
    context.fillStyle = "rgba(255, 255, 255, 0.75)";
    repeat(camera, bounds, 1, 2, (x) => context.fillRect(x, 0.7, 1, 0.1));
  },
  umbrellas(context, camera, bounds) {
    repeat(camera, bounds, 0.25, 7, (x, index) => {
      if (hash(index * 3.9) < 0.35) return;
      context.strokeStyle = COLORS.szaryCiemny;
      context.lineWidth = 0.07;
      context.beginPath();
      context.moveTo(x, 0.05);
      context.lineTo(x, -1.8);
      context.stroke();
      context.fillStyle = index % 2 ? COLORS.pracu : COLORS.niebieski;
      context.beginPath();
      context.moveTo(x - 1, -1.6);
      context.quadraticCurveTo(x, -2.5, x + 1, -1.6);
      context.closePath();
      context.fill();
    });
  },
  fireflies(context, camera, bounds, time) {
    context.fillStyle = "#fff2a0";
    // Jasność mnożona przez przezroczystość biomu (przenikanie), potem przywracana.
    const alpha = context.globalAlpha;
    repeat(camera, bounds, 0.3, 2.2, (x, index) => {
      const y = -0.8 - hash(index * 6.1) * 2.5 + Math.sin(time * 1.3 + index) * 0.2;
      context.globalAlpha = alpha * (0.4 + 0.5 * (0.5 + 0.5 * Math.sin(time * 3 + index * 2)));
      context.beginPath();
      context.arc(x + Math.sin(time + index) * 0.3, y, 0.07, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = alpha;
  },
};

function drawBiome(context, camera, bounds, biome, time, alpha) {
  if (alpha <= 0) return;
  context.save();
  context.globalAlpha = alpha;
  biome.layers.forEach((layer, index) => LAYERS[layer.type](context, camera, bounds, layer, index + 1, time));
  DECO[biome.deco]?.(context, camera, bounds, time);
  context.restore();
}

// Chmury (paralaksa 0,8) — w dzień białe, w nocy przygaszone.
function clouds(context, camera, bounds, night) {
  context.fillStyle = night ? "rgba(160, 160, 200, 0.35)" : "rgba(255, 255, 255, 0.85)";
  repeat(camera, bounds, 0.8, 9, (x0, index) => {
    if (hash(index * 3.1) < 0.35) return;
    const x = x0 + hash(index) * 4;
    const y = -6 - hash(index * 1.7) * 6;
    const w = 1.6 + hash(index * 2.3) * 1.6;
    context.beginPath();
    context.ellipse(x, y, w, w * 0.32, 0, 0, Math.PI * 2);
    context.ellipse(x - w * 0.4, y - w * 0.18, w * 0.45, w * 0.36, 0, 0, Math.PI * 2);
    context.ellipse(x + w * 0.35, y - w * 0.22, w * 0.5, w * 0.4, 0, 0, Math.PI * 2);
    context.fill();
  });
}

// Tło biomu (bez nieba): chmury, warstwy poprzedniego biomu (znikają) i bieżącego (pojawiają się).
export function drawBiomeBackground(context, camera, bounds, blend, time) {
  clouds(context, camera, bounds, blend.current.night && blend.t > 0.5);
  if (blend.t < 1) drawBiome(context, camera, bounds, blend.previous, time, 1 - blend.t);
  drawBiome(context, camera, bounds, blend.current, time, blend.t);
}

// Ocean „Rejsu na humbaku”: morze od linii wody (y = 0) w dół, fale, horyzont z wyspami.
export function drawOcean(context, camera, bounds, time, night = false) {
  clouds(context, camera, bounds, night);
  context.fillStyle = night ? "#3f5f8f" : "#8fd7ee";
  repeat(camera, bounds, 0.85, 14, (x, index) => {
    if (hash(index * 1.3) < 0.5) return;
    context.beginPath();
    context.ellipse(x, -1.4, 2.2, 0.7, 0, Math.PI, 0);
    context.fill();
  });
  const top = -0.1;
  const gradient = context.createLinearGradient(0, top, 0, bounds.bottom + 1);
  gradient.addColorStop(0, night ? "#2d4c7c" : COLORS.woda);
  gradient.addColorStop(1, night ? "#1d2f55" : COLORS.wodaCiemna);
  context.fillStyle = gradient;
  context.beginPath();
  context.moveTo(bounds.left - 1, bounds.bottom + 1);
  for (let x = Math.floor(bounds.left) - 1; x <= bounds.right + 1; x += 0.5) {
    context.lineTo(x, top + Math.sin(x * 1.3 + time * 2.2) * 0.08);
  }
  context.lineTo(bounds.right + 1, bounds.bottom + 1);
  context.closePath();
  context.fill();
  context.strokeStyle = night ? "#6f86b8" : COLORS.wodaJasna;
  context.lineWidth = 0.06;
  repeat(camera, bounds, 1, 2.3, (x, index) => {
    const y = 0.5 + hash(index * 2.9) * 2.5;
    context.beginPath();
    context.moveTo(x + Math.sin(time + index) * 0.2, y);
    context.lineTo(x + 0.7 + Math.sin(time + index) * 0.2, y);
    context.stroke();
  });
}
