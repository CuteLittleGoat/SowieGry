// Wypluffki — udawane mikropłatności (parodia gier na telefon) w Sowim Butiku (Analiza 7b). Nikt nic nie płaci:
// saldo zmienia admin w panelu `Admin/` (hasło „KoziAdmin”), a „ceną” doładowania jest hu-hu na kozę. Za Wypluffki
// kupuje się tylko wygląd (rozdz. 9–10). Ten moduł to czyste dane i zasady (katalog, pakiety, VIP, oferta dnia, kod
// prośby, sowie jajko); zapis w bazie robi SowieCloud (`cloud.bank` — shared/sowie-cloud.js).
import { createRng } from "../engine/rng.js";

export const WYPLUFFKI_VERSION = 1;

// Rzadkość (kolor ramki kafelka w Butiku).
export const RARITY = Object.freeze({
  rzadki: { label: "Rzadki", color: "#4f8fe8" },
  epicki: { label: "Epicki", color: "#9b5de5" },
  legendarny: { label: "Legendarny", color: "#f4b400" },
  mityczny: { label: "Mityczny Puch", color: "rainbow" },
});

// Rodzaje rzeczy za Wypluffki. Wszystkie to wygląd; `polka` (miejsca 4 i 5 na półce Dziupli) to jedyny wyjątek
// od „jednej waluty” (decyzja właściciela do Analizy 7, pytanie 3 — za granie albo za Wypluffki, rozdz. 10).
export const KINDS = Object.freeze({
  skorka: { label: "Skórka", group: "sowka" },
  stroj: { label: "Kostium", group: "sowka" },
  slad: { label: "Ślad", group: "sowka" },
  glos: { label: "Głos", group: "sowka" },
  taniec: { label: "Taniec", group: "sowka" },
  dziupla: { label: "Ozdoba Dziupli", group: "dziupla" },
  trojki: { label: "Sowie Trójki", group: "gry" },
  farma: { label: "Sowia Farma", group: "gry" },
});

const item = (id, label, cena, rarity, text, extra = {}) =>
  Object.freeze({ id, kind: id.split(":")[0], label, cena, rarity, text, ...extra });

// Skórki: inne kolory tych samych części SVG Sówki (jak gatunki — shared/world/species.js) i wzór na wierzchu.
// Klucze palety jak OWL_PALETTE: dark (uszka, lotki), body, face, belly, beak.
const skin = (id, label, cena, rarity, text, colors, pattern = null) =>
  item(id, label, cena, rarity, text, { colors: Object.freeze(colors), pattern });

