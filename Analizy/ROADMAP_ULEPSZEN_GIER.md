# Roadmap ulepszeń gier SowieGry

## Cel dokumentu

Dokument zbiera pomysły na rozwój pięciu gier oraz proponuje kolejność i sposób ich wdrożenia. Priorytetem jest zwiększenie różnorodności rozgrywki, liczby sensownych decyzji gracza i powodów do powrotu, bez osłabiania prostoty oraz lekkiego, humorystycznego charakteru projektu.

Zakres obejmuje:

- wspólną metaprogresję;
- rozwój SowaRunner;
- rozwój SowaJumper;
- rozwój Sowa3;
- rozwój Sowie Ogrody;
- rozwój Sowia Szklarnia;
- pomiary, balans i testy niezbędne przed wdrożeniem.

## Zasady projektowe

1. **Najpierw decyzje, potem zawartość.** Nowa funkcja powinna zmieniać sposób gry, a nie tylko dodawać kolejne liczby lub wariant wizualny.
2. **Krótka sesja musi mieć cel.** Gracz powinien w ciągu 30–90 sekund zobaczyć, co może osiągnąć podczas bieżącej sesji.
3. **Każda gra zachowuje własną tożsamość.** Metaprogresja łączy gry, ale nie powinna ujednolicać ich mechanik.
4. **Losowość musi być uczciwa.** Generator powinien tworzyć sytuacje trudne, ale możliwe do rozpoznania i przejścia.
5. **Rozwój powinien być mierzalny.** Dla każdego większego systemu należy określić zdarzenia telemetryczne, kryteria akceptacji i testy regresji.
6. **Zapis gracza pozostaje kompatybilny.** Każda zmiana danych wymaga wersji schematu, migracji i kopii zapasowej.

---

# Priorytet 1: wspólna metaprogresja — „Sowia Akademia”

## Problem

Projekt posiada wspólny profil, statystyki, misje oraz kosmetyki, ale obecna warstwa meta nie tworzy jeszcze wyraźnego powodu do regularnego grania we wszystkie pięć tytułów. Gry idle są słabiej reprezentowane w misjach, a kosmetyki stanowią obecnie główny rodzaj nagrody.

## Docelowy zakres

### Poziom konta

- wspólne doświadczenie zdobywane za cele w każdej grze;
- poziomy konta z jasno pokazanym następnym progiem;
- nagrody kosmetyczne, tytuły profilu i elementy wystroju centrum gier;
- dzienny limit doświadczenia tylko wtedy, gdy okaże się potrzebny do balansu.

### Medale mistrzostwa

Każda gra otrzymuje oddzielny zestaw progów, np. brąz, srebro, złoto i platyna.

Przykładowe warunki:

- Runner: dystans, wynik, bieg bez obrażeń;
- Jumper: wysokość, seria precyzyjnych lądowań;
- Sowa3: ukończone etapy, maksymalne combo;
- Ogrody: pierwszy prestiż, tempo produkcji, kontrakty;
- Szklarnia: liczba pokoi, odkryte hybrydy, odparte kozy.

### Misje dzienne i tygodniowe

- trzy krótkie zadania dzienne;
- jedno zadanie tygodniowe obejmujące co najmniej dwie gry;
- możliwość jednego bezpłatnego przelosowania zadania dziennie;
- brak zadań wymagających długiego grindu w jednej sesji;
- zadania generowane z listy szablonów i walidowane względem stanu zapisu.

Przykład zadania między grami:

> Osiągnij 150 m w SowaJumper, przegoń 3 kozy w Sowiej Szklarni i odblokuj Balkon w Sowich Ogrodach.

### Wspólna waluta kosmetyczna

- nazwa robocza: **Piórka**;
- zdobywana z misji, medali i pierwszych osiągnięć;
- przeznaczona wyłącznie na elementy kosmetyczne;
- bez wpływu na balans poszczególnych gier;
- zakupy są odwracalne wyłącznie poprzez zmianę aktywnego wyposażenia, bez zwrotów waluty.

### Album osiągnięć

- osobne kategorie dla każdej gry;
- osiągnięcia wspólne za różnorodność aktywności;
- ukryte osiągnięcia tylko dla zabawnych odkryć, nie dla podstawowej progresji;
- ekran pokazujący warunek, postęp i nagrodę.

