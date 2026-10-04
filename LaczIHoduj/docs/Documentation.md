# Łącz i Hoduj — dokumentacja techniczna

Nowa **Sowia Szklarnia** (Analiza 2, rozdz. 3.5; Analiza 3, etap E8): gra logiczna typu **merge** na półkach szklarni. Dwa takie same przedmioty połączone przeciągnięciem dają przedmiot następnego poziomu. Gra powstaje od zera w osobnym folderze `LaczIHoduj/` jako **wersja podglądowa** (Analiza 3, „Podgląd przed podmianą”): w rejestrze gier wpis `szklarnia` ma `preview: { path: "LaczIHoduj/", name: "Łącz i Hoduj" }`, więc karta Sowiej Szklarni w menu ma przycisk „Wypróbuj nową wersję: Łącz i Hoduj”, a `SowieCloud.currentGame()` rozpoznaje stronę jako grę `szklarnia`. Identyfikator w bazie — **`szklarnia`** — nie zmienia się nigdy (opublikowane reguły Firestore). Dawna gra (`SowiaSzklarnia/`) działa bez zmian obok.

Stan: **E8a — prototyp (krok 8.0)**: plansza 7 × 9, jeden łańcuch (Monstera, 5 poziomów), przeciąganie z uniesieniem przedmiotu nad palec, zaznaczanie stuknięciem, Sowia doniczka z ładunkami, kompostownik (wyjście z zapchanej planszy), liście monstery, zapis w polu `preview`. **Punkt kontrolny właściciela:** jeśli rozgrywka merge się nie podoba, gra przechodzi na wariant zapasowy z Analizy 2, rozdz. 3.5 (idle z odwróconymi rolami). Kolejne kroki (8.1–8.3: cztery łańcuchy i hybrydy, zamówienia sąsiadek, odnawianie pomieszczeń, przeszkody Pracu i Amic, kózki-wzmacniacze, Basen Humbaka, pakiet startowy z dawnej gry, samouczek, podmiana) — dopiero po akceptacji prototypu.

## Pliki

| Plik                    | Rola                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `index.html`            | strona gry: nagłówek (Menu, tytuł, liście), podpowiedź, płótno planszy, pasek (Sowia doniczka, kompost), notka o prototypie                                              |
| `style.css`             | układ strony (siatka na całą wysokość ekranu), wygląd paska i notki, warianty dla wąskich i niskich ekranów                                                              |
| `package.json`          | `{"type": "module"}` — pliki `.js` folderu to moduły ES (Node w testach jednostkowych)                                                                                   |
| `config.js`             | dane gry: identyfikator, wersja zapisu, pole podglądu, plansza, łańcuchy, doniczka, nagrody, przedmioty startowe                                                         |
| `board.js`              | czysta logika planszy (bez DOM): tworzenie, ruchy (przeniesienie, łączenie, zamiana), wolne pola, kompost, wyjścia z zapchanej planszy                                   |
| `game.js`               | stan gry (wersja 2) i silnik: doniczka z ładunkami, ruchy z nagrodami, kompost, statystyki, kolejka zdarzeń                                                              |
| `render.js`             | rysowanie planszy na płótnie: szklarnia z półkami, rośliny łańcucha Monstery kształtami, zaznaczenie, uniesiony przedmiot, podświetlenie celu, „pyknięcia” i napisy „+N” |
| `main.js`               | strona gry: wczytanie i zapis stanu, pętla klatek, obsługa wskaźnika (przeciąganie i stuknięcia), przyciski, komunikaty, haki testowe                                    |
| `docs/README.md`        | instrukcja dla gracza (po polsku)                                                                                                                                        |
| `docs/Documentation.md` | ten plik                                                                                                                                                                 |

Testy: `tests/unit/lacz-plansza.test.mjs` (logika), `tests/e2e/telefon/lacz.spec.js` (strona na telefonach), wpis podglądu w `tests/e2e/telefon/menu.spec.js`; folder jest dopisany w `eslint.config.js` (moduły ES), `package.json` (`format`, `format:check`, `html`), `tests/unit/architecture.test.mjs` (`newGamePages`, `projectScripts`), `tests/unit/pwa.test.mjs` i `tests/unit/owl-gallery.test.mjs`.

