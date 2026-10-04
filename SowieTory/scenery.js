// Sowie Tory — rozmieszczenie scenografii plansz (Analiza 2, rozdz. 3.2): dekoracje stoją projektowo poza
// korytarzem trzech torów (przy bokach) albo wysoko nad drogą, więc nigdy nie zasłaniają przeszkód. Położenia
// wynikają z numeru „slotu” (co `spacing` m) i funkcji skrótu — ta sama plansza wygląda zawsze tak samo.
import { ROAD_WIDTH } from "./projection.js";

const HALF = ROAD_WIDTH / 2;

// Środek dekoracji szerokości `width` m przy krawędzi drogi (wewnętrzny brzeg `gap` m od drogi).
const beside = (side, width, gap = 0.4) => side * (HALF + gap + width / 2);

// Biedronka (uwaga właściciela T4 — „nie powtarzały się ciągle dwa te same regały”): alejka w strefach jak w
// sklepie w formacie 3.0/4.0 — co 6 slotów (ok. 19 m) inna strefa po obu stronach.
export const SHOP_ZONES = Object.freeze([
  { left: "warzywniak", right: "warzywniak" },
  { left: "regal", right: "regal" },
  { left: "lodowka", right: "lodowka" },
  { left: "piekarnia", right: "regal" },
  { left: "promocja", right: "regal" },
  { left: "kwiaty", right: "warzywniak" },
  { left: "regal", right: "lodowka" },
  { left: "kasa", right: "kasa" },
]);
const ZONE_SLOTS = 6;
const WIDTHS = { regal: 1.6, piekarnia: 1.6, warzywniak: 1.6, lodowka: 1.6, kwiaty: 1.2, promocja: 1.6, kasa: 1.6 };

