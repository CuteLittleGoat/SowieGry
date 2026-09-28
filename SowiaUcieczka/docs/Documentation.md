# Sowia Ucieczka — dokumentacja techniczna

Nowa wersja SowaRunner (Analiza 2, rozdz. 3.1; Analiza 3, etap E4), zbudowana od zera na Sowim Silniku (`shared/engine/`), Sowim Świecie (`shared/world/`) i wspólnym interfejsie (`shared/ui/`). Do akceptacji właściciela działa jako **wersja podglądowa** w folderze `SowiaUcieczka/`; stara gra działa dalej w `SowaRunner/`. Obie wersje mają ten sam identyfikator w bazie — **`runner`** — więc rekordy, top 10 i historia są wspólne.

Stan: **E4c** — rdzeń gry, pełny zestaw wzorów, skaczące kózki (power-upy), Gorączka Monster, Plusk-o-metr z „Rejsem na humbaku” i 6 biomów. Kolejne kroki: zadania biegu, Sowi mnożnik, wyzwanie dnia (E4d); samouczek, muzyka, ilustracja w menu (E4e); po akceptacji — podmiana folderu (E4f).

## Pliki

```text
SowiaUcieczka/
  index.html      strona gry (ekran tytułowy w HTML, plansza na płótnie)
  style.css       wygląd ekranu tytułowego
  package.json    { "type": "module" } — pliki .js to moduły ES
  config.js       wszystkie parametry (fizyka, sowa, poziomy, biomy, kamera, chmura, punktacja, generator, kózki, humbak)
  physics.js      ruch sowy (czysta logika)
  camera.js       kamera i czas reakcji (czysta logika + kamera biegu)
  obstacles.js    przeszkody Pracu / Amic i ich pola kolizji
  patterns.js     37 wzorów trasy i generator
  game.js         logika biegu (świat, zdarzenia, trafienia, Chmura Pracu, combo, kózki, rejs, biomy) — bez DOM
  backgrounds.js  tła 6 biomów (paralaksa rysowana kodem), przenikanie, ocean rejsu
  render.js       rysowanie na płótnie
  main.js         strona: silnik, interfejs, dźwięk, SowieProgress, SowieCloud
  docs/           ta dokumentacja i instrukcja dla gracza (README.md)
```

Jednostki: świat w **jednostkach logicznych** (1 j. = 1 m dystansu), czas w sekundach. Oś y rośnie w dół: ziemia to `y = 0`, wysokość nad ziemią jest ujemna.

## `index.html`

- `<html lang="pl" class="sowie-shell">` (powłoka telefonu: bez przewijania, bez „pociągnij, aby odświeżyć”).
- `<head>`: `viewport` z `viewport-fit=cover`, `theme-color` `#bfe9ff`, opis, tytuł „Sowia Ucieczka — SowieGry”, manifest i ikony PWA; skrypty w kolejności: `../config/firebase-config.js`, `../shared/sowie-platform.js`, `../shared/sowie-cloud.js`, `../shared/password-gate.js`, `../shared/pwa.js`; `preload` czcionki `fredoka-700.woff2`; style: `../shared/cute-ui.css` (ekran hasła), `../shared/world/tokens.css`, `../shared/engine/shell.css`, `../shared/ui/ui.css`, `style.css`; `../shared/sowie-academy.js` i `../shared/owl-gallery.js` z `defer` (misje i zdjęcia działają, ale **bez** doklejanych przycisków — `data-sowie-game`), moduł `main.js`. Strona **nie** ładuje `sowie-core.js`, `gameplay-expansion.js`, `notification-manager.js`, `game-guides.js`, `records.js` ani p5.js.
- `<body data-sowie-game="runner">` → `<main class="sowie-stage ucieczka-stage" data-stage aria-label="Sowia Ucieczka">` z płótnem `[data-canvas]` (`aria-hidden`) i ekranem tytułowym `section.ucieczka-title[data-title]`:
  - `h1` „Sowia Ucieczka”, opis sterowania;
  - grupa `[data-difficulty]` (`role="group"`, „Poziom trudności”) z trzema `button.sowie-ui-chip[data-level]` (Chill / Arcade / Chaos, `aria-pressed`);
  - `[data-record]` — rekord wybranego poziomu; `[data-cozy]` — „Tryb Przytulny: wolniej i bez końca gry.” (tylko Chill z włączonym Trybem Przytulnym);
  - **Start** (`[data-start]`, `.sowie-ui-button.is-primary.is-big`), **Jak grać?** (`[data-guide]`), **Menu** (odnośnik `../`), dopisek o wersji podglądowej.

## `style.css`

- `.ucieczka-stage` — tło `--niebo-gora`, czcionka Fredoka; płótno absolutnie na całą planszę.
- `.ucieczka-title` — nakładka (`z-index` 40) z kartą przy dolnej krawędzi (zasięg kciuka), marginesy = bezpieczne obszary, gradient przyciemnienia od 30% wysokości w dół; `[hidden]` chowa.
- `.ucieczka-title-card` — szerokość `min(100%, 440px)`, zaokrąglenie 24 px, tło `rgba(255,246,227,.96)`, cień, przewijanie przy braku miejsca; tytuł 34 px biały z konturem 7 px `--kontur`; poziomy w siatce 3 kolumn (chipy min. 48 px); rekord pogrubiony, cyfry stałej szerokości; dopiski 14 px; „Jak grać?” i „Menu” w siatce 2 kolumn.
- `.ucieczka-splash` — **Plusk-o-metr** pod przyciskiem pauzy: `position: absolute`, `top: calc(max(8px, safe-area-top) + 64px)`, `left: max(12px, safe-area-left)`, `z-index` 31, flex z odstępem 6 px, padding `4px 10px 4px 6px`, pigułka (`border-radius: 999px`), tło `rgba(255,255,255,.85)`, cień `0 2px 8px rgba(59,47,74,.15)`, `pointer-events: none`; `[hidden]` chowa. Pasek `.ucieczka-splash-bar` 64 × 10 px, zaokrąglenie 5 px, tło `rgba(59,47,74,.12)`; wypełnienie `span` w kolorze `--woda`, `transform: scaleX(udział)` od lewej; `.is-bonus` (w rejsie) — wypełnienie `--zloto`.
- Telefon poziomo (`max-height: 500px`): mniejsze odstępy, tytuł 26 px, bez opisu i dopisku.

## `config.js` — parametry