## Smaczki dawnej Sowiej Szklarni do przeniesienia (kroki 8.1–8.3)

Z dawnej gry (`SowiaSzklarnia/script.js`) do nowej trafią (Analiza 2, rozdz. 3.5):

- **Rośliny** jako łańcuchy po 5 poziomów: Monstera (Monstera Miziasta — w prototypie), Pilea (Pilea Pieniążek), Paproć (Paproć Puchata), Kaktus (Kaktus Pracu).
- **Hybrydy** jako połączenie dwóch różnych roślin najwyższego poziomu: Monpilea Przytulna (Monstera + Pilea), Alopaproć Wachlarzowa (Paproć + Alokazja), Złotolistka (Monpilea + Alopaproć).
- **Pomieszczenia szklarni** odnawiane gwiazdkami z zamówień: Doniczarnia 🪴, Sala Upraw 🌿, Zraszalnia 💧, Sadzonkarnia 🌱, Krzyżówkarium 🧬, Laboratorium Pyłku 🔬, Kompostownia 🪱, Płotek Antykozi 🎀, Sowie Centrum 🦉, Kącik Drzemki 🌙.
- **Kompost** (dawna Kompostownia) — w prototypie już jest jako kompostownik.
- **Kozy** zmieniają rolę: zamiast szkodników („SIO! SIO!”) są kózkami-wzmacniaczami (Skoczek, Zjadaczka, Dżoker, Sprężynka, Taran).
- **Pakiet startowy** z dawnego stanu (`state`, `saveVersion: 1`): liście → waluta, liczba pomieszczeń → odnowione pomieszczenia, hybrydy (`summary.hybrids`).

## `index.html`

- `<html lang="pl" class="sowie-shell">`, `<body data-sowie-game="szklarnia">` (tak strona przedstawia się wspólnym modułom).
- W `<head>`: meta `viewport` z `viewport-fit=cover`, `theme-color` `#dff7ea`, opis, tytuł „Łącz i Hoduj (prototyp) — SowieGry”, manifest i ikony PWA (`../manifest.webmanifest`, `../assets/icons/icon.svg`, `apple-touch-icon.png`, `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-title` „SowieGry”).
- Skrypty w kolejności: `../config/firebase-config.js`, `../shared/sowie-platform.js`, `../shared/sowie-cloud.js`, `../shared/password-gate.js`, `../shared/pwa.js`; preload czcionki `../assets/fonts/fredoka-700.woff2`; style `../shared/cute-ui.css`, `../shared/world/tokens.css`, `../shared/ui/ui.css`, `style.css`; z `defer`: `../shared/sowie-academy.js`, `../shared/owl-gallery.js`; moduł `main.js`. Strona **nie** ładuje `shared/gameplay-expansion.js` (nowa gra — metryki Akademii przez most `SowieProgress`).
- `<main class="lacz" data-lacz aria-label="Łącz i Hoduj">` zawiera po kolei:
  1. `<header class="lacz-top">`: link `a.sowie-ui-button.is-quiet.lacz-back` „Menu” (`href="../"`), `<h1 class="lacz-title">Łącz i Hoduj</h1>`, `div.lacz-leaves` (`aria-live="off"`) z `<strong data-leaves>0</strong>` i `<span>liści</span>`.
  2. `<p class="lacz-hint" data-hint aria-live="polite">` — tekst startowy „Przeciągnij roślinę na taką samą — urośnie!”.
  3. `div.lacz-board` z `<canvas data-canvas tabindex="0" aria-label="Półki szklarni: 7 kolumn, 9 rzędów">`.
  4. `div.lacz-bar`: przycisk `button.sowie-ui-button.is-primary.lacz-pot[data-pot]` z dwoma `<span>`: „🌱 Sowia doniczka” i `span.lacz-charges[data-charges]` „12/12”; przycisk `button.sowie-ui-button.lacz-compost[data-compost]` z `aria-label="Kompostownik — usuń roślinę"` i tekstem „♻️ Kompost”.
  5. `p.lacz-preview`: „Prototyp nowej Szklarni. Postęp zapisuje się osobno — dawna gra (Sowia Szklarnia) zostaje bez zmian.” z linkiem `../SowiaSzklarnia/`.

