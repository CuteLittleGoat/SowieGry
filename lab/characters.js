// Dział „Postacie” Sowiego Laboratorium: podgląd wszystkich postaci z atlasu i ich animacji (punkt kontrolny E2).
import { createAtlas, drawShadow } from "../shared/engine/index.js";
import { AMIC_VARIANTS, GOAT_KINDS, PRACU_VARIANTS, SPRITES, SVG_BASE } from "../shared/world/catalog.js";
import { COSMETIC_SPRITES, createOwlAnimator, drawOwl, OWL_SIZE } from "../shared/world/owl.js";
import { COLORS, font } from "../shared/world/tokens.js";

// Skala podglądu: piksele CSS na jednostkę świata (sowa 1,2 j. ≈ 77 px).
const UNIT = 64;
const LABEL = 18;

const OWL_ACTION_LABELS = [
  ["stoi", "Stoi i mruga"],
  ["bieg", "Bieg"],
  ["skok", "Skok"],
  ["szybowanie", "Szybowanie"],
  ["oszolomienie", "Oszołomienie"],
  ["radosc", "Radość"],
];
const PRACU_LABELS = {
  dymek: "Dymek",
  telefon: "Telefon",
  "telefon-magda": "Telefon od Magdy",
  teczka: "Stos papierów",
  mail: "Rój maili",
  tablica: "Tablica",
  budzik: "Budzik",
};
const AMIC_LABELS = {
  dystrybutor: "Dystrybutor",
  cysterna: "Cysterna",
  "znak-cen": "Znak z cenami",
  wozek: "Wózek z kanistrami",
  barierka: "Barierka",
  kanister: "Kanister",
  sterowiec: "Sterowiec",
};

function cosmeticLabel(key) {
  return window.SowiePlatform?.COSMETICS?.[key]?.label || key;
}

// Element podglądu: szerokość i wysokość w jednostkach świata + funkcje update/draw (0,0 = lewy górny róg komórki).
function owlItem(action, label, state) {
  const animator = createOwlAnimator();
  animator.set(action);
  let jump = 0;
  let height = 0;
  let vy = 0;
  return {
    w: 1.7,
    h: 2.1,
    label,
    update(dt) {
      if (action === "skok") {
        const before = height;
        jump = (jump + dt) % 1.3;
        const t = jump < 0.9 ? jump / 0.9 : 1;
        height = 4 * 0.55 * t * (1 - t);
        vy = -(height - before) / Math.max(dt, 1e-6);
        if (before > 0.001 && height <= 0.001) animator.land(1);
      }
      animator.update(dt, { vy });
    },
    draw(context, atlas) {
      const ground = 2.0;
      // Szybująca sowa unosi się nad ziemią; cień jest wtedy mniejszy i jaśniejszy.
      const lift = action === "szybowanie" ? 0.35 : height;
      drawShadow(context, 0.85, ground, OWL_SIZE * 0.7, { lift: lift / 0.55 });
      drawOwl(context, atlas, 0.85, ground - lift, {
        state: animator.state(),
        cosmetic: state.cosmetic,
        shadow: false,
      });
    },
  };
}

function wardrobeItem(key) {
  const animator = createOwlAnimator();
  return {
    w: 1.7,
    h: 1.7,
    label: cosmeticLabel(key),
    update: (dt) => animator.update(dt),
    draw: (context, atlas) => drawOwl(context, atlas, 0.85, 1.6, { state: animator.state(), cosmetic: key }),
  };
}

function goatItem(kind, index) {
  let time = index * 0.23;
  let height = 0;
  return {
    w: 1.5,
    h: 1.9,
    label: GOAT_KINDS[kind].label,
    update(dt) {
      time = (time + dt) % 1.1;
      const t = Math.min(1, time / 0.7);
      height = time < 0.7 ? 4 * 0.6 * t * (1 - t) : 0;
    },
    draw(context, atlas) {
      drawShadow(context, 0.75, 1.8, 0.9, { lift: height / 0.6 });
      atlas.draw(context, height > 0.02 ? `kozka-${kind}-skok` : `kozka-${kind}`, 0.75, 1.8 - height);
    },
  };
}

