// Sowia Dziupla — katalog miejsc (slotów) i ozdób (Analiza 7, rozdz. 6 i Załącznik A; etap D1). Ozdoby zdobywa się
// graniem (warunki `goals` w formacie wymagań zdjęć Galerii — liczniki Sowiej Akademii, liczone tą samą funkcją
// `achievementProgress`), za piórka (`feathers` — dziennik `shop.purchases["decor:<id>"]`) albo za Wypluffki (rzeczy
// `dziupla:*` z shared/meta/wypluffki.js, Analiza 7b). Ozdoba bez warunku (`start: true`) jest od początku.
// Identyfikatory tylko dopisujemy — nic nie ginie (nieznana ozdoba zostaje w zapisie, a w pokoju jest domyślna).
import { CATALOG as PREMIUM } from "../meta/wypluffki.js";

export const DZIUPLA_VERSION = 1;

// Miejsca w pokoju. `empty` — można wybrać „pusto”; `default` — ozdoba na start. Od D1 obrazek i jego ramka oraz
// tablica i pinezki to osobne miejsca (w Analizie 7, rozdz. 9 — jedna wartość „zdjęcie|ramka”), a półka ma
// osobne miejsce na wygląd doniczek.
export const SLOTS = Object.freeze([
  { id: "wyglad", label: "Wygląd dziupli", default: "wyglad:jasne-drewno", empty: false },
  { id: "okno", label: "Okno", default: "okno:laka", empty: true },
  { id: "sufit", label: "Sufit", default: "sufit:zarowka", empty: true },
  { id: "obrazek", label: "Obrazek", default: "owl-01", empty: true, photo: true },
  { id: "ramka", label: "Ramka obrazka", default: "ramka:drewniana", empty: false },
  { id: "tablica", label: "Tablica z grami", default: "tablica:korek", empty: false },
  { id: "pinezki", label: "Pinezki", default: "pinezki:kolorowe", empty: false },
  { id: "doniczki", label: "Doniczki na półce", default: "doniczki:gliniane", empty: false },
  { id: "szafa", label: "Szafa", default: "szafa:drewniana", empty: false },
  { id: "miejsce", label: "Miejsce Sówki", default: "miejsce:poduszka", empty: false },
  { id: "dywan", label: "Dywan", default: "dywan:rozowy", empty: true },
  { id: "roslina", label: "Duża roślina", default: "roslina:monstera", empty: true },
  { id: "zabawka", label: "Zabawka", default: null, empty: true },
]);

export const slotById = (id) => SLOTS.find((slot) => slot.id === id) || null;

// Półka z roślinkami z gier: 3 miejsca od początku, 4. i 5. za granie albo za Wypluffki (decyzja właściciela do
// Analizy 7, pytanie 3). Miejsca półki w zapisie: „polka-1” … „polka-5”.
export const SHELF = Object.freeze({
  base: 3,
  extra: Object.freeze([
    Object.freeze({
      slot: "polka-4",
      goals: [["level", 5]],
      premium: "dziupla:polka-4",
      text: "5. poziom Sowiej Akademii",
    }),
    Object.freeze({
      slot: "polka-5",
      goals: [["ogrodyChapters", 14]],
      premium: "dziupla:polka-5",
      text: "Ukończ 14 rozdziałów Sowich Ogrodów",
    }),
  ]),
  max: 5,
  default: Object.freeze({ "polka-1": "ogrody:monstera" }),
});

const start = (id, label) => Object.freeze({ id, slot: id.split(":")[0], label, start: true });
const goal = (id, label, goals, text, extra = {}) =>
  Object.freeze({ id, slot: id.split(":")[0], label, goals: Object.freeze(goals), text, ...extra });
const feathers = (id, label, price) =>
  Object.freeze({ id, slot: id.split(":")[0], label, feathers: price, text: `${price} piórek w Dekoratorze` });

