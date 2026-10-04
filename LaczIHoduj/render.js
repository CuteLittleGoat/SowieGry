// Łącz i Hoduj — rysowanie planszy na płótnie (piksele CSS): szklarnia z półkami, pola, rośliny (rysunki
// z `plants.js`), zaznaczenie, przedmiot uniesiony nad palcem przy przeciąganiu z podświetleniem pola, na które
// spadnie, „pyknięcia” po połączeniu i napisy „+N”.
import { COLORS, font } from "../shared/world/tokens.js";
import { createPlantPainter } from "./plants.js";

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

/** Ramka płótna wokół siatki (piksele): trzy przerwy, co najmniej 6 px — zawsze nie mniej niż margines układu. */
export const boardFrame = (layout) => Math.max(6, layout.gap * 3);

export function createBoardRenderer({ canvas, cols, rows }) {
  const context = canvas.getContext("2d");
  let size = { width: 0, height: 0, ratio: 1 };
  let layout = boardLayout(1, 1, cols, rows);
  // Plansza obrócona (transpozycja: kolumny logiczne → rzędy na ekranie), gdy daje większe pola — telefon poziomo.
  // Logika gry bez zmian, sąsiedztwo pól zachowane.
  let transposed = false;
  const visual = () => (transposed ? { cols: rows, rows: cols } : { cols, rows });
  const pops = new Map();
  const popups = [];
  const { item } = createPlantPainter(context);

  // Płótno przylega do siatki: układ liczony dla miejsca w rodzicu (gniazdo planszy) w obu ułożeniach (zwykłym
  // i obróconym — wygrywa większe pole), potem płótno dostaje rozmiar siatki z ramką `boardFrame` (nie większy niż
  // gniazdo) — bez pustego szkła nad i pod półkami na wysokim telefonie.
  function resize() {
    const slot = (canvas.parentElement || canvas).getBoundingClientRect();
    const slotWidth = Math.max(1, slot.width);
    const slotHeight = Math.max(1, slot.height);
    const normal = boardLayout(slotWidth, slotHeight, cols, rows);
    const turned = boardLayout(slotWidth, slotHeight, rows, cols);
    transposed = turned.size > normal.size;
    const fit = transposed ? turned : normal;
    const frame = boardFrame(fit);
    const width = Math.max(1, Math.min(slot.width, Math.ceil(fit.width + frame * 2)));
    const height = Math.max(1, Math.min(slot.height, Math.ceil(fit.height + frame * 2)));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    size = { width, height, ratio };
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const grid = visual();
    layout = boardLayout(width, height, grid.cols, grid.rows);
  }

  // Lewy górny róg pola na ekranie (w obróconej planszy kolumna logiczna to rząd na ekranie).
  const cellRect = (index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const [x, y] = transposed ? [row, col] : [col, row];
    return { x: layout.x + x * (layout.size + layout.gap), y: layout.y + y * (layout.size + layout.gap) };
  };

  /** Pole pod punktem (piksele CSS płótna) albo -1. */
  function cellAt(x, y) {
    const grid = visual();
    const across = Math.floor((x - layout.x) / (layout.size + layout.gap));
    const down = Math.floor((y - layout.y) / (layout.size + layout.gap));
    if (across < 0 || down < 0 || across >= grid.cols || down >= grid.rows) return -1;
    const [col, row] = transposed ? [down, across] : [across, down];
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
    // Deski półek pod każdym rzędem na ekranie.
    for (let row = 0; row < visual().rows; row += 1) {
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
    layout: () => ({ ...layout, transposed }),
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
        item(cells[drag.from], 0, 0, s, time, false);
        context.restore();
      }
      effects(dt);
    },
  };
}

// Główka sowy sąsiadki (koło w kolorze chustki, uszka, oczy, dziobek).
function owlHead(context, x, y, r, color) {
  context.fillStyle = color;
  for (const side of [-1, 1]) {
    context.beginPath();
    context.moveTo(x + side * r * 0.85, y - r * 1.05);
    context.lineTo(x + side * r * 0.35, y - r * 0.7);
    context.lineTo(x + side * r * 0.85, y - r * 0.35);
    context.fill();
  }
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2);
  context.fill();
  for (const side of [-1, 1]) {
    context.fillStyle = COLORS.bialy;
    context.beginPath();
    context.arc(x + side * r * 0.4, y - r * 0.08, r * 0.34, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = COLORS.kontur;
    context.beginPath();
    context.arc(x + side * r * 0.4, y - r * 0.05, r * 0.16, 0, Math.PI * 2);
    context.fill();
  }
  context.fillStyle = COLORS.dziobek;
  context.beginPath();
  context.moveTo(x - r * 0.14, y + r * 0.22);
  context.lineTo(x + r * 0.14, y + r * 0.22);
  context.lineTo(x, y + r * 0.5);
  context.fill();
}

/**
 * Karta zamówienia sąsiadki (płótno w przycisku): główka sowy w kolorze `color` w lewym górnym rogu i roślina
 * z zamówienia (z cyfrą poziomu). Płótno dostaje rozmiar swojego pudełka CSS (gęstość ekranu do 2).
 */
export function drawOrderCard(canvas, order, color) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  if (canvas.width !== Math.round(width * ratio)) canvas.width = Math.round(width * ratio);
  if (canvas.height !== Math.round(height * ratio)) canvas.height = Math.round(height * ratio);
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  const r = Math.min(9, height * 0.2);
  owlHead(context, r + 3, r + 4, r, color);
  if (!order) return;
  const s = Math.min(height, width - r * 1.5);
  createPlantPainter(context).item(order, width / 2 + r * 0.5, height / 2 + s * 0.04, s, 0, true);
}
