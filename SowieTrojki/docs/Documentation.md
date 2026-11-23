# Sowie Trójki — dokumentacja techniczna

Nowa gra „match-3” z Sówką (Analiza 5: `Analizy/ANALIZA_5_Nowa_gra_Sowie_Trojki_match3.md`). Identyfikator gry:
**`trojki`**, folder `SowieTrojki/`. Zbudowana na Sowim Silniku (`shared/engine/`), Sowim Świecie (`shared/world/`)
i wspólnym interfejsie (`shared/ui/`), bez zewnętrznych bibliotek — moduły ES w przeglądarce.

**Stan: podgląd (etapy M1–M6 z Analizy 5).** Gry nie ma w rejestrze `SowiePlatform.GAME_REGISTRY`, w menu ani na
liście `GAME_IDS` w `shared/sowie-cloud.js`. Skutki (decyzja właściciela „najpierw podgląd, karta w menu po
akceptacji”):

- strona działa pod adresem `SowieTrojki/` (hasło sowy jak w innych grach — `shared/password-gate.js`),
- `SAVE_ENABLED = false`, `PREVIEW = true`: wszystkie 45 poziomów otwarte, postęp tylko w pamięci strony,
  napis „Podgląd gry…” na mapie,
- **bramka zapisu** w `shared/sowie-cloud.js` (`allowedGamePath`, `GAME_PATH`) i tak odrzuca każdy dokument
  `sowiegry/profil/sowiegry_gry/<gra>` spoza `GAME_IDS` — nawet błąd w kodzie gry nie wyśle zapisu, którego nie
  przepuszczą reguły Firestore (jedna odrzucona operacja w `writeBatch` zablokowałaby cały zapis innych gier),
- nowe reguły Firestore do wklejenia przy włączaniu zapisu: Analiza 5, **Załącznik B**. Kolejność włączania:
  właściciel wkleja reguły → „reguły opublikowane” → wpis w `GAME_REGISTRY` i `GAME_IDS`, karta w menu, instrukcja
  w `shared/meta/guides-data.js` pod kluczem `trojki`.

Wspólne ustawienia profilu (głośność, `quips`, `cozy`, `reducedEffects`, `vibration`) i strój Sówki
(`cosmetics.selected`) są czytane z profilu chmury tak jak w innych grach; zmiany ustawień w menu pauzy zapisują
się w profilu (zachowanie wspólne dla wszystkich gier, poza bramką gier).

## Pliki

```text
SowieTrojki/
  index.html       strona: nagłówek, mapa poziomów, ekran gry (pasek, plansza, Sówka), napis dla czytnika ekranu
  style.css        wygląd strony (pion, niski telefon, poziomo / komputer, mapa)
  package.json     { "type": "module" } — pliki .js to moduły ES (także w Node: testy, symulator)
  config.js        stałe gry: rodzaje kafelków, moce, przeszkody, cele, punkty, Radość, prezent, combo, odmiana słów
  board.js         logika planszy (czysta): budowa, ułożenia, ruchy, moce, przeszkody, spadanie, mieszanie
  game.js          przebieg poziomu (czysty): ruchy, cele, punkty, gwiazdki, prezent, Tryb Przytulny, pomoc, finał
  levels.js        3 rozdziały, karty „Nowość”, 45 poziomów, wynik strojenia (TUNING), sprawdzenie poziomu
  bot.js           gracz-symulator (testy i strojenie)
  state.js         stan zapisu: domyślny, wczytanie, łączenie, wynik poziomu, podsumowanie
  tiles.js         katalog grafik gry i rysowanie kafelków, mocy i przeszkód do gotowych obrazków
  render.js        rysowanie planszy na płótnie i animacje kroków (fazy), efekty, drobinki, rysowanie na żądanie
  owl-director.js  reżyser reakcji Sówki (czysty): skala radości, priorytety, dymki, dźwięki
  owl-view.js      rysowanie Sówki na gałęzi, przekształcenia reakcji, drobinki, lot nad planszą
  map.js           mapa poziomów (3 rozdziały × 15 kółek)
  tutorial.js      karty „Nowość” i ręka podpowiedzi
  guide.js         instrukcja „Jak grać?” (7 kart)
  main.js          strona: ekrany, gesty, HUD, Sówka, zapis, pauza, pętla klatek, haki testowe
  docs/            ta dokumentacja i instrukcja gracza (README.md)
scripts/trojki-strojenie.mjs   strojenie ruchów i progów gwiazdek symulatorem (ręcznie, nie w CI)
assets/svg/trojki/             truskawka, storczyk, storczyk-mruga, pioro, jajko, gniazdo
assets/svg/sowa/               nowe oczy Sówki: oczy-gwiazdki, oczy-serduszka, oczy-smutne
tests/unit/trojki-plansza.test.mjs, trojki-gra.test.mjs, trojki-sowka.test.mjs
tests/e2e/telefon/trojki.spec.js
```

Czcionka: **Fredoka 700** (`assets/fonts/fredoka-700.woff2`, wczytywana wstępnie w `<head>`; w CSS
`var(--czcionka-sowia)`, na płótnie `font(px)` z `shared/world/tokens.js` → `700 <px>px "Fredoka", system-ui`).
Kolory: tokeny Sowiego Świata (`COLORS` w `shared/world/tokens.js`, w CSS zmienne z `shared/world/tokens.css`):
`kontur` #3b2f4a, `zloto`, `zlotoCiemne`, `niebieski`, `policzki`, `fiolet`, `monstera`, `monsteraJasna`,
`pomaranczowy`, `serce`, `woda`, `wodaJasna`, `nieboGora`, `pracu`, `amicCzerwony`, `amicZielony`, `rogi`,
`sowa`, `sowaCiemna`, `koza`, `szary`, `szaryCiemny`, `bialy`.

## Parametry adresu

| Parametr                    | Działanie                                                                     |
| --------------------------- | ----------------------------------------------------------------------------- |
| `?poziom=N`                 | po starcie od razu poziom N (bez mapy i karty startu); bez karty „Nowość”     |
| `&nowosc=1`                 | razem z `poziom` — pokaż też karty „Nowość”                                   |
| `?cloud=memory`             | SowieCloud w pamięci karty (bez Firestore) — wspólny parametr wszystkich gier |
| `?cloud=emulator&projekt=…` | emulator Firestore (testy e2e)                                                |
| `?perf=1`                   | licznik płynności w rogu (`shared/engine/perf-meter.js`)                      |

## Model planszy

- Plansza ma zawsze **8 kolumn** (`COLS`) i **8 albo 9 rzędów** (`MAX_ROWS = 9`). Pole o indeksie
  `rząd × 8 + kolumna`, rząd 0 u góry.
- Pole: `{ hole, nest, spawner, item, block }` — `hole` dziura (nic tu nie ma), `nest` gniazdo (tylko dolny rząd),
  `spawner` wylot nowych kafelków, `item` przedmiot albo `null`, `block` przeszkoda `{ type, layers }` albo `null`
  (przeszkoda zajmuje całe pole — nie ma na nim przedmiotu).
- Przedmiot: `{ id, kind, special, dir, egg, tape }`; `id` rośnie (`board.nextId`) i nigdy się nie powtarza
  (animacje śledzą kafelki po `id`). Zwykły kafelek ma `kind`; moc ma `special` (`pioro` z `dir` `"h"`/`"v"`,
  `piskle`, `babel`, `teczowy`) i `kind: null` (nie pasuje do trójek); jajko `egg: true`; `tape: 1` — kafelek
  w taśmie Amic (nie da się go przesunąć, nie spada).
- Losowanie: `createRng(ziarno)` z `shared/engine/rng.js` (xorshift32 z ziarnem tekstowym; `next()`, `pick()`,
  `chance()`, `shuffle()`, `getState()`/`setState()`). Ziarno przebiegu: `trojki:<poziom>:<podejście>` — to samo
  ziarno daje tę samą planszę, te same nowe kafelki i te same decyzje losowe.

## `config.js` — stałe gry

- `GAME_ID = "trojki"`, `SAVE_VERSION = 1`, `COLS = 8`, `MAX_ROWS = 9`.
- `KINDS = ["lisc", "zloty", "humbak", "kozka", "truskawka", "storczyk"]` (kolejność = cyfry `1`–`6` w planszach
  i w `setLayout`). `KIND_INFO` — nazwa, trzy formy do celów (biernik l.p., l.mn. 2–4, dopełniacz 5+), kształt
  tła, kolor tła, obrazek z atlasu:

| Rodzaj      | Nazwa         | Formy                                            | Kształt   | Kolor          | Obrazek            |
| ----------- | ------------- | ------------------------------------------------ | --------- | -------------- | ------------------ |
| `lisc`      | Liść Monstery | Liść Monstery / Liście Monstery / Liści Monstery | `square`  | `zloto`        | `lisc-zielony`     |
| `zloty`     | Złoty liść    | złoty liść / złote liście / złotych liści        | `circle`  | `niebieski`    | `lisc-zloty`       |
| `humbak`    | Humbak        | humbaka / humbaki / humbaków                     | `heart`   | `policzki`     | `trojki-humbak`    |
| `kozka`     | Kózka         | kózkę / kózki / kózek                            | `star`    | `fiolet`       | `trojki-kozka`     |
| `truskawka` | Truskawka     | truskawkę / truskawki / truskawek                | `hexagon` | `monstera`     | `trojki-truskawka` |
| `storczyk`  | Storczyk      | storczyk / storczyki / storczyków                | `diamond` | `pomaranczowy` | `trojki-storczyk`  |

- `SPECIALS = ["pioro", "piskle", "babel", "teczowy"]`; `SPECIAL_INFO`: Pióro 60 pkt, Pisklę 60, Bąbel 120,
  Tęczowy liść 200 (`joy: 5` każda).
- `BLOCKS = ["note", "crate", "canister", "phone"]`; `BLOCK_INFO` (nazwa, formy, `maxLayers`): karteczka Pracu (3),
  skrzynia Amic (3), kanister Amic (1), telefon Pracu (2).
- `GOAL_TYPES = ["score", "collect", "notes", "crates", "phones", "eggs"]`, `GOAL_VERBS`: Zdobądź, Zbierz, Zerwij,
  Rozbij, Wyłącz, Sprowadź; `EGG_FORMS = ["jajko", "jajka", "jajek"]`.
- `POINTS = { tile: 20, layer: 50, egg: 500, finaleMove: 100 }`.
- `JOY = { max: 100, tile: 1, created: 5, fired: 8, combo: 12, helpFeathers: 3 }`.
- `MAX_WAVES = 50` (bezpiecznik kaskad), `SHUFFLE_TRIES = 50`.
- `GIFT = { moves: 3, share: 0.75, cozyMoves: 5 }`.
- `COMBO_WORDS = ["", "", "Ładnie!", "Super!", "Ekstra!", "Sowiście!", "Hu-hu-hura!"]`; `comboWord(n)` — słowo dla
  combo n (6 i więcej → „Hu-hu-hura!”).
- `plural(n, forms)` — `forms[0]` dla 1, `forms[1]` dla końcówek 2–4 (bez 12–14), inaczej `forms[2]`.
- `goalText(goal)`: `score` → „Zdobądź 5 000 punktów” (`Intl.NumberFormat("pl-PL")`), `collect` → „Zbierz 25
  truskawek”, `eggs` → „Sprowadź 2 jajka do gniazda”, `notes`/`crates`/`phones` → „Zerwij 6 karteczek Pracu”,
  „Rozbij 8 skrzyń Amic”, „Wyłącz 2 telefony Pracu”.

## `board.js` — logika planszy

Czysta logika (bez DOM). Każda akcja zwraca **oś czasu kroków** do animacji i statystyki ruchu.

### Budowa

