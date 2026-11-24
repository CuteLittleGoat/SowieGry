# Analiza 7b — Wypluffki: udawane mikropłatności (parodia) w Sowiej Dziupli

> Data: 2026-11-24 · Podstawa: prośba właściciela z 2026-11-24 i dwie wiadomości uzupełniające z tego samego dnia
> (dosłownie w [rozdziale 1](#1-prośba-dosłownie-i-numer)), [`ANALIZA_7_Sowia_Dziupla.md`](ANALIZA_7_Sowia_Dziupla.md)
> (gdzie w Dziupli jest „pole” do Wypluffków), [`ANALIZA_8_Nowa_gra_Sowia_Farma.md`](ANALIZA_8_Nowa_gra_Sowia_Farma.md)
> (skórki narzędzi) i kod na `main` (Sowi Butik `shared/meta/shop.js`, SowieCloud `shared/sowie-cloud.js`, reguły
> `firestore.rules`, menu `shared/menu/`) · Status: **decyzje właściciela 2026-11-24** ([rozdział 19](#19-pytania-i-decyzje-właściciela)); budowa
> **razem z Sowią Dziuplą — na Twoje polecenie** ([rozdział 17](#17-plan-prac)) · Zasady pracy bez zmian: [`ANALIZA_3_Plan_prac.md`, rozdz. 8.1](ANALIZA_3_Plan_prac.md);
> zasada „nic nie ginie”: [`ANALIZA_4`, rozdz. 2](ANALIZA_4_Uwagi_z_testow_poprawki_i_rozbudowa.md); lekcja zapisu
> Butiku: uwaga G3.

Pierwsza wersja (2026-11-24) powstała jako jedyny nowy plik. Tego samego dnia przyszły Twoje uwagi i odpowiedzi —
są wpisane w tej wersji (rozdz. 1 i 19), a numery uwag i stan prac — w `UWAGI_WLASCICIELA.md` (W1, W1a–W1c, D1a, A1)
i `STAN_PRAC.md` (punkt 0.8). Testy na telefonie dopiszę do `TESTY_NA_TELEFONIE.md` przy budowie.

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
  piórek, punktów, żyć, zdjęć do Galerii ani przewagi w grze. Dwa wyjątki z Twoich decyzji: miejsca 4 i 5 na półce
  Dziupli i nawóz jakości w Farmie, działający jak ten od kozy (rozdz. 10).
- **Gdzie w Dziupli:** licznik Wypluffków z zielonym **„+”** na górnym pasku, obok piórek (klasyczne miejsce z gier
  na telefon). Do tego **Wypluffkomat** (automat z kulkami) na podłodze dziupli i **ulotka „Oferta dnia”** przypięta
  na końcu tablicy korkowej. Rzeczy premium widać też w **Szafie** i w **Dekoratorze**, z ceną w Wypluffkach.
- **„Doładuj Wypluffki”** (to Twoja „symulacja zakupu waluty”): pakiety z naklejkami „NAJPOPULARNIEJSZE” i „NAJLEPSZA
  OFERTA”, metoda płatności „Hu-hu na kozę” (karta i BLIK wyszarzone: „Banki nie akceptują wypluffków”), udawane „Łączenie
  z Sowim Bankiem…”, a na koniec **obrazek: Sówka robi „HU HU!” na kozę**, która podskakuje z wrażenia. Na obrazku
  jest **dowód wpłaty**: pakiet, kwota, kod (np. `HU-7F3K-2Q`), data. Gracz robi zrzut ekranu i wysyła go adminowi.
- **Panel admina** pod adresem **https://cutelittlegoat.github.io/SowieGry/Admin/**: hasło **„KoziAdmin”** zaszyte w kodzie
  (bez e-maili i bez kont — Twoja decyzja), saldo gracza, przyciski **+50 / +100 / +500 / +1000 / inna kwota**, notka dla
  gracza („Za piękne hu-hu!”) i lista **„Hu-hu w kolejce”**. Kod ze zrzutu jest już na tej liście, więc zatwierdzasz go
  jednym stuknięciem. Są też zwroty, historia, ogłoszenie i promocja. Bez logowania do konsoli Firestore.
- **U gracza:** gdy zatwierdzisz doładowanie, w Dziupli od razu pojawia się „Sowi Bank: wpłynęło 550 Wypluffków! 🎉”
  z Twoją notką.
- **Prosto:** gra ma jednego gracza i jednego admina, więc **bez zaawansowanych zabezpieczeń** (Twoja decyzja).
  Reguły Firestore sprawdzają tylko, czy dane są poprawne (np. saldo to liczba nie mniejsza od zera). Profil gracza
  i zapisy gier zostają bez zmian.
- **W przyszłości w panelu** (Twoja prośba): **kopia zapasowa** danych z Firestore do pliku i **przywracanie**
  z pliku (rozdz. 8.3, etap W10).
- **Parodia, ale bez natręctwa** (zasada potwierdzona przez Ciebie 2026-11-24): żadnych okienek w czasie gry. Żarty są w Butiku: odliczanie „Oferta kończy się za…”,
  które zawsze się przedłuża, regulamin Sowiego Banku, „Kantor: nieczynne”, program VIP od Płotki do **Humbaka**
  (w grach na telefon największych płacących nazywa się „wielorybami” — u nas wieloryb jest uroczy), reklama, która
  daje 0 Wypluffków, i uczciwe sowie jajko-niespodzianka.
- **Plan:** 10 etapów W0–W9, ok. **13–16 dni pracy**, przeplatanych z etapami Dziupli D0–D7. Dziupla i Wypluffki razem
  to ok. **5–6 tygodni**. Panel admina i logikę można zrobić na początku. Rzeczy do Farmy — dopiero po jej wdrożeniu. **Start: na Twoje
  polecenie** (kolejność: najpierw Dziupla i Wypluffki, Farma później).
- **Twoje czynności:** tylko publikacja reguł ([Załącznik B](#załącznik-b-reguły-firestore--do-opublikowania-w-etapie-w2))
  w etapie W2 i pierwsze wejście do panelu ([rozdział 18](#18-twoje-czynności-krok-po-kroku)) — bez konsoli
  Authentication. **Decyzje z 2026-11-24** są w [rozdziale 19](#19-pytania-i-decyzje-właściciela); pytań otwartych
  nie ma.

---

## 1. Prośba (dosłownie) i numer

Proponowany numer w [`UWAGI_WLASCICIELA.md`](UWAGI_WLASCICIELA.md): **W1** (Wypluffki). Dopiszę go przy rozpoczęciu
prac.

| Data | Wiadomość (dosłownie) |
| --- | --- |
| 2026-11-24 | „Zapoznaj się z repo "SowieGry" zwłaszcza w aspekcie kolejnych kroków rozwoju: Analizy/ANALIZA_7_Sowia_Dziupla.md Analizy/ANALIZA_8_Nowa_gra_Sowia_Farma.md Przygotuj nową analizę. Nazwij ją Analizy/ANALIZA_7b_Mikroplatnosci.md Chcę przygotować fikcyjne mikropłatności. Będą to "Wypluffki". Gracz NIC NIE BĘDZIE REALNIE KUPOWAĆ. Całe dodatkowe menu z mikropłatnościami ma być atrapą. Saldo konta będzie zmieniać admin. Saldo konta będzie się zapisywać w Firestore (mogę przygotować nową kolekcję, dokument i pole - potem podasz nowe Rules). Możesz zaplanować jakiś prosty interface dla admina do zmiany poziomu salda, żeby nie było konieczności logowania się do Firestore. Panel admina powinien być pod innym linkiem niż normalne gry (czyli https://cutelittlegoat.github.io/SowieGry/index.html, np. https://cutelittlegoat.github.io/SowieGry/Admin/admin.html - decyzję pozostawiam Tobie). Po kliknięciu w odpowiednie pole (dlatego musi to być wdrażane razem z Analizy/ANALIZA_7_Sowia_Dziupla.md, bo trzeba zaplanować gdzie ma być to pole) gracz będzie miał wybór do zakupu specjalnych itemów (np. skiny dla sówki, skiny dla narzędzi w Analizy/ANALIZA_8_Nowa_gra_Sowia_Farma.md itd.). Nie chcę boostów do zbierania punktów czy piórek. Cała mechanika ma być zabawną parodią zwykłych mikropłatności w grach mobilnych. Chcę, żeby był też przycisk "Doładuj Wypluffki". Po jego kliknięciu ma się pojawić grafika przedstawiająca sówką robiącą "Hu hu" na kozę. Cel: Gracz robi screena i wysyła adminowi. Admin potem doładowuje konto. Jeżeli masz jakieś pytania to zapisz je w analizie. Przed rozpoczęciem prac odpowiem na nie. Nie zmieniaj nic w repo poza utworzeniem nowego pliku analizy. Plik wrzuć na gałąź Main.” |
| 2026-11-24 | „Można połączyć sklep z Wypluffkami z Butikiem. Część będzie do odblokowania za punkty z gier a część za Wypluffki. Niemniej trzeba będzie zrobić panel do symulacji zakupów waluty.” |
| 2026-11-24 | „Niemniej zdaję się na Ciebie. Zrób tak, żeby było fajnie i funkcjonalnie.” |
| 2026-11-24 (po analizie) | „Logowanie do panelu admina (z mikropłatnościami) ma być zaszyte w kodzie. Ma to być "KoziAdmin". Bez maili.” |
| 2026-11-24 (po analizie) | „"karta i BLIK wyszarzone" zostaje, ale tekst zmień z "„sowy nie mają kart”" na  „Banki nie akceptują wypluffków”” |
| 2026-11-24 (po analizie) | „Bardzo też podoba mi się Twój kierunek "Parodia, ale bez natręctwa". Trzymajmy się tego.” |
| 2026-11-24 (po decyzjach) | „Odnośnie "Hasło „KoziAdmin” w kodzie, bez maili" - gra jest używana przez jednego gracza i jednego admina. Nie ma potrzeby tworzenia jakiś zaawansowanych zabezpieczeń.” |
| 2026-11-24 (po decyzjach) | „Dopisz też, że w przyszłości w panelu admina chciałbym mieć opcję tworzenia backupu danych z firestore i przywracania ich z pliku.” |
| 2026-11-24 (po decyzjach) | „Pracę nad wdrożeniem sklepu i butiku zaczniemy potem. Czekaj na moje polecenie.” |
| 2026-11-24 (po analizie) | odpowiedzi na pytania 1–9 (rozdz. 19) oraz do Analiz 7 i 8, które dotyczą Wypluffków: półka „można to połączyć z Analizy/ANALIZA_7b_Mikroplatnosci.md”, nawozy „kupowanych w sklepie kozy oraz za mikropłatności”, „Proponuję zacząć od wdrożenia mikropłatności i dziupli. Farmę dodamy później.” |

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
| pytania w analizie | rozdz. 19 (z decyzjami) |
| hasło panelu „KoziAdmin” w kodzie, bez maili | rozdz. 8.1, 13, 18, Załącznik B |
| karta i BLIK: „Banki nie akceptują wypluffków” | rozdz. 7.3, 11.1 |
| „Parodia, ale bez natręctwa” — trzymamy się tego | rozdz. 3 (zasada 4), 11.2 |
| półka Dziupli połączona z Wypluffkami; nawozy w Farmie także za Wypluffki | rozdz. 9, 10, Załącznik A |
| najpierw Dziupla i Wypluffki, Farma później | rozdz. 17 |
| jeden gracz i jeden admin — bez zaawansowanych zabezpieczeń | rozdz. 8.1, 13, Załącznik B |
| w przyszłości: kopia zapasowa z Firestore i przywracanie z pliku w panelu admina | rozdz. 8.3, etap W10 |
| start prac na Twoje polecenie | rozdz. 17 |

---

## 2. Jak jest dziś

| Co | Jak działa dziś | Co z tego wynika dla Wypluffków |
| --- | --- | --- |
| **Piórka** | waluta zdobywana w grach (zadania dnia, osiągnięcia, poziomy Sowiej Akademii) — `profil.academy.feathers`, wydawane przez `SowieAcademy.spend` | piórka zostają walutą „za granie”, bez żadnej wymiany na Wypluffki |
| **Sowi Butik** (zakładka „Sowa”) | 11 strojów (30–80 piórek), 6 gatunków sów (40–120 piórek, od poziomu Akademii), dłuższe działanie kózek (30–100 piórek); dziennik zakupów `profil.shop.purchases` (klucz po kluczu — lekcja z uwagi G3), zapis po 0,3 s | Butik staje się **wspólnym sklepem** z dwiema walutami; zakupy za piórka działają dokładnie jak dziś |
| **Profil** | jeden dokument `sowiegry/profil`, reguły: zapis z `schemaVersion` i najwyżej 30 pól najwyższego poziomu (dziś 13, Dziupla doda 1) | wybrane skórki zapiszemy w istniejącym polu `profil.shop` — **bez nowego pola najwyższego poziomu** |
| **Hasło „huhu”** | sprawdzane tylko w przeglądarce, bez logowania w Firebase; reguły nie odróżniają nikogo od nikogo | saldo w **osobnym dokumencie** z prostymi regułami poprawności danych (rozdz. 13); hasło admina „KoziAdmin” też w kodzie (decyzja 2026-11-24) |
| **Firebase** | projekt `sowiegry-1e1f9`, darmowy plan Spark, tylko Firestore (bez Authentication) | bez zmian — **bez Firebase Authentication** (decyzja 2026-11-24); nikt się nie loguje |
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
3. **Saldo zmienia tylko admin** — w panelu z hasłem „KoziAdmin”. Jeden gracz i jeden admin, więc bez
   zaawansowanych zabezpieczeń (rozdz. 8.1).
4. **Parodia, ale bez natręctwa** (potwierdzone przez Ciebie: „Trzymajmy się tego”). Żadnych okienek w trakcie gry i żadnych „kup teraz” przy starcie gry. Parodia mieszka w Butiku
   i na ekranie doładowania (rozdz. 11.2).
5. **Nic nie ginie.** Kupione rzeczy są zapisane w portfelu (dzienniku zakupów), a obecne zakupy za piórka, stroje,
   gatunki i zapisy gier zostają bez zmian.
6. **Granie najważniejsze.** Gra nigdy nie czeka na portfel. Jeśli portfel się nie wczyta, gry działają, a Sówka
   ma na sobie to, co ostatnio wybrano.

---

## 4. Wypluffki — waluta

| Cecha | Ustalenie |
| --- | --- |
| Nazwa | **Wypluffka**, l.mn. **Wypluffki**, dopełniacz „Wypluffków” („550 Wypluffków” — jak w Twojej wiadomości: „Banki nie akceptują wypluffków”). Skrót na przyciskach: sama ikonka i liczba |
| Ikonka | puchata, owalna kulka w kolorze kakao z mlekiem, z białym błyskiem i małą złotą gwiazdką „premium”; w wersji „radosnej” (np. przy doładowaniu) ma zamknięte oczka „^^”. Plik `assets/svg/wypluffki/wypluffka.svg`, w stylu Sowiego Świata (kontur `#3b2f4a`) |
| Skąd | **tylko od admina** (doładowania, prezenty, zwroty). W grach nie da się ich zdobyć — piórka są „za granie”, Wypluffki „za hu-hu” |
| Na co | tylko wygląd (rozdz. 9) |
| Wymiana | brak w obie strony. W Butiku wisi tabliczka: „Kantor Sowiego Banku: Wypluffki → piórka — nieczynne. Piórka → Wypluffki — nieczynne. Sowa ma zasady.” |
| Liczby | całkowite, od 0 do 10 000 000; ceny rzeczy 149–2 499, pakiety 100–6 500 (Załącznik A) |
| Wyjaśnienie dla gracza | karta w „Jak grać?” → „Sowi Butik i Wypluffki”, prostym językiem: „Wypluffki są na niby. Dostajesz je od admina za hu-hu na kozę. Kupujesz za nie tylko wygląd — w grach nic nie ułatwiają.” |

---

## 5. Sowi Butik — jeden sklep, dwie waluty

### 5.1. Co się zmienia

Butik zostaje jedynym sklepem SowieGry (Twoja druga wiadomość). W Dziupli otwiera się z licznika Wypluffków,
z Wypluffkomatu, z ulotki na tablicy i z „Więcej → Sowi Butik”. Każda rzecz ma **dokładnie jedną walutę**: 🪶 piórka
albo Wypluffki.

| Co | Waluta | Uwagi |
| --- | --- | --- |
| 11 strojów, 6 gatunków sów, dłuższe kózki (dzisiejszy Butik) | 🪶 piórka | **bez zmian**: te same ceny, poziomy Akademii, dziennik zakupów i zapis; „dłuższe kózki” to jedyny „bonus” w Butiku i nigdy nie będzie za Wypluffki |
| ozdoby Dziupli „za piórka” (Analiza 7, rozdz. 6.4 — motywy, dywany, ramki) | 🪶 piórka | jak w Analizie 7 |
| skórki i kostiumy Sówki, ślady, głosy, tańce, ozdoby premium Dziupli, gałąź w Trójkach, skórki do Farmy | Wypluffki | nowe, tylko wygląd (rozdz. 9, Załącznik A) |
| rzeczy za granie (zdjęcia Galerii, ozdoby za cele, roślinki z gier na półce) | — | **nie są na sprzedaż** (rozdz. 10) |
| **miejsca 4 i 5 na półce z roślinkami** (Analiza 7, rozdz. 6.2) | za granie **albo** Wypluffki | jedyny wyjątek od „jednej waluty” — Twoja decyzja do Analizy 7 („można to połączyć”); to tylko miejsce na ozdobę, a roślinki na nie i tak trzeba wyhodować w grach |

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
- **Zakup za Wypluffki:** okno „Kupić Złotą skórkę za 1 499 Wypluffków? To tylko wygląd — w grach nic nie zmienia.”
  → „Kup” → krótkie „Przetwarzanie… hu-hu” (ok. 0,5 s, w tym czasie zapis w banku) → **paragon** („Sowi Bank —
  Paragon nr 0042 · Złota skórka ×1 · 1 499 ● · VAT (Wypluffkowa Akcyza Tymczasowa) 0 ● · Dziękujemy! Hu-hu!”)
  → „Załóż teraz” / „Później”. **Wymaga internetu**: bez zasięgu przyciski są szare z dopiskiem „Sowi Bank jest offline
  📶 — spróbuj, gdy wróci zasięg”.
- **Za mało Wypluffków:** „Brakuje Ci 120 Wypluffków. Może hu-hu na kozę?” → [Doładuj] [Nie teraz].
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

## 6. Gdzie w Sowiej Dziupli („pole” do Wypluffków)

Uzupełnienie [Analizy 7, rozdz. 4](ANALIZA_7_Sowia_Dziupla.md#4-ekran) — zmiany zaznaczone ◄:

```
┌──────────────────────────────┐
│ SowieGry   🪶 120  (● 1 250 [+])  ⚙ │ ◄ licznik Wypluffków z „+” (Doładuj)
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
| **Licznik Wypluffków na górnym pasku** — kulka, liczba i zielony „+” | stuknięcie licznika → Butik (zakładka „Sówka”); stuknięcie „+” → **Doładuj Wypluffki** | tak wygląda to w prawie każdej grze na telefon, więc parodia jest od razu rozpoznawalna; zawsze widoczne, a nie zasłania gry. „+” lekko pulsuje (parodia), a przy ograniczeniu ruchu albo wyłączonych „Efektach” stoi nieruchomo |
| **Wypluffkomat** — mały automat na kulki (jak na gumy do żucia), pełen Wypluffków, na podłodze obok szafy | stuknięcie → Butik; przy nowej ofercie dnia jedna kulka mruga | „pole” w samym pokoju, w stylu dziupli; na 320 px zmniejsza się do ok. 44 px |
| **Ulotka na tablicy korkowej** — karteczka „OFERTA DNIA” z rysunkiem rzeczy, przypięta **na końcu** tablicy, po kartach gier | stuknięcie → Butik z otwartą ofertą dnia | reklama „w świecie gry”, ale nigdy nad kartami gier |
| **Szafa, Dekorator** | rzeczy premium z ceną i „Kup” | kupowanie tam, gdzie się wybiera wygląd (rozdz. 5.3) |
| **„Więcej → Sowi Butik”** | pełny Butik | Analiza 7 już przewiduje tam Butik |
| **Powitanie Sówki** (dymek, najwyżej raz dziennie, wyłączane przez „Komentarze sowy”) | „Hu-hu! Wpłynęły Wypluffki!” albo „W Wypluffkomacie jest nowa oferta” | jak inne powitania z Analizy 7, rozdz. 7 |

**Telefon poziomo i tablet:** licznik zostaje na górnym pasku, a Wypluffkomat stoi w części „pokoju”.
**Wersja demo (`demo.html`):** bez Wypluffków i bez Dziupli — „Demo zawiera tylko demo gier” (Twoja decyzja
do Analizy 7, pytanie 6).
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
   → u gracza: „Sowi Bank: wpłynęło 550 Wypluffków! 🎉” + notka admina, licznik nabija się do nowej liczby
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
| **Garstka Wypluffków** | 100 | 1 × Hu-hu | — |
| **Kieszeń Wypluffków** | 550 (500 + 50 gratis) | 1 × Hu-hu (głośne) | NAJPOPULARNIEJSZE |
| **Worek Wypluffków** | 1 200 (+20% gratis) | 2 × Hu-hu | — |
| **Skrzynia Wypluffków** | 2 600 (+30% gratis) | 3 × Hu-hu i groźne spojrzenie | NAJLEPSZA OFERTA |
| **Humbaczy Ładunek** | 6 500 | Hu-hu w duecie z humbakiem | DLA WIELORYBÓW 🐋 |

Kwota w pakiecie to **prośba**, a ostatnie słowo ma admin: może zatwierdzić, dać inną kwotę albo odrzucić
(„Sowi Bank odrzucił transakcję: koza się nie przestraszyła”). Lista pakietów i kwot jest w jednym pliku
(`shared/meta/wypluffki.js`), więc łatwo ją zmienić.

**„Darmowe Wypluffki! (obejrzyj reklamę)”** — parodia reklam z nagrodą: 5-sekundowa „reklama” Koziego Sera od kozy
Klementyny (postać z Sowiej Farmy), przycisk „Pomiń” pojawia się po 5 sekundach, a na koniec: „Gratulacje! Otrzymujesz
0 Wypluffków. U nas reklamy nic nie dają — i tak powinno być.” Pojawia się tylko po stuknięciu, nigdy sama.

### 7.3. Krok 2 — metoda płatności

```
Wybierz metodę płatności
 ◉ Hu-hu na kozę            (polecane przez 10 na 10 sów)
 ○ Karta kredytowa          — Banki nie akceptują wypluffków (wyszarzone)
 ○ BLIK                     — Banki nie akceptują wypluffków (wyszarzone)
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
│ Pakiet:   Kieszeń Wypluffków   │
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
- **„Udostępnij obrazek”** (Twoja zgoda — pytanie 5): ten sam obrazek jako plik PNG przez systemowe „Udostępnij”
  (Messenger, WhatsApp…). Gdy telefon tego nie obsługuje, przycisk „Zapisz obrazek”. Zrzut ekranu dalej jest
  podstawowym sposobem (Twój pomysł).
- **Kolejka:** najwyżej **3 hu-hu czekające naraz**. Czwarte: „Sowi Bank przetwarza Twoje poprzednie hu-hu. Koza musi
  odpocząć.” To chroni Twoją listę przed zalewem próśb.
- **Bez internetu:** obrazek i kod pokazują się normalnie, a prośba zapisze się sama, gdy wróci zasięg (status
  „zapisze się po powrocie internetu”). Admin może też doładować ręcznie, tylko na podstawie zrzutu.

### 7.6. Po zatwierdzeniu

- Gra nasłuchuje zmian w portfelu (rozdz. 12). Gdy admin doładuje, w Dziupli pojawia się okienko **„Sowi Bank: wpłynęło
  550 Wypluffków! 🎉”** z notką admina („Za piękne hu-hu!”). Wypluffki „sypią się” do licznika, który nabija się do
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
- **Logowanie (Twoja decyzja 2026-11-24): hasło „KoziAdmin” zaszyte w kodzie**, bez e-maili i bez kont Firebase.
  Ekran „Hasło admina” wygląda jak „Hasło sowy” w grach: pole hasła, „oko” do podglądu, „Wejdź”. Wielkość liter nie
  ma znaczenia („koziadmin” też zadziała), bo klawiatura telefonu sama robi wielką literę na początku. Hasło leży
  w `shared/sowie-cloud.js` obok hasła gracza „huhu” (stała `HASLO_ADMINA`).
- **Zapamiętanie:** po pierwszym wpisaniu telefon pamięta panel (wpis urządzenia w SowieCloud, jak hasło gracza),
  a „Wyloguj” go zapomina. Panel nie pyta o hasło gracza.
- **Bez zaawansowanych zabezpieczeń** (Twoja decyzja z 2026-11-24): SowieGry mają jednego gracza i jednego admina,
  więc hasło w kodzie wystarczy — tak samo jak „huhu” dla gracza.
- Panel korzysta z SowieCloud (tego samego połączenia z bazą co gry), więc SowieCloud zostaje jedynym modułem, który
  rozmawia z Firestore.

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
| **Doładuj ręcznie** | szybkie przyciski i własna kwota, notka widoczna u gracza, okno potwierdzenia („Doładować 500 Wypluffków?”) |
| **Korekta** | odjęcie Wypluffków (np. pomyłka); saldo nie spadnie poniżej zera |
| **Zwrot** | gracz kupił coś przez pomyłkę → admin oddaje Wypluffki i zabiera rzecz (z notką „Zwrot: …”) |
| **Ogłoszenie i promocja** | tekst na górze Butiku i promocja procentowa na rzeczy premium do wybranego dnia — możesz się pobawić w „firmę od gier” |
| **Historia** | ostatnie 30 operacji: data, zmiana, kod, notka |
| **Pierwsze wejście** | gdy portfela jeszcze nie ma: przycisk „Załóż portfel gracza” (opcjonalnie z prezentem powitalnym, np. 500 z notką „Witamy w Sowim Banku!”) |

- Każda operacja admina to **jedna transakcja** w bazie: saldo, wpis w historii, status prośby i powiadomienie dla
  gracza zapisują się razem albo wcale.
- Ten sam styl co SowieGry (czcionka Fredoka, tokeny kolorów), jasny i ciemny, duże przyciski, polski.
- Panel ma też własną instrukcję: `Admin/docs/README.md` (co zrobić po dostaniu zrzutu) i `Admin/docs/Documentation.md`
  (opis kodu).

### 8.3. Później: kopia zapasowa i przywracanie z pliku (Twoja prośba z 2026-11-24)

Na przyszłość, jako osobny etap **W10** (po Dziupli i Wypluffkach, na Twoje polecenie):

- **„Pobierz kopię zapasową”**: panel czyta wszystkie dane SowieGry z Firestore i zapisuje je w jednym pliku na
  telefonie albo komputerze (np. `sowiegry-kopia-2026-12-01.json`). W pliku są `sowiegry/meta`, profil, dokumenty
  wszystkich gier z historią gier oraz portfel Wypluffków z prośbami i historią. Wartości zapisują się 1:1, także
  znaczniki czasu — tym samym sposobem co skrypt przeniesienia bazy `scripts/kopia-firestore.mjs` (2026-11-23: 49 / 49
  dokumentów zgodnych). Przed pobraniem panel pokazuje podsumowanie: data, liczba dokumentów, saldo, poziom Akademii.
- **„Przywróć z pliku”**:
  1. wybór pliku;
  2. panel sprawdza, czy to kopia SowieGry i czy jest cała;
  3. panel pokazuje, co się zmieni („kopia z 1.12, 412 dokumentów, saldo 1 250”);
  4. okno „Przywrócić? Obecne dane zostaną zastąpione”;
  5. **najpierw panel sam pobiera kopię obecnego stanu**, więc nic nie ginie nawet przy pomyłce;
  6. zapis danych z pliku. Dokumenty, których nie ma w kopii (np. nowsze wpisy historii), są usuwane, żeby stan był
     dokładnie taki jak w pliku.
- **Otwarta gra na telefonie gracza** mogłaby po przywróceniu nadpisać dane tym, co ma w pamięci. Dlatego
  przywrócenie zostawia znacznik w `sowiegry/meta`, a SowieCloud po jego zobaczeniu wczytuje dane od nowa. Panel
  dodatkowo radzi: „Najlepiej, gdy gra na telefonie gracza jest zamknięta”.
- **Bez nowych kosztów i uprawnień:** kopia to kilkaset odczytów, a przywrócenie kilkaset zapisów — daleko od
  darmowych limitów. Reguły z Załącznika B już na to pozwalają: wpisy Wypluffków i historię gier można kasować
  i tworzyć, a profil i `meta` są nadpisywane, nie kasowane.
- **Testy:** kopia → przywrócenie na emulatorze daje dane identyczne 1:1; plik uszkodzony albo obcy jest odrzucany;
  kopia obecnego stanu powstaje przed przywróceniem.

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
| **Sowia Farma** (dopiero po wdrożeniu Farmy — Twoja decyzja, bez przedsprzedaży) | Konewka-czajniczek, **Konewka-humbak**, Złota motyka-łopatka, Sierp-księżyc, Strach-Sowa Pirat, Strach-robot, gałąź do spania ze złotymi liśćmi, dom z dachem-grzybkiem, Kózka-maskotka (tylko spaceruje i meczy) | Sowia Farma | skórka zmienia wygląd narzędzia, **nie** jego działanie; poziom narzędzia (zwykłe → tęczowe) pokazuje kolorowy pasek na trzonku, więc informacja z gry nie ginie (Analiza 8, rozdz. 13.1). **Wyjątek — nawozy jakości** (rozdz. 10) |

**Program VIP „Sowi Klub”** (parodia „wielorybów”; Twoja zgoda — pytanie 6) — poziom wynika z łącznie **wydanych** Wypluffków:

| Poziom | Wydano | Co daje (tylko wygląd) |
| --- | --- | --- |
| 🐟 Płotka | 0+ | naklejka „Płotka” przy liczniku |
| 🐠 Śledź | 1 000+ | srebrna ramka licznika Wypluffków |
| 🐬 Delfin | 5 000+ | złota ramka licznika i odznaka w Butiku |
| 🐋 **Humbak** | 15 000+ | tytuł **„Sowi Wieloryb”**, złoty „+”, zabawka **Pluszowy Humbak VIP** w Dziupli |

**Sowie jajko-niespodzianka** (parodia „skrzynek z łupem”; Twoja zgoda — pytanie 4) — 399 Wypluffków, losowa rzecz premium, której
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
| Dziupaki (waluta Farmy), nasiona, plony, pogoda, szybszy wzrost, ochrona przed szkodnikami, większy plecak, kózka-pomocnica zbierająca plony w Sowiej Farmie | ułatwienia |
| zadania i osiągnięcia Akademii za wydawanie Wypluffków | dawałyby piórka (pośrednia wymiana) |
| wymiana Wypluffków na piórka i odwrotnie | jak wyżej („Kantor: nieczynne”) |

**Dwa wyjątki — Twoje decyzje z 2026-11-24:**

1. **Miejsca 4 i 5 na półce Dziupli** — za granie albo za Wypluffki (rozdz. 5.1). To miejsce na ozdobę, a nie
   ułatwienie w grze.
2. **Wypluffkowy nawóz jakości w Sowiej Farmie** („nawozów (kupowanych w sklepie kozy oraz za mikropłatności), które
   zwiększają szansę na lepsze plony” — Analiza 8, rozdz. 8.7). Żeby nie było „płać, żeby wygrać”: działa **dokładnie
   jak Złoty nawóz** z Koziego Sklepiku (ta sama szansa na lepszy plon), nie przyspiesza wzrostu, nie daje piórek, XP
   ani punktów Akademii. Różni się tylko wyglądem (puchate iskierki) i tym, że kupuje się go w paczce po 10.
   Pojawi się dopiero po wdrożeniu Farmy (W8).

**Test automatyczny pilnuje tego katalogu:** każda rzecz za Wypluffki należy do kategorii „wygląd” albo do listy dwóch
wyjątków (lista dozwolonych rodzajów) i nie ma żadnego pola, które gry czytają jako działanie (mnożnik, czas, liczba, zasięg).

---

## 11. Parodia — żarty i granice

### 11.1. Lista żartów (wszystkie prawdziwe triki gier na telefon, tylko odwrócone)

| Trik z gier na telefon | U nas |
| --- | --- |
| waluta premium z błyszczącą ikonką | Wypluffki — puchata wypluwka |
| zielony „+” przy diamentach | jest — i lekko pulsuje |
| pakiety z „gratisem” i naklejkami | „NAJPOPULARNIEJSZE”, „NAJLEPSZA OFERTA”, „DLA WIELORYBÓW 🐋” |
| ceny kończące się na 99 | 299, 499, 999 Wypluffków |
| „tylko raz!” | Pakiet Startowy — naprawdę tylko raz |
| odliczanie „oferta kończy się za…” | kończy się o północy… i zawsze jest „przedłużona” |
| skreślona „stara cena” | ~~3 × Hu-hu~~ 1 × Hu-hu |
| reklama za nagrodę | nagroda: 0 Wypluffków i szczera satysfakcja |
| „skrzynki z łupem” | sowie jajko-niespodzianka — uczciwe szanse i bez powtórek |
| status VIP / „wieloryby” | Sowi Klub: Płotka → Śledź → Delfin → **Humbak** |
| metody płatności | Hu-hu na kozę; karta i BLIK wyszarzone („Banki nie akceptują wypluffków”) |
| „przetwarzanie płatności” | „Weryfikacja kozy…” |
| paragon i podatek | „VAT (Wypluffkowa Akcyza Tymczasowa): 0 ●” |
| regulamin drobnym drukiem | „Regulamin Sowiego Banku: §1 Wypluffki nie są prawdziwe i nic nie kosztują. §2 Koza nie zgłasza roszczeń. §3 Admin ma zawsze rację.” |
| kantor walut premium | „Nieczynne. Sowa ma zasady.” |
| rzadkość przedmiotów | Rzadki, Epicki, Legendarny i **Mityczny Puch** |

### 11.2. Granice: „Parodia, ale bez natręctwa” (zasada potwierdzona 2026-11-24)

Twoje słowa: „Bardzo też podoba mi się Twój kierunek "Parodia, ale bez natręctwa". Trzymajmy się tego.” Każda
nowa rzecz w Butiku i na ekranie doładowania przechodzi przez tę listę:

- **Żadnych okienek** w trakcie gry, przy jej starcie ani przy wyjściu. W grach Wypluffków w ogóle nie widać,
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
  saldo: 1250,                 // liczba całkowita ≥ 0 (reguły); = doladowano − wydano (aplikacja)
  doladowano: 3000,            // suma doładowań minus korekty (panel admina)
  wydano: 1750,                // suma wydatków minus zwroty (od niej zależy VIP)
  kupione: {                   // dziennik zakupów za Wypluffki — mapa, zapisywana klucz po kluczu (lekcja G3)
    "skorka:zlota":    { at: <czas serwera>, cena: 1499 },
    "stroj:pirat":     { at: <czas serwera>, cena: 319 },   // kupione w ofercie dnia
    "stroj:nowicjusz": { at: <czas serwera>, cena: 0 },     // z Pakietu Startowego (dopisał admin)
  },
  ostatnieDoladowanie: { kwota: 550, notka: "Za piękne hu-hu!", kod: "HU-7F3K-2Q", at: <czas serwera> },
  ogloszenie: "Black Friday w Sowim Banku!",                 // tekst na górze Butiku (panel admina)
  promocja: { procent: 30, do: <data> },                     // rabat na premium (panel admina), może nie być
  zmieniono: <czas serwera>,
}
```

### 12.2. Podkolekcje

| Ścieżka | Kto pisze | Pola | Do czego |
| --- | --- | --- | --- |
| `sowiegry_wypluffki/portfel/wypluffki_prosby/{kod}` | gra (tworzy), admin (załatwia) | `kod`, `pakiet`, `kwota`, `status` („czeka” → „zatwierdzone” / „odrzucone”), `at`; po załatwieniu admin dopisuje `kwotaPrzyznana`, `notka`, `zalatwiono` | „Hu-hu w kolejce” w grze i w panelu |
| `sowiegry_wypluffki/portfel/wypluffki_historia/{wpis}` | gra (zakupy) i panel admina | `zmiana` (+/−), `saldoPo`, `rodzaj` (`doladowanie`, `korekta`, `zwrot`, `zakup`), `kod`, `notka`, `at` | wyciąg z konta, historia w panelu |

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
| **Zakup za Wypluffki** | **transakcja** Firestore: odczyt portfela → sprawdzenie (saldo, czy już kupione) → zapis: saldo − cena, wydano + cena, nowy wpis w `kupione` i wpis „zakup” w historii. Potem wybór w profilu (po 0,3 s, jak w Butiku). Dwa telefony naraz nie kupią „za te same” Wypluffki |
| **Bez internetu** | zakupy za Wypluffki wyłączone z komunikatem; zakupy za piórka działają jak dziś; licznik pokazuje ostatnie znane saldo z pamięci telefonu (SDK Firestore) |
| **Prośba o doładowanie** | zwykły zapis nowego dokumentu (bez internetu czeka w kolejce SDK i wysyła się sam) |
| **Admin** | transakcja: portfel + wpis w historii + status prośby + `ostatnieDoladowanie` |
| **Kopia zapasowa** | `scripts/kopia-firestore.mjs` obejmie też portfel i obie podkolekcje |
| **Testy** | tylko emulator Firestore oraz pamięć (`?cloud=memory` ma udawany portfel z hakiem „doładuj” do testów); produkcyjnej bazy testy nie dotykają |
| **Koszt** | kilka odczytów i zapisów dziennie — daleko od darmowych limitów (50 000 odczytów i 20 000 zapisów dziennie) |

---

## 13. Reguły Firestore — co pilnują (prostym językiem)

Pełna treść do skopiowania: [Załącznik B](#załącznik-b-reguły-firestore--do-opublikowania-w-etapie-w2). Obecne
reguły profilu i gier zostają **słowo w słowo** — reguły tylko się rozszerzają.

SowieGry mają jednego gracza i jednego admina, więc **bez zaawansowanych zabezpieczeń** (Twoja decyzja z 2026-11-24).
Reguły Wypluffków są tak samo proste jak reguły profilu i gier — sprawdzają tylko, czy dane mają sens:

1. **Portfel** każdy może przeczytać i zapisać, jeśli saldo to liczba całkowita nie mniejsza od zera. Portfela nie da
   się skasować.
2. **Prośby o doładowanie** i **historia** — odczyt, zapis i kasowanie, jeśli kwota (zmiana) to liczba całkowita.
   Kasowanie jest potrzebne do przywracania kopii zapasowej (rozdz. 8.3).
3. Wszystko inne jest zamknięte (jak dziś).

Resztą zajmuje się aplikacja:
- saldo = doładowano − wydano;
- prośbę zatwierdza się tylko raz — panel sprawdza jej status w tej samej transakcji, więc podwójne stuknięcie nie
  doładuje konta dwa razy;
- ceny biorą się z katalogu;
- czekające mogą być najwyżej 3 prośby.

---

## 14. Technika

### 14.1. Nowe pliki

| Plik | Za co odpowiada |
| --- | --- |
| `shared/meta/wypluffki.js` | katalog rzeczy premium (id, rodzaj, miejsce, cena, rzadkość, grafika, opis), pakiety, VIP, oferta dnia (z ziarnem daty — `createRng`), jajko-niespodzianka, generator kodów `HU-XXXX-XX`, normalizacja portfela, `premiumOffer`, `buyPremium`, `requestTopUp`, sprawdzanie katalogu (tylko wygląd) |
| `shared/dziupla/butik.js`, `butik.css` | ekran Sowiego Butiku (dwie waluty, zakładki, oferta dnia, paragon, wyciąg, regulamin, kantor, VIP) — wspólny dla Szafy i Dekoratora |
| `shared/dziupla/doladuj.js` | pakiety, metoda płatności, „Przetwarzanie…”, obrazek hu-hu na kozę (płótno z atlasu + dane wpłaty), „Udostępnij”, „reklama” |
| `shared/dziupla/bank.js` | licznik Wypluffków na górnym pasku, Wypluffkomat, ulotka na tablicy, okienko „wpłynęło…” |
| `shared/world/skins.js` | skórki Sówki (palety + warstwy wzorów) łączone z gatunkami w jednym `setTransform` |
| `Admin/index.html`, `Admin/admin.js`, `Admin/admin.css` | panel admina: ekran „Hasło admina” i widoki (saldo, kolejka hu-hu, doładowanie, zwroty, historia; później kopia zapasowa i przywracanie — rozdz. 8.3); dane wyłącznie przez SowieCloud (`SowieCloud.bank`), bez Firebase Authentication |
| `Admin/docs/README.md`, `Admin/docs/Documentation.md` | instrukcja dla admina i opis kodu (zasady z `AGENTS.md`) |
| `assets/svg/wypluffki/` | ikonka Wypluffki (zwykła i radosna), Wypluffkomat, ulotka, jajko, naklejki |
| `assets/svg/garderoba/` (nowe) | kostiumy premium |
| `assets/svg/dziupla/premium/` | ozdoby premium Dziupli |
| `assets/svg/sowa/dziob-otwarty.svg`, `assets/svg/kozki/` (dodatki) | poza „hu-hu” i przestraszona koza |
| `assets/audio/sfx/` | „mee”, „hu-ching” (dźwięk kasy w wersji sowiej), głosy Sówki |

### 14.2. Zmiany w istniejących plikach

| Plik | Zmiana |
| --- | --- |
| `shared/sowie-cloud.js` | API portfela: `wallet()`, `onWallet(fn)`, `buyPremium(id, cena)` (transakcja), `requestTopUp(pakiet)`, `topUpRequests()`, `walletHistory()`; operacje panelu w `bank` (`unlockAdmin(haslo)`, `topUp`, `correct`, `refund`, `resolve`, `announce`) i stała `HASLO_ADMINA = "koziadmin"` (porównanie po `trim` i małych literach, jak „huhu”); transakcje w `FirestoreBackend` (`runTransaction`) i `MemoryBackend`; ścieżki `sowiegry_wypluffki/…`; `normalizeProfile` przepuszcza kostiumy premium. SowieCloud zostaje **jedynym** modułem gry, który rozmawia z Firestore |
| `shared/meta/shop.js` | `shopOffer` z dwiema walutami; `buy(id)` kieruje zakup do piórek (jak dziś) albo do Wypluffków; `shop.wyglad` |
| `shared/sowie-platform.js` | kostiumy premium w `COSMETICS` (z `premium: true`) |
| `shared/world/owl.js`, `species.js` | poza `huhu`; skórki obok gatunków |
| gry zręcznościowe, Sowie Trójki | ślad, głos, gałąź i ramka (miejsca opisane w dokumentacji każdej gry) |
| `shared/meta/guides-data.js` | „Jak grać?” → „Sowi Butik i Wypluffki” |
| `firestore.rules` | reguły (Załącznik B); `firebase.json` bez zmian |
| `package.json`, `eslint.config.js`, `scripts/check-syntax.sh` | `Admin/` w formatowaniu, lincie i sprawdzaniu HTML |
| `tests/unit/architecture.test.mjs` | bez wyjątków: `Admin/admin.js` używa tylko SowieCloud (test pilnuje, że nie woła Firestore ani pamięci przeglądarki bezpośrednio); strona `Admin/` nie ładuje gier ani ekranu „Hasło sowy” |
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
  kupione, sukces, bez internetu, dwa zakupy naraz (jeden przechodzi); operacje panelu (doładowanie, korekta, zwrot, zatwierdzenie prośby — tylko raz,
  także przy podwójnym stuknięciu) zachowują saldo = doładowano − wydano.
- **Profil:** kostium premium przechodzi normalizację, `shop.wyglad`, ≤ 30 pól, zwrócona rzecz → wygląd domyślny.
- **Butik za piórka:** wszystkie dotychczasowe testy (także G3) bez zmian i zielone.

### 15.2. Reguły (emulator, `@firebase/rules-unit-testing`)

- **Portfel:** odczyt i poprawny zapis bez logowania; saldo ujemne, ułamek albo tekst, brak `schemaVersion` →
  odrzucone; skasowanie portfela → odrzucone.
- **Prośby i historia:** zapis z całkowitą kwotą (zmianą) przechodzi, bez niej → odrzucony; kasowanie przechodzi
  (przywracanie kopii).
- Dotychczasowe testy reguł (profil, gry, historia gier, zamknięte kolekcje) bez zmian.

### 15.3. W przeglądarce (Playwright, profile telefonów, Chromium + WebKit w GitHubie)

1. Dziupla: licznik Wypluffków, Wypluffkomat i ulotka są widoczne i nic się nie nakłada (320 × 568, poziomo).
2. Butik: zakup za piórka jak dziś; zakup za Wypluffki (portfel z emulatora) → paragon → „Załóż teraz” → Sówka w nowym
   wyglądzie w Dziupli i w grze.
3. Za mało Wypluffków → „Doładuj”; bez internetu → przyciski premium wyłączone.
4. Doładuj: pakiet → metoda → przetwarzanie → **obrazek mieści się w ekranie** na każdym profilu telefonu (kod,
   kwota i data widoczne bez przewijania) → prośba w bazie; czwarta prośba → komunikat o kolejce.
5. Panel admina (hasło „KoziAdmin”, także „koziadmin”; złe hasło → „To nie to hasło”): wejście → prośba na liście → „Zatwierdź” → u gracza w drugiej karcie
   okienko „wpłynęło…” i nowe saldo (nasłuch na żywo).
6. Zwrot w panelu → rzecz znika z Szafy, Wypluffki wracają.
7. Szafa i Dekorator: zakładki premium, zakup na miejscu.
8. Ograniczenie ruchu: bez pulsowania „+” i bez animacji obrazka.
9. Gry: start każdej gry bez portfela (np. zablokowany odczyt) działa normalnie.

### 15.4. Na telefonie (dla Ciebie — dopiszę do `TESTY_NA_TELEFONIE.md`)

| Test | Co sprawdzasz |
| --- | --- |
| SB1 | panel admina na Twoim telefonie: hasło „KoziAdmin”, „Załóż portfel gracza” z prezentem powitalnym, doładowanie z notką |
| SB2 | u gracza: licznik w Dziupli, okienko „wpłynęło…” z notką |
| SB3 | „Doładuj Wypluffki”: pakiet → hu-hu na kozę → czy obrazek jest zabawny i cały mieści się na zrzucie; wysłanie zrzutu |
| SB4 | panel: hu-hu z kodem ze zrzutu na liście → „Zatwierdź” → u gracza świętowanie |
| SB5 | Butik: zakup za piórka i za Wypluffki, „za mało”, oferta dnia, wyciąg, regulamin |
| SB6 | skórka, kostium i ślad widać w Dziupli i w grach; głos i taniec po stuknięciu Sówki |
| SB7 | zwrot w panelu; dwa telefony (saldo się zgadza) |

---

## 16. Ryzyka

| Ryzyko | Skutek | Jak zapobiegamy |
| --- | --- | --- |
| Błąd w regułach | gracz nie może kupić albo admin doładować | testy reguł na emulatorze przed publikacją; test SB1 zaraz po publikacji |
| Gracz pomyśli, że to prawdziwe płatności | niepokój, zwłaszcza u dziecka | nigdzie „zł” ani kart; cena to „× Hu-hu”; regulamin i dopisek „Wypluffki nie są prawdziwe”; karta w „Jak grać?” |
| Parodia męczy | psuje przytulny klimat | żadnych okienek w grach, jedna ulotka, komentarze Sówki raz dziennie i wyłączane (rozdz. 11.2) |
| Popsucie obecnego Butiku | powrót uwagi G3 | zakupy za piórka bez zmian w logice i zapisie; testy G3 zostają |
| Hasło panelu jest w kodzie strony | teoretycznie ktoś mógłby zmienić saldo | jeden gracz i jeden admin — Twoja decyzja: bez zaawansowanych zabezpieczeń |
| Przywrócenie złego pliku (W10) | utrata nowszego postępu | podgląd zawartości, potwierdzenie, automatyczna kopia obecnego stanu przed przywróceniem |
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
| **W0** | decyzje (rozdz. 19) — ✅ 2026-11-24 | S |
| **W1** | logika: katalog, pakiety, VIP, oferta dnia, kod, portfel w SowieCloud (odczyt, nasłuch, transakcja, prośby), `MemoryBackend`, reguły + testy reguł, testy jednostkowe | M (2–3 dni) |
| **W2** | **panel admina** `Admin/` (logowanie, saldo, kolejka hu-hu, doładowanie, korekta, zwrot, historia, ogłoszenie i promocja), dokumentacja panelu → **publikacja reguł przez Ciebie** i test SB1 | M (2 dni) |
| **W3** | „Doładuj Wypluffki”: pakiety, metoda płatności, przetwarzanie, **obrazek hu-hu na kozę** (poza „hu-hu”, koza, warianty pakietów), kolejka, okienko „wpłynęło…” (najpierw obrazek do Twojej akceptacji) | M (2 dni) |
| **W4** | wspólny Sowi Butik (dwie waluty, zakładki, oferta dnia, paragon, wyciąg, regulamin, kantor, VIP) + premium w Szafie i Dekoratorze; licznik, Wypluffkomat, ulotka | M–L (2–3 dni) |
| **W5** | grafiki premium: ikonka, Wypluffkomat, skórki (palety + wzory), kostiumy, ozdoby Dziupli, gałąź i ramka w Trójkach (najpierw obrazek do akceptacji) | L (3 dni) |
| **W6** | wygląd w grach: skórki i kostiumy (atlas), ślady (Ucieczka, Tory, Chmury, iskierki w Trójkach), głosy, tańce | M (1–2 dni) |
| **W7** | „na deser”: jajko-niespodzianka, „reklama” za 0 Wypluffków, Mityczny Puch | S (1 dzień) |
| **W8** | Sowia Farma: skórki narzędzi, strachów i domu, Kózka-maskotka, Wypluffkowy nawóz jakości — **dopiero po wdrożeniu Farmy** (Twoja decyzja; Analiza 8, etap F9) | S–M (1–2 dni, w budżecie Farmy) |
| **W9** | dokumentacja (`docs/`, `Admin/docs/`, dokumentacja gier), `TESTY_NA_TELEFONIE.md` (SB1–SB7), `UWAGI_WLASCICIELA.md`, `STAN_PRAC.md` — na bieżąco w każdym etapie, zamknięcie na końcu | S |
| **W10** | *w przyszłości, na Twoje polecenie:* kopia zapasowa danych z Firestore do pliku i przywracanie z pliku w panelu admina (rozdz. 8.3) | M (1–2 dni) |

**Razem ok. 13–16 dni pracy** (bez W8 i W10).

### 17.2. Kolejność razem z Sowią Dziuplą (Analiza 7, rozdz. 15)

```
T0        testy w GitHubie w dwóch równoległych częściach (Analiza 8, decyzja 16) — przed budową
D0 + W0   decyzje do obu analiz ✅ 2026-11-24
D1 + W1   katalog Dziupli i katalog premium, stan, portfel, reguły (testy na emulatorze)
W2        panel admina → Ty publikujesz reguły → test SB1 (możesz już doładować pierwsze Wypluffki)
D2        scena Dziupli z górnym paskiem (licznik Wypluffków), tablica, Sówka — podgląd
W3        „Doładuj Wypluffki” i obrazek hu-hu na kozę
D3 + W4   Szafa z zakładkami premium; wspólny Sowi Butik
D4 + W4   Dekorator z kategorią „Premium ✨”
D5 + W5   grafiki Dziupli i premium — jeden obrazek do akceptacji
W6        wygląd premium w grach
D6 + W7   „Więcej”, adresy, powitania Sówki; jajko i „reklama”
D7 + W9   przełączenie ekranu startowego po Twojej zgodzie (stare menu usuwamy — bez „Prostego widoku”), testy, dokumentacja
— później: Sowia Farma (Analiza 8), a po jej wdrożeniu W8
— w przyszłości: W10 (kopia zapasowa i przywracanie z pliku w panelu)
```

Dziupla (10–14 dni) i Wypluffki (13–16 dni) razem to ok. **23–30 dni pracy, czyli 5–6 tygodni**, bo część pracy jest
wspólna (Szafa, Dekorator, górny pasek). Podgląd Dziupli z Wypluffkami da się sprawdzać już po W3. Reguły i panel
admina działają wcześniej, więc pierwsze doładowanie możesz zrobić, zanim gracz zobaczy sklep.

**Start: na Twoje polecenie** („Pracę nad wdrożeniem sklepu i butiku zaczniemy potem. Czekaj na moje polecenie.”).
Kolejność według Twojej decyzji: „Proponuję zacząć od wdrożenia mikropłatności i dziupli. Farmę dodamy później.” Wspólny stan prac i kolejność: [`STAN_PRAC.md`, punkt 0.8](STAN_PRAC.md).

---

## 18. Twoje czynności krok po kroku

Bez konsoli Authentication i bez zakładania kont (decyzja: hasło w kodzie). Wszystko **w etapie W2** — napiszę,
kiedy:

1. **Opublikuj reguły** z [Załącznika B](#załącznik-b-reguły-firestore--do-opublikowania-w-etapie-w2): konsola
   Firebase → projekt `sowiegry-1e1f9` → **Firestore Database** → **Reguły** → wklej całość → **Opublikuj**. Zmiana
   tylko **dopisuje** portfel, więc gry i obecne zapisy działają bez przerwy.
2. Wejdź na **https://cutelittlegoat.github.io/SowieGry/Admin/**, wpisz **KoziAdmin**, stuknij **„Załóż portfel
   gracza”** (z prezentem powitalnym, np. 500 Wypluffków i notką „Witamy w Sowim Banku!” — decyzja 8) i zrób test SB1.
3. **Kolekcji, dokumentu i pól nie musisz zakładać ręcznie**, bo zrobi to przycisk z kroku 2. Jeśli wolisz sam (przed
   krokiem 2): Firestore Database → „Rozpocznij kolekcję” → identyfikator `sowiegry_wypluffki` → dokument
   o identyfikatorze `portfel` z polami: `schemaVersion` (number) = 1, `saldo` (number) = 0, `doladowano`
   (number) = 0, `wydano` (number) = 0, `kupione` (map) — pusta. Wtedy prezent powitalny dasz zwykłym „Doładuj”.

---

## 19. Pytania i decyzje właściciela

Odpowiedzi z 2026-11-24 (dosłownie w [`UWAGI_WLASCICIELA.md`](UWAGI_WLASCICIELA.md), tabela „2026-11-24”). **Pytań
otwartych nie ma.**

| # | Pytanie (skrót) | Moja rada | Decyzja |
| --- | --- | --- | --- |
| 1 | Logowanie do panelu admina | e-mail i hasło (Firebase) | **hasło zaszyte w kodzie: „KoziAdmin”, bez maili** (rozdz. 8.1, 13, 18, Załącznik B) |
| 2 | „Hu-hu w kolejce” w panelu | tak | według rady |
| 3 | Pakiety 100–6 500, rzeczy 149–2 499 | tak | według rady (Załącznik A) |
| 4 | Jajko-niespodzianka | tak, w W7 | **tak** — „Bardzo dobry pomysł” |
| 5 | „Udostępnij obrazek” | tak | **tak** |
| 6 | Program VIP (Płotka → Humbak) | tak | **tak** — „Bardzo dobry pomysł” |
| 7 | Rzeczy do Sowiej Farmy przed premierą | dopiero z Farmą | **dopiero po wdrożeniu Farmy** — bez przedsprzedaży (W8) |
| 8 | Portfel od 0 + prezent powitalny | tak | według rady (rozdz. 18) |
| 9 | Nazwy i pomysły | — | „Zdaję się na Ciebie” — nazwy jak w analizie, katalog z Załącznika A |

**Inne Twoje decyzje z 2026-11-24, które zmieniają tę analizę:**

- karta i BLIK zostają wyszarzone, z napisem **„Banki nie akceptują wypluffków”** (rozdz. 7.3);
- **„Parodia, ale bez natręctwa”** to stała zasada (rozdz. 3 i 11.2);
- Analiza 7, pytanie 3 — **miejsca 4 i 5 na półce Dziupli** za granie albo za Wypluffki (rozdz. 5.1, 10, Załącznik A.2);
- Analiza 7, pytanie 6 — demo zawiera tylko demo gier, bez Dziupli i Wypluffków (rozdz. 6);
- Analiza 8, pytanie 2 — waluta Farmy to **Dziupaki** (rozdz. 10);
- Analiza 8, pytanie 9 — **nawozy jakości** w Farmie także za Wypluffki (wyjątek w rozdz. 10, W8);
- **kolejność:** najpierw Dziupla i Wypluffki, Farma później (rozdz. 17);
- **bez zaawansowanych zabezpieczeń** — jeden gracz i jeden admin (rozdz. 8.1, 13, Załącznik B);
- **w przyszłości:** kopia zapasowa danych z Firestore i przywracanie z pliku w panelu admina (rozdz. 8.3, W10);
- **start budowy na Twoje polecenie** („Czekaj na moje polecenie”).

---

## Załącznik A. Katalog pierwszej wersji

Ceny w Wypluffkach (●). Rzadkość: R — Rzadki, E — Epicki, L — Legendarny, M — Mityczny Puch. Identyfikatory tylko
dopisujemy (nic nie ginie). Ceny według rady (decyzja 3); po pierwszych tygodniach łatwo je zmienić w jednym pliku.

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
| Półka z roślinkami | **4. miejsce na półce** (albo za granie: 5. poziom Sowiej Akademii) | 499 | R |
| Półka z roślinkami | **5. miejsce na półce** (albo za granie: rozdział 14 Sowich Ogrodów) | 799 | E |
| Półka z roślinkami | Złote doniczki (wszystkie miejsca) | 499 | E |
| Tablica z grami | Złote pinezki | 199 | R |
| Tablica z grami | ramka Neonowa | 399 | E |
| Szafa | Szafa-sejf | 599 | E |
| Szafa | Szafa gwiazdy (lustro z żarówkami) | 699 | E |
| Miejsce Sówki | Fotel gamingowy | 799 | E |
| Miejsce Sówki | **Złoty tron** | 999 | L |
| Dywan | Dywan z Wypluffków | 399 | R |
| Dywan | Czerwony dywan VIP | 499 | E |
| Zabawka | Pluszowa Wypluffka | 199 | R |
| Zabawka | Złota koza (statuetka) | 899 | L |
| Zabawka | Pluszowy Humbak VIP | tylko VIP „Humbak” | L |

### A.3. Gry (rzeczy do Sowiej Farmy — dopiero po jej wdrożeniu)

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
| Sowia Farma (W8) | Wypluffkowy nawóz jakości ×10 (działa jak Złoty nawóz z Koziego Sklepiku — wyjątek, rozdz. 10) | 199 | R |

### A.4. Wypluffki

| Rzecz | Cena / zasada |
| --- | --- |
| Pakiety | rozdz. 7.2 |
| Oferta dnia | −20% na jedną rzecz dziennie (rozdz. 5.2) |
| Promocja admina | −X% na wszystkie rzeczy premium do wybranego dnia (panel) |
| Sowie jajko-niespodzianka | 399 (rozdz. 9) |
| „Reklama” | 0 Wypluffków (rozdz. 7.2) |
| VIP Sowi Klub | rozdz. 9 |

Cały katalog premium to ok. 40 000 Wypluffków, czyli ok. 70 zrzutów „Kieszeni”. Jest co zbierać, ale admin i tak
decyduje, ile daje.

---

## Załącznik B. Reguły Firestore — do opublikowania w etapie W2

**Teraz niczego nie publikuj.** W etapie W2 poproszę o publikację tej treści. Wersja z 2026-11-24 jest **prosta**:
bez logowania (hasło panelu w kodzie) i bez zaawansowanych zabezpieczeń (jeden gracz i jeden admin), więc nie trzeba
nic wpisywać ani podmieniać. Część „SowieGry” jest **słowo w słowo** taka jak dziś (`firestore.rules` z 2026-11-23).
Nowa jest tylko część „Wypluffki”. Jeśli wcześniej dojdzie Sowia Farma (`"farma"` na liście gier — Analiza 8,
Załącznik B), dostaniesz jedną, połączoną treść.

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
    // Jeden gracz i jeden admin (hasło panelu w kodzie) — bez zaawansowanych zabezpieczeń.
    // Reguły sprawdzają tylko poprawność danych. Kasowanie wpisów pozwala przywrócić kopię zapasową.
    match /sowiegry_wypluffki/portfel {
      allow read: if true;
      allow create, update: if request.resource.data.schemaVersion is int
                            && request.resource.data.saldo is int
                            && request.resource.data.saldo >= 0;
      allow delete: if false;

      // „Hu-hu w kolejce”: prośby o doładowanie.
      match /wypluffki_prosby/{kod} {
        allow read, delete: if true;
        allow create, update: if request.resource.data.kwota is int;
      }

      // Wyciąg z konta: zakupy, doładowania, korekty, zwroty.
      match /wypluffki_historia/{wpis} {
        allow read, delete: if true;
        allow create, update: if request.resource.data.zmiana is int;
      }
    }
  }
}
```

**Sprawdzone 2026-11-24 na emulatorze Firestore** (firebase-tools 15.31.0, poza repozytorium): wszystkie 5 grup testów
z rozdz. 15.2 przechodzi. Poprawne zapisy portfela przechodzą, a złe saldo, brak `schemaVersion` i skasowanie portfela
są odrzucane. Prośby i historia działają. Przywracanie kopii przechodzi (nadpisanie profilu, skasowanie i ponowne
utworzenie historii gry). Pozostałe kolekcje są dalej zamknięte. W W1 te testy trafią do `tests/rules/`.

---

## Załącznik C. Przykładowy przebieg (jak to będzie wyglądać)

1. **Gracz, wieczór.** Wchodzi do Dziupli, na górnym pasku: 🪶 120 · ● 0 [+]. Na końcu tablicy wisi ulotka „OFERTA
   DNIA: Kapelusz Pirata −20%”. Stuka „+”.
2. **Doładuj Wypluffki** → „Kieszeń Wypluffków — 550 ● — 1 × Hu-hu (głośne) — NAJPOPULARNIEJSZE” → metoda „Hu-hu na
   kozę” (karta wyszarzona: „Banki nie akceptują wypluffków”) → „Weryfikacja kozy…”.
3. **Obrazek:** Sówka w Kapeluszu Ogrodnika rozkłada skrzydła: „HU HU!”, koza podskakuje: „MEEE?!”. Pod spodem:
   „Kieszeń Wypluffków · 550 ● · Kod HU-7F3K-2Q · 24.11.2026, 18:03 · czeka na admina ⏳”. Gracz robi zrzut (trzy palce
   w dół) i wysyła go adminowi.
4. **Admin, ten sam wieczór.** Śmieje się ze zrzutu, otwiera `…/SowieGry/Admin/`. Na górze: „Hu-hu w kolejce (1):
   HU-7F3K-2Q · Kieszeń 550”. Wpisuje notkę „Najgłośniejsze hu-hu w tym tygodniu!” → **Zatwierdź 550**.
5. **Gracz:** w Dziupli od razu: „Sowi Bank: wpłynęło 550 Wypluffków! 🎉 — Najgłośniejsze hu-hu w tym tygodniu!”.
   Licznik nabija się do 550, Sówka: „Hu-hu! Jesteśmy bogate!”.
6. **Zakup:** ulotka → Kapelusz Pirata ~~399~~ 319 ● → „To tylko wygląd — kupić?” → **paragon** → „Załóż teraz”.
   Sówka w kapeluszu pirata siedzi w Dziupli, a za chwilę biegnie w nim w Sowiej Ucieczce. Saldo: 231 ●, Sowi Klub:
   Płotka („Jeszcze 681 do Śledzia!”).
7. **Kantor:** gracz z ciekawości stuka „Kantor” → „Wypluffki → piórka: nieczynne. Sowa ma zasady.”
