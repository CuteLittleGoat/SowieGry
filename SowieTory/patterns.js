// Sowie Tory — wzory przeszkód (fragmenty trasy) zamiast czystej losowości (Analiza 2, rozdz. 2.6 i 3.2).
// Wzór to rzędy na głębokości z (m od początku wzoru); w rzędzie trzy znaki — lewy, środkowy i prawy tor.
// Test jednostkowy sprawdza, że każdy wzór da się przejść bez trafienia przy najmniejszej i największej prędkości
// (tests/unit/tory.test.mjs).
import { DIFFICULTIES, TRACK } from "./config.js";

// ---------- Język wzorów ----------

// Znak → rodzaj przeszkody (obstacles.js). Małe litery — Pracu Pracu, wielkie — Amic.
export const OBSTACLE_CODES = Object.freeze({
  t: "teczka",
  b: "budzik",
  d: "dymek",
  p: "telefon",
  m: "magda",
  s: "tablica",
  B: "barierka",
  K: "kanister",
  Z: "znak-cen",
  D: "dystrybutor",
  W: "wozek",
  C: "cysterna",
});

// Liście w rzędzie: o — 4 liście w linii (co 3 m), ^ — łuk 5 liści nad niską przeszkodą (tor skoku),
// _ — 3 nisko (pod wysoką przeszkodą, do ślizgu), g — złoty liść.
const LEAF_CODES = new Set(["o", "^", "_", "g"]);

const LANE_OF_INDEX = [-1, 0, 1];

function parseRow(z, obstacles, leaves = "...") {
  const items = [];
  [...obstacles].forEach((code, index) => {
    const lane = LANE_OF_INDEX[index];
    if (code === ".") return;
    if (code === "<" || code === ">") {
      // Ruchomy telefon Pracu: przejeżdża o jeden tor w lewo / w prawo (strzałka ostrzega 0,8 s wcześniej).
      const moveTo = lane + (code === "<" ? -1 : 1);
      if (moveTo < -1 || moveTo > 1) throw new Error(`Ruchomy telefon poza drogą: ${obstacles}`);
      items.push({ type: "obstacle", kind: "telefon", lane, z, moveTo });
      return;
    }
    const kind = OBSTACLE_CODES[code];
    if (!kind) throw new Error(`Nieznany znak wzoru: ${code}`);
    items.push({ type: "obstacle", kind, lane, z });
  });
  [...leaves].forEach((code, index) => {
    const lane = LANE_OF_INDEX[index];
    if (code === ".") return;
    if (!LEAF_CODES.has(code)) throw new Error(`Nieznany znak liści: ${code}`);
    if (code === "o") {
      for (let step = 0; step < 4; step += 1) items.push({ type: "leaf", lane, z: z + step * 3, y: 0.6 });
    } else if (code === "^") {
      // Łuk jak tor skoku: środek nad przeszkodą.
      for (let step = -2; step <= 2; step += 1) {
        items.push({ type: "leaf", lane, z: z + step * 1.6, y: 0.6 + 1.0 * (1 - (step * step) / 4) });
      }
    } else if (code === "_") {
      for (let step = -1; step <= 1; step += 1) items.push({ type: "leaf", lane, z: z + step * 1.4, y: 0.3 });
    } else items.push({ type: "leaf", lane, z, y: 0.6, kind: "zloty" });
  });
  return items;
}

// `stages` — wzór tylko na wybranych planszach (identyfikatory ze stages.js); bez — na każdej.
const pattern = (id, tier, length, tags, rows, stages = null) => ({
  id,
  tier,
  length,
  tags,
  stages,
  items: rows.flatMap(([z, obstacles, leaves]) => parseRow(z, obstacles, leaves)),
});

// ---------- Wzory ----------

