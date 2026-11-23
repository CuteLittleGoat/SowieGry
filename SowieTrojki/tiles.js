// Sowie Trójki — wygląd kafelków (Analiza 5, rozdz. 5 i 12): tła-kształty w kolorach rodzajów (kwadrat, koło, serce,
// gwiazda, sześciokąt, romb), obrazki z atlasu Sowiego Świata, moce w jasnej bańce ze złotą (Tęczowy liść — tęczową)
// obwódką, przeszkody (karteczka Pracu, skrzynia Amic, kanister Amic, telefon Pracu, taśma Amic), jajko i gniazdo.
// Każdy wygląd rysowany raz do gotowego obrazka w rozmiarze pola i ostrości ekranu (Analiza 6, rozdz. 14.4) —
// klatka gry to kopiowanie obrazków.
import { COLORS, font } from "../shared/world/tokens.js";
import { OWL_ANCHOR, OWL_POSES, OWL_SIZE, drawOwl, owlLayers } from "../shared/world/owl.js";
import { SPRITES } from "../shared/world/catalog.js";
import { KIND_INFO } from "./config.js";

const square = (svg, size = 1) => ({ box: [128, 128], size: [size, size], anchor: [0.5, 0.5], layers: [{ svg }] });
const owlPose = (pose) => ({
  box: [128, 128],
  size: [OWL_SIZE, OWL_SIZE],
  anchor: OWL_ANCHOR,
  layers: owlLayers(pose),
});
const SHARED = [
  "babelek",
  "lisc-zielony",
  "lisc-zloty",
  "lisc-teczowy",
  "amic-kanister",
  "pracu-telefon",
  "humbak",
  "plusk",
];

/**
 * Katalog atlasu gry: części wspólnego katalogu (sowa w każdej pozie, garderoba, liście, bąbelek, kanister, telefon,
 * humbak) i grafiki tej gry — truskawka, Sowi storczyk (także mrugający), pióro, jajko, gniazdo, kózka bez chustki
 * i nowe miny Sówki: zachwyt (gwiazdki w oczach), czułość (serduszka), smutek, machanie.
 */
export const TROJKI_SPRITES = Object.freeze({
  ...Object.fromEntries(
    Object.entries(SPRITES).filter(
      ([name]) => name.startsWith("sowa-") || name.startsWith("garderoba-") || SHARED.includes(name),
    ),
  ),
  "trojki-truskawka": square("trojki/truskawka.svg"),
  "trojki-storczyk": square("trojki/storczyk.svg"),
  "trojki-storczyk-mruga": square("trojki/storczyk-mruga.svg"),
  "trojki-pioro": square("trojki/pioro.svg"),
  "trojki-jajko": square("trojki/jajko.svg"),
  "trojki-gniazdo": square("trojki/gniazdo.svg"),
  "trojki-kozka": square("kozki/koza.svg"),
  "trojki-humbak": { box: [256, 128], size: [2, 1], anchor: [0.5, 0.5], layers: [{ svg: "humbak/humbak.svg" }] },
  "sowa-zachwyt": owlPose({ ...OWL_POSES.radosc, eyes: "oczy-gwiazdki" }),
  "sowa-serduszka": owlPose({ ...OWL_POSES.radosc, eyes: "oczy-serduszka" }),
  "sowa-smutek": owlPose({ body: 3, wings: -16, feet: null, eyes: "oczy-smutne", pupils: null }),
  "sowa-macha": owlPose({ ...OWL_POSES.skok, eyes: "oczy-radosc", pupils: null }),
});

