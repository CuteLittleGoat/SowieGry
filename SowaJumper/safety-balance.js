// Balans bezpieczeństwa SowaJumper.
// Gra nie ma torów, więc problemem nie jest blokada 3 pasów, tylko:
// - zbyt gwałtowne poziome przeskoki między platformami,
// - zbyt długa seria trudnych platform,
// - „Pracu Pracu” zbyt blisko kolejnych lądowań.

let jumperLastPlatformCenter = null;
let jumperHardPlatformStreak = 0;
let jumperLastPracuY = Infinity;

const originalJumperCreatePlatformForSafety = createPlatform;
const originalJumperSpawnOnPlatformForSafety = spawnOnPlatform;
const originalJumperStartGameForSafety = startGame;
const originalJumperInitTitleForSafety = initTitle;

function resetJumperSafetyState() {
  jumperLastPlatformCenter = null;
  jumperHardPlatformStreak = 0;
  jumperLastPracuY = Infinity;
}

initTitle = function balancedJumperInitTitle() {
  resetJumperSafetyState();
  originalJumperInitTitleForSafety();
};

startGame = function balancedJumperStartGame() {
  resetJumperSafetyState();
  originalJumperStartGameForSafety();
};

createPlatform = function balancedJumperCreatePlatform(y, forcedType = null) {
  const platform = originalJumperCreatePlatformForSafety(y, forcedType);

  if (!forcedType && jumperHardPlatformStreak >= 2 && (platform.type === "crumbly" || platform.type === "moving")) {
    platform.type = "normal";
    platform.touched = false;
    platform.brokenAt = 0;
    delete platform.baseX;
    delete platform.vx;
    delete platform.range;
  }

  const center = platform.x + platform.width / 2;
  if (jumperLastPlatformCenter !== null) {
    const maxStep = clamp(state.width * 0.42, 130, 238);
    const delta = center - jumperLastPlatformCenter;
    if (Math.abs(delta) > maxStep) {
      const correctedCenter = jumperLastPlatformCenter + Math.sign(delta) * maxStep;
      platform.x = clamp(correctedCenter - platform.width / 2, 24, Math.max(30, state.width - platform.width - 24));
    }
  }

  if (platform.type === "crumbly" || platform.type === "moving") jumperHardPlatformStreak += 1;
  else jumperHardPlatformStreak = 0;

  jumperLastPlatformCenter = platform.x + platform.width / 2;
  return platform;
};

spawnOnPlatform = function balancedJumperSpawnOnPlatform(platform) {
  const beforePracu = pracuTexts.length;
  originalJumperSpawnOnPlatformForSafety(platform);

  for (let i = pracuTexts.length - 1; i >= beforePracu; i -= 1) {
    const pracu = pracuTexts[i];
    const minVerticalGap = 118;
    const tooCloseToPrevious = Math.abs(pracu.y - jumperLastPracuY) < minVerticalGap;
    const tooCloseToLanding = pracu.y > platform.y - 64;

    if (tooCloseToPrevious || tooCloseToLanding) {
      pracuTexts.splice(i, 1);
      continue;
    }

    pracu.y = Math.min(pracu.y, platform.y - 76);
    pracu.x = clamp(pracu.x, 58, state.width - 58);
    jumperLastPracuY = pracu.y;
  }
};