- `BOARD_CHARS` — znaki planszy poziomu: `.` pole, `#` dziura, `K`/`D`/`E` karteczka 1/2/3 warstwy, `S`/`B` skrzynia
  1/2, `C` kanister, `T` telefon (2 warstwy), `t` kafelek w taśmie, `J` jajko, `G` gniazdo, `W` wylot; `1`–`6`
  kafelek ustalonego rodzaju (samouczek).
- `createBoard(level, { seed, rng })` — sprawdza, że każdy rząd ma 8 znaków i zna wszystkie znaki (inaczej wyjątek
  z numerem poziomu); `kinds` — rodzaje poziomu (domyślnie pierwsze 4). Wyloty: gdy plansza nie ma `W`, wylotem
  jest najwyższe pole bez dziury w każdej kolumnie (także gdy stoi na nim przeszkoda — wtedy kolumna dostaje kafelki
  dopiero po jej zniknięciu). Wypełnienie `fillStart`: do 200 prób — każde pole bez dziury i przeszkody dostaje
  jajko (`J`), kafelek ustalony (`1`–`6`) albo kafelek `safeKind` (rodzaj, który nie tworzy trójki z dwoma polami
  z lewej / z góry ani kwadratu z polami z lewej, z góry i po skosie; `t` — w taśmie); próba udana, gdy nie ma
  gotowych ułożeń i jest ruch. Po 200 nieudanych — `shuffle` (mieszanie).
- `cloneBoard(board, rng)` — kopia pól i przedmiotów; bez `rng` kopia generatora w tym samym stanie.
- `setLayout(board, rows)` — ustawia przedmioty według napisów (samouczek, testy): `1`–`6` kafelek, `a`–`f` kafelek
  w taśmie, `h`/`v` Pióro poziome/pionowe, `q` Pisklę, `o` Bąbel, `r` Tęczowy liść, `j` jajko, `-` puste, `.` bez
  zmian; pola z dziurą i przeszkodą pomija; nieznany znak → wyjątek.

### Zapytania

`index`, `rowOf`, `colOf`; `isTile` (kafelek z rodzajem, bez mocy i jajka), `falls` (przedmiot bez taśmy),
`fillable` (pole bez dziury i przeszkody), `swappable` (przedmiot bez taśmy na polu bez przeszkody), `neighbors`
(góra, dół, lewo, prawo), `adjacent(a, b)`, `kindCounts`, `mostCommonKind` (remis — wcześniejszy rodzaj poziomu).

### Ułożenia (`findGroups`)

1. `runsOf` — odcinki ≥ 3 tego samego rodzaju w rzędach i kolumnach (`{ dir, kind, cells }`).
2. `squaresOf` — kwadraty 2 × 2 tego samego rodzaju.
3. Części mające wspólne pole łączą się (union-find) w jedno ułożenie (L, T, +, kwadrat z odcinkiem).
4. Moc ułożenia — pierwszeństwo: najdłuższa linia ≥ 5 → `teczowy`; linie w obu kierunkach i ≥ 5 pól → `babel`;
   najdłuższa linia = 4 → `pioro` z `dir` tej linii; jest kwadrat → `piskle`; inaczej zwykłe.
   Wynik: `[{ kind, cells (rosnąco), special, dir }]`.

`matchAt(board, cell)` — szybkie sprawdzenie, czy pole jest w odcinku ≥ 3 albo w kwadracie (lista ruchów).

### Ruchy

- `listMoves(board)` — dla każdego przesuwalnego pola: stuknięcie w moc (`{ type: "tap", a }`) i zamiana z prawym
  i dolnym sąsiadem (`{ type: "swap", a, b }`), gdy jest moc albo po próbnej zamianie `matchAt` jednego z pól.
- `trySwap(board, a, b, { goals })` → `{ valid, steps, stats }`:
  - pola nie sąsiadują albo któregoś nie da się przesunąć → `valid: false`, krok `blocked`;
  - **dwie moce** → obie znikają, `resolve` z połączeniem (`combo`) w polu `b` (tam, gdzie gracz przesunął);
  - **moc + kafelek** → zamiana, moc odpala się w nowym polu; Tęczowy liść bierze rodzaj kafelka (albo
    najliczniejszy, gdy to jajko);
  - **bez ułożenia** → plansza bez zmian, kroki `swap` i `swapBack`, `valid: false`;
  - inaczej `resolve` (pole „przesunięte” = `b`, potem `a` — tam powstaje moc).
- `tapSpecial(board, at)` — stuknięcie w moc (nie w taśmie); Tęczowy liść bierze najliczniejszy rodzaj.
- `dropPowers(board, fires, { goals, scoreAsPower })` — odpalenie mocy spoza planszy (Sowia pomoc, finał).

### Rozstrzyganie (`resolve`)

Fale (najwyżej `MAX_WAVES`), w każdej: (1) kolejka mocy (`fireAt`; moce trafione po drodze dochodzą do kolejki —
reakcja łańcuchowa w tej samej fali, każda zwiększa `combo`), (2) `findGroups` → `clearGroups` (`combo += 1`),
(3) jeśli coś zniknęło — `gravityAndEggs`; fala bez zmian kończy pętlę. Po pętli: `spreadPhone` (telefon) i — gdy
nie ma ruchu — `shuffle` (`stats.shuffled = true`). Statystyki ruchu (`emptyStats`): `waves`, `combo`, `cleared`
(rodzaj → liczba), `clearedByMatch`, `clearedByPower`, `created` (lista mocy), `fired`, `comboSwap` (np.
`"babel+pioro"`), `layers` i `removed` (typ przeszkody → liczba), `eggs`, `tapes`, `score`, `phoneSpread`,
`shuffled`, `hitNoteOrPhone`, `guard` (bezpiecznik zadziałał).

- **Zbicie ułożenia** (`clearGroups`): każdy kafelek znika (`clear`, 20 pkt × numer fali; przy `scoreAsPower`
  20 pkt), kafelek w taśmie traci tylko taśmę (`tape`); każda przeszkoda sąsiadująca z ułożeniem traci jedną warstwę
  (najwyżej raz na ułożenie; kanister — nie, tylko moce). Moc ułożenia powstaje w polu przesuniętym (jeśli należy do
  ułożenia i jest puste), inaczej w polu najbliżej środka ułożenia (`centerOf`: najmniejsza odległość od średniej,
  remis — niżej, potem bardziej w lewo); punkty za powstanie mocy z `SPECIAL_INFO`. Krok `create`.
- **Przeszkoda** (`damageBlock`): −1 warstwa, 50 pkt, `hitNoteOrPhone` dla karteczki i telefonu; 0 warstw →
  przeszkoda znika (`removed`). Krok `damage { at, block, layers, removed }`.
- **Moce** (`fireAt` + `areaOf`): Pióro — cały rząd (`h`) albo kolumna (`v`); Bąbel — kwadrat 5 × 5 (promień 2);
  Pisklę — swoje pole i 4 sąsiednie, potem lot do celu (`targetsOf`) i tam znowu pole + 4 sąsiednie; Tęczowy liść —
  wszystkie kafelki rodzaju. Każde pole najwyżej raz na odpalenie: przeszkoda traci warstwę (także kanister), moc
  na polu odpala się dalej, kafelek w taśmie traci taśmę, zwykły kafelek znika (20 pkt). Krok `fire { at, special,
dir, cells, kind | targets, carry, wave }`.
- **Połączenia dwóch mocy** (`comboFires`, krok `combo`):

| Połączenie             | Odpalenie                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Tęczowy + Tęczowy      | `all` — każde pole planszy                                                                                                      |
| Tęczowy + X            | wszystkie kafelki najliczniejszego rodzaju stają się mocą X (Pióro w losowym kierunku) i odpalają się (kroki `create` z `from`) |
| Pióro + Pióro          | `cross` — rząd i kolumna                                                                                                        |
| Bąbel + Pióro          | `bigCross` — 3 rzędy i 3 kolumny                                                                                                |
| Bąbel + Bąbel          | `bigBubble` — kwadrat 7 × 7                                                                                                     |
| Pisklę + Pisklę        | `owlets` — trzy pisklęta do trzech celów                                                                                        |
| Pisklę + Pióro / Bąbel | pisklę zanosi drugą moc (`carry`) do celu i tam ją odpala                                                                       |

- **Cel Pisklęcia** (`targetsOf(board, goals, skip)`): punkty pól — przeszkoda z celu 60 + warstwy, telefon 30,
  inna przeszkoda 20; kafelek rodzaju z celu 30, inny 5, +10 za taśmę, +50 pod jajkiem (gdy cel „jajka”); moce
  i jajka pomijane; + losowy ułamek (remisy); od najlepszego.
- **Spadanie** (`applyGravity`): w krokach (każdy przedmiot najwyżej o jedno pole na krok, do `rows × 4 + 8`
  kroków), od dołu planszy: puste pole bierze przedmiot z pola nad sobą; pusty wylot dostaje nowy kafelek
  (`rng.pick(kinds)`, droga zaczyna się od pola „nad planszą” `−(kolumna + 1)`); pole bez dopływu z góry
  (`feedsFromAbove` — nad nim dziura, przeszkoda albo kafelek w taśmie) bierze ukosem przedmiot z lewego, potem
  prawego górnego sąsiada, gdy ten nie ma dokąd spaść w dół; pole z dopływem bierze ukosem tylko przedmiot
  „uwięziony” (pod nim dziura, przeszkoda albo taśma — np. jajko nad dziurą). Wynik: `{ moves: [{ item, path,
spawned }] }` — droga pole po polu do płynnej animacji. Krok `fall`.
- **Jajka** (`gravityAndEggs`): po spadaniu jajko na gnieździe wykluwa się (`hatch`, 500 pkt, `eggs += 1`), znowu
  spadanie (do 10 rund).
- **Telefon Pracu** (`spreadPhone`): gdy w ruchu nie trafiono karteczki ani telefonu, jeden losowy telefon zamienia
  sąsiedni zwykły kafelek (bez taśmy) w karteczkę z 1 warstwą. Krok `phone { from, at, item }`.
- **Mieszanie** (`shuffle`): ruchome zwykłe kafelki (bez taśmy) zamieniają się miejscami (`rng.shuffle`) do
  `SHUFFLE_TRIES` prób, aż nie ma ułożeń i jest ruch; potem do 50 prób z nowymi rodzajami (`safeKind`). Krok
  `shuffle { moves: [{ item, from, to }] }`.
- **Sprawdzenie** (testy): `reachableCells` — pola osiągalne dla nowych kafelków (od wylotów w dół i ukosem w dół),
  `checkInvariants` — osiągalne pola mają przedmiot, dziury są puste, warstwy 1–3, brak gotowych ułożeń, jest ruch;
  `boardToText` — plansza jako napisy (`1`–`6`, moce `P`/`Q`/`O`/`R`, `J`, `K`/`S`/`C`/`T`, `#`, spacja).

## `game.js` — przebieg poziomu

- `starsFor(score, stars)` — wygrana = 1 gwiazdka, +1 za `score ≥ stars[1]`, +1 za `score ≥ stars[2]`.
- `goalHints(goals)` — co zostało do zrobienia: `{ kinds: Set, blocks: Set, eggs: bool }`.
- `scoreMoves(board, hints)` — szybka ocena ruchów bez kaskad (podpowiedź i symulator): zamiana z mocą / stuknięcie
  — suma wartości mocy × 2 (`SPECIAL_VALUE`: Pióro 6, Pisklę 5, Bąbel 9, Tęczowy 12), +14 za dwie moce, −3 za
  stuknięcie; zwykła zamiana — liczba pól ułożeń + 2 × pola rodzaju z celu + wartość powstającej mocy + przeszkody
  obok (z celu 4, inne 1, kanister 0) + 0,05 × rząd (niżej = częściej kaskady). Od najlepszego.
