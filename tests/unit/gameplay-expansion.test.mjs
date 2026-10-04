import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

// Obecne gry na starym interfejsie (Sowia Ucieczka ma własne zadania, wyzwanie dnia i instrukcję).
const gameIndexes = [
  "SowaJumper/index.html",
  "Sowa3/index.html",
  "SowieOgrody/index.html",
  "SowiaSzklarnia/index.html",
];

test("katalog instrukcji (shared/meta/guides-data.js) obejmuje pięć gier i „Poznaj Sowi Świat”", async () => {
  const { GUIDES } = await import("../../shared/meta/guides-data.js");
  // `sowietory` — przewodnik nowej wersji Sowa3 w podglądzie (SowieTory/); po podmianie zastąpi `sowa3`;
  // `chmury` — tak samo Sowa w Chmurach (SowaWChmurach/) zamiast `jumper`; `ogrod` — nowa odsłona Sowich Ogrodów
  // (SowieOgrody/nowa.html) zamiast `ogrody`.
  assert.deepEqual(Object.keys(GUIDES).sort(), [
    "chmury",
    "jumper",
    "ogrod",
    "ogrody",
    "runner",
    "sowa3",
    "sowietory",
    "swiat",
    "szklarnia",
  ]);
  for (const id of ["runner", "jumper", "chmury", "sowa3", "sowietory", "ogrod", "ogrody", "szklarnia"]) {
    assert.ok(GUIDES[id].summary && GUIDES[id].cards.length >= 4, id);
  }
  assert.match(read("shared/game-guides.js"), /meta\/guides-data\.js/);
});

test("menu główne ma przycisk instrukcji przy każdej karcie i zakładkę „Jak grać”", () => {
  const games = read("shared/menu/games.js");
  assert.match(games, /data-guide="\$\{game\.id\}"/);
  assert.match(games, /Jak grać w \$\{game\.name\}\?/);
  assert.match(read("shared/menu/guides.js"), /GUIDE_ORDER/);
  assert.match(read("index.html"), /shared\/sowie-academy\.js/);
});

test("każda gra ładuje instrukcję, Akademię, rozszerzenie i wspólne style", () => {
  for (const file of gameIndexes) {
    const html = read(file);
    assert.match(html, /shared\/game-enhancements\.css/);
    assert.match(html, /shared\/game-guides\.js/);
    assert.match(html, /shared\/sowie-academy\.js/);
    assert.match(html, /shared\/gameplay-expansion\.js/);
  }
});

test("Akademia ma wersjonowany zapis i idempotentne nagrody", () => {
  const source = read("shared/sowie-academy.js");
  assert.match(source, /const VERSION = 2/);
  assert.match(source, /academy\.awards\[id\]/);
  assert.match(source, /daily:/);
  assert.match(source, /weekly:/);
  assert.match(source, /feathers/);
  assert.match(source, /daily\.metrics/);
});

test("rozszerzenia zawierają mechanikę dla każdej obecnej gry (SowaRunner zastąpiła Sowia Ucieczka)", () => {
  const source = read("shared/gameplay-expansion.js");
  assert.doesNotMatch(source, /initializeRunner|sowarunner/);
  assert.match(source, /initializeJumper/);
  assert.match(source, /initializeSowa3/);
  assert.match(source, /initializeGardens/);
  assert.match(source, /initializeGreenhouse/);
  assert.match(source, /Precyzyjne lądowania/);
  assert.match(source, /Combo liści/);
  assert.match(source, /Kontrakty/);
  assert.match(source, /Album cech/);
});
