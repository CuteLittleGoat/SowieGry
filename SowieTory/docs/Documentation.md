# Sowie Tory — dokumentacja techniczna

Przebudowana gra **Sowa3** (Analiza 2, rozdz. 3.2; Analiza 3, etap E5), budowana od zera na Sowim Silniku (`shared/engine/`), Sowim Świecie (`shared/world/`) i wspólnym interfejsie (`shared/ui/`). Na czas prac to **wersja podglądowa** w osobnym folderze `SowieTory/` (Analiza 3, „Podgląd przed podmianą”): w rejestrze gier wpis `sowa3` ma `preview: { path: "SowieTory/", name: "Sowie Tory" }`, więc karta Sowa3 w menu ma przycisk „Wypróbuj nową wersję: Sowie Tory”, a `SowieCloud.currentGame()` rozpoznaje stronę jako grę `sowa3`. Identyfikator w bazie — **`sowa3`** — zostaje, więc rekordy, top 10 i historia są wspólne z obecną Sowa3. Obecna gra (`Sowa3/`) działa bez zmian do czasu podmiany (krok 5.8).

Stan: **E5a** — checklista smaczków obecnej wersji (niżej), rdzeń: rzutnia perspektywiczna z punktem zbiegu i skalą z głębokości, sortowanie po głębokości, mgła, przesuwająca się tekstura drogi, podświetlenie toru pod sową; przesunięcia palcem w 4 kierunkach (tor, skok, ślizg) z martwymi strefami przy krawędziach, stuknięcia przy bokach, klawiatura; przeszkody według typu (niska / wysoka / pełna / ruchoma, długa cysterna) w rodzinach Pracu i Amic; 23 wzory w 4 progach (każdy do przejścia — test); kampania czterech plansz w kolejności z obecnej gry (na razie z prostą scenografią i krótką przerwą zamiast finału); liście, combo, „O włos!”, życia według poziomu, Tryb Przytulny, wyniki i zapis `submitRun`.

## Pliki

```text
SowieTory/
  index.html      strona gry (ekran tytułowy w HTML, plansza na płótnie)
  style.css       wygląd ekranu tytułowego i paska planszy
  package.json    { "type": "module" } — pliki .js to moduły ES
  config.js       wszystkie parametry (tory, rzutnia, sowa, poziomy, trasa, typy przeszkód, ruchomy telefon, punktacja, liście, dźwięki)
  projection.js   rzutnia perspektywiczna (czysta logika)
  physics.js      ruch sowy (czysta logika)
  obstacles.js    przeszkody Pracu / Amic i kolizje według typu
  patterns.js     język wzorów, 23 wzory i generator trasy
  stages.js       cztery plansze kampanii (nazwy, kolory)
  game.js         logika biegu (trasa, trafienia, liście, combo, plansze, koniec) — bez DOM
  render.js       rysowanie na płótnie przez rzutnię
  main.js         strona: silnik, interfejs, dźwięk, SowieProgress, SowieCloud
  docs/           ta dokumentacja i instrukcja dla gracza (README.md)
```

Jednostki: **metry i sekundy**. Świat: `x` — w bok (środek drogi 0, tory co 1,6 m: −1, 0, 1), `y` — w górę od drogi, `z` — w głąb od sowy (sowa zawsze na `z = 0`). Położenia na trasie (`at`) to metry od początku planszy; głębokość obiektu przed sową `z = at − stageDistance`.

## Checklista smaczków obecnej Sowa3 (krok 5.0)

Z obecnych plików `Sowa3/` (`script.js` i 15 warstw). ✅ — jest w Sowich Torach, ⏳ — w kolejnym kroku etapu E5 (numer z planu).

