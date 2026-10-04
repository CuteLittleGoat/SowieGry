// Sowie Tory — rekwizyty plansz rysowane kodem w stylu Sowiego Świata (kontur #3b2f4a, zaokrąglone kształty).
// Każda funkcja rysuje w metrach: kontekst przesunięty do punktu na ziemi (środek podstawy) i przeskalowany
// (1 jednostka = 1 m), oś y w górę jest ujemna. `t` — czas (s) do drobnych animacji. `box` i `ellipse` (kształty
// z konturem) używa też garden.js.
import { COLORS, font } from "../shared/world/tokens.js";

const INK = COLORS.kontur;

function rounded(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

// `line` 0 — bez obrysu (canvas pomija lineWidth = 0 i obrysowałby grubością z poprzedniego rysunku).
export function box(context, x, y, width, height, fill, radius = 0.06, line = 0.05) {
  rounded(context, x, y, width, height, radius);
  context.fillStyle = fill;
  context.fill();
  if (line <= 0) return;
  context.lineWidth = line;
  context.strokeStyle = INK;
  context.stroke();
}

export function ellipse(context, x, y, rx, ry, fill, line = 0.04) {
  context.beginPath();
  context.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.fill();
  if (line) {
    context.lineWidth = line;
    context.strokeStyle = INK;
    context.stroke();
  }
}

function label(context, text, x, y, size, color = COLORS.bialy, weight = 700) {
  context.save();
  context.translate(x, y);
  context.scale(size / 32, size / 32);
  context.font = font(32, weight);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = color;
  context.fillText(text, 0, 0);
  context.restore();
}

// Biedronka: kropki biedronki (ozdoba regałów i tablic).
function ladybug(context, x, y, size) {
  ellipse(context, x, y, size, size * 0.85, "#e2231a", 0.03);
  context.fillStyle = INK;
  context.beginPath();
  context.arc(x - size * 0.9, y, size * 0.35, 0, Math.PI * 2);
  context.fill();
  for (const [dx, dy] of [
    [-0.25, -0.35],
    [0.3, -0.25],
    [0, 0.3],
    [0.45, 0.35],
  ]) {
    context.beginPath();
    context.arc(x + dx * size, y + dy * size, size * 0.16, 0, Math.PI * 2);
    context.fill();
  }
}

// Kanister (niebieski płyn do spryskiwaczy albo zielona woda do podlewania).
function canister(context, x, y, color) {
  box(context, x - 0.16, y - 0.42, 0.32, 0.42, color, 0.05, 0.035);
  box(context, x - 0.05, y - 0.5, 0.1, 0.09, color, 0.02, 0.03);
  context.fillStyle = "rgba(255,255,255,0.55)";
  context.fillRect(x - 0.1, y - 0.33, 0.2, 0.12);
}

// ---------- Przeszkody (kolidują; rysunek: szerokość ok. 1,3 m) ----------

export const OBSTACLE_PROPS = Object.freeze({
  // Cysterna Amic od tyłu (pełna, długa — zmiana toru): koniec zbiornika z pasami Amic, drabinka, światła, zderzak
  // i koła; mieści się w swoim torze (1,44 m). Zbiornik ciągnący się w głąb rysuje render.js (`longBody`).
  cysterna(context) {
    for (const x of [-0.56, -0.36, 0.36, 0.56]) box(context, x - 0.08, -0.34, 0.16, 0.34, INK, 0.06, 0);
    box(context, -0.72, -0.52, 1.44, 0.2, COLORS.szaryCiemny, 0.04, 0.04);
    ellipse(context, 0, -1.28, 0.66, 0.74, COLORS.bialy, 0.05);
    context.save();
    context.beginPath();
    context.ellipse(0, -1.28, 0.64, 0.72, 0, 0, Math.PI * 2);
    context.clip();
    context.fillStyle = COLORS.amicCzerwony;
    context.fillRect(-0.7, -2.05, 1.4, 0.42);
    context.fillStyle = COLORS.amicZielony;
    context.fillRect(-0.7, -0.88, 1.4, 0.36);
    context.restore();
    label(context, "Amic", 0, -1.3, 0.3, COLORS.amicCzerwony);
    // Drabinka z boku i światła na zderzaku.
    context.strokeStyle = COLORS.szaryCiemny;
    context.lineWidth = 0.035;
    context.beginPath();
    context.moveTo(0.42, -0.6);
    context.lineTo(0.42, -1.9);
    context.moveTo(0.54, -0.6);
    context.lineTo(0.54, -1.82);
    for (let y = -0.75; y > -1.85; y -= 0.22) {
      context.moveTo(0.42, y);
      context.lineTo(0.54, y);
    }
    context.stroke();
    box(context, -0.68, -0.5, 0.2, 0.12, COLORS.amicCzerwony, 0.04, 0.025);
    box(context, 0.48, -0.5, 0.2, 0.12, COLORS.amicCzerwony, 0.04, 0.025);
    box(context, -0.18, -0.5, 0.36, 0.12, COLORS.zloto, 0.03, 0.025);
  },
  // Paleta z płynem do spryskiwaczy i kanistrami (Biedronka, niska — skok).
  paleta(context) {
    box(context, -0.62, -0.16, 1.24, 0.16, "#c9965f", 0.02, 0.04);
    context.fillStyle = "#8a5a3b";
    for (const x of [-0.5, -0.05, 0.4]) context.fillRect(x, -0.12, 0.1, 0.1);
    for (const [index, x] of [-0.4, 0, 0.4].entries()) {
      canister(context, x, -0.16, index === 1 ? COLORS.amicCzerwony : COLORS.niebieski);
    }
    box(context, -0.5, -0.66, 0.38, 0.08, COLORS.bialy, 0.02, 0.025);
    label(context, "-50%", -0.31, -0.62, 0.07, COLORS.amicCzerwony);
  },
  // Stojak promocyjny z cenami „SUPER CENA!” (Biedronka, wysoka — ślizg pod spodem).
  stojak(context) {
    context.fillStyle = COLORS.szaryCiemny;
    context.fillRect(-0.6, -2.05, 0.07, 2.05);
    context.fillRect(0.53, -2.05, 0.07, 2.05);
    box(context, -0.66, -2.05, 1.32, 1.15, "#e2231a", 0.08);
    box(context, -0.56, -1.95, 1.12, 0.36, COLORS.zloto, 0.06, 0.035);
    label(context, "SUPER", 0, -1.77, 0.26, INK);
    label(context, "CENA!", 0, -1.38, 0.32);
    label(context, "4,99", 0, -1.05, 0.2, COLORS.zloto);
    ladybug(context, 0.45, -1.02, 0.07);
  },
  // Wózek sklepowy (Biedronka, pełna — zmiana toru).
  "wozek-sklepowy"(context, t) {
    context.lineWidth = 0.06;
    context.strokeStyle = COLORS.szaryCiemny;
    context.lineJoin = "round";
    // Kosz z siatką.
    context.fillStyle = "rgba(201, 195, 211, 0.55)";
    context.beginPath();
    context.moveTo(-0.55, -1.2);
    context.lineTo(0.6, -1.2);
    context.lineTo(0.48, -0.45);
    context.lineTo(-0.45, -0.45);
    context.closePath();
    context.fill();
    context.stroke();
    context.lineWidth = 0.025;
    for (let x = -0.4; x <= 0.45; x += 0.17) {
      context.beginPath();
      context.moveTo(x, -1.2);
      context.lineTo(x * 0.85, -0.45);
      context.stroke();
    }
    // Zakupy w koszu.
    box(context, -0.35, -1.45, 0.3, 0.3, COLORS.pomaranczowy, 0.05, 0.03);
    box(context, 0.02, -1.38, 0.34, 0.2, COLORS.monsteraJasna, 0.05, 0.03);
    // Rączka, podwozie i kółka.
    context.lineWidth = 0.06;
    context.beginPath();
    context.moveTo(-0.55, -1.2);
    context.lineTo(-0.75, -1.45);
    context.moveTo(-0.45, -0.45);
    context.lineTo(-0.4, -0.16);
    context.lineTo(0.45, -0.16);
    context.lineTo(0.48, -0.45);
    context.stroke();
    box(context, -0.95, -1.52, 0.35, 0.1, "#e2231a", 0.04, 0.03);
    const spin = Math.sin(t * 20) * 0.02;
    for (const x of [-0.35, 0.38]) ellipse(context, x + spin, -0.08, 0.08, 0.08, INK, 0);
  },
  // Stos katalogów Pracu (festiwal roślin, niska — skok).
  katalogi(context) {
    const colors = [COLORS.pracu, COLORS.bialy, COLORS.niebieski, COLORS.zloto, COLORS.bialy, COLORS.pracu];
    colors.forEach((color, index) => {
      const shift = Math.sin(index * 2.1) * 0.08;
      box(context, -0.5 + shift, -0.11 * (index + 1), 1, 0.11, color, 0.02, 0.03);
    });
    box(context, -0.3, -0.84, 0.6, 0.16, COLORS.bialy, 0.03, 0.03);
    label(context, "KATALOG", 0, -0.76, 0.1, COLORS.pracu);
  },
  // Stoisko promocyjne Amic (festiwal roślin, pełna — zmiana toru).
  stoisko(context) {
    box(context, -0.62, -1.05, 1.24, 1.05, COLORS.bialy, 0.05);
    box(context, -0.62, -0.72, 1.24, 0.3, COLORS.amicZielony, 0.03, 0.035);
    label(context, "Amic", 0, -0.57, 0.24);
    // Pasiasty daszek.
    for (let index = 0; index < 5; index += 1) {
      box(context, -0.7 + index * 0.28, -1.5, 0.28, 0.4, index % 2 ? COLORS.bialy : COLORS.amicCzerwony, 0.03, 0.03);
    }
    context.fillStyle = COLORS.szaryCiemny;
    context.fillRect(-0.66, -1.9, 0.05, 0.45);
    context.fillRect(0.61, -1.9, 0.05, 0.45);
    box(context, -0.72, -2.05, 1.44, 0.18, COLORS.amicCzerwony, 0.05, 0.035);
    canister(context, -0.3, -0.05, COLORS.amicZielony);
    canister(context, 0.3, -0.05, COLORS.amicZielony);
  },
  // Samochód na podjeździe stacji (Amic, pełna i długa — rysunek od tyłu).
  samochod(context, t, variant = 0) {
    const colors = [COLORS.niebieski, COLORS.zloto, COLORS.fiolet, COLORS.monstera];
    const body = colors[variant % colors.length];
    box(context, -0.72, -0.95, 1.44, 0.62, body, 0.18);
    box(context, -0.52, -1.42, 1.04, 0.52, body, 0.2);
    box(context, -0.42, -1.33, 0.84, 0.36, "#cfeefa", 0.12, 0.035);
    // Światła i tablica.
    box(context, -0.66, -0.78, 0.26, 0.14, COLORS.pracu, 0.05, 0.03);
    box(context, 0.4, -0.78, 0.26, 0.14, COLORS.pracu, 0.05, 0.03);
    box(context, -0.22, -0.6, 0.44, 0.14, COLORS.bialy, 0.03, 0.03);
    label(context, "SOWA 1", 0, -0.53, 0.09, INK);
    for (const x of [-0.52, 0.52]) box(context, x - 0.13, -0.36, 0.26, 0.36, INK, 0.07, 0);
    // Wydech (lekki dymek).
    const puff = (t * 1.5) % 1;
    context.globalAlpha *= 1 - puff;
    ellipse(context, -0.45 - puff * 0.2, -0.3 + puff * -0.3, 0.06 + puff * 0.12, 0.05 + puff * 0.1, COLORS.szary, 0);
  },
  // Zadaszenie stacji: biała belka z zielonym pasem na wysokości głowy (Amic, wysoka — ślizg).
  zadaszenie(context) {
    context.fillStyle = COLORS.szary;
    context.fillRect(-0.62, -2.1, 0.08, 2.1);
    context.fillRect(0.54, -2.1, 0.08, 2.1);
    box(context, -0.72, -2.1, 1.44, 1.2, COLORS.bialy, 0.06);
    box(context, -0.72, -1.4, 1.44, 0.3, COLORS.amicZielony, 0.02, 0.035);
    label(context, "Amic", 0, -1.25, 0.22);
    box(context, -0.3, -1.9, 0.6, 0.25, COLORS.amicCzerwony, 0.06, 0.03);
    label(context, "6,19", 0, -1.77, 0.16);
  },
});

// ---------- Dziki (plansza PRL) ----------

// Dzik w biegu (widok od tyłu-boku, pysk w stronę sowy); `phase` — faza kroku.
export function drawBoar(context, t, phase = 0, { angry = false } = {}) {
  const step = Math.sin(t * 18 + phase);
  // Nogi.
  context.fillStyle = "#5b3f2e";
  for (const [x, offset] of [
    [-0.32, step],
    [-0.12, -step],
    [0.12, step],
    [0.32, -step],
  ]) {
    rounded(context, x - 0.05, -0.3 + offset * 0.04, 0.1, 0.3 - offset * 0.04, 0.04);
    context.fill();
  }
  // Tułów ze szczeciną.
  ellipse(context, 0, -0.48, 0.5, 0.28, "#7a5540", 0.045);
  context.strokeStyle = "#4a3326";
  context.lineWidth = 0.035;
  for (let index = -3; index <= 3; index += 1) {
    context.beginPath();
    context.moveTo(index * 0.09, -0.72);
    context.lineTo(index * 0.09 + 0.04, -0.82);
    context.stroke();
  }
  // Głowa z ryjkiem i kłami (do przodu = w dół ekranu, w stronę gracza).
  ellipse(context, 0, -0.5, 0.27, 0.24, "#8a6049", 0.045);
  ellipse(context, 0, -0.42, 0.15, 0.1, COLORS.policzki, 0.035);
  context.fillStyle = INK;
  for (const x of [-0.05, 0.05]) {
    context.beginPath();
    context.arc(x, -0.42, 0.025, 0, Math.PI * 2);
    context.fill();
  }
  context.fillStyle = COLORS.bialy;
  for (const x of [-0.13, 0.13]) {
    context.beginPath();
    context.moveTo(x, -0.38);
    context.lineTo(x + Math.sign(x) * 0.05, -0.47);
    context.lineTo(x + Math.sign(x) * 0.01, -0.36);
    context.closePath();
    context.fill();
  }
  // Oczy i uszy.
  for (const x of [-0.12, 0.12]) {
    ellipse(context, x, -0.6, 0.04, angry ? 0.025 : 0.04, INK, 0);
    context.fillStyle = "#6b4a37";
    context.beginPath();
    context.moveTo(x * 1.6, -0.66);
    context.lineTo(x * 2.1, -0.82);
    context.lineTo(x * 1.1, -0.72);
    context.closePath();
    context.fill();
  }
  if (angry) {
    context.strokeStyle = INK;
    context.lineWidth = 0.03;
    for (const x of [-0.12, 0.12]) {
      context.beginPath();
      context.moveTo(x - Math.sign(x) * 0.06, -0.68);
      context.lineTo(x + Math.sign(x) * 0.05, -0.64);
      context.stroke();
    }
  }
}

// ---------- Dekoracje (bez kolizji, poza korytarzem trzech torów) ----------

// Regał sklepowy z produktami (Biedronka): szerokość 1,6 m, wysokość 2,3 m.
function shelf(context, t, seed) {
  box(context, -0.8, -2.3, 1.6, 2.3, "#dfe6ee", 0.05);
  const palette = [
    COLORS.pomaranczowy,
    COLORS.monsteraJasna,
    COLORS.zloto,
    COLORS.niebieski,
    COLORS.policzki,
    "#e2231a",
  ];
  for (let row = 0; row < 4; row += 1) {
    const y = -0.5 - row * 0.52;
    context.fillStyle = COLORS.szaryCiemny;
    context.fillRect(-0.76, y + 0.05, 1.52, 0.05);
    for (let item = 0; item < 5; item += 1) {
      const color = palette[(seed * 7 + row * 3 + item) % palette.length];
      const height = 0.2 + ((seed + row + item * 2) % 3) * 0.08;
      box(context, -0.7 + item * 0.29, y + 0.05 - height, 0.24, height, color, 0.04, 0.025);
    }
  }
  box(context, -0.8, -2.62, 1.6, 0.32, "#e2231a", 0.06, 0.035);
  label(context, seed % 3 === 0 ? "PROMOCJA" : seed % 3 === 1 ? "SUPER CENA!" : "NOWOŚĆ", 0, -2.46, 0.2);
  ladybug(context, 0.62, -2.46, 0.08);
}

// Piekarnia / automat z pieczywem (Biedronka).
function bakery(context) {
  box(context, -0.8, -1.9, 1.6, 1.9, "#f3e3c8", 0.08);
  box(context, -0.8, -2.2, 1.6, 0.35, COLORS.zloto, 0.06, 0.035);
  label(context, "PIEKARNIA", 0, -2.03, 0.2, INK);
  for (let row = 0; row < 3; row += 1) {
    for (let item = 0; item < 3; item += 1) {
      ellipse(context, -0.45 + item * 0.45, -1.45 + row * 0.45, 0.17, 0.1, "#d99a1e", 0.03);
    }
  }
}

// Pracownik z paleciakiem (Biedronka, przy prawym brzegu).
function worker(context, t) {
  const bob = Math.abs(Math.sin(t * 5)) * 0.03;
  box(context, -0.75, -0.25, 0.9, 0.12, COLORS.szaryCiemny, 0.03, 0.03);
  box(context, -0.72, -0.9, 0.84, 0.65, "#c9965f", 0.04, 0.035);
  box(context, 0.2, -1.55 - bob, 0.42, 0.72, "#e2231a", 0.12);
  ellipse(context, 0.41, -1.75 - bob, 0.18, 0.18, COLORS.sowaTwarz, 0.035);
  box(context, 0.27, -1.98 - bob, 0.28, 0.1, "#e2231a", 0.04, 0.03);
  context.strokeStyle = INK;
  context.lineWidth = 0.05;
  context.beginPath();
  context.moveTo(0.2, -1.2 - bob);
  context.lineTo(0.05, -0.9);
  context.stroke();
}

// Metalowy stojak z roślinami (festiwal roślin).
function plantRack(context, t, seed) {
  context.fillStyle = COLORS.szaryCiemny;
  context.fillRect(-0.75, -2, 0.06, 2);
  context.fillRect(0.69, -2, 0.06, 2);
  for (let row = 0; row < 3; row += 1) {
    const y = -0.4 - row * 0.7;
    context.fillRect(-0.75, y, 1.5, 0.05);
    for (let item = 0; item < 3; item += 1) {
      const x = -0.5 + item * 0.5;
      box(context, x - 0.13, y - 0.22, 0.26, 0.22, COLORS.doniczka, 0.04, 0.03);
      const sway = Math.sin(t * 1.6 + seed + item + row) * 0.04;
      const leaf = (seed + item + row) % 3 === 0 ? COLORS.policzki : COLORS.monstera;
      ellipse(context, x + sway, y - 0.36, 0.18, 0.16, leaf, 0.03);
      ellipse(context, x - 0.08 + sway, y - 0.3, 0.1, 0.08, COLORS.monsteraCiemna, 0);
    }
  }
}

// Wózek pełen kwiatów (festiwal roślin).
function flowerCart(context, t, seed) {
  box(context, -0.7, -0.75, 1.4, 0.45, "#c9965f", 0.05);
  for (const x of [-0.45, 0.45]) ellipse(context, x, -0.18, 0.16, 0.16, INK, 0);
  const colors = [COLORS.policzki, COLORS.zloto, COLORS.fiolet, COLORS.bialy, COLORS.pracu];
  for (let item = 0; item < 7; item += 1) {
    const x = -0.6 + item * 0.2;
    const sway = Math.sin(t * 2 + item + seed) * 0.03;
    context.strokeStyle = COLORS.monsteraCiemna;
    context.lineWidth = 0.03;
    context.beginPath();
    context.moveTo(x, -0.75);
    context.lineTo(x + sway, -1.05);
    context.stroke();
    ellipse(context, x + sway, -1.1, 0.08, 0.08, colors[(item + seed) % colors.length], 0.025);
  }
}

// Zwiedzający (festiwal roślin) — dekoracja przy bokach.
function visitor(context, t, seed) {
  const colors = [COLORS.niebieski, COLORS.fiolet, COLORS.pomaranczowy, COLORS.monstera];
  const bob = Math.abs(Math.sin(t * 3 + seed)) * 0.03;
  box(context, -0.22, -1.15 - bob, 0.44, 0.8, colors[seed % colors.length], 0.14);
  ellipse(context, 0, -1.35 - bob, 0.17, 0.17, COLORS.sowaTwarz, 0.035);
  context.fillStyle = INK;
  context.fillRect(-0.16, -0.38, 0.1, 0.38);
  context.fillRect(0.06, -0.38, 0.1, 0.38);
  if (seed % 2) {
    // Doniczka w rękach.
    box(context, 0.12, -0.95 - bob, 0.2, 0.18, COLORS.doniczka, 0.03, 0.025);
    ellipse(context, 0.22, -1.05 - bob, 0.12, 0.1, COLORS.monstera, 0.025);
  }
}

// Zraszacz przy krawędzi (festiwal roślin): mgiełka z kropli.
function sprinkler(context, t) {
  context.fillStyle = COLORS.szaryCiemny;
  context.fillRect(-0.04, -0.6, 0.08, 0.6);
  ellipse(context, 0, -0.62, 0.08, 0.05, COLORS.szary, 0.02);
  for (let index = 0; index < 10; index += 1) {
    const phase = (t * 0.9 + index / 10) % 1;
    const angle = -Math.PI / 2 + (index - 4.5) * 0.18;
    const distance = phase * 0.9;
    context.globalAlpha = (1 - phase) * 0.7;
    ellipse(
      context,
      Math.cos(angle) * distance,
      -0.62 + Math.sin(angle) * distance + phase * phase * 0.6,
      0.03,
      0.03,
      COLORS.woda,
      0,
    );
  }
  context.globalAlpha = 1;
}

// Blok z wielkiej płyty (PRL): szerokość 3 m, wysokość 5–6 pięter, okna i balkony; kot na balkonie, gołębie.
function block(context, t, seed) {
  const floors = 5 + (seed % 2);
  const height = floors * 1.1 + 0.4;
  box(context, -1.5, -height, 3, height, seed % 2 ? "#c7c1b5" : "#d8d2c6", 0.04);
  context.strokeStyle = "rgba(59, 47, 74, 0.18)";
  context.lineWidth = 0.03;
  for (let floor = 1; floor < floors; floor += 1) {
    context.beginPath();
    context.moveTo(-1.5, -floor * 1.1);
    context.lineTo(1.5, -floor * 1.1);
    context.stroke();
  }
  for (let floor = 0; floor < floors; floor += 1) {
    for (let column = 0; column < 3; column += 1) {
      const x = -1.2 + column * 0.9;
      const y = -0.95 - floor * 1.1;
      const lit = (seed + floor * 3 + column) % 4 === 0;
      box(context, x, y, 0.5, 0.55, lit ? "#f4e6aa" : "#a8c8d8", 0.04, 0.025);
      if (column === 1 && floor > 0) box(context, x - 0.1, y + 0.45, 0.7, 0.2, COLORS.szaryCiemny, 0.03, 0.025);
    }
  }
  // Kot na balkonie (co drugi blok) i gołębie na dachu.
  if (seed % 2 === 0) {
    const y = -0.95 - 2 * 1.1 + 0.45;
    ellipse(context, 0.1, y - 0.1, 0.13, 0.1, COLORS.pomaranczowy, 0.025);
    ellipse(context, 0.2, y - 0.2, 0.08, 0.07, COLORS.pomaranczowy, 0.025);
    context.strokeStyle = COLORS.pomaranczowy;
    context.lineWidth = 0.03;
    context.beginPath();
    context.moveTo(-0.02, y - 0.1);
    context.quadraticCurveTo(-0.15, y - 0.3 + Math.sin(t * 3) * 0.05, -0.05, y - 0.35);
    context.stroke();
  }
  for (let bird = 0; bird < 3; bird += 1) {
    const x = -1 + bird * 0.8 + Math.sin(t * 0.8 + bird + seed) * 0.1;
    ellipse(context, x, -height - 0.1, 0.12, 0.08, COLORS.szary, 0.025);
    ellipse(context, x + 0.1, -height - 0.18, 0.06, 0.06, COLORS.szaryCiemny, 0);
  }
}

// Trzepak (PRL).
function carpetBeater(context) {
  context.strokeStyle = COLORS.szaryCiemny;
  context.lineWidth = 0.07;
  context.beginPath();
  context.moveTo(-0.9, 0);
  context.lineTo(-0.9, -1.5);
  context.moveTo(0.9, 0);
  context.lineTo(0.9, -1.5);
  context.moveTo(-0.9, -1.4);
  context.lineTo(0.9, -1.4);
  context.stroke();
  box(context, -0.5, -1.4, 0.9, 0.6, COLORS.pracu, 0.03, 0.03);
  context.strokeStyle = COLORS.zloto;
  context.lineWidth = 0.04;
  context.strokeRect(-0.42, -1.3, 0.74, 0.42);
}

// Ławka (PRL).
function bench(context) {
  box(context, -0.7, -0.5, 1.4, 0.12, "#8fb56f", 0.03, 0.03);
  box(context, -0.7, -0.85, 1.4, 0.12, "#8fb56f", 0.03, 0.03);
  context.fillStyle = COLORS.szaryCiemny;
  context.fillRect(-0.6, -0.5, 0.08, 0.5);
  context.fillRect(0.52, -0.5, 0.08, 0.5);
}

// Betonowy słupek (PRL, dekoracja przy krawędzi).
function post(context) {
  box(context, -0.14, -0.7, 0.28, 0.7, "#b8b2a8", 0.06, 0.035);
  context.fillStyle = COLORS.zloto;
  context.fillRect(-0.14, -0.55, 0.28, 0.08);
}

// Sklep stacji Amic (tło przy boku).
function stationShop(context) {
  box(context, -1.5, -2.8, 3, 2.8, COLORS.bialy, 0.06);
  box(context, -1.5, -3.3, 3, 0.55, COLORS.amicZielony, 0.05);
  label(context, "Amic", -0.6, -3.03, 0.4);
  box(context, 0.2, -3.2, 1.1, 0.35, COLORS.amicCzerwony, 0.06, 0.03);
  label(context, "SKLEP", 0.75, -3.02, 0.22);
  box(context, -1.2, -2.2, 1.2, 1.2, "#cfeefa", 0.04, 0.035);
  box(context, 0.3, -2.2, 0.8, 2.2, "#cfeefa", 0.04, 0.035);
}

// Pylon z cenami paliw (stacja Amic).
function pricePylon(context) {
  context.fillStyle = COLORS.szaryCiemny;
  context.fillRect(-0.08, -1.2, 0.16, 1.2);
  box(context, -0.55, -3.3, 1.1, 2.1, COLORS.amicZielony, 0.08);
  label(context, "Amic", 0, -3.05, 0.3);
  for (const [index, [name, price]] of [
    ["95", "6,19"],
    ["ON", "6,49"],
    ["LPG", "3,09"],
  ].entries()) {
    const y = -2.65 + index * 0.45;
    box(context, -0.45, y, 0.9, 0.36, COLORS.bialy, 0.04, 0.025);
    label(context, name, -0.22, y + 0.18, 0.16, INK);
    label(context, price, 0.18, y + 0.18, 0.18, COLORS.amicCzerwony);
  }
}

// Zaparkowany samochód przy boku (stacja Amic).
function parkedCar(context, t, seed) {
  OBSTACLE_PROPS.samochod(context, 0, seed);
}

// Donica z rośliną (dekoracja przy boku; w obecnej grze przeszkoda „Donica na torze!”).
function planter(context, t, seed) {
  box(context, -0.3, -0.5, 0.6, 0.5, COLORS.doniczka, 0.06);
  const sway = Math.sin(t * 1.5 + seed) * 0.04;
  ellipse(context, sway, -0.8, 0.32, 0.3, COLORS.monstera, 0.035);
  ellipse(context, -0.14 + sway, -0.95, 0.14, 0.12, COLORS.monsteraJasna, 0.025);
}

// ---------- Scenografia — więcej rodzajów (uwaga właściciela T4) ----------
// Biedronka (format sklepu 3.0/4.0): strefa owoców i warzyw jak stragan pod daszkiem, oszklone lodówki, kwiaty,
// promocje na paletach, kasy (także samoobsługowe), koszyki. Kolory i napisy w stylu gry, bez logotypów.

// Stragan z owocami i warzywami w skrzynkach pod czerwono-białym daszkiem.
function fruitStand(context, t, seed) {
  // Daszek w pasy na dwóch słupkach.
  context.fillStyle = COLORS.szaryCiemny;
  context.fillRect(-0.76, -2.15, 0.06, 2.15);
  context.fillRect(0.7, -2.15, 0.06, 2.15);
  for (let stripe = 0; stripe < 6; stripe += 1) {
    context.fillStyle = stripe % 2 ? COLORS.bialy : "#e2231a";
    context.fillRect(-0.8 + stripe * (1.6 / 6), -2.35, 1.6 / 6, 0.32);
  }
  context.strokeStyle = INK;
  context.lineWidth = 0.04;
  context.strokeRect(-0.8, -2.35, 1.6, 0.32);
  // Stół z trzema skrzynkami na dwóch poziomach.
  box(context, -0.78, -0.75, 1.56, 0.12, "#c9965f", 0.03, 0.035);
  context.fillStyle = "#8a5a3b";
  context.fillRect(-0.7, -0.63, 0.08, 0.63);
  context.fillRect(0.62, -0.63, 0.08, 0.63);
  const produce = [
    ["#e2231a", "JABŁKA"],
    [COLORS.pomaranczowy, "POMARAŃCZE"],
    [COLORS.zloto, "BANANY"],
    [COLORS.monstera, "SAŁATA"],
    ["#e8742c", "MARCHEW"],
    [COLORS.fiolet, "ŚLIWKI"],
  ];
  for (let index = 0; index < 3; index += 1) {
    const [color] = produce[(seed + index * 2) % produce.length];
    const x = -0.52 + index * 0.52;
    const y = -0.75 - (index === 1 ? 0.5 : 0.22);
    box(context, x - 0.24, y, 0.48, 0.22, "#d9a066", 0.03, 0.03);
    for (let fruit = 0; fruit < 4; fruit += 1) {
      ellipse(context, x - 0.16 + fruit * 0.11, y - 0.02, 0.07, 0.07, color, 0.02);
    }
  }
  const [, name] = produce[seed % produce.length];
  box(context, -0.5, -1.75, 1, 0.24, COLORS.bialy, 0.05, 0.03);
  label(context, name, 0, -1.63, 0.13, INK);
}

// Oszklona lodówka (dwoje drzwi, podświetlenie LED): nabiał albo napoje.
function fridge(context, t, seed) {
  box(context, -0.8, -2.25, 1.6, 2.25, "#e9eef3", 0.06);
  box(context, -0.76, -2.2, 1.52, 0.18, COLORS.bialy, 0.03, 0.025);
  const drinks = seed % 2 === 1;
  label(context, drinks ? "NAPOJE" : "NABIAŁ", 0, -2.11, 0.13, COLORS.niebieski);
  for (const x of [-0.74, 0.02]) {
    box(context, x, -1.95, 0.72, 1.8, "#d9f2fb", 0.04, 0.035);
    for (let row = 0; row < 4; row += 1) {
      const y = -1.62 + row * 0.42;
      context.fillStyle = COLORS.szary;
      context.fillRect(x + 0.04, y + 0.06, 0.64, 0.03);
      for (let item = 0; item < 4; item += 1) {
        const color = drinks
          ? [COLORS.pomaranczowy, COLORS.monstera, COLORS.woda, "#e2231a"][(seed + row + item) % 4]
          : [COLORS.bialy, COLORS.zloto, COLORS.niebieski, COLORS.policzki][(seed + row * 2 + item) % 4];
        const height = drinks ? 0.28 : 0.18;
        box(context, x + 0.07 + item * 0.15, y + 0.06 - height, 0.11, height, color, 0.03, 0.02);
      }
    }
    // Uchwyt drzwi.
    context.fillStyle = COLORS.szaryCiemny;
    context.fillRect(x + (x < 0 ? 0.62 : 0.06), -1.2, 0.04, 0.4);
  }
  // Delikatna poświata LED u góry szyb.
  context.fillStyle = "rgba(255, 255, 255, 0.55)";
  context.fillRect(-0.72, -1.93, 1.44, 0.05);
}

// Kwiaty w wiaderkach na schodkowym stojaku.
function flowerStand(context, t, seed) {
  box(context, -0.6, -0.45, 1.2, 0.45, "#c9965f", 0.04);
  box(context, -0.5, -0.8, 1, 0.35, "#b9895a", 0.04);
  const colors = [COLORS.policzki, COLORS.zloto, "#e2231a", COLORS.fiolet, COLORS.bialy];
  for (let index = 0; index < 5; index += 1) {
    const top = index % 2 === 0;
    const x = -0.44 + index * 0.22;
    const base = top ? -0.8 : -0.45;
    box(context, x - 0.09, base - 0.2, 0.18, 0.2, COLORS.szary, 0.03, 0.025);
    const sway = Math.sin(t * 1.8 + index + seed) * 0.03;
    for (let flower = 0; flower < 3; flower += 1) {
      const fx = x - 0.06 + flower * 0.06 + sway;
      context.strokeStyle = COLORS.monsteraCiemna;
      context.lineWidth = 0.02;
      context.beginPath();
      context.moveTo(x - 0.04 + flower * 0.04, base - 0.2);
      context.lineTo(fx, base - 0.5);
      context.stroke();
      ellipse(context, fx, base - 0.55, 0.06, 0.06, colors[(index + flower + seed) % colors.length], 0.02);
    }
  }
  box(context, -0.45, -1.62, 0.9, 0.24, COLORS.bialy, 0.05, 0.03);
  label(context, "KWIATY", 0, -1.5, 0.13, COLORS.monsteraCiemna);
}

// Promocja na palecie: stos kartonów i duża tablica „-50%”.
function promoPallet(context, t, seed) {
  box(context, -0.7, -0.14, 1.4, 0.14, "#c9965f", 0.02, 0.035);
  const colors = [COLORS.niebieski, COLORS.zloto, COLORS.monsteraJasna, COLORS.policzki];
  for (let row = 0; row < 3; row += 1) {
    for (let item = 0; item < 3 - (row === 2 ? 1 : 0); item += 1) {
      const x = -0.62 + item * 0.42 + (row === 2 ? 0.21 : 0);
      const y = -0.14 - (row + 1) * 0.34;
      box(context, x, y, 0.4, 0.34, "#d9a066", 0.03, 0.03);
      box(context, x + 0.08, y + 0.1, 0.24, 0.12, colors[(seed + row + item) % colors.length], 0.02, 0.02);
    }
  }
  context.fillStyle = COLORS.szaryCiemny;
  context.fillRect(0.55, -2, 0.05, 1);
  box(context, 0.2, -2.3, 0.75, 0.5, "#e2231a", 0.08);
  label(context, seed % 2 ? "-50%" : "2+1", 0.575, -2.05, 0.24, COLORS.zloto);
  ladybug(context, 0.85, -2.22, 0.06);
}

// Kasa (taśma, terminal, numer na słupku) albo kasa samoobsługowa z ekranem.
function checkout(context, t, seed) {
  if (seed % 2) {
    box(context, -0.45, -1.1, 0.9, 1.1, COLORS.bialy, 0.06);
    box(context, -0.3, -1.6, 0.6, 0.5, INK, 0.05, 0.03);
    box(context, -0.25, -1.55, 0.5, 0.4, COLORS.woda, 0.03, 0.02);
    label(context, "Hu-hu!", 0, -1.35, 0.1, INK);
    box(context, -0.4, -1.05, 0.8, 0.12, COLORS.szary, 0.02, 0.02);
    context.fillStyle = COLORS.szaryCiemny;
    context.fillRect(-0.03, -2.12, 0.06, 0.52);
    box(context, -0.6, -2.4, 1.2, 0.3, COLORS.zloto, 0.06, 0.03);
    label(context, "KASA SAMOOBSŁUGOWA", 0, -2.25, 0.09, INK);
    return;
  }
  box(context, -0.8, -0.9, 1.6, 0.9, COLORS.szary, 0.05);
  box(context, -0.78, -0.95, 1.1, 0.1, INK, 0.03, 0.02);
  box(context, 0.35, -1.3, 0.4, 0.35, COLORS.bialy, 0.05, 0.03);
  box(context, 0.42, -1.25, 0.26, 0.14, COLORS.monsteraJasna, 0.02, 0.02);
  // Zakupy na taśmie.
  for (const [x, color] of [
    [-0.6, COLORS.pomaranczowy],
    [-0.35, COLORS.niebieski],
    [-0.1, COLORS.zloto],
  ]) {
    box(context, x, -1.15, 0.18, 0.2, color, 0.03, 0.02);
  }
  context.fillStyle = COLORS.szaryCiemny;
  context.fillRect(0.72, -2.3, 0.05, 1.4);
  ellipse(context, 0.745, -2.4, 0.16, 0.16, "#e2231a", 0.03);
  label(context, String(1 + (seed % 6)), 0.745, -2.4, 0.16);
}

// Stos czerwonych koszyków (przy krawędzi drogi).
function baskets(context) {
  for (let index = 0; index < 4; index += 1) {
    const y = -0.18 - index * 0.12;
    box(context, -0.26, y, 0.52, 0.22, "#e2231a", 0.05, 0.03);
  }
  context.strokeStyle = INK;
  context.lineWidth = 0.03;
  context.beginPath();
  context.arc(0, -0.62, 0.16, Math.PI, 0);
  context.stroke();
}

// Festiwal: namiot ze sprzedażą sadzonek i pęk balonów.
function seedlingTent(context, t, seed) {
  context.fillStyle = COLORS.szaryCiemny;
  context.fillRect(-0.78, -2, 0.05, 2);
  context.fillRect(0.73, -2, 0.05, 2);
  context.fillStyle = seed % 2 ? COLORS.monsteraJasna : COLORS.policzki;
  context.beginPath();
  context.moveTo(-0.9, -2);
  context.lineTo(0, -2.6);
  context.lineTo(0.9, -2);
  context.closePath();
  context.fill();
  context.strokeStyle = INK;
  context.lineWidth = 0.04;
  context.stroke();
  box(context, -0.7, -0.7, 1.4, 0.1, "#c9965f", 0.03, 0.03);
  for (let index = 0; index < 5; index += 1) {
    const x = -0.56 + index * 0.28;
    box(context, x - 0.08, -0.86, 0.16, 0.16, COLORS.doniczka, 0.03, 0.02);
    const sway = Math.sin(t * 1.4 + index + seed) * 0.03;
    ellipse(context, x + sway, -0.98, 0.1, 0.1, COLORS.monstera, 0.02);
  }
  box(context, -0.5, -1.85, 1, 0.26, COLORS.bialy, 0.05, 0.03);
  label(context, "SADZONKI", 0, -1.72, 0.14, COLORS.monsteraCiemna);
}

function balloons(context, t, seed) {
  const colors = [COLORS.policzki, COLORS.woda, COLORS.zloto, COLORS.fiolet, COLORS.monsteraJasna];
  context.strokeStyle = COLORS.szaryCiemny;
  context.lineWidth = 0.02;
  for (let index = 0; index < 5; index += 1) {
    const bob = Math.sin(t * 1.5 + index + seed) * 0.05;
    const x = -0.3 + index * 0.15;
    const y = -1.9 - (index % 2) * 0.25 + bob;
    context.beginPath();
    context.moveTo(0, -0.2);
    context.lineTo(x, y + 0.2);
    context.stroke();
    ellipse(context, x, y, 0.16, 0.2, colors[(index + seed) % colors.length], 0.025);
  }
  box(context, -0.08, -0.2, 0.16, 0.2, COLORS.szary, 0.03, 0.02);
}

// PRL: kiosk z gazetami, mały fiat przy krawężniku, piaskownica.
function kiosk(context) {
  box(context, -0.8, -2.1, 1.6, 2.1, "#e9e0c9", 0.06);
  box(context, -0.85, -2.35, 1.7, 0.3, "#c8553d", 0.05);
  label(context, "KIOSK", 0, -2.2, 0.18);
  box(context, -0.6, -1.7, 1.2, 0.8, "#cfeefa", 0.04, 0.035);
  for (let index = 0; index < 4; index += 1) {
    box(
      context,
      -0.55 + index * 0.28,
      -1.65,
      0.22,
      0.3,
      [COLORS.zloto, COLORS.bialy, COLORS.policzki, COLORS.woda][index],
      0.02,
      0.02,
    );
  }
  box(context, -0.8, -0.95, 1.6, 0.12, "#8a5a3b", 0.03, 0.03);
}

function smallFiat(context, t, seed) {
  const body = ["#d9b23a", "#8fb56f", "#c8553d", COLORS.woda][seed % 4];
  box(context, -0.62, -0.85, 1.24, 0.55, body, 0.2);
  box(context, -0.42, -1.25, 0.84, 0.45, body, 0.22);
  box(context, -0.34, -1.18, 0.68, 0.3, "#cfeefa", 0.12, 0.03);
  for (const x of [-0.42, 0.42]) ellipse(context, x, -0.28, 0.14, 0.14, INK, 0);
  box(context, -0.56, -0.72, 0.2, 0.12, COLORS.zloto, 0.04, 0.02);
  box(context, 0.36, -0.72, 0.2, 0.12, COLORS.zloto, 0.04, 0.02);
}

function sandbox(context, t, seed) {
  box(context, -0.75, -0.3, 1.5, 0.3, "#c9965f", 0.04);
  ellipse(context, 0, -0.32, 0.65, 0.1, "#f2d38b", 0);
  ellipse(context, -0.25, -0.42, 0.18, 0.12, "#f2d38b", 0.02);
  // Wiaderko i łopatka.
  box(context, 0.2, -0.6, 0.18, 0.2, seed % 2 ? COLORS.policzki : COLORS.woda, 0.03, 0.02);
  context.strokeStyle = COLORS.zloto;
  context.lineWidth = 0.04;
  context.beginPath();
  context.moveTo(0.5, -0.35);
  context.lineTo(0.62, -0.8);
  context.stroke();
}

// Stacja Amic: myjnia, klatka z butlami gazowymi, stanowisko „powietrze i woda”.
function carWash(context, t) {
  box(context, -0.9, -2.6, 1.8, 0.4, COLORS.amicZielony, 0.06);
  label(context, "MYJNIA", 0, -2.4, 0.2);
  context.fillStyle = COLORS.szary;
  context.fillRect(-0.85, -2.2, 0.12, 2.2);
  context.fillRect(0.73, -2.2, 0.12, 2.2);
  // Kręcące się szczotki.
  for (const x of [-0.55, 0.55]) {
    box(context, x - 0.13, -1.9, 0.26, 1.6, COLORS.woda, 0.12, 0.03);
    context.strokeStyle = COLORS.bialy;
    context.lineWidth = 0.03;
    for (let line = 0; line < 4; line += 1) {
      const y = -1.8 + ((line * 0.4 + t * 1.2) % 1.6);
      context.beginPath();
      context.moveTo(x - 0.1, y);
      context.lineTo(x + 0.1, y + 0.08);
      context.stroke();
    }
  }
}

function gasCage(context) {
  box(context, -0.6, -1.3, 1.2, 1.3, COLORS.szary, 0.04);
  for (let index = 0; index < 4; index += 1) {
    const x = -0.42 + index * 0.28;
    box(context, x - 0.1, -1.1, 0.2, 0.9, index % 2 ? COLORS.amicCzerwony : COLORS.zloto, 0.08, 0.025);
  }
  context.strokeStyle = COLORS.szaryCiemny;
  context.lineWidth = 0.025;
  for (let index = 0; index < 7; index += 1) {
    const x = -0.6 + index * 0.2;
    context.beginPath();
    context.moveTo(x, -1.3);
    context.lineTo(x, 0);
    context.stroke();
  }
  box(context, -0.4, -1.55, 0.8, 0.22, COLORS.bialy, 0.04, 0.025);
  label(context, "GAZ", 0, -1.44, 0.13, COLORS.amicCzerwony);
}

function airStation(context) {
  box(context, -0.25, -1.4, 0.5, 1.4, COLORS.amicZielony, 0.06);
  box(context, -0.18, -1.3, 0.36, 0.3, COLORS.bialy, 0.04, 0.02);
  label(context, "AIR", 0, -1.15, 0.1, INK);
  context.strokeStyle = INK;
  context.lineWidth = 0.035;
  context.beginPath();
  context.moveTo(0.25, -0.8);
  context.quadraticCurveTo(0.6, -0.5, 0.45, -0.1);
  context.stroke();
}

export const DECOR_PROPS = Object.freeze({
  regal: shelf,
  piekarnia: bakery,
  pracownik: worker,
  stojakRoslin: plantRack,
  wozekKwiatow: flowerCart,
  zwiedzajacy: visitor,
  zraszacz: sprinkler,
  blok: block,
  trzepak: carpetBeater,
  lawka: bench,
  slupek: post,
  sklepAmic: stationShop,
  pylon: pricePylon,
  auto: parkedCar,
  donica: planter,
  warzywniak: fruitStand,
  lodowka: fridge,
  kwiaty: flowerStand,
  promocja: promoPallet,
  kasa: checkout,
  koszyki: baskets,
  namiot: seedlingTent,
  balony: balloons,
  kiosk,
  maluch: smallFiat,
  piaskownica: sandbox,
  myjnia: carWash,
  butle: gasCage,
  powietrze: airStation,
});

// Szerokość (m) rekwizytu dekoracji — do rozstawiania przy krawędzi drogi.
export const DECOR_WIDTH = Object.freeze({
  regal: 1.6,
  piekarnia: 1.6,
  pracownik: 1.4,
  stojakRoslin: 1.5,
  wozekKwiatow: 1.4,
  zwiedzajacy: 0.5,
  zraszacz: 0.3,
  blok: 3,
  trzepak: 1.8,
  lawka: 1.4,
  slupek: 0.3,
  sklepAmic: 3,
  pylon: 1.1,
  auto: 1.5,
  donica: 0.6,
  warzywniak: 1.6,
  lodowka: 1.6,
  kwiaty: 1.2,
  promocja: 1.6,
  kasa: 1.6,
  koszyki: 0.6,
  namiot: 1.8,
  balony: 0.8,
  kiosk: 1.7,
  maluch: 1.3,
  piaskownica: 1.5,
  myjnia: 1.8,
  butle: 1.2,
  powietrze: 0.6,
});

// Transparenty nad alejką / girlandy / zadaszenie nad drogą (wysoko, bez kolizji): rysunek szerokości `width` m.
export function drawOverhead(context, kind, width, t) {
  if (kind === "baner") {
    box(context, -width / 2, -0.7, width, 0.7, "#e2231a", 0.1);
    label(context, "SUPER CENA!", -width * 0.18, -0.35, 0.42);
    label(context, "-30%", width * 0.3, -0.35, 0.4, COLORS.zloto);
    ladybug(context, width / 2 - 0.35, -0.35, 0.12);
  } else if (kind === "girlanda") {
    context.strokeStyle = COLORS.szaryCiemny;
    context.lineWidth = 0.03;
    context.beginPath();
    context.moveTo(-width / 2, -0.6);
    context.quadraticCurveTo(0, 0.1, width / 2, -0.6);
    context.stroke();
    const colors = [COLORS.pracu, COLORS.zloto, COLORS.niebieski, COLORS.monstera, COLORS.fiolet];
    const count = Math.max(4, Math.round(width / 0.5));
    for (let index = 1; index < count; index += 1) {
      const u = index / count;
      const x = -width / 2 + u * width;
      const y = -0.6 + 0.7 * 4 * u * (1 - u) * 0.5 + Math.sin(t * 2 + index) * 0.02;
      context.fillStyle = colors[index % colors.length];
      context.beginPath();
      context.moveTo(x - 0.14, y);
      context.lineTo(x + 0.14, y);
      context.lineTo(x, y + 0.3);
      context.closePath();
      context.fill();
    }
    // Balony na końcach.
    for (const side of [-1, 1]) {
      const bob = Math.sin(t * 1.5 + side) * 0.08;
      ellipse(context, side * (width / 2 - 0.1), -1 + bob, 0.2, 0.25, side < 0 ? COLORS.policzki : COLORS.woda, 0.03);
    }
    box(context, -1.4, -1.2, 2.8, 0.45, COLORS.bialy, 0.12, 0.035);
    label(context, "FESTIWAL ROŚLIN", 0, -0.97, 0.26, COLORS.monsteraCiemna);
  } else if (kind === "zadaszenie") {
    box(context, -width / 2, -0.8, width, 0.8, COLORS.bialy, 0.06);
    box(context, -width / 2, -0.35, width, 0.2, COLORS.amicZielony, 0.02, 0.03);
    label(context, "Amic", 0, -0.6, 0.34, COLORS.amicZielony);
  } else if (kind === "napisPrl") {
    box(context, -1.6, -0.6, 3.2, 0.6, "#c8553d", 0.08);
    label(context, "OSIEDLE SÓWKA", 0, -0.3, 0.3);
  }
}
