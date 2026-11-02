# Analiza 4 — uwagi z testów (listopad 2026): poprawki i rozbudowa gier

> Data: 2026-11-01 · Podstawa: uwagi z testów przekazane 2026-11-01 (plik `uwagi.txt`, przepisany dosłownie
> w [rozdziale 1](#1-uwagi-dosłownie-i-numery)) i kod na `main` (commit `18b09d7`) · Status: **zrobione — etapy
> P1–P8 wdrożone 2026-11-01 i 2026-11-02** (etapy i commity: [`STAN_PRAC.md`, rozdział 0](STAN_PRAC.md); zadanie
> 9.5 zamknięte 2026-11-02 — sprzątanie pamięci (1711584) i stare adresy gier (4bb58ca) usunięte; tamże, punkt 3.1) — odpowiedzi właściciela i poprawiony plan: [rozdział 7](#7-odpowiedzi-właściciela-i-zmiany-planu-2026-11-01);
> stan poszczególnych uwag: tabela „Uwagi z testów — 2026-11-01” w [`UWAGI_WLASCICIELA.md`](UWAGI_WLASCICIELA.md);
> testy na telefonie krok po kroku: [`TESTY_NA_TELEFONIE.md`](TESTY_NA_TELEFONIE.md). · Zasady pracy bez zmian:
> [`ANALIZA_3_Plan_prac.md`, rozdz. 8.1](ANALIZA_3_Plan_prac.md).

Pomiary w tej analizie robiłem w przeglądarce Chromium na profilach telefonów (gry w trybie pamięci, `?cloud=memory`)
i na samej logice gier w Node — **nic nie trafiło do produkcyjnej bazy** ([Załącznik A](#załącznik-a-jak-mierzyłem)).

---

## 0. W skrócie (dla właściciela)

- **Najważniejsze:** uwaga o kolorach sowy to prawdziwy błąd zapisu, przez który mogą znikać zakupy w Sowim Butiku.
  Naprawiamy go jako pierwszy, zanim dojdą nowe rzeczy do kupienia.
- **Cztery szybkie poprawki:** liczby w Sowich Ogrodach („15 mln” zamiast „150 mln”), ucięte podpowiedzi w Łącz
  i Hoduj, za częsty humbak w Sowiej Ucieczce i podwójne zdjęcie w Galerii — każda to mała zmiana.
- **Rozbudowa:** nowe rośliny, plansze, ulepszenia, poziomy, pomieszczenia, strefa ponad kosmosem i nowe zdjęcia —
  większe prace, każda w kilku krokach, z obrazkami do akceptacji przed wdrożeniem.
- **Nic z postępu nie zginie:** nowe rzeczy tylko dopisujemy, niczego nie usuwamy i nie zmieniamy nazw w zapisach;
  jedyna zmiana sposobu zapisu (Butik) łączy stary i nowy zapis, zamiast je podmieniać
  ([rozdział 2](#2-zasada-nic-nie-ginie--jak-zmieniamy-grę-na-produkcji)).

| # | Uwaga | Co ustaliłem | Rodzaj | Pilność |
|---|---|---|---|---|
| G3 | Kolor sowy, cofanie zakupów | zakup i wybór gatunku czekają na zapis aż 30 s; wejście do gry w tym czasie może go zgubić, a odświeżenie profilu z serwera może go chwilowo „cofnąć” | błąd — utrata postępu | 🔴 najpierw |
| O5 | „150 mln” jako „15 mln” | funkcja liczb w Ogrodach obcina zera z końca liczby (100 tys. → „1 tys.”) | błąd | 🟠 szybka poprawka |
| L4 | Podpowiedzi nie widać w całości | pasek podpowiedzi ma jedną linijkę i ucina tekst „…” — na małym telefonie 10 z 25 podpowiedzi | błąd wyglądu | 🟠 szybka poprawka |
| U1 | Humbak za często | Plusk-o-metr napełnia się po 60 liściach: dobry gracz ma średnio 13 rejsów na bieg 5 km | balans | 🟠 szybka (po decyzji) |
| G5 | Dwa takie same zdjęcia | zdjęcia nr 1 i nr 2 to ta sama fotografia — nr 2 przybliżone i w innych kolorach | błąd treści | 🟠 szybka |
| O4 | Przewijanie roślin i cen | lista się przewija, ale na telefonie widać naraz tylko 1–2 rośliny; roślin z dalszych rozdziałów nie widać wcale | wygoda | 🟡 |
| O7 | Po zakończeniu jedno tło | po ukończeniu rozdziałów tło na zawsze zostaje „Arboretum” (także po Wielkim Przesadzaniu) | rozbudowa | 🟡 |
| O2, O3, O6 | Więcej roślin, plansz, ulepszeń (Ogrody) | 11 roślin (rysowanych tak samo), 6 rozdziałów, 16 ulepszeń, drzewko 3 × 3 | rozbudowa | 🟢 |
| L2, L3, L5 | Więcej roślin, poziomów, rozwinięć (Łącz i Hoduj) | 4 rośliny × 5 poziomów, 10 pomieszczeń; liści nie da się na nic wydać | rozbudowa | 🟢 |
| C2 | Coś ponad kosmosem | ostatnia strefa (Kosmos) od 1500 m, dalej tło się nie zmienia | rozbudowa | 🟢 |
| G4 | Nowe zdjęcia | 30 zdjęć | rozbudowa | 🟢 (na końcu) |

**Proponowana kolejność** ([rozdział 4](#4-plan-prac-i-wdrożeń)): P0 testy pokazujące błędy → **P1 Sowi Butik** →
P2 szybkie poprawki → P3 wygodna lista i tła Ogrodów → P4–P6 nowe treści (Ogrody, Łącz i Hoduj, Sowa w Chmurach) →
P7 nowe zdjęcia → P8 zamknięcie.

---

## 1. Uwagi (dosłownie) i numery

Numeracja ciągnie się od [`UWAGI_WLASCICIELA.md`](UWAGI_WLASCICIELA.md) (tam są już G1–G2, T1–T4, C1, O1, L1).

| # | Gra | Uwaga (dosłownie) |
|---|---|---|
| O2 | Sowie Ogrody | „więcej roślinek” |
| O3 | Sowie Ogrody | „Więcej plansz” |
| O4 | Sowie Ogrody | „Przewijanie w dół nie pokazuje wszystkich roślinek i ich cen” |
| O5 | Sowie Ogrody | „Przy dużych liczbach nie pokazuje się 0 (np. 150mln a jest napisane 15mln)” |
| O6 | Sowie Ogrody | „Więcej ulepszeń” |
| O7 | Sowie Ogrody | „Po zakończeniu jest tylko jedno tło, to ostatnie” |
| L2 | Łącz i Hoduj | „Więcej typów roślinek” |
| L3 | Łącz i Hoduj | „Żeby było więcej poziomów roślinki” |
| L4 | Łącz i Hoduj | „Podpowiedzi się nie przewijają na ekranie i nie widać całości” |
| L5 | Łącz i Hoduj | „Więcej rozwinięć” |
| U1 | Sowia Ucieczka | „Poziom z humbakiem jest za często i pojawia się nawet kilkanaście razy na jedną mapę” |
| C2 | Sowa w Chmurach | „Coś wyżej niż kosmos bo na koniec się już tło nie zmienia (może Immaterium z uniwersum Warhammer 40k?)” |
| G3 | Ogólne | „Działa tylko jeden kolor sowy. Kupiłam kilka i cofało zakupy oraz automatycznie zmienia mi na białą sufke jak mam kupione inne kolory” |
| G4 | Ogólne | „Nowe zdjęcia sówek w galerii.” |
| G5 | Ogólne | „W galerii sufek są dwie takie same - z zoomem i bez zooma” |

---

## 2. Zasada „nic nie ginie” — jak zmieniamy grę na produkcji

Gry działają na prawdziwych zapisach (baza Firestore, kolekcja `sowiegry`). Każda zmiana z tego planu musi spełniać:

1. **Identyfikatory zostają na zawsze.** Rozdziały, rośliny, ulepszenia, łańcuchy roślin, poziomy, pomieszczenia,
   strefy, gatunki sów i zdjęcia — nowe tylko dopisujemy **na końcu** list; żadnego nie usuwamy, nie przenumerowujemy
   i nie zmieniamy mu identyfikatora (nazwę widoczną dla gracza można poprawić). Przykład: postęp odnowy w Łącz
   i Hoduj to liczba wykonanych etapów liczona po kolei (`renovation()`, `LaczIHoduj/game.js`), więc pomieszczenie
   wstawione w środek listy przesunęłoby postęp — dlatego nowe tylko na końcu.
2. **Wersje zapisów bez zmian, nowe pola z wartościami domyślnymi:** Sowie Ogrody `saveVersion` 3, Łącz i Hoduj 2,
   Galeria 2, Akademia 3. Wczytywanie w obu grach idle już dziś zachowuje nieznane pola (`loadState` rozkłada zapis
   `...raw`).
3. **Zbiory „tylko przybywa”** (kupione gatunki, stroje, odblokowane zdjęcia) nie mogą się zmniejszyć przez zapis
   z innej strony, starszej wersji aplikacji albo drugiego urządzenia. Zmiana postaci zapisu (Butik, P1) — przez
   **sumę** starej i nowej postaci; przez okres przejściowy (co najmniej 2 miesiące) zapisujemy obie.
4. **Wycofanie zmiany nie może kasować postępu.** Dziś Łącz i Hoduj przy wczytaniu **usuwa** z planszy rośliny
   nieznanego łańcucha albo poziomu (`createBoard`, `LaczIHoduj/board.js:39`). Zanim dodamy nowe poziomy i rośliny,
   najpierw wchodzi „bezpiecznik”: nieznane przedmioty są przechowywane, a nie usuwane (P5.0). Ogrody już dziś
   pomijają nieznane rośliny, ale ich nie kasują.
5. **Testy tylko na emulatorze i w pamięci**, nic ręcznie w produkcyjnej bazie. Naprawa zapisów (np. odtworzenie
   zakupów, P1.5) — kodem gry, który zadziała, gdy właściciel otworzy stronę.
6. **Service worker:** nowa wersja (`VERSION` w `sw.js`) przy każdej zmianie listy plików. Zdjęcia, czcionki
   i dźwięki są brane **najpierw z pamięci telefonu** (`sw.js:172`), więc podmienione zdjęcie musi mieć **nową nazwę
   pliku** — inaczej telefony dalej pokazywałyby stare.
7. Zasady z [Analizy 3, rozdz. 8.1](ANALIZA_3_Plan_prac.md) bez zmian: pełny `npm test` przed każdym wypchnięciem,
   dokumentacja gry (`docs/Documentation.md`, `docs/README.md`) przy każdej zmianie kodu (`AGENTS.md`), komunikaty
   commitów po polsku, małe kroki na `main`, sprawdzenie CI (Chromium + WebKit).

---

## 3. Diagnoza i propozycje

### 3.1. G3 — Sowi Butik: „działa tylko jeden kolor sowy”, cofanie zakupów (błąd — najpierw)

**Jak działa dziś.** Zakup w Butiku (`buy`, `shared/meta/shop.js`) odejmuje piórka w Akademii i dopisuje gatunek
w profilu (`profil.shop`); nowy gatunek od razu staje się wybrany. „Wybierz” (`selectSpecies`) zmienia wybrany
gatunek. Profil ma w pamięci strony swoją kopię i co jakiś czas wysyła do bazy **różnicę** względem ostatniego zapisu.

**Co znalazłem w kodzie:**

1. **Zapis z opóźnieniem 30 s.** Zakup (`shared/meta/shop.js:127`) i „Wybierz” (`:149`) wołają
   `cloud.updateProfile(…)` bez `delayMs`, czyli z domyślnym opóźnieniem **30 s** (`DELAYS.profile`,
   `shared/sowie-cloud.js:28`). Dla porównania wybór stroju w Garderobie zapisuje się po 1 s
   (`shared/menu/owl-tab.js:548`). Odjęcie piórek (Akademia) jedzie w tym samym, opóźnionym zapisie.
2. **Wyjście do gry nie czeka na zapis.** „Graj” to zwykły link (`shared/menu/games.js:261`). Jeśli gracz wejdzie do
   gry przed upływem 30 s, zapis rusza dopiero przy zamykaniu strony (`pagehide` → `cloud.flush()`,
   `shared/sowie-cloud.js:1215`). Ten zapis jest asynchroniczny: przeglądarka — zwłaszcza gdy następna strona
   otwiera się natychmiast z pamięci aplikacji — może zamknąć menu, zanim pamięć bazy w telefonie (IndexedDB) przyjmie
   zapis. Wtedy **zakup i odjęcie piórek znikają razem**: piórka „wracają”, gatunek znów jest do kupienia.
3. **Odświeżenie z serwera może „cofnąć” ekran.** Strona wczytana z pamięci telefonu pyta potem serwer o świeży
   profil i podmienia swój, gdy nie ma niezapisanych zmian (`refreshProfileFromServer`, `shared/sowie-cloud.js:709`).
   Odpowiedź wysłana przed zapisem zakupu może przyjść po nim — wtedy menu przywraca stary stan: stary wybrany gatunek
   (sowa „sama” zmienia kolor), stare saldo piórek, a kolejny zakup liczy się od tego starego stanu.
4. **Lista kupionych gatunków zapisuje się w całości.** `shop.species.owned` to tablica, a tablice idą do bazy
   w całości (`shared/sowie-cloud.js:131`). Zapis ze strony albo urządzenia, które ma starszy profil, nadpisuje listę
   i usuwa gatunki dokupione w międzyczasie. To samo dotyczy listy strojów (`cosmetics.unlocked`) i odblokowanych
   zdjęć (`gallery.unlocked`; zdjęcia wracają same, bo warunki są liczone od nowa — gatunki i stroje nie).
5. **Piórka to jedna liczba nadpisywana w całości** (`academy.feathers`): przy dwóch urządzeniach albo starym profilu
   wygrywa ostatni zapis — piórka mogą wrócić albo zniknąć.
6. **Test nie sprawdza przejść między stronami.** Test Butiku (`tests/e2e/telefon/menu.spec.js:328`) kupuje
   i sprawdza wszystko na jednej stronie, bez wejścia do gry, ponownego wczytania i drugiego urządzenia — dlatego błąd
   nie wyszedł.

**Przebieg zgodny z opisem.** Osoba testująca kupuje Śnieżną (białą) i chwilę zostaje w menu — ten zapis dochodzi.
Potem kupuje kolejne kolory i zaraz wchodzi do gry — te zapisy przepadają (punkt 2). Po powrocie menu pokazuje to,
co zapisało się naprawdę: Śnieżną jako wybraną („automatycznie zmienia mi na białą”) i pozostałe kolory znów do
kupienia („cofało zakupy”). Ten sam obraz dają punkty 3 i 4 (wolny internet, gra na dwóch urządzeniach). Pewność:
**wysoka** co do słabych punktów zapisu; który z nich zadziałał u osoby testującej, pokaże test P0.1 i odpowiedzi na
pytania 1a–1c.

**Propozycja naprawy (etap P1):**

1. **Zakup, „Wybierz” i wybór stroju zapisują się od razu** (≤ 1 s) i Butik **czeka na potwierdzenie**
   (`await cloud.flush()`): do tego czasu przycisk pokazuje „Zapisuję…”, a „Kupione!” dopiero po zapisie. Bez
   internetu: „Butik działa tylko z internetem” (dziś też wymaga połączenia z chmurą).
2. **Strażnik wyjścia:** gdy są niezapisane zmiany, „Graj” w menu, „Graj” w oknie „Jak grać?” i „Menu” / „Wyjdź do
   menu” w grach czekają na zapis (najwyżej ok. 3 s, komunikat „Zapisuję…”), potem przechodzą. To przy okazji
   zabezpiecza postęp w Sowich Ogrodach i Łącz i Hoduj (zwykły zapis co 30 s, a „Menu” to też zwykły link).
3. **Odświeżenie z serwera nie nadpisuje nowszych danych:** jeśli od wysłania zapytania strona coś zapisała (licznik
   zapisów), odpowiedź jest pomijana albo zapytanie powtórzone.
4. **Zbiory „tylko przybywa” jako mapy:** kupione gatunki w `shop.species.got = { puszczyk: <czas>, … }` (mapa
   zapisuje się po jednym kluczu — dwa zapisy się sumują, a nie nadpisują). Odczyt = suma: dawna tablica ∪ mapa ∪
   wpisy `species:*` z dziennika `shop.purchases` (który już jest mapą). Przez okres przejściowy zapisujemy też starą
   tablicę (dla starszej wersji aplikacji w pamięci telefonu). Tak samo stroje (`cosmetics.got` ∪ `outfit:*`
   z dziennika ∪ nagrody misji).
5. **Naprawa istniejących profili** przy pierwszym wejściu nową wersją: gatunki i stroje odtworzone z dziennika
   `shop.purchases`. Zakupy, których zapis w ogóle nie doszedł, nie odjęły też piórek — wystarczy kupić je ponownie.
   Opcjonalnie rekompensata piórek jednorazową nagrodą Akademii (pytanie 1d).
6. **Piórka** na razie zostają jedną liczbą — po punktach 1–3 zakup zapisuje się od razu i nie startuje od starego
   profilu. Jeśli przy grze na dwóch urządzeniach saldo dalej będzie się „rozjeżdżać”: osobne liczniki „zdobyte”
   i „wydane” zapisywane przyrostowo (`increment`, jak dziś `stats.leaves`), saldo = zdobyte − wydane (mały, osobny
   krok).
7. **Testy:** jednostkowe SowieCloud (zapis zakupu ≤ 1 s, strażnik czeka na zapis, stara odpowiedź serwera nie
   nadpisuje profilu — atrapa wolnego serwera), jednostkowe Butiku (suma tablica ∪ mapa ∪ dziennik; zapis ze „starej”
   strony niczego nie usuwa), e2e na emulatorze (zakup → od razu „Graj” → powrót do menu w nowej karcie → gatunek
   kupiony i wybrany, piórka odjęte raz; dwa „urządzenia” kupują różne gatunki → oba zostają).

**Zapis graczy:** nowe pola dochodzą obok starych; nic nie jest usuwane; naprawa tylko dodaje gatunki i stroje, które
są w dzienniku zakupów.

### 3.2. Sowie Ogrody

#### O5 — „150 mln” wyświetla się jako „15 mln” (błąd)

**Przyczyna:** `formatNumber` (`SowieOgrody/ogrod/economy.js:136`) po zaokrągleniu usuwa „zera z końca” wyrażeniem
`/\.?0+$/` (linia 152). Miało ono usuwać zera po przecinku („2,50” → „2,5”), ale gdy liczba przed przyrostkiem jest
≥ 100 (bez części ułamkowej), zjada zera z części całkowitej. Wyniki zmierzone na kodzie gry:

| Wartość | Wyświetla dziś | Powinno |
|---|---|---|
| 100 000 | 1 tys. | 100 tys. |
| 120 000 | 12 tys. | 120 tys. |
| 150 000 000 | **15 mln** | 150 mln |
| 200 000 000 | 2 mln | 200 mln |
| 999 600 | 1 tys. | 1 mln |
| 9,999 | 10,0 | 10 |
| 10²⁴ | 1 tryld | 1 kwadryl. |

Błąd dotyczy wszystkich miejsc w Ogrodach, które używają tej funkcji: licznik liści i liści/s, ceny na przyciskach,
cele rozdziałów, nasiona, okna, napisy „+N”, podpisy „×N” przy roślinach. Pozostałe gry formatują liczby przez
`toLocaleString` — tego błędu nie mają. **Zapis gry bez wpływu** (to tylko wyświetlanie).

**Poprawka (P2.1):** zaokrąglać przez `Number(amount.toFixed(digits))` (usuwa tylko zera po przecinku), po
zaokrągleniu do 1000 przejść na następny przyrostek, dopisać przyrostki dla nowych rozdziałów (` kwadryl.`,
` kwadryld`, ` kwintyl.`, ` kwintyld` …). Test „liczby i czas po polsku” (`tests/unit/ogrody-ekonomia.test.mjs:293`)
dostaje przypadki z tabeli.

#### O4 — „przewijanie w dół nie pokazuje wszystkich roślinek i ich cen”

**Pomiar** (Chromium, profile telefonów, wszystkie rozdziały otwarte, 11 roślin): lista roślin przewija się do końca
na każdym profilu, przewijanie palcem działa, a ostatnia roślina (Drzewko złotych liści) jest w całości widoczna.
Problem jest gdzie indziej — **okno listy jest bardzo małe**, bo ogród zajmuje 34% wysokości ekranu, a cel rozdziału
do 4 wierszy:

| Profil | Wysokość okna listy | Ile kart roślin widać naraz |
|---|---|---|
| iPhone SE (320 × 568) | 140 px | ok. 1,4 |
| iPhone 13 w Safari z paskami (390 × 664) | 203 px | ok. 2 |
| Android 360 × 800 | 293 px | ok. 2,9 |
| iPhone 13 poziomo | 284 px | ok. 2,8 |

Karta rośliny ma ok. 100 px, a cała lista na końcu gry ok. 1220 px — trzeba ją przewijać w małym okienku, a przesuwanie
palcem po ogrodzie albo celu niczego nie przewija. Dodatkowo:

- **rośliny z kolejnych rozdziałów w ogóle nie są pokazywane** (lista filtruje je po otwartym rozdziale,
  `SowieOgrody/ogrod/panel.js`), więc nie da się z góry zobaczyć wszystkich roślin i ich cen;
- przyciski „×10” i „max” **nie pokazują ceny** (cena jest tylko na „Kup”);
- lista jest **budowana od nowa** po każdym zakupie (klucz z `JSON.stringify(state.plants)`, `panel.js:199`);
  z „Sową zakupową” (kupuje co 0,5 s, `garden.js:255`) to ok. 2 przebudowy na sekundę (zmierzone: 10 w 5 s).
  W Chromium nie przerywa to przewijania ani stuknięć (10 z 10 stuknięć „Kup” zaliczonych), ale na iPhonie może
  zatrzymywać przewijanie i gubić stuknięcia — tego nie dało się sprawdzić bez prawdziwego iPhone’a (WebKit działa
  tylko w CI).

**Propozycja (P3.1–3.2):**

1. zwarte karty roślin — nazwa, liczba sztuk, produkcja i przycisk „Kup” z ceną w jednym wierszu, „×10” i „max”
   mniejsze **z cenami** — ok. 64 px na roślinę (ok. 2–4,5 rośliny naraz zamiast 1,4–2,9);
2. przycisk „Rozwiń listę” (⤢): ogród zwija się do niskiego paska, a lista dostaje prawie cały ekran; drugie
   stuknięcie — powrót;
3. rośliny z kolejnych rozdziałów jako wyszarzone karty z ceną i podpisem „🔒 Rozdział: Balkon” (jeśli właściciel
   potwierdzi, że o to chodziło — pytanie 2);
4. lista aktualizowana w miejscu (liczby, ceny, dostępność), a budowana od nowa tylko przy nowym rozdziale albo zmianie
   zakładki;
5. test e2e na 6 profilach (w tym 320 × 568): każdą kartę i każdy przycisk „Kup” da się przewinąć do widoku.

#### O7 — po zakończeniu tylko jedno tło

**Przyczyna:** tło ogrodu zależy od bieżącego rozdziału — pierwszego nieukończonego, a po ukończeniu wszystkich —
ostatniego (`chapterIndex`, `SowieOgrody/ogrod/garden.js:23`). Ukończone rozdziały zostają po Wielkim Przesadzaniu
(`garden.js:186`), więc od ukończenia Arboretum tło **na zawsze** jest „Arboretum” — także w nowych cyklach, które
zaczynają się od Monstery na parapecie.

**Propozycja (P3.3):**

- **A — „Tło ogrodu” w zakładce Kolekcja:** wybór „Automatyczne” albo dowolny ukończony rozdział;
- **B — „podróż” w każdym cyklu (rekomendacja jako ustawienie domyślne):** po Wielkim Przesadzaniu tło idzie za
  postępem cyklu — rozdział najdroższej rośliny kupionej w tym cyklu (Parapet → Balkon → … → Arboretum → nowe
  rozdziały z O3);
- **C — nowe rozdziały z własnymi tłami** (O3, etap P4).

**Zapis:** jedno nowe pole `scene` („auto” albo identyfikator rozdziału), domyślnie „auto”.

#### O2, O3, O6 — więcej roślin, plansz i ulepszeń

**Jak jest:** 6 rozdziałów (Parapet → Arboretum), 11 roślin, 16 ulepszeń, drzewko prestiżu 3 gałęzie × 3 węzły
(`SowieOgrody/ogrod/config.js`). Wszystkie rośliny są rysowane tak samo — doniczka i liście w kolorze gatunku
(`render.js`, funkcja `plant`). Ogród mieści 2 rzędy po 6 gatunków (`COLUMNS = 6`, `render.js:21`). Po ostatnim
rozdziale nie ma nic nowego, a po Wielkim Przesadzaniu kupuje się te same 16 ulepszeń.

**Propozycja (P4) — „plansze” jako nowe rozdziały z własnym tłem, po 2 rośliny w każdym** (nazwy do akceptacji):

| # | Rozdział | Tło | Nowe rośliny |
|---|---|---|---|
| 7 | Palmiarnia | szklana kopuła, palmy, mgiełka | Palma, Strelicja |
| 8 | Dżungla | liany, wodospad, mgła | Bambus, Dzbanecznik |
| 9 | Ogród japoński | mostek, staw z karpiami, latarenka | Wiśnia sakura, Klon japoński |
| 10 | Księżycowy ogród | noc, księżyc, świetliki | Księżycowa monstera, Gwiezdny kwiat |

- **Rośliny:** każda z własnym kształtem (liście palmy, kwiat strelicji, łodygi bambusa, dzbanki, płatki sakury…),
  a nie tylko kolorem; ceny i produkcja w tym samym rytmie co dziś (cena ok. ×9, produkcja ok. ×5 na kolejny gatunek,
  rosnący czas zwrotu — warunki z testu „dane”), dokładne liczby z symulatora ekonomii.
- **Cele rozdziałów:** jak dziś (sztuki roślin, produkcja, liście w cyklu, przesadzania) i nowe rodzaje liczone
  **w bieżącym cyklu** (złote kózki, Zatoka Humbaka, przegonione ciężarówki) — liczniki całej gry dałyby od razu
  zaliczone cele.
- **Ulepszenia (O6):** nawozy gatunków (każda roślina ×2 od 25 sztuk — 19 ulepszeń), 2–4 ulepszenia w każdym nowym
  rozdziale (mnożnik rozdziału, ×1,5 dla wszystkich i efekty: „Deszczownica” — +1 ładunek konewki, „Złota obroża” —
  kózki częściej, „Plandeka” — ciężarówka Amic rzadziej, „Latarnia humbaka” — Zatoka +5 s, „Sowa zakupowa II” —
  kupuje szybciej i po 10); drzewko prestiżu: 4. gałąź (np. „Słońce”: start cyklu z ulepszeniami Parapetu, większe
  premie kózek, stały przyrost produkcji) i wyższe limity obecnych węzłów — przy nowych rozdziałach nasion będzie
  dużo więcej (nasiona = `√(liście cyklu / 10⁹)`).
- **Ogród na płótnie:** nowy układ półek — 19 gatunków nie zmieści się w 2 rzędach po 6; np. najwyżej 12 widocznych
  (najwięcej produkujące), reszta w Kolekcji; układ do akceptacji na zrzutach.
- **Symulator** (`tests/unit/ogrody-ekonomia.test.mjs`): czas dojścia do każdego nowego rozdziału (z przesadzaniami)
  w ustalonych granicach, np. 1–3 h gry na rozdział.

**Zapis graczy:** rozdziały 7–10 dopisane na końcu; kto ukończył Arboretum, zobaczy rozdział 7 jako bieżący, z celami;
rośliny, ulepszenia i nasiona — bez zmian. Warunek Wielkiego Przesadzania (`PRESTIGE.after: "szklarnia"`) **zostaje** —
zmiana zablokowałaby przesadzanie graczom w trakcie cyklu.

### 3.3. Łącz i Hoduj

#### L4 — podpowiedzi ucięte (błąd wyglądu)

**Przyczyna:** pasek podpowiedzi nad planszą ma jedną linijkę i ucina dłuższy tekst wielokropkiem
(`.lacz-hint { white-space: nowrap; text-overflow: ellipsis }`, `LaczIHoduj/style.css:174–182`). Przy telefonie
w poziomie są już dwa wiersze, w pionie — nie. Pomiar 25 podpowiedzi gry (z najdłuższymi imionami i nazwami):

| Profil (szerokość paska) | Ucięte |
|---|---|
| iPhone SE (316 px) | 10 z 25 |
| Android 360 × 800 (348 px) | 10 z 25 |
| iPhone 13 (378 px) | 7 z 25 |

Przykłady: „Dryń! Karteczka Pracu na półce — połącz rośliny ob…”, „Kózka Dżoker: przeciągnij ją na roślinę (albo
roślinę na nią) — …”, „Płomykówka Pola prosi: Alopaproć Wachlarzowa, nie Monpilea Prz…”, „Kózka Zjadaczka czeka —
w jej rzędzie i kolumnie nie ma karte…”.

**Propozycja (P2.2):** dwa wiersze także w pionie (jak w poziomie; na wysokich telefonach plansza się nie zmniejsza, bo
ma wolne miejsce nad i pod sobą), krótsze teksty najdłuższych podpowiedzi, stuknięcie w pasek pokazuje pełny tekst;
test: każda podpowiedź (z najdłuższymi nazwami) mieści się w dwóch wierszach przy 320 px. Przewijanego „paska
z napisem” nie proponuję — trudno go przeczytać.

#### L3 — więcej poziomów rośliny

**Jak jest:** każdy łańcuch ma 5 poziomów (np. Nasionko → Kiełek → Sadzonka → Monstera → Złota Monstera); dwie złote
rośliny tego samego gatunku się nie łączą, a złote różnych gatunków dają hybrydę (`hybridOf`, `LaczIHoduj/board.js`).

**Propozycja (P5.1):** poziomy 6 i 7 ponad złotym — np. „Diamentowa Monstera” i „Tęczowa Monstera” (nazwy do
akceptacji) dla wszystkich łańcuchów. **Krzyżowanie zostaje na 5. poziomie** („złote rośliny krzyżujesz”), więc
zasady się nie zmieniają, a dwie takie same złote rośliny zamiast się zamieniać — łączą się w diamentową.
Do uzupełnienia: nagrody za połączenie i kompost (tabele według poziomu), zamówienia sąsiadek do 6.–7. poziomu (np. po
60 zamówieniach), rysunki poziomów 6–7 (donica z ozdobą, iskry, tęczowe liście), kózki Sprężynka, Dżoker i Skoczek
podnoszą też złote.

**Zapis graczy:** złote rośliny na planszy zostają; zapis wersji 2 bez zmian. Najpierw jednak bezpiecznik P5.0
(zasada 4 z rozdziału 2).

#### L2 — więcej typów roślin

**Jak jest:** 4 łańcuchy (Monstera, Pilea, Paproć, Kaktus) wchodzące do Sowiej doniczki po 0, 10, 30 i 60
połączeniach, 3 hybrydy; rysunki roślin są robione kodem, osobno dla każdego łańcucha i poziomu
(`LaczIHoduj/plants.js`).

**Propozycja (P5.2):** 4 nowe łańcuchy po 5 (+2) poziomów, odblokowywane po kolejnych połączeniach (np. 100, 150, 220,
300) — **Storczyk, Słonecznik, Truskawka, Lotos** (do akceptacji) — i 2–3 nowe hybrydy (np. Storczyk + Słonecznik,
Truskawka + Lotos i hybryda z hybryd). Więcej rodzajów nasion szybciej zapycha planszę 7 × 9, dlatego doniczka losuje
głównie z ostatnio odblokowanych, a pomieszczenie „Ogród na dachu” daje **wybór nasion** (P5.3). Rozmiar planszy
zostaje (zmiana przesunęłaby zapisane pola).

#### L5 — więcej rozwinięć

**Jak jest:** 10 pomieszczeń szklarni (razem 150 ⭐); po odnowieniu wszystkich okno pokazuje tylko „Cała szklarnia
odnowiona — brawo!” (`LaczIHoduj/main.js:652`) i gwiazdki nie mają już zastosowania. **Liście w Łącz i Hoduj w ogóle
nie są wydawane** — jedynym wydatkiem w grze są gwiazdki na pomieszczenia (`LaczIHoduj/game.js:712`). Odnowione
pomieszczenia nie zmieniają też wyglądu szklarni.

**Propozycja:**

1. **pomieszczenia 11–16** (P5.3, na końcu listy), np. Palmiarnia (doniczka +2 ładunki), Pasieka (kompost złotych
   roślin daje ⭐), Herbaciarnia (Basen Humbaka co 4 zamówienia), Obserwatorium (zamówienia 6.–7. poziomu +1 ⭐),
   Motylarnia (co 3. zamówienie z kózką), Ogród na dachu (wybór nasion w doniczce); etapy po 5–6 ⭐;
2. **„Kram ogrodnika” za liście** (P5.4): paczka nasion (+6 ładunków doniczki), Kózka Dżoker, Kózka Taran, wymiana
   liści na gwiazdkę odnowy, ozdoby szklarni (lampki, ławeczka, obrazki) widoczne wokół planszy;
3. odnowione pomieszczenia widać wokół planszy (ramka i tło szklarni zmieniają się z kolejnymi pomieszczeniami).

**Zapis graczy:** pomieszczenia 11–16 zaczynają od zera, 10 dawnych zostaje odnowionych; liście i gwiazdki zebrane do
tej pory będzie można wydać.

### 3.4. Sowia Ucieczka — U1: humbak za często

**Mechanizm:** „Rejs na humbaku” (20 s bez przeszkód) zaczyna się, gdy Plusk-o-metr jest pełny: **60 liści** (złoty
liczy się za 5) albo 3 bąbelki (co 500–900 m) — `SPLASH`, `SowiaUcieczka/config.js:151`. W czasie rejsu metr się nie
napełnia, ale zaraz po nim napełnia się od zera — nie ma żadnego odstępu.

**Symulacja** (logika gry, tryb bez trafień, 3 poziomy × 4 ziarna, bieg 5 km; „dobry gracz” = liście przyciągane jak
przez Kózkę Magnes, zbiera prawie wszystko):

| Ustawienia | Rejsy na bieg 5 km — dobry gracz | słabszy gracz | Najkrótszy odstęp między rejsami |
|---|---|---|---|
| **dziś:** 60 liści, bąbelki co 500–900 m | **13,2** (12–15) | 6,3 | 250 m |
| A: 150 liści, bąbelki co 900–1500 m | 7,8 | 2,8 | 423 m |
| **B (rekomendacja):** A + po rejsie 600 m przerwy | **4,3** (ok. 1 na krainę) | 2,0 | 963 m |
| C: 200 liści, bąbelki co 1000–1600 m, przerwa 800 m | 3,1 | 1,9 | 1289 m |

Dziś dobry gracz spędza na humbaku ok. 40% biegu — stąd „kilkanaście razy na jedną mapę”.

**Propozycja (P2.3):** ustawienie B (albo inne po decyzji — pytanie 6): parametry `SPLASH.leaves`,
`SPLASH.bubbleEvery` i nowy `SPLASH.rest` (przerwa w metrach; w tym czasie Plusk-o-metr jest przygaszony z napisem
„Humbak odpoczywa”, a bąbelki się nie pojawiają). Do zmiany także: instrukcja w grze („60 liści albo 3 bąbelki”,
`shared/meta/guides-data.js:126`), test „Plusk-o-metr” (`tests/unit/ucieczka.test.mjs:573`) i nowy test symulacji
(dobry gracz ≤ 1,1 rejsu na 1000 m, odstęp ≥ 900 m).

**Wpływ na zadania i osiągnięcia:** zadanie biegu „Popłyń na humbaku” liczy się łącznie (1–5 rejsów), zadanie dnia
„przygoda z humbakiem” zaliczają też Sowie Tory i Sowa w Chmurach, osiągnięcie „Przyjaciółka humbaka” (10 przygód)
i zdjęcie nr 27 (3 przygody) — wszystkie dalej łatwo osiągalne. Zapis gry bez zmian.

Dla porządku: w Sowie w Chmurach fontanna humbaka jest co 260–340 m (`OCEAN.every`), ale gracz sam decyduje, czy
w nią wleci; Sowie Tory mają humbaka na mecie każdej planszy — uwaga dotyczyła tylko Sowiej Ucieczki.

### 3.5. Sowa w Chmurach — C2: coś ponad kosmosem

**Jak jest:** 5 stref — Ogródek (0 m), Blok (150 m), Chmury (400 m), Zorza (800 m), **Kosmos (od 1500 m)**
(`SowaWChmurach/config.js:272–278`). Trudność przestaje rosnąć od 1200 m (`gapHeight`), a oprawa ostatniej strefy
powtarza się w nieskończoność. Oprawa jest rysowana kodem i zakłada dokładnie 5 stref
(`const [ogrodek, blok, chmury, zorza, kosmos] = weights`, `SowaWChmurach/scenery.js:265`).

**Propozycja (P6):**

1. **Mgławica** (np. od 2200 m): różowo-fioletowe obłoki gazu, rodzące się gwiazdy;
2. **„Immaterium” w wersji Sowiego Świata** (np. od 3200 m): wirujące tęczowe smugi, unoszące się kryształy,
   świecące „sowie runy”, sylwetki humbaków z mgiełki, niebo powoli zmieniające kolor;
3. **dalej** co 1000 m kolejne odcienie — tło nigdy się nie zatrzymuje;
4. komunikat „Nowa strefa: …”, nazwa strefy w podsumowaniu lotu i w rekordach; opcjonalnie własny motyw muzyczny
   strefy i osiągnięcie albo zdjęcie Galerii za dotarcie.

**Prawa autorskie i styl:** „Immaterium” z Warhammera 40k to część świata firmy Games Workshop — mroczny wymiar
z demonami. Nie kopiujemy ich znaków, symboli, postaci ani wyglądu; proponuję własną, kolorową i przyjazną „krainę
ponad kosmosem” w stylu gry. Samo słowo „Immaterium” jest ogólne (łac. „niematerialny”), więc nazwa może zostać, ale
może też być polska (pytanie 7b). Wysokości stref ustalimy po sprawdzeniu, jak wysoko zwykle dolatuje osoba testująca
(pytanie 7a).

**Zapis graczy:** rekordy wysokości bez zmian; strefy tylko dopisane.

### 3.6. Galeria — G5 (dwa takie same zdjęcia) i G4 (nowe zdjęcia)

#### G5 — „dwie takie same — z zoomem i bez zooma”

**Wynik porównania** wszystkich podejrzanych par: dla każdej szukałem przybliżenia i kadru, przy których jedno zdjęcie
najbardziej przypomina drugie (zgodność 1 = identyczne; pary zupełnie różnych zdjęć dały 0,40–0,53). Wysoka zgodność
oznacza ten sam kadr po przybliżeniu; pozostałe pary rozpoznałem na oko (ta sama sowa i miejsce, inne ujęcie).

| Zdjęcia | Zgodność kadru | Wniosek |
|---|---|---|
| **nr 1 „Puchata obserwatorka” i nr 2 „Leśna elegantka”** | **0,86** | **ta sama fotografia puchacza** — nr 2 to przybliżenie ok. ×1,25, w innych kolorach |
| nr 9 i nr 25 (biała sówka w koszyku) | 0,58 | ta sama sowa i sesja, inne ujęcie |
| nr 10 i nr 22 (sówka na skośnej gałęzi) | 0,58 | ta sama sowa i gałąź, ujęcie chwilę później |
| nr 15 i nr 26 (sówka na skośnej gałęzi, „z bliska”) | 0,59 | ta sama sowa i sesja, nr 26 bliżej |
| nr 11 i nr 12 (dwie sówki na gałęzi) | 0,39 | ta sama para sów, inny kadr |

Zdjęcie nr 1 jest dostępne od początku, a nr 2 od 2. poziomu Akademii — stoją obok siebie na górze Galerii, więc to
najpewniej ta para.

**Propozycja (P2.4):** zdjęcie `owl-02` dostaje **nową fotografię pod tym samym identyfikatorem** — kto je odblokował,
ma je dalej odblokowane (to samo wymaganie; ulubione i tło menu wskażą nowe zdjęcie). Plik z **nową nazwą** (pamięć
telefonu, zasada 6 z rozdziału 2), nowe miniatury (`scripts/make-thumbs.cjs`), wpis w `Obrazki/README.md` (autor,
źródło, licencja). Opcjonalnie tak samo drugie zdjęcie z pozostałych par (nr 25, 22, 26, 12 — pytanie 8c). Przy
dodawaniu zdjęć — skrypt sprawdzający podobieństwo do wszystkich obecnych (metoda z Załącznika A).

#### G4 — nowe zdjęcia sówek

**Jak dodajemy** (`Obrazki/README.md`, „Zasady dalszej rozbudowy”): licencja (Pexels License albo własne zdjęcia
właściciela), kadr 4:3, 1200 × 900, bez metadanych, miniatury 400/600 px, wpis w `shared/owl-gallery.js` i w testach
(`tests/unit/owl-gallery.test.mjs` sprawdza dziś 30 zdjęć).

**Propozycja (P7):** 10 nowych zdjęć (`owl-31` … `owl-40`) z wymaganiami związanymi z nowymi treściami, np. „Dotrzyj
do Palmiarni w Sowich Ogrodach”, „Wyhoduj Diamentową roślinę w Łącz i Hoduj”, „Doleć do Mgławicy w Sowie w Chmurach”,
„Popłyń 15 razy na humbaku”, „Zdobądź 15 osiągnięć”. Każde nowe zdjęcie sprawdzone skryptem podobieństwa (bez
kolejnych „par”). **Zapis graczy:** odblokowane zdjęcia `owl-01` … `owl-30` bez zmian; licznik Galerii zmieni się
z „n / 30” na „n / 40”.

---

## 4. Plan prac i wdrożeń

### 4.1. Kolejność etapów

```
P0 Testy, które pokazują błędy (G3, O5, L4, U1)
 └─► P1 Sowi Butik: pewny zapis zakupów i wyboru (G3)                 ← najpierw: chroni postęp
      └─► P2 Szybkie poprawki: liczby (O5) · podpowiedzi (L4) · humbak (U1) · zdjęcie nr 2 (G5)
           └─► P3 Sowie Ogrody: wygodna lista roślin i tła (O4, O7)
                ├─► P4 Sowie Ogrody: nowe rozdziały, rośliny, ulepszenia (O2, O3, O6)
                ├─► P5 Łącz i Hoduj: poziomy, rośliny, pomieszczenia, Kram (L2, L3, L5)
                └─► P6 Sowa w Chmurach: strefy ponad kosmosem (C2)
                     └─► P7 Galeria: nowe zdjęcia z wymaganiami z nowych treści (G4)
                          └─► P8 Zamknięcie: dokumenty stanu, zadanie 9.5
```

| Etap | Zakres | Rozmiar | Wymaga | Co zobaczy gracz | Punkt kontrolny właściciela |
|---|---|---|---|---|---|
| P0 | testy odtwarzające błędy | S | — | nic | — |
| P1 | Butik: zapis od razu, strażnik wyjścia, zbiory „tylko przybywa”, naprawa profili | M | P0 | zakupy i wybór koloru zostają; „Zapisuję…” przy zakupie | test zakupów na telefonie |
| P2 | 4 szybkie poprawki (osobne commity) | S × 4 | P0 (P2.3 — decyzja z pytania 6) | poprawne liczby, pełne podpowiedzi, rzadszy humbak, nowe zdjęcie nr 2 | szybki test na telefonie |
| P3 | Ogrody: lista roślin, „Rozwiń listę”, tła | M | P2.1 | wygodniejsza lista, wybór tła, tło „podróży” | zrzuty przed wdrożeniem + test |
| P4 | Ogrody: 4 rozdziały, 8 roślin, ulepszenia, 4. gałąź drzewka | L | P3 | nowe plansze z tłami, rośliny, ulepszenia | zrzuty oprawy, potem test |
| P5 | Łącz i Hoduj: bezpiecznik, poziomy 6–7, 4 rośliny, pomieszczenia 11–16, Kram | L | P2.2 | wyższe poziomy, nowe rośliny, pomieszczenia, wydawanie liści | zrzuty rysunków, potem test |
| P6 | Sowa w Chmurach: Mgławica, Immaterium, kolejne odcienie | M | P0 | nowe tła ponad kosmosem | zrzuty oprawy, potem test |
| P7 | Galeria: 10 zdjęć | M | P4–P6 | nowe zdjęcia do zdobycia | wybór zdjęć |
| P8 | dokumenty stanu, 9.5 | S | wszystko | — | decyzja o 9.5 |

P4, P5 i P6 są od siebie niezależne — kolejność między nimi według życzenia właściciela (pytanie 9).

### 4.2. Etapy szczegółowo

#### P0 — testy, które pokazują błędy (S)

| # | Zadanie |
|---|---|
| 0.1 | SowieCloud (testy jednostkowe z atrapą bazy): zakup w Butiku planuje zapis ≤ 1 s; wyjście ze strony czeka na zapis; odpowiedź serwera starsza niż ostatni zapis nie podmienia profilu. **Dziś te testy nie przechodzą** — to dowód błędu G3. |
| 0.2 | e2e na emulatorze: zakup → od razu „Graj” → menu w nowej karcie → gatunek kupiony i wybrany, piórka odjęte raz; dwa „urządzenia” (dwa konteksty przeglądarki) kupują różne gatunki → oba zostają. |
| 0.3 | Ogrody: przypadki liczb z tabeli O5. |
| 0.4 | Łącz i Hoduj: każda podpowiedź (najdłuższe nazwy) mieści się w dwóch wierszach przy 320 px. |
| 0.5 | Sowia Ucieczka: symulacja rejsów (dobry gracz) — dziś ok. 2,7 na 1000 m; próg docelowy po decyzji z pytania 6. |

Testy z P0 trafiają na `main` razem z poprawkami (P1, P2) — na `main` wchodzą tylko zielone testy (zasada „każdy krok
z zielonym `npm test`”).

#### P1 — Sowi Butik: pewny zapis zakupów (M)

| # | Zadanie |
|---|---|
| 1.1 | `shared/meta/shop.js`: zakup, „Wybierz” i wybór stroju z opóźnieniem ≤ 1 s; Butik czeka na `cloud.flush()`, w tym czasie „Zapisuję…”; „Kupione!” po zapisie; bez internetu — komunikat. |
| 1.2 | Strażnik wyjścia: „Graj” na kartach gier (`shared/menu/games.js`), „Graj” w oknie „Jak grać?” (`shared/menu/menu.js`), „Menu” / „Wyjdź do menu” w 5 grach — przy niezapisanych zmianach czekamy na zapis (najwyżej ok. 3 s). |
| 1.3 | `refreshProfileFromServer` (`shared/sowie-cloud.js`): licznik zapisów — odpowiedź sprzed zapisu jest pomijana albo zapytanie powtórzone. |
| 1.4 | Zbiory „tylko przybywa”: `shop.species.got`, `cosmetics.got` (mapy), odczyt = suma z tablicą i dziennikiem `shop.purchases`, zapis obu postaci w okresie przejściowym; `SHOP_VERSION` 2 z przejściem z wersji 1 bez strat. |
| 1.5 | Naprawa przy wejściu: gatunki i stroje z dziennika zakupów; komunikat „Przywrócono zakupy: …”, jeśli coś przywrócono. |
| 1.6 | (po decyzji, pytanie 1d) jednorazowa rekompensata piórek nagrodą Akademii o stałym identyfikatorze (raz na profil). |
| 1.7 | Testy z P0.1–0.2, dokumentacja główna (`docs/Documentation.md` — SowieCloud i Butik; `docs/README.md` — Sowi Butik), `VERSION` w `sw.js`. |

**Gotowe, gdy:** testy P0.1–0.2 zielone w Chromium i WebKit (CI); na telefonie właściciela kupione gatunki i wybrany
kolor zostają po wejściu do gry, powrocie, zamknięciu aplikacji i na drugim urządzeniu.

#### P2 — szybkie poprawki (S × 4, każda osobnym commitem)

| # | Zadanie | Pliki |
|---|---|---|
| 2.1 | Liczby w Ogrodach (O5): zaokrąglanie bez obcinania zer całkowitych, przejście na następny przyrostek, nowe przyrostki | `SowieOgrody/ogrod/economy.js`, test ekonomii, `SowieOgrody/docs/*` |
| 2.2 | Podpowiedzi (L4): dwa wiersze w pionie, krótsze teksty, stuknięcie pokazuje całość | `LaczIHoduj/style.css`, `LaczIHoduj/main.js`, test, `LaczIHoduj/docs/*` |
| 2.3 | Humbak (U1): ustawienie z pytania 6 (rekomendacja B), „Humbak odpoczywa” na Plusk-o-metrze | `SowiaUcieczka/config.js`, `game.js`, rysowanie HUD, `shared/meta/guides-data.js`, testy, `SowiaUcieczka/docs/*` |
| 2.4 | Zdjęcie nr 2 (G5): nowa fotografia pod `owl-02`, nowa nazwa pliku, miniatury | `Obrazki/`, `assets/gallery-thumbs/`, `shared/owl-gallery.js`, `Obrazki/README.md`, testy Galerii, `sw.js` |

**Gotowe, gdy:** testy z P0.3–0.5 zielone; na telefonie: „150 mln”, pełne podpowiedzi, humbak ok. raz na krainę,
w Galerii nie ma podwójnego zdjęcia.

#### P3 — Sowie Ogrody: wygodna lista i tła (M)

| # | Zadanie |
|---|---|
| 3.1 | Zwarte karty roślin z cenami na „×10” i „max”; przycisk „Rozwiń listę”; (po decyzji, pytanie 2) zablokowane rośliny kolejnych rozdziałów z ceną. |
| 3.2 | Lista aktualizowana w miejscu (bez przebudowy przy zakupie i przy „Sowie zakupowej”). |
| 3.3 | Tła: „Tło ogrodu” w Kolekcji (pole `scene`) i tło „podróży” w cyklu (pytanie 4). |
| 3.4 | e2e: wszystkie karty i przyciski „Kup” osiągalne przewijaniem na 6 profilach; wybór tła zostaje po ponownym wczytaniu (emulator); dokumentacja gry i instrukcja w `guides-data.js`. |

**Gotowe, gdy:** na iPhonie SE widać co najmniej 2 rośliny naraz (po „Rozwiń listę” — co najmniej 5); właściciel
zaakceptował wygląd.

#### P4 — Sowie Ogrody: nowe rozdziały, rośliny i ulepszenia (L)

| # | Zadanie |
|---|---|
| 4.1 | Projekt i zrzuty do akceptacji: 4 tła (Palmiarnia, Dżungla, Ogród japoński, Księżycowy ogród), 8 roślin z własnymi kształtami, nowy układ półek ogrodu. |
| 4.2 | Dane: rozdziały 7–10 z celami (także „w tym cyklu” — nowe liczniki cyklu w stanie gry), rośliny, ulepszenia (nawozy gatunków, ulepszenia rozdziałów), 4. gałąź drzewka i wyższe limity węzłów. |
| 4.3 | Symulator ekonomii: czasy dojścia do rozdziałów 7–10 z przesadzaniami (np. 1–3 h gry na rozdział); test „dane” z nowymi liczbami (10 rozdziałów, 19 roślin, 4 gałęzie). |
| 4.4 | Rysowanie: tła, rośliny, półki (najwyżej 12 widocznych gatunków); Kolekcja: gatunki i tła. |
| 4.5 | Testy e2e (rozdział 6 → 7 po Arboretum, zakup nowej rośliny), dokumentacja gry, instrukcja „Jak grać”, opcjonalnie osiągnięcia Akademii za nowe rozdziały. |

**Gotowe, gdy:** symulator w granicach; gracz po Arboretum widzi rozdział 7; zapis ze starym stanem (test na emulatorze
z zapisem po Arboretum) wczytuje się bez strat.

#### P5 — Łącz i Hoduj: poziomy, rośliny, rozwinięcia (L)

| # | Zadanie |
|---|---|
| 5.0 | **Bezpiecznik:** nieznane przedmioty z zapisu (łańcuch albo poziom spoza danych) są przechowywane w osobnym polu i wracają na planszę, gdy znów są znane — zamiast dzisiejszego usuwania (`createBoard`). Wchodzi **osobnym wdrożeniem przed 5.1**. |
| 5.1 | Poziomy 6–7 dla 4 łańcuchów: nazwy, rysunki, nagrody (połączenie, kompost, zamówienia), krzyżowanie dalej na 5. poziomie, zamówienia do 6.–7. poziomu. |
| 5.2 | 4 nowe łańcuchy i 2–3 hybrydy: rysunki, odblokowanie w doniczce, wagi losowania; test „wyjść z planszy” (`exits`) przy 8 łańcuchach. |
| 5.3 | Pomieszczenia 11–16 z ułatwieniami (w tym „wybór nasion”); wygląd szklarni zmienia się z odnowionymi pomieszczeniami. |
| 5.4 | Kram ogrodnika za liście (nowe pole stanu z wartościami domyślnymi). |
| 5.5 | Testy (plansza, zapis starego stanu z 10 odnowionymi pomieszczeniami i złotymi roślinami, e2e), dokumentacja gry i instrukcja. |

**Gotowe, gdy:** stary zapis (złote rośliny, 10 pomieszczeń, liście) wczytuje się bez strat; nowe rośliny i poziomy
rysują się czytelnie na 320 × 568; właściciel zaakceptował rysunki.

#### P6 — Sowa w Chmurach: strefy ponad kosmosem (M)

| # | Zadanie |
|---|---|
| 6.1 | Zrzuty oprawy do akceptacji: Mgławica i „Immaterium” (własny wygląd, bez elementów Warhammera). |
| 6.2 | `ZONES` (dopisane na końcu), kolory nieba, oprawa bez stałej listy 5 stref, kolejne odcienie co 1000 m, komunikat „Nowa strefa”, nazwa w podsumowaniu i rekordach. |
| 6.3 | (opcjonalnie) motyw muzyczny strefy (`scripts/make-audio.mjs`, budżet gry < 800 KB), osiągnięcie za dotarcie. |
| 6.4 | Testy stref (`tests/unit/chmury-strefy.test.mjs`: płynne przejścia, każda strefa coś rysuje), dokumentacja gry i instrukcja. |

#### P7 — Galeria: nowe zdjęcia (M)

| # | Zadanie |
|---|---|
| 7.1 | Wybór 10 zdjęć (pytanie 8a–8b): licencja, autor, źródło; skrypt podobieństwa — żadnych „par” z obecnymi. |
| 7.2 | `owl-31` … `owl-40` z wymaganiami z nowych treści (P4–P6), miniatury, `Obrazki/README.md`. |
| 7.3 | Testy Galerii (liczba zdjęć, wymagania, postęp), dokumentacja główna, `VERSION` w `sw.js`. |

#### P8 — zamknięcie (S)

`UWAGI_WLASCICIELA.md` (statusy ✅ z commitami), `STAN_PRAC.md`, dokumentacja główna; osobna decyzja o zadaniu 9.5
z Analizy 3 (usunięcie stron-przekierowań i sprzątania starych kluczy `localStorage` — od E1 minął już ponad miesiąc;
nie dotyczy postępu w chmurze).

### 4.3. Jak wdrażamy każdy krok

1. Zmiana w małym kroku (jeden commit = jedna uwaga albo jedna część etapu).
2. Pełny `npm test` lokalnie (Chromium; WebKit tylko w CI) — musi przejść w całości; testy tylko na emulatorze
   i w pamięci.
3. Dokumentacja w tym samym commicie: `docs/Documentation.md` i `docs/README.md` zmienionej gry (`AGENTS.md`), a przy
   modułach wspólnych — dokumentacja główna; wpis w `UWAGI_WLASCICIELA.md` (⏳ → ✅).
4. `VERSION` w `sw.js`, gdy zmienia się lista plików albo zdjęcia.
5. Commit po polsku, wypchnięcie na `main`, sprawdzenie CI („Quality and browser tests”, Chromium + WebKit, ok.
   40 min); czerwone CI naprawiamy od razu.
6. Właściciel testuje na telefonie (**odśwież stronę dwa razy** — telefon trzyma poprzednią wersję w pamięci)
   i zgłasza uwagi.
7. Nowe treści (P3–P7): przed kodowaniem zrzuty ekranu do akceptacji; po wdrożeniu — drobne poprawki balansu
   osobnymi commitami.

Poprawki błędów (P1, P2) trafiają na stronę od razu po zielonych testach. Nowe treści są tylko **dopisywane**, więc
nie potrzebują osobnej strony podglądu — chyba że właściciel woli najpierw obejrzeć je pod osobnym adresem
(pytanie 9).

### 4.4. Testy — nowe i zmienione

| Plik | Co dochodzi |
|---|---|
| `tests/unit/sowie-cloud.test.mjs` | zapis zakupu ≤ 1 s, strażnik wyjścia, stara odpowiedź serwera nie nadpisuje profilu |
| `tests/unit/shop.test.mjs` | suma zbiorów (tablica ∪ mapa ∪ dziennik), naprawa z dziennika, zapis ze „starej” strony nic nie usuwa |
| `tests/e2e/telefon/menu.spec.js` | zakup → „Graj” → powrót; dwa urządzenia (emulator) |
| `tests/unit/ogrody-ekonomia.test.mjs` | liczby (O5), dane i symulator z rozdziałami 7–10 |
| `tests/e2e/telefon/ogrody-nowe.spec.js` | lista roślin osiągalna na 6 profilach, tła, rozdział 7 |
| `tests/unit/lacz-plansza.test.mjs`, `tests/e2e/telefon/lacz.spec.js` | podpowiedzi w 2 wierszach, bezpiecznik zapisu, poziomy 6–7, nowe łańcuchy, pomieszczenia, Kram |
| `tests/unit/ucieczka.test.mjs` | nowe parametry Plusk-o-metru, symulacja częstotliwości rejsów |
| `tests/unit/chmury-strefy.test.mjs` | nowe strefy |
| `tests/unit/owl-gallery.test.mjs`, `tests/e2e/owl-gallery.spec.js` | zdjęcie nr 2, 40 zdjęć |

---

## 5. Ryzyka

| Ryzyko | Skutek | Zabezpieczenie |
|---|---|---|
| Zmiana zapisu Butiku gubi zakupy | utrata postępu | odczyt jako suma wszystkich postaci, zapis obu przez okres przejściowy, testy „stara strona” i „dwa urządzenia” |
| Starsza wersja aplikacji w pamięci telefonu zapisuje dawną postać | nowe dane nadpisane starymi | mapy zapisywane po kluczu (stara wersja ich nie usuwa), nowa `VERSION` w `sw.js` |
| Wycofanie nowych poziomów albo roślin w Łącz i Hoduj | rośliny znikają z planszy | bezpiecznik P5.0 wdrożony wcześniej |
| Balans nowych rozdziałów Ogrodów | za szybko albo za wolno | symulator z progami czasu, poprawki po testach właściciela |
| Plansza Łącz i Hoduj zapycha się przy 8 rodzajach nasion | frustracja | stopniowe odblokowanie, wagi losowania, wybór nasion, test „wyjść” |
| Za rzadki humbak | mniej frajdy | wartości w jednym miejscu (`SPLASH`), łatwa korekta po teście |
| „Immaterium” — prawa Games Workshop | ryzyko prawne | własna oprawa, bez znaków, symboli i postaci z Warhammera |
| Zdjęcia — licencja | ryzyko prawne | tylko Pexels License albo zdjęcia właściciela, źródła w `Obrazki/README.md` |
| WebKit w CI wolny i niestabilny | czerwone CI | sprawdzone sposoby z Analizy 3 (8.3): `hold` / `advance`, nowe karty |
| Rozmiar gier | wolniejsze wczytywanie | rysunki kodem (bez obrazków), budżet dźwięków < 800 KB w testach |

---

## 6. Pytania do właściciela (prostym językiem)

Wystarczy odpisać numerem i literą (np. „1a: tylko telefon; 6: A”). Tam, gdzie piszę „proponuję”, mogę to zrobić
bez czekania, jeśli tak wolisz.

**1. Kolory sowy w Sowim Butiku** (najważniejsze)

- a) Czy kolory sowy były kupowane tylko na jednym telefonie, czy też na komputerze albo drugim telefonie?
- b) Czy po zakupie od razu wchodziło się do gry (w ciągu kilkunastu sekund)?
- c) Które kolory zostały kupione? Po poprawce sprawdzę, czy wszystkie wróciły.
- d) Czy dać „przeprosinowe” piórka za kłopot (np. 50)?

**2. Sowie Ogrody — przewijanie roślin.** Co dokładnie było nie tak? (A) na dole widać tylko 1–2 rośliny i trzeba dużo
przewijać; (B) ostatnich roślin w ogóle nie da się zobaczyć; (C) nie widać roślin z następnych rozdziałów i ich cen.
Jeśli to możliwe — zrzut ekranu.

**3. Sowie Ogrody — „więcej plansz”.** Czy chodzi o nowe rozdziały ogrodu z nowym wyglądem (proponuję: Palmiarnia,
Dżungla, Ogród japoński, Księżycowy ogród)? Na początek 4 — czy więcej?

**4. Sowie Ogrody — tło po zakończeniu.** (A) sam wybierasz tło z ukończonych rozdziałów; (B) po każdym Wielkim
Przesadzaniu ogród znów przechodzi przez wszystkie tła od parapetu; (C) oba — proponuję C.

**5. Łącz i Hoduj**

- a) Nowe poziomy ponad złotymi roślinami: „Diamentowa” (6.) i „Tęczowa” (7.) — mogą być?
- b) Nowe rośliny — proponuję Storczyk, Słonecznik, Truskawkę i Lotos. Inne życzenia?
- c) „Więcej rozwinięć” — czy chodzi o nowe pomieszczenia szklarni (po odnowieniu 10 nie ma już na co wydawać
  gwiazdek)?
- d) Liście w tej grze dziś do niczego nie służą. Czy zrobić „Kram ogrodnika”, gdzie kupuje się za nie nasiona, kózki
  i ozdoby szklarni?

**6. Sowia Ucieczka — jak często humbak?** (A) mniej więcej raz na krainę, czyli co ok. 1000 m — proponuję; (B) raz
na dwie krainy; (C) najwyżej dwa razy w całym biegu.

**7. Sowa w Chmurach**

- a) Jaki jest Twój rekord wysokości? (menu → zakładka „Sowa” → „Rekordy” → Sowa w Chmurach) — od tego zależy, na
  jakiej wysokości będą nowe strefy.
