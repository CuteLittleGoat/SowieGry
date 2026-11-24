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
| SB1   | Sowi Bank (Wypluffki, Analiza 7b): panel admina — hasło, portfel z prezentem, doładowanie, korekta, historia | 2026-11-24 |
| T7–T9 | Sowie Trójki w menu (M5): karta „Las”, zapis postępu (także na drugim telefonie), Akademia, Galeria     | 2026-11-23 |
| M1    | Przeniesienie do nowej bazy (projekt sowiegry-1e1f9): postęp jest, nowe wyniki zapisują się w nowej bazie | 2026-11-23 |
| T1–T6 | Sowie Trójki (podgląd): pierwszy poziom, combo i Sówka, moce, wygrana i przegrana, zapis, ekran — ✅     | 2026-11-23 |
| G3    | Galeria: 15 nowych zdjęć (nr 41–55) — sowy, kozy, humbaki, rośliny ozdobne — i filtr rodzaju           | 2026-11-23 |
| P1    | Płynność: pomiar licznikiem `?perf=1` na Twoim telefonie (Sowie Ogrody, Łącz i Hoduj, Sowie Tory)       | 2026-11-22 |
| P2    | Płynność: ustawienie „Płynność” w menu i w menu pauzy, zapamiętane na tym telefonie                     | 2026-11-22 |
| P3    | Płynność: wygląd bez zmian — rośliny, rekwizyty i efekty dalej się ruszają                              | 2026-11-22 |
| O6    | Sowie Ogrody: krainy fantazji (rozdziały 15–22), każda roślina inna, nowe ulepszenia i drzewko          | 2026-11-15 |
| O5    | Sowie Ogrody: wszystkie rośliny w jednej linii, duże; strzałki po bokach i przesuwanie palcem           | 2026-11-11 |
| Z1    | Porządki (zadanie 9.5): odblokowanie telefonu, postęp i ustawienia jak przedtem; stare adresy usunięte  | 2026-11-02 |
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

## SB1 — Sowi Bank: panel admina Wypluffków (etap W2)

Dla admina (właściciela). Wypluffki to udawana waluta — nikt nic nie płaci. Gracz jeszcze nie widzi sklepu (przyjdzie
z Sowią Dziuplą), więc ten test sprawdza tylko panel.

**Najpierw (raz):** opublikuj reguły Firestore z Analizy 7b, Załącznik B (konsola Firebase → projekt
`sowiegry-1e1f9` → Firestore Database → Reguły → wklej całość → Opublikuj). Gry działają bez przerwy.

1. Otwórz **https://cutelittlegoat.github.io/SowieGry/Admin/** (odśwież dwa razy). **Powinno być:** ekran „Sowi Bank”
   z polem „Hasło admina”.
2. Wpisz `huhu` i stuknij „Wejdź”. **Powinno być:** „To nie to hasło 🐐”.
3. Wpisz `KoziAdmin` i „Wejdź”. **Powinno być:** panel, u góry „połączono”, karta „Portfel gracza jeszcze nie
   istnieje”. (Jeśli po kilku sekundach jest podpowiedź o regułach — reguły nie są jeszcze opublikowane.)
4. Zostaw prezent 500 i notkę „Witamy w Sowim Banku!”, stuknij „Załóż portfel gracza”. **Powinno być:** „Portfel
   założony — prezent 500 Wypluffków.”, saldo 500, „VIP: 🐟 Płotka”.
5. „Doładuj ręcznie”: stuknij „+100”, notka „Test”, „Doładuj” → „Tak, doładuj”. **Powinno być:** saldo 600.
6. Stuknij „+50” i „Odejmij (korekta)” → „Tak, odejmij”. **Powinno być:** saldo 550, w historii 3 wpisy (najnowszy
   „−50 · Korekta”).
7. „Ogłoszenie i promocja”: wpisz „Test ogłoszenia”, „Zapisz ogłoszenie i promocję”. **Powinno być:** „Zapisano
   ogłoszenie i promocję.”
8. Zamknij kartę i otwórz panel jeszcze raz. **Powinno być:** od razu panel (bez hasła) i to samo saldo. „Wyloguj” —
   wraca ekran hasła.

## T7–T9 — Sowie Trójki w menu, zapis postępu, Akademia i Galeria (etap M5)

