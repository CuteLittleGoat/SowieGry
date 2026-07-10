# Audyt repozytorium SowieGry w kontekście GPT-5.6 Sol

**Data audytu:** 10 lipca 2026  
**Repozytorium:** `CuteLittleGoat/SowieGry`  
**Gałąź:** `main`  
**Zakres:** architektura, testy, współdzielone moduły, zapis stanu, wydajność, dostępność i proces rozwoju.

## 1. Podsumowanie wykonawcze

Repozytorium zawiera pięć przeglądarkowych gier HTML/CSS/JavaScript:

- `SowaRunner`,
- `SowaJumper`,
- `Sowa3`,
- `SowieOgrody`,
- `SowiaSzklarnia`.

Projekt działa bez rozbudowanego procesu budowania, dzięki czemu jest prosty do uruchomienia i publikacji. Jednocześnie jego rozwój zaczął wykraczać poza możliwości obecnej organizacji kodu. Największym ryzykiem nie jest pojedynczy błąd, lecz narastająca liczba zależności między grami, duplikacja mechanizmów profilu i kosmetyków, niewystarczające testy oraz modyfikowanie istniejących metod w czasie działania aplikacji.

Najważniejsze działania naprawcze to:

1. objęcie wszystkich pięciu gier automatycznymi testami przeglądarkowymi;
2. przeniesienie współdzielonych elementów do katalogu `shared/`;
3. utworzenie jednego rejestru gier oraz jednego API profilu, kosmetyków i statystyk;
4. zastąpienie doraźnych poprawek zapisu wersjonowanymi migracjami;
5. przebudowanie odświeżania interfejsu `SowiaSzklarnia` tak, aby nie zastępować cyklicznie całego panelu przez `innerHTML`;
6. poprawienie autosave, obsługi zamykania karty, dostępności i odporności na błędy.

Zalecane jest wdrażanie zmian w kilku małych pull requestach. Próba wykonania pełnego refaktoru jednocześnie zwiększyłaby ryzyko regresji i utrudniła ocenę zmian.

## 2. Metoda i ograniczenia audytu

Audyt został wykonany statycznie na podstawie kodu i konfiguracji repozytorium. Oceniono strukturę plików, zależności między grami, testy, workflow GitHub Actions oraz wybrane mechanizmy współdzielone.

W czasie pierwotnej analizy nie udało się uruchomić lokalnego klonu repozytorium z powodu problemu z rozwiązywaniem nazwy hosta GitHub. Z tego powodu nie wykonano pełnych testów manualnych ani testów Playwright w lokalnej przeglądarce. Wnioski dotyczące zachowania interfejsu i zapisu wynikają z analizy implementacji i powinny zostać potwierdzone przez testy automatyczne w pierwszym etapie napraw.

## 3. Mocne strony projektu

### 3.1. Niski próg uruchomienia

Gry są oparte na standardowych technologiach przeglądarkowych i nie wymagają rozbudowanego procesu kompilacji. Ułatwia to publikację, analizę błędów oraz zachowanie kompatybilności z prostym hostingiem statycznym.

### 3.2. Widoczna próba współdzielenia funkcji

Katalog `shared/` oraz moduły takie jak `main-menu.js`, `sowie-runtime.js` i mechanizmy profilu pokazują właściwy kierunek rozwoju. Problemem nie jest brak współdzielenia, lecz niepełne wyznaczenie granic odpowiedzialności tych modułów.

### 3.3. Istniejące podstawy kontroli jakości

Repozytorium ma workflow GitHub Actions oraz stronę testów dymnych. To dobry punkt startowy. Nie trzeba budować procesu jakości od zera, lecz rozszerzyć go tak, aby testował rzeczywiste zachowanie wszystkich gier.

### 3.4. Spójny ekosystem gier

Wspólny profil, kosmetyki, statystyki i menu tworzą wartość większą niż suma pojedynczych gier. Warto zachować tę koncepcję, ale oprzeć ją na jawnych kontraktach i wersjonowanym modelu danych.

## 4. Ustalenia audytu

## 4.1. Testy i ciągła integracja

### Stan obecny

