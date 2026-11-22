// Płynność (Analiza 6, W7) na telefonach. Liczenie klatek na maszynach CI jest zbyt nierówne, więc testy sprawdzają
// liczniki pracy rysowania i zachowanie, nie liczbę klatek: Sowie Ogrody — tło i rośliny z pamięci obrazków, Zatoka
// Humbaka bez ogrodu pod wodą; Łącz i Hoduj — pełna plansza z obrazków; Sowie Tory — rekwizyty z obrazków, a tabela
// granic i lista ruchomych rekwizytów zgodne z rysunkami; automat płynności — ostrość płótna; licznik `?perf=1`;
// ustawienie „Płynność” zapamiętane na urządzeniu (nie w profilu w chmurze); propozycja „Oszczędzania baterii”.
const { test, expect, waitForCloud, watchErrors, DEVICE_KEY } = require("../fixtures");

async function open(page, url, hook) {
  await page.goto(url, { waitUntil: "load" });
  await waitForCloud(page);
  await page.waitForFunction((name) => window[name]?.ready?.() && (window[name].atlasReady?.() ?? true), hook, {
    timeout: 20_000,
  });
}

const call = (page, hook, name, ...args) =>
  page.evaluate(([game, method, rest]) => window[game][method](...rest), [hook, name, args]);

// Liczniki pracy w oknie `ms` (różnice) i czas okna w sekundach.
async function measure(page, hook, ms = 1500) {
  const read = () => page.evaluate((game) => ({ ...window[game].renderStats(), at: performance.now() }), hook);
  const before = await read();
  await page.waitForTimeout(ms);
  const after = await read();
  const delta = Object.fromEntries(
    Object.keys(after)
      .filter((key) => typeof after[key] === "number" && typeof before[key] === "number")
      .map((key) => [key, after[key] - before[key]]),
  );
  return { ...delta, seconds: delta.at / 1000, after };
}

// Gęstość ekranu urządzenia i ostrość płótna (szerokość płótna / szerokość na stronie).
const canvasRatio = (page, selector = "[data-canvas]") =>
  page.evaluate((query) => {
    const canvas = document.querySelector(query);
    return canvas.width / canvas.getBoundingClientRect().width;
  }, selector);

test("Sowie Ogrody: tło i rośliny z pamięci obrazków, Zatoka Humbaka bez ogrodu pod wodą, ostrość z automatu", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await open(page, "/SowieOgrody/", "SowieOgrody");
  // Dziesięć gatunków na półce (po 150 sztuk — pełny wygląd).
  await page.evaluate(() => {
    const ids = ["monstera", "pilea", "paproc", "alokazja", "kaktus", "slonecznik", "storczyk", "lotos", "bonsai"];
    window.SowieOgrody.setPlants(Object.fromEntries([...ids, "sowiStorczyk"].map((id) => [id, 150])));
    window.SowieOgrody.settleShelf();
  });
  await page.waitForTimeout(800);
  const visible = Object.values((await call(page, "SowieOgrody", "shelf")).spots).filter((spot) => spot.visible).length;
  expect(visible).toBeGreaterThan(2);
  const garden = await measure(page, "SowieOgrody");
  expect(garden.frames).toBeGreaterThan(3);
  // Tło rozdziału najwyżej 15 razy na sekundę (+1 na początek okna) — niezależnie od liczby klatek.
  expect(garden.backgroundRenders).toBeLessThanOrEqual(Math.ceil(garden.seconds * 15) + 1);
  // Rośliny z obrazków: najwyżej 2 odświeżenia na klatkę (rysowane wprost byłoby `visible` na klatkę).
  expect(garden.plantRenders).toBeLessThanOrEqual(garden.frames * 2 + visible);
  expect(garden.plantRenders).toBeLessThan(garden.frames * visible);

  // Zatoka Humbaka: jedno „zdjęcie” ogrodu pod wodą, ogród nie jest rysowany co klatkę.
  await call(page, "SowieOgrody", "fillSplash");
  await page.locator('[data-alert="bay"]').click();
  await expect(page.locator("[data-bay-hud]")).toBeVisible();
  await page.waitForTimeout(300);
  const bay = await measure(page, "SowieOgrody", 1000);
  expect(bay.frames).toBeGreaterThan(3);
  expect(bay.gardenDraws).toBe(0);
  expect(bay.bayShots).toBe(0);
  expect(bay.after.bayShots).toBeGreaterThanOrEqual(1);

  // Automat płynności: poziom 2 → ostrość płótna 1; poziom 0 → do 2 (najwyżej tyle, ile ma ekran).
  const device = await page.evaluate(() => window.devicePixelRatio);
  await call(page, "SowieOgrody", "setQualityLevel", 2);
  await expect.poll(() => canvasRatio(page)).toBeCloseTo(1, 1);
  expect((await call(page, "SowieOgrody", "quality")).level).toBe(2);
  await call(page, "SowieOgrody", "setQualityLevel", 0);
  await expect.poll(() => canvasRatio(page)).toBeCloseTo(Math.min(2, device), 1);
  expect(errors).toEqual([]);
});