| Stała                                           | Wartości                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GAME_ID`                                       | `"runner"`                                                                                                                                                                                                                                                                                                                                                                                                              |
| `PHYSICS`                                       | grawitacja 38 j./s², skok 14 j./s (szczyt 2,58 j. po 0,37 s), podwójny skok 12 j./s (+1,89 j.), maks. opadanie 22, szybowanie: opadanie 1,6 j./s, hamowanie 40, maks. 1,5 s na wybicie, od 0,15 s przytrzymania; szybkie opadanie 18 j./s; ślizg 0,6 s; coyote 0,1 s; bufor skoku 0,12 s; `pressDelay` 0,06 s (dotyk: skok albo ślizg); wpadnięcie do dziury głębiej niż 1,2 j.                                         |
| `OWL`                                           | rysunek 1,2 j.; pole kolizji 0,8 × 1,0 j. (ok. 80% rysunku), w ślizgu 0,96 × 0,55 j.; sowa na 18% szerokości ekranu                                                                                                                                                                                                                                                                                                     |
| `PLATFORM_LEVELS`                               | 2,2 / 4,2 / 6,2 j. nad ziemią; grubość platformy 0,35 j.                                                                                                                                                                                                                                                                                                                                                                |
| `DIFFICULTIES`                                  | Chill 5 → 7,5 j./s w 200 s, progi ×1,4, odstępy ×1,25; Arcade 6 → 9 j./s w 180 s, ×1, ×1; Chaos 7 → 10,5 j./s w 150 s, progi ×0,6, odstępy ×0,8                                                                                                                                                                                                                                                                         |
| `COZY_SPEED`                                    | 0,85 (Tryb Przytulny, tylko Chill)                                                                                                                                                                                                                                                                                                                                                                                      |
| `BIOME_LENGTH` / `BIOME_COUNT` / `LOOP_SPEEDUP` | biom co 1000 m, 6 biomów, potem od nowa; każde kolejne okrążenie +5% prędkości (najwyżej +10%)                                                                                                                                                                                                                                                                                                                          |
| `MIN_SPEED` / `MAX_SPEED`                       | 4,25 / 11,55 j./s (10,5 × 1,1 — największa prędkość Chaos na kolejnym okrążeniu; Turbo się nie liczy, bo daje nietykalność)                                                                                                                                                                                                                                                                                             |
| `TIER_DISTANCE`                                 | progi wzorów 0 / 300 / 900 / 1800 m (× `tierScale`)                                                                                                                                                                                                                                                                                                                                                                     |
| `VIEW`                                          | `minWorld` 11 × 10 j.; ziemia na 80% wysokości (ekran tytułowy 42%); miejsce na HUD 2,2 j.; cel reakcji 1,2 s (wymaganie 1,1 s); min. powiększenie 0,6; tempo oddalania 1,5/s; podążanie w pionie 6/s; `moverLead` 1,3 s                                                                                                                                                                                                |
| `CLOUD`                                         | 3 kroki, 400 m bez trafienia oddala o krok, 1,5 s nietykalności po trafieniu                                                                                                                                                                                                                                                                                                                                            |
| `SCORE`                                         | 1 pkt/m; liść zielony 10 pkt (1 liść), złoty 50 (5 liści), tęczowy 100 (1 liść); „O włos!” +25 przy odstępie < 0,35 j.; combo +1 co 10 liści, maks. ×5                                                                                                                                                                                                                                                                  |
| `TRACK`                                         | odstęp między wzorami 0,45 s × prędkość (min. 3 j.), wzory generowane 40 j. przed sową, sprzątanie 12 j. za sową, bez powtórzeń ostatnich 3                                                                                                                                                                                                                                                                             |
| `GOATS`                                         | kózka co 180–320 m (pierwsza po 90–160 m) na środku odstępu między wzorami; podskok 1,3 j. co 1,1 s; zasięg złapania 0,6 j.; +50 pkt; wagi losowania: Sprężynka 1, Tarcza 1,2, Magnes 1, Turbo 0,8, Podwajaczka 1; czasy: Tarcza 15 s, Magnes 8 s, Turbo 4 s, Podwajaczka 10 s; Sprężynka: wybicie 20 j./s (ok. 5,3 j.); Turbo ×1,5 prędkości; Magnes: zasięg 3,5 j., przyciąganie 14 j./s; kózka jedzie na sowie 1,2 s |
| `FEVER`                                         | Gorączka Monster (tęczowy liść): 8 s, liście ×2, dodatkowy rząd zielonych liści 3,1 j. nad ziemią co 1,3 j.                                                                                                                                                                                                                                                                                                             |
| `SPLASH`                                        | Plusk-o-metr: pełny po 60 liściach (liczy się liczba z `SCORE.leafCount`, bez mnożników) albo 3 bąbelkach; bąbelek humbaka co 500–900 m, 2,6 j. nad ziemią                                                                                                                                                                                                                                                              |
| `WHALE`                                         | „Rejs na humbaku”: 20 s; wyskok humbaka 12,5 j./s, grawitacja 24; premia 200 pkt + 10 pkt za każdy liść z rejsu; łuk 5 liści co 1,3 s; zasięg zbierania 0,9 j.                                                                                                                                                                                                                                                          |

## `physics.js` — ruch sowy

- `createOwlBody(x)` → `{ x, y, vy, grounded, surface, jumps (1 = podwójny skok dostępny), coyote, buffer, gliding, glideTime, sliding, diving, slideQueued, dropping, airTime }`.
- `owlBox(body, out)` — pole kolizji (`left`, `right`, `top`, `bottom`), w ślizgu niższe i szersze.
- `pressDown(body, events)` — na ziemi: ślizg 0,6 s (`slide`); na platformie: zeskok przez nią (`dropping` = wysokość platformy, szybkie opadanie, ślizg po lądowaniu na ziemi; `drop`); w powietrzu: szybkie opadanie ≥ 18 j./s i ślizg po lądowaniu (`dive`).
- `stepOwl(body, controls, dt, world, events, speed)` — jeden krok (`controls = { jump, down, hold, holdTime }`, `jump`/`down` jednorazowe):
  1. skok z bufora: z ziemi albo w czasie coyote → `jump` (prędkość 14), w powietrzu z zapasem `jumps` → `doubleJump` (12); skok przerywa ślizg, nurkowanie i szybowanie;
  2. liczniki bufora, coyote i ślizgu; `x += speed·dt`;
  3. na podłożu: `world.surfaceAt(x, 0,4, y)`; brak podłoża → spadanie z coyote 0,1 s (podwójny skok zostaje);
  4. w powietrzu: szybowanie, gdy przytrzymanie ≥ 0,15 s, sowa opada, nie nurkuje i nie przekroczyła 1,5 s (`glideStart` / `glideEnd`; prędkość dąży do 1,6 j./s), inaczej grawitacja (maks. 22; nurkowanie ≥ 18);
  5. lądowanie przy opadaniu: `world.surfaceBelow(x, 0,4, poprzedni spód, spód, dropping)` → `land { impact, surface }`, odnowienie podwójnego skoku i szybowania, ślizg po nurkowaniu na ziemię, skok z bufora od razu po lądowaniu.
- `jumpApex(v)` = v² / 2g.

## `camera.js` — kamera i czas reakcji

- `aheadDistance(W)` = W · (1 − 0,18) − 0,4 — odległość od przodu sowy do prawej krawędzi.
- `requiredVisibleWidth(v, reakcja = 1,2)` = (v · reakcja + 0,4) / 0,82.
- `targetZoom(W₀, v)` = W₀ / wymagana szerokość, obcięte do [0,6; 1] — kamera **oddala się z prędkością**.
- `reactionTime({ cssWidth, cssHeight, speed })` — z `computeLayout` Sowiego Silnika i `targetZoom`; test: ≥ 1,1 s dla 320 × 568 … 1280 × 720 przy 4,25, 7 i 11,55 j./s (320 × 568: przy 10,5 j./s powiększenie ok. 0,69, przy 11,55 j./s ok. 0,63; reakcja 1,2 s).
- `moverTriggerDistance(v, extra)` = (v + |extra|) · 1,3 — obiekty szybsze od świata ruszają co najmniej 1,3 s przed spotkaniem.
- `createRunCamera()` — kamera Sowiego Silnika (wstrząs) z `track(owl, speed, layout, dt, { snap, groundScreenY })`: płynne powiększenie, x tak, by sowa była na 18% szerokości, y tak, by ziemia była na `groundScreenY` wysokości; gdy sowa wznosi się wysoko, kamera podjeżdża, żeby czubek sowy był ≥ 2,2 j. pod górną krawędzią (HUD).

## `obstacles.js` — przeszkody

Pole kolizji: `box` [szerokość, wysokość], `lift` — wysokość spodu nad podłożem; rysunek: `sprite` z atlasu o szerokości `width`, kotwica `drawLift` j. nad spodem pola.

| Klucz                     | Rodzina | Grafika                                       | Pole (j.)                            | Jak ominąć                    |
| ------------------------- | ------- | --------------------------------------------- | ------------------------------------ | ----------------------------- |
| `dymek`                   | Pracu   | `pracu-dymek` 1,3                             | 0,95 × 0,75 na wys. 0,8, faluje ±0,1 | ślizg (albo skok)             |
| `telefon`, `magda`        | Pracu   | `pracu-telefon(-magda)` 1,1, drga (dzwoni)    | 0,75 × 0,8                           | skok                          |
| `mail`                    | Pracu   | `pracu-mail` 0,8; leci szybciej niż świat     | 0,6 × 0,45 na wysokości z wzoru      | rój: skok lub ślizg, rytm     |
| `karteczki-dol` / `-gora` | Pracu   | rysowane: kolorowe karteczki                  | 0,6 × 1,9 i 0,6 × 12 od 3,7          | skok w lukę 1,9–3,7           |
| `teczka`                  | Pracu   | `pracu-teczka` 1,1                            | 0,85 × 0,6                           | skok                          |
| `budzik`                  | Pracu   | `pracu-budzik` 1,0, drga                      | 0,7 × 0,75                           | skok                          |
| `tablica`                 | Pracu   | `pracu-tablica` 1,5 („Przyjmiesz zmianę?”)    | 1 × 1,25                             | skok                          |
| `dystrybutor`             | Amic    | `amic-dystrybutor` 1,6                        | 0,8 × 1,35                           | skok                          |
| `cysterna`                | Amic    | `amic-cysterna` 4                             | 3,5 × 1,45                           | podwójny skok albo szybowanie |
| `znak`                    | Amic    | `amic-znak-cen` (szer. 1; słupki bez kolizji) | 0,9 × 1,1 na wys. 0,84               | ślizg (albo skok)             |
| `wozek`                   | Amic    | `amic-wozek` 1,3; jedzie szybciej niż świat   | 1 × 0,95                             | skok z wyprzedzeniem          |
| `barierka`                | Amic    | `amic-barierka` 1,4                           | 1,1 × 0,7                            | skok                          |
| `kanister`                | Amic    | `amic-kanister` 0,75                          | 0,55 × 0,62                          | skok                          |

`obstacleBox(item, time, out)` — pole w chwili `time` (falowanie `sin(3t + faza) · bob`), `overlaps(a, b)`.

## `patterns.js` — wzory i generator

Język wzorów: `ob(rodzaj, x, { level, vx })`, `leaf(x, wysokość, rodzaj, level)`, `arc(x0, x1, szczyt, liczba, rodzaj)` (łuk liści od 0,7 j. do szczytu; środkowy liść może być złoty/tęczowy), `row`, `zigzag`, `platform(x, szerokość, poziom)`, `hole(x, szerokość)`, `wall(x)` (dwie części karteczek), `swarm(x, wysokości, { dx = 0,9, vx = −2 })` (rój maili), `pattern(id, próg, długość, tagi, elementy)`.

37 wzorów (tagi: `pracu`, `amic`, `slide`, `platform`, `hole`, `mover`, `hard`, `breather`):

- **Próg 0** (rozgrzewka): `r0-telefon`, `r0-teczka`, `r0-dystrybutor`, `r0-barierka`, `r0-dymek`, `r0-znak`, `r0-platforma`, `r0-dziura`, oddechy `r0-oddech`, `r0-oddech-zloty`.
- **Próg 1**: `r1-dwa-telefony`, `r1-dymek-telefon`, `r1-cysterna`, `r1-wozek`, `r1-maile-nisko`, `r1-karteczki`, `r1-schody`, `r1-most` (dziura 4,5 j. z platformą), `r1-znak-dystrybutor`, `r1-budzik-teczka`, oddech `r1-oddech-luk`.
- **Próg 2**: `r2-slalom`, `r2-cysterna-znak`, `r2-maile-wysoko` (ślizg), `r2-dymek-wozek`, `r2-wieza` (3 poziomy platform), `r2-karteczki-dwie`, `r2-tablica-dymek`, `r2-dziury`, `r2-dystrybutory`, oddech `r2-oddech-tecza` (tęczowy liść).
- **Próg 3**: `r3-cysterny`, `r3-dymki-znak`, `r3-maile-wozek`, `r3-przepasc` (dziura 13 j. z dwiema platformami), `r3-miks`, `r3-karteczki-znak`, oddech `r3-oddech-platformy`.

`tierAt(dystans, poziom)` — najwyższy próg, którego próg dystansu (× `tierScale`) został osiągnięty.

`createTrack({ difficulty, random, patterns })` → `choose(dystans)`, `recent()`, `rest()` (następny wzór to oddech — po rejsie na humbaku i po `warp`): pula = wzory do bieżącego progu (wzory progu 0 tylko na progu 0 albo do 120 m); pierwszy wzór i wzór po `hard` — oddech; oddechy tylko z bieżącego progu; bez ostatnich 3 wzorów; wagi: bieżący próg ×3, niższe ×1. `gapAfter(v, poziom)` = max(3, 0,45 · v) × `gap` poziomu.

## `game.js` — logika biegu

- `speedAt(t, poziom, przytulny)` — `start + (max − start) · (1 − (1 − u)²)`, `u = t / rampSeconds` (ease-out), ×0,85 w Trybie Przytulnym.
- `biomeAt(dystans)` → `{ index: ⌊d / 1000⌋ mod 6, loop: ⌊d / 6000⌋ }` (biom i numer okrążenia).
- `loopFactor(dystans)` = 1 + min(0,1; okrążenie × 0,05) — kolejne okrążenie biomów jest szybsze.
- `goatLift(czas, faza)` — wysokość podskoku kózki: `t = ((czas + faza) mod 1,1) / 1,1`; dla `t < 0,7` łuk `1,3 · 4 · (t/0,7) · (1 − t/0,7)`, potem 0 (kózka stoi 30% okresu).
- `comboLevel(seria)` = min(5, 1 + ⌊seria / 10⌋).
- `createWorld()` — dziury i platformy (posortowane po x): `groundAt(x)` (sowa stoi, dopóki odcinek x ± 0,25 nie jest w całości nad dziurą), `surfaceAt`, `surfaceBelow` (platformy jednostronne: lądowanie tylko z góry, pomijana platforma zeskoku), `cleanup`.
- `createRun({ difficulty, seed, cozy, random, patterns, startDistance })` — ziarno przez `createRng(seed).next`; `state`: czas, prędkość, dystans, sowa, świat, przeszkody, liście, koniec trasy, `cloud` (3), `sinceHit`, nietykalność, oszołomienie, wynik, punkty liści, liczba liści, seria, combo i najlepsze combo, „O włos!”, trafienia, koniec (`ended`, `endReason`), ostatnie wzory, a od E4c: `goats` i `bubbles` (obiekty na trasie), `powerups` (`tarcza`, `magnes`, `turbo`, `podwajaczka` — sekundy do końca), `fever` (sekundy Gorączki), `riding` (`{ kind, time }` — kózka na grzbiecie sowy), `splash` (Plusk-o-metr 0–1), `bonus` (`null` albo `{ time, y, vy, leafTimer, points, leaves }` rejsu), `bonusCount`, `bonusPoints`, `goatCount`, `goatPoints`, `smashed`, `nextGoatAt` (pierwsza kózka: 90 + los · 70 m), `nextBubbleAt` (500 + los · 400 m), `biome`, `loop`. Tryb Przytulny tylko z Chill.
  - Wejście: `press(source)` — przytrzymanie od teraz; klawiatura skacze od razu, dotyk czeka 0,06 s (`pendingPress`), bo może to być przesunięcie w dół; `release()` — koniec przytrzymania, a krótkie stuknięcie skacze od razu; `swipe("down")` — anuluje czekający skok i daje ślizg / nurkowanie / zeskok; `swipe("up")` — skok.
  - `spawn()` (nic w czasie rejsu): wzór z generatora, w Gorączce dodatkowo rząd zielonych liści 3,1 j. nad ziemią co 1,3 j. (od początku wzoru + 1 do końca − 0,5); odstęp `gapAfter`; na **środku odstępu**: gdy dystans ≥ `nextGoatAt` — kózka (`pickGoat()`: losowanie z wagami, nigdy dwa razy z rzędu ten sam rodzaj; `nextGoatAt` += 180–320 m), inaczej gdy ≥ `nextBubbleAt` — bąbelek humbaka 2,6 j. nad ziemią (`nextBubbleAt` += 500–900 m).
  - `update(dt)`: czas; prędkość = `speedAt × loopFactor(dystans)` (× 1,5 w Turbo); odliczanie power-upów (koniec → `powerupEnd { kind }`, po Turbo 1 s nietykalności), Gorączki (`feverEnd`) i jazdy kózki; czekające dotknięcie; przytrzymanie; **w rejsie `updateBonus`, inaczej `stepOwl`**; dystans, nietykalność; 400 m bez trafienia → chmura +1 (`cloudBack`); wpadnięcie do dziury → trafienie `dziura`, sowa wraca na ziemię 0,6 j. za dziurą (`fall`); zmiana biomu → `biome { index, loop }`; `spawn`; poza rejsem `updateObjects`; pełny Plusk-o-metr, sowa na ziemi (nie na platformie, nie nad dziurą) → `startBonus`; wynik = ⌊dystans⌋ + punkty liści + 25 × „O włos!” + punkty kózek + premie z rejsów; sprzątanie (przeszkody, liście, kózki i bąbelki 12 j. za sową).
  - `updateObjects(dt)`: ruchome przeszkody ruszają z odległości `moverTriggerDistance` (`warning`); kolizja → w Turbo przebicie bez obrażeń (`smash`, licznik `smashed`), inaczej `hit(rodzina, rodzaj)`; minięcie z odstępem < 0,35 j. → „O włos!” (`nearMiss`); **Magnes**: liście w promieniu 3,5 j. od punktu (x sowy, y − 0,5) lecą do niego z prędkością 14 j./s; **kózki** (do 2 j. w poziomie): punkt kózki `(x, −goatLift − 0,5)`, odległość od pola sowy ≤ 0,6 j. → `catchGoat`; **bąbelki**: odległość ≤ 0,45 j. → Plusk-o-metr + ⅓ (`bubble { x, y, splash }`); liście w promieniu 0,4 j. od pola sowy → `collect`.
  - `collect(liść)`: mnożnik = (Podwajaczka ? 2 : 1) × (Gorączka ? 2 : 1); punkty = `SCORE.leaf × mnożnik × combo`, liczba liści i seria + `SCORE.leafCount × mnożnik`; poza rejsem Plusk-o-metr + `leafCount / 60`; w rejsie liczniki rejsu; `leaf { kind, points, count, combo, x, y }`; tęczowy liść → Gorączka 8 s (`fever` tylko, gdy nie trwała).
  - `catchGoat(kózka)`: `goatCount` + 1, +50 pkt, `riding` na 1,2 s; **Sprężynka** — od razu super-skok (vy = −20, w powietrzu, podwójny skok dostępny, koniec ślizgu i nurkowania); pozostałe — power-up na swój czas; `goat { kind, x, bonus }`.
  - `hit(by, variant)` — nic przy końcu gry, nietykalności, Turbo i w rejsie; **Tarcza** pochłania trafienie (tarcza = 0, 1 s nietykalności, `shieldBreak`, wynik `false`); inaczej chmura −1, nietykalność 1,5 s, oszołomienie 0,5 s, combo −1 poziom; przy 0: koniec `chmura` (w Trybie Przytulnym chmura zostaje na 1).
  - **„Rejs na humbaku”**: `startBonus()` usuwa wszystko przed sową (od x − 1: przeszkody, liście, kózki, bąbelki, platformy, dziury), stawia sowę na ziemi, zeruje Plusk-o-metr, `bonusCount` + 1, `bonus = { time: 20, y: 0, vy: 0, leafTimer: 0,6, points: 0, leaves: 0 }`, `bonusStart`. `updateBonus(dt)`: czas − dt, sowa jedzie z prędkością biegu; stuknięcie (skok) — gdy humbak jest w wodzie (y ≥ −0,05), wyskok 12,5 j./s (`whaleJump`); przesunięcie w dół ignorowane; grawitacja 24; powrót do wody z vy > 6 → `whaleSplash { x }`; sowa siedzi 0,55 j. nad humbakiem; co 1,3 s (gdy zostało > 1,5 s) łuk 5 liści od `x sowy + 13 + prędkość` co 1,1 j., od 1 j. do szczytu 2,2–4,6 j. (środkowy złoty z szansą 25%); liście w promieniu 0,9 j. od (x, y sowy − 0,4) zbierane; czas ≤ 0 → `endBonus()`: premia 200 + 10 × liście z rejsu (`bonusPoints`), usunięcie liści przed sową, sowa na ziemi z podwójnym skokiem, nietykalność ≥ 1 s, trasa od `x + 6`, `track.rest()` (najpierw oddech), `bonusEnd { premium, leaves }`.
  - Testy i diagnostyka: `giveGoat(rodzaj)` (kózka od razu), `fillSplash()` (pełny Plusk-o-metr), `warp(metry)` (usuwa obiekty przed sową, przesuwa ją, dystans; `nextGoatAt` / `nextBubbleAt` ≥ dystans; trasa od `x + 6`, `rest()`).
  - `end(powód)`, `takeEvents()`, `prime()`, `summary()` → `{ score, distance, leaves, bestCombo, nearMisses, hits, durationMs, difficulty, goats, bonuses, smashed }`.

## `backgrounds.js` — biomy i ocean

Biom zmienia się co 1000 m; pierwsze **60 m** nowego biomu to przenikanie z poprzednim (kolory nieba i ziemi mieszane liniowo, warstwy poprzedniego biomu znikają, nowego — pojawiają się). Wszystkie tła są rysowane kodem w kolorach palety (bez emoji i logotypów). `hash(v)` = część ułamkowa `sin(127,1 v) · 43758,5453` — stała pseudolosowość elementów.

| Biom (`id`)            | Niebo (góra → dół)    | Ziemia (wierzch / ciemny / wypełnienie / ciemne)           | Warstwy (paralaksa)                                                                                                                      | Drobiazgi (`deco`, paralaksa 0,25)                                  |
| ---------------------- | --------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Łąka (`laka`)          | `#bfe9ff` → `#fff6e3` | `--monstera` / `--monstera-ciemna` / `#c98f5e` / `#a8714a` | wzgórza `#a8dcc0` (0,75; wys. 2,2; co 7) i `#7fcf9c` (0,45; 1,1; co 4)                                                                   | kwiaty co 1,7 j. (łodyga, główka różowa / złota / biała, kołysanie) |
| Miasto (`miasto`)      | `#cfe7ff` → `#fff1e0` | `#b8b3c4` / `#8e879e` / `#9c95ad` / `#847c96`              | panorama `#c3cde0` z oknami `#e7eefa` (0,78; co 2,4; wys. 3–7) i `#9fb0cc` z oknami `#fff2b8` (0,5; co 2,8; 2–4,5)                       | latarnie co 6 j. (słup 2,7 j., klosz `#fff2b8`)                     |
| Osiedle PRL (`prl`)    | `#d8e6f2` → `#f6efe3` | `#8fbf7a` / `#6f9e5c` / `#b9b0a4` / `#9d9387`              | bloki z wielkiej płyty `#d6cfc3`, okna `#a9b8cf` (0,8; co 7; wys. 6) i `#e6d8b8`, okna `#8fa2c0` (0,55; co 9; 4,2); pasy balkonów        | trzepaki co 11 j. (2 słupki 1,4 j. i poprzeczka)                    |
| Stacja Amic (`stacja`) | `#bfe9ff` → `#fff6e3` | `#8c8698` / `#6f6a7b` / `#7d7590` / `#6a6380` (asfalt)     | wzgórza `#b9dcc8` (0,8; 1,6; co 8), wiaty stacji (0,55; co 12): słupy `--szary`, dach biały z pasem `--amic-czerwony` i `--amic-zielony` | przerywane białe pasy na asfalcie (paralaksa 1, co 2 j.)            |
| Plaża (`plaza`)        | `#9fe0ff` → `#fff3d6` | `#f7e3ae` / `#e8c97f` / `#f1d596` / `#e0bd78` (piasek)     | morze `--woda` z falami `--woda-jasna` (0,9; poziom 1,4 j.), wydmy `#f3dfa8` (0,55; 0,9; co 5)                                           | parasole co 7 j. (czaszy na przemian `--pracu` i `--niebieski`)     |
| Noc nad morzem (`noc`) | `#232b57` → `#4b3f72` | `#7a6a94` / `#5f5179` / `#8f7a9e` / `#6f5d82`              | gwiazdy (0,95, migają) i księżyc (sierp), morze `#2d4c7c` z falami `#6f86b8`, wydmy `#5a4f7d`                                            | świetliki co 2,2 j. (paralaksa 0,3, pulsują)                        |

