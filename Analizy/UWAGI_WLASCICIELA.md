# Uwagi właściciela z testów wersji podglądowych

Zbierane od 2026-10-04. **Zasada:** uwagi tylko zapisujemy — kod zmieniamy dopiero, gdy właściciel napisze, że skończył
testy. Wtedy poprawki małymi commitami (każdy z zielonym `npm test`), a przy każdej uwadze stan: ⏳ czeka → ✅ zrobione
(z commitem).

Wersje do sprawdzenia (menu → „Wypróbuj nową wersję: …”):

- Sowie Tory — https://cutelittlegoat.github.io/SowieGry/SowieTory/
- Sowa w Chmurach — https://cutelittlegoat.github.io/SowieGry/SowaWChmurach/
- Sowie Ogrody (nowa odsłona) — https://cutelittlegoat.github.io/SowieGry/SowieOgrody/nowa.html
- Łącz i Hoduj (prototyp nowej Szklarni) — https://cutelittlegoat.github.io/SowieGry/LaczIHoduj/

## Decyzje

| Data | Decyzja |
|---|---|
| 2026-10-04 | Łącz i Hoduj: **prototypy ekranów zaakceptowane** (zrzuty: przeciąganie na telefonie, 320 × 568, telefon poziomo). Decyzja o samej rozgrywce (merge czy wariant zapasowy) — po teście na telefonie. |

## Sowie Tory (E5)

| # | Uwaga właściciela (dosłownie) | Do zrobienia | Stan |
|---|---|---|---|
| T1 | „Pojawia się kilka cystern Amic. Nie da się ich uniknąć.” | Sprawdzić wzory z cysternami Amic (także po zamianie skórek na planszach i ruchome przeszkody): w praktyce bywa układ bez przejścia — znaleźć przyczynę (np. kilka cystern naraz na wszystkich torach albo za blisko siebie przy danej prędkości) i poprawić generator; test, który wcześniej by to wychwycił. | ⏳ |
| T2 | „Oznacz jakieś itemy do zebrania, które są wyżej i trzeba skoczyć (może jakaś obręcz, żeby wyróżnić? Zdaję się na Ciebie).” | Liście (i inne przedmioty) wysoko nad drogą — wyraźne oznaczenie, że trzeba po nie skoczyć (np. obręcz / pierścień wokół przedmiotu, cień na drodze pod nim, strzałka w górę). | ⏳ |
| T3 | „Obecnie działają tylko dwie plansze (sklep i festiwal roślin) plus bonus humbakiem.” | Sprawdzić przejście na planszę 3 (blokowisko PRL z dzikami) i 4 (stacja Amic) w prawdziwej grze na telefonie: czy kampania po festiwalu i Humbaczych Torach przechodzi dalej, czy wraca do początku / kończy się; naprawić i dodać test e2e całej kampanii. | ⏳ |

## Sowa w Chmurach (E6)

Brak uwag (na razie).

## Sowie Ogrody — nowa odsłona (E7)

Brak uwag (na razie).

## Łącz i Hoduj (E8)

Brak uwag (na razie).
