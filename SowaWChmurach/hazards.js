// Sowa w Chmurach — przeszkody Pracu Pracu i Amic (czysta logika). Zasada z Analizy 2 (rozdz. 3.3): Pracu da się
// zdeptać (sowa spada na niego z góry: +punkty i wybicie), Amic trzeba ominąć (każdy dotyk to trafienie).
// Ruch każdej przeszkody jest funkcją czasu (`hazardPose`) — gra i autopilot w testach liczą położenie w dowolnej
// chwili. Rozmieszczenie: planista przy każdej parze kolejnych platform ścieżki (stałe przeszkody nigdy nie stoją
// w korytarzu między nimi), kanistry — co kilka sekund ze znacznikiem u góry ekranu.
import { APEX, DIFFICULTIES, HAZARDS, OWL, PLATFORM_TYPES, WORLD } from "./config.js";
import { apexOf, wrapDelta } from "./physics.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Odbicia od krawędzi kolumny: położenie w przedziale [min, max] przy ruchu jednostajnym (fala trójkątna).
export function bounceBetween(start, speed, time, min, max) {
  const span = max - min;
  if (span <= 0) return min;
  const travelled = (((start - min + speed * time) % (2 * span)) + 2 * span) % (2 * span);
  return min + (travelled <= span ? travelled : 2 * span - travelled);
}

/**
 * Przeszkoda: { kind, family ("pracu" | "amic"), x0, y0 (środek na starcie), speed, born (czas pojawienia się
 * w ruchu; null — czeka, aż wejdzie w widok), offset (rój maili: przesunięcie w formacji), gone }.
 */
export function createHazard(kind, x, y, extra = {}) {
  const info = HAZARDS.kinds[kind];
  if (!info) throw new Error(`Nieznana przeszkoda: ${kind}`);
  return {
    kind,
    family: info.family,
    x0: x,
    y0: y,
    speed: 0,
    born: 0,
    phase: 0,
    gone: false,
    ...extra,
  };
}

// Położenie środka przeszkody w chwili `time` (sekundy gry).
export function hazardPose(hazard, time, out = { x: 0, y: 0 }) {
  const info = HAZARDS.kinds[hazard.kind];
  const t = hazard.born === null ? 0 : Math.max(0, time - hazard.born);
  if (hazard.kind === "dymek") {
    out.x = bounceBetween(hazard.x0, hazard.speed, t, info.halfW, WORLD.width - info.halfW);
    out.y = hazard.y0 + Math.sin(time * 2 + hazard.phase) * 0.15;
  } else if (hazard.kind === "mail" || hazard.kind === "sterowiec") {
    out.x = hazard.x0 + hazard.speed * t;
    out.y = hazard.y0 + (hazard.kind === "sterowiec" ? Math.sin(time * 1.2 + hazard.phase) * 0.2 : 0);
  } else if (hazard.kind === "kanister") {
    out.x = hazard.x0;
    out.y = hazard.y0 - HAZARDS.canister.fall * t;
  } else {
    out.x = hazard.x0;
    out.y = hazard.y0;
  }
  return out;
}

// Pole sowy do trafień: koło o promieniu `hitRadius` wokół punktu `center` m nad stopami.
function circleHitsBox(cx, cy, radius, hx, hy, halfW, halfH) {
  const dx = Math.max(Math.abs(wrapDelta(hx, cx)) - halfW, 0);
  const dy = Math.max(Math.abs(cy - hy) - halfH, 0);
  return dx * dx + dy * dy < radius * radius;
}

/**
 * Kontakt sowy z przeszkodą w chwili `time`: "stomp" (Pracu: sowa opada, a jej stopy w tym kroku zeszły do wierzchu
 * przeszkody — krok wcześniej były najwyżej `stompDepth` m pod nim; w bok w zasięgu stóp), "hit" (pole sowy
 * dotyka przeszkody) albo null. `previousY` — wysokość stóp krok wcześniej.
 */
export function contact(owl, previousY, hazard, time, pose = hazardPose(hazard, time)) {
  if (hazard.gone || hazard.born === null) return null;
  const info = HAZARDS.kinds[hazard.kind];
  const top = pose.y + info.halfH;
  const reach = Math.abs(wrapDelta(pose.x, owl.x)) <= info.halfW + OWL.foot;
  if (info.stompable && owl.vy <= 0 && reach && previousY >= top - HAZARDS.stompDepth && owl.y <= top) return "stomp";
  const cy = owl.y + HAZARDS.owlCenter;
  return circleHitsBox(owl.x, cy, HAZARDS.owlRadius, pose.x, pose.y, info.halfW, info.halfH) ? "hit" : null;
}

// Zakres w bok (bez przechodzenia przez krawędź) korytarza między dwiema platformami ścieżki.
export function corridor(lower, upper, margin = HAZARDS.corridorMargin) {
  return [Math.min(lower.baseX, upper.baseX) - margin, Math.max(lower.baseX, upper.baseX) + margin];
}

// Szansa na przeszkodę danego rodzaju na wysokości `height` (rośnie od `from` przez 300 m).
export function hazardChance(kind, height, difficulty) {
  const info = HAZARDS.kinds[kind];
  if (!info.chance || height < info.from) return 0;
  return info.chance * DIFFICULTIES[difficulty].hard * Math.min(1, (height - info.from) / 300 + 0.3);
}

/**
 * Planista przeszkód (osobny generator losowy — trasa platform się nie zmienia): `plan(dolna, górna, przeszkody)`
 * dla każdej pary kolejnych platform ścieżki. Najwyżej jedna przeszkoda na parę i nie częściej niż co
 * `spacing` m poziomu (`HAZARDS.spacing`).
 */
