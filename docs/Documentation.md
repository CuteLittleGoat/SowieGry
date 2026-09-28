# SowieGry — dokumentacja techniczna repozytorium

## Zakres

Repozytorium zawiera menu główne i pięć samodzielnych gier przeglądarkowych (bez etapu budowania, serwowanych przez GitHub Pages):

| Gra | Folder | Identyfikator w bazie | Rodzaj |
|---|---|---|---|
| SowaRunner | `SowaRunner/` | `runner` | arcade (p5.js) |
| SowaJumper | `SowaJumper/` | `jumper` | arcade (Canvas 2D) |
| Sowa3 | `Sowa3/` | `sowa3` | arcade (Canvas 2D, pseudo-3D) |
| Sowie Ogrody | `SowieOgrody/` | `ogrody` | idle |
| Sowia Szklarnia | `SowiaSzklarnia/` | `szklarnia` | idle |

Identyfikatory w bazie są stałe (są wpisane w opublikowane reguły Firestore) i nie zmieniają się przy zmianie nazw gier ani folderów. Wspólna warstwa w `shared/` zapewnia rejestr gier, **zapis postępu w Firestore (`SowieCloud`)**, ekran hasła, profil, kosmetyki, misje, Sowią Akademię, Galerię Sów, instrukcje, ustawienia, audio, pauzę i powiadomienia. Plan dalszych zmian: `Analizy/`.

## Struktura główna

```text
index.html                (menu główne)
config/
  firebase-config.js      (window.firebaseConfig — projekt rpg-dataslate-relay)
shared/
  sowie-platform.js       (rejestr gier, stałe, zdarzenia, ?seed= i ?testNow=)
  sowie-cloud.js          (SowieCloud — jedyny moduł z Firestore i pamięcią przeglądarki)
  password-gate.js        (ekran „Hasło sowy”, sówka ładowania, pasek offline, pytanie o nowszy postęp)
  sowie-core.js           (SowieCore — profil, kosmetyki, misje, ustawienia, audio, pauza, modale)
  notification-manager.js (kolejka powiadomień)
  sowie-runtime.js        (wspólny układ i ograniczone efekty)
  sowie-smoke-hook.js     (raportowanie błędów do tests/smoke.html)
  sowie-academy.js        (Sowia Akademia)
  owl-gallery.js/.css     (Galeria Sów)
  game-guides.js          (instrukcje gier)
  gameplay-expansion.js   (serie, precyzja, combo, wyzwanie dnia, kontrakty, album cech)
  stable-panel.js         (stabilny panel gier idle)
  modal-accessibility.js  (dostępność modali gier idle)
  main-menu.js/.css       (karty gier w menu)
  cute-ui.css, game-enhancements.css
tests/
  smoke.html
  e2e/            (testy Playwright; telefon/ — testy na profilach telefonów)
  unit/           (testy node --test)
  rules/          (testy reguł Firestore na emulatorze)
firebase.json     (tylko emulator Firestore)
firestore.rules   (kopia reguł opublikowanych 2026-09-27)
playwright.config.js
SowaRunner/ SowaJumper/ Sowa3/ SowieOgrody/ SowiaSzklarnia/   (gry, każda z docs/)
Obrazki/          (30 zdjęć Galerii Sów)
Analizy/          (analizy i plan prac)
docs/
.github/workflows/js-check.yml
```

## Kolejność skryptów na każdej stronie

Na początku (w `<head>` stron gier, na końcu `<body>` menu), ścieżki względne:

1. `config/firebase-config.js`
2. `shared/sowie-platform.js`
3. `shared/sowie-cloud.js`
4. `shared/password-gate.js`

Dopiero potem `sowie-core.js`, gra i pozostałe moduły. Test `tests/unit/architecture.test.mjs` pilnuje tej kolejności.

## Ekran startowy (menu)

