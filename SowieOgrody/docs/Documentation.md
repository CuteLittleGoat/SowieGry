# Sowie Ogrody — dokumentacja techniczna

## Nowa odsłona (etap E7, w budowie) — katalog `ogrod/`

Przebudowa według Analizy 2 (rozdz. 3.4) i Analizy 3 (E7): czytelne moduły ES zamiast `script.js`, rozdziały z celami, widoczny ogród, zdarzenia maskotek (telefon Pracu Pracu, ciężarówka Amic, złota kózka), „Zatoka Humbaka”, ekonomia sprawdzona symulatorem, dolny panel na telefonie, postęp offline. Folder gry się nie zmienia: podgląd powstanie jako `SowieOgrody/nowa.html` (E7b), a po akceptacji właściciela zastąpi `index.html`. Do tego czasu działa dawna gra (`index.html` + `script.js`, opis niżej) i to ona zapisuje stan w wersji 2.

Stan kroków: **E7a** — logika i dane (bez strony): `config.js`, `economy.js`, `state.js` (stan v3 i migracja z v2), `garden.js` (silnik), testy i symulator tempa. Dalej: E7b — strona `nowa.html` (ogród, dolny panel, zapis, okno powitalne), E7c — zdarzenia i Zatoka Humbaka, E7d — samouczek, instrukcja, muzyka, podgląd do akceptacji, E7e — podmiana.

### Pliki

```text
SowieOgrody/ogrod/
  package.json   { "type": "module" } — pliki .js to moduły ES (dawny script.js w katalogu wyżej zostaje skryptem)
  config.js      dane gry: rozdziały i cele, rośliny, kamienie milowe, stuknięcie, konewka, offline, ulepszenia, prestiż
  economy.js     ekonomia (czysta logika): ceny, produkcja, konewka, offline, nasiona, liczby i czas po polsku
  state.js       stan wersji 3 i migracja ze stanu wersji 2 (zapisanego w Firestore przez dawną grę)
  garden.js      silnik ogrodu (czysta logika): stuknięcia, zakupy, konewka, rozdziały, Wielkie Przesadzanie, offline
```

### Checklista smaczków obecnej gry (krok 7.0)

Z `script.js`, `index.html` i `style.css` dawnej gry. ✅ — jest w nowej logice (E7a), ⏳ — w kolejnym kroku E7, ↻ — zmienione zgodnie z Analizą 2.

