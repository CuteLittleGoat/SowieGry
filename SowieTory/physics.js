// Sowie Tory — ruch sowy (czysta logika: testy jednostkowe i przeszukiwanie wzorów w Node).
// Sterowanie: przesunięcie ←/→ zmienia tor, ↑ — skok, ↓ — ślizg (w powietrzu: szybkie lądowanie, potem ślizg).
import { LANES, OWL } from "./config.js";
import { laneX } from "./projection.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Sowa na środkowym torze, na ziemi.
export function createOwlBody(lane = 0) {
  return { lane, x: laneX(lane), y: 0, vy: 0, grounded: true, slide: 0, buffer: 0, diving: false };
}

/**
 * Jeden krok ruchu. controls: { left, right, up, down } — jednorazowe polecenia z gestów (true w kroku,
 * w którym przyszły). Zwraca listę zdarzeń ruchu: "lane", "jump", "slide", "land".
 */
export function stepOwl(body, controls, dt, events = []) {
  if (controls.left) {
    const lane = clamp(body.lane - 1, LANES.min, LANES.max);
    if (lane !== body.lane) {
      body.lane = lane;
      events.push("lane");
    }
  }
  if (controls.right) {
    const lane = clamp(body.lane + 1, LANES.min, LANES.max);
    if (lane !== body.lane) {
      body.lane = lane;
      events.push("lane");
    }
  }
  if (controls.up) body.buffer = OWL.jumpBuffer;
  if (controls.down) {
    if (body.grounded) {
      body.slide = OWL.slideTime;
      events.push("slide");
    } else {
      // W powietrzu: szybkie lądowanie i ślizg zaraz po nim.
      body.diving = true;
      body.buffer = 0;
    }
  }

  // Skok z ziemi (także przerywa ślizg); bufor pozwala nacisnąć chwilę przed lądowaniem.
  if (body.buffer > 0 && body.grounded) {
    body.vy = OWL.jumpVelocity;
    body.grounded = false;
    body.slide = 0;
    body.buffer = 0;
    events.push("jump");
  }
  body.buffer = Math.max(0, body.buffer - dt);

  // Tor: stała prędkość w bok do środka wybranego toru.
  const target = laneX(body.lane);
  const move = OWL.laneSpeed * dt;
  body.x = Math.abs(target - body.x) <= move ? target : body.x + Math.sign(target - body.x) * move;

  // Pion.
  if (!body.grounded) {
    body.vy -= (body.diving ? OWL.fastFall : OWL.gravity) * dt;
    body.y += body.vy * dt;
    if (body.y <= 0) {
      body.y = 0;
      body.vy = 0;
      body.grounded = true;
      events.push("land");
      if (body.diving) {
        body.diving = false;
        body.slide = OWL.slideTime;
        events.push("slide");
      }
    }
  } else if (body.slide > 0) {
    body.slide = Math.max(0, body.slide - dt);
  }
  return events;
}

// Wysokość sowy (góra pola kolizji nad drogą): ślizg obniża sowę.
export const owlTop = (body) => body.y + (body.slide > 0 ? OWL.slideHeight : OWL.height);
