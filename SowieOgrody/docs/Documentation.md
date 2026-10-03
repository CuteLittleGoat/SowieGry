# Sowie Ogrody — dokumentacja techniczna

## Nowa odsłona (etap E7, w budowie) — katalog `ogrod/`

Przebudowa według Analizy 2 (rozdz. 3.4) i Analizy 3 (E7): czytelne moduły ES zamiast `script.js`, rozdziały z celami, widoczny ogród, zdarzenia maskotek (telefon Pracu Pracu, ciężarówka Amic, złota kózka), „Zatoka Humbaka”, ekonomia sprawdzona symulatorem, dolny panel na telefonie, postęp offline. Folder gry się nie zmienia: podgląd powstanie jako `SowieOgrody/nowa.html` (E7b), a po akceptacji właściciela zastąpi `index.html`. Do tego czasu działa dawna gra (`index.html` + `script.js`, opis niżej) i to ona zapisuje stan w wersji 2.

Stan kroków: **E7c1** — logika zdarzeń aktywnej gry (`ogrod/events.js`: telefon Pracu Pracu, ciężarówka Amic, złota kózka z 4 premiami, Plusk-o-metr i Zatoka Humbaka), symulator ze zdarzeniami (pierwsze Wielkie Przesadzanie po ok. 2 h 20 min); na stronie podglądu zdarzenia są jeszcze wyłączone (`events: false`) — pojawią się na ekranie w E7c2. **E7b** — strona podglądu `SowieOgrody/nowa.html` (`ogrod/main.js`, `render.js`, `panel.js`, `style.css`): ogród na płótnie (stuknięcie zbiera liście), HUD z liśćmi i konewką, cel rozdziału, dolny panel z 4 zakładkami, okna powitania i Wielkiego Przesadzania, zapis w osobnym polu `preview` dokumentu gry (dawna gra zostaje bez zmian), postęp offline (czas serwera) i po powrocie z tła; przycisk podglądu na karcie Sowich Ogrodów w menu. **E7a** — logika i dane: `config.js`, `economy.js`, `state.js` (stan v3 i migracja z v2), `garden.js` (silnik), testy i symulator tempa. Dalej: E7c2 — zdarzenia na ekranie (płótno, przyciski, Zatoka Humbaka), E7d — samouczek, instrukcja, muzyka, podgląd do akceptacji, E7e — podmiana.

### Pliki

