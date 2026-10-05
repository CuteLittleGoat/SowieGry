// Misje garderoby i statystyki profilu dla przebudowanych gier (Analiza 3, „okres przejściowy” do E9).
// Obecne gry posuwają je przez SowieCore.progressMission / recordStat (shared/sowie-core.js). Przebudowane gry
// wysyłają zdarzenia SowieProgress, a ten moduł zamienia je na te same zmiany profilu: profil.missions
// (postęp, ukończenie), profil.stats (liczniki) i profil.cosmetics.unlocked (nagroda za misję).
import { EVENTS } from "./progress-events.js";

// Opisy misji (klucze jak w SowiePlatform.DEFAULT_MISSIONS; te same teksty ma shared/sowie-core.js).
export const MISSION_LABELS = Object.freeze({
  leaves20: "Zbierz 20 liści monster",
  extraLife: "Zdobądź dodatkowe życie",
  nearMiss3: "Wykonaj 3 uniki „O włos!”",
  chaosFinish: "Ukończ kampanię Sowich Torów na poziomie Chaos",
  combo4: "Osiągnij combo ×4",
  runner1000: "Przebiegnij 1000 m w Sowiej Ucieczce",
  jumper250: "Osiągnij 250 m w Sowie w Chmurach",
});

/**
 * Zdarzenie → zmiany profilu (czysta funkcja):
 * { missions: [[klucz, wartość, "add" | "max"]], stats: [[klucz, wartość, "add" | "max"]] }.
 * Liście → leaves20 i stats.leaves; „O włos!” → nearMiss3 i stats.nearMisses; combo → stats.maxCombo, od ×4 combo4;
 * odzyskane życie (np. Chmura Pracu się oddala) → extraLife i stats.extraLives; koniec biegu → runner1000 / jumper250;
 * ukończona kampania (Sowie Tory, `finished`) → stats.finishes, a na poziomie Chaos (`difficulty`) także chaosFinish.
 */
export function profileUpdates(type, detail = {}) {
  const missions = [];
  const stats = [];
  if (type === EVENTS.LEAF) {
    const count = Math.max(1, Math.floor(Number(detail.count) || 1));
    stats.push(["leaves", count, "add"]);
    missions.push(["leaves20", count, "add"]);
  } else if (type === EVENTS.NEAR_MISS) {
    stats.push(["nearMisses", 1, "add"]);
    missions.push(["nearMiss3", 1, "add"]);
  } else if (type === EVENTS.COMBO) {
    const value = Math.floor(Number(detail.value) || 0);
    if (value > 0) stats.push(["maxCombo", value, "max"]);
    if (value >= 4) missions.push(["combo4", 1, "add"]);
  } else if (type === EVENTS.LIFE) {
    stats.push(["extraLives", 1, "add"]);
    missions.push(["extraLife", 1, "add"]);
  } else if (type === EVENTS.RUN_ENDED) {
    if (detail.finished) {
      stats.push(["finishes", 1, "add"]);
      if (detail.difficulty === "chaos") missions.push(["chaosFinish", 1, "add"]);
    }
    if (detail.gameId === "runner" && Number(detail.distance) > 0) {
      missions.push(["runner1000", Math.floor(Number(detail.distance)), "max"]);
    }
    if (detail.gameId === "jumper" && Number(detail.height) > 0) {
      missions.push(["jumper250", Math.floor(Number(detail.height)), "max"]);
    }
  }
  return { missions, stats };
}

/**
 * Zapis zmian w profilu przez SowieCloud (updateProfile / increment). Zwraca misje ukończone właśnie teraz:
 * [{ key, label, reward, rewardLabel }]. Nagroda (dodatek) trafia do profil.cosmetics.unlocked w tym samym zapisie.
 * Bez gotowej chmury nic nie robi (przebudowane gry zaczynają bieg dopiero po wczytaniu profilu).
 */
export function applyProfileUpdates(cloud, { missions = [], stats = [] } = {}, { cosmetics = {} } = {}) {
  if (!cloud?.isReady?.()) return [];
  const profile = cloud.profile();
  for (const [key, value, mode] of stats) {
    if (!Number.isFinite(value)) continue;
    if (mode === "max") {
      if (value > (Number(profile.stats?.[key]) || 0)) {
        cloud.updateProfile((data) => {
          data.stats ||= {};
          data.stats[key] = value;
        });
      }
    } else cloud.increment(`stats.${key}`, value);
  }
  const completed = [];
  for (const [key, value, mode] of missions) {
    const mission = profile.missions?.[key];
    if (!mission || mission.done || !Number.isFinite(value)) continue;
    const current = Number(mission.progress) || 0;
    const next = Math.min(mission.target, mode === "max" ? Math.max(current, value) : current + value);
    if (next === current) continue;
    const done = next >= mission.target;
    cloud.updateProfile((data) => {
      const target = data.missions[key];
      target.progress = next;
      if (!done) return;
      target.done = true;
      data.cosmetics ||= { selected: "none", unlocked: ["none"] };
      data.cosmetics.unlocked ||= ["none"];
      if (target.reward && !data.cosmetics.unlocked.includes(target.reward))
        data.cosmetics.unlocked.push(target.reward);
    });
    if (done) {
      completed.push({
        key,
        label: MISSION_LABELS[key] || key,
        reward: mission.reward,
        rewardLabel: cosmetics[mission.reward]?.label || mission.reward,
      });
    }
  }
  return completed;
}