- b) Immaterium z Warhammera jest mroczne (demony) i należy do firmy Games Workshop — nie możemy kopiować ich znaków
  ani postaci. Proponuję własną, kolorową „krainę ponad kosmosem” w stylu gry. Czy nazwa „Immaterium” może zostać,
  czy wolisz inną (np. „Kraina Snów”, „Sowie Zaświaty”)?
- c) Czy przed nią dodać jeszcze „Mgławicę” (kolorowe obłoki gwiazd)?

**8. Galeria**

- a) Ile nowych zdjęć? Proponuję 10.
- b) Masz własne zdjęcia sów (wtedy prześlij je), czy mam wybrać z darmowego serwisu Pexels, jak dotąd?
- c) Zdjęcie nr 2 to to samo co nr 1, tylko przybliżone — podmienię je na inne (zostanie odblokowane). Są jeszcze
  4 pary bardzo podobnych zdjęć (ta sama sowa chwilę później): nr 9 i 25, 10 i 22, 15 i 26, 11 i 12. Podmienić też
  drugie zdjęcie z każdej pary?

**9. Kolejność i wdrażanie.** Czy poprawki błędów (Butik, liczby, podpowiedzi, humbak, zdjęcie nr 2) mogą trafiać na
stronę od razu, jedna po drugiej? Które nowości najpierw: Ogrody, Łącz i Hoduj czy Sowa w Chmurach? Czy nowe treści
wolisz najpierw obejrzeć na obrazkach (proponuję), czy pod osobnym adresem, zanim trafią do gry?