- `createLevelRun(level, { attempt, cozy, seed })` — przebieg jednego podejścia. `cozy` to wartość albo funkcja
  (przełącznik w pauzie działa od razu). Stan `state`: `levelId`, `moves`, `movesUsed`, `score`, `goals`
  (z `done`), `joy`, `phase` (`play` → `finale` → `won` albo `lost`), `giftUsed`, `cozyAdded`, `lowMovesShown`,
  `halfShown`, `stars`, `stats` (`matches`, `bestCombo`, `created` po mocach, `fired`, `comboSwaps`, `eggs`,
  `helps`, `shuffles`, `invalid`).
  - `apply(result)` — punkty, cele (`collect` += zbite kafelki rodzaju, `notes`/`crates`/`phones` += usunięte
    przeszkody, `eggs` += wyklute, `score` = wynik; `done` najwyżej `count`), Radość: zbite kafelki × 1 + powstałe
    moce × 5 + odpalone × 8 + 12 za połączenie mocy (do 100; Sowia pomoc nie dodaje Radości), statystyki. Zdarzenie
    `move`/`help { combo, cleared, created, fired, comboSwap, goalsDone, eggs, shuffled, phone, score, joyFull }`.
  - `afterMove` — kolejno: wszystkie cele → `phase = "finale"` i zdarzenie `win`; zostały 3 ruchy (pierwszy raz)
    → `lowMoves`; postęp ≥ 50% (pierwszy raz) → `half`; ruchy > 0 → koniec; ruchy = 0: prezent (raz, postęp ≥ 75%)
    +3 ruchy i `gift`, albo Tryb Przytulny +5 ruchów i `cozy`, albo `phase = "lost"` i `lose`. Postęp = średnia
    z `min(1, done / count)` celów.
  - Akcje: `swap(a, b)`, `tap(a)` (zła zamiana → zdarzenie `invalid`, `stats.invalid += 1`, ruch nie przepada;
    dobra → ruch −1), `canSwap(cell)`, `help()` (tylko przy pełnej Radości: Radość = 0, 3 Pióra w polach
    z `targetsOf`, kierunek każdego — `featherAt`: rząd albo kolumna z większą liczbą pól przydatnych dla celu;
    ruch nie przepada; po pomocy może być wygrana), `finale()` (każdy pozostały ruch → Pióro w losowym polu
    z przedmiotem, losowy kierunek, punkty jak z mocy + 100; potem `phase = "won"`, gwiazdki; kroki `finaleMove
{ left }` przed odpaleniem), `hint()` (najlepszy ruch `scoreMoves`), `specialPoints(moc)`.

## `levels.js` — poziomy

- `CHAPTERS`: `laka` „Sowia Łąka” 1–15, `ogrodek` „Ogródek Sówki” 16–30, `staw` „Staw Humbaka” 31–45.
- `INTROS` — karty „Nowość” (`title`, `text`): `zamiana`, `pioro`, `combo`, `karteczka`, `babel`, `piskle`,
  `skrzynia`, `jajko`, `teczowy`, `tasma`, `kanister`, `telefon`. Poziom ma `intro` — klucz albo listę kluczy
  (poziom 10: `["jajko", "teczowy"]`). Kolejność: 1 zamiana, 2 Pióro, 3 combo, 4 karteczka, 5 Bąbel, 7 Pisklę,
  8 skrzynia, 10 jajko i Tęczowy liść, 13 taśma, 19 kanister, 25 telefon.
- Zestawy rodzajów: `FOUR` (lisc, zloty, humbak, truskawka), `FIVE` (+ kozka), `FIVE_B` (FOUR + storczyk),
  `FIVE_C` (lisc, zloty, kozka, truskawka, storczyk), `SIX` (wszystkie). Plansze otwarte `OPEN8` (8 × 8 kropek),
  `OPEN9` (8 × 9).
- `LEVEL_LIST` — 45 poziomów `{ id, moves, kinds, difficulty ("latwy" | "sredni" | "trudny"), intro?, goals,
board }`. `TUNING` — wynik strojenia `[ruchy, próg ★★, próg ★★★]` dla każdego poziomu (zastępuje `moves` z listy).
  `LEVELS` = lista z rozdziałem, ruchami ze strojenia i `stars: [0, ★★, ★★★]` (zamrożone obiekty).
  „Piła” trudności: po poziomie trudniejszym zawsze łatwy; w każdej piątce ≥ 2 łatwe i ≤ 1 trudny.
- `levelById(id)`.
- `validateLevel(level)` → lista problemów: 8–9 rzędów po 8 pól, 1–3 cele, 4–6 rodzajów, ruchy 8–40, znany typ
  celu, rodzaj celu na planszy, liczby celów > 0; karteczek / skrzyń / telefonów / jajek na planszy ≥ cel; jajka
  wymagają gniazd w dolnym rzędzie, gniazda tylko w dolnym rzędzie; ≤ 4 rodzaje elementów (cele przeszkód i jajek,
  kanister, taśma); ★★ < ★★★; plansza startowa (ziarno `sprawdzenie:<id>`) bez ułożeń i z ruchem.

Wszystkie poziomy (rodzaje jako cyfry `KINDS`; ruchy: wartość z `LEVEL_LIST` → wartość ze strojenia):

| Poz. | Rozdział | Trudność | Nowość    | Rodzaje | Cele                                                                             | Ruchy (lista → strojenie) | ★★ od | ★★★ od |
| ---- | -------- | -------- | --------- | ------- | -------------------------------------------------------------------------------- | ------------------------- | ----- | ------ |
| 1    | laka     | latwy    | zamiana   | 1235    | Zbierz 25 Liści Monstery                                                         | 20 → 8                    | 7300  | 11900  |
| 2    | laka     | latwy    | pioro     | 1235    | Zdobądź 5000 punktów                                                             | 18 → 8                    | 9600  | 11200  |
| 3    | laka     | latwy    | combo     | 1235    | Zbierz 25 truskawek; Zbierz 25 złotych liści                                     | 20 → 8                    | 8800  | 11400  |
| 4    | laka     | latwy    | karteczka | 1235    | Zerwij 6 karteczek Pracu                                                         | 20 → 8                    | 6600  | 8900   |
| 5    | laka     | sredni   | babel     | 12345   | Zbierz 35 humbaków                                                               | 22 → 13                   | 8300  | 10400  |
| 6    | laka     | sredni   | —         | 12345   | Zerwij 10 karteczek Pracu                                                        | 22 → 9                    | 5100  | 6300   |
| 7    | laka     | latwy    | piskle    | 12345   | Zbierz 30 kózek; Zerwij 6 karteczek Pracu                                        | 20 → 17                   | 9700  | 12200  |
| 8    | laka     | sredni   | skrzynia  | 12345   | Rozbij 8 skrzyń Amic                                                             | 22 → 9                    | 5300  | 7200   |
| 9    | laka     | latwy    | —         | 12356   | Zbierz 45 storczyków                                                             | 20 → 16                   | 9400  | 11700  |
| 10   | laka     | sredni   | jajko     | 12345   | Sprowadź 2 jajka do gniazda                                                      | 25 → 13                   | 7500  | 9100   |
| 11   | laka     | sredni   | —         | 12345   | Zerwij 12 karteczek Pracu; Rozbij 4 skrzynie Amic                                | 24 → 10                   | 5700  | 7800   |
| 12   | laka     | latwy    | —         | 12345   | Zbierz 50 Liści Monstery                                                         | 20 → 21                   | 12000 | 14200  |
| 13   | laka     | latwy    | tasma     | 12345   | Zbierz 35 złotych liści                                                          | 22 → 15                   | 7500  | 10000  |
| 14   | laka     | sredni   | —         | 12345   | Sprowadź 3 jajka do gniazda; Zerwij 6 karteczek Pracu                            | 26 → 15                   | 10800 | 13400  |
| 15   | laka     | trudny   | —         | 12345   | Zerwij 12 karteczek Pracu; Sprowadź 2 jajka do gniazda                           | 28 → 14                   | 8800  | 12400  |
| 16   | ogrodek  | latwy    | —         | 12356   | Zbierz 40 truskawek; Zbierz 35 storczyków                                        | 22 → 15                   | 9800  | 12200  |
| 17   | ogrodek  | sredni   | —         | 12345   | Rozbij 8 skrzyń Amic                                                             | 24 → 8                    | 4700  | 6200   |
| 18   | ogrodek  | latwy    | —         | 12356   | Sprowadź 3 jajka do gniazda                                                      | 24 → 23                   | 12500 | 15600  |
| 19   | ogrodek  | sredni   | kanister  | 12345   | Zbierz 45 humbaków                                                               | 24 → 14                   | 9500  | 13400  |
| 20   | ogrodek  | trudny   | —         | 12345   | Zerwij 14 karteczek Pracu; Zbierz 30 kózek                                       | 24 → 10                   | 7300  | 9400   |
| 21   | ogrodek  | latwy    | —         | 123456  | Zbierz 35 Liści Monstery; Zbierz 35 złotych liści                                | 24 → 26                   | 10300 | 13400  |
| 22   | ogrodek  | sredni   | —         | 12356   | Sprowadź 3 jajka do gniazda; Rozbij 6 skrzyń Amic                                | 26 → 11                   | 8100  | 11200  |
| 23   | ogrodek  | sredni   | —         | 12345   | Zerwij 12 karteczek Pracu                                                        | 26 → 11                   | 6600  | 9100   |
| 24   | ogrodek  | latwy    | —         | 12356   | Zbierz 50 storczyków                                                             | 22 → 21                   | 12200 | 14600  |
| 25   | ogrodek  | sredni   | telefon   | 12345   | Wyłącz 2 telefony Pracu; Zerwij 6 karteczek Pracu                                | 26 → 8                    | 4900  | 7000   |
| 26   | ogrodek  | sredni   | —         | 12456   | Rozbij 12 skrzyń Amic; Sprowadź 2 jajka do gniazda                               | 28 → 14                   | 9800  | 11800  |
| 27   | ogrodek  | latwy    | —         | 12356   | Zbierz 50 truskawek; Zbierz 35 humbaków                                          | 24 → 18                   | 11600 | 13600  |
| 28   | ogrodek  | latwy    | —         | 12345   | Wyłącz 3 telefony Pracu                                                          | 28 → 9                    | 5500  | 7400   |
| 29   | ogrodek  | sredni   | —         | 12456   | Zerwij 12 karteczek Pracu; Zbierz 35 kózek                                       | 26 → 13                   | 8300  | 10700  |
| 30   | ogrodek  | trudny   | —         | 12345   | Sprowadź 4 jajka do gniazda; Wyłącz 2 telefony Pracu                             | 30 → 9                    | 8800  | 10500  |
| 31   | staw     | latwy    | —         | 12345   | Zbierz 60 humbaków                                                               | 24 → 21                   | 13900 | 17500  |
| 32   | staw     | sredni   | —         | 12356   | Rozbij 14 skrzyń Amic                                                            | 28 → 11                   | 7500  | 9900   |
| 33   | staw     | sredni   | —         | 12345   | Zerwij 16 karteczek Pracu; Sprowadź 2 jajka do gniazda                           | 28 → 13                   | 8400  | 10600  |
| 34   | staw     | trudny   | —         | 123456  | Zbierz 40 złotych liści; Zbierz 40 kózek                                         | 26 → 21                   | 9500  | 11700  |
| 35   | staw     | latwy    | —         | 12456   | Wyłącz 3 telefony Pracu; Rozbij 4 skrzynie Amic                                  | 28 → 11                   | 6600  | 8700   |
| 36   | staw     | latwy    | —         | 12356   | Sprowadź 4 jajka do gniazda                                                      | 28 → 28                   | 16700 | 19200  |
| 37   | staw     | sredni   | —         | 12345   | Zerwij 18 karteczek Pracu                                                        | 30 → 15                   | 9800  | 11900  |
| 38   | staw     | sredni   | —         | 123456  | Zbierz 50 storczyków                                                             | 24 → 27                   | 11900 | 14200  |
| 39   | staw     | trudny   | —         | 12456   | Rozbij 16 skrzyń Amic; Wyłącz 2 telefony Pracu                                   | 30 → 8                    | 5700  | 8000   |
| 40   | staw     | latwy    | —         | 12345   | Sprowadź 3 jajka do gniazda; Zerwij 12 karteczek Pracu; Zbierz 35 Liści Monstery | 30 → 19                   | 12000 | 15200  |
| 41   | staw     | latwy    | —         | 12345   | Zbierz 70 Liści Monstery                                                         | 24 → 22                   | 15800 | 18700  |
| 42   | staw     | sredni   | —         | 12356   | Zbierz 50 złotych liści; Rozbij 6 skrzyń Amic                                    | 28 → 14                   | 10300 | 12000  |
| 43   | staw     | latwy    | —         | 12345   | Wyłącz 4 telefony Pracu                                                          | 30 → 11                   | 6000  | 7900   |
| 44   | staw     | sredni   | —         | 12456   | Sprowadź 4 jajka do gniazda; Rozbij 10 skrzyń Amic                               | 32 → 14                   | 10700 | 13300  |
| 45   | staw     | trudny   | —         | 12345   | Zerwij 12 karteczek Pracu; Sprowadź 3 jajka do gniazda; Wyłącz 2 telefony Pracu  | 34 → 15                   | 11700 | 14400  |

