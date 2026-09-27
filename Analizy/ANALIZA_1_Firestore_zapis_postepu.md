# Analiza 1 — przeniesienie zapisu postępu SowieGry do Firestore

> Data: 2026-09-27 · Wersja 3 (po decyzjach właściciela; reguły Firestore opublikowane) · Zakres: wszystkie gry i moduły `shared/` · Status: **analiza**, bez zmian w kodzie i bez zapisów do bazy.
> Kolejność prac: [`ANALIZA_3_Plan_prac.md`](ANALIZA_3_Plan_prac.md).

---

## Decyzje właściciela (2026-09-27)

| # | Temat | Decyzja |
|---|---|---|
| 1 | Tożsamość gracza | **Jeden profil gracza**, chroniony hasłem **`huhu`**. Hasło może być jawne w kodzie aplikacji. |
| 2 | Obecne wyniki z `localStorage` | **Kasujemy.** Bez przenoszenia do Firestore. |
| 3 | Reguły Firestore | ✅ **Opublikowane przez właściciela 2026-09-27** — wersja z rozdziału 9.2 (drugi projekt działa bez zmian). |
| 4 | Historia rozgrywek | Tak, max 50 wpisów na grę. |
| 5 | Rankingi | Jeden gracz, więc zamiast rankingu między graczami są **rekordy osobiste**: top 10 wyników na grę i poziom trudności oraz rekordy wyzwania dnia. |
| 6 | Pamiętanie urządzenia | Tak: po podaniu hasła urządzenie zapamiętuje odblokowanie (1 klucz `localStorage`, bez postępu gry). |
| 7 | Główne urządzenie | **Telefon.** Wszystkie ekrany (hasło, ładowanie, komunikaty) projektujemy najpierw pod telefon w pionie. |

Pozostałe rekomendacje z pierwszej wersji analizy zostały zaakceptowane bez zmian.

---

## 0. Najważniejsze wnioski

1. **Dziś nic nie zapisuje się na GitHubie.** GitHub (Pages) tylko udostępnia pliki gry. Cały postęp leży w `localStorage` przeglądarki: osobno na każdym urządzeniu i w każdej przeglądarce. Znika po wyczyszczeniu danych strony i nie działa między telefonem a komputerem. Jedyną formą przeniesienia jest ręczny eksport/import pliku JSON w oknie „Ustawienia i zapis”.
2. Zapis jest rozproszony: **12 plików JS** samodzielnie czyta i pisze `localStorage` pod **18 rodzajami kluczy**. Część z nich to klucze dzienne, które przybywają codziennie i nigdy nie są sprzątane.
3. Wprowadzamy **jeden nowy moduł `shared/sowie-cloud.js`**: magazyn danych w pamięci plus Firestore jako trwały zapis. Tylko ten moduł rozmawia z bazą. Gry i moduły wspólne przestają dotykać `localStorage`.
4. Wszystkie dane trafiają do **jednej kolekcji `sowiegry`**: `sowiegry/meta` oraz `sowiegry/profil` (jedyny profil) z podkolekcją `sowiegry_gry/{gameId}` i historią `sowiegry_gry/{gameId}/sowiegry_historia`.
5. Wejście do gier wymaga **hasła `huhu`** podanego raz na urządzeniu. To wygodna bramka, a nie zabezpieczenie: hasło jest w publicznym kodzie strony.
6. SDK: **Firebase JS SDK 12.19.0 (modularny) z CDN gstatic**, ładowany dynamicznie, z trwałym cache w IndexedDB. Gra działa offline, a zapisy wysyłają się, gdy wróci sieć. To ważne na telefonie (metro, słaby zasięg).
7. Reguły: **od 2026-09-27 obowiązują reguły z rozdziału 9.2**, opublikowane przez właściciela. Drugi projekt działa jak wcześniej, a kolekcje `sowiegry`, `sowiegry_gry` i `sowiegry_historia` mają walidację. Poprzednie reguły (`allow read, write: if true` dla całej bazy) zostały zastąpione.
8. Do usunięcia: `shared/progress-reset.js`, `shared/idle-save-bridge.js`, migracje i kopie `sowieGryBackup:*`, eksport/import JSON oraz wszystkie `localStorage.getItem/setItem` w grach i modułach wspólnych. Stare klucze kasujemy **tylko po nazwach SowieGry**, nigdy przez `localStorage.clear()` (rozdział 12).

---

## 1. Jak zapis działa dziś

### 1.1 Gdzie naprawdę trafiają dane

```
przeglądarka gracza
└── localStorage (domena strony, np. GitHub Pages)
    ├── sowieGryProfile          ← wspólny profil (SowiePlatform / SowieCore)
    ├── sowieGryAcademy          ← Sowia Akademia
    ├── sowieOwlGallery          ← Galeria Sów
    ├── sowaRunnerBest…, sowaJumperBest…, sowa3Best, …   ← rekordy gier arcade
    ├── sowieOgrodySave, sowiaSzklarniaSave              ← pełne stany gier idle
    └── sowieExpansion:*, sowieDailyBest:*, sowieGryBackup:* …
```

GitHub nie otrzymuje żadnych danych. W kodzie nie ma `fetch`, API GitHuba ani żadnego innego serwera. Kopia „w chmurze” istnieje tylko wtedy, gdy gracz sam pobierze plik `sowie-gry-zapis-RRRR-MM-DD.json` (`shared/sowie-platform.js:192`) i potem go zaimportuje.

### 1.2 Pełna mapa kluczy `localStorage`

Wszystkie poniższe klucze zostaną **skasowane** (decyzja 2). Ostatnia kolumna mówi, gdzie ten rodzaj danych będzie zapisywany od nowa.

