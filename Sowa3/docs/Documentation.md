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
16. `finish-controls.js`
17. `animation-polish.js`

## Odpowiedzialność modułów

### `script.js`

- stany `title`, `run`, `finish`, `over`,
- trzy tory,
- bazowy spawn,
- kolizje,
- bazowe rysowanie,
- wynik i rekord.

### `difficulty.js`

Definiuje `chill`, `arcade` i `chaos`. Poziomy zmieniają:

- życia startowe,
- prędkość,
- wzrost prędkości,
- częstotliwość przeszkód,
- prawdopodobieństwo zamiany przeszkody na liść,
- mnożnik punktów.

Wybór jest zapisany pod `sowa3Difficulty`.

### `extra-lives.js`

- serduszka na torach,
- limit pięciu żyć,
- zamiana nadmiarowego życia na punkty,
- częstotliwość zależna od trudności.

### `visual-polish.js`

Rysuje główne scenografie:

- supermarket,
- wystawę kwiatów,
- blokowisko PRL.

### `stage-ambience.js`

Dodaje wyłącznie dekoracje boczne albo górne:

- supermarket: pieczywo i pracownik z paleciakiem,
- kwiaty: boczne wózki i zraszacze,
- blokowisko: trzepak, ławkę, kota i gołębie.

### `stage-obstacles.js`

Dodaje przeszkody tematyczne:

- `pallet`,
- `person`,
- `boar`.

### `lane-balance.js`

Koordynuje bazowe i tematyczne przeszkody:

- minimalny odstęp na osi `z`,
- różne wartości dla poziomów trudności,
- preferowanie innego toru niż poprzedni,
- możliwość zastąpienia zablokowanego spawnu liściem,
- brak jednoczesnego zamknięcia wszystkich torów.

### `visibility-corridor.js`

Po narysowaniu scenografii ponownie rysuje czysty trapez trasy. Korytarz jest szerszy niż trzy linie torów i usuwa optyczne nachodzenie:

- regałów,
- kwiatów,
- ludzi tła,
- drzew,
- budynków,
- innych dekoracji.

Przeszkody i pickupy są rysowane później, więc pozostają widoczne nad czystą trasą.

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

### `finish-controls.js`

- zmienia motyw muzyczny między planszami,
- zapisuje obejrzenie finału,
- pozwala skrócić kolejne finały,
- zatrzymuje finał podczas pauzy lub otwartego modalu.

### `cute-rework.js`

- combo `×1`–`×5`,
- near miss,
- złote i tęczowe liście,
- gorączka monster,
- ruch części ludzi i dzików,
- ostrzeżenia kierunkowe,
- piórka,
- kosmetyki,
- wspólne misje i statystyki,
- dodatkowa karta HUD,
- podsumowanie planszy,
- debug.

### `animation-polish.js`

- przechylenie podczas zmiany toru,
- stretch podczas szybkiego ruchu,
- gwiazdki po obrażeniu,
- dźwięki dopasowane do telefonu, dzika i innych kolizji.

## Wspólna warstwa

`SowieCore` odpowiada za:

- profil `sowieGryProfile`,
- garderobę,
- kosmetyki,
- misje,
- ustawienia,
- pauzę,
- dźwięki i muzykę Web Audio,
- toasty i komentarze,
- debug.

`SowieRuntime` ogranicza częstotliwość zapisów i obsługuje wznowienie gry po zamknięciu modalu.

## Combo

Progi:

- 5 akcji — `×2`,
- 12 — `×3`,
- 22 — `×4`,
- 35 — `×5`.

Combo rośnie za liście i near missy. Utrata życia resetuje serię.

## Near miss

Przeszkoda może przyznać premię tylko raz. Near miss jest wykrywany po przejściu przeszkody, gdy gracz znajduje się na sąsiednim torze.

## Ruchome przeszkody

Wybrane osoby i dziki mogą otrzymać tor docelowy. Przed ruchem wyświetlana jest strzałka. Zmiana następuje w bezpiecznej części głębi, a bazowy spawn nadal przechodzi przez `lane-balance.js`.

## Liście i gorączka

Liście otrzymują wariant:

- `normal`,
- `gold`,
- `rainbow`.

Tęczowy liść albo osiem kolejnych zbiórek uruchamia gorączkę. Gorączka dodaje wyłącznie pickupy, nie przeszkody.

## Finał i podsumowanie

Sekwencja trwa około 4,3 sekundy. Podsumowanie zawiera:

- wynik,
- zebrane liście,
- liczbę near missów,
- najlepsze combo,
- ocenę tekstową.

Po pierwszym pełnym obejrzeniu zapis `sowa3FinishSeen` pozwala skrócić kolejne finały.

## Audio

Motywy:

- `market`,
- `flowers`,
- `estate`.

Efekty obejmują liście, serca, combo, near miss, telefon, dzika, obrażenia, plusk i odblokowania.

## Rekordy i profil

- rekord gry: `sowa3Best`,
- trudność: `sowa3Difficulty`,
- obejrzenie finału: `sowa3FinishSeen`,
- profil wspólny: `sowieGryProfile`.

## Diagnostyka i testy

- `?debug=1`,
- `tests/smoke.html`,
- `.github/workflows/js-check.yml`.

Debug pokazuje:

- tryb,
- planszę,
- liczbę przeszkód,
- combo,
- gorączkę,
- liczbę obiektów.

## Zasady utrzymania

1. Dekoracje muszą pozostawać przy bokach albo nad horyzontem.
2. Nowe przeszkody muszą przechodzić przez `lane-balance.js`.
3. Ruchoma przeszkoda musi mieć ostrzeżenie.
4. Nowe warstwy scenografii muszą być ładowane przed `visibility-corridor.js`.
5. Nowe modyfikatory finału muszą respektować pauzę.
6. Dokumentację należy aktualizować razem z kodem.
