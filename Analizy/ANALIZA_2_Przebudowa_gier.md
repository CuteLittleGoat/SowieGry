# Analiza 2 — przebudowa gier SowieGry

> Data: 2026-09-27 · Wersja 2 (po decyzjach właściciela) · Zakres: SowaRunner, SowaJumper, Sowa3, Sowie Ogrody, Sowia Szklarnia oraz menu główne i meta-postęp · Status: **analiza**, bez zmian w kodzie.
> Zakłada wdrożenie Analizy 1 (zapis w Firestore) jako fundamentu. Wszystkie propozycje poniżej zapisują dane wyłącznie przez `SowieCloud`.
> Kolejność prac: [`ANALIZA_3_Plan_prac.md`](ANALIZA_3_Plan_prac.md).

---

## Decyzje właściciela (2026-09-27)

1. **Wszystkie rekomendacje z tabeli w rozdziale 8 zostały zaakceptowane.**
2. **Gra będzie prowadzona głównie na telefonie.** Responsywność optymalizujemy pod telefon w pionie, obsługiwany jedną ręką (rozdział 2.5). Komputer i orientacja pozioma są obsługiwane, ale na drugim planie.
3. **Jeden profil gracza z hasłem `huhu`** (Analiza 1). Nie ma rankingu między graczami, więc wszędzie, gdzie była mowa o rankingu, są **rekordy osobiste** (top 10 na grę i poziom trudności, rekordy wyzwania dnia).
4. **Nowe wymaganie: ładne menu główne** z wyborem gier, instrukcjami i galerią odblokowanych obrazków (rozdział 4.1). Menu dostaje osobny etap w planie prac, zaraz po fundamencie, jeszcze przed przebudową gier.

---

## 0. Najważniejsze wnioski

1. **Gry są zbudowane z warstw łatek.** Kolejne pliki nadpisują globalne funkcje poprzednich (`start = function patched…`). Sowa3 ma 16 plików JS, SowaJumper ładuje moduły łańcuchowo z odpytywaniem co 20 ms, a `shared/gameplay-expansion.js` zgaduje zebranie liścia po różnicy punktów i sam dopisuje punkty do gry. Kolejne ulepszenia będą coraz droższe i bardziej ryzykowne.
2. **Role maskotek są niespójne z wymaganiami.** Amic jest dziś pomocnikiem w Runnerze (dach = katapulta), Jumperze (trampolina) i Ogrodach (dostawy). Pracu Pracu w Ogrodach daje ×4 produkcji. Kozy w Szklarni to szkodniki, a w Runnerze zadają obrażenia. Humbak w Sowa3 jest tylko animacją, a w Szklarni nie występuje wcale.
3. **Najpoważniejszy problem grywalności:** w SowaRunner prędkość jest liczona w pikselach i nie skaluje się z ekranem. Na telefonie w pionie przeszkoda jest widoczna ok. **0,5 s** przed zderzeniem, na monitorze Full HD ok. **2,6 s**. Do tego obrót telefonu restartuje bieg (`SowaRunner/sketch.js:58`).
4. Proponuję **wspólny fundament**: „Sowi Świat” (biblia postaci, ról, stylu i dźwięku) oraz „Sowi Silnik” (lekki silnik Canvas 2D w modułach ES, bez p5.js, który waży 5,2 MB). Na nim przebudowujemy każdą grę od zera, z czytelną pętlą rozgrywki.
5. **Stałe elementy każdej gry** (wymagania): cute sowy jako bohaterowie, **Pracu Pracu** i **Amic** jako przeszkody, **liście Monstery** jako punktacja, **humbaki** jako bonusowe poziomy, **skaczące kózki** jako power-upy. Tabela zgodności: rozdział 2.1.
6. **Sowia Szklarnia** dubluje dziś Sowie Ogrody (te same rośliny, te same zasoby). Proponuję zmienić ją w grę logiczną typu **„połącz i hoduj” (merge)**. Wtedy zestaw ma 3 gry zręcznościowe, 1 idle i 1 logiczną.
7. **Telefon przede wszystkim:** wszystkie gry projektujemy najpierw pod pion i jedną rękę, ze strefami kciuka, bezpiecznymi obszarami ekranu i instalacją jako aplikacja (PWA). Szczegóły: rozdział 2.5.
8. **Nowe menu główne**: ścieżka przez „Sowi Świat” z kartami gier, ilustrowane instrukcje i galeria odblokowanych zdjęć z miniaturami i przeglądarką pełnoekranową (rozdział 4.1).
9. Kolejność: Analiza 1 → fundament (Sowi Silnik, grafika, powłoka telefonu) → menu główne → Sowia Ucieczka → Sowie Tory → Sowa w Chmurach → Sowie Ogrody → Łącz i Hoduj → meta (zadania, butik, osiągnięcia). Szczegóły: `ANALIZA_3_Plan_prac.md`.

---

## 1. Diagnoza stanu obecnego

### 1.1 Architektura kodu

| Gra | Pliki JS | Linie / rozmiar | Technologia | Sposób rozbudowy |
|---|---|---|---|---|
| SowaRunner | 9 (+ `p5.js` 5,2 MB nieminifikowany, `p5.sound.min.js` 0 B) | 883 linie / 43 KB | p5.js, tryb globalny | `extra-lives.js`, `obstacle-balance.js`, `render-fix.js`, `cute-rework.js`, `animation-polish.js`, `runner-events-extra.js`, `pause-final.js` kolejno nadpisują `start`, `updateRun`, `spawnStuff`, `drawWorld`, `drawBg`, `hit`, `jump`, `landRect`, `draw` |
| SowaJumper | 11 | 2524 linie / 79 KB | Canvas 2D | `difficulty.js` wstrzykuje 3 skrypty; `cute-loader.js` co 20 ms (do 200 prób) sprawdza, czy funkcje już istnieją, i wstrzykuje kolejne 5 skryptów po kolei |
| Sowa3 | 16 | 3125 linii / 107 KB | Canvas 2D (pseudo-3D) | 5 warstw scenografii; `visibility-corridor.js` po narysowaniu dekoracji **ponownie maluje trasę**, żeby ich nie zasłaniały; `finish-controls.js` dociąga `finish-details.js` i `pause-guard.js` |
| Sowie Ogrody | 1 | 297 linii / 49 KB | Canvas 2D + DOM | linie po 1–3 tys. znaków, praktycznie nieczytelne |
| Sowia Szklarnia | 1 | 155 linii / 43 KB | Canvas 2D + DOM | jw.; autozapis przypadkowy (`now % 7000 < 20`) |
| `shared/` | 14 | 3005 linii / 117 KB | DOM | `stable-panel.js` podmienia `innerHTML` panelu na własny „morph”; `idle-save-bridge.js` klika ukryte przyciski |

Konsekwencje:

- kolejność tagów `<script>` jest krytyczna, a błąd w jednej warstwie psuje następne;
- pauza jest realizowana w kilku miejscach naraz: adapter `registerGame`, pliki `pause-final.js` / `pause-guard.js` i funkcje `uiPaused()`, które sprawdzają **widoczność elementu `.sowie-paused-badge` w DOM**;
- `gameplay-expansion.js` co 100–140 ms zagląda do globalnych zmiennych gier (`typeof state`, `typeof mode`). Zebranie liścia „zgaduje” po skoku punktów (Runner: `delta >= 24 && delta <= 120`, Sowa3: `44–85`) i **sam dodaje punkty** (`score += bonus`). W grach arcade działają więc równolegle dwa systemy combo (z `cute-rework.js` i z rozszerzenia);
- dokumentacja pozwalająca odtworzyć grę 1:1 (wymóg `AGENTS.md`) musi opisać wszystkie warstwy i ich kolejność, co jest bardzo trudne.

### 1.2 Role maskotek a wymagania

