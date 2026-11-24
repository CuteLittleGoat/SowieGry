# Stan prac — 2026-11-24

Podsumowanie dla właściciela: co jest zrobione, co zostało, jakie są decyzje do podjęcia i na czym polegają problemy
z testami automatycznymi. Szczegóły techniczne: `docs/Documentation.md`; plany: `ANALIZA_3_Plan_prac.md` (etapy
E0–E10) i `ANALIZA_4_Uwagi_z_testow_poprawki_i_rozbudowa.md` (etapy P1–P8); uwagi z testów: `UWAGI_WLASCICIELA.md`;
testy na telefonie krok po kroku: `TESTY_NA_TELEFONIE.md`.

**W skrócie (2026-11-02):** wszystkie 15 uwag z testów z 1 listopada są zrobione (etapy P1–P7) i są na stronie
(https://cutelittlegoat.github.io/SowieGry/). Teraz: Twoje testy na telefonie według
[`TESTY_NA_TELEFONIE.md`](TESTY_NA_TELEFONIE.md). Zadanie 9.5 zamknięte według Twoich decyzji (punkt 3.1): sprzątanie
starej pamięci telefonu (b) i stare adresy gier (a) usunięte — gry otwiera się z menu.
Testy automatyczne w GitHubie od rana 2 listopada nie mogły wystartować, bo GitHub zmienił system na swoich
maszynach — poprawione (punkt 4.5); gry nie miały z tym nic wspólnego.

**2026-11-11:** uwaga O8 (Sowie Ogrody — „rośliny były duże i przesuwały się w linii…”) zrobiona według Twojej
propozycji: wszystkie rośliny w jednej linii, duże i bez zmniejszania, strzałki po bokach ogrodu i przesuwanie palcem
(punkt 0.1) — jest już na stronie (po aktualizacji odśwież ją dwa razy). Do sprawdzenia na telefonie: test O5
w [`TESTY_NA_TELEFONIE.md`](TESTY_NA_TELEFONIE.md).

**2026-11-15:** uwagi O9–O12 (Sowie Ogrody) zrobione (punkt 0.2): 8 nowych rozdziałów — krainy fantazji od Ogrodu
czarownicy po Drzewo świata — z 16 roślinami (m.in. belladonna i mandragora), każda z 43 roślin wygląda inaczej
(także Monstera … Drzewko złotych liści), każdy nowy rozdział ma trzy ulepszenia i nawozy, a w drzewku prestiżu są
dwie nowe gałęzie ulepszeń za nasiona: „Magia” i „Przyjaciele”. Jest na `main` i na stronie (po aktualizacji odśwież
ją dwa razy). Do sprawdzenia na telefonie: test O6 w [`TESTY_NA_TELEFONIE.md`](TESTY_NA_TELEFONIE.md).

**2026-11-22:** dwie nowe analizy — [`ANALIZA_5_Nowa_gra_Sowie_Trojki_match3.md`](ANALIZA_5_Nowa_gra_Sowie_Trojki_match3.md)
(nowa gra „match 3” Sowie Trójki z Sówką kibicującą z boku planszy) i [`ANALIZA_6_Wydajnosc_lagi.md`](ANALIZA_6_Wydajnosc_lagi.md)
(dlaczego gry „lagują”, gdy dużo się dzieje). **Tego samego dnia przyszły Twoje decyzje** (wszystko według
rekomendacji; telefon użytkownika: Redmi Note 10 Pro, MIUI Global 14.0.7, Chrome) i kolejność prac:
1) dokumentacja, 2) analiza Sowiej Dziupli, 3) poprawki wydajności, 4) nowa gra jako podgląd — w jednym zadaniu
i jednym PR na `main` (punkt 0.3). **Dla Ciebie teraz:** nowe reguły Firestore do skopiowania są w Analizie 5,
Załącznik B — możesz je opublikować od razu (to bezpieczne), potem napisz „reguły opublikowane”.

