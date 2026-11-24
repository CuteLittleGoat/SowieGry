# Sowi Bank — panel admina (dokumentacja kodu)

Panel admina udawanej waluty premium **Wypluffki** (Analiza 7b, rozdz. 8 — etap W2). Osobna strona `Admin/`
(adres `https://cutelittlegoat.github.io/SowieGry/Admin/`), niepodlinkowana z gier. Dane wyłącznie przez
`SowieCloud.bank` (`shared/sowie-cloud.js`), katalog i pakiety z `shared/meta/wypluffki.js`. Opis portfela, operacji
i reguł Firestore: `docs/Documentation.md`, rozdziały „Sowi Bank — `SowieCloud.bank`” i „`wypluffki.js`”.

## Pliki

| Plik                   | Zawartość                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `Admin/index.html`     | strona: ekran hasła admina i panel (sekcje z atrybutami `data-admin-*`), skrypty, `noindex` |
| `Admin/admin.js`       | moduł ES — logika panelu (niżej)                                                            |
| `Admin/admin.css`      | wygląd (telefon w pionie najpierw)                                                          |
| `Admin/package.json`   | `{ "type": "module" }` — `node --check` traktuje `admin.js` jako moduł                      |
| `Admin/docs/README.md` | instrukcja dla admina po polsku                                                             |

## `index.html`

- `<html lang="pl">`, `viewport` z `viewport-fit=cover`, `<meta name="robots" content="noindex, nofollow">`,
  `theme-color` `#3b2f4a`, ikona `../assets/icons/icon.svg`, tytuł „Sowi Bank” (z liczbą czekających próśb: „(2) Sowi
  Bank”).
- Style: `../shared/world/tokens.css` (tokeny kolorów i czcionka Fredoka 500/700) i `admin.css`.
- Skrypty (w tej kolejności): `../config/firebase-config.js`, `../shared/sowie-platform.js`, `../shared/sowie-cloud.js`
  (zwykłe skrypty), `admin.js` (moduł). **Bez** `password-gate.js` — panel nie pyta o hasło gracza.
- `section.admin-gate[data-admin-gate]` (na start ukryta): emoji 🦉💰🐐, nagłówek „Sowi Bank”, formularz
  `[data-admin-login]` z polem `#adminPassword` („Hasło admina”, `type=password`, bez autouzupełniania i poprawiania),
  przyciskiem „oka” `[data-admin-eye]` (`aria-pressed`), komunikatem błędu `[data-admin-login-error]` („To nie to hasło
  🐐”, `role=alert`) i „Wejdź”.
- `div.admin-panel[data-admin-panel]` (na start ukryty):
  - nagłówek „Sowi Bank _panel admina_”, stan połączenia `[data-admin-status]` (`role=status`), „Wyloguj”
    (`data-action="logout"`);
  - komunikat `[data-admin-message]` (`data-kind="ok" | "error"`), okno potwierdzenia `[data-admin-confirm]`;
  - `[data-admin-unknown]` — „Wczytuję portfel…” (tekst `[data-admin-unknown-text]`);
  - `[data-admin-create]` — „Portfel gracza jeszcze nie istnieje”: `[data-create-gift]` (domyślnie 500),
    `[data-create-note]` („Witamy w Sowim Banku!”), „Załóż portfel gracza” (`data-action="create"`);
  - `[data-admin-wallet]` — karty: saldo (`[data-admin-saldo]`, `[data-admin-stats]` — doładowano, wydano, VIP),
    „Hu-hu w kolejce” (`[data-admin-pending]`, „Odśwież”, lista `[data-admin-queue]`, rozwijane „Załatwione”
    `[data-admin-done]`), „Doładuj ręcznie” (przyciski `[data-amount]` +50 / +100 / +500 / +1000, `[data-manual-amount]`,
    `[data-manual-note]`, „Doładuj” `topup`, „Odejmij (korekta)” `correct`), „Ostatnie zakupy gracza”
    (`[data-admin-bought]`), „Ogłoszenie i promocja” (`[data-announce-text]`, `[data-announce-percent]`,
    `[data-announce-until]` typu `date`, „Zapisz ogłoszenie i promocję” `announce`), „Historia (ostatnie 30)”
    (`[data-admin-history]`);
  - stopka „Wypluffki nie są prawdziwe. Koza nie ucierpiała.”

