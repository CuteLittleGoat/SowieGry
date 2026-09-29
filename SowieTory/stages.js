// Sowie Tory — plansze kampanii w kolejności z obecnej gry (wymaganie właściciela, 2026-09-27; Analiza 2, rozdz. 3.2).
// Każda plansza ma własną oprawę (scenery.js, props.js) i własne skórki tych samych rodzin przeszkód: `remap`
// zamienia rodzaj z wzoru na rodzaj tej planszy (typ i sposób omijania zostają). `chase` — pościg dzików (tylko PRL).

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
    // Wózki sklepowe (pełne), palety z płynem do spryskiwaczy (niskie), stojaki promocyjne (ślizg).
    remap: Object.freeze({ wozek: "wozek-sklepowy", kanister: "paleta", "znak-cen": "stojak" }),
    chase: false,
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
    // Stoiska promocyjne Amic (pełne), stosy katalogów Pracu (niskie); kanistry z wodą do podlewania zostają.
    remap: Object.freeze({ dystrybutor: "stoisko", teczka: "katalogi" }),
    chase: false,
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
    // Pracu i Amic bez zmian (cysterna dostawcza, barierki) + pościg dzików.
    remap: Object.freeze({}),
    chase: true,
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
    // Amic w pełnej krasie: samochody na podjeździe (długie), zadaszenie (ślizg), dystrybutory, kanistry.
    remap: Object.freeze({ wozek: "samochod", "znak-cen": "zadaszenie" }),
    chase: false,
  },
]);

export const STAGE_COUNT = STAGES.length;

// Rodzaj przeszkody na planszy (po zamianie skórki).
export const stageKind = (stage, kind) => STAGES[stage % STAGE_COUNT].remap[kind] || kind;