`index.html` (`body.sowie-main-menu`) ma pasmo ozdób (sowa, koza, humbak, szklarnia — `pointer-events: none`), nagłówek „SowieGry”, przycisk garderoby `#cosmeticsButton` i sekcję `[data-game-cards]`. `shared/main-menu.js` generuje karty z `SowiePlatform.GAME_REGISTRY` (link `.game-card` + przycisk „❓ Jak grać w …”). Przycisk garderoby pokazuje ikonę i nazwę wybranego kosmetyku (`profil.cosmetics.selected`) i odświeża się na zdarzenie `profile:changed`. Ekran hasła pojawia się nad menu przy pierwszym wejściu na urządzeniu.

## Wspólna warstwa

### `shared/sowie-platform.js` — `window.SowiePlatform`

IIFE bez zapisu danych. Udostępnia (obiekt zamrożony):

- `GAME_REGISTRY` — 5 gier: `{ id, name, path, icon, kind, dailyMetric | saveVersion }`:
  - `runner` — „SowaRunner”, `SowaRunner/`, 🏃, `kind: "arcade"`, `dailyMetric: "distance"`;
  - `jumper` — „SowaJumper”, `SowaJumper/`, 🪶, `arcade`, `dailyMetric: "height"`;
  - `sowa3` — „Sowa3”, `Sowa3/`, 🛣️, `arcade`, `dailyMetric: "score"`;
  - `ogrody` — „Sowie Ogrody”, `SowieOgrody/`, 🌿, `kind: "idle"`, `saveVersion: 2`;
  - `szklarnia` — „Sowia Szklarnia”, `SowiaSzklarnia/`, 🏡, `idle`, `saveVersion: 1`;
- `COSMETICS` — 9 dodatków (`none`, `bow`, `glasses`, `flowerCrown`, `gardenerHat`, `cap`, `scarf`, `backpack`, `bubbleTrail`) z `label` i `icon`;
- `DEFAULT_SETTINGS` — `{ music: true, sfx: true, quips: true, reducedEffects: false }`;
- `DEFAULT_MISSIONS` — 7 misji `{ progress, target, done, reward }`: `leaves20` (20 → `glasses`), `extraLife` (1 → `flowerCrown`), `nearMiss3` (3 → `scarf`), `chaosFinish` (1 → `gardenerHat`), `combo4` (1 → `bubbleTrail`), `runner1000` (1000 → `cap`), `jumper250` (250 → `backpack`);
- `DEFAULT_STATS` — liczniki ogólne `{ leaves: 0, nearMisses: 0, extraLives: 0, finishes: 0, maxCombo: 1 }` (dawne statystyki dublujące rekordy gier przeszły do `profil.records`);
- `emit(type, detail)`, `on(type, listener)` — zdarzenia przez wspólny `EventTarget` (`profile:changed`, `cloud:status`, `cloud:ready`, `cloud:profile-reloaded`, `stat:recorded`, `mission:progress`, `cosmetic:*`, `game:*`, `modal:*`);
- `shouldRun(key, ms)` — ogranicznik częstotliwości; `createRng(seed)` — xorshift z ziarnem (FNV-1a); `random()`, `now()`;
- `?seed=…` podmienia `Math.random` na generator z ziarnem, `?testNow=ms` przesuwa `Date.now()` (testy i wyzwanie dnia).

Etap E1 usunął z platformy migracje, kopie `sowieGryBackup:*`, eksport i import JSON oraz odczyt/zapis profilu w pamięci przeglądarki.

### `shared/sowie-cloud.js` i `shared/password-gate.js`

Opis szczegółowy: rozdziały „SowieCloud — zapis postępu w Firestore” i „Ekran „Hasło sowy” i nakładki” poniżej.

### `shared/cute-ui.css`

