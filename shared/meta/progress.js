// SowieProgress — rdzeń postępu gier (Analiza 2, rozdz. 4.2; Analiza 3, E2d i E9b).
// Gry wysyłają zdarzenia (liście, kózki, trafienia, koniec biegu…). SowieProgress liczy statystyki biegu dla ekranu
// wyników i przekazuje zdarzenia Sowiej Akademii (shared/meta/academy.js: metryki → zadania dnia i tygodnia,
// osiągnięcia), od której zależy też odblokowywanie zdjęć w Galerii Sów.

import { academyCalls, taskProgress } from "./academy.js";
import { applyProfileUpdates, profileUpdates } from "./missions.js";
import { EVENTS } from "./progress-events.js";

export { EVENTS, academyCalls, taskProgress };

const KNOWN = new Set(Object.values(EVENTS));

function emptyRun(gameId, options = {}, now) {
  return {
    gameId,
    difficulty: options.difficulty || null,
    daily: Boolean(options.daily),
    startedAt: now,
    leaves: { zielony: 0, zloty: 0, teczowy: 0, total: 0 },
    leafPoints: 0,
    goats: {},
    hits: { pracu: 0, amic: 0 },
    nearMisses: 0,
    fevers: 0,
    whales: 0,
    bestCombo: 0,
  };
}

/**
 * createProgress({ getAcademy, now }) → SowieProgress:
 * emit(typ, szczegóły), on(typ | "*", słuchacz), beginRun(gra, opcje), endRun(wynik) → podsumowanie, current().
 */
export function createProgress({ getAcademy = () => globalThis.SowieAcademy, now = () => Date.now() } = {}) {
  const listeners = new Map();
  let run = null;
  let tasksBefore = [];
  // Misje garderoby i statystyki profilu (shared/meta/missions.js) — włączane przez grę (linkProfile).
  let profileLink = null;

  function notify(type, detail) {
    for (const key of [type, "*"]) {
      for (const listener of listeners.get(key) || []) listener(detail, type);
    }
  }

  function count(type, detail) {
    if (!run) return;
    if (type === EVENTS.LEAF) {
      const kind = ["zielony", "zloty", "teczowy"].includes(detail.kind) ? detail.kind : "zielony";
      const amount = Math.max(1, Number(detail.count) || 1);
      run.leaves[kind] += amount;
      run.leaves.total += amount;
      run.leafPoints += Number(detail.points) || 0;
    } else if (type === EVENTS.GOAT) {
      run.goats[detail.kind] = (run.goats[detail.kind] || 0) + 1;
    } else if (type === EVENTS.HIT) {
      if (detail.by in run.hits) run.hits[detail.by] += 1;
    } else if (type === EVENTS.NEAR_MISS) {
      run.nearMisses += 1;
    } else if (type === EVENTS.COMBO) {
      run.bestCombo = Math.max(run.bestCombo, Number(detail.value) || 0);
    } else if (type === EVENTS.FEVER) {
      run.fevers += 1;
    } else if (type === EVENTS.WHALE) {
      run.whales += 1;
    }
  }

  const api = {
    EVENTS,
    emit(type, detail = {}) {
      if (!KNOWN.has(type)) throw new Error(`Nieznane zdarzenie postępu: ${type}`);
      const payload = { ...detail };
      if (!payload.gameId && run) payload.gameId = run.gameId;
      count(type, payload);
      const academy = getAcademy();
      if (academy) {
        for (const call of academyCalls(type, payload)) academy.record?.(...call);
        if (type === EVENTS.AWARD && payload.id) {
          academy.award?.(payload.id, payload.xp ?? 25, payload.feathers ?? 3, payload.label || "Nagroda");
        }
      }
      if (profileLink) {
        const completed = applyProfileUpdates(profileLink.getCloud(), profileUpdates(type, payload), {
          cosmetics: profileLink.getPlatform()?.COSMETICS || {},
        });
        for (const item of completed) profileLink.onMission(item);
      }
      notify(type, payload);
      return payload;
    },
    on(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
      return () => listeners.get(type)?.delete(listener);
    },
    beginRun(gameId, options = {}) {
      run = emptyRun(gameId, options, now());
      tasksBefore = taskProgress(getAcademy()?.snapshot?.());
      api.emit(EVENTS.RUN_STARTED, { gameId, difficulty: run.difficulty, daily: run.daily });
      return api.current();
    },
    // Koniec biegu: zdarzenie run:ended (Akademia, misje profilu) i podsumowanie dla ekranu wyników.
    endRun(result = {}) {
      if (!run) throw new Error("Bieg nie został rozpoczęty (beginRun)");
      const finished = run;
      const detail = {
        bestCombo: finished.bestCombo || undefined,
        difficulty: finished.difficulty || undefined,
        ...result,
        gameId: finished.gameId,
        // Liczniki całego biegu — zadania „z dowolnej gry” i osiągnięcia Akademii.
        run: {
          leaves: finished.leaves.total,
          goats: Object.values(finished.goats).reduce((sum, value) => sum + value, 0),
          nearMisses: finished.nearMisses,
          whales: finished.whales,
          fevers: finished.fevers,
        },
      };
      api.emit(EVENTS.RUN_ENDED, detail);
      const after = taskProgress(getAcademy()?.snapshot?.());
      const tasks = after.map((task) => {
        const before = tasksBefore.find((item) => item.id === task.id);
        return { ...task, advanced: task.progress > (before?.progress ?? 0), newlyDone: task.done && !before?.done };
      });
      run = null;
      return { ...finished, ...detail, durationMs: now() - finished.startedAt, tasks };
    },
    // Gra (nie Laboratorium) włącza zapis misji garderoby i statystyk profilu; onMission — ukończona misja.
    linkProfile({
      getCloud = () => globalThis.SowieCloud,
      getPlatform = () => globalThis.SowiePlatform,
      onMission = () => {},
    } = {}) {
      profileLink = { getCloud, getPlatform, onMission };
    },
    current: () => (run ? JSON.parse(JSON.stringify(run)) : null),
    tasks: () => taskProgress(getAcademy()?.snapshot?.()),
  };
  return api;
}

// Wspólna instancja strony (dostępna też jako window.SowieProgress dla klasycznych skryptów i testów).
export const progress = createProgress();
if (globalThis.window) globalThis.window.SowieProgress = progress;
