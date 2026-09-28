// SowieProgress — rdzeń postępu dla przebudowanych gier (Analiza 2, rozdz. 4.2; Analiza 3, E2d i „okres przejściowy”).
// Gry wysyłają zdarzenia (liście, kózki, trafienia, koniec biegu…). SowieProgress liczy statystyki biegu dla ekranu
// wyników, a do czasu E9 cienki „most” przekazuje je do obecnej Sowiej Akademii (metryki → misje dnia i tygodnia),
// od której zależy też odblokowywanie zdjęć w Galerii Sów.

export const EVENTS = Object.freeze({
  RUN_STARTED: "run:started", // { gameId, difficulty, daily }
  RUN_ENDED: "run:ended", // { gameId, score, distance?, height?, finished?, bestChain?, bestStreak?, bestCombo? }
  LEAF: "leaf:collected", // { kind: "zielony" | "zloty" | "teczowy", count = 1, points }
  GOAT: "goat:caught", // { kind: "sprezynka" | "tarcza" | "magnes" | "turbo" | "podwajaczka" }
  HIT: "hit", // { by: "pracu" | "amic", variant }
  NEAR_MISS: "near-miss", // { by }
  COMBO: "combo", // { value }
  FEVER: "fever:start", // {}
  WHALE: "whale:bonus", // { leaves }
  IDLE: "idle:progress", // gry idle: { gameId, lifetimeLeaves, clicks, buys, watering, prestiges, plants, rooms, goats, hybrids }
  VISIT: "game:visit", // { gameId }
  AWARD: "award", // { id, xp, feathers, label }
});

const KNOWN = new Set(Object.values(EVENTS));
const number = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);

/**
 * Most do Sowiej Akademii: zdarzenie → lista wywołań SowieAcademy.record(gra, metryka, wartość, tryb).
 * Te same metryki zapisuje dziś shared/gameplay-expansion.js dla obecnych gier, więc misje i Galeria działają
 * tak samo dla starych i nowych gier. Czysta funkcja (testowana jednostkowo).
 */
export function bridgeCalls(type, detail = {}) {
  const calls = [];
  const push = (gameId, metric, value, mode = "max") => {
    const numeric = number(value);
    if (numeric !== null) calls.push([gameId, metric, numeric, mode]);
  };
  const game = detail.gameId;
  if (type === EVENTS.RUN_ENDED) {
    if (game === "runner") {
      push(game, "runnerScore", detail.score);
      push(game, "runnerDistance", detail.distance);
      push(game, "runnerLeafChain", detail.bestChain);
    } else if (game === "jumper") {
      push(game, "jumperScore", detail.score);
      push(game, "jumperHeight", detail.height);
      push(game, "jumperStreak", detail.bestStreak);
    } else if (game === "sowa3") {
      push(game, "sowa3Score", detail.score);
      push(game, "sowa3Combo", detail.bestCombo);
      if (detail.finished) push(game, "sowa3Finishes", 1, "add");
    }
  } else if (type === EVENTS.IDLE) {
    if (game === "ogrody") {
      push(game, "ogrodyLeaves", detail.lifetimeLeaves);
      push(game, "ogrodyClicks", detail.clicks, "set");
      push(game, "ogrodyBuys", detail.buys, "set");
      push(game, "ogrodyWatering", detail.watering, "set");
      push(game, "ogrodyPrestiges", detail.prestiges, "set");
      push(game, "ogrodyPlants", detail.plants);
    } else if (game === "szklarnia") {
      push(game, "szklarniaRooms", detail.rooms);
      push(game, "szklarniaPlants", detail.plants);
      push(game, "szklarniaGoats", detail.goats, "set");
      push(game, "szklarniaHybrids", detail.hybrids);
    }
  } else if (type === EVENTS.VISIT && game) {
    push(game, `${game}Visits`, 1, "add");
  }
  return calls;
}

// Zadania z migawki Akademii (do ekranu wyników): misje dnia z postępem i misja tygodnia.
export function taskProgress(snapshot) {
  if (!snapshot?.daily) return [];
  const metrics = snapshot.metrics || {};
  const daily = (snapshot.daily.missions || []).map((mission) => {
    const progress =
      mission.type === "max"
        ? Number(snapshot.daily.metrics?.[mission.metric] || 0)
        : Number(metrics[mission.metric] || 0) - Number(mission.baseline || 0);
    return {
      id: mission.id,
      label: mission.label,
      progress: Math.max(0, Math.min(mission.target, progress)),
      target: mission.target,
      done: Boolean(mission.complete) || progress >= mission.target,
    };
  });
  const weekly = snapshot.weekly
    ? [
        {
          id: "weekly",
          label: "Zagraj w 3 różne gry w tym tygodniu",
          progress: Math.min(snapshot.weekly.target, snapshot.weekly.games?.length || 0),
          target: snapshot.weekly.target,
          done: Boolean(snapshot.weekly.complete),
        },
      ]
    : [];
  return [...daily, ...weekly];
}

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
        for (const call of bridgeCalls(type, payload)) academy.record?.(...call);
        if (type === EVENTS.AWARD && payload.id) {
          academy.award?.(payload.id, payload.xp ?? 25, payload.feathers ?? 3, payload.label || "Nagroda");
        }
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
    // Koniec biegu: zdarzenie run:ended (most do Akademii) i podsumowanie dla ekranu wyników.
    endRun(result = {}) {
      if (!run) throw new Error("Bieg nie został rozpoczęty (beginRun)");
      const finished = run;
      const detail = { bestCombo: finished.bestCombo || undefined, ...result, gameId: finished.gameId };
      api.emit(EVENTS.RUN_ENDED, detail);
      const after = taskProgress(getAcademy()?.snapshot?.());
      const tasks = after.map((task) => {
        const before = tasksBefore.find((item) => item.id === task.id);
        return { ...task, advanced: task.progress > (before?.progress ?? 0), newlyDone: task.done && !before?.done };
      });
      run = null;
      return { ...finished, ...detail, durationMs: now() - finished.startedAt, tasks };
    },
    current: () => (run ? JSON.parse(JSON.stringify(run)) : null),
    tasks: () => taskProgress(getAcademy()?.snapshot?.()),
  };
  return api;
}

// Wspólna instancja strony (dostępna też jako window.SowieProgress dla klasycznych skryptów i testów).
export const progress = createProgress();
if (globalThis.window) globalThis.window.SowieProgress = progress;
