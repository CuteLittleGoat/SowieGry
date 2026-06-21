# Sowa3 — dokumentacja techniczna

## Architektura

`Sowa3` jest trzytorowym runnerem Canvas 2D. Bazowy silnik znajduje się w `script.js`, a kolejne moduły rozwijają go warstwowo. Kolejność ładowania jest istotna, ponieważ część modułów opakowuje wcześniej zdefiniowane funkcje.

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

`finish-controls.js` dynamicznie ładuje dodatkowo `finish-details.js`.

## Odpowiedzialność modułów

### `script.js`

Stany `title`, `run`, `finish`, `over`, trzy tory, bazowy spawn, kolizje, renderowanie, wynik i rekord.

### `difficulty.js`

Definiuje `chill`, `arcade` i `chaos`. Zmienia życia startowe, prędkość, wzrost prędkości, częstotliwość przeszkód, szansę zamiany przeszkody na liść oraz mnożnik punktów. Wybór jest zapisany pod `sowa3Difficulty`.

### `extra-lives.js`

Serduszka na torach, limit pięciu żyć, zamiana nadmiarowego życia na punkty i częstotliwość zależna od trudności.

### `visual-polish.js`

Rysuje główne scenografie supermarketu, wystawy kwiatów i blokowiska PRL.

### `stage-ambience.js`

Dodaje wyłącznie dekoracje boczne albo górne:

- supermarket: pieczywo i pracownik z paleciakiem,
- kwiaty: boczne wózki i zraszacze,
- blokowisko: trzepak, ławkę, kota i gołębie.

### `stage-obstacles.js`

Dodaje `pallet`, `person` i `boar`.

### `lane-balance.js`

Koordynuje bazowe i tematyczne przeszkody: minimalny odstęp na osi `z`, wartości zależne od trudności, preferowanie innego toru, możliwość zastąpienia zablokowanego spawnu liściem i brak jednoczesnego zamknięcia wszystkich torów.

### `visibility-corridor.js`

Po scenografii ponownie rysuje czysty trapez trasy. Korytarz jest szerszy niż trzy linie torów i usuwa optyczne nachodzenie regałów, kwiatów, ludzi tła, drzew i budynków. Przeszkody oraz pickupy są rysowane później.

### `finish-pool.js`

Nadpisuje finał planszy:

- działka,
- okrągły basen naziemny,
- szara ryflowana ściana,
- niebieski rant,
- turkusowa woda i fale,
- dobiegnięcie sowy,
- skok do basenu,
- plusk,
- przemiana w humbaka.

### `finish-details.js`

Dynamicznie dodaje boczne detale finału: kozę odpoczywającą na leżaku oraz grill. Oba elementy pozostają poza centralnym basenem i trasą dojścia.

### `cute-rework.js`

- combo `×1`–`×5`,
- near miss,
- złote i tęczowe liście,
- gorączka monster,
- ruch części ludzi i dzików,
- ostrzeżenia kierunkowe,
- piórka,
- kosmetyki,
- misje i statystyki,
- dodatkowa karta HUD,
- podsumowanie planszy,
- debug.

### `moving-obstacle-safety.js`

Przed ruchem człowieka lub dzika sprawdza:

- czy tor docelowy jest zajęty,
- czy ruch zamknąłby wszystkie trzy pasy,
- czy ostrzeżenie pojawiło się odpowiednio wcześnie.

Niebezpieczny ruch jest anulowany.

### `finish-controls.js`

Zmienia motyw muzyczny między planszami, zapisuje obejrzenie finału, pozwala skrócić kolejne finały, zatrzymuje sekwencję podczas pauzy i ładuje `finish-details.js`.

### `animation-polish.js`

Przechylenie, stretch, gwiazdki po obrażeniu, kontekstowe dźwięki oraz działający kosmetyk `bubbleTrail`.

## Wspólna warstwa

`SowieCore` odpowiada za profil `sowieGryProfile`, garderobę, misje, ustawienia, pauzę, Web Audio, komunikaty i debug. `SowieRuntime` ogranicza częstotliwość zapisów i wznawia grę po zamknięciu modalu.

## Combo i near miss

Progi combo: 5, 12, 22 i 35 akcji dla mnożników `×2`–`×5`. Near miss jest wykrywany po przejściu przeszkody na sąsiednim torze; każdy obiekt może przyznać premię tylko raz.

## Liście i gorączka

Liście mają wariant `normal`, `gold` albo `rainbow`. Tęczowy liść lub osiem kolejnych zbiórek uruchamia gorączkę, która dodaje wyłącznie pickupy.

## Finał i podsumowanie

Sekwencja trwa około 4,3 sekundy. Podsumowanie zawiera wynik, liście, near missy, najlepsze combo i ocenę tekstową. Po pierwszym pełnym obejrzeniu zapis `sowa3FinishSeen` pozwala skrócić kolejne finały.

## Audio

Motywy: `market`, `flowers`, `estate`. Efekty obejmują liście, serca, combo, near miss, telefon, dzika, obrażenia, plusk i odblokowania.

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
3. Ruchoma przeszkoda musi mieć ostrzeżenie i walidację toru docelowego.
4. Nowe warstwy scenografii muszą być ładowane przed `visibility-corridor.js`.
5. Nowe modyfikatory finału muszą respektować pauzę.
6. Dokumentację należy aktualizować razem z kodem.
