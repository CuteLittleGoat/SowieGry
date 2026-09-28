// Sowia Ucieczka — wzory (fragmenty trasy) zamiast czystej losowości (Analiza 2, rozdz. 2.6 i 3.1).
// Każdy wzór: przeszkody Pracu / Amic, liście (łuki uczą ruchu: łuk nad przeszkodą pokazuje skok),
// platformy (poziomy 1–3), dziury. Położenia w j. od początku wzoru; sowa wbiega od x = 0.
// Test jednostkowy sprawdza, że każdy wzór da się przejść bez trafienia przy najmniejszej i największej
// prędkości (tests/unit/ucieczka.test.mjs).
import { DIFFICULTIES, TIER_DISTANCE, TRACK } from "./config.js";

// ---------- Język wzorów ----------

const ob = (kind, x, { level = 0, vx = 0 } = {}) => ({ type: "obstacle", kind, x, level, vx });
const leaf = (x, height, kind = "zielony", level = 0) => ({ type: "leaf", kind, x, height, level });
// Łuk liści od x0 do x1, najwyżej `peak` j. nad podłożem (na końcach 0,7 j.).
const arc = (x0, x1, peak, count = 5, kind = "zielony", level = 0) =>
  Array.from({ length: count }, (_, index) => {
    const u = count === 1 ? 0.5 : index / (count - 1);
    const height = 0.7 + (peak - 0.7) * 4 * u * (1 - u);
    return leaf(
      x0 + (x1 - x0) * u,
      height,
      index === Math.floor(count / 2) && kind !== "zielony" ? kind : "zielony",
      level,
    );
  });
// Rząd liści na stałej wysokości.
const row = (x0, x1, height, count = 4, level = 0, kind = "zielony") =>
  Array.from({ length: count }, (_, index) =>
    leaf(x0 + ((x1 - x0) * index) / Math.max(1, count - 1), height, kind, level),
  );
const zigzag = (x0, x1, low, high, count = 6) =>
  Array.from({ length: count }, (_, index) => leaf(x0 + ((x1 - x0) * index) / (count - 1), index % 2 ? high : low));
const platform = (x, width, level) => ({ type: "platform", x, width, level });
const hole = (x, width) => ({ type: "hole", x, width });
const wall = (x) => [ob("karteczki-dol", x), ob("karteczki-gora", x)];
// Rój maili: szyk lecący szybciej niż świat (vx < 0). heights — wysokości kolejnych maili.
const swarm = (x, heights, { dx = 0.9, vx = -2 } = {}) =>
  heights.map((height, index) => ({ ...ob("mail", x + index * dx, { vx }), height }));

const pattern = (id, tier, length, tags, items) => ({ id, tier, length, tags, items: items.flat() });

// ---------- Wzory ----------

