# Łącz i Hoduj — instrukcja

**Łącz i Hoduj** to nowa wersja gry **Sowia Szklarnia** — spokojna gra logiczna na półkach szklarni. Na razie to
**prototyp** (wersja próbna): otwierasz go z menu głównego przyciskiem **„Wypróbuj nową wersję: Łącz i Hoduj”** na
karcie Sowiej Szklarni albo pod adresem `LaczIHoduj/`. Dawna Sowia Szklarnia działa dalej bez zmian — prototyp
zapisuje swój postęp osobno i niczego w niej nie rusza.

## Cel gry

Na półkach szklarni (7 kolumn × 9 rzędów) stoją rośliny. **Dwie takie same rośliny połączone razem dają roślinę
następnego poziomu.** Każda roślina ma swój łańcuch pięciu poziomów:

| Roślina      | 1              | 2            | 3            | 4        | 5 (szczyt)      |
| ------------ | -------------- | ------------ | ------------ | -------- | --------------- |
| **Monstera** | Nasionko       | Kiełek       | Sadzonka     | Monstera | Złota Monstera  |
| **Pilea**    | Ziarenko pilei | Listek pilei | Pieniążek    | Pilea    | Złota Pilea     |
| **Paproć**   | Zarodnik       | Pastorał     | Młoda paproć | Paproć   | Złota Paproć    |
| **Kaktus**   | Pestka kaktusa | Kuleczka     | Kaktusik     | Kaktus   | Kwitnący Kaktus |

Mała cyfra w rogu pola pokazuje poziom rośliny. Za każde połączenie dostajesz **liście monstery** (licznik 🍃 w prawym
górnym rogu): poziom 2 — 1, poziom 3 — 3, poziom 4 — 8, poziom 5 — 20. Dwie takie same rośliny na szczycie łańcucha
już się nie łączą — ale mogą dać **hybrydę**.

## Hybrydy

**Dwie różne rośliny na szczycie łańcucha** połączone razem dają hybrydę — jak w dawnej Sowiej Szklarni:

- **Złota Monstera + Złota Pilea → Monpilea Przytulna** (+60 liści),
- **Złota Paproć + Kwitnący Kaktus → Alopaproć Wachlarzowa** (+60 liści),
- **Monpilea Przytulna + Alopaproć Wachlarzowa → Złotolistka** (+200 liści).

Hybryda stoi w doniczce ze złotym rantem, świeci się złotą poświatą i ma w rogu **★** zamiast cyfry. Kolejność nie ma
znaczenia (Pilea na Monsterę też działa). Gdy przeciągasz roślinę nad pole, z którym zrobi hybrydę, pole świeci się na
zielono — tak jak przy zwykłym połączeniu.

## Jak przesuwać rośliny

- **Przeciąganie:** dotknij rośliny i przesuń palec. Roślina **unosi się nad palcem**, żeby było widać, gdzie spadnie.
  Pole pod rośliną świeci się na **zielono**, gdy rośliny się połączą, a na **niebiesko**, gdy roślina tylko się
  przeniesie. Puść palec — roślina spada na podświetlone pole.
- **Stuknięcia:** stuknij roślinę (dostaje złotą ramkę), potem stuknij pole docelowe. Stuknięcie tej samej rośliny
  jeszcze raz odznacza ją.
- Upuszczenie na **puste pole** przenosi roślinę, na **taką samą** — łączy je, a na **inną** — zamienia je miejscami.

## Zamówienia sowich sąsiadek

U góry ekranu, obok przycisku **Menu**, są trzy karty zamówień — od **Pani Puszczykowej**, **Płomykówki Poli**
i **Pójdźki Peli** (każda sąsiadka ma swój kolor ramki i małą główkę sowy). Na karcie widać roślinę, o którą prosi
sąsiadka, z cyfrą poziomu; **„×2”** w rogu znaczy, że chce dwie takie rośliny.

- Gdy potrzebne rośliny stoją już na półkach, karta robi się **zielona** i dostaje znaczek **✓**. **Stuknij ją**, żeby
  oddać rośliny (znikną z półek).
- Możesz też **przeciągnąć roślinę na kartę** — karta podświetla się, a sąsiadka bierze właśnie tę roślinę. Jeśli
  przeciągniesz inną roślinę, niż chce sąsiadka, roślina wraca na półkę, a podpowiedź mówi, o co prosi.
- Stuknięcie karty, której jeszcze nie da się oddać, pokazuje w podpowiedzi, czego potrzeba.

Za zamówienie dostajesz **liście** i **gwiazdki odnowy ⭐** (licznik pod liśćmi): im wyższy poziom rośliny, tym więcej
(kiełek — 4 liście i 1 gwiazdka, roślina 5. poziomu — 45 liści i 3 gwiazdki; za drugą sztukę dodatkowa gwiazdka).
Sąsiadka od razu prosi o coś nowego. Z czasem zamówienia są trudniejsze (wyższe poziomy, nowe rośliny z doniczki),
a po kilku zamówieniach sąsiadki proszą czasem o **hybrydę** (90 liści i 4 gwiazdki). Gwiazdki wydajesz na odnawianie pomieszczeń szklarni (niżej).

## Pomieszczenia szklarni

