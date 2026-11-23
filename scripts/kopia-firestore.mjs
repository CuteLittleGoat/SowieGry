// Kopia zapasowa i przeniesienie danych SowieGry między projektami Firestore — na darmowym planie (Spark), bez
// eksportu Google Cloud: wszystko przez REST API Firestore z kluczem aplikacji internetowej (jak sama gra), więc
// o dostępie decydują reguły bazy. Kopiowane są tylko kolekcje SowieGry: sowiegry/meta, sowiegry/profil,
// sowiegry/profil/sowiegry_gry/<gra> i ich podkolekcje sowiegry_historia — wartości pól 1:1 (także znaczniki czasu).
//
// Skrypt NIGDY niczego nie kasuje: w projekcie źródłowym tylko czyta, w docelowym tylko tworzy brakujące dokumenty
// (warunek „dokument nie istnieje” — istniejące zostają nietknięte, a skrypt je zgłasza).
//
//   node scripts/kopia-firestore.mjs eksport  --projekt P --klucz K [--plik kopia.json]
//   node scripts/kopia-firestore.mjs import   --projekt P --klucz K --plik kopia.json [--proba]
//   node scripts/kopia-firestore.mjs porownaj --projekt P --klucz K --plik kopia.json
//   node scripts/kopia-firestore.mjs kopiuj   --z P1 --klucz-z K1 --do P2 --klucz-do K2 [--plik kopia.json] [--proba]
//
// --emulator 127.0.0.1:8080 — emulator Firestore zamiast chmury (testy); --wlasciciel — z uprawnieniami właściciela
// emulatora (z pominięciem reguł; tylko emulator). --proba — pokazuje, co zostałoby utworzone, nic nie zapisuje.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const FORMAT = "sowiegry-kopia-firestore";
export const VERSION = 1;
// Gry z reguł Firestore (`sowiegry_gry/{gra}`) — dokumenty innych gier reguły i tak by odrzuciły.
export const GAME_IDS = Object.freeze(["runner", "jumper", "sowa3", "ogrody", "szklarnia", "trojki"]);
const BATCH = 200;

const GAMES = GAME_IDS.join("|");
const ALLOWED = [
  /^sowiegry\/(meta|profil)$/,
  new RegExp(`^sowiegry/profil/sowiegry_gry/(${GAMES})$`),
  new RegExp(`^sowiegry/profil/sowiegry_gry/(${GAMES})/sowiegry_historia/[^/]+$`),
];

/** Czy ścieżka należy do danych SowieGry dopuszczonych przez reguły. */
export const allowedPath = (path) => ALLOWED.some((pattern) => pattern.test(path));

// Kolejność zapisu: meta, profil, dokumenty gier, historia (rodzic przed dziećmi — czytelniej w konsoli).
const rank = (path) =>
  path === "sowiegry/meta" ? 0 : path === "sowiegry/profil" ? 1 : path.includes("historia") ? 3 : 2;
export const sortPaths = (paths) => [...paths].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

// JSON z kluczami w stałej kolejności — suma kontrolna i porównania niezależne od kolejności pól z serwera.
export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])]),
    );
  }
  return value;
}

export const checksum = (documents) =>
  createHash("sha256")
    .update(JSON.stringify(canonical(Object.fromEntries(Object.entries(documents).map(([p, d]) => [p, d.fields])))))
    .digest("hex");

// ---------- REST ----------

export function createClient({ project, key = "", emulator = null, owner = false, fetchImpl = globalThis.fetch }) {
  if (!project) throw new Error("Brak --projekt");
  const root = emulator ? `http://${emulator}` : "https://firestore.googleapis.com";
  const database = `projects/${project}/databases/(default)`;
  const base = `${root}/v1/${database}/documents`;
  const headers = { "Content-Type": "application/json" };
  if (emulator && owner) headers.Authorization = "Bearer owner";
  const withKey = (url) =>
    key && !emulator ? `${url}${url.includes("?") ? "&" : "?"}key=${encodeURIComponent(key)}` : url;

  async function call(url, options = {}) {
    const response = await fetchImpl(withKey(url), { ...options, headers });
    if (response.status === 404) return null;
    const text = await response.text();
    if (!response.ok) {
      let message = text;
      try {
        message = JSON.parse(text).error?.message || text;
      } catch {
        // zwykły tekst
      }
      const error = new Error(`Firestore ${response.status}: ${message}`);
      error.status = response.status;
      throw error;
    }
    return text ? JSON.parse(text) : {};
  }

  return {
    project,
    database,
    /** Pełna nazwa dokumentu w projekcie. */
    name: (path) => `${database}/documents/${path}`,
    /** Ścieżka względna (sowiegry/…) z pełnej nazwy dokumentu. */
    relative: (name) => name.slice(name.indexOf("/documents/") + "/documents/".length),
    getDocument: (path) => call(`${base}/${path}`),
    async listDocuments(collection) {
      const documents = [];
      let token = "";
      for (let page = 0; page < 1000; page += 1) {
        const url = `${base}/${collection}?pageSize=300${token ? `&pageToken=${encodeURIComponent(token)}` : ""}`;
        const result = await call(url);
        documents.push(...(result?.documents || []));
        token = result?.nextPageToken || "";
        if (!token) break;
      }
      return documents;
    },
    /** Zapis zbiorczy (atomowy) — `writes` w formacie REST API. */
    commit: (writes) => call(`${base}:commit`, { method: "POST", body: JSON.stringify({ writes }) }),
  };
}

