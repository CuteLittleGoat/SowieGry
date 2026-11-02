// Łącz i Hoduj — rysunki roślin (kształty na płótnie, bez obrazków): łańcuchy po 7 poziomów (Monstera, Pilea,
// Paproć, Kaktus, od P5.2 Storczyk, Słonecznik, Truskawka, Lotos i Baobab) i hybrydy; poziomy 6–7 (P5.1) mają kształt
// 5. poziomu w barwach diamentu i tęczy; kózki-wzmacniacze (obrazek kózki ze Sowiego Świata z chustką i znaczkiem
// mocy). Wspólne dla planszy (`render.js`) i kart zamówień sąsiadek (`main.js`).
import { COLORS, font } from "../shared/world/tokens.js";
import { CHAINS, CROSS_LEVEL, GOATS } from "./config.js";

// Barwy tęczy (7. poziom) i diamentu (6.).
const RAINBOW = Object.freeze(["#ff6f91", "#ff9d4d", "#f4c542", "#3fae6a", "#4d9de0", "#9b6ddb"]);
const DIAMOND = Object.freeze({ light: "#a8ecff", dark: "#5cc0e6", bloom: "#e9fbff" });
// Zielone liście nowych roślin (kolor łańcucha w `CHAINS` to barwa kwiatu — np. różowy storczyk).
const LEAF = Object.freeze({
  storczyk: "#4f9a5e",
  slonecznik: "#5ba760",
  truskawka: "#3fae6a",
  lotos: "#3fae6a",
  baobab: "#6a9a3a",
});
// Naturalny kolor kwiatów i owoców nowych roślin (od złotego poziomu — złoty, diament, tęcza).
const BLOOM = Object.freeze({
  storczyk: "#d96faf",
  slonecznik: "#f4c542",
  truskawka: "#e8505b",
  lotos: "#ff9fb2",
  baobab: "#8a5a3b",
});

// Kózka ze Sowiego Świata (assets/svg/kozki/koza.svg, 128 × 128) — wczytywana raz, przy pierwszym rysowaniu.
const GOAT_SVG = new URL("../assets/svg/kozki/koza.svg", import.meta.url).href;
// Chustka kózki (jak nakładki koza-<rodzaj>.svg) w układzie 128 × 128.
const SCARF = "M82 52 C90 62 98 67 107 68 L105 78 C101 79 98 81 96 83 L80 100 L73 66 Z";
let goatImage = null;
let scarfPath = null;

function goatPicture() {
  if (!goatImage && typeof Image !== "undefined") {
    goatImage = new Image();
    goatImage.src = GOAT_SVG;
  }
  return goatImage?.complete && goatImage.naturalWidth ? goatImage : null;
}

/**
 * createPlantPainter(context) → { item(target, cx, cy, s, time = 0, label = true) } — rysuje przedmiot
 * `{ chain, level }` w środku (cx, cy) na polu wielkości `s` (piksele płótna po bieżącej transformacji).
 */