```text
 1: ........ ........ ........ ........ ........ ........ ........ ........
 2: ........ ........ ........ ........ ........ ....1... ..11.1.. ........
 3: ........ ........ ........ ........ ........ ........ ........ ........
 4: ........ ........ ...KK... ..K..K.. ..K..K.. ........ ........ ........
 5: ........ ........ ........ ........ ...3.... ...3.... .33..... ........
 6: ........ K......K .D....D. ..K..K.. ...DD... ..K..K.. ........ ........
 7: ........ ........ K.K..K.K ........ ...44... ...4.... ..K..K.. ........
 8: ........ ........ ........ BS....SB ........ ........ BS....SB ........
 9: ........ ........ ........ ........ ........ ........ ........ ........
10: ..J..J.. ........ ........ ........ ........ ........ ........ GGGGGGGG
11: ........ KK....KK K..BB..K ...BB... K......K KK....KK ........ ........
12: ........ ........ ........ ........ ........ ........ ........ ........
13: ........ ........ .t....t. ..t..t.. ...tt... ..t..t.. .t....t. ........
14: .J..J..J ........ K......K .K....K. ..K..K.. ........ ........ GGGGGGGG
15: ..J..J.. ........ DD....DD D......D ........ D......D DD....DD GGGGGGGG
16: #......# ........ ........ ........ ........ ........ ........ ........ #......#
17: ........ ........ ..BSSB.. ........ ........ ..BSSB.. ........ ........ ........
18: J..J..J. ........ ........ ...##... ...##... ........ ........ ........ GGGGGGGG
19: ........ ........ ........ ..C..C.. ........ ........ ..C..C.. ........ ........
20: ........ K.K..K.K .K.KK.K. ........ ........ .K.KK.K. K.K..K.K ........ ........
21: ........ ........ ........ ........ ........ ........ ........ ........ ........
22: J...J..J ........ ........ S.S..S.S ........ .S....S. ........ ........ GGGGGGGG
23: ........ ........ DDD..DDD ........ ........ DDD..DDD ........ ........ ........
24: ##....## #......# ........ ........ ........ ........ ........ #......# ##....##
25: ........ ........ ..K..K.. .KT..TK. ..K..K.. ........ ........ ........ ........
26: ..J..J.. ........ BB....BB S......S ........ S......S BB....BB ........ GGGGGGGG
27: ........ ........ ........ ........ ........ ........ ........ ........ ........
28: ........ ........ ...T.... ........ ......T. ........ .T...... ........ ........
29: ........ C......C KK.KK.KK ........ ...CC... ........ KK.KK.KK C......C ........
30: J.J..J.J ........ ........ ..T..T.. ........ ........ ........ ........ GGGGGGGG
31: ........ ........ ........ ........ ........ ........ ........ ........ ........
32: ........ B.B..B.B ........ .B.BB.B. ........ B.B..B.B ........ ...BB... ........
33: ...JJ... ........ KKK..KKK K......K ........ K......K KKK..KKK ........ GGGGGGGG
34: ........ ........ ........ ........ ........ ........ ........ ........ ........
35: ........ ........ .T..B... ....B.T. ........ ..B..... .B...T.. ........ ........
36: J.J..J.J ........ ...##... ........ #......# ........ ...##... ........ GGGGGGGG
37: ........ EEE..EEE ........ ........ DD.DD.DD ........ ........ KKK..KKK ........
38: ........ ........ ........ ........ ........ ........ ........ ........ ........
39: ........ SBBS.SBS ........ ..T..T.. ........ SBS.SBBS ........ SSSS.SSS ........
40: J..J..J. ........ KK.KK.KK ........ ........ KK.KK.KK ........ ........ GGGGGGGG
41: ........ ........ ........ ........ ........ ........ ........ ........ ........
42: ........ t.t..t.t .S....S. ..t..t.. S......S ..t..t.. .S....S. t.t..t.t ........
43: ........ .T....T. ........ ........ ...##... ........ ........ .T....T. ........
44: J.J..J.J ........ S.S..S.S ........ .B....B. ........ S.S..S.S ........ GGGGGGGG
45: J..J..J. ........ DDD..DDD ..T..T.. ........ DD....DD D......D ........ GGGGGGGG
```

## `bot.js` i strojenie

- `playLevel(level, { attempt, cozy, skill })` — gra jak „rozsądny gracz”: przy pełnej Radości od razu `help()`,
  potem ruch z `scoreMoves` — z prawdopodobieństwem `skill` najlepszy, inaczej jeden z trzech najlepszych (losowanie
  `bot:<poziom>:<podejście>`); do 400 kroków; na końcu `finale()`. → `{ won, score, stars, movesLeft, movesUsed,
shuffles, gift, guard }`.
- `simulate(level, { attempts, skill, offset })` → `{ winRate, scores, avgShuffles, avgMovesLeft, gifts }`.
- `scripts/trojki-strojenie.mjs [podejścia=60] [poziomy]`: `SKILL = 0.5`; (1) symulator bez limitu (80 ruchów),
  podejścia 1001… — ile ruchów potrzeba; (2) ruchy = percentyl według trudności (`latwy` 0,97, `sredni` 0,85,
  `trudny` 0,65), najmniej 8; (3) gra z tą liczbą ruchów (podejścia 2001…): ★★ = mediana wyników wygranych, ★★★ = 85. percentyl (zaokrąglone do 100, ★★★ ≥ ★★ + 100). Drukuje tabelę i gotowe `TUNING` do wklejenia.

## `state.js` — stan zapisu

Format (wersja 1):

```js
{
  version: 1,
  unlocked: 1,                 // najwyższy otwarty poziom
  levels: { "1": { stars, best, wins, tries } },
  stats: { plays, wins, matches, specials: { pioro, piskle, babel, teczowy }, bestCombo, owlets, helps },
  tutorial: { done, seen: ["zamiana", …] },   // obejrzane karty „Nowość”
  attempt: 0,                  // licznik podejść (ziarno losowania)
  savedAt: 0,
}
```

- `defaultState()`, `loadState(obiekt | JSON)` — złe dane → stan domyślny; liczby całkowite ≥ 0, gwiazdki ≤ 3,
  `unlocked ≥ 1`, tylko liczbowe klucze poziomów, `seen` bez powtórzeń i nie-napisów; **nieznane pola zostają**
  (zgodność z przyszłymi wersjami).
- `mergeStates(a, b)` — drugi telefon: na każdym poziomie większe gwiazdki, wynik, wygrane i próby; większe
  `unlocked`, liczniki i `attempt`/`savedAt`; suma obejrzanych kart; pola spoza formatu z obu (przewaga `a`).
- `recordResult(state, id, { won, stars, score, stats, totalLevels })` — próba +1; wygrana: wygrane +1, gwiazdki
  i wynik bez cofania, `unlocked` do `id + 1` (najwyżej 45); statystyki ze `stats` przebiegu.
- `summaryOf(state)` → `{ level (najwyższy wygrany), stars (suma), three (poziomy z 3 gwiazdkami), bestCombo,
owlets }` — do karty gry i „Rekordów” po włączeniu do menu.

W podglądzie stan żyje tylko w pamięci strony (`progressState` w `main.js`); `save()` i `loadProgress()` wracają od
razu, gdy `SAVE_ENABLED` jest fałszem. Po włączeniu: `cloud.saveGameState("trojki", stan, { immediate: true,
saveVersion: 1, summary })` i `cloud.loadGameState("trojki")`.

## `tiles.js` — wygląd kafelków

- `TROJKI_SPRITES` — katalog atlasu gry: ze wspólnego `SPRITES` wszystkie `sowa-*` i `garderoba-*` oraz
  `babelek`, `lisc-zielony`, `lisc-zloty`, `lisc-teczowy`, `amic-kanister`, `pracu-telefon`, `humbak`, `plusk`;
  własne (pudełko 128 × 128, rozmiar 1 × 1, kotwica środek): `trojki-truskawka`, `trojki-storczyk`,
  `trojki-storczyk-mruga`, `trojki-pioro`, `trojki-jajko`, `trojki-gniazdo`, `trojki-kozka` (`kozki/koza.svg`),
  `trojki-humbak` (`humbak/humbak.svg`, pudełko 256 × 128, rozmiar 2 × 1); nowe pozy Sówki (`owlLayers` z
  `shared/world/owl.js`): `sowa-zachwyt` (poza radości, `oczy-gwiazdki`), `sowa-serduszka` (radość,
  `oczy-serduszka`), `sowa-smutek` (`body: 3`, `wings: -16`, `oczy-smutne`, bez źrenic), `sowa-macha` (poza skoku,
  `oczy-radosc`, bez źrenic).
- `rounded(ctx, x, y, w, h, r)` — zaokrąglony prostokąt przez `arcTo` (bez `roundRect` — starsze Safari).
- `lighten(hex, share)` — mieszanie z bielą → `rgb(...)`.
- `shapePath(ctx, shape, cx, cy, r)` — kształty tła: `circle` (promień 0,94 r), `square` (bok 1,72 r, narożnik
  0,3 r), `heart` (4 krzywe Béziera, czubek 0,9 r w dół), `star` (10 wierzchołków, 1,02 r / 0,56 r, przesunięta
  0,06 r w dół), `hexagon` (0,98 r, wierzchołek u góry), `diamond` (pion 1,02 r, poziom 0,92 r).
- `ICON_WIDTH` — szerokość obrazka względem pola: lisc 0,6, zloty 0,6, humbak 0,78, kozka 0,64, truskawka 0,6,
  storczyk 0,68.