| Klucz | Kto zapisuje (plik:linia) | Zawartość | Kiedy zapisywany | Nowe miejsce w Firestore |
|---|---|---|---|---|
| `sowieGryProfile` | `shared/sowie-platform.js:127–144`, wywołania z `shared/sowie-core.js:40` | kosmetyki, ustawienia audio/efektów, 7 misji, statystyki | każda zmiana profilu; statystyki z opóźnieniem 0,75–3 s (`sowie-core.js:105`) | `profil`: `settings`, `cosmetics`, `missions`, `stats` |
| `sowieGryBackup:{klucz}:v{n}` | `sowie-platform.js:87` | kopie sprzed migracji i importu | migracja, import | — (znika) |
| `sowieGryMigrationsVersion` | `sowie-platform.js:164` | numer migracji | każde otwarcie strony | — (znika) |
| `sowieGryAcademy` | `shared/sowie-academy.js:58–82` | XP, piórka, metryki, misje dzienne i tygodniowe, przyznane nagrody | każda zmiana metryki | `profil.academy` |
| `sowieOwlGallery` | `shared/owl-gallery.js:332–355` | odblokowane i obejrzane zdjęcia, ulubione | odblokowanie, obejrzenie | `profil.gallery` |
| `sowaRunnerBestScore`, `sowaRunnerBestDistance` | `SowaRunner/sketch.js:4, 22` | rekordy | koniec biegu | `profil.records.runner` + `gry/runner.top10` |
| `sowaJumperBestScore`, `sowaJumperBestHeight` | `SowaJumper/script.js:19–20, 298–299` | rekordy | koniec gry | `profil.records.jumper` + `gry/jumper.top10` |
| `sowaJumperDifficulty` | `SowaJumper/difficulty.js:35, 45` | wybrany poziom trudności | zmiana poziomu | `gry/jumper.difficulty` |
| `sowa3Best` | `Sowa3/script.js:18, 49` | rekord | koniec gry | `profil.records.sowa3` + `gry/sowa3.top10` |
| `sowa3Difficulty` | `Sowa3/difficulty.js:35, 47` | poziom trudności | zmiana poziomu | `gry/sowa3.difficulty` |
| `sowa3FinishSeen` | `Sowa3/finish-controls.js:20, 31` | czy finał był obejrzany (pozwala go pominąć) | po pierwszym finale | `gry/sowa3.finishSeen` |
| `sowieOgrodySave` | `SowieOgrody/script.js:148–149` | pełny stan gry idle | co 5 s (`setInterval`), co 7 s (bridge), po akcjach | `gry/ogrody.state` |
| `sowiaSzklarniaSave` | `SowiaSzklarnia/script.js:68–69, 153` | pełny stan gry idle; reset usuwa klucz | bridge co 7 s, w pętli gdy `now % 7000 < 20`, po akcjach | `gry/szklarnia.state` |
| `sowieSzklarniaTraitAlbum` | `shared/gameplay-expansion.js` (`initializeGreenhouse`, od linii 354) | album cech roślin | nowa cecha | `gry/szklarnia.traitAlbum` |
| `sowieExpansion:{gra}:{data}` | `gameplay-expansion.js` (`claimFeature`, `initializeGardens`, `initializeGreenhouse`) | odebrane nagrody i stan bazowy dziennych kontraktów | raz dziennie + przy odbiorze | `gry/{gra}.daily` (tylko bieżący dzień) |
| `sowieDailyBest:{data}:{gra}:{metryka}` | `gameplay-expansion.js:69–74` | najlepszy wynik wyzwania dnia | koniec gry z `?daily=1` | `gry/{gra}.dailyBest` (ostatnie 30 dni) |

### 1.3 Problemy obecnego rozwiązania

- **Postęp jest przywiązany do urządzenia i przeglądarki.** Tryb prywatny, wyczyszczenie danych albo zmiana telefonu oznaczają utratę wszystkiego.
- **Na iPhonie dane mogą zniknąć same.** Safari usuwa `localStorage` i IndexedDB stron, na których nie było interakcji przez 7 dni (dotyczy stron otwieranych w przeglądarce, a nie aplikacji dodanych do ekranu głównego).
- **Klucze rosną bez końca.** `sowieExpansion:*` i `sowieDailyBest:*` przybywają codziennie dla każdej gry. Kopie `sowieGryBackup:*` też nigdy nie są usuwane.
- **Ukryte zależności.** `gameplay-expansion.js` co 2,5 s parsuje cały zapis Ogrodów i Szklarni prosto z `localStorage`, żeby policzyć kontrakty. Zmiana formatu zapisu gry po cichu psuje ten moduł.
- **Obejścia zamiast API.** `shared/idle-save-bridge.js` wywołuje zapis gier idle przez stworzenie niewidocznego przycisku i zasymulowanie kliknięcia. Szklarnia sama zapisuje tylko wtedy, gdy znacznik czasu klatki trafi w warunek `now % 7000 < 20`, czyli przypadkowo.
- **Duży koszt utrzymania.** Migracje, kopie zapasowe, eksport i import to ok. 130 linii w `sowie-platform.js`, osobny `progress-reset.js` i część `sowie-core.js`.

---

## 2. Firebase — stan wyjściowy

- `config/firebase-config.js` ustawia `window.firebaseConfig` dla projektu **`rpg-dataslate-relay`**, tego samego, którego używa drugi projekt. Komentarz w pliku wspomina `GM.html` i `DataSlate.html`, bo został skopiowany z tamtego projektu. Przy wdrożeniu poprawiamy go.
- **Stan bazy (2026-09-27):** kolekcje drugiego projektu `audio`, `character_builder`, `dataslate`; kolekcji `sowiegry` jeszcze nie ma (powstanie przy pierwszym uruchomieniu nowej wersji). Projekt ma też Realtime Database z osobnymi regułami, których SowieGry nie dotykają.
- **Reguły Firestore (2026-09-27):** opublikowane reguły z rozdziału 9.2 (poprzednio `allow read, write: if true` dla całej bazy).
- `apiKey` w kodzie klienta to nic złego. W Firebase klucz nie jest tajny, a o bezpieczeństwie decydują reguły (rozdział 9).
- **Baza jest współdzielona z innym projektem**, co oznacza:
  - wspólne limity. Na darmowym planie Spark jest to dziennie ok. 50 000 odczytów, 20 000 zapisów i 20 000 usunięć oraz 1 GiB danych. Plan i limity trzeba sprawdzić w konsoli Firebase;
  - wspólny plik reguł. Każda zmiana reguł musi zachować dostęp drugiego projektu;
  - wspólny obszar nazw grup kolekcji. Funkcje działające „po nazwie podkolekcji” (zapytania `collectionGroup`, polityki TTL, wyjątki indeksów) obejmują całą bazę. Projekt SowieGry **ich nie używa**, a jego podkolekcje mają unikalne nazwy z przedrostkiem `sowiegry_`, żeby nie kolidować z nazwami drugiego projektu (także w regułach, rozdział 9).
- **W Firestore nie tworzy się pustych kolekcji.** Kolekcja `sowiegry` pojawi się sama przy pierwszym zapisie dokumentu. Pierwszy start nowej wersji wykona idempotentny zapis `sowiegry/meta` (`setDoc(..., { merge: true })`). To jest „utworzenie kolekcji”.
- Podczas tej analizy **nic nie zostało zapisane do bazy**.

---

## 3. Architektura docelowa

