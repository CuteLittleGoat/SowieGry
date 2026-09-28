# Sowa3 — dokumentacja techniczna

## Architektura

`Sowa3` jest trzytorowym runnerem Canvas 2D. Bazowy silnik znajduje się w `script.js`, a kolejne moduły rozwijają go warstwowo. Czwarta plansza, stacja paliw Amic, jest dołączana jako końcowa warstwa scenografii i spawnu.

## Kolejność ładowania

1. `../config/firebase-config.js`
2. `../shared/sowie-platform.js`
3. `../shared/sowie-cloud.js`
4. `../shared/password-gate.js`
5. `../shared/sowie-smoke-hook.js`
6. `style.css`
7. `../shared/cute-ui.css`
8. `script.js`
9. `difficulty.js`
10. `extra-lives.js`
11. `visual-polish.js`
12. `stage-ambience.js`
13. `stage-obstacles.js`
14. `lane-balance.js`
15. `visibility-corridor.js`
16. `finish-pool.js`
17. `../shared/sowie-core.js`
18. `notification-manager.js`
19. `../shared/sowie-runtime.js`
20. `cute-rework.js`
21. `moving-obstacle-safety.js`
22. `finish-controls.js`
23. `animation-polish.js`
24. `amic-stage.js`

`finish-controls.js` dynamicznie ładuje `finish-details.js`, a po pełnym załadowaniu strony także `pause-guard.js`, aby ten ostatni pozostał końcową warstwą `update()`.

## Odpowiedzialność modułów

### `script.js`

Stany `title`, `run`, `finish`, `over`, trzy tory, bazowy spawn, kolizje, renderowanie, wynik i rekord. `state.best` startuje od 0 (rekord wybranego poziomu wczytuje `difficulty.js`). `gameOver()` ustawia lokalne maksimum i wywołuje `SowieCloud.submitRun("sowa3", { score, distance, difficulty: state.difficultyKey })`. `sowa3CloudReady()` (`SowieCloud.isReady()`) blokuje start gry (Spacja/Enter, dotknięcie planszy) do czasu wczytania postępu.

### `difficulty.js`

Definiuje `chill`, `arcade` i `chaos`. Zmienia życia startowe, prędkość, wzrost prędkości, częstotliwość przeszkód, szansę zamiany przeszkody na liść oraz mnożnik punktów. Wybór jest zapisywany w Firestore (`sowiegry_gry/sowa3.difficulty`, `SowieCloud.updateGame`); po `SowieCloud.ready` zapisany poziom jest przywracany, a `syncSowa3Best()` ustawia `state.best` z `SowieCloud.records("sowa3", state.difficultyKey).bestScore` (rekordy osobno dla każdego poziomu; także przy każdej zmianie poziomu).

### `extra-lives.js`

Serduszka na torach, limit pięciu żyć, zamiana nadmiarowego życia na punkty i częstotliwość zależna od trudności.

### `visual-polish.js`

Rysuje główne scenografie supermarketu, wystawy kwiatów i blokowiska PRL.

### `stage-ambience.js`

Dodaje wyłącznie dekoracje boczne albo górne: pieczywo i pracownika, boczne wózki oraz zraszacze, trzepak, ławkę, kota i gołębie.

### `stage-obstacles.js`

Dodaje `pallet`, `person` i `boar`.

### `lane-balance.js`

Kontroluje minimalny odstęp, wartości zależne od trudności, preferowanie innego toru, zamianę zablokowanego spawnu na liść oraz brak jednoczesnego zamknięcia wszystkich torów.

### `visibility-corridor.js`

Po scenografii ponownie rysuje czysty trapez trasy. Przeszkody i pickupy są rysowane później, dlatego dekoracje nie zasłaniają rozgrywki.

### `finish-pool.js`

Rysuje działkę, okrągły basen z szarą ryflowaną ścianą, niebieskim rantem i turkusową wodą. Obsługuje dobiegnięcie sowy, skok, plusk oraz przemianę w humbaka.

### `finish-details.js`

Dodaje po bokach kozę na leżaku i grill.

### `cute-rework.js`

Combo, near miss, złote i tęczowe liście, gorączka monster, ruch części ludzi i dzików, ostrzeżenia, piórka, kosmetyki, misje, HUD, podsumowanie i debug.

### `moving-obstacle-safety.js`

Anuluje zmianę toru, gdy tor docelowy jest zajęty, powstałaby ściana na trzech pasach albo ostrzeżenie byłoby zbyt późne.

### `finish-controls.js`

Zmienia muzykę między planszami, zapisuje obejrzenie finału (`sowiegry_gry/sowa3.finishSeen = true` przez `SowieCloud.updateGame`, raz — gdy finał trwa ponad 2,5 s), pozwala skrócić kolejne finały (tapnięcie po 2,2 s, gdy `SowieCloud.game("sowa3").finishSeen === true`), zatrzymuje sekwencję podczas pauzy oraz ładuje detale finału i końcowy guard pauzy.

### `animation-polish.js`

Przechylenie, stretch, gwiazdki, dźwięki oraz działający kosmetyk `bubbleTrail`.

### `amic-stage.js`