Workflow GitHub Actions sprawdza przede wszystkim składnię JavaScript za pomocą `node --check`. Plik `tests/smoke.html` obejmuje tylko:

- `SowaRunner`,
- `SowaJumper`,
- `Sowa3`.

Nie obejmuje `SowieOgrody` i `SowiaSzklarnia`.

### Ryzyko

Kontrola składni wykryje błędy parsowania, ale nie wykryje między innymi:

- niepoprawnych ścieżek importu;
- błędów wykonywania pojawiających się po załadowaniu strony;
- niedziałających przycisków i modali;
- problemów z `localStorage`;
- regresji w wersji mobilnej;
- utraty fokusu podczas odświeżania DOM;
- problemów z inicjalizacją nowej gry.

Dwie najnowsze gry mogą ulec regresji bez jakiegokolwiek sygnału w CI.

### Zalecenie

Dodać testy Playwright uruchamiane dla wszystkich pięciu gier. Minimalny test każdej gry powinien:

1. otworzyć stronę gry;
2. upewnić się, że nie wystąpił nieobsłużony wyjątek;
3. sprawdzić obecność głównego interfejsu;
4. wykonać podstawową interakcję;
5. przeładować stronę i sprawdzić zachowanie zapisu;
6. uruchomić się w widoku desktopowym i mobilnym.

CI powinno dodatkowo wykonywać lint JavaScript, walidację HTML oraz kontrolę formatowania.

**Priorytet:** krytyczny.  
**Szacowany wysiłek:** średni.

## 4.2. Współdzielony moduł powiadomień znajduje się w katalogu jednej gry

### Stan obecny

`SowaRunner` i `SowaJumper` importują `../Sowa3/notification-manager.js`.

### Ryzyko

Ogólny moduł jest traktowany jak część konkretnej gry. Powoduje to:

- niejasną własność kodu;
- zależność dwóch gier od struktury katalogu trzeciej;
- ryzyko zerwania importów podczas reorganizacji `Sowa3`;
- utrudnione testowanie i ponowne użycie.

### Zalecenie

Przenieść moduł do `shared/notification-manager.js`, zaktualizować wszystkie importy i dodać test otwarcia każdej gry po zmianie ścieżek.

**Priorytet:** wysoki.  
**Szacowany wysiłek:** mały.

## 4.3. Duplikacja profilu, kosmetyków i listy gier

### Stan obecny

`shared/main-menu.js` zawiera własną logikę profilu i kosmetyków oraz informacje o obsługiwanych grach. W tekście interfejsu pozostało sformułowanie o „wszystkich trzech grach”, chociaż repozytorium zawiera pięć gier.

### Ryzyko

Każde dodanie gry lub pola profilu wymaga zmian w wielu miejscach. Prowadzi to do rozbieżności między menu, stronami gier, statystykami i zapisami.

Nieaktualny tekst jest drobnym objawem większego problemu: nie istnieje jedno źródło prawdy opisujące ekosystem.

### Zalecenie

Utworzyć centralny rejestr, na przykład `shared/game-registry.js`, zawierający dla każdej gry:

- stabilny identyfikator;
- nazwę wyświetlaną;
- ścieżkę wejściową;
- ikonę lub metadane graficzne;
- obsługiwane statystyki;
- wersję modelu zapisu;
- opcjonalne flagi funkcji.

Menu, testy i panel profilu powinny generować listy na podstawie rejestru. Logikę profilu i kosmetyków należy udostępnić przez jeden moduł z jasno określonym API.

Niezależnie od refaktoru należy od razu poprawić tekst „we wszystkich trzech grach”.

**Priorytet:** wysoki.  
**Szacowany wysiłek:** średni.

## 4.4. Monkeypatching metod w czasie działania

### Stan obecny

`shared/sowie-runtime.js` opakowuje lub zastępuje istniejące metody w czasie działania. `SowieOgrody` stosuje podobne podejście między innymi wobec `recordStat`.

### Ryzyko

Monkeypatching tworzy ukryte zależności od kolejności ładowania skryptów. Kolejny moduł może nadpisać wcześniejsze opakowanie albo zmienić oczekiwaną sygnaturę funkcji. Utrudnia to:

- analizę przepływu danych;
- testy jednostkowe;
- wykrywanie podwójnego naliczania statystyk;
- stopniową migrację do modułów ES;
- bezpieczne dodawanie nowych funkcji.

### Zalecenie

Wprowadzić jawne zdarzenia lub jawnie przekazywane zależności. Przykładowo gry powinny emitować zdarzenia domenowe:

- `game:start`,
- `game:pause`,
- `game:finish`,
- `score:changed`,
- `stat:recorded`,
- `save:requested`.

Runtime i profil powinny subskrybować zdarzenia zamiast podmieniać metody gry. Migrację należy wykonywać po jednej grze, zachowując warstwę zgodności do czasu zakończenia procesu.

**Priorytet:** wysoki.  
**Szacowany wysiłek:** duży.

## 4.5. Pełne przebudowywanie panelu `SowiaSzklarnia`

### Stan obecny

Panel gry jest okresowo renderowany przez ponowne ustawianie całego `innerHTML`, także w pętli uruchamianej mniej więcej raz na sekundę.

### Ryzyko

Powtarzane zastępowanie całego poddrzewa DOM może powodować:

- utratę fokusu klawiatury;
- przerwanie wpisywania w polach formularzy;
- reset pozycji przewijania;
- konieczność ponownego podpinania nasłuchiwaczy;
- niepotrzebne tworzenie i usuwanie węzłów;
- gorszą wydajność na urządzeniach mobilnych;
- trudniejsze testy dostępności.

### Zalecenie

Rozdzielić inicjalizację struktury od aktualizacji wartości. Szkielet panelu powinien powstać raz, a cykliczne odświeżanie powinno zmieniać wyłącznie konkretne pola, klasy i atrybuty.

Dodatkowo warto:

- aktualizować interfejs tylko wtedy, gdy stan faktycznie się zmienił;
- używać `requestAnimationFrame` dla zmian wizualnych zależnych od klatki;
- używać wolniejszego timera wyłącznie dla symulacji, która nie wymaga 60 FPS;
- zachowywać fokus i stan otwartych sekcji;
- dodać test, który utrzymuje fokus podczas kilku cykli aktualizacji.

**Priorytet:** wysoki.  
**Szacowany wysiłek:** średni.

## 4.6. Autosave zależny od fazy klatki

### Stan obecny

Mechanizm autosave korzysta z warunku zbliżonego do `now % 7000 < 20`.

### Ryzyko

Zapis zostanie wykonany tylko wtedy, gdy klatka animacji trafi w bardzo wąskie okno czasowe. Przy spadku płynności, karcie w tle lub ograniczaniu timerów przez przeglądarkę okno może zostać pominięte. Częstotliwość zapisu jest więc zależna od fazy klatek, a nie od upływu czasu.

### Zalecenie

Użyć akumulatora czasu lub pola `lastSaveAt`:

```js
if (now - lastSaveAt >= AUTOSAVE_INTERVAL_MS) {
  saveGame();
  lastSaveAt = now;
}
```

Dodać zapis przy:

- `visibilitychange`, gdy dokument staje się ukryty;
- `pagehide`;
- ważnych zdarzeniach domenowych, na przykład zakupie lub ukończeniu etapu.

Nie należy opierać poprawności zapisu wyłącznie na `beforeunload`, ponieważ przeglądarki nie gwarantują jego wywołania w każdej sytuacji.

**Priorytet:** krytyczny dla gier z długotrwałym postępem.  
**Szacowany wysiłek:** mały.

## 4.7. Jednorazowa, zakodowana na sztywno migracja postępu

### Stan obecny

`shared/progress-reset.js` pełni rolę doraźnej migracji lub resetu postępu.

### Ryzyko

Kolejne zmiany modelu danych będą wymagały następnych specjalnych skryptów. Bez numeru wersji nie można wiarygodnie ustalić, które migracje zostały już wykonane. Rośnie ryzyko:

- wielokrotnego resetowania danych;
- utraty postępu użytkownika;
- niekompatybilności między starym i nowym zapisem;
- trudności z odtworzeniem błędu.

### Zalecenie

Każdy zapis powinien zawierać `schemaVersion`. Należy utworzyć rejestr migracji, na przykład:

