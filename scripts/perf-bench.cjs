// Pomiar płynności gier (Analiza 6, W7) — uruchamiany ręcznie, nie w CI (liczenie klatek na maszynach CI jest zbyt
// nierówne; w CI są liczniki pracy z tests/e2e/telefon/plynnosc.spec.js). Chromium z Playwrighta na profilu telefonu
// właściciela „Redmi Note 10 Pro” (393 × 873 px CSS, gęstość ekranu 2,75), procesor spowolniony przez Chrome DevTools
// (Emulation.setCPUThrottlingRate: ×3–×4 ≈ ten telefon, ×6 ≈ słabszy). Gry w trybie pamięci (?cloud=memory) — skrypt
// nigdy nie łączy się z Firestore (żądania do usług Google są przerywane), a stan „późnej gry” Sowich Ogrodów
// i pominięte samouczki gier zręcznościowych są podawane tylko w tej karcie przeglądarki.
//
// Najpierw serwer: `npm run serve` (port 4173), potem w drugim oknie:
//   node scripts/perf-bench.cjs                      — wszystkie gry, CPU ×4
//   node scripts/perf-bench.cjs --cpu 1,4,6          — kilka spowolnień
//   node scripts/perf-bench.cjs --gry ogrody,tory    — wybrane gry (ogrody, lacz, tory, ucieczka, chmury, menu)
//   node scripts/perf-bench.cjs --tryb sharp         — „Płynność”: auto (domyślnie), sharp (Zawsze ostro), saver
//   node scripts/perf-bench.cjs --sekundy 4 --url http://127.0.0.1:4173
// Inna przeglądarka Chromium niż pobrana przez Playwrighta: zmienna SOWIE_CHROMIUM (ścieżka do pliku).
// Wynik: tabela Markdown (do wklejenia w Analizy/STAN_PRAC.md) — klatki na sekundę (ekran: ile klatek przeglądarka
// zdążyła pokazać; gra: ile narysowała gra), 95. percentyl i najdłuższa przerwa między klatkami, zajętość wątku strony,
// ostrość płótna i poziom automatu płynności na końcu pomiaru.
const { chromium } = require("@playwright/test");

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index > 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const BASE = option("url", "http://127.0.0.1:4173").replace(/\/$/, "");
const CPU = option("cpu", "4")
  .split(",")
  .map(Number)
  .filter((value) => value >= 1);
const GAMES = option("gry", "ogrody,lacz,tory,ucieczka,chmury,trojki,menu").split(",");
const MODE = option("tryb", "auto");
const SECONDS = Number(option("sekundy", "6")) || 6;

