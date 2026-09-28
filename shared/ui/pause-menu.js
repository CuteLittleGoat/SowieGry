// Menu pauzy (Analiza 2, rozdz. 4.3): Wznów, Zacznij od nowa, Jak grać, Ustawienia, Garderoba, Wyjdź do menu.
// Duże przyciski w dolnej połowie ekranu. Współpracuje z powłoką telefonu (createShell({ overlay: false })):
// auto-pauza otwiera menu, „Wznów” uruchamia odliczanie 3-2-1 powłoki, a menu pokazuje cyfry.
import { guideFor } from "../meta/guides-data.js";
import { renderGuide } from "./guide-view.js";
import { ICONS } from "./icons.js";
import { openModal } from "./modal.js";

const REASONS = {
  tlo: "Witaj z powrotem 🦉",
  fokus: "Gra czeka na Ciebie",
  obrot: "Ekran się obrócił",
  gracz: "Odpocznij chwilę",
};

const VOLUME_KEYS = { master: "volumeMaster", music: "volumeMusic", sfx: "volumeSfx" };

export function createPauseMenu({
  root,
  shell = null,
  gameId = "swiat",
  audio = null,
  atlas = null,
  sprites = null,
  cloud = globalThis.SowieCloud,
  platform = globalThis.SowiePlatform,
  onResume = () => {},
  onRestart = () => {},
  onExit = () => globalThis.location?.assign?.("../"),
  // Opcjonalnie „Zakończ bieg” (np. Tryb Przytulny bez końca gry): { label, onClick } albo null.
  endAction = null,
} = {}) {
  const overlay = document.createElement("div");
  overlay.className = "sowie-pause-overlay sowie-ui-pause";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Pauza");
  overlay.addEventListener("pointerdown", (event) => event.stopPropagation());
  root.appendChild(overlay);
  let view = "menu";
  let reason = "gracz";
  let modal = null;
  // Silnik dźwięku może powstać później (np. po wczytaniu manifestu) — przyjmujemy obiekt albo funkcję.
  const sound = () => (typeof audio === "function" ? audio() : audio);

  const settings = () => cloud?.profile?.()?.settings || {};
  const save = (changes) =>
    cloud?.updateProfile?.((profile) => Object.assign(profile.settings, changes), { delayMs: 1000 });

  function menuView() {
    return `<div class="sowie-ui-pause-card">
      <h2>Pauza</h2>
      <p class="sowie-ui-pause-reason">${REASONS[reason] || ""}</p>
      <button type="button" class="sowie-ui-button is-primary is-big" data-pause="resume">${ICONS.play}<span>Wznów</span></button>
      <div class="sowie-ui-pause-grid">
        <button type="button" class="sowie-ui-button" data-pause="restart">${ICONS.restart}<span>Zacznij od nowa</span></button>
        <button type="button" class="sowie-ui-button" data-pause="guide">${ICONS.help}<span>Jak grać</span></button>
        <button type="button" class="sowie-ui-button" data-pause="settings">${ICONS.settings}<span>Ustawienia</span></button>
        <button type="button" class="sowie-ui-button" data-pause="wardrobe">${ICONS.wardrobe}<span>Garderoba</span></button>
      </div>
      ${endAction?.visible?.() !== false && endAction ? `<button type="button" class="sowie-ui-button" data-pause="end">${ICONS.star}<span>${endAction.label || "Zakończ bieg"}</span></button>` : ""}
      <button type="button" class="sowie-ui-button is-quiet" data-pause="exit">${ICONS.home}<span>Wyjdź do menu</span></button>
    </div>`;
  }

  function toggle(label, key, on) {
    return `<button type="button" class="sowie-ui-toggle" data-setting="${key}" aria-pressed="${on}"><span>${label}</span><span class="sowie-ui-switch" aria-hidden="true"></span></button>`;
  }

  function settingsView() {
    const values = sound()?.state?.().volumes || {};
    const current = settings();
    const slider = (bus, label) =>
      `<label class="sowie-ui-slider"><span>${label}</span><input type="range" min="0" max="100" step="1" value="${values[bus] ?? 0}" data-volume="${bus}" ${sound() ? "" : "disabled"} /><output>${values[bus] ?? "—"}</output></label>`;
    return `<div class="sowie-ui-pause-card">
      <div class="sowie-ui-pause-title"><button type="button" class="sowie-ui-icon-button" data-pause="back" aria-label="Wróć">${ICONS.back}</button><h2>Ustawienia</h2></div>
      ${slider("master", "Głośność ogólna")}
      ${slider("music", "Muzyka")}
      ${slider("sfx", "Efekty dźwiękowe")}
      ${toggle("Efekty (wstrząsy, cząsteczki)", "effects", !current.reducedEffects)}
      ${toggle("Wibracje", "vibration", current.vibration !== false)}
      ${toggle("Tryb Przytulny (wolniej, bez końca gry)", "cozy", Boolean(current.cozy))}
      <button type="button" class="sowie-ui-button is-primary" data-pause="back">Gotowe</button>
    </div>`;
  }

  function wardrobeView() {
    const cosmetics = platform?.COSMETICS || {};
    const owned = cloud?.profile?.()?.cosmetics || { unlocked: ["none"], selected: "none" };
    const chips = Object.entries(cosmetics)
      .map(([key, item]) => {
        const locked = !owned.unlocked.includes(key);
        return `<button type="button" class="sowie-ui-chip" data-cosmetic="${key}" aria-pressed="${owned.selected === key}" ${locked ? "disabled" : ""}>${item.label}${locked ? " · zablokowane" : ""}</button>`;
      })
      .join("");
    return `<div class="sowie-ui-pause-card">
      <div class="sowie-ui-pause-title"><button type="button" class="sowie-ui-icon-button" data-pause="back" aria-label="Wróć">${ICONS.back}</button><h2>Garderoba</h2></div>
      <p class="sowie-ui-pause-reason">Wybrany dodatek sowa nosi we wszystkich grach.</p>
      <div class="sowie-ui-chips">${chips}</div>
      <button type="button" class="sowie-ui-button is-primary" data-pause="back">Gotowe</button>
    </div>`;
  }

  function render() {
    overlay.innerHTML = view === "settings" ? settingsView() : view === "wardrobe" ? wardrobeView() : menuView();
    const first = overlay.querySelector(view === "menu" ? '[data-pause="resume"]' : '[data-pause="back"]');
    first?.focus({ preventScroll: true });
  }

  function showGuide() {
    const guide = guideFor(gameId) || guideFor("swiat");
    modal = openModal({
      title: `Jak grać — ${guide.title}`,
      content: renderGuide(guide, { atlas, sprites }),
      root,
      className: "is-guide",
      actions: [{ label: "Rozumiem", primary: true, onClick: (close) => close() }],
      onClose: () => {
        modal = null;
        overlay.querySelector('[data-pause="guide"]')?.focus({ preventScroll: true });
      },
    });
  }

  overlay.addEventListener("click", (event) => {
    const action = event.target.closest("[data-pause]")?.dataset.pause;
    if (action === "resume") api.resume();
    else if (action === "restart") {
      api.close();
      onRestart();
    } else if (action === "guide") showGuide();
    else if (action === "settings" || action === "wardrobe") {
      view = action;
      render();
    } else if (action === "back") {
      view = "menu";
      render();
    } else if (action === "exit") onExit();
    else if (action === "end") {
      api.close();
      endAction?.onClick?.();
    }
    const setting = event.target.closest("[data-setting]");
    if (setting) {
      const on = setting.getAttribute("aria-pressed") !== "true";
      setting.setAttribute("aria-pressed", String(on));
      if (setting.dataset.setting === "effects") {
        save({ reducedEffects: !on });
        document.documentElement.classList.toggle("sowie-reduced-effects", !on);
      } else if (setting.dataset.setting === "vibration") {
        save({ vibration: on });
        sound()?.setVibration?.(on);
        if (on) sound()?.vibrate?.(30);
      } else if (setting.dataset.setting === "cozy") save({ cozy: on });
    }
    const cosmetic = event.target.closest("[data-cosmetic]");
    if (cosmetic && !cosmetic.disabled) {
      cloud?.updateProfile?.((profile) => (profile.cosmetics.selected = cosmetic.dataset.cosmetic), { delayMs: 1000 });
      for (const chip of overlay.querySelectorAll("[data-cosmetic]"))
        chip.setAttribute("aria-pressed", String(chip === cosmetic));
    }
  });
  overlay.addEventListener("input", (event) => {
    const input = event.target.closest("[data-volume]");
    const engine = sound();
    if (!input || !engine) return;
    engine.setVolume(input.dataset.volume, input.value);
    const bus = input.dataset.volume;
    input.nextElementSibling.textContent = String(engine.volume(bus));
    // Suwak na zero wyłącza też muzykę / efekty w obecnych grach (settings.music / settings.sfx).
    const changes = { [VOLUME_KEYS[bus]]: engine.volume(bus) };
    if (bus !== "master") changes[bus] = engine.volume(bus) > 0;
    save(changes);
  });
  overlay.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || modal) return;
    event.preventDefault();
    if (view !== "menu") {
      view = "menu";
      render();
    } else api.resume();
  });

  const api = {
    element: overlay,
    open(nextReason = "gracz") {
      reason = nextReason;
      view = "menu";
      overlay.hidden = false;
      overlay.classList.remove("is-countdown");
      render();
    },
    // Odliczanie (cyfry jak w powłoce: klasa .sowie-countdown).
    countdown(count) {
      modal?.close();
      overlay.hidden = false;
      overlay.classList.add("is-countdown");
      overlay.innerHTML = `<div class="sowie-countdown" aria-live="assertive">${count}</div>`;
    },
    close() {
      modal?.close();
      overlay.hidden = true;
      overlay.innerHTML = "";
      overlay.classList.remove("is-countdown");
    },
    resume() {
      if (shell) shell.resume();
      else {
        api.close();
        onResume();
      }
    },
    isOpen: () => !overlay.hidden,
    view: () => (overlay.hidden ? null : overlay.classList.contains("is-countdown") ? "countdown" : view),
    destroy() {
      offShell?.();
      api.close();
      overlay.remove();
    },
  };

  const offShell = shell?.onChange?.((change) => {
    if (!change?.state || change.batterySaver !== undefined) return;
    if (change.state === "paused") api.open(change.reason);
    else if (change.state === "countdown") api.countdown(change.count);
    else if (change.state === "running") {
      api.close();
      onResume();
    }
  });
  return api;
}