```js
const migrations = {
  1: migrateFrom1To2,
  2: migrateFrom2To3,
};
```

Przy odczycie dane powinny być kolejno migrowane do bieżącej wersji, walidowane, a przed zapisem nowej wersji warto zachować kopię bezpieczeństwa poprzedniego rekordu.

Dodatkowo należy przygotować eksport i import zapisu w formacie JSON, aby użytkownik mógł wykonać własną kopię danych.

**Priorytet:** wysoki.  
**Szacowany wysiłek:** średni.

## 4.8. Dostępność i preferencje ruchu

### Stan obecny

Interfejs wykorzystuje animacje i modale, ale nie wszystkie elementy mają pełną obsługę klawiatury, zarządzanie fokusem i respektowanie `prefers-reduced-motion`.

### Ryzyko

Użytkownik klawiatury może utracić orientację po otwarciu lub zamknięciu modala. Użytkownicy ograniczający animacje nadal mogą otrzymywać intensywne przejścia. Problemy te są szczególnie widoczne, gdy DOM jest często przebudowywany.

### Zalecenie

Dla modali wdrożyć:

- przeniesienie fokusu do modala po otwarciu;
- pułapkę fokusu w obrębie modala;
- zamykanie klawiszem Escape;
- przywrócenie fokusu do elementu otwierającego;
- właściwe role i etykiety ARIA;
- blokadę interakcji z tłem.

W CSS dodać wariant dla `@media (prefers-reduced-motion: reduce)` ograniczający animacje, płynne przewijanie i migotliwe efekty.

**Priorytet:** średni.  
**Szacowany wysiłek:** średni.

## 4.9. Brak deterministycznego trybu testowego i narzędzi balansowania

### Stan obecny

Logika gier jest ściśle związana z losowością, zegarem i bezpośrednim działaniem w przeglądarce.

### Ryzyko

Testy mogą być niestabilne, a balans wymaga ręcznego wielokrotnego grania. Błąd zależny od konkretnej sekwencji losowej jest trudny do odtworzenia.

### Zalecenie

W dłuższym horyzoncie wprowadzić:

- wstrzykiwalny generator liczb losowych;
- możliwość ustawienia ziarna;
- zegar gry oddzielony od `Date.now()` i `performance.now()`;
- centralne pliki konfiguracyjne balansu;
- proste symulacje uruchamiane bez renderowania;
- diagnostyczny tryb developerski dostępny tylko poza wydaniem produkcyjnym.

**Priorytet:** średni.  
**Szacowany wysiłek:** duży.

## 5. Zalecany plan naprawczy

## PR 1 — Fundament jakości

### Cel

Uzyskać automatyczną informację, czy każda z pięciu gier uruchamia się i zachowuje podstawowe funkcje. Ten etap powinien poprzedzać większe refaktory.

### Zakres

- dodać `package.json` z jednoznacznymi skryptami;
- skonfigurować Playwright;
- uruchamiać repozytorium przez prosty lokalny serwer HTTP;
- przygotować test dymny dla wszystkich pięciu gier;
- testować desktop i reprezentatywny widok mobilny;
- przechwytywać błędy `pageerror` i nieoczekiwane komunikaty konsoli;
- sprawdzić podstawową interakcję i trwałość `localStorage`;
- dodać ESLint i Prettier;
- dodać walidację HTML;
- rozszerzyć GitHub Actions;
- zachowywać artefakty Playwright po błędzie;
- poprawić nieaktualny tekst o „trzech grach”.

### Kryteria akceptacji

- CI przechodzi dla każdej gry;
- awaria inicjalizacji dowolnej gry powoduje błąd workflow;
- testy dają czytelny raport i ślad diagnostyczny;
- nie zmienia się mechanika gier.

### Ryzyko

Selektory testów oparte na przypadkowych klasach mogą być kruche. Warto dodać stabilne atrybuty `data-testid` tylko tam, gdzie semantyczny selektor nie wystarcza.

## PR 2 — Wspólna platforma i dane

### Cel

Usunąć zależności między katalogami poszczególnych gier i ustanowić jedno źródło prawdy dla funkcji wspólnych.