```text
SowieOgrody/ogrod/
  package.json   { "type": "module" } — pliki .js to moduły ES (dawny script.js w katalogu wyżej zostaje skryptem)
  config.js      dane gry: rozdziały i cele, rośliny, kamienie milowe, stuknięcie, konewka, offline, zdarzenia, ulepszenia, prestiż
  economy.js     ekonomia (czysta logika): ceny, produkcja, konewka, offline, nasiona, liczby i czas po polsku
  state.js       stan wersji 3 i migracja ze stanu wersji 2 (zapisanego w Firestore przez dawną grę)
  garden.js      silnik ogrodu (czysta logika): stuknięcia, zakupy, konewka, rozdziały, Wielkie Przesadzanie, offline
  events.js      zdarzenia aktywnej gry (czysta logika): telefon Pracu, ciężarówka Amic, złota kózka, Zatoka Humbaka
  render.js      rysowanie ogrodu na płótnie (tło rozdziału, rośliny w doniczkach, sowa ogrodniczka, krople, napisy)
  panel.js       dolny panel: zakładki Rośliny, Ulepszenia, Prestiż, Kolekcja (DOM)
  main.js        strona podglądu: wczytanie i zapis stanu, pętla, stuknięcia, HUD, cel, okna, haki testowe
  style.css      wygląd strony podglądu (telefon pionowo i poziomo, komputer)
SowieOgrody/nowa.html  strona podglądu nowej odsłony
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
| Konewka (3 ładunki, ×2 na 45 s), zraszacze, waluta „woda” | ✅ konewka i Zraszacz; ↻ waluta „woda” usunięta — podlewanie i kózki napełniają Plusk-o-metr (✅ E7c1 logika, ⏳ E7c2 na ekranie) |
| Auto-zbiory, auto-kliknięcia, Sowa zakupowa | ↻ zostaje Sowa zakupowa (automatyczne kupowanie najopłacalniejszej rośliny co 0,5 s); auto-zbiory i auto-kliknięcia zastąpione mnożnikami i offline |
| Zdarzenie Pracu ×4 (premia) | ↻ ✅ E7c1 (logika; na ekranie ⏳ E7c2): telefon Pracu Pracu co 2–4 min — produkcja ×0,7, dopóki go nie odrzucisz; Tryb samolotowy odrzuca sam po 10 s |
| Dostawy Amic i „Kierownik dostaw Amic” | ↻ ✅ E7c1 (logika; na ekranie ⏳ E7c2): ciężarówka Amic zastawia jedną grządkę (gatunek nie produkuje), 3 stuknięcia ją przeganiają; Kozi kurier — 1 stuknięcie |
| Złoty liść, tęczowy liść (Gorączka ×3), koza (zbiera zdarzenia) | ↻ ✅ E7c1 (logika; na ekranie ⏳ E7c2): złota kózka co 60–120 s — ×3 na 30 s, 60 s produkcji od razu, kozi szał albo +50% Plusk-o-metru |
| Basen humbaka i zdarzenie „splash” | ↻ ✅ E7c1 (logika; na ekranie ⏳ E7c2): Zatoka Humbaka — 20 s mini-gry po napełnieniu Plusk-o-metru |
| Postęp offline (25%, limit 2 h + ulepszenia), okno po powrocie | ✅ 50%, limit 4 h (+ drzewko), konewka ładuje się offline; okno powitalne i czas serwera ⏳ E7b |
| Wielkie Przesadzanie od 100 mln liści cyklu, nasiona √ | ↻ ✅ po ukończeniu Szklarni i przy 10 mld liści cyklu; nasiona `√(liście cyklu / 1 mld)`; pierwsze po ok. 2–3 h (symulator) |
| Drzewko prestiżu: 4 gałęzie, 12 węzłów | ↻ ✅ 3 gałęzie po 3 węzły: Korzenie (produkcja, szybki start, nasiona), Woda (konewka, studnia, echo humbaka), Sen (offline, limit, kózki) |
| Osiągnięcia (5) i zakładka Statystyki | ↻ ✅ E7b zakładka Kolekcja (rozdziały, gatunki z etapem wyglądu, statystyki); osiągnięcia zastępują cele rozdziałów |
| Sowa w słomkowym kapeluszu w szklarni, humbak w basenie, koza, ciężarówka w ogrodzie | ✅ E7b sowa ogrodniczka w kapeluszu (`gardenerHat`) z atlasu Sowiego Świata; ⏳ E7c humbak, koza, ciężarówka |
| Zapis w chmurze (`saveGameState`, ważne akcje od razu), `window.SowieIdleGame` dla kontraktów dnia | ✅ E7b zapis v3 w polu `preview` (podgląd; przy podmianie w E7e — `state` z `saveVersion: 3`), ważne akcje po 2 s, zejście do tła od razu; metryki Sowiej Akademii przez most SowieProgress; ⏳ E7d kontrakty dnia |
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
- `PLANTS` — `{ id, name, chapter, cost, prod (liście/s za sztukę), growth (wzrost ceny), color }`; ceny ≈ 15 × 9,5^i, produkcja ≈ 0,2 × 5^i (2 cyfry znaczące), wzrost 1,13 + 0,004 i: `monstera` „Monstera” (parapet) 15 / 0,2 / 1,13 `#3fae6a`; `pilea` „Pilea” (parapet) 140 / 1 / 1,134 `#72bd68`; `paproc` „Paproć” (balkon) 1400 / 5 / 1,138 `#4b9e72`; `alokazja` „Alokazja” (balkon) 13 000 / 25 / 1,142 `#417b64`; `kaktus` „Kaktus” (dzialka) 120 000 / 120 / 1,146 `#5ba760`; `slonecznik` „Słonecznik” (dzialka) 1,2 mln / 620 / 1,15 `#f4c542`; `storczyk` „Storczyk” (basen) 11 mln / 3100 / 1,154 `#d96faf`; `lotos` „Lotos” (basen) 100 mln / 16 000 / 1,158 `#ff9fb2`; `bonsai` „Bonsai” (szklarnia) 1,3 mld / 78 000 / 1,162 `#3f8b5b`; `mutant` „Mutant monstery” (szklarnia) 12,5 mld / 390 000 / 1,166 `#2e8b57` (od E7c1 Bonsai i Mutant droższe — zdarzenia przyspieszają grę, a pierwsze przesadzanie ma zostać w 2–3 h); `zloteDrzewko` „Drzewko złotych liści” (arboretum) 90 mld / 2 mln / 1,17 `#d99a1e`.
- `MILESTONES = [10, 25, 50, 100]` (etapy wyglądu), `MILESTONE_BOOST = { 25: 2, 100: 2 }` (mnożnik produkcji gatunku od progu).
- `TAP = { base: 1, lpsShare: 0 }`; `WATER = { charges: 3, regen: 60, multiplier: 2, duration: 45 }`; `OFFLINE = { efficiency: 0.5, cap: 4 h, min: 60 }`.
- `GARDEN_EVENTS` (E7c1; czasy w s gry — nieobecność się nie liczy; `first` — pierwsze po tylu s, potem co `every` [od, do]): `pracu: { chapter: "balkon", first: 150, every: [120, 240], penalty: 0.7, airplane: 10 }`; `truck: { chapter: "dzialka", first: 120, every: [180, 300], taps: 3 }`; `goat: { first: 75, every: [60, 120], visible: 7, luck: 0.15 }`; `boost: { duration: 30, multiplier: 3 }`; `instant: 60`; `frenzy: { duration: 15, taps: 8 }`; `splash: { water: 0.05, goat: 0.1, reward: 0.4 }`; `bay: { duration: 20, every: 0.45, fountain: [0.5, 0.78], speed: [1, 1.35], spread: 0.18, gravity: 1.15, leafSeconds: 3, comboStep: 0.1, comboMax: 10, echo: 0.25 }` (Zatoka: współrzędne w ułamkach płótna, y w dół).
- `GOAT_REWARDS` — premie złotej kózki (losowane po równo) z komunikatem: `boost` „Złota kózka: produkcja ×3 przez 30 s!”, `instant` „Złota kózka: liście z minuty produkcji!”, `frenzy` „Kozi szał! Kózka zbiera liście przez 15 s”, `splash` „Złota kózka: Plusk-o-metr +50%!” (+0,4 do Plusk-o-metru i +0,1 jak za każdą kózkę).
- `UPGRADES` — `{ id, name, chapter, cost, text, effect }`, efekty: `global` (mnożnik wszystkich roślin), `tap` (mnożnik stuknięcia), `tapLps` (udział produkcji w stuknięciu), `chapter: { rozdział: mnożnik }`, `plant: { gatunek: mnożnik }`, `water: { multiplier, regen }`, `airplane` (s), `courier`, `autobuy`: `rekawiczki` „Miękkie rękawiczki” (parapet, 60, stuknięcia ×3); `ziemia` „Lepsza ziemia” (parapet, 400, ×1,5); `konewka` „Konewka sowy” (balkon, 1500, podlewanie); `koszyk` „Koszyk na liście” (balkon, 6000, +2% produkcji w stuknięciu); `polki` „Półki balkonowe” (balkon, 25 000, Parapet i Balkon ×2); `kompost` „Kompostownik” (dzialka, 300 000, ×1,5); `zraszacz` „Zraszacz” (dzialka, 800 000, podlewanie ×3, ładunek co 40 s); `grzadki` „Wysokie grządki” (dzialka, 2,5 mln, Działka ×2); `samolot` „Tryb samolotowy” (dzialka, 5 mln, telefon milknie sam po 10 s); `pompa` „Pompa basenowa” (basen, 100 mln, Basen ×2); `nawozMonster` „Nawóz monster” (basen, 40 mln, Monstera ×5); `kurier` „Kozi kurier” (basen, 200 mln, ciężarówka po 1 stuknięciu); `lampy` „Lampy szklarniowe” (szklarnia, 5 mld, Szklarnia ×2); `nawoz` „Nawóz z kompostu” (szklarnia, 15 mld, ×1,5); `zakupy` „Sowa zakupowa” (szklarnia, 30 mld, automatyczne zakupy); `rosa` „Poranna rosa” (arboretum, 300 mld, ×3).
- `PRESTIGE = { after: "szklarnia", minRunLeaves: 1e10, divisor: 1e9, min: 1 }`.
- `PRESTIGE_TREE` — `{ id, branch, name, cost, max, req?, text }` (koszt poziomu `ceil(cost × 1,6^poziom)`): Korzenie — `korzenie` „Starożytne korzenie” (1, max 10, +25% produkcji/poziom), `szybkiStart` „Szybki parapet” (3, max 3, wymaga `korzenie`, 25 Monster na start/poziom), `pamiecNasion` „Pamięć nasion” (5, max 5, wymaga `szybkiStart`, +10% nasion/poziom); Woda — `pamiecPlusku` „Pamięć plusku” (1, max 5, podlanie +15 s/poziom), `studnia` „Głęboka studnia” (2, max 3, wymaga `pamiecPlusku`, +1 ładunek/poziom), `echoHumbaka` „Echo humbaka” (4, max 5, wymaga `studnia`, Zatoka +25%/poziom — E7c); Sen — `senni` „Senni ogrodnicy” (1, max 5, offline +10%/poziom), `glebokiSen` „Głęboki sen” (2, max 4, wymaga `senni`, +2 h limitu/poziom), `kozieSzczescie` „Kozie szczęście” (4, max 3, wymaga `glebokiSen`, częstsze kózki — E7c).

