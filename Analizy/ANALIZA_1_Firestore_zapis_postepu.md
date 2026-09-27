# Analiza 1 — przeniesienie zapisu postępu SowieGry do Firestore

> Data: 2026-09-27 · Zakres: wszystkie gry i moduły `shared/` · Status: **analiza**, bez zmian w kodzie i bez zapisów do bazy.

---

## 0. Najważniejsze wnioski

1. **Dziś nic nie zapisuje się na GitHubie.** GitHub (Pages) tylko udostępnia pliki gry. Cały postęp leży w `localStorage` przeglądarki: osobno na każdym urządzeniu i w każdej przeglądarce. Znika po wyczyszczeniu danych strony i nie działa między telefonem a komputerem. Jedyną formą przeniesienia jest ręczny eksport/import pliku JSON w oknie „Ustawienia i zapis”.
2. Zapis jest rozproszony: **12 plików JS** samodzielnie czyta i pisze `localStorage` pod **18 rodzajami kluczy**. Część z nich to klucze dzienne, które przybywają codziennie i nigdy nie są sprzątane.
3. Proponuję **jeden nowy moduł `shared/sowie-cloud.js`**: magazyn danych w pamięci plus Firestore jako trwały zapis. Tylko ten moduł rozmawia z bazą. Gry i moduły wspólne przestają dotykać `localStorage`.
4. Wszystkie dane trafiają do **jednej kolekcji `sowiegry`**:
   `sowiegry/meta`, `sowiegry/gracze` (+ `profile/{graczId}` z podkolekcjami `gry` i `historia`), `sowiegry/rankingi` (+ `dzienne/{data_gra}`).
5. Tożsamość: **profil gracza wybierany z listy** (pseudonim + awatar, opcjonalny PIN). Nie wymaga logowania i działa z obecnymi regułami. Urządzenie pamięta tylko identyfikator wybranego profilu.
6. SDK: **Firebase JS SDK 12.19.0 (modularny) z CDN gstatic**, ładowany dynamicznie, z trwałym cache w IndexedDB. Gra działa offline, a zapisy wysyłają się, gdy wróci sieć.
7. Reguły: obecne `allow read, write: if true` wystarczą do działania. Zostawiają jednak całą bazę (również **drugi projekt**) otwartą na zapis i kasowanie przez każdego. W rozdziale 9 jest wersja reguł, która **nie zmienia zachowania drugiego projektu**, a dla `sowiegry` dodaje walidację.
8. Do usunięcia: `shared/progress-reset.js`, `shared/idle-save-bridge.js`, migracje i kopie `sowieGryBackup:*`, eksport/import JSON oraz wszystkie `localStorage.getItem/setItem` w grach i modułach wspólnych. Testy e2e oparte o `localStorage` trzeba przepisać.

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

| Klucz | Kto zapisuje (plik:linia) | Zawartość | Kiedy zapisywany | Docelowe miejsce w Firestore |
|---|---|---|---|---|
| `sowieGryProfile` | `shared/sowie-platform.js:127–144`, wywołania z `shared/sowie-core.js:40` | kosmetyki, ustawienia audio/efektów, 7 misji, statystyki | każda zmiana profilu; statystyki z opóźnieniem 0,75–3 s (`sowie-core.js:105`) | `profile/{id}`: `settings`, `cosmetics`, `missions`, `stats` |
| `sowieGryBackup:{klucz}:v{n}` | `sowie-platform.js:87` | kopie sprzed migracji i importu | migracja, import | **usunąć** |
| `sowieGryMigrationsVersion` | `sowie-platform.js:164` | numer migracji | każde otwarcie strony | **usunąć** |
| `sowieGryAcademy` | `shared/sowie-academy.js:58–82` | XP, piórka, metryki, misje dzienne i tygodniowe, przyznane nagrody | każda zmiana metryki | `profile/{id}.academy` |
| `sowieOwlGallery` | `shared/owl-gallery.js:332–355` | odblokowane i obejrzane zdjęcia, ulubione | odblokowanie, obejrzenie | `profile/{id}.gallery` |
| `sowaRunnerBestScore`, `sowaRunnerBestDistance` | `SowaRunner/sketch.js:4, 22` | rekordy | koniec biegu | `profile/{id}.records.runner` |
| `sowaJumperBestScore`, `sowaJumperBestHeight` | `SowaJumper/script.js:19–20, 298–299` | rekordy | koniec gry | `profile/{id}.records.jumper` |
| `sowaJumperDifficulty` | `SowaJumper/difficulty.js:35, 45` | wybrany poziom trudności | zmiana poziomu | `gry/jumper.difficulty` |
| `sowa3Best` | `Sowa3/script.js:18, 49` | rekord | koniec gry | `profile/{id}.records.sowa3` |
| `sowa3Difficulty` | `Sowa3/difficulty.js:35, 47` | poziom trudności | zmiana poziomu | `gry/sowa3.difficulty` |
| `sowa3FinishSeen` | `Sowa3/finish-controls.js:20, 31` | czy finał był obejrzany (pozwala go pominąć) | po pierwszym finale | `gry/sowa3.finishSeen` |
| `sowieOgrodySave` | `SowieOgrody/script.js:148–149` | pełny stan gry idle | co 5 s (`setInterval`), co 7 s (bridge), po akcjach | `gry/ogrody.state` |
| `sowiaSzklarniaSave` | `SowiaSzklarnia/script.js:68–69, 153` | pełny stan gry idle; reset usuwa klucz | bridge co 7 s, w pętli gdy `now % 7000 < 20`, po akcjach | `gry/szklarnia.state` |
| `sowieSzklarniaTraitAlbum` | `shared/gameplay-expansion.js` (`initializeGreenhouse`, od linii 354) | album cech roślin | nowa cecha | `gry/szklarnia.traitAlbum` |
| `sowieExpansion:{gra}:{data}` | `gameplay-expansion.js` (`claimFeature`, `initializeGardens`, `initializeGreenhouse`) | odebrane nagrody i stan bazowy dziennych kontraktów | raz dziennie + przy odbiorze | `gry/{gra}.daily` (tylko bieżący dzień) |
| `sowieDailyBest:{data}:{gra}:{metryka}` | `gameplay-expansion.js:69–74` | najlepszy wynik wyzwania dnia | koniec gry z `?daily=1` | `rankingi/dzienne/{data}_{gra}` |