Poprawka: Sowie Trójki są od 23 listopada 2026 **szóstą grą w menu** i **zapisują postęp w bazie** (otwarte poziomy,
gwiazdki, obejrzane karty „Nowość”). Postęp z podglądu nie był zapisywany, więc zaczynasz od poziomu 1. Instrukcja
dla gracza: `SowieTrojki/docs/README.md`.

### T7 — karta w menu i instrukcja

1. Odśwież SowieGry **dwa razy**. Zakładka **Gry**. **Powinno być:** sześć kart, ostatnia **Sowie Trójki** („6. Las”,
   znaczek „Nowe!”); na obrazku Sówka obok planszy 3 × 3, w której środkowa kolumna liści co chwilę znika i spada
   z góry, a Sówka podskakuje; pod opisem „Jeszcze bez rekordu — zagraj pierwszy raz!”.
2. Stuknij **Jak grać?** na karcie. **Powinno być:** okno „Jak grać — Sowie Trójki” z 7 kartami (Cel gry, Ruch, Moce,
   Pracu Pracu i Amic, Jajka i gniazda, Sówka i Sowia pomoc, Gwiazdki i Humbaczy Finał). W zakładce **Jak grać** ta sama
   instrukcja jest na końcu listy.
3. **Graj**. **Powinno być:** mapa poziomów **bez** napisu „Podgląd gry…”; otwarty tylko poziom 1 (pulsuje), pozostałe
   mają kłódkę. „Menu” w lewym górnym rogu wraca do menu SowieGry.

### T8 — zapis postępu (zamiast T5)

1. Wygraj poziom 1 (i jeśli chcesz — 2). **Powinno być:** okno „Brawo!” albo „Trzy gwiazdki!”; po „Mapa” następny
   poziom jest otwarty, a pod numerem wygranego — gwiazdki.
2. Wróć do menu. **Powinno być:** na karcie Trójek np. „Poziom 2 · ⭐ 5”.
3. Zamknij aplikację i otwórz ją ponownie → **Sowie Trójki**. **Powinno być:** te same gwiazdki i otwarte poziomy.
4. Na drugim urządzeniu (inny telefon albo komputer; hasło `huhu`) otwórz Trójki. **Powinno być:** ten sam postęp.
   Wygraj tam kolejny poziom, potem na pierwszym telefonie odśwież stronę. **Powinno być:** ten poziom też jest
   wygrany — nic się nie cofa (gra łączy zapisy z obu urządzeń: zostaje więcej gwiazdek i dalszy poziom).
5. Zakładka **Sowa** → **Rekordy** przy Sowich Trójkach. **Powinno być:** „Najwyższy poziom”, „Gwiazdki”, „Poziomy
   na 3 gwiazdki”, „Najlepsze combo”, „Wyklute pisklęta”.
6. **Powinno być:** pozostałe gry, Galeria, Akademia i piórka bez zmian.

### T9 — Sowia Akademia i Galeria

1. Zakładka **Sowa** → **Osiągnięcia**. **Powinno być:** licznik „… / 15”; nowe osiągnięcia **Trójkowa sówka**
   (3 gwiazdki na 15 poziomach Sowich Trójek) i **Sowie gniazdo** (10 wyklutych piskląt); „Pierwsze kroki” ma opis
   „Zagraj w każdą z sześciu gier.” (kto je już zdobył, ma je dalej).
2. Gdy wśród **zadań dnia** jest zadanie z Trójek („Wygraj 2 poziomy w Sowich Trójkach”, „Zrób combo ×4 w Sowich
   Trójkach” albo „Sprowadź jajko do gniazda w Sowich Trójkach”) — zrób je. **Powinno być:** u góry ekranu gry
   komunikat z nagrodą (widać go także nad oknem wygranej), a w zakładce **Sowa** zadanie odhaczone.
3. Zakładka **Galeria**. **Powinno być:** licznik „… / 58”; nowe zdjęcia z opisem celu: **Pisklę puszczyka** (Sowy —
   „Wykluj 10 piskląt w Sowich Trójkach”), **Fioletowy storczyk** (Rośliny — „Zbierz 60 gwiazdek w Sowich Trójkach”)
   i **Kozioł z profilu** (Kozy — „Ukończ wszystkie 45 poziomów Sowich Trójek”). Wszystkie wcześniej odblokowane
   zdjęcia dalej są odblokowane.
