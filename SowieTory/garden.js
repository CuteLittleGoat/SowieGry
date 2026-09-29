// Sowie Tory — działka z basenem ogrodowym (finał planszy, Analiza 2, rozdz. 3.2), w stylu Sowiego Świata.
// Wygląd z obecnej Sowa3 przerysowany: szara, pionowo ryflowana ścianka, szeroki niebieski rant, jasna turkusowa
// woda z delikatnymi falami, trawa, płot, drzewa i krzewy, przy bokach koza na leżaku i grill.
// Rekwizyty w metrach (jak props.js: kontekst w punkcie na ziemi, 1 jednostka = 1 m, y w górę ujemne);
// basen w pikselach — renderer podaje elipsę z rzutni perspektywicznej.
import { COLORS } from "../shared/world/tokens.js";
import { box, ellipse } from "./props.js";

const INK = COLORS.kontur;
const POOL = Object.freeze({
  wall: "#b9b7c2",
  wallDark: "#8f8c9c",
  rim: "#3f8fd8",
  water: "#7fe3e0",
  waterDeep: "#4cc7d4",
});

/**
 * Basen w rzucie: `cx, cy` — środek dna (px), `rx, ry` — promienie elipsy na ziemi (px), `wall` — wysokość ścianki
 * (px), `rim` — szerokość rantu (px). Rysuje ściankę (przednia połowa walca z pionowymi żeberkami), rant i wodę.
 */
export function drawPool(context, { cx, cy, rx, ry, wall, rim }, t) {
  const top = cy - wall;
  context.save();
  context.lineJoin = "round";
  // Ścianka: przód walca od ziemi do rantu.
  context.beginPath();
  context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  context.lineTo(cx - rx, top);
  context.ellipse(cx, top, rx, ry, 0, Math.PI, 0, true);
  context.closePath();
  const gradient = context.createLinearGradient(cx - rx, 0, cx + rx, 0);
  gradient.addColorStop(0, POOL.wallDark);
  gradient.addColorStop(0.45, POOL.wall);
  gradient.addColorStop(1, POOL.wallDark);
  context.fillStyle = gradient;
  context.fill();
  context.lineWidth = Math.max(1.5, rim * 0.12);
  context.strokeStyle = INK;
  context.stroke();
  // Pionowe żeberka (ryflowanie).
  context.strokeStyle = "rgba(59, 47, 74, 0.28)";
  context.lineWidth = Math.max(1, rim * 0.08);
  for (let step = 1; step < 24; step += 1) {
    const angle = (step / 24) * Math.PI;
    const x = cx + Math.cos(angle) * rx;
    const dy = Math.sin(angle) * ry;
    context.beginPath();
    context.moveTo(x, cy + dy - 1);
    context.lineTo(x, top + dy + rim * 0.5);
    context.stroke();
  }
  // Szeroki niebieski rant i woda.
  context.beginPath();
  context.ellipse(cx, top, rx + rim * 0.5, ry + (rim * 0.5 * ry) / rx, 0, 0, Math.PI * 2);
  context.fillStyle = POOL.rim;
  context.fill();
  context.lineWidth = Math.max(1.5, rim * 0.12);
  context.strokeStyle = INK;
  context.stroke();
  const inner = { rx: rx - rim * 0.5, ry: ry - (rim * 0.5 * ry) / rx };
  context.beginPath();
  context.ellipse(cx, top, inner.rx, inner.ry, 0, 0, Math.PI * 2);
  const water = context.createLinearGradient(0, top - inner.ry, 0, top + inner.ry);
  water.addColorStop(0, POOL.waterDeep);
  water.addColorStop(1, POOL.water);
  context.fillStyle = water;
  context.fill();
  context.lineWidth = Math.max(1, rim * 0.08);
  context.stroke();
  // Delikatne fale: jasne łuki przesuwające się w czasie.
  context.save();
  context.clip();
  context.strokeStyle = "rgba(255, 255, 255, 0.55)";
  context.lineWidth = Math.max(1, inner.ry * 0.05);
  context.lineCap = "round";
  for (let row = 0; row < 4; row += 1) {
    const y = top - inner.ry * 0.6 + row * inner.ry * 0.42;
    const shift = ((t * 0.35 + row * 0.27) % 1) * inner.rx * 0.6;
    for (let wave = -2; wave <= 2; wave += 1) {
      const x = cx + wave * inner.rx * 0.6 + shift - inner.rx * 0.3;
      context.beginPath();
      context.arc(x, y + inner.ry * 0.1, inner.rx * 0.12, Math.PI * 1.15, Math.PI * 1.85);
      context.stroke();
    }
  }
  context.restore();
  context.restore();
}