// Profil telefonu właściciela (Analiza 6, rozdz. 10.2).
const PHONE = {
  viewport: { width: 393, height: 873 },
  deviceScaleFactor: 2.75,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (Linux; Android 13; Redmi Note 10 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
};

// Sowie Ogrody „późna gra”: 21 rozdziałów, wszystkie 43 gatunki po 150 sztuk (najwięcej rysowania).
const CHAPTERS =
  "parapet balkon dzialka basen szklarnia arboretum palmiarnia dzungla japonski oaza zimowy wodny dach ksiezycowy czarownica nawiedzony zaczarowany smoczy grota wrozki podniebny".split(
    " ",
  );
const PLANTS =
  "monstera pilea paproc alokazja kaktus slonecznik storczyk lotos bonsai mutant zloteDrzewko palma strelicja bambus dzbanecznik sakura klon agawa daktylowiec ciemiernik ostrokrzew grzybienie wiktoria lawenda figowiec ksiezycowa gwiezdny belladonna mandragora tojad dynia kwiatPaproci muchomor smoczeDrzewo ognisty krysztalowaRoza dzwonek naparstnica tulipan chmurnik sowiStorczyk feniks drzewoZycia".split(
    " ",
  );
const LATE_GARDEN = {
  version: 3,
  leaves: 1e40,
  runLeaves: 2e40,
  lifetimeLeaves: 5e41,
  seeds: 5e12,
  plants: Object.fromEntries(PLANTS.map((id) => [id, 150])),
  upgrades: { konewka: 1 },
  prestige: {},
  chapters: Object.fromEntries(CHAPTERS.map((id) => [id, true])),
  stats: { prestiges: 50, taps: 9000 },
  tutorialDone: true,
  scene: "auto",
};
const SEED_DOCS = {
  "sowiegry/profil/sowiegry_gry/ogrody": { state: JSON.stringify(LATE_GARDEN), saveVersion: 3 },
  "sowiegry/profil/sowiegry_gry/runner": { tutorialDone: true },
  "sowiegry/profil/sowiegry_gry/sowa3": { tutorialDone: true },
  "sowiegry/profil/sowiegry_gry/jumper": { tutorialDone: true },
};

// Scenariusze: `start` przygotowuje grę, `action` (w stronie) zaczyna działania gracza i zwraca funkcję stop.
const SCENARIOS = {
  ogrody: {
    url: "/SowieOgrody/?cloud=memory",
    hook: "SowieOgrody",
    runs: [
      { name: "Sowie Ogrody — spokój", action: "none" },
      { name: "Sowie Ogrody — stukanie 14/s", action: "taps" },
      { name: "Sowie Ogrody — zdarzenia i konewka", action: "events" },
      { name: "Sowie Ogrody — przesuwanie półki", action: "shelf" },
      { name: "Sowie Ogrody — wszystko naraz", action: "taps,events,shelf" },
      { name: "Sowie Ogrody — Zatoka Humbaka + stukanie", action: "bay,taps" },
    ],
  },
  lacz: {
    url: "/LaczIHoduj/?cloud=memory",
    hook: "LaczIHoduj",
    fill: true,
    runs: [
      { name: "Łącz i Hoduj — pełna plansza, spokój", action: "none" },
      { name: "Łącz i Hoduj — przeciąganie rośliny", action: "drag" },
    ],
  },
  tory: {
    url: "/SowieTory/?cloud=memory&seed=perf",
    hook: "SowieTory",
    run: true,
    runs: [{ name: "Sowie Tory — bieg" }],
  },
  ucieczka: {
    url: "/SowiaUcieczka/?cloud=memory&seed=perf",
    hook: "SowiaUcieczka",
    run: true,
    runs: [{ name: "Sowia Ucieczka — bieg" }],
  },
  chmury: {
    url: "/SowaWChmurach/?cloud=memory&seed=perf",
    hook: "SowaWChmurach",
    run: true,
    runs: [{ name: "Sowa w Chmurach — lot" }],
  },
  // Sowie Trójki (podgląd): poziom 7 (karteczki), ruch z podpowiedzi, gdy plansza stoi — animacje bez przerwy.
  trojki: {
    url: "/SowieTrojki/?cloud=memory",
    hook: "SowieTrojki",
    run: true,
    startArg: 7,
    runs: [
      { name: "Sowie Trójki — spokój (Sówka oddycha)", action: "none" },
      { name: "Sowie Trójki — ruch za ruchem", action: "moves" },
    ],
  },
  menu: { url: "/?cloud=memory", runs: [{ name: "Menu (zakładka Gry)" }] },
};

const percentile = (list, p) => {
  if (!list.length) return 0;
  const sorted = [...list].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
};

// Działania gracza w stronie (zdarzenia wskaźnika na płótnie, wywołania zdarzeń gry); zwraca nic — stop w window.
function startActions({ actions, hook }) {
  const canvas = document.querySelector("[data-canvas]") || document.querySelector("canvas");
  const box = canvas.getBoundingClientRect();
  const fire = (type, x, y, id) =>
    canvas.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: id,
        pointerType: "touch",
        isPrimary: id === 1,
        clientX: box.left + x,
        clientY: box.top + y,
        button: 0,
        buttons: type === "pointerup" || type === "pointercancel" ? 0 : 1,
      }),
    );
  const timers = [];
  const stops = [];
  let tapId = 10;
  if (actions.includes("bay")) {
    window[hook].fillSplash();
    document.querySelector('[data-alert="bay"]')?.click();
  }
  if (actions.includes("taps")) {
    timers.push(
      setInterval(() => {
        tapId += 1;
        const id = tapId;
        const x = box.width * (0.2 + Math.random() * 0.6);
        const y = box.height * (0.3 + Math.random() * 0.4);
        fire("pointerdown", x, y, id);
        setTimeout(() => fire("pointerup", x, y, id), 30);
      }, 70),
    );
  }
  if (actions.includes("events")) {
    const again = () => {
      for (const type of ["pracu", "truck", "goat"]) window[hook].trigger(type);
      document.querySelector("[data-water]")?.click();
    };
    again();
    timers.push(setInterval(again, 1500));
  }
  if (actions.includes("shelf")) {
    let x = box.width * 0.2;
    let direction = 1;
    let time = 0;
    fire("pointerdown", x, box.height * 0.75, 1);
    timers.push(
      setInterval(() => {
        time += 16;
        x += direction * 6;
        if (time % 1000 < 16) direction = -direction;
        fire("pointermove", x, box.height * 0.75, 1);
      }, 16),
    );
    stops.push(() => fire("pointerup", x, box.height * 0.75, 1));
  }
  if (actions.includes("moves")) {
    // Sowie Trójki: gdy plansza stoi — ruch z podpowiedzi; cele i ruchy wracają, żeby poziom trwał.
    timers.push(
      setInterval(() => {
        const game = window[hook];
        const state = game.state();
        if (!state || state.phase !== "play" || game.busy()) return;
        state.goals.forEach((_, at) => game.setGoalDone(at, 0));
        if (state.moves <= 2) game.setMoves(30);
        const move = game.hint();
        if (move?.type === "tap") game.tap(move.a);
        else if (move) game.swap(move.a, move.b);
      }, 200),
    );
  }
  if (actions.includes("drag")) {
    const start = window[hook].cellCenter(10);
    let step = 0;
    fire("pointerdown", start.x, start.y, 1);
    timers.push(
      setInterval(() => {
        step += 1;
        fire("pointermove", start.x + Math.sin(step / 20) * 120, start.y + Math.cos(step / 25) * 160, 1);
      }, 16),
    );
    stops.push(() => fire("pointercancel", start.x, start.y, 1));
  }
  window.__benchStop = () => {
    timers.forEach(clearInterval);
    stops.forEach((stop) => stop());
  };
}

