# SowieGry — instrukcja obsługi

## Jak zacząć

1. Otwórz stronę SowieGry (GitHub Pages) — najlepiej na telefonie, w pionie.
2. Przy pierwszym wejściu na danym urządzeniu pojawi się ekran **„Hasło sowy”**. Wpisz `huhu` i stuknij **Wejdź** (albo „Idź”/Enter na klawiaturze).
   - wielkość liter i spacje na początku i końcu nie mają znaczenia („Huhu” też zadziała),
   - przycisk z okiem 👁 pokazuje wpisane hasło,
   - przy błędzie pojawi się komunikat „Hu-hu? To nie to hasło 🦉” — można próbować dowolnie wiele razy.
3. Urządzenie zapamięta hasło. Kolejne wejścia prowadzą od razu do menu.
4. W menu stuknij **Graj** na karcie gry. Na ekranie gry wybierz poziom trudności.

## Menu główne

Na dole ekranu jest pasek z czterema zakładkami: **Gry**, **Jak grać**, **Galeria** i **Sowa**. Na górze: napis SowieGry, stan zapisu (np. „Zapisano”, „Zapisuję…”, „Offline”; na małym telefonie sama ikona chmurki) i przycisk ustawień (koło zębate). Pod nim Sówka w dymku — stuknij ją, a podskoczy i przywita się „hu-hu!”. W dymku widać też kropki zadań dnia (zielona = zrobione).

- **Gry** — pięć kart na krętej ścieżce przez Sowi Świat: Łąka (Sowia Ucieczka), Chmury (SowaJumper), Miasto (Sowa3), Ogród (Sowie Ogrody), Szklarnia (Sowia Szklarnia). **Sowia Ucieczka** to przebudowany SowaRunner (znaczek **„Nowe!”** na karcie; instrukcja: `SowiaUcieczka/docs/README.md`) — Twoje rekordy z SowaRunner zostały, a stary adres gry sam przenosi do nowej. Na karcie jest ruchomy obrazek z postaciami, opis, Twój rekord (np. „Rekord: 1250 m”) oraz przyciski **Graj** i **Jak grać?** (krótka instrukcja tej gry w oknie; z okna też można od razu zagrać). Rekordy wczytują się z chmury po chwili — do tego czasu w ich miejscu miga szary pasek. Na tablecie i komputerze karty układają się w siatkę. Pod kartami jest karta **Zainstaluj SowieGry na telefonie** (znika, gdy gra działa jako aplikacja).
- **Jak grać** — instrukcje wszystkich gier: najpierw „Poznaj Sowi Świat” (kim są Sówka, Pracu Pracu, Amic, kózki, humbak), potem każda gra. Karty przesuwa się palcem w bok; na karcie „Sterowanie” animowana kropka pokazuje gest (stuknięcie, przytrzymanie, przesunięcie).
- **Galeria** — 30 zdjęć sów. Licznik (np. „3 / 30”) i filtry: **Wszystkie**, **Odblokowane**, **Do zdobycia**. Zablokowane zdjęcie jest rozmyte, ma kłódkę, opis celu (np. „Przebiegnij 1000 m w Sowiej Ucieczce”) i pasek postępu. Nowo zdobyte zdjęcie ma znaczek **Nowe!**, obraca się przy pierwszym pokazaniu i słychać „hu-hu”. Stuknięcie w zdjęcie otwiera je na cały ekran:
  - przesuń palcem w lewo / w prawo — następne / poprzednie zdjęcie (albo strzałki po bokach),
  - dwa palce albo podwójne stuknięcie — powiększenie (podwójne stuknięcie jeszcze raz — powrót),
  - przesuń w dół albo ✕ — zamknięcie,
  - **Ulubione** — serduszko przy zdjęciu w galerii,
  - **Tło menu** — zdjęcie staje się tłem menu (stuknij jeszcze raz, żeby wrócić do nieba),
  - pod zdjęciem autor i link do źródła (Pexels).
- **Sowa** — Twój profil: poziom, punkty doświadczenia (XP) i piórka Sowiej Akademii; **Zadania** (trzy zadania dnia i jedno tygodnia — nagrody przychodzą same); **Garderoba** (dodatek, który sowa nosi we wszystkich grach; przy zablokowanym widać, co trzeba zrobić, np. „Zbierz 20 liści monster (12 / 20)”); **Rekordy** każdej gry (przycisk „Rekordy” — najlepszy wynik i 10 najlepszych gier na każdym poziomie trudności; w Sowich Torach osobno **Kampania** i tryb **Nieskończony**); **Ustawienia** (patrz niżej).