**2026-11-23:** krok 4 zrobiony (punkt 0.5): nowa gra **Sowie Trójki jako podgląd** — 45 poziomów w trzech
rozdziałach, Sówka na gałęzi obok planszy cieszy się z każdego combo (aż do salta i lotu nad planszą), moce, przeszkody
Pracu i Amic, jajka, Sowia pomoc, Humbaczy Finał, bez żyć. Otwierasz ją adresem **`SowieTrojki/`**
(https://cutelittlegoat.github.io/SowieGry/SowieTrojki/ — po włączeniu zmian na `main`); w menu jeszcze jej nie ma,
wszystkie poziomy są otwarte, a postęp **nie zapisuje się w bazie** (Twoje zapisy z innych gier są bezpieczne).
**Galeria (G7):** 15 nowych zdjęć — sowy, kozy, humbaki i rośliny ozdobne — i filtr rodzaju zdjęć. Wszystko idzie
jednym PR na `main`. **Dla Ciebie:** testy T1–T6 i G3 w [`TESTY_NA_TELEFONIE.md`](TESTY_NA_TELEFONIE.md), a gdy podgląd
Ci się spodoba — „akceptuję podgląd” i (jeśli jeszcze nie) „reguły opublikowane”; wtedy dodam kartę gry w menu i zapis
postępu (etap M5).

**2026-11-23 (później):** testy T1–T6 i G3 zrobione — wszystko działa, reguły z grą `trojki` opublikowane, podgląd
Sowich Trójek zaakceptowany. **Przeniesienie do nowego projektu Firebase `sowiegry-1e1f9`** (Twoja prośba, darmowy
plan): skrypt kopii `scripts/kopia-firestore.mjs` (kopia zapasowa i przeniesienie przez REST API — w starej bazie tylko
odczyt, w nowej tylko tworzenie brakujących dokumentów), reguły nowego projektu (tylko SowieGry), kopia 49 / 49
dokumentów zgodna 1:1, aplikacja przełączona na nowy projekt (`main`). **Stara baza nietknięta** do Twojej decyzji.
Plan i kroki: [`PRZENIESIENIE_FIRESTORE.md`](PRZENIESIENIE_FIRESTORE.md). **Dla Ciebie:** test M1
w [`TESTY_NA_TELEFONIE.md`](TESTY_NA_TELEFONIE.md). Następnie: Sowie Trójki w menu i z zapisem (etap M5 — w toku).
Test M1 zaliczony tego samego dnia (nowe urządzenie z hasłem, stary postęp widoczny, bieg i zmiana stroju zapisane
w nowej bazie; stara baza bez zmian).

**2026-11-23 (M5):** **Sowie Trójki są w menu i zapisują postęp** (punkt 0.6) — szósta karta „Las”, zapis w bazie
(otwarte poziomy, gwiazdki; zapisy z dwóch telefonów łączą się — nic się nie cofa), „Jak grać?” w menu, zadania
dnia i osiągnięcia Sowiej Akademii, „Rekordy”, zdjęcia Galerii 56–58. Jest na `main` i na stronie (odśwież ją dwa
razy). **Dla Ciebie:** testy T7–T9 w [`TESTY_NA_TELEFONIE.md`](TESTY_NA_TELEFONIE.md).

**2026-11-23 (Sowia Farma i testy w GitHubie):** nowa analiza
[`ANALIZA_8_Nowa_gra_Sowia_Farma.md`](ANALIZA_8_Nowa_gra_Sowia_Farma.md) z makietą
([`ANALIZA_8_farma_makieta.png`](ANALIZA_8_farma_makieta.png)) — duża, przytulna gra farmerska po Sowiej Dziupli:
pole, ogród, szklarnia i rośliny ozdobne w domu, dzień bez zegara i bez staminy (kończy go sen — także na gałęzi),
pogoda z prognozą w telewizorze, miasteczko z kozami, humbakiem i sowami, ekwipunek, ulepszenia, gołębie i dziki
do przepędzania bez walki; plan F0–F10 (ok. 44–50 dni pracy) i **16 pytań** w rozdz. 20. **Testy w GitHubie** nie
były zawieszone (punkt 0.7): przebieg 265 doszedł do testu 1351 z 1364, gdy został anulowany — trwa po prostu ok.
55 minut; czerwony wynik dawał **jeden test Sowich Trójek w WebKit** (przeładowanie strony) — poprawiony w teście,
gry bez zmian. **Dla Ciebie:** odpowiedzi na pytania Analizy 8 (w wolnej chwili — budowa i tak po Dziupli).

**2026-11-24 (Wypluffki i decyzje):** nowa analiza [`ANALIZA_7b_Mikroplatnosci.md`](ANALIZA_7b_Mikroplatnosci.md) —
**Wypluffki**, czyli udawane mikropłatności jako parodia: wspólny Sowi Butik (piórka za granie, Wypluffki od admina —
tylko wygląd), „Doładuj Wypluffki” z obrazkiem Sówki robiącej „HU HU!” na kozę i panel admina z hasłem `KoziAdmin`.
Twoje odpowiedzi do Analiz 7, 7b i 8 są wpisane w ich rozdziały z pytaniami. **Kolejność:** testy w GitHubie w dwóch
częściach → **Sowia Dziupla z Wypluffkami** → Sowia Farma → audyt kodu (punkt 0.8). **Budowę zaczynam dopiero na Twoje
polecenie** („Czekaj na moje polecenie”). Jeden gracz i jeden admin — bez zaawansowanych zabezpieczeń. W przyszłości
w panelu admina: kopia zapasowa z Firestore i przywracanie z pliku (W10).

## 0. Poprawki po testach z 2026-11-01 (etapy P1–P8)

Diagnoza i plan: [`ANALIZA_4_Uwagi_z_testow_poprawki_i_rozbudowa.md`](ANALIZA_4_Uwagi_z_testow_poprawki_i_rozbudowa.md);
uwagi w tabeli „Uwagi z testów — 2026-11-01” w `UWAGI_WLASCICIELA.md` — wszystkie 15 mają stan ✅ z numerem commita.
Kolejność według Twojej odpowiedzi: P1 → P2 → P3 → P4 → P6 → P5 → P7 → P8.

| Etap | Co | Uwagi | Commit na `main` |
| --- | --- | --- | --- |
| P1 | Sowi Butik: zakup i wybór koloru sowy się nie cofają, zapis od razu, 50 piórek przeprosin | G3 | c38cbef, 1e9771c |
| P2 | duże liczby w Ogrodach („150 mln” zamiast „15 mln”), podpowiedzi w Łącz i Hoduj w dwóch wierszach, humbak mniej więcej raz na krainę, nowe zdjęcia zamiast podobnych | O5, L4, U1, G5 | ecf6e36, c25dafb, 8583f63, aad4394 |
| P3 | Sowie Ogrody: lista roślin do samego końca, „Rozwiń listę”, wybór tła ogrodu | O4, O7 | 8ba7f5c |
| P4 | Sowie Ogrody: 8 nowych rozdziałów (7–14), 16 roślin, 24 ulepszenia, 26 nawozów, gałąź „Słońce” | O2, O3, O6 | 57baf87 |
| P6 | Sowa w Chmurach: od 1900 m Mgławica, 7 krain z mitów świata i Sowie Zaświaty | C2 | 803ab38 |
| P5 | Łącz i Hoduj: bezpiecznik zapisu, poziomy 6–7 (diamentowy, tęczowy), 5 nowych roślin z Baobabem, 4 hybrydy, 6 pomieszczeń, Kram ogrodnika | L2, L3, L5 | 822c60d, 8f351ef |
| P7 | Galeria: 10 nowych zdjęć (nr 31–40) za nowe krainy, rozdziały, rośliny i pomieszczenia | G4 | a549fdb, 651d539 |
| — | testy w GitHubie na maszynie z Ubuntu 24.04 (punkt 4.5) | — | f7dbb86 |
| P8 | zamknięcie: ten plik, stan uwag, pytanie o zadanie 9.5 (punkt 3.1) | — | commit „P8: …” z 2026-11-02 |
| 9.5 | Twoje decyzje: „b — usuń” — SowieGry niczego nie kasuje z pamięci przeglądarki (usunięte jednorazowe sprzątanie dawnych zapisów); „stare adresy gier (jeżeli już nie są potrzebne) też usuń” — usunięte `SowaRunner/`, `Sowa3/`, `SowaJumper/`, `SowiaSzklarnia/` i `SowieOgrody/nowa.html` | — | 1711584, 4bb58ca |

**Zmiany niczego nie kasują z postępu.** Każda zmiana tylko dopisuje: nowe pola zapisu dostają wartości domyślne,
identyfikatory roślin, rozdziałów, pomieszczeń i zdjęć są tylko dopisywane na końcu (żadnego nie usunąłem ani nie
zmieniłem), a gra, która trafi na zapis z nowszej wersji (np. z drugiego telefonu ze świeższą wersją), nie kasuje
nieznanych rzeczy, tylko je odkłada (Łącz i Hoduj — schowek, Galeria — nieznane zdjęcia zostają w zapisie). Do
produkcyjnej bazy nic nie zapisywałem ręcznie ani testami — testy działają na emulatorze (`demo-sowiegry`) albo
w pamięci.

Każdy etap przed wypchnięciem przeszedł u mnie pełny `npm test` (składnia, ESLint, Prettier, HTML, testy jednostkowe
— dziś 320, reguły Firestore i testy przeglądarkowe w Chromium na emulatorze — dziś ok. 600).

### 0.1. Uwaga z 2026-11-11 (O8)

| Uwaga | Co | Commit na `main` |
| --- | --- | --- |
| O8 | Sowie Ogrody: wszystkie posiadane rośliny w jednej linii (wcześniej najwyżej 12 w dwóch rzędach), o 20% większe i nigdy nie maleją; strzałki ‹ › po bokach ogrodu, przesuwanie palcem z rozpędem (na komputerze także mysz, klawisze ← → i kółko); nowa roślina i roślina pod ciężarówką Amic same wjeżdżają w widok; przesunięcie palcem nie zbiera liści | 8db8ec1 |

Zapis gry bez zmian — położenie półki nie jest zapisywane (po wejściu zawsze koniec linii), postęp zostaje.
Zmiana jest na `main` (2026-11-11, na Twoją prośbę „Wrzuć zmiany na Main”), więc też na stronie. Przed
wypchnięciem sprawdzone u mnie: składnia, ESLint, Prettier, HTML, testy jednostkowe, reguły Firestore i testy
przeglądarkowe w Chromium (5 profili telefonów i komputer, emulator Firestore); WebKit (Safari) sprawdzą testy
w GitHubie.

### 0.2. Uwagi z 2026-11-15 (O9–O12)

Uwagi od użytkownika (dosłownie w [`UWAGI_WLASCICIELA.md`](UWAGI_WLASCICIELA.md), tabela „Uwagi — 2026-11-15”),
zrobione od razu na Twoją prośbę („Zmiany wrzuć na gałąź Main. Kontynuuj pracę.”).

| Uwaga | Co | Commit na `main` |
| --- | --- | --- |
| O9 | 8 nowych rozdziałów 15–22 — krainy fantazji: Ogród czarownicy, Nawiedzony ogród, Zaczarowany las, Smocza dolina, Kryształowa grota, Łąka wróżek, Podniebny ogród, Drzewo świata — każdy z własnym, ruchomym tłem (np. chatka czarownicy z kociołkiem, duszki i nagrobki, wulkan i smok, latające wyspy); 16 roślin: rośliny czarownic i z legend (Belladonna, Mandragora, Tojad, Kwiat paproci, Naparstnica, Muchomor) i zmyślone (Upiorna dynia, Smocze drzewo, Ognisty kwiat, Kryształowa róża, Świecący dzwonek, Tęczowy tulipan, Chmurnik, Sowi storczyk, Feniksowy kwiat, Drzewo życia); dłuższe skróty liczb (do „decyld”) | cafc20d |
| O10 | każda z 43 roślin ma własny rysunek (nowy plik `SowieOgrody/ogrod/plants.js`), żaden się nie powtarza — 11 pierwszych roślin (wcześniej ta sama roślinka w innych kolorach) i rośliny, które dzieliły kształt (Palma / Daktylowiec, Bambus / Lawenda, Sakura / Klon / Ostrokrzew, Grzybienie / Wiktoria); rośliny rosną i bujnieją przy 10, 25, 50 i 100 sztukach; część się rusza (kołysanie, migotanie, mruganie, spadające liście) | cafc20d |
| O11 | po trzy ulepszenia w każdym nowym rozdziale (rośliny rozdziału ×2, wszystkie rośliny, efekt specjalny) i nawozy nowych roślin; nowe rodzaje efektów: więcej nasion (Eliksir obfitości), rzadsza ciężarówka Amic (Upiorny strach na wróble), częstsze złote kózki (Czterolistna koniczyna), dłuższa Zatoka Humbaka (Echo groty) | cafc20d |
| O12 | nowe ulepszenia za nasiona — dwie gałęzie drzewka prestiżu: „Magia” (Zaklęcie wzrostu — rośliny krain fantazji szybciej, Kocioł nasion — więcej nasion, Czar dojrzewania — produkcja ×2 także przy 50 i 10 sztukach) i „Przyjaciele” (Złota obroża — mocniejsze premie złotej kózki, Latarnia humbaka — dłuższa Zatoka, Bystra sowa zakupowa — Sowa zakupowa kupuje szybciej) | cafc20d |

**Tempo gry:** ceny nowych roślin dobrałem symulatorem długiej gry (bot gra aktywnie, bez przerw): każdy z rozdziałów
15–22 to ok. 5–7 h, razem ok. 42–51 h po Księżycowym ogrodzie (rozdziały 7–14 z gałęzią „Magia” — ok. 30–35 h,
wcześniej ok. 43 h). Przy prawdziwej grze z przerwami potrwa to dłużej, ale ogród rośnie też, gdy gra jest
zamknięta. Jeśli tempo będzie za wolne albo za szybkie — wystarczy napisać.

**Nic nie ginie:** zapis bez zmian (`saveVersion` 3) — rozdziały, rośliny, ulepszenia i węzły drzewka tylko dopisane
na końcu list. Kto ukończył Księżycowy ogród, przy następnym wejściu ma rozdział 15 (Ogród czarownicy). Zdjęcie
Galerii nr 36 dalej za 14 rozdziałów (opis zmieniony na „Ukończ 14 rozdziałów Sowich Ogrodów — do Księżycowego
ogrodu włącznie”) — kto je ma, zachowuje je.

**Sprawdzone u mnie przed wypchnięciem:** składnia, ESLint, Prettier, HTML, testy jednostkowe (333, w tym nowe:
dane i rysunki 43 roślin, nowe ulepszenia, drzewko „Magia” i „Przyjaciele”, symulator 22 rozdziałów), reguły
Firestore i testy przeglądarkowe w Chromium na 5 profilach telefonów i komputerze (emulator Firestore), w tym nowy
test: ogród po 14 rozdziałach przechodzi do Ogrodu czarownicy bez strat. WebKit (Safari) sprawdzą testy w GitHubie.
Rysunki roślin i tła obejrzałem na zrzutach ekranu i zmierzyłem: najdroższa roślina rysuje się w ok. 0,1 ms.

**Testy w GitHubie — przebieg 258 (6844d4f): ✅** 1179 testów w Chromium i WebKit (44,8 min). Wszystkie testy Sowich
Ogrodów — także nowe (Ogród czarownicy po 14 rozdziałach, półka z 43 gatunkami) — przeszły od razu, również w WebKit
(silnik Safari z iPhone'a). Cztery testy przeszły dopiero w powtórce — to znane niestabilne testy WebKit z innych gier
(punkt 4.3 d), niezwiązane z tą zmianą: Sowia Ucieczka — start i skok (iPhone 13 pionowo i poziomo) oraz wyzwanie
dnia (iPhone 13), Łącz i Hoduj — Kram ogrodnika (iPhone 13 poziomo; przycisk Kramu nie pojawił się w 30 s).

### 0.3. Zadanie z 2026-11-22 (N1, G6, D1, G7) — decyzje i kolejność prac

Prośba i zgłoszenie dosłownie: [`UWAGI_WLASCICIELA.md`](UWAGI_WLASCICIELA.md), tabela „Prośby i uwagi — 2026-11-22”.

| # | Co | Wynik analizy | Stan |
| --- | --- | --- | --- |
| G6 | „jak się za dużo dzieje na ekranie to gra laguje” (zwłaszcza Sowie Ogrody; „zawiesza się przesuwanie roślin”) | przyczyną jest rysowanie całego obrazu od nowa co klatkę w podwójnej ostrości (logika i panel są lekkie — bez rysowania gra ma 60 kl./s nawet na „wolnym telefonie”); Ogrody na symulowanym średnim telefonie: 43 kl./s w spokoju, 24–28 w Zatoce Humbaka; Łącz i Hoduj z pełną planszą 18–24; Sowie Tory 17 (na słabszym telefonie gra zwalnia o ok. 12%); próbne poprawki dają w Ogrodach 55–60 kl./s, w Łącz i Hoduj 49–55 | ✅ odpowiedzi 2026-11-22 (rozdz. 10 Analizy 6) — ⏳ wdrożenie W0–W8 (krok 3) |
| N1 | nowa gra „match 3” z sową z boku ekranu, reagującą na postępy (radośniej przy combo); kafelki z istniejących grafik, każdy rodzaj z własnym tłem (kolor + kształt) | projekt „Sowie Trójki”: 6 rodzajów kafelków (liście, humbak, kózka, truskawka, storczyk) na tłach różnych kształtów i kolorów, 4 moce i ich połączenia, przeszkody Pracu i Amic, jajka i pisklęta, skala radości Sówki 0–5, Sowia pomoc, 45 poziomów na start, bez żyć i płatności; plan M0–M7 (ok. 3–4 tygodnie) | ✅ decyzje 2026-11-22 (rozdz. 19 Analizy 5) — ⏳ budowa podglądu (krok 4); reguły Firestore do skopiowania: Załącznik B |
| D1 | Sowia Dziupla zamiast menu głównego (tablica korkowa z grami, szafa, Dekorator Dziupli, przedmioty odblokowywane w grach; roślinki z gier na półce w co najmniej 3 miejscach; wygląd dziupli do wyboru) | projekt: Dziupla jako ekran startowy (podgląd, potem przełączenie), ozdoby z postępu w grach i za piórka, zapis w profilu bez zmiany reguł, plan D0–D7 (ok. 10–14 dni) | ✅ analiza 2026-11-22 (`ANALIZA_7_Sowia_Dziupla.md`) — czeka na odpowiedzi (rozdz. 16); budowa jako osobne zadanie po Sowich Trójkach |
| G7 | Galeria: nowe zdjęcia sów, kóz, wielorybów i roślin ozdobnych z Pexels | — | ✅ 2026-11-23 — 15 zdjęć (nr 41–55) i filtr rodzaju w Galerii (punkt 0.5) |

**Kolejność prac (Twoja decyzja) i miejsce wznowienia** — aktualizuję po każdym kroku:

| Krok | Co | Stan |
| --- | --- | --- |
| 1 | dokumentacja: telefon użytkownika i odpowiedzi w Analizie 6 (rozdz. 10, limit 60 kl./s dla ekranu 120 Hz), decyzje w Analizie 5 (rozdz. 19, rozdz. 14.4 zgodny z Analizą 6, pełne reguły w Załączniku B, bramka zapisu 13.1a), styl „mrugająca sówka jako kwiat” (`docs/Documentation.md`, dokumentacja Sowich Ogrodów, Analiza 5 rozdz. 12), `UWAGI_WLASCICIELA.md`, ten plik | ✅ 2026-11-22 |
| 2 | analiza Sowiej Dziupli (`ANALIZA_7_Sowia_Dziupla.md`) z makietą (`ANALIZA_7_dziupla_makieta.png`): tablica korkowa z grami, Szafa, Dekorator, półka z co najmniej 3 roślinkami z gier, wygląd dziupli do wyboru; 8 pytań w rozdz. 16 | ✅ 2026-11-22 |
| 3 | poprawki wydajności W0–W8 (Analiza 6): automat płynności i limit 60 kl./s we wszystkich grach, Ogrody i Łącz i Hoduj warstwami z obrazkami roślin, Zatoka bez ogrodu pod wodą, rekwizyty Torów z obrazków, HUD 10×/s, ustawienie „Płynność” (menu i pauza, zapamiętane na urządzeniu), propozycja oszczędzania baterii, licznik `?perf=1`, skrypt `scripts/perf-bench.cjs`, testy `plynnosc` (jednostkowe i e2e), dokumentacja; pomiar niżej (0.4) | ✅ 2026-11-22 (8dbc30f, 79eb786, dokumentacja) |
| 4 | nowa gra Sowie Trójki jako podgląd (Analiza 5, M1–M6), nowe zdjęcia Galerii | ✅ 2026-11-23 (punkt 0.5) |
| — | jeden PR na `main` z całością (pełny `npm test` u mnie, testy w GitHubie zielone) | ✅ 2026-11-23 ([CuteLittleGoat/SowieGry#14](https://github.com/CuteLittleGoat/SowieGry/pull/14), 0c7292f) |
| M5 | Sowie Trójki w menu i z zapisem, po akceptacji podglądu i publikacji reguł (punkt 0.6) | ✅ 2026-11-23 |

**Bezpieczeństwo produkcji** (Twoja prośba z 2026-11-22): testy tylko na emulatorze i w pamięci; zapis postępu
i jego format bez zmian w krokach 1–3; nowa gra niczego nie zapisuje do bazy, dopóki nie potwierdzisz publikacji
reguł (bramka zapisu — Analiza 5, rozdz. 13.1a).

### 0.4. Krok 3 — poprawki wydajności (W0–W8) — wynik

Co zrobione: [`ANALIZA_6_Wydajnosc_lagi.md`](ANALIZA_6_Wydajnosc_lagi.md), rozdział 11; opis techniczny:
`docs/Documentation.md` („Płynność — Analiza 6”) i dokumentacje gier. **Zapis postępu bez zmian** — nowe ustawienie
„Płynność” leży tylko w pamięci telefonu (wpis urządzenia), nie w bazie.

Pomiar w Chromium bez karty graficznej (profil Twojego telefonu: 393 × 873 px, gęstość 2,75; procesor spowolniony
4 razy — „średni telefon”), `node scripts/perf-bench.cjs`, klatki na sekundę (60 = płynnie):

| Gra — scenariusz | Przed | Po |
| --- | --- | --- |
| Sowie Ogrody — stukanie / zdarzenia / wszystko naraz | 33–38 | 56–57 |
| Sowie Ogrody — przesuwanie półki | 42–43 | 59 |
| Sowie Ogrody — Zatoka Humbaka | 24–28 | 59 |
| Łącz i Hoduj — pełna plansza / przeciąganie | 24 / 22 | 43 / 42 |
| Sowie Tory — bieg | 17–21 | 38–41 (przy ×6: 12 → 17, gra nie gubi już czasu) |
| Sowia Ucieczka, Sowa w Chmurach | 37–48 | 44–49 (bez zmian w granicach rozrzutu) |

Wygląd bez zmian (porównanie zrzutów przed / po). Testy u mnie: składnia, ESLint, Prettier, HTML, 341 testów
jednostkowych, reguły Firestore, 598 testów przeglądarkowych w Chromium (5 profili telefonów i komputer, emulator)
przed rekwizytami Torów i 195 po nich (gry, menu, laboratorium) + 14 nowych testów `plynnosc` — wszystkie zielone;
WebKit (Safari) sprawdzą testy w GitHubie. **Dla Ciebie:** testy P1–P3 w [`TESTY_NA_TELEFONIE.md`](TESTY_NA_TELEFONIE.md)
(pomiar licznikiem `?perf=1` na Twoim Redmi — przyślij zrzut ekranu z licznikiem).

### 0.5. Krok 4 — Sowie Trójki (podgląd) i Galeria (G7) — wynik

**Sowie Trójki** — według [`ANALIZA_5_Nowa_gra_Sowie_Trojki_match3.md`](ANALIZA_5_Nowa_gra_Sowie_Trojki_match3.md)
(etapy M1–M6 jako podgląd); instrukcja dla gracza: [`SowieTrojki/docs/README.md`](../SowieTrojki/docs/README.md),
opis kodu: `SowieTrojki/docs/Documentation.md`.

- **Gra:** zamiana sąsiednich kafelków (przesunięcie palcem albo dwa stuknięcia, także klawiatura), 6 rodzajów
  kafelków na tłach różnych kształtów i kolorów (Liść Monstery, złoty liść, humbak, kózka, truskawka i mrugający
  Sowi storczyk), moce Pióro / Pisklę / Bąbel / Tęczowy liść i 7 połączeń dwóch mocy, przeszkody Pracu i Amic
  (karteczki, skrzynie, kanister, telefon, taśma), jajka do gniazd, dziury w planszy, samo mieszanie bez ruchów.
- **45 poziomów** w 3 rozdziałach (Sowia Łąka, Ogródek Sówki, Staw Humbaka), „piła” trudności; liczba ruchów
  i progi gwiazdek ustawione symulatorem (gracz „rozsądny, nie idealny”); karty „Nowość” przed nowymi rzeczami
  i ręka z podpowiedzią na pierwszych poziomach.
- **Sówka** na gałęzi pod planszą (poziomo — z lewej): 5 stopni radości (podskok → skrzydła → podwójny skok → salto
  z gwiazdkami w oczach → lot nad planszą), dymki (najwyżej raz na 2 s), „hu-hu”, przytulanie pisklęcia, smutek
  tylko na chwilę, sen po 40 s; **Radość Sówki** → **Sowia pomoc** (3 Pióra bez zabierania ruchu).
- **Koniec poziomu:** Humbaczy Finał (pozostałe ruchy → Pióra) i 1–3 gwiazdki; przy ¾ celu prezent +3 ruchy;
  bez żyć — „Spróbuj jeszcze raz” od razu; **Tryb Przytulny** (pauza → Ustawienia) — nie da się przegrać.
- **Ekran:** telefon w pionie (pole planszy ≥ 34 px nawet na 320 × 568), poziomo (Sówka z lewej, cele z prawej),
  pauza i ustawienia wspólne z innymi grami, licznik `?perf=1`. Pomiar płynności (profil Twojego Redmi, procesor
  ×4): ruch za ruchem 54 kl./s, w spoczynku plansza się nie przerysowuje (wątek 56% zamiast 86%).
- **Bezpieczeństwo:** gry nie ma w rejestrze ani w `GAME_IDS`, więc niczego nie zapisuje w bazie; dodatkowo bramka
  zapisu w SowieCloud odrzuca dokumenty gier spoza listy (Analiza 5, rozdz. 13.1a). Test e2e sprawdza na emulatorze,
  że po wygranej w bazie nie ma dokumentu `trojki`.

**Galeria (G7):** zdjęcia nr 41–55 z Pexels (autorzy w `Obrazki/README.md`): 3 sowy gatunków, których w Galerii nie
było (puszczak mszarny, syczek, śnieżna z bliska), 4 kozy, 4 humbaki, 4 rośliny ozdobne (Monstery i storczyki).
Wymagania: 12. poziom Akademii, 12 osiągnięć, rozdziały Sowich Ogrodów (11, 18, 20, wszystkie 22), 40 i 80 złapanych
kózek, 2500 m w Sowie w Chmurach, 15 kózek i 8 hybryd w Łącz i Hoduj, 15 / 30 / 50 rejsów z humbakiem, 3 ukończone
kampanie Sowich Torów (opis każdego w `docs/Documentation.md`). W zakładce „Galeria” drugi rząd filtrów: **Sowy, Kozy,
Humbaki, Rośliny**. Zdjęcia za Sowie Trójki dojdą z kartą gry w menu (M5) — ✅ nr 56–58 (punkt 0.6).

Testy u mnie: ESLint, Prettier, HTML, 369 testów jednostkowych (w tym nowe: plansza, poziomy i symulator, Sówka
i zapis), testy przeglądarkowe Sowich Trójek (8 scenariuszy × 5 profili telefonów), Galerii i menu na emulatorze —
zielone; pełny `npm test` przed PR.

### 0.6. Etap M5 — Sowie Trójki w menu i z zapisem — wynik (2026-11-23)

Po Twojej wiadomości („wszystkie testy z pliku zrobione i wszystko działa. Rules opublikowałem. Wygląd
zaakceptowany.”) i po przeniesieniu bazy do projektu `sowiegry-1e1f9` (reguły nowego projektu mają już grę `trojki`):

- **Menu:** szósta karta **Sowie Trójki** („6. Las”, „Nowe!”) z ruchomym obrazkiem (Sówka i plansza 3 × 3, w której
  znika i spada kolumna liści), rekord „Poziom N · ⭐ M”, „Jak grać?” (7 kart — także w zakładce „Jak grać”),
  „Rekordy” w zakładce „Sowa” (najwyższy poziom, gwiazdki, poziomy na 3 gwiazdki, najlepsze combo, wyklute pisklęta),
  „Powtórz samouczki” obejmuje też karty „Nowość” w Trójkach; wersja demo też ma kartę Trójek (bez zapisu).
- **Zapis:** dokument gry `sowiegry/profil/sowiegry_gry/trojki` (po końcu poziomu i przy przejściu do innej
  aplikacji; tylko gdy coś się zmieniło); na starcie otwarty poziom 1, każda wygrana otwiera następny. **Dwa
  telefony:** gdy drugi telefon zapisze nowszy stan, gra łączy oba (więcej gwiazdek, dalszy poziom, większe liczniki)
  zamiast pytać „Nowszy postęp?” — nic się nie cofa.
- **Sowia Akademia:** zadania dnia „Wygraj 2 poziomy w Sowich Trójkach”, „Zrób combo ×4…”, „Sprowadź jajko do
  gniazda…”; osiągnięcia **Trójkowa sówka** (3 gwiazdki na 15 poziomach) i **Sowie gniazdo** (10 piskląt) — razem 15;
  „Pierwsze kroki” i zdjęcie 26 („Odwiedź każdą z sześciu gier”) liczą też Trójki — kto je już ma, zachowuje je
  (zdobyte osiągnięcia i zdjęcia nigdy się nie cofają).
- **Galeria:** 58 zdjęć — nowe nr 56 pisklę puszczyka (10 wyklutych piskląt), 57 fioletowy storczyk (60 gwiazdek),
  58 kozioł z profilu (wszystkie 45 poziomów); autorzy w `Obrazki/README.md`.
- **Znalezione i poprawione przy M5:** strona gry nie miała znacznika `data-sowie-game`, bez którego Sowia Akademia
  na stronie w ogóle nie powstaje — wizyty i wyniki z Trójek nie liczyłyby się do zadań, osiągnięć ani Galerii.
  Dodane, a test architektury pilnuje znacznika na stronach wszystkich gier; komunikaty Akademii i Galerii są
  w grze widoczne (także nad oknem wygranej).
- **Bezpieczeństwo produkcji:** wszystkie testy tylko na emulatorze i w pamięci (bezpiecznik w testach przerywa każde
  połączenie z prawdziwą bazą); istniejący dokument `sowiegry/meta` nie jest nadpisywany; dzisiejsze zadania dnia
  zostają (są zapisane w profilu), nowa pula zadań działa od następnego dnia.

Testy u mnie: pełny `npm test` — składnia, ESLint, Prettier, HTML, 376 testów jednostkowych, 8 testów reguł i kopii
bazy na emulatorze, 689 testów przeglądarkowych (Chromium: 5 profili telefonów i komputer, emulator Firestore) —
wszystkie zielone. WebKit (Safari) sprawdzą testy w GitHubie po wypchnięciu na `main`.

**Testy w GitHubie (WebKit):** przebiegi 262 (krok 4) i 263 (przeniesienie bazy) skończyły się błędem — nie przez gry,
tylko przez testy zależne od tempa klatek, a WebKit na maszynie GitHuba rysuje czasem 2–3 klatki na sekundę: pomiar
płynności Ogrodów i Łącz i Hoduj (za mało klatek w oknie 1,5 s; automat płynności zmieniał ostrość w trakcie pomiaru),
oczekiwanie 5 s na koniec powitania Sówki w Trójkach, zgubione pierwsze kliknięcie portfela w Łącz i Hoduj. Poprawione
w testach (gry bez zmian): pomiar do co najmniej 6 klatek z przypiętym poziomem automatu, w Trójkach 60 s na test,
15 s na spokój Sówki i dokańczanie animacji hakiem `settle`, w Łącz i Hoduj ponowne stuknięcie portfela, gdy okno nie
pojawi się w 3 s. Opis: `docs/Documentation.md` (`plynnosc.spec.js`), dokumentacje Trójek i Łącz i Hoduj (Testy).

### 0.7. 2026-11-23: Analiza 8 (Sowia Farma) i „zacięte” testy w GitHubie

**Analiza 8 — Sowia Farma (N2):** [`ANALIZA_8_Nowa_gra_Sowia_Farma.md`](ANALIZA_8_Nowa_gra_Sowia_Farma.md) — projekt
gry na podstawie Twojej prośby, atlasu mechanik czterech gier i krótkiego przeglądu w internecie (sterowanie na
telefonie, gry „cozy” bez staminy, sowy-straszaki na gołębie). Makieta (telefon w pionie): farma z podlewaniem
przeciągnięciem palca, dom z gałęzią do spania i telewizorem, miasteczko ze sklepem kóz i targiem humbaka. Bez zmian
w kodzie gier. Plan F0–F10 (ok. 44–50 dni pracy), budowa po Sowiej Dziupli; pytania — rozdz. 20 analizy.

**Testy w GitHubie — co się stało z przebiegiem 265:**

| Przebieg | Commit | Wynik | Co pokazuje log |
| --- | --- | --- | --- |
| 263 | 8c178d5 (przeniesienie bazy) | ❌ | testy płynności i Trójek w WebKit (poprawione w 3bb01ca) |
| 264 | cd42d97 (stan prac M5) | ❌ po 54 min | 1346 przeszło, 12 niestabilnych przeszło w powtórce, **6 nie przeszło**: 5 × „Sowie Trójki: wygrana … po ponownym otwarciu” (wszystkie telefony WebKit) i 1 × pomiar płynności Ogrodów (Pixel 7, WebKit) |
| 265 | 3bb01ca (poprawki testów WebKit) | anulowany po 55 min | **nie był zawieszony** — doszedł do testu 1351 z 1364 (ok. 1 minuta do końca); pomiar płynności już przechodził, ale „Sowie Trójki: wygrana …” znowu nie przeszedł na 5 telefonach WebKit (także w powtórce) |
| 266 | 7a1678a (Twój plik z mechanikami) | ❌ po 48 min | 1354 przeszło (44,7 min testów), 5 niestabilnych przeszło w powtórce, **nie przeszedł tylko** „Sowie Trójki: wygrana …” na 5 telefonach WebKit — potwierdzenie przyczyny |

- **Dlaczego to trwa prawie godzinę:** ok. 1360 testów w Chromium i WebKit na 5 profilach telefonów i komputerze,
  na dwóch procesach — same testy ok. 45–47 minut, instalacja przeglądarek 5–10 minut. Limit to 75 minut, więc
  przebieg, który „kręci się” 55 minut, zwykle jest tuż przed końcem.
- **Przyczyna czerwonego wyniku:** test wygranej w Sowich Trójkach na końcu **przeładowywał stronę**
  (`page.reload`). WebKit zgłasza wtedy przerwane długie zapytania do bazy (emulatora Firestore) jako błędy strony
  („…due to access control checks”), a test wymaga zera błędów. To ten sam znany problem co wcześniej w Sowich Torach
  i w rekordach (punkt 4.3 a) — **gra działa dobrze**.
- **Poprawka (tylko test):** ponowne otwarcie gry w **nowej karcie** tego samego telefonu zamiast przeładowania
  (`tests/e2e/telefon/trojki.spec.js`), jak w `tory.spec.js` i `rekordy.spec.js`. U mnie w Chromium: wszystkie testy
  Trójek przechodzą (18 / 18, iPhone SE i Pixel 7, emulator); WebKit sprawdzi GitHub po wypchnięciu na `main`.
- **Propozycja:** rozdzielić testy w GitHubie na dwie równoległe części (Chromium i WebKit) — ok. 30 minut zamiast
  prawie godziny (Analiza 8, pytanie 16). Nie zmieniam tego bez Twojej zgody. → **2026-11-24: „zostawiam Tobie”** —
  krok T0 przed Dziuplą, z WebKitem tylko na profilach iPhone (punkt 0.8).

### 0.8. 2026-11-24: Wypluffki (Analiza 7b), decyzje do Analiz 7, 7b i 8 i kolejność prac

**Analiza 7b — Wypluffki (W1):** [`ANALIZA_7b_Mikroplatnosci.md`](ANALIZA_7b_Mikroplatnosci.md) — udawane
mikropłatności jako parodia „bez natręctwa”:
- wspólny Sowi Butik: piórka za granie, Wypluffki od admina, a za Wypluffki tylko wygląd;
- „Doładuj Wypluffki” z obrazkiem Sówki robiącej „HU HU!” na kozę (dowód wpłaty do zrzutu ekranu);
- panel admina https://cutelittlegoat.github.io/SowieGry/Admin/ z hasłem `KoziAdmin` w kodzie;
- portfel w nowej kolekcji `sowiegry_wypluffki` z prostymi regułami (jeden gracz i jeden admin — bez zaawansowanych
  zabezpieczeń; sprawdzone na emulatorze);
- w przyszłości w panelu: kopia zapasowa danych z Firestore do pliku i przywracanie z pliku (etap W10).

Bez zmian w kodzie gier.

**Twoje decyzje** (dosłownie w [`UWAGI_WLASCICIELA.md`](UWAGI_WLASCICIELA.md), tabela „Prośby, uwagi i decyzje —
2026-11-24”):

| Analiza | Najważniejsze decyzje | Gdzie |
| --- | --- | --- |
| 7 — Sowia Dziupla | Dziupla zastępuje menu (bez „Prostego widoku”); tablica w pionie; półka 3 + 2 miejsca (także za Wypluffki); ozdoby za granie, piórka i Wypluffki; automatyczny widok za oknem; demo tylko z grami; budowa na Twoje polecenie; doniczki stoją na półce (D1a) | rozdz. 16 |
| 7b — Wypluffki | hasło panelu `KoziAdmin` w kodzie (bez maili); „Banki nie akceptują wypluffków”; „Parodia, ale bez natręctwa”; kolejka hu-hu, pakiety i ceny, jajko-niespodzianka, „Udostępnij obrazek”, VIP — tak; rzeczy do Farmy dopiero po Farmie; prezent powitalny; bez zaawansowanych zabezpieczeń; w przyszłości kopia zapasowa i przywracanie w panelu | rozdz. 19 |
| 8 — Sowia Farma | waluta „Dziupaki”; pory roku z furtką (rośliny sezonowe, mrozy); pełny plecak — ostrzeżenie i opróżnianie przez gracza; jakość plonów i nawozy jakości (u kozy i za Wypluffki); przyjaźnie w drugim etapie; etapy i testy według mnie; po pierwszej wersji audyt kodu (A1 → etap F11) | rozdz. 20 |

**Kolejność prac** (Twoja decyzja: „Proponuję zacząć od wdrożenia mikropłatności i dziupli. Farmę dodamy później.”)
— **start na Twoje polecenie** („Pracę nad wdrożeniem sklepu i butiku zaczniemy potem. Czekaj na moje polecenie.”);
aktualizuję po każdym kroku:

| Krok | Co | Stan |
| --- | --- | --- |
| T0 | testy w GitHubie w dwóch równoległych częściach (jakość + Chromium, WebKit), WebKit tylko na profilach iPhone — ok. 25 min zamiast 55 (Analiza 8, rozdz. 17.4) | ⏳ czeka na Twoje polecenie |
| D + W | Sowia Dziupla z Wypluffkami — etapy D1–D7 i W1–W9 przeplatane ([Analiza 7b, rozdz. 17.2](ANALIZA_7b_Mikroplatnosci.md#172-kolejność-razem-z-sowią-dziuplą-analiza-7-rozdz-15)): logika i reguły → panel admina (Ty publikujesz reguły) → scena Dziupli → „Doładuj Wypluffki” → Szafa, Dekorator i Butik → grafiki do akceptacji → wygląd w grach → przełączenie menu po Twoich testach | ⏳ |
| W10 | kopia zapasowa danych z Firestore do pliku i przywracanie z pliku w panelu admina ([Analiza 7b, rozdz. 8.3](ANALIZA_7b_Mikroplatnosci.md)) | ⏳ w przyszłości, na Twoje polecenie |
| F | Sowia Farma — F0–F10 ([Analiza 8](ANALIZA_8_Nowa_gra_Sowia_Farma.md), rozdz. 19), z rzeczami za Wypluffki (W8) | ⏳ później |
| A1 | audyt wszystkich plików i komentarze w kodzie (Analiza 8, etap F11) | ⏳ po pierwszej wersji Farmy |

**Dla Ciebie teraz:** nic. Reguły z portfelem (Analiza 7b, Załącznik B) opublikujesz w etapie W2, gdy o to poproszę;
potem testy B1–B7 i D1–D5 na telefonie (dopiszę je do `TESTY_NA_TELEFONIE.md` przy budowie).

## 1. Co jest zrobione — plan E0–E10 (stan z 2026-10-06)

Wszystkie etapy planu E0–E10 są na gałęzi `main`, więc są też na stronie
(https://cutelittlegoat.github.io/SowieGry/). Zadanie 9.5 było odłożone do listopada; zamknięte 2026-11-02 (punkt 3.1). Od 6 do
31 października w kodzie gier nic się nie zmieniało (tylko porządki w dokumentacji, 18b09d7) — trwały Twoje
testy; poprawki po nich są w rozdziale 0.

| Etap | Co | Commit na `main` |
| --- | --- | --- |
| E5f | Sowie Tory zastępują Sowa3 (stary adres przekierowuje) | a3c6b09 |
| E6f | Sowa w Chmurach zastępuje SowaJumper | e2d8d68 |
| E7e | nowa odsłona Sowich Ogrodów zastępuje dawną grę (`nowa.html` przekierowuje) | 5c30411 |
| E8e | Łącz i Hoduj zastępuje Sowią Szklarnię | f66fb24 |
| E9a | usunięcie dawnego interfejsu gier (SowieCore i moduły pomocnicze) | 2437199 |
| E9b | Sowia Akademia na zdarzeniach gier: zadania dnia (także „z dowolnej gry”), zadanie tygodnia, 13 osiągnięć | 821cb70 |
| E9c | Sowi Butik: 6 gatunków sów, 4 nowe stroje, dłuższe działanie kózek | 7015597 |
| E9d | nowe wymagania 5 zdjęć Galerii (osiągnięcia zamiast salda piórek) | 37e9b36 |
| E9e | przegląd wydajności, dokumentacja, decyzja o 9.5 | 50e17ae |
| E10 | wersja demo `demo.html` (własne menu z muzyką, bez hasła, bez zapisu, bez Galerii) | 6e58876 |
| — | poprawki testów: Sowa w Chmurach (ratunek kózki), rekordy (WebKit), Sowi Butik (WebKit, dwa kroki), pauza w Sowie w Chmurach (WebKit) | 40decd2, 61c4c50, 25dd4cd, e7ab64a, b4fae30 |
| — | porządki w dokumentacji i usunięcie `tests/smoke.html` (punkt 1.1) | commit „Dokumentacja: porządki po E9–E10 …” z 2026-10-06 |

Każdy z tych commitów przed wypchnięciem przeszedł u mnie pełny `npm test` (składnia, ESLint, Prettier, HTML,
testy jednostkowe, reguły Firestore i ok. 500 testów przeglądarkowych w Chromium na emulatorze). Nic nie było
zapisywane do produkcyjnej bazy — testy działają na emulatorze (`demo-sowiegry`) albo w pamięci.

### 1.1. Porządki 2026-10-06 (bez zmian w grach)

Przegląd całej dokumentacji pod kątem stanu po E9–E10. Poprawione nieaktualne opisy:

- **instrukcja obsługi** (`docs/README.md`): rekordy ogląda się w menu (zakładka „Sowa” → „Rekordy”), a nie
  przyciskiem 🏆 w grze; ustawienia w grach są w menu pauzy, a nie pod przyciskiem ⚙; w Laboratorium sowa ma
  12 dodatków z garderoby (było 9);
- **dokumentacja techniczna** (`docs/Documentation.md` i `docs/Documentation.md` gier): strony gier nie ładują już
  `sowie-academy.js` (Akademia przychodzi z modułem gry), Galeria nie ma okna w grach, wersja service workera to v12
  (106 plików), opis profilu w bazie (Tryb Przytulny, rekordy trybu Nieskończonego), opisy testów (rekordy,
  przekierowania, powtórzenie samouczków, testy misji i instrukcji), tabela „Czynności właściciela”
  w planie prac;
- **usunięty przestarzały plik** `tests/smoke.html` — ręczna strona testowa sprawdzała moduły usunięte w E9a
  (`SowieCore`, `SowieIdleGame`), więc pokazywała błąd dla każdej gry. Jej rolę od dawna pełni automatyczny test
  `tests/e2e/smoke.spec.js` (każda gra startuje, menu ma 5 kart);
- poza repozytorium (tylko w moim kontenerze) usunąłem pliki robocze: drugą kopię roboczą repozytorium ze skryptami
  pomiarowymi, logi emulatora i raporty z testów.

W repozytorium nie ma innych plików tymczasowych. Na GitHubie została stara gałąź `claude/loving-fermat-76mtxr`
(z wcześniejszej sesji, w całości włączona do `main`) — można ją usunąć; nie robię tego bez Twojej zgody.

## 2. Jak testować

- Po każdej aktualizacji **odśwież stronę dwa razy** — telefon trzyma poprzednią wersję w pamięci (service worker),
  pierwsze odświeżenie pobiera nową, drugie ją pokazuje.
- Wersja demo: `https://cutelittlegoat.github.io/SowieGry/demo.html` — najlepiej w osobnej karcie. Tryb demo trzyma
  się karty przeglądarki; w tej samej karcie do pełnej wersji wraca adres z `?demo=0`.
- Twoje testy w pełnej wersji zapisują postęp w produkcyjnej bazie — to w porządku (decyzja z 2026-10-04: dane
  z okresu testów są testowe).
- Uwagi i błędy najlepiej zbierać jak dotąd (gra, co się stało, na jakim telefonie) i zgłosić w nowym oknie —
  trafią do `UWAGI_WLASCICIELA.md`.

## 3. Co zostało do zrobienia i decyzje

| # | Sprawa | Stan |
| --- | --- | --- |
| 1 | **Twoje testy na telefonie** po poprawkach P1–P7 i uwagach O8–O12 — krok po kroku w `TESTY_NA_TELEFONIE.md` (B1–B4, G1–G2, O1–O6, L1–L2, U1, C1) | do zrobienia; uwagi w nowym oknie |
| 2 | **Wymagania zdjęć Galerii** — zmienione w E9d zdjęcia nr 8, 10, 25, 27, 30 (opis w `UWAGI_WLASCICIELA.md`, tabela „Decyzje”, 2026-10-05) i nowe zdjęcia nr 31–40 (test G2 w `TESTY_NA_TELEFONIE.md`) | do przejrzenia — inne progi wystarczy napisać |
| 3 | **Zadanie 9.5** — usunięcie kodu kasującego stare klucze `localStorage` i stron-przekierowań (`SowaRunner/`, `Sowa3/`, `SowaJumper/`, `SowiaSzklarnia/`, `SowieOgrody/nowa.html`) | ✅ 2026-11-02: b — usunięte (1711584), a — stare adresy usunięte (4bb58ca) (punkt 3.1) |
| 4 | **Ceny w Sowim Butiku i progi osiągnięć** — ustawione tak, żeby za zadania (ok. 15 piórek dziennie + 15 tygodniowo + osiągnięcia) pierwszy gatunek był po 2–3 dniach gry, a Puchacz po kilku tygodniach | do oceny przy testach |
| 5 | **Testy automatyczne WebKit w GitHubie** — punkt 4 niżej | ✅ zielone od b4fae30 do f22ac7a (przebieg 248); przebiegi 249–251 nie wystartowały przez zmianę po stronie GitHuba — poprawione w f7dbb86 (4.5); przebieg 252 (d58f7ed, wszystkie etapy P1–P8) ✅; przebieg 258 (6844d4f, uwagi O9–O12) ✅ — 1179 testów, 4 znane niestabilne testy WebKit przeszły w powtórce; obserwuję testy, które przechodzą dopiero w powtórce (4.3 d) |
| 6 | **Do sprawdzenia przy testach (spostrzeżenie z przeglądu):** na ekranie tytułowym Sowich Torów w pionie górna część ekranu jest jasnym, pustym tłem (tak samo przed zmianami E9) | do oceny — jeśli przeszkadza, dodam niebo/sufit sklepu |
| 7 | **Wydajność:** w kontenerze bez karty graficznej przy spowolnionym procesorze (×4) Sowie Tory mają ok. 23 kl./s, pozostałe gry 45–56 kl./s; na telefonie płótno jest przyspieszane sprzętowo, a Tory same obniżają rozdzielczość, gdy klatek jest za mało | bez zmian; jeśli na którymś telefonie Tory się „tną”, napisz który |
| 8 | **Stara gałąź `claude/loving-fermat-76mtxr`** na GitHubie (włączona do `main`) | do decyzji — mogę usunąć, jeśli chcesz |
| 9 | **Wydajność (G6, 2026-11-22)** — Analiza 6: plan W0–W8, pytania w rozdz. 9 (m.in. model telefonu, w której grze zawiesza się przesuwanie roślin, zgoda na automatyczne obniżanie ostrości) | ✅ odpowiedzi 2026-11-22 (Redmi Note 10 Pro, MIUI Global 14.0.7, Chrome; automat + przełącznik „Płynność”; pomiar `?perf=1` — zgoda); wdrożenie w kroku 3 (punkt 0.3); punkt 7 wyżej zastąpiony przez tę analizę |
| 10 | **Nowa gra „match 3” (N1, 2026-11-22)** — Analiza 5 „Sowie Trójki”: pytania w rozdz. 18 (nazwa, miejsce Sówki, kafelki, liczba poziomów, reguły Firestore) | ✅ decyzje 2026-11-22 (wszystko według rekomendacji); budowa podglądu w kroku 4; **reguły Firestore do skopiowania: Analiza 5, Załącznik B** |
| 11 | **Sowia Dziupla zamiast menu głównego (D1, 2026-11-22)** — `ANALIZA_7_Sowia_Dziupla.md`, 8 pytań w rozdz. 16 | ✅ analiza; budowa — osobne zadanie po Sowich Trójkach |
| 12 | **Galeria: zdjęcia sów, kóz, wielorybów i roślin ozdobnych (G7, 2026-11-22)** | ✅ 2026-11-23 — zdjęcia 41–55 i filtr rodzaju (punkt 0.5); wymagania do przejrzenia przy teście G3 |
| 13 | **Sowie Trójki — akceptacja podglądu (2026-11-23)** — testy T1–T6; po akceptacji i publikacji reguł: karta w menu, zapis postępu, „Jak grać?”, Akademia, Rekordy, zdjęcia za Sowie Trójki (etap M5) | ✅ testy T1–T6 zaliczone, reguły opublikowane, podgląd zaakceptowany (2026-11-23); M5 zrobiony (punkt 0.6) — testy T7–T9 |
| 14 | **Sowia Farma — nowa duża gra farmerska (N2, 2026-11-23)** — [`ANALIZA_8_Nowa_gra_Sowia_Farma.md`](ANALIZA_8_Nowa_gra_Sowia_Farma.md) z makietą, 16 pytań w rozdz. 20 | ✅ analiza (punkt 0.7); budowa po Sowiej Dziupli, po Twoich odpowiedziach |
| 15 | **Testy w GitHubie „zacięte” (2026-11-23)** — przebiegi 264–266 | ✅ nie zawieszone (ok. 55 min); jedyny stały błąd — test Trójek w WebKit (przeładowanie) poprawiony w teście (punkt 0.7); propozycja szybszych testów — Analiza 8, pytanie 16 |

### 3.1. Zadanie 9.5 — stare adresy gier i sprzątanie starej pamięci (decyzja z 2026-11-02)

**Twoja decyzja: „b-usuń (i zaktualizuj dokumentację w repo).”** Zrobione w 1711584: SowieGry **niczego nie kasuje**
z pamięci przeglądarki (pilnują tego testy). **a) — też usunięte** na Twoją prośbę z tego samego dnia („Stare adresy
gier (jeżeli już nie są potrzebne) też usuń.”) w 4bb58ca: nic z nich już nie korzystało (menu, aplikacja na telefonie
i pamięć aplikacji wskazują tylko nowe gry). Stara zakładka albo ikona z takim adresem pokazuje teraz „nie znaleziono
strony” (404) — gry otwiera się z menu, a zakładkę wystarczy zapisać na nowo.

Opis z pytania (dla porządku):

Od pierwszego zapisu w chmurze (koniec września) minął ponad miesiąc, więc według planu można posprzątać dwie
rzeczy z okresu przejściowego. **Żadna z nich nie dotyka postępu w chmurze** — ani rekordów, ani zakupów, ani roślin.

**a) Stare adresy gier.** Pod dawnymi adresami (`…/SowaRunner/`, `…/Sowa3/`, `…/SowaJumper/`, `…/SowiaSzklarnia/`
i `…/SowieOgrody/nowa.html`) są malutkie strony (razem ok. 4 KB), które od razu przenoszą do nowych gier. Jeśli je
usunę, zakładka, ikona na ekranie telefonu albo link wysłany komuś z takim starym adresem pokaże „nie znaleziono
strony” (404). Aplikacja zainstalowana z menu („Zainstaluj SowieGry na telefonie”) działa dalej, bo otwiera menu.

**b) Sprzątanie starej pamięci telefonu.** Przy pierwszym wejściu po wrześniowej zmianie gra raz kasuje z pamięci
przeglądarki stare zapisy sprzed chmury (już nieużywane, tylko klucze SowieGry z listy — dane innych stron zostają).
Jeśli usunę ten kod, na telefonie, którego nikt nie otwierał od września, stare zapisy po prostu zostaną w pamięci
przeglądarki (nic nie ważą, gra ich nie czyta). Na telefonach, które już raz otworzyły SowieGry po wrześniu,
niczego to nie zmienia — tam stare zapisy są już skasowane.

**Moja rada była:** a) **zostawić** — strony nic nie kosztują, a chronią stare zakładki i ikony; b) **usunąć** — to
tylko porządek w kodzie, bez żadnego wpływu na grę.

## 4. Problemy z testami automatycznymi — na czym polegają

### 4.1. Dwa miejsca testów

- **U mnie (kontener):** pełny `npm test`, przeglądarka **Chromium** na 5 profilach telefonów i komputerze. WebKit
  (silnik Safari z iPhone'a) nie jest tu zainstalowany, a zasady środowiska nie pozwalają go pobierać.
- **W GitHubie (CI, „Quality and browser tests”):** te same testy w **Chromium i WebKit** (ok. 1100 testów, 35–45
  minut), po każdym wypchnięciu na `main`. Test, który w CI nie przejdzie, jest powtarzany raz.

Skutek: błąd widoczny tylko w WebKit wychodzi dopiero w GitHubie, po wypchnięciu. Same gry działają — chodziło
o testy, które w WebKit zachowują się inaczej niż w Chromium.

### 4.2. Stan CI dla commitów z 5 października

| Commit | Wynik CI | Przyczyna |
| --- | --- | --- |
| 40decd2 (poprawka testu ratunku kózki, rano) | ❌ | test pauzy w Sowie w Chmurach na 1 telefonie WebKit (4.3 c) |
| a3c6b09 (E5f) | ✅ | — |
| e2d8d68 (E6f), 5c30411 (E7e), f66fb24 (E8e), 2437199 (E9a), 821cb70 (E9b) | ❌ | tylko test rekordów Sowy w Chmurach na 5 telefonach WebKit (4.3 a) |
| 61c4c50 (poprawka testu rekordów) | ✅ | — |
| 7015597 (E9c), 37e9b36 (E9d) | ❌ | tylko nowy test Sowiego Butiku na 4–5 telefonach WebKit (4.3 b) |
| 50e17ae (E9e), 6e58876 (E10) | ❌ | ten sam test Butiku (poprawka weszła później) |
| 25dd4cd (pierwsza poprawka testu Butiku) | ❌ | test Butiku na ostatnim kroku (powrót do Sówki) |
| e7ab64a (pierwsza wersja tego pliku, test pauzy) | ❌ | tylko test Butiku na 5 telefonach WebKit; poprawiony test pauzy już przeszedł |
| **b4fae30 (druga poprawka testu Butiku)** | **✅** | 1099 testów przeszło (43,9 min); 4 przeszły dopiero w powtórce (4.3 d) |

Żaden z tych czerwonych przebiegów nie wynikał z błędu w grach — za każdym razem nie przechodził test, który
w WebKit sprawdzał coś zbyt dosłownie albo za szybko. Commity z 6 października zmieniają tylko dokumentację
(i usuwają nieużywaną stronę `tests/smoke.html`), więc nie zmieniają wyniku testów.

### 4.3. Przyczyny i poprawki

**a) Rekordy Sowy w Chmurach (naprawione w 61c4c50).** Od E6f test zapisuje loty w grze, a potem w tej samej karcie
przechodzi do menu, przy połączeniu z emulatorem Firestore. WebKit zgłasza przerwane przy zmianie strony połączenia
Firestore jako błędy strony („…due to access control checks”), a test wymaga zera błędów. Ten sam problem był
wcześniej w Sowich Torach — rozwiązanie identyczne: menu otwiera się w nowej karcie tego samego „telefonu”.

**b) Sowi Butik (naprawione w dwóch krokach: 25dd4cd i b4fae30).** Test sprawdzał gatunek sowy po dokładnym
kolorze jednego piksela sówki w profilu, i to raz, bez czekania na narysowanie. WebKit inaczej przelicza kolory
obrazków SVG na płótnie, więc kolor nie pasował. Pierwsza poprawka (25dd4cd) porównywała cały obrazek — zakup
Puszczyka przechodził, ale po powrocie do Sówki WebKit rysował minimalnie inne piksele niż na początku. Od b4fae30
test liczy odsetek „ciepłych” pikseli (czerwony − niebieski > 60): rudobrązowa Sówka ma ich ok. 30%, szarobrązowy
Puszczyk ok. 3% — test wymaga ponad 15% dla Sówki i poniżej 10% dla Puszczyka, więc drobne różnice rysowania nie
mają znaczenia. W CI przeszło na wszystkich telefonach.

**c) Pauza w Sowie w Chmurach (naprawione w e7ab64a).** Rano (40decd2) po „Wznów” sowa nie ruszyła w ciągu
8 sekund od odliczania — WebKit w CI liczył czas gry wolniej niż rzeczywisty; przy powtórce przeglądarka na maszynie
GitHuba się zawiesiła („Target crashed”). Test czeka teraz na koniec odliczania (do 15 s), a ruch sowy sprawdza,
przewijając logikę gry o 0,5 s, zamiast czekać na klatki. W CI (e7ab64a i b4fae30) przeszło.

