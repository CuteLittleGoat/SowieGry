# Atlas mechanik: Littlewood, Stardew Valley, Sprout Valley, Fields of Mistria

**Typ dokumentu:** przekrojowa dokumentacja porównawcza istniejących gier typu *farming / life / cozy simulation*  
**Język:** polski; oryginalne angielskie nazwy przedmiotów, systemów i postaci zachowano tam, gdzie ułatwia to identyfikację.  
**Stan kwerendy:** 23 listopada 2026 r.  
**Zakres:** wyłącznie rozwiązania występujące w wymienionych grach (z wyraźnym rozgraniczeniem wersji i dodatków). **Dokument nie projektuje żadnej nowej gry.**

## Spis treści

1. [Metoda, zakres i oznaczenia](#1-metoda-zakres-i-oznaczenia)
2. [Littlewood](#2-littlewood)
3. [Stardew Valley](#3-stardew-valley)
4. [Sprout Valley](#4-sprout-valley)
5. [Fields of Mistria](#5-fields-of-mistria)
6. [Porównanie mechanik](#6-porównanie-mechanik)
7. [Słownik pojęć i sytuacji granicznych](#7-słownik-pojęć-i-sytuacji-granicznych)
8. [Źródła i ograniczenia kwerendy](#8-źródła-i-ograniczenia-kwerendy)

---

# 1. Metoda, zakres i oznaczenia

Dokument opisuje: sterowanie i poruszanie postacią; organizację świata, map i wnętrz; dzień, noc, kalendarz, pory roku i pogodę; przygotowywanie gleby, siew, podlewanie, wzrost i zbiór; pola, szklarnie, doniczki i rośliny ozdobne; narzędzia, automatyzację, ulepszenia i ograniczenia; ekwipunek, schowki i obieg przedmiotów; kupno, sprzedaż i przetwarzanie; wznoszenie budynków, wyposażenie domu, dekoracje; NPC, relacje i zlecenia; progresję i dodatkowe aktywności.

**Jak czytać stwierdzenia:**

- **Mechanika potwierdzona** — reguła opisana w oficjalnej prezentacji, dokumentacji gry, wyspecjalizowanej wiki albo szczegółowym poradniku. Przy ważniejszych twierdzeniach wskazano źródło, np. [L1], [S3], [P2], [M4].
- **Przykład** — konkretny przedmiot, roślina lub sytuacja pokazująca działanie reguły; nie jest listą wszystkich elementów gry.
- **Zastrzeżenie wersji** — zwłaszcza ważne dla *Sprout Valley* (podstawowa wersja i *Friends Forever*) oraz aktualizowanego *Fields of Mistria*. Liczby i dostępność mogą zależeć od wersji.
- **Brak potwierdzenia** — brak wystarczających podstaw, aby przypisać danej grze określony szczegół. Nie jest to równoznaczne z pewnym stwierdzeniem, że taki element nie istnieje.

W opisach zachowano rozróżnienie między **upływem zegara**, **zużywaniem energii/staminy** i **przechodzeniem do następnego dnia**. Są to różne mechanizmy: gra może nie mieć biegnącego zegara, a mimo to ograniczać liczbę czynności dziennie. Analogicznie **automatyczne podlewanie** nie oznacza automatycznego sadzenia lub zbierania.

## 1.1. Szybka charakterystyka czterech gier

| Gra | Główny filar | Logika dnia | Rodzaj uprawy | Szczególnie charakterystyczne mechaniki |
|---|---|---|---|---|
| **Littlewood** | odbudowa osady i relacje | pora dnia zależy od zużycia energii na działania, nie od tykającego zegara | uproszczone uprawy, bez codziennego podlewania warzyw | niemal swobodny *build mode*, terraformowanie, życzenia mieszkańców, rozbudowa usług |
| **Stardew Valley** | gospodarstwo, ekonomia i życie miasteczka | czas w grze płynie sam; o 2:00 postać traci przytomność | złożone pola, sezonowość, nawozy, zraszacze, szklarnia i doniczki | rozbudowa narzędzi i budynków, jakość plonów, relacje, rzemiosło, kilka rodzajów progresji |
| **Sprout Valley** | kameralna farma na wyspie, eksploracja | cykl dnia i nocy, spanie w łóżku, stamina | prosta uprawa, podlewanie, drzewa i krzewy | podróże na proceduralne wyspy, zamówienia, rozbudowa domu, crafting, późniejsze rozszerzenia NPC |
| **Fields of Mistria** | gospodarstwo i odbudowa społeczności, z elementami magii | zegar płynie; można regulować szybkość dnia; omdlenie po 2:00 | sezonowe pola, ulepszane narzędzia, szklarnie, magiczne wsparcie i automatyczne podlewanie | ranga miasta, premie umiejętności za Essence, rozbudowany kalendarz i życie mieszkańców |

**Ważne:** *Littlewood* nie jest grą „bez energii”; *Stardew Valley* i *Fields of Mistria* nie są grami, w których dzień trwa do dobrowolnego położenia się spać; *Sprout Valley* również używa ograniczeń czasu i staminy. [L1] [L2] [S1] [P2] [M1]

---

# 2. Littlewood

## 2.1. Założenie i struktura świata

W *Littlewood* gracz wciela się w bohatera, który **już uratował świat**. Zamiast rozbudowanej kampanii walki pierwszoplanowym zadaniem jest ponowne zbudowanie osady: stawianie domów, sprowadzanie mieszkańców, zbieranie materiałów, rozwijanie usług, odnawianie relacji i eksplorowanie spokojniejszych lokacji. Świat obejmuje m.in. własne miasteczko, obszary leśne, miejsca połowu ryb i kopalnie. Gra przedstawiona jest w rzucie z góry, z wyraźną siatką pól. [L1] [L3]

Pętla podstawowa obejmuje: poruszanie się po osadzie → rozmowę i sprawdzanie potrzeb mieszkańców → zdobywanie drewna, rudy, ryb, owadów i plonów → obróbkę zasobów → ustawianie lub ulepszanie obiektów → rozpoczęcie kolejnego dnia → dostęp do nowych mieszkańców, przedmiotów i życzeń. Postęp jest rozłożony między różne systemy, nie tylko rolnictwo.

## 2.2. Poruszanie i interakcje

Postać przemieszcza się między sąsiadującymi polami; interakcja z obiektem zależy od tego, co znajduje się obok lub pod postacią. Do najczęstszych działań należą zbieranie, ścinanie drzew, wydobywanie, łowienie, rozmowa z NPC i wejście do obiektu. Wnętrza oraz teren na zewnątrz mają osobne sposoby edycji. Wiele działań nie wymaga ręcznego przełączania rozbudowanej listy narzędzi — właściwe możliwości stają się dostępne wraz z odblokowaniem sprzętu i umiejętności. [L4] [L5]

Chodzenie i rozglądanie się co do zasady **nie przesuwają dnia**. Gracz może długo analizować układ budynków albo rozmawiać poza kosztującymi energię akcjami, podczas gdy obróbka materiałów lub zebranie zasobu wlicza się do dziennego budżetu. Nie wszystkie interakcje z NPC są darmowe; określone działania społeczne również mogą zużywać energię. [L2] [L4]

## 2.3. Czas, energia i sen — nietypowy model

To jeden z najbardziej charakterystycznych systemów *Littlewood*:

1. **Brak standardowo tykającego zegara.** Pora dnia zmienia się przede wszystkim wskutek wykonywania działań kosztujących energię.
2. **Energia jest zarazem zasobem dnia.** Gromadzenie surowców, łowienie czy praca rolnicza przybliżają porę wieczorną.
3. **Ruch bez pracy nie przyspiesza dnia.** Nie występuje presja typu „po siedmiu minutach rzeczywistych zacznie się noc”.
4. **Wyczerpanie ma konsekwencje.** Po zużyciu budżetu energii gra ostrzega, że czas iść spać. Dodatkowa wyczerpująca czynność może zakończyć się utratą przytomności.
5. **Sen we własnym łóżku jest korzystniejszy.** W stosunku do omdlenia poza domem pozwala rozpocząć następny dzień z korzystniejszą pulą energii; opisy podają premię 25%.
6. **Istnieją ulepszenia zwiększające dzienny budżet** i zmniejszające koszt określonych prac, np. narzędzia z szansą na brak kosztu energii. [L2] [L4] [L6] [L7]

Zatem system „bez zegara” oznacza tutaj **czas napędzany akcjami**, a nie **nieograniczony dzień**. Efekt może być mniej nerwowy niż w grach z zegarem, ale planowanie liczby czynności wciąż jest częścią rozgrywki.

## 2.4. Kalendarz, pory roku, wydarzenia i pogoda

Występują pory roku oraz kalendarz. Po umieszczeniu przedmiotu *Calendar* można sprawdzać dzień, sezon i zaplanowane w sezonie wydarzenia. Święta i zdarzenia wprowadzają okazjonalne aktywności, bonusy i dialogi. Pojawia się także deszcz; w późniejszych aktualizacjach ograniczono występowanie deszczu w dniach specjalnych wydarzeń. [L8] [L9]

W przeciwieństwie do sezonowej uprawy w *Stardew Valley* część podstawowych warzyw w *Littlewood* oznaczona jest jako dostępna przez **wszystkie sezony**. Oznacza to, że widoczna zmiana pory roku nie musi automatycznie zabijać upraw na polach. [L10]

**Rozdzielenie systemów:** sezon wpływa na krajobraz, zawartość świata i wydarzenia; standardowe pola warzywne mają uproszczone reguły. Deszcz nie zastępuje codziennego podlewania warzyw, ponieważ w podstawowym systemie tych warzyw codziennie się nie podlewa. Podlewanie dotyczy przede wszystkim osobnego systemu kwiatów. [L10] [L11]

## 2.5. Uprawa roślin jadalnych

Rolnictwo funkcjonuje jako odrębna aktywność i *Hobby* (umiejętność). Odblokowanie roślin i ich poziomów zależy m.in. od rozwoju *Farming*. W interfejsie budowania, na zewnątrz, wybiera się kategorię *Nature* i roślinę, a następnie ustawia ją w przygotowanym miejscu. System ogranicza dopuszczalną całkowitą liczbę posadzonych upraw. [L10]

Przykładowe reguły:

- **Gleba i umieszczenie rośliny:** uprawa wymaga pola przeznaczonego pod uprawę, nie jest po prostu rzuceniem nasionka w dowolny krajobraz.
- **Uproszczony cykl:** popularne rośliny dojrzewają po kilku dniach. W bazie wiki marchew (*Carrot*), kukurydza (*Corn*), *Motato*, *Kacoomba* i *Bloccoli* mają opisany czas **3 dni** i różne wymagania poziomu Farming.
- **Brak rutynowego podlewania warzyw:** uprawy rosną ponownie bez codziennego przechodzenia z konewką po grządkach.
- **Wielokrotny zbiór:** dojrzały plon można zebrać, a następnie roślina wraca do cyklu dojrzewania; nie trzeba od nowa sadzić każdego warzywa po każdym zbiorze.
- **Zbieranie jako rozwój umiejętności:** plony dają doświadczenie Farming, a bardziej zaawansowane gatunki wymagają odpowiedniego poziomu.
- **Plony są przedmiotami:** mogą służyć do gotowania, sprzedaży, przekazywania i karmienia określonych zwierząt. [L10] [L12] [L13]

### Przykłady progresji roślin

| Gatunek w grze | Wymagany poziom Farming (wg wiki) | Czas dojrzewania wskazany w wiki | Uwaga |
|---|---:|---:|---|
| Carrot | 1 | 3 dni | podstawowa roślina |
| Corn | 15 | 3 dni | przykład progu umiejętności |
| Motato | 20 | 3 dni | gatunek późniejszy |
| Kacoomba | 35 | 3 dni | gatunek późniejszy |
| Bloccoli | 40 | 3 dni | gatunek późniejszy |
| Punkin | 55 | 3 dni | gatunek późniejszy |

Liczby pochodzą z kart konkretnych gatunków; nie stanowią kompletnego katalogu roślin. [L12] [L13]

## 2.6. Drzewa, owoce i kwiaty ozdobne

W świecie występują owocujące drzewa i rośliny ozdobne. Owoce traktowane są jako surowce i przedmioty użytkowe. Uprawa owoców podobnie jak warzyw jest okresowa, a nie symulacją rzeczywistych warunków glebowych. Istnieją limity rozmieszczania roślin/drzew, które mają znaczenie podczas planowania miasteczka. [L10] [L14]

**Kwiaty to inny podsystem:** są dekoracją i mogą być rozmnażane/krzyżowane w celu uzyskania wariantów. Po otrzymaniu *Watering Can* można podlewać **obszar 3 × 2 przed postacią**. Aby powstały nowe kwiaty, trzeba pozostawić obok rosnących okazów wolne miejsce. Konewka została zmieniona w jednej z wczesnych aktualizacji: nie przyspiesza już natychmiastowo dojrzewania wszystkich warzyw i owocujących drzew. Właśnie dlatego nie należy utożsamiać podlewania kwiatów z zasadami podstawowych plonów. [L11] [L15]

## 2.7. Narzędzia, poziomy sprzętu i ulepszenia

Dostęp do prac uzależniony jest od narzędzi. Przykładem są **Gloves**, używane przy rolnictwie i zbieraniu:

| Wariant | Efekt opisany w wiki |
|---|---|
| Novice Gloves | możliwość zbierania owoców i warzyw |
| Silver Gloves | 10% szansy, że zbiór nie zużyje energii |
| Golden Gloves | zbiór dwóch przyległych roślin/drzew owocowych jednocześnie; 1% szansy na legendarny plon |

Pozostałe kategorie sprzętu wiążą się ze ścinaniem drzew, górnictwem, łowieniem i łapaniem owadów. System odróżnia **odblokowanie czynności** od **wzrostu efektywności**: sprzęt lepszego poziomu nie musi dawać nowej profesji, ale skraca liczbę akcji, zmniejsza koszty lub zwiększa nagrodę. [L10] [L16]

## 2.8. Umiejętności (*Hobbies*) i ich progresja

System obejmuje **dziesięć** umiejętności: *Bug Catching, Cooking, Crafting, Farming, Fishing, Gathering, Merchanting, Mining, Tarott Monster* i *Woodcutting*. Powtarzanie stosownych czynności daje doświadczenie, a poziom umiejętności staje się warunkiem dostępu do bardziej zaawansowanych treści. [L17]

To rozdziela rozwój na wiele osi. Przykładowo: wysokie *Farming* oznacza dostęp do późniejszych roślin, *Crafting* — do sposobów obróbki materiałów, *Merchanting* — do sprawniejszej sprzedaży. Gracz może jednego dnia zajmować się rolnictwem, a drugiego górnictwem, bez konieczności przechodzenia liniowej sekwencji misji.

## 2.9. Budowanie miasta i terraformowanie

*Build Mode* umożliwia ustawianie, przesuwanie i usuwanie budynków oraz obiektów, także po ich wcześniejszym wybudowaniu. Gracz może **podnosić i obniżać fragmenty terenu**, tworząc pagórki i wodę, a także układać ścieżki, otoczenie, rośliny i dekoracje. Edycja ma charakter siatki pól; obiekty zajmują konkretną powierzchnię. [L5] [L18]

Ważnym elementem są życzenia NPC dotyczące **położenia ich domów**: mieszkanie może mieć znaleźć się w pobliżu określonego innego budynku, obiektu, na pewnej wysokości terenu albo w konkretnym sąsiedztwie. Gra sprawdza więc nie tylko „czy obiekt wybudowano”, ale też „gdzie go wybudowano”. Budynek można później przestawić, dostosowując plan całej osady. [L1] [L18]

Budowanie samo w sobie nie jest głównym wydatkiem energii dnia; ograniczenia wynikają raczej z posiadanych materiałów, odblokowanych planów i limitów zabudowy. Dzięki temu czas potrzebny na zastanowienie się nad układem miasta nie musi uszczuplać możliwości pracy. [L4]

## 2.10. Budynki, materiały, gwiazdki i odblokowywanie usług

Początkowo miasto ma kilka podstawowych budynków, m.in. dom Willow, *Lumber Mill* i *Smelter*. Kolejni mieszkańcy przyprowadzają projekty własnych domów, a nowe usługi (np. sklep, tawerna, targ, muzeum, warsztat, salon dekoracji) tworzą nowe pętle ekonomiczne. [L18]

Surowce wymagają przetworzenia: surowe drewno zamienia się w deski, a rudy/minerały w materiały budowlane. Rozbudowa instytucji odbywa się za materiały i w ramach systemu poziomów/gwiazdek. Podnoszenie poziomu konkretnych obiektów zwiększa ich możliwości, zyski lub bonusy; w zaawansowanej fazie dostępne są również *Ultimate Building Upgrades*. [L19] [L20]

W biurze (*My Office*) znajdują się systemy *Town Wishes* — miejskich życzeń/usprawnień — oraz podgląd liczby obiektów, roślin i dekoracji. Odpowiednie usprawnienia mogą m.in. zwiększać limit dekoracji albo dzienną energię. [L21]

## 2.11. Handel, Marketplace i waluta

Podstawową walutą są **Dewdrops**. Do jej uzyskania służy m.in. sprzedaż na *Marketplace*. Gracz umieszcza przedmioty w punktach sprzedaży, a **następnego dnia** mogą być one zastąpione wypłatą waluty. Przy poziomie *Merchanting* 30 zwiększa się liczba przedmiotów sprzedawanych w jednym slocie, a przy 60 — ponownie. Tym samym przepustowość handlu jest związana z rozwojem profesji. [L22] [L23]

Zakupy w sklepach NPC i sprzedaż na targu podnoszą *Merchanting*. W grze występuje gospodarka oparta na fizycznych przedmiotach i ich obiegu między zdobywaniem, wytwarzaniem, konsumpcją, dekoracją oraz sprzedażą, nie tylko na wymianie zasobów na pieniądze.

## 2.12. Dom, wyposażenie, mieszkańcy i relacje

Własny dom jest miejscem spania, umieszczania mebli i przedmiotów dekoracyjnych. Edycja wnętrza odbywa się osobno od edycji całego miasta. Domy NPC również można wyposażać zgodnie z ich życzeniami; wypełnianie wymagań zwiększa zadowolenie i umożliwia rozwój relacji. [L5] [L18]

Gracz zaprasza kolejne postacie do osady, prowadzi rozmowy, może spędzać z kimś czas i budować więzi. Istnieje m.in. mechanika *Compliment* (komplementowania, z dziennym limitem) oraz *Hang Out* (towarzyszenia mieszkańcowi). W niektórych relacjach pojawiają się wątki romantyczne. NPC pełnią funkcję społeczną, fabularną i mechaniczną (nowe plany i życzenia). [L24] [L25]

## 2.13. Dodatkowe aktywności i brak typowej walki rolniczej

Obok ogrodnictwa są połowy ryb, łapanie owadów, wydobywanie rudy, ścinanie drzew, gotowanie, kolekcjonowanie i proste minigry. Chociaż uniwersum zawiera odniesienia do potworów i konfrontacji, **podstawowa działalność gracza w mieście nie jest nastawiona na bieżącą walkę z wrogami** jak w dungeon crawlerze. Mechanika *Tarott Monster* jest osobną aktywnością. [L1] [L17]

## 2.14. Co odróżnia Littlewood od pozostałych trzech gier — stan faktyczny

- Samo przebywanie w świecie i projektowanie układu osady nie wymusza upływu czasu, ale praca zużywa energię.
- Warzywa nie wymagają codziennego podlewania i mogą ponownie dawać plon po kilku dniach.
- Budynki oraz wysokość terenu można swobodnie rekonfigurować.
- Odblokowywanie nowych mieszkańców, obiektów i spełnianie ich życzeń jest równie ważne jak rolnictwo.
- Progresja odbywa się przez odrębne umiejętności, poziomy budynków, miejskie ulepszenia i społeczne cele.

**Główne źródła rozdziału:** [L1]–[L25].

---
# 3. Stardew Valley

## 3.1. Założenie i układ świata

W *Stardew Valley* gracz przejmuje zaniedbane gospodarstwo w pobliżu miejscowości Pelican Town. Postać porusza się po świecie w rzucie z góry, zajmuje się farmą, odwiedza sklepy i domy mieszkańców, zdobywa surowce, wytwarza przedmioty, łowi ryby, opiekuje się zwierzętami, eksploruje kopalnie i nawiązuje znajomości. Gra ma jednocześnie gospodarkę rolną, system relacji, rzemiosło, wydarzenia sezonowe oraz rozwój postaci. [S1] [S2]

**Przestrzeń podzielona jest na lokacje**, m.in. farmę, dom, miasteczko, sklep Pierre’a, warsztat Robin, kuźnię Clinta, plażę, las i kopalnie. Przejście między lokacjami odbywa się przez odpowiednie krawędzie mapy lub wejścia. Własna farma jest najbardziej elastyczną przestrzenią: można zmieniać układ grządek, drzew, ogrodzeń, ścieżek, urządzeń i budynków. Inne lokacje mają w większości ustalony plan. [S1] [S3]

## 3.2. Poruszanie się, narzędzia i podstawowa interakcja

Na komputerze gracz przemieszcza postać klawiszami kierunkowymi/WASD, wybiera przedmioty z paska szybkiego dostępu (*hotbar*) i używa narzędzia na wskazanym polu. Kierunek patrzenia i pozycja postaci wpływają na to, który kafelek zostanie trafiony. Różne obiekty wymagają różnych narzędzi: np. motyka do przekopywania gleby, konewka do podlewania, siekiera do drewna, kilof do kamieni, kosa do części roślin i chwastów. [S1] [S4]

Istotne jest **ładowanie działania przez przytrzymanie**: ulepszona motyka lub konewka może obrobić wiele sąsiednich pól naraz. Samo ulepszenie nie oznacza, że pojedyncze kliknięcie zawsze obejmie cały maksymalny obszar — gracz wybiera siłę/rozmiar działania przez czas przytrzymania. Zmniejsza to liczbę powtarzalnych akcji przy dużej farmie. [S4] [S5]

### 3.2.1. Osobne sterowanie mobilne

Wydanie mobilne ma kilka profili sterowania, w tym **Tap-to-move** (dotknięcie wskazuje cel ruchu), wirtualny joystick i przyciski, warianty z automatycznym doborem celu/interakcji oraz opcje związane z automatycznym atakiem. Dostępne są przełączniki stylu sterowania. Rozwiązania dobre dla zwykłego przemieszczania nie zawsze są równie wygodne przy precyzyjnym ustawianiu mebli lub korzystaniu z narzędzi; wiki opisuje sytuacje wymagające przełączenia trybu. [S6]

Nie oznacza to, że mobilna wersja zmienia podstawowe zasady ekonomii czy wzrostu roślin. Zmienia sposób wydawania poleceń. Gra występuje również na platformach obsługiwanych kontrolerem; czynności kontekstowe i interfejs ekwipunku są odpowiednio mapowane na przyciski. [S6] [S7]

## 3.3. Zegar, dzień i sen

W *Stardew Valley* upływ czasu jest niezależny od liczby wykonanych prac:

- Dzień zwykle rozpoczyna się o **6:00**.
- Zegar idzie naprzód nawet wtedy, gdy gracz jedynie spaceruje lub stoi w miejscu (z wyjątkami związanymi z pauzą/menu, lokalizacją i trybem).
- Typowo **10 minut w grze odpowiada 7 sekundom rzeczywistym**, ale w pewnych obszarach tempo różni się.
- Doba aktywna kończy się najpóźniej około **2:00 w nocy**; po tej godzinie postać traci przytomność.
- Wcześniej można samodzielnie skorzystać z łóżka, aby zakończyć dzień.
- Sen przywraca energię i zdrowie, lecz późne kładzenie się spać, przemęczenie i omdlenie mogą zmniejszać korzyści.
- Następnego ranka odtwarzane są operacje dzienne: wzrost upraw, odnowienie produkcji części urządzeń, sprzedaż w skrzynce, wydarzenia losowe. [S8]

**Zegar i energia są dwiema osobnymi barierami.** Można mieć dostatecznie dużo energii, ale zabraknie czasu do zamknięcia sklepu; można również mieć cały dzień przed sobą, ale brak energii do pracy. Jedzenie i pewne ulepszenia pomagają przede wszystkim w drugiej sytuacji. Samo położenie się spać nie służy jedynie „przeskakiwaniu” animacji nocy — to moment aktualizacji wielu systemów świata. [S8] [S9]

## 3.4. Kalendarz i pory roku

Rok składa się z **czterech sezonów: Spring, Summer, Fall, Winter**; każdy trwa **28 dni**. Każda pora roku ma własne uprawy, rośliny zbierane w dziczy, część ryb, wydarzenia i festiwale. Sezon wpływa również na wygląd terenu oraz zakupioną ofertę nasion. [S10]

**Na otwartym polu sezon jest regułą twardą.** Gdy zmienia się pora roku, rośliny niedopuszczone do nowej pory zazwyczaj więdną, nawet jeśli zbiory miały nastąpić za jeden dzień. Wyjątkiem są gatunki przypisane do więcej niż jednego sezonu (np. *Corn* rosnący latem i jesienią), uprawa w szklarni i pewne szczególne warunki. Niektóre resztki roślin pozostają na przekopanej ziemi, co pozwala zachować układ pola, choć wymaga oczyszczenia przed kolejnym siewem. [S10] [S11]

Pory roku wpływają nie tylko na rolnictwo: NPC mają urodziny i harmonogramy, a część festiwali odbywa się raz na rok. Taki kalendarz tworzy równoległy rytm rolniczy, handlowy i społeczny.

## 3.5. Cykl życia uprawy — krok po kroku

Typowy proces wygląda tak:

1. **Oczyszczenie pola.** Kamienie usuwa kilof, drewno i części przeszkód — siekiera, chwasty — kosa lub inne narzędzie. Na farmie mogą ponownie pojawiać się odpadki i chwasty.
2. **Przekopanie gleby.** Motyka przekształca odpowiednie pole ziemi w pole uprawne. Można pracować pojedynczo albo za pomocą ulepszonej motyki na większym obszarze.
3. **Ewentualne użycie nawozu.** Nawóz działa na pole gleby, nie jest osobnym „ulepszeniem postaci”. Poszczególne kategorie wpływają na jakość, tempo wzrostu albo utrzymanie wilgoci.
4. **Zasiew.** Wybrane nasiono umieszcza się na przygotowanej glebie, jeśli warunki lokalizacji i sezonu na to pozwalają.
5. **Podlewanie.** Zasadniczo roślina potrzebuje wilgotnej gleby, aby danego dnia zaliczyć wzrost. Deszcz i zraszacze mogą zastąpić ręczne działanie. Brak wody zwykle **zatrzymuje wzrost**, zamiast natychmiast niszczyć roślinę.
6. **Przejście dnia.** Przy aktualizacji dziennej zwiększa się postęp kolejnej fazy wzrostu, jeśli spełniono warunki.
7. **Zbiór.** Gotowy plon trafia do ekwipunku. Można go sprzedać, zjeść, przekazać NPC, przetworzyć albo zachować.
8. **Po zbiorze:** przy uprawie jednorazowej z pola znika cała roślina; przy uprawie wielokrotnego zbioru pozostaje łodyga/krzew i zaczyna się krótszy czas do kolejnego plonu. [S11] [S12] [S13]

### 3.5.1. Uprawy jednorazowe i odnawialne

- **Jednorazowe:** po dojrzeniu i zebraniu trzeba kupić/uzyskać kolejne nasiono oraz zasadzić ponownie, np. *Parsnip*, *Potato*, *Cauliflower*, *Melon*, *Pumpkin*.
- **Wielokrotne:** po jednorazowym, zwykle dłuższym okresie wzrostu roślina daje powtarzające się zbiory; przykłady to *Strawberry*, *Blueberry*, *Tomato*, *Cranberries* i *Hot Pepper*.
- **Wielosezonowe:** mogą przetrwać konkretną zmianę pory roku, np. *Corn* latem i jesienią.
- **Specjalne:** niektóre są wieloplonowe podczas jednego zbioru, niektóre mogą zmienić się w ogromny plon (*Giant Crops*) przy odpowiednim układzie kilku pól, a inne mają dodatkowe wymagania przestrzeni albo użycia narzędzi. [S11] [S12]

### 3.5.2. Przykładowe konkretne rośliny

| Roślina | Sezon na zwykłym polu | Typ | Udokumentowana cecha |
|---|---|---|---|
| Parsnip (pasternak) | wiosna | jednorazowa | rośnie 4 dni; prosty plon startowy |
| Potato (ziemniak) | wiosna | jednorazowa | rośnie 6 dni; możliwy dodatkowy ziemniak podczas zbioru |
| Cauliflower (kalafior) | wiosna | jednorazowa | rośnie 12 dni; może uczestniczyć w mechanice Giant Crop |
| Strawberry (truskawka) | wiosna | powtarzalna | ponowne zbiory bez ponownego sadzenia |
| Blueberry (borówka) | lato | powtarzalna | kolejny zbiór po odrośnięciu; jedna roślina daje zwykle kilka sztuk owocu |
| Tomato (pomidor) | lato | powtarzalna | wielokrotne zbiory |
| Corn (kukurydza) | lato i jesień | powtarzalna, wielosezonowa | nie więdnie przy przejściu z lata w jesień |
| Pumpkin (dynia) | jesień | jednorazowa | może uczestniczyć w mechanice Giant Crop |
| Cranberries (żurawina) | jesień | powtarzalna | zbieranie owoców bez likwidowania krzewu |

Czasy niektórych roślin zależą od nawozu i profesji — podane przykłady opisują podstawową charakterystykę, a nie gwarantowany harmonogram każdego pola. [S11] [S12] [S14]

## 3.6. Wilgoć, deszcz i pogoda

Pogoda obejmuje m.in. dni słoneczne, deszczowe i burzowe, a zimą śnieg. Pogoda jest prognozowana na następny dzień w telewizji. **Deszcz podlewa zewnętrzne pole uprawne**; przy zwykłej uprawie można wtedy pominąć pracę konewką. Burza również wiąże się z deszczem, ale dodatkowo z piorunami, które mogą uszkodzić rośliny lub drzewa. Piorunochrony są osobnym urządzeniem pozwalającym przechwytywać uderzenia i generować baterie. [S15] [S16]

Ważne granice działania deszczu:

- **Szklarnia:** jest pomieszczeniem pod dachem. Rośliny nie korzystają z deszczu na zewnątrz; trzeba zadbać o ich podlewanie wewnątrz.
- **Garden Pot ustawiony w budynku:** nie otrzymuje wody od pogody; potrzebuje konewki albo podłoża utrzymującego wilgoć.
- **Zraszacz:** pracuje na określonych polach wokół siebie i może podlewać uprawy w szklarni, ale **nie podlewa Garden Pots**.
- **Wilgoć:** efekty niektórych rodzajów *Retaining Soil* są sprawdzane przy przejściu do kolejnego dnia; najsilniejszy wariant pozwala długo utrzymać wilgoć. [S16] [S17] [S18]

Warunki pogodowe wpływają również na dostępność niektórych ryb, aktywność mieszkańców oraz zdarzenia w świecie. [S15]

## 3.7. Szklarnia (*Greenhouse*)

Na typowej farmie stoi początkowo **zniszczony, nieczynny budynek** szklarni. Można go odnowić przez ukończenie paczek (*Bundles*) spiżarni w *Community Center* albo opłacenie rozwoju w gałęzi *Joja*. W standardowej wersji gry szklarnię **odblokowuje się/naprawia**, a nie rozbudowuje stopniowo do coraz większej liczby pól. [S18] [S19]

### 3.7.1. Układ i możliwości

- W środku znajduje się prostokąt ziemi o wymiarach **12 × 10**, czyli **120 pól uprawnych**.
- Można sadzić uprawy niezależnie od bieżącego sezonu, a rośliny wielokrotnego zbioru nie więdną przy zmianach pory roku.
- Wokół pola jest obramowanie i pasy, na których można rozmieszczać pewne obiekty; na odpowiednio wolnej przestrzeni można też uprawiać drzewa owocowe.
- Ochrona dachu oznacza brak bezpośredniego działania pogody; rośliny wewnątrz nie są narażone na pioruny, a typowe strachy na wróble nie są tam potrzebne.
- Niektóre obiekty działają inaczej niż na zewnątrz: np. *Bee House* nie produkuje miodu wewnątrz szklarni, a *Giant Crops* nie powstają w jej wnętrzu. [S18]

### 3.7.2. Rozmieszczanie zraszaczy

Możliwe są różne konfiguracje zraszaczy. Przykład opisany w wiki: **6 Iridium Sprinklers** pozwala podlać całe wnętrze, zajmując **4** miejsca z podstawowych 120 pól, więc pozostaje **116** miejsc uprawnych. Użycie bardziej zaawansowanych dodatków (*Pressure Nozzles*) pozwala na kolejne oszczędności przestrzeni. [S18]

To dobry przykład mechaniki, w której **przedmiot automatyzujący zajmuje zasób przestrzenny**, a geometria jego zasięgu staje się częścią układanki.

## 3.8. Uprawy w domu i *Garden Pot*

*Garden Pot* (doniczka uprawna) jest osobnym obiektem, który umożliwia sadzenie roślin w wielu pomieszczeniach, w tym w *Farmhouse*, bez przekopywania gleby. Doniczki można stawiać także w wybranych lokalizacjach zewnętrznych, ale obowiązują tam ograniczenia roślin oraz obszarów. Po udostępnieniu szklarni gracz otrzymuje doniczkę i przepis w określonym wydarzeniu z Evelyn. [S17]

Mechaniczne różnice względem pola:

- Doniczka **jest osobnym meblem/pojemnikiem**, a nie trwałym kaflem gruntu.
- Nie używa się na niej motyki do przekopania ziemi.
- Można w niej uprawiać wiele zwykłych roślin, ale istnieją wyjątki (np. *Ancient Seeds* nie można posadzić w doniczce).
- Utrzymywanie wilgoci działa, a **Deluxe Retaining Soil** może wyeliminować potrzebę codziennego ponownego podlewania po pierwszym podlaniu.
- Zraszacze nie podlewają doniczek.
- Zabranie pojemnika z rosnącą rośliną może zniszczyć znajdującą się w nim uprawę. [S17]

W domu występuje ponadto ogromny wybór **zwykłych roślin dekoracyjnych, mebli, tapet, podłóg i innych ozdób**. Nie wszystkie doniczkowe ozdoby mają cykl wzrostu: statyczny mebel z rośliną i *Garden Pot* z zasianą uprawą to różne systemy. [S17] [S20]

## 3.9. Nawóz, jakość i przyspieszenie wzrostu

Nawozy podzielone są funkcjonalnie na trzy rodziny:

1. **Fertilizer:** poprawia szansę na plon wyższej jakości.
2. **Speed-Gro:** skraca liczbę dni potrzebnych do wzrostu.
3. **Retaining Soil:** zwiększa szansę, że ziemia pozostanie wilgotna do następnego dnia.

Nie są one prostą sumą dodatków tego samego rodzaju. Pole ma ograniczoną przestrzeń na rodzaj nawozu, a zmiana nawożenia/utrata podłoża może usunąć bonus. W grze występują też ulepszone wersje tych przedmiotów. [S14]

**Jakość produktu** jest z kolei atrybutem zebranego przedmiotu (np. zwykła, srebrna, złota, irydowa); jakość ma wpływ na wartość sprzedaży, energię po zjedzeniu i część relacji z NPC. Wzrost umiejętności *Farming* i odpowiednie nawożenie zwiększają szansę na wartościowszy plon. [S13] [S14]

## 3.10. Zraszacze, obszary działania i strachy na wróble

### 3.10.1. Zraszacze — dokładne zasięgi

Zraszacze uruchamiają się automatycznie rano i podlewają określone sąsiednie pola. Podstawowe typy mają następujący zasięg **bez dodatkowych modyfikatorów**:

| Sprinkler | Liczba podlewanych pól | Kształt |
|---|---:|---|
| **Sprinkler** | 4 | bezpośredni sąsiedzi: góra/dół/lewo/prawo |
| **Quality Sprinkler** | 8 | 8 pól otaczających urządzenie w kwadracie 3 × 3 |
| **Iridium Sprinkler** | 24 | 24 pola otaczające urządzenie w kwadracie 5 × 5 |

Dla przykładu (*S* = zraszacz, `o` = podlewany kafel, `.` = niepodlewany):

```text
Zwykły:      Quality:     Iridium:
. o .        o o o        o o o o o
 o S o       o S o        o o o o o
. o .        o o o        o o S o o
                           o o o o o
                           o o o o o
```

*Pressure Nozzle* może zwiększyć zasięg, a pewne specjalne ulepszenia zmieniają zachowanie automatyzacji. Standardowe zraszacze nie sadzą ani nie zbierają roślin. [S21]

### 3.10.2. Strachy na wróble i rzeczywiste zagrożenie dla pól

Na zewnętrznej farmie mogą pojawiać się **wrony** (*Crows*) i usuwać niezabezpieczone rosnące plony. Umieszczony **Scarecrow** chroni obszar w swoim zasięgu (około **8 pól promienia**), a **Deluxe Scarecrow** ma większy zasięg (około **16 pól promienia**). Zasięg stracha nie jest równoznaczny z wodnym obszarem 8 × 8 ani z liczbą uratowanych plonów; jest to sprawdzanie położenia konkretnej rośliny względem urządzenia. [S22]

Gra ma też **chwasty**, które potrafią rozrastać się i niszczyć pobliskie obiekty lub rośliny, oraz zagrożenia pogodowe. W standardowym *Stardew Valley* nie ma stałego systemu dzików atakujących pole w stylu osobnej minigry przepędzania; ochrona upraw przed wronami opiera się przede wszystkim na **rozmieszczeniu strachów**, nie na walce z nadlatującym przeciwnikiem. [S3] [S22]

## 3.11. Narzędzia i poziomy ulepszeń

Podstawowe narzędzia rolnicze i gospodarcze to: **Hoe, Watering Can, Axe, Pickaxe, Scythe**; są też narzędzia związane z połowem ryb, wydobyciem i walką. Ulepszenia w kuźni *Blacksmith* zwykle idą po kolei:

**Podstawowe → Copper → Steel → Gold → Iridium**.

| Poziom | Koszt standardowego ulepszenia w kuźni | Co zmienia się w praktyce |
|---|---|---|
| Copper | 5 Copper Bars + 2 000g | większy obszar działania motyki/konewki, efektywniejsze inne narzędzia |
| Steel | 5 Iron Bars + 5 000g | kolejny obszar działania lub siła narzędzia |
| Gold | 5 Gold Bars + 10 000g | jeszcze większy obszar/siła |
| Iridium | 5 Iridium Bars + 25 000g | najwyższy podstawowy poziom przed wyjątkowymi ulepszeniami |

Ulepszenie standardowego narzędzia trwa **2 dni** w kalendarzu gry; w tym czasie narzędzie jest oddane do kuźni. [S5]

### 3.11.1. Wymiary obszaru motyki i konewki

| Narzędzie | Copper | Steel | Gold | Iridium |
|---|---|---|---|---|
| Hoe / Watering Can — maksymalna podstawowa powierzchnia ładowanego działania | linia 3 pól | linia 5 pól | 3 × 3 | 6 × 3 |

Dla innych narzędzi ulepszenie zwykle zmniejsza liczbę uderzeń potrzebnych do zniszczenia przeszkody lub pozwala zniszczyć większy obiekt. Wyższe umiejętności zmniejszają zużycie energii podczas prac. [S4] [S5]

## 3.12. Ekwipunek, pasek narzędzi i schowki

Gracz zaczyna z **12 slotami** inwentarza. W *Pierre’s General Store* kupuje kolejne rozszerzenia:

- **Large Pack:** 24 sloty łącznie, koszt **2 000g**.
- **Deluxe Pack:** 36 slotów łącznie, koszt **10 000g**.

Przedmioty zwykle gromadzą się w stosach tego samego typu, a osobny *hotbar* daje bezpośredni dostęp do narzędzi i wybranych przedmiotów. Istnieje ekran ekwipunku do przenoszenia i sortowania rzeczy. Liczne *Chests* (skrzynie) pozwalają przechowywać osobno nasiona, minerały, plony, materiały budowlane i wyposażenie. [S23]

Stardew rozróżnia **wolne miejsce noszone przy sobie**, **rzeczy złożone do schowków** oraz **przedmioty umieszczone w świecie** (meble, maszyny, zraszacze). Zmiana wyposażenia farmy może więc wymagać wyjęcia zasobów z magazynu, przeniesienia ich i ponownego ustawienia.

## 3.13. Kupno, sprzedaż i ekonomia miasteczka

Typowy obieg gospodarczy:

1. Zakup nasion w sklepie (*Pierre’s General Store*; część specjalnych towarów w innych punktach).
2. Wydanie nasion na polach; pielęgnacja i odczekanie liczby dni.
3. Zebranie roślin i ewentualny podział na sprzedaż, gotowanie, prezent lub przeróbkę.
4. Sprzedaż bezpośrednio odpowiedniemu kupcowi albo wysłanie przez **Shipping Bin** na farmie.
5. Przeznaczenie dochodu na lepsze nasiona, zwierzęta, materiały, budowle, wyposażenie i ulepszenia.

**Shipping Bin** pozwala sprzedać przedmioty z rozliczeniem przy zakończeniu dnia/następnego poranka, w przeciwieństwie do transakcji bezpośredniej, która dostarcza walutę natychmiast. Sklepy NPC mają godziny pracy i nie zawsze są otwarte codziennie; Pierre tradycyjnie zamyka sklep w środy przed określonym postępem fabularnym. [S24] [S25]

Przetwórstwo dodaje kolejne warstwy wartości: *Preserves Jar* robi przetwory, *Keg* przerabia plony na napoje, urządzenia zwierzęce produkują przetworzone produkty, a gotowanie zamienia składniki na potrawy. Surowy plon nie jest zatem jedyną postacią, w której można spieniężyć produkcję. [S26]

## 3.14. Dom i jego rozbudowa

*Farmhouse* początkowo jest skromny. Kolejne ulepszenia zamawiane u **Robin** (*Carpenter’s Shop*) zwiększają powierzchnię lub dodają funkcjonalne części budynku:

- **Farmhouse Upgrade 1:** powiększa przestrzeń i dodaje kuchnię do gotowania.
- **Farmhouse Upgrade 2:** dodaje dalsze pomieszczenia, w tym przestrzeń dziecięcą.
- **Farmhouse Upgrade 3:** dodaje **cellar**, piwnicę pozwalającą ustawiać *Casks* do dojrzewania wybranych produktów.
- Po odpowiednim postępie dostępne są **renowacje i zmiany układu** określonych pomieszczeń (np. dodatkowe pokoje lub usunięcie łóżeczka dziecięcego). [S20] [S27]

Wyposażenie obejmuje łóżka, stoły, krzesła, oświetlenie, rośliny dekoracyjne, dywany, obrazy, tapety i podłogi. Część wyposażenia jest czysto estetyczna; inne obiekty mają funkcję (łóżko kończy dzień, kuchnia umożliwia gotowanie, doniczka pozwala uprawiać rośliny). Wygląd budynku i pomieszczeń może się zmieniać niezależnie od rozwoju farmy. [S20]

## 3.15. Budynki gospodarcze i przestrzeń pola

Robin może stawiać i ulepszać budowle, takie jak *Coop* i *Barn*, a także inne obiekty infrastrukturalne. Stawianie nowych budynków zużywa pieniądze, materiały i fragment powierzchni farmy. W przypadku budynków dla zwierząt kolejne poziomy umożliwiają większą pojemność, nowe gatunki lub dodatkowe funkcje. [S3] [S27]

**Ważne rozróżnienie:** zwykłe grządki na farmie nie są ograniczone do kupowanych „slotów”; ogranicza je powierzchnia zdatna do uprawy, przeszkody, układ zabudowy, dostępność wody i wydolność dziennej pracy. W standardowym świecie *Stardew Valley* większe pole uzyskuje się głównie przez oczyszczanie i reorganizowanie istniejącej przestrzeni, a nie przez kupno kolejnej strony interfejsu z grządkami. [S3]

## 3.16. Umiejętności, profesje i ulepszenia gracza

Główne umiejętności to *Farming, Mining, Foraging, Fishing, Combat*. Roślinne i zwierzęce czynności dają doświadczenie *Farming*. W kolejnych poziomach odblokowuje się receptury i bonusy, a na określonych progach wybiera się profesje (np. inne premie do uprawy i hodowli). W efekcie gracz stopniowo uzyskuje dostęp do lepszych zraszaczy, nawozów, urządzeń i większych zysków z produkcji. [S13]

Progresja rozkłada się na **umiejętności**, **narzędzia**, **sprzęt farmy**, **budynki**, **ekonomię** i **zadania fabularne**. Każda z tych osi ma własne koszty i ograniczenia.

## 3.17. NPC, rozmowy, relacje i zlecenia

Pelican Town jest osadą z mieszkańcami o indywidualnych harmonogramach, sympatiach, urodzinach, domach i wydarzeniach związanych z relacjami. Gracz może rozmawiać, dawać prezenty, wykonywać prośby oraz zbliżać się do wybranych postaci, włączając relacje romantyczne. Niektóre osoby prowadzą sklepy lub świadczą usługi, dlatego życie miasta ma wymiar zarówno społeczny, jak i funkcjonalny. [S2] [S25]

Zlecenia występują w kilku skalach: prośby o przedmiot, sezonowe zadania, większe *Special Orders* z warunkami dostawy oraz długoterminowe zestawy *Community Center Bundles*. Dostarczenie odpowiednich przedmiotów może odblokować infrastrukturę świata, np. szklarnię. [S19] [S28]

## 3.18. Pozostałe aktywności i zagrożenia

Oprócz rolnictwa gra oferuje m.in. łowienie ryb, wydobywanie, eksplorację kopalni, zbieractwo, hodowlę, gotowanie, crafting, festiwale, eksplorację nowych obszarów i walkę z potworami w wybranych lokacjach. Walka nie jest niezbędnym elementem każdej pracy na polu, lecz stanowi rozpoznawalny osobny podsystem ze zdrowiem, uzbrojeniem i przeciwnikami. [S2] [S13]

W rolnictwie „wrogowie” mają odrębne postaci systemowe: wrony mogą zabrać rośliny, chwasty niszczyć infrastrukturę, a burze wprowadzać ryzyko piorunów. Wymaga to ochrony i zarządzania gospodarstwem, niekoniecznie aktywnego pojedynku. [S3] [S15] [S22]

## 3.19. Przykład pełnej sekwencji — zgodnie z działaniem gry

*Przykład zwykłego dnia przy uprawie warzyw, nie gotowa instrukcja optymalizacji:*

1. 6:00: gracz budzi się i widzi prognozę/kalendarz.
2. W słoneczny dzień podlewa pola nieobsługiwane przez zraszacze; podczas deszczu ziemia zewnętrzna jest nawadniana przez pogodę.
3. W szklarni sprawdza gotowość roślin wielokrotnego zbioru, niezależnych od pory roku.
4. W domu podlewa wybrane *Garden Pots*; na nie nie działa zewnętrzny deszcz ani zraszacze.
5. Zbiera gotowe plony; część trafia do skrzynki wysyłkowej, część do skrzyni magazynowej albo urządzeń przetwórczych.
6. W godzinach otwarcia sklepu kupuje nasiona odpowiednie do sezonu albo oddaje materiały do ulepszenia narzędzia.
7. Resztę dnia spędza na budowaniu, relacjach, zbieractwie lub eksploracji.
8. Wraca do łóżka przed 2:00; po śnie gra rozlicza sprzedaż, wzrost upraw oraz inne dzienne procesy. [S8] [S17] [S18] [S24]

**Główne źródła rozdziału:** [S1]–[S28].

---

# 4. Sprout Valley

## 4.1. Założenie, klimat i zakres świata

*Sprout Valley* to kameralny symulator rolniczy z perspektywy z góry, opracowany przez Vadzima Liakhovicha. Bohaterem jest **Nico**, antropomorficzny kot, który opuszcza miasto, aby mieszkać na wyspie i prowadzić ogród. Główne czynności obejmują uprawę, pozyskiwanie zasobów, łowienie ryb, przygotowywanie posiłków, dekorowanie oraz odwiedzanie innych wysp. Stylistyka wykorzystuje małe, wyraźne sprite'y i nasycone, przyjazne kolory. Gra zadebiutowała 8 września 2023 roku; późniejsze dodatki istotnie rozszerzyły jej zawartość. [P1] [P2]

W przeciwieństwie do *Stardew Valley* podstawowa struktura świata **nie polega na stałej, dużej mapie farmy połączonej z rozbudowanym miasteczkiem ulicami**. Nico rozpoczyna na własnej wyspie. Kolejne wyspy są celami podróży łodzią, a ich układy i zasoby mogą być generowane proceduralnie. Sklep i część usług obsługiwana jest zdalnie. [P1] [P2] [P3]

## 4.2. Poruszanie, kontakt z otoczeniem i narzędzia

Postać chodzi po planszy w czterech głównych kierunkach. Narzędzia wykorzystuje na polu albo obiekcie sąsiadującym z postacią. Działania rolnicze wymagają odpowiedniego sprzętu: motyka przygotowuje ziemię, konewka nawadnia, siekiera zbiera drewno z drzew, kilof rozbija skały, a wędka służy do połowów. Osobny system pozwala podnosić znalezione zasoby, przenosić wyposażenie i umieszczać wykonane przedmioty na mapie. [P1] [P4] [P5]

Starsze opracowania pokazują dwa sposoby wykonywania pracy narzędziem: **zwykłą czynność** oraz odblokowywaną w miarę podnoszenia umiejętności **czynność specjalną**, często obsługującą większy obszar lub oferującą dodatkowy efekt. To ulepszenie działania narzędzia wynikające z rozwoju umiejętności, niekoniecznie z wymiany wizualnego modelu przedmiotu. Starsze wersje nie muszą mieć takiego samego interfejsu jak obecne wydania. [P4] [P5]

## 4.3. Dzień, sen i stamina

W *Sprout Valley* występuje **cykl dnia i nocy** oraz **stamina**. Używanie wielu narzędzi zużywa wytrzymałość, a odpoczynek i jedzenie pozwalają ją uzupełnić. Dzień można zakończyć we własnym domu, korzystając z łóżka. Sen jest istotnym punktem przejścia: oznacza nadejście kolejnego dnia, aktualizacje gospodarstwa i realizację określonych procesów gospodarczych. [P2] [P3] [P5]

System ten różni się zarówno od *Stardew Valley*, gdzie liczą się stale upływający zegar i energia, jak i od *Littlewood*, gdzie wykonywanie akcji jest głównym mechanizmem przesuwania pory dnia. W *Sprout Valley* również **nie ma nieograniczonej pracy bez kosztu**. Według starszych pomiarów fanowskich zwykłe użycie motyki do uprawienia pola kosztowało 1 jednostkę staminy, uderzenie siekierą lub kilofem — 2, a pojedyncze podlewanie — około 0,6. Są to **dane historyczne z poradnika z 2024 r.**, nie aktualna specyfikacja wszystkich wersji. [P5]

Jedzenie jest zarazem plonem, potencjalnym towarem i źródłem odzyskiwania staminy. Część owoców, ryb oraz dań można spożyć; niektóre produkty nie przywracają energii albo nie nadają się do bezpośredniego jedzenia. W poradniku przykładowo surowa marchew przywraca 5 punktów staminy, a pomidor — 8. Nie można zatem zakładać, że cena rynkowa rośliny jest proporcjonalna do jej wartości jako pożywienia. [P5]

## 4.4. Pogoda i jej konsekwencje

Świat ma pogodę zmienną między dniami, m.in. **dni deszczowe, mgłę i burze**. Występują również specjalne oznaczenia kalendarza, związane np. z większą produkcją miodu czy obniżką cen w sklepie. Wskazówki pogodowe mają znaczenie dla organizacji prac, bo uprawy wymagają odpowiedniej wilgotności. [P1] [P5]

**Deszcz może nawodnić pola na zewnątrz**, ale nie jest mechanicznym odpowiednikiem automatycznego podlewania całego wnętrza domu; dostępne źródła nie potwierdzają ogólnej reguły obejmującej wszystkie dekoracje i ewentualne doniczki. Konieczne jest rozróżnienie otwartego gruntu od dekoracyjnych obiektów. Nie należy też przyjmować, że każda burza musi niszczyć rośliny: taki skutek wymagałby osobnego potwierdzenia. [P1] [P5]

## 4.5. Przygotowanie gleby, sadzenie, wzrost i zbiór

Podstawowa sekwencja rolnicza przebiega w następujący sposób:

1. Gracz wybiera fragment gruntu, który nadaje się do uprawy.
2. Używa **motyki**, zmieniając stan powierzchni na uprawioną.
3. Wybiera nasiona z ekwipunku i sadzi je na odpowiednim polu.
4. **Podlewa** ziemię, jeżeli nie została już nawodniona przez pogodę lub urządzenie.
5. Upływ kolejnych dni i spełnianie warunków wilgotności prowadzą roślinę przez etapy rozwoju.
6. Gotowy plon zostaje zebrany i trafia do ekwipunku; później może być zjedzony, sprzedany, przerobiony lub wykorzystany w zadaniu. [P1] [P4] [P5]

Tempo wzrostu jest wyrażane w dniach. Fanowskie zestawienie podkreśla, że podawane czasy zakładają **podlewanie każdego dnia**. Brak podlewania może spowolnić proces względem tabeli, stąd nie należy traktować liczby dni jako bezwarunkowego licznika uruchomionego w momencie wysiewu. [P5]

### 4.5.1. Przykładowe warzywa, plony i kwiaty

Poniższa tabela odtwarza **przykładowe wartości z poradnika społecznościowego aktualizowanego w lutym 2024 r.** Liczby pokazują działanie ówczesnej gospodarki, ale po zmianach gry mogą odbiegać od aktualnych. Jednostką ceny jest waluta wewnętrzna gry; wszystkie czasy wzrostu zakładają regularne nawadnianie. [P5]

| Roślina | Cena nasion | Cena sprzedaży pojedynczego plonu | Wzrost: dni | Uwagi |
|---|---:|---:|---:|---|
| *Carrot* — marchew | 10 | 16 | 4 | tania uprawa początkowa |
| *Wheat* — pszenica | 10 | 16 | 5 | wykorzystywana również w przetwórstwie |
| *Beet* — burak | 18 | 32 | 6 | nasiona pojawiają się w późniejszej ofercie |
| *Bell Pepper* — papryka | 40 | 72 | 6 | produkt do gotowania |
| *Green Bean* — fasola | 48 | 84 | 7 | plon początkowy w starszym katalogu |
| *Cauliflower* — kalafior | 40 | 80 | 12 | dłuższe oczekiwanie na zbiór |
| *Tomato* — pomidor | 35 | 64 | 10 | surowiec do zupy pomidorowej |
| *Pineapple* — ananas | 85 | 144 | 9 | drogie nasiona, wysoka cena plonu |
| *Sunflower* — słonecznik | 40 | 72 | 7 | produkt może być przetwarzany na olej |
| *Red Flower* — czerwony kwiat | 24 | 44 | 8 | kwiat występujący w systemie upraw |
| *Blue Tulip* — niebieski tulipan | 15 | 28 | 6 | dekoracyjny gatunek z ekonomiczną wartością |
| *Dandelion* — mniszek | 12 | 24 | 4 | roślina o krótkim cyklu |

Dokumentacja społecznościowa wylicza znacznie więcej gatunków: ziemniaki, kukurydzę, bakłażany, czosnek, dynie, arbuz, ogórki, rzodkiewniki, różne kamelie i tulipany, lilie, herbatę czy rumianek. **Różnorodność nie ogranicza się do klasycznych warzyw**; w katalogu dostępne są także kwiaty, zioła i rośliny techniczne. Nie wszystkie mają kompletną cenę lub czas wzrostu w publicznym zestawieniu, więc brakujących liczb nie uzupełniono domysłami. [P5]

### 4.5.2. Drzewa i krzewy owocowe

Oprócz roślin rosnących na pojedynczej grządce gra posiada **drzewa i krzewy owocowe**. Znane przykłady to jabłonie, pomarańcze, brzoskwinie i grusze oraz krzewy truskawek, borówek i jeżyn. W starszym katalogu nasiona/rośliny jabłoni kosztowały 300, a pomarańczy 400 jednostek waluty; z czasem odblokowywano je w sklepie. Część krzewów i drzew pozwala na kolejne zbiory, bez powrotu do kosztu sadzonki po każdym pojedynczym owocu. [P5]

Drzewa wymagają odpowiedniej przestrzeni i dojrzewają na innej skali niż wiele warzyw. Ich rola gospodarcza polega na inwestycji w trwałe źródło owoców, podczas gdy rośliny jednorazowego zbioru częściej uruchamiają cykl: zakup nasion → wzrost → zbiór → ponowny zakup lub wysiew.

## 4.6. Konewka, pojemność i większy obszar pracy

Konewka jest odrębnym narzędziem o **ograniczonej zawartości wody**. Trzeba ją napełniać przed dalszym podlewaniem. Według pomiarów z wersji opisanej w 2024 r. bazowa konewka podlewała około **17 pojedynczych pól** na jedno napełnienie, przy zwykłym sposobie pracy. Autor poradnika zaznacza, że nie testował w takim samym stopniu ulepszonych czynności specjalnych i ich kosztu energetycznego. [P5]

Rozwój umiejętności może zwiększać efektywność prac rolniczych i narzędzi. Warto odróżniać trzy własności: ilość wody mieszczącą się w konewce, liczbę pól objętych pojedynczym użyciem oraz koszt staminy. Jedna z nich może się zmienić bez zmiany pozostałych. [P4] [P5]

## 4.7. Zraszacze, strachy na wróble i sprzęt ogrodniczy

W dostępnych katalogach craftingu występują m.in. **Sprinkler**, warianty urządzeń nawadniających oraz **Scarecrow** i *Spooky Scarecrow*. Są one obiektami konstruowanymi lub odblokowywanymi w późniejszym etapie; nie należą do tego samego systemu co noszona w ręku konewka. Gracze opisują zraszacze jako urządzenia rozpoczynające pracę **następnego ranka po ustawieniu**, jeśli obok rosną uprawy; różne warianty mogą mieć inny zasięg. [P5] [P6] [P9]

Przykładowe przepisy z poradnika z 2024 r.:

| Obiekt | Materiały w starszym poradniku | Rola ogólna |
|---|---|---|
| *Sprinkler* | 5 Wood, 2 Plank, 3 Dust | automatyzacja nawadniania |
| *Scarecrow* | 1 Pumpkin, 1 Stick, 5 Fiber | obiekt w formie stracha na wróble; szczegółowego działania ochronnego nie potwierdzono |

**Granica ustaleń:** znalezione źródła pozwalają potwierdzić istnienie obiektów i podać starsze receptury, ale **nie pozwalają bezpiecznie przypisać wszystkim ich wersjom dokładnego promienia działania ani prawdopodobieństwa odstraszania**. W relacjach graczy istoty pojawiające się na farmie bywają opisywane jako ozdobne, nieniszczące upraw; dlatego nie ma wystarczającej podstawy, by uznać, że strach na wróble chroni przed rzeczywistą mechaniką niszczenia pól w taki sam sposób jak w *Stardew Valley*. [P5] [P10]

## 4.8. Ekwipunek, składowanie, transport i ograniczenia objętości

Zebrane przedmioty trafiają do **ekwipunku**. Przed wydaniem *Friends Forever* ograniczona liczba slotów i częste podróże do skrzyni były istotną częścią gospodarowania zasobami. W ofercie Ozlo pojawiały się ulepszenia typu *Backpack Expansion* i *Chest Expansion*, które zwiększały pojemność noszonych rzeczy i magazynowania. [P2] [P5]

Ekwipunek ma znaczenie także przy eksploracji innych wysp: miejsce zajmują narzędzia, materiał podróżny, zebrane surowce i plony. Pełne kieszenie zmuszają gracza do powrotu lub ograniczenia zbiorów. Skrzynie umożliwiają fizyczne oddzielenie rzeczy zabieranych w drogę od zapasów na farmie. [P2] [P3]

**Duża zmiana w rozszerzeniu *Friends Forever*:** producent informował o przebudowie interfejsu przedmiotów, **600 slotach** i operacjach zbiorczych (*bulk actions*), np. szybkim przenoszeniu, wyrzucaniu i sadzeniu. To rozwiązanie należy przypisywać **wydaniu po rozszerzeniu**, a nie pierwotnej grze z 2023 r. [P7] [P8]

## 4.9. Sklep Ozlo, korespondencja i odblokowywanie ofert

W podstawowym modelu handlowym gracz utrzymuje kontakt z **Ozlo**. Zakup nasion i przedmiotów odbywa się przez katalog/księgę zakupową, a sprzedaż przez odpowiednie przekazanie przesyłki. Przychód i dostarczone zamówienia są rozliczane w powiązaniu z przejściem do kolejnego dnia. Nie jest to tożsamy model z wejściem do tradycyjnego sklepu w mieście i prowadzeniem transakcji przy ladzie. [P2] [P3] [P5]

**Nowe rodzaje nasion i sprzętu są stopniowo udostępniane w katalogu.** Jeden z kluczy progresji w starszej wersji gry to liczba dni/dostaw, w których faktycznie wysłano towar. Poradnik nazywa ten próg *Ship to Unlock*. Przykładowo: według tabeli buraki pojawiały się po 30 wysyłkach, papryka po 15, jabłonie po 30, pomarańcze po 50, a ulepszenie plecaka po 15. Zasada może premiować regularne sprzedawanie choćby jednego przedmiotu zamiast jednorazowego wysłania wielkiej partii. To są **wartości historyczne i orientacyjne** z konkretnej wersji. [P5]

W ekonomii występują różnice między: ceną nasion, wartością plonu, kosztem budowy sprzętu, zyskiem ze sprzedaży surowca i zyskiem po przetworzeniu. Przykład: marchew kupowana za 10 i sprzedawana za 16 daje nominalną różnicę 6 za zbiór, lecz faktyczna opłacalność zależy też od liczby dni wzrostu, staminy i zajętego pola. [P5]

## 4.10. Podróże między wyspami i generowane obszary

Nico może wyruszyć łodzią na inne wyspy. Lokacje eksploracyjne różnią się zasobami, krajobrazem i roślinnością, a gra korzysta z proceduralnej generacji. Podróż zwykle wymaga przedmiotu **Travel Supplies** — zapasów podróżnych, które można kupić lub wytworzyć po odblokowaniu odpowiedniej receptury/poziomu. Pierwsze warianty tego systemu opisano w aktualizacji v0.3.0. [P1] [P2] [P4]

Celem wypraw są m.in. surowce, rośliny, drewno i materiały nieobecne albo ograniczone na głównej wyspie. Po powrocie gracz wykorzystuje zdobycze do rozwoju własnej farmy. Podróż stanowi osobny cykl: przygotowanie zapasów → wyprawa → zbiory → powrót → crafting lub sprzedaż. [P3] [P4]

Oficjalny opis Steam wymienia różne **biomy**, w tym **cztery zasadnicze środowiska** eksploracji. W późniejszych wersjach i pakietach dostępność niektórych biotopów lub zamieszkujących je postaci może zależeć od posiadanych rozszerzeń. [P1] [P8]

## 4.11. Crafting, przetwórstwo i gotowanie

Gra zawiera wytwarzanie materiałów, narzędzi, maszyn, mebli i dekoracji. Przykłady materiałów to drewno, deski, patyki, kamień, włókno i surowce pozyskiwane podczas wypraw. Surowiec może być przeznaczony do sprzedaży, użycia w kolejnym przepisie albo wstawienia gotowego przedmiotu do świata. [P1] [P5]

**Gotowanie** przekształca jadalne składniki w potrawy, użyteczne przede wszystkim do odzyskiwania staminy i jako towary. W starszych instrukcjach podstawowym urządzeniem jest **Brick Oven**, czyli piec do przygotowywania posiłków. Oto przykłady udokumentowanych konwersji: [P5] [P6]

| Surowiec | Gotowy produkt / potrawa |
|---|---|
| Marchew (*Carrot*) | *Carrot Soup* |
| Pomidor (*Tomato*) | *Tomato Soup* |
| Kukurydza (*Corn*) | *Popcorn* |
| Papryka (*Bell Pepper*) | *Baked Pepper* |
| Bakłażan (*Eggplant*) | *Baked Eggplant* |
| Dynia (*Pumpkin*) | *Pumpkin Soup* |
| Pszenica (*Wheat*) | *Bread* |
| Jabłko (*Apple*) | *Apple Pie* |
| Borówka (*Blueberry*) | *Blueberry Jam* |

Powyższe nie są pełnymi recepturami z liczbą składników; ilustrują relację **surowiec → produkt przetworzony** na podstawie tabel przetwórstwa. W późniejszych wydaniach mogą występować inne urządzenia i dodatkowe kombinacje. [P5]

## 4.12. Dom, meble i dekorowanie

Początkowy dom daje bohaterowi miejsce do spania i zarządzania podstawowymi elementami gospodarstwa. W miarę postępu pojawiają się ulepszenia i warianty domu. Wyposażenie wnętrza oraz otoczenia można personalizować przez stawianie mebli i elementów ozdobnych. [P1] [P3] [P5]

Rozbudowany dom **zajmuje fizyczne miejsce** na wyspie. Starsze relacje graczy zwracały uwagę, że ulepszenie może wymagać uprzedniego uporządkowania sąsiedniego terenu; nie jest wyłącznie abstrakcyjnym zwiększeniem liczby slotów w menu. Katalog uwzględniał np. *Cozy House* i późniejsze ulepszenia, określane w starych zestawieniach m.in. jako *Dreamlock*. [P5] [P6]

**Ważne rozróżnienie:** fakt, że w *Sprout Valley* da się ustawiać dekoracje i uprawiać wiele rodzajów kwiatów, **nie potwierdza istnienia takiej samej, pełnej mechaniki uprawy roślin ozdobnych w doniczkach wewnątrz domu jak w *Stardew Valley*.** Podobnie dostępne źródła nie wskazują na odpowiednik rozbudowywanej szklarni z liczbą miejsc 25/100, jaki występuje w nowszym *Fields of Mistria*. Tych funkcji nie należy dopisywać jako potwierdzonych. [P1] [P2] [P5]

## 4.13. Umiejętności i rozwój postaci

W aktualizacji v0.3.0 producent opisał system **pięciu głównych umiejętności**, rozwijanych w związku z wykonywanymi czynnościami. Postęp daje poziomy, nowe przepisy i ulepszone sposoby korzystania z narzędzi. Przykładowo rolnictwo może odblokować dostęp do przedmiotów podróżnych, a wyszkolenie w pracy z narzędziem — jego specjalną czynność. [P4]

Jest to progresja **zdolności do wykonywania pracy**, a nie tylko wzrost przychodów. Wraz z nią rozwija się również katalog zakupowy i repertuar możliwych obiektów. W różnych wersjach część odblokowań przeniesiono lub uzupełniono dodatkowymi zadaniami, stąd nie da się traktować dawnej tabeli poradnikowej jako kompletnego drzewa zdolności aktualnej edycji. [P4] [P5]

## 4.14. Mieszkańcy i postacie w podstawowej wersji

W starszej wersji świata istotną rolę mają **Ozlo**, związany z handlem, oraz **Luna**, postać obecna w otoczeniu Nico. Nie występuje wówczas tradycyjna, duża społeczność osadzona w miasteczku na wzór Pelican Town. Relacje społeczne i dialogi były prostsze, a centrum aktywności pozostawała farma i wyprawy. [P2] [P3]

Zestawienie społecznościowe odnotowuje m.in. ograniczenia częstotliwości rozmów z Luną i przekazywania jej prezentów; traktować je należy jako szczegóły dawnej wersji, nie bezwarunkową regułę dla obecnych aktualizacji. [P5]

## 4.15. Rozszerzenie *Friends Forever*: nowe NPC, zadania, ekwipunek

Rozszerzenie **Friends Forever**, zaprezentowane przez twórców i wydawców w 2025 r., rozszerzyło przede wszystkim warstwę społeczną i wygodę obsługi: [P7] [P8]

- **Dziesięć nowych postaci niezależnych** o odrębnych historiach, biotopach i zadaniach.
- **System zadań związanych z NPC**, nagród i bardziej rozbudowanych interakcji.
- **Przebudowany ekwipunek** z deklarowaną liczbą **600 slotów** i operacjami zbiorczymi.
- Dodatkową zawartość związaną z eksploracją, przedmiotami i odblokowywaniem aktywności; obecność części postaci może wymagać innych rozszerzeń.

Przykładowe nowe postacie wymieniane w materiałach wydawcy to **Hazel** i **Odin**. Rozszerzenie nie zmienia jednak retroaktywnie konstrukcji wersji pierwotnej: wzmianka o „10 nowych NPC” nie oznacza, że tylu mieszkańców funkcjonowało w bazowej grze w dniu premiery. [P7] [P8]

## 4.16. Dodatkowe aktywności

Poza zasiewami można łowić ryby, ścinać drzewa, wydobywać surowce, przeszukiwać wyspy, zdobywać przedmioty kolekcjonerskie i wytwarzać dekoracje. Ważnym źródłem wartości mechanicznej jest **powtarzalna aktywność na małej przestrzeni**, a nie rozbudowany wielopiętrowy system kopalni, walki i fabuły, jak w większych symulatorach. [P1] [P2] [P3]

**Zwierzęta gospodarskie nie są tylko zapowiedzią.** Twórca oficjalnie opisał aktualizację dodającą **krowy i premie od zwierząt domowych**. Według dziennika aktualizacji po około 15. dniu Ozlo udostępnia możliwość kupienia **Cow Barn** i **Cheese Press**; jedna obora mieści maksymalnie **dwie krowy**. Oznacza to istniejącą pętlę hodowlaną powiązaną z budynkiem, zasobami i przetwórstwem mleka, ale nie dowodzi, że każdy system rozmnażania czy hodowli ze *Stardew Valley* działa tu tak samo. [P11]

W nowszym opisie producenta występuje także **łączenie i przekształcanie kolejnych fragmentów lądu** w większe gospodarstwo. Dostępne były również **przedmioty do zmiany ukształtowania działki**, a w wersjach mobilnych aktualizacja historyczna wskazywała wprost *Terraforming items and craft recipes*. Nie jest to jednak tożsama implementacja z edytorem wysokości terenu w *Littlewood*. [P1] [P12]

Kalendarz i zawartość sezonowa mogą zmieniać ofertę i zestaw dostępnych aktywności. Zwierzęta i aktualizacje rozbudowujące świat należy odróżniać od wersji premierowej z 2023 r. [P1] [P11]

## 4.17. Przykład zwykłego dnia — opis funkcjonującej mechaniki

1. Nico budzi się w domu i wybiera przedmioty z ekwipunku.
2. Uprawia kilka wolnych pól motyką, sadzi marchew i pomidory oraz podlewa grządki, o ile nie zrobiła tego pogoda.
3. Zbiera dojrzałe produkty, kontroluje wodę w konewce i pozostałą staminę.
4. Część plonów odkłada do gotowania, część przeznacza do sprzedaży przez system zamówień/wysyłki.
5. Przygotowuje *Travel Supplies* i płynie na wygenerowaną wyspę po drewno, kamień, ryby lub rośliny.
6. Wraca, korzysta ze skrzyni i urządzeń do craftingu, a odzyskiwaną z jedzenia staminę może przeznaczyć na kolejne prace.
7. Korzysta z łóżka; kolejny dzień przynosi następne etapy wzrostu, nowe możliwości handlowe i kolejne czynności. [P1] [P3] [P4] [P5]

**Główne źródła rozdziału:** [P1]–[P12].

---

# 5. Fields of Mistria

## 5.1. Założenie, historia świata i stan wersji

*Fields of Mistria* to symulator rolnictwa i życia społeczności z perspektywy z góry. Postać gracza otrzymuje zaniedbane gospodarstwo w pobliżu osady **Mistria**, która odbudowuje się po katastrofie. Początkowy cel fabularny łączy prowadzenie farmy z pomaganiem sąsiadom w naprawie miejskiej infrastruktury, rozwijaniem sklepów i ożywianiem lokalnej gospodarki. Miasteczko ma własny rozkład budynków i tras; mieszkańcy prowadzą swoje zajęcia, odwiedzają lokale i uczestniczą w wydarzeniach. [M1] [M2]

Gra została wydana w Early Access, a **wersja 1.0 ukazała się 5 sierpnia 2026 r.** Zawartość pełnego wydania jest istotnie szersza od przewodników z 2024 i 2025 r.; obejmuje m.in. dalszy ciąg historii, rozszerzoną progresję miasta i dodatkowe możliwości personalizacji. Dlatego opis szklarni, najwyższych poziomów narzędzi, małżeństw i maksymalnych etapów rozbudowy odnosi się do stanu nowszego niż najwcześniejsze poradniki. [M3] [M4]

## 5.2. Układ świata i poruszanie postacią

Gracz swobodnie przemierza farmę i osadę, wchodzi do domów i sklepów, odwiedza plażę, lasy, kopalnie oraz inne odblokowywane obszary. Świat składa się z połączonych ekranów/obszarów, a wnętrza budynków stanowią odrębne przestrzenie. Mapa wskazuje położenie ważnych miejsc, a interakcje z NPC i otoczeniem odbywają się z niewielkiej odległości. [M1] [M2]

**Farmę można porządkować fizycznie**: usuwać kamienie i pnie, ścinać drzewa, przestawiać wyposażenie, wyznaczać grządki, prowadzić ścieżki i wznosić budynki. Stawiane obiekty nie istnieją tylko w menu; zajmują teren i wpływają na możliwe trasy ruchu oraz rozmieszczenie upraw. [M1] [M5]

Do aktywności służą wyspecjalizowane narzędzia, m.in. motyka (*Hoe*), konewka (*Watering Can*), siekiera (*Axe*), kilof (*Pickaxe*), łopata (*Shovel*), wędka (*Fishing Rod*) i siatka na owady (*Bug Net*). Poszczególne narzędzia mają inne efekty: łopata może zmieniać pokrycie gruntu, motyka przygotowuje pole, a konewka nawadnia rośliny. [M6]

## 5.3. Doba, zegar, stamina i zasypianie

W przeciwieństwie do *Littlewood* w *Fields of Mistria* **zegar gry przesuwa się sam**. Standardowy dzień zaczyna się około **6:00 rano**, a po **2:00 w nocy** postać może zemdleć, jeżeli nie odpocznie. Zaspanie wpływa na kolejną dobę i stan bohatera; z tego powodu planowanie trasy między farmą a miastem jest integralną częścią rozgrywki. [M7] [M8]

Według wiki standardowy dzień trwa około **12 minut 30 sekund rzeczywistych**; od aktualizacji v0.13.0 istnieje opcja *Day Time Speed* z trzema ustawieniami: *Standard*, *Longer* i *Longest*. W przybliżeniu wydłużają one czas dostępny na działania, ale **żaden z tych trybów nie usuwa upływającego zegara**. Zmiana zaczyna obowiązywać po kolejnym śnie. Dokładne pomiary długości dnia z różnych publikacji nie są idealnie zgodne; pewna jest zasada istnienia trzech poziomów prędkości. [M7]

Równolegle działa **stamina**: określone czynności, szczególnie praca narzędziami, kosztują energię. Bohater może korzystać z posiłków, udogodnień i premii, a także odpoczywać. Czas i stamina są dwoma oddzielnymi ograniczeniami: nawet posiadanie zapasu energii nie zatrzymuje zegara; nawet dużo czasu w ciągu dnia nie eliminuje kosztów pracy. [M8] [M9]

## 5.4. Sezony, kalendarz i pogoda

Występują **cztery pory roku**: wiosna, lato, jesień i zima. Zmienność sezonowa wpływa na dostępne nasiona, wygląd otoczenia, roślinność do zebrania, część połowów oraz święta i wydarzenia. Każdy sezon obejmuje kolejne dni w kalendarzu, a znaczniki urodzin i imprez pomagają planować wizyty u NPC. [M10] [M11]

Pogoda może obejmować pogodny dzień, **deszcz, burzę, śnieg i inne warunki**. Wilgotność grządek wystawionych na deszcz jest nawadniana przez pogodę, dzięki czemu nie zawsze trzeba korzystać z konewki. Zmiany pogody modyfikują również atmosferę i elementy eksploracji. [M12]

**Różnica między polem a budynkiem:** uprawa we wnętrzu szklarni nie jest automatycznie równoważna grządce pod gołym niebem. Specjalne budynki mają własny reżim sezonowy i sposób utrzymywania roślin; ich podstawową korzyścią jest uprawa niezależna od sezonu. Sam deszcz na zewnątrz nie stanowi wystarczającego powodu, by uznać, że wszystkie rośliny pod dachem dostały wodę. [M13] [M14]

## 5.5. Podstawowa mechanika rolnictwa

**Cykl uprawy** ma rozpoznawalne etapy:

1. Gracz oczyszcza teren z kamieni, gałęzi i trawy, a w razie potrzeby przygotowuje grunt łopatą.
2. Używa motyki na powierzchni nadającej się do obsiania.
3. Umieszcza nasiona wybranego gatunku na wolnym polu.
4. Zapewnia wilgotność gleby konewką, deszczem, magią lub urządzeniem automatycznym.
5. Po odpowiedniej liczbie dni roślina dojrzewa; kolejne dni bez spełnienia wymogów mogą nie dawać oczekiwanego progresu.
6. Zbiera gotowy produkt i decyduje, czy zasiać następny, przechować towar, ugotować potrawę czy go sprzedać. [M14]

W świecie występują **rośliny jednorazowego zbioru** i **rośliny wielokrotnego plonowania**. W pierwszym przypadku po zbiorze grządka jest wolna na kolejne nasiono; w drugim dojrzała roślina pozostaje na polu i odlicza okres do następnego zbioru. Ujemną konsekwencją niewłaściwego terminu jest ryzyko, że roślina zewnętrzna nie zdąży wydać plonu przed zmianą sezonu. [M14] [M15]

### 5.5.1. Przykłady roślin według funkcji

Nazwy roślin i ich przynależność sezonowa stanowią trzon systemu: [M15] [M10]

| Grupa | Przykłady spotykane w grze | Odmienność mechaniczna |
|---|---|---|
| Szybsze warzywa sezonowe | rzepa (*Turnip*), marchew (*Carrot*) | relatywnie krótki cykl sprzedaży |
| Warzywa o dłuższym wzroście | kapusta (*Cabbage*), dynia (*Pumpkin*) | większy koszt czekania na plon |
| Rośliny wielokrotnie plonujące | truskawki (*Strawberry*), herbata (*Tea*) | zbiór nie kończy całego życia rośliny |
| Kwiaty i zioła | odmiany kwiatów i roślin zbierackich | źródło podarków, składników lub kolekcji |
| Drzewa owocowe | różne sezonowe sadzonki drzew | trwała inwestycja wymagająca przestrzeni |
| Składniki kuchenne | zboża, warzywa, owoce i zioła | wykorzystanie w przepisach i zamówieniach |

Przykładowo wiki wymienia **Cabbage** jako uprawę wiosenną o dłuższym okresie wzrostu, a **Turnip** jako jedną z podstawowych opcji startowych. Dokładne ceny i czasy zależą od gatunku i zmian w aktualizacjach, dlatego w tym dokumencie celowo nie przedstawiono jednej pozornie kompletnej tabeli wszystkich upraw. [M15]

### 5.5.2. Płody rolne a zebrane rośliny dzikie

*Crop* oznacza zwykle roślinę sadzoną z nasion na przygotowanym stanowisku. *Forageable* to przedmiot roślinny, który można znaleźć lub zebrać podczas eksploracji. Obie kategorie mogą trafiać do ekwipunku, gotowania, muzeum albo sklepu, ale nie mają identycznych reguł ponownego wyrastania czy podlewania. [M14] [M15]

## 5.6. Narzędzia: stopnie jakości i powiększanie powierzchni roboczej

System narzędzi jest jednym z najlepiej udokumentowanych przykładów **progresji przez redukcję liczby potrzebnych interakcji**. Wraz z rozwojem kowalstwa gracz wytwarza coraz lepsze wersje urządzeń. Narzędzia rolnicze obsługują po **naładowaniu/przytrzymaniu przycisku** większy obszar gruntu. [M6]

| Poziom | Materiał / nazwa | Maksymalny obszar naładowanego użycia motyki lub konewki | Liczba pól |
|---|---|---|---:|
| Startowy | *Worn* | pojedyncze pole | 1 |
| I | *Copper* | 1 × 3 | 3 |
| II | *Iron* | 3 × 3 | 9 |
| III | *Silver* | 3 × 6 | 18 |
| IV | *Gold* | 6 × 6 | 36 |
| V | *Mistril* | 6 × 9 | 54 |

Dane pochodzą z katalogu narzędzi wiki i opisują przede wszystkim **maksymalny wzór naładowania**; pojedyncze stuknięcie wciąż może wykonać zwykłą interakcję. Ładowanie może wymagać określonego czasu przytrzymania. [M6]

Wyższe poziomy powstają w systemie **Blacksmithing**, po osiągnięciu wymaganej umiejętności i zgromadzeniu odpowiednich sztabek metalu. Katalog opisuje m.in. **4 sztabki** odpowiedniego materiału do wykonania jednego egzemplarza danego metalowego narzędzia; receptury mogą wymagać też czasu pracy i innych warunków. [M6]

Narzędzia mają ponadto zróżnicowane skutki poza rolnictwem. Lepszy kilof szybciej niszczy skały i pozwala pracować przy trudniejszych przeszkodach. Lepsza siekiera może pokonać większy pień i zapewnić dostęp do twardszego drewna (*Hardwood*). Wędki mają z kolei inne parametry zasięgu lub jakości połowu niż konewka. [M6]

**Precyzyjna różnica wobec Stardew Valley:** *Fields of Mistria* opiera te etapy przede wszystkim na **wykuwaniu kolejnego przedmiotu** w ramach kowalstwa, podczas gdy *Stardew Valley* posługuje się także oddaniem obecnego sprzętu kowalowi na czas trwania ulepszenia. [M6] [S5]

## 5.7. Nawadnianie automatyczne: Water Sprite Statues

Nowsza wersja gry zawiera mechanikę funkcjonalnie zbliżoną do zraszaczy. Nie są to jednak klasyczne hydrauliczne *Sprinklers* ze *Stardew Valley*, lecz **Water Sprite Statues**, czyli obiekty związane z magią i zasobem *Essence*. [M14] [M16]

| Urządzenie | Promień działania od statuy | Maksymalny obszar kwadratowy | Warunek pracy |
|---|---:|---|---|
| *Water Sprite Statue* | 2 pola | otoczenie 5 × 5 | umieszczony i działający *Essence Stone* |
| *Large Water Sprite Statue* | 3 pola | otoczenie 7 × 7 | umieszczony i działający *Essence Stone* |

Statua może codziennie podlewać pola znajdujące się w jej zasięgu, o ile ma aktywne zasilanie. **Nie wykonuje sadzenia, zbierania, sprzedaży ani samoczynnego powiększania pola.** Obiekt zajmuje miejsce na mapie; ustawienie kilku obiektów wymaga rozplanowania, aby ich zasięgi objęły odpowiednie grządki. [M16] [M17]

Podstawowy odpowiednik nawadniania pojawił się podczas rozwoju gry, natomiast wariant *Large* jest przypisany do późniejszej aktualizacji v0.15.0. Starsze poradniki z wczesnego Early Access mogą mówić, że w grze nie ma zraszaczy; w stosunku do stanu z 2026 r. jest to **nieaktualne uproszczenie**. [M16]

*Essence Stones* stanowią **zużywalne lub ograniczone czasowo zasilanie**, dlatego automatyzacja nie oznacza automatycznie „podlewania za darmo na zawsze”. Związane z tym koszty i długość działania różnych kamieni zależą od wariantu. [M17]

## 5.8. Rolnicza magia i zaklęcie Growth

Magia jest pełnoprawnym elementem świata. Jednym z jej zastosowań jest zaklęcie **Growth**, które może **natychmiast doprowadzić odpowiednie rośliny w bliskim zasięgu do kolejnego wymaganego stanu dojrzewania / gotowości**, zamiast czekać na zwykłą liczbę dni. Według wiki zaklęcie obejmuje niewielki obszar wokół postaci i zużywa **2 punkty many**. [M14] [M18]

To inna droga niż nawozy znane ze *Stardew Valley*. Tam *Speed-Gro* i *Deluxe Speed-Gro* zmieniają parametry wzrostu bez wydawania many, podczas gdy tutaj specyficzny efekt zapewnia **aktywne zaklęcie**, ograniczone pulą magiczną. [M14] [S14]

System magii jest również wykorzystywany w innych aktywnościach. Nie wszystkie prace na farmie zależą od zaklęć, lecz ich istnienie pozwala łączyć klasyczny cykl dnia i wzrostu z doraźnym przyspieszaniem prac. [M18]

## 5.9. Szklarnie w nowszej wersji gry

**Szklarnie istnieją w nowszym *Fields of Mistria*.** Ich funkcją jest uprawa roślin sezonowych **przez cały rok**, niezależnie od terminu obowiązującego na zwykłych zewnętrznych grządkach. Odblokowuje się je w związku z wątkiem **Upgrade the Carpenter's Shop**; po rozwoju zakładu stolarskiego można kupować odpowiednie plany budowy. [M13] [M19]

Najważniejsza cecha: istnieją **dwa rozmiary budynków** (z różnymi wariantami wyglądu), które mają fizycznie odmienne wnętrza i pojemności uprawne.

| Szklarnia | Powierzchnia przeznaczona do uprawy | Maksymalna liczba pól przed uwzględnieniem obiektów zajmujących miejsce |
|---|---|---:|
| *Small Greenhouse* | 5 × 5 | 25 |
| *Large Greenhouse* | 10 × 10 | 100 |

Jeżeli gracz ustawia w środku obiekt zajmujący pole, np. statuę nawadniającą, faktyczna liczba grządek może być mniejsza. Szklarnia nie jest wyłącznie graficznym dodatkiem do świata: wejście do niej przenosi do oddzielnego obszaru upraw o określonej siatce. [M13] [M19]

Budowa wymaga projektu (*Blueprint*), zapłaty w walucie *Tesserae* oraz zasobów budowlanych; wiki wymienia m.in. *Hardwood*, szkło (*Glass*) i *Refined Stone*. Wielkość, wygląd i koszt są związane z wybranym planem. [M13]

**Zastrzeżenie:** szklarnia jest systemem gospodarczo odrębnym od domu mieszkalnego. Możliwość umieszczenia mebla lub roślinnej dekoracji w domu nie oznacza, że ten mebel automatycznie liczy się jako pełnowartościowe pole rolne ze wszystkimi regułami szklarni.

## 5.10. Gospodarstwo: budynki, pojemność i aranżacja przestrzeni

Na farmie można ustawiać budynki i wyposażenie w granicach działki, zachowując wymaganą wolną powierzchnię. Do głównych typów należą budynki mieszkalne, **kurniki (*Coop*)**, **stodoły (*Barn*)**, szklarnie i infrastruktura rolnicza. Większe konstrukcje zajmują większy *footprint* na mapie i umożliwiają intensywniejsze wykorzystanie przestrzeni. [M5] [M13] [M20]

Kurniki i stodoły różnią się przeznaczeniem, pojemnością i zwierzętami, które mogą w nich mieszkać. Rozwój gospodarstwa oznacza zatem nie tylko zakup większej liczby przedmiotów, ale też zmianę **geometrii mapy**: trzeba zostawić przejścia, dostęp do wejść i miejsce dla roślin. [M20]

Dekorowanie obejmuje ustawianie płotów, nawierzchni, mebli plenerowych oraz rozmaitych ozdób. Poza estetyką występuje funkcja użytkowa: ścieżka wyznacza przejście, skrzynia zapewnia magazynowanie, a pole uprawne pozwala posadzić roślinę. [M5]

## 5.11. Dom: rozbudowa wnętrza, piętra i wyglądu

Dom gracza jest osobnym obszarem personalizacji i odpoczynku. Początkowo jego wnętrze jest stosunkowo skromne. Kolejne **Home Upgrades** są kupowane w związku z działalnością stolarza i odblokowaniami fabularnymi. Rozbudowa tworzy nowe przestrzenie użytkowe, a nie tylko zwiększa abstrakcyjną liczbę przedmiotów, które można posiadać. [M21]

Opisany w wiki system obejmuje dodatkowe pokoje boczne i następny poziom domu. Poszczególne pomieszczenia stanowią odrębne obszary dekorowania; niektóre mają rozmiar około **13 × 9 pól**. W pełnej wersji gry pojawia się również zaawansowana personalizacja **elewacji i stylu zewnętrznego domu**, związana z odpowiednim etapem rozbudowy. [M21] [M3]

Meble kupuje się, znajduje, wykonuje lub otrzymuje jako nagrody. Można je przestawiać, zmieniać charakter pomieszczeń i tworzyć strefy o różnym przeznaczeniu. Zapis obejmuje nie tylko zakup przedmiotu, ale i jego ustawienie w świecie. [M21]

## 5.12. Ekwipunek, sloty i skrzynie

Podstawowy ekwipunek postaci ma ograniczoną liczbę pól, a wraz z postępem można dokupywać **powiększenia torby**. Przykładowe znane etapy: [M22]

| Etap | Dostępna liczba pól plecaka | Mechanika zmiany |
|---|---:|---|
| Początek | 10 | podstawowe miejsce |
| *Basic Pouch* | 20 | dokupienie 10 pól, w wiki cena 1000t |
| *Bag Upgrade* | 30 | kolejne powiększenie o 10 pól |

Ten przykład pokazuje, dlaczego zbieranie wielu rodzajów plonów, ryb, minerałów i przedmiotów zadań wymaga zarządzania miejscem. **Nie jest to twierdzenie, że 30 pól to ostateczny limit każdej wersji gry** — jest to dokumentacja konkretnych pierwszych rozszerzeń. [M22]

**Skrzynie magazynowe** przenoszą część zapasów poza plecak. Zasoby są rozdzielane na przedmioty przy postaci i rzeczy odłożone na farmie; położenie skrzyni może mieć znaczenie dla szybkości wykonywania prac, mimo że nie wpływa na samą regułę wzrostu roślin. [M23]

## 5.13. System sprzedaży i Shipping Bin

Produkty można sprzedawać przez **Shipping Bin**, czyli pojemnik wysyłkowy. Gracz umieszcza w nim towar, a rozliczenie następuje wraz z rozpoczęciem kolejnego dnia. W podstawowym opisie pojedynczy pojemnik posiada **30 slotów** na przedmioty do wysłania. Kolejne pojemniki mogą działać osobno, zamiast tworzyć jeden nieskończony, współdzielony schowek. [M24]

Jest to mechanika **sprzedaży z opóźnioną wypłatą**. Towar w pojemniku nie jest jeszcze pieniądzem wydanym w sklepie w tej samej chwili; sprzedaż wymaga przejścia do kolejnego dnia lub właściwego rozliczenia. Z drugiej strony część lokalnych sklepów prowadzi handel bezpośredni i wystawia przedmioty zależne od sezonu lub postępu. [M24] [M25]

Walutą jest **Tesserae**, w materiałach oznaczana *t* lub *T*. Pieniądze służą do kupowania nasion, mebli, narzędzi, planów budynków i poszczególnych ulepszeń. Wartość plonu i cena nasion są rozdzielone, podobnie jak w innych grach rolniczych. [M25]

## 5.14. Sklep, nasiona i odblokowywanie zaopatrzenia

Główny **General Store** oferuje m.in. sezonowe nasiona, żywność i inne przedmioty. Zawartość zależy od obecnej pory roku i etapu rozwoju miasta. Nie wszystko jest dostępne od początku: remonty i zadania mogą rozszerzyć asortyment i dostęp do kolejnych usług. [M25]

W mieście funkcjonują też inne zakłady związane z kowalstwem, stolarką, handlem specjalistycznym i codziennym życiem mieszkańców. Wspomaganie odbudowy tych usług poprawia praktyczną dostępność narzędzi i budynków, ale równolegle stanowi osobny wątek fabularny. [M2] [M19]

W nowszych wersjach pojawiają się ponadto rozwiązania pozwalające uzyskać nasiona z produktów, np. **Seed Maker**. Taki proces przekłada posiadane plony na dalszą produkcję zamiast kupować wszystkie nasiona od nowa. Dokładna wydajność zależy od wariantu i nie została tu utożsamiona z recepturą Seed Maker ze *Stardew Valley*. [M14] [M25]

## 5.15. Gotowanie, rękodzieło, kowalstwo i inne profesje

Gra ma kilka ścieżek rzemiosła i pracy, powiązanych z odrębnymi aktywnościami:

- **Cooking:** przepisy wymagające warzyw, owoców, ryb i innych produktów; potrawy mogą dostarczać energii oraz być przedmiotami handlu lub upominkami.
- **Crafting / Woodcrafting:** wytwarzanie mebli, wyposażenia, płotów i dekoracji z materiałów.
- **Blacksmithing:** obrabianie metalu, tworzenie sztabek i produkcja lepszych narzędzi.
- **Farming:** produkcja i zbieranie roślin oraz związane z nimi premie.
- **Fishing i Bug Catching:** pozyskiwanie okazów z wody i owadów w różnych rejonach.
- **Mining i Combat:** eksploracja kopalni, zdobywanie rudy oraz walka z przeciwnikami w wyodrębnionych strefach. [M6] [M9] [M26]

Receptury często wymagają jednoczesnego spełnienia progu umiejętności i odpowiedniej liczby materiałów. Otwarta pętla ekonomiczna pozwala użyć tego samego plonu jako składnika potrawy, produktu sprzedawanego bez przerobu albo przedmiotu wymaganego w zadaniu. [M9] [M26]

## 5.16. Umiejętności, doświadczenie, Essence i premie

Postać rozwija umiejętności w wyniku związanych z nimi czynności: uprawianie pól rozwija *Farming*, kopanie rozwija *Mining*, gotowanie rozwija *Cooking*, a wykonywanie przedmiotów rozwija odpowiednią działalność rzemieślniczą. System obejmuje wiele dyscyplin, z osobnymi poziomami i odblokowaniami. [M9]

Oprócz poziomu umiejętności gra używa zasobu **Essence**. Gracz może przeznaczać go na **Skill Perks** dostępne przy sanktuarium **Caldarusa**. Premie wprowadzają modyfikacje reguł, nie tylko jednorazowe nagrody. W kontekście rolnictwa wiki opisuje np. szansę, że przy sadzeniu nasion wystąpi dodatkowy korzystny efekt, albo możliwość skrócenia niektórych faz wzrostu. [M9] [M27]

Zatem rozwój ma co najmniej trzy równoległe płaszczyzny:

1. **Poziom umiejętności**, wypracowywany działaniem.
2. **Dostęp do receptur, sprzętu i usług**, zależny od poziomów i warunków fabularnych.
3. **Perki za Essence**, zmieniające funkcjonowanie konkretnych aktywności.

Istnienie Essence w progresji i *Essence Stones* zasilających automatyczne podlewanie tworzy związek gospodarczy: ten sam rodzaj zasobu może mieć konkurencyjne zastosowania w rozwijaniu bohatera i urządzeniach na farmie. [M9] [M16] [M27]

## 5.17. Town Rank, Renown i odbudowa osady

Jedną z głównych osi progresji jest **Town Rank**, czyli ranga miasta, rosnąca dzięki punktom **Renown**. Gracz zdobywa je m.in. przez realizację zadań, oddawanie okazów do muzeum, rozwijanie gospodarki i inne aktywności ważne dla społeczności. Wzrost rangi przynosi nagrody i odblokowania. [M28]

W odróżnieniu od czysto prywatnych parametrów farmy ranga jest **miarą rozwoju całej społeczności**. Odbudowa sklepu lub infrastruktury miasta jest więc jednocześnie zadaniem fabularnym, aktywnością ekonomiczną i metodą wzmacniania długoterminowej progresji. W pełnej wersji 1.0 wprowadzono dalsze etapy i wydarzenia związane z najwyższymi rangami, w tym rangą określaną jako **Mistril**. [M3] [M28]

Rozbudowa miasta przebiega przez konkretne projekty i zlecenia. Projekty wymagają dostarczenia ustalonych zasobów lub zapłaty; po zakończeniu zmienia się dostępność usług, wygląd określonych miejsc albo możliwość realizacji kolejnych zadań. [M19] [M28]

## 5.18. NPC, rozkład dnia i życie towarzyskie

Mistria posiada rozbudowaną obsadę postaci. Mieszkańcy mają **harmonogramy**, miejsca zamieszkania, zainteresowania, ulubione prezenty, własne dialogi i relacje z innymi osobami. Gracz spotyka ich w domu, pracy, przy sklepach lub na wydarzeniach. Liczba dostępnych rozmów i wydarzeń zmienia się wraz z postępem relacji. [M2] [M29]

**Punkty przyjaźni / serca** rosną dzięki rozmowom, dawaniu prezentów i innym działaniom. Poszczególne progi odblokowują scenki fabularne, a dla części postaci również wątki romantyczne. Pełne wydanie 1.0 dodało dalsze etapy związane z małżeństwem i rodziną. To system o własnej progresji, niezależny od poziomu rolnictwa. [M3] [M29]

Ważnym, regularnym wydarzeniem jest **Friday Night at the Inn**: spotkanie postaci w karczmie podczas piątkowego wieczoru. Gracz obserwuje rozmowy i zmieniające się interakcje mieszkańców, co sprawia, że miasto nie jest wyłącznie zestawem sklepów. [M30]

## 5.19. Zadania, tablice ogłoszeń i wydarzenia

W grze występują zadania główne związane z remontem Mistrii, zamówienia mieszkańców, zadania relacyjne (*Heart Quests*) i cele długoterminowe. Tablice ogłoszeń i określone postacie mogą udostępniać prośby o zebranie roślin, wyprodukowanie przedmiotów, poznanie nowych rejonów lub dostarczenie materiałów. [M31]

Sezonowe festiwale dodają wydarzenia w konkretnych dniach kalendarza. Przygotowania do nich często krzyżują się z systemem rolniczym, handlem i relacjami: określony rodzaj rośliny może przydać się jako prezent, towar czy przedmiot zadania. [M10] [M11]

## 5.20. Muzeum, kolekcje i cele niezwiązane z farmą

Muzeum przyjmuje odpowiednie gatunki roślin, artefakty, owady, ryby i inne okazy. Oddanie przedmiotu do kolekcji może oznaczać rezygnację z jego natychmiastowej sprzedaży, ale wspiera inne nagrody i rozwój miasta. To osobna motywacja do eksplorowania świata, łowienia i poszukiwania rzadkich gatunków. [M28] [M31]

Rozgrywka daje również aktywności w kopalni i system spotkań z przeciwnikami. **Walka istnieje w tej grze**, lecz jest przede wszystkim powiązana z kopalnią i wybranymi sytuacjami eksploracyjnymi, nie jest koniecznym krokiem przy podlewaniu każdej grządki. Mechanika miecza, zdrowia i potworów jest oddzielna od zwykłej wytrzymałości na prace rolnicze. [M26]

## 5.21. Zwierzęta gospodarskie

Zwierzęta mieszkają w przystosowanych budynkach. Ich opieka obejmuje czynności takie jak karmienie, interakcje oraz zbieranie produktów. Rozwój hodowli powiązany jest z ulepszaniem kurników i stodół, odblokowywaniem zwierząt, kosztami i liczbą dostępnych miejsc. [M20] [M26]

System daje alternatywne źródła dochodu oraz składniki do gotowania i wytwarzania. Obiekty hodowlane nie są wyłącznie dekoracjami: mają wymaganą przestrzeń i ograniczenia liczby zwierząt. [M20]

## 5.22. Sterowanie i wygoda obsługi

Podstawowym wariantem gry są sterowanie klawiaturą i myszą oraz obsługa kontrolera na wspieranych platformach. Interakcje z narzędziami bazują na położeniu bohatera, wybranym sprzęcie i przytrzymaniu przycisku dla naładowania. Obsługa mapy, ekwipunku, zadań, rozmów i budowania wymaga różnych stanów interfejsu. [M1] [M6]

**Nie należy utożsamiać wygody obsługi kontrolerem z istnieniem natywnej wersji na telefon.** Poszczególne gry porównywane w tym opracowaniu mają różne platformy i różne interfejsy. *Fields of Mistria* w badanym stanie jest przede wszystkim grą o sterowaniu projektowanym pod PC; mechanika dużych obszarów konewki nie oznacza automatycznie, że jej interfejs jest identyczny z mobilnym *Stardew Valley*. [M1] [M6]

## 5.23. Przykładowa sekwencja dnia — istniejące reguły

1. Postać rozpoczyna dzień w domu około 6:00.
2. Sprawdza pogodę i obowiązujący sezon; wybiera nasiona ze skrzyni lub kupuje je w odpowiednim sklepie.
3. Przygotowuje glebę i sadzi rośliny odpowiednie do sezonu na zewnętrznych polach.
4. Używa naładowanej konewki do nawadniania dużego obszaru albo zostawia tę pracę deszczowi, *Water Sprite Statue* lub innym dostępnym mechanizmom.
5. W szklarni dba o sezonowe rośliny uprawiane niezależnie od kalendarza zewnętrznego.
6. Zbiera gotowe plony, część umieszcza w *Shipping Bin*, pozostałe zachowuje w ekwipunku lub przerabia.
7. Udaje się do miasta, oddaje materiały w projekcie remontowym, kupuje wyposażenie, rozmawia z postaciami i realizuje prośby.
8. Opcjonalnie korzysta z warsztatów, sanktuarium Caldarusa, muzeum, kopalni lub wydarzenia w karczmie.
9. Wraca do domu przed 2:00; po śnie zaczyna się nowy dzień i aktualizują się procesy zależne od daty. [M7] [M13] [M16] [M24] [M28]

**Główne źródła rozdziału:** [M1]–[M31].

---

# 6. Porównanie mechanik

Poniższe zestawienia nie służą do oceniania, która gra jest lepsza. Przedstawiają **istniejące różnice systemowe**, z uwzględnieniem dostępnych aktualizacji i rozszerzeń. „Nie potwierdzono” oznacza brak wystarczających danych, a nie kategoryczne stwierdzenie, że funkcji nie ma.

## 6.1. Ruch, świat i organizacja mapy

| Cecha | Littlewood | Stardew Valley | Sprout Valley | Fields of Mistria |
|---|---|---|---|---|
| Kamera | 2D, z góry | 2D, z góry | 2D, z góry | 2D, z góry |
| Główna przestrzeń gracza | przebudowywane miasteczko | własne gospodarstwo | własna wyspa | farma przy dużej osadzie |
| Inne obszary | lasy, kopalnie i lokacje specjalne | miasto, las, kopalnie, plaża itd. | osobne wyspy, podróże łodzią | miasto, kopalnie, plaża, obszary odblokowywane |
| Układ świata | częściowo edytowalny, w tym wysokość terenu | farma edytowalna, miasto z reguły stałe | wyspa bazowa + proceduralne lokacje | farma edytowalna, miasteczko z ustaloną strukturą |
| Terraformowanie | tak, wysokość gruntu i woda | ograniczone, brak powszechnego podnoszenia terenu | przedmioty zmieniające teren i łączenie parcel; nie jak w Littlewood | zmiana pokrycia gruntu, nie pełne terraformowanie wysokości |
| Rola NPC | centrum odbudowy miasta | duża społeczność i harmonogramy | mała obsada podstawowa, rozszerzona w DLC | duża społeczność i harmonogramy |

Źródła: [L1] [L5] [S2] [P1] [P7] [M1] [M5].

## 6.2. Dzień, noc, czas, energia

| Cecha | Littlewood | Stardew Valley | Sprout Valley | Fields of Mistria |
|---|---|---|---|---|
| Zegar przesuwa się sam podczas swobodnego spaceru | zasadniczo nie | tak | tak, cykl dnia i nocy | tak |
| Działania zużywają staminę/energię | tak | tak | tak | tak |
| Akcje same przesuwają porę dnia | tak, podstawowa cecha | nie w tym sensie; upływa czas globalny | nie w modelu Littlewood | nie w modelu Littlewood |
| Sen w łóżku | tak | tak | tak | tak |
| Obowiązkowe ograniczenie końca doby / konsekwencje przemęczenia | energia i omdlenie | 2:00 i omdlenie | ograniczenia cyklu i staminy | 2:00 i omdlenie |
| Opcja wydłużenia dnia | brak standardowego tykającego zegara | podstawowo brak trójstopniowego przełącznika długości | zależne od wersji, brak potwierdzenia identycznego przełącznika | tak: Standard, Longer, Longest |
| Możliwość nieograniczonej pracy bez kosztu i bez zakończenia dnia | nie | nie | nie | nie |

Źródła: [L2] [L4] [S8] [S9] [P2] [P5] [M7] [M8].

## 6.3. Rolnictwo i pogoda

| Cecha | Littlewood | Stardew Valley | Sprout Valley | Fields of Mistria |
|---|---|---|---|---|
| Przygotowanie gruntu ręczną motyką | uproszczony system umieszczania upraw | tak | tak | tak |
| Codzienne podlewanie zwykłych warzyw | nie | zazwyczaj tak | tak | tak |
| Deszcz zastępuje podlewanie na polu | nie ma rutynowego podlewania warzyw | tak | tak | tak |
| Osobny system kwiatów | tak, rozmnażanie i konewka | tak, kwiaty jako uprawy i dekoracje | tak, różnorodne kwiaty | tak, kwiaty i rośliny zbierane |
| Uprawy jednorazowe / wielokrotne | zasadniczo odrastające zasoby | oba modele | rośliny i drzewa o różnych cyklach | oba modele |
| Pory roku wpływają na ofertę i świat | tak | tak | pogoda/kalendarz i kolejne dni | tak |
| Pora roku ogranicza zwykłe uprawy zewnętrzne | znacznie łagodniej, część plonów całoroczna | silnie | zależne od uprawy i wersji, brak jednej reguły dla wszystkich | tak |
| Automatyczne podlewanie | nie jest podstawą upraw warzyw | zraszacze | obiekty Sprinkler | Water Sprite Statues |
| Rośliny wymagają nawozu dla wzrostu | nie | nawóz jest opcjonalnym modyfikatorem | niepotwierdzona analogiczna taksonomia nawozów | zamiast klasycznej rodziny nawozów występuje m.in. magia Growth |

Źródła: [L10] [L11] [S11] [S14] [S15] [S21] [P5] [M10] [M14] [M16].

## 6.4. Szklarnie, domy i wnętrza

| Cecha | Littlewood | Stardew Valley | Sprout Valley | Fields of Mistria |
|---|---|---|---|---|
| Własny dom | tak | tak | tak | tak |
| Rozbudowa lub rozwój domu | meble i usprawnienia | kolejne etapy Robin, większe wnętrza | ulepszenia domu | Home Upgrades, nowe pokoje i piętro |
| Uprawa polowa we wnętrzu specjalnego budynku | brak potwierdzonego analogicznego układu szklarni | tak | brak potwierdzonego analogicznego układu | tak |
| Szklarnia o podanej liczbie stanowisk | niepotwierdzona | 120 standardowych pól glebowych | niepotwierdzona | mała 25, duża 100 |
| Uprawa niezależna od sezonu w szklarni | brak analogicznego systemu | tak | niepotwierdzona | tak |
| Osobne *Garden Pots* w domu | niepotwierdzony pełny odpowiednik | tak | niepotwierdzony pełny odpowiednik | nie utożsamiać automatycznie dekoracji z polami uprawnymi |
| Dekorowanie domu | tak | tak | tak | tak |
| Wpływ zewnętrznego deszczu na uprawę pod dachem | nie dotyczy takiej samej mechaniki | brak podlewania przez deszcz | brak potwierdzenia | odrębny od otwartych grządek |

Źródła: [L7] [L18] [S17] [S18] [S20] [P3] [P5] [M13] [M21].

## 6.5. Sprzęt, automatyzacja i ochronne dekoracje

| System | Littlewood | Stardew Valley | Sprout Valley | Fields of Mistria |
|---|---|---|---|---|
| Rozwój narzędzi | warianty i efekty sprzętu, *Hobbies* | ulepszanie u kowala | umiejętności i czynności specjalne | kolejne poziomy wykuwanego sprzętu |
| Konewka | używana zwłaszcza przy kwiatach | narzędzie z zapasem wody i ulepszeniami | narzędzie z zapasem wody | narzędzie z ulepszeniami obszaru |
| Rozmiar obszaru podlewania ulepszonym sprzętem | odrębna logika kwiatów 3×2 | zmienny, zależy od stopnia naładowania | czynności specjalne zależne od umiejętności | do 6×9 przy Mistril |
| Automatyzacja podlewania | brak konieczności przy zwykłych warzywach | Sprinkler 4, Quality 8, Iridium 24 | Sprinkler, warianty | statuy 2/3 pola promienia, zasilane Essence Stone |
| Strachy na wróble | brak analogicznego obowiązku przy podstawowych uprawach | tak, rzeczywisty zasięg ochrony | obecne jako obiekty, skuteczność ochronna niepotwierdzona | brak podstaw, by przypisywać taki sam klasyczny system wron |
| Źródło zaawansowania | odblokowanie narzędzia i bonusy umiejętności | metale, złoto, materiały | umiejętności i crafting | metalowe sztabki, poziom kowalstwa i Essence |

Źródła: [L15] [L16] [S4] [S5] [S21] [S22] [P4] [P5] [M6] [M16].

## 6.6. Ekwipunek, waluta i sprzedaż

| Cecha | Littlewood | Stardew Valley | Sprout Valley | Fields of Mistria |
|---|---|---|---|---|
| Waluta | Dewdrops | Gold (g) | waluta sklepu Ozlo | Tesserae (t) |
| Sprzedaż plonów | Marketplace, sprzedaż dzienna | Shipping Bin, rozliczenie po śnie | zamówienia/wysyłka, rozliczenie dzienne | Shipping Bin, rozliczenie po śnie |
| Zakup nasion | przez odblokowania i handel świata | sklepy w Pelican Town i inne lokacje | katalog Ozlo | General Store i inni dostawcy |
| Duże znaczenie harmonogramu sklepów | mniejsze niż w typowym miasteczku z zegarem | tak | model zdalnego katalogu | tak |
| Ograniczenia ekwipunku | przedmioty i dostępność sprzętu | 12 → 24 → 36 slotów | wariant historycznie limitowany, 600 w Friends Forever | 10 → 20 → 30 w początkowych etapach |
| Rozwój handlu | Merchanting, poziomy Marketplace | cena/jakość, zawody, przetwórstwo | większa oferta po wysyłkach i zadaniach | Town Rank, remonty i asortyment sklepów |

Źródła: [L22] [L23] [S23] [S24] [S25] [P5] [P7] [M22] [M24] [M25].

## 6.7. Mieszkańcy, progresja i dodatkowe aktywności

| Cecha | Littlewood | Stardew Valley | Sprout Valley | Fields of Mistria |
|---|---|---|---|---|
| Rozmowy i prezenty NPC | tak | tak | ograniczone pierwotnie, rozbudowane w DLC | tak |
| Harmonogram mieszkańców | obecny w ramach życia osady | rozbudowany | odmienne zasady, mniejsza obsada początkowa | rozbudowany |
| Randki i romans | tak | tak | brak potwierdzenia równie rozbudowanego systemu | tak |
| Miejskie projekty rozwoju | domy, usługi, życzenia NPC | Community Center i inne projekty | zasadniczo dom/wyspa i zawartość podróży | questy odbudowy miasta i Town Rank |
| Progresja umiejętności | 10 Hobbies | 5 głównych umiejętności + dodatkowe systemy | 5 w historycznej aktualizacji v0.3.0 | liczne profesje + Essence Perks |
| Eksploracja obszarów | lasy, kopalnie, specjalne lokacje | kopalnie i inne rejony | proceduralne wyspy | kopalnie i otaczający świat |
| Walka | nie jest podstawową pętlą pracy na farmie | tak, w określonych lokacjach | nie jest głównym filarem opisów producenta | tak, w kopalniach i wybranych lokacjach |
| Kolekcjonowanie | ryby, owady, karty i przedmioty | kolekcje, Community Center, muzeum | rośliny, ryby, przedmioty | muzeum, ryby, owady, minerały i inne zbiory |

Źródła: [L17] [L24] [L25] [S13] [S19] [S28] [P1] [P7] [M9] [M28] [M29] [M31].

## 6.8. Różnice mechaniczne, które łatwo pomylić

1. **„Nie ma presji czasu” ≠ „nie ma staminy”.** *Littlewood* usuwa typowy biegnący zegar, ale stosuje wyczerpywanie energii podczas pracy. [L2]
2. **„Można iść spać kiedy się chce” ≠ „nigdy nie trzeba kończyć dnia”.** *Stardew Valley* i *Fields of Mistria* dopuszczają wcześniejszy sen, ale mają limit około 2:00. [S8] [M7]
3. **„Istnieje szklarnia” ≠ „szklarnię można dowolnie powiększać w tym samym modelu”.** *Stardew Valley* oferuje stałe wewnętrzne pole 12 × 10 po odblokowaniu; *Fields of Mistria* oferuje oddzielne budynki o pojemnościach 25 i 100 pól. [S18] [M13]
4. **„W grze są rośliny ozdobne” ≠ „są uprawiane w domu”.** Kwiaty na zewnątrz, przedmioty dekoracyjne i doniczki z cyklem wzrostu to trzy różne mechaniki; pełnoprawny przykład doniczki do uprawy w domu jest opisany w *Stardew Valley*. [S17]
5. **„Sprinkler” ≠ „dowolny zraszacz działa bez kosztów”.** Standardowe zraszacze *Stardew Valley* nie potrzebują okresowo wkładanych kryształów; *Water Sprite Statues* w *Fields of Mistria* wymagają Essence Stones. [S21] [M16]
6. **„Więcej NPC” nie dotyczy jednakowo wszystkich wydań.** W *Sprout Valley* dziesięciu NPC i 600 slotów to właściwości *Friends Forever*, a nie pierwotnego produktu w dniu premiery. [P7]
7. **„Ulepszona konewka” może oznaczać co innego.** W jednej grze zwiększa obszar działania, w innej zwiększa sprawność lub zużycie staminy, a w trzeciej podlewanie zwykłych warzyw w ogóle nie jest wymaganym etapem. [L10] [S16] [P4] [M6]

---

# 7. Słownik pojęć i sytuacji granicznych

## 7.1. Najważniejsze terminy

| Pojęcie | Znaczenie w mechanikach opisanych gier |
|---|---|
| **Tile / kafelek** | najmniejsza regularna jednostka pozycji na planszy; pole uprawne często zajmuje 1 tile |
| **Crop / uprawa** | roślina wyhodowana przez gracza, zwykle z nasiona, dająca określony plon |
| **Seed / nasiono** | jednostka wysiewana na odpowiednim polu; jej koszt i sezon są częścią ekonomii |
| **Tilled soil / przekopana gleba** | pole przygotowane motyką, odmienne od trawy, ścieżki, kamienia lub zwykłego gruntu |
| **Watered soil / nawodniona gleba** | stan pola umożliwiający wzrost w systemach z codziennym podlewaniem |
| **Growth stage / faza wzrostu** | pośredni etap między zasiewem a plonem; zmiana następuje według reguł gry |
| **Regrowing crop / uprawa wielokrotna** | po zbiorze nie znika i po określonym czasie plonuje ponownie |
| **Forageable / zbieractwo** | surowiec znaleziony w świecie, niezależny od sadzenia go na przekopanym polu |
| **Harvest / zbiór** | operacja przekształcenia dojrzałego plonu w przedmiot lub przedmioty w ekwipunku |
| **Greenhouse / szklarnia** | oddzielna przestrzeń do uprawy, zwykle z zasadami niezależnymi od zwykłego sezonu |
| **Garden Pot / doniczka do uprawy** | w *Stardew Valley* obiekt zdolny utrzymywać pojedynczą roślinę również wewnątrz domu |
| **Sprinkler / zraszacz** | obiekt, który nawadnia określone sąsiadujące pola bez ręcznej pracy z konewką |
| **Scarecrow / strach na wróble** | obiekt chroniący plony przed określonym zagrożeniem, gdy dana gra taki system ma |
| **Shipping Bin / skrzynia sprzedażowa** | pojemnik na towary rozliczane najczęściej przy przejściu do następnego dnia |
| **Chest / skrzynia magazynowa** | schowek zachowujący przedmioty do późniejszego użycia, zamiast automatycznie je sprzedawać |
| **Inventory / ekwipunek** | lista lub siatka przedmiotów noszonych przez postać, często o ograniczonej pojemności |
| **Hotbar / pasek szybkiego wyboru** | podręczny fragment ekwipunku z szybkim dostępem do narzędzi i nasion |
| **Tool charge / ładowanie narzędzia** | przytrzymanie działania zwiększające liczbę pól objętych jedną akcją |
| **Stamina / energia** | zasób zużywany podczas czynności, różny od zegara dziennego |
| **Crafting / wytwarzanie** | zamiana materiałów w sprzęt, meble, maszyny lub dekoracje według receptury |
| **Upgrade / ulepszenie** | trwała zmiana możliwości przedmiotu, budynku, ekwipunku lub postaci |
| **Skill Perk / premia umiejętności** | odblokowany modyfikator wykonywanych czynności, np. szansa na bonusowy plon |
| **Town Rank / ranga miasta** | w *Fields of Mistria* postęp całej społeczności mierzony punktami Renown |
| **Bulk action / operacja zbiorcza** | wykonanie jednej operacji na wielu przedmiotach jednocześnie; przykładem jest nowy ekwipunek *Sprout Valley* |
| **Footprint / obrys obiektu** | liczba pól zajmowanych fizycznie przez budynek lub urządzenie |

## 7.2. Sytuacje graniczne: podlewanie i wzrost

### A. Ziemia jest przekopana, ale bez nasion

W systemie takim jak *Stardew Valley* pole może pozostawać przygotowane, lecz nic na nim nie rośnie. Samo podlewanie pustej grządki nie tworzy rośliny. Uprawa wymaga nasiona lub sadzonki, odpowiedniej lokalizacji i warunków wzrostu. [S11]

### B. Roślina ma za sobą kilka dni, ale jednego dnia nie dostała wody

W *Stardew Valley* brak nawodnienia zwykle wstrzymuje dzienny postęp wzrostu; nie oznacza automatycznie śmierci rośliny. Następnego dnia można kontynuować pielęgnację. W praktyce datę zbioru przesuwa to o kolejny dzień, chyba że działają szczególne reguły. [S11] [S13]

### C. Pada deszcz, ale roślina stoi pod dachem

*Stardew Valley* rozróżnia zewnętrzną grządkę od *Garden Pot* we wnętrzu. Na doniczki i uprawy w szklarni nie należy automatycznie przenosić efektu deszczu padającego na zewnątrz. [S17] [S18]

### D. Zraszacz jest ustawiony, ale nie obejmuje danego pola

Urządzenie nawadnia **tylko pola w swoim zasięgu**, nie całe gospodarstwo. Zasięg w *Stardew Valley* zależy od wariantu zraszacza; w *Fields of Mistria* od wariantu statuy, jej pozycji i zasilania. [S21] [M16]

### E. Uprawa dojrzewa przy zmianie sezonu

Na zwykłych polach *Stardew Valley* większość upraw niewłaściwych dla nowej pory roku więdnie. Pole w szklarni podlega innym zasadom sezonowym. W *Fields of Mistria* szklarnie również umożliwiają uprawy całoroczne. [S10] [S18] [M13]

### F. Zebrano roślinę wielokrotnego plonowania

W *Stardew Valley* *Blueberry*, *Tomato* i podobne plony pozostawiają roślinę na polu; po określonej liczbie dni następuje kolejny zbiór. Nie należy utożsamiać czasu pierwszego dojrzewania z czasem odrastania kolejnych plonów. [S11] [S12]

## 7.3. Sytuacje graniczne: miejsce, sprzęt i gospodarka

### G. Plecak jest zapełniony

Pojemność ekwipunku jest odrębną cechą od liczby przedmiotów w magazynie. W *Stardew Valley* rozbudowa plecaka zwiększa liczbę slotów, ale nie powiększa automatycznie żadnej stojącej na farmie skrzyni. [S23]

### H. Przedmiot włożono do skrzyni sprzedażowej

W *Stardew Valley* i *Fields of Mistria* dochód ze standardowego pojemnika wysyłkowego rozlicza się po zakończeniu dnia, nie natychmiast. Jest to inna operacja niż przechowywanie w zwykłej skrzyni. [S24] [M24]

### I. Zmieniono ulepszenie narzędzia

W *Stardew Valley* oddanie narzędzia do kowala bywa równoznaczne z tymczasową utratą możliwości używania go. W *Fields of Mistria* kowalstwo służy do wytwarzania coraz lepszych przedmiotów przy spełnieniu wymagań receptury. Sam bonus obszarowy aktywuje się po odpowiednim przytrzymaniu. [S5] [M6]

### J. Rozbudowa domu lub szklarni potrzebuje przestrzeni

W *Sprout Valley* rozbudowywany dom może zająć kolejne pola wyspy. W *Fields of Mistria* zewnętrzny rozmiar budynku i wewnętrzna liczba grządek to dwie różne własności; mniejsze i większe szklarnie mają inne rozmiary fizyczne i pojemności. [P6] [M13]

### K. Ukończono projekt miejski

W *Littlewood* ukończenie budynku lub spełnienie życzeń mieszkańca może przyciągać nowe postacie i usługi. W *Fields of Mistria* ukończenie zlecenia remontowego otwiera dalszy projekt, zmianę dostępności oferty lub kolejne możliwości fabularne. W *Stardew Valley* oddanie zestawu przedmiotów do Community Center może odblokować duży element infrastruktury. Są to trzy różne implementacje progresji, nie jeden wspólny system. [L18] [S19] [M28]

### L. Zmieniono edycję gry lub zainstalowano dodatek

*Sprout Valley* z *Friends Forever* ma znacznie więcej NPC i inną pojemność ekwipunku niż wydanie bazowe opisane przez starsze recenzje. *Fields of Mistria* v1.0 oferuje mechaniki i zawartość niewystępujące w pierwotnym Early Access. Przy każdym sprawdzaniu wartości liczbowych trzeba znać wersję. [P7] [M3]

---

# 8. Źródła i ograniczenia kwerendy

## 8.1. Rodzaje źródeł i sposób interpretacji

**Hierarchia źródeł stosowana w tym opracowaniu:**

1. **Karty produktu, informacje wydawcy/twórcy, notatki aktualizacji** — podstawowe potwierdzenie istnienia mechaniki oraz daty jej dodania. Nie zawsze podają liczby i dokładne reguły.
2. **Wyspecjalizowane wiki danej gry** — szczegółowe wymagania, ceny, receptury, limity, rozmiary obszarów i cykle wzrostu. Mogą zawierać strony utworzone dla różnych wersji.
3. **Przewodniki społecznościowe i pomiary graczy** — szczególnie przydatne dla historycznych cen, kosztów narzędzi i porównań wersji, ale nie są autorytatywną dokumentacją aktualnego kodu gry.
4. **Recenzje i relacje z gry** — źródło sposobu działania głównej pętli, komfortu sterowania i kontekstu; nie powinny przesądzać dokładnych wartości liczbowych.

Materiały są podane jako odsyłacze, lecz **opis każdej ważniejszej zasady znajduje się bezpośrednio w dokumencie**. Strony źródłowe mogą się zmieniać albo przestać istnieć; identyfikator cytowania oznacza źródło użyte przy opracowaniu, nie obietnicę stałej dostępności strony.

## 8.2. Littlewood — źródła

- **[L1]** — oficjalna karta *Littlewood* na Steam, założenia i główne aktywności.
- **[L2]** — recenzja Seasoned Gaming opisująca energię i system dnia.
- **[L3]** — baza wiedzy *Littlewood Wiki*, świat, postacie i mechaniki.
- **[L4]** — przewodnik społeczności Steam po pracy i gospodarowaniu energią.
- **[L5]** — instrukcja *How to play guide*, ruch i budowanie.
- **[L6]** — niezależna recenzja wersji Switch i charakterystyka dnia.
- **[L7]** — wiki: *My House*, sen i wyposażenie domu.
- **[L8]** — wiki: *Calendar*, sezony i wydarzenia.
- **[L9]** — wiki: *Events*, organizacja świąt i zdarzeń.
- **[L10]** — wiki: *Farming*, uprawa, limit stanowisk, plonowanie i poziomy narzędzi.
- **[L11]** — wiki: *Flowers*, osobny system kwiatów.
- **[L12]** — wiki: *Carrot*, przykład rośliny uprawnej.
- **[L13]** — wiki: *Corn*, przykład innego gatunku uprawnego.
- **[L14]** — wiki: *Your Town*, rozmieszczenie roślin i infrastruktury.
- **[L15]** — wiki: *Watering Can*, zasady podlewania kwiatów i zmiany po aktualizacjach.
- **[L16]** — wiki: *Tools*, sprzęt i ulepszenia.
- **[L17]** — wiki: *Hobbies*, lista umiejętności.
- **[L18]** — wiki: *Your Town*, budynki, życzenia mieszkańców i terraformowanie.
- **[L19]** — wiki: *Crafting*, surowce i przetwórstwo.
- **[L20]** — wiki: *Crafting Workshop*, infrastruktura rzemieślnicza.
- **[L21]** — wiki: *My Office*, miejskie życzenia i rozwój.
- **[L22]** — wiki: *Marketplace*, sprzedaż towarów.
- **[L23]** — wiki: *Merchanting*, umiejętność handlu.
- **[L24]** — wiki: *Dating*, romantyczne relacje.
- **[L25]** — wiki: *Hang Out*, czas spędzany z mieszkańcami.

[L1]: https://store.steampowered.com/app/894940/Littlewood/
[L2]: https://seasonedgaming.com/2021/02/25/review-littlewood-big-fun-in-a-crowded-genre/
[L3]: https://littlewood.fandom.com/wiki/Littlewood
[L4]: https://steamcommunity.com/sharedfiles/filedetails/?id=2177487037
[L5]: https://littlewood.fandom.com/wiki/How_to_play_guide_for_Littlewood
[L6]: https://www.rapidreviewsuk.com/littlewood-nintendo-switch-review/
[L7]: https://littlewood.fandom.com/wiki/My_House
[L8]: https://littlewood.fandom.com/wiki/Calendar
[L9]: https://littlewood.fandom.com/wiki/Events
[L10]: https://littlewood.fandom.com/wiki/Farming
[L11]: https://littlewood.fandom.com/wiki/Flowers
[L12]: https://littlewood.fandom.com/wiki/Carrot
[L13]: https://littlewood.fandom.com/wiki/Corn
[L14]: https://littlewood.fandom.com/wiki/Your_Town
[L15]: https://littlewood.fandom.com/wiki/Watering_Can
[L16]: https://littlewood.fandom.com/wiki/Tools
[L17]: https://littlewood.fandom.com/wiki/Hobbies
[L18]: https://littlewood.fandom.com/wiki/Your_Town
[L19]: https://littlewood.fandom.com/wiki/Crafting
[L20]: https://littlewood.fandom.com/wiki/Crafting_Workshop
[L21]: https://littlewood.fandom.com/wiki/My_Office
[L22]: https://littlewood.fandom.com/wiki/Marketplace
[L23]: https://littlewood.fandom.com/wiki/Merchanting
[L24]: https://littlewood.fandom.com/wiki/Dating
[L25]: https://littlewood.fandom.com/wiki/Hang_Out

## 8.3. Stardew Valley — źródła

W tej grze podstawową bazą jest **Stardew Valley Wiki**. Podstawowe reguły upraw, zegara, narzędzi i szklarni są dobrze udokumentowane. Dokładne ceny, receptury i rośliny mogą ulegać zmianom w aktualizacjach, dlatego podane wartości należy odnosić do współczesnego stanu wiki.

- **[S1]** — *Getting Started*: podstawowa pętla i początek rozgrywki.
- **[S2]** — *Stardew Valley Wiki*, ogólny opis gry i świata.
- **[S3]** — *The Farm*: własna farma i rozkład terenu.
- **[S4]** — *Tools*: mechanika użytkowania i ładowania narzędzi.
- **[S5]** — *Blacksmith*: rozwój sprzętu, surowce i koszty.
- **[S6]** — *Mobile Controls*: gesty, dotyk i sterowanie mobilne.
- **[S7]** — *Controls*: klawiatura i kontrolery.
- **[S8]** — *Day Cycle*: godziny, sen i omdlenia.
- **[S9]** — *Energy*: wydawanie i regeneracja energii.
- **[S10]** — *Season*: cztery pory roku i ograniczenia upraw.
- **[S11]** — *Crops*: gatunki, etapy i typy zbiorów.
- **[S12]** — *Crop Growth Calendars*: dni wzrostu i ponowne zbiory.
- **[S13]** — *Farming*: zasady pielęgnacji oraz rozwój profesji.
- **[S14]** — *Fertilizer*: rodzaje i skutki nawozów.
- **[S15]** — *Weather*: opady i skutki warunków atmosferycznych.
- **[S16]** — *Watering Cans*: podlewanie i ulepszenia.
- **[S17]** — *Garden Pot*: wysiew pojedynczych roślin w donicach.
- **[S18]** — *Greenhouse*: powierzchnia, uprawy i zasady szklarni.
- **[S19]** — *Bundles*: odblokowania przez zestawy i Community Center.
- **[S20]** — *Farmhouse*: rozbudowa i dekorowanie domu.
- **[S21]** — *Sprinkler*: poziomy automatycznego nawadniania.
- **[S22]** — *Scarecrow*: ochrona upraw przed wronami.
- **[S23]** — *Inventory*: pojemność plecaka i ulepszenia.
- **[S24]** — *Shipping*: sprzedaż towarów i rozliczenie dnia.
- **[S25]** — *Pierre's General Store*: lokalny handel nasionami.
- **[S26]** — *Artisan Goods*: przetwórstwo produktów rolniczych.
- **[S27]** — *Carpenter's Shop*: budynki oraz remonty.
- **[S28]** — *Quests*: zadania i zamówienia.

[S1]: https://stardewvalleywiki.com/Getting_Started
[S2]: https://stardewvalleywiki.com/Stardew_Valley
[S3]: https://stardewvalleywiki.com/The_Farm
[S4]: https://stardewvalleywiki.com/Tools
[S5]: https://stardewvalleywiki.com/Blacksmith
[S6]: https://stardewvalleywiki.com/Mobile_Controls
[S7]: https://stardewvalleywiki.com/Controls
[S8]: https://stardewvalleywiki.com/Day_Cycle
[S9]: https://stardewvalleywiki.com/Energy
[S10]: https://stardewvalleywiki.com/Season
[S11]: https://stardewvalleywiki.com/Crops
[S12]: https://stardewvalleywiki.com/Crop_Growth_Calendars
[S13]: https://stardewvalleywiki.com/Farming
[S14]: https://stardewvalleywiki.com/Fertilizer
[S15]: https://stardewvalleywiki.com/Weather
[S16]: https://stardewvalleywiki.com/Watering_Cans
[S17]: https://stardewvalleywiki.com/Garden_Pot
[S18]: https://stardewvalleywiki.com/Greenhouse
[S19]: https://stardewvalleywiki.com/Bundles
[S20]: https://stardewvalleywiki.com/Farmhouse
[S21]: https://stardewvalleywiki.com/Sprinkler
[S22]: https://stardewvalleywiki.com/Scarecrow
[S23]: https://stardewvalleywiki.com/Inventory
[S24]: https://stardewvalleywiki.com/Shipping
[S25]: https://stardewvalleywiki.com/Pierre%27s_General_Store
[S26]: https://stardewvalleywiki.com/Artisan_Goods
[S27]: https://stardewvalleywiki.com/Carpenter%27s_Shop
[S28]: https://stardewvalleywiki.com/Quests

## 8.4. Sprout Valley — źródła

Dla *Sprout Valley* starsze konkretne dane liczbowe są w dużym stopniu pochodzenia społecznościowego; zostały oznaczone jako **historyczne**, aby nie mieszać ich z późniejszym rozszerzeniem. Wydawca i twórca potwierdzają ważne zmiany związane z *Friends Forever*.

- **[P1]** — oficjalna strona Steam; opis gry, wysp i aktywności.
- **[P2]** — recenzja Cozy Game Reviews z okresu pierwotnego modelu rozgrywki; charakter świata, postacie i skala.
- **[P3]** — poradnik/relacja z rozgrywki Steam; dom, podróże i gospodarka.
- **[P4]** — dziennik aktualizacji v0.3.0 twórcy na itch.io; umiejętności i podróże.
- **[P5]** — szczegółowy przewodnik społeczności Steam *Sprout Valley Numerical Data* (styczeń–luty 2024); ceny, liczby, receptury, koszty staminy i progi wysyłek. Nie jest oficjalną specyfikacją bieżącej wersji.
- **[P6]** — społecznościowy przewodnik osiągnięć i rozgrywki Steam; urządzenia, dom i crafting.
- **[P7]** — ogłoszenie twórcy *Friends Forever*; 10 NPC i przebudowa ekwipunku.
- **[P8]** — informacje wydawcy o dodatku *Friends Forever*; nowe postacie i zawartość.
- **[P9]** — społeczność *Sprout Valley* (2024): działanie zraszaczy po kolejnym dniu.
- **[P10]** — społeczność *Sprout Valley* (2025): relacje o dekoracyjnych stworzeniach na farmie.
- **[P11]** — oficjalny dziennik aktualizacji *Cows Update*; obora, dwie krowy i serowar.
- **[P12]** — historia aktualizacji mobilnej w App Store; przedmioty terraformujące i zmiany interfejsu.

[P1]: https://store.steampowered.com/app/1964820/Sprout_Valley/
[P2]: https://cozygamereviews.com/farming-sims/sprout-valley-review/
[P3]: https://steamcommunity.com/sharedfiles/filedetails/?id=3038715163
[P4]: https://zefrost.itch.io/sprout-valley/devlog/391410/new-v030-update
[P5]: https://steamcommunity.com/sharedfiles/filedetails/?id=3148026245
[P6]: https://steamcommunity.com/sharedfiles/filedetails/?id=3038715163
[P7]: https://zefrost.itch.io/sprout-valley/devlog/900232/sprout-valley-friends-forever-expansion-launches
[P8]: https://www.reddeergames.com/sprout-valley-friends-forever-available-now-experience-the-magic-of-the-new-expansion/
[P9]: https://www.reddit.com/r/SproutValley/comments/1ccrxsf
[P10]: https://www.reddit.com/r/SproutValley/comments/1jcjozs
[P11]: https://zefrost.itch.io/sprout-valley/devlog/724972/sprout-valley-cows-update
[P12]: https://apps.apple.com/us/app/sprout-valley/id1612973798

## 8.5. Fields of Mistria — źródła

Podstawową bazą mechaniczną jest **Fields of Mistria Wiki (wiki.gg)**. Szczególna uwaga dotyczy aktualizacji v0.13–v1.0, ponieważ późniejsze wydanie wprowadziło funkcje nieobecne w pierwszym Early Access. Mechaniki automatycznego podlewania oraz szklarni zostały sprawdzone osobno, a nie wywnioskowane z analogii do *Stardew Valley*.

- **[M1]** — oficjalna karta produktu Steam; świat i filary gry.
- **[M2]** — wiki: *Mistria*, struktura miasta i jego mieszkańcy.
- **[M3]** — omówienie wydania 1.0 z sierpnia 2026 r.
- **[M4]** — notatki aktualizacji 1.0 dotyczące zakończenia Early Access.
- **[M5]** — wiki: *Farm*, przestrzeń gracza i budynki.
- **[M6]** — wiki: *Tools*, poziomy, wzory obszarów, wymagania metali i czynności ładowane.
- **[M7]** — wiki: *Day Cycle*, 6:00–2:00 oraz trzy długości dnia.
- **[M8]** — wiki: *Fainting*, omdlenie i jego skutki.
- **[M9]** — wiki: *Skills*, poziomy, profesje i nagrody.
- **[M10]** — wiki: *Seasons*, kalendarz sezonów.
- **[M11]** — wiki: *Calendar*, urodziny i wydarzenia.
- **[M12]** — wiki: *Weather*, warunki atmosferyczne.
- **[M13]** — wiki: *Greenhouse*, dwa rozmiary, całoroczne uprawy i odblokowanie.
- **[M14]** — wiki: *Farming*, gleba, wzrost, magia i urządzenia.
- **[M15]** — wiki: *Crops*, gatunki i warunki sezonowe.
- **[M16]** — wiki: *Water Sprite Statue* i *Large Water Sprite Statue*, promienie 2 i 3 pola.
- **[M17]** — wiki: *Essence*, użycie Essence Stones.
- **[M18]** — wiki: *Farming*, opis zaklęcia Growth.
- **[M19]** — wiki: *Carpenter*, rozwój usług i projekty.
- **[M20]** — materiały o budynkach farmy, kurnikach i stodołach.
- **[M21]** — wiki: *Farmhouse*, ulepszenia i dekoracje.
- **[M22]** — wiki: *Inventory*, *Basic Pouch* i *Bag Upgrade*.
- **[M23]** — wiki: *Chest*, schowki.
- **[M24]** — wiki: *Shipping Bin*, sprzedaż i pojemność.
- **[M25]** — wiki: *General Store*, sprzedaż nasion i asortyment.
- **[M26]** — wiki: *Combat*, kopalnie i system walki.
- **[M27]** — wiki: *Skills*, perki Essence.
- **[M28]** — wiki: *Town Rank*, Renown i nagrody za rozwój osady.
- **[M29]** — wiki: *Friendship*, relacje i prezenty.
- **[M30]** — wiki: *Friday Night at the Inn*, regularne spotkania.
- **[M31]** — wiki: *Quests*, zadania fabularne i prośby mieszkańców.

[M1]: https://store.steampowered.com/app/2142790/Fields_of_Mistria/
[M2]: https://fieldsofmistria.wiki.gg/wiki/Mistria
[M3]: https://www.pcgamer.com/games/life-sim/fields-of-mistria-1-0-update-changes/
[M4]: https://steampeaks.com/patchnotes/note/753
[M5]: https://fieldsofmistria.wiki.gg/wiki/Farm
[M6]: https://fieldsofmistria.wiki.gg/wiki/Tools
[M7]: https://fieldsofmistria.wiki.gg/wiki/Day_Cycle
[M8]: https://fieldsofmistria.wiki.gg/wiki/Fainting
[M9]: https://fieldsofmistria.wiki.gg/wiki/Skills
[M10]: https://fieldsofmistria.wiki.gg/wiki/Seasons
[M11]: https://fieldsofmistria.wiki.gg/wiki/Calendar
[M12]: https://fieldsofmistria.wiki.gg/wiki/Weather
[M13]: https://fieldsofmistria.wiki.gg/wiki/Greenhouse
[M14]: https://fieldsofmistria.wiki.gg/wiki/Farming
[M15]: https://fieldsofmistria.wiki.gg/wiki/Crops
[M16]: https://fieldsofmistria.wiki.gg/wiki/Water_Sprite_Statue
[M17]: https://fieldsofmistria.wiki.gg/wiki/Essence
[M18]: https://fieldsofmistria.wiki.gg/wiki/Farming
[M19]: https://fieldsofmistria.wiki.gg/wiki/Carpenter
[M20]: https://www.fom.tools/buildings
[M21]: https://fieldsofmistria.wiki.gg/wiki/Farmhouse
[M22]: https://fieldsofmistria.wiki.gg/wiki/Inventory
[M23]: https://fieldsofmistria.wiki.gg/wiki/Chest
[M24]: https://fieldsofmistria.wiki.gg/wiki/Shipping_Bin
[M25]: https://fieldsofmistria.wiki.gg/wiki/General_Store
[M26]: https://fieldsofmistria.wiki.gg/wiki/Combat
[M27]: https://fieldsofmistria.wiki.gg/wiki/Skills
[M28]: https://fieldsofmistria.wiki.gg/wiki/Town_Rank
[M29]: https://fieldsofmistria.wiki.gg/wiki/Friendship
[M30]: https://fieldsofmistria.wiki.gg/wiki/Friday_Night_at_the_Inn
[M31]: https://fieldsofmistria.wiki.gg/wiki/Quests

Dodatkowe szczegółowe źródła dotyczące późniejszych aktualizacji i liczb, uzupełniające odnośniki powyżej:

- [Fields of Mistria Wiki — Large Water Sprite Statue](https://fieldsofmistria.wiki.gg/wiki/Large_Water_Sprite_Statue): zasięg 3 pól oraz informacja o dodaniu w v0.15.0.
- [Fields of Mistria Wiki — Basic Pouch](https://fieldsofmistria.wiki.gg/wiki/Basic_Pouch): powiększenie pierwszego plecaka.
- [Fields of Mistria Wiki — Bag Upgrade](https://fieldsofmistria.wiki.gg/wiki/Bag_Upgrade): kolejna rozbudowa ekwipunku.
- [Fields of Mistria Wiki — Glass](https://fieldsofmistria.wiki.gg/wiki/Glass): składniki i informacje o projektach szklarni.
- [Fields of Mistria — Greenhouse, informacje o układzie](https://www.fom.tools/buildings): zestawienie pól i budynków.
- [Sprout Valley — opis rozszerzenia na Steam](https://store.steampowered.com/app/3405870/Sprout_Valley__Friends_Forever/): oddzielna karta dodatku.

## 8.6. Weryfikacja porównania i zastrzeżenia końcowe

1. **Różne lata wydań:** *Littlewood* i *Stardew Valley* mają długo funkcjonujące systemy, *Sprout Valley* zmieniło wiele w rozszerzeniach, a *Fields of Mistria* osiągnęło wersję 1.0 w 2026 r.
2. **Liczby historyczne:** ceny roślin *Sprout Valley*, progi wysyłkowe i koszty staminy pochodzą z konkretnego fanowskiego zestawienia ze stycznia–lutego 2024 r.; ich funkcją jest udokumentowanie konstrukcji systemu w tej wersji.
3. **Brak sztucznej kompletności:** w przypadku braku wiarygodnych danych o promieniu stracha na wróble, regule uprawy roślin w domu albo pojemności przedmiotu nie podawano wymyślonych parametrów.
4. **Oddzielna mechanika i oprawa:** sympatyczny styl wizualny, animacje i kolory są cechami gry, lecz nie dowodzą same w sobie istnienia określonego obliczeniowego systemu podlewania, ekonomii lub przemieszczania.
5. **Wyłącznie istniejące gry:** opis dotyczy tylko czterech wymienionych tytułów. Nie zawiera specyfikacji, roadmapy ani propozycji nowej gry.

---

*Koniec dokumentu.*