| Smaczek obecnej wersji                                                                                                                                                                                                                                                                                                                                                                    | Sowie Tory                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Trzy tory w głąb ekranu, zmiana toru przesunięciem i stuknięciem przy bokach (`script.js`)                                                                                                                                                                                                                                                                                                | ✅ przesunięcia w 4 kierunkach + stuknięcia przy bokach (środek — skok), klawiatura                                                             |
| Plansze w kolejności: supermarket → wystawa kwiatów → blokowisko PRL → stacja paliw Amic (`script.js`, `amic-stage.js`)                                                                                                                                                                                                                                                                   | ✅ `stages.js`: Biedronka → festiwal roślin → blokowisko PRL → stacja Amic (nazwy z wymagań właściciela)                                        |
| Supermarket: regały, „PROMO” / „SUPER CENA!”, automat/piekarnia po lewej, pracownik z paleciakiem przy prawym brzegu, palety z towarem (`visual-polish.js`, `stage-ambience.js`, `stage-obstacles.js`)                                                                                                                                                                                    | ⏳ 5.2 (oprawa planszy Biedronka)                                                                                                               |
| Wystawa kwiatów: hala, stojaki z roślinami, boczne wózki pełne roślin, zraszacze tylko z boków, napis „WYSTAWA KWIATÓW”, tłum ludzi („Tłum na wystawie kwiatów!”)                                                                                                                                                                                                                         | ⏳ 5.2 (ludzie jako dekoracja bez kolizji)                                                                                                      |
| Blokowisko PRL: bloki z wielkiej płyty z oknami, trzepak i ławka po lewej, kot wysoko na prawym balkonie, gołębie wysoko, betonowe słupki, dziki zmieniające tor („Dzik zmienia tor!”)                                                                                                                                                                                                    | ⏳ 5.2 i 5.3 (pościg dzików)                                                                                                                    |
| Stacja Amic: sklep i stacja w tle, zadaszenie z zielonym pasem, dystrybutory, auta, kanistry („Stacja Amic blokuje tor!”)                                                                                                                                                                                                                                                                 | ✅ przeszkody Amic (dystrybutor, znak z cenami, cysterna, kanister, barierka, wózek); ⏳ 5.2 oprawa                                             |
| Przeszkody i teksty: „Przyjmiesz zmianę? Nie!”, „Telefon od Magdy!”, „Stacja Amic blokuje tor!”, „Donica na torze!”, „Betonowy słupek!”, „Paleta z towarem!”                                                                                                                                                                                                                              | ✅ tablica „Przyjmiesz zmianę?”, telefon „Magda”, etykiety trafień w `OBSTACLES`; ⏳ 5.2 donice i słupki jako dekoracja bez kolizji (Analiza 2) |
| Korytarz czytelności: dekoracje tylko przy bokach i nad horyzontem (`visibility-corridor.js`)                                                                                                                                                                                                                                                                                             | ✅ scenografia projektowo poza korytarzem trzech torów                                                                                          |
| Balans torów: zawsze jest tor ucieczki (`lane-balance.js`), ruch blisko gracza tylko z ostrzeżeniem (`moving-obstacle-safety.js`)                                                                                                                                                                                                                                                         | ✅ wzory zamiast losowości + test przejścia każdego wzoru z każdego toru; ruchomy telefon z 0,8 s ostrzeżenia                                   |
| Poziomy trudności: „Spokojny lot” 4 życia, „Sowi zawodnik” 3, „Królowa alejek” 2 życia (`difficulty.js`), rekord na poziom w `profil.records.sowa3`                                                                                                                                                                                                                                       | ✅ Chill 4 / Arcade 3 / Chaos 2, rekordy na poziom przez `submitRun`                                                                            |
| Dodatkowe życia („Dodatkowe życie!”, „Maks żyć: +150 pkt”, `extra-lives.js`)                                                                                                                                                                                                                                                                                                              | ⏳ 5.6 (kózki i premie)                                                                                                                         |
| Combo („Combo ×N!”), złoty liść („ZŁOTY +…”), Gorączka monster („Gorączka monster! 🌿”), „O włos! +…” (`cute-rework.js`)                                                                                                                                                                                                                                                                  | ✅ combo ×1–×5, złoty liść, „O włos!”; ⏳ 5.6 Gorączka Monster (najczęstsza na festiwalu roślin)                                                |
| Finał: ogród działkowy z basenem („Meta: ogród działkowy z basenem!”, „Ogród działkowy! +250”), szara ryflowana ścianka, niebieski rant, turkusowa woda z falami, trawa, płot, drzewa; koza na leżaku i grill; wskok, „CHLUP!”, „Sowa zmieniła się w humbaka!”; skracanie tapnięciem po pierwszym obejrzeniu (`finishSeen`) (`finish-pool.js`, `finish-details.js`, `finish-controls.js`) | ✅ premia 250 pkt i komunikat „Meta: ogród działkowy z basenem!”; ⏳ 5.4 sekwencja z basenem i przemianą, 5.5 „Humbacze Tory”                   |
| Przechylenie, reakcje, gwiazdki po trafieniu, ślad bąbelków (`animation-polish.js`)                                                                                                                                                                                                                                                                                                       | ✅ animator sowy (bieg, skok, radość, lądowanie), miganie po trafieniu; ⏳ 5.6 garderoba „Ślad bąbelków”                                        |
| Muzyka zmieniana między planszami (`finish-controls.js`)                                                                                                                                                                                                                                                                                                                                  | ⏳ 5.7 (muzyka na każdą planszę)                                                                                                                |
| Pauza blokuje wszystkie warstwy (`pause-guard.js`)                                                                                                                                                                                                                                                                                                                                        | ✅ powłoka telefonu (`shared/engine/shell.js`) zatrzymuje pętlę                                                                                 |

## `index.html`

- `<html lang="pl" class="sowie-shell">`; `<head>`: `viewport` z `viewport-fit=cover`, `theme-color` `#bfe9ff`, opis („Sowie Tory — trzy tory w głąb ekranu: sklep Biedronka, festiwal roślin, blokowisko PRL i stacja Amic.”), tytuł „Sowie Tory — SowieGry”, manifest i ikony PWA, `mobile-web-app-capable`, `apple-mobile-web-app-*`; skrypty w kolejności: `../config/firebase-config.js`, `../shared/sowie-platform.js`, `../shared/sowie-cloud.js`, `../shared/password-gate.js`, `../shared/pwa.js`; `preload` czcionki `fredoka-700.woff2`; style: `../shared/cute-ui.css`, `../shared/world/tokens.css`, `../shared/engine/shell.css`, `../shared/ui/ui.css`, `style.css`; `../shared/sowie-academy.js` i `../shared/owl-gallery.js` z `defer`; moduł `main.js`. Strona nie ładuje `sowie-core.js` ani starych warstw Sowa3.
- `<body data-sowie-game="sowa3">` → `<main class="sowie-stage tory-stage" data-stage aria-label="Sowie Tory">` z płótnem `[data-canvas]` (`aria-hidden`) i ekranem tytułowym `section.tory-title[data-title]` (`aria-labelledby`):
  - `h1#tory-title-heading` „Sowie Tory”, `p.tory-title-lead` „Trzy tory w głąb ekranu! Przesuń palcem: w bok — zmiana toru, w górę — skok, w dół — ślizg.”;
  - grupa `[data-difficulty]` (`role="group"`, „Poziom trudności”) z `button.sowie-ui-chip[data-level]` Chill / Arcade / Chaos (`aria-pressed`, domyślnie Arcade);
  - `p.tory-title-record[data-record]` (rekord), `p.tory-title-note[data-cozy]` „Tryb Przytulny: wolniej i bez końca gry.” (ukryty);
  - **Start** (`[data-start]`, `.sowie-ui-button.is-primary.is-big`);
  - `.tory-title-actions` (2 kolumny): **Jak grać?** (`[data-guide]`) i **Menu** (`a.is-quiet`, `../`);
  - `p.tory-title-note[data-preview]` „Wersja podglądowa nowej gry. Rekordy liczą się jak w Sowa3.”

