# SowaRunner — instrukcja gry

## Cel gry
`SowaRunner` to boczny endless runner arcade. Sowa biegnie automatycznie, a gracz skacze, używa podwójnego skoku, zbiera liście monstery, odbija się od kóz, zdobywa dodatkowe życia i próbuje przeżyć jak najdłużej.

## Uruchomienie
1. Otwórz `SowaRunner/index.html` w przeglądarce.
2. Wybierz poziom trudności: `1`, `2`, `3` albo klik/tap w kartę trudności.
3. Naciśnij **Spację**, kliknij albo dotknij ekranu, aby rozpocząć.

Gra jest przygotowana pod urządzenia mobilne: jedno tapnięcie służy do startu i skoku.

## Sterowanie
- **Spacja / klik / tap** — start, skok, podwójny skok.
- **Strzałka w górę / Enter** — alternatywny skok na klawiaturze.
- **1 / 2 / 3** — wybór poziomu trudności na ekranie tytułowym.

W mini-grze z humbakiem tapnięcie unosi sowę, a brak tapnięcia pozwala jej opadać.

## Obiekty i zasady
- **Liście monstery** — punkty.
- **Serduszka** — dodatkowe życia. Jeżeli masz już maksymalnie 5 żyć, serduszko daje punkty zamiast kolejnego życia.
- **Skaczące kozy** — można je „stompnąć” z góry, żeby dostać mocny boost i punkty. Kontakt z boku zabiera życie.
- **Humbak** — specjalny bonus. Złapanie humbaka uruchamia mini-grę.
- **Napisy „Pracu Pracu”** — przeszkody; kontakt zabiera życie lub w mini-grze odejmuje punkty.
- **Stacje paliw Amic** — przeszkody z bezpiecznym dachem. Lądowanie na dachu wybija sowę jak katapulta, ale zderzenie z bokiem szkodzi.
- **Dziury i ściany** — klasyczne przeszkody runnera.

## Balans przeszkód
Gra ma dodatkowy moduł balansu przeszkód. Wymusza on większy odstęp między kolejnymi przeszkodami blokującymi, ogranicza powtarzanie tego samego typu przeszkody i daje więcej czasu na reakcję, szczególnie na wyższych prędkościach.

## Poziomy trudności
- **Chill** — spokojniejszy rozbieg.
- **Arcade** — główny tryb.
- **Chaos** — większa prędkość i ciaśniejsze odstępy, ale nadal z minimalnym odstępem między przeszkodami.

## Koniec gry i rekordy
Startujesz z **3 życiami**. W trakcie gry możesz zdobywać kolejne życia przez zbieranie serduszek, maksymalnie do **5 żyć**. Po utracie wszystkich żyć pojawia się ekran wyniku. Najlepszy dystans i najlepszy wynik są zapisywane lokalnie w przeglądarce.
