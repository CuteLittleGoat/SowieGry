# Sowia Szklarnia — pełny plan stworzenia gry

## 1. Cel dokumentu

Ten dokument opisuje kompletny plan stworzenia nowej gry w repozytorium `SowieGry`: **Sowia Szklarnia**.

Gra ma być utrzymana w stylu obecnych gier z repozytorium: lekka, przeglądarkowa, bez bundlera, z czytelnym i słodkim interfejsem `cute`. Mechanicznie ma przypominać uproszczonego, przyjaznego **Fallout Shelter**: gracz rozbudowuje wielopoziomową szklarnię, stawia pomieszczenia, rozwija produkcję, sadzi rośliny, krzyżuje gatunki i odpiera kozy podgryzające liście.

Najważniejszy wymóg techniczny: **stan gry musi zapisywać się między sesjami przeglądarki** przez `localStorage`.

## 2. Założenia wynikające z istniejącego repozytorium

Nowa gra powinna korzystać z istniejących wzorców projektu:

- osobny katalog gry w katalogu głównym repozytorium,
- osobny `index.html`, `style.css` i `script.js`,
- wspólny styl `../shared/cute-ui.css`,
- wspólne narzędzia z `../shared/sowie-core.js`,
- opcjonalny mały runtime pomocniczy, jeżeli gra będzie często zapisywać statystyki,
- integracja przez kartę w głównym `index.html`,
- zapis lokalny w `localStorage`, analogicznie do istniejącego `sowieOgrodySave`,
- interfejs responsywny: desktop dwukolumnowy, telefon jednokolumnowy,
- bez ciężkich zależności i bez backendu.

Planowana nazwa katalogu:

```txt
SowiaSzklarnia/
```

Planowany klucz zapisu:

```txt
sowiaSzklarniaSave
```

Planowany tytuł gry w menu:

```txt
Sowia Szklarnia
```

Opis do karty menu:

```txt
Buduj uroczą szklarnię, sadź rośliny, krzyżuj gatunki i przeganiaj kozy okrzykiem „SIO! SIO!”.
```

## 3. Fantazja gry

Gracz pomaga sowie prowadzić wielką, modułową szklarnię. Szklarnia jest pokazana z boku jako przekrój budynku z pokojami na kilku piętrach. Każde pomieszczenie ma funkcję: produkcja liści, produkcja wody, hodowla sadzonek, krzyżowanie gatunków, magazynowanie nasion, obrona przed kozami, relaks sowy albo automatyzacja.

Sowa chodzi między pomieszczeniami, dogląda roślin, podlewa, przenosi sadzonki i reaguje na zagrożenia. Kozy pojawiają się przy zewnętrznych krawędziach szklarni lub w losowych pomieszczeniach i zaczynają podgryzać liście. Gracz musi tapnąć/kliknąć kozę. Po kliknięciu sowa mówi:

```txt
SIO! SIO!
```

Po tym koza ucieka, zostawiając krótką animację pyłu, przestraszone oczy i opcjonalnie drobny bonus, np. odzyskane liście albo kompost.

## 4. Filary projektowe

1. **Czytelna rozbudowa** — gracz zawsze rozumie, gdzie może zbudować pomieszczenie, ile to kosztuje i co ono daje.
2. **Cute ponad realizm** — pastelowe kolory, miękkie karty, emoji/rysunkowe ikony, zabawne teksty i łagodna animacja.
3. **Idle + aktywne decyzje** — produkcja działa sama, ale kliknięcia, kozy, krzyżowanie i wybór pomieszczeń dają sens aktywnej grze.
4. **Mało chaosu na ekranie** — Fallout Shelter inspiruje układem, ale UI musi być prostsze, bardziej czytelne i dopasowane do telefonu.
5. **Zapis bez konta** — całość działa lokalnie i przetrwa odświeżenie oraz zamknięcie przeglądarki.
6. **Łatwa rozbudowa w przyszłości** — dane roślin, pomieszczeń, ulepszeń i kóz powinny być w tabelach konfiguracyjnych na początku `script.js`.

## 5. Docelowa struktura plików

```txt
SowiaSzklarnia/
  index.html
  style.css
  script.js
  szklarnia-runtime.js       opcjonalnie, tylko jeśli będzie potrzebny throttling statystyk
  docs/
    README.md                instrukcja gracza
    Documentation.md         dokumentacja techniczna implementacji
Analizy/
  Sowia-Szklarnia-plan.md    ten dokument projektowy
```

## 6. Architektura techniczna

Gra powinna być jednym modułem IIFE w `script.js`:

```js
(() => {
  "use strict";
  // stałe danych
  // stan gry
  // logika ekonomii
  // logika budowania
  // logika roślin i krzyżowania
  // logika kóz
  // renderer
  // event listenery
  // game loop
})();
```

Bez bundlera, bez importów ES module. Ładowanie przez zwykłe tagi `<script>`.

Kolejność ładowania w `SowiaSzklarnia/index.html`:

```html
<script src="../shared/progress-reset.js"></script>
<script src="../shared/sowie-smoke-hook.js"></script>
<link rel="stylesheet" href="../shared/cute-ui.css" />
<link rel="stylesheet" href="style.css" />
...
<script src="../shared/sowie-core.js"></script>
<script src="../shared/sowie-runtime.js"></script>
<script src="script.js"></script>
```

Jeżeli gra zacznie bardzo często wywoływać `SowieCore.recordStat`, dodać `szklarnia-runtime.js`, analogicznie do istniejącego runtime’u ogrodów.

