// Łącz i Hoduj — strona gry (prototyp, kroki 8.0–8.1): wczytanie i zapis stanu (pole `preview` dokumentu
// `sowiegry_gry/szklarnia` — dawna Szklarnia zostaje bez zmian), pętla, przeciąganie roślin z uniesieniem nad palec,
// zaznaczanie stuknięciem (bez przeciągania), Sowia doniczka, kompostownik, hybrydy, nowe łańcuchy w doniczce,
// zamówienia sąsiadek (oddanie stuknięciem karty albo przeciągnięciem rośliny na kartę), okno odnawiania pomieszczeń
// szklarni (stuknięcie portfela), przeszkody Pracu i Amic (stuknięcie przeszkody), kózki-wzmacniacze (stuknięcie albo
// przeciągnięcie), Basen Humbaka (runda bonusowa na osobnej planszy), komunikaty i haki testowe.
import { connectAudioSettings, createAudio } from "../shared/engine/audio.js";
import { EVENTS, progress } from "../shared/meta/progress.js";
import { createToasts, openModal } from "../shared/ui/index.js";
import { COLORS } from "../shared/world/tokens.js";
import { canGrow, canMerge, hybridOf, isGoat, itemName } from "./board.js";
import {
  BOARD,
  CHAINS,
  COMPOST_LEAVES,
  GAME_ID,
  GAME_SOUNDS,
  GOATS,
  GREENHOUSE_MUSIC,
  OBSTACLES,
  POOL,
  POOL_MUSIC,
  POT,
  PREVIEW_FIELD,
  ROOMS,
} from "./config.js";
import { createGame, defaultState, loadState, neighborOf, renovation } from "./game.js";
import { createPool } from "./pool.js";
import { createBoardRenderer, drawOrderCard, LIFT } from "./render.js";

// Zapis: co 20 s gry, po połączeniu po 2 s, przy zejściu do tła od razu.
const SAVE_EVERY = 20;
const IMPORTANT_DELAY = 2000;
// Przeciąganie zaczyna się po przesunięciu palca o tyle pikseli (krótsze — stuknięcie).
const DRAG_START = 8;

const cloud = window.SowieCloud;
const AUDIO_BASE = new URL("../assets/audio/", import.meta.url).href;
const root = document.querySelector("[data-lacz]");
const canvas = root.querySelector("[data-canvas]");
const leavesNode = root.querySelector("[data-leaves]");
const hintNode = root.querySelector("[data-hint]");
const potButton = root.querySelector("[data-pot]");
const chargesNode = root.querySelector("[data-charges]");
const compostButton = root.querySelector("[data-compost]");
const starsNode = root.querySelector("[data-stars]");
const roomsButton = root.querySelector("[data-rooms]");
const poolButton = root.querySelector("[data-pool]");
const orderButtons = [...root.querySelectorAll("[data-order]")];
// Ostatnio narysowana karta zamówienia (zamówienie i rozmiar) — rysujemy tylko po zmianie.
const drawnOrders = orderButtons.map(() => "");

const renderer = createBoardRenderer({ canvas, cols: BOARD.cols, rows: BOARD.rows });
const toasts = createToasts({ root, isInGame: () => true });
window.SowieNotifications ||= { notify: (message) => toasts.show(message) };

let game = createGame({ state: defaultState() });
let ready = false;
let selected = -1;
let press = null;
let lastFrame = 0;
let saveTimer = 0;
let hudTimer = 0;
// Testy e2e: logika wstrzymana w klatkach (hak `hold`).
let testHold = false;
// Silnik dźwięku (po wczytaniu audio.json) — efekty i motyw szklarni (uwaga właściciela L1).
let audio = null;
// Otwarte okno pomieszczeń (odświeżane po każdym etapie odnowy) albo null.
let roomsModal = null;
// Runda w Basenie Humbaka (createPool) albo null — wtedy przeciąganie i doniczka działają na planszy basenu.
let pool = null;

// Plansza, na której się teraz gra (szklarnia albo basen).
const active = () => (pool ? pool.board : game.board);

function play(name, options) {
  try {
    return audio?.play(name, options) || null;
  } catch {
    return null;
  }
}

// ---------- Zapis ----------

function save({ immediate = false, flush = false } = {}) {
  if (!ready || !cloud?.updateGame) return;
  game.state.savedAt = Date.now();
  cloud.updateGame(
    GAME_ID,
    { [PREVIEW_FIELD]: JSON.stringify(game.state) },
    immediate ? { delayMs: IMPORTANT_DELAY } : undefined,
  );
  if (flush) cloud.flush?.();
}

// ---------- Interfejs ----------

function hint(text) {
  if (hintNode.textContent !== text) hintNode.textContent = text;
}

