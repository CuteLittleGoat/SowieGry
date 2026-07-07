# Sowie Ogrody — pełna specyfikacja gry idle / incremental

## Status dokumentu

Ten dokument opisuje planowaną czwartą grę w repozytorium `SowieGry`. Ma służyć jako główna dokumentacja projektowa przed implementacją.

Gra ma być **rozbudowanym clickerem / incrementalem / idle management game** z trwałym zapisem postępu, automatyzacją, offline progressem, prestiżem i długą progresją.

## Decyzja o zapisie

Gra jest przeznaczona do użytku jednej osoby, więc **Firebase nie jest potrzebny w MVP**.

Pierwsza wersja używa lokalnego zapisu w `localStorage`. Firebase albo inny cloud-save może zostać dodany później wyłącznie jako opcjonalny adapter, jeżeli pojawi się realna potrzeba synchronizacji między urządzeniami.

Rekomendowane klucze zapisu:

```txt
sowieOgrodySave
sowieOgrodySettings
sowieGryProfile
```

`SowieGryProfile` zostaje dla rzeczy wspólnych: garderoba, misje, kosmetyki, ustawienia audio i statystyki globalne.

## Nazwa i pitch

Nazwa gry: **Sowie Ogrody**.

Pitch:

> Sowa zaczyna od jednej małej doniczki na parapecie. Z czasem rozwija balkon, działkę, szklarnię i absurdalne sowie centrum ogrodnicze. Gracz zbiera liście monster, kupuje rośliny, odblokowuje automatyzację, wraca po offline progress, korzysta z kóz, humbaka, dostaw Amic i wykonuje „Wielkie Przesadzanie”, żeby zacząć od nowa z potężniejszymi bonusami.

## Główne filary projektu

1. **Najpierw klikam, potem zarządzam** — początek jest prostym clickerem, ale gra stopniowo przechodzi w idle/incremental.
2. **Stały postęp** — gracz niemal zawsze coś odblokowuje: roślinę, strefę, ulepszenie, event, kosmetyk albo automatyzację.
3. **Automatyzacja jako nagroda** — ręczne klikanie jest ważne tylko na początku. Później gracz kupuje systemy, które robią to za niego.
4. **Powroty mają sens** — offline progress daje nagrodę po przerwie.
5. **Cute absurd SowieGry** — sowa, kozy, humbak, basen, liście monster, Amic, Pracu Pracu, pastelowy humor.
6. **Bez backendu i logowania** — gra ma działać lokalnie, szybko i bez konfiguracji zewnętrznych usług.
7. **Długa, ale czytelna progresja** — duże liczby są mile widziane, ale UI musi je formatować i wyjaśniać.

## Docelowy typ gry

Gra łączy elementy:

- clickera,
- idle game,
- incremental game,
- lekkiego tycoona,
- management game,
- gry z prestiżem.

Najważniejsza różnica względem `SowaRunner`, `SowaJumper` i `Sowa3`: rozgrywka nie kończy się po jednej sesji. Postęp narasta przez wiele powrotów.

## Core loop

### Pętla pierwszych minut

1. Gracz klika/tapuje roślinę albo sowę.
2. Dostaje liście.
3. Kupuje pierwszą doniczkę.
4. Doniczka produkuje liście automatycznie.
5. Gracz kupuje kolejne rośliny.
6. Odblokowuje pierwszy zraszacz.
7. Zraszacz przyspiesza produkcję.

### Pętla średniej gry

1. Gracz kupuje rośliny i ulepszenia.
2. Produkcja na sekundę rośnie.
3. Pojawiają się aktywne eventy.
4. Odblokowują się nowe strefy ogrodu.
5. Automatyzacja zmniejsza potrzebę klikania.
6. Gra nalicza offline progress po powrocie.
7. Gracz optymalizuje zakupy i mnożniki.

### Pętla późnej gry

1. Gracz osiąga próg prestiżu.
2. Wykonuje **Wielkie Przesadzanie**.
3. Traci część zwykłego progresu.
4. Otrzymuje Nasiona Prestiżu.
5. Kupuje stałe bonusy.
6. Nowy cykl jest szybszy i odblokowuje głębsze systemy.

## Waluty i zasoby

### Liście

Podstawowa waluta.

Źródła:

- ręczne kliknięcie,
- rośliny,
- automatyczne zbiory,
- offline progress,
- złote liście,
- dostawy Amic,
- eventy,
- bonusy humbaka i kozy.

Wydatki:

- kupno roślin,
- ulepszenia produkcji,
- automatyzacja,
- odblokowanie stref,
- niektóre eventy.

### Woda / Plusk

Drugi zasób, odblokowywany po zakupie basenu albo humbaka.

Źródła:

- humbak w basenie,
- zraszacze,
- deszcz monster,
- Amic-dostawa wody,
- ręczne kliknięcie plusku podczas eventu.

Wydatki:

- przyspieszanie wzrostu,
- ulepszenia szklarni,
- boost produkcji,
- specjalne rośliny,
- wybrane automatyzacje.

### Nasiona Prestiżu

Waluta stałego progresu.

Źródła:

- Wielkie Przesadzanie.

Wydatki:

- globalny mnożnik liści,
- globalny mnożnik wody,
- dłuższy offline progress,
- tańsze pierwsze rośliny,
- szybsza automatyzacja,
- dodatkowe sloty eventów,
- kosmetyczne stałe odblokowania.

### Dekoracje

Zasób kosmetyczny albo kategoria odblokowań. Nie musi być walutą liczbową.

Źródła:

- misje,
- milestones,
- prestiż,
- dostawy Amic,
- specjalne osiągnięcia.

Efekt:

- zmienia wygląd ogrodu,
- może dawać bardzo małe bonusy jakości życia, ale nie powinna być głównym źródłem mocy.

## Formatowanie dużych liczb

Gra musi mieć formatter, bo incremental szybko generuje duże wartości.

Przykład:

```txt
999 -> 999
1_250 -> 1.25K
1_200_000 -> 1.2M
1_500_000_000 -> 1.5B
```