## 7. Układ ekranu

### Desktop

Układ dwukolumnowy:

```txt
┌───────────────────────────────┬──────────────────────────┐
│ Widok szklarni / Canvas        │ Panel zarządzania        │
│                               │                          │
│ przekrój budynku              │ zakładki:                │
│ pokoje, sowa, rośliny, kozy   │ Budowa / Rośliny /       │
│                               │ Krzyżowanie / Kozy /     │
│ HUD zasobów                   │ Badania / Statystyki     │
└───────────────────────────────┴──────────────────────────┘
```

Lewy panel:

- tytuł gry,
- krótki log akcji,
- HUD zasobów,
- canvas z przekrojem szklarni,
- szybkie akcje.

Prawy panel:

- zakładki,
- karty akcji,
- listy pomieszczeń,
- lista roślin,
- krzyżowanie,
- obrona przed kozami,
- badania i statystyki.

### Mobile

Układ jednokolumnowy:

1. tytuł + log,
2. HUD zasobów w 2 lub 3 kolumnach,
3. canvas,
4. szybkie akcje,
5. zakładki i panel zarządzania pod spodem.

Panel zarządzania musi mieć ograniczoną wysokość i przewijanie, żeby canvas nie znikał całkowicie z ekranu.

## 8. Kierunek UI/UX — styl cute i czytelność

### Zasady wizualne

- Pastelowe tła: mięta, krem, jasny róż, jasny błękit.
- Miękkie, duże zaokrąglenia: 18–32 px.
- Karty z półprzezroczystym białym tłem.
- Subtelne cienie zamiast ostrych ramek.
- Ikony emoji lub proste rysunki canvasowe.
- Teksty krótkie, zabawne, ale informacyjne.
- Brak mrocznego survivalu — kozy są zagrożeniem, ale w tonie slapstickowym.

### Czytelność

Każda karta akcji powinna mieć stałą strukturę:

```txt
[ikona] Nazwa                         status/liczba
Opis w jednym lub dwóch zdaniach
Parametry: koszt, produkcja, wymagania
[przycisk akcji]
```

Przyciski:

- minimum 44 px wysokości,
- czytelny stan `disabled`,
- widoczny koszt,
- krótkie etykiety: `Buduj`, `Kup`, `Sadź`, `Krzyżuj`, `SIO!`, `Zapisz`.

Kolory stanu:

- dostępne: mięta/zielony akcent,
- niedostępne: półprzezroczyste, wyszarzone,
- zagrożenie kozą: różowo-żółty alert, ale nie agresywny czerwony,
- sukces: pastelowa zieleń,
- rzadki bonus: złoty/kremowy.

### Redukcja chaosu

Nie pokazywać wszystkich liczb naraz. Najważniejsze wartości w HUD:

- Liście,
- Liście/s,
- Woda,
- Nasiona,
- Poziom szklarni,
- Kozy albo ryzyko kóz.

Szczegółowe statystyki przenieść do zakładki `Statystyki`.

## 9. Główne zasoby

### Liście

Podstawowa waluta. Produkowane przez rośliny. Wydawane na budowę, sadzenie i część ulepszeń.

Pola stanu:

```js
leaves
lifetimeLeaves
currentRunLeaves
```

### Woda

Potrzebna do sadzenia, podlewania i krzyżowania. Produkowana przez pomieszczenia wodne.

Pola stanu:

```js
water
lifetimeWater
```

### Nasiona

Używane do sadzenia konkretnych gatunków i do krzyżowania. Mogą być zwykłe albo gatunkowe.

Pola stanu:

```js
seeds: {
  common: 0,
  monstera: 0,
  pilea: 0,
  fern: 0,
  hybrid: 0
}
```

### Pyłek

Zasób do krzyżowania i badań genetycznych. Produkowany przez dojrzałe rośliny albo specjalne pomieszczenia.

```js
pollen
```

### Kompost

Zasób pomocniczy. Przyspiesza wzrost, zmniejsza koszt roślin, czasem wypada po przegonieniu kozy.

```js
compost
```

### Radość sowy

Miękki zasób jakościowy. Wpływa na szybkość pracy sowy, obronę przed kozami i eventy cute.

```js
owlJoy
```

## 10. Mapa szklarni

Szklarnia jest siatką pomieszczeń.

Proponowany start:

```txt
piętra: 2
kolumny: 3
sloty startowe: 6
aktywny pokój startowy: 1 x Pusta Doniczarnia
```

Docelowy rozwój:

```txt
maks. piętra w MVP: 4
maks. kolumny w MVP: 6
maks. pokoje w MVP: 24
```

Każdy slot ma współrzędne:

```js
room = {
  id,
  type,
  x,
  y,
  level,
  builtAt,
  state,
  plants: [],
  assignedOwl: false,
  goat: null
}
```

W MVP nie trzeba mieć wielu sów. Wystarczy jedna sowa, która jest bohaterką gry i wizualnie przemieszcza się do aktywnych pokoi.

## 11. Typy pomieszczeń

### 11.1 Pusta Doniczarnia

Pokój startowy. Pozwala sadzić podstawowe rośliny.

Efekty:

- odblokowuje sadzenie Monstery i Pilei,
- produkuje mało liści,
- ma niskie ryzyko kozy.

### 11.2 Sala Upraw

Główne pomieszczenie produkcyjne.

Efekty:

- zwiększa limit roślin,
- zwiększa produkcję liści,
- umożliwia specjalizację: liściaste / kwitnące / egzotyczne.

### 11.3 Zraszalnia

