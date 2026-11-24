// Panel admina Sowiego Banku (Analiza 7b, rozdz. 8 — etap W2): saldo Wypluffków gracza, kolejka próśb „Hu-hu
// w kolejce” ze zrzutów ekranu, doładowanie i korekta, zwroty zakupów, ogłoszenie i promocja w Butiku, historia.
// Dane wyłącznie przez SowieCloud (`SowieCloud.bank` — shared/sowie-cloud.js); hasło „KoziAdmin” jest w kodzie
// (decyzja właściciela — jeden gracz i jeden admin, bez zaawansowanych zabezpieczeń).
import { PACKAGES, itemById, packageById, vipLevel } from "../shared/meta/wypluffki.js";

const cloud = window.SowieCloud;
const bank = cloud?.bank;

// Ile czekamy na portfel, zanim pokażemy podpowiedź o regułach (przed publikacją reguł z etapu W2 baza odmawia).
const UNKNOWN_HINT_MS = 8000;
// Kolejka i historia odświeżają się co tyle, gdy karta jest widoczna (prośby nie mają nasłuchu — zwykłe zapytanie).
const REFRESH_MS = 30_000;

const $ = (selector) => document.querySelector(selector);
const number = new Intl.NumberFormat("pl-PL");
const formatNumber = (value) => number.format(Math.max(0, Math.floor(Number(value) || 0)));
const signed = (value) => `${value > 0 ? "+" : "−"}${formatNumber(Math.abs(value))}`;
const formatTime = (ms) =>
  ms
    ? new Date(ms).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "—";
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  );

// Komunikaty dla powodów z SowieCloud.bank (`{ ok: false, reason }`).
export const REASONS = Object.freeze({
  offline: "Brak połączenia z Sowim Bankiem — sprawdź internet.",
  laczenie: "Jeszcze się łączę — spróbuj za chwilę.",
  admin: "Najpierw wpisz hasło admina.",
  "brak-portfela": "Portfel gracza jeszcze nie istnieje.",
  istnieje: "Portfel gracza już istnieje.",
  zalatwione: "Ta prośba jest już załatwiona — to może stary zrzut ekranu?",
  "brak-prosby": "Nie ma takiej prośby.",
  saldo: "Gracz ma za mało Wypluffków.",
  kwota: "Kwota musi być od 1 do 100 000.",
  kod: "Zły kod prośby.",
  brak: "Gracz nie ma tej rzeczy.",
  promocja: "Promocja: od 1 do 90% i data końca.",
  unknown: "Nieznana rzecz.",
  blad: "Coś poszło nie tak. Spróbuj jeszcze raz.",
});

const KINDS_LABEL = Object.freeze({ doladowanie: "Doładowanie", korekta: "Korekta", zwrot: "Zwrot", zakup: "Zakup" });
const STATUS_LABEL = Object.freeze({ czeka: "czeka ⏳", zatwierdzone: "zatwierdzone ✅", odrzucone: "odrzucone ❌" });
const STATUS_TEXT = Object.freeze({
  online: "połączono",
  zapisywanie: "zapisuję…",
  laczenie: "łączę…",
  offline: "bez internetu",
  blad: "błąd zapisu",
  haslo: "",
});

const packageLabel = (id) => packageById(id)?.label || id || "—";
const itemLabel = (id) => itemById(id)?.label || id;

const state = { wallet: null, known: false, requests: [], history: [], confirm: null, announceFilled: false };

// --- ekran hasła admina ---------------------------------------------------------------------------

function showGate() {
  $("[data-admin-gate]").hidden = false;
  $("[data-admin-panel]").hidden = true;
  const form = $("[data-admin-login]");
  const input = $("#adminPassword");
  const error = $("[data-admin-login-error]");
  const eye = $("[data-admin-eye]");
  eye.addEventListener("click", () => {
    const visible = input.type === "password";
    input.type = visible ? "text" : "password";
    eye.setAttribute("aria-pressed", String(visible));
    eye.setAttribute("aria-label", visible ? "Ukryj hasło" : "Pokaż hasło");
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (bank.unlockAdmin(input.value)) {
      input.value = "";
      error.hidden = true;
      showPanel();
    } else {
      error.hidden = false;
      input.select();
    }
  });
  input.focus();
}

// --- panel ------------------------------------------------------------------------------------------

function message(text, kind = "ok") {
  const node = $("[data-admin-message]");
  node.textContent = text;
  node.dataset.kind = kind;
  node.hidden = !text;
}

