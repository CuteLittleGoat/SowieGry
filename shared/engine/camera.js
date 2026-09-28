// Kamera: płynne podążanie za celem, granice i wstrząs (wyłączany przy ograniczeniu ruchu).

export function createCamera({ x = 0, y = 0, zoom = 1 } = {}) {
  return {
    x,
    y,
    zoom,
    shakeX: 0,
    shakeY: 0,
    trauma: 0,
    // Wykładnicze podążanie niezależne od liczby klatek.
    follow(targetX, targetY, dt, stiffness = 8) {
      const k = 1 - Math.exp(-stiffness * dt);
      this.x += (targetX - this.x) * k;
      this.y += (targetY - this.y) * k;
    },
    clamp({ minX = -Infinity, maxX = Infinity, minY = -Infinity, maxY = Infinity } = {}) {
      this.x = Math.max(minX, Math.min(maxX, this.x));
      this.y = Math.max(minY, Math.min(maxY, this.y));
    },
    shake(amount = 0.4) {
      this.trauma = Math.min(1, this.trauma + amount);
    },
    update(dt, { random = Math.random, reducedMotion = false, maxOffset = 0.35 } = {}) {
      this.trauma = Math.max(0, this.trauma - dt * 1.6);
      const magnitude = reducedMotion ? 0 : this.trauma * this.trauma * maxOffset;
      this.shakeX = (random() * 2 - 1) * magnitude;
      this.shakeY = (random() * 2 - 1) * magnitude;
    },
  };
}
