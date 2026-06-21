# SowieGry — plan rozwoju, „cute polish” i harmonogram wdrożenia

## 1. Cel dokumentu

Ten dokument jest planem wykonawczym dalszego rozwoju repozytorium `CuteLittleGoat/SowieGry`. Obejmuje trzy gry:

- `SowaRunner` — boczny endless runner,
- `SowaJumper` — pionowy jumper arcade,
- `Sowa3` — trzytorowy runner w perspektywie wgłąb ekranu.

Główne cele rozwoju:

1. Ujednolicić gry wizualnie i stworzyć rozpoznawalne „Sowie uniwersum”.
2. Zwiększyć czytelność sterowania i satysfakcję z każdej akcji.
3. Nadać sowie charakter poprzez animacje, reakcje i krótkie komunikaty.
4. Rozwinąć system punktów, kombinacji, bliskich uników i nagród.
5. Dodać dźwięki, oprawę muzyczną i lepszy feedback.
6. Rozbudować indywidualną tożsamość każdej gry.
7. Dodać kosmetyczne odblokowania i małe misje.
8. Zachować sprawiedliwy balans oraz brak sytuacji niemożliwych do uniknięcia.
9. Uporządkować kod, aby kolejne zmiany nie wymagały dokładania następnych warstw hotfixów.
10. Zachować pełną grywalność na telefonie i komputerze.

---

## 2. Zasady nadrzędne

### 2.1. Gry muszą być urocze, ale czytelne

„Urocze” nie może oznaczać przeładowane. Każda dekoracja musi pozostawiać czytelne:

- położenie gracza,
- przeszkody,
- przedmioty punktowe,
- serduszka,
- kierunek ruchu,
- bezpieczną przestrzeń do manewru.

Najważniejsze elementy rozgrywki powinny mieć mocniejszy kontrast niż dekoracje tła.

### 2.2. Jedna wspólna sowa

Sowa powinna być tą samą bohaterką we wszystkich grach. Powinna zachować:

- ten sam kształt głowy i oczu,
- podobną paletę piór,
- ten sam styl skrzydeł,
- te same podstawowe emocje,
- zgodne kosmetyki.

Różnice między grami powinny wynikać z animacji, a nie ze zmiany projektu postaci.

### 2.3. Mobile-first

Każda zmiana musi być oceniana najpierw na ekranie telefonu:

- minimalny obszar dotykowy przycisku: około 44 × 44 px,
- brak elementów wymagających precyzyjnego kliknięcia,
- brak tekstów wychodzących poza ekran,
- HUD nie może zasłaniać trasy,
- animacje muszą utrzymywać płynność na przeciętnym telefonie,
- nie wolno polegać wyłącznie na hoverze.

### 2.4. Brak sytuacji bez wyjścia

Istniejące systemy bezpieczeństwa muszą pozostać aktywne:

- `SowaRunner/obstacle-balance.js`,
- `SowaJumper/safety-balance.js`,
- `Sowa3/lane-balance.js`.

Nowe przeszkody i wydarzenia muszą przechodzić przez te systemy albo przez ich późniejsze, skonsolidowane odpowiedniki.

### 2.5. Kosmetyki nie dają przewagi

Czapki, okulary, wianki, ślady piórek i warianty kolorystyczne są wyłącznie wizualne. Nie zmieniają:

- liczby żyć,
- prędkości,
- wysokości skoku,
- punktów,
- hitboxów,
- prawdopodobieństwa pojawiania się obiektów.

---

## 3. Docelowy kierunek artystyczny

### 3.1. Styl

Docelowy styl powinien łączyć:

- prostą ilustrację dziecięcą,
- miękką kreskówkę mobilną,
- wygląd kolorowych naklejek,
- delikatne kontury,
- pastelowe powierzchnie,
- mocniejsze kolory tylko dla ważnych obiektów,
- miękkie cienie i lekkie rozświetlenia.

