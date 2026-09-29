# Sowie Tory — instrukcja

**Sowie Tory** to nowa wersja gry **Sowa3** (etap E5 przebudowy SowieGry). Na razie jest to **wersja podglądowa**:
otwierasz ją z menu głównego przyciskiem **„Wypróbuj nową wersję: Sowie Tory”** na karcie Sowa3 albo pod adresem
`SowieTory/`. Rekordy liczą się tak samo jak w Sowa3 (wspólny profil w chmurze).

## Cel gry

Sowa biegnie **w głąb ekranu po trzech torach**. Omijaj przeszkody Pracu Pracu i Amic, zbieraj liście monstery
i dobiegnij do mety każdej planszy. Kampania ma cztery plansze (w tej kolejności):

1. **Sowa w sklepie Biedronka**,
2. **Sowa na festiwalu roślin**,
3. **Sowa uciekająca przed dzikami na blokowisku z PRL**,
4. **Sowa na stacji benzynowej Amic**.

Każda plansza trwa około 75 sekund. Pasek pod wynikiem pokazuje numer i nazwę planszy oraz ile zostało do mety.
Po każdej planszy (na razie krótka przerwa) biegniesz dalej — następna plansza jest trochę szybsza.
Po ostatniej planszy kampania jest ukończona.

> W kolejnych krokach etapu dochodzą: oprawa czterech plansz, pościg dzików na blokowisku, finał z basenem
> ogrodowym i przemianą sowy w humbaka, grywalne „Humbacze Tory”, gwiazdki, kózki, tryb Nieskończony,
> samouczek i muzyka.

## Sterowanie

| Ruch                 | Telefon                                                                 | Klawiatura       |
| -------------------- | ----------------------------------------------------------------------- | ---------------- |
| tor w lewo / w prawo | przesuń palcem w lewo / w prawo, albo stuknij lewą / prawą część ekranu | ← / → albo A / D |
| skok                 | przesuń palcem w górę, albo stuknij środek ekranu                       | ↑, W albo Spacja |
| ślizg                | przesuń palcem w dół                                                    | ↓ albo S         |
| pauza                | przycisk ⏸ w lewym górnym rogu                                          | P albo Esc       |

- Przesunięcie w dół **w powietrzu** szybko sprowadza sowę na ziemię i od razu zaczyna ślizg.
- Przesunięcie w górę w czasie ślizgu przerywa ślizg i sowa skacze.
- Gesty zaczęte tuż przy lewej lub prawej krawędzi ekranu są ignorowane (to miejsce systemowego gestu „cofnij”
  w Safari). Najwygodniej grać po zainstalowaniu SowieGry jako aplikacji.

## Przeszkody

| Przeszkoda                      | Jak ominąć  | Pracu Pracu                                                                                             | Amic                                                          |
| ------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **niska**                       | skok        | teczka, budzik                                                                                          | barierka, kanister                                            |
| **wysoka** (na wysokości głowy) | ślizg       | dymek „Pracu pracu!”                                                                                    | znak z cenami                                                 |
| **pełna**                       | zmiana toru | telefon, „Telefon od Magdy”, tablica „Przyjmiesz zmianę?”                                               | dystrybutor, wózek, **cysterna** (długa — zajmuje tor dłużej) |
| **ruchoma**                     | zmiana toru | telefon, który przejeżdża na sąsiedni tor — nad nim miga **pomarańczowa strzałka** (0,8 s przed ruchem) | —                                                             |

Przeszkody pojawiają się z mgły w oddali — przy każdej prędkości masz co najmniej 2 sekundy na reakcję
(na pierwszej planszy Arcade prawie 3 sekundy), na każdym telefonie tyle samo.

## Życia i punkty

- Życia (serduszka-doniczki w prawym górnym rogu): **Chill 4, Arcade 3, Chaos 2**. Trafienie zabiera jedno życie,
  a przez 1,5 s sowa miga i jest nietykalna. Bez żyć bieg się kończy.
- **Tryb Przytulny** (ustawienie w menu głównym, zakładka Sowa; działa na poziomie Chill): wolniej i bez końca
  gry — ostatnie serduszko zostaje. Bieg kończysz w menu pauzy („Zakończ bieg”).
- Punkty: 0,5 pkt za każdy metr, liść **10 pkt × combo** (złoty liść 50 pkt × combo i liczy się jak 5 liści),
  **+250 pkt** za ukończenie planszy i **+300 pkt** za planszę bez trafienia, **+25 pkt** za „O włos!” (zmiana toru
  tuż przed pełną przeszkodą).
- **Combo** rośnie o 1 co 8 liści bez trafienia (najwyżej ×5); trafienie obniża je o jeden poziom.
- Łuk liści nad przeszkodą podpowiada skok, nisko ułożone liście — ślizg.

## Poziomy trudności

| Poziom | Prędkość na 1. planszy | Każda kolejna plansza | Życia |
| ------ | ---------------------- | --------------------- | ----- |
| Chill  | 11 → 15 m/s            | +0,6 m/s              | 4     |
| Arcade | 13 → 18 m/s            | +0,8 m/s              | 3     |
| Chaos  | 15 → 21 m/s            | +1 m/s                | 2     |

Wybrany poziom zapamiętuje się w chmurze. Rekord każdego poziomu widać na ekranie tytułowym, a po biegu —
na ekranie wyników (z miejscem w top 10). Ekran wyników pokazuje też ukończone plansze, dystans, najlepsze
combo, „O włos!” i liczbę trafień.

## Na telefonie

- Gra działa w pionie i w poziomie; w poziomie droga jest na środku, a scenografia po bokach.
- Obrót telefonu, przejście do innej aplikacji albo zablokowanie ekranu **wstrzymuje** bieg (bez utraty postępu);
  po powrocie gra wznawia się odliczaniem 3-2-1.
- Na słabszym telefonie gra sama obniża rozdzielczość, żeby biegła płynnie.

## Tryb diagnostyczny

Dopisz do adresu `?debug=1` — w prawym dolnym rogu pojawi się panel z liczbą klatek na sekundę, prędkością,
planszą, dystansem, bieżącym wzorem przeszkód, torem sowy, combo i życiami.