| Element | Wymaganie | SowaRunner | SowaJumper | Sowa3 | Sowie Ogrody | Sowia Szklarnia |
|---|---|---|---|---|---|---|
| Cute sowy | bohaterowie | ✔ | ✔ | ✔ | ✔ (dekoracja) | ✔ (dekoracja) |
| Pracu Pracu | przeszkoda | ✔ | ✔ | ✔ (+ „Telefon od Magdy”, „Przyjmiesz zmianę?”) | ✘ zdarzenie daje **×4 produkcji** | ✘ tylko nazwa „Kaktus Pracu” |
| Amic | przeszkoda | ✘ dach = **katapulta** (+45 pkt), bok = przeszkoda | ✘ platforma-**trampolina** | ✔ (osobna plansza stacji) | ✘ **pomocnik** (dostawy = nagroda, „Kierownik dostaw Amic”) | ✘ brak |
| Liście Monstery | punktacja | ✔ | ✔ | ✔ | ✔ (waluta) | ✔ (waluta) |
| Humbaki | bonusowy poziom | ✔ mini-gra | ✔ mini-gra | ~ tylko animacja finału | ~ ulepszenie „Basen humbaka” + zdarzenie | ✘ brak |
| Skaczące kózki | power-up | ~ skok na kozę = wybicie, ale **dotknięcie z boku = utrata życia** | ✔ wybicie | ✘ tylko dekoracja (koza na leżaku) | ~ „Koza asystentka” | ✘ **szkodnik** podgryzający liście |

### 1.3 Grywalność — najważniejsze problemy

**SowaRunner**

- **Czas reakcji zależy od szerokości ekranu.** Przesunięcie świata to `spd * 60 * dt` pikseli (`sketch.js`, `moveStuff`), a rozmiary obiektów skalują się przez `s`. Przy maksymalnej prędkości Arcade (9,6 → 576 px/s) przeszkoda jest widoczna ok. 0,5 s przed sową na telefonie 390 px i ok. 2,6 s na ekranie 1920 px. Na telefonie gra jest więc kilka razy trudniejsza.
- **Zmiana rozmiaru okna restartuje bieg.** `windowResized()` wywołuje `reset()`, czyli obrót telefonu zeruje wynik bez ekranu końca gry.
- Jeden czasownik (skok / podwójny skok) i losowe rozmieszczenie przeszkód. Liście nie „podpowiadają” toru lotu.

**SowaJumper**

- Sterowanie przez przytrzymanie lewej/prawej połowy ekranu: palec zasłania planszę i nie da się sterować płynnie.
- 12 typów platform (normalna, ruchoma, krucha, Amic, poduszka, chmurka, liść, balkon, odpoczynek, obrotowa, tymczasowa, kozia trampolina) to za dużo, żeby czytać je w locie.

**Sowa3**

- Tylko zmiana toru (bez skoku i wślizgu), więc głębia rozgrywki jest mała, a przeszkody różnią się głównie wyglądem.
- Finał planszy to długa animacja (sowa → basen → humbak), a nie rozgrywka. Można ją pominąć dopiero po pierwszym obejrzeniu.
- Przeszkody spoza wymaganych rodzin: dziki, ludzie, donice, słupki, palety.

**Sowie Ogrody**

- Pierwszy prestiż wymaga 100 mln liści w cyklu (`potentialPrestigeSeeds`), czyli bardzo długo.
- Duży, gęsty panel i dużo liczb, a mało widocznych zmian w samym ogrodzie.

**Sowia Szklarnia**

- Rdzeń rozgrywki to kozy-szkodniki, sprzeczne z nową rolą kóz.
- 6 z 9 roślin to te same gatunki co w Ogrodach, te same zasoby (liście, woda). Obie gry idle konkurują ze sobą.

**Wspólne**

- **Trzy nakładające się systemy zadań**: misje profilu → kosmetyki (`sowie-core.js`), Sowia Akademia → XP i piórka (`sowie-academy.js`), kontrakty i serie → XP (`gameplay-expansion.js`).
- **Zatłoczony ekran**: pasek narzędzi (⏸ 🎀 ⭐ ⚙), dok (❓ 🎓 🖼️ ✨), HUD rozszerzenia, stos powiadomień i HUD gry naraz.
- **Dźwięk**: pojedyncze piski oscylatora (`tone()` w `sowie-core.js`), a muzyka to 8 nut w pętli co 430 ms.
- **Grafika**: każda gra rysuje sowę inaczej (p5 vs Canvas), emoji w interfejsie wyglądają różnie na każdym systemie, czcionki systemowe (Trebuchet / Comic Sans).
- **Responsywność**: `user-scalable=no` wszędzie, HUD Runnera rysowany w canvasie, nakładające się elementy na małych ekranach.

---

## 2. Wspólna wizja: „Sowi Świat”

### 2.1 Stałe elementy — kontrakt dla każdej gry

| | SowaRunner | Sowie Tory (Sowa3) | Sowa w Chmurach (Jumper) | Sowie Ogrody | Sowia Szklarnia |
|---|---|---|---|---|---|
| **Sowa-bohaterka** | biegnie, skacze, szybuje, ślizga się | pędzi trzema torami | wspina się po gałązkach | ogrodniczka | szklarniarka łącząca rośliny |
| **Pracu Pracu** | dymki, telefony, rój maili | dymki (ślizg), telefon zmieniający tor | latające dymki (da się zdeptać) | telefon zmniejszający produkcję | karteczki zasłaniające pola |
| **Amic** | dystrybutory, cysterny, znaki cen | dystrybutory, wózki, znaki | sterowiec, spadające kanistry | ciężarówka zastawiająca grządkę | skrzynie i kanistry blokujące pola |
| **Liście Monstery** | punkty i waluta | punkty i waluta | punkty i waluta | główna waluta | przedmioty do łączenia + waluta |
| **Humbak** | „Rejs na humbaku” | „Humbacze Tory” (po każdej planszy) | „Niebiański Ocean” | „Zatoka Humbaka” | „Basen Humbaka” |
| **Skaczące kózki** | 5 power-upów | 5 power-upów | 5 power-upów | „złota kózka” (premie) | kózki-wzmacniacze |

### 2.2 Postacie i ich zasady

**Sowy (bohaterki)**

- Główna bohaterka „Sówka” plus kolekcjonowane gatunki: Puszczyk, Płomykówka, Uszatka, Śnieżna, Pójdźka, Puchacz. **Tylko kosmetyka**, bez wpływu na rozgrywkę.
- Wygląd: okrągłe ciało, duże oczy z odblaskami, mały dziobek, różowe policzki, kontur 3 px w kolorze `#3b2f4a` (nigdy czarny).
- Animacje: mruganie co 3–5 s, bieg (6 klatek), skok z efektem squash & stretch, szybowanie, oszołomienie (gwiazdki), radość (zmrużone oczy).
- Jedna wspólna biblioteka rysowania sowy dla wszystkich gier, żeby sowa wszędzie wyglądała identycznie. Garderoba (obecne 9 dodatków) działa wszędzie.

**Pracu Pracu — „chochlik obowiązków”** (przeszkody ruchome i zaskakujące)

- Czerwono-biały dymek z brewkami i napisem „Pracu pracu!”.
- Warianty: **Dymek** (lata falą), **Telefon** (dzwoni i wibruje; wariant „Telefon od Magdy”), **Stos papierów / teczka** (niski), **Rój maili** (szyk w kształcie V), **Tablica „Przyjmiesz zmianę?”**, **Budzik**. Obecne żarty z Sowa3 zostają jako warianty Pracu Pracu.
- Zawsze zapowiadane: ikona „!” przy krawędzi ekranu i dzwonek ok. 0,8 s wcześniej.

**Amic — „infrastruktura stacji”** (przeszkody ciężkie i statyczne)

- Warianty: **dystrybutor**, **cysterna / ciężarówka** (długa), **znak z cenami** (wysoki, pod nim da się przejść ślizgiem), **wózek z kanistrami**, **barierka**, **kanister** (spada), **sterowiec Amic** (tło → przeszkoda w Jumperze).
- Kolory: biel + czerwień + zielony pas. Nazwa pisana własną czcionką. **Nie kopiujemy logotypu marki** (Amic to realna sieć stacji).
- Zasada czytelności: **Pracu = to, co się rusza i zaskakuje; Amic = to, co stoi i jest ciężkie.** Gracz uczy się dwóch rodzin zamiast kilkunastu przypadkowych przeszkód.

**Liście Monstery (punktacja)**

| Liść | Wartość | Efekt |
|---|---|---|
| Zielony | 10 pkt / 1 liść | podstawa |
| Złoty | 50 pkt / 5 liści | rzadki (ok. 8%) |
| Tęczowy | 100 pkt | uruchamia **Gorączkę Monster** (8 s: ×2 liście, gęstsze układy liści, **bez dodatkowych przeszkód**) |

