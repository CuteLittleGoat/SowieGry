// Kolizje: prostokąty (x, y = lewy górny róg), okręgi i pomniejszone pola kolizji (wybaczająca gra).

export function aabb(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function circles(ax, ay, ar, bx, by, br) {
  const dx = ax - bx;
  const dy = ay - by;
  const radius = ar + br;
  return dx * dx + dy * dy < radius * radius;
}

export function circleRect(cx, cy, radius, rect) {
  const nearestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
  const nearestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

// Pole kolizji pomniejszone do `factor` (domyślnie 80%) wokół środka; wynik w `out` (bez alokacji).
export function hitbox(box, factor = 0.8, out = { x: 0, y: 0, width: 0, height: 0 }) {
  out.width = box.width * factor;
  out.height = box.height * factor;
  out.x = box.x + (box.width - out.width) / 2;
  out.y = box.y + (box.height - out.height) / 2;
  return out;
}

// Lądowanie z góry: obiekt opadał i w poprzednim kroku jego spód był nad platformą.
export function landsOn(previousBottom, currentBottom, platform, left, right) {
  return (
    previousBottom <= platform.y &&
    currentBottom >= platform.y &&
    right > platform.x &&
    left < platform.x + platform.width
  );
}
