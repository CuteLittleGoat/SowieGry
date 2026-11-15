// Sowie Ogrody — rysunki roślin w ogrodzie (uwaga O10, 2026-11-15: „rośliny od monstery do drzewka złotych liści
// miały swoje własne tekstury tak jak pozostałe i aby się nie powtarzały”). Każdy gatunek ma własny kształt
// (`plant.shape` w config.js) i żaden kształt się nie powtarza. Do uwagi O10 jedenaście pierwszych roślin rysował
// render.js jednakowo (liście-elipsy w kolorze gatunku), a kształty roślin rozdziałów 7–14 były w decor.js — część
// z nich wspólna (palma i daktylowiec, bambus i lawenda, sakura, klon i ostrokrzew, grzybienie i wiktoria).
//
// `createPlantShapes(context)[shape](roślina, x, top, skala, etap, czas)` rysuje koronę rośliny nad doniczką (doniczkę
// rysuje render.js): `x` — środek doniczki, `top` — jej górna krawędź (piksele CSS), `skala` — `plantScale` z shelf.js,
// `etap` 1–5 (kamienie milowe: roślina większa i bujniejsza, przybywa kwiatów i owoców), `czas` w s (kołysanie,
// migotanie, mruganie). Kolory z rośliny: `color` — główny, `accent` — drugi (kwiat, owoce, pień, żyłki).

const TAU = Math.PI * 2;

// Kolor `#rrggbb` → [r, g, b] (zapamiętane — kolory roślin powtarzają się w każdej klatce).
const CHANNELS = new Map();
function channels(hex) {
  let value = CHANNELS.get(hex);
  if (!value) {
    const number = Number.parseInt(hex.slice(1, 7), 16);
    value = [(number >> 16) & 255, (number >> 8) & 255, number & 255];
    CHANNELS.set(hex, value);
  }
  return value;
}

// Kontur liścia monstery (jednostka: długość liścia; nasada przy ogonku w (0, 0), czubek w (0, −1)): serce z dwoma
// płatami poniżej nasady i wcięciami od brzegu w stronę nerwu — prostopadle do nerwu, lekko w dół, jak w prawdziwym
// liściu. `slits` — wysokości wcięć (0 — nasada, 1 — czubek), po obu stronach. Liczony raz, przy wczytaniu modułu.
function monsteraOutline(slits) {
  const half = (v) => 0.5 * Math.sqrt(Math.max(0, 1 - ((v - 0.42) / 0.58) ** 2));
  const gap = 0.03;
  const right = [];
  for (let index = 0; index <= 24; index += 1) {
    const v = 1 - (index / 24) * 1.13;
    if (!slits.some((slit) => Math.abs(v - slit) < gap * 1.5)) right.push([v, half(v), -v]);
  }
  for (const slit of slits) {
    right.push([slit + gap, half(slit + gap), -(slit + gap)]);
    right.push([slit, half(slit) * 0.3, -(slit - 0.08)]);
    right.push([slit - gap, half(slit - gap), -(slit - gap)]);
  }
  // Wierzchołek wcięcia (środkowy punkt) ma `v` równe wysokości wcięcia — przy sortowaniu stoi między brzegami.
  right.sort((a, b) => b[0] - a[0]);
  const side = right.map(([, x, y]) => [x, y]);
  return [...side, [0, -0.03], ...side.map(([x, y]) => [-x, y]).reverse()];
}

const MONSTERA_YOUNG = Object.freeze(monsteraOutline([0.36, 0.62]));
const MONSTERA_OLD = Object.freeze(monsteraOutline([0.24, 0.45, 0.66]));

// Kolory tęczy (Tęczowy tulipan) i czerni jagód.
const RAINBOW = Object.freeze(["#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c", "#4dabf7", "#9775fa"]);