### `economy.js`

- `plantById`, `upgradeById`, `prestigeById`; `prestigeLevel(stan, id)`, `hasUpgrade(stan, id)`.
- `plantCost(roślina, posiadane, ile = 1)` = `ceil(cost × growth^posiadane × (growth^ile − 1) / (growth − 1))` (0 dla ile ≤ 0).
- `maxAffordable(roślina, posiadane, liście, limit = 1000)` → `{ amount, cost }` (z logarytmu, potem korekta w dół, gdy cena przekracza liście).
- `milestoneMultiplier(posiadane)` — iloczyn `MILESTONE_BOOST` dla osiągniętych progów; `plantStage(posiadane)` — 0 bez roślin, inaczej 1 + liczba osiągniętych `MILESTONES`.
- `prestigeCost(stan, węzeł)`; `waterStats(stan)` → `{ charges (3 + Głęboka studnia), regen (60 albo Zraszacz 40), multiplier (2 albo Zraszacz 3), duration (45 + 15 × Pamięć plusku) }`; `offlineStats(stan)` → `{ efficiency: 0,5 + 0,1 × Senni, cap: 4 h + 2 h × Głęboki sen }`.
- `production(stan, teraz)` → `{ lps, base, perPlant, global, boost, tap }`: `global` = (1 + 0,25 × Korzenie) × mnożniki `global` ulepszeń; dla każdej rośliny `posiadane × prod × global × mnożnik rozdziału × mnożnik gatunku × milestoneMultiplier` (0 dla gatunku `stan.blocked`); `boost` = (podlane: mnożnik konewki) × (`effects.boost`: `GARDEN_EVENTS.boost.multiplier` = 3) × (`effects.pracu`: `GARDEN_EVENTS.pracu.penalty` = 0,7) — gdy „do kiedy” > teraz; `lps = base × boost`, `perPlant` z premiami; `tap = 1 × mnożniki tap + lps × tapLps`.
- `prestigeSeeds(stan)` — 0 bez ukończonej Szklarni albo przy liściach cyklu < 10 mld; inaczej `max(1, floor(√(liście cyklu / 1 mld) × (1 + 0,1 × Pamięć nasion)))`.
- `formatNumber(v)` — po polsku: < 1000 całe (poniżej 10 z jednym miejscem, przecinek), wyżej z przyrostkami „ tys.”, „ mln”, „ mld”, „ bln”, „ bld”, „ tryl.”, „ tryld” (2 cyfry znaczące, bez zbędnych zer); minus `−`. `formatTime(s)` — „3 h 05 min”, „4 min 10 s”, „10 min” (pełne minuty bez „0 s”), „35 s”.

### `state.js`