## Kroki wdrożenia

1. Rozszerzyć profil o `accountLevel`, `accountXp`, `feathers`, `medals`, `dailyMissions`, `weeklyMission` i `achievements`.
2. Dodać migrację profilu oraz kopię starego zapisu.
3. Zdefiniować centralny katalog osiągnięć i misji w jednym module danych.
4. Dodać zdarzenia domenowe z każdej gry, zamiast obliczać postęp wyłącznie na podstawie końcowego wyniku.
5. Zbudować ekran „Sowia Akademia” dostępny z menu głównego i panelu wspólnego.
6. Dodać generator misji oparty na deterministycznym ziarnie dnia.
7. Dodać testy jednostkowe migracji, naliczania nagród i ochrony przed podwójnym odebraniem.
8. Dodać testy Playwright przejścia zadania obejmującego więcej niż jedną grę.

## Kryteria akceptacji

- gracz może zobaczyć postęp całego konta bez otwierania konkretnej gry;
- każde zadanie ma możliwy do osiągnięcia warunek;
- odebranie nagrody jest idempotentne;
- zmiana daty lub ponowne załadowanie strony nie duplikuje misji ani nagród;
- import starego zapisu zachowuje wszystkie dotychczasowe kosmetyki i statystyki.

---

# Priorytet 2: Sowa3 — większa głębia i ręcznie projektowane sekwencje

## Problem

Sowa3 ma trzy czytelne plansze i prostą mechanikę zmiany toru, ale przeszkody pojawiają się głównie jako pojedyncze losowe obiekty. Po poznaniu typów przeszkód kolejne przebiegi różnią się mniej, niż sugerowałaby zmiana scenerii.

## Proponowane funkcje

### Wzorce przeszkód

Zamiast losować każdy obiekt niezależnie, gra wybiera krótkie, przetestowane sekwencje:

- dwa zablokowane tory i jedna bezpieczna luka;
- naprzemienne przejście lewo–prawo;
- liście prowadzące przez ryzykowną trasę;
- fałszywie bezpieczny środek wymagający późnej zmiany;
- sekwencja treningowa przed trudniejszym wariantem.

Każdy wzorzec powinien określać:

- minimalną i maksymalną prędkość;
- czas reakcji;
- zajęte tory;
- typ nagrody;
- poziom trudności;
- minimalny odstęp od poprzedniego wzorca.

### Mechanika unikalna dla plansz

- **Supermarket:** przesuwające się wózki i bramki kasowe;
- **Wystawa kwiatów:** zwężające się alejki, zraszacze i premiowane tunele z liści;
- **Blokowisko PRL:** pojazdy wyjeżdżające z boków, szlabany i krótkie odcinki ze zmienioną widocznością;
- kolejne plansze mogą wprowadzać nowe zasady zamiast tylko nowych dekoracji.

### Combo i ocena stylu

- combo za kolejne liście i uniki bez obrażenia;
- bonus za zmianę toru w ostatniej chwili;
- mnożnik kończy się po kolizji lub zbyt długim braku akcji;
- ekran końcowy pokazuje maksymalne combo, uniki i dokładność zbierania.

### Tryby gry

- **Kampania:** pełny cykl plansz i finał;
- **Nieskończony:** rosnąca trudność i ranking lokalnych rekordów;
- **Wyzwanie dnia:** stałe ziarno i identyczna trasa dla każdego uruchomienia danego dnia.

## Kroki wdrożenia

1. Wydzielić generator obiektów do osobnego modułu.
2. Zdefiniować format danych wzorca przeszkód.
3. Dodać walidator wykrywający wzorce bez przejezdnego toru.
4. Przygotować po 6–8 wzorców łatwych, średnich i trudnych.
5. Dodać system combo i zdarzenia `nearMiss`, `comboChanged`, `stageFinished`.
6. Dodać unikalną mechanikę pierwszej planszy i zweryfikować odbiór przed tworzeniem pozostałych.
7. Dodać kampanię oraz ekran podsumowania.
8. Rozszerzyć testy o deterministyczne przejście kilku wzorców przy ustalonym ziarnie.

