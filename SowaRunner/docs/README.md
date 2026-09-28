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

Misje odblokowują kolejne kosmetyki. Postęp jest zapisywany automatycznie w chmurze — ten sam na telefonie i komputerze. Przy pierwszym wejściu na nowym urządzeniu trzeba raz wpisać hasło `huhu`.

## Audio i pauza

- muzykę, efekty i komentarze sowy można wyłączyć,
- gra ma pauzę,
- dźwięk jest aktywowany dopiero po interakcji użytkownika.

## Rekordy

Zapisywane są (w chmurze, osobno dla poziomów Chill, Arcade i Chaos):

- najlepszy dystans,
- najlepszy wynik,
- 10 najlepszych biegów i ostatnie gry,
- rekord wyzwania dnia,
- statystyki wspólnego profilu.

Rekord zrobiony na telefonie widać też na komputerze (i odwrotnie). Bez internetu gra działa dalej, a wynik wyśle się, gdy wróci zasięg.

## Diagnostyka

Dodaj `?debug=1` do adresu gry, aby zobaczyć liczbę przeszkód, prędkość, combo i aktywne wydarzenie.

## Okno rekordów

Przycisk **🏆** w prawym górnym rogu otwiera okno **Rekordy**: najlepszy wynik dla wybranego poziomu trudności (Chill / Arcade / Chaos), 10 najlepszych gier, 10 ostatnich gier i rekordy wyzwania dnia. Rekordy są zapisane w chmurze, więc te same widać na telefonie i komputerze.

## Gra jako aplikacja na telefonie

SowieGry można dodać do ekranu głównego (Android: menu ⋮ → „Zainstaluj aplikację”; iPhone: „Udostępnij” → „Do ekranu początkowego”). Gra otwierana wcześniej uruchomi się wtedy także bez zasięgu.
