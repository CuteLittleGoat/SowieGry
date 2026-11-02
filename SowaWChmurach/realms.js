// Sowa w Chmurach — krainy ponad Kosmosem (uwaga C2, 2026-11-01): Mgławica, siedem krain inspirowanych mitologiami
// świata (nordycka, egipska, grecka, japońska, aztecka, chińska, hinduska) i Sowie Zaświaty. Z mitologii bierzemy
// krajobrazy, budowle i symbole (tęczowy most, piramidy i łódź słońca, świątynia na obłokach, brama torii, schodkowa
// piramida i nagietki, pagoda i chmurny smok, lotos i mandala) — bez wizerunków bóstw. Sowie Zaświaty są
// „straszno-zabawne”: duszki-sówki, świeczki, nietoperze, gołe drzewa, księżyc. Rysowane kodem w pikselach ekranu
// z paralaksą i przezroczystością (platformy, liście i przeszkody zawsze czytelne). Każda funkcja:
// (context, layout, bottom, time, alpha) — `bottom` to dolna krawędź widoku (m), `layout.scale` — piksele na metr.
import { COLORS } from "../shared/world/tokens.js";

function hash(value) {
  const x = Math.sin(value * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

// Reszta z dzielenia zawsze nieujemna (warstwy powtarzane co `period`).
const wrap = (value, period) => ((value % period) + period) % period;

// Pozycja pionowa elementu powtarzanego co `span` z paralaksą `rate` (ułamek ruchu kamery). Co 1,6 wysokości ekranu:
// znak rozpoznawczy krainy (piramidy, świątynia, brama…) jest na ekranie przez większość lotu.
const layer = (layout, bottom, fraction, rate, span = layout.cssHeight * 1.6) =>
  wrap(fraction * layout.cssHeight + bottom * layout.scale * rate, span) - layout.cssHeight * 0.5;

function circle(context, x, y, radius) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

// Migoczące gwiazdki (paralaksa 0,1).
function twinkles(context, layout, bottom, time, alpha, { count = 24, rgb = "255, 255, 255", size = 1.6 } = {}) {
  const span = layout.cssHeight * 1.5;
  context.fillStyle = `rgb(${rgb})`;
  for (let index = 0; index < count; index += 1) {
    const x = hash(index * 4.1) * layout.cssWidth;
    const y = wrap(hash(index * 7.7) * span + bottom * layout.scale * 0.1, span) - layout.cssHeight * 0.25;
    const glow = 0.5 + 0.5 * Math.sin(time * (1 + hash(index) * 2) + index);
    context.globalAlpha = alpha * (0.25 + 0.6 * glow);
    circle(context, x, y, size * (0.6 + hash(index * 2.2)));
  }
}

// Miękki obłok z trzech elips.
function puff(context, x, y, size, color, opacity) {
  context.globalAlpha = opacity;
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(x, y, size, size * 0.42, 0, 0, Math.PI * 2);
  context.ellipse(x - size * 0.55, y + size * 0.1, size * 0.55, size * 0.32, 0, 0, Math.PI * 2);
  context.ellipse(x + size * 0.5, y - size * 0.12, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
  context.fill();
}

// Opadające drobiazgi (płatki, liście): `count` sztuk, kolor, rozmiar (m), prędkość opadania (ekrany na s).
function falling(context, layout, time, alpha, { count, color, size, speed, seed, shape = "petal" }) {
  const k = layout.scale;
  context.fillStyle = color;
  for (let index = 0; index < count; index += 1) {
    const phase = hash(index * 3.3 + seed);
    const y = wrap(
      phase * layout.cssHeight + time * speed * layout.cssHeight * (0.6 + phase),
      layout.cssHeight + 2 * k,
    );
    const x = hash(index * 5.9 + seed) * layout.cssWidth + Math.sin(time * 0.8 + index) * 0.6 * k;
    const angle = time * (0.6 + phase) + index;
    context.globalAlpha = alpha * (0.45 + 0.3 * phase);
    context.save();
    context.translate(x, y - k);
    context.rotate(angle);
    context.beginPath();
    if (shape === "petal") context.ellipse(0, 0, size * k, size * 0.55 * k, 0, 0, Math.PI * 2);
    else context.ellipse(0, 0, size * k, size * 0.3 * k, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}

// ---------- Mgławica ----------

export function nebula(context, layout, bottom, time, alpha) {
  const k = layout.scale;
  const clouds = [
    [0.2, 0.15, 3.2, "255, 120, 200"],
    [0.78, 0.55, 3.8, "150, 110, 255"],
    [0.35, 0.95, 3, "90, 210, 220"],
    [0.85, 1.35, 2.6, "255, 170, 120"],
  ];
  for (const [fx, fy, r, rgb] of clouds) {
    const x = fx * layout.cssWidth + Math.sin(time * 0.1 + fx * 6) * 0.3 * k;
    const y = layer(layout, bottom, fy, 0.12);
    const radius = r * k;
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${rgb}, 0.6)`);
    gradient.addColorStop(1, `rgba(${rgb}, 0)`);
    context.globalAlpha = alpha * 0.65;
    context.fillStyle = gradient;
    circle(context, x, y, radius);
  }
  twinkles(context, layout, bottom, time, alpha, { count: 30 });
}

// ---------- Kraina nordycka: zorza, tęczowy most i drzewo świata ----------

export function norse(context, layout, bottom, time, alpha) {
  const k = layout.scale;
  const width = layout.cssWidth;
  for (let band = 0; band < 2; band += 1) {
    const base = layout.cssHeight * (0.1 + band * 0.15);
    context.globalAlpha = alpha * 0.35;
    context.strokeStyle = band ? "#8cffc8" : "#5adcaa";
    context.lineWidth = (0.45 + band * 0.2) * k;
    context.beginPath();
    for (let x = -12; x <= width + 12; x += 12) {
      const y = base + Math.sin(x / (2.2 * k) + time * 0.4 + band * 2) * 0.5 * k;
      if (x === -12) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }
  // Tęczowy most — łuk przez ekran (paralaksa 0,2).
  const arc = layer(layout, bottom, 0.9, 0.2, layout.cssHeight * 2.4);
  ["#ff6f91", "#ff9d4d", "#f4c542", "#3fae6a", "#4d9de0", "#9b6ddb"].forEach((color, index) => {
    context.globalAlpha = alpha * 0.42;
    context.strokeStyle = color;
    context.lineWidth = 0.2 * k;
    context.beginPath();
    context.arc(width * 0.5, arc + 3 * k, 4.3 * k - index * 0.2 * k, Math.PI * 1.06, Math.PI * 1.94);
    context.stroke();
  });
  // Drzewo świata — sylwetka z koroną i korzeniami (paralaksa 0,3).
  const x = width * 0.86;
  const y = layer(layout, bottom, 0.65, 0.3, layout.cssHeight * 2.4);
  context.globalAlpha = alpha * 0.38;
  context.fillStyle = "#1c4a44";
  context.fillRect(x - 0.25 * k, y - 2.6 * k, 0.5 * k, 3 * k);
  for (const [dx, dy, r] of [
    [0, -3.3, 1.5],
    [-1.15, -2.7, 1],
    [1.15, -2.7, 1],
    [-0.6, -4, 0.9],
    [0.7, -4, 0.9],
  ]) {
    circle(context, x + dx * k, y + dy * k, r * k);
  }
  context.strokeStyle = "#1c4a44";
  context.lineWidth = 0.15 * k;
  for (const dx of [-0.8, -0.3, 0.3, 0.8]) {
    context.beginPath();
    context.moveTo(x, y + 0.3 * k);
    context.quadraticCurveTo(x + dx * k, y + 0.6 * k, x + dx * 1.6 * k, y + 1.2 * k);
    context.stroke();
  }
  twinkles(context, layout, bottom, time, alpha, { count: 16 });
}

// ---------- Kraina egipska: gwiezdna rzeka, piramidy na obłokach i łódź słońca ----------

export function egypt(context, layout, bottom, time, alpha) {
  const k = layout.scale;
  const width = layout.cssWidth;
  twinkles(context, layout, bottom, time, alpha, { count: 36, rgb: "255, 230, 160", size: 1.4 });
  const base = layer(layout, bottom, 0.85, 0.25);
  context.globalAlpha = alpha * 0.32;
  context.fillStyle = "#f6dfa8";
  context.fillRect(0, base, width, 0.3 * k);
  for (const [fx, size] of [
    [0.15, 2.2],
    [0.36, 1.5],
    [0.8, 2.6],
  ]) {
    const x = fx * width;
    const s = size * k;
    context.globalAlpha = alpha * 0.48;
    context.fillStyle = "#c9933a";
    context.beginPath();
    context.moveTo(x - s, base);
    context.lineTo(x, base - s * 1.1);
    context.lineTo(x + s, base);
    context.closePath();
    context.fill();
    context.fillStyle = "#e6b860";
    context.beginPath();
    context.moveTo(x, base - s * 1.1);
    context.lineTo(x + s, base);
    context.lineTo(x + s * 0.3, base);
    context.closePath();
    context.fill();
  }
  // Łódź słońca płynie w poprzek nieba.
  const bx = wrap(time * 0.45 * k, width + 6 * k) - 3 * k;
  const by = layer(layout, bottom, 0.3, 0.1);
  const sun = context.createRadialGradient(bx, by - 0.9 * k, 0, bx, by - 0.9 * k, 1.3 * k);
  sun.addColorStop(0, "rgba(255, 214, 90, 0.9)");
  sun.addColorStop(1, "rgba(255, 214, 90, 0)");
  context.globalAlpha = alpha * 0.6;
  context.fillStyle = sun;
  circle(context, bx, by - 0.9 * k, 1.3 * k);
  context.fillStyle = COLORS.zloto;
  circle(context, bx, by - 0.9 * k, 0.45 * k);
  context.fillStyle = "#7a4b1e";
  context.beginPath();
  context.moveTo(bx - 1.6 * k, by);
  context.quadraticCurveTo(bx, by + 0.9 * k, bx + 1.6 * k, by);
  context.lineTo(bx + 1.9 * k, by - 0.4 * k);
  context.quadraticCurveTo(bx, by + 0.3 * k, bx - 1.9 * k, by - 0.4 * k);
  context.closePath();
  context.fill();
}

// ---------- Kraina grecka: świątynia na obłokach i złote liście laurowe ----------

export function greek(context, layout, bottom, time, alpha) {
  const k = layout.scale;
  const width = layout.cssWidth;
  for (let index = 0; index < 3; index += 1) {
    const y = layer(layout, bottom, 0.3 + index * 0.55, 0.4);
    puff(context, hash(index * 2.7) * width, y, (2 + hash(index) * 1.2) * k, COLORS.bialy, alpha * 0.4);
  }
  const base = layer(layout, bottom, 0.75, 0.3);
  const x = width * 0.5;
  const span = 3.6 * k;
  puff(context, x, base + 0.2 * k, 2.8 * k, COLORS.bialy, alpha * 0.5);
  context.globalAlpha = alpha * 0.55;
  context.fillStyle = "#fffaf2";
  context.fillRect(x - span / 2 - 0.3 * k, base - 0.3 * k, span + 0.6 * k, 0.3 * k);
  for (let column = 0; column < 5; column += 1) {
    const cx = x - span / 2 + 0.2 * k + (column * (span - 0.4 * k)) / 4;
    context.fillRect(cx - 0.12 * k, base - 2.2 * k, 0.24 * k, 1.9 * k);
  }
  context.fillRect(x - span / 2 - 0.2 * k, base - 2.5 * k, span + 0.4 * k, 0.3 * k);
  context.beginPath();
  context.moveTo(x - span / 2 - 0.3 * k, base - 2.5 * k);
  context.lineTo(x, base - 3.3 * k);
  context.lineTo(x + span / 2 + 0.3 * k, base - 2.5 * k);
  context.closePath();
  context.fill();
  falling(context, layout, time, alpha, {
    count: 10,
    color: COLORS.zloto,
    size: 0.22,
    speed: 0.04,
    seed: 11,
    shape: "leaf",
  });
}

// ---------- Kraina japońska: góra ze śnieżnym szczytem, brama torii, lampiony i płatki sakury ----------

export function japan(context, layout, bottom, time, alpha) {
  const k = layout.scale;
  const width = layout.cssWidth;
  // Daleka góra (paralaksa 0,1).
  const mountain = layer(layout, bottom, 1, 0.1, layout.cssHeight * 3);
  context.globalAlpha = alpha * 0.3;
  context.fillStyle = "#6c5b9a";
  context.beginPath();
  context.moveTo(width * 0.45, mountain);
  context.lineTo(width * 0.75, mountain - 3.4 * k);
  context.lineTo(width * 1.05, mountain);
  context.closePath();
  context.fill();
  context.fillStyle = COLORS.bialy;
  context.beginPath();
  context.moveTo(width * 0.75, mountain - 3.4 * k);
  context.lineTo(width * 0.69, mountain - 2.6 * k);
  context.lineTo(width * 0.81, mountain - 2.6 * k);
  context.closePath();
  context.fill();
  // Brama torii na obłoku (paralaksa 0,3).
  const base = layer(layout, bottom, 0.8, 0.3);
  const x = width * 0.26;
  puff(context, x, base + 0.2 * k, 2.4 * k, COLORS.bialy, alpha * 0.4);
  context.globalAlpha = alpha * 0.6;
  context.fillStyle = "#e0453a";
  context.fillRect(x - 1.3 * k, base - 2.6 * k, 0.22 * k, 2.6 * k);
  context.fillRect(x + 1.08 * k, base - 2.6 * k, 0.22 * k, 2.6 * k);
  context.fillRect(x - 1.5 * k, base - 2.1 * k, 3 * k, 0.16 * k);
  context.beginPath();
  context.moveTo(x - 1.9 * k, base - 2.8 * k);
  context.quadraticCurveTo(x, base - 2.55 * k, x + 1.9 * k, base - 2.8 * k);
  context.lineTo(x + 1.8 * k, base - 2.48 * k);
  context.quadraticCurveTo(x, base - 2.3 * k, x - 1.8 * k, base - 2.48 * k);
  context.closePath();
  context.fill();
  // Lampiony kołyszą się po prawej.
  for (let index = 0; index < 3; index += 1) {
    const lx = width * (0.62 + index * 0.13);
    const ly = layer(layout, bottom, 0.25 + index * 0.18, 0.35) + Math.sin(time + index) * 0.1 * k;
    context.globalAlpha = alpha * 0.55;
    context.fillStyle = "#ffcf6e";
    context.beginPath();
    context.ellipse(lx, ly, 0.32 * k, 0.42 * k, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#e0453a";
    context.fillRect(lx - 0.18 * k, ly - 0.5 * k, 0.36 * k, 0.1 * k);
    context.fillRect(lx - 0.18 * k, ly + 0.4 * k, 0.36 * k, 0.1 * k);
  }
  falling(context, layout, time, alpha, { count: 18, color: "#ffc0d6", size: 0.16, speed: 0.05, seed: 3 });
}

// ---------- Kraina aztecka: tarcza słońca, schodkowa piramida i płatki nagietków ----------

export function aztec(context, layout, bottom, time, alpha) {
  const k = layout.scale;
  const width = layout.cssWidth;
  const sx = width * 0.72;
  const sy = layer(layout, bottom, 0.25, 0.12);
  context.globalAlpha = alpha * 0.45;
  context.strokeStyle = COLORS.zloto;
  context.lineWidth = 0.12 * k;
  for (const r of [0.6, 1.1, 1.6]) {
    context.beginPath();
    context.arc(sx, sy, r * k, 0, Math.PI * 2);
    context.stroke();
  }
  for (let ray = 0; ray < 16; ray += 1) {
    const angle = (ray / 16) * Math.PI * 2 + time * 0.05;
    context.beginPath();
    context.moveTo(sx + Math.cos(angle) * 1.7 * k, sy + Math.sin(angle) * 1.7 * k);
    context.lineTo(sx + Math.cos(angle) * 2.2 * k, sy + Math.sin(angle) * 2.2 * k);
    context.stroke();
  }
  // Schodkowa piramida ze świątynią (paralaksa 0,3).
  const base = layer(layout, bottom, 0.85, 0.3);
  const x = width * 0.28;
  context.globalAlpha = alpha * 0.5;
  context.fillStyle = "#8a4b2a";
  for (let step = 0; step < 5; step += 1) {
    const w = (3.6 - step * 0.62) * k;
    context.fillRect(x - w / 2, base - (step + 1) * 0.45 * k, w, 0.45 * k);
  }
  context.fillStyle = "#c46a3a";
  context.fillRect(x - 0.45 * k, base - 3.05 * k, 0.9 * k, 0.8 * k);
  context.fillStyle = "#2a1410";
  context.fillRect(x - 0.15 * k, base - 2.75 * k, 0.3 * k, 0.5 * k);
  context.fillStyle = "#e3b24a";
  context.fillRect(x - 0.2 * k, base - 2.25 * k, 0.4 * k, 2.25 * k);
  falling(context, layout, time, alpha, { count: 16, color: "#ff9d2e", size: 0.17, speed: 0.045, seed: 7 });
}

// ---------- Kraina chińska: pagoda, czerwone lampiony i chmurny smok ----------

export function chinese(context, layout, bottom, time, alpha) {
  const k = layout.scale;
  const width = layout.cssWidth;
  // Chmurny smok — długie, falujące ciało z kółek (paralaksa 0,15), płynie w poprzek.
  const head = wrap(time * 0.5 * k, width + 12 * k) - 6 * k;
  const dy = layer(layout, bottom, 0.35, 0.15);
  for (let part = 14; part >= 0; part -= 1) {
    const x = head - part * 0.45 * k;
    const y = dy + Math.sin(part * 0.7 - time * 2) * 0.45 * k;
    context.globalAlpha = alpha * (0.35 + (0.25 * (14 - part)) / 14);
    context.fillStyle = part % 3 ? "#5fbf9a" : COLORS.zloto;
    circle(context, x, y, (0.42 - part * 0.015) * k);
  }
  context.fillStyle = "#e0453a";
  circle(context, head + 0.35 * k, dy - 0.05 * k, 0.12 * k);
  // Pagoda na obłoku (paralaksa 0,3).
  const base = layer(layout, bottom, 0.85, 0.3);
  const x = width * 0.74;
  puff(context, x, base + 0.2 * k, 2.4 * k, COLORS.bialy, alpha * 0.35);
  for (let floor = 0; floor < 3; floor += 1) {
    const y = base - floor * 1.05 * k;
    const w = (2.2 - floor * 0.45) * k;
    context.globalAlpha = alpha * 0.55;
    context.fillStyle = "#c0392b";
    context.fillRect(x - w / 2 + 0.25 * k, y - 0.8 * k, w - 0.5 * k, 0.8 * k);
    context.fillStyle = "#2f6f5e";
    context.beginPath();
    context.moveTo(x - w / 2 - 0.35 * k, y - 0.75 * k);
    context.quadraticCurveTo(x, y - 1.15 * k, x + w / 2 + 0.35 * k, y - 0.75 * k);
    context.lineTo(x + w / 2, y - 1.05 * k);
    context.lineTo(x - w / 2, y - 1.05 * k);
    context.closePath();
    context.fill();
  }
  for (let index = 0; index < 3; index += 1) {
    const lx = width * (0.12 + index * 0.14);
    const ly = layer(layout, bottom, 0.6 + index * 0.12, 0.35) + Math.sin(time * 0.8 + index) * 0.1 * k;
    context.globalAlpha = alpha * 0.6;
    context.fillStyle = "#e8463a";
    context.beginPath();
    context.ellipse(lx, ly, 0.36 * k, 0.3 * k, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = COLORS.zloto;
    context.fillRect(lx - 0.03 * k, ly + 0.3 * k, 0.06 * k, 0.35 * k);
  }
}

// ---------- Kraina hinduska: góra ze złotym szczytem, mandala, lotosy i lampki ----------

export function hindu(context, layout, bottom, time, alpha) {
  const k = layout.scale;
  const width = layout.cssWidth;
  // Mandala — obracające się koła płatków (paralaksa 0,1).
  const mx = width * 0.5;
  const my = layer(layout, bottom, 0.3, 0.1);
  context.globalAlpha = alpha * 0.32;
  context.fillStyle = "#ffcf6e";
  for (const [ring, count, size] of [
    [1.4, 12, 0.35],
    [2.1, 16, 0.3],
  ]) {
    for (let petal = 0; petal < count; petal += 1) {
      const angle = (petal / count) * Math.PI * 2 + time * 0.08 * (ring > 1.5 ? -1 : 1);
      context.save();
      context.translate(mx + Math.cos(angle) * ring * k, my + Math.sin(angle) * ring * k);
      context.rotate(angle);
      context.beginPath();
      context.ellipse(0, 0, size * k, size * 0.45 * k, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
  }
  circle(context, mx, my, 0.6 * k);
  // Góra ze złotym szczytem (paralaksa 0,2).
  const peak = layer(layout, bottom, 1.05, 0.2, layout.cssHeight * 2.6);
  context.globalAlpha = alpha * 0.32;
  context.fillStyle = "#5a3f8a";
  context.beginPath();
  context.moveTo(width * 0.05, peak);
  context.lineTo(width * 0.22, peak - 3 * k);
  context.lineTo(width * 0.4, peak);
  context.closePath();
  context.fill();
  context.fillStyle = COLORS.zloto;
  circle(context, width * 0.22, peak - 3 * k, 0.25 * k);
  // Lotosy na obłokach i lampki z płomykami (paralaksa 0,35).
  for (let index = 0; index < 4; index += 1) {
    const x = width * (0.15 + index * 0.24);
    const y = layer(layout, bottom, 0.55 + index * 0.33, 0.35);
    context.globalAlpha = alpha * 0.5;
    context.fillStyle = "#ff9fc4";
    for (const angle of [-0.9, -0.45, 0, 0.45, 0.9]) {
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.beginPath();
      context.ellipse(0, -0.35 * k, 0.16 * k, 0.4 * k, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
    context.fillStyle = "#c8814a";
    context.beginPath();
    context.ellipse(x + 0.9 * k, y + 0.1 * k, 0.28 * k, 0.12 * k, 0, 0, Math.PI);
    context.fill();
    const flicker = 0.85 + 0.15 * Math.sin(time * 9 + index * 2);
    context.fillStyle = "#ffd25a";
    context.beginPath();
    context.ellipse(x + 0.9 * k, y - 0.12 * k, 0.07 * k, 0.17 * k * flicker, 0, 0, Math.PI * 2);
    context.fill();
  }
}

// ---------- Sowie Zaświaty: księżyc, nietoperze, duszki-sówki, świeczki i gołe drzewa ----------

export function owlAfterlife(context, layout, bottom, time, alpha) {
  const k = layout.scale;
  const width = layout.cssWidth;
  // Księżyc z poświatą (prawie nieruchomy).
  const mx = width * 0.78;
  const my = layout.cssHeight * 0.16;
  const glow = context.createRadialGradient(mx, my, 0, mx, my, 2.4 * k);
  glow.addColorStop(0, "rgba(220, 255, 210, 0.55)");
  glow.addColorStop(1, "rgba(220, 255, 210, 0)");
  context.globalAlpha = alpha;
  context.fillStyle = glow;
  circle(context, mx, my, 2.4 * k);
  context.globalAlpha = alpha * 0.85;
  context.fillStyle = "#e9ffd8";
  circle(context, mx, my, 1 * k);
  // Gołe, krzywe gałęzie przy krawędziach (paralaksa 0,5).
  context.strokeStyle = "#1a1226";
  context.lineCap = "round";
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? 0 : width;
    for (let index = 0; index < 2; index += 1) {
      const y0 = layer(layout, bottom, 0.3 + index * 0.9, 0.5);
      context.globalAlpha = alpha * 0.6;
      context.lineWidth = 0.18 * k;
      context.beginPath();
      context.moveTo(x0, y0);
      context.quadraticCurveTo(x0 - side * 1.2 * k, y0 - 0.6 * k, x0 - side * 2.2 * k, y0 - 0.2 * k);
      context.stroke();
      context.lineWidth = 0.09 * k;
      context.beginPath();
      context.moveTo(x0 - side * 1.3 * k, y0 - 0.45 * k);
      context.lineTo(x0 - side * 1.7 * k, y0 - 1.1 * k);
      context.moveTo(x0 - side * 1.8 * k, y0 - 0.3 * k);
      context.lineTo(x0 - side * 2.4 * k, y0 - 0.75 * k);
      context.stroke();
    }
  }
  // Nietoperze trzepoczą skrzydłami.
  context.fillStyle = "#1a1226";
  for (let index = 0; index < 4; index += 1) {
    const bx = wrap(hash(index * 3.1) * width + time * (0.6 + hash(index) * 0.5) * k, width + 2 * k) - k;
    const by = layer(layout, bottom, 0.1 + index * 0.22, 0.2) + Math.sin(time * 2 + index) * 0.3 * k;
    const flap = Math.sin(time * 12 + index * 2) * 0.25 * k;
    context.globalAlpha = alpha * 0.7;
    context.beginPath();
    context.moveTo(bx, by);
    context.quadraticCurveTo(bx - 0.35 * k, by - 0.3 * k - flap, bx - 0.7 * k, by - flap);
    context.quadraticCurveTo(bx - 0.35 * k, by + 0.05 * k, bx, by + 0.12 * k);
    context.quadraticCurveTo(bx + 0.35 * k, by + 0.05 * k, bx + 0.7 * k, by - flap);
    context.quadraticCurveTo(bx + 0.35 * k, by - 0.3 * k - flap, bx, by);
    context.fill();
  }
  // Duszki-sówki: białe, półprzezroczyste, z uszkami i wielkimi oczami; unoszą się i falują.
  for (let index = 0; index < 3; index += 1) {
    const gx = width * (0.2 + index * 0.3) + Math.sin(time * 0.7 + index * 2) * 0.5 * k;
    const gy = layer(layout, bottom, 0.45 + index * 0.4, 0.3) + Math.sin(time * 1.3 + index) * 0.25 * k;
    const s = (0.75 + hash(index * 9.1) * 0.3) * k;
    context.globalAlpha = alpha * 0.5;
    context.fillStyle = "#f4f2ff";
    context.beginPath();
    context.moveTo(gx - s, gy + s * 0.9);
    context.lineTo(gx - s, gy - s * 0.3);
    context.quadraticCurveTo(gx - s, gy - s * 1.2, gx - s * 0.55, gy - s * 1.15);
    context.lineTo(gx - s * 0.35, gy - s * 1.45);
    context.lineTo(gx - s * 0.15, gy - s * 1.15);
    context.quadraticCurveTo(gx, gy - s * 1.2, gx + s * 0.15, gy - s * 1.15);
    context.lineTo(gx + s * 0.35, gy - s * 1.45);
    context.lineTo(gx + s * 0.55, gy - s * 1.15);
    context.quadraticCurveTo(gx + s, gy - s * 1.2, gx + s, gy - s * 0.3);
    context.lineTo(gx + s, gy + s * 0.9);
    for (let wave = 4; wave >= 0; wave -= 1) {
      context.quadraticCurveTo(
        gx - s + (wave + 0.5) * 0.4 * s,
        gy + s * (wave % 2 ? 1.25 : 0.7),
        gx - s + wave * 0.4 * s,
        gy + s * 0.9,
      );
    }
    context.closePath();
    context.fill();
    context.globalAlpha = alpha * 0.75;
    context.fillStyle = "#2a1a3a";
    circle(context, gx - s * 0.38, gy - s * 0.4, s * 0.22);
    circle(context, gx + s * 0.38, gy - s * 0.4, s * 0.22);
    context.fillStyle = "#b8f5a0";
    circle(context, gx - s * 0.33, gy - s * 0.45, s * 0.07);
    circle(context, gx + s * 0.43, gy - s * 0.45, s * 0.07);
  }
  // Świeczki na obłoczkach mgły (paralaksa 0,4).
  for (let index = 0; index < 4; index += 1) {
    const cx = width * (0.1 + index * 0.27);
    const cy = layer(layout, bottom, 0.8 + index * 0.35, 0.4);
    puff(context, cx, cy + 0.25 * k, 0.9 * k, "#8a7aa8", alpha * 0.3);
    context.globalAlpha = alpha * 0.7;
    context.fillStyle = "#efe6d0";
    context.fillRect(cx - 0.1 * k, cy - 0.55 * k, 0.2 * k, 0.6 * k);
    const flicker = 0.8 + 0.2 * Math.sin(time * 11 + index * 3);
    context.fillStyle = "#9dff8a";
    context.beginPath();
    context.ellipse(cx, cy - 0.7 * k, 0.07 * k, 0.16 * k * flicker, 0, 0, Math.PI * 2);
    context.fill();
  }
}

/** Krainy według identyfikatora strefy (`ZONES[].id` w config.js). */
export const REALMS = Object.freeze({
  mglawica: nebula,
  nordycka: norse,
  egipska: egypt,
  grecka: greek,
  japonska: japan,
  aztecka: aztec,
  chinska: chinese,
  hinduska: hindu,
  zaswiaty: owlAfterlife,
});