/** Zaokrąglony prostokąt (ścieżka) — bez `roundRect` płótna (starsze Safari). */
export function rounded(context, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

// Kolor jaśniejszy (mieszanie z białym, 0–1) — górna część gradientu tła kafelka.
export function lighten(hex, share) {
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift) => Math.round(((value >> shift) & 255) * (1 - share) + 255 * share);
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

/** Ścieżka kształtu tła w środku (cx, cy), „promień” r: square, circle, heart, star, hexagon, diamond. */
export function shapePath(context, shape, cx, cy, r) {
  context.beginPath();
  if (shape === "circle") {
    context.arc(cx, cy, r * 0.94, 0, Math.PI * 2);
  } else if (shape === "square") {
    const half = r * 0.86;
    rounded(context, cx - half, cy - half, half * 2, half * 2, r * 0.3);
    return;
  } else if (shape === "heart") {
    const top = cy - r * 0.52;
    context.moveTo(cx, cy + r * 0.9);
    context.bezierCurveTo(cx - r * 1.2, cy + r * 0.05, cx - r * 0.95, top - r * 0.62, cx - r * 0.46, top - r * 0.38);
    context.bezierCurveTo(cx - r * 0.2, top - r * 0.26, cx - r * 0.04, top - r * 0.12, cx, top + r * 0.02);
    context.bezierCurveTo(cx + r * 0.04, top - r * 0.12, cx + r * 0.2, top - r * 0.26, cx + r * 0.46, top - r * 0.38);
    context.bezierCurveTo(cx + r * 0.95, top - r * 0.62, cx + r * 1.2, cy + r * 0.05, cx, cy + r * 0.9);
  } else if (shape === "star") {
    for (let point = 0; point < 10; point += 1) {
      const angle = -Math.PI / 2 + (point * Math.PI) / 5;
      const radius = point % 2 ? r * 0.56 : r * 1.02;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + r * 0.06 + Math.sin(angle) * radius;
      if (point) context.lineTo(x, y);
      else context.moveTo(x, y);
    }
  } else if (shape === "hexagon") {
    for (let point = 0; point < 6; point += 1) {
      const angle = -Math.PI / 2 + (point * Math.PI) / 3;
      const x = cx + Math.cos(angle) * r * 0.98;
      const y = cy + Math.sin(angle) * r * 0.98;
      if (point) context.lineTo(x, y);
      else context.moveTo(x, y);
    }
  } else if (shape === "diamond") {
    context.moveTo(cx, cy - r * 1.02);
    context.lineTo(cx + r * 0.92, cy);
    context.lineTo(cx, cy + r * 1.02);
    context.lineTo(cx - r * 0.92, cy);
  }
  context.closePath();
}

// Obrazki rodzajów: szerokość obrazka względem pola.
const ICON_WIDTH = Object.freeze({ lisc: 0.6, zloty: 0.6, humbak: 0.78, kozka: 0.64, truskawka: 0.6, storczyk: 0.68 });

/**
 * createTilePainter({ atlas }) → obrazki kafelków w pamięci: `tile(rodzaj, pole, ratio, { blink })`, `special(item,
 * pole, ratio)`, `block(typ, warstwy, pole, ratio)`, `egg(pole, ratio)`, `nest(pole, ratio)`, `tape(pole, ratio)`;
 * `clear()` (zmiana rozmiaru, ostrości albo atlasu), `count()`.
 */
export function createTilePainter({ atlas }) {
  const cache = new Map();

  function sprite(key, size, ratio, paint) {
    const full = `${key}|${size}|${ratio}`;
    let canvas = cache.get(full);
    if (canvas) return canvas;
    canvas = globalThis.document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(size * ratio));
    canvas.height = Math.max(1, Math.ceil(size * ratio));
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineJoin = "round";
    context.lineCap = "round";
    paint(context, size);
    // Grafiki atlasu mogą się jeszcze wczytywać — obrazka bez atlasu nie zapamiętujemy.
    if (atlas.ready()) cache.set(full, canvas);
    return canvas;
  }

  function background(context, size, shape, color) {
    const r = size * 0.43;
    const cx = size / 2;
    const cy = size / 2;
    const line = Math.max(1.5, size * 0.055);
    context.save();
    context.fillStyle = "rgba(59, 47, 74, 0.18)";
    context.translate(0, size * 0.045);
    shapePath(context, shape, cx, cy, r);
    context.fill();
    context.restore();
    const gradient = context.createLinearGradient(0, cy - r, 0, cy + r);
    gradient.addColorStop(0, lighten(color, 0.45));
    gradient.addColorStop(1, color);
    shapePath(context, shape, cx, cy, r);
    context.fillStyle = gradient;
    context.fill();
    context.lineWidth = line;
    context.strokeStyle = COLORS.kontur;
    context.stroke();
    // Błysk w lewym górnym rogu.
    context.save();
    shapePath(context, shape, cx, cy, r);
    context.clip();
    context.fillStyle = "rgba(255, 255, 255, 0.45)";
    context.beginPath();
    context.ellipse(cx - r * 0.42, cy - r * 0.5, r * 0.34, r * 0.18, -0.6, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function bubble(context, size, rainbow) {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.42;
    const gradient = context.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, COLORS.wodaJasna);
    context.beginPath();
    context.arc(cx, cy, r, 0, Math.PI * 2);
    context.fillStyle = gradient;
    context.fill();
    const ring = Math.max(2, size * 0.075);
    if (rainbow) {
      const colors = [
        COLORS.serce,
        COLORS.pomaranczowy,
        COLORS.zloto,
        COLORS.monstera,
        COLORS.niebieski,
        COLORS.fiolet,
      ];
      colors.forEach((color, index) => {
        context.beginPath();
        context.arc(cx, cy, r, (index * Math.PI) / 3, ((index + 1) * Math.PI) / 3 + 0.02);
        context.strokeStyle = color;
        context.lineWidth = ring;
        context.stroke();
      });
    } else {
      context.beginPath();
      context.arc(cx, cy, r, 0, Math.PI * 2);
      context.strokeStyle = COLORS.zloto;
      context.lineWidth = ring;
      context.stroke();
    }
    context.beginPath();
    context.arc(cx, cy, r + ring / 2, 0, Math.PI * 2);
    context.strokeStyle = COLORS.kontur;
    context.lineWidth = Math.max(1, size * 0.03);
    context.stroke();
    // Iskierka.
    sparkle(context, cx + r * 0.62, cy - r * 0.62, size * 0.09);
  }

  function sparkle(context, x, y, r) {
    context.save();
    context.fillStyle = "#ffffff";
    context.strokeStyle = COLORS.zlotoCiemne;
    context.lineWidth = Math.max(0.8, r * 0.18);
    context.beginPath();
    context.moveTo(x, y - r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.quadraticCurveTo(x, y, x, y + r);
    context.quadraticCurveTo(x, y, x - r, y);
    context.quadraticCurveTo(x, y, x, y - r);
    context.fill();
    context.stroke();
    context.restore();
  }

  function badge(context, size, value) {
    const r = size * 0.15;
    const x = size - r - size * 0.04;
    const y = size - r - size * 0.04;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    context.fillStyle = "#ffffff";
    context.fill();
    context.lineWidth = Math.max(1, size * 0.035);
    context.strokeStyle = COLORS.kontur;
    context.stroke();
    context.fillStyle = COLORS.kontur;
    context.font = font(Math.max(8, Math.round(r * 1.5)));
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(value), x, y + r * 0.08);
  }

  return {
    tile(kind, size, ratio, { blink = false } = {}) {
      const info = KIND_INFO[kind];
      return sprite(`tile:${kind}:${blink ? 1 : 0}`, size, ratio, (context) => {
        background(context, size, info.shape, info.color);
        const name = blink && kind === "storczyk" ? "trojki-storczyk-mruga" : info.sprite;
        atlas.draw(context, name, size / 2, size / 2 + size * 0.02, { width: size * ICON_WIDTH[kind] });
      });
    },
    special(item, size, ratio) {
      return sprite(`special:${item.special}:${item.dir || ""}`, size, ratio, (context) => {
        bubble(context, size, item.special === "teczowy");
        const cx = size / 2;
        const cy = size / 2;
        if (item.special === "pioro") {
          const vertical = item.dir === "v";
          atlas.draw(context, "trojki-pioro", cx, cy, { width: size * 0.62, rotation: vertical ? -Math.PI / 2 : 0 });
          // Strzałki kierunku lotu (↔ albo ↕).
          context.fillStyle = COLORS.kontur;
          const tip = size * 0.36;
          const arm = size * 0.08;
          for (const sign of [-1, 1]) {
            context.beginPath();
            if (vertical) {
              context.moveTo(cx, cy + sign * tip);
              context.lineTo(cx - arm, cy + sign * (tip - arm * 1.3));
              context.lineTo(cx + arm, cy + sign * (tip - arm * 1.3));
            } else {
              context.moveTo(cx + sign * tip, cy);
              context.lineTo(cx + sign * (tip - arm * 1.3), cy - arm);
              context.lineTo(cx + sign * (tip - arm * 1.3), cy + arm);
            }
            context.closePath();
            context.fill();
          }
        } else if (item.special === "piskle") {
          drawOwl(context, atlas, cx, cy + size * 0.28, { size: size * 0.6, shadow: false });
        } else if (item.special === "babel") {
          atlas.draw(context, "babelek", cx, cy, { width: size * 0.56 });
        } else if (item.special === "teczowy") {
          atlas.draw(context, "lisc-teczowy", cx, cy, { width: size * 0.62 });
        }
      });
    },
    block(type, layers, size, ratio) {
      return sprite(`block:${type}:${layers}`, size, ratio, (context) => {
        const cx = size / 2;
        const cy = size / 2;
        const s = size;
        if (type === "note") {
          context.save();
          context.translate(cx, cy);
          context.rotate(-0.06);
          context.fillStyle = "rgba(59, 47, 74, 0.18)";
          context.fillRect(-s * 0.37 + 2, -s * 0.37 + 3, s * 0.74, s * 0.74);
          context.fillStyle = layers >= 3 ? "#ffd84d" : layers === 2 ? "#ffe680" : "#fff1a8";
          rounded(context, -s * 0.37, -s * 0.37, s * 0.74, s * 0.74, s * 0.05);
          context.fill();
          context.lineWidth = Math.max(1.2, s * 0.04);
          context.strokeStyle = COLORS.kontur;
          context.stroke();
          context.fillStyle = "#f5c842";
          context.fillRect(-s * 0.37, -s * 0.37, s * 0.74, s * 0.12);
          context.strokeStyle = "rgba(59, 47, 74, 0.35)";
          context.lineWidth = Math.max(1, s * 0.03);
          for (const y of [-0.08, 0.06, 0.2]) {
            context.beginPath();
            context.moveTo(-s * 0.26, s * y);
            context.lineTo(s * 0.12, s * y);
            context.stroke();
          }
          context.fillStyle = COLORS.pracu;
          context.beginPath();
          context.arc(s * 0.2, -s * 0.12, s * 0.11, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = "#ffffff";
          context.font = font(Math.max(7, Math.round(s * 0.15)));
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText("P", s * 0.2, -s * 0.11);
          context.restore();
          if (layers > 1) badge(context, size, layers);
        } else if (type === "crate") {
          const half = s * 0.4;
          context.fillStyle = "rgba(59, 47, 74, 0.18)";
          rounded(context, cx - half + 2, cy - half + 3, half * 2, half * 2, s * 0.06);
          context.fill();
          context.fillStyle = layers >= 2 ? COLORS.sowa : COLORS.rogi;
          rounded(context, cx - half, cy - half, half * 2, half * 2, s * 0.06);
          context.fill();
          context.lineWidth = Math.max(1.2, s * 0.045);
          context.strokeStyle = COLORS.kontur;
          context.stroke();
          context.strokeStyle = COLORS.sowaCiemna;
          context.lineWidth = Math.max(1, s * 0.035);
          for (const y of [-0.14, 0.14]) {
            context.beginPath();
            context.moveTo(cx - half * 0.9, cy + s * y);
            context.lineTo(cx + half * 0.9, cy + s * y);
            context.stroke();
          }
          // Pasy Amic: biały, czerwony, zielony.
          const stripe = s * 0.07;
          [COLORS.bialy, COLORS.amicCzerwony, COLORS.amicZielony].forEach((color, index) => {
            context.fillStyle = color;
            context.fillRect(cx - stripe * 1.5 + index * stripe, cy - half, stripe, half * 2);
          });
          context.strokeStyle = COLORS.kontur;
          context.lineWidth = Math.max(1, s * 0.02);
          context.strokeRect(cx - stripe * 1.5, cy - half, stripe * 3, half * 2);
          if (layers > 1) badge(context, size, layers);
        } else if (type === "canister") {
          atlas.draw(context, "amic-kanister", cx, cy, { width: s * 0.82 });
        } else if (type === "phone") {
          context.fillStyle = lighten(COLORS.policzki, 0.4);
          rounded(context, s * 0.06, s * 0.06, s * 0.88, s * 0.88, s * 0.18);
          context.fill();
          context.lineWidth = Math.max(1.2, s * 0.035);
          context.strokeStyle = COLORS.pracu;
          context.stroke();
          atlas.draw(context, "pracu-telefon", cx, cy, { width: s * 0.78 });
          badge(context, size, layers);
        }
      });
    },
    egg(size, ratio) {
      return sprite("egg", size, ratio, (context) => {
        context.fillStyle = "rgba(59, 47, 74, 0.16)";
        context.beginPath();
        context.ellipse(size / 2, size * 0.86, size * 0.26, size * 0.06, 0, 0, Math.PI * 2);
        context.fill();
        atlas.draw(context, "trojki-jajko", size / 2, size / 2, { width: size * 0.74 });
      });
    },
    nest(size, ratio) {
      return sprite("nest", size, ratio, (context) => {
        atlas.draw(context, "trojki-gniazdo", size / 2, size * 0.62, { width: size * 0.96 });
      });
    },
    tape(size, ratio) {
      return sprite("tape", size, ratio, (context) => {
        context.save();
        context.translate(size / 2, size / 2);
        for (const angle of [Math.PI / 4, -Math.PI / 4]) {
          context.save();
          context.rotate(angle);
          const length = size * 1.06;
          const band = size * 0.17;
          context.fillStyle = "#ffffff";
          context.fillRect(-length / 2, -band / 2, length, band);
          context.fillStyle = COLORS.amicCzerwony;
          for (let x = -length / 2; x < length / 2; x += band * 1.4) context.fillRect(x, -band / 2, band * 0.7, band);
          context.strokeStyle = COLORS.kontur;
          context.lineWidth = Math.max(1, size * 0.025);
          context.strokeRect(-length / 2, -band / 2, length, band);
          context.restore();
        }
        context.restore();
      });
    },
    clear: () => cache.clear(),
    count: () => cache.size,
  };
}
