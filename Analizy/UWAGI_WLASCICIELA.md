# Uwagi właściciela z testów wersji podglądowych

Zbierane od 2026-10-04. **Zasada:** uwagi tylko zapisujemy — kod zmieniamy dopiero, gdy właściciel napisze, że skończył
testy. Wtedy poprawki małymi commitami (każdy z zielonym `npm test`), a przy każdej uwadze stan: ⏳ czeka → ✅ zrobione
(z commitem).

Wersje do sprawdzenia (menu → „Wypróbuj nową wersję: …”):

- Sowie Tory — https://cutelittlegoat.github.io/SowieGry/SowieTory/
- Sowa w Chmurach — https://cutelittlegoat.github.io/SowieGry/SowaWChmurach/
- Sowie Ogrody (nowa odsłona) — https://cutelittlegoat.github.io/SowieGry/SowieOgrody/nowa.html
- Łącz i Hoduj (prototyp nowej Szklarni) — https://cutelittlegoat.github.io/SowieGry/LaczIHoduj/

## Decyzje

| Data | Decyzja |
|---|---|
| 2026-10-04 | **Dane w bazie z okresu testów to dane testowe:** „wszystkie rekordy i zapisy do bazy na czas testów traktujemy jako testy. Jeżeli się skasują to nic się nie stanie. Nie trzeba migracji i backupów.” Skutki dla dalszych prac: przy podmianach (E5f, E6f, E7e, E8) nie trzeba przenosić stanu ani rekordów — nowa gra może zacząć od zera albo nadpisać stary stan; migracja Ogrodów v2 → v3 i pakiet startowy z dawnej Szklarni (8.3) nie są wymagane (można je uprościć lub pominąć); bez kopii zapasowych. **Bez zmian zostają:** kod pisze wyłącznie w kolekcji `sowiegry` (i jej podkolekcjach), reguły Firestore bez zmian, testy tylko na emulatorze / w pamięci, nigdy `localStorage.clear()`. |
| 2026-10-04 | Łącz i Hoduj: **prototypy ekranów zaakceptowane** (zrzuty: przeciąganie na telefonie, 320 × 568, telefon poziomo). Decyzja o samej rozgrywce (merge czy wariant zapasowy) — po teście na telefonie. |

## Ogólne (wszystkie gry)

| # | Uwaga właściciela (dosłownie) | Do zrobienia | Stan |
|---|---|---|---|
| G1 | „Potrzebny będzie przycisk do powtórzenia samouczków.” | Dziś samouczek da się powtórzyć tylko z okna „Jak grać?” danej gry (przycisk „Zagraj samouczek” w Sowiej Ucieczce, Sowich Torach, Sowie w Chmurach i nowych Ogrodach) — za mało widoczne. Dodać widoczny przycisk „Powtórz samouczek” na ekranie startowym każdej gry z samouczkiem (także w Łącz i Hoduj, gdy dostanie samouczek w 8.3) oraz w menu głównym (zakładka „Sowa” → ustawienia) przycisk „Powtórz samouczki we wszystkich grach” (kasuje `tutorialDone` w dokumentach gier — tylko w kolekcji `sowiegry`). | ✅ przycisk „Samouczek” na ekranie startowym Sowiej Ucieczki, Sowich Torów i Sowy w Chmurach (trzy kompaktowe przyciski w rzędzie z „Jak grać?” i „Menu” — mieszczą się na 320 × 568), „Powtórz samouczek” w zakładce Kolekcja nowych Ogrodów, w menu (Sowa → Ustawienia) „Powtórz samouczki we wszystkich grach” (`tutorialDone: false` w dokumentach `runner`, `sowa3`, `jumper`, `ogrody`); Łącz i Hoduj dostanie przycisk razem z samouczkiem (8.3); testy e2e |
| G2 | „(ostatni etap) będę chciał też «wersję demo». Uproszczoną aplikację uruchamianą innym linkiem (inny plik HTML) bez zapisu do Firestore. Może nie być tam wyborów trudności itp. Ma to być wersja pokazowa gier.” | **Ostatni etap — E10 „Wersja demo”** (po E9, wpis w planie, Analiza 3, 8.2): osobna strona (np. `demo.html`) z prostym menu gier; bez hasła i bez Firestore (tylko pamięć — `MemoryBackend`, nic nie trafia do bazy ani do `localStorage` poza tym, co niezbędne); bez wyboru poziomu trudności i innych opcji — od razu gra na ustawieniach domyślnych; samouczek przy każdym wejściu (albo przycisk); wyniki tylko na ekranie. Szczegóły do ustalenia z właścicielem przed startem etapu (które gry, czy z galerią, czy z muzyką, czy osobny link do każdej gry). | ⏳ (ostatni etap) |