**d) Testy „niestabilne” (flaky).** W każdym przebiegu CI 1–6 testów WebKit nie przechodzi za pierwszym razem, a przy
powtórce przechodzi (CI ma jedną powtórkę). Za każdym razem są to inne testy. W ostatnich przebiegach:

- e7ab64a: Łącz i Hoduj — okno pomieszczeń (iPhone SE, WebKit);
- d58f7ed (przebieg 252, 2026-11-02): Łącz i Hoduj — okno pomieszczeń (iPhone 13 poziomo, WebKit);
- 954a9c5–e5a1983 (przebieg 253): Łącz i Hoduj — okno pomieszczeń (iPhone SE, WebKit; trzeci raz ten sam test — okno
  nie pojawia się po kliknięciu portfela; przyczyny bez nagrania z CI nie widać, a na prawdziwym iPhonie warto
  sprawdzić, czy okno otwiera się za każdym stuknięciem — test L2, krok 5), nowy test L2 — komunikat „Szczyt łańcucha”
  przyszedł po ponad 5 s, bo komunikaty idą po jednym z kolejki (od tej poprawki test czeka do 15 s i sprawdza od razu
  podpowiedź), Sowia Ucieczka — wyzwanie dnia (Android, WebKit, „Target crashed”);
- b4fae30: Łącz i Hoduj — przeciąganie roślin (iPhone SE, zawieszenie przeglądarki „Target crashed”), Łącz i Hoduj —
  samouczek (iPhone 13, przeglądarka zamknięta w trakcie), Sowia Ucieczka — komunikat „Rejs na humbaku!” nie pojawił
  się w ciągu 5 s (iPhone SE), Sowia Ucieczka — wyzwanie dnia (iPhone 13, „Target crashed”).

