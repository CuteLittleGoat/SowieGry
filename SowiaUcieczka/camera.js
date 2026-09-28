// Sowia Ucieczka — kamera: sowa przy lewej krawędzi, a kamera oddala się wraz z prędkością tak, żeby
// przeszkoda była widoczna co najmniej 1,1 s przed zderzeniem — na każdym telefonie, także 320 × 568.
import { computeLayout } from "../shared/engine/view.js";
import { createCamera } from "../shared/engine/camera.js";
import { OWL, VIEW } from "./config.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Odległość od przodu sowy do prawej krawędzi ekranu przy danej widocznej szerokości świata.
export function aheadDistance(visibleWidth) {
  return visibleWidth * (1 - OWL.screenX) - OWL.hitWidth / 2;
}

// Szerokość świata potrzebna, żeby przy tej prędkości widzieć `reaction` sekund przed sobą.
export function requiredVisibleWidth(speed, reaction = VIEW.reactionTarget) {
  return (speed * reaction + OWL.hitWidth / 2) / (1 - OWL.screenX);
}

// Powiększenie kamery (1 = widok bazowy; mniej = oddalenie).
export function targetZoom(baseVisibleWidth, speed, reaction = VIEW.reactionTarget) {
  return clamp(baseVisibleWidth / requiredVisibleWidth(speed, reaction), VIEW.minZoom, 1);
}

// Czas reakcji (s) na ekranie o danym rozmiarze CSS przy danej prędkości — z parametrów widoku i kamery.
export function reactionTime({ cssWidth, cssHeight, speed }) {
  const layout = computeLayout({ cssWidth, cssHeight, minWorld: VIEW.minWorld });
  const zoom = targetZoom(layout.worldWidth, speed);
  return aheadDistance(layout.worldWidth / zoom) / speed;
}

// Odległość, z której rusza obiekt szybszy od świata (wózek, maile): czas do zderzenia ≥ moverLead.
export function moverTriggerDistance(speed, extraSpeed) {
  return (speed + Math.abs(extraSpeed)) * VIEW.moverLead;
}

/**
 * Kamera biegu: x — sowa na 18% szerokości; y — ziemia na 80% wysokości (ekran tytułowy: 42%), a gdy sowa wznosi się wysoko
 * (platformy, szybowanie), kamera podjeżdża, żeby sowa nie weszła pod HUD. Wstrząs z Sowiego Silnika.
 */
export function createRunCamera() {
  const camera = createCamera();
  let offsetY = 0;
  return Object.assign(camera, {
    // layout — z view.layout() (worldWidth / worldHeight przy powiększeniu 1).
    track(owl, speed, layout, dt, { snap = false, groundScreenY = VIEW.groundScreenY } = {}) {
      const zoomTarget = targetZoom(layout.worldWidth, Math.max(speed, 0.1));
      camera.zoom = snap ? zoomTarget : camera.zoom + (zoomTarget - camera.zoom) * (1 - Math.exp(-VIEW.zoomRate * dt));
      const width = layout.worldWidth / camera.zoom;
      const height = layout.worldHeight / camera.zoom;
      camera.x = owl.x + (0.5 - OWL.screenX) * width;
      const baseY = -(groundScreenY - 0.5) * height;
      const owlTop = owl.y - OWL.drawSize;
      const limit = baseY - height / 2 + VIEW.hudWorld;
      const wanted = Math.min(0, owlTop - limit);
      offsetY = snap ? wanted : offsetY + (wanted - offsetY) * (1 - Math.exp(-VIEW.followRate * dt));
      camera.y = baseY + offsetY;
      return camera;
    },
    visibleWidth: (layout) => layout.worldWidth / camera.zoom,
    visibleHeight: (layout) => layout.worldHeight / camera.zoom,
  });
}