## `style.css`

Czcionka: `var(--czcionka-sowia)` (Fredoka z `shared/world/tokens.css`), kolor tekstu `var(--kontur)`, tło strony `#e8f7ee`; `html, body { height: 100%; margin: 0 }`.

- `.lacz` — siatka `grid-template-columns: minmax(0, 1fr)` (płótno nie rozpycha kolumny) i `grid-template-rows: auto auto minmax(0, 1fr) auto auto` (nagłówek, podpowiedź, plansza, pasek, notka), `gap: 6px`, `height: 100dvh`, `max-width: 560px`, `margin: 0 auto`, padding `max(6px, env(safe-area-inset-*))` z każdej strony, `box-sizing: border-box`. Plansza dostaje całą resztę wysokości.
- `.lacz-top` — siatka `auto minmax(0, 1fr) auto`, `align-items: center`, `gap: 8px`.
- `.lacz-back` — `box-sizing: border-box; min-height: 44px; padding: 0 12px; text-decoration: none` (wspólny przycisk ma `min-height: 52px` i padding 8 px — tutaj niższy, żeby nagłówek miał 44 px).
- `.lacz-title` — `margin: 0`, 20 px, wyśrodkowany, w jednym wierszu z wielokropkiem (`overflow: hidden; white-space: nowrap; text-overflow: ellipsis`).
- `.lacz-leaves` — siatka z `justify-items: end`, `padding-right: 4px` (obrys liczby nie wychodzi poza ekran), `line-height: 1.1`; `strong` 22 px, cyfry tabelaryczne, biały z obrysem `-webkit-text-stroke: 5px var(--kontur)` i `paint-order: stroke fill`; `span` 12 px.
- `.lacz-hint` — zawsze **jeden wiersz** (`overflow: hidden; white-space: nowrap; text-overflow: ellipsis`), 14 px, `line-height: 1.3`, wyśrodkowany, `margin: 0` — zmiana tekstu nie przesuwa planszy.
- `.lacz-board` — **gniazdo** planszy: `display: grid; place-items: center; min-width: 0; min-height: 0; overflow: hidden`; rozmiar płótna ustawia `render.js` (siatka z ramką, nie większa niż gniazdo), więc płótno stoi na środku gniazda, a na wysokim telefonie wolne miejsce rozkłada się nad i pod planszą. Płótno: `display: block; border-radius: 18px; box-shadow: 0 2px 8px rgba(59, 47, 74, 0.15); touch-action: none` (przeglądarka nie przewija strony przy przeciąganiu), `cursor: grab`.
- `.lacz-bar` — siatka `minmax(0, 2fr) minmax(0, 1fr)`, `gap: 8px`; przyciski `min-height: 52px`, 15 px.
- `.lacz-pot` — `display: flex; justify-content: space-between; gap: 8px`; `.lacz-charges` — cyfry tabelaryczne.
- `.lacz-compost.is-target` — kompostownik jako cel upuszczenia: tło `var(--monstera-jasna)`, `box-shadow: 0 0 0 4px var(--monstera)`.
- `.lacz-preview` — `margin: 0`, 12 px, `opacity: 0.8`.
- `@media (max-width: 340px)` — boczny padding `max(2px, env(safe-area-inset-right/left))` (na 320 px płótno ma 316 px: 7 pól po 44 px i przerwy 1 px).
- `@media (max-height: 600px)` — `.lacz-preview { display: none }`, tytuł 17 px, podpowiedź 13 px (więcej miejsca na planszę).
- `@media (orientation: landscape) and (max-height: 500px)` — **telefon poziomo**: `.lacz` w dwóch kolumnach `minmax(0, 1fr) minmax(200px, 32%)`, wiersze `auto auto minmax(0, 1fr) auto`, obszary `"board top" "board hint" "board ." "board bar"`, `max-width: none`; plansza (`grid-area: board`) po lewej na całą wysokość, po prawej nagłówek, podpowiedź (`white-space: normal`, `min-height: 2.6em` — do dwóch wierszy) i pasek z przyciskami jeden pod drugim (`grid-template-columns: minmax(0, 1fr)`, 14 px); notka o prototypie ukryta.

