// Dodatkowe zabezpieczenie ruchomych ludzi i dzików.
// Waliduje tor docelowy przed wykonaniem ruchu nadanym przez cute-rework.js.
(() => {
  const previousUpdate = update;

  update = function updateWithMovingObstacleSafety(dt) {
    validateMovingTargets();
    previousUpdate(dt);
  };

  function validateMovingTargets() {
    if (typeof sowa3StageObstacles === "undefined") return;

    for (const moving of sowa3StageObstacles) {
      if (moving._cuteTargetLane === undefined || moving._cuteMoved) continue;

      const nearby = [];
      for (const object of objects) {
        if (!object.hit && typeof isSowa3Blocker === "function" && isSowa3Blocker(object.type) && Math.abs(object.z - moving.z) < 0.22) {
          nearby.push(object);
        }
      }
      for (const object of sowa3StageObstacles) {
        if (object !== moving && !object.hit && typeof isSowa3Blocker === "function" && isSowa3Blocker(object.type) && Math.abs(object.z - moving.z) < 0.22) {
          nearby.push(object);
        }
      }

      const targetOccupied = nearby.some((object) => Math.round(object.lane) === Math.round(moving._cuteTargetLane));
      const occupiedAfterMove = new Set(nearby.map((object) => Math.round(object.lane)));
      occupiedAfterMove.add(Math.round(moving._cuteTargetLane));

      if (targetOccupied || occupiedAfterMove.size >= 3) {
        moving._cuteTargetLane = undefined;
        moving._cuteWarning = false;
        continue;
      }

      // Ruch blisko gracza nie może zostać rozpoczęty bez odpowiednio długiego ostrzeżenia.
      if (moving.z < 0.38 && !moving._cuteWarning) {
        moving._cuteTargetLane = undefined;
        moving._cuteWarning = false;
      }
    }
  }
})();
