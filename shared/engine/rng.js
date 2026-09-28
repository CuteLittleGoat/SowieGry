// Generator liczb pseudolosowych z ziarnem — ten sam algorytm co SowiePlatform.createRng
// (FNV-1a do zamiany ziarna na liczbę, xorshift32), więc wyzwanie dnia jest identyczne wszędzie.

export function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
}

export function createRng(seed = Date.now()) {
  let state = hashSeed(seed);

  function next() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  }

  return {
    next,
    // Liczba z przedziału [min, max).
    range: (min, max) => min + (max - min) * next(),
    // Liczba całkowita z przedziału [min, max] (włącznie).
    int: (min, max) => Math.floor(min + (max - min + 1) * next()),
    chance: (probability) => next() < probability,
    pick: (list) => list[Math.floor(next() * list.length)],
    shuffle(list) {
      for (let index = list.length - 1; index > 0; index -= 1) {
        const other = Math.floor(next() * (index + 1));
        [list[index], list[other]] = [list[other], list[index]];
      }
      return list;
    },
    getState: () => state,
    setState: (value) => {
      state = value >>> 0 || 1;
    },
  };
}
