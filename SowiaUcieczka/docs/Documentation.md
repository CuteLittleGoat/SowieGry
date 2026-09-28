# Sowia Ucieczka — dokumentacja techniczna

Nowa wersja SowaRunner (Analiza 2, rozdz. 3.1; Analiza 3, etap E4), zbudowana od zera na Sowim Silniku (`shared/engine/`), Sowim Świecie (`shared/world/`) i wspólnym interfejsie (`shared/ui/`). Do akceptacji właściciela działa jako **wersja podglądowa** w folderze `SowiaUcieczka/`; stara gra działa dalej w `SowaRunner/`. Obie wersje mają ten sam identyfikator w bazie — **`runner`** — więc rekordy, top 10 i historia są wspólne.

Stan: **E4a** — rdzeń gry i pełny zestaw wzorów. Kolejne kroki: kózki, Plusk-o-metr, „Rejs na humbaku” i 6 biomów (E4c); zadania biegu, Sowi mnożnik, wyzwanie dnia (E4d); samouczek, muzyka, ilustracja w menu (E4e); po akceptacji — podmiana folderu (E4f).

## Pliki

```text
SowiaUcieczka/
  index.html      strona gry (ekran tytułowy w HTML, plansza na płótnie)
  style.css       wygląd ekranu tytułowego
  package.json    { "type": "module" } — pliki .js to moduły ES
  config.js       wszystkie parametry (fizyka, sowa, poziomy trudności, kamera, chmura, punktacja, generator)
  physics.js      ruch sowy (czysta logika)
  camera.js       kamera i czas reakcji (czysta logika + kamera biegu)
  obstacles.js    przeszkody Pracu / Amic i ich pola kolizji
  patterns.js     37 wzorów trasy i generator
  game.js         logika biegu (świat, zdarzenia, trafienia, Chmura Pracu, combo) — bez DOM
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
- Telefon poziomo (`max-height: 500px`): mniejsze odstępy, tytuł 26 px, bez opisu i dopisku.

## `config.js` — parametry

| Stała                     | Wartości                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GAME_ID`                 | `"runner"`                                                                                                                                                                                                                                                                                                                                                                      |
| `PHYSICS`                 | grawitacja 38 j./s², skok 14 j./s (szczyt 2,58 j. po 0,37 s), podwójny skok 12 j./s (+1,89 j.), maks. opadanie 22, szybowanie: opadanie 1,6 j./s, hamowanie 40, maks. 1,5 s na wybicie, od 0,15 s przytrzymania; szybkie opadanie 18 j./s; ślizg 0,6 s; coyote 0,1 s; bufor skoku 0,12 s; `pressDelay` 0,06 s (dotyk: skok albo ślizg); wpadnięcie do dziury głębiej niż 1,2 j. |
| `OWL`                     | rysunek 1,2 j.; pole kolizji 0,8 × 1,0 j. (ok. 80% rysunku), w ślizgu 0,96 × 0,55 j.; sowa na 18% szerokości ekranu                                                                                                                                                                                                                                                             |
| `PLATFORM_LEVELS`         | 2,2 / 4,2 / 6,2 j. nad ziemią; grubość platformy 0,35 j.                                                                                                                                                                                                                                                                                                                        |
| `DIFFICULTIES`            | Chill 5 → 7,5 j./s w 200 s, progi ×1,4, odstępy ×1,25; Arcade 6 → 9 j./s w 180 s, ×1, ×1; Chaos 7 → 10,5 j./s w 150 s, progi ×0,6, odstępy ×0,8                                                                                                                                                                                                                                 |
| `COZY_SPEED`              | 0,85 (Tryb Przytulny, tylko Chill)                                                                                                                                                                                                                                                                                                                                              |
| `MIN_SPEED` / `MAX_SPEED` | 4,25 / 10,5 j./s                                                                                                                                                                                                                                                                                                                                                                |
| `TIER_DISTANCE`           | progi wzorów 0 / 300 / 900 / 1800 m (× `tierScale`)                                                                                                                                                                                                                                                                                                                             |
| `VIEW`                    | `minWorld` 11 × 10 j.; ziemia na 80% wysokości (ekran tytułowy 42%); miejsce na HUD 2,2 j.; cel reakcji 1,2 s (wymaganie 1,1 s); min. powiększenie 0,6; tempo oddalania 1,5/s; podążanie w pionie 6/s; `moverLead` 1,3 s                                                                                                                                                        |
| `CLOUD`                   | 3 kroki, 400 m bez trafienia oddala o krok, 1,5 s nietykalności po trafieniu                                                                                                                                                                                                                                                                                                    |
| `SCORE`                   | 1 pkt/m; liść zielony 10 pkt (1 liść), złoty 50 (5 liści), tęczowy 100 (1 liść); „O włos!” +25 przy odstępie < 0,35 j.; combo +1 co 10 liści, maks. ×5                                                                                                                                                                                                                          |
| `TRACK`                   | odstęp między wzorami 0,45 s × prędkość (min. 3 j.), wzory generowane 40 j. przed sową, sprzątanie 12 j. za sową, bez powtórzeń ostatnich 3                                                                                                                                                                                                                                     |

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
- `reactionTime({ cssWidth, cssHeight, speed })` — z `computeLayout` Sowiego Silnika i `targetZoom`; test: ≥ 1,1 s dla 320 × 568 … 1280 × 720 przy 4,25, 7 i 10,5 j./s (320 × 568 przy 10,5 j./s: powiększenie ok. 0,69, reakcja 1,2 s).
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