// Ozdoby za granie i za piórka (Analiza 7, Załącznik A; liczby do strojenia).
export const FREE_DECOR = Object.freeze([
  start("wyglad:jasne-drewno", "Jasne drewno"),
  goal("wyglad:brzozowa", "Brzozowa", [["level", 3]], "3. poziom Sowiej Akademii"),
  goal("wyglad:wisniowa", "Wiśniowa", [["ogrodyChapters", 9]], "Ukończ 9 rozdziałów Sowich Ogrodów"),
  goal("wyglad:zimowa", "Zimowa", [["jumperHeight", 1000]], "Wzleć na 1000 m w Sowie w Chmurach"),
  goal("wyglad:morska", "Morska", [["whaleRides", 10]], "10 przygód z humbakiem w grach"),
  goal("wyglad:nocna", "Nocna", [["jumperHeight", 1900]], "Wzleć na 1900 m (Mgławica) w Sowie w Chmurach"),
  goal("wyglad:szklarniana", "Szklarniana", [["szklarniaRooms", 10]], "Odnów 10 pomieszczeń w Łącz i Hoduj"),
  goal("wyglad:storczykowa", "Storczykowa", [["ogrodyChapters", 21]], "Ukończ 21 rozdziałów Sowich Ogrodów", {
    feathers: 100,
  }),
  goal(
    "wyglad:drzewo-swiata",
    "Drzewo świata",
    [["ogrodyChapters", 22]],
    "Ukończ wszystkie 22 rozdziały Sowich Ogrodów",
  ),

  start("okno:laka", "Łąka"),
  start("okno:auto", "Automatyczny (pora dnia)"),
  goal("okno:ocean", "Ocean z humbakiem", [["whaleRides", 3]], "3 przygody z humbakiem w grach"),
  goal("okno:chmury", "Chmury", [["jumperHeight", 500]], "Wzleć na 500 m w Sowie w Chmurach"),
  goal("okno:noc", "Nocne niebo", [["jumperHeight", 1500]], "Wzleć na 1500 m w Sowie w Chmurach"),
  goal("okno:miasto", "Miasto", [["sowa3Finishes", 1]], "Ukończ kampanię Sowich Torów"),
  goal("okno:ogrod", "Ogród", [["ogrodyChapters", 6]], "Ukończ 6 rozdziałów Sowich Ogrodów"),
  goal("okno:staw", "Staw", [["trojkiLevels", 30]], "Dojdź do rozdziału „Staw Humbaka” w Sowich Trójkach"),

  start("sufit:zarowka", "Żarówka"),
  goal("sufit:lampki", "Kolorowe lampki", [["szklarniaRooms", 6]], "Odnów 6 pomieszczeń w Łącz i Hoduj"),
  goal("sufit:chmurka", "Lampa-chmurka", [["jumperHeight", 300]], "Wzleć na 300 m w Sowie w Chmurach"),
  goal("sufit:ksiezyc", "Księżyc", [["ogrodyChapters", 14]], "Ukończ 14 rozdziałów Sowich Ogrodów"),
  goal("sufit:girlanda", "Girlanda z liści", [["leaves", 300]], "Zbierz 300 liści w grach zręcznościowych"),

  start("ramka:drewniana", "Drewniana"),
  goal("ramka:zlota", "Złota", [["achievements", 8]], "Zdobądź 8 osiągnięć"),
  feathers("ramka:kwiatowa", "Kwiatowa", 40),

  start("tablica:korek", "Korek"),
  goal("tablica:liscie", "Liście", [["achievements", 3]], "Zdobądź 3 osiągnięcia"),
  goal("tablica:chmurka", "Chmurka", [["jumperHeight", 750]], "Wzleć na 750 m w Sowie w Chmurach"),

  start("pinezki:kolorowe", "Kolorowe"),
  feathers("pinezki:serduszka", "Serduszka", 20),
  feathers("pinezki:gwiazdki", "Gwiazdki", 30),

  start("doniczki:gliniane", "Gliniane"),

  start("szafa:drewniana", "Drewniana"),
  feathers("szafa:kwiatki", "W kwiatki", 30),
  goal("szafa:humbak", "Szafa-humbak", [["whaleRides", 5]], "5 przygód z humbakiem w grach"),

  start("miejsce:poduszka", "Poduszka"),
  goal("miejsce:gniazdko", "Gniazdko", [["trojkiOwlets", 10]], "Wykluj 10 piskląt w Sowich Trójkach"),
  goal("miejsce:hustawka", "Huśtawka", [["jumperHeight", 750]], "Wzleć na 750 m w Sowie w Chmurach"),
  goal("miejsce:hamak", "Hamak", [["ogrodyChapters", 10]], "Ukończ 10 rozdziałów Sowich Ogrodów"),
  goal("miejsce:grzybek", "Fotel-grzybek", [["ogrodyChapters", 16]], "Dojdź do Muchomora w Sowich Ogrodach"),

  start("dywan:rozowy", "Różowy"),
  goal("dywan:monstera", "Liść Monstery", [["ogrodyLeaves", 5000]], "Zbierz 5000 liści w Sowich Ogrodach"),
  goal("dywan:kozki", "W kózki", [["goatsCaught", 10]], "Złap 10 kózek"),
  goal("dywan:teczowy", "Tęczowy", [["level", 10]], "10. poziom Sowiej Akademii"),

  start("roslina:monstera", "Monstera w donicy"),
  goal(
    "roslina:sowi-storczyk",
    "Sowi storczyk",
    [["ogrodyChapters", 20]],
    "Dojdź do Sowiego storczyka w Sowich Ogrodach",
  ),
  goal("roslina:kozi-lisc", "Kozi liść", [["trojkiLevels", 15]], "Ukończ rozdział „Sowia Łąka” w Sowich Trójkach"),
  goal("roslina:humbakowiec", "Humbakowiec", [["whaleRides", 5]], "5 przygód z humbakiem w grach"),
  goal("roslina:piskleta", "Pisklęce pąki", [["trojkiOwlets", 10]], "Wykluj 10 piskląt w Sowich Trójkach"),

  goal("zabawka:kozka", "Kózka-pluszak", [["goatsCaught", 10]], "Złap 10 kózek"),
  goal("zabawka:humbak", "Humbak-pluszak", [["whaleRides", 3]], "3 przygody z humbakiem w grach"),
  goal("zabawka:pociag", "Pociąg z Sowich Torów", [["sowa3Finishes", 1]], "Ukończ kampanię Sowich Torów"),
  goal("zabawka:telefon", "Telefon Pracu na smyczy", [["szklarniaRooms", 8]], "Odnów 8 pomieszczeń w Łącz i Hoduj"),
]);

// Ozdoby premium za Wypluffki (Analiza 7b) — z katalogu Wypluffków, z wyjątkiem miejsc półki (to pojemność, nie
// ozdoba). Identyfikator w zapisie = identyfikator z katalogu Wypluffków (np. „dziupla:tron”).
export const PREMIUM_DECOR = Object.freeze(
  PREMIUM.filter((entry) => entry.kind === "dziupla" && entry.slot !== "polka").map((entry) =>
    Object.freeze({
      id: entry.id,
      slot: entry.slot,
      label: entry.label,
      premium: entry.id,
      text: entry.vip ? entry.text : `${entry.cena} Wypluffków w Sowim Butiku`,
    }),
  ),
);

export const DECOR = Object.freeze([...FREE_DECOR, ...PREMIUM_DECOR]);
const BY_ID = new Map(DECOR.map((entry) => [entry.id, entry]));

export const decorById = (id) => BY_ID.get(id) || null;
export const decorForSlot = (slot) => DECOR.filter((entry) => entry.slot === slot);