---

## 7. Odpowiedzi właściciela i zmiany planu (2026-11-01)

| Pytanie | Odpowiedź | Co zmienia w planie |
|---|---|---|
| 1a | tylko na telefonie | — |
| 1b | „najpierw wchodziłam do menu głównego. Tam przez chwilę był nowy kolor, a potem wracał stary” | kolor wracał **na tej samej stronie menu**, bez wejścia do gry — główną przyczyną jest punkt 3 z 3.1 (spóźniona odpowiedź serwera podmieniała profil). Potwierdzone testem jednostkowym: na dawnym kodzie nie przechodzi, po poprawce przechodzi |
| 1c | „Płomykówka na przykład nie działa. Mam sufke śnieżną i nie mogę jej teraz zmienić na płomykówke i cofa kupno płomykówki” | test e2e na emulatorze z dokładnie tym przypadkiem (Śnieżna wybrana, zakup Płomykówki, ponowne wejście do menu) |
| 1d | „Dej.” | 50 piórek jednorazowo dla profilu z zakupem gatunku sprzed poprawki |
| 2 | (B) ostatnich roślin w ogóle nie da się zobaczyć | to **błąd**, nie tylko wygoda; najbardziej prawdopodobne: lista budowana od nowa 2 razy na sekundę przy „Sowie zakupowej” (iPhone przerywa wtedy przewijanie) i bardzo małe okno listy — P3 bez zmian w treści, wyżej w kolejności |
| 3 | „Tak. Dużo plansz.” | P4: więcej niż 4 nowe rozdziały (np. 8), dodawane etapami |
| 4 | (A) | P3.3: tylko wybór tła z ukończonych rozdziałów w zakładce Kolekcja (bez tła „podróży”) |
| 5a–d | tak, tak (+ „Chcę baobaba też”), tak, tak | P5: 5 nowych roślin — Storczyk, Słonecznik, Truskawka, Lotos i **Baobab**; poziomy 6–7, pomieszczenia 11–16, Kram za liście |
| 6 | raz na krainę | P2.3: ustawienie B (150 liści, bąbelki co 900–1500 m, 600 m przerwy po rejsie) |
| 7a | 3400 m | nowe strefy zaczynają się niedaleko rekordu (od ok. 1900 m, co ok. 400 m), dalsze są celem na później |
| 7b | „Sowie zaświaty i żeby było spooky 😁” | najwyższa strefa: **Sowie Zaświaty** — straszno-zabawna (duszki-sówki, mgła, świece, nietoperze), w stylu gry, bez prawdziwej grozy |
| 7c | tak | Mgławica jako pierwsza strefa po Kosmosie |
| dodatkowo | „tła inspirowane mitologiami świata: nordycka, egipska, grecka, japońska, aztecka, chińska, hinduska. Motyw snów, zaświatów i tak dalej” | P6: strefy mitologiczne między Mgławicą a Sowimi Zaświatami — krajobrazy, budowle i symbole (np. tęczowy most i zorza, piramidy i łódź słońca, kolumny i obłoki Olimpu, bramy torii i lampiony, schodkowe piramidy i nagietki, smoki z chmur i pałac, lotos i góra Meru), **bez wizerunków bóstw**, z szacunkiem dla wierzeń |
| 8a–c | 10 zdjęć; „Zaskocz mnie i sam wgraj”; podmiana par — tak | P2.4: nowe zdjęcia pod numerami 2, 12, 22, 25 i 26; P7: 10 nowych zdjęć z Pexels |
| 9 | „Mogą jedna po drugiej. Najpierw sowie ogrody, potem sowa w chmurach, potem dowolność. Od razu pracuj na stronie o ile nie skasuje to postępu.” | kolejność: **P1 → P2 → P3 → P4 → P6 → P5 → P7 → P8**, każdy krok od razu na `main` po zielonych testach; zasada „nic nie ginie” (rozdział 2) bez zmian |
| dodatkowo | „Jeżeli potrzebujesz innych testów to przygotuj nowy plik w Analizy (prostym językiem) i pisz krok po kroku co klikać i co powinno się dziać.” | [`TESTY_NA_TELEFONIE.md`](TESTY_NA_TELEFONIE.md) — testy po każdej poprawce |

