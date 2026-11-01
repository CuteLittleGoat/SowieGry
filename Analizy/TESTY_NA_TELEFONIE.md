# Testy na telefonie — co kliknąć i co powinno się stać

Ten plik jest dla osoby, która testuje gry na telefonie. Każdy test to kilka kroków i opis, co **powinno być**.
Po każdej poprawce dopisuję tu nowy test (najnowsze są na górze listy w rozdziale „Spis”).

**Jeśli coś wygląda inaczej niż w opisie:** zapisz numer testu i kroku (np. „B2, krok 4”), co się stało, na jakim
telefonie — i jeśli się da, zrób zrzut ekranu.

## Zanim zaczniesz

1. Telefon trzyma w pamięci poprzednią wersję gier. Po każdej poprawce **odśwież stronę dwa razy** (w Safari:
   strzałka w kółko obok adresu) albo **zamknij aplikację i otwórz ją ponownie dwa razy**.
2. Testy robimy w pełnej wersji (zwykły adres SowieGry albo aplikacja na ekranie głównym), nie w wersji demo.
3. Postęp w grach jest prawdziwy i się zapisuje — testy niczego nie kasują.

## Spis

| Test | Co sprawdza | Od kiedy |
|---|---|---|
| O1 | Sowie Ogrody: duże liczby pokazują się dobrze (150 mln) | 2026-11-01 |
| L1 | Łącz i Hoduj: podpowiedzi widać w całości | 2026-11-01 |
| U1 | Sowia Ucieczka: humbak mniej więcej raz na krainę | 2026-11-01 |
| G1 | Galeria: zamiast podobnych zdjęć — nowe | 2026-11-01 |
| B1–B4 | Sowi Butik: zakupy i kolory sowy nie cofają się, przeprosinowe piórka | 2026-11-01 |

---

## B — Sowi Butik (kolory sowy)

Poprawka: zakup i wybór koloru sowy zapisują się teraz od razu, a spóźniona odpowiedź z internetu nie może już
cofnąć zakupu. Kolory i stroje, które wcześniej zniknęły, a były zapisane w historii zakupów, wracają same.

### B1 — przeprosinowe piórka

1. Otwórz SowieGry (menu główne).
2. **Powinno być:** pojawia się komunikat „Przeprosiny za Sowi Butik · Zakupy w Butiku zapisują się już od razu ·
   +0 XP · +50 piórek”.
3. Stuknij na dole zakładkę **Sowa** i przewiń do **Sowi Butik**.
4. **Powinno być:** liczba piórek w nagłówku Butiku jest o 50 większa niż przed poprawką.
5. Zamknij aplikację i otwórz ją ponownie.
6. **Powinno być:** komunikatu o przeprosinach już nie ma (dostaje się je tylko raz), a liczba piórek się nie zmieniła.

### B2 — Płomykówka zostaje kupiona i wybrana

1. Zakładka **Sowa** → **Sowi Butik** → **Gatunki sów** → wiersz **Płomykówka**.
2. Jeśli przy Płomykówce jest przycisk **Wybierz** — stuknij go (to znaczy, że wcześniejszy zakup wrócił). Jeśli jest
   przycisk z ceną **🪶 70** — stuknij go, a w okienku „Kupić w Sowim Butiku?” stuknij **Kup**.
3. **Powinno być:** przy Płomykówce napis **Wybrana**, a sówka w profilu (na górze zakładki „Sowa”) jest złocista
   z białą twarzą.
4. Poczekaj **1 minutę**, nic nie klikając.
5. **Powinno być:** dalej „Wybrana” i złocista sówka — kolor **nie** wraca do białego (Śnieżnej).
6. Stuknij zakładkę **Gry**. **Powinno być:** sówka w dymku na górze jest złocista i taka zostaje.
7. Zamknij aplikację i otwórz ją ponownie, wejdź do **Sowa** → **Sowi Butik**.
8. **Powinno być:** Płomykówka „Wybrana”, a liczba piórek taka sama jak zaraz po zakupie (piórka nie wracają, zakup
   się nie cofa).

