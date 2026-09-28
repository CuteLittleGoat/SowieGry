// Sowia Ucieczka — rysowanie (Canvas 2D, jednostki świata): niebo i paralaksa biomu, ziemia z dziurami,
// platformy, liście, przeszkody Pracu / Amic, sowa, Chmura Pracu, cząsteczki, napisy punktów i ostrzeżenia „!”.
import { drawShadow } from "../shared/engine/sprites.js";
import { drawOwl } from "../shared/world/owl.js";
import { COLORS, font } from "../shared/world/tokens.js";
import { OBSTACLES, obstacleBox } from "./obstacles.js";
import { PLATFORM_THICKNESS } from "./config.js";

// Biomy (E4c doda kolejne: Miasto, Osiedle PRL, Stacja Amic, Plaża, Noc nad morzem).
export const BIOMES = Object.freeze([
  {
    id: "laka",
    name: "Łąka",
    sky: [COLORS.nieboGora, COLORS.nieboDol],
    far: "#a8dcc0",
    mid: "#7fcf9c",
    grass: COLORS.monstera,
    grassDark: COLORS.monsteraCiemna,
    soil: "#c98f5e",
    soilDark: "#a8714a",
  },
]);

const LEAF_SPRITE = { zielony: "lisc-zielony", zloty: "lisc-zloty", teczowy: "lisc-teczowy" };
const NOTE_COLORS = ["#fff39a", "#ffc8d5", "#c8f0ff", "#d7f7c2"];

