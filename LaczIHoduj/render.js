// Łącz i Hoduj — rysowanie planszy na płótnie (piksele CSS): szklarnia z półkami, pola, rośliny łańcucha Monstery
// (rysowane kształtami: nasionko → kiełek → sadzonka → monstera → Złota Monstera), zaznaczenie, przedmiot uniesiony
// nad palcem przy przeciąganiu z podświetleniem pola, na które spadnie, „pyknięcia” po połączeniu i napisy „+N”.
import { COLORS, font } from "../shared/world/tokens.js";

// Uniesienie przeciąganego przedmiotu nad palec (w polach) — widać, gdzie spadnie.
export const LIFT = 0.9;

/** Układ planszy w prostokącie `width × height`: rozmiar pola (≥ 1), przerwa i lewy górny róg siatki. */
export function boardLayout(width, height, cols, rows) {
  // Wąski telefon (np. 320 px): margines i przerwy po 1 px, żeby pole miało co najmniej 44 px.
  const tight = width < 360;
  const pad = tight ? 1 : Math.max(4, Math.min(width, height) * 0.015);
  const gap = tight ? 1 : Math.max(2, Math.min(width, height) * 0.008);
  const size = Math.max(
    1,
    Math.floor(Math.min((width - pad * 2 - gap * (cols - 1)) / cols, (height - pad * 2 - gap * (rows - 1)) / rows)),
  );
  const boardWidth = size * cols + gap * (cols - 1);
  const boardHeight = size * rows + gap * (rows - 1);
  return {
    size,
    gap,
    x: (width - boardWidth) / 2,
    y: (height - boardHeight) / 2,
    width: boardWidth,
    height: boardHeight,
  };
}