- `defaultState(teraz)` → `{ version: 3, createdAt, savedAt, leaves, runLeaves, lifetimeLeaves, seeds, plants, upgrades, prestige, chapters (ukończone, zostają po przesadzaniu), can: { charges, progress }, effects: { watered, boost, pracu, frenzy } (ms, do kiedy), splash (Plusk-o-metr 0–1), blocked (gatunek pod ciężarówką), timers: { pracu: 150, truck: 120, goat: 75 } (s gry do następnego zdarzenia — `GARDEN_EVENTS.*.first`), phone (`{ time }` — s dzwonienia, albo null), truck (`{ taps }` albo null), goat (`{ time, reward, dir }` albo null), bay (trwająca Zatoka albo null), stats: { taps, waterings, buys, prestiges, seedsEarned, bestLps, offlineLeaves, goats, bays, calls, trucks }, achievements }`.
- `migrateV2(stary, teraz)` → `{ state, report: { refundLeaves, refundSeeds, splash } }`: rośliny pod nowymi identyfikatorami (`fern` → `paproc`, `alocasia` → `alokazja`, `cactus` → `kaktus`, `orchid` → `storczyk`, `goldTree` → `zloteDrzewko`, reszta bez zmian; nieznane pomijane); ulepszenia z odpowiednikiem (`softGloves` → `rekawiczki`, `betterSoil` → `ziemia`, `wateringCan` → `konewka`, `leafBasket` → `koszyk`, `balconyShelves` → `polki`, `compostBox` → `kompost`, `smallSprinkler` → `zraszacz`, `greenhouseLamps` → `lampy`, `monsterFertilizer` → `nawoz`, `smartBuyerPlants` → `zakupy`), pozostałe — zwrot ceny w liściach (`fastBeak` 2000, `gardenRhythm` 20 000, `cuteLabels` 1000, `bigSprinkler` 80 000, `whalePool` 250 000, `autoHarvestI` 3500, `autoHarvestII` 65 000, `autoClicker` 120 000, `goatAssistant` 420 000, `deliveryManager` 9 mln, `offlineGardeners` 25 mln); dawne drzewko prestiżu — zwrot nasion (`ceil(koszt × 1,55^poziom)` za każdy poziom; koszty: roots 1, fastStart 3, seedMemory 6, waterMemory 2, waterStart 4, whaleEcho 7, sleepy 2, deepSleep 4, nightShift 8, goatWisdom 5, amic 5, smartRoots 9) — do wydania w nowym drzewku; woda → Plusk-o-metr (`min(1, woda / 1000)`); ukończone rozdziały ze stref (`unlocked`): balcony → 1, plot → 2, pool → 3, greenhouse/center → 4, arboretum → 5 ukończonych; `lastSavedAt` → `savedAt`, `currentRunLeaves` → `runLeaves`; statystyki (`clicks` → `taps`, `watering` → `waterings`, `golden` → `goats`, `deliveries` → `trucks`, `totalPrestigeSeeds` → `seedsEarned`, reszta 1:1); osiągnięcia bez zmian; z konewką — 3 ładunki.
- `loadState(surowy, teraz)` → `{ state, report }`: brak → nowy stan; wersja inna niż 3 → `migrateV2`; wersja 3 → uzupełnienie brakujących pól wartościami domyślnymi (także `timers` pole po polu), liczby niepoprawne → 0; kózka i Zatoka nie przetrwają wczytania (`null`), a przerwana Zatoka oddaje pełny Plusk-o-metr (`splash = 1`); bez ciężarówki `blocked = null`, bez telefonu `effects.pracu = 0`.

### `garden.js` — silnik

- `chapterIndex(stan)` — pierwszy nieukończony rozdział (po ostatnim — ostatni); `chapterOpen(stan, id)` — rozdział bieżący albo wcześniejszy (rośliny i ulepszenia późniejszych są niedostępne); `goalProgress(stan, cel, lps)` → `{ value, target, done }`.
- `createGarden({ state, now, random = Math.random, events = true })` (`now` — ms; gra: `Date.now`, symulator: własny zegar; `random` — losowanie zdarzeń, w testach z ziarnem; `events: false` — bez zdarzeń aktywnej gry, ich liczniki stoją):
  - `tap()` — liście `production().tap`, `stats.taps + 1`, zdarzenie `tap { gain }`;
  - `buyPlant(id, ile | "max")` — tylko z otwartego rozdziału i za liście; `stats.buys`, zdarzenie `plant { id, amount, cost, owned }` i `milestone { id, owned }` za każdy przekroczony próg 10/25/50/100;
  - `buyUpgrade(id)` — raz, z otwartego rozdziału; konewka daje pełne ładunki; zdarzenie `upgrade { id }`;
  - `water()` — z konewką i ładunkiem: −1 ładunek, `effects.watered` = max(teraz, dotychczasowe) + czas podlania (kolejne podlanie wydłuża), `stats.waterings + 1`, zdarzenie `water { until }`, Plusk-o-metr + `splash.water`;
  - `update(dt)` — liście `lps × dt` (do `leaves`, `runLeaves`, `lifetimeLeaves`), zdarzenia aktywnej gry (`events.js`, gdy `events`), `stats.bestLps`, ładowanie konewki (`progress += dt / regen`, przy pełnej — 0), Sowa zakupowa co 0,5 s kupuje `bestPlant()`, gdy stać;
  - po każdej akcji `checkChapters()` — dopóki cele bieżącego rozdziału są wykonane: rozdział ukończony, zdarzenie `chapter { id, next }`;
  - `bestPlant()` — roślina z otwartych rozdziałów o największym przyroście produkcji (z kamieniem milowym) na liść ceny → `{ plant, cost, value }`;
  - `prestige()` — gdy `prestigeSeeds > 0`: nowy stan, zostają nasiona (+ nowe), drzewko, rozdziały, liście z całej gry, statystyki (`prestiges + 1`, `seedsEarned`), osiągnięcia, data utworzenia, Plusk-o-metr; Szybki parapet — 25 Monster za poziom; zdarzenie `prestige { seeds }`;
  - `buyPrestige(id)` — wymagany węzeł `req` (poziom > 0), limit `max`, koszt w nasionach; Głęboka studnia dokłada ładunek; zdarzenie `prestigeNode { id, level }`;
  - `applyOffline(s)` — czas przycięty do limitu (poniżej 60 s nic); najpierw `clear()` zdarzeń (telefon milknie, ciężarówka odjeżdża, kózka znika — nieobecność nie jest karana), potem liście = produkcja bazowa (bez premii na czas) × czas × skuteczność, konewka + `floor(czas / regen)` ładunków; `stats.offlineLeaves`; zdarzenie `offline { seconds, leaves }`;
  - `goals()` → `{ chapter, done, goals: [{ …cel, value, target, done }] }`; `upgrades()` — ulepszenia otwartych rozdziałów; `prestigeTree()`; `takeEvents()`;
  - zdarzenia aktywnej gry (przekazane do `events.js`): `hangUp()`, `shooTruck()`, `catchGoat()`, `startBay()`, `catchLeaf(x, y, rx, ry)`; wewnętrzne `harvest()` — zbiór jak stuknięcie (`production().tap`), ale bez licznika stuknięć, zdarzenie `harvest { gain }` (kozi szał).