async function measureGame(browser, key, cpu) {
  const scenario = SCENARIOS[key];
  const rows = [];
  for (const run of scenario.runs) {
    const context = await browser.newContext(PHONE);
    // Bezpiecznik: żadnych połączeń z usługami Google (produkcyjny Firestore).
    await context.route(/googleapis\.com|gstatic\.com\/firebasejs/, (route) => route.abort());
    await context.addInitScript((mode) => {
      const device = { unlocked: true, deviceId: "d-bench0", cleaned: true };
      if (mode !== "auto") device.prefs = { quality: { mode, level: 0 } };
      localStorage.setItem("sowiegry:urzadzenie", JSON.stringify(device));
      window.__frames = [];
      const loop = (time) => {
        window.__frames.push(time);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }, MODE);
    // Stan gier tylko w tej karcie: dokumenty wpisane do pamięciowej „chmury” (MemoryBackend) przy jej tworzeniu.
    await context.route("**/shared/sowie-cloud.js", async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(
        "Promise.resolve(new MemoryBackend())",
        `Promise.resolve((() => { const b = new MemoryBackend(); for (const [p, d] of Object.entries(${JSON.stringify(SEED_DOCS)})) b.docs.set(p, d); return b; })())`,
      );
      await route.fulfill({ response, body, headers: { ...response.headers(), "content-type": "text/javascript" } });
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto(`${BASE}${scenario.url}`, { waitUntil: "load" });
    if (scenario.hook) {
      await page.waitForFunction(
        (hook) => window[hook]?.ready?.() && (window[hook].atlasReady?.() ?? true),
        scenario.hook,
        { timeout: 30_000 },
      );
    } else {
      await page.waitForFunction(() => window.SowieCloud?.isReady?.() === true, null, { timeout: 30_000 });
    }
    await page.waitForTimeout(1000);
    if (scenario.fill) {
      await page.evaluate((hook) => {
        const chains = ["monstera", "pilea", "paproc", "kaktus"];
        for (let index = 0; index < 63; index += 1) window[hook].place(index, 1 + (index % 5), chains[index % 4]);
      }, scenario.hook);
    }
    const cdp = await context.newCDPSession(page);
    await cdp.send("Performance.enable");
    if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
    if (scenario.run) {
      await page.evaluate(({ hook, arg }) => window[hook].start(arg), { hook: scenario.hook, arg: scenario.startArg });
    }
    if (run.action && run.action !== "none") {
      await page.evaluate(startActions, { actions: run.action.split(","), hook: scenario.hook });
    }
    await page.waitForTimeout(500);
    const readGame = () =>
      page.evaluate((hook) => {
        const game = hook ? window[hook] : null;
        return {
          frames: game?.renderStats?.().frames ?? null,
          quality: game?.quality?.() ?? null,
          state: game?.state?.() ?? null,
        };
      }, scenario.hook || null);
    const before = await cdp.send("Performance.getMetrics");
    const game0 = await readGame();
    const t0 = await page.evaluate(() => performance.now());
    await page.waitForTimeout(SECONDS * 1000);
    const t1 = await page.evaluate(() => performance.now());
    const after = await cdp.send("Performance.getMetrics");
    const game1 = await readGame();
    await page.evaluate(() => window.__benchStop?.());
    const frames = await page.evaluate(({ from, to }) => window.__frames.filter((t) => t >= from && t <= to), {
      from: t0,
      to: t1,
    });
    const canvas = await page.evaluate(() => {
      const node = document.querySelector("[data-canvas]") || document.querySelector("canvas");
      return node ? (node.width / Math.max(1, node.getBoundingClientRect().width)).toFixed(2) : "—";
    });
    const seconds = (t1 - t0) / 1000;
    const gaps = frames.slice(1).map((time, index) => time - frames[index]);
    const metric = (list, name) => list.metrics.find((entry) => entry.name === name)?.value || 0;
    const busy = ((metric(after, "TaskDuration") - metric(before, "TaskDuration")) / seconds) * 100;
    const gameFps = game0.frames !== null && game1.frames !== null ? (game1.frames - game0.frames) / seconds : null;
    // Czas gry względem zegara (gry zręcznościowe): dystans / wysokość — czy gra nie zwalnia.
    let progress = "";
    if (game0.state && game1.state) {
      const name = ["distance", "height", "time"].find(
        (field) => Number.isFinite(Number(game1.state[field])) && game1.state[field] !== game0.state[field],
      );
      if (name) progress = `${name} +${(Number(game1.state[name]) - Number(game0.state[name])).toFixed(1)}`;
    }
    rows.push(
      [
        run.name,
        `×${cpu}`,
        (gaps.length / seconds).toFixed(1),
        gameFps === null ? "—" : gameFps.toFixed(1),
        percentile(gaps, 95).toFixed(0),
        Math.max(0, ...gaps).toFixed(0),
        busy.toFixed(0),
        canvas,
        game1.quality ? `${game1.quality.level} (${game1.quality.mode})` : "—",
        [progress, errors.length ? `BŁĄD: ${errors[0]}` : ""].filter(Boolean).join("; ") || "—",
      ].join(" | "),
    );
    await context.close();
  }
  return rows;
}

(async () => {
  const executablePath = process.env.SOWIE_CHROMIUM || undefined;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  console.log(
    `Pomiar płynności: ${BASE}, profil Redmi Note 10 Pro (393 × 873, ×2,75), „Płynność”: ${MODE}, ${SECONDS} s`,
  );
  console.log("");
  console.log(
    "| Gra — scenariusz | CPU | kl./s ekran | kl./s gra | p95 ms | najdł. ms | wątek % | ostrość | automat | uwagi |",
  );
  console.log("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const cpu of CPU) {
    for (const key of GAMES) {
      if (!SCENARIOS[key]) {
        console.log(`| ${key} — nieznana gra (ogrody, lacz, tory, ucieczka, chmury, menu) | | | | | | | | | |`);
        continue;
      }
      for (const row of await measureGame(browser, key, cpu)) console.log(`| ${row} |`);
    }
  }
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
