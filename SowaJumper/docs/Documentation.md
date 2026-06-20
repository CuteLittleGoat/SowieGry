# Sowa Jumper — dokumentacja techniczna

## Zakres
`SowaJumper` jest samodzielną grą HTML/CSS/JavaScript bez frameworka. Całość logiki, renderowania i sterowania znajduje się w `script.js`; `index.html` dostarcza strukturę strony, a `styles.css` odpowiada za pełnoekranowy, mobilny layout.

## Pliki
- `index.html` — canvas gry, HUD, komunikat sterowania i metadane mobilne.
- `styles.css` — pełnoekranowy layout, safe-area, blokada scrollowania, HUD i podpowiedzi sterowania dotykowego.
- `script.js` — pętla gry, fizyka, proceduralne generowanie świata, kolizje, mini-gra z humbakiem, rysowanie obiektów i zapis rekordów w `localStorage`.
- `docs/README.md` — instrukcja dla gracza.
- `docs/Documentation.md` — dokumentacja techniczna.

## Architektura gry
Gra działa na jednym elemencie `canvas#game`. Skrypt utrzymuje stan w obiekcie `state` oraz osobnych kolekcjach:
- `platforms`
- `goats`
- `leaves`
- `whales`
- `pracuTexts`
- `clouds`
- `particles`
- `bonusLeaves`
- `bonusPracu`

Główna pętla `loop()` używa `requestAnimationFrame()`. W zależności od `state.scene` wykonywana jest jedna z aktualizacji:
- `title` — ekran tytułowy z demonstracyjnym skakaniem sowy.
- `playing` — właściwa gra.
- `bonus` — mini-gra z humbakiem.
- `gameover` — ekran końca gry.

## Sterowanie i mobile
Gra jest projektowana jako mobile-first:
- `touch-action: none` i `overflow: hidden` blokują przewijanie strony podczas gry.
- Sterowanie dotykowe działa przez `pointerdown`, `pointermove`, `pointerup` i `pointercancel`.
- Lewa połowa ekranu ustawia `input.left`, prawa połowa `input.right`.
- Klawiatura obsługuje `A/D`, strzałki, `Spację` i `Enter`.

## Fizyka i kamera
- Sowa ma pozycję `x/y`, promień, prędkości `vx/vy` i animację skrzydeł.
- Grawitacja działa stale w trybie `playing`.
- Kamera podąża tylko w górę, gdy sowa przekroczy górną część ekranu.
- Wysokość w metrach jest liczona jako `Math.round(-cameraY / 10)`.
- Poziome wyjście poza ekran zawija sowę na drugą stronę.

## Platformy
`createPlatform()` tworzy platformy kilku typów:
- `normal` — zwykła platforma.
- `moving` — platforma poruszająca się w poziomie.
- `crumbly` — krusząca się platforma usuwana po użyciu.
- `amic` — stacja paliw Amic działająca jak katapulta.

Odstęp między platformami zależy od wysokości, dzięki czemu gra stopniowo robi się trudniejsza.

## Obiekty obowiązkowe
- **Liście monstery** (`leaves`) — podstawowe znajdźki punktowe.
- **Skaczące kozy** (`goats`) — poruszają się po platformach i wybijają sowę w górę.
- **Humbak** (`whales`) — po zebraniu uruchamia mini-grę bonusową.
- **Napisy „Pracu Pracu”** (`pracuTexts`) — przeszkody odbierające życie.
- **Stacje Amic** (`platform.type === "amic"`) — katapulty i element rytmu skoków.

## Mini-gra z humbakiem
`startBonus()` przełącza scenę na `bonus`. W mini-grze:
- sowa porusza się poziomo lewą/prawą stroną ekranu,
- monstery dają punkty,
- „Pracu Pracu” odejmuje punkty i wywołuje shake,
- po upływie czasu gracz wraca do głównej gry z dodatkowym wybiciem i krótką nietykalnością.

## HUD, rekordy i feedback
HUD pokazuje wysokość, punkty i życia. Gra zapisuje rekord punktów i rekord wysokości w `localStorage`:
- `sowaJumperBestScore`
- `sowaJumperBestHeight`

Feedback dla gracza obejmuje:
- komunikaty centralne,
- cząsteczki z etykietami punktów,
- krótkie trzęsienie ekranu po obrażeniach,
- miganie sowy podczas nietykalności.

## Zasady utrzymania
Przy każdej zmianie mechaniki, sterowania, UI lub obiektów aktualizuj oba pliki:
- `docs/README.md`
- `docs/Documentation.md`

Jeżeli zmiana dotyczy również ekranu startowego repozytorium, zaktualizuj także dokumentację w katalogu głównym `docs/`.
