# Łącz i Hoduj — dokumentacja techniczna

Nowa **Sowia Szklarnia** (Analiza 2, rozdz. 3.5; Analiza 3, etap E8): gra logiczna typu **merge** na półkach szklarni. Dwa takie same przedmioty połączone przeciągnięciem dają przedmiot następnego poziomu. Gra powstaje od zera w osobnym folderze `LaczIHoduj/` jako **wersja podglądowa** (Analiza 3, „Podgląd przed podmianą”): w rejestrze gier wpis `szklarnia` ma `preview: { path: "LaczIHoduj/", name: "Łącz i Hoduj" }`, więc karta Sowiej Szklarni w menu ma przycisk „Wypróbuj nową wersję: Łącz i Hoduj”, a `SowieCloud.currentGame()` rozpoznaje stronę jako grę `szklarnia`. Identyfikator w bazie — **`szklarnia`** — nie zmienia się nigdy (opublikowane reguły Firestore). Dawna gra (`SowiaSzklarnia/`) działa bez zmian obok.

Stan: **E8a — prototyp (krok 8.0)**: plansza 7 × 9, przeciąganie z uniesieniem przedmiotu nad palec, zaznaczanie stuknięciem, Sowia doniczka z ładunkami, kompostownik (wyjście z zapchanej planszy), liście monstery, zapis w polu `preview`. Właściciel przyjął ekrany prototypu (2026-10-04), więc gra rośnie dalej w ścieżce merge. **E8b1 (krok 8.1, część 1)**: cztery łańcuchy roślin po 5 poziomów (Monstera, Pilea, Paproć, Kaktus) odblokowywane w Sowiej doniczce liczbą połączeń i trzy hybrydy z dawnej Szklarni (Monpilea Przytulna, Alopaproć Wachlarzowa, Złotolistka). **E8b2 (krok 8.1, część 2)**: zamówienia trzech sowich sąsiadek w nagłówku (karty z rysunkiem rośliny; oddanie stuknięciem gotowej karty albo przeciągnięciem rośliny na kartę) za liście i **gwiazdki odnowy**. Kolejne kroki (8.1 dalej: odnawianie pomieszczeń gwiazdkami; 8.2–8.3: przeszkody Pracu i Amic, kózki-wzmacniacze, Basen Humbaka, pakiet startowy z dawnej gry, samouczek, podmiana) — w planie (Analiza 3, rozdz. 8.9).

## Pliki

| Plik                    | Rola                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`            | strona gry: nagłówek (Menu, ukryty tytuł, karty zamówień trzech sąsiadek, liście i gwiazdki), podpowiedź, płótno planszy, pasek (Sowia doniczka, kompost), notka o prototypie         |
| `style.css`             | układ strony (siatka na całą wysokość ekranu), karty zamówień, portfel, wygląd paska i notki, warianty dla wąskich, niskich i wysokich ekranów oraz telefonu poziomo                  |
| `package.json`          | `{"type": "module"}` — pliki `.js` folderu to moduły ES (Node w testach jednostkowych)                                                                                                |
| `config.js`             | dane gry: identyfikator, wersja zapisu, pole podglądu, plansza, łańcuchy i hybrydy, doniczka (łańcuchy z progami), sąsiadki i zamówienia, nagrody, dźwięk, przedmioty startowe        |
| `board.js`              | czysta logika planszy (bez DOM): tworzenie, ruchy (przeniesienie, łączenie, hybryda, zamiana), wolne pola, kompost, wyjścia z zapchanej planszy                                       |
| `game.js`               | stan gry (wersja 2) i silnik: doniczka z ładunkami i losowaniem łańcucha, ruchy z nagrodami, hybrydy, kompost, zamówienia sąsiadek, gwiazdki, statystyki, kolejka zdarzeń             |
| `render.js`             | rysowanie planszy na płótnie: szklarnia z półkami, rośliny (z `plants.js`), zaznaczenie, uniesiony przedmiot, podświetlenie celu, napisy „+N”; karty zamówień (główka sowy i roślina) |
| `plants.js`             | rysunki roślin kształtami na płótnie (cztery łańcuchy po 5 poziomów i hybrydy) — wspólne dla planszy i kart zamówień                                                                  |
| `main.js`               | strona gry: wczytanie i zapis stanu, pętla klatek, obsługa wskaźnika (przeciąganie i stuknięcia), przyciski, karty zamówień, komunikaty, haki testowe                                 |
| `docs/README.md`        | instrukcja dla gracza (po polsku)                                                                                                                                                     |
| `docs/Documentation.md` | ten plik                                                                                                                                                                              |

Testy: `tests/unit/lacz-plansza.test.mjs` (logika), `tests/e2e/telefon/lacz.spec.js` (strona na telefonach), wpis podglądu w `tests/e2e/telefon/menu.spec.js`; folder jest dopisany w `eslint.config.js` (moduły ES), `package.json` (`format`, `format:check`, `html`), `tests/unit/architecture.test.mjs` (`newGamePages`, `projectScripts`), `tests/unit/pwa.test.mjs` i `tests/unit/owl-gallery.test.mjs`.

## Smaczki dawnej Sowiej Szklarni do przeniesienia (kroki 8.1–8.3)

Z dawnej gry (`SowiaSzklarnia/script.js`) do nowej trafią (Analiza 2, rozdz. 3.5):

- ✅ (E8b1) **Rośliny** jako łańcuchy po 5 poziomów: Monstera (Monstera Miziasta), Pilea (Pilea Pieniążek), Paproć (Paproć Puchata), Kaktus (Kaktus Pracu).
- ✅ (E8b1) **Hybrydy** jako połączenie dwóch różnych roślin najwyższego poziomu: Monpilea Przytulna (Monstera + Pilea), Alopaproć Wachlarzowa (w dawnej grze Paproć + Alokazja; Alokazji nie ma wśród łańcuchów nowej gry, więc tu **Paproć + Kaktus**), Złotolistka (Monpilea + Alopaproć).
- **Pomieszczenia szklarni** odnawiane gwiazdkami z zamówień: Doniczarnia 🪴, Sala Upraw 🌿, Zraszalnia 💧, Sadzonkarnia 🌱, Krzyżówkarium 🧬, Laboratorium Pyłku 🔬, Kompostownia 🪱, Płotek Antykozi 🎀, Sowie Centrum 🦉, Kącik Drzemki 🌙.
- **Kompost** (dawna Kompostownia) — w prototypie już jest jako kompostownik.
- **Kozy** zmieniają rolę: zamiast szkodników („SIO! SIO!”) są kózkami-wzmacniaczami (Skoczek, Zjadaczka, Dżoker, Sprężynka, Taran).
- **Pakiet startowy** z dawnego stanu (`state`, `saveVersion: 1`): liście → waluta, liczba pomieszczeń → odnowione pomieszczenia, hybrydy (`summary.hybrids`).

## `index.html`

- `<html lang="pl" class="sowie-shell">`, `<body data-sowie-game="szklarnia">` (tak strona przedstawia się wspólnym modułom).
- W `<head>`: meta `viewport` z `viewport-fit=cover`, `theme-color` `#dff7ea`, opis, tytuł „Łącz i Hoduj (prototyp) — SowieGry”, manifest i ikony PWA (`../manifest.webmanifest`, `../assets/icons/icon.svg`, `apple-touch-icon.png`, `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-title` „SowieGry”).
- Skrypty w kolejności: `../config/firebase-config.js`, `../shared/sowie-platform.js`, `../shared/sowie-cloud.js`, `../shared/password-gate.js`, `../shared/pwa.js`; preload czcionki `../assets/fonts/fredoka-700.woff2`; style `../shared/cute-ui.css`, `../shared/world/tokens.css`, `../shared/ui/ui.css`, `style.css`; z `defer`: `../shared/sowie-academy.js`, `../shared/owl-gallery.js`; moduł `main.js`. Strona **nie** ładuje `shared/gameplay-expansion.js` (nowa gra — metryki Akademii przez most `SowieProgress`).
- `<main class="lacz" data-lacz aria-label="Łącz i Hoduj">` zawiera po kolei:
  1. `<header class="lacz-top">`: link `a.sowie-ui-button.is-quiet.lacz-back` „Menu” (`href="../"`), `<h1 class="lacz-title">Łącz i Hoduj</h1>` (widoczny tylko dla czytników ekranu), `div.lacz-orders[data-orders]` (`role="group"`, `aria-label="Zamówienia sowich sąsiadek"`) z trzema przyciskami `button.lacz-order[data-order="0|1|2"]` — w każdym `<canvas aria-hidden="true">` i `span.lacz-order-count[data-order-count]` — oraz `div.lacz-wallet` (`aria-live="off"`) z dwoma wierszami `span.lacz-wallet-row`: `<strong data-leaves>0</strong>`, `<span aria-hidden="true">🍃</span>`, `<span class="lacz-sr">liści</span>` i (`is-stars`) `<strong data-stars>0</strong>`, `<span aria-hidden="true">⭐</span>`, `<span class="lacz-sr">gwiazdek odnowy</span>`.
  2. `<p class="lacz-hint" data-hint aria-live="polite">` — tekst startowy „Przeciągnij roślinę na taką samą — urośnie!”.
  3. `div.lacz-board` z `<canvas data-canvas tabindex="0" aria-label="Półki szklarni: 7 kolumn, 9 rzędów">`.
  4. `div.lacz-bar`: przycisk `button.sowie-ui-button.is-primary.lacz-pot[data-pot]` z dwoma `<span>`: „🌱 Sowia doniczka” i `span.lacz-charges[data-charges]` „12/12”; przycisk `button.sowie-ui-button.lacz-compost[data-compost]` z `aria-label="Kompostownik — usuń roślinę"` i tekstem „♻️ Kompost”.
  5. `p.lacz-preview`: „Prototyp nowej Szklarni. Postęp zapisuje się osobno — dawna gra (Sowia Szklarnia) zostaje bez zmian.” z linkiem `../SowiaSzklarnia/`.