### 1.3 Problemy obecnego rozwiązania

- **Postęp jest przywiązany do urządzenia i przeglądarki.** Tryb prywatny, wyczyszczenie danych albo zmiana telefonu oznaczają utratę wszystkiego.
- **Nie ma wspólnych wyników.** Rekordów nie da się porównać między graczami ani urządzeniami.
- **Klucze rosną bez końca.** `sowieExpansion:*` i `sowieDailyBest:*` przybywają codziennie dla każdej gry. Kopie `sowieGryBackup:*` też nigdy nie są usuwane.
- **Ukryte zależności.** `gameplay-expansion.js` co 2,5 s parsuje cały zapis Ogrodów i Szklarni prosto z `localStorage`, żeby policzyć kontrakty. Zmiana formatu zapisu gry po cichu psuje ten moduł.
- **Obejścia zamiast API.** `shared/idle-save-bridge.js` wywołuje zapis gier idle przez stworzenie niewidocznego przycisku i zasymulowanie kliknięcia. Szklarnia sama zapisuje tylko wtedy, gdy znacznik czasu klatki trafi w warunek `now % 7000 < 20`, czyli przypadkowo.
- **Duży koszt utrzymania.** Migracje, kopie zapasowe, eksport i import to ok. 130 linii w `sowie-platform.js`, osobny `progress-reset.js` i część `sowie-core.js`.

---

## 2. Firebase — stan wyjściowy

- `config/firebase-config.js` ustawia `window.firebaseConfig` dla projektu **`rpg-dataslate-relay`**, tego samego, którego używa drugi projekt. Komentarz w pliku wspomina `GM.html` i `DataSlate.html`, bo został skopiowany z tamtego projektu. Przy wdrożeniu warto go poprawić.
- `apiKey` w kodzie klienta to nic złego. W Firebase klucz nie jest tajny, a o bezpieczeństwie decydują reguły (rozdział 9).
- **Baza jest współdzielona z innym projektem**, co oznacza:
  - wspólne limity. Na darmowym planie Spark jest to dziennie ok. 50 000 odczytów, 20 000 zapisów i 20 000 usunięć oraz 1 GiB danych. Plan i limity trzeba sprawdzić w konsoli Firebase;
  - wspólny plik reguł. Każda zmiana reguł musi zachować dostęp drugiego projektu;
  - wspólny obszar nazw grup kolekcji. Funkcje działające „po nazwie podkolekcji” (zapytania `collectionGroup`, polityki TTL, wyjątki indeksów) obejmują całą bazę. Projekt SowieGry **nie powinien ich używać**, bo nazwy typu `gry` czy `historia` mogą istnieć także w drugim projekcie. Zwykłe ścieżki pod `sowiegry/...` nie kolidują z niczym.
- **W Firestore nie tworzy się pustych kolekcji.** Kolekcja `sowiegry` pojawi się sama przy pierwszym zapisie dokumentu. Proponuję, żeby pierwszy start aplikacji wykonał idempotentny zapis `sowiegry/meta` (`setDoc(..., { merge: true })`). To jest „utworzenie kolekcji”.
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
 shared/sowie-cloud.js  ─ magazyn w pamięci + kolejka zapisów (debounce, batch, flush)
   │
   ├── FirestoreBackend   produkcja: Firebase JS SDK 12.19.0, cache IndexedDB
   └── MemoryBackend      testy (?cloud=memory), awaria CDN, tryb offline bez SDK
```

Zasady:

1. **Tylko `sowie-cloud.js` zna Firestore.** Reszta kodu nie importuje SDK i nie zna ścieżek dokumentów.
2. **Odczyty są synchroniczne, z pamięci.** Pętle gier (`draw`, `update`) potrzebują wartości od razu. Zapisy idą w tle.
3. **Start czeka na dane.** Dziś gry czytają `localStorage` przy ładowaniu skryptu (np. `SowaJumper/script.js:19`). Po zmianie każda gra startuje dopiero po `await SowieCloud.ready`.
4. **Zapis odroczony (write-behind).** Zmiana oznacza dane jako „brudne”. Kolejka wysyła je z opóźnieniem, a natychmiast na końcu gry, przy zakupach, prestiżu, `visibilitychange → hidden` i `pagehide`.

### 3.1 Wybór SDK

Rozmiary zmierzone 2026-09-27 dla wersji 12.19.0 z `https://www.gstatic.com/firebasejs/12.19.0/`:

| Wariant | Rozmiar (gzip) | Praca offline | Nasłuch zmian | Ocena |
|---|---|---|---|---|
| Modularny: `firebase-app.js` + `firebase-firestore.js` | 24 KB + 179 KB | tak (IndexedDB, wiele kart) | tak | **rekomendowany** |
| Compat: `firebase-app-compat.js` + `firebase-firestore-compat.js` | ok. 10 KB + 163 KB | tak | tak | starsze API „namespace”, wygaszane; niezalecany |
| Firestore Lite: `firebase-firestore-lite.js` | 37 KB | **nie** | nie | za mało, bo utrata sieci = utrata zapisów |

Modularny SDK da się załadować ze zwykłego (nie-modułowego) skryptu przez dynamiczny `import()`, więc nie trzeba przebudowywać reszty kodu na moduły ES:

```js
// shared/sowie-cloud.js — szkic połączenia
const SDK = "https://www.gstatic.com/firebasejs/12.19.0";

async function connectFirestore() {
  const [{ initializeApp }, fs] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-firestore.js`),
  ]);
  // Nazwana aplikacja — nie koliduje z domyślną aplikacją innego kodu na tej samej stronie.
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

Wersję SDK trzeba **przypiąć na sztywno** (12.19.0). Aktualizacja to świadoma zmiana jednej stałej. Opcjonalnie oba pliki ESM można skopiować do repo (`vendor/firebase/12.19.0/`), żeby nie zależeć od gstatic.

Jeśli import się nie uda (brak sieci przy pierwszej wizycie, zablokowany CDN), moduł przechodzi na `MemoryBackend` i pokazuje pasek „Tryb offline — postęp z tej sesji nie zostanie zapisany”.

### 3.2 Publiczne API `SowieCloud` (propozycja)

```js
window.SowieCloud = {
  ready,                          // Promise: wybrany gracz + wczytany profil
  status(),                       // "laczenie" | "online" | "offline" | "zapisywanie" | "blad"
  onStatus(listener),

  // gracz i profil
  player(),                       // { id, name, avatar }
  listPlayers(),                  // Promise<[{ id, name, avatar }]> — do ekranu wyboru
  createPlayer({ name, avatar, pin }),
  selectPlayer(id, pin),
  profile(),                      // obiekt w pamięci (tylko odczyt)
  updateProfile(mutator),         // mutator(profile) → oznacza zmiany, zapis odroczony

  // gry
  records(gameId),                // { bestScore, bestDistance, … } z pamięci
  submitRun(gameId, result),      // koniec rozgrywki: rekordy, statystyki, historia, ranking dzienny
  loadGameState(gameId),          // Promise<object|null> — stan gry idle / ustawienia gry
  saveGameState(gameId, state, { immediate }),

  // rankingi
  leaderboard(gameId, field, limit = 10),
  dailyLeaderboard(gameId, date),

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
├── gracze                                 (dokument = lekki indeks profili do ekranu wyboru)
│     players: { "<graczId>": { name, avatar, createdAt } , … }
│     │
│     └── profile                          (podkolekcja)
│         └── {graczId}                    (dokument profilu gracza)
│               ├── gry                    (podkolekcja: jeden dokument na grę)
│               │     runner · jumper · sowa3 · ogrody · szklarnia
│               └── historia               (podkolekcja, opcjonalna: wpis na każdą rozgrywkę)
│                     {autoId}
│
└── rankingi                               (dokument-kontener)
      └── dzienne                          (podkolekcja)
          └── {RRRR-MM-DD}_{gameId}        (np. 2026-09-27_runner)
```

Dlaczego dokument-indeks `sowiegry/gracze`: ekran „Kto dziś gra?” potrzebuje tylko imion i awatarów. Jeden odczyt tego dokumentu zamiast pobierania wszystkich pełnych profili.

### 4.1 Dokument profilu `sowiegry/gracze/profile/{graczId}`

```json
{
  "schemaVersion": 1,
  "name": "Sówka Ania",
  "avatar": "owl-snow",
  "pinHash": null,
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>",
  "lastSeenAt": "<serverTimestamp>",

  "settings":  { "music": true, "sfx": true, "quips": true, "reducedEffects": false },
  "cosmetics": { "unlocked": ["none", "bow", "glasses"], "selected": "glasses" },
  "missions":  { "leaves20": { "progress": 20, "target": 20, "done": true, "reward": "glasses" } },
  "stats":     { "leaves": 1234, "nearMisses": 17, "extraLives": 5, "finishes": 3, "maxCombo": 4 },

  "academy":   { "xp": 830, "feathers": 64, "metrics": {}, "daily": {}, "weekly": {}, "awards": {} },
  "gallery":   { "unlocked": ["owl-01", "owl-02"], "viewed": ["owl-01"], "favorite": "owl-02" },

  "records": {
    "runner":    { "bestScore": 5120, "bestDistance": 1480, "runs": 42, "lastPlayedAt": "<ts>" },
    "jumper":    { "bestScore": 3900, "bestHeight": 312, "runs": 18, "lastPlayedAt": "<ts>" },
    "sowa3":     { "bestScore": 2750, "finishes": 5, "maxCombo": 5, "runs": 20, "lastPlayedAt": "<ts>" },
    "ogrody":    { "lifetimeLeaves": 3200000000, "prestiges": 2, "zone": "greenhouse" },
    "szklarnia": { "lifetimeLeaves": 810000, "rooms": 6, "hybrids": 2 }
  }
}
```