### `events.js` — zdarzenia aktywnej gry (E7c1)

Czysta logika, podpinana w `garden.js` (`createEvents({ state, now, random, emit, isOpen, addLeaves, harvest })`). Odliczanie (`state.timers`) biegnie tylko w `update(dt)`, czyli w czasie gry; `clear()` przy postępie offline. Funkcje pomocnicze: `goatInterval(stan)` — `GARDEN_EVENTS.goat.every` × (1 − 0,15 × Kozie szczęście); `bayMultiplier(stan, combo)` = (1 + 0,1 × min(combo, 10)) × (1 + 0,25 × Echo humbaka).

- **Telefon Pracu Pracu** (od rozdziału Balkon): gdy nie dzwoni, `timers.pracu −= dt`; przy 0 — `phone = { time: 0 }`, `effects.pracu` = teraz + 30 min (bezpiecznik), `stats.calls + 1`, zdarzenie `pracu`, następny za losowo 120–240 s. Dzwoniący: `phone.time += dt`; z Trybem samolotowym po 10 s `hangUp(true)`. `hangUp(auto)` — `phone = null`, `effects.pracu = 0`, zdarzenie `pracuEnd { auto }`.
- **Ciężarówka Amic** (od Działki): gdy jej nie ma, `timers.truck −= dt`; przy 0 — zastawia jeden z trzech najbardziej wydajnych posiadanych gatunków (losowo; bez roślin — nic): `blocked = gatunek`, `truck = { taps: 0 }`, `stats.trucks + 1`, zdarzenie `truck { plant }`; następna za 180–300 s. `shooTruck()` — `taps + 1`; przy 3 (z Kozim kurierem 1) odjeżdża (`truck = null`, `blocked = null`, `truckEnd { plant }`), inaczej `truckTap { taps, need }`.
- **Złota kózka**: gdy jej nie ma i nie trwa Zatoka, `timers.goat −= dt`; przy 0 — `goat = { time: 0, reward (losowa z GOAT_REWARDS), dir (±1 — kierunek biegu) }`, zdarzenie `goat { reward }`, następna za `goatInterval`. Po 7 s ucieka (`goatGone`). `catchGoat()` → premia: `boost` — `effects.boost` = max(teraz, dotychczasowe) + 30 s; `instant` — liście = produkcja bazowa × 60; `frenzy` — `effects.frenzy` + 15 s; zawsze Plusk-o-metr + 0,1 (przy `splash` + 0,4 więcej); `stats.goats + 1`, zdarzenie `goatCaught { reward, leaves }`.
- **Kozi szał**: w każdym kroku część `dt` przed końcem `effects.frenzy` × 8 zbiorów/s (`harvest()`, ułamki przechodzą na następny krok).
- **Plusk-o-metr**: `addSplash(n)` — do 1 (poza Zatoką); przy dojściu do 1 zdarzenie `bayReady`.
- **Zatoka Humbaka**: `startBay()` — przy pełnym Plusk-o-metrze (i bez trwającej): `splash = 0`, `bay = { time: 20, spawn, combo, bestCombo, caught, missed, reward, leaves: [], next }`, zdarzenie `bay`. W `update`: co 0,45 s liść z fontanny (`x = 0,5`, `y = 0,78`, `vx` = ±0,18 losowo, `vy` = −(1–1,35)), ruch z grawitacją 1,15; liść poniżej `y = 1,05` — `missed + 1` i combo od zera; po 20 s `bay = null`, `stats.bays + 1`, zdarzenie `bayEnd { caught, missed, reward, bestCombo }`. `catchLeaf(x, y, rx = 0,09, ry = 0,07)` — najbliższy liść w elipsie wokół stuknięcia (ułamki płótna): combo + 1, liście = produkcja bazowa × 3 s × `bayMultiplier(combo)`, zdarzenie `bayCatch { gain, combo, x, y }`; pudło → 0.

### `nowa.html` — strona podglądu

- `<html lang="pl" class="sowie-shell">`; `<head>`: `viewport` z `viewport-fit=cover`, `theme-color` `#e7ffe6`, opis, tytuł „Sowie Ogrody (nowa odsłona) — SowieGry”, manifest i ikony PWA; skrypty w kolejności `../config/firebase-config.js`, `../shared/sowie-platform.js`, `../shared/sowie-cloud.js`, `../shared/password-gate.js`, `../shared/pwa.js`; `preload` Fredoki; style `../shared/cute-ui.css`, `../shared/world/tokens.css`, `../shared/ui/ui.css`, `ogrod/style.css`; `../shared/sowie-academy.js` i `../shared/owl-gallery.js` z `defer`; moduł `ogrod/main.js`.
- `<body data-sowie-game="ogrody">` → `main.ogrod[data-ogrod]` („Sowie Ogrody”): `header.ogrod-top` (odnośnik **Menu** `../`, `.ogrod-leaves` z `strong[data-leaves]` i `span[data-lps]`, przycisk `.ogrod-water[data-water]` „Podlej” z `span[data-charges]`, ukryty bez konewki); `section.ogrod-goal[data-goal]` (`aria-live="polite"`); `div.ogrod-garden` z `canvas[data-canvas]` (`tabindex="0"`, „Ogród — stuknij, żeby zebrać liście”); `section.ogrod-sheet` z `nav.ogrod-tabs[data-tabs]` (`role="tablist"`), `div.ogrod-panel[data-panel]` i notką „Wersja podglądowa nowej odsłony. Postęp zapisuje się osobno — dawna gra (Sowie Ogrody) zostaje bez zmian.”

### `ogrod/style.css`

