# SowieGry — dokumentacja techniczna repozytorium

## Zakres

Repozytorium zawiera menu główne i pięć samodzielnych gier przeglądarkowych (bez etapu budowania, serwowanych przez GitHub Pages):

| Gra             | Folder            | Identyfikator w bazie | Rodzaj                        |
| --------------- | ----------------- | --------------------- | ----------------------------- |
| Sowia Ucieczka  | `SowiaUcieczka/`  | `runner`              | arcade (Sowi Silnik, moduły ES) |
| SowaJumper      | `SowaJumper/`     | `jumper`              | arcade (Canvas 2D)            |
| Sowa3           | `Sowa3/`          | `sowa3`               | arcade (Canvas 2D, pseudo-3D) |
| Sowie Ogrody    | `SowieOgrody/`    | `ogrody`              | idle                          |
| Sowia Szklarnia | `SowiaSzklarnia/` | `szklarnia`           | idle                          |

Identyfikatory w bazie są stałe (są wpisane w opublikowane reguły Firestore) i nie zmieniają się przy zmianie nazw gier ani folderów. **Sowie Tory** (etap E5, folder `SowieTory/`) to nowa wersja Sowa3 w podglądzie przed podmianą — z tym samym identyfikatorem `sowa3` (wpis `preview` w rejestrze, przycisk „Wypróbuj nową wersję: Sowie Tory” na karcie Sowa3; `SowieTory/docs/Documentation.md`). **Sowa w Chmurach** (etap E6, folder `SowaWChmurach/`) to w ten sam sposób nowa wersja SowaJumper w podglądzie — identyfikator `jumper` (przycisk „Wypróbuj nową wersję: Sowa w Chmurach” na karcie SowaJumper; `SowaWChmurach/docs/Documentation.md`). **Sowie Ogrody** (etap E7) przechodzą przebudowę w tym samym folderze: nowa logika powstaje w `SowieOgrody/ogrod/` (moduły ES, stan w wersji 3 z migracją ze stanu wersji 2; `SowieOgrody/docs/Documentation.md`, rozdział „Nowa odsłona”), a do czasu podmiany działa dawna gra; od E7b nowa odsłona jest w podglądzie na stronie `SowieOgrody/nowa.html` (przycisk „Wypróbuj nową wersję: nowe Sowie Ogrody” na karcie Sowich Ogrodów; stan v3 zapisywany w osobnym polu `preview` dokumentu gry, pole `state` dawnej gry bez zmian). **Sowia Ucieczka** (etap E4) zastąpiła dawny **SowaRunner** z tym samym identyfikatorem `runner` — rekordy, top 10 i historia są wspólne, a folder `SowaRunner/` zawiera już tylko stronę przekierowania (`SowaRunner/docs/Documentation.md`). Wspólna warstwa w `shared/` zapewnia rejestr gier, **zapis postępu w Firestore (`SowieCloud`)**, ekran hasła, profil, kosmetyki, misje, Sowią Akademię, Galerię Sów, instrukcje, ustawienia, audio, pauzę i powiadomienia. Plan dalszych zmian: `Analizy/`.

## Struktura główna

```text
index.html                (menu główne — szkielet zakładek; treść rysuje shared/menu/)
config/
  firebase-config.js      (window.firebaseConfig — projekt rpg-dataslate-relay)
shared/
  sowie-platform.js       (rejestr gier, stałe, zdarzenia, ?seed= i ?testNow=)
  sowie-cloud.js          (SowieCloud — jedyny moduł z Firestore i pamięcią przeglądarki)
  password-gate.js        (ekran „Hasło sowy”, sówka ładowania, pasek offline, pytanie o nowszy postęp)
  sowie-core.js           (SowieCore — profil, kosmetyki, misje, ustawienia, audio, pauza, modale)
  notification-manager.js (kolejka powiadomień)
  sowie-runtime.js        (wspólny układ i ograniczone efekty)
  sowie-smoke-hook.js     (raportowanie błędów do tests/smoke.html)
  sowie-academy.js        (Sowia Akademia)
  owl-gallery.js/.css     (Galeria Sów)
  game-guides.js          (dok przycisków gry i okno instrukcji; treść z meta/guides-data.js)
  gameplay-expansion.js   (serie, precyzja, combo, wyzwanie dnia, kontrakty, album cech)
  stable-panel.js         (stabilny panel gier idle)
  modal-accessibility.js  (dostępność modali gier idle)
  records.js              (okno „🏆 Rekordy” w grach)
  cute-ui.css, game-enhancements.css
  pwa.js                  (rejestracja service workera)
  engine/                 (Sowi Silnik — moduły ES: pętla, widok, kamera, gesty, sceny, powłoka telefonu, atlas grafik…)
  world/                  (Sowi Świat — tokeny kolorów, czcionka, Sówka, katalog grafik postaci)
  ui/                     (wspólny interfejs gier: HUD, komunikaty, okna, menu pauzy, ekran wyników, ui.css)
  meta/                   (SowieProgress — zdarzenia i most do Akademii; guides-data.js — instrukcje)
  menu/                   (menu główne — moduły ES: zakładki Gry, Jak grać, Galeria, Sowa; menu.css)
SowiaUcieczka/            (Sowia Ucieczka — przebudowany SowaRunner, moduły ES na Sowim Silniku; docs/)
SowieTory/                (Sowie Tory — nowa wersja Sowa3 w podglądzie (E5), moduły ES na Sowim Silniku; docs/)
SowaWChmurach/            (Sowa w Chmurach — nowa wersja SowaJumper w podglądzie (E6), moduły ES na Sowim Silniku; docs/)
lab/                      (Sowie Laboratorium — strona testowa silnika na telefonie: postacie, gesty, informacje)
assets/icons/             (ikona aplikacji SVG i PNG)
assets/svg/               (źródła SVG postaci: sowa/, garderoba/, kozki/, humbak/, pracu/, amic/, liscie/, interfejs/)
assets/fonts/             (Fredoka 500 i 700 z polskimi literami, WOFF2, licencja OFL.txt)
assets/gallery-thumbs/    (miniatury zdjęć Galerii Sów, WebP 400 i 600 px)
assets/audio/             (dźwięki: sfx/ — 27 efektów, music/ — motyw menu, pieśń humbaka, motyw Sowiej Ucieczki, 4 motywy plansz Sowich Torów, audio.json, LICENSES.md)
manifest.webmanifest      (PWA)
sw.js                     (service worker — w katalogu głównym, żeby obejmował całą stronę)
scripts/make-icons.cjs    (generowanie ikon PNG z SVG)
scripts/make-fonts.py     (budowa czcionek Fredoka z polskimi literami — jednorazowo, wynik w repo)
scripts/make-audio.mjs    (syntezator efektów i muzyki → MP3 + manifest; wynik w repo)
scripts/make-thumbs.cjs   (miniatury WebP Galerii Sów 400 i 600 px → assets/gallery-thumbs/)
tests/
  smoke.html
  e2e/            (testy Playwright; telefon/ — testy na profilach telefonów)
  unit/           (testy node --test)
  rules/          (testy reguł Firestore na emulatorze)
firebase.json     (tylko emulator Firestore)
firestore.rules   (kopia reguł opublikowanych 2026-09-27)
playwright.config.js
SowaJumper/ Sowa3/ SowieOgrody/ SowiaSzklarnia/   (obecne gry, każda z docs/)
SowaRunner/       (tylko index.html — przekierowanie do SowiaUcieczka/ z parametrami adresu; docs/)
Obrazki/          (30 zdjęć Galerii Sów)
Analizy/          (analizy i plan prac)
docs/
.github/workflows/js-check.yml
```

## Kolejność skryptów na każdej stronie

Na początku `<head>` każdej strony (menu, gry, Laboratorium), ścieżki względne:

1. `config/firebase-config.js`
2. `shared/sowie-platform.js`
3. `shared/sowie-cloud.js`
4. `shared/password-gate.js`
5. `shared/pwa.js` (od E2a)

Dopiero potem `sowie-core.js`, gra i pozostałe moduły; w menu (bez `sowie-core.js`) — `sowie-academy.js` i `owl-gallery.js` z `defer` oraz moduł `shared/menu/menu.js`. Test `tests/unit/architecture.test.mjs` pilnuje tej kolejności.

## Menu główne (`index.html`, `shared/menu/`) — etap E3

Nowe menu (Analiza 2, rozdz. 4.1) zastąpiło `shared/main-menu.js`, `shared/main-menu.css` i przyciski Akademii, Galerii i instrukcji doklejane do nagłówka. Telefon w pionie najpierw, od 768 px siatka kart. Wszystkie klikalne elementy to prawdziwe `<button>` / `<a>` z widocznym fokusem (`outline: 3px solid var(--niebieski)`, odstęp 3 px); cele dotyku ≥ 48 px; układ działa od 320 × 568 bez przewijania w bok.

### `index.html`

- `<head>`: `viewport` z `viewport-fit=cover`, `theme-color` `#bfe9ff`, opis strony, manifest i ikony PWA (jak każda strona), `preload` czcionki `assets/fonts/fredoka-700.woff2` (`crossorigin`); style w tej kolejności: `shared/cute-ui.css` (ekran hasła i okna chmury), `shared/world/tokens.css`, `shared/ui/ui.css`, `shared/menu/menu.css`; skrypty: `config/firebase-config.js`, `shared/sowie-platform.js`, `shared/sowie-cloud.js`, `shared/password-gate.js`, `shared/pwa.js`, `shared/sowie-academy.js` (`defer`), `shared/owl-gallery.js` (`defer`) i moduł `shared/menu/menu.js` (`type="module"` — wykonuje się po skryptach `defer`, więc `window.SowieAcademy` i `window.SowieOwlGallery` już istnieją). Menu **nie** ładuje `sowie-core.js`, `notification-manager.js`, `game-guides.js` ani `owl-gallery.css`.
- `<body class="menu" data-sowie-menu>` (atrybut `data-sowie-menu` wyłącza doklejanie starych przycisków w `sowie-academy.js` i `owl-gallery.js`):
  - `.menu-sky` (`aria-hidden`) z trzema chmurami `.menu-cloud.is-1/2/3`;
  - `header.menu-header`: `.menu-topbar` z `h1.menu-logo` „SowieGry”, stanem zapisu `[data-cloud-status]` (`role="status"`, `aria-live="polite"`) i przyciskiem `[data-open-settings]` (`aria-label="Ustawienia"`); `.menu-hero`: przycisk `[data-hero-owl]` z płótnem 120 × 120 (`aria-label="Sówka — dotknij, żeby się przywitała"`) i dymek `.menu-bubble` z tekstem `[data-hero-text]` („Hu-hu! W co dziś gramy?”) oraz zadaniami dnia `[data-hero-tasks]`;
  - `main.menu-main` z czterema panelami `section.menu-panel[role=tabpanel]` (`tabindex="-1"`, `aria-labelledby` = przycisk zakładki): `#gry` (`[data-game-path]`, `[data-install-slot]`), `#jak-grac` (`[data-guides]`), `#galeria` (licznik `[data-gallery-count]`, filtry `[data-gallery-filters]` — trzy przyciski `data-filter="all|unlocked|locked"` z `aria-pressed`: „Wszystkie”, „Odblokowane”, „Do zdobycia”, siatka `[data-gallery-grid]`), `#sowa` (`[data-owl-tab]`); ukryte panele mają `hidden`;
  - `nav.menu-tabs[role=tablist]` (`aria-label="Menu SowieGry"`) z czterema `button[role=tab]` (`id="tab-<zakładka>"`, `aria-controls`, `aria-selected`, `tabindex="-1"` poza wybraną, `data-tab`): Gry, Jak grać, Galeria, Sowa — każda z ikoną `<span data-icon="games|guide|gallery|owl">` (SVG wstawia `menu.js`) i podpisem.

### `shared/menu/menu.css`

- `box-sizing: border-box` dla wszystkiego w `.menu`; `html { scroll-padding-bottom: calc(96px + safe-area) }` (przewijanie do elementu omija dolny pasek); `body.menu`: kolor `--kontur`, tło `linear-gradient(180deg, --niebo-gora 0%, --niebo-dol 70%) fixed`, Fredoka 16 px / 1,45 (`--czcionka-tekst`), bez podświetlenia dotyku, `overscroll-behavior-y: none`;
- **tło ze zdjęcia** (`body.has-photo`): `linear-gradient(rgba(255,246,227,.55) → .88 przy 60%)` na `var(--menu-photo)` `center / cover fixed` i `--niebo-dol`;
- **chmury**: 160 × 48 px, `rgba(255,255,255,.75)`, dwa „kłęby” z `box-shadow` (40 px / −18 px, 88 px / −8 px), animacja `menuCloud` (`translate: 180vw 0`, 60 s liniowo w nieskończoność; chmura 2: skala 0,7, 85 s, opóźnienie −30 s; chmura 3: skala 0,85, 70 s, −50 s), start 14% / 42% / 70% wysokości;
- **nagłówek** i **treść**: szerokość `min(100%, 560px)`, wyśrodkowane, marginesy boczne `max(16px, safe-area)`; logo 30 px pogrubione, białe z konturem 6 px `--kontur` (`-webkit-text-stroke`, `paint-order: stroke fill`), `min-width: 0`; stan zapisu — „pigułka” min. 36 px, biel 80%, 14 px pogrubione, `data-state="offline|blad"` na czerwono (`--amic-czerwony`); przycisk ikony `.menu-icon-button` — koło 48 × 48, biel 85%, cień `0 4px 12px`; `.menu-icon-button[hidden]` — ukryty;
- **sówka i dymek**: przycisk 112 × 112 (przezroczysty), dymek biały, zaokrąglenie 20 px, cień, „ogonek” z trójkąta obramowania 10 px po lewej; tekst 18 px pogrubiony; zadania: kropki `.menu-dot` 12 px (szare, zrobione — `--monstera`) i napis `.menu-hero-count` bez łamania, zawijanie całości;
- **treść**: dół `calc(96px + safe-area)` (miejsce na pasek), tytuły sekcji `.menu-section-title` 24 px; **pasek zakładek** `fixed` na dole (z-index 50), siatka 4 kolumn, zaokrąglenie 22 px u góry, biel 96%, cień w górę; przyciski min. 60 px, ikona 26 px nad podpisem 15 px pogrubionym; wybrana zakładka — kolor `--monstera-ciemna`, tło złote 35%;
- **przyciski** `.menu-button`: min. 52 px, zaokrąglenie 16 px, biel z obwódką 2 px, 17 px pogrubione; `.is-primary` — biel na `--monstera` z dolnym „cieniem” 4 px `--monstera-ciemna`, 19 px; `.is-danger` — tekst `--amic-czerwony`; wciśnięcie: `translateY(1px) scale(.98)`;
- **ścieżka kart** `.menu-path`: siatka, odstęp 28 px; `svg.menu-path-line` (absolutnie pod kartami) z krzywą: kreska biała 90%, 14 px, zaokrąglone końce, `stroke-dasharray: 2 26` (rząd „kamyków”); **karta** `.game-card`: zaokrąglenie 24 px, biel 95%, cień `0 10px 28px`; na telefonie 360–767 px karty nieparzyste mają `margin-right: 7%`, parzyste `margin-left: 7%` (zygzak); ilustracja `.game-card-art` 128 px z gradientem `--biom-gora` → `--biom-dol` i płótnem na całą powierzchnię; plakietka przystanku (lewy górny róg, „1. Łąka”) i opcjonalnie „Nowe!” (złota, prawy róg — gdy gra w rejestrze ma `rebuilt: true`); treść: nazwa 23 px, opis, rekord (pogrubiony, cyfry stałej szerokości, gwiazdka 20 px `--zloto-ciemne`) — w trakcie wczytywania **szkielet** `.is-loading` (przezroczysty tekst, przesuwający się gradient `menuSkeleton` 1,2 s); akcje: siatka `1.3fr / 1fr` („Graj”, „Jak grać?”);
- **karta instalacji** `.menu-install`: biel 92%, zaokrąglenie 20 px, obwódka 2 px `--woda`; **Jak grać** `.menu-guide`: biel 90%, zaokrąglenie 22 px, tytuł 21 px, tor kart instrukcji dosunięty do prawej krawędzi;
- **galeria**: nagłówek z licznikiem (18 px, cyfry stałej szerokości); chipy `.menu-chips button` min. 48 px, „pigułki”, wybrany — złoty i pogrubiony; siatka 2 kolumny (odstęp 12 px; ≥ 768 px — 3, ≥ 1100 px — 5); kafelek `.menu-tile` (zaokrąglenie 18 px, biel 95%, cień): zdjęcie 4 : 3 (`object-fit: cover`, tło zastępcze `--sowa-brzuszek`), tytuł 16 px, znaczek „Nowe!” (złoty, lewy górny róg), serduszko ulubionego (koło 32 px, prawy górny róg, `--serce`); zablokowany: zdjęcie `blur(9px) saturate(.6)` i `scale(1.12)`, kłódka w białym kole 44 px na środku, wymaganie 15 px, pasek postępu `.menu-progress` (8 px, zielone wypełnienie `scaleX`); nowe zdjęcie: animacja odwrócenia `menuFlip` 900 ms (od `rotateY(180deg)` i przyciemnienia, przez −12°);
- **przeglądarka zdjęć** `.menu-viewer`: `fixed` na cały ekran (z-index 9500), tło `#18121f`, siatka 3 rzędów (pasek: licznik „2 / 12” i zamknięcie; scena; informacje), `touch-action: none`; zdjęcie `object-fit: contain`, `transform-origin: center`, bez zaznaczania i przeciągania; przyciski poprzednie / następne po bokach sceny (ikona „następne” odbita dla poprzedniego); pod zdjęciem tytuł 21 px, autor i link „źródło: Pexels”, przyciski „Ulubione” i „Tło menu” (wciśnięte — złote tło, serduszko wypełnione);
- **zakładka „Sowa”**: karty `.menu-card` (biel 92%, zaokrąglenie 22 px), profil (płótno 96 px + poziom 20 px), listy `.menu-list` (wiersze na tle `--niebo-dol`, zaokrąglenie 14 px, pasek postępu na całą szerokość, zrobione — `--monstera-ciemna`), garderoba `.menu-wardrobe` (siatka `auto-fill, minmax(140px, 1fr)`, chipy `.menu-chip` min. 48 px, zablokowane z kłódką 18 px i przezroczystością 0,6, podpowiedź misji 13 px pod spodem), statystyki rekordów `.menu-stats` (kafelki `auto-fit, minmax(120px, 1fr)`, wartość 20 px), lista Top 10 `.menu-top`, opisy przełączników `small` 13 px;
- **komunikaty** w menu: `.menu > .sowie-toasts` — `fixed`, nad paskiem zakładek (`bottom: calc(92px + safe-area)`, z-index 60);
- **małe telefony (≤ 374 px)**: logo 26 px, stan zapisu tylko ikoną (napis ukryty wizualnie, zostaje dla czytników), sówka 88 px, tekst dymka 16 px;
- **≥ 768 px**: nagłówek i treść do 1100 px, ścieżka jako siatka 2 kolumn (linia ścieżki ukryta), pasek zakładek wyśrodkowany (560 px); **≥ 1100 px**: 3 kolumny kart;
- **ograniczenie ruchu** (`prefers-reduced-motion` albo `html.sowie-reduced-effects`): bez chmur, odwracania kart i animacji szkieletu.

### `shared/menu/menu.js` — wejście

- **Ikony**: każdy `[data-icon]` dostaje `ICONS[nazwa]`, przycisk ustawień — `ICONS.settings`.
- **Komunikaty**: `createToasts({ root: document.body })`; jeśli strona nie ma `window.SowieNotifications`, menu ustawia adapter `toast({ title, detail, reward, kind })` → jeden napis „tytuł · szczegół · nagroda” (3,2 s; `important` i `mission` jako „nagroda”) — z niego korzystają Akademia i Galeria.
- **Atlas postaci**: `createAtlas({ catalog: SPRITES, baseUrl: SVG_BASE })`, budowany dla `80 × min(2, devicePixelRatio)` pikseli na jednostkę; po zbudowaniu karty są rysowane od nowa, zakładka „Jak grać” dostaje obrazki (jeśli była wyrenderowana bez nich i nie jest akurat widoczna — inaczej przy następnym pokazaniu), sowa w profilu się rysuje, rusza animacja.
- **Dźwięk**: `fetch(assets/audio/audio.json)` → `createAudio({ manifest, baseUrl, preloadOnUnlock: MENU_SOUNDS })` z `MENU_SOUNDS = ["klik", "hu-hu", "zakup", "rekord"]` (po pierwszym dotknięciu wczytują się tylko te 4 efekty), `connectAudioSettings(audio, SowieCloud)` (głośności z profilu), `bindUnlock(window, { ignore: gest w odnośniku a[href] })` — stuknięcie w „Graj” nie odblokowuje dźwięku i nie zaczyna pobierania ok. 230 KB efektów i muzyki tuż przed przejściem do gry (Safari / WebKit zgłasza przerwane pobieranie jako błąd strony); `audio.onChange`: odświeża suwaki w zakładce „Sowa” i — gdy dźwięk jest odblokowany, muzyka nie gra, a głośność muzyki i ogólna są > 0 — włącza pętlę `menu` (cicha muzyka menu). `sound(nazwa)` gra efekt tylko po odblokowaniu (przy pierwszym użyciu czeka na wczytanie pliku). Każde kliknięcie przycisku (nie odnośnika) gra „klik”. Brak manifestu → `console.warn`, menu działa bez dźwięku.
- **Zakładki**: `selectTab(id, { focus, scroll })` — nieznane id → `gry`; ustawia `aria-selected` i `tabindex` przycisków, `hidden` paneli, adres (`history.replaceState`: `gry` bez `#`, pozostałe `#jak-grac`, `#galeria`, `#sowa`; zapytanie `?…` zostaje; odnośnik do instrukcji jednej gry `#jak-grac-<gra>` zostaje bez zmian), przy zmianie przewija na górę, woła `onShow`. Klawiatura na pasku: ←/→ (w kółko), Home, End — wybór i fokus. `onShow`: „Jak grać” renderuje instrukcje przy pierwszym pokazaniu (albo gdy brakowało obrazków), „Galeria” — `render()`, „Sowa” — `renderOwlTab()`, „Gry” — układ ścieżki w następnej klatce. Start: zakładka z adresu (`#galeria`, `#sowa`, `#jak-grac`, `#jak-grac-sowa3` → zakładka „Jak grać” i przewinięcie do sekcji gry).
- **Stan zapisu**: `SowieCloud.onStatus` → `[data-cloud-status]` (`data-state` = status albo `test`, ikona + krótki napis z `cloud-status.js`, `aria-label` „Zapis: <opis>”) i opis w ustawieniach.
- **Sówka w nagłówku**: animator `createOwlAnimator()`; stuknięcie: skok 0,55 s (wysokość 0,28 j., parabola), potem „radość” 1,1 s i lądowanie (`land(0.8)`), kolejne powitanie z listy (`GREETINGS`: „Hu-hu! W co dziś gramy?”, „Hu-hu! Miło Cię widzieć!”, „Pracu Pracu znowu coś kombinuje…”, „Kózki uciekły do szklarni!”, „Liście monstery same się nie zbiorą!”) i „hu-hu”; rysowanie: płótno = rozmiar CSS × DPR, jednostka = bok / 1,7, sowa w (0,85; 1,6) o rozmiarze 1,1 z dodatkiem z garderoby. Zadania dnia: kropki z `taskProgress(SowieAcademy.snapshot())` bez zadania tygodnia i „Zadania dnia: X / 3”.
- **Karty gier**: `renderGameCards(...)` (niżej); `updateRecords()` — rekordy z `profil.records`, szkielet do `SowieCloud.isReady()`; `layout()` (tylko na zakładce „Gry”): krzywa ścieżki i rozmiar płócien = rozmiar CSS × DPR (zmiana → karta do przerysowania); `ResizeObserver` na ścieżce woła `layout()`; `IntersectionObserver` zaznacza widoczne płótna. „Jak grać?” na karcie otwiera okno `openModal` „Jak grać — <tytuł>” z `renderGuide` (obrazki z atlasu) i przyciskami „Rozumiem” oraz „Graj” (przejście do gry); po zamknięciu fokus wraca na przycisk.
- **Pętla**: `createLoop({ step: 1/60 })` z rysowaniem 30 razy na sekundę (`setRenderRate(30)`): aktualizuje sówkę i animatory kart, rysuje sówkę i (tylko na zakładce „Gry”) widoczne albo oznaczone karty; `drawCard` czyści płótno, ustawia skalę DPR i woła `drawCardArt` z bieżącym dodatkiem sowy. Pętla rusza po zbudowaniu atlasu; przy ograniczeniu ruchu (`prefers-reduced-motion` albo `sowie-reduced-effects`) zatrzymana — rysowana jest jedna nieruchoma klatka (czas 0,3 s) po każdej zmianie.
- **Dane z chmury**: `refreshAll()` po `SowieCloud.ready` i `onProfileReload` — klasa `sowie-reduced-effects` z `settings.reducedEffects`, rekordy, zadania, tło, przerysowanie kart, przebudowa widocznej zakładki „Sowa” / „Galeria”, start animacji; `sowie:academy-changed` → zadania w dymku i widoczna zakładka „Sowa” / „Galeria”; `sowie:gallery-changed` → tło i galeria (gdy przeglądarka zdjęć jest zamknięta); `pageshow` z `persisted` (powrót „wstecz” z gry do strony z pamięci przeglądarki) → `location.reload()` (świeże rekordy i zadania).
- **Tło menu**: `applyBackground()` — gdy `SowieOwlGallery.snapshot().background` wskazuje zdjęcie: `body.has-photo` i `--menu-photo: url(miniatura 600 px)`.
- **Ustawienia w nagłówku**: przełącza na „Sowa”, przewija do `#ustawienia` (płynnie, chyba że ograniczenie ruchu) i ustawia na nim fokus.
- `window.SowieMenu` (testy e2e i Laboratorium): `selectTab`, `tab()`, `atlas`, `audio()`, `gallery` (API zakładki), `owl` (API zakładki „Sowa”), `frames()` (liczba narysowanych klatek), `animating()`.

### `shared/menu/games.js` — zakładka „Gry”

