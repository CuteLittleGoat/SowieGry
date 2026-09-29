// Sowie Tory — przeszkody według sposobu omijania (Analiza 2, rozdz. 3.2): niska (skok), wysoka (ślizg),
// pełna (zmiana toru; długa zajmuje tor na dłużej) i ruchoma (telefon Pracu zmieniający tor). Rodziny Pracu i Amic.
// sprite — grafika z atlasu Sowiego Świata (shared/world/catalog.js); draw — wysokość rysunku w metrach.
import { LANES, OBSTACLE_TYPES, OWL } from "./config.js";
import { owlTop } from "./physics.js";
import { laneX } from "./projection.js";

export const OBSTACLES = Object.freeze({
  // Pracu Pracu
  teczka: { family: "pracu", type: "low", sprite: "pracu-teczka", draw: 0.95, label: "Teczka pełna papierów!" },
  budzik: { family: "pracu", type: "low", sprite: "pracu-budzik", draw: 0.85, label: "Budzik na zmianę!" },
  dymek: { family: "pracu", type: "high", sprite: "pracu-dymek", draw: 1.15, label: "Pracu Pracu!" },
  tablica: {
    family: "pracu",
    type: "full",
    sprite: "pracu-tablica",
    draw: 1.9,
    label: "Przyjmiesz zmianę? Nie!",
  },
  telefon: { family: "pracu", type: "full", sprite: "pracu-telefon", draw: 1.7, label: "Telefon z pracy!" },
  magda: { family: "pracu", type: "full", sprite: "pracu-telefon-magda", draw: 1.7, label: "Telefon od Magdy!" },
  // Amic
  barierka: { family: "amic", type: "low", sprite: "amic-barierka", draw: 0.9, label: "Barierka Amic!" },
  kanister: { family: "amic", type: "low", sprite: "amic-kanister", draw: 0.75, label: "Kanister Amic!" },
  "znak-cen": { family: "amic", type: "high", sprite: "amic-znak-cen", draw: 3, label: "Znak z cenami Amic!" },
  dystrybutor: {
    family: "amic",
    type: "full",
    sprite: "amic-dystrybutor",
    draw: 2,
    label: "Stacja Amic blokuje tor!",
  },
  wozek: { family: "amic", type: "full", sprite: "amic-wozek", draw: 1.4, label: "Wózek na torze!" },
  cysterna: {
    family: "amic",
    type: "full",
    sprite: "amic-cysterna",
    draw: 2.3,
    depth: 10,
    label: "Cysterna Amic!",
  },
});

// Połowa szerokości przeszkody w bok (tor ma 1,6 m; przeszkoda 1,3 m).
export const OBSTACLE_HALF_WIDTH = 0.65;

// Wymiary przeszkody danego rodzaju: { type, top, bottom, depth }.
export function obstacleShape(kind) {
  const item = OBSTACLES[kind];
  if (!item) throw new Error(`Nieznana przeszkoda: ${kind}`);
  const base = OBSTACLE_TYPES[item.type];
  return { type: item.type, top: base.top, bottom: base.bottom ?? 0, depth: item.depth ?? base.depth };
}

// Położenie przeszkody w bok (m): ruchoma przesuwa się między torami.
export function obstacleX(item) {
  if (item.moveProgress === undefined || item.moveTo === undefined) return laneX(item.lane);
  const eased = item.moveProgress * item.moveProgress * (3 - 2 * item.moveProgress);
  return laneX(item.lane) + (laneX(item.moveTo) - laneX(item.lane)) * eased;
}

/**
 * Czy sowa (ciało z physics.js) zderza się z przeszkodą, której przód jest `z` m przed sową?
 * Niska — tylko gdy sowa jest niżej niż jej górna krawędź; wysoka — gdy głowa sowy sięga jej dolnej krawędzi
 * (ślizg przechodzi pod spodem); pełna — zawsze w tym samym torze.
 */
export function collides(body, item, z) {
  const shape = obstacleShape(item.kind);
  if (z > OWL.halfDepth || z + shape.depth < -OWL.halfDepth) return false;
  if (Math.abs(body.x - obstacleX(item)) >= OWL.halfWidth + OBSTACLE_HALF_WIDTH) return false;
  if (shape.type === "low") return body.y < shape.top;
  if (shape.type === "high") return owlTop(body) > shape.bottom && body.y < shape.top;
  return true;
}

// Tor, w którym leży punkt x (do testów i podpowiedzi).
export const laneOf = (x) => Math.max(LANES.min, Math.min(LANES.max, Math.round(x / LANES.width)));
