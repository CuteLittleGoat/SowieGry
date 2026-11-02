# Testy na telefonie — co kliknąć i co powinno się stać

Ten plik jest dla osoby, która testuje gry na telefonie. Każdy test to kilka kroków i opis, co **powinno być**.
Po każdej poprawce dopisuję tu nowy test (najnowsze są na górze listy w rozdziale „Spis”).

**Jeśli coś wygląda inaczej niż w opisie:** zapisz numer testu i kroku (np. „B2, krok 4”), co się stało, na jakim
telefonie — i jeśli się da, zrób zrzut ekranu.

## Zanim zaczniesz

1. Telefon trzyma w pamięci poprzednią wersję gier. Po każdej poprawce **odśwież stronę dwa razy** (w Safari:
   strzałka w kółko obok adresu) albo **zamknij aplikację i otwórz ją ponownie dwa razy**.
2. Testy robimy w pełnej wersji (zwykły adres SowieGry albo aplikacja na ekranie głównym), nie w wersji demo.
3. Postęp w grach jest prawdziwy i się zapisuje — testy niczego nie kasują.

## Spis

| Test  | Co sprawdza                                                                                             | Od kiedy   |
| ----- | ------------------------------------------------------------------------------------------------------- | ---------- |
| G2    | Galeria: 10 nowych zdjęć (nr 31–40) za nowe krainy, rozdziały, rośliny i pomieszczenia                  | 2026-11-02 |
| L2    | Łącz i Hoduj: diamentowe i tęczowe rośliny, Baobab i nowe rośliny, 6 nowych pomieszczeń, Kram ogrodnika | 2026-11-02 |
| C1    | Sowa w Chmurach: nowe krainy ponad Kosmosem (od 1900 m) aż do Sowich Zaświatów                          | 2026-11-02 |
| O4    | Sowie Ogrody: 8 nowych rozdziałów (od Palmiarni), nowe rośliny, nawozy, gałąź „Słońce”                  | 2026-11-01 |
| O2–O3 | Sowie Ogrody: lista roślin do samego końca, „Rozwiń listę”, wybór tła                                   | 2026-11-01 |
| O1    | Sowie Ogrody: duże liczby pokazują się dobrze (150 mln)                                                 | 2026-11-01 |
| L1    | Łącz i Hoduj: podpowiedzi widać w całości                                                               | 2026-11-01 |
| U1    | Sowia Ucieczka: humbak mniej więcej raz na krainę                                                       | 2026-11-01 |
| G1    | Galeria: zamiast podobnych zdjęć — nowe                                                                 | 2026-11-01 |
| B1–B4 | Sowi Butik: zakupy i kolory sowy nie cofają się, przeprosinowe piórka                                   | 2026-11-01 |

---

## B — Sowi Butik (kolory sowy)

Poprawka: zakup i wybór koloru sowy zapisują się teraz od razu, a spóźniona odpowiedź z internetu nie może już
cofnąć zakupu. Kolory i stroje, które wcześniej zniknęły, a były zapisane w historii zakupów, wracają same.

### B1 — przeprosinowe piórka

1. Otwórz SowieGry (menu główne).
2. **Powinno być:** pojawia się komunikat „Przeprosiny za Sowi Butik · Zakupy w Butiku zapisują się już od razu ·
   +0 XP · +50 piórek”.
3. Stuknij na dole zakładkę **Sowa** i przewiń do **Sowi Butik**.
4. **Powinno być:** liczba piórek w nagłówku Butiku jest o 50 większa niż przed poprawką.
5. Zamknij aplikację i otwórz ją ponownie.
6. **Powinno być:** komunikatu o przeprosinach już nie ma (dostaje się je tylko raz), a liczba piórek się nie zmieniła.

### B2 — Płomykówka zostaje kupiona i wybrana

1. Zakładka **Sowa** → **Sowi Butik** → **Gatunki sów** → wiersz **Płomykówka**.
2. Jeśli przy Płomykówce jest przycisk **Wybierz** — stuknij go (to znaczy, że wcześniejszy zakup wrócił). Jeśli jest
   przycisk z ceną **🪶 70** — stuknij go, a w okienku „Kupić w Sowim Butiku?” stuknij **Kup**.
