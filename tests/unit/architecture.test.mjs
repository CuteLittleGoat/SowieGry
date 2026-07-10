import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(path, "utf8");

const gamePages = [
  "SowaRunner/index.html",
  "SowaJumper/index.html",
  "Sowa3/index.html",
  "SowieOgrody/index.html",
  "SowiaSzklarnia/index.html",
];

test("centralny rejestr zawiera dokładnie pięć gier", async () => {
  const platform = await read("shared/sowie-platform.js");
  const ids = [...platform.matchAll(/\{ id: "(runner|jumper|sowa3|ogrody|szklarnia)"/g)].map((match) => match[1]);
  assert.deepEqual(ids, ["runner", "jumper", "sowa3", "ogrody", "szklarnia"]);
});

test("wszystkie gry ładują platformę i wspólny menedżer powiadomień", async () => {
  for (const path of gamePages) {
    const html = await read(path);
    assert.match(html, /shared\/sowie-platform\.js/, `${path} nie ładuje SowiePlatform`);
    assert.match(html, /shared\/notification-manager\.js/, `${path} nie ładuje wspólnych powiadomień`);
    assert.doesNotMatch(html, /Sowa3\/notification-manager\.js/, `${path} zależy od katalogu innej gry`);
  }
});

test("runtime nie podmienia metod SowieCore", async () => {
  const runtime = await read("shared/sowie-runtime.js");
  assert.doesNotMatch(runtime, /core\.(registerGame|play|recordStat|progressMission)\s*=/);
  await assert.rejects(read("SowieOgrody/ogrody-runtime.js"));
});

test("migracje nie resetują danych użytkownika", async () => {
  const compatibility = await read("shared/progress-reset.js");
  const platform = await read("shared/sowie-platform.js");
  assert.doesNotMatch(compatibility, /removeItem/);
  assert.match(platform, /backupValue/);
  assert.match(platform, /migrateProfile/);
  assert.match(platform, /exportData/);
  assert.match(platform, /importData/);
});

test("gry idle korzystają ze stabilnego panelu, autosave i obsługi modali", async () => {
  for (const path of ["SowieOgrody/index.html", "SowiaSzklarnia/index.html"]) {
    const html = await read(path);
    assert.match(html, /shared\/stable-panel\.js/);
    assert.match(html, /shared\/idle-save-bridge\.js/);
    assert.match(html, /shared\/modal-accessibility\.js/);
  }
});

test("projekt respektuje reduced motion", async () => {
  const css = await read("shared/cute-ui.css");
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /sowie-reduced-effects/);
});
