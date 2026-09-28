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
| formatowanie | `npm run format:check` | Prettier 3 (`.prettierrc.json`: szerokość 120, 2 spacje, średniki, cudzysłowy podwójne, przecinki końcowe) dla plików konfiguracyjnych, `firebase.json`, workflow i katalogów `tests/e2e`, `tests/unit`, `tests/rules` |
| HTML | `npm run html` | `html-validate` (`.htmlvalidate.json`) dla `index.html`, stron pięciu gier i `tests/smoke.html` |
| jednostkowe | `npm run test:unit` | `node --test tests/unit/*.test.mjs` |
| reguły i przeglądarkowe | `npm run test:e2e` | emulator Firestore: `firebase emulators:exec --only firestore --project demo-sowiegry "npm run test:rules && playwright test"` — najpierw testy reguł (`test:rules` = `node --test tests/rules/*.test.mjs`, wymaga działającego emulatora), potem Playwright |

Zależności deweloperskie są przypięte tam, gdzie wersja wpływa na przeglądarki, emulator i SDK: `@playwright/test` **1.56.1** (Chromium 141, rewizja 1194), `firebase-tools` **15.31.0**, `firebase` **12.19.0** (ta sama wersja SDK co w `shared/sowie-cloud.js`; pliki `firebase-app.js` i `firebase-firestore.js` z pakietu npm są bajt w bajt identyczne z plikami na gstatic) i `@firebase/rules-unit-testing` **5.0.2**. Pozostałe (`eslint`, `globals`, `html-validate`, `http-server`, `prettier`) mają zakresy `^`. `package-lock.json` nie jest wersjonowany (`.gitignore`).

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
- ta sama fikstura podaje pliki SDK `https://www.gstatic.com/firebasejs/12.19.0/*.js` z `node_modules/firebase/` (`route.fulfill`, typ `text/javascript`, nagłówek `Access-Control-Allow-Origin: *` — dynamiczny import modułu z innej domeny wymaga CORS). Pliki z pakietu npm są identyczne z gstatic, więc testy są niezależne od sieci i CDN, a produkcja nadal ładuje SDK z gstatic;
- `blockProduction(context, lista)` — ta sama blokada (i podawanie SDK) dla dodatkowych kontekstów tworzonych w teście (np. „drugie urządzenie”);
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
- `test:e2e` uruchamia testy reguł i Playwright w emulatorze projektu `demo-sowiegry`.

### CI (`.github/workflows/js-check.yml`)

Uruchamiany przy `push` na `main` i `audit/**` oraz przy `pull_request`, limit 40 minut. Kroki: checkout, Node 22, Java 21 (Temurin), cache emulatora, `npm install`, `npx playwright install --with-deps chromium webkit`, składnia, lint, formatowanie, HTML, testy jednostkowe, testy reguł i przeglądarkowe na emulatorze, raport Playwright (zawsze) i `test-results` + `firestore-debug.log` (przy błędzie).

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

Stan na 2026-09-27: **żadna strona SowieGry nie ładuje jeszcze tego pliku** (moduł `shared/sowie-cloud.js` jest gotowy i przetestowany, ale nie jest jeszcze podpięty do stron). Gry nadal zapisują postęp w `localStorage` (opis w sekcjach „Profil” i „Kosmetyki” oraz w dokumentacji gier). Przeniesienie zapisu do Firestore opisuje `Analizy/ANALIZA_1_Firestore_zapis_postepu.md` i etap E1 w `Analizy/ANALIZA_3_Plan_prac.md`.

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

## SowieCloud — zapis postępu w Firestore (`shared/sowie-cloud.js`)

Jedyny moduł SowieGry, który rozmawia z Firestore i używa pamięci przeglądarki (`localStorage`, `sessionStorage`). Specyfikacja: `Analizy/ANALIZA_1_Firestore_zapis_postepu.md`. Plik jest zwykłym skryptem (nie modułem ES) opakowanym w IIFE z `"use strict"`. Na końcu:

- w Node (`typeof module === "object"`) eksportuje obiekt z funkcjami i stałymi (`module.exports`) — z tego korzystają testy jednostkowe;
- w przeglądarce uruchamia silnik i ustawia `window.SowieCloud`.

### Stałe

| Stała | Wartość | Znaczenie |
|---|---|---|
| `SDK_VERSION` | `"12.19.0"` | przypięta wersja Firebase JS SDK (zmiana = świadoma zmiana jednej stałej) |
| `SDK_URL` | `https://www.gstatic.com/firebasejs/12.19.0` | CDN, z którego dynamicznie importowane są `firebase-app.js` i `firebase-firestore.js` |
| `APP_NAME` | `"sowiegry"` | nazwana aplikacja Firebase — nie koliduje z domyślną aplikacją innego projektu na tej samej domenie |
| `HASLO_GRACZA` | `"huhu"` | hasło jawne w kodzie (bramka, a nie zabezpieczenie) |
| `SCHEMA_VERSION` | `1` | pole `schemaVersion` w `meta` i `profil` (wymagane przez reguły jako liczba całkowita) |
| `DEVICE_KEY` | `"sowiegry:urzadzenie"` | jedyny klucz `localStorage` SowieGry: `{ unlocked, deviceId, cleaned }` |
| `MODE_KEY` | `"sowiegry:tryb-chmury"` | klucz `sessionStorage` z wybranym trybem (`{ mode, project }`) |
| `GAME_IDS` | `runner`, `jumper`, `sowa3`, `ogrody`, `szklarnia` | stałe identyfikatory gier (są w regułach Firestore) |
| `EMULATOR` | `127.0.0.1:8080`, projekt `demo-sowiegry` | adres emulatora |
| `PATHS` | `sowiegry/meta`, `sowiegry/profil`, `sowiegry/profil/sowiegry_gry/{id}`, `…/{id}/sowiegry_historia` | ścieżki dokumentów |
| `DELAYS` | profil 30 s, ustawienia 1 s, dokument gry 1 s, gra idle 30 s, ważna akcja w grze idle 2 s | opóźnienia zapisów |
| `TOP_LIMIT` / `HISTORY_LIMIT` / `HISTORY_TRIM_AT` | 10 / 50 / 60 | top 10; historia przycinana do 50, gdy licznik przekroczy 60 |
| `DAILY_DAYS` / `AWARD_DAYS` | 30 / 30 | ile dni trzymamy rekordy dnia i nagrody dzienne Akademii |
| `STARE_KLUCZE`, `STARE_PREFIKSY` | lista z Analizy 1, rozdz. 12 | stare klucze SowieGry kasowane jednorazowo |
| `PROFILE_COUNTERS` | `stats.leaves`, `stats.nearMisses`, `stats.extraLives`, `stats.finishes`, `records.{id}.runs` | liczniki zapisywane wyłącznie przez `increment()` |
| `GAME_COUNTERS` | `historyCount` | licznik wpisów historii w dokumencie gry |

### Znaczniki operacji

Stan w pamięci to zwykły JSON. Operacje specjalne są zapisywane jako obiekty `{ __sowieOp: … }` i dopiero backend zamienia je na operacje Firestore:

- `increment(n)` → `{ __sowieOp: "increment", n }` → `increment(n)` z SDK;
- `serverTime()` → `{ __sowieOp: "serverTime" }` → `serverTimestamp()`;
- `deleteValue()` → `{ __sowieOp: "delete" }` → `deleteField()`.

### Funkcje pomocnicze (czyste)

