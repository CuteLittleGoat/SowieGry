// Sowie Ogrody — samouczek pierwszego wejścia (E7d2): cztery krótkie kroki, bez zatrzymywania czasu (to gra idle —
// ogród rośnie dalej). Kroki z akcją (stuknięcia, zakup) zaliczają się same, kroki informacyjne — przyciskiem
// „Dalej”. Czysta logika; podpowiedź rysuje main.js.

export const TUTORIAL_STEPS = Object.freeze([
  {
    id: "stuknij",
    text: "Stuknij w ogród — każde stuknięcie to liście.",
    gesture: "tap",
    taps: 5,
  },
  {
    id: "kup",
    text: "Kup Monsterę w panelu na dole — zbiera liście za Ciebie.",
    gesture: null,
    plant: "monstera",
  },
  {
    id: "cele",
    text: "Cele rozdziału są pod licznikiem liści — wykonaj je, by otworzyć kolejny.",
    gesture: null,
    next: true,
  },
  {
    id: "zdarzenia",
    text: "Odrzucaj telefon Pracu, przeganiaj ciężarówkę Amic i łap złotą kózkę!",
    gesture: null,
    next: true,
  },
]);

/**
 * createTutorial({ state, onStep(podpowiedź | null), onDone() }) → { update(stan), next(), skip(), progress() }.
 * Stuknięcia liczone od wejścia w krok; krok zakupu zaliczony od razu, gdy Monstera już rośnie (np. po przeniesieniu
 * dawnego ogrodu). `progress()` → { step, steps, id, text, gesture, next } albo null po końcu.
 */
export function createTutorial({ state, onStep = () => {}, onDone = () => {} }) {
  let index = 0;
  let baseTaps = state.stats.taps;
  let finished = false;

  const current = () => (finished ? null : TUTORIAL_STEPS[index]);
  const progress = () => {
    const step = current();
    return step ? { step: index + 1, steps: TUTORIAL_STEPS.length, ...step, next: Boolean(step.next) } : null;
  };

  function finish() {
    if (finished) return;
    finished = true;
    onStep(null);
    onDone();
  }

  function advance(stateNow) {
    index += 1;
    if (index >= TUTORIAL_STEPS.length) {
      finish();
      return;
    }
    baseTaps = stateNow.stats.taps;
    onStep(progress());
    update(stateNow);
  }

  function update(stateNow) {
    const step = current();
    if (!step) return;
    if (step.taps && stateNow.stats.taps - baseTaps >= step.taps) advance(stateNow);
    else if (step.plant && (stateNow.plants[step.plant] || 0) > 0) advance(stateNow);
  }

  onStep(progress());
  update(state);
  return {
    update,
    next(stateNow) {
      if (current()?.next) advance(stateNow);
    },
    skip: finish,
    progress,
  };
}