## `style.css`

- `.tory-stage` — tło `var(--niebo-gora)`, czcionka `var(--czcionka-sowia)`, kolor `var(--kontur)`; płótno `position: absolute; inset: 0`.
- `.tory-title` — warstwa `absolute`, `inset: 0`, `z-index: 40`, flex przy dolnej krawędzi (zasięg kciuka), odstępy z `env(safe-area-inset-*)` (co najmniej 16 px; dół 20 px lub bezpieczny obszar + 12 px), gradient `rgba(191,233,255,0) 30%` → `rgba(59,47,74,0.25)`, `touch-action: manipulation`; `[hidden]` → `display: none`.
- `.tory-title-card` — siatka z odstępem 10 px, szerokość `min(100%, 440px)`, `max-height: 100%` z przewijaniem, `padding: 18px`, promień 24 px, tło `rgba(255,246,227,0.96)`, cień `0 16px 40px rgba(59,47,74,0.25)`, tekst na środku; `h1` 34 px, pogrubiony, biały z obrysem 7 px `var(--kontur)` (`paint-order: stroke fill`); akapity bez marginesów; `.tory-title-lead` 16 px.
- `.tory-difficulty` — 3 kolumny, odstęp 8 px, chipy min. 48 px wysokości; `.tory-title-record` pogrubiony z cyframi tabelarycznymi; `.tory-title-note` 14 px, przezroczystość 0,85; `.tory-title-actions` — 2 kolumny, odstęp 8 px, odnośniki bez podkreślenia.
- `.tory-progress` (pasek planszy) — `absolute`, `top: max(8px, safe-area-top) + 64px`, na środku (`left: 50%`, `translateX(-50%)`), szerokość `min(60%, 260px)`, siatka (nazwa + pasek), `padding: 4px 12px 6px`, promień 14 px, tło `rgba(255,255,255,0.85)`, cień, 13 px pogrubione, `z-index: 31`, `pointer-events: none`; `.tory-progress-bar` 100% × 8 px, promień 4 px, tło `rgba(59,47,74,0.12)`; wypełnienie `span` w kolorze `var(--woda)`, `transform: scaleX(0)` od lewej.
- `.tory-debug` — panel diagnostyczny w prawym dolnym rogu (bezpieczne obszary), `z-index: 33`, tło `rgba(59,47,74,0.75)`, biały tekst 11 px monospace, `white-space: pre`, bez dotyku.
- `@media (max-height: 500px)` (telefon poziomo): karta z odstępem 6 px i `padding: 12px 16px`, `h1` 26 px, bez opisu sterowania; pasek planszy przy lewej krawędzi pod przyciskiem pauzy (`left: max(12px, safe-area-left)`, szerokość 150 px, bez przesunięcia) — w poziomie horyzont jest nisko i pasek na środku zasłaniałby nadjeżdżające przeszkody.

## `config.js`

