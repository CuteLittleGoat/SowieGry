// Sowie Trójki — stan zapisu i reżyser reakcji Sówki (Analiza 5, rozdz. 8 i 13.1): wczytanie i normalizacja zapisu,
// łączenie dwóch zapisów („nic się nie cofa”), wynik poziomu i podsumowanie do profilu; skala radości, priorytety
// reakcji, dymki najwyżej raz na 2 s i nie te same z rzędu, ciche „hu!”, ograniczenie ruchu, wygrana i przegrana.
import assert from "node:assert/strict";
import { test } from "node:test";
import { SPECIALS } from "../../SowieTrojki/config.js";
import { createOwlDirector, joyLevel, JOY_REACTIONS, OTHER_REACTIONS } from "../../SowieTrojki/owl-director.js";
import { defaultState, loadState, mergeStates, recordResult, summaryOf } from "../../SowieTrojki/state.js";

test("stan: domyślny i wczytanie — liczby w granicach, złe dane bez błędu, nieznane pola zostają", () => {
  const base = defaultState();
  assert.equal(base.unlocked, 1);
  assert.deepEqual(base.levels, {});
  assert.deepEqual(Object.keys(base.stats.specials), SPECIALS);
  assert.deepEqual(loadState("to nie JSON"), base);
  assert.deepEqual(loadState(null), base);
  assert.deepEqual(loadState([1, 2]), base);

  const loaded = loadState(
    JSON.stringify({
      unlocked: -4,
      levels: { 1: { stars: 7, best: "1200", wins: 2.7, tries: -1, note: "x" }, abc: { stars: 3 } },
      stats: { plays: "5", specials: { teczowy: 2, inne: 9 }, extra: true },
      tutorial: { done: 1, seen: ["zamiana", "zamiana", 3, "pioro"] },
      future: { kept: true },
    }),
  );
  assert.equal(loaded.unlocked, 1);
  assert.deepEqual(loaded.levels, { 1: { stars: 3, best: 1200, wins: 2, tries: 0, note: "x" } });
  assert.equal(loaded.stats.plays, 5);
  assert.equal(loaded.stats.extra, true);
  assert.equal(loaded.stats.specials.teczowy, 2);
  assert.equal(loaded.stats.specials.inne, 9);
  assert.equal(loaded.stats.specials.pioro, 0);
  assert.deepEqual(loaded.tutorial, { done: true, seen: ["zamiana", "pioro"] });
  assert.deepEqual(loaded.future, { kept: true });
});

test("stan: łączenie dwóch zapisów (drugi telefon) — gwiazdki, wyniki i liczniki tylko rosną", () => {
  const phone = loadState({
    unlocked: 6,
    levels: { 1: { stars: 3, best: 9000, wins: 2, tries: 3 }, 2: { stars: 1, best: 4000, wins: 1, tries: 5 } },
    stats: { plays: 8, wins: 3, bestCombo: 4, specials: { babel: 2 } },
    tutorial: { done: false, seen: ["zamiana"] },
    attempt: 8,
    savedAt: 100,
    onlyPhone: 1,
  });
  const tablet = loadState({
    unlocked: 3,
    levels: { 2: { stars: 2, best: 3500, wins: 1, tries: 1 }, 3: { stars: 1, best: 2000, wins: 1, tries: 2 } },
    stats: { plays: 4, wins: 2, bestCombo: 6, specials: { babel: 1, teczowy: 1 } },
    tutorial: { done: true, seen: ["pioro"] },
    attempt: 4,
    savedAt: 200,
    onlyTablet: 2,
  });
  const merged = mergeStates(phone, tablet);
  assert.equal(merged.unlocked, 6);
  assert.deepEqual(merged.levels[1], { stars: 3, best: 9000, wins: 2, tries: 3 });
  assert.deepEqual(merged.levels[2], { stars: 2, best: 4000, wins: 1, tries: 5 });
  assert.deepEqual(merged.levels[3], { stars: 1, best: 2000, wins: 1, tries: 2 });
  assert.equal(merged.stats.plays, 8);
  assert.equal(merged.stats.bestCombo, 6);
  assert.equal(merged.stats.specials.babel, 2);
  assert.equal(merged.stats.specials.teczowy, 1);
  assert.equal(merged.tutorial.done, true);
  assert.deepEqual(merged.tutorial.seen.sort(), ["pioro", "zamiana"]);
  assert.equal(merged.attempt, 8);
  assert.equal(merged.savedAt, 200);
  assert.equal(merged.onlyPhone, 1);
  assert.equal(merged.onlyTablet, 2);
  // Kolejność nie ma znaczenia dla postępu.
  const reversed = mergeStates(tablet, phone);
  assert.deepEqual(reversed.levels, merged.levels);
  assert.equal(reversed.unlocked, merged.unlocked);
});

