# Sowa3 — dokumentacja techniczna

## Zakres
`Sowa3` jest samodzielną grą HTML/CSS/JavaScript bez frameworka. To trzytorowy runner w perspektywie „wgłąb ekranu”, inspirowany klasycznymi lane runnerami. Gracz steruje sową, zmieniając tor między lewym, środkowym i prawym.

## Pliki
- `index.html` — struktura strony, `canvas#game`, HUD i opis sterowania.
- `style.css` — pełnoekranowy layout, blokada przewijania, safe-area, HUD i opis sterowania.
- `script.js` — cała logika gry, renderowanie, proceduralne generowanie przeszkód, plansze, kolizje, wynik i rekord.
- `docs/README.md` — instrukcja dla gracza.
- `docs/Documentation.md` — dokumentacja techniczna.

## Stany gry
`state.mode` obsługuje cztery tryby:
- `title` — ekran tytułowy.
- `run` — właściwa gra.
- `finish` — meta planszy: ogród działkowy z basenem.
- `over` — ekran końca gry.

## Plansze
Tablica `STAGES` definiuje trzy plansze:
- `Supermarket`
- `Wystawa kwiatów ozdobnych`
- `Blokowisko PRL`

Każda plansza ma nazwę, skrót do HUD, kolory, kolor podłoża, akcent i długość. Po osiągnięciu długości planszy gra przełącza się do trybu `finish`, pokazuje ogród działkowy z basenem, dodaje premię punktową i po krótkim czasie uruchamia kolejną planszę.

## Perspektywa i tory
Gra używa pseudo-3D na canvasie:
- Obiekty mają tor `lane` równy `-1`, `0` albo `1`.
- Obiekty mają pozycję głębi `z`; pojawiają się daleko i przesuwają się w stronę gracza.
- `laneX(lane, z)` wyznacza poziomą pozycję toru zależnie od głębi.
- `roadY(z)` wyznacza pionową pozycję na drodze.
- `scaleAt(z)` skaluje obiekty, aby rosły w miarę zbliżania się do gracza.

## Sterowanie
- `keydown` obsługuje `A/D`, strzałki, `Spację` i `Enter`.
- `pointerdown` obsługuje start gry i tapnięcia po lewej/prawej stronie ekranu.
- `pointerup` obsługuje swipe w lewo/prawo.
- Funkcja `moveLane(dir)` ogranicza tor do zakresu od `-1` do `1`.

## Obiekty gry
`spawnObject()` generuje obiekty na losowym torze:
- `leaf` — liść monstery, punktowy obiekt do zebrania.
- `amic` — stacja Amic jako przeszkoda.
- `shift` — smartfon z napisem „przyjmiesz zmianę?”.
- `magda` — telefon z napisem „telefon od Magdy”.
- `cart` — wózek sklepowy.
- `pot` — donica, częstsza na planszy kwiatowej.
- `block` — betonowy słupek, częstszy na planszy PRL.

## Kolizje
Gdy obiekt osiąga bliski zakres `z < .12`, gra sprawdza, czy zaokrąglony tor sowy jest równy torowi obiektu:
- `leaf` daje punkty i znika.
- przeszkody wywołują `damage(reason)`.

Po obrażeniu gracz traci życie, dostaje krótką nietykalność, pojawia się shake i komunikat. Po utracie wszystkich żyć gra przełącza się do `over`.

## Renderowanie
Renderowanie jest w pełni proceduralne:
- `drawScene()` rysuje tło, drogę i dekoracje planszy.
- `drawStageDecor()` rysuje regały, kwiaty albo bloki zależnie od planszy.
- `drawAllotment()` rysuje ogród działkowy z basenem.
- `drawObjects()` rysuje przeszkody i znajdźki od najdalszych do najbliższych.
- `drawOwl()` rysuje sowę gracza.
- osobne funkcje rysują Amic, smartfony, monstery, donice, blokowisko i cząsteczki.

## HUD i rekord
HUD pokazuje:
- numer i skrót planszy,
- punkty,
- życia.

Najlepszy wynik jest zapisywany w `localStorage` pod kluczem `sowa3Best`.

## Zasady utrzymania
Przy każdej zmianie mechaniki, sterowania, plansz lub obiektów aktualizuj:
- `Sowa3/docs/README.md`
- `Sowa3/docs/Documentation.md`

Jeżeli gra jest dodawana albo usuwana z ekranu startowego, aktualizuj także dokumentację w katalogu głównym `docs/`.
