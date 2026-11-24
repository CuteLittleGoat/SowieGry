# Analiza 7b — Wypluffki: udawane mikropłatności (parodia) w Sowiej Dziupli

> Data: 2026-11-24 · Podstawa: prośba właściciela z 2026-11-24 i dwie wiadomości uzupełniające z tego samego dnia
> (dosłownie w [rozdziale 1](#1-prośba-dosłownie-i-numer)), [`ANALIZA_7_Sowia_Dziupla.md`](ANALIZA_7_Sowia_Dziupla.md)
> (gdzie w Dziupli jest „pole” do Wypluffek), [`ANALIZA_8_Nowa_gra_Sowia_Farma.md`](ANALIZA_8_Nowa_gra_Sowia_Farma.md)
> (skórki narzędzi) i kod na `main` (Sowi Butik `shared/meta/shop.js`, SowieCloud `shared/sowie-cloud.js`, reguły
> `firestore.rules`, menu `shared/menu/`) · Status: **analiza — bez zmian w kodzie**; budowa **razem z Sowią Dziuplą**
> ([rozdział 17](#17-plan-prac)) · Zasady pracy bez zmian: [`ANALIZA_3_Plan_prac.md`, rozdz. 8.1](ANALIZA_3_Plan_prac.md);
> zasada „nic nie ginie”: [`ANALIZA_4`, rozdz. 2](ANALIZA_4_Uwagi_z_testow_poprawki_i_rozbudowa.md); lekcja zapisu
> Butiku: uwaga G3.

Zgodnie z prośbą w repozytorium powstaje **tylko ten plik**. Numer uwagi, stan prac i testy na telefonie dopiszę
do `UWAGI_WLASCICIELA.md`, `STAN_PRAC.md` i `TESTY_NA_TELEFONIE.md` dopiero przy rozpoczęciu budowy.

---

## 0. W skrócie (dla właściciela)

- **Wypluffki** to udawana „waluta premium” SowieGry, jak diamenty w grach na telefon. Nazwa to żart: sowy naprawdę
  wypluwają kulki z tego, czego nie strawią — to **wypluwki**. Wypluffki są ich luksusową, puchatą wersją. Ikonka:
  puchata kulka z błyskiem.
- **Nikt nic nie płaci.** Nigdzie nie ma złotówek ani kart. „Cena” doładowania to zawsze **hu-hu na kozę**.
  Saldo zmienia **tylko admin**, w osobnym panelu.
- **Jeden sklep, dwie waluty** (Twoja druga wiadomość): obecny **Sowi Butik** staje się jedynym sklepem. Część rzeczy
  kupuje się jak dziś za **piórka z gier**, a nowe, „ekskluzywne” rzeczy za **Wypluffki**. Każda rzecz ma jedną walutę.
  Za Wypluffki jest **tylko wygląd**: skórki i kostiumy Sówki, ślady w grach, głosy „hu-hu”, tańce, ozdoby premium do
  Dziupli, gałąź w Sowich Trójkach, a później skórki narzędzi w Sowiej Farmie. **Żadnych ułatwień**: nie da się kupić
  piórek, punktów, żyć, zdjęć do Galerii ani przewagi w grze.
- **Gdzie w Dziupli:** licznik Wypluffek z zielonym **„+”** na górnym pasku, obok piórek (klasyczne miejsce z gier
  na telefon). Do tego **Wypluffkomat** (automat z kulkami) na podłodze dziupli i **ulotka „Oferta dnia”** przypięta
  na końcu tablicy korkowej. Rzeczy premium widać też w **Szafie** i w **Dekoratorze**, z ceną w Wypluffkach.
- **„Doładuj Wypluffki”** (to Twoja „symulacja zakupu waluty”): pakiety z naklejkami „NAJPOPULARNIEJSZE” i „NAJLEPSZA
  OFERTA”, metoda płatności „Hu-hu na kozę” (karta i BLIK wyszarzone: „sowy nie mają kart”), udawane „Łączenie
  z Sowim Bankiem…”, a na koniec **obrazek: Sówka robi „HU HU!” na kozę**, która podskakuje z wrażenia. Na obrazku
  jest **dowód wpłaty**: pakiet, kwota, kod (np. `HU-7F3K-2Q`), data. Gracz robi zrzut ekranu i wysyła go adminowi.
- **Panel admina** pod adresem **https://cutelittlegoat.github.io/SowieGry/Admin/**: logowanie e-mailem i hasłem
  (darmowe Firebase Authentication), saldo gracza, przyciski **+50 / +100 / +500 / +1000 / inna kwota**, notka dla
  gracza („Za piękne hu-hu!”) i lista **„Hu-hu w kolejce”**. Kod ze zrzutu jest już na tej liście, więc zatwierdzasz go
  jednym stuknięciem. Są też zwroty, historia, ogłoszenie i promocja. Bez logowania do konsoli Firestore.
- **U gracza:** gdy zatwierdzisz doładowanie, w Dziupli od razu pojawia się „Sowi Bank: wpłynęło 550 Wypluffek! 🎉”
  z Twoją notką.
- **Bezpiecznie:** reguły Firestore pilnują, że **tylko admin może dodać Wypluffki**, saldo nigdy nie spadnie poniżej
  zera, a gra może tylko wydawać. Profil gracza i zapisy gier zostają bez zmian.
- **Parodia, ale nie nachalna:** żadnych okienek w czasie gry. Żarty są w Butiku: odliczanie „Oferta kończy się za…”,
  które zawsze się przedłuża, regulamin Sowiego Banku, „Kantor: nieczynne”, program VIP od Płotki do **Humbaka**
  (w grach na telefon największych płacących nazywa się „wielorybami” — u nas wieloryb jest uroczy), reklama, która
  daje 0 Wypluffek, i uczciwe sowie jajko-niespodzianka.
- **Plan:** 10 etapów W0–W9, ok. **13–16 dni pracy**, przeplatanych z etapami Dziupli D0–D7. Dziupla i Wypluffki razem
  to ok. **5–6 tygodni**. Panel admina i logikę można zrobić na początku. Skórki do Farmy powstaną razem z Farmą.
- **Twoje czynności:** 5 minut w konsoli Firebase (włączenie logowania e-mailem i konto admina, [rozdział 18](#18-twoje-czynności-krok-po-kroku)),
  publikacja reguł ([Załącznik B](#załącznik-b-reguły-firestore--do-opublikowania-w-etapie-w2)), odpowiedzi na
  **9 pytań** ([rozdział 19](#19-pytania-do-właściciela-prostym-językiem)). Napisałeś „zdaję się na Ciebie”, więc
  jeśli nie odpowiesz, robię według moich rekomendacji.

---

## 1. Prośba (dosłownie) i numer

Proponowany numer w [`UWAGI_WLASCICIELA.md`](UWAGI_WLASCICIELA.md): **W1** (Wypluffki). Dopiszę go przy rozpoczęciu
prac.

| Data | Wiadomość (dosłownie) |
| --- | --- |
| 2026-11-24 | „Zapoznaj się z repo "SowieGry" zwłaszcza w aspekcie kolejnych kroków rozwoju: Analizy/ANALIZA_7_Sowia_Dziupla.md Analizy/ANALIZA_8_Nowa_gra_Sowia_Farma.md Przygotuj nową analizę. Nazwij ją Analizy/ANALIZA_7b_Mikroplatnosci.md Chcę przygotować fikcyjne mikropłatności. Będą to "Wypluffki". Gracz NIC NIE BĘDZIE REALNIE KUPOWAĆ. Całe dodatkowe menu z mikropłatnościami ma być atrapą. Saldo konta będzie zmieniać admin. Saldo konta będzie się zapisywać w Firestore (mogę przygotować nową kolekcję, dokument i pole - potem podasz nowe Rules). Możesz zaplanować jakiś prosty interface dla admina do zmiany poziomu salda, żeby nie było konieczności logowania się do Firestore. Panel admina powinien być pod innym linkiem niż normalne gry (czyli https://cutelittlegoat.github.io/SowieGry/index.html, np. https://cutelittlegoat.github.io/SowieGry/Admin/admin.html - decyzję pozostawiam Tobie). Po kliknięciu w odpowiednie pole (dlatego musi to być wdrażane razem z Analizy/ANALIZA_7_Sowia_Dziupla.md, bo trzeba zaplanować gdzie ma być to pole) gracz będzie miał wybór do zakupu specjalnych itemów (np. skiny dla sówki, skiny dla narzędzi w Analizy/ANALIZA_8_Nowa_gra_Sowia_Farma.md itd.). Nie chcę boostów do zbierania punktów czy piórek. Cała mechanika ma być zabawną parodią zwykłych mikropłatności w grach mobilnych. Chcę, żeby był też przycisk "Doładuj Wypluffki". Po jego kliknięciu ma się pojawić grafika przedstawiająca sówką robiącą "Hu hu" na kozę. Cel: Gracz robi screena i wysyła adminowi. Admin potem doładowuje konto. Jeżeli masz jakieś pytania to zapisz je w analizie. Przed rozpoczęciem prac odpowiem na nie. Nie zmieniaj nic w repo poza utworzeniem nowego pliku analizy. Plik wrzuć na gałąź Main.” |
| 2026-11-24 | „Można połączyć sklep z Wypluffkami z Butikiem. Część będzie do odblokowania za punkty z gier a część za Wypluffki. Niemniej trzeba będzie zrobić panel do symulacji zakupów waluty.” |
| 2026-11-24 | „Niemniej zdaję się na Ciebie. Zrób tak, żeby było fajnie i funkcjonalnie.” |

| Wymaganie | Gdzie w projekcie |
| --- | --- |
| fikcyjne mikropłatności „Wypluffki”, nic nie jest naprawdę kupowane, menu jest atrapą | rozdz. 3, 4, 11 |
| saldo zmienia admin i jest zapisane w Firestore (nowa kolekcja, dokument, pole) + nowe reguły | rozdz. 12, 13, Załącznik B |
| prosty panel admina zamiast logowania do Firestore, pod innym adresem niż gry | rozdz. 8 (`…/SowieGry/Admin/`) |
| „pole” w Dziupli, po którym gracz kupuje specjalne rzeczy | rozdz. 6 |
| skórki dla Sówki, skórki narzędzi w Sowiej Farmie itd. | rozdz. 9, Załącznik A |
| bez ułatwień w zbieraniu punktów i piórek | rozdz. 10 |
| zabawna parodia mikropłatności z gier na telefon | rozdz. 11 |
| przycisk „Doładuj Wypluffki” → grafika: Sówka robi „Hu hu” na kozę → zrzut ekranu → admin doładowuje | rozdz. 7 |
| połączenie sklepu z Butikiem: część za punkty z gier, część za Wypluffki | rozdz. 5 |
| panel do symulacji zakupu waluty | rozdz. 7 („Doładuj Wypluffki”) |
| pytania w analizie | rozdz. 19 |

---

## 2. Jak jest dziś

| Co | Jak działa dziś | Co z tego wynika dla Wypluffek |
| --- | --- | --- |
| **Piórka** | waluta zdobywana w grach (zadania dnia, osiągnięcia, poziomy Sowiej Akademii) — `profil.academy.feathers`, wydawane przez `SowieAcademy.spend` | piórka zostają walutą „za granie”, bez żadnej wymiany na Wypluffki |
| **Sowi Butik** (zakładka „Sowa”) | 11 strojów (30–80 piórek), 6 gatunków sów (40–120 piórek, od poziomu Akademii), dłuższe działanie kózek (30–100 piórek); dziennik zakupów `profil.shop.purchases` (klucz po kluczu — lekcja z uwagi G3), zapis po 0,3 s | Butik staje się **wspólnym sklepem** z dwiema walutami; zakupy za piórka działają dokładnie jak dziś |
| **Profil** | jeden dokument `sowiegry/profil`, reguły: zapis z `schemaVersion` i najwyżej 30 pól najwyższego poziomu (dziś 13, Dziupla doda 1) | wybrane skórki zapiszemy w istniejącym polu `profil.shop` — **bez nowego pola najwyższego poziomu** |
| **Hasło „huhu”** | sprawdzane tylko w przeglądarce, bez logowania w Firebase; reguły nie odróżniają nikogo od nikogo | gdyby saldo leżało w profilu, gracz mógłby je zmienić (np. narzędziami programisty) → saldo w **osobnym dokumencie** z regułami, które odróżniają admina |
| **Firebase** | projekt `sowiegry-1e1f9`, darmowy plan Spark, tylko Firestore (bez Authentication) | do panelu admina włączamy **Firebase Authentication (e-mail i hasło)**, które jest **darmowe**; gra nadal się nie loguje |
| **Menu** | dziś lista gier i zakładki; wkrótce **Sowia Dziupla** (Analiza 7) | Wypluffki budujemy **razem z Dziuplą**, bo tam są ich miejsca na ekranie (rozdz. 6) |

---

## 3. Pomysł i zasady

**Pomysł:** SowieGry dostają „sklep premium” jak każda gra na telefon, z błyszczącą walutą, pakietami, promocjami,
odliczaniem i statusem VIP. Wszystko to jest **przymrużeniem oka**. Płaci się hu-hu na kozę, bankiem jest admin, a
regulamin ma trzy paragrafy, z których ostatni brzmi „Admin ma zawsze rację”.

**Zasady (nie do złamania):**

1. **Zero prawdziwych pieniędzy.** Nigdzie nie ma „zł”, „PLN”, kart ani linków do płatności. Cena doładowania to
   zawsze „× Hu-hu”. W regulaminie i na obrazku „dowodu wpłaty” jest drobny dopisek: „Wypluffki nie są prawdziwe.
   Koza nie ucierpiała.”
2. **Tylko wygląd.** Za Wypluffki nie da się kupić niczego, co pomaga w grze albo omija postęp (rozdz. 10).
3. **Saldo rośnie tylko u admina.** Pilnują tego reguły Firestore, a nie sama aplikacja (rozdz. 13).
4. **Nie nachalnie.** Żadnych okienek w trakcie gry i żadnych „kup teraz” przy starcie gry. Parodia mieszka w Butiku
   i na ekranie doładowania (rozdz. 11.2).
5. **Nic nie ginie.** Kupione rzeczy są zapisane w portfelu (dzienniku zakupów), a obecne zakupy za piórka, stroje,
   gatunki i zapisy gier zostają bez zmian.
6. **Granie najważniejsze.** Gra nigdy nie czeka na portfel. Jeśli portfel się nie wczyta, gry działają, a Sówka
   ma na sobie to, co ostatnio wybrano.

---

## 4. Wypluffki — waluta

| Cecha | Ustalenie |
| --- | --- |
| Nazwa | **Wypluffka**, l.mn. **Wypluffki**, dopełniacz „Wypluffek” („550 Wypluffek”). Skrót na przyciskach: sama ikonka i liczba |
| Ikonka | puchata, owalna kulka w kolorze kakao z mlekiem, z białym błyskiem i małą złotą gwiazdką „premium”; w wersji „radosnej” (np. przy doładowaniu) ma zamknięte oczka „^^”. Plik `assets/svg/wypluffki/wypluffka.svg`, w stylu Sowiego Świata (kontur `#3b2f4a`) |
| Skąd | **tylko od admina** (doładowania, prezenty, zwroty). W grach nie da się ich zdobyć — piórka są „za granie”, Wypluffki „za hu-hu” |
| Na co | tylko wygląd (rozdz. 9) |
| Wymiana | brak w obie strony. W Butiku wisi tabliczka: „Kantor Sowiego Banku: Wypluffki → piórka — nieczynne. Piórka → Wypluffki — nieczynne. Sowa ma zasady.” |
| Liczby | całkowite, od 0 do 10 000 000; ceny rzeczy 149–2 499, pakiety 100–6 500 (Załącznik A) |
| Wyjaśnienie dla gracza | karta w „Jak grać?” → „Sowi Butik i Wypluffki”, prostym językiem: „Wypluffki są na niby. Dostajesz je od admina za hu-hu na kozę. Kupujesz za nie tylko wygląd — w grach nic nie ułatwiają.” |

---

## 5. Sowi Butik — jeden sklep, dwie waluty

### 5.1. Co się zmienia

Butik zostaje jedynym sklepem SowieGry (Twoja druga wiadomość). W Dziupli otwiera się z licznika Wypluffek,
z Wypluffkomatu, z ulotki na tablicy i z „Więcej → Sowi Butik”. Każda rzecz ma **dokładnie jedną walutę**: 🪶 piórka
albo Wypluffki.

| Co | Waluta | Uwagi |
| --- | --- | --- |
| 11 strojów, 6 gatunków sów, dłuższe kózki (dzisiejszy Butik) | 🪶 piórka | **bez zmian**: te same ceny, poziomy Akademii, dziennik zakupów i zapis; „dłuższe kózki” to jedyny „bonus” w Butiku i nigdy nie będzie za Wypluffki |
| ozdoby Dziupli „za piórka” (Analiza 7, rozdz. 6.4 — motywy, dywany, ramki) | 🪶 piórka | jak w Analizie 7 |
| skórki i kostiumy Sówki, ślady, głosy, tańce, ozdoby premium Dziupli, gałąź w Trójkach, skórki do Farmy | Wypluffki | nowe, tylko wygląd (rozdz. 9, Załącznik A) |
| rzeczy za granie (zdjęcia Galerii, ozdoby za cele, roślinki z gier na półce) | — | **nie są na sprzedaż** (rozdz. 10) |

### 5.2. Ekran Butiku (telefon w pionie)

```
┌──────────────────────────────┐
│ ← Sowi Butik   🪶 120  ●1 250 [+] │  piórka · Wypluffki · „+” = Doładuj Wypluffki
│ 📣 „Black Friday w Sowim Banku!”  │  ogłoszenie od admina (jeśli jest)
│ ┌ OFERTA DNIA ─── kończy się za 05:12:44 ┐ │
│ │ [Kapelusz Pirata]  ~~399~~ 319 ●  [Kup] │ │  −20%, codziennie inna rzecz
│ └─────────────────────────────────┘ │
│ [Sówka] [Dziupla] [Gry] [Wypluffki]   │  zakładki
│ filtr: (wszystko) (🪶 za piórka) (● premium) │
│ ┌──────┐ ┌──────┐ ┌──────┐          │
│ │Złota │ │Pirat │ │Puszczyk│        │  kafelek: podgląd na Sówce, nazwa,
│ │ ★LEG │ │ ★RZ  │ │ 🪶 40 │         │  rzadkość, cena w swojej walucie,
│ │●1 499│ │● 399 │ │       │         │  „Masz” / kłódka z warunkiem
│ └──────┘ └──────┘ └──────┘          │
│ … (przewijanie)                     │
│ [Doładuj Wypluffki] [Wyciąg z konta] │
│ Regulamin · Kantor · Program VIP     │
└──────────────────────────────┘
```

- **Zakładki:** **Sówka** (gatunki, skórki, stroje, ślady, głos, taniec), **Dziupla** (ozdoby za piórka i premium),
  **Gry** (kózki za piórka; Sowie Trójki: gałąź i ramka; Sowia Farma: narzędzia, strachy i dom), **Wypluffki**
  (doładowanie, kolejka hu-hu, wyciąg, VIP, jajko-niespodzianka, „reklama”).
- **Kafelek:** podgląd na żywo (rzecz na Sówce albo w miniaturze dziupli), rzadkość w kolorze ramki: Rzadki
  (niebieska), Epicki (fioletowa), Legendarny (złota), **Mityczny Puch** (tęczowa). Cena z ikonką waluty. Stan: „Masz”,
  „Kup”, „Brakuje 120” albo kłódka z warunkiem (np. poziom Akademii przy gatunkach — jak dziś).
- **Zakup za piórka:** jak dziś (potwierdzenie, zapis po 0,3 s, działa też bez internetu).
- **Zakup za Wypluffki:** okno „Kupić Złotą skórkę za 1 499 Wypluffek? To tylko wygląd — w grach nic nie zmienia.”
  → „Kup” → krótkie „Przetwarzanie… hu-hu” (ok. 0,5 s, w tym czasie zapis w banku) → **paragon** („Sowi Bank —
  Paragon nr 0042 · Złota skórka ×1 · 1 499 ● · VAT (Wypluffkowa Akcyza Tymczasowa) 0 ● · Dziękujemy! Hu-hu!”)
  → „Załóż teraz” / „Później”. **Wymaga internetu**: bez zasięgu przyciski są szare z dopiskiem „Sowi Bank jest offline
  📶 — spróbuj, gdy wróci zasięg”.
- **Za mało Wypluffek:** „Brakuje Ci 120 Wypluffek. Może hu-hu na kozę?” → [Doładuj] [Nie teraz].
- **Oferta dnia:** każdego dnia jedna rzecz premium, której gracz jeszcze nie ma, tańsza o 20%. Wybór zależy od daty
  (ten sam na dwóch telefonach). Odliczanie do północy, a po północy napis „Oferta przedłużona! (jak zawsze)”
  i nowa oferta. Parodia, ale rabat jest prawdziwy.
- **Wyciąg z konta:** lista doładowań (z notkami admina) i zakupów z datami. Dzięki temu widać, skąd się wzięło saldo.

### 5.3. Szafa i Dekorator (Analiza 7) — kupowanie „na miejscu”

- **Szafa** (Analiza 7, rozdz. 5) dostaje zakładki **Gatunki** (🪶), **Skórki** (●), **Stroje** (🪶 i ●), **Ślad**,
  **Głos** i **Taniec** (●). Rzecz, której nie mamy, ma cenę i przycisk „Kup”, który uruchamia ten sam zakup co
  w Butiku. Kupioną rzecz można od razu założyć.
- **Dekorator** (Analiza 7, rozdz. 6): w arkuszu każdego miejsca jest dodatkowa kategoria **„Premium ✨”** z cenami
  w Wypluffkach, obok ozdób za granie i za piórka.
- Jedna logika zakupu dla Butiku, Szafy i Dekoratora (`shared/meta/shop.js` + `shared/meta/wypluffki.js`),
  więc nie ma trzech różnych sklepów do utrzymania.

---

## 6. Gdzie w Sowiej Dziupli („pole” do Wypluffek)

Uzupełnienie [Analizy 7, rozdz. 4](ANALIZA_7_Sowia_Dziupla.md#4-ekran) — zmiany zaznaczone ◄:

```
┌──────────────────────────────┐
│ SowieGry   🪶 120  (● 1 250 [+])  ⚙ │ ◄ licznik Wypluffek z „+” (Doładuj)
│ ˚lampki˚˚˚˚˚˚˚˚˚˚˚˚˚˚˚˚˚˚˚˚   │
│ [obrazek]  ═półka═  ( okno ) │
│ ┌──────────────────────────┐ │
│ │ „Zadania dnia: ●●○”      │ │
│ │ ┌─────────┐ ┌─────────┐  │ │  karty gier (bez zmian)
│ │ │ Ucieczka│ │ Chmury  │  │ │
│ │ └─────────┘ └─────────┘  │ │
│ │   …   (6 gier)           │ │
│ │ [ulotka: OFERTA DNIA −20%] │ │ ◄ ulotka Sowiego Butiku — na końcu tablicy
│ └──────────────────────────┘ │
│ [Wypluffkomat][szafa] (Sówka) 🌸 🐐 │ ◄ automat z Wypluffkami obok szafy
│ [Gry][Szafa][Dekoruj][Galeria][Więcej] │  dolny pasek bez zmian (Butik w „Więcej”)
└──────────────────────────────┘
```

| Miejsce | Co robi | Dlaczego tak |
| --- | --- | --- |
| **Licznik Wypluffek na górnym pasku** — kulka, liczba i zielony „+” | stuknięcie licznika → Butik (zakładka „Sówka”); stuknięcie „+” → **Doładuj Wypluffki** | tak wygląda to w prawie każdej grze na telefon, więc parodia jest od razu rozpoznawalna; zawsze widoczne, a nie zasłania gry. „+” lekko pulsuje (parodia), a przy ograniczeniu ruchu albo wyłączonych „Efektach” stoi nieruchomo |
| **Wypluffkomat** — mały automat na kulki (jak na gumy do żucia), pełen Wypluffek, na podłodze obok szafy | stuknięcie → Butik; przy nowej ofercie dnia jedna kulka mruga | „pole” w samym pokoju, w stylu dziupli; na 320 px zmniejsza się do ok. 44 px |
| **Ulotka na tablicy korkowej** — karteczka „OFERTA DNIA” z rysunkiem rzeczy, przypięta **na końcu** tablicy, po kartach gier | stuknięcie → Butik z otwartą ofertą dnia | reklama „w świecie gry”, ale nigdy nad kartami gier |
| **Szafa, Dekorator** | rzeczy premium z ceną i „Kup” | kupowanie tam, gdzie się wybiera wygląd (rozdz. 5.3) |
| **„Więcej → Sowi Butik”** | pełny Butik | Analiza 7 już przewiduje tam Butik |
| **Powitanie Sówki** (dymek, najwyżej raz dziennie, wyłączane przez „Komentarze sowy”) | „Hu-hu! Wpłynęły Wypluffki!” albo „W Wypluffkomacie jest nowa oferta” | jak inne powitania z Analizy 7, rozdz. 7 |

**Telefon poziomo i tablet:** licznik zostaje na górnym pasku, a Wypluffkomat stoi w części „pokoju”.
**Wersja demo (`demo.html`):** bez Wypluffek, bo demo zostaje z prostym menu (Analiza 7, pytanie 6).
**Obecne menu** (do przełączenia na Dziuplę w D7): Butik za piórka bez zmian. Wypluffki widać dopiero w Dziupli,
zgodnie z prośbą „wdrażane razem z Dziuplą”.

---

## 7. „Doładuj Wypluffki” — symulacja kupowania waluty

### 7.1. Przebieg

```
 „+” przy liczniku albo „Doładuj Wypluffki” w Butiku
   → 1. Pakiety (wybór)
   → 2. Metoda płatności („Hu-hu na kozę”)
   → 3. „Przetwarzanie płatności…” (ok. 2 s)
   → 4. DOWÓD WPŁATY: Sówka robi „HU HU!” na kozę + dane wpłaty   ← gracz robi zrzut ekranu i wysyła adminowi
   → (w tle: prośba o doładowanie trafia na listę „Hu-hu w kolejce” w panelu admina)
   → admin w panelu: „Zatwierdź”
   → u gracza: „Sowi Bank: wpłynęło 550 Wypluffek! 🎉” + notka admina, licznik nabija się do nowej liczby
```

### 7.2. Krok 1 — pakiety

```
┌──────────────────────────────┐
│ ← Doładuj Wypluffki   ● 1 250 │
│ ┌ PAKIET STARTOWY · TYLKO RAZ! ┐ │
│ │ 300 ● + Czapeczka Nowicjusza │ │
│ │ ~~3 × Hu-hu~~  1 × Hu-hu      │ │
│ └──────────────────────────────┘ │
│ ┌─────────┐ ┌──NAJPOPULARNIEJSZE┐ │
│ │ Garstka │ │ Kieszeń           │ │
│ │  100 ●  │ │ 550 ● (+50 gratis)│ │
│ │1 × Hu-hu│ │ 1 × Hu-hu (głośne)│ │
│ └─────────┘ └───────────────────┘ │
│ ┌─────────┐ ┌──NAJLEPSZA OFERTA─┐ │
│ │ Worek   │ │ Skrzynia          │ │
│ │1 200 ●  │ │ 2 600 ● (+30%)    │ │
│ │2 × Hu-hu│ │3 × Hu-hu i groźne │ │
│ │         │ │spojrzenie         │ │
│ └─────────┘ └───────────────────┘ │
│ [🐋 Humbaczy Ładunek 6 500 ● — DLA WIELORYBÓW] │
│ [▶ Darmowe Wypluffki! (obejrzyj reklamę)]       │
│ Twoje hu-hu w kolejce: HU-7F3K-2Q ⏳            │
│ Regulamin Sowiego Banku                          │
└──────────────────────────────┘
```

| Pakiet | Wypluffki | „Cena” | Naklejka |
| --- | --- | --- | --- |
| **Pakiet Startowy** (tylko raz) | 300 + kostium „Czapeczka Nowicjusza” (tylko z tego pakietu) | ~~3 × Hu-hu~~ 1 × Hu-hu (nieśmiałe) | TYLKO RAZ! |
| **Garstka Wypluffek** | 100 | 1 × Hu-hu | — |
| **Kieszeń Wypluffek** | 550 (500 + 50 gratis) | 1 × Hu-hu (głośne) | NAJPOPULARNIEJSZE |
| **Worek Wypluffek** | 1 200 (+20% gratis) | 2 × Hu-hu | — |
| **Skrzynia Wypluffek** | 2 600 (+30% gratis) | 3 × Hu-hu i groźne spojrzenie | NAJLEPSZA OFERTA |
| **Humbaczy Ładunek** | 6 500 | Hu-hu w duecie z humbakiem | DLA WIELORYBÓW 🐋 |

Kwota w pakiecie to **prośba**, a ostatnie słowo ma admin: może zatwierdzić, dać inną kwotę albo odrzucić
(„Sowi Bank odrzucił transakcję: koza się nie przestraszyła”). Lista pakietów i kwot jest w jednym pliku
(`shared/meta/wypluffki.js`), więc łatwo ją zmienić.

**„Darmowe Wypluffki! (obejrzyj reklamę)”** — parodia reklam z nagrodą: 5-sekundowa „reklama” Koziego Sera od kozy
Klementyny (postać z Sowiej Farmy), przycisk „Pomiń” pojawia się po 5 sekundach, a na koniec: „Gratulacje! Otrzymujesz
0 Wypluffek. U nas reklamy nic nie dają — i tak powinno być.” Pojawia się tylko po stuknięciu, nigdy sama.

### 7.3. Krok 2 — metoda płatności

```
Wybierz metodę płatności
 ◉ Hu-hu na kozę            (polecane przez 10 na 10 sów)
 ○ Karta kredytowa          — sowy nie mają kart          (wyszarzone)
 ○ BLIK                     — sowa zapomniała kodu        (wyszarzone)
 ○ Szyszki                  — wkrótce                     (wyszarzone)
 [ Zapłać hu-hu ]
```

### 7.4. Krok 3 — „Przetwarzanie płatności…”

Około 2 sekund. Sówka kręci się w kółko jak kółko ładowania, a pod nią zmieniają się napisy: „Łączenie z Sowim
Bankiem…”, „Weryfikacja kozy…”, „Autoryzacja hu-hu…”. W tym czasie aplikacja zapisuje **prośbę o doładowanie**
(rozdz. 12.3). Stuknięcie pomija animację.

### 7.5. Krok 4 — obrazek „Sówka robi hu-hu na kozę” (dowód wpłaty)

Najważniejszy ekran: ma być **zabawny, czytelny na zrzucie i cały widoczny bez przewijania** (także na 320 × 568).
Na czas tego ekranu znikają dolny pasek i powiadomienia, żeby nic go nie zasłaniało.

```
┌──────────────────────────────┐
│    SOWI BANK · DOWÓD WPŁATY   │
│ ┌──────────────────────────┐ │
│ │  ╭────────╮               │ │
│ │  │ HU HU! │    ╭──────╮   │ │
│ │  ╰──┬─────╯    │MEEE?!│   │ │
│ │   (Sówka,  )))  ╰──┬───╯   │ │  Sówka w wyglądzie gracza (gatunek/skórka i strój),
│ │   skrzydła       (koza    │ │  skrzydła szeroko, dziób otwarty, fale dźwięku;
│ │   szeroko)        w skoku,│ │  koza w podskoku, sierść dęba, „!!”, kropelki
│ │                  sierść   │ │
│ │                  dęba)    │ │
│ │ ~~ łąka, kwiatki, płotek ~~ │ │
│ └──────────────────────────┘ │
│ Pakiet:   Kieszeń Wypluffek   │
│ Kwota:    550 ●               │
│ Zapłacono: 1 × Hu-hu (głośne) │
│ Kod:      HU-7F3K-2Q          │
│ Data:     24.11.2026, 18:03   │
│ Status:   czeka na admina ⏳  │
│ 📸 Zrób zrzut ekranu i wyślij go adminowi │
│ (Xiaomi: przesuń 3 palcami w dół)          │
│ [Udostępnij obrazek]   [Gotowe]            │
│ *Wypluffki nie są prawdziwe. Koza nie ucierpiała. │
└──────────────────────────────┘
```

**Obrazek zależy od pakietu**, więc admin od razu widzi, o co chodzi:

| Pakiet | Sówka | Koza | Tło |
| --- | --- | --- | --- |
| Startowy | w Czapeczce Nowicjusza, nieśmiałe „hu-hu…” | uśmiecha się: „Mee :)” | łąka |
| Garstka | „HU HU!” | mruga: „Mee?” | łąka |
| Kieszeń | „HU HU!” głośniej (fale dźwięku) | podskakuje: „MEEE?!” | łąka |
| Worek | „HU HU HU HU!” | wysoki skok, sierść dęba | łąka z płotkiem |
| Skrzynia | „HU HU HU HU HU!!!” i groźne brwi | ucieka w podskokach, kopytka w górze | wieczorne niebo |
| Humbaczy Ładunek | Sówka na grzbiecie humbaka, humbak tryska fontanną | mokra, zdziwiona: „MEEE!?” | zatoka |

- **Animacja:** krótka (ok. 1,2 s — Sówka nabiera powietrza, „HU HU!”, koza podskakuje), z dźwiękiem `hu-hu` (jest
  już w SowieGry) i nowym „mee”. Potem **nieruchoma klatka** do zrzutu. Przy ograniczeniu ruchu od razu nieruchoma.
- **Grafika:** Sówka z atlasu Sowiego Świata (gatunek lub skórka i strój gracza) w **nowej pozie „hu-hu”** (skrzydła
  szeroko, otwarty dziób). Tę samą pozę potrzebuje Sowia Farma do przepędzania gołębi (Analiza 8, rozdz. 10), więc
  robimy ją raz w `shared/world/`. Koza to `kozki/koza-skok.svg` plus nowe dodatki (sierść dęba, „!!”, kropelki),
  humbak z atlasu.
- **Kod `HU-XXXX-XX`:** 6 losowych znaków bez łatwych do pomylenia (bez 0/O i 1/I). Ten sam kod jest na liście „Hu-hu
  w kolejce” w panelu admina. Panel ostrzega, gdy kod był już zatwierdzony („To ten sam zrzut co 22.11?”).
- **„Udostępnij obrazek”** (dodatek, pytanie 5): ten sam obrazek jako plik PNG przez systemowe „Udostępnij”
  (Messenger, WhatsApp…). Gdy telefon tego nie obsługuje, przycisk „Zapisz obrazek”. Zrzut ekranu dalej jest
  podstawowym sposobem (Twój pomysł).
- **Kolejka:** najwyżej **3 hu-hu czekające naraz**. Czwarte: „Sowi Bank przetwarza Twoje poprzednie hu-hu. Koza musi
  odpocząć.” To chroni Twoją listę przed zalewem próśb.
- **Bez internetu:** obrazek i kod pokazują się normalnie, a prośba zapisze się sama, gdy wróci zasięg (status
  „zapisze się po powrocie internetu”). Admin może też doładować ręcznie, tylko na podstawie zrzutu.

### 7.6. Po zatwierdzeniu

- Gra nasłuchuje zmian w portfelu (rozdz. 12). Gdy admin doładuje, w Dziupli pojawia się okienko **„Sowi Bank: wpłynęło
  550 Wypluffek! 🎉”** z notką admina („Za piękne hu-hu!”). Wypluffki „sypią się” do licznika, który nabija się do
  nowej liczby, z dźwiękiem `zakup`, a Sówka mówi „Hu-hu! Jesteśmy bogate!”.
- Jeśli aplikacja była zamknięta, okienko pokaże się przy następnym wejściu (raz).
- W kolejce hu-hu status zmienia się na „zatwierdzone ✅ +550” albo „odrzucone ❌” z notką.

---

## 8. Panel admina

### 8.1. Adres i dostęp

- **Adres:** **https://cutelittlegoat.github.io/SowieGry/Admin/** (plik `Admin/index.html`). Wybrałem krótszy adres
  niż w przykładzie, łatwiej go wpisać i zapisać w zakładkach.
- **Nie jest podlinkowany** z gier ani z Dziupli, ma `noindex` (wyszukiwarki go nie pokazują), nie trafia do pamięci
  aplikacji (`sw.js` go pomija) i nie jest częścią instalowanej aplikacji.
- **Logowanie:** e-mail i hasło konta admina w **Firebase Authentication** (darmowe na planie Spark). Konto zakładasz
  raz w konsoli Firebase (rozdz. 18). Opcja „Zapamiętaj na tym telefonie” i przycisk „Wyloguj”.
- **Dlaczego logowanie, a nie samo hasło w stronie:** strona jest publiczna, a hasło zapisane w jej kodzie każdy
  mógłby przeczytać. Reguły Firestore rozpoznają za to zalogowane konto admina (jego UID), więc nawet ktoś z
  narzędziami programisty nie dopisze sobie Wypluffek. Gry nadal się nie logują; ich działanie się nie zmienia.
- Pomysł na zapas: drugi admin (np. druga osoba z rodziny) to drugi UID na liście w regułach.

### 8.2. Ekran (telefon — admin też ma go pod ręką)

```
┌──────────────────────────────┐
│ Sowi Bank · panel admina  [Wyloguj] │
│ Saldo gracza:  ● 1 250              │
│ Doładowano 3 000 · Wydano 1 750 · VIP: Śledź │
│ ── Hu-hu w kolejce (2) ──           │
│ HU-7F3K-2Q · Kieszeń 550 · dziś 18:03       │
│   [Zatwierdź 550] [Inna kwota] [Odrzuć]     │
│ HU-9AB2-XC · Garstka 100 · wczoraj 20:11    │
│   [Zatwierdź 100] [Inna kwota] [Odrzuć]     │
│ ── Doładuj ręcznie ──               │
│ [+50] [+100] [+500] [+1000] [inna…] │
│ Notka dla gracza: [Za piękne hu-hu!] │
│ [Doładuj]          [Odejmij (korekta)] │
│ ── Ostatnie zakupy gracza ──        │
│ Złota skórka · 1 499 · 23.11  [Zwrot] │
│ Kapelusz Pirata · 319 · 22.11 [Zwrot] │
│ ── Ogłoszenie i promocja ──         │
│ Ogłoszenie: [Black Friday w Sowim Banku!] │
│ Promocja: [−30%] do: [30.11]  [Zapisz] │
│ ── Historia (ostatnie 30) ──        │
│ 24.11 18:20  +550  HU-7F3K-2Q „Za piękne hu-hu!” │
└──────────────────────────────┘
```

| Funkcja | Jak działa |
| --- | --- |
| **Saldo** | na żywo (zmienia się, gdy gracz coś kupi); doładowano, wydano, poziom VIP |
| **Hu-hu w kolejce** | prośby z gry: kod, pakiet, kwota, kiedy. **Zatwierdź** dodaje kwotę pakietu (przy Pakiecie Startowym także Czapeczkę Nowicjusza), **Inna kwota** pozwala wpisać własną, **Odrzuć** prosi o notkę. Liczba czekających jest też w tytule karty przeglądarki: „(2) Sowi Bank” |
| **Doładuj ręcznie** | szybkie przyciski i własna kwota, notka widoczna u gracza, okno potwierdzenia („Doładować 500 Wypluffek?”) |
| **Korekta** | odjęcie Wypluffek (np. pomyłka); saldo nie spadnie poniżej zera |
| **Zwrot** | gracz kupił coś przez pomyłkę → admin oddaje Wypluffki i zabiera rzecz (z notką „Zwrot: …”) |
| **Ogłoszenie i promocja** | tekst na górze Butiku i promocja procentowa na rzeczy premium do wybranego dnia — możesz się pobawić w „firmę od gier” |
| **Historia** | ostatnie 30 operacji: data, zmiana, kod, notka |
| **Pierwsze wejście** | gdy portfela jeszcze nie ma: przycisk „Załóż portfel gracza” (opcjonalnie z prezentem powitalnym, np. 500 z notką „Witamy w Sowim Banku!”) |
| **Gdy reguły jeszcze nie znają konta** | czytelny komunikat „Zalogowano, ale reguły nie znają tego konta. Twój UID: … [Kopiuj]” — to pomaga przy pierwszej konfiguracji |

- Każda operacja admina to **jedna transakcja** w bazie: saldo, wpis w historii, status prośby i powiadomienie dla
  gracza zapisują się razem albo wcale.
- Ten sam styl co SowieGry (czcionka Fredoka, tokeny kolorów), jasny i ciemny, duże przyciski, polski.
- Panel ma też własną instrukcję: `Admin/docs/README.md` (co zrobić po dostaniu zrzutu) i `Admin/docs/Documentation.md`
  (opis kodu).

---

## 9. Co można kupić za Wypluffki

Pełny katalog pierwszej wersji (ok. 60 rzeczy, ceny i rzadkości) jest w [Załączniku A](#załącznik-a-katalog-pierwszej-wersji).
Wszystko to tylko wygląd.

| Kategoria | Przykłady | Gdzie widać | Jak zrobione |
| --- | --- | --- | --- |
| **Skórki Sówki** (zastępują kolory gatunku) | Cukrowa Wata, Czekoladowa („nie jeść”), Lodowa, Neonowa, Galaktyczna, Duszek, Tęczowa, **Złota**, **Mityczny Puch** (co dzień inny kolor) | Dziupla i **wszystkie gry** z Sówką | ta sama technika co gatunki sów (`atlas.setTransform` — podmiana kolorów w SVG), a do tego warstwa wzoru (gwiazdki, iskierki, szron). Przy skórce „Bez skórki” wraca wybrany gatunek |
| **Kostiumy** (dodatki, jak stroje z Garderoby) | Kapelusz Pirata, Hełm Astronautki, Kapelusz Czarodziejki, **Kostium Kozy** („Mee-hu?”), **Kombinezon Humbaka**, Piżama ze szlafmycą, Hełm Rycerza, Kula Disco | Dziupla, wszystkie gry | nowe pliki w `assets/svg/garderoba/`, jak obecne stroje |
| **Ślad** (nowe miejsce obok dodatku) | Brokat, Serduszka, Nutki, Złote piórka, Tęcza, Konfetti | gry zręcznościowe (Ucieczka, Tory, Chmury); w Sowich Trójkach iskierki przy combo w tym kolorze | cząsteczki silnika w limicie z Analizy 6; wyłączone przy „Efektach” wyłączonych |
| **Głos Sówki** | Hu-hu operowe, 8-bit, z echem, basem, „Mee-hu” (kozie) | stuknięcie Sówki w Dziupli, radość w Trójkach, przepędzanie w Farmie | syntezator `scripts/make-audio.mjs` |
| **Taniec** | Taniec radości, Salto, Moonwalk, Kłębek puchu (turla się) | stuknięcie Sówki w Dziupli | „reżyser reakcji” z Sowich Trójek (Analiza 7, rozdz. 7) |
| **Ozdoby premium Dziupli** (każda pasuje do miejsca z Analizy 7) | **Złota Dziupla**, Dziupla Disco, Kosmiczna Dziupla; okno: Wypluffkowe Góry; sufit: kula disco, neon „HU-HU”; **Złoty tron** dla Sówki; fotel gamingowy; czerwony dywan VIP; złote doniczki na półkę; Pluszowa Wypluffka; Złota koza (statuetka) | Dziupla | SVG w `assets/svg/dziupla/premium/` |
| **Sowie Trójki** | Złota gałąź, Huśtawka (gdzie siedzi Sówka), ramka planszy „Disco” | Sowie Trójki | **kafelki bez zmian** (każdy rodzaj ma swój kolor i kształt — prośba z N1) |
| **Sowia Farma** (z premierą Farmy) | Konewka-czajniczek, **Konewka-humbak**, Złota motyka-łopatka, Sierp-księżyc, Strach-Sowa Pirat, Strach-robot, gałąź do spania ze złotymi liśćmi, dom z dachem-grzybkiem, Kózka-maskotka (tylko spaceruje i meczy) | Sowia Farma | skórka zmienia wygląd narzędzia, **nie** jego działanie; poziom narzędzia (zwykłe → tęczowe) pokazuje kolorowy pasek na trzonku, więc informacja z gry nie ginie (Analiza 8, rozdz. 13.1) |

**Program VIP „Sowi Klub”** (parodia „wielorybów”) — poziom wynika z łącznie **wydanych** Wypluffek:

| Poziom | Wydano | Co daje (tylko wygląd) |
| --- | --- | --- |
| 🐟 Płotka | 0+ | naklejka „Płotka” przy liczniku |
| 🐠 Śledź | 1 000+ | srebrna ramka licznika Wypluffek |
| 🐬 Delfin | 5 000+ | złota ramka licznika i odznaka w Butiku |
| 🐋 **Humbak** | 15 000+ | tytuł **„Sowi Wieloryb”**, złoty „+”, zabawka **Pluszowy Humbak VIP** w Dziupli |

**Sowie jajko-niespodzianka** (parodia „skrzynek z łupem”, pytanie 4) — 399 Wypluffek, losowa rzecz premium, której
gracz **jeszcze nie ma** (bez powtórek). Szanse są wypisane na jajku: Rzadki 60%, Epicki 35%, Legendarny 5%.
Średnio dostaje się rzecz droższą niż jajko. Gdy z puli nic nie zostało: „Sowa nie ma już jajek. Wszystko masz!”
Otwarcie jajka to krótka animacja pękającej skorupki.

---

## 10. Czego **nie** sprzedajemy (żadnych ułatwień)

| Nie do kupienia za Wypluffki | Dlaczego |
| --- | --- |
| piórka, XP, poziomy Sowiej Akademii | to „punkty z gier” — Twoja prośba |
| zdjęcia Galerii, ozdoby Dziupli za cele, roślinki z gier na półkę | to nagrody za granie — kupienie ich psułoby zabawę |
| dodatkowe życia, serduszka, dłuższe kózki, tarcze, magnesy | ułatwienia w grach zręcznościowych |
| ulepszenia, nasiona, nawozy, przyspieszenia w Sowich Ogrodach i Łącz i Hoduj | ułatwienia w grach idle |
| ruchy, moce, „Sowia pomoc”, omijanie poziomów w Sowich Trójkach | ułatwienia |
| żołędzie, nasiona, plony, pogoda, szybszy wzrost, ochrona przed szkodnikami, kózka-pomocnica zbierająca plony w Sowiej Farmie | ułatwienia |
| zadania i osiągnięcia Akademii za wydawanie Wypluffek | dawałyby piórka (pośrednia wymiana) |
| wymiana Wypluffek na piórka i odwrotnie | jak wyżej („Kantor: nieczynne”) |

**Test automatyczny pilnuje tego katalogu:** każda rzecz za Wypluffki należy do kategorii „wygląd” (lista dozwolonych
rodzajów) i nie ma żadnego pola, które gry czytają jako działanie (mnożnik, czas, liczba, zasięg).

---

## 11. Parodia — żarty i granice

### 11.1. Lista żartów (wszystkie prawdziwe triki gier na telefon, tylko odwrócone)

| Trik z gier na telefon | U nas |
| --- | --- |
| waluta premium z błyszczącą ikonką | Wypluffki — puchata wypluwka |
| zielony „+” przy diamentach | jest — i lekko pulsuje |
| pakiety z „gratisem” i naklejkami | „NAJPOPULARNIEJSZE”, „NAJLEPSZA OFERTA”, „DLA WIELORYBÓW 🐋” |
| ceny kończące się na 99 | 299, 499, 999 Wypluffek |
| „tylko raz!” | Pakiet Startowy — naprawdę tylko raz |
| odliczanie „oferta kończy się za…” | kończy się o północy… i zawsze jest „przedłużona” |
| skreślona „stara cena” | ~~3 × Hu-hu~~ 1 × Hu-hu |
| reklama za nagrodę | nagroda: 0 Wypluffek i szczera satysfakcja |
| „skrzynki z łupem” | sowie jajko-niespodzianka — uczciwe szanse i bez powtórek |
| status VIP / „wieloryby” | Sowi Klub: Płotka → Śledź → Delfin → **Humbak** |
| metody płatności | Hu-hu na kozę; karta i BLIK wyszarzone („sowy nie mają kart”) |
| „przetwarzanie płatności” | „Weryfikacja kozy…” |
| paragon i podatek | „VAT (Wypluffkowa Akcyza Tymczasowa): 0 ●” |
| regulamin drobnym drukiem | „Regulamin Sowiego Banku: §1 Wypluffki nie są prawdziwe i nic nie kosztują. §2 Koza nie zgłasza roszczeń. §3 Admin ma zawsze rację.” |
| kantor walut premium | „Nieczynne. Sowa ma zasady.” |
| rzadkość przedmiotów | Rzadki, Epicki, Legendarny i **Mityczny Puch** |

### 11.2. Granice (żeby było fajnie, a nie męcząco)

- **Żadnych okienek** w trakcie gry, przy jej starcie ani przy wyjściu. W grach Wypluffek w ogóle nie widać,
  a widać tylko to, co gracz założył.
- W Dziupli: licznik, Wypluffkomat i **jedna** ulotka na końcu tablicy. Sówka wspomina o ofercie najwyżej raz dziennie
  i można to wyłączyć („Komentarze sowy”).
- Pulsowanie „+” i animacje znikają przy ograniczeniu ruchu i przy wyłączonych „Efektach”.
- Język: krótko, ciepło i z humorem, bez straszenia („Ostatnia szansa!!!” tylko w żartobliwym kontekście odliczania,
  które zawsze się przedłuża).

---

## 12. Dane i zapis

### 12.1. Portfel — nowa kolekcja i dokument

Odpowiedź na „mogę przygotować nową kolekcję, dokument i pole”: **kolekcja `sowiegry_wypluffki`, dokument `portfel`**.
Nie trzeba ich zakładać ręcznie, bo panel admina zrobi to przy pierwszym wejściu („Załóż portfel gracza”). Jeśli
wolisz zrobić to sam, pola są w rozdz. 18, krok 6.

```js
// sowiegry_wypluffki/portfel
{
  schemaVersion: 1,
  saldo: 1250,                 // liczba całkowita ≥ 0 — rośnie TYLKO przez admina
  doladowano: 3000,            // suma doładowań (tylko admin)
  wydano: 1750,                // suma wydatków (rośnie przy każdym zakupie; od niej zależy VIP)
  kupione: {                   // dziennik zakupów za Wypluffki — mapa, zapisywana klucz po kluczu (lekcja G3)
    "skorka:zlota":    { at: <czas serwera>, cena: 1499 },
    "stroj:pirat":     { at: <czas serwera>, cena: 319 },   // kupione w ofercie dnia
    "stroj:nowicjusz": { at: <czas serwera>, cena: 0 },     // z Pakietu Startowego (dopisał admin)
  },
  ostatniZakup: { id: "stroj:pirat" },                       // dla reguł: który klucz dochodzi w tym zakupie
  ostatnieDoladowanie: { kwota: 550, notka: "Za piękne hu-hu!", kod: "HU-7F3K-2Q", at: <czas serwera> },
  ogloszenie: "Black Friday w Sowim Banku!",                 // tekst na górze Butiku (tylko admin)
  promocja: { procent: 30, do: <data> },                     // rabat na premium (tylko admin), może nie być
  zmieniono: <czas serwera>,
}
```

### 12.2. Podkolekcje

| Ścieżka | Kto pisze | Pola | Do czego |
| --- | --- | --- | --- |
| `sowiegry_wypluffki/portfel/wypluffki_prosby/{kod}` | gra (tworzy), admin (załatwia) | `kod`, `pakiet`, `kwota`, `status` („czeka” → „zatwierdzone” / „odrzucone”), `at`; po załatwieniu admin dopisuje `kwotaPrzyznana`, `notka`, `zalatwiono` | „Hu-hu w kolejce” w grze i w panelu |
| `sowiegry_wypluffki/portfel/wypluffki_historia/{wpis}` | tylko admin | `zmiana` (+/−), `saldoPo`, `rodzaj` („doładowanie”, „korekta”, „zwrot”), `kod`, `notka`, `at` | wyciąg z konta, historia w panelu |

### 12.3. Profil — co gracz ma na sobie (bez nowego pola najwyższego poziomu)

- W istniejącym polu `profil.shop` dochodzi mapa **`wyglad`**: `{ skorka, efekt, glos, taniec, "farma:konewka", … }`
  (zapis klucz po kluczu). Kostium premium to zwykły `cosmetics.selected`, jak dziś strój z Garderoby.
- **Gry czytają tylko profil**, tak jak dziś, i nie potrzebują portfela, więc start gry się nie wydłuża.
- **Kto co posiada:** rzeczy za piórka jak dziś (`shop.purchases`, `cosmetics.unlocked`), rzeczy za Wypluffki tylko
  w portfelu (`kupione`). Dzięki temu działa **zwrot** w panelu admina. Szafa i Butik sprawdzają portfel i jeśli wybrana
  rzecz została zwrócona, wracają do wyglądu domyślnego.
- `normalizeProfile` (SowieCloud) przepuszcza wybrany kostium premium bez wpisu w `cosmetics.unlocked` (oznaczenie
  `premium: true` w katalogu strojów). Dziś taki strój zostałby zresetowany do „Bez dodatku”.
- Powiadomienie „wpłynęło…” pokazuje się raz: profil zapamiętuje czas ostatnio pokazanego doładowania
  (`shop.bank.widziane`).
- Profil nadal ma ≤ 30 pól najwyższego poziomu (test).

### 12.4. Jak działa zapis

| Sytuacja | Co się dzieje |
| --- | --- |
| **Start Dziupli** | jeden odczyt portfela i nasłuch zmian (jak przy zapisach gier idle). Doładowanie od admina pojawia się od razu |
| **Zakup za Wypluffki** | **transakcja** Firestore: odczyt portfela → sprawdzenie (saldo, czy już kupione) → zapis: saldo − cena, wydano + cena, nowy wpis w `kupione`. Potem wybór w profilu (po 0,3 s, jak w Butiku). Dwa telefony naraz nie kupią „za te same” Wypluffki |
| **Bez internetu** | zakupy za Wypluffki wyłączone z komunikatem; zakupy za piórka działają jak dziś; licznik pokazuje ostatnie znane saldo z pamięci telefonu (SDK Firestore) |
| **Prośba o doładowanie** | zwykły zapis nowego dokumentu (bez internetu czeka w kolejce SDK i wysyła się sam) |
| **Admin** | transakcja: portfel + wpis w historii + status prośby + `ostatnieDoladowanie` |
| **Kopia zapasowa** | `scripts/kopia-firestore.mjs` obejmie też portfel i obie podkolekcje |
| **Testy** | tylko emulator Firestore i Authentication oraz pamięć (`?cloud=memory` ma udawany portfel z hakiem „doładuj” do testów); produkcyjnej bazy testy nie dotykają |
| **Koszt** | kilka odczytów i zapisów dziennie — daleko od darmowych limitów (50 000 odczytów i 20 000 zapisów dziennie) |

---

## 13. Reguły Firestore — co pilnują (prostym językiem)

Pełna treść do skopiowania: [Załącznik B](#załącznik-b-reguły-firestore--do-opublikowania-w-etapie-w2). Obecne
reguły profilu i gier zostają **słowo w słowo** — reguły tylko się rozszerzają.

1. **Portfel każdy może przeczytać** (gra pokazuje saldo bez logowania).
2. **Tylko admin** (konto z listy UID) może założyć portfel, dodać Wypluffki, zrobić korektę, zwrot, ogłoszenie
   i promocję. Nawet admin nie zrobi salda poniżej zera.
3. **Gra może tylko wydawać:** saldo może wyłącznie maleć (nigdy poniżej zera), „wydano” rośnie dokładnie o tyle,
   ile ubyło, w dzienniku dochodzi dokładnie **jedna** nowa rzecz z tą ceną, a nic innego (doładowania, ogłoszenie,
   promocja, stare zakupy) się nie zmienia.
4. **Prośby o doładowanie** gra może tylko **dodawać**: z poprawnym kodem `HU-XXXX-XX`, statusem „czeka” i kwotą od 1
   do 100 000. Zatwierdzać, odrzucać i kasować może tylko admin.
5. **Historię** pisze tylko admin; czytać może każdy (wyciąg w Butiku).
6. Wszystko inne jest zamknięte (jak dziś).

**Czego reguły celowo nie pilnują:** ceny konkretnej rzeczy (pilnuje jej aplikacja). Ktoś z narzędziami programisty
mógłby „kupić” rzecz taniej z **własnych** Wypluffek, ale **nie dopisze sobie nowych**. Cennik w regułach trzeba by
zmieniać przy każdej nowej rzeczy, a to zbyt duży koszt jak na grę rodzinną.

---

## 14. Technika

### 14.1. Nowe pliki

| Plik | Za co odpowiada |
| --- | --- |
| `shared/meta/wypluffki.js` | katalog rzeczy premium (id, rodzaj, miejsce, cena, rzadkość, grafika, opis), pakiety, VIP, oferta dnia (z ziarnem daty — `createRng`), jajko-niespodzianka, generator kodów `HU-XXXX-XX`, normalizacja portfela, `premiumOffer`, `buyPremium`, `requestTopUp`, sprawdzanie katalogu (tylko wygląd) |
| `shared/dziupla/butik.js`, `butik.css` | ekran Sowiego Butiku (dwie waluty, zakładki, oferta dnia, paragon, wyciąg, regulamin, kantor, VIP) — wspólny dla Szafy i Dekoratora |
| `shared/dziupla/doladuj.js` | pakiety, metoda płatności, „Przetwarzanie…”, obrazek hu-hu na kozę (płótno z atlasu + dane wpłaty), „Udostępnij”, „reklama” |
| `shared/dziupla/bank.js` | licznik Wypluffek na górnym pasku, Wypluffkomat, ulotka na tablicy, okienko „wpłynęło…” |
| `shared/world/skins.js` | skórki Sówki (palety + warstwy wzorów) łączone z gatunkami w jednym `setTransform` |
| `Admin/index.html`, `Admin/admin.js`, `Admin/admin.css` | panel admina (Firebase Auth + Firestore, SDK 12.19.0 jak w grze, osobna nazwana aplikacja `sowiegry-admin`, pamięć podręczna tylko w pamięci, zawsze świeże dane) |
| `Admin/docs/README.md`, `Admin/docs/Documentation.md` | instrukcja dla admina i opis kodu (zasady z `AGENTS.md`) |
| `assets/svg/wypluffki/` | ikonka Wypluffki (zwykła i radosna), Wypluffkomat, ulotka, jajko, naklejki |
| `assets/svg/garderoba/` (nowe) | kostiumy premium |
| `assets/svg/dziupla/premium/` | ozdoby premium Dziupli |
| `assets/svg/sowa/dziob-otwarty.svg`, `assets/svg/kozki/` (dodatki) | poza „hu-hu” i przestraszona koza |
| `assets/audio/sfx/` | „mee”, „hu-ching” (dźwięk kasy w wersji sowiej), głosy Sówki |

### 14.2. Zmiany w istniejących plikach

| Plik | Zmiana |
| --- | --- |
| `shared/sowie-cloud.js` | API portfela: `wallet()`, `onWallet(fn)`, `buyPremium(id, cena)` (transakcja), `requestTopUp(pakiet)`, `topUpRequests()`, `walletHistory()`; transakcje w `FirestoreBackend` (`runTransaction`) i `MemoryBackend`; ścieżki `sowiegry_wypluffki/…`; `normalizeProfile` przepuszcza kostiumy premium. SowieCloud zostaje **jedynym** modułem gry, który rozmawia z Firestore |
| `shared/meta/shop.js` | `shopOffer` z dwiema walutami; `buy(id)` kieruje zakup do piórek (jak dziś) albo do Wypluffek; `shop.wyglad` |
| `shared/sowie-platform.js` | kostiumy premium w `COSMETICS` (z `premium: true`) |
| `shared/world/owl.js`, `species.js` | poza `huhu`; skórki obok gatunków |
| gry zręcznościowe, Sowie Trójki | ślad, głos, gałąź i ramka (miejsca opisane w dokumentacji każdej gry) |
| `shared/meta/guides-data.js` | „Jak grać?” → „Sowi Butik i Wypluffki” |
| `firestore.rules`, `firebase.json` | reguły (Załącznik B); emulator Authentication (port 9099) do testów |
| `package.json`, `eslint.config.js`, `scripts/check-syntax.sh` | `Admin/` w formatowaniu, lincie i sprawdzaniu HTML; `test:e2e` z `--only firestore,auth` |
| `tests/unit/architecture.test.mjs` | wyjątek: `Admin/admin.js` może używać Firestore i Auth (osobna strona, nie gra); gry nadal tylko przez SowieCloud |
| `sw.js` | nowe pliki w pamięci aplikacji, nowa `VERSION`; adres `/Admin/` pomijany |
| `scripts/kopia-firestore.mjs` | kopia portfela i podkolekcji |
| `docs/Documentation.md`, `docs/README.md`, dokumentacja gier z nowymi skórkami | zgodnie z `AGENTS.md` |

### 14.3. Wydajność (Analiza 6)

- Licznik, Wypluffkomat i ulotka to zwykłe elementy strony (DOM), bez rysowania co klatkę.
- Skórki działają jak gatunki: kolory podmienia atlas **raz**, przed rysowaniem, więc w grze nic nie kosztują.
- Ślady to cząsteczki w budżecie silnika, wyłączane przez automat płynności i „Efekty”.
- Obrazek hu-hu rysujemy raz (płótno), a animacja trwa 1,2 s i się zatrzymuje.
- Nasłuch portfela to jedno połączenie z bazą; gry go nie używają.

---

## 15. Testy

### 15.1. Jednostkowe (`node --test`)

- **Katalog:** unikalne id, każda rzecz ma jedną walutę, ceny całkowite > 0 (poza nagrodą z Pakietu Startowego),
  każda rzecz ma grafikę i miejsce, **każda rzecz premium jest „wyglądem”** (rozdz. 10), żadna rzecz za piórka
  nie zmieniła ceny ani id (nic nie ginie).
- **Pakiety, VIP, oferta dnia** (ta sama dla tej samej daty, nigdy rzecz posiadana), **jajko** (bez powtórek, szanse
  sumują się do 100%, „pusta pula”), **kod** (format, alfabet bez 0/O/1/I).
- **Portfel:** normalizacja (brak, uszkodzony, nieznane rzeczy zostają), zakup w `MemoryBackend`: za mało, już
  kupione, sukces, bez internetu, dwa zakupy naraz (jeden przechodzi).
- **Profil:** kostium premium przechodzi normalizację, `shop.wyglad`, ≤ 30 pól, zwrócona rzecz → wygląd domyślny.
- **Butik za piórka:** wszystkie dotychczasowe testy (także G3) bez zmian i zielone.

### 15.2. Reguły (emulator, `@firebase/rules-unit-testing`)

- Bez logowania: czyta portfel; **nie** zakłada portfela; **nie** zwiększa salda; **nie** schodzi poniżej zera;
  **nie** zmienia `doladowano`, ogłoszenia ani promocji; **nie** dodaje dwóch rzeczy naraz; **nie** usuwa zakupów;
  poprawny zakup przechodzi; cena w dzienniku ≠ ubytek salda → odrzucone.
- Konto spoza listy UID (zalogowane) → jak gracz.
- Admin: zakłada portfel, doładowuje, robi korektę i zwrot; saldo < 0 → odrzucone.
- Prośby: poprawna przechodzi; zły kod, status, kwota 0 albo > 100 000, dodatkowe pola → odrzucone; gracz nie zmienia
  statusu; admin zmienia.
- Historia: gracz czyta, nie pisze.
- Dotychczasowe testy reguł (profil, gry, historia) bez zmian.

### 15.3. W przeglądarce (Playwright, profile telefonów, Chromium + WebKit w GitHubie)

1. Dziupla: licznik Wypluffek, Wypluffkomat i ulotka są widoczne i nic się nie nakłada (320 × 568, poziomo).
2. Butik: zakup za piórka jak dziś; zakup za Wypluffki (portfel z emulatora) → paragon → „Załóż teraz” → Sówka w nowym
   wyglądzie w Dziupli i w grze.
3. Za mało Wypluffek → „Doładuj”; bez internetu → przyciski premium wyłączone.
4. Doładuj: pakiet → metoda → przetwarzanie → **obrazek mieści się w ekranie** na każdym profilu telefonu (kod,
   kwota i data widoczne bez przewijania) → prośba w bazie; czwarta prośba → komunikat o kolejce.
5. Panel admina (emulator Authentication): logowanie → prośba na liście → „Zatwierdź” → u gracza w drugiej karcie
   okienko „wpłynęło…” i nowe saldo (nasłuch na żywo).
6. Zwrot w panelu → rzecz znika z Szafy, Wypluffki wracają.
7. Szafa i Dekorator: zakładki premium, zakup na miejscu.
8. Ograniczenie ruchu: bez pulsowania „+” i bez animacji obrazka.
9. Gry: start każdej gry bez portfela (np. zablokowany odczyt) działa normalnie.

### 15.4. Na telefonie (dla Ciebie — dopiszę do `TESTY_NA_TELEFONIE.md`)

| Test | Co sprawdzasz |
| --- | --- |
| B1 | panel admina na Twoim telefonie: logowanie, „Załóż portfel gracza”, doładowanie z notką |
| B2 | u gracza: licznik w Dziupli, okienko „wpłynęło…” z notką |
| B3 | „Doładuj Wypluffki”: pakiet → hu-hu na kozę → czy obrazek jest zabawny i cały mieści się na zrzucie; wysłanie zrzutu |
| B4 | panel: hu-hu z kodem ze zrzutu na liście → „Zatwierdź” → u gracza świętowanie |
| B5 | Butik: zakup za piórka i za Wypluffki, „za mało”, oferta dnia, wyciąg, regulamin |
| B6 | skórka, kostium i ślad widać w Dziupli i w grach; głos i taniec po stuknięciu Sówki |
| B7 | zwrot w panelu; dwa telefony (saldo się zgadza) |

---

## 16. Ryzyka

| Ryzyko | Skutek | Jak zapobiegamy |
| --- | --- | --- |
| Błąd w regułach | gracz nie może kupić albo admin doładować | testy reguł na emulatorze przed publikacją; komunikat z UID w panelu; test B1 zaraz po publikacji |
| Gracz pomyśli, że to prawdziwe płatności | niepokój, zwłaszcza u dziecka | nigdzie „zł” ani kart; cena to „× Hu-hu”; regulamin i dopisek „Wypluffki nie są prawdziwe”; karta w „Jak grać?” |
| Parodia męczy | psuje przytulny klimat | żadnych okienek w grach, jedna ulotka, komentarze Sówki raz dziennie i wyłączane (rozdz. 11.2) |
| Popsucie obecnego Butiku | powrót uwagi G3 | zakupy za piórka bez zmian w logice i zapisie; testy G3 zostają |
| Utracone hasło admina | brak dostępu do panelu | reset hasła w konsoli Firebase; drugi UID na liście |
| Ustawienia projektu Firebase (dozwolone domeny, ograniczenia klucza API) | logowanie w panelu nie działa | lista kontrolna w rozdz. 18 (krok 4) i komunikat w panelu |
| Zalew próśb o doładowanie | długa lista u admina | najwyżej 3 czekające; „Odrzuć” jednym stuknięciem |
| Ten sam zrzut wysłany dwa razy | podwójne doładowanie | kod i data na obrazku; panel ostrzega o użytym kodzie |
| Zakup bez internetu | „zawieszony” zakup | zakupy premium tylko online, w transakcji; czytelny komunikat |
| Dziupla jeszcze w budowie | Wypluffki nie mają gdzie się pokazać | etapy W przeplatane z D (rozdz. 17); panel i logika mogą powstać wcześniej |
| Więcej grafik i testów | dłuższa praca i dłuższe testy w GitHubie | katalog na start ok. 60 rzeczy (wiele z gotowych technik: palety, stroje); testy bez czekania na klatki; rozdzielenie testów z Analizy 8 (rozdz. 17.4) |

---

## 17. Plan prac

### 17.1. Etapy

| Etap | Co | Rozmiar |
| --- | --- | --- |
| **W0** | decyzje (rozdz. 19), Twoja konfiguracja Firebase Authentication (rozdz. 18) — ta analiza | S |
| **W1** | logika: katalog, pakiety, VIP, oferta dnia, kod, portfel w SowieCloud (odczyt, nasłuch, transakcja, prośby), `MemoryBackend`, reguły + testy reguł, testy jednostkowe | M (2–3 dni) |
| **W2** | **panel admina** `Admin/` (logowanie, saldo, kolejka hu-hu, doładowanie, korekta, zwrot, historia, ogłoszenie i promocja), emulator Authentication w testach, dokumentacja panelu → **publikacja reguł przez Ciebie** i test B1 | M (2 dni) |
| **W3** | „Doładuj Wypluffki”: pakiety, metoda płatności, przetwarzanie, **obrazek hu-hu na kozę** (poza „hu-hu”, koza, warianty pakietów), kolejka, okienko „wpłynęło…” (najpierw obrazek do Twojej akceptacji) | M (2 dni) |
| **W4** | wspólny Sowi Butik (dwie waluty, zakładki, oferta dnia, paragon, wyciąg, regulamin, kantor, VIP) + premium w Szafie i Dekoratorze; licznik, Wypluffkomat, ulotka | M–L (2–3 dni) |
| **W5** | grafiki premium: ikonka, Wypluffkomat, skórki (palety + wzory), kostiumy, ozdoby Dziupli, gałąź i ramka w Trójkach (najpierw obrazek do akceptacji) | L (3 dni) |
| **W6** | wygląd w grach: skórki i kostiumy (atlas), ślady (Ucieczka, Tory, Chmury, iskierki w Trójkach), głosy, tańce | M (1–2 dni) |
| **W7** | „na deser”: jajko-niespodzianka, „reklama” za 0 Wypluffek, Mityczny Puch | S (1 dzień) |
| **W8** | Sowia Farma: skórki narzędzi, strachów i domu, Kózka-maskotka — **razem z Farmą** (Analiza 8, etapy F6 i F9) | S–M (1–2 dni, w budżecie Farmy) |
| **W9** | dokumentacja (`docs/`, `Admin/docs/`, dokumentacja gier), `TESTY_NA_TELEFONIE.md` (B1–B7), `UWAGI_WLASCICIELA.md`, `STAN_PRAC.md` — na bieżąco w każdym etapie, zamknięcie na końcu | S |

**Razem ok. 13–16 dni pracy** (bez W8).

### 17.2. Kolejność razem z Sowią Dziuplą (Analiza 7, rozdz. 15)

```
D0 + W0   decyzje do obu analiz, Twoja konfiguracja Firebase Auth
D1 + W1   katalog Dziupli i katalog premium, stan, portfel, reguły (testy na emulatorze)
W2        panel admina → Ty publikujesz reguły → test B1 (możesz już doładować pierwsze Wypluffki)
D2        scena Dziupli z górnym paskiem (licznik Wypluffek), tablica, Sówka — podgląd
W3        „Doładuj Wypluffki” i obrazek hu-hu na kozę
D3 + W4   Szafa z zakładkami premium; wspólny Sowi Butik
D4 + W4   Dekorator z kategorią „Premium ✨”
D5 + W5   grafiki Dziupli i premium — jeden obrazek do akceptacji
W6        wygląd premium w grach
D6 + W7   „Więcej”, adresy, powitania Sówki; jajko i „reklama”
D7 + W9   przełączenie ekranu startowego po Twojej zgodzie, testy, dokumentacja
— później: W8 z Sowią Farmą
```

Dziupla (10–14 dni) i Wypluffki (13–16 dni) razem to ok. **23–30 dni pracy, czyli 5–6 tygodni**, bo część pracy jest
wspólna (Szafa, Dekorator, górny pasek). Podgląd Dziupli z Wypluffkami da się sprawdzać już po W3. Reguły i panel
admina działają wcześniej, więc pierwsze doładowanie możesz zrobić, zanim gracz zobaczy sklep.

---

## 18. Twoje czynności krok po kroku

Raz, ok. 5–10 minut, **w etapie W2** (napiszę, kiedy). Wszystko na darmowym planie Spark.

1. **Konsola Firebase** → projekt `sowiegry-1e1f9` → **Authentication** → „Rozpocznij” (Get started).
2. **Sign-in method** → **E-mail/hasło** (Email/Password) → włącz pierwszy przełącznik (bez „linku e-mail”) → Zapisz.
3. **Users** → **Add user**: e-mail admina i **mocne hasło** (tylko do panelu, inne niż „huhu”). Skopiuj **User UID**
   z tabeli (długi ciąg liter i cyfr).
4. **Settings → Authorized domains:** sprawdź, czy jest `cutelittlegoat.github.io`; jeśli nie — dodaj. (Jeśli kiedyś
   ograniczałeś klucz API w Google Cloud, musi mieć dostęp do „Identity Toolkit API”. Przy nowym projekcie zwykle
   nic nie trzeba robić.)
5. **Wyślij mi UID** (to nie jest tajne — to tylko numer konta, nie hasło). Wpiszę go do `firestore.rules`
   w repozytorium (miejsce `WKLEJ_TU_UID_ADMINA`), żeby kopia reguł zgadzała się z opublikowanymi.
6. **Kolekcja, dokument i pola — nie musisz zakładać ich ręcznie**, bo panel ma przycisk „Załóż portfel gracza”.
   Jeśli wolisz sam, w **Firestore Database**: „Rozpocznij kolekcję” → identyfikator `sowiegry_wypluffki` → dokument
   o identyfikatorze `portfel` z polami: `schemaVersion` (number) = 1, `saldo` (number) = 0, `doladowano`
   (number) = 0, `wydano` (number) = 0, `kupione` (map) — pusta.
7. **Opublikuj reguły** z [Załącznika B](#załącznik-b-reguły-firestore--do-opublikowania-w-etapie-w2) (już z Twoim UID —
   dostaniesz gotowy tekst) → Firestore Database → Reguły → wklej całość → Opublikuj.
8. Wejdź na **https://cutelittlegoat.github.io/SowieGry/Admin/**, zaloguj się i zrób test B1.

Gra i obecne zapisy działają przez cały czas bez zmian. Nowe reguły tylko **dopisują** portfel.

---

## 19. Pytania do właściciela (prostym językiem)

Napisałeś „zdaję się na Ciebie”, więc przy każdym pytaniu jest moja rada. **Jeśli nie odpowiesz, robię według rad.**
Można odpowiedzieć krótko, np. „wszystko według rad” albo „4 nie, reszta według rad”.

1. **Logowanie do panelu admina:** e-mail i hasło przez Firebase (darmowe, bezpieczne — tylko Ty możesz dodać
   Wypluffki), czy samo hasło wpisane w stronę (prościej, ale ktoś obeznany z komputerem mógłby dopisać sobie
   Wypluffki)? (**Polecam:** e-mail i hasło.)
2. **„Hu-hu w kolejce”:** czy po kliknięciu „Doładuj” prośba z kodem ma od razu trafiać na listę w Twoim panelu (zrzut
   dostajesz i tak, a zatwierdzasz jednym stuknięciem), czy wolisz za każdym razem wpisywać kwotę ręcznie?
   (**Polecam:** lista — wygodniej, a ręczne doładowanie i tak zostaje.)
3. **Pakiety i ceny:** pakiety od 100 do 6 500 Wypluffek, rzeczy po 149–2 499 (np. kostium ok. 400–800, Złota skórka
   1 499) — pasuje? (**Polecam:** tak; po pierwszych tygodniach łatwo zmienić.)
4. **Jajko-niespodzianka** (losowa rzecz za Wypluffki, bez powtórek i z wypisanymi szansami) — dodać jako żart
   z „losowych skrzynek”? (**Polecam:** tak, na koniec, w etapie W7.)
5. **Przycisk „Udostępnij obrazek”** obok zrzutu ekranu — od razu wysyła obrazek „dowodu wpłaty” np. przez Messengera.
   Dodać? (**Polecam:** tak; zrzut ekranu dalej działa.)
6. **Program VIP** od Płotki do Humbaka (za wydane Wypluffki — tylko odznaki, ramki i pluszowy humbak w Dziupli) —
   dodać? (**Polecam:** tak — to najlepszy żart z „wielorybów”.)
7. **Rzeczy do Sowiej Farmy** przed jej premierą: pokazywać je w Butiku jako „przedsprzedaż” (parodia zamówień
   przedpremierowych — kupione czekają na Farmę), czy pokazać je dopiero razem z Farmą? (**Polecam:** dopiero razem
   z Farmą — żeby nie kupować czegoś, czego nie widać; ewentualnie jedna „przedsprzedaż” jako żart.)
8. **Początek:** portfel startuje od 0, a pierwsze Wypluffki dajesz Ty (np. 500 „na powitanie” przy zakładaniu
   portfela) — dobrze? (**Polecam:** tak, prezent powitalny z notką.)
9. **Nazwy i pomysły:** Wypluffki, Sowi Bank, Wypluffkomat, Sowi Klub, Humbaczy Ładunek, Mityczny Puch — pasują? Masz
   pomysły na skórki, kostiumy albo ozdoby (np. ulubione postacie, kolory, żarty rodzinne)? Dopiszę je do katalogu.
   (Można: „zdaję się na Ciebie”.)

---

## Załącznik A. Katalog pierwszej wersji

Ceny w Wypluffkach (●). Rzadkość: R — Rzadki, E — Epicki, L — Legendarny, M — Mityczny Puch. Identyfikatory tylko
dopisujemy (nic nie ginie). Ostateczne ceny ustalę w W1 według odpowiedzi na pytanie 3.

### A.1. Sówka

| Rodzaj | Rzecz | Cena | Rz. |
| --- | --- | --- | --- |
| Skórka | Cukrowa Wata (pastelowy róż i błękit) | 299 | R |
| Skórka | Czekoladowa („nie jeść”) | 299 | R |
| Skórka | Lodowa (błękit ze szronem) | 499 | E |
| Skórka | Neonowa (fiolet i zieleń, „świeci”) | 499 | E |
| Skórka | Galaktyczna (granat w gwiazdki) | 799 | E |
| Skórka | Duszek (biała, półprzezroczysta, lekko unosi się) | 799 | E |
| Skórka | Tęczowa (mieni się) | 999 | L |
| Skórka | **Złota** (błyszczy, iskierki) | 1 499 | L |
| Skórka | **Mityczny Puch** (co dzień inny kolor) | 2 499 | M |
| Kostium | Piżama ze szlafmycą | 299 | R |
| Kostium | Kapelusz Pirata z opaską | 399 | R |
| Kostium | Kostium Kozy (rogi i bródka — „Mee-hu?”) | 499 | E |
| Kostium | Hełm Rycerza | 499 | E |
| Kostium | Hełm Astronautki | 599 | E |
| Kostium | Kapelusz Czarodziejki z różdżką | 599 | E |
| Kostium | Kombinezon Humbaka (płetwa na plecach) | 799 | E |
| Kostium | Kula Disco na głowie | 999 | L |
| Kostium | Czapeczka Nowicjusza | tylko w Pakiecie Startowym | R |
| Ślad | Brokat · Serduszka | 299 | R |
| Ślad | Nutki | 399 | R |
| Ślad | Konfetti | 499 | E |
| Ślad | Złote piórka | 599 | E |
| Ślad | Tęcza | 799 | L |
| Głos | Hu-hu z echem · Hu-hu basem | 149 | R |
| Głos | Hu-hu operowe · Hu-hu 8-bit | 199 | R |
| Głos | „Mee-hu” (kozie) | 249 | E |
| Taniec | Taniec radości | 199 | R |
| Taniec | Salto · Kłębek puchu | 299 | E |
| Taniec | Moonwalk | 399 | E |

### A.2. Sowia Dziupla — ozdoby premium (miejsca z Analizy 7, rozdz. 6.1)

| Miejsce | Rzecz | Cena | Rz. |
| --- | --- | --- | --- |
| Wygląd dziupli | Dziupla Disco · Kosmiczna Dziupla | 1 499 | L |
| Wygląd dziupli | **Złota Dziupla** | 1 999 | L |
| Okno | Wypluffkowe Góry | 499 | E |
| Okno | Tęczowy wodospad | 599 | E |
| Sufit | Neon „HU-HU” | 599 | E |
| Sufit | Kula disco | 699 | E |
| Sufit | Kryształowy żyrandol | 799 | L |
| Obrazek | ramka Neonowa | 299 | R |
| Obrazek | ramka Złota barokowa | 399 | E |
| Półka z roślinkami | Złote doniczki (wszystkie miejsca) | 499 | E |
| Tablica z grami | Złote pinezki | 199 | R |
| Tablica z grami | ramka Neonowa | 399 | E |
| Szafa | Szafa-sejf | 599 | E |
| Szafa | Szafa gwiazdy (lustro z żarówkami) | 699 | E |
| Miejsce Sówki | Fotel gamingowy | 799 | E |
| Miejsce Sówki | **Złoty tron** | 999 | L |
| Dywan | Dywan z Wypluffek | 399 | R |
| Dywan | Czerwony dywan VIP | 499 | E |
| Zabawka | Pluszowa Wypluffka | 199 | R |
| Zabawka | Złota koza (statuetka) | 899 | L |
| Zabawka | Pluszowy Humbak VIP | tylko VIP „Humbak” | L |

### A.3. Gry

| Gra | Rzecz | Cena | Rz. |
| --- | --- | --- | --- |
| Sowie Trójki | Huśtawka zamiast gałęzi | 399 | R |
| Sowie Trójki | Złota gałąź | 499 | E |
| Sowie Trójki | Ramka planszy „Disco” (kafelki bez zmian) | 599 | E |
| Sowia Farma (W8) | Konewka-czajniczek | 399 | R |
| Sowia Farma (W8) | Złota motyka-łopatka · Sierp-księżyc · Strach-Sowa Pirat | 499 | E |
| Sowia Farma (W8) | Strach-robot | 599 | E |
| Sowia Farma (W8) | **Konewka-humbak** (woda leci z „fontanny” na grzbiecie) · Gałąź do spania ze złotymi liśćmi | 699 | E |
| Sowia Farma (W8) | Kózka-maskotka (spaceruje po farmie i meczy — nic nie zbiera) | 799 | L |
| Sowia Farma (W8) | Dom z dachem-grzybkiem | 999 | L |

### A.4. Wypluffki

| Rzecz | Cena / zasada |
| --- | --- |
| Pakiety | rozdz. 7.2 |
| Oferta dnia | −20% na jedną rzecz dziennie (rozdz. 5.2) |
| Promocja admina | −X% na wszystkie rzeczy premium do wybranego dnia (panel) |
| Sowie jajko-niespodzianka | 399 (rozdz. 9) |
| „Reklama” | 0 Wypluffek (rozdz. 7.2) |
| VIP Sowi Klub | rozdz. 9 |

Cały katalog premium to ok. 40 000 Wypluffek, czyli ok. 70 zrzutów „Kieszeni”. Jest co zbierać, ale admin i tak
decyduje, ile daje.

---

## Załącznik B. Reguły Firestore — do opublikowania w etapie W2

**Teraz niczego nie publikuj.** W etapie W2 dostaniesz ten tekst z wpisanym Twoim UID. Część „SowieGry” jest **słowo
w słowo** taka jak dziś (`firestore.rules` z 2026-11-23). Nowa jest tylko część „Wypluffki”. Jeśli wcześniej dojdzie
Sowia Farma (`"farma"` na liście gier — Analiza 8, Załącznik B), dostaniesz jedną, połączoną treść.

**Sprawdzone 2026-11-24 na emulatorze Firestore** (firebase-tools 15.31.0, poza repozytorium): 17 testów z rozdz. 15.2
przechodzi. Gracz robi poprawny zakup. Gracz nie zwiększy salda, nie zejdzie poniżej zera, nie zmieni ceny, doładowań,
ogłoszenia ani starych zakupów i nie doda dwóch rzeczy naraz. Konto spoza listy działa jak gracz. Admin doładowuje,
robi korektę i zwrot oraz zakłada portfel, ale nie ustawi salda poniżej zera ani nie skasuje portfela. Prośby
i historia działają jak w rozdz. 13, a profil i pozostałe kolekcje bez zmian. W W1 te testy trafią do `tests/rules/`.

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // SowieGry (projekt sowiegry-1e1f9). Wszystko poza ścieżkami niżej jest zamknięte.
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
        allow create, update, delete: if gra in ["runner", "jumper", "sowa3", "ogrody", "szklarnia", "trojki"];

        match /sowiegry_historia/{wpis} {
          allow read: if true;
          allow create: if request.resource.data.score is number;
          allow delete: if true;          // przycinanie historii do 50 wpisów
          allow update: if false;
        }
      }
    }

    // --- Wypluffki (Analiza 7b) -------------------------------------------------------------
    // Admin = konto e-mail z Firebase Authentication zalogowane w panelu Admin/.
    // Gra nie loguje się wcale — dla reguł gracz to „ktoś bez logowania”.
    function jestAdminem() {
      return request.auth != null && request.auth.uid in ["WKLEJ_TU_UID_ADMINA"];
    }

    function poprawnyPortfel(p) {
      return p.schemaVersion is int
          && p.saldo is int && p.saldo >= 0 && p.saldo <= 10000000
          && p.doladowano is int && p.wydano is int
          && p.kupione is map;
    }

    // Gracz może tylko WYDAWAĆ: saldo maleje (nigdy poniżej zera), „wydano” rośnie o tyle samo,
    // dochodzi dokładnie jeden nowy zakup za tę kwotę, reszta portfela się nie zmienia.
    function zakupGracza() {
      let przed = resource.data;
      let po = request.resource.data;
      let cena = przed.saldo - po.saldo;
      let nowe = po.kupione.diff(przed.kupione);
      return po.diff(przed).affectedKeys().hasOnly(["saldo", "wydano", "kupione", "ostatniZakup", "zmieniono"])
          && po.saldo is int && po.saldo >= 0 && cena > 0
          && po.wydano == przed.wydano + cena
          && nowe.addedKeys().size() == 1
          && nowe.changedKeys().size() == 0
          && nowe.removedKeys().size() == 0
          && po.ostatniZakup.id in nowe.addedKeys()
          && po.kupione[po.ostatniZakup.id].cena == cena
          && po.zmieniono == request.time;
    }

    match /sowiegry_wypluffki/portfel {
      allow read: if true;
      allow create: if jestAdminem() && poprawnyPortfel(request.resource.data);
      allow update: if (jestAdminem() && poprawnyPortfel(request.resource.data)) || zakupGracza();
      allow delete: if false;

      // „Hu-hu w kolejce”: gra tylko dodaje prośby, admin je załatwia.
      match /wypluffki_prosby/{kod} {
        allow read: if true;
        allow create: if kod.matches('^HU-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{2}$')
                      && request.resource.data.keys().hasOnly(["kod", "pakiet", "kwota", "status", "at"])
                      && request.resource.data.kod == kod
                      && request.resource.data.pakiet is string
                      && request.resource.data.kwota is int
                      && request.resource.data.kwota > 0
                      && request.resource.data.kwota <= 100000
                      && request.resource.data.status == "czeka"
                      && request.resource.data.at == request.time;
        allow update, delete: if jestAdminem();
      }

      // Wyciąg z konta: wpisy (doładowania, korekty, zwroty) dopisuje tylko admin.
      match /wypluffki_historia/{wpis} {
        allow read: if true;
        allow create, update, delete: if jestAdminem();
      }
    }
  }
}
```

---

## Załącznik C. Przykładowy przebieg (jak to będzie wyglądać)

1. **Gracz, wieczór.** Wchodzi do Dziupli, na górnym pasku: 🪶 120 · ● 0 [+]. Na końcu tablicy wisi ulotka „OFERTA
   DNIA: Kapelusz Pirata −20%”. Stuka „+”.
2. **Doładuj Wypluffki** → „Kieszeń Wypluffek — 550 ● — 1 × Hu-hu (głośne) — NAJPOPULARNIEJSZE” → metoda „Hu-hu na
   kozę” (karta wyszarzona: „sowy nie mają kart”) → „Weryfikacja kozy…”.
3. **Obrazek:** Sówka w Kapeluszu Ogrodnika rozkłada skrzydła: „HU HU!”, koza podskakuje: „MEEE?!”. Pod spodem:
   „Kieszeń Wypluffek · 550 ● · Kod HU-7F3K-2Q · 24.11.2026, 18:03 · czeka na admina ⏳”. Gracz robi zrzut (trzy palce
   w dół) i wysyła go adminowi.
4. **Admin, ten sam wieczór.** Śmieje się ze zrzutu, otwiera `…/SowieGry/Admin/`. Na górze: „Hu-hu w kolejce (1):
   HU-7F3K-2Q · Kieszeń 550”. Wpisuje notkę „Najgłośniejsze hu-hu w tym tygodniu!” → **Zatwierdź 550**.
5. **Gracz:** w Dziupli od razu: „Sowi Bank: wpłynęło 550 Wypluffek! 🎉 — Najgłośniejsze hu-hu w tym tygodniu!”.
   Licznik nabija się do 550, Sówka: „Hu-hu! Jesteśmy bogate!”.
6. **Zakup:** ulotka → Kapelusz Pirata ~~399~~ 319 ● → „To tylko wygląd — kupić?” → **paragon** → „Załóż teraz”.
   Sówka w kapeluszu pirata siedzi w Dziupli, a za chwilę biegnie w nim w Sowiej Ucieczce. Saldo: 231 ●, Sowi Klub:
   Płotka („Jeszcze 681 do Śledzia!”).
7. **Kantor:** gracz z ciekawości stuka „Kantor” → „Wypluffki → piórka: nieczynne. Sowa ma zasady.”