export function createPlantPainter(context) {
  function roundRect(x, y, width, height, radius) {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.fill();
  }

  // Liść (elipsa) pod kątem `angle` od punktu (x, y) — z wycięciami monstery przy `holes`.
  function leaf(x, y, angle, length, width, color, holes = false) {
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.fillStyle = color;
    context.beginPath();
    context.ellipse(0, -length / 2, width, length / 2, 0, 0, Math.PI * 2);
    context.fill();
    if (holes) {
      context.fillStyle = "rgba(255, 255, 255, 0.55)";
      for (const at of [0.35, 0.6]) {
        context.beginPath();
        context.ellipse(width * 0.35, -length * at, width * 0.18, length * 0.06, 0, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.restore();
  }

  // Iskierki wokół przedmiotu najwyższego poziomu i hybryd.
  function sparkles(cx, cy, s, time) {
    context.fillStyle = COLORS.bialy;
    for (let index = 0; index < 3; index += 1) {
      const phase = time * 2 + index * 2.1;
      const r = s * 0.05 * (0.6 + 0.4 * Math.sin(phase));
      const sx = cx + Math.cos(index * 2.1) * s * 0.32;
      const sy = cy - s * 0.25 + Math.sin(index * 2.1) * s * 0.12;
      context.beginPath();
      context.moveTo(sx, sy - r * 2);
      context.lineTo(sx + r * 0.6, sy);
      context.lineTo(sx, sy + r * 2);
      context.lineTo(sx - r * 0.6, sy);
      context.fill();
    }
  }

  function stem(x0, y0, x1, y1, width, color) {
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
  }

  // Okrągły liść pilei („pieniążek”) z jaśniejszym środkiem.
  function coin(x, y, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "rgba(255, 255, 255, 0.35)";
    context.beginPath();
    context.arc(x, y, r * 0.25, 0, Math.PI * 2);
    context.fill();
  }

  // Liść paproci: łukowata łodyga z listkami po obu stronach.
  function frond(x, y, angle, length, color) {
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.strokeStyle = color;
    context.lineWidth = Math.max(1.5, length * 0.06);
    context.beginPath();
    context.moveTo(0, 0);
    context.quadraticCurveTo(length * 0.25, -length * 0.6, 0, -length);
    context.stroke();
    context.fillStyle = color;
    for (let step = 1; step <= 5; step += 1) {
      const u = step / 6;
      const px = length * 0.25 * 2 * u * (1 - u);
      const py = -length * u;
      const size = length * 0.13 * (1 - u * 0.5);
      for (const side of [-1, 1]) {
        context.beginPath();
        context.ellipse(px + side * size, py, size, size * 0.45, side * 0.5, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.restore();
  }

  function seedShape(chain, cx, bottom, s) {
    const [color, rx, ry] = {
      pilea: ["#c58f52", 0.1, 0.1],
      paproc: ["#7a9c5a", 0.07, 0.07],
      kaktus: ["#5b4a3a", 0.08, 0.11],
      storczyk: ["#d8c3a5", 0.06, 0.09],
      slonecznik: ["#3b2f4a", 0.07, 0.13],
      truskawka: ["#e8505b", 0.05, 0.05],
      lotos: ["#7a8a4a", 0.1, 0.1],
      baobab: ["#6b4a2b", 0.13, 0.09],
    }[chain] || ["#a0703f", 0.12, 0.16];
    context.fillStyle = color;
    if (chain === "paproc" || chain === "truskawka") {
      // Zarodniki: trzy kropki.
      for (const dx of [-0.1, 0, 0.1]) {
        context.beginPath();
        context.arc(cx + dx * s, bottom - s * (dx ? 0.1 : 0.16), rx * s, 0, Math.PI * 2);
        context.fill();
      }
      return;
    }
    context.beginPath();
    context.ellipse(cx, bottom - s * 0.12, s * rx, s * ry, 0.4, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "rgba(255, 255, 255, 0.5)";
    context.beginPath();
    context.ellipse(cx - s * 0.035, bottom - s * 0.16, s * 0.025, s * 0.04, 0.4, 0, Math.PI * 2);
    context.fill();
    if (chain === "slonecznik") {
      // Pestka w paski.
      context.strokeStyle = "rgba(255, 255, 255, 0.75)";
      context.lineWidth = Math.max(1, s * 0.012);
      for (const dx of [-0.025, 0.025]) {
        context.beginPath();
        context.moveTo(cx + dx * s, bottom - s * 0.22);
        context.lineTo(cx + dx * s + s * 0.02, bottom - s * 0.03);
        context.stroke();
      }
    }
  }

  function monsteraPlant(level, cx, bottom, s, sway, green, dark) {
    if (level === 2) {
      stem(cx, bottom - s * 0.06, cx, bottom - s * 0.36, Math.max(2, s * 0.05), dark);
      leaf(cx, bottom - s * 0.34, -0.9 + sway, s * 0.24, s * 0.08, green);
      leaf(cx, bottom - s * 0.34, 0.9 + sway, s * 0.24, s * 0.08, green);
      return;
    }
    const base = bottom - s * 0.24;
    const count = level === 3 ? 3 : 5;
    const length = s * (level === 3 ? 0.32 : 0.42);
    const width = s * (level === 3 ? 0.1 : 0.14);
    for (let index = 0; index < count; index += 1) {
      const angle = (index - (count - 1) / 2) * (level === 3 ? 0.6 : 0.5) + sway;
      leaf(cx, base, angle, length, width, index % 2 ? dark : green, level >= 4);
    }
  }

  // Pilea: okrągłe liście na cienkich ogonkach (2 → 3 → 6).
  function pileaPlant(level, cx, bottom, s, sway, green, dark) {
    const base = bottom - (level === 2 ? s * 0.06 : s * 0.24);
    const leaves =
      level === 2
        ? [
            [-0.12, 0.26, 0.08],
            [0.12, 0.3, 0.08],
          ]
        : level === 3
          ? [
              [-0.18, 0.3, 0.1],
              [0, 0.42, 0.11],
              [0.18, 0.3, 0.1],
            ]
          : [
              [-0.3, 0.28, 0.11],
              [-0.16, 0.44, 0.12],
              [0, 0.52, 0.13],
              [0.16, 0.44, 0.12],
              [0.3, 0.28, 0.11],
              [0, 0.3, 0.1],
            ];
    for (const [dx, up, r] of leaves) {
      const x = cx + (dx + sway * 0.4) * s;
      const y = base - up * s;
      stem(cx, base, x, y, Math.max(1, s * 0.025), dark);
      coin(x, y, r * s, green);
    }
  }

  // Paproć: pastorał (zwinięty pęd) → 3 → 5 liści pierzastych.
  function paprocPlant(level, cx, bottom, s, sway, green, dark) {
    if (level === 2) {
      context.strokeStyle = green;
      context.lineWidth = Math.max(2, s * 0.05);
      context.beginPath();
      context.moveTo(cx, bottom - s * 0.06);
      context.lineTo(cx, bottom - s * 0.3);
      context.arc(cx + s * 0.07, bottom - s * 0.3, s * 0.07, Math.PI, Math.PI * 2.6);
      context.stroke();
      return;
    }
    const base = bottom - s * 0.22;
    const count = level === 3 ? 3 : 5;
    for (let index = 0; index < count; index += 1) {
      const angle = (index - (count - 1) / 2) * 0.45 + sway;
      frond(cx, base, angle, s * (level === 3 ? 0.36 : 0.48), index % 2 ? dark : green);
    }
  }

  // Kaktus: kuleczka → kaktusik → kaktus z ramionami → kwitnący (różowy kwiat).
  function kaktusPlant(level, cx, bottom, s, green, dark) {
    const spines = (x, y, w, h) => {
      context.fillStyle = "rgba(255, 255, 255, 0.75)";
      for (let index = 0; index < 4; index += 1) {
        context.fillRect(
          x - w * 0.25 + (index % 2) * w * 0.5,
          y - h * (0.25 + index * 0.18),
          Math.max(1, s * 0.02),
          Math.max(1, s * 0.02),
        );
      }
    };
    if (level === 2) {
      context.fillStyle = green;
      context.beginPath();
      context.arc(cx, bottom - s * 0.13, s * 0.12, 0, Math.PI * 2);
      context.fill();
      spines(cx, bottom - s * 0.02, s * 0.2, s * 0.22);
      return;
    }
    const base = bottom - s * 0.24;
    const height = s * (level === 3 ? 0.3 : 0.44);
    const width = s * (level === 3 ? 0.16 : 0.2);
    context.fillStyle = green;
    roundRect(cx - width / 2, base - height, width, height + 2, width / 2);
    context.fillStyle = dark;
    context.fillRect(cx - 1, base - height + width / 2, 2, height - width / 2);
    if (level >= 4) {
      // Ramiona.
      context.fillStyle = green;
      roundRect(cx - width * 1.6, base - height * 0.62, width * 0.6, height * 0.36, width * 0.3);
      roundRect(cx - width * 1.2, base - height * 0.36, width * 0.8, width * 0.4, width * 0.2);
      roundRect(cx + width, base - height * 0.78, width * 0.6, height * 0.4, width * 0.3);
      roundRect(cx + width * 0.4, base - height * 0.48, width * 0.8, width * 0.4, width * 0.2);
    }
    spines(cx, base, width, height);
    if (level >= 5) {
      // Kwiat na czubku.
      context.fillStyle = COLORS.policzki;
      for (let petal = 0; petal < 5; petal += 1) {
        const angle = (petal / 5) * Math.PI * 2;
        context.beginPath();
        context.ellipse(
          cx + Math.cos(angle) * s * 0.06,
          base - height - s * 0.02 + Math.sin(angle) * s * 0.06,
          s * 0.05,
          s * 0.035,
          angle,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
      context.fillStyle = COLORS.zloto;
      context.beginPath();
      context.arc(cx, base - height - s * 0.02, s * 0.035, 0, Math.PI * 2);
      context.fill();
    }
  }

  // Hybrydy: Monpilea (liście monstery i pieniążki), Alopaproć (wachlarz paproci), Złotolistka (złote liście).
  function hybridPlant(chain, cx, bottom, s, sway) {
    const base = bottom - s * 0.24;
    if (chain === "monpilea") {
      for (const angle of [-0.55, 0, 0.55]) leaf(cx, base, angle + sway, s * 0.4, s * 0.13, COLORS.monstera, true);
      for (const dx of [-0.3, 0.3]) coin(cx + dx * s, base - s * 0.3, s * 0.1, "#72bd68");
    } else if (chain === "alopaproc") {
      for (let index = 0; index < 7; index += 1) {
        frond(cx, base, (index - 3) * 0.32 + sway, s * 0.46, index % 2 ? COLORS.monsteraCiemna : "#3fa976");
      }
    } else {
      // Złotolistka (z dwóch hybryd): złote paprociowe pióra z tyłu, złote liście monstery i pieniążki z przodu.
      for (let index = 0; index < 4; index += 1) {
        frond(cx, base, (index - 1.5) * 0.55 + sway, s * 0.48, COLORS.zlotoCiemne);
      }
      for (const angle of [-0.5, 0.5]) leaf(cx, base, angle + sway, s * 0.4, s * 0.14, COLORS.zloto, true);
      for (const dx of [-0.2, 0.2]) coin(cx + dx * s, base - s * 0.36, s * 0.09, COLORS.zloto);
      coin(cx, base - s * 0.44, s * 0.1, "#fff1b8");
    }
  }

  // ---------- Nowe rośliny (P5.2, uwaga L2): Storczyk, Słonecznik, Truskawka, Lotos, Baobab ----------

  // Kwiat z `count` płatków wokół środka (x, y): płatki — elipsy `r × r·0,55`, środek `center`.
  function blossom(x, y, r, count, petal, center) {
    context.fillStyle = petal;
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      context.beginPath();
      context.ellipse(
        x + Math.cos(angle) * r * 0.75,
        y + Math.sin(angle) * r * 0.75,
        r * 0.6,
        r * 0.33,
        angle,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
    context.fillStyle = center;
    context.beginPath();
    context.arc(x, y, r * 0.38, 0, Math.PI * 2);
    context.fill();
  }

  // Storczyk: szerokie liście u podstawy; korzonek (2), pąk (3), łukowaty pęd z kwiatami (4+).
  function storczykPlant(level, cx, bottom, s, sway, green, dark, bloom) {
    if (level === 2) {
      leaf(cx, bottom - s * 0.06, -1.1 + sway, s * 0.22, s * 0.09, green);
      leaf(cx, bottom - s * 0.06, 1.1 + sway, s * 0.22, s * 0.09, green);
      context.strokeStyle = "#a9b89a";
      context.lineWidth = Math.max(1.5, s * 0.03);
      context.beginPath();
      context.moveTo(cx, bottom - s * 0.08);
      context.quadraticCurveTo(cx + s * 0.18, bottom - s * 0.2, cx + s * 0.12, bottom - s * 0.02);
      context.stroke();
      return;
    }
    const base = bottom - s * 0.24;
    for (const angle of [-1.2, 1.2, -0.9, 0.9])
      leaf(cx, base, angle + sway, s * 0.28, s * 0.11, angle < 0 ? green : dark);
    context.strokeStyle = dark;
    context.lineWidth = Math.max(1.5, s * 0.025);
    context.beginPath();
    context.moveTo(cx, base);
    context.quadraticCurveTo(cx - s * 0.02, base - s * 0.5, cx + s * 0.22 + sway * s, base - s * 0.48);
    context.stroke();
    if (level === 3) {
      context.fillStyle = bloom;
      context.beginPath();
      context.ellipse(cx + s * 0.22 + sway * s, base - s * 0.46, s * 0.05, s * 0.07, 0.4, 0, Math.PI * 2);
      context.fill();
      return;
    }
    for (const [dx, dy, r] of [
      [0.02, 0.44, 0.1],
      [0.13, 0.5, 0.09],
      [0.23, 0.45, 0.08],
    ]) {
      blossom(cx + dx * s + sway * s, base - dy * s, r * s, 5, bloom, "#fff3c4");
    }
  }

  // Słonecznik: kiełek z liścieniami (2), młody z pąkiem (3), wysoki z kwiatem — żółte płatki i brązowy środek (4+).
  function slonecznikPlant(level, cx, bottom, s, sway, green, dark, bloom) {
    if (level === 2) {
      stem(cx, bottom - s * 0.04, cx, bottom - s * 0.3, Math.max(2, s * 0.04), dark);
      leaf(cx, bottom - s * 0.28, -1 + sway, s * 0.16, s * 0.08, green);
      leaf(cx, bottom - s * 0.28, 1 + sway, s * 0.16, s * 0.08, green);
      return;
    }
    const base = bottom - s * 0.24;
    const top = base - s * (level === 3 ? 0.36 : 0.46);
    stem(cx, base, cx + sway * s, top, Math.max(2, s * 0.045), dark);
    leaf(cx, base - s * 0.12, -1 + sway, s * 0.2, s * 0.09, green);
    leaf(cx, base - s * 0.2, 1 + sway, s * 0.2, s * 0.09, green);
    if (level === 3) {
      context.fillStyle = green;
      context.beginPath();
      context.arc(cx + sway * s, top, s * 0.07, 0, Math.PI * 2);
      context.fill();
      return;
    }
    blossom(cx + sway * s, top, s * 0.17, 12, bloom, "#7a4b1e");
  }

  // Truskawka: rozetka liści po trzy listki (2), białe kwiatki (3), czerwone owoce z pestkami (4+).
  function truskawkaPlant(level, cx, bottom, s, sway, green, dark, bloom) {
    const base = level === 2 ? bottom - s * 0.06 : bottom - s * 0.24;
    const spread = level === 2 ? 0.75 : 0.6;
    for (const angle of [-1, 0, 1]) {
      const tip = { x: cx + Math.sin(angle * spread + sway) * s * 0.22, y: base - Math.cos(angle * spread) * s * 0.24 };
      stem(cx, base, tip.x, tip.y, Math.max(1, s * 0.02), dark);
      for (const turn of [-0.7, 0, 0.7]) leaf(tip.x, tip.y, angle * spread + turn, s * 0.12, s * 0.06, green);
    }
    if (level === 2) return;
    if (level === 3) {
      for (const dx of [-0.22, 0.2]) blossom(cx + dx * s, base - s * 0.08, s * 0.06, 5, "#ffffff", "#f4c542");
      return;
    }
    for (const [dx, dy] of [
      [-0.24, 0.04],
      [0.22, 0.02],
      [0.02, -0.02],
    ]) {
      const x = cx + dx * s;
      const y = base + dy * s;
      context.fillStyle = bloom;
      context.beginPath();
      context.moveTo(x - s * 0.07, y - s * 0.05);
      context.quadraticCurveTo(x, y - s * 0.09, x + s * 0.07, y - s * 0.05);
      context.quadraticCurveTo(x + s * 0.05, y + s * 0.07, x, y + s * 0.1);
      context.quadraticCurveTo(x - s * 0.05, y + s * 0.07, x - s * 0.07, y - s * 0.05);
      context.fill();
      context.fillStyle = "rgba(255, 255, 255, 0.7)";
      for (const [px, py] of [
        [-0.025, -0.01],
        [0.025, -0.01],
        [0, 0.03],
      ]) {
        context.fillRect(x + px * s, y + py * s, Math.max(1, s * 0.012), Math.max(1, s * 0.012));
      }
      context.fillStyle = dark;
      context.beginPath();
      context.ellipse(x, y - s * 0.07, s * 0.05, s * 0.02, 0, 0, Math.PI * 2);
      context.fill();
    }
  }

  // Lotos: pływający okrągły liść (2), liście i pąk (3), otwarty kwiat ze środkiem (4+); woda w doniczce.
  function lotosPlant(level, cx, bottom, s, sway, green, dark, bloom) {
    const water = level === 2 ? bottom - s * 0.06 : bottom - s * 0.24;
    context.fillStyle = "rgba(92, 200, 232, 0.55)";
    context.beginPath();
    context.ellipse(cx, water, s * 0.24, s * 0.06, 0, 0, Math.PI * 2);
    context.fill();
    const pad = (x, y, r) => {
      context.fillStyle = green;
      context.beginPath();
      context.ellipse(x, y, r, r * 0.4, 0, 0.25, Math.PI * 2 - 0.25);
      context.lineTo(x, y);
      context.fill();
    };
    pad(cx - s * 0.08, water - s * 0.01, s * 0.12);
    if (level === 2) return;
    pad(cx + s * 0.14, water + s * 0.01, s * 0.09);
    stem(cx + s * 0.02, water, cx + s * 0.02 + sway * s, water - s * 0.2, Math.max(1.5, s * 0.025), dark);
    const fx = cx + s * 0.02 + sway * s;
    const fy = water - s * 0.22;
    context.fillStyle = bloom;
    if (level === 3) {
      context.beginPath();
      context.ellipse(fx, fy, s * 0.06, s * 0.09, 0, 0, Math.PI * 2);
      context.fill();
      return;
    }
    for (const angle of [-1.1, -0.55, 0, 0.55, 1.1]) {
      context.save();
      context.translate(fx, fy + s * 0.04);
      context.rotate(angle);
      context.beginPath();
      context.ellipse(0, -s * 0.08, s * 0.045, s * 0.1, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
    context.fillStyle = "#f4c542";
    context.beginPath();
    context.arc(fx, fy + s * 0.02, s * 0.035, 0, Math.PI * 2);
    context.fill();
  }

  // Baobab: kiełek (2), młode drzewko z grubym pniem (3), baobab — pień jak butelka i płaska korona (4+).
  function baobabPlant(level, cx, bottom, s, sway, green, dark, bark) {
    if (level === 2) {
      stem(cx, bottom - s * 0.04, cx, bottom - s * 0.26, Math.max(2, s * 0.05), bark);
      leaf(cx, bottom - s * 0.25, -0.8 + sway, s * 0.14, s * 0.07, green);
      leaf(cx, bottom - s * 0.25, 0.8 + sway, s * 0.14, s * 0.07, green);
      return;
    }
    const base = bottom - s * 0.24;
    const height = s * (level === 3 ? 0.26 : 0.36);
    const width = s * (level === 3 ? 0.14 : 0.22);
    context.fillStyle = bark;
    context.beginPath();
    context.moveTo(cx - width / 2, base);
    context.quadraticCurveTo(cx - width * 0.75, base - height * 0.5, cx - width * 0.22, base - height);
    context.lineTo(cx + width * 0.22, base - height);
    context.quadraticCurveTo(cx + width * 0.75, base - height * 0.5, cx + width / 2, base);
    context.closePath();
    context.fill();
    context.strokeStyle = bark;
    context.lineWidth = Math.max(1.5, s * 0.03);
    const crown = base - height;
    const branches = level === 3 ? [-0.5, 0.5] : [-0.9, -0.4, 0.1, 0.55, 0.95];
    for (const angle of branches) {
      const x = cx + Math.sin(angle + sway) * s * (level === 3 ? 0.14 : 0.24);
      const y = crown - Math.cos(angle) * s * 0.1;
      context.beginPath();
      context.moveTo(cx, crown + s * 0.02);
      context.lineTo(x, y);
      context.stroke();
      context.fillStyle = angle < 0 ? green : dark;
      context.beginPath();
      context.ellipse(x, y - s * 0.03, s * 0.08, s * 0.04, 0, 0, Math.PI * 2);
      context.fill();
    }
  }

  // Nowe hybrydy (P5.2): Storsłonek (słonecznik z płatkami storczyka), Truslotos (lotos z truskawkami), Baobonstera
  // (pień baobabu z liśćmi monstery), Tęczokwiat (bukiet tęczowych kwiatów).
  function newHybridPlant(chain, cx, bottom, s, sway) {
    const base = bottom - s * 0.24;
    if (chain === "storslonek") {
      for (const angle of [-1, 1]) leaf(cx, base, angle + sway, s * 0.3, s * 0.11, COLORS.monstera);
      stem(cx, base, cx + sway * s, base - s * 0.42, Math.max(2, s * 0.04), COLORS.monsteraCiemna);
      blossom(cx + sway * s, base - s * 0.44, s * 0.16, 10, "#e889c8", "#e8b62e");
    } else if (chain === "truslotos") {
      lotosPlant(4, cx, bottom, s, sway, "#3fae6a", "#2e8b57", "#ff9fb2");
      context.fillStyle = "#e8505b";
      for (const dx of [-0.2, 0.22]) {
        context.beginPath();
        context.arc(cx + dx * s, base - s * 0.04, s * 0.05, 0, Math.PI * 2);
        context.fill();
      }
    } else if (chain === "baobonstera") {
      baobabPlant(4, cx, bottom, s, sway, COLORS.monstera, COLORS.monsteraCiemna, "#b07a4a");
      for (const angle of [-0.7, 0, 0.7])
        leaf(cx, base - s * 0.34, angle + sway, s * 0.24, s * 0.09, COLORS.monstera, true);
    } else {
      const colors = ["#ff6f91", "#ff9d4d", "#f4c542", "#3fae6a", "#4d9de0", "#9b6ddb"];
      for (const angle of [-0.9, 0, 0.9]) leaf(cx, base, angle + sway, s * 0.28, s * 0.09, COLORS.monstera);
      colors.forEach((color, index) => {
        const angle = (index - 2.5) * 0.32 + sway;
        const x = cx + Math.sin(angle) * s * 0.3;
        const y = base - s * 0.28 - Math.cos(angle) * s * 0.12;
        stem(cx, base, x, y, Math.max(1, s * 0.02), COLORS.monsteraCiemna);
        blossom(x, y, s * 0.07, 5, color, "#fff3c4");
      });
    }
  }

  /** Poświata za rośliną diamentową (błękitna) i tęczową (różowo-fioletowa) — P5.1. */
  function glow(cx, cy, s, rainbow) {
    const gradient = context.createRadialGradient(cx, cy, s * 0.05, cx, cy, s * 0.5);
    gradient.addColorStop(0, rainbow ? "rgba(255, 159, 210, 0.55)" : "rgba(168, 236, 255, 0.7)");
    gradient.addColorStop(0.6, rainbow ? "rgba(155, 109, 219, 0.25)" : "rgba(92, 192, 230, 0.25)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(cx, cy, s * 0.5, 0, Math.PI * 2);
    context.fill();
  }

  /** Złota poświata za hybrydą (odróżnia ją od zwykłych roślin szczytowych). */
  function halo(cx, cy, s) {
    const gradient = context.createRadialGradient(cx, cy, s * 0.05, cx, cy, s * 0.48);
    gradient.addColorStop(0, "rgba(244, 197, 66, 0.7)");
    gradient.addColorStop(1, "rgba(244, 197, 66, 0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(cx, cy, s * 0.48, 0, Math.PI * 2);
    context.fill();
  }

  /** Przedmiot w środku (cx, cy) na polu wielkości `s`: ziemia albo doniczka i roślina swojego łańcucha. */
  // Znaczek mocy kózki w kółku (środek 86, 80; układ 128 × 128).
  function goatIcon(kind) {
    context.strokeStyle = COLORS.kontur;
    context.fillStyle = COLORS.kontur;
    context.lineWidth = 2.6;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    if (kind === "skoczek") {
      // Łuk skoku ze strzałką.
      context.arc(86, 84, 6, Math.PI, Math.PI * 1.95);
      context.stroke();
      context.beginPath();
      context.moveTo(89, 80);
      context.lineTo(92, 84);
      context.lineTo(95, 80);
      context.stroke();
    } else if (kind === "zjadaczka") {
      // Karteczka z ugryzieniem.
      context.fillStyle = "#ffe680";
      context.fillRect(80, 74, 12, 12);
      context.strokeRect(80, 74, 12, 12);
      context.fillStyle = COLORS.bialy;
      context.beginPath();
      context.arc(92, 74, 4, 0, Math.PI * 2);
      context.fill();
    } else if (kind === "dzoker") {
      // Gwiazdka.
      for (let point = 0; point < 10; point += 1) {
        const angle = -Math.PI / 2 + (point * Math.PI) / 5;
        const r = point % 2 ? 3.2 : 7;
        context.lineTo(86 + Math.cos(angle) * r, 80 + Math.sin(angle) * r);
      }
      context.closePath();
      context.fillStyle = GOATS.dzoker.color;
      context.fill();
      context.stroke();
    } else if (kind === "sprezynka") {
      // Sprężyna.
      context.strokeStyle = COLORS.zlotoCiemne;
      context.moveTo(80, 86);
      context.lineTo(92, 84);
      context.lineTo(80, 81);
      context.lineTo(92, 78);
      context.lineTo(80, 75);
      context.lineTo(92, 73);
      context.stroke();
    } else {
      // Taran: podwójna strzałka naprzód.
      for (const dx of [-3, 3]) {
        context.beginPath();
        context.moveTo(82 + dx, 74);
        context.lineTo(88 + dx, 80);
        context.lineTo(82 + dx, 86);
        context.stroke();
      }
    }
  }

  /** Kózka-wzmacniacz: poświata w kolorze chustki, kózka (obrazek albo zastępczy kształt), chustka i znaczek mocy. */
  function goat(kind, cx, cy, s, time) {
    const info = GOATS[kind];
    const size = s * 0.98;
    const bob = Math.sin(time * 3 + cx * 0.1) * s * 0.02;
    context.fillStyle = info.color;
    context.globalAlpha = 0.25;
    context.beginPath();
    context.arc(cx, cy, s * 0.46, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;
    context.save();
    context.translate(cx - size / 2, cy - size / 2 + bob);
    context.scale(size / 128, size / 128);
    const picture = goatPicture();
    if (picture) context.drawImage(picture, 0, 0, 128, 128);
    else {
      context.fillStyle = COLORS.koza;
      context.beginPath();
      context.ellipse(58, 77, 30, 21, 0, 0, Math.PI * 2);
      context.ellipse(101, 52, 17, 20, 0, 0, Math.PI * 2);
      context.fill();
    }
    if (!scarfPath && typeof Path2D !== "undefined") scarfPath = new Path2D(SCARF);
    if (scarfPath) {
      context.fillStyle = info.color;
      context.strokeStyle = COLORS.kontur;
      context.lineWidth = 3.5;
      context.lineJoin = "round";
      context.fill(scarfPath);
      context.stroke(scarfPath);
    }
    context.fillStyle = COLORS.bialy;
    context.strokeStyle = COLORS.kontur;
    context.lineWidth = 3;
    context.beginPath();
    context.arc(86, 80, 11, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    goatIcon(kind);
    context.restore();
  }

  function item(target, cx, cy, s, time = 0, label = true) {
    if (GOATS[target.goat]) {
      goat(target.goat, cx, cy, s, time);
      return;
    }
    const { chain, level } = target;
    const hybrid = Boolean(CHAINS[chain]?.hybrid);
    // Iskierki od złotego poziomu (krzyżowanie) i przy hybrydach; poziomy 6–7 rysowane kształtem 5. poziomu.
    const top = hybrid || level >= CROSS_LEVEL;
    const shape = Math.min(level, CROSS_LEVEL);
    const bottom = cy + s * 0.32;
    const base = LEAF[chain] || CHAINS[chain]?.color || COLORS.monstera;
    const golden = level === CROSS_LEVEL && chain !== "kaktus" && !hybrid;
    const diamond = level === CROSS_LEVEL + 1 && !hybrid;
    const rainbow = level >= CROSS_LEVEL + 2 && !hybrid;
    // Tęcza — poziomy gradient przez całe pole (każdy kształt dostaje barwę według położenia).
    const spectrum = (shade) => {
      const gradient = context.createLinearGradient(cx - s * 0.4, 0, cx + s * 0.4, 0);
      RAINBOW.forEach((color, index) => gradient.addColorStop(index / (RAINBOW.length - 1), color));
      if (shade) gradient.addColorStop(0.5, "#3fae6a");
      return gradient;
    };
    const green = rainbow ? spectrum(false) : diamond ? DIAMOND.light : golden ? COLORS.zloto : base;
    const dark = rainbow
      ? spectrum(true)
      : diamond
        ? DIAMOND.dark
        : golden
          ? COLORS.zlotoCiemne
          : COLORS.monsteraCiemna;
    const bloom = rainbow
      ? spectrum(false)
      : diamond
        ? DIAMOND.bloom
        : golden && chain !== "baobab"
          ? COLORS.zloto
          : BLOOM[chain] || base;
    const sway = Math.sin(time * 1.8 + cx * 0.05) * 0.06;
    if (hybrid) halo(cx, cy, s);
    if (diamond || rainbow) glow(cx, cy, s, rainbow);
    if (level <= 2 && !hybrid) {
      // Kopczyk ziemi.
      context.fillStyle = "#8a5a3b";
      context.beginPath();
      context.ellipse(cx, bottom, s * 0.3, s * 0.12, 0, 0, Math.PI * 2);
      context.fill();
    } else {
      // Doniczka (większa z poziomem do 5.; hybryda — ze złotym rantem; diamentowa i tęczowa — z rantem w swoich
      // barwach).
      const potWidth = s * (hybrid ? 0.5 : 0.36 + (shape - 3) * 0.06);
      const potHeight = s * 0.26;
      context.fillStyle = COLORS.doniczka;
      roundRect(cx - potWidth / 2, bottom - potHeight, potWidth, potHeight, 4);
      context.fillStyle = hybrid
        ? COLORS.zloto
        : rainbow
          ? spectrum(false)
          : diamond
            ? DIAMOND.light
            : "rgba(59, 47, 74, 0.18)";
      const rim = hybrid || diamond || rainbow ? 0.06 : 0.04;
      context.fillRect(cx - potWidth / 2, bottom - potHeight, potWidth, Math.max(2, s * rim));
    }
    if (hybrid) {
      if (["monpilea", "alopaproc", "zlotolistka"].includes(chain)) hybridPlant(chain, cx, bottom, s, sway);
      else newHybridPlant(chain, cx, bottom, s, sway);
    } else if (level === 1) seedShape(chain, cx, bottom, s);
    else if (chain === "pilea") pileaPlant(shape, cx, bottom, s, sway, green, dark);
    else if (chain === "paproc") paprocPlant(shape, cx, bottom, s, sway, green, dark);
    else if (chain === "kaktus") kaktusPlant(shape, cx, bottom, s, diamond || rainbow ? green : base, dark);
    else if (chain === "storczyk") storczykPlant(shape, cx, bottom, s, sway, green, dark, bloom);
    else if (chain === "slonecznik") slonecznikPlant(shape, cx, bottom, s, sway, green, dark, bloom);
    else if (chain === "truskawka") truskawkaPlant(shape, cx, bottom, s, sway, green, dark, bloom);
    else if (chain === "lotos") lotosPlant(shape, cx, bottom, s, sway, green, dark, bloom);
    else if (chain === "baobab")
      baobabPlant(shape, cx, bottom, s, sway, green, dark, golden ? COLORS.zlotoCiemne : bloom);
    else monsteraPlant(shape, cx, bottom, s, sway, green, dark);
    if (top) sparkles(cx, cy, s, time);
    // Poziom w rogu pola (hybryda — gwiazdka; bez niego przy przedmiocie uniesionym nad palcem — nie zasłania cyfry
    // pola docelowego).
    if (!label) return;
    context.fillStyle = hybrid ? COLORS.zlotoCiemne : "rgba(59, 47, 74, 0.7)";
    context.font = font(Math.max(9, Math.round(s * 0.2)));
    context.textAlign = "right";
    context.fillText(hybrid ? "★" : String(level), cx + s * 0.44, cy - s * 0.26);
  }

  return { item };
}