Produkcja wody i automatyczne podlewanie.

Efekty:

- `waterPerSecond`,
- skrócenie czasu wzrostu,
- mniejsze ryzyko uschnięcia,
- odblokowanie akcji `Podlej wszystko`.

### 11.4 Sadzonkarnia

Produkcja nasion.

Efekty:

- pasywny przyrost `common seeds`,
- szansa na nasiona gatunkowe,
- bonus do rozmnażania roślin.

### 11.5 Krzyżówkarium

Pokój do krzyżowania gatunków.

Efekty:

- akcja `Krzyżuj`,
- lista par rodzicielskich,
- szansa na hybrydę,
- szansa na mutację cute.

### 11.6 Laboratorium Pyłku

Pokój badań nad genami roślin.

Efekty:

- produkcja pyłku,
- zwiększenie szansy na rzadkie cechy,
- odblokowanie badań.

### 11.7 Magazyn Nasion

Zwiększa limity zasobów.

Efekty:

- większy limit nasion,
- ochrona części nasion przed stratą przy zdarzeniach,
- lepszy offline progress.

### 11.8 Kompostownia

Produkuje kompost.

Efekty:

- pasywny `compostPerSecond`,
- przyspieszenie wzrostu,
- bonus po przegonieniu kozy.

### 11.9 Płotek Antykozi

Pokój/instalacja obronna.

Efekty:

- zmniejsza częstotliwość ataków kóz,
- wydłuża czas reakcji,
- zwiększa nagrodę za `SIO! SIO!`.

### 11.10 Sowie Centrum Dowodzenia

Pokój automatyzacji.

Efekty:

- auto-zbiory,
- auto-podlewanie,
- powiadomienia o kozach,
- kolejka sadzenia.

### 11.11 Kącik Drzemki Sowy

Pokój radości i offline progress.

Efekty:

- wzrost `owlJoy`,
- wyższa skuteczność offline,
- rzadsze negatywne eventy,
- cute animacje spania.

### 11.12 Szklarniowy Sklepik

Pokój ekonomiczny.

Efekty:

- sprzedawanie nadmiaru liści/nasion,
- losowe zamówienia,
- wymiana kompostu na nasiona.

## 12. Budowanie i ulepszanie pomieszczeń

### Budowanie

Funkcja budowy:

```js
function buildRoom(slotId, roomTypeId)
```

Warunki:

- slot istnieje,
- slot jest pusty,
- gracz ma zasoby,
- spełniono wymagania odblokowania,
- sąsiadujący slot jest zbudowany albo slot jest startowy.

Koszt:

```txt
cost = baseCost * builtCountMultiplier * floorMultiplier
```

Przykład:

```js
costLeaves = room.baseLeaves * Math.pow(1.18, builtRoomsOfType)
costWater = room.baseWater * Math.pow(1.12, floorIndex)
```

### Ulepszanie

Funkcja ulepszania:

```js
function upgradeRoom(roomId)
```

Efekty poziomów:

- poziom 1: podstawowa funkcja,
- poziom 2: +50% wydajności,
- poziom 3: dodatkowy slot rośliny albo dodatkowy efekt,
- poziom 4+: po MVP, dla dalszej rozbudowy.

Koszt:

```txt
upgradeCost = baseUpgradeCost * level ^ 2.2
```

### Przenoszenie i usuwanie

W MVP nie dodawać swobodnego przenoszenia pomieszczeń. Można dodać tylko:

- `Wyburz` po potwierdzeniu,
- zwrot 50% kosztu w liściach,
- brak zwrotu wody i pyłku.

## 13. Rośliny

Każda roślina ma:

```js
plant = {
  id,
  name,
  icon,
  family,
  rarity,
  baseLeafProduction,
  baseWaterNeed,
  growthTime,
  seedCost,
  pollenYield,
  goatAttraction,
  genes,
  unlock
}
```

### Rarity

```txt
common      zwykłe
uncommon    rzadsze
rare        rzadkie
hybrid      wynik krzyżowania
golden      specjalne, eventowe
```

### Proponowane rośliny startowe

1. **Monstera Miziasta**
   - rodzina: liściaste,
   - tania,
   - niska produkcja,
   - niskie ryzyko kozy.

2. **Pilea Pieniążek**
   - średnia produkcja,
   - dobra do ekonomii startowej.

3. **Paproć Puchata**
   - wymaga więcej wody,
   - produkuje pyłek.

4. **Alokazja Sówkowa**
   - wyższa produkcja,
   - większa atrakcyjność dla kóz.

5. **Kaktus Pracu**
   - niski koszt wody,
   - daje kompost,
   - wolny wzrost.

6. **Storczyk Pluskowy**
   - wymaga Zraszalni,
   - daje bonus do wody.

7. **Bonsai Drzemki**
   - wymaga Kącika Drzemki,
   - zwiększa offline progress.

8. **Złotolistka**
   - rzadka hybryda,
   - wysoka produkcja,
   - bardzo przyciąga kozy.

## 14. Sadzenie i wzrost

### Sadzenie

Funkcja:

```js
function plantSeed(roomId, plantId)
```

Warunki:

- pokój obsługuje rośliny,
- pokój ma wolny slot,
- gracz ma nasiona,
- gracz ma wymaganą wodę,
- roślina jest odblokowana.

Stan posadzonej rośliny:

```js
planted = {
  uid,
  plantId,
  roomId,
  plantedAt,
  growthProgress,
  mature,
  health,
  traits,
  protectedUntil
}
```

### Wzrost

W każdej klatce/ticku:

```txt
growth += delta * roomGrowthMultiplier * waterMultiplier * compostMultiplier
```

Etapy wzrostu:

```txt
0–33%      kiełek
34–66%     sadzonka
67–99%     prawie dojrzała
100%       dojrzała
```

Tylko dojrzałe rośliny produkują pełne liście. Niedojrzałe mogą produkować 10–30%.

### Zdrowie

W MVP zdrowie może być uproszczone:

- normalnie roślina ma `health = 100`,
- koza obniża zdrowie,
- brak wody może czasowo zmniejszyć produkcję,
- zdrowie poniżej 25 daje ikonę więdnięcia,
- roślina nie powinna permanentnie umierać w MVP, żeby gra nie była karząca.

## 15. Krzyżowanie gatunków

Krzyżowanie to główna głębsza mechanika gry.

### Akcja krzyżowania

Funkcja:

```js
function startCrossbreed(parentAUid, parentBUid)
```

Warunki:

- gracz ma Krzyżówkarium,
- obie rośliny są dojrzałe,
- rośliny nie są aktualnie użyte w innym krzyżowaniu,
- gracz ma pyłek i wodę,
- para jest dozwolona albo gracz ma badanie `swobodneKrzyzowanie`.

Koszt:

```txt
waterCost = 25 + rarityModifier
pollenCost = 10 + familyDistanceModifier
```

### Wynik

Funkcja:

```js
function resolveCrossbreed(crossbreedId)
```

Wynik może być:

- nasiona jednego z rodziców,
- nasiona hybrydy,
- rzadka mutacja,
- nieudane krzyżowanie z częściowym zwrotem pyłku,
- bardzo rzadko: złote nasiono.

### Geny

Każda roślina ma zestaw cech:

```js
traits = {
  leafShape: "round" | "heart" | "star" | "big",
  color: "green" | "mint" | "pink" | "gold",
  waterNeed: "low" | "normal" | "high",
  goatSmell: "boring" | "tasty" | "irresistible",
  growth: "slow" | "normal" | "fast"
}
```

Cechy wpływają na:

- produkcję liści,
- zapotrzebowanie na wodę,
- czas wzrostu,
- atrakcyjność dla kóz,
- wartość sprzedaży,
- opis i kolor rośliny na canvasie.

### Prosty algorytm dziedziczenia

```txt
60% szansy na cechę jednego z rodziców
25% szansy na cechę pośrednią
10% szansy na mutację pozytywną
5% szansy na mutację śmieszną/neutralną
```

### Przykładowe hybrydy

1. Monstera + Pilea = **Monpilea Przytulna**
2. Paproć + Alokazja = **Alopaproć Wachlarzowa**
3. Kaktus + Storczyk = **Kaktorchid Pluskowy**
4. Bonsai + Złotolistka = **Drzewko Sennych Liści**
5. Monstera + Złotolistka = **Monstera Złotobrzuszna**

## 16. Mechanika kóz

Kozy są głównym zagrożeniem, ale mają być zabawne, nie frustrujące.

### Pojawianie się kozy

Funkcja:

```js
function spawnGoat()
```

Koza może pojawić się:

- przy zewnętrznej ścianie szklarni,
- przy pokoju z najwyższą produkcją liści,
- przy roślinie o wysokim `goatAttraction`,
- jako event specjalny podczas offline progress.

Częstotliwość:

```txt
baseInterval = 45–90 sekund
modyfikatory:
+ więcej dojrzałych roślin = częściej
+ więcej smacznych cech = częściej
- płotek antykozi = rzadziej
- radość sowy = sowa szybciej reaguje
```

### Stan kozy

```js
goat = {
  id,
  roomId,
  x,
  y,
  state: "entering" | "nibbling" | "fleeing",
  targetPlantUid,
  nibbleProgress,
  damagePerSecond,
  createdAt,
  fleeUntil
}
```

### Podgryzanie liści

Podczas stanu `nibbling`:

```txt
lostLeaves = damagePerSecond * delta
plant.health -= healthDamage * delta
```

Strata nie powinna być zbyt bolesna:

- w early game maks. kilkanaście sekund produkcji,
- w mid game maks. 1–3 minuty produkcji,
- nigdy nie kasować całego postępu.

### Kliknięcie/tapnięcie kozy

Funkcja:

```js
function scareGoat(goatId)
```

Efekt:

1. zatrzymuje podgryzanie,
2. ustawia `goat.state = "fleeing"`,
3. pokazuje dymek sowy:

```txt
SIO! SIO!
```

4. odpala dźwięk kozy albo akcji,
5. dodaje cząsteczki ucieczki,
6. daje małą nagrodę.

Nagrody:

```txt
70% odzyskane liście
20% kompost
8% zwykłe nasiona
2% rzadkie nasiono albo trait „kozo-odporna”
```

### Brak reakcji gracza

Jeśli gracz nie reaguje:

- koza po pewnym czasie ucieka sama,
- roślina traci zdrowie,
- gracz dostaje wpis w logu: `Koza podgryzła liście i uciekła z miną niewiniątka.`

Nie karać gracza zbyt mocno. Gra ma pozostać cute.

### Automatyczna obrona

Późniejsze ulepszenia:

- `Dzwoneczek SIO` — ostrzeżenie i dłuższy czas reakcji,
- `Płotek z kokardką` — mniej kóz,
- `Sowie spojrzenie` — część kóz ucieka automatycznie,
- `Kozi negocjator` — kozy czasem zostawiają kompost bez szkód.

## 17. Produkcja i ekonomia

### Liście/s

