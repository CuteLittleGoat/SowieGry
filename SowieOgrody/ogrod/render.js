// Sowie Ogrody — rysowanie ogrodu na płótnie (piksele CSS): tło bieżącego rozdziału, półka z roślinami (każdy
// gatunek w doniczce, wszystkie w jednej przesuwanej linii — shelf.js; wielkość i liczba liści rosną z kamieniami
// milowymi), sowa ogrodniczka z atlasu Sowiego Świata, krople po podlaniu, napisy „+N” po stuknięciu i cząsteczki
// liści.
import { drawOwl } from "../../shared/world/owl.js";
import { COLORS, font } from "../../shared/world/tokens.js";
import { GARDEN_EVENTS } from "./config.js";
import { formatNumber } from "./economy.js";
import { createPlantShapes, drawSceneDecor, NEW_SCENES } from "./decor.js";
import { sceneId } from "./garden.js";
import { plantScale, SHELF, shelfLayout } from "./shelf.js";

// Tło rozdziału: [niebo u góry, niebo u dołu, podłoże].
const SCENES = {
  parapet: ["#fff4fa", "#dff6ff", "#f4d7a0"],
  balkon: ["#cdeeff", "#fff6e3", "#c9c3d3"],
  dzialka: ["#bfe9ff", "#e7ffe6", "#a8d977"],
  basen: ["#bfe9ff", "#dff5fb", "#9fd9e8"],
  szklarnia: ["#dfffee", "#b9efd3", "#8fcf9a"],
  arboretum: ["#e8f7d4", "#c8ebb0", "#7fbf62"],
  // Rozdziały 7–14 (uwaga O3) — decor.js.
  ...NEW_SCENES,
};

// Skala rysunku względem ogrodu telefonu (360 × 260 px CSS): rośliny i sowa rosną razem z płótnem (komputer),
// ale nie maleją poniżej 0,85 ani nie rosną ponad 2.
export function gardenUnit(width, height) {
  return Math.min(2, Math.max(0.85, Math.min(width / 360, height / 260)));
}

/**
 * createGardenRenderer({ canvas, atlas, scroll }) — `scroll`: przesuwanie półki z shelf.js (`createShelfScroll`);
 * renderer co klatkę podaje mu układ półki (`sync`) i przesuwa go o czas klatki (`update`). Bez niego półka stoi
 * na początku linii.
 */