// Zamówienie słowami: „2 × Kiełek” albo „Monpilea Przytulna”.
const orderText = (order) => `${order.count > 1 ? `${order.count} × ` : ""}${itemName(order)}`;

/** Karty zamówień: rysunek (po zmianie zamówienia albo rozmiaru), liczba sztuk, gotowość i opis dla czytnika. */
function updateOrders() {
  orderButtons.forEach((button, slot) => {
    const order = game.state.orders[slot];
    const neighbor = neighborOf(order?.neighbor) || { name: "Sąsiadka", color: COLORS.monstera };
    const canvasNode = button.querySelector("canvas");
    const key = `${JSON.stringify(order)}|${button.clientWidth}x${button.clientHeight}`;
    if (drawnOrders[slot] !== key) {
      drawnOrders[slot] = key;
      button.style.setProperty("--sasiadka", neighbor.color);
      drawOrderCard(canvasNode, order, neighbor.color);
      button.querySelector("[data-order-count]").textContent = order?.count > 1 ? `×${order.count}` : "";
    }
    const ready = Boolean(order && game.orderCells(slot));
    button.classList.toggle("is-ready", ready);
    const chain = CHAINS[order?.chain];
    const detail = chain?.hybrid ? "hybryda" : `${chain?.name || ""}, poziom ${order?.level}`;
    button.setAttribute(
      "aria-label",
      order
        ? `${neighbor.name} prosi: ${orderText(order)} (${detail}) — ${ready ? "stuknij, żeby oddać" : "jeszcze brak na półkach"}`
        : neighbor.name,
    );
  });
}

function updateHud() {
  const { state } = game;
  poolButton.hidden = !(ready && state.poolReady && !pool);
  if (pool) {
    const { time, score, combo } = pool.state;
    hint(
      `🐋 Basen Humbaka: ${Math.ceil(time)} s · ${score} pkt${combo > 1 ? ` · ×${combo.toLocaleString("pl-PL")}` : ""}`,
    );
  }
  leavesNode.textContent = state.leaves.toLocaleString("pl-PL");
  starsNode.textContent = state.stars.toLocaleString("pl-PL");
  const max = game.potMax();
  chargesNode.textContent = pool ? "∞" : `${Math.floor(state.pot.charges)}/${max}`;
  potButton.setAttribute(
    "aria-label",
    `Sowia doniczka — nasionko na wolne pole, ładunki ${Math.floor(state.pot.charges)} z ${max}`,
  );
  // Portfel: opis i kropka, gdy starczy gwiazdek na kolejny etap odnowy.
  const { room } = renovation(state.renovation);
  roomsButton.classList.toggle("is-ready", Boolean(room && state.stars >= room.cost));
  roomsButton.setAttribute(
    "aria-label",
    `Pomieszczenia szklarni — ${state.stars} gwiazdek odnowy, ${state.leaves.toLocaleString("pl-PL")} liści`,
  );
  updateOrders();
}

