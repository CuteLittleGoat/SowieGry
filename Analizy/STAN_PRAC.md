# Stan prac — 2026-11-02

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
| 1 | **Twoje testy na telefonie** po poprawkach P1–P7 — krok po kroku w `TESTY_NA_TELEFONIE.md` (B1–B4, G1–G2, O1–O4, L1–L2, U1, C1) | do zrobienia; uwagi w nowym oknie |
| 2 | **Wymagania zdjęć Galerii** — zmienione w E9d zdjęcia nr 8, 10, 25, 27, 30 (opis w `UWAGI_WLASCICIELA.md`, tabela „Decyzje”, 2026-10-05) i nowe zdjęcia nr 31–40 (test G2 w `TESTY_NA_TELEFONIE.md`) | do przejrzenia — inne progi wystarczy napisać |
| 3 | **Zadanie 9.5** — usunięcie kodu kasującego stare klucze `localStorage` i stron-przekierowań (`SowaRunner/`, `Sowa3/`, `SowaJumper/`, `SowiaSzklarnia/`, `SowieOgrody/nowa.html`) | ✅ 2026-11-02: b — usunięte (1711584), a — stare adresy usunięte (4bb58ca) (punkt 3.1) |
| 4 | **Ceny w Sowim Butiku i progi osiągnięć** — ustawione tak, żeby za zadania (ok. 15 piórek dziennie + 15 tygodniowo + osiągnięcia) pierwszy gatunek był po 2–3 dniach gry, a Puchacz po kilku tygodniach | do oceny przy testach |
| 5 | **Testy automatyczne WebKit w GitHubie** — punkt 4 niżej | ✅ zielone od b4fae30 do f22ac7a (przebieg 248); przebiegi 249–251 nie wystartowały przez zmianę po stronie GitHuba — poprawione w f7dbb86 (4.5); przebieg 252 (d58f7ed, wszystkie etapy P1–P8) ✅; obserwuję testy, które przechodzą dopiero w powtórce (4.3 d) |
| 6 | **Do sprawdzenia przy testach (spostrzeżenie z przeglądu):** na ekranie tytułowym Sowich Torów w pionie górna część ekranu jest jasnym, pustym tłem (tak samo przed zmianami E9) | do oceny — jeśli przeszkadza, dodam niebo/sufit sklepu |
| 7 | **Wydajność:** w kontenerze bez karty graficznej przy spowolnionym procesorze (×4) Sowie Tory mają ok. 23 kl./s, pozostałe gry 45–56 kl./s; na telefonie płótno jest przyspieszane sprzętowo, a Tory same obniżają rozdzielczość, gdy klatek jest za mało | bez zmian; jeśli na którymś telefonie Tory się „tną”, napisz który |
| 8 | **Stara gałąź `claude/loving-fermat-76mtxr`** na GitHubie (włączona do `main`) | do decyzji — mogę usunąć, jeśli chcesz |

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

## 5. Co dalej

1. Twoje testy na telefonie (`TESTY_NA_TELEFONIE.md`) i uwagi (w nowym oknie) → wpis w `UWAGI_WLASCICIELA.md` →
   poprawki małymi commitami, każdy z zielonym `npm test`, z aktualizacją dokumentacji gry i tego pliku.
2. Ewentualnie inne wymagania zdjęć Galerii (punkt 3, wiersz 2) i ceny w Butiku albo w Kramie ogrodnika.
3. Jeśli któryś test WebKit w CI nie przejdzie także przy powtórce — poprawić go tak jak w 4.3 c i d.
4. Kiedyś: nowsza wersja Playwrighta i powrót testów w GitHubie na najnowszy system (punkt 4.5).
