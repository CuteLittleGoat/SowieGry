// Wspólne fikstury testów e2e.
// Bezpiecznik: żaden test nie może połączyć się z produkcyjnym Firestore (projekt współdzielony).
// Każde żądanie do usług Google Firebase jest przerywane, a test kończy się błędem.
// SDK Firebase 12.19.0 jest podawane z node_modules/firebase (pliki identyczne z gstatic),
// więc testy nie zależą od sieci ani CDN.
const path = require("node:path");
const base = require("@playwright/test");

const SDK_ROUTE = "https://www.gstatic.com/firebasejs/12.19.0/*.js";
const SDK_DIR = path.join(__dirname, "..", "..", "node_modules", "firebase");
const DEVICE_KEY = "sowiegry:urzadzenie";

async function blockProduction(context, blocked) {
  await context.route(SDK_ROUTE, (route) =>
    route.fulfill({
      path: path.join(SDK_DIR, path.basename(new URL(route.request().url()).pathname)),
      contentType: "text/javascript; charset=utf-8",
      headers: { "Access-Control-Allow-Origin": "*" },
    }),
  );
  await context.route(
    (url) => PRODUCTION_HOSTS.test(url.hostname),
    (route) => {
      blocked.push(route.request().url());
      return route.abort();
    },
  );
}

const PRODUCTION_HOSTS = /(^|\.)(firestore|firebaseinstallations|identitytoolkit|securetoken)\.googleapis\.com$/;

// Zapamiętane odblokowanie urządzenia (jak po wpisaniu hasła) z unikalnym identyfikatorem urządzenia.
async function unlockDevice(context) {
  await context.addInitScript((key) => {
    if (localStorage.getItem(key)) return;
    const id = `d-${Math.random().toString(36).slice(2, 8).padEnd(6, "0")}`;
    localStorage.setItem(key, JSON.stringify({ unlocked: true, deviceId: id, cleaned: true }));
  }, DEVICE_KEY);
}

// Diagnostyka WebKit: dekodowanie długich nagrań (muzyka), start i stop ich odtwarzania, wznowienie i uśpienie
// kontekstu audio oraz sygnał „strona żyje” co sekundę trafiają do konsoli. Ślad nieudanego testu (trace) pokazuje
// wtedy, co działo się tuż przed ewentualnym zawieszeniem strony. Tylko zapis w konsoli — zachowanie bez zmian.
async function traceWebAudio(context) {
  await context.addInitScript(() => {
    const Source = window.AudioBufferSourceNode;
    const Context = window.BaseAudioContext || window.AudioContext;
    if (!Source || !Context) return;
    const log = (text) => console.debug(`[webaudio ${performance.now().toFixed(0)} ms] ${text}`);
    const isLong = (node) => (node.buffer?.duration ?? 0) > 3;
    for (const name of ["start", "stop"]) {
      const original = Source.prototype[name];
      Source.prototype[name] = function (...args) {
        const long = isLong(this);
        if (long) log(`${name}(${args.join(", ")}) ${this.buffer.duration.toFixed(2)} s, pętla: ${this.loop} …`);
        const result = original.apply(this, args);
        if (long) log(`${name} gotowe`);
        return result;
      };
    }
    const decode = Context.prototype.decodeAudioData;
    Context.prototype.decodeAudioData = function (data, ...rest) {
      const bytes = data?.byteLength ?? 0;
      const result = decode.call(this, data, ...rest);
      if (bytes > 50_000) {
        log(`dekodowanie ${bytes} B …`);
        result?.then?.(
          (buffer) => log(`zdekodowano ${bytes} B → ${buffer.duration.toFixed(2)} s, ${buffer.sampleRate} Hz`),
          (error) => log(`błąd dekodowania ${bytes} B: ${error}`),
        );
      }
      return result;
    };
    const AudioContextClass = window.AudioContext;
    for (const name of ["resume", "suspend"]) {
      const original = AudioContextClass?.prototype?.[name];
      if (!original) continue;
      AudioContextClass.prototype[name] = function (...args) {
        log(`${name}() przy stanie ${this.state}`);
        return original.apply(this, args);
      };
    }
    setInterval(() => log("strona żyje"), 1000);
  });
}

// Nowy kontekst przeglądarki = „drugie urządzenie” (własny localStorage i IndexedDB).
async function newDevice(browser, contextOptions = {}, { unlocked = true } = {}) {
  const context = await browser.newContext(contextOptions);
  const blocked = [];
  await blockProduction(context, blocked);
  if (unlocked) await unlockDevice(context);
  return { context, blocked };
}

async function waitForCloud(page) {
  await page.waitForFunction(() => window.SowieCloud?.isReady?.() === true, null, { timeout: 20_000 });
}

// Telefon: przejście do innej aplikacji / blokada ekranu i powrót (visibilitychange).
async function setVisibility(page, state) {
  await page.evaluate((next) => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => next });
    Object.defineProperty(document, "hidden", { configurable: true, get: () => next === "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  }, state);
}

function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (!text.includes("favicon.ico")) errors.push(`console: ${text}`);
  });
  page.on("response", (response) => {
    if (response.status() < 400 || response.url().includes("favicon.ico")) return;
    errors.push(`http ${response.status()}: ${response.url()}`);
  });
  return errors;
}

const test = base.test.extend({
  // false = urządzenie bez zapamiętanego hasła (testy ekranu „Hasło sowy”).
  odblokowane: [true, { option: true }],
  productionRequests: [
    async ({ context, odblokowane }, use) => {
      const blocked = [];
      await blockProduction(context, blocked);
      if (odblokowane) await unlockDevice(context);
      await use(blocked);
      base.expect(blocked, "test próbował połączyć się z produkcyjnym Firestore").toEqual([]);
    },
    { auto: true },
  ],
  webAudioTrace: [
    async ({ context, browserName }, use) => {
      if (browserName === "webkit") await traceWebAudio(context);
      await use();
    },
    { auto: true },
  ],
});

module.exports = {
  test,
  expect: base.expect,
  blockProduction,
  unlockDevice,
  newDevice,
  waitForCloud,
  setVisibility,
  watchErrors,
  DEVICE_KEY,
};
