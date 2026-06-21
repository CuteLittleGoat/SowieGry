# Audyt merge i integracji „Cute Polish”

Data audytu: 2026-06-21

## Zakres

Punktem odniesienia był commit sprzed pełnego reworku:

```text
4db72dbbfa26453e6b2aa10e7ee961320d94b019
```

Sprawdzono aktualny `main`, kolejność ładowania modułów, łańcuchy nadpisywanych funkcji, znaczniki konfliktów, otwarte pull requesty oraz składnię wszystkich plików JavaScript.

## Wynik kontroli historii

- `main` jest liniowym rozwinięciem punktu odniesienia.
- Nie znaleziono znaczników konfliktu `<<<<<<<`, `=======` ani `>>>>>>>`.
- Nie stwierdzono utraty commitów z punktu odniesienia.
- Techniczne PR-y walidacyjne nie zostały scalone do `main`.
- Przestarzałe PR-y walidacyjne zostały zamknięte.

## Wynik kontroli składni

Workflow:

```text
JavaScript syntax check
```

zakończył się powodzeniem dla stanu `main` użytego w audycie. Workflow uruchamia `node --check` dla wszystkich plików `.js`.

## Sprawdzone kolejności ładowania

### SowaRunner

Końcowa kolejność zachowuje:

1. silnik bazowy,
2. poprawkę renderowania,
3. dodatkowe życia,
4. balans przeszkód,
5. wspólny profil,
6. systemy „cute”,
7. animacje,
8. dodatkowe wydarzenia,
9. końcowy guard pauzy.

### SowaJumper

Loader czeka na `extra-lives.js`, `bonus-fix.js` oraz `safety-balance.js`, a następnie ładuje kolejno:

1. `cute-rework.js`,
2. `bonus-lanes.js`,
3. `animation-polish.js`,
4. `platform-expansion.js`,
5. `pause-final.js`.

Po audycie loader nie uruchamia już niepełnego pakietu po przekroczeniu limitu czasu. Zamiast tego zatrzymuje się i zgłasza błąd.

### Sowa3

Kolejność renderowania zachowuje scenografię przed `visibility-corridor.js`, dzięki czemu czysty korytarz trasy jest rysowany przed przeszkodami. `pause-guard.js` jest ładowany na końcu i pozostaje ostatnią warstwą `update()`.

## Problemy wykryte i naprawione

### 1. Mnożnik spawnu Sowa3

Warunek rozpoznający ustawienie nowego interwału spawnu sprawdzał wartość sprzed klatki w sposób, który często pomijał reset timera. Po poprawce nowy interwał jest rozpoznawany przez wzrost `state.spawn` względem wartości wejściowej.

### 2. Pauza i modale

Po zamknięciu garderoby lub ustawień gra była zawsze wznawiana, nawet jeśli użytkownik wcześniej ręcznie ją zapauzował. Stan pauzy jest teraz zapamiętywany i przywracany.

### 3. Pauza późnych modułów

Doprecyzowano końcowe guardy pauzy:

- `SowaRunner` zatrzymuje również cząsteczki, chmury i wygaszanie shake,
- `SowaJumper` zachowuje czas nietykalności, komunikatów i animacji obrażenia,
- `Sowa3` zachowuje komunikaty i animację obrażenia.

### 4. Platforma tymczasowa SowaJumper

Jej czas zniknięcia korzystał z czasu ściennego `performance.now()`, więc długa pauza mogła spowodować natychmiastowe zniknięcie po wznowieniu. Timer działa teraz na `delta` aktualizacji i nie biegnie podczas pauzy.

### 5. Ślad bąbelków w bonusie SowaJumper

W mini-grze humbaka współrzędna pionowa była dodatkowo przesuwana o kamerę świata głównego. Bonus korzysta teraz z bezpośredniej współrzędnej ekranowej.

### 6. Nakładanie się HUD-u

Po dodaniu pola `Combo` układ nadal miał trzy kolumny. Wspólna warstwa ustawia cztery kolumny, a pasek narzędzi jest pionowy przy lewej krawędzi, dzięki czemu nie nachodzi na wybór trudności.

### 7. Zdublowane dźwięki

Kilka nakładających się modułów mogło zgłosić ten sam efekt dźwiękowy w jednej klatce. Wspólna warstwa stosuje krótki debounce dla identycznych efektów.

## Elementy bez wykrytych błędów merge

- wspólny profil i klucze `localStorage`,
- kolejność dodatkowych żyć,
- trzy poziomy trudności,
- mini-gra humbaka w `SowaJumper`,
- balans torów i ruchome przeszkody `Sowa3`,
- czysty korytarz wizualny `Sowa3`,
- finał działki i przemiana w humbaka,
- kolejność renderowania kosmetyków,
- odwołania do istniejących plików modułów.

## Ograniczenia audytu

Kontrola składni nie zastępuje pełnego playtestu. Nadal należy wykonać:

1. `tests/smoke.html` w prawdziwej przeglądarce,
2. pełne przejście każdej gry na telefonie,
3. test pion/poziom,
4. dłuższy test poziomu `Chaos`,
5. pełny cykl misji i odblokowań,
6. kilka kolejnych przejść finału `Sowa3`.

## Ocena

Nie znaleziono błędu typu nieudany merge, pozostawiony konflikt lub utrata gałęzi zmian. Znaleziono kilka błędów integracyjnych powstałych przez nakładanie modułów; wszystkie potwierdzone podczas audytu zostały poprawione na `main`.