```txt
leavesPerSecond = suma produkcji dojrzałych roślin * roomMultiplier * globalMultiplier * happinessMultiplier * goatPenalty
```

### Produkcja rośliny

```txt
plantProduction = baseLeafProduction
  * maturityMultiplier
  * traitMultiplier
  * roomLevelMultiplier
  * waterStatusMultiplier
```

### Woda/s

```txt
waterPerSecond = suma produkcji Zraszalni + bonusy roślin wodnych + badania
```

### Pyłek/s

```txt
pollenPerSecond = dojrzałe rośliny pyłkowe + Laboratorium Pyłku
```

### Kompost/s

```txt
compostPerSecond = Kompostownia + bonusy z Kaktusa Pracu + nagrody po kozach
```

### Offline progress

Po wejściu do gry:

```js
function applyOfflineProgress() {
  const elapsed = Date.now() - state.lastSavedAt;
  const used = Math.min(elapsed, offlineCap);
  // dodać liście, wodę, pyłek, kompost i wzrost roślin
}
```

Offline progress powinien:

- naliczać zasoby,
- przesuwać wzrost roślin,
- ograniczać liczbę zdarzeń kóz do małego podsumowania,
- pokazywać modal: `Sowa doglądała szklarni przez X`.

Kozy offline:

- nie powinny niszczyć wielu roślin,
- mogą obniżyć część zysku offline,
- Płotek Antykozi zmniejsza stratę,
- Kącik Drzemki zwiększa szansę, że sowa sama przegoniła kozy.

## 18. Badania i ulepszenia

Badania są stałym albo półstałym drzewkiem progresji. W MVP mogą nie resetować się w ogóle.

### Gałęzie badań

#### Botanika

- szybszy wzrost,
- większa produkcja liści,
- większa szansa na hybrydy,
- odblokowanie rzadkich gatunków.

#### Hydraulika cute

- więcej wody,
- automatyczne podlewanie,
- większy limit wody,
- mniejsze koszty krzyżowania.

#### Antykozia taktyka

- rzadsze kozy,
- szybsze `SIO! SIO!`,
- automatyczne odstraszanie,
- bonusy za przegonienie kóz.

#### Organizacja sowy

- auto-zbiory,
- auto-sadzenie,
- kolejka krzyżowania,
- offline progress.

## 19. Zakładki panelu zarządzania

### Budowa

Zawartość:

- siatka dostępnych pomieszczeń,
- koszt,
- wymagania,
- liczba zbudowanych pokoi,
- przyciski budowy i ulepszania.

### Rośliny

Zawartość:

- lista gatunków,
- liczba nasion,
- produkcja,
- wymagania,
- przycisk `Sadź`,
- filtr: wszystkie / dostępne / hybrydy.

### Krzyżowanie

Zawartość:

- wybór dwóch roślin rodzicielskich,
- przewidywane szanse,
- koszt pyłku i wody,
- kolejka trwających krzyżowań,
- historia odkrytych hybryd.

### Kozy

Zawartość:

- aktywne zagrożenia,
- ryzyko kolejnej kozy,
- poziom obrony,
- statystyki: przegonione, stracone liście, odzyskany kompost,
- ulepszenia antykozie.

### Badania

Zawartość:

- drzewka badań,
- koszt w liściach, pyłku, kompoście,
- status badań,
- efekty.

### Statystyki

Zawartość:

- lifetime leaves,
- best leaves/s,
- liczba zbudowanych pomieszczeń,
- odkryte hybrydy,
- przegonione kozy,
- największa szklarnia,
- czas gry,
- offline zysk.

## 20. Model stanu gry

Proponowany stan:

```js
const VERSION = 1;
const KEY = "sowiaSzklarniaSave";

function defaultSave() {
  const now = Date.now();
  return {
    version: VERSION,
    createdAt: now,
    lastSavedAt: now,
    leaves: 0,
    water: 0,
    seeds: { common: 5 },
    pollen: 0,
    compost: 0,
    owlJoy: 50,
    lifetimeLeaves: 0,
    lifetimeWater: 0,
    rooms: [],
    grid: {
      floors: 2,
      columns: 3,
      unlockedSlots: ["0:0", "1:0", "2:0"]
    },
    plants: [],
    discoveredPlants: ["monstera", "pilea"],
    hybrids: {},
    crossbreeds: [],
    goats: [],
    upgrades: {},
    research: {},
    automation: {
      autoHarvest: false,
      autoWater: false,
      autoScareGoats: false,
      autoPlant: false
    },
    effects: {},
    stats: {
      clicks: 0,
      roomsBuilt: 0,
      plantsPlanted: 0,
      plantsCrossbred: 0,
      hybridsDiscovered: 0,
      goatsScared: 0,
      leavesLostToGoats: 0,
      offlineLeaves: 0,
      bestLps: 0
    },
    achievements: {}
  };
}
```

## 21. Zapis i migracje

### Funkcje zapisu

```js
function load()
function save(reason = "auto")
function queueSave(reason = "auto")
function mergeSave(raw)
function exportSave()
function importSave(json)
function resetSave()
```

### Zasady

- `save()` zapisuje cały stan w `localStorage`.
- `queueSave()` opóźnia zapis o 200–300 ms, żeby nie spamować `localStorage`.
- Autosave co 5–10 sekund oraz po ważnych akcjach.
- Manualny przycisk `Zapisz teraz` w zakładce statystyk albo ustawień.
- `mergeSave()` musi uzupełniać brakujące pola po aktualizacjach wersji.
- Nie kasować zapisu bez potwierdzenia modalem.