## `style.css`

Czcionka: `var(--czcionka-sowia)` (Fredoka z `shared/world/tokens.css`), kolor tekstu `var(--kontur)`, tło strony `#e8f7ee`; `html, body { height: 100%; margin: 0 }`.

- `.lacz` — siatka `grid-template-columns: minmax(0, 1fr)` (płótno nie rozpycha kolumny) i `grid-template-rows: auto auto minmax(0, 1fr) auto auto` (nagłówek, podpowiedź, plansza, pasek, notka), `gap: 6px`, `height: 100dvh`, `max-width: 560px`, `margin: 0 auto`, padding `max(6px, env(safe-area-inset-*))` z każdej strony, `box-sizing: border-box`. Plansza dostaje całą resztę wysokości.
- `.lacz-top` — siatka `auto minmax(0, 1fr) auto`, `align-items: center`, `gap: 8px`.
- `.lacz-back` — `box-sizing: border-box; min-height: 44px; padding: 0 12px; text-decoration: none` (wspólny przycisk ma `min-height: 52px` i padding 8 px — tutaj niższy, żeby nagłówek miał 44 px).
- `.lacz-title`, `.lacz-sr` — tylko dla czytników ekranu: `position: absolute; width: 1px; height: 1px; margin: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap` (nazwa gry jest w `<title>` i `aria-label` strony; w nagłówku stoją zamówienia). Tytuł nie zajmuje komórki siatki nagłówka (element wyjęty z przepływu), więc zamówienia trafiają do środkowej kolumny.
- `.lacz-orders` — siatka `repeat(3, minmax(0, 1fr))`, `gap: 4px`, `min-width: 0`.
- `.lacz-order` — `position: relative; box-sizing: border-box; min-width: 0; height: 44px; padding: 0`, ramka `2px solid var(--sasiadka, var(--monstera))` (kolor chustki sąsiadki ustawia `main.js`), `border-radius: 12px`, tło `var(--bialy)`, kolor `var(--kontur)`, `font: inherit`, `cursor: pointer`, `touch-action: manipulation`; płótno `display: block; width: 100%; height: 100%; border-radius: 10px`; `.lacz-order-count` — w prawym dolnym rogu (`right: 3px; bottom: 1px`), 12 px, `line-height: 1`.
- `.lacz-order.is-ready` — gotowe do oddania: ramka `var(--monstera)`, tło `#e3f8ea`; `::after` — znaczek „✓”: kółko 18 px `var(--monstera)` z białym znakiem 12 px, `top: -6px; right: -5px`.
- `.lacz-order.is-target` — cel upuszczenia przeciąganej rośliny: `box-shadow: 0 0 0 4px var(--monstera)`.
- `.lacz-wallet` — siatka z `justify-items: end`, `padding-right: 2px` (obrys liczby nie wychodzi poza ekran), `line-height: 1.1`; `.lacz-wallet-row` — `display: flex; align-items: baseline; gap: 2px`, 12 px, bez zawijania; `strong` 18 px, cyfry tabelaryczne, biały z obrysem `-webkit-text-stroke: 4px var(--kontur)` i `paint-order: stroke fill`; w wierszu gwiazdek (`.is-stars`) 15 px w kolorze `var(--zloto)`.
- `.lacz-hint` — zawsze **jeden wiersz** (`overflow: hidden; white-space: nowrap; text-overflow: ellipsis`), 14 px, `line-height: 1.3`, wyśrodkowany, `margin: 0` — zmiana tekstu nie przesuwa planszy.
- `.lacz-board` — **gniazdo** planszy: `display: grid; place-items: center; min-width: 0; min-height: 0; overflow: hidden`; rozmiar płótna ustawia `render.js` (siatka z ramką, nie większa niż gniazdo), więc płótno stoi na środku gniazda, a na wysokim telefonie wolne miejsce rozkłada się nad i pod planszą. Płótno: `display: block; border-radius: 18px; box-shadow: 0 2px 8px rgba(59, 47, 74, 0.15); touch-action: none` (przeglądarka nie przewija strony przy przeciąganiu), `cursor: grab`.
- `.lacz-bar` — siatka `minmax(0, 2fr) minmax(0, 1fr)`, `gap: 8px`; przyciski `min-height: 52px`, 15 px.
- `.lacz-pot` — `display: flex; justify-content: space-between; gap: 8px`; `.lacz-charges` — cyfry tabelaryczne.
- `.lacz-compost.is-target` — kompostownik jako cel upuszczenia: tło `var(--monstera-jasna)`, `box-shadow: 0 0 0 4px var(--monstera)`.
- `.lacz-preview` — `margin: 0`, 12 px, `opacity: 0.8`.
- `@media (max-width: 340px)` — boczny padding `max(2px, env(safe-area-inset-right/left))` (na 320 px płótno ma 316 px: 7 pól po 44 px i przerwy 1 px); nagłówek `gap: 4px`, `.lacz-back` `padding: 0 8px` (więcej miejsca na zamówienia — karty po 72 px).
- `@media (min-height: 700px)` — karty zamówień wysokości 52 px.
- `@media (max-height: 600px)` — `.lacz-preview { display: none }`, podpowiedź 13 px (więcej miejsca na planszę).
- `@media (orientation: landscape) and (max-height: 500px)` — **telefon poziomo**: `.lacz` w dwóch kolumnach `minmax(0, 1fr) minmax(200px, 32%)`, wiersze `auto auto minmax(0, 1fr) auto`, obszary `"board top" "board hint" "board ." "board bar"`, `max-width: none`; plansza (`grid-area: board`) po lewej na całą wysokość, po prawej nagłówek w dwóch wierszach (`row-gap: 6px`; w pierwszym `.lacz-back` w kolumnie 1 i `.lacz-wallet` w kolumnie 3, w drugim `.lacz-orders` na całą szerokość — `grid-column: 1 / -1`), podpowiedź (`white-space: normal`, `min-height: 2.6em` — do dwóch wierszy) i pasek z przyciskami jeden pod drugim (`grid-template-columns: minmax(0, 1fr)`, 14 px); notka o prototypie ukryta.

