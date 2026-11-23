// Kopia i przeniesienie danych SowieGry (scripts/kopia-firestore.mjs) — części bez sieci: dopuszczone ścieżki,
// kolejność zapisu, suma kontrolna niezależna od kolejności pól, sprawdzenie pliku, plan importu (tylko brakujące
// dokumenty), zapisy z warunkiem „nie istnieje” i porównanie kopii z projektem. Test na emulatorze: tests/rules/.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FORMAT,
  VERSION,
  allowedPath,
  checksum,
  compareDocuments,
  createClient,
  createWrites,
  planImport,
  sortPaths,
  summarize,
  validateBackup,
} from "../../scripts/kopia-firestore.mjs";

const docs = {
  "sowiegry/profil/sowiegry_gry/runner/sowiegry_historia/a": { fields: { score: { integerValue: "5" } } },
  "sowiegry/profil/sowiegry_gry/runner": { fields: { historyCount: { integerValue: "1" } } },
  "sowiegry/profil": { fields: { schemaVersion: { integerValue: "1" }, a: { stringValue: "x" } } },
  "sowiegry/meta": { fields: { schemaVersion: { integerValue: "1" } } },
};
const backup = (documents = docs) => ({
  format: FORMAT,
  wersja: VERSION,
  dokumenty: documents,
  suma: checksum(documents),
});

test("dopuszczone ścieżki: tylko dane SowieGry z reguł (6 gier) i ich historia", () => {
  for (const path of [
    "sowiegry/meta",
    "sowiegry/profil",
    "sowiegry/profil/sowiegry_gry/trojki",
    "sowiegry/profil/sowiegry_gry/sowa3/sowiegry_historia/x1",
  ])
    assert.equal(allowedPath(path), true, path);
  for (const path of [
    "sowiegry/inne",
    "sowiegry/profil/sowiegry_gry/tetris",
    "audio/favorites",
    "sowiegry/profil/sowiegry_gry/runner/inne/x",
  ])
    assert.equal(allowedPath(path), false, path);
  assert.deepEqual(sortPaths(Object.keys(docs)), [
    "sowiegry/meta",
    "sowiegry/profil",
    "sowiegry/profil/sowiegry_gry/runner",
    "sowiegry/profil/sowiegry_gry/runner/sowiegry_historia/a",
  ]);
  assert.deepEqual(summarize(docs), {
    dokumenty: 4,
    meta: true,
    profil: true,
    gry: ["runner"],
    historia: { runner: 1 },
  });
});

test("suma kontrolna nie zależy od kolejności pól; plik zmieniony, obcy albo bez profilu jest odrzucany", () => {
  const reordered = {
    "sowiegry/profil": { fields: { a: { stringValue: "x" }, schemaVersion: { integerValue: "1" } } },
    ...docs,
  };
  assert.equal(checksum(reordered), checksum(docs));
  assert.deepEqual(validateBackup(backup()), []);
  const changed = backup();
  changed.dokumenty = { ...docs, "sowiegry/meta": { fields: { schemaVersion: { integerValue: "2" } } } };
  assert.match(validateBackup(changed).join(), /suma kontrolna/);
  assert.match(validateBackup({ format: "x" }).join(), /to nie jest kopia/);
  const withoutProfile = { ...docs };
  delete withoutProfile["sowiegry/profil"];
  assert.match(validateBackup(backup(withoutProfile)).join(), /profilu/);
});

test("plan importu: tylko brakujące dokumenty, istniejące zostają, spoza SowieGry pominięte; zapis z warunkiem", () => {
  const withOutside = { ...docs, "sowiegry/profil/sowiegry_gry/tetris": { fields: {} } };
  const plan = planImport(backup(withOutside), { "sowiegry/profil": { fields: {} } });
  assert.deepEqual(plan.skipped, ["sowiegry/profil"]);
  assert.deepEqual(plan.outside, ["sowiegry/profil/sowiegry_gry/tetris"]);
  assert.deepEqual(plan.create, [
    "sowiegry/meta",
    "sowiegry/profil/sowiegry_gry/runner",
    "sowiegry/profil/sowiegry_gry/runner/sowiegry_historia/a",
  ]);
  const client = createClient({ project: "sowiegry-test", key: "k", fetchImpl: () => null });
  const [write] = createWrites(client, backup(), ["sowiegry/meta"]);
  assert.deepEqual(write, {
    update: {
      name: "projects/sowiegry-test/databases/(default)/documents/sowiegry/meta",
      fields: { schemaVersion: { integerValue: "1" } },
    },
    currentDocument: { exists: false },
  });
  assert.equal(client.relative(write.update.name), "sowiegry/meta");
});

test("porównanie: brakujące, różne i dodatkowe dokumenty; kolejność pól bez znaczenia", () => {
  const actual = {
    "sowiegry/meta": { fields: { schemaVersion: { integerValue: "1" } } },
    "sowiegry/profil": { fields: { a: { stringValue: "y" }, schemaVersion: { integerValue: "1" } } },
    "sowiegry/profil/sowiegry_gry/ogrody": { fields: {} },
  };
  const result = compareDocuments(docs, actual);
  assert.deepEqual(result.missing.sort(), [
    "sowiegry/profil/sowiegry_gry/runner",
    "sowiegry/profil/sowiegry_gry/runner/sowiegry_historia/a",
  ]);
  assert.deepEqual(result.different, ["sowiegry/profil"]);
  assert.deepEqual(result.extra, ["sowiegry/profil/sowiegry_gry/ogrody"]);
  assert.equal(result.same, false);
  assert.equal(compareDocuments(docs, docs).same, true);
});
