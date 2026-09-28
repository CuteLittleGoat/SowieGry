// Sowia Ucieczka — przeszkody (Analiza 2, rozdz. 2.2 i 3.1). Pracu Pracu = to, co się rusza i zaskakuje;
// Amic = to, co stoi i jest ciężkie. Pole kolizji: box [szerokość, wysokość] w j., lift — wysokość spodu pola
// nad podłożem (0 = stoi na ziemi / platformie). Rysunek: sprite z atlasu o szerokości `width`, zakotwiczony
// `drawLift` j. nad spodem pola (kotwice grafik: shared/world/catalog.js).

export const OBSTACLES = Object.freeze({
  // ---------- Pracu Pracu ----------
  // Dymek na wysokości głowy — ślizg (albo skok). Lekko faluje.
  dymek: {
    family: "pracu",
    label: "Dymek Pracu Pracu",
    sprite: "pracu-dymek",
    width: 1.3,
    box: [0.95, 0.75],
    lift: 0.8,
    drawLift: 0.38,
    bob: 0.1,
  },
  // Dzwoniący telefon na ziemi — skok.
  telefon: {
    family: "pracu",
    label: "Telefon",
    sprite: "pracu-telefon",
    width: 1.1,
    box: [0.75, 0.8],
    lift: 0,
    drawLift: 0.45,
    ring: true,
  },
  magda: {
    family: "pracu",
    label: "Telefon od Magdy",
    sprite: "pracu-telefon-magda",
    width: 1.1,
    box: [0.75, 0.8],
    lift: 0,
    drawLift: 0.45,
    ring: true,
  },
  // Rój maili: pojedynczy mail leci szybciej niż świat (vx), zapowiadany „!”.
  mail: {
    family: "pracu",
    label: "Mail",
    sprite: "pracu-mail",
    width: 0.8,
    box: [0.6, 0.45],
    lift: 0,
    drawLift: 0.22,
    mover: true,
  },
  // Ściana karteczek z luką: dwie części (dół i góra), luka na wysokości szczytu skoku.
  "karteczki-dol": {
    family: "pracu",
    label: "Ściana karteczek",
    draw: "notes",
    box: [0.6, 1.9],
    lift: 0,
  },
  "karteczki-gora": {
    family: "pracu",
    label: "Ściana karteczek",
    draw: "notes",
    box: [0.6, 12],
    lift: 3.7,
  },
  // Stos papierów / teczka — niski, skok.
  teczka: {
    family: "pracu",
    label: "Stos papierów",
    sprite: "pracu-teczka",
    width: 1.1,
    box: [0.85, 0.6],
    lift: 0,
    drawLift: 0.05,
  },
  // Budzik — mały, skok; dzwoni jak telefon.
  budzik: {
    family: "pracu",
    label: "Budzik",
    sprite: "pracu-budzik",
    width: 1,
    box: [0.7, 0.75],
    lift: 0,
    drawLift: 0.04,
    ring: true,
  },
  // Tablica „Przyjmiesz zmianę?” — wysoka, skok albo platforma.
  tablica: {
    family: "pracu",
    label: "Tablica „Przyjmiesz zmianę?”",
    sprite: "pracu-tablica",
    width: 1.5,
    box: [1, 1.25],
    lift: 0,
    drawLift: 0.04,
  },

  // ---------- Amic ----------
  dystrybutor: {
    family: "amic",
    label: "Dystrybutor Amic",
    sprite: "amic-dystrybutor",
    width: 1.6,
    box: [0.8, 1.35],
    lift: 0,
    drawLift: 0.05,
  },
  // Cysterna (długa) — podwójny skok albo szybowanie.
  cysterna: {
    family: "amic",
    label: "Cysterna Amic",
    sprite: "amic-cysterna",
    width: 4,
    box: [3.5, 1.45],
    lift: 0,
    drawLift: 0.07,
  },
  // Znak z cenami — tablica wysoko na słupkach: ślizg pod spodem (słupki bez kolizji).
  znak: {
    family: "amic",
    label: "Znak z cenami Amic",
    sprite: "amic-znak-cen",
    width: 1,
    box: [0.9, 1.1],
    lift: 0.84,
    drawLift: -0.84,
  },
  // Wózek z kanistrami jedzie szybciej niż świat — skok z wyprzedzeniem (zapowiedź „!”).
  wozek: {
    family: "amic",
    label: "Wózek z kanistrami",
    sprite: "amic-wozek",
    width: 1.3,
    box: [1, 0.95],
    lift: 0,
    drawLift: 0.08,
    mover: true,
  },
  barierka: {
    family: "amic",
    label: "Barierka Amic",
    sprite: "amic-barierka",
    width: 1.4,
    box: [1.1, 0.7],
    lift: 0,
    drawLift: 0.06,
  },
  kanister: {
    family: "amic",
    label: "Kanister",
    sprite: "amic-kanister",
    width: 0.75,
    box: [0.55, 0.62],
    lift: 0,
    drawLift: 0.33,
  },
});

// Pole kolizji przeszkody w chwili `time` (bez alokacji: wynik w `out`).
export function obstacleBox(item, time, out = { left: 0, right: 0, top: 0, bottom: 0 }) {
  const def = OBSTACLES[item.kind];
  const [width, height] = def.box;
  const bob = def.bob ? Math.sin(time * 3 + item.phase) * def.bob : 0;
  out.left = item.x - width / 2;
  out.right = item.x + width / 2;
  out.bottom = item.base - def.lift + bob;
  out.top = out.bottom - height;
  return out;
}

export const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
