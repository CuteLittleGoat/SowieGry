# Sowie Ogrody — koncepcja kolejnej gry

## Decyzja projektowa

Kolejna gra w repozytorium `SowieGry` powinna być bardziej rozbudowana niż dotychczasowe gry zręcznościowe i powinna wspierać trwały zapis postępu.

Ponieważ gra jest przeznaczona do użytku jednej osoby, **Firebase nie jest potrzebny w pierwszej wersji**. Zapis lokalny w `localStorage` wystarczy jako rozwiązanie MVP. Firebase albo inny zapis chmurowy można zostawić jako opcję na przyszłość, gdyby pojawiła się potrzeba synchronizacji między urządzeniami, backupu online albo kont użytkowników.

Rekomendowana nazwa gry: **Sowie Ogrody**.

## Dlaczego incremental / idle

Obecne gry w `SowieGry` są przede wszystkim zręcznościowe:

- `SowaRunner` — endless runner,
- `SowaJumper` — gra platformowa / skakanie w górę,
- `Sowa3` — trzytorowy runner wgłąb ekranu.

Nowa gra powinna uzupełnić kolekcję innym typem doświadczenia. Incremental / idle daje:

- dłuższy rozwój niż pojedyncza rozgrywka,
- powód do wracania do gry,
- sensowny trwały zapis postępu,
- możliwość rozbudowanej ekonomii,
- miejsce na misje, odblokowania i kosmetyki,
- prostszą obsługę dla jednej osoby, bez potrzeby backendu.

## Pitch

**Sowie Ogrody** to cute incremental / idle management game, w którym sowa zakłada ogródek, szklarnię i działkę pełną monster, kóz, humbaków oraz dziwnych dostaw. Gracz zbiera liście, kupuje ulepszenia, odblokowuje kolejne strefy ogrodu, wraca po offline progress i robi „Wielkie Przesadzanie”, żeby zacząć od nowa z mocniejszymi bonusami.

## Główna fantazja gry

Sowa zaczyna od jednej małej doniczki na parapecie. Z czasem rozwija coraz większy ogród:

1. parapet,
2. balkon,
3. działka,
4. szklarnia,
5. sowie centrum ogrodnicze.

Świat powinien wykorzystywać motywy znane z pozostałych gier:

- sowa,
- liście monster,
- kozy,
- humbak,
- basen,
- Amic,
- Pracu Pracu,
- garderoba i kosmetyki,
- humorystyczne komunikaty.

## Podstawowa pętla rozgrywki

1. Gracz zbiera liście ręcznie przez tapnięcie / kliknięcie.
2. Za liście kupuje rośliny i ulepszenia.
3. Rośliny produkują coraz więcej liści na sekundę.
4. Ulepszenia automatyzują zbieranie.
5. Gracz odblokowuje nowe strefy ogrodu.
6. Gra zapisuje postęp.
7. Po powrocie gracz otrzymuje produkcję offline.
8. Po dużym postępie może wykonać prestiż, czyli „Wielkie Przesadzanie”.

## Waluty i zasoby

### Liście

Podstawowa waluta gry. Służy do kupowania roślin, prostych ulepszeń i pierwszych automatyzacji.

### Woda / plusk

Drugi zasób, odblokowywany po pojawieniu się basenu albo humbaka. Służy do szybszego wzrostu roślin, specjalnych ulepszeń i aktywowania krótkich boostów.

### Nasiona prestiżu

Waluta prestiżowa zdobywana po „Wielkim Przesadzaniu”. Daje stałe mnożniki i odblokowuje nowe mechaniki.

## Widok gry

Gra może działać jako Canvas 2D.

Proponowany widok:

- lekko izometryczna albo boczna działka,
- na dole: doniczki, grządki, szklarnia, basen, koza, sowa, skrzynki i dekoracje,
- na górze: HUD z zasobami,
- po prawej albo na dole: panel zakupów i ulepszeń,
- przyciski wspólnego UI: pauza, garderoba, misje, ustawienia.

## HUD

HUD powinien pokazywać:

- liczbę liści,
- liście na sekundę,
- wodę / plusk,
- poziom ogrodu,
- status zapisu, np. `Zapisano`, `Zapisywanie...`, `Błąd zapisu`,
- ewentualnie licznik offline progress po powrocie.

## Strefy rozwoju

### 1. Parapet

Pierwsza strefa. Jedna doniczka i ręczne zbieranie liści.

Mechaniki:

- kliknięcie/tapnięcie daje liście,
- pierwsze ulepszenia zwiększają wartość kliknięcia,
- pojawia się pierwsza automatyczna doniczka.

### 2. Balkon

