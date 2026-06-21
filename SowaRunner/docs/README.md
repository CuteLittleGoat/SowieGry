# SowaRunner — instrukcja gry

## Cel gry

Sowa biegnie automatycznie. Gracz skacze, wykonuje podwójny skok, zbiera liście, korzysta z kóz i dachów Amic oraz próbuje uzyskać jak największy dystans i wynik.

## Sterowanie

- **Tap / klik / Spacja** — skok i podwójny skok.
- **Enter / strzałka w górę** — alternatywny skok.
- **1 / 2 / 3** — `Chill`, `Arcade`, `Chaos`.
- Przyciski po lewej stronie ekranu — pauza, garderoba, misje i ustawienia.

## Nowe systemy „Cute Polish”

### Combo

Kolejne dobre akcje zwiększają mnożnik od `×1` do `×5`. Combo rośnie przez:

- zbieranie liści,
- bliskie uniki „O włos!”,
- perfekcyjne lądowania.

Utrata życia resetuje combo.

### „O włos!”

Bardzo bliskie minięcie dziury, ściany, stacji Amic lub napisu „Pracu Pracu” daje punkty i podtrzymuje combo.

### Liście

- zwykłe — podstawowe punkty,
- złote — większa premia,
- tęczowe — uruchamiają gorączkę monster.

Po dłuższej serii zbierania może rozpocząć się **gorączka monster**, podczas której pojawia się więcej liści, ale nie więcej przeszkód.

### Wydarzenia

- **Deszcz monster** — krótka seria dodatkowych liści.
- **Kozi maraton** — częstsze kozy.
- Zmieniająca się pora dnia.

### Dodatkowe życia

Serduszko dodaje jedno życie do limitu pięciu. Przy pełnym limicie zostaje zamienione na punkty.

## Obiekty

- **Kozy** — stomp z góry daje mocne wybicie.
- **Amic** — dach działa jak katapulta, bok jest niebezpieczny.
- **Humbak** — uruchamia mini-grę bonusową.
- **Pracu Pracu**, ściany i dziury — przeszkody.

## Profil, kosmetyki i misje

Wspólny profil działa we wszystkich trzech grach. Z poziomu garderoby można wybierać odblokowane dodatki, m.in. kokardkę, okulary, wianek, kapelusz, czapkę, szalik i plecak.

Misje odblokowują kolejne kosmetyki. Postęp jest zapisywany automatycznie.

## Audio i pauza

- muzykę, efekty i komentarze sowy można wyłączyć,
- gra ma pauzę,
- dźwięk jest aktywowany dopiero po interakcji użytkownika.

## Rekordy

Zapisywane są:

- najlepszy dystans,
- najlepszy wynik,
- statystyki wspólnego profilu.

## Diagnostyka

Dodaj `?debug=1` do adresu gry, aby zobaczyć liczbę przeszkód, prędkość, combo i aktywne wydarzenie.
