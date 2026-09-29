// Sowie Tory — rysowanie (Canvas 2D, piksele CSS przez rzutnię perspektywiczną z projection.js): niebo, scenografia
// po bokach drogi (poza korytarzem trzech torów), droga z przesuwającą się teksturą, podświetlenie toru pod sową,
// przeszkody i liście posortowane po głębokości, mgła w oddali, sowa, strzałki ostrzegawcze, napisy punktów;
// na blokowisku PRL szarżujące dziki (strzałka przy dolnej krawędzi toru) i stado u dołu ekranu (wskaźnik żyć).
// Po mecie: działka z basenem (finał) i morskie tory rejsu humbaka — finale-scene.js.
import { drawShadow } from "../shared/engine/sprites.js";
import { drawOwl } from "../shared/world/owl.js";
import { COLORS, font } from "../shared/world/tokens.js";
import { OWL } from "./config.js";
import { createFinaleScene } from "./finale-scene.js";
import { OBSTACLES, obstacleShape, obstacleX } from "./obstacles.js";
import { DECOR_PROPS, OBSTACLE_PROPS, drawBoar, drawOverhead } from "./props.js";
import { ROAD_WIDTH, computeProjection, depthAtScreenY, fogAt, laneX, project } from "./projection.js";
import { SCENERY, sceneryBetween } from "./scenery.js";
import { STAGES } from "./stages.js";

const LEAF_SPRITE = { zielony: "lisc-zielony", zloty: "lisc-zloty", teczowy: "lisc-teczowy" };

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
  const scene = createFinaleScene({ context, atlas });

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
    const ground = SCENERY[stage.id]?.ground || mix(stage.floor, "#6b5a4a", 0.12);
    quad(-half - 30, 0, near, -half, 0, far, ground);
    quad(half, 0, near, half + 30, 0, far, ground);
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

  // Scenografia planszy (scenery.js, rysunki z props.js): dekoracje przy bokach i elementy wysoko nad drogą.
  function scenery(stage, distance, time) {
    for (const item of sceneryBetween(stage.id, distance, nearZ() - 1, layout.farZ)) {
      drawList.push({
        z: item.z,
        draw: () => {
          const base = project(layout, item.x, item.overhead ? item.height : 0, item.z, point);
          if (!base) return;
          context.save();
          context.globalAlpha = 1 - fogAt(layout, item.z) * 0.9;
          context.translate(base.x, base.y);
          context.scale(base.scale, base.scale);
          if (item.overhead) drawOverhead(context, item.kind, item.width, time);
          else DECOR_PROPS[item.kind]?.(context, time, item.seed);
          context.restore();
        },
      });
    }
  }

  function obstacle(item, distance, time) {
    const z = item.at - distance;
    const shape = obstacleShape(item.kind);
    if (z > layout.farZ || z + shape.depth < nearZ()) return;
    const info = OBSTACLES[item.kind];
    // Długie przeszkody (cysterna) — kilka rysunków wzdłuż toru.
    const copies = shape.depth > 5 ? Math.ceil(shape.depth / 4.5) : 1;
    for (let copy = 0; copy < copies; copy += 1) {
      const zz = z + (copies > 1 ? copy * (shape.depth / copies) + 1 : Math.min(shape.depth / 2, 0.6));
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
          if (info.prop) {
            // Skórka planszy rysowana kodem (props.js) — w metrach od punktu na ziemi.
            context.save();
            context.translate(ground.x, ground.y);
            context.scale(ground.scale, ground.scale);
            OBSTACLE_PROPS[info.prop](context, time, Math.floor(item.at));
            context.restore();
            context.globalAlpha = 1;
            return;
          }
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

  // Szarżujący dzik (PRL): w czasie ostrzeżenia pulsująca strzałka przy dolnej krawędzi toru, potem dzik biegnie
  // torem od dołu ekranu w głąb (szybciej niż sowa).
  function boar(item, time) {
    const z = item.phase === "warning" ? nearZ() + 1.2 : item.z;
    if (item.phase === "charge" && (z < nearZ() || z > layout.farZ)) return;
    drawList.push({
      z: item.phase === "warning" ? -99 : z,
      draw: () => {
        const base = project(layout, laneX(item.lane), 0, z, point);
        if (!base) return;
        if (item.phase === "warning") {
          context.save();
          context.translate(base.x, base.y - 0.5 * base.scale);
          context.rotate(-Math.PI / 2);
          arrow(0, 0, base.scale, 1, time);
          context.restore();
          return;
        }
        context.save();
        context.globalAlpha = 1 - fogAt(layout, z);
        drawShadow(context, base.x, base.y, 1.1 * base.scale, {});
        context.translate(base.x, base.y);
        context.scale(base.scale * 1.3, base.scale * 1.3);
        drawBoar(context, time, item.lane, { angry: true });
        context.restore();
      },
    });
  }

  // Stado dzików u dołu ekranu (PRL): im mniej żyć, tym bliżej i większe.
  function herd(state, time) {
    const spread = state.maxLives > 1 ? (state.maxLives - Math.max(1, state.lives)) / (state.maxLives - 1) : 1;
    const perMeter = (layout.roadPx / ROAD_WIDTH) * (0.55 + spread * 0.45);
    for (let index = 0; index < 4; index += 1) {
      const x = layout.width * (0.14 + index * 0.24) + Math.sin(time * 3 + index * 1.7) * perMeter * 0.1;
      const y = layout.height + perMeter * (0.42 - spread * 0.28) + Math.abs(Math.sin(time * 9 + index)) * 3;
      context.save();
      context.translate(x, y);
      context.scale(perMeter, perMeter);
      drawBoar(context, time, index * 1.3, { angry: spread > 0.5 });
      context.restore();
    }
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
      if (state.phase === "finale" && state.finale) {
        scene.drawGarden({
          layout,
          finale: state.finale,
          startX: state.finaleX,
          time: state.time,
          drawOwlAt: (x, y, scale, alpha) => {
            context.save();
            context.translate(x, y);
            context.scale(scale, scale);
            drawOwl(context, atlas, 0, 0, {
              state: animator.state(),
              size: OWL.drawSize,
              cosmetic,
              alpha: alpha < 1 ? Math.max(0, alpha) : undefined,
              shadow: false,
            });
            context.restore();
          },
        });
        particles?.render(context);
        popupsDraw(dt);
        return;
      }
      if (state.ride && (state.phase === "whale" || state.phase === "stageEnd")) {
        scene.drawSea({
          layout,
          ride: state.ride,
          time: state.time,
          leafSprite: (kind) => LEAF_SPRITE[kind] || LEAF_SPRITE.zielony,
        });
        particles?.render(context);
        popupsDraw(dt);
        return;
      }
      const stage = STAGES[state.stage % STAGES.length];
      const distance = state.stageDistance;
      sky(stage);
      road(stage, distance);
      if (showOwl) laneGlow(state.owl);
      drawList.length = 0;
      scenery(stage, distance, state.time);
      for (const item of state.obstacles) obstacle(item, distance, state.time);
      for (const item of state.leaves) leaf(item, distance, state.time);
      for (const item of state.boars || []) boar(item, state.time);
      if (showOwl) owlSprite(state, animator, cosmetic);
      drawList.sort((a, b) => b.z - a.z);
      for (const item of drawList) item.draw();
      if (stage.chase && showOwl && state.phase !== "over") herd(state, state.time);
      particles?.render(context);
      popupsDraw(dt);
    },
  };
}
