# Stan prac — 2026-10-06

Podsumowanie dla właściciela: co jest zrobione, co zostało, jakie są decyzje do podjęcia i na czym polegają problemy
z testami automatycznymi. Szczegóły techniczne: `docs/Documentation.md`, plan: `ANALIZA_3_Plan_prac.md`, uwagi
z testów: `UWAGI_WLASCICIELA.md`.

**W skrócie:** wszystkie etapy planu (E0–E10) są na `main` i na stronie. Testy automatyczne w GitHubie są zielone od
commita b4fae30 (5 października wieczorem). Od 6 października testujesz gry i wersję demo — uwagi zgłosisz w nowym
oknie. Do tego czasu w kodzie gier nic się nie zmienia; 6 października doszły tylko poprawki dokumentacji i usunięcie
jednego przestarzałego pliku testowego (punkt 1.1).

## 1. Co jest zrobione

Wszystkie etapy planu E0–E10 są na gałęzi `main`, więc są też na stronie
(https://cutelittlegoat.github.io/SowieGry/). Wyjątek: zadanie 9.5 jest celowo odłożone (punkt 3).

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
| 1 | **Twoje testy gier** po wszystkich zmianach (podmiany, Akademia, Butik, Galeria, demo) | w toku (od 2026-10-06); uwagi w nowym oknie |
| 2 | **Propozycja nowych wymagań Galerii (E9d)** — zmienione zdjęcia nr 8, 10, 25, 27, 30; opis w `UWAGI_WLASCICIELA.md` (tabela „Decyzje”, 2026-10-05) | do przejrzenia — inne progi wystarczy napisać |
| 3 | **Zadanie 9.5** — usunięcie kodu kasującego stare klucze `localStorage` i stron-przekierowań (`SowaRunner/`, `Sowa3/`, `SowaJumper/`, `SowiaSzklarnia/`, `SowieOgrody/nowa.html`) | odłożone: plan mówi „gdy od E1 minie 1–2 miesiące”, a minął tydzień; najwcześniej w listopadzie 2026 |
| 4 | **Ceny w Sowim Butiku i progi osiągnięć** — ustawione tak, żeby za zadania (ok. 15 piórek dziennie + 15 tygodniowo + osiągnięcia) pierwszy gatunek był po 2–3 dniach gry, a Puchacz po kilku tygodniach | do oceny przy testach |
| 5 | **Testy automatyczne WebKit w GitHubie** — punkt 4 niżej | ✅ zielone od b4fae30; obserwuję testy, które przechodzą dopiero w powtórce (4.3 d) |
| 6 | **Do sprawdzenia przy testach (spostrzeżenie z przeglądu):** na ekranie tytułowym Sowich Torów w pionie górna część ekranu jest jasnym, pustym tłem (tak samo przed zmianami E9) | do oceny — jeśli przeszkadza, dodam niebo/sufit sklepu |
| 7 | **Wydajność:** w kontenerze bez karty graficznej przy spowolnionym procesorze (×4) Sowie Tory mają ok. 23 kl./s, pozostałe gry 45–56 kl./s; na telefonie płótno jest przyspieszane sprzętowo, a Tory same obniżają rozdzielczość, gdy klatek jest za mało | bez zmian; jeśli na którymś telefonie Tory się „tną”, napisz który |
| 8 | **Stara gałąź `claude/loving-fermat-76mtxr`** na GitHubie (włączona do `main`) | do decyzji — mogę usunąć, jeśli chcesz |

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

## 5. Co dalej

1. Twoje testy i uwagi (w nowym oknie) → wpis w `UWAGI_WLASCICIELA.md` → poprawki małymi commitami, każdy z zielonym
   `npm test`, z aktualizacją dokumentacji gry i tego pliku.
2. Decyzja o wymaganiach Galerii (E9d) i ewentualnie o cenach w Butiku.
3. Jeśli któryś test WebKit w CI nie przejdzie także przy powtórce — poprawić go tak jak w 4.3 c i d.
4. Listopad 2026: zadanie 9.5 (usunięcie sprzątania `localStorage` i stron-przekierowań).