function reasonText(result) {
  return REASONS[result?.reason] || REASONS.blad;
}

function renderStatus(status) {
  $("[data-admin-status]").textContent = STATUS_TEXT[status] ?? status;
  $("[data-admin-status]").dataset.status = status;
}

function renderWallet() {
  const wallet = state.wallet;
  $("[data-admin-unknown]").hidden = state.known;
  $("[data-admin-create]").hidden = !state.known || Boolean(wallet);
  $("[data-admin-wallet]").hidden = !wallet;
  if (!wallet) return;
  const vip = vipLevel(wallet.wydano);
  $("[data-admin-saldo]").textContent = formatNumber(wallet.saldo);
  $("[data-admin-stats]").textContent =
    `Doładowano ${formatNumber(wallet.doladowano)} · Wydano ${formatNumber(wallet.wydano)} · ` +
    `VIP: ${vip.emoji} ${vip.label}`;
  const bought = Object.entries(wallet.kupione || {}).sort((a, b) => b[1].at - a[1].at);
  $("[data-admin-bought]").innerHTML = bought.length
    ? bought
        .map(
          ([id, entry]) => `<li class="admin-item" data-item="${escapeHtml(id)}">
            <span><strong>${escapeHtml(itemLabel(id))}</strong> · ${formatNumber(entry.cena)} · ${formatTime(entry.at)}</span>
            <button type="button" class="admin-button is-small is-secondary" data-action="refund" data-id="${escapeHtml(id)}">Zwrot</button>
          </li>`,
        )
        .join("")
    : `<li class="admin-empty">Gracz jeszcze nic nie kupił.</li>`;
  if (!state.announceFilled) {
    state.announceFilled = true;
    $("[data-announce-text]").value = wallet.ogloszenie || "";
    if (wallet.promocja) {
      $("[data-announce-percent]").value = String(wallet.promocja.procent);
      $("[data-announce-until]").value = new Date(wallet.promocja.do - 1).toLocaleDateString("sv-SE");
    }
  }
}

function renderRequests() {
  const waiting = state.requests.filter((request) => request.status === "czeka");
  const done = state.requests.filter((request) => request.status !== "czeka").slice(0, 10);
  $("[data-admin-pending]").textContent = String(waiting.length);
  document.title = waiting.length ? `(${waiting.length}) Sowi Bank` : "Sowi Bank";
  $("[data-admin-queue]").innerHTML = waiting.length
    ? waiting
        .map(
          (request) => `<li class="admin-request" data-request="${escapeHtml(request.kod)}">
            <span><strong>${escapeHtml(request.kod)}</strong> · ${escapeHtml(packageLabel(request.pakiet))} ·
              ${formatNumber(request.kwota)} · ${formatTime(request.at)}</span>
            <span class="admin-row">
              <button type="button" class="admin-button is-small" data-action="approve" data-kod="${escapeHtml(request.kod)}">Zatwierdź ${formatNumber(request.kwota)}</button>
              <button type="button" class="admin-button is-small is-secondary" data-action="approve-other" data-kod="${escapeHtml(request.kod)}">Inna kwota</button>
              <button type="button" class="admin-button is-small is-danger" data-action="reject" data-kod="${escapeHtml(request.kod)}">Odrzuć</button>
            </span>
          </li>`,
        )
        .join("")
    : `<li class="admin-empty">Nic nie czeka. Koza odpoczywa.</li>`;
  $("[data-admin-done]").innerHTML = done.length
    ? done
        .map(
          (request) => `<li>${escapeHtml(request.kod)} · ${escapeHtml(packageLabel(request.pakiet))} ·
            ${STATUS_LABEL[request.status] || escapeHtml(request.status)}${
              request.status === "zatwierdzone" ? ` +${formatNumber(request.kwotaPrzyznana)}` : ""
            }${request.notka ? ` · „${escapeHtml(request.notka)}”` : ""}</li>`,
        )
        .join("")
    : `<li class="admin-empty">Jeszcze nic.</li>`;
}