export function createHazardPlanner({ random, difficulty = "arcade" }) {
  const pick = (min, max) => min + (max - min) * random();
  let lastY = -Infinity;
  let previous = null;
  // Ostatnie platformy ścieżki (najstarsza pierwsza) — do sprawdzania zasięgu skoków przy tablicy cen.
  const history = [];
  const spacing = HAZARDS.spacing[difficulty];

  // Tablica cen wisi w odstępie pod `lower` (między `previous` a `lower`), z dala od korytarzy wszystkich skoków,
  // które sięgają jej wysokości (ostatnie platformy ścieżki i `upper`; liść Monstery wybija wyżej) — stoi na
  // drodze tylko temu, kto zboczy.
  function tryTablica(previous, lower, upper, list) {
    if (!previous) return false;
    const info = HAZARDS.kinds.tablica;
    const y = (previous.y + lower.y) / 2 + 0.3;
    const reach = (item) =>
      item.y + apexOf(OWL.jumpVelocity * PLATFORM_TYPES[item.type].bounce) + HAZARDS.owlCenter + HAZARDS.owlRadius;
    // Kolejne pary ścieżki (historia → `lower` → `upper`), których dolna platforma sięga skokiem do tablicy.
    const chain = [...history, upper];
    let left = Infinity;
    let right = -Infinity;
    for (let index = 0; index < chain.length - 1; index += 1) {
      const item = chain[index];
      if (item.y > y + info.halfH + 0.5 || reach(item) < y - info.halfH) continue;
      const [from, to] = corridor(item, chain[index + 1], HAZARDS.corridorMargin + info.halfW);
      left = Math.min(left, from);
      right = Math.max(right, to);
    }
    if (left === Infinity) return false;
    const min = info.halfW + 0.1;
    const max = WORLD.width - info.halfW - 0.1;
    const room = [];
    if (left > min) room.push([min, left]);
    if (right < max) room.push([right, max]);
    if (!room.length) return false;
    const [from, to] = room[Math.floor(random() * room.length)];
    list.push(createHazard("tablica", pick(from, to), y));
    return true;
  }

  // Telefon stoi na krawędzi gałązki `lower` — tylko gdy sowa przylatuje (z `previous`) i odlatuje (do `upper`)
  // po tej samej stronie; telefon jest wtedy po przeciwnej stronie i nie zagradza drogi.
  function tryTelefon(previous, lower, upper, list) {
    if (!previous || lower.type !== "galazka") return false;
    const from = Math.sign(previous.baseX - lower.baseX);
    const to = Math.sign(upper.baseX - lower.baseX);
    if (!from || from !== to) return false;
    const info = HAZARDS.kinds.telefon;
    const x = lower.baseX - from * (PLATFORM_TYPES.galazka.width / 2 - info.halfW / 2);
    list.push(createHazard("telefon", x, lower.y + info.halfH, { phase: random() * Math.PI * 2 }));
    return true;
  }

  return {
    plan(lower, upper, list) {
      const before = previous;
      previous = lower;
      history.push(lower);
      if (history.length > 10) history.shift();
      if (upper.y - lastY < spacing) return;
      const height = upper.y;
      const roll = random();
      let edge = 0;
      for (const kind of HAZARDS.order) {
        edge += hazardChance(kind, height, difficulty);
        if (roll >= edge) continue;
        let placed = false;
        if (kind === "tablica") placed = tryTablica(before, lower, upper, list);
        else if (kind === "telefon") placed = tryTelefon(before, lower, upper, list);
        else if (kind === "dymek") {
          const info = HAZARDS.kinds.dymek;
          const y = clamp(pick(lower.y + 1.6, upper.y + 2.4), lower.y + 1.6, lower.y + APEX + 1.5);
          list.push(
            createHazard("dymek", pick(info.halfW, WORLD.width - info.halfW), y, {
              speed: pick(...info.speedRange) * (random() < 0.5 ? -1 : 1),
              phase: random() * Math.PI * 2,
            }),
          );
          placed = true;
        } else {
          // Rój maili i sterowiec: wlatują z boku, gdy wejdą w widok (born = null do tej chwili).
          const info = HAZARDS.kinds[kind];
          const fromLeft = random() < 0.5;
          const speed = pick(...info.speedRange) * (fromLeft ? 1 : -1);
          const startX = fromLeft ? -info.halfW - 0.5 : WORLD.width + info.halfW + 0.5;
          const y = upper.y + pick(1.2, 2.2);
          if (kind === "mail") {
            for (const [dx, dy] of HAZARDS.swarm) {
              list.push(createHazard("mail", startX - Math.sign(speed) * dx, y + dy, { speed, born: null }));
            }
          } else {
            list.push(createHazard("sterowiec", startX, y, { speed, born: null, phase: random() * Math.PI * 2 }));
          }
          placed = true;
        }
        if (placed) lastY = upper.y;
        return;
      }
    },
  };
}

// Kanister: następny po losowo 7–11 s (Chaos częściej), celuje blisko sowy; znacznik u góry ekranu 1 s wcześniej.
export function nextCanisterDelay(random, difficulty) {
  const [min, max] = HAZARDS.canister.every;
  return (min + (max - min) * random()) / DIFFICULTIES[difficulty].hard;
}

export function canisterX(owlX, random) {
  const half = HAZARDS.kinds.kanister.halfW + 0.2;
  return clamp(owlX + (random() * 2 - 1) * HAZARDS.canister.aim, half, WORLD.width - half);
}