- `createTilePainter({ atlas })` — każdy wygląd rysowany raz do osobnego płótna `rozmiar pola × ostrość`
  (pamięć `Map` po kluczu `rodzaj|rozmiar|ostrość`; obrazka narysowanego przed wczytaniem atlasu nie zapamiętuje):
  - `tile(kind, size, ratio, { blink })` — tło: cień kształtu (`rgba(59,47,74,0.18)`, 4,5% w dół), kształt
    `r = 0,43 × pole` z gradientem pionowym (kolor rozjaśniony o 45% → kolor), kontur `kontur` grubości
    max(1,5, 5,5% pola), błysk (biała elipsa 45% krycia w lewym górnym rogu, przycięta do kształtu); obrazek
    rodzaju na środku (+2% w dół); mrugający storczyk — `trojki-storczyk-mruga`.
  - `special(item)` — „bańka”: koło `r = 0,42 × pole` z gradientem promienistym (biel → `wodaJasna`), obwódka
    złota (Tęczowy liść — 6 łuków w kolorach serce, pomarańczowy, złoto, monstera, niebieski, fiolet) grubości
    max(2, 7,5% pola), cienki kontur, iskierka w prawym górnym rogu; w środku: Pióro (0,62 pola, pionowe obrócone
    o −90°, dwie strzałki kierunku), Pisklę (`drawOwl`, 0,6 pola), Bąbel (`babelek`, 0,56), Tęczowy (`lisc-teczowy`,
    0,62).
  - `block(type, layers)` — karteczka (żółta, lekko obrócona o −0,06 rad, kolor wg warstw #fff1a8 / #ffe680 /
    #ffd84d, pasek u góry #f5c842, 3 linie tekstu, czerwone kółko „P”), skrzynia (`rogi`, przy 2+ warstwach `sowa`;
    2 deski, pas Amic biały-czerwony-zielony), kanister (`amic-kanister`, 0,82 pola), telefon (różowe tło
    `policzki` rozjaśnione o 40%, obwódka `pracu`, `pracu-telefon` 0,78 pola); znaczek z liczbą warstw w prawym
    dolnym rogu (białe kółko z konturem; dla karteczki i skrzyni od 2 warstw, dla telefonu zawsze).
  - `egg` (cień + `trojki-jajko` 0,74 pola), `nest` (`trojki-gniazdo` 0,96 pola, nisko), `tape` (dwa skrzyżowane
    biało-czerwone pasy pod kątem ±45°, długość 1,06 pola, szerokość 0,17 pola).
  - `clear()`, `count()`.

## `render.js` — plansza na płótnie

- `TIMING` (sekundy): `swap` 0,16, `burst` 0,24, `fire` 0,32, `fallStep` 0,07 (na pole), `fallMin` 0,12, `hatch`
  0,5, `phone` 0,4, `shuffle` 0,5, `combo` 0,24, `finale` 0,32, `pause` 0,06.
- `createBoardRenderer({ canvas, atlas, getDpr, particleScale, reducedMotion })` — renderer ma własny „obraz
  planszy” (`tiles`: `id` → `{ id, kind, special, dir, egg, tape, x, y, cell, scale, alpha, rotation, squash,
grow, leaving, landed, justSwapped }`, `blocks`, `holes`, `nests`), bo logika rozstrzyga ruch od razu, a obraz
  odtwarza kroki po kolei.
- **Rozmiar** (`resize`): płótno = rozmiar elementu × ostrość (`getDpr()` z automatu płynności); pole
  `cell = floor(min(szerokość / 8, wysokość / rzędy))` (≥ 8); plansza wyśrodkowana w poziomie
  (`x0`), w pionie najwyżej 10 px od góry (`y0 = min((wysokość − plansza) / 2, 10)`).
- **Tło** (`backgroundLayer`) w osobnym płótnie, przerysowywane tylko przy zmianie rozmiaru, ostrości, poziomu
  albo gotowości atlasu: pod każdym polem bez dziury cień i biały zaokrąglony kafel (margines max(2, 8% pola),
  narożnik 28%), pola w szachownicę (`monsteraJasna` rozjaśniona o 55% / `nieboGora` o 35%), gniazda.
- **Fazy** (`play(steps, { onDone })` zamienia kroki na kolejkę faz, `advance(dt)` je odtwarza):
  `swap`/`swapBack` — przesunięcie dwóch kafelków (ease-out); `blocked` — potrząśnięcie (0,18 s); `combo` —
  błysk w polu połączenia, potem znikają obie moce; kroki `clear`/`create`/`fire`/`damage`/`tape` tej samej fali
  → jedna faza „pyknięcia” (`fire` 0,32 s, inaczej 0,24 s): kafelki rosną do 1,2 i znikają, drobinki w kolorze
  rodzaju (4), przeszkoda drży i zmienia warstwy, taśma pęka, nowe moce rosną od 0,2; po niej pauza 0,06 s;
  `fall` — każdy kafelek po swojej drodze (czas = max(0,12, najdłuższa droga × 0,07), ease-in, „spłaszczenie” przy
  lądowaniu); `hatch` — pisklę odlatuje w górę z serduszkiem; `phone` — fale dzwonienia, potem karteczka;
  `shuffle` — kafelki przelatują łukiem z obrotem; `finaleMove` — humbak przepływa przez planszę. Na końcu `onDone`.
- **Efekty**: Pióro / krzyż — jasne pasy i lecące pióra w obie strony; Bąbel / wielki bąbel / cała plansza —
  rozszerzający się pierścień `woda`; Tęczowy — kolorowe promienie do trafionych pól; Pisklę — sówka leci łukiem do
  celu; `glow`, `owlet`, `ring`, `whale`. Drobinki (grawitacja 7 pól/s², limit 160 × skala drobinek, przy
  ograniczeniu ruchu 40%) i napisy punktów (`popup`, najwyżej 10).
- **Rysowanie** (`draw`): tło → przeszkody (z drżeniem) → złota ramka zaznaczenia → kafelki (przycięte do planszy
  i jednego rzędu nad nią; podpowiedź kołysze dwa kafelki, zaznaczony pulsuje, moce pulsują, storczyki mrugają
  co ok. 5,2 s na 170 ms każdy we własnym rytmie) → efekty → drobinki i napisy.
- **Rysowanie na żądanie** (Analiza 6, W4): płótno jest malowane tylko, gdy coś się zmienia — `dirty` (rozmiar,
  nowy obraz planszy, zaznaczenie, podpowiedź, przeciąganie, pamięć obrazków), ruch (`moving()`: faza, efekt,
  drobinki, napisy, przeciąganie, podpowiedź, zaznaczenie, moc na planszy, rosnący / spłaszczony kafelek, drżąca
  przeszkoda), jedna klatka po ostatnim ruchu (stan końcowy) albo zmiana mrugających storczyków (`blinkState`).
  W spoczynku klatka jest pomijana (`stats.skipped`).
- API: `setBoard`, `sync` (obraz zgodny z logiką po każdej akcji), `resize`, `play`, `busy`, `skip` (natychmiast
  do końca — stuknięcie w trakcie animacji i testy), `animating`, `popup`, `update(dt)`, `draw(dt)`, `cellAt(x, y)`,
  `cellCenter(i)`, `cellSize`, `size`, `select`, `setHint`, `setDrag`, `invalidate`, `stats` (`frames`,
  `skipped`, `phases`, `tileDraws`, `backgroundRenders`, `tiles`, `sprites`, `particles`), `clearCaches`.

## `owl-director.js` — reżyser reakcji Sówki

Czysta logika: zdarzenie gry → polecenie `{ reaction, level, duration, priority, sound, bubble, eyes, effects, at }`.

- `joyLevel(move)` — 0 (nic), 1 (combo 1 albo cokolwiek zbite), 2 (combo 2 albo powstała moc), 3 (combo 3, Bąbel
  albo zrobiony cel), 4 (combo 4, Tęczowy albo połączenie mocy), 5 (combo ≥ 6, dwa Tęczowe, dwa Bąble).
- `JOY_REACTIONS`:

| Poziom | Reakcja  | Czas | Priorytet | Dźwięk   | Efekt      | Oczy     | Dymki                     |
| ------ | -------- | ---- | --------- | -------- | ---------- | -------- | ------------------------- |
| 1      | `hop`    | 0,45 | 1         | `hu`     | `leaves`   | —        | —                         |
| 2      | `wings`  | 0,8  | 2         | `huhu`   | `sparkles` | —        | Ładnie!, Brawo!           |
| 3      | `double` | 1    | 3         | `huhuhu` | `hearts`   | —        | Super!, Ale combo!        |
| 4      | `salto`  | 1,2  | 4         | `trel`   | `stars`    | gwiazdki | Ekstra!, Sowiście!        |
| 5      | `fly`    | 1,8  | 5         | `hura`   | `confetti` | gwiazdki | Hu-hu-hura!, Niesamowite! |

- `OTHER_REACTIONS` (reakcja, czas, priorytet, dymek, dźwięk): `invalid` tilt 0,7 / 1 „Hm?”; `shuffle` spin 0,9 / 3
  „Pomieszam!”; `lowMoves` worried 1,4 / 3 „Ojej, mało ruchów!” (ojej); `half` lean 1 / 2 „Jeszcze trochę!”; `goal`
  thumbs 1 / 3 „Jest!” (huhu); `egg` hug 1,4 / 4 „Moje pisklątko!” (oczy-serduszka, serduszka); `gift` 1,6 / 5
  „Prawie! Masz ode mnie 3 ruchy!” (huhu); `cozy` gift 1,4 / 5 „Dokładam 5 ruchów — graj spokojnie!”; `finale` clap
  1,2 / 4 „Humbaczy Finał!” (krople); `win` dance 2,2 / 6 „Brawo! Udało się!” (konfetti, hura); `winThree` dance
  2,4 / 6 „Trzy gwiazdki!” (gwiazdki w oczach); `lose` sad 1,6 / 6 „Spróbujmy jeszcze raz! Hu-hu!” (smutne oczy,
  ojej); `think` 1,6 / 1; `sleep` 600 / 0,5 (chrr); `giggle` spin 0,8 / 2 „Hi-hi!” (chichot); `help` fly 1,6 / 6
  „Lecę z pomocą!” (gwiazdki, hura); `helpReady` wings 1 / 3 „Mogę pomóc!”; `start` wave 1,4 / 2 (huhu; dymek = cel
  poziomu, np. „Zbierzmy 30 kózek!”).
- Zasady: ważniejsza reakcja przerywa słabszą, słabsza w trakcie ważniejszej jest pomijana (`null`); dymek najwyżej
  raz na 2 s i nie ten sam dwa razy z rzędu; bez komentarzy (`quips()` fałsz) — bez dymków; ciche „hu” najwyżej co
  1,5 s; „Hm?” przy 1., 4., 7.… złej zamianie; przy ograniczeniu ruchu salto i lot → `wings`, konfetti →
  `sparkles`; zdarzenie `win` nic nie robi (finał ma własną reakcję), `won` → `win`/`winThree`.
- API: `handle(zdarzenie, czas)`, `current(czas)` (trwająca reakcja albo `null`), `stop()`, `last()`.

## `owl-view.js` — Sówka na gałęzi

- `createOwlView({ canvas, atlas, getDpr, cosmetic, reducedMotion, particleScale })` → `resize`, `draw(dt, reakcja,
czas)`, `burst(rodzaj)`, `fly(cel)`, `head()`, `animating`, `state`.
- Poza w spoczynku (`restPose`): stopy w (szerokość / 2, 0,94 × wysokość), rozmiar `min(0,78 × wysokość,
0,9 × szerokość)`. `head()` → prawa krawędź głowy (`x + 0,4 × rozmiar`) i czubek (`y − 0,95 × rozmiar`) — do
  ustawienia dymka.
- Obrazek (`spriteFor`): oczy-gwiazdki → `sowa-zachwyt`, serduszka → `sowa-serduszka`, smutek / zmartwienie →
  `sowa-smutek`, sen → `sowa-mruga`, reakcje radosne (wings, double, salto, fly, dance, clap, gift, thumbs) →
  `sowa-radosc`, wave / lean → `sowa-macha`, hop → `sowa-skok`, inaczej `sowa-stoi` (mrugnięcie 0,13 s co 3–5 s →
  `sowa-mruga`).
