// Sowie Tory — rzutnia perspektywiczna (Analiza 2, rozdz. 3.2): punkt zbiegu na linii horyzontu, skala z głębokości.
// Świat w metrach: x — w bok (środek drogi 0, tory co LANES.width), y — w górę od drogi, z — w głąb od sowy
// (sowa na z = 0, kamera LANES… za nią). Rzut liczony w pikselach CSS, więc nie zależy od gęstości ekranu.
import { LANES, PROJECTION } from "./config.js";

// Szerokość drogi (trzy tory) w metrach.
export const ROAD_WIDTH = LANES.count * LANES.width;

// Środek toru (−1, 0, 1) w metrach.
export const laneX = (lane) => lane * LANES.width;

/**
 * Układ rzutni dla ekranu `width × height` (px CSS). Pion: droga przy sowie zajmuje `roadShare` szerokości;
 * poziom: najwyżej `roadHeightShare` wysokości (droga na środku, scenografia po bokach). Wysokość kamery
 * dobrana tak, żeby sowa stała na `owlScreenY` wysokości ekranu, a horyzont był na `horizon`.
 */
export function computeProjection({ width, height, config = PROJECTION }) {
  const portrait = height >= width;
  const roadPx = Math.min(width * config.roadShare, height * config.roadHeightShare);
  const focal = (roadPx * config.cameraBack) / ROAD_WIDTH;
  const horizonY = height * (portrait ? config.horizon : config.horizonLandscape);
  const owlY = height * config.owlScreenY;
  const cameraHeight = ((owlY - horizonY) * config.cameraBack) / focal;
  return {
    width,
    height,
    portrait,
    focal,
    horizonY,
    owlY,
    cameraHeight,
    cameraBack: config.cameraBack,
    centerX: width / 2,
    roadPx,
    farZ: config.farZ,
    fogStart: config.fogStart,
  };
}

/**
 * Punkt świata → ekran: { x, y, scale } (scale = piksele na metr na tej głębokości) albo null, gdy punkt jest za
 * kamerą. `out` pozwala nie tworzyć obiektów w każdej klatce.
 */
export function project(layout, x, y, z, out = { x: 0, y: 0, scale: 0 }) {
  const depth = z + layout.cameraBack;
  if (depth <= 0.05) return null;
  const scale = layout.focal / depth;
  out.x = layout.centerX + x * scale;
  out.y = layout.horizonY + (layout.cameraHeight - y) * scale;
  out.scale = scale;
  return out;
}

// Głębokość, na której punkt drogi (y = 0) wypada na wysokości ekranu `screenY` (odwrotność rzutu dla drogi).
export function depthAtScreenY(layout, screenY) {
  const below = screenY - layout.horizonY;
  if (below <= 0) return Infinity;
  return (layout.focal * layout.cameraHeight) / below - layout.cameraBack;
}

// Mgła w oddali: 0 (bez mgły) do 1 (całkiem schowane) między fogStart a farZ.
export function fogAt(layout, z) {
  if (z <= layout.fogStart) return 0;
  return Math.min(1, (z - layout.fogStart) / (layout.farZ - layout.fogStart));
}

// Czas (s) od chwili, gdy przeszkoda wyłania się z mgły (mgła ≤ 50%), do zderzenia przy danej prędkości.
// Liczony w głębokości, więc taki sam na każdym ekranie.
export function visibleSeconds(speed, config = PROJECTION) {
  return (config.fogStart + (config.farZ - config.fogStart) * 0.5) / speed;
}
