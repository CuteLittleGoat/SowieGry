# SowaRunner — dokumentacja techniczna

## Zakres
Dokument opisuje pliki gry SowaRunner: `index.html`, `style.css` i `sketch.js`. Celem jest umożliwienie odtworzenia gry 1:1.

## Pliki

### `index.html`
- Ładuje biblioteki `p5.js` oraz `p5.sound.min.js`.
- Dołącza arkusz `style.css`.
- Zawiera pusty `<main>` — całość rysowana jest przez p5.js w `<canvas>`.
- Skrypt gry to `sketch.js`.

### `style.css`
- Resetuje marginesy i padding (`html, body { margin: 0; padding: 0; }`).
- Ustawia `canvas { display: block; }`, dzięki czemu płótno nie ma odstępów.
- Brak dodatkowych fontów — używany jest domyślny font przeglądarki z p5.js.

### `sketch.js`
Plik zawiera pełną logikę gry w p5.js: ekrany, sterowanie, rysowanie postaci, przeszkód, mini-grę oraz dźwięk.

## Stałe i konfiguracja
- **STATES**: `ST_START`, `ST_RUNNER`, `ST_MINIGAME` — sterują aktualnym ekranem gry.
- **DIFFICULTIES**: tablica trzech poziomów (`easy`, `normal`, `chaos`) ze zmiennymi:
  - `maxSpeed`, `speedRampPerSec`, `hazardGapMinPx`, `hazardGapMaxPx`, `platformChance`.
- **BASE**: ustawienia bazowe (grawitacja, siła skoku, szanse spawnu liści i kóz, limity żyć, punkty za humbaka).
- **DESIGN_WIDTH/HEIGHT**: referencyjna rozdzielczość 920×520.
- **DESIGN_GROUND_OFFSET**: wysokość gruntu w projekcie (110).
- Funkcje `sx()` i `sy()` skalują wartości do aktualnego rozmiaru ekranu.

## Kluczowe zmienne
- `state` — aktualny ekran.
- `selectedDifficultyIndex` i `activeCFG` — wybrana trudność.
- `owl` — obiekt gracza (pozycja, prędkość, skoki).
- `leaves`, `holes`, `walls`, `platforms`, `amicStations`, `goats`, `pracuTexts` — listy obiektów w świecie.
- `clouds`, `trees` — tło.
- `speed`, `score`, `lives`, `invulnTimer` — mechanika gry.
- `whale`, `miniTimeLeft` — mini-gra z humbakiem.
- `audio` — WebAudio (falowanie, dźwięki sowy i kozy).

## Funkcje — opis szczegółowy

### Inicjalizacja i skalowanie
- `setup()` — tworzy płótno, liczy skalę, ustawia nasłuch widoczności, wybiera trudność, seeduje tło i resetuje grę.
- `updateLayout(prevWidth, prevHeight)` — oblicza skalę do nowego rozmiaru ekranu i aktualizuje `groundY`.
- `rescaleGameObjects(scaleX, scaleY)` — przelicza pozycje obiektów po zmianie rozmiaru.
- `applyDifficulty(idx)` — ustawia `activeCFG` na wybrany poziom i resetuje statystyki.
- `resetRunner(keepLast)` — resetuje świat, punkty, prędkość, przeszkody i gracza.

### Główna pętla
- `draw()` — centralny render/aktualizacja:
  - `ST_START`: rysuje ekran startowy.
  - `ST_RUNNER`: rysuje świat, aktualizuje obiekty, kolizje i HUD.
  - `ST_MINIGAME`: rysuje mini-grę z humbakiem.

### Sterowanie
- `keyPressed()` — 1/2/3 wybór trudności, spacja = akcja główna, R = powrót do startu.
- `mousePressed()` — klik obsługuje przyciski startowe i akcję główną.
- `touchStarted()` — dotyk mobilny, z throttlingiem.
- `windowResized()` — dopasowanie płótna i przeskalowanie obiektów.
- `handlePrimaryAction()` — start gry lub skok.
- `shouldThrottleTouch()`, `recordTouchAction()`, `wasRecentTouch()` — zabezpieczają przed podwójnymi dotknięciami.
- `tryJump()` — realizuje pojedynczy lub podwójny skok oraz dźwięk.

### Ekran startowy
- `drawStartScreen()` — tło + karta wyboru poziomu + instrukcje.
- `drawDifficultyButtons()` — trzy przyciski trudności.
- `hitTestDifficultyButtons(mx, my)` i `getDifficultyButtonRect()` — wykrywanie kliknięć.
- `drawStartButton()` — przycisk Start.
- `getStartButtonRect()` i `hitTestStartButton()` — detekcja kliknięć.