// Katalog pierwszej wersji (Analiza 7b, Załącznik A). Identyfikatory tylko dopisujemy — nic nie ginie.
export const CATALOG = Object.freeze([
  // --- Sówka: skórki ---
  skin("skorka:cukrowa-wata", "Cukrowa Wata", 299, "rzadki", "Pastelowy róż i błękit — słodko, ale nie do jedzenia.", {
    dark: "#e58fb8",
    body: "#f6b3d1",
    face: "#c9e6ff",
    belly: "#fff1f8",
    beak: "#f59e3b",
  }),
  skin("skorka:czekoladowa", "Czekoladowa", 299, "rzadki", "Mleczna czekolada z orzechami. Nie jeść.", {
    dark: "#4a2a17",
    body: "#7b4a2a",
    face: "#c48a5a",
    belly: "#e9c9a3",
    beak: "#f2c14e",
  }),
  skin(
    "skorka:lodowa",
    "Lodowa",
    499,
    "epicki",
    "Błękitna, ze szronem na skrzydłach.",
    { dark: "#5f9fc7", body: "#a8d8f0", face: "#e8f7ff", belly: "#f4fbff", beak: "#7fb6d9" },
    "szron",
  ),
  skin(
    "skorka:neonowa",
    "Neonowa",
    499,
    "epicki",
    "Fiolet i zieleń, jakby świeciła w ciemności.",
    { dark: "#5b2b9e", body: "#8f4fe8", face: "#62f5a3", belly: "#d8ffe9", beak: "#f5f259" },
    "poswiata",
  ),
  skin(
    "skorka:galaktyczna",
    "Galaktyczna",
    799,
    "epicki",
    "Granatowa jak nocne niebo, w gwiazdki.",
    { dark: "#1b1f4d", body: "#2c3577", face: "#7f8ee8", belly: "#c9cff8", beak: "#f4c542" },
    "gwiazdki",
  ),
  skin(
    "skorka:duszek",
    "Duszek",
    799,
    "epicki",
    "Biała i półprzezroczysta — lekko się unosi. Bu-hu!",
    { dark: "#c9cfdc", body: "#eef1f7", face: "#ffffff", belly: "#f7f9fc", beak: "#b9b4c8" },
    "duszek",
  ),
  skin(
    "skorka:teczowa",
    "Tęczowa",
    999,
    "legendarny",
    "Mieni się wszystkimi kolorami tęczy.",
    { dark: "#e8505b", body: "#f7a531", face: "#7ad3f0", belly: "#fff3a6", beak: "#9b5de5" },
    "tecza",
  ),
  skin(
    "skorka:zlota",
    "Złota",
    1499,
    "legendarny",
    "Błyszczy i sypie iskierkami. Najdroższa sowa w lesie.",
    { dark: "#b8860b", body: "#e0b33a", face: "#fbe7a1", belly: "#fff6d5", beak: "#f59e3b" },
    "iskierki",
  ),
  skin(
    "skorka:mityczny-puch",
    "Mityczny Puch",
    2499,
    "mityczny",
    "Codziennie inny kolor. Nikt nie wie, z czego jest.",
    { dark: "#8a5a3b", body: "#b07a52", face: "#e2b98f", belly: "#f3e3c8", beak: "#f59e3b" },
    "mityczny",
  ),
  // --- Sówka: kostiumy (dodatki jak stroje z Garderoby) ---
  item("stroj:pizama", "Piżama ze szlafmycą", 299, "rzadki", "Na dobranoc — z pomponem."),
  item("stroj:pirat", "Kapelusz Pirata", 399, "rzadki", "Z opaską na oko. Arrr-hu!"),
  item("stroj:koza", "Kostium Kozy", 499, "epicki", "Rogi i bródka. Mee-hu?"),
  item("stroj:rycerz", "Hełm Rycerza", 499, "epicki", "Lśniący, z piórkiem na czubku."),
  item("stroj:astronautka", "Hełm Astronautki", 599, "epicki", "Bańka na głowę — prosto na Księżyc."),
  item("stroj:czarodziejka", "Kapelusz Czarodziejki", 599, "epicki", "W gwiazdki, z różdżką."),
  item("stroj:humbak", "Kombinezon Humbaka", 799, "epicki", "Z płetwą na plecach. Plusk!"),
  item("stroj:disco", "Kula Disco", 999, "legendarny", "Na głowie. Błyszczy na cały las."),
  item("stroj:nowicjusz", "Czapeczka Nowicjusza", 0, "rzadki", "Tylko z Pakietu Startowego.", { pakiet: "startowy" }),
  // --- Sówka: ślady (gry zręcznościowe; w Sowich Trójkach iskierki przy combo) ---
  item("slad:brokat", "Ślad: Brokat", 299, "rzadki", "Za Sówką sypie się brokat."),
  item("slad:serduszka", "Ślad: Serduszka", 299, "rzadki", "Małe serduszka w powietrzu."),
  item("slad:nutki", "Ślad: Nutki", 399, "rzadki", "Sówka nuci w locie."),
  item("slad:konfetti", "Ślad: Konfetti", 499, "epicki", "Każdy skok to małe święto."),
  item("slad:zlote-piorka", "Ślad: Złote piórka", 599, "epicki", "Złote piórka spadają jak liście."),
  item("slad:tecza", "Ślad: Tęcza", 799, "legendarny", "Tęczowa smuga za Sówką."),
  // --- Sówka: głos („hu-hu”) ---
  item("glos:echo", "Hu-hu z echem", 149, "rzadki", "Hu-hu… hu-hu… hu-hu…"),
  item("glos:bas", "Hu-hu basem", 149, "rzadki", "Bardzo poważne hu-hu."),
  item("glos:opera", "Hu-hu operowe", 199, "rzadki", "Huuu-huuuuu! Brawo!"),
  item("glos:8bit", "Hu-hu 8-bit", 199, "rzadki", "Jak w starej grze."),
  item("glos:mee-hu", "„Mee-hu”", 249, "epicki", "Kozie hu-hu. Koza jest zachwycona."),
  // --- Sówka: tańce (stuknięcie Sówki w Dziupli) ---
  item("taniec:radosc", "Taniec radości", 199, "rzadki", "Podskoki i machanie skrzydłami."),
  item("taniec:salto", "Salto", 299, "epicki", "Hop — i obrót w powietrzu."),
  item("taniec:klebek", "Kłębek puchu", 299, "epicki", "Sówka turla się jak kulka."),
  item("taniec:moonwalk", "Moonwalk", 399, "epicki", "Sowi krok do tyłu."),
  // --- Sowia Dziupla: ozdoby premium (miejsca z Analizy 7, rozdz. 6.1) ---
  item("dziupla:wyglad-disco", "Dziupla Disco", 1499, "legendarny", "Kolorowe światła i kula.", { slot: "wyglad" }),
  item("dziupla:wyglad-kosmos", "Kosmiczna Dziupla", 1499, "legendarny", "Ściany jak niebo z planetami.", {
    slot: "wyglad",
  }),
  item("dziupla:wyglad-zlota", "Złota Dziupla", 1999, "legendarny", "Złote słoje i blask.", { slot: "wyglad" }),
  item("dziupla:okno-gory", "Wypluffkowe Góry", 499, "epicki", "Widok na puchate szczyty.", { slot: "okno" }),
  item("dziupla:okno-wodospad", "Tęczowy wodospad", 599, "epicki", "Woda w kolorach tęczy.", { slot: "okno" }),
  item("dziupla:sufit-neon", "Neon „HU-HU”", 599, "epicki", "Świecący napis pod sufitem.", { slot: "sufit" }),
  item("dziupla:sufit-disco", "Kula disco", 699, "epicki", "Kręci się i puszcza zajączki.", { slot: "sufit" }),
  item("dziupla:sufit-zyrandol", "Kryształowy żyrandol", 799, "legendarny", "Jak w sowim pałacu.", { slot: "sufit" }),
  item("dziupla:ramka-neon", "Ramka Neonowa", 299, "rzadki", "Do obrazka na ścianie.", { slot: "ramka" }),
  item("dziupla:ramka-barok", "Ramka Złota barokowa", 399, "epicki", "Bogato zdobiona.", { slot: "ramka" }),
  item("dziupla:polka-4", "4. miejsce na półce", 499, "rzadki", "Albo za granie: 5. poziom Sowiej Akademii.", {
    slot: "polka",
    wyjatek: "polka",
  }),
  item("dziupla:polka-5", "5. miejsce na półce", 799, "epicki", "Albo za granie: rozdział 14 Sowich Ogrodów.", {
    slot: "polka",
    wyjatek: "polka",
  }),
  item("dziupla:doniczki-zlote", "Złote doniczki", 499, "epicki", "Na wszystkie miejsca półki.", { slot: "doniczki" }),
  item("dziupla:pinezki-zlote", "Złote pinezki", 199, "rzadki", "Do tablicy z grami.", { slot: "pinezki" }),
  item("dziupla:tablica-neon", "Ramka tablicy Neonowa", 399, "epicki", "Tablica z grami w neonie.", {
    slot: "tablica",
  }),
  item("dziupla:szafa-sejf", "Szafa-sejf", 599, "epicki", "Na najcenniejsze stroje.", { slot: "szafa" }),
  item("dziupla:szafa-gwiazdy", "Szafa gwiazdy", 699, "epicki", "Z lustrem i żarówkami.", { slot: "szafa" }),
  item("dziupla:fotel-gamingowy", "Fotel gamingowy", 799, "epicki", "Dla sowy, która dużo gra.", { slot: "miejsce" }),
  item("dziupla:tron", "Złoty tron", 999, "legendarny", "Sówka siedzi jak królowa.", { slot: "miejsce" }),
  item("dziupla:dywan-wypluffki", "Dywan z Wypluffków", 399, "rzadki", "Miękki. Lepiej nie pytać.", {
    slot: "dywan",
  }),
  item("dziupla:dywan-vip", "Czerwony dywan VIP", 499, "epicki", "Dla gwiazd Sowiego Banku.", { slot: "dywan" }),
  item("dziupla:pluszowa-wypluffka", "Pluszowa Wypluffka", 199, "rzadki", "Puchata maskotka.", { slot: "zabawka" }),
  item("dziupla:zlota-koza", "Złota koza", 899, "legendarny", "Statuetka. Koza jest dumna.", { slot: "zabawka" }),
  item("dziupla:humbak-vip", "Pluszowy Humbak VIP", 0, "legendarny", "Tylko dla poziomu VIP „Humbak”.", {
    slot: "zabawka",
    vip: "humbak",
  }),
  // --- Sowie Trójki (kafelki bez zmian — każdy rodzaj ma swój kolor i kształt) ---
  item("trojki:hustawka", "Huśtawka", 399, "rzadki", "Sówka buja się obok planszy."),
  item("trojki:zlota-galaz", "Złota gałąź", 499, "epicki", "Gałąź Sówki w złocie."),
  item("trojki:ramka-disco", "Ramka planszy „Disco”", 599, "epicki", "Światełka dookoła planszy."),
  // --- Sowia Farma — dopiero po wdrożeniu Farmy (decyzja właściciela; Analiza 7b, W8) ---
  item("farma:konewka-czajniczek", "Konewka-czajniczek", 399, "rzadki", "Podlewa jak zwykła konewka.", {
    requires: "farma",
  }),
  item("farma:motyka-zlota", "Złota motyka-łopatka", 499, "epicki", "Tylko wygląd.", { requires: "farma" }),
  item("farma:sierp-ksiezyc", "Sierp-księżyc", 499, "epicki", "Tylko wygląd.", { requires: "farma" }),
  item("farma:strach-pirat", "Strach-Sowa Pirat", 499, "epicki", "Straszy tak samo, ale z fasonem.", {
    requires: "farma",
  }),
  item("farma:strach-robot", "Strach-robot", 599, "epicki", "Bip-bup-hu.", { requires: "farma" }),
  item("farma:konewka-humbak", "Konewka-humbak", 699, "epicki", "Woda leci z fontanny na grzbiecie.", {
    requires: "farma",
  }),
  item("farma:galaz-zlota", "Gałąź do spania ze złotymi liśćmi", 699, "epicki", "Śpi się tak samo dobrze.", {
    requires: "farma",
  }),
  item("farma:kozka-maskotka", "Kózka-maskotka", 799, "legendarny", "Spaceruje i meczy — nic nie zbiera.", {
    requires: "farma",
  }),
  item("farma:dom-grzybek", "Dom z dachem-grzybkiem", 999, "legendarny", "Tylko dach, za to jaki!", {
    requires: "farma",
  }),
]);

