# Sowa Jumper — dokumentacja techniczna i projektowa (1:1)

Poniższy dokument opisuje aplikację tak, aby możliwe było odtworzenie gry **1:1** (logika, wartości liczbowe, UI, zachowanie). Wszystkie liczby, zakresy losowości, warunki i mechaniki są spisane wprost.

## 1. Struktura projektu
- `index.html` — szkielet strony, canvas gry i HUD.
- `styles.css` — pełnoekranowy layout i wygląd HUD/komunikatów.
- `script.js` — cała logika gry, renderowanie na canvasie, sterowanie, dźwięk.

## 2. Układ i UI
### 2.1. HTML
- Strona ma kontener `.game-wrapper` z:
  - `canvas#game` (pełnoekranowy, 100% szerokości i wysokości)
  - `.hud` z trzema kartami:
    - **Wysokość** (`#heightValue`)
    - **Życia** (`#livesValue`)
    - **Punkty** (`#scoreValue`)
  - `.controls` z tekstem instrukcji (po polsku):
    - „Dotknij po lewej/prawej stronie, aby sterować. Użyj strzałek ←/→ lub A/D. Kliknij, aby pohukać.”

### 2.2. CSS
- Cały `body` ma tło `#bfe7ff`, brak marginesów i jest wycentrowany.
- `.game-wrapper` zajmuje `100vw` x `100vh`, ma `position: relative` i `overflow: hidden`.
- `canvas#game` ma `display: block`, `touch-action: none`.
- HUD:
  - Pozycja: prawy górny róg (`right: 12px`, `top: 12px`).
  - Karty: jasne tło (`rgba(255, 255, 255, 0.85)`), zaokrąglenia (`14px`), cień (`0 6px 14px rgba(0,0,0,0.1)`).
  - Etykiety: uppercase, `0.75rem`.
  - Wartości: pogrubione, `1.1rem`.
- `.controls` jest na dole ekranu, pośrodku, z półprzezroczystym tłem i dużym zaokrągleniem.
- Media query (max-width: 600px): mniejsze odstępy i rozmiary.

## 3. Konfiguracja stanu gry
W `script.js` istnieje obiekt `state` z parametrami:
- `width`, `height`: rozmiar okna.
- `dpr`: `window.devicePixelRatio || 1`.
- `gravity`: **0.45**.
- `jumpPower`: **12** (odbicie od platformy).
- `boostPower`: **36** (3× standardowego skoku — od kozy).
- `catapultPower`: **120** (10× standardowego skoku — stacja Amic).
- `deathCatapultPower`: **120** (10× standardowego skoku po śmierci).
- `maxLives`: **5**.
- `invincibleUntil`: timestamp w ms (nietykalność po utracie życia).
- `cameraY`: pozycja kamery w osi Y.
- `highestY`: najwyższa (najmniejsza) pozycja sowy.
- `score`: licznik punktów.
- `lives`: startowo **3**.
- `lastHeight`: ostatnia osiągnięta wysokość do pokazania na ekranie tytułowym.
- `worldSpeed`: zdefiniowane, ale **nieużywane**.
- `phase`: tryb gry — `"title"` (ekran tytułowy) lub `"playing"`.

Obiekt `owl`:
- `x`, `y`: pozycja.
- `radius`: **18**.
- `vx`, `vy`: prędkość w osi X i Y.

Wejście (`input`):
- `left`, `right`: booleany ustawiane przez klawiaturę i wskaźnik.

## 4. Losowość i generatory
Funkcja `rand(min, max)` zwraca liczbę zmiennoprzecinkową z zakresu `[min, max)`.

### 4.1. Platformy
`createPlatform(y)`:
- `width`: losowo 90–140
- `height`: 20
- `x`: losowo 20–(width ekranu - szerokość platformy - 20)
- `y`: przekazywane do funkcji

`platformGap(y)`:
- Dla wysokości **poniżej 10 m**: odstęp 35–55 px.
- Dla wysokości **10–25 m**: odstęp 50–75 px.
- Powyżej 25 m: odstęp 55–85 px.
- Wysokość w metrach liczona jako `Math.round(-y / 10)`.

### 4.2. Kozy (boost)
`spawnGoat(platform)`:
- 35% szans na spawn, **dopiero od 20 m wysokości**.
- Parametry:
  - `x`: środek platformy.
  - `y`: `platform.y - 18`.
  - `vx`: -0.6 lub 0.6 (50/50).
  - `size`: 18.
  - `boostUsed`: `false`.

