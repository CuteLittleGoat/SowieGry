# SowieGry — stan wdrożenia planu „Cute Polish”

## Status ogólny

Plan z `PLAN_ROZWOJU_CUTE_POLISH.md` został wdrożony jako pierwsza kompletna wersja funkcjonalna. Wszystkie główne kategorie planu mają działającą implementację:

- wspólny profil,
- kosmetyki,
- misje,
- pauza i ustawienia,
- syntetyczne dźwięki i muzyka,
- animacje sowy,
- combo,
- „O włos!”,
- odmiany liści,
- gorączka monster,
- rozwój indywidualny trzech gier,
- zabezpieczenia przed niemożliwymi układami,
- rozbudowany finał `Sowa3`,
- tryb diagnostyczny,
- test przeglądarkowy,
- workflow kontroli składni JavaScript.

Implementacja pozostaje proceduralna i nie korzysta z zewnętrznych plików audio ani sprite’ów. Muzyka i dźwięki są generowane przez Web Audio API.

---

## Wspólna warstwa

### Pliki

- `shared/cute-ui.css`
- `shared/sowie-core.js`
- `shared/sowie-runtime.js`
- `shared/sowie-smoke-hook.js`

### Zaimplementowane

- jeden profil `sowieGryProfile` w `localStorage`,
- wspólne ustawienia muzyki, efektów, komentarzy i ograniczonych efektów,
- wspólna garderoba,
- wspólny wybór kosmetyku,
- odblokowania kosmetyczne,
- misje i paski postępu,
- syntetyczne efekty dźwiękowe,
- proste motywy muzyczne zależne od gry lub planszy,
- pauza,
- powiadomienia,
- wspólny pasek narzędzi,
- tryb diagnostyczny `?debug=1`,
- ograniczenie częstotliwości zapisu profilu,
- automatyczne wznowienie gry po zamknięciu modalu.

### Kosmetyki

- brak dodatku,
- kokardka,
- okulary,
- wianek,
- kapelusz ogrodnika,
- czapka z daszkiem,
- szalik,
- plecak,
- ślad bąbelków jako odblokowanie profilowe.

---

## Systemy wspólne w grach

### Animacja i osobowość sowy

- mruganie i machanie skrzydłami pozostają częścią bazowych animacji,
- squash-and-stretch przy lądowaniu,
- wydłużenie podczas wybicia,
- przechylenie zgodne z ruchem,
- gwiazdki po obrażeniu,
- piórka podczas ruchu,
- krótkie komentarze sowy,
- kosmetyki wyświetlane na postaci,
- hitbox nie zmienia się wraz z animacją.

### Combo

- progi `×1`–`×5`,
- wzrost przez znajdźki, bliskie uniki i perfekcyjne lądowania,
- reset po utracie życia,
- osobny HUD combo,
- misja za osiągnięcie `×4`.

### „O włos!”

- wykrywanie bliskich uników dostosowane do mechaniki każdej gry,
- premia punktowa,
- zwiększenie combo,
- efekt dźwiękowy,
- misja za trzy bliskie uniki.

### Liście i gorączka monster

- zwykłe liście,
- złote liście,
- tęczowe liście,
- premie zależne od combo,
- gorączka monster po serii zbiórek,
- większa liczba punktowych obiektów bez zwiększania liczby przeszkód.

---

## SowaRunner

### Nowe i rozwinięte systemy

- bezpieczniejsze odstępy przeszkód,
- ograniczenie powtarzania tego samego typu przeszkody,
- zmiana pory dnia,
- wydarzenie „Deszcz monster”,
- wydarzenie „Kozi maraton”,
- perfekcyjne lądowania,
- combo i near miss,
- gorączka monster,
- animacje i kosmetyki,
- wspólne misje i profil,
- pauza oraz audio,
- podsumowanie near missów i combo po końcu biegu.

### Pliki reworku

- `SowaRunner/render-fix.js`
- `SowaRunner/extra-lives.js`
- `SowaRunner/obstacle-balance.js`
- `SowaRunner/cute-rework.js`
- `SowaRunner/animation-polish.js`

---

## SowaJumper

### Nowe i rozwinięte systemy

- bezpieczniejsze generowanie platform,
- ograniczenie serii trudnych platform,
- strefy wysokości:
  - miasto,
  - dachy,
  - chmury,
  - nocne niebo,
  - surrealistyczne sowie niebo,
- nowe platformy:
  - poduszka,
  - chmurka,
  - liść,
  - balkon,
  - punkt odpoczynku,
- punkty odpoczynku co około 150 metrów,
- perfekcyjne lądowania,
- combo i near miss,
- gorączka monster,
- animacje i kosmetyki,
- wspólne misje i profil,
- pauza oraz audio,
- poprawiona mini-gra humbaka,
- trzy pasy mini-gry,
- ostrzeżenia przed przeszkodami mini-gry,
- zabezpieczenie przed zablokowaniem wszystkich pasów.

### Pliki reworku

