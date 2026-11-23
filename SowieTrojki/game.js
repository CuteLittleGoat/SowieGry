// Sowie Trójki — przebieg poziomu (Analiza 5, rozdz. 6.4–6.10 i 8.4): ruchy, cele, punkty, gwiazdki, prezent od Sówki
// (+3 ruchy raz na podejście przy ≥ 75% celu), Tryb Przytulny (Sówka dokłada 5 ruchów — nie da się przegrać), Radość
// Sówki i Sowia pomoc (3 Pióra bez zabierania ruchu), Humbaczy Finał (pozostałe ruchy → Pióra) i podpowiedź.
// Czysta logika (bez strony): wynik każdej akcji to kroki planszy do animacji i zdarzenia dla Sówki.
import { createRng } from "../shared/engine/rng.js";
import {
  dropPowers,
  findGroups,
  listMoves,
  neighbors,
  rowOf,
  colOf,
  index,
  createBoard,
  swappable,
  tapSpecial,
  targetsOf,
  trySwap,
} from "./board.js";
import { GIFT, JOY, POINTS, SPECIAL_INFO } from "./config.js";

const SPECIAL_VALUE = Object.freeze({ pioro: 6, piskle: 5, babel: 9, teczowy: 12 });

/** Gwiazdki za wynik: wygrana — 1, wynik ≥ progu 2 — 2, ≥ progu 3 — 3 (`stars` = [próg 1, próg 2, próg 3]). */
export function starsFor(score, stars) {
  return 1 + (score >= stars[1] ? 1 : 0) + (score >= stars[2] ? 1 : 0);
}

/** Wskazówki celów dla planszy (Pisklę, Sowia pomoc, podpowiedź): rodzaje do zebrania, przeszkody, jajka. */
export function goalHints(goals) {
  const open = goals.filter((goal) => goal.done < goal.count);
  return {
    kinds: new Set(open.filter((goal) => goal.type === "collect").map((goal) => goal.kind)),
    blocks: new Set(
      open.flatMap((goal) => ({ notes: ["note"], crates: ["crate"], phones: ["phone"] })[goal.type] || []),
    ),
    eggs: open.some((goal) => goal.type === "eggs"),
  };
}

/**
 * Ocena ruchów bez rozstrzygania kaskad (szybka — podpowiedź i symulator): kafelki w ułożeniu, kafelki rodzaju
 * z celu, przeszkody obok, powstająca moc; zamiana z mocą i stuknięcie w moc — według mocy.
 * → `[{ move, value, special }]` od najlepszego.
 */
export function scoreMoves(board, hints) {
  const scored = [];
  for (const move of listMoves(board)) {
    const first = board.cells[move.a].item;
    const second = move.type === "swap" ? board.cells[move.b].item : null;
    if (move.type === "tap" || first?.special || second?.special) {
      const specials = [first?.special, second?.special].filter(Boolean);
      let value = specials.reduce((sum, special) => sum + SPECIAL_VALUE[special] * 2, 0);
      if (specials.length === 2) value += 14;
      if (move.type === "tap") value -= 3;
      scored.push({ move, value, special: specials.length === 2 ? "combo" : specials[0] });
      continue;
    }
    const a = board.cells[move.a];
    const b = board.cells[move.b];
    [a.item, b.item] = [b.item, a.item];
    const groups = findGroups(board).filter((group) => group.cells.includes(move.a) || group.cells.includes(move.b));
    [a.item, b.item] = [b.item, a.item];
    let value = 0;
    let special = null;
    for (const group of groups) {
      value += group.cells.length;
      if (hints.kinds.has(group.kind)) value += group.cells.length * 2;
      if (group.special) {
        value += SPECIAL_VALUE[group.special];
        special = group.special;
      }
      const touched = new Set();
      for (const cell of group.cells)
        for (const near of neighbors(board, cell)) if (board.cells[near].block) touched.add(near);
      for (const near of touched) {
        const block = board.cells[near].block;
        if (block.type === "canister") continue;
        value += hints.blocks.has(block.type) ? 4 : 1;
      }
    }
    // Ruchy niżej na planszy częściej dają kaskady i ściągają jajka — mała premia.
    value += rowOf(board, Math.max(move.a, move.b)) * 0.05;
    scored.push({ move, value, special });
  }
  scored.sort((x, y) => y.value - x.value);
  return scored;
}