Funkcja:

```txt
formatNumber(value)
```

W MVP wystarczą sufiksy:

```txt
K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, Dc
```

## Podstawowe wzory ekonomii

### Koszt rośliny

```txt
cost = floor(baseCost * growthRate ^ owned)
```

Rekomendowane `growthRate`: od `1.12` do `1.18`, zależnie od rośliny.

### Produkcja rośliny

```txt
plantProduction = owned * baseProduction * plantMultiplier * globalMultiplier * prestigeMultiplier
```

### Produkcja całkowita

```txt
leavesPerSecond = sum(plantProduction) * eventMultiplier * temporaryBoostMultiplier
```

### Siła kliknięcia

```txt
clickPower = baseClickPower * clickMultiplier + percentOfLpsClickBonus
```

Na początku kliknięcie jest ważne. Później kliknięcie może dawać np. `1%` aktualnej produkcji na sekundę, żeby nadal miało sens, ale nie było obowiązkowe.

### Offline progress

```txt
offlineSeconds = min(now - lastSavedAt, offlineCapSeconds)
offlineLeaves = leavesPerSecond * offlineSeconds * offlineEfficiency
offlineWater = waterPerSecond * offlineSeconds * offlineWaterEfficiency
```

Startowo:

```txt
offlineCapSeconds = 2h
offlineEfficiency = 0.25
```

Po ulepszeniach:

```txt
offlineCapSeconds -> 4h, 8h, 12h, 24h
offlineEfficiency -> 0.35, 0.5, 0.75, 1.0
```

## Strefy ogrodu

Strefy pełnią rolę rozdziałów progresji i zmieniają grafikę.

### 1. Parapet

Start gry.

Warunek odblokowania:

```txt
start
```

Zawartość:

- jedna doniczka,
- sowa obok rośliny,
- ręczne klikanie,
- pierwsze rośliny,
- pierwsze ulepszenia kliknięcia.

Grafika:

- pastelowe okno,
- parapet,
- mała doniczka,
- sowa siedząca z boku,
- pojedyncze liście jako cząsteczki.

### 2. Balkon

Pierwsze poczucie rozbudowy.

Warunek:

```txt
1_000 liści łącznie
```

Zawartość:

- kilka doniczek,
- stojak na rośliny,
- pierwszy zraszacz,
- pierwsza automatyzacja zbiorów.

Grafika:

- balkon z barierką,
- pastelowe bloki w tle,
- skrzynki balkonowe,
- delikatny wiatr i spadające liście.

### 3. Działka

Główna estetyka gry.

Warunek:

```txt
50_000 liści łącznie
```

Zawartość:

- grządki,
- koza ogrodniczka,
- kompostownik,
- prosty system eventów,
- offline progress mocniej widoczny.

Grafika:

- działka z płotem,
- trawa,
- grządki,
- szopka,
- koza,
- ścieżka z kamieni.

### 4. Basen i humbak

Strefa pośrednia odblokowująca drugi zasób.

Warunek:

```txt
250_000 liści łącznie
```

Zawartość:

- basen,
- humbak,
- woda / plusk,
- bonusy czasowe.

Grafika:

- okrągły basen z niebieskim rantem,
- humbak wystający z wody,
- pluski,
- fale,
- krótkie animacje wody.

### 5. Szklarnia

Pełne wejście w idle management.

Warunek:

```txt
2_000_000 liści łącznie + 1_000 wody
```

Zawartość:

- automatyczne zbiory,
- mnożniki roślin,
- specjalne rośliny,
- lepszy offline progress,
- pierwsze zaawansowane automaty.

Grafika:

- szklarnia,
- półprzezroczyste szyby,
- krople wody,
- lampy do roślin,
- gęste zielone tło.

### 6. Sowie centrum ogrodnicze

Późna gra.

Warunek:

```txt
50_000_000 liści łącznie
```

Zawartość:

- dostawy Amic,
- kontrakty Pracu Pracu,
- większa automatyzacja,
- prestiż,
- drogie multiplikatory,
- dekoracje ogrodu.

Grafika:

- mały sklepik ogrodniczy,
- ciężarówka dostawcza Amic,
- tablice promocji,
- skrzynie nawozu,
- strefa pakowania liści.

### 7. Sowie arboretum prestiżowe

Strefa po pierwszym prestiżu.

Warunek:

```txt
prestigeCount >= 1
```

Zawartość:

- drzewo prestiżu,
- specjalne rośliny,
- pasywne mnożniki,
- długoterminowe cele.

Grafika:

- wielkie magiczne drzewo,
- złote liście,
- świecące nasiona,
- sowa w bardziej królewskiej pozie.

## Rośliny produkcyjne

Rośliny są głównymi generatorami liści.

| ID | Nazwa | Strefa | Koszt bazowy | Produkcja bazowa | Growth | Rola |
|---|---|---:|---:|---:|---:|---|
| `monstera` | Monstera startowa | Parapet | 10 | 0.1/s | 1.12 | pierwszy generator |
| `pilea` | Pilea monetkowa | Parapet | 75 | 0.8/s | 1.13 | szybki start |
| `paproc` | Paproć kanapowa | Balkon | 450 | 4/s | 1.14 | stabilna produkcja |
| `alokazja` | Alokazja królewska | Balkon | 2_500 | 18/s | 1.15 | mid-game |
| `kaktus` | Kaktus Pracu Pracu | Działka | 15_000 | 90/s | 1.15 | ryzykowne bonusy eventowe |
| `storczyk` | Storczyk pluskowy | Basen | 120_000 | 650/s | 1.16 | korzysta z wody |
| `bonsai` | Bonsai cierpliwości | Szklarnia | 1_000_000 | 5_000/s | 1.16 | idle/offline bonus |
| `mutantMonstera` | Mutant monstera | Szklarnia | 8_000_000 | 42_000/s | 1.17 | wysoka produkcja |
| `goldLeafTree` | Drzewko złotych liści | Centrum | 75_000_000 | 420_000/s | 1.18 | późna gra |
| `prestigeOak` | Dąb przesadzania | Arboretum | nasiona prestiżu | zależne od prestiżu | 1.20 | endgame |