## Kryteria akceptacji

- żaden wzorzec nie blokuje wszystkich torów bez wystarczającego ostrzeżenia;
- poziom trudności nie rośnie skokowo między sąsiednimi wzorcami;
- gracz rozpoznaje odrębność plansz także bez patrzenia na tło;
- combo ma czytelny początek, wzrost i zakończenie;
- wynik wyzwania dnia jest odtwarzalny dla tego samego ziarna.

---

# Priorytet 3: SowaRunner — trasy, wydarzenia i reżyser trudności

## Problem

Runner ma kilka typów przeszkód, trzy poziomy trudności, rosnącą prędkość i minigrę z humbakiem. Główna pętla nadal polega jednak przede wszystkim na reakcji na niezależnie losowane obiekty.

## Proponowane funkcje

### Rozgałęziające się ścieżki

- trasa bezpieczna z mniejszą liczbą punktów;
- trasa ryzykowna z liśćmi, skrótami i trudniejszymi przeszkodami;
- wybór powinien być widoczny odpowiednio wcześnie;
- obie drogi muszą wracać do wspólnego odcinka bez gwałtownego przesunięcia kamery.

### Odcinki tematyczne

Co określony dystans gra przechodzi do nowego zestawu reguł:

- spokojna rozgrzewka;
- odcinek platformowy;
- strefa z częstszymi kozami;
- burza liści;
- pościg;
- finałowy sprint.

### Power-upy

- tarcza na jedno uderzenie;
- magnes na liście;
- krótkie spowolnienie czasu;
- dodatkowy skok lub wydłużony coyote time;
- power-upy nie mogą pojawiać się w miejscach wymagających natychmiastowego ryzyka.

### Reżyser trudności

Reżyser wybiera gotowe sekwencje na podstawie:

- czasu biegu;
- prędkości;
- ostatnich obrażeń;
- liczby udanych uników;
- poziomu trudności;
- czasu od ostatniego bonusu.

Po obrażeniu gracz powinien otrzymać krótki, łagodniejszy fragment, a nie kolejną losową trudną przeszkodę.

### Wyzwanie dnia

- stałe ziarno;
- jedna próba rankingowa lub oddzielny rekord dnia;
- bez wpływu na rekord trybu zwykłego;
- możliwość ponownego treningowego przejścia bez zmiany wyniku oficjalnego.

## Kroki wdrożenia

1. Opisać obecne przeszkody jako dane, a nie wyłącznie osobne gałęzie losowania.
2. Dodać katalog sekwencji oraz test ich przejezdności.
3. Wprowadzić reżysera trudności z jawnym stanem i historią ostatnich wyborów.
4. Dodać pierwszy power-up — tarczę — i zbadać wpływ na długość sesji.
5. Dodać dwa odcinki tematyczne i przejścia między nimi.
6. Dodać trasę ryzykowną jako pierwszy test rozgałęzienia.
7. Dodać wyzwanie dnia i osobny zapis rekordu.
8. Rozszerzyć testy o brak bezpośredniego obrażenia po końcu niewrażliwości.

## Kryteria akceptacji

- po każdym obrażeniu istnieje minimalne okno bezpieczeństwa;
- wygenerowane sekwencje nie wymagają reakcji szybszej niż ustalony limit;
- ryzykowna trasa oferuje wyższą oczekiwaną nagrodę;
- power-upy są widoczne i zrozumiałe bez instrukcji tekstowej;
- tryb dzienny jest deterministyczny.

---

# Priorytet 4: SowaJumper — wybór drogi i precyzja lądowania

## Problem

Jumper stopniowo zwiększa odstępy między platformami i wprowadza platformy specjalne, ale trudność rośnie głównie przez większe odległości oraz częstotliwość losowych zagrożeń.

## Proponowane funkcje

### Strefy wysokości

- dachy miasta;
- chmury;
- nocne niebo;
- zorza lub strefa kosmiczna;
- każda strefa zmienia co najmniej jedną zasadę ruchu.

### Rozgałęzienia platform

- bezpieczna szeroka platforma z małą nagrodą;
- wąska, ruchoma platforma prowadząca do liści lub bonusu;
- widoczne z wyprzedzeniem dwa możliwe kierunki;
- generator zapewnia przynajmniej jedną osiągalną trasę.

