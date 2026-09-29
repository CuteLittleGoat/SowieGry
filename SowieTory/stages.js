// Sowie Tory — plansze kampanii w kolejności z obecnej gry (wymaganie właściciela, 2026-09-27; Analiza 2, rozdz. 3.2).
// Każda plansza ma własną oprawę; rozgrywka specyficzna dla planszy (dziki na PRL, więcej liści na festiwalu)
// dochodzi w kolejnych krokach etapu E5.

export const STAGES = Object.freeze([
  {
    id: "biedronka",
    name: "Sowa w sklepie Biedronka",
    short: "Biedronka",
    sky: ["#fff3f3", "#fffaf0"],
    floor: "#e8edf2",
    lane: "#ffffff",
    accent: "#e2231a",
    fog: "#fff6f2",
  },
  {
    id: "festiwal",
    name: "Sowa na festiwalu roślin",
    short: "Festiwal roślin",
    sky: ["#fde9f4", "#eafcef"],
    floor: "#dcefd8",
    lane: "#ffffff",
    accent: "#3fae62",
    fog: "#f3fbf2",
  },
  {
    id: "prl",
    name: "Sowa uciekająca przed dzikami na blokowisku z PRL",
    short: "Blokowisko PRL",
    sky: ["#dfe7ef", "#f6f1e2"],
    floor: "#d3cdc3",
    lane: "#f2eee6",
    accent: "#c8553d",
    fog: "#eeeae1",
  },
  {
    id: "amic",
    name: "Sowa na stacji benzynowej Amic",
    short: "Stacja Amic",
    sky: ["#e3f4ff", "#f7fbff"],
    floor: "#9aa3ab",
    lane: "#f4f7f9",
    accent: "#1f9d55",
    fog: "#edf3f6",
  },
]);

export const STAGE_COUNT = STAGES.length;