### 3.2. Paleta wspólna

Rekomendowana baza:

- błękit nieba: `#BFE7FF`,
- jasny turkus: `#DFF6FF`,
- krem: `#FFF4D6`,
- ciepły żółty: `#FFD65A`,
- róż serduszek: `#FF5F82`,
- zieleń monster: `#4FAF68`,
- ciemny tekst: `#2B2733`,
- miękki brąz sowy: `#9A7057`,
- jasne pióra: `#EAD4B8`.

Kolory plansz mogą się różnić, ale HUD, serduszka, komunikaty i kosmetyki powinny zachować wspólny język.

### 3.3. Zasady rysowania

- Kontur głównych obiektów: 2–4 px zależnie od skali.
- Cień: miękki, półprzezroczysty, bez twardych czarnych krawędzi.
- Blask pickupów: subtelny i pulsujący.
- Tło: mniej kontrastowe niż przeszkody.
- Ważne obiekty nie powinny mieć kolorów identycznych z tłem.

---

## 4. Etap 0 — porządkowanie architektury

### Cel

Ograniczyć ryzyko regresji wynikające z wielu plików nadpisujących te same funkcje globalne.

### Obecny problem

W repo znajdują się moduły typu:

- `render-fix.js`,
- `extra-lives.js`,
- `difficulty.js`,
- `bonus-fix.js`,
- `safety-balance.js`,
- `visual-polish.js`,
- `stage-obstacles.js`,
- `lane-balance.js`,
- `obstacle-balance.js`.

Część z nich nadpisuje funkcje z wcześniej ładowanych plików. Jest to użyteczne jako szybki hotfix, ale utrudnia rozwój i może powodować zależności od kolejności ładowania.

### Zadania

- [ ] Utworzyć dla każdej gry jeden jawny obiekt konfiguracji, np. `GAME_CONFIG`.
- [ ] Przenieść konfiguracje poziomów trudności do tego obiektu.
- [ ] Zastąpić wielokrotne nadpisywanie funkcji systemem hooków albo bezpośrednią integracją w głównym pliku gry.
- [ ] Dodać kolejność aktualizacji systemów w jednym miejscu.
- [ ] Wydzielić wspólne helpery do folderu `shared/` dopiero wtedy, gdy kod rzeczywiście jest identyczny w co najmniej dwóch grach.
- [ ] Dodać tryb diagnostyczny uruchamiany przez parametr `?debug=1`.

### Proponowana struktura docelowa

```text
shared/
  ui-theme.js
  audio.js
  cosmetics.js
  particles.js

SowaRunner/
  index.html
  style.css
  game.js
  config.js
  scenes.js
  entities.js
  docs/

SowaJumper/
  index.html
  styles.css
  game.js
  config.js
  world.js
  bonus.js
  docs/

Sowa3/
  index.html
  style.css
  game.js
  config.js
  stages.js
  obstacles.js
  finish-scene.js
  docs/
```

Nie trzeba wykonywać pełnego refaktoru naraz. Najpierw należy zabezpieczyć działanie istniejących gier, a następnie przenosić po jednym systemie.

### Kryteria ukończenia

- Każda gra uruchamia się bez błędów w konsoli.
- Kolejność ładowania plików nie zmienia mechaniki.
- Poziomy trudności, dodatkowe życia i systemy balansu nadal działają.
- Dokumentacja wskazuje faktyczne pliki odpowiedzialne za systemy.

---

## 5. Etap 1 — wspólna animacja i osobowość sowy

### Cel

Sprawić, aby sterowana postać wyglądała jak bohaterka, a nie tylko znacznik kolizji.

### 5.1. Wspólne stany animacji

Każda gra powinna obsługiwać co najmniej:

- `idle` — spokojne mruganie i lekki oddech,
- `moveLeft`, `moveRight` — przechylenie w kierunku ruchu,
- `jump` lub `rise` — skrzydła szeroko rozłożone,
- `fall` — skrzydła lekko uniesione, oczy skierowane w dół,
- `collect` — krótki błysk i uśmiech,
- `hurt` — zamknięte oczy, gwiazdki nad głową,
- `nearMiss` — szeroko otwarte oczy,
- `finish` — radosne machanie skrzydłami,
- `idleLong` — spojrzenie w stronę gracza po dłuższej bezczynności.

### 5.2. Squash and stretch

- Przy lądowaniu: pionowe spłaszczenie do około 88% wysokości i rozszerzenie do około 108% szerokości.
- Przy mocnym wybiciu: wydłużenie pionowe do około 112%.
- Czas efektu: 100–180 ms.
- Efekt nie może zmieniać hitboxa.

### 5.3. Piórka i cząsteczki

- Zmiana toru w `Sowa3`: 2–3 małe piórka.
- Skok w `SowaRunner`: mała chmurka pyłu lub dwa piórka.
- Lądowanie w `SowaJumper`: subtelny pierścień i piórko.
- Uderzenie: gwiazdki zamiast dużej agresywnej eksplozji.

### 5.4. Mruganie

- Losowy interwał 2,5–6 sekund.
- Podwójne mrugnięcie z szansą około 15%.
- Brak mrugania podczas `hurt` i `collect`.

### 5.5. Krótkie komunikaty

Przykładowe teksty:

- „Hu-hu! Ale lot!”
- „O włos!”
- „Magda dzwoni…”
- „Super cena, ale jakim kosztem?”
- „Dzik! Dzik! Dzik!”
- „Pracu Pracu? Nie dzisiaj!”
- „Basen już blisko!”

Zasady:

- nie częściej niż raz na 6–10 sekund,
- maksymalnie jeden komunikat jednocześnie,
- możliwość wyłączenia komunikatów w ustawieniach,
- komunikaty nie mogą zasłaniać przeszkód.

### Kryteria ukończenia

- Sowa ma co najmniej sześć widocznie różnych stanów.
- Każda akcja gracza ma natychmiastowy feedback.
- Animacje nie wpływają na hitbox.
- Gra utrzymuje płynność na telefonie.

---

## 6. Etap 2 — UI, HUD i ekrany gry

### Cel

Ujednolicić interfejs i nadać mu wygląd miękkich, kolorowych naklejek.

### Zadania wspólne

- [ ] Zaokrąglić karty HUD.
- [ ] Dodać miękkie cienie.
- [ ] Ujednolicić ikonę życia.
- [ ] Dodać ikonę wyniku i aktualnego mnożnika.
- [ ] Dodać krótkie animacje wartości po zmianie.
- [ ] Dodać ekran pauzy.
- [ ] Dodać przycisk wyciszenia.
- [ ] Dodać ustawienie ograniczenia efektów ekranowych.
- [ ] Dodać ekran wyników z czytelnym podsumowaniem.

### Ekran wyników

Powinien pokazywać:

- wynik,
- rekord,
- zebrane liście,
- zebrane życia,
- liczbę bliskich uników,
- najwyższy mnożnik,
- wykonane misje,
- odblokowane kosmetyki.

### Kryteria ukończenia

- HUD jest czytelny na ekranie 360 px szerokości.
- Żaden tekst nie wychodzi poza ekran.
- Sterowanie dotykowe nie koliduje z przyciskami.
- Wszystkie trzy gry używają tego samego stylu kart i przycisków.

---

## 7. Etap 3 — near miss, combo i feedback punktowy

### 7.1. System „O włos!”

Near miss jest zaliczany, gdy gracz minie przeszkodę bardzo blisko, ale nie nastąpi kolizja.

#### Sowa3

- Sprawdzać odległość od przeszkody przy przejściu przez strefę kolizji.
- Near miss tylko wtedy, gdy przeszkoda była na sąsiednim torze lub gracz zmienił tor w ostatniej chwili.
- Nie przyznawać kilku near missów dla tego samego obiektu.