// Leżak w paski (koza leży na nim — sprite kózki rysuje renderer).
export function drawDeckchair(context) {
  context.lineCap = "round";
  context.lineWidth = 0.07;
  context.strokeStyle = "#a8743f";
  for (const [x0, y0, x1, y1] of [
    [-0.75, 0, -0.1, -0.55],
    [0.7, 0, 0.1, -0.45],
    [-0.1, -0.55, 0.75, -1.05],
  ]) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
  }
  // Materiał w pasy: siedzisko i oparcie.
  const stripes = [COLORS.pracu, COLORS.bialy, COLORS.pracu, COLORS.bialy, COLORS.pracu];
  context.save();
  context.beginPath();
  context.moveTo(-0.8, -0.38);
  context.lineTo(-0.05, -0.62);
  context.lineTo(0.72, -1.12);
  context.lineTo(0.78, -0.98);
  context.lineTo(0.02, -0.46);
  context.lineTo(-0.74, -0.26);
  context.closePath();
  context.clip();
  stripes.forEach((color, index) => {
    context.fillStyle = color;
    context.fillRect(-0.9, -1.2 + index * 0.2, 1.8, 0.2);
  });
  context.restore();
  context.lineWidth = 0.04;
  context.strokeStyle = INK;
  context.beginPath();
  context.moveTo(-0.8, -0.38);
  context.lineTo(-0.05, -0.62);
  context.lineTo(0.72, -1.12);
  context.lineTo(0.78, -0.98);
  context.lineTo(0.02, -0.46);
  context.lineTo(-0.74, -0.26);
  context.closePath();
  context.stroke();
}

// Grill (kociołek na nóżkach) z dymkiem.
export function drawGrill(context, t) {
  context.lineCap = "round";
  context.lineWidth = 0.06;
  context.strokeStyle = COLORS.szaryCiemny;
  for (const [x0, x1] of [
    [-0.25, -0.38],
    [0.25, 0.38],
    [0, 0],
  ]) {
    context.beginPath();
    context.moveTo(x0, -0.62);
    context.lineTo(x1, 0);
    context.stroke();
  }
  context.beginPath();
  context.ellipse(0, -0.78, 0.46, 0.3, 0, 0, Math.PI);
  context.fillStyle = "#3a3440";
  context.fill();
  context.lineWidth = 0.04;
  context.strokeStyle = INK;
  context.stroke();
  // Ruszt z kiełbaskami.
  box(context, -0.48, -0.84, 0.96, 0.07, COLORS.szary, 0.02, 0.03);
  for (const x of [-0.26, 0, 0.26]) box(context, x - 0.1, -0.93, 0.2, 0.09, "#c8553d", 0.04, 0.025);
  // Dymek: trzy obłoczki wędrujące w górę.
  for (let index = 0; index < 3; index += 1) {
    const phase = (t * 0.6 + index / 3) % 1;
    context.globalAlpha = (1 - phase) * 0.6;
    ellipse(
      context,
      Math.sin(phase * 5 + index) * 0.12,
      -1.05 - phase * 1.1,
      0.12 + phase * 0.14,
      0.1 + phase * 0.1,
      "#f2eef6",
      0,
    );
  }
  context.globalAlpha = 1;
}

// Drewniany płot sztachetowy o szerokości `width` m (środek w 0).
export function drawFence(context, width) {
  const half = width / 2;
  box(context, -half, -0.78, width, 0.1, "#c79a64", 0.02, 0.03);
  box(context, -half, -0.36, width, 0.1, "#c79a64", 0.02, 0.03);
  for (let x = -half + 0.08; x < half; x += 0.32) {
    context.beginPath();
    context.moveTo(x - 0.09, 0);
    context.lineTo(x - 0.09, -1);
    context.lineTo(x, -1.12);
    context.lineTo(x + 0.09, -1);
    context.lineTo(x + 0.09, 0);
    context.closePath();
    context.fillStyle = "#e0b57c";
    context.fill();
    context.lineWidth = 0.03;
    context.strokeStyle = INK;
    context.stroke();
  }
}

// Drzewo (pień i okrągła korona) — `variant` zmienia odcień i wysokość.
export function drawTree(context, t, variant = 0) {
  const height = 2.6 + (variant % 3) * 0.4;
  box(context, -0.14, -height * 0.45, 0.28, height * 0.45, COLORS.sowaCiemna, 0.06, 0.035);
  const sway = Math.sin(t * 1.3 + variant) * 0.04;
  const green = variant % 2 ? COLORS.monstera : COLORS.monsteraCiemna;
  ellipse(context, -0.45 + sway, -height * 0.62, 0.7, 0.6, green, 0.04);
  ellipse(context, 0.45 + sway, -height * 0.65, 0.7, 0.6, green, 0.04);
  ellipse(context, sway, -height * 0.9, 0.8, 0.7, green, 0.04);
  context.fillStyle = "rgba(255, 255, 255, 0.18)";
  context.beginPath();
  context.arc(-0.2 + sway, -height * 0.98, 0.25, 0, Math.PI * 2);
  context.fill();
}

// Krzew (trzy kule zieleni).
export function drawBush(context, t, variant = 0) {
  const green = variant % 2 ? COLORS.monsteraCiemna : COLORS.monstera;
  ellipse(context, -0.35, -0.35, 0.4, 0.35, green, 0.035);
  ellipse(context, 0.35, -0.35, 0.4, 0.35, green, 0.035);
  ellipse(context, 0, -0.55, 0.45, 0.4, green, 0.035);
  if (variant % 3 === 0) {
    context.fillStyle = COLORS.serce;
    for (const [x, y] of [
      [-0.3, -0.5],
      [0.2, -0.7],
      [0.4, -0.35],
    ]) {
      context.beginPath();
      context.arc(x, y, 0.06, 0, Math.PI * 2);
      context.fill();
    }
  }
}