export function hash(value) {
  const x = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Plan scenografii planszy: co `spacing` m po obu stronach `side(slot, strona)` zwraca listę dekoracji
 * `{ kind, x, seed }` (x — środek w bok, w metrach); `overhead` — elementy nad drogą co `every` m
 * (`{ kind, height, width }`); `ground` — kolor poboczy.
 */
export const SCENERY = Object.freeze({
  // Alejka sklepu w strefach (`SHOP_ZONES`): owoce i warzywa pod daszkiem, regały, oszklone lodówki, piekarnia,
  // promocje na paletach, kwiaty, kasy; przy krawędzi czasem koszyki (lewa) i pracownik z paleciakiem (prawa);
  // wysoko nad alejką tablice „SUPER CENA!”.
  biedronka: {
    spacing: 3.2,
    ground: "#dfe4ea",
    side(slot, side) {
      const seed = slot * 2 + (side > 0 ? 1 : 0);
      const zone = SHOP_ZONES[Math.floor(slot / ZONE_SLOTS) % SHOP_ZONES.length];
      const kind = side < 0 ? zone.left : zone.right;
      const items = [{ kind, x: beside(side, WIDTHS[kind]), seed }];
      if (side < 0 && slot % 11 === 3) items.push({ kind: "koszyki", x: beside(side, 0.6, 0.05), seed });
      if (side > 0 && slot % 17 === 5) items.push({ kind: "pracownik", x: beside(side, 1.4, 0), seed });
      return items;
    },
    overhead: { kind: "baner", every: 64, height: 3.4, width: ROAD_WIDTH + 1.4 },
  },
  // Hala festiwalu: stojaki z roślinami, wózki z kwiatami, zwiedzający przy bokach, zraszacze przy krawędzi,
  // girlandy z balonami nad drogą.
  festiwal: {
    spacing: 3.6,
    ground: "#cfe8c8",
    side(slot, side) {
      const seed = slot * 2 + (side > 0 ? 1 : 0);
      const pick = hash(seed);
      // Stojaki z roślinami, wózki z kwiatami, namioty z sadzonkami (T4) i pęki balonów.
      const kind = pick < 0.45 ? "stojakRoslin" : pick < 0.7 ? "wozekKwiatow" : pick < 0.88 ? "namiot" : "balony";
      const items = [{ kind, x: kind === "namiot" ? beside(side, 1.8) : side * (HALF + 1.3), seed }];
      if (hash(seed + 9) < 0.3) items.push({ kind: "zwiedzajacy", x: side * (HALF + 0.45), seed });
      if (slot % 7 === 3) items.push({ kind: "zraszacz", x: side * (HALF + 0.3), seed });
      return items;
    },
    overhead: { kind: "girlanda", every: 48, height: 3.6, width: ROAD_WIDTH + 1 },
  },
  // Blokowisko z wielkiej płyty: bloki w tle po obu stronach, trzepak i ławka po lewej, słupki przy krawędzi.
  prl: {
    spacing: 3.5,
    ground: "#b9c79e",
    side(slot, side) {
      const seed = slot * 2 + (side > 0 ? 1 : 0);
      const items = [];
      if (slot % 2 === 0) items.push({ kind: "blok", x: side * (HALF + 4.2), seed });
      if (side < 0 && slot % 9 === 4)
        items.push({ kind: slot % 18 === 4 ? "trzepak" : "lawka", x: -(HALF + 1.6), seed });
      // Kiosk, piaskownica (lewa) i maluch przy krawężniku (prawa) — T4.
      else if (side < 0 && slot % 13 === 8) items.push({ kind: "piaskownica", x: beside(side, 1.5), seed });
      if (side > 0 && slot % 11 === 6) items.push({ kind: "kiosk", x: beside(side, 1.7), seed });
      else if (side > 0 && slot % 7 === 2) items.push({ kind: "maluch", x: beside(side, 1.3), seed });
      if (slot % 3 === 1) items.push({ kind: "slupek", x: side * (HALF + 0.45), seed });
      return items;
    },
    overhead: { kind: "napisPrl", every: 400, height: 3.4, width: 3.2 },
  },
  // Stacja Amic: sklep stacji i pylon z cenami w tle, zaparkowane auta i donice przy bokach, zadaszenie nad podjazdem.
  amic: {
    spacing: 4,
    ground: "#b8c2ca",
    side(slot, side) {
      const seed = slot * 2 + (side > 0 ? 1 : 0);
      const items = [];
      if (side > 0 && slot % 10 === 2) items.push({ kind: "sklepAmic", x: HALF + 3.2, seed });
      else if (side < 0 && slot % 12 === 6) items.push({ kind: "pylon", x: -(HALF + 2.2), seed });
      // Myjnia, klatka z butlami gazu i stanowisko powietrza (T4).
      else if (side < 0 && slot % 9 === 2) items.push({ kind: "myjnia", x: beside(side, 1.8), seed });
      else if (side > 0 && slot % 8 === 5) items.push({ kind: "butle", x: beside(side, 1.2), seed });
      else if (side < 0 && slot % 7 === 4) items.push({ kind: "powietrze", x: beside(side, 0.6), seed });
      else if (hash(seed + 3) < 0.35) items.push({ kind: "auto", x: side * (HALF + 1.6), seed });
      if (slot % 4 === 0) items.push({ kind: "donica", x: side * (HALF + 0.5), seed });
      return items;
    },
    overhead: { kind: "zadaszenie", every: 56, height: 3.8, width: ROAD_WIDTH + 2 },
  },
});

// Dekoracje planszy widoczne między głębokościami `near` i `far` (m przed sową) przy dystansie `distance`.
// Zwraca listę `{ kind, x, z, seed }` (plus `overhead: true` dla elementów nad drogą).
export function sceneryBetween(stageId, distance, near, far) {
  const plan = SCENERY[stageId];
  if (!plan) return [];
  const list = [];
  const first = Math.floor((distance + near) / plan.spacing);
  const last = Math.ceil((distance + far) / plan.spacing);
  for (let slot = Math.max(0, first); slot <= last; slot += 1) {
    const z = slot * plan.spacing - distance;
    if (z < near || z > far) continue;
    for (const side of [-1, 1]) {
      for (const item of plan.side(slot, side)) list.push({ ...item, z });
    }
  }
  const { every } = plan.overhead;
  for (let index = Math.max(1, Math.floor((distance + near) / every)); index * every <= distance + far; index += 1) {
    const z = index * every - distance;
    if (z >= near) list.push({ ...plan.overhead, x: 0, z, seed: index, overhead: true });
  }
  return list;
}
