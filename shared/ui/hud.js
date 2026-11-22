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

// Jeden wspólny formater liczb (Analiza 6, W5) — tworzenie formatera przy każdej liczbie (`toLocaleString`) jest
// wolniejsze; wynik ten sam („12 345” z twardą spacją, „1234” bez spacji).
const NUMBER_FORMAT = typeof Intl === "object" && Intl.NumberFormat ? new Intl.NumberFormat("pl-PL") : null;
export const formatNumber = (value) => {
  const number = Math.floor(Number(value) || 0);
  return NUMBER_FORMAT ? NUMBER_FORMAT.format(number) : number.toLocaleString("pl-PL");
};

// Tekst wyniku zmieniany najwyżej 10 razy na sekundę (wynik biegu rośnie prawie co klatkę); ostatnia wartość zawsze
// trafia na ekran — zaległy zapis najpóźniej po `SCORE_TEXT_MS`.
export const SCORE_TEXT_MS = 100;
// Podskok liczby (jak animacja `sowieBump` w ui.css): Web Animations zamiast przełączania klasy — bez wymuszania
// przeliczenia układu strony; bez ruchu przy ograniczeniu ruchu w systemie i przy wyłączonych „Efektach”.
const BUMP_FRAMES = Object.freeze([
  { transform: "scale(1)", easing: "ease-out" },
  { transform: "scale(1.18)", offset: 0.4, easing: "ease-out" },
  { transform: "scale(1)" },
]);
const now = () => globalThis.performance?.now?.() ?? Date.now();
const reducedMotion = () =>
  Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) ||
  Boolean(globalThis.document?.documentElement?.classList.contains("sowie-reduced-effects"));

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
  let shownScore = 0;
  let scoreWrittenAt = -Infinity;
  let scoreTimer = null;
  let leaves = 0;
  let lives = [maxLives, maxLives];

  // Podskok liczby: najwyżej raz na czas animacji (220 ms) — wynik biegu rośnie prawie co klatkę.
  const lastBump = new WeakMap();
  function bump(node) {
    const time = now();
    if (time - (lastBump.get(node) ?? -Infinity) < 250) return;
    lastBump.set(node, time);
    if (reducedMotion()) return;
    if (typeof node.animate === "function") {
      node.animate(BUMP_FRAMES, { duration: 220 });
      return;
    }
    // Przeglądarka bez Web Animations — ponowne uruchomienie animacji z ui.css.
    node.classList.remove("is-bump");
    void node.offsetWidth;
    node.classList.add("is-bump");
  }

  function writeScore() {
    if (scoreTimer !== null) globalThis.clearTimeout(scoreTimer);
    scoreTimer = null;
    scoreWrittenAt = now();
    if (shownScore === score && scoreNode.textContent) return;
    shownScore = score;
    scoreNode.textContent = formatNumber(score);
  }

  const hud = {
    element,
    setScore(value, { animate = true } = {}) {
      const next = Math.floor(Number(value) || 0);
      if (next === score) return;
      const grew = next > score;
      score = next;
      const since = now() - scoreWrittenAt;
      if (!animate || since >= SCORE_TEXT_MS) writeScore();
      else if (scoreTimer === null) scoreTimer = globalThis.setTimeout(writeScore, SCORE_TEXT_MS - since);
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
      if (scoreTimer !== null) globalThis.clearTimeout(scoreTimer);
      scoreTimer = null;
      element.remove();
    },
  };
  hud.setLives(maxLives, maxLives);
  return hud;
}