#### SowaRunner

- Near miss po przeskoczeniu ściany, dziury, Amic lub `Pracu Pracu` z małym marginesem.
- Dla dziury mierzyć moment przekroczenia jej końca.

#### SowaJumper

- Near miss przy przelocie blisko `Pracu Pracu`.
- Nie naliczać near missów dla kóz, ponieważ są obiektem wspierającym.

### Nagroda

- napis „O włos!”,
- 15–40 punktów zależnie od gry,
- mały błysk,
- zwiększenie licznika combo,
- opcjonalne spowolnienie 70–120 ms wyłącznie jako efekt wizualny.

### 7.2. Combo

Combo zwiększa się za:

- zbieranie liści bez obrażeń,
- near miss,
- perfekcyjne lądowanie,
- kolejne bezbłędne sekcje.

Proponowane progi:

- `x1` — start,
- `x2` — 5 poprawnych akcji,
- `x3` — 12 poprawnych akcji,
- `x4` — 22 poprawne akcje,
- `x5` — 35 poprawnych akcji.

Obrażenie resetuje combo do `x1`.

### Efekty wysokiego combo

- delikatna poświata sowy,
- większe cząsteczki,
- lekko żywsza muzyka,
- kolorowy napis `x4` lub `x5`.

### Kryteria ukończenia

- Combo nie wzrasta podczas ekranu tytułowego.
- Jedna przeszkoda daje maksymalnie jeden near miss.
- Utrata życia resetuje combo.
- System nie wymusza ryzykownej gry do zwykłego ukończenia planszy.

---

## 8. Etap 4 — pickupy i „gorączka monster”

### 8.1. Odmiany liści

- zwykła monstera — standardowe punkty,
- złota monstera — 3× standardowe punkty,
- tęczowa monstera — krótki mnożnik,
- monstera w doniczce — rzadka znajdźka,
- liść z serduszkiem — zwiększona szansa na dodatkowe życie.

### 8.2. Serduszka

Obecna mechanika dodatkowych żyć pozostaje. Wizualnie:

- serduszko lekko podskakuje,
- ma małe skrzydełka lub pulsujący blask,
- po zebraniu leci na chwilę w stronę HUD-u,
- przy maksymalnej liczbie żyć zmienia się w premię punktową.

### 8.3. Gorączka monster

Warunek przykładowy:

- zebranie 8 liści bez obrażeń.

Efekt przez 6–10 sekund:

- więcej punktowych liści,
- delikatnie bardziej kolorowe tło,
- specjalny dżingiel,
- brak zwiększania liczby przeszkód,
- wyraźny licznik czasu.

### Kryteria ukończenia

- Gorączka nie może tworzyć dodatkowych sytuacji bez wyjścia.
- Złote i tęczowe liście są wyraźnie inne od serduszek.
- Wszystkie odmiany mają wspólny kształt i różnią się kolorem/efektem.

---

## 9. Etap 5 — dźwięk i muzyka

### System audio

Wspólny moduł powinien obsługiwać:

- głośność główną,
- muzykę,
- efekty,
- wyciszenie,
- zapis ustawień w `localStorage`,
- odblokowanie audio po pierwszym świadomym tapnięciu użytkownika.

### Efekty

- liść: miękkie „pop”,
- serduszko: krótki jasny dżingiel,
- skok: lekkie „hu”,
- koza: krótkie „mee”,
- humbak: plusk lub miękki niski ton,
- telefon: krótki dzwonek,
- Amic: komiczny dżingiel,
- dzik: niski pomruk,
- paleta: tłumione „bum”,
- near miss: szybkie „whoosh”,
- combo: rosnące tonalnie dźwięki.

### Muzyka

Każda gra powinna mieć wspólny motyw w innym wykonaniu:

- `SowaRunner` — lekki, rytmiczny motyw podróży,
- `SowaJumper` — bardziej przestrzenny i unoszący,
- `Sowa3` — osobne aranżacje dla supermarketu, wystawy i blokowiska.

Muzyka nie może zagłuszać efektów ostrzegawczych.

### Kryteria ukończenia

- Gra działa również bez dźwięku.
- Ustawienia audio są zapamiętywane.
- Nie ma automatycznego głośnego startu przed interakcją użytkownika.

---

## 10. Etap 6 — rozwój SowaRunner

### 10.1. Wydarzenia specjalne

- deszcz monster,
- kozi maraton,
- seria dachów Amic,
- podmuch wiatru,
- krótka pora nocna,
- zachód słońca,
- chmury w kształcie humbaka lub kozy.

Każde wydarzenie powinno być zapowiedziane 1–2 sekundy wcześniej.

### 10.2. Perfekcyjne lądowanie

Lądowanie w środkowej części dachu Amic lub platformy:

- daje bonus,
- uruchamia efekt „Idealnie!”,
- wzmacnia combo,
- ma czytelny dźwięk.

### 10.3. Dodatkowe dekoracje

- małe ptaki w tle,
- pagórki,
- drogowskazy,
- kwiaty przy drodze,
- zmieniające się pory dnia.

### 10.4. Balans

Każde nowe wydarzenie musi korzystać z `obstacle-balance.js` albo z jego skonsolidowanego odpowiednika.

### Kryteria ukończenia

- Żadne wydarzenie nie może wygenerować dwóch niemożliwych sekwencji pod rząd.
- Zapowiedzi są czytelne.
- Na `Chill` wydarzenia są rzadsze i wolniejsze.

---

## 11. Etap 7 — rozwój SowaJumper

### 11.1. Nowe platformy

- miękka poduszka,
- ruchoma chmurka,
- trampolina z kozą,
- rosnący liść,
- platforma obracająca się,
- platforma pojawiająca się na krótko,
- balkon z doniczkami,
- dach Amic z animowaną cenówką.

### 11.2. Strefy wysokości

Przykład:

- 0–100 m — pastelowe miasto,
- 100–250 m — dachy i balkony,
- 250–450 m — chmury,
- 450–700 m — nocne niebo,
- 700 m+ — surrealistyczne „Sowie niebo”.

### 11.3. Punkty odpoczynku

Co określoną wysokość może pojawić się bezpieczna scena:

- parapet z herbatą,
- balkon z kozą,
- chmura z humbakiem,
- mały ogródek w chmurach.

Punkt odpoczynku nie zatrzymuje gry na długo; daje 1–2 sekundy oddechu i wizualną nagrodę.

### 11.4. Mini-gra z humbakiem

Rozwinąć istniejącą poprawioną wersję:

- trzy czytelne pasy spadania obiektów,
- sygnał przed pojawieniem się przeszkody,
- rzadsze, ale bardziej wartościowe złote liście,
- osobny licznik combo mini-gry,
- ekran końcowy z wynikiem bonusowym.

### Balans

Wszystkie platformy muszą przechodzić przez `safety-balance.js` albo jego późniejszy odpowiednik.

---

## 12. Etap 8 — rozwój Sowa3

### 12.1. Supermarket

Docelowe elementy:

- jasna alejka polskiego dyskontu,
- regały po obu stronach,
- kafelki,
- czarno-pomarańczowe tablice „SUPER CENA!”,
- stosy produktów,
- palety z towarem,
- pracownik z paleciakiem,
- rozsypane produkty,
- bramka kasowa,
- automat do pieczywa w tle.

Nie należy kopiować logo konkretnej marki. Styl ma jedynie przypominać polski dyskont.

### 12.2. Wystawa kwiatów

Docelowe elementy:

- duża ciemna hala,
- wiele alejek,
- metalowe stojaki,
- duża liczba doniczek,
- żółte cenówki,
- wiele odmian zieleni i kwiatów,
- tłum odwiedzających,
- zraszacze i delikatna mgiełka,
- wózki z roślinami,
- duże monstery.

