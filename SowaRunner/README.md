# Sowa Runner

Przeglądarkowa gra typu endless runner napisana w **p5.js** i **p5.sound**. Sterujesz sową biegnącą przez łąkę, zbierasz liście i omijasz przeszkody. Gra oferuje trzy poziomy trudności, licznik punktów, mini‑gierkę po spotkaniu z kozą oraz proste efekty dźwiękowe.

## Spis treści
- [Funkcje](#funkcje)
- [Wymagania](#wymagania)
- [Uruchomienie lokalne](#uruchomienie-lokalne)
- [Sterowanie](#sterowanie)
- [Przebieg rozgrywki](#przebieg-rozgrywki)
  - [Poziomy trudności](#poziomy-trudności)
  - [Punktacja](#punktacja)
- [Struktura plików](#struktura-plików)
- [Dalszy rozwój](#dalszy-rozwoj)

## Funkcje
- Endless runner w pełnym oknie przeglądarki (canvas p5.js).
- Trzy poziomy trudności z różnym tempem gry i liczbą żyć.
- Podwójny skok i krótka nietykalność po kolizji.
- Mini‑gierka fal po spotkaniu z kozą, nagradzająca punktami i czasem dodatkowym życiem.
- Punkty naliczane za czas biegu oraz zbieranie liści (monstera, alocasia).
- Prosty HUD z punktami, życiami i aktywną trudnością.
- Efekty dźwiękowe oparte o WebAudio (biblioteka p5.sound).

## Wymagania
- Przeglądarka obsługująca WebGL/Canvas oraz dźwięk (np. Chrome, Firefox, Edge, Safari).
- Dowolny prosty serwer statyczny (Python, Node, Ruby, PHP itp.), jeśli chcesz uruchomić grę lokalnie bezpośrednio z repozytorium.

## Uruchomienie lokalne
1. Sklonuj repozytorium lub pobierz paczkę ZIP.
2. W katalogu projektu uruchom serwer statyczny, np.:
   - Python 3: `python -m http.server 8000`
   - Node (pakiet `serve`): `npx serve .`
3. Otwórz w przeglądarce adres `http://localhost:8000`.
4. Jeśli przeglądarka zapyta o odtwarzanie dźwięku, udziel zgody.

> Jeśli pracujesz offline, możesz zamiast CDN wykorzystać lokalne pliki `p5.js` i `p5.sound.min.js` – wystarczy w `index.html` podmienić adresy na ścieżki lokalne.

## Sterowanie
- **Wybór poziomu trudności:** klawisze `1`, `2` lub `3`, albo kliknięcie na przyciski na ekranie startowym.
- **Start / skok / podwójny skok:** spacja lub kliknięcie. Drugi skok dostępny jest w trakcie lotu.
- **Powrót do ekranu startowego:** klawisz `R`.
- **Wyciszenie:** użyj sterowania głośnością w przeglądarce lub systemie (gra nie ma osobnego przycisku wyciszenia).

## Przebieg rozgrywki
- Gra startuje po wybraniu trudności i wykonaniu pierwszego skoku/kliku.
- Na HUD widzisz aktualną liczbę punktów, żyć oraz aktywny poziom trudności.
- Przeszkody (dziury, mury, stacje „Amic”) trzeba omijać – zderzenie bez nietykalności zabiera jedno życie i uruchamia krótką nietykalność. Na daszku stacji „Amic” można bezpiecznie wylądować jak na platformie.
- Liście unoszą się nad trasą; podniesienie ich daje punkty i jest uwzględniane w podsumowaniu po utracie wszystkich żyć.
- Spotkanie z kozą uruchamia mini‑gierkę fal; jej ukończenie dodaje premię punktową i może przyznać dodatkowe życie.
- Po utracie wszystkich żyć gra wraca do ekranu startowego, pokazując ostatni wynik, czas biegu i informacje o zebranych liściach.

### Poziomy trudności
- **Łatwy:** wolniejsze tempo, więcej serc startowych, dłuższe okno nietykalności oraz luźniej rozstawione przeszkody.
- **Normalny:** domyślny balans przeszkód i prędkości.
- **Trudny:** szybszy bieg, gęstsze przeszkody i krótsza nietykalność.

### Punktacja
- **Czas biegu:** punkty rosną wraz z dystansem przebytym przez sowę.
- **Liście:** każdy zebrany liść zwiększa wynik; niektóre mogą mieć wyższą wartość.
- **Mini‑gierka:** ukończenie fali z kozą przyznaje premię punktową i sporadycznie dodatkowe życie.

## Struktura plików
- `index.html` – ładuje p5.js/p5.sound (domyślnie z CDN) oraz szkic gry `sketch.js`.
- `sketch.js` – logika gry, obsługa wejścia, rysowanie obiektów, kolizje i dźwięki WebAudio.
- `style.css` – style ustawiające pełnoekranowe płótno i przyciski trudności.
- `p5.js`, `p5.sound.min.js` – lokalne kopie bibliotek p5; można je użyć zamiast CDN przy pracy offline.

## Dalszy rozwój
- Dodać tryb pauzy i osobny przycisk wyciszenia dźwięków.
- Rozszerzyć mini‑gierkę kozy o więcej rodzajów fal lub bossów.
- Zapisywać najlepszy wynik w `localStorage`, aby utrzymać progres między sesjami.
- Umożliwić zmianę sterowania (np. strzałki lub przyciski dotykowe) z menu ustawień.
- Dodać ekran pomocy/poradnik oraz opcjonalny licznik FPS dla debugowania.