- Warstwy (`LAYERS`): `hills` / `dunes` — łuki kwadratowe od y = 0,2 z wysokością `height · (0,6 + hash · 0,6)`; `skyline` — prostokąty o szerokości 55–90% odstępu z oknami 0,22 × 0,3 j. (część zgaszona); `blocks` — szerokie bloki (70% odstępu, 20% pominiętych) z pełną siatką okien 0,26 × 0,3 j. i ciemnymi pasami co 1,2 j.; `canopies` — wiata 6 j. na wysokości 3,6 j. (30% pominiętych); `sea` — pas wody od `−level` do ziemi z krótkimi falami; `stars` — gwiazdy w górnych 75% nieba (przezroczystość mnożona przez przenikanie) i księżyc (koło `#fff3c4` 0,9 j. przykryte kołem koloru nieba) na 55% odległości do prawej krawędzi.
- `repeat(camera, bounds, factor, spacing, draw)` — powtarzanie elementów z przesunięciem `camera.x · factor` (paralaksa).
- Chmury (`clouds`, paralaksa 0,8, co 9 j., 35% pominiętych, 3 elipsy) — w dzień `rgba(255,255,255,.85)`, w nocy `rgba(160,160,200,.35)`.
- `OCEAN` — niebo rejsu `#9fe0ff` → `#e8f8ff`.
- Funkcje: `mixColor(a, b, t)` (kolory `#rrggbb` → `rgb(r, g, b)`), `biomeBlend(dystans)` → `{ current, previous, t }` (t = 1 poza przenikaniem i w pierwszym biomie), `groundStyle(blend)` → `{ top, topDark, fill, fillDark }`, `skyColors(blend)` → `[góra, dół]`, `drawBiomeBackground(context, camera, bounds, blend, czas)` (chmury, poprzedni biom z przezroczystością 1 − t, bieżący z t; noc, gdy t > 0,5), `drawOcean(context, camera, bounds, czas, noc)` — chmury, wyspy na horyzoncie (półelipsy 2,2 × 0,7 j. co 14 j., paralaksa 0,85), morze od y = −0,1 z falującą linią (`sin(1,3 x + 2,2 t) · 0,08`) i gradientem `--woda` → `--woda-ciemna` (w nocy `#2d4c7c` → `#1d2f55`), krótkie jasne fale pod wodą.