- Przekształcenia (t = postęp reakcji 0–1): spokój — oddech (skala ±1,5%) i kołysanie ±0,03 rad; hop — podskok
  9% z rozciągnięciem; wings / gift / thumbs / clap — dwa podskoki 12%; double — 18%; salto — 30% w górę i pełny
  obrót wokół środka sowy; fly — 8% (plus lot elementu płótna); tilt / think — przechylenie 0,22 rad; spin —
  obrót wokół osi pionowej (skala X = cos); sad — 2% w dół; worried — drżenie i kropla potu; lean / wave —
  przechylenie 0,12; dance — 4 podskoki i odbicie lustrzane; hug — przytulenie (skala X +6%); sleep — oddech
  i „z z” unoszące się nad głową. Gałąź: krzywa `sowaCiemna` od lewej krawędzi do 95% szerokości i listek
  `monstera`. Strój z garderoby: `cosmetic()` → `drawOwl(..., { cosmetic })`.
- Drobinki (`burst`): `leaves` 3, `sparkles` 6, `hearts` 5, `stars` 7, `confetti` 22, `drops` 8 (× skala drobinek,
  najwyżej 80).
- `fly(cel)` — lot nad planszą (radość 5 i Sowia pomoc): animacja elementu płótna (Web Animations, 1,6 s, ease-in-out)
  do środka planszy z pełnym obrotem i z powrotem; przy ograniczeniu ruchu — bez lotu.

## `map.js`, `tutorial.js`, `guide.js`

- `renderMap(root, { state, current, open, onPick })` — dla każdego rozdziału sekcja `.trojki-chapter.is-<id>`
  z nagłówkiem „1. Sowia Łąka” i licznikiem „★ suma / 45”, lista `ol.trojki-path` z 15 przyciskami
  `.trojki-level` (`data-level`; numer albo kłódka `ICONS.lock`, gwiazdki ★/☆; `is-current`, `is-done`,
  zablokowany = `disabled`, gdy nie `open` i poziom > `unlocked`); zygzak: `--shift` = 0, 1, 2, 1 powtarzane;
  bieżący poziom przewijany na środek.
- `showIntro(level, { seen, onSeen })` — karty „Nowość” (`openModal` z `shared/ui/modal.js`, klasa
  `trojki-intro-modal`, znaczek „Nowość”, zdanie, przycisk „Rozumiem”) po kolei dla nieobejrzanych kluczy;
  `showHand(element, { from, to } | null)` — ręka podpowiedzi (zmienne CSS `--x`, `--y`, `--dx`, `--dy`).
- `GUIDE` — instrukcja w formacie `shared/meta/guides-data.js` (`id: "trojki"`, `summary`, 7 kart: Cel poziomu,
  Ruch (gest `swipe-right`, wskazówka), Moce (gest `tap`), Pracu Pracu i Amic, Jajka i gniazda, Sówka i Sowia
  pomoc (gest `tap`), Gwiazdki i Humbaczy Finał). Pokazywana przez `renderGuide` w oknie „Jak grać — Sowie
  Trójki” (przycisk „?”) i w menu pauzy (opcja `guide` w `createPauseMenu`).

## `main.js` — strona gry

- **Stałe:** muzyka `ogrod` (gra) i `humbak` (finał); dźwięki wczytywane po odblokowaniu: `klik`, `polaczenie`,
  `hu-hu`, `rekord`, `koniec-gry`, `humbak-plusk`, `lisc-teczowy`, `dzwonek`; podpowiedź po 5 s (Tryb Przytulny
  3 s), sen Sówki po 40 s.
- **Zapis:** `SAVE_ENABLED` = gra jest w `GAME_REGISTRY`; `PREVIEW = !SAVE_ENABLED` (napis podglądu, wszystkie
  poziomy otwarte).
- **Silnik:** `createQuality()` (automat płynności, Analiza 6), `createFrameLimiter`, ostrość `quality.dpr()`,
  atlas `createAtlas({ catalog: TROJKI_SPRITES, baseUrl: SVG_BASE })` z gatunkiem sowy z Butiku (`linkSpecies`),
  renderer planszy, widok Sówki, reżyser (`quips` z ustawień profilu), licznik `?perf=1`, komunikat „Gra trochę
  zwalnia” (`createSlowBanner`, propozycja trybu oszczędzania przy `onStruggle`), `quality.onChange` → `resize`.
- **Układ** (`fitLayout`, `placeBubble`, `resize` — wołane przy zmianie okna i z `ResizeObserver` sekcji gry):
  w pionie wiersz planszy ma dokładnie jej wysokość (`--board-h` = `floor(szerokość / 8) × rzędy + 12` px), resztę
  dostaje Sówka; kolumna Sówki `--owl-w` = `max(96, min(0,8 × wysokość pola Sówki, 0,5 × jego szerokość))` px;
  dymek obok głowy (`--bubble-x` = prawa krawędź głowy + 10 px, `--bubble-y` = czubek głowy + 20% rozmiaru).
  Atlas dociągany do ostrości `max(64, 0,8 × pole, wysokość Sówki / 1,2) × ostrość`, potem `clearCaches`.
- **Ekrany:** `showScreen("map" | "game")` — w grze w nagłówku „Mapa” i pauza, na mapie „Menu” (link do menu
  SowieGry) bez pauzy; `showMap()` — `renderMap` (bieżący = `unlocked`, w podglądzie wszystkie otwarte);
  `openStartCard(id)` — okno „Poziom N”: lista celów, „Ruchy: N”, gwiazdki, „Graj”; `startLevel(id, { skipIntro })`
  — podejście +1, `createLevelRun` z ziarnem podejścia i `cozy: () => settings().cozy`, układ, obraz planszy, HUD,
  muzyka, karty „Nowość”, reakcja `start` z dymkiem celu („Zbierz…” → „Zbierzmy…!”), komunikat dla czytnika
  ekranu, ręka podpowiedzi na poziomach 1–2.
- **HUD** (`updateHud`): ruchy (klasa `is-low` przy ≤ 3), punkty (`pl-PL`), pasek gwiazdek (`scaleX` = wynik /
  próg ★★★, `data-stars` 0–3), cele (ikona na płótnie 56 × 56: kolorowe koło z obrazkiem rodzaju, jajko,
  telefon, skrzynia, karteczka albo gwiazdka punktów; liczba: ile zostało, punkty — ile zdobyte, zrobiony — „✓”
  i klasa `is-done`, `aria-label`), Radość (`scaleX`), „Sowia pomoc” włączona przy pełnej Radości w fazie gry
  (klasa `is-help-ready` na `<main>` i reakcja `helpReady` raz).
- **Sówka:** `react(zdarzenie)` → polecenie reżysera → dźwięk (`OWL_SOUNDS`: `hu`, `huhu`, `huhuhu`, `trel` — „hu-hu”
  w różnych głośnościach i wysokościach; `hura` — „rekord”; `ojej`, `chichot`, `chrr`), dymek (`showBubble`:
  animacja 220 ms, znika po 1,8 s), lot nad planszę przy `fly`. `wake()` — budzi śpiącą Sówkę (chichot). Stuknięcie
  w Sówkę: przy pełnej Radości — Sowia pomoc, inaczej chichot.
- **Ruchy:** `canAct()` (jest przebieg, ekran gry, faza `play`, nie trwa animacja, pauza zamknięta);
  `handleResult` — zła zamiana: animacja powrotu, cichy „klik” (wysokość 0,6), reakcja; dobra: blokada, chowa rękę
  i podpowiedź, napis combo (`showCombo`: „Super! ×3”, animacja 1,1 s), dźwięki (`lisc-teczowy` przy nowej mocy,
  `humbak-plusk` przy odpaleniu, `polaczenie` raz na falę, coraz wyżej), reakcje (jajko, cel z komunikatem,
  mieszanie, ruch, mało ruchów, połowa, prezent, Tryb Przytulny, pomoc), animacja i na końcu `sync`, HUD,
  `afterAnimation` (finał albo przegrana). `attemptSwap`, `tapCell` (moc stuknięta bez zaznaczenia odpala się;
  sąsiad zaznaczonego — zamiana; inaczej zaznaczenie), `useHelp`, `startFinale` (reakcja `finale`, muzyka humbaka,
  `run.finale()`, animacja, `showWin`).
- **Koniec:** `showWin` — zapis wyniku, reakcja `won`, dźwięk „rekord”, okno „Brawo!” / „Trzy gwiazdki!” z
  animowanymi gwiazdkami i punktami, przyciski „Mapa” i „Dalej” (karta następnego poziomu); `showLose` — zapis, reakcja
  `lose`, dźwięk „koniec-gry”, okno „Ojej, zabrakło ruchów” z „Brakowało: …”, przyciski „Mapa” i „Spróbuj jeszcze
  raz” (od razu, bez żyć).
- **Gesty** (`pointerdown` / `pointermove` / `pointerup` / `pointercancel` na płótnie planszy, `touch-action:
none`): stuknięcie w trakcie animacji przyspiesza ją (`skip`); przesunięcie ≥ 1/3 pola wyznacza kierunek
  (przewaga poziomo / pionowo) i robi zamianę z sąsiadem; krótsze przesunięcie przesuwa kafelek najwyżej o 0,2 pola
  (`setDrag`); puszczenie bez przesunięcia = stuknięcie (`tapCell`). Klawiatura (płótno ma `tabindex="0"`):
  strzałki — ramka (`cursor`, komunikat „Kolumna X, rząd Y”), przy zaznaczeniu — zamiana w tym kierunku; Enter /
  spacja — stuknięcie; Esc — bez zaznaczenia.
- **Pauza i tło:** `createPauseMenu({ gameId: "trojki", guide: GUIDE, onRestart, onExit })` — przycisk pauzy
  tylko w grze; przejście do innej karty / aplikacji otwiera pauzę („tło”) i woła `save()`.
- **Pętla** (`requestAnimationFrame`): cel klatek — `quality.fps()` (60) gdy coś się dzieje (`busy`: przeciąganie,
  1,5 s po dotyku, animacja planszy lub Sówki, reakcja, podpowiedź, ręka), inaczej najwyżej 30; ogranicznik klatek,
  próbka automatu płynności, licznik `?perf=1`; w grze `renderer.update/draw` (rysowanie na żądanie) i
  `owlView.draw`; bezczynność → podpowiedź (reakcja `think`), po 40 s sen (`sleep`).
- **Start:** napis podglądu, czekanie na `cloud.ready`, `loadProgress`, `?poziom` albo mapa; `audio.json` →
  `createAudio` (podłączone ustawienia głośności z profilu, odblokowanie dźwięku pierwszym dotknięciem poza
  linkami).
- **Haki testowe** `window.SowieTrojki`: `ready`, `atlasReady`, `screen`, `preview`, `level`, `state` (faza, ruchy,
  punkty, radość, gwiazdki, cele, prezent, statystyki), `progress`, `board` (`boardToText`), `start(id)`, `map`,
  `setLayout(rows)`, `setGoalDone(i, n)`, `setMoves(n)`, `setJoy(n)`, `swap`, `tap`, `help`, `hint`,
  `cellCenter`, `cellSize`, `busy`, `settle` (do końca animacji), `hold` (zatrzymanie animacji), `owl` (`last`,
  `current`, `view`), `bubble`, `music`, `renderStats`, `quality` (poziom, tryb, ostrość, szerokość płótna, cel
  klatek, `busy`), `setQualityLevel`.

## `index.html`

`<html lang="pl" class="sowie-shell">`; w `<head>`: viewport z `viewport-fit=cover`, `theme-color` #dff7ea, opis,
tytuł „Sowie Trójki — SowieGry (podgląd)”, manifest i ikony PWA, skrypty w kolejności wspólnej dla gier
(`config/firebase-config.js`, `shared/sowie-platform.js`, `shared/sowie-cloud.js`, `shared/password-gate.js`,
`shared/pwa.js`), wstępne wczytanie Fredoki, style `shared/cute-ui.css`, `shared/world/tokens.css`,
`shared/ui/ui.css`, `style.css`, moduł `main.js`. W `<body>` jeden `<main class="trojki" data-trojki>`:

