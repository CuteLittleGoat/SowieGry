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
const gameIndexes = [
  "SowaRunner/index.html",
  "SowaJumper/index.html",
  "Sowa3/index.html",
  "SowieOgrody/index.html",
  "SowiaSzklarnia/index.html",
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
  assert.match(source, /const KEY = "sowieOwlGallery"/);
  assert.match(source, /const VERSION = 2/);
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
  for (const workflow of ["fetch-owl-gallery.yml", "fetch-more-owls.yml"]) {
    assert.equal(fs.existsSync(path.join(root, ".github/workflows", workflow)), false);
  }
});
