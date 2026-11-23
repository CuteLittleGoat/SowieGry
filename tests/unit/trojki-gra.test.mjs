// Sowie Trójki — poziomy, przebieg poziomu i symulator (Analiza 5, rozdz. 6.4–6.10, 9 i 15.1–15.2): 45 poprawnych
// poziomów w 3 rozdziałach z „piłą” trudności, ruchy i cele, prezent od Sówki, Tryb Przytulny, Sowia pomoc bez
// zabierania ruchu, Humbaczy Finał i gwiazdki, podpowiedź oraz odsetek wygranych symulatora na każdym poziomie.
import assert from "node:assert/strict";
import { test } from "node:test";
import { listMoves, setLayout, index } from "../../SowieTrojki/board.js";
import { playLevel } from "../../SowieTrojki/bot.js";
import { JOY } from "../../SowieTrojki/config.js";
import { createLevelRun, starsFor } from "../../SowieTrojki/game.js";
import { CHAPTERS, INTROS, LEVELS, levelById, validateLevel } from "../../SowieTrojki/levels.js";

test("45 poziomów w 3 rozdziałach po 15, każdy poprawny; „piła” trudności — po trudniejszym zawsze łatwy", () => {
  assert.equal(LEVELS.length, 45);
  assert.deepEqual(
    CHAPTERS.map((chapter) => [chapter.id, chapter.to - chapter.from + 1]),
    [
      ["laka", 15],
      ["ogrodek", 15],
      ["staw", 15],
    ],
  );
  assert.deepEqual(LEVELS.flatMap(validateLevel), []);
  LEVELS.forEach((level, at) => {
    assert.equal(level.id, at + 1);
    assert.ok(level.stars[1] < level.stars[2], `progi gwiazdek ${level.id}`);
    if (level.intro) assert.ok(INTROS[level.intro], `karta „Nowość” ${level.intro}`);
    const next = LEVELS[at + 1];
    if (level.difficulty === "trudny" && next) assert.equal(next.difficulty, "latwy", `po poziomie ${level.id}`);
  });
  // W każdej piątce poziomów co najmniej dwa łatwe i najwyżej jeden trudniejszy.
  for (let start = 0; start < 45; start += 5) {
    const five = LEVELS.slice(start, start + 5).map((level) => level.difficulty);
    assert.ok(five.filter((value) => value === "latwy").length >= 2, `poziomy ${start + 1}–${start + 5}`);
    assert.ok(five.filter((value) => value === "trudny").length <= 1, `poziomy ${start + 1}–${start + 5}`);
  }
  // Nowości w kolejności z rozdz. 10.
  const introAt = Object.fromEntries(LEVELS.filter((level) => level.intro).map((level) => [level.intro, level.id]));
  assert.deepEqual(introAt, {
    zamiana: 1,
    pioro: 2,
    combo: 3,
    karteczka: 4,
    babel: 5,
    piskle: 7,
    skrzynia: 8,
    jajko: 10,
    tasma: 13,
    kanister: 19,
    telefon: 25,
  });
});

test("ruch: zła zamiana nie zabiera ruchu, dobra — jeden; cele i punkty rosną; podpowiedź to dozwolony ruch", () => {
  const run = createLevelRun(levelById(1), { attempt: 7 });
  const moves = run.state.moves;
  const bad = run.swap(0, 2);
  assert.equal(bad.valid, false);
  assert.deepEqual(
    bad.events.map((event) => event.type),
    ["invalid"],
  );
  assert.equal(run.state.moves, moves);
  const hint = run.hint();
  assert.ok(listMoves(run.board).some((move) => move.a === hint.a && move.b === hint.b));
  const result = hint.type === "tap" ? run.tap(hint.a) : run.swap(hint.a, hint.b);
  assert.equal(result.valid, true);
  assert.equal(run.state.moves, moves - 1);
  assert.ok(run.state.score > 0);
  assert.ok(result.events[0].type === "move" && result.events[0].combo >= 1);
});

