# Sowie Ogrody — dokumentacja techniczna

## Architektura

`Sowie Ogrody` jest samodzielną grą Canvas 2D w katalogu `SowieOgrody/`. Wykorzystuje wspólne elementy repozytorium:

- `../config/firebase-config.js` i `../shared/sowie-cloud.js` (zapis w Firestore),
- `../shared/password-gate.js` (ekran „Hasło sowy”),
- `../shared/cute-ui.css`,
- `../shared/sowie-core.js`,
- `../shared/sowie-runtime.js`,
- `../shared/sowie-smoke-hook.js`.

Główna logika znajduje się w `script.js`. Gra jest napisana jako jeden moduł IIFE, żeby łatwo działała bez bundlera.

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

## Pliki

```txt
SowieOgrody/
  index.html
  style.css
  script.js
  docs/
    README.md
    Documentation.md
```

## Stan gry

Stan jest zapisywany w Firestore przez `SowieCloud` jako tekst JSON w polu `state` dokumentu:

```txt
sowiegry/profil/sowiegry_gry/ogrody
```

Stałe w `script.js`: `GAME_ID = "ogrody"`, `VERSION = 2` (`saveVersion`), `IMPORTANT_SAVES = ["manual", "prestige", "upgrade", "unlock", "offline"]`.

- **start:** `let state = defaultSave()`; na końcu pliku `cloud.loadGameState(GAME_ID)` (czeka na `SowieCloud.ready`), potem `state = load(saved)` (`mergeSave` z wartościami domyślnymi) i `init()`. Gra nie startuje przed wczytaniem stanu z chmury;
- **`save(reason)`:** `state.lastSavedAt = Date.now()`, potem `cloud.saveGameState(GAME_ID, state, { immediate, saveVersion: 2, summary })`, gdzie `immediate` = powód z `IMPORTANT_SAVES` (zapis po 2 s), inne powody — zapis zbiorczy najpóźniej po 30 s (≤ 120 zapisów na godzinę). `summary = { lifetimeLeaves, prestiges: stats.prestiges, zone }` trafia do dokumentu gry i do `profil.records.ogrody`. Dla powodów `manual`, `hidden`, `pagehide` dodatkowo `cloud.flush()` (natychmiastowe wysłanie). Napis w HUD „Zapisano” / „Zapisano ręcznie”;
- **`queueSave(reason)`:** jak dotąd — napis „Zapisywanie…” i `save(reason)` po 250 ms;
- **cykliczny zapis:** `setInterval(..., 5000)` wywołuje `queueSave("interval")` tylko przy widocznej karcie (w tle produkcja nie działa, więc `lastSavedAt` zostaje czasem zejścia do tła);
- **`window.SowieIdleGame = { id: "ogrody", ready, snapshot }`** — `ready` rozwiązuje się po wczytaniu stanu, `snapshot()` zwraca bieżący `state` (tylko do odczytu). Korzysta z niego `shared/gameplay-expansion.js` (kontrakty dnia).

Najważniejsze pola:

- `leaves` — aktualne liście,
- `water` — aktualna woda,
- `prestigeSeeds` — niewydane nasiona prestiżu,
- `lifetimeLeaves` — liście lifetime,
- `lifetimeWater` — woda lifetime,
- `currentRunLeaves` — liście zdobyte w obecnym cyklu prestiżu,
- `currentRunWater` — woda zdobyta w obecnym cyklu prestiżu,
- `zone` — aktualna strefa,
- `unlocked` — odblokowane strefy,
- `plants` — liczba roślin danego typu,
- `upgrades` — zwykłe ulepszenia cyklu,
- `prestige` — stałe poziomy drzewka prestiżu,
- `automation` — ustawienia automatyzacji,
- `effects` — aktywne efekty czasowe,
- `can` — stan konewki,
- `stats` — statystyki lokalne,
- `achievements` — osiągnięcia lokalne.