Przyczyna: WebKit na maszynie GitHuba jest wolny i nierówno odmierza klatki, a część testów czeka na komunikat albo
zdarzenie „w czasie rzeczywistym” (np. 5 s), podczas gdy gra w tym czasie liczy klatki wolniej albo pokazuje inny
komunikat (w grze jest jeden komunikat naraz). Gry są w porządku — to kwestia odporności testów. Sposób naprawy jest
sprawdzony (używałem go już w kilku testach): zatrzymać logikę gry w teście (`hold`) i przewijać czas porcjami
(`advance`) zamiast czekać na klatki, a komunikaty sprawdzać w stanie gry. Plan: poprawiać test, który nie przejdzie
także przy powtórce (wtedy CI jest czerwone); pierwszy kandydat to test „Rejs na humbaku!” w Sowiej Ucieczce.
Zawieszenia samej przeglądarki WebKit na maszynie GitHuba („Target crashed”, „browser has been closed”) nie da się
naprawić w testach — powtórka zwykle przechodzi.

### 4.4. Inne utrudnienia (dla porządku)

- **Raporty z CI** (zrzuty ekranu, nagrania, `trace`) są w artefaktach GitHuba, których nie mogę pobrać z kontenera
  (blokada hosta z plikami). Treść błędów czytam z logów zadania przez narzędzie GitHub — to wystarcza do diagnozy.