4. (Opcjonalnie — samouczki wrócą we **wszystkich** grach.) **Sowa** → „Powtórz samouczki we wszystkich grach” →
   **Powtórz**. **Powinno być:** w Trójkach przed poziomem 1 znowu karta „Nowość”.

## M1 — przeniesienie do nowej bazy (projekt sowiegry-1e1f9)

Poprawka: SowieGry mają od 23 listopada 2026 własny projekt Firebase. Cały postęp został skopiowany 1:1 (49 dokumentów:
profil, wszystkie gry, rekordy, historia), stara baza jest nietknięta. Szczegóły: `Analizy/PRZENIESIENIE_FIRESTORE.md`.

1. Na każdym urządzeniu (telefon, komputer) **odśwież SowieGry dwa razy** (albo dwa razy zamknij i otwórz aplikację).
   Jeśli pojawi się ekran „Hasło sowy”, wpisz `huhu`.
2. **Powinno być:** w menu stan zapisu „Zapisano” / „…w chmurze” (bez paska „Tryb offline”), na kartach gier te same
   rekordy co wcześniej, w zakładce **Sowa** ten sam poziom Akademii, piórka, gatunek i strój sowy, w **Galerii** te
   same odblokowane zdjęcia.
3. Otwórz **Sowie Ogrody** i **Łącz i Hoduj**. **Powinno być:** ogród i szklarnia dokładnie jak przed przeniesieniem.
4. Zagraj jeden bieg w **Sowiej Ucieczce** (albo lot w **Sowie w Chmurach**). **Powinno być:** wynik na ekranie
   wyników i w oknie **Rekordy** (zakładka Sowa) — także po zamknięciu i ponownym otwarciu aplikacji.
5. W **Sowich Ogrodach** zbierz trochę liści, zamknij aplikację i otwórz ją ponownie (najlepiej na drugim urządzeniu).
   **Powinno być:** liście są — postęp zapisał się w nowej bazie.
6. Właściciel (opcjonalnie): konsola Firebase → projekt **sowiegry-1e1f9** → Firestore → **Dane**: kolekcja `sowiegry`
   (dokumenty `meta` i `profil`, w `profil` podkolekcja `sowiegry_gry` z grami); po teście z kroku 4 w historii gry
   przybywa wpis. W starym projekcie dane SowieGry są dalej (bez nowych wyników).

Gdyby czegoś brakowało — nic nie ginie: stara baza jest nietknięta, a powrót to jedna zmiana konfiguracji.

## T — Sowie Trójki (podgląd nowej gry)

**Testy T1–T6 zrobione 2026-11-23 — wszystko działa, podgląd zaakceptowany.** Od etapu M5 gra jest w menu i zapisuje
postęp — T5 zastępuje test T8 (wyżej); opis niżej dotyczy podglądu.

Nowa gra „match 3” z Sówką (Analiza 5). To **podgląd**: gry nie ma jeszcze w menu, wszystkie 45 poziomów są otwarte,
a postęp **nie zapisuje się w bazie** — Twoje zapisy z innych gier są bezpieczne. Instrukcja dla gracza:
`SowieTrojki/docs/README.md`. Adres: https://cutelittlegoat.github.io/SowieGry/SowieTrojki/ (w aplikacji na ekranie
głównym: otwórz menu, potem dopisz `SowieTrojki/` do adresu w przeglądarce).

### T1 — pierwszy poziom, Sówka się cieszy

1. Otwórz adres `SowieTrojki/`. **Powinno być:** mapa „Sowie Trójki” z napisem „Podgląd gry…”, trzy rozdziały
   (Sowia Łąka, Ogródek Sówki, Staw Humbaka) po 15 kółek, kółko 1 pulsuje złotą obwódką.
2. Stuknij **1**. **Powinno być:** okno „Poziom 1” — „Zbierz 25 Liści Monstery”, „Ruchy: 8”, trzy puste gwiazdki
   i przycisk **Graj**. Stuknij **Graj**.
3. **Powinno być:** karta „Nowość — Zamiana” z jednym zdaniem i przyciskiem **Rozumiem**. Stuknij go.
4. **Powinno być:** plansza 8 × 8 z kafelkami na tłach różnych kształtów i kolorów, nad nią ruchy, cel i punkty, pod
   nią Sówka na gałęzi macha i mówi w dymku „Zbierzmy 25 Liści Monstery!”. Ręka (białe kółko) pokazuje dobry ruch.