| Smaczek dawnej gry | Nowa odsłona |
| --- | --- |
| Strefy: Parapet, Balkon, Działka, Basen, Szklarnia, Centrum, Arboretum (odblokowywane liśćmi z całej gry) | ↻ 6 rozdziałów z 3–5 celami: Parapet → Balkon → Działka → Basen → Szklarnia → Arboretum (Centrum połączone ze Szklarnią) |
| 9 roślin (Monstera, Pilea, Paproć, Alokazja, Kaktus Pracu, Storczyk pluskowy, Bonsai cierpliwości, Mutant monstera, Drzewko złotych liści), ceny rosnące wykładniczo | ✅ 11 roślin (doszły Słonecznik i Lotos), „Kaktus” bez Pracu (Pracu to przeszkoda), ceny i produkcja przeliczone symulatorem |
| Progi 10/25/50/100/150/200/300/500 sztuk z mnożnikami | ↻ kamienie milowe 10/25/50/100: zmiana wyglądu, produkcja ×2 od 25 i ×2 od 100 |
| Kupowanie ×1 / ×10 / max | ✅ `buyPlant(id, ile \| "max")`; przyciski ⏳ E7b |
| Kliknięcie w ogród (moc kliknięć z ulepszeń, „Rytm ogrodu” — % LPS) | ✅ stuknięcie: Miękkie rękawiczki ×3, Koszyk na liście +2% produkcji/s |
| Drzewka zwykłych ulepszeń: kliknięcia, produkcja, woda, automatyzacja (21 węzłów) | ↻ 16 ulepszeń przypisanych do rozdziałów (produkcja, rozdziały, konewka, Tryb samolotowy, Kozi kurier, Sowa zakupowa) |
| Konewka (3 ładunki, ×2 na 45 s), zraszacze, waluta „woda” | ✅ konewka i Zraszacz; ↻ waluta „woda” usunięta — podlewanie i kózki napełniają Plusk-o-metr (⏳ E7c) |
| Auto-zbiory, auto-kliknięcia, Sowa zakupowa | ↻ zostaje Sowa zakupowa (automatyczne kupowanie najopłacalniejszej rośliny co 0,5 s); auto-zbiory i auto-kliknięcia zastąpione mnożnikami i offline |
| Zdarzenie Pracu ×4 (premia) | ↻ ⏳ E7c: telefon Pracu Pracu co 2–4 min — produkcja ×0,7, dopóki go nie odrzucisz; Tryb samolotowy odrzuca sam po 10 s |
| Dostawy Amic i „Kierownik dostaw Amic” | ↻ ⏳ E7c: ciężarówka Amic zastawia jedną grządkę (gatunek nie produkuje), 3 stuknięcia ją przeganiają; Kozi kurier — 1 stuknięcie |
| Złoty liść, tęczowy liść (Gorączka ×3), koza (zbiera zdarzenia) | ↻ ⏳ E7c: złota kózka co 60–120 s — ×3 na 30 s, 60 s produkcji od razu, kozi szał albo +50% Plusk-o-metru |
| Basen humbaka i zdarzenie „splash” | ↻ ⏳ E7c: Zatoka Humbaka — 20 s mini-gry po napełnieniu Plusk-o-metru |
| Postęp offline (25%, limit 2 h + ulepszenia), okno po powrocie | ✅ 50%, limit 4 h (+ drzewko), konewka ładuje się offline; okno powitalne i czas serwera ⏳ E7b |
| Wielkie Przesadzanie od 100 mln liści cyklu, nasiona √ | ↻ ✅ po ukończeniu Szklarni i przy 10 mld liści cyklu; nasiona `√(liście cyklu / 1 mld)`; pierwsze po ok. 2–3 h (symulator) |
| Drzewko prestiżu: 4 gałęzie, 12 węzłów | ↻ ✅ 3 gałęzie po 3 węzły: Korzenie (produkcja, szybki start, nasiona), Woda (konewka, studnia, echo humbaka), Sen (offline, limit, kózki) |
| Osiągnięcia (5) i zakładka Statystyki | ⏳ E7b (zakładka Kolekcja); statystyki w stanie (`stats`) |
| Sowa w słomkowym kapeluszu w szklarni, humbak w basenie, koza, ciężarówka w ogrodzie | ⏳ E7b–E7c (Sowi Świat z atlasu) |
| Zapis w chmurze (`saveGameState`, ważne akcje od razu), `window.SowieIdleGame` dla kontraktów dnia | ⏳ E7b (`saveVersion: 3`, migracja ✅) |
| Muzyka (motyw „market” / „flowers”), dźwięki | ⏳ E7d |

### `config.js`

- `GAME_ID = "ogrody"`, `SAVE_VERSION = 3`.
- `CHAPTERS` — `{ id, name, goals: [{ id, text, kind, target, plant?, upgrade? }] }`; rodzaje celów: `plant` (posiadane sztuki), `upgrade` (kupione), `taps` (stuknięcia), `water` (podlewania), `lps` (produkcja bazowa liści/s), `runLeaves` (liście cyklu), `prestige` (liczba przesadzań):
  - `parapet` „Parapet”: `monstera5` „Kup 5 Monster”, `taps30` „Zbierz liście 30 stuknięciami”, `pilea1` „Kup Pileę”;
  - `balkon` „Balkon”: `monstera25` „Kup 25 Monster”, `konewka` „Kup konewkę sowy”, `water3` „Podlej rośliny 3 razy”, `paproc5` „Kup 5 Paproci”;
  - `dzialka` „Działka”: `alokazja10` „Kup 10 Alokazji”, `kaktus5` „Kup 5 Kaktusów”, `lps500` „Produkuj 500 liści na sekundę”;
  - `basen` „Basen”: `slonecznik10` „Kup 10 Słoneczników”, `storczyk5` „Kup 5 Storczyków”, `lps20k` „Produkuj 20 tys. liści na sekundę”;
  - `szklarnia` „Szklarnia”: `lotos10` „Kup 10 Lotosów”, `bonsai5` „Kup 5 Bonsai”, `mutant1` „Wyhoduj Mutanta monstery”, `run10b` „Zbierz 10 mld liści w tym cyklu”;
  - `arboretum` „Arboretum”: `przesadzanie` „Zrób Wielkie Przesadzanie”, `drzewko5` „Wyhoduj 5 Drzewek złotych liści”, `przesadzanie3` „Zrób 3 Wielkie Przesadzania”.
