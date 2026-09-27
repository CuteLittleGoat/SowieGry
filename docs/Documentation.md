# SowieGry — dokumentacja techniczna repozytorium

## Zakres

Repozytorium zawiera ekran startowy i trzy samodzielne gry:

- `SowaRunner`,
- `SowaJumper`,
- `Sowa3`.

Wspólna warstwa „Cute Polish” zapewnia profil, kosmetyki, misje, ustawienia, audio, pauzę, debug i testy uruchomieniowe.

## Struktura główna

```text
index.html
shared/
  cute-ui.css
  sowie-core.js
  sowie-runtime.js
  sowie-smoke-hook.js
tests/
  smoke.html
  e2e/            (testy Playwright; telefon/ — testy na profilach telefonów)
  unit/           (testy node --test)
config/
  firebase-config.js
firebase.json     (tylko emulator Firestore)
firestore.rules   (kopia reguł opublikowanych 2026-09-27)
playwright.config.js
SowaRunner/
SowaJumper/
Sowa3/
docs/
.github/workflows/js-check.yml
```

## Ekran startowy

Główny `index.html` pozostaje prostym ekranem wyboru gry. Karty prowadzą względnymi linkami do:

- `SowaRunner/`,
- `SowaJumper/`,
- `Sowa3/`.

Animowane ozdoby ekranu startowego mają `pointer-events: none`, dzięki czemu nie blokują kart.

## Wspólna warstwa

### `shared/cute-ui.css`

Definiuje:

- pasek narzędzi,
- modal garderoby,
- modal misji,
- ustawienia,
- toasty,
- wskaźnik pauzy,
- panel debug.

Pasek narzędzi znajduje się pod HUD-em po lewej stronie, aby nie zasłaniać wyników ani centralnego obszaru gry.

### `shared/sowie-core.js`

Udostępnia globalny obiekt `SowieCore`.

Najważniejsze systemy:

- wspólny profil `sowieGryProfile`,
- kosmetyki,
- misje,
- statystyki,
- ustawienia,
- proceduralne efekty dźwiękowe,
- proceduralna muzyka,
- garderoba,
- toasty,
- komentarze sowy,
- rysowanie kosmetyków na Canvasie,
- rejestracja adaptera pauzy każdej gry.

### `shared/sowie-runtime.js`

- ogranicza częstotliwość zapisu statystyk dystansu i wysokości,
- obsługuje wznowienie po zamknięciu modalu,
- obsługuje klawisz Escape.

### `shared/sowie-smoke-hook.js`

Przesyła do `tests/smoke.html`:

- błędy JavaScript,
- nieobsłużone odrzucenia Promise,
- informację o załadowaniu gry.

## Profil

Klucz:

```text
sowieGryProfile
```

Profil zawiera:

- `unlockedCosmetics`,
- `selectedCosmetic`,
- `settings`,
- `missions`,
- `stats`.

Dotychczasowe klucze rekordów gier pozostają zachowane.

## Kosmetyki

Dostępne warianty:

- brak,
- kokardka,
- okulary,
- wianek,
- kapelusz ogrodnika,
- czapka z daszkiem,
- szalik,
- plecak,
- ślad bąbelków jako odblokowanie profilowe.

Kosmetyki nie wpływają na hitboxy ani parametry mechaniczne.

## Misje

Wspólne misje obejmują:

- 20 liści,
- dodatkowe życie,
- 3 near missy,
- ukończenie etapu `Chaos`,
- combo `×4`,
- 1000 m w `SowaRunner`,
- 250 m w `SowaJumper`.

Nagrodami są kosmetyki.

## Audio

Audio jest generowane przez Web Audio API bez zewnętrznych plików.

Ustawienia:

- muzyka,
- efekty,
- komentarze sowy,
- ograniczone efekty wizualne.

Każda gra rejestruje własny motyw muzyczny przez `SowieCore.registerGame()`.

## Systemy rozgrywki

Wszystkie gry mają:

- `Chill`, `Arcade`, `Chaos`,
- zdobywanie dodatkowych żyć,
- zabezpieczenie przed niemożliwymi układami,
- combo,
- near miss,
- zwykłe, złote i tęczowe liście,
- gorączkę monster,
- animacje sowy,
- piórka i gwiazdki,
- wspólny profil,
- pauzę,
- audio,
- debug.

Szczegóły implementacji znajdują się w dokumentacji poszczególnych gier.

