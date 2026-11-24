import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(path, "utf8");

// Kopia reguł w repo = reguły do publikacji z Analizy 7b (Załącznik B, Wypluffki — 2026-11-24). Część „SowieGry”
// jest słowo w słowo taka jak reguły nowego projektu z Analizy PRZENIESIENIE_FIRESTORE.md (rozdz. 3).
test("firestore.rules jest dokładną kopią reguł z Analizy 7b (Załącznik B), z częścią SowieGry bez zmian", async () => {
  const analysis = await read("Analizy/ANALIZA_7b_Mikroplatnosci.md");
  const appendix = analysis.slice(analysis.indexOf("## Załącznik B."), analysis.indexOf("## Załącznik C."));
  const block = appendix.match(/```\n([\s\S]*?)```/);
  assert.ok(block, "Brak bloku reguł w Załączniku B");
  const rules = await read("firestore.rules");
  assert.equal(rules, block[1]);

  const plan = await read("Analizy/PRZENIESIENIE_FIRESTORE.md");
  const section = plan.slice(plan.indexOf("## 3."), plan.indexOf("## 4."));
  const original = section.match(/```\n([\s\S]*?)```/)[1];
  // Reguły nowego projektu bez dwóch ostatnich nawiasów (koniec bloku dokumentów i usługi) — początek nowych reguł.
  const sowiegry = original.slice(0, original.lastIndexOf("  }\n}"));
  assert.ok(rules.startsWith(sowiegry), "część SowieGry bez zmian");
  assert.doesNotMatch(rules, /sciezka=\*\*/, "bez reguły ogólnej starego projektu");
  assert.match(rules, /"szklarnia", "trojki"\]/);
  assert.match(rules, /match \/sowiegry_wypluffki\/portfel/);
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