test("Łącz i Hoduj: pełna plansza rysowana z obrazków, ostrość z automatu", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, "/LaczIHoduj/", "LaczIHoduj");
  await page.evaluate(() => {
    const chains = ["monstera", "pilea", "paproc", "kaktus"];
    for (let index = 0; index < 63; index += 1) window.LaczIHoduj.place(index, 1 + (index % 5), chains[index % 4]);
  });
  await page.waitForTimeout(500);
  const board = await measure(page, "LaczIHoduj");
  expect(board.frames).toBeGreaterThan(3);
  // 63 rośliny w 20 wyglądach (z podpisem poziomu i bez): najwyżej 3 odświeżenia na klatkę (+ nowe obrazki), zamiast
  // 63 rysunków na klatkę.
  expect(board.itemRenders).toBeLessThanOrEqual(board.frames * 3 + 40);
  expect(board.itemRenders).toBeLessThan(board.frames * 63);
  expect(board.backgroundRenders).toBeLessThanOrEqual(Math.ceil(board.seconds * 5) + 1);
  const device = await page.evaluate(() => window.devicePixelRatio);
  await call(page, "LaczIHoduj", "setQualityLevel", 2);
  await expect.poll(() => canvasRatio(page)).toBeCloseTo(1, 1);
  await call(page, "LaczIHoduj", "setQualityLevel", 1);
  await expect.poll(() => canvasRatio(page)).toBeCloseTo(Math.min(1.5, device), 1);
  expect(errors).toEqual([]);
});

test("Sowie Tory: rekwizyty sklepu z obrazków; ostrość z automatu także w grach z biegającą sową", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, "/SowieTory/?seed=plynnosc", "SowieTory");
  await page.locator("[data-start]").click();
  await expect.poll(() => call(page, "SowieTory", "screen")).toBe("playing");
  // Logika wstrzymana — rekwizyty stoją w miejscu, rysowanie działa dalej.
  await call(page, "SowieTory", "hold", true);
  await page.waitForTimeout(500);
  const props = await measure(page, "SowieTory", 1000);
  expect(props.frames).toBeGreaterThan(3);
  expect(props.propDraws).toBeGreaterThan(props.frames * 5);
  // Prawie wszystkie z obrazków (wprost tylko rekwizyty tuż przy sowie, większe niż pół miliona pikseli).
  expect(props.propSprites / props.propDraws).toBeGreaterThan(0.8);
  // Stojące rekwizyty nie są rysowane od nowa (odświeżane tylko ruchome — najwyżej 4 na klatkę).
  expect(props.propRenders).toBeLessThanOrEqual(props.frames * 4);

  const device = await page.evaluate(() => window.devicePixelRatio);
  await call(page, "SowieTory", "setQualityLevel", 2);
  await expect.poll(async () => (await call(page, "SowieTory", "quality")).dpr).toBe(1);
  await expect.poll(() => canvasRatio(page)).toBeCloseTo(1, 1);
  await call(page, "SowieTory", "setQualityLevel", 0);
  await expect.poll(() => canvasRatio(page)).toBeCloseTo(Math.min(2, device), 1);
  for (const [path, hook] of [
    ["/SowiaUcieczka/?seed=plynnosc", "SowiaUcieczka"],
    ["/SowaWChmurach/?seed=plynnosc", "SowaWChmurach"],
  ]) {
    await open(page, path, hook);
    await call(page, hook, "setQualityLevel", 1);
    await expect.poll(async () => (await call(page, hook, "quality")).dpr).toBe(Math.min(1.5, device));
  }
  expect(errors).toEqual([]);
});