function hash(value) {
  const x = Math.sin(value * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export function createRenderer({ canvas, view, camera, atlas }) {
  const context = canvas.getContext("2d");
  const popups = [];
  let skyCache = null;

  function sky(layout, biome) {
    const key = `${layout.canvasHeight}|${biome.id}`;
    if (!skyCache || skyCache.key !== key) {
      const gradient = context.createLinearGradient(0, 0, 0, layout.cssHeight);
      gradient.addColorStop(0, biome.sky[0]);
      gradient.addColorStop(0.75, biome.sky[1]);
      skyCache = { key, gradient };
    }
    view.applyScreen(context);
    context.fillStyle = skyCache.gradient;
    context.fillRect(0, 0, layout.cssWidth, layout.cssHeight);
  }

  // Paralaksa: wzgórza (daleko) i krzaki (bliżej) przesuwają się wolniej niż świat.
  function hills(bounds, biome, factor, color, height, spacing, seed) {
    const shift = camera.x * factor;
    const start = Math.floor((bounds.left - shift) / spacing) - 1;
    const end = Math.ceil((bounds.right - shift) / spacing) + 1;
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(bounds.left - spacing, 1);
    for (let index = start; index <= end; index += 1) {
      const x = index * spacing + shift;
      const h = height * (0.6 + hash(index * 7.3 + seed) * 0.6);
      context.lineTo(x - spacing / 2, 0.2);
      context.quadraticCurveTo(x, -h * 2, x + spacing / 2, 0.2);
    }
    context.lineTo(bounds.right + spacing, 1);
    context.closePath();
    context.fill();
  }

  function clouds(bounds) {
    const shift = camera.x * 0.8;
    const spacing = 9;
    const start = Math.floor((bounds.left - shift) / spacing) - 1;
    const end = Math.ceil((bounds.right - shift) / spacing) + 1;
    context.fillStyle = "rgba(255, 255, 255, 0.85)";
    for (let index = start; index <= end; index += 1) {
      if (hash(index * 3.1) < 0.35) continue;
      const x = index * spacing + shift + hash(index) * 4;
      const y = -6 - hash(index * 1.7) * 6;
      const w = 1.6 + hash(index * 2.3) * 1.6;
      context.beginPath();
      context.ellipse(x, y, w, w * 0.32, 0, 0, Math.PI * 2);
      context.ellipse(x - w * 0.4, y - w * 0.18, w * 0.45, w * 0.36, 0, 0, Math.PI * 2);
      context.ellipse(x + w * 0.35, y - w * 0.22, w * 0.5, w * 0.4, 0, 0, Math.PI * 2);
      context.fill();
    }
  }

  function ground(bounds, world, biome) {
    const holes = world.holes;
    let x = bounds.left - 1;
    const segments = [];
    for (const item of holes) {
      if (item.x + item.width < bounds.left) continue;
      if (item.x > bounds.right) break;
      if (item.x > x) segments.push([x, item.x]);
      x = Math.max(x, item.x + item.width);
    }
    if (x < bounds.right + 1) segments.push([x, bounds.right + 1]);
    const depth = bounds.bottom + 1;
    for (const [left, right] of segments) {
      context.fillStyle = biome.soil;
      context.fillRect(left, 0, right - left, depth);
      context.fillStyle = biome.soilDark;
      for (let stripe = Math.floor(left); stripe < right; stripe += 1) {
        if (hash(stripe * 5.1) > 0.55) context.fillRect(stripe + 0.2, 0.6 + hash(stripe) * 0.8, 0.35, 0.12);
      }
      context.fillStyle = biome.grass;
      context.fillRect(left, 0, right - left, 0.28);
      context.fillStyle = biome.grassDark;
      context.fillRect(left, 0.24, right - left, 0.08);
    }
    // Dziury: ciemny dół z jaśniejszymi ściankami (bez tła nieba w środku).
    for (const item of holes) {
      if (item.x + item.width < bounds.left || item.x > bounds.right) continue;
      context.fillStyle = COLORS.kontur;
      context.fillRect(item.x, 0, item.width, depth);
      context.fillStyle = biome.soilDark;
      context.fillRect(item.x, 0, 0.18, depth);
      context.fillRect(item.x + item.width - 0.18, 0, 0.18, depth);
      context.fillStyle = "rgba(255, 255, 255, 0.08)";
      context.fillRect(item.x + 0.18, 0, item.width - 0.36, 0.6);
    }
  }

  // Zaokrąglony prostokąt (starsze przeglądarki bez roundRect: zwykły prostokąt).
  function roundRect(x, y, width, height, radius) {
    if (context.roundRect) context.roundRect(x, y, width, height, radius);
    else context.rect(x, y, width, height);
  }

  function platforms(bounds, world, biome) {
    for (const item of world.platforms) {
      if (item.x + item.width < bounds.left || item.x > bounds.right) continue;
      const radius = 0.16;
      context.fillStyle = biome.soil;
      context.beginPath();
      roundRect(item.x, item.y, item.width, PLATFORM_THICKNESS, radius);
      context.fill();
      context.strokeStyle = COLORS.kontur;
      context.lineWidth = 0.05;
      context.stroke();
      context.fillStyle = biome.grass;
      context.beginPath();
      roundRect(item.x - 0.05, item.y - 0.05, item.width + 0.1, 0.16, 0.08);
      context.fill();
    }
  }

  function leaves(bounds, state) {
    for (const item of state.leaves) {
      if (item.taken || item.x < bounds.left - 1) continue;
      if (item.x > bounds.right + 1) break;
      const bob = Math.sin(state.time * 3 + item.phase) * 0.06;
      atlas.draw(context, LEAF_SPRITE[item.kind], item.x, item.y + bob, {
        width: item.kind === "zielony" ? 0.6 : 0.7,
        rotation: Math.sin(state.time * 2 + item.phase) * 0.18,
      });
    }
  }

  function notes(box, time) {
    // Ściana karteczek: kolorowe karteczki z „bazgrołami”, lekko przekrzywione.
    const size = 0.6;
    const center = (box.left + box.right) / 2;
    const top = Math.max(box.top, camera.y - 20);
    let row = 0;
    for (let y = box.bottom; y > top + 0.05; y -= size * 0.9) {
      const tilt = (hash(row * 3.3 + box.left) - 0.5) * 0.25 + Math.sin(time * 4 + row) * 0.02;
      context.save();
      context.translate(center, y - size / 2);
      context.rotate(tilt);
      context.fillStyle = NOTE_COLORS[row % NOTE_COLORS.length];
      context.fillRect(-size / 2, -size / 2, size, size);
      context.strokeStyle = COLORS.kontur;
      context.lineWidth = 0.035;
      context.strokeRect(-size / 2, -size / 2, size, size);
      context.strokeStyle = COLORS.pracu;
      context.lineWidth = 0.04;
      context.beginPath();
      context.moveTo(-0.18, -0.08);
      context.lineTo(0.18, -0.08);
      context.moveTo(-0.18, 0.06);
      context.lineTo(0.1, 0.06);
      context.stroke();
      context.restore();
      row += 1;
    }
  }

  const box = { left: 0, right: 0, top: 0, bottom: 0 };
  function obstacles(bounds, state) {
    for (const item of state.obstacles) {
      if (item.x < bounds.left - 3) continue;
      if (item.x > bounds.right + 3) break;
      const def = OBSTACLES[item.kind];
      obstacleBox(item, state.time, box);
      const alpha = item.hit ? 0.45 : 1;
      if (def.draw === "notes") {
        context.globalAlpha = alpha;
        notes(box, state.time);
        context.globalAlpha = 1;
        continue;
      }
      const ring = def.ring
        ? Math.sin(state.time * 40 + item.phase) * 0.06 * (Math.sin(state.time * 3 + item.phase) > 0 ? 1 : 0)
        : 0;
      if (box.bottom >= -0.01 && def.lift === 0) drawShadow(context, item.x, item.base, def.box[0] * 1.1);
      atlas.draw(context, def.sprite, item.x, box.bottom - def.drawLift, { width: def.width, rotation: ring, alpha });
    }
  }

  function owlSprite(state, animator, cosmetic) {
    const owl = state.owl;
    const blink = state.invulnerable > 0 && Math.floor(state.time * 12) % 2 === 0;
    // Cień na podłożu pod sową (ziemia albo platforma).
    let floor = 0;
    for (const item of state.world.platforms) {
      if (item.x > owl.x) break;
      if (owl.x <= item.x + item.width && item.y >= owl.y - 0.01 && item.y < floor) floor = item.y;
    }
    if (!state.world.groundAt(owl.x, 0.3) && floor === 0) floor = null;
    if (floor !== null) drawShadow(context, owl.x, floor, 0.9, { lift: Math.min(1, (floor - owl.y) / 4) });
    context.save();
    if (owl.sliding > 0) {
      context.translate(owl.x, owl.y);
      context.scale(1.18, 0.62);
      context.translate(-owl.x, -owl.y);
    }
    drawOwl(context, atlas, owl.x, owl.y, {
      state: animator.state(),
      size: 1.2,
      cosmetic,
      alpha: blink ? 0.35 : undefined,
      shadow: false,
    });
    context.restore();
  }

  // Chmura Pracu nad sową przy lewej krawędzi: 3 kroki — ledwo wystaje, 2 — w połowie, 1 — tuż nad sową.
  function workCloud(state, bounds) {
    const edge = bounds.left + 1;
    const steps = Math.max(1, Math.min(3, state.cloud));
    const x = [0, state.owl.x - 0.4, edge + 0.7, edge - 0.9][steps];
    const size = [1, 1.25, 1.1, 1][steps];
    const wobble = Math.sin(state.time * 2.2) * 0.12;
    const y = -3.6 + wobble;
    context.save();
    context.translate(x, y);
    context.scale(size, size);
    context.translate(-x, -y);
    context.fillStyle = "#6d6480";
    context.globalAlpha = 0.92;
    context.beginPath();
    for (const [dx, dy, r] of [
      [0, 0, 1.3],
      [-0.9, 0.5, 1],
      [0.9, 0.45, 1],
      [-0.2, -0.8, 0.95],
      [0.7, -0.5, 0.8],
      [-1.2, -0.3, 0.8],
    ]) {
      context.moveTo(x + dx + r, y + dy);
      context.arc(x + dx, y + dy, r, 0, Math.PI * 2);
    }
    context.fill();
    context.globalAlpha = 1;
    // Groźne brewki i oczy.
    context.strokeStyle = COLORS.kontur;
    context.lineWidth = 0.1;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(x + 0.1, y - 0.35);
    context.lineTo(x + 0.55, y - 0.15);
    context.moveTo(x + 1.15, y - 0.35);
    context.lineTo(x + 0.75, y - 0.15);
    context.stroke();
    context.fillStyle = COLORS.bialy;
    context.beginPath();
    context.arc(x + 0.42, y + 0.1, 0.13, 0, Math.PI * 2);
    context.arc(x + 0.9, y + 0.1, 0.13, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = COLORS.kontur;
    context.beginPath();
    context.arc(x + 0.46, y + 0.12, 0.06, 0, Math.PI * 2);
    context.arc(x + 0.94, y + 0.12, 0.06, 0, Math.PI * 2);
    context.fill();
    // Małe dymki „pracu!” wylatujące z chmury.
    const puff = (state.time * 0.7) % 1;
    atlas.draw(context, "pracu-dymek", x + 1.2 + puff * 0.8, y - 1.2 - puff * 0.6, { width: 0.7, alpha: 1 - puff });
    context.restore();
  }

  function popupsDraw(dt) {
    context.textAlign = "center";
    context.textBaseline = "middle";
    for (let index = popups.length - 1; index >= 0; index -= 1) {
      const item = popups[index];
      item.life -= dt;
      if (item.life <= 0) {
        popups.splice(index, 1);
        continue;
      }
      item.y -= dt * 1.2;
      const alpha = Math.min(1, item.life / 0.4);
      context.save();
      context.globalAlpha = alpha;
      context.translate(item.x, item.y);
      context.scale(0.02, 0.02);
      context.font = font(item.size, 700);
      context.lineWidth = 8;
      context.strokeStyle = COLORS.kontur;
      context.strokeText(item.text, 0, 0);
      context.fillStyle = item.color;
      context.fillText(item.text, 0, 0);
      context.restore();
    }
  }

  // Ostrzeżenia „!” przy prawej krawędzi dla obiektów szybszych od świata, które są jeszcze poza ekranem.
  function warnings(state, bounds, layout) {
    const scale = layout.scale * camera.zoom;
    for (const item of state.obstacles) {
      if (!item.active || !item.vx || item.passed || item.hit) continue;
      if (item.x - OBSTACLES[item.kind].box[0] / 2 <= bounds.right - 0.2) continue;
      if (item.x > bounds.right + 30) break;
      obstacleBox(item, state.time, box);
      const worldY = (box.top + box.bottom) / 2;
      const screenY = (worldY - camera.y) * scale + layout.cssHeight / 2;
      const x = layout.cssWidth - 26;
      const pulse = 1 + Math.sin(state.time * 16) * 0.08;
      view.applyScreen(context);
      context.save();
      context.translate(x, Math.max(90, Math.min(layout.cssHeight - 40, screenY)));
      context.scale(pulse, pulse);
      context.fillStyle = item.family === "amic" ? COLORS.amicCzerwony : COLORS.pracu;
      context.beginPath();
      context.arc(0, 0, 17, 0, Math.PI * 2);
      context.fill();
      context.lineWidth = 3;
      context.strokeStyle = COLORS.bialy;
      context.stroke();
      context.fillStyle = COLORS.bialy;
      context.font = font(24, 700);
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("!", 0, 1);
      context.restore();
      view.apply(context, camera);
    }
  }

  return {
    context,
    popup(text, x, y, color = COLORS.bialy, size = 34) {
      if (popups.length > 12) popups.shift();
      popups.push({ text, x, y, color, size, life: 0.9 });
    },
    clearPopups() {
      popups.length = 0;
    },
    draw({ state, animator, cosmetic = "none", particles, biome = BIOMES[0], dt = 0, showCloud = true }) {
      const layout = view.layout();
      sky(layout, biome);
      view.apply(context, camera);
      const width = layout.worldWidth / camera.zoom;
      const height = layout.worldHeight / camera.zoom;
      const bounds = {
        left: camera.x - width / 2 - 1,
        right: camera.x + width / 2 + 1,
        top: camera.y - height / 2,
        bottom: camera.y + height / 2,
      };
      clouds(bounds);
      hills(bounds, biome, 0.75, biome.far, 2.2, 7, 1);
      hills(bounds, biome, 0.45, biome.mid, 1.1, 4, 2);
      ground(bounds, state.world, biome);
      if (atlas.ready()) {
        platforms(bounds, state.world, biome);
        leaves(bounds, state);
        obstacles(bounds, state);
        if (showCloud) workCloud(state, bounds);
        owlSprite(state, animator, cosmetic);
      } else {
        platforms(bounds, state.world, biome);
      }
      particles?.render(context);
      popupsDraw(dt);
      warnings(state, bounds, layout);
    },
  };
}
