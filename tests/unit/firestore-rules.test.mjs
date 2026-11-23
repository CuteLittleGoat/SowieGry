import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(path, "utf8");

// Kopia reguł w repo musi być identyczna z regułami opublikowanymi 2026-09-27 (Analiza 1, rozdz. 9.2).
test("firestore.rules jest dokładną kopią reguł opublikowanych 2026-11-23 (Analiza 5, Załącznik B)", async () => {
  // Od M5 obowiązują reguły z Analizy 5 (Załącznik B): te z Analizy 1 (rozdz. 9.2) z dopisaną grą „trojki”.
  const analysis = await read("Analizy/ANALIZA_5_Nowa_gra_Sowie_Trojki_match3.md");
  const section = analysis.slice(analysis.indexOf("## Załącznik B"), analysis.indexOf("## Załącznik C"));
  const block = section.match(/```\n([\s\S]*?)```/);
  assert.ok(block, "Brak bloku reguł w Załączniku B");
  assert.equal(await read("firestore.rules"), block[1]);
  const first = await read("Analizy/ANALIZA_1_Firestore_zapis_postepu.md");
  const original = first.slice(first.indexOf("### 9.2"), first.indexOf("### 9.3")).match(/```\n([\s\S]*?)```/)[1];
  assert.equal(block[1], original.replace('"szklarnia"]', '"szklarnia", "trojki"]'), "jedyna różnica: gra trojki");
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