## Kamienie milowe roślin

Każda roślina ma progi liczby posiadanych sztuk.

Progi:

```txt
10, 25, 50, 100, 150, 200, 300, 500
```

Efekty:

- `10` — produkcja tej rośliny x2,
- `25` — produkcja tej rośliny x2,
- `50` — odblokowanie małej animacji,
- `100` — produkcja tej rośliny x3,
- `150` — tańsze kolejne sztuki o 5%,
- `200` — większy udział w offline progress,
- `300` — specjalny bonus strefy,
- `500` — dekoracja albo kosmetyczny efekt.

## Ulepszenia

Ulepszenia dzielą się na kilka grup.

### Ulepszenia kliknięcia

| ID | Nazwa | Koszt | Efekt |
|---|---|---:|---|
| `softGloves` | Miękkie rękawiczki sowy | 25 | kliknięcie x2 |
| `leafBasket` | Koszyk na liście | 250 | kliknięcie x3 |
| `fastBeak` | Szybki dzióbek | 2_000 | kliknięcie x5 |
| `gardenRhythm` | Rytm ogrodu | 20_000 | kliknięcie daje 1% LPS |
| `goldTap` | Złote tapnięcie | 500_000 | co 20 kliknięć złoty liść |

Klikanie nie powinno być wymagane w późnej grze. Ulepszenia kliknięcia mają pomóc aktywnemu graczowi, ale automatyzacja musi przejąć większość pracy.

### Ulepszenia produkcji

| ID | Nazwa | Koszt | Efekt |
|---|---|---:|---|
| `betterSoil` | Lepsza ziemia | 150 | wszystkie rośliny x1.5 |
| `cuteLabels` | Urocze etykietki | 1_000 | Monstera i Pilea x2 |
| `balconyShelves` | Półki balkonowe | 8_000 | rośliny balkonowe x2 |
| `compostBox` | Kompostownik | 45_000 | wszystkie rośliny x2 |
| `greenhouseLamps` | Lampy szklarniowe | 1_500_000 | rośliny szklarniowe x3 |
| `monsterFertilizer` | Nawóz monster | 12_000_000 | globalna produkcja x2 |
| `prestigeRoots` | Korzenie prestiżu | nasiona prestiżu | globalna produkcja zależna od prestiżu |

### Ulepszenia wody

| ID | Nazwa | Koszt | Efekt |
|---|---|---:|---|
| `smallSprinkler` | Mały zraszacz | 5_000 liści | +0.1 wody/s |
| `bigSprinkler` | Duży zraszacz | 80_000 liści | +1 wody/s |
| `whalePool` | Basen humbaka | 250_000 liści | odblokowuje humbaka i plusk |
| `splashPump` | Pompa plusku | 2_000 wody | produkcja wody x2 |
| `rainCollector` | Zbieracz deszczu | 10_000 wody | offline water x2 |

### Ulepszenia automatyzacji

| ID | Nazwa | Warunek | Efekt |
|---|---|---|---|
| `autoHarvestI` | Pomocna konewka | Balkon | automatyczny zbiór co 5 s |
| `autoHarvestII` | Pracowity zraszacz | Działka | automatyczny zbiór co 2 s |
| `autoClicker` | Sowie tykanie | Działka | automatyczne kliknięcia 1/s |
| `goatAssistant` | Koza asystentka | Działka | automatycznie zbiera złote liście z 50% skutecznością |
| `deliveryManager` | Kierownik dostaw Amic | Centrum | automatycznie odbiera zwykłe dostawy |
| `smartBuyerPlants` | Sowa zakupowa: rośliny | Szklarnia | może kupować najtańszą opłacalną roślinę |
| `smartBuyerUpgrades` | Sowa zakupowa: ulepszenia | Centrum | może kupować wybrane ulepszenia po zaznaczeniu |
| `offlineGardeners` | Nocni ogrodnicy | Prestiż | zwiększa offline efficiency |

Automatyzacja jest jednym z głównych celów progresji. Gra powinna zaczynać się od ręcznego klikania, ale po kilkunastu minutach podstawowe klikanie powinno przestać być potrzebne.

## System automatyzacji

### Poziom 0 — ręczna gra

- gracz klika,
- sam kupuje rośliny,
- sam odbiera eventy.

### Poziom 1 — automatyczne zbiory

- rośliny produkują liście na sekundę,
- HUD stale aktualizuje LPS,
- gracz nadal decyduje o zakupach.

### Poziom 2 — automatyczne kliknięcia

- `autoClicker` generuje kliknięcia,
- kliknięcia korzystają z ulepszeń kliknięcia,
- aktywne granie jest nadal premiowane przez eventy.

### Poziom 3 — automatyczne eventy

- koza może zbierać złote liście,
- kierownik Amic odbiera zwykłe dostawy,
- humbak automatycznie generuje wodę.

### Poziom 4 — automatyczne zakupy

- gracz może włączyć auto-kupowanie roślin,
- auto-kupowanie nie powinno kupować wszystkiego bez kontroli,
- gracz wybiera tryb:
  - najtańsze,
  - najlepszy zwrot LPS/koszt,
  - tylko wybrane rośliny,
  - oszczędzaj na następne odblokowanie.

### Poziom 5 — presety strategii

Późna gra może mieć presety:

- `Szybki start` — kupuj tanie rośliny i pierwsze ulepszenia,
- `Oszczędzaj wodę` — nie wydawaj wody bez zgody,
- `Przygotuj prestiż` — maksymalizuj liście do resetu,
- `Offline build` — kupuj bonusy pod długą przerwę.

## Eventy aktywne

Eventy są krótkimi okazjami dla aktywnego gracza. Nie mogą być obowiązkowe, ale powinny przyspieszać progres.

### Złoty liść

Pojawia się na ekranie przez 5–8 sekund.

Efekt:

```txt
nagroda = max(50 liści, leavesPerSecond * 30)
```

Automatyzacja:

- koza asystentka może zbierać złote liście automatycznie z rosnącą skutecznością.

### Tęczowy liść

Rzadszy wariant.

Efekt:

- uruchamia `Gorączkę monster` na 20 sekund,
- produkcja liści x3,
- więcej cząsteczek i animacji.

### Gorączka monster

Czasowy boost.

Start:

- tęczowy liść,
- seria kliknięć,
- rzadki bonus Amic,
- misja albo milestone.

Efekt:

```txt
leavesPerSecond x3
clickPower x2
szansa na złote liście x2
```

### Plusk humbaka

Humbak co jakiś czas pokazuje sygnał plusku.

Ręczna reakcja:

- kliknięcie w czasie 4 sekund daje wodę i bonus do produkcji.

Efekt:

```txt
+ waterPerSecond * 60
+ leavesPerSecond * 15
```

Automatyzacja:

- późniejsze ulepszenie pozwala odbierać część plusków automatycznie.

### Koza zjada chwasty

Krótki event na działce.

Efekt:

- jeżeli gracz kliknie kozę, dostaje bonus produkcji,
- jeżeli ma automatyzację kozy, event może zostać obsłużony sam.

Efekt bazowy:

```txt
produkcja x2 przez 30 s
```

### Dostawa Amic

Pojawia się ciężarówka albo paczka.

Gracz wybiera jedną z trzech nagród:

1. liście natychmiast,
2. woda,
3. czasowy mnożnik,
4. tańsze rośliny przez minutę,
5. dekoracja,
6. rzadki tęczowy liść.

Automatyzacja:

- kierownik dostaw może automatycznie wybierać domyślną nagrodę.

### Kontrakt Pracu Pracu

Ryzykowny event.

Gracz może zaakceptować lub odrzucić.

Przykłady kontraktów:

- `Pracu Pracu: Nadgodziny` — produkcja x4 przez 60 s, potem produkcja x0.5 przez 30 s.
- `Pracu Pracu: Szybki zysk` — natychmiastowe liście równe 10 minutom produkcji, ale kolejne ulepszenie kosztuje 20% więcej.
- `Pracu Pracu: Audyt doniczek` — woda x3 przez 90 s, ale kliknięcia są osłabione.

Kontrakty muszą być humorystyczne i opcjonalne. Nie powinny karać gracza trwale.

## Prestiż: Wielkie Przesadzanie

Prestiż odblokowuje się po osiągnięciu progu:

```txt
lifetimeLeaves >= 100_000_000
```

### Wzór nasion prestiżu

Prosty wzór MVP:

```txt
prestigeSeedsGain = floor(sqrt(lifetimeLeaves / 10_000_000))
```

Przykłady:

```txt
100_000_000 liści -> 3 nasiona
1_000_000_000 liści -> 10 nasion
10_000_000_000 liści -> 31 nasion
```

### Co resetuje prestiż

Resetuje:

- aktualne liście,
- aktualną wodę,
- posiadane rośliny,
- zwykłe ulepszenia,
- aktywne eventy,
- aktualną strefę do startowej albo do wybranej odblokowanej przez prestiż.

Nie resetuje:

- Nasion Prestiżu,
- zakupionych ulepszeń prestiżowych,
- kosmetyków,
- dekoracji stałych,
- statystyk lifetime,
- ustawień,
- osiągnięć/misji.

### Ulepszenia prestiżowe

| ID | Nazwa | Koszt | Efekt |
|---|---|---:|---|
| `ancientRoots` | Starożytne korzenie | 1 | globalna produkcja +25% za poziom |
| `deepWaterMemory` | Pamięć plusku | 2 | woda +20% za poziom |
| `sleepyGardeners` | Senni ogrodnicy | 2 | offline efficiency +10% za poziom |
| `fasterStart` | Szybszy parapet | 3 | start z darmową Monsterą i Pileą |
| `goatWisdom` | Mądrość kozy | 5 | koza lepiej obsługuje eventy |
| `amicContracting` | Stała umowa Amic | 5 | częstsze dostawy |
| `prestigeGreenhouse` | Szklarniowe dziedzictwo | 8 | szklarnia odblokowuje się szybciej |

## Misje

Misje powinny działać przez `SowieCore`, tak jak w pozostałych grach.

### Misje startowe

| ID | Cel | Nagroda |
|---|---|---|
| `ogrodyFirstPlant` | Kup pierwszą roślinę | mała dekoracja doniczki |
| `ogrodyLeaves1000` | Zbierz 1 000 liści | kosmetyk: konewka |
| `ogrodyBalcony` | Odblokuj balkon | dekoracja balkonowa |
| `ogrodyAutoHarvest` | Kup pierwszą automatyzację | kosmetyk: rękawiczki |

### Misje średniej gry

| ID | Cel | Nagroda |
|---|---|---|
| `ogrodyGoat` | Odblokuj kozę | kosmetyk: dzwoneczek kozy |
| `ogrodyWhale` | Odblokuj humbaka | kosmetyk: kropla plusku |
| `ogrodyOffline1000` | Zbierz 1 000 liści offline | dekoracja: hamak sowy |
| `ogrodyMonsterFever` | Uruchom Gorączkę monster 5 razy | kosmetyk: tęczowy listek |

### Misje późnej gry

| ID | Cel | Nagroda |
|---|---|---|
| `ogrodyGreenhouse` | Odblokuj szklarnię | kosmetyk: okulary ogrodnika |
| `ogrodyAmicDeliveries` | Odbierz 25 dostaw Amic | dekoracja: mała stacja dostaw |
| `ogrodyPrestige` | Wykonaj Wielkie Przesadzanie | kosmetyk: złoty listek |
| `ogrodyPrestige5` | Wykonaj 5 prestiży | dekoracja: drzewo prestiżu |

## Osiągnięcia lokalne

Oprócz misji można mieć osiągnięcia wyłącznie w zapisie gry.

Przykłady:

- `Pierwszy listek`,
- `Nie klikam, samo rośnie`,
- `Koza pracownik miesiąca`,
- `Humbak podlewacz`,
- `Działkowiec roku`,
- `Szklarnia pełna monster`,
- `Przesadzanie bez strachu`,
- `To już nie ogród, to imperium`.

Osiągnięcia mogą dawać małe bonusy albo tylko dekoracje.

## Grafika i assety

Gra powinna być możliwa do wykonania bez zewnętrznych plików graficznych, przez Canvas 2D i proste rysowanie kształtami, tak jak pozostałe gry.

### Styl wizualny

- pastelowy,
- miękkie kontury,
- czytelne ikony,
- lekko zaokrąglone UI,
- dużo zieleni, błękitów i różów,
- ciepły klimat działki,
- humorystyczne małe animacje.

### Główne grafiki / obiekty

#### Sowa

Stany:

- idle,
- kliknięcie / zbiór,
- radość po zakupie,
- sen podczas offline progress,
- praca przy zraszaczu,
- prestiż / złoty blask.

Elementy kosmetyczne muszą korzystać z `SowieCore.drawCanvasCosmetic`, jeżeli będzie dostępne.

#### Rośliny

Każda roślina powinna mieć minimum 3 stany:

1. mała sadzonka,
2. średnia roślina,
3. duża dojrzała roślina.

Przy dużej liczbie sztuk nie rysujemy każdej osobno. Zamiast tego:

- 1–9 sztuk: pojedyncze doniczki,
- 10–49: większe grupy,
- 50+: zagęszczony klaster,
- 100+: reprezentacja jako większa grządka / sekcja.

#### Koza

Stany:

- stoi,
- żuje,
- skacze przy bonusie,
- niesie listek,
- śpi, jeżeli event nieaktywny.

#### Humbak

Stany:

- spokojny w basenie,
- przygotowanie plusku,
- plusk,
- zadowolenie po kliknięciu.

#### Amic-dostawa

Elementy:

- mała ciężarówka / van,
- paczki,
- znak dostawy,
- zielono-biało-żółto-czerwony akcent inspirowany istniejącą planszą Amic, bez konieczności dokładnego logo.

#### Pracu Pracu

Elementy:

- tabliczka / telefon / dziwny formularz,
- ostrzegawczy dymek,
- kontrakt z dwoma przyciskami: przyjmij / odmów.

### Efekty cząsteczkowe

- spadające liście,
- złote liście,
- tęczowe liście,
- kropelki wody,
- plusk,
- małe gwiazdki po zakupie,
- zielony puls podczas boosta,
- złoty blask podczas prestiżu.

Efekty muszą respektować ustawienie `reducedEffects` ze wspólnego profilu.

### Ikony UI

Potrzebne ikony:

- liść,
- woda,
- nasiono prestiżu,
- LPS,
- kliknięcie,
- roślina,
- zraszacz,
- koza,
- humbak,
- Amic-dostawa,
- Pracu Pracu,
- prestiż,
- zapis.

Można używać emoji w UI, ale w Canvas lepiej rysować proste ikony kształtami, żeby uniknąć różnic między systemami.

## UI i ekrany

### Główny ekran gry

Elementy:

- canvas ogrodu,
- górny HUD,
- panel zakupów,
- zakładki kategorii,
- pasek komunikatów,
- przyciski wspólnego UI.

### Zakładki panelu

1. `Rośliny`
2. `Ulepszenia`
3. `Automatyzacja`
4. `Eventy`
5. `Prestiż`
6. `Statystyki`

Na telefonie panel powinien być na dole i otwierany jak szuflada.

### Karta rośliny

Pokazuje:

- nazwę,
- ilość,
- koszt następnej sztuki,
- produkcję jednej sztuki,
- produkcję łączną,
- najbliższy milestone,
- przyciski `Kup 1`, `Kup 10`, `Kup max`.

### Karta ulepszenia

Pokazuje:

- nazwę,
- opis,
- koszt,
- wymagania,
- efekt liczbowy,
- status kupione / zablokowane.

### Ekran offline progress

Po powrocie do gry, jeśli minęło np. ponad 60 sekund:

```txt
Sowa doglądała ogrodu przez 3h 12min.
Zebrano: 14.23K liści
Zebrano: 120 wody
Skuteczność offline: 50%
Limit offline: 8h
```

Przyciski:

- `Odbierz`,
- `Odbierz i pokaż statystyki`.

### Ekran prestiżu

Musi jasno pokazywać:

- co zostanie zresetowane,
- co zostanie zachowane,
- ile nasion gracz dostanie,
- jaki będzie nowy mnożnik,
- ostrzeżenie przed potwierdzeniem.

Wymagane dwa kroki potwierdzenia:

1. klik `Wielkie Przesadzanie`,
2. modal `Na pewno?`.

## Audio

Gra może korzystać z `SowieCore.play` i `SowieCore.startMusic`.

Potrzebne efekty:

- zbiór liścia,
- zakup,
- brak środków,
- odblokowanie strefy,
- event złotego liścia,
- plusk humbaka,
- beczenie kozy,
- dostawa Amic,
- prestiż,
- ukończenie misji.

Muzyka:

- spokojny motyw ogrodu,
- szybszy motyw podczas Gorączki monster,
- krótki motyw prestiżu.

## Zapis gry

### Przykładowa struktura save

```json
{
  "version": 1,
  "createdAt": 1780000000000,
  "lastSavedAt": 1780000500000,
  "lastSeenAt": 1780000500000,
  "leaves": 12345,
  "water": 340,
  "prestigeSeeds": 0,
  "lifetimeLeaves": 999999,
  "lifetimeWater": 12000,
  "gardenLevel": 4,
  "currentZone": "dzialka",
  "unlockedZones": ["parapet", "balkon", "dzialka"],
  "plants": {
    "monstera": 12,
    "pilea": 8,
    "paproc": 4
  },
  "upgrades": {
    "softGloves": 1,
    "betterSoil": 1,
    "autoHarvestI": 1
  },
  "prestigeUpgrades": {},
  "automation": {
    "autoHarvest": true,
    "autoClick": false,
    "autoGoldenLeaf": false,
    "autoDelivery": false,
    "autoBuyPlants": false,
    "autoBuyUpgrades": false,
    "autoBuyMode": "bestValue"
  },
  "events": {
    "monsterFeverUntil": 0,
    "temporaryBoosts": []
  },
  "stats": {
    "manualClicks": 450,
    "totalPurchases": 120,
    "offlineLeavesEarned": 18000,
    "offlineWaterEarned": 0,
    "goldenLeavesCollected": 12,
    "deliveriesClaimed": 3,
    "prestigeCount": 0,
    "bestLeavesPerSecond": 1200
  },
  "achievements": {},
  "seenTutorials": {}
}
```

