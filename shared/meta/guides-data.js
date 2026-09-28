// Instrukcje gier — jedno źródło dla menu („Jak grać”) i menu pauzy (Analiza 2, rozdz. 4.1 i 4.3).
// Etap E2d: struktura i karta „Poznaj Sowi Świat”. Treść obecnych gier przenosi tu E3 (z shared/game-guides.js),
// a nowe gry dopisują swoje karty w E4–E8.
//
// Struktura przewodnika:
//   { id, title, summary, cards: [karta, …] }
// Karta (jedna „strona” przewijana w bok):
//   {
//     id:      "unikalny-w-przewodniku",
//     title:   "Krótki tytuł",
//     text:    "1–2 zdania po polsku (min. 16 px na ekranie)",
//     sprite?: nazwa grafiki z shared/world/catalog.js (np. "sowa-bieg-1"),
//     gesture?: "tap" | "hold" | "swipe-up" | "swipe-down" | "swipe-left" | "swipe-right" | "drag",
//     tip?:    "dodatkowa wskazówka",
//   }

export const GESTURES = Object.freeze({
  tap: "Stuknij",
  hold: "Przytrzymaj",
  "swipe-up": "Przesuń w górę",
  "swipe-down": "Przesuń w dół",
  "swipe-left": "Przesuń w lewo",
  "swipe-right": "Przesuń w prawo",
  drag: "Przeciągnij",
});

export const GUIDES = Object.freeze({
  swiat: {
    id: "swiat",
    title: "Poznaj Sowi Świat",
    summary: "Te same postacie grają we wszystkich grach — raz poznane, rozpoznasz je wszędzie.",
    cards: [
      {
        id: "sowka",
        title: "Sówka",
        text: "To Ty! Biegasz, skaczesz, szybujesz i zbierasz liście. Dodatki z garderoby nosisz w każdej grze.",
        sprite: "sowa-radosc",
      },
      {
        id: "liscie",
        title: "Liście monstery",
        text: "Zielony liść to 10 punktów, złoty — 50, a tęczowy uruchamia Gorączkę Monster: przez 8 s liście liczą się podwójnie.",
        sprite: "lisc-teczowy",
        tip: "Liście układają się w łuki i linie — pokazują, jak ominąć przeszkodę.",
      },
      {
        id: "pracu",
        title: "Pracu Pracu",
        text: "Dymki, telefony i maile ruszają się i zaskakują. Zawsze zapowiada je „!” przy krawędzi ekranu i dzwonek.",
        sprite: "pracu-dymek",
      },
      {
        id: "amic",
        title: "Amic",
        text: "Dystrybutory, cysterny i znaki cen stoją w miejscu i są ciężkie. Przeskocz je albo prześlizgnij się pod nimi.",
        sprite: "amic-dystrybutor",
      },
      {
        id: "kozki",
        title: "Skaczące kózki",
        text: "Złap kózkę, a pomoże Ci: sprężynka, tarcza, magnes, turbo albo podwójne liście. Kózka nigdy nie szkodzi.",
        sprite: "kozka-tarcza-skok",
      },
      {
        id: "humbak",
        title: "Humbak",
        text: "Napełnij Plusk-o-metr liśćmi, a humbak zabierze Cię na spokojny poziom bonusowy bez przeszkód.",
        sprite: "humbak",
      },
      {
        id: "zycia",
        title: "Serduszka-doniczki",
        text: "To Twoje życia. Po trafieniu jedno więdnie — ale gra zawsze daje chwilę na złapanie oddechu.",
        sprite: "zycie",
      },
    ],
  },
});

// Sprawdza przewodnik (błędy jako lista napisów — pusta, gdy wszystko w porządku).
export function validateGuide(guide, { sprites = null } = {}) {
  const errors = [];
  if (!guide || typeof guide !== "object") return ["brak przewodnika"];
  for (const key of ["id", "title", "summary"])
    if (typeof guide[key] !== "string" || !guide[key].trim()) errors.push(`brak pola ${key}`);
  if (!Array.isArray(guide.cards) || guide.cards.length === 0) errors.push("brak kart");
  const ids = new Set();
  for (const card of guide.cards || []) {
    if (!card.id || ids.has(card.id)) errors.push(`karta bez unikalnego id: ${card.id}`);
    ids.add(card.id);
    if (!card.title || !card.text) errors.push(`karta ${card.id}: brak tytułu lub tekstu`);
    if (card.gesture && !GESTURES[card.gesture]) errors.push(`karta ${card.id}: nieznany gest ${card.gesture}`);
    if (card.sprite && sprites && !sprites[card.sprite]) errors.push(`karta ${card.id}: brak grafiki ${card.sprite}`);
  }
  return errors;
}

export function guideFor(id) {
  return GUIDES[id] || null;
}
