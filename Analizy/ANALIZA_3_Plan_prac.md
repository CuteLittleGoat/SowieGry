# Analiza 3 — plan prac: kolejność wdrożenia

> Data: 2026-09-27 · Podstawa: [`ANALIZA_1_Firestore_zapis_postepu.md`](ANALIZA_1_Firestore_zapis_postepu.md) (wersja 2) i [`ANALIZA_2_Przebudowa_gier.md`](ANALIZA_2_Przebudowa_gier.md) (wersja 2) · Status: **w realizacji** — bieżący stan, zasady pracy i dokładne miejsce wznowienia: [rozdział 8](#8-stan-realizacji-i-wznowienie-pracy-aktualizowane-na-bieżąco) (aktualizacja 2026-09-29).

---

## 0. Założenia planu

- **Decyzje właściciela:** jeden profil z hasłem `huhu` (jawnym w kodzie), stare wyniki do skasowania, wszystkie rekomendacje z analiz zaakceptowane, **gra głównie na telefonie**, ładne menu główne z wyborem gier, instrukcjami i galerią odblokowanych obrazków, w Sowa3 zostają cztery plansze (Biedronka, festiwal roślin, blokowisko PRL z dzikami, stacja Amic) i finał z basenem ogrodowym i przemianą w humbaka.
- **Stan na 2026-09-27:** reguły Firestore z Analizy 1 (rozdz. 9.2) są **opublikowane** przez właściciela. W bazie są kolekcje drugiego projektu (`audio`, `character_builder`, `dataslate`); kolekcja `sowiegry` powstanie w E1. Kod gier jeszcze nie korzysta z Firestore.
- **Każdy etap to zamknięta zmiana na `main`.** Na `main` zawsze jest grywalna wersja: stara gra działa, dopóki nowa nie jest gotowa i zaakceptowana.
- **Telefon jest miarą ukończenia.** Każdy etap kończy się testami automatycznymi na profilach telefonów i ręczną checklistą na prawdziwym telefonie (rozdział 3).
- **Minimum pracy „do kosza”.** Obecne gry dostają tylko drobne zmiany (podpięcie zapisu do Firestore), bo i tak zostaną przebudowane.
- **Zgodnie z `AGENTS.md`** każda zmiana gry aktualizuje jej `docs/Documentation.md` i `docs/README.md` (README po polsku, dla gracza), a zmiana modułów wspólnych aktualizuje dokumentację główną.
- **Nazwy i foldery gier zmieniają się dopiero w etapie przebudowy danej gry:** SowaRunner → Sowia Ucieczka, folder `SowiaUcieczka/` (E4); Sowa3 → Sowie Tory, `SowieTory/` (E5); SowaJumper → Sowa w Chmurach, `SowaWChmurach/` (E6); Sowia Szklarnia → Łącz i Hoduj, `LaczIHoduj/` (E8); Sowie Ogrody bez zmian. Do tego czasu obowiązują nazwy i foldery obecne. **Identyfikatory w bazie (`runner`, `sowa3`, `jumper`, `ogrody`, `szklarnia`) nie zmieniają się nigdy**, bo są w opublikowanych regułach Firestore. Szczegóły: Analiza 2, rozdział 3 („Nazwy gier i folderów”).
- Rozmiar etapów: **S / M / L** (mały / średni / duży), bez szacowania godzin.

---

## 1. Kolejność etapów

```
E0 Przygotowanie
 └─► E1 Chmura (Firestore + hasło)                    ← Analiza 1
      └─► E2 Fundament (silnik, telefon/PWA, postacie, dźwięk, wspólny interfejs)
           └─► E3 Menu główne (gry, instrukcje, galeria)
                └─► E4 Sowia Ucieczka (Runner)
                     └─► E5 Sowie Tory (obecnie Sowa3)
                          └─► E6 Sowa w Chmurach (Jumper)
                               └─► E7 Sowie Ogrody
                                    └─► E8 Łącz i Hoduj (Szklarnia)
                                         └─► E9 Meta i sprzątanie
```

| Etap | Nazwa | Rozmiar | Wymaga | Efekt widoczny dla gracza |
|---|---|---|---|---|
| E0 | Przygotowanie | S | — | brak (porządki, testy) |
| E1 | Chmura | M | E0 | hasło `huhu`, postęp w Firestore na każdym urządzeniu, okno rekordów |
| E2 | Fundament | L | E1 | strona testowa „Sowie Laboratorium”, instalacja jako aplikacja (PWA) |
| E3 | Menu główne | M | E2 | nowe menu: ścieżka gier, instrukcje, galeria z przeglądarką zdjęć |
| E4 | Sowia Ucieczka | L | E3 | pierwsza nowa gra |
| E5 | Sowie Tory | L | E4 | druga nowa gra: Biedronka, festiwal roślin, PRL z dzikami, stacja Amic, basen i humbak |
| E6 | Sowa w Chmurach | M | E5 | trzecia nowa gra |
| E7 | Sowie Ogrody | M | E6 | odświeżona gra idle |
| E8 | Łącz i Hoduj | L | E7 | nowa gra logiczna (merge) |
| E9 | Meta i sprzątanie | M | E8 | zadania, osiągnięcia, Sowi Butik, nowe wymagania galerii |

**Dlaczego w tej kolejności**

1. **Chmura najpierw** — to priorytet właściciela. Od razu znikają pozostałości starego zapisu, a każdy kolejny etap zapisuje dane do Firestore od pierwszego dnia.
2. **Fundament przed menu i grami** — wspólny wygląd, postacie, dźwięk i „powłoka telefonu” (gesty, bezpieczne obszary, pauza, PWA) powstają raz, a nie w każdej grze osobno.
3. **Menu przed grami** — to pierwsze, co widać, daje szybki, widoczny efekt i działa od razu z obecnymi grami. Ustala też format instrukcji i galerii, z którego korzystają nowe gry.
4. **Sowia Ucieczka jako pierwsza gra** — ma najpoważniejsze problemy (niesprawiedliwa na telefonie, 5,2 MB p5.js) i najlepiej sprawdza silnik: wzory przeszkód, kózki, bonus humbaka.
5. **Sowie Tory i Sowa w Chmurach** — korzystają z gotowych wzorów, postaci i power-upów z Runnera.
6. **Sowie Ogrody, potem Łącz i Hoduj** — inne gatunki, cięższe interfejsy; merge ma największe ryzyko projektowe, więc idzie ostatni i zaczyna się od prototypu.
7. **Meta na końcu** — zadania i osiągnięcia potrzebują zdarzeń ze wszystkich nowych gier, a nowe wymagania galerii — ostatecznej listy osiągnięć.

**Okres przejściowy (E4–E8):** nowe gry wysyłają zdarzenia (`leaf:collected`, `goat:caught`, `run:ended` …) do nowego modułu `SowieProgress`. Do czasu E9 cienki „most” przekazuje je do obecnej Sowiej Akademii i Galerii, więc misje dnia i odblokowywanie zdjęć działają zarówno ze starymi, jak i z nowymi grami. `shared/gameplay-expansion.js` nie jest ładowany na stronach przebudowanych gier.

**Podgląd przed podmianą (E4–E8):** nowa wersja gry powstaje od razu w **nowym folderze** (np. `SowiaUcieczka/`) i trafia na `main`, a w menu pojawia się link „Wypróbuj nową wersję”. Stara gra działa dalej w starym folderze. Po akceptacji właściciela (test na telefonie) kolejna zmiana przełącza kartę w menu na nowy folder, usuwa stare pliki gry i zostawia w starym folderze tylko `index.html` z przekierowaniem. W E7 (Sowie Ogrody) folder się nie zmienia, więc podglądem jest `SowieOgrody/nowa.html`.

---

## 2. Etapy szczegółowo

### E0 — Przygotowanie (S)

| # | Zadanie |
|---|---|
| 0.1 | Uruchomić `npm test` na obecnym `main` i zapisać stan wyjściowy (co przechodzi, co nie). |
| 0.2 | Playwright: profile telefonów `iPhone SE`, `iPhone 13`, `Pixel 7`, własny `Android 360×800` oraz `iPhone 13` w poziomie; silniki Chromium **i WebKit** (Safari). W CI: `npx playwright install --with-deps chromium webkit`. Obecne testy starych gier zostają na desktopowym Chromium, a nowe testy od początku biegną na telefonach. |
| 0.3 | Emulator Firestore: `firebase.json` (tylko emulator), `firestore.rules` (**dokładna kopia reguł opublikowanych 2026-09-27**, Analiza 1, rozdz. 9.2), `firebase-tools` jako devDependency, w CI krok `actions/setup-java` (Java 21). |
| 0.4 | Usunąć nieaktualne dokumenty opisujące stary układ: `docs/AUDYT_MERGE_CUTE_POLISH.md`, `docs/WDROZENIE_CUTE_POLISH.md`, `docs/PLAN_ROZWOJU_CUTE_POLISH.md`. |

**Gotowe, gdy:** CI jest zielone z nowymi profilami i emulatorem; stan wyjściowy testów jest opisany.

### E1 — Chmura: Firestore + hasło (M) — Analiza 1

| # | Zadanie |
|---|---|
| 1.1 | `shared/sowie-cloud.js`: import SDK 12.19.0 (dynamiczny), nazwana aplikacja `sowiegry`, cache IndexedDB, `MemoryBackend`, tryb emulatora (`?cloud=emulator`), magazyn w pamięci, kolejka zapisów, API z Analizy 1 (rozdz. 3.2). |
| 1.2 | `shared/password-gate.js`: ekran „Hasło sowy”, hasło `huhu` (bez wielkości liter i spacji), pole ≥ 16 px, `autocapitalize="none"`, przycisk w zasięgu kciuka, zapamiętanie urządzenia, „Wyloguj to urządzenie”. |
| 1.3 | Pierwsze połączenie tworzy `sowiegry/meta` i `sowiegry/profil` (wartości domyślne). |
| 1.4 | Jednorazowe kasowanie starych kluczy — **wyłącznie z listy SowieGry**, nigdy `localStorage.clear()` (Analiza 1, rozdz. 12). |
| 1.5 | Moduły wspólne na `SowieCloud`: `sowie-platform.js` (bez migracji, eksportu i importu), `sowie-core.js` (profil, ustawienia ze stanem chmury), `sowie-academy.js`, `owl-gallery.js`, `gameplay-expansion.js` (czyta stan gier idle przez `SowieIdleGame.snapshot()`). |
| 1.6 | Obecne gry, minimalnie: start po `SowieCloud.ready`, rekordy przez `records()`/`submitRun()`, poziom trudności i `finishSeen` w `gry/{id}`, stany idle przez `loadGameState()`/`saveGameState()`, `flush()` przy `visibilitychange → hidden`, postęp offline także po powrocie z tła (Ogrody, Szklarnia). |
| 1.7 | Usunąć `shared/progress-reset.js`, `shared/idle-save-bridge.js` i ich `<script>` we wszystkich HTML. |
| 1.8 | `shared/records.js`: okno „🏆 Rekordy” (top 10 na poziom trudności, ostatnie gry, rekordy dnia), dostępne w obecnych grach. |
| 1.9 | Testy: `tests/unit/sowie-cloud.test.mjs`; e2e na emulatorze (hasło, zapis, przeładowanie, drugi kontekst przeglądarki = „drugie urządzenie” widzi rekord, powrót z tła); testy reguł; przepisanie testów z `platform.spec.js`, `owl-gallery.spec.js`, `smoke.spec.js`; w `tests/unit/architecture.test.mjs` reguła „`localStorage` tylko w `sowie-cloud.js`”. |
| 1.10 | Dokumentacja główna i każdej gry; poprawiony komentarz w `config/firebase-config.js`. |

**Właściciel:** ~~opublikować reguły~~ ✅ wykonane 2026-09-27; sprawdzić plan i limity; po wdrożeniu E1 wpisać `huhu` na telefonie i zobaczyć w konsoli kolekcję `sowiegry`.

**Gotowe, gdy:**

- po wpisaniu `huhu` na telefonie i jednej grze w konsoli są `sowiegry/meta`, `sowiegry/profil` i `sowiegry/profil/sowiegry_gry/…`;
- rekord zrobiony na telefonie widać na komputerze (i odwrotnie);
- w `localStorage` zostaje tylko `sowiegry:urzadzenie`, a dane innych stron z tej domeny są nietknięte;
- gra idle robi ≤ 120 zapisów na godzinę;
- test architektury nie znajduje `localStorage` poza `sowie-cloud.js`.

### E2 — Fundament (L) — Analiza 2, rozdz. 2

Etap dzielony na cztery części, każda trafia na `main` osobno.

| Część | Zadania |
|---|---|
| **2a. Silnik i powłoka telefonu** | `shared/engine/` (pętla 120 Hz z interpolacją, widok w jednostkach świata z kamerą, gesty tap / przytrzymanie / swipe / przeciąganie z martwymi strefami przy krawędziach, sceny, pule obiektów, RNG z ziarnem, kolizje, animacje, cząsteczki); auto-pauza (ukrycie, obrót, utrata fokusu) z odliczaniem 3-2-1; bezpieczne obszary i `100dvh`; monitor płynności i tryb „Oszczędzanie baterii”; **PWA**: manifest (`standalone`, `portrait`, ikony), service worker z wersjonowaniem pamięci podręcznej, start bez zasięgu. |
| **2b. Sowi Świat — grafika** | tokeny kolorów (CSS + JS), czcionka Fredoka (WOFF2, latin-ext) w repo, SVG postaci: Sówka z animacjami, 9 dodatków garderoby, 5 kózek, humbak, rodzina Pracu Pracu (6 wariantów), rodzina Amic (7 wariantów), liście (3 rodzaje), serduszko-doniczka; rasteryzacja do atlasu. |
| **2c. Dźwięk** | silnik audio (szyny, suwaki, ściszanie, `audioSession = "ambient"`, odblokowanie przy pierwszym dotknięciu), ~25 efektów (CC0 / jsfxr), muzyka menu i bonusu humbaka, plik licencji `assets/audio/LICENSES.md`, opcjonalne nagrania właściciela. |
| **2d. Wspólny interfejs** | HUD, menu pauzy, ekran wyników, komunikaty (max 1 w trakcie gry), okna modalne, rdzeń `SowieProgress` z mostem do Akademii i Galerii, struktura `guides-data.js`. |

**„Sowie Laboratorium”** (`lab/index.html`): strona testowa do sprawdzania na telefonie — podgląd postaci i animacji, test gestów (z zaznaczeniem martwych stref), licznik klatek, podgląd bezpiecznych obszarów, test dźwięku.

**Właściciel:** akceptuje wygląd postaci w Laboratorium (punkt kontrolny przed E3); opcjonalnie nagrywa telefonem „Hu-hu!” i „Pracu pracu!”; instaluje SowieGry jako aplikację.

**Gotowe, gdy:** Laboratorium działa w 60 kl./s na telefonie średniej klasy; gesty są rozpoznawane poprawnie (także przy krawędziach); PWA instaluje się na Androidzie i iPhonie i startuje bez zasięgu; dźwięk działa na iPhonie po pierwszym dotknięciu i respektuje przełącznik wyciszenia; moduły silnika mają testy jednostkowe.

### E3 — Menu główne (M) — Analiza 2, rozdz. 4.1

| # | Zadanie |
|---|---|
| 3.1 | Nowe `index.html` + `shared/menu/`: dolny pasek zakładek (🎮 Gry · 📖 Jak grać · 🖼️ Galeria · 🦉 Sowa), kręta ścieżka z 5 kartami gier (na razie prowadzą do obecnych gier), rekord osobisty na karcie, animacje postaci. |
| 3.2 | Instrukcje: `shared/meta/guides-data.js` z treścią dla obecnych gier (przeniesioną z `game-guides.js`) i kartą „Poznaj Sowi Świat”; karty przewijane w bok z animacjami gestów. |
| 3.3 | Galeria: skrypt generujący miniatury 400 × 300 WebP do `assets/gallery-thumbs/`; siatka 2 kolumn; zablokowane zdjęcia z wymaganiem i paskiem postępu; przeglądarka pełnoekranowa (swipe, powiększanie dwoma palcami, ulubione, „Ustaw jako tło menu”, autor i link Pexels); animacja nowego zdjęcia. |
| 3.4 | Zakładka „Sowa”: garderoba, zadania (obecna Akademia w nowym wyglądzie), rekordy, ustawienia (dźwięk, efekty, wibracje, Tryb Przytulny, „Wyloguj to urządzenie”). |
| 3.5 | Karta „Zainstaluj SowieGry na telefonie” (Android: przycisk; iPhone: instrukcja). |
| 3.6 | Usunąć `shared/main-menu.js`, `shared/main-menu.css` i przyciski doklejane do nagłówka menu. |
| 3.7 | `docs/Documentation.md` i `docs/README.md` (główne). |

**Właściciel:** akceptuje wygląd menu na telefonie.

**Gotowe, gdy:** menu bez zdjęć waży < 300 KB i reaguje na dotyk < 1,5 s na telefonie średniej klasy; siatka galerii pobiera ok. 1 MB zamiast 4,7 MB; wszystkie cele dotyku ≥ 48 px; układ działa od 320 × 568; testy e2e: wybór gry, instrukcja, galeria (odblokowane, zablokowane, przeglądarka).

### E4 — Sowia Ucieczka / Runner (L) — Analiza 2, rozdz. 3.1

| # | Zadanie |
|---|---|
| 4.0 | Checklista smaczków obecnej wersji do przeniesienia (teksty, żarty, dekoracje). |
| 4.1 | Rdzeń: tap = skok / podwójny skok, przytrzymanie = szybowanie, swipe w dół = ślizg; coyote time i bufor skoku; kamera pionowa z oddalaniem wraz z prędkością; platformy na 2–3 poziomach; Chmura Pracu jako życia. |
| 4.2 | ≥ 30 wzorów w 4 progach trudności (Pracu ×4, Amic ×4 warianty) + test jednostkowy przejścia każdego wzoru. |
| 4.3 | 5 kózek, Plusk-o-metr, bonus „Rejs na humbaku”, 6 biomów. |
| 4.4 | Punktacja, combo, zadania biegu, Sowi mnożnik; `submitRun()` (rekordy per poziom, top 10, historia, rekord dnia); wyzwanie dnia z ziarnem. |
| 4.5 | Samouczek pierwszego uruchomienia; instrukcja w `guides-data.js`; ilustracja karty w menu; muzyka gry. |
| 4.6 | Nowa gra w folderze `SowiaUcieczka/` (podgląd) → akceptacja → karta menu na nowy folder, usunięcie starych plików z `SowaRunner/` z `p5.js` włącznie (Analiza 2, rozdz. 6), przekierowanie `SowaRunner/index.html` → `SowiaUcieczka/`, aktualizacja wszystkich odwołań do folderu (rejestr gier, `package.json`, `eslint.config.js`, testy, dokumentacja). |
| 4.7 | Dokumentacja gry. |

**Gotowe, gdy:** czas reakcji ≥ 1,1 s na 320 × 568 w pionie przy maksymalnej prędkości (test liczony z parametrów kamery i prędkości); obrót telefonu nie resetuje biegu; 60 kl./s na telefonie średniej klasy; gra < 800 KB; e2e na profilach telefonów zielone.

### E5 — Sowie Tory, obecnie Sowa3 (L) — Analiza 2, rozdz. 3.2

„Sowa3” to obecna nazwa; w tym etapie gra dostaje nazwę „Sowie Tory” (folder `Sowa3/` i identyfikator `sowa3` bez zmian).

**Elementy obowiązkowe (wymaganie właściciela, 2026-09-27):**

1. plansza **Sowa w sklepie Biedronka**,
2. plansza **Sowa na festiwalu roślin**,
3. plansza **Sowa uciekająca przed dzikami na blokowisku z PRL**,
4. plansza **Sowa na stacji benzynowej Amic**,
5. po każdym etapie: **sowa wskakuje do basenu ogrodowego i zmienia się w humbaka**.

| # | Zadanie |
|---|---|
| 5.0 | Checklista smaczków obecnej wersji do przeniesienia: oprawa czterech plansz (regały, „SUPER CENA!”, pieczywo, pracownik z paleciakiem; hala, stojaki, wózki z kwiatami, zraszacze; bloki z wielkiej płyty, trzepak, ławka, kot na balkonie, gołębie; zadaszenie, zielony pas, sklep stacji), basen (szara ryflowana ścianka, niebieski rant, turkusowa woda, trawa, płot, drzewa), koza na leżaku i grill, teksty żartów („Telefon od Magdy”, „Przyjmiesz zmianę?”). |
| 5.1 | Rdzeń: rzutnia perspektywiczna, sortowanie po głębokości, swipe w 4 kierunkach (tor, skok, ślizg) z martwymi strefami przy krawędziach. |
| 5.2 | Cztery plansze w kolejności: Biedronka → festiwal roślin → blokowisko PRL → stacja Amic; przeszkody według typu (niska / wysoka / pełna / ruchoma) w rodzinach Pracu i Amic; ludzie, donice i słupki jako dekoracje bez kolizji. |
| 5.3 | Plansza PRL: **pościg dzików** (stado u dołu ekranu jako wskaźnik żyć, dzik szarżujący wzdłuż toru ze strzałką ostrzegawczą 1 s wcześniej). |
| 5.4 | Finał każdego etapu: działka z basenem ogrodowym, sekwencja ok. 4 s (bieg → skok → plusk → przemiana w humbaka), skracanie tapnięciem po pierwszym obejrzeniu (`finishSeen`). |
| 5.5 | Grywalny bonus „Humbacze Tory” (20 s) zaraz po przemianie; podsumowanie planszy z gwiazdkami. |
| 5.6 | Kózki z „Kozią jazdą”, liście, combo, Gorączka Monster (najczęstsza na festiwalu roślin); tryb Nieskończony; rekordy kampanii i trybu Nieskończonego. |
| 5.7 | Samouczek, instrukcja w `guides-data.js`, ilustracja karty w menu, muzyka na każdą planszę. |
| 5.8 | Nowa gra w folderze `SowieTory/` (podgląd) → akceptacja → karta menu na nowy folder, usunięcie 16 starych plików z `Sowa3/`, przekierowanie `Sowa3/index.html` → `SowieTory/`, aktualizacja odwołań; dokumentacja gry w `SowieTory/docs/`. |

**Gotowe, gdy:** są wszystkie cztery plansze i finał z basenem i przemianą w humbaka (lista obowiązkowa powyżej); swipe działa jedną ręką bez wywoływania gestu „cofnij”; każdy wzór przeszkód ma przejście (test); bonus humbaka jest grywalny; e2e na telefonach zielone.

### E6 — Sowa w Chmurach / Jumper (M) — Analiza 2, rozdz. 3.3

Przeciąganie palcem w dolnej połowie ekranu + opcjonalne przechylanie (na iPhonie przycisk z prośbą o zgodę); 6 typów platform; Pracu do zdeptania, Amic do omijania; kózki z „Rakietką”; „Niebiański Ocean”; ratunek zamiast upadku; 5 stref wysokości; samouczek; nowa gra w folderze `SowaWChmurach/` (podgląd) → akceptacja → usunięcie 11 starych plików z `SowaJumper/` i przekierowanie do nowego folderu, aktualizacja odwołań; dokumentacja w `SowaWChmurach/docs/`.

**Gotowe, gdy:** sterowanie jest płynne jedną ręką, a palec nie zasłania sowy; przechylanie działa na Androidzie i iPhonie po zgodzie; e2e na telefonach zielone.

### E7 — Sowie Ogrody (M) — Analiza 2, rozdz. 3.4

Czytelne moduły zamiast obecnego `script.js`; nowy format stanu z migracją ze stanu zapisanego w Firestore w E1 (`saveVersion`); rozdziały z celami; widoczny ogród; zdarzenia: telefon Pracu, ciężarówka Amic, złota kózka; „Zatoka Humbaka”; symulator ekonomii w testach (pierwszy prestiż po ok. 2–3 h); dolny panel (bottom sheet) na telefonie; postęp offline z czasu serwera i po powrocie z tła; usunięcie `shared/stable-panel.js`; podgląd `SowieOgrody/nowa.html` → podmiana (folder bez zmian); dokumentacja.

**Gotowe, gdy:** symulator potwierdza tempo progresji; postęp z E1 wczytuje się bez strat; panel mieści się na 320 × 568; e2e na telefonach zielone.

### E8 — Łącz i Hoduj / Szklarnia (L) — Analiza 2, rozdz. 3.5

| # | Zadanie |
|---|---|
| 8.0 | **Prototyp**: plansza 7 × 9, jeden łańcuch Monstery, przeciąganie na telefonie. **Punkt kontrolny właściciela** — jeśli rozgrywka się nie podoba, przechodzimy na wariant zapasowy (idle z odwróconymi rolami). |
| 8.1 | 4 łańcuchy + hybrydy, „Sowia doniczka”, zamówienia sowich sąsiadek, odnawianie pomieszczeń szklarni. |
| 8.2 | Przeszkody: karteczki i telefon Pracu, skrzynie i kanister Amic; 5 kózek-wzmacniaczy; „Basen Humbaka” z rekordem. |
| 8.3 | Pakiet startowy z obecnego stanu `gry/szklarnia` (nowa `saveVersion`, identyfikator `szklarnia` bez zmian); samouczek; nowa gra w folderze `LaczIHoduj/` (podgląd) → akceptacja → usunięcie starych plików z `SowiaSzklarnia/` i przekierowanie do nowego folderu, aktualizacja odwołań; dokumentacja w `LaczIHoduj/docs/`. |

**Gotowe, gdy:** przeciąganie przedmiotów jest precyzyjne na 320 × 568 (pole ≥ 44 px, przedmiot uniesiony nad palcem); plansza nie może się zablokować bez wyjścia (test jednostkowy); e2e na telefonach zielone.

### E9 — Meta i sprzątanie (M) — Analiza 2, rozdz. 4.2

| # | Zadanie |
|---|---|
| 9.1 | Pełny `SowieProgress`: osiągnięcia, zadania dnia i tygodnia z nowych zdarzeń, piórka, XP i poziom gracza. |
| 9.2 | Sowi Butik: stroje, gatunki sów, dłuższe działanie kózek. |
| 9.3 | Nowe wymagania odblokowania 30 zdjęć galerii (propozycja do akceptacji właściciela). |
| 9.4 | Usunięcie starego kodu: `sowie-academy.js`, `gameplay-expansion.js`, `game-guides.js`, `notification-manager.js`, `modal-accessibility.js`, `sowie-runtime.js`, pasek narzędzi i dok z `sowie-core.js`, most z okresu przejściowego. |
| 9.5 | Usunięcie kodu kasującego stare klucze `localStorage` (gdy od E1 minęły 1–2 miesiące) oraz stron-przekierowań w starych folderach (`SowaRunner/`, `Sowa3/`, `SowaJumper/`, `SowiaSzklarnia/`). |
| 9.6 | Końcowy przegląd wydajności na telefonach i pełna aktualizacja dokumentacji. |

**Gotowe, gdy:** jest jeden system postępu; w repo nie ma plików starego układu; wszystkie testy (także na telefonach) zielone.

---

## 3. Checklista testu na telefonie (po każdym etapie)

**Automatycznie (Playwright, profile z E0):** start gry, 5 s rozgrywki z ziarnem, pauza i wznowienie, zmiana orientacji, ukrycie i powrót karty, ekran wyników; brak błędów w konsoli; brak nakładających się elementów w 320 × 568.

**Ręcznie na prawdziwym telefonie (iPhone i/lub Android; w przeglądarce i jako aplikacja PWA):**

1. Otwórz stronę → wpisz `huhu` (od E1) → menu.
2. Zagraj 2 minuty w pionie jedną ręką: czy kciuk sięga wszystkiego i czy nic nie zasłania planszy.
3. Obróć telefon w trakcie gry → gra się wstrzymuje, nie restartuje.
4. Przejdź do innej aplikacji albo zablokuj ekran na minutę → po powrocie pauza i odliczanie; w grze idle doliczony postęp.
5. Ściągnij pasek powiadomień w trakcie gry → pauza.
6. Włącz tryb samolotowy, zagraj, wyłącz → wynik pojawia się na drugim urządzeniu (lub w konsoli Firebase).
7. Dźwięk: gra po pierwszym dotknięciu; przełącznik wyciszenia (iPhone) wycisza grę; muzyka z innej aplikacji nie jest przerywana.
8. Wycięcie ekranu, Dynamic Island i pasek domowy niczego nie zasłaniają.
9. Przytrzymanie palca nie otwiera menu kontekstowego, podwójny tap nie powiększa, pociągnięcie w dół nie odświeża strony.
10. Płynność bez zacięć; telefon nie grzeje się nadmiernie po 10 minutach.
11. Od E2: zainstaluj jako aplikację i powtórz punkty 2–4.

---

## 4. Czynności po stronie właściciela

| Etap | Czynność |
|---|---|
| E1 | ✅ Reguły Firestore opublikowane (2026-09-27). Pozostaje: sprawdzić plan i limity; po wdrożeniu wpisać `huhu` na telefonie i sprawdzić kolekcję `sowiegry` w konsoli. |
| E2 | Zaakceptować wygląd postaci w „Sowim Laboratorium”; opcjonalnie nagrać „Hu-hu!” i „Pracu pracu!” (np. dyktafon w telefonie); zainstalować SowieGry jako aplikację. |
| E3 | Zaakceptować wygląd menu na telefonie. |
| E4–E8 | Zagrać w wersję podglądową (nowy folder gry, w E7 `SowieOgrody/nowa.html`) na telefonie i dać zielone światło na podmianę. |
| E8 | Punkt kontrolny prototypu merge. |
| E9 | Zaakceptować nowe wymagania odblokowania zdjęć galerii. |

---

## 5. Kamienie milowe

| Kamień | Po etapie | Co działa |
|---|---|---|
| M1 | E1 | Postęp w Firestore na każdym urządzeniu, hasło `huhu`, rekordy osobiste |
| M2 | E3 | Nowe menu, instrukcje, galeria i instalacja jako aplikacja — z obecnymi grami |
| M3 | E4 | Pierwsza przebudowana gra (Sowia Ucieczka) |
| M4 | E6 | Wszystkie gry zręcznościowe przebudowane |
| M5 | E8 | Wszystkie gry przebudowane |
| M6 | E9 | Jeden system postępu, zero starego kodu |

---

## 6. Definicja „gotowe” dla każdego etapu

- `npm test` zielony: składnia, lint, formatowanie, walidacja HTML, testy jednostkowe, e2e (od E1 na emulatorze Firestore, od E0 na profilach telefonów).
- Checklista z rozdziału 3 przeszła (automatyczna zawsze, ręczna przy etapach z widocznymi zmianami).
- Dokumentacja zaktualizowana zgodnie z `AGENTS.md`.
- Brak `localStorage` poza `shared/sowie-cloud.js` (test architektury).
- Budżety rozmiaru dotrzymane (menu < 300 KB bez zdjęć, gra < 800 KB).
- Zmiana wypchnięta na `main` z opisowym komunikatem commita.

---

## 7. Poza zakresem (na teraz)

- Logowanie (Anonymous Auth, Google) i zaostrzone reguły wymagające logowania.
- Ranking między wieloma graczami (jest jeden profil).
- Ograniczenie klucza API i App Check (opcjonalnie później; ograniczenie klucza musi uwzględnić domenę drugiego projektu).
- Reklamy, płatności, konta — gry pozostają prywatne i darmowe.
- Nowe gry (poza obecnymi pięcioma) — możliwe w przyszłości. Wymagają aktualizacji reguł Firestore; przy tej rozbudowie porządkujemy też identyfikatory gier i sposób ich zapisu w regułach (Analiza 1, rozdział 9.2).

---

## 8. Stan realizacji i wznowienie pracy (aktualizowane na bieżąco)

> Ostatnia aktualizacja: **2026-10-02**. Ten rozdział pozwala podjąć pracę w nowym oknie / nowej sesji bez znajomości wcześniejszej rozmowy. Po każdym zamkniętym kroku aktualizuj tabelę 8.2 oraz rozdział bieżącego etapu (8.5 — E5, 8.7 — E6).

### 8.1. Zasady obowiązujące przy każdej zmianie (wymagania właściciela)

1. **Firestore jest współdzielony** z innym projektem właściciela (projekt `rpg-dataslate-relay`, `config/firebase-config.js`; kolekcje `audio`, `character_builder`, `dataslate`). Kod SowieGry czyta i pisze **wyłącznie** w kolekcji `sowiegry` i jej podkolekcjach `sowiegry_gry` i `sowiegry_historia` (pilnuje tego `tests/unit/architecture.test.mjs`).
2. **Nic nie zapisujemy do produkcyjnej bazy** — ani ręcznie, ani uruchamiając aplikację podłączoną do produkcji. Testy tylko na emulatorze Firestore (projekt `demo-sowiegry`, adres `?cloud=emulator&projekt=…`) albo na `MemoryBackend` (`?cloud=memory`). Pierwszy zapis do produkcji robi właściciel, otwierając stronę po wdrożeniu. Fikstura e2e przerywa każde żądanie do `*.googleapis.com` i oblewa test.
3. **Reguły Firestore są opublikowane (2026-09-27).** `firestore.rules` w repo to dokładna kopia bloku z Analizy 1, rozdz. 9.2 — **nie zmieniać**. Gdyby zmiana była konieczna: zatrzymać się i zapytać właściciela.
4. Jeden profil, hasło **`huhu`** (bez rozróżniania wielkości liter i spacji).
5. Stare wyniki: kasujemy **wyłącznie** klucze i prefiksy SowieGry z listy w Analizie 1, rozdz. 12. **Nigdy `localStorage.clear()`** — domena jest współdzielona z innymi stronami właściciela. `localStorage` / `sessionStorage` tylko w `shared/sowie-cloud.js`.
6. Identyfikatory gier `runner`, `jumper`, `sowa3`, `ogrody`, `szklarnia` są stałe; foldery zmieniamy dopiero w etapie przebudowy danej gry. Obecne (stare) gry zmieniamy minimalnie.
7. **Telefon najpierw:** e2e na profilach telefonów (Playwright, Chromium + WebKit). WebKit działa tylko w CI; lokalnie `SOWIE_E2E_BEZ_WEBKIT=1`. **Nie uruchamiać `playwright install`** w środowisku, gdzie przeglądarki są już zainstalowane.
8. `AGENTS.md`: po każdej zmianie kodu gry aktualizuj jej `docs/Documentation.md` (dokładny opis kodu — ma wystarczyć do odtworzenia 1:1) i `docs/README.md` (instrukcja dla gracza po polsku); zmiana modułów wspólnych → `docs/Documentation.md` i `docs/README.md` w katalogu głównym.
9. **Przed każdym wypchnięciem na `main`: `npm test` musi przejść w całości** (składnia, lint, formatowanie, HTML, testy jednostkowe, reguły, e2e). Nie wyłączać ani nie pomijać testów. Wypychać małymi krokami, każdy z zielonymi testami. **Komunikaty commitów po polsku**, zakończone stopką:
   ```
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   Claude-Session: https://claude.ai/code/session_017xGVnU4bozpKQL5dLdXzTT
   ```
10. Zmiany wypychamy **na `main`** (wyraźne polecenie właściciela). Po wypchnięciu sprawdzamy CI („Quality and browser tests”, ok. 20 min) i nie zostawiamy czerwonego `main` — przyczyna do znalezienia, nie „flaky”.
11. Nowa wersja gry powstaje najpierw w nowym folderze jako **podgląd** (wpis `preview` w rejestrze → przycisk „Wypróbuj nową wersję” w menu). Podmiana (karta menu na nowy folder, usunięcie starych plików, przekierowanie w starym folderze) dopiero **po akceptacji właściciela**.

### 8.2. Stan etapów

| Etap | Stan | Najważniejsze commity / uwagi |
|---|---|---|
| E0 Przygotowanie | ✅ | profile telefonów w `playwright.config.js`, emulator Firestore, porządki |
| E1 Chmura | ✅ | `shared/sowie-cloud.js` (SowieCloud), `shared/password-gate.js`, moduły wspólne na SowieCloud, okno Rekordów (`shared/records.js`), WebKit w CI |
| E2 Fundament | ✅ | 2a silnik `shared/engine/`, powłoka telefonu, PWA (`sw.js`), Laboratorium `lab/`; 2b Sowi Świat `shared/world/`, Fredoka, SVG postaci, atlas; 2c dźwięk (`scripts/make-audio.mjs`, `assets/audio/`); 2d wspólny interfejs `shared/ui/`, `shared/meta/` (SowieProgress, `guides-data.js`) — właściciel zaakceptował wygląd |
| E3 Menu główne | ✅ | `index.html` + `shared/menu/` (Gry, Jak grać, Galeria, Sowa), stare `main-menu.*` usunięte — właściciel zaakceptował |
| E4 Sowia Ucieczka | ✅ | 4a–4e w `SowiaUcieczka/` (a83d4d4 E4d, fa4e97c i 5054766 E4e, 09c2660); **4f podmiana** 48fa386 (SowaRunner/ → tylko przekierowanie; misje garderoby `shared/meta/missions.js`); poprawka CI WebKit **2258a79** (CI zielone 2026-09-29, patrz 8.4). Właściciel: „Wstępnie mi się podoba… zielone światło na dalsze prace” |
| E5 Sowie Tory | 🔧 w toku | E5a 18ba03b ✅; E5b 6e9bf5c ✅ (oprawa 4 plansz, skórki przeszkód, dziki); E5c 51f188b ✅ (finał z basenem, Humbacze Tory, gwiazdki); E5d1 82d09b5 ✅ (kózki, Gorączka, serduszka); E5d2 0471ed1 ✅ (tryb Nieskończony, rekordy według trybu; poprawka CI 89b079d); E5e 2982a0b ✅, CI zielone (samouczek, instrukcja `sowietory`, muzyka plansz); **E5f — dopiero po akceptacji właściciela** — patrz 8.5 |
| E6 Sowa w Chmurach | 🔧 w toku (równolegle z oczekiwaniem na akceptację E5) | E6a 08d67b6 ✅, CI zielone (checklista smaczków SowaJumper, rdzeń w `SowaWChmurach/`, podgląd w menu); E6b 6352e3c ✅ (przeszkody Pracu i Amic); E6c1 daaa15b ✅ (kózki-moce, Gorączka, serduszka); E6c2 1a0944c ✅ (Niebiański Ocean); E6d 6c01a65 ✅ (oprawa stref, przechylanie telefonu); poprawka CI 83e9587 (testy w WebKit: hak `hold`); E6e ✅ (samouczek, instrukcja `chmury`, motyw lotu) — **podgląd czeka na akceptację właściciela**, E6f dopiero po niej — patrz 8.7 |
| E7 Sowie Ogrody | 🔧 w toku (równolegle z oczekiwaniem na akceptację E5 i E6) | E7a ✅ (logika w `SowieOgrody/ogrod/`, migracja stanu v2 → v3, symulator: pierwsze przesadzanie po ok. 2,7 h); E7b ✅ (strona podglądu `SowieOgrody/nowa.html`, zapis w polu `preview`); E7c1 ✅ (logika zdarzeń, symulator: ok. 2 h 20 min); E7c2 ✅ (zdarzenia na ekranie); E7d1 ✅ (dźwięk i muzyka ogrodu); E7d2 ✅ („Jak grać?” i samouczek); E7d3 ✅ (kontrakty dnia) — **podgląd czeka na akceptację właściciela**, potem E7e (podmiana) — patrz 8.8 |
| E8 Łącz i Hoduj | 🔧 w toku (równolegle z oczekiwaniem na akceptację E5, E6 i E7) | E8a ✅ prototyp (krok 8.0) w `LaczIHoduj/`: plansza 7 × 9, łańcuch Monstery, przeciąganie z uniesieniem nad palec, Sowia doniczka, kompost, zapis w polu `preview` — **punkt kontrolny właściciela** (merge czy wariant zapasowy), kroki 8.1–8.3 dopiero po nim — patrz 8.9 |
| E9 Meta i sprzątanie | ⏳ | — |
| E10 Wersja demo | ⏳ (ostatni etap — prośba właściciela z 2026-10-04) | osobna strona (inny plik HTML, np. `demo.html`) z pokazową wersją gier: bez hasła, **bez zapisu do Firestore** (tylko pamięć), bez wyboru poziomu trudności i innych opcji; szczegóły do ustalenia z właścicielem przed startem — patrz `Analizy/UWAGI_WLASCICIELA.md`, G2 |

### 8.3. Praktyczne wskazówki techniczne

- **Testy lokalnie:** `SOWIE_E2E_BEZ_WEBKIT=1 npm test` (ok. 10–11 min; ok. 146 testów jednostkowych i ok. 283 e2e w Chromium). Pojedynczy plik: `node --test tests/unit/<plik>.test.mjs`; e2e: `SOWIE_E2E_BEZ_WEBKIT=1 npx firebase emulators:exec --only firestore --project demo-sowiegry "npx playwright test tests/e2e/telefon/<plik>.spec.js"`.
- **Serwer do ręcznych zrzutów:** `npx http-server . -p 4191 -c-1 -s` i skrypt Playwright (Chromium) z `?cloud=memory&seed=…` oraz odblokowanym urządzeniem (`localStorage["sowiegry:urzadzenie"] = {"unlocked":true,"deviceId":"d-test01","cleaned":true}` w skrypcie startowym kontekstu testu, nigdy w kodzie gry). Zatrzymanie: `pkill -x http-server` (**nie** `pkill -f …` — dopasowuje własną powłokę).
- **CI:** `.github/workflows/js-check.yml` (push na `main`, `audit/**`, PR). `retries: 1`, `workers: 2`. Przy czerwonym CI: artefakty `test-results` (ślady `trace.zip`: zdarzenia `before/after`, `screencast-frame`, `log`, `0-trace.network`) i log zadania.
- **Nowy folder gry** wymaga dopisania go do: `eslint.config.js` (moduły ES), `package.json` (`format`, `format:check`, `html`), `tests/unit/architecture.test.mjs` (`gamePages`, `projectScripts`), `tests/unit/pwa.test.mjs`, `tests/unit/owl-gallery.test.mjs`; folder ma `package.json` z `{"type":"module"}`.
- **Rejestr gier** (`shared/sowie-platform.js`): podgląd = `preview: { path, name }`; po podmianie: `name`, `path`, `rebuilt: true`, bez `preview`. `SowieCloud.currentGame()` rozpoznaje stronę po `path` albo `preview.path`.
- **Service worker** (`sw.js`): podnieś `VERSION`, gdy zmienia się lista `SHELL` albo strategia.
- **Dźwięk:** efekty i muzyka z `scripts/make-audio.mjs` (deterministycznie, lamejs); budżet gry < 800 KB (gzip) — lista `GAME_SOUNDS` w `config.js` gry ogranicza wczytywane efekty.
- **Komunikaty w grze:** najwyżej 1 naraz (`shared/ui/toasts.js`, `maxQueue: 3`, `priority`); wskazówki sterowania dostają `priority: 2`.
- **Przesunięcia palcem w e2e:** tylko przez `swipe(page, from, to)` z `tests/e2e/fixtures.js` (zdarzenia wskaźnika w jednym kroku strony). `page.mouse.move(…, { steps })` pod obciążeniem trwa > 200 ms i gra uznaje gest za przeciąganie — tak oblewał samouczek Sowiej Ucieczki (ślad: ruch 4 kroków = 249 ms).
- **Szybkie testy Sowich Torów:** `node --test tests/unit/tory*.test.mjs` (ok. 20 s; BFS przejścia każdego wzoru na każdej planszy po zamianie skórek, autopilot kampanii, finał i rejs).
- **Wspólny generator losowy a autopilot:** każda nowa losowość w biegu (np. rejs, kózki) zmienia trasę kolejnych plansz, jeśli bierze liczby z głównego `rng` — wtedy autopilot trafia na nowe układy. Dla elementów pobocznych używaj osobnego generatora z ziarna (`` createRng(`${seed}|nazwa|${plansza}`) ``), jak rejs w E5c. Autopilot sprawdzaj offline na 36 kampaniach (3 poziomy × 12 ziaren) — skrypt w stylu `scratchpad/many.mjs` z sesji 2026-09-29: wycina `autopilot`/`playCampaign` z testu i liczy trafienia.
- **WebKit w CI jest wolny:** pętla gry robi najwyżej 12 kroków po 1/120 s na klatkę, więc gdy WebKit renderuje wolniej niż 10 kl./s, czas gry płynie wolniej od zegara. W e2e czekaj na **stan gry** (`expect.poll`), nie na `waitForTimeout`, a długie fragmenty (rejs humbaka 20 s) przewijaj hakiem `SowieTory.advance(s)`. Ponowne wejście na stronę z emulatorem Firestore rób w **nowej karcie** (`page.context().newPage()`), nie przejściem w tej samej — WebKit zgłasza przerwane długie zapytania kanału Firestore jako błąd strony („…due to access control checks”). Tak naprawiono czerwone CI E5d2 (commit „E5d2-CI”).
- **Zrzuty ekranu:** `NODE_PATH=$PWD/node_modules node skrypt.cjs` (skrypt z `require("@playwright/test")` poza repozytorium nie znajdzie pakietu bez `NODE_PATH`).

### 8.4. Wiedza z E4f: zawieszanie WebKit w CI

W CI (Playwright WebKit na Linuksie) strona Sowiej Ucieczki czasem zawieszała się na stałe tuż po starcie zapętlonej muzyki (po zdekodowaniu albo przy przełączeniu bieg ↔ humbak). Poprawka 2258a79: pętla muzyki to osobny bufor z jednym okrążeniem (`trimToLoop` w `shared/engine/audio.js`), grany w całości z `loop = true` — bez `loopStart`/`loopEnd` i bez startu z przesunięciem. Diagnostyka zostaje: fikstura `webAudioTrace` w `tests/e2e/fixtures.js` (WebKit: dekodowanie, start/stop długich nagrań, „strona żyje” co sekundę w konsoli → widać w śladzie nieudanego testu) i `DEBUG: pw:browser` w kroku e2e CI. Jeśli zawieszenie wróci: pobrać ślad, sprawdzić ostatnie wpisy `[webaudio …]` i wyjście przeglądarki w logu. Po kilku zielonych przebiegach `DEBUG` można usunąć (osobny mały commit).

### 8.5. E5 — Sowie Tory: plan kroków i miejsce wznowienia

Kroki (każdy osobnym commitem na `main`, z testami i dokumentacją `SowieTory/docs/`):

| Krok | Zakres (Analiza 3, E5) | Stan |
|---|---|---|
| **E5a** | 5.0 checklista smaczków obecnej Sowa3 + 5.1 rdzeń: rzutnia perspektywiczna, sortowanie po głębokości, mgła, przesunięcia w 4 kierunkach z martwymi strefami, stuknięcia przy bokach, klawiatura; przeszkody według typu; wzory z testem przejścia; kampania 4 plansz (prosta scenografia, krótka przerwa zamiast finału); podgląd w `SowieTory/` z wpisem `preview` dla `sowa3` | ✅ 18ba03b, CI zielone |
| E5b | 5.2 oprawa czterech plansz (Biedronka: regały, „SUPER CENA!”, pieczywo, pracownik z paleciakiem; festiwal: hala, stojaki, wózki z kwiatami, zraszacze, zwiedzający; PRL: bloki z wielkiej płyty, trzepak, ławka, kot na balkonie, gołębie; Amic: zadaszenie z zielonym pasem, sklep stacji, dystrybutory), skórki przeszkód na planszę (paleta, stojak promocyjny, wózki sklepowe, samochody, katalogi), ludzie/donice/słupki jako dekoracja bez kolizji, ≥ 30 wzorów w 4 progach; 5.3 pościg dzików na PRL (stado u dołu = życia, dzik szarżujący torem ze strzałką 1 s) | ✅ 6e9bf5c |
| E5c | 5.4 finał: działka z basenem (szara ryflowana ścianka, niebieski rant, turkusowa woda, trawa, płot, drzewa, koza na leżaku, grill), sekwencja ok. 4 s (bieg → skok → plusk → przemiana w humbaka), skracanie tapnięciem po pierwszym obejrzeniu (`sowiegry_gry/sowa3.finishSeen`); 5.5 „Humbacze Tory” (20 s, 3 morskie tory, ↑ = wyskok, liście w kółkach, bez obrażeń), podsumowanie planszy z gwiazdkami (★ ukończenie, ★★ liście, ★★★ bez trafienia) | ✅ 51f188b, CI zielone |
| E5d1 | 5.6 (część 1): kózki przeskakujące tory (Turbo → „Kózia jazda” 8 s), Gorączka Monster (najczęstsza na festiwalu), dodatkowe życia (serduszka) | ✅ 82d09b5 |
| E5d2 | 5.6 (część 2): tryb Nieskończony po kampanii (4 plansze w pętli), rekordy kampanii i Nieskończonego (top 10 na poziom) | ✅ 0471ed1 + poprawka CI WebKit 89b079d („E5d2-CI”) |
| E5e | 5.7 samouczek, instrukcja (osobny klucz `sowietory` w `shared/meta/guides-data.js`), muzyka na każdą planszę (`scripts/make-audio.mjs`, budżet < 800 KB), dokumentacja i README; **podgląd do akceptacji właściciela** | ✅ commit „E5e: …” (tryb diagnostyczny `?debug=1` był od E5a; ilustracja karty w menu przeniesiona do E5f) |
| **E5f** | 5.8 po akceptacji: ilustracja karty `sowa3` w menu (`shared/menu/games.js`, scena `SCENES.sowa3`: droga w perspektywie, sowa, kózka skacząca między torami, humbak / basen), rejestr `sowa3` → „Sowie Tory”, `SowieTory/`, `rebuilt: true`; usunięcie 16 plików JS z `Sowa3/` (+ `style.css`), `Sowa3/index.html` → przekierowanie z parametrami adresu (jak `SowaRunner/index.html`), aktualizacja odwołań (testy, `package.json`, `eslint.config.js`, `guides-data.js`, menu, dokumentacja, Akademia/Galeria — teksty „w Sowa3”) | ⏳ |

**Co jest gotowe (pliki w `SowieTory/`, dokładny opis w `SowieTory/docs/Documentation.md`):**

- **E5a:** `config.js` (tory co 1,6 m; rzutnia: kamera 4,2 m za sową, droga 84% szerokości w pionie / ≤ 115% wysokości w poziomie, horyzont 30% / 24%, sowa na 80% wysokości, mgła 38–64 m; sowa: skok 7,9 m/s przy g = 24, ślizg 0,7 s, zmiana toru 15 m/s; poziomy Chill 11→15 m/s 4 życia, Arcade 13→18 m/s 3 życia, Chaos 15→21 m/s 2 życia, +0,6/0,8/1 m/s na planszę; plansza 1200 m; typy przeszkód low/high/full; ruchomy telefon: strzałka 0,8 s, przejazd 0,35 s, zapas 0,6 s), `projection.js`, `physics.js`, `obstacles.js`, `patterns.js`, `stages.js`, `game.js`, `render.js`, `main.js`, `index.html`, `style.css`, `package.json`, `docs/`. Poza folderem: wpis `preview: { path: "SowieTory/", name: "Sowie Tory" }` dla `sowa3` w `shared/sowie-platform.js`; `SowieTory` w `eslint.config.js`, `package.json` (`format`, `format:check`, `html`), `tests/unit/architecture.test.mjs`, `tests/unit/pwa.test.mjs`, `tests/unit/owl-gallery.test.mjs`; `tests/e2e/telefon/menu.spec.js` (przycisk podglądu).
- **E5b:** `props.js` (rekwizyty rysowane kodem w metrach: przeszkody `paleta`, `stojak`, `wozek-sklepowy`, `katalogi`, `stoisko`, `samochod` (głęb. 4,5 m), `zadaszenie`; `drawBoar`; 15 dekoracji `DECOR_PROPS` z `DECOR_WIDTH`; `drawOverhead`: `baner`, `girlanda`, `zadaszenie`, `napisPrl`), `scenery.js` (`SCENERY` na planszę i `sceneryBetween` — dekoracje zawsze poza korytarzem torów), `stages.js` (`remap` skórek: Biedronka `wozek→wozek-sklepowy`, `kanister→paleta`, `znak-cen→stojak`; festiwal `dystrybutor→stoisko`, `teczka→katalogi`; Amic `wozek→samochod`, `znak-cen→zadaszenie`; `chase` tylko PRL; `stageKind`), 34 wzory (pole `stages` — wzory tylko dla wybranych plansz, `allowedOn`), pościg dzików (`BOARS` w `config.js`: pierwszy po 140 m, potem co 110–170 m, strzałka 1 s, +9 m/s, bez dzików w ostatnich 150 m, dzik tylko gdy sąsiedni tor jest wolny od pełnych przeszkód — `escapeLane`; zdarzenia `boarWarning`/`boarCharge`/`boarDodge` +30; stado u dołu ekranu = życia), parametr `?plansza=1…4` (start od planszy). Testy: BFS każdego wzoru na każdej planszy po zamianie skórek (decyzje co 1/10 s), autopilot przechodzi kampanię bez trafienia (ucieka przed dzikami na sąsiedni tor), e2e `?plansza=4` i szarża dzika na PRL. Pomocnik e2e `swipe` w `tests/e2e/fixtures.js` (patrz 8.3) i `try/catch` wokół `setPointerCapture` w `shared/engine/input.js`.

- **E5c:** `finale.js` (oś czasu 4 s: `run` 1,2 / `jump` 0,7 / `splash` 0,7 / `morph` 1,4 s; `GARDEN` — basen 4,8 m przed sową, promień 2,3 m; `finaleOwl`, `finaleWhale`; `createFinale({ seen })` ze `skip()` tylko po obejrzeniu), `whale.js` (rejs 20 s, 14 m/s, kółka co 9 m, co trzeci rząd wysoko, złote co siódmy; wyskok 8,6 m/s przy g = 17), `garden.js` (basen, leżak, grill, płot, drzewo, krzew), `finale-scene.js` (działka i morskie tory, humbak od tyłu); `game.js`: fazy `run → finale → whale → stageEnd`, zdarzenia `finish`, `finale*`, `finishSeen`, `whaleStart/Leap/Splash/Leaf/End`, `stageEnd { stars … }`, `skipFinale()`, `setFinishSeen()`, `stageStars()` (`STARS.leafShare = 0,6`), rejs z osobnym generatorem; `main.js`: dźwięki i muzyka `humbak`, zapis `sowiegry_gry/sowa3.finishSeen` i `stars.<plansza>`, okno podsumowania z gwiazdkami, gesty w finale (stuknięcie skraca) i rejsie. Testy: `tests/unit/tory-finale.test.mjs`, e2e całej ścieżki meta → finał → rejs → podsumowanie → plansza 2 (emulator); autopilot nauczył się nie wjeżdżać w tor szarżującego dzika i nurkować do ślizgu (Chaos 6 w teście).

- **E5d1:** `goats.js` (kózka stoi 0,6 s na torze i skacze 0,4 s łukiem na sąsiedni — dwa tory `lanes`; `pickGoat` z wagami bez powtórzeń; `catchesGoat`), `config.js`: `GOATS`, `FEVER`, `EXTRA_LIFE`; `game.js`: dodatki z **osobnego generatora** (`<seed>|dodatki|<plansza>`) w środku odstępów między wzorami (kózki co 220–360 m, serduszka co 600–900 m, nie w ostatnich 150 m), tęczowy liść w oddechach (festiwal 45%, inne 15%), Gorączka 8 s (×2, deszcz liści ≥ 2,5 m od przeszkód, bez nowych przeszkód), efekty kózek (Sprężynka — skok 10 m/s; Tarcza — `shield`; Magnes — `pull`; Podwajaczka ×2; Kózia jazda — 8 s, ×1,15, bez kolizji i dzików, auto-skok, potem 1,5 s nietykalności), serduszka (+1 życie albo +150), `giveGoat` / `giveFever`; `render.js`: kózki, serduszka, liście lecące do sowy, sowa na kozie; `main.js`: dźwięki, komunikaty, chipy HUD (`setPowerups` z etykietą — **zmiana wspólna** `shared/ui/hud.js`: opcjonalne `label`), napisy punktów co ≥ 0,25 s; pasek planszy przeniesiony pod pauzę (lewa strona) — prawa kolumna na chipy. Testy: `tests/unit/tory-dodatki.test.mjs` (10), e2e chipów i komunikatów; autopilot czysty na 36 kampaniach z dodatkami.

- **E5d2:** wspólne: `SowieCloud.recordKey(poziom, tryb)` (bez trybu / „kampania” — sam poziom; inaczej `<tryb>-<poziom>`), `submitRun(…, { mode })`, `records(gra, poziom, tryb?)`, `topRuns(gra, poziom, tryb?)`, `helpers.recordKey`; `GAME_REGISTRY[sowa3].modes` (Kampania / Nieskończony); okno rekordów w menu (`shared/menu/owl-tab.js`) z chipami trybów; stare `shared/records.js` (strony starych gier) bez zmian. Sowie Tory: `config.ENDLESS = { maxSpeed: 24 }`; `createRun({ mode })` — `runIndex = stage + loop × 4`, pętla plansz (`loop`), obejrzany finał skracany sam, `finish.last` tylko w kampanii; ekran tytułowy — chipy „Kampania / Nieskończony” (`endlessUnlocked`, `mode` w dokumencie gry); pierwsza ukończona kampania zapisuje `endlessUnlocked`; wyniki „Koniec trybu Nieskończonego!”, „Plansze (okrążenia)”; pasek „· okr. N”. Testy: `sowie-cloud.test.mjs` (tryby), `tory-finale.test.mjs` (pętla, limit prędkości), `tory.test.mjs` (autopilot 2 okrążenia), e2e menu (rekordy trybów) i Sowich Torów (odblokowanie, pętla, rekord `nieskonczony-arcade`).

- **E5e:** `SowieTory/tutorial.js` (`TUTORIAL_PATTERNS` — 4 wzory z tagiem `samouczek`: telefon na środku, teczki na 3 torach, dymki na 3 torach, kózka Podwajaczka na środku; `TUTORIAL_STEPS` z `freeze(prędkość)`, `accept`, `gesture`, `skip`; `createTutorial` — zatrzymanie gry przed przeszkodą, tylko pokazany ruch wznawia, ruch ≤ 4 m przed zatrzymaniem zalicza krok bez zatrzymania); `patterns.js`: `intro` przyjmuje obiekty wzorów; `game.js`: element wzoru `type: "goat"` (kózka w miejscu), `placeExtras` pomija wzory samouczka; `main.js`: `wantsTutorial()` (pierwszy bieg: bez `?seed=`, plansza 1, Kampania, brak `tutorialDone`; „Zagraj samouczek” w „Jak grać?”, `?samouczek=1`), `safe: true` w samouczku, podpowiedź `.tory-tutorial` z `.sowie-gesture-demo`, zapis `sowiegry_gry/sowa3.tutorialDone`, `GUIDE_ID = "sowietory"`, muzyka `tory-<plansza>` na zdarzeniu `stage`, wyciszenie na `finish`, `humbak` w rejsie, `phaseMusic()` gdy dźwięk wczyta się w trakcie biegu, haki `tutorial()` i `music()`. Wspólne: przewodnik `sowietory` (8 kart) w `shared/meta/guides-data.js`; 4 motywy w `scripts/make-audio.mjs` (`stageTheme`; 118/104/132/126 BPM, 48 kb/s), `assets/audio/audio.json`, `LICENSES.md`; budżet gry 762 KB. Testy: `tory-samouczek.test.mjs` (4), `audio.test.mjs` (motywy i budżet), `gameplay-expansion.test.mjs` (klucz `sowietory`), e2e samouczka i muzyki (w teście finału).

**Miejsce wznowienia — E5f (po akceptacji właściciela; bez niej nie zaczynać):**

1. Sprawdzić CI commita E5e (Chromium + WebKit; nowy test e2e samouczka ma limit 150 s, muzyka gra teraz w każdym biegu — przy zawieszeniach WebKit patrz 8.4).
2. Raport do akceptacji (8.6) wysłany właścicielowi; czekać na zielone światło albo poprawki (poprawki — osobne małe commity „E5e-…”).
3. Po akceptacji — E5f według tabeli wyżej, wzorem E4f (`git show 48fa386 --stat`): rejestr, przekierowanie `Sowa3/index.html` z parametrami adresu, usunięcie starych plików `Sowa3/`, przewodnik `sowietory` → `sowa3` (usunąć stary `sowa3`, `GUIDE_ID = GAME_ID`), karta w menu z nową ilustracją, napis „Wersja podglądowa” i `preview` znikają, testy (`menu.spec.js`, `architecture`, `pwa` — lista SHELL i `VERSION` w `sw.js`), dokumentacja.

**Historia — plan techniczny E5e (wykonany):**

1. Najpierw sprawdzić CI commitów E5d1 i E5d2 (także WebKit — nowy test e2e trybu Nieskończonego ma 2 rejsy po 20 s i limit 180 s). Czerwone → naprawić przed E5e.
2. **Samouczek pierwszego biegu** (jak `SowiaUcieczka/tutorial.js`): przy pierwszym biegu (brak `sowiegry_gry/sowa3.tutorialDone`) na planszy 1 wzory wstępne (`intro` w `createRun`) i 4 kroki z zatrzymaniem gry, aż gracz wykona pokazany gest (`.sowie-gesture-demo` z `shared/ui`): (1) przesuń w bok — zmiana toru przed telefonem, (2) w górę — skok nad teczką, (3) w dół — ślizg pod dymkiem, (4) złap kózkę (podświetlona); potem „Świetnie! Teraz sama trasa” i zapis `tutorialDone: true`. Test e2e jak w Sowiej Ucieczce (każdy krok czeka na właściwy gest, stuknięcie nie wznawia kroku z przesunięciem).
3. **Instrukcja**: `shared/meta/guides-data.js` — osobny klucz dla podglądu (np. `sowietory`, nazwa „Sowie Tory”: cel, sterowanie, przeszkody według typu, kózki, Gorączka, finał i Humbacze Tory, gwiazdki, tryb Nieskończony), używany przez `SowieTory/main.js` (`GUIDE_ID`); klucz `sowa3` (stara gra w menu) zmienić dopiero przy podmianie (E5f). Sprawdzić testy `guides-data` i zakładkę „Jak grać” w menu.
4. **Ilustracja karty w menu**: przygotować rysunek Sowich Torów (droga w perspektywie, sowa, kózka, humbak) w `shared/menu/games.js`; na kartę `sowa3` wstawić dopiero w E5f (dziś karta prowadzi do starej gry).
5. **Muzyka plansz**: 4 motywy (Biedronka, festiwal, PRL, Amic) w `scripts/make-audio.mjs` (synteza deterministyczna, lamejs; pętla z jednym okrążeniem — `trimToLoop` w `shared/engine/audio.js`), wpisy w `assets/audio/audio.json` i `LICENSES.md`; `main.js` — `playMusic(<motyw planszy>)` na starcie planszy, `humbak` w rejsie, wyciszenie w finale; budżet gry < 800 KB (gzip) — sprawdzić rozmiar (`GAME_SOUNDS` + muzyka). Uwaga na WebKit w CI (8.4): pętle muzyki tylko jako osobne bufory z `loop = true`.
6. Dokumentacja (`SowieTory/docs/*`, checklista smaczków: muzyka, samouczek), `docs/*` przy zmianach wspólnych, `npm test`, commit „E5e: …”, CI.
7. **Podgląd do akceptacji właściciela**: krótki raport dla właściciela (co sprawdzić na telefonie: 4 plansze, dziki, finał z basenem, Humbacze Tory, kózki, Gorączka, Nieskończony, samouczek, muzyka) i prośba o zielone światło na podmianę (E5f). Bez akceptacji nie robić E5f.

Jeżeli plików E5b (`props.js`, `scenery.js`) nie ma w repo (sesja sklonowana przed wypchnięciem E5b) — odtworzyć je według `SowieTory/docs/Documentation.md` albo, gdy i jej brak, według Analizy 2 (rozdz. 3.2) i parametrów z listy wyżej.

### 8.6. Czynności właściciela — stan

| Etap | Stan |
|---|---|
| E1 | ✅ reguły opublikowane; do zrobienia przez właściciela: pierwsze wejście na stronę produkcyjną (`huhu`) i sprawdzenie kolekcji `sowiegry` w konsoli |
| E2, E3 | ✅ zaakceptowane (Fredoka, syntezowane dźwięki, postacie, menu; „Kasuj wszystko co stare i zbędne”) |
| E4 | ✅ podgląd zaakceptowany wstępnie, podmiana wykonana (E4f) |
| E5 | czeka: test podglądu Sowich Torów na telefonie (4 plansze, dziki, finał z basenem, Humbacze Tory, kózki, Gorączka, Nieskończony, samouczek, muzyka) i zielone światło na podmianę (E5f) |
| E6 | w toku (E6a): rdzeń Sowy w Chmurach do obejrzenia w menu („Wypróbuj nową wersję: Sowa w Chmurach”); akceptacja całości po E6e |
| Dane testowe | 2026-10-04: rekordy i zapisy w bazie z okresu testów to dane testowe — mogą przepaść, **migracje stanu i kopie zapasowe nie są potrzebne** (przy podmianach E5f–E8 nowa gra może zacząć od zera; pakiet startowy z dawnej Szklarni i migracja Ogrodów v2 → v3 — opcjonalne). Zasady dostępu do bazy (tylko kolekcja `sowiegry`, reguły bez zmian, testy na emulatorze) bez zmian. |
| Testy podglądów | od 2026-10-04 właściciel testuje podglądy E5–E8 i zgłasza uwagi — **zapisywane w `Analizy/UWAGI_WLASCICIELA.md`**; kodu nie zmieniamy, dopóki właściciel nie napisze, że skończył (potem poprawki według tego pliku, małymi commitami) |
| E8 | ekrany prototypu zaakceptowane (2026-10-04); czeka: **punkt kontrolny prototypu merge** — zagrać w „Łącz i Hoduj” (menu → karta Sowiej Szklarni → „Wypróbuj nową wersję: Łącz i Hoduj”) i zdecydować: merge zostaje (dalej kroki 8.1–8.3) albo wariant zapasowy (Analiza 2, rozdz. 3.5) |

### 8.7. E6 — Sowa w Chmurach: plan kroków i miejsce wznowienia

Gra powstaje w `SowaWChmurach/` (podgląd; identyfikator `jumper`, wpis `preview` w rejestrze → przycisk „Wypróbuj nową wersję: Sowa w Chmurach” na karcie SowaJumper). Dokładny opis kodu: `SowaWChmurach/docs/Documentation.md`. Każdy krok osobnym commitem na `main`, z testami i dokumentacją.

| Krok | Zakres (Analiza 2, rozdz. 3.3) | Stan |
|---|---|---|
| E6a | 6.0 checklista smaczków obecnego SowaJumper + rdzeń: kolumna 9 m z przejściem przez krawędź, automatyczne odbicia (wybicie 15,5 m/s, g = 30 — szczyt 4 m), przeciąganie palca w dowolnym miejscu (ruch względny × 1,25, `bindInput` z `swipeMs: −1`) i klawiatura, 6 typów platform (gałązka, liść Monstery ×1,45 +10, chmurka znika, huśtawka ±1,4 m, balkon co 150 m, krucha gałązka-pułapka), generator z gwarancją przejścia (odstęp ≤ 82% szczytu, krok ≤ 3,6 m; pułapki poza ścieżką), liście zielone/złote, combo, seria idealnych lądowań (2 pkt × seria), ratunek kózki zamiast upadku (−1 życie, ostatnia pewna platforma), 5 stref (kolory nieba, chmury, gwiazdy, „Strefa: …!”), Chill/Arcade/Chaos (4/3/3 życia), Tryb Przytulny, wyniki i `submitRun("jumper", { score, height })` | ✅ 08d67b6, CI zielone |
| **E6b** | Przeszkody: **Pracu** — dymki latające poziomo (skok z góry przebija: +50 pkt i wybicie; bok/dół = trafienie), rój maili (V), wibrujący telefon na platformie; **Amic** — sterowiec przelatujący przez ekran (nie do zniszczenia), spadające kanistry ze znacznikiem u góry ekranu 1 s wcześniej, wisząca tablica cen (blokuje przejście). Zasada: Pracu da się zdeptać, Amic trzeba ominąć. Trafienie: −1 życie, nietykalność 1,5 s (`state.invulnerable` już jest), combo o poziom niżej. Generator: przeszkody tylko tam, gdzie ścieżka zostaje osiągalna (autopilot w testach omija je bez trafień). Grafiki z atlasu: `pracu-dymek`, `pracu-mail`, `pracu-telefon`, `amic-sterowiec`, `amic-kanister`; tablica rysowana kodem | ✅ 6352e3c, CI zielone (szczegóły niżej) |
| E6c1 | Kózki skaczące z platformy na platformę jako power-upy (Sprężynka — wystrzał ok. 40 m, **Rakietka** = Turbo: szybki lot w górę z nietykalnością 3 s, Tarcza, Magnes, Podwajaczka), tęczowy liść i Gorączka Monster, serduszka (dodatkowe życie, przy pełnych +100 pkt — jak w starej grze), chipy power-upów w HUD | ✅ daaa15b, CI zielone |
| **E6c2** | **Niebiański Ocean** (co ok. 300 m humbak-gejzer na chmurze; wskoczenie w fontannę — 20 s odbijania od grzbietów humbaków w chmurach, liście, bez upadku; muzyka `humbak`) | ✅ 1a0944c (szczegóły niżej) |
| E6d | Oprawa 5 stref (Ogródek: płot, grządki; Blok: okna, balkony w tle; Chmury: duże chmury; Zorza: pasy zorzy; Kosmos: planety, humbaki-gwiazdozbiory), boki kolumny w poziomie z paralaksą; **przechylanie telefonu** (opcja w ustawieniach gry; iPhone — przycisk z prośbą o zgodę `DeviceOrientationEvent.requestPermission`) | ✅ 6c01a65 (szczegóły niżej) |
| E6e | Samouczek pierwszego lotu (przeciągnij w bok, platformy, ratunek), instrukcja (osobny klucz w `guides-data.js`, jak `sowietory`), muzyka (motyw gry, budżet < 800 KB), dokumentacja, **podgląd do akceptacji właściciela** | ✅ commit „E6e: …” (szczegóły niżej) — **czeka na akceptację** |
| E6f | Po akceptacji: rejestr `jumper` → „Sowa w Chmurach”, `SowaWChmurach/`, `rebuilt: true`; usunięcie 11 plików JS z `SowaJumper/` (+ `styles.css`), `SowaJumper/index.html` → przekierowanie z parametrami adresu, aktualizacja odwołań (testy, `package.json`, `eslint.config.js`, `guides-data.js`, menu z ilustracją karty, dokumentacja) | ⏳ |

**E6b — co jest gotowe:** `SowaWChmurach/hazards.js` (ruch przeszkód jako funkcja czasu — `hazardPose`; `contact` → zdeptanie / trafienie; `createHazardPlanner` z osobnym generatorem `<seed>|przeszkody`: dymek, telefon na gałązce tylko gdy nadlot i odlot są z jednej strony, tablica cen poza korytarzami wszystkich skoków sięgających jej wysokości, rój 5 maili w V i sterowiec ruszające po wejściu w widok, najwyżej jedna przeszkoda na 14 / 10 / 8 m; kanistry od 350 m co 7–11 s ze znacznikiem 1 s wcześniej), `config.HAZARDS`, `game.js` (`hazards: true`, `updateHazards` przed lądowaniami, `hits`, `stomps`, `addHazard`, koniec „trafienie”), `render.js` (przeszkody z atlasu, tablica kodem, znaczniki), `main.js` (dźwięki `trafienie-pracu` / `trafienie-amic` / `dzwonek`, komunikaty, wyniki „Przebite Pracu”, „Trafienia”, haki `hazard`, `hazards`). Przy okazji poprawka trasy z E6a: chmurka znika po odbiciu, więc platforma za nią jest osiągalna z ostatniej pewnej (wcześniej sowa mogła utknąć pod pustym miejscem po chmurce). Testy: `tests/unit/chmury-przeszkody.test.mjs` (10, w tym autopilot z przewidywaniem — heurystyka; ziarna, na których przechodzi 1000 m) i e2e (zdeptanie, trafienie sterowcem).

**E6c1 — co jest gotowe:** `SowaWChmurach/extras.js` (`goatPose` — postój 1 s i skok 0,7 s łukiem między dwiema stałymi platformami ścieżki; `pickGoat`; `catchesGoat`; `createExtrasPlanner` z osobnym generatorem `<seed>|dodatki`: kózki od 60 m co 120–200 m, serduszka co 300–450 m, tęczowe liście od 100 m co 250–400 m, najwyżej jeden dodatek na parę platform), `config.GOATS`, `EXTRAS`, `FEVER`, `game.js` (`extras: true`, `updateExtras`, `catchGoat`, moce na czas, Rakietka 3 s × 18 m/s, Sprężynka ≈ 49 m/s, Tarcza, Magnes, mnożnik liści, Gorączka z deszczem liści, serduszka, `giveGoat`, `giveFever`), `render.js` (kózki, serduszka, aura Tarczy i Magnesu, Rakietka z płomieniem, tęczowa poświata), `main.js` (komunikaty, dźwięki, chipy HUD, „Złapane kózki”, haki `goat`, `fever`, `extras`). Testy: `tests/unit/chmury-dodatki.test.mjs` (10), e2e (Rakietka, Tarcza, Gorączka w HUD).

**E6c2 — co jest gotowe:** `SowaWChmurach/ocean.js` (`inFountain` — fontanna ±0,6 m w bok, 0,6–4 m nad humbakiem; `createGeyserPlanner` z osobnym generatorem `<seed>|ocean`: gejzer na gałązce albo balkonie ścieżki od 300–340 m co 260–340 m; `whaleX`; `createOcean` — baza 0,7 m nad dolną krawędzią widoku, 3 humbaki na 1,2 / 3,9 / 6,6 m nad bazą, 1,2–2,2 m/s w przeciwne strony, grzbiet ±1,1 m wybija 14,5 m/s, morze chmur na bazie 12 m/s — całość ≤ 12,5 m, pod HUD-em także w poziomie, 4 rzędy po 6 liści, złote w najwyższym, 10 pkt za liść, koniec po 20 s), `config.OCEAN`, efekty `humbak-plusk` i `humbak-piesn`, `game.js` (faza `ocean`: moce, Gorączka, przeszkody, kamera i wysokość stoją; `startOcean`, `updateOcean`, powrót nad gejzer z wybiciem × 1,3 i 2 s nietykalności; `oceans` w podsumowaniu; `giveOcean`), `render.js` (humbak-gejzer ze słupem wody i kroplami, scena oceanu: gradient wody, falujące morze chmur, humbaki, liście), `main.js` (pieśń humbaka jako muzyka, komunikaty, pasek „Niebiański Ocean · 0:SS” z klasą `is-ocean`, wynik „Niebiański Ocean”, `EVENTS.WHALE`, haki `ocean`, `music`, `extras().geysers`). Testy: `tests/unit/chmury-ocean.test.mjs` (6, w tym geometria), budżet dźwięku gry w `audio.test.mjs` (ok. 389 KB < 800 KB), e2e (ocean z haka, pasek, muzyka, powrót do lotu).

**E6d — co jest gotowe:** `SowaWChmurach/scenery.js` (`zoneWeights` — udziały stref z tym samym przejściem 60 m co kolory nieba; `createScenery` — dekoracje w pikselach ekranu z paralaksą: Ogródek — pnącza z listkami przy krawędziach, drzewa na wzgórzach w oddali; Blok — ściany z oknami (część świeci) i balkonikami, w poziomie na całych bokach; Chmury — 4 duże chmury; Zorza — 3 wstęgi z gradientem; Kosmos — planety i 2 humbaki-gwiazdozbiory), `render.js` (oprawa po niebie, grządki z kiełkami i truskawkami przed płotkiem, lżejsze przyciemnienie boków kolumny 0,12), `SowaWChmurach/tilt.js` (`sideAngle` — oś według `screen.orientation.angle`; `tiltSpeed` — martwa strefa 3°, 9 m/s od 25°), `config.TILT`, `physics.stepOwl` (`keys.tilt` po przeciąganiu i klawiszach), `game.setTilt`, `main.js` (przełącznik „Przechylanie: wyłączone/włączone” na karcie tytułowej tylko przy czujniku i ekranie dotykowym, zgoda iPhone'a po geście, zapis `sowiegry_gry/jumper.tilt`, hak `tilt()`). Testy: `tests/unit/chmury-strefy.test.mjs` (6), e2e (przełącznik z zapisem w emulatorze i po przeładowaniu, przechył przesuwa sowę, atrapa zgody iPhone'a). Zrzuty wszystkich stref w pionie i poziomie sprawdzone (platformy czytelne na tle).

**Poprawka CI 83e9587:** w WebKit (CI) testy Chmur zależne od czasu gry ścigały się z wolnymi klatkami (Rakietka 3 s kończyła się, zanim test sprawdził chip; między krokami testu sowa łapała kózkę z trasy). Hak testowy `hold()` w `SowaWChmurach/main.js` wstrzymuje logikę w klatkach — przesuwa ją tylko `advance`; test przechylania otwiera nową kartę zamiast przeładowania (WebKit zgłasza przerwane zapytania kanału Firestore jako błędy strony — jak w `tory.spec.js`). Niestabilne (zielone przy powtórce) testy innych gier w WebKit: `ucieczka.spec.js` (pauza, samouczek, zapis w chmurze), `tory.spec.js` (finał, plansze), `menu.spec.js` (320 × 568) — do obserwacji.

**E6e — co jest gotowe:** `SowaWChmurach/tutorial.js` (`TUTORIAL_STEPS`: przeciągnij ≥ 1,5 m → 12 m wyżej → liść albo 15 s → dymek Pracu postawiony 1,4 m obok ostatniej gałązki: zdeptanie / trafienie albo 14 s → informacja o ratunku 5 s; `createTutorial` z `addHazard`; tryb bezpieczny gry w samouczku), `main.js` (podpowiedź `.chmury-tutorial` z pokazem gestu, `wantsTutorial` — pierwszy lot bez `tutorialDone` albo „Zagraj samouczek” / `?samouczek=1`, zapis `tutorialDone`, komunikat końcowy z priorytetem 3 i osobnym kluczem, `GUIDE_ID = "chmury"`, muzyka `flightMusic()` — `chmury` w locie, `humbak` w oceanie, hak `tutorial()`), instrukcja `chmury` w `shared/meta/guides-data.js` (7 kart), motyw `chmury` w `scripts/make-audio.mjs` (100 BPM, G-dur, 48 kb/s, 113 KB; budżet gry 502 KB), `LICENSES.md`. Testy: `tests/unit/chmury-samouczek.test.mjs` (4), `audio.test.mjs`, `gameplay-expansion.test.mjs`, e2e (samouczek w emulatorze, „Jak grać?”, muzyka lotu i oceanu). Karta menu: ilustracja „Chmury” i przycisk podglądu już są (E3, E6a) — nazwa karty zmieni się przy podmianie.

**Miejsce wznowienia — E6f (po akceptacji właściciela):** podmiana jak E4f (Sowia Ucieczka): rejestr `jumper` w `shared/sowie-platform.js` → nazwa „Sowa w Chmurach”, ścieżka `SowaWChmurach/`, `rebuilt: true`, bez `preview`; `SowaJumper/index.html` → strona przekierowania z zachowaniem parametrów adresu (wzór `SowaRunner/index.html`), usunięcie starych plików JS i `styles.css` z `SowaJumper/`; `guides-data.js` — klucz `chmury` zastępuje `jumper` (albo `jumper` dostaje treść `chmury`), `GUIDE_ID` w grze; aktualizacja testów (`menu.spec.js`, `architecture`, `pwa`, `owl-gallery`, `gameplay-expansion` — lista gier na starym interfejsie), `package.json` (`html`), `eslint.config.js`, dokumentacja główna i `SowaJumper/docs`. Do tego czasu — kolejne etapy bez czekania: **E7 Sowie Ogrody** (plan w rozdz. 6 Analizy 3).

### 8.8. E7 — Sowie Ogrody: plan kroków i miejsce wznowienia

Gra zostaje w folderze `SowieOgrody/` (identyfikator `ogrody`). Nowa logika — moduły ES w `SowieOgrody/ogrod/` (osobny `package.json` z `"type": "module"`, bo dawny `script.js` obok to zwykły skrypt). Podgląd: `SowieOgrody/nowa.html` — ten sam dokument gry w Firestore (`sowiegry/profil/sowiegry_gry/ogrody`). **Decyzja E7b (współistnienie):** podgląd zapisuje stan v3 jako JSON w osobnym polu `preview` (przez `updateGame`), a pole `state` (v2) zostaje wyłącznie dla dawnej gry — obie wersje działają obok siebie bez zmian w dawnej `script.js` i bez zmian reguł (dokument gry przyjmuje dowolne pola). Pierwsze wejście w podgląd przenosi `state` v2 (migracja), kolejne czytają `preview`. Przy podmianie (E7e): stan z `preview` (jeśli jest — inaczej migracja z `state`) zapisany do `state` z `saveVersion: 3`, pole `preview` usunięte. Dokładny opis: `SowieOgrody/docs/Documentation.md`, rozdział „Nowa odsłona”.

| Krok | Zakres (Analiza 2, rozdz. 3.4) | Stan |
|---|---|---|
| E7a | Checklista smaczków dawnej gry; `config.js` (6 rozdziałów z celami, 11 roślin, kamienie milowe, 16 ulepszeń, konewka, offline, prestiż, drzewko 3 × 3), `economy.js`, `state.js` (stan v3 i migracja z v2: bez strat — zwroty w liściach i nasionach), `garden.js` (silnik); testy i symulator tempa (pierwsze Wielkie Przesadzanie po 2–3 h aktywnej gry, kolejne cykle krótsze) | ✅ commit „E7a: …” |
| E7b | Strona `SowieOgrody/nowa.html` na Sowim Silniku: widoczny ogród (płótno — rośliny rosną, wygląd z kamieniami milowymi, sowa z atlasu), HUD (liście, liście/s, konewka), cel rozdziału, dolny panel na telefonie z 4 zakładkami (Rośliny ×1 / ×10 / max, Ulepszenia, Prestiż, Kolekcja), dwie kolumny na komputerze; zapis w polu `preview` (decyzja wyżej), postęp offline z czasu serwera (`updatedAt`) i po powrocie z tła, okno powitalne „Co urosło”; metryki Sowiej Akademii przez most SowieProgress (zamiast `window.SowieIdleGame` — `gameplay-expansion.js` nie jest ładowany w nowej odsłonie); przycisk podglądu w menu; e2e na telefonach (320 × 568) | ✅ commit „E7b: …” |
| E7c1 | Zdarzenia (logika, `ogrod/events.js`): telefon Pracu Pracu co 2–4 min (×0,7 do odrzucenia, Tryb samolotowy po 10 s), ciężarówka Amic (zastawia grządkę, 3 stuknięcia, Kozi kurier — 1; bez blokad offline), złota kózka co 60–120 s (×3 na 30 s / 60 s produkcji / kozi szał 15 s / +50% Plusk-o-metru, Kozie szczęście); Plusk-o-metr (podlewanie i kózki) i Zatoka Humbaka (20 s, łapanie liści z combo, nagroda — minuty produkcji, Echo humbaka); symulator ze zdarzeniami (nadal 2–3 h — po podrożeniu Bonsai i Mutanta ok. 143 min); na stronie podglądu zdarzenia wyłączone (`events: false`) do E7c2 | ✅ commit „E7c1: …” |
| E7c2 | Zdarzenia na ekranie: telefon, cysterna Amic na zastawionej grządce i złota kózka na płótnie (stuknięcie w nie) oraz przyciski reakcji nad ogrodem (≥ 44 px); Plusk-o-metr w HUD i przycisk „Zatoka Humbaka”; Zatoka jako nakładka płótna (woda, humbak z fontanną, liście do łapania, czas i combo); komunikaty; `events: true`; e2e (telefon, ciężarówka, kózka, Zatoka — przez haki testowe) | ✅ commit „E7c2: …” |
| **E7d** | Samouczek, instrukcja (nowy klucz w `guides-data.js`), muzyka, dźwięki, kontrakty dnia (dawne „Kontrakty ogrodnicze” z `gameplay-expansion.js`: 25 stuknięć, 6 zakupów, 2 podlania — XP i piórka; w nowej odsłonie jako karta w zakładce Kolekcja, stan dnia w polu `daily` dokumentu gry), dokumentacja, **podgląd do akceptacji właściciela** — w trzech krokach: E7d1 dźwięk i muzyka ✅ (motyw `ogrod` 84 BPM, efekty zdarzeń), E7d2 „Jak grać?” i samouczek ✅ (instrukcja `ogrod`, samouczek 4 kroki bez zatrzymywania czasu), E7d3 kontrakty dnia ✅ (`daily.js`, karta w Kolekcji, nagrody z identyfikatorami dawnej gry) | ✅ — **podgląd do akceptacji** |
| E7e | Po akceptacji: `index.html` → nowa gra, usunięcie `script.js`, `style.css` dawnej gry i `shared/stable-panel.js`; stan z pola `preview` przeniesiony do `state` (`saveVersion: 3`), wpis `preview` w rejestrze usunięty, `nowa.html` → przekierowanie do `./`; aktualizacja odwołań i testów | ⏳ |

**Podgląd do akceptacji właściciela (E7, `SowieOgrody/nowa.html` — w menu „Wypróbuj nową wersję: nowe Sowie Ogrody”).** Co sprawdzić: przeniesienie dawnego ogrodu przy pierwszym wejściu (okno „Witaj w nowym ogrodzie!”, rośliny i ulepszenia zostały, zwroty); samouczek (4 kroki) i „?” — „Jak grać?”; stukanie, zakupy ×1 / ×10 / max, cele rozdziałów (Parapet → … → Arboretum) i wygląd roślin przy 10/25/50/100 sztukach; konewka i Plusk-o-metr; telefon Pracu (od Balkonu), ciężarówka Amic (od Działki), złota kózka, Zatoka Humbaka; Wielkie Przesadzanie (po Szklarni, ok. 2 h 20 min aktywnej gry) i drzewko prestiżu; powrót po przerwie (okno „Witaj z powrotem!”); kontrakty dnia w Kolekcji; muzyka i dźwięki; wygląd na telefonie pionowo i poziomo oraz na komputerze. Dawna gra działa bez zmian obok (osobne pole zapisu `preview`).

**Miejsce wznowienia — E7e (po akceptacji):** `SowieOgrody/index.html` → nowa gra (zawartość `nowa.html`), `nowa.html` → przekierowanie do `./` z zachowaniem parametrów; `main.js` czyta stan z `state` (`saveVersion: 3`), a gdy jest pole `preview` — przenosi je do `state` i usuwa `preview` (jeden zapis); usunięcie `script.js`, `style.css` dawnej gry i `shared/stable-panel.js` (sprawdzić, kto jeszcze go używa), wpisu `preview` w rejestrze (`rebuilt: true`), przewodnik `ogrod` zastępuje `ogrody` (albo `ogrody` dostaje treść `ogrod`); `gameplay-expansion.js` przestaje obsługiwać `ogrody` (kontrakty są w grze); testy (`menu.spec.js` — podglądy, `architecture`, `pwa`, `gameplay-expansion`, `smoke`, `platform`), `package.json`, dokumentacja. Do tego czasu — kolejny etap: **E8 Sowia Szklarnia → „Łącz i Hoduj”** (Analiza 2, rozdz. 3.5; plan w rozdz. 6 Analizy 3).

### 8.9. E8 — Łącz i Hoduj: plan kroków i miejsce wznowienia

Nowa gra powstaje w `LaczIHoduj/` (podgląd; identyfikator `szklarnia`, wpis `preview: { path: "LaczIHoduj/", name: "Łącz i Hoduj" }` w rejestrze → przycisk „Wypróbuj nową wersję: Łącz i Hoduj” na karcie Sowiej Szklarni). Moduły ES (`package.json` z `"type": "module"`), czysta logika bez DOM (`board.js`, `game.js`) testowana w Node. **Zapis jak w E7b:** stan nowej gry (wersja 2) jako JSON w osobnym polu `preview` dokumentu `sowiegry/profil/sowiegry_gry/szklarnia` (przez `updateGame` — bez zmiany `state`, `saveVersion` i `rev`, więc dawna Szklarnia nie pyta o „nowszy postęp”); pole `state` (wersja 1) zostaje dla dawnej gry. Dokładny opis: `LaczIHoduj/docs/Documentation.md`.

| Krok | Zakres (Analiza 2, rozdz. 3.5) | Stan |
|---|---|---|
| E8a | 8.0 **prototyp**: plansza 7 × 9 (pole ≥ 44 px na 320 × 568; płótno przylega do siatki; telefon poziomo — plansza obrócona do 9 × 7, przyciski z boku), łańcuch Monstery (Nasionko → Kiełek → Sadzonka → Monstera → Złota Monstera), przeciąganie z uniesieniem przedmiotu nad palec (cel podświetlony: zielony — połączenie, niebieski — przeniesienie / zamiana) i zaznaczanie stuknięciem, Sowia doniczka (12 ładunków, 1 co 3 s), kompostownik (przeciągnięcie albo przycisk — wyjście z zapchanej planszy), liście monstery za połączenia i kompost, zapis w `preview`; checklista smaczków dawnej Szklarni w dokumentacji; testy: jednostkowe (m.in. plansza nigdy bez wyjścia) i e2e na telefonach | ✅ commit „E8a: …” — **punkt kontrolny właściciela** |
| E8b | 8.1 cztery łańcuchy (Monstera, Pilea, Paproć, Kaktus) i hybrydy (dwie różne rośliny najwyższego poziomu: Monpilea, Alopaproć, Złotolistka), doniczka z losowaniem łańcucha, zamówienia 3 sowich sąsiadek (liście i gwiazdki odnowy), odnawianie pomieszczeń szklarni (Doniczarnia, Sala Upraw, Zraszalnia…) | ⏳ po akceptacji prototypu |
| E8c | 8.2 przeszkody (karteczki i telefon Pracu, skrzynie i kanister Amic), 5 kózek-wzmacniaczy (Skoczek, Zjadaczka, Dżoker, Sprężynka, Taran), „Basen Humbaka” (co 5 zamówień, 45 s, rekord osobisty) | ⏳ |
| E8d | 8.3 pakiet startowy z dawnego stanu (`state` v1: liście → waluta, pomieszczenia → odnowione), samouczek, instrukcja (`guides-data.js`), muzyka i dźwięki, obsługa klawiatury na komputerze (płótno ma już `tabindex="0"`: strzałki — kursor pola, Enter / spacja — jak stuknięcie, Delete — kompost zaznaczonej), **podgląd do akceptacji** | ⏳ |
| E8e | Po akceptacji: podmiana — rejestr `szklarnia` → „Łącz i Hoduj”, `LaczIHoduj/`, `rebuilt: true`; stan z `preview` do `state` (`saveVersion: 2`); `SowiaSzklarnia/index.html` → przekierowanie z parametrami adresu, usunięcie `script.js`, `style.css`; aktualizacja odwołań i testów | ⏳ |

**Podgląd do sprawdzenia przez właściciela (punkt kontrolny E8, `LaczIHoduj/` — w menu „Wypróbuj nową wersję: Łącz i Hoduj” na karcie Sowiej Szklarni).** Co sprawdzić na telefonie: czy przeciąganie jest wygodne i precyzyjne (roślina unosi się nad palcem, podświetlone pole pokazuje, gdzie spadnie), łączenie nasionek aż do Złotej Monstery, Sowia doniczka (12 ładunków, 1 co 3 s), kompost (przeciągnięcie na przycisk albo zaznaczenie i przycisk), zapełnienie półek, powrót do gry (plansza i liście zostają), wygląd na najmniejszym telefonie i na komputerze. Dawna Szklarnia działa obok bez zmian. **Decyzja:** merge zostaje → E8b; nie podoba się → wariant zapasowy z Analizy 2, rozdz. 3.5 (idle z odwróconymi rolami: kozy pomagają, Pracu i Amic przeszkadzają, planowanie układu zamiast klikania).

**Miejsce wznowienia — po decyzji właściciela:** E8b (łańcuchy w `config.js` → `CHAINS` z czterema wpisami i `HYBRIDS`; `board.canMerge` rozszerzone o hybrydy dwóch różnych łańcuchów na najwyższym poziomie; `POT` z wagami łańcuchów; nowe pola stanu: `orders`, `stars`, `rooms` — `loadState` uzupełnia brakujące; rysunki nowych roślin w `render.js`; zamówienia: na 320 × 568 plansza ma tylko ok. 13 px zapasu wysokości przy polu 44 px, więc zamówienia muszą zająć miejsce istniejącego wiersza — np. ikony 3 zamówień w nagłówku zamiast tytułu, a tytuł tylko w `<title>` i `aria-label`). Do tego czasu — akceptacje E5–E7 (podmiany E5f, E6f, E7e).
