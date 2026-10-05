// Zakładka „Sowa”: profil (poziom, XP, piórka), garderoba, zadania dnia i tygodnia (Sowia Akademia), rekordy
// wszystkich gier (okno z Top 10 na poziom trudności) i ustawienia: dźwięk, efekty, wibracje, Tryb Przytulny,
// komentarze sowy, stan zapisu i „Wyloguj to urządzenie”.
import { MISSION_LABELS } from "../meta/missions.js";
import { taskProgress } from "../meta/progress.js";
import { ICONS } from "../ui/icons.js";
import { openModal } from "../ui/modal.js";
import { drawOwl } from "../world/owl.js";
import { cloudStatusInfo } from "./cloud-status.js";
import { formatNumber, recordText } from "./games.js";

// Misje profilu odblokowujące dodatki: opisy z shared/meta/missions.js (klucze jak w SowiePlatform.DEFAULT_MISSIONS).
export { MISSION_LABELS };

const DIFFICULTIES = [
  ["chill", "Chill"],
  ["arcade", "Arcade"],
  ["chaos", "Chaos"],
];
const VOLUME_KEYS = { master: "volumeMaster", music: "volumeMusic", sfx: "volumeSfx" };
// Wyłączenie suwaka do zera wyłącza też muzykę / efekty w obecnych grach (settings.music / settings.sfx).
const VOLUME_SWITCH = { music: "music", sfx: "sfx" };
const IDLE_SUMMARY = {
  ogrody: [
    ["lifetimeLeaves", "Liście w całej grze"],
    ["prestiges", "Wielkie Przesadzania"],
    ["zone", "Rozdział"],
  ],
  // Łącz i Hoduj (od E8e): podsumowanie zapisywane przez saveGameState.
  szklarnia: [
    ["rooms", "Odnowione pomieszczenia"],
    ["orders", "Zamówienia sąsiadek"],
    ["hybrids", "Hybrydy"],
    ["poolBest", "Rekord Basenu Humbaka"],
  ],
};

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  );
const formatDate = (ms) =>
  Number(ms) > 0 ? new Date(Number(ms)).toLocaleDateString("pl-PL", { day: "numeric", month: "short" }) : "";

// Podpowiedź przy zablokowanym dodatku: misja, która go odblokowuje, i jej postęp.
export function cosmeticHint(key, missions = {}, defaults = {}) {
  const entry = Object.entries(defaults).find(([, mission]) => mission.reward === key);
  if (!entry) return "";
  const [missionKey, fallback] = entry;
  const mission = { ...fallback, ...(missions[missionKey] || {}) };
  const progress = Math.min(Number(mission.target) || 0, Math.floor(Number(mission.progress) || 0));
  return `${MISSION_LABELS[missionKey] || missionKey} (${formatNumber(progress)} / ${formatNumber(mission.target)})`;
}

// Gry z samouczkiem (identyfikatory w bazie): Sowia Ucieczka, Sowie Tory (sowa3), Sowa w Chmurach (jumper), nowe Ogrody.
export const TUTORIAL_GAMES = Object.freeze(["runner", "sowa3", "jumper", "ogrody", "szklarnia"]);