Menu działa też z klawiatury: strzałki w lewo / w prawo przełączają zakładki, Tab przechodzi po przyciskach. Adres strony pamięta zakładkę (np. `…/#galeria`), a `…/#jak-grac-runner` otwiera od razu instrukcję Sowiej Ucieczki. Po pierwszym dotknięciu w menu gra cicha muzyka (można ją wyłączyć suwakiem „Muzyka”).

Najpewniejszym sposobem uruchomienia jest GitHub Pages albo lokalny serwer HTTP. Przy bezpośrednim otwieraniu plików przez `file://` część funkcji przeglądarki może nie działać.

## Instalacja na telefonie (aplikacja)

SowieGry można dodać do ekranu głównego telefonu — wtedy działają jak aplikacja: bez paska przeglądarki, na pełnym ekranie, a menu i gry otwierane wcześniej uruchamiają się także bez zasięgu.

- **Android (Chrome):** przycisk **Zainstaluj** na karcie „Zainstaluj SowieGry na telefonie” w menu (albo menu ⋮ → **Zainstaluj aplikację** / „Dodaj do ekranu głównego”).
- **iPhone (Safari):** przycisk **Udostępnij** → **Do ekranu początkowego** → **Dodaj** (tę instrukcję pokazuje też karta w menu).

Po instalacji Safari nie zapomina hasła po 7 dniach bez wizyty.

## Sowie Laboratorium

Strona testowa `lab/` (adres strony + `/lab/`) służy do sprawdzania na telefonie nowego silnika gier:

- **Postacie** (otwiera się od razu) — wszyscy bohaterowie nowych gier w ruchu: Sówka (stoi i mruga, biegnie, skacze, szybuje, jest oszołomiona, cieszy się), 9 dodatków z garderoby, 5 skaczących kózek, humbak z pluskiem, rodzina Pracu Pracu (dymek, telefon, telefon od Magdy, stos papierów, maile, tablica „Przyjmiesz zmianę?”, budzik), rodzina Amic (dystrybutor, cysterna, znak z cenami, wózek z kanistrami, barierka, kanister, sterowiec), liście monstery (zielony, złoty, tęczowy) i serduszka-życia. Przyciski u góry zakładają wybrany dodatek animowanym sowom (wygląd postaci zaakceptowany przez właściciela);
- **Dźwięk** — pierwsze dotknięcie włącza dźwięk. Suwaki: głośność ogólna, muzyka i efekty (0–100, zapisują się w profilu i działają na każdym urządzeniu); wibracje (tylko Android); muzyka: „Motyw menu” i „Pieśń humbaka” (grają w kółko bez przerwy), „Ścisz muzykę (jak w bonusie)”, „Zatrzymaj muzykę”; przyciski wszystkich 27 efektów (skok, liść, trafienie przez Pracu i Amic, kózka, plusk humbaka, rekord, koniec gry „hu-hu”…) i „Seria liści (combo)” — każdy kolejny liść brzmi wyżej. Na iPhonie (iOS 17 i nowsze) dźwięk gry respektuje przełącznik wyciszenia i nie wyłącza muzyki z innych aplikacji;
- **Interfejs** — wspólne elementy nowych gier na małej planszy z biegnącą sową: licznik punktów i liści, serduszka-życia, licznik power-upu, komunikaty (w trakcie gry zawsze jeden, u góry — nie zasłania sowy), menu pauzy (Wznów, Zacznij od nowa, Jak grać, Ustawienia z suwakami dźwięku, wibracjami i Trybem Przytulnym, Garderoba, Wyjdź do menu), odliczanie 3-2-1 po wznowieniu i ekran wyników („Nowy rekord!”, miejsce w top 10, zadania, „Jeszcze raz”). Przyciski pod planszą symulują grę: liście, kózka, trafienie, pięć komunikatów naraz, pauza, koniec gry, okno „Poznaj Sowi Świat”;
- **Gesty** — stuknij, przytrzymaj, przesuń w cztery strony; różowe pasy przy krawędziach to „martwe strefy” (gest „cofnij” przeglądarki i pasek domowy iPhone’a nie uruchamiają gry);
- **Informacje** — płynność (klatki na sekundę), rozmiar ekranu, bezpieczne obszary (wycięcie, Dynamic Island), tryb aplikacji, praca bez zasięgu, zapis w chmurze;
- **Test pauzy i odliczania** — tak zachowa się gra po przejściu do innej aplikacji: pauza, „Graj dalej”, potem 3-2-1;
- **Oszczędzanie baterii** — 30 klatek na sekundę i mniej efektów; gra sama zaproponuje ten tryb, gdy będzie zwalniać.