// ---------- Eksport ----------

/** Wszystkie dokumenty SowieGry z projektu → `{ ścieżka: { fields, updateTime } }`. Tylko odczyt. */
export async function readAll(client) {
  const documents = {};
  const add = (doc) => {
    if (!doc) return;
    documents[client.relative(doc.name)] = { fields: doc.fields || {}, updateTime: doc.updateTime || null };
  };
  add(await client.getDocument("sowiegry/meta"));
  add(await client.getDocument("sowiegry/profil"));
  const games = await client.listDocuments("sowiegry/profil/sowiegry_gry");
  games.forEach(add);
  // Historia także gier bez dokumentu (gdyby dokument gry zniknął, a wpisy zostały).
  const ids = new Set([...GAME_IDS, ...games.map((doc) => client.relative(doc.name).split("/").pop())]);
  for (const id of ids) {
    const history = await client.listDocuments(`sowiegry/profil/sowiegry_gry/${id}/sowiegry_historia`);
    history.forEach(add);
  }
  return documents;
}

export function summarize(documents) {
  const paths = Object.keys(documents);
  const history = {};
  for (const path of paths) {
    const match = path.match(/sowiegry_gry\/([^/]+)\/sowiegry_historia\//);
    if (match) history[match[1]] = (history[match[1]] || 0) + 1;
  }
  return {
    dokumenty: paths.length,
    meta: paths.includes("sowiegry/meta"),
    profil: paths.includes("sowiegry/profil"),
    gry: paths
      .filter((path) => /^sowiegry\/profil\/sowiegry_gry\/[^/]+$/.test(path))
      .map((path) => path.split("/").pop())
      .sort(),
    historia: history,
  };
}

export async function exportBackup(client, { now = () => new Date() } = {}) {
  const documents = await readAll(client);
  return {
    format: FORMAT,
    wersja: VERSION,
    utworzono: now().toISOString(),
    zrodlo: { projekt: client.project },
    liczby: summarize(documents),
    suma: checksum(documents),
    dokumenty: Object.fromEntries(sortPaths(Object.keys(documents)).map((path) => [path, documents[path]])),
  };
}

export function validateBackup(backup) {
  const problems = [];
  if (!backup || backup.format !== FORMAT) problems.push("to nie jest kopia SowieGry (pole format)");
  else {
    if (backup.wersja !== VERSION) problems.push(`nieznana wersja kopii: ${backup.wersja}`);
    if (!backup.dokumenty || typeof backup.dokumenty !== "object") problems.push("brak dokumentów");
    else if (checksum(backup.dokumenty) !== backup.suma)
      problems.push("suma kontrolna się nie zgadza (plik zmieniony?)");
    if (!backup.dokumenty?.["sowiegry/profil"]) problems.push("kopia nie ma profilu (sowiegry/profil)");
  }
  return problems;
}

// ---------- Import ----------

/**
 * Plan importu: dokumenty z kopii, których w celu nie ma (do utworzenia), te, które już są (zostają nietknięte),
 * i spoza danych SowieGry (pominięte).
 */
export function planImport(backup, existing) {
  const create = [];
  const skipped = [];
  const outside = [];
  for (const path of sortPaths(Object.keys(backup.dokumenty))) {
    if (!allowedPath(path)) outside.push(path);
    else if (existing[path]) skipped.push(path);
    else create.push(path);
  }
  return { create, skipped, outside };
}

export function createWrites(client, backup, paths) {
  return paths.map((path) => ({
    update: { name: client.name(path), fields: backup.dokumenty[path].fields },
    currentDocument: { exists: false },
  }));
}

/** Porównanie kopii z danymi w projekcie: brakujące i różne dokumenty (pola 1:1), dodatkowe w projekcie. */
export function compareDocuments(expected, actual) {
  const missing = [];
  const different = [];
  for (const [path, doc] of Object.entries(expected)) {
    if (!actual[path]) missing.push(path);
    else if (JSON.stringify(canonical(doc.fields)) !== JSON.stringify(canonical(actual[path].fields)))
      different.push(path);
  }
  const extra = Object.keys(actual).filter((path) => !expected[path]);
  return { missing, different, extra, same: missing.length === 0 && different.length === 0 };
}

export async function importBackup(client, backup, { dryRun = false, log = () => {} } = {}) {
  const problems = validateBackup(backup);
  if (problems.length) throw new Error(`Kopia odrzucona: ${problems.join("; ")}`);
  const existing = await readAll(client);
  const plan = planImport(backup, existing);
  log(
    `Projekt ${client.project}: do utworzenia ${plan.create.length}, już są (zostają) ${plan.skipped.length}, poza SowieGry ${plan.outside.length}`,
  );
  if (dryRun || !plan.create.length) return { ...plan, written: 0 };
  let written = 0;
  for (let start = 0; start < plan.create.length; start += BATCH) {
    const chunk = plan.create.slice(start, start + BATCH);
    await client.commit(createWrites(client, backup, chunk));
    written += chunk.length;
    log(`  zapisano ${written} / ${plan.create.length}`);
  }
  return { ...plan, written };
}

// ---------- Wiersz poleceń ----------

function options(argv) {
  const result = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) result._.push(arg);
    else if (["--proba", "--wlasciciel"].includes(arg)) result[arg.slice(2)] = true;
    else result[arg.slice(2)] = argv[(index += 1)];
  }
  return result;
}