- `GAME_ID = "sowa3"`.
- `LANES = { count: 3, width: 1.6, min: -1, max: 1 }`.
- `PROJECTION = { cameraBack: 4.2, roadShare: 0.84, roadHeightShare: 1.15, horizon: 0.3, horizonLandscape: 0.24, owlScreenY: 0.8, farZ: 64, fogStart: 38 }` — kamera 4,2 m za sową; droga przy sowie: 84% szerokości ekranu w pionie, najwyżej 115% wysokości (poziomo); horyzont na 30% (pion) / 24% (poziom) wysokości; sowa na 80% wysokości; mgła od 38 m, całkiem gęsta na 64 m.
- `OWL = { drawSize: 1.25, halfWidth: 0.42, halfDepth: 0.3, height: 1.2, slideHeight: 0.55, jumpVelocity: 7.9, gravity: 24, fastFall: 70, slideTime: 0.7, laneSpeed: 15, jumpBuffer: 0.14, invulnerable: 1.5 }` — skok: szczyt 7,9²/(2·24) ≈ 1,30 m po 0,33 s, w powietrzu ok. 0,66 s; ślizg 0,7 s; zmiana toru 1,6 m / 15 m/s ≈ 0,11 s.
- `DIFFICULTIES` — `chill: { label: "Chill", speedStart: 11, speedMax: 15, stageStep: 0.6, lives: 4, gap: 1.25 }`, `arcade: { "Arcade", 13, 18, 0.8, 3, 1 }`, `chaos: { "Chaos", 15, 21, 1, 2, 0.82 }`; `DIFFICULTY_ORDER = ["chill", "arcade", "chaos"]`; `COZY_SPEED = 0.85`.
- `TRACK = { stageLength: 1200, startClear: 40, finishClear: 60, gap: 22, gapSpeed: 13 }` — plansza 1200 m (ok. 75 s), pierwsze 40 m i ostatnie 60 m bez przeszkód, odstęp po wzorze 22 m przy 13 m/s (skalowany prędkością).
- `OBSTACLE_TYPES = { low: { top: 0.7, depth: 0.7, action: "skok" }, high: { bottom: 0.85, top: 2.1, depth: 0.5, action: "ślizg" }, full: { top: 2.2, depth: 1, action: "zmiana toru" } }`.
- `MOVING = { warning: 0.8, switchTime: 0.35, lead: 0.6 }` — ruchomy telefon: strzałka 0,8 s przed ruchem, przejazd 0,35 s, koniec co najmniej 0,6 s przed sową.
- `SCORE = { leaf: 10, comboStep: 8, comboMax: 5, perMeter: 0.5, stageBonus: 250, noHitBonus: 300 }`.
- `LEAVES = { height: 0.6, reachX: 0.7, reachZ: 0.8, spacing: 3 }`.
- `GAME_SOUNDS` — efekty wczytywane po pierwszym dotknięciu: `skok`, `slizg`, `ladowanie`, `lisc`, `trafienie-pracu`, `trafienie-amic`, `zycie`, `rekord`, `koniec-gry`, `odliczanie`, `odliczanie-start`, `hu-hu`, `dzwonek`, `polaczenie` (`lisc-zloty` wczytuje się przy pierwszym użyciu).

## `projection.js` — rzutnia perspektywiczna

- `ROAD_WIDTH = LANES.count × LANES.width` (4,8 m); `laneX(tor) = tor × 1,6`.
- `computeProjection({ width, height, config = PROJECTION })` → układ: `portrait = height ≥ width`; `roadPx = min(width × roadShare, height × roadHeightShare)` (szerokość drogi przy sowie w px); ogniskowa `focal = roadPx × cameraBack / ROAD_WIDTH`; `horizonY = height × (portrait ? horizon : horizonLandscape)`; `owlY = height × owlScreenY`; wysokość kamery `cameraHeight = (owlY − horizonY) × cameraBack / focal` (dobrana tak, żeby droga pod sową wypadła na `owlY`); zwraca też `centerX = width / 2`, `farZ`, `fogStart`.
- `project(layout, x, y, z, out)` → `{ x, y, scale }` albo `null` (głębokość od kamery `z + cameraBack ≤ 0,05`): `scale = focal / (z + cameraBack)` (piksele na metr), `x' = centerX + x × scale`, `y' = horizonY + (cameraHeight − y) × scale`. Punkt zbiegu: przy `z → ∞` punkt drogi trafia w `(centerX, horizonY)`.
- `depthAtScreenY(layout, screenY)` — odwrotność rzutu dla drogi (`y = 0`): `focal × cameraHeight / (screenY − horizonY) − cameraBack` (nad horyzontem — `Infinity`); renderer liczy z niej najbliższą widoczną głębokość (dół ekranu).
- `fogAt(layout, z)` — 0 do `fogStart`, potem liniowo do 1 na `farZ`.
- `visibleSeconds(speed)` = `(fogStart + (farZ − fogStart) × 0,5) / speed` — czas od wyłonienia się przeszkody z mgły (mgła 50%, `z = 51 m`) do zderzenia; liczony w głębokości, więc taki sam na każdym ekranie: przy największej prędkości (Chaos na 4. planszy: 21 + 3 × 1 = 24 m/s) ok. 2,1 s, przy 18 m/s (koniec 1. planszy Arcade) ok. 2,8 s.

## `physics.js` — ruch sowy

- `createOwlBody(lane = 0)` → `{ lane, x: laneX(lane), y: 0, vy: 0, grounded: true, slide: 0, buffer: 0, diving: false }`.
- `stepOwl(body, controls, dt, events = [])` — `controls` to jednorazowe polecenia z gestów (`left`, `right`, `up`, `down`):
  - `left` / `right` — tor −1 / +1 (obcięty do −1…1); zmiana → zdarzenie `"lane"`;
  - `up` — bufor skoku `OWL.jumpBuffer` (0,14 s: przesunięcie tuż przed lądowaniem też skacze);
  - `down` — na ziemi: ślizg `OWL.slideTime` i `"slide"`; w powietrzu: `diving = true` (szybkie lądowanie, bufor skoku kasowany);
  - skok, gdy bufor > 0 i sowa na ziemi: `vy = jumpVelocity`, koniec ślizgu, `"jump"`; bufor maleje o `dt`;
  - bok: stała prędkość `laneSpeed` do środka wybranego toru;
  - pion w powietrzu: `vy −= (diving ? fastFall : gravity) × dt`, `y += vy × dt`; przy `y ≤ 0` — lądowanie (`"land"`), a po nurkowaniu od razu ślizg (`"slide"`); na ziemi czas ślizgu maleje.
- `owlTop(body)` — górna krawędź sowy: `y + (slide > 0 ? slideHeight : height)`.

## `obstacles.js` — przeszkody

`OBSTACLES` (rodzaj → `{ family, type, sprite, draw, label, depth? }`; `sprite` z atlasu Sowiego Świata, `draw` — wysokość rysunku w m, `label` — komunikat trafienia):

