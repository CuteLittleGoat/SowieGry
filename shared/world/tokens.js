// Tokeny „Sowiego Świata” (Analiza 2, rozdz. 2.3) — wspólne dla CSS (tokens.css) i JS (rysowanie na canvasie).
// Test jednostkowy pilnuje, żeby obie listy były identyczne, a grafiki SVG używały tylko tych kolorów.

export const COLORS = Object.freeze({
  // Paleta z Analizy 2
  nieboGora: "#bfe9ff",
  nieboDol: "#fff6e3",
  monstera: "#3fae6a",
  monsteraCiemna: "#2e8b57",
  zloto: "#f4c542",
  policzki: "#ff9fb2",
  kontur: "#3b2f4a",
  pracu: "#e8465a",
  amicZielony: "#2fa84f",
  amicCzerwony: "#d9303e",
  woda: "#5cc8e8",
  sowa: "#b07a52",
  sowaBrzuszek: "#f3e3c8",
  // Uzupełnienia etapu E2b (odcienie potrzebne postaciom)
  bialy: "#ffffff",
  sowaCiemna: "#8a5a3b",
  sowaTwarz: "#e2b98f",
  dziobek: "#f59e3b",
  monsteraJasna: "#8fdcaa",
  zlotoCiemne: "#d99a1e",
  pomaranczowy: "#ff9d4d",
  fiolet: "#9b6ddb",
  niebieski: "#4d9de0",
  wodaCiemna: "#3a86b8",
  wodaJasna: "#dff5fb",
  koza: "#fffaf2",
  kozaCien: "#eadcc6",
  rogi: "#c9a47e",
  serce: "#ff6f91",
  szary: "#c9c3d3",
  szaryCiemny: "#7d7590",
  doniczka: "#e57a5c",
});

// Grubość konturu w jednostkach pliku SVG 128 × 128 (ok. 3 px przy sowie wysokiej na 96 px).
export const OUTLINE = 4;

export const FONT_FAMILY = '"Fredoka", system-ui, -apple-system, "Segoe UI", sans-serif';
export const FONT_WEIGHTS = Object.freeze({ tekst: 500, pogrubiony: 700 });

// Nazwa tokenu CSS (--nazwa-z-myslnikami) dla klucza JS (nazwaCamelCase).
export function cssName(key) {
  return `--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

// Font canvasu, np. font(24) → '700 24px "Fredoka", …'.
export function font(size, weight = FONT_WEIGHTS.pogrubiony) {
  return `${weight} ${size}px ${FONT_FAMILY}`;
}
