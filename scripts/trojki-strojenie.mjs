// Sowie Trójki — strojenie poziomów symulatorem (Analiza 5, rozdz. 15.2). Uruchamiane ręcznie, nie w CI:
//   node scripts/trojki-strojenie.mjs [podejścia = 60] [poziomy, np. 1,2,3]
// Dla każdego poziomu: (1) symulator gra bez limitu ruchów — ile ruchów potrzebuje do wygranej; (2) liczba ruchów =
// percentyl według trudności (łatwy 97%, średni 85%, trudniejszy 65%; najmniej 8 ruchów); (3) symulator gra z tą
// liczbą ruchów — odsetek wygranych i progi gwiazdek (★★ — mediana wyników wygranych, ★★★ — 85. percentyl).
// Wynik: tabela `TUNING` do wklejenia w SowieTrojki/levels.js i podsumowanie (krzywa trudności) do dokumentacji.
import { playLevel } from "../SowieTrojki/bot.js";
import { LEVELS, validateLevel } from "../SowieTrojki/levels.js";

const attempts = Number(process.argv[2] || 60);
const only = process.argv[3] ? process.argv[3].split(",").map(Number) : null;
// Gracz „rozsądny, nie idealny”: połowa ruchów najlepsza według oceny, reszta — jeden z trzech najlepszych.
const SKILL = 0.5;
const QUANTILE = { latwy: 0.97, sredni: 0.85, trudny: 0.65 };
const MIN_MOVES = 8;
const quantile = (sorted, share) => sorted[Math.min(sorted.length - 1, Math.floor(share * sorted.length))];
const round100 = (value) => Math.max(100, Math.round(value / 100) * 100);

const table = {};
const lines = [];
for (const level of LEVELS) {
  if (only && !only.includes(level.id)) continue;
  const problems = validateLevel(level);
  const needed = [];
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const result = playLevel({ ...level, moves: 80 }, { attempt: 1000 + attempt, skill: SKILL });
    if (result.won) needed.push(result.movesUsed);
  }
  needed.sort((a, b) => a - b);
  const moves = Math.max(MIN_MOVES, quantile(needed, QUANTILE[level.difficulty]) || level.moves);
  const results = [];
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    results.push(playLevel({ ...level, moves }, { attempt: 2000 + attempt, skill: SKILL }));
  }
  const wins = results.filter((result) => result.won);
  const scores = wins.map((result) => result.score).sort((a, b) => a - b);
  const two = round100(quantile(scores, 0.5) || moves * 400);
  const three = Math.max(two + 100, round100(quantile(scores, 0.85) || moves * 600));
  table[level.id] = [moves, two, three];
  const shuffles = results.reduce((sum, result) => sum + result.shuffles, 0) / attempts;
  lines.push(
    `| ${level.id} | ${level.difficulty} | ${moves} | ${Math.round((wins.length / attempts) * 100)}% | ${quantile(needed, 0.5)} | ${two} | ${three} | ${shuffles.toFixed(2)} |${problems.length ? ` ${problems.join("; ")}` : ""}`,
  );
}
console.log("| Poziom | Trudność | Ruchy | Wygrane symulatora | Ruchy (mediana) | ★★ | ★★★ | Mieszania na podejście |");
console.log("| --- | --- | --- | --- | --- | --- | --- | --- |");
for (const line of lines) console.log(line);
console.log("\n// prettier-ignore\nconst TUNING = {");
for (const [id, values] of Object.entries(table)) console.log(`  ${id}: [${values.join(", ")}],`);
console.log("};");