- `PLANTS` — `{ id, name, chapter, cost, prod (liście/s za sztukę), growth (wzrost ceny), color }`; ceny ≈ 15 × 9,5^i, produkcja ≈ 0,2 × 5^i (2 cyfry znaczące), wzrost 1,13 + 0,004 i: `monstera` „Monstera” (parapet) 15 / 0,2 / 1,13 `#3fae6a`; `pilea` „Pilea” (parapet) 140 / 1 / 1,134 `#72bd68`; `paproc` „Paproć” (balkon) 1400 / 5 / 1,138 `#4b9e72`; `alokazja` „Alokazja” (balkon) 13 000 / 25 / 1,142 `#417b64`; `kaktus` „Kaktus” (dzialka) 120 000 / 120 / 1,146 `#5ba760`; `slonecznik` „Słonecznik” (dzialka) 1,2 mln / 620 / 1,15 `#f4c542`; `storczyk` „Storczyk” (basen) 11 mln / 3100 / 1,154 `#d96faf`; `lotos` „Lotos” (basen) 100 mln / 16 000 / 1,158 `#ff9fb2`; `bonsai` „Bonsai” (szklarnia) 1 mld / 78 000 / 1,162 `#3f8b5b`; `mutant` „Mutant monstery” (szklarnia) 9,5 mld / 390 000 / 1,166 `#2e8b57`; `zloteDrzewko` „Drzewko złotych liści” (arboretum) 90 mld / 2 mln / 1,17 `#d99a1e`.
- `MILESTONES = [10, 25, 50, 100]` (etapy wyglądu), `MILESTONE_BOOST = { 25: 2, 100: 2 }` (mnożnik produkcji gatunku od progu).
- `TAP = { base: 1, lpsShare: 0 }`; `WATER = { charges: 3, regen: 60, multiplier: 2, duration: 45 }`; `OFFLINE = { efficiency: 0.5, cap: 4 h, min: 60 }`.
- `UPGRADES` — `{ id, name, chapter, cost, text, effect }`, efekty: `global` (mnożnik wszystkich roślin), `tap` (mnożnik stuknięcia), `tapLps` (udział produkcji w stuknięciu), `chapter: { rozdział: mnożnik }`, `plant: { gatunek: mnożnik }`, `water: { multiplier, regen }`, `airplane` (s), `courier`, `autobuy`: `rekawiczki` „Miękkie rękawiczki” (parapet, 60, stuknięcia ×3); `ziemia` „Lepsza ziemia” (parapet, 400, ×1,5); `konewka` „Konewka sowy” (balkon, 1500, podlewanie); `koszyk` „Koszyk na liście” (balkon, 6000, +2% produkcji w stuknięciu); `polki` „Półki balkonowe” (balkon, 25 000, Parapet i Balkon ×2); `kompost` „Kompostownik” (dzialka, 300 000, ×1,5); `zraszacz` „Zraszacz” (dzialka, 800 000, podlewanie ×3, ładunek co 40 s); `grzadki` „Wysokie grządki” (dzialka, 2,5 mln, Działka ×2); `samolot` „Tryb samolotowy” (dzialka, 5 mln, telefon milknie sam po 10 s); `pompa` „Pompa basenowa” (basen, 100 mln, Basen ×2); `nawozMonster` „Nawóz monster” (basen, 40 mln, Monstera ×5); `kurier` „Kozi kurier” (basen, 200 mln, ciężarówka po 1 stuknięciu); `lampy` „Lampy szklarniowe” (szklarnia, 5 mld, Szklarnia ×2); `nawoz` „Nawóz z kompostu” (szklarnia, 15 mld, ×1,5); `zakupy` „Sowa zakupowa” (szklarnia, 30 mld, automatyczne zakupy); `rosa` „Poranna rosa” (arboretum, 300 mld, ×3).
- `PRESTIGE = { after: "szklarnia", minRunLeaves: 1e10, divisor: 1e9, min: 1 }`.
- `PRESTIGE_TREE` — `{ id, branch, name, cost, max, req?, text }` (koszt poziomu `ceil(cost × 1,6^poziom)`): Korzenie — `korzenie` „Starożytne korzenie” (1, max 10, +25% produkcji/poziom), `szybkiStart` „Szybki parapet” (3, max 3, wymaga `korzenie`, 25 Monster na start/poziom), `pamiecNasion` „Pamięć nasion” (5, max 5, wymaga `szybkiStart`, +10% nasion/poziom); Woda — `pamiecPlusku` „Pamięć plusku” (1, max 5, podlanie +15 s/poziom), `studnia` „Głęboka studnia” (2, max 3, wymaga `pamiecPlusku`, +1 ładunek/poziom), `echoHumbaka` „Echo humbaka” (4, max 5, wymaga `studnia`, Zatoka +25%/poziom — E7c); Sen — `senni` „Senni ogrodnicy” (1, max 5, offline +10%/poziom), `glebokiSen` „Głęboki sen” (2, max 4, wymaga `senni`, +2 h limitu/poziom), `kozieSzczescie` „Kozie szczęście” (4, max 3, wymaga `glebokiSen`, częstsze kózki — E7c).