Liście układane są we wzory (łuki, linie, zygzaki), które **uczą** ruchu: łuk nad przeszkodą pokazuje, jak ją przeskoczyć.

**Skaczące kózki (power-upy)**

Kózki zawsze podskakują (łukiem, z „meee!”), a złapanie daje efekt. Kózka nigdy nie zadaje obrażeń. Każda ma kolorową chustkę **i** ikonę (rozpoznawalność także dla osób z zaburzeniami widzenia barw):

| Kózka | Chustka / ikona | Efekt w grach zręcznościowych | Czas |
|---|---|---|---|
| Sprężynka | żółta / sprężyna | super-skok lub mocne wybicie | natychmiast |
| Tarcza | niebieska / bańka | chroni przed 1 trafieniem | do trafienia, max 15 s |
| Magnes | fioletowa / magnes | przyciąga liście | 8 s |
| Turbo | pomarańczowa / błyskawica | sprint z nietykalnością | 4 s |
| Podwajaczka | zielona / „×2” | podwójne liście | 10 s |

Złapana kózka przez chwilę jedzie na grzbiecie sowy (albo sowa na kózce). Czas działania można wydłużać w Sowim Butiku (rozdział 4.2).

**Humbaki (bonusowe poziomy)**

- Wejście: **Plusk-o-metr** napełniany liśćmi (np. 60) albo 3 rzadkie „bąbelki humbaka”. Po napełnieniu humbak wyskakuje z wody, słychać plusk i zaczyna się poziom bonusowy.
- Poziom bonusowy trwa 15–25 s: **bez obrażeń**, dużo liści, osobna spokojna muzyka („pieśń humbaka”). Kończy się podsumowaniem „Humbacza premia +X”.
- Każda gra ma własną wersję (rozdział 3).

### 2.3 Styl graficzny

- **Paleta** (tokeny wspólne dla CSS i JS):

  | Token | Kolor | Użycie |
  |---|---|---|
  | `--niebo-gora` / `--niebo-dol` | `#bfe9ff` / `#fff6e3` | tła |
  | `--monstera` / `--monstera-ciemna` | `#3fae6a` / `#2e8b57` | liście, sukces |
  | `--zloto` | `#f4c542` | złote liście, rekordy |
  | `--policzki` | `#ff9fb2` | sowy, akcenty |
  | `--kontur` | `#3b2f4a` | kontury, tekst |
  | `--pracu` | `#e8465a` | Pracu Pracu, zagrożenie |
  | `--amic-zielony` / `--amic-czerwony` | `#2fa84f` / `#d9303e` | Amic |
  | `--woda` | `#5cc8e8` | humbaki, woda |
  | `--sowa` / `--sowa-brzuszek` | `#b07a52` / `#f3e3c8` | sowa |

- **Zasady**: kontur 3 px (skalowany), miękkie cienie-elipsy pod obiektami, zaokrąglone kształty, brak czystej czerni, tła w 3 warstwach paralaksy na każdy biom.
- **Grafiki**: źródła SVG w `assets/svg/` (sowa, kózki ×5, humbak, rodziny Pracu i Amic, liście, platformy), przy starcie rasteryzowane do atlasu (OffscreenCanvas) w rozdzielczości urządzenia (DPR max 2). Łatwo je poprawiać w edytorze grafiki i wyglądają identycznie w każdej grze.
- **Bez emoji w grafice gier**: emoji renderują się różnie na Androidzie, iOS i Windows. Zastępują je ikony SVG.
- **Typografia**: czcionka **Fredoka** (licencja OFL, zestaw latin-ext z polskimi znakami), hostowana w repo jako WOFF2 (`assets/fonts/`), zapasowo `system-ui`. Cyfry o stałej szerokości w HUD.
- **„Soczystość” (juice)**: wstrząs ekranu (wyłączany przy ograniczeniu ruchu), zatrzymanie klatki 60 ms przy trafieniu, eksplozja listków, wyskakujące punkty, squash & stretch, płynne przejścia między scenami.

### 2.4 Dźwięk

Zastępujemy piski oscylatora prawdziwymi próbkami i muzyką.

**Efekty (ok. 25):** skok, podwójny skok, szybowanie (pętla), ślizg, lądowanie, liść (wysokość dźwięku rośnie z combo), złoty liść, tęczowy liść, start gorączki, trafienie przez Pracu („pracu!” — pisk dymka), trafienie przez Amic (metaliczne „bonk”), kózka („meee”, lekko inna dla każdego typu), start i koniec power-upu, humbak (pieśń + plusk), start bonusu, życie, nowy rekord, kliknięcia UI, zakup (idle), połączenie (merge), odliczanie 3-2-1, koniec gry (smutne „hu-hu”).

**Muzyka:** motyw menu, motyw każdej gry (Runner energiczny ok. 125 BPM, Jumper „powietrzny”, Sowie Tory miejski pop, Ogrody przytulne lo-fi, Szklarnia spokojna muzyka do łamigłówek), motyw humbaka (ocean, wolno), dodatkowa warstwa perkusji w Gorączce Monster.

**Źródła:** paczki CC0 (np. Kenney.nl, OpenGameArt z filtrem CC0, Freesound CC0), efekty z jsfxr/ChipTone, muzyka z BeepBox (własna kompozycja, bez problemów licencyjnych). Warto nagrać własne głosy: „Hu-hu!” sowy i rodzinne „Pracu pracu!”. Format MP3 (działa wszędzie), ok. 96 kb/s, pętle bez przerw, całość poniżej 3 MB, muzyka ładowana leniwie.

**Silnik audio:** Web Audio z szynami master / muzyka / efekty, suwaki głośności 0–100% zamiast wł./wył., limit jednoczesnych głosów i odstępów na dźwięk, wariacja wysokości ±5%, ściszanie muzyki podczas bonusu, wyciszenie po ukryciu karty, odblokowanie przy pierwszym dotknięciu (iOS), opcjonalne wibracje (Android).

### 2.5 Telefon przede wszystkim: responsywność i sterowanie

Założenia (decyzja 2): gra głównie na telefonie, w pionie, jedną ręką, w krótkich sesjach (2–5 min), przy różnej jakości zasięgu.

**Urządzenia referencyjne**

| Klasa | Rozmiar CSS w pionie | Przykłady | Rola w testach |
|---|---|---|---|
| Mały | 320 × 568 | iPhone SE (1. gen.) | minimum: wszystko działa, nic się nie nakłada |
| Mały–średni | 360 × 800 | popularne Androidy | **główny cel** |
| Średni | 390 × 844 / 393 × 852 | iPhone 13–15 | **główny cel** |
| Duży | 412 × 915 / 430 × 932 | Pixel, iPhone Pro Max | obowiązkowy |
| Poziomo | np. 844 × 390 | każdy telefon | obsługiwany, bez nakładania się elementów |
| Tablet / komputer | szerokość ≥ 768 | — | kolumna gry na środku, dekoracje po bokach |

**Zasady**