test("stan: wynik poziomu — próby, wygrane, gwiazdki bez cofania, odblokowanie następnego do 45; podsumowanie", () => {
  const state = defaultState();
  const stats = { matches: 12, bestCombo: 3, eggs: 1, helps: 1, created: { pioro: 2, teczowy: 1 } };
  recordResult(state, 1, { won: true, stars: 2, score: 8000, stats });
  recordResult(state, 1, { won: false, stars: 0, score: 1000, stats: { matches: 3, bestCombo: 1 } });
  recordResult(state, 1, { won: true, stars: 1, score: 6000 });
  assert.deepEqual(state.levels[1], { stars: 2, best: 8000, wins: 2, tries: 3 });
  assert.equal(state.unlocked, 2);
  assert.equal(state.stats.plays, 3);
  assert.equal(state.stats.wins, 2);
  assert.equal(state.stats.matches, 15);
  assert.equal(state.stats.bestCombo, 3);
  assert.equal(state.stats.owlets, 1);
  assert.equal(state.stats.helps, 1);
  assert.equal(state.stats.specials.pioro, 2);
  assert.equal(state.stats.specials.teczowy, 1);
  recordResult(state, 45, { won: true, stars: 5, score: 100 });
  assert.equal(state.unlocked, 45);
  assert.equal(state.levels[45].stars, 3);
  assert.deepEqual(summaryOf(state), { level: 45, stars: 5, three: 1, bestCombo: 3, owlets: 1 });
});

test("Sówka: skala radości 0–5 według combo, mocy, celu i zamiany dwóch mocy", () => {
  assert.equal(joyLevel({}), 0);
  assert.equal(joyLevel({ combo: 1 }), 1);
  assert.equal(joyLevel({ cleared: 3 }), 1);
  assert.equal(joyLevel({ combo: 2 }), 2);
  assert.equal(joyLevel({ combo: 1, created: ["piskle"] }), 2);
  assert.equal(joyLevel({ combo: 1, created: ["babel"] }), 3);
  assert.equal(joyLevel({ combo: 1, goalsDone: [0] }), 3);
  assert.equal(joyLevel({ combo: 4 }), 4);
  assert.equal(joyLevel({ combo: 1, created: ["teczowy"] }), 4);
  assert.equal(joyLevel({ combo: 1, comboSwap: "pioro+babel" }), 4);
  assert.equal(joyLevel({ combo: 6 }), 5);
  assert.equal(joyLevel({ combo: 1, comboSwap: "teczowy+teczowy" }), 5);
  assert.deepEqual(
    [1, 2, 3, 4, 5].map((level) => JOY_REACTIONS[level].reaction),
    ["hop", "wings", "double", "salto", "fly"],
  );
});

