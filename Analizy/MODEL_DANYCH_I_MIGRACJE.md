# Model danych, klucze zapisu i migracje SowieGry

**Aktualizacja:** 10 lipca 2026

## Wspólny profil

| Klucz `localStorage` | Właściciel | Wersja | Zawartość |
|---|---|---:|---|
| `sowieGryProfile` | `shared/sowie-platform.js` | 2 | ustawienia, kosmetyki, misje i wspólne statystyki |
| `sowieGryMigrationsVersion` | `shared/sowie-platform.js` | 2 | numer wykonanej warstwy migracji |
| `sowieGryBackup:*` | `shared/sowie-platform.js` | zależna od źródła | kopie rekordów sprzed migracji lub importu |

## Zapisy gier

| Klucz `localStorage` | Gra | Wersja schematu |
|---|---|---:|
| `sowieOgrodySave` | Sowie Ogrody | 2 |
| `sowiaSzklarniaSave` | Sowia Szklarnia | 1 |
| `sowaRunnerBestScore` | SowaRunner | zapis historyczny |
| `sowaRunnerBestDistance` | SowaRunner | zapis historyczny |
| `sowaJumperBestScore` | SowaJumper | zapis historyczny |
| `sowaJumperBestHeight` | SowaJumper | zapis historyczny |
| `sowa3Best` | Sowa3 | zapis historyczny |
| `sowa3FinishSeen` | Sowa3 | zapis historyczny |

Klucze historyczne pozostają obsługiwane, aby aktualizacja platformy nie usuwała dotychczasowych rekordów gracza.

## Zasady migracji

1. Każdy strukturalny zapis JSON ma pole `schemaVersion`.
2. Przed zmianą istniejącego rekordu tworzona jest kopia `sowieGryBackup:<klucz>:v<wersja>`.
3. Migracja jest idempotentna: kolejne uruchomienie na aktualnej wersji nie zmienia danych.
4. Brakujące pola są uzupełniane wartościami domyślnymi, a znane dane użytkownika są zachowywane.
5. Nieprawidłowy import nie może nadpisać istniejących danych.
6. Import akceptuje wyłącznie klucze należące do ekosystemu SowieGry.
7. Zmiana schematu wymaga fixture starego zapisu oraz testu migracji i ponownego uruchomienia migracji.

## Eksport i import

Eksport ma format:

```json
{
  "format": "SowieGrySave",
  "schemaVersion": 2,
  "exportedAt": "2026-07-10T00:00:00.000Z",
  "records": {
    "sowieGryProfile": "{...}"
  }
}
```

Wartości w `records` są oryginalnymi ciągami z `localStorage`. Pozwala to zachować zgodność ze starymi zapisami oraz przeprowadzić właściwą migrację dopiero po imporcie.

## Procedura dodania nowej migracji

1. Zwiększyć wersję schematu.
2. Dodać czystą funkcję przekształcającą poprzednią wersję w następną.
3. Zachować kopię oryginalnego rekordu.
4. Zweryfikować typy i zakresy wartości przed zapisem.
5. Dodać test starego zapisu, danych częściowych, błędnego JSON i idempotencji.
6. Opisać wpływ zmiany w pull requeście.
