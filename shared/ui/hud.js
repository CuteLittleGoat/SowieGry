// HUD — jeden standard dla gier (Analiza 2, rozdz. 4.3): lewy górny róg — pauza; środek — wynik i liście;
// prawy górny róg — życia i liczniki power-upów; wszystko w bezpiecznym obszarze, dół ekranu wolny (strefa gestów).
import { ICONS } from "./icons.js";

const asset = (path) => new URL(`../../assets/svg/${path}`, import.meta.url).href;
const LEAF = asset("liscie/zielony.svg");
const LIFE = asset("interfejs/serduszko-doniczka.svg");
const LIFE_LOST = asset("interfejs/serduszko-puste.svg");

// Kolory i podpisy liczników power-upów (jak chustki kózek, shared/world/catalog.js).
export const POWERUP_STYLE = Object.freeze({
  sprezynka: { label: "Sprężynka", color: "var(--zloto)" },
  tarcza: { label: "Tarcza", color: "var(--niebieski)" },
  magnes: { label: "Magnes", color: "var(--fiolet)" },
  turbo: { label: "Turbo", color: "var(--pomaranczowy)" },
  podwajaczka: { label: "×2", color: "var(--monstera)" },
  // Gorączka Monster (tęczowy liść) — licznik jak power-up.
  goraczka: { label: "Gorączka", color: "var(--policzki)" },
});

export const formatNumber = (value) => Math.floor(Number(value) || 0).toLocaleString("pl-PL");

export function createHud({ root, onPause = () => {}, maxLives = 3 } = {}) {
  const element = document.createElement("div");
  element.className = "sowie-hud";
  element.innerHTML = `
    <button type="button" class="sowie-hud-pause" data-hud-pause aria-label="Pauza">${ICONS.pause}</button>
    <div class="sowie-hud-center">
      <div class="sowie-hud-score" data-hud-score aria-label="Wynik">0</div>
      <div class="sowie-hud-leaves" aria-label="Liście"><img src="${LEAF}" alt="" width="22" height="22" /><span data-hud-leaves>0</span></div>
    </div>
    <div class="sowie-hud-right">
      <div class="sowie-hud-lives" data-hud-lives role="img"></div>
      <div class="sowie-hud-powerups" data-hud-powerups></div>
    </div>`;
  // Dotknięcia HUD nie trafiają do planszy (poza przyciskiem pauzy HUD przepuszcza dotyk — pointer-events w CSS).
  element.querySelector("[data-hud-pause]").addEventListener("click", () => onPause());
  element.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) event.stopPropagation();
  });
  root.appendChild(element);

  const scoreNode = element.querySelector("[data-hud-score]");
  const leavesNode = element.querySelector("[data-hud-leaves]");
  const livesNode = element.querySelector("[data-hud-lives]");
  const powerupsNode = element.querySelector("[data-hud-powerups]");
  const chips = new Map();
  let score = 0;
  let leaves = 0;
  let lives = [maxLives, maxLives];

  // Podskok liczby: najwyżej raz na czas animacji (220 ms) — wynik biegu rośnie prawie co klatkę, a każde
  // ponowne uruchomienie animacji wymusza przeliczenie układu strony.
  const lastBump = new WeakMap();
  function bump(node) {
    const now = globalThis.performance?.now?.() ?? Date.now();
    if (now - (lastBump.get(node) ?? -Infinity) < 250) return;
    lastBump.set(node, now);
    node.classList.remove("is-bump");
    // ponowne uruchomienie animacji
    void node.offsetWidth;
    node.classList.add("is-bump");
  }

  const hud = {
    element,
    setScore(value, { animate = true } = {}) {
      const next = Math.floor(Number(value) || 0);
      if (next === score) return;
      const grew = next > score;
      score = next;
      scoreNode.textContent = formatNumber(score);
      if (animate && grew) bump(scoreNode);
    },
    setLeaves(value) {
      const next = Math.floor(Number(value) || 0);
      if (next === leaves) return;
      leaves = next;
      leavesNode.textContent = formatNumber(leaves);
      bump(leavesNode.parentElement);
    },
    setLives(current, max = lives[1]) {
      const next = [Math.max(0, Math.floor(current)), Math.max(1, Math.floor(max))];
      if (next[0] === lives[0] && next[1] === lives[1] && livesNode.childElementCount) return;
      const lost = next[0] < lives[0];
      lives = next;
      livesNode.replaceChildren(
        ...Array.from({ length: lives[1] }, (_, index) => {
          const image = document.createElement("img");
          image.src = index < lives[0] ? LIFE : LIFE_LOST;
          image.alt = "";
          image.width = 28;
          image.height = 28;
          if (lost && index === lives[0]) image.className = "is-lost";
          return image;
        }),
      );
      livesNode.setAttribute("aria-label", `Życia: ${lives[0]} z ${lives[1]}`);
    },
    // list: [{ kind, remaining (s), total (s), label? }] — np. 10 razy na sekundę. `label` zastępuje nazwę z
    // POWERUP_STYLE (np. Sowie Tory: Turbo to „Kózia jazda”).
    setPowerups(list = []) {
      const active = new Set();
      for (const { kind, remaining, total, label: custom } of list) {
        const style = POWERUP_STYLE[kind];
        if (!style) continue;
        const label = custom || style.label;
        active.add(kind);
        let chip = chips.get(kind);
        if (!chip) {
          chip = document.createElement("div");
          chip.className = "sowie-hud-powerup";
          chip.style.setProperty("--kolor", style.color);
          chip.innerHTML = `<span class="sowie-hud-powerup-label"></span><span class="sowie-hud-powerup-bar"><span></span></span>`;
          chips.set(kind, chip);
          powerupsNode.appendChild(chip);
        }
        const labelNode = chip.querySelector(".sowie-hud-powerup-label");
        if (labelNode.textContent !== label) labelNode.textContent = label;
        const share = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 1;
        chip.querySelector(".sowie-hud-powerup-bar span").style.transform = `scaleX(${share})`;
        chip.setAttribute("aria-label", `${label}: ${Math.ceil(Math.max(0, remaining))} s`);
        chip.classList.toggle("is-ending", remaining > 0 && remaining < 2);
      }
      for (const [kind, chip] of chips) {
        if (!active.has(kind)) {
          chip.remove();
          chips.delete(kind);
        }
      }
    },
    show() {
      element.hidden = false;
    },
    hide() {
      element.hidden = true;
    },
    state: () => ({ score, leaves, lives: lives[0], maxLives: lives[1], powerups: [...chips.keys()] }),
    destroy() {
      element.remove();
    },
  };
  hud.setLives(maxLives, maxLives);
  return hud;
}