### B3 — przełączanie kolorów i gra

1. W Butiku stuknij **Wybierz** przy Śnieżnej. **Powinno być:** sówka w profilu biała.
2. Stuknij **Wybierz** przy Płomykówce. **Powinno być:** sówka złocista.
3. Od razu (w ciągu kilku sekund) stuknij zakładkę **Gry** i **Graj** w dowolnej grze z sową (np. Sowia Ucieczka).
4. **Powinno być:** w grze sowa jest złocista (Płomykówka).
5. Wróć do menu przyciskiem **Menu** w grze i wejdź do **Sowa** → **Sowi Butik**.
6. **Powinno być:** wybrana dalej Płomykówka.

### B4 — stroje w Garderobie

1. Zakładka **Sowa** → **Garderoba**.
2. **Powinno być:** wszystkie stroje kupione kiedyś w Butiku są odblokowane (bez kłódki) i da się je wybrać.

---

## O1 — Sowie Ogrody: duże liczby

1. Otwórz **Sowie Ogrody**.
2. Spójrz na liczbę liści na górze, ceny na przyciskach **Kup** i na zakładkę **Kolekcja** → **Statystyki**.
3. **Powinno być:** liczby takie jak „100 tys.”, „150 mln”, „200 mld” — z zerami. Wcześniej zamiast „150 mln” było
   „15 mln”, a zamiast „100 tys.” — „1 tys.”.
4. Skróty: „tys.” = tysiąc, „mln” = milion, „mld” = miliard, „bln” = bilion, „bld” = biliard, „tryl.” = trylion,
   „tryld” = tryliard, „kwadryl.” = kwadrylion.

## L1 — Łącz i Hoduj: podpowiedzi

1. Otwórz **Łącz i Hoduj** i pograj chwilę (łącz rośliny, stuknij kartę zamówienia, której jeszcze nie da się oddać,
   stuknij kózkę albo karteczkę Pracu).
2. **Powinno być:** pasek podpowiedzi nad półkami ma dwie linijki i cały tekst się mieści — nie ma „…” w połowie
   zdania (np. „Dryń! Karteczka Pracu na półce — połącz rośliny obok albo stuknij ją 3 razy”).
3. **Powinno być:** półki nie skaczą w górę ani w dół, kiedy podpowiedź się zmienia.
4. Gdyby jakaś podpowiedź jednak kończyła się „…” — stuknij ją. **Powinno być:** cały tekst w dymku.

## U1 — Sowia Ucieczka: humbak rzadziej

1. Otwórz **Sowią Ucieczkę** i zagraj długi bieg (najlepiej 3–5 km), zbierając dużo liści.
2. **Powinno być:** „Rejs na humbaku” zdarza się mniej więcej raz na krainę (co ok. 1000 m), a nie kilkanaście razy
   w biegu.
3. Po rejsie spójrz na pasek z humbakiem pod przyciskiem pauzy. **Powinno być:** przez chwilę jest przygaszony,
   z ikonką 💤 (humbak odpoczywa ok. 600 m) i nie napełnia się; potem znowu napełnia się liśćmi i bąbelkami.

## G1 — Galeria: nowe zdjęcia zamiast podobnych

1. Menu → zakładka **Galeria**.
2. **Powinno być:** zdjęcia nr 1 i nr 2 są różne (nr 2 to teraz złota płomykówka na pniu, a nie przybliżone zdjęcie
   nr 1).
3. **Powinno być:** nowe zdjęcia także pod numerami 12 (dwie płomykówki w budce), 22 (sówka na tle nieba),
   25 (biała sowa śnieżna) i 26 (rudy syczek w dziupli) — jeśli były odblokowane, dalej są odblokowane.