```
 gry: SowaRunner · SowaJumper · Sowa3 · Sowie Ogrody · Sowia Szklarnia
   │   (proste API: records(), submitRun(), loadGameState(), saveGameState() …)
   ▼
 SowieCore · SowieAcademy · SowieOwlGallery · zadania dnia
   │   (zmieniają wyłącznie obiekt profilu w pamięci)
   ▼
 shared/sowie-cloud.js  ─ bramka hasła + magazyn w pamięci + kolejka zapisów (debounce, batch, flush)
   │
   ├── FirestoreBackend   produkcja: Firebase JS SDK 12.19.0, cache IndexedDB
   └── MemoryBackend      testy (?cloud=memory), awaria CDN, tryb offline bez SDK
```

Zasady:

1. **Tylko `sowie-cloud.js` zna Firestore.** Reszta kodu nie importuje SDK i nie zna ścieżek dokumentów.
2. **Odczyty są synchroniczne, z pamięci.** Pętle gier (`draw`, `update`) potrzebują wartości od razu. Zapisy idą w tle.
3. **Start czeka na dane.** Dziś gry czytają `localStorage` przy ładowaniu skryptu (np. `SowaJumper/script.js:19`). Po zmianie każda gra startuje dopiero po `await SowieCloud.ready`.
4. **Zapis odroczony (write-behind).** Zmiana oznacza dane jako „brudne”. Kolejka wysyła je z opóźnieniem, a natychmiast na końcu gry, przy zakupach, prestiżu i przy `visibilitychange → hidden` (na telefonie to moment przejścia do ekranu głównego lub innej aplikacji).

### 3.1 Wybór SDK

Rozmiary zmierzone 2026-09-27 dla wersji 12.19.0 z `https://www.gstatic.com/firebasejs/12.19.0/`:

| Wariant | Rozmiar (gzip) | Praca offline | Nasłuch zmian | Ocena |
|---|---|---|---|---|
| Modularny: `firebase-app.js` + `firebase-firestore.js` | 24 KB + 179 KB | tak (IndexedDB, wiele kart) | tak | **wybrany** |
| Compat: `firebase-app-compat.js` + `firebase-firestore-compat.js` | ok. 10 KB + 163 KB | tak | tak | starsze API „namespace”, wygaszane |
| Firestore Lite: `firebase-firestore-lite.js` | 37 KB | **nie** | nie | za mało: brak zasięgu = utrata zapisów |

Modularny SDK da się załadować ze zwykłego (nie-modułowego) skryptu przez dynamiczny `import()`, więc nie trzeba przebudowywać reszty kodu na moduły ES:

```js
// shared/sowie-cloud.js — szkic połączenia
const SDK = "https://www.gstatic.com/firebasejs/12.19.0";

async function connectFirestore() {
  const [{ initializeApp }, fs] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-firestore.js`),
  ]);
  // Nazwana aplikacja — nie koliduje z domyślną aplikacją innego projektu na tej samej domenie.
  const app = initializeApp(window.firebaseConfig, "sowiegry");
  const db = fs.initializeFirestore(app, {
    localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }),
    ignoreUndefinedProperties: true,
  });
  return { db, fs };
}
```

Kolejność skryptów w każdym `index.html` (ścieżki względne z folderu gry):

```html
<script src="../config/firebase-config.js"></script>
<script src="../shared/sowie-platform.js"></script>
<script src="../shared/sowie-cloud.js"></script>
<!-- dalej: sowie-core.js, notification-manager.js, gra, … -->
```

Wersja SDK jest **przypięta na sztywno** (12.19.0). Aktualizacja to świadoma zmiana jednej stałej. Opcjonalnie oba pliki ESM można skopiować do repo (`vendor/firebase/12.19.0/`), żeby nie zależeć od gstatic.

Jeśli import się nie uda (brak zasięgu przy pierwszej wizycie, zablokowany CDN), moduł przechodzi na `MemoryBackend` i pokazuje pasek „Tryb offline — postęp z tej sesji nie zostanie zapisany”.

### 3.2 Publiczne API `SowieCloud`

```js
window.SowieCloud = {
  ready,                          // Promise: hasło podane + profil wczytany
  status(),                       // "haslo" | "laczenie" | "online" | "offline" | "zapisywanie" | "blad"
  onStatus(listener),

  // bramka hasła
  isUnlocked(),                   // czy to urządzenie ma zapamiętane odblokowanie
  unlock(password),               // true/false; przy true zapamiętuje urządzenie i łączy z bazą
  lock(),                         // „Wyloguj to urządzenie” w ustawieniach

  // profil (jeden)
  profile(),                      // obiekt w pamięci (tylko odczyt)
  updateProfile(mutator),         // mutator(profile) → oznacza zmiany, zapis odroczony

  // gry
  records(gameId, difficulty),    // rekordy z pamięci, np. { bestScore, bestDistance }
  submitRun(gameId, result),      // koniec rozgrywki: rekordy, top 10, statystyki, historia, rekord dnia
  topRuns(gameId, difficulty),    // top 10 z dokumentu gry
  history(gameId, limit = 10),    // ostatnie rozgrywki
  loadGameState(gameId),          // Promise<object|null> — stan gry idle / ustawienia gry
  saveGameState(gameId, state, { immediate }),

  flush(),                        // wymuszenie wysłania kolejki
};
```

---

## 4. Model danych w kolekcji `sowiegry`

Nazwy ścieżek są po polsku, żeby łatwo czytało się je w konsoli Firebase. Nazwy pól są takie jak w obecnych obiektach w kodzie (`settings`, `missions`, `stats` …), więc nie trzeba pisać warstwy tłumaczącej.

```
sowiegry                                   (kolekcja — jedyna używana przez SowieGry)
│
├── meta                                   (dokument)
│     schemaVersion: 1
│     createdAt: <serverTimestamp>
│     games: ["runner","jumper","sowa3","ogrody","szklarnia"]
│
└── profil                                 (dokument — jedyny profil gracza)
      └── sowiegry_gry                     (podkolekcja: jeden dokument na grę)
            ├── runner
            │     └── sowiegry_historia    (podkolekcja: ostatnie rozgrywki, max 50)
            ├── jumper
            │     └── sowiegry_historia
            ├── sowa3
            │     └── sowiegry_historia
            ├── ogrody
            └── szklarnia
