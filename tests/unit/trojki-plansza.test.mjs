// Sowie Trójki — logika planszy (Analiza 5, rozdz. 6, 7 i 14.3): ułożenia i moce, zamiany, spadanie z dziurami
// i ukosami, moce i ich połączenia, przeszkody, jajka, mieszanie, podpowiedzi i losowe ruchy z niezmiennikami.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyGravity,
  boardToText,
  checkInvariants,
  cloneBoard,
  createBoard,
  findGroups,
  index,
  kindCounts,
  listMoves,
  mostCommonKind,
  setLayout,
  shuffle,
  tapSpecial,
  trySwap,
} from "../../SowieTrojki/board.js";
import { KINDS, goalText, plural } from "../../SowieTrojki/config.js";

const ALL = KINDS;
const SIX = { kinds: KINDS };
// Plansza z maski poziomu (znaki jak w levels.js) i ustawieniem przedmiotów (znaki `setLayout`).
function board(mask, layout = null, { kinds = ALL, seed = "test" } = {}) {
  const created = createBoard({ id: 0, board: mask, kinds }, { seed });
  if (layout) setLayout(created, layout);
  return created;
}
const at = (b, row, col) => index(b, row, col);
const item = (b, row, col) => b.cells[at(b, row, col)].item;
const FULL = Array(8).fill("........");

// Tło testów: rodzaje 3–6 bez żadnych ułożeń (kolejne rzędy przesunięte); układy testów używają rodzajów 1 i 2, więc
// nie tworzą przypadkowych ułożeń z tłem.
const CHECKER = ["34563456", "56345634", "34563456", "56345634", "34563456", "56345634", "34563456", "56345634"];

test("ułożenia: 3 w linii — zwykłe, 4 — Pióro (kierunek jak linia), 5 — Tęczowy liść", () => {
  const b = board(FULL, CHECKER);
  setLayout(b, ["111.....", ".......", "2.......", "2.......", "2.......", "2......."]);
  const groups = findGroups(b);
  const row = groups.find((group) => group.cells.includes(at(b, 0, 0)));
  assert.deepEqual(row.cells, [0, 1, 2]);
  assert.equal(row.special, null);
  const column = groups.find((group) => group.cells.includes(at(b, 2, 0)));
  assert.equal(column.special, "pioro");
  assert.equal(column.dir, "v");
  const five = board(FULL, CHECKER);
  setLayout(five, ["", "", "", "11111..."]);
  assert.equal(findGroups(five)[0].special, "teczowy");
  const fourH = board(FULL, CHECKER);
  setLayout(fourH, ["", "", "", "2222...."]);
  assert.deepEqual(
    findGroups(fourH).map((group) => [group.special, group.dir]),
    [["pioro", "h"]],
  );
});

test("ułożenia: L, T i + to Bąbel, kwadrat 2 × 2 — Pisklę, blok 2 × 3 — Pisklę, blok 3 × 3 — Bąbel", () => {
  const shapes = {
    L: ["1.......", "1.......", "111....."],
    T: ["111.....", ".1......", ".1......"],
    plus: [".1......", "111.....", ".1......"],
  };
  for (const [name, layout] of Object.entries(shapes)) {
    const b = board(FULL, CHECKER);
    setLayout(
      b,
      layout.map((line) => line.replace(/\./g, ".")),
    );
    const groups = findGroups(b).filter((group) => group.kind === "lisc");
    assert.equal(groups.length, 1, name);
    assert.equal(groups[0].special, "babel", name);
    assert.equal(groups[0].cells.length, 5, name);
  }
  const square = board(FULL, CHECKER);
  setLayout(square, ["", "", "22......", "22......"]);
  assert.deepEqual(
    findGroups(square).map((group) => [group.special, group.cells.length]),
    [["piskle", 4]],
  );
  const block = board(FULL, CHECKER);
  setLayout(block, ["", "", "222.....", "222....."]);
  assert.deepEqual(
    findGroups(block).map((group) => [group.special, group.cells.length]),
    [["piskle", 6]],
  );
  const big = board(FULL, CHECKER);
  setLayout(big, ["", "", "111.....", "111.....", "111....."]);
  assert.equal(findGroups(big)[0].special, "babel");
});