- `clone(v)` — kopia przez `JSON.parse(JSON.stringify(v))`;
- `isPlainObject(v)` — zwykły obiekt (nie tablica, nie znacznik);
- `sameValue(a, b)` — równość wartości liści (tablice porównywane jako JSON, `NaN` równe `NaN`);
- `normalizePassword(v)` → `String(v ?? "").trim().toLowerCase()`; `checkPassword(v)` porównuje z `HASLO_GRACZA`. Wielkość liter i spacje na początku/końcu są ignorowane, spacja w środku (`"hu hu"`) jest błędem;
- `dayKey(ms)` — data `RRRR-MM-DD` w UTC (tak samo jak w Sowiej Akademii);
- `getPath`, `setPath` — odczyt/zapis po tablicy kluczy (brakujące poziomy tworzone jako `{}`);
- `diff(before, after, isCounter)` — **różnica dwóch stanów jako zagnieżdżony obiekt do zapisu `setDoc(…, { merge: true })`**: zmienione liście mają nową wartość, usunięte klucze znacznik `delete`, tablice idą w całości, nowe obiekty są rozwijane do liści, a ścieżki liczników (`isCounter("a.b.c")`) są pomijane. Brak zmian → `null`. Dzięki temu zapisujemy tylko to, co się zmieniło: dwa urządzenia nie nadpisują sobie nawzajem pól, których nie ruszały (np. rekord zapisuje się tylko przy poprawie — Firestore nie ma operacji „max”);
- `applyPatch(target, patch, nowMs)` — zastosowanie takiego zapisu (głębokie scalanie; `increment` dodaje, `serverTime` wpisuje `nowMs`, `delete` usuwa). Używane przez `MemoryBackend`;
- `insertTop(list, entry, limit = 10)` — wstawia wynik do listy malejąco po `score`, zwraca `{ list, place }` (`place` 1–10 albo `null`);
- `trimDaily(map, today, days = 30)` — zostawia klucze `RRRR-MM-DD` z ostatnich 30 dni (włącznie z dziś);
- `trimAwards(awards, today, days = 30)` — usuwa nagrody `daily:*` i `feature:*` z datą starszą niż 30 dni; `weekly:*`, `trait:*`, `gallery:*` zostają;
- `isOldKey(key)`, `cleanupOldKeys(storage)` — kasuje **wyłącznie** klucze z `STARE_KLUCZE` i klucze zaczynające się od `STARE_PREFIKSY`, przechodząc po `storage.key(i)`; nigdy `clear()` (domena jest współdzielona z innymi stronami). Zwraca listę skasowanych kluczy;
- `normalizeValue(v)` — zamienia obiekty z `toMillis()` (Timestamp Firestore) na liczby milisekund, rekurencyjnie;
- `randomId("d-")` — identyfikator urządzenia `d-` + 6 znaków `[0-9a-z]` z `crypto.getRandomValues` (niezależnie od `?seed=`, który podmienia `Math.random`);
- `defaultProfile(platform)` — profil domyślny: `schemaVersion: 1`, `name: "Sowa"`, `settings` (`DEFAULT_SETTINGS`), `cosmetics: { unlocked: ["none", "bow"], selected: "none" }`, `missions` (`DEFAULT_MISSIONS`), `stats` (`DEFAULT_STATS`), `academy: { xp: 0, feathers: 0, metrics: {}, daily: null, weekly: null, awards: {} }`, `gallery: { unlocked: ["owl-01"], viewed: [], favorite: null }`, `records: {}`;
- `normalizeProfile(raw, platform)` — uzupełnia wczytany profil wartościami domyślnymi (także każdą misję osobno), filtruje `cosmetics.unlocked` do znanych kosmetyków, wybrany kosmetyk musi być odblokowany, usuwa znaczniki czasu serwera (`createdAt`, `updatedAt`, `lastSeenAt`).

### Backendy

Wspólny interfejs:

| Metoda | Działanie |
|---|---|
| `getDoc(path, source)` | `source`: `"cache"` (tylko pamięć podręczna IndexedDB), `"server"` (tylko serwer), `"default"`; zwraca obiekt albo `null` (brak dokumentu); błąd = brak danych (np. offline bez cache) |
| `commit(ops)` | jeden zapis zbiorczy (`writeBatch`); `ops`: `{ type: "set", path, data }` (zawsze `merge: true`), `{ type: "add", collection, data }` (dokument z automatycznym id), `{ type: "delete", path }` |
| `query(collection, { orderBy, direction, limit })` | lista `{ id, path, data }` |
| `subscribe(path, listener)` | nasłuch dokumentu; `listener(data, { fromCache, pendingWrites })`; zwraca funkcję odpinającą |

