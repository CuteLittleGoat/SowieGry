// Misje garderoby i statystyki profilu z przebudowanych gier (shared/meta/missions.js + SowieProgress.linkProfile).
import assert from "node:assert/strict";
import test from "node:test";
import { MISSION_LABELS, applyProfileUpdates, profileUpdates } from "../../shared/meta/missions.js";
import { EVENTS, createProgress } from "../../shared/meta/progress.js";

// Atrapa SowieCloud: profil w pamięci, updateProfile od razu, increment dodaje do ścieżki.
function fakeCloud() {
  const profile = {
    stats: { leaves: 0, nearMisses: 0, extraLives: 0, maxCombo: 1 },
    missions: {
      leaves20: { progress: 18, target: 20, done: false, reward: "glasses" },
      extraLife: { progress: 0, target: 1, done: false, reward: "flowerCrown" },
      nearMiss3: { progress: 0, target: 3, done: false, reward: "scarf" },
      combo4: { progress: 0, target: 1, done: false, reward: "bubbleTrail" },
      runner1000: { progress: 400, target: 1000, done: false, reward: "cap" },
      jumper250: { progress: 0, target: 250, done: false, reward: "backpack" },
    },
    cosmetics: { selected: "none", unlocked: ["none"] },
  };
  return {
    profile: () => profile,
    isReady: () => true,
    updates: 0,
    updateProfile(mutator) {
      this.updates += 1;
      mutator(profile);
    },
    increment(path, amount) {
      const [, key] = path.split(".");
      profile.stats[key] = (profile.stats[key] || 0) + amount;
    },
  };
}

const COSMETICS = {
  glasses: { label: "Okulary" },
  cap: { label: "Czapka z daszkiem" },
  flowerCrown: { label: "Wianek" },
};

test("zdarzenia gry → misje i statystyki profilu (jak dawne SowieCore.progressMission / recordStat)", () => {
  assert.deepEqual(profileUpdates(EVENTS.LEAF, { kind: "zloty", count: 5 }), {
    missions: [["leaves20", 5, "add"]],
    stats: [["leaves", 5, "add"]],
  });
  assert.deepEqual(profileUpdates(EVENTS.NEAR_MISS, {}).missions, [["nearMiss3", 1, "add"]]);
  assert.deepEqual(profileUpdates(EVENTS.COMBO, { value: 3 }), { missions: [], stats: [["maxCombo", 3, "max"]] });
  assert.deepEqual(profileUpdates(EVENTS.COMBO, { value: 4 }).missions, [["combo4", 1, "add"]]);
  assert.deepEqual(profileUpdates(EVENTS.LIFE, {}), {
    missions: [["extraLife", 1, "add"]],
    stats: [["extraLives", 1, "add"]],
  });
  assert.deepEqual(profileUpdates(EVENTS.RUN_ENDED, { gameId: "runner", distance: 1234.6 }).missions, [
    ["runner1000", 1234, "max"],
  ]);
  assert.deepEqual(profileUpdates(EVENTS.RUN_ENDED, { gameId: "jumper", height: 90 }).missions, [
    ["jumper250", 90, "max"],
  ]);
  assert.deepEqual(profileUpdates(EVENTS.GOAT, { kind: "tarcza" }), { missions: [], stats: [] });
  assert.equal(MISSION_LABELS.runner1000, "Przebiegnij 1000 m w Sowiej Ucieczce");
});

test("zapis: postęp misji, ukończenie z nagrodą (dodatek odblokowany raz), liczniki i maksimum", () => {
  const cloud = fakeCloud();
  const profile = cloud.profile();
  assert.deepEqual(applyProfileUpdates(cloud, profileUpdates(EVENTS.LEAF, { count: 1 }), { cosmetics: COSMETICS }), []);
  assert.equal(profile.missions.leaves20.progress, 19);
  assert.equal(profile.stats.leaves, 1);
  const done = applyProfileUpdates(cloud, profileUpdates(EVENTS.LEAF, { count: 5 }), { cosmetics: COSMETICS });
  assert.deepEqual(done, [
    { key: "leaves20", label: "Zbierz 20 liści monster", reward: "glasses", rewardLabel: "Okulary" },
  ]);
  assert.equal(profile.missions.leaves20.progress, 20);
  assert.equal(profile.missions.leaves20.done, true);
  assert.deepEqual(profile.cosmetics.unlocked, ["none", "glasses"]);
  // Ukończonej misji już nie ruszamy.
  const updates = cloud.updates;
  assert.deepEqual(applyProfileUpdates(cloud, profileUpdates(EVENTS.LEAF, { count: 1 })), []);
  assert.equal(cloud.updates, updates);
  // 1000 m w jednym biegu: maksimum, nie suma.
  applyProfileUpdates(cloud, profileUpdates(EVENTS.RUN_ENDED, { gameId: "runner", distance: 300 }));
  assert.equal(profile.missions.runner1000.progress, 400);
  const cap = applyProfileUpdates(cloud, profileUpdates(EVENTS.RUN_ENDED, { gameId: "runner", distance: 1500 }), {
    cosmetics: COSMETICS,
  });
  assert.equal(cap[0].rewardLabel, "Czapka z daszkiem");
  assert.ok(profile.cosmetics.unlocked.includes("cap"));
  // Combo: maksimum w statystykach.
  applyProfileUpdates(cloud, profileUpdates(EVENTS.COMBO, { value: 3 }));
  applyProfileUpdates(cloud, profileUpdates(EVENTS.COMBO, { value: 2 }));
  assert.equal(profile.stats.maxCombo, 3);
  // Bez gotowej chmury — nic.
  assert.deepEqual(applyProfileUpdates({ isReady: () => false }, profileUpdates(EVENTS.LIFE)), []);
});

test("SowieProgress.linkProfile: zapis tylko po włączeniu przez grę; ukończona misja trafia do onMission", () => {
  const cloud = fakeCloud();
  const progress = createProgress({ getAcademy: () => null });
  progress.beginRun("runner", { difficulty: "arcade" });
  progress.emit(EVENTS.LIFE, {});
  assert.equal(cloud.profile().missions.extraLife.progress, 0, "bez linkProfile (np. Laboratorium) profil bez zmian");
  const done = [];
  progress.linkProfile({
    getCloud: () => cloud,
    getPlatform: () => ({ COSMETICS }),
    onMission: (item) => done.push(item),
  });
  progress.emit(EVENTS.LIFE, {});
  progress.emit(EVENTS.NEAR_MISS, { by: "pracu" });
  progress.endRun({ score: 1200, distance: 1100 });
  assert.deepEqual(
    done.map((item) => item.key),
    ["extraLife", "runner1000"],
  );
  assert.equal(done[0].rewardLabel, "Wianek");
  assert.equal(cloud.profile().missions.nearMiss3.progress, 1);
  assert.equal(cloud.profile().stats.extraLives, 1);
});