test("zamiana: bez ułożenia wraca (plansza bez zmian), z ułożeniem — moc powstaje w polu przesuniętego kafelka", () => {
  const b = board(FULL, CHECKER);
  const before = boardToText(b).join("|");
  const bad = trySwap(b, at(b, 0, 0), at(b, 0, 1));
  assert.equal(bad.valid, false);
  assert.deepEqual(
    bad.steps.map((step) => step.type),
    ["swap", "swapBack"],
  );
  assert.equal(boardToText(b).join("|"), before);
  // 1 1 2 1 1 w rzędzie, a nad „2” jest 1 → zamiana w pionie daje 5 w linii → Tęczowy liść w polu przesunięcia.
  const five = board(FULL, CHECKER);
  setLayout(five, ["..1.....", "11211..."]);
  const result = trySwap(five, at(five, 0, 2), at(five, 1, 2));
  assert.equal(result.valid, true);
  const created = result.steps.find((step) => step.type === "create");
  assert.equal(created.item.special, "teczowy");
  assert.equal(created.at, at(five, 1, 2));
  assert.deepEqual(result.stats.created, ["teczowy"]);
  assert.ok(checkInvariants(five).length === 0, checkInvariants(five).join(", "));
});

test("spadanie: kafelki spadają, wyloty dokładają nowe, pod przeszkodą i dziurą kafelek zsuwa się ukosem", () => {
  const mask = ["........", "...K....", "........", "...#....", "........", "........", "........", "........"];
  const b = board(mask, CHECKER);
  // Opróżniamy pola pod przeszkodą i pod dziurą oraz kawałek kolumny 0.
  for (const [row, col] of [
    [2, 3],
    [4, 3],
    [5, 3],
    [6, 0],
    [7, 0],
  ])
    b.cells[at(b, row, col)].item = null;
  const fall = applyGravity(b);
  assert.ok(fall.moves.length > 0);
  for (let cell = 0; cell < b.cells.length; cell += 1) {
    const target = b.cells[cell];
    if (!target.hole && !target.block) assert.ok(target.item, `puste pole ${cell}`);
  }
  // Pola pod karteczką (kolumna 3) dostały kafelki ukosem z sąsiednich kolumn — droga przez sąsiednią kolumnę.
  const diagonal = fall.moves.find((move) =>
    move.path.some((cell, step) => step > 0 && Math.abs((cell % 8) - (move.path[step - 1] % 8)) === 1),
  );
  assert.ok(diagonal, "jest ruch ukosem");
  // Nowe kafelki z wylotu kolumny 0.
  assert.ok(fall.moves.some((move) => move.spawned && move.path.at(-1) % 8 === 0));
});

test("moce: Pióro czyści rząd albo kolumnę, Bąbel 5 × 5, Tęczowy liść stuknięty — najliczniejszy rodzaj", () => {
  const feather = board(FULL, CHECKER);
  setLayout(feather, ["", "", "", "...h...."]);
  const fired = tapSpecial(feather, at(feather, 3, 3));
  const fire = fired.steps.find((step) => step.type === "fire");
  assert.deepEqual(fire.cells, [24, 25, 26, 27, 28, 29, 30, 31]);
  assert.equal(fired.stats.clearedByPower, 7);
  const column = board(FULL, CHECKER);
  setLayout(column, ["", "", "", "...v...."]);
  assert.deepEqual(
    tapSpecial(column, at(column, 3, 3)).steps.find((step) => step.type === "fire").cells,
    [3, 11, 19, 27, 35, 43, 51, 59],
  );
  const bubble = board(FULL, CHECKER);
  setLayout(bubble, ["", "", "", "...o...."]);
  const area = tapSpecial(bubble, at(bubble, 3, 3)).steps.find((step) => step.type === "fire").cells;
  assert.equal(area.length, 25);
  const rainbow = board(FULL, CHECKER);
  setLayout(rainbow, ["", "", "", "...r...."]);
  const expected = mostCommonKind(rainbow);
  const count = kindCounts(rainbow)[expected];
  const result = tapSpecial(rainbow, at(rainbow, 3, 3));
  const rainbowFire = result.steps.find((step) => step.type === "fire");
  assert.equal(rainbowFire.kind, expected);
  assert.equal(rainbowFire.cells.length, count);
  assert.ok(result.stats.cleared[expected] >= count);
  for (const b of [feather, column, bubble, rainbow]) assert.deepEqual(checkInvariants(b), []);
});

