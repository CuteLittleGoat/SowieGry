import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(path, "utf8");

// Kopia reguł w repo musi być identyczna z regułami opublikowanymi 2026-09-27 (Analiza 1, rozdz. 9.2).
test("firestore.rules jest dokładną kopią reguł nowego projektu (Analizy/PRZENIESIENIE_FIRESTORE.md, rozdz. 3)", async () => {
  // Od 2026-11-23 SowieGry mają własny projekt sowiegry-1e1f9: reguły SowieGry z Analizy 1 (rozdz. 9.2) z grą „trojki”,
  // bez reguły ogólnej dla kolekcji drugiej aplikacji (zostały w starym projekcie).
  const plan = await read("Analizy/PRZENIESIENIE_FIRESTORE.md");
  const section = plan.slice(plan.indexOf("## 3."), plan.indexOf("## 4."));
  const block = section.match(/```\n([\s\S]*?)```/);
  assert.ok(block, "Brak bloku reguł w rozdziale 3");
  assert.equal(await read("firestore.rules"), block[1]);
  assert.doesNotMatch(block[1], /sciezka=\*\*/, "bez reguły ogólnej starego projektu");
  assert.match(block[1], /"szklarnia", "trojki"\]/);
});

test("firebase.json konfiguruje tylko emulator Firestore z plikiem reguł", async () => {
  const config = JSON.parse(await read("firebase.json"));
  assert.deepEqual(Object.keys(config).sort(), ["emulators", "firestore"]);
  assert.equal(config.firestore.rules, "firestore.rules");
  assert.equal(config.emulators.firestore.host, "127.0.0.1");
  assert.equal(config.emulators.firestore.port, 8080);
});

test("testy przeglądarkowe biegną na emulatorze projektu demonstracyjnego", async () => {
  const pkg = JSON.parse(await read("package.json"));
  assert.match(pkg.scripts["test:e2e"], /emulators:exec --only firestore --project demo-sowiegry/);
});
