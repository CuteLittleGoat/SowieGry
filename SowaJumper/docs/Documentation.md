# SowaJumper — przekierowanie do Sowy w Chmurach

Od etapu E6f (Analiza 3, zadanie 6.8) gra SowaJumper została zastąpiona przez **Sowę w Chmurach** (`SowaWChmurach/`, dokumentacja: `SowaWChmurach/docs/Documentation.md`). Identyfikator w bazie (`jumper`), rekordy, top 10 i historia są wspólne — nowa gra korzysta z tych samych danych.

Stare pliki gry (`script.js` i jedenaście warstw: `animation-polish.js`, `bonus-fix.js`, `bonus-lanes.js`, `cute-loader.js`, `cute-rework.js`, `difficulty.js`, `extra-lives.js`, `pause-final.js`, `platform-expansion.js`, `safety-balance.js`, a także `styles.css`) zostały usunięte (Analiza 2, rozdz. 6). Część dawnej gry w `shared/gameplay-expansion.js` (`initializeJumper`: panel „Precyzja i wyzwanie dnia SowaJumper”, precyzyjne lądowania liczone z globalnego `state`, przycisk uruchomienia wyzwania dnia) i rozpoznawanie folderu `sowajumper` w `shared/game-guides.js` też zniknęły — Sowa w Chmurach ma własną serię idealnych lądowań (metryka Akademii `jumperStreak` przez SowieProgress), combo i instrukcję.

## `index.html` — przekierowanie

W folderze został tylko `index.html`, żeby stare adresy i zakładki (także ekran główny telefonu) dalej działały:

- `<html lang="pl">`, `<meta charset="utf-8">`, `viewport` (`width=device-width,initial-scale=1.0,viewport-fit=cover`), `theme-color` `#bfe9ff`, ikona `../assets/icons/icon.svg`, tytuł „Sowa w Chmurach — SowieGry”;
- `<meta http-equiv="refresh" content="0; url=../SowaWChmurach/">` — przekierowanie także bez JavaScriptu;
- skrypt w `<head>`: `location.replace(\`../SowaWChmurach/${location.search}${location.hash}\`)` — przekierowanie od razu, **z parametrami adresu** (np. `?seed=…`, `?cloud=emulator` w testach) i bez wpisu w historii przeglądarki;
- `<body>`: akapit „SowaJumper to teraz Sowa w Chmurach.” z odnośnikiem `../SowaWChmurach/`.

Strona nie ładuje SowieCloud ani innych skryptów — niczego nie zapisuje w bazie.

## Testy

- `tests/unit/architecture.test.mjs` — w `SowaJumper/` zostały tylko `index.html` i `docs/`; strona przekierowuje do `../SowaWChmurach/` z zachowaniem parametrów adresu i nie ładuje skryptów; rejestr nie wskazuje już `SowaJumper/`, a Sowa w Chmurach nie jest podglądem.
- `tests/e2e/telefon/start.spec.js` — `/SowaJumper/?seed=przekierowanie` kończy na `/SowaWChmurach/?seed=przekierowanie`.
