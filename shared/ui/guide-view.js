// Karty instrukcji (shared/meta/guides-data.js) przewijane w bok — w menu pauzy, a od E3 także w menu głównym.
import { GESTURES } from "../meta/guides-data.js";

const SVG_BASE = new URL("../../assets/svg/", import.meta.url).href;

// Obrazek postaci: z atlasu (gdy gra go ma), a dla grafik z jednego pliku SVG — sam plik.
function spriteNode(name, { atlas, sprites }) {
  const sprite = sprites?.[name];
  if (!sprite) return null;
  if (atlas?.ready?.() && atlas.has(name)) {
    const canvas = document.createElement("canvas");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = 96;
    const ratio = sprite.size[1] / sprite.size[0];
    const [width, height] = ratio > 1 ? [size / ratio, size] : [size, size * ratio];
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const frame = atlas.frame(name);
    canvas
      .getContext("2d")
      .drawImage(atlas.pages()[frame.page], frame.x, frame.y, frame.w, frame.h, 0, 0, canvas.width, canvas.height);
    canvas.setAttribute("aria-hidden", "true");
    return canvas;
  }
  const layers = sprite.layers.filter((layer) => layer.svg);
  if (layers.length !== 1 || sprite.layers.length !== 1) return null;
  const image = document.createElement("img");
  image.src = new URL(layers[0].svg, SVG_BASE).href;
  image.alt = "";
  image.width = 96;
  image.height = Math.round((96 * sprite.box[1]) / sprite.box[0]);
  return image;
}

export function renderGuide(guide, { atlas = null, sprites = null } = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "sowie-guide";
  const summary = document.createElement("p");
  summary.className = "sowie-guide-summary";
  summary.textContent = guide.summary;
  const track = document.createElement("div");
  track.className = "sowie-guide-cards";
  track.setAttribute("role", "list");
  guide.cards.forEach((card, index) => {
    const item = document.createElement("article");
    item.className = "sowie-guide-card";
    item.setAttribute("role", "listitem");
    item.dataset.card = card.id;
    const picture = card.sprite ? spriteNode(card.sprite, { atlas, sprites }) : null;
    if (picture) {
      picture.classList.add("sowie-guide-picture");
      item.appendChild(picture);
    }
    const title = document.createElement("h3");
    title.textContent = card.title;
    const text = document.createElement("p");
    text.textContent = card.text;
    item.append(title, text);
    if (card.gesture) {
      const gesture = document.createElement("span");
      gesture.className = "sowie-guide-gesture";
      gesture.textContent = GESTURES[card.gesture];
      item.appendChild(gesture);
    }
    if (card.tip) {
      const tip = document.createElement("p");
      tip.className = "sowie-guide-tip";
      tip.textContent = card.tip;
      item.appendChild(tip);
    }
    const page = document.createElement("span");
    page.className = "sowie-guide-page";
    page.textContent = `${index + 1} / ${guide.cards.length}`;
    item.appendChild(page);
    track.appendChild(item);
  });
  wrapper.append(summary, track);
  return wrapper;
}
