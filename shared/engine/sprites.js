// Atlas grafik: SVG z assets/svg/ rasteryzowane przy starcie do jednej lub kilku stron canvasu
// w rozdzielczości urządzenia (Analiza 2, rozdz. 2.3). Rysowanie w grze = jedno drawImage z atlasu.
import { loadFonts, loadText, svgToImage, viewBoxOf } from "./assets.js";

// Układanie prostokątów w półkach (od najwyższych). Czysta funkcja — testowana jednostkowo.
// items: [{ name, w, h }] w pikselach → { pages: [{ width, height }], placements: { name: { page, x, y, w, h } } }.
export function packShelves(items, { maxSize = 2048, padding = 2 } = {}) {
  const sorted = [...items].sort((a, b) => b.h - a.h || b.w - a.w || String(a.name).localeCompare(String(b.name)));
  const pages = [];
  const placements = {};
  let page = null;
  const newPage = () => {
    page = { width: 0, height: 0, shelfY: padding, shelfH: 0, cursorX: padding };
    pages.push(page);
  };
  for (const item of sorted) {
    const w = Math.ceil(item.w);
    const h = Math.ceil(item.h);
    if (w + padding * 2 > maxSize || h + padding * 2 > maxSize) {
      throw new Error(`Grafika ${item.name} (${w} × ${h}) nie mieści się na stronie ${maxSize} px`);
    }
    if (!page) newPage();
    if (page.cursorX + w + padding > maxSize) {
      page.shelfY += page.shelfH + padding;
      page.shelfH = 0;
      page.cursorX = padding;
    }
    if (page.shelfY + h + padding > maxSize) {
      newPage();
    }
    placements[item.name] = { page: pages.length - 1, x: page.cursorX, y: page.shelfY, w, h };
    page.cursorX += w + padding;
    page.shelfH = Math.max(page.shelfH, h);
    page.width = Math.max(page.width, page.cursorX);
    page.height = Math.max(page.height, page.shelfY + page.shelfH + padding);
  }
  return { pages: pages.map(({ width, height }) => ({ width, height })), placements };
}

// Rozmiar komórki atlasu w pikselach dla grafiki o rozmiarze size (jednostki świata) i gęstości ppu (px na jednostkę).
export function cellSize(sprite, pixelsPerUnit) {
  return {
    w: Math.max(1, Math.ceil(sprite.size[0] * pixelsPerUnit)),
    h: Math.max(1, Math.ceil(sprite.size[1] * pixelsPerUnit)),
  };
}

// Pliki SVG potrzebne w katalogu (bez powtórzeń).
export function svgFiles(catalog) {
  const files = new Set();
  for (const sprite of Object.values(catalog)) {
    for (const layer of sprite.layers) if (layer.svg) files.add(layer.svg);
  }
  return [...files];
}

function applyLayerTransform(context, layer) {
  const [px, py] = layer.pivot || [0, 0];
  context.translate(layer.dx || 0, layer.dy || 0);
  if (layer.rotate || layer.scale) {
    context.translate(px, py);
    if (layer.rotate) context.rotate((layer.rotate * Math.PI) / 180);
    if (layer.scale) context.scale(layer.scale, layer.scale);
    context.translate(-px, -py);
  }
  if (layer.alpha !== undefined) context.globalAlpha *= layer.alpha;
}

function drawText(context, layer, fontFor) {
  context.font = fontFor(layer.size, layer.weight || 700);
  context.textAlign = layer.align || "center";
  context.textBaseline = "middle";
  if (layer.stroke) {
    context.lineJoin = "round";
    context.lineWidth = layer.strokeWidth || 3;
    context.strokeStyle = layer.stroke;
    context.strokeText(layer.text, layer.x, layer.y, layer.maxWidth);
  }
  context.fillStyle = layer.color;
  context.fillText(layer.text, layer.x, layer.y, layer.maxWidth);
}

/**
 * Atlas grafik.
 * catalog: { nazwa: { box: [szer, wys] (jednostki SVG), size: [szer, wys] (jednostki świata), anchor: [ax, ay] (0–1),
 *            layers: [{ svg, dx, dy, rotate, pivot, scale, alpha } | { text, x, y, size, weight, color, stroke }] } }
 * baseUrl: adres katalogu assets/svg/ (względem strony).
 */