Na 320 × 568: nagłówek 44 px, podpowiedź 17 px, gniazdo 316 × 419 px, płótno 316 × 416 px (pole **44 px**), pasek 52 px. Na 390 × 844 pole 49 px (płótno 378 × 484). Telefon poziomo (plansza obrócona do 9 × 7): 844 × 390 — pole 49 px, 667 × 375 — 45 px; na najmniejszym (568 × 320) — 37 px (mniej niż 44 px nie da się uniknąć przy 7 rzędach na 308 px wysokości; gra jest przewidziana głównie na telefon pionowo).

## `config.js`

| Stała            | Wartość                                                                                                                          | Znaczenie                                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `GAME_ID`        | `"szklarnia"`                                                                                                                    | identyfikator w bazie (stały)                                                                                                          |
| `SAVE_VERSION`   | `2`                                                                                                                              | wersja stanu nowej gry (dawna Szklarnia zapisuje wersję 1)                                                                             |
| `PREVIEW_FIELD`  | `"preview"`                                                                                                                      | pole dokumentu `sowiegry/profil/sowiegry_gry/szklarnia`, w którym podgląd trzyma swój stan (JSON); pole `state` zostaje dla dawnej gry |
| `BOARD`          | `{ cols: 7, rows: 9 }`                                                                                                           | plansza (63 pola)                                                                                                                      |
| `CHAINS`         | `{ monstera: { name: "Monstera", color: "#3fae6a", levels: ["Nasionko", "Kiełek", "Sadzonka", "Monstera", "Złota Monstera"] } }` | łańcuchy; najwyższy poziom się nie łączy                                                                                               |
| `POT`            | `{ max: 12, regen: 3, chain: "monstera" }`                                                                                       | Sowia doniczka: najwyżej 12 ładunków, jeden wraca co 3 s, daje nasionko Monstery                                                       |
| `MERGE_LEAVES`   | `[0, 0, 1, 3, 8, 20]`                                                                                                            | liście za połączenie, według poziomu **wyniku** (indeks = poziom)                                                                      |
| `COMPOST_LEAVES` | `[0, 1, 2, 4, 10, 25]`                                                                                                           | liście za kompost, według poziomu **usuniętego** przedmiotu                                                                            |
| `START_ITEMS`    | `[[30, 1], [31, 1], [24, 1], [38, 2], [39, 2]]`                                                                                  | nowa gra: [indeks pola, poziom] — trzy nasionka i dwa kiełki (od razu dwie pary do połączenia)                                         |

Wszystkie obiekty są zamrożone (`Object.freeze`).

## `board.js` — plansza

Przedmiot: `{ chain, level }` (poziom od 1), puste pole: `null`. Plansza: `{ cols, rows, cells }`, pola wierszami (indeks = `row * cols + col`).

- `maxLevel(chain)` — liczba poziomów łańcucha (`CHAINS[chain].levels.length`, nieznany — 0).
- `itemName(item)` — nazwa poziomu, np. „Kiełek” (pusty — `""`).
- `createBoard({ cols, rows, cells = null })` — nowa plansza; z `cells` (zapis) przepisuje tylko poprawne przedmioty (znany łańcuch, poziom 1…max; poziom zaokrąglony w dół), resztę zamienia na `null`.
- `cellIndex(board, col, row)`, `cellPosition(board, index)` → `{ col, row }`.
- `emptyCells(board)` — indeksy wolnych pól (rosnąco).
- `canMerge(a, b)` — ten sam łańcuch i poziom, poziom poniżej najwyższego.
- `moveItem(board, from, to)` → `{ type, item }`:
  - `"none"` — to samo pole, puste pole źródłowe albo cel poza planszą (bez zmian);
  - `"move"` — cel pusty: przeniesienie;
  - `"merge"` — `canMerge`: na polu docelowym przedmiot o poziom wyżej, źródło puste;
  - `"swap"` — inny przedmiot (także dwa najwyższego poziomu): zamiana miejscami.