## `render.js` — rysowanie

`createRenderer({ canvas, view, camera, atlas })` → `draw({ state, animator, cosmetic, particles, dt, showCloud, reducedMotion })`, `popup(tekst, x, y, kolor, rozmiar)`, `clearPopups()`; eksportuje też `BIOMES` z `backgrounds.js`. Kolejność:

1. niebo — gradient `skyColors(biomeBlend(dystans))` (w rejsie: niebo oceanu, a w nocnym biomie nocne), w pikselach CSS; gradient pamiętany dla wysokości ekranu i kolorów;
2. tło: w rejsie `drawOcean`, inaczej `drawBiomeBackground` i ziemia w kolorach `groundStyle` — wypełnienie z ciemnymi kreskami, wierzch 0,28 j. + ciemny pas 0,08 j.; dziury — ciemny dół (`--kontur`) z ciemniejszymi ściankami 0,18 j. i lekką poświatą;
3. platformy: zaokrąglone deski (wypełnienie ziemi biomu, kontur 0,05 j.) z pasem wierzchu;
4. liście z atlasu (`lisc-zielony` 0,6 j., złote i tęczowe 0,7 j.), unoszenie ±0,06 j. i kołysanie;
5. **bąbelki humbaka** — `babelek` 0,8 j., unoszą się ±0,15 j., biały pierścień (promień 0,48 ± 0,04, linia 0,05 j.);
6. **kózki** — cień, grafika `kozka-<rodzaj>` (w powietrzu `kozka-<rodzaj>-skok`) szerokości 1,15 j., odwrócone w stronę sowy, wysokość z `goatLift`;
7. przeszkody z atlasu (cień pod stojącymi na ziemi; telefon i budzik drgają; trafione półprzezroczyste); ściana karteczek — karteczki 0,6 j. w 4 kolorach (`#fff39a`, `#ffc8d5`, `#c8f0ff`, `#d7f7c2`), przekrzywione, z czerwonymi „bazgrołami”;
8. **Chmura Pracu** (poza ekranem tytułowym i rejsem): szaro-fioletowa (`#6d6480`) chmura z groźnymi brwiami i oczami, 3,6 j. nad ziemią; 3 kroki — wystaje zza lewej krawędzi, 2 — w połowie widoczna (×1,1), 1 — tuż nad sową (×1,25); wylatują z niej małe dymki „Pracu pracu!”;
9. **humbak** (w rejsie) — `humbak` 3,2 j. w (x sowy + 0,25, y humbaka + 0,25), przechył `−0,02 · vy + 0,03 · sin(2t)`;
10. efekty za sową: **Turbo** — 3 pomarańczowe smugi (`rgba(255,157,77,.8)`, 0,08 j.) o długości 1–2,2 j.;
11. sowa (`drawOwl` z garderobą z profilu, cień na ziemi albo platformie — nie w rejsie, miganie w czasie nietykalności, w ślizgu spłaszczona ×1,18 / ×0,62);
12. efekty przed sową: **jadąca kózka** (0,75 j. na grzbiecie, 1,2 s po złapaniu), **Tarcza** — niebieska bańka (wypełnienie `rgba(77,157,224,.16)`, kontur `--niebieski`, promień 0,9 ± 0,05; ostatnie 2 s miga), **Magnes** — dwa fioletowe łuki (`rgba(155,109,219,.7)`) rozchodzące się od 1,2 do 2,8 j.;
13. cząsteczki, napisy punktów (Fredoka 700, kontur, unoszą się 0,9 s);
14. ostrzeżenia „!” — czerwone (Pracu) albo amicowe koła 34 px przy prawej krawędzi dla ruchomych obiektów jeszcze poza ekranem, pulsujące;
15. **Gorączka Monster** (bez ograniczenia ruchu) — tęczowa ramka ekranu (gradient `#ff6f91`, `#f4c542`, `#3fae6a`, `#4d9de0`, `#9b6ddb`, linia 14 px, przezroczystość `0,18 + 0,08 · sin(6t)`).

