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
  // Obecne gry (treść przeniesiona z shared/game-guides.js w E3). Po przebudowie każdej gry podmieniamy jej karty.
  runner: {
    id: "runner",
    title: "SowaRunner",
    summary:
      "Biegnij jak najdalej, omijaj przeszkody i zbieraj liście. Tempo stale rośnie, więc liczą się rytm, obserwacja trasy i rozsądne używanie podwójnego skoku.",
    cards: [
      {
        id: "cel",
        title: "Cel gry",
        text: "Zdobywaj punkty, bij rekord dystansu i kończ długie biegi z jak najmniejszą liczbą obrażeń.",
        sprite: "sowa-bieg-2",
      },
      {
        id: "sterowanie",
        title: "Sterowanie",
        text: "Dotknięcie ekranu, kliknięcie lub Spacja to skok. Drugi skok można wykonać w powietrzu. Na ekranie tytułowym ten sam gest rozpoczyna bieg.",
        gesture: "tap",
        sprite: "sowa-skok",
      },
      {
        id: "podwojny-skok",
        title: "Podwójny skok",
        text: "Nie zużywaj drugiego skoku zbyt wcześnie — zachowaj go do korekty.",
        sprite: "pracu-dymek",
      },
      {
        id: "liscie",
        title: "Liście i seria",
        text: "Liście zwiększają serię i dają dodatkowe premie punktowe.",
        sprite: "lisc-zielony",
      },
      {
        id: "humbak",
        title: "Humbak",
        text: "Humbak uruchamia krótką minigrę bonusową.",
        sprite: "humbak",
      },
    ],
  },
  // Sowia Ucieczka — nowa wersja SowaRunner (podgląd w SowiaUcieczka/; po akceptacji zastąpi „runner”).
  ucieczka: {
    id: "ucieczka",
    title: "Sowia Ucieczka",
    summary:
      "Sówka ucieka przed Chmurą Pracu przez coraz bardziej zwariowane okolice. Skacz, szybuj i ślizgaj się, zbieraj liście monstery i nie daj się dogonić.",
    cards: [
      {
        id: "cel",
        title: "Cel gry",
        text: "Biegnij jak najdalej. Każde trafienie przybliża Chmurę Pracu — gdy dogoni sowę, bieg się kończy.",
        sprite: "sowa-bieg-2",
        tip: "400 m bez trafienia oddala chmurę o krok.",
      },
      {
        id: "skok",
        title: "Skok",
        text: "Stuknij w dowolnym miejscu ekranu. Drugie stuknięcie w powietrzu to podwójny skok.",
        gesture: "tap",
        sprite: "sowa-skok",
        tip: "Łuk liści nad przeszkodą pokazuje, jak ją przeskoczyć.",
      },
      {
        id: "szybowanie",
        title: "Szybowanie",
        text: "Przytrzymaj palec w powietrzu — sowa rozkłada skrzydła i opada powoli.",
        gesture: "hold",
        sprite: "sowa-szybuje",
        tip: "Długą cysternę Amic pokonasz podwójnym skokiem albo szybowaniem.",
      },
      {
        id: "slizg",
        title: "Ślizg",
        text: "Przesuń palcem w dół: na ziemi ślizg, w powietrzu szybkie opadanie, na platformie zeskok.",
        gesture: "swipe-down",
        sprite: "pracu-dymek",
        tip: "Pod dymkiem Pracu Pracu i znakiem z cenami Amic przejdziesz ślizgiem.",
      },
      {
        id: "przeszkody",
        title: "Pracu i Amic",
        text: "Pracu Pracu rusza się i zaskakuje (dymki, telefony, maile, karteczki). Amic stoi i jest ciężki (dystrybutory, cysterny, znaki, wózki).",
        sprite: "amic-dystrybutor",
        tip: "Znak „!” przy prawej krawędzi zapowiada coś, co jedzie szybciej niż reszta.",
      },
      {
        id: "bonusy",
        title: "Kózki i humbak",
        text: "Złap skaczącą kózkę: Sprężynka, Tarcza, Magnes, Turbo albo Podwajaczka. 60 liści albo 3 bąbelki napełniają Plusk-o-metr — wtedy 20 s rejsu na humbaku bez przeszkód.",
        sprite: "kozka-magnes-skok",
        tip: "Każde 3 zadania biegu podnoszą Sowi mnożnik, który mnoży punkty za dystans.",
      },
    ],
  },
  jumper: {
    id: "jumper",
    title: "SowaJumper",
    summary:
      "Automatycznie odbijająca się sowa wspina się po platformach. Ty sterujesz wyłącznie ruchem poziomym i wybierasz najbezpieczniejszą drogę ku górze.",
    cards: [
      {
        id: "cel",
        title: "Cel gry",
        text: "Wznieś się jak najwyżej, zbieraj liście i buduj serię precyzyjnych lądowań.",
        sprite: "sowa-skok",
      },
      {
        id: "sterowanie",
        title: "Sterowanie",
        text: "Na telefonie przytrzymaj lewą albo prawą połowę ekranu. Na klawiaturze: ←/→ lub A/D. Spacja albo dotknięcie ekranu tytułowego rozpoczyna grę.",
        gesture: "hold",
        sprite: "sowa-szybuje",
      },
      {
        id: "krawedz",
        title: "Przez krawędź",
        text: "Sowa przechodzi przez boczną krawędź i wraca z drugiej strony.",
        sprite: "sowa-bieg-4",
      },
      {
        id: "ladowanie",
        title: "Precyzyjne lądowanie",
        text: "Lądowanie blisko środka platformy podtrzymuje serię precyzji.",
        sprite: "sowa-radosc",
      },
      {
        id: "platformy",
        title: "Platformy",
        text: "Platformy Amic wybijają znacznie wyżej, a kruche rozpadają się po użyciu.",
        sprite: "amic-sterowiec",
      },
    ],
  },
  sowa3: {
    id: "sowa3",
    title: "Sowa3",
    summary:
      "Trzytorowy runner, w którym sowa pędzi przez kolejne plansze. Zmieniaj tor, zbieraj liście i unikaj obiektów nadciągających z głębi ekranu.",
    cards: [
      {
        id: "cel",
        title: "Cel gry",
        text: "Ukończ wszystkie plansze, osiągnij wysoki wynik i utrzymaj jak najdłuższe combo liści.",
        sprite: "sowa-bieg-5",
      },
      {
        id: "sterowanie",
        title: "Sterowanie",
        text: "Na telefonie przesuń palcem w lewo lub w prawo albo dotknij lewej lub prawej części ekranu. Na klawiaturze: ←/→ albo A/D.",
        gesture: "swipe-right",
        sprite: "sowa-bieg-2",
      },
      {
        id: "horyzont",
        title: "Patrz na horyzont",
        text: "Obserwuj horyzont, a nie samą sowę — daje to więcej czasu na reakcję.",
        sprite: "pracu-telefon-magda",
      },
      {
        id: "combo",
        title: "Combo liści",
        text: "Kolejne liście bez kolizji zwiększają combo i premię punktową.",
        sprite: "lisc-zloty",
      },
      {
        id: "plansze",
        title: "Plansze",
        text: "Każda plansza ma własne przeszkody i rytm, a na końcu etapu sowa wskakuje do basenu.",
        sprite: "plusk",
      },
    ],
  },
  ogrody: {
    id: "ogrody",
    title: "Sowie Ogrody",
    summary:
      "Gra idle/incremental o rozwijaniu ogrodu. Zbieraj liście, kupuj rośliny, odblokowuj strefy, podlewaj i stopniowo automatyzuj produkcję.",
    cards: [
      {
        id: "cel",
        title: "Cel gry",
        text: "Zbuduj coraz wydajniejszy ogród, wykonuj kontrakty i przeprowadzaj Wielkie Przesadzanie, aby zdobywać trwałe premie.",
        sprite: "lisc-zielony",
      },
      {
        id: "sterowanie",
        title: "Sterowanie",
        text: "Przycisk „Zbierz liście” daje natychmiastowy dochód. Zakładki służą do kupowania roślin, ulepszeń, automatyzacji i prestiżu, a przycisk z gwiazdką otwiera kontrakty ogrodnicze.",
        gesture: "tap",
        sprite: "sowa-stoi",
      },
      {
        id: "rosliny",
        title: "Najpierw rośliny",
        text: "Najpierw kupuj rośliny z najlepszym stosunkiem produkcji do ceny.",
        sprite: "zycie",
      },
      {
        id: "podlewanie",
        title: "Podlewanie",
        text: "Podlewanie czasowo wzmacnia ogród.",
        sprite: "plusk",
      },
      {
        id: "offline",
        title: "Ogród rośnie beze mnie",
        text: "Gra zapisuje się automatycznie i nalicza część produkcji, gdy Cię nie ma.",
        sprite: "sowa-mruga",
      },
    ],
  },
  szklarnia: {
    id: "szklarnia",
    title: "Sowia Szklarnia",
    summary:
      "Botaniczna gra idle o budowaniu pomieszczeń, sadzeniu roślin, badaniach i tworzeniu hybryd. Kozy próbują podjadać kolekcję, więc trzeba je regularnie przeganiać.",
    cards: [
      {
        id: "cel",
        title: "Cel gry",
        text: "Rozbuduj szklarnię, odkryj hybrydy, skompletuj album cech i utrzymuj wysoką radość sowy.",
        sprite: "lisc-teczowy",
      },
      {
        id: "sterowanie",
        title: "Sterowanie",
        text: "Zakładki służą do budowy, sadzenia, krzyżowania, badań i zarządzania kozami. „Podlej wszystko” wzmacnia rośliny, jeśli masz dość wody, a „SIO! SIO!” przegania aktywną kozę i może dać nagrodę.",
        gesture: "tap",
        sprite: "kozka-sprezynka-skok",
      },
      {
        id: "zasoby",
        title: "Woda i nasiona",
        text: "Rozwijaj produkcję wody i nasion równolegle z liśćmi.",
        sprite: "plusk",
      },
      {
        id: "krzyzowanie",
        title: "Krzyżowanie",
        text: "Dojrzałe rośliny są potrzebne do krzyżowania.",
        sprite: "lisc-zloty",
      },
      {
        id: "laboratorium",
        title: "Cele laboratorium",
        text: "Przycisk z gwiazdką pokazuje cele laboratorium i odkryte cechy.",
        sprite: "sowa-radosc",
      },
    ],
  },
});

// Kolejność przewodników w zakładce „Jak grać” (najpierw „Poznaj Sowi Świat”, potem gry jak w rejestrze).
export const GUIDE_ORDER = Object.freeze(["swiat", "runner", "jumper", "sowa3", "ogrody", "szklarnia"]);

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
