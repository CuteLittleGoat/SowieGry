// Sowie Tory — skaczące kózki (Analiza 2, rozdz. 2.2 i 3.2): stoją w poprzek drogi i przeskakują łukiem między
// dwoma sąsiednimi torami (postój 0,6 s, skok 0,4 s), więc gracz widzi z daleka, gdzie będą. Złapanie = power-up,
// kózka nigdy nie rani. Czysta logika (testy jednostkowe).
import { GOATS } from "./config.js";
import { laneX } from "./projection.js";

export const GOAT_ORDER = Object.freeze(["sprezynka", "tarcza", "magnes", "turbo", "podwajaczka"]);
export const GOAT_MOTION = Object.freeze({ rest: 0.6, hop: 0.4 });

/**
 * Położenie kózki w chwili `time` (s): { x, y, lane (tor, na którym stoi albo do którego skacze), hopping }.
 * `goat.lanes` — dwa sąsiednie tory, `goat.phase` — przesunięcie w cyklu (0–1).
 */
export function goatPose(goat, time) {
  const cycle = GOAT_MOTION.rest + GOAT_MOTION.hop;
  const t = Math.max(0, time + goat.phase * cycle * 2);
  const step = Math.floor(t / cycle);
  const within = t - step * cycle;
  const from = goat.lanes[step % 2];
  const to = goat.lanes[(step + 1) % 2];
  if (within < GOAT_MOTION.rest) return { x: laneX(from), y: 0, lane: from, hopping: false };
  const p = (within - GOAT_MOTION.rest) / GOAT_MOTION.hop;
  return {
    x: laneX(from) + (laneX(to) - laneX(from)) * p,
    y: GOATS.hopHeight * 4 * p * (1 - p),
    lane: to,
    hopping: true,
  };
}

// Rodzaj kózki: losowanie z wagami `GOATS.weights`, bez powtórzenia poprzedniej.
export function pickGoat(random, last = null) {
  const pool = GOAT_ORDER.filter((kind) => kind !== last);
  const total = pool.reduce((sum, kind) => sum + GOATS.weights[kind], 0);
  let pick = random() * total;
  for (const kind of pool) {
    pick -= GOATS.weights[kind];
    if (pick < 0) return kind;
  }
  return pool.at(-1);
}

// Czy sowa (ciało z physics.js) łapie kózkę stojącą `z` m przed nią w chwili `time`?
export function catchesGoat(body, goat, z, time) {
  if (Math.abs(z) > GOATS.reachZ) return false;
  const pose = goatPose(goat, time);
  return Math.abs(body.x - pose.x) < GOATS.reachX && Math.abs(body.y - pose.y) < 1.4;
}
