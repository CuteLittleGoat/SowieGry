// Sowa w Chmurach — platformy (czysta logika): sześć typów z PLATFORM_TYPES, ruch huśtawki, znikanie chmurki
// i krucha gałązka, lądowanie tylko z góry (od dołu sowa przelatuje przez platformę).
import { FADE, OWL, PLATFORM_TYPES, SCORE, SWING } from "./config.js";
import { wrapDelta } from "./physics.js";

/**
 * Platforma: `x` — środek (huśtawka: bieżący), `baseX` — środek ruchu huśtawki, `y` — wierzch, `path` — należy do
 * ścieżki generatora (pozostałe to dodatkowe platformy i pułapki), `spent` — nie przyjmie już lądowania
 * (chmurka po odbiciu, złamana gałązka), `fade` — pozostały czas znikania, `gone` — do usunięcia.
 */
export function createPlatform(type, x, y, { phase = 0, path = true } = {}) {
  const info = PLATFORM_TYPES[type];
  if (!info) throw new Error(`Nieznany typ platformy: ${type}`);
  return { type, x, baseX: x, y, width: info.width, phase, path, spent: false, fade: 0, gone: false };
}

// Środek huśtawki w chwili `time` (pozostałe platformy stoją).
export function platformX(platform, time) {
  if (platform.type !== "hustawka") return platform.baseX;
  return platform.baseX + SWING.amplitude * Math.sin((2 * Math.PI * time) / SWING.period + platform.phase);
}

export function updatePlatforms(list, time, dt) {
  for (const platform of list) {
    if (platform.type === "hustawka") platform.x = platformX(platform, time);
    if (platform.fade > 0) {
      platform.fade = Math.max(0, platform.fade - dt);
      if (platform.fade === 0) platform.gone = true;
    }
  }
}

// Lądowanie: sowa opada, stopy przeszły w tym kroku przez wierzch platformy, a w bok sięgają platformy (także
// przez krawędź kolumny).
export function landsOn(body, previousY, platform) {
  if (platform.spent || platform.gone || body.vy > 0) return false;
  if (previousY < platform.y - 1e-6 || body.y > platform.y) return false;
  return Math.abs(wrapDelta(platform.x, body.x)) <= platform.width / 2 + OWL.foot;
}

// Idealne lądowanie: stopy w środkowych 30% platformy.
export const isPerfect = (body, platform) =>
  Math.abs(wrapDelta(platform.x, body.x)) <= (platform.width * SCORE.perfectShare) / 2;

/**
 * Skutek lądowania: { bounce (mnożnik prędkości wybicia; 0 — brak odbicia), points }. Chmurka znika po odbiciu,
 * krucha gałązka łamie się bez odbicia (sowa spada dalej).
 */
export function land(platform) {
  const info = PLATFORM_TYPES[platform.type];
  if (platform.type === "chmurka") {
    platform.spent = true;
    platform.fade = FADE.chmurka;
  } else if (platform.type === "krucha") {
    platform.spent = true;
    platform.fade = FADE.krucha;
  }
  return { bounce: info.bounce, points: info.points };
}