5. Przesuń palcem kafelek na sąsiednie pole tak, jak pokazuje ręka. **Powinno być:** kafelki się zamieniają, trójka
   pęka z drobinkami, z góry spadają nowe, ruchów jest o 1 mniej, punkty rosną, ręka znika, Sówka podskakuje
   (po pierwszym stuknięciu w ekran słychać też „hu!”).
6. Przesuń kafelek tak, żeby **nie** powstała trójka. **Powinno być:** kafelek wraca na miejsce, ruchów nie ubywa,
   czasem Sówka przechyla głowę („Hm?”).
7. Stuknij dwa sąsiednie kafelki po kolei (pierwszy dostaje złotą ramkę). **Powinno być:** zamieniają się tak samo
   jak przy przesunięciu palcem.
8. Poczekaj 5 sekund bez ruchu. **Powinno być:** dwa kafelki dobrego ruchu się kołyszą (podpowiedź).

### T2 — combo i radość Sówki

1. Graj dalej (np. poziom 3 albo 9). Gdy po spadnięciu same ułożą się kolejne trójki, **powinno być:** nad planszą
   napis „Ładnie! ×2”, „Super! ×3”, „Ekstra! ×4”…, a Sówka cieszy się coraz bardziej: podskok → macha skrzydłami →
   podwójny skok z serduszkami → salto z gwiazdkami w oczach → przy bardzo długim combo przelatuje nad planszą.
2. **Powinno być:** dymek Sówki („Ładnie!”, „Super!”, „Ekstra!”…) najwyżej raz na 2 sekundy, nie ten sam dwa razy
   z rzędu; pasek **Radość Sówki** pod Sówką rośnie.
3. Stuknij Sówkę. **Powinno być:** chichocze („Hi-hi!”) i się obraca.

### T3 — moce i Sowia pomoc

1. Poziom 2: ułóż 4 takie same w linii. **Powinno być:** powstaje **Pióro** (biała bańka z piórem i strzałkami).
   Stuknij je. **Powinno być:** przelatuje przez cały rząd (albo kolumnę) i zbija kafelki.
2. Poziom 7: ułóż kwadrat 2 × 2 → **Pisklę** (mała sówka w bańce), które po odpaleniu leci do celu (np. karteczki).
3. Poziom 5: ułóż literę L albo T → **Bąbel**, który pęka z pluskiem i zbija wszystko dookoła.
4. Poziom 10: na starcie dwie karty „Nowość” (Jajka i Tęczowy liść). Ułóż 5 w linii → **Tęczowy liść** (tęczowa
   obwódka); zamień go z kafelkiem — znikają wszystkie takie kafelki.
5. Zamień ze sobą dwie moce, gdy staną obok siebie. **Powinno być:** wielki efekt (krzyż, wielki bąbel, trzy pisklęta
   albo cała plansza przy dwóch Tęczowych liściach) i Sówka w zachwycie.
6. Gdy pasek **Radość Sówki** jest pełny, przycisk **Sowia pomoc** świeci, a Sówka mówi „Mogę pomóc!”. Stuknij go
   (albo Sówkę). **Powinno być:** Sówka leci nad planszę, spadają 3 Pióra, **liczba ruchów się nie zmienia**,
   pasek Radości zaczyna od zera.

### T4 — przegrana, prezent i wygrana

1. Graj tak, żeby skończyły się ruchy, gdy cel jest prawie zrobiony (np. zostały 3–4 liście). **Powinno być:**
   Sówka: „Prawie! Masz ode mnie 3 ruchy!” — i są 3 nowe ruchy (raz na podejście).
2. Gdy ruchy skończą się znowu (albo cel był daleko): okno „Ojej, zabrakło ruchów” z tym, czego brakowało, Sówka
   na chwilę smutna. Stuknij **Spróbuj jeszcze raz**. **Powinno być:** poziom od razu od nowa — bez żyć i czekania.
3. Zrób cel z zapasem ruchów. **Powinno być:** „Humbaczy Finał!” — przez planszę przepływa humbak, a każdy
   pozostały ruch zamienia się w Pióro (punkty rosną), potem okno „Brawo!” albo „Trzy gwiazdki!” z gwiazdkami,
   Sówka tańczy. **Dalej** otwiera kartę następnego poziomu, **Mapa** wraca do mapy (zdobyte gwiazdki są pod kółkiem).
