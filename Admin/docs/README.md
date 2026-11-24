# Sowi Bank — panel admina Wypluffków (instrukcja)

Panel służy do zmiany salda **Wypluffków** — udawanej waluty z Sowiego Butiku. Nikt nic nie płaci: gracz „płaci”
hu-hu na kozę, robi zrzut ekranu z kodem i wysyła go Tobie, a Ty doładowujesz konto w tym panelu.

## Jak wejść

1. Otwórz **https://cutelittlegoat.github.io/SowieGry/Admin/** (najlepiej zapisz w zakładkach telefonu).
2. Wpisz hasło **KoziAdmin** (wielkość liter nie ma znaczenia) i stuknij **Wejdź**.
3. Telefon zapamięta panel. **Wyloguj** (u góry) — panel zapomina hasło na tym telefonie.

Panelu nie ma w menu gier i nie zapisuje się w pamięci aplikacji — zawsze jest pobierany świeży.

**Pierwszy raz:** jeśli zobaczysz „Wczytuję portfel…” i podpowiedź o regułach, najpierw opublikuj reguły Firestore
z Analizy 7b (Załącznik B) — konsola Firebase → projekt `sowiegry-1e1f9` → Firestore Database → Reguły → wklej
całość → Opublikuj. Potem odśwież panel.

## Pierwsze wejście — założenie portfela

Gdy portfela gracza jeszcze nie ma, panel pokazuje **„Portfel gracza jeszcze nie istnieje”**. Wpisz prezent
powitalny (domyślnie 500 Wypluffków) i notkę („Witamy w Sowim Banku!”), stuknij **Załóż portfel gracza**.

## Gracz przysłał zrzut ekranu („dowód wpłaty”)

1. Na zrzucie jest kod, np. **HU-7F3K-2Q**, pakiet i kwota.
2. W panelu, w części **Hu-hu w kolejce**, znajdź ten sam kod (stuknij **Odśwież**, jeśli go jeszcze nie ma).
3. Stuknij **Zatwierdź 550** (kwota z pakietu), wpisz notkę dla gracza (np. „Za piękne hu-hu!”) i potwierdź.
   - **Inna kwota** — dajesz więcej albo mniej, niż prosił gracz.
   - **Odrzuć** — z notką, np. „Koza się nie przestraszyła”.
4. Gracz od razu widzi „Sowi Bank: wpłynęło … Wypluffków!” z Twoją notką.

Prośbę można zatwierdzić **tylko raz** — jeśli dostaniesz ten sam zrzut drugi raz, panel napisze „Ta prośba jest
już załatwiona — to może stary zrzut ekranu?”. Załatwione prośby są w rozwijanej liście **Załatwione**. Gracz
może mieć najwyżej 3 czekające prośby naraz. Liczba czekających jest też w tytule karty przeglądarki,
np. „(2) Sowi Bank”.

## Doładowanie bez prośby, korekta

- **Doładuj ręcznie:** stuknij szybką kwotę (+50, +100, +500, +1000) albo wpisz własną (1–100 000), dopisz notkę,
  stuknij **Doładuj** i potwierdź.
- **Odejmij (korekta):** ta sama kwota zostanie odjęta (np. po pomyłce). Saldo nie spadnie poniżej zera.

## Zwrot zakupu

W części **Ostatnie zakupy gracza** stuknij **Zwrot** przy rzeczy kupionej przez pomyłkę i potwierdź — rzecz znika,
a Wypluffki wracają do gracza.

## Ogłoszenie i promocja

- **Ogłoszenie na górze Butiku** — dowolny tekst do 120 znaków, np. „Black Friday w Sowim Banku!”.
- **Promocja (%)** i **do dnia** — rabat na wszystkie rzeczy za Wypluffki do końca wybranego dnia (1–90%).
  Promocja 0 albo puste pole — bez promocji.
- Stuknij **Zapisz ogłoszenie i promocję**.

## Historia

Ostatnie 30 operacji: data, zmiana (+/−), rodzaj (Doładowanie, Korekta, Zwrot, Zakup), kod albo rzecz, notka i saldo
po zmianie.

## Dobrze wiedzieć

- Panel potrzebuje internetu (u góry: „połączono” albo „bez internetu”).
- SowieGry mają jednego gracza i jednego admina, więc panel nie ma zaawansowanych zabezpieczeń — hasło jest
  zapisane w kodzie strony.
- Wypluffki nie są prawdziwe. Koza nie ucierpiała.