export function createAtlas({
  catalog,
  baseUrl,
  maxSize = 2048,
  padding = 2,
  createCanvas = (width, height) => Object.assign(document.createElement("canvas"), { width, height }),
  fontFor = (size, weight) => `${weight} ${size}px "Fredoka", system-ui, sans-serif`,
  load = (file) => loadText(new URL(file, baseUrl).href),
  rasterize = svgToImage,
  fonts = loadFonts,
} = {}) {
  let pages = [];
  let placements = {};
  let pixelsPerUnit = 0;
  let building = null;
  let version = 0;

  async function build(ppu) {
    const target = Math.max(1, ppu);
    const buildVersion = (version += 1);
    await fonts();
    const files = svgFiles(catalog);
    const texts = Object.fromEntries(await Promise.all(files.map(async (file) => [file, await load(file)])));
    const items = Object.entries(catalog).map(([name, sprite]) => ({ name, ...cellSize(sprite, target) }));
    const packed = packShelves(items, { maxSize, padding });
    const images = new Map();
    const imageFor = (file, w, h) => {
      const key = `${file}@${w}x${h}`;
      if (!images.has(key)) images.set(key, rasterize(texts[file], w, h));
      return images.get(key);
    };
    const canvases = packed.pages.map((page) => createCanvas(page.width, page.height));
    for (const [name, sprite] of Object.entries(catalog)) {
      const cell = packed.placements[name];
      const [boxW, boxH] = sprite.box;
      const context = canvases[cell.page].getContext("2d");
      const layerImages = await Promise.all(
        sprite.layers.map((layer) => {
          if (!layer.svg) return null;
          const [, , vbW, vbH] = viewBoxOf(texts[layer.svg]);
          // Warstwa może mieć inny viewBox niż pudełko postaci — wtedy rysujemy ją w jej własnym rozmiarze.
          return imageFor(layer.svg, Math.ceil((cell.w * vbW) / boxW), Math.ceil((cell.h * vbH) / boxH));
        }),
      );
      context.save();
      context.translate(cell.x, cell.y);
      context.beginPath();
      context.rect(0, 0, cell.w, cell.h);
      context.clip();
      context.scale(cell.w / boxW, cell.h / boxH);
      sprite.layers.forEach((layer, index) => {
        context.save();
        applyLayerTransform(context, layer);
        if (layer.svg) {
          const [, , vbW, vbH] = viewBoxOf(texts[layer.svg]);
          context.drawImage(layerImages[index], 0, 0, vbW, vbH);
        } else if (layer.text) {
          drawText(context, layer, fontFor);
        }
        context.restore();
      });
      context.restore();
    }
    if (buildVersion !== version) return false;
    pages = canvases;
    placements = packed.placements;
    pixelsPerUnit = target;
    return true;
  }

  const atlas = {
    // Buduje atlas dla gęstości ppu (piksele urządzenia na jednostkę świata). Kolejne wywołanie zastępuje poprzednie.
    build(ppu) {
      building = build(ppu).finally(() => (building = null));
      return building;
    },
    // Przebudowa tylko przy wyraźnej zmianie gęstości (np. obrót telefonu na tablecie).
    ensure(ppu, tolerance = 0.15) {
      if (pixelsPerUnit && Math.abs(ppu - pixelsPerUnit) / pixelsPerUnit <= tolerance) return Promise.resolve(false);
      return building || atlas.build(ppu);
    },
    ready: () => pixelsPerUnit > 0,
    pixelsPerUnit: () => pixelsPerUnit,
    has: (name) => Boolean(placements[name]),
    names: () => Object.keys(placements),
    pages: () => pages,
    sprite: (name) => catalog[name],
    frame: (name) => placements[name],
    /**
     * Rysuje grafikę w bieżących jednostkach kontekstu (zwykle świata). (x, y) to punkt kotwicy.
     * options: width/height (domyślnie size z katalogu), scaleX/scaleY, rotation (radiany), alpha, flipX.
     */
    draw(context, name, x, y, options = {}) {
      const cell = placements[name];
      const sprite = catalog[name];
      if (!cell || !sprite) return false;
      const width = options.width ?? sprite.size[0];
      const height =
        options.height ?? (options.width ? (options.width * sprite.size[1]) / sprite.size[0] : sprite.size[1]);
      const [ax, ay] = options.anchor || sprite.anchor || [0.5, 0.5];
      const scaleX = (options.scaleX ?? 1) * (options.flipX ? -1 : 1);
      const scaleY = options.scaleY ?? 1;
      const simple = !options.rotation && scaleX === 1 && scaleY === 1 && options.alpha === undefined;
      if (simple) {
        context.drawImage(
          pages[cell.page],
          cell.x,
          cell.y,
          cell.w,
          cell.h,
          x - width * ax,
          y - height * ay,
          width,
          height,
        );
        return true;
      }
      context.save();
      context.translate(x, y);
      if (options.rotation) context.rotate(options.rotation);
      context.scale(scaleX, scaleY);
      if (options.alpha !== undefined) context.globalAlpha *= options.alpha;
      context.drawImage(pages[cell.page], cell.x, cell.y, cell.w, cell.h, -width * ax, -height * ay, width, height);
      context.restore();
      return true;
    },
  };
  return atlas;
}

// Miękki cień-elipsa pod obiektem (Analiza 2, rozdz. 2.3). lift 0–1 zmniejsza cień, gdy obiekt jest w powietrzu.
export function drawShadow(context, x, y, width, { lift = 0, color = "#3b2f4a", alpha = 0.18 } = {}) {
  const scale = 1 - Math.min(0.6, Math.max(0, lift) * 0.6);
  context.save();
  context.globalAlpha *= alpha * (1 - Math.min(0.5, Math.max(0, lift) * 0.5));
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(x, y, (width / 2) * scale, (width / 8) * scale, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}