function renderHistory() {
  $("[data-admin-history]").innerHTML = state.history.length
    ? state.history
        .map(
          (entry) =>
            `<li data-kind="${escapeHtml(entry.rodzaj)}">${formatTime(entry.at)} · <strong>${signed(
              entry.zmiana,
            )}</strong> · ${escapeHtml(KINDS_LABEL[entry.rodzaj] || entry.rodzaj)}${
              entry.kod
                ? ` · ${escapeHtml(entry.rodzaj === "zakup" || entry.rodzaj === "zwrot" ? itemLabel(entry.kod) : entry.kod)}`
                : ""
            }${entry.notka ? ` · „${escapeHtml(entry.notka)}”` : ""} · saldo ${formatNumber(entry.saldoPo)}</li>`,
        )
        .join("")
    : `<li class="admin-empty">Historia jest pusta.</li>`;
}

async function refreshLists() {
  const [requests, history] = await Promise.all([bank.requests(40), bank.history(30)]);
  state.requests = requests;
  state.history = history;
  renderRequests();
  renderHistory();
}

// --- potwierdzenie (z opcjonalnymi polami kwoty i notki) ---------------------------------------------

function askConfirm({ text, confirmLabel, amount = null, note = null, danger = false, run }) {
  state.confirm = { run, amount, note };
  const box = $("[data-admin-confirm]");
  box.innerHTML = `<p>${escapeHtml(text)}</p>
    ${amount !== null ? `<label class="admin-label">Kwota <input type="number" inputmode="numeric" min="1" max="100000" value="${escapeHtml(amount)}" data-confirm-amount /></label>` : ""}
    ${note !== null ? `<label class="admin-label">Notka dla gracza <input type="text" maxlength="120" value="${escapeHtml(note)}" data-confirm-note /></label>` : ""}
    <span class="admin-row">
      <button type="button" class="admin-button${danger ? " is-danger" : ""}" data-action="confirm-yes">${escapeHtml(confirmLabel)}</button>
      <button type="button" class="admin-button is-secondary" data-action="confirm-no">Anuluj</button>
    </span>`;
  box.hidden = false;
  box.scrollIntoView?.({ block: "nearest" });
  box.querySelector("input, [data-action='confirm-yes']")?.focus();
}

function closeConfirm() {
  state.confirm = null;
  const box = $("[data-admin-confirm]");
  box.hidden = true;
  box.innerHTML = "";
}

async function runConfirm() {
  const pending = state.confirm;
  if (!pending) return;
  const box = $("[data-admin-confirm]");
  const values = {
    amount: Math.floor(Number(box.querySelector("[data-confirm-amount]")?.value)),
    note: box.querySelector("[data-confirm-note]")?.value ?? "",
  };
  box.querySelectorAll("button").forEach((button) => (button.disabled = true));
  const { result, success } = await pending.run(values);
  closeConfirm();
  if (result.ok) message(success(result), "ok");
  else message(reasonText(result), "error");
  refreshLists();
}

// --- akcje ------------------------------------------------------------------------------------------------

const manualAmount = () => Math.floor(Number($("[data-manual-amount]").value));
const manualNote = () => $("[data-manual-note]").value.trim();