test("moce: Pisklę zbija 4 sąsiednie pola i leci do przeszkody z celu; zamiana z mocą odpala ją bez ułożenia", () => {
  const mask = ["........", "........", "........", "........", "........", "........", "......K.", "........"];
  const b = board(mask, CHECKER);
  setLayout(b, ["", "", "...q...."]);
  const result = tapSpecial(b, at(b, 2, 3), { goals: { kinds: new Set(), blocks: new Set(["note"]), eggs: false } });
  const fire = result.steps.find((step) => step.type === "fire");
  assert.equal(fire.special, "piskle");
  assert.deepEqual(fire.targets, [at(b, 6, 6)]);
  assert.ok(fire.cells.includes(at(b, 2, 2)) && fire.cells.includes(at(b, 1, 3)));
  assert.equal(result.stats.removed.note, 1);
  // Zamiana Pióra z sąsiadem: Pióro przechodzi na pole sąsiada i tam odpala (także bez ułożenia).
  const swap = board(FULL, CHECKER);
  setLayout(swap, ["", "", "", "...h...."]);
  const swapped = trySwap(swap, at(swap, 3, 3), at(swap, 4, 3));
  assert.equal(swapped.valid, true);
  assert.deepEqual(swapped.steps.find((step) => step.type === "fire").cells, [32, 33, 34, 35, 36, 37, 38, 39]);
});

test("połączenia mocy (rozdz. 6.6): krzyż, gruby krzyż, wielki plusk, trzy pisklęta, tęczowy z mocą i dwa tęczowe", () => {
  const cases = [
    ["hv", "cross", 15],
    ["ho", "bigCross", 3 * 8 + 3 * 8 - 9],
    ["oo", "bigBubble", 49],
  ];
  for (const [pair, mode, cells] of cases) {
    const b = board(FULL, CHECKER);
    setLayout(b, ["", "", "", `...${pair}...`]);
    const result = trySwap(b, at(b, 3, 3), at(b, 3, 4));
    const fire = result.steps.find((step) => step.type === "fire");
    assert.equal(fire.special, mode, pair);
    assert.equal(new Set(fire.cells).size, cells, pair);
    assert.deepEqual(checkInvariants(b), [], pair);
  }
  const owlets = board(FULL, CHECKER);
  setLayout(owlets, ["", "", "", "...qq..."]);
  const flock = trySwap(owlets, at(owlets, 3, 3), at(owlets, 3, 4)).steps.find((step) => step.type === "fire");
  assert.equal(flock.targets.length, 3);
  assert.equal(new Set(flock.targets).size, 3);
  const carry = board(FULL, CHECKER);
  setLayout(carry, ["", "", "", "...qo..."]);
  const carried = trySwap(carry, at(carry, 3, 3), at(carry, 3, 4));
  assert.equal(carried.steps.find((step) => step.type === "fire").carry, "babel");
  assert.ok(carried.steps.filter((step) => step.type === "fire").some((step) => step.special === "babel"));
  const rainbowFeather = board(FULL, CHECKER);
  setLayout(rainbowFeather, ["", "", "", "...rh..."]);
  const transformed = trySwap(rainbowFeather, at(rainbowFeather, 3, 3), at(rainbowFeather, 3, 4));
  assert.ok(transformed.steps.filter((step) => step.type === "create").length >= 8);
  assert.ok(transformed.steps.filter((step) => step.type === "fire" && step.special === "pioro").length >= 8);
  const mask = ["........", "...K....", "........", "........", "........", "........", "........", "......S."];
  const double = board(mask, CHECKER);
  setLayout(double, ["", "", "", "...rr..."]);
  const all = trySwap(double, at(double, 3, 3), at(double, 3, 4));
  assert.equal(all.steps.find((step) => step.type === "fire").special, "all");
  assert.equal(all.stats.removed.note + all.stats.removed.crate, 2, "po warstwie każdej przeszkody");
  assert.deepEqual(checkInvariants(double), []);
});

