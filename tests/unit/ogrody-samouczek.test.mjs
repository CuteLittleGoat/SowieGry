// Sowie Ogrody — nowa odsłona (Analiza 3, E7d2): samouczek pierwszego wejścia i instrukcja „Jak grać?”.
import assert from "node:assert/strict";
import { test } from "node:test";
import { guideFor, GUIDE_ORDER, validateGuide } from "../../shared/meta/guides-data.js";
import { SPRITES } from "../../shared/world/catalog.js";
import { createTutorial, TUTORIAL_STEPS } from "../../SowieOgrody/ogrod/tutorial.js";
import { defaultState } from "../../SowieOgrody/ogrod/state.js";

test("samouczek: 4 kroki — stuknięcia, zakup Monstery, cele i zdarzenia („Dalej”); bez zatrzymywania czasu", () => {
  assert.deepEqual(
    TUTORIAL_STEPS.map((step) => step.id),
    ["stuknij", "kup", "cele", "zdarzenia"],
  );
  const state = defaultState(0);
  const shown = [];
  let done = 0;
  const tutorial = createTutorial({ state, onStep: (item) => shown.push(item?.id ?? null), onDone: () => (done += 1) });
  assert.deepEqual(tutorial.progress(), { step: 1, steps: 4, ...TUTORIAL_STEPS[0], next: false });
  // „Dalej” nie działa w kroku z akcją; 4 stuknięcia to za mało.
  tutorial.next(state);
  state.stats.taps = 4;
  tutorial.update(state);
  assert.equal(tutorial.progress().id, "stuknij");
  state.stats.taps = 5;
  tutorial.update(state);
  assert.equal(tutorial.progress().id, "kup");
  state.plants.monstera = 1;
  tutorial.update(state);
  assert.equal(tutorial.progress().id, "cele");
  assert.equal(tutorial.progress().next, true);
  tutorial.update(state);
  assert.equal(tutorial.progress().id, "cele", "krok informacyjny czeka na „Dalej”");
  tutorial.next(state);
  assert.equal(tutorial.progress().id, "zdarzenia");
  tutorial.next(state);
  assert.equal(tutorial.progress(), null);
  assert.equal(done, 1);
  assert.deepEqual(shown, ["stuknij", "kup", "cele", "zdarzenia", null]);
  tutorial.skip();
  assert.equal(done, 1, "koniec tylko raz");
});

test("samouczek: dawny ogród z Monsterą — krok zakupu zaliczony od razu; „Pomiń” kończy od razu", () => {
  const state = defaultState(0);
  state.plants.monstera = 30;
  state.stats.taps = 321;
  const tutorial = createTutorial({ state });
  state.stats.taps = 326;
  tutorial.update(state);
  assert.equal(tutorial.progress().id, "cele");
  let done = false;
  const skipped = createTutorial({ state: defaultState(0), onDone: () => (done = true) });
  skipped.skip();
  assert.equal(done, true);
  assert.equal(skipped.progress(), null);
});

test("instrukcja „ogrod”: tytuł, opis i karty o celach, liściach, roślinach, konewce, zdarzeniach i przesadzaniu", () => {
  const guide = guideFor("ogrod");
  assert.equal(guide.id, "ogrod");
  assert.equal(guide.title, "Sowie Ogrody");
  assert.ok(guide.summary.length > 40);
  assert.deepEqual(
    guide.cards.map((card) => card.id),
    ["cel", "liscie", "rosliny", "konewka", "pracu-amic", "kozka-zatoka", "przesadzanie"],
  );
  assert.deepEqual(validateGuide(guide, { sprites: SPRITES }), []);
  for (const card of guide.cards) assert.ok(SPRITES[card.sprite], `${card.id}: ${card.sprite}`);
  assert.match(guide.cards.find((card) => card.id === "pracu-amic").text, /Tryb samolotowy|trzy razy/);
  assert.match(guide.cards.find((card) => card.id === "kozka-zatoka").text, /Zatoce Humbaka/);
  // Podgląd — poza zakładką „Jak grać” w menu (tam dawne Sowie Ogrody do podmiany w E7e).
  assert.ok(!GUIDE_ORDER.includes("ogrod"));
});
