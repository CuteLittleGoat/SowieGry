# Analiza 3 — plan prac: kolejność wdrożenia

> Data: 2026-09-27 · Podstawa: [`ANALIZA_1_Firestore_zapis_postepu.md`](ANALIZA_1_Firestore_zapis_postepu.md) (wersja 2) i [`ANALIZA_2_Przebudowa_gier.md`](ANALIZA_2_Przebudowa_gier.md) (wersja 2) · Status: **plan**, bez zmian w kodzie.

---

## 0. Założenia planu

- **Decyzje właściciela:** jeden profil z hasłem `huhu` (jawnym w kodzie), stare wyniki do skasowania, wszystkie rekomendacje z analiz zaakceptowane, **gra głównie na telefonie**, ładne menu główne z wyborem gier, instrukcjami i galerią odblokowanych obrazków.
- **Każdy etap to zamknięta zmiana na `main`.** Na `main` zawsze jest grywalna wersja: stara gra działa, dopóki nowa nie jest gotowa i zaakceptowana.
- **Telefon jest miarą ukończenia.** Każdy etap kończy się testami automatycznymi na profilach telefonów i ręczną checklistą na prawdziwym telefonie (rozdział 3).
- **Minimum pracy „do kosza”.** Obecne gry dostają tylko drobne zmiany (podpięcie zapisu do Firestore), bo i tak zostaną przebudowane.
- **Zgodnie z `AGENTS.md`** każda zmiana gry aktualizuje jej `docs/Documentation.md` i `docs/README.md` (README po polsku, dla gracza), a zmiana modułów wspólnych aktualizuje dokumentację główną.
- Identyfikatory i foldery gier (`SowaRunner/`, `SowaJumper/`, `Sowa3/`, `SowieOgrody/`, `SowiaSzklarnia/`) zostają. Zmieniają się tylko nazwy wyświetlane w menu, więc adresy, zapisy i pamięć podręczna PWA pozostają spójne.
- Rozmiar etapów: **S / M / L** (mały / średni / duży), bez szacowania godzin.

---

## 1. Kolejność etapów

