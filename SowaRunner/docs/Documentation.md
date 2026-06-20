# SowaRunner — dokumentacja techniczna

## Zakres
`SowaRunner` jest bocznym endless runnerem zrealizowanym w p5.js. Gra ma ekran tytułowy, poziomy trudności, game over, mobilne one-tap sterowanie, proceduralne spawnowanie obiektów, mini-grę z humbakiem, mechanikę dodatkowych żyć oraz dodatkowy balans odstępów między przeszkodami.

## Pliki
- `index.html` — ładuje `p5.js`, `p5.sound.min.js`, `style.css`, `sketch.js`, `render-fix.js`, `extra-lives.js` oraz `obstacle-balance.js`.
- `style.css` — blokuje scrollowanie, ustawia pełnoekranowy canvas i `touch-action: none`.
- `sketch.js` — główna logika gry w kompaktowej formie.
- `render-fix.js` — hotfix renderowania; nadpisuje `drawBg()`, aby każda klatka była w pełni czyszczona i zamalowywana pełnym gradientem.
- `extra-lives.js` — serduszka jako pickupy dodatkowych żyć.
- `obstacle-balance.js` — bezpieczniejszy spawn przeszkód i większe minimalne odstępy między przeszkodami blokującymi.
- `docs/README.md` — instrukcja dla gracza.
- `docs/Documentation.md` — dokumentacja techniczna.

## Ekrany gry
Stała `SCREEN` definiuje tryby:
- `TITLE` — ekran tytułowy, wybór trudności i instrukcja.
- `RUN` — właściwa gra.
- `WHALE` — mini-gra z humbakiem.
- `OVER` — ekran wyniku po utracie żyć.

## Trudności
`LEVELS` zawiera konfiguracje `Chill`, `Arcade` i `Chaos`. Każda trudność ustawia maksymalną prędkość, tempo narastania prędkości oraz bazowe odstępy między przeszkodami.

## Balans przeszkód
`obstacle-balance.js` nadpisuje `spawnStuff()`. Moduł:
- zwiększa minimalny odstęp między przeszkodami blokującymi,
- dodatkowo zwiększa odstęp po szerokich albo trudniejszych przeszkodach,
- ogranicza powtarzanie tego samego typu przeszkody kilka razy z rzędu,
- utrzymuje różne wartości balansu dla `Chill`, `Arcade` i `Chaos`.

Celem jest uniknięcie sytuacji, w której przy dużej prędkości gracz nie ma realnego czasu na reakcję.

## Dodatkowe życia
`extra-lives.js` dodaje `runnerLifePickups`. Serduszka pojawiają się co pewien czas podczas właściwego biegu. Zebranie serduszka:
- dodaje 1 życie, jeśli gracz ma mniej niż 5 żyć,
- daje punkty, jeśli gracz ma już 5 żyć.

Częstotliwość serduszek zależy od wybranego poziomu trudności.

## Główne zmienne i kolekcje
- `mode` — aktualny ekran.
- `level` — wybrany poziom trudności.
- `score`, `distM`, `lives` — wynik, dystans i życia.
- `bestScore`, `bestDist` — rekordy zapisane w `localStorage`.
- `owl` — gracz: pozycja, promień, prędkość pionowa, liczba skoków, coyote time i jump buffer.
- `holes`, `walls`, `pracu`, `amic`, `plats`, `leaves`, `goats`, `whales` — obiekty runnera.
- `bLeaves`, `bPracu` — obiekty mini-gry z humbakiem.
- `parts` — cząsteczki i krótkie etykiety punktów.
- `clouds`, `hills` — tło.

## Sterowanie
- `touchStarted()` i `mousePressed()` wywołują `trigger()`.
- Na ekranie tytułowym klik/tap w kartę trudności zmienia poziom.
- `keyPressed()` obsługuje `1/2/3`, `Spację`, `Enter` i `strzałkę w górę`.

## Fizyka i obiekty
`updateRun(dt)` zwiększa czas, dystans, prędkość i wynik. `updateOwl(dt)` obsługuje grawitację, lądowanie, skoki, dziury, platformy, dachy Amic i kozy. `hit()` odejmuje życie i kończy grę po spadku życia do zera.

Obiekty obowiązkowe:
- liście monstery,
- serduszka,
- skaczące kozy,
- humbak,
- napisy „Pracu Pracu”,
- stacje Amic.

## Mini-gra z humbakiem
`startWhale()` przełącza ekran na `WHALE`. W tym trybie sowa unosi się po tapnięciu, monstery dają punkty, a „Pracu Pracu” odejmuje punkty.

## Renderowanie
Kod rysuje wszystko proceduralnie w p5.js. `render-fix.js` jest ładowany po `sketch.js`, więc jego definicja `drawBg()` zastępuje wcześniejszą wersję i eliminuje smużenie na mobile.

## Rekordy
Gra zapisuje rekordy w `localStorage`:
- `sowaRunnerBestScore`
- `sowaRunnerBestDistance`

## Zasady utrzymania
Przy zmianach mechaniki, sterowania, UI lub obiektów aktualizuj `docs/README.md` oraz `docs/Documentation.md`.
