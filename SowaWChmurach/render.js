// Sowa w Chmurach — rysowanie (Canvas 2D, jednostki świata). Kolumna gry ma 9 m szerokości: w pionie cały
// ekran, w poziomie i na komputerze środek ekranu (po bokach przyciemnione niebo). Kamera: dolna krawędź ekranu
// = `cameraBottom`; świat rysowany z osią y w dół (y ekranu = −wysokość). Kolejność: niebo strefy, chmury
// i gwiazdy (paralaksa), ziemia ogródka, platformy (rysowane kodem), liście, sowa (przy krawędzi dwa razy —
// przejście na drugą stronę), kózka w ratunku, cząsteczki, boki kolumny, napisy punktów.
import { drawOwl } from "../shared/world/owl.js";
import { COLORS, font } from "../shared/world/tokens.js";
import { FADE, HAZARDS, OWL, WORLD, ZONES } from "./config.js";
import { goatPose } from "./extras.js";
import { hazardPose } from "./hazards.js";

const LEAF_SPRITE = { zielony: "lisc-zielony", zloty: "lisc-zloty", teczowy: "lisc-teczowy" };

function hash(value) {
  const x = Math.sin(value * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

// Mieszanie kolorów #rrggbb (wynik też #rrggbb).
export function mix(a, b, t) {
  const parse = (hex) => [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const channel = (x, y) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r1, r2)}${channel(g1, g2)}${channel(b1, b2)}`;
}

// Kolory nieba na wysokości `height`: przejście między strefami przez 60 m przed granicą.
export function skyAt(height) {
  let index = 0;
  for (let i = 0; i < ZONES.length; i += 1) if (height >= ZONES[i].from) index = i;
  const next = ZONES[index + 1];
  const blend = next ? Math.min(1, Math.max(0, (height - (next.from - 60)) / 60)) : 0;
  const current = ZONES[index].sky;
  if (!next || blend <= 0) return [...current];
  return [mix(current[0], next.sky[0], blend), mix(current[1], next.sky[1], blend)];
}

// Liczba gwiazd widocznych na niebie (od Zorzy).
const starAlpha = (height) => Math.min(1, Math.max(0, (height - ZONES[3].from + 120) / 200));

export function createRenderer({ canvas, view, atlas }) {
  const context = canvas.getContext("2d");
  const popups = [];
  const camera = { x: WORLD.width / 2, y: 0, zoom: 1, shakeX: 0, shakeY: 0 };
  const point = { x: 0, y: 0 };
  let skyCache = null;
  // Kolor nieba w połowie wysokości ekranu (wycięcia liścia monstery).
  let skyMiddle = COLORS.nieboGora;

  // Dolna krawędź ekranu = cameraBottom; w poziomie kolumna 9 m na środku.
  function placeCamera(state, layout) {
    camera.x = WORLD.width / 2;
    camera.y = -(state.cameraBottom + layout.worldHeight / 2);
  }

  function sky(layout, height) {
    const colors = skyAt(height);
    const key = `${layout.cssHeight}|${colors[0]}|${colors[1]}`;
    if (!skyCache || skyCache.key !== key) {
      const gradient = context.createLinearGradient(0, 0, 0, layout.cssHeight);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
      skyCache = { key, gradient };
      skyMiddle = mix(colors[0], colors[1], 0.5);
    }
    view.applyScreen(context);
    context.fillStyle = skyCache.gradient;
    context.fillRect(0, 0, layout.cssWidth, layout.cssHeight);
  }

  // Paralaksa: chmury (0,35 prędkości kamery) i gwiazdy (0,1) w pikselach ekranu, powtarzane co wysokość ekranu.
  function backdrop(layout, state) {
    const k = layout.scale;
    const height = state.cameraBottom;
    const stars = starAlpha(height);
    if (stars > 0) {
      context.fillStyle = COLORS.bialy;
      for (let index = 0; index < 40; index += 1) {
        const x = hash(index * 3.1) * layout.cssWidth;
        const y = (hash(index * 7.7) * layout.cssHeight + height * k * 0.1) % layout.cssHeight;
        context.globalAlpha = stars * (0.4 + 0.6 * hash(index * 1.3));
        context.fillRect(x, y, 2, 2);
      }
      context.globalAlpha = 1;
    }
    const cloudAlpha = Math.max(0, 1 - stars) * 0.85;
    if (cloudAlpha <= 0) return;
    context.fillStyle = COLORS.bialy;
    for (let index = 0; index < 7; index += 1) {
      const size = (0.9 + hash(index * 2.9) * 1.4) * k;
      const x = hash(index * 5.3) * (layout.cssWidth + size * 2) - size;
      const span = layout.cssHeight + size * 2;
      const y = ((((hash(index * 9.1) * span + height * k * 0.35) % span) + span) % span) - size;
      context.globalAlpha = cloudAlpha * (0.35 + 0.4 * hash(index * 4.4));
      context.beginPath();
      context.ellipse(x, y, size, size * 0.38, 0, 0, Math.PI * 2);
      context.ellipse(x - size * 0.45, y + size * 0.08, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
      context.ellipse(x + size * 0.4, y - size * 0.1, size * 0.55, size * 0.36, 0, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }

  // Ziemia ogródka pod y = 0: trawa, ziemia, płotek i doniczka z monsterą.
  function ground(state, layout) {
    if (state.cameraBottom > 0.5) return;
    const left = -layout.worldWidth;
    const width = layout.worldWidth * 3;
    context.fillStyle = "#8a5a3b";
    context.fillRect(left, 0, width, 3);
    context.fillStyle = COLORS.monstera;
    context.fillRect(left, 0, width, 0.35);
    context.fillStyle = COLORS.monsteraCiemna;
    context.fillRect(left, 0.3, width, 0.08);
    context.fillStyle = COLORS.bialy;
    for (let x = 0.3; x < WORLD.width; x += 0.9) {
      context.fillRect(x, -1.1, 0.22, 1.1);
      context.beginPath();
      context.moveTo(x - 0.02, -1.1);
      context.lineTo(x + 0.11, -1.3);
      context.lineTo(x + 0.24, -1.1);
      context.fill();
    }
    context.fillRect(0, -0.85, WORLD.width, 0.12);
    context.fillRect(0, -0.4, WORLD.width, 0.12);
    context.fillStyle = COLORS.doniczka;
    context.fillRect(7.2, -0.7, 0.9, 0.7);
    atlas.draw(context, "lisc-zielony", 7.65, -1.15, { width: 0.9, rotation: -0.3 });
  }

  function roundRect(x, y, width, height, radius) {
    context.beginPath();
    if (context.roundRect) context.roundRect(x, y, width, height, radius);
    else context.rect(x, y, width, height);
  }

  function branch(x, top, width, dark = false) {
    const left = x - width / 2;
    context.fillStyle = dark ? "#7a4a2e" : "#a0693f";
    roundRect(left, top, width, 0.24, 0.12);
    context.fill();
    context.fillStyle = dark ? "#5e3822" : COLORS.sowaCiemna;
    context.fillRect(left + 0.1, top + 0.15, width - 0.2, 0.06);
  }

  function platformShape(item, time) {
    const x = item.x;
    const top = -item.y;
    const width = item.width;
    const fade = item.fade > 0 ? item.fade / FADE[item.type] : 1;
    context.save();
    if (item.type === "galazka") {
      branch(x, top, width);
      for (const side of [-0.32, 0.3]) {
        context.fillStyle = side < 0 ? COLORS.monstera : COLORS.monsteraJasna;
        context.beginPath();
        context.ellipse(x + side * width, top - 0.05, 0.22, 0.1, side * 1.4, 0, Math.PI * 2);
        context.fill();
      }
    } else if (item.type === "krucha") {
      if (item.spent) {
        context.globalAlpha = fade;
        context.translate(x, top + (1 - fade) * 1.4);
        context.rotate((1 - fade) * 0.5);
        context.translate(-x, -top);
      }
      branch(x, top, width, true);
      context.strokeStyle = COLORS.kontur;
      context.lineWidth = 0.05;
      context.beginPath();
      context.moveTo(x - 0.1, top);
      context.lineTo(x + 0.05, top + 0.1);
      context.lineTo(x - 0.05, top + 0.24);
      context.moveTo(x + width * 0.28, top);
      context.lineTo(x + width * 0.34, top + 0.12);
      context.stroke();
    } else if (item.type === "lisc") {
      context.fillStyle = COLORS.monsteraCiemna;
      context.beginPath();
      context.ellipse(x, top + 0.14, width / 2, 0.24, 0, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = COLORS.monstera;
      context.beginPath();
      context.ellipse(x, top + 0.08, width / 2 - 0.05, 0.18, 0, 0, Math.PI * 2);
      context.fill();
      // Wycięcia liścia monstery i nerw.
      context.fillStyle = skyMiddle;
      for (const offset of [-0.45, -0.2, 0.2, 0.45]) {
        context.beginPath();
        context.ellipse(x + offset * width, top + 0.2, 0.07, 0.09, 0, 0, Math.PI * 2);
        context.fill();
      }
      context.strokeStyle = COLORS.monsteraJasna;
      context.lineWidth = 0.05;
      context.beginPath();
      context.moveTo(x - width / 2 + 0.15, top + 0.08);
      context.lineTo(x + width / 2 - 0.15, top + 0.08);
      context.stroke();
    } else if (item.type === "chmurka") {
      context.globalAlpha = item.spent ? fade : 1;
      const puff = item.spent ? 1 + (1 - fade) * 0.4 : 1 + Math.sin(time * 2 + item.phase) * 0.03;
      context.fillStyle = COLORS.bialy;
      context.beginPath();
      context.ellipse(x, top + 0.18, (width / 2) * puff, 0.24 * puff, 0, 0, Math.PI * 2);
      context.ellipse(x - width * 0.18, top + 0.02, 0.36 * puff, 0.26 * puff, 0, 0, Math.PI * 2);
      context.ellipse(x + width * 0.16, top - 0.02, 0.42 * puff, 0.3 * puff, 0, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = COLORS.wodaJasna;
      context.fillRect(x - width * 0.35, top + 0.3, width * 0.7, 0.08);
    } else if (item.type === "hustawka") {
      context.strokeStyle = COLORS.sowaCiemna;
      context.lineWidth = 0.06;
      context.beginPath();
      for (const side of [-0.42, 0.42]) {
        context.moveTo(x + side * width, top);
        context.lineTo(item.baseX + side * width * 0.6, top - 2.4);
      }
      context.stroke();
      context.fillStyle = COLORS.pomaranczowy;
      roundRect(x - width / 2, top, width, 0.22, 0.08);
      context.fill();
      context.fillStyle = COLORS.zlotoCiemne;
      context.fillRect(x - width / 2 + 0.1, top + 0.14, width - 0.2, 0.05);
    } else if (item.type === "balkon") {
      context.fillStyle = COLORS.szary;
      context.fillRect(x - width / 2, top, width, 0.3);
      context.fillStyle = COLORS.szaryCiemny;
      context.fillRect(x - width / 2, top + 0.24, width, 0.08);
      context.fillStyle = COLORS.szaryCiemny;
      context.fillRect(x - width / 2, top - 0.75, width, 0.07);
      for (let bar = x - width / 2 + 0.05; bar <= x + width / 2; bar += 0.34)
        context.fillRect(bar, top - 0.75, 0.05, 0.75);
      context.fillStyle = COLORS.doniczka;
      context.fillRect(x + width / 2 - 0.65, top - 0.42, 0.42, 0.42);
      atlas.draw(context, "lisc-zielony", x + width / 2 - 0.44, top - 0.62, { width: 0.5, rotation: 0.3 });
    }
    context.restore();
  }

  // Tablica cen Amic (rysowana kodem): dwie linki w górę, zielona tablica z czerwonym paskiem i białymi polami cen.
  function priceBoard(x, y) {
    const info = HAZARDS.kinds.tablica;
    const top = -(y + info.halfH);
    const width = info.halfW * 2;
    const height = info.halfH * 2;
    context.strokeStyle = COLORS.szaryCiemny;
    context.lineWidth = 0.05;
    context.beginPath();
    for (const side of [-0.55, 0.55]) {
      context.moveTo(x + side, top);
      context.lineTo(x + side * 0.6, top - 2.6);
    }
    context.stroke();
    context.fillStyle = COLORS.amicZielony;
    roundRect(x - width / 2, top, width, height, 0.12);
    context.fill();
    context.fillStyle = COLORS.amicCzerwony;
    context.fillRect(x - width / 2, top + 0.08, width, 0.18);
    context.fillStyle = COLORS.bialy;
    for (const row of [0.38, 0.72]) {
      context.fillRect(x - width / 2 + 0.14, top + row, 0.4, 0.22);
      context.fillRect(x + 0.02, top + row, width / 2 - 0.16, 0.22);
    }
  }

  const HAZARD_SPRITES = {
    dymek: ["pracu-dymek", 1.3],
    mail: ["pracu-mail", 0.7],
    telefon: ["pracu-telefon", 0.85],
    sterowiec: ["amic-sterowiec", 2.9],
    kanister: ["amic-kanister", 0.75],
  };

  function hazards(state, low, high) {
    for (const item of state.hazards) {
      if (item.gone || item.born === null) continue;
      hazardPose(item, state.time, point);
      if (point.y < low || point.y > high) continue;
      if (item.kind === "tablica") {
        priceBoard(point.x, point.y);
        continue;
      }
      const [sprite, width] = HAZARD_SPRITES[item.kind];
      // Telefon wibruje, kanister się obraca, dymek lekko się kołysze.
      const shake = item.kind === "telefon" ? Math.sin(state.time * 45 + item.phase) * 0.03 : 0;
      const rotation =
        item.kind === "kanister"
          ? state.time * 3
          : item.kind === "dymek"
            ? Math.sin(state.time * 3 + item.phase) * 0.06
            : 0;
      for (const shift of [0, -WORLD.width, WORLD.width]) {
        const x = point.x + shift + shake;
        if (x < -width || x > WORLD.width + width) continue;
        atlas.draw(context, sprite, x, -point.y, { width, rotation, flipX: item.speed < 0 });
      }
    }
  }

  // Znaczniki kanistrów: pulsujące pomarańczowe kółko z wykrzyknikiem tuż pod HUD-em, nad miejscem spadania.
  function warnings(state, layout) {
    const y = state.cameraBottom + layout.worldHeight - 2.8;
    for (const warning of state.warnings) {
      const pulse = 1 + Math.sin(state.time * 16) * 0.12;
      context.fillStyle = COLORS.pomaranczowy;
      context.beginPath();
      context.arc(warning.x, -y, 0.38 * pulse, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = COLORS.bialy;
      context.fillRect(warning.x - 0.05, -y - 0.24, 0.1, 0.3);
      context.fillRect(warning.x - 0.05, -y + 0.12, 0.1, 0.1);
    }
  }

  // Kózki (atlas: stoją albo w skoku, zwrócone w stronę skoku) i serduszka-doniczki (pulsują).
  const goatPoint = { x: 0, y: 0, hopping: false };
  function extrasDraw(state, low, high) {
    for (const goat of state.goats || []) {
      if (goat.taken) continue;
      goatPose(goat, state.time, goatPoint);
      if (goatPoint.y < low || goatPoint.y > high) continue;
      const sprite = goatPoint.hopping ? `kozka-${goat.kind}-skok` : `kozka-${goat.kind}`;
      atlas.draw(context, sprite, goatPoint.x, -goatPoint.y, { width: 1.1, flipX: goat.to.x < goat.from.x });
    }
    for (const heart of state.hearts || []) {
      if (heart.taken || heart.y < low || heart.y > high) continue;
      const pulse = 1 + Math.sin(state.time * 5) * 0.08;
      atlas.draw(context, "zycie", heart.x, -heart.y, { width: 0.8 * pulse });
    }
  }

  function owlAt(x, y, animator, cosmetic, facing, alpha) {
    drawOwl(context, atlas, x, -y, {
      state: animator.state(),
      size: OWL.drawSize,
      cosmetic,
      flipX: facing < 0,
      alpha,
      shadow: false,
    });
  }

  function popupsDraw(layout, dt) {
    view.applyScreen(context);
    context.textAlign = "center";
    context.textBaseline = "middle";
    for (let index = popups.length - 1; index >= 0; index -= 1) {
      const item = popups[index];
      item.life -= dt;
      item.rise += 1.2 * dt;
      if (item.life <= 0) {
        popups.splice(index, 1);
        continue;
      }
      view.toScreen(camera, item.x, -(item.y + item.rise), point);
      context.globalAlpha = Math.min(1, item.life / 0.3);
      context.font = font(item.size);
      context.lineWidth = 4;
      context.strokeStyle = COLORS.kontur;
      context.strokeText(item.text, point.x, point.y);
      context.fillStyle = item.color;
      context.fillText(item.text, point.x, point.y);
    }
    context.globalAlpha = 1;
  }

  return {
    camera,
    // Napis punktów w miejscu świata (x, wysokość y).
    popup(text, x, y, color = COLORS.bialy, size = 22) {
      if (popups.length > 12) popups.shift();
      popups.push({ text, x, y, rise: 0, color, size, life: 0.9 });
    },
    clearPopups() {
      popups.length = 0;
    },
    // Punkt świata (x, wysokość y) w pikselach CSS.
    toScreen(x, y, out = { x: 0, y: 0 }) {
      return view.toScreen(camera, x, -y, out);
    },
    // Ile metrów świata ma piksel CSS (przeciąganie palcem).
    metersPerPixel: () => 1 / view.layout().scale,
    draw({ state, animator, cosmetic = "none", particles, dt = 0, showOwl = true }) {
      const layout = view.layout();
      placeCamera(state, layout);
      sky(layout, Math.max(0, state.cameraBottom + WORLD.height / 2));
      backdrop(layout, state);
      view.apply(context, camera);
      // Świat przycięty do kolumny (przejście przez krawędź wygląda naturalnie).
      context.save();
      context.beginPath();
      context.rect(0, -state.cameraBottom - layout.worldHeight - 1, WORLD.width, layout.worldHeight + 2);
      context.clip();
      ground(state, layout);
      const low = state.cameraBottom - 1;
      const high = state.cameraBottom + layout.worldHeight + 3;
      for (const item of state.platforms) if (item.y >= low && item.y <= high) platformShape(item, state.time);
      for (const leaf of state.leaves) {
        if (leaf.taken || leaf.y < low || leaf.y > high) continue;
        const bob = Math.sin(state.time * 3 + leaf.x * 2) * 0.08;
        atlas.draw(context, LEAF_SPRITE[leaf.kind], leaf.x, -(leaf.y + bob), {
          width: leaf.kind === "zloty" ? 0.7 : leaf.kind === "teczowy" ? 0.75 : 0.6,
          rotation: Math.sin(state.time * 2 + leaf.y) * 0.2,
        });
      }
      hazards(state, low - 1, high + 2);
      extrasDraw(state, low - 1, high + 2);
      const owl = state.owl;
      if (showOwl) {
        const blink = state.invulnerable > 0 && Math.floor(state.time * 12) % 2 === 0 ? 0.45 : 1;
        // Moce wokół sowy: Tarcza — niebieska bańka, Magnes — fioletowy pierścień.
        const aura = (color, radius, alpha) => {
          context.globalAlpha = alpha;
          context.strokeStyle = color;
          context.lineWidth = 0.08;
          context.beginPath();
          context.arc(owl.x, -(owl.y + 0.6), radius, 0, Math.PI * 2);
          context.stroke();
          context.globalAlpha = 1;
        };
        if (state.powerups?.tarcza > 0) aura(COLORS.niebieski, 0.85, 0.7);
        if (state.powerups?.magnes > 0) aura(COLORS.fiolet, 1 + Math.sin(state.time * 6) * 0.08, 0.5);
        if (state.rocket > 0) {
          // Rakietka: sowa na kózce Turbo, ogień spod kopyt.
          atlas.draw(context, "kozka-turbo-skok", owl.x, -(owl.y - 0.2), { width: 1.3 });
          context.fillStyle = COLORS.pomaranczowy;
          context.beginPath();
          context.ellipse(owl.x, -(owl.y - 0.55), 0.18, 0.35 + Math.sin(state.time * 30) * 0.1, 0, 0, Math.PI * 2);
          context.fill();
        }
        if (state.rescue) {
          // Kózka niesie sowę na platformę.
          const lift = Math.sin(state.time * 18) * 0.05;
          atlas.draw(context, "kozka-sprezynka-skok", owl.x, -(owl.y - 0.15 + lift), { width: 1.3 });
        }
        for (const shift of [0, -WORLD.width, WORLD.width]) {
          const x = owl.x + shift;
          if (x < -OWL.drawSize || x > WORLD.width + OWL.drawSize) continue;
          owlAt(x, owl.y + (state.rescue ? 0.55 : state.rocket > 0 ? 0.45 : 0), animator, cosmetic, owl.facing, blink);
        }
      }
      particles?.render(context);
      warnings(state, layout);
      context.restore();
      // Boki kolumny (poziomo i na komputerze): przyciemnione niebo i krawędź.
      if (layout.worldWidth > WORLD.width + 0.05) {
        const top = -state.cameraBottom - layout.worldHeight - 1;
        const side = (layout.worldWidth - WORLD.width) / 2 + 1;
        context.fillStyle = "rgba(59, 47, 74, 0.22)";
        context.fillRect(-side, top, side, layout.worldHeight + 2);
        context.fillRect(WORLD.width, top, side, layout.worldHeight + 2);
        context.fillStyle = "rgba(255, 255, 255, 0.5)";
        context.fillRect(-0.04, top, 0.04, layout.worldHeight + 2);
        context.fillRect(WORLD.width, top, 0.04, layout.worldHeight + 2);
      }
      // Gorączka Monster: tęczowa poświata przy krawędziach ekranu.
      if (state.fever > 0) {
        view.applyScreen(context);
        const glow = context.createLinearGradient(0, 0, layout.cssWidth, layout.cssHeight);
        glow.addColorStop(0, "rgba(255, 111, 145, 0.16)");
        glow.addColorStop(0.5, "rgba(244, 197, 66, 0.08)");
        glow.addColorStop(1, "rgba(63, 174, 106, 0.16)");
        context.fillStyle = glow;
        context.fillRect(0, 0, layout.cssWidth, layout.cssHeight);
      }
      popupsDraw(layout, dt);
    },
  };
}
