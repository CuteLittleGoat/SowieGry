// Ładowanie zasobów: pliki SVG (tekst → obrazek w zadanym rozmiarze) i czcionka Fredoka.

const textCache = new Map();

// Pobiera plik tekstowy (np. SVG) raz na sesję strony.
export function loadText(url, { fetchImpl = globalThis.fetch } = {}) {
  if (!textCache.has(url)) {
    const request = fetchImpl(url).then((response) => {
      if (!response.ok) throw new Error(`Nie udało się wczytać ${url} (${response.status})`);
      return response.text();
    });
    request.catch(() => textCache.delete(url));
    textCache.set(url, request);
  }
  return textCache.get(url);
}

// Rozmiar z atrybutu viewBox: [x, y, szerokość, wysokość].
export function viewBoxOf(svgText) {
  const match = /<svg\b[^>]*\bviewBox="([^"]+)"/.exec(svgText);
  if (!match) throw new Error("SVG bez atrybutu viewBox");
  const values = match[1]
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) throw new Error("Błędny viewBox");
  return values;
}

// Ustawia width/height głównego <svg>, żeby przeglądarka narysowała wektor ostro w docelowym rozmiarze
// (Safari skaluje już zrasteryzowany obrazek, jeśli rozmiar się nie zgadza).
export function sizeSvg(svgText, width, height) {
  return svgText.replace(/<svg\b[^>]*>/, (tag) =>
    tag
      .replace(/\s(width|height)="[^"]*"/g, "")
      .replace(/^<svg/, `<svg width="${Math.round(width)}" height="${Math.round(height)}"`),
  );
}

// Zamienia tekst SVG na obrazek (HTMLImageElement) o rozmiarze width × height pikseli.
export async function svgToImage(svgText, width, height, { createImage = () => new Image() } = {}) {
  const blob = new Blob([sizeSvg(svgText, width, height)], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const image = createImage();
  image.decoding = "async";
  try {
    image.src = url;
    if (image.decode) await image.decode();
    else await new Promise((resolve, reject) => ((image.onload = resolve), (image.onerror = reject)));
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Czeka na czcionkę Fredoka (z shared/world/tokens.css); po czasie limitu rysujemy czcionką zapasową.
export async function loadFonts(
  descriptors = ['500 16px "Fredoka"', '700 16px "Fredoka"'],
  { timeoutMs = 3000, fonts = globalThis.document?.fonts } = {},
) {
  if (!fonts?.load) return false;
  const loading = Promise.all(descriptors.map((descriptor) => fonts.load(descriptor, "AaĄąŻż0123")))
    .then((results) => results.every((list) => list.length > 0))
    .catch(() => false);
  let timer;
  const timeout = new Promise((resolve) => (timer = setTimeout(() => resolve(false), timeoutMs)));
  const result = await Promise.race([loading, timeout]);
  clearTimeout(timer);
  return result;
}