| Rodzaj        | Rodzina | Typ               | Grafika               | Wys. | Komunikat                  |
| ------------- | ------- | ----------------- | --------------------- | ---- | -------------------------- |
| `teczka`      | pracu   | low               | `pracu-teczka`        | 0,95 | „Teczka pełna papierów!”   |
| `budzik`      | pracu   | low               | `pracu-budzik`        | 0,85 | „Budzik na zmianę!”        |
| `dymek`       | pracu   | high              | `pracu-dymek`         | 1,15 | „Pracu Pracu!”             |
| `tablica`     | pracu   | full              | `pracu-tablica`       | 1,9  | „Przyjmiesz zmianę? Nie!”  |
| `telefon`     | pracu   | full              | `pracu-telefon`       | 1,7  | „Telefon z pracy!”         |
| `magda`       | pracu   | full              | `pracu-telefon-magda` | 1,7  | „Telefon od Magdy!”        |
| `barierka`    | amic    | low               | `amic-barierka`       | 0,9  | „Barierka Amic!”           |
| `kanister`    | amic    | low               | `amic-kanister`       | 0,75 | „Kanister Amic!”           |
| `znak-cen`    | amic    | high              | `amic-znak-cen`       | 3    | „Znak z cenami Amic!”      |
| `dystrybutor` | amic    | full              | `amic-dystrybutor`    | 2    | „Stacja Amic blokuje tor!” |
| `wozek`       | amic    | full              | `amic-wozek`          | 1,4  | „Wózek na torze!”          |
| `cysterna`    | amic    | full, `depth: 10` | `amic-cysterna`       | 2,3  | „Cysterna Amic!”           |

- `OBSTACLE_HALF_WIDTH = 0.65` (przeszkoda 1,3 m w torze 1,6 m).
- `obstacleShape(kind)` → `{ type, top, bottom, depth }` z `OBSTACLE_TYPES` (głębokość z rodzaju, jeśli podana); nieznany rodzaj → błąd.
- `obstacleX(item)` — środek w bok; ruchoma przeszkoda (`moveTo`, `moveProgress` 0–1) przesuwa się z wygładzeniem `p²(3 − 2p)`.
- `collides(body, item, z)` — `z` to przód przeszkody przed sową: brak kolizji, gdy `z > halfDepth` albo `z + depth < −halfDepth`, albo `|x sowy − x przeszkody| ≥ halfWidth + 0,65` (sąsiedni tor jest bezpieczny); niska — kolizja, gdy `y < top`; wysoka — gdy `owlTop > bottom` i `y < top` (ślizg przechodzi pod spodem, skok nie); pełna — zawsze.
- `laneOf(x)` — tor najbliższy położeniu.

## `patterns.js` — wzory i generator

- Język wzorów: rząd `[z, "abc", "liście"]` — trzy znaki dla torów −1, 0, 1. `OBSTACLE_CODES`: małe litery — Pracu (`t` teczka, `b` budzik, `d` dymek, `p` telefon, `m` magda, `s` tablica), wielkie — Amic (`B` barierka, `K` kanister, `Z` znak-cen, `D` dystrybutor, `W` wózek, `C` cysterna); `<` / `>` — ruchomy telefon przejeżdżający o tor w lewo / w prawo (poza drogę — błąd); `.` — pusto; nieznany znak — błąd. Liście: `o` — 4 w linii co 3 m na wysokości 0,6 m, `^` — łuk 5 liści co 1,6 m nad przeszkodą (wysokość `0,6 + 1 × (1 − k²/4)`, `k = −2…2`), `_` — 3 nisko (0,3 m, co 1,4 m) pod wysoką przeszkodą, `g` — złoty liść.
- `pattern(id, próg, długość, tagi, rzędy)` → `{ id, tier, length, tags, items }` (elementy `{ type: "obstacle", kind, lane, z, moveTo? }` i `{ type: "leaf", lane, z, y, kind? }`).
- `PATTERNS` (23): próg 0 — `t0-telefon`, `t0-dystrybutor`, `t0-teczka`, `t0-barierka`, `t0-dymek`, `t0-znak`, oddechy `t0-oddech`, `t0-oddech-zloty`; próg 1 — `t1-dwa-telefony` (`p.m`), `t1-wozki` (`WW.`), `t1-kanistry` (`K.K`), `t1-slalom` (`p..` na 6 m, `..m` na 18 m), `t1-dymki` (`dd.`), `t1-budziki` (`b.b`), `t1-cysterna` (`.C.`); próg 2 — `t2-barierki` (`BBB`), `t2-znaki` (`ZZZ`), `t2-ruchomy` (`.>.` na 14 m), `t2-przyjmiesz-zmiane` (`s.s`, potem `.b.`), `t2-telefon-teczki` (`p.t`, potem `.d.`); próg 3 — `t3-brama` (`D.D`, potem `WtW`), `t3-cysterny` (`C.C` na 8 m, `KDK` na 22 m), `t3-ruchome` (`..<` na 12 m, `>..` na 24 m). `PATTERN_BY_ID` — słownik.
- `TIER_DISTANCE = [0, 300, 900, 1800]`, `tierAt(dystans kampanii)` → 0–3.
- `gapAfter(speed, difficulty)` = `22 × speed / 13 × gap poziomu` (stały czas między wzorami).
- `createTrack({ random, patterns, intro })` → `choose(dystans)`: najpierw wzory z `intro`; co 4. wzór — oddech (`breather`); pozostałe: jedno losowanie na wybór — 60% z bieżącego progu, 40% z progu ≤ bieżącego; bez dwóch ostatnich wzorów; gdy pula jest pusta — dowolny wzór z progu ≤ bieżącego.

