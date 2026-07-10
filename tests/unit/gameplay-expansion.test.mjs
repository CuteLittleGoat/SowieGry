import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const gameIndexes = [
  "SowaRunner/index.html",
  "SowaJumper/index.html",
  "Sowa3/index.html",
  "SowieOgrody/index.html",
  "SowiaSzklarnia/index.html",
];

test("katalog instrukcji obejmuje dokładnie pięć gier", () => {
  const source = read("shared/game-guides.js");
  for (const id of ["runner", "jumper", "sowa3", "ogrody", "szklarnia"]) {
    assert.match(source, new RegExp(`\\b${id}:\\s*\\{`));
  }
  assert.match(source, /goal:/);
  assert.match(source, /controls:/);
  assert.match(source, /tips:/);
});

test("menu główne tworzy przycisk instrukcji przy każdej karcie", () => {
  const menu = read("shared/main-menu.js");
  assert.match(menu, /data\.gameGuide = game\.id/);
  assert.match(menu, /Jak grać w/);
  assert.match(read("index.html"), /shared\/game-guides\.js/);
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

test("rozszerzenia zawierają mechanikę dla każdej gry", () => {
  const source = read("shared/gameplay-expansion.js");
  assert.match(source, /initializeRunner/);
  assert.match(source, /initializeJumper/);
  assert.match(source, /initializeSowa3/);
  assert.match(source, /initializeGardens/);
  assert.match(source, /initializeGreenhouse/);
  assert.match(source, /Seria liści/);
  assert.match(source, /Precyzyjne lądowania/);
  assert.match(source, /Combo liści/);
  assert.match(source, /Kontrakty/);
  assert.match(source, /Album cech/);
});