**`MemoryBackend`** (klasa): dokumenty w `Map` ścieżka → obiekt, `commits` (lista wszystkich zapisów — do testów), `writesTo(path)` (liczba zapisów zbiorczych dotykających dokumentu). `add` nadaje id `m-000001`, `m-000002`… Po `commit` powiadamia nasłuchujących dotkniętych dokumentów (`fromCache: false`, `pendingWrites: false`). Używany w testach (`?cloud=memory`), przy awarii CDN i w testach jednostkowych. Dane giną po przeładowaniu strony.

**`createFirestoreBackend({ config, emulator, sdkUrl })`**: równoległy `import()` `firebase-app.js` i `firebase-firestore.js`; aplikacja `getApps().find(name === "sowiegry") || initializeApp(config, "sowiegry")`; `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }), ignoreUndefinedProperties: true })` — trwały cache w IndexedDB, wiele kart; przy emulatorze `connectFirestoreEmulator(db, host, port)`. Dane odczytywane z `serverTimestamps: "estimate"` i przepuszczane przez `normalizeValue`. `getDoc` używa `getDocFromCache` / `getDocFromServer` / `getDoc`. Zapisy offline trafiają najpierw do IndexedDB i są wysyłane, gdy wróci sieć (także przy następnym otwarciu strony).

### Silnik: `createCloud(options)`

Opcje: `platform` (stałe z `SowiePlatform`), `storage` (`localStorage`), `connect()` (Promise backendu), `gameId` (gra bieżącej strony albo `null`), `gameKinds` (`id → "arcade" | "idle"`), `now`, `timers` (`setTimeout`/`clearTimeout` — w testach zegar symulowany), `emit` (zdarzenia `SowiePlatform`), `onLock()` (po wylogowaniu; w przeglądarce przeładowanie strony), `reload()` (wczytanie nowszego stanu z innego urządzenia), `isOnline()`, `logError`.

**Przy utworzeniu (synchronicznie):** odczyt `sowiegry:urzadzenie`; jeśli brak `cleaned` — `cleanupOldKeys` (jednorazowe kasowanie starych kluczy); zapis klucza urządzenia `{ unlocked, deviceId, cleaned: true }`. Następnie start asynchroniczny:

1. urządzenie nie jest odblokowane → status `"haslo"` i czekanie na `unlock()`;
2. status `"laczenie"`, `await connect()`; błąd → `MemoryBackend` i `offlineReason() === "sdk"` (pasek „Tryb offline”);
3. `sowiegry/meta`: odczyt (najpierw cache, potem serwer); dokument nie istnieje → zapis `{ schemaVersion: 1, createdAt: serverTimestamp, games: [5 identyfikatorów] }` (tak powstaje kolekcja `sowiegry`);
4. `sowiegry/profil`: odczyt (cache, potem serwer). Istnieje → `normalizeProfile`. Nie istnieje → profil domyślny + `createdAt`, `updatedAt`, `lastSeenAt` = `serverTimestamp` (w tym samym zapisie zbiorczym co `meta`). Nie da się odczytać (offline i brak cache) → profil tylko w pamięci, bez zapisów, `offlineReason() === "profil"` — nigdy nie tworzymy profilu „na ślepo”, bo nadpisałby prawdziwy postęp;
5. dokument bieżącej gry `sowiegry_gry/{gameId}` (cache, potem serwer);
6. `ready` rozwiązany, status `online` / `offline`; wykonanie zadań odłożonych przed startem (`updateProfile`, `increment`, `submitRun`, `saveGameState`, `updateGame` wywołane przed `ready` są kolejkowane i stosowane do **wczytanego** profilu, a nie do wartości domyślnych);
7. profil wczytany z cache → w tle odczyt z serwera; jeśli lokalnie nic się nie zmieniło, profil w pamięci jest podmieniany i wywoływane są `onProfileReload` oraz zdarzenie `cloud:profile-reloaded` (Akademia i Galeria przeładowują wtedy swój stan);
8. gra idle → `subscribe` dokumentu gry: nowszy `rev` z innym `deviceId` (dane z serwera, bez oczekujących zapisów) → `onConflict({ gameId, rev, decide })`; `decide(true)` przeładowuje stronę (wczytanie nowszego stanu), `decide(false)` przyjmuje `rev` zdalny, więc następny zapis nadpisuje tamten stan.

