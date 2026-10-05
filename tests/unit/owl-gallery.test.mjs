import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const photoFiles = [
  "sowa-01-puchata.jpg",
  "sowa-02-lesna.jpg",
  "sowa-03-na-pniu.jpg",
  "sowa-04-portret.jpg",
  "sowa-05-na-dachu.jpg",
  "sowa-06-zielone-tlo.jpg",
  "sowa-07-spojrzenie.jpg",
  "sowa-08-na-trawie.jpg",
  "sowa-09-w-koszyku.jpg",
  "sowa-10-na-galezi.jpg",
  "sowa-11-dwie-uszate.jpg",
  "sowa-12-dwie-puchate.jpg",
  "sowa-13-mloda-puszczykowata.jpg",
  "sowa-14-w-promieniach.jpg",
  "sowa-15-w-zieleni.jpg",
  "sowa-16-keila.jpg",
  "sowa-17-uralska.jpg",
  "sowa-18-na-konarku.jpg",
  "sowa-19-puszczyk.jpg",
  "sowa-20-na-trawie.jpg",
  "sowa-21-ciekawska.jpg",
  "sowa-22-mloda-w-lesie.jpg",
  "sowa-23-uszata-na-ziemi.jpg",
  "sowa-24-lesny-maluch.jpg",
  "sowa-25-biala-w-koszyku.jpg",
  "sowa-26-mloda-z-bliska.jpg",
  "sowa-27-kolumbijska.jpg",
  "sowa-28-puszczykowata-na-drzewie.jpg",
  "sowa-29-norkowa-na-lace.jpg",
  "sowa-30-wiosenna-rodzina.jpg",
];

test("folder Obrazki zawiera trzydzieści poprawnych, zoptymalizowanych plików JPEG", () => {
  for (const filename of photoFiles) {
    const file = path.join(root, "Obrazki", filename);
    assert.equal(fs.existsSync(file), true, `Brak ${filename}`);
    const data = fs.readFileSync(file);
    assert.equal(data[0], 0xff, `${filename} nie ma nagłówka JPEG`);
    assert.equal(data[1], 0xd8, `${filename} nie ma nagłówka JPEG`);
    assert.equal(data.at(-2), 0xff, `${filename} nie ma końca JPEG`);
    assert.equal(data.at(-1), 0xd9, `${filename} nie ma końca JPEG`);
    assert.ok(data.length > 15_000, `${filename} jest podejrzanie mały`);
    assert.ok(data.length < 900_000, `${filename} nie został wystarczająco zoptymalizowany`);
  }
});