- `MENU_GAMES` — dane menu dla gier z rejestru: przystanek, opis, kolory biomu (`[góra, dół]` z tokenów): `runner` — „Łąka”, `[nieboGora, monsteraJasna]`; `jumper` — „Chmury”, `[niebieski, wodaJasna]`; `sowa3` — „Miasto”, `[policzki, sowaBrzuszek]`; `ogrody` — „Ogród”, `[nieboDol, monsteraJasna]`; `szklarnia` — „Szklarnia”, `[wodaJasna, monsteraJasna]` (opisy jednym zdaniem — jak na kartach);
- `formatNumber(n)` (`pl-PL`, obcięcie w dół), `recordText(gameId, records)` — rekord osobisty z `profil.records` (bez dodatkowego odczytu z bazy): najlepszy ze wszystkich poziomów (`chill`, `arcade`, `chaos`) — Sowia Ucieczka (`runner`) `bestDistance` „Rekord: N m”, SowaJumper `bestHeight` „Rekord: N m”, Sowa3 `bestScore` „Rekord: N pkt”; Ogrody „Liście: N” (`lifetimeLeaves`), Szklarnia „Pomieszczenia: N” (`rooms`); brak — `null`;
- **ilustracje** (`drawCardArt(ctx, atlas, gameId, czas, szerokośćCSS, wysokośćCSS, stan)`): jednostka świata = wysokość / 2,3, szerokość sceny = szerokość / jednostka; `hop(czas, okres, wysokość)` — podskok przez 60% okresu (parabola), potem przerwa; `cloud()` — trzy białe elipsy; `ground()` — pas ziemi 10 j. od `y`; `workCloud(ctx, x, y, rozmiar, czas)` (od E4e) — Chmura Pracu: 3 elipsy `#6d6480` (0,6 × 0,36, 0,34 × 0,26 przesunięta o −0,4 / +0,06, 0,36 × 0,3 przesunięta o +0,28 / −0,16 rozmiaru), unoszenie `sin(2t) · 0,05`, dwoje białych oczu (promień 0,09) z źrenicami `--kontur` (0,045, przesunięte o 0,03) na 0,1 i 0,34 rozmiaru, groźne brwi (linie 0,05); sceny: **Łąka** — ziemia `monstera` na 2,05, Chmura Pracu przy lewej krawędzi pod etykietą (0,2; 1,35; rozmiar 0,95), biegnąca sowa (1,45; rozmiar 1,05), łuk 3 kołyszących się liści (od x = 2,5 co 0,55), dymek Pracu Pracu unoszący się przy prawej krawędzi; **Chmury** — sterowiec Amic (przezroczystość 0,75) przesuwający się u góry, dwie chmury, sowa podskakująca na chmurze (okres 1,4 s, 0,7 j.; w powietrzu „skok”, cień z `lift`), złoty liść; **Miasto** — trzy tory w perspektywie (trapez `kozaCien`, białe linie), nadlatujący telefon Magdy (rośnie od 0,3 do 1,0 j.), dystrybutor Amic, biegnąca sowa na środku; **Ogród** — ziemia `monsteraCiemna`, stojąca sowa, serduszko-doniczka, 3 kołyszące się liście, kózka-podwajaczka podskakująca (okres 1,6 s; odbita w poziomie); **Szklarnia** — trzy białe łuki szklarni, sowa na środku na przemian „stoi” i „radość” (co 2,2 s), tęczowy liść, podskakująca kózka-sprężynka;
- `renderGameCards({ root, platform, onGuide })` — dla każdej gry z `GAME_REGISTRY` (kolejność rejestru) `article.game-card[data-game]` (`aria-labelledby` = nazwa, zmienne biomu) z ilustracją (płótno `aria-hidden`, przystanek „N. Nazwa”, „Nowe!” dla `rebuilt`), nazwą `h3`, opisem, rekordem `[data-record]` (szkielet „…”), odnośnikiem **Graj** `a.menu-button.is-primary[data-play=<id>]` (`href` = ścieżka gry, ikona ▶), przyciskiem **Jak grać?** `[data-guide=<id>]` (`aria-label="Jak grać w <nazwa>?"`) i — gdy gra ma w rejestrze `preview` (E4–E8) — odnośnikiem **„Wypróbuj nową wersję: <nazwa>”** `a.menu-button.is-preview[data-preview=<id>]` (`href` = `preview.path`, na całą szerokość akcji, min. 48 px, tło `--niebo-gora`, 16 px); na początku `root` — `svg.menu-path-line` z jedną ścieżką; zwraca `{ cards: [{ game, card, canvas, visible }], layoutPath(), updateRecords(records, gotowe) }`; `layoutPath()` prowadzi krzywą Béziera od środka góry przez środki kart na przemian na 28% i 72% szerokości do środka dołu; `updateRecords` zdejmuje szkielet i wpisuje „★ Rekord…” albo „Jeszcze bez rekordu — zagraj pierwszy raz!”;
- `createArtState(random)` → `{ owl: createOwlAnimator(), cosmetic: "none" }` — osobna sowa na kartę (mrugają niezależnie).

### `shared/menu/guides.js` — zakładka „Jak grać”

`renderGuidesTab({ root, atlas })` — dla każdego `GUIDE_ORDER` (najpierw „Poznaj Sowi Świat”, potem 5 gier) sekcja `section.menu-guide#jak-grac-<id>` (`data-guide`, `aria-labelledby`) z tytułem `h3` i kartami `renderGuide(przewodnik, { atlas, sprites: SPRITES, headingLevel: 4 })` (tytuły kart jako `h4`); karta „Sterowanie” ma animowaną demonstrację gestu.

### `shared/menu/gallery.js` — zakładka „Galeria”

`createGalleryTab({ root, gallery: () => SowieOwlGallery, academy: () => SowieAcademy, onSound, onBackground })` → `{ render, openViewer(id, przycisk), viewer() }`:

- `render()`: przed wczytaniem galerii — „Wczytuję galerię…”; potem `refreshUnlocks()`, licznik „X / 30”, kafelki według filtra; **odblokowane** — `button.menu-tile[data-open-photo]` (`aria-label="Otwórz zdjęcie: <tytuł>"`, „(nowe)” dla nieobejrzanych, klasa `is-new` i znaczek „Nowe!”, serduszko dla ulubionego); **zablokowane** — `article.menu-tile.is-locked` (`aria-label="Zdjęcie N — zablokowane"`, rozmyta miniatura bez opisu, kłódka, tekst wymagania, `role="progressbar"` z `aria-valuenow` = `progressOf(…).share` w %); obrazki: miniatura 400 px, `srcset` 400w / 600w, `sizes="(max-width: 767px) 46vw, (max-width: 1099px) 30vw, 200px"`, `loading="lazy"`, `decoding="async"`, 400 × 300; pusta lista — „Wszystkie zdjęcia są już odblokowane!” albo „Jeszcze nic tu nie ma.”; gdy są nowe zdjęcia — raz na wizytę „hu-hu” (`onSound`);
- filtry: klik ustawia `aria-pressed` i renderuje;
- **przeglądarka** (`openViewer`): `div.menu-viewer[role=dialog][aria-modal=true]` (`aria-label="Zdjęcie: <tytuł>"`) tylko z odblokowanymi zdjęciami; najpierw miniatura 600 px, po wczytaniu pełne zdjęcie 1200 × 900 (`photoUrl`); licznik, tytuł, „Fot. <autor> · źródło: Pexels” (link w nowej karcie, `rel="noopener noreferrer"`), „Ulubione” (`setFavorite`, `aria-pressed`, „klik”) i „Tło menu” (`setBackground(id | null)`, `onBackground`); każde pokazanie — `markViewed`; przyciski poprzednie / następne ukryte przy jednym zdjęciu; **gesty** (zdarzenia wskaźnika na scenie, `setPointerCapture` w `try`): przesunięcie w bok > 60 px — następne / poprzednie (w kółko), w dół > 90 px — zamknięcie, mniejsze — powrót na miejsce; dwa palce — powiększanie 1–4× (przy 1× wyśrodkowanie); przy powiększeniu jeden palec przesuwa zdjęcie; **podwójne stuknięcie** (< 320 ms, bez ruchu) — powiększenie 2,5× w miejscu stuknięcia albo powrót do 1× (także myszką; `dblclick` tylko blokuje zaznaczanie); klawiatura: Escape zamyka, ← / → przełączają, Tab krąży w oknie (`focusableIn`); zamknięcie przebudowuje siatkę i oddaje fokus kafelkowi ostatnio oglądanego zdjęcia; `viewer().state()` → `{ index, total, scale, x, y }`.

### `shared/menu/owl-tab.js` — zakładka „Sowa”

`createOwlTab({ root, cloud, platform, academy, audio, atlas, onCosmetic })` → `{ render, drawProfileOwl, updateAudio, updateStatus(status), openRecords(gameId, przycisk), recordsOpen() }`. `render()` składa karty (każda `section.menu-card[data-owl-card]`):

1. **profil** — płótno 96 px z sową w wybranym dodatku (jednostka = bok / 1,7, sowa w (0,85; 1,55), rozmiar 1,15), „Poziom N”, „X / Y XP” z paskiem (`role="progressbar"`), „Piórka: N” (z `SowieAcademy.snapshot()`);
2. **zadania** — `taskProgress(...)`: 3 zadania dnia i zadanie tygodnia (`li[data-task]`, „X / Y” albo „Zrobione!”, pasek);
3. **garderoba** — chip dla każdego `SowiePlatform.COSMETICS` (`[data-cosmetic]`, `aria-pressed` = wybrany); zablokowane (`profil.cosmetics.unlocked` bez klucza; „Bez dodatku” zawsze odblokowany) — `disabled`, kłódka i podpowiedź `cosmeticHint` („Zbierz 20 liści monster (12 / 20)” — misja z `DEFAULT_MISSIONS` o tej nagrodzie, postęp z `profil.missions`, opisy `MISSION_LABELS` jak w `sowie-core.js`); wybór zapisuje `profil.cosmetics.selected` (po 1 s), przerysowuje sowę i woła `onCosmetic` (menu przerysowuje karty, sówka podskakuje);
4. **rekordy** — dla każdej gry nazwa, `recordText` (przed wczytaniem „…”) i przycisk „Rekordy” `[data-records]` → okno „Rekordy — <nazwa>”: gry zręcznościowe — przy grze z trybami (`GAME_REGISTRY[].modes`, od E5d2 `sowa3`) najpierw chipy trybów (`[data-mode]`, „Tryb gry”, domyślnie pierwszy — „Kampania”, potem „Nieskończony”; rekordy i top 10 z `records(gra, poziom, tryb)` / `topRuns(gra, poziom, tryb)`, nagłówek „Top 10 — <tryb>, <poziom>”), chipy Chill / Arcade / Chaos (domyślnie Arcade), „Najlepszy wynik”, „Dystans” (SowaRunner) / „Wysokość” (SowaJumper), „Rozgrywki”, „Top 10 — <poziom>” z `SowieCloud.topRuns(gra, poziom)` (odczyt `sowiegry_gry/<gra>`; „Wczytuję…”, błąd — „Nie udało się wczytać wyników…”, pusto — „Brak rozgrywek na tym poziomie…”; wiersz: wynik, dystans / wysokość, data `pl-PL`); gry idle — „Liście w całej grze”, „Wielkie Przesadzania” / „Pomieszczenia”, „Strefa” / „Odkryte hybrydy”;
5. miejsce na **kartę instalacji** (`[data-install-slot="sowa"]`);
6. **ustawienia** (`#ustawienia`, `tabindex="-1"`): suwaki „Głośność ogólna”, „Muzyka”, „Efekty dźwiękowe” (`.sowie-ui-slider`, `[data-volume]`, nieaktywne do wczytania dźwięku — `updateAudio()` włącza je bez przebudowy zakładki); przełączniki `.sowie-ui-toggle[data-setting]`: „Efekty (wstrząsy, cząsteczki)” (`reducedEffects` odwrotnie + klasa `sowie-reduced-effects`), „Wibracje” (`vibration`; dopisek „Ten telefon nie obsługuje wibracji.”, gdy brak `navigator.vibrate`), „Tryb Przytulny (wolniej, bez końca gry)” (`cozy`, dopisek „Zadziała w nowych wersjach gier.”), „Komentarze sowy” (`quips`); stan zapisu (`[data-save-state]`, długi opis); **„Wyloguj to urządzenie”** (`[data-logout]`) → okno „Wylogować to urządzenie?” („Postęp zostaje w chmurze…”) z „Anuluj” i „Wyloguj” → `SowieCloud.lock()` (wysyła kolejkę, zapomina hasło na tym urządzeniu, przeładowuje stronę — pojawia się ekran hasła).

Zapis ustawień: `updateProfile(profil.settings ← zmiany, { delayMs: 1000 })`; suwak: `setVolume` w silniku + `volumeMaster/Music/Sfx`, a suwak muzyki / efektów ustawia też `settings.music` / `settings.sfx` na „> 0” (obecne gry czytają te przełączniki).

### `shared/menu/install.js` — karta instalacji

`renderInstallCard(miejsce, { pwa = SowiePwa, nav })` → funkcja odłączająca; `isIos(nav)` — iPhone / iPod / iPad, także iPadOS (`MacIntel` z ekranem dotykowym). Gdy strona działa jako aplikacja (`standalone()`) — nic. Android / Chrome (`canPrompt()`): „Zainstaluj SowieGry na telefonie”, „Gry otworzysz jedną ikoną, na pełnym ekranie — także bez zasięgu.”, przycisk **Zainstaluj** (`[data-install-button]`, ikona pobierania) → `SowiePwa.prompt()`; zgoda chowa kartę. iPhone: instrukcja w 3 krokach (Udostępnij z ikoną → Do ekranu początkowego → Dodaj). Inne: „W menu przeglądarki wybierz Zainstaluj aplikację albo Dodaj do ekranu głównego.”. `onInstallChange` przebudowuje kartę (np. gdy przeglądarka pozwoli instalować albo po instalacji). Karta jest pod ścieżką gier i w zakładce „Sowa”; `data-install` = `android` / `ios` / `inne`.

### `shared/menu/cloud-status.js` — stan zapisu

`CLOUD_STATUS` (`haslo` — „Hasło” / kłódka, `laczenie` — „Łączę…”, `online` — „Zapisano” / chmurka z ptaszkiem, `zapisywanie` — „Zapisuję…”, `offline` — „Offline” / przekreślona chmurka + opis „Brak połączenia — postęp zostaje na telefonie i wyśle się sam…”, `blad` — „Błąd zapisu”), `cloudStatusInfo(status, tryb)` — tryb `memory` zawsze „Tryb testowy” („postęp nie trafia do chmury”), `emulator` — dopisek „(emulator)”; `cloudStatusHtml(status, tryb)` → ikona + `<span>`.

### Budżet menu (pomiar 28.09.2026, Pixel 7 w Chromium, `?cloud=memory`)

Przy starcie menu pobiera 131 plików (w tym 48 SVG postaci): **ok. 160 KB po kompresji gzip** (tak serwuje GitHub Pages; budżet < 300 KB dotrzymany), 395 KB bez kompresji; czcionki 31 KB, grafiki SVG 44 KB (21 KB gzip), moduły menu 83 KB (27 KB gzip), `sowie-cloud.js` 42 KB (12 KB gzip), `audio.json` 24 KB. Atlas postaci gotowy po ok. 0,8 s (komputer z emulacją telefonu). Poza budżetem: miniatury galerii (tylko na zakładce „Galeria”, leniwie; 30 × ok. 18 KB), muzyka menu 206 KB (dopiero po pierwszym dotknięciu i gdy muzyka jest włączona) i SDK Firebase w trybie produkcyjnym (`firebase-app.js` + `firebase-firestore.js` — ok. 200 KB gzip, pobierane w tle i trzymane przez service worker).

## Wspólna warstwa

### `shared/sowie-platform.js` — `window.SowiePlatform`

IIFE bez zapisu danych. Udostępnia (obiekt zamrożony):

- `GAME_REGISTRY` — 5 gier: `{ id, name, path, icon, kind, dailyMetric | saveVersion }`:
  - `runner` — „Sowia Ucieczka”, `SowiaUcieczka/`, 🏃, `kind: "arcade"`, `dailyMetric: "distance"`, `rebuilt: true` (znaczek „Nowe!” na karcie). Od E4f zastępuje SowaRunner (ten sam identyfikator i rekordy). W E4a–E4e wpis miał `path: "SowaRunner/"` i `preview: { path: "SowiaUcieczka/", name: "Sowia Ucieczka" }` — pole `preview` (nowa wersja w podglądzie przed podmianą: przycisk „Wypróbuj nową wersję” na karcie w menu, rozpoznanie strony podglądu przez `SowieCloud`) zostaje obsługiwane dla kolejnych przebudów;
  - `jumper` — „SowaJumper”, `SowaJumper/`, 🪶, `arcade`, `dailyMetric: "height"`, od E6a `preview: { path: "SowaWChmurach/", name: "Sowa w Chmurach" }` (nowa wersja w podglądzie — `SowaWChmurach/docs/Documentation.md`; ten sam identyfikator i rekordy);
  - `sowa3` — „Sowa3”, `Sowa3/`, 🛣️, `arcade`, `dailyMetric: "score"`, od E5a `preview: { path: "SowieTory/", name: "Sowie Tory" }` (nowa wersja w podglądzie — `SowieTory/docs/Documentation.md`; ten sam identyfikator i rekordy); od E5d2 `modes: [{ id: "kampania", label: "Kampania" }, { id: "nieskonczony", label: "Nieskończony" }]` — tryby gry z osobnymi rekordami (pierwszy — domyślny, rekordy pod samym poziomem);
  - `ogrody` — „Sowie Ogrody”, `SowieOgrody/`, 🌿, `kind: "idle"`, `saveVersion: 2`, od E7b `preview: { path: "SowieOgrody/nowa.html", name: "nowe Sowie Ogrody" }` (nowa odsłona w podglądzie w tym samym folderze — `SowieOgrody/docs/Documentation.md`, rozdział „Nowa odsłona”; zapis w polu `preview` dokumentu `ogrody`);
  - `szklarnia` — „Sowia Szklarnia”, `SowiaSzklarnia/`, 🏡, `idle`, `saveVersion: 1`;
- `COSMETICS` — 9 dodatków (`none`, `bow`, `glasses`, `flowerCrown`, `gardenerHat`, `cap`, `scarf`, `backpack`, `bubbleTrail`) z `label` i `icon`;
- `DEFAULT_SETTINGS` — `{ music: true, sfx: true, quips: true, reducedEffects: false }`;
- `DEFAULT_MISSIONS` — 7 misji `{ progress, target, done, reward }`: `leaves20` (20 → `glasses`), `extraLife` (1 → `flowerCrown`), `nearMiss3` (3 → `scarf`), `chaosFinish` (1 → `gardenerHat`), `combo4` (1 → `bubbleTrail`), `runner1000` (1000 → `cap`), `jumper250` (250 → `backpack`);
- `DEFAULT_STATS` — liczniki ogólne `{ leaves: 0, nearMisses: 0, extraLives: 0, finishes: 0, maxCombo: 1 }` (dawne statystyki dublujące rekordy gier przeszły do `profil.records`);
- `emit(type, detail)`, `on(type, listener)` — zdarzenia przez wspólny `EventTarget` (`profile:changed`, `cloud:status`, `cloud:ready`, `cloud:profile-reloaded`, `stat:recorded`, `mission:progress`, `cosmetic:*`, `game:*`, `modal:*`);
- `shouldRun(key, ms)` — ogranicznik częstotliwości; `createRng(seed)` — xorshift z ziarnem (FNV-1a); `random()`, `now()`;
- `?seed=…` podmienia `Math.random` na generator z ziarnem, `?testNow=ms` przesuwa `Date.now()` (testy i wyzwanie dnia).

Etap E1 usunął z platformy migracje, kopie `sowieGryBackup:*`, eksport i import JSON oraz odczyt/zapis profilu w pamięci przeglądarki.

### `shared/sowie-cloud.js` i `shared/password-gate.js`

Opis szczegółowy: rozdziały „SowieCloud — zapis postępu w Firestore” i „Ekran „Hasło sowy” i nakładki” poniżej.

### `shared/cute-ui.css`

Definiuje zmienne `--sowie-ink` (`#2b2733`), `--sowie-cream`, `--sowie-sky`, `--sowie-mint`, `--sowie-yellow` (`#ffd65a`), `--sowie-pink`, `--sowie-green`, `--sowie-card`, a także: pasek narzędzi (przyciski 44 × 44 px, na ekranach ≤ 520 px 38 × 38 px), modal garderoby, misji i ustawień, toasty, wskaźnik pauzy, panel debug, sekcję `.sowie-cloud-tools` w ustawieniach (odstęp 10 px, przycisk min. 48 px) oraz style ekranu hasła i nakładek SowieCloud. Pasek narzędzi jest pod HUD-em po lewej stronie, aby nie zasłaniać wyników. `prefers-reduced-motion` i klasa `sowie-reduced-effects` wyłączają animacje.

### `shared/sowie-core.js` — `window.SowieCore`

Wymaga `SowiePlatform` i `SowieCloud`. **Profil jest w `SowieCloud`** — moduł zawsze czyta bieżący obiekt przez `profile = () => SowieCloud.profile()` (po starcie chmury profil jest podmieniany).

- `getProfile()`, `settings()`, `selectedCosmetic()` (`profil.cosmetics.selected`);
- `unlockCosmetic(key, announce)` — dopisuje do `profil.cosmetics.unlocked` (`updateProfile`, zapis po 1 s), toast „Odblokowano: …”, dźwięk `unlock`; przed `SowieCloud.ready` odkładane;
- `selectCosmetic(key)` — `profil.cosmetics.selected` (zapis po 1 s), zdarzenie `profile:changed`;
- `progressMission(key, amount)` — postęp misji w `profil.missions` (zapis odroczony do 30 s); misje `runner1000` i `jumper250` co najwyżej co 500 ms; ukończenie odblokowuje nagrodę i pokazuje toast „Misja ukończona”;
- `recordStat(key, value, mode)` — tylko klucze z `DEFAULT_STATS`: `"add"` → `SowieCloud.increment("stats.<klucz>", n)` (sumuje się z wielu urządzeń), `"max"` → zapis tylko przy poprawie; inne klucze (np. dawne `runnerDistance`) są pomijane;
- dźwięk: `play(name)` (piski oscylatora, odstęp min. 90 ms na dźwięk), `startMusic(theme)` / `stopMusic()` (8 nut co 430 ms), `tone(...)`;
- `toast`, `maybeQuip` (co najmniej 6,5 s odstępu), `setDebugData` (`?debug=1`), `drawCanvasCosmetic(context, x, y, scale, rotation, key)`;
- `registerGame(adapter)` — adapter pauzy (`getPaused`, `setPaused`), motyw muzyczny (`musicTheme`) i od E2d opcjonalnie `isPlaying()` (trwa rozgrywka); gdy adapter ma `isPlaying`, na `<html>` pojawia się klasa `sowie-arcade` (gry zręcznościowe); pasek narzędzi ⏸ 🎀 ⭐ ⚙ (`aria-label`: „Pauza”, „Garderoba”, „Misje”, „Ustawienia”);
- `isPlaying()` (E2d) — `adapter.isPlaying() && !adapter.getPaused()`; używa go menedżer komunikatów;
- `openModal(tab)`, `closeModal()` — modal z pułapką fokusu, Escape, `inert` na tle;
- okno **Ustawienia**: przełączniki Muzyka / Efekty dźwiękowe / Komentarze sowy / Ograniczone efekty (`updateProfile`, zapis po 1 s), sekcja „Zapis postępu: <stan>” (`[data-cloud-status]`, aktualizowana przez `SowieCloud.onStatus`; etykiety: czeka na hasło, łączenie…, zapisano w chmurze ☁️, tryb offline — postęp nie jest zapisywany, zapisywanie…, błąd zapisu — spróbujemy ponownie; w trybie `?cloud=memory` — „tryb testowy (pamięć)”) i przycisk **„Wyloguj to urządzenie”** (`SowieCloud.lock()`). Eksport i import zapisu zostały usunięte;
- po `SowieCloud.ready` i przy ponownym wczytaniu profilu: klasa `sowie-reduced-effects`, zdarzenie `profile:changed`, start/stop muzyki zgodnie z ustawieniem. Zapis przy zejściu do tła wykonuje `SowieCloud` (`visibilitychange → flush`).

### `shared/notification-manager.js` — `window.SowieNotifications`

Przejmuje `SowieCore.toast`: łączy powtórzenia w ciągu 1,8 s („×2 — łącznie +75”), kolejka max 5 (ważne — misje — na początku). Poza rozgrywką widać do **2** komunikatów przy dolnej krawędzi (`bottom: max(8vh, safe-area + 14px)`, szerokość `min(82vw, 360px)`). **Od E2d w trakcie gry (`SowieCore.isPlaying()`) widać najwyżej 1 komunikat**, a nadmiar czeka w kolejce (starsze ustępują przy nowym komunikacie). W grach zręcznościowych (klasa `sowie-arcade`) stos jest **u góry**, pod paskiem narzędzi — `top: max(126px, safe-area + 116px)` (≤ 520 px szerokości: `max(112px, safe-area + 104px)`, telefon poziomo — `max-height: 500px` i szerokość ≥ 600 px: `max(72px, safe-area + 62px)`, w rzędzie paska narzędzi), szerokość `min(64vw, 300px)` (w poziomie `min(40vw, 300px)`), mniejszy komunikat (13 px, margines 6 × 10 px) — sowa i tor przy dolnej krawędzi zostają odsłonięte (zgłoszenie właściciela: komunikaty zasłaniały sowę). `getState()` → `{ visible, queued }`.

### `shared/sowie-academy.js` — `window.SowieAcademy`

Stan (XP, piórka, metryki, misje dzienne i tygodniowe, nagrody) jest w `profil.academy`. Moduł trzyma kopię roboczą: po `SowieCloud.ready` (i `onProfileReload`) wczytuje ją z profilu, uzupełnia okresy (`ensurePeriods`) i ocenia misje. `save()` przycina nagrody dzienne `daily:*` i `feature:*` starsze niż 30 dni (`SowieCloud.helpers.trimAwards`; `weekly:*`, `trait:*`, `gallery:*` zostają) i zapisuje kopię przez `updateProfile` (zapis odroczony, tylko zmienione pola). `record()` i `award()` wywołane przed startem chmury są odkładane. Misje dzienne: 3 z puli 12, wybierane deterministycznie z daty (UTC); tygodniowa: zagraj w 3 różne gry. Nagrody: 50 XP + 5 piórek (dzienna), 140 XP + 15 piórek (tygodniowa). Poziom: 100 XP na 1. poziom, każdy kolejny +35 XP.

### `shared/owl-gallery.js` — `window.SowieOwlGallery`

30 fotografii z `Obrazki/` (`id`, `file`, tytuł, opis `alt`, autor, link Pexels, tekst wymagania `requirement` i **cele `goals`**). Od E3 warunki odblokowania są danymi: `goals` to lista `[źródło, próg]`, gdzie źródło to `level` (poziom Akademii), `feathers` (piórka) albo nazwa metryki Akademii (np. `runnerDistance`, `ogrodyBuys`, `szklarniaRooms`, `runnerVisits`); zdjęcie odblokowuje się, gdy wszystkie cele są osiągnięte (`owl-01` ma pustą listę — prezent powitalny). Stan (`unlocked`, `viewed`, `favorite`, od E3 `background`) jest w `profil.gallery`; wczytywany po `SowieCloud.ready`, zapisywany przez `updateProfile`. Przed wczytaniem `refreshUnlocks()` nic nie robi (nie nadpisze stanu z chmury). Nowe odblokowania pokazują toast „Nowa fotografia w Galerii Sów!” (nagroda: w menu „Zobacz w zakładce Galeria”, w grach „Otwórz Galerię przyciskiem 🖼️”), obejrzenie wszystkich 30 daje nagrodę Akademii `gallery:complete`. W grach galeria otwiera się oknem (przycisk w doku, `owl-gallery.css`); w menu głównym ma własną zakładkę (`shared/menu/gallery.js`) — `attachButton()` nic nie dokleja, gdy strona ma `[data-sowie-menu]` albo — od E4, przebudowane gry — `[data-sowie-game]` (tak samo przycisk 🎓 w `sowie-academy.js`; zadania Akademii są w zakładce „Sowa” i na ekranie wyników gier).

API (`window.SowieOwlGallery`): `PHOTOS`, `open()`, `close()`, `refreshUnlocks()`, `snapshot()`, `progressOf(zdjęcie | id, migawkaAkademii)` → `{ share (0–1, średnia z celów), goals: [{ source, target, value (obcięta do progu), done }], done }` (do paska postępu zablokowanego zdjęcia), `markViewed(id)`, `setFavorite(id)` (jedno ulubione; ponowny wybór zdejmuje), `setBackground(id | null)` (tło menu — tylko odblokowane), `photoUrl(zdjęcie)` (pełne 1200 × 900), `thumbUrl(zdjęcie, 400 | 600)` (miniatura WebP), `isLoaded()`. Siatka w oknie galerii (gry) używa miniatur: `src` 400 px, `srcset` 400w/600w, `sizes="(max-width: 700px) 45vw, 220px"`, `loading="lazy"`, `decoding="async"`.

**Miniatury** (`assets/gallery-thumbs/<plik>-400.webp` i `-600.webp`, 60 plików): `node scripts/make-thumbs.cjs` — Chromium z Playwright rysuje każde zdjęcie na płótnie 400 × 300 (jakość WebP 0,78) i 600 × 450 (0,72) z `imageSmoothingQuality = "high"`; razem ok. 554 KB (400 px) i ok. 976 KB (600 px, dla ekranów 3×) zamiast 4,7 MB pełnych zdjęć.