```
E0 Przygotowanie
 └─► E1 Chmura (Firestore + hasło)                    ← Analiza 1
      └─► E2 Fundament (silnik, telefon/PWA, postacie, dźwięk, wspólny interfejs)
           └─► E3 Menu główne (gry, instrukcje, galeria)
                └─► E4 Sowia Ucieczka (Runner)
                     └─► E5 Sowie Tory (Sowa3)
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
| E5 | Sowie Tory | L | E4 | druga nowa gra |
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

**Podgląd przed podmianą (E4–E8):** nowa wersja gry trafia najpierw na `main` jako `nowa.html` w folderze gry, z linkiem „Wypróbuj nową wersję” w ustawieniach menu. Po akceptacji właściciela (test na telefonie) kolejna zmiana robi z niej `index.html` i usuwa stare pliki.

---

## 2. Etapy szczegółowo

### E0 — Przygotowanie (S)

| # | Zadanie |
|---|---|
| 0.1 | Uruchomić `npm test` na obecnym `main` i zapisać stan wyjściowy (co przechodzi, co nie). |
| 0.2 | Playwright: profile telefonów `iPhone SE`, `iPhone 13`, `Pixel 7`, własny `Android 360×800` oraz `iPhone 13` w poziomie; silniki Chromium **i WebKit** (Safari). W CI: `npx playwright install --with-deps chromium webkit`. Obecne testy starych gier zostają na desktopowym Chromium, a nowe testy od początku biegną na telefonach. |
| 0.3 | Emulator Firestore: `firebase.json` (tylko emulator), `firestore.rules` (reguły z Analizy 1, rozdz. 9.2), `firebase-tools` jako devDependency, w CI krok `actions/setup-java` (Java 21). |
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

**Właściciel:** opublikować reguły z `firestore.rules` w konsoli Firebase (sprawdzić w Rules Playground, że drugi projekt działa), sprawdzić plan i limity, wpisać `huhu` na telefonie i zobaczyć w konsoli kolekcję `sowiegry`.

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
| 4.6 | Podgląd `nowa.html` → akceptacja → podmiana i usunięcie starych plików z `p5.js` włącznie (Analiza 2, rozdz. 6). |
| 4.7 | Dokumentacja gry. |

**Gotowe, gdy:** czas reakcji ≥ 1,1 s na 320 × 568 w pionie przy maksymalnej prędkości (test liczony z parametrów kamery i prędkości); obrót telefonu nie resetuje biegu; 60 kl./s na telefonie średniej klasy; gra < 800 KB; e2e na profilach telefonów zielone.

### E5 — Sowie Tory / Sowa3 (L) — Analiza 2, rozdz. 3.2

Rzutnia perspektywiczna i sortowanie po głębokości; swipe w 4 kierunkach (z martwymi strefami przy krawędziach); 4 plansze + tryb Nieskończony; przeszkody według typu (niska / wysoka / pełna / ruchoma); dziki, ludzie, donice i słupki jako dekoracje bez kolizji; kózki z „Kozią jazdą”; **grywalny** bonus „Humbacze Tory” po każdej planszy (przemiana w humbaka jako 2-sekundowe przejście); gwiazdki plansz; rekordy kampanii i trybu Nieskończonego; samouczek; muzyka na każdą planszę; podgląd → podmiana → usunięcie 16 starych plików; dokumentacja.

**Gotowe, gdy:** swipe działa jedną ręką bez wywoływania gestu „cofnij”; każda plansza ma przejście (test wzorów); bonus humbaka jest grywalny; e2e na telefonach zielone.

### E6 — Sowa w Chmurach / Jumper (M) — Analiza 2, rozdz. 3.3

Przeciąganie palcem w dolnej połowie ekranu + opcjonalne przechylanie (na iPhonie przycisk z prośbą o zgodę); 6 typów platform; Pracu do zdeptania, Amic do omijania; kózki z „Rakietką”; „Niebiański Ocean”; ratunek zamiast upadku; 5 stref wysokości; samouczek; podgląd → podmiana → usunięcie 11 starych plików; dokumentacja.

**Gotowe, gdy:** sterowanie jest płynne jedną ręką, a palec nie zasłania sowy; przechylanie działa na Androidzie i iPhonie po zgodzie; e2e na telefonach zielone.

### E7 — Sowie Ogrody (M) — Analiza 2, rozdz. 3.4

Czytelne moduły zamiast obecnego `script.js`; nowy format stanu z migracją ze stanu zapisanego w Firestore w E1 (`saveVersion`); rozdziały z celami; widoczny ogród; zdarzenia: telefon Pracu, ciężarówka Amic, złota kózka; „Zatoka Humbaka”; symulator ekonomii w testach (pierwszy prestiż po ok. 2–3 h); dolny panel (bottom sheet) na telefonie; postęp offline z czasu serwera i po powrocie z tła; usunięcie `shared/stable-panel.js`; podgląd → podmiana; dokumentacja.

**Gotowe, gdy:** symulator potwierdza tempo progresji; postęp z E1 wczytuje się bez strat; panel mieści się na 320 × 568; e2e na telefonach zielone.

### E8 — Łącz i Hoduj / Szklarnia (L) — Analiza 2, rozdz. 3.5

| # | Zadanie |
|---|---|
| 8.0 | **Prototyp**: plansza 7 × 9, jeden łańcuch Monstery, przeciąganie na telefonie. **Punkt kontrolny właściciela** — jeśli rozgrywka się nie podoba, przechodzimy na wariant zapasowy (idle z odwróconymi rolami). |
| 8.1 | 4 łańcuchy + hybrydy, „Sowia doniczka”, zamówienia sowich sąsiadek, odnawianie pomieszczeń szklarni. |
| 8.2 | Przeszkody: karteczki i telefon Pracu, skrzynie i kanister Amic; 5 kózek-wzmacniaczy; „Basen Humbaka” z rekordem. |
| 8.3 | Pakiet startowy z obecnego stanu `gry/szklarnia` (nowa `saveVersion`); samouczek; podgląd → podmiana → usunięcie starego `script.js`; dokumentacja. |

**Gotowe, gdy:** przeciąganie przedmiotów jest precyzyjne na 320 × 568 (pole ≥ 44 px, przedmiot uniesiony nad palcem); plansza nie może się zablokować bez wyjścia (test jednostkowy); e2e na telefonach zielone.

### E9 — Meta i sprzątanie (M) — Analiza 2, rozdz. 4.2

| # | Zadanie |
|---|---|
| 9.1 | Pełny `SowieProgress`: osiągnięcia, zadania dnia i tygodnia z nowych zdarzeń, piórka, XP i poziom gracza. |
| 9.2 | Sowi Butik: stroje, gatunki sów, dłuższe działanie kózek. |
| 9.3 | Nowe wymagania odblokowania 30 zdjęć galerii (propozycja do akceptacji właściciela). |
| 9.4 | Usunięcie starego kodu: `sowie-academy.js`, `gameplay-expansion.js`, `game-guides.js`, `notification-manager.js`, `modal-accessibility.js`, `sowie-runtime.js`, pasek narzędzi i dok z `sowie-core.js`, most z okresu przejściowego. |
| 9.5 | Usunięcie kodu kasującego stare klucze `localStorage` (gdy od E1 minęły 1–2 miesiące). |
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
| E1 | Opublikować reguły Firestore (z `firestore.rules`) i sprawdzić je w Rules Playground; sprawdzić plan i limity; wpisać `huhu` na telefonie i sprawdzić kolekcję `sowiegry` w konsoli. |
| E2 | Zaakceptować wygląd postaci w „Sowim Laboratorium”; opcjonalnie nagrać „Hu-hu!” i „Pracu pracu!” (np. dyktafon w telefonie); zainstalować SowieGry jako aplikację. |
| E3 | Zaakceptować wygląd menu na telefonie. |
| E4–E8 | Zagrać w wersję podglądową (`nowa.html`) na telefonie i dać zielone światło na podmianę. |
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
