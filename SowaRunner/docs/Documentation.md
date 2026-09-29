# SowaRunner — przekierowanie do Sowiej Ucieczki

Od etapu E4f (Analiza 3, zadanie 4.6) gra SowaRunner została zastąpiona przez **Sowią Ucieczkę** (`SowiaUcieczka/`, dokumentacja: `SowiaUcieczka/docs/Documentation.md`). Identyfikator w bazie (`runner`), rekordy, top 10, historia i rekordy dnia są wspólne — nowa gra korzysta z tych samych danych.

Stare pliki gry (`sketch.js`, siedem warstw poprawek: `animation-polish.js`, `cute-rework.js`, `extra-lives.js`, `obstacle-balance.js`, `pause-final.js`, `render-fix.js`, `runner-events-extra.js`, a także `p5.js`, `p5-early-random.js` i `style.css`) zostały usunięte (Analiza 2, rozdz. 3.1 „Usuwamy” i rozdz. 6).

## `index.html` — przekierowanie

W folderze został tylko `index.html`, żeby stare adresy i zakładki (także ekran główny telefonu) dalej działały:

- `<html lang="pl">`, `<meta charset="utf-8">`, `viewport` (`width=device-width,initial-scale=1.0,viewport-fit=cover`), `theme-color` `#bfe9ff`, ikona `../assets/icons/icon.svg`, tytuł „Sowia Ucieczka — SowieGry”;
- `<meta http-equiv="refresh" content="0; url=../SowiaUcieczka/">` — przekierowanie także bez JavaScriptu;
- skrypt w `<head>`: `location.replace(\`../SowiaUcieczka/${location.search}${location.hash}\`)`— przekierowanie od razu, **z parametrami adresu** (np.`?daily=1`, `?seed=…`, `?cloud=emulator` w testach) i bez wpisu w historii przeglądarki (przycisk „Wstecz” nie wraca na stronę przekierowania);
- `<body>`: akapit „SowaRunner to teraz Sowia Ucieczka.” z odnośnikiem `../SowiaUcieczka/` (gdyby przekierowanie się nie udało).

Strona nie ładuje SowieCloud ani innych skryptów — niczego nie zapisuje w bazie.

## Testy

- `tests/unit/architecture.test.mjs` — w `SowaRunner/` zostały tylko `index.html` i `docs/`; strona przekierowuje do `../SowiaUcieczka/` z zachowaniem parametrów adresu i nie ładuje skryptów.
- `tests/e2e/telefon/start.spec.js` — `/SowaRunner/?daily=1` kończy na `/SowiaUcieczka/?daily=1`.