const BY_ID = new Map(CATALOG.map((entry) => [entry.id, entry]));

/** Rzecz z katalogu po identyfikatorze („skorka:zlota”) albo null. */
export const itemById = (id) => BY_ID.get(id) || null;

// Pakiety „Doładuj Wypluffki” (rozdz. 7.2). Kwota to prośba — ostatnie słowo ma admin. `scena` — wariant obrazka
// „Sówka robi hu-hu na kozę” (rozdz. 7.5).
export const PACKAGES = Object.freeze([
  Object.freeze({
    id: "startowy",
    label: "Pakiet Startowy",
    kwota: 300,
    cena: "1 × Hu-hu (nieśmiałe)",
    przedtem: "3 × Hu-hu",
    naklejka: "TYLKO RAZ!",
    raz: true,
    bonus: Object.freeze(["stroj:nowicjusz"]),
    opis: "300 Wypluffków + Czapeczka Nowicjusza",
  }),
  Object.freeze({ id: "garstka", label: "Garstka Wypluffków", kwota: 100, cena: "1 × Hu-hu", bonus: [] }),
  Object.freeze({
    id: "kieszen",
    label: "Kieszeń Wypluffków",
    kwota: 550,
    gratis: "+50 gratis",
    cena: "1 × Hu-hu (głośne)",
    naklejka: "NAJPOPULARNIEJSZE",
    bonus: [],
  }),
  Object.freeze({
    id: "worek",
    label: "Worek Wypluffków",
    kwota: 1200,
    gratis: "+20% gratis",
    cena: "2 × Hu-hu",
    bonus: [],
  }),
  Object.freeze({
    id: "skrzynia",
    label: "Skrzynia Wypluffków",
    kwota: 2600,
    gratis: "+30% gratis",
    cena: "3 × Hu-hu i groźne spojrzenie",
    naklejka: "NAJLEPSZA OFERTA",
    bonus: [],
  }),
  Object.freeze({
    id: "humbak",
    label: "Humbaczy Ładunek",
    kwota: 6500,
    cena: "Hu-hu w duecie z humbakiem",
    naklejka: "DLA WIELORYBÓW 🐋",
    bonus: [],
  }),
]);

