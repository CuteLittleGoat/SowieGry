# Analiza 6 — wydajność: „jak się za dużo dzieje na ekranie, gra laguje” (zwłaszcza Sowie Ogrody)

> Data: 2026-11-22 · Podstawa: zgłoszenie użytkownika przekazane przez właściciela 2026-11-22 (dosłownie
> w [rozdziale 1](#1-zgłoszenie-dosłownie-i-numer)) i kod na `main` (commit `1e45273`) · Status: **analiza
> z odpowiedziami właściciela (2026-11-22, [rozdział 10](#10-odpowiedzi-właściciela-i-zmiany-planu-2026-11-22))** —
> telefon użytkownika: **Redmi Note 10 Pro, MIUI Global 14.0.7, przeglądarka Chrome**; wdrożenie W0–W8 to krok 3
> kolejności prac (po dokumentacji i analizie Sowiej Dziupli), w jednym zadaniu i jednym PR na `main` —
> **wdrożone 2026-11-22** ([rozdział 11](#11-wykonanie-2026-11-22)).
> Druga analiza z tego dnia: [`ANALIZA_5_Nowa_gra_Sowie_Trojki_match3.md`](ANALIZA_5_Nowa_gra_Sowie_Trojki_match3.md)
> (nowa gra „match 3”) — korzysta z poprawek opisanych tutaj. Zasady pracy bez zmian:
> [`ANALIZA_3_Plan_prac.md`, rozdz. 8.1](ANALIZA_3_Plan_prac.md).

Wszystkie pomiary robiłem w przeglądarce Chromium na profilu telefonu, w trybie pamięci (`?cloud=memory`), skryptami
uruchamianymi tylko w moim kontenerze — **nic nie trafiło do produkcyjnej bazy ani do repozytorium** (oprócz tego
pliku). Jak mierzyłem i czego te liczby nie mówią: [rozdział 2](#2-jak-mierzyłem).

---

## 0. W skrócie (dla właściciela)

- **Przyczyna jest jedna i wyraźna:** gry rysują cały obraz od nowa 60 razy na sekundę, w podwójnej ostrości, także
  rzeczy, które się nie zmieniają (tło rozdziału, doniczki, napisy). Na mocnym komputerze to drobiazg, ale na
  słabszym telefonie rysowanie nie mieści się w czasie jednej klatki — wtedy obraz „klatkuje”, a palec przesuwa
  rośliny z opóźnieniem. **Sama logika gry, liczby i panel z przyciskami są lekkie** — kiedy w pomiarze wyłączyłem
  rysowanie ogrodu, gra miała równe 60 klatek na sekundę nawet na „wolnym telefonie”.
- **Sowie Ogrody** na symulowanym średnim telefonie mają 43 klatki/s, gdy nic się nie dzieje, 33–38, gdy się stuka
  i są zdarzenia (kózka, ciężarówka, telefon, konewka), i **24–28 w Zatoce Humbaka** — tam gra rysuje cały ogród,
  a potem zasłania go prawie nieprzezroczystą wodą (podwójna praca). Na słabszym telefonie: 15–26 klatek/s.
- **Łącz i Hoduj** z pełną planszą ma na średnim telefonie tylko **18–24 klatki/s** (każda z 63 roślin rysowana od
  nowa co klatkę) — to prawdopodobnie też „zawieszanie się przesuwania roślin”. **Sowie Tory** są najcięższe ze
  wszystkich (17 klatek/s na średnim, 9 na słabszym telefonie), a na bardzo wolnym telefonie gra wręcz **zwalnia**
  (o ok. 12%), bo silnik gubi czas, gdy klatka trwa ponad 0,1 s — to pasuje do „wszystko wolniej działa”.
- **Co pomoże (sprawdzone próbnie, w locie, bez zmian w repozytorium):** w Sowich Ogrodach połączenie czterech
  zmian — tło z pamięci zamiast rysowania co klatkę, rośliny jako gotowe obrazki, w Zatoce bez ogrodu pod wodą
  i nieco mniejsza ostrość płótna na słabszym telefonie — daje **55–60 klatek/s** zamiast 24–43 na średnim
  telefonie i 35–56 zamiast 15–26 na słabszym. W Łącz i Hoduj podobne zmiany: **49–55** zamiast 22–24.
- **Wygląd się nie zmieni** (te same rysunki, te same animacje), poza tym, że na telefonie, który nie nadąża, obraz
  będzie minimalnie mniej ostry — automatycznie i tylko tam (gry zręcznościowe robią tak już od września).
- **Plan:** 9 małych kroków (W0–W8, [rozdział 5](#5-plan-zmian-krok-po-kroku)) — najpierw pomiar na telefonie, na
  którym laguje (W0), potem wspólny „automat płynności” dla wszystkich gier (W1), Sowie Ogrody (W2–W3), Łącz i Hoduj
  (W4), gry zręcznościowe (W5). **Nic z postępu nie ginie** — zmiany dotyczą tylko rysowania.
- **Pytania do Ciebie** (m.in. na jakim telefonie laguje i w której grze „zawiesza się przesuwanie roślin”):
  [rozdział 9](#9-pytania-do-właściciela-prostym-językiem).
- **Telefon użytkownika (odpowiedź z 2026-11-22): Redmi Note 10 Pro z MIUI Global 14.0.7, gra w Chrome.** To telefon
  średniej klasy z ekranem, który może odświeżać obraz **120 razy na sekundę** — jeśli Chrome korzysta z tej
  częstotliwości, Sowie Ogrody i Łącz i Hoduj próbują rysować 120 klatek na sekundę, czyli robią dwa razy więcej
  pracy niż na zwykłym ekranie. Dlatego plan dostał **limit 60 klatek/s** (W1). Szczegóły i pozostałe odpowiedzi:
  [rozdział 10](#10-odpowiedzi-właściciela-i-zmiany-planu-2026-11-22).

| Gra (scenariusz) | Komputer (CPU ×1) | „Średni telefon” (CPU ×4) | „Słabszy telefon” (CPU ×6) | Po poprawkach (próba, ×4 / ×6) |
| --- | --- | --- | --- | --- |
| Sowie Ogrody — spokój | 60 | 43 | 26 | 60 / 55–56 |
| Sowie Ogrody — stukanie + zdarzenia + półka | 60 | 33–36 | 23 | 55 / 35–48 |
| Sowie Ogrody — Zatoka Humbaka | 60 | 24–28 | 16 | 60 / 54–59 |
| Łącz i Hoduj — pełna plansza, przeciąganie | 60 | 18–24 | 13 | 49–55 / — |
| Sowie Tory — bieg | 60 | 17 | 9 (gra zwalnia o ok. 12%) | do zrobienia w W5 |
| Sowia Ucieczka — bieg | 60 | 37 | 23 | W1, W5 |
| Sowa w Chmurach — lot | 60 | 39 | 20 | W1, W5 |
| Menu | 60 (rysuje 30) | 59 | 52 | bez zmian |

Liczby to klatki na sekundę (60 = płynnie; poniżej ok. 45 widać „szarpanie”, poniżej 30 — wyraźne lagi). Komputer
w kontenerze nie ma karty graficznej, więc liczby pokazują **proporcje** (co jest ciężkie i ile daje poprawka), a nie
dokładną liczbę klatek na konkretnym telefonie — dlatego pierwszym krokiem planu jest pomiar na Twoim telefonie (W0).

---

## 1. Zgłoszenie (dosłownie) i numer

Numeracja ciągnie się od [`UWAGI_WLASCICIELA.md`](UWAGI_WLASCICIELA.md) (ogólne: G1–G5).

| # | Gra | Zgłoszenie (dosłownie, od użytkownika przez właściciela) |
| --- | --- | --- |
| G6 | wszystkie, zwłaszcza Sowie Ogrody | „jak się za dużo dzieje na ekranie to gra laguje” — „Zwłaszcza w Sowich Ogrodach. Animacje się spowalniają i wszystko wolniej działa. Zawiesza się też przesuwanie roślin.” — „Prawdopodobnie jest to związane z wydajnością urządzenia.” |

Trzy objawy, które da się sprawdzić osobno:

1. **„laguje, gdy dużo się dzieje”** — spadek liczby klatek przy wielu rzeczach naraz (stukanie, napisy „+N”,
   cząsteczki, zdarzenia, Zatoka Humbaka);
2. **„animacje się spowalniają i wszystko wolniej działa”** — albo rzadkie klatki (ruch skacze), albo naprawdę
   wolniejszy czas gry (w grach zręcznościowych możliwe — [przyczyna P7](#4-przyczyny));
3. **„zawiesza się przesuwanie roślin”** — w Sowich Ogrodach przesuwanie linii roślin palcem (uwaga O8 z 11 listopada),
   a w Łącz i Hoduj przeciąganie rośliny po półkach; nie wiem, o którą grę chodzi — pytanie 2 w
   [rozdziale 9](#9-pytania-do-właściciela-prostym-językiem). Analiza obejmuje obie.

---

## 2. Jak mierzyłem

- **Przeglądarka:** Chromium (ten sam silnik co Chrome na Androidzie) w kontenerze bez karty graficznej, profil
  telefonu 412 × 915 px, gęstość ekranu 2,625 (jak Pixel 7) — gry rysują płótno w gęstości 2 (górny limit w kodzie).
- **Spowolnienie procesora:** narzędzie przeglądarki „CPU throttling” ×4 (w przybliżeniu średni telefon z ostatnich
  lat) i ×6 (starszy albo tańszy telefon). To przybliżenie — telefon ma też kartę graficzną, która część rysowania
  bierze na siebie; w kontenerze całe rysowanie robi procesor. Dlatego tabela w rozdziale 0 mówi „co jest ciężkie
  i ile daje poprawka”, a dokładne liczby dla Twojego telefonu da pomiar W0.
- **Stan gry „późnej rozgrywki”** (najcięższy przypadek): 22. rozdział (Drzewo świata), wszystkie 43 gatunki po 150
  sztuk (pełny wygląd roślin), konewka. Stan wstrzykiwany w pamięć strony tylko w pomiarze.
- **Scenariusze (po 5–6 s):** spokój (ogród tylko się porusza), szybkie stukanie (14 stuknięć na sekundę, dwa palce),
  zdarzenia (kózka, ciężarówka Amic, telefon Pracu i konewka naraz, ponawiane co 1,5 s), przesuwanie półki palcem,
  wszystko naraz, Zatoka Humbaka (sama i ze stukaniem).
- **Co liczyłem:** klatki na sekundę, czas klatki (mediana i 95. percentyl), „długie zadania” (ponad 50 ms — wtedy
  dotyk czeka), zajętość wątku strony (ile czasu przeglądarka pracowała), profil procesora (które funkcje zajmują
  czas) i — w grach zręcznościowych — czas gry względem zegara (czy gra zwalnia).
- **Warianty próbne:** żeby sprawdzić, co pomoże, podmieniałem w pomiarze fragmenty kodu w locie (przeglądarka
  dostawała zmieniony plik, repozytorium bez zmian): bez rysowania, bez panelu, mniejsza ostrość, tło z pamięci,
  rośliny jako obrazki, Zatoka bez ogrodu pod wodą, rysowanie co drugą klatkę. Szczegóły:
  [Załącznik A](#załącznik-a-skrypty-pomiarowe).

---

## 3. Wyniki pomiarów

### 3.1. Sowie Ogrody — jak jest dziś

Płótno ogrodu: 784 × 622 px (392 × 311 px CSS × 2), w grze 741 elementów strony (głównie dolny panel).

| Scenariusz | CPU ×1 | CPU ×4: klatki/s | klatka p95 | długie zadania (6 s) | CPU ×6: klatki/s |
| --- | --- | --- | --- | --- | --- |
| spokój | 60 | 43–44 | 33 ms | 1 (56 ms) | 26 |
| szybkie stukanie | 60 | 38 | 50 ms | 0 | — |
| zdarzenia + konewka | 60 | 35 | 50 ms (max 67) | 4 (220 ms) | — |
| przesuwanie półki palcem | 60 | 42–43 | 33 ms | 2 (108 ms) | — |
| stukanie + zdarzenia + półka | 60 | 33–36 | 50 ms (max 67) | 7 (394 ms) | 23 |
| Zatoka Humbaka | 60 | 24–28 | 50–67 ms (max 83) | 9 (542 ms) | 16 |

- Już **bez spowolnienia** wątek strony pracuje 32–51% czasu (na komputerze to wciąż 60 klatek/s). Przy ×4 jest zajęty
  w 100% — przeglądarka nie nadąża i opuszcza klatki.
- **Profil procesora** („wszystko naraz”, ×4): **77,5%** czasu to praca przeglądarki poza kodem gry — rasteryzacja
  (zamiana kształtów na piksele) i składanie obrazu. Najcięższe funkcje samej gry zajmują po 0,5–1,8% (np. liczenie
  produkcji `production` — 1,3%, układ półki `shelf` — 0,8%, odświeżanie panelu — 0,5%), sprzątanie pamięci — 0,5%.

### 3.2. Gdzie idzie czas — próby „co, jeśli…” (CPU ×4)

| Wariant | Spokój | Wszystko naraz | Zatoka Humbaka | Wniosek |
| --- | --- | --- | --- | --- |
| dziś | 43 | 36 | 24 | — |
| **bez rysowania płótna** | **60** (wątek 23%) | **60** (36%) | **60** (22%) | logika, HUD i panel są lekkie — winne jest rysowanie |
| bez odświeżania panelu | 43 | 33 | 33 | panel nie jest przyczyną |
| ostrość 1,5 zamiast 2 | 54 | 41 | 37 | mniej pikseli — duży zysk |
| ostrość 1 | 58 | 52 | 55 | jeszcze większy zysk, ale obraz wyraźnie mniej ostry |
| tło rozdziału z pamięci | 50 | 46 | 33 | tło to ok. 1/6 pracy |
| rośliny jako gotowe obrazki | 49 | 37 | 32 | pomaga przy spokoju; na telefonie z kartą graficzną zysk będzie większy (rozdz. 3.5) |
| Zatoka bez ogrodu pod wodą | 42 | 36 | **57** | Zatoka przestaje lagować |
| rysowanie co drugą klatkę (30/s) | wątek 79% | 95% | 92% | tryb „Oszczędzanie baterii” odciąża o ok. 1/5 |
| tło + rośliny + Zatoka | 58 | 46 | 56 | — |
| **tło + rośliny + Zatoka + ostrość 1,5** | **60** (wątek 67%) | **55** | **60** | **cel W2** |

Te same warianty na „słabszym telefonie” (CPU ×6):

| Wariant | Spokój | Wszystko naraz | Zatoka Humbaka |
| --- | --- | --- | --- |
| dziś | 26 | 23 | 16 |
| ostrość 1 | 43 | 31 | 35 |
| tło + rośliny + Zatoka + ostrość 1,5 | 55 | 35 | 54 |
| tło + rośliny + Zatoka + ostrość 1 | 56 | 48 | 59 |

Wniosek: na słabszym telefonie potrzebne są **wszystkie** poprawki i automat, który w razie potrzeby zejdzie
z ostrością do 1 (W1).

### 3.3. Pojedyncze elementy Sowich Ogrodów (komputer, bez spowolnienia, z rasteryzacją)

| Element (na jedną klatkę) | Czas |
| --- | --- |
| samo niebo (gradient na całe płótno) | 0,64 ms |
| niebo + dekoracje rozdziału (od 7.) | 0,54–1,34 ms (najcięższe: Wodny ogród 1,34, Łąka wróżek 1,32, Księżycowy 1,20, Nawiedzony 1,05) |
| jedna roślina w pełnym wyglądzie (150 szt.) | 0,05–1,08 ms (najcięższe: Mutant monstery 1,08, Drzewo życia 0,89, Paproć 0,78, Słonecznik 0,75) |
| jedna roślina na początku (1 szt.) | 0,01–0,23 ms |
| 12 napisów „+N” z obwódką | 0,16 ms |
| 120 cząsteczek liści | 0,48 ms |
| skopiowanie gotowego obrazka wielkości całego płótna | 0,97 ms |

Na ekranie widać naraz 5–8 roślin, więc klatka ogrodu to ok. 3–8 ms na szybkim komputerze — przy spowolnieniu ×4
już 12–32 ms, a na płynne 60 klatek/s jest **16,7 ms** na wszystko (także na panel i przeglądarkę).

### 3.4. Pozostałe gry

| Gra | CPU ×1 | CPU ×4 | CPU ×6 | Uwagi |
| --- | --- | --- | --- | --- |
| Menu (zakładka Gry) | 60 | 59 | 52 | celowo rysuje 30 razy na sekundę — wystarczy |
| Sowia Ucieczka | 60 | 37 | 23 | automat ostrości już zszedł do 1; czas gry bez strat |
| Sowie Tory | 60 (wątek 78%!) | 17 (65 długich zadań, 4,2 s z 6 s) | 9 | przy ×6 gra przejechała 70 m zamiast 80 m — **zwalnia o ok. 12%** |
| Sowa w Chmurach | 60 | 39 | 20 | czas gry bez strat |
| Łącz i Hoduj (63 rośliny na planszy) | 60 | 18–24 (49 długich zadań) | 13 | płótno 800 × 1026 px, bez automatu ostrości |

Profil Sowich Torów (×4): 80% czasu to rasteryzacja; w kodzie gry najwięcej rysowanie rekwizytów sklepu
(`SowieTory/props.js`: `box` — prostokąty z zaokrąglonymi rogami, `label` — napisy na szyldach, np. „NABIAŁ”)
i odświeżanie licznika punktów (`shared/ui/hud.js`).

### 3.5. Łącz i Hoduj — próby (CPU ×4, pełna plansza)

| Wariant | Spokój | Przeciąganie rośliny |
| --- | --- | --- |
| dziś (płótno 800 × 1026) | 24 | 22 |
| ostrość 1,5 | 27 | 31 |
| rośliny jako gotowe obrazki | 20 | 20 |
| **rośliny jako obrazki + ostrość 1,5** | **34** | **35** |
| ostrość 1 | 38 | 39 |
| **rośliny jako obrazki + ostrość 1** | **55** | **49** |

Uwaga o „gotowych obrazkach”: w kontenerze bez karty graficznej skopiowanie obrazka kosztuje procesor tyle, ile
pikseli ma obrazek, więc sam ten zabieg niewiele daje (a nawet trochę traci, gdy obrazki na siebie zachodzą). Na
telefonie kopiowanie obrazka robi karta graficzna prawie za darmo, a skomplikowane kształty (liście z wycięciami,
łuki) liczy częściowo procesor — tam zysk z obrazków jest większy niż w tej tabeli. To jeden z powodów, dla których
po zmianach trzeba zmierzyć grę na prawdziwym telefonie (W0, W7).

---

## 4. Przyczyny

| # | Przyczyna | Gdzie w kodzie | Dotyczy |
| --- | --- | --- | --- |
| P1 | **Całe płótno rysowane od nowa co klatkę** (60×/s), także to, co stoi: niebo z gradientem, dekoracje rozdziału, doniczki, podpisy „×150” (z mierzeniem szerokości tekstu co klatkę), deski półek i 63 tła pól w Łącz i Hoduj | `SowieOgrody/ogrod/render.js` — `draw` (l. 408), `background` (l. 61), `shelf` (l. 176); `LaczIHoduj/render.js` — `draw` (l. 434), `background` (l. 193) | Ogrody, Łącz i Hoduj, (Tory) |
| P2 | **Stała ostrość płótna 2** — bez automatu, który na słabszym telefonie zmniejsza ją do 1,5 i 1 (gry zręcznościowe go mają: `dprCap` w `SowiaUcieczka/main.js` l. 46 i 767, `SowieTory/main.js` l. 44 i 783, `SowaWChmurach/main.js` l. 40 i 723) | `SowieOgrody/ogrod/render.js` l. 49, `LaczIHoduj/render.js` l. 64 | Ogrody, Łącz i Hoduj |
| P3 | **Zatoka Humbaka rysuje cały ogród pod wodą**, którą zaraz zasłania (92–95% krycia) — podwójna praca w najbardziej „ruchliwym” momencie | `render.js` — `draw` wywołuje `background`, `owl`, `shelf`… przed `bay` (l. 291) | Ogrody |
| P4 | **Rośliny rysowane z kształtów co klatkę** — w pełnym wyglądzie do 1 ms na roślinę; w Łącz i Hoduj 63 rośliny z gradientami (tęczowe) i cyfrą poziomu (`fillText`) | `SowieOgrody/ogrod/plants.js`, `LaczIHoduj/plants.js` — `item` (l. 697) | Ogrody, Łącz i Hoduj |
| P5 | **Efekty bez limitu „na telefon”**: do 120 cząsteczek i 12 napisów „+N” z obwódką; każde stuknięcie dokłada 6 cząsteczek i napis; poświata złotej kózki to nowy gradient co klatkę; 18 kropli po podlaniu | `render.js` — `effects` (l. 345), `goat` (l. 263), `water` | Ogrody |
| P6 | **Dotyk czeka na klatkę.** Gdy wątek strony jest zajęty w 100%, przeglądarka obsługuje ruch palca dopiero między klatkami (33–67 ms przy ×4, 67–100 ms przy ×6), a przesunięta półka pojawia się na ekranie dopiero w następnej klatce — palec „wyprzedza” rośliny | `SowieOgrody/ogrod/main.js` — `pointermove` (l. 634); `LaczIHoduj/main.js` — `pointermove` (l. 1011) | Ogrody (półka), Łącz i Hoduj (przeciąganie) |
| P7 | **Gubienie czasu gry przy bardzo długich klatkach.** Pętla gier zręcznościowych liczy najwyżej 12 kroków po 1/120 s na klatkę (0,1 s); dłuższa klatka „zjada” resztę czasu — gra zwalnia (Sowie Tory przy ×6: −12%). To zabezpieczenie przed zawieszeniem, ale próg jest za niski | `shared/engine/loop.js` l. 11 (`maxSteps = 12`) | Tory, Ucieczka, Chmury (na bardzo słabym telefonie) |
| P8 | **Brak propozycji „Oszczędzania baterii”** w Ogrodach i Łącz i Hoduj — gry zręcznościowe po 5 s poniżej 45 klatek/s same ją proponują (`createPerfMonitor`, `shared/engine/shell.js` l. 6); gra bezczynna (idle) nie potrzebuje 60 klatek/s, gdy nic się nie dzieje | `SowieOgrody/ogrod/main.js`, `LaczIHoduj/main.js` (własna pętla bez powłoki) | Ogrody, Łącz i Hoduj |
| P9 | **Drobiazgi** (zmierzone jako małe, ale tanie do poprawy): licznik punktów zmieniany i formatowany co klatkę i „podskok” liczby wymuszający przeliczenie układu strony co 250 ms (`shared/ui/hud.js` l. 21 i 55); w Ogrodach nowe obiekty co klatkę (lista widocznych roślin, mapa miejsc, cząsteczki usuwane `splice`); rekwizyty Sowich Torów z napisami rysowane od nowa (`SowieTory/props.js` l. 21 i 43) | jak obok | wszystkie |

**Co nie jest przyczyną** (sprawdzone): dolny panel Ogrodów (odświeżany 5×/s w miejscu, bez przebudowy — od uwagi O4),
logika gry i ekonomia (bez rysowania wątek pracuje 22–36% przy ×4), zapis do chmury (co 30 s, w tle), muzyka
i efekty dźwiękowe, sprzątanie pamięci (0,5%), atlas grafik (budowany raz przy starcie).

---

## 5. Plan zmian krok po kroku

Każdy krok to osobny, mały commit z zielonym `npm test`, aktualizacją `docs/Documentation.md` i `docs/README.md`
danej gry (AGENTS.md) i wpisem w `STAN_PRAC.md`. Rozmiar: S — do kilku godzin, M — dzień, L — kilka dni.

### W0 — pomiar na prawdziwym telefonie (S)

- Licznik płynności włączany adresem: dopisanie `?perf=1` do adresu gry (np.
  `…/SowieOgrody/?perf=1`) pokazuje w rogu: klatki/s, najdłuższą klatkę z ostatnich 5 s, ostrość płótna i poziom
  automatu (W1). Bez `?perf=1` niewidoczny i nic nie kosztuje.
- Nowy mały moduł `shared/engine/perf-meter.js` (liczy z `requestAnimationFrame`, rysuje w zwykłym elemencie strony,
  odświeżany 2×/s) — podłączony we wszystkich grach i w menu.
- Prośba do Ciebie: na telefonie, na którym laguje, zagrać 1–2 minuty z `?perf=1` w Ogrodach (spokój, stukanie,
  Zatoka) i w Łącz i Hoduj (przeciąganie) i przysłać zrzut ekranu + model telefonu. Ten sam pomiar po każdym kroku
  pokaże, czy poprawka działa naprawdę.
- Testy: jednostkowy (liczenie klatek i maksimum z fałszywym zegarem), e2e (licznik pojawia się tylko z `?perf=1`).

### W1 — wspólny „automat płynności” dla wszystkich gier (M)

- **Limit 60 klatek/s (od odpowiedzi z 2026-11-22):** na ekranach 90/120 Hz (jak w Redmi Note 10 Pro) przeglądarka
  może wołać rysowanie 90–120 razy na sekundę; gra rysuje najwyżej 60 razy (klatkę, która przyszła po mniej niż
  ok. 14 ms od poprzedniego rysunku, pomija — logika liczy się dalej według czasu). W pętli silnika
  (`shared/engine/loop.js`, `setRenderRate`) „60” znaczy dziś „przy każdej klatce” — zmieniamy na prawdziwy limit.
- Nowy moduł `shared/engine/quality.js` zamiast trzech kopii `dprCap` w grach zręcznościowych. Poziomy:
  - **0** — ostrość 2, wszystkie efekty (jak dziś na dobrym telefonie);
  - **1** — ostrość 1,5;
  - **2** — ostrość 1 i połowa cząsteczek;
  - **3** — ostrość 1, połowa cząsteczek i rysowanie 30 razy na sekundę („Oszczędzanie baterii”).
- Zejście poziom niżej, gdy przez 3 s średnio < 50 klatek/s (jak dziś w grach zręcznościowych); powrót poziom wyżej
  dopiero po 20 s stabilnych ≥ 58 klatek/s i najwyżej raz na minutę (żeby obraz nie „mrugał” ostrością). Poziom
  zapamiętany **na tym urządzeniu** (wpis urządzenia w `shared/sowie-cloud.js`, obok odblokowania hasłem — nie
  w profilu, bo profil jest wspólny dla wszystkich urządzeń; rozdz. 10.3) — następne wejście zaczyna od ostatniego
  poziomu, a nie od zera.
- Ręczny wybór w menu (Sowa → Ustawienia → „Płynność”): **Automatyczna** (domyślnie) / „Zawsze ostro” / „Oszczędzanie
  baterii” — wymaga Twojej decyzji (pytanie 5).
- Ograniczenie ruchu w systemie i wyłączone „Efekty” w menu działają jak dotąd (mniej cząsteczek, bez wstrząsów).
- Podłączenie: Sowie Ogrody i Łącz i Hoduj (nowe — dziś mają stałą ostrość 2), Sowia Ucieczka, Sowie Tory, Sowa
  w Chmurach (zamiana obecnego `dprCap`), nowa gra z Analizy 5.
- Testy: jednostkowe na fałszywym zegarze (zejście po 3 s, brak powrotu przed 20 s, histereza, zapamiętanie),
  e2e — przy sztucznie wolnych klatkach płótno dostaje mniejszą ostrość (hak testowy `quality()`).

### W2 — Sowie Ogrody: rysowanie warstwami (L)

1. **Zatoka Humbaka bez ogrodu pod wodą** (najprostsza i najbardziej odczuwalna poprawka — od niej zaczynamy):
   w trakcie Zatoki rysujemy tylko wodę, humbaka, liście i efekty. Żeby wyglądało tak samo jak dziś (ogród lekko
   prześwituje przez wodę), przy wejściu do Zatoki robimy jedno „zdjęcie” ogrodu do osobnego płótna i kładziemy je
   pod wodą jednym kopiowaniem. Zysk w próbie: Zatoka z 24 do 57 klatek/s (×4).
2. **Tło rozdziału z pamięci:** niebo, podłoże i nieruchome części dekoracji rysowane raz do osobnego płótna (przy
   zmianie rozdziału, tła z Kolekcji, rozmiaru ekranu, obrocie telefonu i zmianie poziomu ostrości); co klatkę jedno
   kopiowanie + **tylko ruchome drobiazgi** (migoczące gwiazdy, świetliki, nietoperze, duszki, dym z kociołka, fale —
   w `decor.js` każda dekoracja dostaje podział na część stałą i ruchomą). Zysk w próbie: +6–9 klatek/s.
3. **Rośliny jako gotowe obrazki:** każda roślina (gatunek × etap 1–5 × wielkość ogrodu × ostrość) rysowana raz do
   małego płótna przyciętego do samej rośliny; co klatkę jedno kopiowanie z lekkim obrotem (kołysanie jak dziś).
   Elementy migoczące (iskierki, mruganie, spadające listki) rysowane na wierzchu. Pamięć: najwyżej 32 obrazki
   naraz (ok. 300 KB każdy w ostrości 2, razem do ok. 10 MB), najdawniej używane wypadają (inaczej 43 gatunki × 5
   etapów zajęłyby ok. 50 MB). Podpisy „×N” też jako obrazki, odświeżane tylko przy zmianie liczby sztuk.
4. **Budżet efektów:** cząsteczki we wspólnym module silnika (`shared/engine/particles.js` — stała pula, bez nowych
   obiektów), limit zależny od poziomu automatu (120 / 80 / 50); napisy „+N” przy szybkim stukaniu łączone w jeden
   co 0,3 s (jak dziś „Kozi szał”), czcionka ustawiana raz na klatkę; poświata kózki jako gotowy obrazek.
5. **Rysowanie według potrzeby:** 60 klatek/s, gdy coś się dzieje (palec na ekranie, stuknięcie w ostatniej
   sekundzie, zdarzenie, Zatoka, ruch półki), w spokoju 30 klatek/s (rośliny i tak kołyszą się powoli). To połowa
   pracy przez większość czasu gry, mniej grzania i dłuższa bateria.
6. Drobiazgi z P9: lista widocznych roślin i miejsca bez nowych obiektów co klatkę; `production()` liczone raz na
   odświeżenie, a nie przy każdej karcie panelu.

Testy: jednostkowe (klucze pamięci obrazków: zmiana gatunku sowy, rozdziału, rozmiaru i ostrości unieważnia obrazki;
limit 32; budżet cząsteczek), e2e (Zatoka wygląda tak jak dziś — porównanie zrzutów z tolerancją; ogród po obrocie
telefonu i po zmianie tła z Kolekcji rysuje się poprawnie; „spokój” rysuje 30 klatek/s, stuknięcie przełącza na 60),
porównanie zrzutów przed i po dla 22 rozdziałów i 43 roślin (rysunki mają wyglądać identycznie). Zysk w próbie:
z 24–43 do 55–60 klatek/s (×4).

### W3 — Sowie Ogrody: płynne przesuwanie półki (S)

- W trakcie przesuwania palcem: zawsze 60 klatek/s (pierwszeństwo przed oszczędzaniem), odświeżanie panelu i napisów
  przesunięte na koniec ruchu, rośliny tylko z gotowych obrazków (bez rysowania nowych w trakcie ruchu — nowe
  obrazki dorabiane, gdy palec stoi).
- Ruch palca liczony z `getCoalescedEvents()` (wszystkie pozycje palca między klatkami, także gdy klatka się
  spóźni) tam, gdzie przeglądarka to umie (Chrome na Androidzie, nowsze Safari); w pozostałych — jak dziś. Półka
  nie „gubi” kawałków ruchu.
- Test e2e: przesunięcie palcem przy sztucznie wolnych klatkach kończy się w tym samym miejscu co przy szybkich.

### W4 — Łącz i Hoduj: plansza warstwami (M)

- Tło szklarni, deski półek i 63 jasne pola — raz do osobnego płótna (zmiana przy obrocie, rozmiarze, Basenie
  Humbaka, ozdobach z Kramu).
- Rośliny i przeszkody jako gotowe obrazki (łańcuch × poziom × rozmiar pola × ostrość; cyfra poziomu w obrazku),
  kołysanie i „pyknięcia” jako obrót i skala obrazka; tęczowe i diamentowe — iskierki na wierzchu.
- Automat płynności (W1) i rysowanie według potrzeby: plansza stoi większość czasu, więc w spokoju 30 klatek/s,
  przy przeciąganiu i animacjach 60.
- Przeciąganie jak w W3: `getCoalescedEvents()`, pierwszeństwo dla klatek w trakcie ruchu.
- Testy: jednostkowe (klucze obrazków), e2e (zrzuty planszy przed i po — identyczne z tolerancją; przeciąganie przy
  wolnych klatkach trafia w to samo pole). Zysk w próbie: z 22–24 do 49–55 klatek/s (×4).

### W5 — gry zręcznościowe (M)

1. Automat płynności z W1 zamiast `dprCap` (dziś schodzi tylko w dół w trakcie biegu i zaczyna każdy bieg od 2).
2. **Czas gry bez strat:** `maxSteps` w `shared/engine/loop.js` z 12 do 30 kroków (pokrywa całe 0,25 s
   `maxFrame`). Logika jest lekka (zmierzone: 22–36% wątku bez rysowania), więc nie grozi „spirala”; test
   jednostkowy: przy klatkach po 200 ms czas gry równa się czasowi zegara.
3. **Sowie Tory:** rekwizyty (regały, lodówki, szyldy z napisami, stragany) jako gotowe obrazki w kilku wielkościach
   (perspektywa — od daleka małe, z bliska duże), napisy wypalone w obrazkach; mniej zaokrąglonych prostokątów
   rysowanych co klatkę. Cel: ≥ 40 klatek/s przy ×4 (dziś 17).
4. HUD: tekst punktów odświeżany najwyżej 10×/s zamiast co klatkę (to daje najwięcej), jeden wspólny formater
   liczb (`Intl.NumberFormat("pl-PL")` tworzony raz — w pomiarze ok. 1,4× szybszy niż `toLocaleString`), „podskok”
   liczby bez wymuszania przeliczenia układu (animacja przez `animate()` zamiast `offsetWidth`).
- Testy: istniejące testy gier (bez zmian w zachowaniu), jednostkowy test pętli, zrzuty Sowich Torów przed i po.

### W6 — ustawienia i komunikat (S)

- Jeśli zdecydujesz (pytanie 5): w menu (Sowa → Ustawienia) wybór „Płynność: Automatyczna / Zawsze ostro /
  Oszczędzanie baterii”; w Ogrodach i Łącz i Hoduj ten sam komunikat co w grach zręcznościowych („Gra trochę zwalnia.
  Włączyć tryb Oszczędzanie baterii?”) — ale tylko wtedy, gdy automat zszedł już do najniższego poziomu i dalej nie
  nadąża.

### W7 — testy wydajności (M)

- **Skrypt pomiarowy w repozytorium** (`scripts/perf-bench.cjs`, uruchamiany ręcznie, nie w CI): te same scenariusze
  co w tej analizie (Ogrody: spokój, stukanie, zdarzenia, półka, Zatoka; Łącz i Hoduj: pełna plansza i przeciąganie;
  biegi gier zręcznościowych) przy CPU ×1/×4/×6, wynik w tabeli. Uruchamiany przed i po każdym kroku W2–W5, wyniki
  dopisywane do `STAN_PRAC.md`.
- **Testy w CI bez mierzenia klatek** (liczenie klatek na maszynie GitHuba jest niestabilne — rozdz. 4.3 d w
  `STAN_PRAC.md`): zamiast tego liczniki pracy (hak testowy `renderer.stats()`: ile roślin narysowano z kształtów,
  a ile z obrazków; ile cząsteczek; czy w Zatoce rysowano ogród) i porównanie zrzutów (wygląd bez zmian).
- **Testy na telefonie** (dopiszę do `TESTY_NA_TELEFONIE.md` jako W1–W3): ten sam przebieg z `?perf=1` przed i po.

### W8 — dokumentacja (S)

- `docs/Documentation.md` gier i katalogu głównego: opis warstw, pamięci obrazków, automatu płynności, licznika
  `?perf=1`; `docs/README.md`: krótko o ustawieniu „Płynność” i o tym, że na słabszym telefonie obraz może być
  minimalnie mniej ostry.

### Kolejność i rozmiar

| Krok | Co | Rozmiar | Zależy od |
| --- | --- | --- | --- |
| W0 | licznik `?perf=1` i pomiar na Twoim telefonie | S | — |
| W2.1 | Zatoka bez ogrodu pod wodą (szybka, odczuwalna poprawka) | S | — |
| W1 | automat płynności | M | W0 |
| W2.2–W2.6 | Ogrody: tło, rośliny, efekty, rysowanie według potrzeby | L | W1 |
| W3 | Ogrody: płynna półka | S | W2 |
| W4 | Łącz i Hoduj | M | W1 |
| W5 | gry zręcznościowe | M | W1 |
| W6 | ustawienie „Płynność” | S | W1, odpowiedź na pytanie 5 |
| W7, W8 | testy wydajności i dokumentacja | M | na bieżąco przy każdym kroku |

Razem ok. 6–9 dni pracy. **Proponuję zrobić to przed nową grą z Analizy 5** — nowa gra od początku skorzysta
z automatu płynności i rysowania warstwami (pytanie 7).

---

## 6. Czego się spodziewać po zmianach

| Gra | Dziś (×4 / ×6) | Po W1–W5 (cel, ×4 / ×6) |
| --- | --- | --- |
| Sowie Ogrody — spokój | 43 / 26 | 60 / 55 (w spokoju rysowanie 30/s — i tak płynnie) |
| Sowie Ogrody — dużo się dzieje | 33–36 / 23 | ≥ 55 / ≥ 45 |
| Sowie Ogrody — Zatoka Humbaka | 24–28 / 16 | 60 / ≥ 54 |
| Łącz i Hoduj — przeciąganie | 22 / 13 | ≥ 49 / ≥ 35 |
| Sowie Tory | 17 / 9 | ≥ 40 / ≥ 25, bez zwalniania gry |
| Sowia Ucieczka, Sowa w Chmurach | 37–39 / 20–23 | ≥ 50 / ≥ 35 |

Cele dla „słabszego telefonu” są ostrożne — część telefonów będzie miała więcej (karta graficzna). Ostateczną
ocenę da pomiar na Twoim telefonie (W0 → po W2–W5).

---

## 7. Ryzyka

| Ryzyko | Co robimy |
| --- | --- |
| Rośliny z gotowych obrazków wyglądają inaczej (rozmyte przy obrocie, ucięte liście) | obrazki w pełnej ostrości z zapasem marginesu; porównanie zrzutów wszystkich 43 roślin × 5 etapów przed i po |
| Zniknie część animacji (migotanie, mruganie, spadające listki) | podział na część stałą (obrazek) i ruchomą (rysowaną na wierzchu) — lista ruchomych elementów każdej rośliny i dekoracji w dokumentacji; przegląd na zrzutach i na żywo |
| Za dużo pamięci na obrazki (słabsze telefony mają mało pamięci dla przeglądarki) | limit 32 obrazków roślin (ok. 10 MB), tło jedno płótno (ok. 2 MB w ostrości 2), zwalnianie przy wyjściu z gry; licznik pamięci w `?perf=1` |
| Stare obrazki po zmianie (gatunek sowy z Butiku, tło z Kolekcji, obrót telefonu, nowy poziom ostrości) | klucz obrazka zawiera wszystko, od czego zależy wygląd; testy jednostkowe unieważniania |
| Mniejsza ostrość przeszkadza | tylko gdy telefon nie nadąża; „Zawsze ostro” w ustawieniach (jeśli zdecydujesz); powrót do pełnej ostrości, gdy telefon znów nadąża |
| WebKit (Safari na iPhonie) zachowuje się inaczej | zwykłe elementy `canvas` (bez `OffscreenCanvas`, którego Safari przed wersją 16.4 nie ma); testy w CI na WebKit jak dotąd |
| Testy wydajności w CI niestabilne | w CI tylko liczniki pracy i zrzuty, liczenie klatek tylko ręcznie (W7) |
| Zmiany w silniku (`loop.js`, `quality.js`) dotykają wszystkich gier | małe kroki, istniejące testy wszystkich gier, osobny commit na każdą grę |

---

## 8. Co zostaje bez zmian

- Zapis postępu (`SowieCloud`), reguły Firestore, identyfikatory gier i dokumentów — zmiany dotyczą tylko rysowania.
- Wygląd roślin, teł, postaci i efektów (porównanie zrzutów przed i po), dźwięk, sterowanie, zasady gry.
- Menu — rysuje już 30 klatek/s i mieści się w czasie nawet przy ×6.

---

## 9. Pytania do właściciela (prostym językiem)

Odpowiedzi z 2026-11-22 i co z nich wynika: [rozdział 10](#10-odpowiedzi-właściciela-i-zmiany-planu-2026-11-22).

1. **Na jakim telefonie gra laguje?** Wystarczy nazwa z ustawień telefonu (np. „iPhone 11”, „Samsung Galaxy A12”,
   „Xiaomi Redmi Note 9”). Czy to ten sam telefon, na którym robisz testy, czy telefon innej osoby?
2. **„Zawiesza się przesuwanie roślin” — w której grze?** (a) w **Sowich Ogrodach**, gdy przesuwasz palcem linię
   roślin w ogrodzie, (b) w **Łącz i Hoduj**, gdy przeciągasz roślinę po półkach, (c) w obu.
3. **Kiedy laguje najbardziej?** (a) w Zatoce Humbaka, (b) gdy szybko stukasz w ogród, (c) gdy jest kózka,
   ciężarówka albo telefon, (d) cały czas, nawet gdy nic nie robisz. Można zaznaczyć kilka.
4. **Czy gra może sama, na słabszym telefonie, odrobinę zmniejszyć ostrość obrazu, żeby była płynna?** Na
   większości telefonów różnicy prawie nie widać, a gra przestaje się „ciąć”. **Polecam: tak, automatycznie** (gry
   z biegającą sową robią tak już od września).
5. **Czy w ustawieniach ma być przełącznik „Płynność”** (Automatyczna / Zawsze ostro / Oszczędzanie baterii)? Czy
   wystarczy, że gra sama dobierze? **Polecam: automat + przełącznik** (dla kogoś, kto woli zawsze ostry obraz albo
   dłuższą baterię).
6. **Kolejność:** najpierw Sowie Ogrody i Łącz i Hoduj (tam jest zgłoszenie), potem gry z biegającą sową — dobrze?
7. **Najpierw poprawki wydajności, potem nowa gra (Analiza 5)?** **Polecam: tak** — nowa gra od początku będzie
   korzystała z tych samych usprawnień, więc nie będzie lagować na słabszych telefonach.
8. **Czy możesz raz zrobić pomiar na telefonie, na którym laguje?** Po pierwszej poprawce (W0) wyślę adres
   z dopiskiem `?perf=1` — w rogu ekranu pojawią się liczby; wystarczy zagrać minutę i wysłać zrzut ekranu.

---

## 10. Odpowiedzi właściciela i zmiany planu (2026-11-22)

### 10.1. Odpowiedzi

| # | Pytanie | Odpowiedź | Co z tego wynika |
| --- | --- | --- | --- |
| 1 | Na jakim telefonie laguje? | „użytkownik korzysta z **Redmi Note 10 Pro** z oprogramowaniem **MIUI Global 14.0.7** i gra na mobilnej przeglądarce **Chrome**” | profil pomiarowy tego telefonu (10.2), limit 60 klatek/s (W1) |
| 2 | „Zawiesza się przesuwanie roślin” — w której grze? | bez odpowiedzi | poprawiamy obie: półkę w Sowich Ogrodach (W3) i przeciąganie w Łącz i Hoduj (W4) |
| 3 | Kiedy laguje najbardziej? | bez odpowiedzi | poprawiamy wszystkie scenariusze z rozdz. 3; pomiar W0 pokaże resztę |
| 4 | Czy gra może sama zmniejszyć ostrość na słabszym telefonie? | „Zgodnie z rekomendacją” — **tak, automatycznie** | automat płynności (W1) |
| 5 | Czy w ustawieniach ma być przełącznik „Płynność”? | „Zgodnie z rekomendacją” — **automat + przełącznik** | W6 |
| 6 | Kolejność: najpierw Ogrody i Łącz i Hoduj, potem gry z biegającą sową? | „Zgoda, chociaż i tak wszystkie poprawki zrobimy w ramach jednego zadania i jednego PR na main.” | W0–W8 w jednym zadaniu, jeden PR na `main` (rozdz. 10.3) |
| 7 | Najpierw poprawki wydajności, potem nowa gra? | „Zgoda.” | kolejność prac — 10.3 |
| 8 | Pomiar na telefonie z `?perf=1`? | „Bardzo dobry pomysł. Zgoda.” | W0 z instrukcją pomiaru (10.3) |

### 10.2. Telefon użytkownika i co z tego wynika

| | Redmi Note 10 Pro (wersja globalna) |
| --- | --- |
| System | MIUI Global 14.0.7 (Android) |
| Przeglądarka | Chrome na Androidzie — płótno rysowane przez kartę graficzną, obsługuje `getCoalescedEvents()` (W3) |
| Procesor | Snapdragon 732G (2 rdzenie 2,3 GHz + 6 rdzeni 1,8 GHz) — telefon średniej klasy; w pomiarach z kontenera to w przybliżeniu „CPU ×3–4” |
| Karta graficzna | Adreno 618 |
| Ekran | 6,67″ AMOLED 1080 × 2400, **do 120 Hz**; w Chrome szerokość ok. 393 px CSS przy gęstości 2,75 (gry rysują płótno w ostrości 2 — górny limit w kodzie) |

Wnioski:

1. **120 Hz:** jeśli w telefonie jest włączone odświeżanie 120 Hz (MIUI: Ustawienia → Wyświetlacz → Częstotliwość
   odświeżania), Chrome może wywoływać rysowanie 120 razy na sekundę. Sowie Ogrody i Łącz i Hoduj rysują wtedy dwa
   razy więcej niż na ekranie 60 Hz (gry zręcznościowe też — pętla rysuje przy każdej klatce). Na płynność obrazu
   gry 60 klatek/s w zupełności wystarcza, więc **W1 dostaje limit 60 klatek/s**. Licznik `?perf=1` (W0) pokaże,
   ile razy na sekundę przeglądarka naprawdę woła rysowanie.
2. **Nagrzewanie:** długie, ciężkie rysowanie nagrzewa telefon, a MIUI obniża wtedy taktowanie procesora — gra
   może „z czasem” zwalniać (pasuje do „animacje się spowalniają i wszystko wolniej działa”). Limit 60 klatek/s,
   rysowanie według potrzeby (W2.5, W4) i automat płynności zmniejszają też grzanie i zużycie baterii.
3. **Oszczędzanie baterii w MIUI** obniża taktowanie i odświeżanie — przy pomiarze W0 warto je wyłączyć (albo
   zapisać, że było włączone), żeby liczby były porównywalne przed i po poprawkach.
4. **Profil pomiarowy:** skrypt `scripts/perf-bench.cjs` (W7) dostaje profil „Redmi Note 10 Pro” — 393 × 873 px CSS,
   gęstość 2,75, przeglądarka Chrome na Androidzie, CPU ×4 (i ×3) — jako profil odniesienia dla wszystkich gier
   i nowej gry z Analizy 5. Do testów w GitHubie go nie dokładamy (każdy nowy profil to ok. 1/10 dłuższy przebieg);
   układ ekranu takiej szerokości sprawdzają już profile Pixel 7 (412 px) i Android 360 px.

### 10.3. Zmiany w planie

- **Kolejność prac (decyzja z 2026-11-22):** 1) aktualizacja dokumentacji, 2) analiza Sowiej Dziupli
  (`ANALIZA_7`), **3) poprawki W0–W8 z tej analizy**, 4) nowa gra Sowie Trójki (Analiza 5) — wszystko w jednym
  zadaniu i jednym PR na `main`. Przed scaleniem: pełny `npm test` u mnie i zielone testy w GitHubie.
- **W0** — licznik `?perf=1` pokazuje także, ile razy na sekundę przeglądarka woła klatki (60 / 90 / 120).
  Instrukcja pomiaru dla Ciebie (dopiszę do `TESTY_NA_TELEFONIE.md` jako test W1): Chrome na Redmi, oszczędzanie
  baterii w telefonie wyłączone, po minucie w Sowich Ogrodach (spokój, szybkie stukanie, Zatoka Humbaka) i w Łącz
  i Hoduj (przeciąganie roślin) — zrzut ekranu z licznikiem. Ten sam pomiar po wdrożeniu poprawek.
- **W1** — limit 60 klatek/s (rozdz. 5); **poziom automatu i wybór „Płynność” zapamiętywane na tym urządzeniu**, a nie
  w profilu: profil jest wspólny dla wszystkich telefonów i komputerów rodziny, a każde urządzenie ma inną moc.
  Zapis przez `shared/sowie-cloud.js` (tylko ten plik może używać pamięci przeglądarki — zasada z Analizy 3) w tym
  samym wpisie co odblokowanie urządzenia hasłem; **nic nie trafia do bazy Firestore**. Dotychczasowe ustawienie
  `settings.batterySaver` w profilu zostaje i dalej działa (włączone = „Oszczędzanie baterii”).
- **W6** — przełącznik „Płynność: Automatyczna / Zawsze ostro / Oszczędzanie baterii” w menu (Sowa → Ustawienia);
  w grach zręcznościowych także w menu pauzy.
- **Bezpieczeństwo produkcji:** poprawki zmieniają tylko rysowanie — zapis postępu, jego format i reguły Firestore
  zostają bez zmian; wszystkie testy na emulatorze albo w pamięci (zasada z Analizy 3, rozdz. 8.1); po scaleniu
  PR dwukrotne odświeżenie strony pobiera nową wersję jak zwykle.
- **Nowa gra (Analiza 5, rozdz. 14.4 „Wydajność od pierwszego dnia”)** korzysta z tych samych rozwiązań od
  pierwszego dnia: limit 60 klatek/s, automat płynności, licznik `?perf=1`, rysowanie według potrzeby, kafelki
  z gotowych obrazków, budżet sprawdzany na profilu „Redmi Note 10 Pro”.

---

## 11. Wykonanie (2026-11-22)

Wszystkie kroki W0–W8 zrobione w kroku 3 kolejności prac (gałąź zadania, jeden PR na `main` razem z krokami 1, 2
i 4). Zapis postępu, jego format i reguły Firestore — bez zmian; jedyna nowa pamięć to wybór „Płynność” i poziom
automatu we **wpisie urządzenia** w pamięci przeglądarki (`SowieCloud.devicePrefs`, nigdy w bazie).

| Krok | Co zrobione | Gdzie w kodzie |
| --- | --- | --- |
| W0 | licznik `?perf=1`: klatki narysowane przez grę, najdłuższa przerwa (5 s), odświeżanie ekranu, ostrość płótna, poziom automatu, pamięć | `shared/engine/perf-meter.js`; wszystkie gry |
| W1 | automat płynności (poziomy 0–3: ostrość 2 / 1,5 / 1 / 1 + 30 kl./s, cząsteczki ×1 / ×1 / ×0,5 / ×0,5; w dół po 3 s < 50 kl./s, w górę po 20 s ≥ 58 i najwyżej raz na minutę; cel liczony względem zamierzonej liczby klatek — celowe 30 w spokoju to nie „wolno”); limit 60 kl./s na ekranach 90/120 Hz; pętla nadrabia 30 kroków zamiast 12 | `shared/engine/quality.js`, `loop.js`, `shell.js`; gry zręcznościowe bez `dprCap` |
| W2 | Sowie Ogrody: tło w warstwie (≤ 15×/s), rośliny z obrazków (tabela granic 43 gatunków, ≤ 2 odświeżenia na klatkę, każdy ≤ 15×/s), Zatoka — jedno „zdjęcie” ogrodu pod wodą, rysowanie 60 kl./s tylko w ruchu (30 w spokoju), limity efektów z automatu, szerokości podpisów w pamięci | `SowieOgrody/ogrod/render.js`, `main.js` |
| W3 | półka: panel nie odświeża się w trakcie przesuwania, rozpęd z wszystkich położeń palca (`getCoalescedEvents`), bez przebudowy atlasu przy obniżeniu ostrości (dawniej ok. 650 ms „szarpnięcia”) | `SowieOgrody/ogrod/main.js` |
| W4 | Łącz i Hoduj: tło w warstwie (≤ 5×/s), rośliny z obrazków (jeden na rodzaj, ≤ 3 odświeżenia na klatkę, ≤ 10×/s; iskierki i kózki na żywo), automat płynności, 30 kl./s w spokoju | `LaczIHoduj/render.js`, `main.js`, `plants.js` |
| W5 | gry zręcznościowe na automacie płynności; Sowie Tory — rekwizyty (regały, lodówki, szyldy, bloki…) jako obrazki w pamięci: tabela granic `PROP_BOUNDS` i lista ruchomych `PROP_ANIMATED`, obrazek o 15% większy „na zapas” (rekwizyty rosną, zbliżając się), ≤ 4 nowe na klatkę, ruchome ≤ 15×/s, tuż przy sowie (> 0,5 mln pikseli) wprost; HUD — tekst wyniku ≤ 10×/s, jeden formater liczb, podskok przez Web Animations bez przeliczania układu | `SowieTory/props.js`, `render.js`; `shared/ui/hud.js` |
| W6 | ustawienie „Płynność” (Automatyczna / Zawsze ostro / Oszczędzanie baterii) w menu (Sowa → Ustawienia) i w menu pauzy; propozycja „Oszczędzania baterii” także w Ogrodach i Łącz i Hoduj — dopiero gdy automat zszedł najniżej (albo „Zawsze ostro”) i gra przez 5 s ma < 45 kl./s | `quality.js` (`onStruggle`), `shell.js` (`createSlowBanner`), `owl-tab.js`, `pause-menu.js`, `ui.css` |
| W7 | `scripts/perf-bench.cjs` (profil Redmi Note 10 Pro, `--cpu`, `--gry`, `--tryb`); testy jednostkowe `tests/unit/plynnosc.test.mjs` (8) i e2e `tests/e2e/telefon/plynnosc.spec.js` (7 na profil — liczniki pracy, granice rekwizytów, ustawienie na urządzeniu, propozycja oszczędzania) | jw. |
| W8 | dokumentacja: `docs/Documentation.md` (silnik, interfejs, testy, „Płynność — Analiza 6”), `docs/README.md`, dokumentacje i instrukcje pięciu gier, testy P1–P3 w `TESTY_NA_TELEFONIE.md`, `STAN_PRAC.md` 0.4 | — |

Odstępstwa od planu (rozdz. 5): rekwizyty Sowich Torów nie są gotowymi obrazkami „w kilku wielkościach”, tylko
obrazkami robionymi w biegu dla każdego widocznego rekwizytu (wielkość dopasowana do odległości) — bez zapasu
obrazków na dysku i bez zmiany wyglądu; propozycja oszczędzania korzysta z pomiaru automatu (`onStruggle`) zamiast
osobnego monitora; w oszczędzaniu baterii gry zręcznościowe mają połowę cząsteczek (dawniej 0,4).

Pomiar po zmianach (Chromium bez karty graficznej, profil Redmi Note 10 Pro 393 × 873, gęstość 2,75, CPU ×4,
`node scripts/perf-bench.cjs`):

| Gra — scenariusz | Przed (rozdz. 3) | Po |
| --- | --- | --- |
| Sowie Ogrody — spokój | 43 | 58 (gra rysuje 30, wątek zajęty w 65%) |
| Sowie Ogrody — stukanie / zdarzenia / wszystko naraz | 38 / 35 / 33–36 | 56 / 56 / 56 |
| Sowie Ogrody — przesuwanie półki | 42–43 | 59 |
| Sowie Ogrody — Zatoka Humbaka | 24–28 | 59 |
| Łącz i Hoduj — pełna plansza / przeciąganie | 24 / 22 | 43 / 42 (ostrość 1,5) |
| Sowie Tory — bieg | 17 (21,5 na profilu Redmi) | 38–41 (ostrość 1,5); 32,6 przy „Zawsze ostro”; ×6: 12 → 16,7, dystans w 6 s 78 → 83 m |
| Sowia Ucieczka / Sowa w Chmurach | 37 / 39 (44–48 / 46 na profilu Redmi) | 44–49 / 47 |

Ogrody nie musiały nawet obniżać ostrości (automat został na poziomie 0). Wygląd bez zmian — zrzuty przed / po
(ogród „późnej gry”, Zatoka, 4 plansze Sowich Torów w tej samej chwili biegu) różnią się tylko wygładzaniem krawędzi.
**Ostateczna ocena: pomiar na Twoim telefonie** — testy P1–P3 w `TESTY_NA_TELEFONIE.md` (licznik `?perf=1`).

---

## Załącznik A. Skrypty pomiarowe

Skrypty były uruchamiane tylko w moim kontenerze (katalog roboczy poza repozytorium); w kroku W7 trafią do
repozytorium jako `scripts/perf-bench.cjs` (trafiły — rozdz. 11). Wszystkie: Playwright (Chromium), serwer plików statycznych na
`127.0.0.1`, `?cloud=memory`, odblokowane urządzenie w skrypcie startowym kontekstu (nigdy w kodzie gry).

| Skrypt | Co robi |
| --- | --- |
| `micro.cjs` | rysuje na płótnie 390 × 300 px CSS (ostrość 2) niebo, dekoracje 16 rozdziałów, każdą z 43 roślin na etapie 1 i 5, napisy i cząsteczki; czas z wymuszoną rasteryzacją (`getImageData`) |
| `ogrody.cjs` | Sowie Ogrody ze stanem „późnej gry” wstrzykniętym do `MemoryBackend` (podmiana jednej linii `shared/sowie-cloud.js` w locie); scenariusze z rozdz. 2; klatki z `requestAnimationFrame`, długie zadania (`PerformanceObserver`), metryki CDP (`Performance.getMetrics`), profil CDP (`Profiler`) |
| `variants.cjs` | jak wyżej, z podmianą fragmentów `render.js` / `main.js` w locie: `nodraw`, `nopanel`, `dpr1`, `dpr15`, `bgcache`, `plantcache` (obrazek przycięty do nieprzezroczystych pikseli), `baysolid`, `fps30` i ich połączenia |
| `games.cjs` | menu, Sowia Ucieczka, Sowie Tory, Sowa w Chmurach (start z haka `start()`, samouczek oznaczony jako ukończony w pamięci) i Łącz i Hoduj z 63 roślinami; także czas gry względem zegara |
| `lih.cjs` | Łącz i Hoduj: warianty `dpr1`, `dpr15`, `itemcache` i przeciąganie rośliny zdarzeniami wskaźnika |
| `tory-prof.cjs` | profil procesora Sowich Torów w trakcie biegu |

Środowisko: 4 rdzenie, 16 GB pamięci, Chromium z Playwright 1.56 bez karty graficznej (rysowanie płótna
programowe), profil 412 × 915 px, `deviceScaleFactor` 2,625, `isMobile`, `hasTouch`; spowolnienie przez
`Emulation.setCPUThrottlingRate`. Każdy wariant w osobnym kontekście przeglądarki, pomiary po kolei (bez
równoległych przeglądarek, które zaburzałyby wynik).
