// Sowa w Chmurach — samouczek pierwszego lotu (Analiza 3, E6e). Pięć krótkich kroków z podpowiedzią i pokazem
// gestu; gra się nie zatrzymuje, a w samouczku upadki i trafienia nie zabierają serduszek (tryb bezpieczny gry).
// Krok kończy warunek albo limit czasu. W kroku „Pracu” samouczek stawia nieruchomy dymek obok ostatniej gałązki
// sowy — do zdeptania z góry. Logika bez DOM; podpowiedź rysuje strona.
import { WORLD } from "./config.js";
import { wrapDelta, wrapX } from "./physics.js";

// Dymek kroku „Pracu”: z boku gałązki (w stronę środka kolumny), nad jej wierzchem — sowa wznosi się obok niego,
// a na szczycie skoku wystarczy przesunąć ją nad dymek.
export const TUTORIAL_DYMEK = Object.freeze({ side: 1.4, above: 2.4 });

/**
 * Kroki: `text`, `gesture` (pokaz gestu; "toward" — w stronę dymku; null — bez pokazu), `done(postęp, stan)`,
 * `timeout` (s; bez — krok czeka na warunek), `spawn` (przeszkoda kroku).
 */
export const TUTORIAL_STEPS = Object.freeze([
  {
    id: "przeciagnij",
    text: "Przeciągnij palcem w bok — sowa leci za palcem. Najwygodniej kciukiem w dolnej części ekranu.",
    gesture: "drag",
    done: (progress) => progress.moved >= 1.5,
  },
  {
    id: "wyzej",
    text: "Sowa sama odbija się od gałązek. Prowadź ją na kolejne — coraz wyżej!",
    gesture: null,
    done: (progress, state) => state.height >= progress.startHeight + 12,
  },
  {
    id: "lisc",
    text: "Liście monstery dają punkty i podbijają combo. Złap liść!",
    gesture: null,
    done: (progress, state) => state.leafCount > progress.startLeaves,
    timeout: 15,
  },
  {
    id: "pracu",
    text: "Dymek Pracu Pracu! Przeleć nad nim i spadnij na niego z góry — +50.",
    gesture: "toward",
    spawn: "dymek",
    done: (progress) => progress.stomped || progress.hit,
    timeout: 14,
  },
  {
    id: "ratunek",
    text: "Gdy sowa spadnie, kózka ją złapie — to kosztuje serduszko. Amic omijaj. Powodzenia!",
    gesture: null,
    done: () => false,
    timeout: 5,
  },
]);

/**
 * createTutorial({ onPrompt, onDone, addHazard })
 * - update(stan gry, dt) — postęp kroków (przesunięcie w bok, wysokość, liście, czas), wstawia dymek kroku „Pracu”;
 * - handleEvent(zdarzenie gry) — zdeptanie / trafienie w kroku „Pracu”;
 * - done(), progress() → { step, steps, id, text, gesture }.
 * onPrompt(podpowiedź | null), onDone() — koniec samouczka; addHazard(rodzaj, x, y, dodatki) — przeszkoda w grze.
 */
export function createTutorial({ onPrompt = () => {}, onDone = () => {}, addHazard = () => {} } = {}) {
  let index = -1;
  let finished = false;
  let lastX = null;
  let dymek = null;
  const progress = { moved: 0, time: 0, startHeight: 0, startLeaves: 0, stomped: false, hit: false };

  const step = () => TUTORIAL_STEPS[index];
  const gestureOf = (item, state) => {
    if (item.gesture !== "toward") return item.gesture;
    if (!dymek) return "drag";
    return wrapDelta(state.owl.x, dymek.x) < 0 ? "swipe-left" : "swipe-right";
  };

  function prompt(state) {
    const item = step();
    onPrompt(
      item
        ? {
            id: item.id,
            text: item.text,
            gesture: gestureOf(item, state),
            step: index + 1,
            steps: TUTORIAL_STEPS.length,
          }
        : null,
    );
  }

  function start(state) {
    index += 1;
    if (index >= TUTORIAL_STEPS.length) {
      finished = true;
      onPrompt(null);
      onDone();
      return;
    }
    const item = step();
    progress.time = 0;
    progress.startHeight = state.height;
    progress.startLeaves = state.leafCount;
    progress.stomped = false;
    progress.hit = false;
    if (item.spawn) {
      const base = state.lastSafe || { x: state.owl.x, y: state.owl.y };
      const x = wrapX(base.x + (base.x < WORLD.width / 2 ? 1 : -1) * TUTORIAL_DYMEK.side);
      dymek = { x, y: base.y + TUTORIAL_DYMEK.above };
      addHazard(item.spawn, dymek.x, dymek.y, { speed: 0 });
    }
    prompt(state);
  }

  return {
    update(state, dt) {
      if (finished) return;
      if (index < 0) start(state);
      if (finished) return;
      const owl = state.owl;
      if (state.phase === "run" && lastX !== null) progress.moved += Math.abs(wrapDelta(lastX, owl.x));
      lastX = owl.x;
      progress.time += dt;
      const item = step();
      if (item.done(progress, state) || (item.timeout && progress.time >= item.timeout)) start(state);
      else if (item.gesture === "toward") prompt(state);
    },
    handleEvent(event) {
      if (finished || step()?.id !== "pracu") return;
      if (event.type === "stomp") progress.stomped = true;
      if (event.type === "hit" || event.type === "shield") progress.hit = true;
    },
    done: () => finished,
    progress: () => {
      const item = step();
      return item ? { step: index + 1, steps: TUTORIAL_STEPS.length, id: item.id, text: item.text } : null;
    },
  };
}