## `main.js` — strona gry

- Widok `createView({ minWorld: 11 × 10 })`, kamera biegu, atlas (64 × DPR pikseli na jednostkę), renderer, cząsteczki (240), animator sowy, pętla `createLoop`, powłoka `createShell({ overlay: false })` (auto-pauza, odliczanie, „Oszczędzanie baterii” → gęstość cząsteczek 0,4).
- Interfejs: `createHud` (pauza, wynik, liście, **życia = kroki Chmury Pracu**), `createToasts` (w biegu 1 komunikat), `createPauseMenu` (instrukcja `ucieczka`, garderoba, ustawienia; w Trybie Przytulnym dodatkowo „Zakończ bieg”), `createResults` („Jeszcze raz”, „Menu”). Komunikaty Akademii i Galerii (`window.SowieNotifications`) w trakcie biegu czekają na ekran wyników.
- Ekran tytułowy: wybór poziomu (zapamiętany w dokumencie gry `difficulty`, `updateGame` po 2 s), rekord poziomu z `SowieCloud.records("runner", poziom)`, „Jak grać?” (okno z `guideFor("ucieczka")`). Sowa stoi, kamera pokazuje ją nad kartą (ziemia na 42%).
- **Bieg startuje dopiero po wczytaniu dokumentu gry** (`SowieCloud.ready` → `loadGame("runner")`) — inaczej zapis wyniku nadpisałby top 10.
- `startRun()`: nowy `createRun` (ziarno `?seed=` + poziom albo losowe), HUD, Plusk-o-metr widoczny, blokada skali widoku (pasek adresu nie zmienia skali), `shell.setActive(true)`, `SowieProgress.beginRun("runner", { difficulty, daily })`.
- **Plusk-o-metr** (`div.ucieczka-splash`, `role="progressbar"`, 0–100): obrazek `../assets/svg/humbak/humbak.svg` 34 × 17 i pasek; widoczny tylko w biegu. `updateSplash(state)` co klatkę: udział = Plusk-o-metr albo w rejsie pozostały czas / 20 s; zmienia DOM tylko przy zmianie procentu lub trybu; klasa `is-bonus`, `aria-valuenow`, `aria-label` „Plusk-o-metr: N%” albo „Rejs na humbaku: N s”.
- HUD power-upów (`hud.setPowerups`): aktywne power-upy z pozostałym czasem (`total` = czas z `GOATS.duration`) i Gorączka (`goraczka`, `total` 8 s) — styl `goraczka` w `shared/ui/hud.js` (`POWERUP_STYLE`: etykieta „Gorączka”, kolor `--policzki`).
- Zdarzenia E4c: `goat` — „koza-meee” + „powerup-start”, wibracja 20 ms, złote cząsteczki, napis „+50”, komunikat (`GOAT_TEXT`: „Kózka Sprężynka — super-skok!”, „Kózka Tarcza — chroni przed 1 trafieniem”, „Kózka Magnes — przyciąga liście”, „Kózka Turbo — sprint bez obrażeń!”, „Kózka Podwajaczka — liście ×2”; klucz `goat-<rodzaj>`), `goat:caught`; `powerupEnd` — „powerup-koniec”; `shieldBreak` — „powerup-koniec”, niebieskie cząsteczki, „Tarcza pękła — nic się nie stało!”; `smash` — „trafienie-amic” (głośność 0,4, wysokość 1,3), pomarańczowe cząsteczki; `fever` — „goraczka-start”, „Gorączka Monster! Liście ×2”, `fever:start`; `bubble` — „humbak-plusk” (0,5; 1,4), cząsteczki wody; `bonusStart` — „bonus-start” + „humbak-plusk”, muzyka „humbak”, „Rejs na humbaku! Stukaj, żeby humbak wyskakiwał”; `whaleJump` — „skok” (wysokość 0,7); `whaleSplash` — „humbak-plusk” (0,7), 16 cząsteczek wody; `bonusEnd` — koniec muzyki, „zycie”, „Humbacza premia +N”, `whale:bonus { leaves }`; `biome` — komunikat z nazwą biomu (nie na starcie; na nowym okrążeniu „Kolejne okrążenie — szybciej!”; klucz `biome-<okrążenie>-<indeks>`, żeby szybkie zmiany się nie łączyły).
- Zdarzenia → dźwięki (skok, podwójny skok, szybowanie w pętli, ślizg, lądowanie, liść z rosnącą wysokością w serii, złoty i tęczowy liść, trafienie Pracu / Amic, „O włos!” — „połączenie”, dzwonek przy ostrzeżeniu o Pracu, życie przy oddaleniu chmury, odliczanie), wibracja 30 ms przy trafieniu, wstrząs kamery (bez przy ograniczeniu ruchu), zatrzymanie klatki 60 ms przy trafieniu, cząsteczki, napisy punktów, komunikaty („Combo ×N!”, „Ojej! Pracu Pracu!”, „Twarde lądowanie w Amic!”, „Dziura w trasie!”, „Chmura Pracu się oddala!”), zdarzenia SowieProgress (`leaf:collected`, `combo`, `hit`, `near-miss`).
- `finishRun()`: `SowieCloud.submitRun("runner", { score, distance, leaves, difficulty, durationMs })` (rekord poziomu, top 10, historia, wyzwanie dnia z `?daily=1`), `SowieProgress.endRun({ score, distance, bestChain })` (misje Akademii i zdjęcia Galerii), dźwięk rekordu albo „koniec gry”, ekran wyników: tytuł („Chmura Pracu Cię dogoniła!” / „Koniec biegu!”), wynik, rekord, „Nowy rekord!”, liście, miejsce w top 10, zadania, Dystans, Najlepsze combo, „O włos!”, Kózki, Rejsy na humbaku, odłożone komunikaty; Plusk-o-metr znika, muzyka rejsu cichnie.
- Gesty (`bindInput` na planszy): dotknięcie → `press("touch")` (klawiatura `press("keyboard")`), puszczenie → `release`, przesunięcie → `swipe`, P / Esc → pauza; na ekranie tytułowym Spacja startuje bieg. Dotknięcia przycisków na planszy nie są gestami (`INTERACTIVE` w `shared/engine/input.js`).
- Animacja sowy: w rejsie „radość”, gdy humbak jest w powietrzu, inaczej „stoi”; oszołomienie po trafieniu, w powietrzu „skok” albo „szybowanie”, na ziemi „bieg”, na ekranie tytułowym „stoi”; lądowanie = spłaszczenie proporcjonalne do prędkości.
- Po `SowieCloud.ready`: poziom z dokumentu gry, klasa `sowie-reduced-effects` z ustawień, zdarzenie `game:visit` (misja tygodnia).
- **Ślad bąbelków** (garderoba `bubbleTrail`, bez ograniczenia ruchu): co 0,12 s jeden bąbelek (`particles.emit`: 0,45 j. za sową, prędkość 0,8 w lewo z rozrzutem 1,2 rad, życie 1 s, promień 0,1 j., `fall` −1,5 — unosi się, kolor `--woda-jasna`).
- `window.SowiaUcieczka` (testy): `screen()`, `ready()`, `state()`, `start(poziom)`, `end()`, `hit(rodzina)`, `goat(rodzaj)`, `fillSplash()`, `warp(metry)`, `bonus()`, `powerups()` (z `fever`), `camera()`, `atlasReady()`.