function handleEvents() {
  if (pool) handlePoolEvents();
  for (const event of game.takeEvents()) {
    switch (event.type) {
      case "spawn":
        renderer.pop(event.index);
        play("lisc", { pitch: 1.25, volume: 0.6 });
        break;
      case "move":
      case "swap":
        play("ladowanie", { volume: 0.55 });
        break;
      case "merge": {
        renderer.pop(event.to);
        const center = renderer.cellCenter(event.to);
        if (event.leaves) renderer.popup(`+${event.leaves}`, center.x, center.y - 10, COLORS.bialy, 18);
        hint(`${itemName(event.item)}!`);
        // Połączenie: wyższy ton na wyższym poziomie; szczyt łańcucha — fanfara.
        play("polaczenie", { pitch: 0.9 + event.item.level * 0.1 });
        if (event.top) play("rekord", { volume: 0.8 });
        if (event.top) {
          toasts.show(
            `${itemName(event.item)}! Szczyt łańcucha — skrzyżuj ją z innym szczytem albo skompostuj za ${COMPOST_LEAVES[event.item.level]} liści`,
            { kind: "reward", key: "szczyt", priority: 2 },
          );
        }
        save({ immediate: true });
        break;
      }
      case "hybrid": {
        renderer.pop(event.to);
        const center = renderer.cellCenter(event.to);
        renderer.popup(`+${event.leaves}`, center.x, center.y - 10, COLORS.zloto, 20);
        hint(`Hybryda: ${itemName(event.item)}!`);
        play("polaczenie", { pitch: 1.5 });
        play("rekord", { volume: 0.9 });
        toasts.show(`Nowa hybryda: ${itemName(event.item)}! +${event.leaves} liści`, {
          kind: "reward",
          key: "hybryda",
          priority: 2,
        });
        save({ immediate: true });
        break;
      }
      case "order": {
        const neighbor = neighborOf(event.order.neighbor);
        if (event.cells.includes(selected)) selected = -1;
        hint(`${neighbor?.name || "Sąsiadka"} dziękuje! +${event.leaves} liści, +${event.stars} ⭐`);
        toasts.show(
          `${neighbor?.name || "Sąsiadka"} dziękuje za ${orderText(event.order)}! +${event.leaves} liści · +${event.stars} ⭐`,
          {
            kind: "reward",
            key: "zamowienie",
          },
        );
        play("rekord", { pitch: 1.2, volume: 0.7 });
        orderButtons[event.slot]?.animate?.(
          [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
          { duration: 350 },
        );
        save({ immediate: true });
        break;
      }
      case "orderMissing": {
        const neighbor = neighborOf(event.order.neighbor);
        hint(`${neighbor?.name || "Sąsiadka"} prosi: ${orderText(event.order)}`);
        play("klik", { pitch: 0.6, volume: 0.5 });
        break;
      }
      case "renovate": {
        const room = ROOMS.find((entry) => entry.id === event.room);
        hint(`${room.icon} ${room.name}: ${event.name} ✓`);
        play("ladowanie", { pitch: 1.2, volume: 0.7 });
        if (event.roomDone) {
          play("rekord", { volume: 0.8 });
          toasts.show(`Odnowione pomieszczenie: ${room.icon} ${room.name}! ${room.perk}`, {
            kind: "reward",
            key: "pomieszczenie",
            priority: 2,
          });
        }
        save({ immediate: true });
        break;
      }
      case "renovateMissing":
        play("klik", { pitch: 0.6, volume: 0.5 });
        toasts.show(`Potrzeba jeszcze ${event.need} ⭐ — oddawaj zamówienia sąsiadek`, {
          kind: "info",
          key: "gwiazdki",
        });
        break;
      case "phone":
        renderer.pop(event.index);
        play("dzwonek", { volume: 0.7 });
        hint("Pracu Pracu zostawił telefon na półce!");
        toasts.show("Telefon Pracu co 10 ruchów dzwoni i przykleja karteczkę — połącz rośliny obok niego 2 razy", {
          kind: "warn",
          key: "pracu-telefon",
          priority: 2,
        });
        save({ immediate: true });
        break;
      case "note":
        if (event.index === selected) selected = -1;
        renderer.pop(event.index);
        play("dzwonek", { volume: 0.6 });
        play("trafienie-pracu", { volume: 0.5 });
        hint("Dryń! Karteczka Pracu na półce — połącz rośliny obok albo stuknij ją 3 razy");
        break;
      case "noteTap":
        play("klik", { pitch: 1.3, volume: 0.6 });
        hint(`Odklejasz karteczkę… jeszcze ${event.left} ${event.left === 1 ? "stuknięcie" : "stuknięcia"}`);
        break;
      case "noteGone":
        renderer.pop(event.index);
        play("klik", { pitch: 1.6, volume: 0.7 });
        hint("Karteczka odklejona!");
        save({ immediate: true });
        break;
      case "blockHit":
        renderer.pop(event.index);
        play(event.block === "phone" ? "trafienie-pracu" : "trafienie-amic", { volume: 0.7 });
        hint(
          event.block === "phone"
            ? `Telefon Pracu: jeszcze ${event.left} połączenie obok`
            : `Skrzynia Amic: jeszcze ${event.left} połączenie obok`,
        );
        break;
      case "phoneGone":
        play("rekord", { volume: 0.7 });
        hint("Telefon Pracu wyłączony — cisza w szklarni!");
        toasts.show("Telefon Pracu wyłączony!", { kind: "reward", key: "pracu-koniec" });
        save({ immediate: true });
        break;
      case "crate":
        renderer.pop(event.index);
        play("trafienie-amic", { volume: 0.7 });
        hint("Amic postawił skrzynię na półce!");
        toasts.show("Skrzynia Amic — połącz rośliny obok niej 2 razy, a się otworzy (w środku nagroda)", {
          kind: "info",
          key: "amic-skrzynia",
        });
        save({ immediate: true });
        break;
      case "crateOpen": {
        const center = renderer.cellCenter(event.index);
        renderer.popup(`+${event.leaves}`, center.x, center.y - 10, COLORS.zloto, 20);
        renderer.pop(event.index);
        play("zakup", { volume: 0.8 });
        play("koza-meee", { volume: 0.6 });
        hint(`Skrzynia otwarta! W środku ${GOATS[event.goat].name}. +${event.leaves} liści, +${event.stars} ⭐`);
        save({ immediate: true });
        break;
      }
      case "blockInfo":
        play("klik", { pitch: 0.8, volume: 0.5 });
        hint(
          event.block === "phone"
            ? "Telefon Pracu — połącz rośliny obok niego, żeby go wyłączyć"
            : "Skrzynia Amic — połącz rośliny obok niej, żeby ją otworzyć",
        );
        break;
      case "goat": {
        const info = GOATS[event.goat];
        renderer.pop(event.index);
        play("koza-meee", { volume: 0.8 });
        const neighbor = neighborOf(event.from);
        toasts.show(`${neighbor?.name || "Sąsiadka"} przysyła kózkę! ${info.name} ${info.text}`, {
          kind: "reward",
          key: "kozka",
          priority: 2,
        });
        hint(`${info.name} na półce — ${info.use === "tap" ? "stuknij ją" : "przeciągnij ją"}`);
        save({ immediate: true });
        break;
      }
      case "goatUsed": {
        const info = GOATS[event.goat];
        play("powerup-start", { volume: 0.7 });
        play("koza-meee", { volume: 0.5, pitch: 1.2 });
        const done = {
          skoczek: `połączyła pary roślin (${event.count})`,
          zjadaczka: `zjadła karteczki Pracu (${event.count})`,
          dzoker: "pomogła roślinie urosnąć",
          sprezynka: `podniosła rośliny wokół (${event.count})`,
          taran: "rozbiła przeszkodę!",
        }[event.goat];
        hint(`${info.name} ${done}`);
        save({ immediate: true });
        break;
      }
      case "goatIdle":
        play("klik", { pitch: 0.6, volume: 0.5 });
        hint(
          {
            skoczek: "Kózka Skoczek czeka — potrzebne są 2 takie same rośliny",
            zjadaczka: "Kózka Zjadaczka czeka — w jej rzędzie i kolumnie nie ma karteczek",
            sprezynka: "Kózka Sprężynka czeka — obok nie ma roślin, które mogą urosnąć",
          }[event.goat],
        );
        break;
      case "goatHint":
        play("klik", { pitch: 1.2, volume: 0.6 });
        hint(
          event.goat === "taran"
            ? "Kózka Taran: przeciągnij ją na kanister, skrzynię, telefon albo karteczkę"
            : "Kózka Dżoker: przeciągnij ją na roślinę (albo roślinę na nią) — roślina urośnie",
        );
        break;
      case "grow":
        renderer.pop(event.index);
        break;
      case "canister":
        renderer.pop(event.index);
        play("trafienie-amic", { volume: 0.8 });
        hint("Amic postawił kanister na półce!");
        toasts.show(
          "Kanister Amic stoi na stałe — usunie go tylko Kózka Taran (dostaniesz ją w zamówieniach i skrzyniach)",
          {
            kind: "warn",
            key: "amic-kanister",
            priority: 2,
          },
        );
        save({ immediate: true });
        break;
      case "canisterGone":
        renderer.pop(event.index);
        play("rekord", { volume: 0.7 });
        break;
      case "poolReady":
        play("humbak-piesn", { volume: 0.6 });
        toasts.show("Humbak zaprasza do Basenu Humbaka! Stuknij „🐋 Basen Humbaka” nad półkami", {
          kind: "reward",
          key: "basen-zaproszenie",
          priority: 2,
        });
        break;
      case "poolDone":
        if (event.record) play("rekord", { volume: 0.8 });
        for (const { index } of event.goats) renderer.pop(index);
        showPoolResult(event);
        save({ immediate: true });
        break;
      case "unlock":
        toasts.show(`Nowa roślina w Sowiej doniczce: ${event.name}!`, {
          kind: "reward",
          key: "nowa-roslina",
          priority: 2,
        });
        break;
      case "compost": {
        const center = renderer.cellCenter(event.index);
        renderer.popup(`+${event.leaves}`, center.x, center.y - 10, COLORS.monsteraJasna, 18);
        hint(`Kompost: ${itemName(event.item)} → +${event.leaves} liści`);
        play("slizg", { pitch: 0.8, volume: 0.7 });
        save({ immediate: true });
        break;
      }
      case "potEmpty":
        play("klik", { pitch: 0.6, volume: 0.5 });
        toasts.show("Doniczka się ładuje — nasionko co 3 sekundy", { kind: "info", key: "doniczka" });
        break;
      case "boardFull":
        play("klik", { pitch: 0.6, volume: 0.5 });
        toasts.show("Brak miejsca na półkach — połącz albo skompostuj roślinę", { kind: "warn", key: "pelno" });
        break;
      default:
        break;
    }
  }
}

// ---------- Basen Humbaka ----------

function handlePoolEvents() {
  for (const event of pool.takeEvents()) {
    switch (event.type) {
      case "spawn":
        renderer.pop(event.index);
        play("lisc", { pitch: 1.25, volume: 0.6 });
        break;
      case "full":
        play("klik", { pitch: 0.6, volume: 0.5 });
        toasts.show("Basen pełny — połącz rośliny!", { kind: "warn", key: "basen-pelny" });
        break;
      case "merge": {
        renderer.pop(event.to);
        const center = renderer.cellCenter(event.to);
        renderer.popup(`+${event.points}`, center.x, center.y - 10, COLORS.bialy, 18 + Math.round(event.combo * 2));
        play("polaczenie", { pitch: 0.9 + event.item.level * 0.1 });
        break;
      }
      case "splash": {
        const center = renderer.cellCenter(event.index);
        renderer.popup(`Plusk! +${event.points}`, center.x, center.y - 24, COLORS.zloto, 20);
        play("humbak-plusk", { volume: 0.8 });
        break;
      }
      case "end":
        endPool();
        return;
      default:
        break;
    }
  }
}

function startPool() {
  if (!ready || pool || !game.state.poolReady) return;
  pool = createPool({ merges: game.state.stats.merges });
  selected = -1;
  roomsModal?.close();
  root.classList.add("is-pool");
  compostButton.disabled = true;
  play("bonus-start", { volume: 0.8 });
  audio?.playMusic(POOL_MUSIC)?.catch?.(() => {});
  toasts.show(
    `Basen Humbaka! ${POOL.seconds} sekund: łącz rośliny, szybkie połączenia mnożą punkty, a szczyt łańcucha robi plusk`,
    { kind: "info", key: "basen" },
  );
  updateHud();
}

function endPool() {
  const { score } = pool.state;
  pool = null;
  selected = -1;
  root.classList.remove("is-pool");
  compostButton.disabled = false;
  audio?.playMusic(GREENHOUSE_MUSIC)?.catch?.(() => {});
  hint("Witaj z powrotem w szklarni!");
  game.finishPool(score);
  handleEvents();
  updateHud();
}

// Wynik rundy: okno z punktami, rekordem i nagrodą.
function showPoolResult(event) {
  const body = element("div", "lacz-rooms");
  body.append(
    element(
      "p",
      "lacz-rooms-stars",
      event.record
        ? `Wynik: ${event.score} pkt — nowy rekord! 🏆`
        : `Wynik: ${event.score} pkt (rekord: ${event.best} pkt)`,
    ),
    element(
      "p",
      "lacz-room-note",
      `Nagroda: kózki na półkach (${event.goats.length}), +${event.leaves} liści, +${event.stars} ⭐`,
    ),
  );
  openModal({
    title: "Basen Humbaka",
    content: body,
    actions: [{ label: "Wracam do szklarni", primary: true, onClick: (close) => close() }],
  });
}

poolButton.addEventListener("click", startPool);

// ---------- Pomieszczenia szklarni ----------

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Treść okna pomieszczeń: gwiazdki i lista pomieszczeń (odnowione, w toku z przyciskiem etapu, zamknięte). */
function roomsContent() {
  const { state } = game;
  const status = renovation(state.renovation);
  const list = element("div", "lacz-rooms");
  list.append(
    element(
      "p",
      "lacz-rooms-stars",
      status.room
        ? `Masz ${state.stars} ⭐ (za zamówienia sąsiadek). Odnawiaj pomieszczenia po kolei — każde daje ułatwienie.`
        : `Masz ${state.stars} ⭐. Cała szklarnia odnowiona — brawo!`,
    ),
  );
  ROOMS.forEach((room, index) => {
    const done = index < status.index;
    const current = index === status.index;
    const card = element("article", "lacz-room");
    card.dataset.room = room.id;
    card.classList.toggle("is-done", done);
    card.classList.toggle("is-locked", index > status.index);
    const steps = done ? room.steps.length : current ? status.step : 0;
    card.append(
      element("span", "lacz-room-icon", room.icon),
      element("strong", "lacz-room-name", room.name),
      element("span", "lacz-room-progress", `${steps}/${room.steps.length}`),
      element("p", "lacz-room-perk", done ? `✓ ${room.perk}` : `Po odnowieniu: ${room.perk}`),
    );
    if (current) {
      const button = element(
        "button",
        "sowie-ui-button is-primary",
        `Odnów: ${room.steps[status.step]} — ⭐ ${room.cost}`,
      );
      button.type = "button";
      button.dataset.renovate = "";
      button.disabled = state.stars < room.cost;
      button.addEventListener("click", () => {
        game.renovate();
        handleEvents();
        updateHud();
        refreshRooms();
      });
      card.append(button);
      if (state.stars < room.cost) {
        card.append(element("p", "lacz-room-note", `Potrzeba ${room.cost} ⭐ (masz ${state.stars}).`));
      }
    } else if (index > status.index) {
      card.append(element("p", "lacz-room-note", `🔒 Najpierw: ${ROOMS[index - 1].name}`));
    }
    list.append(card);
  });
  return list;
}

function refreshRooms() {
  if (!roomsModal) return;
  roomsModal.body.replaceChildren(roomsContent());
  roomsModal.body.querySelector("[data-renovate]:not([disabled])")?.focus({ preventScroll: true });
}

function openRooms() {
  if (!ready || roomsModal || pool) return;
  roomsModal = openModal({
    title: "Pomieszczenia szklarni",
    content: roomsContent(),
    onClose: () => {
      roomsModal = null;
    },
  });
}

roomsButton.addEventListener("click", openRooms);

// ---------- Ruchy: przeciąganie i stuknięcia ----------

function localPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

// Czy punkt ekranu jest nad kompostownikiem (cel upuszczenia).
function overCompost(event) {
  const rect = compostButton.getBoundingClientRect();
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

// Karta zamówienia pod punktem ekranu (cel upuszczenia) albo -1.
function orderAt(event) {
  return orderButtons.findIndex((button) => {
    const rect = button.getBoundingClientRect();
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  });
}

function showOrderTarget(slot) {
  orderButtons.forEach((button, index) => button.classList.toggle("is-target", index === slot));
}

// Oddanie zamówienia (najpierw roślina `prefer` — przeciągnięta albo zaznaczona, jeśli pasuje).
function deliverOrder(slot, prefer = -1) {
  game.deliver(slot, prefer);
  handleEvents();
  updateHud();
}

// Roślina upuszczona na kartę zamówienia: oddanie, gdy pasuje; inaczej podpowiedź, czego chce sąsiadka.
function dropOnOrder(index, slot) {
  const item = game.board.cells[index];
  const order = game.state.orders[slot];
  if (!item || !order) return;
  if (item.chain === order.chain && item.level === order.level) {
    deliverOrder(slot, index);
    return;
  }
  const neighbor = neighborOf(order.neighbor);
  hint(`${neighbor?.name || "Sąsiadka"} prosi: ${orderText(order)}, nie ${itemName(item)}`);
  play("klik", { pitch: 0.6, volume: 0.5 });
}

// Czy z pola da się wziąć roślinę (jest i nie leży pod karteczką).
const movable = (index) => Boolean(active().cells[index]) && !active().blocks[index];

// Pole, na które spadnie uniesiony przedmiot (pod przedmiotem, nie pod palcem).
function dropTarget(point) {
  return renderer.cellAt(point.x, point.y - renderer.layout().size * LIFT);
}

function moveTo(from, to) {
  const result = pool ? pool.move(from, to) : game.move(from, to);
  handleEvents();
  updateHud();
  return result;
}

function compostAt(index) {
  if (game.compost(index)) {
    handleEvents();
    updateHud();
  }
}

canvas.addEventListener("pointerdown", (event) => {
  if (!ready) return;
  const point = localPoint(event);
  const index = renderer.cellAt(point.x, point.y);
  press = { index, start: point, point, dragging: false, moved: false, compost: false, order: -1, id: event.pointerId };
  if (index >= 0 && movable(index)) canvas.setPointerCapture?.(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!press || event.pointerId !== press.id) return;
  press.point = localPoint(event);
  // Przesunięcie o co najmniej DRAG_START: z rośliną — przeciąganie, bez niej — już nie stuknięcie.
  if (!press.dragging && !press.moved) {
    const distance = Math.hypot(press.point.x - press.start.x, press.point.y - press.start.y);
    if (distance >= DRAG_START) {
      press.moved = true;
      if (movable(press.index)) {
        press.dragging = true;
        selected = -1;
        play("klik", { pitch: 1.2, volume: 0.6 });
      }
    }
  }
  if (press.dragging) {
    // W basenie nie ma kompostu ani zamówień.
    press.compost = !pool && overCompost(event);
    compostButton.classList.toggle("is-target", press.compost);
    press.order = press.compost || pool ? -1 : orderAt(event);
    showOrderTarget(press.order);
  }
});

function finishPress(event, cancelled = false) {
  if (!press || event.pointerId !== press.id) return;
  const current = press;
  press = null;
  compostButton.classList.remove("is-target");
  showOrderTarget(-1);
  if (cancelled) return;
  if (current.dragging) {
    const slot = pool ? -1 : orderAt(event);
    if (!pool && overCompost(event)) compostAt(current.index);
    else if (slot >= 0) dropOnOrder(current.index, slot);
    else {
      const target = dropTarget(localPoint(event));
      if (target >= 0) moveTo(current.index, target);
    }
    return;
  }
  // Stuknięcie: zaznaczenie rośliny, potem stuknięcie w pole docelowe (to samo — odznaczenie); przeszkoda —
  // odklejanie karteczki albo podpowiedź. Palec przesunięty bez rośliny — nic.
  const index = current.index;
  if (index < 0 || current.moved) return;
  if (active().blocks[index]) {
    // Zaznaczona Kózka Taran stuknięciem przeszkody ją rozbija.
    if (active().cells[selected]?.goat === "taran") moveTo(selected, index);
    else {
      game.tapBlock(index);
      handleEvents();
      updateHud();
    }
    selected = -1;
    return;
  }
  // Kózka bez zaznaczenia: stukana — moc od razu; przeciągana (Dżoker, Taran) — zaznaczenie i podpowiedź.
  if (selected < 0 && isGoat(active().cells[index])) {
    if (GOATS[active().cells[index].goat].use !== "tap") selected = index;
    game.useGoat(index);
    handleEvents();
    updateHud();
    return;
  }
  if (selected < 0) {
    if (active().cells[index]) {
      selected = index;
      play("klik", { pitch: 1.2, volume: 0.6 });
      if (!pool) hint(`${itemName(active().cells[index])} — stuknij pole albo kompost`);
    }
    return;
  }
  if (index !== selected) moveTo(selected, index);
  selected = -1;
}

canvas.addEventListener("pointerup", (event) => finishPress(event));
canvas.addEventListener("pointercancel", (event) => finishPress(event, true));

potButton.addEventListener("click", () => {
  if (!ready) return;
  if (pool) pool.spawn();
  else game.tapPot();
  handleEvents();
  updateHud();
});

// Karta zamówienia: stuknięcie oddaje rośliny (gotowe zamówienie) albo podpowiada, czego chce sąsiadka.
orderButtons.forEach((button, slot) => {
  button.addEventListener("click", () => {
    if (!ready || pool) return;
    deliverOrder(slot, selected);
  });
});

compostButton.addEventListener("click", () => {
  if (!ready || pool) return;
  if (selected >= 0) {
    compostAt(selected);
    selected = -1;
  } else {
    toasts.show("Przeciągnij roślinę na kompost albo zaznacz ją i stuknij tutaj", { kind: "info", key: "kompost" });
  }
});

// ---------- Pętla ----------

function dragView() {
  if (!press?.dragging) return null;
  // Nad kompostownikiem albo kartą zamówienia — bez podświetlenia pola.
  const away = press.compost || press.order >= 0;
  const spot = away ? -1 : dropTarget(press.point);
  const board = active();
  const source = board.cells[press.index];
  // Na przeszkodę nic nie spada (bez podświetlenia) — poza Kózką Taran, która ją rozbija.
  const ramming = source?.goat === "taran" && spot >= 0 && Boolean(board.blocks[spot]);
  const target = spot >= 0 && board.blocks[spot] && !ramming ? -1 : spot;
  const other = target >= 0 && target !== press.index ? board.cells[target] : null;
  // Kózka Dżoker pasuje do każdej rośliny, która może urosnąć.
  const joker = (source?.goat === "dzoker" && canGrow(other)) || (other?.goat === "dzoker" && canGrow(source));
  const kind = away
    ? "compost"
    : ramming || joker || canMerge(source, other) || hybridOf(source, other)
      ? "merge"
      : "move";
  return { from: press.index, x: press.point.x, y: press.point.y, target: target === press.index ? -1 : target, kind };
}

function frame(time) {
  const dt = lastFrame ? Math.min(0.25, (time - lastFrame) / 1000) : 0;
  lastFrame = time;
  if (ready && !testHold) {
    if (pool) {
      pool.update(dt);
      handleEvents();
    } else game.update(dt);
    saveTimer += dt;
    if (saveTimer >= SAVE_EVERY) {
      saveTimer = 0;
      save();
    }
  }
  renderer.draw({
    cells: active().cells,
    blocks: active().blocks,
    theme: pool ? "pool" : "greenhouse",
    ringing:
      !pool &&
      game.board.blocks.some((block) => block?.type === "phone") &&
      game.state.phoneMoves >= OBSTACLES.ringEvery - 2,
    selected,
    drag: dragView(),
    time: time / 1000,
    dt,
  });
  hudTimer += dt;
  if (hudTimer >= 0.2 || !dt) {
    hudTimer = 0;
    updateHud();
  }
  requestAnimationFrame(frame);
}

// Rozmiar planszy idzie za gniazdem (obrót telefonu, okno, wczytana czcionka zmienia wysokość nagłówka); opis
// płótna mówi, jak plansza jest ułożona (obrócona — 9 kolumn, 7 rzędów).
function fitBoard() {
  renderer.resize();
  const { transposed } = renderer.layout();
  const [across, down] = transposed ? [BOARD.rows, BOARD.cols] : [BOARD.cols, BOARD.rows];
  canvas.setAttribute("aria-label", `Półki szklarni: ${across} kolumn, ${down} rzędów`);
}

window.addEventListener("resize", fitBoard);
if (window.ResizeObserver) new ResizeObserver(fitBoard).observe(canvas.parentElement);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) save({ flush: true });
  lastFrame = 0;
});
window.addEventListener("pagehide", () => save({ flush: true }));