3. **Powinno być:** przy Płomykówce napis **Wybrana**, a sówka w profilu (na górze zakładki „Sowa”) jest złocista
   z białą twarzą.
4. Poczekaj **1 minutę**, nic nie klikając.
5. **Powinno być:** dalej „Wybrana” i złocista sówka — kolor **nie** wraca do białego (Śnieżnej).
6. Stuknij zakładkę **Gry**. **Powinno być:** sówka w dymku na górze jest złocista i taka zostaje.
7. Zamknij aplikację i otwórz ją ponownie, wejdź do **Sowa** → **Sowi Butik**.
8. **Powinno być:** Płomykówka „Wybrana”, a liczba piórek taka sama jak zaraz po zakupie (piórka nie wracają, zakup
   się nie cofa).

### B3 — przełączanie kolorów i gra

1. W Butiku stuknij **Wybierz** przy Śnieżnej. **Powinno być:** sówka w profilu biała.
2. Stuknij **Wybierz** przy Płomykówce. **Powinno być:** sówka złocista.
3. Od razu (w ciągu kilku sekund) stuknij zakładkę **Gry** i **Graj** w dowolnej grze z sową (np. Sowia Ucieczka).
4. **Powinno być:** w grze sowa jest złocista (Płomykówka).
5. Wróć do menu przyciskiem **Menu** w grze i wejdź do **Sowa** → **Sowi Butik**.
6. **Powinno być:** wybrana dalej Płomykówka.

### B4 — stroje w Garderobie

1. Zakładka **Sowa** → **Garderoba**.
2. **Powinno być:** wszystkie stroje kupione kiedyś w Butiku są odblokowane (bez kłódki) i da się je wybrać.

---

## G2 — Galeria: 10 nowych zdjęć

Poprawka: w Galerii jest 40 zdjęć (wcześniej 30). Nowe zdjęcia nr 31–40 zdobywa się w nowych krainach Sowy w Chmurach,
w nowych rozdziałach Sowich Ogrodów i za nowe rośliny i pomieszczenia w Łącz i Hoduj.

1. Menu → zakładka **Galeria**.
2. **Powinno być:** licznik na górze pokazuje „… / 40”. Wszystkie zdjęcia, które były odblokowane, dalej są
   odblokowane (liczba przed ukośnikiem jest taka sama jak przed poprawką albo większa).
3. Przewiń na sam dół. **Powinno być:** 10 nowych zdjęć — zablokowane mają kłódkę, opis celu i pasek postępu:
   - nr 31 — wznieś się na 1900 m w Sowie w Chmurach (Mgławica),
   - nr 32 — doleć do Olimpu (3100 m),
   - nr 33 — dotrzyj do Sowich Zaświatów (5100 m),
   - nr 34 — ukończ 6 rozdziałów Sowich Ogrodów (do Arboretum włącznie),
   - nr 35 — ukończ 9 rozdziałów (do Ogrodu japońskiego włącznie),
   - nr 36 — ukończ wszystkie 14 rozdziałów,
   - nr 37 — wyhoduj diamentową roślinę w Łącz i Hoduj,
   - nr 38 — wyhoduj tęczową roślinę,
   - nr 39 — odnów 12 pomieszczeń w Łącz i Hoduj,
   - nr 40 — odnów wszystkie 16 pomieszczeń i osiągnij 10. poziom Sowiej Akademii.
4. Stuknij filtr **Do zdobycia**. **Powinno być:** widać tylko zablokowane zdjęcia, w tym nowe.
5. Jeśli w Sowich Ogrodach grasz już w Palmiarni (napis „Rozdział 7/14” albo dalej) — otwórz **Sowie Ogrody**
   i poczekaj kilka sekund. **Powinno być:** komunikat „Nowa fotografia w Galerii Sów!” — „Zza pnia” (zdjęcie nr 34
   za 6 ukończonych rozdziałów, które już masz).