1. **Pion jest podstawą wszystkich gier**, także Runnera. Każdy ekran projektujemy najpierw w 360 × 800, potem sprawdzamy 320 × 568 i poziom.
2. **Świat w jednostkach logicznych, nie w pikselach.** Kamera dobiera skalę do ekranu, a prędkości są dobrane tak, żeby przeszkoda była widoczna **co najmniej 1,1 s** przed zderzeniem na najmniejszym ekranie w pionie. Czas reakcji nie zależy od telefonu.
3. **Strefy kciuka.** Sterowanie i główne przyciski są w dolnych ~40% ekranu. Górna część służy do czytania (HUD). Pauza jest w górnym rogu (rzadko potrzebna), a gra i tak pauzuje się sama przy każdej przerwie.
4. **Gesty w dowolnym miejscu planszy.** Tap, przytrzymanie, swipe (próg 24 px / 200 ms) i przeciąganie działają na całym ekranie gry, bez celowania w przyciski. Wyjątek: martwa strefa 16–20 px przy lewej i prawej krawędzi (systemowy gest „cofnij”) i przy dolnej krawędzi (pasek domowy iPhone’a).
5. **Blokada gestów przeglądarki:** `touch-action: none` na planszy, `overscroll-behavior: none` (bez „pociągnij, aby odświeżyć”), `-webkit-touch-callout: none` i `user-select: none` (bez menu po przytrzymaniu), `touch-action: manipulation` na przyciskach (bez opóźnienia i powiększenia po podwójnym tapnięciu).
6. **Bezpieczne obszary:** `viewport-fit=cover` + `env(safe-area-inset-*)`. HUD nigdy nie wchodzi pod wycięcie ekranu, Dynamic Island ani pasek domowy.
7. **Wysokość ekranu:** `100dvh` + `visualViewport`. Chowanie się paska adresu nie zmienia skali świata w trakcie gry i nigdy nie resetuje rozgrywki.
8. **Przerwy:** obrót ekranu, przejście do innej aplikacji, blokada ekranu, powiadomienie z góry czy połączenie przychodzące wstrzymują grę (`visibilitychange`, `blur`, `orientationchange`). Powrót poprzedza odliczanie 3-2-1.
9. **PWA jako główny sposób grania:** manifest z `display: "standalone"` i `orientation: "portrait"` oraz service worker. Po dodaniu do ekranu głównego nie ma paska przeglądarki ani gestu „cofnij” z Safari, dane nie są kasowane po 7 dniach, a gry działają bez zasięgu. Menu podpowiada instalację: na Androidzie przycisk „Zainstaluj”, na iPhonie krótka instrukcja „Udostępnij → Do ekranu początkowego”.
10. **Wydajność:** 60 kl./s na telefonie średniej klasy (np. Android z 4 GB RAM, iPhone 11). DPR max 2, pule obiektów (zero alokacji w pętli), statyczne tła w pamięci podręcznej, zatrzymana pętla przy ukrytej karcie. Jeśli przez 5 s gra działa poniżej 45 kl./s, proponuje tryb „Oszczędzanie baterii” (30 kl./s, mniej cząsteczek).
11. **Transfer w sieci komórkowej:** pierwsze wejście < 1,5 MB, jedna gra < 800 KB, muzyka i zdjęcia ładowane leniwie, w galerii miniatury zamiast zdjęć 1200 × 900 (rozdział 4.1).
12. **Dźwięk:** odblokowanie Web Audio przy pierwszym dotknięciu. Na iPhonie `navigator.audioSession.type = "ambient"` (Safari 16.4+): gra nie przerywa muzyki gracza i respektuje przełącznik wyciszenia. Wyciszenie po zablokowaniu ekranu.
13. **Wibracje:** krótkie (15–30 ms) przy trafieniu i złapaniu kózki, tylko na Androidzie (`navigator.vibrate`; Safari go nie obsługuje), z wyłącznikiem w ustawieniach.
14. **Tekst i przyciski:** tekst interfejsu min. 16 px (pola formularzy min. 16 px, bo inaczej iOS powiększa stronę), cele dotyku min. 48 × 48 px, odstępy między nimi ≥ 8 px.
15. **Dostępność:** ograniczenie ruchu (bez wstrząsów, mniej cząsteczek), rozróżnianie kształtem i ikoną (nie tylko kolorem), **Tryb Przytulny** (wolniej, bez końca gry — dla dzieci), widoczny fokus.
16. **Klawiatura i komputer nadal działają** (Spacja/↑/W, ↓/S, ←/→/A/D, P = pauza, Esc = menu), ale to drugi plan.

**Układ gier na telefonie w pionie**

| Gra | Sterowanie jedną ręką | Plansza | HUD i przyciski |
|---|---|---|---|
| Sowia Ucieczka | tap / przytrzymanie / swipe w dół w dowolnym miejscu | tor w dolnych ~60% wysokości; nad nim wolna przestrzeń na wysokie łuki liści, platformy i szybowanie | HUD u góry, dół wolny |
| Sowie Tory | swipe w 4 kierunkach w dowolnym miejscu | tory zajmują ~80% szerokości | HUD u góry |
| Sowa w Chmurach | przeciąganie palcem w dolnej połowie ekranu | pełny ekran | HUD u góry |
| Sowie Ogrody | tapy w ogród + dolny panel (bottom sheet) | ogród w górnych ~45% wysokości | zakładki panelu przy dolnej krawędzi |
| Łącz i Hoduj | przeciągnij i upuść | siatka 7 × 9, pole min. 44 px (7 × 44 = 308 px, mieści się w 320 px) | zamówienia nad planszą, „Sowia doniczka” pod planszą |

### 2.6 Technika: „Sowi Silnik”

```
shared/
  engine/   loop.js  view.js  input.js  audio.js  assets.js  sprites.js
            tween.js  particles.js  camera.js  rng.js  collide.js  pool.js  scene.js
  world/    owl.js  goats.js  pracu.js  amic.js  leaves.js  whale.js     ← postacie: wygląd + zachowanie
  ui/       hud.js  pause-menu.js  results.js  toasts.js  modal.js  password-gate.js
  meta/     cloud.js (Analiza 1)  progress.js (zadania, piórka, kolekcje)  records.js  guides-data.js
  menu/     menu.js  menu.css  games.js  guides.js  gallery.js           ← menu główne (rozdział 4.1)
  pwa/      manifest.webmanifest  sw.js
assets/     svg/  audio/  fonts/  gallery-thumbs/
SowaRunner/ index.html  main.js  game.js  patterns.js  bonus-whale.js  docs/
Sowa3/ …   SowaJumper/ …   SowieOgrody/ …   SowiaSzklarnia/ …
```

- **Moduły ES** (`<script type="module">`) bez etapu budowania: GitHub Pages serwuje je bezpośrednio. Minifikację (np. Vite) można dodać później.
- **Stały krok symulacji** (1/120 s) z interpolacją rysowania. W połączeniu z ziarnem (`?seed=`, już istniejące) wyzwanie dnia jest identyczne dla wszystkich i da się je testować.
- **Wzory (chunki) zamiast czystej losowości:** poziomy składane z ręcznie zaprojektowanych segmentów (przeszkody + liście + kózki) w progach trudności. Generator dba o brak powtórzeń i „oddech” po trudnym fragmencie. Test jednostkowy **sprawdza, że każdy wzór ma przejście**.
- **Sceny:** Ładowanie → Tytuł → Gra → Pauza → Bonus (humbak) → Wyniki.
- **Stan gry w jednym obiekcie** na grę, bez globalnych zmiennych dostępnych dla innych plików. Zdarzenia (`leaf:collected`, `goat:caught`, `run:ended`) zamiast zgadywania po punktach.
- **Usuwamy:** p5.js (5,2 MB) i pusty `p5.sound.min.js`, wszystkie warstwy łatek, `gameplay-expansion.js` (odpytywanie globali), wielokrotne mechanizmy pauzy, podmianę `innerHTML` w `stable-panel.js` (panele gier idle dostają małe funkcje renderujące z kluczami).
- **Testy:** jednostkowe (`node --test`) dla generatora wzorów, punktacji, liczników power-upów i ekonomii idle (symulator: np. „czas do pierwszego prestiżu”); e2e w Playwright dla każdej gry (start, 5 s gry z ziarnem, pauza, wyniki); testy na obu orientacjach telefonu.

---

## 3. Projekty gier

Każda gra zachowuje swój identyfikator (`runner`, `jumper`, `sowa3`, `ogrody`, `szklarnia`), więc profil i rekordy z Analizy 1 działają bez zmian.

### 3.1 SowaRunner → „Sowia Ucieczka” (side-scroller)

**Pomysł:** sowa ucieka przed nadciągającą **Chmurą Pracu** i biegnie przez coraz bardziej zwariowane okolice.

**Sterowanie**

| Akcja | Dotyk | Klawiatura |
|---|---|---|
| Skok / podwójny skok | tap | Spacja, ↑, W |
| Szybowanie (wolniejsze opadanie) | przytrzymanie w powietrzu | przytrzymanie skoku |
| Ślizg / szybkie opadanie | swipe w dół | ↓, S |

Zachowujemy „coyote time” i bufor skoku (już są). Pola kolizji ok. 80% rysunku, żeby gra była wybaczająca.

**Przeszkody**

| Rodzina | Przeszkoda | Jak ominąć |
|---|---|---|
| Pracu | Dymek na wysokości głowy | ślizg |
| Pracu | Dzwoniący telefon na ziemi | skok |
| Pracu | Rój maili (fala) | wyczucie rytmu |
| Pracu | Ściana karteczek z luką | skok w lukę |
| Amic | Dystrybutor | skok |
| Amic | Cysterna (długa) | podwójny skok albo szybowanie |
| Amic | Znak z cenami | ślizg pod spodem |
| Amic | Wózek z kanistrami (jedzie szybciej niż świat) | skok z wyprzedzeniem |