**Poprawiona kolejność etapów:**

```
P1 Sowi Butik (G3) → P2 szybkie poprawki (O5, L4, U1, G5) → P3 Ogrody: lista roślin i wybór tła (O4, O7)
 → P4 Ogrody: dużo nowych plansz, roślin i ulepszeń (O2, O3, O6) → P6 Sowa w Chmurach: Mgławica, strefy
 mitologiczne, Sowie Zaświaty (C2) → P5 Łącz i Hoduj z Baobabem (L2, L3, L5) → P7 Galeria (G4) → P8 zamknięcie
```

---

## Załącznik A. Jak mierzyłem

Wszystko na kopii roboczej w kontenerze, bez połączenia z produkcyjną bazą; skrypty pomiarowe nie są częścią
repozytorium.

- **Ogrody (O4, O5):** lokalny serwer, Chromium z Playwright na profilach iPhone SE, iPhone 13 (pion i poziom)
  i Android 360 × 800, `?cloud=memory`, urządzenie odblokowane w skrypcie startowym testu. Wszystkie rozdziały otwarte
  hakami testowymi gry (`SowieOgrody.give`, `buy`, `tap`, `advance`); pomiar okna listy (`getBoundingClientRect`),
  przewinięcie do końca, przewijanie palcem (zdarzenia dotyku CDP), 10 stuknięć „Kup” z „Sową zakupową” i bez,
  licznik przebudów listy (`MutationObserver`). Liczby — `formatNumber` wywołana w Node.
- **Łącz i Hoduj (L4):** ta sama metoda; 25 podpowiedzi z kodu gry (z najdłuższymi imionami i nazwami) wstawionych do
  paska; ucięcie = `scrollWidth > clientWidth`.
- **Sowia Ucieczka (U1):** logika gry (`createRun`) w Node, tryb bez trafień (`safe`), 3 poziomy trudności × 4 ziarna,
  bieg do 5000 m; „dobry gracz” = stały efekt Kózki Magnes; warianty ustawień na kopii `config.js` w katalogu
  roboczym, przerwa po rejsie emulowana w symulacji.
- **Galeria (G5):** zdjęcia w odcieniach szarości 160 × 120; dla każdej pary szukanie skali 1,0–2,25 i przesunięcia
  kadru, przy których fragment jednego zdjęcia najlepiej pasuje do drugiego; miara — znormalizowana korelacja
  (1 = identyczne). Kontrola: pary zupełnie różnych zdjęć dały 0,40–0,53.
