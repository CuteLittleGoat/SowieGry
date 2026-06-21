# SowaRunner — dokumentacja techniczna

## Architektura

`SowaRunner` jest grą p5.js. Bazowa logika pozostaje w `sketch.js`, a systemy reworku są ładowane warstwowo w określonej kolejności.

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

Dodatkowo w `<head>` ładowane są:

- `../shared/sowie-smoke-hook.js`,
- `style.css`,
- `../shared/cute-ui.css`.

## Odpowiedzialność plików

### `sketch.js`

- główna pętla p5,
- fizyka,
- skoki,
- podstawowe przeszkody,
- bazowy HUD,
- mini-gra humbaka,
- rysowanie świata.

### `render-fix.js`

Pełne czyszczenie i zamalowanie tła każdej klatki. Eliminuje smużenie na części urządzeń mobilnych.

### `extra-lives.js`

- serduszka,
- limit pięciu żyć,
- zamiana nadmiarowego życia na punkty.

### `obstacle-balance.js`

Nadpisuje `spawnStuff()` i kontroluje:

- minimalny odstęp,
- dodatkowy margines po szerokich przeszkodach,
- powtarzanie typu przeszkody,
- osobny balans dla trzech trudności.

### `cute-rework.js`

- combo,
- near miss,
- złote i tęczowe liście,
- gorączka monster,
- wydarzenia czasowe,
- zmiana pory dnia,
- perfekcyjne lądowania,
- kosmetyki,
- piórka,
- integracja misji,
- integracja wspólnego profilu,
- dodatkowy HUD,
- debug.

### `animation-polish.js`

- squash-and-stretch,
- przechylenie w locie,
- gwiazdki po obrażeniu,
- dźwięki skoku i obrażenia.

## Wspólna warstwa

`SowieCore` udostępnia:

- `registerGame()` — pauza i motyw muzyczny,
- `progressMission()` — misje,
- `recordStat()` — statystyki,
- `play()` — efekty,
- `startMusic()` — proceduralna muzyka,
- `drawCanvasCosmetic()` — dodatki sowy,
- `toast()` i `maybeQuip()` — komunikaty,
- `setDebugData()` — panel diagnostyczny.

## Combo

Stan combo jest lokalny dla biegu. Progi:

- 5 akcji — `×2`,
- 12 akcji — `×3`,
- 22 akcje — `×4`,
- 35 akcji — `×5`.

Obrażenie resetuje serię.

## Near miss

Kontrolowane są:

- ściany,
- dziury,
- napisy `Pracu Pracu`,
- stacje Amic.

Każdy obiekt może przyznać premię tylko raz.

## Wydarzenia

`cute-rework.js` obsługuje:

- `monsterRain`,
- `goatParade`.

Wydarzenia nie zwiększają bazowej liczby przeszkód blokujących i nie omijają `obstacle-balance.js`.

## Audio

Audio jest generowane przez Web Audio API we wspólnej warstwie. p5.sound pozostaje dostępne, ale nowe efekty nie wymagają plików dźwiękowych.

## Profil i zapis

Rekordy gry:

- `sowaRunnerBestScore`,
- `sowaRunnerBestDistance`.

Profil wspólny:

- `sowieGryProfile`.

## Diagnostyka

`?debug=1` pokazuje:

- tryb,
- prędkość,
- liczbę przeszkód,
- combo,
- czas gorączki,
- aktywne wydarzenie.

## Testy

- `tests/smoke.html`,
- `.github/workflows/js-check.yml`.

## Utrzymanie

Nowe przeszkody muszą respektować `obstacle-balance.js`. Nowe elementy punktowe mogą pojawiać się podczas gorączki, ale nie powinny zmieniać bezpiecznych odstępów między przeszkodami.