Więcej miejsca i pierwsze automaty.

Mechaniki:

- kilka doniczek,
- zraszacz,
- prosty mnożnik produkcji,
- dekoracje balkonowe.

### 3. Działka

Główna estetyka gry.

Mechaniki:

- grządki,
- koza ogrodniczka,
- basen,
- proste eventy,
- większe ulepszenia produkcji.

### 4. Szklarnia

Etap, w którym gra staje się pełnym incrementalem.

Mechaniki:

- automatyczne zbiory,
- mnożniki produkcji,
- specjalne rośliny,
- woda jako ważny zasób,
- dłuższy offline progress.

### 5. Sowie centrum ogrodnicze

Późna gra.

Mechaniki:

- prestiż,
- dostawy Amic,
- kontrakty Pracu Pracu,
- wysokopoziomowe ulepszenia,
- duże liczby,
- kosmetyczne dekoracje ogrodu.

## Ulepszenia

Przykładowe ulepszenia:

### Doniczki

Zwiększają bazową produkcję liści.

### Zraszacze

Dają automatyczne zbiory i zwiększają produkcję offline.

### Kozy ogrodniczki

Czasem zjadają chwasty i dają bonus do produkcji albo jednorazowy zastrzyk liści.

### Humbak w basenie

Produkuje wodę / plusk. Może okresowo aktywować bonus `Plusk!`, który zwiększa produkcję.

### Dostawy Amic

Okresowe paczki z nawozem, energią i dekoracjami. Mogą działać jak losowy wybór jednej z trzech nagród.

### Pracu Pracu

Ryzykowny kontrakt. Przez krótki czas zwiększa produkcję, ale może zmniejszyć efektywność kliknięć albo zablokować część automatyzacji. Powinien być humorystyczny, nie frustrujący.

## Aktywne mini-zdarzenia

Żeby gra nie była wyłącznie pasywna, warto dodać krótkie aktywności:

- złapanie spadającego złotego liścia,
- kliknięcie humbaka w momencie plusku,
- przepędzenie Pracu Pracu,
- nakarmienie kozy,
- wybór jednej z trzech dostaw Amic,
- krótkie okno `Gorączki monster`, podczas którego liście lecą szybciej.

## Offline progress

Gra powinna zapisywać timestamp ostatniego zapisu.

Po powrocie oblicza:

```txt
offlineSeconds = now - lastSavedAt
zarobek = productionPerSecond * offlineSeconds * offlineMultiplier
```

Warto wprowadzić limit, np. 8 godzin offline progress w podstawowej wersji. Ulepszenia mogą zwiększać ten limit.

Komunikat po powrocie:

> Sowa była pracowita przez 3h 12min i zebrała 14 230 liści.

## Prestiż: Wielkie Przesadzanie

Po osiągnięciu wysokiego progu gracz może wykonać reset prestiżowy.

Nazwa mechaniki: **Wielkie Przesadzanie**.

Efekt:

- resetuje liście, część roślin i zwykłe ulepszenia,
- daje `nasiona prestiżu`,
- zwiększa stały mnożnik produkcji,
- odblokowuje nowe rośliny, kosmetyki albo dekoracje.

Prestiż powinien być opcjonalny i dobrze wyjaśniony.

## Zapis postępu

### Decyzja

Na potrzeby gry dla jednej osoby używamy `localStorage`. Firebase nie jest potrzebny w MVP.

### Proponowane klucze

```txt
sowieOgrodySave
sowieOgrodySettings
```

Część rzeczy wspólnych nadal może używać istniejącego profilu:

```txt
sowieGryProfile
```

### Przykładowa struktura zapisu

```json
{
  "version": 1,
  "leaves": 12345,
  "water": 340,
  "prestigeSeeds": 0,
  "gardenLevel": 4,
  "currentZone": "dzialka",
  "plants": {
    "monstera": 12,
    "alokazja": 5,
    "paproc": 8
  },
  "upgrades": {
    "betterPots": 3,
    "sprinkler": 2,
    "goatHelper": 1,
    "whalePool": 1
  },
  "unlockedZones": ["parapet", "balkon", "dzialka"],
  "stats": {
    "totalLeavesEarned": 999999,
    "totalWaterEarned": 12000,
    "manualClicks": 450,
    "offlineLeavesEarned": 18000,
    "prestigeCount": 0
  },
  "lastSavedAt": 1780000000000
}
```

### Zasady zapisu

- autosave co kilka sekund,
- zapis po zakupie ulepszenia,
- zapis przy zamknięciu/ukryciu strony,
- zapis po prestiżu,
- zapis po odebraniu offline progress,
- migracja przez `version`, żeby dało się zmieniać strukturę save.