### `economy.js`

- `plantById`, `upgradeById`, `prestigeById`; `prestigeLevel(stan, id)`, `hasUpgrade(stan, id)`.
- `plantCost(roślina, posiadane, ile = 1)` = `ceil(cost × growth^posiadane × (growth^ile − 1) / (growth − 1))` (0 dla ile ≤ 0).
- `maxAffordable(roślina, posiadane, liście, limit = 1000)` → `{ amount, cost }` (z logarytmu, potem korekta w dół, gdy cena przekracza liście).
- `milestoneMultiplier(posiadane)` — iloczyn `MILESTONE_BOOST` dla osiągniętych progów; `plantStage(posiadane)` — 0 bez roślin, inaczej 1 + liczba osiągniętych `MILESTONES`.
- `prestigeCost(stan, węzeł)`; `waterStats(stan)` → `{ charges (3 + Głęboka studnia), regen (60 albo Zraszacz 40), multiplier (2 albo Zraszacz 3), duration (45 + 15 × Pamięć plusku) }`; `offlineStats(stan)` → `{ efficiency: 0,5 + 0,1 × Senni, cap: 4 h + 2 h × Głęboki sen }`.
- `production(stan, teraz)` → `{ lps, base, perPlant, global, boost, tap }`: `global` = (1 + 0,25 × Korzenie) × mnożniki `global` ulepszeń; dla każdej rośliny `posiadane × prod × global × mnożnik rozdziału × mnożnik gatunku × milestoneMultiplier` (0 dla gatunku `stan.blocked`); `boost` = (podlane: mnożnik konewki) × (`effects.boost`: 3) × (`effects.pracu`: 0,7) — gdy „do kiedy” > teraz; `lps = base × boost`, `perPlant` z premiami; `tap = 1 × mnożniki tap + lps × tapLps`.
- `prestigeSeeds(stan)` — 0 bez ukończonej Szklarni albo przy liściach cyklu < 10 mld; inaczej `max(1, floor(√(liście cyklu / 1 mld) × (1 + 0,1 × Pamięć nasion)))`.
- `formatNumber(v)` — po polsku: < 1000 całe (poniżej 10 z jednym miejscem, przecinek), wyżej z przyrostkami „ tys.”, „ mln”, „ mld”, „ bln”, „ bld”, „ tryl.”, „ tryld” (2 cyfry znaczące, bez zbędnych zer); minus `−`. `formatTime(s)` — „3 h 05 min”, „4 min 10 s”, „35 s”.

### `state.js`

- `defaultState(teraz)` → `{ version: 3, createdAt, savedAt, leaves, runLeaves, lifetimeLeaves, seeds, plants, upgrades, prestige, chapters (ukończone, zostają po przesadzaniu), can: { charges, progress }, effects: { watered, boost, pracu } (ms, do kiedy), splash (Plusk-o-metr 0–1), blocked (gatunek pod ciężarówką), stats: { taps, waterings, buys, prestiges, seedsEarned, bestLps, offlineLeaves, goats, bays, calls, trucks }, achievements }`.
- `migrateV2(stary, teraz)` → `{ state, report: { refundLeaves, refundSeeds, splash } }`: rośliny pod nowymi identyfikatorami (`fern` → `paproc`, `alocasia` → `alokazja`, `cactus` → `kaktus`, `orchid` → `storczyk`, `goldTree` → `zloteDrzewko`, reszta bez zmian; nieznane pomijane); ulepszenia z odpowiednikiem (`softGloves` → `rekawiczki`, `betterSoil` → `ziemia`, `wateringCan` → `konewka`, `leafBasket` → `koszyk`, `balconyShelves` → `polki`, `compostBox` → `kompost`, `smallSprinkler` → `zraszacz`, `greenhouseLamps` → `lampy`, `monsterFertilizer` → `nawoz`, `smartBuyerPlants` → `zakupy`), pozostałe — zwrot ceny w liściach (`fastBeak` 2000, `gardenRhythm` 20 000, `cuteLabels` 1000, `bigSprinkler` 80 000, `whalePool` 250 000, `autoHarvestI` 3500, `autoHarvestII` 65 000, `autoClicker` 120 000, `goatAssistant` 420 000, `deliveryManager` 9 mln, `offlineGardeners` 25 mln); dawne drzewko prestiżu — zwrot nasion (`ceil(koszt × 1,55^poziom)` za każdy poziom; koszty: roots 1, fastStart 3, seedMemory 6, waterMemory 2, waterStart 4, whaleEcho 7, sleepy 2, deepSleep 4, nightShift 8, goatWisdom 5, amic 5, smartRoots 9) — do wydania w nowym drzewku; woda → Plusk-o-metr (`min(1, woda / 1000)`); ukończone rozdziały ze stref (`unlocked`): balcony → 1, plot → 2, pool → 3, greenhouse/center → 4, arboretum → 5 ukończonych; `lastSavedAt` → `savedAt`, `currentRunLeaves` → `runLeaves`; statystyki (`clicks` → `taps`, `watering` → `waterings`, `golden` → `goats`, `deliveries` → `trucks`, `totalPrestigeSeeds` → `seedsEarned`, reszta 1:1); osiągnięcia bez zmian; z konewką — 3 ładunki.
- `loadState(surowy, teraz)` → `{ state, report }`: brak → nowy stan; wersja inna niż 3 → `migrateV2`; wersja 3 → uzupełnienie brakujących pól wartościami domyślnymi, liczby niepoprawne → 0.