const actions = {
  logout() {
    bank.lockAdmin();
    location.reload();
  },
  refresh() {
    message("");
    refreshLists();
  },
  async create() {
    const prezent = Math.floor(Number($("[data-create-gift]").value) || 0);
    const result = await bank.create({ prezent, notka: $("[data-create-note]").value });
    if (result.ok)
      message(prezent ? `Portfel założony — prezent ${formatNumber(prezent)} Wypluffków.` : "Portfel założony.");
    else message(reasonText(result), "error");
    refreshLists();
  },
  topup() {
    const kwota = manualAmount();
    askConfirm({
      text: "Doładować konto gracza?",
      confirmLabel: "Tak, doładuj",
      amount: kwota || "",
      note: manualNote(),
      run: async ({ amount, note }) => ({
        result: await bank.topUp({ kwota: amount, notka: note }),
        success: () => `Doładowano ${formatNumber(amount)} Wypluffków.`,
      }),
    });
  },
  correct() {
    const kwota = manualAmount();
    askConfirm({
      text: "Odjąć Wypluffki z konta gracza (korekta)?",
      confirmLabel: "Tak, odejmij",
      amount: kwota || "",
      note: manualNote(),
      danger: true,
      run: async ({ amount, note }) => ({
        result: await bank.correct({ kwota: amount, notka: note }),
        success: () => `Odjęto ${formatNumber(amount)} Wypluffków.`,
      }),
    });
  },
  approve(button, { other = false } = {}) {
    const request = state.requests.find((entry) => entry.kod === button.dataset.kod);
    if (!request) return;
    const pack = packageById(request.pakiet);
    askConfirm({
      text: other
        ? `Ile Wypluffków dać za ${request.kod} (${packageLabel(request.pakiet)})?`
        : `Zatwierdzić ${request.kod}: +${formatNumber(request.kwota)} Wypluffków (${packageLabel(request.pakiet)})?`,
      confirmLabel: "Zatwierdź",
      amount: other ? request.kwota : null,
      note: manualNote() || "Za piękne hu-hu!",
      run: async ({ amount, note }) => {
        const kwota = other ? amount : request.kwota;
        return {
          result: await bank.topUp({ kwota, notka: note, kod: request.kod, bonus: pack?.bonus || [] }),
          success: () => `Zatwierdzono ${request.kod}: +${formatNumber(kwota)} Wypluffków.`,
        };
      },
    });
  },
  "approve-other"(button) {
    actions.approve(button, { other: true });
  },
  reject(button) {
    const kod = button.dataset.kod;
    askConfirm({
      text: `Odrzucić prośbę ${kod}?`,
      confirmLabel: "Odrzuć",
      note: "Koza się nie przestraszyła.",
      danger: true,
      run: async ({ note }) => ({
        result: await bank.reject({ kod, notka: note }),
        success: () => `Odrzucono ${kod}.`,
      }),
    });
  },
  refund(button) {
    const id = button.dataset.id;
    const entry = state.wallet?.kupione?.[id];
    askConfirm({
      text: `Zwrócić „${itemLabel(id)}”? Gracz odzyska ${formatNumber(entry?.cena)} Wypluffków.`,
      confirmLabel: "Tak, zwróć",
      note: "Zwrot",
      danger: true,
      run: async ({ note }) => ({
        result: await bank.refund({ id, notka: note }),
        success: (result) => `Zwrócono „${itemLabel(id)}” (+${formatNumber(result.cena)}).`,
      }),
    });
  },
  async announce() {
    const procent = Math.floor(Number($("[data-announce-percent]").value) || 0);
    const until = $("[data-announce-until]").value;
    // Promocja trwa do końca wybranego dnia (czas telefonu admina).
    const end = until ? new Date(`${until}T00:00:00`).getTime() + 24 * 3600 * 1000 : 0;
    const result = await bank.announce({
      ogloszenie: $("[data-announce-text]").value,
      promocja: procent > 0 ? { procent, do: end } : null,
    });
    message(result.ok ? "Zapisano ogłoszenie i promocję." : reasonText(result), result.ok ? "ok" : "error");
  },
  "confirm-yes": runConfirm,
  "confirm-no": closeConfirm,
};

function bindActions() {
  document.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-amount]");
    if (chip) {
      $("[data-manual-amount]").value = chip.dataset.amount;
      return;
    }
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;
    const action = actions[button.dataset.action];
    if (action) action(button);
  });
}

let started = false;

async function showPanel() {
  $("[data-admin-gate]").hidden = true;
  $("[data-admin-panel]").hidden = false;
  if (started) return;
  started = true;
  bindActions();
  cloud.onStatus(renderStatus);
  renderWallet();
  await cloud.ready;
  bank.onWallet((wallet) => {
    state.wallet = wallet;
    state.known = true;
    renderWallet();
    refreshLists();
  });
  setTimeout(() => {
    if (!state.known) {
      $("[data-admin-unknown-text]").textContent =
        "Nie mogę odczytać portfela. Czy reguły Firestore z Analizy 7b (Załącznik B) są już opublikowane? " +
        "Sprawdź też internet.";
    }
  }, UNKNOWN_HINT_MS);
  setInterval(() => {
    if (document.visibilityState === "visible" && state.known) refreshLists();
  }, REFRESH_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && state.known) refreshLists();
  });
}

if (!bank) {
  document.body.textContent = "Brak SowieCloud — panel nie może działać.";
} else if (bank.isAdmin() && cloud.isUnlocked()) {
  // Hasło admina zapamiętane i połączenie odblokowane. Gdy telefon wylogowano w menu gry („Wyloguj to urządzenie”),
  // panel pyta o hasło admina jeszcze raz — inaczej czekałby bez końca na odblokowanie połączenia.
  showPanel();
} else {
  showGate();
}

// Haki dla testów i diagnostyki (bez hasła — tylko odczyt stanu panelu).
window.SowiBankPanel = Object.freeze({ state: () => ({ ...state }), packages: PACKAGES.map((pack) => pack.id) });