### Precyzyjne lądowania

- ocena pozycji lądowania względem środka platformy;
- seria idealnych lub dobrych lądowań;
- bonus punktowy i subtelna informacja wizualna;
- brak kary za zwykłe, poprawne lądowanie.

### Nowe elementy ruchu

- wiatr o czytelnie pokazanym kierunku;
- chmury transportujące;
- platformy obracające się;
- jednorazowe trampoliny;
- checkpointy w trybie spokojnym.

## Kroki wdrożenia

1. Zbudować narzędzie symulujące maksymalny możliwy skok dla aktualnej fizyki.
2. Dodać walidację osiągalności generowanych platform.
3. Wprowadzić ocenę lądowania i combo precyzji.
4. Dodać dwie alternatywne trasy na wybranych wysokościach.
5. Dodać pierwszą strefę z nową zasadą, np. wiatr.
6. Dodać tryb spokojny z checkpointami, bez wpływu na rekord klasyczny.
7. Dodać testy generatora dla różnych rozdzielczości i profili mobilnych.

## Kryteria akceptacji

- generator nie tworzy obowiązkowych skoków poza zakresem fizyki;
- kierunek wiatru jest widoczny przed skokiem;
- ocena lądowania jest stabilna niezależnie od liczby klatek;
- checkpoint nie nadpisuje rekordu trybu klasycznego;
- na ekranie zawsze istnieje czytelny następny cel ruchu.

---

# Priorytet 5: Sowia Szklarnia — rozwinięta genetyka i zarządzanie przestrzenią

## Problem

Szklarnia ma najbardziej oryginalny zestaw systemów: budowę pomieszczeń, cechy roślin, zdrowie, kozy, badania i krzyżowanie. Obecna genetyka sprowadza się jednak do kilku receptur o z góry ustalonym wyniku i losowej szansie powodzenia.

## Proponowane funkcje

### Dziedziczenie cech

Każda roślina może posiadać jawne cechy, np.:

- tempo wzrostu;
- wydajność liści;
- produkcja pyłku;
- zapotrzebowanie na wodę;
- zapach przyciągający kozy;
- odporność na podgryzanie;
- kolor i wariant wizualny.

Potomstwo dziedziczy część cech rodziców, z małą szansą mutacji.

### Jakość i rzadkość

- pospolita;
- dorodna;
- rzadka;
- legendarna;

Rzadkość powinna wynikać z sumy cech, a nie być niezależnym, pustym mnożnikiem.

### Album odmian

- zapis odkrytych kombinacji;
- podgląd najlepszych wyhodowanych okazów;
- cele badawcze wymagające konkretnej cechy;
- nagrody za pierwsze odkrycie, nie za powtarzalny grind.

### Sąsiedztwo pomieszczeń

- laboratorium obok krzyżówkarium zwiększa jakość eksperymentów;
- zraszalnia wspiera sąsiednie sale upraw;
- kompostownia zmniejsza spadek zdrowia;
- płotek chroni określony obszar, a nie całą szklarnię globalnie.

### Więcej zachowań kóz

- koza łakoma — wybiera najwydajniejszą roślinę;
- koza sprytna — ignoruje część zabezpieczeń;
- koźlę — małe straty, szybki ruch;
- koza kolekcjonerka — zabiera nasiona zamiast liści;
- każda odmiana wymaga innej reakcji lub przygotowania.

## Kroki wdrożenia

1. Zaprojektować schemat `genome` i migrację istniejących roślin.
2. Oddzielić gatunek rośliny od indywidualnego egzemplarza i jego cech.
3. Zaimplementować deterministyczne dziedziczenie oparte na ziarnie eksperymentu.
4. Dodać jeden nowy eksperyment z wieloma możliwymi wynikami.
5. Zbudować album odmian i zapis rekordowych cech.
6. Dodać premie sąsiedztwa dla dwóch pomieszczeń.
7. Dodać jeden nowy typ kozy i sprawdzić wpływ na balans.
8. Rozszerzyć system badań o zadania hodowlane.
9. Dodać testy migracji, dziedziczenia i odtwarzalności eksperymentu.