### `garden.js` — silnik

- `chapterIndex(stan)` — pierwszy nieukończony rozdział (po ostatnim — ostatni); `chapterOpen(stan, id)` — rozdział bieżący albo wcześniejszy (rośliny i ulepszenia późniejszych są niedostępne); `goalProgress(stan, cel, lps)` → `{ value, target, done }`.
- `createGarden({ state, now })` (`now` — ms; gra: `Date.now`, symulator: własny zegar):
  - `tap()` — liście `production().tap`, `stats.taps + 1`, zdarzenie `tap { gain }`;
  - `buyPlant(id, ile | "max")` — tylko z otwartego rozdziału i za liście; `stats.buys`, zdarzenie `plant { id, amount, cost, owned }` i `milestone { id, owned }` za każdy przekroczony próg 10/25/50/100;
  - `buyUpgrade(id)` — raz, z otwartego rozdziału; konewka daje pełne ładunki; zdarzenie `upgrade { id }`;
  - `water()` — z konewką i ładunkiem: −1 ładunek, `effects.watered` = max(teraz, dotychczasowe) + czas podlania (kolejne podlanie wydłuża), `stats.waterings + 1`, zdarzenie `water { until }`;
  - `update(dt)` — liście `lps × dt` (do `leaves`, `runLeaves`, `lifetimeLeaves`), `stats.bestLps`, ładowanie konewki (`progress += dt / regen`, przy pełnej — 0), Sowa zakupowa co 0,5 s kupuje `bestPlant()`, gdy stać;
  - po każdej akcji `checkChapters()` — dopóki cele bieżącego rozdziału są wykonane: rozdział ukończony, zdarzenie `chapter { id, next }`;
  - `bestPlant()` — roślina z otwartych rozdziałów o największym przyroście produkcji (z kamieniem milowym) na liść ceny → `{ plant, cost, value }`;
  - `prestige()` — gdy `prestigeSeeds > 0`: nowy stan, zostają nasiona (+ nowe), drzewko, rozdziały, liście z całej gry, statystyki (`prestiges + 1`, `seedsEarned`), osiągnięcia, data utworzenia, Plusk-o-metr; Szybki parapet — 25 Monster za poziom; zdarzenie `prestige { seeds }`;
  - `buyPrestige(id)` — wymagany węzeł `req` (poziom > 0), limit `max`, koszt w nasionach; Głęboka studnia dokłada ładunek; zdarzenie `prestigeNode { id, level }`;
  - `applyOffline(s)` — czas przycięty do limitu (poniżej 60 s nic): liście = produkcja bazowa (bez premii na czas) × czas × skuteczność, konewka + `floor(czas / regen)` ładunków; `stats.offlineLeaves`; zdarzenie `offline { seconds, leaves }`;
  - `goals()` → `{ chapter, done, goals: [{ …cel, value, target, done }] }`; `upgrades()` — ulepszenia otwartych rozdziałów; `prestigeTree()`; `takeEvents()`.

### Testy (E7a)

