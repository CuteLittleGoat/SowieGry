// Sowia Ucieczka — ruch sowy (czysta logika, testy jednostkowe): skok i podwójny skok, szybowanie przy
// przytrzymaniu, ślizg, szybkie opadanie, zeskok z platformy, „coyote time” i bufor skoku.
// Świat dostarcza podłoże: world.surfaceBelow(x, pół szerokości, poprzedni spód, obecny spód, pomijana platforma)
// i world.surfaceAt(x, pół szerokości, y) — wysokość powierzchni (0 = ziemia, ujemna = platforma) albo null.
import { OWL, PHYSICS } from "./config.js";

export function createOwlBody(x = 0) {
  return {
    x,
    y: 0, // spód (stopy); ziemia = 0, w górę ujemnie
    vy: 0,
    grounded: true,
    surface: 0,
    jumps: 1, // podwójny skok do wykorzystania w powietrzu
    coyote: 0,
    buffer: 0,
    gliding: false,
    glideTime: 0,
    sliding: 0,
    diving: false,
    slideQueued: false,
    dropping: null, // wysokość platformy, przez którą sowa właśnie zeskakuje
    airTime: 0,
  };
}

// Pole kolizji sowy (ok. 80% rysunku; w ślizgu niższe i szersze).
export function owlBox(body, out = { left: 0, right: 0, top: 0, bottom: 0 }) {
  const width = body.sliding > 0 ? OWL.slideWidth : OWL.hitWidth;
  const height = body.sliding > 0 ? OWL.slideHeight : OWL.hitHeight;
  out.left = body.x - width / 2;
  out.right = body.x + width / 2;
  out.bottom = body.y;
  out.top = body.y - height;
  return out;
}

function jump(body, velocity, events, type) {
  body.vy = -velocity;
  body.grounded = false;
  body.coyote = 0;
  body.buffer = 0;
  body.sliding = 0;
  body.diving = false;
  body.slideQueued = false;
  body.gliding = false;
  events?.push({ type });
}

// Przesunięcie w dół: na ziemi ślizg, na platformie zeskok, w powietrzu szybkie opadanie (i ślizg po lądowaniu).
export function pressDown(body, events) {
  if (body.grounded) {
    if (body.surface < 0) {
      body.dropping = body.surface;
      body.grounded = false;
      body.diving = true;
      body.slideQueued = true;
      body.vy = Math.max(body.vy, 4);
      events?.push({ type: "drop" });
    } else {
      body.sliding = PHYSICS.slideTime;
      events?.push({ type: "slide" });
    }
    return;
  }
  body.diving = true;
  body.slideQueued = true;
  body.gliding = false;
  body.vy = Math.max(body.vy, PHYSICS.fastFall);
  events?.push({ type: "dive" });
}

/**
 * Jeden krok ruchu sowy. controls: { jump (jednorazowe), down (jednorazowe), hold, holdTime }.
 * Zdarzenia (events): jump, doubleJump, land { impact, surface }, slide, drop, dive, glideStart, glideEnd.
 */
export function stepOwl(body, controls, dt, world, events = null, speed = 0) {
  if (controls.jump) {
    body.buffer = PHYSICS.jumpBuffer;
    controls.jump = false;
  }
  if (controls.down) {
    controls.down = false;
    pressDown(body, events);
  }
  if (body.buffer > 0) {
    if (body.grounded || body.coyote > 0) jump(body, PHYSICS.jumpVelocity, events, "jump");
    else if (body.jumps > 0) {
      body.jumps -= 1;
      jump(body, PHYSICS.doubleJumpVelocity, events, "doubleJump");
    }
  }
  body.buffer = Math.max(0, body.buffer - dt);
  body.coyote = Math.max(0, body.coyote - dt);
  body.sliding = Math.max(0, body.sliding - dt);
  body.x += speed * dt;

  const half = OWL.hitWidth / 2;
  if (body.grounded) {
    const surface = world.surfaceAt(body.x, half, body.y);
    if (surface === null) {
      // Zejście z krawędzi: jeszcze chwilę można skoczyć jak z ziemi.
      body.grounded = false;
      body.coyote = PHYSICS.coyote;
      body.sliding = 0;
    } else {
      body.y = surface;
      body.surface = surface;
      body.vy = 0;
      return;
    }
  }

  body.airTime += dt;
  const canGlide =
    controls.hold &&
    controls.holdTime >= PHYSICS.glideDelay &&
    body.vy > 0 &&
    !body.diving &&
    body.glideTime < PHYSICS.glideMaxTime;
  if (canGlide) {
    if (!body.gliding) events?.push({ type: "glideStart" });
    body.gliding = true;
    body.glideTime += dt;
    body.vy =
      body.vy > PHYSICS.glideFall
        ? Math.max(PHYSICS.glideFall, body.vy - PHYSICS.glideBrake * dt)
        : Math.min(PHYSICS.glideFall, body.vy + PHYSICS.gravity * dt);
  } else {
    if (body.gliding) events?.push({ type: "glideEnd" });
    body.gliding = false;
    body.vy = Math.min(PHYSICS.maxFall, body.vy + PHYSICS.gravity * dt);
    if (body.diving) body.vy = Math.max(body.vy, PHYSICS.fastFall);
  }
  const previous = body.y;
  body.y += body.vy * dt;
  if (body.dropping !== null && body.y > body.dropping + 0.3) body.dropping = null;

  if (body.vy >= 0) {
    const surface = world.surfaceBelow(body.x, half, previous, body.y, body.dropping);
    if (surface !== null) {
      const impact = body.vy;
      body.y = surface;
      body.surface = surface;
      body.vy = 0;
      body.grounded = true;
      body.jumps = 1;
      body.glideTime = 0;
      body.airTime = 0;
      body.dropping = null;
      if (body.gliding) events?.push({ type: "glideEnd" });
      body.gliding = false;
      const slide = body.diving && body.slideQueued && surface === 0;
      body.diving = false;
      body.slideQueued = false;
      events?.push({ type: "land", impact, surface });
      if (slide) {
        body.sliding = PHYSICS.slideTime;
        events?.push({ type: "slide" });
      }
      // Bufor: stuknięcie tuż przed lądowaniem daje skok od razu po lądowaniu.
      if (body.buffer > 0) jump(body, PHYSICS.jumpVelocity, events, "jump");
    }
  }
}

// Szczyt skoku i czas w powietrzu (do opisu i testów).
export function jumpApex(velocity = PHYSICS.jumpVelocity) {
  return (velocity * velocity) / (2 * PHYSICS.gravity);
}
