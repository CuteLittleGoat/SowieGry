# SowieGry — instrukcja obsługi

## Jak uruchomić

1. Otwórz `index.html` w głównym katalogu repozytorium.
2. Kliknij kartę `SowaRunner`, `SowaJumper` albo `Sowa3`.
3. Na ekranie gry wybierz poziom trudności.

Najpewniejszym sposobem uruchomienia jest lokalny serwer HTTP albo GitHub Pages. Niektóre przeglądarki ograniczają część funkcji przy bezpośrednim otwieraniu plików przez `file://`.

## Gry

- `SowaRunner` — boczny endless runner.
- `SowaJumper` — pionowy jumper arcade.
- `Sowa3` — trzytorowy runner w perspektywie wgłąb ekranu.

Każda gra ma:

- poziomy `Chill`, `Arcade` i `Chaos`,
- dodatkowe życia,
- zabezpieczenia przed niemożliwymi układami,
- combo,
- bliskie uniki „O włos!”,
- złote i tęczowe liście,
- gorączkę monster,
- kosmetyki,
- misje,
- wspólny profil,
- pauzę,
- ustawienia dźwięku,
- tryb diagnostyczny `?debug=1`.

## Dokumentacja reworku

- [`PLAN_ROZWOJU_CUTE_POLISH.md`](PLAN_ROZWOJU_CUTE_POLISH.md) — pierwotny szczegółowy plan.
- [`WDROZENIE_CUTE_POLISH.md`](WDROZENIE_CUTE_POLISH.md) — faktyczny stan wdrożenia, lista nowych plików i zakres wymagający jeszcze ręcznych testów.

## Testy

Test uruchomieniowy w przeglądarce: otwórz `tests/smoke.html` przez lokalny serwer (np. `npm run serve`, potem `http://127.0.0.1:4173/tests/smoke.html`).

Pełne testy automatyczne (dla osoby rozwijającej gry):

1. Zainstaluj Node.js 22 i Javę 21 (potrzebna emulatorowi bazy Firestore).
2. `npm install`
3. `npx playwright install --with-deps chromium webkit`
4. `npm test`

`npm test` sprawdza składnię, styl, HTML, testy jednostkowe i testy w przeglądarce. Testy w przeglądarce działają na **emulatorze** bazy (projekt testowy `demo-sowiegry`) i na profilach telefonów (iPhone SE, iPhone 13 w pionie i poziomie, Pixel 7, Android 360 × 800) w Chromium i Safari (WebKit). Testy nigdy nie zapisują niczego w prawdziwej bazie.

Jeśli na komputerze nie da się uruchomić WebKit, można jednorazowo pominąć go poleceniem `SOWIE_E2E_BEZ_WEBKIT=1 npm test` (w automatycznych testach na GitHubie WebKit działa zawsze).

## Wspólny profil

Postęp, kosmetyki, misje i ustawienia są zapisywane w `localStorage` pod kluczem:

```text
sowieGryProfile
```

Rekordy poszczególnych gier nadal zachowują własne klucze, dzięki czemu dotychczasowe wyniki nie są usuwane.
