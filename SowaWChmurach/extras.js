// Sowa w Chmurach — dodatki (czysta logika): skaczące kózki (power-upy), tęczowy liść (Gorączka Monster)
// i serduszka (dodatkowe życie). Kózka stoi na platformie ścieżki i przeskakuje łukiem na następną i z powrotem
// (postój, skok) — gracz widzi z daleka, gdzie będzie. Złapanie = moc, kózka nigdy nie rani. Rozmieszczenie:
// planista przy parach kolejnych platform ścieżki, z osobnym generatorem losowym (trasa i przeszkody bez zmian).
import { EXTRAS, GOATS, HAZARDS } from "./config.js";
import { wrapDelta } from "./physics.js";

export const GOAT_ORDER = Object.freeze(["sprezynka", "tarcza", "magnes", "turbo", "podwajaczka"]);

// Platformy, na których kózka może stać (nie znikają i nie jeżdżą).
const STEADY = new Set(["galazka", "balkon", "lisc"]);

/**
 * Położenie kózki w chwili `time`: { x, y (stopy), hopping }. `goat.from` / `goat.to` — wierzchołki dwóch
 * platform ({ x, y }), `goat.phase` — przesunięcie w cyklu (0–1). Cykl: postój na `from` (`GOATS.rest` s), skok
 * (`GOATS.hop` s) łukiem `arc` m (+ połowa różnicy wysokości) ponad prostą między platformami, postój na `to`, skok
 * z powrotem.
 */
export function goatPose(goat, time, out = { x: 0, y: 0, hopping: false }) {
  const cycle = GOATS.rest + GOATS.hop;
  const t = Math.max(0, time + goat.phase * cycle * 2);
  const step = Math.floor(t / cycle);
  const within = t - step * cycle;
  const from = step % 2 === 0 ? goat.from : goat.to;
  const to = step % 2 === 0 ? goat.to : goat.from;
  if (within < GOATS.rest) {
    out.x = from.x;
    out.y = from.y;
    out.hopping = false;
    return out;
  }
  const p = (within - GOATS.rest) / GOATS.hop;
  // Łuk: prosta między platformami + garb `arc` (wyższy przy większej różnicy wysokości).
  const bump = GOATS.arc + Math.abs(to.y - from.y) * 0.5;
  out.x = from.x + wrapDelta(from.x, to.x) * p;
  out.y = from.y + (to.y - from.y) * p + bump * 4 * p * (1 - p);
  out.hopping = true;
  return out;
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

// Czy sowa łapie kózkę (koło sowy i koło kózki nad jej stopami)?
export function catchesGoat(owl, goat, time, pose = goatPose(goat, time)) {
  const dx = wrapDelta(pose.x, owl.x);
  const dy = owl.y + HAZARDS.owlCenter - (pose.y + GOATS.center);
  return Math.hypot(dx, dy) < HAZARDS.owlRadius + GOATS.radius;
}

/**
 * Planista dodatków: `plan(dolna, górna, kózki, serduszka, liście)` dla każdej pary kolejnych platform ścieżki.
 * Kózka co `GOATS.every` m (między dwiema stałymi platformami), serduszko co `EXTRAS.heartEvery` m, tęczowy liść
 * co `EXTRAS.rainbowEvery` m (nad platformą), najwyżej jeden dodatek na parę.
 */
export function createExtrasPlanner({ random }) {
  const pick = ([min, max]) => min + (max - min) * random();
  let nextGoat = GOATS.first + pick([0, 40]);
  let nextHeart = pick(EXTRAS.heartEvery);
  let nextRainbow = EXTRAS.rainbowFrom + pick([0, 100]);
  let lastKind = null;
  return {
    plan(lower, upper, goats, hearts, leaves) {
      if (upper.y >= nextGoat && STEADY.has(lower.type) && STEADY.has(upper.type)) {
        const kind = pickGoat(random, lastKind);
        lastKind = kind;
        goats.push({
          kind,
          from: { x: lower.baseX, y: lower.y },
          to: { x: upper.baseX, y: upper.y },
          phase: random(),
          taken: false,
        });
        nextGoat = upper.y + pick(GOATS.every);
        return;
      }
      if (upper.y >= nextHeart && upper.type !== "hustawka") {
        hearts.push({ x: upper.baseX, y: upper.y + EXTRAS.heartHeight, taken: false });
        nextHeart = upper.y + pick(EXTRAS.heartEvery);
        return;
      }
      if (upper.y >= nextRainbow && upper.type !== "hustawka") {
        leaves.push({ x: upper.baseX, y: upper.y + EXTRAS.rainbowHeight, kind: "teczowy", taken: false });
        nextRainbow = upper.y + pick(EXTRAS.rainbowEvery);
      }
    },
  };
}