4. Pauza (**II**) → **Ustawienia** → włącz **Tryb Przytulny** → **Gotowe** → **Wznów**. Skończ ruchy bez zrobionego
   celu. **Powinno być:** zamiast przegranej Sówka dokłada 5 ruchów („Dokładam 5 ruchów — graj spokojnie!”).
   Wyłącz potem Tryb Przytulny, jeśli w innych grach go nie używasz (to ustawienie wspólne dla wszystkich gier).

### T5 — zapis w podglądzie (nic się nie zapisuje i nic nie kasuje)

1. Zdobądź gwiazdki na kilku poziomach, zamknij aplikację i otwórz `SowieTrojki/` ponownie. **Powinno być:**
   gwiazdek Sowich Trójek już nie ma (podgląd zapisuje tylko do zamknięcia strony).
2. Otwórz menu SowieGry i inne gry. **Powinno być:** wszystko jak przed testem — rekordy, ogród, szklarnia, Galeria,
   Akademia, piórka (podgląd niczego nie zapisał w bazie i niczego nie skasował).
3. Po Twojej akceptacji podglądu i publikacji reguł ten test zmieni się na „postęp jest po ponownym otwarciu i na
   drugim telefonie” (etap M5).

### T6 — ekran: poziomo, mały telefon, płynność

1. Obróć telefon poziomo. **Powinno być:** Sówka z lewej, plansza na środku, ruchy, cele i punkty z prawej; nic się
   nie nakłada, dymek Sówki jest nad nią.
2. Jeśli masz mały telefon (np. iPhone SE) — w pionie wszystko mieści się bez przewijania, kafelki da się wygodnie
   trafić palcem.
3. Otwórz `SowieTrojki/?perf=1`, zacznij poziom i rób ruchy. **Powinno być:** w rogu licznik klatek — przy ruchach
   blisko 60, w spoczynku plansza stoi (rusza się tylko Sówka). Przyślij zrzut ekranu z licznikiem.

## G3 — Galeria: zdjęcia kóz, humbaków i roślin

Poprawka (uwaga G7): w Galerii jest 55 zdjęć (wcześniej 40). Nowe zdjęcia nr 41–55: 3 sowy gatunków, których jeszcze
nie było, 4 kozy, 4 humbaki i 4 rośliny ozdobne (Monstery i storczyki).

1. Menu → zakładka **Galeria**. **Powinno być:** licznik „… / 55”; wszystkie zdjęcia, które były odblokowane, dalej
   są odblokowane.
2. **Powinno być:** pod filtrami **Wszystkie / Odblokowane / Do zdobycia** drugi rząd: **Wszystkie rodzaje, Sowy,
   Kozy, Humbaki, Rośliny** (na wąskim telefonie każdy rząd przesuniesz palcem w bok).
3. Stuknij **Kozy**. **Powinno być:** 4 zdjęcia kóz — zablokowane z opisem celu, np. „Złap 40 skaczących kózek
   w grach zręcznościowych”, „Wznieś się na 2500 m w Sowie w Chmurach”, „Skorzystaj 15 razy z pomocy kózek w Łącz
   i Hoduj”. Tak samo **Humbaki** (rejsy z humbakiem, 3 ukończone kampanie Sowich Torów) i **Rośliny** (rozdziały
   Sowich Ogrodów, 8 hybryd w Łącz i Hoduj).
4. Jeśli masz już taki wynik (np. złapane 40 kózek), po otwarciu menu **powinno być:** „Nowa fotografia w Galerii
   Sów!”, a zdjęcie ze znaczkiem **Nowe!**. Otwórz je — pod spodem autor i link do Pexels.
5. Z filtrem **Humbaki** otwórz odblokowane zdjęcie i przesuń palcem w bok. **Powinno być:** przechodzisz tylko
   między zdjęciami humbaków.

## P — Płynność (Analiza 6: „jak się za dużo dzieje na ekranie to gra laguje”)

Poprawka: gry rysują mniej (tło i rośliny z gotowych obrazków, w Zatoce Humbaka bez ogrodu pod wodą, w Sowich Torach
regały i szyldy z gotowych obrazków), najwyżej 60 klatek na sekundę także na ekranie 120 Hz, a gdy telefon nie
nadąża — same trochę zmniejszają ostrość obrazu. Nowe ustawienie **Płynność**. Postęp niczego nie traci — zmiany
dotyczą tylko rysowania.

