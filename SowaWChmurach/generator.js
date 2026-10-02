// Sowa w Chmurach — generator trasy (czysta logika z ziarnem): ścieżka platform, z których każda następna jest
// osiągalna z poprzedniej (odstęp w pionie najwyżej 82% szczytu wybicia, krok w bok najwyżej 3,6 m), trudne
// platformy według wysokości i poziomu, balkon co 150 m, dodatkowe platformy i pułapki (krucha gałązka nigdy
// nie leży na ścieżce) oraz kolumny liści nad platformami ścieżki.
import { APEX, DIFFICULTIES, GENERATOR, LEAVES, PLATFORM_TYPES, SWING, WORLD } from "./config.js";
import { createPlatform } from "./platforms.js";
import { wrapDelta } from "./physics.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Największy odstęp w pionie między platformami ścieżki.
export const MAX_GAP = APEX * GENERATOR.maxGapShare;

// Odstęp przed kolejną platformą ścieżki na wysokości `height` (bez losowania — środek przedziału).
export function baseGap(height, difficulty = "arcade") {
  const u = clamp(height / GENERATOR.gapHeight, 0, 1);
  const eased = 1 - (1 - u) * (1 - u);
  return (GENERATOR.gapStart + (GENERATOR.gapEnd - GENERATOR.gapStart) * eased) * DIFFICULTIES[difficulty].gap;
}

export function gapAt(height, difficulty, random) {
  return clamp(baseGap(height, difficulty) + (random() * 2 - 1) * GENERATOR.gapJitter, 1, MAX_GAP);
}

// Zakres środka platformy w kolumnie (huśtawka — z zapasem na wychylenie).
export function xRange(type) {
  const half = PLATFORM_TYPES[type].width / 2 + GENERATOR.margin + (type === "hustawka" ? SWING.amplitude : 0);
  return [half, WORLD.width - half];
}

// Szansa na trudną platformę: rośnie od wysokości `hardFrom` przez 200 m do `hardChance` × mnożnik poziomu.
export function hardChance(type, height, difficulty) {
  const from = GENERATOR.hardFrom[type];
  if (height < from) return 0;
  return GENERATOR.hardChance[type] * DIFFICULTIES[difficulty].hard * Math.min(1, (height - from) / 200 + 0.25);
}

/**
 * createGenerator({ random, difficulty }) → { fill(doWysokości, platformy, liście), skipTo(y, x), topY, pathCount }.
 * Pierwsza platforma na 1,6 m nad ziemią (start z ogródka), potem ścieżka do `doWysokości`.
 */
export function createGenerator({ random, difficulty = "arcade" }) {
  const pick = (min, max) => min + (max - min) * random();
  let lastY = 0;
  let lastX = WORLD.width / 2;
  // Ostatnia pewna platforma ścieżki (nie chmurka): chmurka znika po odbiciu, więc platforma za nią musi być
  // osiągalna także z tej pewnej (odstęp i krok w bok liczone od niej).
  let solidY = 0;
  let solidX = WORLD.width / 2;
  let hardRun = 0;
  let nextBalcony = GENERATOR.balconyEvery;
  let pathCount = 0;
  let columns = 0;

  function chooseType(y) {
    if (y >= nextBalcony) {
      nextBalcony += GENERATOR.balconyEvery;
      return "balkon";
    }
    const roll = random();
    let edge = 0;
    for (const type of ["lisc", "chmurka", "hustawka"]) {
      if (type !== "lisc" && hardRun >= GENERATOR.hardStreak) continue;
      if (type === "chmurka" && lastY !== solidY) continue;
      edge += hardChance(type, y, difficulty);
      if (roll < edge) return type;
    }
    return "galazka";
  }

  function chooseX(type) {
    const [min, max] = xRange(type);
    if (type === "balkon") return pick(min, max);
    // Po chmurce krok w bok liczony od ostatniej pewnej platformy.
    const from = lastY === solidY ? lastX : solidX;
    const step = pick(0.6, GENERATOR.maxStep) * (random() < 0.5 ? -1 : 1);
    let x = from + step;
    if (x < min || x > max) x = from - step;
    return clamp(x, min, max);
  }

  // Dodatkowa platforma w połowie odstępu, z dala od obu platform ścieżki (w bok, także przez krawędź).
  function extra(previousY, previousX, y, x, platforms) {
    if (y - previousY < 1.8 || random() >= GENERATOR.extraChance) return;
    const middle = (previousY + y) / 2 + pick(-0.3, 0.3);
    const trap =
      middle >= GENERATOR.hardFrom.krucha && random() < GENERATOR.extraKrucha * DIFFICULTIES[difficulty].hard;
    const type = trap ? "krucha" : "galazka";
    const [min, max] = xRange(type);
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const candidate = pick(min, max);
      const far = (other) => Math.abs(wrapDelta(other, candidate)) >= GENERATOR.extraSpacing;
      if (far(previousX) && far(x)) {
        platforms.push(createPlatform(type, candidate, middle, { path: false }));
        return;
      }
    }
  }

  function leafColumn(platform, leaves) {
    if (platform.type === "balkon" || platform.type === "hustawka" || random() >= LEAVES.chance) return;
    columns += 1;
    const count = 1 + Math.floor(random() * LEAVES.max);
    for (let index = 0; index < count; index += 1) {
      const top = index === count - 1;
      leaves.push({
        x: platform.baseX,
        y: platform.y + LEAVES.first + index * LEAVES.step,
        kind: top && columns % LEAVES.goldEvery === 0 ? "zloty" : "zielony",
        taken: false,
      });
    }
  }

  return {
    fill(untilY, platforms, leaves) {
      while (lastY < untilY) {
        let y = pathCount === 0 ? GENERATOR.firstY : lastY + gapAt(lastY, difficulty, random);
        // Za chmurką: najwyżej MAX_GAP nad ostatnią pewną platformą (chmurka to skrót, nie jedyna droga).
        if (lastY !== solidY) y = Math.max(lastY + 0.6, Math.min(y, solidY + MAX_GAP));
        const type = chooseType(y);
        // Chmurka nisko nad pewną platformą — żeby platforma za nią była osiągalna i bez niej.
        if (type === "chmurka") y = Math.min(y, solidY + MAX_GAP - 0.8);
        const x = chooseX(type);
        const platform = createPlatform(type, x, y, { phase: random() * Math.PI * 2 });
        if (pathCount > 0) extra(lastY, lastX, y, x, platforms);
        platforms.push(platform);
        leafColumn(platform, leaves);
        hardRun = type === "chmurka" || type === "hustawka" ? hardRun + 1 : 0;
        lastY = y;
        lastX = x;
        if (type !== "chmurka") {
          solidY = y;
          solidX = x;
        }
        pathCount += 1;
      }
    },
    // Testy i diagnostyka: ścieżka dalej od platformy (`y`, `x`) — następna w zwykłym odstępie nad nią.
    skipTo(y, x = lastX) {
      lastY = y;
      lastX = x;
      solidY = y;
      solidX = x;
      pathCount = Math.max(1, pathCount);
      while (nextBalcony <= y) nextBalcony += GENERATOR.balconyEvery;
    },
    get topY() {
      return lastY;
    },
    get pathCount() {
      return pathCount;
    },
  };
}