- `spawnItem(board, item, random = Math.random)` — kopia przedmiotu na polu `free[floor(random() * free.length)]` → indeks albo `-1` (plansza pełna).
- `removeItem(board, index)` — usunięcie (kompost) → przedmiot albo `null`.
- `mergeablePairs(board)` — liczba par do połączenia: dla każdej grupy `łańcuch:poziom` (bez najwyższych) `floor(liczba / 2)`; każdy przedmiot można przenieść w dowolne miejsce, więc liczy się sam skład planszy.
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
  pot: { charges: 12, progress: 0 },   // ładunki doniczki i postęp następnego (0…1)
  stats: { merges: 0, spawns: 0, composted: 0, best: 2, moves: 0 },
}
```

- `defaultState(now = Date.now())` — plansza z `START_ITEMS` (łańcuch `POT.chain`), pełna doniczka, `stats.best = 2` (na starcie są kiełki).
- `loadState(raw, now)` — `raw` nie jest obiektem albo `version !== 2` (np. stan dawnej Szklarni) → `defaultState(now)`. W przeciwnym razie: domyślne wartości nadpisane zapisem, pola przez `createBoard` (niepoprawne przedmioty → puste), `leaves` liczbowo (nie-liczba → 0), `pot.charges` w 0…12, `pot.progress` w 0…1, `stats` uzupełnione domyślnymi, `version: 2`.
- `createGame({ state = defaultState(), random = Math.random })` → `{ state, board, update, tapPot, move, compost, takeEvents }`; plansza tworzona z `state.cells`, po każdej zmianie `state.cells = serializeCells(board)`.
  - `update(dt)` — ładowanie doniczki: przy pełnej `progress = 0`; inaczej `progress += dt / POT.regen`, każde pełne 1 → +1 ładunek (do `max`).
  - `tapPot()` — bez ładunku: zdarzenie `potEmpty`, `-1`; brak wolnego pola: `boardFull`, `-1` (**ładunek zostaje**); inaczej nasionko na losowym wolnym polu, `charges − 1`, `stats.spawns + 1`, zdarzenie `spawn { index, item }`, zwraca indeks.
  - `move(from, to)` — `moveItem`; przy `"none"` nic; inaczej `stats.moves + 1`; połączenie: `leaves += MERGE_LEAVES[poziom wyniku]`, `stats.merges + 1`, `stats.best = max(best, poziom)`, zdarzenie `merge { from, to, item, leaves, top }` (`top` — wynik ma najwyższy poziom); przeniesienie i zamiana: zdarzenia `move` / `swap { from, to }`.
  - `compost(index)` — usunięcie przedmiotu, `leaves += COMPOST_LEAVES[poziom]`, `stats.composted + 1`, zdarzenie `compost { index, item, leaves }`, zwraca przedmiot (puste pole — `null`).
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
- **Rośliny** (`item(target, cx, cy, s, time)`; `bottom = cy + 0,32 s`; kołysanie `sin(time · 1,8 + cx · 0,05) · 0,06` rad; zielenie `COLORS.monstera` / `COLORS.monsteraCiemna`, przy poziomie 5 złoto `COLORS.zloto` / `COLORS.zlotoCiemne`):
  - poziomy 1–2: kopczyk ziemi `#8a5a3b` (elipsa 0,3 s × 0,12 s); poziomy 3–5: doniczka `COLORS.doniczka` szerokości `s · (0,36 + (poziom − 3) · 0,06)`, wysokości 0,26 s, z ciemnym rantem;
  - 1 **Nasionko** — elipsa `#a0703f` (0,12 s × 0,16 s, obrót 0,4) z białym połyskiem;
  - 2 **Kiełek** — łodyżka (ciemna zieleń, grubość `max(2, 0,05 s)`) i dwa listki pod kątem ±0,9 rad;
  - 3 **Sadzonka** — 3 liście (długość 0,32 s, szerokość 0,1 s, rozstaw 0,6 rad);
  - 4 **Monstera** — 5 liści (0,42 s × 0,14 s, rozstaw 0,5 rad) z białymi wycięciami;
  - 5 **Złota Monstera** — jak 4, w złocie, z trzema migającymi iskierkami (romby);
  - liście na zmianę jasne i ciemne; poziom (cyfra) w prawym górnym rogu pola (`font(max(9, round(0,2 s)))`, `rgba(59, 47, 74, 0.7)`).