Uwagi:

- Obecne statystyki `runnerDistance`, `jumperHeight`, `ogrodyLeaves`, `ogrodyGardenLevel`, `szklarniaLeaves`, `szklarniaRooms` dublują rekordy. Przenosimy je do `records`, a w `stats` zostają liczniki ogólne.
- `academy.awards` rośnie codziennie (klucze typu `daily:2026-09-27:runner-distance`). Przy zapisie przycinamy wpisy dzienne starsze niż 30 dni. Nagrody trwałe (`trait:*`, `weekly:*`) zostają.
- Wielkość profilu: kilka–kilkanaście KB. Limit dokumentu Firestore to 1 MiB.

### 4.2 Dokumenty gier `…/profile/{graczId}/gry/{gameId}`

Gry arcade (ustawienia i stan dzienny):

```json
{
  "difficulty": "arcade",
  "finishSeen": true,
  "daily": { "date": "2026-09-27", "baseline": {}, "claimed": {} },
  "updatedAt": "<serverTimestamp>"
}
```

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

**Stan gry idle jako tekst JSON (`state`), a nie mapa Firestore:**

- Firestore nie przyjmuje tablic zagnieżdżonych w tablicach ani wartości `undefined`, a stany gier idle to swobodne struktury;
- każde pole mapy jest automatycznie indeksowane. Duży stan to tysiące zbędnych wpisów indeksu (limit 40 000 na dokument), a wyjątków indeksu nie chcemy używać przez wspólną bazę (rozdział 2);
- gry i tak mają własne `mergeSave()` i numer wersji zapisu, więc Firestore nie musi rozumieć środka.

Pola, po których chcemy sortować albo które chcemy oglądać w konsoli (`summary`), zostają zwykłymi polami.

### 4.3 Historia rozgrywek (opcjonalnie) `…/profile/{graczId}/historia/{autoId}`

```json
{ "game": "runner", "score": 4210, "distance": 1180, "leaves": 96, "difficulty": "arcade",
  "durationMs": 184000, "daily": false, "seed": null, "at": "<serverTimestamp>" }
```

Zasila ekrany „Ostatnie biegi” i wykresy postępu. Żeby kolekcja nie rosła bez końca, klient po dopisaniu wpisu usuwa najstarsze ponad 50 na grę. Nie używamy polityki TTL, bo działa po nazwie grupy kolekcji w całej bazie.

### 4.4 Ranking dzienny `sowiegry/rankingi/dzienne/{RRRR-MM-DD}_{gameId}`

```json
{
  "date": "2026-09-27",
  "game": "runner",
  "seed": "daily-2026-09-27-runner",
  "metric": "distance",
  "scores": {
    "<graczId>": { "name": "Sówka Ania", "value": 1180, "at": "<serverTimestamp>" }
  }
}
```

Aktualizacja w transakcji: odczyt → porównanie → zapis tylko przy lepszym wyniku.

---

## 5. Tożsamość gracza

| Wariant | Jak działa | Plusy | Minusy |
|---|---|---|---|
| **A. Lista profili (rekomendowany)** | Menu pokazuje „Kto dziś gra?” z kafelkami profili z `sowiegry/gracze`. Nowy profil = pseudonim + awatar. Opcjonalny 4-cyfrowy PIN. | Zero logowania, ten sam profil na każdym urządzeniu jednym kliknięciem, działa z obecnymi regułami, idealne dla rodziny i znajomych | Każdy może wybrać cudzy profil. PIN to tylko zabezpieczenie przed pomyłką, bo przy otwartych regułach da się go obejść |
| B. Kod gracza | Profil ma losowy kod (np. `SOWA-K7P2-M9QX`), który wpisuje się na nowym urządzeniu | Profile nie są publicznie listowane | Kod trzeba zapisać i przepisać; kiepskie dla dzieci |
| C. Firebase Anonymous Auth | Każde urządzenie dostaje `uid`, profil ma listę `owners` | Pozwala zaostrzyć reguły (zapis tylko przez właściciela) | Wymaga włączenia Auth w konsoli, +42 KB SDK; przenosiny na inne urządzenie przez jednorazowy kod |
| D. Logowanie Google | Konto Google | Najpewniejsza tożsamość | Za ciężkie dla małych gier; dzieci bez konta |

**Rekomendacja:** A teraz, a C jako późniejsze zaostrzenie bezpieczeństwa (rozdział 9.3), jeśli gry trafią do szerszego grona.

Szczegóły wariantu A:

- Po wybraniu profilu urządzenie zapamiętuje go pod **jednym** kluczem `localStorage`: `sowiegry:aktywnyGracz` = `{ id, deviceId }`. To wskaźnik „kto gra na tym urządzeniu”, a nie zapis postępu, więc jest zgodny z założeniem „postęp tylko w Firestore”. Da się też bez niego obejść: wtedy profil wybiera się przy każdej wizycie.
- `graczId` = losowy identyfikator Firestore (20 znaków, `doc(collection(...)).id`).
- Ekran wyboru jest wspólnym komponentem. Pokazuje go menu główne, a także gra otwarta bezpośrednim linkiem bez wybranego profilu.
- PIN (opcjonalny) jest haszowany SHA-256 (`crypto.subtle.digest`) z solą równą `graczId`. W regułach otwartych to tylko ochrona przed przypadkowym wejściem na cudzy profil.
- **Prywatność:** przy otwartych regułach pseudonimy są czytelne dla każdego, kto zna konfigurację. Warto używać pseudonimów, a nie imion i nazwisk (zwłaszcza dzieci).