- `header.trojki-top`: link „Menu” (`data-menu-link`, `href="../"`), przycisk „Mapa” (`data-to-map`, ukryty na mapie),
  `h1.trojki-title` (`data-level-title`), „?” (`data-guide`), pauza `.trojki-pause` (`data-pause`, ikona
  `ICONS.pause` wstawiana w JS).
- `section.trojki-map-screen` (`data-map-screen`): akapit podglądu (`data-preview`) i `div.trojki-map`
  (`data-map`).
- `section.trojki-game` (`data-game`, ukryta na starcie): `.trojki-bar` (ruchy `data-moves`, lista celów
  `data-goals`, punkty `data-score` z paskiem `data-stars`/`data-star-fill`), `.trojki-board-wrap`
  (`data-board-wrap`: płótno `canvas.trojki-board` `data-board` `tabindex="0"`, napis combo `data-combo`, ręka
  `data-hand`), `.trojki-owl-area` (`data-owl-area`: przycisk Sówki `data-owl-button` z płótnem `data-owl`, dymek
  `p.trojki-bubble` `data-bubble` `role="status"`, `.trojki-joy` z napisem „Radość Sówki”, paskiem `data-joy`
  i przyciskiem „Sowia pomoc” `data-help`).
- `p.trojki-live` (`data-live`, `aria-live="polite"`) — komunikaty dla czytnika ekranu.

## `style.css`

- `html, body` na 100% wysokości bez marginesu; tło strony — gradient pionowy #dff7ea → `--niebo-dol`; czcionka
  `--czcionka-sowia`, kolor `--kontur`. `.trojki [hidden] { display: none !important }` (klasy z `display` nie
  przebijają atrybutu `hidden`).
- `.trojki` — siatka (nagłówek + reszta), `height: 100dvh`, `max-width: 1100px`, odstępy z `env(safe-area-inset-*)`
  (co najmniej 6 / 8 px). Nagłówek: siatka `auto 1fr auto auto`; tytuł 20 px; „?” i pauza 48 × 48 (pauza — białe
  koło 88% krycia z cieniem, ikona 24 px); obrys fokusu 3 px `--niebieski`.
- **Mapa:** przewijana; akapit podglądu (biały 85%, zaokrąglenie 14 px, 14 px tekstu); rozdziały z gradientami
  (łąka zielono-kremowy, ogródek brzoskwiniowy, staw błękitny), zaokrąglenie 22 px; ścieżka — 5 kolumn, kółka
  58 × 58 (gradient promienisty biel → `--niebo-gora`, wewnętrzny kontur 3 px, cień 4 px w dół; zrobione — złotawe
  #ffe9a6; zablokowane — 55% krycia), numer 20 px, gwiazdki 12 px `--zloto-ciemne`, zygzak `translateY(--shift ×
6 px)`; bieżący poziom pulsuje **złotą obwódką** (`box-shadow` 7 px `rgba(244, 197, 66, 0.6)` w połowie cyklu
  1,4 s) — bez skalowania, żeby przycisk stał w miejscu.
- **Gra (pion):** `.trojki-game` — wiersze `auto` (pasek), `minmax(0, var(--board-h, 1fr))` (plansza),
  `minmax(clamp(100px, 22dvh, 200px), 1fr)` (Sówka), odstęp 6 px. Pasek: biały 88%, zaokrąglenie 18 px, siatka
  `auto 1fr auto` (ruchy 26 px — czerwone `--pracu` przy `is-low`, cele w rzędzie z ikonami 30 px i liczbą 15 px,
  punkty 16 px z paskiem gwiazdek 72 × 8 px w kolorze `--zloto`, animacja `scaleX` 0,3 s). Płótno planszy wypełnia
  pole, `touch-action: none`, bez zaznaczania. Napis combo: biały 28–46 px z konturem 7 px, na środku planszy.
  Ręka: białe kółko 30 px z obwódką, animacja `trojkiHand` 1,6 s (pojawia się, przesuwa o `--dx/--dy`, znika).
- **Pole Sówki:** siatka `var(--owl-w) 1fr` × `1fr auto`; przycisk Sówki na dwa wiersze; dymek — biały, zaokrąglony
  18 px, 17 px pogrubiony, ogonek z lewej, pozycja z `--bubble-x`/`--bubble-y` (rośnie w górę); `.trojki-joy`
  w prawej kolumnie na dole: „Radość Sówki” 13 px, pasek 12 px (gradient `--policzki` → `--serce`), „Sowia
  pomoc” na całą szerokość (min. 48 px); przy pełnej Radości przycisk świeci (`trojkiGlow`, złota poświata 6 px).
- **Niski telefon w pionie** (`orientation: portrait` i `max-height: 660px`, np. 320 × 568): mniejszy tytuł (18 px),
  pasek (ruchy 22 px, ikony celów 26 px) i bez napisu „Radość Sówki” — pola planszy ≥ 34 px.
- **Poziomo i komputer** (`orientation: landscape` i `max-height: 640px`, albo `min-width: 900px` i
  `min-height: 600px`): trzy kolumny `minmax(150px, 24%) 1fr minmax(130px, 20%)` — Sówka (z lewej; nad nią stałe
  62 px na dymek wyśrodkowany z ogonkiem w dół, bez napisu Radości), plansza (środek), pasek w kolumnie (ruchy,
  cele jeden pod drugim, punkty).
- Okna: lista celów 18 px, gwiazdki startu i wyniku 32 px (zdobyte — złote z konturem, animacja `trojkiStar`
  0,5 s co 0,25 s), znaczek „Nowość” (biały na `--monstera`).
- `prefers-reduced-motion: reduce` i klasa `sowie-reduced-effects`: bez pulsowania, ręki, poświaty i animacji
  gwiazdek.

## Grafiki gry (`assets/svg/`)

Zasady jak w całym Sowim Świecie (`docs/Documentation.md`, „Zasady plików SVG”): pudełko 128 × 128, kontur
#3b2f4a 3–4 px, zaokrąglone łączenia. Pliki (pełny kod — dodatek A): `trojki/truskawka.svg` (czerwony owoc
z pestkami i zielonym kielichem), `trojki/storczyk.svg` (różowy kwiat z sowią buzią: płatki #ff9fb2 i #ff6f91,
kremowa twarz, oczy, dziobek — styl „mrugająca sówka jako kwiat”), `trojki/storczyk-mruga.svg` (ten sam kwiat,
oczy zamknięte „^ ^”), `trojki/pioro.svg` (sowie pióro poziomo), `trojki/jajko.svg` (kremowe jajko w brązowe kropki),
`trojki/gniazdo.svg` (misa z gałązek), `sowa/oczy-gwiazdki.svg`, `sowa/oczy-serduszka.svg`, `sowa/oczy-smutne.svg`
(warianty oczu Sówki dla `owlLayers`).

## Dźwięk

Bez nowych plików: muzyka `ogrod` (gra), `humbak` (Humbaczy Finał); efekty `klik`, `polaczenie`, `hu-hu` (głos
Sówki w różnych głośnościach i wysokościach), `rekord`, `koniec-gry`, `humbak-plusk`, `lisc-teczowy` z
`assets/audio/audio.json` (`shared/engine/audio.js`, szyny master / music / sfx z ustawień profilu).

## Wydajność

Pomiar `node scripts/perf-bench.cjs --gry trojki --cpu 1,4` (profil Redmi Note 10 Pro 393 × 873, ×2,75, 6 s,
poziom 7; „kl./s gra” = klatki faktycznie narysowane na planszy):

| Scenariusz             | CPU | kl./s ekran | kl./s plansza | wątek %                                          |
| ---------------------- | --- | ----------- | ------------- | ------------------------------------------------ |
| spokój (Sówka oddycha) | ×1  | 59,9        | 14,8          | 13                                               |
| ruch za ruchem         | ×1  | 59,8        | 60,1          | 21                                               |
| spokój                 | ×4  | 57,3        | 11,8          | 56 (przed rysowaniem na żądanie: 86, ekran 53,9) |
| ruch za ruchem         | ×4  | 54,1        | 54,6          | 95                                               |

Obrazki kafelków, mocy i przeszkód są gotowe w pamięci (klatka to kopiowanie obrazków), tło planszy w osobnym płótnie,
automat płynności obniża ostrość, a w spoczynku plansza nie jest przerysowywana.

## Testy

- `tests/unit/trojki-plansza.test.mjs` — ułożenia i pierwszeństwo mocy (3, 4, 5 w linii, L / T / +, kwadraty,
  bloki 2 × 3 i 3 × 3), zamiana (zła wraca, moc w polu przesuniętego kafelka), spadanie z wylotami i ukosami pod
  przeszkodą i dziurą, moce i połączenia dwóch mocy, przeszkody (warstwa na ułożenie, kanister tylko od mocy,
  taśma), telefon Pracu, jajka i gniazda, mieszanie i plansza startowa (to samo ziarno — ta sama plansza), 2000
  losowych ruchów na planszach z przeszkodami, dziurami, taśmą i jajkami z niezmiennikami po każdym, cele słowami
  i polska liczba mnoga.
- `tests/unit/trojki-gra.test.mjs` — 45 poprawnych poziomów, „piła” trudności, karty „Nowość” w kolejności i każda
  użyta, ruch i cele, prezent, Tryb Przytulny (także włączony w trakcie), Sowia pomoc, finał i gwiazdki, podpowiedź,
  odsetek wygranych symulatora na każdym poziomie (łatwy ≥ 75%, średni ≥ 55%, trudny ≥ 35% w 12 podejściach).
- `tests/unit/trojki-sowka.test.mjs` — zapis stanu (wczytanie, łączenie, wynik, podsumowanie) i reżyser Sówki
  (skala radości, priorytety, dymki, „hu”, „Hm?”, ograniczenie ruchu, wygrana).
- `tests/e2e/telefon/trojki.spec.js` (5 profili telefonów × Chromium i WebKit, emulator Firestore): mapa 45
  poziomów i karta startu z „Nowością”, ruch przesunięciem palca (Sówka się cieszy), zła zamiana bez utraty ruchu,
  dwa stuknięcia i pięć w rzędzie → Tęczowy liść i salto, Sowia pomoc bez kosztu ruchu, wygrana z finałem
  i „Dalej” oraz **brak dokumentu `trojki` w chmurze**, prezent i „Spróbuj jeszcze raz”, Tryb Przytulny z pauzy,
  układ ekranu (pole ≥ 34 px, Sówka i pomoc w oknie, poziomo: Sówka z lewej, cele z prawej), licznik `?perf=1`.

## Dodatek A — kod grafik

### `assets/svg/trojki/truskawka.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <!-- Truskawka (Sowie Trójki, kafelek na zielonym sześciokącie): czerwony owoc z pestkami, zielony kielich. -->
  <path fill="#e8465a" stroke="#3b2f4a" stroke-width="4" stroke-linejoin="round"
    d="M64 118 C44 110 22 86 22 62 C22 45 36 36 52 38 C57 39 61 40 64 40 C67 40 71 39 76 38 C92 36 106 45 106 62 C106 86 84 110 64 118 Z"/>
  <path d="M34 60 Q37 50 47 46" fill="none" stroke="#ff9fb2" stroke-width="6" stroke-linecap="round"/>
  <g fill="#f4c542" stroke="#d99a1e" stroke-width="1.5">
    <ellipse cx="44" cy="68" rx="3" ry="4.5"/>
    <ellipse cx="64" cy="62" rx="3" ry="4.5"/>
    <ellipse cx="84" cy="68" rx="3" ry="4.5"/>
    <ellipse cx="54" cy="84" rx="3" ry="4.5"/>
    <ellipse cx="74" cy="84" rx="3" ry="4.5"/>
    <ellipse cx="64" cy="100" rx="3" ry="4.5"/>
    <ellipse cx="40" cy="86" rx="2.5" ry="4"/>
    <ellipse cx="88" cy="86" rx="2.5" ry="4"/>
  </g>
  <path fill="#3fae6a" stroke="#3b2f4a" stroke-width="4" stroke-linejoin="round"
    d="M64 46 C56 48 44 50 36 44 C44 40 52 39 58 40 C52 34 50 28 52 22 C58 26 62 32 64 38 C66 32 70 26 76 22 C78 28 76 34 70 40 C76 39 84 40 92 44 C84 50 72 48 64 46 Z"/>
  <path d="M64 38 Q66 26 72 16" fill="none" stroke="#3b2f4a" stroke-width="8" stroke-linecap="round"/>
  <path d="M64 38 Q66 26 72 16" fill="none" stroke="#2e8b57" stroke-width="3.5" stroke-linecap="round"/>