- **Zaznaczenie** (stuknięcie, bez przeciągania): złota ramka `COLORS.zloto` 4 px.
- **Przeciąganie:** przedmiot z pola źródłowego znika z planszy i jest rysowany powiększony ×1,15 w punkcie `(x, y − LIFT · s)` — nad palcem — z cieniem (elipsa `rgba(59, 47, 74, 0.2)`) pod palcem; **bez cyfry poziomu** (`item(…, label = false)`), żeby nie zasłaniał cyfry pola docelowego.

## `main.js` — strona gry

Stałe: `SAVE_EVERY = 20` (s gry), `IMPORTANT_DELAY = 2000` (ms), `DRAG_START = 8` (px).

- **Start:** `createBoardRenderer`, `fitBoard()` (niżej), `createToasts({ root, isInGame: () => true })` (komunikaty Sowiego Interfejsu: najwyżej 1 naraz); `window.SowieNotifications ||= { notify }` (dla wspólnych modułów); pętla `requestAnimationFrame` rusza od razu (plansza z domyślnym stanem), a `start()`: `await SowieCloud.ready`, `loadGame("szklarnia")`, pole `preview` dokumentu (`JSON.parse`, błąd → nowa gra) → `loadState`, `ready = true`; bez zapisu — od razu zapis nowej gry; zdarzenie `progress.emit(EVENTS.VISIT, { gameId: "szklarnia" })` (most do Sowiej Akademii).
- **Zapis** `save({ immediate, flush })`: `state.savedAt = Date.now()`, `SowieCloud.updateGame("szklarnia", { preview: JSON.stringify(state) }, immediate ? { delayMs: 2000 } : undefined)`, przy `flush` — `SowieCloud.flush()`. Kiedy: co 20 s gry, po połączeniu i komposcie po 2 s, przy zejściu do tła (`visibilitychange` z `document.hidden`) i `pagehide` od razu. `updateGame` **nie zmienia** `state`, `saveVersion` ani `rev` dokumentu, więc dawna Szklarnia nie widzi zapisu podglądu (ani pytania o nowszy postęp).
- **Wskaźnik** (płótno, `pointerdown` / `pointermove` / `pointerup` / `pointercancel`; jeden palec — `pointerId`):
  - `pointerdown` — zapamiętuje pole pod palcem i punkt startu; na polu z przedmiotem `setPointerCapture`;
  - przesunięcie o ≥ 8 px z pola z przedmiotem → **przeciąganie** (zaznaczenie znika); w trakcie: czy palec jest nad przyciskiem kompostu (`getBoundingClientRect`) → klasa `is-target`;
  - puszczenie przy przeciąganiu: nad kompostem — `compost(pole)`; inaczej cel = `cellAt(x, y − size · LIFT)` (pole **pod uniesionym przedmiotem**, nie pod palcem) → `move(źródło, cel)`;
  - puszczenie bez przeciągania (**stuknięcie**): bez zaznaczenia — stuknięta roślina zostaje zaznaczona (podpowiedź „Kiełek — stuknij pole albo kompost”); z zaznaczeniem — ruch na stuknięte pole (to samo pole — odznaczenie);
  - `pointercancel` — przerwanie bez ruchu.