## Sowie Tory (E5)

| # | Uwaga właściciela (dosłownie) | Do zrobienia | Stan |
|---|---|---|---|
| T1 | „Pojawia się kilka cystern Amic. Nie da się ich uniknąć.” | Sprawdzić wzory z cysternami Amic (także po zamianie skórek na planszach i ruchome przeszkody): w praktyce bywa układ bez przejścia — znaleźć przyczynę (np. kilka cystern naraz na wszystkich torach albo za blisko siebie przy danej prędkości) i poprawić generator; test, który wcześniej by to wychwycił. | ✅ przyczyna: cysterna była rysunkiem z boku (ok. 4,6 m — prawie cała droga) powtórzonym 3 razy wzdłuż toru, więc zasłaniała sąsiednie tory i wyglądała jak kilka cystern; teraz widok od tyłu w obrysie toru i jeden zbiornik w perspektywie; wzór `t3-cysterny` — 14 m (było 4 m) po cysternach na zmianę toru; test: po długiej przeszkodzie ≥ 10 m, zanim jedyny wolny tor zostanie zablokowany |
| T2 | „Oznacz jakieś itemy do zebrania, które są wyżej i trzeba skoczyć (może jakaś obręcz, żeby wyróżnić? Zdaję się na Ciebie).” | Liście (i inne przedmioty) wysoko nad drogą — wyraźne oznaczenie, że trzeba po nie skoczyć (np. obręcz / pierścień wokół przedmiotu, cień na drodze pod nim, strzałka w górę). | ✅ liście wyżej niż sięga stojąca sowa (`LEAVES.standReach` = 1,4 m — szczyty łuków nad niskimi przeszkodami) mają pulsującą złotą obręcz, cień na drodze i kropkowaną linię w dół; test spójności progu |
| T3 | „Obecnie działają tylko dwie plansze (sklep i festiwal roślin) plus bonus humbakiem.” — **sprostowanie właściciela:** „chyba jednak działa więcej plansz, ale przez problem z cysternami po prostu nie doszedłem dalej niż dziki.” | Prawdopodobnie skutek T1 (właściciel doszedł do planszy 3 z dzikami). Po naprawie T1 sprawdzić w prawdziwej grze, że kampania przechodzi przez wszystkie 4 plansze (blokowisko PRL i stacja Amic), i dodać test e2e przejścia między planszami, jeśli go brakuje. | ✅ sprawdzone: kampania przechodzi przez wszystkie 4 plansze (test jednostkowy — autopilot przez całą kampanię na 4 ziarnach, e2e — plansza 4 → pętla do planszy 1 w trybie Nieskończonym); blokadą w grze była cysterna z T1 (poprawiona) |
| T4 | „Możesz za to urozmaicić scenografię plansz. Sprawdź w necie np. jak wygląda sklep «Biedronka», żeby nie powtarzały się ciągle dwa te same regały.” | Więcej różnych elementów scenografii na każdej planszy (dziś na planszy sklepu powtarzają się dwa te same regały). Przed pracą: sprawdzić w internecie, jak wygląda wnętrze sklepu Biedronka (np. lodówki z nabiałem, stoiska z owocami i warzywami w skrzynkach, piekarnia, palety z promocjami, kasy, koszyki, wózki, chłodnie, kosze z napojami) i na tej podstawie dorysować kilka rodzajów rekwizytów, losowanych tak, żeby obok siebie się nie powtarzały; to samo dla pozostałych plansz (festiwal roślin, blokowisko PRL, stacja Amic). Zasada z Analizy 2: nazwy własną czcionką, kolory i dekoracje w stylu gry, **bez kopiowania logotypów**. | ⏳ |

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