Dodaje czwarty wpis do `STAGES` i obsługuje planszę stacji paliw Amic:

- rysuje białe zadaszenie z zielonym pasem, żółtym akcentem i czerwonym logo,
- dodaje sklep, drzewa, słupy, dalekie dystrybutory i asfaltowy korytarz,
- zachowuje czytelne trzy tory bez dekoracji w aktywnym pasie gry,
- na planszy Amic ogranicza bazowy spawn do `leaf`, `amic`, `cart` i `block`,
- interpretuje `amic` jako dystrybutor, `cart` jako samochód, a `block` jako worki ze śmieciami,
- dzięki użyciu istniejących typów przeszkód zachowuje balans torów, near miss i logikę kolizji,
- na wcześniejszych planszach zmienia kolorystykę przeszkody `amic` na biel, zieleń, żółć i czerwień zgodną z nową scenografią,
- aktualizuje tekst ekranu tytułowego oraz dobiera muzykę po wejściu na czwartą planszę.

### `pause-guard.js`

Końcowa warstwa `update()`. Zatrzymuje bąbelki, ruchome przeszkody i wszystkie późne systemy podczas pauzy lub otwartego modalu.

## Wspólna warstwa

`SowieCore` odpowiada za profil (dokument Firestore `sowiegry/profil` przez `SowieCloud`), garderobę, misje, ustawienia, pauzę, Web Audio, komunikaty i debug. `SowieRuntime` ustawia wspólny układ paska narzędzi i klasę ograniczonych efektów. W `<head>` kolejno: `../config/firebase-config.js`, `../shared/sowie-platform.js`, `../shared/sowie-cloud.js`, `../shared/password-gate.js`, `../shared/sowie-smoke-hook.js`.

## Combo, near miss i gorączka

Progi combo: 5, 12, 22 i 35 akcji dla `×2`–`×5`. Near miss jest wykrywany po przejściu przeszkody na sąsiednim torze. Liście mają wariant `normal`, `gold` albo `rainbow`; tęczowy liść lub osiem zbiórek aktywuje gorączkę.

## Plansza Amic — zgodność z mechaniką

Nowe przeszkody nie tworzą nowych typów obiektów. Moduł wykorzystuje istniejące typy rozpoznawane przez `lane-balance.js` i `cute-rework.js`, dzięki czemu nie trzeba dublować list blokujących ani osobno implementować near missów. `chooseSowa3BaseSpawnType()` jest nadpisane wyłącznie dla `state.stage === 3`; na wcześniejszych planszach wywoływana jest poprzednia implementacja.

## Finał

Sekwencja trwa około 4,3 sekundy. Podsumowanie pokazuje wynik, liście, near missy, najlepsze combo i ocenę. Po pierwszym pełnym obejrzeniu można ją skrócić tapnięciem.

## Rekordy i profil

Wszystko w Firestore przez `SowieCloud`:

- `profil.records.sowa3.{chill|arcade|chaos}.bestScore`, `profil.records.sowa3.runs`, `lastPlayedAt`;
- `sowiegry_gry/sowa3` — `difficulty`, `finishSeen`, `top10` na poziom, `dailyBest` (rekord wyzwania dnia = wynik), historia `sowiegry_historia`;
- wspólny profil `sowiegry/profil`.

## Diagnostyka i testy

- `?debug=1`,
- `tests/smoke.html`,
- `.github/workflows/js-check.yml`,
- `node --check Sowa3/amic-stage.js`.

## Zasady utrzymania

1. Dekoracje muszą pozostawać przy bokach albo nad horyzontem.
2. Nowe przeszkody muszą przechodzić przez `lane-balance.js`.
3. Ruchoma przeszkoda wymaga ostrzeżenia i walidacji toru docelowego.
4. Warstwy scenografii muszą być ładowane przed `visibility-corridor.js`, chyba że końcowy moduł sam rysuje czysty korytarz tak jak `amic-stage.js`.
5. Modyfikatory finału muszą respektować pauzę.
6. Dokumentację należy aktualizować razem z kodem.

## Okno „🏆 Rekordy”

Strona ładuje `../shared/records.js` po `../shared/owl-gallery.js` (i po `../shared/game-guides.js`, który tworzy dok przycisków). Moduł dodaje do doku przycisk 🏆 i okno rekordów zasilane przez `SowieCloud` (top 10 na poziom trudności, ostatnie gry, rekordy wyzwania dnia). Opis modułu: `docs/Documentation.md`, sekcja „`shared/records.js`”.

## PWA (etap E2a)

`index.html` ma w `<head>` po `theme-color`: `<link rel="manifest" href="../manifest.webmanifest">`, `<link rel="icon" href="../assets/icons/icon.svg" type="image/svg+xml">`, `<link rel="apple-touch-icon" href="../assets/icons/apple-touch-icon.png">`, `<meta name="mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-title" content="SowieGry">`, a po `../shared/password-gate.js` skrypt `../shared/pwa.js` (rejestracja service workera `sw.js`). Gra trafia do pamięci podręcznej przy pierwszym otwarciu i potem uruchamia się także bez zasięgu. Opis: `docs/Documentation.md`, rozdział „PWA”.
