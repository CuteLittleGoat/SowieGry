// Sowie Ogrody — kontrakty dnia (E7d3; dawne „Kontrakty ogrodnicze” z shared/gameplay-expansion.js): trzy zadania
// liczone od pierwszego wejścia danego dnia (linia bazowa ze statystyk ogrodu), nagroda — XP i piórka Sowiej
// Akademii. Identyfikatory nagród jak w dawnej grze (`feature:ogrody:<dzień UTC>:<id>`), więc tego samego dnia
// kontrakt da nagrodę tylko raz — także gdy gracz zagląda do obu wersji. Czysta logika.

export const DAILY_CONTRACTS = Object.freeze([
  { id: "clicks", label: "Zbierz liście 25 stuknięciami", stat: "taps", target: 25, xp: 30, feathers: 4 },
  { id: "buys", label: "Kup 6 roślin", stat: "buys", target: 6, xp: 35, feathers: 4 },
  { id: "watering", label: "Podlej ogród 2 razy", stat: "waterings", target: 2, xp: 30, feathers: 4 },
]);

/** Dzień kontraktów (UTC, jak w dawnej grze): „2026-10-04”. */
export const dayKey = (now) => new Date(now).toISOString().slice(0, 10);

/** Identyfikator nagrody Akademii za kontrakt `id` w dniu `date`. */
export const contractAward = (date, id) => `feature:ogrody:${date}:${id}`;

/** Stan dnia `state.daily = { date, baseline: { taps, buys, waterings }, claimed: {} }` — nowy dzień, nowa linia bazowa. */
export function ensureDaily(state, now) {
  const date = dayKey(now);
  if (state.daily?.date !== date) {
    state.daily = {
      date,
      baseline: Object.fromEntries(DAILY_CONTRACTS.map((item) => [item.stat, Number(state.stats?.[item.stat]) || 0])),
      claimed: {},
    };
  }
  return state.daily;
}

/** Kontrakty z postępem: { …kontrakt, progress (do celu), done, claimed }. */
export function dailyContracts(state, now) {
  const daily = ensureDaily(state, now);
  return DAILY_CONTRACTS.map((item) => {
    const progress = Math.max(
      0,
      Math.min(item.target, (Number(state.stats?.[item.stat]) || 0) - (daily.baseline[item.stat] || 0)),
    );
    return { ...item, progress, done: progress >= item.target, claimed: Boolean(daily.claimed[item.id]) };
  });
}

/** Odbiór nagrody: wykonany i nieodebrany kontrakt → oznaczony; zwraca { …kontrakt, award } albo null. */
export function claimContract(state, id, now) {
  const item = dailyContracts(state, now).find((entry) => entry.id === id);
  if (!item || !item.done || item.claimed) return null;
  state.daily.claimed[id] = true;
  return { ...item, claimed: true, award: contractAward(state.daily.date, id) };
}
