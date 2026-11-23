// Sowie Trójki — mapa poziomów (Analiza 5, rozdz. 4.3 i 9.1): „Ścieżka przez Sowi Las” — trzy rozdziały (Sowia
// Łąka, Ogródek Sówki, Staw Humbaka), w każdym 15 kółek poziomów ułożonych w zygzak, przy każdym gwiazdki;
// bieżący poziom pulsuje. Zablokowane poziomy mają kłódkę (w podglądzie wszystkie są otwarte).
import { ICONS } from "../shared/ui/icons.js";
import { CHAPTERS, LEVELS } from "./levels.js";

const STARS = (count) => [0, 1, 2].map((index) => (index < count ? "★" : "☆")).join("");

/**
 * renderMap(root, { state, current, open, onPick }) — `state` (stan zapisu: gwiazdki, `unlocked`), `current` —
 * podświetlony poziom, `open` — wszystkie otwarte (podgląd), `onPick(id)` — wybór poziomu.
 */
export function renderMap(root, { state, current = 1, open = false, onPick = () => {} }) {
  root.replaceChildren();
  for (const chapter of CHAPTERS) {
    const section = document.createElement("section");
    section.className = `trojki-chapter is-${chapter.id}`;
    section.dataset.chapter = chapter.id;
    const title = document.createElement("h2");
    title.textContent = `${CHAPTERS.indexOf(chapter) + 1}. ${chapter.name}`;
    const stars = LEVELS.filter((level) => level.chapter === chapter.id).reduce(
      (sum, level) => sum + (state.levels[level.id]?.stars || 0),
      0,
    );
    const note = document.createElement("small");
    note.textContent = `★ ${stars} / 45`;
    title.append(" ", note);
    const list = document.createElement("ol");
    list.className = "trojki-path";
    for (const level of LEVELS.filter((entry) => entry.chapter === chapter.id)) {
      const item = document.createElement("li");
      item.style.setProperty("--shift", String([0, 1, 2, 1][(level.id - 1) % 4]));
      const button = document.createElement("button");
      button.type = "button";
      button.className = "trojki-level";
      button.dataset.level = String(level.id);
      const locked = !open && level.id > state.unlocked;
      const earned = state.levels[level.id]?.stars || 0;
      button.disabled = locked;
      if (level.id === current) button.classList.add("is-current");
      if (earned) button.classList.add("is-done");
      button.setAttribute(
        "aria-label",
        locked ? `Poziom ${level.id} — zablokowany` : `Poziom ${level.id}${earned ? ` — gwiazdki: ${earned} z 3` : ""}`,
      );
      button.innerHTML = `<span class="trojki-level-number">${locked ? ICONS.lock : level.id}</span><span class="trojki-level-stars" aria-hidden="true">${STARS(earned)}</span>`;
      button.addEventListener("click", () => onPick(level.id));
      item.append(button);
      list.append(item);
    }
    section.append(title, list);
    root.append(section);
  }
  root.querySelector(".is-current")?.scrollIntoView?.({ block: "center" });
}
