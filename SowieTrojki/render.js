// Sowie Trójki — rysowanie planszy (Analiza 5, rozdz. 12 i 14.4). Plansza warstwami: tło (ramka, pola w szachownicę,
// gniazda) w pamięci, przerysowywane tylko przy zmianie rozmiaru, poziomu albo ostrości; kafelki, moce i przeszkody
// z gotowych obrazków (tiles.js); na wierzchu efekty mocy, drobinki i napisy punktów. Logika planszy (board.js)
// rozstrzyga ruch od razu — renderer ma własny „obraz planszy” i odtwarza oś czasu kroków (`play`) fazami:
// zamiana, pyknięcie i moce, spadanie, wyklucie jajka, telefon, mieszanie, Humbaczy Finał.
import { COLORS, font } from "../shared/world/tokens.js";
import { drawOwl } from "../shared/world/owl.js";
import { KIND_INFO } from "./config.js";
import { createTilePainter, lighten, rounded } from "./tiles.js";

// Czasy faz (s) — spokojne tempo, żeby było widać każde combo (rozdz. 12).
export const TIMING = Object.freeze({
  swap: 0.16,
  burst: 0.24,
  fire: 0.32,
  fallStep: 0.07,
  fallMin: 0.12,
  hatch: 0.5,
  phone: 0.4,
  shuffle: 0.5,
  combo: 0.24,
  finale: 0.32,
  pause: 0.06,
});
const BURST = new Set(["clear", "create", "fire", "damage", "tape"]);

const easeOut = (t) => 1 - (1 - t) * (1 - t);
const easeIn = (t) => t * t;
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * createBoardRenderer({ canvas, atlas, getDpr, particleScale, reducedMotion }) → `setBoard(board)`, `sync(board)`,
 * `resize()`, `play(steps)`, `busy()`, `skip()`, `update(dt)`, `draw(time)`, `cellAt(x, y)`, `cellCenter(index)`,
 * `cellSize()`, `select(index)`, `setHint(move)`, `setDrag(drag)`, `stats()`, `animating()`.
 */
