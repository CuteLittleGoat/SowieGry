import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

const read = (path) => readFile(path, "utf8");

// Wszystkie gry z rejestru (od E8e żadna nie jest na starym interfejsie SowieCore): Sowia Ucieczka (E4, zastąpiła
// SowaRunner), Sowie Tory (E5, zastąpiły Sowa3), Sowa w Chmurach (E6, zastąpiła SowaJumper), Łącz i Hoduj (E8,
// zastąpiła Sowią Szklarnię) — moduł main.js — oraz Sowie Ogrody (E7, nowa odsłona w tym samym folderze).
const newGamePages = [
  "SowiaUcieczka/index.html",
  "SowieTory/index.html",
  "SowaWChmurach/index.html",
  "LaczIHoduj/index.html",
];
// Nowa odsłona Sowich Ogrodów (od E7e główna strona folderu): moduł ogrod/main.js.
const previewPages = ["SowieOgrody/index.html"];
const gamePages = [...newGamePages, ...previewPages];

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
  // Żadna gra nie ładuje już dawnych modułów SowieCore (od E8e).
  for (const path of gamePages) {
    assert.doesNotMatch(await read(path), /sowie-core\.js|notification-manager\.js|game-guides\.js|records\.js/, path);
  }
});

// E9a (Analiza 3, 9.4): dawny interfejs gier (SowieCore z paskiem narzędzi i dokiem, menedżer powiadomień, instrukcje,
// rozszerzenia, okno Rekordów, obsługa modali, runtime) został usunięty — nie ładuje go już żadna strona.
const REMOVED_MODULES = [
  "shared/sowie-core.js",
  "shared/notification-manager.js",
  "shared/game-guides.js",
  "shared/gameplay-expansion.js",
  "shared/records.js",
  "shared/modal-accessibility.js",
  "shared/sowie-runtime.js",
  "shared/sowie-smoke-hook.js",
  "shared/game-enhancements.css",
  "shared/owl-gallery.css",
  "SowieOgrody/ogrody-runtime.js",
  // E9b: Akademia jest modułem shared/meta/academy.js (importuje go SowieProgress).
  "shared/sowie-academy.js",
];

test("dawne moduły interfejsu gier zostały usunięte i nic ich nie ładuje", async () => {
  for (const file of REMOVED_MODULES) await assert.rejects(read(file), file);
  const sw = await read("sw.js");
  for (const path of ["index.html", ...gamePages, "sw.js"]) {
    const source = path === "sw.js" ? sw : await read(path);
    for (const file of REMOVED_MODULES)
      assert.ok(!source.includes(file.replace(/^shared\//, "shared/")), `${path}: ${file}`);
  }
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
  // Wylogowanie urządzenia jest w ustawieniach menu (zakładka „Sowa”); eksportu i importu zapisu nie ma.
  const owlTab = await read("shared/menu/owl-tab.js");
  assert.doesNotMatch(owlTab, /Eksportuj zapis|Importuj zapis/);
  assert.match(owlTab, /Wyloguj to urządzenie/);
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
    // Moduły (menu, gra, a przez SowieProgress — Akademia) po skryptach klasycznych: SowieCloud jest już gotowy.
    assert.ok(positions[3] < html.indexOf('type="module"'), `${path}: SowieCloud musi być przed modułami`);
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

test("gry idle zapisują stan przez SowieCloud (saveGameState z wersją i podsumowaniem)", async () => {
  // Nowe Sowie Ogrody (E7e) i Łącz i Hoduj (E8e): stan w polu `state`, bez dawnych skryptów i stabilnego panelu.
  const garden = await read("SowieOgrody/ogrod/main.js");
  assert.match(garden, /cloud\.saveGameState\(GAME_ID, state, \{ immediate, saveVersion: SAVE_VERSION, summary \}\)/);
  assert.match(garden, /cloud\?\.loadGameState\?\.\(GAME_ID\)/);
  const merge = await read("LaczIHoduj/main.js");
  assert.match(merge, /cloud\.saveGameState\(GAME_ID, state, \{ immediate, saveVersion: SAVE_VERSION, summary \}\)/);
  for (const removed of [
    "SowieOgrody/script.js",
    "SowieOgrody/style.css",
    "SowiaSzklarnia/script.js",
    "SowiaSzklarnia/style.css",
    "shared/stable-panel.js",
  ]) {
    await assert.rejects(read(removed), removed);
  }
  assert.doesNotMatch(await read("SowieOgrody/index.html"), /stable-panel|modal-accessibility|sowie-core/);
  assert.doesNotMatch(await read("LaczIHoduj/index.html"), /stable-panel|modal-accessibility|sowie-core/);
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
  ["SowiaSzklarnia", "LaczIHoduj", "Łącz i Hoduj"],
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

test("SowieOgrody/nowa.html (dawny adres podglądu) przekierowuje do ./ z parametrami adresu", async () => {
  const html = await read("SowieOgrody/nowa.html");
  assert.ok(html.includes('<meta http-equiv="refresh" content="0; url=./"'));
  assert.ok(html.includes("location.replace(`./${location.search}${location.hash}`)"));
  assert.doesNotMatch(html, /<script src=/, "strona przekierowania nie ładuje skryptów (ani SowieCloud)");
  const platform = await read("shared/sowie-platform.js");
  assert.doesNotMatch(platform, /nowa\.html"/);
  assert.match(platform, /id: "ogrody",[\s\S]*?saveVersion: 3,\s*rebuilt: true/);
});

test("wersja demo (E10): demo.html bez konfiguracji Firestore, hasła i Galerii; SowieCloud w demo tylko w pamięci", async () => {
  const html = await read("demo.html");
  assert.match(html, /<html lang="pl" data-sowie-demo>/);
  assert.ok(html.indexOf("shared/sowie-platform.js") < html.indexOf("shared/sowie-cloud.js"));
  assert.ok(html.indexOf("shared/sowie-cloud.js") < html.indexOf("shared/menu/demo.js"));
  assert.doesNotMatch(html, /firebase-config|password-gate|owl-gallery|menu\/menu\.js/);
  const cloud = await read("shared/sowie-cloud.js");
  assert.match(cloud, /if \(demo\) return \{ mode: "memory"/);
  assert.match(cloud, /storage: demo \? demoStorage\(\) : window\.localStorage/);
  assert.match(cloud, /const DEMO_KEY = "sowiegry:demo"/);
  // Akademia i Galeria nie powstają w demo.
  assert.match(await read("shared/meta/academy.js"), /!window\.SowieCloud\.demo/);
  assert.match(await read("shared/owl-gallery.js"), /if \(cloud\?\.demo\) return;/);
  const sw = await read("sw.js");
  for (const file of ["demo.html", "shared/menu/demo.js", "shared/menu/demo.css"])
    assert.ok(sw.includes(`"${file}"`), file);
});