## Sowa3 — zasada czytelności

Dekoracje są dopuszczalne tylko:

- po bokach ekranu,
- wysoko nad horyzontem,
- poza perspektywicznym korytarzem torów.

`visibility-corridor.js` ponownie rysuje czystą trasę po wszystkich warstwach scenografii.

Ruch ludzi i dzików jest dodatkowo kontrolowany przez `moving-obstacle-safety.js`, który anuluje zmianę toru, gdy:

- tor docelowy jest zajęty,
- ruch zamknąłby wszystkie trzy pasy,
- ostrzeżenie pojawiłoby się zbyt późno.

## Testy

### `npm test`

Pełny zestaw uruchamiany przed każdym wypchnięciem na `main` i w CI (`.github/workflows/js-check.yml`):

| Krok | Skrypt | Co sprawdza |
|---|---|---|
| składnia | `npm run syntax` (`scripts/check-syntax.sh`) | `node --check` dla każdego pliku `.js` poza `node_modules/`, `.git/`, `playwright-report/` |
| lint | `npm run lint` | ESLint 9 (`eslint.config.js`) |
| formatowanie | `npm run format:check` | Prettier 3 (`.prettierrc.json`: szerokość 120, 2 spacje, średniki, cudzysłowy podwójne, przecinki końcowe) dla plików konfiguracyjnych, `firebase.json`, workflow i katalogów `tests/e2e`, `tests/unit` |
| HTML | `npm run html` | `html-validate` (`.htmlvalidate.json`) dla `index.html`, stron pięciu gier i `tests/smoke.html` |
| jednostkowe | `npm run test:unit` | `node --test tests/unit/*.test.mjs` |
| przeglądarkowe | `npm run test:e2e` | Playwright uruchomiony wewnątrz emulatora Firestore: `firebase emulators:exec --only firestore --project demo-sowiegry "playwright test"` |

Zależności deweloperskie są przypięte tam, gdzie wersja wpływa na przeglądarki i emulator: `@playwright/test` **1.56.1** (Chromium 141, rewizja 1194) oraz `firebase-tools` **15.31.0**. Pozostałe (`eslint`, `globals`, `html-validate`, `http-server`, `prettier`) mają zakresy `^`. `package-lock.json` nie jest wersjonowany (`.gitignore`).

### Playwright (`playwright.config.js`)

- serwer: `npm run serve` (`http-server . -p 4173 -c-1`), adres bazowy `http://127.0.0.1:4173`;
- `fullyParallel: false`, w CI 2 procesy i 1 ponowienie, raport `list` + `html` (`playwright-report/`), ślad, zrzut ekranu i wideo zachowywane tylko przy błędzie;
- projekt `desktop-chromium` (`devices["Desktop Chrome"]`) uruchamia testy obecnych gier z `tests/e2e/*.spec.js` (bez katalogu `telefon/`);
- projekty telefonów uruchamiają testy z `tests/e2e/telefon/`. Każdy profil biegnie w dwóch silnikach — Chromium i WebKit (Safari) — więc powstaje 10 projektów o nazwach `telefon-<profil>-<silnik>`:

| Profil | Źródło | Ekran CSS |
|---|---|---|
| `iphone-se` | `devices["iPhone SE"]` | 320 × 568 |
| `iphone-13` | `devices["iPhone 13"]` | 390 × 664 (okno przeglądarki) |
| `pixel-7` | `devices["Pixel 7"]` | 412 × 839 |
| `android-360x800` | własny: 360 × 800, DPR 3, `isMobile`, `hasTouch`, UA Androida 14 | 360 × 800 |
| `iphone-13-poziomo` | `devices["iPhone 13 landscape"]` | 750 × 342 |

- zmienna `SOWIE_E2E_BEZ_WEBKIT=1` pomija projekty WebKit **tylko lokalnie** (np. w środowisku bez przeglądarki WebKit) i wypisuje ostrzeżenie; przy ustawionym `CI` zmienna jest ignorowana, więc w CI WebKit biegnie zawsze.

### Wspólne fikstury (`tests/e2e/fixtures.js`)

