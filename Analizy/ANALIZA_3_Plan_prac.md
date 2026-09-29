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

> Ostatnia aktualizacja: **2026-09-29**. Ten rozdział pozwala podjąć pracę w nowym oknie / nowej sesji bez znajomości wcześniejszej rozmowy. Po każdym zamkniętym kroku aktualizuj tabelę 8.2 i rozdział 8.5.

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
| E5 Sowie Tory | 🔧 w toku | E5a (rdzeń, podgląd `SowieTory/`) ✅; następny E5b — patrz 8.5 |
| E6 Sowa w Chmurach | ⏳ | — |
| E7 Sowie Ogrody | ⏳ | — |
| E8 Łącz i Hoduj | ⏳ | — |
| E9 Meta i sprzątanie | ⏳ | — |

### 8.3. Praktyczne wskazówki techniczne

- **Testy lokalnie:** `SOWIE_E2E_BEZ_WEBKIT=1 npm test` (ok. 8–10 min; ok. 260 testów e2e w Chromium). Pojedynczy plik: `node --test tests/unit/<plik>.test.mjs`; e2e: `SOWIE_E2E_BEZ_WEBKIT=1 npx firebase emulators:exec --only firestore --project demo-sowiegry "npx playwright test tests/e2e/telefon/<plik>.spec.js"`.
- **Serwer do ręcznych zrzutów:** `npx http-server . -p 4191 -c-1 -s` i skrypt Playwright (Chromium) z `?cloud=memory&seed=…` oraz odblokowanym urządzeniem (`localStorage["sowiegry:urzadzenie"] = {"unlocked":true,"deviceId":"d-test01","cleaned":true}` w skrypcie startowym kontekstu testu, nigdy w kodzie gry). Zatrzymanie: `pkill -x http-server` (**nie** `pkill -f …` — dopasowuje własną powłokę).
- **CI:** `.github/workflows/js-check.yml` (push na `main`, `audit/**`, PR). `retries: 1`, `workers: 2`. Przy czerwonym CI: artefakty `test-results` (ślady `trace.zip`: zdarzenia `before/after`, `screencast-frame`, `log`, `0-trace.network`) i log zadania.
- **Nowy folder gry** wymaga dopisania go do: `eslint.config.js` (moduły ES), `package.json` (`format`, `format:check`, `html`), `tests/unit/architecture.test.mjs` (`gamePages`, `projectScripts`), `tests/unit/pwa.test.mjs`, `tests/unit/owl-gallery.test.mjs`; folder ma `package.json` z `{"type":"module"}`.
- **Rejestr gier** (`shared/sowie-platform.js`): podgląd = `preview: { path, name }`; po podmianie: `name`, `path`, `rebuilt: true`, bez `preview`. `SowieCloud.currentGame()` rozpoznaje stronę po `path` albo `preview.path`.
- **Service worker** (`sw.js`): podnieś `VERSION`, gdy zmienia się lista `SHELL` albo strategia.
- **Dźwięk:** efekty i muzyka z `scripts/make-audio.mjs` (deterministycznie, lamejs); budżet gry < 800 KB (gzip) — lista `GAME_SOUNDS` w `config.js` gry ogranicza wczytywane efekty.
- **Komunikaty w grze:** najwyżej 1 naraz (`shared/ui/toasts.js`, `maxQueue: 3`, `priority`); wskazówki sterowania dostają `priority: 2`.

### 8.4. Wiedza z E4f: zawieszanie WebKit w CI

