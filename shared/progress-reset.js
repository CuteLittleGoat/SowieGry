// Jednorazowy reset postępu testowego wykonany 2026-06-21.
// Zachowuje ustawienia użytkownika i wybór poziomu trudności.
(() => {
  "use strict";

  const RESET_KEY = "sowieGryProgressReset20260621";
  const PROFILE_KEY = "sowieGryProfile";

  if (localStorage.getItem(RESET_KEY) === "1") return;

  const defaultSettings = {
    music: true,
    sfx: true,
    quips: true,
    reducedEffects: false,
  };

  let preservedSettings = { ...defaultSettings };
  try {
    const previous = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    if (previous?.settings && typeof previous.settings === "object") {
      preservedSettings = { ...defaultSettings, ...previous.settings };
    }
  } catch (_error) {
    // Uszkodzony profil również zostaje zastąpiony czystym stanem.
  }

  const cleanProfile = {
    version: 1,
    unlockedCosmetics: ["none", "bow"],
    selectedCosmetic: "none",
    settings: preservedSettings,
    missions: {
      leaves20: { progress: 0, target: 20, done: false, reward: "glasses" },
      extraLife: { progress: 0, target: 1, done: false, reward: "flowerCrown" },
      nearMiss3: { progress: 0, target: 3, done: false, reward: "scarf" },
      chaosFinish: { progress: 0, target: 1, done: false, reward: "gardenerHat" },
      combo4: { progress: 0, target: 1, done: false, reward: "bubbleTrail" },
      runner1000: { progress: 0, target: 1000, done: false, reward: "cap" },
      jumper250: { progress: 0, target: 250, done: false, reward: "backpack" },
    },
    stats: {
      leaves: 0,
      nearMisses: 0,
      extraLives: 0,
      finishes: 0,
      maxCombo: 1,
      runnerDistance: 0,
      jumperHeight: 0,
    },
  };

  localStorage.setItem(PROFILE_KEY, JSON.stringify(cleanProfile));

  [
    "sowaRunnerBestScore",
    "sowaRunnerBestDistance",
    "sowaJumperBestScore",
    "sowaJumperBestHeight",
    "sowa3Best",
    "sowa3FinishSeen",
  ].forEach((key) => localStorage.removeItem(key));

  localStorage.setItem(RESET_KEY, "1");
})();