async function main(argv) {
  const args = options(argv);
  const command = args._[0];
  const emulator = args.emulator || null;
  const owner = Boolean(args.wlasciciel);
  const log = (text) => console.log(text);
  const fileName = args.plik || `sowiegry-kopia-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.json`;
  const report = (label, documents) => {
    const counts = summarize(documents);
    log(
      `${label}: ${counts.dokumenty} dokumentów — meta: ${counts.meta ? "tak" : "nie"}, profil: ${counts.profil ? "tak" : "nie"}, gry: ${counts.gry.join(", ") || "—"}, historia: ${JSON.stringify(counts.historia)}`,
    );
  };
  if (command === "eksport") {
    const client = createClient({ project: args.projekt, key: args.klucz, emulator, owner });
    const backup = await exportBackup(client);
    writeFileSync(fileName, `${JSON.stringify(backup, null, 2)}\n`);
    report(`Kopia ${client.project} → ${fileName}`, backup.dokumenty);
    return;
  }
  if (command === "import" || command === "porownaj") {
    const backup = JSON.parse(readFileSync(args.plik, "utf8"));
    const problems = validateBackup(backup);
    if (problems.length) throw new Error(`Kopia odrzucona: ${problems.join("; ")}`);
    const client = createClient({ project: args.projekt, key: args.klucz, emulator, owner });
    if (command === "import") await importBackup(client, backup, { dryRun: Boolean(args.proba), log });
    const after = await readAll(client);
    const comparison = compareDocuments(backup.dokumenty, after);
    report(`Projekt ${client.project}`, after);
    log(
      comparison.same
        ? "Porównanie: wszystkie dokumenty z kopii są w projekcie, pola zgodne 1:1."
        : `Porównanie: brakuje ${comparison.missing.length}, różnych ${comparison.different.length}: ${[...comparison.missing, ...comparison.different].join(", ")}`,
    );
    if (comparison.extra.length)
      log(`W projekcie są też dokumenty spoza kopii (${comparison.extra.length}) — nietknięte.`);
    if (!comparison.same && !args.proba) process.exitCode = 1;
    return;
  }
  if (command === "kopiuj") {
    const source = createClient({ project: args.z, key: args["klucz-z"], emulator, owner });
    const target = createClient({ project: args.do, key: args["klucz-do"], emulator, owner });
    const backup = await exportBackup(source);
    writeFileSync(fileName, `${JSON.stringify(backup, null, 2)}\n`);
    report(`Źródło ${source.project} (kopia w ${fileName})`, backup.dokumenty);
    await importBackup(target, backup, { dryRun: Boolean(args.proba), log });
    const after = await readAll(target);
    const comparison = compareDocuments(backup.dokumenty, after);
    report(`Cel ${target.project}`, after);
    log(
      comparison.same
        ? "Porównanie: cel ma wszystkie dokumenty źródła, pola zgodne 1:1."
        : `Porównanie: brakuje ${comparison.missing.length}, różnych ${comparison.different.length}`,
    );
    if (!comparison.same && !args.proba) process.exitCode = 1;
    return;
  }
  console.log(
    "Użycie: node scripts/kopia-firestore.mjs eksport|import|porownaj|kopiuj … (opis na początku pliku scripts/kopia-firestore.mjs)",
  );
  process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}
