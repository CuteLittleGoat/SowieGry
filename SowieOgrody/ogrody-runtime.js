// Drobna warstwa runtime dla Sowie Ogrody: ogranicza częste zapisy wspólnych statystyk.
(() => {
  "use strict";
  const core = window.SowieCore;
  if (!core?.recordStat) return;

  const originalRecordStat = core.recordStat;
  const lastAt = new Map();

  core.recordStat = function recordOgrodyStatSafely(key, value, mode = "add") {
    if (!String(key).startsWith("ogrody")) {
      return originalRecordStat(key, value, mode);
    }
    const now = performance.now();
    const previous = lastAt.get(key) || 0;
    if (now - previous < 3000) return false;
    lastAt.set(key, now);
    return originalRecordStat(key, value, mode);
  };
})();
