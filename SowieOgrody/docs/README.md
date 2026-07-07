# Sowie Ogrody — instrukcja gry

## Cel gry

`Sowie Ogrody` to rozbudowany clicker / idle incremental. Sowa zaczyna od małego parapetu i stopniowo rozwija balkon, działkę, basen z humbakiem, szklarnię, centrum ogrodnicze oraz prestiżowe arboretum.

Celem jest zbieranie liści monster, kupowanie roślin, odblokowywanie automatyzacji, używanie konewki, korzystanie z eventów i wykonywanie **Wielkiego Przesadzania**, czyli prestiżu.

## Sterowanie

- **Klik / tap na ogród** — ręczne zbieranie liści.
- **Przycisk „Zbierz liście”** — alternatywne ręczne zbieranie.
- **Przycisk „Podlej”** — używa konewki i daje czasowy mnożnik produkcji.
- **Klik / tap na aktywny event na canvasie** — odbiera złoty liść, plusk, dostawę lub inny bonus.
- **Zakładki panelu** — rośliny, ulepszenia, automatyzacja, prestiż, statystyki.
- **Wspólne przyciski SowieCore** — pauza, garderoba, misje i ustawienia.

## Główna pętla

1. Klikaj ogród, żeby zebrać pierwsze liście.
2. Kup pierwsze rośliny.
3. Rośliny zaczynają produkować liście na sekundę.
4. Kup ulepszenia produkcji i kliknięć.
5. Odblokuj konewkę i podlewaj rośliny.
6. Kup automatyzację, żeby ograniczyć ręczne klikanie.
7. Wracaj po offline progress.
8. Odblokuj wodę, humbaka, eventy i centrum ogrodnicze.
9. Po osiągnięciu wysokiego progu wykonaj Wielkie Przesadzanie.

## Zasoby

### Liście

Podstawowa waluta gry. Służy do kupowania roślin i ulepszeń.

### Woda

Drugi zasób. Pojawia się po zakupie zraszaczy i basenu humbaka. Jest używana do podlewania i bonusów wodnych.

### Nasiona prestiżu

Stała waluta zdobywana przez Wielkie Przesadzanie. Służy do kupowania ulepszeń prestiżowych.

## Konewka

Konewka jest osobną mechaniką. Po zakupie ulepszenia **Konewka sowy** przycisk `Podlej` staje się aktywny.

Podlewanie:

- zużywa ładunek konewki albo wodę,
- daje produkcję x2 przez 45 sekund,
- tworzy efekty plusku,
- zwiększa statystykę podlewania.

Ładunki konewki odnawiają się wolno, a zraszacze przyspieszają regenerację.

## Sowa w szklarni

Po wejściu do szklarni, centrum ogrodniczego albo arboretum sowa nosi **słomkowy kapelusz**. Jest to stały element wizualny tej strefy.

## Automatyzacja

Automatyzacja jest główną nagrodą progresji.

Dostępne systemy:

- automatyczne zbiory,
- auto-kliknięcia,
- koza zbierająca część złotych liści,
- automatyczne odbieranie dostaw Amic,
- auto-buy roślin.

Gra zaczyna się jako clicker, ale z czasem przechodzi w idle management.

## Eventy

W grze pojawiają się aktywne eventy:

- **Złoty liść** — daje dużą paczkę liści.
- **Tęczowy liść** — uruchamia Gorączkę monster.
- **Plusk humbaka** — daje wodę i liście.
- **Koza pomaga** — daje czasowy bonus podlewania.
- **Dostawa Amic** — daje liście i wodę.
- **Pracu Pracu** — daje mocny mnożnik, a potem krótką karę.

Eventy nie są obowiązkowe, ale aktywny gracz może dzięki nim przyspieszyć rozwój.

## Offline progress

Gra zapisuje czas ostatniej sesji. Po powrocie nalicza produkcję offline i pokazuje modal z podsumowaniem.

Offline progress ma limit i skuteczność. Ulepszenia zwiększają oba parametry.

## Prestiż

Po zebraniu dużej liczby liści lifetime można wykonać **Wielkie Przesadzanie**.

Resetuje:

- aktualne liście,
- wodę,
- zwykłe rośliny,
- zwykłe ulepszenia.

Zachowuje:

- nasiona prestiżu,
- ulepszenia prestiżowe,
- statystyki,
- osiągnięcia,
- wspólny profil i kosmetyki.

## Zapis

Gra zapisuje postęp lokalnie pod kluczem:

```txt
sowieOgrodySave
```

Nie używa Firebase ani backendu.

## Debug

Dodaj `?debug=1` do adresu gry, aby zobaczyć dane debugowe wspólnej warstwy `SowieCore`.
