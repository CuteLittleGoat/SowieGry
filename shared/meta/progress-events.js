// Zdarzenia SowieProgress (osobny moduł: używa ich też shared/meta/missions.js bez cyklicznego importu).
export const EVENTS = Object.freeze({
  RUN_STARTED: "run:started", // { gameId, difficulty, daily }
  RUN_ENDED: "run:ended", // { gameId, score, distance?, height?, finished?, bestChain?, bestStreak?, bestCombo? }
  LEAF: "leaf:collected", // { kind: "zielony" | "zloty" | "teczowy", count = 1, points }
  GOAT: "goat:caught", // { kind: "sprezynka" | "tarcza" | "magnes" | "turbo" | "podwajaczka" }
  HIT: "hit", // { by: "pracu" | "amic", variant }
  NEAR_MISS: "near-miss", // { by }
  COMBO: "combo", // { value }
  FEVER: "fever:start", // {}
  WHALE: "whale:bonus", // { leaves }
  LIFE: "life:gained", // {} — odzyskane życie (Sowia Ucieczka: Chmura Pracu się oddala)
  IDLE: "idle:progress", // gry idle: { gameId, lifetimeLeaves, clicks, buys, watering, prestiges, plants, rooms, goats, hybrids }
  VISIT: "game:visit", // { gameId }
  AWARD: "award", // { id, xp, feathers, label }
});