### `shared/gameplay-expansion.js`

Mechaniki dodatkowe per obecna gra (precyzyjne lądowania w Jumperze, combo w Sowa3, kontrakty w Ogrodach, cele laboratorium i album cech w Szklarni) oraz wyzwanie dnia (`?daily=1&seed=daily-RRRR-MM-DD-gra`). Zmiany E1:

- stan gier idle czyta przez `window.SowieIdleGame.snapshot()` (po `SowieIdleGame.ready`), a nie z pamięci przeglądarki;
- stan dnia kontraktów `{ date, baseline, claimed }` jest w dokumencie gry `sowiegry_gry/{gra}.daily` (`SowieCloud.game` / `updateGame`); dane z poprzedniego dnia są zastępowane;
- album cech Szklarni: `sowiegry_gry/szklarnia.traitAlbum` (tablica kluczy `wzrost|zapach`);
- rekord wyzwania dnia zapisuje gra przez `SowieCloud.submitRun()` (`dailyBest` w dokumencie gry); moduł nie zapisuje go sam;
- od E4f bez części SowaRunner (dawny panel „Serie i wyzwanie dnia SowaRunner” i seria liści): Sowia Ucieczka nie ładuje tego skryptu — ma własne zadania biegu, serię liści (metryka Akademii `runnerLeafChain` z SowieProgress) i wyzwanie dnia; `shared/game-guides.js` też nie rozpoznaje już folderu `SowaRunner/`.

### `shared/records.js` — okno „🏆 Rekordy” (`window.SowieRecords`)

Ładowane w każdej grze po `game-guides.js` (potrzebuje doku `SowieGameGuides.getDock()`). Gra bieżącej strony: `SowieCloud.gameId()`; bez niej moduł nic nie robi. Dodaje do doku przycisk 🏆 (`.sowie-tool-button`, `data-records-fab`, `aria-label="Otwórz rekordy"`), który otwiera modal `.sowie-modal-backdrop.sowie-records-backdrop` z kartą `role="dialog"` i nagłówkiem „🏆 Rekordy — <nazwa gry>”:

- **gry zręcznościowe:** przyciski poziomów Chill / Arcade / Chaos (`data-records-difficulty`, `aria-pressed`; startowo poziom wybrany w grze — Runner: `RUNNER_LEVEL_IDS[level]`, Jumper i Sowa3: `state.difficultyKey`), kafelki „Najlepszy wynik” (`[data-records-best]`), „Dystans” (Runner) lub „Wysokość” (Jumper) i „Rozgrywki (wszystkie poziomy)” z `SowieCloud.records`; „Top 10 — <poziom>” z `SowieCloud.game(id).top10[poziom]` (wynik, dystans/wysokość, data `pl-PL`) albo „Brak rozgrywek na tym poziomie…”; „Ostatnie gry” — `SowieCloud.history(id, 10)` wczytywane asynchronicznie („Wczytuję…”, przy błędzie „Nie udało się wczytać ostatnich gier.”), z poziomem i oznaczeniem „wyzwanie dnia”; „Wyzwanie dnia” — 7 najnowszych wpisów `dailyBest` (jednostka „m” dla dystansu/wysokości, „pkt” dla wyniku);
- **gry idle:** podsumowanie z `profil.records` — Ogrody: liście w całej grze, Wielkie Przesadzania, strefa; Szklarnia: liście w całej grze, pomieszczenia, odkryte hybrydy;
- przed `SowieCloud.ready` — „Wczytuję rekordy…”; liczby formatowane `toLocaleString("pl-PL")`, teksty z bazy przepuszczane przez `escapeHtml`;
- zamykanie: „Zamknij”, Escape, kliknięcie tła; fokus wraca do przycisku 🏆.

Style (`shared/game-enhancements.css`): `.sowie-records-tabs` (flex, odstęp 8 px, przyciski min. 44 px, wybrany poziom tło `#f0e5ff`), `.sowie-records-list` (daty w kolorze `#6b5a78`, 0,9 em); kafelki jak w Akademii (`.sowie-academy-grid`, `.sowie-academy-stat`).

### `shared/sowie-runtime.js`

Ustawia pionowy układ paska narzędzi i kolumny HUD (4 kolumny na ekranach ≤ 700 px) oraz synchronizuje klasę `sowie-reduced-effects` z preferencją systemu i ustawieniem profilu.

### `shared/sowie-smoke-hook.js`

Gdy gra działa w ramce `tests/smoke.html`, przesyła do rodzica (`postMessage`): błędy JavaScript, nieobsłużone odrzucenia Promise i informację o załadowaniu gry.

## Sowi Silnik (`shared/engine/`) — etap E2a

Moduły ES (`<script type="module">`, bez etapu budowania) dla przebudowanych gier i „Sowiego Laboratorium” (Analiza 2, rozdz. 2.5–2.6). `shared/engine/package.json` zawiera `{ "type": "module" }`, żeby Node (testy jednostkowe, `node --check`) traktował pliki jako moduły; przeglądarka go ignoruje. `index.js` eksportuje wszystko.

### `rng.js`

- `hashSeed(value)` — FNV-1a (start `2166136261`, mnożnik `16777619`, wynik `>>> 0`, zero → 1);
- `createRng(seed)` — xorshift32 (`<<13`, `>>>17`, `<<5`), **ten sam algorytm co `SowiePlatform.createRng`**, więc `?seed=` i wyzwanie dnia dają identyczny układ; metody `next()` [0, 1), `range(min, max)`, `int(min, max)` (włącznie), `chance(p)`, `pick(lista)`, `shuffle(lista)` (Fisher–Yates), `getState()`, `setState(n)`.

### `loop.js`

`STEP = 1/120` s. `createLoop({ update, render, step, maxFrame = 0.25, maxSteps = 12, raf, caf })`:

- każda klatka: `delta` = czas od poprzedniej (max 0,25 s — po powrocie karty nie ma skoku), akumulator; `update(STEP)` tyle razy, ile mieści się kroków (max 12 — przy przekroczeniu zaległy czas jest gubiony, bez „spirali śmierci”); `render(alpha)` z `alpha = akumulator / STEP` do interpolacji;
- `pause()` zatrzymuje symulację (rysowanie trwa, `alpha = 0`), `resume()` zeruje akumulator;
- `fps()` — średnia wykładnicza (0,9 / 0,1); `setRenderRate(30)` rysuje co drugą klatkę („Oszczędzanie baterii”), `setRenderRate(60)` — każdą;
- `onFrame(listener)` — `{ delta, fps, steps }` po każdej klatce (monitor płynności); `tick(time)` — jedna klatka (testy).

### `pool.js`, `collide.js`, `tween.js`, `particles.js`

- `createPool(factory, reset, { size })` — `acquire()`, `release(obj)` (zamiana z ostatnim, indeks w `obj.poolIndex`), `forEachActive(fn)` (od końca — można zwalniać w trakcie), `releaseAll()`, `activeCount()`, `freeCount()`;
- kolizje: `aabb(a, b)`, `circles(ax, ay, ar, bx, by, br)`, `circleRect(cx, cy, r, rect)`, `hitbox(box, factor = 0.8, out)` — pole kolizji 80% wokół środka (gra wybaczająca), `landsOn(poprzedniSpód, obecnySpód, platforma, lewo, prawo)` — lądowanie tylko z góry;
- `ease` (linear, quadIn/Out/InOut, cubicOut, sineInOut, backOut, elasticOut) i `createTweens()` — `to(cel, pola, czas, { easing, delay, onDone })`, `cancel`, `cancelFor(cel)`, `update(dt)`;
- `createParticles({ max = 300, random })` — dane w `Float32Array` (bez alokacji), `emit(x, y, { count, speed, spread, angle, lifetime, radius, fall, tint })`, `update(dt)` (grawitacja, usuwanie przez zamianę z ostatnim), `render(ctx)` (koła, przezroczystość = pozostałe życie), `setDensity(0–1)` (ograniczone efekty / oszczędzanie baterii).

### `view.js` i `camera.js` — świat w jednostkach logicznych

- `computeLayout({ cssWidth, cssHeight, minWorld, dpr, maxDpr = 2, lockedScale, tolerance = 0.15 })` — skala = `min(szerokość / minWorld.width, wysokość / minWorld.height)`, więc zawsze widać co najmniej `minWorld` (np. 9 × 16 jednostek); rozdzielczość płótna = CSS × min(DPR, 2). Z `lockedScale` skala się nie zmienia (np. chowanie paska adresu), chyba że widoczny świat skurczyłby się o ponad 15% (obrót telefonu);
- `worldToScreen` / `screenToWorld` (kamera wskazuje punkt świata na środku ekranu, z `zoom` i wstrząsem);
- `createView({ canvas, minWorld, maxDpr, getSize, getDpr })` — `resize()`, `layout()`, `apply(ctx, kamera)` (dalej rysujemy w jednostkach świata), `applyScreen(ctx)` (piksele CSS), `lockScale(true)` na czas rozgrywki, `onResize`;
- `createCamera({ x, y, zoom })` — `follow(x, y, dt, sztywność = 8)` (wykładniczo, niezależnie od liczby klatek), `clamp(granice)`, `shake(0–1)` i `update(dt, { reducedMotion })` — wstrząs z „traumy” (`trauma²·0,35`), zerowy przy ograniczeniu ruchu.

### `input.js` — gesty w dowolnym miejscu planszy

`DEFAULTS`: przytrzymanie po 180 ms, tolerancja ruchu 12 px, swipe ≥ 24 px w ≤ 200 ms, martwe strefy: lewo 18 px, prawo 18 px, dół 20 px (+ bezpieczny obszar dolny).

- `inDeadZone(x, y, szer, wys, strefy, dółBezpieczny)`, `swipeDirection(dx, dy)` (dominująca oś);
- `createGestureRecognizer({ width, height, onGesture, … })` — jeden aktywny wskaźnik; zdarzenia: `press` (od razu po dotknięciu), `tap`, `holdstart`/`holdend`, `swipe` (`direction`: up/down/left/right), `dragstart`/`drag`/`dragend` (powolny ruch albo ruch po przytrzymaniu), `release`, `ignored` (dotknięcie w martwej strefie — np. systemowy gest „cofnij” od krawędzi ekranu nie działa w grze); `update(czas)` wykrywa przytrzymanie; drugi palec jest ignorowany;
- `KEY_MAP` — Spacja/↑/W = akcja (`press`/`release`), ↓/S, ←/A, →/D = `swipe` w danym kierunku, P = `pause`, Esc = `menu`;
- `bindInput(element, onGesture, opcje)` — zdarzenia wskaźnika (`pointerdown/move/up/cancel`, przechwycenie wskaźnika `setPointerCapture` w `try/catch` — dla nieaktywnego albo syntetycznego wskaźnika przeglądarka rzuca wyjątek, a gest działa i bez przechwycenia), zegar co 30 ms do wykrywania przytrzymania, blokada menu kontekstowego, klawiatura (poza polami formularzy); zwraca `{ recognizer, isKeyDown(akcja), unbind() }`. Od E4 dotknięcie elementu `INTERACTIVE` (`button, a[href], input, select, textarea, label, [data-no-gesture]`) nie jest gestem — przechwycenie wskaźnika przez planszę zabierałoby przyciskom na planszy (HUD, ekran tytułowy) zdarzenie `click`.

### `scene.js`, `safe-area.js`

- `createScenes({ transition = 0.25 })` — `add(nazwa, { enter, exit, update, render, gesture })`, `go(nazwa, parametry)` (ściemnienie: połowa czasu → zmiana sceny → rozjaśnienie), `fade()` (0–1 do rysowania zasłony), `current()`;
- `measureSafeAreas()` — bezpieczne obszary (wycięcie, Dynamic Island, pasek domowy) w pikselach: ukryty element z `padding: env(safe-area-inset-*)` i `getComputedStyle` (zmiennych `env()` nie da się odczytać wprost).

### `shell.js` i `shell.css` — powłoka telefonu

- `createPerfMonitor({ threshold = 45, windowSeconds = 5, onSlow })` — gdy przez 5 s gra działa poniżej 45 kl./s, wywołuje `onSlow` raz (do `reset()`);
- `createPauseController({ loop, countdownFrom = 3, tickMs = 1000, schedule, cancel, onChange })` — stany `running` → `paused` → `countdown` (3, 2, 1) → `running`; przerwy liczą się tylko w aktywnej rozgrywce (`setActive(true)`); kolejna przerwa w trakcie odliczania je anuluje;
- `createShell({ stage, loop, onBatterySaver, overlay = true, strings })`:
  - auto-pauza: `visibilitychange → hidden` i `pagehide` (inna aplikacja, blokada ekranu), `blur` (powiadomienie, połączenie), zmiana orientacji (`matchMedia("(orientation: portrait)")`);
  - okno pauzy `.sowie-pause-overlay` (`role="dialog"`, `aria-label="Pauza"`): tytuł „Pauza”, powód (tło: „Witaj z powrotem 🦉”, fokus: „Gra czeka na Ciebie”, obrót: „Ekran się obrócił”, gracz: „Odpocznij chwilę”), przycisk „Graj dalej” (52 px, przy dolnej krawędzi); potem wielkie cyfry odliczania `.sowie-countdown` (animacja `sowieCountdownPop`, wyłączona przy ograniczeniu ruchu);
  - monitor płynności → pasek `.sowie-slow-banner` „Gra trochę zwalnia. Włączyć tryb „Oszczędzanie baterii”?” [Włącz] [Nie teraz];
  - `setBatterySaver(on)` — `loop.setRenderRate(30 | 60)`, wywołanie `onBatterySaver` (np. mniej cząsteczek) i zapis `profil.settings.batterySaver` przez `SowieCloud.updateProfile` (po 1 s); po `SowieCloud.ready` odczyt zapisanego ustawienia;
  - blokada `gesturestart` (szczypanie na iOS) i `dblclick` na planszy;
- `shell.css`: `html.sowie-shell` (bez przewijania, `overscroll-behavior: none` — bez „pociągnij, aby odświeżyć”), `.sowie-stage` (`position: fixed`, `height: 100dvh`, `touch-action: none`, `user-select: none`, `-webkit-touch-callout: none`), przyciski i linki `touch-action: manipulation`, style okna pauzy (karta `#fff6e3`, zaokrąglenie 24 px), odliczania (biały, `min(40vw, 180px)`, cień `#3b2f4a`) i paska oszczędzania.

### `assets.js` i `sprites.js` — atlas grafik (E2b)

Grafiki postaci powstają w SVG (`assets/svg/`), a przy starcie są rasteryzowane do atlasu w rozdzielczości urządzenia. W trakcie gry każda postać to jedno `drawImage` z wycinka atlasu.

`assets.js`:

- `loadText(url, { fetchImpl })` — pobiera plik tekstowy raz na sesję strony (pamięć `Map`, po błędzie wpis jest usuwany);
- `viewBoxOf(svg)` — `[x, y, szerokość, wysokość]` z atrybutu `viewBox` głównego `<svg>` (błąd, gdy go brak lub jest niepoprawny);
- `sizeSvg(svg, width, height)` — usuwa `width`/`height` z głównego `<svg>` i wstawia zaokrąglone nowe (`<svg width="…" height="…" …>`); dzięki temu przeglądarka rysuje wektor ostro w docelowym rozmiarze (Safari skalowałby już zrasteryzowany obrazek);
- `svgToImage(svg, width, height, { createImage })` — `Blob` (`image/svg+xml`) → `URL.createObjectURL` → `Image` (`decoding = "async"`, `await image.decode()` albo `onload`), adres zwalniany w `finally`;
- `loadFonts(opisy = ['500 16px "Fredoka"', '700 16px "Fredoka"'], { timeoutMs = 3000, fonts })` — `document.fonts.load(opis, "AaĄąŻż0123")` dla każdej odmiany; po 3 s albo przy błędzie zwraca `false` (napisy rysują się wtedy czcionką zapasową).

`sprites.js`:

- `packShelves(items, { maxSize = 2048, padding = 2 })` — czysta funkcja: prostokąty `{ name, w, h }` (piksele, zaokrąglane w górę) sortowane od najwyższych (potem najszerszych, potem po nazwie) i układane w półkach od lewej; gdy wiersz się nie mieści — nowa półka, gdy półka nie mieści się w wysokości — nowa strona; wynik `{ pages: [{ width, height }], placements: { nazwa: { page, x, y, w, h } } }` (strony przycięte do zajętego obszaru + margines); grafika większa niż strona → błąd „nie mieści się na stronie”;
- `cellSize(sprite, ppu)` — rozmiar komórki `ceil(size × ppu)` (min. 1 px);
- `svgFiles(catalog)` — lista plików SVG użytych w katalogu, bez powtórzeń;
- `createAtlas({ catalog, baseUrl, maxSize, padding, createCanvas, fontFor, load, rasterize, fonts })`:
  - `catalog` — `{ nazwa: { box: [szer, wys] (jednostki SVG), size: [szer, wys] (jednostki świata), anchor: [ax, ay] (0–1), layers: [...] } }`; warstwa SVG: `{ svg, dx, dy, rotate (stopnie), pivot: [x, y], scale, alpha }` (przekształcenia w jednostkach pudełka: przesunięcie, potem obrót i skala wokół `pivot`); warstwa napisu: `{ text, x, y, size, weight = 700, color, align = "center", maxWidth, stroke, strokeWidth }` (linia bazowa `middle`);
  - `build(ppu)` — czeka na czcionki, wczytuje wszystkie pliki SVG, układa komórki `packShelves`, rasteryzuje każdy plik raz na rozmiar (pamięć `plik@szer×wys`), a potem dla każdej grafiki: przycięcie do komórki, skala `komórka / box`, warstwy po kolei (`drawImage` obrazka w rozmiarze jego `viewBox` albo `fillText`/`strokeText` czcionką `fontFor(size, weight)` = `"<waga> <rozmiar>px "Fredoka", system-ui, sans-serif"`); kolejne wywołanie unieważnia wcześniejszą, niedokończoną budowę; zwraca `true` po podmianie stron;
  - `ensure(ppu, tolerance = 0.15)` — buduje tylko przy pierwszym razie albo zmianie gęstości o ponad 15% (np. obrót tabletu); w przeciwnym razie `false`;
  - `ready()`, `pixelsPerUnit()`, `has(nazwa)`, `names()`, `pages()` (płótna stron), `sprite(nazwa)`, `frame(nazwa)` (wycinek);
  - `draw(ctx, nazwa, x, y, { width, height, anchor, scaleX, scaleY, rotation, alpha, flipX })` — rysuje w bieżących jednostkach kontekstu (zwykle świata); `(x, y)` to punkt kotwicy; domyślny rozmiar = `size` z katalogu (sama `width` zachowuje proporcje); bez obrotu, skali i przezroczystości — jedno `drawImage(strona, sx, sy, sw, sh, x − w·ax, y − h·ay, w, h)`, w pozostałych przypadkach `save → translate → rotate → scale → drawImage → restore`; nieznana nazwa → `false`;
  - gęstość `ppu` = piksele urządzenia na jednostkę świata (`skala widoku × DPR`, DPR max 2), więc grafika w grze trafia na ekran 1:1;
- `drawShadow(ctx, x, y, szerokość, { lift = 0, color = "#3b2f4a", alpha = 0.18 })` — miękki cień-elipsa (promienie `szerokość/2` i `szerokość/8`); `lift` 0–1 (wysokość nad ziemią) zmniejsza cień do 40% i rozjaśnia do połowy.

`shared/engine/index.js` eksportuje także `assets.js`, `sprites.js` i `audio.js`.

### `audio.js` — dźwięk (E2c)

Web Audio z trzema szynami: efekty → `sfx` → `master`, muzyka → `music` → `duck` (ściszanie) → `master` → wyjście.

- stałe: `DEFAULT_VOLUMES = { master: 80, music: 60, sfx: 80 }`, `MAX_VOICES = 16`, `PITCH_VARIATION = 0.05`;
- `volumeToGain(0–100)` — krzywa kwadratowa (`(v/100)²`, obcięcie do 0–100); `volumesFromSettings(settings)` — suwaki z profilu `volumeMaster`, `volumeMusic`, `volumeSfx` (domyślne wartości przy braku), a stare przełączniki `music: false` / `sfx: false` (obecne gry) wyciszają szynę do 0;
- `findOnset(dane, próg, limit)` — pierwsza próbka o |x| > progu; `loopPoints({ decodedOnset, onset, duration, bufferDuration })` → `{ offset, loopStart, loopEnd }` (przesunięcie = początek w buforze − początek w oryginale, obcięte do 0–0,2 s; koniec pętli nie dalej niż koniec bufora); `trimToLoop(bufor, start, próbki, createBuffer)` — jedno okrążenie pętli jako nowy bufor (`próbki` od próbki `start`, zaokrąglone, obcięte do końca bufora; kopia każdego kanału przez `getChannelData().set(subarray)`); zwraca oryginał, gdy nie ma czego przycinać (początek 0 i cała długość) albo okrążenie ma mniej niż 2 próbki;
- `decodeFingerprint(base64)` → `Int8Array`; `alignByFingerprint(dane, sampleRate, odcisk, 44100, maxLag = 0,1 s)` — znormalizowana korelacja odcisku (co druga próbka, indeksy przeskalowane przy innej częstotliwości kontekstu, np. 48 kHz) z początkiem zdekodowanego bufora; zwraca przesunięcie w sekundach. Dekodery MP3 różnie traktują opóźnienie kodera (lamejs: 1105 próbek mono, 1524 stereo), a odcisk pozwala znaleźć je dokładnie — pętle muzyki nie mają szwu;
- `variedRate(pitch, random)` — `pitch × (1 ± 5%)`;
- `createAudio({ manifest, baseUrl, createContext, fetchImpl, random, doc, nav, preloadOnUnlock })` (test: pominięty gest nie odblokowuje ani nie pobiera, zwykły odblokowuje i wczytuje tylko wskazane efekty):
  - kontekst `AudioContext` (albo `webkitAudioContext`, `latencyHint: "interactive"`) powstaje dopiero przy odblokowaniu; wcześniej `navigator.audioSession.type = "ambient"` (Safari 17+: dźwięk gry nie przerywa muzyki z innych aplikacji i respektuje przełącznik wyciszenia);
  - `unlock()` — w geście użytkownika: kontekst, cichy bufor 1 próbki (iOS), `resume()`, potem `preload(preloadOnUnlock)` (lista efektów; domyślnie — `null` — wszystkie; menu wczytuje tylko 4); zwraca `true`, gdy kontekst działa; `bindUnlock(window, { ignore })` — jednorazowo na `pointerdown`, `touchend`, `keydown` (faza przechwytywania); `ignore(zdarzenie)` → `true` pomija dany gest (menu: stuknięcie w odnośnik do gry — strona zaraz się zmieni, więc nie ma sensu zaczynać pobierania);
  - wczytywanie: `fetch` → `decodeAudioData` (także starsza wersja z wywołaniami zwrotnymi) → wyznaczenie przesunięcia (pętle — odcisk, efekty — pierwsza głośna próbka) → pamięć `sfx:nazwa` / `music:nazwa` jako `{ buffer, offset, item }`: pętle (muzyka, efekt `szybowanie`) dostają bufor z jednym okrążeniem — `trimToLoop` od `offset × częstotliwość` przez `item.samples × częstotliwość kontekstu / manifest.sampleRate` próbek (bez `samples`: `(loopEnd − offset) × częstotliwość`) — i `offset = 0`; efekty — cały bufor i `offset` z pierwszej głośnej próbki; błąd = `console.warn` i licznik `failed` (bez przerywania gry); `preload(nazwy = wszystkie efekty)`, `loaded(nazwa)`;
  - `play(nazwa, { pitch = 1, volume = 1, pan = 0, variation = true })` — cisza (i licznik `skipped`), gdy dźwięk nie jest odblokowany, szyna ma głośność 0 albo efekt nie jest jeszcze wczytany (wtedy zaczyna się wczytywanie); odstęp `minGap` między tym samym efektem; ponad `maxVoices` tego efektu albo `MAX_VOICES` łącznie — wygaszenie najstarszego głosu (30 ms); źródło: `AudioBufferSourceNode` (`playbackRate` = wariacja, `loop = true` dla efektów `loop` — bufor to jedno okrążenie, więc bez `loopStart`/`loopEnd`) → wzmocnienie `volume × głośność z manifestu` → opcjonalny `StereoPanner` → szyna; start `start(teraz, offset)` od przesunięcia (bez ciszy dekodera), a przy `offset = 0` — `start(teraz)`; zwraca `{ stop(fade), rate }`; nieznana nazwa → błąd;
  - `playMusic(nazwa, { fade = 0.8 })` — muzyka wczytywana przy pierwszym użyciu, pętla całego bufora z jednym okrążeniem (`loop = true`, bez punktów pętli i bez przesunięcia startu — najprostsza, jednakowa we wszystkich przeglądarkach ścieżka Web Audio; wcześniej `loopStart`/`loopEnd` i start z przesunięciem, przy których w WebKit w CI strona gry zawieszała się tuż po starcie muzyki), narastanie do głośności z manifestu i wygaszenie poprzedniego utworu (przenikanie); `stopMusic({ fade = 0.6 })`, `currentMusic()`;
  - `duck(0.35, { attack = 0.25 })` / `unduck({ release = 0.6 })` — ściszenie muzyki (np. na czas pieśni humbaka);
  - `setVolume(szyna, 0–100)` (zaokrąglenie, płynna zmiana 50 ms), `volume(szyna)`, `applySettings(settings)` (suwaki, przełączniki, `vibration`), `setVibration(bool)`, `vibrate(wzór)` (tylko gdy włączone i jest `navigator.vibrate` — Android), `canVibrate()`;
  - przejście strony w tło → `context.suspend()`, powrót → `resume()` (gdy odblokowany);
  - `state()` → `{ unlocked, context (stan albo "brak"), session, loaded, voices, music, ducked, volumes, vibration }`, `stats()` → `{ played, skipped, failed }`, `onChange(listener)`, `context()`;
- `connectAudioSettings(audio, cloud = window.SowieCloud)` — po `cloud.ready` i przy przeładowaniu profilu stosuje `profil.settings`; zwraca `save(zmiany)` = `cloud.updateProfile(p => Object.assign(p.settings, zmiany), { delayMs: 1000 })`.

## Sowi Świat (`shared/world/`, `assets/svg/`, `assets/fonts/`) — etap E2b

Biblia wyglądu wspólna dla wszystkich przebudowanych gier (Analiza 2, rozdz. 2.2–2.3). Moduły ES (`shared/world/package.json` z `"type": "module"`), `shared/world/index.js` eksportuje `tokens.js`, `owl.js` i `catalog.js`.

### Tokeny (`tokens.css` i `tokens.js`)

Te same kolory w CSS (`:root`, nazwy z myślnikami) i JS (`COLORS`, nazwy camelCase; `cssName("nieboGora")` → `--niebo-gora`). Test jednostkowy pilnuje zgodności obu list.