export function createOwlTab({ root, cloud, platform, academy, audio, atlas, onCosmetic = () => {} }) {
  const profile = () => cloud?.profile?.() || {};
  const settings = () => profile().settings || {};
  const save = (changes) =>
    cloud?.updateProfile?.((current) => Object.assign((current.settings ||= {}), changes), { delayMs: 1000 });
  let openRecords = null;

  function toggle(label, key, on, note = "") {
    return `<button type="button" class="sowie-ui-toggle" data-setting="${key}" aria-pressed="${on}"><span>${label}${note ? `<small>${note}</small>` : ""}</span><span class="sowie-ui-switch" aria-hidden="true"></span></button>`;
  }

  function slider(bus, label) {
    const engine = audio();
    const value = engine ? engine.volume(bus) : "";
    return `<label class="sowie-ui-slider"><span>${label}</span><input type="range" min="0" max="100" step="1" value="${value}" data-volume="${bus}" ${engine ? "" : "disabled"} /><output>${engine ? value : "—"}</output></label>`;
  }

  function profileCard() {
    const data = academy()?.snapshot?.() || { level: 1, levelXp: 0, nextLevelXp: 100, feathers: 0 };
    const share = Math.min(1, (Number(data.levelXp) || 0) / Math.max(1, Number(data.nextLevelXp) || 1));
    return `<section class="menu-card" data-owl-card="profil" aria-labelledby="sowa-profil">
      <div class="menu-profile">
        <canvas data-profile-owl aria-hidden="true"></canvas>
        <div class="menu-level">
          <h3 id="sowa-profil">Poziom ${formatNumber(data.level)}</h3>
          <span>${formatNumber(data.levelXp)} / ${formatNumber(data.nextLevelXp)} XP</span>
          <span class="menu-progress" role="progressbar" aria-label="Postęp poziomu" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(share * 100)}"><span style="transform:scaleX(${share})"></span></span>
          <span>Piórka: <strong>${formatNumber(data.feathers)}</strong></span>
        </div>
      </div>
    </section>`;
  }

  function wardrobeCard() {
    const owned = profile().cosmetics || { unlocked: ["none"], selected: "none" };
    const chips = Object.entries(platform.COSMETICS)
      .map(([key, item]) => {
        const unlocked = key === "none" || owned.unlocked?.includes(key);
        const hint = unlocked ? "" : cosmeticHint(key, profile().missions, platform.DEFAULT_MISSIONS);
        return `<li><button type="button" class="menu-chip" data-cosmetic="${key}" aria-pressed="${owned.selected === key}" ${unlocked ? "" : "disabled"}>${unlocked ? "" : ICONS.lock}<span>${escapeHtml(item.label)}</span></button>${hint ? `<small>${escapeHtml(hint)}</small>` : ""}</li>`;
      })
      .join("");
    return `<section class="menu-card" data-owl-card="garderoba" aria-labelledby="sowa-garderoba">
      <h3 id="sowa-garderoba">Garderoba</h3>
      <p>Wybrany dodatek sowa nosi we wszystkich grach.</p>
      <ul class="menu-wardrobe">${chips}</ul>
    </section>`;
  }

  function tasksCard() {
    const tasks = taskProgress(academy()?.snapshot?.());
    const rows = tasks.length
      ? tasks
          .map((task) => {
            const share = task.target ? Math.min(1, task.progress / task.target) : 0;
            return `<li class="${task.done ? "is-done" : ""}" data-task="${escapeHtml(task.id)}">
              <strong>${escapeHtml(task.label)}</strong>
              <strong>${task.done ? "Zrobione!" : `${formatNumber(task.progress)} / ${formatNumber(task.target)}`}</strong>
              <span class="menu-progress" role="progressbar" aria-label="Postęp: ${escapeHtml(task.label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(share * 100)}"><span style="transform:scaleX(${share})"></span></span>
            </li>`;
          })
          .join("")
      : "<li><span>Wczytuję zadania…</span></li>";
    return `<section class="menu-card" data-owl-card="zadania" aria-labelledby="sowa-zadania">
      <h3 id="sowa-zadania">Zadania</h3>
      <p>Trzy zadania dnia i jedno tygodnia — nagrody (XP i piórka) przychodzą same.</p>
      <ul class="menu-list">${rows}</ul>
    </section>`;
  }

  function recordsCard() {
    const records = profile().records || {};
    const ready = cloud?.isReady?.();
    const rows = platform.GAME_REGISTRY.map((game) => {
      const text = ready ? recordText(game.id, records) || "Jeszcze bez rekordu" : "…";
      return `<li class="menu-records-row">
        <span><strong>${escapeHtml(game.name)}</strong><br /><span data-owl-record="${game.id}">${escapeHtml(text)}</span></span>
        <button type="button" class="menu-button" data-records="${game.id}" aria-label="Rekordy: ${escapeHtml(game.name)}">${ICONS.star}<span>Rekordy</span></button>
      </li>`;
    }).join("");
    return `<section class="menu-card" data-owl-card="rekordy" aria-labelledby="sowa-rekordy">
      <h3 id="sowa-rekordy">Rekordy</h3>
      <ul class="menu-list">${rows}</ul>
    </section>`;
  }

  function settingsCard() {
    const current = settings();
    const engine = audio();
    const status = cloudStatusInfo(cloud?.status?.(), cloud?.mode?.());
    return `<section class="menu-card" id="ustawienia" data-owl-card="ustawienia" aria-labelledby="sowa-ustawienia" tabindex="-1">
      <h3 id="sowa-ustawienia">Ustawienia</h3>
      <div class="menu-settings">
        ${slider("master", "Głośność ogólna")}
        ${slider("music", "Muzyka")}
        ${slider("sfx", "Efekty dźwiękowe")}
        ${toggle("Efekty (wstrząsy, cząsteczki)", "effects", !current.reducedEffects)}
        ${toggle("Wibracje", "vibration", current.vibration !== false, engine && !engine.canVibrate() ? "Ten telefon nie obsługuje wibracji." : "")}
        ${toggle("Tryb Przytulny (wolniej, bez końca gry)", "cozy", Boolean(current.cozy), "Zadziała w nowych wersjach gier.")}
        ${toggle("Komentarze sowy", "quips", current.quips !== false)}
      </div>
      <p class="menu-save-state" data-save-state>${status.long}</p>
      <button type="button" class="menu-button" data-tutorials-reset>${ICONS.restart}<span>Powtórz samouczki we wszystkich grach</span></button>
      <button type="button" class="menu-button is-danger" data-logout>${ICONS.lock}<span>Wyloguj to urządzenie</span></button>
    </section>`;
  }

  function render() {
    root.innerHTML = [
      profileCard(),
      tasksCard(),
      wardrobeCard(),
      recordsCard(),
      '<div data-install-slot="sowa"></div>',
      settingsCard(),
    ].join("");
    drawProfileOwl();
  }

  // Sowa w profilu (z wybranym dodatkiem) — rysowana raz, po każdej zmianie profilu.
  function drawProfileOwl() {
    const canvas = root.querySelector("[data-profile-owl]");
    const sheet = atlas();
    if (!canvas || !sheet?.ready?.()) return;
    const size = 96;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    const context = canvas.getContext("2d");
    const unit = (size * dpr) / 1.7;
    context.setTransform(unit, 0, 0, unit, 0, 0);
    drawOwl(context, sheet, 0.85, 1.55, { size: 1.15, cosmetic: profile().cosmetics?.selected || "none" });
  }

  // Silnik dźwięku gotowy (manifest wczytany później niż zakładka) — suwaki bez przebudowy zakładki.
  function updateAudio() {
    const engine = audio();
    if (!engine) return;
    for (const input of root.querySelectorAll("[data-volume]")) {
      input.disabled = false;
      input.value = String(engine.volume(input.dataset.volume));
      input.nextElementSibling.textContent = input.value;
    }
  }

  function updateStatus(status) {
    const node = root.querySelector("[data-save-state]");
    if (node) node.textContent = cloudStatusInfo(status, cloud?.mode?.()).long;
  }

  // ---------- Rekordy (okno) ----------

  function openRecordsModal(gameId, trigger) {
    const game = platform.GAME_REGISTRY.find((entry) => entry.id === gameId);
    if (!game) return;
    const content = document.createElement("div");
    content.className = "menu-records";
    let difficulty = "arcade";
    // Gra z trybami (np. Sowie Tory: Kampania / Nieskończony) — osobne rekordy i top 10 każdego trybu.
    const modes = game.modes || [];
    let mode = modes[0]?.id || null;
    let request = 0;

    async function renderArcade() {
      const best = cloud.records(gameId, difficulty, mode);
      const all = cloud.records(gameId);
      const metric =
        gameId === "runner"
          ? ["Dystans", best.bestDistance]
          : gameId === "jumper"
            ? ["Wysokość", best.bestHeight]
            : null;
      const modeLabel = modes.find((item) => item.id === mode)?.label;
      content.innerHTML = `
        ${
          modes.length
            ? `<div class="menu-chips" role="group" aria-label="Tryb gry">${modes
                .map(
                  (item) =>
                    `<button type="button" data-mode="${item.id}" aria-pressed="${item.id === mode}">${item.label}</button>`,
                )
                .join("")}</div>`
            : ""
        }
        <div class="menu-chips" role="group" aria-label="Poziom trudności">${DIFFICULTIES.map(
          ([key, label]) =>
            `<button type="button" data-difficulty="${key}" aria-pressed="${key === difficulty}">${label}</button>`,
        ).join("")}</div>
        <dl class="menu-stats">
          <div><dt>Najlepszy wynik</dt><dd data-best>${formatNumber(best.bestScore)} pkt</dd></div>
          ${metric ? `<div><dt>${metric[0]}</dt><dd>${formatNumber(metric[1])} m</dd></div>` : ""}
          <div><dt>Rozgrywki</dt><dd>${formatNumber(all.runs)}</dd></div>
        </dl>
        <h3>Top 10 — ${modeLabel ? `${modeLabel}, ` : ""}${DIFFICULTIES.find(([key]) => key === difficulty)[1]}</h3>
        <div data-top><p>Wczytuję…</p></div>`;
      const current = (request += 1);
      let rows = [];
      try {
        rows = await cloud.topRuns(gameId, difficulty, mode);
      } catch (_error) {
        rows = null;
      }
      if (current !== request) return;
      const holder = content.querySelector("[data-top]");
      if (!rows) holder.innerHTML = "<p>Nie udało się wczytać wyników — spróbuj za chwilę.</p>";
      else if (!rows.length) holder.innerHTML = "<p>Brak rozgrywek na tym poziomie. Zagraj, żeby ustanowić rekord!</p>";
      else {
        holder.innerHTML = `<ol class="menu-top">${rows
          .map((row) => {
            const extra =
              gameId === "runner" && Number.isFinite(Number(row.distance))
                ? ` · ${formatNumber(row.distance)} m`
                : Number.isFinite(Number(row.height))
                  ? ` · ${formatNumber(row.height)} m`
                  : "";
            return `<li><strong>${formatNumber(row.score)} pkt</strong>${extra}<span>${formatDate(row.at)}</span></li>`;
          })
          .join("")}</ol>`;
      }
    }

    function renderIdle() {
      const summary = cloud.records(gameId);
      content.innerHTML = `<p>Postęp tej gry zapisuje się w chmurze i jest taki sam na każdym urządzeniu.</p>
        <dl class="menu-stats">${(IDLE_SUMMARY[gameId] || [])
          .map(([key, label]) => {
            const value = summary[key];
            return `<div><dt>${label}</dt><dd>${typeof value === "number" ? formatNumber(value) : escapeHtml(value ?? "—")}</dd></div>`;
          })
          .join("")}</dl>`;
    }

    content.addEventListener("click", (event) => {
      const modeButton = event.target.closest("[data-mode]");
      if (modeButton) {
        mode = modeButton.dataset.mode;
        renderArcade().then(() => content.querySelector(`[data-mode="${mode}"]`)?.focus({ preventScroll: true }));
        return;
      }
      const button = event.target.closest("[data-difficulty]");
      if (!button) return;
      difficulty = button.dataset.difficulty;
      renderArcade().then(() =>
        content.querySelector(`[data-difficulty="${difficulty}"]`)?.focus({ preventScroll: true }),
      );
    });
    if (game.kind === "arcade") renderArcade();
    else renderIdle();
    openRecords = openModal({
      title: `Rekordy — ${game.name}`,
      content,
      className: "menu-records-sheet",
      actions: [{ label: "Zamknij", primary: true, onClick: (close) => close() }],
      onClose: () => {
        openRecords = null;
        trigger?.focus?.({ preventScroll: true });
      },
    });
  }

  // Samouczki: przy następnym wejściu do gry samouczek pokaże się jeszcze raz (`tutorialDone: false` w dokumencie
  // gry — tylko w kolekcji `sowiegry`; gra po samouczku zapisuje `true`). Uwaga właściciela G1.
  function confirmTutorials(trigger) {
    openModal({
      title: "Powtórzyć samouczki?",
      content:
        "Przy następnym wejściu do Sowiej Ucieczki, Sowich Torów, Sowy w Chmurach, nowych Sowich Ogrodów i Łącz i Hoduj samouczek pokaże się jeszcze raz. Postęp i rekordy zostają.",
      actions: [
        { label: "Anuluj", onClick: (close) => close() },
        {
          label: "Powtórz",
          primary: true,
          onClick: (close) => {
            close();
            const label = trigger?.querySelector?.("span");
            // Najpierw dokumenty gier (inaczej w pamięci zostałby niepełny dokument — np. puste Top 10 w Rekordach).
            Promise.all(TUTORIAL_GAMES.map((gameId) => cloud?.loadGame?.(gameId)))
              .catch(() => {})
              .then(() => {
                for (const gameId of TUTORIAL_GAMES) cloud?.updateGame?.(gameId, { tutorialDone: false });
                cloud?.flush?.();
                if (label) label.textContent = "Samouczki wrócą przy następnym wejściu ✓";
              });
          },
        },
      ],
      onClose: () => trigger?.focus?.({ preventScroll: true }),
    });
  }

  function confirmLogout(trigger) {
    openModal({
      title: "Wylogować to urządzenie?",
      content:
        "Postęp zostaje w chmurze. Żeby znowu grać na tym telefonie, trzeba będzie wpisać hasło. Na innych urządzeniach nic się nie zmieni.",
      actions: [
        { label: "Anuluj", onClick: (close) => close() },
        {
          label: "Wyloguj",
          primary: true,
          onClick: (close) => {
            close();
            cloud?.lock?.();
          },
        },
      ],
      onClose: () => trigger?.focus?.({ preventScroll: true }),
    });
  }

  // ---------- Zdarzenia ----------

  root.addEventListener("click", (event) => {
    const records = event.target.closest("[data-records]");
    if (records) {
      openRecordsModal(records.dataset.records, records);
      return;
    }
    if (event.target.closest("[data-tutorials-reset]")) {
      confirmTutorials(event.target.closest("[data-tutorials-reset]"));
      return;
    }
    if (event.target.closest("[data-logout]")) {
      confirmLogout(event.target.closest("[data-logout]"));
      return;
    }
    const cosmetic = event.target.closest("[data-cosmetic]");
    if (cosmetic && !cosmetic.disabled) {
      const key = cosmetic.dataset.cosmetic;
      cloud?.updateProfile?.((current) => ((current.cosmetics ||= { unlocked: ["none"] }).selected = key), {
        delayMs: 1000,
      });
      for (const chip of root.querySelectorAll("[data-cosmetic]"))
        chip.setAttribute("aria-pressed", String(chip === cosmetic));
      drawProfileOwl();
      onCosmetic(key);
      return;
    }
    const setting = event.target.closest("[data-setting]");
    if (!setting) return;
    const on = setting.getAttribute("aria-pressed") !== "true";
    setting.setAttribute("aria-pressed", String(on));
    const engine = audio();
    if (setting.dataset.setting === "effects") {
      save({ reducedEffects: !on });
      document.documentElement.classList.toggle("sowie-reduced-effects", !on);
    } else if (setting.dataset.setting === "vibration") {
      save({ vibration: on });
      engine?.setVibration?.(on);
      if (on) engine?.vibrate?.(30);
    } else if (setting.dataset.setting === "cozy") save({ cozy: on });
    else if (setting.dataset.setting === "quips") save({ quips: on });
  });

  root.addEventListener("input", (event) => {
    const input = event.target.closest("[data-volume]");
    const engine = audio();
    if (!input || !engine) return;
    const bus = input.dataset.volume;
    engine.setVolume(bus, input.value);
    const value = engine.volume(bus);
    input.nextElementSibling.textContent = String(value);
    const changes = { [VOLUME_KEYS[bus]]: value };
    if (VOLUME_SWITCH[bus]) changes[VOLUME_SWITCH[bus]] = value > 0;
    save(changes);
  });

  return {
    render,
    drawProfileOwl,
    updateAudio,
    updateStatus,
    openRecords: openRecordsModal,
    recordsOpen: () => Boolean(openRecords),
  };
}
