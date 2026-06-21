# SowaJumper — dokumentacja techniczna

## Architektura

`SowaJumper` jest grą Canvas 2D bez frameworka. Bazowy silnik znajduje się w `script.js`. `difficulty.js` dynamicznie ładuje wcześniejsze moduły, a `cute-loader.js` czeka na ich gotowość przed uruchomieniem reworku.

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

W `<head>` ładowane są także `styles.css`, `../shared/cute-ui.css` i `../shared/sowie-smoke-hook.js`.

## Poziomy trudności

`JUMPER_DIFFICULTIES` zmienia:

- grawitację,
- zwykłe wybicie,
- wybicie kozy,
- wybicie Amic,
- liczbę żyć,
- mnożnik odstępu platform.

Wybór jest zapisany w `sowaJumperDifficulty`.

## Bezpieczeństwo platform

`safety-balance.js` kontroluje:

- maksymalny poziomy skok między środkami platform,
- serię platform ruchomych i kruszących się,
- pozycję `Pracu Pracu`,
- odległość kolejnych napisów.

## Nowe platformy

`cute-rework.js` rozszerza wyniki `createPlatform()` o:

- `cushion`,
- `cloud`,
- `leafpad`,
- `balcony`,
- `rest`.

`collidePlatforms()` jest opakowane tak, aby po standardowej detekcji zastosować dodatkowe wybicie i premie konkretnego typu.

## Strefy wysokości

`drawBackground()` jest rozszerzone o warstwy:

- miasto poniżej 100 m,
- dachy 100–250 m,
- chmury 250–450 m,
- noc 450–700 m,
- sowie niebo powyżej 700 m.

Są to warstwy dekoracyjne i nie wpływają na kolizje.

## Combo i near miss

- combo ma progi `×1`–`×5`,
- perfekcyjne lądowanie jest wykrywane po odbiciu,
- near miss dotyczy `Pracu Pracu`,
- obrażenie resetuje serię,
- statystyki trafiają do wspólnego profilu.

## Liście

Każdy nowy liść otrzymuje wariant:

- `normal`,
- `gold`,
- `rainbow`.

Tęczowy liść albo seria ośmiu zbiórek aktywuje gorączkę monster. Gorączka dodaje liście nad istniejącymi platformami.

## Dodatkowe życia

`extra-lives.js` tworzy `jumperLifePickups`. Limit jest oparty na `state.maxLives`. Nadmiarowy pickup daje punkty.

## Mini-gra humbaka

### `bonus-fix.js`

- obiekty spadają pionowo,
- sowa porusza się poziomo,
- wynik zależy od gracza.

### `bonus-lanes.js`

- trzy pasy,
- spawn liści i przeszkód na środkach pasów,
- kontrola pionowych grup przeszkód,
- brak blokady wszystkich pasów,
- ostrzeżenia u góry ekranu.

## Animacja

`animation-polish.js` dodaje:

- squash-and-stretch,
- wydłużenie podczas wybicia,
- przechylenie zależne od `owl.vx`,
- gwiazdki po obrażeniu,
- efekty dźwiękowe.

Kosmetyki rysuje wspólny `SowieCore`.

## Profil i misje

Gra raportuje:

- liście,
- dodatkowe życia,
- near missy,
- maksymalne combo,
- wysokość,
- wynik mini-gry.

Misja 250 m odblokowuje plecak.

## Pauza i audio

Adapter przekazany do `SowieCore.registerGame()` zatrzymuje aktualizacje `title`, `playing` i `bonus`. Muzyka używa motywu `jumper`.

## Diagnostyka i testy

- `?debug=1`,
- `tests/smoke.html`,
- `.github/workflows/js-check.yml`.

## Rekordy

- `sowaJumperBestScore`,
- `sowaJumperBestHeight`,
- wspólny `sowieGryProfile`.