### P1 — pomiar licznikiem `?perf=1`

1. Otwórz w Chrome adres Sowich Ogrodów z dopiskiem `?perf=1`:
   https://cutelittlegoat.github.io/SowieGry/SowieOgrody/?perf=1 (jeśli adres jest już otwarty — odśwież dwa razy).
2. **Powinno być:** w lewym dolnym rogu ciemna ramka z trzema wierszami, np. „58 kl./s · najdł. 25 ms”,
   „ekran 120/s · ostrość 2.00”, „automat 0 (auto) · 45 MB”.
3. Przez ok. 10 s nic nie dotykaj. Zapisz pierwszą liczbę („kl./s”). **Powinno być:** ok. 30 (w spokoju ogród celowo
   rysuje 30 razy na sekundę — rośliny dalej się kołyszą).
4. Stukaj szybko w ogród (kilka razy na sekundę) przez 10 s. Zapisz „kl./s” i „najdł.”. **Powinno być:** blisko 60
   kl./s, „najdł.” zwykle poniżej 50 ms.
5. Przesuwaj półkę palcem tam i z powrotem przez 10 s. **Powinno być:** rośliny jadą płynnie za palcem, bez zacięć.
6. Jeśli masz pełny Plusk-o-metr — wejdź do **Zatoki Humbaka** i łap liście. **Powinno być:** płynnie, bez spowolnień.
7. To samo w **Łącz i Hoduj** (`…/LaczIHoduj/?perf=1`, przeciąganie roślin po pełnej planszy) i w **Sowich Torach**
   (`…/SowieTory/?perf=1`, bieg po Biedronce).
8. Przyślij zrzut ekranu z licznikiem w trakcie stukania / biegu (albo zapisane liczby). Wiersz „automat” mówi, czy
   gra musiała zmniejszyć ostrość: 0 — pełna ostrość, 1 — trochę mniejsza, 2 — najmniejsza, 3 — oszczędzanie baterii.

Wskazówka (MIUI): w trybie oszczędzania baterii telefonu (Ustawienia → Bateria) Chrome może być spowolniony — jeśli
liczby są dużo gorsze, sprawdź, czy ten tryb jest wyłączony, i zmierz jeszcze raz.

### P2 — ustawienie „Płynność”

1. W menu głównym stuknij koło zębate u góry (zakładka **Sowa** → Ustawienia).
2. **Powinno być:** pod przełącznikiem „Efekty” grupa **Płynność** z trzema przyciskami: **Automatyczna** (wybrana),
   **Zawsze ostro**, **Oszczędzanie baterii** i krótkim opisem pod spodem.
3. Stuknij **Oszczędzanie baterii**. **Powinno być:** przycisk wybrany, opis „30 klatek na sekundę i mniej efektów…”.
4. Otwórz Sowie Ogrody z `?perf=1` i stukaj w ogród. **Powinno być:** licznik pokazuje ok. 30 kl./s i
   „automat 3 (saver)”.
5. Otwórz Sowie Tory, zacznij bieg, stuknij pauzę (lewy górny róg) → **Ustawienia**. **Powinno być:** ta sama grupa
   **Płynność** z wybranym „Oszczędzanie baterii”. Stuknij **Automatyczna**, potem **Wznów**. **Powinno być:** bieg
   płynny jak wcześniej.
6. Na innym urządzeniu (np. komputerze) otwórz ustawienia. **Powinno być:** tam wybór jest osobny (np. dalej
   „Automatyczna”) — Płynność zostaje na tym telefonie. Pozostałe ustawienia (muzyka, Tryb Przytulny) są wspólne
   jak dawniej.

### P3 — wygląd bez zmian

1. W Sowich Ogrodach popatrz chwilę na rośliny. **Powinno być:** kołyszą się, a Sowi storczyk mruga jak dawniej;
   podpisy „×N” pod doniczkami są na miejscu.
2. W Łącz i Hoduj: złote, diamentowe i tęczowe rośliny dalej mają migające iskierki, kózki się kołyszą.
3. W Sowich Torach: na Biedronce regały, lodówki i szyldy („PROMOCJA”, „NABIAŁ”…) wyglądają jak dawniej, na festiwalu
   rośliny w stojakach się kołyszą, zraszacze pryskają, na blokowisku gołębie na dachach się ruszają.
