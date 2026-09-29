// Sowie Tory — „Humbacze Tory” (Analiza 2, rozdz. 3.2): po przemianie w basenie humbak zostaje grywalny przez 20 s.
// Płynie trzema morskimi torami, przesunięcie w bok zmienia tor, w górę — wyskok nad falą; liście monstery wiszą
// w złotych kółkach nisko nad wodą albo wysoko (trzeba wyskoczyć). Nie ma przeszkód ani obrażeń.
// Czysta logika (testy jednostkowe); położenia liści: `at` — metry od początku rejsu.
import { LANES } from "./config.js";
import { laneX } from "./projection.js";

export const WHALE = Object.freeze({
  duration: 20,
  speed: 14,
  laneSpeed: 12,
  leap: 8.6, // wyskok: szczyt 8,6² / (2 · 17) ≈ 2,2 m, w powietrzu ok. 1 s
  gravity: 17,
  firstRing: 18, // pierwsze kółko 18 m przed humbakiem
  ringEvery: 9, // kolejne co 9 m
  lowY: 0.5,
  highY: 2,
  reachX: 0.8,
  reachY: 0.75,
  reachZ: 0.9,
  points: 10,
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Rozkład kółek z liśćmi: rzędy co `ringEvery` m; w rzędzie 1–3 kółka, co trzeci rząd wysoko (wyskok).
export function whaleRings(random) {
  const rings = [];
  const end = WHALE.duration * WHALE.speed - 12;
  let row = 0;
  for (let at = WHALE.firstRing; at < end; at += WHALE.ringEvery, row += 1) {
    const high = row % 3 === 2;
    const count = 1 + Math.floor(random() * 3);
    // Tasowanie Fishera–Yatesa, pierwsze `count` torów.
    const order = [-1, 0, 1];
    for (let index = order.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [order[index], order[other]] = [order[other], order[index]];
    }
    const lanes = order.slice(0, count);
    for (const lane of lanes) {
      rings.push({
        lane,
        at,
        y: high ? WHALE.highY : WHALE.lowY,
        taken: false,
        gold: row % 7 === 6 && lane === lanes[0],
      });
    }
  }
  return rings.sort((a, b) => a.at - b.at);
}

/**
 * Rejs: `createWhaleRide({ random, lane })` → { state, input(kierunek), update(dt) → zdarzenia, done() }.
 * Zdarzenia: `whaleLeap`, `whaleSplash`, `whaleLane`, `whaleLeaf { kind, lane }`.
 */
export function createWhaleRide({ random = Math.random, lane = 0 } = {}) {
  const state = {
    time: 0,
    distance: 0,
    lane,
    x: laneX(lane),
    y: 0,
    vy: 0,
    airborne: false,
    rings: whaleRings(random),
    collected: 0,
  };
  const controls = { left: false, right: false, up: false };

  return {
    state,
    input(direction) {
      if (direction in controls) controls[direction] = true;
    },
    update(dt) {
      const events = [];
      if (state.time >= WHALE.duration) return events;
      state.time = Math.min(WHALE.duration, state.time + dt);
      state.distance += WHALE.speed * dt;
      if (controls.left || controls.right) {
        const next = clamp(state.lane + (controls.left ? -1 : 1), LANES.min, LANES.max);
        if (next !== state.lane) {
          state.lane = next;
          events.push({ type: "whaleLane", lane: next });
        }
      }
      if (controls.up && !state.airborne) {
        state.airborne = true;
        state.vy = WHALE.leap;
        events.push({ type: "whaleLeap" });
      }
      controls.left = controls.right = controls.up = false;
      const target = laneX(state.lane);
      const move = WHALE.laneSpeed * dt;
      state.x = Math.abs(target - state.x) <= move ? target : state.x + Math.sign(target - state.x) * move;
      if (state.airborne) {
        state.vy -= WHALE.gravity * dt;
        state.y += state.vy * dt;
        if (state.y <= 0) {
          state.y = 0;
          state.vy = 0;
          state.airborne = false;
          events.push({ type: "whaleSplash" });
        }
      }
      for (const ring of state.rings) {
        const z = ring.at - state.distance;
        if (z > WHALE.reachZ) break;
        if (ring.taken || z < -WHALE.reachZ) continue;
        if (Math.abs(state.x - laneX(ring.lane)) < WHALE.reachX && Math.abs(state.y + 0.4 - ring.y) < WHALE.reachY) {
          ring.taken = true;
          state.collected += ring.gold ? 5 : 1;
          events.push({ type: "whaleLeaf", kind: ring.gold ? "zloty" : "zielony", lane: ring.lane });
        }
      }
      return events;
    },
    done: () => state.time >= WHALE.duration,
    remaining: () => Math.max(0, WHALE.duration - state.time),
  };
}