Definiuje zmienne `--sowie-ink` (`#2b2733`), `--sowie-cream`, `--sowie-sky`, `--sowie-mint`, `--sowie-yellow` (`#ffd65a`), `--sowie-pink`, `--sowie-green`, `--sowie-card`, a także: pasek narzędzi (przyciski 44 × 44 px, na ekranach ≤ 520 px 38 × 38 px), modal garderoby, misji i ustawień, toasty, wskaźnik pauzy, panel debug, sekcję `.sowie-cloud-tools` w ustawieniach (odstęp 10 px, przycisk min. 48 px) oraz style ekranu hasła i nakładek SowieCloud. Pasek narzędzi jest pod HUD-em po lewej stronie, aby nie zasłaniać wyników. `prefers-reduced-motion` i klasa `sowie-reduced-effects` wyłączają animacje.

### `shared/sowie-core.js` — `window.SowieCore`

Wymaga `SowiePlatform` i `SowieCloud`. **Profil jest w `SowieCloud`** — moduł zawsze czyta bieżący obiekt przez `profile = () => SowieCloud.profile()` (po starcie chmury profil jest podmieniany).

- `getProfile()`, `settings()`, `selectedCosmetic()` (`profil.cosmetics.selected`);
- `unlockCosmetic(key, announce)` — dopisuje do `profil.cosmetics.unlocked` (`updateProfile`, zapis po 1 s), toast „Odblokowano: …”, dźwięk `unlock`; przed `SowieCloud.ready` odkładane;
- `selectCosmetic(key)` — `profil.cosmetics.selected` (zapis po 1 s), zdarzenie `profile:changed`;
- `progressMission(key, amount)` — postęp misji w `profil.missions` (zapis odroczony do 30 s); misje `runner1000` i `jumper250` co najwyżej co 500 ms; ukończenie odblokowuje nagrodę i pokazuje toast „Misja ukończona”;
- `recordStat(key, value, mode)` — tylko klucze z `DEFAULT_STATS`: `"add"` → `SowieCloud.increment("stats.<klucz>", n)` (sumuje się z wielu urządzeń), `"max"` → zapis tylko przy poprawie; inne klucze (np. dawne `runnerDistance`) są pomijane;
- dźwięk: `play(name)` (piski oscylatora, odstęp min. 90 ms na dźwięk), `startMusic(theme)` / `stopMusic()` (8 nut co 430 ms), `tone(...)`;
- `toast`, `maybeQuip` (co najmniej 6,5 s odstępu), `setDebugData` (`?debug=1`), `drawCanvasCosmetic(context, x, y, scale, rotation, key)`;
- `registerGame(adapter)` — adapter pauzy i motyw muzyczny gry; pasek narzędzi ⏸ 🎀 ⭐ ⚙ (`aria-label`: „Pauza”, „Garderoba”, „Misje”, „Ustawienia”);
- `openModal(tab)`, `closeModal()` — modal z pułapką fokusu, Escape, `inert` na tle;
- okno **Ustawienia**: przełączniki Muzyka / Efekty dźwiękowe / Komentarze sowy / Ograniczone efekty (`updateProfile`, zapis po 1 s), sekcja „Zapis postępu: <stan>” (`[data-cloud-status]`, aktualizowana przez `SowieCloud.onStatus`; etykiety: czeka na hasło, łączenie…, zapisano w chmurze ☁️, tryb offline — postęp nie jest zapisywany, zapisywanie…, błąd zapisu — spróbujemy ponownie; w trybie `?cloud=memory` — „tryb testowy (pamięć)”) i przycisk **„Wyloguj to urządzenie”** (`SowieCloud.lock()`). Eksport i import zapisu zostały usunięte;
- po `SowieCloud.ready` i przy ponownym wczytaniu profilu: klasa `sowie-reduced-effects`, zdarzenie `profile:changed`, start/stop muzyki zgodnie z ustawieniem. Zapis przy zejściu do tła wykonuje `SowieCloud` (`visibilitychange → flush`).

### `shared/sowie-academy.js` — `window.SowieAcademy`