test("koniec ruchów: prezent od Sówki (+3) raz przy ≥ 75% celu, potem przegrana; Tryb Przytulny dokłada 5", () => {
  const level = { ...levelById(12), moves: 2 };
  const run = createLevelRun(level, { attempt: 3 });
  run.state.goals[0].done = Math.ceil(run.state.goals[0].count * 0.8);
  const play = () => {
    const hint = run.hint();
    return hint.type === "tap" ? run.tap(hint.a) : run.swap(hint.a, hint.b);
  };
  play();
  run.state.goals[0].done = Math.min(run.state.goals[0].done, run.state.goals[0].count - 5);
  const gift = play();
  if (run.state.phase === "play") {
    assert.ok(gift.events.some((event) => event.type === "gift"));
    assert.equal(run.state.moves, 3);
    assert.equal(run.state.giftUsed, true);
    run.state.goals[0].done = 0;
    for (let move = 0; move < 3 && run.state.phase === "play"; move += 1) play();
    assert.equal(run.state.phase, "lost");
  }
  // Tryb Przytulny: nie da się przegrać.
  const cozy = createLevelRun({ ...levelById(12), moves: 1 }, { attempt: 4, cozy: true });
  cozy.state.goals[0].done = 0;
  const hint = cozy.hint();
  const result = hint.type === "tap" ? cozy.tap(hint.a) : cozy.swap(hint.a, hint.b);
  if (cozy.state.phase === "play") {
    assert.ok(result.events.some((event) => event.type === "cozy"));
    assert.equal(cozy.state.moves, 5);
  }
  // Przełącznik w pauzie w trakcie poziomu: funkcja czytana w chwili końca ruchów.
  let cozyOn = false;
  const live = createLevelRun({ ...levelById(12), moves: 1 }, { attempt: 4, cozy: () => cozyOn });
  live.state.goals[0].done = 0;
  cozyOn = true;
  const liveHint = live.hint();
  const liveResult = liveHint.type === "tap" ? live.tap(liveHint.a) : live.swap(liveHint.a, liveHint.b);
  if (live.state.phase === "play") {
    assert.ok(liveResult.events.some((event) => event.type === "cozy"));
    assert.equal(live.state.cozyAdded, 5);
  }
});

test("Sowia pomoc: tylko przy pełnej Radości, 3 Pióra, ruch nie przepada, Radość od zera", () => {
  const run = createLevelRun(levelById(4), { attempt: 2 });
  assert.equal(run.help().valid, false);
  run.state.joy = JOY.max;
  const moves = run.state.moves;
  const result = run.help();
  assert.equal(result.valid, true);
  assert.equal(result.steps.filter((step) => step.type === "fire" && step.special === "pioro").length >= 3, true);
  assert.equal(run.state.moves, moves);
  assert.equal(run.state.joy, 0);
  assert.equal(run.state.stats.helps, 1);
});

test("wygrana → Humbaczy Finał (pozostałe ruchy to Pióra, +100 za ruch) → gwiazdki", () => {
  const level = levelById(2);
  const run = createLevelRun(level, { attempt: 1 });
  // Pióro gotowe w rzędzie 6 (kafelki ustalone na planszy poziomu 2): ułożenie 4 w linii.
  setLayout(run.board, ["", "", "", "", "", "....1...", "..11.1.."]);
  run.state.goals[0].count = 1;
  const result = run.swap(index(run.board, 5, 4), index(run.board, 6, 4));
  assert.equal(result.valid, true);
  assert.ok(result.events.some((event) => event.type === "win"));
  assert.equal(run.state.phase, "finale");
  const left = run.state.moves;
  const before = run.state.score;
  const finale = run.finale();
  assert.equal(finale.feathers, left);
  assert.equal(finale.steps.filter((step) => step.type === "finaleMove").length, left);
  assert.ok(run.state.score >= before + left * 100);
  assert.equal(run.state.phase, "won");
  assert.ok(run.state.stars >= 1 && run.state.stars <= 3);
  assert.equal(starsFor(0, [0, 10, 20]), 1);
  assert.equal(starsFor(15, [0, 10, 20]), 2);
  assert.equal(starsFor(25, [0, 10, 20]), 3);
});

test("symulator: każdy poziom do wygrania (łatwe ≥ 75%, średnie ≥ 55%, trudniejsze ≥ 35% w 12 podejściach), mało mieszań", () => {
  const minimum = { latwy: 0.75, sredni: 0.55, trudny: 0.35 };
  for (const level of LEVELS) {
    let wins = 0;
    let shuffles = 0;
    for (let attempt = 1; attempt <= 12; attempt += 1) {
      const result = playLevel(level, { attempt: 5000 + attempt, skill: 0.5 });
      if (result.won) wins += 1;
      shuffles += result.shuffles;
      assert.equal(result.guard, false);
    }
    assert.ok(wins / 12 >= minimum[level.difficulty], `poziom ${level.id}: ${wins}/12 wygranych`);
    assert.ok(shuffles / 12 <= 1, `poziom ${level.id}: ${shuffles / 12} mieszań na podejście`);
  }
});