### Migracje

Każdy save ma `version`.

Funkcja:

```txt
migrateSave(rawSave)
```

Zasady:

- brak save -> `createDefaultSave()`,
- uszkodzony save -> backup w `sowieOgrodySave_corrupt_<timestamp>` i nowy save,
- starsza wersja -> migracja krok po kroku,
- nowsza wersja -> bezpieczne ostrzeżenie, ale nie kasować danych automatycznie.

### Autosave

Zapis:

- co 5 sekund,
- po zakupie,
- po odblokowaniu strefy,
- po odebraniu eventu,
- po prestiżu,
- przy `visibilitychange`,
- przy `pagehide`,
- przed opuszczeniem strony, jeśli możliwe.

HUD pokazuje status:

```txt
Zapisano
Zapisywanie...
Błąd zapisu
```

## Struktura plików

Proponowany katalog:

```txt
SowieOgrody/
  index.html
  style.css
  data.js
  save.js
  economy.js
  automation.js
  events.js
  prestige.js
  missions.js
  renderer.js
  ui.js
  script.js
  debug.js
  docs/
    README.md
    Documentation.md
```

### `index.html`

Ładuje canvas, HUD, panele i skrypty.

Kolejność skryptów:

```html
<script src="../shared/progress-reset.js"></script>
<script src="../shared/sowie-smoke-hook.js"></script>
<script src="../shared/sowie-core.js"></script>
<script src="../shared/sowie-runtime.js"></script>
<script src="data.js"></script>
<script src="save.js"></script>
<script src="economy.js"></script>
<script src="automation.js"></script>
<script src="events.js"></script>
<script src="prestige.js"></script>
<script src="missions.js"></script>
<script src="renderer.js"></script>
<script src="ui.js"></script>
<script src="debug.js"></script>
<script src="script.js"></script>
```

### `data.js`

Definicje danych:

- rośliny,
- ulepszenia,
- automatyzacje,
- strefy,
- eventy,
- prestiż,
- progi milestone.

### `save.js`

Funkcje:

```txt
createDefaultSave()
loadGame()
saveGame(reason)
scheduleSave(reason)
migrateSave(raw)
backupCorruptSave(raw)
exportSave()
importSave(text)
resetGame()
```

### `economy.js`

Funkcje:

```txt
formatNumber(value)
plantCost(plantId, amount)
maxAffordablePlant(plantId)
buyPlant(plantId, amount)
buyUpgrade(upgradeId)
calculatePlantProduction(plantId)
calculateLeavesPerSecond()
calculateWaterPerSecond()
calculateClickPower()
applyManualClick()
applyProductionTick(deltaSeconds)
applyOfflineProgress(now)
```

### `automation.js`

Funkcje:

```txt
updateAutomation(deltaSeconds)
runAutoHarvest(deltaSeconds)
runAutoClick(deltaSeconds)
tryAutoCollectGoldenLeaf()
tryAutoClaimDelivery()
tryAutoBuyPlants()
tryAutoBuyUpgrades()
setAutomationMode(mode)
```

### `events.js`

Funkcje:

```txt
updateEvents(deltaSeconds)
spawnGoldenLeaf()
collectGoldenLeaf(eventId)
startMonsterFever(duration)
spawnWhaleSplash()
claimWhaleSplash()
spawnAmicDelivery()
claimAmicDelivery(choice)
spawnPracuContract()
acceptPracuContract(contractId)
declinePracuContract(contractId)
```

### `prestige.js`

Funkcje:

```txt
canPrestige()
calculatePrestigeSeeds()
calculatePrestigeMultiplier()
performPrestige()
buyPrestigeUpgrade(id)
```

### `renderer.js`

Funkcje:

```txt
resizeCanvas()
renderFrame(now)
drawBackground()
drawZone(zoneId)
drawGardenObjects()
drawPlants()
drawOwl()
drawGoat()
drawWhale()
drawDeliveryTruck()
drawParticles()
drawFloatingText()
```

### `ui.js`

Funkcje:

```txt
bindUi()
renderHud()
renderTabs()
renderPlantPanel()
renderUpgradePanel()
renderAutomationPanel()
renderEventPanel()
renderPrestigePanel()
renderStatsPanel()
showOfflineModal(summary)
showPrestigeModal()
showToast(text)
```

### `missions.js`

Funkcje:

```txt
syncMissionsWithCore()
recordOgrodyStat(key, value, mode)
checkMissionProgress(eventName, payload)
```

### `debug.js`

Funkcje:

```txt
renderDebug()
addDebugLeaves(amount)
addDebugWater(amount)
unlockDebugZone(zoneId)
forceDebugEvent(eventId)
resetDebugSave()
```

Aktywne tylko przy `?debug=1`.

## Integracja z menu głównym

Do głównego `index.html` dodać kartę:

```html
<a class="game-card" href="SowieOgrody/">
  <h2>Sowie Ogrody</h2>
  <p>Rozwijaj działkę, automatyzuj zbiory i wracaj po offline progress.</p>
</a>
```

Można też dodać ikonę ogrodu do pływających elementów menu.

## Integracja ze wspólnym profilem

Wspólny profil powinien dostać nowe statystyki:

```txt
ogrodyLeaves
ogrodyWater
ogrodyPrestige
ogrodyOfflineLeaves
ogrodyGardenLevel
```

Nowe kosmetyki do rozważenia:

| ID | Nazwa | Ikona |
|---|---|---|
| `wateringCan` | Konewka | 🪣 / rysowana konewka |
| `gardenGloves` | Rękawiczki ogrodnicze | 🧤 |
| `goldLeaf` | Złoty listek | 🍂 |
| `rubberBoots` | Kalosze | 🥾 |
| `sunHat` | Słomkowy kapelusz | 👒 |
| `tinyPot` | Mini doniczka | 🪴 |

## Balans czasowy MVP

Docelowe tempo pierwszej wersji:

- 0–1 min: pierwsza roślina,
- 2–3 min: pierwsza produkcja automatyczna,
- 5 min: balkon,
- 10–15 min: działka,
- 20–30 min: koza i offline progress zauważalny,
- 30–45 min: basen i humbak,
- 60–90 min: szklarnia,
- kilka sesji: centrum ogrodnicze,
- kilka dni lekkiej gry: pierwszy prestiż.

To są wartości startowe do testów, nie ostateczny balans.

## Tutorial

Tutorial powinien być lekki i nie blokować gry.

Kroki:

1. `Tapnij roślinę, żeby zebrać liście.`
2. `Kup pierwszą Monsterę.`
3. `Rośliny dają liście same.`
4. `Kup zraszacz, żeby przyspieszyć ogród.`
5. `Możesz zamknąć grę — sowa będzie trochę pracować offline.`
6. `Automatyzacja później zrobi klikanie za Ciebie.`
7. `Wielkie Przesadzanie odblokuje stałe bonusy.`

Każdy krok zapisuje się w `seenTutorials`.

## Responsywność

Gra ma dobrze działać na telefonie.

Desktop:

- canvas po lewej albo na środku,
- panel zakupów po prawej,
- HUD u góry.

Mobile:

- canvas na górze,
- HUD kompaktowy,
- panel jako dolna szuflada,
- duże przyciski kupna,
- brak hover-only interakcji.

## Dostępność

- wszystkie przyciski mają tekst,
- nie opierać ważnych informacji wyłącznie na kolorze,
- animacje da się ograniczyć przez `reducedEffects`,
- liczby i koszty muszą być czytelne,
- eventy aktywne nie mogą być jedyną drogą progresu.

## Testy i diagnostyka

### Tryb debug

Parametr:

```txt
?debug=1
```

Pokazuje:

- liście,
- LPS,
- wodę,
- WPS,
- aktualną strefę,
- mnożniki,
- aktywne eventy,
- czas do autosave,
- offline cap,
- prestige seed gain.

### Smoke testy

Do przygotowania:

```txt
SowieOgrody/tests/smoke.html
```

Testy ręczne:

1. nowy save startuje bez błędu,
2. kliknięcie dodaje liście,
3. zakup rośliny odejmuje liście,
4. LPS rośnie po zakupie,
5. autosave zapisuje dane,
6. reload przywraca dane,
7. offline progress nalicza się po zmianie timestampu,
8. zakup automatyzacji działa,
9. event złotego liścia daje nagrodę,
10. prestiż resetuje właściwe rzeczy i zostawia właściwe rzeczy.

## Ryzyka projektowe

### Za dużo systemów w pierwszej wersji

MVP musi mieć tylko fundament:

- kliknięcia,
- rośliny,
- LPS,
- zapis,
- offline progress,
- podstawowe ulepszenia,
- podstawowa automatyzacja.

Reszta może wejść iteracyjnie.

### Zły balans ekonomii

Incremental wymaga strojenia. Dane powinny być w `data.js`, a nie zaszyte w logice, żeby łatwo zmieniać koszty i produkcję.

### Kliki nadal wymagane w późnej grze

To byłby błąd. Automatyzacja musi stać się centralną nagrodą.

### Offline progress zbyt mocny

Jeżeli offline progress będzie za wysoki, gracz nie musi grać. Jeżeli za niski, powroty są rozczarowujące. Startowo dać 25–50% skuteczności, potem ulepszać.

### Konflikt z resetem postępu

Istniejący reset postępu nie powinien przypadkowo kasować `sowieOgrodySave`. Każdy przyszły reset musi świadomie uwzględniać lub pomijać tę grę.

## Kolejność prac

### Etap 0 — przygotowanie

1. Zatwierdzić tę specyfikację.
2. Ustalić, że MVP nie używa Firebase.
3. Ustalić nazwę katalogu: `SowieOgrody`.
4. Przygotować minimalną kartę w menu głównym dopiero wtedy, gdy gra ma działający ekran startowy.

### Etap 1 — szkielet gry

1. Utworzyć katalog `SowieOgrody/`.
2. Dodać `index.html`, `style.css`, `script.js`.
3. Podłączyć `shared/cute-ui.css`, `shared/sowie-core.js`, `shared/sowie-runtime.js`.
4. Dodać pusty canvas i podstawowy HUD.
5. Zarejestrować adapter gry w `SowieCore.registerGame`.
6. Dodać pauzę i obsługę modali.

Rezultat: gra się ładuje, pokazuje pusty ogród i nie wywala błędów.

### Etap 2 — zapis i stan gry

1. Dodać `data.js` z definicjami startowymi.
2. Dodać `save.js`.
3. Zaimplementować `createDefaultSave()`.
4. Zaimplementować `loadGame()` i `saveGame()`.
5. Dodać autosave.
6. Dodać obsługę `visibilitychange` i `pagehide`.
7. Dodać debugowy eksport/import save.

Rezultat: stan gry przetrwa reload.

### Etap 3 — podstawowy clicker

1. Kliknięcie w ogród dodaje liście.
2. HUD pokazuje liście.
3. Dodać pierwsze efekty cząsteczkowe.
4. Dodać pierwsze dźwięki przez `SowieCore.play`.
5. Dodać formatter liczb.

Rezultat: można ręcznie zbierać liście.

### Etap 4 — rośliny i LPS

