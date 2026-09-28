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

- `../config/firebase-config.js` i `../shared/sowie-cloud.js` (zapis w Firestore),
- `../shared/password-gate.js` (ekran „Hasło sowy”),
- `../shared/sowie-smoke-hook.js`,
- `../shared/cute-ui.css`,
- `../shared/sowie-core.js`,
- `../shared/sowie-runtime.js`.

## Kolejność ładowania

1. `../config/firebase-config.js`
2. `../shared/sowie-platform.js`
3. `../shared/sowie-cloud.js`
4. `../shared/password-gate.js`
5. `../shared/sowie-smoke-hook.js`
6. `../shared/cute-ui.css`, `../shared/game-enhancements.css`, `../shared/owl-gallery.css`, `style.css`
7. `../shared/stable-panel.js`
8. `../shared/sowie-core.js`
9. `../shared/notification-manager.js`
10. `../shared/sowie-runtime.js`
11. `script.js`
12. `../shared/modal-accessibility.js`, `../shared/game-guides.js`, `../shared/sowie-academy.js`, `../shared/owl-gallery.js`, `../shared/gameplay-expansion.js`

## Stan gry

Stan jest zapisywany w Firestore przez `SowieCloud` jako tekst JSON w polu `state` dokumentu:

```txt
sowiegry/profil/sowiegry_gry/szklarnia
```

Stałe w `script.js`: `GAME_ID = "szklarnia"`, `VERSION = 1` (`saveVersion`), `IMPORTANT_SAVES = ["manual", "build", "upgrade", "research", "expand", "cross", "offline", "reset"]`.

- **start:** `let state = defaultSave()`; na końcu pliku `cloud.loadGameState(GAME_ID)` (czeka na `SowieCloud.ready`), potem `state = load(saved)` (`mergeSave` z wartościami domyślnymi) i `init()`;
- **`save(reason)`:** `state.lastSavedAt = Date.now()`, `cloud.saveGameState(GAME_ID, state, { immediate, saveVersion: 1, summary })` — ważne akcje z `IMPORTANT_SAVES` po 2 s, pozostałe najpóźniej po 30 s (≤ 120 zapisów na godzinę). `summary = { lifetimeLeaves, rooms: rooms.length, hybrids: stats.hybrids }` trafia do dokumentu gry i do `profil.records.szklarnia`. Dla `manual`, `reset`, `hidden`, `pagehide` dodatkowo `cloud.flush()`;
- **cykliczny zapis:** `setInterval(..., 5000)` z `queueSave("auto")` tylko przy widocznej karcie (zastępuje dawny, przypadkowy warunek w pętli `now % 7000 < 20`);
- **tło:** `visibilitychange → hidden` = `save("hidden")`, `visible` = `offline()` (postęp offline po powrocie z tła), `pagehide` = `save("pagehide")`;
- **reset** (`#resetConfirm`): `state = defaultSave()` i `save("reset")` — nadpisuje zapis w chmurze (na wszystkich urządzeniach);
- panel **Staty** pokazuje „Zapis w chmurze (Firestore) — ten sam postęp na każdym urządzeniu.”;
- **`window.SowieIdleGame = { id: "szklarnia", ready, snapshot }`** — dla `shared/gameplay-expansion.js` (cele laboratorium, album cech).

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

`offline()` porównuje aktualny czas z `lastSavedAt`, ogranicza wynik przez `cap`, nalicza zasoby i wzrost roślin oraz pokazuje modal powrotu. Wywoływane przy starcie i po powrocie z tła (`visibilitychange → visible`).

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
3. Stan przetrwa odświeżenie strony i jest widoczny na drugim urządzeniu.
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

## Okno „🏆 Rekordy”

Strona ładuje `../shared/records.js` po `../shared/owl-gallery.js` (i po `../shared/game-guides.js`, który tworzy dok przycisków). Moduł dodaje do doku przycisk 🏆 i okno rekordów zasilane przez `SowieCloud` (podsumowanie `profil.records.szklarnia`). Opis modułu: `docs/Documentation.md`, sekcja „`shared/records.js`”.