export function createBoardRenderer({
  canvas,
  atlas,
  getDpr = () => Math.min(2, globalThis.devicePixelRatio || 1),
  particleScale = () => 1,
  reducedMotion = () => false,
}) {
  const context = canvas.getContext("2d");
  const painter = createTilePainter({ atlas });
  let size = { width: 0, height: 0, ratio: 1, cell: 0, x0: 0, y0: 0 };
  let rows = 8;
  let cols = 8;
  let holes = [];
  let nests = [];
  let blocks = [];
  const tiles = new Map();
  const layer = { canvas: null, key: "" };
  const phases = [];
  let current = null;
  let elapsed = 0;
  const effects = [];
  const particles = [];
  const popups = [];
  let selected = -1;
  let hint = null;
  let drag = null;
  let time = 0;
  const stats = { frames: 0, phases: 0, tileDraws: 0, backgroundRenders: 0 };

  // ---------- Obraz planszy ----------

  const cellX = (cell) => cell % cols;
  const cellY = (cell) => Math.floor(cell / cols);
  // Pole „nad planszą” dla nowych kafelków: drogi z board.js zaczynają się od −(kolumna + 1).
  const pointOf = (cell) => (cell < 0 ? { x: -cell - 1, y: -1 } : { x: cellX(cell), y: cellY(cell) });

  function tileFrom(item, cell) {
    const point = pointOf(cell);
    return {
      id: item.id,
      kind: item.kind,
      special: item.special,
      dir: item.dir,
      egg: item.egg,
      tape: item.tape,
      x: point.x,
      y: point.y,
      cell,
      scale: 1,
      alpha: 1,
      rotation: 0,
      squash: 0,
    };
  }

  function tileAt(cell) {
    for (const tile of tiles.values()) if (tile.cell === cell && !tile.leaving) return tile;
    return null;
  }

  /** Obraz planszy od nowa z logiki (start poziomu). */
  function setBoard(board) {
    rows = board.rows;
    cols = board.cols;
    holes = board.cells.map((cell) => cell.hole);
    nests = board.cells.map((cell) => cell.nest);
    phases.length = 0;
    current = null;
    effects.length = 0;
    particles.length = 0;
    popups.length = 0;
    selected = -1;
    hint = null;
    drag = null;
    sync(board);
    layer.key = "";
    resize();
  }

  /** Obraz planszy zgodny z logiką (po każdej akcji — zabezpieczenie przed rozjechaniem się animacji). */
  function sync(board) {
    blocks = board.cells.map((cell) => (cell.block ? { ...cell.block, shake: 0, scale: 1 } : null));
    const seen = new Set();
    board.cells.forEach((cell, at) => {
      if (!cell.item) return;
      seen.add(cell.item.id);
      const tile = tiles.get(cell.item.id);
      if (tile) Object.assign(tile, tileFrom(cell.item, at), { x: cellX(at), y: cellY(at) });
      else tiles.set(cell.item.id, tileFrom(cell.item, at));
    });
    for (const id of [...tiles.keys()]) if (!seen.has(id)) tiles.delete(id);
  }

  // ---------- Rozmiar i tło ----------

  function resize() {
    const box = canvas.getBoundingClientRect();
    const ratio = getDpr();
    const width = Math.max(1, Math.round(box.width));
    const height = Math.max(1, Math.round(box.height));
    if (canvas.width !== Math.round(width * ratio)) canvas.width = Math.round(width * ratio);
    if (canvas.height !== Math.round(height * ratio)) canvas.height = Math.round(height * ratio);
    const cell = Math.max(8, Math.floor(Math.min(width / cols, height / rows)));
    size = {
      width,
      height,
      ratio,
      cell,
      x0: Math.round((width - cell * cols) / 2),
      // Plansza blisko paska celów (wolne miejsce pod nią — dymek i Sówka), najwyżej 10 px od góry pola.
      y0: Math.round(Math.min((height - cell * rows) / 2, 10)),
    };
    painter.clear();
    layer.key = "";
  }

  function backgroundLayer() {
    const key = `${size.width}x${size.height}@${size.ratio}|${rows}|${holes.join("")}|${atlas.ready()}`;
    if (layer.key === key && layer.canvas) return layer.canvas;
    const target = layer.canvas || globalThis.document.createElement("canvas");
    target.width = Math.max(1, Math.round(size.width * size.ratio));
    target.height = Math.max(1, Math.round(size.height * size.ratio));
    const ctx = target.getContext("2d");
    ctx.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);
    const { cell, x0, y0 } = size;
    // Ramka planszy pod każdym polem bez dziury (zaokrąglone kafle pól z cieniem).
    const pad = Math.max(2, cell * 0.08);
    ctx.fillStyle = "rgba(59, 47, 74, 0.16)";
    holes.forEach((hole, at) => {
      if (hole) return;
      rounded(
        ctx,
        x0 + cellX(at) * cell - pad + 1,
        y0 + cellY(at) * cell - pad + 3,
        cell + pad * 2,
        cell + pad * 2,
        cell * 0.28,
      );
      ctx.fill();
    });
    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    holes.forEach((hole, at) => {
      if (hole) return;
      rounded(
        ctx,
        x0 + cellX(at) * cell - pad,
        y0 + cellY(at) * cell - pad,
        cell + pad * 2,
        cell + pad * 2,
        cell * 0.28,
      );
      ctx.fill();
    });
    holes.forEach((hole, at) => {
      if (hole) return;
      ctx.fillStyle =
        (cellX(at) + cellY(at)) % 2 ? lighten(COLORS.monsteraJasna, 0.55) : lighten(COLORS.nieboGora, 0.35);
      rounded(ctx, x0 + cellX(at) * cell + 1, y0 + cellY(at) * cell + 1, cell - 2, cell - 2, cell * 0.18);
      ctx.fill();
      if (nests[at] && atlas.ready())
        ctx.drawImage(painter.nest(cell, size.ratio), x0 + cellX(at) * cell, y0 + cellY(at) * cell, cell, cell);
    });
    layer.canvas = target;
    layer.key = key;
    stats.backgroundRenders += 1;
    return target;
  }

  // ---------- Fazy animacji ----------

  function phase(duration, { start = () => {}, update = () => {}, end = () => {} } = {}) {
    return { duration, start, update, end };
  }

  function swapPhase(a, b) {
    let first = null;
    let second = null;
    return phase(TIMING.swap, {
      start() {
        first = tileAt(a);
        second = tileAt(b);
      },
      update(t) {
        const p = easeOut(t);
        if (first) Object.assign(first, { x: lerp(cellX(a), cellX(b), p), y: lerp(cellY(a), cellY(b), p) });
        if (second) Object.assign(second, { x: lerp(cellX(b), cellX(a), p), y: lerp(cellY(b), cellY(a), p) });
      },
      end() {
        if (first) Object.assign(first, { cell: b, x: cellX(b), y: cellY(b) });
        if (second) Object.assign(second, { cell: a, x: cellX(a), y: cellY(a) });
      },
    });
  }

  function shakePhase(cell) {
    let tile = null;
    return phase(0.18, {
      start() {
        tile = tileAt(cell);
      },
      update(t) {
        if (tile) tile.rotation = Math.sin(t * Math.PI * 6) * 0.12 * (1 - t);
      },
      end() {
        if (tile) tile.rotation = 0;
      },
    });
  }

  function addParticles(cell, color, count) {
    const scaled = Math.max(1, Math.round(count * particleScale() * (reducedMotion() ? 0.4 : 1)));
    const limit = Math.round(160 * Math.max(0.25, particleScale()));
    const { x, y } = pointOf(cell);
    for (let index = 0; index < scaled; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2.2;
      particles.push({
        x: x + 0.5,
        y: y + 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        life: 0.5 + Math.random() * 0.3,
        age: 0,
        color,
        size: 0.06 + Math.random() * 0.06,
      });
    }
    if (particles.length > limit) particles.splice(0, particles.length - limit);
  }

  function popup(text, cell, color = COLORS.bialy, scale = 1) {
    const { x, y } = pointOf(cell);
    popups.push({ text, x: x + 0.5, y: y + 0.3, color, scale, age: 0, life: 0.9 });
    if (popups.length > 10) popups.shift();
  }

  function burstPhase(group) {
    const fires = group.filter((step) => step.type === "fire");
    const duration = fires.length ? TIMING.fire : TIMING.burst;
    const popping = [];
    const creates = [];
    return phase(duration, {
      start() {
        for (const step of fires) {
          // Moc znika z planszy w chwili odpalenia.
          const owner = tileAt(step.at);
          if (owner?.special) tiles.delete(owner.id);
          effects.push({ ...step, age: 0, life: duration + 0.1 });
        }
        for (const step of group) {
          if (step.type === "clear") {
            const tile = tiles.get(step.item.id) || tileAt(step.at);
            if (tile) {
              tile.leaving = true;
              popping.push(tile);
            }
            addParticles(step.at, KIND_INFO[step.item.kind]?.color || COLORS.zloto, 4);
          } else if (step.type === "damage") {
            const block = blocks[step.at];
            if (block) block.shake = 1;
            addParticles(
              step.at,
              step.block === "note" ? "#ffe680" : step.block === "crate" ? COLORS.rogi : COLORS.szary,
              5,
            );
          } else if (step.type === "create") {
            const old = tileAt(step.at);
            if (old && old.id !== step.item.id && !old.special) {
              old.leaving = true;
              popping.push(old);
            }
            creates.push(step);
          }
        }
      },
      update(t) {
        for (const tile of popping) {
          tile.scale = t < 0.35 ? 1 + t * 0.6 : Math.max(0, 1.2 * (1 - (t - 0.35) / 0.65));
          tile.alpha = t < 0.5 ? 1 : 1 - (t - 0.5) * 2;
        }
        for (const block of blocks) if (block?.shake) block.shake = Math.max(0, 1 - t);
      },
      end() {
        for (const tile of popping) tiles.delete(tile.id);
        for (const step of group) {
          if (step.type === "damage") {
            blocks[step.at] = step.removed ? null : { type: step.block, layers: step.layers, shake: 0, scale: 1 };
          } else if (step.type === "tape") {
            const tile = tileAt(step.at);
            if (tile) tile.tape = 0;
            addParticles(step.at, COLORS.amicCzerwony, 4);
          }
        }
        for (const step of creates) {
          const tile = tileFrom(step.item, step.at);
          tile.scale = 0.2;
          tile.grow = 1;
          tiles.set(step.item.id, tile);
        }
      },
    });
  }

  function fallPhase(step) {
    const moving = step.moves.map((move) => ({ ...move, steps: Math.max(1, move.path.length - 1) }));
    const longest = Math.max(1, ...moving.map((move) => move.steps));
    const duration = Math.max(TIMING.fallMin, longest * TIMING.fallStep);
    let tracked = [];
    return phase(duration, {
      start() {
        tracked = moving.map((move) => {
          let tile = tiles.get(move.item.id);
          if (!tile) {
            tile = tileFrom(move.item, move.path[0]);
            tiles.set(move.item.id, tile);
          }
          return { tile, move };
        });
      },
      update(t) {
        for (const { tile, move } of tracked) {
          const own = (move.steps * TIMING.fallStep) / duration;
          const local = Math.min(1, t / Math.max(0.0001, own));
          const along = easeIn(local) * move.steps;
          const index = Math.min(move.steps - 1, Math.floor(along));
          const from = pointOf(move.path[index]);
          const to = pointOf(move.path[index + 1]);
          const part = along - index;
          tile.x = lerp(from.x, to.x, part);
          tile.y = lerp(from.y, to.y, part);
          if (local >= 1 && !tile.landed) {
            tile.landed = true;
            tile.squash = 1;
          }
        }
      },
      end() {
        for (const { tile, move } of tracked) {
          const last = move.path.at(-1);
          Object.assign(tile, { cell: last, x: cellX(last), y: cellY(last), landed: false });
        }
      },
    });
  }

  function hatchPhase(group) {
    return phase(TIMING.hatch, {
      start() {
        for (const step of group) {
          const tile = tileAt(step.at);
          if (tile) tiles.delete(tile.id);
          addParticles(step.at, COLORS.koza, 8);
          effects.push({ type: "owlet", from: step.at, age: 0, life: TIMING.hatch + 0.3 });
        }
      },
    });
  }

  function phonePhase(step) {
    return phase(TIMING.phone, {
      start() {
        const tile = tileAt(step.at);
        if (tile) tiles.delete(tile.id);
        effects.push({ type: "ring", at: step.from, age: 0, life: TIMING.phone });
      },
      end() {
        blocks[step.at] = { type: "note", layers: 1, shake: 0, scale: 1 };
        addParticles(step.at, "#ffe680", 5);
      },
    });
  }

  function shufflePhase(step) {
    let tracked = [];
    return phase(TIMING.shuffle, {
      start() {
        tracked = step.moves.map((move) => {
          let tile = tiles.get(move.item.id);
          if (!tile) {
            tile = tileFrom(move.item, move.from);
            tiles.set(move.item.id, tile);
          }
          Object.assign(tile, { kind: move.item.kind });
          return { tile, from: pointOf(move.from), to: pointOf(move.to), cell: move.to };
        });
      },
      update(t) {
        const p = easeOut(t);
        for (const { tile, from, to } of tracked) {
          tile.x = lerp(from.x, to.x, p);
          tile.y = lerp(from.y, to.y, p) - Math.sin(p * Math.PI) * 0.6;
          tile.rotation = Math.sin(p * Math.PI) * 0.6;
        }
      },
      end() {
        for (const { tile, cell } of tracked)
          Object.assign(tile, { cell, x: cellX(cell), y: cellY(cell), rotation: 0 });
      },
    });
  }

  function finalePhase() {
    return phase(TIMING.finale, {
      start() {
        effects.push({ type: "whale", age: 0, life: TIMING.finale + 0.25 });
      },
    });
  }

  function comboPhase(step) {
    return phase(TIMING.combo, {
      start() {
        effects.push({ type: "glow", at: step.at, age: 0, life: TIMING.combo + 0.1 });
      },
      end() {
        // Obie zamienione moce znikają — dalej odpalenie połączenia.
        for (const tile of [...tiles.values()]) if (tile.special && tile.justSwapped) tiles.delete(tile.id);
      },
    });
  }

  /** Kroki z board.js / game.js → kolejka faz animacji. */
  function play(steps, { onDone = null } = {}) {
    for (let index = 0; index < steps.length;) {
      const step = steps[index];
      if (step.type === "swap" || step.type === "swapBack") {
        phases.push(swapPhase(step.a, step.b));
        if (step.type === "swap") {
          const a = step.a;
          const b = step.b;
          phases.push(
            phase(0, {
              start() {
                for (const cell of [a, b]) {
                  const tile = tileAt(cell);
                  if (tile) tile.justSwapped = true;
                }
              },
            }),
          );
        }
        index += 1;
      } else if (step.type === "blocked") {
        phases.push(shakePhase(step.a));
        index += 1;
      } else if (step.type === "tap" || step.type === "finaleMove") {
        if (step.type === "finaleMove") phases.push(finalePhase());
        index += 1;
      } else if (step.type === "combo") {
        phases.push(comboPhase(step));
        index += 1;
      } else if (step.type === "fall") {
        phases.push(fallPhase(step));
        index += 1;
      } else if (step.type === "hatch") {
        const group = [];
        while (index < steps.length && steps[index].type === "hatch") group.push(steps[index++]);
        phases.push(hatchPhase(group));
      } else if (step.type === "phone") {
        phases.push(phonePhase(step));
        index += 1;
      } else if (step.type === "shuffle") {
        phases.push(shufflePhase(step));
        index += 1;
      } else if (BURST.has(step.type)) {
        const group = [];
        const wave = step.wave;
        while (index < steps.length && BURST.has(steps[index].type) && steps[index].wave === wave)
          group.push(steps[index++]);
        phases.push(burstPhase(group));
        phases.push(phase(TIMING.pause));
      } else index += 1;
    }
    phases.push(
      phase(0, {
        end() {
          for (const tile of tiles.values()) tile.justSwapped = false;
          onDone?.();
        },
      }),
    );
  }

  function advance(dt) {
    let left = dt;
    for (let guard = 0; guard < 20000 && left >= 0; guard += 1) {
      if (!current) {
        current = phases.shift() || null;
        if (!current) return;
        elapsed = 0;
        current.start();
        stats.phases += 1;
      }
      const remaining = current.duration - elapsed;
      if (left < remaining) {
        elapsed += left;
        current.update(Math.min(1, elapsed / Math.max(0.0001, current.duration)));
        return;
      }
      left -= remaining;
      current.update(1);
      current.end();
      current = null;
      if (left <= 0 && !phases.length) return;
    }
  }

  // ---------- Rysowanie ----------

  function drawTile(tile) {
    const { cell, x0, y0, ratio } = size;
    let image;
    if (tile.special) image = painter.special(tile, cell, ratio);
    else if (tile.egg) image = painter.egg(cell, ratio);
    else {
      // Sowi storczyk mruga co ok. 5 s (każdy w swoim rytmie) — styl ulubiony przez gracza.
      const blink = tile.kind === "storczyk" && (time * 1000 + tile.id * 937) % 5200 < 170;
      image = painter.tile(tile.kind, cell, ratio, { blink });
    }
    let x = x0 + tile.x * cell;
    let y = y0 + tile.y * cell;
    if (drag && drag.cell === tile.cell && !current) {
      x += drag.dx * cell;
      y += drag.dy * cell;
    }
    let scale = tile.scale;
    let rotation = tile.rotation;
    if (hint && !current && (hint.a === tile.cell || hint.b === tile.cell)) rotation += Math.sin(time * 9) * 0.07;
    if (selected === tile.cell && !current) scale *= 1.06 + Math.sin(time * 8) * 0.03;
    if (tile.special && !reducedMotion()) scale *= 1 + Math.sin(time * 4 + tile.id) * 0.03;
    const squash = tile.squash || 0;
    stats.tileDraws += 1;
    if (scale === 1 && !rotation && tile.alpha === 1 && !squash) {
      context.drawImage(image, x, y, cell, cell);
    } else {
      context.save();
      context.globalAlpha *= Math.max(0, tile.alpha);
      context.translate(x + cell / 2, y + cell * (squash ? 0.95 : 0.5));
      if (rotation) context.rotate(rotation);
      context.scale(scale * (1 + squash * 0.12), scale * (1 - squash * 0.14));
      context.drawImage(image, -cell / 2, squash ? -cell * 0.95 : -cell / 2, cell, cell);
      context.restore();
    }
    if (tile.tape) context.drawImage(painter.tape(cell, ratio), x, y, cell, cell);
  }

  function drawEffects(dt) {
    const { cell, x0, y0 } = size;
    const px = (value) => x0 + value * cell;
    const py = (value) => y0 + value * cell;
    for (let index = effects.length - 1; index >= 0; index -= 1) {
      const effect = effects[index];
      effect.age += dt;
      const t = Math.min(1, effect.age / effect.life);
      if (effect.age >= effect.life) {
        effects.splice(index, 1);
        continue;
      }
      context.save();
      const fade = 1 - t;
      if (effect.type === "fire") {
        const origin = pointOf(effect.at);
        const special = effect.special;
        if (special === "pioro" || special === "cross" || special === "bigCross") {
          const lines = [];
          const rowsHit = special === "bigCross" ? [-1, 0, 1] : [0];
          if (special !== "pioro" || effect.dir !== "v")
            for (const d of rowsHit) lines.push({ h: true, at: origin.y + d });
          if (special !== "pioro" || effect.dir === "v")
            for (const d of rowsHit) lines.push({ h: false, at: origin.x + d });
          for (const line of lines) {
            context.globalAlpha = 0.65 * fade;
            context.fillStyle = "#fff6c2";
            if (line.h) context.fillRect(px(0), py(line.at + 0.2), cols * cell, cell * 0.6);
            else context.fillRect(px(line.at + 0.2), py(0), cell * 0.6, rows * cell);
          }
          context.globalAlpha = 1;
          const travel = easeOut(t) * Math.max(cols, rows);
          for (const line of lines) {
            for (const sign of [-1, 1]) {
              const fx = line.h ? origin.x + 0.5 + sign * travel : line.at + 0.5;
              const fy = line.h ? line.at + 0.5 : origin.y + 0.5 + sign * travel;
              atlas.draw(context, "trojki-pioro", px(fx), py(fy), {
                width: cell * 0.8,
                rotation: line.h ? (sign < 0 ? Math.PI : 0) : (sign * Math.PI) / 2,
              });
            }
          }
        } else if (special === "babel" || special === "bigBubble" || special === "all") {
          const radius = (special === "babel" ? 2.5 : special === "bigBubble" ? 3.5 : 9) * cell * easeOut(t);
          context.globalAlpha = 0.8 * fade;
          context.strokeStyle = COLORS.woda;
          context.lineWidth = cell * 0.25 * fade + 2;
          context.beginPath();
          context.arc(px(origin.x + 0.5), py(origin.y + 0.5), radius, 0, Math.PI * 2);
          context.stroke();
          context.globalAlpha = 0.25 * fade;
          context.fillStyle = special === "all" ? "#fff6c2" : COLORS.wodaJasna;
          context.fill();
        } else if (special === "teczowy") {
          const colors = [
            COLORS.serce,
            COLORS.pomaranczowy,
            COLORS.zloto,
            COLORS.monstera,
            COLORS.niebieski,
            COLORS.fiolet,
          ];
          context.lineWidth = Math.max(2, cell * 0.08);
          context.globalAlpha = fade;
          (effect.cells || []).forEach((target, at) => {
            const point = pointOf(target);
            context.strokeStyle = colors[at % colors.length];
            context.beginPath();
            context.moveTo(px(origin.x + 0.5), py(origin.y + 0.5));
            context.lineTo(
              px(lerp(origin.x, point.x, easeOut(t)) + 0.5),
              py(lerp(origin.y, point.y, easeOut(t)) + 0.5),
            );
            context.stroke();
          });
        } else if (special === "piskle") {
          const targets = effect.targets?.length ? effect.targets : [effect.at];
          targets.forEach((target) => {
            const point = pointOf(target);
            const x = lerp(origin.x, point.x, easeOut(t)) + 0.5;
            const y = lerp(origin.y, point.y, easeOut(t)) + 0.5 - Math.sin(t * Math.PI) * 1.2;
            drawOwl(context, atlas, px(x), py(y + 0.35), { size: cell * 0.7, shadow: false });
          });
        }
      } else if (effect.type === "owlet") {
        const origin = pointOf(effect.from);
        const x = origin.x + 0.5 - easeIn(t) * 2.5;
        const y = origin.y + 0.5 - easeOut(t) * (origin.y + 2);
        context.globalAlpha = fade;
        drawOwl(context, atlas, px(x), py(y), { size: cell * 0.75, shadow: false });
        context.fillStyle = COLORS.serce;
        context.font = font(Math.round(cell * 0.4));
        context.textAlign = "center";
        context.fillText("♥", px(x + 0.4), py(y - 0.7));
      } else if (effect.type === "ring") {
        const origin = pointOf(effect.at);
        context.strokeStyle = COLORS.pracu;
        context.lineWidth = Math.max(1.5, cell * 0.06);
        context.globalAlpha = fade;
        for (const wave of [0, 0.5]) {
          const r = cell * (0.4 + ((t + wave) % 1) * 0.5);
          context.beginPath();
          context.arc(px(origin.x + 0.5), py(origin.y + 0.5), r, -0.9, 0.9);
          context.stroke();
          context.beginPath();
          context.arc(px(origin.x + 0.5), py(origin.y + 0.5), r, Math.PI - 0.9, Math.PI + 0.9);
          context.stroke();
        }
      } else if (effect.type === "whale") {
        const x = lerp(-1.5, cols + 1.5, t);
        const y = rows * 0.55 - Math.sin(t * Math.PI) * rows * 0.45;
        atlas.draw(context, "humbak", px(x), py(y), { width: cell * 3, rotation: (t - 0.5) * 0.8 });
      } else if (effect.type === "glow") {
        const origin = pointOf(effect.at);
        context.globalAlpha = Math.sin(t * Math.PI);
        context.fillStyle = "#fff6c2";
        context.beginPath();
        context.arc(px(origin.x + 0.5), py(origin.y + 0.5), cell * (0.6 + t), 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    }
  }

  function drawParticles(dt) {
    const { cell, x0, y0 } = size;
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const p = particles[index];
      p.age += dt;
      if (p.age >= p.life) {
        particles.splice(index, 1);
        continue;
      }
      p.vy += 7 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      context.globalAlpha = 1 - p.age / p.life;
      context.fillStyle = p.color;
      context.beginPath();
      context.arc(x0 + p.x * cell, y0 + p.y * cell, p.size * cell, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.lineJoin = "round";
    for (let index = popups.length - 1; index >= 0; index -= 1) {
      const item = popups[index];
      item.age += dt;
      if (item.age >= item.life) {
        popups.splice(index, 1);
        continue;
      }
      const t = item.age / item.life;
      context.globalAlpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      context.font = font(Math.round(cell * 0.42 * item.scale));
      const x = x0 + item.x * cell;
      const y = y0 + (item.y - t * 0.8) * cell;
      context.lineWidth = Math.max(2, cell * 0.1);
      context.strokeStyle = COLORS.kontur;
      context.strokeText(item.text, x, y);
      context.fillStyle = item.color;
      context.fillText(item.text, x, y);
    }
    context.globalAlpha = 1;
  }

  return {
    setBoard,
    sync,
    resize,
    play,
    busy: () => Boolean(current) || phases.length > 0,
    /** Natychmiast do końca wszystkich faz (testy, przyspieszenie stuknięciem). */
    skip() {
      advance(3600);
      effects.length = 0;
    },
    /** Trwa animacja albo efekt — gra rysuje pełne 60 klatek/s. */
    animating: () =>
      Boolean(current) || phases.length > 0 || effects.length > 0 || particles.length > 0 || popups.length > 0,
    popup,
    update(dt) {
      time += dt;
      advance(dt);
      for (const tile of tiles.values()) {
        if (tile.squash) tile.squash = Math.max(0, tile.squash - dt / 0.16);
        if (tile.grow) {
          tile.scale = Math.min(1, tile.scale + dt / 0.18);
          if (tile.scale >= 1) tile.grow = 0;
        }
      }
    },
    draw(dt = 0) {
      if (!size.width) resize();
      stats.frames += 1;
      context.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
      context.clearRect(0, 0, size.width, size.height);
      context.drawImage(backgroundLayer(), 0, 0, size.width, size.height);
      const { cell, x0, y0, ratio } = size;
      blocks.forEach((block, at) => {
        if (!block) return;
        const image = painter.block(block.type, block.layers, cell, ratio);
        const shake = block.shake ? Math.sin(time * 60) * cell * 0.05 * block.shake : 0;
        context.drawImage(image, x0 + cellX(at) * cell + shake, y0 + cellY(at) * cell, cell, cell);
      });
      if (selected >= 0 && !current) {
        context.strokeStyle = COLORS.zloto;
        context.lineWidth = Math.max(2, cell * 0.08);
        rounded(
          context,
          x0 + cellX(selected) * cell + 1,
          y0 + cellY(selected) * cell + 1,
          cell - 2,
          cell - 2,
          cell * 0.22,
        );
        context.stroke();
      }
      // Kafelki tylko w obrębie planszy (nowe wpadają z góry spod krawędzi).
      context.save();
      context.beginPath();
      context.rect(x0 - cell, y0, (cols + 2) * cell, rows * cell + cell);
      context.clip();
      for (const tile of tiles.values()) if (tile.y > -1) drawTile(tile);
      context.restore();
      drawEffects(dt);
      drawParticles(dt);
    },
    cellAt(x, y) {
      const { cell, x0, y0 } = size;
      const col = Math.floor((x - x0) / cell);
      const row = Math.floor((y - y0) / cell);
      if (col < 0 || row < 0 || col >= cols || row >= rows) return -1;
      return row * cols + col;
    },
    cellCenter: (index) => ({
      x: size.x0 + (cellX(index) + 0.5) * size.cell,
      y: size.y0 + (cellY(index) + 0.5) * size.cell,
    }),
    cellSize: () => size.cell,
    size: () => ({ ...size }),
    select(index) {
      selected = index;
    },
    setHint(move) {
      hint = move;
    },
    setDrag(next) {
      drag = next;
    },
    stats: () => ({ ...stats, tiles: tiles.size, sprites: painter.count(), particles: particles.length }),
    clearCaches() {
      painter.clear();
      layer.key = "";
    },
  };
}