**Kolejka zapisów.** Zmiany trafiają do pamięci od razu (odczyty są synchroniczne), a `schedule(delay)` ustawia jeden wspólny zegar na `min(obecny termin, teraz + delay)` — kolejne wywołania nie odsuwają zapisu (dlatego gra idle zapisująca co 5 s robi najwyżej 1 zapis na 30 s, czyli ≤ 120 na godzinę). `flush()` buduje operacje i wysyła je jednym `commit`:

- profil: `diff(stan bazowy, profil, liczniki)` + oczekujące `increment` + `schemaVersion: 1`, `updatedAt` i `lastSeenAt` = `serverTimestamp`;
- każdy dokument gry: `diff` + `increment` + `updatedAt`; gdy zmieniło się `state` — także `savedAt` = `serverTimestamp`;
- odłożone operacje historii (`add`, `delete`).

Po zbudowaniu stan bazowy = kopia stanu w pamięci. Podczas zapisu status `"zapisywanie"`, po błędzie `"blad"` i `console.error`. `flush()` przed startem czeka na `ready`.

**Status** (`status()`, `onStatus(listener)` — słuchacz wywoływany od razu z bieżącą wartością): `"haslo"`, `"laczenie"`, `"online"` (Firestore, profil znany, `navigator.onLine`), `"offline"` (pamięć, profil nieznany albo brak sieci), `"zapisywanie"`, `"blad"`.

### Publiczne API `window.SowieCloud`

| Funkcja | Opis |
|---|---|
| `ready` | Promise: hasło podane, profil (i dokument bieżącej gry) wczytany |
| `isReady()` | czy `ready` już się rozwiązał (gry sprawdzają to przed startem rozgrywki) |
| `status()`, `onStatus(fn)` | stan połączenia (jw.) |
| `isUnlocked()` | czy urządzenie ma zapamiętane odblokowanie |
| `unlock(haslo)` | `true`/`false`; przy `true` zapisuje `unlocked: true` i łączy z bazą |
| `lock()` | „Wyloguj to urządzenie”: `flush()` (max 1,5 s), `unlocked: false`, przeładowanie strony |
| `profile()` | profil w pamięci (tylko do odczytu — zmiany przez `updateProfile`) |
| `updateProfile(mutator, { delayMs = 30 000 })` | `mutator(profil)` zmienia pola; zapis odroczony (ustawienia i kosmetyki: 1000 ms) |
| `increment(ścieżka, n)` | licznik profilu (np. `"stats.leaves"`) — pamięć + `increment(n)` w Firestore |
| `records(gameId, poziom)` | rekordy z pamięci, np. `{ bestScore, bestDistance }`; bez poziomu — cały `profil.records[gameId]` |
| `submitRun(gameId, wynik)` | koniec rozgrywki (niżej); zwraca `{ newRecord, place, best }` albo `null` przed startem |
| `topRuns(gameId, poziom)` | Promise: top 10 z dokumentu gry |
| `history(gameId, limit = 10)` | Promise: ostatnie rozgrywki (`orderBy("at", "desc")`) |
| `game(gameId)` | dokument gry w pamięci (np. `difficulty`, `finishSeen`, `dailyBest`, `daily`, `traitAlbum`) |
| `loadGame(gameId)` | Promise: dokument gry (wczytuje, jeśli to nie gra bieżącej strony) |
| `updateGame(gameId, mutator \| obiekt, { delayMs = 1000 })` | zmiana pól dokumentu gry (poziom trudności, `finishSeen`, kontrakty dnia) |
| `loadGameState(gameId)` | Promise: stan gry idle (`JSON.parse(state)`) albo `null` |
| `saveGameState(gameId, stan, { immediate, summary, saveVersion })` | zapis stanu gry idle: `state` = JSON, `saveVersion`, `clientSavedAt`, `deviceId`, `rev + 1`; `summary` trafia do dokumentu gry i do `profil.records[gameId]`; opóźnienie 30 s, `immediate: true` — 2 s |
| `flush()` | natychmiastowe wysłanie kolejki (Promise) |
| `onConflict(fn)`, `onProfileReload(fn)` | pytanie o nowszy stan gry idle; ponowne wczytanie profilu z serwera |
| `offlineReason()` | `null`, `"sdk"` albo `"profil"` |
| `backendKind()`, `mode()`, `gameId()`, `deviceId()`, `removedKeys()` | informacje diagnostyczne (tryb: `memory` / `emulator` / `firestore`) |

