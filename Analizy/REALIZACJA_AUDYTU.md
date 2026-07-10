# Realizacja audytu SowieGry

**Data:** 10 lipca 2026  
**Gałąź:** `audit/all-fixes`  
**Pull request:** `#9`

## Status ustaleń

| Ustalenie audytu | Status | Implementacja |
|---|---|---|
| Testy obejmowały tylko trzy gry | wykonane | Playwright uruchamia wszystkie pięć gier w widoku desktopowym i mobilnym; `tests/smoke.html` również korzysta z rejestru pięciu gier |
| CI sprawdzało tylko składnię | wykonane | składnia, ESLint, Prettier, walidacja HTML, testy jednostkowe i testy przeglądarkowe są osobnymi etapami workflow |
| Powiadomienia znajdowały się w katalogu `Sowa3` | wykonane | moduł został przeniesiony do `shared/notification-manager.js`; lokalna kopia została usunięta |
| Lista gier, profil i kosmetyki były duplikowane | wykonane | `shared/sowie-platform.js` jest źródłem rejestru, schematu profilu i kosmetyków; strona główna generuje karty z rejestru |
| Runtime podmieniał metody w czasie działania | wykonane | `shared/sowie-runtime.js` nie podmienia metod; usunięto `SowieOgrody/ogrody-runtime.js`; zdarzenia udostępnia `SowiePlatform.emit/on` |
| Panel Sowej Szklarni tracił węzły i fokus | wykonane | `shared/stable-panel.js` wykonuje częściową synchronizację DOM i zachowuje fokus, zaznaczenie oraz delegowane zdarzenia |
| Autosave zależał od fazy klatki | wykonane | `shared/idle-save-bridge.js` używa niezależnego harmonogramu oraz zapisuje przy `visibilitychange` i `pagehide` |
| Migracja postępu była jednorazowym resetem | wykonane | wprowadzono `schemaVersion`, migracje idempotentne i kopie `sowieGryBackup:*`; skrypt zgodności nie usuwa danych |
| Brakowało eksportu i importu | wykonane | ustawienia wspólnego modala udostępniają eksport i import formatu `SowieGrySave` |
| Modale nie miały pełnego zarządzania fokusem | wykonane | fokus początkowy, focus trap, Escape, przywrócenie fokusu, role ARIA i blokada tła |
| Animacje nie respektowały ograniczenia ruchu | wykonane | CSS obsługuje `prefers-reduced-motion`; profil ma ustawienie `reducedEffects` |
| Testy były niedeterministyczne | wykonane | parametr `seed` ustawia generator pseudolosowy, a `testNow` kontroluje zegar testowy |
| Klucze zapisu nie były udokumentowane | wykonane | `Analizy/MODEL_DANYCH_I_MIGRACJE.md` opisuje właścicieli, wersje, kopie i procedurę migracji |

## Warstwa danych

Wspólny profil ma wersję schematu `2`. Normalizacja zachowuje rozpoznane dane użytkownika, uzupełnia brakujące pola i odrzuca nieznane kosmetyki. Przed modyfikacją starszego rekordu zapisywana jest kopia bezpieczeństwa.

Import przyjmuje wyłącznie format `SowieGrySave` i klucze należące do projektu. Po imporcie uruchamiane są te same migracje co przy zwykłym starcie aplikacji.

## Warstwa zdarzeń

Platforma udostępnia jawne zdarzenia między innymi dla:

- zmian profilu;
- odblokowania i wyboru kosmetyku;
- postępu misji;
- naliczenia statystyki;
- migracji i importu zapisu;
- żądania zapisu;
- rejestracji, pauzy i wznowienia gry;
- otwarcia i zamknięcia modala.

Dzięki temu moduły nie muszą opakowywać ani zastępować metod innych modułów.

## Weryfikacja

Workflow wykonuje kolejno:

```text
npm run syntax
npm run lint
npm run format:check
npm run html
npm run test:unit
npm run test:e2e
```

Playwright uruchamia dwa projekty:

- `desktop-chromium`;
- `mobile-chromium` na profilu Pixel 7.

Testy sprawdzają uruchomienie i podstawową akcję każdej gry, błędy wykonania i konsoli, wspólne powiadomienia, migrację starego profilu, zapis i ponowne wczytanie obu gier idle, zachowanie fokusu panelu, obsługę modala, eksport/import oraz reduced motion.

Raport Playwright jest przechowywany jako artefakt każdego przebiegu. Przy awarii zachowywane są również trace, nagranie i zrzut ekranu.

## Decyzje poza zakresem napraw

Manifest PWA, service worker i bazowe obrazy regresji wizualnej były w audycie wskazane jako opcje do rozważenia po ustabilizowaniu aplikacji, a nie jako wykryte defekty. Nie zostały dołączone do tej zmiany, aby nie wprowadzać buforowania starego kodu ani niestabilnych obrazów referencyjnych razem z refaktorem danych.

## Wycofanie

Zmiany znajdują się w jednym pull requeście i mogą zostać wycofane przez odwrócenie jego merge commit. Migracje nie usuwają wcześniejszych kluczy, a kopie rekordów pozwalają odzyskać stan sprzed zmiany schematu.