6. Zagraj w grę z jednego z celów (np. w Łącz i Hoduj połącz dwie złote rośliny w diamentową, albo w Sowie w Chmurach
   wznieś się na 1900 m). **Powinno być:** komunikat „Nowa fotografia w Galerii Sów!” (w Łącz i Hoduj i w Sowich
   Ogrodach — po kilku sekundach, w Sowie w Chmurach — na ekranie wyników), a w Galerii nowe zdjęcie ze znaczkiem
   **Nowe!**.
7. Stuknij nowe zdjęcie. **Powinno być:** otwiera się na cały ekran, pod spodem autor i link do Pexels; po zamknięciu
   znaczek „Nowe!” znika.
8. Zamknij aplikację i otwórz ją ponownie, wejdź do **Galerii**. **Powinno być:** nowe zdjęcie dalej odblokowane.

## L2 — Łącz i Hoduj: nowe poziomy, rośliny, pomieszczenia i Kram

Poprawka: rośliny mają teraz 7 poziomów (po złotym jest **diamentowy** i **tęczowy**), dochodzi 5 nowych roślin
(Storczyk, Słonecznik, Truskawka, Lotos i **Baobab**) z nowymi hybrydami, 6 nowych pomieszczeń i **Kram ogrodnika**,
w którym wydajesz liście.

1. Otwórz **Łącz i Hoduj**. **Powinno być:** wszystko jak przedtem — rośliny na półkach, liście, gwiazdki
   i odnowione pomieszczenia.
2. Połącz dwie takie same **złote** rośliny (np. dwie Złote Monstery). **Powinno być:** powstaje **Diamentowa
   Monstera** (błękitna, z iskrami, cyfra 6 w rogu). Dwie diamentowe dają **Tęczową Monsterę** (7, kolorowa).
3. Połącz dwie **różne** złote rośliny (np. Złotą Monsterę i Złotą Pileę). **Powinno być:** hybryda jak dawniej
   (Monpilea Przytulna).
4. Gdy masz już dużo połączeń (od 100), w doniczce pojawiają się po kolei: Storczyk, Słonecznik, Truskawka, Lotos
   i na końcu **Baobab** (po 400 połączeniach) — za każdym razem komunikat „Nowa roślina w Sowiej doniczce”.
5. Stuknij liczniki liści i gwiazdek (prawy górny róg). **Powinno być:** okno otwiera się od pierwszego stuknięcia
   (sprawdź 3 razy, zamykając je w międzyczasie — gdyby czasem trzeba było stuknąć drugi raz, napisz), ma na dole
   przycisk **🛒 Kram ogrodnika**, a lista pomieszczeń ma 16 pozycji (nowe: Palmiarnia, Pasieka, Herbaciarnia,
   Obserwatorium, Motylarnia, Ogród na dachu). Kto odnowił wszystkie 10 dawnych, ma teraz w toku Palmiarnię.
6. Stuknij **🛒 Kram ogrodnika**. **Powinno być:** 6 ofert z cenami w liściach. Kup coś, na co Cię stać (np. Gwiazdkę
   odnowy za 200 🍃). **Powinno być:** liście maleją o cenę, gwiazdek przybywa.
7. Jeśli kupisz **Girlandę lampek** — nad i pod półkami migają kolorowe lampki; **Motyle** — nad półkami fruwają trzy
   motylki.

## C1 — Sowa w Chmurach: krainy ponad Kosmosem

Poprawka: ponad Kosmosem co 400 m jest nowa kraina — Mgławica, potem krainy z mitów świata (nordycka, egipska,
grecka, japońska, aztecka, chińska, hinduska), a na samej górze Sowie Zaświaty.

