# Sowa3 — przekierowanie do Sowich Torów

Od etapu E5f (Analiza 3, zadanie 5.8) gra Sowa3 została zastąpiona przez **Sowie Tory** (`SowieTory/`, dokumentacja: `SowieTory/docs/Documentation.md`). Identyfikator w bazie (`sowa3`), rekordy, top 10 i historia są wspólne — nowa gra korzysta z tych samych danych (rekordy dawnej gry to rekordy domyślnego trybu „Kampania”; tryb „Nieskończony” ma osobne klucze `nieskonczony-<poziom>`).

Stare pliki gry (`script.js` i szesnaście warstw poprawek: `amic-stage.js`, `animation-polish.js`, `cute-rework.js`, `difficulty.js`, `extra-lives.js`, `finish-controls.js`, `finish-details.js`, `finish-pool.js`, `lane-balance.js`, `moving-obstacle-safety.js`, `pause-guard.js`, `stage-ambience.js`, `stage-obstacles.js`, `visibility-corridor.js`, `visual-polish.js`, a także `style.css`) zostały usunięte (Analiza 2, rozdz. 3.3 „Usuwamy” i rozdz. 6). Część dawnej gry w `shared/gameplay-expansion.js` (`initializeSowa3`: combo liści dopisywane z zewnątrz) i rozpoznawanie folderu `sowa3` w `shared/game-guides.js` też zniknęły — Sowie Tory mają własne combo, Gorączkę Monster i instrukcję.

## `index.html` — przekierowanie

W folderze został tylko `index.html`, żeby stare adresy i zakładki (także ekran główny telefonu) dalej działały:

- `<html lang="pl">`, `<meta charset="utf-8">`, `viewport` (`width=device-width,initial-scale=1.0,viewport-fit=cover`), `theme-color` `#bfe9ff`, ikona `../assets/icons/icon.svg`, tytuł „Sowie Tory — SowieGry”;
- `<meta http-equiv="refresh" content="0; url=../SowieTory/">` — przekierowanie także bez JavaScriptu;
- skrypt w `<head>`: `location.replace(\`../SowieTory/${location.search}${location.hash}\`)` — przekierowanie od razu, **z parametrami adresu** (np. `?seed=…`, `?plansza=2`, `?cloud=emulator` w testach) i bez wpisu w historii przeglądarki (przycisk „Wstecz” nie wraca na stronę przekierowania);
- `<body>`: akapit „Sowa3 to teraz Sowie Tory.” z odnośnikiem `../SowieTory/` (gdyby przekierowanie się nie udało).

Strona nie ładuje SowieCloud ani innych skryptów — niczego nie zapisuje w bazie.

## Misja garderoby „chaosFinish”

Dawna Sowa3 kończyła misję `chaosFinish` (nagroda: Kapelusz ogrodnika) po dotarciu do mety na poziomie Chaos i liczyła `stats.finishes`. W Sowich Torach robi to `shared/meta/missions.js`: zdarzenie `run:ended` z `finished: true` (ukończona kampania) dodaje 1 do `stats.finishes`, a przy `difficulty: "chaos"` (poziom z `progress.beginRun`) — postęp misji `chaosFinish` („Ukończ kampanię Sowich Torów na poziomie Chaos”).

## Testy

- `tests/unit/architecture.test.mjs` — w `Sowa3/` zostały tylko `index.html` i `docs/`; strona przekierowuje do `../SowieTory/` z zachowaniem parametrów adresu i nie ładuje skryptów; rejestr gier nie wskazuje już `Sowa3/`, a Sowie Tory nie są podglądem.
- `tests/e2e/telefon/start.spec.js` — `/Sowa3/?plansza=2&seed=przekierowanie` kończy na `/SowieTory/?plansza=2&seed=przekierowanie`, a bieg zaczyna się od planszy 2.
- `tests/unit/missions.test.mjs` — ukończona kampania na poziomie Chaos kończy misję `chaosFinish`.
