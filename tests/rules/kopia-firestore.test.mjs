// Kopia i przeniesienie danych SowieGry (scripts/kopia-firestore.mjs) na emulatorze Firestore z regułami nowego
// projektu (firestore.rules): źródło tylko czytane, cel — tylko tworzenie brakujących dokumentów, bez kasowania;
// dane innej aplikacji i gry spoza reguł zostają; ponowne uruchomienie niczego nie zmienia.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  compareDocuments,
  createClient,
  exportBackup,
  importBackup,
  readAll,
  validateBackup,
} from "../../scripts/kopia-firestore.mjs";

const EMULATOR = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const stamp = Date.now().toString(36);
const SOURCE = `demo-kopia-zrodlo-${stamp}`;
const TARGET = `demo-kopia-cel-${stamp}`;

const value = (input) => {
  if (input === null) return { nullValue: null };
  if (input instanceof Date) return { timestampValue: input.toISOString() };
  if (typeof input === "boolean") return { booleanValue: input };
  if (typeof input === "number")
    return Number.isInteger(input) ? { integerValue: String(input) } : { doubleValue: input };
  if (typeof input === "string") return { stringValue: input };
  if (Array.isArray(input)) return { arrayValue: { values: input.map(value) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(input).map(([key, entry]) => [key, value(entry)])) } };
};

// Dane źródła zapisane z uprawnieniami właściciela emulatora (jak dane w bazie produkcyjnej).
async function seed(path, data) {
  const response = await fetch(`http://${EMULATOR}/v1/projects/${SOURCE}/databases/(default)/documents/${path}`, {
    method: "PATCH",
    headers: { Authorization: "Bearer owner", "Content-Type": "application/json" },
    body: JSON.stringify({ fields: value(data).mapValue.fields }),
  });
  assert.equal(response.ok, true, await response.text());
}

test("kopia SowieGry: wszystko 1:1 do pustego projektu, bez kasowania, ponowne uruchomienie bez zmian", async () => {
  const when = new Date("2026-11-20T10:00:00.000Z");
  await seed("sowiegry/meta", { schemaVersion: 1, createdAt: when, games: ["runner", "ogrody"] });
  await seed("sowiegry/profil", {
    schemaVersion: 1,
    updatedAt: when,
    academy: { xp: 1234, feathers: 56.5, achievements: { "pierwsze-kroki": when } },
    cosmetics: { selected: "bow", unlocked: ["none", "bow"] },
    records: { runner: { arcade: { bestScore: 900 } } },
    gallery: { unlocked: ["owl-01", "owl-44"], favorite: null },
  });
  await seed("sowiegry/profil/sowiegry_gry/runner", { top10: { arcade: [{ score: 900, at: when }] }, historyCount: 2 });
  await seed("sowiegry/profil/sowiegry_gry/ogrody", { state: JSON.stringify({ version: 3, leaves: 10 }), rev: 7 });
  await seed("sowiegry/profil/sowiegry_gry/runner/sowiegry_historia/a1", { score: 900, at: when });
  await seed("sowiegry/profil/sowiegry_gry/runner/sowiegry_historia/a2", { score: 450.5, at: when });
  await seed("sowiegry/profil/sowiegry_gry/tetris", { x: 1 });
  await seed("audio/favorites", { list: [1, 2] });

  // Źródło czytane jak przez grę (bez uprawnień właściciela) — reguły dopuszczają odczyt SowieGry.
  const source = createClient({ project: SOURCE, emulator: EMULATOR });
  const target = createClient({ project: TARGET, emulator: EMULATOR });
  const backup = await exportBackup(source);
  assert.deepEqual(validateBackup(backup), []);
  assert.equal(backup.liczby.profil, true);
  assert.deepEqual(backup.liczby.gry, ["ogrody", "runner", "tetris"]);
  assert.deepEqual(backup.liczby.historia, { runner: 2 });
  assert.equal(backup.dokumenty["audio/favorites"], undefined, "dane innej aplikacji nie trafiają do kopii");

  const first = await importBackup(target, backup);
  assert.equal(first.written, 6);
  assert.deepEqual(first.outside, ["sowiegry/profil/sowiegry_gry/tetris"], "gra spoza reguł — pominięta");
  const after = await readAll(target);
  const comparison = compareDocuments(backup.dokumenty, after);
  assert.deepEqual(comparison.missing, ["sowiegry/profil/sowiegry_gry/tetris"]);
  assert.deepEqual(comparison.different, []);
  // Znaczniki czasu i liczby z ułamkiem 1:1.
  assert.equal(Date.parse(after["sowiegry/profil"].fields.updatedAt.timestampValue), when.getTime());
  assert.deepEqual(after["sowiegry/profil"].fields.updatedAt, backup.dokumenty["sowiegry/profil"].fields.updatedAt);
  assert.equal(after["sowiegry/profil"].fields.academy.mapValue.fields.feathers.doubleValue, 56.5);

  // Ponowne uruchomienie: nic do utworzenia, istniejące dokumenty nietknięte.
  const second = await importBackup(target, backup);
  assert.equal(second.written, 0);
  assert.equal(second.skipped.length, 6);

  // Źródło bez zmian (tylko odczyt).
  const sourceAfter = await readAll(source);
  assert.equal(compareDocuments(backup.dokumenty, sourceAfter).same, true);
});

test("kopia z błędną sumą kontrolną albo bez profilu jest odrzucana", async () => {
  const source = createClient({ project: SOURCE, emulator: EMULATOR });
  const backup = await exportBackup(source);
  const changed = structuredClone(backup);
  changed.dokumenty["sowiegry/profil"].fields.schemaVersion = { integerValue: "2" };
  assert.match(validateBackup(changed).join(), /suma kontrolna/);
  await assert.rejects(importBackup(createClient({ project: TARGET, emulator: EMULATOR }), changed), /odrzucona/);
  assert.match(validateBackup({ format: "inny" }).join(), /to nie jest kopia/);
});