**`submitRun(gameId, { score, distance?, height?, leaves?, durationMs?, difficulty = "arcade", daily?, seed? })`** — jeden zapis zbiorczy na rozgrywkę:

- `profil.records[gameId]`: `runs` +1 (`increment`), `lastPlayedAt`, w `[poziom]` pola `bestScore`, `bestDistance`, `bestHeight` — tylko przy poprawie;
- dokument gry: `top10[poziom]` (`insertTop`), przy `daily: true` `dailyBest[RRRR-MM-DD]` = max wartości metryki dnia gry (`GAME_REGISTRY[].dailyMetric`: Runner — dystans, Jumper — wysokość, Sowa3 — wynik), przycięte do 30 dni; `historyCount` +1;
- nowy wpis `sowiegry_historia`: `{ score, distance?, height?, leaves?, durationMs?, difficulty, daily, seed, at: serverTimestamp }`;
- gdy `historyCount > 60`, najstarsze wpisy ponad 50 są kasowane (`query(orderBy("at","asc"), limit(nadmiar))` + `delete`, `historyCount` −n). Nie używamy polityk TTL, bo działają na grupę kolekcji w całej (współdzielonej) bazie.

### Start w przeglądarce

- wymaga `window.SowiePlatform` (rejestr gier) — w każdej stronie kolejność skryptów: `config/firebase-config.js`, `shared/sowie-platform.js`, `shared/sowie-cloud.js`, `shared/password-gate.js`;
- **tryb** (`resolveMode()`): `?cloud=memory | emulator | firestore` (zapamiętany w `sessionStorage` tej karty, więc przejście linkiem do gry zachowuje tryb), opcjonalnie `?projekt=demo-…` dla emulatora (izolacja testów). Bez parametru: na `localhost` / `127.0.0.1` / `::1` — **pamięć** (lokalne uruchomienie nigdy nie zapisuje do produkcyjnej bazy; produkcję lokalnie włącza `?cloud=firestore`), na każdej innej domenie (GitHub Pages) — Firestore z `window.firebaseConfig`;
- emulator: konfiguracja `{ apiKey: "demo-api-key", projectId: "demo-sowiegry" (albo z ?projekt=), appId: "demo-sowiegry" }` + `connectFirestoreEmulator("127.0.0.1", 8080)`;
- gra bieżącej strony: pierwszy wpis `GAME_REGISTRY`, którego `/${path}` występuje w `location.pathname`;
- import SDK startuje od razu przy ładowaniu strony (równolegle z ekranem gry i ekranem hasła);
- `visibilitychange → hidden`, `pagehide` i `online` wywołują `flush()` (na iPhonie `beforeunload` często się nie wywołuje).

## Ekran „Hasło sowy” i nakładki (`shared/password-gate.js`)

Interfejs SowieCloud; logika hasła jest w `sowie-cloud.js`. Wymaga `window.SowieCloud`. Reaguje na `onStatus`:

- `"haslo"` → ekran hasła; inny status → ukrycie ekranu;
- `"laczenie"` przed `ready` → po 200 ms sówka ładowania (przy szybkim starcie z cache się nie pokazuje);
- po `ready` z `offlineReason()` → pasek „Tryb offline — postęp z tej sesji nie zostanie zapisany.”;
- `onConflict` → okno „Nowszy postęp 🦉 — Na innym urządzeniu zapisano nowszy postęp — wczytać?” z przyciskami „Wczytaj” (fokus) i „Zostań przy tym”.

