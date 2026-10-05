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
  // Sowia Ucieczka (E4) — zastąpiła SowaRunner; ten sam identyfikator gry „runner”.
  runner: {
    id: "runner",
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
  // Sowie Tory (SowieTory/, Analiza 3 E5) — od podmiany (E5f) gra „sowa3”.
  sowa3: {
    id: "sowa3",
    title: "Sowie Tory",
    summary:
      "Sowa biegnie w głąb ekranu po trzech torach przez sklep Biedronka, festiwal roślin, blokowisko PRL i stację Amic. Na mecie każdej planszy wskakuje do basenu i zmienia się w humbaka.",
    cards: [
      {
        id: "cel",
        title: "Cel gry",
        text: "Przebiegnij cztery plansze kampanii. Omijaj Pracu Pracu i Amic, zbieraj liście monstery i dbaj o serduszka.",
        sprite: "sowa-bieg-2",
        tip: "Każda plansza trwa ok. 75 s, a następna jest trochę szybsza.",
      },
      {
        id: "tory",
        title: "Zmiana toru",
        text: "Przesuń palcem w lewo lub w prawo (albo stuknij bok ekranu). Pełną przeszkodę — telefon, dystrybutor, wózek — omijasz tylko zmianą toru.",
        gesture: "swipe-left",
        sprite: "amic-dystrybutor",
        tip: "Cysterna Amic jest długa — zajmuje tor dłużej.",
      },
      {
        id: "skok",
        title: "Skok",
        text: "Przesuń palcem w górę (albo stuknij środek ekranu), żeby przeskoczyć niską przeszkodę: teczkę, budzik, barierkę, kanister.",
        gesture: "swipe-up",
        sprite: "pracu-teczka",
        tip: "Łuk liści nad przeszkodą pokazuje, że trzeba skoczyć.",
      },
      {
        id: "slizg",
        title: "Ślizg",
        text: "Przesuń palcem w dół, żeby prześlizgnąć się pod wysoką przeszkodą — dymkiem Pracu Pracu albo znakiem z cenami.",
        gesture: "swipe-down",
        sprite: "pracu-dymek",
        tip: "W powietrzu przesunięcie w dół szybko sprowadza sowę na ziemię i od razu zaczyna ślizg.",
      },
      {
        id: "dziki",
        title: "Dziki na blokowisku",
        text: "Na blokowisku PRL dzik szarżuje torem sowy. Gdy przy dolnej krawędzi toru miga strzałka, zmień tor.",
        sprite: "amic-barierka",
        tip: "Obok zawsze jest wolny tor. Udany unik: +30 pkt.",
      },
      {
        id: "kozki",
        title: "Kózki i Gorączka",
        text: "Wbiegnij w skaczącą kózkę: Sprężynka, Tarcza, Magnes, Podwajaczka albo Kózia jazda (8 s na kozie, która przeskakuje wszystko). Tęczowy liść uruchamia Gorączkę Monster.",
        sprite: "kozka-turbo-skok",
        tip: "Serduszko-doniczka nad torem daje dodatkowe życie.",
      },
      {
        id: "humbak",
        title: "Basen i Humbacze Tory",
        text: "Na mecie sowa wskakuje do basenu i zmienia się w humbaka. Przez 20 s płyniesz trzema torami i łapiesz liście w kółkach — w górę wyskok.",
        sprite: "humbak",
        tip: "Po rejsie: gwiazdki za ukończenie, 60% liści i planszę bez trafienia.",
      },
      {
        id: "nieskonczony",
        title: "Tryb Nieskończony",
        text: "Po ukończeniu kampanii odblokujesz tryb Nieskończony: cztery plansze w pętli, coraz szybciej, z osobnym rekordem.",
        sprite: "lisc-teczowy",
      },
    ],
  },
  // Sowa w Chmurach (SowaWChmurach/, Analiza 3 E6) — od podmiany (E6f) gra „jumper”.
  jumper: {
    id: "jumper",
    title: "Sowa w Chmurach",
    summary:
      "Sowa wspina się coraz wyżej — sama odbija się od gałązek, a Ty prowadzisz ją w bok. Od ogródka przez blok i chmury aż do zorzy i kosmosu.",
    cards: [
      {
        id: "cel",
        title: "Cel gry",
        text: "Leć jak najwyżej: 1 pkt za każdy metr. Liście monstery i idealne lądowania podbijają combo (do ×5).",
        sprite: "sowa-skok",
        tip: "Pięć stref: Ogródek, Blok (150 m), Chmury (400 m), Zorza (800 m), Kosmos (1500 m).",
      },
      {
        id: "sterowanie",
        title: "Sterowanie",
        text: "Przeciągnij palcem w lewo lub w prawo w dowolnym miejscu ekranu — sowa przesuwa się o tyle, o ile palec. Za krawędzią ekranu wychodzi z drugiej strony.",
        gesture: "swipe-right",
        sprite: "sowa-szybuje",
        tip: "Trzymaj kciuk nisko — nie zasłoni sowy. Możesz też włączyć przechylanie telefonu na ekranie tytułowym.",
      },
      {
        id: "platformy",
        title: "Platformy",
        text: "Gałązka — zwykła; liść Monstery — sprężysty (+10); chmurka znika po odbiciu; huśtawka się kołysze; balkon co 150 m; krucha gałązka łamie się pod sową.",
        sprite: "lisc-zielony",
        tip: "Od każdej pewnej platformy zawsze da się dolecieć do następnej.",
      },
      {
        id: "pracu-amic",
        title: "Pracu Pracu i Amic",
        text: "Pracu Pracu (dymki, maile, telefon) zdepcz z góry: +50 pkt i wybicie. Amic (sterowiec, kanistry, tablica cen) omijaj — trafienie zabiera serduszko.",
        sprite: "pracu-dymek",
        tip: "Pomarańczowy znacznik u góry ekranu: za sekundę spadnie kanister.",
      },
      {
        id: "kozki",
        title: "Kózki i Gorączka",
        text: "Złap skaczącą kózkę: Sprężynka (wystrzał na 40 m), Rakietka, Tarcza, Magnes albo Podwajaczka. Tęczowy liść uruchamia Gorączkę Monster.",
        sprite: "kozka-turbo-skok",
        tip: "Serduszko-doniczka daje dodatkowe życie.",
      },
      {
        id: "ocean",
        title: "Niebiański Ocean",
        text: "Co ok. 300 m na gałązce leży humbak z fontanną. Wleć w fontannę: 20 s skakania po humbakach w chmurach — bez upadku, z rzędami liści.",
        sprite: "humbak",
        tip: "Po oceanie sowa wraca nad gejzer z mocnym wybiciem.",
      },
      {
        id: "ratunek",
        title: "Upadek",
        text: "Gdy sowa spadnie, kózka łapie ją i odnosi na ostatnią pewną platformę — kosztuje to jedno serduszko.",
        sprite: "kozka-sprezynka-skok",
        tip: "Chill: 4 serduszka i bliższe gałązki; Chaos: dalsze gałązki i więcej przeszkód.",
      },
    ],
  },
  // Nowa odsłona Sowich Ogrodów (E7d2, podgląd SowieOgrody/nowa.html; poza GUIDE_ORDER — po podmianie w E7e
  // zastąpi przewodnik `ogrody`).
  ogrod: {
    id: "ogrod",
    title: "Sowie Ogrody",
    summary:
      "Sowa ogrodniczka sadzi rośliny od parapetu po arboretum. Stukaj w ogród, kupuj rośliny i wykonuj cele rozdziałów — ogród rośnie także wtedy, gdy Cię nie ma.",
    cards: [
      {
        id: "cel",
        title: "Cel gry",
        text: "Przejdź sześć rozdziałów: Parapet, Balkon, Działkę, Basen, Szklarnię i Arboretum. Cele bieżącego rozdziału są pod licznikiem liści.",
        sprite: "sowa-stoi",
        tip: "Każdy rozdział otwiera nowe rośliny i ulepszenia.",
      },
      {
        id: "liscie",
        title: "Liście",
        text: "Stukaj w ogród, żeby zbierać liście monstery, i kupuj za nie rośliny — każda zbiera liście co sekundę.",
        gesture: "tap",
        sprite: "lisc-zielony",
      },
      {
        id: "rosliny",
        title: "Rośliny i kamienie milowe",
        text: "Przy 10, 25, 50 i 100 sztukach roślina zmienia wygląd, a przy 25 i 100 zbiera dwa razy więcej. Przycisk „max” kupuje tyle, ile Cię stać.",
        sprite: "lisc-zloty",
      },
      {
        id: "konewka",
        title: "Konewka i Plusk-o-metr",
        text: "Konewka sowy podwaja zbiory na chwilę. Podlewanie i złote kózki napełniają Plusk-o-metr — pełny otwiera Zatokę Humbaka.",
        sprite: "plusk",
      },
      {
        id: "pracu-amic",
        title: "Pracu Pracu i Amic",
        text: "Dzwoniący telefon spowalnia ogród o 30% — odrzuć go. Ciężarówka Amic zastawia roślinę — stuknij ją trzy razy, żeby odjechała.",
        sprite: "pracu-telefon",
        tip: "Ulepszenia Tryb samolotowy i Kozi kurier zrobią to za Ciebie.",
      },
      {
        id: "kozka-zatoka",
        title: "Złota kózka i Zatoka Humbaka",
        text: "Złap złotą kózkę, zanim ucieknie — da premię. W Zatoce Humbaka łap liście z fontanny; łapanie pod rząd daje więcej.",
        sprite: "kozka-sprezynka",
      },
      {
        id: "przesadzanie",
        title: "Wielkie Przesadzanie",
        text: "Po Szklarni możesz zacząć ogród od nowa za nasiona na stałe ulepszenia. Gdy Cię nie ma, ogród rośnie dalej (do 4 godzin).",
        sprite: "sowa-mruga",
      },
    ],
  },
  // Łącz i Hoduj — nowa Sowia Szklarnia (E8d, podgląd LaczIHoduj/; poza GUIDE_ORDER — po podmianie w E8e zastąpi
  // przewodnik `szklarnia`).
  lacz: {
    id: "lacz",
    title: "Łącz i Hoduj",
    summary:
      "Spokojna gra logiczna na półkach szklarni: łącz takie same rośliny w coraz większe, oddawaj je sowim sąsiadkom i odnawiaj pomieszczenia.",
    cards: [
      {
        id: "laczenie",
        title: "Łączenie",
        text: "Przeciągnij roślinę na taką samą — połączą się w roślinę następnego poziomu. Roślina unosi się nad palcem, a zielone pole pokazuje, że się połączą.",
        gesture: "swipe-right",
        sprite: "lisc-zielony",
      },
      {
        id: "doniczka",
        title: "Sowia doniczka i kompost",
        text: "Doniczka daje nasionka (ładunek wraca co kilka sekund), a kompost zwalnia miejsce na półkach.",
        gesture: "tap",
        sprite: "lisc-zloty",
      },
      {
        id: "hybrydy",
        title: "Łańcuchy i hybrydy",
        text: "Monstera, Pilea, Paproć i Kaktus mają po 5 poziomów. Dwie różne rośliny na szczycie łańcucha dają hybrydę.",
        sprite: "lisc-teczowy",
      },
      {
        id: "zamowienia",
        title: "Zamówienia i pomieszczenia",
        text: "Trzy sąsiadki proszą o rośliny. Za zamówienia dostajesz liście i gwiazdki, a za gwiazdki odnawiasz 10 pomieszczeń — każde daje ułatwienie.",
        sprite: "sowa-radosc",
      },
      {
        id: "pracu-amic",
        title: "Pracu Pracu i Amic",
        text: "Telefon Pracu przykleja karteczki na rośliny — połącz rośliny obok albo stuknij karteczkę 3 razy. Skrzynię Amic otwierają 2 połączenia obok, a kanister usuwa tylko Kózka Taran.",
        sprite: "pracu-telefon",
      },
      {
        id: "kozki",
        title: "Kózki-pomocnice",
        text: "Skoczek łączy pary, Zjadaczka zjada karteczki, Dżoker pasuje do każdej rośliny, Sprężynka podnosi rośliny wokół, a Taran rozbija przeszkody.",
        sprite: "kozka-sprezynka",
      },
      {
        id: "humbak",
        title: "Basen Humbaka",
        text: "Co 5 zamówień humbak zaprasza do 45-sekundowej rundy: szybkie połączenia mnożą punkty, a szczyt łańcucha robi plusk. Pobij swój rekord!",
        sprite: "humbak",
        tip: "Gwiazdki i kózki z basenu trafiają do szklarni.",
      },
    ],
  },
  // Obecne gry (treść przeniesiona z shared/game-guides.js w E3). Po przebudowie każdej gry podmieniamy jej karty.
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