## Kryteria akceptacji

- stare rośliny po migracji otrzymują bezpieczne, poprawne genomy;
- wynik rozpoczętego eksperymentu nie zmienia się po ponownym wczytaniu;
- gracz potrafi wskazać, które cechy zostały odziedziczone;
- rzadkość wynika z faktycznej jakości rośliny;
- sąsiedztwo pomieszczeń jest czytelne na planszy i w panelu statystyk.

---

# Priorytet 6: Sowie Ogrody — kontrakty, specjalizacje i decyzje w automatyzacji

## Problem

Ogrody mają rozbudowaną ekonomię, strefy, ulepszenia, automatyzację i prestiż. Po odblokowaniu najważniejszych automatów ryzykiem jest jednak ograniczenie decyzji gracza do oczekiwania na kolejne progi liczbowej produkcji.

## Proponowane funkcje

### Kontrakty

Krótkie zadania ekonomiczne, np.:

- wyprodukuj określoną liczbę liści konkretnym gatunkiem;
- osiągnij wymagany poziom wody;
- kup określoną liczbę roślin bez użycia auto-buy;
- ukończ cel w ograniczonym czasie;
- zrezygnuj z części bieżącej produkcji w zamian za unikalną nagrodę.

Kontrakty powinny tworzyć cele na 3–15 minut, a nie wymagać wielogodzinnego oczekiwania.

### Specjalizacje ogrodu

Po osiągnięciu określonego progu gracz wybiera jedną z czasowych lub trwałych specjalizacji:

- kliknięcia i aktywna gra;
- woda i wydarzenia humbaka;
- automatyzacja;
- produkcja offline;
- rzadkie rośliny i kontrakty.

Zmiana specjalizacji może być możliwa po prestiżu lub za niewielki koszt.

### Synergie roślin

- premie za posiadanie zestawów gatunków;
- malejąca efektywność nadmiernego skupienia na jednym gatunku;
- progi 10, 25, 50 i 100 sztuk z jawną informacją o kolejnej premii;
- synergie muszą być porównywalne w panelu, aby nie wymagały ręcznego liczenia.

### Lepsze narzędzia ekonomiczne

- czas do zakupu następnej rośliny lub ulepszenia;
- koszt i przyrost produkcji na sekundę;
- zakup `x1`, `x10`, `x25`, `max` i „do następnego progu”;
- priorytety auto-buy;
- podsumowanie, co przyniósł offline progress.

## Kroki wdrożenia

1. Dodać panel opłacalności bez zmiany ekonomii.
2. Dodać zakup do następnego progu i testy poprawności kosztu seryjnego.
3. Zdefiniować katalog kontraktów oraz walidator dostępności celu.
4. Dodać trzy kontrakty startowe i jeden kontrakt czasowy.
5. Dodać jedną decyzję specjalizacyjną po pierwszym prestiżu.
6. Dodać priorytety auto-buy.
7. Przeprowadzić symulację pierwszych 10 minut, godziny i pierwszego prestiżu.
8. Dostosować ceny i produkcję na podstawie symulacji, nie pojedynczych ręcznych prób.

## Kryteria akceptacji

- kontrakt zawsze jest możliwy do wykonania na aktualnym etapie;
- panel poprawnie pokazuje koszt seryjnego zakupu;
- auto-buy respektuje priorytety i nie blokuje kluczowych zasobów;
- specjalizacje mają różne, ale porównywalne strategie;
- pierwszy prestiż nie wymaga nieuzasadnionego okresu bez decyzji gracza.

---

# Ulepszenia wspólne dla wszystkich gier

## Lepszy ekran końcowy

Każda gra arcade powinna po zakończeniu pokazywać:

- wynik i rekord;
- główną przyczynę porażki;
- maksymalne combo lub najważniejszy parametr sesji;
- postęp misji;
- zdobyte doświadczenie i Piórka;
- jeden sugerowany następny cel;
- szybki restart i powrót do Akademii.

## Samouczek kontekstowy

- krótkie wskazówki pojawiają się przy pierwszym zetknięciu z mechaniką;
- wskazówki nie przerywają gry, chyba że to konieczne;
- każda może zostać wyłączona;
- stan samouczka jest zapisany w profilu;
- po dużej zmianie mechaniki można wersjonować tutorial osobno.