Na 320 × 568: nagłówek 44 px (Menu, trzy karty zamówień po 72 × 44 px, portfel), podpowiedź 17 px, gniazdo 316 × 419 px, płótno 316 × 416 px (pole **44 px**), pasek 52 px. Na 390 × 844 pole 49 px (płótno 378 × 484). Telefon poziomo (plansza obrócona do 9 × 7): 844 × 390 — pole 49 px, 667 × 375 — 45 px; na najmniejszym (568 × 320) — 37 px (mniej niż 44 px nie da się uniknąć przy 7 rzędach na 308 px wysokości; gra jest przewidziana głównie na telefon pionowo).

## `config.js`

| Stała              | Wartość                                                          | Znaczenie                                                                                                                              |
| ------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `GAME_ID`          | `"szklarnia"`                                                    | identyfikator w bazie (stały)                                                                                                          |
| `SAVE_VERSION`     | `2`                                                              | wersja stanu nowej gry (dawna Szklarnia zapisuje wersję 1)                                                                             |
| `PREVIEW_FIELD`    | `"preview"`                                                      | pole dokumentu `sowiegry/profil/sowiegry_gry/szklarnia`, w którym podgląd trzyma swój stan (JSON); pole `state` zostaje dla dawnej gry |
| `BOARD`            | `{ cols: 7, rows: 9 }`                                           | plansza (63 pola)                                                                                                                      |
| `CHAINS`           | tabela niżej                                                     | łańcuchy i hybrydy; najwyższy poziom nie łączy się z takim samym                                                                       |
| `HYBRIDS`          | tabela niżej                                                     | przepisy hybryd: para łańcuchów (kolejność dowolna) → hybryda; liście za skrzyżowanie i za kompost hybrydy                             |
| `POT`              | `{ max: 12, regen: 3, chain: "monstera", chains: [...] }`        | Sowia doniczka: najwyżej 12 ładunków, jeden wraca co 3 s; `chain` — łańcuch przedmiotów startowych; `chains` — tabela niżej            |
| `MERGE_LEAVES`     | `[0, 0, 1, 3, 8, 20]`                                            | liście za połączenie, według poziomu **wyniku** (indeks = poziom)                                                                      |
| `COMPOST_LEAVES`   | `[0, 1, 2, 4, 10, 25]`                                           | liście za kompost, według poziomu **usuniętego** przedmiotu                                                                            |
| `NEIGHBORS`        | tabela niżej                                                     | trzy sowie sąsiadki (każda ma zawsze jedno zamówienie)                                                                                 |
| `ORDERS`           | tabela niżej                                                     | zasady i nagrody zamówień                                                                                                              |
| `GAME_SOUNDS`      | `["klik", "ladowanie", "polaczenie", "lisc", "rekord", "slizg"]` | efekty wczytywane po pierwszym dotknięciu (od uwagi właściciela L1)                                                                    |
| `GREENHOUSE_MUSIC` | `"szklarnia"`                                                    | motyw szklarni (`assets/audio/music/szklarnia.mp3`, 76 BPM, `scripts/make-audio.mjs` — `greenhouseTheme`)                              |
| `START_ITEMS`      | `[[30, 1], [31, 1], [24, 1], [38, 2], [39, 2]]`                  | nowa gra: [indeks pola, poziom] — trzy nasionka i dwa kiełki (od razu dwie pary do połączenia)                                         |

`CHAINS` (`{ name, color, levels, hybrid? }`; `color` — zieleń rysunku, `levels` — nazwy poziomów od 1):

| Klucz         | `name`      | `color`   | `levels`                                                                      |
| ------------- | ----------- | --------- | ----------------------------------------------------------------------------- |
| `monstera`    | Monstera    | `#3fae6a` | Nasionko, Kiełek, Sadzonka, Monstera, Złota Monstera                          |
| `pilea`       | Pilea       | `#72bd68` | Ziarenko pilei, Listek pilei, Pieniążek, Pilea, Złota Pilea                   |
| `paproc`      | Paproć      | `#4b9e72` | Zarodnik, Pastorał, Młoda paproć, Paproć, Złota Paproć                        |
| `kaktus`      | Kaktus      | `#5ba760` | Pestka kaktusa, Kuleczka, Kaktusik, Kaktus, Kwitnący Kaktus                   |
| `monpilea`    | Monpilea    | `#68c582` | Monpilea Przytulna (`hybrid: true` — jeden poziom, nie łączy się z taką samą) |
| `alopaproc`   | Alopaproć   | `#3fa976` | Alopaproć Wachlarzowa (`hybrid: true`)                                        |
| `zlotolistka` | Złotolistka | `#caa34a` | Złotolistka (`hybrid: true`)                                                  |

`HYBRIDS` (`{ parents, leaves, compost }`):

| Hybryda       | `parents`                   | `leaves` | `compost` |
| ------------- | --------------------------- | -------- | --------- |
| `monpilea`    | `["monstera", "pilea"]`     | 60       | 50        |
| `alopaproc`   | `["paproc", "kaktus"]`      | 60       | 50        |
| `zlotolistka` | `["monpilea", "alopaproc"]` | 200      | 150       |

Składniki pierwszych dwóch hybryd to rośliny **poziomu 5** (np. Złota Monstera + Złota Pilea), Złotolistki — dwie hybrydy.

`POT.chains` (`{ chain, weight, unlock }` — łańcuch wchodzi do doniczki, gdy `stats.merges ≥ unlock`; losowanie z wagami spośród odblokowanych):

| `chain`    | `weight` | `unlock` (połączeń) |
| ---------- | -------- | ------------------- |
| `monstera` | 4        | 0                   |
| `pilea`    | 3        | 10                  |
| `paproc`   | 2        | 30                  |
| `kaktus`   | 2        | 60                  |

Połączenie i skrzyżowanie hybrydy liczą się tak samo (`stats.merges + 1`).

`NEIGHBORS` (`{ id, name, color }`, kolejność = miejsce karty):

| `id`         | `name`           | `color`   |
| ------------ | ---------------- | --------- |
| `puszczyk`   | Pani Puszczykowa | `#a8784f` |
| `plomykowka` | Płomykówka Pola  | `#e7b45c` |
| `pojdzka`    | Pójdźka Pela     | `#8f9bb8` |

`ORDERS`:

| Pole           | Wartość                | Znaczenie                                                                                  |
| -------------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| `startLevel`   | 2                      | najwyższy poziom zamówień na starcie                                                       |
| `levelEvery`   | 3                      | co tyle wykonanych zamówień najwyższy poziom rośnie o 1 (do 5); zakres to 3 poziomy (od 2) |
| `pairUpTo`     | 3                      | zamówienia do tego poziomu mogą być na dwie sztuki                                         |
| `pairChance`   | 0,35                   | szansa na dwie sztuki                                                                      |
| `hybridFrom`   | 8                      | od tylu wykonanych zamówień sąsiadki proszą czasem o hybrydę                               |
| `hybridChance` | 0,15                   | szansa na hybrydę (tylko Monpilea i Alopaproć, gdy oba ich łańcuchy są w doniczce)         |
| `leaves`       | `[0, 2, 4, 9, 20, 45]` | liście za sztukę według poziomu                                                            |
| `stars`        | `[0, 1, 1, 1, 2, 3]`   | gwiazdki odnowy za zamówienie według poziomu (+1 za drugą sztukę)                          |
| `hybridLeaves` | 90                     | liście za zamówienie hybrydy                                                               |
| `hybridStars`  | 4                      | gwiazdki za zamówienie hybrydy                                                             | Wszystkie obiekty są zamrożone (`Object.freeze`). |

## `board.js` — plansza

Przedmiot: `{ chain, level }` (poziom od 1), puste pole: `null`. Plansza: `{ cols, rows, cells }`, pola wierszami (indeks = `row * cols + col`).

- `maxLevel(chain)` — liczba poziomów łańcucha (`CHAINS[chain].levels.length`, nieznany — 0).
- `itemName(item)` — nazwa poziomu, np. „Kiełek” (pusty — `""`).
- `createBoard({ cols, rows, cells = null })` — nowa plansza; z `cells` (zapis) przepisuje tylko poprawne przedmioty (znany łańcuch, poziom 1…max; poziom zaokrąglony w dół), resztę zamienia na `null`.
- `cellIndex(board, col, row)`, `cellPosition(board, index)` → `{ col, row }`.
- `emptyCells(board)` — indeksy wolnych pól (rosnąco).
- `canMerge(a, b)` — ten sam łańcuch i poziom, poziom poniżej najwyższego.
- `isTop(item)` — przedmiot ma najwyższy poziom swojego łańcucha (hybryda ma jeden poziom, więc zawsze).
- `hybridOf(a, b)` — oba przedmioty `isTop`, różne łańcuchy i para jest w `HYBRIDS` (`parents` w dowolnej kolejności) → klucz hybrydy (np. `"monpilea"`), inaczej `null`.
- `moveItem(board, from, to)` → `{ type, item }` (sprawdzane w tej kolejności):
  - `"none"` — to samo pole, puste pole źródłowe albo cel poza planszą (bez zmian);
  - `"move"` — cel pusty: przeniesienie;
  - `"merge"` — `canMerge`: na polu docelowym przedmiot o poziom wyżej, źródło puste;
  - `"hybrid"` — `hybridOf`: na polu docelowym hybryda `{ chain: klucz, level: 1 }`, źródło puste;
  - `"swap"` — inny przedmiot (także dwa takie same najwyższego poziomu albo dwie takie same hybrydy): zamiana miejscami.
- `spawnItem(board, item, random = Math.random)` — kopia przedmiotu na polu `free[floor(random() * free.length)]` → indeks albo `-1` (plansza pełna).
- `removeItem(board, index)` — usunięcie (kompost) → przedmiot albo `null`.
- `mergeablePairs(board)` — liczba par do połączenia: dla każdej grupy `łańcuch:poziom` (bez najwyższych) `floor(liczba / 2)`, plus po jednej parze na każdy przepis `HYBRIDS`, którego oba łańcuchy mają na planszy przedmiot najwyższego poziomu; każdy przedmiot można przenieść w dowolne miejsce, więc liczy się sam skład planszy.
- `exits(board)` → `{ merges, empty, compost }` — pary, wolne pola, przedmioty do kompostu. **Plansza nigdy nie blokuje się bez wyjścia:** pełna plansza bez par ma zawsze `compost > 0` (kompost zwalnia pole, a doniczka znowu działa) — sprawdza to test jednostkowy na 200 losowych planszach i na pełnej planszy bez par.
- `serializeCells(board)` — kopia pól do zapisu (`{ chain, level }` albo `null`).

## `game.js` — stan i silnik

Stan (wersja 2, zapisywany jako JSON w polu `preview`):

```js
{
  version: 2,
  createdAt, savedAt,            // ms (Date.now)
  cells: [...63 pól],            // { chain, level } | null
  leaves: 0,                     // liście monstery (waluta)
  stars: 0,                      // gwiazdki odnowy (z zamówień; na odnawianie pomieszczeń — E8b3)
  pot: { charges: 12, progress: 0 },   // ładunki doniczki i postęp następnego (0…1)
  orders: [                      // po jednym zamówieniu każdej sąsiadki (kolejność jak NEIGHBORS)
    { neighbor: "puszczyk", chain: "monstera", level: 2, count: 1 }, …
  ],
  stats: { merges: 0, spawns: 0, composted: 0, best: 2, moves: 0, hybrids: 0, orders: 0 },
}
```

- `potChains(merges)` — wpisy `POT.chains` z `unlock ≤ merges` (kolejność z tabeli).
- `pickChain(merges, random = Math.random)` — losowanie z wagami: `roll = random() · suma wag`, kolejno odejmowana waga wpisu, pierwszy z `roll < 0` (zabezpieczenie — ostatni wpis).
- `neighborOf(id)` — wpis `NEIGHBORS` albo `null`.
- `orderLevels(done)` → `{ min, max }`: `max = min(5, startLevel + floor(done / levelEvery))`, `min = max(2, max − 2)` (0 zamówień — tylko poziom 2; 3 — 2…3; 9 i więcej — 3…5).
- `makeOrder(neighbor, { done, merges }, random = Math.random, taken = [])` → `{ neighbor, chain, level, count }`; do 5 losowań, aż zamówienie nie powtarza łańcucha i poziomu żadnego z `taken` (inaczej ostatnie). Jedno losowanie, w tej kolejności wywołań `random()`: (1) tylko gdy `done ≥ hybridFrom` i istnieje hybryda, której oba łańcuchy są odblokowane w doniczce (`potChains(merges)`; Złotolistka nigdy) — `random() < hybridChance` → hybryda `hybrids[floor(random() · liczba)]`, poziom 1, 1 sztuka; (2) łańcuch `pickChain(merges, random)`; (3) poziom `min + floor(random() · (max − min + 1))`; (4) tylko dla poziomu ≤ `pairUpTo` — `random() < pairChance` → 2 sztuki, inaczej 1.
- `validOrder(order, neighbor)` — obiekt z `neighbor` równym kluczowi sąsiadki, znanym łańcuchem, całkowitym poziomem 1…max i `count` 1 albo 2.
- `orderReward(order)` → `{ leaves, stars }`: hybryda — `hybridLeaves` i `hybridStars`; roślina — `leaves[poziom] · count` i `stars[poziom] + count − 1`.
- `orderCells(cells, order, prefer = -1)` — indeksy `count` pól z przedmiotem tego samego łańcucha i poziomu (najpierw `prefer`, jeśli pasuje, potem rosnąco) albo `null`, gdy jest ich za mało.
- `fillOrders(saved, stats, random)` (wewnętrzna) — dla każdej sąsiadki: poprawne zamówienie z zapisu (kopia czterech pól) albo nowe `makeOrder` (z `taken` = zamówienia już ustalone).