Każda nakładka zatrzymuje propagację zdarzeń klawiatury, wskaźnika, dotyku, kliknięć, kółka i menu kontekstowego (`stopPropagation`), więc gra pod spodem (np. p5.js nasłuchujący na `window`) ich nie dostaje, a wpisywanie spacji czy Enter w polu hasła nie uruchamia gry.

**Ekran hasła** (`div.sowie-gate`, `role="dialog"`, `aria-modal="true"`, `aria-labelledby="sowieGateTitle"`):

```html
<div class="sowie-gate-hero">
  <div class="sowie-gate-owl" aria-hidden="true">🦉</div>
  <h1 id="sowieGateTitle">Hasło sowy</h1>
  <p>Wpisz hasło, żeby wejść do SowieGry. Na tym urządzeniu wystarczy zrobić to raz.</p>
</div>
<form class="sowie-gate-form" novalidate>
  <label class="sowie-gate-label" for="sowieGatePassword">Hasło</label>
  <div class="sowie-gate-field">
    <input id="sowieGatePassword" name="haslo" type="password" autocomplete="off" autocapitalize="none"
      autocorrect="off" spellcheck="false" enterkeyhint="go" inputmode="text" />
    <button type="button" class="sowie-gate-eye" aria-label="Pokaż hasło" aria-pressed="false">👁</button>
  </div>
  <p class="sowie-gate-error" role="alert" hidden>Hu-hu? To nie to hasło 🦉</p>
  <button type="submit" class="sowie-gate-submit">Wejdź</button>
</form>
```

- zatwierdzenie (przycisk „Wejdź” albo Enter/„Idź” na klawiaturze): `SowieCloud.unlock(wartość)`; sukces → ekran znika; błąd → komunikat, animacja potrząśnięcia pola (`is-wrong`), zaznaczenie wpisanego tekstu; bez blokady prób. Wpisywanie chowa komunikat;
- oczko przełącza `type="password"`/`"text"`, `aria-pressed` i etykietę „Pokaż hasło”/„Ukryj hasło”;
- fokus zostaje w oknie (Tab krąży: pole → oczko → „Wejdź”; `focusin` poza oknem wraca do pola); przy otwarciu fokus w polu (`preventScroll`);
- klawiatura telefonu: `visualViewport` (`resize`, `scroll`) ustawia zmienne CSS `--sowie-gate-height` (wysokość widocznej części) i `--sowie-gate-top` (przesunięcie) — ekran kurczy się nad klawiaturą, a formularz zostaje przy dolnej krawędzi, widoczny;
- `html.sowie-gate-open` blokuje przewijanie strony pod spodem.

**Style** (`shared/cute-ui.css`, sekcje „SowieCloud”), zaprojektowane pod telefon w pionie od 320 px:

- `.sowie-gate`: `position: fixed`, `z-index: 9000`, `top: var(--sowie-gate-top, 0)`, `height: var(--sowie-gate-height, 100dvh)` (zapasowo `100vh`), kolumna flex `space-between`, odstęp 16 px, marginesy wewnętrzne z bezpiecznymi obszarami (`max(20px, env(safe-area-inset-top))`, boki `max(16px, …)`), tło `linear-gradient(180deg, #bfe9ff, #fff6e3)`, czcionka `500 16px/1.4 system-ui`, `touch-action: manipulation` (bez powiększania podwójnym tapnięciem);
- `.sowie-gate-hero`: środek ekranu, może się kurczyć (`min-height: 0`); sowa `clamp(56px, 18vw, 96px)` z animacją `sowieGateBob` (2,4 s, ±6 px); nagłówek `clamp(26px, 8vw, 34px)`; przy wysokości ≤ 460 px (otwarta klawiatura) sowa i opis są ukrywane;
- `.sowie-gate-form`: przy dolnej krawędzi (strefa kciuka), szerokość do 420 px;
- pole: wysokość min. 52 px, ramka 2 px `rgba(59,47,74,.25)`, zaokrąglenie 16 px, **czcionka 18 px** (≥ 16 px — iOS nie powiększa strony przy dotknięciu pola);
- oczko 52 × 52 px (żółte `--sowie-yellow`, gdy hasło widoczne); „Wejdź” na całą szerokość, min. 52 px wysokości, żółte, cień `0 10px 24px`; fokus: obrys 3 px `#4d8fd6`;
- komunikat błędu: tło `rgba(255,95,130,.16)`, kolor `#8f1d33`, pogrubiony, wyśrodkowany; animacja `sowieGateShake` 320 ms;
- `.sowie-cloud-loading`: `z-index: 8900`, cały ekran, tło `rgba(255,246,227,.86)` z rozmyciem 6 px, sowa 64 px z animacją 1,2 s i tekst „Wczytuję postęp…” (`role="status"`);
- `.sowie-cloud-offline`: `z-index: 8800`, u góry z bezpiecznym obszarem, szerokość `min(92vw, 420px)`, żółte tło, 14 px, `pointer-events: none`;
- `.sowie-cloud-dialog`: `z-index: 8950`, karta przy dolnej krawędzi (strefa kciuka), przyciski min. 52 px;
- przy `prefers-reduced-motion: reduce` animacje sowy i potrząśnięcia są wyłączone.