1. Otwórz **Sowę w Chmurach** i leć jak najwyżej (rekord to 3400 m — wystarczy, żeby zobaczyć kilka nowych krain).
2. **Powinno być:** na wysokości **1900 m** komunikat „Strefa: Mgławica!”, a w tle kolorowe obłoki gazu i gwiazdy.
3. **Powinno być:** co 400 m kolejna kraina i jej nazwa w pasku pod przyciskiem pauzy:
   - 2300 m **Tęczowy Most** (zorza, tęczowy most, drzewo),
   - 2700 m **Złota Pustynia** (piramidy na obłokach, łódź ze słońcem),
   - 3100 m **Olimp** (biała świątynia z kolumnami na obłoku, złote listki),
   - 3500 m **Kraina Torii** (czerwona brama, góra ze śniegiem, lampiony, płatki wiśni),
   - 3900 m **Słoneczne Schody** (tarcza słońca, schodkowa piramida),
   - 4300 m **Smocze Chmury** (smok z kółek, pagoda, czerwone lampiony),
   - 4700 m **Lotosowa Góra** (kręcąca się mandala, lotosy z lampkami),
   - 5100 m **Sowie Zaświaty** (księżyc, nietoperze, duszki-sówki i świeczki — trochę strasznie, trochę śmiesznie).
4. **Powinno być:** platformy, liście i przeszkody dobrze widać na każdym tle.
5. Po locie, na ekranie wyników — **powinno być:** nazwa strefy, do której doleciała sowa (np. „Olimp”).

## O4 — Sowie Ogrody: nowe rozdziały

Poprawka: po Arboretum jest 8 nowych rozdziałów (Palmiarnia, Dżungla, Ogród japoński, Pustynna oaza, Ogród zimowy,
Wodny ogród, Ogród na dachu, Księżycowy ogród) — każdy z własnym tłem i dwiema nowymi roślinami. Do tego nawozy dla
każdej rośliny, nowe ulepszenia i czwarta gałąź drzewka: „Słońce”.

1. Otwórz **Sowie Ogrody**.
2. **Powinno być:** pod licznikiem liści napis „Rozdział … /14” (wcześniej było „/6”). Jeśli Arboretum było już
   ukończone — „Rozdział 7/14: Palmiarnia”.
3. **Powinno być:** wszystko, co było, zostało — rośliny, ulepszenia, nasiona i drzewko w zakładce **Prestiż**.
4. Zakładka **Rośliny** (jeśli jesteś w Palmiarni). **Powinno być:** na dole listy **Palma** i **Strelicja** z cenami.
5. Zakładka **Ulepszenia**. **Powinno być:** nowe ulepszenia (np. **Szklana kopuła**) i nawozy, np. **Nawóz: Pilea**
   (podwaja zbiory jednej rośliny).
6. Zakładka **Prestiż**. **Powinno być:** czwarta gałąź **Słońce** (Słoneczne korzenie, Poranny start, Wieczne lato).
7. Kup **Palmę**. **Powinno być:** w ogrodzie pojawia się palma w doniczce (z pniem i liśćmi-piórami), a tło to
   szklana kopuła palmiarni.
8. Zakładka **Kolekcja** → **Tło ogrodu**. **Powinno być:** do wyboru także tła wszystkich ukończonych rozdziałów
   (np. Arboretum).

## O2 — Sowie Ogrody: lista roślin do samego końca

Poprawka: lista roślin nie buduje się już od nowa przy każdym zakupie (także gdy kupuje Sowa zakupowa), więc
przewijanie się nie zatrzymuje. Karty roślin są niższe, a przycisk **⤢** daje liście prawie cały ekran.

1. Otwórz **Sowie Ogrody**, trzymaj telefon **pionowo**. Na dole zakładka **Rośliny**.
2. Przewiń listę palcem do samego dołu.
3. **Powinno być:** widać ostatnią roślinę z listy razem z jej przyciskami **Kup**, **×10** i **max**. Na każdym
   przycisku jest cena (na „max” także, ile sztuk kupisz, np. „max ×7”).
4. Jeśli masz ulepszenie **Sowa zakupowa** — poczekaj chwilę na dole listy. **Powinno być:** lista stoi w miejscu,
   nie skacze do góry, a liczby „×…” przy roślinach rosną.
5. Stuknij przycisk **⤢** obok zakładek (prawy górny róg panelu).
6. **Powinno być:** ogród zwija się do niskiego paska, cele rozdziału się chowają, a lista roślin zajmuje prawie cały
   ekran. Przycisk zmienia się na **⤡**.