### 4.3. Wieloryby (życia/punkty)
`spawnWhale(y)`:
- Warunek: **od 30 m wysokości** i 20% szans.
- `x`: losowo 40–(szerokość-40)
- `y`: `y - rand(120, 300)` (dodatkowo wyżej niż platforma)
- `size`: 26
- `taken`: `false`

### 4.4. Liście (punkty)
`spawnLeaf(y)`:
- 30% szans.
- `x`: losowo 30–(szerokość-30)
- `y`: `y - rand(80, 220)`
- `type`: `monstera` (50%) lub `alocasia` (50%)
- `size`: 18–28
- `taken`: `false`

### 4.5. Chmury (tło)
`spawnCloud()`:
- `x`: 0–szerokość
- `y`: 0–wysokość
- `size`: 40–90
- `speed`: 0.2–0.6
- `opacity`: 0.4–0.8

### 4.6. Teksty „Pracu Pracu”
`spawnPracuText()`:
- `x`: -80–(szerokość+80)
- `y`: `height - rand(30, 80)` (dolny pas)
- `speed`: 0.5–1.2
- `font`: losowy z listy `fonts`
- `size`: 14–28

## 5. Inicjalizacja gry
### 5.1. `initGame()`
- Ustawia canvas na pełny rozmiar okna i skaluje do `dpr`.
- Czyści wszystkie tablice (`platforms`, `goats`, `whales`, `leaves`, `clouds`, `pracuTexts`).
- Ustawia sówkę na `x = width/2`, `y = height*0.65`, zeruje prędkości.
- Ustawia:
  - `cameraY = 0`
  - `highestY = owl.y`
  - `score = 0`
  - `lives = 3`
  - `invincibleUntil = 0`
  - `phase = "playing"`
- Generuje platformy od dołu w górę (pętla do `y > -600`):
  - Start: `y = height - 60`
- Kolejne platformy są wyżej o `platformGap(y)` (zagęszczenie do 25 m).
  - Dla każdej platformy: `spawnGoat`, `spawnLeaf`, `spawnWhale`.
- Dodaje **12 chmur**.
- Dodaje **10 tekstów „Pracu Pracu”**.

### 5.2. `initTitle()`
- Czyści wszystkie tablice.
- Ustawia sówkę na `x = width/2`, `y = height*0.55`, `vy = -jumpPower`.
- Ustawia `phase = "title"` i resetuje HUD.
- `lastHeight` pozostaje zapamiętane, aby wyświetlić wynik na ekranie tytułowym.
- Generuje platformy tylko w obrębie ekranu (`y` od `height - 80` do `height * 0.2`).
- Odstęp w ekranie tytułowym: `rand(60, 90)` (zagęszczone platformy).
- Dodaje **10 chmur** i **6 tekstów „Pracu Pracu”**.

## 6. Sterowanie i wejście
### 6.1. Klawiatura
- `keydown`:
  - Dowolny klawisz na ekranie tytułowym uruchamia `initGame()`.
  - `ArrowLeft` lub `a` → `input.left = true`
  - `ArrowRight` lub `d` → `input.right = true`
  - `Space` → `playHoot()` (dźwięk)
- `keyup`:
  - `ArrowLeft` lub `a` → `input.left = false`
  - `ArrowRight` lub `d` → `input.right = false`

### 6.2. Wskaźnik (mouse/touch/pointer)
- `pointerdown` na canvas:
  - Na ekranie tytułowym uruchamia `initGame()`.
  - jeśli `clientX < width/2` → lewo
  - w przeciwnym wypadku → prawo
  - zawsze uruchamia `playHoot()`
- `pointerup`/`pointercancel`: wyzerowanie obu kierunków.

### 6.3. Obsługa wejścia w czasie gry
`handleInput()`:
- Stała prędkość ruchu w poziomie: **4.2**.
- Jeśli `left` → `owl.vx = -4.2`.
- Jeśli `right` → `owl.vx = 4.2`.
- Gdy brak wejścia: `owl.vx *= 0.85` (tarcie).