export const PATTERNS = Object.freeze([
  // Próg 0 — rozgrzewka: jedna przeszkoda naraz, liście pokazują, gdzie biec albo że trzeba skoczyć.
  pattern("t0-telefon", 0, 18, ["pracu", "full"], [[8, ".p.", "o.o"]]),
  pattern("t0-dystrybutor", 0, 18, ["amic", "full"], [[8, "D..", ".o."]]),
  pattern("t0-teczka", 0, 16, ["pracu", "low"], [[8, ".t.", ".^."]]),
  pattern("t0-barierka", 0, 16, ["amic", "low"], [[8, "..B", "..^"]]),
  pattern("t0-dymek", 0, 16, ["pracu", "high"], [[8, "d..", "_.."]]),
  pattern("t0-znak", 0, 16, ["amic", "high"], [[8, ".Z.", "._."]]),
  pattern("t0-oddech", 0, 14, ["breather"], [[2, "...", "o.o"]]),
  pattern("t0-oddech-zloty", 0, 14, ["breather"], [[4, "...", ".g."]]),

  // Próg 1 — dwie przeszkody w rzędzie, pierwsze zmiany toru i kanistry w parach.
  pattern("t1-dwa-telefony", 1, 18, ["pracu", "full"], [[9, "p.m", ".o."]]),
  pattern("t1-wozki", 1, 18, ["amic", "full"], [[9, "WW.", "..o"]]),
  pattern("t1-kanistry", 1, 18, ["amic", "low"], [[9, "K.K", ".o."]]),
  pattern(
    "t1-slalom",
    1,
    28,
    ["pracu", "full"],
    [
      [6, "p..", ".o."],
      [18, "..m", "o.."],
    ],
  ),
  pattern("t1-dymki", 1, 20, ["pracu", "high"], [[9, "dd.", "__o"]]),
  pattern("t1-budziki", 1, 18, ["pracu", "low"], [[9, "b.b", "^o^"]]),
  pattern("t1-cysterna", 1, 24, ["amic", "full", "long"], [[8, ".C.", "o.o"]]),
  pattern(
    "t1-zygzak",
    1,
    26,
    ["pracu", "full"],
    [
      [6, ".p.", "o.o"],
      [16, "p.m", ".o."],
    ],
  ),
  // Plansze: kasy w Biedronce (wózki po bokach, dymek nad kasą), katalogi na festiwalu, podwórko na PRL,
  // podjazd na stacji Amic (samochody są dłuższe niż wózki).
  pattern(
    "b1-kasy",
    1,
    26,
    ["amic", "pracu"],
    [
      [8, "W.W", ".o."],
      [18, ".d.", "._."],
    ],
    ["biedronka"],
  ),
  pattern("f1-katalogi", 1, 18, ["pracu", "low"], [[9, "ttt", "^^^"]], ["festiwal"]),
  pattern(
    "p1-podworko",
    1,
    30,
    ["amic", "long"],
    [
      [8, "B.B", ".o."],
      [18, ".C.", "o.o"],
    ],
    ["prl"],
  ),
  pattern("a1-podjazd", 1, 22, ["amic", "long"], [[8, "W.W", ".o."]], ["amic"]),

  // Próg 2 — pełne rzędy do skoku albo ślizgu, ruchomy telefon.
  pattern("t2-barierki", 2, 18, ["amic", "low"], [[9, "BBB", ".^."]]),
  pattern("t2-znaki", 2, 18, ["amic", "high"], [[9, "ZZZ", "_._"]]),
  pattern("t2-ruchomy", 2, 24, ["pracu", "moving"], [[14, ".>.", "o.."]]),
  pattern(
    "t2-przyjmiesz-zmiane",
    2,
    24,
    ["pracu", "full"],
    [
      [8, "s.s", ".o."],
      [17, ".b.", ".^."],
    ],
  ),
  pattern(
    "t2-telefon-teczki",
    2,
    22,
    ["pracu", "mix"],
    [
      [8, "p.t", "..^"],
      [16, ".d.", "._."],
    ],
  ),
  pattern(
    "t2-skok-i-slizg",
    2,
    30,
    ["mix"],
    [
      [8, ".t.", ".^."],
      [20, ".d.", "._."],
    ],
  ),
  pattern(
    "b2-promocje",
    2,
    26,
    ["amic", "mix"],
    [
      [8, "Z.K", "_o^"],
      [18, ".K.", ".^."],
    ],
    ["biedronka"],
  ),
  pattern(
    "f2-stoiska",
    2,
    28,
    ["amic", "full"],
    [
      [8, "D.D", ".o."],
      [18, "K.K", "^o^"],
    ],
    ["festiwal"],
  ),
  pattern(
    "p2-trzepak",
    2,
    28,
    ["mix"],
    [
      [8, "BB.", "^^o"],
      [18, ".m.", "o.o"],
    ],
    ["prl"],
  ),
  pattern(
    "a2-dystrybutory",
    2,
    26,
    ["amic", "mix"],
    [
      [8, "D.D", ".o."],
      [16, ".Z.", "._."],
    ],
    ["amic"],
  ),

  // Próg 3 — kombinacje: tor trzeba wybrać wcześniej, a potem jeszcze skoczyć albo się ślizgnąć.
  pattern(
    "t3-brama",
    3,
    24,
    ["mix"],
    [
      [8, "D.D", ".o."],
      [16, "WtW", ".^."],
    ],
  ),
  pattern(
    "t3-cysterny",
    3,
    30,
    ["amic", "long"],
    [
      [8, "C.C", ".o."],
      [22, "KDK", "^.^"],
    ],
  ),
  pattern(
    "t3-ruchome",
    3,
    34,
    ["pracu", "moving"],
    [
      [12, "..<", "o.."],
      [24, ">..", "..o"],
    ],
  ),
  pattern(
    "a3-stacja",
    3,
    30,
    ["amic", "mix"],
    [
      [8, "WD.", "..o"],
      [20, ".KZ", ".^_"],
    ],
    ["amic"],
  ),
]);

