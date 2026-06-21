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
12. `pause-final.js`

W `<head>` ładowane są również `../shared/sowie-smoke-hook.js`, `style.css` i `../shared/cute-ui.css`.

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

Combo, near miss, złote i tęczowe liście, gorączka monster, wydarzenia `monsterRain` i `goatParade`, zmiana pory dnia, perfekcyjne lądowania, kosmetyki, piórka, misje, wspólny profil, dodatkowy HUD i debug.

### `animation-polish.js`

Squash-and-stretch, przechylenie, gwiazdki, dźwięki oraz działający kosmetyk `bubbleTrail`.

### `runner-events-extra.js`

Zapowiadany przeciwny wiatr, wizualne linie wiatru i znak ostrzegający o najbliższej przeszkodzie.

### `pause-final.js`

Ostatnia warstwa `updateRun()` i `updateWhale()`. Zatrzymuje wszystkie wcześniej dołączone systemy podczas pauzy lub otwartego modalu.

## Wspólna warstwa

`SowieCore` udostępnia profil, misje, statystyki, audio, muzykę, kosmetyki, komunikaty i debug. `SowieRuntime` ogranicza częstotliwość zapisów i obsługuje wznowienie po zamknięciu modalu.

## Combo

Progi: 5, 12, 22 i 35 akcji dla mnożników `×2`–`×5`. Obrażenie resetuje serię.

## Near miss

Kontrolowane są ściany, dziury, `Pracu Pracu` oraz Amic. Jeden obiekt może przyznać premię tylko raz.

## Wydarzenia

- `monsterRain`,
- `goatParade`,
- przeciwny wiatr z wcześniejszym ostrzeżeniem.

Wydarzenia nie omijają `obstacle-balance.js` i nie zagęszczają bazowych przeszkód blokujących.

## Audio i profil

Audio jest generowane przez Web Audio API. Rekordy gry pozostają pod `sowaRunnerBestScore` i `sowaRunnerBestDistance`, a profil wspólny pod `sowieGryProfile`.

## Diagnostyka i testy

- `?debug=1`,
- `tests/smoke.html`,
- `.github/workflows/js-check.yml`.

## Utrzymanie

Nowe przeszkody muszą respektować `obstacle-balance.js`. Elementy punktowe mogą być dodawane przez gorączkę, ale nie mogą skracać odstępów między zagrożeniami.