function spriteItem(name, label, { w, h, x, y, motion } = {}) {
  const sprite = SPRITES[name];
  let time = Math.random() * 3;
  const width = w ?? sprite.size[0] + 0.2;
  const height = h ?? sprite.size[1] + 0.2;
  return {
    w: width,
    h: height,
    label,
    update: (dt) => (time += dt),
    draw(context, atlas) {
      const [ax, ay] = sprite.anchor;
      const baseX = x ?? width / 2 - sprite.size[0] * (0.5 - ax);
      const baseY = y ?? height / 2 - sprite.size[1] * (0.5 - ay);
      const options = motion ? motion(time) : {};
      atlas.draw(context, name, baseX + (options.dx || 0), baseY + (options.dy || 0), options);
    },
  };
}

const ring = (time) => (Math.floor(time / 0.9) % 2 === 0 ? Math.sin(time * 90) * 0.03 : 0);

function sections(state) {
  return [
    {
      id: "sowka",
      title: "Sówka — animacje",
      items: OWL_ACTION_LABELS.map(([action, label]) => owlItem(action, label, state)),
    },
    {
      id: "garderoba",
      title: `Garderoba (${Object.keys(COSMETIC_SPRITES).length} pozycji)`,
      items: Object.keys(COSMETIC_SPRITES).map((key) => wardrobeItem(key)),
    },
    {
      id: "kozki",
      title: "Skaczące kózki (power-upy)",
      items: Object.keys(GOAT_KINDS).map((kind, index) => goatItem(kind, index)),
    },
    {
      id: "humbak",
      title: "Humbak (poziomy bonusowe)",
      items: [
        spriteItem("humbak", "Humbak", {
          w: 3.6,
          h: 2.1,
          motion: (time) => ({ dy: Math.sin(time * 1.6) * 0.12, rotation: Math.sin(time * 1.6 + 0.6) * 0.05 }),
        }),
        spriteItem("plusk", "Plusk", {
          w: 1.8,
          h: 2.1,
          y: 2.0,
          motion: (time) => {
            const pulse = (time % 1.6) / 1.6;
            return { scaleX: 0.7 + pulse * 0.4, scaleY: 0.4 + Math.sin(pulse * Math.PI) * 0.7, alpha: 1 - pulse * 0.4 };
          },
        }),
      ],
    },
    {
      id: "pracu",
      title: "Rodzina Pracu Pracu (ruchome przeszkody)",
      items: PRACU_VARIANTS.map((variant) => {
        const name = `pracu-${variant}`;
        const motions = {
          dymek: (time) => ({ dy: Math.sin(time * 3) * 0.12 }),
          telefon: (time) => ({ dx: ring(time) }),
          "telefon-magda": (time) => ({ dx: ring(time + 0.4) }),
          teczka: (time) => ({ scaleY: 1 + Math.sin(time * 4) * 0.03 }),
          mail: (time) => ({ dy: Math.sin(time * 5) * 0.08, rotation: Math.sin(time * 5) * 0.08 }),
          tablica: (time) => ({ rotation: Math.sin(time * 2) * 0.04 }),
          budzik: (time) => ({ rotation: ring(time) * 3 }),
        };
        return spriteItem(name, PRACU_LABELS[variant], { motion: motions[variant] });
      }),
    },
    {
      id: "amic",
      title: "Rodzina Amic (ciężkie przeszkody)",
      items: AMIC_VARIANTS.map((variant) => {
        const name = `amic-${variant}`;
        const motions = {
          sterowiec: (time) => ({ dy: Math.sin(time * 1.2) * 0.1 }),
          kanister: (time) => {
            const fall = (time % 1.8) / 1.8;
            return { dy: -1.2 + Math.min(1, fall * 1.6) ** 2 * 1.2 };
          },
        };
        const extra = variant === "kanister" ? { h: 2.3, y: 1.9 } : {};
        return spriteItem(name, AMIC_LABELS[variant], { motion: motions[variant], ...extra });
      }),
    },
    {
      id: "liscie",
      title: "Liście monstery i życia",
      items: [
        ...["zielony", "zloty", "teczowy"].map((kind) =>
          spriteItem(`lisc-${kind}`, { zielony: "Zielony 10", zloty: "Złoty 50", teczowy: "Tęczowy 100" }[kind], {
            w: 1.1,
            h: 1.1,
            motion: (time) => ({ scaleX: Math.cos(time * 2.5), dy: Math.sin(time * 3) * 0.05 }),
          }),
        ),
        spriteItem("zycie", "Życie", { w: 1.1, h: 1.1 }),
        spriteItem("zycie-puste", "Utracone życie", { w: 1.1, h: 1.1 }),
      ],
    },
  ];
}