- `defaultState(now = Date.now(), random = Math.random)` — plansza z `START_ITEMS` (łańcuch `POT.chain`), pełna doniczka, `stats.best = 2` (na starcie są kiełki), `stars: 0`, zamówienia z `fillOrders(null, …)` (na starcie: Kiełek Monstery, 1 albo 2 sztuki).
- `loadState(raw, now, random = Math.random)` — `raw` nie jest obiektem albo `version !== 2` (np. stan dawnej Szklarni) → `defaultState(now)`. W przeciwnym razie: domyślne wartości nadpisane zapisem, pola przez `createBoard` (niepoprawne przedmioty → puste; hybrydy to zwykłe klucze `CHAINS` z poziomem 1), `leaves` liczbowo (nie-liczba → 0), `pot.charges` w 0…12, `pot.progress` w 0…1, `stats` uzupełnione domyślnymi (zapis sprzed E8b1 dostaje `hybrids: 0`, sprzed E8b2 — `orders: 0`), `stars` liczbowo i nie mniej niż 0, `orders` przez `fillOrders(raw.orders, stats, random)` (brakujące i niepoprawne — nowe), `version: 2`.
- `createGame({ state = defaultState(), random = Math.random })` → `{ state, board, update, tapPot, move, compost, orderCells, deliver, takeEvents }`; plansza tworzona z `state.cells`, po każdej zmianie `state.cells = serializeCells(board)`.
  - `update(dt)` — ładowanie doniczki: przy pełnej `progress = 0`; inaczej `progress += dt / POT.regen`, każde pełne 1 → +1 ładunek (do `max`).
  - `tapPot()` — bez ładunku: zdarzenie `potEmpty`, `-1`; brak wolnego pola: `boardFull`, `-1` (**ładunek zostaje**); inaczej nasionko `{ chain: pickChain(stats.merges, random), level: 1 }` na losowym wolnym polu (najpierw losowany łańcuch, potem pole), `charges − 1`, `stats.spawns + 1`, zdarzenie `spawn { index, item }`, zwraca indeks.
  - `move(from, to)` — `moveItem`; przy `"none"` nic; inaczej `stats.moves + 1`; połączenie: `leaves += MERGE_LEAVES[poziom wyniku]`, `stats.merges + 1`, `stats.best = max(best, poziom)`, zdarzenie `merge { from, to, item, leaves, top }` (`top` — wynik ma najwyższy poziom); hybryda: `leaves += HYBRIDS[klucz].leaves`, `stats.merges + 1`, `stats.hybrids + 1`, zdarzenie `hybrid { from, to, item, leaves }`; przeniesienie i zamiana: zdarzenia `move` / `swap { from, to }`. Po ruchu: dla każdego łańcucha, który właśnie wszedł do doniczki (`potChains` po ruchu dłuższe niż przed), zdarzenie `unlock { chain, name }` (`name` z `CHAINS`).
  - `compost(index)` — usunięcie przedmiotu, `leaves += HYBRIDS[łańcuch].compost` dla hybrydy, inaczej `COMPOST_LEAVES[poziom]`, `stats.composted + 1`, zdarzenie `compost { index, item, leaves }`, zwraca przedmiot (puste pole — `null`).
  - `orderCells(slot, prefer = -1)` — `orderCells` dla zamówienia z miejsca `slot` (brak zamówienia — `null`).
  - `deliver(slot, prefer = -1)` — za mało roślin: zdarzenie `orderMissing { slot, order }`, `null`; inaczej usunięcie pól z `orderCells` (najpierw `prefer` — przeciągnięta albo zaznaczona roślina), `leaves` i `stars` z `orderReward`, `stats.orders + 1`, zdarzenie `order { slot, order, cells, leaves, stars }`, nowe zamówienie tej samej sąsiadki (`makeOrder` z bieżącymi `stats.orders` i `stats.merges`, `taken` = oddane zamówienie i dwa pozostałe) i zdarzenie `newOrder { slot, order }`; zwraca nagrodę. Oddanie nie liczy się jako połączenie.
  - `takeEvents()` — zabiera i zwraca kolejkę zdarzeń.

## `render.js` — rysowanie

Wszystko w pikselach CSS płótna (`setTransform(ratio, …)`, `ratio = min(2, devicePixelRatio)`).

- `LIFT = 0.9` — uniesienie przeciąganego przedmiotu nad palec (w rozmiarach pola).
- `boardLayout(width, height, cols, rows)` → `{ size, gap, x, y, width, height }`: na wąskim płótnie (`width < 360`) margines i przerwa po **1 px**; inaczej margines `max(4, 1,5% krótszego boku)`, przerwa `max(2, 0,8% krótszego boku)`. `size = max(1, floor(min((width − 2·pad − gap·(cols − 1)) / cols, (height − 2·pad − gap·(rows − 1)) / rows)))`; siatka wyśrodkowana w płótnie.
- `boardFrame(layout) = max(6, 3 · gap)` — ramka płótna wokół siatki (zawsze nie mniejsza niż margines układu).
- `createBoardRenderer({ canvas, cols, rows })` →
  - `resize()` — miejsce z `getBoundingClientRect()` **rodzica** płótna (gniazdo); układ liczony w dwóch ułożeniach: zwykłym (`cols × rows`) i **obróconym** (`rows × cols` — transpozycja: kolumna logiczna to rząd na ekranie); `transposed` = obrócone daje większe pole (telefon poziomo). Płótno dostaje rozmiar CSS `min(gniazdo, ceil(siatka + 2 · boardFrame))` w obu wymiarach (`canvas.style.width/height`), bufor `round(rozmiar · ratio)`, potem ostateczny układ dla tego rozmiaru (w wybranym ułożeniu). Transpozycja zachowuje sąsiedztwo pól, a logika gry (`board.js`, `game.js`) jej nie widzi;
  - `cellAt(x, y)` — pole pod punktem (także w przerwie — pole na lewo/w górę) albo `-1` poza siatką; w obróconej planszy kolumna na ekranie to rząd logiczny i odwrotnie;
  - `cellCenter(index)` → `{ x, y }` (z uwzględnieniem obrotu); `layout()` — kopia układu z polem `transposed`; `size()` — kopia;
  - `pop(index)` — „pyknięcie” pola: przez 0,3 s skala `1 + sin(t / 0,3 · π) · 0,25`;
  - `popup(text, x, y, color = COLORS.bialy, textSize = 18)` — napis „+N” unoszący się 40 px/s i znikający w 1 s (obrys 4 px `COLORS.kontur`, najwyżej 10 naraz);
  - `draw({ cells, selected = -1, drag = null, time = 0, dt = 0 })`.