```

**Identyfikatory gier (`runner`, `jumper`, `sowa3`, `ogrody`, `szklarnia`) są stałe.** Nie zmieniają się przy zmianie nazw gier ani folderów w repo (Analiza 2), bo lista dozwolonych gier jest w opublikowanych regułach (rozdział 9.2).

**Nazwy podkolekcji mają przedrostek `sowiegry_`**, bo reguły (rozdział 9.2) rozpoznają dane SowieGry po nazwie kolekcji. Ogólne nazwy `gry` czy `historia` mogłyby istnieć w drugim projekcie. W dalszej części dokumentów skrót `gry/{gameId}` oznacza `sowiegry/profil/sowiegry_gry/{gameId}`, a `historia` — podkolekcję `sowiegry_historia`.

Historia jest podkolekcją dokumentu gry, a nie profilu. Dzięki temu zapytanie „ostatnie 10 rozgrywek w Runnerze” (`orderBy("at", "desc").limit(10)`) nie wymaga ręcznie tworzonego indeksu złożonego.

### 4.1 Dokument profilu `sowiegry/profil`

```json
{
  "schemaVersion": 1,
  "name": "Sowa",
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>",
  "lastSeenAt": "<serverTimestamp>",

  "settings":  { "music": true, "sfx": true, "quips": true, "reducedEffects": false },
  "cosmetics": { "unlocked": ["none", "bow"], "selected": "none" },
  "missions":  { "leaves20": { "progress": 0, "target": 20, "done": false, "reward": "glasses" } },
  "stats":     { "leaves": 0, "nearMisses": 0, "extraLives": 0, "finishes": 0, "maxCombo": 1 },

  "academy":   { "xp": 0, "feathers": 0, "metrics": {}, "daily": {}, "weekly": {}, "awards": {} },
  "gallery":   { "unlocked": ["owl-01"], "viewed": [], "favorite": null },

  "records": {
    "runner":    { "runs": 42, "lastPlayedAt": "<ts>",
                   "chill":  { "bestScore": 3900, "bestDistance": 1210 },
                   "arcade": { "bestScore": 5120, "bestDistance": 1480 },
                   "chaos":  { "bestScore": 2200, "bestDistance": 610 } },
    "jumper":    { "runs": 18, "arcade": { "bestScore": 3900, "bestHeight": 312 } },
    "sowa3":     { "runs": 20, "finishes": 5, "maxCombo": 5, "arcade": { "bestScore": 2750 } },
    "ogrody":    { "lifetimeLeaves": 3200000000, "prestiges": 2, "zone": "greenhouse" },
    "szklarnia": { "lifetimeLeaves": 810000, "rooms": 6, "hybrids": 2 }
  }
}
```

Uwagi:

- Profil powstaje automatycznie przy pierwszym połączeniu po podaniu hasła (wartości domyślne jak w obecnym `createDefaultProfile()`).
- Obecne statystyki `runnerDistance`, `jumperHeight`, `ogrodyLeaves`, `ogrodyGardenLevel`, `szklarniaLeaves`, `szklarniaRooms` dublują rekordy. Przenosimy je do `records`, a w `stats` zostają liczniki ogólne.
- Rekordy są osobne dla każdego poziomu trudności (Chill / Arcade / Chaos), bo to różne gry pod względem trudności.
- `academy.awards` rośnie codziennie (klucze typu `daily:2026-09-27:runner-distance`). Przy zapisie przycinamy wpisy dzienne starsze niż 30 dni. Nagrody trwałe (`trait:*`, `weekly:*`) zostają.
- Wielkość profilu: kilka–kilkanaście KB. Limit dokumentu Firestore to 1 MiB.

### 4.2 Dokumenty gier `sowiegry/profil/sowiegry_gry/{gameId}`

Gry arcade (ustawienia, top 10, wyzwanie dnia):

```json
{
  "difficulty": "arcade",
  "finishSeen": true,
  "top10": {
    "arcade": [ { "score": 5120, "distance": 1480, "leaves": 112, "at": 1790000000000 } ],
    "chill": [],
    "chaos": []
  },
  "dailyBest": { "2026-09-27": 1180, "2026-09-26": 940 },
  "daily": { "date": "2026-09-27", "baseline": {}, "claimed": {} },
  "updatedAt": "<serverTimestamp>"
}
```

`top10` i `dailyBest` są aktualizowane przez `submitRun()`. `dailyBest` przycinamy do ostatnich 30 dni.

Gry idle (pełny stan):

```json
{
  "saveVersion": 2,
  "state": "{\"version\":2,\"leaves\":12345.6, … }",
  "summary": { "lifetimeLeaves": 3200000000, "zone": "greenhouse", "prestiges": 2 },
  "savedAt": "<serverTimestamp>",
  "clientSavedAt": 1790000000000,
  "rev": 381,
  "deviceId": "d-7f3k9q",
  "traitAlbum": ["fast|tasty", "normal|boring"]
}
```

**Stan gry idle to tekst JSON (`state`), a nie mapa Firestore**, ponieważ:

- Firestore nie przyjmuje tablic zagnieżdżonych w tablicach ani wartości `undefined`, a stany gier idle to swobodne struktury;
- każde pole mapy jest automatycznie indeksowane. Duży stan to tysiące zbędnych wpisów indeksu (limit 40 000 na dokument), a wyjątków indeksu nie używamy przez wspólną bazę (rozdział 2);
- gry i tak mają własne `mergeSave()` i numer wersji zapisu, więc Firestore nie musi rozumieć środka.

Pola, które chcemy oglądać w konsoli (`summary`), zostają zwykłymi polami.

### 4.3 Historia rozgrywek `sowiegry/profil/sowiegry_gry/{gameId}/sowiegry_historia/{autoId}`

```json
{ "score": 4210, "distance": 1180, "leaves": 96, "difficulty": "arcade",
  "durationMs": 184000, "daily": false, "seed": null, "at": "<serverTimestamp>" }
