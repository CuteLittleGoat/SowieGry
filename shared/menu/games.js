// Zakładka „Gry”: karty gier z rejestru (SowiePlatform.GAME_REGISTRY) na krętej ścieżce przez „Sowi Świat”.
// Karta: ilustracja z postaciami (płótno + atlas), nazwa, opis, rekord osobisty z profilu, „Graj” i „Jak grać?”.
import { drawShadow } from "../engine/sprites.js";
import { ICONS } from "../ui/icons.js";
import { createOwlAnimator, drawOwl } from "../world/owl.js";
import { COLORS } from "../world/tokens.js";

// Dane menu dla gier z rejestru: przystanek na ścieżce, opis i kolory biomu.
export const MENU_GAMES = Object.freeze({
  runner: {
    station: "Łąka",
    description: "Biegnij przez łąkę, skacz nad przeszkodami i zbieraj liście monstery.",
    biome: [COLORS.nieboGora, COLORS.monsteraJasna],
  },
  jumper: {
    station: "Chmury",
    description: "Odbijaj się od chmurek i wspinaj coraz wyżej.",
    biome: [COLORS.niebieski, COLORS.wodaJasna],
  },
  sowa3: {
    station: "Miasto",
    description: "Pędź trzema torami przez sklep, festiwal, blokowisko i stację.",
    biome: [COLORS.policzki, COLORS.sowaBrzuszek],
  },
  ogrody: {
    station: "Ogród",
    description: "Zbieraj liście, sadź rośliny i rozwijaj swój ogród — także gdy Cię nie ma.",
    biome: [COLORS.nieboDol, COLORS.monsteraJasna],
  },
  szklarnia: {
    station: "Szklarnia",
    description: "Buduj szklarnię, krzyżuj rośliny i przeganiaj łakome kozy.",
    biome: [COLORS.wodaJasna, COLORS.monsteraJasna],
  },
});

export const formatNumber = (value) => Math.floor(Number(value) || 0).toLocaleString("pl-PL");
const DIFFICULTIES = ["chill", "arcade", "chaos"];

// Rekord osobisty na karcie (z profil.records — bez dodatkowego odczytu z bazy); null = jeszcze bez gry.
export function recordText(gameId, records = {}) {
  const entry = records[gameId] || {};
  const best = (key) => Math.max(0, ...DIFFICULTIES.map((difficulty) => Number(entry[difficulty]?.[key]) || 0));
  if (gameId === "runner") return best("bestDistance") ? `Rekord: ${formatNumber(best("bestDistance"))} m` : null;
  if (gameId === "jumper") return best("bestHeight") ? `Rekord: ${formatNumber(best("bestHeight"))} m` : null;
  if (gameId === "sowa3") return best("bestScore") ? `Rekord: ${formatNumber(best("bestScore"))} pkt` : null;
  if (gameId === "ogrody") return entry.lifetimeLeaves ? `Liście: ${formatNumber(entry.lifetimeLeaves)}` : null;
  if (gameId === "szklarnia") return entry.rooms ? `Pomieszczenia: ${formatNumber(entry.rooms)}` : null;
  return null;
}

// ---------- Ilustracje kart (płótno, jednostki świata jak w grach) ----------

const hop = (time, period, height) => {
  const t = (time % period) / period;
  return t < 0.6 ? 4 * height * (t / 0.6) * (1 - t / 0.6) : 0;
};

function cloud(context, x, y, width) {
  context.fillStyle = "rgba(255, 255, 255, 0.95)";
  context.beginPath();
  context.ellipse(x, y, width / 2, width / 6, 0, 0, Math.PI * 2);
  context.ellipse(x - width / 5, y - width / 10, width / 5, width / 6, 0, 0, Math.PI * 2);
  context.ellipse(x + width / 6, y - width / 8, width / 4, width / 5, 0, 0, Math.PI * 2);
  context.fill();
}

function ground(context, width, y, color) {
  context.fillStyle = color;
  context.fillRect(0, y, width, 10);
}