## Gry

- `Sowia Ucieczka` (folder `SowiaUcieczka/`, dawny SowaRunner) — ucieczka przed Chmurą Pracu: skoki, szybowanie, ślizg, kózki, rejs na humbaku, zadania biegu i wyzwanie dnia. Stary adres `SowaRunner/` przekierowuje do nowej gry.
- `SowaJumper` — pionowy jumper arcade.
- `Sowa3` — trzytorowy runner w perspektywie w głąb ekranu. Jego nowa wersja, **Sowie Tory** (folder `SowieTory/`, instrukcja: `SowieTory/docs/README.md`), jest już w podglądzie: na karcie Sowa3 w menu stuknij **„Wypróbuj nową wersję: Sowie Tory”**. Rekordy liczą się wspólnie z Sowa3.
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

## Komunikaty w grach

W Sowiej Ucieczce, SowaJumper i Sowa3 komunikaty w trakcie gry pojawiają się pojedynczo, u góry ekranu, żeby nie zasłaniały sowy. Komunikaty o zadaniach Akademii, zdjęciach Galerii i ukończonych misjach garderoby Sowia Ucieczka pokazuje dopiero na ekranie wyników.

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

W menu głównym ustawienia są w zakładce **Sowa** (przycisk z kołem zębatym u góry prowadzi prosto do nich):

- suwaki **Głośność ogólna**, **Muzyka** i **Efekty dźwiękowe** (muzyka albo efekty na 0 wyłączają je też w grach),
- **Efekty (wstrząsy, cząsteczki)**, **Wibracje** (tylko Android), **Tryb Przytulny** (wolniej, bez końca gry — zadziała w nowych wersjach gier), **Komentarze sowy**,
- stan zapisu (np. „Postęp jest zapisany w chmurze.”),
- **Wyloguj to urządzenie** — po potwierdzeniu urządzenie zapomina hasło i pokazuje ekran „Hasło sowy”. Postęp zostaje w chmurze.

Ustawienia zapisują się w profilu, więc obowiązują na każdym urządzeniu.

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

Dźwięki (efekty i muzyka) powstają z kodu `scripts/make-audio.mjs` (własna twórczość, bez cudzych nagrań — `assets/audio/LICENSES.md`). Własne nagrania „Hu-hu!” i „Pracu pracu!” można podmienić: plik WAV do `assets/audio/glosy/` (instrukcja w `LICENSES.md`), potem `node scripts/make-audio.mjs`.

Grafiki postaci to pliki SVG w `assets/svg/` — można je poprawiać w dowolnym edytorze grafiki wektorowej (np. Inkscape), używając kolorów z palety (`shared/world/tokens.css`). Po zmianie grafiki podnieś numer `VERSION` w `sw.js`, żeby zainstalowana aplikacja pobrała nową wersję. Czcionka to Fredoka (licencja OFL, `assets/fonts/OFL.txt`) z dołożonymi polskimi literami.

Jeśli na komputerze nie da się uruchomić WebKit, można jednorazowo pominąć go poleceniem `SOWIE_E2E_BEZ_WEBKIT=1 npm test` (w automatycznych testach na GitHubie WebKit działa zawsze).

**Uruchomienie lokalne (`npm run serve`, adres `localhost` / `127.0.0.1`) domyślnie działa w trybie pamięci** — nic nie trafia do prawdziwej bazy, a postęp znika po odświeżeniu. Tryby można wybrać parametrem adresu:

- `?cloud=memory` — tylko pamięć (testy),
- `?cloud=emulator` — emulator bazy na komputerze (`npm run emulator -- "…"`),
- `?cloud=firestore` — prawdziwa baza (tylko świadomie).