```

Zasila ekran „Ostatnie gry” i wykres postępu. Żeby kolekcja nie rosła bez końca, klient po dopisaniu wpisu usuwa najstarsze ponad 50. Nie używamy polityki TTL, bo działa po nazwie grupy kolekcji w całej bazie.

---

## 5. Profil gracza i hasło

**Decyzja:** jeden wspólny profil i hasło `huhu`, jawne w kodzie (`const HASLO_GRACZA = "huhu"` w `shared/sowie-cloud.js`).

**Jak to działa:**

1. Pierwsze wejście na dowolną stronę SowieGry na danym urządzeniu pokazuje ekran **„Hasło sowy”** (jedno pole i przycisk „Wejdź”).
2. Po podaniu poprawnego hasła urządzenie zapisuje jeden klucz `localStorage`: `sowiegry:urzadzenie` = `{ "unlocked": true, "deviceId": "d-7f3k9q" }`. Nie ma w nim postępu gry, więc jest to zgodne z zasadą „postęp tylko w Firestore”. `deviceId` służy do wykrywania gry na dwóch urządzeniach naraz (rozdział 6).
3. Kolejne wejścia omijają ekran hasła. W ustawieniach jest przycisk „Wyloguj to urządzenie” (`SowieCloud.lock()`).
4. Błędne hasło: komunikat „Hu-hu? To nie to hasło 🦉”, bez blokady prób.

**Szczegóły pod telefon:**

- pole ma `font-size: 16px` lub więcej, bo inaczej iOS powiększa stronę przy dotknięciu pola;
- `autocapitalize="none"`, `autocorrect="off"`, `spellcheck="false"`, `autocomplete="off"`, `enterkeyhint="go"`. Klawiatury telefonów lubią zmieniać „huhu” na „Huhu”, więc porównanie i tak ignoruje wielkość liter i spacje: `wpisane.trim().toLowerCase() === HASLO_GRACZA`;
- przycisk „Wejdź” min. 48 px wysokości, w dolnej połowie ekranu (zasięg kciuka); Enter na klawiaturze też zatwierdza;
- przycisk „pokaż hasło” (oczko), bo na telefonie łatwo o literówkę;
- ekran działa w pionie od 320 px szerokości i nie przesuwa się pod klawiaturą (`visualViewport`).

**Czym ta bramka jest, a czym nie jest:** hasło jest w publicznym kodzie strony, a reguły Firestore nie wymagają logowania. Bramka chroni przed przypadkowym wejściem (np. ktoś kliknie link), ale nie przed osobą, która przeczyta kod. Dla gier rodzinnych to wystarczy (decyzja 1). Gdyby kiedyś było potrzebne prawdziwe zabezpieczenie: rozdział 9.3.

**Safari na iPhonie:** jeśli gry otwierane są w Safari (a nie jako aplikacja dodana do ekranu głównego), Safari może skasować zapamiętane odblokowanie po 7 dniach bez wizyty. Wtedy wystarczy ponownie wpisać `huhu`. Postęp jest bezpieczny w Firestore. Po dodaniu gier do ekranu głównego (PWA, Analiza 2) problem znika.

---

## 6. Zapisywanie: kiedy i jak

| Zdarzenie | Co zapisujemy | Mechanizm | Częstotliwość |
|---|---|---|---|
| Pierwsze połączenie | `sowiegry/meta` + `sowiegry/profil` z wartościami domyślnymi (jeśli nie istnieją) | `setDoc(merge)` | raz |
| Zmiana ustawień / kosmetyku | `settings` / `cosmetics` | `setDoc(merge)` z opóźnieniem 1 s | rzadko |
| Postęp misji i statystyk w trakcie gry | tylko pamięć | — | wysyłka przy końcu gry, ukryciu aplikacji, najpóźniej co 30 s |
| Koniec rozgrywki arcade | profil: `records`, `stats` przez `increment()`, `missions`, `academy`, `gallery`; dokument gry: `top10`, `dailyBest`; wpis w `historia` | 1× `writeBatch` | 1 zapis na rozgrywkę |
| Gry idle — praca w tle | `gry/{gra}` (`state`, `summary`, `rev`) + `records.{gra}` | opóźnienie 30 s | ≤ 120 zapisów/h |
| Gry idle — ważne akcje (zakup ulepszenia, prestiż, reset) | jw. | opóźnienie 2 s | wg akcji |
| Przejście do innej aplikacji / blokada ekranu / zamknięcie | wszystko, co czeka w kolejce | `flush()` przy `visibilitychange → hidden` oraz `pagehide` | przy wyjściu |

**Rekordy (max)**: Firestore nie ma operacji „max”. Profil w pamięci jest źródłem prawdy, więc porównanie robi klient i zapisuje pole tylko przy poprawie. Liczniki (`runs`, `stats.leaves`) idą przez `increment(n)`, więc sumują się poprawnie nawet z dwóch urządzeń naraz.

**Telefon a zamykanie aplikacji:** na iPhonie `beforeunload` i `unload` często w ogóle się nie wywołują, a system usypia kartę zaraz po przejściu do ekranu głównego. Dlatego kluczowy jest `visibilitychange → hidden`. Przy `persistentLocalCache` zapis trafia najpierw do IndexedDB. Jeśli system uśpi kartę przed wysłaniem, SDK wyśle zapis przy następnym otwarciu dowolnej strony SowieGry.

**Powrót z tła (gry idle):** telefon często trzyma kartę uśpioną godzinami i „budzi” ją bez przeładowania strony. Dziś Ogrody liczą postęp offline tylko przy starcie (`applyOfflineProgress()` w `init()`). Po zmianie postęp offline liczymy także przy `visibilitychange → visible`, na podstawie czasu ostatniego ticku.

**Dwa urządzenia naraz (gry idle):** domyślnie wygrywa ostatni zapis. Zabezpieczenie: licznik `rev` i `deviceId`. Gra nasłuchuje swojego dokumentu (`onSnapshot`). Jeśli pojawi się nowszy `rev` z innego urządzenia, pokazuje okno „Na innym urządzeniu zapisano nowszy postęp — wczytać?”.

**Czas offline:** zapisujemy `savedAt` jako `serverTimestamp()`, a czas nieobecności przycinamy do przedziału `[0, limit offline]`. Różnice zegarów telefonu i komputera nie zawyżą postępu.

### 6.1 Szacunek zużycia limitów

| Scenariusz | Zapisy | Odczyty |
|---|---|---|
| Godzina gry idle | ≤ 120 + kilka przy akcjach | 2–3 przy starcie |
| Godzina gier arcade (rozgrywka co ~2 min) | ok. 30–60 (+ usuwanie starej historii) | 2–3 przy starcie + historia (10 dokumentów na ekran) |
| Wejście do menu | 0–1 | 1 (profil), zwykle z cache |

Przy darmowym limicie 20 000 zapisów dziennie zostaje duży zapas, **ale limit jest wspólny z drugim projektem**.

---

## 7. Start aplikacji

```
index.html / gra
 1. config/firebase-config.js      → window.firebaseConfig
 2. shared/sowie-platform.js       → rejestr gier, stałe (bez localStorage)
 3. shared/sowie-cloud.js          → sprzątanie starych kluczy (rozdział 12, tylko raz)
 4. urządzenie odblokowane?        ── nie ──► ekran „Hasło sowy” → unlock("huhu")
                                     tak
 5. connectFirestore(); setDoc(sowiegry/meta, merge)
 6. getDoc(sowiegry/profil)  (najpierw cache, potem sieć; brak → wartości domyślne)
 7. w grze: getDoc(sowiegry/profil/sowiegry_gry/{gameId})
 8. SowieCloud.ready ✔  → SowieCore, SowieAcademy, SowieOwlGallery → init() gry