## `admin.js`

- Importuje `PACKAGES`, `itemById`, `packageById`, `vipLevel` z `../shared/meta/wypluffki.js`; korzysta
  z `window.SowieCloud` i `SowieCloud.bank`. Bez SowieCloud — napis „Brak SowieCloud — panel nie może działać.”
- Stałe: `UNKNOWN_HINT_MS = 8000` (po tylu ms bez odczytu portfela — podpowiedź o publikacji reguł z Analizy 7b,
  Załącznik B, i o internecie), `REFRESH_MS = 30 000` (odświeżanie kolejki i historii, gdy karta jest widoczna).
- Formatowanie: `Intl.NumberFormat("pl-PL")` (liczby całkowite ≥ 0), `signed` (`+500`, `−50` ze znakiem minus U+2212),
  `formatTime` (`toLocaleString("pl-PL", dzień, miesiąc, godzina, minuta)`, brak czasu — „—”), `escapeHtml`.
- `REASONS` (eksport) — komunikaty powodów z `SowieCloud.bank`: `offline`, `laczenie`, `admin`, `brak-portfela`,
  `istnieje`, `zalatwione` („Ta prośba jest już załatwiona — to może stary zrzut ekranu?”), `brak-prosby`, `saldo`,
  `kwota`, `kod`, `brak`, `promocja`, `unknown`, `blad`. Etykiety rodzajów historii (`KINDS_LABEL`), stanów próśb
  (`STATUS_LABEL`: czeka ⏳, zatwierdzone ✅, odrzucone ❌) i połączenia (`STATUS_TEXT`).
- **Start:** `bank.isAdmin()` i `cloud.isUnlocked()` → panel (telefon wylogowany w menu gry — znowu ekran hasła admina, bo połączenie czekałoby na odblokowanie), inaczej ekran hasła (`showGate`): „oko” przełącza typ pola; „Wejdź” →
  `bank.unlockAdmin(haslo)` — `true` → panel, `false` → błąd i zaznaczenie pola.
- **`showPanel()`** (raz): delegacja kliknięć na `document` (`[data-amount]` wpisuje kwotę do pola ręcznego,
  `[data-action]` → funkcja z `actions`), `cloud.onStatus(renderStatus)`, po `cloud.ready` — `bank.onWallet(…)` (stan,
  `renderWallet`, `refreshLists`), podpowiedź po `UNKNOWN_HINT_MS`, odświeżanie co `REFRESH_MS` i po powrocie karty
  (`visibilitychange`).
- `renderWallet()` — widoczność sekcji (nieznany / brak portfela / portfel), saldo, statystyki z poziomem VIP
  (`vipLevel(wydano)`), zakupy od najnowszych (`itemById(id).label`, cena, czas, „Zwrot”), pola ogłoszenia i promocji
  wypełniane raz (data końca promocji − 1 ms jako `RRRR-MM-DD`).
- `refreshLists()` — `bank.requests(40)` i `bank.history(30)`; `renderRequests()` (czekające z przyciskami „Zatwierdź
  <kwota>”, „Inna kwota”, „Odrzuć”, liczba w znaczku i tytule karty, 10 ostatnich załatwionych z kwotą przyznaną
  i notką), `renderHistory()` (czas, zmiana, rodzaj, kod albo nazwa rzeczy przy zakupie i zwrocie, notka, saldo po).
- **Potwierdzenie** `askConfirm({ text, confirmLabel, amount, note, danger, run })` — okno z opcjonalnymi polami kwoty
  (`[data-confirm-amount]`) i notki (`[data-confirm-note]`); „Tak…” (`confirm-yes`) → `runConfirm()`: przyciski
  wyłączone, `run({ amount, note })` → `{ result, success }`, komunikat sukcesu albo powodu, odświeżenie list;
  „Anuluj” zamyka.
