// Sowie Trójki — „gracz-symulator” (Analiza 5, rozdz. 14.3 i 15.2): ta sama logika co w grze, bez rysowania. Gra
// rozsądnie, nie idealnie: zwykle najlepszy ruch według szybkiej oceny (`scoreMoves`), czasem jeden z trzech
// najlepszych; Sowią pomoc używa od razu, gdy jest pełna. Do testów (odsetek wygranych) i strojenia poziomów.
import { createRng } from "../shared/engine/rng.js";
import { createLevelRun, scoreMoves } from "./game.js";

/** Jedno podejście symulatora → `{ won, score, stars, movesLeft, movesUsed, shuffles, gift, guard }`. */
export function playLevel(level, { attempt = 1, cozy = false, skill = 0.75 } = {}) {
  const run = createLevelRun(level, { attempt, cozy });
  const choice = createRng(`bot:${level.id}:${attempt}`);
  let guard = false;
  for (let step = 0; run.state.phase === "play" && step < 400; step += 1) {
    if (run.state.joy >= 100) run.help();
    if (run.state.phase !== "play") break;
    const options = scoreMoves(run.board, run.hints());
    if (!options.length) break;
    const pick = choice.next() < skill ? options[0] : options[Math.floor(choice.next() * Math.min(3, options.length))];
    const result = pick.move.type === "tap" ? run.tap(pick.move.a) : run.swap(pick.move.a, pick.move.b);
    if (result.steps?.length && result.events?.some?.((event) => event.type === "move") === false) guard = true;
  }
  const movesLeft = run.state.phase === "finale" ? run.state.moves : 0;
  if (run.state.phase === "finale") run.finale();
  return {
    won: run.state.phase === "won",
    score: run.state.score,
    stars: run.state.stars,
    movesLeft,
    movesUsed: run.state.movesUsed,
    shuffles: run.state.stats.shuffles,
    gift: run.state.giftUsed,
    guard,
  };
}

/** Wiele podejść → `{ winRate, scores (wygrane, rosnąco), avgShuffles, avgMovesLeft }`. */
export function simulate(level, { attempts = 50, skill = 0.75, offset = 0 } = {}) {
  const results = [];
  for (let attempt = 1; attempt <= attempts; attempt += 1)
    results.push(playLevel(level, { attempt: attempt + offset, skill }));
  const wins = results.filter((result) => result.won);
  return {
    winRate: wins.length / attempts,
    scores: wins.map((result) => result.score).sort((a, b) => a - b),
    avgShuffles: results.reduce((sum, result) => sum + result.shuffles, 0) / attempts,
    avgMovesLeft: wins.length ? wins.reduce((sum, result) => sum + result.movesLeft, 0) / wins.length : 0,
    gifts: results.filter((result) => result.gift).length / attempts,
  };
}