## `stages.js` — plansze

`STAGES` (kolejność z obecnej gry, wymaganie właściciela): `{ id, name, short, sky: [góra, dół], floor, lane, accent, fog }`:

| id          | name                                              | short           | niebo                 | podłoga   | akcent    |
| ----------- | ------------------------------------------------- | --------------- | --------------------- | --------- | --------- |
| `biedronka` | Sowa w sklepie Biedronka                          | Biedronka       | `#fff3f3` → `#fffaf0` | `#e8edf2` | `#e2231a` |
| `festiwal`  | Sowa na festiwalu roślin                          | Festiwal roślin | `#fde9f4` → `#eafcef` | `#dcefd8` | `#3fae62` |
| `prl`       | Sowa uciekająca przed dzikami na blokowisku z PRL | Blokowisko PRL  | `#dfe7ef` → `#f6f1e2` | `#d3cdc3` | `#c8553d` |
| `amic`      | Sowa na stacji benzynowej Amic                    | Stacja Amic     | `#e3f4ff` → `#f7fbff` | `#9aa3ab` | `#1f9d55` |

Linie torów: `#ffffff` (PRL `#f2eee6`, Amic `#f4f7f9`); mgła: `#fff6f2`, `#f3fbf2`, `#eeeae1`, `#edf3f6`. `STAGE_COUNT = 4`.

## `game.js` — logika biegu

- `speedAt(postęp 0–1, difficulty, stage, cozy)` = `speedStart + (speedMax − speedStart) × (1 − (1 − u)²) + stage × stageStep` (× 0,85 w Trybie Przytulnym).
- `comboLevel(streak)` = `min(5, 1 + floor(streak / 8))`.
- `moverTrigger(speed)` = `speed × (0,8 + 0,35 + 0,6)` — odległość, z której ruchomy telefon zaczyna ostrzegać.
- `createRun({ difficulty = "arcade", seed, cozy, random, patterns = PATTERNS, intro = [], safe = false, startStage = 0 })` — RNG z ziarnem (`shared/engine/rng.js`); `state`: `difficulty`, `cozy`, `safe`, `phase` (`run` | `stageEnd` | `over`), `time`, `stage`, `stageTime`, `stageDistance`, `distance` (cała kampania), `speed`, `lives` / `maxLives` (z poziomu), `invulnerable`, `hits`, `stageHits`, `stageLeaves`, `leafCount`, `leafPoints`, `bonusPoints`, `streak`, `combo`, `bestCombo`, `nearMisses`, `score`, `trackEnd` (od 40 m), `patterns` (ostatnie 12), `stagesDone`, `owl`, `obstacles`, `leaves`, `endReason`.
  - `spawn()` — dopóki `trackEnd < stageDistance + farZ + 10`: wzór z generatora (dystans kampanii = `stage × 1200 + trackEnd`); gdy nie zmieściłby się przed metą (`1200 − 60`), trasa się kończy (`trackEnd = ∞`); elementy dostają `at = start + z` (przeszkody: `warnedAt: null`, `passed`, `hit`; liście: `taken`), listy są sortowane po `at`; zdarzenie `pattern { id, start, length }`; kolejny wzór po `gapAfter`.
  - `update(dt)` (tylko w `run`): czas, prędkość `speedAt(stageDistance / 1200, …)`, dystans, nietykalność, ruch sowy (`stepOwl` z poleceniami z `input()`, potem zerowanymi; zdarzenia ruchu `jump` / `slide` / `lane` / `land` z `lane`), `spawn`, ruchome przeszkody, przeszkody, liście, sprzątanie (12 m za sową), wynik; na mecie (`stageDistance ≥ 1200`) — `finishStage()`.
  - Ruchome przeszkody: gdy `z ≤ moverTrigger` — `warnedAt = time` i zdarzenie `warning { kind, lane, to }`; po 0,8 s `moveProgress` rośnie o `dt / 0,35`; przy 1 przeszkoda zostaje na nowym torze.
  - Przeszkody (do `z ≤ 3`): minięte (`z + depth < −halfDepth`) → `passed`; „O włos!”, gdy pełna przeszkoda minęła sowę w ciągu 0,45 s od zmiany toru i w odległości w bok < 1,92 m — `nearMisses + 1`, `+25` pkt, zdarzenie `nearMiss { kind, family, bonus }`; kolizja (`collides`) bez nietykalności → `hit`: w trybie bezpiecznym tylko `safeHit`; inaczej trafienia + 1, nietykalność 1,5 s, combo o poziom niżej (`streak = max(0, (combo − 2) × 8)`), życie − 1 (Tryb Przytulny: najmniej 1), zdarzenie `hit { kind, family, label, lives }`, przy 0 życiach koniec (`trafienia`).
  - Liście (do `z ≤ 0,8`, od `z ≥ −0,8`): zebrane, gdy `|x sowy − x toru| < 0,7` i `|y sowy + 0,5 − y liścia| < 0,9`; zielony 10 pkt, złoty 50 pkt i liczy się jak 5 liści; `streak + 1`, combo, `leafPoints += punkty × combo`; zdarzenia `leaf { kind, lane, points, count, combo }` i `combo { value }` przy wzroście.
  - Wynik: `floor((stage × 1200 + stageDistance) × 0,5) + leafPoints + bonusPoints`.
  - `finishStage()` — `phase = "stageEnd"`, `stagesDone + 1`, premia 250 (+300 bez trafienia na planszy), zdarzenie `stageEnd { stage, leaves, hits, bonus, last }`.
  - `nextStage()` — tylko w `stageEnd`: po ostatniej planszy koniec (`kampania`, zwraca `false`); inaczej następna plansza od zera (czysta trasa, sowa na swoim torze na ziemi, 1 s nietykalności), `phase = "run"`, zdarzenie `stage { stage }`.
  - `input(kierunek)`, `end(reason)` (zdarzenie `over { reason }`), `setSafe()`, `warp(m)` (testy: czysta trasa `m` dalej, najwyżej do mety), `takeEvents()`, `summary()` → `{ score, distance, leaves, bestCombo, hits, nearMisses, stages, stage, finished }` (`finished` — kampania ukończona). Na starcie zdarzenie `stage { stage: startStage }`.

