// Sowia Ucieczka — samouczek pierwszego uruchomienia (Analiza 3, E4 zadanie 4.5).
import assert from "node:assert/strict";
import test from "node:test";
import { COZY_SPEED, DIFFICULTIES } from "../../SowiaUcieczka/config.js";
import { createRun } from "../../SowiaUcieczka/game.js";
import { PATTERNS, TUTORIAL_PATTERNS } from "../../SowiaUcieczka/patterns.js";
import { TUTORIAL_STEPS, createTutorial } from "../../SowiaUcieczka/tutorial.js";

const DT = 1 / 60;

// Bot, który rusza się tylko wtedy, gdy samouczek zatrzyma grę i pokaże podpowiedź.
function playTutorial({ difficulty = "arcade", cozy = false, source = "touch", safe = false } = {}) {
  const prompts = [];
  let done = false;
  const tutorial = createTutorial({
    onPrompt: (item) => item && prompts.push(item),
    onDone: () => (done = true),
  });
  const game = createRun({ difficulty, cozy, seed: "samouczek", intro: TUTORIAL_PATTERNS, safe });
  let holding = false;
  const events = [];
  for (let time = 0; time < 40 && !done; time += DT) {
    if (tutorial.frozen()) {
      const item = tutorial.progress();
      if (item.accept === "press" && tutorial.accept("press")) {
        game.press(source);
        // Szybowanie: palec trzymany do lądowania.
        if (item.gesture === "hold") holding = true;
        else game.release();
      } else if (item.accept === "down" && tutorial.accept("down")) game.swipe("down");
    }
    if (!tutorial.frozen()) {
      game.update(DT);
      // Puszczamy dopiero po lądowaniu, które nastąpiło po wybiciu.
      if (holding === true && !game.state.owl.grounded) holding = "air";
      if (holding === "air" && game.state.owl.grounded) {
        holding = false;
        game.release();
      }
      for (const event of game.takeEvents()) {
        tutorial.handleEvent(event);
        events.push(event);
      }
    }
    tutorial.update(game.state);
  }
  return { game, prompts, done, events };
}

test("samouczek: 4 kroki (skok, ślizg, podwójny skok, szybowanie) z osobnymi wzorami spoza zwykłej puli", () => {
  assert.equal(TUTORIAL_STEPS.length, 4);
  assert.deepEqual(
    TUTORIAL_STEPS.map((step) => step.pattern),
    TUTORIAL_PATTERNS.map((item) => item.id),
  );
  for (const item of TUTORIAL_PATTERNS) assert.ok(!PATTERNS.some((other) => other.id === item.id));
  // Wzory samouczka idą pierwsze i w tej kolejności.
  const game = createRun({ seed: "kolejnosc", intro: TUTORIAL_PATTERNS });
  game.prime();
  for (let time = 0; time < 12; time += DT) {
    game.state.invulnerable = 1e9;
    game.update(DT);
  }
  assert.deepEqual(game.state.patterns.slice(0, 4), [
    "samouczek-skok",
    "samouczek-slizg",
    "samouczek-podwojny",
    "samouczek-szybowanie",
  ]);
});

for (const [difficulty, cozy] of [
  ["chill", true],
  ["chill", false],
  ["arcade", false],
  ["chaos", false],
]) {
  for (const source of ["touch", "keyboard"]) {
    test(`samouczek do przejścia bez trafienia ruchami z podpowiedzi (${difficulty}${cozy ? ", Przytulny" : ""}, ${source})`, () => {
      const speed = DIFFICULTIES[difficulty].speedStart * (cozy ? COZY_SPEED : 1);
      assert.ok(speed > 0);
      const { game, prompts, done, events } = playTutorial({ difficulty, cozy, source });
      assert.ok(done, "samouczek ukończony");
      assert.equal(prompts.length, 5, "5 zatrzymań: skok, ślizg, skok + podwójny skok, szybowanie");
      assert.equal(game.state.hits, 0, `trafienia: ${game.state.hits}`);
      assert.ok(!events.some((event) => event.type === "fall"), "bez wpadnięcia do dziury");
      assert.ok(
        events.some((event) => event.type === "land" && Math.abs(event.surface + 4.2) < 1e-6),
        "podwójny skok na wysoką platformę",
      );
      assert.ok(game.state.leafCount >= 5, "liście z platformy");
      for (const type of ["jump", "slide", "doubleJump", "glideStart"]) {
        assert.ok(
          events.some((event) => event.type === type),
          type,
        );
      }
    });
  }
}

test("zatrzymanie: inne ruchy są pomijane, właściwy wznawia grę; ruch przed zatrzymaniem je zalicza", () => {
  const prompts = [];
  const tutorial = createTutorial({ onPrompt: (item) => prompts.push(item) });
  const game = createRun({ seed: "zatrzymanie", intro: TUTORIAL_PATTERNS, safe: true });
  for (let time = 0; time < 5 && !tutorial.frozen(); time += DT) {
    game.update(DT);
    for (const event of game.takeEvents()) tutorial.handleEvent(event);
    tutorial.update(game.state);
  }
  assert.ok(tutorial.frozen());
  assert.equal(prompts.at(-1).text, "Stuknij ekran — skok nad telefonem!");
  assert.equal(prompts.at(-1).gesture, "tap");
  assert.equal(tutorial.accept("down"), false);
  assert.equal(tutorial.accept("other"), false);
  assert.equal(tutorial.accept("release"), true);
  assert.ok(tutorial.frozen());
  assert.equal(tutorial.accept("press"), true);
  assert.ok(!tutorial.frozen());
  assert.equal(prompts.at(-1), null, "podpowiedź schowana");

  // Gracz ślizga się sam, zanim gra się zatrzyma — kroku ze ślizgiem już nie zatrzymujemy.
  const early = createTutorial();
  const run = createRun({ seed: "wczesnie", intro: TUTORIAL_PATTERNS, safe: true });
  let frozenOnSlide = false;
  for (let time = 0; time < 12 && early.progress().step < 3; time += DT) {
    if (early.frozen()) {
      if (early.progress().accept === "press" && early.accept("press")) {
        run.press("keyboard");
        run.release();
      } else frozenOnSlide = true;
    }
    const slideStart = run.state.patterns.includes("samouczek-slizg");
    if (early.progress().step === 2 && slideStart && !early.frozen()) {
      const owl = run.state.owl;
      const dymek = run.state.obstacles.find((item) => item.kind === "dymek");
      if (dymek && dymek.x - owl.x < 2.2 && owl.grounded && !owl.sliding && early.accept("down")) run.swipe("down");
    }
    if (!early.frozen()) {
      run.update(DT);
      for (const event of run.takeEvents()) early.handleEvent(event);
    }
    early.update(run.state);
  }
  assert.equal(frozenOnSlide, false);
  assert.equal(early.progress().step, 3);
});