Stan (XP, piórka, metryki, misje dzienne i tygodniowe, nagrody) jest w `profil.academy`. Moduł trzyma kopię roboczą: po `SowieCloud.ready` (i `onProfileReload`) wczytuje ją z profilu, uzupełnia okresy (`ensurePeriods`) i ocenia misje. `save()` przycina nagrody dzienne `daily:*` i `feature:*` starsze niż 30 dni (`SowieCloud.helpers.trimAwards`; `weekly:*`, `trait:*`, `gallery:*` zostają) i zapisuje kopię przez `updateProfile` (zapis odroczony, tylko zmienione pola). `record()` i `award()` wywołane przed startem chmury są odkładane. Misje dzienne: 3 z puli 12, wybierane deterministycznie z daty (UTC); tygodniowa: zagraj w 3 różne gry. Nagrody: 50 XP + 5 piórek (dzienna), 140 XP + 15 piórek (tygodniowa). Poziom: 100 XP na 1. poziom, każdy kolejny +35 XP.

### `shared/owl-gallery.js` — `window.SowieOwlGallery`

30 fotografii z `Obrazki/` (tytuł, opis, autor, link Pexels, warunek odblokowania z metryk Akademii). Stan (`unlocked`, `viewed`, `favorite`) jest w `profil.gallery`; wczytywany po `SowieCloud.ready`, zapisywany przez `updateProfile`. Przed wczytaniem `refreshUnlocks()` nic nie robi (nie nadpisze stanu z chmury). Nowe odblokowania pokazują toast „Nowa fotografia w Galerii Sów!”, obejrzenie wszystkich 30 daje nagrodę Akademii `gallery:complete`.

### `shared/gameplay-expansion.js`

Mechaniki dodatkowe per gra (seria liści w Runnerze, precyzyjne lądowania w Jumperze, combo w Sowa3, kontrakty w Ogrodach, cele laboratorium i album cech w Szklarni) oraz wyzwanie dnia (`?daily=1&seed=daily-RRRR-MM-DD-gra`). Zmiany E1:

- stan gier idle czyta przez `window.SowieIdleGame.snapshot()` (po `SowieIdleGame.ready`), a nie z pamięci przeglądarki;
- stan dnia kontraktów `{ date, baseline, claimed }` jest w dokumencie gry `sowiegry_gry/{gra}.daily` (`SowieCloud.game` / `updateGame`); dane z poprzedniego dnia są zastępowane;
- album cech Szklarni: `sowiegry_gry/szklarnia.traitAlbum` (tablica kluczy `wzrost|zapach`);
- rekord wyzwania dnia zapisuje gra przez `SowieCloud.submitRun()` (`dailyBest` w dokumencie gry); moduł nie zapisuje go sam.

### `shared/sowie-runtime.js`

Ustawia pionowy układ paska narzędzi i kolumny HUD (4 kolumny na ekranach ≤ 700 px) oraz synchronizuje klasę `sowie-reduced-effects` z preferencją systemu i ustawieniem profilu.

### `shared/sowie-smoke-hook.js`

Gdy gra działa w ramce `tests/smoke.html`, przesyła do rodzica (`postMessage`): błędy JavaScript, nieobsłużone odrzucenia Promise i informację o załadowaniu gry.

## Profil (Firestore: `sowiegry/profil`)

Jedyny profil gracza (Analiza 1, rozdział 4.1), wczytywany i zapisywany przez `SowieCloud`:

```text
schemaVersion: 1, name: "Sowa", createdAt, updatedAt, lastSeenAt (znaczniki czasu serwera)
settings:  { music, sfx, quips, reducedEffects }
cosmetics: { unlocked: ["none", "bow", …], selected: "none" }
missions:  { leaves20: { progress, target, done, reward }, … }
stats:     { leaves, nearMisses, extraLives, finishes, maxCombo }
academy:   { xp, feathers, metrics, daily, weekly, awards, version, updatedAt }
gallery:   { unlocked, viewed, favorite, version, updatedAt }
records:   { runner: { runs, lastPlayedAt, chill|arcade|chaos: { bestScore, bestDistance } },
             jumper: { …, bestScore, bestHeight }, sowa3: { …, bestScore },
             ogrody: { lifetimeLeaves, prestiges, zone }, szklarnia: { lifetimeLeaves, rooms, hybrids } }
```