- `test` — rozszerzony `test` Playwright z automatyczną fiksturą `productionRequests`: w każdym kontekście przeglądarki przerywa żądania do `firestore.googleapis.com`, `firebaseinstallations.googleapis.com`, `identitytoolkit.googleapis.com` i `securetoken.googleapis.com`, a po teście sprawdza, że żadne takie żądanie nie wystąpiło. To bezpiecznik: testy nigdy nie łączą się z produkcyjną bazą (współdzieloną z innym projektem);
- `blockProduction(context, lista)` — ta sama blokada dla dodatkowych kontekstów tworzonych w teście;
- `watchErrors(page)` — zbiera `pageerror`, błędy konsoli i odpowiedzi HTTP ≥ 400 (bez `favicon.ico`).

### Testy na telefonach (`tests/e2e/telefon/start.spec.js`)

- menu główne i każda z pięciu gier otwiera się bez błędów (znacznik strony widoczny, brak błędów po 0,5 s);
- menu główne mieści się w szerokości ekranu (`scrollWidth ≤ innerWidth`).

### Emulator Firestore

- `firebase.json` konfiguruje **wyłącznie emulator**: reguły z `firestore.rules`, emulator Firestore na `127.0.0.1:8080`, wyłączony interfejs emulatora (`ui.enabled: false`), `singleProjectMode: false`. Nie ma pliku `.firebaserc`, więc narzędzie nie ma domyślnego projektu produkcyjnego; reguły produkcyjne publikuje właściciel ręcznie w konsoli;
- `npm run emulator -- "<polecenie>"` uruchamia dowolne polecenie z działającym emulatorem projektu `demo-sowiegry` (projekty z przedrostkiem `demo-` nigdy nie łączą się z usługami Google);
- emulator stosuje reguły z `firestore.rules` do każdego identyfikatora projektu, co pozwala izolować testy osobnymi projektami `demo-sowiegry-…`;
- emulator wymaga Javy 11+ (w CI: `actions/setup-java`, Temurin 21) i przy pierwszym uruchomieniu pobiera plik JAR do `~/.cache/firebase/emulators` (w CI ten katalog jest w `actions/cache`);
- logi emulatora trafiają do `firestore-debug.log` (ignorowany przez git, dołączany do artefaktów CI przy błędzie).

### Testy jednostkowe konfiguracji (`tests/unit/firestore-rules.test.mjs`)

- `firestore.rules` musi być znak w znak identyczny z blokiem reguł z `Analizy/ANALIZA_1_Firestore_zapis_postepu.md`, rozdział 9.2 (reguły opublikowane 2026-09-27);
- `firebase.json` ma tylko klucze `firestore` i `emulators`, emulator na `127.0.0.1:8080`;
- `test:e2e` uruchamia Playwright w emulatorze projektu `demo-sowiegry`.

### CI (`.github/workflows/js-check.yml`)

Uruchamiany przy `push` na `main` i `audit/**` oraz przy `pull_request`, limit 40 minut. Kroki: checkout, Node 22, Java 21 (Temurin), cache emulatora, `npm install`, `npx playwright install --with-deps chromium webkit`, składnia, lint, formatowanie, HTML, testy jednostkowe, testy przeglądarkowe na emulatorze, raport Playwright (zawsze) i `test-results` + `firestore-debug.log` (przy błędzie).

### Test uruchomieniowy w przeglądarce

`tests/smoke.html` ładuje gry w ukrytych ramkach i po 0,9 s sprawdza, czy każda gra ma swój element i API.

### Tryb debug

Parametr:

```text
?debug=1
```

wyświetla dane diagnostyczne konkretnej gry.

## Firebase / Firestore — stan konfiguracji (2026-09-27)

### `config/firebase-config.js`

Ustawia globalny obiekt `window.firebaseConfig` (bez `export`, żeby działał także z bibliotekami `firebase-*-compat`) dla projektu Firebase `rpg-dataslate-relay`. Projekt i baza Firestore są **współdzielone z innym projektem właściciela** (kolekcje `audio`, `character_builder`, `dataslate`; projekt ma też Realtime Database z osobnymi regułami, których SowieGry nie dotykają).

Stan na 2026-09-27: **żadna strona SowieGry nie ładuje jeszcze tego pliku**. Gry nadal zapisują postęp w `localStorage` (opis w sekcjach „Profil” i „Kosmetyki” oraz w dokumentacji gier). Przeniesienie zapisu do Firestore opisuje `Analizy/ANALIZA_1_Firestore_zapis_postepu.md` i etap E1 w `Analizy/ANALIZA_3_Plan_prac.md`.

### Reguły Firestore