- `html, body` — wysokość 100%, bez marginesów; `body` — tło `var(--niebo-dol)`, czcionka `var(--czcionka-sowia)`, kolor `var(--kontur)`.
- `.ogrod` — `position: relative`, siatka: wiersze `auto auto minmax(170px, 34vh) minmax(0, 1fr)`, wysokość `100dvh`, szerokość do 1200 px na środku, odstępy z bezpiecznych obszarów (góra ≥ 8 px, boki ≥ 10 px), przerwa 8 px.
- `.ogrod-top` — 3 kolumny (`auto 1fr auto`), środek: `.ogrod-leaves` (liczba 26 px biała z obrysem 5 px `kontur`, cyfry tabelaryczne; pod spodem 13 px „liści/s”); `.ogrod-back` i `.ogrod-water` — min. 44 px; `.ogrod-water.is-active` (podlane) — tło `woda-jasna`, obwódka 3 px `woda`.
- `.ogrod-goal` — `padding: 8px 12px`, promień 16 px, tło `rgba(255,255,255,0.85)`, cień; `h2` 15 px (flex: nazwa rozdziału i licznik celów 13 px `monstera-ciemna`); lista 13 px, wiersze flex (tekst i postęp, cyfry tabelaryczne); wykonane — przekreślone, `monstera-ciemna`.
- `.ogrod-garden` — promień 20 px, `overflow: hidden`, cień; płótno 100% × 100%, `touch-action: manipulation`, kursor wskaźnika.
- `.ogrod-sheet` — siatka (zakładki, lista, notka), promień 20 px u góry, tło `rgba(255,246,227,0.97)`, cień w górę; `.ogrod-tabs` — 4 równe kolumny; `.ogrod-tab` — min. 44 px, bez ramki, promień 14 px u góry, 14 px; wybrana (`aria-selected="true"`) — białe tło i pasek `monstera` u dołu; `.ogrod-panel` — siatka z odstępem 8 px, przewijanie w pionie (`overscroll-behavior: contain`), dół z bezpiecznym obszarem.
- `.ogrod-card` — siatka `auto minmax(0, 1fr)` (próbka koloru i opis), `padding: 8px 10px`, promień 14 px, białe tło; `.ogrod-card.is-row` (ulepszenie, węzeł drzewka) — siatka `minmax(0, 1fr) auto`: opis po lewej, przycisk albo „Kupione” / „Maks.” po prawej w tym samym wierszu (`justify-self: end`); `.is-done` — krycie 0,7; `h3` 15 px, `p` 12 px (krycie 0,85); `.ogrod-swatch` 28 × 28 px w kolorze gatunku (`--kolor`, „liść”: promień 50% 50% 8px 8px); `.ogrod-owned` 13 px; `.ogrod-buy` — 3 kolumny (2 : 1 : 1), przyciski min. 44 px, główny z ceną po prawej; `.ogrod-done` 13 px `monstera-ciemna`; `.ogrod-subtitle` 14 px; `.ogrod-note`, `.ogrod-empty` 13 px; `.ogrod-chapters` — pigułki 13 px (szare, ukończone `monstera-jasna`, bieżący `zloto`); `.ogrod-stats` — wiersze flex 13 px; `.ogrod-preview` 12 px, krycie 0,8.
- Telefon poziomo (`orientation: landscape` i `max-height: 500px`): 2 kolumny — po lewej HUD, cel i ogród, po prawej panel na całą wysokość. Komputer (`min-width: 900px` i `min-height: 501px`): kolumny 3 : 2, panel po prawej (promień 20 px).

### `ogrod/render.js`

`gardenUnit(szerokość, wysokość)` (eksport) — skala rysunku względem ogrodu telefonu 360 × 260 px: `min(szerokość / 360, wysokość / 260)` ograniczone do 0,85–2 (na komputerze rośliny i sowa rosną razem z płótnem).

`createGardenRenderer({ canvas, atlas })` (piksele CSS, płótno w rozdzielczości `min(2, DPR)`) → `resize()`, `size()`, `spots` (położenia doniczek), `popup(tekst, x, y, kolor = biały, rozmiar = 20)` (unosi się 50 px/s, znika w 1 s, najwyżej 12), `burst(x, y, ile = 8, kolor = monsteraJasna)` (cząsteczki-liście z grawitacją 260 px/s², najwyżej 120), `draw({ state, now, time, dt, animator, cosmetic })`:

- tło bieżącego rozdziału (`SCENES`: niebo góra / dół, podłoże od 60% wysokości): Parapet — okno z ramą i szprosami; Balkon — balustrada `szaryCiemny` co 26 px; Działka — biały płotek; Basen — basen `woda` z falującym odblaskiem; Szklarnia — słupki szklarni; Arboretum — korony drzew; pas podłoża z cieniem;
- sowa ogrodniczka (`drawOwl` z atlasu, stan z animatora, rozmiar `min(36% wysokości, 32% szerokości, 96 × gardenUnit)`, stopy na podłożu, bez wybranej garderoby — kapelusz ogrodnika `gardenerHat`);
- półka: posiadane gatunki w doniczkach, najwyżej 6 w rzędzie, rząd równo podzielony na szerokość (środek kolumny `szerokość × (kolumna + 0,5) / ile w rzędzie`); jeden rząd na 78% wysokości, przy 7+ gatunkach dwa rzędy — pierwszy z tyłu na 70% (skala ×0,75), drugi z przodu na 90% (×0,9), rysowane od tylnego; skala rośliny `(0,7 + 0,12 × etap) × gardenUnit × dopasowanie`, gdzie dopasowanie = `min(1, szerokość kolumny / (80 × gardenUnit))` × skala rzędu (liście sąsiadów nie zachodzą na siebie); doniczka `doniczka` 26 × 20 (× skala) z ciemniejszym rantem, liście `2 + etap` (elipsy w kolorze gatunku, rozstaw 0,42 rad, długość `(16 + 4 × etap) × skala`, lekko się kołyszą), przy etapie 5 złoty kwiat; podpisy „×liczba” na końcu (nad wszystkimi roślinami): czcionka `11 × min(gardenUnit, 1,4)` px na plakietce `rgba(255,255,255,0.75)` (promień 7, wysokość 14 × ta sama skala) tuż pod doniczką;
- po podlaniu — padające krople `rgba(92,200,232,0.55)`; cząsteczki i napisy.