---

## 6. Zapisywanie: kiedy i jak

| Zdarzenie | Co zapisujemy | Mechanizm | Częstotliwość |
|---|---|---|---|
| Utworzenie profilu | profil + wpis w `sowiegry/gracze.players` | `writeBatch` | raz |
| Zmiana ustawień / kosmetyku | `settings` / `cosmetics` | `setDoc(merge)` z opóźnieniem 1 s | rzadko |
| Postęp misji i statystyk w trakcie gry | tylko pamięć | — | wysyłka przy końcu gry, ukryciu strony, najpóźniej co 30 s |
| Koniec rozgrywki arcade | `records.{gra}` (gdy lepszy), `stats` przez `increment()`, `missions`, `academy`, `gallery`, wpis w `historia` | 1× `writeBatch` | 1 zapis na rozgrywkę (+1 dla historii) |
| Wyzwanie dnia (`?daily=1`) | `rankingi/dzienne/{data}_{gra}` | `runTransaction` | przy końcu gry, tylko przy poprawie wyniku |
| Gry idle — praca w tle | `gry/{gra}` (`state`, `summary`, `rev`) + `records.{gra}` | opóźnienie 30 s | ≤ 120 zapisów/h |
| Gry idle — ważne akcje (zakup ulepszenia, prestiż, reset) | jw. | opóźnienie 2 s | wg akcji |
| Ukrycie/zamknięcie strony | wszystko, co czeka w kolejce | `flush()` przy `visibilitychange` i `pagehide` | przy wyjściu |

**Rekordy (max)**: Firestore nie ma operacji „max”. Profil w pamięci jest źródłem prawdy dla danego gracza, więc porównanie robi klient i zapisuje pole tylko przy poprawie. Liczniki (`runs`, `stats.leaves`) idą przez `increment(n)`, więc sumują się poprawnie nawet z dwóch urządzeń naraz.

**Zamknięcie karty w trakcie zapisu**: przy `persistentLocalCache` zapis trafia najpierw do IndexedDB. Jeśli karta zamknie się przed wysłaniem, SDK wyśle go przy następnym otwarciu dowolnej strony SowieGry w tej przeglądarce.

**Dwa urządzenia naraz (gry idle)**: domyślnie wygrywa ostatni zapis. Zabezpieczenie: licznik `rev` i `deviceId`. Gra nasłuchuje swojego dokumentu (`onSnapshot`). Jeśli pojawi się nowszy `rev` z innego urządzenia, pokazuje okno „Na innym urządzeniu zapisano nowszy postęp — wczytać?”.

**Postęp offline w grach idle**: dziś liczony z `Date.now() - state.lastSavedAt`, czyli z zegara urządzenia. Przy kilku urządzeniach zegary mogą się różnić. Zapisujemy więc `savedAt` jako `serverTimestamp()`, a czas nieobecności przycinamy do przedziału `[0, limit offline]`.

### 6.1 Szacunek zużycia limitów

| Scenariusz | Zapisy | Odczyty |
|---|---|---|
| Godzina gry idle na jednym urządzeniu | ≤ 120 + kilka przy akcjach | 2–3 przy starcie |
| Godzina gier arcade (bieg co ~2 min) | ok. 30–60 | 2–3 przy starcie + rankingi (10 dokumentów na ekran) |
| Wejście do menu | 0–1 | 1 (`gracze`) + 1 (profil), zwykle z cache |

Przy darmowym limicie 20 000 zapisów dziennie zostaje duży zapas, **ale limit jest wspólny z drugim projektem**.

---

## 7. Odczyt przy starcie

```
index.html / gra
 1. config/firebase-config.js      → window.firebaseConfig
 2. shared/sowie-platform.js       → rejestr gier, stałe (bez localStorage)
 3. shared/sowie-cloud.js          → connectFirestore(); setDoc(sowiegry/meta, merge)
 4. aktywny gracz z localStorage?  ── nie ──► ekran „Kto dziś gra?”
                                     tak
 5. getDoc(profile)  (najpierw cache, potem sieć)  → profil w pamięci
 6. w grze: getDoc(gry/{gameId})                   → stan gry / ustawienia
 7. SowieCloud.ready ✔  → SowieCore, SowieAcademy, SowieOwlGallery → init() gry
```

Zmiany w grach wynikające z asynchronicznego startu:

- **SowaJumper, Sowa3, Ogrody, Szklarnia**: logikę z poziomu skryptu (np. `const state = { best: Number(localStorage…) }`) przenosimy do funkcji startowej wywoływanej po `SowieCloud.ready`.
- **SowaRunner (p5.js w trybie globalnym)**: p5 sam wywołuje `setup()` po załadowaniu strony. Do czasu `ready` `draw()` rysuje ekran „Wczytywanie…”, a rekordy trafiają do zmiennych po `ready`. Jeśli Runner zostanie przepisany bez p5 (Analiza 2), ten problem znika.
- Pierwsza wizyta: pobranie SDK (~200 KB gzip) i połączenie trwa ok. 0,5–1,5 s. Kolejne wizyty korzystają z cache. W tym czasie wyświetlamy animowaną sówkę ładowania.