// Chmura Pracu (Sowia Ucieczka): szaro-fioletowa chmura z groźnymi oczami, unosi się przy lewej krawędzi.
function workCloud(context, x, y, size, time) {
  const top = y + Math.sin(time * 2) * 0.05;
  context.fillStyle = "#6d6480";
  context.beginPath();
  context.ellipse(x, top, size * 0.6, size * 0.36, 0, 0, Math.PI * 2);
  context.ellipse(x - size * 0.4, top + size * 0.06, size * 0.34, size * 0.26, 0, 0, Math.PI * 2);
  context.ellipse(x + size * 0.28, top - size * 0.16, size * 0.36, size * 0.3, 0, 0, Math.PI * 2);
  context.fill();
  for (const dx of [0.1, 0.34]) {
    context.fillStyle = COLORS.bialy;
    context.beginPath();
    context.arc(x + dx * size, top, size * 0.09, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = COLORS.kontur;
    context.beginPath();
    context.arc(x + dx * size + size * 0.03, top + size * 0.01, size * 0.045, 0, Math.PI * 2);
    context.fill();
  }
  context.strokeStyle = COLORS.kontur;
  context.lineWidth = size * 0.05;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(x + 0.02 * size, top - size * 0.16);
  context.lineTo(x + 0.18 * size, top - size * 0.1);
  context.moveTo(x + 0.26 * size, top - size * 0.1);
  context.lineTo(x + 0.42 * size, top - size * 0.16);
  context.stroke();
}

// Każda scena rysuje w jednostkach świata: szerokość w (zwykle ok. 5–6 j.), wysokość 2,3 j.
const SCENES = {
  runner(context, atlas, time, w, state) {
    ground(context, w, 2.05, COLORS.monstera);
    // Sowia Ucieczka: sowa ucieka przed Chmurą Pracu.
    workCloud(context, 0.2, 1.35, 0.95, time);
    state.owl.set("bieg");
    drawOwl(context, atlas, 1.45, 2.05, { state: state.owl.state(), size: 1.05, cosmetic: state.cosmetic });
    for (let index = 0; index < 3; index += 1) {
      const x = 2.5 + index * 0.55;
      const y = 1.2 - Math.sin((index / 2) * Math.PI) * 0.45 + Math.sin(time * 3 + index) * 0.05;
      atlas.draw(context, "lisc-zielony", x, y, { width: 0.42, rotation: Math.sin(time * 2 + index) * 0.2 });
    }
    atlas.draw(context, "pracu-dymek", w - 0.9, 0.95 + Math.sin(time * 2.4) * 0.12, { width: 0.95 });
  },
  jumper(context, atlas, time, w, state) {
    atlas.draw(context, "amic-sterowiec", w - 1.3 - Math.sin(time * 0.3) * 0.2, 0.55, { width: 1.8, alpha: 0.75 });
    cloud(context, 1.2, 2.0, 1.6);
    cloud(context, w - 1.4, 1.75, 1.2);
    const height = hop(time, 1.4, 0.7);
    state.owl.set(height > 0.02 ? "skok" : "stoi");
    drawShadow(context, 1.2, 1.95, 0.7, { lift: height / 0.7 });
    drawOwl(context, atlas, 1.2, 1.95 - height, {
      state: state.owl.state(),
      size: 1.05,
      cosmetic: state.cosmetic,
      shadow: false,
    });
    atlas.draw(context, "lisc-zloty", 2.6, 0.7 + Math.sin(time * 2) * 0.08, { width: 0.45 });
  },
  sowa3(context, atlas, time, w, state) {
    // Trzy tory w perspektywie.
    context.fillStyle = COLORS.kozaCien;
    context.beginPath();
    context.moveTo(w / 2 - 0.35, 0.35);
    context.lineTo(w / 2 + 0.35, 0.35);
    context.lineTo(w / 2 + 1.9, 2.3);
    context.lineTo(w / 2 - 1.9, 2.3);
    context.closePath();
    context.fill();
    context.strokeStyle = "rgba(255, 255, 255, 0.9)";
    context.lineWidth = 0.05;
    for (const side of [-1, 1]) {
      context.beginPath();
      context.moveTo(w / 2 + side * 0.12, 0.35);
      context.lineTo(w / 2 + side * 0.63, 2.3);
      context.stroke();
    }
    const approach = (time % 2.4) / 2.4;
    atlas.draw(context, "pracu-telefon-magda", w / 2 + approach * 0.7, 0.55 + approach * 0.9, {
      width: 0.3 + approach * 0.7,
    });
    atlas.draw(context, "amic-dystrybutor", w - 0.55, 2.1, { width: 0.9 });
    state.owl.set("bieg");
    drawOwl(context, atlas, w / 2 - 0.1, 2.25, { state: state.owl.state(), size: 0.95, cosmetic: state.cosmetic });
  },
  ogrody(context, atlas, time, w, state) {
    ground(context, w, 2.05, COLORS.monsteraCiemna);
    state.owl.set("stoi");
    drawOwl(context, atlas, 1.0, 2.05, { state: state.owl.state(), size: 1.05, cosmetic: state.cosmetic });
    atlas.draw(context, "zycie", 2.1, 1.75, { width: 0.6 });
    for (let index = 0; index < 3; index += 1) {
      atlas.draw(context, "lisc-zielony", 2.8 + index * 0.45, 1.75 - (index % 2) * 0.25, {
        width: 0.45,
        rotation: Math.sin(time * 1.5 + index) * 0.25,
      });
    }
    const height = hop(time + 0.5, 1.6, 0.45);
    atlas.draw(context, height > 0.02 ? "kozka-podwajaczka-skok" : "kozka-podwajaczka", w - 0.8, 2.05 - height, {
      width: 0.95,
      flipX: true,
    });
  },
  szklarnia(context, atlas, time, w, state) {
    // Łuk szklarni.
    context.strokeStyle = "rgba(255, 255, 255, 0.95)";
    context.lineWidth = 0.06;
    for (let index = 0; index < 3; index += 1) {
      context.beginPath();
      context.arc(w / 2, 2.4, 1.3 + index * 0.55, Math.PI, 0);
      context.stroke();
    }
    ground(context, w, 2.05, COLORS.monstera);
    const cheer = Math.floor(time / 2.2) % 2 === 1;
    state.owl.set(cheer ? "radosc" : "stoi");
    drawOwl(context, atlas, w / 2, 2.05, { state: state.owl.state(), size: 1.05, cosmetic: state.cosmetic });
    atlas.draw(context, "lisc-teczowy", w / 2 - 1.5, 1.2 + Math.sin(time * 2) * 0.08, { width: 0.5 });
    const height = hop(time, 1.2, 0.5);
    atlas.draw(context, height > 0.02 ? "kozka-sprezynka-skok" : "kozka-sprezynka", w / 2 + 1.6, 2.05 - height, {
      width: 0.95,
    });
  },
};

export function drawCardArt(context, atlas, gameId, time, cssWidth, cssHeight, state) {
  const unit = cssHeight / 2.3;
  context.save();
  context.scale(unit, unit);
  SCENES[gameId]?.(context, atlas, time, cssWidth / unit, state);
  context.restore();
}

// ---------- Karty ----------

export function renderGameCards({ root, platform, onGuide }) {
  root.replaceChildren();
  const cards = platform.GAME_REGISTRY.map((game, index) => {
    const info = MENU_GAMES[game.id] || { station: "", description: "", biome: [COLORS.nieboGora, COLORS.nieboDol] };
    const card = document.createElement("article");
    card.className = "game-card";
    card.dataset.game = game.id;
    card.setAttribute("aria-labelledby", `game-${game.id}-title`);
    card.style.setProperty("--biom-gora", info.biome[0]);
    card.style.setProperty("--biom-dol", info.biome[1]);
    card.innerHTML = `
      <div class="game-card-art">
        <canvas aria-hidden="true"></canvas>
        <span class="game-card-station">${index + 1}. ${info.station}</span>
        ${game.rebuilt ? '<span class="game-card-new">Nowe!</span>' : ""}
      </div>
      <div class="game-card-body">
        <h3 id="game-${game.id}-title">${game.name}</h3>
        <p class="game-card-desc">${info.description}</p>
        <p class="game-card-record is-loading" data-record>…</p>
        <div class="game-card-actions">
          <a class="menu-button is-primary" href="${game.path}" data-play="${game.id}">${ICONS.play}<span>Graj</span></a>
          <button type="button" class="menu-button" data-guide="${game.id}" aria-label="Jak grać w ${game.name}?">Jak grać?</button>
          ${game.preview ? `<a class="menu-button is-preview" href="${game.preview.path}" data-preview="${game.id}">${ICONS.play}<span>Wypróbuj nową wersję: ${game.preview.name}</span></a>` : ""}
        </div>
      </div>`;
    card.querySelector("[data-guide]").addEventListener("click", (event) => onGuide(game.id, event.currentTarget));
    root.appendChild(card);
    return { game, card, canvas: card.querySelector("canvas"), visible: true };
  });

  const line = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  line.setAttribute("class", "menu-path-line");
  line.setAttribute("aria-hidden", "true");
  line.innerHTML = "<path></path>";
  root.prepend(line);

  // Kręta ścieżka: krzywa przez środki kart, na przemian bliżej lewej i prawej krawędzi.
  function layoutPath() {
    const box = root.getBoundingClientRect();
    if (!box.width) return;
    line.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    const points = cards.map(({ card }, index) => {
      const rect = card.getBoundingClientRect();
      return [index % 2 ? box.width * 0.72 : box.width * 0.28, rect.top - box.top + rect.height / 2];
    });
    let d = `M ${box.width / 2} 0`;
    let previous = [box.width / 2, 0];
    for (const point of points) {
      const middle = (previous[1] + point[1]) / 2;
      d += ` C ${previous[0]} ${middle}, ${point[0]} ${middle}, ${point[0]} ${point[1]}`;
      previous = point;
    }
    d += ` C ${previous[0]} ${previous[1] + 40}, ${box.width / 2} ${box.height - 20}, ${box.width / 2} ${box.height}`;
    line.querySelector("path").setAttribute("d", d);
  }

  function updateRecords(records, ready) {
    for (const { game, card } of cards) {
      const node = card.querySelector("[data-record]");
      node.classList.toggle("is-loading", !ready);
      if (!ready) continue;
      const text = recordText(game.id, records);
      node.innerHTML = text
        ? `${ICONS.star}<span>${text}</span>`
        : "<span>Jeszcze bez rekordu — zagraj pierwszy raz!</span>";
    }
  }

  return { cards, layoutPath, updateRecords };
}

// Stan animacji ilustracji (osobna sowa na każdą kartę, żeby mrugały niezależnie).
export function createArtState(random = Math.random) {
  return { owl: createOwlAnimator({ random }), cosmetic: "none" };
}