### Obsługa błędu zapisu

Jeśli `localStorage.setItem` rzuci wyjątek:

- pokazać w HUD `Błąd zapisu`,
- dodać toast/log,
- gra nadal działa w pamięci.

## 22. Lista głównych funkcji implementacji

### Inicjalizacja

```js
init()
cacheDom()
bindEvents()
resizeCanvas()
startLoop()
```

### Stan i zapis

```js
defaultSave()
mergeSave(raw)
load()
save(reason)
queueSave(reason)
applyOfflineProgress()
exportSave()
importSave(json)
resetSave()
```

### Formatowanie i pomocnicze

```js
formatNumber(value)
formatTime(seconds)
clamp(value, min, max)
uid(prefix)
randomBetween(min, max)
weightedChoice(items)
```

### Ekonomia

```js
metrics()
addLeaves(amount)
addWater(amount)
addSeeds(seedId, amount)
addPollen(amount)
addCompost(amount)
spendCost(cost)
canAfford(cost)
```

### Budowa

```js
roomById(id)
roomTypeById(id)
slotById(slotId)
canBuildRoom(slotId, roomTypeId)
buildRoom(slotId, roomTypeId)
canUpgradeRoom(roomId)
upgradeRoom(roomId)
demolishRoom(roomId)
unlockGridSlot(slotId)
```

### Rośliny

```js
plantTypeById(id)
plantedByUid(uid)
canPlantSeed(roomId, plantId)
plantSeed(roomId, plantId)
removePlant(uid)
updatePlantGrowth(delta)
plantProduction(planted)
plantWaterNeed(planted)
plantGoatAttraction(planted)
```

### Krzyżowanie

```js
canCrossbreed(parentAUid, parentBUid)
startCrossbreed(parentAUid, parentBUid)
updateCrossbreeds(delta)
resolveCrossbreed(crossbreedId)
rollHybrid(parentA, parentB)
rollTraits(parentA, parentB)
unlockHybrid(plantId)
```

### Kozy

```js
scheduleNextGoat()
spawnGoat()
chooseGoatTarget()
updateGoats(delta)
applyGoatDamage(goat, delta)
scareGoat(goatId)
resolveGoatEscape(goatId)
goatRiskScore()
```

### Badania i ulepszenia

```js
researchById(id)
canBuyResearch(id)
buyResearch(id)
upgradeById(id)
canBuyUpgrade(id)
buyUpgrade(id)
```

### Renderer i UI

```js
render()
renderHud()
renderTabs()
renderBuildPanel()
renderPlantsPanel()
renderCrossbreedPanel()
renderGoatsPanel()
renderResearchPanel()
renderStatsPanel()
renderCanvas(delta)
drawGreenhouse()
drawRoom(room)
drawPlant(planted)
drawOwl()
drawGoat(goat)
drawSpeechBubble(text, x, y)
pop(text, x, y, color)
burst(x, y, count, color)
log(message)
```

### Eventy użytkownika

```js
handleCanvasClick(event)
handlePanelClick(event)
handleTabClick(event)
handleKeyboard(event)
```

## 23. Renderer Canvas

Canvas ma pokazywać przekrój szklarni.

Warstwy rysowania:

1. pastelowe tło,
2. zewnętrzna bryła szklarni,
3. siatka pięter i pokoi,
4. wnętrza pomieszczeń,
5. rośliny,
6. sowa,
7. kozy,
8. cząsteczki,
9. dymki tekstowe,
10. alerty.

### Pomieszczenia

Każdy typ pokoju powinien mieć prosty motyw:

- Doniczarnia: doniczki i półki,
- Zraszalnia: krople i rurki,
- Krzyżówkarium: serduszka, pyłek, dwie doniczki,
- Laboratorium: probówki, ale cute,
- Kompostownia: worek kompostu i robaczek,
- Płotek Antykozi: mini płotek i kokardka,
- Kącik Drzemki: poduszka i księżyc,
- Sklepik: kasa i liście.

### Sowa

Sowa powinna:

- być czytelna nawet w małym rozmiarze,
- mieć duże oczy,
- reagować animacją na kliknięcie,
- iść albo przeskakiwać do aktywnego pokoju,
- przy kozie pokazywać dymek `SIO! SIO!`.

### Koza

Koza powinna:

- mieć niewinną minę,
- podczas podgryzania poruszać pyszczkiem,
- po kliknięciu uciekać w bok,
- zostawiać pyłek/kurz i ewentualnie kompost.

## 24. Dźwięki i feedback

Używać istniejącego `SowieCore.play`, jeśli dostępne.

Proponowane akcje:

- sadzenie: `leaf` albo delikatny pop,
- podlewanie: `splash`,
- krzyżowanie: `unlock`,
- odkrycie hybrydy: `mission` albo `combo`,
- koza: `goat`,
- `SIO! SIO!`: krótki toast/log + dymek.

Nie wymagać dźwięków do zrozumienia gry. Wszystko musi być też widoczne tekstowo.

## 25. Osiągnięcia

Proponowane osiągnięcia lokalne:

1. `Pierwsza doniczka` — posadź pierwszą roślinę.
2. `Mała architektka` — zbuduj 5 pomieszczeń.
3. `SIO! SIO!` — przegoń pierwszą kozę.
4. `Kozy mnie nie ruszają` — przegoń 25 kóz.
5. `Sowie Mendelki` — wykonaj pierwsze krzyżowanie.
6. `Hybryda!` — odkryj pierwszą hybrydę.
7. `Szklarnia marzeń` — odblokuj 4 piętra.
8. `Drzemka produkcyjna` — odbierz offline progress po min. 2 godzinach.
9. `Złote listki` — odkryj Złotolistkę.
10. `Botaniczna legenda` — odkryj wszystkie rośliny MVP.