- **Pełny `npm test` lokalnie trwa 14–17 minut**, a każdy commit przed wypchnięciem przechodzi go osobno (zgodnie
  z zasadą „małe kroki, każdy z zielonymi testami”). Dlatego wypychanie 10 commitów 5 października trwało kilka godzin.
- **Dwa przestoje 5 października:** restart kontenera przerwał testy E5f (powtórzone od nowa) oraz mój błąd
  w skrypcie kolejki — proces obserwujący kolejkę blokował ją (ok. 40 minut). Naprawione, bez wpływu na kod gier.

### 4.5. 2026-11-02: GitHub zmienił system na maszynach testów (naprawione w f7dbb86)

Od rana 2 listopada GitHub uruchamia testy („ubuntu-latest”) na nowym systemie Ubuntu 26.04. Narzędzie do testów
w przeglądarkach (Playwright 1.56.1, przypięte w projekcie) nie umie zainstalować tam przeglądarek: „Playwright does
not support chromium on ubuntu26.04-x64”. Dlatego przebiegi 249–251 (commity 0fca752, 82e325b, 822c60d) kończyły
się po minucie, **zanim jakikolwiek test ruszył** — czerwony znaczek nie oznaczał błędu w grach (u mnie te same
testy przechodziły w całości). Poprawka: testy w GitHubie biegną na stałe na Ubuntu 24.04 (na nim przeszedł ostatni
przebieg 248, f22ac7a). Na Ubuntu 26.04 wrócimy razem z nowszą wersją Playwrighta — to osobna, większa zmiana
(inne wersje przeglądarek mogą zmienić zachowanie części testów WebKit).