`createTrack({ difficulty, random, patterns })` → `choose(dystans)`: pula = wzory do bieżącego progu (wzory progu 0 tylko na progu 0 albo do 120 m); pierwszy wzór i wzór po `hard` — oddech; oddechy tylko z bieżącego progu; bez ostatnich 3 wzorów; wagi: bieżący próg ×3, niższe ×1. `gapAfter(v, poziom)` = max(3, 0,45 · v) × `gap` poziomu.

## `game.js` — logika biegu

- `speedAt(t, poziom, przytulny)` — `start + (max − start) · (1 − (1 − u)²)`, `u = t / rampSeconds` (ease-out), ×0,85 w Trybie Przytulnym.
- `comboLevel(seria)` = min(5, 1 + ⌊seria / 10⌋).
- `createWorld()` — dziury i platformy (posortowane po x): `groundAt(x)` (sowa stoi, dopóki odcinek x ± 0,25 nie jest w całości nad dziurą), `surfaceAt`, `surfaceBelow` (platformy jednostronne: lądowanie tylko z góry, pomijana platforma zeskoku), `cleanup`.
- `createRun({ difficulty, seed, cozy, random, patterns, startDistance })` — ziarno przez `createRng(seed).next`; `state`: czas, prędkość, dystans, sowa, świat, przeszkody, liście, koniec trasy, `cloud` (3), `sinceHit`, nietykalność, oszołomienie, wynik, punkty liści, liczba liści, seria, combo i najlepsze combo, „O włos!”, trafienia, koniec (`ended`, `endReason`), ostatnie wzory. Tryb Przytulny tylko z Chill.
  - Wejście: `press(source)` — przytrzymanie od teraz; klawiatura skacze od razu, dotyk czeka 0,06 s (`pendingPress`), bo może to być przesunięcie w dół; `release()` — koniec przytrzymania, a krótkie stuknięcie skacze od razu; `swipe("down")` — anuluje czekający skok i daje ślizg / nurkowanie / zeskok; `swipe("up")` — skok.
  - `update(dt)`: czas, prędkość, czekające dotknięcie, `stepOwl`, dystans, nietykalność; 400 m bez trafienia → chmura +1 (`cloudBack`); wpadnięcie do dziury → trafienie `dziura`, sowa wraca na ziemię 0,6 j. za dziurą (`fall`); dokładanie wzorów (`spawn`); obiekty: ruchome ruszają z odległości `moverTriggerDistance` (`warning`), kolizja → `hit(rodzina, rodzaj)`, minięcie z odstępem < 0,35 j. → „O włos!” (`nearMiss`), liście w promieniu 0,4 j. od pola sowy → `leaf { kind, points (× combo), count, combo }`; wynik = ⌊dystans⌋ + punkty liści + 25 × „O włos!”; sprzątanie.
  - `hit(by, variant)` — w czasie nietykalności nic; chmura −1, nietykalność 1,5 s, oszołomienie 0,5 s, combo −1 poziom; przy 0: koniec `chmura` (w Trybie Przytulnym chmura zostaje na 1).
  - `end(powód)`, `takeEvents()`, `summary()` → `{ score, distance, leaves, bestCombo, nearMisses, hits, durationMs, difficulty }`.