2026-09-27 właściciel opublikował w konsoli Firebase poniższe reguły (wcześniej obowiązywało `allow read, write: if true` dla całej bazy):

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // 1) Drugi projekt (audio, character_builder, dataslate i każda inna kolekcja):
    //    pełny dostęp jak dotąd, także zapytania collectionGroup.
    //    Wyjątek: trzy kolekcje SowieGry.
    match /{sciezka=**}/{kolekcja}/{dokument} {
      allow read, write: if !(kolekcja in ["sowiegry", "sowiegry_gry", "sowiegry_historia"]);
    }

    // 2) SowieGry
    match /sowiegry/meta {
      allow read: if true;
      allow create, update: if request.resource.data.schemaVersion is int;
      allow delete: if false;
    }

    match /sowiegry/profil {
      allow read: if true;
      allow create, update: if request.resource.data.schemaVersion is int
                            && request.resource.data.size() <= 30;
      allow delete: if false;

      match /sowiegry_gry/{gra} {
        allow read: if true;
        allow create, update, delete: if gra in ["runner", "jumper", "sowa3", "ogrody", "szklarnia"];

        match /sowiegry_historia/{wpis} {
          allow read: if true;
          allow create: if request.resource.data.score is number;
          allow delete: if true;          // przycinanie historii do 50 wpisów
          allow update: if false;
        }
      }
    }
  }
}
```

Zasada działania:

- reguła ogólna daje pełny dostęp do każdego dokumentu, którego kolekcja nie nazywa się `sowiegry`, `sowiegry_gry` ani `sowiegry_historia`. Drugi projekt działa więc jak wcześniej, także przy zapytaniach `collectionGroup`;
- `sowiegry/meta` — odczyt dla wszystkich; zapis tylko z polem `schemaVersion` typu całkowitego; bez kasowania;
- `sowiegry/profil` — jedyny profil gracza; zapis tylko z `schemaVersion` i maksymalnie 30 polami; bez kasowania;
- `sowiegry/profil/sowiegry_gry/{gra}` — tylko identyfikatory `runner`, `jumper`, `sowa3`, `ogrody`, `szklarnia` (stałe, niezależne od nazw gier i folderów);
- `…/sowiegry_historia/{wpis}` — tworzenie tylko z liczbowym `score`, kasowanie dozwolone (przycinanie historii), bez edycji;
- każda inna ścieżka pod `sowiegry` jest odrzucana.

Dodanie nowej gry wymaga dopisania jej identyfikatora do listy w regule `sowiegry_gry/{gra}` i ponownej publikacji reguł. Właściciel przewiduje taką rozbudowę w przyszłości; wtedy zostanie też uporządkowany sposób nadawania identyfikatorów (opis: Analiza 1, rozdział 9.2).

Reguły sprawdzono na emulatorze Firestore (26 scenariuszy zgodnych z oczekiwaniem). Kolekcja `sowiegry` jeszcze nie istnieje w bazie; powstanie przy pierwszym uruchomieniu wersji z etapu E1. Kopia reguł jest w pliku `firestore.rules` (etap E0; test `tests/unit/firestore-rules.test.mjs` pilnuje zgodności z Analizą 1). Każda zmiana reguł wymaga edycji `firestore.rules` i ponownej publikacji w konsoli przez właściciela.

## Dokumentacja planu

- `Analizy/ANALIZA_1_Firestore_zapis_postepu.md` — przeniesienie zapisu postępu do Firestore (model danych, hasło, reguły).
- `Analizy/ANALIZA_2_Przebudowa_gier.md` — przebudowa gier, menu główne, telefon jako główne urządzenie.
- `Analizy/ANALIZA_3_Plan_prac.md` — kolejność prac (etapy E0–E9).
- `docs/PLAN_ROZWOJU_CUTE_POLISH.md` — poprzedni plan reworku (do usunięcia w etapie E0).
- `docs/WDROZENIE_CUTE_POLISH.md` — poprzedni stan implementacji i lista testów ręcznych (do usunięcia w etapie E0).

## Dług techniczny

Gry nadal korzystają z części modułów opakowujących funkcje globalne. Wspólna warstwa została wydzielona, ale pełne scalenie każdego silnika do `game.js`, `config.js` i jawnego systemu hooków pozostaje osobnym etapem refaktoru.

Nie należy usuwać obecnych modułów przed wykonaniem testów regresji.
