# Analiza 8 — nowa gra farmerska: Sowia Farma (dokument projektowy)

> Data: 2026-11-23 · Podstawa: prośba właściciela z 2026-11-23 (dosłownie w [rozdziale 1](#1-prośba-dosłownie-i-numer)),
> atlas mechanik [`Mechaniki_Littlewood_Stardew_Valley_Sprout_Valley_Fields_of_Mistria.md`](Mechaniki_Littlewood_Stardew_Valley_Sprout_Valley_Fields_of_Mistria.md),
> krótki przegląd w internecie ([Załącznik A](#załącznik-a-źródła)) i kod na `main` (Sowi Silnik `shared/engine/`,
> Sowi Świat `shared/world/`, SowieCloud, rośliny z Sowich Ogrodów i Łącz i Hoduj, dziki z Sowich Torów) ·
> Status: **decyzje właściciela 2026-11-24** ([rozdział 20](#20-pytania-do-właściciela-prostym-językiem)); budowa
> **po Sowiej Dziupli i Wypluffkach** (Analizy 7 i 7b — „Farmę dodamy później”), a po pierwszej wersji audyt kodu (F11) ·
> Zasady pracy bez zmian: [`ANALIZA_3_Plan_prac.md`, rozdz. 8.1](ANALIZA_3_Plan_prac.md); zasada „nic nie ginie”:
> [`ANALIZA_4`, rozdz. 2](ANALIZA_4_Uwagi_z_testow_poprawki_i_rozbudowa.md); wydajność od pierwszego dnia:
> [`ANALIZA_6`](ANALIZA_6_Wydajnosc_lagi.md); bramka zapisu nowej gry: [`ANALIZA_5`, rozdz. 13.1a](ANALIZA_5_Nowa_gra_Sowie_Trojki_match3.md).

Makieta to **rysunek poglądowy** zrobiony z prawdziwych elementów SowieGry: Sówka (także w kapeluszu ogrodnika
z Garderoby), Pójdźka (gatunek z Sowiego Butiku), kózka i humbak z atlasu Sowiego Świata, rośliny narysowane tymi
samymi funkcjami co w Sowich Ogrodach (Sowi storczyk, Monstera, Kaktus). Gołębie, dziki z warchlakami, warzywa,
narzędzia i budynki są narysowane na nowo, w tym samym stylu — tylko na potrzeby makiety. **Od decyzji 2026-11-24**
waluta Farmy nazywa się **Dziupaki** (na makiecie to jeszcze żołędzie 🌰), a doniczki na parapecie stoją na nim
dolną krawędzią (jak w Sowiej Dziupli — uwaga D1a).

---

## 0. W skrócie (dla właściciela)

- **Sowia Farma** — siódma gra SowieGry i pierwsza „duża”: Sówka **chodzi i lata po swojej farmie**, sieje warzywa
  na **polu**, kwiaty w **ogrodzie**, egzotyczne rośliny w **szklarni** i rośliny ozdobne w **domu** (na parapetach
  i półkach — te same rysunki co w Sowich Ogrodach, łącznie z mrugającym Sowim storczykiem).
- **Przytulnie, bez pośpiechu:** **nie ma zegara ani staminy (energii)**. Dzień trwa, dopóki Sówka nie pójdzie spać —
  na łóżko albo **na gałąź** (to jedna z ozdób). W nocy rośliny rosną, a rano karta „Poranek” mówi, co się zmieniło.
  Niepodlana roślina **nie usycha** — po prostu tego dnia nie rośnie. Nic nie umiera i nic nie ginie.
- **Pogoda:** słońce, deszcz, burza, mgła, wiatr, upał, tęcza, a zimą śnieg. **Deszcz podlewa pole i ogród** (szklarni
  i domu nie — tam jest dach). **Telewizor** (ulepszenie domu) pokazuje prognozę na jutro, którą czyta… humbak.
- **Miasteczko** (ulica nad zatoką): **Kozi Sklepik** (nasiona), **Targ w porcie u humbaka** (sprzedaż plonów,
  „hit dnia”), **Warsztat Pójdźki** (narzędzia, zraszacze, strachy), **Stolarnia Puchacza** (rozbudowy), **Kwiaciarnia
  Płomykówki** (rośliny do domu), **Przytulne Gniazdko Uszatki** (meble — np. gałąź do spania) i **tablica ogłoszeń**
  z zamówieniami mieszkańców. Kozy, humbak i sowy już są narysowane w grach — mieszkańcy prawie „za darmo”.
- **Ekwipunek i ulepszenia:** pasek narzędzi na dole ekranu, plecak (12 → 36 miejsc — większy to ulepszenie; gdy
  jest pełny, gra ostrzega, a opróżniasz go sam), skrzynia w domu; narzędzia
  w 5 poziomach (zwykłe → miedziane → srebrne → złote → tęczowe), **zraszacze** (4 rodzaje, największy to fontanna-humbak),
  **strach-sowa** (gołębie boją się sów — tak jest naprawdę), **płot** przeciw dzikom.
- **Rozbudowa:** **pole** 16 → 80 grządek, **szklarnia** od naprawy (8 miejsc) do 48 miejsc i palmiarni, **dom** od
  chatki z jednym parapetem do domu z telewizorem, półkami, strychem i oranżerią. Do tego drobiazgi: gałąź do spania,
  hamak, tapety, dywany, strój stracha z Garderoby.
- **Wrogowie bez walki:** **gołębie** wydziobują świeżo zasiane nasiona, **dziki z warchlakami** w nocy ryją grządki,
  gdy płot jest słaby. Sówka je **przepędza** — stuknięcie, przelot i „Hu-hu!”; zwierzaki uciekają w podskokach.
  Szkody są małe i zawsze do naprawienia, a **Tryb Przytulny** wyłącza szkodniki całkiem. Kod ma od początku miejsce
  na przyszłą „przygodę” (np. Las z walką), ale w pierwszej wersji walki nie ma.
- **Telefon najpierw:** stuknięcie = „leć tam i zrób to”, **przeciągnięcie palcem po grządkach = podlej / zasiej /
  zbierz wszystkie po drodze** (jak w Hay Day), pasek w strefie kciuka, sklepy jako arkusze od dołu. Na komputerze
  mysz i klawiatura (WASD, 1–9, Spacja). Tablet i telefon poziomo — więcej mapy naraz.
- **Około 40 roślin na start** (warzywa, kwiaty, rośliny szklarniowe i ozdobne, w tym nowe w ulubionym stylu
  „mrugająca sówka jako kwiat”: Sowi słonecznik, Kozi liść, Humbakowiec, Pisklęce pąki), potem kolejne.
- **To duża gra:** pierwsza wersja (**„Pierwszy sezon”**) to ok. **44–50 dni pracy (9–10 tygodni)** w 11 etapach (F0–F10), najpierw
  jako **podgląd bez zapisu** (jak Sowie Trójki), potem — po Twoich testach i publikacji reguł — zapis i karta
  w Dziupli. **Kiedy:** po Sowiej Dziupli i Wypluffkach (Twoja decyzja: „Farmę dodamy później”). Po pierwszej wersji —
  **audyt wszystkich plików i komentarze w kodzie** (etap F11).
- **Decyzje z 2026-11-24** ([rozdział 20](#20-pytania-do-właściciela-prostym-językiem)): waluta **Dziupaki**, pory roku
  z furtką na rośliny sezonowe i mrozy, jakość plonów z **nawozami jakości** (u kozy i za Wypluffki), pełny plecak
  z ostrzeżeniem, przyjaźnie w drugim etapie, reszta według rad. Pytań otwartych nie ma.

![Makieta: A — Farma (podlewanie przeciągnięciem palca, zraszacz, strach-sowa, gołąb na świeżo zasianej grządce, dziki z warchlakami za płotem, pasek narzędzi); B — Dom (parapet z roślinami ozdobnymi, telewizor z prognozą humbaka, gałąź do spania, arkusz „Kończysz dzień?”); C — Miasteczko (Kozi Sklepik, Targ w porcie u humbaka, Pójdźka z warsztatu, arkusz sklepu z nasionami)](ANALIZA_8_farma_makieta.png)

---

## 1. Prośba (dosłownie) i numer

Numer w [`UWAGI_WLASCICIELA.md`](UWAGI_WLASCICIELA.md): **N2** (nowa gra; N1 — Sowie Trójki).

| Data | Wiadomość (dosłownie) |
| --- | --- |
| 2026-11-23 | „Zapoznaj się z repo. Przeprowadź analizę rozbudowy i zapisz jej wyniki w Analizy/ Planuję dodać kolejną grę (po wdrożeniu Sowiej Dziupli jako menu). Ma to być większa gra farmerska w stylu np. Littlewood, Stardew Valley, Sprout Valley czy Fields of Mistria. Możesz szukać informacji w internecie. Częściowy opis wymienionych gier masz w Analizy/Mechaniki_Littlewood_Stardew_Valley_Sprout_Valley_Fields_of_Mistria.md Ma się nazywać Sowia Farma. Chcę, żeby to była gra w której porusza się sową i sieje warzywa na polu, w szklarni oraz w domu (rośliny ozdobne). Chcę, żeby był system upgrade Na początek nie chcę elementów walki (ale zostaw taką opcję na przyszłą rozbudowę). Chcę, żeby była możliwość rozbudowy szklarni, pola i domu (np. więcej slotów do sadzenia, telewizor z prognozą pogody na kolejny dzień). Chcę, żeby było wiele rodzajów roślin do uprawy. Nie chcę mechaniki realnego upływu czasu ani „staminy”. Gracz sam decyduje kiedy kończy się dzień kładąc się spać. Gra ma być „cozy”. Chcę, żeby były różne pogody (np. przy deszczu nie trzeba podlewać kwiatów na polu/w ogrodzie). Możesz dodać drobne elementy customizacyjne/upgrady (np. wymiana łóżka na gałąź do spania). Chcę, żeby było miasto gdzie Sowa będzie sprzedawać plony i kupować nasiona (NPC mogą być kozy, humbaki i inne sowy) Chce, żeby był system ekwipunku i możliwość ulepszania narzędzi (narzędzia rolnicze, zraszacze, strach na wróble) Gra ma być wygodna do obsługi na telefonie (to główne urządzenie użytkownika), tablecie i PC. Głównymi wrogami mają być Gołębie i Dziki. Sowa będzie musiała je przepędzać. Mają stylistycznie być „cute”. Przygotuj analizę rozbudowy. Nie zmieniaj kodu gry. Przygotuj tylko plik z analizą dotyczącej rozbudowy. Jeżeli będą jakieś dodatkowe pytania to dopisz je na końcu analizy. Zapisz je prostym językiem jak dla osoby bez wiedzy informatycznej.” |
| 2026-11-23 | „Analizę wrzuć na gałąź Main.” |

| Wymaganie | Gdzie w projekcie |
| --- | --- |
| większa gra farmerska w stylu Littlewood / Stardew / Sprout / Mistria, nazwa „Sowia Farma” | rozdz. 3, 4 |
| poruszanie się sową | rozdz. 6 (sterowanie), 7 (miejsca) |
| sianie na polu, w szklarni i w domu (rośliny ozdobne) | rozdz. 8 |
| system ulepszeń (upgrade) | rozdz. 13 |
| bez walki na początek, z furtką na przyszłość | rozdz. 10.5 |
| rozbudowa szklarni, pola i domu (więcej miejsc, telewizor z prognozą) | rozdz. 9.2, 13.3–13.5 |
| wiele rodzajów roślin | rozdz. 8.3 (ok. 40 na start) |
| bez realnego upływu czasu i bez staminy; dzień kończy sen; „cozy” | rozdz. 5 |
| różne pogody; deszcz podlewa pole i ogród | rozdz. 9 |
| drobna personalizacja (np. gałąź zamiast łóżka) | rozdz. 13.6 |
| miasto: sprzedaż plonów, kupno nasion; NPC — kozy, humbaki, sowy | rozdz. 11 |
| ekwipunek; ulepszanie narzędzi, zraszaczy, stracha na wróble | rozdz. 12, 13.1–13.2 |
| wygoda na telefonie (główne urządzenie), tablecie i PC | rozdz. 6 |
| wrogowie: gołębie i dziki, przepędzanie, styl „cute” | rozdz. 10 |
| po wdrożeniu Sowiej Dziupli | rozdz. 15.2, 19 |
| pytania prostym językiem na końcu | rozdz. 20 |

---

## 2. Co już mamy w SowieGry (i co się przyda)

Sowia Farma nie zaczyna od zera — większość „silnika” i część grafik już jest. Nowe są: **mapa z kafelków, po której
chodzi postać**, symulacja dnia, ekwipunek i sklepy z mieszkańcami.

| Co mamy | Gdzie | Do czego w Farmie |
| --- | --- | --- |
| pętla gry, widok w jednostkach świata, kamera z płynnym śledzeniem, gesty (stuknięcie, przytrzymanie, przeciąganie), sceny z przejściami | `shared/engine/` (`loop.js`, `view.js`, `camera.js`, `input.js`, `scene.js`) | ruch Sówki, kamera za Sówką, przejścia farma ↔ dom ↔ szklarnia ↔ miasteczko |
| powłoka telefonu (pauza przy wyjściu z aplikacji, bezpieczne obszary), **automat płynności** i limit 60 kl./s, licznik `?perf=1` | `shell.js`, `quality.js`, `perf-meter.js` | płynność na Redmi Note 10 Pro od pierwszego dnia (Analiza 6) |
| atlas grafik z SVG (ostre na każdym ekranie) | `sprites.js`, `assets.js` | postacie, narzędzia, urządzenia |
| **Sówka** z pozami (stoi, mruga, bieg, skok, szybuje, radość), Garderoba (13 dodatków), **7 gatunków sów** z Butiku | `shared/world/owl.js`, `species.js`, `assets/svg/sowa/`, `garderoba/` | gracz; **mieszkańcy-sowy** (Pójdźka, Puchacz, Płomykówka, Uszatka, Śnieżna, Puszczyk) bez nowych rysunków; **strach-sowa** w stroju z Garderoby |
| **kózki** (koza, skok, chustki), **humbak** | `assets/svg/kozki/`, `humbak/` | mieszkańcy: kozy w sklepie, humbak w porcie i w telewizorze |
| **43 rysunki roślin** z etapami wzrostu 1–5 (w tym mrugający **Sowi storczyk**) | `SowieOgrody/ogrod/plants.js` (`createPlantShapes`) | **rośliny ozdobne w domu i w szklarni** — bez nowych rysunków |
| rośliny Łącz i Hoduj (Monstera, Pilea, Paproć, Kaktus, Storczyk, Słonecznik, Truskawka, Lotos, Baobab) | `LaczIHoduj/plants.js` (`createPlantPainter`) | dodatkowe rośliny doniczkowe, truskawka |
| **dziki** (plansza PRL w Sowich Torach) | `SowieTory/props.js` (`drawBoar`) | punkt wyjścia — w Farmie dziki będą łagodniejsze, z warchlakami w paski |
| wspólny interfejs: HUD, okna, komunikaty, menu pauzy, karty instrukcji | `shared/ui/` | HUD dnia, arkusze sklepów, „Jak grać?” |
| dźwięk (efekty, muzyka, syntezator plików) | `shared/engine/audio.js`, `scripts/make-audio.mjs` | muzyka farmy i miasteczka, odgłosy podlewania, gruchania, chrumkania |
| zapis w Firestore (`saveGameState`, łączenie albo pytanie „Nowszy postęp?”), **bramka zapisu** nowej gry | `shared/sowie-cloud.js` | zapis farmy w dokumencie `farma` (rozdz. 15) |
| Sowia Akademia, Galeria, Rekordy, demo, PWA | `shared/meta/`, `shared/owl-gallery.js`, `shared/menu/`, `sw.js` | zadania dnia i osiągnięcia z Farmy, zdjęcia, karta gry |
| **Sowia Dziupla** (po wdrożeniu, Analiza 7) | `shared/dziupla/` | karta „Farma” na tablicy korkowej, **roślinki z Farmy na półce Dziupli**, nowe ozdoby |
| testy: Playwright na 5 profilach telefonów (Chromium + WebKit w GitHubie), emulator Firestore, **gracz-symulator** do strojenia (jak w Sowich Trójkach i Ogrodach) | `tests/`, `SowieTrojki/bot.js` | testy logiki dnia, symulacja ekonomii na 100 dni, testy na telefonach |

---

## 3. Czego uczą Littlewood, Stardew Valley, Sprout Valley i Fields of Mistria

Na podstawie atlasu mechanik (numery rozdziałów atlasu w nawiasach) i krótkiego przeglądu w internecie.

### 3.1. Co bierzemy, co zmieniamy, czego nie bierzemy

| Mechanika | Jak jest w tych grach | U nas |
| --- | --- | --- |
| **Czas dnia** | Stardew i Mistria: zegar idzie sam, o 2:00 postać mdleje (3.3, 5.3); Littlewood: pora dnia przesuwa się od akcji, ale energia się kończy (2.3); Sprout: dzień i noc + stamina (4.3) | **bez zegara i bez staminy** — dzień kończy tylko sen; pora dnia najwyżej jako dekoracja (rozdz. 5.1) |
| **Sen jako „aktualizacja świata”** | we wszystkich: po śnie wzrost, sprzedaż, zdarzenia (3.3) | **bierzemy** — noc liczy wszystko naraz, rano karta „Poranek” |
| **Podlewanie i deszcz** | deszcz podlewa pole; **nie** szklarnię i nie doniczki w domu (Stardew 3.6, Mistria 5.4); brak wody wstrzymuje wzrost, a nie zabija (7.2 B) | **bierzemy dokładnie tak** — to Twoja reguła „przy deszczu nie trzeba podlewać pola/ogrodu” |
| **Prognoza w telewizorze** | Stardew: prognoza na jutro w TV (3.6) | **bierzemy** — telewizor to ulepszenie domu, prognozę czyta humbak |
| **Szklarnia** | Stardew: odblokowywana naprawą, stałe 120 pól (3.7); Mistria: mała 25 i duża 100 pól (5.9) | naprawa na początku, potem **rozbudowa etapami** 8 → 48 miejsc + palmiarnia (rozdz. 13.4) |
| **Uprawy w domu** | Stardew: doniczka (Garden Pot) — deszcz i zraszacze jej nie podlewają (3.8) | **parapety, półki i donice** z roślinami ozdobnymi; podlewanie co 2–3 dni (rozdz. 8.6) |
| **Poziomy narzędzi** | Stardew: miedź → stal → złoto → iryd, obszar konewki do 6 × 3 (3.11); Mistria: obszar od 1 do 54 pól (5.6) | **5 poziomów**: zwykłe → miedziane → srebrne → złote → **tęczowe** (motyw tęczowego liścia z innych gier) |
| **Ładowanie narzędzia przytrzymaniem** | Stardew, Mistria (3.2, 5.6) | na telefonie zamiast tego **przeciąganie palcem po grządkach** (wzór z Hay Day — Załącznik A); przytrzymanie zostaje jako „obszar” po ulepszeniu |
| **Zraszacze** | Stardew: 4, 8, 24 pola (3.10.1); Mistria: statuy 5 × 5 i 7 × 7 zasilane kamieniami (5.7) | **4 rodzaje** (plus, 3 × 3, 5 × 5, fontanna-humbak 7 × 7), bez „paliwa”; nie podlewają doniczek w domu |
| **Strach na wróble** | Stardew: wrony zjadają plony, strach chroni promień ok. 8 / 16 pól (3.10.2) | **strach-sowa przeciw gołębiom** (rozdz. 10.2) |
| **Ekwipunek** | Stardew 12 → 24 → 36; Mistria 10 → 20 → 30; Sprout (dodatek) operacje zbiorcze (3.12, 5.12, 4.8) | **pasek + plecak 12 → 36**, skrzynia, **operacje zbiorcze** („sprzedaj wszystkie plony”) |
| **Sprzedaż** | Stardew i Mistria: skrzynia wysyłkowa — pieniądze rano (3.13, 5.13); Littlewood: targ (2.11) | **targ w miasteczku** (od razu) + później **skrzynka sprzedaży** na farmie (pieniądze rano) |
| **Odblokowanie nasion sprzedażą** | Sprout: „Ship to Unlock” — nowe nasiona po liczbie wysyłek (4.9) | **bierzemy** — nowe nasiona po sprzedaży plonów i po zamówieniach |
| **Ranga miasta** | Mistria: Town Rank za zadania (5.17); Littlewood: życzenia mieszkańców (2.10) | **Ranga Miasteczka** za zamówienia z tablicy → nowe sklepy i nasiona |
| **Jakość plonów** | Stardew: zwykła / srebrna / złota / irydowa (3.9) | **tak** — gwiazdki za codzienną opiekę i nawozy jakości (decyzja 9, rozdz. 8.5) |
| **Pory roku** | Stardew: twarde — rośliny więdną przy zmianie (3.4); Littlewood: łagodne (2.4) | **łagodne**: zmienia się oferta, pogoda i wygląd; posadzone rośliny nie więdną (rozdz. 5.5, pytanie 1) |
| **Walka** | Stardew i Mistria: w kopalniach (3.18, 5.20) | **nie teraz** — przepędzanie bez walki; furtka w kodzie (rozdz. 10.5) |
| **Stamina, omdlenia, kopalnie, rudy, romanse, kowal zabierający narzędzie na 2 dni** | — | **nie bierzemy** (nie są „cozy” albo za duże na pierwszą wersję); ulepszenie narzędzia jest gotowe **następnego ranka**, a do tego czasu Sówka używa starego |

### 3.2. Wnioski z przeglądu w internecie

1. **Sterowanie na telefonie:** mobilne Stardew Valley ma kilka schematów; domyślny to **„stuknij, żeby iść”**,
   a joystick i przyciski są do wyboru w opcjach. U nas jest prościej, bo **nie ma walki** — wystarczy
   „stuknij i zrób” + przeciąganie; joystick można dodać jako opcję dla tabletu (pytanie 5).
2. **Przeciąganie palcem po polu** (Hay Day i podobne gry): wybierasz narzędzie albo nasiono i bez odrywania palca
   przesuwasz po wielu polach — to najwygodniejszy znany sposób na telefonie. Bierzemy.
3. **„Cozy” bez staminy** to rzadkość — w zestawieniach gier „bez stresu” pojawiają się pojedyncze tytuły bez paska
   staminy (np. Luma Island), a większość gier farmerskich ma energię albo zegar (atlas, rozdz. 6.2). Uwaga
   z poradników: „bez presji czasu” trzeba doprecyzować — u nas: **bez zegara, bez staminy, bez więdnięcia, bez kar
   za długi dzień**.
4. **Plastikowe sowy naprawdę odstraszają ptaki**, ale gołębie szybko się przyzwyczajają do nieruchomej sowy —
   lepiej działa sowa, która się rusza albo jest przestawiana. To gotowy pomysł na ulepszenie: **strach-sowa
   z obracaną głową** ma większy zasięg (rozdz. 10.2). A najbardziej gołębie boją się… prawdziwej Sówki.

---

## 4. Pomysł na grę

**Historia (krótka, prostym językiem):** ciocia Sówki, **Uszatka Ula**, wyrusza w rejs dookoła świata z humbakiem
i zostawia Sówce swoją **zarośniętą farmę** na skraju nadmorskiego **Sowiogrodu** (nazwa robocza — pytanie 7). W domu
jest list: „Kochana Sówko! Farma jest Twoja. Grządki trochę zarosły, szklarnia ma dziurę w dachu, a gołębie
i dziki myślą, że to ich stołówka. Kozy z miasteczka chętnie pomogą. Ściskam — Ciocia Ula”. Od listów cioci
zaczynają się kolejne cele (samouczek), a co jakiś czas przychodzą pocztówki z rejsu (z prezentem: rzadkim nasionem).

**Filary projektu:**

1. **Przytulnie** — nic nie umiera, nic nie ginie, nie ma zegara, staminy ani przegranej. Złe decyzje kosztują
   najwyżej trochę czasu (dzień bez wzrostu), nigdy postęp.
2. **Telefon najpierw** — każda czynność da się zrobić kciukiem jednej ręki; przeciągnięcie palcem robi kilka
   czynności naraz.
3. **Krótkie dni** — jeden dzień gry to ok. 3–10 minut (podlej, zbierz, posiej, sprzedaj, śpij). Można zagrać
   jeden dzień w autobusie albo dziesięć wieczorem.
4. **Zawsze jest „jutro”** — coś dojrzeje, przyjdzie dostawa, prognoza zapowiada deszcz, mieszkaniec ma zamówienie.
   Motywacja bez presji.
5. **Styl Sowiego Świata** — zaokrąglone kształty, kontur `#3b2f4a`, paleta tokenów, i **styl ulubiony przez
   gracza**: mrugające sówki jako kwiaty (`docs/Documentation.md`, „Styl ulubiony przez gracza”).

**Pętla dnia:**

```
Poranek (co urosło, pogoda, poczta)
  → farma: podlej (chyba że pada), zbierz, posiej, przepędź gołębie / dziki
  → szklarnia i dom: podlej, zbierz, przestaw rośliny
  → miasteczko: sprzedaj, kup nasiona, zamówienia z tablicy, ulepszenia
  → dom: obejrzyj prognozę, udekoruj
  → sen (gałąź / łóżko) → noc liczy wzrost, sprzedaż, szkodniki, pogodę → Poranek
```

---

## 5. Dzień i noc — bez zegara i bez staminy

### 5.1. Dzień

- **Nie ma zegara.** Sklepy są zawsze otwarte, mieszkańcy zawsze na swoich miejscach, nic nie „ucieka”.
- **Nie ma staminy.** Każda czynność jest darmowa i można ją powtarzać.
- **Pora dnia jako dekoracja (decyzja 3: tak):** niebo powoli robi się popołudniowe, a potem wieczorne
  w miarę tego, ile czynności Sówka już zrobiła (jak w Littlewood, ale **bez żadnego limitu**) — gdy wszystko jest
  podlane i zebrane, Sówka ziewa i mówi „Chyba czas na drzemkę na gałęzi…”. To tylko podpowiedź; można grać dalej.
  Wersja prostsza: zawsze ładny dzień, a wieczór tylko w czasie zasypiania.

### 5.2. Koniec dnia i poranek

1. Sówka siada na łóżku / gałęzi (stuknięcie albo „Śpij” w menu domu) → arkusz **„Kończysz dzień?”**
   z podsumowaniem: co jeszcze niepodlane, jutrzejsza prognoza (jeśli jest telewizor), przyciski **„Śpij”**
   i **„Jeszcze nie”** (makieta B). Gdy coś zostało niepodlane, arkusz to mówi, ale niczego nie blokuje.
2. **Noc** — krótka animacja (2–3 s, gwiazdy, „Zzz”, świetliki; stuknięcie pomija).
3. **Poranek** — karta z wynikami nocy: „Urosło 12 roślin, 4 gotowe do zbioru”, „Skrzynka sprzedaży: +340 Dziupaków”,
   „Gołębie wydziobały 2 grządki z nasionami” albo „Strach-sowa przegonił 3 gołębie”, „Dziś: deszcz — pole
   podlane”, „Poczta: pocztówka od Cioci Uli (prezent: nasiona Sowiego słonecznika)”. Zapis od razu.

### 5.3. Co liczy noc (w tej kolejności)

1. Pogoda **dzisiejsza** (deszcz już podlał pole rano, a zraszacze rano) — podlane grządki dostają +1 dzień wzrostu
   (z nawozem szybciej); niepodlane — bez zmian (**nie usychają**).
2. Rośliny wielokrotne po zbiorze odliczają do kolejnego plonu; dojrzałe czekają **bez końca** (nie gniją).
3. Szkodniki, które zostały na polu, robią swoje (rozdz. 10) — z limitem szkód.
4. Skrzynka sprzedaży → Dziupaki; zamówienia z poczty; ulepszenia zamówione w warsztacie i stolarni są gotowe.
5. Nowy dzień: losowanie pogody na **jutro** (z ziarnem dnia — rozdz. 9.3), nowe ceny „hitu dnia”, odnowienie
   towaru, nowe zamówienia na tablicy, szkodniki na rano.

Całość to **jedna czysta funkcja** `advanceDay(stan, ziarno)` (rozdz. 16.2) — da się ją przetestować i puścić
symulator na setki dni w kilka sekund.

### 5.4. Dlaczego bez staminy gra się nie „psuje”

- **Rośliny rosną tylko w nocy**, więc w ciągu dnia liczba sensownych czynności jest skończona (pole ma tyle
  grządek, ile ma) — nie da się „wyfarmić” wszystkiego jednego dnia.
- Pieniądze ogranicza wielkość pola, szklarni i domu → to one są **celem ulepszeń**.
- Szybkie spanie bez podlewania nic nie daje (rośliny stoją), ale też nic nie psuje.
- Nie ma kar za długi dzień ani za szybki sen — zgodnie z prośbą („gracz sam decyduje”).

### 5.5. Kalendarz i pory roku (propozycja — pytanie 1)

- **4 pory roku po 14 dni** (rok = 56 dni gry). Pora roku zmienia: **ofertę nasion** w Kozim Sklepiku, **pogodę**
  (zimą śnieg), **wygląd** farmy i miasteczka, a raz na porę — mały **festyn** (np. Festyn Dyni, Święto Kwiatów).
- **Łagodnie (jak w Littlewood):** posadzona roślina **nie więdnie** przy zmianie pory roku — „zasypia” (nie rośnie),
  dopóki nie wróci jej pora; wielosezonowe (kukurydza, truskawka) rosną dalej.
- **Zima:** pole odpoczywa (rośnie tylko kilka zimowych roślin: jarmuż, czosnek, ciemiernik) — wtedy szczególnie
  przydaje się **szklarnia i dom** (tam pory roku nie obowiązują).
- **Decyzja 2026-11-24:** pory roku — tak.
- **Furtka na przyszłość** (Twoja prośba): być może dojdą **rośliny sezonowe** i **mrozy** — niektóre rośliny nie
  przetrwają zimy na polu. Już w pierwszej wersji każda roślina ma w katalogu pole `zimuje` (dziś każda zimą tylko
  „zasypia” — nic nie umiera), a noc ma miejsce na regułę „mróz”, wyłączoną flagą `features.frost = false`.
  Włączenie to zmiana danych i jednej reguły nocy, a nie przebudowa. Gdyby kiedyś weszło: ostrzeżenie kilka dni
  przed zimą (prognoza, list cioci), okrycie rośliny albo przeniesienie jej do szklarni lub domu, a Tryb Przytulny
  mrozy wyłącza.

---

## 6. Sterowanie — telefon, tablet, komputer

### 6.1. Telefon w pionie (podstawa — makieta A)

```
┌──────────────────────────────┐
│ [Dzień 12 · Wiosna] [☀] [🪙 1 240] [≡] │  dzień i pora roku, pogoda (stuknięcie → prognoza), Dziupaki, menu/pauza
│                              │
│   dom          szklarnia     │  mapa z kafelków; kamera płynnie za Sówką
│      ▫▫▫▫▫▫                  │
│  🦉  ▫▫▫▫▫▫   ← grządki      │  kafelek pola ≥ 40 px (na 320 px też)
│      ▫▫▫▫▫▫                  │
│  ═══ płot ═══  🐗🐗           │
│                       [Mapa] │  szybka podróż: farma / dom / szklarnia / miasteczko
│ [ podpowiedź (1 linijka) ]   │
│ [konewka][motyka][sierp][🥕×12][…][plecak] │  pasek w strefie kciuka (6 miejsc, po ulepszeniu 8)
└──────────────────────────────┘
```

### 6.2. Gesty

| Gest | Co robi |
| --- | --- |
| **stuknięcie w kafelek** | Sówka podlatuje (krótki przelot — sowa lata, więc nie potrzebuje szukania drogi) i robi **właściwą czynność** wybranym narzędziem |
| **przeciągnięcie palcem po grządkach** | Sówka leci za palcem i robi czynność **na każdej grządce po drodze** (podlewa, sieje, zbiera, przekopuje) — biała kropkowana ścieżka pokazuje, gdzie (makieta A) |
| **stuknięcie gołębia / dzika** | przelot i „Hu-hu!” — przepędzenie (rozdz. 10) |
| **stuknięcie mieszkańca / drzwi / skrzyni / łóżka** | rozmowa, wejście, skrzynia, sen |
| **przytrzymanie kafelka** | dymek z informacją: „Marchew — jutro gotowa”, „Sucha ziemia”, „Zraszacz: podlewa 8 pól” |
| **stuknięcie w miejsce pola na pasku** | wybór narzędzia / nasion; drugie stuknięcie — „Automatyczne narzędzie” (niżej) |

- **Automatyczne narzędzie** (domyślnie włączone, wyłączane w ustawieniach gry): gra sama wybiera narzędzie dla
  stukniętego kafelka — trawa → motyka, sucha grządka → konewka, gotowa roślina → sierp, pusta przekopana + wybrane
  nasiona → siew. Wybór na pasku decyduje tylko o **rodzaju nasion**. Mniej stuknięć, mniej pomyłek.
- **Kamera** zawsze za Sówką; stuknięcie przy krawędzi ekranu przesuwa Sówkę i kamerę dalej. Mapa farmy jest
  niewielka (ok. 2–3 ekrany), więc nie potrzeba przewijania dwoma palcami.
- **Martwe strefy** przy krawędziach (jak w innych grach — systemowy gest „wstecz” nie robi nic w grze).

### 6.3. Komputer i tablet

- **Mysz:** kliknięcie = stuknięcie, przeciągnięcie z wciśniętym przyciskiem = przeciągnięcie palcem.
- **Klawiatura:** WASD / strzałki — Sówka chodzi po kafelkach; **Spacja / E** — czynność na kafelku przed Sówką;
  **1–8** — pasek; **I** — plecak; **M** — mapa; **H** — „Hu-hu!”; **P / Esc** — pauza.
- **Tablet i telefon poziomo:** widać więcej mapy; pasek z prawej strony (pionowo) albo na dole — sprawdzimy na
  zrzutach; arkusze sklepów jako panel z boku zamiast od dołu.
- **Joystick na ekranie** — tylko jako opcja (pytanie 5), bo „stuknij i zrób” wystarcza do farmy.

### 6.4. Dostępność

- Cele dotyku ≥ 44–48 px, kafelek pola ≥ 40 px nawet na 320 × 568.
- Stan grządki **nie tylko kolorem**: mokra ziemia ma ciemniejszy kolor **i** kropelkę; gotowa roślina — iskierki.
- Ograniczenie ruchu (`prefers-reduced-motion`, „Efekty” w ustawieniach) — bez kołysania i iskier.
- Wszystkie napisy po polsku, prostym językiem; dymki krótkie (1–2 zdania).
- **Tryb Przytulny** (jak w innych grach) — wyłącza szkodniki.

---

## 7. Miejsca

| Miejsce | Co tam jest | Rozmiar |
| --- | --- | --- |
| **Farma** (na zewnątrz) | dom, szklarnia, **pole**, **ogród kwiatowy** przy domu, studnia (napełnianie konewki), skrzynka sprzedaży (ulepszenie), kompostownik (ulepszenie), płot, skraj lasu (stąd przychodzą dziki), drzewa, kamienie i pieńki na niezagospodarowanych kawałkach | ok. 18 × 26 kafelków (2–3 ekrany w pionie) |
| **Dom** (wnętrze) | miejsce do spania (łóżko → gałąź…), parapet z doniczkami, półki, miejsca na duże rośliny na podłodze, telewizor (ulepszenie), skrzynia, meble i ozdoby | 1 pokój na start, z rozbudową do 4 (rozdz. 13.5) |
| **Szklarnia** (wnętrze) | rzędy grządek / stołów uprawnych, miejsce na zraszacze i kroplówkę, palmiarnia (ulepszenie) | 8 → 48 miejsc |
| **Miasteczko** | ulica nad zatoką, przewijana w bok: Kozi Sklepik, Warsztat, Stolarnia, Kwiaciarnia, Przytulne Gniazdko, tablica ogłoszeń, port z targiem humbaka | ok. 3 ekrany w poziomie |
| **Mapa** | szybka podróż jednym stuknięciem (farma, dom, szklarnia, miasteczko) — bez długiego chodzenia | — |
| *na przyszłość* | **Las** (dom dzików — przygody, ewentualnie walka), **Plaża humbaka** (np. zbieranie muszelek, łowienie), **Jaskinia** | — |

Przejścia: drzwi (stuknięcie) albo „Mapa” — ściemnienie 0,25 s (`createScenes`, jak w innych grach).

---

## 8. Uprawy

### 8.1. Cykl uprawy

1. **Motyka** — trawa → przekopana grządka (na polu; w szklarni i w domu niepotrzebna).
2. **Siew** — nasiona z paska na przekopaną grządkę (w domu — do doniczki).
3. **Podlewanie** — konewka, deszcz albo zraszacz; mokra grządka jest ciemna i ma kropelkę.
4. **Noc** — podlana roślina rośnie o 1 dzień (rozdz. 5.3); 4–5 widocznych etapów wzrostu.
5. **Zbiór** — sierp albo stuknięcie / przeciągnięcie; plon trafia do plecaka (z iskierkami i „pop”).
6. **Po zbiorze:** roślina jednorazowa znika (grządka zostaje przekopana), wielokrotna zostaje i odlicza do
   kolejnego plonu.

**Zasady przytulne:** niepodlana roślina stoi (nie usycha), dojrzała czeka bez końca (nie gnije), przekopana
grządka nie zarasta z powrotem.

### 8.2. Cztery miejsca uprawy

| | **Pole** | **Ogród kwiatowy** | **Szklarnia** | **Dom** (doniczki) |
| --- | --- | --- | --- | --- |
| co rośnie | warzywa, truskawki, słoneczniki, dynie | kwiaty (sprzedaż w kwiaciarni, ozdoba farmy, zamówienia) | rośliny egzotyczne (ananas, kawa, wanilia…) i dowolne nasiona z każdej pory roku | rośliny ozdobne (Monstera, Pilea, Storczyk, Sowi storczyk…) |
| deszcz podlewa | **tak** | **tak** | nie (dach) | nie (dach) |
| zraszacze | tak | tak | tak (i kroplówka) | nie (konewka; ulepszenie: podstawki z wodą) |
| pory roku | tak (łagodnie) | tak (łagodnie) | **nie** | **nie** |
| szkodniki | gołębie i dziki | gołębie | nie | nie |
| podlewanie | codziennie | codziennie | codziennie (albo kroplówka) | **co 2–3 dni** |

### 8.3. Rośliny na start (pierwsza wersja — ok. 40)

Czasy w dniach gry; „+ co N” — roślina wielokrotna (pierwszy plon po pierwszej liczbie, potem co N dni). Ceny
i czasy ostatecznie ustawi symulator (rozdz. 14).

| Grupa | Rośliny |
| --- | --- |
| **Pole — wiosna** | Rzodkiewka (3), Sałata (4), Marchew (4), Groszek (6 + co 3), Ziemniak (6), Truskawka (8 + co 4, wiosna i lato) |
| **Pole — lato** | Pomidor (8 + co 3), Ogórek (6 + co 3), Papryka (7 + co 3), Cukinia (5 + co 2), Kukurydza (10, lato i jesień), Arbuz (12), Słonecznik (7) |
| **Pole — jesień** | Dynia (10), Kapusta (8), Burak (5), Brokuł (7), Żurawina (9 + co 4) |
| **Pole — zima** | Jarmuż (6), Czosnek (8) |
| **Ogród kwiatowy** | Tulipan, Żonkil (wiosna); Mak, Chaber, Lawenda (lato); Dalia, Wrzos (jesień); Ciemiernik (zima); Róża (wielokrotna, wiosna–jesień) |
| **Szklarnia** | Ananas (12), Kawa (10 + co 4), Kakao (11 + co 5), Wanilia (storczyk; 12 + co 6), Pitaja (9 + co 4), Chili (7 + co 3), Bazylia (4 + co 2), Drzewko cytrynowe (20 + co 5, palmiarnia), Bananowiec (24 + co 6, palmiarnia) |
| **Dom** (rysunki z Sowich Ogrodów i Łącz i Hoduj) | Monstera, Pilea, Paproć, Kaktus, Storczyk, Skrzydłokwiat, Sansewieria, Bonsai, Fiołek afrykański, Lotos (w misce z wodą) |
| **Styl ulubiony — „mrugająca sówka jako kwiat”** | **Sowi słonecznik** (pole, lato — środek kwiatu to sowia buzia, która obraca się za Sówką), **Sowi storczyk** (dom — jak w Ogrodach), **Kozi liść** (dom — liście jak główki kózek), **Humbakowiec** (szklarnia, w wodzie — liście jak małe humbaki, czasem tryska fontanną), **Pisklęce pąki** (ogród — pąki jak pisklęta w skorupkach) |

**Później (drugi etap):** drzewa owocowe na farmie (jabłoń, grusza, śliwa), zioła, rośliny „magiczne” z Ogrodów
(Mandragora, Kwiat paproci — za festyny), olbrzymie warzywa (dynia 2 × 2 przy szczęściu, jak Giant Crops w Stardew).

### 8.4. Odblokowanie nasion

- Na start: rzodkiewka, marchew, sałata, ziemniak i tulipan (+ prezent cioci: 15 nasion rzodkiewki).
- Kolejne nasiona **po sprzedaży plonów** (jak „Ship to Unlock” w Sprout Valley — np. papryka po 30 sprzedanych
  warzywach), **po zamówieniach** (Ranga Miasteczka) i z **pocztówek cioci** (rzadkie).
- Każda pora roku ma swój asortyment; w szklarni można siać wszystko, co już się kupiło.

### 8.5. Jakość plonów (decyzja 2026-11-24: tak, z nawozami jakości)

- ★ zwykła, ★★ srebrna (+25% ceny), ★★★ złota (+50%) — szansa rośnie, gdy roślina była **podlewana każdego dnia
  bez przerwy** i ma nawóz. Brak kary — najgorzej jest „zwykła”.
- **Nawozy jakości** (Twoja decyzja) podnoszą szansę na ★★ i ★★★ (rozdz. 8.7). Jakość podnosi tylko cenę plonu
  w Dziupakach i daje cel „opiekuj się codziennie”; nie daje piórek ani punktów Sowiej Akademii.

### 8.6. Rośliny ozdobne w domu

- Miejsca: **parapet** (3 na start, makieta B), **półki**, **duże donice na podłodze**; więcej po rozbudowie domu.
- **Podlewanie co 2–3 dni** (doniczka pokazuje kroplę; przesuszona roślina ma oklapnięte listki — nie umiera).
- **5 etapów wzrostu** — dokładnie te z Sowich Ogrodów (`createPlantShapes`: roślina bujnieje, przybywa kwiatów;
  Sowi storczyk z każdym etapem ma więcej mrugających sówek).
- Co dają: **sadzonki** (rozmnażanie: dorosła roślina raz na kilka dni daje sadzonkę do nowej doniczki albo
  na sprzedaż w Kwiaciarni), **kwiaty** (storczyki, fiołki — do Kwiaciarni i zamówień), **„Przytulność”** domu
  (licznik w domu — za progi drobne nagrody: nowy mebel, zdjęcie w Galerii, ozdoba Dziupli).
- **Doniczki stoją dolną krawędzią na parapecie i półce** — ten sam sposób zaczepienia rysunku i ten sam test co
  w Sowiej Dziupli (Analiza 7, uwaga D1a).
- **Dziupla:** wyhodowane rośliny domowe trafiają na półkę Sowiej Dziupli (Analiza 7, rozdz. 6.2) jako kolejna
  kategoria „Sowia Farma”.

### 8.7. Nawozy

| Nawóz | Działanie | Skąd |
| --- | --- | --- |
| Kompost | −1 dzień wzrostu | kompostownik (ulepszenie): resztki po zbiorze, chwasty → kompost po 3 dniach |
| Ziemia, która trzyma wodę | grządka zostaje mokra 2 dni | Kozi Sklepik |
| **Nawóz jakości** | większa szansa na ★★ | Kozi Sklepik (Dziupaki) |
| **Złoty nawóz** | jeszcze większa szansa na ★★ i ★★★ | Kozi Sklepik (Dziupaki), od Rangi Miasteczka 2 |
| **Wypluffkowy nawóz jakości** | **dokładnie jak Złoty nawóz** (nie mocniej), puchate iskierki; paczka po 10 | za Wypluffki w Sowim Butiku (Analiza 7b — wyjątek od „tylko wygląd”, decyzja 9) |
| Tęczowy nawóz | −2 dni i iskierki; rzadki | pocztówki cioci, festyny |

Na grządce działa **jeden nawóz naraz** (jak w Stardew Valley) — prosto i czytelnie: albo szybciej (kompost,
Tęczowy), albo lepiej (nawozy jakości), albo dłużej mokro (ziemia trzymająca wodę). Nawozów wzrostu za Wypluffki
nie ma (Analiza 7b, rozdz. 10).

---

## 9. Pogoda i prognoza

### 9.1. Rodzaje pogody

| Pogoda | Jak wygląda | Co robi |
| --- | --- | --- |
| **Słońce** | jasno, motyle | nic szczególnego — podlewasz sam |
| **Pochmurno** | chmury płyną po niebie | nic — dzień „na spokojnie” |
| **Deszcz** | krople, kałuże, Sówka w kaloszach (strój dnia) | **podlewa pole i ogród**; gołębie siedzą pod dachem (nie przychodzą) |
| **Burza** | ciemniej, błyski w oddali (bez niszczenia roślin) | podlewa pole i ogród; **ani gołębie, ani dziki** nie przychodzą |
| **Mgła** | biała mgiełka nad polem | dziki śmielsze (częściej podchodzą pod płot) — dobra okazja na przepędzanie i „prezenty” |
| **Wiatr** | kołyszące się rośliny, latające listki | na skraj farmy przylatują **dzikie nasiona kwiatów** do zebrania |
| **Upał** | falujące powietrze, Sówka w okularach | rośliny lata (pomidor, słonecznik, arbuz) rosną o dzień szybciej, jeśli są podlane |
| **Tęcza** (rzadko, po deszczu) | tęcza nad farmą | w porcie lepsze ceny, czasem rzadkie nasiono |
| **Śnieg** (zima) | śnieg na polu, Sówka w czapce z pomponem | pole odpoczywa, szklarnia i dom działają; **bałwan-sowa** do ulepienia (ozdoba) |

### 9.2. Prognoza — telewizor

- **Bez telewizora** Sówka zna tylko dzisiejszą pogodę (karta „Poranek”).
- **Telewizor** (ulepszenie domu w Stolarni — rozdz. 13.5): program **„Prognoza z Zatoki”** — humbak w okularach
  pokazuje płetwą chmurę albo słońce: „Jutro deszcz — kalosze w gotowości!” (makieta B). Stuknięcie ikony
  pogody w HUD też pokazuje jutro.
- **Antena** (kolejne ulepszenie): prognoza na 3 dni.
- **Później:** inne kanały — „Kuchnia Śnieżnej” (przepisy, gdy będzie gotowanie), „Teleturniej Puszczyka”
  (zagadki o roślinach z nagrodą), „Wiadomości z Sowiogrodu” (festyny, promocje).

### 9.3. Jak losujemy pogodę

- Z **ziarnem dnia** (`farma:<dzień>` + identyfikator zapisu) — ta sama pogoda na dwóch telefonach i w testach.
- Prawdopodobieństwa zależą od pory roku (np. wiosna: słońce 40%, pochmurno 20%, deszcz 25%, wiatr 10%, mgła 5%;
  zima: śnieg 40%…); **nigdy więcej niż 3 dni deszczu z rzędu** i **co najmniej 1 deszczowy dzień na tydzień**
  (żeby deszcz był przyjemną „przerwą”, a nie losem na loterii).
- W dzień festynu — zawsze ładnie (jak w Littlewood).

---

## 10. Gołębie i dziki — przepędzanie bez walki

### 10.1. Zasady przytulne

1. Szkodniki **nigdy nie niszczą wszystkiego** — szkoda jest mała, ma limit i zawsze da się ją naprawić.
2. **Zawsze można je przepędzić przed snem** — liczy się tylko to, co zostanie na noc.
3. Przepędzone zwierzaki **nie są „pokonane”** — uciekają w podskokach i czasem coś zostawiają (piórko, truflę).
4. **Ochrona** (strach-sowa, płot) zmniejsza ich odwiedziny aż do zera — ulepszenia mają sens.
5. **Tryb Przytulny** wyłącza szkodniki całkowicie (dla osób, które chcą tylko sadzić).

### 10.2. Gołębie

- **Wygląd:** pulchne, szaroniebieskie, z opalizującą zielono-fioletową szyjką, różowymi policzkami i nóżkami,
  pomarańczowym dziobkiem; dreptają i kiwają główką; „Gru-gru!” (makieta A).
- **Kiedy przylatują:** rano, gdy na polu albo w ogrodzie są **świeżo zasiane grządki** (nasiona jeszcze widać);
  nie w deszcz i nie w burzę; najwyżej **3 gołębie dziennie**.
- **Co robią:** siadają na grządce z nasionami i dziobią. **Jeśli zostaną na noc**, wydziobują nasiona z tej
  grządki — rano jest znowu pusta i przekopana (tracisz jedno nasiono, nic więcej).
- **Przepędzanie:** stuknięcie gołębia → Sówka podlatuje, rozkłada skrzydła i woła „Hu-hu!” → gołąb podskakuje
  ze strachu i odlatuje (kilka piórek w powietrzu). Czasem zostaje **gołębie piórko** (zbierane do albumu
  / zamówień; za 20 piórek — ozdoba).
- **Ochrona — strach-sowa** (gołębie naprawdę boją się sów — rozdz. 3.2):

| Poziom | Wygląd | Zasięg |
| --- | --- | --- |
| Słomiany strach | słomiany strach na wróble w kapeluszu | promień 2 kafelki (gołębie omijają, ale tylko część) |
| Strach-sowa | drewniana sowa na palu (makieta A) | promień 3 |
| Strach-sowa z obracaną głową | głowa kręci się i mruga | promień 4 |
| Wielki Puchacz-strażnik | duża pluszowa sowa z rozłożonymi skrzydłami | promień 6 |

- **Personalizacja stracha:** strach-sowa nosi **dodatek z Garderoby** wybrany przez gracza (kokardka, wianek,
  korona…) — i gatunek sowy (Pójdźka, Śnieżna…). Te same grafiki co Sówka, zero nowych rysunków.

### 10.3. Dziki (z warchlakami)

- **Wygląd:** okrągła mama-dzikówna z różowym ryjkiem i małymi kłami, za nią **2–3 warchlaki w jasne paski**
  (w Polsce znane i bardzo „cute”); chrumkają, kręcą ogonkami (makieta A). Inne niż „szarżujące” dziki
  z blokowiska w Sowich Torach — te są zaspane i ciekawskie.
- **Kiedy przychodzą:** w nocy z lasu, gdy **płot jest za słaby** — najwyżej raz na 4–7 dni (mgła: częściej);
  rano rodzinka **drzemie na skraju pola**.
- **Co robią:** jeśli Sówka ich nie przepędzi, **następnej nocy** ryją 1–2 grządki z warzywami korzeniowymi
  (ziemniak, marchew, burak) — roślina **cofa się o 1 etap** (nie znika); rozryta grządka jest od razu przekopana.
- **Przepędzanie:** stuknięcie → Sówka podlatuje, „Hu-hu!” i dzwonek → dziki budzą się i truchtają gęsiego do
  lasu (warchlaki w rządku). Czasem w miejscu drzemki zostaje **trufla** (rzadki, drogi „plon”).
- **Ochrona — płot** (cała farma, poziomy zamiast stawiania każdego kawałka — prościej na telefonie):

| Poziom | Wygląd | Odwiedziny dzików |
| --- | --- | --- |
| Stary płotek | połamane sztachety (na start) | raz na 4–7 dni |
| Płot z patyków | nowe sztachety | raz na 8–12 dni |
| Płot z wikliny | pleciony, z dzwoneczkami | raz na 15–20 dni |
| Kamienny murek | murek porośnięty kwiatami | nigdy (dziki tylko zaglądają przez murek — można je pogłaskać po ryjku „na szczęście”) |

### 10.4. Liczby (propozycja do strojenia symulatorem)

- Gołębie: 0–3 dziennie przy świeżych nasionach, mniej w zasięgu stracha; szkoda: najwyżej 2 grządki na noc.
- Dziki: szkoda najwyżej 2 grządki na noc, rośliny cofnięte o 1 etap.
- Średnio przy rozsądnej grze bez ochrony: strata ok. **3–5%** plonów; z pełną ochroną: 0.
- Nagrody za przepędzanie: zadania Akademii („Przepędź 5 gołębi”), osiągnięcie „Sowi strażnik”, gołębie piórka,
  trufle.

### 10.5. Furtka na przyszłą walkę (bez walki w pierwszej wersji)

Zgodnie z prośbą („zostaw taką opcję”) kod od początku jest ułożony tak, żeby walkę można było **dopisać, a nie
przerabiać**:

- **Moduł stworzeń** (`creatures.js`): każde stworzenie ma opis zachowania (pojawianie się, ruch, „odwaga” — ile
  huknięć wytrzyma), a przepędzanie to **ogólna „akcja Sówki” z siłą i zasięgiem** (`hoot`). Walka w przyszłości
  to kolejne akcje (np. „machnięcie skrzydłem”) i „zdrowie” stworzeń — ten sam mechanizm.
- **Zdolności Sówki** (`abilities`) — lista w zapisie; dziś tylko `hoot` (ulepszane: „Gromkie hu-hu” — większy
  zasięg).
- **Serduszka** Sówki już istnieją (`zycie` — serduszko-doniczka z innych gier) — gotowe na „zdrowie”, gdyby
  było potrzebne.
- **Miejsce na mapie:** **Las** za farmą (dom dzików) — dziś zamknięty bramą („Ciocia Ula prosiła, żeby na razie
  tam nie chodzić”), w przyszłości obszar przygód: np. przeganianie **chochlików Pracu Pracu** (znani „wrogowie”
  z innych gier — pasują stylem), zbieranie grzybów, ewentualnie walka.
- **Przełącznik funkcji** `features.combat = false` w konfiguracji i pole `adventure` zarezerwowane w zapisie.
- **Testy** pilnują, że w pierwszej wersji żadne stworzenie nie może „zranić” Sówki ani zniszczyć więcej niż limit.

---

## 11. Miasteczko i mieszkańcy

### 11.1. Miejsca i postacie (imiona — decyzja 7: „zdaję się na Ciebie”)

| Miejsce | Kto | Co tam robisz | Grafika |
| --- | --- | --- | --- |
| **Kozi Sklepik** | koza **Klementyna** (+ kózki-pomocnice) | nasiona (sezonowe), nawozy, „Ziemia, która trzyma wodę”; towar odnawia się rano | koza z atlasu (`kozki/koza.svg`), chustki w kolorach |
| **Targ w porcie** | humbak **Henio** (z pomostu) | **sprzedaż plonów** od razu; „hit dnia” (+50% za jeden rodzaj); operacja „Sprzedaj wszystkie plony” | humbak z atlasu |
| **Warsztat** | **Pójdźka Pola** | ulepszenia narzędzi, zraszacze, strachy, płot, skrzynka sprzedaży; gotowe **następnego ranka** | Sówka w kolorach Pójdźki (gatunek z Butiku) |
| **Stolarnia** | **Puchacz Bartek** | rozbudowa domu, szklarni, pola, ogrodu | Sówka w kolorach Puchacza |
| **Kwiaciarnia** | **Płomykówka Flora** | rośliny do domu, doniczki, skup kwiatów i sadzonek | Sówka w kolorach Płomykówki |
| **Przytulne Gniazdko** | **Uszatka Ola** (kuzynka cioci) | meble i ozdoby: gałąź do spania, hamak, tapety, dywany, lampy | Sówka w kolorach Uszatki |
| **Tablica ogłoszeń** | wszyscy mieszkańcy | **zamówienia**: „Kózka Sprężynka prosi o 5 marchewek na urodziny” → Dziupaki + serduszko Rangi | ikony mieszkańców |
| **Poczta** (skrzynka przy domu) | — | listy i pocztówki cioci (prezenty, nowe nasiona), rachunki „Wysłano z targu” | — |
| *później* | **Śnieżna** (kafejka — gotowanie), **Puszczyk** (biblioteka — „Zielnik”, czyli album roślin), kozy z festynu | — | gatunki z Butiku |

Kózki z innych gier (Sprężynka, Tarcza, Magnes, Turbo, Podwajaczka) mogą być **klientkami** zamówień — gracz je
zna, a grafiki są gotowe.

### 11.2. Rozmowy i Ranga Miasteczka

- Rozmowy to **krótkie dymki** (1–2 zdania), zależne od pory roku, pogody i postępu („Deszcz! Moje kopytka lubią
  kałuże!”). Bez długich dialogów i bez wyborów odpowiedzi w pierwszej wersji.
- **Ranga Miasteczka** (jak Town Rank w Mistrii): za zamówienia z tablicy przybywa serduszek; kolejne progi
  otwierają nowe sklepy (Kwiaciarnia, Przytulne Gniazdko), nowe nasiona, większe zamówienia i festyny.
- **Przyjaźnie z mieszkańcami** (prezenty, ulubione rośliny) — drugi etap (decyzja 14).

### 11.3. Jak wygląda miasteczko na telefonie

- **Ulica przewijana w bok** (makieta C) — Sówka przelatuje do sklepu po stuknięciu; stuknięcie sklepu otwiera
  **arkusz od dołu** z listą towarów (duże wiersze, cena w Dziupakach, „Kup” / „Kup ×5”, przy sprzedaży suwak ilości).
- Sklepy są zawsze otwarte (nie ma zegara).

---

## 12. Ekwipunek

- **Pasek** (na dole ekranu): narzędzia mają **stałe miejsca** (konewka, motyka, sierp — nie zajmują plecaka),
  dalej nasiona i przedmioty; 6 miejsc na start, 8 po ulepszeniu „Szeroki pasek”.
- **Plecak** (arkusz od dołu): **12 → 18 → 24 → 36** miejsc (ulepszenia w Przytulnym Gniazdku), stosy do 99 sztuk;
  kategorie: nasiona, plony, kwiaty, nawozy, urządzenia (zraszacze, strachy), meble i ozdoby, specjalne
  (gołębie piórka, trufle, pocztówki).
- **Skrzynia w domu:** 36 → 72 miejsca; przy skrzyni **„Odłóż wszystkie plony”** jednym stuknięciem.
- **Operacje zbiorcze** (jak w dodatku do Sprout Valley): „Sprzedaj wszystkie plony” na targu, „Odłóż do skrzyni”,
  „Posortuj”.
- **Pełny plecak (decyzja 2026-11-24):** gra **ostrzega** („Plecak pełny! Sprzedaj plony albo odłóż je do skrzyni”,
  z przyciskiem „Otwórz plecak”), a zbieranie się zatrzymuje, dopóki gracz sam nie zrobi miejsca. Wcześniej, przy
  2 wolnych miejscach, jest łagodne „Plecak prawie pełny”. Nic nie przepada: dojrzała roślina czeka na grządce
  bez końca (rozdz. 8.1), a przy przeciąganiu palcem Sówka pomija grządki, których nie zmieści. **Większy plecak
  to ulepszenie** (12 → 18 → 24 → 36 w Przytulnym Gniazdku), a „Odłóż wszystkie plony” przy skrzyni i „Sprzedaj
  wszystkie plony” na targu opróżniają go jednym stuknięciem.
- **Wybór nasion do siewu:** stuknięcie miejsca z nasionami na pasku; przy przeciąganiu siejemy wybrany rodzaj.

---

## 13. Ulepszenia i rozbudowa

### 13.1. Narzędzia (Warsztat Pójdźki)

| Narzędzie | Zwykłe | Miedziane | Srebrne | Złote | **Tęczowe** |
| --- | --- | --- | --- | --- | --- |
| **Konewka** — pojemność | 10 | 20 | 35 | 50 | bez dna |
| **Konewka** — obszar (przytrzymanie / jedno stuknięcie) | 1 | 1 × 3 | 3 × 3 | 3 × 5 | 5 × 5 |
| **Motyka** — obszar | 1 | 1 × 3 | 3 × 3 | 3 × 5 | 5 × 5 |
| **Sierp** — obszar zbioru | 1 | 1 × 3 | 3 × 3 | 3 × 5 + 5% szansy na podwójny plon | 5 × 5 + 10% |
| **Worek nasion** — obszar siewu | 1 | 1 × 3 | 3 × 3 | 3 × 5 | 5 × 5 |
| **„Hu-hu!”** (zdolność Sówki) — zasięg przepędzania | 1 zwierzak | 2 kafelki | 3 | 4 | całe pole |

- Koszt: **Dziupaki + plony** (np. miedziana konewka: 500 Dziupaków i 10 marchewek) — ulepszenia są powiązane
  z uprawą, bez kopalni i rud.
- Gotowe **następnego ranka**; do tego czasu Sówka używa starego narzędzia (nie ma dni „bez konewki”).
- Napełnianie konewki: stuknięcie studni albo beczki na deszczówkę (deszcz napełnia beczkę za darmo).
- Przeciąganie palcem działa na każdym poziomie — ulepszenia **skracają** pracę, a nie są „koniecznością”.

### 13.2. Automatyzacja i ochrona (Warsztat)

| Urządzenie | Poziomy |
| --- | --- |
| **Zraszacz** (zajmuje 1 kafelek; podlewa rano) | Zwykły (4 pola — „plus”), Srebrny (3 × 3), Złoty (5 × 5), **Fontanna-humbak** (7 × 7; humbak tryska wodą z grzbietu) |
| **Strach-sowa** | 4 poziomy (rozdz. 10.2) |
| **Płot** | 4 poziomy (rozdz. 10.3) |
| **Skrzynka sprzedaży** | sprzedaż z farmy, Dziupaki rano (bez „hitu dnia”) |
| **Kompostownik** | resztki → kompost (rozdz. 8.7) |
| **Beczka na deszczówkę** | napełnianie konewki przy polu |
| **Kroplówka w szklarni** | podlewa całą szklarnię |
| *później* | **Kózka-pomocnica** (zbiera dojrzałe plony z kawałka pola raz dziennie), **gołąb pocztowy** (oswojony gołąb — dostarcza zamówienia; żart z „wroga”) |

### 13.3. Pole i ogród (Stolarnia Puchacza)

| Etap | Pole | Ogród kwiatowy |
| --- | --- | --- |
| start | 4 × 4 = **16** grządek | 2 × 4 = 8 |
| 1 | 6 × 4 = 24 | 4 × 4 = 16 |
| 2 | 6 × 6 = 36 | 4 × 6 = 24 |
| 3 | 8 × 6 = 48 | — |
| 4 | 8 × 8 = 64 | — |
| 5 | 10 × 8 = **80** | — |

Nowy kawałek pola pojawia się z kilkoma kamieniami i pieńkami do usunięcia motyką (krótka, przyjemna czynność —
bez siekiery i kilofa).

### 13.4. Szklarnia

| Etap | Co | Miejsca |
| --- | --- | --- |
| start | zrujnowana szklarnia (dziura w dachu, zbite szyby) | 0 |
| **Naprawa** | zamówienie od Puchacza: 15 dowolnych warzyw + 800 Dziupaków | **8** |
| 1–4 | kolejne rzędy stołów uprawnych | 16 → 24 → 36 → **48** |
| **Palmiarnia** | dobudówka na drzewka (cytryna, banan) | 6 dużych miejsc |
| **Kroplówka** | samo podlewanie | — |
| **Trzmiele** | ul w szklarni: +szansa na lepszą jakość (jeśli jakość będzie) | — |
| **Akwarium-staw** | miejsce na Humbakowca i Lotos | 4 |

### 13.5. Dom

| Etap | Co dochodzi | Miejsca na rośliny |
| --- | --- | --- |
| **Chatka** (start) | łóżko, parapet, skrzynia | parapet 3 |
| **Duży pokój** | **telewizor z prognozą**, półka, większy parapet (makieta B: 4. miejsce) | 4 + półka 4 |
| **Kuchnia** | stół (później gotowanie), parapet kuchenny | +3 |
| **Strych-sypialnia** | okno w dachu (więcej światła — rośliny rosną szybciej), miejsce na 2. łóżko / gałąź | +6 |
| **Oranżeria** | szklany taras przy domu | +8 dużych donic |
| *dodatki* | **Antena** (prognoza na 3 dni), **podstawki z wodą** (doniczki podlane na 4 dni), dzwonek do drzwi, skrzynka na listy w kształcie sowy | — |

### 13.6. Drobna personalizacja (Przytulne Gniazdko i nagrody)

- **Miejsce do spania:** łóżko → **gałąź** (z liśćmi, Sówka śpi jak prawdziwa sowa — makieta B) → hamak →
  gniazdo z mchu → poduszka-chmurka. Czysto ozdobne (nie zmienia zasad), ale każde ma inną animację zasypiania.
- **Wnętrze:** tapety, podłogi, dywany, lampy, firanki, obrazki (zdjęcie z **Galerii** w ramce — jak w Dziupli).
- **Farma:** kolor dachu domu i szklarni, skrzynka na listy, ścieżki (kamyki, deski, cegły), latarenki,
  wiatraczki, budka dla ptaków (ironicznie — nie dla gołębi), **strój stracha-sowy** z Garderoby.
- **Sówka:** strój i gatunek z **Szafy** (Dziupla) — ten sam co we wszystkich grach; w Farmie dodatkowo
  **strój dnia** zależny od pogody (kalosze w deszcz, okulary w upał, czapka w śnieg) — można wyłączyć.

### 13.7. Kamienie milowe (orientacyjnie)

| Dzień gry | Co się dzieje |
| --- | --- |
| 1–3 | samouczek w listach cioci: motyka, siew, podlewanie, zbiór, sprzedaż, sen |
| 3–5 | pierwsze gołębie i strach-sowa; zamówienia z tablicy |
| 6–9 | naprawa szklarni |
| 8–12 | pierwsze ulepszenie konewki; pierwsze dziki i płot z patyków |
| 10–15 | **telewizor z prognozą**; Kwiaciarnia (Ranga 2) |
| 15–30 | pierwszy zraszacz, rozbudowy pola, nowa pora roku i festyn |
| 30–60 | duży dom, palmiarnia, tęczowe narzędzia na horyzoncie |
| 60–100 | pełna farma (80 grządek, 48 miejsc w szklarni), kolekcja wszystkich roślin |

Przy 3–10 minutach na dzień to ok. **10–15 godzin** pierwszej wersji, a z kolekcjonowaniem więcej. Tempo ustawi
symulator (rozdz. 14).

---

## 14. Ekonomia — Dziupaki

- **Waluta Farmy: Dziupaki** (nazwa — Twoja decyzja 2026-11-24; l. poj. **Dziupak**; ikonka: drewniany krążek
  z małą dziuplą i listkiem). Dziupaków nie da się kupić za Wypluffki ani wymienić (Analiza 7b, rozdz. 10). Osobna
  od **piórek** Sowiej Akademii — piórka zostają walutą
  Butiku i Dziupli; Farma ma własną gospodarkę, więc nie rozregulowuje innych gier.
- **Zasada opłacalności:** zysk z grządki na dzień = (cena plonu × liczba plonów − cena nasion) / dni. Później
  odblokowane rośliny dają więcej na dzień, ale potrzebują więcej dni albo miejsca w szklarni.

| Roślina | Nasiona | Plon | Dni | Zysk na grządkę na dzień |
| --- | --- | --- | --- | --- |
| Rzodkiewka | 10 | 18 | 3 | ok. 2,7 |
| Marchew | 20 | 35 | 4 | ok. 3,8 |
| Truskawka | 60 | 22 co 4 dni | 8 + co 4 | ok. 5 (na dłuższą metę) |
| Pomidor | 50 | 18 co 3 dni | 8 + co 3 | ok. 6 |
| Dynia | 80 | 220 | 10 | 14 |
| Ananas (szklarnia) | 150 | 400 | 12 | ok. 21 |

- **Hit dnia** w porcie (+50% za jeden rodzaj), ceny zmieniają się lekko (±10%) — z ziarnem dnia.
- **Bez pułapki:** gdy gracz ma mniej niż 10 Dziupaków i nic nie rośnie, Klementyna daje 5 nasion rzodkiewki
  („Na koszt firmy, Sówko!”). Nie da się „zablokować”.
- **Strojenie:** gracz-symulator (jak w Sowich Trójkach i Ogrodach) gra 100–200 dni „rozsądnie”; cele: pierwsze
  ulepszenie konewki ok. 8.–12. dnia, telewizor ok. 10.–15., pełne pole ok. 60.–80. dnia.

---

## 15. Zapis i połączenie z SowieGry

### 15.1. Zapis w chmurze

- **Identyfikator gry: `farma`**, dokument `sowiegry/profil/sowiegry_gry/farma`, stan w polu `state` (JSON),
  `saveVersion: 1`, podsumowanie w `profil.records.farma` (karta gry, Rekordy, Akademia, Dziupla).

```js
{
  version: 1,
  day: 34, season: "lato", seed: "f-8k2x",          // dzień gry, pora roku, ziarno zapisu (pogoda, ceny)
  money: 12500,                                      // Dziupaki
  weather: { today: "deszcz", tomorrow: "slonce" },
  maps: {
    pole:      { size: [8, 6], tiles: [[0, 0, { t: "grzadka", wet: 1, plant: "pomidor", age: 5, harvests: 2 }], …] },
    ogrod:     { size: [4, 4], tiles: [ … ] },
    szklarnia: { level: 3, tiles: [ … ] },
    dom:       { level: 2, slots: { "parapet-1": { plant: "sowiStorczyk", age: 22, water: 1 }, … }, decor: { spanie: "galaz", tapeta: "kwiatki" } },
    farma:     { objects: [["zraszacz-srebrny", 6, 4], ["strach-sowa", 2, 9, { cosmetic: "wianek" }], …] },
  },
  inventory: { bar: ["konewka", "motyka", "sierp", "nasiona:marchew", …], bag: { "plon:pomidor": 14, … }, chest: { … } },
  tools: { konewka: 2, motyka: 1, sierp: 1, worek: 0, huhu: 1, pending: { konewka: 3 } },   // pending — gotowe rano
  upgrades: { plot: 2, fence: 1, scarecrow: 2, tv: true, antenna: false, … },
  pests: { pigeons: [[5, 0]], boars: null, shooed: { pigeons: 41, boars: 6 } },
  town: { rank: 3, hearts: 17, orders: [ … ], unlockedSeeds: ["rzodkiewka", …], sold: { marchew: 88, … } },
  stats: { harvested: 1240, earned: 48210, species: ["rzodkiewka", …], rainDays: 9 },
  features: { combat: false },
  adventure: null,                                     // zarezerwowane na przyszłość (rozdz. 10.5)
  tutorial: { letters: ["list-1", "list-2"], seen: ["przeciaganie"] },
  savedAt: 1795000000000,
}
```

- **Rozmiar:** ok. 15–40 KB (pole 80 grządek, szklarnia 48, dom ok. 30 miejsc, plecak i skrzynia) — daleko od
  limitu 1 MB dokumentu Firestore.
- **Kiedy zapis:** po każdym **śnie** od razu, przy wyjściu z aplikacji, a w trakcie dnia co najwyżej raz na
  30 s (jak w grach idle) — dzień można przerwać i wrócić w tym samym miejscu.
- **Dwa telefony:** farmy nie da się bezpiecznie „połączyć” (dwa różne pola) — proponuję pytanie jak w Ogrodach
  („Na drugim telefonie jest nowszy postęp: dzień 36. Wczytać?”), z numerem dnia w treści (pytanie 13).
- **Zasada „nic nie ginie”:** identyfikatory roślin, przedmiotów i ulepszeń tylko dopisujemy; nieznane pola
  (zapis z nowszej wersji) zostają; zapis jest normalizowany przy wczytaniu (testy jak w Trójkach).
- **Bezpieczeństwo produkcji** (jak w Sowich Trójkach, Analiza 5 rozdz. 13.1a): podgląd gry **nic nie zapisuje**
  (bramka zapisu — gra spoza `GAME_IDS`), testy tylko na emulatorze i w pamięci, **reguły Firestore publikujesz Ty**
  przed włączeniem zapisu (treść w [Załączniku B](#załącznik-b-reguły-firestore--do-opublikowania-dopiero-przy-etapie-f9)).

### 15.2. Połączenie z resztą SowieGry

| Element | Co się zmienia |
| --- | --- |
| **Rejestr gier** (`shared/sowie-platform.js`) | 7. gra: `{ id: "farma", name: "Sowia Farma", path: "SowiaFarma/", kind: "idle", saveVersion: 1, rebuilt: true }` (dopiero w F9; podgląd działa bez wpisu) |
| **SowieCloud** | `"farma"` w `GAME_IDS` — po Twojej publikacji reguł |
| **Sowia Dziupla** — tablica korkowa | karta-zdjęcie „Farma” z ruchomą ilustracją (Sówka podlewa grządkę, gołąb ucieka) i karteczką „Dzień 34 · 🪙 12 500” |
| **Sowia Dziupla** — ozdoby | **roślinki z Farmy na półce** (nowa kategoria), widok za oknem „Farma”, zabawka „pluszowy warchlak”, dywan „w marchewki”, lampa-dynia |
| **Wypluffki** (Analiza 7b, etap W8 — dopiero po wdrożeniu Farmy) | w Sowim Butiku (zakładka „Gry”): skórki narzędzi (np. Konewka-humbak), strachów i domu, Kózka-maskotka — tylko wygląd; poziom narzędzia widać zawsze po kolorowym pasku; oraz Wypluffkowy nawóz jakości (rozdz. 8.7) |
| **„Jak grać?”** (`shared/meta/guides-data.js`) | instrukcja: Cel, Sterowanie (stuknięcie i przeciąganie), Dzień i sen, Pogoda, Gołębie i dziki, Miasteczko, Ulepszenia |
| **Sowia Akademia** | metryki `farmaDays`, `farmaHarvest`, `farmaSold`, `farmaSpecies`, `farmaShooed`, `farmaOrders`; zadania dnia („Zbierz 15 plonów w Sowiej Farmie”, „Przepędź 3 gołębie”, „Zrealizuj zamówienie z tablicy”); osiągnięcia („Zielona łapka” — 25 gatunków, „Sowi strażnik” — 50 przepędzonych, „Przyjaciółka Sowiogrodu” — Ranga 5) |
| **Galeria** | nowe zdjęcia z Pexels za cele w Farmie (sowy, kozy, humbaki, rośliny — tak jak dotąd; decyzja 15: także warchlaki i gołębie) |
| **Rekordy** (`owl-tab.js`) | dzień, zarobione Dziupaki, zebrane plony, gatunki, przepędzone szkodniki |
| **Wersja demo** | Farma w pamięci strony, od dnia 1 (bez zapisu) |
| **PWA** (`sw.js`) | pliki gry do pamięci przy pierwszym wejściu |
| **Opisy „sześć gier”** | → „siedem gier” (`index.html`, `demo.html`, `manifest.webmanifest`, `docs/README.md`) |
| **Dokumentacja** | `SowiaFarma/docs/README.md` (instrukcja po polsku) i `SowiaFarma/docs/Documentation.md` (pełny opis kodu, AGENTS.md); `docs/Documentation.md` i `docs/README.md` |

---

## 16. Technika

### 16.1. Nowe pliki (propozycja)

| Plik | Za co odpowiada |
| --- | --- |
| `SowiaFarma/index.html`, `package.json`, `style.css` | strona gry (kolejność skryptów jak w innych grach, `data-sowie-game`), układ pion / poziom / komputer |
| `SowiaFarma/config.js` | identyfikator `farma`, `SAVE_VERSION`, rozmiary kafelka, czasy animacji, limity szkodników, flagi funkcji (`combat: false`) |
| `SowiaFarma/data/plants.js` | katalog roślin (miejsce, pory roku, dni, plony, ceny, odblokowanie, rysunek) + sprawdzanie poprawności |
| `SowiaFarma/data/items.js`, `upgrades.js` | przedmioty, narzędzia i ich poziomy, urządzenia, rozbudowy, meble i ozdoby |
| `SowiaFarma/data/npcs.js`, `orders.js`, `letters.js` | mieszkańcy, dymki, zamówienia, listy cioci (samouczek) |
| `SowiaFarma/data/maps.js` | układ farmy, domu, szklarni i miasteczka (kafelki, drzwi, miejsca na rośliny) |
| `SowiaFarma/sim/day.js` | **`advanceDay(stan, ziarno)`** — czysta noc (rozdz. 5.3) + lista zdarzeń poranka |
| `SowiaFarma/sim/weather.js`, `pests.js`, `economy.js` | pogoda z ziarnem, gołębie i dziki (z limitami), ceny, hit dnia, zamówienia |
| `SowiaFarma/sim/actions.js` | czynności na kafelkach (przekop, siew, podlej, zbierz, przepędź, postaw) — czyste funkcje stanu |
| `SowiaFarma/sim/bot.js` | gracz-symulator (strojenie i testy) |
| `SowiaFarma/creatures.js` | stworzenia i zdolności Sówki (rozdz. 10.5) |
| `SowiaFarma/state.js` | stan domyślny, wczytanie (normalizacja, nieznane pola), podsumowanie do profilu |
| `SowiaFarma/world/tilemap.js` | mapa kafelków, współrzędne, kolizje (budynki), warstwy |
| `SowiaFarma/world/owl-controller.js` | ruch Sówki: przelot do kafelka, kolejka czynności przy przeciąganiu, chodzenie klawiaturą |
| `SowiaFarma/world/gestures.js` | stuknięcie / przeciąganie / przytrzymanie → czynności (na `shared/engine/input.js`) |
| `SowiaFarma/render/` | `ground.js` (kafelki z pamięci), `crops.js` (rośliny jako gotowe obrazki), `props.js` (budynki, urządzenia), `creatures.js` (gołębie, dziki), `weather.js` (deszcz, mgła, śnieg), `interior.js` (dom, szklarnia) |
| `SowiaFarma/ui/` | HUD, pasek, plecak, arkusze sklepów, „Poranek”, „Kończysz dzień?”, prognoza |
| `SowiaFarma/tutorial.js`, `main.js` | listy cioci; strona: sceny, zapis, dźwięk, automat płynności, haki testowe `window.SowiaFarma` |
| `SowiaFarma/docs/README.md`, `docs/Documentation.md` | instrukcja i opis kodu |
| `assets/svg/farma/` | nowe SVG: gołąb (stoi, dziobie, leci), dzik i warchlak (stoi, śpi, trucht), narzędzia, zraszacze, strachy, studnia, skrzynka, budynki |
| `scripts/farma-symulacja.mjs` | strojenie ekonomii symulatorem (ręcznie, nie w CI) |

Zmieniane (dopiero przy włączeniu do SowieGry — F9): rejestr, `GAME_IDS`, reguły, Dziupla, Akademia, Galeria,
Rekordy, instrukcje, demo, `sw.js`, `package.json` (format, HTML), `eslint.config.js`, `scripts/check-syntax.sh`,
testy z „sześcioma grami”.

### 16.2. Logika czysta i deterministyczna

- Całe zasady (czynności, noc, pogoda, szkodniki, ekonomia) to **czyste funkcje bez strony i rysowania** — jak
  `board.js` w Sowich Trójkach. Dzięki temu: testy jednostkowe, gracz-symulator na setki dni w sekundy, ta sama
  pogoda na dwóch telefonach.
- Losowanie wyłącznie przez `createRng` z ziarnem (`farma:<ziarno zapisu>:<dzień>`).

### 16.3. Rysowanie i płynność (wnioski z Analizy 6)

- **Podłoże z pamięci:** kafelki (trawa, ziemia, ścieżki, płot) rysowane raz do osobnego płótna na mapę;
  przerysowywane tylko zmienione kafelki (np. podlana grządka).
- **Rośliny jako gotowe obrazki** (gatunek × etap × rozmiar ekranu), jak kafelki w Sowich Trójkach — co klatkę
  tylko `drawImage`; kołysanie i mruganie — najwyżej kilka roślin naraz, ok. 12 razy na sekundę.
- **Co klatkę** tylko to, co się rusza: Sówka, szkodniki, cząsteczki (krople, piórka), pogoda.
- **W spokoju** (nic się nie rusza) — 30 kl./s albo rysowanie na żądanie; **automat płynności** i limit 60 kl./s
  od pierwszego dnia; licznik `?perf=1`.
- **Cel na Redmi Note 10 Pro (Chrome):** przelot i przeciąganie ≥ 55 kl./s, w spokoju wątek strony ≤ 30%, start
  gry ≤ 1,5 s; pomiar `scripts/perf-bench.cjs` z nowym scenariuszem.
- **Wnętrza i sklepy** — elementy strony (DOM) tam, gdzie to lista albo przyciski (arkusze), płótno tam, gdzie
  świat gry.

### 16.4. Grafika

- **Postacie i przedmioty w SVG** (atlas Sowiego Świata, zasady plików SVG bez zmian): nowe ok. **30–40 plików**
  (gołąb ×3 pozy, dzik ×3, warchlak ×3, narzędzia ×4 w 5 kolorach poziomów — kolory podmieniane jak gatunki sów,
  zraszacze ×4, strachy ×4, studnia, skrzynka, kompostownik, beczka, budynki).
- **Rośliny rysowane kodem** (jak `plants.js` w Ogrodach) — 4–5 etapów; rośliny domowe **gotowe** z Ogrodów
  i Łącz i Hoduj; nowe: ok. 30 warzyw, kwiatów i roślin szklarniowych.
- **Mieszkańcy bez nowych rysunków:** kozy (`kozki/`), humbak, sowy w kolorach gatunków z Butiku.
- Każda nowa grafika najpierw **na obrazku do Twojej akceptacji** (jak makieta), potem w kodzie.

### 16.5. Dźwięk

- **Muzyka** (syntezator `scripts/make-audio.mjs`): „Farma” (dzień, spokojna), „Dom” (wieczór, cicha), „Miasteczko”
  (wesoła, z mewami i dzwonkiem portu), kołysanka nocy (2–3 s).
- **Efekty:** podlewanie (plusk), przekop (puk), siew (szelest), zbiór („pop”), zakup (jest: `zakup`), dzwonek sklepu
  (jest: `dzwonek`), „Hu-hu!” (jest: `hu-hu`), gruchanie gołębia, chrumkanie i tupot warchlaków, deszcz (pętla),
  świerszcze nocą, „ziewnięcie” Sówki.

---

## 17. Testy

### 17.1. Jednostkowe (`node --test`)

- **Katalogi:** unikalne identyfikatory, każda roślina ma rysunek, dni > 0, ceny dodatnie, rośliny wielokrotne mają
  czas odrastania, ulepszenia w kolejności, każde odblokowanie wskazuje istniejący warunek.
- **Czynności:** przekop, siew tylko na przekopanej, podlewanie, zbiór jednorazowej i wielokrotnej, pełny plecak →
  ostrzeżenie i zatrzymany zbiór (roślina czeka na grządce — nic nie ginie), nawozy jakości podnoszą szansę na
  ★★ / ★★★ (Wypluffkowy dokładnie jak Złoty), jeden nawóz na grządce, roślina z `zimuje` przy `features.frost = false`
  tylko zasypia, przeciąganie po 5 grządkach = 5 czynności, obszar narzędzi według poziomu.
- **Noc (`advanceDay`):** podlana rośnie, niepodlana stoi (nie usycha), deszcz podlewa pole i ogród, ale nie szklarnię
  i dom, zraszacz podlewa tylko swój zasięg, pora roku usypia rośliny bez więdnięcia, skrzynka sprzedaży → Dziupaki
  rano, ulepszenie gotowe rano.
- **Pogoda:** ta sama z tym samym ziarnem; nie więcej niż 3 deszczowe dni z rzędu; co najmniej 1 deszcz w tygodniu;
  festyn — ładnie.
- **Szkodniki:** limity szkód, przepędzenie przed snem = zero szkód, strach i płot zmniejszają odwiedziny,
  Tryb Przytulny = zero szkodników, **żadne stworzenie nie może zaszkodzić Sówce** (furtka walki zamknięta).
- **Ekonomia:** symulator 100 dni: kamienie milowe w zakładanych dniach (rozdz. 13.7), brak „pułapki” bez pieniędzy.
- **Zapis:** stan domyślny, normalizacja (brakujące i nieznane pola), wersja, podsumowanie do profilu; zapis
  poza `GAME_IDS` nie trafia do bazy (bramka).

### 17.2. W przeglądarce (Playwright, 5 profili telefonów; Chromium u mnie, WebKit w GitHubie)

Testy **nie czekają na klatki** — korzystają z haków (`advanceDay`, `settle`, `warp` Sówki), bo WebKit na maszynie
GitHuba bywa bardzo wolny (lekcja z przebiegów 262–265):

1. Start: farma, Sówka, pasek, HUD, bez błędów; 320 × 568 i poziomo — nic się nie nakłada, kafelek ≥ 40 px.
2. Stuknięcie suchej grządki → podlana; przeciągnięcie po 4 grządkach → 4 podlane.
3. Siew → sen → „Poranek” → roślina urosła; deszcz → pole podlane, szklarnia nie.
4. Zbiór → plecak; miasteczko → targ → „Sprzedaj wszystkie” → Dziupaki; Kozi Sklepik → zakup nasion.
5. Ulepszenie konewki → rano nowy poziom; rozbudowa pola → więcej grządek.
6. Gołąb na grządce → stuknięcie → odlatuje; dziki rano → przepędzenie; Tryb Przytulny → brak szkodników.
7. Dom: doniczka na parapecie, telewizor z prognozą, zmiana łóżka na gałąź.
8. Zapis (od F9, emulator): po śnie dokument `farma` i `records.farma`; nowa karta (nie przeładowanie —
   lekcja z WebKit) → ten sam dzień i stan.
9. Klawiatura (komputer): WASD, Spacja, 1–8, I, M.
10. Licznik `?perf=1`.

### 17.3. Na telefonie (dla Ciebie — dopiszę do `TESTY_NA_TELEFONIE.md`)

| Test | Co sprawdzasz |
| --- | --- |
| F1 | sterowanie: stuknięcie i przeciąganie po grządkach — czy wygodne kciukiem, czy Sówka robi to, co chcesz |
| F2 | pierwsze 3 dni z listami cioci — czy wszystko zrozumiałe bez instrukcji |
| F3 | deszcz i prognoza w telewizorze; sen na gałęzi |
| F4 | gołębie i dziki — czy są „cute” i czy przepędzanie bawi, a nie denerwuje |
| F5 | miasteczko: sprzedaż i zakupy, zamówienia z tablicy |
| F6 | ulepszenia i rozbudowy — czy tempo jest dobre (nie za wolno, nie za szybko) |
| F7 | płynność na Redmi (`?perf=1`), mały telefon i poziomo |
| F8 | (od F9) zapis: zamknij aplikację w środku dnia i wróć; drugi telefon |

### 17.4. Czas testów w GitHubie

Testy w GitHubie trwają dziś ok. **55 minut** (ok. 1360 testów w Chromium i WebKit, 2 równoległe procesy). Farma
doda ok. 100–150 testów (≈ +5–8 minut). **Proponuję przed Farmą** (osobna, mała zmiana) rozdzielić testy w GitHubie
na **dwa równoległe zadania** (Chromium i WebKit osobno) albo części — cały przebieg skróciłby się do ok. **30 minut**
(pytanie 16).

**Decyzja (2026-11-24 — „zostawiam Tobie… najlepiej i najefektywniej względem nakładów pracy i zużycia tokenów”):**
krok **T0** jeszcze **przed Sowią Dziuplą**, bo testów przybędzie już z Dziuplą i Wypluffkami:

1. **Dwa równoległe zadania w GitHubie:** „jakość + Chromium” (składnia, ESLint, Prettier, HTML, testy jednostkowe,
   reguły i testy w Chromium) oraz „WebKit”.
2. **WebKit (silnik Safari) tylko na profilach iPhone** (SE, 13, 13 poziomo). Na profilach Androida (Pixel 7,
   360 × 800) prawdziwe telefony mają Chrome, a ten sprawdza Chromium — WebKit na „Androidzie” niczego nie dodaje.

Przebieg skróci się z ok. 55 do ok. 25 minut, testów WebKit będzie o ok. 40% mniej, a pokrycie prawdziwych telefonów
zostaje. Mniej czekania i rzadsze, krótsze logi do czytania przy błędach. U mnie lokalnie dalej tylko Chromium.

---

## 18. Ryzyka

| Ryzyko | Skutek | Jak zapobiegamy |
| --- | --- | --- |
| **Gra jest dużo większa niż dotychczasowe** | długa budowa, trudno ocenić postęp | etapy F0–F10 z podglądem po F4 (da się już grać), pierwsza wersja „Pierwszy sezon” bez dodatków z „później” |
| Sterowanie na telefonie (przeciąganie vs przesuwanie mapy, trafianie w kafelki) | frustracja | kamera zawsze za Sówką (bez przesuwania mapy palcem), kafelek ≥ 40 px, automatyczne narzędzie, test F1 wcześnie (po F2) |
| Brak zegara i staminy → „nuda” albo „za łatwo” | gracz nie wie, co robić | listy cioci (cele), zamówienia, kamienie milowe, rośliny rosną tylko w nocy (rozdz. 5.4) |
| Szkodniki denerwują | gra przestaje być „cozy” | małe limity szkód, przepędzenie zawsze możliwe, nagrody za przepędzanie, Tryb Przytulny |
| Wydajność (duża mapa, dużo roślin) | lagi na Redmi | podłoże i rośliny z pamięci (rozdz. 16.3), automat płynności, pomiar w każdym etapie |
| Dużo grafik | długa praca | mieszkańcy i rośliny domowe z istniejących rysunków; nowe SVG najpierw do akceptacji na obrazku |
| Zapis z dwóch telefonów | nadpisanie dnia | pytanie „Nowszy postęp? dzień 36” (pytanie 13), zapis po każdym śnie |
| Ekonomia źle dobrana | za wolno / za szybko | gracz-symulator na 100–200 dni, liczby w jednym pliku `data/`, łatwa zmiana po testach |
| Testy w GitHubie coraz dłuższe | zawieszanie się / anulowanie przebiegów | rozdzielenie testów (rozdz. 17.4), testy bez czekania na klatki |
| Zmiany w produkcyjnej bazie | utrata postępu | bramka zapisu, testy tylko na emulatorze, reguły publikujesz Ty, zasada „nic nie ginie” |
| Dziupla jeszcze w budowie | karta i ozdoby Farmy nie mają gdzie trafić | Farma po Dziupli (Twoja decyzja); do tego czasu podgląd pod osobnym adresem |

---

## 19. Plan prac

| Etap | Co | Rozmiar |
| --- | --- | --- |
| **F0** | decyzje (rozdz. 20), akceptacja makiety — ta analiza | S |
| **F1** | logika: katalog roślin i przedmiotów, czynności, `advanceDay`, pogoda, szkodniki, ekonomia, stan i normalizacja, gracz-symulator + testy jednostkowe (bez grafiki) | L (5 dni) |
| **F2** | świat i sterowanie: mapa farmy z kafelków, Sówka (przelot, przeciąganie, klawiatura), kamera, pasek, HUD, sen i „Poranek” — rysunki zastępcze | L (5–6 dni) |
| **F3** | grafika farmy: podłoże, ok. 30 roślin (etapy), budynki, urządzenia — **najpierw obrazek do akceptacji** | L (5–6 dni) |
| **F4** | dom i szklarnia (wnętrza, doniczki z rysunkami z Ogrodów, telewizor, gałąź) → **pierwszy podgląd do zagrania** (adres `SowiaFarma/`, bez zapisu) | M–L (4 dni) |
| **F5** | miasteczko: ulica, mieszkańcy (kozy, humbak, sowy), arkusze sklepów, targ, tablica zamówień, Ranga | L (5 dni) |
| **F6** | ekwipunek (plecak z ostrzeżeniem o zapełnieniu, skrzynia, operacje zbiorcze), ulepszenia narzędzi, zraszacze, strachy, płot, rozbudowy pola / szklarni / domu | L (5 dni) |
| **F7** | pogoda (wszystkie rodzaje, efekty), prognoza, gołębie i dziki (nowe SVG, przepędzanie), Tryb Przytulny | M–L (4 dni) |
| **F8** | personalizacja, listy cioci (samouczek), dźwięk i muzyka, pory roku i pierwszy festyn, strojenie symulatorem, testy e2e i wydajności → **pełny podgląd** do Twoich testów F1–F7 | L (5–6 dni) |
| **F9** | po akceptacji i publikacji reguł: zapis w chmurze, karta w Dziupli, ozdoby Dziupli, Akademia, Galeria, Rekordy, „Jak grać?”, demo, PWA; dokumentacja (`docs/README.md`, `docs/Documentation.md`, dokumentacja gry) | M–L (4 dni) |
| **F10** | poprawki po Twoich testach (F8) i testach rodziny | M (2–3 dni) |
| **F11** | **audyt wszystkich plików i komentarze w kodzie** (Twoja prośba z 2026-11-24 — po pierwszej wersji Farmy): przegląd każdego pliku SowieGry (gry, `shared/`, Sowia Dziupla, Wypluffki, panel admina, skrypty, testy, `sw.js`); komentarze po polsku przy każdej funkcji i w nieoczywistych miejscach (co robi, dlaczego tak, skąd liczby); usunięcie martwego kodu i powtórzeń; zgodność z `docs/Documentation.md` i dokumentacją gier. **Bez zmian w działaniu gier** — te same testy przed i po; małe commity, folder po folderze | M–L (3–5 dni) |

**Razem ok. 44–50 dni pracy, czyli ok. 9–10 tygodni roboczych** (dla porównania: Sowie Trójki — 3–4 tygodnie, Dziupla —
10–14 dni). **Kiedy:** po Sowiej Dziupli i Wypluffkach (Analizy 7 i 7b — Twoja decyzja: „Farmę dodamy później”).
Rozdzielenie testów w GitHubie (T0) robię już przed Dziuplą (rozdz. 17.4). Po F10 — **audyt F11** (poza 44–50 dniami).

**Kolejność etapów i testów (decyzja 12 — „zostawiam Tobie”):** zostaje podgląd bez zapisu (F4–F8), a zapis i karta
w Dziupli dopiero po Twoich testach (F9) — najmniej ryzyka dla zapisów i najmniej poprawek. Testy na telefonie
w **dwóch rundach** (krótka po F4, pełna po F8). Zasady gry sprawdzają szybkie testy jednostkowe i gracz-symulator
(tanio, bez przeglądarki), a testy w przeglądarce obejmują tylko najważniejsze ścieżki (rozdz. 17.2). To mniej pracy,
krótsze przebiegi i mniej powtórek.

**Twoje czynności:** akceptacja grafik (F3, F7), testy podglądu (po F4 krótki,
po F8 pełny), publikacja reguł Firestore (Załącznik B — dopiero w F9), zgoda na kartę w Dziupli.

**Drugi etap (po pierwszej wersji, do wyboru):** drzewa owocowe, gotowanie (kuchnia, Kafejka Śnieżnej, kanał
w telewizorze), przyjaźnie z mieszkańcami, festyny w każdej porze roku, kózka-pomocnica, gołąb pocztowy, olbrzymie
warzywa, Zielnik (album roślin), Las i przygody (ewentualnie walka — rozdz. 10.5).

---

## 20. Pytania do właściciela (prostym językiem)

**Decyzje z 2026-11-24** (dosłownie w `UWAGI_WLASCICIELA.md`, tabela „2026-11-24”) — pytań otwartych nie ma:

| # | Decyzja | Gdzie w analizie |
| --- | --- | --- |
| 1 | pory roku — **tak**, z furtką: „być może wprowadzimy sezonowe rośliny i w przyszłości niektóre rośliny nie przetrwają zimy” | rozdz. 5.5 |
| 2 | waluta Farmy: **„Dziupaki”** | rozdz. 14 (i cały dokument) |
| 3 | pora dnia „za zrobione rzeczy” — tak | rozdz. 5.1 |
| 4 | szkodniki według rady (a) | rozdz. 10 |
| 5 | sterowanie według rady | rozdz. 6 |
| 6 | automatyczne narzędzie według rady | rozdz. 6.2 |
| 7 | nazwy — „Zdaję się na Ciebie” | rozdz. 4, 11.1 |
| 8 | pełny plecak — **ostrzeżenie, gracz sam opróżnia**; większe plecaki to ulepszenie | rozdz. 12 |
| 9 | jakość plonów — tak, plus **nawozy jakości** z Koziego Sklepiku i za Wypluffki | rozdz. 8.5, 8.7; Analiza 7b, rozdz. 10 |
| 10 | sprzedaż według rady (targ i skrzynka) | rozdz. 11, 13.2 |
| 11 | strój dnia — tak | rozdz. 13.6 |
| 12 | kolejność etapów i testów — „zostawiam Tobie” | rozdz. 19 |
| 13 | dwa telefony — tak | rozdz. 15.1 |
| 14 | przyjaźnie — drugi etap | rozdz. 11.2, 19 |
| 15 | Galeria — tak (także warchlaki i gołębie) | rozdz. 15.2 |
| 16 | testy w GitHubie — „zostawiam Tobie” | rozdz. 17.4 (krok T0) |

Dodatkowo: po pierwszej wersji Farmy — audyt wszystkich plików i komentarze w kodzie (F11, rozdz. 19). Kolejność
całości: najpierw Sowia Dziupla i Wypluffki, potem Farma (`STAN_PRAC.md`, punkt 0.8).

Pytania (dla porządku, w pierwotnym brzmieniu):

1. **Pory roku:** czy w grze mają być wiosna, lato, jesień i zima (po 14 dni)? Zimą pole odpoczywa, a działa
   szklarnia i dom. Posadzone rośliny nigdy nie więdną — tylko „zasypiają”. (**Polecam:** tak.)
2. **Pieniądze w Farmie:** czy mogą się nazywać **żołędzie** i być osobne od piórek z innych gier? (**Polecam:** tak —
   wtedy Farma nie psuje cen w Sowim Butiku.)
3. **Pora dnia:** czy niebo ma powoli robić się wieczorne, gdy zrobisz dużo rzeczy (tylko wygląd, bez żadnego
   limitu), czy ma być zawsze jasny dzień? (**Polecam:** wieczór „za zrobione rzeczy” — ładnie podpowiada, że czas
   spać, ale niczego nie wymusza.)
4. **Szkodniki — jak bardzo mają przeszkadzać?** a) trochę: gołębie wydziobują świeże nasiona, dziki cofają rośliny
   o jeden dzień (zawsze można je przepędzić przed snem); b) wcale — tylko przychodzą i są śmieszne; c) bardziej.
   (**Polecam:** a, a Tryb Przytulny wyłącza je całkiem.)
5. **Sterowanie:** stuknięcie („leć i zrób”) i przeciąganie palcem po grządkach — czy dodać też joystick na
   ekranie jako opcję? (**Polecam:** stuknięcie i przeciąganie; joystick tylko jako opcja w ustawieniach.)
6. **Automatyczne narzędzie:** czy gra ma sama wybierać konewkę / motykę / sierp zależnie od tego, w co stukniesz?
   (**Polecam:** tak, z możliwością wyłączenia.)
7. **Nazwy:** miasteczko **Sowiogród**, ciocia **Uszatka Ula**, koza **Klementyna**, humbak **Henio**, Pójdźka
   **Pola**, Puchacz **Bartek**, Płomykówka **Flora**, Uszatka **Ola** — pasują? Masz inne pomysły? (Można: „zdaję
   się na Ciebie”.)
8. **Pełny plecak:** czy nadmiar plonów ma sam trafiać do kosza przy domu (nic nie przepada)? (**Polecam:** tak.)
9. **Jakość plonów** (zwykła / srebrna / złota — za codzienne podlewanie): dodać czy nie? (**Polecam:** tak, ale
   prosto — złota roślina jest po prostu droższa.)
10. **Sprzedaż:** tylko na targu w miasteczku, czy też ze **skrzynki na farmie** (po ulepszeniu; pieniądze rano)?
    (**Polecam:** oba — skrzynka jako ulepszenie, targ z „hitem dnia”.)
11. **Strój dnia:** czy Sówka ma sama zakładać kalosze w deszcz, okulary w upał i czapkę w śnieg (jeśli nie
    wybrałeś innego stroju w Szafie)? (**Polecam:** tak, z wyłączeniem w ustawieniach.)
12. **Kolejność:** najpierw podgląd bez zapisu (jak Sowie Trójki), a zapis i karta w Dziupli po Twoich testach?
    (**Polecam:** tak.)
13. **Dwa telefony:** gdy na drugim telefonie jest dalszy dzień, gra pyta „Wczytać nowszy postęp (dzień 36)?” —
    dobrze? (**Polecam:** tak — farmy z dwóch telefonów nie da się bezpiecznie połączyć w jedną.)
14. **Przyjaźnie z mieszkańcami** (prezenty, serduszka u każdego mieszkańca): w pierwszej wersji czy w drugim etapie?
    (**Polecam:** drugi etap — na start wystarczą zamówienia i Ranga Miasteczka.)
15. **Galeria:** za cele w Farmie nowe zdjęcia sów, kóz, humbaków i roślin (jak dotąd), czy dołożyć też np.
    **warchlaki, gołębie i warzywa**? (**Polecam:** dołożyć warchlaki i gołębie — pasują do gry.)
16. **Testy w GitHubie:** czy mogę je rozdzielić na dwie równoległe części, żeby trwały ok. 30 minut zamiast prawie
    godziny? (To nie zmienia gier, tylko sposób uruchamiania testów.) (**Polecam:** tak, przed budową Farmy.)

Dodatkowo, jeśli chcesz: **ulubione warzywa, kwiaty albo ozdoby**, które koniecznie mają być w grze — dopiszę je do
katalogu (rozdz. 8.3).

---

## Załącznik A. Źródła

**Atlas mechanik** (w repozytorium): [`Mechaniki_Littlewood_Stardew_Valley_Sprout_Valley_Fields_of_Mistria.md`](Mechaniki_Littlewood_Stardew_Valley_Sprout_Valley_Fields_of_Mistria.md)
— rozdziały 2.3 (czas i energia w Littlewood), 3.3–3.12 (Stardew: zegar, pory roku, deszcz, szklarnia, doniczki,
zraszacze, strachy, narzędzia, ekwipunek), 4.8–4.9 (Sprout: ekwipunek, „Ship to Unlock”), 5.3–5.17 (Mistria: zegar,
narzędzia, statuy, szklarnie 25 / 100, Town Rank), 6.8 (różnice łatwe do pomylenia), 7.2 (sytuacje graniczne
podlewania).

**Przegląd w internecie (2026-11-23):**

- Stardew Valley Wiki, „Mobile Controls” — schematy sterowania na telefonie (stuknij, żeby iść; joystick i przyciski
  jako opcje): https://wiki.stardewvalley.net/Mobile_Controls
- Gamezebo, recenzja Hay Day — stuknięcie pola i przeciągnięcie palcem przez pole, żeby zebrać plony:
  https://www.gamezebo.com/reviews/hay-day-review/
- AOL, „Hay Day brings gesture based farming to the palm of your hand” — wybór narzędzia i przeciąganie po wszystkich
  polach: https://www.aol.com/2012/06/22/hay-day-iphone-ipad/
- Daily Dot, „video games no stress cozy” — zestawienie gier „bez stresu” (wśród nich gry bez paska staminy):
  https://dailydot.com/video-games-no-stress-cozy
- Wikipedia, „Garden owl” — sowa-straszak działa przez jakiś czas, dłużej, gdy się porusza / jest przestawiana:
  https://en.wikipedia.org/wiki/Garden_owl
- Bangor Daily News, „Owl decoy won't stop critters from destroying your crops” — rada: zmieniać położenie
  i dodać ruch: https://bangordailynews.com/2022/04/17/homestead/owl-decoy-wont-stop-critters-from-destroying-your-crops/

---

## Załącznik B. Reguły Firestore — do opublikowania dopiero przy etapie F9

**Teraz niczego nie publikuj.** Podgląd Farmy (F4–F8) nic nie zapisuje w bazie. Gdy podgląd zaakceptujesz,
poproszę o publikację tej treści (jak przy Sowich Trójkach) — zmiana tylko **dopisuje** `"farma"` do listy gier
i niczego nie zmienia dla obecnych gier.

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // SowieGry (projekt sowiegry-1e1f9). Wszystko poza ścieżkami niżej jest zamknięte.
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
        allow create, update, delete: if gra in ["runner", "jumper", "sowa3", "ogrody", "szklarnia", "trojki", "farma"];

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

Wcześniej reguły zmienią się przy Wypluffkach (portfel — [Analiza 7b, Załącznik B](ANALIZA_7b_Mikroplatnosci.md)),
więc przy F9 dostaniesz jedną, połączoną treść: tamte reguły plus `"farma"` na liście gier.

---

## Załącznik C. Przykładowy dzień (jak to będzie wyglądać)

1. **Poranek, dzień 12, wiosna.** Karta: „Urosło 14 roślin, 3 marchewki gotowe. Gołębie wydziobały 1 grządkę
   (strach-sowa przegonił 2). Dziś słońce. Poczta: zamówienie od Kózki Sprężynki — 5 marchewek.”
2. Sówka wychodzi z domu (stuknięcie drzwi). **Przeciąga palcem** po trzech rzędach grządek — konewka podlewa
   wszystkie po drodze; zraszacz w rogu podlał 4 sąsiednie już rano.
3. Na świeżo zasianej grządce siedzi gołąb: **stuknięcie** → „Hu-hu!” → „Gru?!” — odlatuje, zostawia piórko.
4. Przeciągnięcie po gotowych marchewkach — zbiór; przeciągnięcie z nasionami rzodkiewki po pustych — siew.
5. **Mapa → Miasteczko.** Tablica: zamówienie Sprężynki (5 marchewek) → +60 Dziupaków i serduszko Rangi. Targ
   w porcie: „Hit dnia: rzodkiewki +50%” → sprzedaż reszty. Kozi Sklepik: nasiona truskawek („Nowość!”).
   Warsztat: zamówienie miedzianej konewki (gotowa jutro rano).
6. **Dom.** Podlanie Sowiego storczyka na parapecie (mruga). Telewizor: humbak — „Jutro deszcz!”.
7. **Gałąź** → „Kończysz dzień?” → „Śpij” → Zzz… → **Poranek, dzień 13, deszcz** — pole podlane samo, nowa konewka
   w pasku.