/**
 * createLevelRun(poziom, { attempt, cozy, seed }) → przebieg jednego podejścia do poziomu. Akcje: `swap(a, b)`,
 * `tap(a)`, `help()`, `finale()`; każda → `{ valid, steps, events }`. Stan: `state` (ruchy, punkty, cele, radość, faza:
 * "play" → "finale" → "won" albo "lost").
 */
export function createLevelRun(level, { attempt = 1, cozy = false, seed = null } = {}) {
  const rng = createRng(seed ?? `trojki:${level.id}:${attempt}`);
  const board = createBoard(level, { rng });
  const state = {
    levelId: level.id,
    moves: level.moves,
    movesUsed: 0,
    score: 0,
    goals: level.goals.map((goal) => ({ ...goal, done: 0 })),
    joy: 0,
    phase: "play",
    giftUsed: false,
    cozyAdded: 0,
    lowMovesShown: false,
    stars: 0,
    stats: {
      matches: 0,
      bestCombo: 0,
      created: { pioro: 0, piskle: 0, babel: 0, teczowy: 0 },
      fired: 0,
      comboSwaps: 0,
      eggs: 0,
      helps: 0,
      shuffles: 0,
      invalid: 0,
    },
  };

  const hints = () => goalHints(state.goals);
  const progress = () =>
    state.goals.reduce((sum, goal) => sum + Math.min(1, goal.done / goal.count), 0) / Math.max(1, state.goals.length);
  const won = () => state.goals.every((goal) => goal.done >= goal.count);

  // Zmiany po akcji: punkty, cele, radość, statystyki → zdarzenia dla Sówki.
  function apply(result, { kind, counts = true }) {
    const stats = result.stats;
    const events = [];
    const before = state.goals.map((goal) => goal.done >= goal.count);
    state.score += stats.score;
    for (const goal of state.goals) {
      if (goal.type === "collect") goal.done += stats.cleared[goal.kind] || 0;
      else if (goal.type === "notes") goal.done += stats.removed.note;
      else if (goal.type === "crates") goal.done += stats.removed.crate;
      else if (goal.type === "phones") goal.done += stats.removed.phone;
      else if (goal.type === "eggs") goal.done += stats.eggs;
      else if (goal.type === "score") goal.done = state.score;
      goal.done = Math.min(goal.count, goal.done);
    }
    const cleared = stats.clearedByMatch + stats.clearedByPower;
    const joyGain =
      cleared * JOY.tile +
      stats.created.length * JOY.created +
      stats.fired.length * JOY.fired +
      (stats.comboSwap ? JOY.combo : 0);
    if (counts) state.joy = Math.min(JOY.max, state.joy + joyGain);
    state.stats.matches += stats.combo;
    state.stats.bestCombo = Math.max(state.stats.bestCombo, stats.combo);
    for (const special of stats.created) state.stats.created[special] += 1;
    state.stats.fired += stats.fired.length;
    if (stats.comboSwap) state.stats.comboSwaps += 1;
    state.stats.eggs += stats.eggs;
    if (stats.shuffled) state.stats.shuffles += 1;
    const goalsDone = state.goals
      .map((goal, at) => (!before[at] && goal.done >= goal.count ? at : -1))
      .filter((at) => at >= 0);
    events.push({
      type: kind,
      combo: stats.combo,
      cleared,
      created: [...stats.created],
      fired: [...stats.fired],
      comboSwap: stats.comboSwap,
      goalsDone,
      eggs: stats.eggs,
      shuffled: stats.shuffled,
      phone: stats.phoneSpread,
      score: stats.score,
      joyFull: state.joy >= JOY.max,
    });
    return events;
  }

  // Po ruchu gracza: wygrana (→ finał), mało ruchów, prezent od Sówki, Tryb Przytulny albo przegrana.
  function afterMove(events) {
    if (won()) {
      state.phase = "finale";
      events.push({ type: "win" });
      return events;
    }
    if (state.moves === 3 && !state.lowMovesShown) {
      state.lowMovesShown = true;
      events.push({ type: "lowMoves" });
    }
    if (progress() >= 0.5 && progress() < 1 && !state.halfShown) {
      state.halfShown = true;
      events.push({ type: "half", progress: progress() });
    }
    if (state.moves > 0) return events;
    if (!state.giftUsed && progress() >= GIFT.share) {
      state.giftUsed = true;
      state.moves += GIFT.moves;
      events.push({ type: "gift", moves: GIFT.moves });
    } else if (cozy) {
      state.moves += GIFT.cozyMoves;
      state.cozyAdded += GIFT.cozyMoves;
      events.push({ type: "cozy", moves: GIFT.cozyMoves });
    } else {
      state.phase = "lost";
      events.push({ type: "lose", progress: progress() });
    }
    return events;
  }

  function playerAction(result) {
    if (!result.valid) {
      state.stats.invalid += 1;
      return { ...result, events: [{ type: "invalid" }] };
    }
    state.moves -= 1;
    state.movesUsed += 1;
    const events = apply(result, { kind: "move" });
    return { ...result, events: afterMove(events) };
  }

  // Pióro spadające w pole `at` (Sowia pomoc, finał): kierunek, w którym jest więcej pól z celu.
  function featherAt(at) {
    const hint = hints();
    const useful = (cell) => {
      const target = board.cells[cell];
      if (target.block) return hint.blocks.has(target.block.type) ? 3 : 1;
      if (target.item?.kind && hint.kinds.has(target.item.kind)) return 2;
      return target.item ? 0.5 : 0;
    };
    let horizontal = 0;
    let vertical = 0;
    for (let col = 0; col < board.cols; col += 1) horizontal += useful(index(board, rowOf(board, at), col));
    for (let row = 0; row < board.rows; row += 1) vertical += useful(index(board, row, colOf(board, at)));
    return { at, item: { id: -1, special: "pioro", dir: vertical > horizontal ? "v" : "h" } };
  }

  return {
    board,
    state,
    level,
    hints,
    progress,
    swap(a, b) {
      if (state.phase !== "play") return { valid: false, steps: [], events: [] };
      return playerAction(trySwap(board, a, b, { goals: hints() }));
    },
    tap(a) {
      if (state.phase !== "play") return { valid: false, steps: [], events: [] };
      return playerAction(tapSpecial(board, a, { goals: hints() }));
    },
    canSwap: (cell) => swappable(board, cell),
    /** Sowia pomoc (pełna Radość): Sówka zrzuca 3 Pióra w miejscach najbardziej pomocnych dla celu; ruch nie przepada. */
    help() {
      if (state.phase !== "play" || state.joy < JOY.max) return { valid: false, steps: [], events: [] };
      state.joy = 0;
      state.stats.helps += 1;
      const targets = targetsOf(board, hints()).slice(0, JOY.helpFeathers);
      const result = dropPowers(board, targets.map(featherAt), { goals: hints() });
      const events = apply(result, { kind: "help", counts: false });
      if (won()) {
        state.phase = "finale";
        events.push({ type: "win" });
      }
      return { ...result, events };
    },
    /**
     * Humbaczy Finał (rozdz. 6.10): każdy pozostały ruch to Pióro w losowym miejscu (+ punkty za kafelki) i 100
     * punktów; potem wygrana i gwiazdki. → `{ steps, events, feathers }`
     */
    finale() {
      if (state.phase !== "finale") return { valid: false, steps: [], events: [] };
      const steps = [];
      const left = state.moves;
      for (let move = 0; move < left; move += 1) {
        const tiles = board.cells.map((cell, at) => (cell.item && !cell.item.egg ? at : -1)).filter((at) => at >= 0);
        if (!tiles.length) break;
        const at = rng.pick(tiles);
        const result = dropPowers(
          board,
          [{ at, item: { id: -1, special: "pioro", dir: rng.chance(0.5) ? "h" : "v" } }],
          {
            goals: hints(),
            scoreAsPower: true,
          },
        );
        state.score += result.stats.score + POINTS.finaleMove;
        steps.push({ type: "finaleMove", left: left - move - 1 }, ...result.steps);
      }
      state.moves = 0;
      state.phase = "won";
      state.stars = starsFor(state.score, level.stars);
      return { valid: true, steps, events: [{ type: "won", stars: state.stars, score: state.score }], feathers: left };
    },
    /** Podpowiedź: najlepszy ruch według szybkiej oceny (cel, moce, przeszkody). */
    hint() {
      const best = scoreMoves(board, hints())[0];
      return best ? best.move : null;
    },
    specialPoints: (special) => SPECIAL_INFO[special]?.points || 0,
  };
}
