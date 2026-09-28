// Sowia Ucieczka — samouczek pierwszego uruchomienia (Analiza 3, E4 zadanie 4.5).
// Pierwsze 4 wzory biegu to TUTORIAL_PATTERNS (skok, ślizg, podwójny skok, szybowanie). Tuż przed przeszkodą
// gra się zatrzymuje, pokazuje gest i rusza dopiero po właściwym ruchu (inne dotknięcia są wtedy pomijane).
// W samouczku trafienia się nie liczą (tryb bezpieczny gry). Logika bez DOM; podpowiedź rysuje strona.
import { OWL } from "./config.js";
import { OBSTACLES } from "./obstacles.js";
import { TUTORIAL_PATTERNS } from "./patterns.js";

// Lewa krawędź przeszkody, dziury albo platformy we wzorze (j. od początku wzoru).
function edgeOf(pattern) {
  for (const item of pattern.items) {
    if (item.type === "obstacle") return item.x - OBSTACLES[item.kind].box[0] / 2;
    if (item.type === "hole" || item.type === "platform") return item.x;
  }
  return pattern.length / 2;
}

// Kroki: `waits` — kolejne zatrzymania. `gap` — odległość przodu sowy od krawędzi przeszkody, przy której gra
// staje (liczba albo funkcja prędkości); `apex` — zatrzymanie w szczycie skoku; `accept` — ruch, który wznawia
// grę ("press" albo "down").
// Skok nad telefonem: szczyt skoku (0,37 s) nad środkiem telefonu, z zapasem na opóźnienie dotyku (0,06 s):
// odstęp = 0,43 · v − (połowa sowy + połowa telefonu).
const JUMP_GAP = (speed) => 0.43 * speed - (OWL.hitWidth + OBSTACLES.telefon.box[0]) / 2;
const gapAt = (item, speed) => (typeof item.gap === "function" ? item.gap(speed) : item.gap);
export const TUTORIAL_STEPS = Object.freeze(
  [
    {
      pattern: "samouczek-skok",
      waits: [{ gap: JUMP_GAP, gesture: "tap", accept: "press", text: "Stuknij ekran — skok nad telefonem!" }],
    },
    {
      pattern: "samouczek-slizg",
      waits: [{ gap: 0.5, gesture: "swipe-down", accept: "down", text: "Przesuń palcem w dół — ślizg pod dymkiem!" }],
    },
    {
      pattern: "samouczek-podwojny",
      waits: [
        { gap: 1.6, gesture: "tap", accept: "press", text: "Liście na wysokiej platformie! Stuknij — skok…" },
        { apex: true, gesture: "tap", accept: "press", text: "…i w powietrzu stuknij jeszcze raz — podwójny skok!" },
      ],
    },
    {
      pattern: "samouczek-szybowanie",
      waits: [
        {
          gap: 0.5,
          gesture: "hold",
          accept: "press",
          text: "Szeroka dziura! Stuknij i przytrzymaj palec — szybowanie.",
        },
      ],
    },
  ].map((step) => {
    const pattern = TUTORIAL_PATTERNS.find((item) => item.id === step.pattern);
    return Object.freeze({ ...step, edge: edgeOf(pattern), length: pattern.length });
  }),
);

/**
 * createTutorial({ onPrompt, onDone })
 * - handleEvent(zdarzenie gry) — zapamiętuje początki wzorów samouczka (zdarzenie `pattern`);
 * - update(stan gry) — zatrzymuje grę przed przeszkodą albo w szczycie skoku, przechodzi do kolejnych kroków;
 * - accept(ruch: "press" | "down" | "release" | "other") → czy przekazać ruch do gry (w zatrzymaniu tylko właściwy);
 * - frozen(), done(), progress() → { step, steps, text, gesture }.
 * onPrompt(podpowiedź | null) — pokaż / schowaj; onDone() — koniec samouczka.
 */
export function createTutorial({ onPrompt = () => {}, onDone = () => {} } = {}) {
  const starts = new Map();
  let index = 0;
  let wait = 0;
  let isFrozen = false;
  let finished = false;
  let owl = null;
  let speed = 0;

  const step = () => TUTORIAL_STEPS[index];
  const current = () => step()?.waits[wait] || null;

  function prompt() {
    const item = current();
    onPrompt(item ? { text: item.text, gesture: item.gesture, step: index + 1, steps: TUTORIAL_STEPS.length } : null);
  }

  function freeze() {
    isFrozen = true;
    prompt();
  }

  function next() {
    index += 1;
    wait = 0;
    if (index >= TUTORIAL_STEPS.length) {
      finished = true;
      onPrompt(null);
      onDone();
    }
  }

  return {
    handleEvent(event) {
      if (event.type === "pattern" && event.id.startsWith("samouczek-")) starts.set(event.id, event.start);
    },
    update(state) {
      if (finished) return;
      owl = state.owl;
      speed = state.speed;
      const active = step();
      const start = starts.get(active.pattern);
      if (start === undefined) return;
      // Wzór minięty — następny krok (także gdy ruch się nie udał; trafienia w samouczku się nie liczą).
      if (owl.x - OWL.hitWidth / 2 > start + active.length) {
        if (isFrozen) {
          isFrozen = false;
          onPrompt(null);
        }
        next();
        return;
      }
      if (isFrozen) return;
      const item = current();
      if (!item) return;
      const front = owl.x + OWL.hitWidth / 2;
      if (item.gap !== undefined && owl.grounded && front >= start + active.edge - gapAt(item, state.speed)) freeze();
      else if (item.apex && !owl.grounded && owl.vy > -1) freeze();
    },
    accept(kind) {
      if (finished) return true;
      if (kind === "release") return true;
      if (kind === "other") return !isFrozen;
      const item = current();
      if (!isFrozen) {
        // Ruch przed zatrzymaniem (gracz już wie, co robić) — zaliczamy to zatrzymanie, gdy przeszkoda jest blisko.
        const start = starts.get(step()?.pattern);
        if (item && owl && start !== undefined && kind === item.accept) {
          const front = owl.x + OWL.hitWidth / 2;
          const near = item.apex ? !owl.grounded : front >= start + step().edge - gapAt(item, speed) - 2.5;
          if (near) wait += 1;
        }
        return true;
      }
      if (!item || kind !== item.accept) return false;
      isFrozen = false;
      wait += 1;
      onPrompt(null);
      return true;
    },
    frozen: () => isFrozen,
    done: () => finished,
    progress: () => ({ step: index + 1, steps: TUTORIAL_STEPS.length, wait, frozen: isFrozen, ...(current() || {}) }),
  };
}
