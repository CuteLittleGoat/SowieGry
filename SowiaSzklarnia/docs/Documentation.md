# Sowia Szklarnia — dokumentacja techniczna

## Architektura

`Sowia Szklarnia` jest samodzielną grą przeglądarkową w katalogu `SowiaSzklarnia/`. Gra działa bez bundlera i bez backendu.

Pliki:

```txt
SowiaSzklarnia/
  index.html
  style.css
  script.js
  docs/
    README.md
    Documentation.md
```

Wykorzystywane wspólne elementy repozytorium:

- `../shared/progress-reset.js`,
- `../shared/sowie-smoke-hook.js`,
- `../shared/cute-ui.css`,
- `../shared/sowie-core.js`,
- `../shared/sowie-runtime.js`.

## Kolejność ładowania

1. `../shared/progress-reset.js`
2. `../shared/sowie-smoke-hook.js`
3. `../shared/cute-ui.css`
4. `style.css`
5. `../shared/sowie-core.js`
6. `../shared/sowie-runtime.js`
7. `script.js`

## Stan gry

Stan jest zapisywany jako JSON w `localStorage` pod kluczem:

```txt
sowiaSzklarniaSave
```

Najważniejsze pola:

- `leaves` — aktualne liście,
- `water` — aktualna woda,
- `seeds` — podstawowe nasiona,
- `pollen` — pyłek do krzyżowania,
- `compost` — kompost,
- `owlJoy` — radość sowy,
- `grid` — rozmiar szklarni,
- `rooms` — zbudowane pomieszczenia,
- `plants` — posadzone rośliny,
- `discovered` — odkryte gatunki i hybrydy,
- `crossbreeds` — aktywne krzyżowania,
- `goats` — aktywne kozy,
- `nextGoatAt` — termin kolejnego zagrożenia,
- `research` — kupione badania,
- `automation` — automatyzacja,
- `effects` — aktywne efekty czasowe,
- `stats` — lokalne statystyki,
- `achievements` — lokalne osiągnięcia.

## Główne systemy

### Budowa

Pomieszczenia są opisane w tablicy `ROOMS`. Budowa używa `buildRoom(typeId)`, a ulepszanie `upgradeRoom(roomId)`. Nowe pokoje trafiają w najbliższy wolny slot siatki. Rozbudowa siatki odbywa się przez `expandGrid()`.

### Rośliny

Gatunki są opisane w `PLANTS`. Sadzenie wykonuje `plantSeed(plantId)`. Rośliny mają wzrost, zdrowie i proste cechy wpływające na produkcję oraz atrakcyjność dla kóz.

### Krzyżowanie

Receptury są opisane w `RECIPES`. Krzyżowanie wymaga Krzyżówkarium, dojrzałych rodziców, wody i pyłku. Proces rozpoczyna `startCross(recipeId)`, a kończy `resolveCrosses()`.

### Kozy

Kozy pojawiają się przez `spawnGoat()`, wybierają cel na podstawie atrakcyjności roślin i podgryzają liście w `updateGoats(delta)`. Kliknięcie kozy albo przycisk `SIO! SIO!` wywołuje `scareGoat(goatId)`.

Efekt `scareGoat`:

- ustawia kozę w stan `fleeing`,
- pokazuje dymek `SIO! SIO!`,
- zwiększa radość sowy,
- daje małą nagrodę,
- zapisuje stan.

### Offline progress

`offline()` porównuje aktualny czas z `lastSavedAt`, ogranicza wynik przez `cap`, nalicza zasoby i wzrost roślin oraz pokazuje modal powrotu.

### UI

Interfejs jest zgodny ze stylem `cute`:

- pastelowe gradienty,
- duże zaokrąglenia,
- czytelne karty,
- minimum 44 px wysokości przycisków,
- zakładki zamiast długiej listy wszystkiego,
- kompaktowy HUD,
- responsywność desktop/mobile.

## Ręczne testy

1. Gra otwiera się z menu głównego.
2. Kliknięcie dodaje liście.
3. Stan przetrwa odświeżenie strony.
4. Można zbudować pokój.
5. Nie można zbudować pokoju bez zasobów.
6. Można ulepszyć pokój.
7. Można posadzić roślinę.
8. Rośliny rosną w czasie.
9. Dojrzałe rośliny produkują liście.
10. Zraszalnia produkuje wodę.
11. Sadzonkarnia produkuje nasiona.
12. Krzyżówkarium pozwala rozpocząć krzyżowanie.
13. Krzyżowanie kończy się odkryciem hybrydy albo zwrotem części zasobów.
14. Koza pojawia się i podgryza liście.
15. Kliknięcie kozy pokazuje `SIO! SIO!`.
16. Koza po kliknięciu ucieka.
17. Offline progress działa po przerwie.
18. UI jest czytelne na telefonie.
