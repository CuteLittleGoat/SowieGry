// Sowa w Chmurach — przechylanie telefonu (czysta logika, testy jednostkowe): kąt przechyłu w bok → docelowa
// prędkość sowy. Dane z `deviceorientation` (beta, gamma w stopniach) i obrotu ekranu (`screen.orientation.angle`).
// Przeciąganie palcem i klawiatura działają dalej (mają pierwszeństwo — `stepOwl`).
import { TILT } from "./config.js";

/**
 * Kąt przechyłu w bok względem ekranu (stopnie, dodatni — prawa krawędź ekranu w dół). W pionie to `gamma`;
 * w poziomie oś obrotu w bok to oś `beta` urządzenia (znak zależy od strony, w którą obrócono telefon).
 */
export function sideAngle({ beta = 0, gamma = 0 } = {}, angle = 0) {
  switch ((((Math.round(angle / 90) * 90) % 360) + 360) % 360) {
    case 90:
      return beta ?? 0;
    case 180:
      return -(gamma ?? 0);
    case 270:
      return -(beta ?? 0);
    default:
      return gamma ?? 0;
  }
}

/**
 * Docelowa prędkość w bok (m/s): martwa strefa `TILT.dead`°, pełna prędkość `TILT.speed` od `TILT.full`°, między
 * nimi liniowo; kąty powyżej 90° (telefon do góry nogami) przycięte.
 */
export function tiltSpeed(degrees) {
  const angle = Math.max(-90, Math.min(90, Number(degrees) || 0));
  const size = Math.abs(angle);
  if (size <= TILT.dead) return 0;
  const share = Math.min(1, (size - TILT.dead) / (TILT.full - TILT.dead));
  return Math.sign(angle) * share * TILT.speed;
}
