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

- `tests/smoke.html` — przeglądarkowy test uruchomieniowy wszystkich gier.
- `.github/workflows/js-check.yml` — automatyczna kontrola składni JavaScript przez `node --check`.

Test przeglądarkowy najlepiej otworzyć przez lokalny serwer:

```bash
python -m http.server 8000
```

Następnie otwórz:

```text
http://localhost:8000/tests/smoke.html
```

## Wspólny profil

Postęp, kosmetyki, misje i ustawienia są zapisywane w `localStorage` pod kluczem:

```text
sowieGryProfile
```

Rekordy poszczególnych gier nadal zachowują własne klucze, dzięki czemu dotychczasowe wyniki nie są usuwane.