### Logika runnera
- `drawRunner()` — główny ekran gry: tło, obiekty, gracz, HUD.
- `spawnLogic()` — spawnuje przeszkody, liście, kozy i platformy.
- `pickHazardType()` — losuje typ przeszkody na podstawie wag.
- `computeJumpStats(runSpeed)` — parametry skoku zależne od prędkości.
- `updateOwl(dt)` — grawitacja, animacja skrzydeł, kolizje z ziemią.
- `takeHit()` — odejmuje życie, ustawia nietykalność.
- `toStartScreen()` — reset i powrót do startu.
- `isOverHole(x)` — wykrywa czy gracz znajduje się nad dziurą.
- `collideCircleRect()` — kolizja koła z prostokątem.
- `collideWithWalls()`, `collideWithAmic()`, `collideWithPracu()` — zderzenia z przeszkodami.

### Rysowanie gracza i zwierząt
- `drawPlayer()` — wywołuje `drawCuteOwl()`.
- `drawCuteOwl(x, y, s, flap, mascotMode)` — rysuje sowę: ciało, oczy, dziób, skrzydła.
- `drawCuteGoat(x, y)` — rysuje kozę z rogami i różkiem.
- `drawCuteWhale(x, y)` — rysuje humbaka z płetwami i strumieniem.

### Liście i bonusy
- `updateLeaves()` — ruch i zbieranie liści (bonusy).
- `drawLeafPickup(x, y, kind, rot)` — wspólny renderer liści.
- `drawMonsteraLeaf()` — liść monstery (kształt przez `beginShape`).
- `drawAlocasiaLeaf()` — liść alokazji (wycięcia i żyłki).

### Przeszkody i obiekty
- `updateHoles()` — dziury w ziemi.
- `updateWalls()` — ściany.
- `updatePlatforms()` — platformy.
- `updateAmic()` — stacje "Amic".
- `newPracu(x, y)` i `updatePracuTexts()` — napisy "Pracu".
- `drawPracu(t)` — render napisu.
- `newGoat(x)` i `updateGoats()` — spawnowanie i animacja kóz.
- `goatsOnScreen()` — licznik kóz.

### Mini-gra
- `startMiniGame()` — uruchamia etap z humbakiem i timerem.
- `drawMiniGame()` — rysuje humbaka i słowa "fale".

### HUD i czas
- `drawHUD()` — punkty, czas, życia i komunikaty.
- `formatTime(sec)` — formatowanie czasu.

### Dźwięk (WebAudio)
- `ensureAudio()` — inicjalizuje `AudioContext` po pierwszej interakcji.
- `tickAudio(dt)` — aktualizacja fal dźwiękowych.
- `playHoot()` — dźwięk sowy (krótki "hoot").
- `hootTone(freq, dur)` — wewnętrzna funkcja generująca ton.
- `playGoat()` — dźwięk kozy.
- `startWaves()` / `stopWaves()` — ambient fal w mini-grze.
- `fadeWavesTo(target, sec)` — płynna zmiana głośności fal.

### Tło i świat
- `seedBackground()` — inicjalizuje chmury i drzewa.
- `drawSky()` — niebo z gradientem.
- `drawParallaxBackground(spd)` — warstwy tła z paralaksą.
- `drawGroundAndHills(spd)` — grunt, wzgórza i linia ziemi.

## Zasady działania
- Gra działa w pętli p5.js (`draw()`), a logika zależy od `state`.
- Skok możliwy jest do dwóch razy w powietrzu (`jumpsLeft`).
- Przeszkody i bonusy są generowane proceduralnie z ograniczeniem odstępu (`hazardGapLeftPx`).
- Po trafieniu gracz traci życie i zyskuje chwilową nietykalność.
- Mini-gra uruchamia się po zebraniu odpowiedniego obiektu (humbak).

## Odtworzenie 1:1 (checklista)
1. Zachowaj identyczne pliki `index.html`, `style.css`, `sketch.js`.
2. Upewnij się, że biblioteki p5 (`p5.js`, `p5.sound.min.js`) są dostępne lokalnie.
3. Nie zmieniaj stałych `DESIGN_WIDTH/HEIGHT`, `BASE`, `DIFFICULTIES`.
4. Rysowanie opiera się wyłącznie na funkcjach p5.js (`rect`, `ellipse`, `beginShape`).
5. Dźwięk musi być uruchamiany po interakcji użytkownika (wymóg przeglądarek).
