# SowieGry — stan wdrożenia planu „Cute Polish”

## Status ogólny

Plan z `PLAN_ROZWOJU_CUTE_POLISH.md` został wdrożony jako pierwsza kompletna wersja funkcjonalna. Zaimplementowano wspólny profil, kosmetyki, misje, ustawienia, pauzę, proceduralne audio, animacje sowy, combo, „O włos!”, odmiany liści, gorączkę monster, rozwój wszystkich trzech gier, zabezpieczenia przed układami bez wyjścia oraz rozbudowany finał `Sowa3`.

Implementacja nie korzysta z zewnętrznych sprite’ów ani plików audio. Dźwięki i proste motywy muzyczne są generowane przez Web Audio API.

## Wspólna warstwa

Pliki:

- `shared/cute-ui.css`,
- `shared/sowie-core.js`,
- `shared/sowie-runtime.js`,
- `shared/sowie-smoke-hook.js`.

Zaimplementowano:

- profil `sowieGryProfile`,
- wspólne ustawienia,
- garderobę,
- kosmetyki i odblokowania,
- misje i paski postępu,
- pauzę i wznowienie po zamknięciu modalu,
- proceduralne SFX i muzykę,
- powiadomienia oraz komentarze sowy,
- tryb `?debug=1`,
- ograniczenie częstotliwości zapisów.

Kosmetyki:

- kokardka,
- okulary,
- wianek,
- kapelusz ogrodnika,
- czapka z daszkiem,
- szalik,
- plecak,
- ślad bąbelków.

Ślad bąbelków ma działającą implementację w każdej grze; ustawienie ograniczonych efektów zmniejsza częstotliwość cząsteczek.

## Systemy wspólne w grach

- animacje i przechylenie sowy,
- squash-and-stretch,
- piórka i gwiazdki po obrażeniu,
- combo `×1`–`×5`,
- bliskie uniki „O włos!”,
- zwykłe, złote i tęczowe liście,
- gorączka monster,
- dodatkowe życia do limitu pięciu,
- trzy poziomy trudności,
- wspólne misje i statystyki,
- ostateczne moduły pauzy zatrzymujące wszystkie późne warstwy aktualizacji.

## SowaRunner

Zaimplementowano:

- bezpieczniejsze odstępy przeszkód,
- ograniczenie powtarzania typów przeszkód,
- zmianę pory dnia,
- wydarzenia „Deszcz monster” i „Kozi maraton”,
- zapowiadany przeciwny wiatr,
- znak ostrzegający o najbliższej przeszkodzie,
- perfekcyjne lądowania,
- combo i near miss,
- gorączkę monster,
- kosmetyki, piórka i bąbelki,
- profil, misje, audio i pauzę,
- podsumowanie near missów i combo.

Najważniejsze pliki:

- `render-fix.js`,
- `extra-lives.js`,
- `obstacle-balance.js`,
- `cute-rework.js`,
- `animation-polish.js`,
- `runner-events-extra.js`,
- `pause-final.js`.

## SowaJumper

Zaimplementowano:

- bezpieczniejsze generowanie platform,
- strefy wysokości: miasto, dachy, chmury, noc i sowie niebo,
- platformy: poduszka, chmurka, liść, balkon, punkt odpoczynku,
- dodatkowe platformy: obracająca, tymczasowa i kozia trampolina,
- perfekcyjne lądowania,
- combo i near miss,
- gorączkę monster,
- kosmetyki, piórka i bąbelki,
- profil, misje, audio i pauzę,
- poprawioną mini-grę humbaka,
- trzy pasy i ostrzeżenia w mini-grze,
- zabezpieczenie przed zamknięciem wszystkich pasów.

Najważniejsze pliki:

- `difficulty.js`,
- `extra-lives.js`,
- `bonus-fix.js`,
- `safety-balance.js`,
- `cute-loader.js`,
- `cute-rework.js`,
- `bonus-lanes.js`,
- `animation-polish.js`,
- `platform-expansion.js`,
- `pause-final.js`.

## Sowa3

### Czytelność

- dekoracje są lokowane na bokach albo nad horyzontem,
- `visibility-corridor.js` ponownie rysuje czysty trapez trasy,
- przeszkody i pickupy pozostają nad czystym korytarzem.

### Plansze

**Supermarket:** polski dyskont, boczne regały, „SUPER CENA!”, pieczywo, pracownik z paleciakiem i palety.

**Wystawa kwiatów:** hala, stojaki, cenówki, boczne wózki i zraszacze, ludzie jako przeszkody.

**Blokowisko:** wielka płyta, boczny trzepak i ławka, kot wysoko na balkonie, gołębie u góry, dziki jako przeszkody.

### Rozgrywka

- balans trzech torów,
- minimalny odstęp,
- bezpieczny ruch ludzi i dzików po ostrzeżeniu,
- anulowanie ruchu, jeśli tor jest zajęty lub powstałaby ściana trzech przeszkód,
- combo, near miss i gorączka monster,
- kosmetyki, piórka i bąbelki,
- profil, misje, audio i pauza.

### Finał

- okrągły basen naziemny,
- szara pionowo ryflowana ścianka,
- niebieski rant,
- turkusowa woda i fale,
- sowa dobiega i wskakuje do basenu,
- pojawia się plusk,
- sowa zmienia się w humbaka,
- koza odpoczywa na leżaku,
- grill znajduje się z boku działki,
- po pierwszym pełnym obejrzeniu finał można skrócić.

Najważniejsze pliki:

- `difficulty.js`,
- `extra-lives.js`,
- `visual-polish.js`,
- `stage-ambience.js`,
- `stage-obstacles.js`,
- `lane-balance.js`,
- `visibility-corridor.js`,
- `finish-pool.js`,
- `finish-details.js`,
- `cute-rework.js`,
- `moving-obstacle-safety.js`,
- `finish-controls.js`,
- `animation-polish.js`,
- `pause-guard.js`.

## Testy

Dodano:

- `.github/workflows/js-check.yml` — `node --check` wszystkich plików JavaScript,
- `tests/smoke.html` — przeglądarkowy test trzech gier,
- `shared/sowie-smoke-hook.js` — raportowanie błędów ramek.

W tej sesji GitHub nie zwrócił żadnego uruchomienia workflow dla przygotowanego commitu walidacyjnego. Lokalny klon repo również nie był możliwy z powodu braku rozwiązywania DNS dla `github.com`. Z tego powodu nie należy jeszcze traktować kontroli składni i testu przeglądarkowego jako zaliczonych.

## Testy nadal wymagające wykonania

- uruchomienie `tests/smoke.html` przez lokalny serwer lub GitHub Pages,
- potwierdzenie workflow GitHub Actions,
- playtest telefonu w pionie i poziomie,
- balans `Chaos`,
- częstotliwość wydarzeń i gorączki,
- pełny cykl kosmetyków i misji,
- kilka pełnych przejść finału `Sowa3`.

## Dług techniczny

Wydzielono wspólną warstwę `shared/`, ale istniejące gry nadal korzystają z modułów opakowujących funkcje globalne. Pełne scalenie każdej gry do nowego `game.js`, `config.js` i jawnego systemu hooków pozostaje odrębnym refaktorem technicznym. Nie powinno być wykonywane bez wcześniejszego testu regresji obecnej wersji.

## Definicja stabilnego wydania

Przed oznaczeniem wersji jako stabilnej należy:

1. uzyskać zielony wynik `tests/smoke.html`,
2. potwierdzić `node --check` w GitHub Actions,
3. wykonać ręczny playtest mobilny,
4. skorygować balans na podstawie rozgrywki.