### `ogrod/panel.js`

`TABS` — `rosliny` „Rośliny”, `ulepszenia` „Ulepszenia”, `prestiz` „Prestiż”, `kolekcja` „Kolekcja”. `createPanel({ root, onBuy, onUpgrade, onPrestige, onNode })` → `setTab(id)`, `tab()`, `render(stan, teraz)`; zawartość budowana od nowa tylko przy zmianie klucza (zakładka, rozdział, rośliny, liczba ulepszeń, drzewko, nasiona; w Kolekcji co 2 s), dostępność przycisków odświeżana przy każdym `render`:

- **Rośliny** — gatunki otwartych rozdziałów: kolor, nazwa i „×posiadane”, produkcja za sztukę, mnożnik kamienia milowego, ile do następnego progu; przyciski „Kup” z ceną (×1), „×10”, „max” (wyłączone, gdy nie stać);
- **Ulepszenia** — niekupione od najtańszych (karty `is-row`: nazwa, opis, „Kup” z ceną), notka o kolejnych ulepszeniach po bieżącym rozdziale, potem „Kupione”;
- **Prestiż** — opis Wielkiego Przesadzania, nasiona (i ile teraz), przycisk „Wielkie Przesadzanie (+N nasion)” albo wyłączony „Wielkie Przesadzanie — po Szklarni i 10 mld liści”; gałęzie drzewka z węzłami (karty `is-row`: poziom/maks., opis — przy zablokowanym dopisek „Najpierw: nazwa poprzedniego.” — i przycisk z kosztem w nasionach „N 🌰”, zablokowany „🔒” albo „Maks.”);
- **Kolekcja** — pigułki rozdziałów (ukończone, bieżący), gatunki w ogrodzie z etapem wyglądu, statystyki (liście z całej gry i cyklu, najlepsza i bieżąca produkcja, stuknięcia, podlewania, kupione rośliny, przesadzania, liście z offline).

### `ogrod/main.js`

- **Zapis w podglądzie:** stan v3 jako JSON w polu `preview` dokumentu `sowiegry/profil/sowiegry_gry/ogrody` przez `cloud.updateGame` (co 30 s gry z opóźnieniem 1 s, po ważnej akcji — rozdział, ulepszenie, przesadzanie, węzeł drzewka, przeniesienie stanu — po 2 s, przy zejściu do tła i `pagehide` od razu z `flush`); pole `state` (wersja 2) zostaje dla dawnej gry.
- **Start:** `cloud.ready` → `loadGame("ogrody")`; stan z pola `preview`, a gdy go nie ma — `loadGameState` (dawny v2) → `loadState` (migracja); `createGarden({ state, now: Date.now, events: false })` (zdarzenia aktywnej gry wyłączone do E7c2 — bez nich na ekranie nie dałoby się odrzucić telefonu ani przegonić ciężarówki); czas nieobecności od `updatedAt` dokumentu (znacznik serwera; zapas: `savedAt` stanu) → `applyOffline`; przy migracji zapis od razu; okno powitalne.
- **Okna** (`openModal`) dostają treść jako węzeł z HTML gry (`fragment(markup)` — `div` z `innerHTML`; tylko stałe teksty i sformatowane liczby), bo tekst `openModal` wstawia dosłownie.
- **Okno powitalne**: przy migracji „Witaj w nowym ogrodzie!” (rośliny i ulepszenia zostały, zwrot liści i nasion), przy postępie offline „Witaj z powrotem!” („Sowa doglądała ogrodu przez … Urosło: +… liści.”), przycisk „Do ogrodu”.
- **Pętla** (`requestAnimationFrame`, krok ≤ 0,25 s): `garden.update`, zdarzenia, zapis co 30 s, animator sowy („radosc” 0,4 s po stuknięciu i 2 s po rozdziale, inaczej „stoi”), rysowanie; HUD (liście, liście/s, konewka: ładunki, wyłączona bez ładunku, `is-active` przy podlaniu, opis `aria-label`), cel rozdziału („Rozdział N/6: nazwa” i licznik „k/n ✓” albo „ukończony ✓”; lista tylko niewykonanych celów z postępem) i panel co 0,2 s.
- **Stuknięcie:** `pointerdown` na płótnie (także Spacja / Enter z fokusem) → `garden.tap()`, napis „+N” w miejscu palca, cząsteczki.
- **Zdarzenia → komunikaty** (`createToasts`, jeden naraz u góry): rozdział — „Rozdział „…” ukończony! Teraz: …” (nagroda, priorytet 2); kamień milowy — „Monstera: 25 sztuk! Produkcja ×2” (25 i 100) albo „… Nowy wygląd”; ulepszenie — „Kupiono: …”; podlanie — napis „Podlane!” i krople; przesadzanie — „Wielkie Przesadzanie! +N nasion”. `window.SowieNotifications` (jeśli nie ma) — komunikaty Akademii jako zwykłe komunikaty.
- **Wielkie Przesadzanie:** okno z opisem (co wraca do zera, ile nasion, rozdziały zostają) i przyciskami „Jeszcze nie” / „Przesadzaj!” (potem zakładka Prestiż).
- **Powrót z tła:** `visibilitychange` — ukrycie: zapis od razu; powrót: `applyOffline(czas w tle)` i okno „Witaj z powrotem!” (od minuty).
- **Sowia Akademia** (most `SowieProgress`, `shared/meta/progress.js`): po starcie zdarzenie `game:visit` (`ogrodyVisits` +1) i raport, potem co 5 s gry `reportProgress()` → zdarzenie `idle:progress` `{ gameId: "ogrody", lifetimeLeaves (całe), clicks: stats.taps, buys, watering: stats.waterings, prestiges, plants: suma roślin }` → metryki `ogrodyLeaves`, `ogrodyClicks`, `ogrodyBuys`, `ogrodyWatering`, `ogrodyPrestiges`, `ogrodyPlants` (misje dnia i tygodnia, zdjęcia Galerii; Akademia zapisuje tylko zmiany).
- Atlas Sowiego Świata: `ensure(max(64, rozmiar sowy / 1,15) × min(2, DPR))` (rozmiar sowy jak w `render.js`) przy starcie i zmianie rozmiaru.
- `window.SowieOgrody` (testy e2e): `ready()`, `atlasReady()`, `state()` (kopia), `production()`, `tap(n)`, `give(liście)`, `buy(id, ile)`, `upgrade(id)`, `advance(s)` (krok 0,1 s), `offline(s)` (z oknem), `goals()`, `tab(id)`, `plants()`, `save()`.

