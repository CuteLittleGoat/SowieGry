# SowaJumper — dokumentacja techniczna

## Architektura

`SowaJumper` jest grą Canvas 2D bez frameworka. Bazowy silnik znajduje się w `script.js`. `difficulty.js` ładuje starsze moduły dynamicznie, a `cute-loader.js` czeka na ich gotowość przed uruchomieniem kolejnych warstw.

## Kolejność ładowania

### Statyczna

1. `script.js`
2. `../shared/sowie-core.js`
3. `../shared/sowie-runtime.js`
4. `difficulty.js`
5. `cute-loader.js`

### Dynamiczna z `difficulty.js`

1. `extra-lives.js`
2. `bonus-fix.js`
3. `safety-balance.js`

### Dynamiczna z `cute-loader.js`

1. `cute-rework.js`
2. `bonus-lanes.js`
3. `animation-polish.js`
4. `platform-expansion.js`

W `<head>` ładowane są również `styles.css`, `../shared/cute-ui.css` i `../shared/sowie-smoke-hook.js`.

## Poziomy trudności

`JUMPER_DIFFICULTIES` zmienia grawitację, zwykłe wybicie, wybicie kozy, wybicie Amic, życia startowe oraz mnożnik odstępów. Wybór jest zapisywany w `sowaJumperDifficulty`.

## Bezpieczeństwo platform

`safety-balance.js` kontroluje maksymalny poziomy skok między platformami, serie ruchomych i kruszących się platform oraz pozycję `Pracu Pracu`.

## Platformy z `cute-rework.js`

- `cushion`,
- `cloud`,
- `leafpad`,
- `balcony`,
- `rest`.

Punkty odpoczynku pojawiają się w kolejnych przedziałach wysokości i dają chwilową nietykalność.

## Platformy z `platform-expansion.js`

- `rotating` — lekko obraca się i daje premię punktową,
- `temporary` — znika około 720 ms po pierwszym lądowaniu,
- `springGoat` — kozia trampolina z mocnym wybiciem.

Moduł opakowuje `createPlatform()`, `updateGame()`, `collidePlatforms()` i `drawPlatform()` po załadowaniu wcześniejszych systemów.

## Strefy wysokości

- miasto poniżej 100 m,
- dachy 100–250 m,
- chmury 250–450 m,
- noc 450–700 m,
- sowie niebo powyżej 700 m.

Warstwy są dekoracyjne i nie zmieniają kolizji.

## Combo i near miss

Combo ma progi `×1`–`×5`. Rośnie za liście, perfekcyjne lądowania i bliskie minięcie `Pracu Pracu`; obrażenie resetuje serię.

## Liście i gorączka

Liście otrzymują wariant `normal`, `gold` albo `rainbow`. Tęczowy liść lub seria ośmiu zbiórek uruchamia gorączkę, która dodaje wyłącznie pickupy nad istniejącymi platformami.

## Dodatkowe życia

`extra-lives.js` tworzy `jumperLifePickups`. Nadmiarowy pickup przy limicie żyć daje punkty.

## Mini-gra humbaka

### `bonus-fix.js`

- obiekty spadają pionowo,
- sowa porusza się poziomo,
- wynik zależy od gracza.

### `bonus-lanes.js`

- trzy pasy,
- lane-based spawn,
- brak blokady wszystkich pasów,
- ostrzeżenia u góry,
- złote liście bonusowe.

## Animacja i kosmetyki

`animation-polish.js` dodaje squash-and-stretch, przechylenie, gwiazdki, dźwięki oraz działający kosmetyk `bubbleTrail`. Pozostałe kosmetyki są rysowane przez `SowieCore`.

## Profil i misje

Gra raportuje liście, dodatkowe życia, near missy, combo, wysokość i wynik bonusu. Misja 250 m odblokowuje plecak.

## Pauza i audio

Adapter przekazany do `SowieCore.registerGame()` zatrzymuje sceny `title`, `playing` i `bonus`. Muzyka korzysta z motywu `jumper`.

## Diagnostyka i testy

- `?debug=1`,
- `tests/smoke.html`,
- `.github/workflows/js-check.yml`.

## Rekordy

- `sowaJumperBestScore`,
- `sowaJumperBestHeight`,
- wspólny `sowieGryProfile`.