Ludzie pozostają przeszkodami planszowymi.

### 12.3. Blokowisko PRL

Docelowe elementy:

- wysokie prefabrykowane bloki z wielkiej płyty,
- powtarzalne okna i balkony,
- głównie szare, bure lub wyblakłe elewacje,
- ograniczona ilość zieleni,
- trzepaki,
- ławki,
- place zabaw,
- kałuże,
- suszące się pranie,
- gołębie,
- kot na balkonie,
- światła zapalające się w oknach,
- dziki jako przeszkody.

### 12.4. Ruchome przeszkody

Dodać ostrożnie:

- pracownik z paleciakiem może przejść o jeden tor,
- człowiek na wystawie może zatrzymać się lub przesunąć o jeden tor,
- dzik może przebiec między dwoma torami.

Zasady:

- ruch musi być zapowiedziany animacją,
- nie może następować natychmiast przy graczu,
- `lane-balance.js` musi uwzględniać tor docelowy,
- zawsze musi pozostać możliwa droga ucieczki.

---

## 13. Finał planszy Sowa3 — ogród działkowy i basen

### 13.1. Basen — specyfikacja obowiązkowa

Basen na mecie każdej planszy ma przypominać załączoną ilustrację referencyjną:

- kształt: duży, okrągły basen naziemny,
- ścianka boczna: szara, karbowana lub pionowo ryflowana,
- górny rant: szeroki, intensywnie niebieski,
- wnętrze: jasna turkusowo-niebieska woda,
- perspektywa: widoczny eliptyczny otwór basenu,
- woda: delikatne falowanie i odbicia,
- ustawienie: bezpośrednio na trawie,
- otoczenie: działka, krzewy, drzewa, rabaty i prosty płot,
- brak luksusowego charakteru — ma to być zwykły, swojski basen ogrodowy.

### 13.2. Rysowanie proceduralne

Proponowana kolejność warstw:

1. cień pod basenem,
2. szary cylinder/ścianka z pionowymi żłobieniami,
3. ciemniejszy dolny brzeg,
4. niebieski górny rant,
5. elipsa wody,
6. jaśniejsze pasma fal,
7. drobne refleksy,
8. animowany plusk przy wejściu sowy.

### 13.3. Animacja finału

Po osiągnięciu mety:

1. Sowa zwalnia.
2. Kamera lekko przybliża działkę.
3. Sowa wykonuje krótki skok do basenu.
4. Pojawia się plusk i kilka kropli.
5. Humbak może wynurzyć się absurdalnie z małego basenu.
6. Koza może siedzieć na leżaku.
7. Po 1–2 sekundach pojawia się podsumowanie planszy.

### 13.4. Podsumowanie planszy

Pokazać:

- wynik planszy,
- liczbę zebranych liści,
- liczbę near missów,
- najwyższe combo,
- utracone życia,
- premię za ukończenie bez obrażeń,
- zabawną ocenę.

Przykładowe oceny:

- „Spokojny lot”
- „Sowi zawodnik”
- „Królowa alejek”
- „Postrach dzików”
- „Królowa działek”

### Kryteria ukończenia

- Basen jest jednoznacznie okrągły, naziemny, szary i ma niebieski rant.
- Woda jest animowana, ale nie migocze agresywnie.
- Finał trwa maksymalnie kilka sekund i można go pominąć po pierwszym obejrzeniu.
- Podsumowanie nie zasłania całkowicie sceny działki.

---

## 14. Etap 9 — kosmetyki

### Lista początkowa

- kokardka,
- okulary przeciwsłoneczne,
- wianek z kwiatów,
- czapka ogrodnika,
- kask sklepowy,
- czapka z daszkiem,
- szalik,
- mały plecak,
- wariant koloru piór,
- ślad z piórek,
- ślad z liści,
- ślad z bąbelków.

