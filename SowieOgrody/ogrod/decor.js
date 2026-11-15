// Sowie Ogrody — ozdoby rozdziałów od 7. (uwagi O3 i O7, 2026-11-01; rozdziały 15–22 — uwaga O9, 2026-11-15):
// kolory i dekoracje teł. Rysowane w render.js: `drawSceneDecor` między niebem a podłożem (podłoże od `floor` = 60%
// wysokości). Kształty roślin były tu do uwagi O10 — od niej są w plants.js.

// Tło rozdziału: [niebo u góry, niebo u dołu, podłoże].
export const NEW_SCENES = Object.freeze({
  palmiarnia: ["#e9fff4", "#c7f0dc", "#9fcf8a"],
  dzungla: ["#a8e6b8", "#5fbf7f", "#4f8a3c"],
  japonski: ["#ffe9f1", "#fbd3e0", "#b9d98a"],
  oaza: ["#ffd9a0", "#ffeccc", "#e8c27a"],
  zimowy: ["#dfeefc", "#f7fbff", "#ffffff"],
  wodny: ["#c9f1ff", "#e9fbff", "#7fcfe0"],
  dach: ["#ffb38a", "#ffe0b8", "#a9a3b8"],
  ksiezycowy: ["#141b3d", "#3b2f6a", "#2f4a5a"],
  // Rozdziały 15–22 (uwaga O9) — krainy fantazji.
  czarownica: ["#3d2a5c", "#b07ab8", "#4f5a3a"],
  nawiedzony: ["#1e2a3a", "#56657a", "#3e4a3a"],
  zaczarowany: ["#163b2e", "#3f7f5a", "#2f5a32"],
  smoczy: ["#ff8a5c", "#ffd59e", "#7a5a48"],
  grota: ["#1a1838", "#3a3270", "#2e2a4a"],
  wrozki: ["#ffd9f2", "#e6fbff", "#a6e38f"],
  podniebny: ["#7cc8ff", "#e8f6ff", "#f4fbff"],
  drzewoSwiata: ["#1d3048", "#d7c48a", "#4f6b3a"],
});