// Układ „jak tekst”: elementy w wierszach o szerokości width (px CSS).
function layoutItems(items, width) {
  const gap = 8;
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  const positions = [];
  for (const item of items) {
    const w = item.w * UNIT;
    const h = item.h * UNIT + LABEL;
    if (x > 0 && x + w > width) {
      x = 0;
      y += rowHeight + gap;
      rowHeight = 0;
    }
    positions.push({ x, y, w, h });
    x += w + gap;
    rowHeight = Math.max(rowHeight, h);
  }
  return { positions, height: y + rowHeight };
}

export function createCharactersPanel({ root, getDpr = () => Math.min(2, window.devicePixelRatio || 1) }) {
  const state = { cosmetic: "none" };
  const atlas = createAtlas({ catalog: SPRITES, baseUrl: SVG_BASE });
  const list = sections(state).map((section) => {
    const block = document.createElement("section");
    block.className = "lab-characters-section";
    block.dataset.section = section.id;
    const heading = document.createElement("h2");
    heading.textContent = section.title;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", `${section.title}: ${section.items.map((item) => item.label).join(", ")}`);
    block.append(heading, canvas);
    root.append(block);
    return { ...section, block, canvas, context: canvas.getContext("2d"), visible: true, layout: null };
  });

  const visibility =
    "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          for (const entry of entries) {
            const section = list.find((item) => item.canvas === entry.target);
            if (section) section.visible = entry.isIntersecting;
          }
        })
      : null;
  for (const section of list) visibility?.observe(section.canvas);

  function resize() {
    const dpr = getDpr();
    for (const section of list) {
      const width = Math.max(200, section.block.clientWidth);
      section.layout = layoutItems(section.items, width);
      section.canvas.style.width = `${width}px`;
      section.canvas.style.height = `${section.layout.height}px`;
      section.canvas.width = Math.round(width * dpr);
      section.canvas.height = Math.round(section.layout.height * dpr);
    }
    return atlas.ensure(UNIT * dpr);
  }

  function update(dt) {
    for (const section of list) for (const item of section.items) item.update(dt);
  }

  function render() {
    if (!atlas.ready()) return;
    const dpr = getDpr();
    for (const section of list) {
      if (!section.visible || !section.layout) continue;
      const { context, canvas } = section;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      section.items.forEach((item, index) => {
        const box = section.layout.positions[index];
        context.setTransform(dpr, 0, 0, dpr, box.x * dpr, box.y * dpr);
        context.fillStyle = "rgba(255, 255, 255, 0.55)";
        context.beginPath();
        context.roundRect ? context.roundRect(0, 0, box.w, box.h, 14) : context.rect(0, 0, box.w, box.h);
        context.fill();
        context.fillStyle = COLORS.kontur;
        context.font = font(13, 500);
        context.textAlign = "center";
        context.textBaseline = "alphabetic";
        context.fillText(item.label, box.w / 2, box.h - 6, box.w - 8);
        context.save();
        context.scale(UNIT, UNIT);
        item.draw(context, atlas);
        context.restore();
      });
    }
  }

  function setCosmetic(key) {
    if (COSMETIC_SPRITES[key]) state.cosmetic = key;
  }

  return { atlas, resize, update, render, setCosmetic, cosmetic: () => state.cosmetic, sections: () => list };
}