Dziury w terenie mogą zostać jako neutralny element toru.

**Chmura Pracu = życia.** Trzy „serduszka” pokazane są jako odległość chmury za sową. Trafienie przybliża chmurę, a 400 m bez trafienia oddala ją o jeden krok. Koniec gry, gdy chmura dogoni sowę.

**Kózki:** przeskakują przez tor łukami. Dotknięcie z dowolnej strony = power-up (tabela 2.2).

**Humbak — „Rejs na humbaku”:** po napełnieniu Plusk-o-metru sowa wskakuje na grzbiet humbaka. Przez 20 s płynie po oceanie: tap = humbak wyskakuje z wody, w powietrzu łuki liści, zero przeszkód.

**Biomy (co 1000 m):** Łąka → Miasto → Osiedle PRL → Stacja Amic → Plaża → Noc nad morzem, potem pętla z wyższą prędkością.

**Punktacja**

- Wynik = dystans (1 pkt/m) + liście × **mnożnik combo** (×1–×5; +1 poziom co 10 liści bez trafienia, trafienie obniża o 1 poziom, nie do zera) + premie: „O włos!” +25, kózka +50, humbacza premia.
- **Zadania biegu:** zawsze 3 aktywne (np. „Prześlizgnij się pod 3 znakami Amic”, „Złap Kózkę Magnes”, „Zbierz 80 liści w jednym biegu”). Każde 3 ukończone podnoszą stały **Sowi mnożnik** (poziom 1–20).
- Rekordy osobiste: dystans i wynik, osobno dla każdego poziomu trudności (top 10).

**Trudność:** prędkość w jednostkach świata rośnie przez ok. 3 min, a wzory odblokowują się progami dystansu. Tryby: **Chill** (wolniej, Tryb Przytulny bez końca gry dostępny jako opcja), **Arcade**, **Chaos** (szybciej, gęstsze wzory, osobne rekordy).

**Telefon w pionie (główny układ):**

- sowa stoi przy lewej krawędzi (ok. 18% szerokości), a kamera pokazuje min. 8 „szerokości sowy” przed nią;
- wraz z prędkością kamera **płynnie się oddala**, żeby przeszkoda była widoczna ≥ 1,1 s. Szybsze obiekty (wózek Amic) zapowiada ikona „!” przy prawej krawędzi;
- **wysokość ekranu to przestrzeń gry:** tor zajmuje dolne ~60%, a nad nim są platformy na 2–3 poziomach, wysokie łuki liści i trasy szybowania. Pion daje więcej rozgrywki, a nie tylko więcej nieba;
- w poziomie widać więcej toru przed sową przy tych samych prędkościach.

**Usuwamy:** `sketch.js` i wszystkie 7 warstw łatek, `p5.js`, `p5.sound.min.js`, `p5-early-random.js`.

### 3.2 Sowa3 → „Sowie Tory” (trzy tory w głąb ekranu)

Proponowana nowa nazwa w menu: „Sowie Tory” (identyfikator `sowa3` bez zmian).

**Sterowanie:** swipe ←/→ (tor), ↑ (skok), ↓ (ślizg); klawisze ←/→/A/D, ↑/W, ↓/S; opcjonalnie tap lewa/prawa strona.

**Plansze (kampania, każda ok. 75 s):** 1. Dyskont → 2. Wystawa kwiatów → 3. Osiedle PRL → 4. Stacja Amic. Po kampanii odblokowuje się **tryb Nieskończony**.

**Przeszkody według sposobu omijania**

| Typ | Pracu Pracu | Amic |
|---|---|---|
| Niska (skok) | stos papierów, teczka | barierka, kanister |
| Wysoka (ślizg) | dymek na wysokości głowy | znak z cenami, zadaszenie |
| Pełna (zmiana toru) | wielki telefon („Telefon od Magdy”) | dystrybutor, wózek, cysterna (długa, zajmuje tor na dłużej) |
| Ruchoma | telefon zmieniający tor (strzałka ostrzegawcza 0,8 s wcześniej) | — |

Każda plansza ma własną oprawę tych samych rodzin (np. w Dyskoncie „paleta Amic z płynem do spryskiwaczy”, w PRL „cysterna dostawcza Amic”). Dziki, ludzie, donice i słupki z obecnej wersji zostają **dekoracją przy bokach** (bez kolizji) albo znikają (decyzja 5).

**Kózki:** przeskakują między torami. Złapanie = power-up; w tej grze Turbo zastępuje **Kózia jazda** (sowa jedzie na kozie i automatycznie przeskakuje wszystko przez 8 s).

**Humbak — „Humbacze Tory”:** koniec planszy = działka z basenem. Sowa wskakuje do basenu, zmienia się w humbaka i przez 20 s **gracz steruje humbakiem** na trzech morskich torach: swipe w górę = wyskok nad falą, liście w kółkach, brak obrażeń. Potem podsumowanie planszy i następna. Dzisiejsza animacja przemiany zostaje jako krótkie (2 s) przejście.

**Punktacja**

- Liście × mnożnik combo (×1–×5), premia za ukończenie planszy, premia „bez trafienia”.
- **Gwiazdki planszy:** ★ ukończenie, ★★ ≥ określona liczba liści, ★★★ bez trafienia. Daje to cel do powtarzania.
- Rekordy osobiste: łączny wynik kampanii i rekord trybu Nieskończonego (top 10 na poziom trudności).

**Grafika i technika:** prawdziwa rzutnia perspektywiczna (punkt zbiegu, skala z głębokości), sortowanie obiektów po głębokości, mgła w oddali, przesuwająca się tekstura drogi, podświetlenie toru pod sową. Dekoracje **projektowo** poza korytarzem trzech torów, więc znika potrzeba ponownego malowania trasy.

**Telefon:** pion jako podstawa (tory zajmują ok. 80% szerokości), w poziomie droga na środku i scenografia po bokach. Czas widoczności przeszkody liczony w głębokości, więc nie zależy od ekranu. Swipe w prawo zaczynający się przy lewej krawędzi koliduje w Safari z gestem „cofnij”, dlatego gesty w martwej strefie krawędzi (2.5, zasada 4) są ignorowane, a zalecanym trybem jest PWA.

**Usuwamy:** 16 obecnych plików JS (`script.js` + 15 warstw).

### 3.3 SowaJumper → „Sowa w Chmurach” (wspinaczka w pionie)

**Sterowanie:** **przeciąganie palcem w dolnej połowie ekranu** (ruch względny, więc palec nie zasłania sowy ani platform nad nią), opcjonalnie przechylanie telefonu (na iOS wymaga zgody), klawisze ←/→/A/D. Przejście przez krawędź ekranu na drugą stronę zostaje.

**Platformy (6 czytelnych typów zamiast 12):** gałązka (zwykła), liść Monstery (sprężysty, +10 pkt), chmurka (znika po jednym odbiciu), huśtawka (ruchoma), balkon (szeroki, odpoczynek co ok. 150 m), krucha gałązka (łamie się).

**Przeszkody**

- **Pracu:** dymki latające poziomo. **Skok na dymek z góry go przebija** (+50 pkt i wybicie), dotknięcie z boku lub od dołu = trafienie. Poza tym rój maili (V) i telefon wibrujący na platformie.
- **Amic:** sterowiec Amic przelatujący przez ekran (nie do zniszczenia, trzeba go ominąć), spadające kanistry (znacznik u góry ekranu 1 s wcześniej), wisząca tablica cen (blokuje przejście).
- Jasna zasada: **Pracu da się zdeptać, Amic trzeba ominąć.**

**Kózki:** skaczą z platformy na platformę. Złapanie = power-up; tu Turbo to **Rakietka** (szybki lot w górę z nietykalnością przez 3 s), a Sprężynka wystrzeliwuje o ok. 40 m.

**Humbak — „Niebiański Ocean”:** co ok. 300 m na chmurze pojawia się humbak-gejzer. Wskoczenie w fontannę zaczyna 20 s bonusu: sowa odbija się od grzbietów humbaków płynących w chmurach i zbiera liście, a upadek jest niemożliwy.

