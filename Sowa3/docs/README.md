# Sowa3 — instrukcja gry

## Cel gry

`Sowa3` to trzytorowy runner w perspektywie wgłąb ekranu. Sowa biegnie przez cztery różne plansze, zbiera liście, zdobywa życia i omija przeszkody, aż dotrze do ogródka działkowego z basenem.

## Sterowanie

- **Swipe w lewo/prawo** — zmiana toru.
- **Tap po lewej lub prawej stronie** — zmiana toru o jeden pas.
- **A/D lub strzałki** — sterowanie na klawiaturze.
- **Spacja / Enter / tap** — start i restart.
- **1 / 2 / 3** — `Chill`, `Arcade`, `Chaos`.
- Przyciski pod HUD-em — pauza, garderoba, misje i ustawienia.

## Plansze

### Supermarket

Polski dyskont bez kopiowania konkretnego logo:

- regały i dekoracje wyłącznie po bokach,
- tablice „SUPER CENA!” wysoko nad alejką,
- pieczywo, stosy produktów i pracownik z paleciakiem przy krawędziach,
- palety z towarem jako przeszkody.

### Wystawa kwiatów

- hala targowa,
- metalowe stojaki pełne roślin,
- boczne wózki z kwiatami,
- zraszacze i mgiełka przy krawędziach,
- ludzie jako przeszkody.

### Blokowisko PRL

- wysokie bloki z wielkiej płyty,
- powtarzalne okna i balkony,
- trzepak i ławka przy bokach,
- kot wysoko na balkonie,
- gołębie w górnej części ekranu,
- dziki jako przeszkody.

### Stacja paliw Amic

Plansza jest wzorowana na jasnych stacjach Amic z białym zadaszeniem, zielonym pasem, żółtym akcentem i czerwonym logo:

- sklep i pełna stacja stanowią scenografię w tle,
- środkowy korytarz biegnie po asfaltowym podjeździe pod zadaszeniem,
- na tej planszy nie pojawia się miniaturowa stacja Amic jako przeszkoda,
- przeszkodami są wyłącznie dystrybutory paliwa, samochody i worki ze śmieciami,
- liście oraz serduszka nadal działają jak na pozostałych planszach.

## Czytelność trasy

Środek ekranu jest zarezerwowany dla trzech torów, przeszkód i pickupów. Elementy kosmetyczne są umieszczane wyłącznie:

- przy bokach,
- wysoko nad horyzontem,
- poza aktywnym korytarzem gry.

Gra ponownie rysuje czystą powierzchnię trasy po dekoracjach, dlatego tło nie powinno zasłaniać przeszkód.

## Balans torów

- przeszkody mają minimalny odstęp,
- wszystkie trzy tory nie mogą zostać jednocześnie zamknięte,
- zablokowany spawn może zostać zastąpiony liściem,
- kolejne przeszkody preferują różne tory,
- ruch osoby lub dzika jest wcześniej sygnalizowany strzałką.

## Combo i „O włos!”

Combo rośnie za:

- zbieranie liści,
- bliskie minięcie przeszkody,
- dłuższą serię bez obrażeń.

Mnożnik ma poziomy od `×1` do `×5`. Utrata życia resetuje serię.

## Liście i gorączka monster

- zwykły liść — punkty,
- złoty liść — duża premia,
- tęczowy liść — uruchamia gorączkę monster.

Gorączka zwiększa liczbę liści, ale nie zwiększa liczby przeszkód.

## Życia

Serduszko dodaje życie do limitu pięciu. Przy pełnym limicie daje punkty.

## Finał planszy

Po dobiegnięciu do działki:

1. sowa kieruje się do środka,
2. wskakuje do okrągłego basenu,
3. pojawia się plusk,
4. sowa zmienia się w humbaka,
5. pojawia się podsumowanie planszy.

Basen ma:

- szarą pionowo ryflowaną ściankę,
- szeroki niebieski rant,
- jasną turkusową wodę,
- delikatne fale,
- działkową trawę, płot, drzewa i krzewy.

Po pierwszym pełnym obejrzeniu finał można skrócić tapnięciem.

## Profil, kosmetyki i misje

Wspólny profil działa również w `SowaRunner` i `SowaJumper`. Garderoba pozwala wybierać odblokowane dodatki, a misje zapewniają kolejne kosmetyki.

## Audio i pauza

- motyw muzyczny zmienia się między planszami,
- efekty dla liści, telefonów, dzików, obrażeń i plusku,
- możliwość wyłączenia muzyki, efektów i komentarzy,
- pauza zatrzymuje również animację finałową.

## Diagnostyka

Dodaj `?debug=1` do adresu, aby wyświetlić tryb, numer planszy, liczbę przeszkód, combo, gorączkę i liczbę obiektów.
