import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

// Strony wszystkich gier z rejestru — od E8e żadna nie ładuje dawnych modułów (dok, rozszerzenia, style).
const gameIndexes = [
  "SowiaUcieczka/index.html",
  "SowieTory/index.html",
  "SowaWChmurach/index.html",
  "SowieOgrody/index.html",
  "LaczIHoduj/index.html",
];

test("katalog instrukcji (shared/meta/guides-data.js) obejmuje pięć gier i „Poznaj Sowi Świat”", async () => {
  const { GUIDES } = await import("../../shared/meta/guides-data.js");
  // Klucze = identyfikatory gier: `sowa3` to Sowie Tory (E5f), `jumper` — Sowa w Chmurach (E6f), `ogrody` — nowa
  // odsłona Sowich Ogrodów (E7e), `szklarnia` — Łącz i Hoduj (E8e).
  assert.deepEqual(Object.keys(GUIDES).sort(), ["jumper", "ogrody", "runner", "sowa3", "swiat", "szklarnia"]);
  for (const id of ["runner", "jumper", "sowa3", "ogrody", "szklarnia"]) {
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

test("każda gra ładuje Akademię, a nie dawny dok z instrukcją i rozszerzeniami", () => {
  for (const file of gameIndexes) {
    const html = read(file);
    assert.match(html, /shared\/sowie-academy\.js/, file);
    assert.doesNotMatch(html, /game-enhancements\.css|game-guides\.js|gameplay-expansion\.js/, file);
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

test("rozszerzenia zawierają mechanikę dla każdej obecnej gry (bez gier podmienionych na nowe)", () => {
  const source = read("shared/gameplay-expansion.js");
  // SowaRunner, Sowa3 i SowaJumper zastąpiły Sowia Ucieczka, Sowie Tory i Sowa w Chmurach (własne zadania i combo).
  assert.doesNotMatch(source, /initializeRunner|sowarunner|initializeSowa3|"sowa3"|initializeJumper|sowajumper/);
  assert.doesNotMatch(source, /data-start-daily|Precyzyjne lądowania/);
  assert.doesNotMatch(source, /initializeGardens|sowieogrody|Kontrakty ogrodnicze/);
  assert.match(source, /initializeGreenhouse/);
  assert.match(source, /Kontrakty/);
  assert.match(source, /Album cech/);
});
