# Sowie Ogrody — instrukcja gry

## Jak grać

Otwórz grę przyciskiem **Graj** na karcie **Sowie Ogrody** w menu głównym (ze znaczkiem „Nowe!”). Sowa ogrodniczka
zaczyna od parapetu, a kolejne rozdziały z celami prowadzą przez Balkon, Działkę, Basen i Szklarnię aż do Arboretum.

- **Samouczek:** przy pierwszym wejściu dymek u góry ogrodu prowadzi przez 4 krótkie kroki (stuknięcia, pierwsza
  Monstera, cele rozdziału, wydarzenia). Kroki z akcją zaliczają się same, pozostałe — przyciskiem **„Dalej”**;
  **„✕”** pomija samouczek. Ogród rośnie przy tym normalnie.
- **„Jak grać?”:** przycisk **„?”** obok „Menu” otwiera krótką instrukcję z obrazkami; jest w niej przycisk
  **„Zagraj samouczek”**, który uruchamia samouczek jeszcze raz. Samouczek powtórzysz też przyciskiem
  **„Powtórz samouczek”** na dole zakładki **Kolekcja**, a w menu głównym (zakładka **Sowa** → **Ustawienia**) przycisk
  **„Powtórz samouczki we wszystkich grach”** pokaże go przy następnym wejściu.
- **Pierwsze wejście po zmianie gry:** ogród z dawnej wersji przenosi się sam. Okno **„Witaj w nowym ogrodzie!”**
  mówi, co zostało, i ile liści (oraz nasion) dostajesz za ulepszenia, których w nowej wersji nie ma. Postęp
  z wersji próbnej (przycisk „Wypróbuj nową wersję”) też zostaje — bez dodatkowego okna.
- **Liście:** stukaj w ogród — każde stuknięcie daje liście (napis „+N” w miejscu palca). U góry widać liczbę liści
  i ile przybywa na sekundę.
- **Cel rozdziału:** pod licznikiem jest bieżący rozdział (np. „Rozdział 1/6: Parapet”) i jego cele z postępem.
  Po wykonaniu wszystkich otwiera się kolejny rozdział z nowymi roślinami i ulepszeniami.
- **Panel na dole** (na komputerze i telefonie poziomo — po prawej) ma cztery zakładki:
  - **Rośliny** — kup ×1 (cena na przycisku), ×10 albo **max** (ile Cię stać). Przy 10, 25, 50 i 100 sztukach
    roślina zmienia wygląd, a przy 25 i 100 produkuje dwa razy więcej;
  - **Ulepszenia** — od najtańszych; m.in. **Konewka sowy**, po której zakupie u góry pojawia się przycisk
    **„Podlej”** (ładunki, np. 3/3): podlanie podwaja produkcję na chwilę, a ładunki same się odnawiają;
  - **Prestiż** — **Wielkie Przesadzanie** (po Szklarni): ogród zaczyna od nowa, ale dostajesz nasiona na stałe
    ulepszenia w drzewku (Korzenie, Woda, Sen). Przed przesadzeniem gra zapyta, czy na pewno;
  - **Kolekcja** — na górze **kontrakty dnia** (25 stuknięć, 6 kupionych roślin, 2 podlania — liczone od pierwszego
    wejścia danego dnia); wykonany kontrakt odbierasz przyciskiem **„Odbierz”** i dostajesz XP oraz piórka Sowiej
    Akademii. Niżej rozdziały, gatunki w ogrodzie i statystyki.
- **Wydarzenia w ogrodzie** (przycisk pojawia się przy dolnej krawędzi ogrodu; możesz też stuknąć w samą postać):
  - **telefon Pracu Pracu** (od Balkonu, co kilka minut) — dopóki dzwoni, ogród rośnie o 30% wolniej. Stuknij
    **„Odrzuć”** albo telefon w lewym górnym rogu. Ulepszenie **Tryb samolotowy** wycisza go samo po 10 s;
  - **ciężarówka Amic** (od Działki) — zastawia jedną roślinę, która wtedy nic nie daje. Stuknij ją 3 razy
    (albo przycisk **„Przegoń”**); z ulepszeniem **Kozi kurier** wystarczy raz;
  - **złota kózka** (co 1–2 minuty) — przebiega przez ogród przez 7 sekund. Złap ją (**„Złap kózkę!”**), a dostaniesz
    premię: produkcja ×3 na 30 s, liście z minuty produkcji, kozi szał (kózka sama zbiera liście przez 15 s) albo
    porcję Plusk-o-metru;
  - **Plusk-o-metr** (prawy górny róg ogrodu) napełnia się przy podlewaniu i łapaniu kózek. Pełny otwiera
    **Zatokę Humbaka**: przez 20 sekund humbak wyrzuca liście z fontanny — stukaj w nie, zanim spadną. Każdy złapany
    liść to kilka sekund produkcji, a łapanie pod rząd (combo) daje więcej.
    Gdy zamkniesz grę, wydarzenia nie przeszkadzają — po powrocie telefonu i ciężarówki już nie ma.
- **Gdy Cię nie ma:** ogród rośnie dalej (połowa zwykłej produkcji, najwyżej 4 godziny). Po powrocie okno
  **„Witaj z powrotem!”** pokaże, jak długo sowa doglądała ogrodu i ile urosło.
- **Dźwięk:** po pierwszym dotknięciu gra spokojna muzyka ogrodu (w Zatoce Humbaka — pieśń humbaka), a stuknięcia,
  zakupy i wydarzenia mają swoje dźwięki. Głośność muzyki i efektów ustawisz w menu głównym (zakładka „Sowa”).
- Przycisk **Menu** (lewy górny róg) wraca do menu głównego.

## Zapis

Gra zapisuje postęp automatycznie w chmurze (Firestore) — ten sam ogród na telefonie i komputerze. Przy pierwszym
wejściu na nowym urządzeniu trzeba raz wpisać hasło `huhu`.

- zwykła gra zapisuje się co pół minuty, a ważne akcje (rozdział, ulepszenie, przesadzanie) po 2 sekundach;
- przejście do innej aplikacji lub zablokowanie telefonu zapisuje postęp od razu;
- bez internetu gra działa dalej, a zapis wyśle się, gdy wróci zasięg.

## Rekordy

W menu głównym (zakładka **Sowa** → **Rekordy** przy Sowich Ogrodach) widać liście zebrane w całej grze, liczbę
Wielkich Przesadzań i bieżący rozdział. Na karcie gry jest liczba liści.

## Stary adres

Dawny adres wersji próbnej (`SowieOgrody/nowa.html`) sam przenosi do gry.

## Gra jako aplikacja na telefonie

SowieGry można dodać do ekranu głównego (Android: menu ⋮ → „Zainstaluj aplikację”; iPhone: „Udostępnij” → „Do ekranu
początkowego”). Gra otwierana wcześniej uruchomi się wtedy także bez zasięgu.