test("przeszkody: karteczka traci najwyżej jedną warstwę na ułożenie, kanister tylko od mocy, taśma pęka, kafelek zostaje", () => {
  const mask = ["...D....", "........", "........", ".......C", "........", "........", "........", "........"];
  const b = board(mask, CHECKER);
  // Ułożenie 3 w rzędzie tuż pod karteczką z 2 warstwami (dwa pola ułożenia sąsiadują z nią — dalej jedna warstwa).
  setLayout(b, ["", "..1.11..", "...1...."]);
  const result = trySwap(b, at(b, 1, 3), at(b, 2, 3));
  const damage = result.steps.filter((step) => step.type === "damage" && step.block === "note" && step.wave === 1);
  assert.equal(damage.length, 1, "jedno ułożenie — jedna warstwa");
  assert.equal(damage[0].layers, 1);
  // Kanister obok ułożenia — bez zmian.
  const canister = board(mask, CHECKER);
  setLayout(canister, ["", "", ".....2.2", "......2.", ""]);
  trySwap(canister, at(canister, 2, 6), at(canister, 3, 6));
  assert.equal(canister.cells[at(canister, 3, 7)].block?.type, "canister");
  setLayout(canister, ["", "", "", "......h."]);
  tapSpecial(canister, at(canister, 3, 6));
  assert.equal(canister.cells[at(canister, 3, 7)].block, null, "Pióro rozbija kanister");
  // Taśma: kafelek w taśmie w ułożeniu — taśma pęka, kafelek zostaje na miejscu.
  const tape = board(FULL, CHECKER);
  setLayout(tape, ["", "", "a.11....", ".1......"]);
  const tapeResult = trySwap(tape, at(tape, 2, 1), at(tape, 3, 1));
  const firstWave = tapeResult.steps.filter((step) => step.wave === 1);
  assert.ok(firstWave.some((step) => step.type === "tape" && step.at === at(tape, 2, 0)));
  assert.ok(!firstWave.some((step) => step.type === "clear" && step.at === at(tape, 2, 0)), "kafelek zostaje");
  // Kafelka w taśmie nie da się przesunąć.
  const locked = board(FULL, CHECKER);
  setLayout(locked, ["a......."]);
  assert.equal(trySwap(locked, at(locked, 0, 0), at(locked, 0, 1)).valid, false);
});

test("telefon Pracu: 2 trafienia obok go wyłączają; ruch bez trafienia karteczki ani telefonu dokleja karteczkę", () => {
  const mask = ["........", "........", "........", "........", "........", "........", "...T....", "........"];
  // Ruch daleko od telefonu (rząd 0) — bez trafienia telefonu i karteczek.
  const b = board(mask, CHECKER);
  setLayout(b, ["1.11...."]);
  setLayout(b, ["", ".1......"]);
  const result = trySwap(b, at(b, 0, 1), at(b, 1, 1));
  assert.equal(result.valid, true);
  assert.ok(result.stats.phoneSpread, "telefon zadzwonił");
  const note = b.cells[result.stats.phoneSpread.at];
  assert.equal(note.block?.type, "note");
  const near = board(mask, CHECKER);
  setLayout(near, ["", "", "", "", "", "..1.....", "11.1....", "........"]);
  const hit = trySwap(near, at(near, 5, 2), at(near, 6, 2));
  const phoneHit = hit.steps.find((step) => step.type === "damage" && step.block === "phone" && step.wave === 1);
  assert.equal(phoneHit?.layers, 1, "pierwsze trafienie");
  assert.equal(hit.stats.phoneSpread, null);
});

test("jajka: spadają, nie pasują do trójek, moce ich nie zbijają, w gnieździe się wykluwają", () => {
  const mask = ["........", "........", "........", "........", "........", "........", "........", "..GG...."];
  const b = board(mask, CHECKER);
  setLayout(b, ["", "", "", "", "", "", "..j.....", ""]);
  // Zbijamy kafelek pod jajkiem Piórem w rzędzie 7.
  setLayout(b, ["", "", "", "", "", "", "", "h......."]);
  const result = tapSpecial(b, at(b, 7, 0));
  assert.equal(result.stats.eggs, 1);
  assert.ok(result.steps.some((step) => step.type === "hatch"));
  assert.ok(!b.cells.some((cell) => cell.item?.egg));
  // Pióro w rzędzie z jajkiem — jajko zostaje.
  const safe = board(FULL, CHECKER);
  setLayout(safe, ["", "", "", "h..j...."]);
  tapSpecial(safe, at(safe, 3, 0));
  assert.ok(safe.cells.some((cell) => cell.item?.egg));
  assert.deepEqual(checkInvariants(safe), []);
});