Dokumenty gier: `sowiegry/profil/sowiegry_gry/{runner|jumper|sowa3|ogrody|szklarnia}` (`difficulty`, `finishSeen`, `top10`, `dailyBest`, `daily`, `traitAlbum`, `historyCount`; gry idle: `state`, `saveVersion`, `summary`, `savedAt`, `clientSavedAt`, `rev`, `deviceId`) i historia `…/sowiegry_historia/{autoId}`. Profil ma 12–15 pól najwyższego poziomu (reguły dopuszczają 30).

## Kosmetyki

Dostępne warianty: brak, kokardka, okulary, wianek, kapelusz ogrodnika, czapka z daszkiem, szalik, plecak, ślad bąbelków. Na start odblokowane: brak i kokardka. Kosmetyki nie wpływają na hitboxy ani parametry mechaniczne.

## Misje

20 liści, dodatkowe życie, 3 uniki „O włos!”, ukończenie etapu `Chaos`, combo `×4`, 1000 m w `SowaRunner`, 250 m w `SowaJumper`. Nagrodami są kosmetyki.

## Audio

Audio jest generowane przez Web Audio API bez zewnętrznych plików (efekty i prosta pętla muzyczna). Ustawienia: muzyka, efekty, komentarze sowy, ograniczone efekty wizualne. Każda gra rejestruje własny motyw muzyczny przez `SowieCore.registerGame()`.

## Systemy rozgrywki

Gry zręcznościowe mają poziomy `Chill`, `Arcade`, `Chaos` (rekordy osobno dla każdego), dodatkowe życia, zabezpieczenia przed niemożliwymi układami, combo, near miss, zwykłe, złote i tęczowe liście, gorączkę monster, animacje sowy, piórka i gwiazdki, wspólny profil, pauzę, audio i debug. Każda gra startuje rozgrywkę dopiero po `SowieCloud.ready` (postęp wczytany). Szczegóły w dokumentacji poszczególnych gier.

## Sowa3 — zasada czytelności

Dekoracje są dopuszczalne tylko po bokach ekranu, wysoko nad horyzontem i poza perspektywicznym korytarzem torów. `visibility-corridor.js` ponownie rysuje czystą trasę po wszystkich warstwach scenografii. Ruch ludzi i dzików kontroluje `moving-obstacle-safety.js` (anuluje zmianę toru, gdy tor docelowy jest zajęty, ruch zamknąłby trzy pasy albo ostrzeżenie pojawiłoby się zbyt późno).

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
- opcja `odblokowane` (domyślnie `true`): skrypt startowy kontekstu zapisuje `sowiegry:urzadzenie = { unlocked: true, deviceId: "d-…", cleaned: true }` (tylko gdy klucza jeszcze nie ma), więc testy nie muszą wpisywać hasła; testy ekranu hasła ustawiają `test.use({ odblokowane: false })`;
- `blockProduction(context, lista)` — ta sama blokada (i podawanie SDK) dla dodatkowych kontekstów tworzonych w teście;
- `unlockDevice(context)` — zapamiętane odblokowanie z unikalnym `deviceId`;
- `newDevice(browser, opcje)` — nowy kontekst przeglądarki = „drugie urządzenie” (własny `localStorage` i IndexedDB), z blokadą produkcji i odblokowaniem;
- `waitForCloud(page)` — czeka, aż `SowieCloud.isReady()` zwróci `true` (do 20 s);
- `setVisibility(page, "hidden" | "visible")` — symuluje przejście telefonu do innej aplikacji i powrót (podmienia `document.visibilityState` / `document.hidden` i wysyła `visibilitychange`);
- `watchErrors(page)` — zbiera `pageerror`, błędy konsoli i odpowiedzi HTTP ≥ 400 (bez `favicon.ico`).

