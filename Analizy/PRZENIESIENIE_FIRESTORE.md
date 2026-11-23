# Przeniesienie SowieGry do własnego projektu Firebase (2026-11-23)

> Prośba właściciela (2026-11-23): „Dodatkowo będę chciał przenieść projekt do innego projektu Firestore na innym
> koncie. Trzeba będzie przygotować jakiś mechanizm do zrobienia backupu danych i wgrania ich do nowego projektu.” —
> „Przeprowadź migrację do nowego projektu. NIC nie kasuj ze starego póki nie potwierdzimy, że wszystko działa.” —
> „nie interesują mnie płatne plany Firebase — wszystko robimy na darmowych”.

## 1. Co i skąd dokąd

| | Stary projekt | Nowy projekt |
| --- | --- | --- |
| Identyfikator | `rpg-dataslate-relay` | `sowiegry-1e1f9` (konto właściciela, aplikacja internetowa „SowieGry”) |
| Zawartość | SowieGry **i** inna aplikacja właściciela (`audio`, `character_builder`, `dataslate`) | tylko SowieGry |
| Po przeniesieniu | **nic nie jest kasowane** — dane SowieGry zostają jako archiwum, druga aplikacja działa jak dotąd | gra czyta i zapisuje tylko tutaj |

Kopiowane są wyłącznie dokumenty SowieGry (dokładnie te, które dopuszczają reguły):

- `sowiegry/meta` i `sowiegry/profil` (profil: Akademia, piórka, Butik, Galeria, ustawienia, rekordy, misje),
- `sowiegry/profil/sowiegry_gry/<gra>` — dokumenty gier (`runner`, `jumper`, `sowa3`, `ogrody`, `szklarnia`, od M5
  także `trojki`): stan gier idle, top 10, liczniki,
- `sowiegry/profil/sowiegry_gry/<gra>/sowiegry_historia/<wpis>` — historia rozgrywek.

Stan w chwili kopii zapasowej przed przeniesieniem: **49 dokumentów** — meta, profil, 5 gier, 42 wpisy historii
(Sowa w Chmurach 23, Sowia Ucieczka 9, Sowie Tory 10).

## 2. Mechanizm — `scripts/kopia-firestore.mjs` (darmowy plan Spark)

Eksport i import przez **REST API Firestore z kluczem aplikacji internetowej** — tak jak gra, więc działa na darmowym
planie (bez płatnego eksportu Google Cloud do zasobnika) i podlega regułom bazy. Wartości pól przechodzą 1:1 (liczby,
napisy, mapy, listy, znaczniki czasu), identyfikatory dokumentów (także wpisów historii) zostają te same.

- **Źródło tylko czytane.** Skrypt nie ma żadnej operacji kasowania ani zmiany.
- **Cel — tylko tworzenie brakujących dokumentów** (warunek „dokument nie istnieje”): istniejące zostają nietknięte
  i są wymieniane w raporcie; ponowne uruchomienie niczego nie zmienia.
- **Kopia zapasowa w pliku** (JSON: format, wersja, data, projekt źródłowy, liczby, suma kontrolna SHA-256 pól) —
  import odrzuca plik zmieniony albo bez profilu.
- **Weryfikacja** po imporcie: odczyt celu i porównanie każdego dokumentu z kopią (pola 1:1).

```bash
node scripts/kopia-firestore.mjs eksport  --projekt P --klucz K --plik kopia.json
node scripts/kopia-firestore.mjs import   --projekt P --klucz K --plik kopia.json [--proba]
node scripts/kopia-firestore.mjs porownaj --projekt P --klucz K --plik kopia.json
node scripts/kopia-firestore.mjs kopiuj   --z P1 --klucz-z K1 --do P2 --klucz-do K2 --plik kopia.json
```

Klucz `K` to `apiKey` z konfiguracji aplikacji internetowej projektu (nie jest tajny — o dostępie decydują reguły).
Ten sam skrypt służy do zwykłej kopii zapasowej (`eksport`) w dowolnej chwili. Testy: `tests/rules/kopia-firestore.test.mjs`
(emulator z regułami nowego projektu: kopia 1:1, gra spoza reguł pominięta, dane innej aplikacji nie trafiają do kopii,
ponowne uruchomienie bez zmian, źródło bez zmian, plik ze złą sumą odrzucony).

## 3. Reguły nowego projektu

Ta sama część reguł SowieGry co w starym projekcie (z grą `trojki`), bez reguły ogólnej dla kolekcji drugiej
aplikacji — w nowym projekcie wszystko poza SowieGry jest zamknięte. Kopia w repozytorium: `firestore.rules`
(test: `tests/unit/firestore-rules.test.mjs` pilnuje, że plik jest identyczny z tym blokiem; testy reguł na
emulatorze: `tests/rules/firestore-rules.test.mjs`).

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // SowieGry (projekt sowiegry-1e1f9). Wszystko poza ścieżkami niżej jest zamknięte.
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
        allow create, update, delete: if gra in ["runner", "jumper", "sowa3", "ogrody", "szklarnia", "trojki"];

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

## 4. Kroki

| # | Kto | Co | Stan |
| --- | --- | --- | --- |
| 1 | właściciel | nowy projekt `sowiegry-1e1f9`, baza Firestore, aplikacja internetowa „SowieGry” | ✅ 2026-11-23 |
| 2 | Claude | skrypt kopii z testami na emulatorze; kopia zapasowa starego projektu (tylko odczyt, 49 dokumentów) | ✅ 2026-11-23 |
| 3 | właściciel | reguły z rozdziału 3 opublikowane w nowym projekcie | ⏳ |
| 4 | Claude | kopia starego → nowy (`kopiuj`), porównanie 1:1 | ⏳ |
| 5 | Claude | `config/firebase-config.js` → `sowiegry-1e1f9`, `sw.js` nowa wersja, na `main` | ⏳ |
| 6 | właściciel i użytkownik | odświeżyć aplikację dwa razy; postęp jest; nowa gra zapisuje się w nowym projekcie (test M1 w `TESTY_NA_TELEFONIE.md`) | ⏳ |
| 7 | właściciel | po potwierdzeniu, że wszystko działa — decyzja, czy i kiedy usunąć stare dane SowieGry (do tego czasu **nic nie kasujemy**) | ⏳ |

**Między krokiem 4 a odświeżeniem telefonów (krok 6) najlepiej nie grać** — postęp zapisany w tej chwili trafiłby
jeszcze do starego projektu. Gdyby tak się stało, skrypt może dokopiować brakujące wpisy (nowe dokumenty), a zmian
w istniejących dokumentach (profil, stan gry) nie nadpisuje — wtedy wystarczy powtórzyć ostatnią grę.

## 5. Gdyby coś poszło nie tak

- Stary projekt jest nietknięty — powrót to przywrócenie poprzedniej wersji `config/firebase-config.js` (jeden commit)
  i nowa wersja `sw.js`; telefony po odświeżeniu znowu łączą się ze starym projektem.
- Pliki kopii zapasowej (JSON) z kroku 2 i 4 są u Claude'a w sesji i w wiadomości do właściciela; skrypt `import`
  wgra je do dowolnego projektu z regułami SowieGry.
- Telefony trzymają w pamięci dane osobno dla każdego projektu (pamięć Firestore w przeglądarce jest według projektu),
  więc po przełączeniu nie mieszają danych dwóch projektów.