4. **Jeśli na którymkolwiek telefonie obraz wydaje się wyraźnie rozmyty** — zapisz model telefonu i wiersz
   „ostrość” z licznika `?perf=1`; w ustawieniu Płynność można wybrać „Zawsze ostro”.

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

## O6 — Sowie Ogrody: krainy fantazji, każda roślina inna, nowe ulepszenia

Zmiany (uwagi z 15 listopada): po Księżycowym ogrodzie jest 8 nowych rozdziałów — krainy fantazji (Ogród czarownicy,
Nawiedzony ogród, Zaczarowany las, Smocza dolina, Kryształowa grota, Łąka wróżek, Podniebny ogród, Drzewo świata),
każdy z własnym tłem, dwiema nowymi roślinami (np. Belladonna, Mandragora, Kwiat paproci) i trzema ulepszeniami.
Każda roślina w ogrodzie wygląda teraz inaczej — także Monstera, Pilea, Paproć, Alokazja, Kaktus, Słonecznik,
Storczyk, Lotos, Bonsai, Mutant monstery i Drzewko złotych liści (wcześniej to była ta sama roślinka w innych
kolorach). W zakładce Prestiż są dwie nowe gałęzie ulepszeń za nasiona: **Magia** i **Przyjaciele**.

1. Otwórz **Sowie Ogrody** (po aktualizacji odśwież stronę dwa razy).
2. **Powinno być:** pod licznikiem liści napis „Rozdział … /22” (wcześniej „/14”). Jeśli Księżycowy ogród był już
   ukończony — „Rozdział 15/22: Ogród czarownicy”. Wszystko, co było (rośliny, ulepszenia, nasiona, drzewko), zostało.
3. Przesuń rośliny w ogrodzie palcem albo strzałkami (jak w teście O5) i obejrzyj wszystkie. **Powinno być:** każda
   roślina ma inny kształt: Monstera — liście-serca z wcięciami, Pilea — okrągłe listki-monetki, Paproć — opadające
   liście z drobnymi listkami, Alokazja — duże strzałkowate liście z jasnymi żyłkami, Kaktus — kolumna z ramionami,
   Słonecznik — żółte kwiaty, Storczyk — różowe kwiaty na łukowatym pędzie, Lotos — kwiat nad wodą, Bonsai —
   poskręcany pień, Mutant monstery — liście pół zielone, pół kremowe (od 4. etapu z okiem, które mruga), Drzewko
   złotych liści — złota korona, z której spadają listki. Także Palma i Daktylowiec, Bambus i Lawenda, Sakura, Klon
   i Ostrokrzew, Grzybienie i Wiktoria nie są już do siebie podobne.
4. Jeśli jesteś w Ogrodzie czarownicy: zakładka **Rośliny**. **Powinno być:** na dole listy **Belladonna**
   i **Mandragora** z cenami (Tojadu jeszcze nie ma).
5. Kup **Belladonnę** i **Mandragorę**. **Powinno być:** tło to fioletowy wieczór z chatką czarownicy, kociołkiem
   i księżycem; Belladonna to krzaczek z ciemnymi liśćmi (od 10 sztuk fioletowe dzwonki, od 25 — czarne jagody),
   a z doniczki Mandragory wygląda korzeń z buzią, który mruga.
6. Zakładka **Ulepszenia**. **Powinno być:** trzy ulepszenia rozdziału (**Kocioł czarownicy**, **Latająca miotła**,
   **Eliksir obfitości** — więcej nasion z Wielkiego Przesadzania) i nawozy nowych roślin.
7. Zakładka **Prestiż**. **Powinno być:** sześć gałęzi — także **Magia** (Zaklęcie wzrostu, Kocioł nasion, Czar
   dojrzewania) i **Przyjaciele** (Złota obroża, Latarnia humbaka, Bystra sowa zakupowa). Drugie i trzecie
   ulepszenie gałęzi ma kłódkę 🔒, dopóki nie kupisz poprzedniego.
8. Kup **Złotą obrożę** (jeśli masz nasiona) i złap złotą kózkę. **Powinno być:** komunikat premii z dłuższym czasem,
   np. „Złota kózka: produkcja ×3 przez 38 s!” (bez obroży było 30 s).
9. Zakładka **Kolekcja** → **Tło ogrodu**. **Powinno być:** do wyboru tła ukończonych rozdziałów; po ukończeniu
   nowego rozdziału — także jego tło.