export const PATTERNS = Object.freeze([
  // Próg 0 — rozgrzewka: pojedyncze przeszkody, dużo miejsca, liście podpowiadają ruch.
  pattern("r0-telefon", 0, 14, ["pracu"], [ob("telefon", 8), arc(5.6, 10.4, 2.6)]),
  pattern("r0-teczka", 0, 14, ["pracu"], [ob("teczka", 8), arc(5.8, 10.2, 2.3)]),
  pattern("r0-dystrybutor", 0, 14, ["amic"], [ob("dystrybutor", 8), arc(5.6, 10.4, 2.7)]),
  pattern("r0-barierka", 0, 14, ["amic"], [ob("barierka", 8), arc(5.8, 10.2, 2.4)]),
  pattern("r0-dymek", 0, 14, ["pracu", "slide"], [ob("dymek", 8), row(6.8, 9.2, 0.35, 3)]),
  pattern("r0-znak", 0, 14, ["amic", "slide"], [ob("znak", 8), row(6.8, 9.2, 0.35, 3)]),
  pattern("r0-platforma", 0, 16, ["platform"], [platform(5, 7, 1), row(5.8, 11.2, 2.8, 5)]),
  pattern("r0-dziura", 0, 14, ["hole"], [hole(7, 2), arc(5.6, 10.4, 2.5)]),
  pattern("r0-oddech", 0, 12, ["breather"], [zigzag(2, 10, 0.6, 1.6, 6)]),
  pattern("r0-oddech-zloty", 0, 12, ["breather"], [arc(2, 9, 2.8, 5, "zloty")]),

  // Próg 1 — pary i pierwsze kombinacje; cysterna, wózek, maile, karteczki, platformy nad dziurą.
  pattern(
    "r1-dwa-telefony",
    1,
    18,
    ["pracu"],
    [ob("telefon", 6), ob("magda", 13), arc(3.8, 8.2, 2.6, 4), arc(10.8, 15.2, 2.6, 4)],
  ),
  pattern(
    "r1-dymek-telefon",
    1,
    18,
    ["pracu", "slide"],
    [ob("dymek", 6), ob("telefon", 13), row(5, 7, 0.35, 3), arc(10.8, 15.2, 2.6, 4)],
  ),
  pattern("r1-cysterna", 1, 18, ["amic"], [ob("cysterna", 9), arc(5.5, 12.5, 4.2, 7)]),
  pattern("r1-wozek", 1, 20, ["amic", "mover"], [ob("wozek", 14, { vx: -2.5 }), row(3, 7, 0.7, 4)]),
  pattern("r1-maile-nisko", 1, 20, ["pracu", "mover"], [swarm(14, [0.3, 0.55, 0.3])]),
  pattern("r1-karteczki", 1, 16, ["pracu"], [wall(9), row(8.4, 9.6, 2.35, 2)]),
  pattern("r1-schody", 1, 20, ["platform"], [platform(3, 6, 1), platform(10, 6, 2), row(10.6, 15.4, 4.8, 4)]),
  pattern("r1-most", 1, 18, ["platform", "hole"], [hole(6, 4.5), platform(5, 6.5, 1), row(5.6, 10.8, 2.8, 5)]),
  pattern(
    "r1-znak-dystrybutor",
    1,
    20,
    ["amic", "slide"],
    [ob("znak", 6), ob("dystrybutor", 14), row(5, 7, 0.35, 3), arc(11.6, 16.4, 2.7, 4)],
  ),
  pattern(
    "r1-budzik-teczka",
    1,
    18,
    ["pracu"],
    [ob("budzik", 6), ob("teczka", 13), arc(3.8, 8.2, 2.5, 4), arc(10.8, 15.2, 2.4, 4)],
  ),
  pattern("r1-oddech-luk", 1, 14, ["breather"], [arc(2, 12, 4.4, 7, "zloty")]),

  // Próg 2 — szybkie zmiany ruchu, trzy przeszkody, platformy na trzech poziomach.
  pattern(
    "r2-slalom",
    2,
    22,
    ["pracu", "hard"],
    [ob("telefon", 5), ob("dymek", 11), ob("telefon", 17), row(10, 12, 0.35, 3)],
  ),
  pattern(
    "r2-cysterna-znak",
    2,
    24,
    ["amic", "hard"],
    [ob("cysterna", 7), ob("znak", 17), arc(3.5, 10.5, 4.2, 6), row(16, 18, 0.35, 3)],
  ),
  pattern("r2-maile-wysoko", 2, 20, ["pracu", "mover", "slide"], [swarm(15, [0.7, 0.62, 0.7, 0.62], { dx: 0.8 })]),
  pattern(
    "r2-dymek-wozek",
    2,
    24,
    ["pracu", "amic", "mover", "hard"],
    [ob("dymek", 5), ob("wozek", 20, { vx: -2.5 }), row(4, 6, 0.35, 3)],
  ),
  pattern(
    "r2-wieza",
    2,
    24,
    ["platform", "hard"],
    [platform(3, 5, 1), platform(9, 5, 2), platform(15, 5, 3), ob("barierka", 11), row(15.6, 19.4, 6.8, 4, 0, "zloty")],
  ),
  pattern(
    "r2-karteczki-dwie",
    2,
    22,
    ["pracu", "hard"],
    [wall(6), wall(15), row(5.4, 6.6, 2.35, 2), row(14.4, 15.6, 2.35, 2)],
  ),
  pattern(
    "r2-tablica-dymek",
    2,
    20,
    ["pracu", "slide"],
    [ob("tablica", 6), ob("dymek", 14), arc(3.8, 8.2, 2.8, 4), row(13, 15, 0.35, 3)],
  ),
  pattern(
    "r2-dziury",
    2,
    20,
    ["hole", "hard"],
    [hole(5, 2.5), hole(12, 2.5), arc(3.8, 8.7, 2.6, 4), arc(10.8, 15.7, 2.6, 4)],
  ),
  pattern(
    "r2-dystrybutory",
    2,
    20,
    ["amic"],
    [ob("dystrybutor", 6), ob("dystrybutor", 13), arc(3.6, 8.4, 2.8, 4), arc(10.6, 15.4, 2.8, 4)],
  ),
  pattern("r2-oddech-tecza", 2, 14, ["breather"], [arc(2, 11, 3.2, 7, "teczowy")]),

  // Próg 3 — trudne: podwójne cysterny, łańcuchy ślizgów, rój z wózkiem, długa dziura z platformami.
  pattern(
    "r3-cysterny",
    3,
    26,
    ["amic", "hard"],
    [ob("cysterna", 6), ob("cysterna", 16), arc(2.5, 9.5, 4.2, 6), arc(12.5, 19.5, 4.2, 6)],
  ),
  pattern(
    "r3-dymki-znak",
    3,
    22,
    ["pracu", "amic", "slide", "hard"],
    [ob("dymek", 5), ob("znak", 10), ob("dymek", 15), row(4, 16, 0.35, 7)],
  ),
  pattern(
    "r3-maile-wozek",
    3,
    26,
    ["pracu", "amic", "mover", "hard"],
    [swarm(12, [0.3, 0.55, 0.3]), ob("wozek", 24, { vx: -2.5 })],
  ),
  pattern(
    "r3-przepasc",
    3,
    26,
    ["platform", "hole", "hard"],
    [hole(5, 13), platform(4, 6, 1), platform(11, 7, 2), row(11.6, 17.4, 4.8, 5, 0, "zloty")],
  ),
  pattern(
    "r3-miks",
    3,
    24,
    ["pracu", "amic", "hard"],
    [
      ob("telefon", 4),
      ob("dymek", 9),
      ob("dystrybutor", 14),
      ob("znak", 20),
      row(8, 10, 0.35, 3),
      row(19, 21, 0.35, 3),
    ],
  ),
  pattern(
    "r3-karteczki-znak",
    3,
    22,
    ["pracu", "amic", "hard"],
    [wall(6), ob("znak", 14), row(5.4, 6.6, 2.35, 2), row(13, 15, 0.35, 3)],
  ),
  pattern(
    "r3-oddech-platformy",
    3,
    18,
    ["breather", "platform"],
    [platform(3, 5, 1), platform(9, 5, 2), row(9.6, 13.4, 4.8, 4, 0, "zloty")],
  ),
]);