Pierwszy przebieg po poprawce — **252 (d58f7ed, wszystkie etapy P1–P8): ✅ 1182 testy w Chromium i WebKit**
(45,1 min testów, cały przebieg 48 min). Jeden test przeszedł dopiero w powtórce: okno pomieszczeń w Łącz i Hoduj
(iPhone 13 poziomo, WebKit) — ten sam test był niestabilny w e7ab64a (4.3 d); kliknięcie trafia w przycisk, ale okno
w WebKit czasem nie pojawia się w ciągu 5 s. Jeśli nie przejdzie także w powtórce, poprawię test. Ponieważ testów
przybyło (P3–P7) i przebieg zbliżył się do limitu 60 minut, limit czasu CI jest teraz 75 minut.

### 4.6. 2026-11-11: przebieg 256 po uwadze O8 (testy półki poprawione)

- **Próba 1:** przerwana przy instalacji przeglądarek — serwer pakietów Ubuntu (`azure.archive.ubuntu.com`) przestał
  odpowiadać po 27 minutach pobierania; żaden test nie ruszył (nic wspólnego z grami). Uruchomiłem ją ponownie.
- **Próba 2:** 1163 testy przeszły, ale nowe testy półki Sowich Ogrodów zawodziły — 2 także w powtórce (WebKit),
  6 dopiero w powtórce (WebKit i Chromium); do tego dwa znane niestabilne testy WebKit z 4.3 d (Sowia Ucieczka —
  „Target crashed”, Sowa w Chmurach — klawiatura), które przeszły w powtórce. **Gra działała dobrze** — winne były
  testy: podjazd półki do nowej rośliny albo do ciężarówki rusza dopiero w najbliższej klatce, a test sprawdzał
  półkę wcześniej; w WebKit na maszynie GitHuba klatki są rzadkie, więc test widział półkę przed ruszeniem albo
  w połowie drogi. Odtworzyłem to u siebie (klatki co 250 ms): stara wersja testu zawodziła tak samo, poprawiona
  przechodzi.