- `SowaJumper/difficulty.js`
- `SowaJumper/extra-lives.js`
- `SowaJumper/bonus-fix.js`
- `SowaJumper/safety-balance.js`
- `SowaJumper/cute-loader.js`
- `SowaJumper/cute-rework.js`
- `SowaJumper/bonus-lanes.js`
- `SowaJumper/animation-polish.js`

---

## Sowa3

### Czytelność trasy

- wszystkie dekoracje są projektowane na bokach albo wysoko nad horyzontem,
- `visibility-corridor.js` ponownie rysuje czysty trapez trasy po scenografii,
- przeszkody i pickupy są rysowane dopiero nad czystym korytarzem,
- płaskie oznaczenia nawierzchni nie zasłaniają torów.

### Plansze

#### Supermarket

- polski dyskont bez kopiowania konkretnego logo,
- boczne regały,
- tablice „SUPER CENA!”,
- stosy produktów,
- pieczywo i automat boczny,
- pracownik z paleciakiem przy brzegu,
- palety jako przeszkody.

#### Wystawa kwiatów

- hala targowa,
- stojaki pełne roślin,
- cenówki,
- boczne wózki z roślinami,
- boczne zraszacze i mgiełka,
- ludzie jako przeszkody.

#### Blokowisko

- wielka płyta,
- powtarzalne okna i balkony,
- przygaszona kolorystyka,
- boczny trzepak i ławka,
- kot wysoko na balkonie,
- gołębie wysoko na ekranie,
- dziki jako przeszkody.

### Rozgrywka

- balans trzech torów,
- minimalny odstęp między przeszkodami,
- ruch części ludzi i dzików między torami po ostrzeżeniu,
- combo i near miss,
- gorączka monster,
- złote i tęczowe liście,
- animacje, kosmetyki i piórka,
- wspólne misje i profil,
- pauza oraz audio,
- podsumowanie planszy.

### Finał działki

- okrągły basen naziemny,
- szara pionowo ryflowana ścianka,
- niebieski rant,
- jasna turkusowa woda,
- fale i refleksy,
- trawa, płot, krzewy i drzewa,
- sowa dobiega do basenu,
- sowa wskakuje do wody,
- pojawia się plusk,
- sowa zmienia się w humbaka,
- po pierwszym pełnym obejrzeniu animację można skrócić tapnięciem.

### Pliki reworku

- `Sowa3/difficulty.js`
- `Sowa3/extra-lives.js`
- `Sowa3/visual-polish.js`
- `Sowa3/stage-ambience.js`
- `Sowa3/stage-obstacles.js`
- `Sowa3/lane-balance.js`
- `Sowa3/visibility-corridor.js`
- `Sowa3/finish-pool.js`
- `Sowa3/cute-rework.js`
- `Sowa3/finish-controls.js`
- `Sowa3/animation-polish.js`

---

## Testy

### Automatyczne

- `.github/workflows/js-check.yml` — `node --check` dla wszystkich plików JavaScript.
- `tests/smoke.html` — test uruchomieniowy trzech gier w przeglądarce.
- `shared/sowie-smoke-hook.js` — raportowanie błędów z ramek testowych.

### Sposób uruchomienia testu przeglądarkowego

1. Uruchomić repo przez lokalny serwer HTTP albo GitHub Pages.
2. Otworzyć `tests/smoke.html`.
3. Sprawdzić, czy wszystkie trzy karty mają status zielony.
4. Otworzyć każdą grę także ręcznie z parametrem `?debug=1`.

### Testy nadal wymagające wykonania ręcznego

- dłuższy playtest na telefonie,
- test orientacji pionowej i poziomej,
- balans poziomu `Chaos`,
- częstotliwość wydarzeń,
- czytelność paska narzędzi na bardzo małych ekranach,
- pełny cykl odblokowania wszystkich kosmetyków,
- kilka pełnych przejść finału `Sowa3`.

---

## Dług techniczny

Plan zakładał docelowe scalenie wielu hotfixów z głównymi plikami gier. Wprowadzono wspólną warstwę `shared/`, ale istniejące moduły nadpisujące funkcje nadal pozostają. Pełne przepisanie każdej gry do jednego nowego silnika nie zostało wykonane w tym samym wdrożeniu, ponieważ groziłoby jednoczesną regresją wszystkich działających mechanik.

Zalecany późniejszy etap techniczny:

1. scalić moduły każdej gry w `game.js`, `config.js` i pliki systemowe,
2. zastąpić kolejne nadpisania funkcji jawnym systemem aktualizacji,
3. zachować obecne pliki jako punkt odniesienia do czasu ukończenia testów regresji.

---

## Definicja gotowości tej wersji

Wersja jest funkcjonalnie kompletna w zakresie planu, ale przed oznaczeniem jej jako stabilnego wydania należy:

- uzyskać pozytywny wynik `tests/smoke.html`,
- potwierdzić kontrolę składni w GitHub Actions,
- wykonać ręczny playtest mobilny,
- skorygować wartości balansu na podstawie rzeczywistej rozgrywki.