## Firebase jako opcja przyszłościowa

Firebase można dodać później tylko wtedy, gdy pojawi się realna potrzeba:

- gra na wielu urządzeniach,
- backup online,
- logowanie,
- ranking,
- dzienne nagrody zależne od konta.

Architekturę warto zrobić tak, żeby zapis był przez adapter:

```txt
loadSave()
saveGame()
loadLocal()
saveLocal()
loadCloud()
saveCloud()
mergeSave()
```

W MVP implementujemy tylko lokalne funkcje. Cloud można dołożyć bez przebudowy gry.

## Integracja ze wspólnym profilem

Nowa gra powinna korzystać ze wspólnej warstwy `SowieCore` dla:

- garderoby,
- kosmetyków,
- misji,
- ustawień audio,
- toastów,
- debugowania,
- statystyk wspólnych.

Warto rozszerzyć wspólny profil o statystyki dla `SowieOgrody`, np.:

```txt
ogrodyLeaves
ogrodyPrestige
ogrodyOfflineLeaves
ogrodyGardenLevel
```

## Misje

Przykładowe misje dla nowej gry:

- `ogrodyLeaves10000` — zbierz 10 000 liści w Sowie Ogrody,
- `ogrodyGreenhouse` — odblokuj szklarnię,
- `ogrodyPrestige` — wykonaj Wielkie Przesadzanie,
- `ogrodyOffline1000` — zbierz 1 000 liści offline,
- `ogrodyGoat5` — ulepsz kozę do poziomu 5.

Przykładowe nagrody:

- konewka,
- słomkowy kapelusz,
- mini doniczka,
- złoty listek,
- ogrodnicze okulary,
- gumowe kalosze.

## Proponowana struktura katalogów

```txt
SowieOgrody/
  index.html
  style.css
  script.js
  save.js
  economy.js
  garden-renderer.js
  upgrades.js
  missions.js
  docs/
    README.md
    Documentation.md
```

## Integracja z menu głównym

Do głównego `index.html` należy dodać czwartą kartę gry:

```html
<a class="game-card" href="SowieOgrody/">
  <h2>Sowie Ogrody</h2>
  <p>Rozwijaj działkę, zbieraj liście i wracaj po offline progress.</p>
</a>
```

## Minimalny zakres MVP

Pierwsza działająca wersja powinna zawierać:

1. ekran ogrodu,
2. ręczne zbieranie liści,
3. podstawową produkcję na sekundę,
4. kilka roślin do kupienia,
5. kilka ulepszeń,
6. zapis i odczyt z `localStorage`,
7. offline progress,
8. prosty panel zakupów,
9. integrację z `SowieCore`,
10. kartę w menu głównym,
11. dokumentację w `SowieOgrody/docs/`.

## Zakres drugiej iteracji

Druga iteracja może dodać:

- wodę / plusk,
- humbaka w basenie,
- kozę ogrodniczkę,
- dostawy Amic,
- eventy aktywne,
- prestiż,
- nowe misje,
- nowe kosmetyki,
- animacje ogrodu,
- debug mode.

## Ton i styl

Gra powinna zachować styl całego repo:

- cute,
- pastelowa,
- lekko absurdalna,
- przyjazna na telefonie,
- z krótkimi humorystycznymi komunikatami,
- bez agresywnej monetyzacji,
- bez wymogu logowania.

## Najważniejsze ryzyka

### Zbyt szybkie skalowanie liczb

Incremental wymaga kontroli ekonomii. Trzeba uważać, żeby gracz nie odblokował wszystkiego w kilka minut albo nie utknął na zbyt długim grindzie.

### Zbyt dużo systemów naraz

MVP powinno być proste. Najpierw liście, rośliny, ulepszenia, save i offline progress. Dopiero potem prestiż, eventy i drugi zasób.

### Konflikt lokalnego zapisu ze wspólnym resetem postępu

Trzeba uważać na istniejące mechanizmy resetu testowego. Nowy zapis `sowieOgrodySave` nie powinien być przypadkowo kasowany bez świadomej decyzji.

### Brak potrzeby Firebase

Nie należy komplikować MVP backendem. Dla gry jednej osoby lokalny zapis jest prostszy, szybszy i wystarczający.

## Rekomendacja końcowa

Budować **Sowie Ogrody** jako czwartą grę w repozytorium.

Pierwsza wersja powinna być lokalnym incrementalem z trwałym zapisem w `localStorage`, offline progressem i prostą ekonomią liści. Firebase zostaje poza zakresem MVP. Architektura zapisu powinna jednak używać adaptera, żeby w przyszłości dało się dodać cloud-save bez przepisywania całej gry.