export function createGardenRenderer({ canvas, atlas, scroll = null }) {
  const context = canvas.getContext("2d");
  const popups = [];
  const particles = [];
  let size = { width: 0, height: 0, ratio: 1 };
  // Miejsca roślin (piksele CSS: środek doniczki u dołu, skala rysunku, czy środek jest w ogrodzie) — do ciężarówki,
  // napisów i testów; także rośliny przesunięte poza ogród.
  const spots = new Map();
  const shapes = createPlantShapes(context);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    size = { width: Math.max(1, rect.width), height: Math.max(1, rect.height), ratio };
    canvas.width = Math.round(size.width * ratio);
    canvas.height = Math.round(size.height * ratio);
  }

  function roundRect(x, y, width, height, radius) {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.fill();
  }

  function background(chapterId, time) {
    const { width, height } = size;
    const [top, bottom, ground] = SCENES[chapterId] || SCENES.parapet;
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, bottom);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    const floor = height * 0.6;
    if (drawSceneDecor(context, chapterId, width, height, floor, time)) {
      // Rozdziały 7–14: dekoracje z decor.js.
    } else if (chapterId === "parapet") {
      // Okno: rama i szprosy, za szybą chmurka.
      context.fillStyle = "rgba(255, 255, 255, 0.7)";
      roundRect(width * 0.12, height * 0.06, width * 0.76, height * 0.5, 20);
      context.strokeStyle = "rgba(86, 120, 150, 0.3)";
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(width * 0.5, height * 0.07);
      context.lineTo(width * 0.5, height * 0.55);
      context.moveTo(width * 0.13, height * 0.3);
      context.lineTo(width * 0.87, height * 0.3);
      context.stroke();
    } else if (chapterId === "balkon") {
      context.strokeStyle = COLORS.szaryCiemny;
      context.lineWidth = 3;
      for (let x = 10; x < width; x += 26) {
        context.beginPath();
        context.moveTo(x, floor - height * 0.2);
        context.lineTo(x, floor);
        context.stroke();
      }
      context.fillStyle = COLORS.szaryCiemny;
      context.fillRect(0, floor - height * 0.2, width, 5);
    } else if (chapterId === "dzialka") {
      context.fillStyle = COLORS.bialy;
      for (let x = 6; x < width; x += 22) context.fillRect(x, floor - height * 0.12, 9, height * 0.12);
      context.fillRect(0, floor - height * 0.09, width, 5);
    } else if (chapterId === "basen") {
      context.fillStyle = COLORS.woda;
      context.beginPath();
      context.ellipse(width * 0.8, floor - 6, width * 0.16, 14, 0, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "rgba(255, 255, 255, 0.6)";
      context.beginPath();
      context.ellipse(width * 0.8 + Math.sin(time) * 6, floor - 9, width * 0.08, 4, 0, 0, Math.PI * 2);
      context.fill();
    } else if (chapterId === "szklarnia") {
      context.strokeStyle = "rgba(78, 130, 105, 0.35)";
      context.lineWidth = 3;
      for (let x = width * 0.1; x <= width * 0.9; x += width * 0.16) {
        context.beginPath();
        context.moveTo(x, height * 0.05);
        context.lineTo(x, floor);
        context.stroke();
      }
    } else {
      context.fillStyle = "rgba(63, 174, 106, 0.35)";
      for (const [x, r] of [
        [0.12, 46],
        [0.88, 56],
        [0.32, 30],
      ]) {
        context.beginPath();
        context.arc(width * x, floor - r, r, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.fillStyle = ground;
    context.fillRect(0, floor, width, height - floor);
    context.fillStyle = "rgba(59, 47, 74, 0.08)";
    context.fillRect(0, floor, width, 4);
  }

  // Roślina w doniczce: `stage` 1–5 (kamienie milowe) — wielkość, liczba liści, kwiat przy 5. Wielkość zależy tylko
  // od etapu i ogrodu (`plantScale`), nie od liczby gatunków na półce.
  function plant(item, x, y, stage, time) {
    const scale = plantScale(stage, gardenUnit(size.width, size.height));
    const potWidth = 26 * scale;
    context.fillStyle = COLORS.doniczka;
    roundRect(x - potWidth / 2, y - 20 * scale, potWidth, 20 * scale, 5);
    context.fillStyle = "rgba(59, 47, 74, 0.15)";
    context.fillRect(x - potWidth / 2, y - 20 * scale, potWidth, 4);
    // Rośliny rozdziałów 7–14 mają własny kształt (decor.js).
    if (item.shape && shapes[item.shape]) {
      shapes[item.shape](item, x, y - 20 * scale, scale, stage, time);
      return;
    }
    const leaves = 2 + stage;
    context.fillStyle = item.color;
    for (let index = 0; index < leaves; index += 1) {
      const angle = -Math.PI / 2 + (index - (leaves - 1) / 2) * 0.42 + Math.sin(time * 1.6 + index + x) * 0.05;
      const length = (16 + stage * 4) * scale;
      context.save();
      context.translate(x, y - 20 * scale);
      context.rotate(angle + Math.PI / 2);
      context.beginPath();
      context.ellipse(0, -length / 2, 6 * scale, length / 2, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
    if (stage >= 5) {
      context.fillStyle = COLORS.zloto;
      context.beginPath();
      context.arc(x, y - 20 * scale - (24 + stage * 4) * scale, 5 * scale, 0, Math.PI * 2);
      context.fill();
    }
  }

  // Półka (uwaga z 2026-11-11): wszystkie posiadane gatunki w jednej linii na podłodze, w pełnej wielkości; linia
  // przesuwa się w bok (`scroll`). Rysowane tylko rośliny w ogrodzie albo tuż przy jego krawędzi (liście wystają poza
  // miejsce). Podpisy „×N” na końcu, na jasnych plakietkach, żeby nie chowały się pod liśćmi.
  function shelf(state, time, dt) {
    const { width, height } = size;
    const unit = gardenUnit(width, height);
    const layout = shelfLayout(state, width / unit);
    scroll?.sync(layout);
    scroll?.update(dt);
    const offset = scroll ? scroll.offset() : 0;
    const label = Math.min(unit, 1.4);
    const y = Math.min(height * SHELF.baseline, height - 18 * label);
    const margin = 80 * unit;
    spots.clear();
    const placed = [];
    for (const entry of layout.items) {
      const x = (entry.center - offset) * unit;
      spots.set(entry.id, { x, y, scale: plantScale(entry.stage, unit), visible: x >= 0 && x <= width });
      if (x > -margin && x < width + margin) placed.push({ ...entry, x });
    }
    for (const { item, x, stage } of placed) plant(item, x, y, stage, time);
    context.font = font(Math.round(11 * label));
    context.textAlign = "center";
    for (const { item, x } of placed) {
      const text = `×${formatNumber(state.plants[item.id])}`;
      const textWidth = context.measureText(text).width;
      context.fillStyle = "rgba(255, 255, 255, 0.75)";
      roundRect(x - textWidth / 2 - 4 * label, y + 2 * label, textWidth + 8 * label, 14 * label, 7 * label);
      context.fillStyle = COLORS.kontur;
      context.fillText(text, x, y + 13 * label);
    }
  }

  // Sowa ogrodniczka (bez wybranej garderoby — w kapeluszu ogrodnika) stoi na środku, stopy na podłożu.
  function owl(animator, cosmetic) {
    if (!atlas?.ready?.() || !animator) return;
    const { width, height } = size;
    const owlSize = Math.min(height * 0.36, width * 0.32, 96 * gardenUnit(width, height));
    drawOwl(context, atlas, width / 2, height * 0.6, {
      state: animator.state(),
      size: owlSize,
      cosmetic: cosmetic === "none" ? "gardenerHat" : cosmetic,
    });
  }

  // ---------- Zdarzenia (E7c) ----------
  // Miejsca do stuknięcia (piksele CSS): telefon, ciężarówka, kózka — `hit(x, y)` w main.js.
  const hits = { phone: null, truck: null, goat: null };

  // Telefon Pracu Pracu dzwoni w lewym górnym rogu ogrodu: drży, rozchodzą się fale dzwonka.
  function phone(state, time) {
    hits.phone = null;
    if (!state.phone) return;
    const unit = gardenUnit(size.width, size.height);
    const box = 44 * unit;
    const x = 12 + box / 2;
    const y = 12 + box / 2;
    context.strokeStyle = COLORS.pracu;
    context.lineWidth = 3;
    for (let ring = 0; ring < 2; ring += 1) {
      const phase = (time * 1.5 + ring * 0.5) % 1;
      context.globalAlpha = 1 - phase;
      context.beginPath();
      context.arc(x, y, box * (0.55 + phase * 0.5), -0.9, 0.9);
      context.stroke();
    }
    context.globalAlpha = 1;
    const rotation = Math.sin(time * 38) * 0.14;
    if (!(atlas?.ready?.() && atlas.draw(context, "pracu-telefon", x, y, { width: box, height: box, rotation }))) {
      context.fillStyle = COLORS.pracu;
      roundRect(x - box * 0.3, y - box * 0.45, box * 0.6, box * 0.9, 8);
    }
    hits.phone = { x, y, r: box * 0.75 };
  }

  // Ciężarówka Amic (cysterna) stoi na zastawionej grządce; nad nią licznik stuknięć.
  function truck(state) {
    hits.truck = null;
    if (!state.truck || !state.blocked) return;
    const spot = spots.get(state.blocked);
    if (!spot) return;
    const unit = gardenUnit(size.width, size.height);
    const width = Math.min(size.width * 0.34, 120 * unit);
    const height = width / 2;
    if (!(atlas?.ready?.() && atlas.draw(context, "amic-cysterna", spot.x, spot.y, { width, height }))) {
      context.fillStyle = COLORS.amicCzerwony;
      roundRect(spot.x - width / 2, spot.y - height, width, height * 0.8, 8);
    }
    hits.truck = { x: spot.x, y: spot.y - height / 2, r: width / 2 };
  }

  // Złota kózka przebiega przez ogród (7 s), podskakując; złota poświata.
  function goat(state, visible) {
    hits.goat = null;
    if (!state.goat) return;
    const unit = gardenUnit(size.width, size.height);
    const box = 54 * unit;
    const share = Math.min(1, state.goat.time / visible);
    const span = size.width + box * 2;
    const x = state.goat.dir > 0 ? -box + share * span : size.width + box - share * span;
    const hop = Math.abs(Math.sin(share * Math.PI * 7));
    const y = size.height * 0.64 - hop * 26 * unit;
    const glow = context.createRadialGradient(x, y - box * 0.45, 4, x, y - box * 0.45, box * 0.9);
    glow.addColorStop(0, "rgba(255, 210, 74, 0.7)");
    glow.addColorStop(1, "rgba(255, 210, 74, 0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(x, y - box * 0.45, box * 0.9, 0, Math.PI * 2);
    context.fill();
    const name = hop > 0.3 ? "kozka-sprezynka-skok" : "kozka-sprezynka";
    if (!(
      atlas?.ready?.() && atlas.draw(context, name, x, y, { width: box, height: box, flipX: state.goat.dir < 0 })
    )) {
      context.fillStyle = COLORS.zloto;
      roundRect(x - box * 0.4, y - box * 0.7, box * 0.8, box * 0.6, 10);
    }
    hits.goat = { x, y: y - box * 0.45, r: box * 0.8 };
  }

  // Zatoka Humbaka: woda zasłania ogród, humbak w fontannie u dołu, liście lecą (współrzędne 0–1).
  function bay(state, time, fountain) {
    if (!state.bay) return;
    const { width, height } = size;
    const water = context.createLinearGradient(0, 0, 0, height);
    water.addColorStop(0, "rgba(191, 233, 255, 0.92)");
    water.addColorStop(1, "rgba(92, 200, 232, 0.95)");
    context.fillStyle = water;
    context.fillRect(0, 0, width, height);
    context.fillStyle = "rgba(255, 255, 255, 0.5)";
    for (let wave = 0; wave < 3; wave += 1) {
      const y = height * (0.3 + wave * 0.2);
      context.beginPath();
      for (let x = 0; x <= width; x += 12) context.lineTo(x, y + Math.sin(x / 30 + time * 2 + wave) * 4);
      context.lineTo(width, y + 6);
      context.lineTo(0, y + 6);
      context.fill();
    }
    // Humbak tuż pod fontanną (plusk wychodzi z grzbietu w punkcie `fountain`), cały w kadrze.
    const whaleWidth = Math.min(width * 0.46, height * (1 - fountain[1]) * 2.4, 220);
    const [fx, fy] = fountain;
    if (atlas?.ready?.()) {
      atlas.draw(context, "humbak", fx * width, fy * height + whaleWidth * 0.18, {
        width: whaleWidth,
        height: whaleWidth / 2,
      });
      atlas.draw(context, "plusk", fx * width, fy * height, { width: whaleWidth * 0.42, height: whaleWidth * 0.42 });
    }
    context.fillStyle = COLORS.monstera;
    for (const leaf of state.bay.leaves) {
      const x = leaf.x * width;
      const y = leaf.y * height;
      if (!(
        atlas?.ready?.() && atlas.draw(context, "lisc-zielony", x, y, { width: 30, height: 30, rotation: leaf.vx * 3 })
      )) {
        context.beginPath();
        context.ellipse(x, y, 12, 8, leaf.vx * 3, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  function water(state, now, time) {
    if ((state.effects?.watered || 0) <= now) return;
    const { width, height } = size;
    context.fillStyle = "rgba(92, 200, 232, 0.55)";
    for (let index = 0; index < 18; index += 1) {
      const x = ((index * 97.3) % 1) * width + ((index * 53) % width);
      const y = ((time * 120 + index * 47) % (height * 0.7)) + height * 0.05;
      context.beginPath();
      context.ellipse(x % width, y, 2, 5, 0, 0, Math.PI * 2);
      context.fill();
    }
  }

  function effects(dt) {
    for (const item of particles) {
      item.age += dt;
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.vy += 260 * dt;
      context.globalAlpha = Math.max(0, 1 - item.age / item.life);
      context.fillStyle = item.color;
      context.beginPath();
      context.ellipse(item.x, item.y, 4, 2.5, item.age * 6, 0, Math.PI * 2);
      context.fill();
    }
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      if (particles[index].age >= particles[index].life) particles.splice(index, 1);
    }
    context.textAlign = "center";
    for (const item of popups) {
      item.age += dt;
      context.globalAlpha = Math.max(0, 1 - item.age / 1);
      context.font = font(item.size);
      context.lineWidth = 4;
      context.strokeStyle = COLORS.kontur;
      context.fillStyle = item.color;
      const y = item.y - item.age * 50;
      context.strokeText(item.text, item.x, y);
      context.fillText(item.text, item.x, y);
    }
    for (let index = popups.length - 1; index >= 0; index -= 1) if (popups[index].age >= 1) popups.splice(index, 1);
    context.globalAlpha = 1;
  }

  return {
    resize,
    spots,
    size: () => size,
    /** Miejsca zdarzeń do stuknięcia (piksele CSS): { phone, truck, goat } — { x, y, r } albo null. */
    hits: () => ({ ...hits }),
    /** Co jest pod palcem: "goat" | "phone" | "truck" | null (kózka pierwsza — ucieka). */
    hit(x, y) {
      for (const name of ["goat", "phone", "truck"]) {
        const target = hits[name];
        if (target && Math.hypot(x - target.x, y - target.y) <= target.r) return name;
      }
      return null;
    },
    popup(text, x, y, color = COLORS.bialy, textSize = 20) {
      popups.push({ text, x, y, color, size: textSize, age: 0 });
      if (popups.length > 12) popups.shift();
    },
    burst(x, y, count = 8, color = COLORS.monsteraJasna) {
      for (let index = 0; index < count; index += 1) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 220,
          vy: -80 - Math.random() * 160,
          age: 0,
          life: 0.6 + Math.random() * 0.4,
          color,
        });
      }
      if (particles.length > 120) particles.splice(0, particles.length - 120);
    },
    draw({ state, now, time, dt = 0, animator = null, cosmetic = "none" }) {
      if (!size.width) resize();
      context.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
      background(sceneId(state), time);
      owl(animator, cosmetic);
      shelf(state, time, dt);
      truck(state);
      goat(state, GARDEN_EVENTS.goat.visible);
      phone(state, time);
      water(state, now, time);
      bay(state, time, GARDEN_EVENTS.bay.fountain);
      effects(dt);
    },
  };
}
