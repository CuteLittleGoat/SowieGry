// Sowie Trójki — samouczek (Analiza 5, rozdz. 10): uczymy przez granie. Karta „Nowość” przed poziomem z nową rzeczą
// (obrazek słowami, jedno zdanie, „Rozumiem”), a na pierwszych poziomach ręka pokazuje dobry ruch (palec przesuwa się
// z kafelka na sąsiada) — aż gracz wykona pierwszy ruch. Teksty w levels.js (`INTROS`).
import { openModal } from "../shared/ui/modal.js";
import { INTROS } from "./levels.js";

/** Karta „Nowość” (jeśli poziom ją ma i gracz jej jeszcze nie widział) → Promise po zamknięciu. */
export function showIntro(level, { seen = [], onSeen = () => {} } = {}) {
  const intro = INTROS[level.intro];
  if (!intro || seen.includes(level.intro)) return Promise.resolve(false);
  return new Promise((resolve) => {
    const content = document.createElement("div");
    content.className = "trojki-intro";
    const badge = document.createElement("p");
    badge.className = "trojki-intro-badge";
    badge.textContent = "Nowość";
    const text = document.createElement("p");
    text.textContent = intro.text;
    content.append(badge, text);
    openModal({
      title: intro.title,
      content,
      className: "trojki-intro-modal",
      actions: [{ label: "Rozumiem", primary: true, onClick: (close) => close() }],
      onClose: () => {
        onSeen(level.intro);
        resolve(true);
      },
    });
  });
}

/**
 * Ręka nad planszą: element `hand` przesuwa się między środkami pól ruchu (`from`, `to` — piksele względem planszy).
 * `null` chowa rękę.
 */
export function showHand(hand, move) {
  if (!hand) return;
  if (!move) {
    hand.hidden = true;
    return;
  }
  hand.hidden = false;
  hand.style.setProperty("--x", `${move.from.x}px`);
  hand.style.setProperty("--y", `${move.from.y}px`);
  hand.style.setProperty("--dx", `${move.to.x - move.from.x}px`);
  hand.style.setProperty("--dy", `${move.to.y - move.from.y}px`);
}