```

Zmiany w grach wynikające z asynchronicznego startu:

- **SowaJumper, Sowa3, Ogrody, Szklarnia**: logikę z poziomu skryptu (np. `const state = { best: Number(localStorage…) }`) przenosimy do funkcji startowej wywoływanej po `SowieCloud.ready`.
- **SowaRunner (p5.js w trybie globalnym)**: p5 sam wywołuje `setup()` po załadowaniu strony. Do czasu `ready` `draw()` rysuje ekran „Wczytywanie…”, a rekordy trafiają do zmiennych po `ready`. Po przepisaniu Runnera bez p5 (Analiza 2) ten problem znika.

**Czas ładowania na telefonie:** pierwsza wizyta pobiera SDK (~200 KB gzip). Na słabym LTE to ok. 1–2 s. Ograniczenia:

- import SDK startuje **równolegle** z wyświetleniem ekranu tytułowego gry, a nie po nim;
- do czasu `ready` widać animowaną sówkę ładowania;
- kolejne wizyty korzystają z cache przeglądarki, a po wdrożeniu PWA (Analiza 2) także z service workera;
- dane profilu czytamy najpierw z cache IndexedDB (`getDocFromCache`), więc przy powrocie do gry start jest natychmiastowy, a aktualizacja z sieci dochodzi w tle.

---

## 8. Rekordy osobiste (zamiast rankingu)

Jeden gracz, więc nie ma rankingu między graczami. W zamian:

| Ekran | Źródło | Koszt |
|---|---|---|
| Karta gry w menu: najlepszy wynik | `profil.records.{gra}` | 0 dodatkowych odczytów |
| „🏆 Rekordy” w grze: top 10 dla wybranego poziomu trudności | `gry/{gra}.top10.{poziom}` | 1 odczyt (zwykle z cache) |
| „Ostatnie gry” + prosty wykres postępu | `gry/{gra}/sowiegry_historia` (`orderBy("at","desc").limit(10)`) | 10 odczytów |
| Wyzwanie dnia: dzisiejszy rekord i poprzednie dni | `gry/{gra}.dailyBest` | 0 dodatkowych odczytów |
| Ekran końca gry | „Nowy rekord!” / „3. miejsce w Twoim top 10” | liczone w pamięci |

---

## 9. Reguły bezpieczeństwa

### 9.1 Poprzednie reguły (obowiązywały do 2026-09-27)

```
match /{document=**} { allow read, write: if true; }
```

Każdy, kto znał konfigurację (jest w publicznym kodzie strony), mógł czytać, zmieniać i **kasować wszystko**: dane SowieGry i dane drugiego projektu.

**Ważne:** reguły Firestore się sumują. Jeśli *którakolwiek* pasująca reguła pozwala, dostęp jest przyznany. Dopisanie ostrzejszego bloku dla `sowiegry` obok powyższej reguły **nic nie zmieni**. Trzeba wyłączyć kolekcje SowieGry z reguły ogólnej.

### 9.2 Obowiązujące reguły — opublikowane 2026-09-27 (drugi projekt działa bez zmian)

> **Stan:** właściciel opublikował poniższe reguły w konsoli Firebase 2026-09-27. Kopia w repo (`firestore.rules`, etap E0) musi być z nimi identyczna. Każda późniejsza zmiana reguł = zmiana w `firestore.rules` + ponowna publikacja w konsoli przez właściciela.

Kolekcje drugiego projektu (2026-09-27): `audio`, `character_builder`, `dataslate`. Reguła ogólna nie wymienia ich z nazwy. Rozpoznaje dane SowieGry **po nazwie kolekcji, w której leży dokument**, więc drugi projekt działa jak dotąd, także po dodaniu nowych kolekcji i także przy zapytaniach `collectionGroup`.

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // 1) Drugi projekt (audio, character_builder, dataslate i każda inna kolekcja):
    //    pełny dostęp jak dotąd, także zapytania collectionGroup.
    //    Wyjątek: trzy kolekcje SowieGry.
    match /{sciezka=**}/{kolekcja}/{dokument} {
      allow read, write: if !(kolekcja in ["sowiegry", "sowiegry_gry", "sowiegry_historia"]);
    }

    // 2) SowieGry
    match /sowiegry/meta {
      allow read: if true;
      allow create, update: if request.resource.data.schemaVersion is int;
      allow delete: if false;
    }

    match /sowiegry/profil {
      allow read: if true;
      allow create, update: if request.resource.data.schemaVersion is int
                            && request.resource.data.size() <= 30;
      allow delete: if false;

      match /sowiegry_gry/{gra} {
        allow read: if true;
        allow create, update, delete: if gra in ["runner", "jumper", "sowa3", "ogrody", "szklarnia"];

        match /sowiegry_historia/{wpis} {
          allow read: if true;
          allow create: if request.resource.data.score is number;
          allow delete: if true;          // przycinanie historii do 50 wpisów
          allow update: if false;
        }
      }
    }
  }
}
```

Jak to działa:

- `{sciezka=**}` pasuje do zera lub więcej segmentów ścieżki, więc reguła 1 obejmuje każdy dokument w bazie: `audio/favorites`, dokumenty w podkolekcjach i tak dalej. Warunek zależy tylko od nazwy kolekcji, więc działa także dla zapytań `collectionGroup`.
- Dokumenty w kolekcjach `sowiegry`, `sowiegry_gry` i `sowiegry_historia` nie przechodzą przez regułę 1 i podlegają wyłącznie regułom z części 2.
- Wszystkie ścieżki SowieGry spoza tej listy (np. `sowiegry/cokolwiek`) są odrzucane.
- **Jedyny przypadek, w którym drugi projekt coś straci:** gdyby sam miał kolekcję o nazwie `sowiegry`, `sowiegry_gry` albo `sowiegry_historia` (dziś nie ma).
- **Znane ograniczenie:** podkolekcję o innej nazwie da się dopisać pod dokumentem SowieGry (np. `sowiegry/profil/smieci/x`). Nie narusza to danych SowieGry (nie da się nią nic zmienić ani skasować), najwyżej zaśmieca bazę.
- **Sprawdzone na emulatorze Firestore** (firebase-tools 15.31, SDK 12.19.0), 26 scenariuszy, wszystkie zgodne z oczekiwaniem: odczyt, zapis, kasowanie, lista i zagnieżdżony zapis w drugim projekcie, zapytanie `collectionGroup`, nowa kolekcja drugiego projektu; po stronie SowieGry walidacja `schemaVersion`, limit 30 pól, zakaz kasowania profilu i meta, lista dozwolonych gier, zasady historii.

Co to daje: drugi projekt ma dostęp jak dziś; danych SowieGry nie da się skasować ani zapisać w nieprzewidzianym kształcie. Czego to **nie** daje: osoba znająca kod nadal może zmienić wyniki. Dla gier rodzinnych to akceptowalne.

Reguły **Realtime Database** to osobny plik w innym miejscu konsoli. Nie zmieniamy ich.

Kopia reguł trafi do repo jako `firestore.rules` (źródło prawdy dla testów). Publikacja (wykonana 2026-09-27): Firebase → Firestore Database → zakładka **Rules** → wklej → **Rules Playground** → **Publish**. Poprzednie wersje reguł zostają w historii zakładki Rules, więc powrót jest prosty.