W CI (Playwright WebKit na Linuksie) strona Sowiej Ucieczki czasem zawieszała się na stałe tuż po starcie zapętlonej muzyki (po zdekodowaniu albo przy przełączeniu bieg ↔ humbak). Poprawka 2258a79: pętla muzyki to osobny bufor z jednym okrążeniem (`trimToLoop` w `shared/engine/audio.js`), grany w całości z `loop = true` — bez `loopStart`/`loopEnd` i bez startu z przesunięciem. Diagnostyka zostaje: fikstura `webAudioTrace` w `tests/e2e/fixtures.js` (WebKit: dekodowanie, start/stop długich nagrań, „strona żyje” co sekundę w konsoli → widać w śladzie nieudanego testu) i `DEBUG: pw:browser` w kroku e2e CI. Jeśli zawieszenie wróci: pobrać ślad, sprawdzić ostatnie wpisy `[webaudio …]` i wyjście przeglądarki w logu. Po kilku zielonych przebiegach `DEBUG` można usunąć (osobny mały commit).

### 8.5. E5 — Sowie Tory: plan kroków i miejsce wznowienia

Kroki (każdy osobnym commitem na `main`, z testami i dokumentacją `SowieTory/docs/`):

| Krok | Zakres (Analiza 3, E5) | Stan |
|---|---|---|
| **E5a** | 5.0 checklista smaczków obecnej Sowa3 + 5.1 rdzeń: rzutnia perspektywiczna, sortowanie po głębokości, mgła, przesunięcia w 4 kierunkach z martwymi strefami, stuknięcia przy bokach, klawiatura; przeszkody według typu; wzory z testem przejścia; kampania 4 plansz (prosta scenografia, krótka przerwa zamiast finału); podgląd w `SowieTory/` z wpisem `preview` dla `sowa3` | ✅ commit „E5a: Sowie Tory — rdzeń gry w podglądzie…” (pełne `npm test` lokalnie zielone: 278 e2e w Chromium); **sprawdzić CI** tego commita |
| **E5b** | 5.2 oprawa czterech plansz (Biedronka: regały, „SUPER CENA!”, pieczywo, pracownik z paleciakiem; festiwal: hala, stojaki, wózki z kwiatami, zraszacze, zwiedzający; PRL: bloki z wielkiej płyty, trzepak, ławka, kot na balkonie, gołębie; Amic: zadaszenie z zielonym pasem, sklep stacji, dystrybutory), skórki przeszkód na planszę (paleta, stojak promocyjny, wózki sklepowe, samochody, katalogi), ludzie/donice/słupki jako dekoracja bez kolizji, ≥ 30 wzorów w 4 progach; 5.3 pościg dzików na PRL (stado u dołu = życia, dzik szarżujący torem ze strzałką 1 s) | 🔧 **następny krok** (szczegóły niżej) |
| E5c | 5.4 finał: działka z basenem (szara ryflowana ścianka, niebieski rant, turkusowa woda, trawa, płot, drzewa, koza na leżaku, grill), sekwencja ok. 4 s (bieg → skok → plusk → przemiana w humbaka), skracanie tapnięciem po pierwszym obejrzeniu (`sowiegry_gry/sowa3.finishSeen`); 5.5 „Humbacze Tory” (20 s, 3 morskie tory, ↑ = wyskok, liście w kółkach, bez obrażeń), podsumowanie planszy z gwiazdkami (★ ukończenie, ★★ liście, ★★★ bez trafienia) | ⏳ |
| E5d | 5.6 kózki przeskakujące tory (Turbo → „Kozia jazda” 8 s), liście, combo, Gorączka Monster (najczęstsza na festiwalu), tryb Nieskończony po kampanii (4 plansze w pętli), rekordy kampanii i Nieskończonego (top 10 na poziom), dodatkowe życia | ⏳ |
| E5e | 5.7 samouczek, instrukcja w `shared/meta/guides-data.js` (klucz `sowa3`, nazwa „Sowie Tory”), ilustracja karty w menu, muzyka na każdą planszę (`scripts/make-audio.mjs`, budżet < 800 KB), tryb diagnostyczny, dokumentacja i README; **podgląd do akceptacji właściciela** | ⏳ |
| E5f | 5.8 po akceptacji: rejestr `sowa3` → „Sowie Tory”, `SowieTory/`, `rebuilt: true`; usunięcie 16 plików JS z `Sowa3/` (+ `style.css`), `Sowa3/index.html` → przekierowanie z parametrami adresu (jak `SowaRunner/index.html`), aktualizacja odwołań (testy, `package.json`, `eslint.config.js`, `guides-data.js`, menu, dokumentacja, Akademia/Galeria — teksty „w Sowa3”) | ⏳ |

