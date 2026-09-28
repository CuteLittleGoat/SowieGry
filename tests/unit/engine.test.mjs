// Testy jednostkowe Sowiego Silnika (shared/engine) — czysta logika, bez przeglądarki.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createRng, hashSeed } from "../../shared/engine/rng.js";
import { createLoop, STEP } from "../../shared/engine/loop.js";
import { createPool } from "../../shared/engine/pool.js";
import { aabb, circleRect, circles, hitbox, landsOn } from "../../shared/engine/collide.js";
import { createTweens, ease } from "../../shared/engine/tween.js";
import { createParticles } from "../../shared/engine/particles.js";
import { computeLayout, screenToWorld, worldToScreen } from "../../shared/engine/view.js";
import { createCamera } from "../../shared/engine/camera.js";
import { createGestureRecognizer, inDeadZone, KEY_MAP, swipeDirection } from "../../shared/engine/input.js";
import { createScenes } from "../../shared/engine/scene.js";
import { createPauseController, createPerfMonitor } from "../../shared/engine/shell.js";

test("RNG z ziarnem: powtarzalny i zgodny z algorytmem SowiePlatform (FNV-1a + xorshift32)", () => {
  // Kopia algorytmu z shared/sowie-platform.js (createRng) — wyzwanie dnia musi dawać ten sam układ.
  function platformRng(seed) {
    let state = hashSeed(seed);
    return () => {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
  }
  const a = createRng("daily-2026-09-28-runner");
  const b = createRng("daily-2026-09-28-runner");
  const reference = platformRng("daily-2026-09-28-runner");
  for (let index = 0; index < 50; index += 1) {
    const value = a.next();
    assert.equal(value, b.next());
    assert.equal(value, reference());
    assert.ok(value >= 0 && value < 1);
  }
  assert.notEqual(createRng("x").next(), createRng("y").next());
  const rng = createRng(1);
  const seen = new Set();
  for (let index = 0; index < 500; index += 1) seen.add(rng.int(1, 3));
  assert.deepEqual([...seen].sort(), [1, 2, 3]);
});

test("pętla: stały krok 1/120 s, interpolacja, pauza, limit kroków i 30 kl./s", () => {
  const updates = [];
  const alphas = [];
  const loop = createLoop({
    update: (dt) => updates.push(dt),
    render: (alpha) => alphas.push(alpha),
    raf: () => 0,
    caf: () => {},
  });
  assert.equal(STEP, 1 / 120);
  let time = 0;
  loop.tick(time); // pierwsza klatka: jeden krok
  for (let frame = 0; frame < 60; frame += 1) loop.tick((time += 1000 / 60));
  // 1 s przy 60 kl./s = 120 kroków symulacji (+1 z pierwszej klatki).
  assert.ok(Math.abs(updates.length - 121) <= 1, `kroków: ${updates.length}`);
  assert.ok(updates.every((dt) => dt === STEP));
  assert.ok(alphas.every((alpha) => alpha >= 0 && alpha < 1));

  loop.pause();
  const before = updates.length;
  for (let frame = 0; frame < 10; frame += 1) loop.tick((time += 16));
  assert.equal(updates.length, before, "w pauzie symulacja stoi");
  loop.resume();
  loop.tick((time += 16));
  loop.tick((time += 5000)); // długa przerwa (karta w tle) — maksymalnie 0,25 s
  assert.ok(updates.length - before <= 32, `po przerwie: ${updates.length - before} kroków`);

  const slow = [];
  const renders = [];
  const heavy = createLoop({
    update: (dt) => slow.push(dt),
    render: () => renders.push(1),
    maxSteps: 5,
    raf: () => 0,
    caf: () => {},
  });
  heavy.tick(0);
  heavy.tick(250);
  assert.equal(slow.length, 1 + 5, "bez spirali śmierci");

  heavy.setRenderRate(30);
  const count = renders.length;
  let t = 1000;
  for (let frame = 0; frame < 60; frame += 1) heavy.tick((t += 1000 / 60));
  assert.ok(Math.abs(renders.length - count - 30) <= 1, `klatek przy 30 kl./s: ${renders.length - count}`);
});

test("pula obiektów: ponowne użycie bez nowych obiektów i zwalnianie w trakcie iteracji", () => {
  let created = 0;
  const pool = createPool(
    () => ({ id: (created += 1), alive: true }),
    (item) => (item.alive = false),
    { size: 4 },
  );
  assert.equal(created, 4);
  const items = [pool.acquire(), pool.acquire(), pool.acquire()];
  assert.equal(pool.activeCount(), 3);
  pool.forEachActive((item) => {
    if (item === items[1]) pool.release(item);
  });
  assert.equal(pool.activeCount(), 2);
  assert.equal(items[1].alive, false);
  assert.equal(pool.release(items[1]), false, "podwójne zwolnienie jest ignorowane");
  for (let index = 0; index < 3; index += 1) pool.acquire();
  assert.equal(created, 5, "nowy obiekt powstaje dopiero po wyczerpaniu puli");
  pool.releaseAll();
  assert.equal(pool.activeCount(), 0);
});

test("kolizje: prostokąty, okręgi, pole 80% i lądowanie z góry", () => {
  const a = { x: 0, y: 0, width: 2, height: 2 };
  assert.equal(aabb(a, { x: 1, y: 1, width: 2, height: 2 }), true);
  assert.equal(aabb(a, { x: 2, y: 0, width: 1, height: 1 }), false);
  assert.equal(circles(0, 0, 1, 1.5, 0, 0.6), true);
  assert.equal(circleRect(3, 1, 0.9, a), false);
  assert.equal(circleRect(2.5, 1, 0.6, a), true);
  assert.deepEqual(hitbox({ x: 0, y: 0, width: 10, height: 10 }), { x: 1, y: 1, width: 8, height: 8 });
  const platform = { x: 0, y: 5, width: 4, height: 0.5 };
  assert.equal(landsOn(4.9, 5.1, platform, 1, 2), true);
  assert.equal(landsOn(5.2, 5.3, platform, 1, 2), false, "od dołu nie lądujemy");
  assert.equal(landsOn(4.9, 5.1, platform, 5, 6), false);
});

test("animacje: osiągają cel, respektują opóźnienie i wywołują onDone", () => {
  const tweens = createTweens();
  const target = { x: 0, alpha: 1 };
  let done = 0;
  tweens.to(target, { x: 10, alpha: 0 }, 1, { easing: ease.linear, delay: 0.5, onDone: () => (done += 1) });
  tweens.update(0.5);
  assert.equal(target.x, 0);
  tweens.update(0.5);
  assert.ok(Math.abs(target.x - 5) < 1e-9);
  tweens.update(1);
  assert.equal(target.x, 10);
  assert.equal(target.alpha, 0);
  assert.equal(done, 1);
  assert.equal(tweens.count(), 0);
  for (const [name, fn] of Object.entries(ease)) {
    assert.ok(Math.abs(fn(0)) < 1e-9, `${name}(0)`);
    assert.ok(Math.abs(fn(1) - 1) < 1e-9, `${name}(1)`);
  }
  tweens.to(target, { x: 0 }, 1);
  tweens.cancelFor(target);
  assert.equal(tweens.count(), 0);
});

test("cząsteczki: limit, gęstość (oszczędzanie baterii) i wygasanie", () => {
  const particles = createParticles({ max: 10, random: () => 0.5 });
  assert.equal(particles.emit(0, 0, { count: 8 }), 8);
  assert.equal(particles.emit(0, 0, { count: 8 }), 2, "nie więcej niż max");
  particles.clear();
  particles.setDensity(0.5);
  assert.equal(particles.emit(0, 0, { count: 8 }), 4);
  particles.update(0.1);
  assert.equal(particles.count(), 4);
  particles.update(2);
  assert.equal(particles.count(), 0);
});

test("widok: świat w jednostkach, DPR max 2, stała skala przy chowaniu paska adresu", () => {
  const minWorld = { width: 9, height: 16 };
  const phone = computeLayout({ cssWidth: 360, cssHeight: 800, minWorld, dpr: 3 });
  assert.equal(phone.scale, 40);
  assert.equal(phone.pixelRatio, 2);
  assert.equal(phone.worldWidth, 9);
  assert.equal(phone.worldHeight, 20);
  assert.equal(phone.canvasWidth, 720);

  const small = computeLayout({ cssWidth: 320, cssHeight: 568, minWorld, dpr: 2 });
  assert.ok(small.worldWidth >= 9 - 1e-9 && small.worldHeight >= 16 - 1e-9, "minimalny obszar zawsze widoczny");

  // Pasek adresu: wysokość 800 → 740 — skala bez zmian.
  const bar = computeLayout({ cssWidth: 360, cssHeight: 740, minWorld, lockedScale: phone.scale });
  assert.equal(bar.scale, phone.scale);
  // Obrót do poziomu: widok zbyt mały — nowa skala.
  const landscape = computeLayout({ cssWidth: 800, cssHeight: 360, minWorld, lockedScale: phone.scale });
  assert.ok(landscape.scale < phone.scale);
  assert.ok(landscape.worldHeight >= 16 - 1e-9);

  const camera = { x: 4.5, y: 10, zoom: 1 };
  const screen = worldToScreen(phone, camera, 4.5, 10);
  assert.deepEqual(screen, { x: 180, y: 400 });
  const world = screenToWorld(phone, camera, 20, 60);
  const back = worldToScreen(phone, camera, world.x, world.y);
  assert.ok(Math.abs(back.x - 20) < 1e-9 && Math.abs(back.y - 60) < 1e-9);
});

test("kamera: płynne podążanie i brak wstrząsu przy ograniczeniu ruchu", () => {
  const camera = createCamera();
  for (let index = 0; index < 240; index += 1) camera.follow(10, -4, 1 / 120);
  assert.ok(Math.abs(camera.x - 10) < 0.01 && Math.abs(camera.y + 4) < 0.01);
  camera.clamp({ maxX: 8 });
  assert.equal(camera.x, 8);
  camera.shake(1);
  camera.update(1 / 60, { random: () => 1, reducedMotion: true });
  assert.equal(camera.shakeX, 0);
  camera.update(1 / 60, { random: () => 1 });
  assert.ok(camera.shakeX > 0);
});

function recognizer(extra = {}) {
  const events = [];
  const r = createGestureRecognizer({ width: 360, height: 800, onGesture: (event) => events.push(event), ...extra });
  return { r, events, types: () => events.map((event) => event.type + (event.direction ? `:${event.direction}` : "")) };
}

test("gesty: stuknięcie, przytrzymanie, swipe w 4 kierunkach i przeciąganie", () => {
  let g = recognizer();
  g.r.down(1, 180, 400, 0);
  g.r.up(1, 182, 401, 90);
  assert.deepEqual(g.types(), ["press", "tap", "release"]);

  g = recognizer();
  g.r.down(1, 180, 400, 0);
  g.r.update(100);
  g.r.update(200);
  g.r.up(1, 181, 400, 600);
  assert.deepEqual(g.types(), ["press", "holdstart", "holdend", "release"]);

  for (const [dx, dy, direction] of [
    [40, 0, "right"],
    [-40, 5, "left"],
    [3, 40, "down"],
    [0, -40, "up"],
  ]) {
    g = recognizer();
    g.r.down(1, 180, 400, 0);
    g.r.move(1, 180 + dx / 2, 400 + dy / 2, 60);
    g.r.move(1, 180 + dx, 400 + dy, 120);
    g.r.up(1, 180 + dx, 400 + dy, 150);
    assert.deepEqual(g.types(), ["press", `swipe:${direction}`, "release"], direction);
  }

  g = recognizer();
  g.r.down(1, 180, 400, 0);
  g.r.move(1, 190, 400, 250);
  g.r.move(1, 230, 400, 400);
  g.r.up(1, 230, 400, 500);
  assert.deepEqual(g.types(), ["press", "dragstart", "drag", "dragend", "release"], "powolny ruch to przeciąganie");

  g = recognizer();
  g.r.down(1, 180, 400, 0);
  g.r.update(200);
  g.r.move(1, 200, 400, 300);
  g.r.up(1, 200, 400, 400);
  assert.deepEqual(g.types(), ["press", "holdstart", "holdend", "dragstart", "drag", "dragend", "release"]);
});

test("gesty: martwe strefy przy krawędziach i pasku domowym, drugi palec ignorowany", () => {
  assert.equal(inDeadZone(10, 400, 360, 800), true, "lewa krawędź");
  assert.equal(inDeadZone(350, 400, 360, 800), true, "prawa krawędź");
  assert.equal(inDeadZone(180, 790, 360, 800), true, "dół");
  assert.equal(inDeadZone(180, 760, 360, 800, undefined, 34), true, "dół + pasek domowy iPhone'a");
  assert.equal(inDeadZone(180, 400, 360, 800), false);

  const g = recognizer();
  assert.equal(g.r.down(1, 5, 400, 0), null);
  g.r.move(1, 80, 400, 50);
  g.r.up(1, 80, 400, 80);
  assert.deepEqual(g.types(), ["ignored"], "swipe od krawędzi (gest „cofnij”) nie działa w grze");

  const two = recognizer();
  two.r.down(1, 180, 400, 0);
  assert.equal(two.r.down(2, 200, 400, 10), null);
  two.r.up(2, 200, 400, 20);
  two.r.up(1, 180, 400, 50);
  assert.deepEqual(two.types(), ["press", "tap", "release"]);

  assert.equal(swipeDirection(-5, -30), "up");
  assert.equal(KEY_MAP.Space, "action");
  assert.equal(KEY_MAP.KeyP, "pause");
});

test("sceny: przejście ze ściemnieniem, wyjście i wejście w połowie", () => {
  const log = [];
  const scenes = createScenes({ transition: 0.2 })
    .add("tytul", { enter: () => log.push("in:tytul"), exit: () => log.push("out:tytul") })
    .add("gra", { enter: (params) => log.push(`in:gra:${params.seed}`), update: () => log.push("u:gra") });
  scenes.go("tytul");
  scenes.go("gra", { seed: 7 });
  scenes.update(0.05);
  assert.equal(scenes.current(), "tytul");
  scenes.update(0.06);
  assert.equal(scenes.current(), "gra");
  assert.equal(scenes.fade(), 1);
  scenes.update(0.1);
  assert.equal(scenes.fade(), 0);
  assert.deepEqual(log.slice(0, 3), ["in:tytul", "out:tytul", "in:gra:7"]);
  assert.throws(() => scenes.go("brak"));
});

test("monitor płynności: poniżej 45 kl./s przez 5 s proponuje oszczędzanie baterii (raz)", () => {
  let slow = 0;
  const monitor = createPerfMonitor({ onSlow: () => (slow += 1) });
  for (let index = 0; index < 4 * 30; index += 1) monitor.sample(30, 1 / 30);
  monitor.sample(60, 1 / 60); // chwilowa poprawa zeruje licznik
  for (let index = 0; index < 4.9 * 30; index += 1) monitor.sample(30, 1 / 30);
  assert.equal(slow, 0);
  for (let index = 0; index < 10; index += 1) monitor.sample(30, 1 / 30);
  assert.equal(slow, 1);
  for (let index = 0; index < 300; index += 1) monitor.sample(20, 1 / 20);
  assert.equal(slow, 1);
  monitor.reset();
  assert.equal(monitor.slowFor(), 0);
});

test("auto-pauza: tylko w rozgrywce, powrót przez odliczanie 3-2-1", () => {
  const timers = [];
  const loopCalls = [];
  const changes = [];
  const controller = createPauseController({
    loop: { pause: () => loopCalls.push("pause"), resume: () => loopCalls.push("resume") },
    schedule: (fn) => timers.push(fn) - 1,
    cancel: (id) => (timers[id] = null),
    onChange: (change) => changes.push(`${change.state}${change.state === "countdown" ? change.count : ""}`),
  });
  assert.equal(controller.pause("tlo"), false, "na ekranie tytułowym brak pauzy");
  controller.setActive(true);
  assert.equal(controller.pause("tlo"), true);
  assert.equal(controller.reason(), "tlo");
  controller.resume();
  while (timers.length) {
    const next = timers.shift();
    next?.();
  }
  assert.deepEqual(changes, ["paused", "countdown3", "countdown2", "countdown1", "running"]);
  assert.deepEqual(loopCalls, ["pause", "resume"]);

  controller.pause("obrot");
  controller.resume();
  controller.pause("fokus"); // kolejna przerwa w trakcie odliczania
  assert.equal(controller.state(), "paused");
  assert.equal(timers.filter(Boolean).length, 0, "odliczanie anulowane");
});
