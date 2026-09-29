// Sowie Tory — rysowanie finału planszy i „Humbaczych Torów” (Canvas 2D przez rzutnię z projection.js).
// Finał: trawa, ścieżka z płyt do basenu, płot, drzewa i krzewy, basen ogrodowy, koza na leżaku, grill; sowa biegnie,
// skacze i znika w pluśnięciu, z wody wynurza się humbak z fontanną. Rejs: morze z trzema torami (pasy piany),
// fale, złote kółka z liśćmi Monstery, humbak widziany od tyłu (ogon przy kamerze).
import { drawShadow } from "../shared/engine/sprites.js";
import { COLORS } from "../shared/world/tokens.js";
import { GARDEN, finaleOwl, finaleWhale } from "./finale.js";
import { drawBush, drawDeckchair, drawFence, drawGrill, drawPool, drawTree } from "./garden.js";
import { ROAD_WIDTH, fogAt, laneX, project } from "./projection.js";

const INK = COLORS.kontur;
const GRASS = "#8fd16a";
const GRASS_DARK = "#79bd57";
const SEA = Object.freeze({ sky: ["#8fd3ff", "#e4f7ff"], deep: "#2f7fc0", near: "#56b6e6", foam: "#e9fbff" });

// Dekoracje działki: [x, z, rysunek, wariant] (m względem miejsca, w którym sowa zaczyna finał).
const GARDEN_PROPS = Object.freeze([
  [-6.5, 12.5, "tree", 0],
  [-3, 13.5, "tree", 1],
  [1, 14, "tree", 2],
  [4.5, 12.8, "tree", 3],
  [8, 13.2, "tree", 4],
  [-4.8, 9.2, "bush", 0],
  [-1.6, 9.4, "bush", 1],
  [2.2, 9.3, "bush", 2],
  [5.4, 9.1, "bush", 3],
  [-5.6, 1.6, "bush", 4],
  [5.8, 1.2, "bush", 5],
  [-3.3, 4.4, "deckchair", 0],
  [3.4, 4, "grill", 0],
]);