`window.SowiePasswordGate = { show, hide }` — ręczne pokazanie/ukrycie ekranu (diagnostyka).

### Testy SowieCloud

- `tests/unit/sowie-cloud.test.mjs` (`node --test`, `MemoryBackend`, symulowany zegar i `localStorage`): hasło (`"huhu"`, `" Huhu "` ✔; `"hu hu"` ✘), kasowanie wyłącznie kluczy z listy (dane innych stron zostają), pierwsze uruchomienie (ekran hasła, `meta`, profil, w pamięci tylko `sowiegry:urzadzenie`), brak ponownych zapisów przy drugim starcie, `submitRun` (rekordy per poziom, top 10, historia, rekord dnia, 1 zapis na rozgrywkę), przycinanie historii do 50, liczniki z dwóch urządzeń i rekordy tylko przy poprawie, ≤ 120 zapisów/h gry idle i 2 s dla ważnej akcji, `flush()`, zmiany sprzed startu, pytanie o nowszy stan z innego urządzenia, `lock()`, `diff`/`applyPatch`, przycinanie top 10 / rekordów dnia / nagród, zgodność wersji SDK z `package.json`;
- `tests/rules/firestore-rules.test.mjs` (`@firebase/rules-unit-testing` 5.0.2 + `firebase` 12.19.0 na emulatorze, projekt `demo-sowiegry-reguly`): pełny dostęp drugiego projektu (odczyt, zapis, kasowanie, podkolekcje, nowa kolekcja, `collectionGroup`), walidacja `meta` i `profil` (`schemaVersion` całkowite, max 30 pól, zakaz kasowania), odrzucanie innych ścieżek pod `sowiegry`, lista 5 gier, zasady historii (`score` liczbowe, kasowanie tak, edycja nie).

## Dokumentacja planu

- `Analizy/ANALIZA_1_Firestore_zapis_postepu.md` — przeniesienie zapisu postępu do Firestore (model danych, hasło, reguły).
- `Analizy/ANALIZA_2_Przebudowa_gier.md` — przebudowa gier, menu główne, telefon jako główne urządzenie.
- `Analizy/ANALIZA_3_Plan_prac.md` — kolejność prac (etapy E0–E9).
- `docs/PLAN_ROZWOJU_CUTE_POLISH.md` — poprzedni plan reworku (do usunięcia w etapie E0).
- `docs/WDROZENIE_CUTE_POLISH.md` — poprzedni stan implementacji i lista testów ręcznych (do usunięcia w etapie E0).

## Dług techniczny

Gry nadal korzystają z części modułów opakowujących funkcje globalne. Wspólna warstwa została wydzielona, ale pełne scalenie każdego silnika do `game.js`, `config.js` i jawnego systemu hooków pozostaje osobnym etapem refaktoru.

Nie należy usuwać obecnych modułów przed wykonaniem testów regresji.
