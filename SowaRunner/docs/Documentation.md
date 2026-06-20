# SowaRunner — dokumentacja techniczna

## Zakres
`SowaRunner` jest bocznym endless runnerem zrealizowanym w p5.js. Gra została przebudowana jako pełniejsza wersja arcade z ekranem tytułowym, poziomami trudności, game over, mobilnym one-tap sterowaniem, proceduralnym spawnowaniem obiektów oraz mini-grą z humbakiem.

## Pliki
- `index.html` — ładuje `p5.js`, `p5.sound.min.js`, `style.css` i `sketch.js`; zawiera metadane mobilne.
- `style.css` — blokuje scrollowanie, ustawia pełnoekranowy canvas i `touch-action: none`.
- `sketch.js` — pełna logika gry.
- `docs/README.md` — instrukcja dla gracza.
- `docs/Documentation.md` — dokumentacja techniczna.

## Ekrany gry
Stała `SCREEN` definiuje tryby:
- `TITLE` — ekran tytułowy, wybór trudności i instrukcja.
- `RUNNER` — właściwa gra.
- `WHALE` — mini-gra z humbakiem.
- `GAMEOVER` — ekran wyniku.
- `PAUSED` — stan przewidziany dla pauzy klawiaturowej.

## Trudności
`DIFFICULTIES` zawiera trzy konfiguracje:
- `Chill`
- `Arcade`
- `Chaos`

Każda trudność ustawia:
- `maxSpeed`
- `ramp`
- `gapMin`
- `gapMax`

Dzięki temu gra ma inną prędkość narastania i inne odstępy między przeszkodami.

## Główne obiekty stanu
- `GAME` — aktualny ekran, wynik, dystans, życia, rekordy, komunikaty, shake i stan mini-gry.
- `BASE` — stałe fizyki i wartości bazowe.
- `owl` — gracz: pozycja, promień, prędkość pionowa, skoki, coyote time i jump buffer.
- `entities` — kolekcje obiektów świata:
  - `holes`
  - `walls`
  - `pracu`
  - `amic`
  - `platforms`
  - `leaves`
  - `goats`
  - `whaleTokens`
  - `particles`
  - `whaleLeaves`
  - `whalePracu`

## Sterowanie
Gra jest projektowana pod mobile:
- `touchStarted()` i `mousePressed()` wywołują `triggerJump()`.
- Na ekranie tytułowym klik/tap w kartę trudności zmienia poziom.
- `keyPressed()` obsługuje `1/2/3`, `Spację`, `Enter`, `strzałkę w górę` oraz `P`.

Runner jest sterowany jednym przyciskiem/tapnięciem. W trybie `RUNNER` tapnięcie wykonuje skok lub podwójny skok. W trybie `WHALE` tapnięcie unosi sowę w mini-grze.

## Fizyka runnera
- `updateRunner(dt)` zwiększa czas, dystans, prędkość i wynik.
- `updateOwl(dt)` obsługuje grawitację, lądowanie, coyote time, jump buffer, dziury, platformy, dachy Amic i kozy.
- `jump()` rozróżnia pierwszy skok i podwójny skok.
- `takeHit()` odejmuje życie, uruchamia nietykalność, shake i ekran końca gry po spadku życia do zera.

## Proceduralne generowanie
`spawnRunner(dt)` generuje:
- liście monstery,
- platformy,
- skaczące kozy,
- tokeny humbaka,
- dziury,
- ściany,
- napisy „Pracu Pracu”,
- stacje Amic.

Odstępy między przeszkodami zależą od aktywnej trudności.

## Obiekty obowiązkowe
- **Liście monstery** — `entities.leaves`, punktowe znajdźki.
- **Skaczące kozy** — `entities.goats`, poruszają się skokami; stomp daje boost, kontakt z boku szkodzi.
- **Humbak** — `entities.whaleTokens`, uruchamia mini-grę.
- **Napisy „Pracu Pracu”** — `entities.pracu` i `entities.whalePracu`, przeszkody.
- **Stacje Amic** — `entities.amic`, działają jako przeszkoda z bezpiecznym dachem-katapulta.

## Mini-gra z humbakiem
`startWhaleGame()` przełącza ekran na `WHALE`. W tym trybie:
- sowa unosi się po tapnięciu i opada bez wejścia,
- monstery dają punkty,
- „Pracu Pracu” odejmuje punkty i wywołuje shake,
- po upływie czasu gracz wraca do runnera z boostem i chwilową nietykalnością.

## Renderowanie
Kod rysuje wszystko proceduralnie w p5.js:
- tło, chmury i wzgórza,
- grunt i dziury,
- platformy,
- stacje Amic,
- liście monstery,
- skaczące kozy,
- humbaka,
- napisy „Pracu Pracu”,
- sowę,
- cząsteczki i HUD.

## Rekordy
Gra zapisuje rekordy w `localStorage`:
- `sowaRunnerBestScore`
- `sowaRunnerBestDistance`

## Zasady utrzymania
Przy każdej zmianie mechaniki, sterowania, UI lub obiektów aktualizuj:
- `docs/README.md`
- `docs/Documentation.md`

Jeżeli zmiana dotyczy ekranu startowego repozytorium, zaktualizuj także główną dokumentację w katalogu `docs/`.