test("Sowie Tory: granice obrazków mieszczą każdy rysunek rekwizytu, a ruchome są na liście ruchomych", async ({
  page,
}) => {
  await open(page, "/SowieTory/?seed=plynnosc", "SowieTory");
  const report = await page.evaluate(async () => {
    const props = await import("/SowieTory/props.js");
    const { ROAD_WIDTH } = await import("/SowieTory/projection.js");
    const scale = 40;
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 480;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const origin = [400, 400];
    // Rysunki dla ziaren 0–11 i kilku chwil na jednym płótnie (suma rysunków = suma granic).
    function paint(group, kind, width, times) {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let seed = 0; seed < 12; seed += 1) {
        for (const time of times) {
          context.save();
          context.setTransform(scale, 0, 0, scale, origin[0], origin[1]);
          props.drawProp(context, group, kind, time, seed, width);
          context.restore();
        }
      }
      return context.getImageData(0, 0, canvas.width, canvas.height).data;
    }
    // Piksele rysunku poza granicami z PROP_BOUNDS (z zapasem 1 px na wygładzanie krawędzi).
    function outside(data, [left, right, up, down]) {
      const x0 = Math.floor(origin[0] - left * scale) - 1;
      const x1 = Math.ceil(origin[0] + right * scale) + 1;
      const y0 = Math.floor(origin[1] - up * scale) - 1;
      const y1 = Math.ceil(origin[1] + down * scale) + 1;
      let count = 0;
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          if (x >= x0 && x < x1 && y >= y0 && y < y1) continue;
          if (data[(y * canvas.width + x) * 4 + 3] > 0) count += 1;
        }
      }
      return count;
    }
    const same = (a, b) => a.every((value, index) => value === b[index]);
    const widths = { baner: ROAD_WIDTH + 1.4, girlanda: ROAD_WIDTH + 1, zadaszenie: ROAD_WIDTH + 2, napisPrl: 3.2 };
    const problems = [];
    const groups = {
      decor: Object.keys(props.DECOR_PROPS),
      obstacle: Object.keys(props.OBSTACLE_PROPS),
      overhead: Object.keys(widths),
    };
    let checked = 0;
    for (const [group, kinds] of Object.entries(groups)) {
      for (const kind of kinds) {
        const width = group === "overhead" ? widths[kind] : 0;
        if (!props.propBounds(group, kind, width)) {
          problems.push(`${group}:${kind} — brak granic w PROP_BOUNDS`);
          continue;
        }
        const spill = outside(
          paint(group, kind, width, [0, 0.31, 0.77, 1.43, 2.9]),
          props.propBounds(group, kind, width),
        );
        if (spill > 0) problems.push(`${group}:${kind} — ${spill} px poza granicami`);
        // Ruchomy rysunek (zależny od czasu) musi być na liście PROP_ANIMATED — inaczej obrazek by „zamarzł”.
        const still = paint(group, kind, width, [0]).slice();
        const later = paint(group, kind, width, [0.77]);
        const animated = props.PROP_ANIMATED[group].includes(kind);
        if (!same(still, later) && !animated)
          problems.push(`${group}:${kind} — rusza się, a nie ma go w PROP_ANIMATED`);
        if (same(still, later) && animated) problems.push(`${group}:${kind} — w PROP_ANIMATED, a stoi w miejscu`);
        checked += 1;
      }
    }
    return { problems, checked };
  });
  expect(report.problems).toEqual([]);
  expect(report.checked).toBeGreaterThanOrEqual(40);
});