---

## 8. Rankingi (nowa możliwość)

Ranking wszech czasów to zapytanie po kolekcji profili. Nie wymaga dodatkowych dokumentów ani ręcznych indeksów, bo Firestore sam indeksuje pola map:

```js
const q = fs.query(
  fs.collection(db, "sowiegry", "gracze", "profile"),
  fs.orderBy("records.runner.bestDistance", "desc"),
  fs.limit(10),
);
const top = (await fs.getDocs(q)).docs.map((d) => ({ id: d.id, name: d.get("name"), value: d.get("records.runner.bestDistance") }));
```

Proponowane rankingi:

| Gra | Pole rankingu |
|---|---|
| SowaRunner | `records.runner.bestDistance` (i osobno `bestScore`) |
| SowaJumper | `records.jumper.bestHeight` |
| Sowa3 | `records.sowa3.bestScore` |
| Sowie Ogrody | `records.ogrody.lifetimeLeaves` |
| Sowia Szklarnia | `records.szklarnia.lifetimeLeaves` |

Miejsca w UI: przycisk „🏆 Ranking” w menu, top 3 i własna pozycja na ekranie końca gry, zakładka „Dzisiaj” dla wyzwania dnia.

---

## 9. Reguły bezpieczeństwa

### 9.1 Co oznaczają obecne reguły

```
match /{document=**} { allow read, write: if true; }
```

Każdy, kto zna konfigurację (jest w publicznym kodzie strony), może czytać, zmieniać i **kasować wszystko**: dane SowieGry i dane drugiego projektu. Kod SowieGry zadziała z tymi regułami bez zmian, więc ich zmiana to decyzja o bezpieczeństwie, a nie warunek wdrożenia.

**Ważne:** reguły Firestore się sumują. Jeśli *którakolwiek* pasująca reguła pozwala, dostęp jest przyznany. Dopisanie ostrzejszego bloku dla `sowiegry` obok powyższej reguły **nic nie zmieni**. Trzeba wyłączyć `sowiegry` z reguły ogólnej.

### 9.2 Proponowane reguły (drugi projekt działa bez zmian)

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // 1) Wszystko POZA kolekcją „sowiegry” działa dokładnie jak dotąd (drugi projekt).
    match /{kolekcja}/{dokument=**} {
      allow read, write: if kolekcja != "sowiegry";
    }

    // 2) SowieGry
    function gryIds() {
      return ["runner", "jumper", "sowa3", "ogrody", "szklarnia"];
    }
    function nazwaOk(data) {
      return data.name is string && data.name.size() >= 1 && data.name.size() <= 24;
    }

    match /sowiegry/meta {
      allow read: if true;
      allow create, update: if request.resource.data.schemaVersion is int;
      allow delete: if false;
    }

    match /sowiegry/gracze {
      allow read: if true;
      allow create, update: if request.resource.data.players is map;
      allow delete: if false;
    }

    match /sowiegry/gracze/profile/{graczId} {
      allow read: if true;
      allow create: if graczId.size() >= 12 && graczId.size() <= 40 && nazwaOk(request.resource.data);
      allow update: if nazwaOk(request.resource.data);
      allow delete: if false;

      match /gry/{gameId} {
        allow read: if true;
        allow write: if gameId in gryIds();
      }

      match /historia/{wpisId} {
        allow read: if true;
        allow create: if request.resource.data.game in gryIds()
                      && request.resource.data.score is number;
        allow delete: if true;          // przycinanie do 50 wpisów
        allow update: if false;
      }
    }

    match /sowiegry/rankingi {
      allow read: if true;
      allow write: if false;
    }

    match /sowiegry/rankingi/dzienne/{dzienId} {
      allow read: if true;
      allow create, update: if request.resource.data.game in gryIds()
                            && request.resource.data.scores is map;
      allow delete: if false;
    }
  }
}
```

Co to daje: drugi projekt ma dostęp jak dziś, dane SowieGry mają kontrolowany kształt, a przypadkowy błąd lub złośliwy zapis nie skasuje profili. Czego to **nie** daje: bez logowania nadal każdy może wpisać do rankingu dowolny wynik. Dla gier rodzinnych to akceptowalne.

Wdrożenie: konsola Firebase → Firestore Database → Rules → wklej → sprawdź w „Rules Playground” (np. odczyt `/sowiegry/meta` oraz zapis do ścieżki drugiego projektu) → Publish.

### 9.3 Dalsze zaostrzenie (opcjonalnie, później)

- **Anonymous Auth** (wariant C): `request.auth != null` dla zapisów w `sowiegry` oraz `request.auth.uid in resource.data.owners` dla profili.
- **Ograniczenie klucza API** w Google Cloud Console (APIs & Services → Credentials → HTTP referrers). Trzeba dodać domenę SowieGry (np. `https://cutelittlegoat.github.io/*`, jeśli to GitHub Pages), `http://localhost:*` **oraz domenę drugiego projektu**. Pominięcie tej ostatniej zepsuje drugi projekt.
- **App Check** (reCAPTCHA Enterprise) chroni przed ruchem spoza strony.

