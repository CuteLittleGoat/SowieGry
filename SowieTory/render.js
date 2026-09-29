// Sowie Tory — rysowanie (Canvas 2D, piksele CSS przez rzutnię perspektywiczną z projection.js): niebo, scenografia
// po bokach drogi (poza korytarzem trzech torów), droga z przesuwającą się teksturą, podświetlenie toru pod sową,
// przeszkody i liście posortowane po głębokości, mgła w oddali, sowa, strzałki ostrzegawcze, napisy punktów.
import { drawShadow } from "../shared/engine/sprites.js";
import { drawOwl } from "../shared/world/owl.js";
import { COLORS, font } from "../shared/world/tokens.js";
import { OWL } from "./config.js";
import { OBSTACLES, obstacleShape, obstacleX } from "./obstacles.js";
import { ROAD_WIDTH, computeProjection, depthAtScreenY, fogAt, laneX, project } from "./projection.js";
import { STAGES } from "./stages.js";

const LEAF_SPRITE = { zielony: "lisc-zielony", zloty: "lisc-zloty", teczowy: "lisc-teczowy" };

function hash(value) {
  const x = Math.sin(value * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

// Kolor „#rrggbb” zmieszany z drugim (t = 0–1) — mgła i cienie scenografii.
export function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const channel = (shift) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

export function createRenderer({ canvas, view, atlas }) {
  const context = canvas.getContext("2d");
  const popups = [];
  const drawList = [];
  const point = { x: 0, y: 0, scale: 0 };
  const point2 = { x: 0, y: 0, scale: 0 };
  let layout = null;
  let skyCache = null;

  function updateLayout() {
    const screen = view.layout();
    if (!layout || layout.width !== screen.cssWidth || layout.height !== screen.cssHeight) {
      layout = computeProjection({ width: screen.cssWidth, height: screen.cssHeight });
      skyCache = null;
    }
    return layout;
  }

  function sky(stage) {
    const key = `${layout.height}|${stage.id}`;
    if (!skyCache || skyCache.key !== key) {
      const gradient = context.createLinearGradient(0, 0, 0, layout.horizonY + 4);
      gradient.addColorStop(0, stage.sky[0]);
      gradient.addColorStop(1, stage.sky[1]);
      skyCache = { key, gradient };
    }
    context.fillStyle = skyCache.gradient;
    context.fillRect(0, 0, layout.width, layout.horizonY + 2);
  }

  // Czworokąt na płaszczyźnie (x0…x1 w bok, y0…y1 w górę) na głębokości z0…z1 — ściany i podłogi scenografii.
  function quad(x0, y0, z0, x1, y1, z1, fill) {
    const a = project(layout, x0, y0, z0, point);
    if (!a) return;
    const ax = a.x;
    const ay = a.y;
    const b = project(layout, x1, y0, z0, point);
    if (!b) return;
    const bx = b.x;
    const by = b.y;
    const c = project(layout, x1, y1, z1, point);
    if (!c) return;
    const cx = c.x;
    const cy = c.y;
    const d = project(layout, x0, y1, z1, point);
    if (!d) return;
    context.fillStyle = fill;
    context.beginPath();
    context.moveTo(ax, ay);
    context.lineTo(bx, by);
    context.lineTo(cx, cy);
    context.lineTo(d.x, d.y);
    context.closePath();
    context.fill();
  }

  function nearZ() {
    return Math.max(-layout.cameraBack + 0.3, depthAtScreenY(layout, layout.height + 20));
  }

  function road(stage, distance) {
    const half = ROAD_WIDTH / 2;
    const near = nearZ();
    const far = layout.farZ;
    // Pobocza (poza korytarzem trzech torów) i droga.
    quad(-half - 30, 0, near, -half, 0, far, mix(stage.floor, "#6b5a4a", 0.12));
    quad(half, 0, near, half + 30, 0, far, mix(stage.floor, "#6b5a4a", 0.12));
    quad(-half, 0, near, half, 0, far, stage.floor);
    // Przesuwająca się tekstura: poprzeczne pasy co 4 m.
    context.strokeStyle = mix(stage.floor, "#000000", 0.08);
    for (let z = 4 - (distance % 4); z < far; z += 4) {
      const left = project(layout, -half, 0, z, point);
      if (!left) continue;
      const lx = left.x;
      const ly = left.y;
      const right = project(layout, half, 0, z, point2);
      context.globalAlpha = 1 - fogAt(layout, z);
      context.lineWidth = Math.max(0.5, left.scale * 0.06);
      context.beginPath();
      context.moveTo(lx, ly);
      context.lineTo(right.x, right.y);
      context.stroke();
    }
    context.globalAlpha = 1;
    // Linie między torami (przerywane, przesuwają się z biegiem).
    context.fillStyle = stage.lane;
    for (const edge of [-0.5, 0.5]) {
      const x = edge * 2 * laneX(0.5);
      for (let z = 3 - (distance % 3); z < far; z += 3) {
        const start = Math.max(z, near);
        quad(x - 0.06, 0, start, x + 0.06, 0, Math.min(far, z + 1.5), stage.lane);
      }
    }
    // Krawężniki.
    quad(-half - 0.18, 0, near, -half, 0, far, stage.accent);
    quad(half, 0, near, half + 0.18, 0, far, stage.accent);
  }

  // Podświetlenie toru pod sową.
  function laneGlow(owl) {
    const x = owl.x;
    const width = laneX(1) * 0.5;
    context.globalAlpha = 0.28;
    quad(x - width, 0.01, nearZ(), x + width, 0.01, 9, "#ffffff");
    context.globalAlpha = 1;
  }

  // Scenografia po bokach: słupki i skrzynie co 6 m (oprawę plansz rozbudowuje E5b).
  function scenery(stage, distance) {
    const half = ROAD_WIDTH / 2;
    const first = Math.floor(distance / 6) * 6;
    for (let at = first + 60; at >= first - 6; at -= 6) {
      const z = at - distance;
      if (z < nearZ() || z > layout.farZ) continue;
      const fog = fogAt(layout, z);
      for (const side of [-1, 1]) {
        const seed = at * 0.37 + side;
        const height = 1.6 + hash(seed) * 2.2;
        const x = side * (half + 1.4 + hash(seed + 1) * 1.2);
        drawList.push({
          z,
          draw: () => {
            context.globalAlpha = 1 - fog * 0.85;
            const base = project(layout, x, 0, z, point);
            if (!base) return;
            const bx = base.x;
            const by = base.y;
            const scale = base.scale;
            context.fillStyle = mix(hash(seed + 2) > 0.5 ? stage.accent : stage.sky[0], stage.fog, fog);
            context.fillRect(bx - 0.7 * scale, by - height * scale, 1.4 * scale, height * scale);
            context.fillStyle = mix(stage.fog, "#ffffff", 0.3);
            context.fillRect(bx - 0.55 * scale, by - height * scale + 0.2 * scale, 1.1 * scale, 0.25 * scale);
            context.globalAlpha = 1;
          },
        });
      }
    }
  }

  function obstacle(item, distance, time) {
    const z = item.at - distance;
    const shape = obstacleShape(item.kind);
    if (z > layout.farZ || z + shape.depth < nearZ()) return;
    const info = OBSTACLES[item.kind];
    // Długie przeszkody (cysterna) — kilka rysunków wzdłuż toru.
    const copies = shape.depth > 3 ? Math.ceil(shape.depth / 4.5) : 1;
    for (let copy = 0; copy < copies; copy += 1) {
      const zz = z + (copies > 1 ? copy * (shape.depth / copies) + 1 : shape.depth / 2);
      drawList.push({
        z: zz,
        draw: () => {
          const x = obstacleX(item);
          const base = project(layout, x, shape.type === "high" ? shape.bottom : 0, zz, point);
          if (!base) return;
          const bx = base.x;
          const by = base.y;
          const scale = base.scale;
          const fog = fogAt(layout, zz);
          context.globalAlpha = 1 - fog;
          const ground = project(layout, x, 0, zz, point2);
          drawShadow(context, ground.x, ground.y, 1.3 * scale, {});
          const sprite = atlas.sprite(info.sprite);
          const height = info.draw * scale;
          const width = sprite ? (height * sprite.size[0]) / sprite.size[1] : height;
          const wobble = item.moveTo !== undefined ? Math.sin(time * 30) * 0.04 : 0;
          if (shape.type === "high") {
            // Wysoka przeszkoda wisi nad torem: słupki po bokach i tablica/dymek na wysokości głowy.
            context.fillStyle = "rgba(60, 50, 80, 0.35)";
            context.fillRect(bx - 0.62 * scale, by, 0.08 * scale, shape.bottom * scale);
            context.fillRect(bx + 0.54 * scale, by, 0.08 * scale, shape.bottom * scale);
            atlas.draw(context, info.sprite, bx, by, { width, height, anchor: [0.5, 1], rotation: wobble });
          } else {
            atlas.draw(context, info.sprite, bx, by, { width, height, anchor: [0.5, 1], rotation: wobble });
          }
          context.globalAlpha = 1;
          if (item.warnedAt !== null && item.moveTo !== undefined && item.moveProgress === 0) {
            arrow(bx, by - height - 0.35 * scale, scale, Math.sign(item.moveTo - item.lane), time);
          }
        },
      });
    }
  }

  function arrow(x, y, scale, direction, time) {
    const size = Math.max(10, 0.45 * scale);
    const pulse = 1 + Math.sin(time * 18) * 0.12;
    context.save();
    context.translate(x, y);
    context.scale(direction * pulse, pulse);
    context.fillStyle = COLORS.pomaranczowy;
    context.strokeStyle = COLORS.bialy;
    context.lineWidth = Math.max(2, size * 0.12);
    context.beginPath();
    context.moveTo(-size, -size * 0.35);
    context.lineTo(size * 0.2, -size * 0.35);
    context.lineTo(size * 0.2, -size * 0.8);
    context.lineTo(size, 0);
    context.lineTo(size * 0.2, size * 0.8);
    context.lineTo(size * 0.2, size * 0.35);
    context.lineTo(-size, size * 0.35);
    context.closePath();
    context.stroke();
    context.fill();
    context.restore();
  }

  function leaf(item, distance, time) {
    if (item.taken) return;
    const z = item.at - distance;
    if (z > layout.farZ || z < nearZ()) return;
    drawList.push({
      z,
      draw: () => {
        const bob = Math.sin(time * 4 + item.at) * 0.08;
        const base = project(layout, laneX(item.lane), item.y + bob, z, point);
        if (!base) return;
        context.globalAlpha = 1 - fogAt(layout, z);
        const size = 0.6 * base.scale;
        atlas.draw(context, LEAF_SPRITE[item.kind] || LEAF_SPRITE.zielony, base.x, base.y, {
          width: size,
          height: size,
          rotation: Math.sin(time * 3 + item.at) * 0.25,
        });
        context.globalAlpha = 1;
      },
    });
  }

  function owlSprite(state, animator, cosmetic) {
    const owl = state.owl;
    drawList.push({
      z: 0,
      draw: () => {
        const ground = project(layout, owl.x, 0, 0, point);
        drawShadow(context, ground.x, ground.y, 1.0 * ground.scale, { lift: Math.min(1, owl.y / 1.5) });
        const base = project(layout, owl.x, owl.y, 0, point);
        const blink = state.invulnerable > 0 && Math.floor(state.time * 12) % 2 === 0;
        context.save();
        context.translate(base.x, base.y);
        context.scale(base.scale, base.scale);
        if (owl.slide > 0) context.scale(1.15, OWL.slideHeight / OWL.height);
        drawOwl(context, atlas, 0, 0, {
          state: animator.state(),
          size: OWL.drawSize,
          cosmetic,
          alpha: blink ? 0.45 : undefined,
          shadow: false,
        });
        context.restore();
      },
    });
  }

  function popupsDraw(dt) {
    context.textAlign = "center";
    context.textBaseline = "middle";
    for (let index = popups.length - 1; index >= 0; index -= 1) {
      const item = popups[index];
      item.life -= dt;
      item.y -= 40 * dt;
      if (item.life <= 0) {
        popups.splice(index, 1);
        continue;
      }
      context.globalAlpha = Math.min(1, item.life / 0.3);
      context.font = font(item.size);
      context.lineWidth = 4;
      context.strokeStyle = COLORS.kontur;
      context.strokeText(item.text, item.x, item.y);
      context.fillStyle = item.color;
      context.fillText(item.text, item.x, item.y);
    }
    context.globalAlpha = 1;
  }

  return {
    layout: () => updateLayout(),
    // Punkt świata → ekran (px CSS), np. dla cząsteczek i napisów.
    toScreen(x, y, z, out = { x: 0, y: 0, scale: 0 }) {
      updateLayout();
      return project(layout, x, y, z, out);
    },
    popup(text, x, y, color = COLORS.bialy, size = 26) {
      if (popups.length > 12) popups.shift();
      popups.push({ text, x, y, color, size, life: 0.9 });
    },
    clearPopups() {
      popups.length = 0;
    },
    draw({ state, animator, cosmetic = "none", particles, dt = 0, showOwl = true }) {
      updateLayout();
      view.applyScreen(context);
      const stage = STAGES[state.stage % STAGES.length];
      const distance = state.stageDistance;
      sky(stage);
      road(stage, distance);
      if (showOwl) laneGlow(state.owl);
      drawList.length = 0;
      scenery(stage, distance);
      for (const item of state.obstacles) obstacle(item, distance, state.time);
      for (const item of state.leaves) leaf(item, distance, state.time);
      if (showOwl) owlSprite(state, animator, cosmetic);
      drawList.sort((a, b) => b.z - a.z);
      for (const item of drawList) item.draw();
      particles?.render(context);
      popupsDraw(dt);
    },
  };
}