- **Tło (szklarnia; deski półek pod każdym rzędem na ekranie — w obróconej planszy 7 desek):** pionowy gradient `#dff7ea` → `#bfe8cf`; pionowe szprosy (`rgba(78, 130, 105, 0.22)`, 2 px) co 1/3 szerokości od 1/6; odblask szyby — biała elipsa `rgba(255, 255, 255, 0.35)` w prawym górnym rogu, kołysząca się `sin(time · 0,3) · 6` px; pod każdym rzędem deska półki `#b9895a` (wysokość 6 px, zaokrąglenie 3, wystaje 4 px na boki, 3 px nad dołem pola) z cieniem `rgba(59, 47, 74, 0.12)` 2 px; każde pole — jasne miejsce `rgba(255, 255, 255, 0.45)` (zaokrąglenie 20% pola).
- **Cel przeciągania:** pole, na które spadnie przedmiot — zielone `rgba(63, 174, 106, 0.45)` przy połączeniu, niebieskie `rgba(92, 200, 232, 0.4)` przy przeniesieniu i zamianie; nad kompostem bez podświetlenia pola.
- **Rośliny** — `createPlantPainter(context).item(…)` z `plants.js` (rozdział niżej).
- **Zaznaczenie** (stuknięcie, bez przeciągania): złota ramka `COLORS.zloto` 4 px.
- **Przeciąganie:** przedmiot z pola źródłowego znika z planszy i jest rysowany powiększony ×1,15 w punkcie `(x, y − LIFT · s)` — nad palcem — z cieniem (elipsa `rgba(59, 47, 74, 0.2)`) pod palcem; **bez cyfry poziomu** (`item(…, label = false)`), żeby nie zasłaniał cyfry pola docelowego.
- `drawOrderCard(canvas, order, color)` — karta zamówienia: bufor płótna `round(rozmiar CSS · ratio)` (`ratio = min(2, devicePixelRatio)`, zmieniany tylko przy innym rozmiarze), czyszczenie, **główka sowy** `owlHead` w kolorze chustki (promień `r = min(9, 0,2 · wysokość)`, środek `(r + 3, r + 4)`): dwa trójkątne uszka, koło, białe oczy (promień 0,34 r, ±0,4 r w bok) ze źrenicami `COLORS.kontur` (0,16 r), dziobek `COLORS.dziobek` (trójkąt pod oczami); potem roślina zamówienia `item(order, szerokość / 2 + 0,5 r, wysokość / 2 + 0,04 s, s)` z cyfrą poziomu, `s = min(wysokość, szerokość − 1,5 r)`, `time = 0` (rysunek nieruchomy).

## `plants.js` — rysunki roślin

`createPlantPainter(context)` → `{ item(target, cx, cy, s, time = 0, label = true) }` — rysuje przedmiot `{ chain, level }` w środku `(cx, cy)` na polu wielkości `s` (w bieżącej transformacji płótna; plansza rysuje przedmioty w `(0, 0)` po `translate` i `scale`). Pomocnicze `roundRect(x, y, w, h, r)` — wypełniony zaokrąglony prostokąt.

- **Rośliny** (`item(target, cx, cy, s, time = 0, label = true)`; `bottom = cy + 0,32 s`; kołysanie `sway = sin(time · 1,8 + cx · 0,05) · 0,06` rad; `green` = `CHAINS[łańcuch].color`, `dark` = `COLORS.monsteraCiemna`; poziom 5 Monstery, Pilei i Paproci — złoto: `green = COLORS.zloto`, `dark = COLORS.zlotoCiemne`; Kwitnący Kaktus zostaje zielony):
  - **podłoże:** poziomy 1–2 — kopczyk ziemi `#8a5a3b` (elipsa 0,3 s × 0,12 s w `bottom`); poziomy 3–5 — doniczka `COLORS.doniczka` szerokości `s · (0,36 + (poziom − 3) · 0,06)`, wysokości 0,26 s (zaokrąglenie 4), z ciemnym rantem `rgba(59, 47, 74, 0.18)` wysokości `max(2, 0,04 s)`; hybryda — doniczka szerokości 0,5 s ze **złotym rantem** `COLORS.zloto` wysokości `max(2, 0,06 s)`;
  - funkcje pomocnicze: `leaf(x, y, angle, length, width, color, holes)` — elipsa od punktu w kierunku kąta (przy `holes` dwa białe wycięcia `rgba(255, 255, 255, 0.55)` na 0,35 i 0,6 długości); `stem(x0, y0, x1, y1, width, color)` — kreska z okrągłymi końcami; `coin(x, y, r, color)` — okrągły listek pilei z jaśniejszym środkiem (`rgba(255, 255, 255, 0.35)`, promień 0,25 r); `frond(x, y, angle, length, color)` — liść paproci: łuk `quadraticCurveTo(0,25 L, −0,6 L, 0, −L)` (grubość `max(1,5, 0,06 L)`) i po 5 par listków-elips wzdłuż łuku (`u = k/6`, rozmiar `0,13 L · (1 − u/2)`, spłaszczenie 0,45, obrót ±0,5);
  - **poziom 1** (`seedShape`): Monstera — elipsa `#a0703f` 0,12 s × 0,16 s; Pilea — `#c58f52` 0,1 × 0,1; Kaktus — `#5b4a3a` 0,08 × 0,11 (wszystkie w `bottom − 0,12 s`, obrót 0,4, z białym połyskiem `rgba(255, 255, 255, 0.5)`); Paproć — trzy zarodniki-kropki `#7a9c5a` (promień 0,07 s; środkowa wyżej, w `bottom − 0,16 s`, boczne ±0,1 s w `bottom − 0,1 s`);
  - **Monstera** (`monsteraPlant`): 2 Kiełek — łodyżka `dark` (grubość `max(2, 0,05 s)`, od `bottom − 0,06 s` do `bottom − 0,36 s`) i dwa listki 0,24 s × 0,08 s pod kątem ±0,9 rad; 3 Sadzonka — 3 liście 0,32 s × 0,1 s co 0,6 rad z `bottom − 0,24 s`; 4–5 — 5 liści 0,42 s × 0,14 s co 0,5 rad z wycięciami; liście na zmianę `green` i `dark`;
  - **Pilea** (`pileaPlant`): okrągłe listki `coin` na cienkich ogonkach `stem` (grubość `max(1, 0,025 s)`, kolor `dark`) z punktu `bottom − 0,06 s` (poziom 2) albo `bottom − 0,24 s`; listki `[dx, wysokość, promień]` w ułamkach `s` (dx przesunięte o `sway · 0,4`): poziom 2 — `[−0,12, 0,26, 0,08]`, `[0,12, 0,3, 0,08]`; 3 — `[−0,18, 0,3, 0,1]`, `[0, 0,42, 0,11]`, `[0,18, 0,3, 0,1]`; 4–5 — `[−0,3, 0,28, 0,11]`, `[−0,16, 0,44, 0,12]`, `[0, 0,52, 0,13]`, `[0,16, 0,44, 0,12]`, `[0,3, 0,28, 0,11]`, `[0, 0,3, 0,1]`;
  - **Paproć** (`paprocPlant`): 2 Pastorał — pęd `green` (grubość `max(2, 0,05 s)`) od `bottom − 0,06 s` do `bottom − 0,3 s` zakończony zwiniętym łukiem (środek `+0,07 s`, promień 0,07 s, od π do 2,6π); 3 — 3 liście `frond` długości 0,36 s; 4–5 — 5 liści długości 0,48 s; rozstaw 0,45 rad z `bottom − 0,22 s`, na zmianę `green` i `dark`;
  - **Kaktus** (`kaktusPlant`): 2 Kuleczka — koło `green` promienia 0,12 s w `bottom − 0,13 s`; 3–5 — pień (zaokrąglony prostokąt szerokości 0,16 s / 0,2 s, wysokości 0,3 s / 0,44 s z `bottom − 0,24 s`) z ciemną pręgą `dark` 2 px; od 4 — dwa ramiona (po dwa zaokrąglone prostokąty: lewe niżej, prawe wyżej); kolce — 4 białe kwadraciki `rgba(255, 255, 255, 0.75)` (bok `max(1, 0,02 s)`); 5 Kwitnący Kaktus — kwiat na czubku: 5 płatków `COLORS.policzki` (elipsy 0,05 s × 0,035 s wokół środka w odległości 0,06 s) i złoty środek (promień 0,035 s);
  - **hybrydy** (`hybridPlant`, z punktu `bottom − 0,24 s`; za rośliną **złota poświata** `halo`: gradient promieniowy `rgba(244, 197, 66, 0.7)` → przezroczysty, promień 0,48 s, środek pola): Monpilea — 3 liście monstery z wycięciami (0,4 s × 0,13 s, kąty −0,55 / 0 / 0,55) w `COLORS.monstera` i dwa listki pilei `#72bd68` (promień 0,1 s, ±0,3 s w bok, 0,3 s wyżej); Alopaproć — wachlarz 7 liści paproci (długość 0,46 s, co 0,32 rad) na zmianę `#3fa976` i `COLORS.monsteraCiemna`; Złotolistka — z tyłu 4 liście paproci `COLORS.zlotoCiemne` (0,48 s, co 0,55 rad), z przodu 2 złote liście monstery z wycięciami (0,4 s × 0,14 s, ±0,5 rad) i trzy złote listki pilei (dwa `COLORS.zloto` promienia 0,09 s ±0,2 s w bok 0,36 s wyżej, środkowy `#fff1b8` promienia 0,1 s 0,44 s wyżej);
  - **iskierki** (`sparkles`) przy poziomie najwyższym i hybrydach: trzy białe romby migające `0,05 s · (0,6 + 0,4 · sin(time · 2 + k · 2,1))`;
  - **oznaczenie poziomu** w prawym górnym rogu pola (`font(max(9, round(0,2 s)))`, wyrównanie do prawej w `cx + 0,44 s`, `cy − 0,26 s`): cyfra `rgba(59, 47, 74, 0.7)`, u hybrydy gwiazdka „★” w `COLORS.zlotoCiemne`.