**Upadek:** zamiast natychmiastowej straty życia kózka albo humbak łapie sowę i odnosi ją na ostatnią pewną platformę (−1 życie). Koniec gry dopiero przy zerze żyć.

**Strefy wysokości:** Ogródek (0–150 m) → Blok (150–400 m) → Chmury (400–800 m) → Zorza (800–1500 m) → Kosmos (1500 m+, humbaki-gwiazdozbiory).

**Punktacja:** wysokość (1 pkt/m) + liście × mnożnik + przebite dymki Pracu (+50) + seria idealnych lądowań (środkowe 30% platformy). Rekordy osobiste: wysokość i wynik.

**Telefon:** pion jako podstawa (szerokość logiczna 9 jednostek); w poziomie i na komputerze kolumna 9:16 na środku, po bokach paralaksa i HUD.

**Usuwamy:** 11 obecnych plików JS, w tym łańcuchowe ładowanie i `cute-loader.js`.

### 3.4 Sowie Ogrody — idle w nowej odsłonie

Zostaje gatunek idle/incremental. Porządkujemy go i dopasowujemy do ról maskotek.

- **Rozdziały zamiast suchych stref:** Parapet → Balkon → Działka → Basen → Szklarnia → Arboretum. Każdy rozdział ma 3–5 celów (np. „Kup 10 Monster”, „Odblokuj konewkę”), a ich wykonanie odblokowuje następny. Gracz zawsze wie, co robić.
- **Widoczny ogród:** każda kupiona roślina rośnie na ekranie (do limitu). Kamienie milowe (10/25/50/100 sztuk) zmieniają jej wygląd.
- **Pracu Pracu = przerywnik:** co 2–4 min aktywnej gry pojawia się dzwoniący telefon. Dopóki go nie odrzucisz (tap), produkcja jest niższa o 30%. Ulepszenie „Tryb samolotowy” odrzuca go automatycznie po 10 s. **Zastępuje obecne zdarzenie Pracu ×4** (sprzeczne z rolą przeszkody).
- **Amic = blokada:** co pewien czas ciężarówka dostawcza Amic zastawia jedną grządkę (rośliny pod nią nie produkują). 3 tapnięcia ją przeganiają. „Kierownik dostaw Amic” zmienia się w **„Koziego kuriera”**. Nieobecność nigdy nie jest karana: w czasie offline blokad nie ma.
- **Skaczące kózki = premie:** co 60–120 s przez ogród przeskakuje złota kózka. Tap daje losową premię: ×3 produkcji na 30 s, natychmiast 60 s produkcji, „kozi szał” (auto-klikanie 15 s) albo +50% Plusk-o-metru.
- **Humbak — „Zatoka Humbaka”:** Plusk-o-metr napełnia podlewanie i kózki. Po napełnieniu 20 s mini-gry: humbak wyrzuca liście z fontanny, a gracz łapie je tapnięciami z combo. Nagroda = kilka minut produkcji.
- **Liście Monstery:** główna waluta; Monstera jest podstawową rośliną, a pozostałe gatunki dają mnożniki.
- **Ekonomia:** przeliczenie symulatorem (skrypt Node w `tests/unit/`). Cel: pierwszy prestiż („Wielkie Przesadzanie”) po ok. 2–3 h, a nie przy 100 mln liści. Drzewko prestiżu uproszczone do 3 gałęzi po 3–4 węzły.
- **Czas offline** liczony z czasu serwera (Analiza 1). Okno powitalne pokazuje, co urosło.
- **UI:** telefon — ogród u góry, dolny panel z 4 zakładkami (Rośliny, Ulepszenia, Prestiż, Kolekcja); komputer — dwie kolumny. Zakup ×1 / ×10 / max.

### 3.5 Sowia Szklarnia → „Łącz i Hoduj” (gra logiczna typu merge)

**Dlaczego zmiana gatunku:** dziś Szklarnia to druga gra idle o tych samych roślinach, a jej rdzeń (kozy-szkodniki) jest sprzeczny z nową rolą kóz. Merge zachowuje motyw hodowli i krzyżowania, ale daje zupełnie inną rozgrywkę.

- **Plansza:** półki szklarni, siatka 7 × 9 pól, dopasowana do szerokości telefonu (pole min. 44 px). Przeciąganie przedmiotu podnosi go nad palec, żeby było widać, gdzie spadnie.
- **Łączenie:** dwa identyczne przedmioty = przedmiot wyższego poziomu. Łańcuchy (po 5 poziomów): **Monstera** (nasionko → kiełek → sadzonka → monstera → Złota Monstera), Pilea, Paproć, Kaktus. Hybrydy z obecnej gry (Monpilea, Alopaproć, Złotolistka) wracają jako **łączenie dwóch różnych roślin najwyższego poziomu**.
- **Źródło przedmiotów:** „Sowia doniczka” — tap daje nasionko (zapas ładuje się stopniowo; bez płatności i reklam). Łamigłówką jest gospodarowanie miejscem na planszy.
- **Zamówienia:** 3 sowie sąsiadki proszą o konkretne rośliny. Nagrody: liście Monstery (waluta) i gwiazdki odnowy. **Gwiazdki odnawiają kolejne pomieszczenia szklarni**, co zachowuje „budowanie pomieszczeń” z obecnej gry (Doniczarnia, Sala Upraw, Zraszalnia…).
- **Przeszkody:**
  - **Karteczki Pracu** zasłaniają pole; znikają po połączeniu obok.
  - **Telefon Pracu** co 10 ruchów dokłada karteczkę w pobliżu; znika po 2 połączeniach obok.
  - **Skrzynie Amic** blokują pola; 2 połączenia obok je otwierają (w środku nagroda).
  - **Kanister Amic** jest nieruchomy; usuwa go tylko kózka.
- **Kózki-wzmacniacze** (z zamówień i skrzyń): **Kózka Skoczek** skacze po planszy i łączy 3 losowe pary, **Kózka Zjadaczka** zjada karteczki Pracu w rzędzie i kolumnie, **Kózka Dżoker** pasuje do każdego przedmiotu, **Kózka Sprężynka** podnosi dowolny przedmiot o 1 poziom, **Kózka Taran** usuwa kanister Amic.
- **Humbak — „Basen Humbaka”:** co 5 wykonanych zamówień 45 s bonusu na specjalnej planszy z wodą: same dobre przedmioty, połączenia robią pluski, liczy się wynik. Nagroda: skrzynia z kózkami. **Rekord osobisty:** najlepszy wynik w Basenie Humbaka.
- **Stan gry** zapisuje się w `gry/szklarnia` (Analiza 1) z nową wersją `saveVersion`. Obecny postęp Szklarni zamieniamy na pakiet startowy (np. liście → waluta, liczba pomieszczeń → odnowione pomieszczenia).

**Wariant zapasowy** (tylko gdyby prototyp merge się nie sprawdził): obecna mechanika zarządzania z odwróconymi rolami: kozy pomagają (przyspieszają wzrost), Pracu Pracu i Amic przeszkadzają (karteczki obniżające produkcję, ciężarówki zajmujące pomieszczenie). Wymaga mocnego odróżnienia od Ogrodów (np. brak klikania, tylko planowanie układu).

---

## 4. Menu główne, meta-postęp i wspólny interfejs

### 4.1 Menu główne: wybór gier, instrukcje, galeria (nowe wymaganie)

Menu jest pierwszym, co widać po wejściu, więc dostaje własny etap prac (plan: etap 3), jeszcze przed przebudową gier. Na początku karty prowadzą do obecnych gier, a po każdej przebudowie podmieniamy tylko ilustrację, opis i instrukcję danej gry.

**Układ na telefonie w pionie**

```
┌──────────────────────────────┐  ← bezpieczny obszar (notch / Dynamic Island)
│ SowieGry            ☁️  ⚙️   │  logo · stan zapisu w chmurze · ustawienia
│  (Sówka macha)  „Hu-hu! W co │  animowana sowa w wybranym stroju
│   dziś gramy?”  ●●○ zadania  │  postęp 3 zadań dnia
├──────────────────────────────┤
│ ╭──────────────────────────╮ │
│ │ [ilustracja]  Sowia      │ │  karta gry = stacja na krętej ścieżce
│ │               Ucieczka   │ │  przez „Sowi Świat” (przewijanie w pionie)
│ │ Rekord: 1480 m  ★ Nowe!  │ │
│ │ [   GRAJ   ] [Jak grać?] │ │  przyciski ≥ 48 px
│ ╰──────────────────────────╯ │
│        ⋮ (4 kolejne karty)   │
├──────────────────────────────┤
│  🎮 Gry  📖 Jak grać  🖼️ Galeria  🦉 Sowa │  dolny pasek zakładek (strefa kciuka)
└──────────────────────────────┘
```

