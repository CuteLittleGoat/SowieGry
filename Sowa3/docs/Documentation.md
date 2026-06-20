# Sowa3 — dokumentacja techniczna

## Zakres
`Sowa3` jest samodzielną grą HTML/CSS/JavaScript bez frameworka. To trzytorowy runner w perspektywie „wgłąb ekranu”, inspirowany klasycznymi lane runnerami. Gracz steruje sową, zmieniając tor między lewym, środkowym i prawym.

## Pliki
- `index.html` — struktura strony, `canvas#game`, HUD, opis sterowania oraz ładowanie `script.js`, `difficulty.js`, `extra-lives.js`, `visual-polish.js`, `stage-obstacles.js` i `lane-balance.js`.
- `style.css` — pełnoekranowy layout, blokada przewijania, safe-area, HUD i opis sterowania.
- `script.js` — główna logika gry, renderowanie, proceduralne generowanie przeszkód, plansze, kolizje, wynik i rekord.
- `difficulty.js` — poziomy trudności, panel wyboru, skróty `1 / 2 / 3` i zapamiętanie wyboru w `localStorage`.
- `extra-lives.js` — serduszka jako pickupy dodatkowych żyć.
- `visual-polish.js` — poprawione tła supermarketu, wystawy kwiatów i blokowiska.
- `stage-obstacles.js` — palety z towarem w supermarkecie, ludzie na wystawie kwiatów i dziki na blokowisku.
- `lane-balance.js` — globalny balans przeszkód blokujących tory.
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
`extra-lives.js` dodaje serduszka jako osobne pickupy na torach. Zebranie serduszka dodaje 1 życie do limitu 5 żyć albo daje punkty, jeśli gracz ma już limit.

## Balans torów i odstępy przeszkód
`lane-balance.js` nadpisuje spawn bazowych przeszkód oraz spawn przeszkód planszowych. Moduł traktuje jako przeszkody blokujące między innymi `amic`, `shift`, `magda`, `cart`, `pot`, `block`, `pallet`, `person` i `boar`.

Zasady balansu:
- przeszkoda blokująca nie pojawia się, jeśli poprzednia przeszkoda blokująca jest zbyt blisko na osi głębi `z`,
- minimalny odstęp zależy od poziomu trudności: największy na `chill`, standardowy na `arcade`, najmniejszy na `chaos`,
- jeżeli spawn blokującej przeszkody został zatrzymany, gra może zamiast niej dodać liść monstery,
- kolejne przeszkody preferują inny tor niż poprzednia, żeby zmuszać do ruchu, ale nie zamykać całej szerokości planszy.

Celem modułu jest niedopuszczenie do sytuacji, w której wszystkie trzy tory są jednocześnie zablokowane i gracz nie ma pola manewru.

## Plansze i tła
`visual-polish.js` nadpisuje `drawScene()` dla trzech plansz:
- `Supermarket` — polski dyskont z jasną alejką, regałami po bokach, kafelkami, stosami produktów i tablicami „SUPER CENA!”.
- `Wystawa kwiatów ozdobnych` — hala / festiwal roślin z długimi alejkami, metalowymi stojakami, wieloma doniczkami, żółtymi cenówkami, ciemnym sufitem i tłumem odwiedzających.
- `Blokowisko PRL` — osiedle z wielkiej płyty: prefabrykowane bloki, powtarzalne okna, balkony, bure elewacje, drzewa i osiedlowy plac.

Każda plansza kończy się ogrodem działkowym z basenem.

## Przeszkody planszowe
`stage-obstacles.js` dodaje osobne przeszkody zależne od planszy:
- `pallet` — paleta z towarem na planszy supermarketu.
- `person` — człowiek / odwiedzający jako przeszkoda na planszy wystawy kwiatów.
- `boar` — dzik na planszy blokowiska.

Te przeszkody mają własny timer spawnu, poruszają się w pseudo-3D tak jak inne obiekty i wywołują `damage()` po trafieniu sowy na tym samym torze. Ich faktyczne pojawienie się jest dodatkowo filtrowane przez `lane-balance.js`.

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
- `pallet` — paleta z towarem w supermarkecie.
- `person` — człowiek jako przeszkoda na wystawie kwiatów.
- `pot` — donica, częstsza na planszy kwiatowej.
- `block` — betonowy słupek, częstszy na planszy PRL.
- `boar` — dzik na blokowisku.

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
