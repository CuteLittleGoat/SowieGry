// Miniatury Galerii Sów: Obrazki/*.jpg (1200 × 900) → assets/gallery-thumbs/<nazwa>-400.webp i -600.webp.
// Chromium z Playwright skaluje zdjęcie na płótnie (wygładzanie „high”) i koduje WebP. Uruchomienie: node scripts/make-thumbs.cjs
const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");

const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "Obrazki");
const TARGET = path.join(ROOT, "assets", "gallery-thumbs");
const SIZES = [
  { width: 400, height: 300, quality: 0.78 },
  { width: 600, height: 450, quality: 0.72 },
];

(async () => {
  fs.mkdirSync(TARGET, { recursive: true });
  const files = fs
    .readdirSync(SOURCE)
    .filter((name) => name.endsWith(".jpg"))
    .sort();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let total = 0;
  for (const file of files) {
    const data = fs.readFileSync(path.join(SOURCE, file)).toString("base64");
    const results = await page.evaluate(
      async ({ data, sizes }) => {
        const image = new Image();
        image.src = `data:image/jpeg;base64,${data}`;
        await image.decode();
        return sizes.map(({ width, height, quality }) => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");
          context.imageSmoothingQuality = "high";
          context.drawImage(image, 0, 0, width, height);
          return canvas.toDataURL("image/webp", quality).split(",")[1];
        });
      },
      { data, sizes: SIZES },
    );
    SIZES.forEach(({ width }, index) => {
      const buffer = Buffer.from(results[index], "base64");
      total += width === 400 ? buffer.length : 0;
      fs.writeFileSync(path.join(TARGET, `${file.replace(/\.jpg$/, "")}-${width}.webp`), buffer);
    });
  }
  await browser.close();
  console.log(`${files.length} zdjęć, miniatury 400 px razem ${(total / 1024).toFixed(0)} KB`);
})();