---

## 10. Co usuwamy (pozostałości zapisu lokalnego)

| Plik | Co usunąć |
|---|---|
| `shared/progress-reset.js` | **cały plik** (warstwa zgodności migracji) + `<script>` w 6 plikach HTML (`index.html` i `index.html` każdej z 5 gier) |
| `shared/idle-save-bridge.js` | **cały plik** (zapis przez klikanie ukrytego przycisku) + `<script>` w `SowieOgrody/index.html:68`, `SowiaSzklarnia/index.html:71` |
| `shared/sowie-platform.js` | `PROFILE_KEY`, `BACKUP_PREFIX`, `backupValue`, `migrateProfile` (logika wartości domyślnych przechodzi do `sowie-cloud.js`), `readProfile`, `writeProfile`, `migrateKnownSave`, `migrateLegacyStorage`, `allowedExportKey`, `exportData`, `downloadExport`, `importData`, `importFile` oraz wywołanie `migrateLegacyStorage()` na końcu pliku. **Zostają:** `GAME_REGISTRY`, `COSMETICS`, `DEFAULT_*`, zdarzenia (`emit`, `on`), `shouldRun`, `createRng`, obsługa `?seed=` i `?testNow=` |
| `shared/sowie-core.js` | `persistProfile`/`reloadProfile` na `localStorage` → `SowieCloud.updateProfile`; `flushPendingStats` → `SowieCloud.flush`; w `renderSettings` usunąć przyciski „Eksportuj zapis” / „Importuj zapis” i obsługę pliku; nazwa okna „Ustawienia i zapis” → „Ustawienia i profil” (z nazwą gracza i przyciskiem „Zmień gracza”); `exportData`/`importData` z `window.SowieCore` |
| `shared/sowie-academy.js` | `load()`/`save()` na `localStorage` (linie 58–82, 339) → `profile.academy` |
| `shared/owl-gallery.js` | `load()`/`save()` (linie 332–355, 573) → `profile.gallery` |
| `shared/gameplay-expansion.js` | `safeJson`, `saveJson`, `updateDailyBest` na `localStorage`; bezpośrednie czytanie `sowieOgrodySave` i `sowiaSzklarniaSave`. Gry idle udostępniają zamiast tego `window.SowieIdleGame.snapshot()` |
| `SowaRunner/sketch.js` | odczyt i zapis `sowaRunnerBest*` (linie 4, 22) → `SowieCloud.records("runner")` + `submitRun` |
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
| `shared/sowie-cloud.js` (nowy) | połączenie z Firestore, `MemoryBackend`, magazyn w pamięci, kolejka zapisów, API z punktu 3.2, bootstrap `sowiegry/meta` |
| `shared/profile-picker.js` + styl w `shared/cute-ui.css` (nowe) | ekran „Kto dziś gra?”, tworzenie profilu, PIN, przełączanie gracza |
| `shared/leaderboard.js` (nowy, opcjonalnie) | okno rankingów |
| `config/firebase-config.js` | poprawiony komentarz (bez `GM.html`/`DataSlate.html`) |
| Wszystkie `index.html` | skrypty `config/firebase-config.js` i `shared/sowie-cloud.js`, usunięte skrypty z rozdziału 10 |
| Gry | start po `SowieCloud.ready`, `submitRun()` na końcu rozgrywki, `saveGameState()` w grach idle |
| `eslint.config.js` | globalne `SowieCloud` (jeśli potrzebne) |
| `.github/workflows/js-check.yml` | krok `actions/setup-java` + emulator Firestore dla testów e2e (rozdział 13) |
| `firebase.json`, `firestore.rules` (nowe) | konfiguracja emulatora i kopia reguł z rozdziału 9.2 w repo (źródło prawdy dla testów reguł) |

---

## 12. Jednorazowe przeniesienie obecnych danych

Założenie „pozostałości do skasowania” da się pogodzić z zachowaniem dotychczasowych wyników:

1. Przy tworzeniu **pierwszego** profilu na urządzeniu `sowie-cloud.js` sprawdza, czy istnieją stare klucze (`sowieGryProfile`, `sowieOgrodySave`, …).
2. Jeśli tak, pyta: „Na tym urządzeniu jest stary zapis gier. Przenieść go do profilu «Sówka Ania»?”.
3. Po potwierdzeniu dane trafiają do Firestore wg tabeli z rozdziału 1.2 (rekordy jako max, stany idle jako `state`), a **wszystkie stare klucze są usuwane**. Klucze bez odpowiednika są usuwane bez przenoszenia: `sowieGryBackup:*`, `sowieGryMigrationsVersion`, `sowieExpansion:*` i `sowieDailyBest:*` z dni wcześniejszych niż dziś.
4. Po odmowie stare klucze też są usuwane, żeby nie zostały śmieci.
5. Kod importu (`importLegacyLocalStorage()`) jest tymczasowy. Po 1–2 miesiącach usuwamy go w osobnej zmianie.

Alternatywa: czysty start bez przenoszenia (prostsze, ale gracze tracą rekordy).

---

## 13. Testy