## Dostępność

- możliwość zmniejszenia efektów i drgań kamery;
- możliwość zwiększenia kontrastu obiektów interaktywnych;
- alternatywne sterowanie klawiaturą i dotykiem;
- brak informacji przekazywanej wyłącznie kolorem;
- teksty statusowe dostępne dla czytników ekranu tam, gdzie gra korzysta z warstwy DOM;
- regulacja głośności muzyki i efektów niezależnie.

## Telemetria lokalna i diagnostyka

Projekt może rozpocząć od lokalnych, anonimowych statystyk diagnostycznych bez wysyłania danych na serwer:

- liczba uruchomień;
- średnia długość sesji;
- miejsce lub wysokość porażki;
- najczęściej wybierane ulepszenia;
- czas do pierwszego prestiżu;
- liczba porzuconych kontraktów;
- skuteczność poszczególnych wzorców przeszkód.

Dane powinny być możliwe do wyeksportowania razem z zapisem i łatwe do wyczyszczenia.

## Narzędzia deweloperskie

- panel debug dostępny przez parametr adresu;
- podgląd aktualnego ziarna, prędkości, poziomu trudności i ostatnich zdarzeń;
- możliwość wymuszenia planszy, kontraktu, kozy lub wydarzenia;
- symulacja upływu czasu dla gier idle;
- eksport stanu generatora przy wykryciu niemożliwej sytuacji.

---

# Plan realizacji

## Etap 0 — przygotowanie pomiarów i kontraktów technicznych

Zakres:

- zdefiniowanie zdarzeń domenowych;
- wspólny format osiągnięć, misji i nagród;
- panel debug;
- podstawowe statystyki długości sesji i miejsca porażki;
- zestaw testów deterministycznych generatorów.

Rezultat:

- można mierzyć wpływ kolejnych zmian;
- każda gra raportuje postęp w spójny sposób;
- błędy generatorów są odtwarzalne.

## Etap 1 — Sowia Akademia MVP

Zakres:

- poziom konta;
- Piórka;
- medale;
- 8–12 osiągnięć;
- 6–8 szablonów misji dziennych;
- ekran Akademii;
- migracja profilu.

Rezultat:

- wspólny cel dla całego projektu;
- gry idle i arcade uczestniczą w tej samej progresji.

## Etap 2 — Sowa3 jako pilotaż głębszej rozgrywki

Zakres:

- wzorce przeszkód;
- combo;
- unikalna mechanika supermarketu;
- kampania i wyzwanie dnia;
- nowy ekran końcowy.

Rezultat:

- sprawdzenie wspólnych systemów misji, combo i codziennego ziarna na najmniejszej grze arcade.

## Etap 3 — generatory Runnera i Jumpera

Zakres:

- reżyser trudności Runnera;
- walidator osiągalności Jumpera;
- odcinki i strefy;
- dzienne wyzwania;
- pierwsze rozgałęzienia tras.

Rezultat:

- większa różnorodność bez losowych, niesprawiedliwych skoków trudności.

## Etap 4 — Szklarnia

Zakres:

- genomy;
- dziedziczenie;
- album odmian;
- pierwsze premie sąsiedztwa;
- nowy typ kozy;
- zadania hodowlane.

Rezultat:

- Szklarnia staje się głębszą grą o eksperymentowaniu i zarządzaniu ryzykiem.

## Etap 5 — Ogrody

Zakres:

- narzędzia opłacalności;
- kontrakty;
- specjalizacje;
- priorytety automatyzacji;
- symulacyjne strojenie ekonomii.

Rezultat:

- więcej decyzji w środkowej i późnej fazie gry.

---

# Testy wymagane dla nowych systemów

## Testy jednostkowe

- migracje profilu i zapisów;
- naliczanie nagród dokładnie raz;
- generowanie misji dla danego dnia;
- walidacja wzorców przeszkód;
- osiągalność platform Jumpera;
- koszt seryjnych zakupów Ogrodów;
- dziedziczenie cech Szklarni;
- deterministyczne wyniki dla ustalonego ziarna.

## Testy integracyjne