// ---------- Start ----------

async function start() {
  await cloud?.ready;
  await cloud?.loadGame?.(GAME_ID);
  const doc = cloud?.game?.(GAME_ID) || {};
  let raw = null;
  if (typeof doc[PREVIEW_FIELD] === "string") {
    try {
      raw = JSON.parse(doc[PREVIEW_FIELD]);
    } catch {
      raw = null;
    }
  }
  game = createGame({ state: loadState(raw, Date.now()) });
  ready = true;
  if (!raw) save({ immediate: true });
  progress.emit(EVENTS.VISIT, { gameId: GAME_ID });
  updateHud();
}

fitBoard();
requestAnimationFrame(frame);

// Dźwięk: manifest, ustawienia głośności z profilu, odblokowanie dotknięciem i motyw szklarni (gra od razu po
// odblokowaniu — silnik wznawia kontekst w geście zakończonym).
fetch(new URL("audio.json", AUDIO_BASE))
  .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`audio.json: ${response.status}`))))
  .then((manifest) => {
    audio = createAudio({ manifest, baseUrl: AUDIO_BASE, preloadOnUnlock: GAME_SOUNDS });
    connectAudioSettings(audio, cloud);
    audio.bindUnlock(window, { ignore: (event) => Boolean(event.target?.closest?.("a[href]")) });
    audio.playMusic(GREENHOUSE_MUSIC)?.catch?.(() => {});
  })
  .catch((error) => console.warn("LaczIHoduj: dźwięk", error));