`tests/unit/ogrody-ekonomia.test.mjs` (11): dane (6 rozdziałów po 3–5 celów, rośliny od tańszych do droższych z rosnącym czasem zwrotu, cele wskazują istniejące rośliny i ulepszenia, drzewko 3 × 3); ceny (suma ciągu, `maxAffordable`, kamienie milowe, etapy wyglądu); produkcja (ulepszenia, kamienie milowe, premie na czas, ciężarówka); silnik (stuknięcia, zakupy ×1 / ×n / max, rozdziały otwierają rośliny i ulepszenia po kolei, zdarzenia rozdziału i kamienia milowego); konewka (ładunki, wydłużanie, odnowienie 60 s, Zraszacz ×3 i 40 s); Wielkie Przesadzanie (warunki, nasiona, reset i to, co zostaje, Arboretum); drzewko prestiżu (wymagania, koszt, limit, Korzenie, Szybki parapet); offline (50%, limit, minuta, konewka, Senni i Głęboki sen); migracja v2 → v3 (rośliny, ulepszenia, zwroty, Plusk-o-metr, rozdziały ze stref, statystyki, `loadState`); liczby i czas po polsku; **symulator** — bot jak aktywny gracz (2 stuknięcia/s, podlewanie, ulepszenia od najtańszych, rośliny z celów, potem najopłacalniejsze; po przesadzaniu nasiona w drzewko): rozdziały po kolei (Parapet < 3 min, Balkon < 20 min), pierwsze Wielkie Przesadzanie po 120–180 min, drugi cykl krótszy niż 75% pierwszego, trzeci nie dłuższy niż drugi; spokojniejsza gra (0,5 stuknięcia/s) — wolniej, poniżej 4 h.

## Architektura

`Sowie Ogrody` jest samodzielną grą Canvas 2D w katalogu `SowieOgrody/`. Wykorzystuje wspólne elementy repozytorium:

- `../config/firebase-config.js` i `../shared/sowie-cloud.js` (zapis w Firestore),
- `../shared/password-gate.js` (ekran „Hasło sowy”),
- `../shared/cute-ui.css`,
- `../shared/sowie-core.js`,
- `../shared/sowie-runtime.js`,
- `../shared/sowie-smoke-hook.js`.

Główna logika znajduje się w `script.js`. Gra jest napisana jako jeden moduł IIFE, żeby łatwo działała bez bundlera.

## Kolejność ładowania

1. `../config/firebase-config.js`
2. `../shared/sowie-platform.js`
3. `../shared/sowie-cloud.js`
4. `../shared/password-gate.js`
5. `../shared/sowie-smoke-hook.js`
6. `../shared/cute-ui.css`, `../shared/game-enhancements.css`, `../shared/owl-gallery.css`, `style.css`
7. `../shared/stable-panel.js`
8. `../shared/sowie-core.js`
9. `../shared/notification-manager.js`
10. `../shared/sowie-runtime.js`
11. `script.js`
12. `../shared/modal-accessibility.js`, `../shared/game-guides.js`, `../shared/sowie-academy.js`, `../shared/owl-gallery.js`, `../shared/gameplay-expansion.js`

## Pliki

```txt
SowieOgrody/
  index.html
  style.css
  script.js
  docs/
    README.md
    Documentation.md
```

## Stan gry

Stan jest zapisywany w Firestore przez `SowieCloud` jako tekst JSON w polu `state` dokumentu:

```txt
sowiegry/profil/sowiegry_gry/ogrody
```

Stałe w `script.js`: `GAME_ID = "ogrody"`, `VERSION = 2` (`saveVersion`), `IMPORTANT_SAVES = ["manual", "prestige", "upgrade", "unlock", "offline"]`.

- **start:** `let state = defaultSave()`; na końcu pliku `cloud.loadGameState(GAME_ID)` (czeka na `SowieCloud.ready`), potem `state = load(saved)` (`mergeSave` z wartościami domyślnymi) i `init()`. Gra nie startuje przed wczytaniem stanu z chmury;
- **`save(reason)`:** `state.lastSavedAt = Date.now()`, potem `cloud.saveGameState(GAME_ID, state, { immediate, saveVersion: 2, summary })`, gdzie `immediate` = powód z `IMPORTANT_SAVES` (zapis po 2 s), inne powody — zapis zbiorczy najpóźniej po 30 s (≤ 120 zapisów na godzinę). `summary = { lifetimeLeaves, prestiges: stats.prestiges, zone }` trafia do dokumentu gry i do `profil.records.ogrody`. Dla powodów `manual`, `hidden`, `pagehide` dodatkowo `cloud.flush()` (natychmiastowe wysłanie). Napis w HUD „Zapisano” / „Zapisano ręcznie”;
- **`queueSave(reason)`:** jak dotąd — napis „Zapisywanie…” i `save(reason)` po 250 ms;
- **cykliczny zapis:** `setInterval(..., 5000)` wywołuje `queueSave("interval")` tylko przy widocznej karcie (w tle produkcja nie działa, więc `lastSavedAt` zostaje czasem zejścia do tła);
- **`window.SowieIdleGame = { id: "ogrody", ready, snapshot }`** — `ready` rozwiązuje się po wczytaniu stanu, `snapshot()` zwraca bieżący `state` (tylko do odczytu). Korzysta z niego `shared/gameplay-expansion.js` (kontrakty dnia).

Najważniejsze pola:

- `leaves` — aktualne liście,
- `water` — aktualna woda,
- `prestigeSeeds` — niewydane nasiona prestiżu,
- `lifetimeLeaves` — liście lifetime,
- `lifetimeWater` — woda lifetime,
- `currentRunLeaves` — liście zdobyte w obecnym cyklu prestiżu,
- `currentRunWater` — woda zdobyta w obecnym cyklu prestiżu,
- `zone` — aktualna strefa,
- `unlocked` — odblokowane strefy,
- `plants` — liczba roślin danego typu,
- `upgrades` — zwykłe ulepszenia cyklu,
- `prestige` — stałe poziomy drzewka prestiżu,
- `automation` — ustawienia automatyzacji,
- `effects` — aktywne efekty czasowe,
- `can` — stan konewki,
- `stats` — statystyki lokalne,
- `achievements` — osiągnięcia lokalne.

## Zwykłe drzewka rozwoju

Zwykłe skille są przechowywane w `upgrades` i resetują się przy prestiżu. Dane są w tablicy `UPGRADES`.

Każdy wpis może mieć:

```txt
id
group
icon
name
cost
zone
req
desc
effect
```

Grupy zwykłych drzewek:

- `click` — ręczne zbiory,
- `production` — produkcja roślin,
- `water` — konewka, zraszacze, woda i humbak,
- `automation` — auto-zbiory, auto-kliknięcia, koza, dostawy i auto-buy.

Wymagania zwykłych skilli są walidowane przez `upgradeAvailable(upgrade)`, która sprawdza strefę oraz listę `req`.

## System ekonomii

Koszt rośliny:

```txt
cost = baseCost * growth ^ owned
```

Produkcja rośliny:

```txt
owned * baseProduction * globalMultiplier * plantMultiplier * zoneMultiplier * milestoneMultiplier
```

Całkowite LPS:

```txt
sum(production of all plants)
```

Kliknięcie:

```txt
clickPower = max(1, clickMultiplier + leavesPerSecond * clickLpsPercent)
```

## Offline progress

Po wejściu do gry **oraz po powrocie z tła** (`visibilitychange → visible`, np. powrót do przeglądarki na telefonie) porównywany jest obecny czas z `lastSavedAt`. Zejście do tła (`visibilitychange → hidden`) wywołuje `save("hidden")`, a `pagehide` — `save("pagehide")`.

```txt
elapsed = now - lastSavedAt
used = min(elapsed, offlineCap)
offlineLeaves = lps * used * offlineEfficiency
offlineWater = wps * used * min(1, offlineEfficiency * 0.6)
```

Jeżeli minęło mniej niż 60 sekund, modal offline progress nie jest pokazywany.

## Konewka

Konewka jest stanem w `state.can`:

```txt
charges
max
progress
```

Użycie podlewania:

- wymaga ulepszenia `wateringCan`,
- zużywa ładunek konewki albo 10 wody,
- ustawia `effects.watered` na 45 sekund,
- produkcja jest mnożona x2.

Zraszacze zwiększają `canRegen` i produkcję wody. Stałe ulepszenie prestiżowe `waterStart` zwiększa startową wartość konewki i przyspiesza jej regenerację.

## Automatyzacja

Automatyzacja jest liczona w `metrics()` na podstawie zwykłych ulepszeń oraz stałego drzewka prestiżu.

Systemy:

- `harvestInterval` — okresowy bonus auto-zbiorów,
- `autoClick` — generowanie kliknięć na sekundę,
- `goat` — automatyczne zbieranie części złotych liści,
- `delivery` — automatyczne odbieranie zwykłych dostaw,
- `autobuy` — auto-buy najbardziej opłacalnych roślin.

Stałe ulepszenia prestiżowe mogą wzmacniać automatyzację, np. `goatWisdom`, `amic`, `smartRoots` i `nightShift`.

## Eventy

Eventy są przechowywane w tablicy runtime `events`, nie w zapisie. Są krótkotrwałe i nie muszą przetrwać reloadu.

Typy:

- `golden`,
- `rainbow`,
- `splash`,
- `delivery`,
- `goat`,
- `pracu`.

## Prestiż i stałe drzewko prestiżu

Prestiż odblokowuje się przy 100M liści zdobytych w obecnym cyklu, czyli `currentRunLeaves >= 100_000_000`.

Wzór nasion:

```txt
base = floor(sqrt(currentRunLeaves / 10_000_000))
prestigeGain = floor(base * (1 + seedMemoryLevel * 0.08))
```

Reset prestiżowy kasuje:

- `leaves`,
- `water`,
- `currentRunLeaves`,
- `currentRunWater`,
- `plants`,
- `upgrades`,
- aktywne eventy,
- aktywne efekty cyklu.