Stuknij **liczniki liści i gwiazdek** w prawym górnym rogu — otworzy się okno **Pomieszczenia szklarni**. Odnawiasz je
**po kolei**, etap po etapie (np. „Zamieść podłogę”, „Umyj szyby”), a każdy etap kosztuje kilka gwiazdek odnowy ⭐.
Zielona kropka przy licznikach znaczy, że masz dość gwiazdek na kolejny etap. Każde odnowione pomieszczenie daje
ułatwienie:

| Pomieszczenie         | Gwiazdki za etap | Ułatwienie po odnowieniu                                       |
| --------------------- | ---------------- | -------------------------------------------------------------- |
| 🪴 Doniczarnia        | 1 (3 etapy)      | Sowia doniczka mieści 2 ładunki więcej (14)                    |
| 🌿 Sala Upraw         | 2 (3 etapy)      | doniczka ładuje się co 2,5 s                                   |
| 💧 Zraszalnia         | 2 (4 etapy)      | niektóre nasionka z doniczki od razu kiełkują                  |
| 🌱 Sadzonkarnia       | 3 (4 etapy)      | doniczka ładuje się co 2 s                                     |
| 🪱 Kompostownia       | 3 (4 etapy)      | kompost daje 2 razy więcej liści                               |
| 🧬 Krzyżówkarium      | 3 (5 etapów)     | hybrydy dają o połowę więcej liści                             |
| 🐐 Kozi Zakątek       | 4 (5 etapów)     | kózki pomagają: nasionko z doniczki ląduje obok takiego samego |
| 🔬 Laboratorium Pyłku | 4 (5 etapów)     | zamówienia roślin 4. i 5. poziomu oraz hybryd: +1 gwiazdka     |
| 🌙 Kącik Drzemki      | 4 (6 etapów)     | doniczka ładuje się też wtedy, gdy gra jest zamknięta          |
| 🦉 Sowie Centrum      | 5 (6 etapów)     | zamówienia dają o połowę więcej liści                          |

## Sowia doniczka

Przycisk **🌱 Sowia doniczka** na dole kładzie **nasionko** na losowym wolnym polu. Doniczka ma **12 ładunków**
(licznik „12/12”); jeden ładunek wraca **co 3 sekundy**.

Na początku doniczka daje tylko nasionka Monstery. Kolejne rośliny dochodzą z liczbą połączeń (hybrydy też się
liczą): **Pilea po 10 połączeniach**, **Paproć po 30**, **Kaktus po 60** — gra ogłasza to komunikatem „Nowa roślina
w Sowiej doniczce”. Potem doniczka losuje nasionko spośród odblokowanych roślin (Monstera najczęściej). Gdy półki są pełne, doniczka nic nie kładzie i nie zużywa
ładunku — wtedy połącz albo skompostuj jakąś roślinę.

## Kompost

Kompostownik usuwa roślinę i zwalnia pole — za liście (poziom 1 — 1, poziom 2 — 2, poziom 3 — 4, poziom 4 — 10,
poziom 5 — 25; Monpilea i Alopaproć — 50, Złotolistka — 150). Możesz:

- **przeciągnąć roślinę na przycisk ♻️ Kompost** (przycisk podświetla się na zielono, gdy roślina jest nad nim), albo
- **zaznaczyć roślinę stuknięciem i stuknąć ♻️ Kompost**.

Dzięki kompostowi plansza nigdy nie zablokuje się na dobre — zawsze możesz zrobić miejsce.

## Dźwięk

W szklarni gra spokojna muzyka, a każdy ruch ma swój dźwięk: podniesienie rośliny, odstawienie na półkę, połączenie
(im wyższy poziom, tym wyższy ton; szczyt łańcucha i hybryda dostają fanfarę), nasionko z Sowiej doniczki i kompost. Dźwięk
rusza po pierwszym dotknięciu ekranu. Głośność muzyki i efektów ustawisz w menu głównym (zakładka **Sowa** →
**Ustawienia**).

## Zapis

Gra zapisuje się automatycznie w chmurze (ten sam profil, hasło `huhu` przy pierwszym wejściu na nowym urządzeniu):
po każdym połączeniu i komposcie (po 2 sekundach), co 20 sekund gry oraz od razu, gdy przełączysz się na inną
aplikację albo zamkniesz stronę. Postęp prototypu jest zapisany **osobno** od dawnej Sowiej Szklarni.

## Telefon pionowo, poziomo i komputer

Na telefonie trzymanym pionowo plansza zajmuje całą szerokość ekranu — nawet na najmniejszym (320 × 568) każde pole
ma co najmniej 44 px, więc wygodnie trafia się palcem. Na wysokim telefonie plansza stoi na środku ekranu, a na niskim
notka o prototypie chowa się, żeby zostało więcej miejsca na półki.

Gdy obrócisz telefon **poziomo**, plansza staje się szersza niż wyższa (9 kolumn × 7 rzędów), a zamówienia oraz
przyciski Sowiej doniczki i kompostu przechodzą na prawą stronę. Układ roślin obraca się razem z planszą — rośliny, które stały obok
siebie, nadal są sąsiadkami.

Na komputerze plansza stoi na środku, a rośliny przesuwa się myszą tak samo jak palcem.

## Co dalej

Gra wciąż rośnie. W kolejnych krokach dojdą: przeszkody Pracu Pracu i Amic, kózki-pomocnice, Basen Humbaka z rekordem,
pakiet startowy z postępu dawnej Szklarni i samouczek (z przyciskiem do jego powtórzenia).
