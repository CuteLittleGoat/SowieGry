// Sowie Tory — rozmieszczenie scenografii plansz (Analiza 2, rozdz. 3.2): dekoracje stoją projektowo poza
// korytarzem trzech torów (przy bokach) albo wysoko nad drogą, więc nigdy nie zasłaniają przeszkód. Położenia
// wynikają z numeru „slotu” (co `spacing` m) i funkcji skrótu — ta sama plansza wygląda zawsze tak samo.
import { ROAD_WIDTH } from "./projection.js";

const HALF = ROAD_WIDTH / 2;

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
  // Alejka sklepu: regały z produktami tworzą ściany, czasem piekarnia (lewa strona) i pracownik z paleciakiem
  // (prawa, przy krawędzi); wysoko nad alejką tablice „SUPER CENA!”.
  biedronka: {
    spacing: 3.2,
    ground: "#dfe4ea",
    side(slot, side) {
      const seed = slot * 2 + (side > 0 ? 1 : 0);
      if (side < 0 && slot % 23 === 7) return [{ kind: "piekarnia", x: side * (HALF + 1.2), seed }];
      const items = [{ kind: "regal", x: side * (HALF + 1.2), seed }];
      if (side > 0 && slot % 17 === 5) items.push({ kind: "pracownik", x: side * (HALF + 0.55), seed });
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
      const items = [{ kind: pick < 0.7 ? "stojakRoslin" : "wozekKwiatow", x: side * (HALF + 1.3), seed }];
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