7. Stuknij **⤡**. **Powinno być:** wszystko wraca jak było.
8. Obróć telefon poziomo. **Powinno być:** przycisku ⤢ nie ma (panel i tak jest na całą wysokość z prawej strony).

## O3 — Sowie Ogrody: wybór tła ogrodu

Poprawka: po ukończeniu rozdziałów można wybrać tło każdego ukończonego rozdziału (wcześniej zostawało na zawsze
tło ostatniego).

1. W Sowich Ogrodach stuknij zakładkę **Kolekcja** i przewiń do **Tło ogrodu**.
2. **Powinno być:** przycisk **Automatyczne** (zaznaczony) i po jednym przycisku na każdy ukończony rozdział (np.
   Parapet, Balkon, Działka…).
3. Stuknij **Parapet**. **Powinno być:** za sową od razu widać okno parapetu, a przycisk „Parapet” jest zaznaczony.
4. Zamknij aplikację i otwórz ją ponownie (albo poczekaj 3 sekundy i odśwież). **Powinno być:** tło dalej jest
   z Parapetu.
5. Stuknij **Automatyczne**. **Powinno być:** wraca tło bieżącego rozdziału.
6. Jeśli robisz **Wielkie Przesadzanie** — **powinno być:** wybrane tło zostaje.

## O1 — Sowie Ogrody: duże liczby

1. Otwórz **Sowie Ogrody**.
2. Spójrz na liczbę liści na górze, ceny na przyciskach **Kup** i na zakładkę **Kolekcja** → **Statystyki**.
3. **Powinno być:** liczby takie jak „100 tys.”, „150 mln”, „200 mld” — z zerami. Wcześniej zamiast „150 mln” było
   „15 mln”, a zamiast „100 tys.” — „1 tys.”.
4. Skróty: „tys.” = tysiąc, „mln” = milion, „mld” = miliard, „bln” = bilion, „bld” = biliard, „tryl.” = trylion,
   „tryld” = tryliard, „kwadryl.” = kwadrylion.

## L1 — Łącz i Hoduj: podpowiedzi

1. Otwórz **Łącz i Hoduj** i pograj chwilę (łącz rośliny, stuknij kartę zamówienia, której jeszcze nie da się oddać,
   stuknij kózkę albo karteczkę Pracu).
2. **Powinno być:** pasek podpowiedzi nad półkami ma dwie linijki i cały tekst się mieści — nie ma „…” w połowie
   zdania (np. „Dryń! Karteczka Pracu na półce — połącz rośliny obok albo stuknij ją 3 razy”).
3. **Powinno być:** półki nie skaczą w górę ani w dół, kiedy podpowiedź się zmienia.
4. Gdyby jakaś podpowiedź jednak kończyła się „…” — stuknij ją. **Powinno być:** cały tekst w dymku.

## U1 — Sowia Ucieczka: humbak rzadziej

1. Otwórz **Sowią Ucieczkę** i zagraj długi bieg (najlepiej 3–5 km), zbierając dużo liści.
2. **Powinno być:** „Rejs na humbaku” zdarza się mniej więcej raz na krainę (co ok. 1000 m), a nie kilkanaście razy
   w biegu.
3. Po rejsie spójrz na pasek z humbakiem pod przyciskiem pauzy. **Powinno być:** przez chwilę jest przygaszony,
   z ikonką 💤 (humbak odpoczywa ok. 600 m) i nie napełnia się; potem znowu napełnia się liśćmi i bąbelkami.

## G1 — Galeria: nowe zdjęcia zamiast podobnych

1. Menu → zakładka **Galeria**.
2. **Powinno być:** zdjęcia nr 1 i nr 2 są różne (nr 2 to teraz złota płomykówka na pniu, a nie przybliżone zdjęcie
   nr 1).
3. **Powinno być:** nowe zdjęcia także pod numerami 12 (dwie płomykówki w budce), 22 (sówka na tle nieba),
   25 (biała sowa śnieżna) i 26 (rudy syczek w dziupli) — jeśli były odblokowane, dalej są odblokowane.