## 7. Fizyka i kolizje
### 7.1. Aktualizacja stanu
**Ekran tytułowy (`updateTitle(delta)`):**
- Sowa skacze automatycznie: `owl.vy += gravity`, `owl.vx = sin(time / 600) * 1.4`.
- Kolizje z platformami działają jak w grze (odbicie).
- Gdy sowa spadnie poniżej ekranu → reset do środka i skok w górę.
- HUD jest wyzerowany (0 m, 3 życia, 0 punktów).

**Gra (`updateGame(delta)`):**
- Prędkość pionowa: `owl.vy += gravity`.
- Pozycje: `owl.x += owl.vx`, `owl.y += owl.vy`.

### 7.2. Teleportacja pozioma (wrap)
- Jeśli `owl.x < -radius` → `owl.x = width + radius`.
- Jeśli `owl.x > width + radius` → `owl.x = -radius`.

### 7.3. Platformy (odbicie)
Warunek odbicia:
- Sowa **spada** (`owl.vy > 0`) i jej obwiednia nachodzi na platformę:
  - `owl.x` w zakresie `[platform.x - radius, platform.x + width + radius]`
  - `owl.y + radius` w zakresie `(platform.y, platform.y + height + 6)`
Po spełnieniu:
- platforma standardowa/moving/breakable → `owl.vy = -jumpPower`
- platforma `"catapult"` (stacja Amic) → `owl.vy = -catapultPower`

### 7.4. Kozy (boost + punkty)
- Każda koza porusza się po platformie z `vx`.
- Odbicie od krawędzi platformy: jeśli zbliża się do `platform.x + 8` lub `platform.x + width - 8`, kierunek się odwraca.
- Kolizja z sową: dystans < `owl.radius + goat.size * 0.6`.
- Efekt:
  - `owl.vy = -boostPower` (3× standardowego skoku)
  - Jeśli `boostUsed` było `false`: +25 pkt i `boostUsed = true`.

### 7.5. Wieloryby (życie lub punkty)
- Kolizja jak wyżej (dystans < `owl.radius + size * 0.6`).
- Jeśli `lives < maxLives` → `lives += 1`.
- W przeciwnym razie → `score += 50`.
- `taken = true` po zebraniu.

### 7.6. Liście (punkty)
- Kolizja analogiczna.
- `monstera` → +30 pkt.
- `alocasia` → +20 pkt.
- `taken = true` po zebraniu.

## 8. Upadki i utrata życia
- `bottomLimit = height + 40`.
- Jeśli `owl.y - cameraY > bottomLimit` i **nie** jest w stanie nietykalności → `resetAfterFall()`.
- Dodatkowo istnieje pas „Pracu Pracu”:
  - `pracuBandY = height - 30`.
  - Jeśli `owl.y - cameraY > pracuBandY` i **nie** jest nietykalna → `resetAfterFall()`.

### 8.1. `resetAfterFall()`
- `lives -= 1`.
- Jeśli `lives <= 0`:
  - `lastHeight = Math.max(0, Math.round(-cameraY / 10))`
  - `initTitle()` (powrót na ekran tytułowy z zapamiętanym wynikiem)
- Po respawnie:
  - `owl.x = width/2`
  - `owl.y = height/2`
  - `owl.vx = 0`
  - `owl.vy = -deathCatapultPower` (10× standardowego skoku)
- Nietykalność przez 3 sekundy:
  - `invincibleUntil = performance.now() + 3000`

## 9. Kamera, wysokość i score
- `highestY` aktualizowane, gdy `owl.y` jest mniejsze niż dotychczasowe `highestY`.
- Wtedy `score += Math.abs(owl.vy) * 0.02`.
- `cameraY = Math.min(cameraY, owl.y - height * 0.35)` — kamera tylko podąża w górę.
- HUD:
  - **Wysokość:** `Math.max(0, Math.round(-cameraY / 10)) + " m"`.
  - **Punkty:** `Math.floor(score)`.
  - **Życia:** `lives`.

## 10. Generowanie świata w trakcie gry
- `topSpawnY = cameraY - 200`.
- Dopóki ostatnia platforma jest **powyżej** `topSpawnY`, generuj kolejne platformy:
  - Nowa platforma: `last.y - platformGap(last.y)`
  - Dla każdej nowej platformy: `spawnGoat`, `spawnLeaf`, `spawnWhale`.
