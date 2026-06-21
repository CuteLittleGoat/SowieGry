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

### Kontrola składni

`.github/workflows/js-check.yml` wykonuje:

```bash
node --check
```

dla wszystkich plików JavaScript podczas push i pull request.

### Test uruchomieniowy

`tests/smoke.html` ładuje gry w ukrytych ramkach i sprawdza:

- poziomy trudności,
- główne funkcje startowe,
- dodatkowe życia,
- systemy balansu,
- wspólny profil,
- kluczowe systemy `Sowa3`.

### Tryb debug

Parametr:

```text
?debug=1
```

wyświetla dane diagnostyczne konkretnej gry.

## Dokumentacja planu

- `docs/PLAN_ROZWOJU_CUTE_POLISH.md` — plan reworku.
- `docs/WDROZENIE_CUTE_POLISH.md` — faktyczny stan implementacji i lista testów wymagających wykonania ręcznego.

## Dług techniczny

Gry nadal korzystają z części modułów opakowujących funkcje globalne. Wspólna warstwa została wydzielona, ale pełne scalenie każdego silnika do `game.js`, `config.js` i jawnego systemu hooków pozostaje osobnym etapem refaktoru.

Nie należy usuwać obecnych modułów przed wykonaniem testów regresji.