## 26. Balans MVP

### Pierwsze 5 minut

- gracz sadzi Monsterę,
- zbiera liście,
- buduje drugą Doniczarnię albo Zraszalnię,
- pojawia się pierwsza koza,
- gracz klika kozę i widzi `SIO! SIO!`,
- gra zapisuje się i działa po odświeżeniu.

### 5–20 minut

- odblokowanie Sadzonkarni,
- pierwsze nasiona gatunkowe,
- pierwsza rozbudowa siatki,
- pierwsze ulepszenie pokoju,
- wzrost ryzyka kóz,
- pierwszy Płotek Antykozi.

### 20–60 minut

- Krzyżówkarium,
- pierwsze hybrydy,
- badania,
- automatyczne podlewanie,
- offline progress zaczyna mieć znaczenie.

### Po 60 minutach

- większa szklarnia,
- automatyzacja,
- kolekcjonowanie hybryd,
- polowanie na rzadkie cechy,
- optymalizacja pokoi.

## 27. Minimalny zakres MVP

MVP powinien zawierać:

- katalog `SowiaSzklarnia/`,
- ekran gry z canvasem i panelem,
- zapis/odczyt z `localStorage`,
- HUD zasobów,
- budowanie pomieszczeń,
- minimum 6 typów pomieszczeń,
- minimum 6 gatunków roślin,
- sadzenie i wzrost roślin,
- produkcję liści i wody,
- prosty system nasion,
- pierwszą wersję krzyżowania,
- kozy podgryzające liście,
- kliknięcie kozy z dymkiem `SIO! SIO!`,
- offline progress,
- zakładki panelu,
- responsywne UI,
- integrację z głównym menu,
- ręczne testy opisane w dokumentacji.

Poza MVP:

- prestiż,
- wiele sów/pracowników,
- rozbudowana genetyka,
- zamówienia sklepiku,
- sezonowe eventy,
- import/eksport save’a,
- bardziej zaawansowana automatyzacja.

## 28. Etapy prac

### Etap 1 — szkielet gry

- Utworzyć `SowiaSzklarnia/index.html`.
- Utworzyć `SowiaSzklarnia/style.css`.
- Utworzyć `SowiaSzklarnia/script.js`.
- Podłączyć `cute-ui.css`, `sowie-core.js`, `sowie-runtime.js`.
- Dodać kartę gry do głównego `index.html`.
- Zrobić podstawowy layout desktop/mobile.
- Zrobić pusty canvas z tłem szklarni.

Kryterium gotowości:

- gra otwiera się z menu,
- layout jest czytelny,
- nie ma błędów w konsoli.

### Etap 2 — zapis i podstawowe zasoby

- Dodać `defaultSave`, `load`, `save`, `queueSave`, `mergeSave`.
- Dodać HUD zasobów.
- Dodać ręczne zbieranie liści.
- Dodać autosave.
- Dodać manualny zapis.
- Dodać prosty offline progress dla liści.

Kryterium gotowości:

- liście zostają po odświeżeniu,
- offline progress nalicza zasoby,
- HUD pokazuje stan zapisu.

### Etap 3 — mapa i budowanie pomieszczeń

- Zaimplementować siatkę szklarni.
- Dodać typy pomieszczeń.
- Dodać panel `Budowa`.
- Dodać `buildRoom` i `upgradeRoom`.
- Narysować pokoje na canvasie.
- Dodać koszty i wymagania.

Kryterium gotowości:

- gracz może budować pokoje,
- pokoje wpływają na produkcję,
- pokoje są widoczne i czytelne.

### Etap 4 — rośliny i wzrost

- Dodać dane roślin.
- Dodać panel `Rośliny`.
- Dodać sadzenie.
- Dodać wzrost w czasie.
- Dodać produkcję liści.
- Narysować rośliny w pokojach.

Kryterium gotowości:

- posadzone rośliny rosną,
- dojrzałe rośliny produkują liście,
- produkcja jest widoczna w HUD.

### Etap 5 — woda, nasiona, pyłek i kompost

- Dodać produkcję wody.
- Dodać zużycie wody przy sadzeniu.
- Dodać produkcję nasion.
- Dodać pyłek.
- Dodać kompost.
- Dodać podstawowe zależności między pokojami.

Kryterium gotowości:

- zasoby mają sens ekonomiczny,
- gracz rozumie, czego mu brakuje,
- karty pokazują wymagania.

### Etap 6 — kozy i `SIO! SIO!`

- Dodać harmonogram pojawiania się kóz.
- Dodać wybór celu kozy.
- Dodać podgryzanie liści.
- Dodać kliknięcie kozy.
- Dodać dymek `SIO! SIO!`.
- Dodać animację ucieczki.
- Dodać małe nagrody.
- Dodać zakładkę `Kozy`.

Kryterium gotowości:

- koza pojawia się i szkodzi,
- kliknięcie ją przegania,
- sowa mówi `SIO! SIO!`,
- gra pozostaje zabawna, a nie frustrująca.

### Etap 7 — krzyżowanie

- Dodać Krzyżówkarium.
- Dodać wybór rodziców.
- Dodać prosty algorytm cech.
- Dodać kolejkę krzyżowań.
- Dodać odkrywanie hybryd.
- Dodać historię odkryć.

