// Sowia Ucieczka — rysowanie (Canvas 2D, jednostki świata): niebo i paralaksa biomu (backgrounds.js), ziemia
// z dziurami, platformy, liście, kózki, bąbelki, przeszkody Pracu / Amic, sowa z efektami power-upów, humbak,
// Chmura Pracu, cząsteczki, napisy punktów i ostrzeżenia „!”.
import { drawShadow } from "../shared/engine/sprites.js";
import { drawOwl } from "../shared/world/owl.js";
import { COLORS, font } from "../shared/world/tokens.js";
import { OBSTACLES, obstacleBox } from "./obstacles.js";
import { BIOMES, OCEAN, biomeBlend, drawBiomeBackground, drawOcean, groundStyle, skyColors } from "./backgrounds.js";
import { PLATFORM_THICKNESS } from "./config.js";
import { goatLift } from "./game.js";

export { BIOMES };

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

  function sky(layout, colors) {
    const key = `${layout.cssHeight}|${colors[0]}|${colors[1]}`;
    if (!skyCache || skyCache.key !== key) {
      const gradient = context.createLinearGradient(0, 0, 0, layout.cssHeight);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.75, colors[1]);
      skyCache = { key, gradient };
    }
    view.applyScreen(context);
    context.fillStyle = skyCache.gradient;
    context.fillRect(0, 0, layout.cssWidth, layout.cssHeight);
  }

  function ground(bounds, world, style) {
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
      context.fillStyle = style.fill;
      context.fillRect(left, 0, right - left, depth);
      context.fillStyle = style.fillDark;
      for (let stripe = Math.floor(left); stripe < right; stripe += 1) {
        if (hash(stripe * 5.1) > 0.55) context.fillRect(stripe + 0.2, 0.6 + hash(stripe) * 0.8, 0.35, 0.12);
      }
      context.fillStyle = style.top;
      context.fillRect(left, 0, right - left, 0.28);
      context.fillStyle = style.topDark;
      context.fillRect(left, 0.24, right - left, 0.08);
    }
    // Dziury: ciemny dół z jaśniejszymi ściankami (bez tła nieba w środku).
    for (const item of holes) {
      if (item.x + item.width < bounds.left || item.x > bounds.right) continue;
      context.fillStyle = COLORS.kontur;
      context.fillRect(item.x, 0, item.width, depth);
      context.fillStyle = style.fillDark;
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

  function platforms(bounds, world, style) {
    for (const item of world.platforms) {
      if (item.x + item.width < bounds.left || item.x > bounds.right) continue;
      const radius = 0.16;
      context.fillStyle = style.fill;
      context.beginPath();
      roundRect(item.x, item.y, item.width, PLATFORM_THICKNESS, radius);
      context.fill();
      context.strokeStyle = COLORS.kontur;
      context.lineWidth = 0.05;
      context.stroke();
      context.fillStyle = style.top;
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
    if (floor !== null && !state.bonus)
      drawShadow(context, owl.x, floor, 0.9, { lift: Math.min(1, (floor - owl.y) / 4) });
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

  // Kózki podskakują łukami (grafika skoku w powietrzu), zwrócone do sowy.
  function goats(bounds, state) {
    for (const goat of state.goats) {
      if (goat.taken || goat.x < bounds.left - 2 || goat.x > bounds.right + 2) continue;
      const lift = goatLift(state.time, goat.phase);
      drawShadow(context, goat.x, 0, 0.9, { lift: lift / 1.3 });
      atlas.draw(context, `kozka-${goat.kind}${lift > 0.05 ? "-skok" : ""}`, goat.x, -lift, {
        width: 1.15,
        flipX: true,
      });
    }
  }

  function bubbles(bounds, state) {
    for (const bubble of state.bubbles) {
      if (bubble.taken || bubble.x < bounds.left - 1 || bubble.x > bounds.right + 1) continue;
      const bob = Math.sin(state.time * 2.5 + bubble.phase) * 0.15;
      atlas.draw(context, "babelek", bubble.x, bubble.y + bob, { width: 0.8 });
      context.strokeStyle = "rgba(255, 255, 255, 0.8)";
      context.lineWidth = 0.05;
      context.beginPath();
      context.arc(bubble.x, bubble.y + bob, 0.48 + Math.sin(state.time * 4) * 0.04, 0, Math.PI * 2);
      context.stroke();
    }
  }

  // Efekty power-upów wokół sowy: Tarcza (bańka), Magnes (fioletowe łuki), Turbo (smugi), jadąca kózka.
  function owlEffects(state, front) {
    const owl = state.owl;
    const cx = owl.x;
    const cy = owl.y - 0.55;
    if (!front) {
      if (state.powerups.turbo > 0) {
        context.strokeStyle = "rgba(255, 157, 77, 0.8)";
        context.lineWidth = 0.08;
        context.lineCap = "round";
        for (let index = 0; index < 3; index += 1) {
          const y = cy - 0.3 + index * 0.3;
          const length = 1 + ((state.time * 7 + index) % 1) * 1.2;
          context.beginPath();
          context.moveTo(cx - 0.6, y);
          context.lineTo(cx - 0.6 - length, y);
          context.stroke();
        }
      }
      return;
    }
    if (state.riding) {
      atlas.draw(context, `kozka-${state.riding.kind}`, cx - 0.15, owl.y - 1.05, { width: 0.75, flipX: true });
    }
    if (state.powerups.tarcza > 0) {
      const pulse = 0.05 * Math.sin(state.time * 5);
      context.fillStyle = "rgba(77, 157, 224, 0.16)";
      context.strokeStyle =
        state.powerups.tarcza < 2 && Math.floor(state.time * 8) % 2 ? "rgba(77, 157, 224, 0.3)" : COLORS.niebieski;
      context.lineWidth = 0.06;
      context.beginPath();
      context.arc(cx, cy, 0.9 + pulse, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    }
    if (state.powerups.magnes > 0) {
      context.strokeStyle = "rgba(155, 109, 219, 0.7)";
      context.lineWidth = 0.06;
      for (let index = 0; index < 2; index += 1) {
        const radius = 1.2 + ((state.time * 1.5 + index * 0.5) % 1) * 1.6;
        context.globalAlpha = 1 - ((state.time * 1.5 + index * 0.5) % 1);
        context.beginPath();
        context.arc(cx, cy, radius, -0.8, 0.8);
        context.stroke();
      }
      context.globalAlpha = 1;
    }
  }

  // „Rejs na humbaku”: humbak pod sową (lekko kołysze się na fali).
  function whale(state) {
    const bonus = state.bonus;
    const owl = state.owl;
    const tilt = bonus.vy * -0.02 + Math.sin(state.time * 2) * 0.03;
    atlas.draw(context, "humbak", owl.x + 0.25, bonus.y + 0.25, { width: 3.2, rotation: tilt });
  }

  // Gorączka Monster: tęczowa, pulsująca ramka ekranu.
  function feverFrame(layout, state) {
    view.applyScreen(context);
    const alpha = 0.18 + 0.08 * Math.sin(state.time * 6);
    const gradient = context.createLinearGradient(0, 0, layout.cssWidth, 0);
    ["#ff6f91", "#f4c542", "#3fae6a", "#4d9de0", "#9b6ddb"].forEach((color, index) =>
      gradient.addColorStop(index / 4, color),
    );
    context.save();
    context.globalAlpha = alpha;
    context.strokeStyle = gradient;
    context.lineWidth = 14;
    context.strokeRect(7, 7, layout.cssWidth - 14, layout.cssHeight - 14);
    context.restore();
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
    draw({ state, animator, cosmetic = "none", particles, dt = 0, showCloud = true, reducedMotion = false }) {
      const layout = view.layout();
      const blend = biomeBlend(state.distance);
      const night = blend.current.night && blend.t > 0.5;
      sky(layout, state.bonus ? (night ? blend.current.sky : OCEAN.sky) : skyColors(blend));
      view.apply(context, camera);
      const width = layout.worldWidth / camera.zoom;
      const height = layout.worldHeight / camera.zoom;
      const bounds = {
        left: camera.x - width / 2 - 1,
        right: camera.x + width / 2 + 1,
        top: camera.y - height / 2,
        bottom: camera.y + height / 2,
      };
      const style = groundStyle(blend);
      if (state.bonus) drawOcean(context, camera, bounds, state.time, night);
      else {
        drawBiomeBackground(context, camera, bounds, blend, state.time);
        ground(bounds, state.world, style);
      }
      if (atlas.ready()) {
        platforms(bounds, state.world, style);
        leaves(bounds, state);
        bubbles(bounds, state);
        goats(bounds, state);
        obstacles(bounds, state);
        if (showCloud && !state.bonus) workCloud(state, bounds);
        if (state.bonus) whale(state);
        owlEffects(state, false);
        owlSprite(state, animator, cosmetic);
        owlEffects(state, true);
      } else {
        platforms(bounds, state.world, style);
      }
      particles?.render(context);
      popupsDraw(dt);
      warnings(state, bounds, layout);
      if (state.fever > 0 && !reducedMotion) feverFrame(layout, state);
    },
  };
}