## `render.js` — rysowanie

`createRenderer({ canvas, view, camera, atlas })` → `draw({ state, animator, cosmetic, particles, biome, dt, showCloud })`, `popup(tekst, x, y, kolor, rozmiar)`, `clearPopups()`. Kolejność:

1. niebo — gradient biomu (pamiętany dla rozmiaru ekranu), w pikselach CSS;
2. chmury (paralaksa 0,8, co 9 j., część pominięta pseudolosowo), wzgórza dalekie (paralaksa 0,75, kolor `far`) i bliskie (0,45, `mid`) z łuków kwadratowych;
3. ziemia: gleba z kreskami, trawa 0,28 j. + ciemny pas; dziury — ciemny dół (`--kontur`) z jaśniejszymi ściankami;
4. platformy: zaokrąglone deski (gleba, kontur 0,05 j.) z pasem trawy;
5. liście z atlasu (`lisc-zielony` 0,6 j., złote i tęczowe 0,7 j.), unoszenie ±0,06 j. i kołysanie;
6. przeszkody z atlasu (cień pod stojącymi na ziemi; telefon i budzik drgają; trafione półprzezroczyste); ściana karteczek — karteczki 0,6 j. w 4 kolorach (`#fff39a`, `#ffc8d5`, `#c8f0ff`, `#d7f7c2`), przekrzywione, z czerwonymi „bazgrołami”;
7. **Chmura Pracu** (poza ekranem tytułowym): szaro-fioletowa (`#6d6480`) chmura z groźnymi brwiami i oczami, 3,6 j. nad ziemią; 3 kroki — wystaje zza lewej krawędzi, 2 — w połowie widoczna (×1,1), 1 — tuż nad sową (×1,25); wylatują z niej małe dymki „Pracu pracu!”;
8. sowa (`drawOwl` z garderobą z profilu, cień na ziemi albo platformie, miganie w czasie nietykalności, w ślizgu spłaszczona ×1,18 / ×0,62);
9. cząsteczki, napisy punktów (Fredoka 700, kontur, unoszą się 0,9 s);
10. ostrzeżenia „!” — czerwone (Pracu) albo amicowe koła 34 px przy prawej krawędzi dla ruchomych obiektów jeszcze poza ekranem, pulsujące.

`BIOMES` — na razie „Łąka” (niebo `#bfe9ff` → `#fff6e3`, wzgórza `#a8dcc0` / `#7fcf9c`, trawa monstera, gleba `#c98f5e` / `#a8714a`); pozostałe biomy w E4c.

## `main.js` — strona gry

