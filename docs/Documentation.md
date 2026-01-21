# SowieGry — Dokumentacja techniczna

## Zakres
Ten dokument opisuje plik `index.html` w głównym katalogu repozytorium, czyli ekran startowy do wyboru gry.

## Struktura pliku `index.html`

### HTML
- `<!DOCTYPE html>` uruchamia tryb standardowy.
- `<html lang="pl">` ustawia język dokumentu na polski.
- `<head>` zawiera metadane (`charset`, `viewport`) i osadzony blok CSS.
- `<title>` ustawiony na **SowieGry — Start**.
- `<body>` zawiera pojedynczy komponent startowy.

**Główna hierarchia elementów:**
- `<main class="start-screen">` — kontener całego ekranu.
  - `<div class="floating-band">` — warstwa animowanych ozdób (nie klikalna, `aria-hidden`).
    - `span.creature` z emoji: sowa (🦉), koza (🐐), humbak (🐋), liść (🍃), monstera (🌿), alokazja (🪴).
    - `span.sparkles` — dwa pulsujące „poświaty”.
  - `<header>` — nagłówek z tytułem i podtytułem.
  - `<section class="cards">` — siatka kart gier.
    - `<a class="game-card" href="SowaRunner/">` — karta gry SowaRunner.
    - `<a class="game-card" href="SowaJumper/">` — karta gry SowaJumper.
  - `<p class="footer-note">` — krótka notatka na dole.

### Linkowanie
- Każda karta to link (`<a>`) do folderu gry.
- Ścieżki są względne, dzięki czemu działają po otwarciu lokalnie z dysku.

## Stylowanie (CSS)

### Ustawienia globalne
- `:root`:
  - `font-family`: "Trebuchet MS", "Comic Sans MS", "Segoe UI", sans-serif — miękki, „cute” charakter.
  - `color`: #2c2a32 (ciemny tekst).
  - `background`: #f7f2ff.
- `* { box-sizing: border-box; }` — ułatwia kontrolę rozmiarów.
- `body`:
  - tło w postaci radialnego gradientu (pastelowy róż, błękit i zieleń),
  - wyśrodkowanie zawartości (`display: flex`, `align-items`, `justify-content`).

### Kontener startowy
- `.start-screen`:
  - ograniczenie szerokości `min(1100px, 92vw)`.
  - duże `padding` i zaokrąglenie `border-radius: 32px`.
  - półprzezroczyste tło i cień (`box-shadow`) dla efektu karty.
  - `position: relative` i `overflow: hidden` dla animowanych ozdób.

### Nagłówek
- `header` używa flexbox do ułożenia tytułu i tekstu.
- `h1` ma responsywny rozmiar (`clamp`).
- `.subtitle` ma jaśniejszy kolor i mniejszy rozmiar.

### Karty gier
- `.cards` to siatka CSS Grid (`auto-fit`, `minmax(220px, 1fr)`), dzięki czemu karty układają się responsywnie.
- `.game-card`:
  - tło białe, cień, zaokrąglenie.
  - `transition` i `:hover` dla lekkiego uniesienia i podświetlenia obramowania.
- `.game-card h2` i `p` ustawiają hierarchię tekstu.

### Ozdoby i animacje
- `.floating-band` jest absolutnie pozycjonowane i ma `pointer-events: none` (nie blokuje kliknięć).
- `.creature`:
  - duży font-size (responsywny),
  - `filter: drop-shadow` dla miękkiego cienia,
  - animacja `floaty` (unoszenie i delikatny obrót).
- Pozycje ikon (`.owl`, `.goat`, `.whale`, `.leaf`, `.monstera`, `.alokazja`) są ustawione procentowo w obrębie kontenera.
- `.sparkles`:
  - duże koła z gradientem radialnym,
  - animacja `pulse` (pulsowanie skali i przezroczystości).

### Definicje animacji
- `@keyframes floaty`:
  - 0% i 100%: brak przesunięcia, lekki obrót w lewo.
  - 50%: przesunięcie do góry (`-18px`), obrót w prawo i delikatne powiększenie.
- `@keyframes pulse`:
  - 0% i 100%: mniejsza skala i niższa przezroczystość.
  - 50%: większa skala i wyższa przezroczystość.

## Logika działania
- Brak JavaScript — interakcja opiera się wyłącznie na linkach.
- Animacje są realizowane wyłącznie CSS (płynne i lekkie w renderowaniu).
- Użytkownik wybiera grę przez kliknięcie karty i przechodzi do odpowiedniego folderu.

## Wskazówki do odtworzenia 1:1
1. Utwórz plik `index.html` z opisanym HTML.
2. Wklej dokładny CSS w sekcji `<style>` (nazwa klas i wartości liczbowe muszą się zgadzać).
3. Ustaw emoji dokładnie w kolejności i z klasami: `owl`, `goat`, `whale`, `leaf`, `monstera`, `alokazja`.
4. Sprawdź, czy linki do gier prowadzą do `SowaRunner/` i `SowaJumper/`.
5. Zadbaj o `pointer-events: none` na warstwie ozdób, aby kliknięcia trafiały w karty.
