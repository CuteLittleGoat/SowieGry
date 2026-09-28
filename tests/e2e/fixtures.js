// Wspólne fikstury testów e2e.
// Bezpiecznik: żaden test nie może połączyć się z produkcyjnym Firestore (projekt współdzielony).
// Każde żądanie do usług Google Firebase jest przerywane, a test kończy się błędem.
// SDK Firebase 12.19.0 jest podawane z node_modules/firebase (pliki identyczne z gstatic),
// więc testy nie zależą od sieci ani CDN.
const path = require("node:path");
const base = require("@playwright/test");

const SDK_ROUTE = "https://www.gstatic.com/firebasejs/12.19.0/*.js";
const SDK_DIR = path.join(__dirname, "..", "..", "node_modules", "firebase");

const PRODUCTION_HOSTS = /(^|\.)(firestore|firebaseinstallations|identitytoolkit|securetoken)\.googleapis\.com$/;

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
  productionRequests: [
    async ({ context }, use) => {
      const blocked = [];
      await blockProduction(context, blocked);
      await use(blocked);
      base.expect(blocked, "test próbował połączyć się z produkcyjnym Firestore").toEqual([]);
    },
    { auto: true },
  ],
});

module.exports = { test, expect: base.expect, blockProduction, watchErrors };