Test w Rules Playground (bez logowania) — do powtórzenia przy każdej zmianie reguł:

| Symulacja | Ścieżka | Dane | Oczekiwany wynik |
|---|---|---|---|
| get | `audio/favorites` | — | ✅ dozwolone |
| update | `dataslate/test` | `{"x": 1}` | ✅ dozwolone |
| create | `sowiegry/meta` | `{"schemaVersion": 1}` | ✅ dozwolone |
| create | `sowiegry/meta` | `{"x": 1}` | ❌ odrzucone |
| delete | `sowiegry/profil` | — | ❌ odrzucone |
| create | `sowiegry/cokolwiek` | `{"schemaVersion": 1}` | ❌ odrzucone |
| create | `sowiegry/profil/sowiegry_gry/runner` | `{"difficulty": "arcade"}` | ✅ dozwolone |
| create | `sowiegry/profil/sowiegry_gry/tetris` | `{"x": 1}` | ❌ odrzucone |

### 9.3 Dalsze zaostrzenie (opcjonalnie, później)

- **Anonymous Auth:** `request.auth != null` dla zapisów w `sowiegry`.
- **Ograniczenie klucza API** w Google Cloud Console (APIs & Services → Credentials → HTTP referrers). Trzeba dodać domenę SowieGry (np. `https://cutelittlegoat.github.io/*`, jeśli to GitHub Pages), `http://localhost:*` **oraz domenę drugiego projektu**. Pominięcie tej ostatniej zepsuje drugi projekt.
- **App Check** (reCAPTCHA Enterprise) chroni przed ruchem spoza strony.

---

## 10. Co usuwamy (pozostałości zapisu lokalnego)

| Plik | Co usunąć |
|---|---|
| `shared/progress-reset.js` | **cały plik** (warstwa zgodności migracji) + `<script>` w 6 plikach HTML (`index.html` i `index.html` każdej z 5 gier) |
| `shared/idle-save-bridge.js` | **cały plik** (zapis przez klikanie ukrytego przycisku) + `<script>` w `SowieOgrody/index.html:68`, `SowiaSzklarnia/index.html:71` |
| `shared/sowie-platform.js` | `PROFILE_KEY`, `BACKUP_PREFIX`, `backupValue`, `migrateProfile` (wartości domyślne przechodzą do `sowie-cloud.js`), `readProfile`, `writeProfile`, `migrateKnownSave`, `migrateLegacyStorage`, `allowedExportKey`, `exportData`, `downloadExport`, `importData`, `importFile` oraz wywołanie `migrateLegacyStorage()` na końcu pliku. **Zostają:** `GAME_REGISTRY`, `COSMETICS`, `DEFAULT_*`, zdarzenia (`emit`, `on`), `shouldRun`, `createRng`, obsługa `?seed=` i `?testNow=` |
| `shared/sowie-core.js` | `persistProfile`/`reloadProfile` na `localStorage` → `SowieCloud.updateProfile`; `flushPendingStats` → `SowieCloud.flush`; w `renderSettings` usunąć przyciski „Eksportuj zapis” / „Importuj zapis” i obsługę pliku; nazwa okna „Ustawienia i zapis” → „Ustawienia” (ze stanem połączenia i przyciskiem „Wyloguj to urządzenie”); `exportData`/`importData` z `window.SowieCore` |
| `shared/sowie-academy.js` | `load()`/`save()` na `localStorage` (linie 58–82, 339) → `profil.academy` |
| `shared/owl-gallery.js` | `load()`/`save()` (linie 332–355, 573) → `profil.gallery` |
| `shared/gameplay-expansion.js` | `safeJson`, `saveJson`, `updateDailyBest` na `localStorage`; bezpośrednie czytanie `sowieOgrodySave` i `sowiaSzklarniaSave`. Gry idle udostępniają zamiast tego `window.SowieIdleGame.snapshot()`. (Cały moduł znika później, przy przebudowie gier — Analiza 2.) |
| `SowaRunner/sketch.js` | odczyt i zapis `sowaRunnerBest*` (linie 4, 22) → `SowieCloud.records("runner", …)` + `submitRun` |
| `SowaJumper/script.js`, `SowaJumper/difficulty.js` | `sowaJumperBest*`, `sowaJumperDifficulty` |
| `Sowa3/script.js`, `Sowa3/difficulty.js`, `Sowa3/finish-controls.js` | `sowa3Best`, `sowa3Difficulty`, `sowa3FinishSeen` |
| `SowieOgrody/script.js` | `KEY`, `load()`, `save()` na `localStorage` (linie 4, 148–150) → `loadGameState`/`saveGameState`; `setInterval(queueSave, 5000)` zastępuje kolejka `SowieCloud` |
| `SowiaSzklarnia/script.js` | `KEY`, `load()`, `save()`, `localStorage.removeItem` w resecie, warunek `now % 7000 < 20` w pętli |
| `tests/e2e/platform.spec.js` | testy „migracja profilu…”, „…zapisuje i odtwarza stan” (localStorage), „eksport i import…” → do przepisania (rozdział 13) |
| `tests/e2e/owl-gallery.spec.js`, `tests/e2e/smoke.spec.js:65` | ustawianie i czytanie stanu przez `localStorage` |
| Dokumentacja | opisy `localStorage`, eksportu i importu w `docs/Documentation.md`, `docs/README.md` oraz w `docs/` każdej gry |

## 11. Co dodajemy lub zmieniamy

| Plik | Zmiana |
|---|---|
| `shared/sowie-cloud.js` (nowy) | połączenie z Firestore, `MemoryBackend`, bramka hasła, magazyn w pamięci, kolejka zapisów, API z punktu 3.2, bootstrap `sowiegry/meta` i `sowiegry/profil`, jednorazowe sprzątanie starych kluczy |
| `shared/password-gate.js` + styl w `shared/cute-ui.css` (nowe) | ekran „Hasło sowy” (rozdział 5), zaprojektowany pod telefon |
| `shared/records.js` (nowy) | okno „🏆 Rekordy”: top 10, ostatnie gry, rekordy dnia |
| `config/firebase-config.js` | poprawiony komentarz (bez `GM.html`/`DataSlate.html`) |
| Wszystkie `index.html` | skrypty `config/firebase-config.js` i `shared/sowie-cloud.js`, usunięte skrypty z rozdziału 10 |
| Gry | start po `SowieCloud.ready`, `submitRun()` na końcu rozgrywki, `saveGameState()` w grach idle, postęp offline także po powrocie z tła |
| `eslint.config.js` | globalne `SowieCloud` (jeśli potrzebne) |
| `.github/workflows/js-check.yml` | krok `actions/setup-java` + emulator Firestore dla testów e2e (rozdział 13) |
| `firebase.json`, `firestore.rules` (nowe) | konfiguracja emulatora i **dokładna kopia opublikowanych reguł** z rozdziału 9.2 |

