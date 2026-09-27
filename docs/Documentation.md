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

Reguły sprawdzono na emulatorze Firestore (26 scenariuszy zgodnych z oczekiwaniem). Kolekcja `sowiegry` jeszcze nie istnieje w bazie; powstanie przy pierwszym uruchomieniu wersji z etapu E1. Każda zmiana reguł wymaga edycji pliku `firestore.rules` w repo (dodawanego w etapie E0) i ponownej publikacji w konsoli przez właściciela.

## Dokumentacja planu

- `Analizy/ANALIZA_1_Firestore_zapis_postepu.md` — przeniesienie zapisu postępu do Firestore (model danych, hasło, reguły).
- `Analizy/ANALIZA_2_Przebudowa_gier.md` — przebudowa gier, menu główne, telefon jako główne urządzenie.
- `Analizy/ANALIZA_3_Plan_prac.md` — kolejność prac (etapy E0–E9).
- `docs/PLAN_ROZWOJU_CUTE_POLISH.md` — poprzedni plan reworku (do usunięcia w etapie E0).
- `docs/WDROZENIE_CUTE_POLISH.md` — poprzedni stan implementacji i lista testów ręcznych (do usunięcia w etapie E0).

## Dług techniczny

Gry nadal korzystają z części modułów opakowujących funkcje globalne. Wspólna warstwa została wydzielona, ale pełne scalenie każdego silnika do `game.js`, `config.js` i jawnego systemu hooków pozostaje osobnym etapem refaktoru.

Nie należy usuwać obecnych modułów przed wykonaniem testów regresji.
