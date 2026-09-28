// Pula obiektów: w pętli gry nie tworzymy nowych obiektów (bez pracy dla odśmiecacza pamięci).

export function createPool(factory, reset = () => {}, { size = 0 } = {}) {
  const free = [];
  const active = [];
  for (let index = 0; index < size; index += 1) free.push(factory());

  return {
    acquire() {
      const item = free.length ? free.pop() : factory();
      item.poolIndex = active.length;
      active.push(item);
      return item;
    },
    release(item) {
      const index = item.poolIndex;
      if (index === undefined || index < 0 || active[index] !== item) return false;
      const lastItem = active.pop();
      if (lastItem !== item) {
        active[index] = lastItem;
        lastItem.poolIndex = index;
      }
      item.poolIndex = -1;
      reset(item);
      free.push(item);
      return true;
    },
    // Iteracja od końca pozwala zwalniać elementy w trakcie przeglądania.
    forEachActive(callback) {
      for (let index = active.length - 1; index >= 0; index -= 1) callback(active[index]);
    },
    releaseAll() {
      while (active.length) this.release(active[active.length - 1]);
    },
    activeCount: () => active.length,
    freeCount: () => free.length,
  };
}