## Chmura w bazie

Identyfikator `runner`. `SowieCloud` rozpoznaje stronę jako grę `runner` po `GAME_REGISTRY[…].preview.path` (`"SowiaUcieczka/"`), więc przy starcie wczytuje dokument `sowiegry/profil/sowiegry_gry/runner` (top 10, rekordy dnia) tak samo jak strona `SowaRunner/`. Rekordy: `profil.records.runner.{chill|arcade|chaos}` (`bestScore`, `bestDistance`), `runs`.

## Testy

- `tests/unit/ucieczka.test.mjs`: skok (szczyt ok. 2,58 j., podwójny ok. 4,47 j., odnowienie po lądowaniu), coyote time i bufor, szybowanie, ślizg (niższe pole), szybkie opadanie ze ślizgiem, zeskok z platformy, platformy na 3 poziomach osiągalne skokiem; **czas reakcji ≥ 1,1 s** na 6 rozmiarach ekranu przy 3 prędkościach i dla obiektów szybszych od świata; przeszkody (grafiki w katalogu, ≥ 4 Pracu i ≥ 4 Amic, dymek i znak — ślizg przechodzi, stojąca sowa nie); ≥ 30 wzorów, ≥ 6 w każdym progu, oddech w każdym progu, wszystkie rodzaje przeszkód użyte; **każdy wzór do przejścia bez trafienia przy 4,25, 7 i 11,55 j./s** (przeszukiwanie wszerz decyzji co 1/15 s: nic / dotknięcie z przytrzymaniem / puszczenie / przesunięcie w dół, stany łączone na siatce 0,1 j. i 0,5 j./s) i kontrola, że przeszukiwanie wykrywa wzór nie do przejścia; progi; generator (oddech na starcie i po trudnym wzorze, bez powtórzeń, powtarzalny z ziarnem); prędkość i Tryb Przytulny; Chmura Pracu (trafienia, nietykalność, oddalenie po 400 m, koniec gry, Tryb Przytulny bez końca); combo i wzór wyniku; powtarzalny bieg z ziarnem; dotyk (skok po 60 ms, stuknięcie, przesunięcie w dół zamiast skoku). E4c: kózki pojawiają się co 180–320 m (pierwsza po ≥ 90 m, nigdy dwa razy ten sam rodzaj, każda ma grafikę stania i skoku, łuk podskoku 1,3 j.); Sprężynka (super-skok > 5 j.), Tarcza (pochłania trafienie), Turbo (×1,5, nietykalność, potem chwila nietykalności), Magnes (przyciąga liść poza zasięgiem), Podwajaczka (liście ×2); tęczowy liść — Gorączka 8 s, dodatkowy rząd liści, liście ×2; Plusk-o-metr — 3 bąbelki uruchamiają rejs w tej samej klatce, bez przeszkód i bez obrażeń, stuknięcie wyrzuca humbaka, po 20 s premia ≥ 200 i następny wzór to oddech; 6 biomów, przenikanie 60 m, mieszanie kolorów, szybsze okrążenia, zdarzenie `biome` po `warp(1000)`.
- `tests/e2e/telefon/ucieczka.spec.js` (profile telefonów): start i skok po stuknięciu, 5 s biegu; pauza z HUD, odliczanie „3”, wznowienie; ukrycie karty → pauza „Witaj z powrotem”; obrót telefonu → pauza bez resetu biegu; koniec biegu → wyniki („Nowy rekord!”, „1. miejsce”, „Jeszcze raz” widoczne na ekranie) i nowy bieg; 320 × 568: karta tytułowa i HUD bez nakładania i przewijania w bok; emulator: wcześniejsze top 10 zostaje, wynik trafia na 2. miejsce, rekord i liczba biegów w profilu; kózka Tarcza → chip „Tarcza” w HUD, pełny Plusk-o-metr → rejs (`is-bonus`, „Rejs na humbaku” w etykiecie i komunikacie), stuknięcie wyrzuca humbaka, `warp(1000)` → komunikat „Miasto”.

