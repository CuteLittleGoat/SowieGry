# Sowa3 — dokumentacja techniczna

## Zakres
`Sowa3` jest samodzielną grą HTML/CSS/JavaScript bez frameworka. To trzytorowy runner w perspektywie „wgłąb ekranu”, inspirowany klasycznymi lane runnerami. Gracz steruje sową, zmieniając tor między lewym, środkowym i prawym.

## Pliki
- `index.html` — struktura strony, `canvas#game`, HUD, opis sterowania oraz ładowanie `script.js`, `difficulty.js` i `extra-lives.js`.
- `style.css` — pełnoekranowy layout, blokada przewijania, safe-area, HUD i opis sterowania.
- `script.js` — główna logika gry, renderowanie, proceduralne generowanie przeszkód, plansze, kolizje, wynik i rekord.
- `difficulty.js` — poziomy trudności, panel wyboru, skróty `1 / 2 / 3` i zapamiętanie wyboru w `localStorage`.
- `extra-lives.js` — serduszka jako pickupy dodatkowych żyć.
- `docs/README.md` — instrukcja dla gracza.
- `docs/Documentation.md` — dokumentacja techniczna.

## Stany gry
`state.mode` obsługuje cztery tryby:
- `title` — ekran tytułowy.
- `run` — właściwa gra.
- `finish` — meta planszy: ogród działkowy z basenem.
- `over` — ekran końca gry.

## Poziomy trudności
`difficulty.js` definiuje `SOWA3_DIFFICULTIES`:
- `chill` — 4 życia, wolniejszy start, wyższy mnożnik przerw między przeszkodami, częstsza zamiana przeszkody na liść, niższy mnożnik punktów.
- `arcade` — standardowy balans.
- `chaos` — 2 życia, szybszy start, niższy mnożnik przerw między przeszkodami, brak zamiany przeszkód na liście, wyższy mnożnik punktów.

Wybór jest zapisywany w `localStorage` pod kluczem `sowa3Difficulty`.

## Dodatkowe życia
`extra-lives.js` dodaje serduszka jako osobne pickupy na torach. Serduszka poruszają się w tej samej pseudo-3D perspektywie co przeszkody. Zebranie serduszka:
- dodaje 1 życie, jeśli gracz ma mniej niż 5 żyć,
- daje punkty, jeśli gracz ma już 5 żyć.

Częstotliwość pojawiania się serduszek zależy od poziomu trudności.

## Plansze
Tablica `STAGES` definiuje trzy plansze:
- `Supermarket`
- `Wystawa kwiatów ozdobnych`
- `Blokowisko PRL`

Każda plansza kończy się ogrodem działkowym z basenem.

## Perspektywa i tory
Gra używa pseudo-3D na canvasie:
- Obiekty mają tor `lane` równy `-1`, `0` albo `1`.
- Obiekty mają pozycję głębi `z`; pojawiają się daleko i przesuwają się w stronę gracza.
- `laneX(lane, z)` wyznacza poziomą pozycję toru zależnie od głębi.
- `roadY(z)` wyznacza pionową pozycję na drodze.
- `scaleAt(z)` skaluje obiekty, aby rosły w miarę zbliżania się do gracza.

## Sterowanie
- `keydown` obsługuje `A/D`, strzałki, `Spację`, `Enter` i wybór poziomu `1 / 2 / 3`.
- `pointerdown` obsługuje start gry i tapnięcia po lewej/prawej stronie ekranu.
- `pointerup` obsługuje swipe w lewo/prawo.
- Funkcja `moveLane(dir)` ogranicza tor do zakresu od `-1` do `1`.

## Obiekty gry
- `leaf` — liść monstery, punktowy obiekt do zebrania.
- `heart` / serduszko — dodatkowe życie albo punkty przy limicie.
- `amic` — stacja Amic jako przeszkoda.
- `shift` — smartfon z napisem „przyjmiesz zmianę?”.
- `magda` — telefon z napisem „telefon od Magdy”.
- `cart` — wózek sklepowy.
- `pot` — donica, częstsza na planszy kwiatowej.
- `block` — betonowy słupek, częstszy na planszy PRL.

## Kolizje
Gdy obiekt osiąga bliski zakres, gra sprawdza tor sowy i tor obiektu:
- `leaf` daje punkty i znika.
- serduszko dodaje życie albo punkty.
- przeszkody wywołują `damage(reason)`.

Po obrażeniu gracz traci życie, dostaje krótką nietykalność, pojawia się shake i komunikat. Po utracie wszystkich żyć gra przełącza się do `over`.

## HUD i rekord
HUD pokazuje numer planszy, punkty i życia. Najlepszy wynik jest zapisywany w `localStorage` pod kluczem `sowa3Best`.

## Zasady utrzymania
Przy każdej zmianie mechaniki, sterowania, plansz lub obiektów aktualizuj `Sowa3/docs/README.md` oraz `Sowa3/docs/Documentation.md`.