**Zakładka „Gry” (wybór gier)**

- Pięć dużych kart ułożonych wzdłuż ilustrowanej, krętej ścieżki przez „Sowi Świat” (łąka → miasto → chmury → ogród → szklarnia). Pionowe przewijanie jest naturalne na telefonie, a ścieżka zachowuje klimat „Sowiej Mapy”.
- Karta: ilustracja SVG gry z postaciami, nazwa, jedno zdanie opisu, rekord osobisty (z `profil.records`, bez dodatkowego odczytu), znaczek „Nowe!” po przebudowie gry, przycisk **Graj** (główny) i **Jak grać?**.
- Delikatne animacje: podskakujące kózki, pływający humbak, kołyszące się liście Monstery (wyłączane przy ograniczeniu ruchu).
- Na komputerze i tablecie: siatka 2–3 kolumn kart zamiast ścieżki.

**Zakładka „Jak grać” (instrukcje)**

- Lista gier, a w każdej 4–6 kart przewijanych w bok (swipe) z krótką animowaną demonstracją:
  1. **Cel gry** — jedno zdanie + ilustracja;
  2. **Sterowanie** — ikony gestów (tap, przytrzymaj, przesuń, przeciągnij) z animowaną dłonią;
  3. **Przeszkody** — Pracu Pracu (ruchome, zaskakujące) i Amic (ciężkie, statyczne) oraz jak je omijać w tej grze;
  4. **Kózki** — 5 power-upów z kolorem chustki, ikoną i efektem;
  5. **Humbak** — jak wejść do poziomu bonusowego;
  6. **Punkty i rekordy** — liście Monstery, combo, gwiazdki.
- Osobna karta **„Poznaj Sowi Świat”**: mini-słowniczek postaci (Sówka i inne sowy, Pracu Pracu, Amic, kózki, humbak, liście), przyjazny także dla dzieci.
- Treść instrukcji jest w jednym pliku danych (`shared/meta/guides-data.js`). Korzystają z niego menu, przycisk „Jak grać?” na karcie gry i menu pauzy w grze. Zastępuje obecny `shared/game-guides.js`.
- **Samouczek w grze:** przy pierwszym uruchomieniu każdej gry pierwsze ~20 s to spokojny fragment z podpowiedziami („Stuknij, żeby skoczyć”, „Przesuń w dół, żeby się prześlizgnąć”). Można go pominąć, a flaga „samouczek ukończony” trafia do `gry/{gameId}` w Firestore.

**Zakładka „Galeria” (odblokowane obrazki)**

- Siatka **2 kolumn** na telefonie (3 na tablecie, 4–5 na komputerze) z 30 zdjęciami sów z `Obrazki/`. Licznik „12 / 30” i filtry: Wszystkie / Odblokowane / Do zdobycia.
- **Zablokowane zdjęcie**: rozmyta miniatura z kłódką, tekst wymagania („Przebiegnij 1000 m w Sowiej Ucieczce”) i pasek postępu do celu. Motywuje i podpowiada, w co zagrać.
- **Nowo odblokowane**: znaczek „Nowe!”, a po powrocie do menu karta zdjęcia się odwraca (animacja) i słychać radosne „hu-hu!”. W trakcie gry wystarcza krótki komunikat, żeby nie rozpraszać.
- **Przeglądarka pełnoekranowa**: tap w miniaturę otwiera zdjęcie; swipe w bok przechodzi między odblokowanymi; powiększanie dwoma palcami i podwójnym tapnięciem (tylko tutaj, reszta gry blokuje powiększanie); swipe w dół zamyka. Pod zdjęciem: tytuł, autor i link do źródła w Pexels (zgodnie z `Obrazki/README.md`), przyciski **❤ Ulubione** i **Ustaw jako tło menu**.
- **Wydajność na telefonie**: dziś siatka ładuje pełne pliki 1200 × 900 (30 plików, łącznie 4,7 MB). Dodajemy miniatury 400 × 300 (WebP, ok. 25–40 KB, łącznie ok. 1 MB) w `assets/gallery-thumbs/`, generowane jednorazowo skryptem. `loading="lazy"`, `decoding="async"`, `srcset` pod gęstość ekranu, kolorowy placeholder. Pełne zdjęcie pobierane dopiero w przeglądarce.
- Stan galerii (odblokowane, obejrzane, ulubione, tło menu) zapisuje się w `profil.gallery` (Analiza 1). Wymagania odblokowania w etapie menu zostają obecne; w etapie meta przepisujemy je na nowe osiągnięcia.

**Zakładka „Sowa”:** garderoba, zadania dnia i tygodnia, rekordy osobiste wszystkich gier (okno „🏆 Rekordy” z Analizy 1), ustawienia (dźwięk, efekty, wibracje, Tryb Przytulny, „Wyloguj to urządzenie”). Sowi Butik dochodzi w etapie meta.

**Oprawa i działanie**

- Paleta i czcionka Fredoka z rozdziału 2.3, karty z zaokrągleniem ~24 px i miękkim cieniem, tło: niebo z paralaksą chmur. Opcjonalnie wieczorem (lub przy ciemnym motywie systemu) nocna wersja: gwiazdy, księżyc i śpiąca sówka.
- Cicha muzyka menu i dźwięki kliknięć (zgodnie z ustawieniami).
- Ekran hasła (Analiza 1) pojawia się przed menu tylko przy pierwszym wejściu na urządzeniu.
- Karta „Zainstaluj SowieGry na telefonie” (PWA) pokazywana, dopóki gra nie działa jako aplikacja.
- **Budżet:** menu bez zdjęć < 300 KB, gotowe do dotyku < 1,5 s na telefonie średniej klasy. Rekordy i stan galerii dochodzą z Firestore w tle (szkielet karty do czasu wczytania).
- Wszystkie elementy klikalne to prawdziwe `<button>` / `<a>` z widocznym fokusem. Menu działa także z klawiatury.
- Zastępuje obecne `index.html` + `shared/main-menu.js` + `shared/main-menu.css` oraz przyciski galerii, akademii i instrukcji doklejane do nagłówka.

### 4.2 Jeden system postępu zamiast trzech

| Obecnie | Po zmianie |
|---|---|
| Misje profilu → kosmetyki (`sowie-core.js`) | **Osiągnięcia** (trwałe) → odblokowują stroje, gatunki sów i zdjęcia Galerii |
| Sowia Akademia: misje dzienne/tygodniowe → XP, piórka | **Zadania dnia** (3, z różnych gier) + **Zadanie tygodnia** → piórka i XP |
| Kontrakty, serie, „✨ Rozszerzenia” (`gameplay-expansion.js`) | wchodzą w Zadania dnia i zadania biegu w grach |

- **Piórka** wydaje się w **Sowim Butiku**: stroje (obecne 9 + nowe), gatunki sów, dłuższe działanie kózek.
- **XP → Poziom gracza** widoczny w zakładce „Sowa”.
- **Galeria Sów** (30 zdjęć) zostaje, a wymagania odblokowania przepisujemy na nowe osiągnięcia.
- **Rekordy osobiste** z Analizy 1: top 10 na grę i poziom trudności, ostatnie gry, rekordy wyzwania dnia.

### 4.3 Wspólny interfejs w grach

**HUD (jeden standard):** lewy górny róg — pauza; środek — wynik i liście; prawy górny róg — życia i liczniki power-upów; wszystko w bezpiecznym obszarze. Dół ekranu wolny (strefa gestów). W trakcie gry max 1 komunikat naraz, a postęp zadań pokazujemy dopiero na ekranie wyników.

**Menu pauzy:** Wznów, Zacznij od nowa, Jak grać (te same karty co w menu), Ustawienia (suwaki dźwięku, efekty, wibracje, sterowanie, Tryb Przytulny), Garderoba, Wyjdź do menu. Duże przyciski w dolnej połowie ekranu. Znikają pasek narzędzi i dok z 8 przyciskami.