1. Dodać panel `Rośliny`.
2. Zaimplementować koszt rośliny.
3. Zaimplementować zakup `Kup 1`, później `Kup 10` i `Kup max`.
4. Zaimplementować `calculateLeavesPerSecond()`.
5. Dodać tick produkcji.
6. Dodać wizualne rośliny na canvasie.

Rezultat: gra działa jako prosty incremental.

### Etap 5 — ulepszenia

1. Dodać panel `Ulepszenia`.
2. Dodać ulepszenia kliknięcia.
3. Dodać ulepszenia produkcji.
4. Dodać wymagania i blokady.
5. Dodać komunikaty po zakupie.

Rezultat: gracz ma pierwszą progresję decyzyjną.

### Etap 6 — strefy ogrodu

1. Dodać progi odblokowania stref.
2. Dodać tła: parapet, balkon, działka.
3. Dodać komunikat odblokowania.
4. Dodać zapis aktualnej strefy.
5. Dodać pierwsze dekoracje.

Rezultat: gra wizualnie rozwija się wraz z progresją.

### Etap 7 — offline progress

1. Zapisywać `lastSavedAt`.
2. Po wejściu obliczać offline progress.
3. Dodać limit offline.
4. Dodać modal odbioru offline progress.
5. Dodać statystyki offline.
6. Dodać ulepszenia zwiększające skuteczność offline.

Rezultat: idle działa po zamknięciu gry.

### Etap 8 — automatyzacja

1. Dodać panel `Automatyzacja`.
2. Dodać automatyczne zbiory.
3. Dodać auto-clicker.
4. Dodać automatyczne zbieranie złotych liści przez kozę.
5. Dodać automatyczne odbieranie dostaw.
6. Dodać podstawowe auto-buy dla roślin.

Rezultat: gra przestaje wymagać ręcznego klikania.

### Etap 9 — woda, basen i humbak

1. Dodać zasób wody.
2. Dodać basen jako odblokowanie.
3. Dodać humbaka.
4. Dodać produkcję wody.
5. Dodać event plusku.
6. Dodać ulepszenia wody.

Rezultat: gra ma drugi zasób i głębszą ekonomię.

### Etap 10 — eventy aktywne

1. Dodać złoty liść.
2. Dodać tęczowy liść.
3. Dodać Gorączkę monster.
4. Dodać kozę zjadającą chwasty.
5. Dodać dostawy Amic.
6. Dodać kontrakty Pracu Pracu.

Rezultat: aktywny gracz ma ciekawe okazje, ale idle nadal działa.

### Etap 11 — prestiż

1. Dodać próg prestiżu.
2. Dodać panel prestiżu.
3. Dodać obliczanie Nasion Prestiżu.
4. Dodać reset z zachowaniem właściwych danych.
5. Dodać ulepszenia prestiżowe.
6. Dodać efekty wizualne Wielkiego Przesadzania.

Rezultat: gra ma długoterminową pętlę incremental.

### Etap 12 — misje i wspólny profil

1. Dodać statystyki do `SowieCore`.
2. Dodać misje `SowieOgrody`.
3. Dodać kosmetyki ogrodowe.
4. Dodać postęp misji przy zakupach, eventach, offline progress i prestiżu.
5. Sprawdzić garderobę.

Rezultat: gra jest częścią całego ekosystemu `SowieGry`.

### Etap 13 — UI polish i mobile

1. Dopasować panel do telefonu.
2. Poprawić wielkość przycisków.
3. Dodać dolną szufladę na mobile.
4. Dodać status zapisu.
5. Poprawić czytelność dużych liczb.
6. Dodać `reducedEffects`.

Rezultat: gra jest wygodna na telefonie i desktopie.

### Etap 14 — balans

1. Przejść pierwsze 10 minut gry.
2. Przejść pierwszą godzinę gry.
3. Zasymulować 24h offline.
4. Sprawdzić, kiedy pojawia się pierwszy prestiż.
5. Skorygować koszty, produkcję i progi.
6. Dopisać komentarze w `data.js`, dlaczego wartości są takie, a nie inne.

Rezultat: progresja nie jest ani za szybka, ani zbyt wolna.

### Etap 15 — dokumentacja i testy

1. Dodać `SowieOgrody/docs/README.md`.
2. Dodać `SowieOgrody/docs/Documentation.md`.
3. Dodać smoke test.
4. Dodać instrukcję debugowania.
5. Sprawdzić `node --check` dla plików JS.
6. Zaktualizować dokumentację w `Analizy`, jeżeli w implementacji zmienią się założenia.

Rezultat: gra jest gotowa do dalszego rozwijania.

## Minimalne MVP do pierwszego commita gry

Pierwszy implementacyjny commit powinien zawierać tylko:

- katalog `SowieOgrody`,
- działający ekran gry,
- lokalny zapis,
- ręczne kliknięcia,
- liście,
- 3 rośliny,
- LPS,
- prosty panel zakupów,
- reload save,
- podstawowy renderer,
- integrację z `SowieCore`,
- dokumentację startową.

Nie dodawać jeszcze prestiżu, eventów i pełnej automatyzacji w pierwszym commicie, żeby ograniczyć ryzyko.

## Docelowa wersja 1.0

Wersja 1.0 powinna mieć:

- wszystkie główne strefy do szklarni,
- liście i wodę,
- offline progress,
- kilka poziomów automatyzacji,
- złote i tęczowe liście,
- Gorączkę monster,
- kozę,
- humbaka,
- dostawy Amic,
- kontrakty Pracu Pracu,
- prestiż,
- misje,
- kosmetyki,
- responsive UI,
- debug mode,
- dokumentację.

## Rekomendacja końcowa

Budować **Sowie Ogrody** jako pełnoprawną czwartą grę i pierwszy rozbudowany idle/incremental w repozytorium.

Najważniejsze dla projektu:

1. zacząć prosto,
2. bardzo szybko dodać trwały zapis,
3. potem dodać LPS i offline progress,
4. automatyzację traktować jako główną nagrodę,
5. prestiż dodać dopiero po stabilnej ekonomii,
6. nie używać Firebase w MVP,
7. wszystkie wartości ekonomii trzymać w danych, nie w logice.