## `main.js` — strona gry

Stałe: `SAVE_EVERY = 20` (s gry), `IMPORTANT_DELAY = 2000` (ms), `DRAG_START = 8` (px).

- **Start:** `createBoardRenderer`, `fitBoard()` (niżej), `createToasts({ root, isInGame: () => true })` (komunikaty Sowiego Interfejsu: najwyżej 1 naraz); `window.SowieNotifications ||= { notify }` (dla wspólnych modułów); pętla `requestAnimationFrame` rusza od razu (plansza z domyślnym stanem), a `start()`: `await SowieCloud.ready`, `loadGame("szklarnia")`, pole `preview` dokumentu (`JSON.parse`, błąd → nowa gra) → `loadState`, `ready = true`; bez zapisu — od razu zapis nowej gry; zdarzenie `progress.emit(EVENTS.VISIT, { gameId: "szklarnia" })` (most do Sowiej Akademii).
- **Zapis** `save({ immediate, flush })`: `state.savedAt = Date.now()`, `SowieCloud.updateGame("szklarnia", { preview: JSON.stringify(state) }, immediate ? { delayMs: 2000 } : undefined)`, przy `flush` — `SowieCloud.flush()`. Kiedy: co 20 s gry, po połączeniu i komposcie po 2 s, przy zejściu do tła (`visibilitychange` z `document.hidden`) i `pagehide` od razu. `updateGame` **nie zmienia** `state`, `saveVersion` ani `rev` dokumentu, więc dawna Szklarnia nie widzi zapisu podglądu (ani pytania o nowszy postęp).
- **Wskaźnik** (płótno, `pointerdown` / `pointermove` / `pointerup` / `pointercancel`; jeden palec — `pointerId`):
  - `pointerdown` — zapamiętuje pole pod palcem i punkt startu; na polu z przedmiotem `setPointerCapture`;
  - przesunięcie o ≥ 8 px z pola z przedmiotem → **przeciąganie** (zaznaczenie znika); w trakcie: czy palec jest nad przyciskiem kompostu (`getBoundingClientRect`) → klasa `is-target`; jeśli nie — czy nad kartą zamówienia (`orderAt`) → klasa `is-target` tej karty (`showOrderTarget`);
  - puszczenie przy przeciąganiu: nad kompostem — `compost(pole)`; nad kartą zamówienia — `dropOnOrder(pole, karta)`: roślina tego samego łańcucha i poziomu co zamówienie → `deliver(karta, pole)` (oddana najpierw właśnie ta roślina), inna — podpowiedź „Płomykówka Pola prosi: Pilea, nie Nasionko” i `klik` (ton 0,6), roślina zostaje; inaczej cel = `cellAt(x, y − size · LIFT)` (pole **pod uniesionym przedmiotem**, nie pod palcem) → `move(źródło, cel)`;
  - puszczenie bez przeciągania (**stuknięcie**): bez zaznaczenia — stuknięta roślina zostaje zaznaczona (podpowiedź „Kiełek — stuknij pole albo kompost”); z zaznaczeniem — ruch na stuknięte pole (to samo pole — odznaczenie);
  - `pointercancel` — przerwanie bez ruchu.