export const PATTERN_BY_ID = Object.freeze(Object.fromEntries(PATTERNS.map((item) => [item.id, item])));

// Próg trudności na dystansie kampanii (m): 0 do 300 m, 1 do 900 m, 2 do 1800 m, potem 3.
export const TIER_DISTANCE = Object.freeze([0, 300, 900, 1800]);
export function tierAt(distance) {
  let tier = 0;
  for (let index = 0; index < TIER_DISTANCE.length; index += 1) if (distance >= TIER_DISTANCE[index]) tier = index;
  return tier;
}

// Odstęp po wzorze (m): stały czas przy każdej prędkości, skalowany poziomem trudności.
export function gapAfter(speed, difficulty = "arcade") {
  const config = DIFFICULTIES[difficulty] || DIFFICULTIES.arcade;
  return TRACK.gap * (speed / TRACK.gapSpeed) * config.gap;
}

// Czy wzór może wystąpić na danej planszy (identyfikator ze stages.js; brak — każda plansza).
export const allowedOn = (item, stageId) => !stageId || !item.stages || item.stages.includes(stageId);

/**
 * Generator trasy: wzór z bieżącego progu (60%) albo niższego (40%), bez powtórzenia ostatnich dwóch;
 * co 4. wzór to oddech; tylko wzory dozwolone na bieżącej planszy. `intro` — wzory na początek (samouczek).
 */
export function createTrack({ random, patterns = PATTERNS, intro = [] }) {
  const recent = [];
  const queue = intro.map((id) => PATTERN_BY_ID[id] || patterns.find((item) => item.id === id)).filter(Boolean);
  let count = 0;
  return {
    choose(distance, stageId = null) {
      if (queue.length) return queue.shift();
      count += 1;
      const tier = tierAt(distance);
      const wantBreather = count % 4 === 0;
      const sameTier = random() < 0.6;
      const pool = patterns.filter((item) => {
        if (recent.includes(item.id) || !allowedOn(item, stageId)) return false;
        if (wantBreather) return item.tags.includes("breather");
        if (item.tags.includes("breather")) return false;
        return sameTier ? item.tier === tier : item.tier <= tier;
      });
      const fallback = patterns.filter(
        (item) => item.tier <= tier && !recent.includes(item.id) && allowedOn(item, stageId),
      );
      const list = pool.length ? pool : fallback.length ? fallback : patterns;
      const chosen = list[Math.floor(random() * list.length) % list.length];
      recent.push(chosen.id);
      if (recent.length > 2) recent.shift();
      return chosen;
    },
  };
}
