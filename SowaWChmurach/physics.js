// Sowa w Chmurach — ruch sowy (czysta logika: testy jednostkowe i autopilot w Node).
// Sterowanie: przeciąganie palcem przesuwa sowę w bok o tyle, o ile przesunął się palec (× OWL.drag) — ruch
// względny, więc palec w dolnej części ekranu nie zasłania sowy; klawisze ←/→ przyspieszają. Sowa sama
// odbija się od platform; przez krawędź kolumny przechodzi na drugą stronę.
import { OWL, WORLD } from "./config.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Położenie w kolumnie [0, 9) — przejście przez krawędź.
export const wrapX = (x) => ((x % WORLD.width) + WORLD.width) % WORLD.width;

// Najkrótsza odległość w bok z `from` do `to` (także przez krawędź), ze znakiem.
export function wrapDelta(from, to) {
  const delta = to - from;
  return delta - Math.round(delta / WORLD.width) * WORLD.width;
}

export function createOwlBody(x = WORLD.width / 2, y = 0) {
  return { x, y, vx: 0, vy: 0, pending: 0, dragged: false, facing: 1 };
}

// Przeciąganie: przesunięcie palca w metrach świata (dodatnie — w prawo); sowa nadrabia je w kolejnych krokach.
export function steerBy(body, meters) {
  body.pending += meters * OWL.drag;
}

/**
 * Jeden krok ruchu. keys: { left, right } — trzymane klawisze. Najpierw przeciąganie (najwyżej dragSpeed m/s;
 * po nim sowa nie dryfuje), potem klawiatura (przyspieszenie, wygaszanie), na końcu grawitacja.
 */
export function stepOwl(body, keys, dt) {
  if (Math.abs(body.pending) > 1e-6) {
    const limit = OWL.dragSpeed * dt;
    const move = clamp(body.pending, -limit, limit);
    body.pending -= move;
    body.x += move;
    body.vx = move / dt;
    body.dragged = true;
  } else if (Boolean(keys.left) !== Boolean(keys.right)) {
    const direction = keys.right ? 1 : -1;
    body.vx = clamp(body.vx + direction * OWL.keyAccel * dt, -OWL.keySpeed, OWL.keySpeed);
    body.x += body.vx * dt;
    body.dragged = false;
  } else {
    // Po przeciąganiu sowa staje od razu (precyzja); po klawiszu — krótko wyhamowuje.
    body.vx = body.dragged ? 0 : body.vx * Math.exp(-OWL.keyDecay * dt);
    if (Math.abs(body.vx) < 0.05) body.vx = 0;
    body.x += body.vx * dt;
    body.dragged = false;
  }
  if (Math.abs(body.vx) > 0.5) body.facing = Math.sign(body.vx);
  body.x = wrapX(body.x);
  body.vy = Math.max(-OWL.maxFall, body.vy - OWL.gravity * dt);
  body.y += body.vy * dt;
  return body;
}

// Czas (s) od wybicia z prędkością `velocity` do opadnięcia na wysokość `rise` m nad punktem wybicia (null —
// za wysoko).
export function flightTime(rise, velocity = OWL.jumpVelocity) {
  const disc = velocity * velocity - 2 * OWL.gravity * rise;
  if (disc < 0) return null;
  return (velocity + Math.sqrt(disc)) / OWL.gravity;
}

// Szczyt wybicia z prędkością `velocity` (m).
export const apexOf = (velocity = OWL.jumpVelocity) => (velocity * velocity) / (2 * OWL.gravity);