- **Karty zamówień** (`updateOrders`, w każdym `updateHud`): dla każdej karty — sąsiadka `neighborOf(order.neighbor)`; po zmianie zamówienia albo rozmiaru przycisku (klucz `JSON zamówienia | szerokość × wysokość`) — zmienna CSS `--sasiadka` = kolor chustki, `drawOrderCard`, liczba sztuk „×2” (jedna sztuka — pusto); zawsze — klasa `is-ready`, gdy `game.orderCells(slot)` nie jest `null`, i `aria-label` „Pani Puszczykowa prosi: 2 × Kiełek (Monstera, poziom 2) — stuknij, żeby oddać” / „— jeszcze brak na półkach” (hybryda: „(hybryda)”). Zamówienie słowami (`orderText`): „2 × ” przy dwóch sztukach + nazwa poziomu (`itemName`). Stuknięcie karty → `deliver(karta, zaznaczone pole)`.
- **Przyciski:** Sowia doniczka → `tapPot()`; kompost: zaznaczona roślina → `compost`, bez zaznaczenia — komunikat „Przeciągnij roślinę na kompost albo zaznacz ją i stuknij tutaj”.
- **Zdarzenia gry** (`handleEvents`): `spawn` — pyknięcie pola; `merge` — pyknięcie, napis `+N` (biały, 18 px) nad polem, podpowiedź „Kiełek!” (nazwa wyniku), przy szczycie łańcucha komunikat-nagroda „Złota Monstera! Szczyt łańcucha — skrzyżuj ją z innym szczytem albo skompostuj za 25 liści” (nazwa wyniku, liście z `COMPOST_LEAVES`; `kind: "reward"`, `key: "szczyt"`, `priority: 2`), zapis po 2 s; `hybrid` — pyknięcie, napis `+N` złoty (`COLORS.zloto`, 20 px), podpowiedź „Hybryda: Monpilea Przytulna!”, komunikat „Nowa hybryda: Monpilea Przytulna! +60 liści” (`kind: "reward"`, `key: "hybryda"`, `priority: 2`), zapis po 2 s; `unlock` — komunikat „Nowa roślina w Sowiej doniczce: Pilea!” (`kind: "reward"`, `key: "nowa-roslina"`, `priority: 2`); `order` — zaznaczenie znika, jeśli zaznaczona roślina została oddana, podpowiedź „Pani Puszczykowa dziękuje! +4 liści, +1 ⭐”, komunikat „Pani Puszczykowa dziękuje za Kiełek! +4 liści · +1 ⭐” (`kind: "reward"`, `key: "zamowienie"`), dźwięk `rekord` (ton 1,2, 0,7), „podskok” karty (`element.animate`: skala 1 → 1,12 → 1 w 350 ms), zapis po 2 s; `orderMissing` — podpowiedź „Płomykówka Pola prosi: Pilea”, `klik` (ton 0,6, 0,5); `compost` — napis `+N` w kolorze `COLORS.monsteraJasna`, podpowiedź „Kompost: Kiełek → +2 liści”, zapis po 2 s; `potEmpty` — „Doniczka się ładuje — nasionko co 3 sekundy”; `boardFull` — „Brak miejsca na półkach — połącz albo skompostuj roślinę” (`kind: "warn"`).
- **Dźwięk** (od uwagi właściciela L1): `fetch(../assets/audio/audio.json)` → `createAudio({ manifest, baseUrl, preloadOnUnlock: GAME_SOUNDS })`, `connectAudioSettings(audio, SowieCloud)` (głośności z profilu), `bindUnlock(window, { ignore: gest w a[href] })`, od razu `playMusic("szklarnia")` (zagra po odblokowaniu dotknięciem); `play(nazwa, opcje)` łapie błędy. Efekty: podniesienie rośliny (przeciąganie od 8 px) i zaznaczenie stuknięciem — `klik` (ton 1,2, głośność 0,6); przeniesienie i zamiana — `ladowanie` (0,55); połączenie — `polaczenie` z tonem `0,9 + 0,1 × poziom wyniku`, szczyt łańcucha — dodatkowo `rekord` (0,8); hybryda — `polaczenie` (ton 1,5) i `rekord` (0,9); nasionko z doniczki — `lisc` (ton 1,25, 0,6); kompost — `slizg` (ton 0,8, 0,7); pusta doniczka i pełne półki — `klik` (ton 0,6, 0,5). Kontekst usypia się przy zejściu do tła (silnik).
- **HUD** (`updateHud`, co 0,2 s i po akcjach): liście i gwiazdki (`toLocaleString("pl-PL")`), karty zamówień (`updateOrders`), ładunki „N/12”, `aria-label` doniczki „Sowia doniczka — nasionko na wolne pole, ładunki N z 12”.
- **Pętla** (`frame`): `dt = min(0,25 s, …)`; gdy gra gotowa i nie wstrzymana hakiem — `game.update(dt)` i licznik zapisu; rysowanie planszy z widokiem przeciągania (`dragView`: pole źródłowe, punkt palca, cel — przy celu = źródle `-1` — i rodzaj: `compost` nad kompostownikiem albo kartą zamówienia (wtedy też bez pola docelowego), `merge` gdy `canMerge` albo `hybridOf` z przedmiotem na celu — zielone podświetlenie — inaczej `move`). Powrót z tła zeruje czas klatki.
- **Rozmiar planszy** (`fitBoard`): `renderer.resize()` i opis płótna `aria-label` „Półki szklarni: 7 kolumn, 9 rzędów” (obrócona — „9 kolumn, 7 rzędów”); wywołane na starcie, przy `resize` okna i przez `ResizeObserver` gniazda (obrót telefonu, wczytana czcionka zmienia wysokość nagłówka).
- **Haki testowe** `window.LaczIHoduj` (zamrożony obiekt): `ready()`, `state()`, `cells()` (kopie), `cellCenter(index)`, `cellSize()`, `transposed()` (plansza obrócona), `lift()` (piksele uniesienia), `selected()`, `place(index, level, chain = "monstera")` (wstawia przedmiot dowolnego łańcucha albo hybrydę, `level` 0 — czyści pole), `move(from, to)` → typ ruchu, `orders()` (kopia zamówień), `setOrder(slot, chain, level, count = 1)` (ustawia zamówienie sąsiadki z tego miejsca), `tapPot()` → indeks, `hold(on = true)` (wstrzymanie logiki w klatkach), `music()` (bieżący motyw albo `null`), `save()` (zapis z `flush`).

## Testy

- `tests/unit/lacz-plansza.test.mjs` (10 testów): dane (plansza 7 × 9, łańcuch 5 poziomów, nagrody rosną z poziomem); ruchy (przeniesienie, połączenie, zamiana, „none”, najwyższy poziom się nie łączy); doniczka (losowe wolne pole, ładowanie co 3 s, bez ładunku i bez miejsca — ładunek zostaje); nagrody i statystyki, Złota Monstera, kompost; **plansza nigdy bez wyjścia** (pełna bez par — kompost, potem doniczka; 200 losowych plansz); stan (nowa gra ma ≥ 2 pary, zapis i wczytanie, niepoprawne pola, stan v1 dawnej gry → nowa gra); cztery łańcuchy po 5 poziomów i trzy hybrydy, odblokowanie łańcuchów w doniczce (progi 10 / 30 / 60 połączeń, zdarzenie `unlock`, wagi losowania `pickChain`); hybrydy (oba porządki składników, nagroda 60 liści, `stats.hybrids`, Złotolistka z dwóch hybryd, dwie takie same hybrydy i dwa takie same szczyty — zamiana, kompost hybrydy za 50 liści, `mergeablePairs` liczy przepisy, zapis i wczytanie zachowują hybrydy i inne łańcuchy); zamówienia (trzy sąsiadki, startowe — Kiełek, zakresy poziomów, kolejność losowań, hybryda od 8 zamówień, bez powtórek, nagrody, niepoprawne zamówienia); zamówienia w grze (za mało sztuk — `orderMissing`, najpierw przeciągnięta roślina, liście, gwiazdki, statystyka, nowe zamówienie, hybryda w zamówieniu, zapis i wczytanie, naprawa niepoprawnego zamówienia i ujemnych gwiazdek, stan sprzed zamówień).
- `tests/e2e/telefon/lacz.spec.js` (każdy profil telefonu): płótno przylega do siatki (górny rząd ≤ 24 px od krawędzi, wysokość płótna ≤ dół siatki + 40 px), plansza obrócona tylko przy ekranie poziomym; przeciągnięcie nasionka na nasionko (kiełek, liście, podpowiedź), zaznaczenie i połączenie stuknięciami, zamiana; doniczka, kompost przeciągnięciem (podświetlenie `is-target`) i przyciskiem, pełne półki (komunikat, ładunek zostaje); zapis w polu `preview` na emulatorze — pole `state` dawnej Szklarni bez zmian, plansza wraca w nowej karcie; 320 × 568 — pole ≥ 44 px, cała plansza na ekranie, przyciski ≥ 44 px, bez przewijania w bok; telefon poziomo (844 × 390 i 667 × 375) — plansza obrócona (`aria-label` „9 kolumn, 7 rzędów”), pole ≥ 44 px, bez przewijania, przyciski ≥ 44 px na prawo od planszy, pola 30 i 31 jedno pod drugim i przeciągnięcie je łączy; hybryda — Złota Monstera przeciągnięta na Złotą Pileę daje Monpileę (podpowiedź, +60 liści, komunikat, `stats.hybrids`), hybryda nie łączy się z taką samą (zamiana), po 10 połączeniach komunikat „Nowa roślina w Sowiej doniczce: Pilea!”; zamówienia — trzy karty ≥ 44 × 44 px w kolejności sąsiadek, gotowa karta (`is-ready`, opis „stuknij, żeby oddać”) oddaje kiełek po stuknięciu (podpowiedź, komunikat, liście 4, gwiazdka 1, `stats.orders`), karta bez roślin — podpowiedź „Płomykówka Pola prosi: Pilea”, przeciągnięcie nasionka na kartę (podświetlenie `is-target`) oddaje właśnie to nasionko, roślina niechciana zostaje z podpowiedzią; na 320 × 568 i telefonie poziomo karty zamówień też ≥ 44 px i na ekranie (poziomo — na prawo od planszy).
- `tests/e2e/telefon/menu.spec.js` — karta Sowiej Szklarni ma przycisk „Wypróbuj nową wersję: Łącz i Hoduj” (`LaczIHoduj/`).
