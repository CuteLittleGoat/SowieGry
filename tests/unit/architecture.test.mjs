import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

const read = (path) => readFile(path, "utf8");

// Obecne gry na starym interfejsie (SowieCore, wspólny menedżer powiadomień, okno Rekordów).
const legacyGamePages = ["SowieOgrody/index.html", "SowiaSzklarnia/index.html"];
// Wszystkie gry z rejestru: Sowia Ucieczka (E4, moduły ES na Sowim Silniku; zastąpiła SowaRunner), Sowie Tory
// (E5, zastąpiły Sowa3), Sowa w Chmurach (E6, zastąpiła SowaJumper), podgląd Łącz i Hoduj (E8) oraz obecne gry.
const newGamePages = [
  "SowiaUcieczka/index.html",
  "SowieTory/index.html",
  "SowaWChmurach/index.html",
  "LaczIHoduj/index.html",
];
// Podgląd nowej odsłony Sowich Ogrodów (E7) w tym samym folderze: moduł ogrod/main.js.
const previewPages = ["SowieOgrody/nowa.html"];
const gamePages = [...newGamePages, ...previewPages, ...legacyGamePages];

test("centralny rejestr zawiera dokładnie pięć gier", async () => {
  const platform = await read("shared/sowie-platform.js");
  const ids = [...platform.matchAll(/^\s*(?:\{ )?id: "(runner|jumper|sowa3|ogrody|szklarnia)"/gm)].map(
    (match) => match[1],
  );
  assert.deepEqual(ids, ["runner", "jumper", "sowa3", "ogrody", "szklarnia"]);
});

test("menu główne jest generowane wyłącznie z centralnego rejestru", async () => {
  const html = await read("index.html");
  const games = await read("shared/menu/games.js");

  assert.match(html, /data-game-path/);
  assert.match(html, /shared\/sowie-platform\.js/);
  assert.match(html, /<script type="module" src="shared\/menu\/menu\.js"><\/script>/);
  assert.doesNotMatch(html, /class="game-card"/);
  assert.match(games, /platform\.GAME_REGISTRY\.map/);
  assert.doesNotMatch(games, /document\.write/);
  // Stare menu (Analiza 2, rozdz. 4.1: „zastępuje main-menu.js / main-menu.css”) zostało usunięte.
  await assert.rejects(read("shared/main-menu.js"));
  await assert.rejects(read("shared/main-menu.css"));
  assert.doesNotMatch(html, /sowie-core\.js|main-menu|game-guides\.js/);
});

test("wszystkie gry ładują platformę; obecne gry — wspólny menedżer powiadomień", async () => {
  for (const path of gamePages) {
    assert.match(await read(path), /shared\/sowie-platform\.js/, `${path} nie ładuje SowiePlatform`);
  }
  // Sowia Ucieczka: komunikaty z shared/ui (toasts.js), moduł ES main.js.
  for (const path of newGamePages) {
    assert.match(await read(path), /<script type="module" src="main\.js"><\/script>/, path);
  }
  for (const path of previewPages) {
    assert.match(await read(path), /<script type="module" src="ogrod\/main\.js"><\/script>/, path);
  }
  for (const path of legacyGamePages) {
    const html = await read(path);
    assert.match(html, /shared\/notification-manager\.js/, `${path} nie ładuje wspólnych powiadomień`);
    assert.doesNotMatch(html, /Sowa3\/notification-manager\.js/, `${path} zależy od katalogu innej gry`);
  }
});

test("runtime nie podmienia metod SowieCore", async () => {
  const runtime = await read("shared/sowie-runtime.js");
  assert.doesNotMatch(runtime, /core\.(registerGame|play|recordStat|progressMission)\s*=/);
  await assert.rejects(read("SowieOgrody/ogrody-runtime.js"));
});

// Wszystkie pliki JavaScript gier, modułów wspólnych (także podkatalogów), Laboratorium i service worker.
async function projectScripts() {
  const folders = [
    "shared",
    "config",
    "lab",
    "SowiaUcieczka",
    "SowieTory",
    "SowaWChmurach",
    "LaczIHoduj",
    "SowieOgrody",
    "SowiaSzklarnia",
  ];
  const files = ["sw.js"];
  async function walk(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = join(folder, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.name.endsWith(".js") && !/^p5(\.sound\.min)?\.js$/.test(entry.name)) files.push(file);
    }
  }
  for (const folder of folders) await walk(folder);
  return files;
}