**E5a — co jest gotowe (pliki w `SowieTory/`, dokładny opis w `SowieTory/docs/Documentation.md`):**

- `config.js` (tory co 1,6 m; rzutnia: kamera 4,2 m za sową, droga 84% szerokości w pionie / ≤ 115% wysokości w poziomie, horyzont 30% / 24%, sowa na 80% wysokości, mgła 38–64 m; sowa: skok 7,9 m/s przy g = 24, ślizg 0,7 s, zmiana toru 15 m/s; poziomy Chill 11→15 m/s 4 życia, Arcade 13→18 m/s 3 życia, Chaos 15→21 m/s 2 życia, +0,6/0,8/1 m/s na planszę; plansza 1200 m; typy przeszkód low/high/full; ruchomy telefon: strzałka 0,8 s, przejazd 0,35 s, zapas 0,6 s), `projection.js`, `physics.js`, `obstacles.js` (12 rodzajów Pracu/Amic ze sprite'ami z atlasu), `patterns.js` (język wzorów: 3 znaki na rząd; 23 wzory w progach 0–3; generator z oddechem co 4. wzór), `stages.js` (4 plansze w kolejności z obecnej gry), `game.js`, `render.js`, `main.js`, `index.html`, `style.css`, `package.json`, `docs/`.
- Poza folderem: wpis `preview: { path: "SowieTory/", name: "Sowie Tory" }` dla `sowa3` w `shared/sowie-platform.js`; `SowieTory` dopisane do `eslint.config.js`, `package.json` (`format`, `format:check`, `html`), `tests/unit/architecture.test.mjs`, `tests/unit/pwa.test.mjs`, `tests/unit/owl-gallery.test.mjs`; `tests/e2e/telefon/menu.spec.js` (karta Sowa3 ma przycisk podglądu `SowieTory/`); nowe testy `tests/unit/tory.test.mjs` (rzutnia, fizyka, kolizje, BFS przejścia każdego wzoru z każdego toru przy 9,35 / 18 / 24 m/s, generator, autopilot przechodzi kampanię bez trafienia, ruchomy telefon) i `tests/e2e/telefon/tory.spec.js`; dokumentacja: `SowieTory/docs/*`, `docs/Documentation.md`, `docs/README.md`, `Sowa3/docs/README.md` (notka o podglądzie).
- Zrzuty w Chromium (iPhone 13 pion/poziom) pokazały działającą drogę w perspektywie, sowę, przeszkody i liście; w poziomie pasek planszy przeniesiony pod przycisk pauzy.

**Miejsce wznowienia — E5b (plan techniczny):**

1. Najpierw sprawdzić, czy CI commita E5a jest zielone (także WebKit). Czerwone → naprawić przed E5b.
2. `SowieTory/props.js` — rekwizyty rysowane kodem w metrach (kontekst przesunięty do punktu na ziemi i przeskalowany, y w górę ujemne, kontur `#3b2f4a`): przeszkody `paleta` (niska, Amic), `stojak` („SUPER CENA!”, wysoka, Amic), `wozek-sklepowy` (pełna), `katalogi` (niska, Pracu), `stoisko` (stoisko Amic, pełna), `samochod` (pełna, długa ok. 4,5 m, widok od tyłu), `zadaszenie` (wysoka, Amic); dzik `drawBoar`; dekoracje `regal`, `piekarnia`, `pracownik` (z paleciakiem), `stojakRoslin`, `wozekKwiatow`, `zwiedzajacy`, `zraszacz`, `blok` (wielka płyta, kot na balkonie, gołębie), `trzepak`, `lawka`, `slupek`, `sklepAmic`, `pylon` (ceny paliw), `auto`, `donica`; elementy nad drogą `drawOverhead`: `baner` („SUPER CENA!”), `girlanda` (z balonami i napisem „FESTIWAL ROŚLIN”), `zadaszenie` (Amic), `napisPrl`. *(Szkic pliku powstał lokalnie w sesji 2026-09-29, ale nie został zatwierdzony — jeśli go nie ma w repo, napisać od nowa.)*
3. `SowieTory/scenery.js` — plan scenografii na planszę (`SCENERY[id] = { spacing, ground, side(slot, strona), overhead: { kind, every, height, width } }`) i `sceneryBetween(id, dystans, near, far)`; dekoracje zawsze poza korytarzem trzech torów (x ≥ połowa drogi + ok. 0,3–4 m) albo wysoko nad drogą. *(Też szkic lokalny, niezatwierdzony.)*
4. `obstacles.js`: nowe rodzaje z polem `prop` (rysunek z `props.js` zamiast sprite'a) i ich typy/głębokości; `stages.js`: `remap` rodzajów na planszę (Biedronka: `wozek → wozek-sklepowy`, `kanister → paleta`, `znak-cen → stojak`; festiwal: `dystrybutor → stoisko`, `teczka → katalogi`; Amic: `wozek → samochod`, `znak-cen → zadaszenie`; PRL bez zmian + dziki); `game.js` stosuje `remap` przy wstawianiu wzoru; test BFS sprawdza każdy wzór **na każdej planszy po zamianie** (samochód jest dłuższy niż wózek).
5. `patterns.js`: ≥ 30 wzorów (dopisać ok. 8–10, w tym wzory tylko dla wybranych plansz — pole `stages`, filtr w generatorze).
6. Pościg dzików (tylko PRL): parametry `BOARS` w `config.js` (pierwszy po ok. 140 m, potem co 110–170 m, strzałka 1 s, dzik szybszy od sowy o ok. 9 m/s, bez dzików w ostatnich 150 m); dzik celuje w tor sowy, ale tylko gdy inny tor jest wolny od pełnych przeszkód (inaczej przesunięcie o 15 m); trafienie jak zwykłe („Dzik! Uciekaj na inny tor!”, rodzina `dzik`); zdarzenia `boarWarning` / `boarCharge` / `nearMiss`; stado u dołu ekranu jako wskaźnik żyć (im mniej żyć, tym bliżej i większe). Testy: dziki tylko na PRL, strzałka 1 s przed szarżą, autopilot omija dziki, sowa bez ruchu dostaje od dzika.
7. `render.js`: scenografia z `scenery.js` (mgła, sortowanie po głębokości), rekwizyty z `props.js`, kolor poboczy z planu, dziki i strzałka szarży przy dolnej krawędzi toru, stado u dołu ekranu na PRL.
8. Zrzuty wszystkich 4 plansz (pion i poziom) w Chromium i ocena czytelności (dekoracje nie mogą wchodzić w korytarz torów); dokumentacja `SowieTory/docs/*` (checklista smaczków: odhaczyć 5.2/5.3), testy, `npm test`, commit „E5b: …”, CI.

Jeżeli pliki E5a nie istnieją w repo (sesja sklonowana przed wypchnięciem E5a) — odtworzyć je według `SowieTory/docs/Documentation.md` albo, gdy i jej brak, według Analizy 2 (rozdz. 3.2) i parametrów z listy wyżej.

### 8.6. Czynności właściciela — stan

| Etap | Stan |
|---|---|
| E1 | ✅ reguły opublikowane; do zrobienia przez właściciela: pierwsze wejście na stronę produkcyjną (`huhu`) i sprawdzenie kolekcji `sowiegry` w konsoli |
| E2, E3 | ✅ zaakceptowane (Fredoka, syntezowane dźwięki, postacie, menu; „Kasuj wszystko co stare i zbędne”) |
| E4 | ✅ podgląd zaakceptowany wstępnie, podmiana wykonana (E4f) |
| E5 | czeka: po E5e — test podglądu Sowich Torów na telefonie i zielone światło na podmianę (E5f) |