### System odblokowań

Kosmetyki można odblokować za:

- wynik,
- dystans,
- wysokość,
- ukończenie planszy bez obrażeń,
- wykonanie misji,
- serię near missów,
- ukończenie poziomu `Chaos`.

### Wspólny zapis

Użyć jednego klucza lub jednego obiektu w `localStorage`, np.:

```js
sowieGryProfile = {
  unlockedCosmetics: [],
  selectedCosmetic: {},
  missions: {},
  settings: {}
}
```

Należy dodać migrację z wcześniejszych pojedynczych kluczy bez ich usuwania.

---

## 15. Etap 10 — małe misje

### Przykłady

- Zbierz 20 liści monster.
- Odbij się 3 razy od kozy.
- Ukończ etap `Sowa3` bez utraty życia.
- Omiń 5 telefonów.
- Minij 3 dziki „o włos”.
- Zdobądź dodatkowe życie.
- Osiągnij 250 m w `SowaJumper`.
- Przebiegnij 1000 m w `SowaRunner`.
- Dotrzyj na działkę na poziomie `Chaos`.
- Zdobądź combo `x4`.

### Zasady

- Maksymalnie 3 aktywne misje.
- Misje nie mogą wymuszać oglądania reklam ani płatności.
- Nagrody powinny być kosmetyczne.
- Postęp musi być zapisywany po każdej ważnej akcji.

---

## 16. Testy i kontrola jakości

### 16.1. Macierz testów

Każdą grę testować na:

- telefonie w pionie,
- telefonie w poziomie,
- komputerze z klawiaturą,
- małym ekranie około 360 × 640,
- większym ekranie mobilnym,
- poziomach `Chill`, `Arcade`, `Chaos`.

### 16.2. Minimalny playtest

Dla każdej wersji:

- 5 minut na `Chill`,
- 10 minut na `Arcade`,
- 10 minut na `Chaos`,
- co najmniej 3 restarty,
- sprawdzenie zdobycia dodatkowego życia,
- sprawdzenie utraty wszystkich żyć,
- sprawdzenie rekordu,
- sprawdzenie pauzy i wyciszenia,
- sprawdzenie działania bez odświeżenia po zmianie orientacji.

### 16.3. Testy sprawiedliwości

#### Sowa3

- brak trzech jednocześnie zamkniętych torów,
- minimalny odstęp między przeszkodami,
- ruchome przeszkody zawsze zapowiedziane,
- serduszko nie pojawia się wewnątrz przeszkody.

#### SowaRunner

- każdą sekwencję da się przejść przy poprawnym użyciu skoku/podwójnego skoku,
- nie ma dziury natychmiast po przeszkodzie bez czasu reakcji,
- wydarzenia specjalne nie omijają systemu balansu.

#### SowaJumper

- kolejne platformy mieszczą się w realnym zasięgu,
- brak zbyt długiej serii ruchomych lub kruszących się platform,
- `Pracu Pracu` nie blokuje jedynego sensownego lądowania,
- mini-gra humbaka zawsze pozostawia przestrzeń do ruchu poziomego.

### 16.4. Testy wydajności

- brak rosnącej liczby obiektów po kilku minutach,
- usuwanie obiektów poza ekranem,
- ograniczenie liczby cząsteczek,
- brak wielokrotnego tworzenia gradientów i dużych struktur, jeśli można je cache’ować,
- sprawdzenie konsoli pod kątem błędów.

---

## 17. Kolejność wdrożenia

### Sprint 1 — fundamenty

1. Porządkowanie architektury.
2. Wspólny system konfiguracji.
3. Tryb diagnostyczny.
4. Ujednolicenie HUD-u.
5. Utrzymanie istniejącego balansu i poziomów trudności.

### Sprint 2 — sowa i feedback

1. Nowe animacje sowy.
2. Squash and stretch.
3. Piórka i gwiazdki.
4. Krótkie komunikaty.
5. Lepsze efekty pickupów.

