// Testy jednostkowe Sowiego Świata: tokeny, pliki SVG, katalog grafik, animacja sowy i atlas.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { COLORS, cssName, font } from "../../shared/world/tokens.js";
import { SPRITES, SVG_BASE } from "../../shared/world/catalog.js";
import { COSMETIC_SPRITES, createOwlAnimator, OWL_ACTIONS, OWL_POSES } from "../../shared/world/owl.js";
import { cellSize, createAtlas, packShelves, svgFiles } from "../../shared/engine/sprites.js";
import { sizeSvg, viewBoxOf } from "../../shared/engine/assets.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const svgRoot = join(root, "assets/svg");

function listSvg(directory = svgRoot) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listSvg(path);
    return entry.name.endsWith(".svg") ? [path] : [];
  });
}

test("tokeny kolorów w tokens.css i tokens.js są identyczne", () => {
  const css = readFileSync(join(root, "shared/world/tokens.css"), "utf8");
  const fromCss = Object.fromEntries(
    [...css.matchAll(/(--[a-z-]+):\s*(#[0-9a-f]{6});/g)].map((match) => [match[1], match[2]]),
  );
  const fromJs = Object.fromEntries(Object.entries(COLORS).map(([key, value]) => [cssName(key), value]));
  assert.deepEqual(fromCss, fromJs);
  // Paleta z Analizy 2 (rozdz. 2.3) jest w całości.
  assert.equal(COLORS.kontur, "#3b2f4a");
  assert.equal(COLORS.monstera, "#3fae6a");
  assert.equal(COLORS.pracu, "#e8465a");
  assert.equal(cssName("nieboGora"), "--niebo-gora");
  assert.match(font(20), /^700 20px "Fredoka"/);
});

test("czcionka Fredoka (500 i 700) z licencją OFL jest w repozytorium", () => {
  const css = readFileSync(join(root, "shared/world/tokens.css"), "utf8");
  const urls = [...css.matchAll(/url\("([^"]+)"\)/g)].map((match) => match[1]);
  assert.equal(urls.length, 2);
  for (const url of urls) {
    const path = join(root, "shared/world", url);
    assert.ok(existsSync(path), url);
    assert.equal(readFileSync(path).subarray(0, 4).toString("latin1"), "wOF2");
  }
  assert.match(readFileSync(join(root, "assets/fonts/OFL.txt"), "utf8"), /SIL Open Font License, Version 1\.1/);
});

test("pliki SVG: viewBox, kolory tylko z palety, bez czerni, tekstu i zasobów z zewnątrz", () => {
  const palette = new Set(Object.values(COLORS));
  const files = listSvg();
  assert.ok(files.length >= 45, `za mało plików SVG: ${files.length}`);
  for (const file of files) {
    const name = relative(svgRoot, file);
    const svg = readFileSync(file, "utf8");
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="[^"]+" width="\d+" height="\d+">/, name);
    const [, , width, height] = viewBoxOf(svg);
    assert.ok(width > 0 && height > 0, name);
    assert.doesNotMatch(svg, /<(text|image|script|foreignObject|style)\b/i, `${name}: niedozwolony element`);
    assert.doesNotMatch(svg, /href="(https?:|data:)/i, `${name}: zasób z zewnątrz`);
    assert.doesNotMatch(svg, /\b(black)\b|#000\b|#000000/i, `${name}: czysta czerń`);
    const colors = svg.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
    for (const color of colors) assert.ok(palette.has(color.toLowerCase()), `${name}: kolor ${color} spoza palety`);
  }
});

test("katalog grafik: każda warstwa ma plik, pudełko zgadza się z viewBox, nazwy i kotwice są poprawne", () => {
  const files = svgFiles(SPRITES);
  for (const file of files) assert.ok(existsSync(join(svgRoot, file)), file);
  assert.ok(SVG_BASE.endsWith("/assets/svg/"));
  for (const [name, sprite] of Object.entries(SPRITES)) {
    assert.match(name, /^[a-z0-9-]+$/, name);
    assert.equal(sprite.box.length, 2, name);
    assert.ok(sprite.size[0] > 0 && sprite.size[1] > 0, name);
    // Proporcje rozmiaru w świecie = proporcje pudełka SVG (grafika się nie rozciąga).
    assert.ok(Math.abs(sprite.size[0] / sprite.size[1] - sprite.box[0] / sprite.box[1]) < 1e-9, name);
    assert.ok(
      sprite.anchor.every((value) => value >= 0 && value <= 1),
      name,
    );
    for (const layer of sprite.layers) {
      if (layer.svg) {
        const [, , width, height] = viewBoxOf(readFileSync(join(svgRoot, layer.svg), "utf8"));
        assert.deepEqual([width, height], sprite.box, `${name}: ${layer.svg}`);
      } else {
        assert.equal(typeof layer.text, "string", name);
        assert.ok(Object.values(COLORS).includes(layer.color), `${name}: kolor napisu`);
      }
    }
  }
  // Wszystkie postacie z Analizy 2: sowa, 9 pozycji garderoby, 5 kózek, humbak, 6 Pracu (+ Magda), 7 Amic, 3 liście, serduszko.
  const names = Object.keys(SPRITES);
  assert.equal(names.filter((name) => /^kozka-[a-z]+$/.test(name)).length, 5);
  assert.equal(names.filter((name) => name.startsWith("pracu-")).length, 7);
  assert.equal(names.filter((name) => name.startsWith("amic-")).length, 7);
  assert.equal(names.filter((name) => name.startsWith("lisc-")).length, 3);
  for (const name of ["humbak", "plusk", "zycie", "zycie-puste", "sowa-gwiazdki", "babelek"])
    assert.ok(SPRITES[name], name);
});

test("garderoba: nakładki dla wszystkich 13 pozycji z SowiePlatform.COSMETICS (9 dawnych + 4 z Sowiego Butiku)", () => {
  const source = readFileSync(join(root, "shared/sowie-platform.js"), "utf8");
  const block = source.match(/const COSMETICS = Object\.freeze\(\{([\s\S]*?)\}\);/)[1];
  const keys = [...block.matchAll(/^\s*(\w+):/gm)].map((match) => match[1]);
  assert.equal(keys.length, 13);
  assert.deepEqual(Object.keys(COSMETIC_SPRITES).sort(), keys.sort());
  for (const [key, layers] of Object.entries(COSMETIC_SPRITES)) {
    for (const sprite of Object.values(layers)) assert.ok(SPRITES[sprite], `${key}: ${sprite}`);
  }
});

test("animacja sowy: mruganie co 3–5 s, bieg w 6 klatkach, squash po lądowaniu, gwiazdki po trafieniu", () => {
  let seed = 0.5;
  const owl = createOwlAnimator({ random: () => seed });
  const blinks = [];
  let time = 0;
  let wasBlinking = false;
  for (let step = 0; step < 1200; step += 1) {
    owl.update(1 / 60);
    time += 1 / 60;
    const blinking = owl.state().sprite === "sowa-mruga";
    if (blinking && !wasBlinking) blinks.push(time);
    wasBlinking = blinking;
  }
  assert.ok(blinks.length >= 3 && blinks.length <= 7, `mrugnięcia: ${blinks.length}`);
  for (let index = 1; index < blinks.length; index += 1) {
    const gap = blinks[index] - blinks[index - 1];
    assert.ok(gap >= 3 - 0.05 && gap <= 5 + 0.05, `odstęp ${gap}`);
  }

  owl.set("bieg");
  const frames = new Set();
  for (let step = 0; step < 60; step += 1) {
    owl.update(1 / 60);
    frames.add(owl.state().sprite);
  }
  assert.deepEqual(
    [...frames].sort(),
    [1, 2, 3, 4, 5, 6].map((index) => `sowa-bieg-${index}`),
  );

  owl.set("skok");
  owl.update(1 / 60, { vy: -6 });
  const up = owl.state();
  assert.ok(up.scaleY > 1 && up.scaleX < 1, "rozciągnięcie przy wybiciu");
  owl.land(1);
  owl.update(1 / 120);
  const landed = owl.state();
  assert.ok(landed.scaleY < 1 && landed.scaleX > 1, "spłaszczenie przy lądowaniu");
  for (let step = 0; step < 60; step += 1) owl.update(1 / 60);
  assert.ok(Math.abs(owl.state().scaleY - 1) < 0.2);

  owl.set("oszolomienie");
  assert.equal(owl.state().stars, true);
  assert.equal(owl.state().sprite, "sowa-oszolomiona");
  assert.throws(() => owl.set("lot-w-kosmos"));

  // Każda klatka, którą może zwrócić animator, jest w katalogu.
  for (const action of OWL_ACTIONS) {
    seed = 0.1;
    const animator = createOwlAnimator({ random: () => seed });
    animator.set(action);
    for (let step = 0; step < 200; step += 1) {
      animator.update(1 / 60);
      assert.ok(SPRITES[animator.state().sprite], `${action}: ${animator.state().sprite}`);
    }
  }
  for (const pose of Object.keys(OWL_POSES)) assert.ok(SPRITES[`sowa-${pose}`], pose);
});

test("atlas: układanie w półkach bez nakładania, nowe strony i błąd przy zbyt dużej grafice", () => {
  const items = Array.from({ length: 40 }, (_, index) => ({
    name: `g${index}`,
    w: 90 + (index % 5) * 20,
    h: 80 + (index % 3) * 30,
  }));
  const { pages, placements } = packShelves(items, { maxSize: 512, padding: 2 });
  assert.ok(pages.length > 1);
  const boxes = Object.entries(placements);
  assert.equal(boxes.length, 40);
  for (const [name, box] of boxes) {
    assert.ok(box.x >= 2 && box.y >= 2, name);
    assert.ok(box.x + box.w <= pages[box.page].width && box.y + box.h <= pages[box.page].height, name);
    assert.ok(pages[box.page].width <= 512 && pages[box.page].height <= 512);
  }
  for (let a = 0; a < boxes.length; a += 1) {
    for (let b = a + 1; b < boxes.length; b += 1) {
      const [, first] = boxes[a];
      const [, second] = boxes[b];
      if (first.page !== second.page) continue;
      const overlap =
        first.x < second.x + second.w &&
        second.x < first.x + first.w &&
        first.y < second.y + second.h &&
        second.y < first.y + first.h;
      assert.equal(overlap, false, `${boxes[a][0]} / ${boxes[b][0]}`);
    }
  }
  assert.throws(() => packShelves([{ name: "wielki", w: 600, h: 10 }], { maxSize: 512 }), /nie mieści się/);
  assert.deepEqual(cellSize({ size: [1.2, 1.2] }, 100), { w: 120, h: 120 });
});

test("SVG w zadanym rozmiarze: width/height głównego elementu, viewBox bez zmian", () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64"><rect width="10" height="10"/></svg>';
  const sized = sizeSvg(svg, 300.4, 150);
  assert.match(sized, /^<svg width="300" height="150" xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 128 64">/);
  assert.match(sized, /<rect width="10" height="10"\/>/);
  assert.deepEqual(viewBoxOf(sized), [0, 0, 128, 64]);
  assert.throws(() => viewBoxOf("<svg></svg>"), /viewBox/);
});

test("atlas: budowa z katalogu, rysowanie z właściwego wycinka i brak przebudowy przy małej zmianie skali", async () => {
  const drawn = [];
  const fakeContext = () => ({
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    scale() {},
    beginPath() {},
    rect() {},
    clip() {},
    fillText() {},
    strokeText() {},
    drawImage(...args) {
      drawn.push(args);
    },
    globalAlpha: 1,
  });
  const canvases = [];
  const rasterized = [];
  let builds = 0;
  const atlas = createAtlas({
    catalog: SPRITES,
    baseUrl: SVG_BASE,
    createCanvas: (width, height) => {
      const canvas = { width, height, context: fakeContext(), getContext: () => canvas.context };
      canvases.push(canvas);
      return canvas;
    },
    load: async (file) => readFileSync(join(svgRoot, file), "utf8"),
    rasterize: async (text, width, height) => {
      rasterized.push(text);
      return { width, height, text };
    },
    fonts: async () => {
      builds += 1;
      return true;
    },
  });
  assert.equal(atlas.ready(), false);
  assert.equal(await atlas.build(80), true);
  assert.equal(atlas.ready(), true);
  assert.deepEqual(atlas.names().sort(), Object.keys(SPRITES).sort());
  const frame = atlas.frame("sowa-stoi");
  assert.deepEqual([frame.w, frame.h], [96, 96]);

  const calls = [];
  const target = {
    drawImage: (...args) => calls.push(args),
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    scale() {},
  };
  assert.equal(atlas.draw(target, "sowa-stoi", 5, 10), true);
  const [page, sx, sy, sw, sh, dx, dy, dw, dh] = calls[0];
  assert.equal(page, atlas.pages()[frame.page]);
  assert.deepEqual([sx, sy, sw, sh], [frame.x, frame.y, frame.w, frame.h]);
  assert.ok(Math.abs(dx - (5 - 1.2 * 0.5)) < 1e-9 && Math.abs(dy - (10 - 1.2 * (122 / 128))) < 1e-9);
  assert.deepEqual([dw, dh], [1.2, 1.2]);
  assert.equal(atlas.draw(target, "nie-ma-takiej", 0, 0), false);

  assert.equal(await atlas.ensure(85), false);
  assert.equal(builds, 1);
  assert.equal(await atlas.ensure(120), true);
  assert.equal(builds, 2);
  assert.ok(drawn.length > Object.keys(SPRITES).length);

  // Zmiana wyglądu (gatunek sowy z Sowiego Butiku): przebudowa w tej samej gęstości z przekolorowanym SVG.
  rasterized.length = 0;
  const seen = new Set();
  assert.equal(
    await atlas.setTransform((file, text) => {
      seen.add(file);
      return file === "sowa/cialo.svg" ? text.replaceAll("#b07a52", "#123456") : text;
    }),
    true,
  );
  assert.equal(builds, 3);
  assert.equal(atlas.pixelsPerUnit(), 120);
  assert.ok(seen.has("sowa/cialo.svg") && seen.has("pracu/budzik.svg"));
  assert.ok(rasterized.some((text) => text.includes("#123456")));
  assert.ok(!rasterized.some((text) => text.includes("#b07a52") && text.includes("Sówka: tułów")));
  rasterized.length = 0;
  assert.equal(await atlas.setTransform(null), true);
  assert.ok(rasterized.some((text) => text.includes("#b07a52")));
  assert.equal(await createAtlas({ catalog: SPRITES, baseUrl: SVG_BASE }).setTransform(() => ""), false);
});