export function createPlantShapes(context) {
  const shades = new Map();

  // Odcień koloru: `amount` > 0 — jaśniejszy (w stronę bieli), < 0 — ciemniejszy (w stronę czerni); zapamiętany.
  function shade(hex, amount) {
    const key = `${hex}|${amount}`;
    let value = shades.get(key);
    if (!value) {
      const target = amount > 0 ? 255 : 0;
      const [r, g, b] = channels(hex).map((part) => Math.round(part + (target - part) * Math.abs(amount)));
      value = `rgb(${r}, ${g}, ${b})`;
      shades.set(key, value);
    }
    return value;
  }
  const rgba = (hex, alpha) => `rgba(${channels(hex).join(", ")}, ${Math.max(0, Math.min(1, alpha))})`;

  // Kołysanie (rad) i mrugnięcie (co ok. 4,2 s, przez 0,15 s; `offset` — przesunięcie w czasie).
  const sway = (time, x, index = 0) => Math.sin(time * 1.6 + index + x) * 0.05;
  const blinking = (time, offset = 0) => (((time + offset) % 4.2) + 4.2) % 4.2 < 0.15;

  // Punkt w układzie obróconym o `angle` (0 — w górę, dodatni — w prawo) i przeskalowanym o `size`.
  const turn = (x, y, angle, size) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return (lx, ly) => [x + (lx * cos - ly * sin) * size, y + (lx * sin + ly * cos) * size];
  };

  // ---------- Ścieżki (wiele kształtów w jednym wypełnieniu) ----------

  function begin(color) {
    context.fillStyle = color;
    context.beginPath();
  }
  function ellipsePath(x, y, rx, ry, angle = 0) {
    const safeX = Math.max(0.5, rx);
    context.moveTo(x + Math.cos(angle) * safeX, y + Math.sin(angle) * safeX);
    context.ellipse(x, y, safeX, Math.max(0.5, ry), angle, 0, TAU);
  }
  const circlePath = (x, y, radius) => ellipsePath(x, y, radius, radius);
  function ellipse(x, y, rx, ry, angle = 0) {
    context.beginPath();
    ellipsePath(x, y, rx, ry, angle);
    context.fill();
  }
  const circle = (x, y, radius) => ellipse(x, y, radius, radius);
  // Liść od nasady (x, y) w kierunku `angle`: długość `length`, szerokość `width`.
  function leafPath(x, y, length, width, angle) {
    const dx = Math.sin(angle);
    const dy = -Math.cos(angle);
    const mx = x + dx * length * 0.45;
    const my = y + dy * length * 0.45;
    const nx = Math.cos(angle) * width;
    const ny = Math.sin(angle) * width;
    context.moveTo(x, y);
    context.quadraticCurveTo(mx + nx, my + ny, x + dx * length, y + dy * length);
    context.quadraticCurveTo(mx - nx, my - ny, x, y);
  }
  function polygonPath(points) {
    context.moveTo(points[0][0], points[0][1]);
    for (let index = 1; index < points.length; index += 1) context.lineTo(points[index][0], points[index][1]);
    context.closePath();
  }
  // Kontur (tablica punktów w jednostkach) w miejscu (x, y), obrócony i przeskalowany.
  function outlinePath(points, x, y, size, angle) {
    const at = turn(x, y, angle, size);
    polygonPath(points.map(([lx, ly]) => at(lx, ly)));
  }
  // Gwiazdka o `points` ramionach (promień zewnętrzny `radius`, wewnętrzny `radius` × `inner`).
  function starPath(x, y, radius, points = 5, inner = 0.45, rotation = -Math.PI / 2) {
    const corners = [];
    for (let index = 0; index < points * 2; index += 1) {
      const angle = rotation + (index * Math.PI) / points;
      const r = index % 2 ? radius * inner : radius;
      corners.push([x + Math.cos(angle) * r, y + Math.sin(angle) * r]);
    }
    polygonPath(corners);
  }

  // ---------- Linie ----------

  function stroke(color, width) {
    context.strokeStyle = color;
    context.lineWidth = Math.max(0.6, width);
    context.lineCap = "round";
    context.lineJoin = "round";
  }
  function line(x0, y0, x1, y1, color, width) {
    stroke(color, width);
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
  }
  function curve(x0, y0, cx, cy, x1, y1, color, width) {
    stroke(color, width);
    context.beginPath();
    context.moveTo(x0, y0);
    context.quadraticCurveTo(cx, cy, x1, y1);
    context.stroke();
  }
  // Punkt i kierunek (kąt: 0 — w górę) na krzywej kwadratowej (p0, p1, p2) dla t 0–1.
  function onCurve(p0, p1, p2, t) {
    const u = 1 - t;
    const x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
    const y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
    const dx = 2 * u * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
    const dy = 2 * u * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
    return { x, y, angle: Math.atan2(dx, -dy) };
  }

  // Poświata: gradient radialny (kolor → przezroczystość) o promieniu 1 wokół (0, 0), tworzony raz na kolor;
  // rysowany po przesunięciu i przeskalowaniu (gradient podąża za przekształceniem), siła przez `globalAlpha`.
  const halos = new Map();
  function halo(x, y, radius, color, alpha) {
    let gradient = halos.get(color);
    if (!gradient) {
      gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1);
      gradient.addColorStop(0, rgba(color, 1));
      gradient.addColorStop(1, rgba(color, 0));
      halos.set(color, gradient);
    }
    context.save();
    context.translate(x, y);
    context.scale(Math.max(1, radius), Math.max(1, radius));
    context.globalAlpha = Math.max(0, Math.min(1, alpha));
    context.fillStyle = gradient;
    circle(0, 0, 1);
    context.restore();
  }
  // Iskierka (czteroramienna gwiazdka) migocząca w czasie.
  function sparkle(x, y, radius, color, time, offset = 0) {
    const twinkle = 0.5 + 0.5 * Math.sin(time * 3 + offset);
    context.globalAlpha = 0.3 + 0.7 * twinkle;
    context.fillStyle = color;
    context.beginPath();
    starPath(x, y, radius * (0.6 + 0.4 * twinkle), 4, 0.28, 0);
    context.fill();
    context.globalAlpha = 1;
  }
  // Oko (biała gałka, źrenica patrzy w bok `look` −1…1); w mrugnięciu — kreska.
  function eye(x, y, radius, look, closed, iris = null) {
    if (closed) {
      line(x - radius, y, x + radius, y, "#3b2f4a", Math.max(0.8, radius * 0.4));
      return;
    }
    context.fillStyle = "#ffffff";
    circle(x, y, radius);
    if (iris) {
      context.fillStyle = iris;
      circle(x + look * radius * 0.25, y, radius * 0.7);
    }
    context.fillStyle = "#2b2233";
    circle(x + look * radius * 0.3, y, radius * 0.45);
    context.fillStyle = "#ffffff";
    circle(x + look * radius * 0.3 - radius * 0.15, y - radius * 0.18, radius * 0.15);
  }
  // Rozmieszczenie „po złotym kącie” — i-ty punkt z n w elipsie (rx, ry): równomiernie, bez losowania.
  function spiralPoint(index, count, rx, ry) {
    const radius = Math.sqrt((index + 0.5) / count);
    const angle = index * 2.39996;
    return [Math.cos(angle) * radius * rx, Math.sin(angle) * radius * ry];
  }

  // Liście monstery na ogonkach: wachlarz `count` liści (wspólny dla Monstery i Mutanta monstery).
  function monsteraLeaves(x, top, s, stage, time, count, size) {
    const leaves = [];
    for (let index = 0; index < count; index += 1) {
      const spread = count > 1 ? index / (count - 1) - 0.5 : 0;
      const angle = spread * 2.3 + sway(time, x, index);
      const reach = (9 + stage * 3.2) * s * (0.75 + 0.25 * ((index * 7) % 3) * 0.5);
      leaves.push({
        bx: x + Math.sin(angle) * reach,
        by: top - Math.cos(angle) * reach,
        tilt: angle * 1.25,
        size: size * (0.85 + 0.15 * ((index * 5) % 3)),
      });
    }
    // Tylne liście (wyżej) najpierw, przednie (niżej, z boków) na wierzchu.
    return leaves.sort((a, b) => a.by - b.by);
  }

  // Liść strzałkowaty alokazji (nasada — wcięcie między płatami, w (x, y); czubek w kierunku `angle`).
  function arrowLeafPath(x, y, size, angle) {
    const at = turn(x, y, angle, size);
    const go = (control, end) => context.quadraticCurveTo(...at(...control), ...at(...end));
    context.moveTo(...at(0, -1));
    go([0.34, -0.72], [0.42, -0.36]);
    go([0.5, 0.06], [0.3, 0.3]);
    go([0.14, 0.24], [0, 0.04]);
    go([-0.14, 0.24], [-0.3, 0.3]);
    go([-0.5, 0.06], [-0.42, -0.36]);
    go([-0.34, -0.72], [0, -1]);
    context.closePath();
  }

  // Dzwonek (kwiat) zwisający z punktu (x, y): szerokość `width`, długość `length`, falbanka na brzegu; `angle` —
  // odchylenie od pionu w dół (0 — zwisa prosto, dodatni — w prawo).
  function bellPath(x, y, width, length, angle = 0) {
    const at = turn(x, y, angle + Math.PI, 1);
    const go = (control, end) => context.quadraticCurveTo(...at(...control), ...at(...end));
    context.moveTo(...at(-width * 0.28, 0));
    go([-width * 0.34, -length * 0.7], [-width * 0.5, -length]);
    go([-width * 0.25, -length * 0.88], [0, -length]);
    go([width * 0.25, -length * 0.88], [width * 0.5, -length]);
    go([width * 0.34, -length * 0.7], [width * 0.28, 0]);
    context.closePath();
  }
  // Pióro / płatek na łuku: od nasady (x, y) w kierunku `angle`, wygięty o `bend` (rad).
  function featherPath(x, y, length, width, angle, bend) {
    const at = turn(x, y, angle, length);
    context.moveTo(x, y);
    context.quadraticCurveTo(...at(width + bend * 0.5, -0.5), ...at(bend, -1));
    context.quadraticCurveTo(...at(-width + bend * 0.5, -0.5), x, y);
  }
  // Jagoda: zielony kielich-gwiazdka, czarna (albo w kolorze `color`) kulka i biały połysk.
  function berry(x, y, radius, color, calyx = "#4f8a3c") {
    context.fillStyle = calyx;
    context.beginPath();
    starPath(x, y - radius * 0.7, radius * 1.1, 5, 0.4);
    context.fill();
    context.fillStyle = color;
    circle(x, y, radius);
    context.fillStyle = "rgba(255, 255, 255, 0.85)";
    circle(x - radius * 0.35, y - radius * 0.35, radius * 0.28);
  }

  return {
    // ---------- Rozdziały 1–6 (uwaga O10: każda z 11 roślin z własnym kształtem) ----------

    // Monstera: liście-serca z wcięciami po bokach na długich ogonkach; od 3. etapu dorosłe liście (4 wcięcia na
    // stronę), od 4. — korzenie powietrzne.
    monstera(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const leaves = monsteraLeaves(x, top, s, stage, time, Math.min(6, 2 + stage), (10 + stage * 2.2) * s);
      stroke(accent, 1.4 * s);
      context.beginPath();
      for (const leaf of leaves) {
        context.moveTo(x, top);
        context.quadraticCurveTo(x + (leaf.bx - x) * 0.2, leaf.by + (top - leaf.by) * 0.25, leaf.bx, leaf.by);
      }
      context.stroke();
      const outline = stage >= 3 ? MONSTERA_OLD : MONSTERA_YOUNG;
      for (const leaf of leaves) {
        begin(color);
        outlinePath(outline, leaf.bx, leaf.by, leaf.size, leaf.tilt);
        context.fill();
        const at = turn(leaf.bx, leaf.by, leaf.tilt, leaf.size);
        stroke(accent, 0.9 * s);
        context.beginPath();
        context.moveTo(...at(0, -0.02));
        context.lineTo(...at(0, -0.94));
        context.stroke();
      }
      if (stage >= 4) {
        for (const side of stage >= 5 ? [-1, 1] : [1]) {
          curve(
            x + side * 2 * s,
            top - (9 + stage * 2) * s,
            x + side * 9 * s,
            top - 4 * s,
            x + side * 7 * s,
            top + 2 * s,
            "#7a5a3a",
            1.1 * s,
          );
        }
      }
    },

    // Pilea („monetkowa”): okrągłe liście-monetki na cienkich ogonkach z jasną kropką pośrodku; od 3. etapu przy
    // doniczce małe sadzonki.
    coins(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const count = 3 + stage * 2;
      const stemTop = top - (3 + stage * 1.8) * s;
      const leaves = [];
      for (let index = 0; index < count; index += 1) {
        const spread = index / (count - 1) - 0.5;
        const angle = spread * 2.7 + sway(time, x, index) * 1.5;
        const reach = (6 + stage * 3) * s * (0.7 + 0.3 * (((index * 5) % 4) / 3));
        leaves.push({
          x: x + Math.sin(angle) * reach,
          y: stemTop - Math.cos(angle) * reach * 0.9,
          r: (3 + stage * 0.45) * s * (0.85 + 0.15 * ((index * 3) % 2)),
        });
      }
      line(x, top, x, stemTop, accent, 1.6 * s);
      stroke(accent, 0.8 * s);
      context.beginPath();
      for (const leaf of leaves) {
        context.moveTo(x, stemTop);
        context.quadraticCurveTo((x + leaf.x) / 2, Math.min(stemTop, leaf.y) - 2 * s, leaf.x, leaf.y);
      }
      context.stroke();
      if (stage >= 3) {
        for (const side of [-1, 1]) {
          const px = x + side * 10 * s;
          for (let index = 0; index < 3; index += 1) {
            const angle = (index - 1) * 0.8;
            leaves.push({ x: px + Math.sin(angle) * 3 * s, y: top - 1 * s - Math.cos(angle) * 3 * s, r: 1.8 * s });
          }
        }
      }
      begin(shade(color, -0.22));
      for (const leaf of leaves) circlePath(leaf.x, leaf.y, leaf.r);
      context.fill();
      begin(color);
      for (const leaf of leaves) circlePath(leaf.x - leaf.r * 0.08, leaf.y - leaf.r * 0.1, leaf.r * 0.84);
      context.fill();
      begin(shade(color, 0.5));
      for (const leaf of leaves) circlePath(leaf.x, leaf.y, Math.max(0.5, leaf.r * 0.16));
      context.fill();
    },

    // Paproć: łukowate, opadające liście z drobnymi listkami po obu stronach; przy 5. etapie zwinięty pastorał.
    fern(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const fronds = 4 + stage;
      const length = (15 + stage * 4.2) * s;
      const pinnae = 8 + stage;
      // Od bocznych (opadających) do środkowych — środkowe liście na wierzchu.
      const order = [...Array(fronds).keys()].sort(
        (a, b) => Math.abs(b - (fronds - 1) / 2) - Math.abs(a - (fronds - 1) / 2),
      );
      for (const index of order) {
        const spread = index / (fronds - 1) - 0.5;
        const side = Math.abs(spread) * 2;
        const lean = sway(time, x, index) * length;
        const len = length * (0.8 + 0.2 * (1 - side));
        const p0 = [x, top];
        const p1 = [x + spread * len * 0.7 + lean * 0.3, top - len * (1 - 0.3 * side)];
        const p2 = [x + spread * len * 2.1 + lean, top - len * (0.95 - 1.05 * side)];
        curve(...p0, ...p1, ...p2, accent, 1 * s);
        begin(index % 2 ? color : shade(color, 0.14));
        for (let pinna = 1; pinna <= pinnae; pinna += 1) {
          const t = pinna / (pinnae + 1);
          const point = onCurve(p0, p1, p2, 0.1 + t * 0.9);
          const size = (1 - t * 0.6) * (3 + stage * 0.4) * s;
          leafPath(point.x, point.y, size, size * 0.6, point.angle - 1.25);
          leafPath(point.x, point.y, size, size * 0.6, point.angle + 1.25);
        }
        context.fill();
      }
      if (stage >= 5) {
        const cx = x + 1.5 * s;
        const cy = top - 9 * s;
        stroke(accent, 1.2 * s);
        context.beginPath();
        context.moveTo(x, top);
        context.quadraticCurveTo(x - 1 * s, top - 6 * s, cx, cy - 1 * s);
        context.arc(cx, cy, 2.2 * s, -Math.PI / 2, Math.PI * 1.2);
        context.stroke();
      }
    },

    // Alokazja („słoniowe ucho”): duże strzałkowate, ciemne liście z jasnymi żyłkami na długich ogonkach.
    arrow(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const count = 1 + Math.min(4, stage);
      const size = (10 + stage * 2.4) * s;
      const leaves = [];
      for (let index = 0; index < count; index += 1) {
        const spread = count > 1 ? index / (count - 1) - 0.5 : 0.1;
        const angle = spread * 1.5 + sway(time, x, index);
        const reach = (11 + stage * 2.8) * s * (1 - 0.18 * Math.abs(spread) * 2) * (0.9 + 0.1 * (index % 2));
        leaves.push({ bx: x + Math.sin(angle) * reach, by: top - Math.cos(angle) * reach, tilt: angle * 1.35 });
      }
      leaves.sort((a, b) => a.by - b.by);
      stroke(shade(color, -0.25), 1.4 * s);
      context.beginPath();
      for (const leaf of leaves) {
        context.moveTo(x, top);
        context.quadraticCurveTo(x + (leaf.bx - x) * 0.25, (top + leaf.by) / 2, leaf.bx, leaf.by);
      }
      context.stroke();
      for (const leaf of leaves) {
        begin(color);
        arrowLeafPath(leaf.bx, leaf.by, size, leaf.tilt);
        context.fill();
        // Jasne żyłki: nerw główny, po dwie boczne na stronę i żyłki płatów.
        const at = turn(leaf.bx, leaf.by, leaf.tilt, size);
        stroke(accent, 0.55 * s);
        context.beginPath();
        context.moveTo(...at(0, 0.02));
        context.lineTo(...at(0, -0.9));
        for (const [from, to] of [
          [-0.28, [0.36, -0.46]],
          [-0.55, [0.26, -0.72]],
          [0, [0.26, 0.24]],
        ]) {
          for (const side of [-1, 1]) {
            context.moveTo(...at(0, from));
            context.lineTo(...at(to[0] * side, to[1]));
          }
        }
        context.stroke();
      }
    },

    // Kaktus: kolumna z żebrami i kolcami, od 2. etapu ramiona (do trzech), od 4. różowe kwiaty na czubkach.
    cactus(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const width = (6 + stage * 0.9) * s;
      const height = (12 + stage * 5) * s;
      const tops = [[x, top - height]];
      const arms = [
        [1, 0.42, 0.85, 0.38],
        [-1, 0.58, 0.75, 0.3],
        [1, 0.74, 0.6, 0.2],
      ].slice(0, Math.max(0, Math.min(3, stage - 1)));
      for (const [side, at, out, up] of arms) {
        const y = top - height * at;
        const ex = x + side * (width * 0.5 + out * width);
        stroke(shade(color, -0.08), width * 0.66);
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(ex, y);
        context.lineTo(ex, y - up * height);
        context.stroke();
        tops.push([ex, y - up * height]);
      }
      line(x, top - width * 0.3, x, top - height, color, width);
      line(
        x - width * 0.22,
        top - width * 0.4,
        x - width * 0.22,
        top - height + width * 0.1,
        shade(color, -0.15),
        width * 0.3,
      );
      stroke(shade(color, -0.28), Math.max(0.6, 0.5 * s));
      context.beginPath();
      for (const offset of [-0.18, 0.12]) {
        context.moveTo(x + width * offset, top - width * 0.5);
        context.lineTo(x + width * offset, top - height + width * 0.2);
      }
      context.stroke();
      begin(shade(color, 0.65));
      for (let y = top - width * 0.6; y > top - height; y -= 3.4 * s) {
        for (const offset of [-0.36, -0.03, 0.3]) circlePath(x + width * offset, y, Math.max(0.5, 0.35 * s));
      }
      context.fill();
      if (stage >= 4) {
        for (const [fx, fy] of tops.slice(0, stage >= 5 ? 3 : 1)) {
          begin(accent);
          for (let petal = 0; petal < 6; petal += 1) {
            const angle = -Math.PI / 2 + (petal - 2.5) * 0.45;
            ellipsePath(
              fx + Math.cos(angle) * 1.6 * s,
              fy - 1 * s + Math.sin(angle) * 1.6 * s,
              1.5 * s,
              0.8 * s,
              angle,
            );
          }
          context.fill();
          context.fillStyle = "#ffe27a";
          circle(fx, fy - 1 * s, 0.8 * s);
        }
      }
    },

    // Słonecznik: wysoka łodyga z liśćmi-sercami i koszyczek — żółte płatki wokół brązowego środka z pestkami;
    // od 3. etapu dwa kwiaty, przy 5. trzy.
    sunflower(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const green = "#5a9a3a";
      const heads = [
        { dx: 0, height: (18 + stage * 6) * s, radius: (4.4 + stage * 0.9) * s },
        { dx: -10 * s, height: (13 + stage * 4) * s, radius: (3.2 + stage * 0.6) * s },
        { dx: 10 * s, height: (10 + stage * 3.5) * s, radius: (3 + stage * 0.5) * s },
      ].slice(0, stage >= 5 ? 3 : stage >= 3 ? 2 : 1);
      for (const [index, head] of [...heads.entries()].reverse()) {
        const lean = sway(time, x, index) * 8 * s;
        const hx = x + head.dx + lean;
        const hy = top - head.height;
        curve(x + head.dx * 0.2, top, x + head.dx * 0.7, top - head.height * 0.5, hx, hy, green, 1.7 * s);
        begin(green);
        for (const [share, side] of [
          [0.3, -1],
          [0.55, 1],
        ]) {
          const ly = top - head.height * share;
          const lx = x + head.dx * (0.2 + share * 0.6) + lean * share;
          leafPath(lx, ly, (5 + stage * 0.9) * s, (4.4 + stage * 0.5) * s, side * 1.15);
        }
        context.fill();
        const r = head.radius;
        const petals = 12 + Math.min(10, stage * 2);
        for (const [layer, petalColor] of [
          [0.5, shade(color, -0.12)],
          [0, color],
        ]) {
          begin(petalColor);
          for (let petal = 0; petal < petals; petal += 1) {
            const angle = ((petal + layer) / petals) * TAU;
            ellipsePath(hx + Math.cos(angle) * r * 1.15, hy + Math.sin(angle) * r * 1.15, r * 0.62, r * 0.24, angle);
          }
          context.fill();
        }
        context.fillStyle = accent;
        circle(hx, hy, r * 0.82);
        begin(shade(accent, 0.28));
        for (let seed = 0; seed < 10; seed += 1) {
          const [sx, sy] = spiralPoint(seed, 10, r * 0.62, r * 0.62);
          circlePath(hx + sx, hy + sy, Math.max(0.5, r * 0.09));
        }
        context.fill();
      }
    },

    // Storczyk: szerokie liście przy ziemi, łukowaty pęd przy patyczku i kwiaty jak ćmy (dwa okrągłe płatki,
    // trzy działki, ciemna warżka); im wyższy etap, tym więcej kwiatów.
    orchid(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const leaves = 2 + Math.floor(stage / 2);
      begin(accent);
      for (let index = 0; index < leaves; index += 1) {
        const side = index % 2 ? 1 : -1;
        const angle = side * (1.2 - 0.22 * Math.floor(index / 2));
        leafPath(x, top - 0.5 * s, (9 + stage * 1.8) * s, (7 + stage * 0.6) * s, angle);
      }
      context.fill();
      context.fillStyle = shade(accent, 0.3);
      for (const side of [-1, 1]) {
        ellipse(x + side * (4.5 + stage * 0.7) * s, top - 2.6 * s, 2.4 * s, 0.6 * s, side * 0.3);
      }
      const height = (18 + stage * 4.5) * s;
      line(x - 2 * s, top, x - 2 * s, top - height * 0.9, "#c8a46a", 0.9 * s);
      const lean = sway(time, x) * 10 * s;
      const p0 = [x - 1.5 * s, top - 1 * s];
      const p1 = [x - 1 * s, top - height * 1.25];
      const p2 = [x + (12 + stage * 3.4) * s + lean, top - height * 0.55];
      curve(...p0, ...p1, ...p2, "#6b7a3a", 1 * s);
      const flowers = Math.min(5, stage + 1);
      const r = (2.3 + stage * 0.25) * s;
      // Kwiaty na końcowej części łuku, od najwyższego; ostatni najmniejszy.
      for (let index = 0; index < flowers; index += 1) {
        const point = onCurve(p0, p1, p2, 0.42 + (index / Math.max(1, flowers - 1)) * 0.5 * (flowers > 1 ? 1 : 0));
        const size = r * (1 - index * 0.06);
        const fx = point.x;
        const fy = point.y + size * 1.1;
        begin(shade(color, 0.3));
        ellipsePath(fx, fy - size * 0.95, size * 0.42, size * 0.75);
        ellipsePath(fx - size * 0.68, fy + size * 0.72, size * 0.36, size * 0.7, 0.75);
        ellipsePath(fx + size * 0.68, fy + size * 0.72, size * 0.36, size * 0.7, -0.75);
        context.fill();
        begin(color);
        circlePath(fx - size * 0.72, fy, size * 0.72);
        circlePath(fx + size * 0.72, fy, size * 0.72);
        context.fill();
        context.fillStyle = shade(color, -0.35);
        ellipse(fx, fy + size * 0.42, size * 0.34, size * 0.44);
        context.fillStyle = "#ffe27a";
        circle(fx, fy + size * 0.02, size * 0.2);
      }
      if (stage < 5) {
        context.fillStyle = shade(color, 0.4);
        const end = onCurve(p0, p1, p2, 1);
        ellipse(end.x + 1.2 * s, end.y + 1.2 * s, 1.1 * s, 1.4 * s);
      }
    },

    // Lotos: wysoko nad wodą liście-miseczki na łodygach i kwiat ze spiczastymi płatkami; od 3. etapu pąk, przy 5.
    // owocostan (zielona „konewka” z nasionami).
    lotus(item, x, top, s, stage, time) {
      const { color, accent } = item;
      context.fillStyle = "rgba(92, 200, 232, 0.85)";
      ellipse(x, top - 0.6 * s, 12 * s, 2.6 * s);
      const pads = 1 + Math.min(2, Math.floor(stage / 2));
      for (let index = 0; index < pads; index += 1) {
        const side = index % 2 ? 1 : -1;
        const px = x + side * (6 + index * 2.5) * s + sway(time, x, index) * 10 * s;
        const py = top - (7 + stage * 2.4 - index * 1.5) * s;
        curve(x + side * 2 * s, top - 0.5 * s, x + side * 4 * s, (top + py) / 2, px, py, shade(accent, -0.2), 0.9 * s);
        const r = (4.4 + stage * 0.9) * s;
        context.fillStyle = shade(accent, -0.18);
        ellipse(px, py, r, r * 0.34);
        context.fillStyle = accent;
        ellipse(px, py - r * 0.1, r * 0.9, r * 0.24);
        context.fillStyle = shade(accent, 0.3);
        circle(px, py - r * 0.1, Math.max(0.6, r * 0.08));
      }
      const height = (15 + stage * 4) * s;
      const fx = x + sway(time, x, 3) * 8 * s;
      const fy = top - height;
      curve(x, top - 0.5 * s, x - 1 * s, top - height / 2, fx, fy, shade(accent, -0.2), 1 * s);
      const petal = (5 + stage * 0.9) * s;
      begin(shade(color, -0.1));
      for (const angle of [-1.05, -0.55, 0.55, 1.05]) leafPath(fx, fy, petal, petal * 0.62, angle);
      context.fill();
      begin(color);
      for (const angle of [-0.3, 0, 0.3]) leafPath(fx, fy, petal * 1.08, petal * 0.6, angle);
      context.fill();
      begin(shade(color, 0.45));
      for (const angle of [-0.3, 0, 0.3]) leafPath(fx, fy - petal * 0.35, petal * 0.7, petal * 0.25, angle);
      context.fill();
      if (stage >= 3) {
        const bx = x - (5 + stage) * s;
        const by = top - height * 0.72;
        curve(x - 1 * s, top - 0.5 * s, bx, top - height * 0.4, bx, by, shade(accent, -0.2), 0.9 * s);
        begin(shade(color, -0.05));
        leafPath(bx, by + 1 * s, petal * 0.95, petal * 0.55, 0);
        context.fill();
      }
      if (stage >= 5) {
        const sx = x + 8 * s;
        const sy = top - height * 0.62;
        curve(x + 1 * s, top - 0.5 * s, sx, top - height * 0.35, sx, sy, shade(accent, -0.2), 0.9 * s);
        context.fillStyle = "#b8c95a";
        context.beginPath();
        polygonPath([
          [sx - 2.8 * s, sy - 3.2 * s],
          [sx + 2.8 * s, sy - 3.2 * s],
          [sx + 1.4 * s, sy],
          [sx - 1.4 * s, sy],
        ]);
        context.fill();
        begin("#6b7a3a");
        for (const dx of [-1.6, 0, 1.6]) circlePath(sx + dx * s, sy - 2.6 * s, 0.5 * s);
        context.fill();
      }
    },

    // Bonsai: poskręcany pień w kształcie litery S, poziome gałęzie i płaskie „chmurki” igieł; mech przy pniu.
    bonsai(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const height = (11 + stage * 3.6) * s;
      const width = (2.4 + stage * 0.7) * s;
      const bend = sway(time, x) * 4 * s;
      const mid = [x + 4 * s, top - height * 0.5];
      const crown = [x - 2 * s + bend, top - height];
      curve(x, top, x - 7 * s, top - height * 0.25, ...mid, accent, width);
      curve(...mid, x + 8 * s, top - height * 0.8, ...crown, accent, width * 0.75);
      curve(
        x - 1 * s,
        top - 1 * s,
        x - 6 * s,
        top - height * 0.27,
        mid[0] - 1 * s,
        mid[1],
        shade(accent, 0.25),
        width * 0.25,
      );
      const pads = [[crown[0], crown[1] - 2 * s, 1]];
      const branches = [
        [mid[0], mid[1], 1, 0.9],
        [x + 2 * s, top - height * 0.78, -1, 0.85],
        [x - 3 * s, top - height * 0.32, -1, 0.7],
      ].slice(0, 1 + Math.floor(stage / 2));
      for (const [bx, by, side, size] of branches) {
        const ex = bx + side * (7 + stage * 1.4) * s;
        const ey = by - 3 * s;
        curve(bx, by, bx + side * 4 * s, by + 1 * s, ex, ey, accent, width * 0.42);
        pads.push([ex, ey - 1 * s, size]);
      }
      context.fillStyle = shade(color, 0.32);
      ellipse(x - 1 * s, top - 0.4 * s, 5 * s, 1.4 * s);
      for (const [layer, padColor, lift] of [
        [1.05, shade(color, -0.28), -1.2],
        [1, color, 0],
        [0.55, shade(color, 0.22), 1],
      ]) {
        begin(padColor);
        for (const [px, py, size] of pads) {
          const rx = (5.5 + stage * 1.2) * s * size * layer;
          const ry = rx * 0.42;
          ellipsePath(px, py - lift * s, rx, ry);
          ellipsePath(px - rx * 0.55, py + ry * 0.2 - lift * s, rx * 0.55, ry * 0.8);
          ellipsePath(px + rx * 0.55, py + ry * 0.25 - lift * s, rx * 0.5, ry * 0.75);
        }
        context.fill();
      }
    },

    // Mutant monstery: monstera z liśćmi w dwóch kolorach (pół zielone, pół kremowe), wijące się wąsy ze świecącymi
    // kulkami, od 4. etapu oko na liściu (mruga i rozgląda się), przy 5. — dwa oczy.
    mutant(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const cream = "#f4f0c8";
      const tendrils = 1 + Math.floor(stage / 2);
      for (let index = 0; index < tendrils; index += 1) {
        const side = index % 2 ? 1 : -1;
        const height = (14 + stage * 4 - index * 3) * s;
        stroke("#8a5cc2", 1.3 * s);
        context.beginPath();
        context.moveTo(x, top);
        let tipX = x;
        let tipY = top;
        for (let step = 1; step <= 10; step += 1) {
          const t = step / 10;
          tipX = x + side * (3 + index * 3) * s * t + Math.sin(time * 2.2 + t * 7 + index) * 2.6 * s * t;
          tipY = top - height * t;
          context.lineTo(tipX, tipY);
        }
        context.stroke();
        const pulse = 0.5 + 0.5 * Math.sin(time * 3 + index * 2);
        halo(tipX, tipY, (4 + pulse * 2) * s, accent, 0.55);
        context.fillStyle = accent;
        circle(tipX, tipY, (1.5 + stage * 0.15) * s);
      }
      const leaves = monsteraLeaves(x, top, s, stage, time, 2 + stage, (9.5 + stage * 2.2) * s);
      stroke(shade(color, -0.3), 1.3 * s);
      context.beginPath();
      for (const leaf of leaves) {
        context.moveTo(x, top);
        context.quadraticCurveTo(x + (leaf.bx - x) * 0.2, leaf.by + (top - leaf.by) * 0.25, leaf.bx, leaf.by);
      }
      context.stroke();
      for (const [index, leaf] of leaves.entries()) {
        begin(color);
        outlinePath(MONSTERA_OLD, leaf.bx, leaf.by, leaf.size, leaf.tilt);
        context.fill();
        // Połowa liścia kremowa (przycięcie do konturu): co drugi liść z drugiej strony nerwu.
        const at = turn(leaf.bx, leaf.by, leaf.tilt, leaf.size);
        const side = index % 2 ? 1 : -1;
        context.save();
        context.beginPath();
        outlinePath(MONSTERA_OLD, leaf.bx, leaf.by, leaf.size, leaf.tilt);
        context.clip();
        context.fillStyle = cream;
        context.beginPath();
        polygonPath([at(0, 0.2), at(0, -1.2), at(side * 0.8, -1.2), at(side * 0.8, 0.2)]);
        context.fill();
        context.restore();
        stroke(shade(color, -0.25), 0.8 * s);
        context.beginPath();
        context.moveTo(...at(0, -0.02));
        context.lineTo(...at(0, -0.94));
        context.stroke();
      }
      if (stage >= 4) {
        const leaf = leaves[0];
        const at = turn(leaf.bx, leaf.by, leaf.tilt, leaf.size);
        const look = Math.sin(time * 0.7);
        const eyes = stage >= 5 ? [-0.17, 0.17] : [0];
        for (const [index, offset] of eyes.entries()) {
          const [ex, ey] = at(offset, -0.62);
          eye(ex, ey, (1.9 + stage * 0.2) * s, look, blinking(time, index * 0.08 + x * 0.01), "#9be15d");
        }
      }
    },

    // Drzewko złotych liści: pień z rozwidleniem, okrągła korona z drobnych złotych liści w trzech odcieniach,
    // migoczące iskierki i spadające złote listki.
    goldTree(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const height = (11 + stage * 3.4) * s;
      const crownY = top - height - (5 + stage) * s;
      const rx = (8 + stage * 2) * s;
      const ry = (6.5 + stage * 1.3) * s;
      context.fillStyle = accent;
      context.beginPath();
      polygonPath([
        [x - 3.4 * s, top],
        [x - 1.2 * s, top - 2.5 * s],
        [x - 1 * s, top - height],
        [x + 1 * s, top - height],
        [x + 1.2 * s, top - 2.5 * s],
        [x + 3.4 * s, top],
      ]);
      context.fill();
      for (const side of [-1, 1]) {
        curve(
          x,
          top - height * 0.7,
          x + side * 3 * s,
          top - height,
          x + side * rx * 0.45,
          crownY + ry * 0.2,
          accent,
          1.4 * s,
        );
      }
      // Pełna korona: ciemniejsze tło z kilku elips, na nim drobne listki w trzech odcieniach.
      begin(shade(color, -0.18));
      ellipsePath(x, crownY + 1 * s, rx * 0.95, ry * 0.9);
      ellipsePath(x - rx * 0.45, crownY + ry * 0.25, rx * 0.55, ry * 0.6);
      ellipsePath(x + rx * 0.45, crownY + ry * 0.2, rx * 0.55, ry * 0.6);
      context.fill();
      const count = 22 + stage * 8;
      const tones = [shade(color, -0.12), color, shade(color, 0.35)];
      for (const [tone, toneColor] of tones.entries()) {
        begin(toneColor);
        for (let index = tone; index < count; index += 3) {
          const [lx, ly] = spiralPoint(index, count, rx, ry);
          const angle = index * 1.7 + sway(time, x, index) * 3;
          leafPath(x + lx, crownY + ly + 2 * s, (3.6 + stage * 0.45) * s, 2.6 * s, angle);
        }
        context.fill();
      }
      for (let index = 0; index < 2 + stage; index += 1) {
        const [px, py] = spiralPoint(index * 3 + 1, (2 + stage) * 3, rx * 0.9, ry * 0.9);
        sparkle(x + px, crownY + py, (1.6 + stage * 0.2) * s, "#fff6c2", time, index * 1.7);
      }
      // Spadające listki: od dołu korony do doniczki, w kółko.
      const falling = 1 + Math.floor(stage / 2);
      const start = crownY + ry * 0.6;
      const range = Math.max(1, top - start);
      begin(shade(color, 0.15));
      for (let index = 0; index < falling; index += 1) {
        const fall = (time * 9 * s + index * range * 0.45) % range;
        const fx = x + (index - (falling - 1) / 2) * rx * 0.7 + Math.sin(time * 1.4 + index * 2) * 3 * s;
        leafPath(fx, start + fall, 2.6 * s, 1.8 * s, time * 2 + index);
      }
      context.fill();
    },

    // ---------- Rozdziały 7–14 (uwaga O2; od uwagi O10 bez wspólnych kształtów) ----------

    // Palma: pochylony pień z łuskami, łukowate liście-pióra; od 3. etapu kokosy pod koroną.
    palm(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const height = (18 + stage * 5) * s;
      const lean = 3 * s + sway(time, x) * 6 * s;
      context.fillStyle = accent;
      const rings = 4 + stage;
      for (let ring = 0; ring < rings; ring += 1) {
        const t = ring / rings;
        ellipse(x + lean * t * t, top - 2 * s - t * height, 3.2 * s * (1 - t * 0.2), 2 * s);
      }
      const cx = x + lean;
      const cy = top - height;
      if (stage >= 3) {
        begin("#6b4423");
        for (let nut = 0; nut < stage - 2; nut += 1)
          circlePath(cx + (nut - (stage - 3) / 2) * 3 * s, cy + 2.2 * s, 1.9 * s);
        context.fill();
      }
      context.fillStyle = color;
      const fronds = 4 + stage;
      for (let index = 0; index < fronds; index += 1) {
        const angle = -Math.PI / 2 + (index - (fronds - 1) / 2) * 0.55 + sway(time, x, index);
        context.save();
        context.translate(cx, cy);
        context.rotate(angle + Math.PI / 2);
        ellipse(0, -(9 + stage * 2) * s, 3.2 * s, (9 + stage * 2) * s);
        context.restore();
      }
    },

    // Strelicja („rajski ptak”): sztywne liście i pomarańczowo-niebieski kwiat jak głowa ptaka.
    bird(item, x, top, s, stage, time) {
      const { color, accent } = item;
      context.fillStyle = color;
      const leaves = 2 + stage;
      for (let index = 0; index < leaves; index += 1) {
        const angle = (index - (leaves - 1) / 2) * 0.35 + sway(time, x, index);
        context.save();
        context.translate(x, top);
        context.rotate(angle);
        ellipse(0, -(10 + stage * 3) * s, 3 * s, (10 + stage * 3) * s);
        context.restore();
      }
      const flowers = stage >= 3 ? 2 : 1;
      for (let index = 0; index < flowers; index += 1) {
        const fx = x + (index ? 7 : -3) * s;
        const fy = top - (22 + stage * 4 - index * 5) * s;
        context.fillStyle = "#4d6fd6";
        ellipse(fx, fy, 6 * s, 1.6 * s, -0.2);
        context.fillStyle = accent;
        for (const [dx, dy, angle] of [
          [-2, -4, -0.9],
          [1, -5, -0.4],
          [4, -4, 0.1],
        ]) {
          ellipse(fx + dx * s, fy + dy * s, 1.4 * s, 4 * s, angle);
        }
      }
    },

    // Bambus: zielone łodygi z ciemniejszymi kolankami i pióropusze wąskich liści przy górnych kolankach.
    bamboo(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const canes = 2 + stage;
      const width = (2 + stage * 0.2) * s;
      for (let index = 0; index < canes; index += 1) {
        const offset = (index - (canes - 1) / 2) * 3.6 * s;
        const height = (16 + stage * 5 + ((index * 7) % 3) * 3) * s;
        const lean = sway(time, x, index) * height * 0.6;
        const bx = x + offset;
        const tx = bx + lean;
        const ty = top - height;
        line(bx, top, tx, ty, color, width);
        line(bx - width * 0.25, top, tx - width * 0.25, ty, shade(color, 0.3), width * 0.25);
        const knots = 3 + Math.floor(stage / 2);
        stroke(accent, width * 0.45);
        context.beginPath();
        for (let knot = 1; knot <= knots; knot += 1) {
          const t = knot / (knots + 1);
          const kx = bx + lean * t;
          const ky = top - height * t;
          context.moveTo(kx - width * 0.62, ky);
          context.lineTo(kx + width * 0.62, ky);
        }
        context.stroke();
        begin(shade(accent, -0.08));
        for (let spray = 0; spray < 2; spray += 1) {
          const t = 1 - spray * 0.3;
          const kx = bx + lean * t;
          const ky = top - height * t;
          const side = (index + spray) % 2 ? 1 : -1;
          for (const angle of [1.1, 1.5, 1.95]) {
            leafPath(kx, ky, (5.5 + stage) * s, 1.7 * s, side * angle + sway(time, x, index + spray) * 2);
          }
        }
        context.fill();
      }
    },

    // Dzbanecznik: liście i zwisające dzbanki z daszkiem.
    pitcher(item, x, top, s, stage, time) {
      const { color, accent } = item;
      context.fillStyle = color;
      for (let index = 0; index < 2 + stage; index += 1) {
        const angle = (index - (1 + stage) / 2) * 0.6 + sway(time, x, index);
        context.save();
        context.translate(x, top);
        context.rotate(angle);
        ellipse(0, -(8 + stage * 2) * s, 2.6 * s, (8 + stage * 2) * s);
        context.restore();
      }
      const cups = Math.min(4, 1 + Math.floor(stage / 2) + 1);
      for (let index = 0; index < cups; index += 1) {
        const cx = x + (index - (cups - 1) / 2) * 7 * s;
        const cy = top - (8 + (index % 2) * 6 + stage * 2) * s;
        context.fillStyle = accent;
        ellipse(cx, cy, 2.6 * s, 4.2 * s);
        context.fillStyle = "#7cc35a";
        ellipse(cx, cy - 4.5 * s, 2.8 * s, 1.1 * s);
      }
    },

    // Wiśnia sakura: ciemny, rozłożysty pień z gałęziami, obłoki różowych kwiatów i spadające płatki.
    blossom(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const bark = shade(accent, -0.25);
      const height = (9 + stage * 2.6) * s;
      const fork = [x + sway(time, x) * 4 * s, top - height];
      curve(x, top, x - 2 * s, top - height * 0.5, ...fork, bark, (2.2 + stage * 0.3) * s);
      const spread = (9 + stage * 2.4) * s;
      const tips = [];
      const branches = 2 + Math.min(3, Math.floor((stage + 1) / 2));
      for (let index = 0; index < branches; index += 1) {
        const share = branches > 1 ? index / (branches - 1) - 0.5 : 0;
        const tx = fork[0] + share * spread * 2;
        const ty = fork[1] - (5 + stage * 1.6) * s * (1 - Math.abs(share) * 0.7);
        curve(...fork, fork[0] + share * spread, fork[1] - 2 * s, tx, ty, bark, (1.2 + stage * 0.12) * s);
        tips.push([tx, ty], [(fork[0] + tx) / 2 + share * 2 * s, (fork[1] + ty) / 2 - 2 * s]);
      }
      const clusters = tips.length;
      const radius = (3.2 + stage * 0.55) * s;
      for (const [layer, petalColor] of [
        [1, shade(color, -0.15)],
        [0.78, color],
        [0.45, shade(color, 0.45)],
      ]) {
        begin(petalColor);
        for (let index = 0; index < clusters; index += 1) {
          const [cx, cy] = tips[index];
          for (let bloom = 0; bloom < 4; bloom += 1) {
            const [bx, by] = spiralPoint(bloom, 4, radius * 0.9, radius * 0.6);
            circlePath(cx + bx, cy + by - (1 - layer) * 1.5 * s, radius * 0.62 * layer);
          }
        }
        context.fill();
      }
      begin(color);
      const falling = 1 + Math.floor(stage / 2);
      const start = fork[1] - 2 * s;
      const range = Math.max(1, top - start);
      for (let index = 0; index < falling; index += 1) {
        const fall = (time * 8 * s + index * range * 0.5) % range;
        const px = x + (index - (falling - 1) / 2) * spread * 0.8 + Math.sin(time * 1.3 + index) * 4 * s;
        ellipsePath(px, start + fall, 1.2 * s, 0.7 * s, time * 2 + index);
      }
      context.fill();
    },

    // Klon japoński: smukłe, rozwidlone pnie i warstwy czerwonych liści-gwiazdek (pięć klap).
    maple(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const height = (10 + stage * 3) * s;
      const tiers = 1 + Math.min(3, Math.ceil(stage / 2));
      const trunkTop = [x + sway(time, x) * 5 * s, top - height];
      curve(x, top, x + 3 * s, top - height * 0.5, ...trunkTop, accent, (1.8 + stage * 0.25) * s);
      curve(
        x,
        top - height * 0.35,
        x - 4 * s,
        top - height * 0.6,
        x - (5 + stage) * s,
        top - height * 0.85,
        accent,
        (1 + stage * 0.15) * s,
      );
      const leaf = (2.3 + stage * 0.3) * s;
      for (let tier = 0; tier < tiers; tier += 1) {
        const ty = top - height * (0.55 + tier * 0.32) - tier * 3 * s;
        const width = (9 + stage * 2.4) * s * (1 - tier * 0.18);
        const tx = x + (tier % 2 ? -3 : 3) * s + sway(time, x, tier) * 6 * s;
        const count = 7 + stage * 2;
        for (const [tone, toneColor] of [shade(color, -0.22), color, shade(color, 0.22)].entries()) {
          begin(toneColor);
          for (let index = tone; index < count; index += 3) {
            const [lx, ly] = spiralPoint(index, count, width, width * 0.32);
            starPath(tx + lx, ty + ly, leaf, 5, 0.45, -Math.PI / 2 + index * 0.4);
          }
          context.fill();
        }
      }
    },

    // Agawa: kolczasta rozeta; przy 5. etapie wysoki kwiatostan.
    rosette(item, x, top, s, stage, time) {
      const { color, accent } = item;
      context.fillStyle = color;
      const spikes = 5 + stage;
      for (let index = 0; index < spikes; index += 1) {
        const angle = -Math.PI / 2 + (index - (spikes - 1) / 2) * 0.32;
        context.save();
        context.translate(x, top);
        context.rotate(angle + Math.PI / 2);
        context.beginPath();
        context.moveTo(-2.2 * s, 0);
        context.lineTo(0, -(10 + stage * 2.5) * s);
        context.lineTo(2.2 * s, 0);
        context.closePath();
        context.fill();
        context.restore();
      }
      if (stage >= 5) {
        line(x, top, x, top - 34 * s, "#7a8a4a", 2 * s);
        context.fillStyle = accent;
        ellipse(x, top - 36 * s, 4 * s, 3 * s);
      }
    },

    // Daktylowiec: prosty, gruby pień w romby, sztywne liście-pióra z listkami; od 2. etapu kiście daktyli.
    date(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const height = (16 + stage * 5) * s;
      const width = (3.6 + stage * 0.4) * s;
      const cy = top - height;
      context.fillStyle = "#9a7b55";
      context.beginPath();
      polygonPath([
        [x - width * 0.6, top],
        [x - width * 0.45, cy],
        [x + width * 0.45, cy],
        [x + width * 0.6, top],
      ]);
      context.fill();
      stroke("#7a5f3f", 0.6 * s);
      context.beginPath();
      for (let y = top - 2 * s; y > cy + 2 * s; y -= 3.2 * s) {
        context.moveTo(x - width * 0.5, y);
        context.lineTo(x + width * 0.5, y - 2.4 * s);
        context.moveTo(x + width * 0.5, y);
        context.lineTo(x - width * 0.5, y - 2.4 * s);
      }
      context.stroke();
      if (stage >= 2) {
        const bunches = Math.min(3, stage - 1);
        for (let bunch = 0; bunch < bunches; bunch += 1) {
          const bx = x + (bunch - (bunches - 1) / 2) * 4.5 * s;
          line(x, cy + 1 * s, bx, cy + 4 * s, "#c9a24a", 0.6 * s);
          begin(accent);
          for (let date = 0; date < 6; date += 1) {
            circlePath(
              bx + ((date % 3) - 1) * 1.3 * s,
              cy + 4.5 * s + Math.floor(date / 3) * 1.6 * s + (date % 3 === 1 ? 0.6 * s : 0),
              0.9 * s,
            );
          }
          context.fill();
        }
      }
      const fronds = 6 + stage;
      const length = (11 + stage * 2.6) * s;
      for (let index = 0; index < fronds; index += 1) {
        const share = index / (fronds - 1) - 0.5;
        const angle = share * 2.9 + sway(time, x, index);
        const ex = x + Math.sin(angle) * length;
        const ey = cy - Math.cos(angle) * length + Math.abs(share) * length * 0.25;
        line(x, cy, ex, ey, shade(color, -0.2), 0.9 * s);
        stroke(color, 0.8 * s);
        context.beginPath();
        for (let leaflet = 1; leaflet <= 7; leaflet += 1) {
          const t = leaflet / 8;
          const px = x + (ex - x) * t;
          const py = cy + (ey - cy) * t;
          const size = (1 - t * 0.5) * 2.8 * s;
          for (const sideAngle of [angle - 0.9, angle + 0.9]) {
            context.moveTo(px, py);
            context.lineTo(px + Math.sin(sideAngle) * size, py - Math.cos(sideAngle) * size);
          }
        }
        context.stroke();
      }
    },

    // Ciemiernik (róża Bożego Narodzenia): liście i kielichy kwiatów z jasnymi płatkami.
    flower(item, x, top, s, stage, time) {
      const { color, accent } = item;
      context.fillStyle = color;
      for (let index = 0; index < 2 + stage; index += 1) {
        const angle = (index - (1 + stage) / 2) * 0.5 + sway(time, x, index);
        context.save();
        context.translate(x, top);
        context.rotate(angle);
        ellipse(0, -(6 + stage * 2) * s, 2.8 * s, (6 + stage * 2) * s);
        context.restore();
      }
      const blooms = Math.min(4, 1 + Math.floor(stage / 2));
      for (let index = 0; index < blooms; index += 1) {
        const fx = x + (index - (blooms - 1) / 2) * 7 * s;
        const fy = top - (14 + stage * 3 - (index % 2) * 3) * s;
        context.fillStyle = accent;
        for (let petal = 0; petal < 5; petal += 1) {
          const angle = (petal / 5) * Math.PI * 2;
          ellipse(fx + Math.cos(angle) * 2.4 * s, fy + Math.sin(angle) * 2.4 * s, 2.2 * s, 1.6 * s, angle);
        }
        context.fillStyle = "#f4c542";
        ellipse(fx, fy, 1.2 * s, 1.2 * s);
      }
    },

    // Ostrokrzew: stożkowaty krzew z kolczastych, lśniących liści i kiście czerwonych jagód; przy 5. etapie czapka
    // śniegu.
    holly(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const height = (14 + stage * 4.2) * s;
      const base = (8 + stage * 1.8) * s;
      const rows = 3 + Math.floor(stage / 2);
      const leaves = [];
      for (let row = 0; row < rows; row += 1) {
        const t = row / rows;
        const ly = top - 2 * s - height * t;
        const half = base * (1 - t * 0.85);
        const count = Math.max(2, Math.round(2 + (1 - t) * (2 + stage * 0.6)));
        for (let index = 0; index < count; index += 1) {
          const share = count > 1 ? index / (count - 1) - 0.5 : 0;
          leaves.push([x + share * half * 2, ly, share * 1.6 + sway(time, x, row + index) * 2]);
        }
      }
      leaves.push([x, top - height - 1 * s, 0]);
      const size = (4.2 + stage * 0.45) * s;
      // Liść ostrokrzewu: zygzak kolców po obu bokach.
      const hollyLeaf = (lx, ly, angle) => {
        const at = turn(lx, ly, angle, size);
        polygonPath([
          at(0, 0.1),
          at(0.42, -0.08),
          at(0.24, -0.3),
          at(0.48, -0.5),
          at(0.22, -0.68),
          at(0.36, -0.9),
          at(0, -1.1),
          at(-0.36, -0.9),
          at(-0.22, -0.68),
          at(-0.48, -0.5),
          at(-0.24, -0.3),
          at(-0.42, -0.08),
        ]);
      };
      begin(color);
      for (const [lx, ly, angle] of leaves) hollyLeaf(lx, ly, angle);
      context.fill();
      begin(shade(color, 0.28));
      for (const [index, [lx, ly, angle]] of leaves.entries()) {
        if (index % 3 === 0)
          ellipsePath(lx + Math.sin(angle) * size * 0.45, ly - size * 0.45, size * 0.12, size * 0.28, angle);
      }
      context.fill();
      const clusters = 1 + stage;
      begin(accent);
      for (let index = 0; index < clusters; index += 1) {
        const [cx, cy] = leaves[(index * 5 + 2) % leaves.length];
        for (const [dx, dy] of [
          [-0.9, 0],
          [0.9, 0],
          [0, -1.1],
        ]) {
          circlePath(cx + dx * s, cy - size * 0.35 + dy * s, 1.2 * s);
        }
      }
      context.fill();
      if (stage >= 5) {
        begin("#ffffff");
        ellipsePath(x, top - height - 1.5 * s, 3.6 * s, 1.6 * s);
        ellipsePath(x - base * 0.35, top - height * 0.62, 3 * s, 1.1 * s);
        ellipsePath(x + base * 0.4, top - height * 0.4, 3.2 * s, 1.1 * s);
        context.fill();
      }
    },

    // Grzybienie (lilia wodna): okrągłe liście z wcięciem pływające w misce wody i kwiat-gwiazda; od 3. etapu pąk.
    pad(item, x, top, s, stage, time) {
      const { color, accent } = item;
      context.fillStyle = "rgba(92, 200, 232, 0.8)";
      ellipse(x, top - 1 * s, (13 + stage) * s, 3.2 * s);
      const pads = 2 + Math.min(2, Math.floor(stage / 2));
      const radius = (5.2 + stage * 0.8) * s;
      const shadow = shade(color, -0.25);
      for (const [lift, padColor] of [
        [0, shadow],
        [0.5 * s, color],
      ]) {
        begin(padColor);
        for (let index = 0; index < pads; index += 1) {
          const px = x + (index - (pads - 1) / 2) * (7 + stage * 1.2) * s + Math.sin(time * 0.6 + index) * 0.6 * s;
          const py = top - (1.8 + (index % 2) * 1.2) * s - lift;
          const notch = Math.PI / 2 + (index % 2 ? 0.5 : -0.5);
          context.moveTo(px, py);
          context.ellipse(px, py, radius, radius * 0.36, 0, notch + 0.3, notch - 0.3 + TAU);
          context.closePath();
        }
        context.fill();
      }
      const fx = x + 1.5 * s;
      const fy = top - (3.5 + stage * 0.4) * s;
      const petal = (4 + stage * 0.7) * s;
      begin(accent);
      for (let index = 0; index < 8; index += 1) leafPath(fx, fy, petal, petal * 0.45, (index - 3.5) * 0.4);
      context.fill();
      begin(shade(accent, 0.5));
      for (let index = 0; index < 5; index += 1) leafPath(fx, fy, petal * 0.72, petal * 0.38, (index - 2) * 0.34);
      context.fill();
      context.fillStyle = "#f4c542";
      circle(fx, fy - petal * 0.15, petal * 0.18);
      if (stage >= 3) {
        const bx = x - (7 + stage) * s;
        line(bx, top - 1.5 * s, bx, top - (6 + stage) * s, shade(color, -0.2), 0.8 * s);
        context.fillStyle = accent;
        context.beginPath();
        leafPath(bx, top - (5.5 + stage) * s, petal * 0.85, petal * 0.5, 0);
        context.fill();
      }
    },

    // Wiktoria królewska: olbrzymie liście z podwiniętym rantem i żeberkami na misce wody, duży biały kwiat
    // (przy 5. etapie z różowym środkiem — kwiat wiktorii różowieje drugiej nocy).
    victoria(item, x, top, s, stage, time) {
      const { color, accent } = item;
      context.fillStyle = "rgba(92, 200, 232, 0.8)";
      ellipse(x, top - 1 * s, 16 * s, 3.4 * s);
      const pads = stage >= 3 ? 2 : 1;
      for (let index = 0; index < pads; index += 1) {
        const rx = (8.5 + stage * 1.5) * s * (index ? 0.75 : 1);
        const px = x + (index ? 1 : -1) * (pads > 1 ? rx * 0.6 : 0) + Math.sin(time * 0.5 + index) * 0.5 * s;
        const py = top - (2 + index) * s;
        context.fillStyle = shade(color, -0.3);
        ellipse(px, py, rx, rx * 0.32);
        context.fillStyle = shade(color, 0.12);
        ellipse(px, py - rx * 0.06, rx * 0.93, rx * 0.26);
        context.fillStyle = color;
        ellipse(px, py - rx * 0.02, rx * 0.86, rx * 0.22);
        stroke(shade(color, -0.18), 0.5 * s);
        context.beginPath();
        for (let rib = 0; rib < 10; rib += 1) {
          const angle = (rib / 10) * TAU;
          context.moveTo(px, py - rx * 0.02);
          context.lineTo(px + Math.cos(angle) * rx * 0.84, py - rx * 0.02 + Math.sin(angle) * rx * 0.21);
        }
        context.stroke();
      }
      const fx = x + (pads > 1 ? -2 : 4) * s;
      const fy = top - (6 + stage) * s;
      line(fx, top - 2 * s, fx, fy, shade(color, -0.25), 1 * s);
      const petal = (4 + stage * 0.6) * s;
      begin(shade(accent, -0.1));
      for (let index = 0; index < 7; index += 1) leafPath(fx, fy, petal, petal * 0.5, (index - 3) * 0.42);
      context.fill();
      begin(stage >= 5 ? "#ffb7cf" : accent);
      for (let index = 0; index < 5; index += 1) leafPath(fx, fy, petal * 0.78, petal * 0.42, (index - 2) * 0.36);
      context.fill();
    },

    // Lawenda: kępka wąskich, szarozielonych listków i wiele cienkich łodyżek z fioletowymi kłosami; przy 5. etapie
    // krąży pszczoła.
    lavender(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const gray = shade(accent, 0.3);
      stroke(gray, 1 * s);
      context.beginPath();
      const blades = 8 + stage * 2;
      for (let index = 0; index < blades; index += 1) {
        const angle = (index / (blades - 1) - 0.5) * 2.4;
        const length = (5 + ((index * 3) % 4) + stage) * s;
        context.moveTo(x, top);
        context.quadraticCurveTo(
          x + Math.sin(angle) * length * 0.5,
          top - length * 0.9,
          x + Math.sin(angle) * length,
          top - Math.cos(angle * 0.8) * length * 0.8,
        );
      }
      context.stroke();
      const stems = 4 + stage * 2;
      const spikes = [];
      stroke(accent, 0.7 * s);
      context.beginPath();
      for (let index = 0; index < stems; index += 1) {
        const share = index / (stems - 1) - 0.5;
        const height = (13 + stage * 4 + ((index * 5) % 4) * 1.5) * s;
        const tx = x + share * (8 + stage * 2.4) * s + sway(time, x, index) * height * 0.5;
        const ty = top - height;
        context.moveTo(x + share * 2 * s, top);
        context.quadraticCurveTo(x + share * 4 * s, top - height * 0.5, tx, ty);
        spikes.push([tx, ty]);
      }
      context.stroke();
      for (const [layer, budColor] of [
        [1, shade(color, -0.15)],
        [0.62, shade(color, 0.2)],
      ]) {
        begin(budColor);
        for (const [tx, ty] of spikes) {
          for (let bud = 0; bud < 6; bud += 1) {
            const size = (1.5 - bud * 0.15) * s * layer;
            circlePath(tx + (bud % 2 ? 0.5 : -0.5) * s, ty + 6 * s - bud * 1.4 * s - (1 - layer) * 0.4 * s, size);
          }
        }
        context.fill();
      }
      if (stage >= 5) {
        const bx = x + Math.cos(time * 1.3) * 12 * s;
        const by = top - (24 + Math.sin(time * 2.6) * 5) * s;
        context.fillStyle = "rgba(255, 255, 255, 0.85)";
        ellipse(bx - 0.6 * s, by - 1.4 * s, 1.1 * s, 0.7 * s, -0.4);
        ellipse(bx + 0.6 * s, by - 1.4 * s, 1.1 * s, 0.7 * s, 0.4);
        context.fillStyle = "#f4c542";
        ellipse(bx, by, 1.8 * s, 1.2 * s);
        line(bx - 0.4 * s, by - 1 * s, bx - 0.4 * s, by + 1 * s, "#3b2f4a", 0.5 * s);
        line(bx + 0.6 * s, by - 1 * s, bx + 0.6 * s, by + 1 * s, "#3b2f4a", 0.5 * s);
      }
    },

    // Figowiec: krótki pień, duże klapowane liście (po trzy płaty) i fioletowe figi od 2. etapu.
    fig(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const height = (8 + stage * 2) * s;
      line(x, top, x, top - height, "#8b5a2b", 2.6 * s);
      context.fillStyle = color;
      const leaves = 2 + stage;
      for (let index = 0; index < leaves; index += 1) {
        const angle = (index - (leaves - 1) / 2) * 0.5 + sway(time, x, index);
        context.save();
        context.translate(x, top - height);
        context.rotate(angle);
        const length = (7 + stage * 1.5) * s;
        ellipse(0, -length, 3 * s, length * 0.55);
        ellipse(-2.6 * s, -length * 0.8, 2.2 * s, length * 0.4, -0.6);
        ellipse(2.6 * s, -length * 0.8, 2.2 * s, length * 0.4, 0.6);
        context.restore();
      }
      if (stage >= 2) {
        context.fillStyle = accent;
        for (let index = 0; index < stage; index += 1) {
          const angle = index * 2.1 + 0.4;
          ellipse(x + Math.cos(angle) * 6 * s, top - height - 4 * s + Math.sin(angle) * 3 * s, 1.8 * s, 2.2 * s);
        }
      }
    },

    // Księżycowa monstera: liście z jasnymi plamkami i świecącą poświatą.
    glow(item, x, top, s, stage, time) {
      const { color, accent } = item;
      halo(x, top - 12 * s, (16 + stage * 3) * s, accent, 0.5);
      context.fillStyle = color;
      const leaves = 2 + stage;
      for (let index = 0; index < leaves; index += 1) {
        const angle = (index - (leaves - 1) / 2) * 0.45 + sway(time, x, index);
        context.save();
        context.translate(x, top);
        context.rotate(angle);
        ellipse(0, -(9 + stage * 2.5) * s, 4 * s, (9 + stage * 2.5) * s);
        context.fillStyle = accent;
        ellipse(1.2 * s, -(8 + stage * 2) * s, 0.8 * s, 1.8 * s);
        context.fillStyle = color;
        context.restore();
      }
    },

    // Gwiezdny kwiat: gwiazdy na łodyżkach, migoczą.
    star(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const stems = 1 + Math.min(3, Math.floor(stage / 2));
      for (let index = 0; index < stems; index += 1) {
        const sx = x + (index - (stems - 1) / 2) * 7 * s;
        const height = (14 + stage * 3 + (index % 2) * 4) * s;
        line(sx, top, sx, top - height, "#5aa86a", 1.8 * s);
        const radius = (4 + stage * 0.5) * s * (0.9 + 0.1 * Math.sin(time * 3 + index));
        context.fillStyle = index % 2 ? accent : color;
        context.beginPath();
        starPath(sx, top - height, radius, 5, 0.45);
        context.fill();
      }
    },

    // ---------- Rozdziały 15–22 — krainy fantazji (uwaga O9) ----------

    // Belladonna (pokrzyk wilcza jagoda): krzaczek z ciemnymi, owalnymi liśćmi, od 2. etapu fioletowe dzwonki,
    // od 3. lśniące czarne jagody na zielonych kielichach.
    belladonna(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const green = "#3d6b3a";
      const height = (12 + stage * 4) * s;
      const branches = 2 + Math.min(3, stage);
      const ends = [];
      stroke(shade(green, -0.25), 1.1 * s);
      context.beginPath();
      for (let index = 0; index < branches; index += 1) {
        const share = index / (branches - 1) - 0.5;
        const ex = x + share * (10 + stage * 3) * s + sway(time, x, index) * 6 * s;
        const ey = top - height * (0.7 + 0.3 * (1 - Math.abs(share) * 2));
        context.moveTo(x, top);
        context.quadraticCurveTo(x + share * 4 * s, top - height * 0.55, ex, ey);
        ends.push([ex, ey, share]);
      }
      context.stroke();
      begin(green);
      for (const [ex, ey, share] of ends) {
        for (const [t, side] of [
          [0.42, -1],
          [0.7, 1],
          [1, 0],
        ]) {
          const lx = x + (ex - x) * t;
          const ly = top + (ey - top) * t;
          leafPath(lx, ly, (5 + stage * 0.8) * s, (3.6 + stage * 0.3) * s, share * 1.4 + side * 0.9);
        }
      }
      context.fill();
      if (stage >= 2) {
        const bells = ends.slice(0, Math.min(ends.length, stage));
        for (const [index, [ex, ey]] of bells.entries()) {
          const bx = ex + (index % 2 ? 2.5 : -2.5) * s;
          const by = ey + 2 * s;
          const swing = Math.sin(time * 2 + index) * 0.12;
          context.fillStyle = color;
          context.beginPath();
          bellPath(bx, by, (3.4 + stage * 0.3) * s, (3.8 + stage * 0.35) * s, swing);
          context.fill();
          context.fillStyle = shade(color, -0.35);
          context.beginPath();
          bellPath(bx, by, (1.6 + stage * 0.15) * s, (1.6 + stage * 0.15) * s, swing);
          context.fill();
        }
      }
      if (stage >= 3) {
        const berries = stage - 1;
        for (let index = 0; index < berries; index += 1) {
          const [ex, ey] = ends[(index * 2 + 1) % ends.length];
          berry(ex + (index % 2 ? -3 : 3) * s, ey + 6 * s + (index % 3) * s, (1.6 + stage * 0.15) * s, accent);
        }
      }
    },

    // Mandragora: rozeta szerokich, pofalowanych liści, a pod nimi korzeń z buzią, który wygląda z doniczki (kołysze
    // się i mruga); od 3. etapu fioletowe kwiatki, od 4. machające rączki-korzonki, przy 5. pomarańczowe jagody.
    mandrake(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const radius = (3.4 + stage * 0.45) * s;
      const bob = Math.sin(time * 2 + x * 0.1) * 0.7 * s;
      const hx = x;
      const hy = top - radius * 0.45 + bob;
      const crown = hy - radius * 0.75;
      const leaves = 4 + stage;
      begin(color);
      for (let index = 0; index < leaves; index += 1) {
        const angle = (index / (leaves - 1) - 0.5) * 2.7 + sway(time, x, index);
        leafPath(hx, crown, (7 + stage * 1.9) * s, (5 + stage * 0.6) * s, angle);
      }
      context.fill();
      stroke(shade(color, -0.25), 0.6 * s);
      context.beginPath();
      for (let index = 0; index < leaves; index += 1) {
        const angle = (index / (leaves - 1) - 0.5) * 2.7 + sway(time, x, index);
        const length = (7 + stage * 1.9) * s * 0.8;
        context.moveTo(hx, crown);
        context.lineTo(hx + Math.sin(angle) * length, crown - Math.cos(angle) * length);
      }
      context.stroke();
      if (stage >= 3) {
        for (let index = 0; index < stage - 1; index += 1) {
          const angle = (index / Math.max(1, stage - 2) - 0.5) * 1.4;
          const fx = hx + Math.sin(angle) * 5 * s;
          const fy = crown - Math.cos(angle) * 5 * s;
          context.fillStyle = "#8a5cc2";
          context.beginPath();
          starPath(fx, fy, 1.8 * s, 5, 0.55);
          context.fill();
          context.fillStyle = "#ffe27a";
          circle(fx, fy, 0.5 * s);
        }
      }
      if (stage >= 5) {
        begin("#f0a030");
        for (const side of [-1, 1]) circlePath(hx + side * 7 * s, crown - 1 * s, 1.4 * s);
        context.fill();
      }
      if (stage >= 4) {
        for (const side of [-1, 1]) {
          const wave = Math.sin(time * 3 + side) * 1.6 * s;
          curve(
            hx + side * radius * 0.8,
            hy + radius * 0.2,
            hx + side * radius * 1.6,
            hy,
            hx + side * radius * 1.9,
            hy - radius * 0.6 + wave,
            shade(accent, -0.2),
            1.2 * s,
          );
        }
      }
      context.fillStyle = shade(accent, -0.15);
      ellipse(hx, hy + radius * 0.15, radius * 1.05, radius * 0.95);
      context.fillStyle = accent;
      ellipse(hx, hy, radius, radius * 0.9);
      const closed = blinking(time, x * 0.013);
      const look = Math.sin(time * 0.8 + x) * 0.3 * radius;
      if (closed) {
        stroke("#3b2f4a", 0.6 * s);
        context.beginPath();
        for (const side of [-1, 1]) {
          context.moveTo(hx + side * radius * 0.42 - radius * 0.14 + look, hy - radius * 0.1);
          context.lineTo(hx + side * radius * 0.42 + radius * 0.14 + look, hy - radius * 0.1);
        }
        context.stroke();
      } else {
        begin("#3b2f4a");
        for (const side of [-1, 1])
          ellipsePath(hx + side * radius * 0.42 + look, hy - radius * 0.1, radius * 0.13, radius * 0.18);
        context.fill();
      }
      context.fillStyle = "rgba(255, 140, 160, 0.55)";
      for (const side of [-1, 1]) ellipse(hx + side * radius * 0.62, hy + radius * 0.22, radius * 0.18, radius * 0.11);
      context.fillStyle = "#6b3a3a";
      ellipse(hx + look * 0.5, hy + radius * 0.35, radius * 0.14, radius * 0.18);
    },

    // Tojad (mordownik): u dołu dłoniaste, głęboko wcinane liście, a na wysokich kłosach niebiesko-fioletowe kwiaty
    // w kształcie hełmów (im wyżej, tym mniejsze); kłosów przybywa z etapem.
    aconite(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const leaves = 3 + Math.floor(stage / 2);
      begin(accent);
      for (let index = 0; index < leaves; index += 1) {
        const share = index / (leaves - 1) - 0.5;
        const lx = x + share * (8 + stage * 2) * s;
        const ly = top - (3 + (1 - Math.abs(share) * 2) * 3) * s;
        for (let lobe = 0; lobe < 5; lobe += 1) {
          leafPath(lx, ly, (4.5 + stage * 0.5) * s, 1.6 * s, share * 1.4 + (lobe - 2) * 0.42);
        }
      }
      context.fill();
      const spikes = 1 + Math.floor(stage / 2);
      for (let spike = 0; spike < spikes; spike += 1) {
        const share = spikes > 1 ? spike / (spikes - 1) - 0.5 : 0;
        const height = (16 + stage * 5) * s * (1 - Math.abs(share) * 0.35);
        const bx = x + share * 7 * s;
        const tx = bx + sway(time, x, spike) * height * 0.5;
        line(bx, top - 2 * s, tx, top - height, shade(accent, -0.2), 1 * s);
        // Kwiaty-hełmy w dwóch odcieniach (co trzeci ciemniejszy) i jaśniejsze dolne płatki — po jednym wypełnieniu.
        const flowers = [];
        for (let index = 0; index < 4 + stage; index += 1) {
          const t = 0.35 + (index / (4 + stage)) * 0.6;
          flowers.push({
            fx: bx + (tx - bx) * t + (index % 2 ? 1.6 : -1.6) * s,
            fy: top - height * t,
            r: (2.2 + stage * 0.15) * s * (1 - t * 0.45),
            face: index % 2 ? 1 : -1,
            dark: index % 3 === 0,
          });
        }
        for (const [dark, hoodColor] of [
          [false, color],
          [true, shade(color, -0.15)],
        ]) {
          begin(hoodColor);
          for (const { fx, fy, r, face } of flowers.filter((flower) => flower.dark === dark)) {
            context.moveTo(fx - face * r, fy + r * 0.3);
            context.quadraticCurveTo(fx - face * r * 1.1, fy - r * 1.7, fx + face * r * 0.45, fy - r * 1.25);
            context.lineTo(fx + face * r * 0.95, fy - r * 0.15);
            context.quadraticCurveTo(fx + face * r * 0.2, fy + r * 0.55, fx - face * r, fy + r * 0.3);
            context.closePath();
          }
          context.fill();
        }
        begin(shade(color, 0.3));
        for (const { fx, fy, r, face } of flowers) ellipsePath(fx + face * r * 0.2, fy + r * 0.55, r * 0.45, r * 0.3);
        context.fill();
        begin(shade(color, 0.15));
        for (let bud = 0; bud < 3; bud += 1) circlePath(tx, top - height - bud * 1.6 * s, (1 - bud * 0.25) * s);
        context.fill();
      }
    },

    // Upiorna dynia: pnącze z wielkimi liśćmi i wąsami, dynie z wyciętymi buziami, w których migocze światło;
    // dyń przybywa z etapem.
    pumpkin(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const leafCount = 2 + stage;
      begin(accent);
      for (let index = 0; index < leafCount; index += 1) {
        const share = index / (leafCount - 1) - 0.5;
        const lx = x + share * (14 + stage * 3) * s;
        const ly = top - (6 + stage * 1.6) * s - (1 - Math.abs(share) * 2) * 4 * s + Math.sin(time + index) * 0.5 * s;
        const r = (3.4 + stage * 0.4) * s;
        circlePath(lx, ly, r);
        circlePath(lx - r * 0.8, ly + r * 0.3, r * 0.75);
        circlePath(lx + r * 0.8, ly + r * 0.3, r * 0.75);
      }
      context.fill();
      stroke(shade(accent, 0.25), 0.7 * s);
      context.beginPath();
      for (const side of [-1, 1]) {
        const cx = x + side * (10 + stage * 2) * s;
        const cy = top - (12 + stage * 2) * s;
        context.moveTo(x + side * 4 * s, top - 4 * s);
        context.quadraticCurveTo(cx, top - 4 * s, cx, cy);
        context.arc(
          cx - side * 1.2 * s,
          cy,
          1.2 * s,
          side > 0 ? 0 : Math.PI,
          side > 0 ? Math.PI * 1.6 : -Math.PI * 0.6,
          side < 0,
        );
      }
      context.stroke();
      const pumpkins = [
        { dx: 0, dy: 0, r: (4.6 + stage * 0.9) * s },
        { dx: -(8 + stage * 1.6) * s, dy: -1 * s, r: (3.2 + stage * 0.5) * s },
        { dx: (8 + stage * 1.6) * s, dy: -0.5 * s, r: (3 + stage * 0.45) * s },
      ].slice(0, Math.min(3, 1 + Math.floor(stage / 2)));
      for (const [index, pumpkin] of [...pumpkins.entries()].reverse()) {
        const px = x + pumpkin.dx;
        const r = pumpkin.r;
        const py = top - r * 0.75 + pumpkin.dy;
        const flicker = 0.75 + 0.25 * Math.sin(time * 9 + index * 2.3) * Math.sin(time * 5.3 + index);
        halo(px, py, r * 2, "#ffd34a", 0.35 * flicker);
        context.fillStyle = shade(color, -0.2);
        ellipse(px - r * 0.45, py, r * 0.6, r * 0.82);
        ellipse(px + r * 0.45, py, r * 0.6, r * 0.82);
        context.fillStyle = color;
        ellipse(px, py, r * 0.62, r * 0.86);
        line(px, py - r * 0.8, px + r * 0.15, py - r * 1.15, "#5a6b2a", r * 0.2);
        context.globalAlpha = 0.65 + 0.35 * flicker;
        context.fillStyle = "#ffd34a";
        context.beginPath();
        for (const side of [-1, 1]) {
          polygonPath([
            [px + side * r * 0.42, py - r * 0.32],
            [px + side * r * 0.12, py - r * 0.05],
            [px + side * r * 0.62, py - r * 0.02],
          ]);
        }
        polygonPath([
          [px - r * 0.48, py + r * 0.22],
          [px - r * 0.28, py + r * 0.36],
          [px - r * 0.12, py + r * 0.24],
          [px, py + r * 0.4],
          [px + r * 0.12, py + r * 0.24],
          [px + r * 0.28, py + r * 0.36],
          [px + r * 0.48, py + r * 0.22],
          [px + r * 0.3, py + r * 0.6],
          [px - r * 0.3, py + r * 0.6],
        ]);
        context.fill();
        context.globalAlpha = 1;
      }
    },

    // Kwiat paproci (z nocy świętojańskiej): sztywne liście paproci, a pośrodku na łodyżce świecący kwiat —
    // ogniste płatki, złota poświata, promienie i krążące iskierki.
    fernFlower(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const fronds = 3 + stage;
      for (let index = 0; index < fronds; index += 1) {
        const share = index / (fronds - 1) - 0.5;
        const length = (10 + stage * 2.6) * s * (1 - Math.abs(share) * 0.3);
        const p0 = [x, top];
        const p1 = [x + share * length * 0.9, top - length * 0.9];
        const p2 = [
          x + share * length * 1.7 + sway(time, x, index) * length,
          top - length * (1 - Math.abs(share) * 0.9),
        ];
        curve(...p0, ...p1, ...p2, shade(accent, -0.15), 0.9 * s);
        begin(index % 2 ? accent : shade(accent, 0.15));
        for (let pinna = 1; pinna <= 8; pinna += 1) {
          const point = onCurve(p0, p1, p2, 0.15 + (pinna / 9) * 0.85);
          const size = (1 - pinna / 12) * (2.6 + stage * 0.3) * s;
          leafPath(point.x, point.y, size, size * 0.5, point.angle - 1.2);
          leafPath(point.x, point.y, size, size * 0.5, point.angle + 1.2);
        }
        context.fill();
      }
      const height = (13 + stage * 4) * s;
      const fx = x + sway(time, x, 9) * 6 * s;
      const fy = top - height;
      line(x, top, fx, fy, shade(accent, -0.3), 1 * s);
      const pulse = 0.5 + 0.5 * Math.sin(time * 2.4);
      halo(fx, fy, (8 + stage * 2) * s * (0.85 + 0.15 * pulse), "#ffd23f", 0.55);
      stroke("#fff3b0", 0.6 * s);
      context.globalAlpha = 0.35 + 0.35 * pulse;
      context.beginPath();
      for (let ray = 0; ray < 8; ray += 1) {
        const angle = (ray / 8) * TAU + time * 0.4;
        context.moveTo(fx + Math.cos(angle) * 3 * s, fy + Math.sin(angle) * 3 * s);
        context.lineTo(fx + Math.cos(angle) * (7 + stage * 1.6) * s, fy + Math.sin(angle) * (7 + stage * 1.6) * s);
      }
      context.stroke();
      context.globalAlpha = 1;
      const petal = (3.6 + stage * 0.5) * s;
      begin(color);
      for (let index = 0; index < 6; index += 1) leafPath(fx, fy, petal, petal * 0.7, (index / 6) * TAU);
      context.fill();
      begin("#ffd23f");
      for (let index = 0; index < 6; index += 1) leafPath(fx, fy, petal * 0.6, petal * 0.45, (index / 6) * TAU + 0.5);
      context.fill();
      context.fillStyle = "#fffaf2";
      circle(fx, fy, petal * 0.22);
      for (let index = 0; index < 2 + stage; index += 1) {
        const angle = time * 1.2 + (index / (2 + stage)) * TAU;
        const distance = (8 + stage * 1.5) * s;
        sparkle(
          fx + Math.cos(angle) * distance,
          fy + Math.sin(angle) * distance * 0.6,
          1.4 * s,
          "#fff3b0",
          time,
          index,
        );
      }
    },

    // Muchomor: kępka grzybów z czerwonymi kapeluszami w białe kropki i białymi trzonami z kołnierzykiem; z etapem
    // przybywa grzybów, a przy 5. największy ma drzwiczki i okienko (domek krasnoludka).
    toadstool(item, x, top, s, stage, time) {
      const { color, accent } = item;
      stroke("#5a9a3a", 0.8 * s);
      context.beginPath();
      for (let blade = 0; blade < 7; blade += 1) {
        const bx = x + (blade - 3) * 2.6 * s;
        context.moveTo(bx, top);
        context.lineTo(bx + (blade % 2 ? 1 : -1) * 1.2 * s, top - (2.5 + (blade % 3)) * s);
      }
      context.stroke();
      const mushrooms = [
        { dx: 0, height: (8 + stage * 3) * s, r: (5.5 + stage * 1.2) * s },
        { dx: -(7 + stage) * s, height: (5 + stage * 1.5) * s, r: (3.6 + stage * 0.6) * s },
        { dx: (7 + stage) * s, height: (4 + stage * 1.2) * s, r: (3.2 + stage * 0.5) * s },
        { dx: -(12 + stage * 1.6) * s, height: (3 + stage) * s, r: (2.4 + stage * 0.3) * s },
        { dx: (12 + stage * 1.6) * s, height: (2.6 + stage) * s, r: (2.2 + stage * 0.3) * s },
      ].slice(0, Math.min(5, 1 + stage));
      for (const [index, mushroom] of [...mushrooms.entries()].reverse()) {
        const mx = x + mushroom.dx;
        const { height, r } = mushroom;
        const capY = top - height;
        const tilt = index ? (mushroom.dx > 0 ? 0.12 : -0.12) : 0;
        context.fillStyle = accent;
        context.beginPath();
        polygonPath([
          [mx - r * 0.3, top],
          [mx - r * 0.22, capY],
          [mx + r * 0.22, capY],
          [mx + r * 0.3, top],
        ]);
        context.fill();
        context.fillStyle = shade(accent, -0.1);
        ellipse(mx, capY + height * 0.4, r * 0.38, r * 0.12);
        context.fillStyle = shade(accent, -0.08);
        ellipse(mx, capY + r * 0.05, r * 0.95, r * 0.22, tilt);
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(mx - Math.cos(tilt) * r, capY - Math.sin(tilt) * r);
        context.ellipse(mx, capY, r, r * 0.78, tilt, Math.PI, TAU);
        context.closePath();
        context.fill();
        begin(shade(color, 0.25));
        ellipsePath(mx - r * 0.35, capY - r * 0.55, r * 0.22, r * 0.1, -0.5);
        context.fill();
        begin("#fffaf2");
        for (const [sx, sy, size] of [
          [-0.5, -0.25, 0.14],
          [0.1, -0.55, 0.16],
          [0.55, -0.3, 0.12],
          [-0.15, -0.2, 0.1],
          [0.3, -0.62, 0.08],
        ]) {
          circlePath(mx + sx * r, capY + sy * r, size * r);
        }
        context.fill();
        if (index === 0 && stage >= 5) {
          context.fillStyle = "#8b5a2b";
          context.beginPath();
          context.roundRect(mx - r * 0.13, top - r * 0.5, r * 0.26, r * 0.5, [r * 0.13, r * 0.13, 0, 0]);
          context.fill();
          context.fillStyle = "#f4c542";
          circle(mx + r * 0.06, top - r * 0.25, Math.max(0.5, r * 0.03));
          circle(mx, capY + height * 0.25, r * 0.08);
        }
      }
    },

    // Smocze drzewo: gruby pień, który rozwidla się po dwa (z etapem — więcej pięter), a na końcach gałęzi kępki
    // sztywnych, kolczastych liści — razem korona-parasol; od 3. etapu kapie czerwona „smocza krew”.
    dragonTree(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const levels = 1 + Math.min(2, Math.floor(stage / 2));
      const trunk = (8 + stage * 2) * s;
      const tips = [];
      const branch = (px, py, angle, length, width, depth) => {
        const ex = px + Math.sin(angle) * length;
        const ey = py - Math.cos(angle) * length;
        line(px, py, ex, ey, accent, width);
        if (depth > 0) {
          for (const side of [-1, 1]) branch(ex, ey, angle + side * 0.5, length * 0.78, width * 0.72, depth - 1);
        } else tips.push([ex, ey, angle]);
      };
      line(x, top, x, top - trunk, accent, (3 + stage * 0.5) * s);
      line(x - (0.8 + stage * 0.12) * s, top, x - (0.8 + stage * 0.12) * s, top - trunk, shade(accent, 0.25), 0.8 * s);
      for (const side of [-1, 1])
        branch(x, top - trunk, side * 0.55, (5 + stage * 1.2) * s, (2.2 + stage * 0.3) * s, levels - 1);
      for (const [layer, leafColor] of [
        [1, shade(color, -0.2)],
        [0.75, color],
      ]) {
        begin(leafColor);
        for (const [index, [tx, ty]] of tips.entries()) {
          const spikes = 7 + Math.floor(stage / 2);
          for (let spike = 0; spike < spikes; spike += 1) {
            const angle = (spike / (spikes - 1) - 0.5) * 2.9 + sway(time, x, index) * 2;
            leafPath(tx, ty, (4.5 + stage * 0.7) * s * layer, 1.2 * s, angle);
          }
        }
        context.fill();
      }
      if (stage >= 3) {
        context.fillStyle = "#c0262c";
        for (let drop = 0; drop < stage - 2; drop += 1) {
          const fall = ((time * 0.35 + drop * 0.37) % 1) * trunk * 0.5;
          const dx = x + (drop % 2 ? 1 : -1) * (1.2 + stage * 0.25) * s;
          const dy = top - trunk * 0.85 + fall;
          context.beginPath();
          context.moveTo(dx, dy - 1.4 * s);
          context.quadraticCurveTo(dx + 0.9 * s, dy, dx, dy + 0.8 * s);
          context.quadraticCurveTo(dx - 0.9 * s, dy, dx, dy - 1.4 * s);
          context.fill();
        }
      }
    },

    // Ognisty kwiat: płatki jak płomienie (migoczą), w środku żółty płomyczek i jasne serce, złota poświata
    // i iskry lecące w górę; kwiatów przybywa z etapem.
    flame(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const green = "#5a7a3a";
      begin(green);
      for (let index = 0; index < 3 + Math.floor(stage / 2); index += 1) {
        const angle = (index % 2 ? 1 : -1) * (0.6 + Math.floor(index / 2) * 0.3);
        leafPath(x, top, (7 + stage * 1.4) * s, 2.6 * s, angle);
      }
      context.fill();
      const flowers = [
        { dx: 0, height: (14 + stage * 4.5) * s, size: 1 },
        { dx: -(6 + stage) * s, height: (10 + stage * 3) * s, size: 0.72 },
        { dx: (6 + stage) * s, height: (8 + stage * 2.6) * s, size: 0.62 },
      ].slice(0, 1 + Math.floor((stage - 1) / 2));
      for (const [index, flower] of [...flowers.entries()].reverse()) {
        const fx = x + flower.dx + sway(time, x, index) * 6 * s;
        const fy = top - flower.height;
        curve(x + flower.dx * 0.2, top, x + flower.dx * 0.8, top - flower.height * 0.5, fx, fy, green, 1 * s);
        const size = (5 + stage * 0.9) * s * flower.size;
        halo(fx, fy - size * 0.4, size * 2.2, accent, 0.45 + 0.1 * Math.sin(time * 4 + index));
        begin(color);
        for (let petal = 0; petal < 5; petal += 1) {
          const flicker = 0.82 + 0.18 * Math.sin(time * 9 + petal * 1.7 + index);
          leafPath(fx, fy, size * flicker * (petal === 2 ? 1.25 : 1), size * 0.5, (petal - 2) * 0.42);
        }
        context.fill();
        begin(accent);
        for (let petal = 0; petal < 3; petal += 1) {
          const flicker = 0.85 + 0.15 * Math.sin(time * 11 + petal * 2.1 + index);
          leafPath(fx, fy, size * 0.68 * flicker, size * 0.36, (petal - 1) * 0.36);
        }
        context.fill();
        context.fillStyle = "#fffbe0";
        ellipse(fx, fy - size * 0.2, size * 0.16, size * 0.24);
        for (let ember = 0; ember < 2 + stage; ember += 1) {
          const rise = (time * 10 * s + ember * 9 * s) % (size * 3.2);
          context.globalAlpha = 1 - rise / (size * 3.2);
          context.fillStyle = ember % 2 ? accent : color;
          circle(fx + Math.sin(time * 3 + ember * 2) * size * 0.5, fy - size - rise, 0.6 * s);
        }
        context.globalAlpha = 1;
      }
    },

    // Kryształowa róża: srebrna łodyga z kryształowymi kolcami, liście jak oszlifowane kryształki i kwiat z płatków-
    // ścianek (dwie warstwy, jasne odblaski); iskierki wokół, przy 5. etapie dwa kwiaty.
    crystalRose(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const stem = "#b9b3d9";
      const blooms = [
        { dx: 0, height: (14 + stage * 4.5) * s, size: (6 + stage * 1.2) * s },
        { dx: (8 + stage) * s, height: (9 + stage * 3) * s, size: (4.4 + stage * 0.8) * s },
      ].slice(0, stage >= 5 ? 2 : 1);
      for (const [index, bloom] of [...blooms.entries()].reverse()) {
        const fx = x + bloom.dx + sway(time, x, index) * 5 * s;
        const fy = top - bloom.height;
        curve(x + bloom.dx * 0.2, top, x + bloom.dx * 0.6, top - bloom.height * 0.5, fx, fy, stem, 1.1 * s);
        begin(shade(stem, 0.3));
        for (let thorn = 1; thorn <= 3; thorn += 1) {
          const tx = x + bloom.dx * 0.2 + (fx - x - bloom.dx * 0.2) * (thorn / 4);
          const ty = top - bloom.height * (thorn / 4);
          const side = thorn % 2 ? 1 : -1;
          polygonPath([
            [tx, ty - 0.8 * s],
            [tx + side * 1.8 * s, ty - 1.6 * s],
            [tx, ty + 0.4 * s],
          ]);
        }
        context.fill();
        if (index === 0) {
          const leaves = 1 + Math.min(3, stage);
          for (let leaf = 0; leaf < leaves; leaf += 1) {
            const side = leaf % 2 ? 1 : -1;
            const lx = x + (fx - x) * (0.25 + leaf * 0.15);
            const ly = top - bloom.height * (0.25 + leaf * 0.15);
            const at = turn(lx, ly, side * 1.1, (4.5 + stage * 0.7) * s);
            context.fillStyle = "#8fd9c8";
            context.beginPath();
            polygonPath([at(0, 0), at(0.42, -0.5), at(0, -1.2), at(-0.42, -0.5)]);
            context.fill();
            context.fillStyle = "rgba(255, 255, 255, 0.55)";
            context.beginPath();
            polygonPath([at(0, 0), at(0.42, -0.5), at(0, -1.2)]);
            context.fill();
          }
        }
        // Trzy pierścienie płatków-ścianek; w każdym jedno wypełnienie płatków i jedno jasnych połówek (odblask).
        const size = bloom.size;
        for (const [ring, petalColor, petals, twist] of [
          [1, color, 6, 0],
          [0.68, accent, 5, 0.6],
          [0.4, shade(color, 0.45), 4, 0.2],
        ]) {
          const facets = [];
          for (let petal = 0; petal < petals; petal += 1) {
            const at = turn(fx, fy, (petal / petals) * TAU + twist + time * 0.05, size * ring);
            facets.push([at(0, 0), at(0.5, -0.55), at(0, -1), at(-0.5, -0.55)]);
          }
          begin(petalColor);
          for (const facet of facets) polygonPath(facet);
          context.fill();
          begin("rgba(255, 255, 255, 0.4)");
          for (const facet of facets) polygonPath(facet.slice(0, 3));
          context.fill();
        }
        context.fillStyle = "#ffffff";
        context.beginPath();
        starPath(fx, fy, size * 0.22, 6, 0.6);
        context.fill();
      }
      for (let index = 0; index < 2 + stage; index += 1) {
        const [px, py] = spiralPoint(index, 2 + stage, (10 + stage * 2) * s, (9 + stage * 1.6) * s);
        sparkle(x + px, top - blooms[0].height + py, 1.5 * s, "#ffffff", time, index * 1.3);
      }
    },

    // Świecący dzwonek: łukowate łodyżki, na nich zwisające dzwonki, które świecą i kołyszą się jak wahadła;
    // u dołu drobne okrągłe listki.
    bellflower(item, x, top, s, stage, time) {
      const { color, accent } = item;
      begin(accent);
      for (let index = 0; index < 4 + stage; index += 1) {
        const share = index / (3 + stage) - 0.5;
        circlePath(x + share * (12 + stage * 2) * s, top - (1.5 + (index % 2) * 1.5) * s, (1.8 + stage * 0.15) * s);
      }
      context.fill();
      const stems = 1 + Math.floor((stage + 1) / 2);
      for (let stem = 0; stem < stems; stem += 1) {
        const side = stem % 2 ? 1 : -1;
        const height = (14 + stage * 4 - stem * 2) * s;
        const reach = (6 + stage * 1.6 + stem * 2) * s * side;
        const p0 = [x + side * stem * 1.5 * s, top];
        const p1 = [x + reach * 0.2, top - height * 1.3];
        const p2 = [x + reach + sway(time, x, stem) * 8 * s, top - height * 0.75];
        curve(...p0, ...p1, ...p2, shade(accent, -0.1), 0.9 * s);
        // Dzwonki łodyżki: jedna wspólna poświata (pulsuje), potem dzwonki, jasne wnętrza i serduszka — po jednym
        // wypełnieniu.
        const count = 2 + Math.floor(stage / 2);
        const bells = [];
        for (let bell = 0; bell < count; bell += 1) {
          const point = onCurve(p0, p1, p2, 0.4 + (bell / Math.max(1, count - 1)) * 0.6);
          const swing = Math.sin(time * 2 + bell * 1.3 + stem) * 0.18;
          const width = (3.4 + stage * 0.35) * s * (1 - bell * 0.08);
          bells.push({ x: point.x, y: point.y, swing, width });
        }
        const middle = bells[Math.floor(count / 2)];
        const pulse = 0.5 + 0.5 * Math.sin(time * 2.5 + stem * 2);
        halo(middle.x, middle.y + middle.width, middle.width * (2.2 + count * 0.5), color, 0.3 + 0.25 * pulse);
        begin(shade(color, -0.1));
        for (const bell of bells) bellPath(bell.x, bell.y, bell.width, bell.width * 1.15, bell.swing);
        context.fill();
        begin(shade(color, 0.55));
        for (const bell of bells) bellPath(bell.x, bell.y, bell.width * 0.55, bell.width * 0.7, bell.swing);
        context.fill();
        begin("#ffffff");
        for (const bell of bells) {
          circlePath(
            bell.x - Math.sin(bell.swing) * bell.width * 1.25,
            bell.y + Math.cos(bell.swing) * bell.width * 1.25,
            0.6 * s,
          );
        }
        context.fill();
      }
    },

    // Naparstnica („rękawiczki wróżek”): rozeta miękkich liści i wysokie kłosy rurkowatych dzwonków z ciemnymi
    // plamkami w środku; u góry kłosa zielone pąki.
    foxglove(item, x, top, s, stage, time) {
      const { color, accent } = item;
      begin(accent);
      for (let index = 0; index < 4 + stage; index += 1) {
        const share = index / (3 + stage) - 0.5;
        leafPath(x, top, (6 + stage * 1.2) * s, (4.2 + stage * 0.3) * s, share * 2.8);
      }
      context.fill();
      const spikes = 1 + Math.floor(stage / 2);
      for (let spike = 0; spike < spikes; spike += 1) {
        const share = spikes > 1 ? spike / (spikes - 1) - 0.5 : 0;
        const height = (18 + stage * 5) * s * (1 - Math.abs(share) * 0.3);
        const bx = x + share * 8 * s;
        const tx = bx + sway(time, x, spike) * height * 0.4;
        line(bx, top - 1 * s, tx, top - height, shade(accent, -0.15), 1 * s);
        // Dzwonki, ich jasne gardziele i ciemne plamki — każde w jednym wypełnieniu.
        const bells = [];
        for (let index = 0; index < 4 + stage; index += 1) {
          const t = 0.3 + (index / (4 + stage)) * 0.6;
          const side = index % 2 ? 1 : -1;
          const px = bx + (tx - bx) * t + side * 0.6 * s;
          const py = top - height * t;
          const size = (3.8 + stage * 0.45) * s * (1 - t * 0.45);
          const angle = side * 0.55;
          // Gardziel: na osi dzwonka, 1,3 rozmiaru od nasady (dzwonek zwisa — oś obrócona o π).
          bells.push({
            px,
            py,
            size,
            angle,
            mx: px - Math.sin(angle) * size * 1.3,
            my: py + Math.cos(angle) * size * 1.3,
          });
        }
        begin(color);
        for (const bell of bells) bellPath(bell.px, bell.py, bell.size * 0.9, bell.size * 1.5, bell.angle);
        context.fill();
        begin(shade(color, 0.5));
        for (const bell of bells) ellipsePath(bell.mx, bell.my, bell.size * 0.3, bell.size * 0.16, bell.angle);
        context.fill();
        begin(shade(color, -0.45));
        for (const { mx, my, size } of bells) {
          circlePath(mx - size * 0.1, my - size * 0.02, Math.max(0.4, size * 0.06));
          circlePath(mx + size * 0.12, my + size * 0.04, Math.max(0.4, size * 0.05));
        }
        context.fill();
        begin(shade(accent, 0.2));
        for (let bud = 0; bud < 3; bud += 1) {
          circlePath(tx + (bud % 2 ? 0.6 : -0.6) * s, top - height - bud * 1.5 * s + 2 * s, (1.1 - bud * 0.25) * s);
        }
        context.fill();
      }
    },

    // Tęczowy tulipan: szerokie liście i tulipany, w których każdy płatek ma inny kolor tęczy; przy 5. etapie
    // migoczą iskierki.
    rainbowTulip(item, x, top, s, stage, time) {
      const { accent } = item;
      begin(accent);
      for (let index = 0; index < 2 + Math.floor(stage / 2); index += 1) {
        const side = index % 2 ? 1 : -1;
        leafPath(
          x + side * 1 * s,
          top,
          (9 + stage * 2) * s,
          (4 + stage * 0.4) * s,
          side * (0.32 + Math.floor(index / 2) * 0.25),
        );
      }
      context.fill();
      const tulips = [
        { dx: 0, height: (14 + stage * 4) * s },
        { dx: -(6 + stage) * s, height: (11 + stage * 3) * s },
        { dx: (6 + stage) * s, height: (10 + stage * 2.8) * s },
      ].slice(0, 1 + Math.floor(stage / 2));
      for (const [index, tulip] of [...tulips.entries()].reverse()) {
        const fx = x + tulip.dx + sway(time, x, index) * 6 * s;
        const fy = top - tulip.height;
        curve(
          x + tulip.dx * 0.2,
          top,
          x + tulip.dx * 0.7,
          top - tulip.height * 0.5,
          fx,
          fy,
          shade(accent, -0.1),
          1.1 * s,
        );
        const size = (5.4 + stage * 0.8) * s;
        const colors = [0, 1, 2].map((petal) => RAINBOW[(index * 2 + petal) % RAINBOW.length]);
        for (const [petal, angle, scaleX] of [
          [0, 0, 0.62],
          [1, -0.32, 0.55],
          [2, 0.32, 0.55],
        ]) {
          context.fillStyle = colors[petal];
          context.beginPath();
          leafPath(fx, fy + size * 0.15, size * 1.15, size * scaleX * 1.6, angle);
          context.fill();
        }
        context.fillStyle = "rgba(255, 255, 255, 0.35)";
        context.beginPath();
        leafPath(fx - size * 0.15, fy, size * 0.8, size * 0.3, -0.1);
        context.fill();
      }
      if (stage >= 5) {
        for (let index = 0; index < 4; index += 1) {
          const [px, py] = spiralPoint(index, 4, 12 * s, 6 * s);
          sparkle(x + px, top - tulips[0].height + py, 1.4 * s, "#ffffff", time, index * 1.6);
        }
      }
    },

    // Chmurnik: cienkie, falujące łodyżki zakończone puszystymi chmurkami (unoszą się i opadają); od 3. etapu
    // z chmurki pada deszczyk do doniczki, przy 5. nad nią mała tęcza.
    cloud(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const clouds = [
        { dx: 0, height: (15 + stage * 4) * s, size: (4 + stage * 0.8) * s },
        { dx: -(7 + stage * 1.4) * s, height: (10 + stage * 3) * s, size: (3 + stage * 0.55) * s },
        { dx: (7 + stage * 1.4) * s, height: (8 + stage * 2.5) * s, size: (2.8 + stage * 0.5) * s },
      ].slice(0, 1 + Math.floor(stage / 2));
      const positions = clouds.map((puff, index) => {
        const bob = Math.sin(time * 1.2 + index * 1.7) * 1.5 * s;
        return [x + puff.dx + Math.sin(time * 0.7 + index) * 1.5 * s, top - puff.height + bob];
      });
      stroke(accent, 0.8 * s);
      context.beginPath();
      for (const [index, [cx, cy]] of positions.entries()) {
        const baseX = x + clouds[index].dx * 0.25;
        context.moveTo(baseX, top);
        context.bezierCurveTo(baseX - 3 * s, top - (top - cy) * 0.35, cx + 3 * s, top - (top - cy) * 0.65, cx, cy);
      }
      context.stroke();
      if (stage >= 5) {
        const [cx, cy] = positions[0];
        const size = clouds[0].size;
        for (const [index, arcColor] of ["#ff6b6b", "#ffd43b", "#69db7c", "#4dabf7"].entries()) {
          stroke(arcColor, 0.8 * s);
          context.beginPath();
          context.arc(cx + size * 1.6, cy + size * 0.2, size * (1.5 - index * 0.2), Math.PI, TAU);
          context.stroke();
        }
      }
      if (stage >= 3) {
        const [cx, cy] = positions[0];
        const size = clouds[0].size;
        stroke("#6fc3ff", 0.7 * s);
        context.beginPath();
        for (let drop = 0; drop < 4; drop += 1) {
          const fall = (time * 18 * s + drop * 7 * s) % Math.max(1, top - cy - size * 0.5);
          const dx = cx + (drop - 1.5) * size * 0.45;
          context.moveTo(dx, cy + size * 0.5 + fall);
          context.lineTo(dx - 0.4 * s, cy + size * 0.5 + fall + 1.6 * s);
        }
        context.stroke();
      }
      for (const [layer, puffColor, lift] of [
        [1, color, 0],
        [0.8, "#ffffff", 0.35],
      ]) {
        begin(puffColor);
        for (const [index, [cx, cy]] of positions.entries()) {
          const size = clouds[index].size * layer;
          const up = lift * clouds[index].size;
          circlePath(cx, cy - size * 0.35 - up, size * 0.75);
          circlePath(cx - size * 0.75, cy - up * 0.6, size * 0.55);
          circlePath(cx + size * 0.75, cy - up * 0.6, size * 0.6);
          ellipsePath(cx, cy + size * 0.12 - up * 0.4, size * 1.25, size * 0.42);
        }
        context.fill();
      }
    },

    // Sowi storczyk: storczyk, którego kwiaty wyglądają jak sowie głowy — uszka z płatków, okrągłe oczy (mrugają
    // i rozglądają się), dziobek i jasny „brzuszek”; z etapem przybywa sówek na pędzie.
    owlOrchid(item, x, top, s, stage, time) {
      const { color, accent } = item;
      begin(accent);
      for (let index = 0; index < 2 + Math.floor(stage / 2); index += 1) {
        const side = index % 2 ? 1 : -1;
        leafPath(
          x,
          top - 0.5 * s,
          (8 + stage * 1.6) * s,
          (6.4 + stage * 0.5) * s,
          side * (1.2 - 0.2 * Math.floor(index / 2)),
        );
      }
      context.fill();
      const height = (17 + stage * 4.5) * s;
      const lean = sway(time, x) * 8 * s;
      const p0 = [x, top - 1 * s];
      const p1 = [x + 1 * s, top - height * 1.2];
      const p2 = [x - (10 + stage * 3) * s + lean, top - height * 0.6];
      curve(...p0, ...p1, ...p2, "#6b7a3a", 1 * s);
      const owls = 1 + Math.floor(stage / 2);
      const look = Math.sin(time * 0.9 + x);
      for (let index = 0; index < owls; index += 1) {
        const point = onCurve(p0, p1, p2, owls > 1 ? 0.5 + (index / (owls - 1)) * 0.5 : 0.75);
        const r = (3.6 + stage * 0.35) * s * (1 - index * 0.08);
        const fx = point.x;
        const fy = point.y + r * 1.2;
        context.fillStyle = shade(color, -0.12);
        context.beginPath();
        leafPath(fx - r * 0.55, fy - r * 0.55, r * 1.1, r * 0.55, -0.5);
        leafPath(fx + r * 0.55, fy - r * 0.55, r * 1.1, r * 0.55, 0.5);
        context.fill();
        context.fillStyle = shade(color, 0.3);
        ellipse(fx, fy + r * 0.85, r * 0.6, r * 0.7);
        context.fillStyle = color;
        ellipse(fx, fy, r * 1.05, r * 0.9);
        context.fillStyle = shade(color, 0.55);
        circle(fx - r * 0.45, fy, r * 0.5);
        circle(fx + r * 0.45, fy, r * 0.5);
        const closed = blinking(time, index * 0.9 + x * 0.01);
        eye(fx - r * 0.45, fy, r * 0.36, look, closed, "#ffd24a");
        eye(fx + r * 0.45, fy, r * 0.36, look, closed, "#ffd24a");
        context.fillStyle = "#f0a030";
        context.beginPath();
        polygonPath([
          [fx - r * 0.14, fy + r * 0.3],
          [fx + r * 0.14, fy + r * 0.3],
          [fx, fy + r * 0.62],
        ]);
        context.fill();
      }
    },

    // Feniksowy kwiat: wysoka łodyga, a na niej kwiat jak rozpostarte skrzydła feniksa — pióra w trzech kolorach
    // ognia (machają), grzebień z płomyczków, od 4. etapu ogon z długich piór; poświata i iskry.
    phoenix(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const leafColor = "#7a3a2a";
      begin(leafColor);
      for (let index = 0; index < 2 + Math.floor(stage / 2); index += 1) {
        const side = index % 2 ? 1 : -1;
        leafPath(x, top, (7 + stage * 1.6) * s, 2.2 * s, side * (0.45 + Math.floor(index / 2) * 0.35));
      }
      context.fill();
      const height = (17 + stage * 5) * s;
      const fx = x + sway(time, x) * 6 * s;
      const fy = top - height;
      curve(x, top, x - 2 * s, top - height * 0.5, fx, fy, shade(accent, -0.35), 1.3 * s);
      const pulse = 0.5 + 0.5 * Math.sin(time * 3);
      halo(fx, fy - 2 * s, (10 + stage * 2.4) * s, accent, 0.4 + 0.15 * pulse);
      if (stage >= 4) {
        begin(color);
        for (let feather = 0; feather < stage - 2; feather += 1) {
          const angle = Math.PI + (feather - (stage - 3) / 2) * 0.35 + Math.sin(time * 1.5 + feather) * 0.08;
          featherPath(fx, fy + 1 * s, (8 + stage * 1.6) * s, 0.22, angle, feather % 2 ? 0.25 : -0.25);
        }
        context.fill();
      }
      const flap = Math.sin(time * 2) * 0.12;
      const feathers = 3 + Math.floor(stage / 2);
      for (const [layer, featherColor] of [
        [1, color],
        [0.75, "#ff8a2e"],
        [0.5, accent],
      ]) {
        begin(featherColor);
        for (const side of [-1, 1]) {
          for (let feather = 0; feather < feathers; feather += 1) {
            const angle = side * (0.45 + (feather / Math.max(1, feathers - 1)) * 1.05 + flap);
            featherPath(fx, fy, (7 + stage * 1.7) * s * layer, 0.2, angle, side * 0.3);
          }
        }
        context.fill();
      }
      begin(accent);
      for (let index = 0; index < 3; index += 1) {
        const flicker = 0.85 + 0.15 * Math.sin(time * 8 + index * 2);
        leafPath(fx, fy - 1 * s, (3.4 + stage * 0.4) * s * flicker, 1.4 * s, (index - 1) * 0.35);
      }
      context.fill();
      context.fillStyle = "#fffbe0";
      circle(fx, fy, (1.2 + stage * 0.15) * s);
      for (let ember = 0; ember < 2 + stage; ember += 1) {
        const range = (16 + stage * 2) * s;
        const rise = (time * 12 * s + ember * 7 * s) % range;
        context.globalAlpha = 1 - rise / range;
        context.fillStyle = ember % 2 ? accent : color;
        circle(fx + Math.sin(time * 2 + ember * 1.9) * 7 * s, fy - 4 * s - rise, 0.7 * s);
      }
      context.globalAlpha = 1;
    },

    // Drzewo życia: korzenie oplatające doniczkę, pień z dwóch splecionych pasm, okrągła, jasna korona z listkami,
    // od 3. etapu złote owoce, a z korony unoszą się świecące duszki-kulki.
    lifeTree(item, x, top, s, stage, time) {
      const { color, accent } = item;
      const height = (11 + stage * 3.4) * s;
      const crownY = top - height - (6 + stage) * s;
      const rx = (9 + stage * 2.1) * s;
      const ry = (7.5 + stage * 1.5) * s;
      stroke(shade(accent, -0.15), 1.1 * s);
      context.beginPath();
      for (let root = 0; root < 2 + stage; root += 1) {
        const side = root % 2 ? 1 : -1;
        const reach = (5 + Math.floor(root / 2) * 3 + stage) * s;
        context.moveTo(x, top - 1 * s);
        context.quadraticCurveTo(x + side * reach * 0.6, top - 1.8 * s, x + side * reach, top + (2 + (root % 3)) * s);
      }
      context.stroke();
      halo(x, crownY, rx * 1.7, color, 0.3);
      for (const [index, strand] of [shade(accent, -0.2), accent].entries()) {
        const side = index ? 1 : -1;
        stroke(strand, (2 + stage * 0.35) * s);
        context.beginPath();
        context.moveTo(x - side * 1.5 * s, top);
        context.bezierCurveTo(
          x + side * 4 * s,
          top - height * 0.35,
          x - side * 4 * s,
          top - height * 0.7,
          x + side * 1 * s,
          crownY + ry * 0.4,
        );
        context.stroke();
      }
      begin(shade(color, -0.35));
      ellipsePath(x, crownY + 1 * s, rx, ry);
      ellipsePath(x - rx * 0.55, crownY + ry * 0.3, rx * 0.5, ry * 0.55);
      ellipsePath(x + rx * 0.55, crownY + ry * 0.3, rx * 0.5, ry * 0.55);
      context.fill();
      const count = 18 + stage * 6;
      for (const [tone, toneColor] of [shade(color, -0.15), color, shade(color, 0.4)].entries()) {
        begin(toneColor);
        for (let index = tone; index < count; index += 3) {
          const [lx, ly] = spiralPoint(index, count, rx * 0.95, ry * 0.9);
          ellipsePath(
            x + lx,
            crownY + ly,
            (2.2 + stage * 0.25) * s,
            (1.4 + stage * 0.15) * s,
            index * 0.9 + sway(time, x, index) * 3,
          );
        }
        context.fill();
      }
      if (stage >= 3) {
        for (let fruit = 0; fruit < stage; fruit += 1) {
          const [px, py] = spiralPoint(fruit * 4 + 2, stage * 4, rx * 0.8, ry * 0.75);
          berry(x + px, crownY + py + 1 * s, (1.3 + stage * 0.12) * s, accent, shade(color, -0.3));
        }
      }
      for (let orb = 0; orb < 2 + stage; orb += 1) {
        const range = (14 + stage * 3) * s;
        const rise = (time * 6 * s + orb * range * 0.37) % range;
        const alpha = Math.sin((rise / range) * Math.PI);
        const ox = x + Math.sin(time * 1.1 + orb * 2.3) * rx * 0.9;
        const oy = crownY - ry * 0.4 - rise;
        halo(ox, oy, 2.6 * s, "#f6ffe0", 0.7 * alpha);
        context.globalAlpha = alpha;
        context.fillStyle = "#ffffff";
        circle(ox, oy, 0.7 * s);
        context.globalAlpha = 1;
      }
    },
  };
}