### Sprint 3 — near miss i combo

1. Near miss w `Sowa3`.
2. Near miss w `SowaRunner`.
3. Near miss w `SowaJumper`.
4. Wspólny system combo.
5. Ekran statystyk po grze.

### Sprint 4 — Sowa3 i działka

1. Ulepszenie supermarketu.
2. Ulepszenie wystawy kwiatów.
3. Ulepszenie blokowiska.
4. Ruchome przeszkody planszowe.
5. Nowy finał działki.
6. Okrągły basen z szarą ryflowaną ścianką i niebieskim rantem.
7. Animacja wskoczenia sowy do basenu.

### Sprint 5 — SowaRunner i SowaJumper

1. Wydarzenia `SowaRunner`.
2. Pory dnia.
3. Perfekcyjne lądowania.
4. Strefy wysokości `SowaJumper`.
5. Nowe platformy.
6. Rozbudowa mini-gry humbaka.

### Sprint 6 — audio

1. Wspólny moduł audio.
2. Efekty podstawowe.
3. Motyw muzyczny.
4. Warianty muzyki.
5. Ustawienia głośności.

### Sprint 7 — meta-progresja

1. Kosmetyki.
2. Wspólny profil.
3. Misje.
4. Odblokowania.
5. Ekran garderoby.

---

## 18. Priorytety

### Must-have

- [ ] stabilna architektura,
- [ ] animowana, charakterystyczna sowa,
- [ ] spójny HUD,
- [ ] near miss,
- [ ] combo,
- [ ] lepszy feedback,
- [ ] nowy finał działki i basen,
- [ ] testy mobilne,
- [ ] brak sytuacji bez wyjścia.

### Should-have

- [ ] dźwięki,
- [ ] muzyka,
- [ ] wydarzenia planszowe,
- [ ] nowe platformy,
- [ ] strefy wysokości,
- [ ] ekran podsumowania.

### Nice-to-have

- [ ] kosmetyki,
- [ ] misje,
- [ ] garderoba,
- [ ] wspólny profil,
- [ ] specjalne chmury,
- [ ] dodatkowe zabawne dialogi.

---

## 19. Definicja ukończenia całego reworku

Rework można uznać za ukończony, gdy:

1. Wszystkie trzy gry wyglądają jak część tej samej serii.
2. Sowa ma czytelne animacje i reakcje.
3. Każda gra ma poziomy `Chill`, `Arcade`, `Chaos`.
4. Każda gra pozwala zdobywać dodatkowe życia.
5. Każda gra ma system zapobiegający niemożliwym układom przeszkód.
6. Near miss i combo działają konsekwentnie.
7. HUD jest czytelny na telefonie.
8. Dźwięki można wyciszyć.
9. `Sowa3` ma trzy wyraźnie różne plansze i rozbudowany finał działki.
10. Basen na działce jest okrągły, naziemny, ma szarą ryflowaną ściankę, niebieski rant i jasną wodę.
11. Dokumentacja każdej gry jest zgodna z kodem.
12. Gry przechodzą testy mobilne i nie generują błędów w konsoli.

---

## 20. Zasady pracy z repozytorium

Przy każdym większym zadaniu:

1. Sprawdzić aktualny stan plików z gałęzi `main`.
2. Unikać równoległego nadpisywania tego samego pliku.
3. Wprowadzać zmiany w małych, opisanych commitach.
4. Aktualizować dokumentację gry w tym samym zadaniu.
5. Po zmianach wykonać kontrolę ładowania plików w `index.html`.
6. Sprawdzić poziomy trudności, życia i balans przeszkód.
7. Sprawdzić konsolę błędów.
8. Przeprowadzić ręczny playtest mobilny przed uznaniem etapu za ukończony.

Dokument powinien być aktualizowany wraz z postępem prac. Wykonane zadania można oznaczać przez zmianę `[ ]` na `[x]`.