### Zakres

- przenieść menedżer powiadomień do `shared/`;
- utworzyć centralny rejestr gier;
- ujednolicić API profilu, kosmetyków i statystyk;
- dodać wersję schematu zapisu;
- zastąpić `progress-reset.js` rejestrem migracji;
- dodać eksport i import danych użytkownika;
- walidować dane wejściowe przed zapisem;
- zachować zgodność ze starymi kluczami `localStorage`.

### Kryteria akceptacji

- żadna gra nie importuje ogólnego modułu z katalogu innej gry;
- lista gier jest definiowana w jednym miejscu;
- istniejące zapisy użytkowników są poprawnie wczytywane;
- migracje są idempotentne;
- eksportowane dane można ponownie zaimportować.

### Ryzyko

Zmiany zapisu są potencjalnie destrukcyjne. Przed migracją należy zachować kopię starego rekordu i dodać testy na realistycznych danych ze starszych wersji.

## PR 3 — Stopniowy refaktor architektury gier

### Cel

Zastąpić ukryte monkeypatche jawnymi kontraktami i przygotować kod do dalszego rozwoju.

### Zakres

- zdefiniować zdarzenia domenowe;
- oddzielić model stanu od renderowania;
- przekazywać zależności jawnie;
- przenieść konfigurację balansu do osobnych plików;
- wprowadzić deterministyczny RNG i zegar testowy;
- migrować po jednej grze;
- zachować warstwę zgodności w okresie przejściowym.

### Kryteria akceptacji

- runtime nie podmienia metod gier;
- statystyki są naliczane dokładnie raz;
- testy mogą ustawić ziarno losowości;
- każda migracja gry jest osobnym, łatwym do przeglądu krokiem.

### Ryzyko

To największa część prac. Nie powinna być jednym ogromnym PR-em. Zalecany podział to co najmniej jeden PR na infrastrukturę zdarzeń oraz osobne PR-y na migrację kolejnych gier.

## PR 4 — Wydajność, dostępność i UX

### Cel

Ograniczyć koszt renderowania, poprawić obsługę klawiatury i uczynić zapis odporniejszym na cykl życia strony.

### Zakres

- przebudować renderowanie `SowiaSzklarnia` na aktualizacje częściowe;
- naprawić autosave przez akumulator czasu;
- dodać zapis na `visibilitychange` i `pagehide`;
- wdrożyć pełne zarządzanie fokusem w modalach;
- dodać `prefers-reduced-motion`;
- dodać testy dostępności najważniejszych ekranów;
- rozważyć testy regresji wizualnej;
- po ustabilizowaniu aplikacji rozważyć manifest PWA i service worker.

### Kryteria akceptacji

- fokus nie znika podczas odświeżania panelu;
- autosave działa niezależnie od liczby klatek na sekundę;
- podstawowy przepływ każdej gry jest dostępny z klawiatury;
- tryb ograniczonego ruchu wyłącza zbędne animacje;
- nie występują zauważalne regresje wydajnościowe.

## 6. Kolejność i zależności

Zalecana kolejność:

1. **PR 1 — Fundament jakości.** Zapewnia siatkę bezpieczeństwa dla wszystkich następnych zmian.
2. **PR 2 — Wspólna platforma i dane.** Usuwa najbardziej oczywiste zależności i zabezpiecza postęp użytkownika.
3. **PR 4 — krytyczne poprawki autosave.** Samą poprawkę autosave można wydzielić wcześniej, jeżeli problem występuje produkcyjnie.
4. **PR 3 — Refaktor architektury.** Powinien przebiegać stopniowo i korzystać z testów utworzonych w PR 1.
5. **Pozostała część PR 4 — UX, wydajność i dostępność.** Część zmian może być realizowana równolegle po ustabilizowaniu wspólnego API.

## 7. Macierz priorytetów

