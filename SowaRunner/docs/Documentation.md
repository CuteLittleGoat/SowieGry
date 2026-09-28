# SowaRunner — dokumentacja techniczna

## Architektura

`SowaRunner` jest grą p5.js. Bazowa logika pozostaje w `sketch.js`, a systemy reworku są ładowane warstwowo.

## Kolejność plików

1. `p5.js`
2. `sketch.js`
3. `render-fix.js`
4. `extra-lives.js`
5. `obstacle-balance.js`
6. `../shared/sowie-core.js`
7. `../shared/sowie-runtime.js`
8. `cute-rework.js`
9. `animation-polish.js`
10. `runner-events-extra.js`
11. `pause-final.js`

Pusty plik `p5.sound.min.js` (0 bajtów) i jego `<script>` usunięto w porządkach po E2 (gra nie korzystała z biblioteki p5.sound; dźwięk daje `SowieCore`).

W `<head>` przed `p5.js` ładowane są kolejno `../config/firebase-config.js`, `../shared/sowie-platform.js`, `../shared/sowie-cloud.js`, `../shared/password-gate.js` i `../shared/sowie-smoke-hook.js`, a także `style.css` i `../shared/cute-ui.css`.

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

`SowieCore` udostępnia profil, misje, statystyki, audio, muzykę, kosmetyki, komunikaty i debug. `SowieRuntime` ustawia wspólny układ paska narzędzi i klasę ograniczonych efektów. Postęp zapisuje `SowieCloud` (`shared/sowie-cloud.js`) w Firestore; w `<head>` strony kolejno: `../config/firebase-config.js`, `../shared/sowie-platform.js`, `../shared/sowie-cloud.js`, `../shared/password-gate.js`, `../shared/sowie-smoke-hook.js`, `p5.js`.

## Combo

Progi: 5, 12, 22 i 35 akcji dla mnożników `×2`–`×5`. Obrażenie resetuje serię.

## Near miss

Kontrolowane są ściany, dziury, `Pracu Pracu` oraz Amic. Jeden obiekt może przyznać premię tylko raz.

## Wydarzenia

- `monsterRain`,
- `goatParade`,
- przeciwny wiatr z wcześniejszym ostrzeżeniem.

Wydarzenia nie omijają `obstacle-balance.js` i nie zagęszczają bazowych przeszkód blokujących.

## Audio, profil i zapis w chmurze

Audio jest generowane przez Web Audio API. Profil wspólny (misje, statystyki, kosmetyki, ustawienia) jest w dokumencie Firestore `sowiegry/profil`, a rekordy Runnera — osobno dla każdego poziomu trudności — w `profil.records.runner.{chill|arcade|chaos}` (`bestScore`, `bestDistance`), `profil.records.runner.runs` i dokumencie gry `sowiegry/profil/sowiegry_gry/runner` (`top10`, `dailyBest`, historia `sowiegry_historia`).

Zmiany w `sketch.js` (etap E1):

- `RUNNER_LEVEL_IDS = ["chill", "arcade", "chaos"]` — identyfikator poziomu dla indeksu `level` (0/1/2);
- `bestScore` i `bestDist` startują od 0; `syncRunnerBest()` przepisuje je z `SowieCloud.records("runner", RUNNER_LEVEL_IDS[level])` (`bestScore`, `bestDistance`) w każdej klatce ekranu tytułowego (`draw()` przy `mode === SCREEN.TITLE`), więc zmiana poziomu klawiszami 1–3 lub przyciskiem od razu pokazuje właściwy rekord;
- `runnerCloudReady()` — `SowieCloud.isReady()`; `trigger()` na ekranie tytułowym i końcowym startuje bieg dopiero, gdy postęp jest wczytany (ekran hasła i sówka ładowania i tak zasłaniają planszę);
- `hit()` po utracie ostatniego życia wywołuje `SowieCloud.submitRun("runner", { score, distance, difficulty, durationMs })` zamiast zapisu w pamięci przeglądarki; wyzwanie dnia (`?daily=1`) i ziarno (`?seed=`) dopisuje `SowieCloud` (rekord dnia Runnera = dystans).

## Diagnostyka i testy

- `?debug=1`,
- `tests/smoke.html`,
- `.github/workflows/js-check.yml`.

## Utrzymanie

Nowe przeszkody muszą respektować `obstacle-balance.js`. Elementy punktowe mogą być dodawane przez gorączkę, ale nie mogą skracać odstępów między zagrożeniami.

## Okno „🏆 Rekordy”

Strona ładuje `../shared/records.js` po `../shared/owl-gallery.js` (i po `../shared/game-guides.js`, który tworzy dok przycisków). Moduł dodaje do doku przycisk 🏆 i okno rekordów zasilane przez `SowieCloud` (top 10 na poziom trudności, ostatnie gry, rekordy wyzwania dnia). Opis modułu: `docs/Documentation.md`, sekcja „`shared/records.js`”.

## PWA (etap E2a)

`index.html` ma w `<head>` po `theme-color`: `<link rel="manifest" href="../manifest.webmanifest">`, `<link rel="icon" href="../assets/icons/icon.svg" type="image/svg+xml">`, `<link rel="apple-touch-icon" href="../assets/icons/apple-touch-icon.png">`, `<meta name="mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-title" content="SowieGry">`, a po `../shared/password-gate.js` skrypt `../shared/pwa.js` (rejestracja service workera `sw.js`). Gra trafia do pamięci podręcznej przy pierwszym otwarciu i potem uruchamia się także bez zasięgu. Opis: `docs/Documentation.md`, rozdział „PWA”.

## Komunikaty w trakcie gry (etap E2d)

- Adapter gry w `SowaRunner/cute-rework.js` (`SowieCore.registerGame`) ma dodatkowe pole `isPlaying: () => mode === SCREEN.RUN || mode === SCREEN.WHALE` (bieg i bonus humbaka).
- `SowieCore.isPlaying()` zwraca `true`, gdy trwa rozgrywka i gra nie jest wstrzymana; `registerGame` dodaje klasę `sowie-arcade` do `<html>`.
- `shared/notification-manager.js` pokazuje wtedy **najwyżej 1 komunikat naraz**, u góry ekranu pod paskiem narzędzi (`top: max(112px, safe-area + 104px)` na telefonie w pionie, w poziomie w rzędzie paska narzędzi), węższy (`min(64vw, 300px)`) i mniejszy (13 px). Pozostałe czekają w kolejce. Dzięki temu komunikaty nie zasłaniają sowy przy dolnej krawędzi (zgłoszenie właściciela). Poza rozgrywką (tytuł, pauza, koniec gry) widać do 2 komunikatów.
- Test: `tests/e2e/telefon/komunikaty.spec.js`.

## Dotyk przycisków na telefonie (etap E2d)

`sketch.js`: funkcja `onCanvas(event)` (`true`, gdy zdarzenie nie ma celu albo celem jest `<canvas>`). `mousePressed(event)` i `touchStarted(event)` na początku zwracają `true` dla dotknięć poza planszą. Wcześniej p5 blokował domyślną akcję każdego dotknięcia (funkcje zwracały `false`), więc na telefonie przyciski paska narzędzi (⏸ 🎀 ⭐ ⚙) i doku (❓ 🎓 🖼️ 🏆 ✨) nie reagowały, a zamiast tego sowa skakała. Dotknięcie planszy działa jak dotąd (skok / start biegu / wybór poziomu).

