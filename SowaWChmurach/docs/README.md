# Sowa w Chmurach — instrukcja

**Sowa w Chmurach** to nowa wersja gry **SowaJumper** (etap E6 przebudowy SowieGry). Na razie jest to **wersja
podglądowa**: otwierasz ją z menu głównego przyciskiem **„Wypróbuj nową wersję: Sowa w Chmurach”** na karcie
SowaJumper albo pod adresem `SowaWChmurach/`. Rekordy liczą się tak samo jak w SowaJumper (wspólny profil
w chmurze).

## Cel gry

Sowa wspina się **jak najwyżej**: sama odbija się od gałązek, a Ty przesuwasz ją w bok, żeby trafiała na kolejne.
Zaczynasz w ogródku, a potem lecisz przez kolejne strefy:

1. **Ogródek** (0–150 m),
2. **Blok** (150–400 m),
3. **Chmury** (400–800 m),
4. **Zorza** (800–1500 m),
5. **Kosmos** (od 1500 m).

Pasek pod przyciskiem pauzy pokazuje wysokość, nazwę strefy i ile zostało do następnej.

> W kolejnych krokach etapu dochodzą: Pracu Pracu i Amic jako przeszkody, kózki z mocami (Rakietka, Sprężynka…),
> bonus „Niebiański Ocean” z humbakami, pełna oprawa stref, sterowanie przechylaniem telefonu, samouczek i muzyka.

## Sterowanie

| Ruch                  | Telefon                                                             | Klawiatura       |
| --------------------- | ------------------------------------------------------------------- | ---------------- |
| sowa w lewo / w prawo | przeciągnij palcem w lewo / w prawo — **w dowolnym miejscu ekranu** | ← / → albo A / D |
| skok                  | sam — sowa odbija się od każdej gałązki, na którą spadnie           | —                |
| pauza                 | przycisk ⏸ w lewym górnym rogu                                      | P albo Esc       |

- Ruch jest **względny**: sowa przesuwa się o tyle, o ile przesuniesz palec (trochę więcej). Najwygodniej trzymać
  kciuk **w dolnej części ekranu** — wtedy palec nie zasłania sowy ani gałązek nad nią.
- Za lewą krawędzią ekranu sowa wychodzi z prawej strony (i odwrotnie) — to często najkrótsza droga.
- Sowa odbija się tylko wtedy, gdy **spada** na platformę z góry. Lecąc w górę, przelatuje przez gałązki.
- Gesty zaczęte tuż przy lewej lub prawej krawędzi ekranu są ignorowane (systemowy gest „cofnij” w Safari).
  Najwygodniej grać po zainstalowaniu SowieGry jako aplikacji.

## Platformy

| Platforma          | Co robi                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **Gałązka**        | zwykła platforma                                                                         |
| **Liść Monstery**  | sprężysty — wybija sowę dwa razy wyżej, **+10 pkt** („Sprężysty liść!”)                  |
| **Chmurka**        | znika po jednym odbiciu                                                                  |
| **Huśtawka**       | kołysze się na linach w lewo i w prawo                                                   |
| **Balkon**         | szeroki, co 150 m — „Balkon — chwila oddechu ☕”                                         |
| **Krucha gałązka** | ciemna, popękana — **łamie się** pod sową i nie wybija (pułapka; zawsze jest inna droga) |

Gałązki są zawsze w zasięgu skoku — od każdej pewnej platformy da się dolecieć do następnej.

## Upadek i ratunek kózki

Jeśli sowa spadnie pod ekran, **kózka łapie ją** i odnosi na ostatnią pewną platformę („Ojej! Kózka łapie sowę —
następna gałązka będzie moja!”). Kosztuje to **jedno życie**, a sowa przez chwilę miga i jest bezpieczna.
Gra kończy się, gdy skończą się życia.

## Punkty

- **1 pkt za każdy metr** wysokości (najwyższy punkt lotu).
- **Liść Monstery** nad gałązką: **10 pkt × combo**; **złoty liść** — 50 pkt × combo i liczy się jak 5 liści.
- **Combo** rośnie o 1 co 8 w serii (liście i idealne lądowania), najwyżej **×5**. Upadek obniża je o jeden poziom.
- **Idealne lądowanie** — na środku platformy (środkowe 30%): „Idealnie! +N”. Premia rośnie z serią idealnych
  lądowań (2, 4, 6… najwyżej 20 pkt); lądowanie poza środkiem przerywa serię.
- Liść Monstery jako platforma: +10 pkt za każde odbicie.

## Poziomy trudności

| Poziom | Odstępy między gałązkami | Trudne platformy | Życia |
| ------ | ------------------------ | ---------------- | ----- |
| Chill  | najbliżej                | najrzadziej      | 4     |
| Arcade | standardowe              | standardowo      | 3     |
| Chaos  | najdalej                 | najczęściej      | 3     |

Z wysokością gałązki są coraz dalej od siebie, a trudnych platform (chmurek, huśtawek, kruchych gałązek) jest
więcej. Wybrany poziom zapamiętuje się w chmurze. Rekord każdego poziomu (wysokość i punkty) widać na ekranie
tytułowym, a po locie — na ekranie wyników (z miejscem w top 10). Wyniki pokazują też wysokość, strefę, najlepsze
combo, idealne lądowania i liczbę ratunków kózki.

**Tryb Przytulny** (ustawienie w menu głównym, zakładka Sowa; działa na poziomie Chill): gra płynie wolniej
i nie kończy się — ostatnie serduszko zostaje. Lot kończysz w menu pauzy („Zakończ lot”).

## Na telefonie

- Gra działa w pionie i w poziomie; w poziomie (i na komputerze) kolumna gry jest na środku ekranu.
- Obrót telefonu, przejście do innej aplikacji albo zablokowanie ekranu **wstrzymuje** lot (bez utraty postępu);
  po powrocie gra wznawia się odliczaniem 3-2-1.
- Na słabszym telefonie gra sama obniża rozdzielczość, żeby działała płynnie.

## Tryb diagnostyczny

Dopisz do adresu `?debug=1` — w prawym dolnym rogu pojawi się panel z liczbą klatek na sekundę, wysokością,
strefą, położeniem i prędkością sowy, liczbą platform i liści, combo, serią idealnych lądowań i życiami.