- postęp misji po zdarzeniu z każdej gry;
- przejście zadania obejmującego dwie lub więcej gier;
- zapis i wczytanie rozpoczętego eksperymentu;
- zmiana daty oraz odświeżenie misji;
- import starego profilu do nowego schematu;
- działanie offline progress po dodaniu nowych systemów.

## Testy przeglądarkowe

- desktop Chromium;
- profil mobilny;
- sterowanie klawiaturą i dotykiem;
- reduced motion;
- restart sesji;
- ekran końcowy;
- Akademia i odbiór nagrody;
- brak błędów konsoli i nieudanych żądań.

## Testy symulacyjne

- 10 000 wygenerowanych sekwencji Runnera;
- 10 000 fragmentów platform Jumpera;
- ekonomia Ogrodów dla pierwszych 10 minut, 60 minut i pierwszego prestiżu;
- ekonomia Szklarni do odkrycia każdej podstawowej rośliny;
- rozkład czasu ukończenia misji dziennych.

---

# Mierniki sukcesu

Bez zewnętrznej analityki można początkowo wykorzystywać lokalne dane testowe i sesje kontrolne.

Proponowane mierniki:

- mediana długości sesji w każdej grze;
- odsetek graczy uruchamiających co najmniej dwie różne gry;
- czas do pierwszej zdobytej nagrody meta;
- odsetek ukończonych misji dziennych;
- liczba restartów po porażce;
- miejsce porażki i rozkład obrażeń;
- czas do pierwszego prestiżu w Ogrodach;
- czas do pierwszej hybrydy w Szklarni;
- udział poszczególnych specjalizacji i ulepszeń;
- liczba sytuacji generatora odrzuconych przez walidator.

Nie należy optymalizować wyłącznie długości sesji. Równie ważne są czytelność celu, brak frustracji i chęć zagrania ponownie.

---

# Ryzyka

## Nadmierna komplikacja

Wspólna metaprogresja i nowe systemy mogą przytłoczyć prosty charakter projektu.

Ograniczenie ryzyka:

- ujawnianie funkcji stopniowo;
- jeden główny cel widoczny na ekranie;
- brak obowiązkowych ekranów po każdej krótkiej akcji;
- testy z nowym graczem bez wcześniejszego objaśnienia.

## Inflacja nagród

Zbyt wiele walut i nagród obniży ich znaczenie.

Ograniczenie ryzyka:

- tylko jedna wspólna waluta kosmetyczna;
- brak osobnych walut sezonowych na początku;
- nagrody mechaniczne pozostają w obrębie konkretnej gry.

## Niesprawiedliwa losowość

Nowe wzorce i genetyka mogą tworzyć sytuacje postrzegane jako arbitralne.

Ograniczenie ryzyka:

- deterministyczne ziarna;
- walidatory;
- podgląd prawdopodobieństw;
- mechanizmy łagodzące długie serie niepowodzeń.

## Zbyt szybki wzrost zakresu

Każdy pomysł można rozbudowywać bez końca.

Ograniczenie ryzyka:

- wdrażanie pionowych wycinków;
- jeden nowy system testowany w jednej grze przed przeniesieniem wzorca;
- osobny PR dla każdej funkcji lub spójnego etapu;
- kryteria zakończenia zapisane przed implementacją.

---

# Rekomendowana kolejność najbliższych prac

1. Zdarzenia domenowe i pomiary niezbędne do oceny zmian.
2. Sowia Akademia w wersji MVP.
3. Wzorce przeszkód, combo i kampania w Sowa3.
4. Reżyser trudności Runnera oraz walidator osiągalności Jumpera.
5. Genetyka i album odmian w Sowiej Szklarni.
6. Kontrakty, specjalizacje i narzędzia ekonomiczne w Sowich Ogrodach.
7. Rozszerzenie każdego systemu dopiero po testach pierwszej wersji.

Największym pojedynczym ulepszeniem dla całego projektu jest **Sowia Akademia**, ponieważ tworzy wspólny cel i zachęca do korzystania ze wszystkich pięciu gier. Największym ulepszeniem pojedynczej gry będzie prawdopodobnie przebudowa Sowa3 wokół ręcznie projektowanych sekwencji i mechanik charakterystycznych dla plansz.