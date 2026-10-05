# Sowia Szklarnia — przekierowanie do Łącz i Hoduj

Od etapu E8e (Analiza 3, rozdz. 8.8) gra Sowia Szklarnia została zastąpiona przez **Łącz i Hoduj** (`LaczIHoduj/`, dokumentacja: `LaczIHoduj/docs/Documentation.md`). Identyfikator w bazie (`szklarnia`) i dokument gry są wspólne: nowa gra zapisuje stan w wersji 2 w polu `state` (`saveVersion: 2`), a dawny stan (wersja 1) czyta tylko raz — jako źródło pakietu startowego (`starterPack`: liście, odnowione pomieszczenia, gwiazdki i Kózka Dżoker za hybrydy).

Stare pliki gry (`script.js`, `style.css`) i wspólny stabilny panel dawnych gier idle (`shared/stable-panel.js`) zostały usunięte (Analiza 2, rozdz. 3.5 i rozdz. 6). Od tej chwili żadna strona nie ładuje dawnych modułów SowieCore (dok przycisków, okno Rekordów, rozszerzenia, menedżer powiadomień) — porządki w nich robi etap E9.

## `index.html` — przekierowanie

W folderze został tylko `index.html`, żeby stare adresy i zakładki (także ekran główny telefonu) dalej działały:

- `<html lang="pl">`, `<meta charset="utf-8">`, `viewport` (`width=device-width,initial-scale=1.0,viewport-fit=cover`), `theme-color` `#bfe9ff`, ikona `../assets/icons/icon.svg`, tytuł „Łącz i Hoduj — SowieGry”;
- `<meta http-equiv="refresh" content="0; url=../LaczIHoduj/">` — przekierowanie także bez JavaScriptu;
- skrypt w `<head>`: `location.replace(\`../LaczIHoduj/${location.search}${location.hash}\`)` — przekierowanie od razu, **z parametrami adresu** (np. `?seed=…`, `?cloud=emulator` w testach) i bez wpisu w historii przeglądarki;
- `<body>`: akapit „Sowia Szklarnia to teraz Łącz i Hoduj.” z odnośnikiem `../LaczIHoduj/`.

Strona nie ładuje SowieCloud ani innych skryptów — niczego nie zapisuje w bazie.

## Testy

- `tests/unit/architecture.test.mjs` — w `SowiaSzklarnia/` zostały tylko `index.html` i `docs/`; strona przekierowuje do `../LaczIHoduj/` z zachowaniem parametrów adresu i nie ładuje skryptów; rejestr nie wskazuje już `SowiaSzklarnia/`, a Łącz i Hoduj nie jest podglądem.
- `tests/e2e/telefon/start.spec.js` — `/SowiaSzklarnia/?seed=przekierowanie` kończy na `/LaczIHoduj/?seed=przekierowanie`.
- `tests/e2e/telefon/lacz.spec.js` (emulator) — wejście przez `/SowiaSzklarnia/` z zapisem podglądu w polu `preview` przenosi go do `state`.