## `render.js` — rysowanie

Płótno w pikselach CSS (`view.applyScreen`), rzutnia z `computeProjection` przeliczana przy zmianie rozmiaru ekranu. Kolejność: niebo (gradient od `sky[0]` do `sky[1]` do horyzontu, zapamiętany), pobocza (kolor podłogi zmieszany 12% z `#6b5a4a`, do ±30 m), droga (`floor`), poprzeczne pasy co 4 m przesuwające się z dystansem (kolor podłogi + 8% czerni, przezroczystość = 1 − mgła, grubość `max(0,5 px, 0,06 m)`), przerywane linie między torami (odcinki 1,5 m co 3 m, szerokość 0,12 m, kolor `lane`), krawężniki 0,18 m w kolorze `accent`, podświetlenie toru pod sową (biały pas szerokości 0,8 m do 9 m przed sową, przezroczystość 0,28). Najbliższa rysowana głębokość: `max(−cameraBack + 0,3, depthAtScreenY(dół ekranu + 20 px))`. Czworokąty (`quad`) rzutowane przez `project` (pomijane za kamerą).

Lista obiektów sortowana po głębokości (dalsze najpierw): scenografia (co 6 m po obu stronach, 1,4–2,6 m od krawędzi drogi, wysokość 1,6–3,8 m z funkcji skrótu, kolor `accent` albo nieba zmieszany z mgłą, jasny pasek u góry; przezroczystość `1 − 0,85 × mgła`), przeszkody (cień, rysunek z atlasu o wysokości `draw` × skala i proporcjach z katalogu, zakotwiczony u dołu; wysoka przeszkoda wisi na wysokości `bottom` na dwóch słupkach; długa cysterna rysowana kilka razy wzdłuż toru co ~4,5 m; ruchomy telefon drga, a w czasie ostrzeżenia nad nim pulsuje pomarańczowa strzałka w stronę nowego toru), liście (0,6 m, kołysanie ±0,08 m i obrót) oraz sowa na `z = 0` (cień zmniejszany z wysokością, `drawOwl` z animatora i garderobą w skali rzutni; ślizg spłaszcza sowę do `slideHeight / height` i poszerza o 15%; po trafieniu miga). Na końcu cząsteczki (`particles.render`, w pikselach) i napisy punktów (`popup`: wznoszą się 40 px/s, znikają w 0,9 s, obrys `COLORS.kontur`, czcionka Fredoka). API: `layout()`, `toScreen(x, y, z)`, `popup(tekst, x, y, kolor, rozmiar)`, `clearPopups()`, `draw({ state, animator, cosmetic, particles, dt, showOwl })`; pomocnicze `mix(kolorA, kolorB, t)`.

## `main.js` — strona gry