export function createFinaleScene({ context, atlas }) {
  const point = { x: 0, y: 0, scale: 0 };
  const corner = { x: 0, y: 0, scale: 0 };

  // Czworokąt na ziemi (x0…x1, z0…z1).
  function ground(layout, x0, z0, x1, z1, fill) {
    const corners = [
      [x0, z0],
      [x1, z0],
      [x1, z1],
      [x0, z1],
    ].map(([x, z]) => {
      const p = project(layout, x, 0, z, corner);
      return p && [p.x, p.y];
    });
    if (corners.some((item) => !item)) return;
    context.fillStyle = fill;
    context.beginPath();
    corners.forEach(([x, y], index) => (index ? context.lineTo(x, y) : context.moveTo(x, y)));
    context.closePath();
    context.fill();
  }

  // Rekwizyt w metrach w punkcie świata (props/garden: y w górę ujemne).
  function at(layout, x, y, z, draw) {
    const base = project(layout, x, y, z, point);
    if (!base) return;
    context.save();
    context.translate(base.x, base.y);
    context.scale(base.scale, base.scale);
    draw();
    context.restore();
  }

  function sky(layout, colors) {
    const gradient = context.createLinearGradient(0, 0, 0, layout.horizonY);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    context.fillStyle = gradient;
    context.fillRect(0, 0, layout.width, layout.horizonY + 2);
  }

  function poolGeometry(layout) {
    const center = project(layout, 0, 0, GARDEN.poolZ, point);
    const cx = center.x;
    const scale = center.scale;
    const front = project(layout, 0, 0, GARDEN.poolZ - GARDEN.poolRadius, corner).y;
    const back = project(layout, 0, 0, GARDEN.poolZ + GARDEN.poolRadius, corner).y;
    return {
      cx,
      cy: (front + back) / 2,
      rx: GARDEN.poolRadius * scale,
      ry: (front - back) / 2,
      wall: GARDEN.wall * scale,
      rim: 0.3 * scale,
    };
  }

  // Finał: `finale` — stan osi czasu (createFinale().state), `startX` — położenie sowy w bok na mecie,
  // `drawOwlAt(x, y, skala, alfa)` — sowa rysowana przez render.js (ta sama sowa i ubranko co w biegu).
  function drawGarden({ layout, finale, startX, time, drawOwlAt }) {
    sky(layout, ["#9fdcff", "#fff3dc"]);
    // Całe płótno pod horyzontem (także pas za końcem płaszczyzny ziemi) — trawa.
    context.fillStyle = GRASS;
    context.fillRect(0, layout.horizonY, layout.width, layout.height - layout.horizonY);
    // Pasy koszonej trawy i ścieżka z płyt do basenu.
    for (let z = 0; z < 30; z += 2) ground(layout, -40, z, 40, z + 1, GRASS_DARK);
    for (let z = -2; z < GARDEN.poolZ - GARDEN.poolRadius - 0.4; z += 1.1) {
      ground(layout, -0.55, z, 0.55, z + 0.8, "#e9dcc6");
    }
    const owl = finaleOwl(finale, startX);
    const whale = finaleWhale(finale);
    // Kolejność od najdalszych: drzewa, płot, krzewy, basen z humbakiem, leżak, grill, sowa (bliżej basenu — za nim).
    const list = GARDEN_PROPS.map(([x, z, kind, variant]) => ({
      z,
      draw: () =>
        at(layout, x, 0, z, () => {
          if (kind === "tree") drawTree(context, time, variant);
          else if (kind === "bush") drawBush(context, time, variant);
          else if (kind === "grill") drawGrill(context, time);
          else {
            drawDeckchair(context);
            // Koza na leżaku (sprite kózki z atlasu, lekko przechylona).
            atlas.draw(context, "kozka-podwajaczka", 0.1, -0.65, {
              width: 1.2,
              height: 1.2,
              anchor: [0.5, 0.9],
              rotation: -0.45 + Math.sin(time * 1.5) * 0.03,
            });
          }
        }),
    }));
    list.push({ z: 9.6, draw: () => at(layout, 0, 0, 9.6, () => drawFence(context, 40)) });
    list.push({
      z: GARDEN.poolZ,
      draw: () => {
        const pool = poolGeometry(layout);
        drawPool(context, pool, time);
        const water = project(layout, 0, GARDEN.water, GARDEN.poolZ, point);
        if (whale) {
          const base = project(layout, 0, whale.y, GARDEN.poolZ, corner);
          const size = base.scale * 3.2 * whale.scale;
          atlas.draw(context, "humbak", base.x, base.y, { width: size, height: size / 2, rotation: -0.12 });
          if (whale.spout > 0) {
            const top = base.y - size * 0.25;
            for (let index = 0; index < 7; index += 1) {
              const spread = (index - 3) * 0.12;
              context.fillStyle = index % 2 ? COLORS.wodaJasna : COLORS.woda;
              context.beginPath();
              context.arc(
                base.x - size * 0.15 + spread * base.scale,
                top - whale.spout * base.scale * (1.4 - Math.abs(spread)),
                base.scale * 0.1,
                0,
                Math.PI * 2,
              );
              context.fill();
            }
          }
        }
        const phase = finale.phase;
        if (phase === "splash" || (phase === "morph" && finale.progress < 0.4)) {
          const grow = phase === "splash" ? finale.progress : 1;
          atlas.draw(context, "plusk", water.x, water.y, {
            width: water.scale * (1.2 + grow * 1.2),
            height: water.scale * (1.2 + grow * 1.2),
            anchor: [0.5, 1],
          });
          for (let index = 0; index < 6; index += 1) {
            const rise = (time * 1.4 + index / 6) % 1;
            atlas.draw(
              context,
              "babelek",
              water.x + Math.sin(index * 2.1) * water.scale * 1.2,
              water.y - rise * water.scale,
              {
                width: water.scale * 0.25,
                height: water.scale * 0.25,
              },
            );
          }
        }
      },
    });
    if (owl) {
      list.push({
        // Sowa w skoku nad basenem rysowana po nim (bliżej kamery niż środek).
        z: owl.z >= GARDEN.poolZ - 0.2 ? GARDEN.poolZ - 0.3 : owl.z,
        draw: () => {
          const groundPoint = project(layout, owl.x, 0, owl.z, corner);
          if (owl.y < 0.05 || owl.z < GARDEN.poolZ - GARDEN.poolRadius) {
            drawShadow(context, groundPoint.x, groundPoint.y, groundPoint.scale, { lift: Math.min(1, owl.y / 1.5) });
          }
          const base = project(layout, owl.x, owl.y, owl.z, point);
          drawOwlAt(base.x, base.y, base.scale, owl.alpha);
        },
      });
    }
    list.sort((a, b) => b.z - a.z);
    for (const item of list) item.draw();
  }

  // Humbak od tyłu (ogon przy kamerze, głowa w głębi): ciemnoniebieski grzbiet z garbem, długie płetwy piersiowe
  // z białym spodem (znak humbaka), zwężający się trzon ogona i szeroka płetwa ogonowa machająca w górę i w dół.
  function drawWhaleBack(time, leap) {
    const beat = Math.sin(time * (leap ? 3 : 6));
    context.lineWidth = 0.045;
    context.lineJoin = "round";
    context.strokeStyle = INK;
    // Płetwy piersiowe (długie, jasne od spodu).
    for (const side of [-1, 1]) {
      context.save();
      context.translate(side * 0.45, -0.95);
      context.rotate(side * (0.5 + beat * 0.08));
      context.beginPath();
      context.ellipse(side * 0.55, 0, 0.62, 0.13, 0, 0, Math.PI * 2);
      context.fillStyle = "#e3edf6";
      context.fill();
      context.stroke();
      context.beginPath();
      context.ellipse(side * 0.55, -0.04, 0.58, 0.08, 0, 0, Math.PI * 2);
      context.fillStyle = "#4b6f93";
      context.fill();
      context.restore();
    }
    // Grzbiet: od trzonu ogona (przy kamerze) do zaokrąglonej głowy w głębi.
    context.beginPath();
    context.moveTo(-0.14, -0.2);
    context.quadraticCurveTo(-0.68, -0.6, -0.6, -1.15);
    context.quadraticCurveTo(-0.45, -1.6, 0, -1.62);
    context.quadraticCurveTo(0.45, -1.6, 0.6, -1.15);
    context.quadraticCurveTo(0.68, -0.6, 0.14, -0.2);
    context.closePath();
    context.fillStyle = "#3d5f84";
    context.fill();
    context.stroke();
    // Garb i blask na grzbiecie.
    context.beginPath();
    context.ellipse(0, -0.72, 0.12, 0.2, 0, 0, Math.PI * 2);
    context.fillStyle = "#35536f";
    context.fill();
    context.fillStyle = "rgba(255, 255, 255, 0.22)";
    context.beginPath();
    context.ellipse(-0.22, -1.25, 0.18, 0.1, -0.5, 0, Math.PI * 2);
    context.fill();
    // Płetwa ogonowa przy kamerze (mach w górę i w dół = zmiana wysokości).
    context.save();
    context.translate(0, -0.2);
    context.scale(1, 0.75 + beat * 0.35);
    context.beginPath();
    context.moveTo(0, 0);
    context.quadraticCurveTo(-0.5, -0.02, -0.92, 0.2);
    context.quadraticCurveTo(-0.62, 0.3, -0.3, 0.24);
    context.quadraticCurveTo(-0.1, 0.22, 0, 0.32);
    context.quadraticCurveTo(0.1, 0.22, 0.3, 0.24);
    context.quadraticCurveTo(0.62, 0.3, 0.92, 0.2);
    context.quadraticCurveTo(0.5, -0.02, 0, 0);
    context.closePath();
    context.fillStyle = "#35536f";
    context.fill();
    context.stroke();
    context.restore();
  }

  // Rejs: `ride` — stan rejsu (createWhaleRide().state); `leafSprite(kind)` — nazwa sprite'a liścia.
  function drawSea({ layout, ride: state, time, leafSprite }) {
    sky(layout, SEA.sky);
    const near = -layout.cameraBack + 0.3;
    context.fillStyle = SEA.deep;
    context.fillRect(0, layout.horizonY, layout.width, layout.height - layout.horizonY);
    ground(layout, -ROAD_WIDTH / 2, near, ROAD_WIDTH / 2, layout.farZ, SEA.near);
    // Pasy piany między torami i fale (przesuwają się z płynięciem).
    for (const edge of [-0.5, 0.5]) {
      const x = edge * 2 * laneX(0.5);
      for (let z = 3 - (state.distance % 3); z < layout.farZ; z += 3) {
        ground(layout, x - 0.05, Math.max(z, near), x + 0.05, z + 1.4, SEA.foam);
      }
    }
    context.strokeStyle = "rgba(255, 255, 255, 0.5)";
    context.lineCap = "round";
    for (let row = 0; row < 14; row += 1) {
      const z = (((row * 4.3 - state.distance) % 60) + 60) % 60;
      const base = project(layout, ((row * 7.7) % 18) - 9, 0, z, point);
      if (!base) continue;
      context.globalAlpha = 1 - fogAt(layout, z);
      context.lineWidth = Math.max(1, base.scale * 0.05);
      context.beginPath();
      context.arc(base.x, base.y, base.scale * 0.3, Math.PI * 1.15, Math.PI * 1.85);
      context.stroke();
    }
    context.globalAlpha = 1;
    // Kółka z liśćmi (od najdalszych).
    const rings = state.rings.filter((ring) => !ring.taken && ring.at - state.distance > -1);
    for (let index = rings.length - 1; index >= 0; index -= 1) {
      const ring = rings[index];
      const z = ring.at - state.distance;
      if (z > layout.farZ) continue;
      const base = project(layout, laneX(ring.lane), ring.y, z, point);
      if (!base) continue;
      context.globalAlpha = 1 - fogAt(layout, z);
      context.lineWidth = base.scale * 0.1;
      context.strokeStyle = ring.gold ? COLORS.zloto : COLORS.zlotoCiemne;
      context.beginPath();
      context.ellipse(base.x, base.y, base.scale * 0.55, base.scale * 0.6, 0, 0, Math.PI * 2);
      context.stroke();
      atlas.draw(context, leafSprite(ring.gold ? "zloty" : "zielony"), base.x, base.y, {
        width: base.scale * 0.6,
        height: base.scale * 0.6,
        rotation: Math.sin(time * 3 + ring.at) * 0.25,
      });
      context.globalAlpha = 1;
    }
    // Humbak: cień na wodzie i ciało (wyżej przy wyskoku).
    const shadow = project(layout, state.x, 0, 0.4, corner);
    drawShadow(context, shadow.x, shadow.y, shadow.scale * 1.6, { lift: Math.min(1, state.y / 2) });
    at(layout, state.x, state.y, 0.4, () => {
      context.scale(0.9, 0.9);
      drawWhaleBack(time, state.airborne);
    });
    // Pluśnięcie wokół humbaka.
    if (!state.airborne) {
      const water = project(layout, state.x, 0, 0.2, point);
      context.fillStyle = "rgba(233, 251, 255, 0.8)";
      for (let index = 0; index < 5; index += 1) {
        const phase = (time * 2 + index / 5) % 1;
        context.beginPath();
        context.arc(
          water.x + (index - 2) * water.scale * 0.4,
          water.y - phase * water.scale * 0.25,
          water.scale * 0.07 * (1 - phase),
          0,
          Math.PI * 2,
        );
        context.fill();
      }
    }
  }

  return { drawGarden, drawSea };
}