test("Sówka: ważniejsza reakcja przerywa słabszą, słabsza czeka; po czasie trwania — spokój", () => {
  const director = createOwlDirector({ random: () => 0 });
  const salto = director.handle({ type: "move", combo: 4 }, 0);
  assert.equal(salto.reaction, "salto");
  assert.equal(salto.level, 4);
  assert.equal(director.handle({ type: "move", combo: 1 }, 0.3), null, "podskok nie przerywa salta");
  assert.equal(director.current(0.5).reaction, "salto");
  assert.equal(director.handle({ type: "lose" }, 0.6).reaction, "sad", "przegrana przerywa salto");
  assert.equal(director.current(0.6 + OTHER_REACTIONS.lose.duration + 0.01), null);
  assert.equal(director.handle({ type: "move", combo: 1 }, 5).reaction, "hop");
  director.stop();
  assert.equal(director.current(5.1), null);
  assert.equal(director.handle({ type: "move" }, 6), null, "ruch bez trójki nie cieszy");
  assert.equal(director.handle({ type: "nieznane" }, 7), null);
});

test("Sówka: dymek najwyżej raz na 2 s i nie ten sam dwa razy z rzędu; bez komentarzy — bez dymków", () => {
  const director = createOwlDirector({ random: () => 0 });
  const first = director.handle({ type: "move", combo: 2 }, 0);
  assert.equal(first.bubble, "Ładnie!");
  director.stop();
  assert.equal(director.handle({ type: "move", combo: 2 }, 1).bubble, null, "za wcześnie na drugi dymek");
  director.stop();
  assert.equal(director.handle({ type: "move", combo: 2 }, 2.5).bubble, "Brawo!", "nie ten sam co ostatnio");
  director.stop();
  assert.equal(director.handle({ type: "move", combo: 2 }, 5).bubble, "Ładnie!");

  const silent = createOwlDirector({ quips: () => false });
  assert.equal(silent.handle({ type: "move", combo: 3 }, 0).bubble, null);
  assert.equal(silent.handle({ type: "start", text: "Zbierzmy 25 liści!" }, 5).bubble, null);
  const talkative = createOwlDirector();
  assert.equal(talkative.handle({ type: "start", text: "Zbierzmy 25 liści!" }, 0).bubble, "Zbierzmy 25 liści!");
});

test("Sówka: ciche „hu!” najwyżej co 1,5 s; „Hm?” raz na trzy złe zamiany", () => {
  const director = createOwlDirector();
  assert.equal(director.handle({ type: "move", combo: 1 }, 0).sound, "hu");
  director.stop();
  assert.equal(director.handle({ type: "move", combo: 1 }, 1).sound, null);
  director.stop();
  assert.equal(director.handle({ type: "move", combo: 1 }, 1.6).sound, "hu");

  const picky = createOwlDirector();
  const tilts = [0, 1, 2, 3].map((step) => picky.handle({ type: "invalid" }, 10 + step * 3));
  assert.deepEqual(
    tilts.map((result) => result?.reaction ?? null),
    ["tilt", null, null, "tilt"],
  );
});

test("Sówka: ograniczenie ruchu — bez salta, lotu i konfetti; wygrana z 3 gwiazdkami ma oczy-gwiazdki", () => {
  const calm = createOwlDirector({ reducedMotion: () => true });
  const salto = calm.handle({ type: "move", combo: 4 }, 0);
  assert.equal(salto.reaction, "wings");
  calm.stop();
  const fly = calm.handle({ type: "move", combo: 6 }, 3);
  assert.equal(fly.reaction, "wings");
  assert.equal(fly.effects, "sparkles");
  calm.stop();
  assert.equal(calm.handle({ type: "help" }, 6).reaction, "wings");

  const director = createOwlDirector();
  assert.equal(director.handle({ type: "win" }, 0), null, "„win” tylko przełącza na finał");
  const three = director.handle({ type: "won", stars: 3 }, 1);
  assert.equal(three.reaction, "dance");
  assert.equal(three.eyes, "stars");
  director.stop();
  assert.equal(director.handle({ type: "won", stars: 1 }, 5).eyes, null);
  director.stop();
  assert.equal(director.handle({ type: "gift" }, 9).reaction, "gift");
  assert.equal(director.last().reaction, "gift");
});
