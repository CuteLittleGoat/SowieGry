# Uwagi właściciela z testów wersji podglądowych

Zbierane od 2026-10-04. **Zasada:** uwagi tylko zapisujemy — kod zmieniamy dopiero, gdy właściciel napisze, że skończył
testy. Wtedy poprawki małymi commitami (każdy z zielonym `npm test`), a przy każdej uwadze stan: ⏳ czeka → ✅ zrobione
(z commitem).

**Druga runda uwag (2026-11-01)** — po wdrożeniu E0–E10: tabela [„Uwagi z testów — 2026-11-01”](#uwagi-z-testów--2026-11-01)
na końcu pliku; diagnoza, plan prac i pytania: [`ANALIZA_4_Uwagi_z_testow_poprawki_i_rozbudowa.md`](ANALIZA_4_Uwagi_z_testow_poprawki_i_rozbudowa.md).

Wersje do sprawdzenia (menu → „Wypróbuj nową wersję: …”):

- Sowie Tory — https://cutelittlegoat.github.io/SowieGry/SowieTory/
- Sowa w Chmurach — https://cutelittlegoat.github.io/SowieGry/SowaWChmurach/
- Sowie Ogrody (nowa odsłona) — https://cutelittlegoat.github.io/SowieGry/SowieOgrody/nowa.html
- Łącz i Hoduj (prototyp nowej Szklarni) — https://cutelittlegoat.github.io/SowieGry/LaczIHoduj/

## Decyzje

| Data | Decyzja |
|---|---|
| 2026-10-04 | **Dane w bazie z okresu testów to dane testowe:** „wszystkie rekordy i zapisy do bazy na czas testów traktujemy jako testy. Jeżeli się skasują to nic się nie stanie. Nie trzeba migracji i backupów.” Skutki dla dalszych prac: przy podmianach (E5f, E6f, E7e, E8) nie trzeba przenosić stanu ani rekordów — nowa gra może zacząć od zera albo nadpisać stary stan; migracja Ogrodów v2 → v3 i pakiet startowy z dawnej Szklarni (8.3) nie są wymagane (można je uprościć lub pominąć); bez kopii zapasowych. **Bez zmian zostają:** kod pisze wyłącznie w kolekcji `sowiegry` (i jej podkolekcjach), reguły Firestore bez zmian, testy tylko na emulatorze / w pamięci, nigdy `localStorage.clear()`. |
| 2026-10-05 | **Zgoda na podmiany:** „Masz zgodę na podmiany.” — E5f (Sowa3 → Sowie Tory), E6f (SowaJumper → Sowa w Chmurach), E7e (dawne Sowie Ogrody → nowa odsłona), E8e (Sowia Szklarnia → Łącz i Hoduj), potem E9 i E10. |
| 2026-10-05 | **Wersja demo (E10):** „Wersja demo ma mieć własne menu. W wersji demo ma być audio, ale bez galerii.” |
| 2026-10-05 | „Testy i ewentualne błędy zgłoszę po zakończeniu wszystkich prac w nowym oknie.” — prace E5f–E10 idą bez czekania na kolejne akceptacje. |
| 2026-10-05 | **Do przejrzenia przy testach (E9d, propozycja nowych wymagań Galerii — Analiza 3, zadanie 9.3):** piórka da się teraz wydać w Sowim Butiku, więc zdjęcia nie wymagają już salda piórek. Zmienione: nr 8 „Zdobądź 3 osiągnięcia Sowiej Akademii” (było: 5. poziom i 30 piórek), nr 10 „Zbierz 300 liści w grach zręcznościowych” (12 piórek), nr 25 „Złap 10 skaczących kózek” (40 piórek), nr 27 „Zrób 20 uników „O włos!” i 3 razy wybierz się na przygodę z humbakiem” (6. poziom i 50 piórek), nr 30 „Zdobądź 8 osiągnięć i osiągnij 8. poziom” (8. poziom, 80 piórek i 5 pomieszczeń); nr 28 — tylko nowe nazwy gier. Pozostałe 24 bez zmian. Już odblokowane zdjęcia zostają. Inne progi — wystarczy napisać. |
| 2026-11-01 | **Odpowiedzi na pytania z Analizy 4** (rozdział 7 analizy): Butik — zakupy tylko na telefonie; po zakupie w menu „przez chwilę był nowy kolor, a potem wracał stary”; Płomykówka się cofa, zostaje Śnieżna; przeprosinowe piórka — „Dej”. Ogrody: przewijanie — (B) ostatnich roślin nie da się zobaczyć; „dużo plansz”; tło — (A) wybór z ukończonych rozdziałów. Łącz i Hoduj: poziomy Diamentowa i Tęczowa, Storczyk, Słonecznik, Truskawka, Lotos i **Baobab**, nowe pomieszczenia, Kram za liście — tak. Sowia Ucieczka: humbak raz na krainę. Sowa w Chmurach: rekord 3400 m, nazwa **„Sowie Zaświaty”** (ma być spooky), Mgławica — tak, tła inspirowane mitologiami świata (nordycka, egipska, grecka, japońska, aztecka, chińska, hinduska), motyw snów i zaświatów. Galeria: 10 nowych zdjęć wybranych z Pexels, podmiana podobnych par — tak. Kolejność: poprawki jedna po drugiej, potem Sowie Ogrody, Sowa w Chmurach, reszta dowolnie; **„Od razu pracuj na stronie o ile nie skasuje to postępu”**; dodatkowe testy — w pliku [`TESTY_NA_TELEFONIE.md`](TESTY_NA_TELEFONIE.md), prostym językiem, krok po kroku. |
| 2026-10-04 | Łącz i Hoduj: **prototypy ekranów zaakceptowane** (zrzuty: przeciąganie na telefonie, 320 × 568, telefon poziomo). Decyzja o samej rozgrywce (merge czy wariant zapasowy) — po teście na telefonie. |

## Ogólne (wszystkie gry)

| # | Uwaga właściciela (dosłownie) | Do zrobienia | Stan |
|---|---|---|---|
| G1 | „Potrzebny będzie przycisk do powtórzenia samouczków.” | Dziś samouczek da się powtórzyć tylko z okna „Jak grać?” danej gry (przycisk „Zagraj samouczek” w Sowiej Ucieczce, Sowich Torach, Sowie w Chmurach i nowych Ogrodach) — za mało widoczne. Dodać widoczny przycisk „Powtórz samouczek” na ekranie startowym każdej gry z samouczkiem (także w Łącz i Hoduj, gdy dostanie samouczek w 8.3) oraz w menu głównym (zakładka „Sowa” → ustawienia) przycisk „Powtórz samouczki we wszystkich grach” (kasuje `tutorialDone` w dokumentach gier — tylko w kolekcji `sowiegry`). | ✅ przycisk „Samouczek” na ekranie startowym Sowiej Ucieczki, Sowich Torów i Sowy w Chmurach (trzy kompaktowe przyciski w rzędzie z „Jak grać?” i „Menu” — mieszczą się na 320 × 568), „Powtórz samouczek” w zakładce Kolekcja nowych Ogrodów, w menu (Sowa → Ustawienia) „Powtórz samouczki we wszystkich grach” (`tutorialDone: false` w dokumentach `runner`, `sowa3`, `jumper`, `ogrody`); Łącz i Hoduj dostanie przycisk razem z samouczkiem (8.3); testy e2e |
| G2 | „(ostatni etap) będę chciał też «wersję demo». Uproszczoną aplikację uruchamianą innym linkiem (inny plik HTML) bez zapisu do Firestore. Może nie być tam wyborów trudności itp. Ma to być wersja pokazowa gier.” | **Ostatni etap — E10 „Wersja demo”** (po E9, wpis w planie, Analiza 3, 8.2): osobna strona (np. `demo.html`) z prostym menu gier; bez hasła i bez Firestore (tylko pamięć — `MemoryBackend`, nic nie trafia do bazy ani do `localStorage` poza tym, co niezbędne); bez wyboru poziomu trudności i innych opcji — od razu gra na ustawieniach domyślnych; samouczek przy każdym wejściu (albo przycisk); wyniki tylko na ekranie. Ustalone 2026-10-05: **własne menu** demo, **z dźwiękiem i muzyką**, **bez galerii**. | ✅ E10: `demo.html` — własne menu z muzyką, bez hasła, Galerii, Akademii i Butiku, gry tylko w pamięci strony (nic w bazie ani localStorage), bez wyboru poziomu trudności, trybu i wyzwania dnia; „Menu” w grze wraca do demo; `?demo=0` wraca do pełnej wersji w tej karcie |

## Sowie Tory (E5)

| # | Uwaga właściciela (dosłownie) | Do zrobienia | Stan |
|---|---|---|---|
| T1 | „Pojawia się kilka cystern Amic. Nie da się ich uniknąć.” | Sprawdzić wzory z cysternami Amic (także po zamianie skórek na planszach i ruchome przeszkody): w praktyce bywa układ bez przejścia — znaleźć przyczynę (np. kilka cystern naraz na wszystkich torach albo za blisko siebie przy danej prędkości) i poprawić generator; test, który wcześniej by to wychwycił. | ✅ przyczyna: cysterna była rysunkiem z boku (ok. 4,6 m — prawie cała droga) powtórzonym 3 razy wzdłuż toru, więc zasłaniała sąsiednie tory i wyglądała jak kilka cystern; teraz widok od tyłu w obrysie toru i jeden zbiornik w perspektywie; wzór `t3-cysterny` — 14 m (było 4 m) po cysternach na zmianę toru; test: po długiej przeszkodzie ≥ 10 m, zanim jedyny wolny tor zostanie zablokowany |
| T2 | „Oznacz jakieś itemy do zebrania, które są wyżej i trzeba skoczyć (może jakaś obręcz, żeby wyróżnić? Zdaję się na Ciebie).” | Liście (i inne przedmioty) wysoko nad drogą — wyraźne oznaczenie, że trzeba po nie skoczyć (np. obręcz / pierścień wokół przedmiotu, cień na drodze pod nim, strzałka w górę). | ✅ liście wyżej niż sięga stojąca sowa (`LEAVES.standReach` = 1,4 m — szczyty łuków nad niskimi przeszkodami) mają pulsującą złotą obręcz, cień na drodze i kropkowaną linię w dół; test spójności progu |
| T3 | „Obecnie działają tylko dwie plansze (sklep i festiwal roślin) plus bonus humbakiem.” — **sprostowanie właściciela:** „chyba jednak działa więcej plansz, ale przez problem z cysternami po prostu nie doszedłem dalej niż dziki.” | Prawdopodobnie skutek T1 (właściciel doszedł do planszy 3 z dzikami). Po naprawie T1 sprawdzić w prawdziwej grze, że kampania przechodzi przez wszystkie 4 plansze (blokowisko PRL i stacja Amic), i dodać test e2e przejścia między planszami, jeśli go brakuje. | ✅ sprawdzone: kampania przechodzi przez wszystkie 4 plansze (test jednostkowy — autopilot przez całą kampanię na 4 ziarnach, e2e — plansza 4 → pętla do planszy 1 w trybie Nieskończonym); blokadą w grze była cysterna z T1 (poprawiona) |
| T4 | „Możesz za to urozmaicić scenografię plansz. Sprawdź w necie np. jak wygląda sklep «Biedronka», żeby nie powtarzały się ciągle dwa te same regały.” | Więcej różnych elementów scenografii na każdej planszy (dziś na planszy sklepu powtarzają się dwa te same regały). Przed pracą: sprawdzić w internecie, jak wygląda wnętrze sklepu Biedronka (np. lodówki z nabiałem, stoiska z owocami i warzywami w skrzynkach, piekarnia, palety z promocjami, kasy, koszyki, wózki, chłodnie, kosze z napojami) i na tej podstawie dorysować kilka rodzajów rekwizytów, losowanych tak, żeby obok siebie się nie powtarzały; to samo dla pozostałych plansz (festiwal roślin, blokowisko PRL, stacja Amic). Zasada z Analizy 2: nazwy własną czcionką, kolory i dekoracje w stylu gry, **bez kopiowania logotypów**. | ✅ sprawdzone w internecie: nowe sklepy (standard 3.0/4.0) mają strefy — owoce i warzywa jak na targu pod daszkami, piekarnię, zamknięte oszklone lodówki, kwiaty, wyróżnione promocje, kasy tradycyjne i samoobsługowe ([przegladpiaseczynski.pl](https://www.przegladpiaseczynski.pl/artykul/9186,biedronka-przestanie-razic-w-oczy), [ding.pl](https://ding.pl/blog/artykuly/biedronka-otwiera-nowe-sklepy-i-modernizuje-istniejace-placowki-handlowe,6651), [wiadomoscihandlowe.pl](https://www.wiadomoscihandlowe.pl/handel-i-dystrybucja/jak-zmieniaja-sie-sklepy-sieci-biedronka-wywiad-z-pawlem-stoleckim-czlonkiem-zarzadu-jeronimo-martins-polska-2511780)); alejka sklepu w 8 strefach co ok. 19 m (stragany z owocami i warzywami, regały, lodówki „NABIAŁ” / „NAPOJE”, piekarnia, promocje na paletach, kwiaty, kasy, koszyki); festiwal — namioty z sadzonkami i balony; blokowisko — kiosk, maluch, piaskownica; stacja Amic — myjnia, butle gazu, stanowisko powietrza; bez logotypów; test: rekwizyty poza drogą, regały < 40% ścian sklepu |

## Sowa w Chmurach (E6)

| # | Uwaga właściciela (dosłownie) | Do zrobienia | Stan |
|---|---|---|---|
| C1 | „W grze o skakaniu na poziomie z humbakiem nie działa sterowanie.” | Niebiański Ocean (20 s odbijania od grzbietów humbaków po wskoczeniu w fontannę humbaka-gejzera): sowa nie reaguje na przeciąganie palcem (i przechylanie). Odtworzyć na telefonie (Chromium i WebKit, dotyk), znaleźć przyczynę (np. ruch w oceanie liczony osobno i pomijający wejście gracza, przechwycenie zdarzeń przez nakładkę) i naprawić; test e2e sterowania w oceanie przez prawdziwe gesty. | ✅ przyczyna: `steer()` (przeciąganie) działało tylko w fazie `run` — w oceanie gra je pomijała (klawiatura i przechylanie działały); poprawka w `SowaWChmurach/game.js`, test jednostkowy i e2e prawdziwym gestem |

## Sowie Ogrody — nowa odsłona (E7)

| # | Uwaga właściciela (dosłownie) | Do zrobienia | Stan |
|---|---|---|---|
| O1 | „W Sowie Ogrody oraz Łącz i Hoduj nie ma audio.” | Nowe Ogrody (`SowieOgrody/nowa.html`) mają od E7d1 muzykę ogrodu i efekty zdarzeń — na telefonie właściciela nic nie słychać. Sprawdzić na telefonie (iPhone/Android): odblokowanie dźwięku po pierwszym dotyku (`bindUnlock` — czy obejmuje stuknięcia w płótno i panel), wczytanie plików (`assets/audio/`), ustawienia dźwięku (zakładka Sowa w menu), uśpienie kontekstu po powrocie z tła; porównać z grami, w których dźwięk działa (Sowie Tory, Sowa w Chmurach). Naprawić i dodać test, który to wychwyci. | ✅ przyczyna w silniku dźwięku: odblokowanie słuchało tylko pierwszego `pointerdown` i potem znikało, a palcem przeglądarki (zwłaszcza Safari na iPhonie) wznawiają dźwięk dopiero w geście zakończonym (`pointerup`, `touchend`, `click`) — w Ogrodach muzyka zamówiona przed dotknięciem nie ruszała; teraz nasłuch na `pointerdown`, `pointerup`, `touchend`, `click`, `keydown` trwa, aż dźwięk naprawdę gra (`shared/engine/audio.js`, wszystkie gry); test na atrapie zachowującej się jak iPhone |

## Łącz i Hoduj (E8)

| # | Uwaga właściciela (dosłownie) | Do zrobienia | Stan |
|---|---|---|---|
| L1 | „W Sowie Ogrody oraz Łącz i Hoduj nie ma audio.” | Prototyp (krok 8.0) nie ma jeszcze żadnego dźwięku — w planie muzyka i dźwięki są w kroku 8.3. Dodać wcześniej: efekty (podniesienie, upuszczenie, połączenie — wyższy ton na wyższym poziomie, Złota Monstera, nasionko z doniczki, kompost, pełne półki) i spokojną muzykę szklarni, przez Sowi Silnik (`shared/engine/audio.js`, `scripts/make-audio.mjs`, budżet < 800 KB), z ustawieniami dźwięku z menu. | ✅ motyw szklarni `szklarnia` (76 BPM, G-dur, łagodna sinusoida — `scripts/make-audio.mjs`) i 6 efektów z istniejącego zestawu: podniesienie, odstawienie, połączenie (wyższy ton na wyższym poziomie, fanfara przy Złotej Monsterze), nasionko z doniczki, kompost, pusta doniczka / pełne półki; głośność z ustawień menu; test budżetu (< 800 KB) i e2e (motyw zamówiony) |

## Uwagi z testów — 2026-11-01

Druga runda uwag (po wdrożeniu E0–E10). Diagnoza, propozycje, plan prac i wdrożeń (etapy P0–P8) oraz pytania do
właściciela: [`ANALIZA_4_Uwagi_z_testow_poprawki_i_rozbudowa.md`](ANALIZA_4_Uwagi_z_testow_poprawki_i_rozbudowa.md).
Kod zmieniamy po odpowiedziach na pytania z rozdziału 6 analizy.

| # | Gra | Uwaga (dosłownie) | Do zrobienia | Stan |
|---|---|---|---|---|
| O2 | Sowie Ogrody | „więcej roślinek” | 8 roślin z własnymi kształtami w nowych rozdziałach (Analiza 4, 3.2) | ⏳ etap P4 |
| O3 | Sowie Ogrody | „Więcej plansz” | rozdziały 7–10 z własnymi tłami (Analiza 4, 3.2) | ⏳ etap P4 |
| O4 | Sowie Ogrody | „Przewijanie w dół nie pokazuje wszystkich roślinek i ich cen” | okno listy ma tylko 1,4–2,9 karty; zwarte karty, „Rozwiń listę”, ceny na ×10 i max, rośliny kolejnych rozdziałów (Analiza 4, 3.2) | ⏳ etap P3 |
| O5 | Sowie Ogrody | „Przy dużych liczbach nie pokazuje się 0 (np. 150mln a jest napisane 15mln)” | błąd w `formatNumber` (obcina zera z końca liczby) (Analiza 4, 3.2) | ✅ ecf6e36 — `formatNumber` bez obcinania zer, nowe przyrostki; test |
| O6 | Sowie Ogrody | „Więcej ulepszeń” | nawozy gatunków, ulepszenia nowych rozdziałów, 4. gałąź drzewka (Analiza 4, 3.2) | ⏳ etap P4 |
| O7 | Sowie Ogrody | „Po zakończeniu jest tylko jedno tło, to ostatnie” | wybór tła w Kolekcji i tło „podróży” w cyklu (Analiza 4, 3.2) | ⏳ etap P3 |
| L2 | Łącz i Hoduj | „Więcej typów roślinek” | 4 nowe łańcuchy i hybrydy (Analiza 4, 3.3) | ⏳ etap P5 |
| L3 | Łącz i Hoduj | „Żeby było więcej poziomów roślinki” | poziomy 6–7 ponad złotym (Analiza 4, 3.3) | ⏳ etap P5 |
| L4 | Łącz i Hoduj | „Podpowiedzi się nie przewijają na ekranie i nie widać całości” | pasek podpowiedzi w jednej linijce ucina tekst; dwa wiersze i krótsze teksty (Analiza 4, 3.3) | ✅ c25dafb — podpowiedź w dwóch wierszach, stuknięcie pokazuje całość; test e2e 320 × 568 |
| L5 | Łącz i Hoduj | „Więcej rozwinięć” | pomieszczenia 11–16 i „Kram ogrodnika” za liście (Analiza 4, 3.3) | ⏳ etap P5 |
| U1 | Sowia Ucieczka | „Poziom z humbakiem jest za często i pojawia się nawet kilkanaście razy na jedną mapę” | Plusk-o-metr: więcej liści, rzadsze bąbelki, przerwa po rejsie (Analiza 4, 3.4) | ✅ 8583f63 — 150 liści, bąbelki co 900–1500 m, 600 m przerwy po rejsie (💤); symulacja w teście |
| C2 | Sowa w Chmurach | „Coś wyżej niż kosmos bo na koniec się już tło nie zmienia (może Immaterium z uniwersum Warhammer 40k?)” | Mgławica i własne „Immaterium”, potem kolejne odcienie (Analiza 4, 3.5) | ⏳ etap P6 |
| G3 | Ogólne | „Działa tylko jeden kolor sowy. Kupiłam kilka i cofało zakupy oraz automatycznie zmienia mi na białą sufke jak mam kupione inne kolory” | błąd zapisu Butiku (zapis po 30 s, wyjście do gry bez czekania, odświeżenie z serwera, tablice zapisywane w całości) (Analiza 4, 3.1) | ✅ c38cbef, 1e9771c — spóźniona odpowiedź serwera nie cofa profilu, zakup i wybór zapisywane od razu, suma z dziennikiem zakupów, 50 piórek przeprosin; testy jednostkowe i e2e |
| G4 | Ogólne | „Nowe zdjęcia sówek w galerii.” | 10 nowych zdjęć z wymaganiami z nowych treści (Analiza 4, 3.6) | ⏳ etap P7 |
| G5 | Ogólne | „W galerii sufek są dwie takie same - z zoomem i bez zooma” | zdjęcia nr 1 i 2 to ta sama fotografia; nowa fotografia pod `owl-02` (Analiza 4, 3.6) | ✅ aad4394 — nowe fotografie pod nr 2, 12, 22, 25, 26 (te same identyfikatory i wymagania) |
