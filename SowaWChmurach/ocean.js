// Sowa w Chmurach — „Niebiański Ocean” (Analiza 2, rozdz. 3.3): co ok. 300 m na gałązce ścieżki leży humbak-gejzer;
// wlot w jego fontannę zaczyna 20-sekundowy bonus — sowa odbija się od grzbietów humbaków płynących w chmurach
// i zbiera liście, a upadek jest niemożliwy (pod humbakami miękkie „morze chmur”). Czysta logika (testy).
import { OCEAN, OWL } from "./config.js";
import { wrapDelta, wrapX } from "./physics.js";

// Platformy, na których może leżeć humbak-gejzer.
const STEADY = new Set(["galazka", "balkon"]);

// Fontanna gejzeru: słup nad humbakiem (± `fountainHalf` m w bok, od `fountainFrom` do `fountainTo` m nad gałązką).
export function inFountain(owl, geyser) {
  const dy = owl.y + OWL.center - geyser.y;
  return (
    Math.abs(wrapDelta(geyser.x, owl.x)) <= OCEAN.fountainHalf && dy >= OCEAN.fountainFrom && dy <= OCEAN.fountainTo
  );
}

/**
 * Planista gejzerów (osobny generator losowy): `plan(dolna, górna, gejzery)` — pierwszy od `OCEAN.first` m, potem
 * co `OCEAN.every` m, na gałązce albo balkonie ścieżki ({ x, y — wierzch platformy, taken }).
 */
export function createGeyserPlanner({ random }) {
  const pick = ([min, max]) => min + (max - min) * random();
  let next = OCEAN.first + pick([0, 40]);
  return {
    plan(lower, upper, list) {
      if (upper.y < next || !STEADY.has(upper.type)) return;
      list.push({ x: upper.baseX, y: upper.y, taken: false });
      next = upper.y + pick(OCEAN.every);
    },
  };
}

// Humbak w oceanie: płynie poziomo na stałej wysokości (`level` m nad bazą), przez krawędź kolumny.
export function whaleX(whale, time) {
  return wrapX(whale.x0 + whale.speed * time);
}

/**
 * Bonus: `createOcean({ random, base, x })` → { state, update(sowa, poprzednieY, dt) → zdarzenia, done() }.
 * `base` — wysokość, na której zaczyna się ocean (dolna krawędź „morza chmur”). Zdarzenia: `oceanBounce`
 * (grzbiet humbaka), `oceanFloor` (morze chmur), `oceanLeaf { kind, x, y, count, points }`.
 */
export function createOcean({ random = Math.random, base = 0, x = 4.5 } = {}) {
  const whales = OCEAN.levels.map((level, index) => ({
    level,
    x0: (x + index * 3 + random() * 2) % 9,
    speed: (OCEAN.speed[0] + random() * (OCEAN.speed[1] - OCEAN.speed[0])) * (index % 2 ? -1 : 1),
  }));
  const leaves = [];
  OCEAN.leafRows.forEach((row, rowIndex) => {
    for (let index = 0; index < OCEAN.leavesPerRow; index += 1) {
      const lx = ((index + 0.5) * 9) / OCEAN.leavesPerRow + (random() - 0.5) * 0.6;
      const gold = rowIndex === OCEAN.leafRows.length - 1 && index % 3 === 1;
      leaves.push({ x: lx, y: base + row + (random() - 0.5) * 0.6, kind: gold ? "zloty" : "zielony", taken: false });
    }
  });
  const state = { time: 0, base, whales, leaves, collected: 0, points: 0 };

  return {
    state,
    update(owl, previousY, dt) {
      const events = [];
      state.time += dt;
      // Grzbiet humbaka: trampolina (tylko przy opadaniu, w zasięgu grzbietu).
      if (owl.vy <= 0) {
        for (const whale of whales) {
          const top = base + whale.level;
          if (previousY < top || owl.y > top) continue;
          if (Math.abs(wrapDelta(whaleX(whale, state.time), owl.x)) > OCEAN.back + OWL.foot) continue;
          owl.y = top;
          owl.vy = OCEAN.bounce;
          events.push({ type: "oceanBounce", x: owl.x, y: top });
          break;
        }
        // Morze chmur: upadek niemożliwy — miękkie wybicie.
        if (owl.vy <= 0 && owl.y <= base) {
          owl.y = base;
          owl.vy = OCEAN.floorBounce;
          events.push({ type: "oceanFloor", x: owl.x, y: base });
        }
      }
      const cy = owl.y + OWL.center;
      for (const leaf of leaves) {
        if (leaf.taken || Math.hypot(wrapDelta(owl.x, leaf.x), cy - leaf.y) > OWL.reach) continue;
        leaf.taken = true;
        const count = leaf.kind === "zloty" ? 5 : 1;
        const points = OCEAN.points * count;
        state.collected += count;
        state.points += points;
        events.push({ type: "oceanLeaf", kind: leaf.kind, x: leaf.x, y: leaf.y, count, points });
      }
      return events;
    },
    done: () => state.time >= OCEAN.duration,
  };
}