// Dekoracje: (context, szerokość, wysokość, floor, czas w s).
const DECOR = {
  // Palmiarnia: szklana kopuła (łuki i szprosy) i wysokie palmy po bokach.
  palmiarnia(context, width, height, floor, time) {
    context.strokeStyle = "rgba(255, 255, 255, 0.75)";
    context.lineWidth = 3;
    for (const radius of [0.48, 0.36]) {
      context.beginPath();
      context.ellipse(width / 2, floor, width * radius, height * (radius + 0.12), 0, Math.PI, Math.PI * 2);
      context.stroke();
    }
    for (let index = 1; index < 6; index += 1) {
      const angle = Math.PI + (index * Math.PI) / 6;
      context.beginPath();
      context.moveTo(width / 2, floor);
      context.lineTo(width / 2 + Math.cos(angle) * width * 0.48, floor + Math.sin(angle) * height * 0.6);
      context.stroke();
    }
    context.fillStyle = "rgba(63, 139, 91, 0.35)";
    for (const fx of [0.08, 0.92]) {
      const x = width * fx;
      context.fillRect(x - 3, floor - height * 0.45, 6, height * 0.45);
      for (let index = 0; index < 6; index += 1) {
        const angle = -Math.PI / 2 + (index - 2.5) * 0.5 + Math.sin(time + index) * 0.04;
        context.save();
        context.translate(x, floor - height * 0.45);
        context.rotate(angle + Math.PI / 2);
        context.beginPath();
        context.ellipse(0, -height * 0.12, 6, height * 0.12, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
    }
  },

  // Dżungla: zwisające liany z listkami, wodospad w tle i wielkie liście przy ziemi.
  dzungla(context, width, height, floor, time) {
    context.fillStyle = "rgba(255, 255, 255, 0.45)";
    context.fillRect(width * 0.7, height * 0.05, width * 0.08, floor - height * 0.05);
    context.fillStyle = "rgba(255, 255, 255, 0.7)";
    for (let drop = 0; drop < 6; drop += 1) {
      const y = height * 0.05 + ((time * 80 + drop * 37) % (floor - height * 0.05));
      context.fillRect(width * 0.7 + (drop % 3) * width * 0.025, y, 3, 10);
    }
    context.strokeStyle = "rgba(47, 110, 60, 0.6)";
    context.lineWidth = 3;
    context.fillStyle = "rgba(63, 174, 106, 0.6)";
    for (const fx of [0.06, 0.22, 0.5, 0.88]) {
      const x = width * fx;
      const length = height * (0.25 + ((fx * 7) % 0.2));
      context.beginPath();
      context.moveTo(x, 0);
      context.quadraticCurveTo(x + Math.sin(time * 0.8 + fx * 9) * 8, length / 2, x, length);
      context.stroke();
      for (let leaf = 1; leaf <= 3; leaf += 1) {
        context.beginPath();
        context.ellipse(x + (leaf % 2 ? 6 : -6), (length * leaf) / 3.4, 6, 3, leaf % 2 ? 0.5 : -0.5, 0, Math.PI * 2);
        context.fill();
      }
    }
  },

  // Ogród japoński: łukowaty czerwony mostek nad stawem z karpiami i kamienna latarnia.
  japonski(context, width, height, floor, time) {
    context.fillStyle = "rgba(92, 200, 232, 0.6)";
    context.beginPath();
    context.ellipse(width * 0.72, floor - 4, width * 0.22, 12, 0, 0, Math.PI * 2);
    context.fill();
    for (let fish = 0; fish < 2; fish += 1) {
      const angle = time * 0.6 + fish * Math.PI;
      context.fillStyle = fish ? "#ff9d4d" : "#ffffff";
      context.beginPath();
      context.ellipse(
        width * 0.72 + Math.cos(angle) * width * 0.12,
        floor - 4 + Math.sin(angle) * 5,
        6,
        3,
        angle + Math.PI / 2,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
    context.strokeStyle = "#d9433f";
    context.lineWidth = 5;
    context.beginPath();
    context.arc(width * 0.72, floor + height * 0.08, width * 0.18, Math.PI * 1.15, Math.PI * 1.85);
    context.stroke();
    context.fillStyle = "rgba(125, 117, 144, 0.7)";
    const lx = width * 0.14;
    context.fillRect(lx - 4, floor - height * 0.22, 8, height * 0.22);
    context.fillRect(lx - 12, floor - height * 0.27, 24, 6);
    context.fillStyle = "#ffe9a8";
    context.fillRect(lx - 6, floor - height * 0.24, 12, 8);
  },

  // Pustynna oaza: wydmy, słońce i mały staw z trzciną.
  oaza(context, width, height, floor, time) {
    context.fillStyle = "rgba(244, 197, 66, 0.8)";
    context.beginPath();
    context.arc(width * 0.82, height * 0.18, 18 + Math.sin(time) * 1.5, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "rgba(232, 194, 122, 0.85)";
    for (const [fx, fw, fh] of [
      [0.2, 0.35, 0.12],
      [0.65, 0.45, 0.16],
    ]) {
      context.beginPath();
      context.ellipse(width * fx, floor, width * fw, height * fh, 0, Math.PI, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = "rgba(92, 200, 232, 0.75)";
    context.beginPath();
    context.ellipse(width * 0.5, floor - 3, width * 0.12, 7, 0, 0, Math.PI * 2);
    context.fill();
  },

  // Ogród zimowy: płatki śniegu, szron na szybie i zaśnieżone krzaczki.
  zimowy(context, width, height, floor, time) {
    context.fillStyle = "rgba(255, 255, 255, 0.85)";
    for (let flake = 0; flake < 24; flake += 1) {
      const x = ((flake * 53.7) % width) + Math.sin(time + flake) * 6;
      const y = (time * 25 + flake * 41) % floor;
      context.beginPath();
      context.arc(x, y, 2 + (flake % 3), 0, Math.PI * 2);
      context.fill();
    }
    context.strokeStyle = "rgba(160, 200, 230, 0.6)";
    context.lineWidth = 2;
    for (const [fx, fy] of [
      [0.1, 0.12],
      [0.9, 0.2],
    ]) {
      for (let arm = 0; arm < 6; arm += 1) {
        const angle = (arm * Math.PI) / 3;
        context.beginPath();
        context.moveTo(width * fx, height * fy);
        context.lineTo(width * fx + Math.cos(angle) * 14, height * fy + Math.sin(angle) * 14);
        context.stroke();
      }
    }
  },

  // Wodny ogród: tafla jeziora z falami, trzciny i liście grzybieni.
  wodny(context, width, height, floor, time) {
    context.fillStyle = "rgba(92, 200, 232, 0.5)";
    context.fillRect(0, floor - height * 0.12, width, height * 0.12);
    context.strokeStyle = "rgba(255, 255, 255, 0.6)";
    context.lineWidth = 2;
    for (let wave = 0; wave < 3; wave += 1) {
      context.beginPath();
      for (let x = 0; x <= width; x += 12) {
        const y = floor - height * (0.03 + wave * 0.035) + Math.sin(x / 25 + time * 1.5 + wave) * 2;
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    }
    context.strokeStyle = "rgba(90, 120, 60, 0.7)";
    context.lineWidth = 3;
    for (const fx of [0.05, 0.08, 0.93, 0.96]) {
      context.beginPath();
      context.moveTo(width * fx, floor);
      context.lineTo(width * fx + Math.sin(time + fx * 10) * 3, floor - height * 0.3);
      context.stroke();
    }
  },

  // Ogród na dachu: panorama miasta o zachodzie słońca (okna się świecą) i balustrada dachu.
  dach(context, width, height, floor) {
    context.fillStyle = "rgba(90, 80, 120, 0.45)";
    let x = 0;
    let index = 0;
    while (x < width) {
      const w = width * (0.08 + ((index * 37) % 7) * 0.012);
      const h = height * (0.18 + ((index * 53) % 9) * 0.025);
      context.fillRect(x, floor - h, w - 3, h);
      context.fillStyle = "rgba(255, 233, 168, 0.8)";
      for (let wy = floor - h + 6; wy < floor - 8; wy += 10) {
        if ((index + wy) % 3) context.fillRect(x + 4, wy, 4, 4);
      }
      context.fillStyle = "rgba(90, 80, 120, 0.45)";
      x += w;
      index += 1;
    }
    context.fillStyle = "rgba(59, 47, 74, 0.5)";
    context.fillRect(0, floor - height * 0.06, width, 3);
    for (let post = 6; post < width; post += 22) context.fillRect(post, floor - height * 0.06, 3, height * 0.06);
  },

  // Księżycowy ogród: księżyc z poświatą, gwiazdy i świetliki.
  ksiezycowy(context, width, height, floor, time) {
    const glow = context.createRadialGradient(width * 0.8, height * 0.2, 0, width * 0.8, height * 0.2, 60);
    glow.addColorStop(0, "rgba(233, 255, 216, 0.6)");
    glow.addColorStop(1, "rgba(233, 255, 216, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, floor);
    context.fillStyle = "#f4f2ff";
    context.beginPath();
    context.arc(width * 0.8, height * 0.2, 18, 0, Math.PI * 2);
    context.fill();
    for (let star = 0; star < 20; star += 1) {
      context.globalAlpha = 0.4 + 0.5 * (0.5 + 0.5 * Math.sin(time * 2 + star));
      context.fillRect((star * 71.3) % width, (star * 37.1) % (floor * 0.8), 2, 2);
    }
    context.fillStyle = "#e7ff8a";
    for (let fly = 0; fly < 8; fly += 1) {
      context.globalAlpha = 0.5 + 0.5 * Math.sin(time * 4 + fly * 2);
      const fx = (fly * 97.7 + Math.sin(time * 0.7 + fly) * 20) % width;
      const fy = floor - 10 - ((fly * 23) % (height * 0.3)) + Math.cos(time + fly) * 6;
      context.beginPath();
      context.arc(fx, fy, 2.5, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  },

  // ---------- Rozdziały 15–22 (uwaga O9) ----------

  // Ogród czarownicy: sierp księżyca i gwiazdy na fioletowym niebie, krzywa chatka ze świecącym okienkiem i dymem
  // z komina, miotła i bulgoczący zielony kocioł na ogniu.
  czarownica(context, width, height, floor, time) {
    stars(context, width, floor * 0.7, 14, time);
    context.fillStyle = "#fff6d6";
    circle(context, width * 0.16, height * 0.16, 14);
    context.fillStyle = "#3d2a5c";
    circle(context, width * 0.16 + 6, height * 0.16 - 4, 12);
    // Chatka: krzywe ściany, spiczasty dach, okno z poświatą, komin z dymem.
    const hx = width * 0.8;
    const hw = Math.min(90, width * 0.2);
    const hh = height * 0.2;
    context.fillStyle = "rgba(43, 30, 60, 0.9)";
    polygon(context, [
      [hx - hw / 2, floor],
      [hx - hw / 2 + 4, floor - hh],
      [hx + hw / 2 - 2, floor - hh - 4],
      [hx + hw / 2, floor],
    ]);
    polygon(context, [
      [hx - hw * 0.62, floor - hh + 2],
      [hx + hw * 0.08, floor - hh * 2.1],
      [hx + hw * 0.64, floor - hh - 6],
    ]);
    context.fillRect(hx + hw * 0.18, floor - hh * 1.75, 9, hh * 0.6);
    const light = 0.75 + 0.25 * Math.sin(time * 3);
    const windowGlow = context.createRadialGradient(
      hx - hw * 0.04,
      floor - hh * 0.56,
      0,
      hx - hw * 0.04,
      floor - hh * 0.56,
      hh * 0.6,
    );
    windowGlow.addColorStop(0, `rgba(255, 215, 106, ${0.5 * light})`);
    windowGlow.addColorStop(1, "rgba(255, 215, 106, 0)");
    context.fillStyle = windowGlow;
    circle(context, hx - hw * 0.04, floor - hh * 0.56, hh * 0.6);
    context.fillStyle = "#ffd76a";
    context.fillRect(hx - hw * 0.15, floor - hh * 0.72, hw * 0.22, hh * 0.32);
    context.fillStyle = "rgba(43, 30, 60, 0.9)";
    context.fillRect(hx - hw * 0.05, floor - hh * 0.72, 2, hh * 0.32);
    context.fillRect(hx - hw * 0.15, floor - hh * 0.57, hw * 0.22, 2);
    for (let puff = 0; puff < 4; puff += 1) {
      const rise = (time * 12 + puff * 14) % 56;
      context.fillStyle = `rgba(220, 210, 235, ${0.5 * (1 - rise / 56)})`;
      circle(context, hx + hw * 0.18 + 4 + Math.sin(time + puff) * 4, floor - hh * 1.8 - rise, 4 + rise * 0.12);
    }
    // Miotła oparta o chatkę.
    context.strokeStyle = "#8b5a2b";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(hx - hw / 2 - 2, floor - hh * 0.9);
    context.lineTo(hx - hw / 2 - 12, floor - 2);
    context.stroke();
    context.fillStyle = "#e0b45a";
    polygon(context, [
      [hx - hw / 2 - 10, floor - 8],
      [hx - hw / 2 - 18, floor],
      [hx - hw / 2 - 6, floor],
    ]);
    // Kocioł: ogień pod spodem, zielony wywar, bąbelki i para.
    const kx = width * 0.2;
    const kr = Math.min(22, width * 0.06);
    for (let flame = 0; flame < 3; flame += 1) {
      const flicker = 0.8 + 0.2 * Math.sin(time * 12 + flame * 2);
      context.fillStyle = flame === 1 ? "#ffd23f" : "#ff7a1a";
      ellipse(context, kx + (flame - 1) * kr * 0.45, floor - kr * 0.25, kr * 0.2, kr * 0.42 * flicker);
    }
    context.fillStyle = "#2b2233";
    context.beginPath();
    context.ellipse(kx, floor - kr * 0.85, kr, kr * 0.85, 0, 0, Math.PI);
    context.fill();
    context.fillStyle = "#3b3245";
    ellipse(context, kx, floor - kr * 0.85, kr * 1.08, kr * 0.22);
    context.fillStyle = "#7dff6a";
    ellipse(context, kx, floor - kr * 0.87, kr * 0.9, kr * 0.16);
    for (let bubble = 0; bubble < 5; bubble += 1) {
      const rise = (time * 16 + bubble * 9) % 40;
      context.fillStyle = `rgba(125, 255, 106, ${0.8 * (1 - rise / 40)})`;
      circle(context, kx + Math.sin(time * 2 + bubble * 1.7) * kr * 0.5, floor - kr - rise, 2 + (bubble % 3));
    }
  },

  // Nawiedzony ogród: pełnia za chmurami, krzywe nagie drzewo, płotek z kutych prętów, nagrobki, mgła przy ziemi,
  // dwa przyjazne duszki i nietoperze.
  nawiedzony(context, width, height, floor, time) {
    const moonX = width * 0.78;
    const moonY = height * 0.18;
    const glow = context.createRadialGradient(moonX, moonY, 0, moonX, moonY, 60);
    glow.addColorStop(0, "rgba(244, 242, 230, 0.45)");
    glow.addColorStop(1, "rgba(244, 242, 230, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, floor);
    context.fillStyle = "#f4f2e6";
    circle(context, moonX, moonY, 20);
    context.fillStyle = "rgba(200, 200, 190, 0.5)";
    circle(context, moonX - 6, moonY - 4, 4);
    circle(context, moonX + 5, moonY + 6, 3);
    context.fillStyle = "rgba(60, 72, 90, 0.75)";
    for (let cloud = 0; cloud < 2; cloud += 1) {
      const cx = ((time * 8 + cloud * width * 0.6) % (width + 120)) - 60;
      ellipse(context, cx, height * (0.12 + cloud * 0.1), 34, 9);
      ellipse(context, cx + 18, height * (0.12 + cloud * 0.1) - 5, 18, 8);
    }
    // Nagie, krzywe drzewo z lewej.
    context.strokeStyle = "rgba(20, 22, 32, 0.8)";
    context.lineCap = "round";
    const tx = width * 0.1;
    for (const [x0, y0, x1, y1, w] of [
      [tx, floor, tx + 6, floor - height * 0.32, 7],
      [tx + 6, floor - height * 0.32, tx + 30, floor - height * 0.45, 4],
      [tx + 5, floor - height * 0.24, tx - 18, floor - height * 0.4, 4],
      [tx + 22, floor - height * 0.41, tx + 38, floor - height * 0.38, 2],
      [tx - 12, floor - height * 0.36, tx - 16, floor - height * 0.47, 2],
    ]) {
      context.lineWidth = w;
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.stroke();
    }
    // Płotek z prętami zakończonymi grotami.
    context.fillStyle = "rgba(20, 22, 32, 0.55)";
    context.fillRect(0, floor - height * 0.09, width, 2);
    for (let post = 8; post < width; post += 16) {
      context.fillRect(post - 1, floor - height * 0.13, 2, height * 0.13);
      polygon(context, [
        [post - 3, floor - height * 0.13],
        [post, floor - height * 0.13 - 5],
        [post + 3, floor - height * 0.13],
      ]);
    }
    // Nagrobki (zaokrąglone, z rysą) — z dala od środka, gdzie stoi sowa.
    for (const [fx, size] of [
      [0.28, 1],
      [0.7, 0.85],
      [0.88, 1.1],
    ]) {
      const gx = width * fx;
      const gw = 16 * size;
      const gh = 22 * size;
      context.fillStyle = "#8a8f9a";
      context.beginPath();
      context.roundRect(gx - gw / 2, floor - gh, gw, gh, [gw / 2, gw / 2, 2, 2]);
      context.fill();
      context.strokeStyle = "rgba(40, 44, 56, 0.6)";
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(gx - 3 * size, floor - gh * 0.7);
      context.lineTo(gx + 3 * size, floor - gh * 0.7);
      context.moveTo(gx, floor - gh * 0.82);
      context.lineTo(gx, floor - gh * 0.5);
      context.stroke();
    }
    // Duszki: białe, półprzezroczyste, z falbanką u dołu; unoszą się i powoli przelatują.
    for (let ghost = 0; ghost < 2; ghost += 1) {
      const span = width + 80;
      const gx = ((((time * 14 * (ghost ? -1 : 1) + ghost * span * 0.5) % span) + span) % span) - 40;
      const gy = height * (0.3 + ghost * 0.12) + Math.sin(time * 2 + ghost * 3) * 6;
      context.fillStyle = "rgba(255, 255, 255, 0.7)";
      context.beginPath();
      context.arc(gx, gy, 10, Math.PI, 0);
      context.lineTo(gx + 10, gy + 12);
      for (let wave = 0; wave < 4; wave += 1) {
        context.lineTo(gx + 10 - (wave + 0.5) * 5, gy + 9 + ((wave + Math.floor(time * 4)) % 2) * 3);
        context.lineTo(gx + 10 - (wave + 1) * 5, gy + 12);
      }
      context.closePath();
      context.fill();
      context.fillStyle = "#2b2233";
      circle(context, gx - 3.5, gy - 1, 1.6);
      circle(context, gx + 3.5, gy - 1, 1.6);
    }
    bats(context, width, height, time);
    // Mgła przy ziemi.
    context.fillStyle = "rgba(220, 228, 236, 0.18)";
    for (let wisp = 0; wisp < 4; wisp += 1) {
      const wx = ((time * 10 + wisp * width * 0.33) % (width + 160)) - 80;
      ellipse(context, wx, floor - 4, 70, 9);
    }
  },

  // Zaczarowany las: ciemne pnie w tle, smugi światła, świetliki i strumyk z płynącymi wiankami ze świeczkami (noc
  // Kupały — wtedy kwitnie kwiat paproci).
  zaczarowany(context, width, height, floor, time) {
    context.fillStyle = "rgba(255, 255, 210, 0.07)";
    for (const fx of [0.25, 0.55, 0.8]) {
      polygon(context, [
        [width * fx, 0],
        [width * fx + 28, 0],
        [width * fx - 30, floor],
        [width * fx - 70, floor],
      ]);
    }
    for (const [fx, w, crown] of [
      [0.06, 14, 30],
      [0.24, 10, 24],
      [0.68, 12, 28],
      [0.92, 16, 34],
    ]) {
      context.fillStyle = "rgba(8, 28, 20, 0.55)";
      context.fillRect(width * fx - w / 2, floor * 0.18, w, floor * 0.82);
      context.fillStyle = "rgba(12, 46, 30, 0.6)";
      circle(context, width * fx, floor * 0.18, crown);
      circle(context, width * fx - crown * 0.7, floor * 0.24, crown * 0.7);
      circle(context, width * fx + crown * 0.7, floor * 0.22, crown * 0.75);
    }
    fireflies(context, width, floor, 12, time, "#e7ff8a");
    // Strumyk i wianki.
    const sy = floor - 6;
    context.fillStyle = "rgba(92, 160, 200, 0.55)";
    context.fillRect(0, sy - 5, width, 9);
    context.strokeStyle = "rgba(255, 255, 255, 0.35)";
    context.lineWidth = 1;
    context.beginPath();
    for (let x = 0; x <= width; x += 10) context.lineTo(x, sy - 2 + Math.sin(x / 18 + time * 2) * 1.2);
    context.stroke();
    for (let wreath = 0; wreath < 2; wreath += 1) {
      const span = width + 60;
      const wx = ((time * 10 + wreath * span * 0.55) % span) - 30;
      context.strokeStyle = "#4f8a3c";
      context.lineWidth = 3;
      context.beginPath();
      context.ellipse(wx, sy, 9, 3, 0, 0, Math.PI * 2);
      context.stroke();
      for (let flower = 0; flower < 5; flower += 1) {
        const angle = (flower / 5) * Math.PI * 2;
        context.fillStyle = ["#ff6b6b", "#ffd43b", "#ffffff", "#9775fa", "#ff9fb2"][flower];
        circle(context, wx + Math.cos(angle) * 9, sy + Math.sin(angle) * 3, 1.6);
      }
      context.fillStyle = "#fffaf2";
      context.fillRect(wx - 1, sy - 7, 2, 6);
      context.fillStyle = `rgba(255, 210, 74, ${0.7 + 0.3 * Math.sin(time * 10 + wreath)})`;
      ellipse(context, wx, sy - 9, 1.6, 2.6);
    }
  },

  // Smocza dolina: skaliste góry, dymiący wulkan z lawą, łuna przy horyzoncie i mały zielony smok przelatujący
  // przez niebo (macha skrzydłami).
  smoczy(context, width, height, floor, time) {
    context.fillStyle = "rgba(110, 70, 80, 0.45)";
    polygon(context, [
      [0, floor],
      [width * 0.12, floor - height * 0.28],
      [width * 0.26, floor - height * 0.16],
      [width * 0.4, floor - height * 0.34],
      [width * 0.56, floor - height * 0.2],
      [width * 0.66, floor],
    ]);
    const vx = width * 0.8;
    context.fillStyle = "rgba(90, 55, 60, 0.75)";
    polygon(context, [
      [vx - width * 0.2, floor],
      [vx - width * 0.05, floor - height * 0.36],
      [vx + width * 0.05, floor - height * 0.36],
      [vx + width * 0.2, floor],
    ]);
    const pulse = 0.7 + 0.3 * Math.sin(time * 2.5);
    const crater = context.createRadialGradient(vx, floor - height * 0.36, 0, vx, floor - height * 0.36, 40);
    crater.addColorStop(0, `rgba(255, 140, 40, ${0.8 * pulse})`);
    crater.addColorStop(1, "rgba(255, 140, 40, 0)");
    context.fillStyle = crater;
    circle(context, vx, floor - height * 0.36, 40);
    context.strokeStyle = "rgba(255, 120, 30, 0.85)";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(vx - 4, floor - height * 0.35);
    context.quadraticCurveTo(vx - 12, floor - height * 0.2, vx - 24, floor - height * 0.05);
    context.moveTo(vx + 6, floor - height * 0.35);
    context.quadraticCurveTo(vx + 10, floor - height * 0.18, vx + 22, floor - height * 0.08);
    context.stroke();
    for (let puff = 0; puff < 4; puff += 1) {
      const rise = (time * 10 + puff * 16) % 64;
      context.fillStyle = `rgba(120, 100, 110, ${0.45 * (1 - rise / 64)})`;
      circle(context, vx + Math.sin(time * 0.8 + puff) * 8, floor - height * 0.4 - rise, 7 + rise * 0.25);
    }
    const horizon = context.createLinearGradient(0, floor - 24, 0, floor);
    horizon.addColorStop(0, "rgba(255, 120, 40, 0)");
    horizon.addColorStop(1, "rgba(255, 120, 40, 0.35)");
    context.fillStyle = horizon;
    context.fillRect(0, floor - 24, width, 24);
    // Smok: leci w kółko z lewej na prawą, macha skrzydłami.
    const span = width + 120;
    const dx = ((time * 30) % span) - 60;
    const dy = height * 0.16 + Math.sin(time * 1.5) * 8;
    const flap = Math.sin(time * 8);
    context.fillStyle = "#4f9a5a";
    polygon(context, [
      [dx - 6, dy - 1],
      [dx - 14, dy - 14 * flap - 4],
      [dx + 4, dy - 2],
    ]);
    context.strokeStyle = "#4f9a5a";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(dx - 10, dy + 1);
    context.quadraticCurveTo(dx - 22, dy + 6, dx - 26, dy - 2);
    context.stroke();
    ellipse(context, dx, dy, 11, 5);
    ellipse(context, dx + 12, dy - 5, 5, 4);
    context.fillStyle = "#3f7f4a";
    polygon(context, [
      [dx - 2, dy - 1],
      [dx - 8, dy - 16 * flap - 6],
      [dx + 8, dy - 2],
    ]);
    context.fillStyle = "#ffd23f";
    circle(context, dx + 14, dy - 6, 1.2);
    context.fillStyle = "#ff7a1a";
    for (let spark = 0; spark < 3; spark += 1) {
      circle(context, dx + 19 + spark * 4, dy - 4 + Math.sin(time * 10 + spark) * 1.5, 1.6 - spark * 0.4);
    }
  },

  // Kryształowa grota: ciemne ściany jaskini, stalaktyty z kapiącymi kroplami i pulsujące, świecące kryształy.
  grota(context, width, height, floor, time) {
    context.fillStyle = "rgba(14, 12, 34, 0.75)";
    polygon(context, [
      [0, 0],
      [width * 0.14, 0],
      [width * 0.08, floor * 0.4],
      [width * 0.12, floor * 0.75],
      [width * 0.04, floor],
      [0, floor],
    ]);
    polygon(context, [
      [width, 0],
      [width * 0.86, 0],
      [width * 0.92, floor * 0.35],
      [width * 0.87, floor * 0.7],
      [width * 0.95, floor],
      [width, floor],
    ]);
    context.fillStyle = "rgba(70, 60, 120, 0.9)";
    const tips = [];
    for (let index = 0; index < 9; index += 1) {
      const sx = width * (0.06 + index * 0.11);
      const length = height * (0.06 + ((index * 37) % 5) * 0.025);
      polygon(context, [
        [sx - 7, 0],
        [sx + 7, 0],
        [sx, length],
      ]);
      tips.push([sx, length]);
    }
    context.fillStyle = "rgba(150, 220, 255, 0.85)";
    for (const [index, [sx, length]] of tips.entries()) {
      if (index % 3) continue;
      const fall = (time * 60 + index * 23) % (floor - length);
      ellipse(context, sx, length + fall, 1.3, 2.4);
    }
    for (const [fx, base, size] of [
      [0.12, floor, 1],
      [0.88, floor, 1.15],
      [0.32, floor, 0.6],
      [0.67, floor, 0.7],
    ]) {
      crystals(context, width * fx, base, 26 * size, time, fx);
    }
    for (let index = 0; index < 8; index += 1) {
      const twinkle = 0.5 + 0.5 * Math.sin(time * 3 + index * 1.9);
      context.fillStyle = `rgba(220, 240, 255, ${0.25 + 0.6 * twinkle})`;
      circle(context, (index * 83.7) % width, (index * 41.3) % (floor * 0.85), 1.2 + twinkle);
    }
  },

  // Łąka wróżek: tęcza, puszyste chmurki, kwiatki na łące i wróżki — świecące kropki z przezroczystymi skrzydełkami.
  wrozki(context, width, height, floor, time) {
    const colors = ["#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c", "#4dabf7", "#9775fa"];
    context.lineWidth = 6;
    for (const [index, color] of colors.entries()) {
      context.strokeStyle = color;
      context.globalAlpha = 0.35;
      context.beginPath();
      context.arc(width * 0.5, floor + 10, width * 0.42 - index * 6, Math.PI, Math.PI * 2);
      context.stroke();
    }
    context.globalAlpha = 1;
    context.fillStyle = "rgba(255, 255, 255, 0.9)";
    for (const [fx, fy] of [
      [0.18, 0.14],
      [0.8, 0.22],
    ]) {
      const cx = width * fx + Math.sin(time * 0.3 + fx * 10) * 6;
      ellipse(context, cx, height * fy, 22, 8);
      circle(context, cx - 8, height * fy - 5, 8);
      circle(context, cx + 6, height * fy - 7, 10);
    }
    for (let index = 0; index < 14; index += 1) {
      const fx = (index * 61.7) % width;
      const fy = floor - 3 - (index % 3) * 2;
      context.fillStyle = colors[index % colors.length];
      for (let petal = 0; petal < 5; petal += 1) {
        const angle = (petal / 5) * Math.PI * 2;
        circle(context, fx + Math.cos(angle) * 2.2, fy + Math.sin(angle) * 2.2, 1.6);
      }
      context.fillStyle = "#fff6c2";
      circle(context, fx, fy, 1.2);
    }
    for (let fairy = 0; fairy < 4; fairy += 1) {
      const fx = width * (0.15 + fairy * 0.23) + Math.sin(time * 0.9 + fairy * 1.7) * 30;
      const fy = height * (0.25 + (fairy % 2) * 0.15) + Math.cos(time * 1.3 + fairy) * 14;
      const flap = Math.abs(Math.sin(time * 14 + fairy));
      const glow = context.createRadialGradient(fx, fy, 0, fx, fy, 12);
      glow.addColorStop(0, "rgba(255, 246, 194, 0.8)");
      glow.addColorStop(1, "rgba(255, 246, 194, 0)");
      context.fillStyle = glow;
      circle(context, fx, fy, 12);
      context.fillStyle = "rgba(200, 235, 255, 0.75)";
      ellipse(context, fx - 3, fy - 2, 3.5 * flap + 0.8, 2.2, -0.6);
      ellipse(context, fx + 3, fy - 2, 3.5 * flap + 0.8, 2.2, 0.6);
      context.fillStyle = "#fffbe0";
      circle(context, fx, fy, 2);
    }
  },

  // Podniebny ogród: słońce z promieniami, latające wyspy z wodospadami, chmury i ptaki, a ogród stoi na chmurze
  // (puszysty brzeg nad podłożem).
  podniebny(context, width, height, floor, time) {
    const sunX = width * 0.85;
    const sunY = height * 0.14;
    context.strokeStyle = "rgba(255, 236, 150, 0.6)";
    context.lineWidth = 3;
    for (let ray = 0; ray < 10; ray += 1) {
      const angle = (ray / 10) * Math.PI * 2 + time * 0.2;
      context.beginPath();
      context.moveTo(sunX + Math.cos(angle) * 22, sunY + Math.sin(angle) * 22);
      context.lineTo(sunX + Math.cos(angle) * 32, sunY + Math.sin(angle) * 32);
      context.stroke();
    }
    context.fillStyle = "#ffe27a";
    circle(context, sunX, sunY, 17);
    for (const [fx, fy, size] of [
      [0.14, 0.24, 1],
      [0.62, 0.16, 0.7],
      [0.38, 0.38, 0.55],
    ]) {
      const ix = width * fx;
      const iy = height * fy + Math.sin(time * 0.8 + fx * 7) * 4;
      const iw = 34 * size;
      context.fillStyle = "#9a7b55";
      polygon(context, [
        [ix - iw, iy],
        [ix + iw, iy],
        [ix + iw * 0.2, iy + iw * 0.9],
        [ix - iw * 0.3, iy + iw * 0.7],
      ]);
      context.fillStyle = "#7fbf62";
      ellipse(context, ix, iy, iw * 1.05, iw * 0.22);
      context.fillStyle = "#3f8b5b";
      circle(context, ix - iw * 0.4, iy - iw * 0.3, iw * 0.28);
      circle(context, ix + iw * 0.3, iy - iw * 0.22, iw * 0.2);
      context.strokeStyle = "rgba(160, 220, 255, 0.8)";
      context.lineWidth = 2 * size + 1;
      context.beginPath();
      context.moveTo(ix + iw * 0.7, iy + 2);
      context.lineTo(ix + iw * 0.7, iy + iw * 1.3);
      context.stroke();
      context.fillStyle = "rgba(255, 255, 255, 0.6)";
      for (let drop = 0; drop < 3; drop += 1) {
        const fall = (time * 30 + drop * 9) % (iw * 1.4);
        circle(context, ix + iw * 0.7, iy + fall, 1.2);
      }
    }
    context.fillStyle = "rgba(255, 255, 255, 0.75)";
    for (let cloud = 0; cloud < 3; cloud += 1) {
      const span = width + 120;
      const cx = ((time * (6 + cloud * 3) + cloud * span * 0.37) % span) - 60;
      const cy = height * (0.08 + cloud * 0.14);
      ellipse(context, cx, cy, 26, 7);
      circle(context, cx + 8, cy - 5, 8);
    }
    context.strokeStyle = "rgba(59, 47, 74, 0.55)";
    context.lineWidth = 1.5;
    for (let bird = 0; bird < 3; bird += 1) {
      const span = width + 60;
      const bx = ((time * 22 + bird * 40) % span) - 30;
      const by = height * 0.3 + bird * 9 + Math.sin(time * 2 + bird) * 3;
      const flap = Math.sin(time * 9 + bird) * 3;
      context.beginPath();
      context.moveTo(bx - 5, by - flap);
      context.lineTo(bx, by);
      context.lineTo(bx + 5, by - flap);
      context.stroke();
    }
    // Puszysty brzeg chmury, na której stoi ogród.
    context.fillStyle = "#f4fbff";
    for (let puff = 0; puff * 22 < width + 22; puff += 1) circle(context, puff * 22, floor + 2, 14 + (puff % 3) * 3);
    context.fillStyle = "rgba(160, 200, 230, 0.35)";
    context.fillRect(0, floor - 2, width, 2);
  },

  // Drzewo świata: ogromny pień w tle z korzeniami wzdłuż ziemi, korona z jasnymi plamkami przy górnej krawędzi,
  // spadające złote liście, unoszące się świetliste duszki i gwiazdy.
  drzewoSwiata(context, width, height, floor, time) {
    stars(context, width, floor * 0.5, 10, time);
    context.fillStyle = "rgba(60, 44, 32, 0.6)";
    polygon(context, [
      [width * 0.4, floor],
      [width * 0.44, floor * 0.1],
      [width * 0.56, floor * 0.1],
      [width * 0.6, floor],
    ]);
    context.strokeStyle = "rgba(60, 44, 32, 0.6)";
    context.lineCap = "round";
    for (const side of [-1, 1]) {
      context.lineWidth = 10;
      context.beginPath();
      context.moveTo(width * 0.5 + side * width * 0.05, floor * 0.2);
      context.quadraticCurveTo(
        width * 0.5 + side * width * 0.25,
        floor * 0.05,
        width * 0.5 + side * width * 0.45,
        floor * 0.1,
      );
      context.stroke();
      context.lineWidth = 7;
      context.beginPath();
      context.moveTo(width * 0.5 + side * width * 0.08, floor);
      context.quadraticCurveTo(width * 0.5 + side * width * 0.2, floor - 18, width * 0.5 + side * width * 0.38, floor);
      context.stroke();
    }
    context.fillStyle = "rgba(40, 80, 50, 0.7)";
    for (let crown = 0; crown < 7; crown += 1) {
      circle(context, width * (crown / 6), -6 + (crown % 2) * 8, 44);
    }
    for (let spot = 0; spot < 12; spot += 1) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 2 + spot * 1.3);
      context.fillStyle = `rgba(200, 255, 170, ${0.25 + 0.35 * pulse})`;
      circle(context, (spot * 67.3) % width, 8 + ((spot * 29) % 30), 2 + pulse * 1.5);
    }
    context.fillStyle = "#e8c35a";
    for (let leaf = 0; leaf < 6; leaf += 1) {
      const fall = (time * 18 + leaf * 37) % floor;
      const lx = (leaf * 97.3 + Math.sin(time + leaf) * 12) % width;
      ellipse(context, lx, 30 + fall * 0.9, 3, 1.6, time * 2 + leaf);
    }
    for (let orb = 0; orb < 6; orb += 1) {
      const rise = (time * 12 + orb * 31) % floor;
      const alpha = Math.sin((rise / floor) * Math.PI);
      const ox = width * (0.15 + orb * 0.14) + Math.sin(time + orb * 2) * 10;
      const glow = context.createRadialGradient(ox, floor - rise, 0, ox, floor - rise, 8);
      glow.addColorStop(0, `rgba(246, 255, 224, ${0.8 * alpha})`);
      glow.addColorStop(1, "rgba(246, 255, 224, 0)");
      context.fillStyle = glow;
      circle(context, ox, floor - rise, 8);
    }
  },
};

// ---------- Pomocnicze (tła rozdziałów 15–22) ----------

function circle(context, x, y, radius) {
  context.beginPath();
  context.arc(x, y, Math.max(0.5, radius), 0, Math.PI * 2);
  context.fill();
}

function ellipse(context, x, y, rx, ry, angle = 0) {
  context.beginPath();
  context.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), angle, 0, Math.PI * 2);
  context.fill();
}

function polygon(context, points) {
  context.beginPath();
  context.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index += 1) context.lineTo(points[index][0], points[index][1]);
  context.closePath();
  context.fill();
}

// Migoczące gwiazdy w górnej części nieba (do `bottom`).
function stars(context, width, bottom, count, time) {
  for (let star = 0; star < count; star += 1) {
    const twinkle = 0.4 + 0.5 * (0.5 + 0.5 * Math.sin(time * 2 + star * 1.7));
    context.fillStyle = `rgba(255, 250, 230, ${twinkle})`;
    context.fillRect((star * 71.3 + 13) % width, (star * 37.1) % bottom, 2, 2);
  }
}

// Świetliki: pulsujące kropki krążące nad podłożem.
function fireflies(context, width, floor, count, time, color) {
  context.fillStyle = color;
  for (let fly = 0; fly < count; fly += 1) {
    context.globalAlpha = 0.35 + 0.6 * (0.5 + 0.5 * Math.sin(time * 4 + fly * 2));
    const fx = (fly * 83.1 + Math.sin(time * 0.6 + fly) * 24 + width) % width;
    const fy = floor - 8 - ((fly * 29) % (floor * 0.7)) + Math.cos(time * 0.9 + fly) * 8;
    circle(context, fx, fy, 2);
  }
  context.globalAlpha = 1;
}

// Nietoperze: trzy sylwetki machające skrzydłami, przelatujące przez niebo.
function bats(context, width, height, time) {
  context.fillStyle = "rgba(20, 18, 30, 0.8)";
  for (let bat = 0; bat < 3; bat += 1) {
    const span = width + 80;
    const bx = ((time * (26 + bat * 6) + bat * span * 0.4) % span) - 40;
    const by = height * (0.1 + bat * 0.07) + Math.sin(time * 3 + bat * 2) * 6;
    const flap = Math.sin(time * 14 + bat) * 4;
    polygon(context, [
      [bx - 8, by - flap],
      [bx - 3, by],
      [bx, by - 2],
      [bx + 3, by],
      [bx + 8, by - flap],
      [bx, by + 3],
    ]);
  }
}

// Kępka kryształów: kilka wydłużonych graniastosłupów (cyjan i fiolet) z odblaskiem; pulsująca poświata.
function crystals(context, x, base, size, time, seed) {
  const pulse = 0.5 + 0.5 * Math.sin(time * 2 + seed * 10);
  const glow = context.createRadialGradient(x, base - size * 0.5, 0, x, base - size * 0.5, size * 1.4);
  glow.addColorStop(0, `rgba(140, 230, 255, ${0.25 + 0.25 * pulse})`);
  glow.addColorStop(1, "rgba(140, 230, 255, 0)");
  context.fillStyle = glow;
  circle(context, x, base - size * 0.5, size * 1.4);
  for (const [offset, tall, lean, color] of [
    [-0.45, 0.65, -0.35, "#b9a6ff"],
    [0.4, 0.75, 0.3, "#7fe0ff"],
    [0, 1, 0, "#9fd8ff"],
  ]) {
    const cx = x + offset * size;
    const h = tall * size;
    const w = size * 0.18;
    const tipX = cx + Math.sin(lean) * h;
    const tipY = base - Math.cos(lean) * h;
    context.fillStyle = color;
    polygon(context, [
      [cx - w, base],
      [tipX - w, tipY + w * 1.4],
      [tipX, tipY],
      [tipX + w, tipY + w * 1.4],
      [cx + w, base],
    ]);
    context.fillStyle = "rgba(255, 255, 255, 0.45)";
    polygon(context, [
      [cx - w, base],
      [tipX - w, tipY + w * 1.4],
      [tipX, tipY],
      [cx, base],
    ]);
  }
}

/** Rysuje dekoracje rozdziału `id` (od 7.); `false` dla sześciu pierwszych rozdziałów (ich tło rysuje render.js). */
export function drawSceneDecor(context, id, width, height, floor, time) {
  const decor = DECOR[id];
  if (!decor) return false;
  context.save();
  decor(context, width, height, floor, time);
  context.restore();
  return true;
}