- **Przyciski:** Sowia doniczka → `tapPot()`; kompost: zaznaczona roślina → `compost`, bez zaznaczenia — komunikat „Przeciągnij roślinę na kompost albo zaznacz ją i stuknij tutaj”.
- **Zdarzenia gry** (`handleEvents`): `spawn` — pyknięcie pola; `merge` — pyknięcie, napis `+N` (biały, 18 px) nad polem, podpowiedź „Kiełek!” (nazwa wyniku), przy Złotej Monsterze komunikat-nagroda „Złota Monstera! Szczyt łańcucha — możesz ją skompostować za 25 liści” (`priority: 2`), zapis po 2 s; `compost` — napis `+N` w kolorze `COLORS.monsteraJasna`, podpowiedź „Kompost: Kiełek → +2 liści”, zapis po 2 s; `potEmpty` — „Doniczka się ładuje — nasionko co 3 sekundy”; `boardFull` — „Brak miejsca na półkach — połącz albo skompostuj roślinę” (`kind: "warn"`).
- **HUD** (`updateHud`, co 0,2 s i po akcjach): liście (`toLocaleString("pl-PL")`), ładunki „N/12”, `aria-label` doniczki „Sowia doniczka — nasionko na wolne pole, ładunki N z 12”.
- **Pętla** (`frame`): `dt = min(0,25 s, …)`; gdy gra gotowa i nie wstrzymana hakiem — `game.update(dt)` i licznik zapisu; rysowanie planszy z widokiem przeciągania (`dragView`: pole źródłowe, punkt palca, cel — przy celu = źródle `-1` — i rodzaj `merge` / `move` / `compost`). Powrót z tła zeruje czas klatki.
- **Rozmiar planszy** (`fitBoard`): `renderer.resize()` i opis płótna `aria-label` „Półki szklarni: 7 kolumn, 9 rzędów” (obrócona — „9 kolumn, 7 rzędów”); wywołane na starcie, przy `resize` okna i przez `ResizeObserver` gniazda (obrót telefonu, wczytana czcionka zmienia wysokość nagłówka).
- **Haki testowe** `window.LaczIHoduj` (zamrożony obiekt): `ready()`, `state()`, `cells()` (kopie), `cellCenter(index)`, `cellSize()`, `transposed()` (plansza obrócona), `lift()` (piksele uniesienia), `selected()`, `place(index, level, chain = "monstera")` (wstawia przedmiot, `level` 0 — czyści pole), `move(from, to)` → typ ruchu, `tapPot()` → indeks, `hold(on = true)` (wstrzymanie logiki w klatkach), `save()` (zapis z `flush`).

## Testy

- `tests/unit/lacz-plansza.test.mjs` (6 testów): dane (plansza 7 × 9, łańcuch 5 poziomów, nagrody rosną z poziomem); ruchy (przeniesienie, połączenie, zamiana, „none”, najwyższy poziom się nie łączy); doniczka (losowe wolne pole, ładowanie co 3 s, bez ładunku i bez miejsca — ładunek zostaje); nagrody i statystyki, Złota Monstera, kompost; **plansza nigdy bez wyjścia** (pełna bez par — kompost, potem doniczka; 200 losowych plansz); stan (nowa gra ma ≥ 2 pary, zapis i wczytanie, niepoprawne pola, stan v1 dawnej gry → nowa gra).
- `tests/e2e/telefon/lacz.spec.js` (każdy profil telefonu): płótno przylega do siatki (górny rząd ≤ 24 px od krawędzi, wysokość płótna ≤ dół siatki + 40 px), plansza obrócona tylko przy ekranie poziomym; przeciągnięcie nasionka na nasionko (kiełek, liście, podpowiedź), zaznaczenie i połączenie stuknięciami, zamiana; doniczka, kompost przeciągnięciem (podświetlenie `is-target`) i przyciskiem, pełne półki (komunikat, ładunek zostaje); zapis w polu `preview` na emulatorze — pole `state` dawnej Szklarni bez zmian, plansza wraca w nowej karcie; 320 × 568 — pole ≥ 44 px, cała plansza na ekranie, przyciski ≥ 44 px, bez przewijania w bok; telefon poziomo (844 × 390 i 667 × 375) — plansza obrócona (`aria-label` „9 kolumn, 7 rzędów”), pole ≥ 44 px, bez przewijania, przyciski ≥ 44 px na prawo od planszy, pola 30 i 31 jedno pod drugim i przeciągnięcie je łączy.
- `tests/e2e/telefon/menu.spec.js` — karta Sowiej Szklarni ma przycisk „Wypróbuj nową wersję: Łącz i Hoduj” (`LaczIHoduj/`).