test("dokumentacja podaje licencję i źródło każdego zdjęcia", () => {
  const documentation = read("Obrazki/README.md");
  assert.match(documentation, /Pexels License/);
  assert.match(documentation, /https:\/\/www\.pexels\.com\/license\//);
  for (const filename of photoFiles) assert.match(documentation, new RegExp(filename.replaceAll(".", "\\.")));
});

test("katalog galerii ma trzydzieści trwałych nagród i warunki z pięciu gier", () => {
  const source = read("shared/owl-gallery.js");
  assert.equal((source.match(/id: "owl-\d\d"/g) || []).length, 30);
  assert.match(source, /profile\?\.\(\)\.gallery/);
  assert.match(source, /profile\.gallery = stored/);
  assert.match(source, /const VERSION = 2/);
  for (const metric of ["runnerDistance", "jumperHeight", "sowa3Combo", "ogrodyBuys", "szklarniaRooms"]) {
    assert.match(source, new RegExp(metric));
  }
  assert.match(source, /gallery:complete/);
  // Okno Galerii w grach (dok) usunięte w E9a — Galeria jest w zakładce menu (shared/menu/gallery.js).
  assert.doesNotMatch(source, /data-gallery-fab|ensureModal/);
});

test("menu i wszystkie gry ładują skrypt galerii; gry także jej okno (style)", () => {
  for (const file of [
    "index.html",
    "SowiaUcieczka/index.html",
    "SowieTory/index.html",
    "SowaWChmurach/index.html",
    "LaczIHoduj/index.html",
    "SowieOgrody/index.html",
  ]) {
    assert.match(read(file), /owl-gallery\.js/, file);
    // Okno Galerii z owl-gallery.css miały tylko dawne gry; dziś Galeria jest w zakładce menu głównego.
    assert.doesNotMatch(read(file), /owl-gallery\.css/, file);
  }
  // Menu ma własną zakładkę „Galeria” (shared/menu/gallery.js) zamiast okna z owl-gallery.css.
  assert.doesNotMatch(read("index.html"), /owl-gallery\.css/);
  assert.match(read("shared/menu/gallery.js"), /thumbUrl\(photo, 400\)/);
});

test("jednorazowy workflow pobierania obrazów nie pozostaje w repozytorium", () => {
  for (const workflow of ["fetch-owl-gallery.yml", "fetch-more-owls.yml"]) {
    assert.equal(fs.existsSync(path.join(root, ".github/workflows", workflow)), false);
  }
});

// Uruchamia shared/owl-gallery.js w piaskownicy (bez przeglądarki) i zwraca window.SowieOwlGallery.
async function loadGallery() {
  const vm = await import("node:vm");
  const element = () => ({ dataset: {}, setAttribute() {}, addEventListener() {}, appendChild() {}, append() {} });
  const window = { addEventListener() {}, dispatchEvent() {} };
  const document = {
    currentScript: { src: "https://example.test/shared/owl-gallery.js" },
    readyState: "complete",
    getElementById: () => null,
    querySelector: () => null,
    createElement: element,
    body: element(),
  };
  const context = vm.createContext({ window, document, URL, CustomEvent: class {}, console });
  vm.runInContext(read("shared/owl-gallery.js"), context);
  return window.SowieOwlGallery;
}

test("cele galerii są danymi: warunek odblokowania i postęp do paska", async () => {
  const gallery = await loadGallery();
  assert.equal(gallery.PHOTOS.length, 30);
  for (const photo of gallery.PHOTOS) {
    assert.ok(Array.isArray(photo.goals), photo.id);
    for (const [source, target] of photo.goals) {
      // Od E9d bez salda piórek (wydaje się je w Sowim Butiku): poziom, liczba osiągnięć albo metryka Akademii.
      assert.match(
        source,
        /^(level|achievements|leaves|goatsCaught|nearMisses|whaleRides|[a-z0-9]+[A-Z]\w+)$/,
        `${photo.id}: ${source}`,
      );
      assert.ok(target > 0, photo.id);
    }
  }
  // Obiekty z piaskownicy vm porównujemy po JSON (inne prototypy tablic).
  const plain = (value) => JSON.parse(JSON.stringify(value));
  assert.deepEqual(plain(gallery.PHOTOS[0].goals), []);
  const academy = { level: 5, feathers: 15, metrics: { runnerDistance: 500 } };
  assert.equal(gallery.progressOf("owl-01", academy).share, 1);
  assert.equal(gallery.progressOf("owl-03", academy).share, 0.5);
  assert.equal(gallery.progressOf("owl-03", academy).done, false);
  const both = gallery.progressOf("owl-30", { ...academy, achievements: { zbieraczka: 1, wytrwala: 2 } });
  assert.deepEqual(plain(both.goals.map((goal) => [goal.source, goal.value, goal.target, goal.done])), [
    ["achievements", 2, 8, false],
    ["level", 5, 8, false],
  ]);
  assert.equal(both.share, (2 / 8 + 5 / 8) / 2);
  assert.equal(gallery.progressOf("owl-08", { level: 1, achievements: { a: 1, b: 1, c: 1 } }).done, true);
  assert.equal(gallery.progressOf("owl-27", { level: 1, metrics: { nearMisses: 20, whaleRides: 2 } }).done, false);
  assert.equal(gallery.progressOf("owl-26", { level: 1, feathers: 0, metrics: {} }).goals.length, 5);
  assert.equal(gallery.progressOf("nie-ma", academy), null);
});

test("miniatury WebP 400 i 600 px dla każdego zdjęcia, siatka poniżej 1 MB", async () => {
  const gallery = await loadGallery();
  let total400 = 0;
  for (const photo of gallery.PHOTOS) {
    for (const width of [400, 600]) {
      const url = gallery.thumbUrl(photo, width);
      assert.equal(url, `https://example.test/assets/gallery-thumbs/${photo.file.replace(".jpg", "")}-${width}.webp`);
      const data = fs.readFileSync(path.join(root, new URL(url).pathname));
      assert.equal(data.toString("latin1", 0, 4), "RIFF");
      assert.equal(data.toString("latin1", 8, 12), "WEBP");
      if (width === 400) total400 += data.length;
    }
  }
  assert.ok(total400 < 1024 * 1024, `miniatury 400 px: ${total400} B`);
  assert.equal(fs.readdirSync(path.join(root, "assets/gallery-thumbs")).length, 60);
});

test("każdy cel zdjęcia powstaje ze zdarzeń gier (Sowia Akademia, E9d) albo to poziom / liczba osiągnięć", async () => {
  const gallery = await loadGallery();
  const { academyCalls } = await import("../../shared/meta/academy.js");
  const { EVENTS } = await import("../../shared/meta/progress-events.js");
  const run = { leaves: 1, goats: 1, nearMisses: 1, whales: 1, fevers: 1 };
  const events = [
    [EVENTS.RUN_ENDED, { gameId: "runner", score: 1, distance: 1, bestChain: 1, run }],
    [EVENTS.RUN_ENDED, { gameId: "jumper", score: 1, height: 1, bestStreak: 1, run }],
    [EVENTS.RUN_ENDED, { gameId: "sowa3", score: 1, bestCombo: 1, finished: true, run }],
    [EVENTS.IDLE, { gameId: "ogrody", lifetimeLeaves: 1, clicks: 1, buys: 1, watering: 1, prestiges: 1, plants: 1 }],
    [EVENTS.IDLE, { gameId: "szklarnia", rooms: 1, plants: 1, goats: 1, hybrids: 1 }],
    ...["runner", "jumper", "sowa3", "ogrody", "szklarnia"].map((gameId) => [EVENTS.VISIT, { gameId }]),
  ];
  const metrics = new Set(events.flatMap(([type, detail]) => academyCalls(type, detail).map((call) => call[1])));
  for (const photo of gallery.PHOTOS) {
    for (const [source] of photo.goals) {
      assert.ok(["level", "achievements"].includes(source) || metrics.has(source), `${photo.id}: ${source}`);
    }
  }
});