### Pomocnicy emulatora (`tests/e2e/emulator.js`)

- `uniqueProject(testInfo)` — identyfikator projektu `demo-sowiegry-<proces>-<numer>-<czas><losowe>` dla izolacji testów;
- `cloudUrl(ścieżka, projekt)` — dopisuje `cloud=emulator&projekt=…`;
- `readDoc`, `listDocs`, `seedDoc` — odczyt, lista i zapis dokumentów przez REST emulatora (`http://127.0.0.1:8080/v1/projects/…/documents/…`, nagłówek `Authorization: Bearer owner` omija reguły), z konwersją typów Firestore ↔ JSON (znaczniki czasu → milisekundy).

### Testy obecnych gier (desktop, `tests/e2e/*.spec.js`)

- `smoke.spec.js` — menu z 5 kartami, każda gra startuje po wczytaniu postępu (Runner `mode === SCREEN.RUN`, Jumper `state.scene === "playing"`, Sowa3 `state.mode === "run"`, gry idle — licznik kliknięć), profil z `SowieCloud` (`schemaVersion: 1`), wspólne powiadomienia;
- `guides-and-expansion.spec.js` — instrukcje, Akademia i panele rozszerzeń w każdej grze, idempotentne nagrody Akademii;
- `owl-gallery.spec.js` — Galeria: nagrody, źródło, ulubiona fotografia w `profil.gallery`; profil z osiągnięciami zapisany wcześniej w emulatorze odblokowuje 30 zdjęć i zapisuje je w bazie; galeria dostępna z każdej gry;
- `platform.spec.js` — kasowanie wyłącznie starych kluczy SowieGry (dane innych stron zostają, zostaje `sowiegry:urzadzenie`), zapis stanu Ogrodów i Szklarni w emulatorze przy zejściu do tła i odtworzenie po przeładowaniu, stabilny panel Szklarni, modal z fokusem, ustawienia (stan zapisu, zapis ustawienia w bazie, „Wyloguj to urządzenie”), ograniczenie ruchu.

### Testy na telefonach (`tests/e2e/telefon/`)

`start.spec.js`:

- menu główne i każda z pięciu gier otwiera się bez błędów (znacznik strony widoczny, brak błędów po 0,5 s);
- menu główne mieści się w szerokości ekranu (`scrollWidth ≤ innerWidth`).

`chmura.spec.js` (Analiza 3, zadanie 1.9):

- ekran „Hasło sowy”: atrybuty pola (`autocapitalize`, `autocorrect`, `spellcheck`, `enterkeyhint`), czcionka ≥ 16 px, przycisk „Wejdź” ≥ 48 px, w całości na ekranie i w dolnej połowie, brak przewijania w bok i powiększenia po dotknięciu pola, błąd dla „hu hu”, oczko, wejście przez „ Huhu ” + Enter, w `localStorage` tylko `sowiegry:urzadzenie`, po przeładowaniu brak ekranu hasła;
- pisanie hasła na stronie SowaRunner nie uruchamia gry; po wejściu stuknięcie startuje bieg;
- emulator: pierwsze połączenie tworzy `sowiegry/meta` (schemaVersion 1, 5 gier, `createdAt`) i `sowiegry/profil`; status `online`;
- emulator: koniec gry w SowaJumper zapisuje rekord (`records.jumper.arcade`, `runs`, `top10`, historia), a **drugi kontekst przeglądarki (drugie urządzenie)** widzi ten rekord w `SowieCloud.records` i na ekranie gry;
- emulator: zejście do tła zapisuje stan Ogrodów od razu, a powrót po 10 minutach pokazuje okno postępu offline.

### Emulator Firestore

