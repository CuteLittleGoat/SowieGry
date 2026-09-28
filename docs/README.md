# SowieGry — instrukcja obsługi

## Jak zacząć

1. Otwórz stronę SowieGry (GitHub Pages) — najlepiej na telefonie, w pionie.
2. Przy pierwszym wejściu na danym urządzeniu pojawi się ekran **„Hasło sowy”**. Wpisz `huhu` i stuknij **Wejdź** (albo „Idź”/Enter na klawiaturze).
   - wielkość liter i spacje na początku i końcu nie mają znaczenia („Huhu” też zadziała),
   - przycisk z okiem 👁 pokazuje wpisane hasło,
   - przy błędzie pojawi się komunikat „Hu-hu? To nie to hasło 🦉” — można próbować dowolnie wiele razy.
3. Urządzenie zapamięta hasło. Kolejne wejścia prowadzą od razu do menu.
4. W menu stuknij kartę gry. Na ekranie gry wybierz poziom trudności.

Najpewniejszym sposobem uruchomienia jest GitHub Pages albo lokalny serwer HTTP. Przy bezpośrednim otwieraniu plików przez `file://` część funkcji przeglądarki może nie działać.

## Gry

- `SowaRunner` — boczny endless runner.
- `SowaJumper` — pionowy jumper arcade.
- `Sowa3` — trzytorowy runner w perspektywie w głąb ekranu.
- `Sowie Ogrody` — gra idle: sadź, podlewaj, automatyzuj.
- `Sowia Szklarnia` — gra idle: buduj szklarnię, krzyżuj rośliny, przeganiaj kozy.

Gry zręcznościowe mają:

- poziomy `Chill`, `Arcade` i `Chaos` (rekordy osobno dla każdego poziomu),
- dodatkowe życia,
- zabezpieczenia przed niemożliwymi układami,
- combo,
- bliskie uniki „O włos!”,
- złote i tęczowe liście,
- gorączkę monster,
- kosmetyki i misje,
- pauzę i ustawienia dźwięku,
- tryb diagnostyczny `?debug=1`.

## Zapis postępu w chmurze

Cały postęp — profil, kosmetyki, misje, Sowia Akademia, Galeria Sów, rekordy i stan gier idle — zapisuje się automatycznie w chmurze (baza Firestore). Dzięki temu:

- **ten sam postęp jest na telefonie i na komputerze** (rekord zrobiony na telefonie widać na komputerze i odwrotnie),
- wyczyszczenie danych przeglądarki nie kasuje postępu — wystarczy znów wpisać `huhu`,
- bez internetu (metro, słaby zasięg) gra działa dalej, a zapis wyśle się, gdy wróci sieć,
- przejście do innej aplikacji albo zablokowanie telefonu od razu zapisuje postęp.

Gdy nie da się połączyć z chmurą przy pierwszym wejściu (np. brak internetu), u góry ekranu pojawia się pasek „Tryb offline — postęp z tej sesji nie zostanie zapisany.”.

Jeśli grasz w grę idle na dwóch urządzeniach naraz, gra zapyta: „Na innym urządzeniu zapisano nowszy postęp — wczytać?”. **Wczytaj** pobiera nowszy stan, **Zostań przy tym** zostawia obecny (i zapisze go jako najnowszy).

Stare wyniki zapisane w przeglądarce przed przejściem na chmurę zostały skasowane (decyzja właściciela) — gra usuwa wyłącznie własne stare dane, dane innych stron zostają nietknięte.

**Safari na iPhonie:** jeśli gry są otwierane w Safari (a nie jako aplikacja na ekranie głównym), Safari może po 7 dniach bez wizyty zapomnieć hasło. Wtedy wystarczy znów wpisać `huhu` — postęp jest bezpieczny w chmurze.

## Rekordy

W grach zręcznościowych zapisywane są najlepszy wynik (i dystans lub wysokość) dla każdego poziomu trudności, 10 najlepszych rozgrywek, ostatnie gry oraz rekordy wyzwania dnia.

Przycisk **🏆** w prawym górnym rogu gry otwiera okno **Rekordy**: przełącz poziom (Chill / Arcade / Chaos), zobacz najlepszy wynik, top 10, ostatnie 10 gier i rekordy wyzwania dnia. W grach idle okno pokazuje podsumowanie postępu (np. liście zebrane w całej grze).

## Ustawienia i wylogowanie

Przycisk ⚙ w grze otwiera okno **Ustawienia**:

- muzyka, efekty dźwiękowe, komentarze sowy i ograniczone efekty (włącz/wyłącz),
- **Zapis postępu** — stan połączenia (np. „zapisano w chmurze ☁️”, „zapisywanie…”, „tryb offline”),
- **Wyloguj to urządzenie** — urządzenie zapomina hasło i pokazuje ekran „Hasło sowy”. Postęp zostaje w chmurze.

## Testy

Test uruchomieniowy w przeglądarce: otwórz `tests/smoke.html` przez lokalny serwer (np. `npm run serve`, potem `http://127.0.0.1:4173/tests/smoke.html`). Ten test działa w trybie pamięci i nie zapisuje niczego w chmurze.

Pełne testy automatyczne (dla osoby rozwijającej gry):

1. Zainstaluj Node.js 22 i Javę 21 (potrzebna emulatorowi bazy Firestore).
2. `npm install`
3. `npx playwright install --with-deps chromium webkit`
4. `npm test`

`npm test` sprawdza składnię, styl, HTML, testy jednostkowe, reguły bazy i testy w przeglądarce. Testy w przeglądarce działają na **emulatorze** bazy (projekt testowy `demo-sowiegry`) i na profilach telefonów (iPhone SE, iPhone 13 w pionie i poziomie, Pixel 7, Android 360 × 800) w Chromium i Safari (WebKit). Testy nigdy nie zapisują niczego w prawdziwej bazie.

Jeśli na komputerze nie da się uruchomić WebKit, można jednorazowo pominąć go poleceniem `SOWIE_E2E_BEZ_WEBKIT=1 npm test` (w automatycznych testach na GitHubie WebKit działa zawsze).

**Uruchomienie lokalne (`npm run serve`, adres `localhost` / `127.0.0.1`) domyślnie działa w trybie pamięci** — nic nie trafia do prawdziwej bazy, a postęp znika po odświeżeniu. Tryby można wybrać parametrem adresu:

- `?cloud=memory` — tylko pamięć (testy),
- `?cloud=emulator` — emulator bazy na komputerze (`npm run emulator -- "…"`),
- `?cloud=firestore` — prawdziwa baza (tylko świadomie).