- Widok `createView` (rozmiar planszy, DPR najwyżej 2 — adaptacyjnie 1,5 i 1, gdy bieg przez 3 s ma < 50 kl./s), atlas Sowiego Świata budowany dla gęstości `min(220, focal / cameraBack) × min(2, DPR)` (skala sowy), renderer, cząsteczki (200), animator sowy.
- Interfejs: pętla `createLoop`, powłoka `createShell` (auto-pauza, odliczanie, „Oszczędzanie baterii” → gęstość cząsteczek 0,4), HUD (`createHud`, pauza, wynik, liście, życia do 4), komunikaty (`createToasts`, w biegu 1), menu pauzy (restart, wyjście do menu, „Zakończ bieg” tylko w Trybie Przytulnym), ekran wyników; pasek planszy `.tory-progress` („N/4 · nazwa” i postęp do mety, aktualizowany przy zmianie o 1%).
- `window.SowieNotifications` (jeśli nie ma) — w biegu i przy składaniu wyników komunikaty Akademii czekają na ekran wyników; `progress.linkProfile` — misje garderoby i statystyki profilu (`shared/meta/missions.js`).
- Ekran tytułowy: wybór poziomu (zapis `sowiegry_gry/sowa3.difficulty` po 2 s), rekord poziomu z profilu, „Jak grać?” (okno z instrukcją `guides-data.js`, klucz `sowa3`), Start. Bieg zaczyna się dopiero po wczytaniu dokumentu gry (`cloud.loadGame("sowa3")`).
- `startRun()` — nowy bieg z ziarnem (`?seed=` + poziom albo losowe), Tryb Przytulny (Chill + ustawienie profilu), HUD, pasek planszy, `progress.beginRun("sowa3")`, komunikat „Plansza 1: …”.
- Zdarzenia: `jump` — „skok”; `slide` — „slizg” i pył; `land` — spłaszczenie sowy; `leaf` — „lisc” (wysokość rośnie z serią) albo „lisc-zloty”, cząsteczki, napis punktów przy combo > 1 lub złotym liściu, `leaf:collected`, „Combo ×N!” i `combo`; `hit` — „trafienie-pracu” / „trafienie-amic”, wibracja 30 ms, cząsteczki, komunikat z etykietą przeszkody, `hit`, krótkie zatrzymanie (0,06 s); `nearMiss` — „polaczenie”, napis „O włos! +25”, `near-miss`; `warning` — „dzwonek”; `stage` — „Plansza N: nazwa”; `stageEnd` — „zycie”, komunikat „Meta: ogród działkowy z basenem! +premia” (ostatnia: „Meta kampanii!”), po 1,4 s następna plansza (finał z basenem — krok 5.4); `over` — ekran wyników.
- `finishRun()` — `submitRun("sowa3", { score, distance, leaves, difficulty, durationMs })`, `progress.endRun` (wynik, dystans, `finished`, `bestCombo`), dźwięk „rekord” / „koniec-gry”, wyniki: „Kampania ukończona!” albo „Koniec biegu!”, wynik, rekord, liście, miejsce w top 10, zadania Akademii, dodatkowo: Plansze „N / 4”, Dystans, Najlepsze combo, O włos!, Trafienia; komunikaty odłożone w biegu.
- Gesty (`bindInput` z martwymi strefami przy krawędziach): przesunięcie ←/→/↑/↓ → tor / skok / ślizg; wolniejsze przeciąganie ≥ 36 px — raz na dotyk, kierunek dominującej osi; stuknięcie: lewa ⅓ ekranu — tor w lewo, prawa ⅓ — w prawo, środek — skok; klawiatura: Spacja/↑/W — skok, ←/→/A/D, ↓/S; P / Esc — pauza. Na ekranie tytułowym klawisz akcji zaczyna bieg.
- Ekran tytułowy pokazuje planszę z sową (bieg „tytul” bez aktualizacji). Dźwięk: `createAudio` z `GAME_SOUNDS`, ustawienia z profilu, odblokowanie pierwszym dotknięciem (bez stuknięć w odnośniki); odliczanie — „odliczanie” / „odliczanie-start”; pauza ścisza muzykę.
- `?debug=1` — panel: kl./s, DPR, ekran, prędkość, plansza, dystans planszy, wzór, tor, liczba przeszkód i liści, combo, życia.
- `window.SowieTory` (testy e2e): `screen()`, `ready()`, `atlasReady()`, `state()` (podsumowanie + `phase`, `speed`, `lives`, `stageDistance`, `owl`), `start(poziom?)`, `end()`, `warp(m)`, `obstacles()` (rodzaj, tor, głębokość).

## Testy

- `tests/unit/tory.test.mjs`: rzutnia w pionie (320 × 568, 375 × 667, 390 × 844, 412 × 915 — droga 84% szerokości, sowa na 80%, punkt zbiegu, odwrotność rzutu, skala maleje z głębokością, punkt za kamerą → `null`) i w poziomie (droga = 115% wysokości, < 60% szerokości); mgła i czas widoczności; ruch sowy (szczyt i czas skoku, ślizg, zmiana toru w ok. 0,11 s, skrajny tor, nurkowanie → ślizg, skok z ślizgu, bufor); kolizje według typu (skok nad niską, ślizg pod wysoką, skok nie przechodzi pod wysoką, pełna zawsze, sąsiedni tor bezpieczny, długa cysterna); wzory (≥ 20, 4 progi, oddech, tory, wszystkie rodzaje z `OBSTACLE_CODES`, ruchomy telefon); **przeszukiwanie (BFS)**: każdy wzór da się przejść z każdego toru przy 9,35, 18 i 24 m/s (decyzje co 1/15 s: nic / ← / → / ↑ / ↓), kontrola: ściana trzech dystrybutorów i za bliska przeszkoda nie przechodzą; generator (progi, oddech co 4., bez powtórek, wzory wstępne, odstęp stały w czasie); prędkość, combo, plansze i życia; autopilot przechodzi kampanię (3 ziarna) bez trafienia, 4 plansze po 60–90 s, premie 550; bieg bez ruchu kończy się po 3 trafieniach, Tryb Przytulny zostawia 1 życie, tryb bezpieczny bez trafień, powtarzalność z ziarnem; ruchomy telefon (strzałka, przejazd po 0,8 + 0,35 s, zapas przed sową).
- `tests/e2e/telefon/tory.spec.js` (profile telefonów): przesunięcia zmieniają tor, skok, ślizg, stuknięcie przy lewym boku, klawiatura, bieg przyspiesza; pauza z HUD i odliczanie; koniec biegu — wyniki („Nowy rekord!”, „Plansze”, „0 / 4”), rekord `sowa3` w profilu (emulator), „Jeszcze raz”; 320 × 568 — karta i HUD bez przewijania w bok, pasek planszy pod przyciskiem pauzy.
- `tests/e2e/telefon/menu.spec.js` — karta Sowa3 prowadzi do `Sowa3/` i ma przycisk „Wypróbuj nową wersję: Sowie Tory” (`SowieTory/`).
