// Gatunki sów (Analiza 2, rozdz. 2.2; Analiza 3, E9c — Sowi Butik): tylko kosmetyka, bez wpływu na rozgrywkę.
// Każdy gatunek to inna paleta tych samych części SVG sowy (assets/svg/sowa/) — kolory podmienia atlas przed
// rasteryzacją (`atlas.setTransform(speciesTransform(id))`). Kontur #3b2f4a, oczy i różowe policzki zostają.

// Kolory Sówki w plikach sowa/*.svg (cialo, skrzydla, stopy): klucz palety → kolor oryginalny.
export const OWL_PALETTE = Object.freeze({
  dark: "#8a5a3b", // uszka i lotki skrzydeł
  body: "#b07a52", // tułów i skrzydła
  face: "#e2b98f", // tarcza twarzy i wzorek na brzuszku
  belly: "#f3e3c8", // brzuszek
  beak: "#f59e3b", // dziobek i stopy
});

export const SPECIES = Object.freeze([
  { id: "sowka", label: "Sówka", text: "Nasza bohaterka — brązowa, z różowymi policzkami.", colors: OWL_PALETTE },
  {
    id: "puszczyk",
    label: "Puszczyk",
    text: "Szarobrązowy mieszkaniec parków i lasów.",
    colors: { dark: "#5f5144", body: "#8c7b6b", face: "#d3c2a8", belly: "#eee4d2", beak: "#e9b44c" },
  },
  {
    id: "pojdzka",
    label: "Pójdźka",
    text: "Mała sówka w białe kropeczki, lubi stare sady.",
    colors: { dark: "#6a5644", body: "#937b60", face: "#e2d6c0", belly: "#f6efe2", beak: "#e8d36a" },
  },
  {
    id: "uszatka",
    label: "Uszatka",
    text: "Pomarańczowa, z długimi uszkami z piór.",
    colors: { dark: "#7a4626", body: "#c4773a", face: "#f2ab62", belly: "#f7dcb6", beak: "#7d5a3c" },
  },
  {
    id: "plomykowka",
    label: "Płomykówka",
    text: "Złocista, z białą twarzą w kształcie serca.",
    colors: { dark: "#b47c3e", body: "#deb06c", face: "#fffaf2", belly: "#fffaf2", beak: "#e9c7a1" },
  },
  {
    id: "sniezna",
    label: "Śnieżna",
    text: "Biała jak śnieg, z szarymi plamkami.",
    colors: { dark: "#aab3c2", body: "#eef1f6", face: "#ffffff", belly: "#dfe5ee", beak: "#6f6a80" },
  },
  {
    id: "puchacz",
    label: "Puchacz",
    text: "Największa sowa w Polsce — dumny i puszysty.",
    colors: { dark: "#5a3820", body: "#9c642c", face: "#d99e62", belly: "#ebc48e", beak: "#4f4033" },
  },
]);

export const DEFAULT_SPECIES = "sowka";

export const speciesById = (id) => SPECIES.find((item) => item.id === id) || null;

/** Tekst SVG części sowy w kolorach gatunku (tylko kolory z OWL_PALETTE, wielkość liter bez znaczenia). */
export function recolorOwl(svgText, species) {
  const colors = speciesById(species)?.colors;
  if (!colors || colors === OWL_PALETTE) return svgText;
  // Jedno przejście: podmieniony kolor nie jest zamieniany drugi raz.
  return svgText.replace(ORIGINALS, (match) => colors[KEY_OF[match.toLowerCase()]]);
}

const KEY_OF = Object.fromEntries(Object.entries(OWL_PALETTE).map(([key, color]) => [color, key]));
const ORIGINALS = new RegExp(Object.values(OWL_PALETTE).join("|"), "gi");

/** Zmiana wyglądu dla atlasu: przekolorowuje pliki sowa/*.svg; Sówka (domyślna) → null (bez zmian). */
export function speciesTransform(species) {
  if (!speciesById(species) || species === DEFAULT_SPECIES) return null;
  return (file, text) => (file.startsWith("sowa/") ? recolorOwl(text, species) : text);
}