// Samouczek pierwszego uruchomienia (tutorial.js): te wzory idą pierwsze, w tej kolejności, przed generatorem.
// Każdy uczy jednego ruchu: skok (telefon), ślizg (dymek), podwójny skok (wysoka platforma z liśćmi — osiągalna
// tylko podwójnym skokiem przy każdej prędkości), szybowanie (szeroka dziura).
export const TUTORIAL_PATTERNS = Object.freeze([
  pattern("samouczek-skok", 0, 16, ["tutorial"], [ob("telefon", 10), arc(7.8, 12.2, 2.6)]),
  pattern("samouczek-slizg", 0, 16, ["tutorial", "slide"], [ob("dymek", 10), row(8.6, 11.4, 0.35, 4)]),
  pattern(
    "samouczek-podwojny",
    0,
    20,
    ["tutorial", "platform"],
    [platform(9, 9, 2), row(10, 17, 0.8, 5, 2), leaf(13.5, 1.8, "zloty", 2)],
  ),
  pattern("samouczek-szybowanie", 0, 22, ["tutorial", "hole"], [hole(9, 6), arc(8.4, 15.6, 2.8, 7)]),
]);

export const PATTERN_BY_ID = Object.freeze(Object.fromEntries(PATTERNS.map((item) => [item.id, item])));

// Najwyższy próg dostępny na tym dystansie (progi mnożone przez tierScale poziomu trudności).
export function tierAt(distance, difficulty = "arcade") {
  const scale = DIFFICULTIES[difficulty]?.tierScale ?? 1;
  let tier = 0;
  TIER_DISTANCE.forEach((start, index) => {
    if (distance >= start * scale) tier = index;
  });
  return tier;
}

/**
 * Generator trasy: wybiera kolejne wzory. Wagi: bieżący próg ×3, niższe ×1 (rozgrzewka tylko na początku);
 * bez powtórzeń ostatnich `recent` wzorów; po wzorze „hard” — oddech; pierwszy wzór to zawsze oddech.
 */
export function createTrack({ difficulty = "arcade", random = Math.random, patterns = PATTERNS, intro = [] } = {}) {
  const recent = [];
  let needBreather = true;
  // Wzory wstępne (np. samouczek) — najpierw one, po kolei; potem oddech i zwykłe losowanie.
  const queue = [...intro];

  function choose(distance) {
    if (queue.length) {
      const next = queue.shift();
      needBreather = true;
      return next;
    }
    const tier = tierAt(distance, difficulty);
    let pool = patterns.filter((item) => item.tier <= tier && (tier === 0 || item.tier > 0 || distance < 120));
    const breathers = pool.filter((item) => item.tags.includes("breather"));
    if (needBreather && breathers.length) pool = breathers;
    else pool = pool.filter((item) => !item.tags.includes("breather") || item.tier === tier);
    const fresh = pool.filter((item) => !recent.includes(item.id));
    if (fresh.length) pool = fresh;
    const weights = pool.map((item) => (item.tier === tier ? 3 : 1));
    let pick = random() * weights.reduce((sum, value) => sum + value, 0);
    let chosen = pool[pool.length - 1];
    for (let index = 0; index < pool.length; index += 1) {
      pick -= weights[index];
      if (pick < 0) {
        chosen = pool[index];
        break;
      }
    }
    recent.push(chosen.id);
    if (recent.length > TRACK.recent) recent.shift();
    needBreather = chosen.tags.includes("hard");
    return chosen;
  }

  return {
    choose,
    recent: () => [...recent],
    // Po bonusie (np. „Rejs na humbaku”) następny wzór to oddech.
    rest() {
      needBreather = true;
    },
  };
}

// Odstęp między wzorami rośnie z prędkością (więcej miejsca na reakcję), mniejszy w Chaos.
export function gapAfter(speed, difficulty = "arcade") {
  return Math.max(TRACK.gapMin, speed * TRACK.gapSeconds) * (DIFFICULTIES[difficulty]?.gap ?? 1);
}