test("localStorage i sessionStorage są używane tylko w shared/sowie-cloud.js", async () => {
  const offenders = [];
  for (const file of await projectScripts()) {
    if (file === join("shared", "sowie-cloud.js")) continue;
    if (/\b(localStorage|sessionStorage)\b/.test(await read(file))) offenders.push(file);
  }
  assert.deepEqual(offenders, []);
});

test("stare moduły zapisu lokalnego zostały usunięte", async () => {
  await assert.rejects(read("shared/progress-reset.js"));
  await assert.rejects(read("shared/idle-save-bridge.js"));
  for (const path of ["index.html", ...gamePages]) {
    const html = await read(path);
    assert.doesNotMatch(html, /progress-reset\.js|idle-save-bridge\.js/, path);
  }
  const platform = await read("shared/sowie-platform.js");
  for (const removed of ["migrateProfile", "backupValue", "exportData", "importData", "readProfile", "writeProfile"]) {
    assert.doesNotMatch(platform, new RegExp(removed), `sowie-platform.js nadal zawiera ${removed}`);
  }
  const core = await read("shared/sowie-core.js");
  assert.doesNotMatch(core, /Eksportuj zapis|Importuj zapis/);
  assert.match(core, /Wyloguj to urządzenie/);
});

test("każda strona ładuje config, platformę, SowieCloud i ekran hasła w tej kolejności", async () => {
  for (const path of ["index.html", ...gamePages]) {
    const html = await read(path);
    const order = [
      "config/firebase-config.js",
      "shared/sowie-platform.js",
      "shared/sowie-cloud.js",
      "shared/password-gate.js",
    ];
    const positions = order.map((file) => html.indexOf(file));
    assert.ok(
      positions.every((position) => position > 0),
      `${path}: brak skryptu z ${order.join(", ")}`,
    );
    assert.deepEqual(
      [...positions].sort((a, b) => a - b),
      positions,
      `${path}: zła kolejność skryptów`,
    );
    // Obecne gry: SowieCloud przed SowieCore. Menu, Sowia Ucieczka i Sowie Tory (bez SowieCore): przed Akademią.
    const later = legacyGamePages.includes(path) ? "shared/sowie-core.js" : "shared/sowie-academy.js";
    assert.ok(positions[3] < html.indexOf(later), `${path}: SowieCloud musi być przed ${later}`);
    if (path === "index.html") assert.ok(html.indexOf("shared/owl-gallery.js") < html.indexOf("shared/menu/menu.js"));
  }
});