- **Test jednostkowy magazynu** (`tests/unit/sowie-cloud.test.mjs`): kolejka zapisów, opóźnienia, logika max/increment, przycinanie `academy.awards`, import starych danych. Uruchamiany na `MemoryBackend` przez `node --test`.
- **E2E na emulatorze Firestore:** `sowie-cloud.js` łączy się z emulatorem, gdy adres zawiera `?cloud=emulator` (`connectFirestoreEmulator(db, "127.0.0.1", 8080)`). Potrzebny jest minimalny `firebase.json` (tylko dla emulatora: port i plik `firestore.rules`) oraz projekt demonstracyjny. W CI: `npx firebase-tools emulators:exec --only firestore --project demo-sowiegry "npm run test:e2e"`, poprzedzone krokiem `actions/setup-java` (Java 21). To realne zachowanie SDK bez dotykania produkcyjnej bazy.
- **Szybkie E2E bez emulatora:** `?cloud=memory` dla testów, które nie sprawdzają trwałości (dym, pauza, modale).
- **Testy reguł:** `@firebase/rules-unit-testing` na emulatorze. Sprawdzają, że drugi projekt ma pełny dostęp, a zapisy do `sowiegry` spoza schematu są odrzucane.
- Do przepisania: 3 testy z `platform.spec.js`, testy galerii ustawiające stan przez `localStorage`, odczyt profilu w `smoke.spec.js`.

---

## 14. Plan wdrożenia

| Etap | Zakres | Kryterium ukończenia |
|---|---|---|
| 1. Fundament | `sowie-cloud.js` (Firestore + Memory), bootstrap `sowiegry/meta`, ekran wyboru profilu, testy jednostkowe, emulator w CI | Menu tworzy i wybiera profil, a w konsoli widać `sowiegry/meta` i `sowiegry/gracze/profile/{id}` |
| 2. Moduły wspólne | `SowieCore`, `SowieAcademy`, `SowieOwlGallery`, `gameplay-expansion` na `SowieCloud`; usunięcie migracji, eksportu/importu, `progress-reset.js` | Ustawienia, garderoba, misje, akademia i galeria przetrwają zmianę urządzenia |
| 3. Gry arcade | Runner, Jumper, Sowa3: start po `ready`, `submitRun`, ustawienia trudności w `gry/{id}`, rankingi | Rekordy widoczne na drugim urządzeniu, ranking top 10 działa |
| 4. Gry idle | Ogrody, Szklarnia: `load/saveGameState`, usunięcie `idle-save-bridge.js`, `rev` + ostrzeżenie o konflikcie, czas offline z `serverTimestamp` | Stan idle wraca po przeładowaniu i na drugim urządzeniu, liczba zapisów ≤ 120/h |
| 5. Przeniesienie starych danych | jednorazowy import i sprzątanie kluczy | Po imporcie w `localStorage` zostaje tylko `sowiegry:aktywnyGracz` |
| 6. Reguły i dokumentacja | reguły z 9.2, aktualizacja `docs/Documentation.md` i `docs/README.md` (główne i każdej gry, zgodnie z `AGENTS.md`) | Rules Playground: drugi projekt ✔, zły zapis do `sowiegry` ✘ |
| 7. (opcjonalnie) | Anonymous Auth + zaostrzone reguły, ograniczenie klucza API, App Check | — |

Rekomendacja: etapy 1–6 jako jedna seria zmian przed przebudową gier z Analizy 2. Nowe gry od razu korzystają z `SowieCloud` i nie dotykają `localStorage`.

---

## 15. Ryzyka

| Ryzyko | Skutek | Ograniczenie |
|---|---|---|
| Wspólne limity z drugim projektem | Przekroczenie dziennego limitu blokuje oba projekty do północy (czasu pacyficznego) | Opóźnianie zapisów, zapisy tylko przy końcu gry, obserwacja zużycia w konsoli |
| Otwarte reguły | Każdy może zmienić lub skasować dane (również drugiego projektu) | Reguły z 9.2; później Auth |
| Oszukiwanie w rankingach | Nieprawdziwe wyniki | Akceptowalne w gronie rodzinnym; w razie potrzeby Auth + walidacja zakresów |
| Brak sieci przy pierwszej wizycie | Nie da się załadować SDK | `MemoryBackend` + komunikat; później PWA z service workerem |
| Dwa urządzenia na tej samej grze idle | Nadpisanie postępu | `rev`, `deviceId`, nasłuch i pytanie o wczytanie |
| Różnice zegarów urządzeń | Zawyżony lub zaniżony postęp offline | `serverTimestamp`, przycinanie czasu |
| Zależność od CDN gstatic | Awaria CDN = brak zapisu | Przypięta wersja; opcjonalna kopia w `vendor/` |

---

## 16. Decyzje do podjęcia

| # | Pytanie | Rekomendacja |
|---|---|---|
| 1 | Tożsamość gracza | **A — lista profili** (pseudonim + awatar) |
| 2 | PIN do profilu | opcjonalny, domyślnie wyłączony |
| 3 | Przenieść obecne wyniki z `localStorage`? | **tak, jednorazowo**, potem kasujemy klucze i kod importu |
| 4 | Zmienić reguły teraz? | **tak**, wersja 9.2 (bezpieczna dla drugiego projektu) |
| 5 | Historia rozgrywek (`historia`) | tak, max 50 wpisów na grę |
| 6 | Rankingi | **tak** — wszech czasów + wyzwanie dnia |
| 7 | Pamiętać wybranego gracza na urządzeniu (1 klucz `localStorage`)? | tak |
