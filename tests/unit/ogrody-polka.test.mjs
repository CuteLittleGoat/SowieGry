// Sowie Ogrody — półka z roślinami (uwaga z 2026-11-11: „rośliny były duże i przesuwały się w linii tak, aby można
// było widzieć wszystkie i aby nie znikały z półki i nie robiły się małe”): układ w jednej linii, wielkość roślin
// niezależna od liczby gatunków, przesuwanie palcem z rozpędem, strzałki, kółko myszy, pokazanie wybranej rośliny.
import assert from "node:assert/strict";
import { test } from "node:test";
import { PLANTS } from "../../SowieOgrody/ogrod/config.js";
import {
  createShelfScroll,
  createVelocity,
  placeShelf,
  plantScale,
  SHELF,
  shelfLayout,
  shelfPlants,
} from "../../SowieOgrody/ogrod/shelf.js";
import { gardenUnit } from "../../SowieOgrody/ogrod/render.js";
import { defaultState } from "../../SowieOgrody/ogrod/state.js";

const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} ≠ ${expected} ± ${tolerance}`);

// Ogród z `count` pierwszymi gatunkami po `amount` sztuk (albo z podanymi liczbami).
function stateWith(count, amount = 1) {
  const state = defaultState(0);
  state.plants = Object.fromEntries(
    PLANTS.slice(0, count).map((plant, index) => [plant.id, Array.isArray(amount) ? amount[index] : amount]),
  );
  return state;
}

// Ogród telefonu (Pixel 7: 392 × 285 px CSS) w jednostkach ogrodu.
const UNIT = gardenUnit(392, 285);
const VIEW = 392 / UNIT;

test("półka: wszystkie gatunki w jednej linii, miejsce według etapu wyglądu, wielkość roślin bez zmniejszania", () => {
  // Miejsca rosną z etapem (1, 10, 25, 50, 100 sztuk), każde mieści podpis „×N”.
  assert.deepEqual(SHELF.slots, [0, 64, 70, 80, 96, 120]);
  const all = stateWith(PLANTS.length, 100);
  const layout = shelfLayout(all, VIEW);
  assert.equal(layout.items.length, PLANTS.length, "żaden gatunek nie znika z półki");
  assert.deepEqual(
    layout.items.map((entry) => entry.id),
    PLANTS.map((plant) => plant.id),
  );
  for (const [index, entry] of layout.items.entries()) {
    assert.equal(entry.stage, 5);
    assert.equal(entry.width, 120, entry.id);
    assert.equal(entry.start, index * 120, "rośliny jedna obok drugiej, bez przerw i zakładek");
    assert.equal(entry.center, entry.start + 60);
  }
  assert.equal(layout.content, PLANTS.length * 120);
  near(layout.max, PLANTS.length * 120 - VIEW, 1e-9, "przesunięcie do końca linii");
  // Wielkość rośliny zależy tylko od etapu i ogrodu — tak samo przy 1 i przy 27 gatunkach, większa niż dawniej
  // (dawniej najwyżej (0,7 + 0,12 × etap) × gardenUnit, w ciasnym rzędzie nawet ×0,56).
  for (let stage = 1; stage <= 5; stage += 1) {
    near(plantScale(stage, 1), (0.7 + stage * 0.12) * 1.2, 1e-12, `etap ${stage}`);
  }
  assert.ok(plantScale(1, UNIT) > (0.7 + 0.12) * UNIT);
});

test("półka: gdy rośliny się mieszczą — rozstawione na całą szerokość, bez przewijania (także o kilka procent za długa)", () => {
  const one = shelfLayout(stateWith(1), VIEW);
  assert.equal(one.max, 0);
  near(one.items[0].center, VIEW / 2, 1e-9, "jedna roślina na środku");
  const two = shelfLayout(stateWith(2, [30, 1]), VIEW);
  assert.equal(two.max, 0);
  near(two.items[0].center, VIEW / 4, 1e-9, "dwie — na 1/4 i 3/4 szerokości");
  near(two.items[1].center, (VIEW * 3) / 4, 1e-9, "dwie — na 1/4 i 3/4 szerokości");
  assert.equal(two.items[0].stage, 3);
  assert.equal(two.items[1].stage, 1);
  // Linia dłuższa od ogrodu najwyżej o 8% — miejsca węższe, bez przewijania; dłuższa — przewijanie.
  const view = 4 * 96 * 0.95;
  const squeezed = shelfLayout(stateWith(4, 50), view);
  assert.equal(squeezed.max, 0);
  near(squeezed.content, view, 1e-9, "cała linia w ogrodzie");
  const longer = shelfLayout(stateWith(5, 50), view);
  near(longer.max, 5 * 96 - view, 1e-9, "piąta roślina — przewijanie");
  // Bez roślin — pusta półka.
  assert.deepEqual(shelfLayout(defaultState(0), VIEW), { items: [], content: 0, view: VIEW, max: 0 });
});

test("przesuwanie: palec prowadzi półkę w granicach linii, po puszczeniu jedzie z rozpędem i wytraca go", () => {
  const scroll = createShelfScroll();
  const layout = shelfLayout(stateWith(PLANTS.length, 100), VIEW);
  scroll.sync(layout);
  assert.equal(scroll.offset(), 0);
  assert.deepEqual(
    { ...scroll.info(), view: 0 },
    { offset: 0, max: layout.max, view: 0, scrollable: true, canPrev: false, canNext: true, moving: false },
  );
  // Bez chwycenia przeciąganie nic nie robi; za początek linii nie da się wyjechać.
  scroll.drag(50);
  assert.equal(scroll.offset(), 0);
  scroll.grab();
  scroll.drag(-30);
  assert.equal(scroll.offset(), 0);
  scroll.drag(200);
  assert.equal(scroll.offset(), 200);
  assert.equal(scroll.info().canPrev, true);
  // Puszczenie z prędkością 600 jednostek/s: półka jedzie dalej i staje (droga ok. 600 / wytracanie).
  scroll.release(600);
  assert.equal(scroll.info().moving, true);
  for (let frame = 0; frame < 300; frame += 1) scroll.update(1 / 60);
  assert.equal(scroll.info().moving, false);
  near(scroll.offset(), 200 + (600 - SHELF.minSpeed) / SHELF.friction, 8, "droga z rozpędu");
  // Rozpęd zatrzymuje się na końcu linii.
  scroll.grab();
  scroll.release(-5000);
  for (let frame = 0; frame < 300; frame += 1) scroll.update(1 / 60);
  assert.equal(scroll.offset(), 0);
  // Wolne puszczenie — bez rozpędu.
  scroll.grab();
  scroll.drag(100);
  scroll.release(SHELF.minSpeed / 2);
  assert.equal(scroll.info().moving, false);
  assert.equal(scroll.offset(), 100);
});

test("strzałki: roślina ucięta przy krawędzi staje się pierwszą z drugiej strony; na końcach linii strzałka znika", () => {
  const scroll = createShelfScroll();
  const layout = shelfLayout(stateWith(PLANTS.length, 100), 400);
  scroll.sync(layout);
  // Widok 400 jednostek: rośliny 0–2 całe, 3. ucięta (360–480) — po strzałce w prawo jest pierwsza z lewej.
  scroll.page(1);
  assert.equal(scroll.info().moving, true);
  assert.equal(scroll.info().canPrev, true, "strzałka w lewo od razu (cel, nie bieżące położenie)");
  for (let frame = 0; frame < 120; frame += 1) scroll.update(1 / 60);
  assert.equal(scroll.offset(), 360);
  assert.equal(scroll.info().moving, false);
  scroll.page(1);
  for (let frame = 0; frame < 120; frame += 1) scroll.update(1 / 60);
  assert.equal(scroll.offset(), 720);
  // W lewo: ucięta z lewej (600–720, cała poza widokiem) staje się ostatnią z prawej.
  scroll.page(-1);
  for (let frame = 0; frame < 120; frame += 1) scroll.update(1 / 60);
  assert.equal(scroll.offset(), 720 - 400);
  // Na początku linii strzałka w lewo znika.
  scroll.page(-1);
  for (let frame = 0; frame < 120; frame += 1) scroll.update(1 / 60);
  assert.equal(scroll.offset(), 0);
  assert.deepEqual([scroll.info().canPrev, scroll.info().canNext], [false, true]);
  // Szybkie stuknięcia sumują się (cel liczony od poprzedniego celu), a na końcu strzałka w prawo znika.
  for (let press = 0; press < 20; press += 1) scroll.page(1);
  for (let frame = 0; frame < 240; frame += 1) scroll.update(1 / 60);
  assert.equal(scroll.offset(), layout.max);
  assert.deepEqual([scroll.info().canPrev, scroll.info().canNext], [true, false]);
  scroll.page(1);
  assert.equal(scroll.offset(), layout.max);
  // Kółko myszy: przesunięcie o podaną liczbę jednostek, w granicach linii.
  scroll.nudge(-150);
  for (let frame = 0; frame < 120; frame += 1) scroll.update(1 / 60);
  near(scroll.offset(), layout.max - 150, 1e-9, "kółko myszy");
  // Bez animacji (ograniczony ruch w systemie): od razu, bez rozpędu.
  const still = createShelfScroll({ instant: () => true });
  still.sync(layout);
  still.page(1);
  assert.equal(still.offset(), 360);
  assert.equal(still.info().moving, false);
  still.grab();
  still.drag(10);
  still.release(900);
  assert.equal(still.info().moving, false);
  assert.equal(still.offset(), 370);
});

test("pokazanie rośliny: nowy gatunek wjeżdża w widok, ciężarówka — na środek; półka zaczyna od końca linii", () => {
  const scroll = createShelfScroll({ instant: () => true });
  const state = stateWith(PLANTS.length, 100);
  const layout = shelfLayout(state, 400);
  // Start gry: koniec linii (najnowsze rośliny) w najbliższej klatce — do tej pory półka jest „w ruchu”.
  scroll.toEnd();
  assert.equal(scroll.offset(), 0);
  assert.equal(scroll.info().moving, true, "prośba czeka na klatkę");
  scroll.sync(layout);
  assert.equal(scroll.offset(), layout.max);
  assert.equal(scroll.info().moving, false);
  // Roślina w widoku — półka stoi; poza widokiem z lewej — wjeżdża przy lewej krawędzi.
  scroll.reveal(PLANTS.at(-1).id);
  scroll.sync(layout);
  assert.equal(scroll.offset(), layout.max);
  scroll.reveal("paproc");
  scroll.sync(layout);
  assert.equal(scroll.offset(), 2 * 120);
  // Z prawej — wjeżdża przy prawej krawędzi (Bonsai — 9. na półce).
  scroll.reveal("bonsai");
  assert.equal(scroll.info().moving, true, "prośba czeka na klatkę");
  scroll.sync(layout);
  assert.equal(scroll.offset(), 9 * 120 - 400);
  // Na środek (ciężarówka Amic).
  scroll.reveal("kaktus", { center: true });
  scroll.sync(layout);
  assert.equal(scroll.offset(), 4 * 120 + 60 - 200);
  // Nieznana roślina — nic; prośba tylko na jedną klatkę.
  scroll.reveal("nieznana");
  scroll.sync(layout);
  assert.equal(scroll.offset(), 4 * 120 + 60 - 200);
  // W trakcie przeciągania palcem półka nie ucieka spod palca.
  scroll.grab();
  scroll.reveal("monstera");
  scroll.sync(layout);
  assert.equal(scroll.offset(), 4 * 120 + 60 - 200);
});

test("zmiana układu: widok trzyma się pierwszej widocznej rośliny, a stojący na końcu linii zostaje na końcu", () => {
  const scroll = createShelfScroll({ instant: () => true });
  const state = stateWith(PLANTS.length, 100);
  scroll.sync(shelfLayout(state, 400));
  scroll.page(1);
  scroll.page(1);
  assert.equal(scroll.offset(), 720);
  // Gatunek z lewej znika (np. sprzedany przez test) — widok przesuwa się razem z roślinami.
  state.plants.pilea = 0;
  scroll.sync(shelfLayout(state, 400));
  assert.equal(scroll.offset(), 600);
  // …i wraca (nowa sztuka): widok znowu przy tej samej roślinie.
  state.plants.pilea = 1;
  scroll.sync(shelfLayout(state, 400));
  assert.equal(scroll.offset(), 720 - 120 + 64);
  // Na końcu linii: nowa roślina na końcu — widok dalej na końcu.
  const last = createShelfScroll({ instant: () => true });
  const growing = stateWith(20, 100);
  last.toEnd();
  last.sync(shelfLayout(growing, 400));
  growing.plants[PLANTS[20].id] = 1;
  const longer = shelfLayout(growing, 400);
  last.sync(longer);
  assert.equal(last.offset(), longer.max);
  // Po Wielkim Przesadzaniu linia jest krótka — przesunięcie wraca w granice.
  last.sync(shelfLayout(stateWith(2), 400));
  assert.equal(last.offset(), 0);
  assert.equal(last.info().scrollable, false);
});

test("prędkość palca: z ostatnich 100 ms ruchu; palec zatrzymany przed puszczeniem — bez rozpędu", () => {
  const velocity = createVelocity();
  assert.equal(velocity.value(0), 0);
  velocity.add(100, 1000);
  velocity.add(90, 1016);
  velocity.add(70, 1032);
  velocity.add(40, 1048);
  near(velocity.value(1050), ((40 - 100) / 48) * 1000, 1e-9, "px/s");
  // Starsze próbki (ponad 100 ms) się nie liczą.
  velocity.add(30, 1140);
  near(velocity.value(1140), ((30 - 40) / 92) * 1000, 1e-9, "tylko ostatnie 100 ms");
  // Palec stał ponad 50 ms przed puszczeniem.
  assert.equal(velocity.value(1200), 0);
  velocity.reset();
  velocity.add(5, 2000);
  assert.equal(velocity.value(2000), 0, "jedna próbka — brak prędkości");
  // Ruch krótszy niż 16 ms (zdarzenia wysłane naraz) — bez rozpędu; bardzo szybki — najwyżej 6000 px/s.
  velocity.reset();
  velocity.add(0, 3000);
  velocity.add(150, 3001);
  assert.equal(velocity.value(3001), 0);
  velocity.reset();
  velocity.add(0, 4000);
  velocity.add(-1000, 4020);
  assert.equal(velocity.value(4020), -6000);
});

test("półka: rośliny z shelfPlants w layout i miejsca nie zmieniają się przy obrocie ogrodu (jednostki ogrodu)", () => {
  const state = stateWith(12, 25);
  const narrow = shelfLayout(state, 360 / gardenUnit(360, 260));
  const wide = shelfLayout(state, 800 / gardenUnit(800, 380));
  assert.deepEqual(
    narrow.items.map((entry) => entry.id),
    shelfPlants(state).map((plant) => plant.id),
  );
  // Ta sama linia (miejsca w jednostkach ogrodu), inna szerokość widoku.
  assert.deepEqual(
    narrow.items.map((entry) => [entry.start, entry.width]),
    wide.items.map((entry) => [entry.start, entry.width]),
  );
  assert.ok(wide.max < narrow.max);
});

test("miejsca roślin na płótnie: doniczki w jednej linii, środek z przesunięciem, widoczne tylko w ogrodzie", () => {
  const state = stateWith(PLANTS.length, 100);
  const unit = gardenUnit(392, 285);
  const layout = shelfLayout(state, 392 / unit);
  const { y, label, places } = placeShelf(layout, 240, { width: 392, height: 285, unit });
  near(label, Math.min(unit, 1.4), 1e-12, "skala podpisu");
  near(y, 285 * SHELF.baseline, 1e-9, "doniczki na 87% wysokości");
  assert.equal(places.length, PLANTS.length);
  for (const { entry, x, scale, visible } of places) {
    near(x, (entry.center - 240) * unit, 1e-9, entry.id);
    near(scale, plantScale(5, unit), 1e-12, entry.id);
    assert.equal(visible, x >= 0 && x <= 392, entry.id);
  }
  assert.deepEqual(
    places.filter((place) => place.visible).map((place) => place.entry.id),
    PLANTS.slice(2, 5).map((plant) => plant.id),
    "widać 3., 4. i 5. roślinę (środki 300, 420, 540 jednostek przy przesunięciu 240)",
  );
  // Niski ogród (lista rozwinięta): podpis pod doniczką mieści się w ogrodzie.
  const low = placeShelf(layout, 0, { width: 392, height: 80, unit: 0.85 });
  near(low.y, 80 - 18 * 0.85, 1e-9, "doniczki wyżej, podpis w ogrodzie");
});