- **Akcje** (`actions`): `logout` (`bank.lockAdmin()`, przeładowanie), `refresh`, `create` (`bank.create({ prezent,
notka })`), `topup` i `correct` (potwierdzenie z kwotą z pola ręcznego i notką → `bank.topUp` / `bank.correct`),
  `approve` (prośba z listy: `bank.topUp({ kwota: prośba.kwota, notka, kod, bonus: pakiet.bonus })` — np. Czapeczka
  Nowicjusza z Pakietu Startowego), `approve-other` (to samo z własną kwotą), `reject` (`bank.reject` z notką „Koza się
  nie przestraszyła.”), `refund` (`bank.refund({ id, notka })`), `announce` (`bank.announce` — promocja do końca
  wybranego dnia w czasie telefonu admina: północ następnego dnia).
- Hak `window.SowiBankPanel` (`state()`, `packages`) — podgląd stanu w testach i diagnostyce.

## `admin.css`

- Zmienne `--admin-tlo` `#fff6e3`, `--admin-karta` `#fff`, `--admin-cien`, `--admin-promien` 18 px; tło strony
  gradient `--niebo-gora` → `--admin-tlo` (260 px), kolor tekstu `--kontur`, czcionka Fredoka 500 16 px / 1,45.
- Kolumna do 640 px z marginesami bezpiecznych obszarów (`env(safe-area-inset-*)`, co najmniej 16 px).
- Karty `.admin-card` (białe, zaokrąglone, cień), saldo 44 px pogrubione w kolorze `--sowa-ciemna`.
- Pola i przyciski co najmniej 48 px (małe przyciski 44 px), obramowanie 2 px `--kontur`, zaokrąglenie 14–16 px;
  przyciski: złote (`--zloto`), drugorzędne (`.is-secondary`, kremowe), niebezpieczne (`.is-danger`, różowe);
  szybkie kwoty `.admin-chip` (miętowe, `--monstera-jasna`); fokus — obwódka 3 px `--niebieski`.
- Okno potwierdzenia `.admin-confirm` przyklejone u góry (`position: sticky`), obramowanie 3 px.
- Komunikat `.admin-message` zielony, z `data-kind="error"` — różowy. Stan połączenia z kropką (zielona przy
  „połączono”, czerwona bez internetu i przy błędzie).

## PWA i testy

- `sw.js` (od `sowiegry-v16`) pomija adresy z `/Admin/` — panel zawsze z sieci, nigdy z pamięci aplikacji.
- `package.json`: `Admin` w formatowaniu Prettier, `Admin/index.html` w `html-validate`; `eslint.config.js`:
  `Admin/**/*.js` jako moduły ES.
- `tests/e2e/telefon/admin.spec.js` (emulator, profile telefonów, urządzenie bez hasła gracza): złe hasło „huhu” →
  „To nie to hasło 🐐”, „KoziAdmin” → „Portfel gracza jeszcze nie istnieje” → założenie z prezentem 500 → prośba
  z drugiego urządzenia (`bank.requestTopUp`, „Kieszeń Wypluffków”, `HU-7F3K-2Q`) → „Odśwież” → znaczek „1” i tytuł
  „(1) Sowi Bank” → „Zatwierdź 550” → saldo 1050, w „Załatwione” „zatwierdzone ✅ +550”, gracz czyta saldo i notkę
  „Za piękne hu-hu!” → doładowanie +100 i korekta −50 → saldo 1100, 4 wpisy historii, dokumenty w bazie; drugi test:
  zwrot Złotej skórki (saldo 501 → 1000, „Gracz jeszcze nic nie kupił.”), ogłoszenie i promocja 30% (w bazie),
  „Wyloguj” → ekran hasła. Oba bez błędów strony.
