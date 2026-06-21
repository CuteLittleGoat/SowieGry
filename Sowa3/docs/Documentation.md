# Sowa3 — dokumentacja techniczna

## Architektura

`Sowa3` jest trzytorowym runnerem Canvas 2D. Bazowy silnik znajduje się w `script.js`, a kolejne moduły rozwijają go warstwowo.

## Kolejność ładowania

1. `../shared/sowie-smoke-hook.js`
2. `style.css`
3. `../shared/cute-ui.css`
4. `script.js`
5. `difficulty.js`
6. `extra-lives.js`
7. `visual-polish.js`
8. `stage-ambience.js`
9. `stage-obstacles.js`
10. `lane-balance.js`
11. `visibility-corridor.js`
12. `finish-pool.js`
13. `../shared/sowie-core.js`
14. `../shared/sowie-runtime.js`
15. `cute-rework.js`
16. `moving-obstacle-safety.js`
17. `finish-controls.js`
18. `animation-polish.js`

`finish-controls.js` dynamicznie ładuje `finish-details.js`, a po pełnym załadowaniu strony także `pause-guard.js`, aby ten ostatni pozostał końcową warstwą `update()`.

## Odpowiedzialność modułów

### `script.js`

Stany `title`, `run`, `finish`, `over`, trzy tory, bazowy spawn, kolizje, renderowanie, wynik i rekord.

### `difficulty.js`

Definiuje `chill`, `arcade` i `chaos`. Zmienia życia startowe, prędkość, wzrost prędkości, częstotliwość przeszkód, szansę zamiany przeszkody na liść oraz mnożnik punktów.

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

Zmienia muzykę między planszami, zapisuje obejrzenie finału, pozwala skrócić kolejne finały, zatrzymuje sekwencję podczas pauzy oraz ładuje detale finału i końcowy guard pauzy.

### `animation-polish.js`

Przechylenie, stretch, gwiazdki, dźwięki oraz działający kosmetyk `bubbleTrail`.

### `pause-guard.js`

Końcowa warstwa `update()`. Zatrzymuje bąbelki, ruchome przeszkody i wszystkie późne systemy podczas pauzy lub otwartego modalu.

## Wspólna warstwa

`SowieCore` odpowiada za profil `sowieGryProfile`, garderobę, misje, ustawienia, pauzę, Web Audio, komunikaty i debug. `SowieRuntime` ogranicza częstotliwość zapisów i wznawia grę po zamknięciu modalu.

## Combo, near miss i gorączka

Progi combo: 5, 12, 22 i 35 akcji dla `×2`–`×5`. Near miss jest wykrywany po przejściu przeszkody na sąsiednim torze. Liście mają wariant `normal`, `gold` albo `rainbow`; tęczowy liść lub osiem zbiórek aktywuje gorączkę.

## Finał

Sekwencja trwa około 4,3 sekundy. Podsumowanie pokazuje wynik, liście, near missy, najlepsze combo i ocenę. Po pierwszym pełnym obejrzeniu można ją skrócić tapnięciem.

## Rekordy i profil

- `sowa3Best`,
- `sowa3Difficulty`,
- `sowa3FinishSeen`,
- `sowieGryProfile`.

## Diagnostyka i testy

- `?debug=1`,
- `tests/smoke.html`,
- `.github/workflows/js-check.yml`.

## Zasady utrzymania

1. Dekoracje muszą pozostawać przy bokach albo nad horyzontem.
2. Nowe przeszkody muszą przechodzić przez `lane-balance.js`.
3. Ruchoma przeszkoda wymaga ostrzeżenia i walidacji toru docelowego.
4. Warstwy scenografii muszą być ładowane przed `visibility-corridor.js`.
5. Modyfikatory finału muszą respektować pauzę.
6. Dokumentację należy aktualizować razem z kodem.
