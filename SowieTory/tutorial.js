// Sowie Tory — samouczek pierwszego biegu (Analiza 3, E5 zadanie 5.7). Pierwsze 4 wzory planszy 1 to
// TUTORIAL_PATTERNS: telefon na środkowym torze (zmiana toru), teczki na wszystkich torach (skok), dymki (ślizg)
// i kózka na środkowym torze (złap ją). Przed przeszkodą gra się zatrzymuje, pokazuje gest i rusza dopiero po
// właściwym ruchu (inne gesty są wtedy pomijane). W samouczku trafienia się nie liczą (tryb bezpieczny gry).
// Logika bez DOM; podpowiedź rysuje strona.
import { LEAVES } from "./config.js";

const leafRow = (z, lanes, y = LEAVES.height) => lanes.map((lane) => ({ type: "leaf", lane, z, y }));
const arc = (z, lane) =>
  [-2, -1, 0, 1, 2].map((step) => ({ type: "leaf", lane, z: z + step * 1.6, y: 0.6 + (1 - (step * step) / 4) }));
const low = (z, lane) => [-1, 0, 1].map((step) => ({ type: "leaf", lane, z: z + step * 1.4, y: 0.3 }));
const tutorialPattern = (id, length, items) => ({ id, tier: 0, length, tags: ["samouczek"], stages: null, items });

// Wzory samouczka (poza PATTERNS — generator i test przejścia ich nie losują).
export const TUTORIAL_PATTERNS = Object.freeze([
  tutorialPattern("samouczek-tor", 26, [
    { type: "obstacle", kind: "telefon", lane: 0, z: 16 },
    ...leafRow(10, [-1, 1]),
    ...leafRow(13, [-1, 1]),
    ...leafRow(16, [-1, 1]),
    ...leafRow(19, [-1, 1]),
  ]),
  tutorialPattern("samouczek-skok", 24, [
    ...[-1, 0, 1].map((lane) => ({ type: "obstacle", kind: "teczka", lane, z: 14 })),
    ...[-1, 0, 1].flatMap((lane) => arc(14, lane)),
  ]),
  tutorialPattern("samouczek-slizg", 24, [
    ...[-1, 0, 1].map((lane) => ({ type: "obstacle", kind: "dymek", lane, z: 14 })),
    ...[-1, 0, 1].flatMap((lane) => low(14, lane)),
  ]),
  tutorialPattern("samouczek-kozka", 24, [{ type: "goat", kind: "podwajaczka", lane: 0, z: 14 }]),
]);

/**
 * Kroki: `freeze(prędkość)` — głębokość (m) przodu przeszkody / kózki, przy której gra staje; `accept` — kierunki,
 * które wznawiają grę ("toward" — w stronę toru kózki); `gesture` — demonstracja gestu; `skip(sowa)` — krok zaliczony
 * bez zatrzymania (sowa już na torze kózki).
 */
export const TUTORIAL_STEPS = Object.freeze([
  {
    pattern: "samouczek-tor",
    target: 16,
    freeze: (speed) => speed * 0.7,
    accept: ["left", "right"],
    gesture: "swipe-left",
    text: "Telefon na torze! Przesuń palcem w bok — zmiana toru.",
  },
  {
    pattern: "samouczek-skok",
    target: 14,
    freeze: (speed) => speed * 0.25,
    accept: ["up"],
    gesture: "swipe-up",
    text: "Teczki na każdym torze! Przesuń palcem w górę — skok.",
  },
  {
    pattern: "samouczek-slizg",
    target: 14,
    freeze: (speed) => speed * 0.3,
    accept: ["down"],
    gesture: "swipe-down",
    text: "Dymki Pracu Pracu na wysokości głowy! Przesuń palcem w dół — ślizg.",
  },
  {
    pattern: "samouczek-kozka",
    target: 14,
    freeze: (speed) => speed * 0.7,
    accept: ["toward"],
    gesture: "toward",
    skip: (owl) => owl.lane === 0,
    text: "Kózka! Wbiegnij w nią — przesuń palcem w jej stronę.",
  },
]);

/**
 * createTutorial({ onPrompt, onDone })
 * - handleEvent(zdarzenie gry) — zapamiętuje początki wzorów samouczka (zdarzenie `pattern`);
 * - update(stan gry) — zatrzymuje grę przed przeszkodą, przechodzi do kolejnych kroków;
 * - accept(kierunek: "left" | "right" | "up" | "down") → czy przekazać ruch do gry (w zatrzymaniu tylko właściwy);
 * - frozen(), done(), progress() → { step, steps, text, gesture, frozen }.
 * onPrompt(podpowiedź | null) — pokaż / schowaj; onDone() — koniec samouczka.
 */
export function createTutorial({ onPrompt = () => {}, onDone = () => {} } = {}) {
  const starts = new Map();
  let index = 0;
  let isFrozen = false;
  let handled = false;
  let finished = false;
  let owl = null;
  let last = null;

  const step = () => TUTORIAL_STEPS[index];
  // Kierunek do kózki (krok 4): środkowy tor.
  const toward = () => (owl && owl.lane > 0 ? "left" : "right");
  const accepted = (item) => item.accept.flatMap((kind) => (kind === "toward" ? [toward()] : [kind]));
  const gestureOf = (item) => (item.gesture === "toward" ? `swipe-${toward()}` : item.gesture);

  function prompt() {
    const item = step();
    onPrompt(
      item && isFrozen
        ? { text: item.text, gesture: gestureOf(item), step: index + 1, steps: TUTORIAL_STEPS.length }
        : null,
    );
  }

  function next() {
    index += 1;
    handled = false;
    if (isFrozen) {
      isFrozen = false;
      prompt();
    }
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
      last = state;
      owl = state.owl;
      const item = step();
      const start = starts.get(item.pattern);
      if (start === undefined) return;
      const z = start + item.target - state.stageDistance;
      // Przeszkoda minięta — następny krok (także gdy ruch się nie udał; trafienia w samouczku się nie liczą).
      if (z < -1.5) {
        next();
        return;
      }
      if (isFrozen || handled) return;
      if (item.skip?.(owl)) {
        handled = true;
        return;
      }
      if (z <= item.freeze(state.speed) && owl.grounded) {
        isFrozen = true;
        prompt();
      }
    },
    accept(direction) {
      if (finished) return true;
      const item = step();
      if (!isFrozen) {
        // Ruch tuż przed zatrzymaniem (najwyżej 4 m wcześniej — gracz już wie, co robić): krok bez zatrzymania.
        const start = item ? starts.get(item.pattern) : undefined;
        if (start !== undefined && last && accepted(item).includes(direction)) {
          const z = start + item.target - last.stageDistance;
          if (z <= item.freeze(last.speed) + 4) handled = true;
        }
        return true;
      }
      if (!accepted(item).includes(direction)) return false;
      isFrozen = false;
      handled = true;
      prompt();
      return true;
    },
    frozen: () => isFrozen,
    done: () => finished,
    progress: () => ({
      step: index + 1,
      steps: TUTORIAL_STEPS.length,
      frozen: isFrozen,
      text: step()?.text,
      gesture: step() ? gestureOf(step()) : null,
    }),
  };
}
