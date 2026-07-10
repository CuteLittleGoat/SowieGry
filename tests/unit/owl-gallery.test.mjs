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
];
const gameIndexes = [
  "SowaRunner/index.html",
  "SowaJumper/index.html",
  "Sowa3/index.html",
  "SowieOgrody/index.html",
  "SowiaSzklarnia/index.html",
];

test("folder Obrazki zawiera osiem poprawnych, zoptymalizowanych plików JPEG", () => {
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

test("katalog galerii ma osiem trwałych nagród i warunki z pięciu gier", () => {
  const source = read("shared/owl-gallery.js");
  assert.equal((source.match(/id: "owl-\d\d"/g) || []).length, 8);
  assert.match(source, /const KEY = "sowieOwlGallery"/);
  assert.match(source, /const VERSION = 1/);
  for (const metric of ["runnerDistance", "jumperHeight", "sowa3Combo", "ogrodyBuys", "szklarniaRooms"]) {
    assert.match(source, new RegExp(metric));
  }
  assert.match(source, /gallery:complete/);
  assert.match(source, /data-gallery-favorite/);
});

test("menu i wszystkie gry ładują skrypt oraz style galerii", () => {
  for (const file of ["index.html", ...gameIndexes]) {
    const html = read(file);
    assert.match(html, /owl-gallery\.css/);
    assert.match(html, /owl-gallery\.js/);
  }
});

test("jednorazowy workflow pobierania obrazów nie pozostaje w repozytorium", () => {
  assert.equal(fs.existsSync(path.join(root, ".github/workflows/fetch-owl-gallery.yml")), false);
});