export const packageById = (id) => PACKAGES.find((entry) => entry.id === id) || null;

// Najwyżej tyle próśb może czekać naraz („Koza musi odpocząć”).
export const MAX_PENDING = 3;

// Program VIP „Sowi Klub” — poziom z łącznie wydanych Wypluffków (parodia „wielorybów”); nagrody to tylko wygląd.
export const VIP_LEVELS = Object.freeze([
  Object.freeze({ id: "plotka", label: "Płotka", emoji: "🐟", min: 0, rewards: [] }),
  Object.freeze({ id: "sledz", label: "Śledź", emoji: "🐠", min: 1000, rewards: [] }),
  Object.freeze({ id: "delfin", label: "Delfin", emoji: "🐬", min: 5000, rewards: [] }),
  Object.freeze({ id: "humbak", label: "Humbak", emoji: "🐋", min: 15000, rewards: ["dziupla:humbak-vip"] }),
]);

/** Poziom VIP: { ...poziom, next (następny poziom albo null), brakuje (do następnego) }. */
export function vipLevel(wydano = 0) {
  const spent = Math.max(0, Math.floor(Number(wydano) || 0));
  let index = 0;
  VIP_LEVELS.forEach((level, at) => {
    if (spent >= level.min) index = at;
  });
  const next = VIP_LEVELS[index + 1] || null;
  return { ...VIP_LEVELS[index], index, next, brakuje: next ? next.min - spent : 0 };
}