- `firebase.json` konfiguruje **wyłącznie emulator**: reguły z `firestore.rules`, emulator Firestore na `127.0.0.1:8080`, wyłączony interfejs emulatora (`ui.enabled: false`), `singleProjectMode: false`. Nie ma pliku `.firebaserc`, więc narzędzie nie ma domyślnego projektu produkcyjnego; reguły produkcyjne publikuje właściciel ręcznie w konsoli;
- `npm run emulator -- "<polecenie>"` uruchamia dowolne polecenie z działającym emulatorem projektu `demo-sowiegry` (projekty z przedrostkiem `demo-` nigdy nie łączą się z usługami Google);
- emulator stosuje reguły z `firestore.rules` do każdego identyfikatora projektu, co pozwala izolować testy osobnymi projektami `demo-sowiegry-…`;
- emulator wymaga Javy 11+ (w CI: `actions/setup-java`, Temurin 21) i przy pierwszym uruchomieniu pobiera plik JAR do `~/.cache/firebase/emulators` (w CI ten katalog jest w `actions/cache`);
- logi emulatora trafiają do `firestore-debug.log` (ignorowany przez git, dołączany do artefaktów CI przy błędzie).

### Test architektury (`tests/unit/architecture.test.mjs`)

- rejestr ma dokładnie 5 gier; menu generowane z rejestru; każda gra ładuje platformę i wspólne powiadomienia;
- **`localStorage` i `sessionStorage` występują tylko w `shared/sowie-cloud.js`** (przeszukiwane są wszystkie pliki `.js` w `shared/`, `config/` i folderach gier, bez `p5.js`);
- `shared/progress-reset.js` i `shared/idle-save-bridge.js` nie istnieją i nie są ładowane; platforma nie ma migracji, kopii, eksportu ani importu; ustawienia mają „Wyloguj to urządzenie”;
- każda strona ładuje `config/firebase-config.js`, `sowie-platform.js`, `sowie-cloud.js`, `password-gate.js` w tej kolejności i przed `sowie-core.js`;
- `sowie-cloud.js` nie czyści całej pamięci (`clear`), ma hasło `huhu`, klucz `sowiegry:urzadzenie`, przypiętą wersję SDK, nazwaną aplikację i cache IndexedDB; wszystkie ścieżki w kodzie leżą w kolekcjach `sowiegry`, `sowiegry_gry`, `sowiegry_historia`, a żaden inny plik nie używa Firestore;
- gry idle ładują stan przez `loadGameState`, zapisują przez `saveGameState`, udostępniają `SowieIdleGame` i nie mają warunku `now % 7000`.

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

Od etapu E1 plik jest ładowany na każdej stronie jako pierwszy skrypt; czyta go wyłącznie `shared/sowie-cloud.js` (Firebase JS SDK 12.19.0, nazwana aplikacja `sowiegry`). Komentarz w pliku opisuje współdzielenie projektu i to, że SowieGry używają tylko kolekcji `sowiegry` (z podkolekcjami `sowiegry_gry` i `sowiegry_historia`). Wartości konfiguracji nie są zmieniane. Kolekcja `sowiegry` powstaje przy pierwszym uruchomieniu wersji E1 na docelowej domenie po wpisaniu hasła (zapis `sowiegry/meta` i `sowiegry/profil`).

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

Po zbudowaniu stan bazowy = kopia stanu w pamięci. Podczas zapisu status `"zapisywanie"`, po błędzie `"blad"` i `console.error`. `flush()` przed startem czeka na `ready`; zwracana obietnica rozwiązuje się, gdy dotrą do bazy **wszystkie** zapisy — także wysłane wcześniej (np. przez `submitRun`), a offline dopiero po powrocie sieci (dlatego zdarzenia `visibilitychange` jej nie czekają, a `lock()` czeka najwyżej 1,5 s).

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
| `flush()` | natychmiastowe wysłanie kolejki; Promise rozwiązany po potwierdzeniu wszystkich zapisów w drodze |
| `onConflict(fn)`, `onProfileReload(fn)` | pytanie o nowszy stan gry idle; ponowne wczytanie profilu z serwera |
| `offlineReason()` | `null`, `"sdk"` albo `"profil"` |
| `backendKind()`, `mode()`, `gameId()`, `deviceId()`, `removedKeys()` | informacje diagnostyczne (tryb: `memory` / `emulator` / `firestore`) |
| `helpers` | `{ trimAwards, trimDaily, dayKey }` — przycinanie nagród i rekordów dnia (używa Sowia Akademia) |

