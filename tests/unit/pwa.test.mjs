// PWA: manifest, ikony i service worker (Analiza 2, rozdz. 2.5 pkt 9; Analiza 3, E2a).
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");
const pages = [
  "index.html",
  "SowiaUcieczka/index.html",
  "SowieTory/index.html",
  "SowaWChmurach/index.html",
  "SowaJumper/index.html",
  "Sowa3/index.html",
  "SowieOgrody/index.html",
  "SowiaSzklarnia/index.html",
  "lab/index.html",
];

function pngSize(file) {
  const data = fs.readFileSync(file);
  assert.equal(data.readUInt32BE(0), 0x89504e47, `${file} nie jest PNG`);
  return [data.readUInt32BE(16), data.readUInt32BE(20)];
}

test("manifest: aplikacja samodzielna w pionie, po polsku, z ikonami 192/512 i maskable", () => {
  const manifest = JSON.parse(read("manifest.webmanifest"));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.orientation, "portrait");
  assert.equal(manifest.lang, "pl");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.ok(manifest.name && manifest.short_name && manifest.background_color && manifest.theme_color);
  const sizes = manifest.icons.map((icon) => `${icon.sizes}:${icon.purpose}`);
  for (const expected of ["192x192:any", "512x512:any", "512x512:maskable"])
    assert.ok(sizes.includes(expected), expected);
  for (const icon of manifest.icons) {
    assert.ok(fs.existsSync(icon.src), `brak ${icon.src}`);
    if (icon.type === "image/png") assert.deepEqual(pngSize(icon.src).map(String).join("x"), icon.sizes);
  }
  assert.deepEqual(pngSize("assets/icons/apple-touch-icon.png"), [180, 180]);
});

test("każda strona ma manifest, ikonę, tryb aplikacji na iPhonie i rejestrację service workera", () => {
  for (const page of pages) {
    const html = read(page);
    assert.match(html, /<link rel="manifest" href="(\.\.\/)?manifest\.webmanifest"/, page);
    assert.match(html, /rel="apple-touch-icon"/, page);
    assert.match(html, /name="apple-mobile-web-app-capable" content="yes"/, page);
    assert.match(html, /shared\/pwa\.js/, page);
  }
});

test("service worker: wersjonowana pamięć, pliki startowe istnieją, Firestore nie jest przechwytywany", () => {
  const sw = read("sw.js");
  assert.match(sw, /const VERSION = "sowiegry-v\d+";/);
  const shell = JSON.parse(`[${sw.match(/const SHELL = \[([\s\S]*?)\];/)[1].replace(/,\s*$/, "")}]`);
  assert.ok(shell.includes("./") && shell.includes("index.html"));
  for (const file of shell.filter((entry) => entry !== "./"))
    assert.ok(fs.existsSync(file), `brak pliku z listy SHELL: ${file}`);
  // Wszystkie skrypty i style menu są w pamięci startowej (start bez zasięgu).
  const menu = read("index.html");
  for (const [, file] of menu.matchAll(/(?:src|href)="((?:shared|config)\/[^"]+)"/g)) {
    assert.ok(shell.includes(file), `menu używa ${file}, którego nie ma w SHELL`);
  }
  assert.match(sw, /firebasejs\/12\.19\.0\/firebase-app\.js/);
  assert.doesNotMatch(sw, /firestore\.googleapis\.com"/);
  assert.match(sw, /key\.startsWith\("sowiegry-"\) && key !== VERSION/);
});

// Wszystkie moduły ES menu (import … from "./…") — rekurencyjnie od shared/menu/menu.js.
function moduleGraph(entry) {
  const seen = new Set();
  const walk = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const [, spec] of read(file).matchAll(/^\s*(?:import|export)\s[^;]*?from\s+"(\.[^"]+)"/gms)) {
      walk(path.posix.normalize(path.posix.join(path.posix.dirname(file), spec)));
    }
  };
  walk(entry);
  return [...seen];
}

test("service worker: menu działa bez zasięgu — moduły, czcionki, grafiki postaci i dźwięki menu w SHELL", async () => {
  const sw = read("sw.js");
  const shell = JSON.parse(`[${sw.match(/const SHELL = \[([\s\S]*?)\];/)[1].replace(/,\s*$/, "")}]`);
  const modules = moduleGraph("shared/menu/menu.js");
  assert.ok(modules.length > 10);
  for (const file of modules) assert.ok(shell.includes(file), `moduł menu ${file} nie jest w SHELL`);
  for (const [, font] of read("shared/world/tokens.css").matchAll(/url\("?\.\.\/\.\.\/([^")]+)"?\)/g)) {
    assert.ok(shell.includes(font), `czcionka ${font} nie jest w SHELL`);
  }
  const { SPRITES } = await import("../../shared/world/catalog.js");
  const { svgFiles } = await import("../../shared/engine/sprites.js");
  for (const file of svgFiles(SPRITES)) assert.ok(shell.includes(`assets/svg/${file}`), `grafika ${file}`);
  const sounds = JSON.parse(read("shared/menu/menu.js").match(/const MENU_SOUNDS = (\[[^\]]*\]);/)[1]);
  for (const name of sounds) assert.ok(shell.includes(`assets/audio/sfx/${name}.mp3`), `dźwięk ${name}`);
  assert.ok(shell.includes("assets/audio/audio.json"));
});