</svg>
```

### `assets/svg/trojki/storczyk.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <!-- Sowi storczyk (Sowie Trójki, kafelek na pomarańczowym rombie): różowy kwiat z sowią buzią — w stylu ulubionym
       przez gracza („mrugająca sówka jako kwiat”). Oczy zamknięte: storczyk-mruga.svg (ten sam rysunek). -->
  <g fill="#ff9fb2" stroke="#3b2f4a" stroke-width="4" stroke-linejoin="round">
    <path d="M64 50 C54 36 50 18 58 8 C62 14 64 20 64 26 C64 20 66 14 70 8 C78 18 74 36 64 50 Z"/>
    <path d="M58 56 C40 56 20 46 14 32 C28 30 44 36 54 46 Z"/>
    <path d="M70 56 C88 56 108 46 114 32 C100 30 84 36 74 46 Z"/>
  </g>
  <g fill="#ff6f91" stroke="#3b2f4a" stroke-width="4" stroke-linejoin="round">
    <path d="M52 70 C34 78 22 96 24 112 C38 108 50 92 56 80 Z"/>
    <path d="M76 70 C94 78 106 96 104 112 C90 108 78 92 72 80 Z"/>
  </g>
  <path fill="#fffaf2" stroke="#3b2f4a" stroke-width="4" stroke-linejoin="round"
    d="M64 40 C82 40 92 52 92 68 C92 86 80 100 64 100 C48 100 36 86 36 68 C36 52 46 40 64 40 Z"/>
  <path d="M46 50 L42 38 L54 44 Z M82 50 L86 38 L74 44 Z" fill="#ff6f91" stroke="#3b2f4a" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="52" cy="84" rx="6" ry="4" fill="#ff9fb2"/>
  <ellipse cx="76" cy="84" rx="6" ry="4" fill="#ff9fb2"/>
  <g fill="#ffffff" stroke="#3b2f4a" stroke-width="4">
    <circle cx="53" cy="66" r="10"/>
    <circle cx="75" cy="66" r="10"/>
  </g>
  <g fill="#3b2f4a">
    <circle cx="55" cy="67" r="5"/>
    <circle cx="77" cy="67" r="5"/>
  </g>
  <g fill="#ffffff">
    <circle cx="57" cy="64" r="1.8"/>
    <circle cx="79" cy="64" r="1.8"/>
  </g>
  <path d="M60 78 L68 78 L64 86 Z" fill="#f59e3b" stroke="#3b2f4a" stroke-width="3" stroke-linejoin="round"/>
</svg>
```

### `assets/svg/trojki/storczyk-mruga.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <!-- Sowi storczyk mrugający (Sowie Trójki): ten sam kwiat co storczyk.svg, oczy zamknięte („^ ^”). -->
  <g fill="#ff9fb2" stroke="#3b2f4a" stroke-width="4" stroke-linejoin="round">
    <path d="M64 50 C54 36 50 18 58 8 C62 14 64 20 64 26 C64 20 66 14 70 8 C78 18 74 36 64 50 Z"/>
    <path d="M58 56 C40 56 20 46 14 32 C28 30 44 36 54 46 Z"/>
    <path d="M70 56 C88 56 108 46 114 32 C100 30 84 36 74 46 Z"/>
  </g>
  <g fill="#ff6f91" stroke="#3b2f4a" stroke-width="4" stroke-linejoin="round">
    <path d="M52 70 C34 78 22 96 24 112 C38 108 50 92 56 80 Z"/>
    <path d="M76 70 C94 78 106 96 104 112 C90 108 78 92 72 80 Z"/>
  </g>
  <path fill="#fffaf2" stroke="#3b2f4a" stroke-width="4" stroke-linejoin="round"
    d="M64 40 C82 40 92 52 92 68 C92 86 80 100 64 100 C48 100 36 86 36 68 C36 52 46 40 64 40 Z"/>
  <path d="M46 50 L42 38 L54 44 Z M82 50 L86 38 L74 44 Z" fill="#ff6f91" stroke="#3b2f4a" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="52" cy="84" rx="6" ry="4" fill="#ff9fb2"/>
  <ellipse cx="76" cy="84" rx="6" ry="4" fill="#ff9fb2"/>
  <g fill="none" stroke="#3b2f4a" stroke-width="4.5" stroke-linecap="round">
    <path d="M45 65 Q53 71 61 65"/>
    <path d="M67 65 Q75 71 83 65"/>
  </g>
  <path d="M60 78 L68 78 L64 86 Z" fill="#f59e3b" stroke="#3b2f4a" stroke-width="3" stroke-linejoin="round"/>
</svg>
```

### `assets/svg/trojki/pioro.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <!-- Sowie pióro (moc „Pióro” w Sowich Trójkach), poziomo: chorągiewka w kolorach Sówki i stosina. Kierunek lotu
       (↔ albo ↕) gra dorysowuje strzałkami i obrotem. -->
  <path fill="#b07a52" stroke="#3b2f4a" stroke-width="4" stroke-linejoin="round"
    d="M18 66 C30 42 62 32 104 36 C112 37 118 42 116 50 C112 70 80 90 40 86 C30 85 22 78 18 66 Z"/>
  <path fill="#f3e3c8" stroke="#3b2f4a" stroke-width="3" stroke-linejoin="round"
    d="M34 64 C46 50 70 44 100 44 C96 58 74 72 44 74 C38 73 35 69 34 64 Z"/>
  <g fill="none" stroke="#8a5a3b" stroke-width="3" stroke-linecap="round">
    <path d="M52 56 L60 70 M68 50 L76 64 M84 46 L90 58"/>
  </g>
  <path d="M10 76 Q40 62 112 46" fill="none" stroke="#3b2f4a" stroke-width="7" stroke-linecap="round"/>
  <path d="M10 76 Q40 62 112 46" fill="none" stroke="#e2b98f" stroke-width="3" stroke-linecap="round"/>
</svg>
```

### `assets/svg/trojki/jajko.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <!-- Jajko (cel „Sprowadź jajka do gniazda” w Sowich Trójkach): kremowe jajko w brązowe kropki. -->
  <path fill="#fffaf2" stroke="#3b2f4a" stroke-width="4"
    d="M64 12 C88 12 104 50 104 78 C104 102 86 118 64 118 C42 118 24 102 24 78 C24 50 40 12 64 12 Z"/>
  <path d="M40 88 C42 104 56 112 70 110 C88 108 98 96 100 80" fill="none" stroke="#eadcc6" stroke-width="8" stroke-linecap="round"/>
  <path d="M44 46 Q50 30 62 24" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
  <g fill="#c9a47e">
    <ellipse cx="70" cy="44" rx="5" ry="4"/>
    <ellipse cx="50" cy="70" rx="4" ry="3"/>
    <ellipse cx="82" cy="72" rx="6" ry="4.5"/>
    <ellipse cx="62" cy="94" rx="5" ry="3.5"/>
    <ellipse cx="86" cy="96" rx="3" ry="2.5"/>
  </g>
</svg>
```

### `assets/svg/trojki/gniazdo.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <!-- Gniazdo (pole w dolnym rzędzie planszy Sowich Trójek, do którego trzeba sprowadzić jajko): misa z gałązek. -->
  <path fill="#8a5a3b" stroke="#3b2f4a" stroke-width="4" stroke-linejoin="round"
    d="M10 70 C14 64 114 64 118 70 C118 96 96 114 64 114 C32 114 10 96 10 70 Z"/>
  <path fill="#b07a52" d="M18 72 C40 78 88 78 110 72 C108 82 100 90 90 94 C72 98 52 98 36 94 C26 90 20 82 18 72 Z"/>
  <g fill="none" stroke="#c9a47e" stroke-width="4" stroke-linecap="round">
    <path d="M14 74 Q40 86 66 80"/>
    <path d="M56 92 Q84 96 112 76"/>
    <path d="M24 98 Q52 104 74 100"/>
    <path d="M70 108 Q90 104 104 94"/>
  </g>
  <g fill="none" stroke="#3b2f4a" stroke-width="3" stroke-linecap="round">
    <path d="M8 68 L20 60 M120 68 L108 58 M36 66 L30 56 M94 66 L100 56"/>
  </g>
</svg>
```

### `assets/svg/sowa/oczy-gwiazdki.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <!-- Zachwyt (Sowie Trójki, wielkie combo): białka oczu ze złotymi gwiazdkami zamiast źrenic. -->
  <g fill="#ffffff" stroke="#3b2f4a" stroke-width="4">
    <circle cx="46" cy="57" r="14"/>
    <circle cx="82" cy="57" r="14"/>
  </g>
  <g fill="#f4c542" stroke="#d99a1e" stroke-width="2" stroke-linejoin="round">
    <path d="M46 47 L49 54 L56 54 L50.5 58.5 L52.5 66 L46 61.5 L39.5 66 L41.5 58.5 L36 54 L43 54 Z"/>
    <path d="M82 47 L85 54 L92 54 L86.5 58.5 L88.5 66 L82 61.5 L75.5 66 L77.5 58.5 L72 54 L79 54 Z"/>
  </g>
</svg>
```

### `assets/svg/sowa/oczy-serduszka.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <!-- Czułość (Sowie Trójki, pisklę wraca do Sówki, „hu-hu-hura”): białka oczu z różowymi serduszkami. -->
  <g fill="#ffffff" stroke="#3b2f4a" stroke-width="4">
    <circle cx="46" cy="57" r="14"/>
    <circle cx="82" cy="57" r="14"/>
  </g>
  <g fill="#ff6f91" stroke="#3b2f4a" stroke-width="2" stroke-linejoin="round">
    <path d="M46 66 C38 60 36 55 38 51 C40 47 45 47 46 52 C47 47 52 47 54 51 C56 55 54 60 46 66 Z"/>
    <path d="M82 66 C74 60 72 55 74 51 C76 47 81 47 82 52 C83 47 88 47 90 51 C92 55 90 60 82 66 Z"/>
  </g>
</svg>
```

### `assets/svg/sowa/oczy-smutne.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <!-- Smutek (Sowie Trójki, przegrana — tylko na chwilę): opuszczone powieki, uniesione brwi i łezka. -->
  <g fill="none" stroke="#3b2f4a" stroke-width="5" stroke-linecap="round">
    <path d="M35 58 Q46 66 57 58"/>
    <path d="M71 58 Q82 66 93 58"/>
  </g>
  <g fill="none" stroke="#3b2f4a" stroke-width="4" stroke-linecap="round">
    <path d="M36 46 L54 40"/>
    <path d="M92 46 L74 40"/>
  </g>
  <path d="M90 66 C94 72 95 76 92 79 C89 81 86 78 87 74 C88 71 89 69 90 66 Z" fill="#5cc8e8" stroke="#3a86b8" stroke-width="1.5"/>
</svg>
```