- Usuwanie platform z dołu:
  - Gdy `platforms[0].y - cameraY > height + 120` → `shift()`.

## 11. Animacje tła
### 11.1. Chmury
- W każdej klatce: `cloud.y += cloud.speed * delta * 0.05`.
- Jeśli chmura spadnie poniżej ekranu: przenoszona jest nad widok (`cameraY - rand(80, 200)`) i losowany jest nowy `x`.

### 11.2. „Pracu Pracu”
- Każdy tekst przesuwa się w prawo o `speed`.
- Gdy `x > width + 100`: reset do `x = -120`, losuje nową czcionkę i rozmiar.

## 12. Renderowanie (canvas)
Kolejność rysowania w `draw()`:
1. `drawBackground()`:
   - wypełnienie tła kolorem `#bfe7ff`
   - chmury (białe elipsy z `globalAlpha`)
2. `drawPracuTexts()` (biały tekst + czerwony obrys)
3. Platformy (`drawPlatform`) — szare platformy jak w SowaRunner + stacje Amic dla katapult
4. Liście (Monstera/Alocasia z konturami i światłem)
5. Wieloryby (humbaki z cieniem i refleksami)
6. Kozy (białe bryły z szarymi kopytami, rogami i rumieńcami)
7. Sowa (`drawOwl`), z półprzezroczystością przy nietykalności, cieniem i skrzydłami jak w SowaRunner
8. Jeśli `phase === "title"` — półprzezroczysta plansza z tytułem, instrukcją startu i (opcjonalnie) ostatnią wysokością

### 12.1. Style rysowania
- Platforma standardowa/moving/breakable: prostokąt `rgba(90, 125, 155, 0.86)` z jasnym połyskiem (`rgba(255,255,255,0.4)`) i zaokrąglonymi rogami; przy platformie „breakable” po pęknięciu alfa spada do 0.35.
- Platforma „catapult”: renderowana jako stacja **Amic** (czerwony dach, biały korpus, czerwony panel z napisem „Amic”, jasne okna i szare dyspensery) — rysowana przez `drawAmicStation`.
- Koza: biała bryła (`roundRect`) z cieniem, jasnymi łatami, rogami, oczami i rumieńcami; skaluje się względem `goat.size`.
- Wieloryb (humbak): niebieskie ciało z cieniem, płetwą ogonową, jasnym brzuchem, okiem i refleksami wody; skaluje się względem `whale.size`.
- Liść: dwa warianty — **Monstera** z zielonymi warstwami, żyłkami i refleksami oraz **Alocasia** z jasnymi żyłkami i konturem; oba rysowane na białej poświacie i skalowane względem `leaf.size`.
- Sowa: ciało w odcieniach brązu, jasny brzuch, policzki, animowane skrzydła, cień pod spodem, oczy z połyskiem i mruganiem oraz żółty dziób.

### 12.2. Funkcje renderujące detale (nowe)
- `drawRunnerPlatform(x, y, width, height, alpha)` — rysuje standardową platformę z zaokrągleniami i połyskiem (jak w SowaRunner).
- `drawAmicStation(platform)` — rysuje stację Amic skalowaną do szerokości platformy katapultującej; zawiera dach, korpus, panel z napisem „Amic” i dyspensery.
- `drawMonsteraLeaf()` — liść Monstera z dwiema warstwami zieleni, wycięciami, refleksami oraz żyłkami.
- `drawAlocasiaLeaf()` — liść Alocasia z jasnymi żyłkami, konturem i długim ogonkiem.

## 13. Dźwięk
`playHoot()`:
- Tworzy `AudioContext`.
- Oscylator `triangle`, start 320 Hz → schodzi do 180 Hz w 0.4 s.
- Głośność start 0.2 → spada do 0.001 w 0.5 s.
- Dźwięk trwa 0.5 s.

## 14. Pętla gry
- `requestAnimationFrame(loop)`.
- `loop(time)`:
  - `delta = time - lastTime`
  - `updateTitle(delta)` lub `updateGame(delta)` w zależności od `phase`
  - `draw()`

## 15. Instrukcja dla przyszłych zmian (ważne)
**ZAWSZE, przy KAŻDEJ zmianie w przyszłości, aktualizuj oba pliki:**
- `docs/README.md`
- `docs/Documentation.md`

To jest obowiązkowy krok utrzymania zgodności dokumentacji z kodem.