## Zwykłe drzewka rozwoju

Zwykłe skille są przechowywane w `upgrades` i resetują się przy prestiżu. Dane są w tablicy `UPGRADES`.

Każdy wpis może mieć:

```txt
id
group
icon
name
cost
zone
req
desc
effect
```

Grupy zwykłych drzewek:

- `click` — ręczne zbiory,
- `production` — produkcja roślin,
- `water` — konewka, zraszacze, woda i humbak,
- `automation` — auto-zbiory, auto-kliknięcia, koza, dostawy i auto-buy.

Wymagania zwykłych skilli są walidowane przez `upgradeAvailable(upgrade)`, która sprawdza strefę oraz listę `req`.

## System ekonomii

Koszt rośliny:

```txt
cost = baseCost * growth ^ owned
```

Produkcja rośliny:

```txt
owned * baseProduction * globalMultiplier * plantMultiplier * zoneMultiplier * milestoneMultiplier
```

Całkowite LPS:

```txt
sum(production of all plants)
```

Kliknięcie:

```txt
clickPower = max(1, clickMultiplier + leavesPerSecond * clickLpsPercent)
```

## Offline progress

Po wejściu do gry **oraz po powrocie z tła** (`visibilitychange → visible`, np. powrót do przeglądarki na telefonie) porównywany jest obecny czas z `lastSavedAt`. Zejście do tła (`visibilitychange → hidden`) wywołuje `save("hidden")`, a `pagehide` — `save("pagehide")`.

```txt
elapsed = now - lastSavedAt
used = min(elapsed, offlineCap)
offlineLeaves = lps * used * offlineEfficiency
offlineWater = wps * used * min(1, offlineEfficiency * 0.6)
```

Jeżeli minęło mniej niż 60 sekund, modal offline progress nie jest pokazywany.

## Konewka

Konewka jest stanem w `state.can`:

```txt
charges
max
progress
```

Użycie podlewania:

- wymaga ulepszenia `wateringCan`,
- zużywa ładunek konewki albo 10 wody,
- ustawia `effects.watered` na 45 sekund,
- produkcja jest mnożona x2.

Zraszacze zwiększają `canRegen` i produkcję wody. Stałe ulepszenie prestiżowe `waterStart` zwiększa startową wartość konewki i przyspiesza jej regenerację.

## Automatyzacja

Automatyzacja jest liczona w `metrics()` na podstawie zwykłych ulepszeń oraz stałego drzewka prestiżu.

Systemy:

- `harvestInterval` — okresowy bonus auto-zbiorów,
- `autoClick` — generowanie kliknięć na sekundę,
- `goat` — automatyczne zbieranie części złotych liści,
- `delivery` — automatyczne odbieranie zwykłych dostaw,
- `autobuy` — auto-buy najbardziej opłacalnych roślin.

Stałe ulepszenia prestiżowe mogą wzmacniać automatyzację, np. `goatWisdom`, `amic`, `smartRoots` i `nightShift`.

## Eventy

Eventy są przechowywane w tablicy runtime `events`, nie w zapisie. Są krótkotrwałe i nie muszą przetrwać reloadu.

Typy:

- `golden`,
- `rainbow`,
- `splash`,
- `delivery`,
- `goat`,
- `pracu`.

## Prestiż i stałe drzewko prestiżu

Prestiż odblokowuje się przy 100M liści zdobytych w obecnym cyklu, czyli `currentRunLeaves >= 100_000_000`.

Wzór nasion:

```txt
base = floor(sqrt(currentRunLeaves / 10_000_000))
prestigeGain = floor(base * (1 + seedMemoryLevel * 0.08))
```

Reset prestiżowy kasuje:

- `leaves`,
- `water`,
- `currentRunLeaves`,
- `currentRunWater`,
- `plants`,
- `upgrades`,
- aktywne eventy,
- aktywne efekty cyklu.

Reset zachowuje:

- `prestigeSeeds`,
- `prestige`,
- `stats`,
- `achievements`,
- `lifetimeLeaves`,
- `lifetimeWater`.

Drzewko prestiżu jest zdefiniowane w `PRESTIGE_TREE`. Każdy węzeł ma:

```txt
id
branch
icon
name
cost
max
req
desc
effect
```

Gałęzie drzewka prestiżu:

- `Korzenie` — produkcja, szybszy start i więcej nasion,
- `Woda` — woda, konewka i pluski humbaka,
- `Idle` — offline progress,
- `Auto` — koza, dostawy i auto-buy.

Zakup stałego ulepszenia wykonuje `buyPrestigeUpgrade(id)`. Zależności są sprawdzane przez `prestigeAvailable(upgrade)`. Koszt skaluje się przez:

```txt
cost = ceil(baseCost * 1.55 ^ currentLevel)
```

## Renderer

Renderer rysuje wszystko w Canvas 2D:

- tła stref,
- rośliny,
- sowę,
- słomkowy kapelusz w szklarni,
- kozę,
- humbaka,
- ciężarówkę Amic,
- eventy,
- cząsteczki,
- teksty pływające,
- aktywne boosty.

Nie używa zewnętrznych obrazków.

## Responsywność

`style.css` używa układu dwukolumnowego na desktopie i jednokolumnowego na mniejszych ekranach. Panel danych ma przewijanie, a karty/tabele są kompaktowe, żeby mieściły się na telefonie.

Dla drzewek rozwoju dodane są klasy:

```txt
.skill-tree
.skill-node
.prestige-tree
.prestige-node
```

Na telefonie drzewka przechodzą do jednej kolumny.

## Integracja z menu

Główne `index.html` zawiera kartę:

```html
<a class="game-card" href="SowieOgrody/">
  <h2>Sowie Ogrody</h2>
  <p>Idle incremental: sadź rośliny, podlewaj konewką, automatyzuj ogród i wracaj po offline progress.</p>
</a>
```

## Testy ręczne

1. Gra ładuje się z menu głównego.
2. Kliknięcie dodaje liście.
3. Rośliny można kupić po uzbieraniu kosztu.
4. LPS rośnie po zakupie roślin.
5. Save przetrwa reload i jest widoczny na drugim urządzeniu (po wpisaniu hasła `huhu`).
6. Zakładka `Rozwój` pokazuje zwykłe drzewka skilli.
7. Zależności zwykłych skilli działają.
8. Konewka odblokowuje podlewanie.
9. Podlewanie daje boost x2.
10. Offline progress pokazuje modal po przerwie.
11. Automatyzacja działa po zakupie odpowiednich ulepszeń.
12. Sowa w szklarni ma słomkowy kapelusz.
13. Prestiż pojawia się po spełnieniu warunku obecnego cyklu.
14. Prestiż resetuje zwykłe skille, rośliny i zasoby.
15. Drzewko prestiżu zostaje po resetach.
16. Stałe ulepszenia prestiżowe przyspieszają nowy cykl.

## Utrzymanie

- Dane ekonomii są na początku `script.js`.
- Zmiany balansu najlepiej robić przez wartości w `PLANTS`, `UPGRADES` i `PRESTIGE_TREE`.
- Zapis wyłącznie przez `SowieCloud` (`loadGameState` / `saveGameState`); gra nie używa pamięci przeglądarki.
- Zmiana formatu stanu wymaga podniesienia `VERSION` i obsługi starszego stanu w `mergeSave`.

## Okno „🏆 Rekordy”

Strona ładuje `../shared/records.js` po `../shared/owl-gallery.js` (i po `../shared/game-guides.js`, który tworzy dok przycisków). Moduł dodaje do doku przycisk 🏆 i okno rekordów zasilane przez `SowieCloud` (podsumowanie `profil.records.ogrody`). Opis modułu: `docs/Documentation.md`, sekcja „`shared/records.js`”.