test("SowieCloud kasuje tylko klucze SowieGry z listy i nigdy nie czyści całej pamięci", async () => {
  const cloud = await read("shared/sowie-cloud.js");
  assert.doesNotMatch(cloud, /(localStorage|sessionStorage|storage)\.clear\(/);
  assert.match(cloud, /storage\.removeItem\(key\)/);
  assert.match(cloud, /const HASLO_GRACZA = "huhu"/);
  assert.match(cloud, /const DEVICE_KEY = "sowiegry:urzadzenie"/);
  assert.match(cloud, /firebasejs\/\$\{SDK_VERSION\}/);
  assert.match(cloud, /initializeApp\(config, APP_NAME\)/);
  assert.match(cloud, /persistentLocalCache/);
  for (const collection of ["sowiegry/meta", "sowiegry/profil", "sowiegry_gry", "sowiegry_historia"]) {
    assert.match(cloud, new RegExp(collection));
  }
});

test("kod SowieGry pisze tylko w kolekcji sowiegry i jej podkolekcjach", async () => {
  const cloud = await read("shared/sowie-cloud.js");
  const paths = [...cloud.matchAll(/`(sowiegry[^`]*)`|"(sowiegry\/[^"]*)"/g)].map((match) => match[1] || match[2]);
  assert.ok(paths.length >= 4);
  for (const path of paths) {
    const collections = path.split("/").filter((_, index) => index % 2 === 0);
    assert.ok(
      collections.every((name) => ["sowiegry", "sowiegry_gry", "sowiegry_historia"].includes(name)),
      `nieoczekiwana ścieżka ${path}`,
    );
  }
  for (const file of await projectScripts()) {
    if (file === join("shared", "sowie-cloud.js")) continue;
    assert.doesNotMatch(await read(file), /getFirestore|initializeFirestore|writeBatch|setDoc\(|getDocs?\(/, file);
  }
});

test("każda obecna gra ma okno Rekordów zasilane przez SowieCloud", async () => {
  const records = await read("shared/records.js");
  assert.match(records, /cloud\.history\(gameId, 10\)/);
  assert.match(records, /top10/);
  assert.match(records, /dailyBest/);
  // Sowia Ucieczka: rekordy na ekranie tytułowym i wyników oraz w menu (zakładka „Sowa”).
  for (const path of legacyGamePages) {
    const html = await read(path);
    assert.ok(
      html.indexOf("shared/records.js") > html.indexOf("shared/game-guides.js"),
      `${path}: brak records.js po game-guides.js`,
    );
  }
});

test("gry idle korzystają ze stabilnego panelu, obsługi modali i zapisu SowieCloud", async () => {
  for (const [path, script, gameId] of [
    ["SowieOgrody/index.html", "SowieOgrody/script.js", "ogrody"],
    ["SowiaSzklarnia/index.html", "SowiaSzklarnia/script.js", "szklarnia"],
  ]) {
    const html = await read(path);
    assert.match(html, /shared\/stable-panel\.js/);
    assert.match(html, /shared\/modal-accessibility\.js/);
    const source = await read(script);
    assert.match(source, new RegExp(`const GAME_ID = "${gameId}"`));
    assert.match(source, /cloud\.loadGameState\(GAME_ID\)/);
    assert.match(source, /cloud\.saveGameState\(GAME_ID/);
    assert.match(source, /window\.SowieIdleGame = /);
    assert.doesNotMatch(source, /now % 7000/);
  }
});

test("projekt respektuje reduced motion", async () => {
  const css = await read("shared/cute-ui.css");
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /sowie-reduced-effects/);
});

// Podmienione gry: stary folder to tylko przekierowanie (z parametrami adresu) do nowej gry z rejestru.
const REPLACED_GAMES = [
  ["SowaRunner", "SowiaUcieczka", "Sowia Ucieczka"],
  ["Sowa3", "SowieTory", "Sowie Tory"],
  ["SowaJumper", "SowaWChmurach", "Sowa w Chmurach"],
];

for (const [oldFolder, newFolder, name] of REPLACED_GAMES) {
  test(`${oldFolder}/ to tylko przekierowanie do gry ${name} (stare pliki gry usunięte)`, async () => {
    assert.deepEqual((await readdir(oldFolder)).sort(), ["docs", "index.html"]);
    const html = await read(`${oldFolder}/index.html`);
    assert.ok(html.includes(`<meta http-equiv="refresh" content="0; url=../${newFolder}/"`), oldFolder);
    assert.ok(html.includes(`location.replace(\`../${newFolder}/\${location.search}\${location.hash}\`)`), oldFolder);
    assert.doesNotMatch(html, /<script src=/, "strona przekierowania nie ładuje skryptów (ani SowieCloud)");
    const platform = await read("shared/sowie-platform.js");
    assert.ok(platform.includes(`name: "${name}",\n      path: "${newFolder}/"`), `rejestr: ${name}`);
    assert.ok(!platform.includes(`path: "${oldFolder}/"`), `rejestr nadal wskazuje ${oldFolder}/`);
    assert.ok(!platform.includes(`preview: Object.freeze({ path: "${newFolder}/"`), `${name} nadal jako podgląd`);
  });
}
