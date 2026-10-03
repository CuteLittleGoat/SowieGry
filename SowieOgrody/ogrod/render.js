// Sowie Ogrody — rysowanie ogrodu na płótnie (piksele CSS): tło bieżącego rozdziału, półki z roślinami (każdy
// gatunek w doniczce; wielkość i liczba liści rosną z kamieniami milowymi), sowa ogrodniczka z atlasu Sowiego Świata,
// krople po podlaniu, napisy „+N” po stuknięciu i cząsteczki liści.
import { drawOwl } from "../../shared/world/owl.js";
import { COLORS, font } from "../../shared/world/tokens.js";
import { CHAPTERS, PLANTS } from "./config.js";
import { formatNumber, plantStage } from "./economy.js";
import { chapterIndex } from "./garden.js";

// Tło rozdziału: [niebo u góry, niebo u dołu, podłoże].
const SCENES = {
  parapet: ["#fff4fa", "#dff6ff", "#f4d7a0"],
  balkon: ["#cdeeff", "#fff6e3", "#c9c3d3"],
  dzialka: ["#bfe9ff", "#e7ffe6", "#a8d977"],
  basen: ["#bfe9ff", "#dff5fb", "#9fd9e8"],
  szklarnia: ["#dfffee", "#b9efd3", "#8fcf9a"],
  arboretum: ["#e8f7d4", "#c8ebb0", "#7fbf62"],
};

// Półka: najwyżej 6 gatunków w rzędzie, dwa rzędy.
const COLUMNS = 6;

// Skala rysunku względem ogrodu telefonu (360 × 260 px CSS): rośliny i sowa rosną razem z płótnem (komputer),
// ale nie maleją poniżej 0,85 ani nie rosną ponad 2.
export function gardenUnit(width, height) {
  return Math.min(2, Math.max(0.85, Math.min(width / 360, height / 260)));
}

export function createGardenRenderer({ canvas, atlas }) {
  const context = canvas.getContext("2d");
  const popups = [];
  const particles = [];
  let size = { width: 0, height: 0, ratio: 1 };
  // Miejsca roślin (piksele CSS) — do celowania napisów i testów.
  const spots = new Map();

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
    if (chapterId === "parapet") {
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

  // Roślina w doniczce: `stage` 1–5 (kamienie milowe) — wielkość, liczba liści, kwiat przy 5. `fit` (≤ 1) zmniejsza
  // rośliny w ciasnym rzędzie, żeby liście sąsiadów nie zachodziły na siebie.
  function plant(item, x, y, stage, time, fit = 1) {
    const unit = gardenUnit(size.width, size.height);
    const scale = (0.7 + stage * 0.12) * unit * fit;
    const potWidth = 26 * scale;
    context.fillStyle = COLORS.doniczka;
    roundRect(x - potWidth / 2, y - 20 * scale, potWidth, 20 * scale, 5);
    context.fillStyle = "rgba(59, 47, 74, 0.15)";
    context.fillRect(x - potWidth / 2, y - 20 * scale, potWidth, 4);
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

  // Półka: jeden rząd na środku podłogi; przy 7+ gatunkach dwa rzędy — pierwszy z tyłu (wyżej, mniejszy), drugi
  // z przodu. Podpisy „×N” rysowane na końcu, na jasnych plakietkach, żeby nie chowały się pod liśćmi.
  function shelf(state, time) {
    const { width, height } = size;
    const unit = gardenUnit(width, height);
    const owned = PLANTS.filter((item) => (state.plants?.[item.id] || 0) > 0);
    spots.clear();
    const rows = Math.max(1, Math.ceil(owned.length / COLUMNS));
    const placed = owned.map((item, index) => {
      const row = Math.floor(index / COLUMNS);
      const inRow = Math.min(COLUMNS, owned.length - row * COLUMNS);
      const column = index % COLUMNS;
      const x = (width * (column + 0.5)) / inRow;
      const y = height * (rows > 1 ? (row ? 0.9 : 0.7) : 0.78);
      // Szerokość kolumny względem ~80 px (dorosła roślina) i perspektywa rzędów.
      const fit = Math.min(1, width / inRow / (80 * unit)) * (rows > 1 ? (row ? 0.9 : 0.75) : 1);
      spots.set(item.id, { x, y });
      return { item, x, y, fit };
    });
    for (const { item, x, y, fit } of placed) {
      plant(item, x, y, plantStage(state.plants[item.id]), time, fit);
    }
    const label = Math.min(unit, 1.4);
    context.font = font(Math.round(11 * label));
    context.textAlign = "center";
    for (const { item, x, y } of placed) {
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
      const chapter = CHAPTERS[chapterIndex(state)];
      background(chapter.id, time);
      owl(animator, cosmetic);
      shelf(state, time);
      water(state, now, time);
      effects(dt);
    },
  };
}