- Widok `createView({ minWorld: 11 × 10 })`, kamera biegu, atlas (64 × DPR pikseli na jednostkę), renderer, cząsteczki (240), animator sowy, pętla `createLoop`, powłoka `createShell({ overlay: false })` (auto-pauza, odliczanie, „Oszczędzanie baterii” → gęstość cząsteczek 0,4).
- Interfejs: `createHud` (pauza, wynik, liście, **życia = kroki Chmury Pracu**), `createToasts` (w biegu 1 komunikat), `createPauseMenu` (instrukcja `ucieczka`, garderoba, ustawienia; w Trybie Przytulnym dodatkowo „Zakończ bieg”), `createResults` („Jeszcze raz”, „Menu”). Komunikaty Akademii i Galerii (`window.SowieNotifications`) w trakcie biegu czekają na ekran wyników.
- Ekran tytułowy: wybór poziomu (zapamiętany w dokumencie gry `difficulty`, `updateGame` po 2 s), rekord poziomu z `SowieCloud.records("runner", poziom)`, „Jak grać?” (okno z `guideFor("ucieczka")`). Sowa stoi, kamera pokazuje ją nad kartą (ziemia na 42%).
- **Bieg startuje dopiero po wczytaniu dokumentu gry** (`SowieCloud.ready` → `loadGame("runner")`) — inaczej zapis wyniku nadpisałby top 10.
- `startRun()`: nowy `createRun` (ziarno `?seed=` + poziom albo losowe), HUD, blokada skali widoku (pasek adresu nie zmienia skali), `shell.setActive(true)`, `SowieProgress.beginRun("runner", { difficulty, daily })`.
- Zdarzenia → dźwięki (skok, podwójny skok, szybowanie w pętli, ślizg, lądowanie, liść z rosnącą wysokością w serii, złoty i tęczowy liść, trafienie Pracu / Amic, „O włos!” — „połączenie”, dzwonek przy ostrzeżeniu o Pracu, życie przy oddaleniu chmury, odliczanie), wibracja 30 ms przy trafieniu, wstrząs kamery (bez przy ograniczeniu ruchu), zatrzymanie klatki 60 ms przy trafieniu, cząsteczki, napisy punktów, komunikaty („Combo ×N!”, „Ojej! Pracu Pracu!”, „Twarde lądowanie w Amic!”, „Dziura w trasie!”, „Chmura Pracu się oddala!”), zdarzenia SowieProgress (`leaf:collected`, `combo`, `hit`, `near-miss`).
- `finishRun()`: `SowieCloud.submitRun("runner", { score, distance, leaves, difficulty, durationMs })` (rekord poziomu, top 10, historia, wyzwanie dnia z `?daily=1`), `SowieProgress.endRun({ score, distance, bestChain })` (misje Akademii i zdjęcia Galerii), dźwięk rekordu albo „koniec gry”, ekran wyników: tytuł („Chmura Pracu Cię dogoniła!” / „Koniec biegu!”), wynik, rekord, „Nowy rekord!”, liście, miejsce w top 10, zadania, Dystans, Najlepsze combo, „O włos!”, odłożone komunikaty.
- Gesty (`bindInput` na planszy): dotknięcie → `press("touch")` (klawiatura `press("keyboard")`), puszczenie → `release`, przesunięcie → `swipe`, P / Esc → pauza; na ekranie tytułowym Spacja startuje bieg. Dotknięcia przycisków na planszy nie są gestami (`INTERACTIVE` w `shared/engine/input.js`).
- Animacja sowy: oszołomienie po trafieniu, w powietrzu „skok” albo „szybowanie”, na ziemi „bieg”, na ekranie tytułowym „stoi”; lądowanie = spłaszczenie proporcjonalne do prędkości.
- Po `SowieCloud.ready`: poziom z dokumentu gry, klasa `sowie-reduced-effects` z ustawień, zdarzenie `game:visit` (misja tygodnia).
- `window.SowiaUcieczka` (testy): `screen()`, `ready()`, `state()`, `start(poziom)`, `end()`, `hit(rodzina)`, `camera()`, `atlasReady()`.

## Chmura w bazie

Identyfikator `runner`. `SowieCloud` rozpoznaje stronę jako grę `runner` po `GAME_REGISTRY[…].preview.path` (`"SowiaUcieczka/"`), więc przy starcie wczytuje dokument `sowiegry/profil/sowiegry_gry/runner` (top 10, rekordy dnia) tak samo jak strona `SowaRunner/`. Rekordy: `profil.records.runner.{chill|arcade|chaos}` (`bestScore`, `bestDistance`), `runs`.

## Testy

- `tests/unit/ucieczka.test.mjs`: skok (szczyt ok. 2,58 j., podwójny ok. 4,47 j., odnowienie po lądowaniu), coyote time i bufor, szybowanie, ślizg (niższe pole), szybkie opadanie ze ślizgiem, zeskok z platformy, platformy na 3 poziomach osiągalne skokiem; **czas reakcji ≥ 1,1 s** na 6 rozmiarach ekranu przy 3 prędkościach i dla obiektów szybszych od świata; przeszkody (grafiki w katalogu, ≥ 4 Pracu i ≥ 4 Amic, dymek i znak — ślizg przechodzi, stojąca sowa nie); ≥ 30 wzorów, ≥ 6 w każdym progu, oddech w każdym progu, wszystkie rodzaje przeszkód użyte; **każdy wzór do przejścia bez trafienia przy 4,25, 7 i 10,5 j./s** (przeszukiwanie wszerz decyzji co 1/15 s: nic / dotknięcie z przytrzymaniem / puszczenie / przesunięcie w dół, stany łączone na siatce 0,1 j. i 0,5 j./s) i kontrola, że przeszukiwanie wykrywa wzór nie do przejścia; progi; generator (oddech na starcie i po trudnym wzorze, bez powtórzeń, powtarzalny z ziarnem); prędkość i Tryb Przytulny; Chmura Pracu (trafienia, nietykalność, oddalenie po 400 m, koniec gry, Tryb Przytulny bez końca); combo i wzór wyniku; powtarzalny bieg z ziarnem; dotyk (skok po 60 ms, stuknięcie, przesunięcie w dół zamiast skoku).
- `tests/e2e/telefon/ucieczka.spec.js` (profile telefonów): start i skok po stuknięciu, 5 s biegu; pauza z HUD, odliczanie „3”, wznowienie; ukrycie karty → pauza „Witaj z powrotem”; obrót telefonu → pauza bez resetu biegu; koniec biegu → wyniki („Nowy rekord!”, „1. miejsce”, „Jeszcze raz” widoczne na ekranie) i nowy bieg; 320 × 568: karta tytułowa i HUD bez nakładania i przewijania w bok; emulator: wcześniejsze top 10 zostaje, wynik trafia na 2. miejsce, rekord i liczba biegów w profilu.