test("licznik ?perf=1: w rogu ekranu klatki, ostrość i automat; bez parametru go nie ma", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, "/LaczIHoduj/?perf=1", "LaczIHoduj");
  const meter = page.locator(".sowie-perf-meter");
  await expect(meter).toBeVisible();
  await expect(meter).toContainText("kl./s", { timeout: 5_000 });
  // Poziom automatu na wolnej maszynie CI może już być niższy — ważne, że licznik go pokazuje.
  await expect(meter).toContainText(/automat \d \(auto\)/);
  await open(page, "/SowieTory/?perf=1&seed=plynnosc", "SowieTory");
  await expect(page.locator(".sowie-perf-meter")).toContainText("ostrość");
  await open(page, "/SowieTory/?seed=plynnosc", "SowieTory");
  await expect(page.locator(".sowie-perf-meter")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("ustawienie „Płynność”: wybór w menu i w menu pauzy zostaje na tym urządzeniu, nie w profilu w chmurze", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.goto("/", { waitUntil: "load" });
  await waitForCloud(page);
  await page.locator("[data-open-settings]").click();
  const group = page.getByRole("radiogroup", { name: "Płynność" });
  await expect(group).toBeVisible();
  await expect(group.getByRole("radio", { name: "Automatyczna" })).toHaveAttribute("aria-checked", "true");
  await group.getByRole("radio", { name: "Oszczędzanie baterii" }).click();
  await expect(group.getByRole("radio", { name: "Oszczędzanie baterii" })).toHaveAttribute("aria-checked", "true");
  await expect(group).toContainText("30 klatek na sekundę");
  const stored = () =>
    page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "{}").prefs?.quality?.mode ?? null, DEVICE_KEY);
  expect(await stored()).toBe("saver");
  // Profil w chmurze (wspólny dla urządzeń) bez wyboru płynności.
  expect(JSON.stringify(await page.evaluate(() => window.SowieCloud.profile()))).not.toContain("quality");

  // Gra na tym urządzeniu startuje w oszczędzaniu (30 klatek/s).
  await open(page, "/LaczIHoduj/", "LaczIHoduj");
  expect(await call(page, "LaczIHoduj", "quality")).toMatchObject({ mode: "saver", level: 3 });

  // Menu pauzy w Sowich Torach: „Zawsze ostro”.
  await open(page, "/SowieTory/?seed=plynnosc", "SowieTory");
  expect((await call(page, "SowieTory", "quality")).fps).toBe(30);
  await page.locator("[data-start]").click();
  await expect.poll(() => call(page, "SowieTory", "screen")).toBe("playing");
  await page.locator(".sowie-hud-pause").click();
  const dialog = page.getByRole("dialog", { name: "Pauza" });
  await dialog.getByRole("button", { name: "Ustawienia" }).click();
  const pauseGroup = dialog.getByRole("radiogroup", { name: "Płynność" });
  await expect(pauseGroup.getByRole("radio", { name: "Oszczędzanie baterii" })).toHaveAttribute("aria-checked", "true");
  await pauseGroup.getByRole("radio", { name: "Zawsze ostro" }).click();
  await expect(pauseGroup.getByRole("radio", { name: "Zawsze ostro" })).toHaveAttribute("aria-checked", "true");
  expect(await call(page, "SowieTory", "quality")).toMatchObject({ mode: "sharp", level: 0, fps: 60 });
  expect(await stored()).toBe("sharp");
  expect(errors).toEqual([]);
});

test("propozycja „Oszczędzania baterii” w Sowich Ogrodach: dopiero gdy automat zszedł najniżej i dalej nie nadąża", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await open(page, "/SowieOgrody/", "SowieOgrody");
  const banner = page.locator(".sowie-slow-banner");
  // Na najwyższym poziomie automat najpierw sam schodzi niżej — bez propozycji.
  expect(await call(page, "SowieOgrody", "simulateSlow", 4)).toBe(false);
  await expect(banner).toHaveCount(0);
  await call(page, "SowieOgrody", "setQualityLevel", 2);
  expect(await call(page, "SowieOgrody", "simulateSlow", 6)).toBe(true);
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("Gra trochę zwalnia");
  await banner.getByRole("button", { name: "Włącz" }).click();
  await expect(banner).toHaveCount(0);
  expect(await call(page, "SowieOgrody", "quality")).toMatchObject({ mode: "saver", level: 3 });
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).prefs.quality.mode, DEVICE_KEY)).toBe(
    "saver",
  );
  expect(errors).toEqual([]);
});
