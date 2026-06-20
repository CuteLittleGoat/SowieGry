# SowaRunner — dokumentacja techniczna

## Zakres
`SowaRunner` jest bocznym endless runnerem zrealizowanym w p5.js. Gra została przebudowana jako pełniejsza wersja arcade z ekranem tytułowym, poziomami trudności, game over, mobilnym one-tap sterowaniem, proceduralnym spawnowaniem obiektów oraz mini-grą z humbakiem.

## Pliki
- `index.html` — ładuje `p5.js`, `p5.sound.min.js`, `style.css`, `sketch.js` oraz `render-fix.js`; zawiera metadane mobilne.
- `style.css` — blokuje scrollowanie, ustawia pełnoekranowy canvas i `touch-action: none`.
- `sketch.js` — pełna logika gry w kompaktowej formie.
- `render-fix.js` — hotfix renderowania; nadpisuje `drawBg()`, aby każda klatka była w pełni czyszczona i zamalowywana pełnym gradientem, co eliminuje powidoki/smużenie na mobile.
- `docs/README.md` — instrukcja dla gracza.
- `docs/Documentation.md` — dokumentacja techniczna.

## Ekrany gry
Stała `SCREEN` definiuje tryby:
- `TITLE` — ekran tytułowy, wybór trudności i instrukcja.
- `RUN` — właściwa gra.
- `WHALE` — mini-gra z humbakiem.
- `OVER` — ekran wyniku po utracie żyć.

## Trudności
`LEVELS` zawiera trzy konfiguracje:
- `Chill`
- `Arcade`
- `Chaos`

Każda trudność ustawia maksymalną prędkość, tempo narastania prędkości oraz minimalny i maksymalny odstęp między przeszkodami.

## Główne zmienne i kolekcje
Kod używa globalnych zmiennych stanu, aby utrzymać plik krótki i łatwy do uruchomienia bez bundlera:
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
Gra jest projektowana pod mobile:
- `touchStarted()` i `mousePressed()` wywołują `trigger()`.
- Na ekranie tytułowym klik/tap w kartę trudności zmienia poziom.
- `keyPressed()` obsługuje `1/2/3`, `Spację`, `Enter` i `strzałkę w górę`.

Runner jest sterowany jednym przyciskiem/tapnięciem. W trybie `RUN` tapnięcie wykonuje skok lub podwójny skok. W trybie `WHALE` tapnięcie unosi sowę w mini-grze.

## Fizyka runnera
- `updateRun(dt)` zwiększa czas, dystans, prędkość i wynik.
- `updateOwl(dt)` obsługuje grawitację, lądowanie, coyote time, jump buffer, dziury, platformy, dachy Amic i kozy.
- `jump()` rozróżnia pierwszy skok i podwójny skok.
- `hit()` odejmuje życie, uruchamia nietykalność, shake i ekran końca gry po spadku życia do zera.

## Proceduralne generowanie
`spawnStuff(dt, c)` generuje:
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
- **Liście monstery** — `leaves`, punktowe znajdźki.
- **Skaczące kozy** — `goats`, poruszają się skokami; stomp daje boost, kontakt z boku szkodzi.
- **Humbak** — `whales`, uruchamia mini-grę.
- **Napisy „Pracu Pracu”** — `pracu` i `bPracu`, przeszkody.
- **Stacje Amic** — `amic`, działają jako przeszkoda z bezpiecznym dachem-katapulta.

## Mini-gra z humbakiem
`startWhale()` przełącza ekran na `WHALE`. W tym trybie:
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

`render-fix.js` jest ładowany po `sketch.js`, więc jego definicja `drawBg()` zastępuje wcześniejszą wersję. Hotfix wykonuje `clear()` i pełny fill gradientem na każdej klatce, zamiast rysować tło paskami co kilka pikseli.

## Rekordy
Gra zapisuje rekordy w `localStorage`:
- `sowaRunnerBestScore`
- `sowaRunnerBestDistance`

## Zasady utrzymania
Przy każdej zmianie mechaniki, sterowania, UI lub obiektów aktualizuj:
- `docs/README.md`
- `docs/Documentation.md`

Jeżeli zmiana dotyczy ekranu startowego repozytorium, zaktualizuj także główną dokumentację w katalogu `docs/`.