Reset zachowuje:

- `prestigeSeeds`,
- `prestige`,
- `stats`,
- `achievements`,
- `lifetimeLeaves`,
- `lifetimeWater`.

Drzewko prestiżu jest zdefiniowane w `PRESTIGE_TREE`. Każdy węzeł ma:

```txt
id
branch
icon
name
cost
max
req
desc
effect
```

Gałęzie drzewka prestiżu:

- `Korzenie` — produkcja, szybszy start i więcej nasion,
- `Woda` — woda, konewka i pluski humbaka,
- `Idle` — offline progress,
- `Auto` — koza, dostawy i auto-buy.

Zakup stałego ulepszenia wykonuje `buyPrestigeUpgrade(id)`. Zależności są sprawdzane przez `prestigeAvailable(upgrade)`. Koszt skaluje się przez:

```txt
cost = ceil(baseCost * 1.55 ^ currentLevel)
```

## Renderer

Renderer rysuje wszystko w Canvas 2D:

- tła stref,
- rośliny,
- sowę,
- słomkowy kapelusz w szklarni,
- kozę,
- humbaka,
- ciężarówkę Amic,
- eventy,
- cząsteczki,
- teksty pływające,
- aktywne boosty.

Nie używa zewnętrznych obrazków.

## Responsywność

`style.css` używa układu dwukolumnowego na desktopie i jednokolumnowego na mniejszych ekranach. Panel danych ma przewijanie, a karty/tabele są kompaktowe, żeby mieściły się na telefonie.

Dla drzewek rozwoju dodane są klasy:

```txt
.skill-tree
.skill-node
.prestige-tree
.prestige-node
```

Na telefonie drzewka przechodzą do jednej kolumny.

## Integracja z menu

Główne `index.html` zawiera kartę:

```html
<a class="game-card" href="SowieOgrody/">
  <h2>Sowie Ogrody</h2>
  <p>Idle incremental: sadź rośliny, podlewaj konewką, automatyzuj ogród i wracaj po offline progress.</p>
</a>
```

## Testy ręczne

1. Gra ładuje się z menu głównego.
2. Kliknięcie dodaje liście.
3. Rośliny można kupić po uzbieraniu kosztu.
4. LPS rośnie po zakupie roślin.
5. Save przetrwa reload i jest widoczny na drugim urządzeniu (po wpisaniu hasła `huhu`).
6. Zakładka `Rozwój` pokazuje zwykłe drzewka skilli.
7. Zależności zwykłych skilli działają.
8. Konewka odblokowuje podlewanie.
9. Podlewanie daje boost x2.
10. Offline progress pokazuje modal po przerwie.
11. Automatyzacja działa po zakupie odpowiednich ulepszeń.
12. Sowa w szklarni ma słomkowy kapelusz.
13. Prestiż pojawia się po spełnieniu warunku obecnego cyklu.
14. Prestiż resetuje zwykłe skille, rośliny i zasoby.
15. Drzewko prestiżu zostaje po resetach.
16. Stałe ulepszenia prestiżowe przyspieszają nowy cykl.

## Utrzymanie

- Dane ekonomii są na początku `script.js`.
- Zmiany balansu najlepiej robić przez wartości w `PLANTS`, `UPGRADES` i `PRESTIGE_TREE`.
- Zapis wyłącznie przez `SowieCloud` (`loadGameState` / `saveGameState`); gra nie używa pamięci przeglądarki.
- Zmiana formatu stanu wymaga podniesienia `VERSION` i obsługi starszego stanu w `mergeSave`.

## Okno „🏆 Rekordy”

Strona ładuje `../shared/records.js` po `../shared/owl-gallery.js` (i po `../shared/game-guides.js`, który tworzy dok przycisków). Moduł dodaje do doku przycisk 🏆 i okno rekordów zasilane przez `SowieCloud` (podsumowanie `profil.records.ogrody`). Opis modułu: `docs/Documentation.md`, sekcja „`shared/records.js`”.

## PWA (etap E2a)

`index.html` ma w `<head>` po `theme-color`: `<link rel="manifest" href="../manifest.webmanifest">`, `<link rel="icon" href="../assets/icons/icon.svg" type="image/svg+xml">`, `<link rel="apple-touch-icon" href="../assets/icons/apple-touch-icon.png">`, `<meta name="mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-title" content="SowieGry">`, a po `../shared/password-gate.js` skrypt `../shared/pwa.js` (rejestracja service workera `sw.js`). Gra trafia do pamięci podręcznej przy pierwszym otwarciu i potem uruchamia się także bez zasięgu. Opis: `docs/Documentation.md`, rozdział „PWA”.