export function createBoardRenderer({ canvas, cols, rows }) {
  const context = canvas.getContext("2d");
  let size = { width: 0, height: 0, ratio: 1 };
  let layout = boardLayout(1, 1, cols, rows);
  const pops = new Map();
  const popups = [];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    size = { width: Math.max(1, rect.width), height: Math.max(1, rect.height), ratio };
    canvas.width = Math.round(size.width * ratio);
    canvas.height = Math.round(size.height * ratio);
    layout = boardLayout(size.width, size.height, cols, rows);
  }

  const cellRect = (index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    return { x: layout.x + col * (layout.size + layout.gap), y: layout.y + row * (layout.size + layout.gap) };
  };

  /** Pole pod punktem (piksele CSS płótna) albo -1. */
  function cellAt(x, y) {
    const col = Math.floor((x - layout.x) / (layout.size + layout.gap));
    const row = Math.floor((y - layout.y) / (layout.size + layout.gap));
    if (col < 0 || row < 0 || col >= cols || row >= rows) return -1;
    return row * cols + col;
  }

  function cellCenter(index) {
    const rect = cellRect(index);
    return { x: rect.x + layout.size / 2, y: rect.y + layout.size / 2 };
  }

  function roundRect(x, y, width, height, radius) {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.fill();
  }

  // Szklarnia: szybki w szkielecie, deski półek pod każdym rzędem, puste miejsca na doniczki.
  function background(time) {
    const { width, height } = size;
    const glass = context.createLinearGradient(0, 0, 0, height);
    glass.addColorStop(0, "#dff7ea");
    glass.addColorStop(1, "#bfe8cf");
    context.fillStyle = glass;
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(78, 130, 105, 0.22)";
    context.lineWidth = 2;
    for (let x = width / 6; x < width; x += width / 3) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    context.fillStyle = "rgba(255, 255, 255, 0.35)";
    context.beginPath();
    context.ellipse(width * 0.8 + Math.sin(time * 0.3) * 6, height * 0.08, width * 0.2, 10, -0.2, 0, Math.PI * 2);
    context.fill();
    for (let row = 0; row < rows; row += 1) {
      const y = layout.y + row * (layout.size + layout.gap) + layout.size - 3;
      context.fillStyle = "#b9895a";
      roundRect(layout.x - 4, y, layout.width + 8, 6, 3);
      context.fillStyle = "rgba(59, 47, 74, 0.12)";
      context.fillRect(layout.x - 4, y + 6, layout.width + 8, 2);
    }
    context.fillStyle = "rgba(255, 255, 255, 0.45)";
    for (let index = 0; index < cols * rows; index += 1) {
      const rect = cellRect(index);
      roundRect(rect.x + 2, rect.y + 2, layout.size - 4, layout.size - 6, layout.size * 0.2);
    }
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

  /** Przedmiot (łańcuch Monstery) w środku (cx, cy) na polu wielkości `s`. */
  function item(target, cx, cy, s, time) {
    const level = target.level;
    const bottom = cy + s * 0.32;
    const green = level >= 5 ? COLORS.zloto : COLORS.monstera;
    const dark = level >= 5 ? COLORS.zlotoCiemne : COLORS.monsteraCiemna;
    const sway = Math.sin(time * 1.8 + cx * 0.05) * 0.06;
    if (level <= 2) {
      // Kopczyk ziemi.
      context.fillStyle = "#8a5a3b";
      context.beginPath();
      context.ellipse(cx, bottom, s * 0.3, s * 0.12, 0, 0, Math.PI * 2);
      context.fill();
    } else {
      // Doniczka (większa z poziomem).
      const potWidth = s * (0.36 + (level - 3) * 0.06);
      const potHeight = s * 0.26;
      context.fillStyle = COLORS.doniczka;
      roundRect(cx - potWidth / 2, bottom - potHeight, potWidth, potHeight, 4);
      context.fillStyle = "rgba(59, 47, 74, 0.18)";
      context.fillRect(cx - potWidth / 2, bottom - potHeight, potWidth, Math.max(2, s * 0.04));
    }
    if (level === 1) {
      // Nasionko z połyskiem.
      context.fillStyle = "#a0703f";
      context.beginPath();
      context.ellipse(cx, bottom - s * 0.12, s * 0.12, s * 0.16, 0.4, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "rgba(255, 255, 255, 0.5)";
      context.beginPath();
      context.ellipse(cx - s * 0.04, bottom - s * 0.17, s * 0.03, s * 0.05, 0.4, 0, Math.PI * 2);
      context.fill();
    } else if (level === 2) {
      // Kiełek: łodyżka i dwa listki.
      context.strokeStyle = dark;
      context.lineWidth = Math.max(2, s * 0.05);
      context.beginPath();
      context.moveTo(cx, bottom - s * 0.06);
      context.lineTo(cx, bottom - s * 0.36);
      context.stroke();
      leaf(cx, bottom - s * 0.34, -0.9 + sway, s * 0.24, s * 0.08, green);
      leaf(cx, bottom - s * 0.34, 0.9 + sway, s * 0.24, s * 0.08, green);
    } else {
      const base = bottom - s * 0.24;
      const count = level === 3 ? 3 : 5;
      const length = s * (level === 3 ? 0.32 : 0.42);
      const width = s * (level === 3 ? 0.1 : 0.14);
      for (let index = 0; index < count; index += 1) {
        const angle = (index - (count - 1) / 2) * (level === 3 ? 0.6 : 0.5) + sway;
        leaf(cx, base, angle, length, width, index % 2 ? dark : green, level >= 4);
      }
    }
    if (level >= 5) {
      // Złota Monstera — iskierki.
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
    // Poziom w rogu pola.
    context.fillStyle = "rgba(59, 47, 74, 0.7)";
    context.font = font(Math.max(9, Math.round(s * 0.2)));
    context.textAlign = "right";
    context.fillText(String(level), cx + s * 0.44, cy - s * 0.26);
  }

  function effects(dt) {
    context.textAlign = "center";
    for (const popup of popups) {
      popup.age += dt;
      context.globalAlpha = Math.max(0, 1 - popup.age);
      context.font = font(popup.size);
      context.lineWidth = 4;
      context.strokeStyle = COLORS.kontur;
      context.fillStyle = popup.color;
      const y = popup.y - popup.age * 40;
      context.strokeText(popup.text, popup.x, y);
      context.fillText(popup.text, popup.x, y);
    }
    for (let index = popups.length - 1; index >= 0; index -= 1) if (popups[index].age >= 1) popups.splice(index, 1);
    context.globalAlpha = 1;
  }

  return {
    resize,
    cellAt,
    cellCenter,
    layout: () => ({ ...layout }),
    size: () => ({ ...size }),
    /** Krótkie „pyknięcie” przedmiotu na polu (po połączeniu albo nowym nasionku). */
    pop(index) {
      pops.set(index, 0);
    },
    popup(text, x, y, color = COLORS.bialy, textSize = 18) {
      popups.push({ text, x, y, color, size: textSize, age: 0 });
      if (popups.length > 10) popups.shift();
    },
    /**
     * draw({ cells, selected, drag: { from, x, y, target, kind } | null, time, dt }) — `kind` pola docelowego:
     * "merge" (zielone), "move" / "swap" (niebieskie), "compost" (bez podświetlenia pola).
     */
    draw({ cells, selected = -1, drag = null, time = 0, dt = 0 }) {
      if (!size.width) resize();
      context.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
      context.clearRect(0, 0, size.width, size.height);
      background(time);
      const s = layout.size;
      if (drag && drag.target >= 0 && drag.kind !== "compost") {
        const rect = cellRect(drag.target);
        context.fillStyle = drag.kind === "merge" ? "rgba(63, 174, 106, 0.45)" : "rgba(92, 200, 232, 0.4)";
        roundRect(rect.x, rect.y, s, s, s * 0.2);
      }
      cells.forEach((target, index) => {
        if (!target || (drag && drag.from === index)) return;
        const center = cellCenter(index);
        let scale = 1;
        if (pops.has(index)) {
          const age = pops.get(index) + dt;
          if (age >= 0.3) pops.delete(index);
          else {
            pops.set(index, age);
            scale = 1 + Math.sin((age / 0.3) * Math.PI) * 0.25;
          }
        }
        context.save();
        context.translate(center.x, center.y);
        context.scale(scale, scale);
        item(target, 0, 0, s, time);
        context.restore();
      });
      if (selected >= 0 && !drag) {
        const rect = cellRect(selected);
        context.strokeStyle = COLORS.zloto;
        context.lineWidth = 4;
        context.beginPath();
        context.roundRect(rect.x + 1, rect.y + 1, s - 2, s - 2, s * 0.2);
        context.stroke();
      }
      if (drag && cells[drag.from]) {
        // Przedmiot uniesiony nad palcem (powiększony, z cieniem).
        const lifted = { x: drag.x, y: drag.y - s * LIFT };
        context.fillStyle = "rgba(59, 47, 74, 0.2)";
        context.beginPath();
        context.ellipse(drag.x, drag.y, s * 0.3, s * 0.1, 0, 0, Math.PI * 2);
        context.fill();
        context.save();
        context.translate(lifted.x, lifted.y);
        context.scale(1.15, 1.15);
        item(cells[drag.from], 0, 0, s, time);
        context.restore();
      }
      effects(dt);
    },
  };
}