**Ekran wyników:** wynik, animacja nowego rekordu, zebrane liście, miejsce w osobistym top 10, postęp zadań, nowo odblokowane zdjęcie (jeśli jest), przyciski „Jeszcze raz” (duży, w zasięgu kciuka) i „Menu”.

---

## 5. Punktacja — zestawienie

| Gra | Rekord osobisty | Wzór wyniku | Mnożnik | Premie |
|---|---|---|---|---|
| Sowia Ucieczka | dystans i wynik | m + liście × combo | combo ×1–×5, Sowi mnożnik (zadania biegu) | „O włos!”, kózka, humbak |
| Sowie Tory | wynik kampanii, rekord Nieskończonego | liście × combo + premie plansz | combo ×1–×5 | ukończenie planszy, bez trafienia, gwiazdki |
| Sowa w Chmurach | wysokość i wynik | m + liście × combo + dymki | combo ×1–×5 | przebity dymek +50, idealne lądowania, humbak |
| Sowie Ogrody | liście w całej grze | produkcja / s | ulepszenia, prestiż | złota kózka, Zatoka Humbaka |
| Łącz i Hoduj | wynik Basenu Humbaka | punkty za połączenia × poziom przedmiotu | seria połączeń | zamówienia, skrzynie Amic |

Rekordy gier zręcznościowych są osobne dla każdego poziomu trudności (Chill / Arcade / Chaos).

---

## 6. Co usuwamy

| Obszar | Pliki / elementy |
|---|---|
| SowaRunner | `sketch.js`, `render-fix.js`, `extra-lives.js`, `obstacle-balance.js`, `p5-early-random.js`, `cute-rework.js`, `animation-polish.js`, `runner-events-extra.js`, `pause-final.js`, **`p5.js` (5,2 MB)**, **`p5.sound.min.js` (0 B)** |
| SowaJumper | `script.js`, `difficulty.js`, `cute-loader.js`, `extra-lives.js`, `bonus-fix.js`, `safety-balance.js`, `cute-rework.js`, `bonus-lanes.js`, `animation-polish.js`, `platform-expansion.js`, `pause-final.js` |
| Sowa3 | `script.js` i 15 warstw (`difficulty.js`, `extra-lives.js`, `visual-polish.js`, `stage-ambience.js`, `stage-obstacles.js`, `lane-balance.js`, `visibility-corridor.js`, `finish-pool.js`, `cute-rework.js`, `moving-obstacle-safety.js`, `finish-controls.js`, `finish-details.js`, `pause-guard.js`, `animation-polish.js`, `amic-stage.js`) |
| Gry idle | obecne `script.js` Ogrodów i Szklarni (zastąpione czytelnymi modułami), `shared/stable-panel.js`, `shared/idle-save-bridge.js` |
| Menu | `shared/main-menu.js`, `shared/main-menu.css`, `shared/game-guides.js` (treść przechodzi do `guides-data.js`), przyciski doklejane do nagłówka menu |
| Wspólne | `shared/gameplay-expansion.js`, `shared/sowie-runtime.js` (zastępuje go Sowi Silnik), `shared/modal-accessibility.js` i `shared/notification-manager.js` (zastępuje je `shared/ui/`), `tone()`/`startMusic()` z `sowie-core.js`, pasek narzędzi i dok, `shared/sowie-academy.js` w obecnej formie (logika przechodzi do `meta/progress.js`) |
| Dokumentacja | `docs/AUDYT_MERGE_CUTE_POLISH.md`, `docs/WDROZENIE_CUTE_POLISH.md`, `docs/PLAN_ROZWOJU_CUTE_POLISH.md` (opisują stary układ; do usunięcia) |

Zostają: `Obrazki/` (Galeria Sów, + miniatury), logika galerii z `shared/owl-gallery.js` (po przepięciu na `SowieCloud`, z nowym wyglądem w menu), rejestr gier, obsługa `?seed=` i `?testNow=`, konfiguracja testów i CI (rozszerzona).

---

## 7. Plan wdrożenia

Pełna kolejność prac, zależności, kryteria ukończenia i checklisty testów na telefonie: [`ANALIZA_3_Plan_prac.md`](ANALIZA_3_Plan_prac.md). Skrót:

| Etap | Zakres |
|---|---|
| 0 | Przygotowanie: porządki w repo, testy na profilach telefonów, emulator Firestore |
| 1 | Chmura (Analiza 1): Firestore, hasło `huhu`, kasowanie starych danych, rekordy |
| 2 | Fundament: Sowi Silnik, powłoka telefonu i PWA, postacie SVG, dźwięk, wspólny interfejs |
| 3 | **Menu główne**: wybór gier, instrukcje, galeria z miniaturami |
| 4 | Sowia Ucieczka (Runner) |
| 5 | Sowie Tory (Sowa3) |
| 6 | Sowa w Chmurach (Jumper) |
| 7 | Sowie Ogrody |
| 8 | Łącz i Hoduj (Szklarnia) |
| 9 | Meta: zadania, osiągnięcia, Sowi Butik, nowe wymagania galerii, sprzątanie |

Każdy etap trafia na `main` osobno. Zgodnie z `AGENTS.md` każda zmiana gry aktualizuje jej `docs/Documentation.md` i `docs/README.md`.

---

## 8. Decyzje (zatwierdzone 2026-09-27)

| # | Pytanie | Decyzja |
|---|---|---|
| 1 | Szklarnia jako gra merge („Łącz i Hoduj”) czy nadal idle? | ✅ **merge** |
| 2 | Runner: Chmura Pracu jako życia czy klasyczne 3 serduszka? | ✅ Chmura Pracu (wizualnie nadal 3 kroki) |
| 3 | Nowe nazwy w menu: „Sowia Ucieczka”, „Sowie Tory”, „Sowa w Chmurach”, „Łącz i Hoduj” | ✅ tak (identyfikatory i zapisy bez zmian) |
| 4 | Poziomy trudności Chill / Arcade / Chaos | ✅ zostają + Tryb Przytulny jako opcja Chill |
| 5 | Przeszkody spoza rodzin Pracu/Amic (dziki, ludzie, donice, słupki) | ✅ dekoracja bez kolizji |
| 6 | Źródło dźwięków | ✅ CC0 + własne nagrania „Hu-hu!” i „Pracu pracu!” |
| 7 | Grafika: SVG w plikach czy rysowanie kodem? | ✅ SVG w `assets/svg/` |
| 8 | Rekordy osobno dla każdego poziomu trudności? | ✅ tak (jeden gracz, więc bez rankingu między graczami) |
| 9 | Kolejność gier po fundamencie | ✅ Runner → Tory → Jumper → Ogrody → Szklarnia (menu wcześniej, jako etap 3) |
| 10 | PWA (instalacja na telefonie, offline) | ✅ tak, jako główny sposób grania |
| 11 | Główne urządzenie | ✅ telefon w pionie (rozdział 2.5) |
| 12 | Menu główne z wyborem gier, instrukcjami i galerią | ✅ tak (rozdział 4.1) |

---

## 9. Ryzyka

| Ryzyko | Ograniczenie |
|---|---|
| Przebudowa „od zera” traci drobne smaczki obecnych wersji | przed usunięciem każdej gry lista jej elementów (żarty, dekoracje, teksty) jako checklista do przeniesienia |
| Nowa gra merge to najwięcej projektowania | prototyp planszy i 1 łańcucha przed resztą; wariant zapasowy z rozdziału 3.5 |
| Balans (prędkości, ekonomia idle) | symulatory w testach jednostkowych, parametry w jednym pliku konfiguracyjnym na grę |
| Wydajność na starszych telefonach | pule obiektów, DPR max 2, tryb „Oszczędzanie baterii”, testy na urządzeniu średniej klasy |
| Gesty systemowe telefonu (cofanie w Safari, pasek powiadomień, pasek domowy) | martwe strefy przy krawędziach, auto-pauza, PWA w trybie `standalone` |
| Różnice między przeglądarkami telefonów (Safari vs Chrome) | testy na obu silnikach (Playwright: WebKit i Chromium) + ręczny test na iPhonie i Androidzie po każdym etapie |
| Znak towarowy Amic | tylko nazwa własną czcionką i ogólne kolory, bez logotypu |
| Duży zakres | etapy niezależne, każda gra wdrażana osobno; stara wersja działa do czasu podmiany |