| Token                                                           | Kolor                                         | Użycie                                                                              |
| --------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| `--niebo-gora` / `--niebo-dol`                                  | `#bfe9ff` / `#fff6e3`                         | tła                                                                                 |
| `--monstera` / `--monstera-ciemna` / `--monstera-jasna`         | `#3fae6a` / `#2e8b57` / `#8fdcaa`             | liście, sukces, nerwy i odblaski liści                                              |
| `--zloto` / `--zloto-ciemne`                                    | `#f4c542` / `#d99a1e`                         | złote liście, rekordy, słomkowy kapelusz                                            |
| `--policzki`                                                    | `#ff9fb2`                                     | policzki postaci                                                                    |
| `--kontur`                                                      | `#3b2f4a`                                     | kontury i tekst (nigdy czysta czerń)                                                |
| `--pracu`                                                       | `#e8465a`                                     | Pracu Pracu, zagrożenie                                                             |
| `--amic-zielony` / `--amic-czerwony`                            | `#2fa84f` / `#d9303e`                         | Amic                                                                                |
| `--woda` / `--woda-ciemna` / `--woda-jasna`                     | `#5cc8e8` / `#3a86b8` / `#dff5fb`             | woda, humbak, bąbelki, szyby                                                        |
| `--sowa` / `--sowa-ciemna` / `--sowa-twarz` / `--sowa-brzuszek` | `#b07a52` / `#8a5a3b` / `#e2b98f` / `#f3e3c8` | Sówka (tułów, skrzydła i uszka, tarcza twarzy, brzuszek); ziemia w doniczce, drewno |
| `--dziobek`                                                     | `#f59e3b`                                     | dziobek i stopy                                                                     |
| `--bialy`                                                       | `#ffffff`                                     | białka oczu, odblaski, papier                                                       |
| `--pomaranczowy`, `--fiolet`, `--niebieski`, `--serce`          | `#ff9d4d`, `#9b6ddb`, `#4d9de0`, `#ff6f91`    | chustki kózek, garderoba, serduszko                                                 |
| `--koza` / `--koza-cien` / `--rogi`                             | `#fffaf2` / `#eadcc6` / `#c9a47e`             | kózki                                                                               |
| `--szary` / `--szary-ciemny`                                    | `#c9c3d3` / `#7d7590`                         | metal, koła, utracone życie                                                         |
| `--doniczka`                                                    | `#e57a5c`                                     | brzeg ziemi w doniczce                                                              |

Poza kolorami: `--kontur-grubosc: 3px`, `--czcionka-sowia: "Fredoka", system-ui, -apple-system, "Segoe UI", sans-serif`, `--czcionka-tekst: 500`, `--czcionka-pogrubiona: 700`. W JS: `OUTLINE = 4` (grubość konturu w pliku 128 × 128 ≈ 3 px przy sowie wysokiej na 96 px), `FONT_FAMILY`, `FONT_WEIGHTS = { tekst: 500, pogrubiony: 700 }`, `font(rozmiar, waga = 700)` → napis do `ctx.font`.

### Czcionka Fredoka (`assets/fonts/`)

Fredoka z Google Fonts **nie ma gotowych polskich liter** z ogonkami i kreskami (ą ć ę ń ś ź ż i wielkie; ma tylko ł, ó), ma natomiast znaki łączące (U+0301, U+0307, U+0328 i ich wersje `.case` dla wielkich liter) z kotwicami GPOS. `scripts/make-fonts.py` (Python + `fonttools`, `brotli`; licencja SIL OFL 1.1 bez zastrzeżonej nazwy pozwala na modyfikację):

1. z czcionki zmiennej `Fredoka[wdth,wght].ttf` (repozytorium google/fonts) tworzy statyczne odmiany **500** i **700** przy szerokości 100 (`instantiateVariableFont`, nazwy „Fredoka Medium” / „Fredoka Bold”);
2. dokłada 14 liter jako glify złożone: litera bazowa (flagi `ROUND_XY_TO_GRID | USE_MY_METRICS`) + znak łączący w miejscu wyliczonym z kotwic mark-to-base (`kotwica bazy − kotwica znaku`), szerokość jak litera bazowa, wpis w `cmap`: `aogonek, cacute, eogonek, nacute, sacute, zacute, zdotaccent` (`uni0328`, `acutecomb`, `uni0307`) i wielkie `Aogonek, Eogonek` (`uni0328`), `Cacute, Nacute, Sacute, Zacute` (`acutecomb.case`), `Zdotaccent` (`uni0307.case`);
3. zostawia tylko potrzebne znaki (ASCII, Latin-1, polskie litery, Łł, – — ‘ ’ ‚ “ ” „ • … € −) i funkcje `kern, liga, mark, mkmk, ccmp`, zapisuje WOFF2: `fredoka-500.woff2` (~15 KB), `fredoka-700.woff2` (~15 KB).

`tokens.css` deklaruje `@font-face` „Fredoka” 500 i 700 (`font-display: swap`, ścieżki `../../assets/fonts/…`). Licencja: `assets/fonts/OFL.txt`.

### Zasady plików SVG (`assets/svg/`)

- główny element dokładnie `<svg xmlns="http://www.w3.org/2000/svg" viewBox="…" width="…" height="…">`; postacie w pudełku **128 × 128** (humbak, cysterna, sterowiec 256 × 128; znak z cenami 128 × 256; bąbelek 32 × 32);
- kolory **wyłącznie z palety** tokenów, bez czystej czerni; kontur `#3b2f4a`, zwykle `stroke-width="4"` (detale 2–3,5), `stroke-linejoin="round"`, `stroke-linecap="round"`; zaokrąglone kształty, odblaski białe;
- bez `<text>`, `<image>`, `<script>`, `<style>`, `<foreignObject>` i adresów zewnętrznych — napisy (np. „Pracu pracu!”, „Amic”, ceny) dokłada atlas czcionką Fredoka (obrazek SVG nie widzi czcionek strony); dozwolone `<defs>`, `<use href="#…">`, `<clipPath>`, `<linearGradient>` (identyfikatory są lokalne dla pliku);
- komentarz na początku pliku opisuje grafikę po polsku.

Pliki (wszystkie w repozytorium; opis wyglądu):