| Obszar | Wpływ | Ryzyko obecnego stanu | Wysiłek | Priorytet |
|---|---:|---:|---:|---:|
| Testy wszystkich pięciu gier | bardzo wysoki | bardzo wysokie | średni | P0 |
| Naprawa autosave | bardzo wysoki | wysokie | mały | P0 |
| Migracje i wersjonowanie zapisu | bardzo wysoki | wysokie | średni | P1 |
| Przeniesienie powiadomień do `shared/` | średni | średnie | mały | P1 |
| Centralny rejestr gier i profil | wysoki | wysokie | średni | P1 |
| Usunięcie monkeypatchingu | wysoki | wysokie | duży | P1/P2 |
| Częściowe aktualizacje DOM | wysoki | średnie | średni | P1 |
| Dostępność i reduced motion | średni | średnie | średni | P2 |
| Deterministyczny RNG i narzędzia balansu | średni | średnie | duży | P2 |
| PWA i praca offline | niski/średni | niskie | średni | P3 |

## 8. Szybkie poprawki możliwe przed większym refaktorem

Poniższe działania są małe i mogą zostać wykonane wcześnie:

- poprawienie tekstu o liczbie gier;
- przeniesienie `notification-manager.js` do `shared/`;
- objęcie `SowieOgrody` i `SowiaSzklarnia` istniejącym smoke testem;
- zastąpienie warunku modulo w autosave polem `lastSaveAt`;
- dodanie obsługi `pagehide` i `visibilitychange`;
- dodanie podstawowego `prefers-reduced-motion`;
- dokumentowanie kluczy `localStorage` i ich właścicieli.

Nie należy jednak traktować tych poprawek jako zamiennika dla testów Playwright i wersjonowanych migracji.

## 9. Proponowane standardy dalszego rozwoju

### Dla każdej nowej gry

- wpis w centralnym rejestrze;
- test uruchomienia na desktopie i urządzeniu mobilnym;
- brak importów z katalogów innych gier;
- jawnie zdefiniowany model zapisu i jego wersja;
- obsługa profilu przez wspólne API;
- podstawowa obsługa klawiatury;
- respektowanie preferencji ograniczonego ruchu.

### Dla każdej zmiany modelu danych

- nowy numer `schemaVersion`;
- funkcja migracji;
- fixture starego zapisu;
- test migracji i idempotencji;
- zachowanie kopii poprzednich danych do czasu udanego zapisu.

### Dla każdego pull requesta

- opis wpływu na zapis użytkownika;
- lista testowanych gier;
- automatyczne testy w CI;
- brak nowych błędów konsoli;
- mały, jednoznaczny zakres;
- możliwość bezpiecznego wycofania.

## 10. Definicja ukończenia programu naprawczego

Program naprawczy można uznać za zakończony, gdy:

- wszystkie pięć gier ma automatyczne testy uruchomienia i podstawowego przepływu;
- CI sprawdza składnię, styl, HTML i zachowanie w przeglądarce;
- wspólne moduły znajdują się wyłącznie w `shared/`;
- lista gier, profil, kosmetyki i statystyki mają jedno źródło prawdy;
- dane użytkownika są wersjonowane i migrowane bez resetu;
- autosave nie zależy od trafienia w konkretne okno klatki;
- runtime nie podmienia metod gier;
- interfejs nie zastępuje cyklicznie dużych fragmentów DOM bez potrzeby;
- najważniejsze przepływy są dostępne z klawiatury;
- preferencja ograniczonego ruchu jest respektowana;
- kolejne gry można dodawać bez kopiowania platformowej logiki.

## 11. Rekomendacja końcowa

Największą wartość przyniesie rozpoczęcie od PR 1, ponieważ obecne testy nie zapewniają wystarczającej ochrony podczas refaktoru. Bez tej warstwy nawet poprawne architektonicznie zmiany mogą niepostrzeżenie zepsuć jedną z gier.

Po zbudowaniu testów należy wykonać PR 2, ze szczególną ostrożnością wokół danych zapisanych w `localStorage`. Refaktor runtime i usuwanie monkeypatchingu powinny nastąpić później, małymi krokami. Krytyczną poprawkę autosave można wydzielić jako mały wcześniejszy PR, jeżeli istnieje ryzyko utraty postępu użytkowników.

Dokument powinien być aktualizowany po każdym etapie: zamknięte ustalenia należy oznaczać jako wykonane, a nowe problemy znalezione przez testy dopisywać wraz z ich priorytetem.