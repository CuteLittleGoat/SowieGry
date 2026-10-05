// Łącz i Hoduj — Basen Humbaka (krok 8.2, E8c3; czysta logika, bez DOM): 45-sekundowa runda bonusowa na osobnej
// planszy z wodą. Same rośliny (bez przeszkód i kózek), darmowa Sowia doniczka, punkty za połączenia z mnożnikiem
// za szybkie połączenia po sobie, roślina na szczycie łańcucha znika z pluskiem (premia i wolne pole).
import { BOARD, POOL } from "./config.js";
import { createBoard, emptyCells, maxLevel, moveItem, spawnItem } from "./board.js";
import { pickChain } from "./game.js";

/** Punkty za połączenie w roślinę poziomu `level` przy mnożniku `combo`. */
export const mergePoints = (level, combo = 1) => Math.round(level * level * POOL.pointsPerLevel * combo);

/**
 * createPool({ merges, random }) → { board, state, update(dt), spawn(), move(from, to), free(), takeEvents() }. Stan:
 * { time (s do końca), score, combo (mnożnik), comboTime, merges, splashes, over }. Zdarzenia: spawn { index, item },
 * full, merge { from, to, item, points, combo }, splash { index, item, points }, end { score }.
 */
export function createPool({ merges = 0, random = Math.random } = {}) {
  const board = createBoard(BOARD);
  // Na start kilka nasionek i kiełków z odblokowanych łańcuchów (od razu jest co łączyć).
  for (let count = 0; count < POOL.startItems; count += 1) {
    spawnItem(board, { chain: pickChain(merges, random), level: 1 + Math.floor(random() * 2) }, random);
  }
  const state = { time: POOL.seconds, score: 0, combo: 1, comboTime: 0, merges: 0, splashes: 0, over: false };
  const events = [];
  const emit = (type, data = {}) => events.push({ type, ...data });

  function update(dt) {
    if (state.over) return;
    state.time = Math.max(0, state.time - dt);
    state.comboTime = Math.max(0, state.comboTime - dt);
    if (!state.comboTime) state.combo = 1;
    if (state.time <= 0) {
      state.over = true;
      emit("end", { score: state.score });
    }
  }

  // Darmowa doniczka: nasionko na losowym wolnym polu (bez ładunków).
  function spawn() {
    if (state.over) return -1;
    const item = { chain: pickChain(merges, random), level: 1 };
    const index = spawnItem(board, item, random);
    if (index < 0) emit("full");
    else emit("spawn", { index, item });
    return index;
  }

  function move(from, to) {
    if (state.over) return { type: "none" };
    // Hybrydy w basenie nie powstają: roślina na szczycie łańcucha od razu znika z pluskiem.
    const result = moveItem(board, from, to);
    if (result.type !== "merge") return result;
    // Szybkie połączenia po sobie podbijają mnożnik (najwyżej `maxCombo`).
    if (state.comboTime > 0) state.combo = Math.min(POOL.maxCombo, state.combo + POOL.comboStep);
    state.comboTime = POOL.comboWindow;
    const points = mergePoints(result.item.level, state.combo);
    state.score += points;
    state.merges += 1;
    emit("merge", { from, to, item: result.item, points, combo: state.combo });
    // Szczyt łańcucha: plusk — roślina znika z premią.
    if (result.item.level >= maxLevel(result.item.chain)) {
      board.cells[to] = null;
      state.score += POOL.splashPoints;
      state.splashes += 1;
      emit("splash", { index: to, item: result.item, points: POOL.splashPoints });
    }
    return result;
  }

  return {
    board,
    state,
    update,
    spawn,
    move,
    free: () => emptyCells(board).length,
    takeEvents: () => events.splice(0, events.length),
  };
}
