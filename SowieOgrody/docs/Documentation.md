# Sowie Ogrody — dokumentacja techniczna

## Architektura

`Sowie Ogrody` jest samodzielną grą Canvas 2D w katalogu `SowieOgrody/`. Wykorzystuje wspólne elementy repozytorium:

- `../shared/cute-ui.css`,
- `../shared/sowie-core.js`,
- `../shared/sowie-runtime.js`,
- `../shared/progress-reset.js`,
- `../shared/sowie-smoke-hook.js`.

Główna logika znajduje się w `script.js`. Gra jest napisana jako jeden moduł IIFE, żeby łatwo działała bez bundlera.

## Kolejność ładowania

1. `../shared/progress-reset.js`
2. `../shared/sowie-smoke-hook.js`
3. `../shared/cute-ui.css`
4. `style.css`
5. `../shared/sowie-core.js`
6. `../shared/sowie-runtime.js`
7. `script.js`

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

Stan jest zapisywany jako JSON w `localStorage` pod kluczem:

```txt
sowieOgrodySave
```

Najważniejsze pola:

- `leaves` — aktualne liście,
- `water` — aktualna woda,
- `prestigeSeeds` — nasiona prestiżu,
- `lifetimeLeaves` — liście lifetime,
- `lifetimeWater` — woda lifetime,
- `zone` — aktualna strefa,
- `unlocked` — odblokowane strefy,
- `plants` — liczba roślin danego typu,
- `upgrades` — kupione ulepszenia,
- `prestige` — ulepszenia prestiżowe,
- `automation` — ustawienia automatyzacji,
- `effects` — aktywne efekty czasowe,
- `can` — stan konewki,
- `stats` — statystyki lokalne,
- `achievements` — osiągnięcia lokalne.

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

Po wejściu do gry porównywany jest obecny czas z `lastSavedAt`.

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

Zraszacze zwiększają `canRegen` i produkcję wody.

## Automatyzacja

Automatyzacja jest liczona w `metrics()` na podstawie kupionych ulepszeń.

Systemy:

- `harvest` — okresowy bonus auto-zbiorów,
- `autoClick` — generowanie kliknięć na sekundę,
- `goat` — automatyczne zbieranie części złotych liści,
- `delivery` — automatyczne odbieranie zwykłych dostaw,
- `autobuy` — auto-buy najbardziej opłacalnych roślin.

## Eventy

Eventy są przechowywane w tablicy runtime `events`, nie w zapisie. Są krótkotrwałe i nie muszą przetrwać reloadu.

Typy:

- `golden`,
- `rainbow`,
- `splash`,
- `delivery`,
- `goat`,
- `pracu`.

## Prestiż

Prestiż odblokowuje się przy 100M liści lifetime.

Wzór:

```txt
prestigeGain = floor(sqrt(lifetimeLeaves / 10_000_000)) - floor(prestigeCount * 1.5)
```

Reset zachowuje:

- `prestigeSeeds`,
- `prestige`,
- `stats`,
- `achievements`.

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
5. Save przetrwa reload.
6. Konewka odblokowuje podlewanie.
7. Podlewanie daje boost x2.
8. Offline progress pokazuje modal po przerwie.
9. Automatyzacja działa po zakupie odpowiednich ulepszeń.
10. Sowa w szklarni ma słomkowy kapelusz.
11. Prestiż pojawia się po spełnieniu warunku.

## Utrzymanie

- Dane ekonomii są na początku `script.js`.
- Zmiany balansu najlepiej robić przez wartości w `plants`, `upgrades` i `prestiges`.
- Nie dodawać Firebase bez wyraźnej potrzeby.
- Nie kasować `sowieOgrodySave` przez globalne resety bez świadomej decyzji.
