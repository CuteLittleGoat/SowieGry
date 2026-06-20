# Sowa Jumper — dokumentacja techniczna

## Zakres
`SowaJumper` jest samodzielną grą HTML/CSS/JavaScript bez frameworka. Główna logika, renderowanie i sterowanie znajdują się w `script.js`; `difficulty.js` dodaje poziomy trudności i ładuje moduły dodatkowe.

## Pliki
- `index.html` — canvas gry, HUD, komunikat sterowania oraz ładowanie `script.js` i `difficulty.js`.
- `styles.css` — pełnoekranowy layout, safe-area, blokada scrollowania, HUD i podpowiedzi sterowania dotykowego.
- `script.js` — pętla gry, fizyka, generowanie świata, kolizje, bazowa mini-gra z humbakiem, rysowanie obiektów i rekordy.
- `difficulty.js` — poziomy trudności, panel wyboru, skróty `1 / 2 / 3`, zapis wyboru oraz dynamiczne ładowanie modułów dodatkowych.
- `extra-lives.js` — serduszka jako pickupy dodatkowych żyć.
- `bonus-fix.js` — poprawiona mini-gra z humbakiem.
- `docs/README.md` — instrukcja dla gracza.
- `docs/Documentation.md` — dokumentacja techniczna.

## Stany gry
- `title` — ekran tytułowy.
- `playing` — właściwa gra.
- `bonus` — mini-gra z humbakiem.
- `gameover` — ekran końca gry.

## Poziomy trudności
`difficulty.js` definiuje `chill`, `arcade` i `chaos`. Poziomy zmieniają liczbę żyć na starcie, grawitację, moc wybić oraz odstępy między platformami. Wybór jest zapisywany w `localStorage` pod kluczem `sowaJumperDifficulty`.

## Dodatkowe życia
`extra-lives.js` dodaje kolekcję serduszek. Serduszka pojawiają się nad platformami po osiągnięciu pewnej wysokości. Zebranie serduszka:
- dodaje 1 życie, jeżeli gracz nie ma limitu,
- daje punkty, jeżeli gracz ma już maksymalną liczbę żyć.

Limit żyć jest oparty o `state.maxLives` i poziom trudności.

## Mini-gra z humbakiem
`bonus-fix.js` nadpisuje funkcje mini-gry z humbakiem. Poprawiona wersja działa tak:
- sowa jest przy dole ekranu i porusza się lewo/prawo,
- monstery oraz napisy „Pracu Pracu” spadają z góry na dół,
- gracz może realnie zbierać monstery i omijać przeszkody,
- „Pracu Pracu” odejmuje punkty z bonusu,
- po końcu bonusu gracz wraca do głównej gry z wybiciem i chwilową nietykalnością.

## Obiekty
- Liście monstery — punkty.
- Serduszka — dodatkowe życia albo punkty przy limicie.
- Skaczące kozy — boost w górę.
- Humbak — wejście do mini-gry.
- „Pracu Pracu” — przeszkoda.
- Amic — katapulta.

## Rekordy
Gra zapisuje rekordy w `localStorage`:
- `sowaJumperBestScore`
- `sowaJumperBestHeight`

## Zasady utrzymania
Przy zmianach mechaniki, sterowania, UI lub obiektów aktualizuj `docs/README.md` oraz `docs/Documentation.md`.