---

## 12. Kasowanie starych danych

Decyzja 2: obecnych wyników nie przenosimy. Przy pierwszym uruchomieniu nowej wersji `sowie-cloud.js` usuwa stare klucze i zapisuje w `sowiegry:urzadzenie` znacznik `cleaned: true`, żeby nie robić tego ponownie.

**Kasujemy wyłącznie klucze SowieGry, nigdy `localStorage.clear()`.** Wszystkie strony z tej samej domeny dzielą jeden `localStorage`. Jeśli SowieGry działają na GitHub Pages (`cutelittlegoat.github.io`), to ten sam magazyn mają **wszystkie** projekty z tego konta, w tym ewentualnie drugi projekt. `clear()` skasowałby także ich dane.

Lista do usunięcia:

```js
const STARE_KLUCZE = [
  "sowieGryProfile", "sowieGryMigrationsVersion", "sowieGryAcademy", "sowieOwlGallery",
  "sowaRunnerBestScore", "sowaRunnerBestDistance",
  "sowaJumperBestScore", "sowaJumperBestHeight", "sowaJumperDifficulty",
  "sowa3Best", "sowa3Difficulty", "sowa3FinishSeen",
  "sowieOgrodySave", "sowiaSzklarniaSave", "sowieSzklarniaTraitAlbum",
];
const STARE_PREFIKSY = ["sowieGryBackup:", "sowieExpansion:", "sowieDailyBest:"];
```

Kod sprzątający jest tymczasowy. Po 1–2 miesiącach (gdy wszystkie używane urządzenia uruchomią nową wersję) usuwamy go w osobnej zmianie.

---

## 13. Testy

- **Test jednostkowy magazynu** (`tests/unit/sowie-cloud.test.mjs`): kolejka zapisów, opóźnienia, logika max/increment, `top10`, przycinanie `dailyBest` i `academy.awards`, bramka hasła (`"huhu"`, `" Huhu "` ✔; `"hu hu"` ✘), sprzątanie wyłącznie kluczy z listy. Uruchamiany na `MemoryBackend` przez `node --test`.
- **E2E na emulatorze Firestore:** `sowie-cloud.js` łączy się z emulatorem, gdy adres zawiera `?cloud=emulator` (`connectFirestoreEmulator(db, "127.0.0.1", 8080)`). Potrzebny jest minimalny `firebase.json` (port i plik `firestore.rules`) oraz projekt demonstracyjny. W CI: `npx firebase-tools emulators:exec --only firestore --project demo-sowiegry "npm run test:e2e"`, poprzedzone krokiem `actions/setup-java` (Java 21). To realne zachowanie SDK bez dotykania produkcyjnej bazy.
- **E2E na profilach telefonów:** Playwright z emulacją urządzeń (np. `iPhone SE`, `iPhone 13`, `Pixel 7`, w pionie i w poziomie, `hasTouch`). Scenariusze: ekran hasła (klawiatura nie zasłania przycisku, brak powiększenia strony), zapis przy przejściu karty w tło (`visibilitychange`), powrót i postęp offline w grze idle.
- **Szybkie E2E bez emulatora:** `?cloud=memory` dla testów, które nie sprawdzają trwałości (dym, pauza, modale).
- **Testy reguł:** `@firebase/rules-unit-testing` na emulatorze. Sprawdzają, że drugi projekt ma pełny dostęp, a zapisy do `sowiegry` spoza schematu są odrzucane.
- Do przepisania: 3 testy z `platform.spec.js`, testy galerii ustawiające stan przez `localStorage`, odczyt profilu w `smoke.spec.js`.

---

## 14. Plan wdrożenia

Szczegółowa kolejność, zależności i kryteria ukończenia są w [`ANALIZA_3_Plan_prac.md`](ANALIZA_3_Plan_prac.md): **etap E0 („Przygotowanie”)** i **etap E1 („Chmura”)**. W skrócie:

1. E0: `firebase.json`, `firestore.rules`, emulator Firestore w CI, profile telefonów (Chromium i WebKit) w Playwright.
2. E1: `shared/sowie-cloud.js` (Firestore + Memory), bramka hasła `huhu`, utworzenie `sowiegry/meta` i `sowiegry/profil`, kasowanie starych kluczy.
3. E1: przepięcie modułów wspólnych (`SowieCore`, `SowieAcademy`, `SowieOwlGallery`, `gameplay-expansion`) i usunięcie migracji oraz eksportu/importu.
4. E1: przepięcie obecnych gier (rekordy, stany idle, ustawienia trudności) — minimalnymi zmianami, bo gry i tak zostaną przebudowane.
5. E1: okno „🏆 Rekordy”.
6. E1: aktualizacja dokumentacji zgodnie z `AGENTS.md`. Publikacja reguł w konsoli — ✅ wykonana przez właściciela 2026-09-27.

---

## 15. Ryzyka

| Ryzyko | Skutek | Ograniczenie |
|---|---|---|
| Wspólne limity z drugim projektem | Przekroczenie dziennego limitu blokuje oba projekty do północy (czasu pacyficznego) | Opóźnianie zapisów, zapisy tylko przy końcu gry, obserwacja zużycia w konsoli |
| Reguły bez logowania | Osoba znająca kod może zmienić wyniki SowieGry; dane drugiego projektu nadal są otwarte (jak przed zmianą) | Reguły z 9.2 opublikowane 2026-09-27 (walidacja SowieGry, zakaz kasowania profilu); później ewentualnie Auth |
| Jawne hasło | Osoba czytająca kod wejdzie do gier | Świadoma decyzja; hasło to tylko bramka |
| Brak zasięgu przy pierwszej wizycie | Nie da się załadować SDK | `MemoryBackend` + komunikat; PWA z service workerem (Analiza 2) |
| Uśpienie karty na telefonie przed wysłaniem zapisu | Opóźniony zapis | Cache IndexedDB wysyła zapis przy następnym otwarciu |
| Safari kasuje dane po 7 dniach bez wizyty | Trzeba znów wpisać hasło; niewysłane zapisy z cache mogą przepaść | Postęp jest w Firestore; zalecana instalacja jako PWA |
| Dwa urządzenia na tej samej grze idle | Nadpisanie postępu | `rev`, `deviceId`, nasłuch i pytanie o wczytanie |
| Wspólny `localStorage` domeny | Skasowanie danych innych projektów | Kasowanie wyłącznie z listy kluczy SowieGry |
| Zależność od CDN gstatic | Awaria CDN = brak zapisu | Przypięta wersja; opcjonalna kopia w `vendor/` |
