// Łącz i Hoduj — rysunki roślin (kształty na płótnie, bez obrazków): cztery łańcuchy po 5 poziomów (Monstera, Pilea,
// Paproć, Kaktus) i hybrydy. Wspólne dla planszy (`render.js`) i kart zamówień sąsiadek (`main.js`).
import { COLORS, font } from "../shared/world/tokens.js";
import { CHAINS } from "./config.js";

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
    }[chain] || ["#a0703f", 0.12, 0.16];
    context.fillStyle = color;
    if (chain === "paproc") {
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
  function item(target, cx, cy, s, time = 0, label = true) {
    const { chain, level } = target;
    const hybrid = Boolean(CHAINS[chain]?.hybrid);
    const top = hybrid || level >= (CHAINS[chain]?.levels.length ?? 5);
    const bottom = cy + s * 0.32;
    const base = CHAINS[chain]?.color || COLORS.monstera;
    const golden = top && chain !== "kaktus" && !hybrid;
    const green = golden ? COLORS.zloto : base;
    const dark = golden ? COLORS.zlotoCiemne : COLORS.monsteraCiemna;
    const sway = Math.sin(time * 1.8 + cx * 0.05) * 0.06;
    if (hybrid) halo(cx, cy, s);
    if (level <= 2 && !hybrid) {
      // Kopczyk ziemi.
      context.fillStyle = "#8a5a3b";
      context.beginPath();
      context.ellipse(cx, bottom, s * 0.3, s * 0.12, 0, 0, Math.PI * 2);
      context.fill();
    } else {
      // Doniczka (większa z poziomem; hybryda — ze złotym rantem).
      const potWidth = s * (hybrid ? 0.5 : 0.36 + (level - 3) * 0.06);
      const potHeight = s * 0.26;
      context.fillStyle = COLORS.doniczka;
      roundRect(cx - potWidth / 2, bottom - potHeight, potWidth, potHeight, 4);
      context.fillStyle = hybrid ? COLORS.zloto : "rgba(59, 47, 74, 0.18)";
      context.fillRect(cx - potWidth / 2, bottom - potHeight, potWidth, Math.max(2, s * (hybrid ? 0.06 : 0.04)));
    }
    if (hybrid) hybridPlant(chain, cx, bottom, s, sway);
    else if (level === 1) seedShape(chain, cx, bottom, s);
    else if (chain === "pilea") pileaPlant(level, cx, bottom, s, sway, green, dark);
    else if (chain === "paproc") paprocPlant(level, cx, bottom, s, sway, green, dark);
    else if (chain === "kaktus") kaktusPlant(level, cx, bottom, s, base, dark);
    else monsteraPlant(level, cx, bottom, s, sway, green, dark);
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