Kryterium gotowości:

- gracz może wybrać dwie rośliny,
- krzyżowanie kosztuje zasoby,
- wynik trafia do nasion albo odkrytych hybryd.

### Etap 8 — badania i automatyzacja

- Dodać panel `Badania`.
- Dodać gałęzie badań.
- Dodać auto-zbiory.
- Dodać auto-podlewanie.
- Dodać antykozie ulepszenia.
- Dodać lepszy offline progress.

Kryterium gotowości:

- gracz ma średnioterminowe cele,
- automatyzacja zmniejsza klikanie,
- rozwój jest czytelny.

### Etap 9 — polerka UI cute

- Ujednolicić karty.
- Poprawić spacing na telefonie.
- Dodać animacje hover/active.
- Dodać toasty/logi.
- Dodać pływające teksty.
- Sprawdzić kontrast i rozmiary fontów.
- Upewnić się, że zakładki nie są przeładowane.

Kryterium gotowości:

- UI jest przejrzysty,
- styl jest słodki i spójny z repo,
- wszystkie akcje są zrozumiałe bez instrukcji.

### Etap 10 — dokumentacja i testy

- Dodać `SowiaSzklarnia/docs/README.md`.
- Dodać `SowiaSzklarnia/docs/Documentation.md`.
- Opisać stan gry i funkcje.
- Dodać checklistę ręcznych testów.
- Przejść testy na desktopie i telefonie.

Kryterium gotowości:

- dokumentacja pozwala wrócić do projektu po czasie,
- wszystkie główne flow są przetestowane.

## 29. Ręczne testy akceptacyjne

1. Gra otwiera się z głównego menu.
2. Layout jest czytelny na desktopie.
3. Layout jest czytelny na telefonie.
4. HUD pokazuje liście, wodę, nasiona i zapis.
5. Kliknięcie podstawowej akcji dodaje liście.
6. Można zbudować pierwsze pomieszczenie.
7. Nie można budować bez zasobów.
8. Można posadzić roślinę.
9. Roślina rośnie w czasie.
10. Dojrzała roślina produkuje liście.
11. Woda jest produkowana i zużywana.
12. Nasiona są produkowane i zużywane.
13. Koza pojawia się przy roślinie.
14. Koza zmniejsza zysk albo zdrowie rośliny.
15. Kliknięcie kozy pokazuje `SIO! SIO!`.
16. Koza po kliknięciu ucieka.
17. Po przegonieniu kozy gracz dostaje małą nagrodę.
18. Krzyżowanie dwóch roślin startuje poprawnie.
19. Krzyżowanie kończy się wynikiem.
20. Odkryta hybryda zostaje w zapisie.
21. Save przetrwa reload strony.
22. Offline progress działa po przerwie.
23. Reset zapisu wymaga potwierdzenia.
24. Nie ma błędów w konsoli podczas normalnej gry.
25. Przyciski disabled są czytelne i wyjaśniają wymagania.

## 30. Ryzyka projektowe i rozwiązania

### Ryzyko: UI będzie zbyt zatłoczone

Rozwiązanie:

- ograniczyć HUD do najważniejszych liczb,
- używać zakładek,
- stosować krótkie opisy,
- szczegóły przenieść do `Statystyki`.

### Ryzyko: krzyżowanie będzie zbyt skomplikowane

Rozwiązanie:

- w MVP użyć prostych par i prostych szans,
- geny pokazywać jako 2–3 czytelne cechy,
- pełną genetykę zostawić na później.

### Ryzyko: kozy będą frustrujące

Rozwiązanie:

- niskie straty,
- szybka reakcja gracza,
- nagroda po przegonieniu,
- automatyczna obrona w mid game.

### Ryzyko: localStorage będzie zbyt często zapisywany

Rozwiązanie:

- `queueSave` z debounce,
- autosave co kilka sekund,
- zapis natychmiastowy tylko po ważnych akcjach.

### Ryzyko: canvas będzie nieczytelny na telefonie

Rozwiązanie:

- ograniczyć liczbę jednocześnie widocznych detali,
- powiększyć pokoje,
- dodać uproszczony zoom/skalowanie,
- nie rysować mikrotekstów na canvasie.

## 31. Notatki stylistyczne do tekstów w grze

Logi i komunikaty powinny być krótkie, przyjazne i zabawne.

Przykłady:

```txt
Sowa zasadziła Monsterę Miziastą.
Pilea rośnie jak marzenie.
Koza wygląda podejrzanie niewinnie.
SIO! SIO!
Koza uciekła, ale zostawiła kompost. Podejrzane.
Nowa hybryda odkryta!
Sowa doglądała szklarni podczas Twojej nieobecności.
```

Unikać długich komunikatów technicznych w głównym logu. Szczegóły mogą być w panelach.

## 32. Podsumowanie

**Sowia Szklarnia** powinna być większą, bardziej przestrzenną wersją idei ogrodowej: zamiast prostego idle ogrodu gracz dostaje uroczą, modułową szklarnię z pokojami, roślinami i systemem krzyżowania. Kluczowe jest zachowanie czytelności. Inspiracja Fallout Shelter ma dotyczyć głównie przekroju budynku, rozbudowy pomieszczeń i zarządzania produkcją, ale ton i UI muszą pozostać lekkie, pastelowe i `cute`.

Najważniejszy moment emocjonalny gry: koza podgryza liście, gracz ją klika, sowa woła **„SIO! SIO!”**, a koza ucieka. Ten motyw powinien być dopracowany wizualnie i mechanicznie już w MVP.