// Oferta dnia: jedna rzecz, której gracz jeszcze nie ma, tańsza o 20% (ta sama na dwóch telefonach — z daty).
export const DAILY_DISCOUNT = 20;

// Sowie jajko-niespodzianka (parodia „skrzynek z łupem”): losowa rzecz z Sówki, której gracz jeszcze nie ma —
// bez powtórek, szanse wypisane na jajku.
export const EGG = Object.freeze({
  id: "jajko",
  label: "Sowie jajko-niespodzianka",
  cena: 399,
  kinds: Object.freeze(["skorka", "stroj", "slad", "glos", "taniec"]),
  szanse: Object.freeze({ rzadki: 0.6, epicki: 0.35, legendarny: 0.05 }),
});

/** Zestaw identyfikatorów, które gracz ma: dziennik zakupów portfela i nagrody VIP. */
export function ownedIds(wallet) {
  const owned = new Set(Object.keys(wallet?.kupione || {}));
  const spent = Number(wallet?.wydano) || 0;
  for (const level of VIP_LEVELS) if (spent >= level.min) level.rewards.forEach((id) => owned.add(id));
  return owned;
}

/** Czy rzecz jest w sprzedaży: ma cenę, nie jest tylko z pakietu albo VIP, a jej gra już jest (`games` — id gier). */
export function isForSale(entry, games = []) {
  if (!entry || !(entry.cena > 0) || entry.pakiet || entry.vip) return false;
  return !entry.requires || games.includes(entry.requires);
}

/** Rzeczy w sprzedaży dla listy gier (Sowia Farma dopiero po wdrożeniu — `requires: "farma"`). */
export const forSale = (games = []) => CATALOG.filter((entry) => isForSale(entry, games));

/** Identyfikator oferty dnia (`dayKey` — RRRR-MM-DD) albo null, gdy gracz ma już wszystko. */
export function dailyOfferId(dayKey, owned = new Set(), games = []) {
  const candidates = forSale(games)
    .filter((entry) => !owned.has(entry.id))
    .map((entry) => entry.id)
    .sort();
  if (!candidates.length) return null;
  return createRng(`oferta:${dayKey}`).pick(candidates);
}

/** Aktywna promocja admina z portfela (procent do dnia `do`) albo null. */
export function activePromo(wallet, nowMs = Date.now()) {
  const promo = wallet?.promocja;
  return promo && promo.procent > 0 && Number(promo.do) > nowMs ? promo : null;
}

/**
 * Cena rzeczy dla gracza: { cena, bazowa, rabat } — rabat to lepszy z oferty dnia (−20%) i promocji admina
 * (`{ procent, zrodlo: "oferta" | "promocja" }`), nigdy oba naraz. Cena zawsze ≥ 1.
 */
export function priceFor(entry, { wallet = null, dayKey = "", nowMs = Date.now(), games = [] } = {}) {
  const bazowa = Math.max(0, Math.floor(Number(entry?.cena) || 0));
  const offers = [];
  if (dayKey && entry && dailyOfferId(dayKey, ownedIds(wallet), games) === entry.id) {
    offers.push({ procent: DAILY_DISCOUNT, zrodlo: "oferta" });
  }
  const promo = activePromo(wallet, nowMs);
  if (promo) offers.push({ procent: promo.procent, zrodlo: "promocja" });
  const rabat = offers.sort((a, b) => b.procent - a.procent)[0] || null;
  const cena = rabat ? Math.max(1, Math.floor((bazowa * (100 - rabat.procent)) / 100)) : bazowa;
  return { cena, bazowa, rabat };
}