- **Poprawka:** testy nie czekają już na animację — hak testowy `settleShelf` od razu kończy ruch półki (tak jak
  `hold` i `advance` w innych testach), a stan „w ruchu” obejmuje też podjazd zaplanowany na najbliższą klatkę.
  Sama gra bez zmian w działaniu.

## 5. Co dalej

0. Zadanie z 2026-11-22 (punkt 0.3): dokumentacja ✅ → analiza Sowiej Dziupli ✅ → poprawki wydajności W0–W8 ✅ →
   nowa gra „Sowie Trójki” jako podgląd i nowe zdjęcia Galerii ✅ → jeden PR na `main` ✅ → przeniesienie bazy ✅ →
   etap M5 (Trójki w menu i z zapisem) ✅. Twoje czynności: testy T7–T9; decyzja, czy i kiedy usunąć stare dane
   SowieGry ze starego projektu (`PRZENIESIENIE_FIRESTORE.md`, krok 7 — do tego czasu nic nie kasujemy). Kolejne
   zadania (decyzje z 2026-11-24, punkt 0.8) — **dopiero na Twoje polecenie**: **T0** — szybsze testy w GitHubie, potem **Sowia Dziupla z Wypluffkami**
   (Analizy 7 i 7b), później **Sowia Farma** (Analiza 8), a po jej pierwszej wersji **audyt kodu** (A1, etap F11). W przyszłości: kopia zapasowa i przywracanie w panelu
   admina (W10).
1. Twoje testy na telefonie (`TESTY_NA_TELEFONIE.md`) i uwagi (w nowym oknie) → wpis w `UWAGI_WLASCICIELA.md` →
   poprawki małymi commitami, każdy z zielonym `npm test`, z aktualizacją dokumentacji gry i tego pliku.
2. Ewentualnie inne wymagania zdjęć Galerii (punkt 3, wiersz 2) i ceny w Butiku albo w Kramie ogrodnika.
3. Jeśli któryś test WebKit w CI nie przejdzie także przy powtórce — poprawić go tak jak w 4.3 c i d.
4. Kiedyś: nowsza wersja Playwrighta i powrót testów w GitHubie na najnowszy system (punkt 4.5).