| Plik                                                                                                                                                                                                | Wygląd                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sowa/cialo.svg`                                                                                                                                                                                    | tułów: uszka `--sowa-ciemna` (trójkąty), owal `--sowa` 84 × 92, brzuszek `--sowa-brzuszek` z trzema „v” piórek, tarcza twarzy `--sowa-twarz` (dwa połączone koła), policzki `--policzki` (44, 79) i (84, 79), dziobek `--dziobek` (57–71, 66–80)                                                                                                                              |
| `sowa/oczy.svg`, `sowa/zrenice.svg`                                                                                                                                                                 | białka r = 14 w (46, 57) i (82, 57) z konturem 4; źrenice r = 9 w (47, 58)/(83, 58) z odblaskami r = 3,4 i 1,6 (osobna warstwa — przesuwana, gdy sowa patrzy w bok)                                                                                                                                                                                                           |
| `sowa/oczy-zamkniete.svg`, `oczy-radosc.svg`, `oczy-oszolomione.svg`                                                                                                                                | mrugnięcie (łuki w dół), radość „^ ^”, spirale w białkach                                                                                                                                                                                                                                                                                                                     |
| `sowa/skrzydlo-lewe.svg`, `skrzydlo-prawe.svg`                                                                                                                                                      | skrzydła-łezki `--sowa-ciemna` z dwoma piórkami, obrót wokół barków (34, 68) i (94, 68)                                                                                                                                                                                                                                                                                       |
| `sowa/stopa-lewa.svg`, `stopa-prawa.svg`                                                                                                                                                            | stopy z trzema paluszkami w (50, 117) i (78, 117)                                                                                                                                                                                                                                                                                                                             |
| `sowa/gwiazdki.svg`                                                                                                                                                                                 | trzy złote gwiazdki nad głową                                                                                                                                                                                                                                                                                                                                                 |
| `garderoba/kokardka.svg`, `okulary.svg`, `wianek.svg`, `kapelusz-ogrodnika.svg`, `czapka.svg`, `szalik.svg`, `plecak.svg` (za sową), `plecak-szelki.svg` (przed sową), `babelki.svg`, `babelek.svg` | 9 pozycji garderoby jako nakładki w układzie sowy: różowa kokardka przy prawym uszku, okrągłe okulary z niebieskawymi szkłami, wianek z 5 kwiatkami (`<use>`), słomkowy kapelusz z zieloną wstążką i listkiem, niebieska czapka z daszkiem w prawo, różowy szalik w białe paski, fioletowy plecak z szelkami, bąbelki przy lewym boku; pojedynczy bąbelek to cząsteczka śladu |
| `kozki/koza.svg`, `koza-skok.svg`                                                                                                                                                                   | biała kózka z profilu (w prawo): rogi, uszko, bródka, ogonek, łatka; stoi (oko z odblaskiem) albo leci z podkulonymi nóżkami (oko zmrużone, języczek)                                                                                                                                                                                                                         |
| `kozki/koza-sprezynka.svg`, `-tarcza`, `-magnes`, `-turbo`, `-podwajaczka`                                                                                                                          | nakładki: chustka na szyi w kolorze kózki (żółta, niebieska, fioletowa, pomarańczowa, zielona) i biała plakietka z ikoną (sprężyna, bańka, magnes, błyskawica, „×2” narysowane ścieżkami)                                                                                                                                                                                     |
| `humbak/humbak.svg`                                                                                                                                                                                 | niebieski humbak płynący w prawo: płetwa ogonowa, długa płetwa piersiowa, jasny brzuch z bruzdami, guzki na głowie, oko z odblaskiem, policzek, uśmiech                                                                                                                                                                                                                       |
| `humbak/plusk.svg`                                                                                                                                                                                  | korona wody z okrągłymi czubkami, krople-łezki, fala u dołu                                                                                                                                                                                                                                                                                                                   |
| `pracu/dymek.svg`, `telefon.svg`, `teczka.svg`, `mail.svg`, `tablica.svg`, `budzik.svg`                                                                                                             | czerwono-białe „chochliki obowiązków” z groźnymi brewkami i oczkami: dymek z ogonkiem (napis „Pracu / pracu!”), wibrujący telefon ze słuchawką (wariant z napisem „Magda”), stos papierów z czerwoną teczką, koperta ze skrzydełkami, tablica na nóżkach („Przyjmiesz / zmianę?”), budzik z dzwonkami                                                                         |
| `amic/dystrybutor.svg`, `cysterna.svg`, `znak-cen.svg`, `wozek.svg`, `barierka.svg`, `kanister.svg`, `sterowiec.svg`                                                                                | ciężka infrastruktura stacji w bieli, czerwieni i zielonym pasie, **bez twarzy** i bez logotypu marki (nazwa „Amic” pisana Fredoką): dystrybutor z wężem, cysterna jadąca w lewo, wysoki znak z cenami na dwóch słupkach (pod tablicą da się przejść ślizgiem), wózek z trzema kanistrami, barierka w pasy, kanister, sterowiec                                               |
| `liscie/zielony.svg`, `zloty.svg`, `teczowy.svg`                                                                                                                                                    | liść monstery z sześcioma nacięciami, nerwami i ogonkiem; złoty z błyskami; tęczowy z gradientem (czerwony → pomarańczowy → złoty → zielony → woda → fiolet)                                                                                                                                                                                                                  |
| `interfejs/serduszko-doniczka.svg`, `serduszko-puste.svg`                                                                                                                                           | życie w HUD: doniczka-serce z ziemią (`clipPath`), kiełkiem monstery, oczkami i uśmiechem; utracone życie — szare, puste, smutne                                                                                                                                                                                                                                              |

### Sówka (`owl.js`)

- `OWL_BOX = 128`, `OWL_ANCHOR = [0.5, 122/128]` (ziemia pod stopami), `OWL_SIZE = 1.2` jednostki świata;
- `OWL_POSES` — pozy składane z części: `body` (przesunięcie tułowia, oczu i skrzydeł w pionie), `wings` (obrót skrzydeł w stopniach; lewe `+`, prawe `−` = uniesione), `feet` (`[dx, dy, obrót]` dla każdej stopy wokół (50, 117) i (78, 117)), `eyes` (plik oczu), `pupils` (przesunięcie źrenic albo `null`):
  - `stoi` (0, 0, oczy, źrenice 0/0), `mruga` (oczy zamknięte),
  - `bieg-1…6`: tułów `[0, −3, −5, 0, −3, −5]`, skrzydła `[15, 35, 20, 5, 30, 15]`, stopy na przemian unoszone (np. klatka 1: lewa `[−2, 0, −10]`, prawa `[2, −6, 15]`), źrenice `[3, 0]` (patrzy w prawo),
  - `skok` (tułów −2, skrzydła 60, stopy podkulone `[2, −6, −25]`/`[−2, −6, 25]`, źrenice `[2, −3]`), `szybuje` (skrzydła 95, stopy `[±2, −5, ∓30]`, źrenice `[3, 1]`), `oszolomiona` (skrzydła −12, oczy-spirale), `radosc` (tułów −2, skrzydła 70, oczy „^ ^”);
- `owlLayers(poza)` — warstwy: stopa lewa, stopa prawa, tułów, skrzydło lewe, skrzydło prawe, oczy, (źrenice); wartości 0 pomijane;
- `COSMETIC_SPRITES` — klucze jak `SowiePlatform.COSMETICS` → nakładki: `bow` → `garderoba-kokardka`, `glasses` → `garderoba-okulary`, `flowerCrown` → `garderoba-wianek`, `gardenerHat` → `garderoba-kapelusz-ogrodnika`, `cap` → `garderoba-czapka`, `scarf` → `garderoba-szalik`, `backpack` → za sową `garderoba-plecak` + przed sową `garderoba-plecak-szelki`, `bubbleTrail` → `garderoba-babelki`, `none` → brak;
- `OWL_ACTIONS = ["stoi", "bieg", "skok", "szybowanie", "oszolomienie", "radosc"]`;
- `createOwlAnimator({ random, runFps = 12 })`:
  - `set(akcja)` (nieznana → błąd; zmiana zeruje czas akcji), `action()`, `land(siła 0–1)` (spłaszczenie), `blink()`;
  - `update(dt, { vy })` — mrugnięcie na 0,12 s co `3 + random()·2` s; spłaszczenie wygasa w 0,18 s; w skoku rozciągnięcie `clamp(−vy·0,02, −0,08, 0,16)` (vy w jednostkach świata na sekundę, ujemne = w górę);
  - `state()` → `{ sprite, scaleX, scaleY, rotation, offsetY, body, stars, time }`: stoi — `sowa-stoi`/`sowa-mruga` i „oddech” (±1,5% w pionie); bieg — `sowa-bieg-N` (12 kl./s), pochylenie 0,08 rad; skok — `sowa-skok`, skala `1 + s` / `1 − 0,6·s`; szybowanie — kołysanie ±3 jednostki pudełka i ±0,04 rad; oszołomienie — gwiazdki i chwianie ±0,06 rad; radość — podskoki do 8 jednostek; spłaszczenie po lądowaniu: `scaleY × (1 − 0,22·squash)`, `scaleX × (1 + 0,22·squash)`;
- `drawOwl(ctx, atlas, x, y, { state, size = 1.2, cosmetic = "none", flipX, alpha, lift = 0, shadow = true })` — cień (`drawShadow`, szerokość 0,7 × rozmiar), potem w przekształceniu stanu (przesunięcie, obrót, skala, odbicie): nakładka „za”, klatka sowy, nakładka „przed” (przesunięte o `body`, żeby dodatek poruszał się z głową), gwiazdki (`sowa-gwiazdki` nad głową z kołysaniem ±0,2 rad).

### Katalog grafik (`catalog.js`)

- `SVG_BASE` — adres `assets/svg/` liczony z `import.meta.url` (działa z każdej strony i w Node);
- `SPRITES` — 54 grafiki (nazwy małymi literami z myślnikami):
  - `sowa-stoi`, `sowa-mruga`, `sowa-bieg-1…6`, `sowa-skok`, `sowa-szybuje`, `sowa-oszolomiona`, `sowa-radosc` (1,2 × 1,2, kotwica stóp), `sowa-gwiazdki` (kotwica (0,5, 14/128));
  - `garderoba-*` (9 plików; 1,2 × 1,2, kotwica jak sowa), `babelek` (0,3 × 0,3);
  - `kozka-<rodzaj>` i `kozka-<rodzaj>-skok` dla `sprezynka, tarcza, magnes, turbo, podwajaczka` (kózka + nakładka; 1,2 × 1,2, kotwica (0,5, 116/128));
  - `humbak` (3,2 × 1,6), `plusk` (1,6 × 1,6, kotwica u dołu);
  - `pracu-dymek` (1,2; napisy „Pracu” (64, 56) i „pracu!” (64, 74), 21 px, `--pracu`), `pracu-telefon` (1,2), `pracu-telefon-magda` („Magda” (64, 31), 12 px), `pracu-teczka` (1,2, kotwica u dołu), `pracu-mail` (0,9), `pracu-tablica` (1,4; „Przyjmiesz” (64, 52) i „zmianę?” (64, 69), 17 px, szer. max 94), `pracu-budzik` (1,1);
  - `amic-dystrybutor` (1,6; „Amic” biały (61, 22), 17 px), `amic-cysterna` (4 × 2; „Amic” `--amic-czerwony` (170, 47), 26 px), `amic-znak-cen` (1,6 × 3,2; „Amic” (64, 27) 24 px, „95”/„ON” 11 px białe w zielonych polach, ceny „6,19” i „6,49” 24 px `--kontur`), `amic-wozek` (1,3), `amic-barierka` (1,4), `amic-kanister` (0,9), `amic-sterowiec` (4 × 2; „Amic” (124, 54), 34 px);
  - `lisc-zielony`, `lisc-zloty`, `lisc-teczowy` (0,6), `zycie`, `zycie-puste` (0,6);
- `GOAT_KINDS` (etykieta, kolor chustki, efekt), `PRACU_VARIANTS`, `AMIC_VARIANTS`, `LEAF_KINDS` (`zielony` 10 pkt / 1 liść, `zloty` 50 / 5, `teczowy` 100 / 1 + gorączka).

## Wspólny interfejs gier (`shared/ui/`) — etap E2d

Moduły ES (`shared/ui/package.json` z `"type": "module"`, `index.js` eksportuje wszystko) i style `shared/ui/ui.css` (wymaga `shared/world/tokens.css` i `shared/engine/shell.css`). Wszystkie elementy liczą rozmiar z `box-sizing: border-box`, czcionka Fredoka, cele dotyku ≥ 48 px, fokus `outline: 3px solid var(--niebieski)`; animacje wyłączane przy `prefers-reduced-motion` i klasie `sowie-reduced-effects`.

### `icons.js`

`ICONS` — ikony SVG 24 × 24 w kolorze tekstu (`currentColor`, kontur 2,4, zaokrąglone): `pause`, `play`, `restart`, `help`, `settings` (od E3 koło zębate: pierścień r = 6, oś r = 2,2 i 8 grubych zębów — kreski 3,8 px), `wardrobe` (kokardka), `home`, `close`, `back`, `star`, a od E3 dla menu: `games` (pad), `guide` (otwarta książka), `gallery` (obrazek z górami), `owl` (głowa sowy), `cloud`, `cloudOk` (chmurka z ptaszkiem), `cloudOff` (przekreślona), `heart`, `lock` (kłódka), `next` (strzałka w prawo; „poprzednie” = odbicie CSS), `image`, `download`, `share` (Udostępnij na iPhonie). Bez emoji (wyglądają różnie na każdym telefonie).

### `hud.js` — HUD

`createHud({ root, onPause, maxLives = 3 })` → `.sowie-hud` (absolutnie u góry planszy, siatka 3 kolumn, margines = bezpieczne obszary, `pointer-events: none` poza przyciskiem):

- lewy róg: przycisk pauzy 48 × 48 (`aria-label="Pauza"`, białe koło 85%, cień);
- środek: wynik `[data-hud-score]` (30 px, biały z konturem 5 px `--kontur` — `-webkit-text-stroke` + `paint-order`, cyfry o stałej szerokości, format `pl-PL`) i liście `[data-hud-leaves]` (ikona zielonego liścia 22 px + liczba w białej „pigułce”);
- prawy róg: życia `[data-hud-lives]` (serduszka-doniczki 28 px: pełne / puste, `aria-label="Życia: X z Y"`, utracone życie drga) i liczniki power-upów `.sowie-hud-powerup` (ramka w kolorze kózki `POWERUP_STYLE`: Sprężynka — złoty, Tarcza — niebieski, Magnes — fiolet, Turbo — pomarańcz, „×2” — monstera, od E4c także `goraczka` — „Gorączka”, `--policzki` (licznik Gorączki Monster w Sowiej Ucieczce); pasek pozostałego czasu `scaleX`, miganie w ostatnich 2 s, `aria-label="Tarcza: 5 s"`);
- API: `setScore(n, { animate })` (podskok `.is-bump` przy wzroście; od E4e najwyżej raz na 250 ms na element — `WeakMap` czasu ostatniego podskoku, bo wynik biegu rośnie prawie co klatkę, a restart animacji wymusza przeliczenie układu), `setLeaves(n)`, `setLives(obecne, max)`, `setPowerups([{ kind, remaining, total, label? }])` (węzły używane ponownie, np. 10 razy na sekundę; opcjonalne `label` zastępuje nazwę z `POWERUP_STYLE` na chipie i w `aria-label` — Sowie Tory: Turbo jako „Kózia jazda”), `show()`, `hide()`, `state()`, `destroy()`; `formatNumber(n)`.

### `toasts.js` — komunikaty

`createToasts({ root, isInGame, maxInGame = 1, maxOutside = 3, maxQueue = 3, duration = 2200, mergeMs = 1800 })` → kontener `.sowie-toasts` (`role="status"`, `aria-live="polite"`):

- **w trakcie gry (`isInGame()`) najwyżej 1 komunikat**, u góry planszy pod HUD (`top: safe-area + 84px`, szerokość `min(72vw, 300px)`); poza grą do 3 przy dolnej krawędzi;
- `show(tekst, { kind: "info" | "success" | "warn" | "reward", duration, key, priority })` — ten sam `key` w ciągu 1,8 s zwiększa licznik („×2”) i przedłuża czas; nadmiar trafia do kolejki (max 3, sortowanie po priorytecie, najstarsze pierwsze);
- `defer(tekst)` / `takeDeferred()` — komunikaty odłożone do ekranu wyników (np. postęp zadań w trakcie biegu); `refresh()` (po zmianie stanu gry — przy wejściu do gry nadmiar znika), `clear()`, `state()` → `{ visible, queued, inGame }`, `destroy()`;
- w menu głównym kontener jest `fixed` nad dolnym paskiem zakładek (`shared/menu/menu.css`);
- wygląd: biała „pigułka” 16 px Fredoka 700, zaokrąglenie 16 px, ramka wewnętrzna 2 px: sukces — monstera, ostrzeżenie — `--pracu`, nagroda — złota na tle `--niebo-dol`; wejście 180 ms, wyjście 200 ms.

### `modal.js` — okna

`openModal({ title, content (Node albo tekst), actions: [{ label, primary, onClick(close) }], onClose, root = document.body, className })` → `{ element, body, close }`: tło `.sowie-ui-backdrop` (fixed, `rgba(59,47,74,.45)`, z-index 9000), arkusz `.sowie-ui-sheet` wysuwany od dołu (zaokrąglenie 24 px u góry, max. 88 dvh, przewijana treść, przyciski akcji na dole obok siebie — kolumny równej szerokości, od E3 — z marginesem na pasek domowy; na ekranach ≥ 700 px — okno na środku), `role="dialog"`, `aria-modal`, tytuł w `aria-labelledby`, przycisk zamknięcia 48 px; fokus na przycisku głównym (albo „Zamknij”), pułapka Tab, Escape i dotknięcie tła zamykają, po zamknięciu fokus wraca; dotknięcia nie trafiają do planszy (`pointerdown` → `stopPropagation`). `focusableIn(element)`.

### `guide-view.js` — karty instrukcji

`renderGuide(przewodnik, { atlas, sprites, headingLevel = 3 })` → opis + karty przewijane w bok (`scroll-snap`, szerokość `min(78%, 300px)`): obrazek postaci (z atlasu, gdy gra go ma — płótno 96 px w DPR; bez atlasu tylko grafiki z jednego pliku SVG jako `<img>`), tytuł (`h3`, a w zakładce „Jak grać” menu `h4`), tekst, przy karcie z gestem **animowana demonstracja** i nazwa gestu (np. „Stuknij”), wskazówka i numer „1 / 7”.

Demonstracja gestu (od E3): `span.sowie-gesture-demo[data-gesture]` (`aria-hidden`) — „ekran” 96 × 56 px (tło `--niebo-gora`, zaokrąglenie 14 px) z kropką palca `.sowie-gesture-finger` (22 px, `rgba(59,47,74,.55)`, biała obwódka 4 px): `tap` — wciśnięcie `scale(.7)` z falą (1,2 s), `hold` — powolne wciśnięcie z rosnącą falą (1,8 s), `swipe-left/right` — przesunięcie ±30 px z pojawianiem się i znikaniem (1,4 s; w lewo — animacja odwrócona), `swipe-up/down` — ±16 px w pionie, `drag` — ukośnie tam i z powrotem (2 s); przy `prefers-reduced-motion` i `sowie-reduced-effects` kropka stoi.

### `pause-menu.js` — menu pauzy

`createPauseMenu({ root, shell, gameId, audio (obiekt albo funkcja), atlas, sprites, cloud = SowieCloud, platform = SowiePlatform, onResume, onRestart, onExit = → "../" })`:

- nakładka `.sowie-pause-overlay.sowie-ui-pause` (`role="dialog"`, `aria-label="Pauza"`, karta przy dolnej krawędzi — zasięg kciuka) z tytułem „Pauza”, powodem (tło: „Witaj z powrotem 🦉”, fokus: „Gra czeka na Ciebie”, obrót: „Ekran się obrócił”, gracz: „Odpocznij chwilę”) i przyciskami: **Wznów** (główny, 60 px, ikona ▶), siatka 2 × 2: **Zacznij od nowa**, **Jak grać**, **Ustawienia**, **Garderoba**, oraz **Wyjdź do menu**;
- **Ustawienia**: suwaki Głośność ogólna / Muzyka / Efekty dźwiękowe (silnik audio + `settings.volumeMaster/Music/Sfx`; od E3 suwak muzyki / efektów ustawia też `settings.music` / `settings.sfx` = wartość > 0 — przełączniki obecnych gier; suwak min. 48 px wysokości), przełączniki (przyciski `aria-pressed` z „suwakiem” 48 × 28 px): „Efekty (wstrząsy, cząsteczki)” (`settings.reducedEffects` odwrotnie + klasa `sowie-reduced-effects`), „Wibracje” (`settings.vibration`), „Tryb Przytulny (wolniej, bez końca gry)” (`settings.cozy` — gry E4+ czytają to ustawienie); „Gotowe” / strzałka wraca do menu; zapis w profilu po 1 s;
- **Garderoba**: przyciski dodatków z `SowiePlatform.COSMETICS` (zablokowane wyszarzone z dopiskiem „· zablokowane”), wybór zapisuje `profil.cosmetics.selected`;
- **Jak grać**: okno z kartami `guideFor(gameId)` (albo „Poznaj Sowi Świat”);
- z powłoką (`createShell({ overlay: false })`): auto-pauza (`paused`) otwiera menu z powodem, „Wznów” uruchamia `shell.resume()`, a w stanie `countdown` menu pokazuje cyfry `.sowie-countdown` na środku; `running` zamyka i woła `onResume`; bez powłoki „Wznów” zamyka menu i woła `onResume`;
- opcjonalnie `endAction: { label = "Zakończ bieg", visible(), onClick }` — dodatkowy przycisk (np. Tryb Przytulny bez końca gry w Sowiej Ucieczce), widoczny, gdy `visible()` nie zwraca `false`; kliknięcie zamyka menu i woła `onClick`;
- Escape: z podwidoku wraca do menu, w menu wznawia; API: `open(powód)`, `countdown(n)`, `close()`, `resume()`, `isOpen()`, `view()` (`menu` / `settings` / `wardrobe` / `countdown` / `null`), `destroy()`.

### `results.js` — ekran wyników

`createResults({ root, onAgain, onMenu = → "../" })` → `show({ title = "Koniec gry!", score, best, isRecord, leaves, rank, tasks: [{ label, progress, target, done, newlyDone }], photo: { title, src }, extra: [{ label, value }], messages: [{ text }] })`: karta przy dolnej krawędzi (`role="dialog"`, tytuł w `aria-labelledby`): odznaka „Nowy rekord!” (złota, animacja 0,9 s: obrót i powiększenie) albo „Rekord: N”, wynik 54 px (liczenie w górę 0,8 s, `ease-out`; bez animacji przy ograniczeniu ruchu), kafelki: liście (ikona), „Twoje top 10 — N. miejsce”, dodatkowe; lista „Zadania” z paskami postępu (ukończone — „Gotowe!”, nowo ukończone — złota ramka), odłożone komunikaty, nowe zdjęcie Galerii; przyciski **„Jeszcze raz”** (główny, 60 px) i „Menu” — od E4 przyklejone do dołu karty (`position: sticky`, tło z gradientem), więc są w zasięgu kciuka także przy długiej liście zadań; `hide()`, `isOpen()`, `destroy()`.

## SowieProgress i instrukcje (`shared/meta/`) — etap E2d

### `progress.js` — `window.SowieProgress`

- `EVENTS` (od E4f w osobnym module `progress-events.js`, eksportowane dalej z `progress.js`): `run:started`, `run:ended`, `leaf:collected` (`kind`: zielony / zloty / teczowy, `count`, `points`), `goat:caught` (`kind`), `hit` (`by`: pracu / amic), `near-miss`, `combo` (`value`), `fever:start`, `whale:bonus`, `life:gained` (od E4f: odzyskane życie — w Sowiej Ucieczce Chmura Pracu się oddala), `idle:progress`, `game:visit`, `award` (`id`, `xp`, `feathers`, `label`);
- `bridgeCalls(typ, szczegóły)` — **most do obecnej Sowiej Akademii** (okres przejściowy E4–E8, Analiza 3): koniec biegu → `runnerScore`/`runnerDistance`/`runnerLeafChain`, `jumperScore`/`jumperHeight`/`jumperStreak`, `sowa3Score`/`sowa3Combo`/`sowa3Finishes` (+1 przy `finished`); postęp idle → `ogrodyLeaves`/`Clicks`/`Buys`/`Watering`/`Prestiges`/`Plants`, `szklarniaRooms`/`Plants`/`Goats`/`Hybrids` (tryby `max` / `set` / `add` jak w `gameplay-expansion.js`); wizyta → `<gra>Visits` +1; brak wartości albo nieznana gra → brak wywołań. Misje dnia i tygodnia oraz odblokowywanie zdjęć Galerii (wymagania oparte na metrykach Akademii) działają więc tak samo dla starych i nowych gier;
- `taskProgress(migawka Akademii)` → `[{ id, label, progress, target, done }]` — misje dnia (`max`: metryka dnia, `delta`: metryka − `baseline`, obcięte do celu) i misja tygodnia („Zagraj w 3 różne gry w tym tygodniu”);
- `createProgress({ getAcademy = () => window.SowieAcademy, now })` → `emit(typ, szczegóły)` (nieznany typ → błąd; bez `gameId` bierze grę bieżącego biegu; liczniki biegu; most; `award` → `SowieAcademy.award`), `on(typ | "*", słuchacz)` → odłączenie, `beginRun(gra, { difficulty, daily })` (liczniki od zera, migawka zadań „przed”), `endRun(wynik)` → podsumowanie `{ gameId, difficulty, daily, startedAt, leaves: { zielony, zloty, teczowy, total }, leafPoints, goats, hits, nearMisses, fevers, whales, bestCombo, …wynik, durationMs, tasks: [{ …, advanced, newlyDone }] }` (bez `beginRun` → błąd), `current()`, `tasks()`;
- `linkProfile({ getCloud = () => window.SowieCloud, getPlatform = () => window.SowiePlatform, onMission })` (od E4f) — gra (nie Laboratorium) włącza zapis **misji garderoby i statystyk profilu**: każde zdarzenie przechodzi przez `profileUpdates` i `applyProfileUpdates` (`missions.js`, niżej) z `COSMETICS` platformy; ukończona misja → `onMission({ key, label, reward, rewardLabel })`;
- `progress` — wspólna instancja strony, także `window.SowieProgress`.

### `missions.js` — misje garderoby i statystyki profilu (od E4f)

Obecne gry posuwają misje profilu przez `SowieCore.progressMission` / `recordStat`; przebudowane gry — przez zdarzenia SowieProgress. Moduł zamienia je na te same zmiany profilu (dawny SowaRunner robił to przez SowieCore — po podmianie Sowia Ucieczka robi to tutaj, więc np. „Czapka z daszkiem” za 1000 m nadal jest do zdobycia).

- `MISSION_LABELS` — opisy misji (`leaves20` „Zbierz 20 liści monster”, `extraLife` „Zdobądź dodatkowe życie”, `nearMiss3` „Wykonaj 3 uniki „O włos!””, `chaosFinish` „Ukończ etap na poziomie Chaos”, `combo4` „Osiągnij combo ×4”, `runner1000` „Przebiegnij 1000 m w Sowiej Ucieczce”, `jumper250` „Osiągnij 250 m w SowaJumper”); zakładka „Sowa” (`shared/menu/owl-tab.js`) importuje je stąd (`shared/sowie-core.js` ma kopię dla obecnych gier);
- `profileUpdates(typ, szczegóły)` → `{ missions: [[klucz, wartość, "add" | "max"]], stats: [[…]] }`: `leaf:collected` → `leaves20` i `stats.leaves` + `count`; `near-miss` → `nearMiss3` i `stats.nearMisses` + 1; `combo` → `stats.maxCombo` (maksimum), od ×4 `combo4` + 1; `life:gained` → `extraLife` i `stats.extraLives` + 1; `run:ended` gry `runner` → `runner1000` = maksimum z dystansu, gry `jumper` → `jumper250` = maksimum z wysokości; inne zdarzenia — nic;
- `applyProfileUpdates(cloud, zmiany, { cosmetics })` — bez gotowej chmury nic; statystyki: `add` → `cloud.increment("stats.<klucz>")`, `max` → `updateProfile` tylko przy poprawie; misje (pomijane nieznane i ukończone): nowy postęp (suma albo maksimum, obcięty do celu) w `updateProfile`, przy osiągnięciu celu `done: true` i nagroda dopisana raz do `cosmetics.unlocked`; zwraca ukończone właśnie teraz `[{ key, label, reward, rewardLabel }]`.

### `guides-data.js` — instrukcje

Struktura przewodnika `{ id, title, summary, cards: [{ id, title, text, sprite?, gesture?, tip? }] }`; `GESTURES` (tap „Stuknij”, hold „Przytrzymaj”, swipe-up/down/left/right „Przesuń w …”, drag „Przeciągnij”); `GUIDES.swiat` — „Poznaj Sowi Świat” (7 kart: Sówka, Liście monstery, Pracu Pracu, Amic, Skaczące kózki, Humbak, Serduszka-doniczki); `validateGuide(przewodnik, { sprites })` → lista błędów (brak pól, puste karty, powtórzone id, nieznany gest, brak grafiki w katalogu); `guideFor(id)`; `GUIDE_ORDER = ["swiat", "runner", "jumper", "sowa3", "ogrody", "szklarnia"]` (kolejność w zakładce „Jak grać”).

Przewodnik **`sowietory`** (od E5e) — instrukcja wersji podglądowej **Sowich Torów** (`SowieTory/`, poza `GUIDE_ORDER`; po podmianie w E5f zastąpi przewodnik `sowa3`): tytuł „Sowie Tory”, opis „Sowa biegnie w głąb ekranu po trzech torach przez sklep Biedronka, festiwal roślin, blokowisko PRL i stację Amic. Na mecie każdej planszy wskakuje do basenu i zmienia się w humbaka.”; 8 kart: „Cel gry” (`sowa-bieg-2`, wskazówka: plansza ok. 75 s), „Zmiana toru” (`swipe-left`, `amic-dystrybutor`, cysterna), „Skok” (`swipe-up`, `pracu-teczka`, łuk liści), „Ślizg” (`swipe-down`, `pracu-dymek`, szybkie lądowanie), „Dziki na blokowisku” (`amic-barierka`, unik +30 pkt), „Kózki i Gorączka” (`kozka-turbo-skok`, serduszko-doniczka), „Basen i Humbacze Tory” (`humbak`, gwiazdki), „Tryb Nieskończony” (`lisc-teczowy`). Okno „Jak grać?” Sowich Torów ma przycisk „Zagraj samouczek”.

Przewodnik **`chmury`** (od E6e) — instrukcja wersji podglądowej **Sowy w Chmurach** (`SowaWChmurach/`, poza `GUIDE_ORDER`; po podmianie w E6f zastąpi przewodnik `jumper`): tytuł „Sowa w Chmurach”, opis „Sowa wspina się coraz wyżej — sama odbija się od gałązek, a Ty prowadzisz ją w bok. Od ogródka przez blok i chmury aż do zorzy i kosmosu.”; 7 kart: „Cel gry” (`sowa-skok`, wskazówka: pięć stref z wysokościami), „Sterowanie” (`swipe-right`, `sowa-szybuje`, kciuk nisko i przechylanie), „Platformy” (`lisc-zielony`, zawsze da się dolecieć), „Pracu Pracu i Amic” (`pracu-dymek`, pomarańczowy znacznik kanistra), „Kózki i Gorączka” (`kozka-turbo-skok`, serduszko-doniczka), „Niebiański Ocean” (`humbak`, wybicie po oceanie), „Upadek” (`kozka-sprezynka-skok`, poziomy Chill / Chaos). Okno „Jak grać?” Sowy w Chmurach ma przycisk „Zagraj samouczek”.

Przewodnik **`runner`** to od E4f **Sowia Ucieczka** (w E4a–E4e był osobnym przewodnikiem `ucieczka`, a `runner` opisywał dawny SowaRunner): tytuł „Sowia Ucieczka”, opis „Sówka ucieka przed Chmurą Pracu przez coraz bardziej zwariowane okolice. Skacz, szybuj i ślizgaj się, zbieraj liście monstery i nie daj się dogonić.”; 6 kart: „Cel gry” (Chmura Pracu, wskazówka: 400 m bez trafienia), „Skok” (`tap`), „Szybowanie” (`hold`), „Ślizg” (`swipe-down`), „Pracu i Amic” (rodziny przeszkód, znak „!”), „Kózki i humbak” (grafika `kozka-magnes-skok`: 5 kózek, Plusk-o-metr — 60 liści albo 3 bąbelki, 20 s rejsu; wskazówka o zadaniach biegu i Sowim mnożniku). Okno „Jak grać?” na ekranie tytułowym Sowiej Ucieczki ma też przycisk „Zagraj samouczek”; menu pauzy gry pokazuje ten sam przewodnik.

Od E3 w pliku są też przewodniki **obecnych gier** (treść przeniesiona z `shared/game-guides.js`, bez zmian merytorycznych) — każdy ma opis `summary` i 5 kart: „Cel gry”, „Sterowanie” (z gestem: SowaJumper `hold`, Sowa3 `swipe-right`, Ogrody i Szklarnia `tap`) oraz 3 karty ze wskazówkami (np. „Przez krawędź”, „Precyzyjne lądowanie”, „Platformy”; „Patrz na horyzont”, „Combo liści”, „Plansze”; „Najpierw rośliny”, „Podlewanie”, „Ogród rośnie beze mnie”; „Woda i nasiona”, „Krzyżowanie”, „Cele laboratorium”), każda z grafiką z katalogu. Po przebudowie gry podmieniamy tylko jej karty.

### `shared/game-guides.js` — `window.SowieGameGuides` (strony gier)

Klasyczny skrypt: dok przycisków gry (`getDock()` → `.sowie-tool-dock`), przycisk ❓ (`data-game-guide-fab`, `aria-label="Instrukcja gry <nazwa z rejestru>"`) i okno instrukcji. Od E3 treść pochodzi z `shared/meta/guides-data.js` wczytywanego przez `import()` przy starcie strony (`ready` — obietnica z `GUIDES`); `open(gameId)` jest asynchroniczne i pokazuje „Instrukcja — <tytuł>”, opis i kolejne karty jako sekcje (tytuł `h3` + tekst i wskazówka). Klik w dowolny element z `data-game-guide` otwiera okno tej gry.

## Dźwięki (`assets/audio/`, `scripts/make-audio.mjs`) — etap E2c

Wszystkie dźwięki są syntezowane kodem (własna twórczość, CC0 — `assets/audio/LICENSES.md`); `node scripts/make-audio.mjs` (ok. 35 s) generuje pliki i manifest, wynik jest powtarzalny (generator losowy `mulberry32` z ziarnem zależnym od nazwy). Zależność deweloperska `@breezystack/lamejs` **1.2.7** (czysty JavaScript, LGPL-3.0) koduje MP3; nie trafia na stronę.

- **Syntezator** (44,1 kHz, `Float32Array`): obwiednia ADSR (`envelope`), oscylatory o ograniczonym paśmie (suma harmonicznych do połowy częstotliwości próbkowania, max 40: sinus, prostokąt, piła, trójkąt; albo własna lista harmonicznych), szum, `voice(wyjście, start, długość, { frequency (liczba albo funkcja czasu), wave, env, gain, vibrato { rate, depth, delay }, lowpass (liczba albo funkcja), pan, harmonics })` (mono albo stereo z panoramą równej mocy), filtry: pasmowy biquad RBJ (`bandpass` — formanty głosów), górnoprzepustowy i dolnoprzepustowy jednobiegunowy, `echo` (opóźnienie ze sprzężeniem), `reverb` (Schroeder: 4 filtry grzebieniowe 1557/1617/1491/1422 próbek × rozmiar, tłumienie 0,2, sprzężenie 0,78, 2 wszechprzepustowe 556/441), `trimSilence`, `fadeOut` (10 ms), `normalize` (szczyt 0,89 ≈ −1 dBFS, miękkie obcięcie `tanh`);
- **Efekty** (27, mono 64 kb/s; w nawiasie charakter): `skok` (prostokąt+sinus 280→720 Hz), `podwojny-skok` (dwa wznoszące „bip” + iskra), `szybowanie` (pętla 2 s: szum pasmowy 700 Hz falujący 0,5 Hz, zapętlenie przez przenikanie dwóch kopii), `slizg` (szum z opadającym filtrem + ton 300→140 Hz), `ladowanie` (tąpnięcie 190→55 Hz), `lisc` (dzwoneczek E6 + B6; w grze wyższy z combo), `lisc-zloty` (E6–B6–E7), `lisc-teczowy` (arpeggio C6–E7 + wibrujący ton), `goraczka-start` (narastający szum + akord C-dur piłą + stopa), `trafienie-pracu` (dwa piski „pra-cu!” z formantami 1300/2700 Hz), `trafienie-amic` (metaliczny „bonk”: 220/563/1130/1790/2650 Hz + tąpnięcie), `koza-meee` (piła 470→400 Hz z drżeniem 18 Hz, formanty 600/2300 Hz), `powerup-start` (arpeggio w górę), `powerup-koniec` (w dół), `humbak-plusk` (szum + tąpnięcie + 9 bąbelków), `humbak-piesn` (zawołanie wieloryba 300→520→260 Hz z echem i pogłosem), `bonus-start` (fanfara C–E–G–C), `zycie` (G5–C6–E6–G6), `rekord` (fanfara z iskrami), `klik`, `zakup` (moneta B5→E6), `polaczenie` („blup” + dzwoneczek), `odliczanie` (A5), `odliczanie-start` (E6+E5), `koniec-gry` (smutne „hu-hu” G4→F4, E4→C4), `hu-hu` (wesołe A4, C5→D5), `dzwonek` (zapowiedź Pracu: 1400+1750 Hz z drżeniem 20 Hz, dwa razy); pohukiwanie (`hoots`) = sinus z harmonicznymi i vibrato + oddech (szum przez filtr pasmowy) + pogłos;
- **Muzyka** (stereo: menu 96 kb/s, motyw biegu 80 kb/s, pieśń humbaka 64 kb/s — od E4e lżejsza ze względu na budżet Sowiej Ucieczki; renderowanie „po okręgu” — wybrzmienie za końcem pętli trafia na jej początek): `menu` — 112 BPM, C-dur, 8 taktów (C–Am–F–G ×2): bas trójkątny (pryma i kwinta), akordy marimbą na słabe ósemki, melodia prostokątem z vibrato + dzwoneczek oktawę wyżej, perkusja (stopa, werbel, hi-hat); `humbak` — 72 BPM, D-dur, 8 taktów (Dmaj7–Bm7–Gmaj7–A): pady z rozstrojonych pił przez filtr 900 Hz, sub-bas, krople marimby, 5 zawołań wieloryba z echem, szum fal; `ucieczka` (od E4e, motyw Sowiej Ucieczki) — 125 BPM, G-dur, 8 taktów (G–e–C–D ×2), ok. 15,4 s: bas trójkątny ósemkami (pryma, na „i” oktawa wyżej, 0,3 / 0,18), akordy marimbą na słabe ósemki, skoczna melodia prostokątem (filtr 3000 Hz, vibrato 6 Hz) + dzwoneczek oktawę wyżej, perkusja z dodatkową stopą (`k...s..kk...s.k.`); normalizacja `tanh` do 0,8;
- **Motywy plansz Sowich Torów** (od E5e, stereo 48 kb/s, głośność 0,5): wspólna funkcja `stageTheme({ bpm, chords, bars, lead, leadGain = 0,1, lowpass = 3000, bass = "eighths", drums: { pattern, gains } })` — długość `chords.length × 4` ćwierćnut; na każdy takt (akord `[bas, nuta, nuta, nuta]`): bas trójkątny ósemkami (`eighths`: pryma i oktawa wyżej na „i”, 0,28 / 0,17) albo półnutami (`half`: pryma na 1 i kwinta na 3, 0,3), akordy marimbą na słabe ósemki (0,075, panorama −0,4 / 0 / 0,4); melodia `bars` — takty z listą `[nuta | "-" (pauza), długość w ćwierćnutach]` (każdy takt musi mieć 4 ćwierćnuty — inaczej błąd), falą `lead` (vibrato 6 Hz, głębokość 0,01 dla sinusa, 0,006 dla pozostałych; filtr `lowpass`, `null` — bez filtra; nuta trwa 85% długości) + dzwoneczek oktawę wyżej (0,04, panorama −0,2); perkusja `drums(wzór 16 kroków, takty, głośności)`. Motywy (8 taktów, ok. 14,5–18,5 s): `tory-biedronka` — 118 BPM, F-dur (F–d–B–C ×2), melodia trójkątna 0,16, stopa na 1, 3 i „i” 3; `tory-festiwal` — 104 BPM, A-dur (A–fis–D–E ×2), flet: sinus 0,2 bez filtra, bas półnutami, lekka perkusja (`k.....s.k.....s.`, stopa 0,45); `tory-prl` — 132 BPM, a-moll (a–F–G–E ×2), prostokąt 0,09 przez 2600 Hz, gęsta perkusja (`k.k.s.k.k.k.s.kk`); `tory-amic` — 126 BPM, D-dur (D–h–G–A ×2), piła 0,08 przez 2200 Hz, perkusja `k...s..kk...s...`;
- **Motyw Sowy w Chmurach** (od E6e, `chmury`, stereo 48 kb/s, głośność 0,5): `stageTheme` — 100 BPM, G-dur (G–e–C–D ×2), 8 taktów (19,2 s), flet: sinus 0,18 bez filtra wznoszący się po akordach, bas półnutami, delikatna perkusja (`k.....s...k...s.`, stopa 0,4, werbel 0,1, hi-hat 0,05);
- **Nagrania właściciela**: `assets/audio/glosy/<nazwa>.wav` (PCM 16 bit, dowolna częstotliwość i liczba kanałów → mono, przepróbkowanie liniowe do 44,1 kHz) zastępuje efekt o tej nazwie (`"recorded": true` w manifeście);
- **Manifest** `assets/audio/audio.json`: `{ version: 1, sampleRate: 44100, onsetThreshold: 0.02, sfx: { nazwa: { file, bytes, duration, samples, onset, label, volume, loop, maxVoices (domyślnie 3; liść 4), minGap (domyślnie 0,06 s; liść, klik 0,03), recorded? } }, music: { menu|humbak|ucieczka|tory-biedronka|tory-festiwal|tory-prl|tory-amic|chmury: { …, label, bpm, volume, loop: true, fingerprint } } }` — dla pętli (`szybowanie`, muzyka) `fingerprint` to pierwsze 4096 próbek oryginału (Int8, base64);
- razem ok. 1258 KB (efekty ok. 205 KB, muzyka ok. 1053 KB: menu 202 KB, humbak 209 KB, ucieczka 150 KB, tory-biedronka 96 KB, tory-festiwal 109 KB, tory-prl 86 KB, tory-amic 90 KB, chmury 113 KB); gra pobiera tylko swoje pliki (Sowie Tory: efekty z `GAME_SOUNDS`, 4 motywy i humbak — ok. 762 KB, budżet < 800 KB; Sowa w Chmurach: efekty z `GAME_SOUNDS`, motyw `chmury` i humbak — ok. 502 KB, budżet < 800 KB); service worker trzyma MP3 „najpierw z pamięci”.

## PWA — instalacja na telefonie i start bez zasięgu

- `manifest.webmanifest` (katalog główny): `name`/`short_name` „SowieGry”, `lang: "pl"`, `id`/`start_url`/`scope` `"./"`, `display: "standalone"`, `orientation: "portrait"`, `background_color: #fff6e3`, `theme_color: #bfe9ff`, ikony 192 i 512 (`any`), 512 `maskable`, SVG;
- `assets/icons/icon.svg` — Sówka na niebie (gradient `#bfe9ff` → `#fff6e3`, treść w środkowym kole 80% — bezpieczna dla ikon „maskable”); PNG (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` 180 px, `favicon-32.png`) generuje `node scripts/make-icons.cjs` (Chromium z Playwright robi zrzuty SVG);
- każda strona (menu, gry, Laboratorium) ma w `<head>`: `<link rel="manifest">`, ikonę SVG, `apple-touch-icon`, `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-title` „SowieGry” oraz skrypt `shared/pwa.js` po `password-gate.js`;
- `shared/pwa.js` — po `load` rejestruje `sw.js` z katalogu głównego (zakres = cała strona) na `https` i `localhost`; błąd rejestracji to tylko `console.warn`; od E3 od razu przechwytuje `beforeinstallprompt` (`preventDefault`, zdarzenie zapamiętane — może przyjść, zanim wczyta się menu) i `appinstalled`; `window.SowiePwa` (zawsze, także bez service workera): `standalone()` — czy gra działa jako zainstalowana aplikacja (`display-mode: standalone` albo `navigator.standalone`), `canPrompt()` — czy przeglądarka pozwala zainstalować przyciskiem, `prompt()` → `"accepted"` / `"dismissed"` / `null` (systemowe okno instalacji; zdarzenie jednorazowe), `onInstallChange(słuchacz)` → odłączenie (słuchacz dostaje `true` po `beforeinstallprompt`, `false` po instalacji);
- `sw.js` (katalog główny — service worker w `shared/` obejmowałby tylko ten katalog, a GitHub Pages nie pozwala ustawić nagłówka `Service-Worker-Allowed`):
  - `VERSION = "sowiegry-v4"` (v2 — E3a: `shared/meta/guides-data.js`; v3 — nowe menu E3; v4 — E4f: podmiana SowaRunner na Sowią Ucieczkę, nowe moduły `meta/progress-events.js` i `meta/missions.js`, a podniesienie wersji usuwa z telefonów stare pliki SowaRunner razem z `p5.js` ok. 5 MB) — jedna pamięć podręczna na wersję; przy aktywacji usuwane są stare `sowiegry-*`; **przy każdej zmianie listy lub strategii trzeba podnieść `VERSION`**;
  - `SHELL` (102 pliki): `./`, `index.html`, manifest, 6 ikon, obie czcionki Fredoka, `config/firebase-config.js`, style (`cute-ui.css`, `world/tokens.css`, `ui/ui.css`, `menu/menu.css`, a dla gier `game-enhancements.css`, `owl-gallery.css`), skrypty klasyczne (`sowie-platform`, `sowie-cloud`, `password-gate`, `pwa`, `sowie-core`, `notification-manager`, `game-guides`, `sowie-academy`, `owl-gallery`), **cały graf modułów ES menu** (7 plików `shared/menu/`, `engine/assets, audio, loop, sprites`, `meta/guides-data, progress, progress-events, missions`, `ui/guide-view, icons, modal, toasts`, `world/catalog, owl, tokens`), `assets/audio/audio.json` z czterema efektami menu (`klik`, `hu-hu`, `zakup`, `rekord`) i **48 plików SVG postaci** z katalogu (`svgFiles(SPRITES)`) — menu rysuje postacie także przy pierwszym starcie bez zasięgu; kompletność pilnuje test jednostkowy (graf `import … from "./…"` od `shared/menu/menu.js`);
  - instalacja: `SHELL` z `cache: "reload"`, w tle pliki SDK Firebase 12.19.0 z gstatic (błąd nie blokuje instalacji), `skipWaiting`, przy aktywacji `clients.claim`;
  - pobieranie (tylko `GET`): strony i kod z tej domeny — **najpierw sieć** (aktualizacje z GitHub Pages od razu), przy braku sieci lub po 4 s — pamięć, a dla nawigacji bez kopii — menu `./`; obrazki, czcionki i dźwięki (`png, jpg, webp, gif, svg, ico, woff/woff2, mp3, ogg, wav`) oraz SDK z gstatic — **najpierw pamięć**; zapisywane są tylko odpowiedzi `ok` typu `basic`/`cors`; żądania do Firestore nie są obsługiwane (zapis offline robi SDK w IndexedDB);
  - gry trafiają do pamięci przy pierwszej wizycie (start bez zasięgu działa dla menu i gier już otwieranych);
  - grafiki SVG i czcionki są „najpierw z pamięci”, więc **po zmianie grafiki lub czcionki trzeba podnieść `VERSION`**, żeby telefony pobrały nową wersję.

## Sowie Laboratorium (`lab/`)

Strona testowa do sprawdzania Sowiego Silnika na prawdziwym telefonie (Analiza 3, E2). `lab/index.html` (`html.sowie-shell`, `viewport-fit=cover`, te same skrypty startowe co gry — hasło obowiązuje; style `cute-ui.css`, `shared/world/tokens.css`, `engine/shell.css`, `lab.css`), `lab/main.js` i `lab/characters.js` (moduły ES; `lab/package.json` z `"type": "module"`). Nie jest w rejestrze gier.

- nagłówek: „← Menu”, „Sowie Laboratorium”, licznik kl./s; przyciski działów **Postacie · Dźwięk · Interfejs · Gesty · Informacje** (`aria-pressed`, min. 48 px; pasek przewijany w bok); domyślnie otwiera się „Postacie”, a `?dzial=dzwiek` / `?dzial=interfejs` / `?dzial=gesty` / `?dzial=info` otwiera od razu inny dział; jedna pętla silnika aktualizuje i rysuje tylko widoczny dział;
- **Postacie** (punkt kontrolny właściciela przed E3, `lab/characters.js`): status atlasu („Rysuję postacie…” → „Atlas gotowy: N grafik w X ms. Postacie ruszają się same.”), przyciski garderoby (9 pozycji z `SowiePlatform.COSMETICS`, `aria-pressed`, min. 44 px) zmieniające dodatek na animowanych sowach, a pod nimi siedem działów, każdy z nagłówkiem (Fredoka 700, 18 px) i własnym płótnem (`role="img"`, opis z nazwami postaci):
  - „Sówka — animacje”: stoi i mruga, bieg, skok (łuk 0,55 j. co 1,3 s, rozciągnięcie i spłaszczenie przy lądowaniu, malejący cień), szybowanie (0,35 j. nad ziemią), oszołomienie, radość;
  - „Garderoba (9 pozycji)”: stojąca, mrugająca sowa w każdym dodatku;
  - „Skaczące kózki (power-upy)”: 5 kózek skaczących łukiem 0,6 j. (w locie wersja `-skok`), podpisy Sprężynka, Tarcza, Magnes, Turbo, Podwajaczka;
  - „Humbak (poziomy bonusowe)”: humbak kołyszący się na wodzie, plusk pulsujący co 1,6 s;
  - „Rodzina Pracu Pracu”: dymek płynie falą, telefony drżą seriami (dzwonienie), stos papierów „oddycha”, mail trzepocze, tablica się chwieje, budzik drga;
  - „Rodzina Amic”: grafiki stojące, sterowiec się kołysze, kanister spada;
  - „Liście monstery i życia”: liście obracają się (`scaleX = cos`), serduszko pełne i puste;
  - układ „jak tekst”: komórki `szerokość × wysokość` jednostek świata × 64 px CSS + 18 px na podpis (Fredoka 500, 13 px), odstęp 8 px, zawijanie do szerokości działu; tło komórki `rgba(255,255,255,0.55)` z zaokrągleniem 14 px; płótna w rozdzielczości DPR (max 2), atlas budowany dla `64 × DPR` px na jednostkę (`atlas.ensure` przy zmianie rozmiaru); rysowane są tylko działy widoczne na ekranie (`IntersectionObserver`);
- **Dźwięk** (`lab/sound.js`, `createSoundPanel({ root })`): manifest `assets/audio/audio.json` wczytywany przy starcie strony, `createAudio` + `bindUnlock(window)` + `connectAudioSettings`; status (`[data-audio-status]`): „Dotknij dowolnego przycisku…”, potem „Dźwięk: działa · efekty wczytane: N/27 · muzyka: … · sesja: ambient” (stany kontekstu: działa, wstrzymany, zamknięty, czeka na dotknięcie); trzy suwaki `input[type=range]` 0–100 (Głośność ogólna, Muzyka, Efekty; `accent-color` monstery, pole min. 44 px, wartość obok) — zmiana od razu w silniku i w profilu (`volumeMaster` / `volumeMusic` / `volumeSfx`, przesunięcie suwaka muzyki/efektów ustawia też `music`/`sfx: true`); „Wibracje (Android)” (`settings.vibration`, nieaktywny bez `navigator.vibrate`); **Muzyka**: „Motyw menu”, „Pieśń humbaka” (`aria-pressed` = gra), „Ścisz muzykę (jak w bonusie)” (przełącznik `duck(0.3)`), „Zatrzymaj muzykę”; **Efekty**: przycisk na każdy efekt z podpisem z manifestu (szybowanie włącza/wyłącza pętlę; trafienia wibrują `[40, 30, 40]`) i „Seria liści (combo)” — 8 liści co 110 ms, każdy o pół tonu wyżej; siatka przycisków `repeat(auto-fill, minmax(140px, 1fr))`, min. 48 px;
- **Interfejs** (`lab/interface.js`, `createInterfaceDemo({ root, loop, atlas, soundReady })`, tworzony przy pierwszym otwarciu): plansza `[data-ui-stage]` (wysokość `min(58dvh, 520px)`, min. 300 px) z niebem, trawą przesuwaną w rytm biegu i biegnącą Sówką (atlas z działu Postacie, 64 px na jednostkę) oraz prawdziwe moduły `shared/ui/` — HUD, komunikaty, menu pauzy (z drugą powłoką `createShell({ overlay: false })`, aktywną tylko w trakcie biegu tego działu), ekran wyników — i `SowieProgress` (gra `laboratorium`, bez Akademii, więc Laboratorium nie zmienia prawdziwych misji). Przyciski: „Liść +10”, „Złoty liść +50” (komunikat nagrody + odłożony postęp zadania), „Kózka: Tarcza” (licznik power-upu 10 s; tarcza chroni przed jednym trafieniem), „Trafienie (Pracu)” (−1 życie, oszołomienie, dźwięk i wibracja; przy 0 — koniec gry), „5 komunikatów naraz” (w grze widać 1, reszta w kolejce), „Menu pauzy”, „Koniec gry” (ekran wyników: rekord w pamięci strony, top 10, przykładowe zadania „Zbierz 20 liści w jednym biegu” i „Złap 2 złote liście”, kózki), „Okno: Poznaj Sowi Świat”; „Jeszcze raz” zaczyna nowy bieg;
- **Gesty**: pole sięgające krawędzi ekranu (`.lab-stage`, `touch-action: none`) z płótnem: różowe pasy martwych stref (18 px po bokach, 20 px + pasek domowy u dołu, podpis „martwa strefa”), zielony ślad palca, żółty błysk przy dotknięciu; nazwa ostatniego gestu (`[data-last-gesture]`: Stuknięcie, Przytrzymanie, Koniec przytrzymania, Przesunięcie w lewo/prawo/górę/dół, Przeciąganie, Koniec przeciągania, Martwa strefa (gest pominięty), Pauza (klawisz P)) i dziennik 6 ostatnich gestów z godziną; w tym dziale działa auto-pauza (jak w grze);
- **Informacje**: płynność, ekran CSS, widoczny obszar (`visualViewport`), DPR (i DPR rysowania), bezpieczne obszary, tryb (aplikacja / przeglądarka), praca bez zasięgu (czy service worker kontroluje stronę), sieć, stan zapisu w chmurze, oszczędzanie baterii; przyciski: „Test pauzy i odliczania”, „Oszczędzanie baterii” (przełącznik), „Pokaż propozycję oszczędzania”, „Pokaż bezpieczne obszary” (czerwone ramki wg `env(safe-area-inset-*)`);
- `window.SowieLab = { loop, shell, view, characters, atlas, soundReady, interface() }` — dostęp dla testów (`characters.cosmetic()`, `characters.setCosmetic(klucz)`, `atlas.has(nazwa)`, `(await soundReady).audio`, `interface()` → `{ hud, toasts, pause, results, shell, state() }`).

## Profil (Firestore: `sowiegry/profil`)

Jedyny profil gracza (Analiza 1, rozdział 4.1), wczytywany i zapisywany przez `SowieCloud`:

```text
schemaVersion: 1, name: "Sowa", createdAt, updatedAt, lastSeenAt (znaczniki czasu serwera)
settings:  { music, sfx, quips, reducedEffects,
             batterySaver (E2a), volumeMaster, volumeMusic, volumeSfx, vibration (E2c) — nowe klucze opcjonalne }
cosmetics: { unlocked: ["none", "bow", …], selected: "none" }
missions:  { leaves20: { progress, target, done, reward }, … }
stats:     { leaves, nearMisses, extraLives, finishes, maxCombo }
academy:   { xp, feathers, metrics, daily, weekly, awards, version, updatedAt }
gallery:   { unlocked, viewed, favorite, version, updatedAt }
records:   { runner: { runs, lastPlayedAt, chill|arcade|chaos: { bestScore, bestDistance } },
             jumper: { …, bestScore, bestHeight }, sowa3: { …, bestScore },
             ogrody: { lifetimeLeaves, prestiges, zone }, szklarnia: { lifetimeLeaves, rooms, hybrids } }
```

Dokumenty gier: `sowiegry/profil/sowiegry_gry/{runner|jumper|sowa3|ogrody|szklarnia}` (`difficulty`, `finishSeen`, `top10`, `dailyBest`, `daily`, `traitAlbum`, `historyCount`; Sowia Ucieczka od E4d także `tasks` — zadania biegu i Sowi mnożnik, od E4e `tutorialDone` — samouczek ukończony; gry idle: `state`, `saveVersion`, `summary`, `savedAt`, `clientSavedAt`, `rev`, `deviceId`) i historia `…/sowiegry_historia/{autoId}`. Profil ma 12–15 pól najwyższego poziomu (reguły dopuszczają 30).

## Kosmetyki

Dostępne warianty: brak, kokardka, okulary, wianek, kapelusz ogrodnika, czapka z daszkiem, szalik, plecak, ślad bąbelków. Na start odblokowane: brak i kokardka. Kosmetyki nie wpływają na hitboxy ani parametry mechaniczne.

## Misje

20 liści, dodatkowe życie, 3 uniki „O włos!”, ukończenie etapu `Chaos`, combo `×4`, 1000 m w Sowiej Ucieczce (`runner1000`), 250 m w `SowaJumper`. Nagrodami są kosmetyki. Obecne gry posuwają misje przez `SowieCore.progressMission` / `recordStat`, a przebudowane gry — przez zdarzenia SowieProgress i `shared/meta/missions.js` (niżej).

## Audio

Audio jest generowane przez Web Audio API bez zewnętrznych plików (efekty i prosta pętla muzyczna). Ustawienia: muzyka, efekty, komentarze sowy, ograniczone efekty wizualne. Każda gra rejestruje własny motyw muzyczny przez `SowieCore.registerGame()`.

## Systemy rozgrywki

Gry zręcznościowe mają poziomy `Chill`, `Arcade`, `Chaos` (rekordy osobno dla każdego), dodatkowe życia, zabezpieczenia przed niemożliwymi układami, combo, near miss, zwykłe, złote i tęczowe liście, gorączkę monster, animacje sowy, piórka i gwiazdki, wspólny profil, pauzę, audio i debug. Każda gra startuje rozgrywkę dopiero po `SowieCloud.ready` (postęp wczytany). Szczegóły w dokumentacji poszczególnych gier.

## Sowa3 — zasada czytelności

Dekoracje są dopuszczalne tylko po bokach ekranu, wysoko nad horyzontem i poza perspektywicznym korytarzem torów. `visibility-corridor.js` ponownie rysuje czystą trasę po wszystkich warstwach scenografii. Ruch ludzi i dzików kontroluje `moving-obstacle-safety.js` (anuluje zmianę toru, gdy tor docelowy jest zajęty, ruch zamknąłby trzy pasy albo ostrzeżenie pojawiłoby się zbyt późno).

## Testy

### `npm test`

Pełny zestaw uruchamiany przed każdym wypchnięciem na `main` i w CI (`.github/workflows/js-check.yml`):

| Krok                    | Skrypt                                       | Co sprawdza                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| składnia                | `npm run syntax` (`scripts/check-syntax.sh`) | `node --check` dla każdego pliku `.js` poza `node_modules/`, `.git/`, `playwright-report/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| lint                    | `npm run lint`                               | ESLint 9 (`eslint.config.js`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| formatowanie            | `npm run format:check`                       | Prettier 3 (`.prettierrc.json`: szerokość 120, 2 spacje, średniki, cudzysłowy podwójne, przecinki końcowe) dla plików konfiguracyjnych, `firebase.json`, `manifest.webmanifest`, `sw.js`, `shared/engine/`, `shared/world/`, `shared/ui/`, `shared/meta/`, `shared/menu/`, `SowiaUcieczka/`, `SowieTory/` i `SowaWChmurach/` (także HTML, CSS i dokumentacja gier), `lab/main.js`, `lab/characters.js`, `lab/sound.js`, `lab/interface.js`, `lab/lab.css`, `scripts/make-icons.cjs`, `scripts/make-audio.mjs`, `assets/audio/audio.json`, workflow i katalogów `tests/e2e`, `tests/unit`, `tests/rules` |
| HTML                    | `npm run html`                               | `html-validate` (`.htmlvalidate.json`) dla `index.html`, stron pięciu gier, `lab/index.html`, `SowiaUcieczka/index.html`, `SowieTory/index.html`, `SowaWChmurach/index.html` i `tests/smoke.html`                                                                                                                                                                                                                                                                                                                                                                                                                         |
| jednostkowe             | `npm run test:unit`                          | `node --test tests/unit/*.test.mjs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| reguły i przeglądarkowe | `npm run test:e2e`                           | emulator Firestore: `firebase emulators:exec --only firestore --project demo-sowiegry "npm run test:rules && playwright test"` — najpierw testy reguł (`test:rules` = `node --test tests/rules/*.test.mjs`, wymaga działającego emulatora), potem Playwright                                                                                                                                                                                                                                                                                                          |

Zależności deweloperskie są przypięte tam, gdzie wersja wpływa na przeglądarki, emulator i SDK: `@playwright/test` **1.56.1** (Chromium 141, rewizja 1194), `firebase-tools` **15.31.0**, `firebase` **12.19.0** (ta sama wersja SDK co w `shared/sowie-cloud.js`; pliki `firebase-app.js` i `firebase-firestore.js` z pakietu npm są bajt w bajt identyczne z plikami na gstatic) , `@firebase/rules-unit-testing` **5.0.2** i `@breezystack/lamejs` **1.2.7** (kodowanie MP3 w `scripts/make-audio.mjs`). Pozostałe (`eslint`, `globals`, `html-validate`, `http-server`, `prettier`) mają zakresy `^`. `package-lock.json` nie jest wersjonowany (`.gitignore`).

### Playwright (`playwright.config.js`)

- serwer: `npm run serve` (`http-server . -p 4173 -c-1`), adres bazowy `http://127.0.0.1:4173`;
- `fullyParallel: false`, w CI 2 procesy i 1 ponowienie, raport `list` + `html` (`playwright-report/`), ślad, zrzut ekranu i wideo zachowywane tylko przy błędzie;
- projekt `desktop-chromium` (`devices["Desktop Chrome"]`) uruchamia testy obecnych gier z `tests/e2e/*.spec.js` (bez katalogu `telefon/`);
- projekty telefonów uruchamiają testy z `tests/e2e/telefon/`. Każdy profil biegnie w dwóch silnikach — Chromium i WebKit (Safari) — więc powstaje 10 projektów o nazwach `telefon-<profil>-<silnik>`:

| Profil              | Źródło                                                           | Ekran CSS                     |
| ------------------- | ---------------------------------------------------------------- | ----------------------------- |
| `iphone-se`         | `devices["iPhone SE"]`                                           | 320 × 568                     |
| `iphone-13`         | `devices["iPhone 13"]`                                           | 390 × 664 (okno przeglądarki) |
| `pixel-7`           | `devices["Pixel 7"]`                                             | 412 × 839                     |
| `android-360x800`   | własny: 360 × 800, DPR 3, `isMobile`, `hasTouch`, UA Androida 14 | 360 × 800                     |
| `iphone-13-poziomo` | `devices["iPhone 13 landscape"]`                                 | 750 × 342                     |

- `serviceWorkers: "block"` — w testach service worker (PWA) nie jest rejestrowany i nie przechwytuje żądań; test PWA włącza go jawnie (`test.use({ serviceWorkers: "allow" })`);
- zmienna `SOWIE_E2E_BEZ_WEBKIT=1` pomija projekty WebKit **tylko lokalnie** (np. w środowisku bez przeglądarki WebKit) i wypisuje ostrzeżenie; przy ustawionym `CI` zmienna jest ignorowana, więc w CI WebKit biegnie zawsze.

### Wspólne fikstury (`tests/e2e/fixtures.js`)

- `test` — rozszerzony `test` Playwright z automatyczną fiksturą `productionRequests`: w każdym kontekście przeglądarki przerywa żądania do `firestore.googleapis.com`, `firebaseinstallations.googleapis.com`, `identitytoolkit.googleapis.com` i `securetoken.googleapis.com`, a po teście sprawdza, że żadne takie żądanie nie wystąpiło. To bezpiecznik: testy nigdy nie łączą się z produkcyjną bazą (współdzieloną z innym projektem);
- ta sama fikstura podaje pliki SDK `https://www.gstatic.com/firebasejs/12.19.0/*.js` z `node_modules/firebase/` (`route.fulfill`, typ `text/javascript`, nagłówek `Access-Control-Allow-Origin: *` — dynamiczny import modułu z innej domeny wymaga CORS). Pliki z pakietu npm są identyczne z gstatic, więc testy są niezależne od sieci i CDN, a produkcja nadal ładuje SDK z gstatic;
- opcja `odblokowane` (domyślnie `true`): skrypt startowy kontekstu zapisuje `sowiegry:urzadzenie = { unlocked: true, deviceId: "d-…", cleaned: true }` (tylko gdy klucza jeszcze nie ma), więc testy nie muszą wpisywać hasła; testy ekranu hasła ustawiają `test.use({ odblokowane: false })`;
- `blockProduction(context, lista)` — ta sama blokada (i podawanie SDK) dla dodatkowych kontekstów tworzonych w teście;
- `unlockDevice(context)` — zapamiętane odblokowanie z unikalnym `deviceId`;
- `newDevice(browser, opcje)` — nowy kontekst przeglądarki = „drugie urządzenie” (własny `localStorage` i IndexedDB), z blokadą produkcji i odblokowaniem;
- `waitForCloud(page)` — czeka, aż `SowieCloud.isReady()` zwróci `true` (do 20 s);
- `setVisibility(page, "hidden" | "visible")` — symuluje przejście telefonu do innej aplikacji i powrót (podmienia `document.visibilityState` / `document.hidden` i wysyła `visibilitychange`);
- `swipe(page, from, to, steps = 4)` — przesunięcie palcem od `from` do `to` (`{ x, y }` w px okna): w jednym `page.evaluate` wysyła do elementu pod punktem startu (`document.elementFromPoint`) `pointerdown`, `steps` × `pointermove` (równe odcinki) i `pointerup` jako `PointerEvent` (`pointerId: 9`, `pointerType: "touch"`, `isPrimary`, `bubbles`, `cancelable`). Swipe musi się zmieścić w 200 ms (`shared/engine/input.js`), a `page.mouse.move(…, { steps })` pod obciążeniem (równoległe testy) trwał nawet 250 ms — gra słusznie uznawała go wtedy za przeciąganie. Używają go testy Laboratorium, Sowiej Ucieczki (ślizg w samouczku) i Sowich Torów;
- `watchErrors(page)` — zbiera `pageerror`, błędy konsoli i odpowiedzi HTTP ≥ 400 (bez `favicon.ico`);
- automatyczna fikstura `webAudioTrace` (tylko WebKit) — skrypt startowy kontekstu `traceWebAudio(context)` opakowuje `AudioBufferSourceNode.prototype.start/stop` (wpis przed i po wywołaniu, tylko bufory dłuższe niż 3 s — muzyka), `decodeAudioData` (wpis przy nagraniach > 50 000 B i po zdekodowaniu: długość, częstotliwość albo błąd), `AudioContext.prototype.resume/suspend` (ze stanem kontekstu) i co sekundę zapisuje „strona żyje”; wszystko przez `console.debug("[webaudio <czas> ms] …")`, bez zmiany działania. Ślad nieudanego testu pokazuje, co działo się tuż przed ewentualnym zawieszeniem strony (diagnostyka zawieszeń WebKit w CI po starcie muzyki). W CI krok testów przeglądarkowych ma też `DEBUG=pw:browser` — wyjście procesów przeglądarek trafia do logu zadania.

### Pomocnicy emulatora (`tests/e2e/emulator.js`)

- `uniqueProject(testInfo)` — identyfikator projektu `demo-sowiegry-<proces>-<numer>-<czas><losowe>` dla izolacji testów;
- `cloudUrl(ścieżka, projekt)` — dopisuje `cloud=emulator&projekt=…`;
- `readDoc`, `listDocs`, `seedDoc` — odczyt, lista i zapis dokumentów przez REST emulatora (`http://127.0.0.1:8080/v1/projects/…/documents/…`, nagłówek `Authorization: Bearer owner` omija reguły), z konwersją typów Firestore ↔ JSON (znaczniki czasu → milisekundy).

### Testy obecnych gier (desktop, `tests/e2e/*.spec.js`)

- `smoke.spec.js` — menu z 5 kartami i 4 zakładkami (wybrana „Gry”), każda gra startuje po wczytaniu postępu (Sowia Ucieczka — po `SowiaUcieczka.ready()` Spacja, `screen() === "playing"`, bez `SowieCore`; Jumper `state.scene === "playing"`, Sowa3 `state.mode === "run"`, gry idle — licznik kliknięć), profil z `SowieCloud` (`schemaVersion: 1`), wspólne powiadomienia;
- `guides-and-expansion.spec.js` — menu: 5 przycisków „Jak grać?”, brak starych przycisków `#academyButton` / `#galleryButton`, okno „Jak grać — Sowia Ucieczka” z kartą „Szybowanie”, Escape zamyka i oddaje fokus; instrukcje, Akademia i panele rozszerzeń w każdej obecnej grze (SowaJumper, Sowa3, Ogrody, Szklarnia; Sowia Ucieczka ma własną instrukcję, zadania i wyzwanie dnia — `ucieczka.spec.js`); idempotentne nagrody Akademii i ich widok w zakładce „Sowa” (4 zadania, w tym tygodniowe, piórka w profilu);
- `owl-gallery.spec.js` — zakładka „Galeria”: licznik „1 / 30”, 29 zablokowanych z paskiem postępu i wymaganiem, miniatura `-400.webp`, „Nowe!”, filtry (29 / 1 / 30), przeglądarka „1 / 1” z linkiem Pexels, „Ulubione” i „Tło menu” (`body.has-photo`, `profil.gallery.favorite/background/viewed`), Escape oddaje fokus kafelkowi bez „Nowe!” i z serduszkiem; profil z osiągnięciami zapisany wcześniej w emulatorze odblokowuje 30 zdjęć (licznik „30 / 30”, przeglądarka: → „2 / 30”, dwa razy „Poprzednie” → „30 / 30”) i zapisuje je w bazie; galeria dostępna z każdej obecnej gry (okno; w Sowiej Ucieczce Galeria jest w zakładce menu głównego);
- `platform.spec.js` — kasowanie wyłącznie starych kluczy SowieGry (dane innych stron zostają, zostaje `sowiegry:urzadzenie`), zapis stanu Ogrodów i Szklarni w emulatorze przy zejściu do tła i odtworzenie po przeładowaniu, stabilny panel Szklarni, modal z fokusem, ustawienia (stan zapisu, zapis ustawienia w bazie, „Wyloguj to urządzenie”), ograniczenie ruchu (chmury menu bez animacji, `SowieMenu.animating() === false` po zbudowaniu atlasu).

### Testy na telefonach (`tests/e2e/telefon/`)

`ucieczka.spec.js` (E4 — Sowia Ucieczka): opis w `SowiaUcieczka/docs/Documentation.md`, rozdział „Testy”.

`tory.spec.js` (E5 — Sowie Tory, podgląd): opis w `SowieTory/docs/Documentation.md`, rozdział „Testy”.

`chmury.spec.js` (E6 — Sowa w Chmurach, podgląd): opis w `SowaWChmurach/docs/Documentation.md`, rozdział „Testy” (tam też testy jednostkowe `tests/unit/chmury.test.mjs`, `tests/unit/chmury-przeszkody.test.mjs`, `tests/unit/chmury-dodatki.test.mjs`, `tests/unit/chmury-ocean.test.mjs`, `tests/unit/chmury-strefy.test.mjs` i `tests/unit/chmury-samouczek.test.mjs`).

`menu.spec.js` (E3 — „Gotowe, gdy” z Analizy 3):

- zakładka „Gry”: 5 kart z nazwami z rejestru, szkielet rekordu znika po wczytaniu chmury („Jeszcze bez rekordu…”), karta „runner” — „Graj” do `SowiaUcieczka/`, znaczek „Nowe!”; karta Sowa3 — „Graj” do `Sowa3/` i odnośnik podglądu `[data-preview="sowa3"]` „Wypróbuj nową wersję: Sowie Tory” do `SowieTory/`; karta SowaJumper — „Graj” do `SowaJumper/` i odnośnik `[data-preview="jumper"]` „Wypróbuj nową wersję: Sowa w Chmurach” do `SowaWChmurach/`; karta Sowich Ogrodów — „Graj” do `SowieOgrody/` i odnośnik `[data-preview="ogrody"]` „Wypróbuj nową wersję: nowe Sowie Ogrody” do `SowieOgrody/nowa.html` (razem trzy odnośniki podglądu); atlas gotowy i narysowane klatki; „Graj” otwiera `/SowiaUcieczka/` z planszą, a stuknięcie nie pobiera żadnych dźwięków;
- emulator: rekordy zapisane w `sowiegry/profil` pokazują się na kartach („Rekord: 1250 m”, „Rekord: 15 300 pkt”, „Liście: 4200”, bez rekordu dla SowaJumper);
- emulator, gra z trybami: karta Sowa3 pokazuje rekord kampanii (4100 pkt), okno „Rekordy — Sowa3” ma chipy „Kampania” (wybrana) i „Nieskończony” — po przełączeniu najlepszy wynik 9900 pkt, „Top 10 — Nieskończony, Arcade” z jednym wierszem;
- instrukcje: „Jak grać?” na karcie → okno „Jak grać — SowaJumper” (5 kart, 1 demonstracja gestu), „Rozumiem” oddaje fokus; zakładka „Jak grać”: 6 sekcji (pierwsza „Poznaj Sowi Świat”), 7 demonstracji gestów (w tym 3 w sekcji Sowiej Ucieczki `#jak-grac-runner`);
- odnośnik `#jak-grac-sowa3` otwiera zakładkę i sekcję Sowa3 w widoku; klawiatura na pasku zakładek (→, End, Home) z adresem `#galeria` i bez `#` dla „Gry”;
- galeria: dwa cele Akademii (1500 m, 300 m) odblokowują zdjęcia → „3 / 30”, 3 „Nowe!”, 27 zablokowanych z kłódką i paskiem; przeglądarka: przesunięcie w lewo → „2 / 3”, w prawo → „1 / 3”, podwójne stuknięcie → powiększenie 2,5×, kolejne → 1×, przesunięcie w dół zamyka; zostaje 1 „Nowe!” (gesty jako zdarzenia `PointerEvent` na scenie — tak samo w Chromium i WebKit);
- zakładka „Sowa”: przycisk ustawień w nagłówku otwiera zakładkę z fokusem na `#ustawienia`; „Kokardka” wybrana, „Okulary” zablokowane z podpowiedzią „Zbierz 20 liści monster (0 / 20)”; Tryb Przytulny, Efekty (klasa `sowie-reduced-effects`), suwak muzyki 0 → profil `{ cosmetics.selected: "bow", cozy: true, reducedEffects: true, volumeMusic: 0, music: false }`; okno „Rekordy — SowaRunner” z chipem Chaos; „Wyloguj to urządzenie” → „Anuluj” zostawia, „Wyloguj” przeładowuje stronę z ekranem hasła (`unlocked: false`);
- 320 × 568: w każdej zakładce brak przewijania w bok i żadnego przycisku, odnośnika, suwaka ani zakładki mniejszego niż 48 × 48 px.

`start.spec.js`:

- menu główne i każda z pięciu gier otwiera się bez błędów (znacznik strony widoczny, brak błędów po 0,5 s);
- stary adres `/SowaRunner/?daily=1` kończy na `/SowiaUcieczka/?daily=1` (nagłówek „Sowia Ucieczka”, notka wyzwania dnia), bez błędów;
- menu główne mieści się w szerokości ekranu (`scrollWidth ≤ innerWidth`).

`chmura.spec.js` (Analiza 3, zadanie 1.9):

- ekran „Hasło sowy”: atrybuty pola (`autocapitalize`, `autocorrect`, `spellcheck`, `enterkeyhint`), czcionka ≥ 16 px, przycisk „Wejdź” ≥ 48 px, w całości na ekranie i w dolnej połowie, pole, oczko i przycisk w całości w szerokości ekranu, brak przewijania w bok i powiększenia po dotknięciu pola, błąd dla „hu hu”, oczko, wejście przez „ Huhu ” + Enter, w `localStorage` tylko `sowiegry:urzadzenie`, po przeładowaniu brak ekranu hasła;
- pisanie hasła (ze spacjami) na stronie Sowiej Ucieczki nie uruchamia gry (ekran hasła przykrywa przycisk Start, ekran tytułowy zostaje); po wejściu stuknięcie w „Start” zaczyna bieg;
- emulator: pierwsze połączenie tworzy `sowiegry/meta` (schemaVersion 1, 5 gier, `createdAt`) i `sowiegry/profil`; status `online`;
- emulator: koniec gry w SowaJumper zapisuje rekord (`records.jumper.arcade`, `runs`, `top10`, historia), a **drugi kontekst przeglądarki (drugie urządzenie)** widzi ten rekord w `SowieCloud.records` i na ekranie gry;
- emulator: zejście do tła zapisuje stan Ogrodów od razu, a powrót po 10 minutach pokazuje okno postępu offline;
- ekran hasła przykrywa dok przycisków gry (instrukcja, rekordy, galeria).

`interfejs.spec.js` (E2d, `lab/?dzial=interfejs`):

- HUD: pauza ≥ 48 px w lewej części planszy; liście (10 + 50 pkt) → wynik „60”, liście „6”; kózka → licznik „Tarcza”; „5 komunikatów naraz” → widoczny 1 komunikat (kolejka ≤ 3), w górnych 45% planszy; tarcza chroni przed trafieniem, kolejne odbiera życie („Życia: 2 z 3”); `SowieProgress.current()` liczy liście (1 zielony + 5 ze złotego), kózkę i trafienie; brak przewijania w bok;
- menu pauzy: „Wznów” ≥ 56 px, pozostałe ≥ 48 px, powłoka w stanie `paused`; Ustawienia: suwak muzyki 40 → `settings.volumeMusic`, Tryb Przytulny → `settings.cozy`; Garderoba: „Kokardka” → `cosmetics.selected = "bow"`; „Jak grać” → okno „Jak grać — Poznaj Sowi Świat” z 7 kartami; „Wznów” → cyfra 3, potem `running`; auto-pauza po przejściu w tło otwiera menu z „Witaj z powrotem”;
- ekran wyników: wynik 50, „Nowy rekord!”, „1. miejsce”, 2 zadania, „Jeszcze raz” ≥ 56 px zaczyna nowy bieg (wynik 0).

`komunikaty.spec.js` (E2d, SowaJumper, Sowa3; od E4f też Sowia Ucieczka):

- po starcie gry (Spacja) `SowieCore.isPlaying()` = `true`, klasa `sowie-arcade`; 3 komunikaty → widoczny 1 („O włos nad Amic! +25”), 2 w kolejce; komunikat w górnych 45% ekranu i w całości w jego szerokości (także telefon poziomo); dotknięcie ⏸ na pasku narzędzi pauzuje grę, a w pauzie widać 2 komunikaty; Sowia Ucieczka (`shared/ui/toasts.js`): po starcie kózka Tarcza, kózka Magnes i trafienie (pochłonięte przez Tarczę) → widoczny 1 komunikat („Kózka Tarcza…”), w górnych 45% ekranu i w całości w jego szerokości, kolejne pokazują się po kolei („Kózka Magnes”).

`dzwiek.spec.js` (E2c, `lab/?dzial=dzwiek`):

- przed dotknięciem status „czeka na dotknięcie”; wszystkie przyciski dźwięku (co najmniej 29) mają ≥ 48 px; dotknięcie „Skok” odblokowuje dźwięk („Dźwięk: działa”), gra efekt (`stats().played ≥ 1`), wczytuje co najmniej 25 efektów bez błędów dekodowania (`failed = 0`);
- „Motyw menu” gra w pętli (`currentMusic() === "menu"`, kontekst `running`), ściszanie włącza się i wyłącza, „Pieśń humbaka” zastępuje motyw menu, „Zatrzymaj muzykę”;
- suwak muzyki na 35 → silnik `volume("music") === 35` i profil `settings.volumeMusic === 35`; „Seria liści (combo)” gra 8 efektów; brak przewijania w bok i błędów.

`postacie.spec.js` (E2b):

- Laboratorium otwiera się w dziale „Postacie”; status „Atlas gotowy”; każda nazwa z `SPRITES` jest w atlasie (co najmniej 50); `document.fonts.check('700 16px "Fredoka"', "Zażółć")`; każde z 7 płócien ma narysowane piksele; przycisk „Kokardka” (≥ 44 px) zmienia dodatek (`characters.cosmetic() === "bow"`); brak przewijania w bok i błędów.

`laboratorium.spec.js` (E2a, otwiera `lab/?dzial=gesty`):

- gesty w Laboratorium: stuknięcie, przesunięcia w 4 kierunkach, przytrzymanie, pominięcie gestu od lewej krawędzi, przy prawej krawędzi i przy pasku domowym; brak przewijania w bok;
- auto-pauza po przejściu w tło (okno „Pauza” z „Witaj z powrotem”, pętla zatrzymana), przycisk „Graj dalej” ≥ 48 px w dolnej połowie, odliczanie 3 → 2 → 1 → wznowienie (kolejne cyfry zapisuje `MutationObserver` w stronie, więc wynik nie zależy od tempa sprawdzania przez test);
- dział „Informacje”: płynność, bezpieczne obszary, tryb przeglądarki; „Oszczędzanie baterii” włącza 30 kl./s i zapisuje `settings.batterySaver` w profilu; propozycja oszczędzania i test pauzy.

`pwa.spec.js` (E2a, `serviceWorkers: "allow"`):

- po pierwszej wizycie service worker kontroluje stronę, a pamięć bieżącej wersji zawiera wszystkie pliki z listy `SHELL` (wersja i lista czytane wprost z `sw.js`);
- w Chromium dodatkowo: bez sieci (`context.setOffline(true)`) menu ładuje się z pamięci podręcznej (5 kart gier, 4 zakładki, atlas postaci z SVG w pamięci), bez błędów. Playwright w WebKit nie potrafi przeładować strony offline przez service worker (błąd „WebKit encountered an internal error”), dlatego na profilach WebKit test kończy się na sprawdzeniu zawartości pamięci podręcznej.

`rekordy.spec.js`:

- emulator, SowaJumper z `?daily=1`: dwie rozgrywki → okno 🏆 pokazuje najlepszy wynik, top 10 (2 wpisy), ostatnie gry (z oznaczeniem wyzwania dnia) i rekord dnia; poziom Chaos ma osobne, puste rekordy;
- Sowie Ogrody: okno 🏆 pokazuje podsumowanie gry idle; Escape zamyka.

### Emulator Firestore

- `firebase.json` konfiguruje **wyłącznie emulator**: reguły z `firestore.rules`, emulator Firestore na `127.0.0.1:8080`, wyłączony interfejs emulatora (`ui.enabled: false`), `singleProjectMode: false`. Nie ma pliku `.firebaserc`, więc narzędzie nie ma domyślnego projektu produkcyjnego; reguły produkcyjne publikuje właściciel ręcznie w konsoli;
- `npm run emulator -- "<polecenie>"` uruchamia dowolne polecenie z działającym emulatorem projektu `demo-sowiegry` (projekty z przedrostkiem `demo-` nigdy nie łączą się z usługami Google);
- emulator stosuje reguły z `firestore.rules` do każdego identyfikatora projektu, co pozwala izolować testy osobnymi projektami `demo-sowiegry-…`;
- emulator wymaga Javy 11+ (w CI: `actions/setup-java`, Temurin 21) i przy pierwszym uruchomieniu pobiera plik JAR do `~/.cache/firebase/emulators` (w CI ten katalog jest w `actions/cache`);
- logi emulatora trafiają do `firestore-debug.log` (ignorowany przez git, dołączany do artefaktów CI przy błędzie).

### Testy silnika i PWA (`tests/unit/engine.test.mjs`, `tests/unit/pwa.test.mjs`)

- RNG zgodny z algorytmem `SowiePlatform` i powtarzalny; pętla: 120 kroków na sekundę przy 60 kl./s, `alpha` w [0, 1), pauza, limit 0,25 s po przerwie, brak spirali śmierci, 30 kl./s w oszczędzaniu baterii; pula; kolizje; animacje i funkcje łagodzenia; cząsteczki (limit, gęstość); widok (skala 40 dla 360 × 800 i świata 9 × 16, DPR max 2, stała skala przy pasku adresu, nowa przy obrocie, odwrotność przekształceń); kamera; gesty (stuknięcie, przytrzymanie, 4 kierunki swipe, przeciąganie, przytrzymanie → przeciąganie, martwe strefy, drugi palec, klawisze); sceny; monitor płynności; auto-pauza z odliczaniem;
- PWA: pola manifestu i rozmiary ikon PNG, manifest i rejestracja na każdej stronie, `VERSION`, istnienie plików z `SHELL`, wszystkie skrypty i style menu w `SHELL`, SDK w pamięci, brak obsługi Firestore, usuwanie starych wersji; od E3 — cały graf modułów ES od `shared/menu/menu.js`, czcionki z `tokens.css`, 48 plików SVG z katalogu, `audio.json` i efekty `MENU_SOUNDS` w `SHELL`.

### Testy nowej odsłony Sowich Ogrodów (`tests/unit/ogrody-ekonomia.test.mjs`, `tests/unit/ogrody-zdarzenia.test.mjs`, `tests/e2e/telefon/ogrody-nowe.spec.js`, E7)

Opis w `SowieOgrody/docs/Documentation.md`, rozdział „Nowa odsłona” → „Testy (E7a, E7b, E7c1)”: ekonomia, silnik ogrodu, migracja stanu v2 → v3, zdarzenia aktywnej gry (telefon Pracu, ciężarówka Amic, złota kózka, Plusk-o-metr, Zatoka Humbaka) i symulator tempa ze zdarzeniami (pierwsze Wielkie Przesadzanie po 2–3 h aktywnej gry); e2e strony podglądu `SowieOgrody/nowa.html` — stuknięcia, zakupy, cele, zakładki, konewka, przeniesienie stanu v2 z zapisem w polu `preview` (emulator), powrót z tła, najmniejszy telefon.

### Testy Sowiej Ucieczki (`tests/unit/ucieczka.test.mjs`, E4)

Fizyka, kamera i czas reakcji ≥ 1,1 s, przeszkody, 37 wzorów (każdy do przejścia przy 4,25 / 7 / 11,55 j./s — przeszukiwanie wszerz ruchów), generator, Chmura Pracu, combo, dotyk; od E4c kózki (rozstaw i 5 efektów), Gorączka Monster, Plusk-o-metr i „Rejs na humbaku”, 6 biomów z przenikaniem i szybszymi okrążeniami. Szczegóły: `SowiaUcieczka/docs/Documentation.md`, rozdział „Testy”. Plik biegnie ok. 30 s (przeszukiwanie wzorów).

`tests/unit/ucieczka-samouczek.test.mjs` (E4e): samouczek pierwszego uruchomienia (`SowiaUcieczka/tutorial.js`) — bot ruszający się tylko po podpowiedziach przechodzi go bez trafień na każdym poziomie.

`tests/unit/ucieczka-zadania.test.mjs` (E4d): zadania biegu i Sowi mnożnik (`SowiaUcieczka/tasks.js`) oraz punktacja z mnożnikiem, „Idealnie!” i zdarzenie mijania przeszkody dołem / górą.

### Testy menu (`tests/unit/menu.test.mjs`, E3)

- `MENU_GAMES` ma wpis dla każdej gry rejestru (przystanek, opis > 20 znaków, 2 kolory biomu);
- `recordText`: najlepszy ze wszystkich poziomów („Rekord: 1250 m”, „Rekord: 15 300 pkt”), „Liście: 123 456”, „Pomieszczenia: 4”, brak danych → `null`;
- `cosmeticHint`: „Zbierz 20 liści monster (12 / 20)”, pusty dla „Bez dodatku”; każda misja z `DEFAULT_MISSIONS` ma opis;
- `CLOUD_STATUS` dla 6 statusów, „Tryb testowy” w pamięci, „(emulator)”, „Zapisano”;
- `isIos`: iPhone, iPadOS jako „MacIntel” z dotykiem, Android nie;
- `menu.css`: przyciski ikon, przyciski, chipy, chipy garderoby i zakładki mają wysokość ≥ 48 px.

### Testy SowieProgress i instrukcji (`tests/unit/meta.test.mjs`)

- most do Akademii: metryki dla końca biegu w Runner / Jumper / Sowa3, postępu Ogrodów i Szklarni, wizyty; brak wywołań bez wartości i dla nieznanej gry;
- `taskProgress`: misja `max`, misja `delta` z `baseline`, misja tygodnia, brak migawki;
- `createProgress`: błędy (bez `beginRun`, nieznane zdarzenie), liczniki biegu (liście z `count`, punkty, kózki, trafienia, uniki, combo max, gorączka, humbak), nagroda, czas biegu, wywołania Akademii, zadania z `advanced` i `newlyDone`, słuchacze `*` i odłączanie;
- `guides-data`: każdy przewodnik poprawny (grafiki z katalogu), 7 kart „Poznaj Sowi Świat”, błędy dla nieznanego gestu i grafiki.
- instrukcje obecnych gier: każda gra z rejestru ma przewodnik (4–6 kart, pierwsza „Cel gry”, karta z gestem), `GUIDE_ORDER`, zachowana treść (np. „podwójnego skoku”, „SIO! SIO!”), `shared/game-guides.js` nie ma już własnej kopii i wczytuje `meta/guides-data.js`.

### Testy galerii (`tests/unit/owl-gallery.test.mjs`, uzupełnienie E3)

- `shared/owl-gallery.js` uruchamiany w piaskownicy `node:vm` (atrapa `window`/`document`): 30 zdjęć z listą `goals` (źródła `level`, `feathers` albo metryka; progi > 0), `owl-01` bez celów, `progressOf` (jeden cel — 0,5; dwa cele — średnia 0,75 i szczegóły; 5 celów wizyt; nieznane id → `null`);
- miniatury: dla każdego zdjęcia pliki 400 i 600 px z nagłówkiem RIFF/WEBP pod adresem z `thumbUrl`, razem 60 plików, miniatury 400 px poniżej 1 MB.
- menu i gry ładują `owl-gallery.js`; `owl-gallery.css` (okno galerii) tylko gry, menu ma zakładkę z miniaturami 400 px.

### Testy dźwięku (`tests/unit/audio.test.mjs`)

- manifest: co najmniej 25 efektów (w tym skok, liść, trafienia, kózka, plusk, rekord, koniec gry, odliczanie, klik, połączenie, zakup), muzyka: dokładnie `chmury`, `humbak`, `menu`, `tory-amic`, `tory-biedronka`, `tory-festiwal`, `tory-prl`, `ucieczka`, każdy plik istnieje, ma rozmiar z manifestu i nagłówek MP3, `samples/44100 = duration`, głośność 0–1, podpis; pętle mają odcisk 4096 próbek; razem < 3 MB; `LICENSES.md` z CC0;
- Sowie Tory: motyw każdej planszy (`tory-<id>` dla plansz z `SowieTory/stages.js`) — pętla, 8 taktów według BPM, < 120 KB, plik wymieniony w `LICENSES.md`; efekty `GAME_SOUNDS` w manifeście; efekty gry + 4 motywy + `humbak` < 800 KB;
- Sowa w Chmurach: motyw `chmury` — pętla, 100 BPM, 8 taktów, < 120 KB, plik w `LICENSES.md`; efekty `GAME_SOUNDS` w manifeście (z `humbak-plusk` i `humbak-piesn`), efekty gry + `chmury` + `humbak` < 800 KB;
- `volumeToGain`, `volumesFromSettings` (domyślne, własne, obcięcie, wyłączone szyny), `findOnset`, `loopPoints`, `trimToLoop` (2 kanały, okrążenie od próbki 2,4 → 2 przez 5,6 → 6 próbek, koniec bufora ogranicza okrążenie, oryginał gdy nie ma czego przycinać albo okrążenie jest za krótkie), `variedRate` (0,95–1,05);
- `alignByFingerprint` odnajduje przesunięcia 0, 529, 1105 i 1524 próbek co do próbki, a przy buforze 48 kHz z dokładnością 2 próbek;
- silnik na atrapie Web Audio: cisza przed odblokowaniem, wczytanie wszystkich efektów, `pitch`, odstęp `minGap`, limit głosów (zatrzymanie najstarszych), błąd dla nieznanej nazwy; muzyka w pętli z przenikaniem (źródło z `loop = true`, bez `loopStart`/`loopEnd`, `start(0)` bez przesunięcia), ściszanie, suwaki, ustawienia z profilu (wyłączone efekty = cisza), wibracje, wstrzymanie w tle; `audioSession.type = "ambient"`; brak Web Audio → `unlock()` = `false`.

### Testy Sowiego Świata (`tests/unit/world.test.mjs`)

- tokeny w `tokens.css` i `tokens.js` identyczne; kolory z Analizy 2; `cssName`, `font`;
- `@font-face` wskazuje dwa istniejące pliki WOFF2 (sygnatura `wOF2`), jest `OFL.txt`;
- każdy plik SVG (co najmniej 45): wymagany początek `<svg xmlns viewBox width height>`, brak `<text>`, `<image>`, `<script>`, `<foreignObject>`, `<style>`, adresów `http(s):`/`data:` i czystej czerni, wszystkie kolory `#…` z palety;
- katalog: pliki warstw istnieją, `viewBox` każdej warstwy = `box` grafiki, proporcje `size` = proporcje `box`, kotwice w [0, 1], nazwy `[a-z0-9-]`, napisy w kolorach palety; liczby postaci (5 kózek, 7 Pracu, 7 Amic, 3 liście, humbak, plusk, życia, gwiazdki, bąbelek);
- garderoba: klucze `COSMETIC_SPRITES` = 9 kluczy `COSMETICS` z `shared/sowie-platform.js`, każda nakładka jest w katalogu;
- animator sowy: odstępy mrugnięć 3–5 s, 6 klatek biegu, rozciągnięcie przy wybiciu i spłaszczenie po lądowaniu, gwiazdki, błąd dla nieznanej akcji, każda klatka w katalogu;
- `packShelves`: brak nakładania, granice stron, wiele stron, błąd dla zbyt dużej grafiki; `cellSize`; `sizeSvg`/`viewBoxOf`;
- `createAtlas` z atrapami płótna, wczytywania i rasteryzacji: wszystkie nazwy w atlasie, komórka sowy 96 × 96 przy 80 px/j., `draw` z właściwego wycinka i kotwicy, `false` dla nieznanej nazwy, `ensure` bez przebudowy przy zmianie < 15% i z przebudową przy większej.

### Test architektury (`tests/unit/architecture.test.mjs`)

- rejestr ma dokładnie 5 gier; menu generowane z rejestru (`shared/menu/games.js`: `platform.GAME_REGISTRY.map`, `index.html` bez kart w HTML, z modułem `shared/menu/menu.js`); `shared/main-menu.js` i `.css` usunięte, menu nie ładuje `sowie-core.js` ani `game-guides.js`; każda gra ładuje platformę i wspólne powiadomienia;
- **`localStorage` i `sessionStorage` występują tylko w `shared/sowie-cloud.js`** (przeszukiwane są rekursywnie wszystkie pliki `.js` w `shared/`, `config/`, `lab/`, folderach gier — od E4f `SowiaUcieczka/` zamiast `SowaRunner/`, od E5a `SowieTory/`, od E6a `SowaWChmurach/` — i `sw.js`);
- `shared/progress-reset.js` i `shared/idle-save-bridge.js` nie istnieją i nie są ładowane; platforma nie ma migracji, kopii, eksportu ani importu; ustawienia mają „Wyloguj to urządzenie”;
- każda strona ładuje `config/firebase-config.js`, `sowie-platform.js`, `sowie-cloud.js`, `password-gate.js` w tej kolejności i przed `sowie-core.js` (menu i Sowia Ucieczka: przed `sowie-academy.js`, a w menu `owl-gallery.js` przed `shared/menu/menu.js`); wspólny menedżer powiadomień i okno Rekordów (`records.js` po `game-guides.js`) — w obecnych grach (Sowia Ucieczka ma `main.js` jako moduł i komunikaty z `shared/ui/`);
- `SowaRunner/` zawiera tylko `index.html` i `docs/`: `<meta http-equiv="refresh" content="0; url=../SowiaUcieczka/">`, `location.replace` z `location.search` i `location.hash`, bez skryptów zewnętrznych; rejestr ma „Sowia Ucieczka” z `path: "SowiaUcieczka/"` i nie ma `SowaRunner/`;
- `sowie-cloud.js` nie czyści całej pamięci (`clear`), ma hasło `huhu`, klucz `sowiegry:urzadzenie`, przypiętą wersję SDK, nazwaną aplikację i cache IndexedDB; wszystkie ścieżki w kodzie leżą w kolekcjach `sowiegry`, `sowiegry_gry`, `sowiegry_historia`, a żaden inny plik nie używa Firestore;
- gry idle ładują stan przez `loadGameState`, zapisują przez `saveGameState`, udostępniają `SowieIdleGame` i nie mają warunku `now % 7000`.

### Testy jednostkowe konfiguracji (`tests/unit/firestore-rules.test.mjs`)

- `firestore.rules` musi być znak w znak identyczny z blokiem reguł z `Analizy/ANALIZA_1_Firestore_zapis_postepu.md`, rozdział 9.2 (reguły opublikowane 2026-09-27);
- `firebase.json` ma tylko klucze `firestore` i `emulators`, emulator na `127.0.0.1:8080`;
- `test:e2e` uruchamia testy reguł i Playwright w emulatorze projektu `demo-sowiegry`.

### CI (`.github/workflows/js-check.yml`)

Uruchamiany przy `push` na `main` i `audit/**` oraz przy `pull_request`, limit 40 minut. Kroki: checkout, Node 22, Java 21 (Temurin), cache emulatora, `npm install`, `npx playwright install --with-deps chromium webkit`, składnia, lint, formatowanie, HTML, testy jednostkowe, testy reguł i przeglądarkowe na emulatorze (z `DEBUG=pw:browser` — wyjście procesów przeglądarek w logu, diagnostyka zawieszeń WebKit), raport Playwright (zawsze) i `test-results` + `firestore-debug.log` (przy błędzie).

### Test uruchomieniowy w przeglądarce

`tests/smoke.html` ładuje gry w ukrytych ramkach i po 0,9 s sprawdza, czy każda gra ma swój element i API.

### Tryb debug

Parametr:

```text
?debug=1
```

wyświetla dane diagnostyczne konkretnej gry.

## Firebase / Firestore — stan konfiguracji (2026-09-27)

### `config/firebase-config.js`

Ustawia globalny obiekt `window.firebaseConfig` (bez `export`, żeby działał także z bibliotekami `firebase-*-compat`) dla projektu Firebase `rpg-dataslate-relay`. Projekt i baza Firestore są **współdzielone z innym projektem właściciela** (kolekcje `audio`, `character_builder`, `dataslate`; projekt ma też Realtime Database z osobnymi regułami, których SowieGry nie dotykają).

Od etapu E1 plik jest ładowany na każdej stronie jako pierwszy skrypt; czyta go wyłącznie `shared/sowie-cloud.js` (Firebase JS SDK 12.19.0, nazwana aplikacja `sowiegry`). Komentarz w pliku opisuje współdzielenie projektu i to, że SowieGry używają tylko kolekcji `sowiegry` (z podkolekcjami `sowiegry_gry` i `sowiegry_historia`). Wartości konfiguracji nie są zmieniane. Kolekcja `sowiegry` powstaje przy pierwszym uruchomieniu wersji E1 na docelowej domenie po wpisaniu hasła (zapis `sowiegry/meta` i `sowiegry/profil`).

### Reguły Firestore

2026-09-27 właściciel opublikował w konsoli Firebase poniższe reguły (wcześniej obowiązywało `allow read, write: if true` dla całej bazy):

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

Zasada działania:

- reguła ogólna daje pełny dostęp do każdego dokumentu, którego kolekcja nie nazywa się `sowiegry`, `sowiegry_gry` ani `sowiegry_historia`. Drugi projekt działa więc jak wcześniej, także przy zapytaniach `collectionGroup`;
- `sowiegry/meta` — odczyt dla wszystkich; zapis tylko z polem `schemaVersion` typu całkowitego; bez kasowania;
- `sowiegry/profil` — jedyny profil gracza; zapis tylko z `schemaVersion` i maksymalnie 30 polami; bez kasowania;
- `sowiegry/profil/sowiegry_gry/{gra}` — tylko identyfikatory `runner`, `jumper`, `sowa3`, `ogrody`, `szklarnia` (stałe, niezależne od nazw gier i folderów);
- `…/sowiegry_historia/{wpis}` — tworzenie tylko z liczbowym `score`, kasowanie dozwolone (przycinanie historii), bez edycji;
- każda inna ścieżka pod `sowiegry` jest odrzucana.

Dodanie nowej gry wymaga dopisania jej identyfikatora do listy w regule `sowiegry_gry/{gra}` i ponownej publikacji reguł. Właściciel przewiduje taką rozbudowę w przyszłości; wtedy zostanie też uporządkowany sposób nadawania identyfikatorów (opis: Analiza 1, rozdział 9.2).

Reguły sprawdzono na emulatorze Firestore (26 scenariuszy zgodnych z oczekiwaniem). Kolekcja `sowiegry` jeszcze nie istnieje w bazie; powstanie przy pierwszym uruchomieniu wersji z etapu E1. Kopia reguł jest w pliku `firestore.rules` (etap E0; test `tests/unit/firestore-rules.test.mjs` pilnuje zgodności z Analizą 1). Każda zmiana reguł wymaga edycji `firestore.rules` i ponownej publikacji w konsoli przez właściciela.

## SowieCloud — zapis postępu w Firestore (`shared/sowie-cloud.js`)

Jedyny moduł SowieGry, który rozmawia z Firestore i używa pamięci przeglądarki (`localStorage`, `sessionStorage`). Specyfikacja: `Analizy/ANALIZA_1_Firestore_zapis_postepu.md`. Plik jest zwykłym skryptem (nie modułem ES) opakowanym w IIFE z `"use strict"`. Na końcu:

- w Node (`typeof module === "object"`) eksportuje obiekt z funkcjami i stałymi (`module.exports`) — z tego korzystają testy jednostkowe;
- w przeglądarce uruchamia silnik i ustawia `window.SowieCloud`.

### Stałe

| Stała                                             | Wartość                                                                                             | Znaczenie                                                                                           |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `SDK_VERSION`                                     | `"12.19.0"`                                                                                         | przypięta wersja Firebase JS SDK (zmiana = świadoma zmiana jednej stałej)                           |
| `SDK_URL`                                         | `https://www.gstatic.com/firebasejs/12.19.0`                                                        | CDN, z którego dynamicznie importowane są `firebase-app.js` i `firebase-firestore.js`               |
| `APP_NAME`                                        | `"sowiegry"`                                                                                        | nazwana aplikacja Firebase — nie koliduje z domyślną aplikacją innego projektu na tej samej domenie |
| `HASLO_GRACZA`                                    | `"huhu"`                                                                                            | hasło jawne w kodzie (bramka, a nie zabezpieczenie)                                                 |
| `SCHEMA_VERSION`                                  | `1`                                                                                                 | pole `schemaVersion` w `meta` i `profil` (wymagane przez reguły jako liczba całkowita)              |
| `DEVICE_KEY`                                      | `"sowiegry:urzadzenie"`                                                                             | jedyny klucz `localStorage` SowieGry: `{ unlocked, deviceId, cleaned }`                             |
| `MODE_KEY`                                        | `"sowiegry:tryb-chmury"`                                                                            | klucz `sessionStorage` z wybranym trybem (`{ mode, project }`)                                      |
| `GAME_IDS`                                        | `runner`, `jumper`, `sowa3`, `ogrody`, `szklarnia`                                                  | stałe identyfikatory gier (są w regułach Firestore)                                                 |
| `EMULATOR`                                        | `127.0.0.1:8080`, projekt `demo-sowiegry`                                                           | adres emulatora                                                                                     |
| `PATHS`                                           | `sowiegry/meta`, `sowiegry/profil`, `sowiegry/profil/sowiegry_gry/{id}`, `…/{id}/sowiegry_historia` | ścieżki dokumentów                                                                                  |
| `DELAYS`                                          | profil 30 s, ustawienia 1 s, dokument gry 1 s, gra idle 30 s, ważna akcja w grze idle 2 s           | opóźnienia zapisów                                                                                  |
| `TOP_LIMIT` / `HISTORY_LIMIT` / `HISTORY_TRIM_AT` | 10 / 50 / 60                                                                                        | top 10; historia przycinana do 50, gdy licznik przekroczy 60                                        |
| `DAILY_DAYS` / `AWARD_DAYS`                       | 30 / 30                                                                                             | ile dni trzymamy rekordy dnia i nagrody dzienne Akademii                                            |
| `STARE_KLUCZE`, `STARE_PREFIKSY`                  | lista z Analizy 1, rozdz. 12                                                                        | stare klucze SowieGry kasowane jednorazowo                                                          |
| `PROFILE_COUNTERS`                                | `stats.leaves`, `stats.nearMisses`, `stats.extraLives`, `stats.finishes`, `records.{id}.runs`       | liczniki zapisywane wyłącznie przez `increment()`                                                   |
| `GAME_COUNTERS`                                   | `historyCount`                                                                                      | licznik wpisów historii w dokumencie gry                                                            |

### Znaczniki operacji

Stan w pamięci to zwykły JSON. Operacje specjalne są zapisywane jako obiekty `{ __sowieOp: … }` i dopiero backend zamienia je na operacje Firestore:

- `increment(n)` → `{ __sowieOp: "increment", n }` → `increment(n)` z SDK;
- `serverTime()` → `{ __sowieOp: "serverTime" }` → `serverTimestamp()`;
- `deleteValue()` → `{ __sowieOp: "delete" }` → `deleteField()`.

### Funkcje pomocnicze (czyste)

- `clone(v)` — kopia przez `JSON.parse(JSON.stringify(v))`;
- `isPlainObject(v)` — zwykły obiekt (nie tablica, nie znacznik);
- `sameValue(a, b)` — równość wartości liści (tablice porównywane jako JSON, `NaN` równe `NaN`);
- `normalizePassword(v)` → `String(v ?? "").trim().toLowerCase()`; `checkPassword(v)` porównuje z `HASLO_GRACZA`. Wielkość liter i spacje na początku/końcu są ignorowane, spacja w środku (`"hu hu"`) jest błędem;
- `dayKey(ms)` — data `RRRR-MM-DD` w UTC (tak samo jak w Sowiej Akademii);
- `getPath`, `setPath` — odczyt/zapis po tablicy kluczy (brakujące poziomy tworzone jako `{}`);
- `diff(before, after, isCounter)` — **różnica dwóch stanów jako zagnieżdżony obiekt do zapisu `setDoc(…, { merge: true })`**: zmienione liście mają nową wartość, usunięte klucze znacznik `delete`, tablice idą w całości, nowe obiekty są rozwijane do liści, a ścieżki liczników (`isCounter("a.b.c")`) są pomijane. Brak zmian → `null`. Dzięki temu zapisujemy tylko to, co się zmieniło: dwa urządzenia nie nadpisują sobie nawzajem pól, których nie ruszały (np. rekord zapisuje się tylko przy poprawie — Firestore nie ma operacji „max”);
- `applyPatch(target, patch, nowMs)` — zastosowanie takiego zapisu (głębokie scalanie; `increment` dodaje, `serverTime` wpisuje `nowMs`, `delete` usuwa). Używane przez `MemoryBackend`;
- `insertTop(list, entry, limit = 10)` — wstawia wynik do listy malejąco po `score`, zwraca `{ list, place }` (`place` 1–10 albo `null`);
- `trimDaily(map, today, days = 30)` — zostawia klucze `RRRR-MM-DD` z ostatnich 30 dni (włącznie z dziś);
- `trimAwards(awards, today, days = 30)` — usuwa nagrody `daily:*` i `feature:*` z datą starszą niż 30 dni; `weekly:*`, `trait:*`, `gallery:*` zostają;
- `isOldKey(key)`, `cleanupOldKeys(storage)` — kasuje **wyłącznie** klucze z `STARE_KLUCZE` i klucze zaczynające się od `STARE_PREFIKSY`, przechodząc po `storage.key(i)`; nigdy `clear()` (domena jest współdzielona z innymi stronami). Zwraca listę skasowanych kluczy;
- `normalizeValue(v)` — zamienia obiekty z `toMillis()` (Timestamp Firestore) na liczby milisekund, rekurencyjnie;
- `randomId("d-")` — identyfikator urządzenia `d-` + 6 znaków `[0-9a-z]` z `crypto.getRandomValues` (niezależnie od `?seed=`, który podmienia `Math.random`);
- `defaultProfile(platform)` — profil domyślny: `schemaVersion: 1`, `name: "Sowa"`, `settings` (`DEFAULT_SETTINGS`), `cosmetics: { unlocked: ["none", "bow"], selected: "none" }`, `missions` (`DEFAULT_MISSIONS`), `stats` (`DEFAULT_STATS`), `academy: { xp: 0, feathers: 0, metrics: {}, daily: null, weekly: null, awards: {} }`, `gallery: { unlocked: ["owl-01"], viewed: [], favorite: null }`, `records: {}`;
- `normalizeProfile(raw, platform)` — uzupełnia wczytany profil wartościami domyślnymi (także każdą misję osobno), filtruje `cosmetics.unlocked` do znanych kosmetyków, wybrany kosmetyk musi być odblokowany, usuwa znaczniki czasu serwera (`createdAt`, `updatedAt`, `lastSeenAt`).

### Backendy

Wspólny interfejs:

| Metoda                                             | Działanie                                                                                                                                                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getDoc(path, source)`                             | `source`: `"cache"` (tylko pamięć podręczna IndexedDB), `"server"` (tylko serwer), `"default"`; zwraca obiekt albo `null` (brak dokumentu); błąd = brak danych (np. offline bez cache)          |
| `commit(ops)`                                      | jeden zapis zbiorczy (`writeBatch`); `ops`: `{ type: "set", path, data }` (zawsze `merge: true`), `{ type: "add", collection, data }` (dokument z automatycznym id), `{ type: "delete", path }` |
| `query(collection, { orderBy, direction, limit })` | lista `{ id, path, data }`                                                                                                                                                                      |
| `subscribe(path, listener)`                        | nasłuch dokumentu; `listener(data, { fromCache, pendingWrites })`; zwraca funkcję odpinającą                                                                                                    |

**`MemoryBackend`** (klasa): dokumenty w `Map` ścieżka → obiekt, `commits` (lista wszystkich zapisów — do testów), `writesTo(path)` (liczba zapisów zbiorczych dotykających dokumentu). `add` nadaje id `m-000001`, `m-000002`… Po `commit` powiadamia nasłuchujących dotkniętych dokumentów (`fromCache: false`, `pendingWrites: false`). Używany w testach (`?cloud=memory`), przy awarii CDN i w testach jednostkowych. Dane giną po przeładowaniu strony.

**`createFirestoreBackend({ config, emulator, sdkUrl })`**: równoległy `import()` `firebase-app.js` i `firebase-firestore.js`; aplikacja `getApps().find(name === "sowiegry") || initializeApp(config, "sowiegry")`; `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }), ignoreUndefinedProperties: true })` — trwały cache w IndexedDB, wiele kart; przy emulatorze `connectFirestoreEmulator(db, host, port)`. Dane odczytywane z `serverTimestamps: "estimate"` i przepuszczane przez `normalizeValue`. `getDoc` używa `getDocFromCache` / `getDocFromServer` / `getDoc`. Zapisy offline trafiają najpierw do IndexedDB i są wysyłane, gdy wróci sieć (także przy następnym otwarciu strony).

### Silnik: `createCloud(options)`

Opcje: `platform` (stałe z `SowiePlatform`), `storage` (`localStorage`), `connect()` (Promise backendu), `gameId` (gra bieżącej strony albo `null`), `gameKinds` (`id → "arcade" | "idle"`), `now`, `timers` (`setTimeout`/`clearTimeout` — w testach zegar symulowany), `emit` (zdarzenia `SowiePlatform`), `onLock()` (po wylogowaniu; w przeglądarce przeładowanie strony), `reload()` (wczytanie nowszego stanu z innego urządzenia), `isOnline()`, `logError`.

**Przy utworzeniu (synchronicznie):** odczyt `sowiegry:urzadzenie`; jeśli brak `cleaned` — `cleanupOldKeys` (jednorazowe kasowanie starych kluczy); zapis klucza urządzenia `{ unlocked, deviceId, cleaned: true }`. Następnie start asynchroniczny:

1. urządzenie nie jest odblokowane → status `"haslo"` i czekanie na `unlock()`;
2. status `"laczenie"`, `await connect()`; błąd → `MemoryBackend` i `offlineReason() === "sdk"` (pasek „Tryb offline”);
3. `sowiegry/meta`: odczyt (najpierw cache, potem serwer); dokument nie istnieje → zapis `{ schemaVersion: 1, createdAt: serverTimestamp, games: [5 identyfikatorów] }` (tak powstaje kolekcja `sowiegry`);
4. `sowiegry/profil`: odczyt (cache, potem serwer). Istnieje → `normalizeProfile`. Nie istnieje → profil domyślny + `createdAt`, `updatedAt`, `lastSeenAt` = `serverTimestamp` (w tym samym zapisie zbiorczym co `meta`). Nie da się odczytać (offline i brak cache) → profil tylko w pamięci, bez zapisów, `offlineReason() === "profil"` — nigdy nie tworzymy profilu „na ślepo”, bo nadpisałby prawdziwy postęp;
5. dokument bieżącej gry `sowiegry_gry/{gameId}` (cache, potem serwer);
6. `ready` rozwiązany, status `online` / `offline`; wykonanie zadań odłożonych przed startem (`updateProfile`, `increment`, `submitRun`, `saveGameState`, `updateGame` wywołane przed `ready` są kolejkowane i stosowane do **wczytanego** profilu, a nie do wartości domyślnych);
7. profil wczytany z cache → w tle odczyt z serwera; jeśli lokalnie nic się nie zmieniło, profil w pamięci jest podmieniany i wywoływane są `onProfileReload` oraz zdarzenie `cloud:profile-reloaded` (Akademia i Galeria przeładowują wtedy swój stan);
8. gra idle → `subscribe` dokumentu gry: nowszy `rev` z innym `deviceId` (dane z serwera, bez oczekujących zapisów) → `onConflict({ gameId, rev, decide })`; `decide(true)` przeładowuje stronę (wczytanie nowszego stanu), `decide(false)` przyjmuje `rev` zdalny, więc następny zapis nadpisuje tamten stan.

**Kolejka zapisów.** Zmiany trafiają do pamięci od razu (odczyty są synchroniczne), a `schedule(delay)` ustawia jeden wspólny zegar na `min(obecny termin, teraz + delay)` — kolejne wywołania nie odsuwają zapisu (dlatego gra idle zapisująca co 5 s robi najwyżej 1 zapis na 30 s, czyli ≤ 120 na godzinę). `flush()` buduje operacje i wysyła je jednym `commit`:

- profil: `diff(stan bazowy, profil, liczniki)` + oczekujące `increment` + `schemaVersion: 1`, `updatedAt` i `lastSeenAt` = `serverTimestamp`;
- każdy dokument gry: `diff` + `increment` + `updatedAt`; gdy zmieniło się `state` — także `savedAt` = `serverTimestamp`;
- odłożone operacje historii (`add`, `delete`).

Po zbudowaniu stan bazowy = kopia stanu w pamięci. Podczas zapisu status `"zapisywanie"`, po błędzie `"blad"` i `console.error`. `flush()` przed startem czeka na `ready`; zwracana obietnica rozwiązuje się, gdy dotrą do bazy **wszystkie** zapisy — także wysłane wcześniej (np. przez `submitRun`), a offline dopiero po powrocie sieci (dlatego zdarzenia `visibilitychange` jej nie czekają, a `lock()` czeka najwyżej 1,5 s).

**Status** (`status()`, `onStatus(listener)` — słuchacz wywoływany od razu z bieżącą wartością): `"haslo"`, `"laczenie"`, `"online"` (Firestore, profil znany, `navigator.onLine`), `"offline"` (pamięć, profil nieznany albo brak sieci), `"zapisywanie"`, `"blad"`.

### Publiczne API `window.SowieCloud`

| Funkcja                                                              | Opis                                                                                                                                                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ready`                                                              | Promise: hasło podane, profil (i dokument bieżącej gry) wczytany                                                                                                                                       |
| `isReady()`                                                          | czy `ready` już się rozwiązał (gry sprawdzają to przed startem rozgrywki)                                                                                                                              |
| `status()`, `onStatus(fn)`                                           | stan połączenia (jw.)                                                                                                                                                                                  |
| `isUnlocked()`                                                       | czy urządzenie ma zapamiętane odblokowanie                                                                                                                                                             |
| `unlock(haslo)`                                                      | `true`/`false`; przy `true` zapisuje `unlocked: true` i łączy z bazą                                                                                                                                   |
| `lock()`                                                             | „Wyloguj to urządzenie”: `flush()` (max 1,5 s), `unlocked: false`, przeładowanie strony                                                                                                                |
| `profile()`                                                          | profil w pamięci (tylko do odczytu — zmiany przez `updateProfile`)                                                                                                                                     |
| `updateProfile(mutator, { delayMs = 30 000 })`                       | `mutator(profil)` zmienia pola; zapis odroczony (ustawienia i kosmetyki: 1000 ms)                                                                                                                      |
| `increment(ścieżka, n)`                                              | licznik profilu (np. `"stats.leaves"`) — pamięć + `increment(n)` w Firestore                                                                                                                           |
| `records(gameId, poziom, tryb?)`                                     | rekordy z pamięci, np. `{ bestScore, bestDistance }` (klucz `recordKey(poziom, tryb)`); bez poziomu — cały `profil.records[gameId]`                                                                                                      |
| `submitRun(gameId, wynik)`                                           | koniec rozgrywki (niżej); zwraca `{ newRecord, place, best }` albo `null` przed startem                                                                                                                |
| `topRuns(gameId, poziom, tryb?)`                                     | Promise: top 10 z dokumentu gry (`top10[recordKey(poziom, tryb)]`)                                                                                                                                                                        |
| `history(gameId, limit = 10)`                                        | Promise: ostatnie rozgrywki (`orderBy("at", "desc")`)                                                                                                                                                  |
| `game(gameId)`                                                       | dokument gry w pamięci (np. `difficulty`, `finishSeen`, `dailyBest`, `daily`, `traitAlbum`)                                                                                                            |
| `loadGame(gameId)`                                                   | Promise: dokument gry (wczytuje, jeśli to nie gra bieżącej strony)                                                                                                                                     |
| `updateGame(gameId, mutator \| obiekt, { delayMs = 1000 })`          | zmiana pól dokumentu gry (poziom trudności, `finishSeen`, kontrakty dnia)                                                                                                                              |
| `loadGameState(gameId)`                                              | Promise: stan gry idle (`JSON.parse(state)`) albo `null`                                                                                                                                               |
| `saveGameState(gameId, stan, { immediate, summary, saveVersion })`   | zapis stanu gry idle: `state` = JSON, `saveVersion`, `clientSavedAt`, `deviceId`, `rev + 1`; `summary` trafia do dokumentu gry i do `profil.records[gameId]`; opóźnienie 30 s, `immediate: true` — 2 s |
| `flush()`                                                            | natychmiastowe wysłanie kolejki; Promise rozwiązany po potwierdzeniu wszystkich zapisów w drodze                                                                                                       |
| `onConflict(fn)`, `onProfileReload(fn)`                              | pytanie o nowszy stan gry idle; ponowne wczytanie profilu z serwera                                                                                                                                    |
| `offlineReason()`                                                    | `null`, `"sdk"` albo `"profil"`                                                                                                                                                                        |
| `backendKind()`, `mode()`, `gameId()`, `deviceId()`, `removedKeys()` | informacje diagnostyczne (tryb: `memory` / `emulator` / `firestore`)                                                                                                                                   |
| `helpers`                                                            | `{ trimAwards, trimDaily, dayKey, recordKey }` — przycinanie nagród i rekordów dnia (używa Sowia Akademia), klucz rekordów                                                                                                        |

**`submitRun(gameId, { score, distance?, height?, leaves?, durationMs?, difficulty = "arcade", mode?, daily?, seed? })`** — jeden zapis zbiorczy na rozgrywkę. Klucz rekordów `recordKey(poziom, tryb)`: bez trybu albo `"kampania"` — sam poziom (np. `arcade`, jak dotąd), inny tryb — `"<tryb>-<poziom>"` (np. `nieskonczony-arcade`, Sowie Tory od E5d2); wpis z trybem ma pole `mode`:

- `profil.records[gameId]`: `runs` +1 (`increment`, wspólne dla trybów), `lastPlayedAt`, w `[klucz]` pola `bestScore`, `bestDistance`, `bestHeight` — tylko przy poprawie;
- dokument gry: `top10[klucz]` (`insertTop`), przy `daily: true` `dailyBest[RRRR-MM-DD]` = max wartości metryki dnia gry (`GAME_REGISTRY[].dailyMetric`: Runner — dystans, Jumper — wysokość, Sowa3 — wynik), przycięte do 30 dni; `historyCount` +1;
- nowy wpis `sowiegry_historia`: `{ score, distance?, height?, leaves?, durationMs?, difficulty, daily, seed, at: serverTimestamp }`;
- gdy `historyCount > 60`, najstarsze wpisy ponad 50 są kasowane (`query(orderBy("at","asc"), limit(nadmiar))` + `delete`, `historyCount` −n). Nie używamy polityk TTL, bo działają na grupę kolekcji w całej (współdzielonej) bazie.

### Start w przeglądarce

- wymaga `window.SowiePlatform` (rejestr gier) — w każdej stronie kolejność skryptów: `config/firebase-config.js`, `shared/sowie-platform.js`, `shared/sowie-cloud.js`, `shared/password-gate.js`;
- **tryb** (`resolveMode()`): `?cloud=memory | emulator | firestore` (zapamiętany w `sessionStorage` tej karty, więc przejście linkiem do gry zachowuje tryb), opcjonalnie `?projekt=demo-…` dla emulatora (izolacja testów; dozwolone `demo-` + 1–50 znaków `[a-z0-9-]`). Bez parametru: na `localhost` / `127.0.0.1` / `::1` — **pamięć** (lokalne uruchomienie nigdy nie zapisuje do produkcyjnej bazy; produkcję lokalnie włącza `?cloud=firestore`), na każdej innej domenie (GitHub Pages) — Firestore z `window.firebaseConfig`;
- emulator: konfiguracja `{ apiKey: "demo-api-key", projectId: "demo-sowiegry" (albo z ?projekt=), appId: "demo-sowiegry" }` + `connectFirestoreEmulator("127.0.0.1", 8080)`;
- gra bieżącej strony: pierwszy wpis `GAME_REGISTRY`, którego `/${path}` albo `/${preview.path}` (wersja podglądowa, od E4) występuje w `location.pathname` — dla gry bieżącej strony przy starcie wczytywany jest jej dokument (top 10, rekordy dnia), więc zapis wyniku z podglądu nie nadpisuje top 10;
- import SDK startuje od razu przy ładowaniu strony (równolegle z ekranem gry i ekranem hasła);
- `window.SowieCloud.submitRun` dopisuje domyślnie `daily` (`?daily=1`) i `seed` (`?seed=`) z adresu strony, więc gry nie muszą ich przekazywać;
- `visibilitychange → hidden`, `pagehide` i `online` wywołują `flush()` (na iPhonie `beforeunload` często się nie wywołuje).

## Ekran „Hasło sowy” i nakładki (`shared/password-gate.js`)

Interfejs SowieCloud; logika hasła jest w `sowie-cloud.js`. Wymaga `window.SowieCloud`. Reaguje na `onStatus`:

- `"haslo"` → ekran hasła; inny status → ukrycie ekranu;
- `"laczenie"` przed `ready` → po 200 ms sówka ładowania (przy szybkim starcie z cache się nie pokazuje);
- po `ready` z `offlineReason()` → pasek „Tryb offline — postęp z tej sesji nie zostanie zapisany.”;
- `onConflict` → okno „Nowszy postęp 🦉 — Na innym urządzeniu zapisano nowszy postęp — wczytać?” z przyciskami „Wczytaj” (fokus) i „Zostań przy tym”.

Każda nakładka zatrzymuje propagację zdarzeń klawiatury, wskaźnika, dotyku, kliknięć, kółka i menu kontekstowego (`stopPropagation`), więc gra pod spodem (np. p5.js nasłuchujący na `window`) ich nie dostaje, a wpisywanie spacji czy Enter w polu hasła nie uruchamia gry.

**Ekran hasła** (`div.sowie-gate`, `role="dialog"`, `aria-modal="true"`, `aria-labelledby="sowieGateTitle"`):

```html
<div class="sowie-gate-hero">
  <div class="sowie-gate-owl" aria-hidden="true">🦉</div>
  <h1 id="sowieGateTitle">Hasło sowy</h1>
  <p>Wpisz hasło, żeby wejść do SowieGry. Na tym urządzeniu wystarczy zrobić to raz.</p>
</div>
<form class="sowie-gate-form" novalidate>
  <label class="sowie-gate-label" for="sowieGatePassword">Hasło</label>
  <div class="sowie-gate-field">
    <input
      id="sowieGatePassword"
      name="haslo"
      type="password"
      autocomplete="off"
      autocapitalize="none"
      autocorrect="off"
      spellcheck="false"
      enterkeyhint="go"
      inputmode="text"
    />
    <button type="button" class="sowie-gate-eye" aria-label="Pokaż hasło" aria-pressed="false">👁</button>
  </div>
  <p class="sowie-gate-error" role="alert" hidden>Hu-hu? To nie to hasło 🦉</p>
  <button type="submit" class="sowie-gate-submit">Wejdź</button>
</form>
```

- zatwierdzenie (przycisk „Wejdź” albo Enter/„Idź” na klawiaturze): `SowieCloud.unlock(wartość)`; sukces → ekran znika; błąd → komunikat, animacja potrząśnięcia pola (`is-wrong`), zaznaczenie wpisanego tekstu; bez blokady prób. Wpisywanie chowa komunikat;
- oczko przełącza `type="password"`/`"text"`, `aria-pressed` i etykietę „Pokaż hasło”/„Ukryj hasło”;
- fokus zostaje w oknie (Tab krąży: pole → oczko → „Wejdź”; `focusin` poza oknem wraca do pola); przy otwarciu fokus w polu (`preventScroll`);
- klawiatura telefonu: `visualViewport` (`resize`, `scroll`) ustawia zmienne CSS `--sowie-gate-height` (wysokość widocznej części) i `--sowie-gate-top` (przesunięcie) — ekran kurczy się nad klawiaturą, a formularz zostaje przy dolnej krawędzi, widoczny;
- `html.sowie-gate-open` blokuje przewijanie strony pod spodem.

**Style** (`shared/cute-ui.css`, sekcje „SowieCloud”), zaprojektowane pod telefon w pionie od 320 px:

- `.sowie-gate`: `position: fixed`, `z-index: 20000` (ponad dokiem gier `9000` i modalami `12000`), `top: var(--sowie-gate-top, 0)`, `height: var(--sowie-gate-height, 100dvh)` (zapasowo `100vh`), kolumna flex `space-between`, odstęp 16 px, marginesy wewnętrzne z bezpiecznymi obszarami (`max(20px, env(safe-area-inset-top))`, boki `max(16px, …)`), tło `linear-gradient(180deg, #bfe9ff, #fff6e3)`, czcionka `500 16px/1.4 system-ui`, `touch-action: manipulation` (bez powiększania podwójnym tapnięciem);
- `.sowie-gate-hero`: środek ekranu, może się kurczyć (`min-height: 0`); sowa `clamp(56px, 18vw, 96px)` z animacją `sowieGateBob` (2,4 s, ±6 px); nagłówek `clamp(26px, 8vw, 34px)`; przy wysokości ≤ 460 px (otwarta klawiatura) sowa i opis są ukrywane;
- `.sowie-gate-form`: przy dolnej krawędzi (strefa kciuka), szerokość do 420 px, siatka z jedną kolumną `minmax(0, 1fr)` (bez tego kolumna rośnie do minimalnej szerokości pola i na 320 px wychodzi poza ekran); pole hasła `flex: 1 1 0%; width: 0; min-width: 0`;
- pole: wysokość min. 52 px, ramka 2 px `rgba(59,47,74,.25)`, zaokrąglenie 16 px, **czcionka 18 px** (≥ 16 px — iOS nie powiększa strony przy dotknięciu pola);
- oczko 52 × 52 px (żółte `--sowie-yellow`, gdy hasło widoczne); „Wejdź” na całą szerokość, min. 52 px wysokości, żółte, cień `0 10px 24px`; fokus: obrys 3 px `#4d8fd6`;
- komunikat błędu: tło `rgba(255,95,130,.16)`, kolor `#8f1d33`, pogrubiony, wyśrodkowany; animacja `sowieGateShake` 320 ms;
- `.sowie-cloud-loading`: `z-index: 19900`, cały ekran, tło `rgba(255,246,227,.86)` z rozmyciem 6 px, sowa 64 px z animacją 1,2 s i tekst „Wczytuję postęp…” (`role="status"`);
- `.sowie-cloud-offline`: `z-index: 19800`, u góry z bezpiecznym obszarem, szerokość `min(92vw, 420px)`, żółte tło, 14 px, `pointer-events: none`;
- `.sowie-cloud-dialog`: `z-index: 19950`, karta przy dolnej krawędzi (strefa kciuka), przyciski min. 52 px;
- przy `prefers-reduced-motion: reduce` animacje sowy i potrząśnięcia są wyłączone.

`window.SowiePasswordGate = { show, hide }` — ręczne pokazanie/ukrycie ekranu (diagnostyka).

### Testy SowieCloud

- `tests/unit/sowie-cloud.test.mjs` (`node --test`, `MemoryBackend`, symulowany zegar i `localStorage`): hasło (`"huhu"`, `" Huhu "` ✔; `"hu hu"` ✘), kasowanie wyłącznie kluczy z listy (dane innych stron zostają), pierwsze uruchomienie (ekran hasła, `meta`, profil, w pamięci tylko `sowiegry:urzadzenie`), brak ponownych zapisów przy drugim starcie, `submitRun` (rekordy per poziom, top 10, historia, rekord dnia, 1 zapis na rozgrywkę), `submitRun` z trybem (`recordKey`, osobny rekord i top 10 `nieskonczony-arcade`, kampania bez zmian), przycinanie historii do 50, liczniki z dwóch urządzeń i rekordy tylko przy poprawie, ≤ 120 zapisów/h gry idle i 2 s dla ważnej akcji, `flush()`, zmiany sprzed startu, pytanie o nowszy stan z innego urządzenia, `lock()`, `diff`/`applyPatch`, przycinanie top 10 / rekordów dnia / nagród, zgodność wersji SDK z `package.json`;
- `tests/rules/firestore-rules.test.mjs` (`@firebase/rules-unit-testing` 5.0.2 + `firebase` 12.19.0 na emulatorze, projekt `demo-sowiegry-reguly`): pełny dostęp drugiego projektu (odczyt, zapis, kasowanie, podkolekcje, nowa kolekcja, `collectionGroup`), walidacja `meta` i `profil` (`schemaVersion` całkowite, max 30 pól, zakaz kasowania), odrzucanie innych ścieżek pod `sowiegry`, lista 5 gier, zasady historii (`score` liczbowe, kasowanie tak, edycja nie).

## Dokumentacja planu

- `Analizy/ANALIZA_1_Firestore_zapis_postepu.md` — przeniesienie zapisu postępu do Firestore (model danych, hasło, reguły).
- `Analizy/ANALIZA_2_Przebudowa_gier.md` — przebudowa gier, menu główne, telefon jako główne urządzenie.
- `Analizy/ANALIZA_3_Plan_prac.md` — kolejność prac (etapy E0–E9).
- Nieaktualne dokumenty starego układu (`docs/AUDYT_MERGE_CUTE_POLISH.md`, `docs/PLAN_ROZWOJU_CUTE_POLISH.md`, `docs/WDROZENIE_CUTE_POLISH.md`) usunięto po akceptacji właściciela (E0.4, porządki po E2).

## Dług techniczny

Gry nadal korzystają z części modułów opakowujących funkcje globalne. Wspólna warstwa została wydzielona, ale pełne scalenie każdego silnika do `game.js`, `config.js` i jawnego systemu hooków pozostaje osobnym etapem refaktoru.

Nie należy usuwać obecnych modułów przed wykonaniem testów regresji.