start().catch((error) => console.warn("LaczIHoduj: start", error));

// Dostęp dla testów e2e.
window.LaczIHoduj = Object.freeze({
  ready: () => ready,
  state: () => JSON.parse(JSON.stringify(game.state)),
  cells: () => JSON.parse(JSON.stringify(game.board.cells)),
  cellCenter: (index) => renderer.cellCenter(index),
  cellSize: () => renderer.layout().size,
  transposed: () => renderer.layout().transposed,
  lift: () => renderer.layout().size * LIFT,
  selected: () => selected,
  place: (index, level, chain = POT.chain) => {
    game.board.cells[index] = level ? { chain, level } : null;
    game.state.cells = game.board.cells.map((item) => (item ? { ...item } : null));
  },
  move: (from, to) => moveTo(from, to).type,
  orders: () => JSON.parse(JSON.stringify(game.state.orders)),
  blocks: () => JSON.parse(JSON.stringify(game.board.blocks)),
  placeGoat: (index, goat) => {
    game.board.cells[index] = goat ? { goat } : null;
    game.state.cells = game.board.cells.map((item) => (item ? { ...item } : null));
  },
  setBlock: (index, type, hits = 0) => {
    game.board.blocks[index] = type ? { type, hits } : null;
    game.state.blocks = game.board.blocks.map((block) => (block ? { ...block } : null));
  },
  pool: () => (pool ? JSON.parse(JSON.stringify({ ...pool.state, cells: pool.board.cells })) : null),
  setPoolReady: (on = true) => {
    game.state.poolReady = Boolean(on);
    updateHud();
  },
  startPool: () => startPool(),
  poolPlace: (index, level, chain = POT.chain) => {
    if (pool) pool.board.cells[index] = level ? { chain, level } : null;
  },
  endPool: () => {
    if (!pool) return;
    pool.update(POOL.seconds + 1);
    handleEvents();
  },
  setStars: (stars) => {
    game.state.stars = stars;
    updateHud();
  },
  setRenovation: (done) => {
    game.state.renovation = done;
    updateHud();
  },
  setOrder: (slot, chain, level, count = 1) => {
    game.state.orders[slot] = { neighbor: game.state.orders[slot].neighbor, chain, level, count };
    updateHud();
  },
  tapPot: () => {
    const index = game.tapPot();
    handleEvents();
    updateHud();
    return index;
  },
  hold: (on = true) => {
    testHold = Boolean(on);
  },
  music: () => audio?.currentMusic?.() ?? null,
  save: () => save({ flush: true }),
});
