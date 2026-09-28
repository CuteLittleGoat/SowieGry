// Cząsteczki w stałych tablicach (bez alokacji w pętli). `density` 0–1 zmniejsza liczbę cząsteczek
// (ograniczone efekty, „Oszczędzanie baterii”).

export function createParticles({ max = 300, random = Math.random } = {}) {
  const x = new Float32Array(max);
  const y = new Float32Array(max);
  const vx = new Float32Array(max);
  const vy = new Float32Array(max);
  const life = new Float32Array(max);
  const maxLife = new Float32Array(max);
  const size = new Float32Array(max);
  const gravity = new Float32Array(max);
  const color = new Array(max).fill("#ffffff");
  let count = 0;
  let density = 1;

  return {
    emit(
      px,
      py,
      {
        count: amount = 8,
        speed = 3,
        spread = Math.PI * 2,
        angle = -Math.PI / 2,
        lifetime = 0.6,
        radius = 0.12,
        fall = 6,
        tint = "#fff6e3",
      } = {},
    ) {
      const total = Math.round(amount * density);
      let emitted = 0;
      for (let index = 0; index < total && count < max; index += 1) {
        const direction = angle + (random() - 0.5) * spread;
        const velocity = speed * (0.5 + random() * 0.5);
        x[count] = px;
        y[count] = py;
        vx[count] = Math.cos(direction) * velocity;
        vy[count] = Math.sin(direction) * velocity;
        life[count] = lifetime * (0.7 + random() * 0.3);
        maxLife[count] = life[count];
        size[count] = radius * (0.6 + random() * 0.8);
        gravity[count] = fall;
        color[count] = tint;
        count += 1;
        emitted += 1;
      }
      return emitted;
    },
    update(dt) {
      for (let index = count - 1; index >= 0; index -= 1) {
        life[index] -= dt;
        if (life[index] <= 0) {
          count -= 1;
          x[index] = x[count];
          y[index] = y[count];
          vx[index] = vx[count];
          vy[index] = vy[count];
          life[index] = life[count];
          maxLife[index] = maxLife[count];
          size[index] = size[count];
          gravity[index] = gravity[count];
          color[index] = color[count];
          continue;
        }
        vy[index] += gravity[index] * dt;
        x[index] += vx[index] * dt;
        y[index] += vy[index] * dt;
      }
    },
    // Rysowanie w jednostkach świata (kontekst z transformacją widoku).
    render(context) {
      for (let index = 0; index < count; index += 1) {
        context.globalAlpha = Math.max(0, life[index] / maxLife[index]);
        context.fillStyle = color[index];
        context.beginPath();
        context.arc(x[index], y[index], size[index], 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    },
    setDensity(value) {
      density = Math.max(0, Math.min(1, value));
    },
    clear() {
      count = 0;
    },
    count: () => count,
  };
}
