// Łącz i Hoduj — samouczek pierwszego wejścia (krok 8.3, E8d): pięć krótkich kroków bez zatrzymywania gry. Kroki
// z akcją (połączenie, doniczka, zamówienie) zaliczają się same, liczone od wejścia w krok; kroki informacyjne —
// przyciskiem „Dalej” (krok zamówienia też ma „Dalej”, gdyby żadnego nie dało się od razu oddać). Czysta logika;
// podpowiedź rysuje main.js.

export const TUTORIAL_STEPS = Object.freeze([
  Object.freeze({
    id: "polacz",
    text: "Przeciągnij nasionko na takie samo — wyrośnie kiełek!",
    gesture: "swipe-right",
    stat: "merges",
  }),
  Object.freeze({
    id: "doniczka",
    text: "Stuknij 🌱 Sowią doniczkę na dole — da nowe nasionko.",
    gesture: "tap",
    stat: "spawns",
  }),
  Object.freeze({
    id: "zamowienie",
    text: "Sąsiadki u góry proszą o rośliny. Zielona karta z ✓ jest gotowa — stuknij ją, żeby oddać.",
    gesture: "tap",
    stat: "orders",
    next: true,
  }),
  Object.freeze({
    id: "gwiazdki",
    text: "Za zamówienia dostajesz gwiazdki ⭐. Stuknij liczniki w prawym górnym rogu, żeby odnawiać pomieszczenia.",
    gesture: null,
    next: true,
  }),
  Object.freeze({
    id: "pomocnicy",
    text: "Uważaj na Pracu Pracu i Amic, a kózki Ci pomogą! „Jak grać?” znajdziesz w oknie pomieszczeń.",
    gesture: null,
    next: true,
  }),
]);

/**
 * createTutorial({ state, onStep(podpowiedź | null), onDone() }) → { update(stan), next(stan), skip(), progress() }.
 * `progress()` → { step, steps, id, text, gesture, next } albo null po końcu.
 */
export function createTutorial({ state, onStep = () => {}, onDone = () => {} }) {
  let index = 0;
  let finished = false;
  let base = { ...state.stats };

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
    base = { ...stateNow.stats };
    onStep(progress());
  }

  function update(stateNow) {
    const step = current();
    if (step?.stat && (stateNow.stats[step.stat] || 0) > (base[step.stat] || 0)) advance(stateNow);
  }

  onStep(progress());
  return {
    update,
    next(stateNow) {
      if (current()?.next) advance(stateNow);
    },
    skip: finish,
    progress,
  };
}