## Checklista smaczków SowaRunner (zadanie 4.0)

Elementy obecnej gry do przeniesienia przed usunięciem `SowaRunner/` (Analiza 2, rozdz. 9 „Ryzyka”):

| Element obecnej gry                                                                                                                   | Stan w Sowiej Ucieczce                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Teksty „Ojej! Pracu Pracu!”, „Twarde lądowanie w Amic!”, „Dziura w trasie!”                                                           | ✅ komunikaty trafień                                                    |
| „O włos!” / „O włos nad Amic!” / „Pracu Pracu minięte!” (+25)                                                                         | ✅ „O włos! +25” (E4d: warianty tekstu wg rodziny)                       |
| Combo z progami (×2–×5) i komunikat „Combo ×N!”                                                                                       | ✅ combo co 10 liści, maks. ×5                                           |
| Złote liście (+50) i tęczowa monstera → „Gorączka monster!”                                                                           | ✅ złote i tęczowe liście (gorączka: E4c)                                |
| „Deszcz monster! 🌿”, „Kozi maraton! 🐐” (wydarzenia)                                                                                 | ⏳ E4c (kózki, gorączka)                                                 |
| Skacząca koza — boost / „Skacząca koza! Boost!”                                                                                       | ⏳ E4c (5 kózek)                                                         |
| Mini-gra z humbakiem („Humbak dał +N pkt”)                                                                                            | ⏳ E4c („Rejs na humbaku”)                                               |
| Dodatkowe życia („Dodatkowe życie!”, „Maks żyć: +120 pkt”)                                                                            | ✅ zamienione na Chmurę Pracu (oddalenie po 400 m) — decyzja 2 Analizy 2 |
| Amic jako katapulta („Amic odpala katapultę!”)                                                                                        | ❌ usunięte — Amic jest teraz przeszkodą (Analiza 2, rozdz. 0 pkt 2)     |
| Dziury i ściany w trasie                                                                                                              | ✅ dziury; ściana → ściana karteczek z luką                              |
| Przeciwny wiatr z ostrzeżeniem („Uwaga: nadciąga wiatr…”)                                                                             | ✅ zastąpiony ostrzeżeniem „!” przed szybszymi obiektami                 |
| Zmiana pory dnia (noc)                                                                                                                | ⏳ E4c (biom „Noc nad morzem”)                                           |
| „Idealnie! +N” (perfekcyjne lądowanie)                                                                                                | ⏳ E4d                                                                   |
| Komentarze sowy („Hu-hu! Ale lot!”, „Pracu Pracu? Nie dzisiaj!”, „Skrzydła w gotowości!”, „Monstera zauważona!”, „Basen już blisko!”) | ⏳ E4d (z ustawieniem „Komentarze sowy”)                                 |
| Garderoba (9 dodatków), ślad bąbelków                                                                                                 | ✅ dodatek z profilu na sowie (bąbelki jako cząsteczki: E4c)             |
| Poziomy Chill / Arcade / Chaos z osobnymi rekordami                                                                                   | ✅                                                                       |
| Wyzwanie dnia (`?daily=1`), ziarno (`?seed=`)                                                                                         | ✅ ziarno; wyzwanie dnia w E4d                                           |
| Tryb diagnostyczny `?debug=1`                                                                                                         | ⏳ E4e                                                                   |
