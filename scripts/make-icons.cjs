// Generuje ikony PNG aplikacji (PWA) z assets/icons/icon.svg przy użyciu Chromium z Playwright.
// Uruchomienie: node scripts/make-icons.cjs (wynik jest w repo; ponownie tylko po zmianie icon.svg).
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");

const root = path.join(__dirname, "..");
const svg = fs.readFileSync(path.join(root, "assets/icons/icon.svg"), "utf8");
const outputs = [
  { file: "icon-192.png", size: 192, padding: 0 },
  { file: "icon-512.png", size: 512, padding: 0 },
  { file: "icon-maskable-512.png", size: 512, padding: 0 },
  { file: "apple-touch-icon.png", size: 180, padding: 0 },
  { file: "favicon-32.png", size: 32, padding: 0 },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const { file, size } of outputs) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
      `<html><body style="margin:0;background:transparent">${svg.replace(/width="512" height="512"/, `width="${size}" height="${size}"`)}</body></html>`,
    );
    await page.locator("svg").screenshot({ path: path.join(root, "assets/icons", file), omitBackground: true });
    console.log(`assets/icons/${file} (${size}×${size})`);
  }
  await browser.close();
})();