test("mieszanie: bez ułożeń i z ruchem; to samo ziarno — ta sama plansza; plansza startowa bez trójek i z ruchem", () => {
  const a = board(FULL, null, { seed: "mieszanie" });
  const b = board(FULL, null, { seed: "mieszanie" });
  assert.deepEqual(boardToText(a), boardToText(b));
  assert.equal(findGroups(a).length, 0);
  assert.ok(listMoves(a).length > 0);
  const steps = shuffle(a);
  assert.equal(steps.at(-1).type, "shuffle");
  shuffle(b);
  assert.deepEqual(boardToText(a), boardToText(b));
  assert.equal(findGroups(a).length, 0);
  assert.ok(listMoves(a).length > 0);
  // Kopia planszy z własnym losowaniem w tym samym stanie — ten sam wynik ruchu.
  const copy = cloneBoard(a);
  const move = listMoves(a).find((entry) => entry.type === "swap");
  trySwap(a, move.a, move.b);
  trySwap(copy, move.a, move.b);
  assert.deepEqual(boardToText(a), boardToText(copy));
});

test("2000 losowych ruchów na losowych planszach z przeszkodami, dziurami, taśmą i jajkami — niezmienniki po każdym", () => {
  const masks = [
    FULL,
    ["#......#", "........", "..KK....", "...S....", "....D...", "C.......", "...t....", "..GG...."],
    [".....#..", "..T.....", "...J....", "........", "..BB....", "........", "#......#", "GGG.GGGG"],
    ["........", "........", "...##...", "...##...", "........", "..KDK...", "........", "........", "........"],
  ];
  let moves = 0;
  let shuffles = 0;
  for (let round = 0; moves < 2000; round += 1) {
    const mask = masks[round % masks.length];
    const b = board(mask, null, { kinds: ALL.slice(0, 4 + (round % 3)), seed: `losowo-${round}` });
    for (let step = 0; step < 40 && moves < 2000; step += 1) {
      const options = listMoves(b);
      assert.ok(options.length > 0, `brak ruchów (runda ${round})`);
      const choice = options[(round * 31 + step * 17) % options.length];
      const before = b.cells.filter((cell) => cell.block).reduce((sum, cell) => sum + cell.block.layers, 0);
      const result = choice.type === "tap" ? tapSpecial(b, choice.a) : trySwap(b, choice.a, choice.b);
      assert.equal(result.valid, true);
      assert.ok(!result.stats.guard, "bezpiecznik kaskad");
      if (result.stats.shuffled) shuffles += 1;
      const problems = checkInvariants(b);
      assert.deepEqual(
        problems,
        [],
        `runda ${round}, ruch ${step}: ${problems.join(", ")}\n${boardToText(b).join("\n")}`,
      );
      const after = b.cells.filter((cell) => cell.block).reduce((sum, cell) => sum + cell.block.layers, 0);
      assert.ok(after <= before + 1, "warstw przybywa najwyżej o jedną (karteczka z telefonu)");
      moves += 1;
    }
  }
  assert.ok(shuffles < moves / 20, `mieszań: ${shuffles}`);
});

test("cele słowami i polska liczba mnoga", () => {
  assert.equal(plural(1, ["a", "b", "c"]), "a");
  assert.equal(plural(3, ["a", "b", "c"]), "b");
  assert.equal(plural(12, ["a", "b", "c"]), "c");
  assert.equal(plural(22, ["a", "b", "c"]), "b");
  assert.equal(goalText({ type: "collect", kind: "truskawka", count: 20 }), "Zbierz 20 truskawek");
  assert.equal(goalText({ type: "collect", kind: "lisc", count: 10 }), "Zbierz 10 Liści Monstery");
  assert.equal(goalText({ type: "notes", count: 6 }), "Zerwij 6 karteczek Pracu");
  assert.equal(goalText({ type: "crates", count: 3 }), "Rozbij 3 skrzynie Amic");
  assert.equal(goalText({ type: "eggs", count: 2 }), "Sprowadź 2 jajka do gniazda");
  assert.equal(goalText({ type: "phones", count: 1 }), "Wyłącz 1 telefon Pracu");
  assert.equal(goalText({ type: "score", count: 1500 }), "Zdobądź 1500 punktów");
  assert.match(goalText({ type: "score", count: 12500 }), /^Zdobądź 12\s500 punktów$/);
});