// Kod prośby o doładowanie (na obrazku „dowodu wpłaty” i w panelu admina): HU-XXXX-XX bez 0/O i 1/I.
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const CODE_PATTERN = /^HU-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{2}$/;

export function generateCode(random = Math.random) {
  const chars = Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]);
  return `HU-${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}

/** Pula jajka-niespodzianki: rzeczy Sówki w sprzedaży, których gracz nie ma, bez Mitycznego Puchu. */
export const eggPool = (owned = new Set()) =>
  CATALOG.filter(
    (entry) => EGG.kinds.includes(entry.kind) && isForSale(entry) && !owned.has(entry.id) && entry.rarity in EGG.szanse,
  );

/**
 * Losowanie z jajka: rzadkość według szans (gdy w danej rzadkości nic nie zostało — losowanie wśród pozostałych),
 * potem rzecz. → rzecz z katalogu albo null (pusta pula — „Sowa nie ma już jajek. Wszystko masz!”).
 */
export function drawEgg(owned = new Set(), random = Math.random) {
  const pool = eggPool(owned);
  if (!pool.length) return null;
  const rarities = Object.entries(EGG.szanse).filter(([rarity]) => pool.some((entry) => entry.rarity === rarity));
  const total = rarities.reduce((sum, [, chance]) => sum + chance, 0);
  let roll = random() * total;
  let chosen = rarities[rarities.length - 1][0];
  for (const [rarity, chance] of rarities) {
    if (roll < chance) {
      chosen = rarity;
      break;
    }
    roll -= chance;
  }
  const options = pool.filter((entry) => entry.rarity === chosen);
  return options[Math.min(options.length - 1, Math.floor(random() * options.length))];
}

const failure = (reason) => ({ ok: false, reason });

/**
 * Zakup za Wypluffki: buyItem(id, { cloud, dayKey, nowMs, games }) → wynik `cloud.bank.buy` albo { ok: false, reason:
 * "unknown" | "niedostepne" | "owned" | "offline" | "brak-portfela" | "saldo" }. Cena z `priceFor` (oferta dnia,
 * promocja admina).
 */
export async function buyItem(id, { cloud, dayKey = "", nowMs = Date.now(), games = [] } = {}) {
  const entry = itemById(id);
  if (!entry) return failure("unknown");
  if (!isForSale(entry, games)) return failure("niedostepne");
  const wallet = cloud?.bank?.wallet?.();
  if (ownedIds(wallet).has(id)) return failure("owned");
  if (!cloud?.bank) return failure("offline");
  const { cena } = priceFor(entry, { wallet, dayKey, nowMs, games });
  return cloud.bank.buy({ id, price: cena });
}

/** Jajko-niespodzianka: losuje rzecz i kupuje ją za cenę jajka. → { ok, item } albo { ok: false, reason }. */
export async function buyEgg({ cloud, random = Math.random } = {}) {
  if (!cloud?.bank) return failure("offline");
  const prize = drawEgg(ownedIds(cloud.bank.wallet()), random);
  if (!prize) return failure("pusto");
  const result = await cloud.bank.buy({ id: prize.id, price: EGG.cena });
  return result.ok ? { ...result, item: prize } : result;
}

/**
 * Prośba o doładowanie: requestTopUp(packageId, { cloud, random }) → { ok, kod, pakiet, kwota, at } albo { ok: false,
 * reason: "unknown" | "kolejka" (już 3 czekają) | "raz" (Pakiet Startowy wzięty) | "offline" }.
 */
export async function requestTopUp(packageId, { cloud, random = Math.random } = {}) {
  const pack = packageById(packageId);
  if (!pack) return failure("unknown");
  if (!cloud?.bank) return failure("offline");
  const requests = await cloud.bank.requests(20);
  if (requests.filter((request) => request.status === "czeka").length >= MAX_PENDING) return failure("kolejka");
  if (pack.raz) {
    const taken = requests.some((request) => request.pakiet === pack.id && request.status !== "odrzucone");
    const owned = ownedIds(cloud.bank.wallet());
    if (taken || pack.bonus.some((id) => owned.has(id))) return failure("raz");
  }
  return cloud.bank.requestTopUp({ kod: generateCode(random), pakiet: pack.id, kwota: pack.kwota });
}