10. Jeśli ogród jest jeszcze przed krainami fantazji — **powinno być:** gra działa jak dotąd, a krainy fantazji
    otworzą się po Księżycowym ogrodzie.

## O5 — Sowie Ogrody: rośliny w jednej linii, strzałki i przesuwanie palcem

Poprawka (uwaga z 11 listopada: „rośliny były duże i przesuwały się w linii…”): wszystkie kupione rośliny stoją
w ogrodzie w jednej linii i są duże — żadna nie znika z półki i nie robi się mniejsza, gdy przybywa gatunków
(wcześniej było ich najwyżej 12, w dwóch rzędach i coraz mniejsze). Linię przesuwa się palcem albo strzałkami po
bokach ogrodu.

1. Otwórz **Sowie Ogrody**, trzymaj telefon **pionowo**. Najlepiej w ogrodzie z wieloma gatunkami roślin.
2. **Powinno być:** rośliny stoją w jednym rzędzie na dole ogrodu i są większe niż przedtem. Jeśli roślin jest
   więcej, niż mieści się w ogrodzie: widać koniec linii (najnowsze rośliny), a przy lewej krawędzi ogrodu jest
   okrągła **strzałka ‹**. Przy prawej krawędzi strzałki nie ma.
3. Stuknij **strzałkę ‹**. **Powinno być:** rośliny płynnie przesuwają się w prawo i widać wcześniejsze rośliny;
   roślina, która była ucięta przy lewej krawędzi, stoi teraz cała przy prawej. Przy prawej krawędzi pojawia się
   **strzałka ›**.
4. Stukaj **‹**, aż strzałka zniknie. **Powinno być:** na początku linii jest pierwsza roślina (zwykle Monstera),
   a po drodze widać było każdą kupioną roślinę — żadnej nie brakuje. Rośliny nie zmniejszają się (duże zostają
   duże).
5. Połóż palec na ogrodzie i przesuń go w lewo, jak przy przewijaniu zdjęć. **Powinno być:** rośliny jadą za palcem,
   a po szybkim ruchu jadą jeszcze chwilę same i zwalniają. Liczba liści u góry **nie** rośnie od przesuwania (nie
   pojawia się napis „+…”).
6. Stuknij w ogród bez przesuwania palca. **Powinno być:** jak dawniej — napis „+…” w miejscu palca i więcej liści.
7. Stuknij w ogród kilka razy szybko. **Powinno być:** każde stuknięcie się liczy, a ekran się nie powiększa.
8. Kup pierwszą sztukę rośliny, której jeszcze nie ma w ogrodzie (jeśli jakaś jest do kupienia). **Powinno być:**
   półka sama podjeżdża tak, żeby nową roślinę było widać.
9. Jeśli pojawi się **ciężarówka Amic** — **powinno być:** półka sama podjeżdża do zastawionej rośliny, cysternę
   widać i można ją stuknąć (albo przycisk „Przegoń”).
10. Obróć telefon poziomo. **Powinno być:** rośliny dalej w jednej linii, strzałki i przesuwanie palcem działają.
11. Zamknij grę i otwórz ją ponownie. **Powinno być:** znowu widać koniec linii (najnowsze rośliny).

## Z1 — porządki po zadaniu 9.5

Poprawka: gra przestała sprzątać dawne zapisy sprzed chmury w pamięci przeglądarki — od teraz niczego tam nie
usuwa — a stare adresy gier (np. `…/SowaRunner/`) są usunięte. Na grę nie powinno to mieć żadnego wpływu; ten test
tylko to potwierdza.

1. Otwórz SowieGry (odśwież dwa razy, jak zwykle po poprawce).
2. **Powinno być:** menu otwiera się od razu, **bez pytania o hasło** „huhu” (telefon dalej pamięta, że już je
   wpisano).
3. Zakładka **Sowa**. **Powinno być:** ten sam poziom Akademii, piórka, wybrany gatunek sowy i stroje co przedtem.
4. Otwórz dowolną grę i wróć do menu. **Powinno być:** rekordy i postęp bez zmian.
5. Jeśli masz zakładkę albo ikonę ze starym adresem (np. `…/SowaRunner/`, `…/SowieOgrody/nowa.html`) — otwórz ją.
   **Powinno być:** strona „404” (nie znaleziono). Tak ma być: gry otwiera się z menu, a zakładkę albo ikonę wystarczy
   zapisać na nowo.

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
