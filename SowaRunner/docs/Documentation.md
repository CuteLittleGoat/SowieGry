# SowaRunner — dokumentacja techniczna

## Architektura

`SowaRunner` jest grą p5.js. Bazowa logika pozostaje w `sketch.js`, a systemy reworku są ładowane warstwowo.

## Kolejność plików

1. `p5.js`
2. `p5.sound.min.js`
3. `sketch.js`
4. `render-fix.js`
5. `extra-lives.js`
6. `obstacle-balance.js`
7. `../shared/sowie-core.js`
8. `../shared/sowie-runtime.js`
9. `cute-rework.js`
10. `animation-polish.js`
11. `runner-events-extra.js`

W `<head>` ładowane są również:

- `../shared/sowie-smoke-hook.js`,
- `style.css`,
- `../shared/cute-ui.css`.

## Odpowiedzialność plików

### `sketch.js`

Główna pętla, fizyka, skoki, przeszkody, bazowy HUD, mini-gra humbaka i renderowanie.

### `render-fix.js`

Pełne czyszczenie i zamalowanie tła każdej klatki. Eliminuje smużenie na części urządzeń mobilnych.

### `extra-lives.js`

Serduszka, limit pięciu żyć i zamiana nadmiarowego życia na punkty.

### `obstacle-balance.js`

Kontroluje minimalny odstęp, dodatkowy margines po szerokich przeszkodach, powtarzanie typu przeszkody i balans dla trzech trudności.

### `cute-rework.js`

- combo,
- near miss,
- złote i tęczowe liście,
- gorączka monster,
- wydarzenia `monsterRain` i `goatParade`,
- zmiana pory dnia,
- perfekcyjne lądowania,
- kosmetyki i piórka,
- misje oraz wspólny profil,
- dodatkowy HUD i debug.

### `animation-polish.js`

- squash-and-stretch,
- przechylenie w locie,
- gwiazdki po obrażeniu,
- dźwięki skoku i obrażenia,
- rzeczywisty kosmetyk `bubbleTrail`.

### `runner-events-extra.js`

- zapowiadany przeciwny wiatr,
- wizualne linie wiatru,
- znak ostrzegający o najbliższej przeszkodzie,
- osobny czas trwania i odpoczynku między wydarzeniami.

## Wspólna warstwa

`SowieCore` udostępnia profil, misje, statystyki, audio, muzykę, kosmetyki, toasty i debug. `SowieRuntime` ogranicza częstotliwość zapisów i obsługuje wznowienie po zamknięciu modalu.

## Combo

Progi:

- 5 akcji — `×2`,
- 12 akcji — `×3`,
- 22 akcje — `×4`,
- 35 akcji — `×5`.

Obrażenie resetuje serię.

## Near miss

Kontrolowane są ściany, dziury, `Pracu Pracu` oraz Amic. Jeden obiekt może przyznać premię tylko raz.

## Wydarzenia

- `monsterRain`,
- `goatParade`,
- przeciwny wiatr z wcześniejszym ostrzeżeniem.

Wydarzenia nie omijają `obstacle-balance.js` i nie zagęszczają bazowych przeszkód blokujących.

## Audio i profil

Audio jest generowane przez Web Audio API. Rekordy gry pozostają pod kluczami `sowaRunnerBestScore` i `sowaRunnerBestDistance`, a profil wspólny pod `sowieGryProfile`.

## Diagnostyka i testy

- `?debug=1`,
- `tests/smoke.html`,
- `.github/workflows/js-check.yml`.

## Utrzymanie

Nowe przeszkody muszą respektować `obstacle-balance.js`. Elementy punktowe mogą być dodawane przez gorączkę, ale nie mogą skracać odstępów między zagrożeniami.
