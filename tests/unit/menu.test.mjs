// Menu główne (Analiza 2, rozdz. 4.1; Analiza 3, E3): czyste funkcje modułów shared/menu.
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

const { MENU_GAMES, recordText } = await import("../../shared/menu/games.js");
const { cosmeticHint, MISSION_LABELS } = await import("../../shared/menu/owl-tab.js");
const { CLOUD_STATUS, cloudStatusInfo } = await import("../../shared/menu/cloud-status.js");
const { isIos } = await import("../../shared/menu/install.js");

const read = (file) => fs.readFileSync(file, "utf8");
const registryIds = [...read("shared/sowie-platform.js").matchAll(/^\s*(?:\{ )?id: "([a-z0-9]+)"/gm)].map(
  (match) => match[1],
);

test("każda gra z rejestru ma w menu przystanek, opis i kolory biomu", () => {
  assert.deepEqual(Object.keys(MENU_GAMES), registryIds);
  for (const [id, info] of Object.entries(MENU_GAMES)) {
    assert.ok(info.station && info.description.length > 20, id);
    assert.equal(info.biome.length, 2, id);
  }
});

test("rekord na karcie: najlepszy wynik ze wszystkich poziomów, gry idle — podsumowanie, brak gry — null", () => {
  const records = {
    runner: { chill: { bestDistance: 320 }, arcade: { bestDistance: 1250, bestScore: 9 }, chaos: {} },
    jumper: { arcade: { bestHeight: 88 } },
    sowa3: { chaos: { bestScore: 15300 } },
    ogrody: { lifetimeLeaves: 123456 },
    szklarnia: { rooms: 4 },
  };
  assert.equal(recordText("runner", records), "Rekord: 1250 m");
  assert.equal(recordText("jumper", records), "Rekord: 88 m");
  assert.equal(recordText("sowa3", records), "Rekord: 15 300 pkt");
  assert.equal(recordText("ogrody", records), "Liście: 123 456");
  assert.equal(recordText("szklarnia", records), "Pomieszczenia: 4");
  for (const id of registryIds) assert.equal(recordText(id, {}), null, id);
});

test("garderoba: zablokowany dodatek podpowiada misję i jej postęp", () => {
  const defaults = {
    leaves20: { progress: 0, target: 20, done: false, reward: "glasses" },
    runner1000: { progress: 0, target: 1000, done: false, reward: "cap" },
  };
  assert.equal(
    cosmeticHint("glasses", { leaves20: { progress: 12.7 } }, defaults),
    "Zbierz 20 liści monster (12 / 20)",
  );
  assert.equal(cosmeticHint("cap", {}, defaults), "Przebiegnij 1000 m w Sowiej Ucieczce (0 / 1000)");
  assert.equal(cosmeticHint("none", {}, defaults), "");
  // Każda misja profilu ma opis (klucze jak w SowiePlatform.DEFAULT_MISSIONS).
  const platform = read("shared/sowie-platform.js");
  const missions = platform.slice(platform.indexOf("DEFAULT_MISSIONS"), platform.indexOf("DEFAULT_STATS"));
  for (const [, key] of missions.matchAll(/^\s{4}(\w+): \{/gm)) assert.ok(MISSION_LABELS[key], key);
});

test("stan zapisu: każdy status SowieCloud ma opis; tryb testowy i emulator są wyraźnie oznaczone", () => {
  for (const status of ["haslo", "laczenie", "online", "zapisywanie", "offline", "blad"]) {
    assert.ok(CLOUD_STATUS[status].short && CLOUD_STATUS[status].long, status);
  }
  assert.equal(cloudStatusInfo("offline", "memory").short, "Tryb testowy");
  assert.match(cloudStatusInfo("online", "emulator").short, /emulator/);
  assert.equal(cloudStatusInfo("online", "firestore").short, "Zapisano");
});

test("karta instalacji rozpoznaje iPhone'a i iPada (także iPadOS udający Maca)", () => {
  assert.equal(isIos({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" }), true);
  assert.equal(isIos({ userAgent: "Mozilla/5.0 (Macintosh)", platform: "MacIntel", maxTouchPoints: 5 }), true);
  assert.equal(isIos({ userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 7)", platform: "Linux" }), false);
});

test("menu: wszystkie cele dotyku w stylach mają co najmniej 48 px", () => {
  const css = read("shared/menu/menu.css");
  for (const [, value] of css.matchAll(/min-height:\s*(\d+)px/g)) assert.ok(Number(value) >= 36, value);
  for (const selector of [
    ".menu-icon-button",
    ".menu-button",
    ".menu-chips button",
    ".menu-chip",
    ".menu-tabs button",
  ]) {
    const block = css.slice(css.indexOf(`${selector} {`));
    const rule = block.slice(0, block.indexOf("}"));
    const height = Number((rule.match(/(?:min-)?height:\s*(\d+)px/) || [])[1]);
    assert.ok(height >= 48, `${selector}: ${height}`);
  }
});