### Testy (E7a, E7b, E7c1)

`tests/unit/ogrody-zdarzenia.test.mjs` (7, E7c1): telefon (dopiero od Balkonu, ×0,7 do odrzucenia, kolejny po 120–240 s, Tryb samolotowy po 10 s), ciężarówka (od Działki, najbardziej wydajny gatunek nie produkuje, 3 stuknięcia, Kozi kurier — 1), złota kózka (odstępy z Kozim szczęściem, ucieczka po 7 s, każda z 4 premii — także kozi szał: 8 zbiorów/s przez dokładnie 15 s bez licznika stuknięć), Plusk-o-metr i Zatoka Humbaka (napełnianie, start, w trakcie bez kózek i bez Plusk-o-metru, liść = 3 s produkcji × combo, pudło, upadek zeruje combo, koniec po 20 s, Echo humbaka), nieobecność bez kar (offline bez ciężarówki i telefonu), stan (kózka i Zatoka nie przetrwają wczytania, domyślne liczniki), `events: false`.

`tests/unit/ogrody-ekonomia.test.mjs` (11): dane (6 rozdziałów po 3–5 celów, rośliny od tańszych do droższych z rosnącym czasem zwrotu, cele wskazują istniejące rośliny i ulepszenia, drzewko 3 × 3); ceny (suma ciągu, `maxAffordable`, kamienie milowe, etapy wyglądu); produkcja (ulepszenia, kamienie milowe, premie na czas, ciężarówka); silnik (stuknięcia, zakupy ×1 / ×n / max, rozdziały otwierają rośliny i ulepszenia po kolei, zdarzenia rozdziału i kamienia milowego); konewka (ładunki, wydłużanie, odnowienie 60 s, Zraszacz ×3 i 40 s); Wielkie Przesadzanie (warunki, nasiona, reset i to, co zostaje, Arboretum); drzewko prestiżu (wymagania, koszt, limit, Korzenie, Szybki parapet); offline (50%, limit, minuta, konewka, Senni i Głęboki sen); migracja v2 → v3 (rośliny, ulepszenia, zwroty, Plusk-o-metr, rozdziały ze stref, statystyki, `loadState`); liczby i czas po polsku; **symulator** (od E7c1 ze zdarzeniami i losowaniem z ziarnem — `seeded(ziarno)`, generator mulberry32) — bot jak aktywny gracz (2 stuknięcia/s, podlewanie, ulepszenia od najtańszych, rośliny z celów, potem najopłacalniejsze; telefon odrzuca po 2 s, ciężarówkę przegania po 3 s, złotą kózkę łapie w 80% po 1,5 s, Zatokę zaczyna od razu i łapie 70% liści na opadaniu — w Zatoce kroki po 0,1 s; po przesadzaniu nasiona w drzewko): zdarzenia naprawdę zachodzą (kózki: więcej niż 1 na 3 min, Zatoki co 5–10 min, telefony i ciężarówki co kilka minut), rozdziały po kolei (Parapet < 3 min, Balkon < 20 min), pierwsze Wielkie Przesadzanie po 120–180 min (obecnie ok. 143 min; bez zdarzeń było 161), drugi cykl krótszy niż 75% pierwszego, trzeci nie dłuższy niż drugi; spokojniejsza gra (0,5 stuknięcia/s, 40% liści w Zatoce) — wolniej, poniżej 4 h.

`tests/e2e/telefon/ogrody-nowe.spec.js` (5 na każdy profil telefonu): stuknięcia w ogród (16 liści), wizyta i stuknięcia w Sowiej Akademii (`ogrodyVisits`, `ogrodyClicks` = 16), pierwsza Monstera, cel rozdziału „Rozdział 1/6: Parapet”, wyłączone przyciski bez liści, Paproć ukryta przed Balkonem, zakładki Ulepszenia / Prestiż / Kolekcja; ukończenie Parapetu (komunikat, „Rozdział 2/6: Balkon”, Paproć), konewka z zakładki Ulepszenia i podlewanie (3/3 → 2/3, `is-active`); w emulatorze dawny stan v2 w polu `state` → okno „Witaj w nowym ogrodzie!” z pogrubionym zwrotem „1 tys.” (bez dosłownych znaczników), rośliny, ulepszenia, nasiona i stuknięcia przeniesione, zapis w polu `preview` przy niezmienionym `state`, ponowne wejście w nowej karcie bez okna przeniesienia; powrót z tła po 10 minutach (podmieniony `Date.now`) → „Witaj z powrotem!” z czasem „10 min” i przyrostem liści; najmniejszy telefon 320 × 568 — bez przewijania w bok, ogród ≥ 150 px, przycisk „Kup” i zakładka ≥ 44 px. Architektura: `SowieOgrody/nowa.html` na liście stron podglądu (`previewPages`); menu: trzy podglądy, karta Sowich Ogrodów z „Wypróbuj nową wersję: nowe Sowie Ogrody”.

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