## Checklista smaczków SowaRunner (zadanie 4.0)

Elementy obecnej gry do przeniesienia przed usunięciem `SowaRunner/` (Analiza 2, rozdz. 9 „Ryzyka”):

| Element obecnej gry                                                                                                                   | Stan w Sowiej Ucieczce                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Teksty „Ojej! Pracu Pracu!”, „Twarde lądowanie w Amic!”, „Dziura w trasie!”                                                           | ✅ komunikaty trafień                                                     |
| „O włos!” / „O włos nad Amic!” / „Pracu Pracu minięte!” (+25)                                                                         | ✅ „O włos! +25” (E4d: warianty tekstu wg rodziny)                        |
| Combo z progami (×2–×5) i komunikat „Combo ×N!”                                                                                       | ✅ combo co 10 liści, maks. ×5                                            |
| Złote liście (+50) i tęczowa monstera → „Gorączka monster!”                                                                           | ✅ złote i tęczowe liście; Gorączka Monster 8 s (liście ×2, więcej liści) |
| „Deszcz monster! 🌿”, „Kozi maraton! 🐐” (wydarzenia)                                                                                 | ✅ zastąpione: Gorączka Monster i kózki co 180–320 m                      |
| Skacząca koza — boost / „Skacząca koza! Boost!”                                                                                       | ✅ 5 kózek: Sprężynka, Tarcza, Magnes, Turbo, Podwajaczka                 |
| Mini-gra z humbakiem („Humbak dał +N pkt”)                                                                                            | ✅ „Rejs na humbaku” i „Humbacza premia +N”                               |
| Dodatkowe życia („Dodatkowe życie!”, „Maks żyć: +120 pkt”)                                                                            | ✅ zamienione na Chmurę Pracu (oddalenie po 400 m) — decyzja 2 Analizy 2  |
| Amic jako katapulta („Amic odpala katapultę!”)                                                                                        | ❌ usunięte — Amic jest teraz przeszkodą (Analiza 2, rozdz. 0 pkt 2)      |
| Dziury i ściany w trasie                                                                                                              | ✅ dziury; ściana → ściana karteczek z luką                               |
| Przeciwny wiatr z ostrzeżeniem („Uwaga: nadciąga wiatr…”)                                                                             | ✅ zastąpiony ostrzeżeniem „!” przed szybszymi obiektami                  |
| Zmiana pory dnia (noc)                                                                                                                | ✅ biom „Noc nad morzem” (gwiazdy, księżyc, świetliki)                    |
| „Idealnie! +N” (perfekcyjne lądowanie)                                                                                                | ⏳ E4d                                                                    |
| Komentarze sowy („Hu-hu! Ale lot!”, „Pracu Pracu? Nie dzisiaj!”, „Skrzydła w gotowości!”, „Monstera zauważona!”, „Basen już blisko!”) | ⏳ E4d (z ustawieniem „Komentarze sowy”)                                  |
| Garderoba (9 dodatków), ślad bąbelków                                                                                                 | ✅ dodatek z profilu na sowie; ślad bąbelków jako cząsteczki              |
| Poziomy Chill / Arcade / Chaos z osobnymi rekordami                                                                                   | ✅                                                                        |
| Wyzwanie dnia (`?daily=1`), ziarno (`?seed=`)                                                                                         | ✅ ziarno; wyzwanie dnia w E4d                                            |
| Tryb diagnostyczny `?debug=1`                                                                                                         | ⏳ E4e                                                                    |