**`submitRun(gameId, { score, distance?, height?, leaves?, durationMs?, difficulty = "arcade", daily?, seed? })`** — jeden zapis zbiorczy na rozgrywkę:

- `profil.records[gameId]`: `runs` +1 (`increment`), `lastPlayedAt`, w `[poziom]` pola `bestScore`, `bestDistance`, `bestHeight` — tylko przy poprawie;
- dokument gry: `top10[poziom]` (`insertTop`), przy `daily: true` `dailyBest[RRRR-MM-DD]` = max wartości metryki dnia gry (`GAME_REGISTRY[].dailyMetric`: Runner — dystans, Jumper — wysokość, Sowa3 — wynik), przycięte do 30 dni; `historyCount` +1;
- nowy wpis `sowiegry_historia`: `{ score, distance?, height?, leaves?, durationMs?, difficulty, daily, seed, at: serverTimestamp }`;
- gdy `historyCount > 60`, najstarsze wpisy ponad 50 są kasowane (`query(orderBy("at","asc"), limit(nadmiar))` + `delete`, `historyCount` −n). Nie używamy polityk TTL, bo działają na grupę kolekcji w całej (współdzielonej) bazie.

### Start w przeglądarce

- wymaga `window.SowiePlatform` (rejestr gier) — w każdej stronie kolejność skryptów: `config/firebase-config.js`, `shared/sowie-platform.js`, `shared/sowie-cloud.js`, `shared/password-gate.js`;
- **tryb** (`resolveMode()`): `?cloud=memory | emulator | firestore` (zapamiętany w `sessionStorage` tej karty, więc przejście linkiem do gry zachowuje tryb), opcjonalnie `?projekt=demo-…` dla emulatora (izolacja testów; dozwolone `demo-` + 1–50 znaków `[a-z0-9-]`). Bez parametru: na `localhost` / `127.0.0.1` / `::1` — **pamięć** (lokalne uruchomienie nigdy nie zapisuje do produkcyjnej bazy; produkcję lokalnie włącza `?cloud=firestore`), na każdej innej domenie (GitHub Pages) — Firestore z `window.firebaseConfig`;
- emulator: konfiguracja `{ apiKey: "demo-api-key", projectId: "demo-sowiegry" (albo z ?projekt=), appId: "demo-sowiegry" }` + `connectFirestoreEmulator("127.0.0.1", 8080)`;
- gra bieżącej strony: pierwszy wpis `GAME_REGISTRY`, którego `/${path}` występuje w `location.pathname`;
- import SDK startuje od razu przy ładowaniu strony (równolegle z ekranem gry i ekranem hasła);
- `window.SowieCloud.submitRun` dopisuje domyślnie `daily` (`?daily=1`) i `seed` (`?seed=`) z adresu strony, więc gry nie muszą ich przekazywać;
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
- `docs/AUDYT_MERGE_CUTE_POLISH.md`, `docs/PLAN_ROZWOJU_CUTE_POLISH.md`, `docs/WDROZENIE_CUTE_POLISH.md` — nieaktualne dokumenty starego układu (opisują m.in. zapis w pamięci przeglądarki); zgodnie z planem (E0.4) do usunięcia — czekają na decyzję właściciela.

## Dług techniczny

Gry nadal korzystają z części modułów opakowujących funkcje globalne. Wspólna warstwa została wydzielona, ale pełne scalenie każdego silnika do `game.js`, `config.js` i jawnego systemu hooków pozostaje osobnym etapem refaktoru.

Nie należy usuwać obecnych modułów przed wykonaniem testów regresji.
