// Sowie Ogrody — ozdoby rozdziałów 7–14 (uwagi O2, O3 i O7, 2026-11-01): kolory i dekoracje teł oraz kształty
// nowych roślin. Rysowane w render.js: `drawSceneDecor` między niebem a podłożem (podłoże od `floor` = 60%
// wysokości), `createPlantShapes(context)[plant.shape]` — korona rośliny nad doniczką.

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
};

/** Rysuje dekoracje nowego rozdziału `id`; `false`, gdy to nie jest nowy rozdział (tło rysuje render.js). */
export function drawSceneDecor(context, id, width, height, floor, time) {
  const decor = DECOR[id];
  if (!decor) return false;
  context.save();
  decor(context, width, height, floor, time);
  context.restore();
  return true;
}

// Kształty roślin: korona nad doniczką w punkcie (x, top) — `top` to górna krawędź doniczki, `scale` jak w render.js,
// `stage` 1–5 (kamienie milowe: większa i bujniejsza), kolory z rośliny (`color` — główny, `accent` — drugi:
// kwiat, owoce, pień).
export function createPlantShapes(context) {
  const ellipse = (x, y, rx, ry, angle = 0) => {
    context.beginPath();
    context.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), angle, 0, Math.PI * 2);
    context.fill();
  };
  const sway = (time, x, index = 0) => Math.sin(time * 1.6 + index + x) * 0.05;

  return {
    // Palma / daktylowiec: pień z łuskami i łukowate liście-pióra; daktylowiec przy 4+ etapie z owocami.
    palm(item, x, top, scale, stage, time) {
      const { color, accent } = item;
      const height = (18 + stage * 5) * scale;
      context.fillStyle = accent;
      for (let ring = 0; ring < 4 + stage; ring += 1) {
        const y = top - (ring * height) / (4 + stage);
        ellipse(x, y - 2 * scale, 3.2 * scale, 2 * scale);
      }
      const crown = top - height;
      context.fillStyle = color;
      const fronds = 4 + stage;
      for (let index = 0; index < fronds; index += 1) {
        const angle = -Math.PI / 2 + (index - (fronds - 1) / 2) * 0.55 + sway(time, x, index);
        context.save();
        context.translate(x, crown);
        context.rotate(angle + Math.PI / 2);
        ellipse(0, -(9 + stage * 2) * scale, 3.2 * scale, (9 + stage * 2) * scale);
        context.restore();
      }
    },

    // Strelicja („rajski ptak”): sztywne liście i pomarańczowo-niebieski kwiat jak głowa ptaka.
    bird(item, x, top, scale, stage, time) {
      const { color, accent } = item;
      context.fillStyle = color;
      const leaves = 2 + stage;
      for (let index = 0; index < leaves; index += 1) {
        const angle = (index - (leaves - 1) / 2) * 0.35 + sway(time, x, index);
        context.save();
        context.translate(x, top);
        context.rotate(angle);
        ellipse(0, -(10 + stage * 3) * scale, 3 * scale, (10 + stage * 3) * scale);
        context.restore();
      }
      const flowers = stage >= 3 ? 2 : 1;
      for (let index = 0; index < flowers; index += 1) {
        const fx = x + (index ? 7 : -3) * scale;
        const fy = top - (22 + stage * 4 - index * 5) * scale;
        context.fillStyle = "#4d6fd6";
        ellipse(fx, fy, 6 * scale, 1.6 * scale, -0.2);
        context.fillStyle = accent;
        for (const [dx, dy, angle] of [
          [-2, -4, -0.9],
          [1, -5, -0.4],
          [4, -4, 0.1],
        ]) {
          ellipse(fx + dx * scale, fy + dy * scale, 1.4 * scale, 4 * scale, angle);
        }
      }
    },

    // Łodygi: bambus (zielone, z kolankami) albo lawenda (fioletowe kłoski na zielonych łodyżkach).
    stalks(item, x, top, scale, stage, time) {
      const { color, accent } = item;
      const count = 2 + stage;
      for (let index = 0; index < count; index += 1) {
        const offset = (index - (count - 1) / 2) * 3.4 * scale;
        const height = (16 + stage * 4 + (index % 2) * 4) * scale;
        const lean = sway(time, x, index) * height;
        context.strokeStyle = accent;
        context.lineWidth = Math.max(1.5, 2.4 * scale);
        context.beginPath();
        context.moveTo(x + offset, top);
        context.lineTo(x + offset + lean, top - height);
        context.stroke();
        context.fillStyle = color;
        if (item.id === "lawenda") {
          for (let bud = 0; bud < 4; bud += 1) {
            ellipse(x + offset + lean, top - height + bud * 2.4 * scale, 1.6 * scale, 1.4 * scale);
          }
        } else {
          for (let knot = 1; knot < 4; knot += 1) {
            ellipse(x + offset + (lean * knot) / 4, top - (height * knot) / 4, 1.8 * scale, 0.7 * scale);
          }
          ellipse(x + offset + lean + 3 * scale, top - height + 2 * scale, 3.4 * scale, 1.2 * scale, 0.5);
        }
      }
    },

    // Dzbanecznik: liście i zwisające dzbanki z daszkiem.
    pitcher(item, x, top, scale, stage, time) {
      const { color, accent } = item;
      context.fillStyle = color;
      for (let index = 0; index < 2 + stage; index += 1) {
        const angle = (index - (1 + stage) / 2) * 0.6 + sway(time, x, index);
        context.save();
        context.translate(x, top);
        context.rotate(angle);
        ellipse(0, -(8 + stage * 2) * scale, 2.6 * scale, (8 + stage * 2) * scale);
        context.restore();
      }
      const cups = Math.min(4, 1 + Math.floor(stage / 2) + 1);
      for (let index = 0; index < cups; index += 1) {
        const cx = x + (index - (cups - 1) / 2) * 7 * scale;
        const cy = top - (8 + (index % 2) * 6 + stage * 2) * scale;
        context.fillStyle = accent;
        ellipse(cx, cy, 2.6 * scale, 4.2 * scale);
        context.fillStyle = "#7cc35a";
        ellipse(cx, cy - 4.5 * scale, 2.8 * scale, 1.1 * scale);
      }
    },

    // Drzewko: pień i korona z kulek (sakura — różowa, klon — czerwony, ostrokrzew — ciemny z czerwonymi jagodami).
    tree(item, x, top, scale, stage, time) {
      const { color, accent } = item;
      const height = (12 + stage * 3) * scale;
      context.strokeStyle = accent;
      context.lineWidth = Math.max(2, 3 * scale);
      context.beginPath();
      context.moveTo(x, top);
      context.lineTo(x, top - height);
      context.stroke();
      const crown = top - height - 4 * scale;
      const balls = 3 + stage;
      context.fillStyle = color;
      for (let index = 0; index < balls; index += 1) {
        const angle = (index / balls) * Math.PI * 2 + sway(time, x, index);
        ellipse(
          x + Math.cos(angle) * (5 + stage) * scale,
          crown + Math.sin(angle) * (3 + stage * 0.6) * scale,
          (4 + stage * 0.6) * scale,
          (3.6 + stage * 0.5) * scale,
        );
      }
      ellipse(x, crown, (5 + stage) * scale, (4 + stage * 0.6) * scale);
      if (item.id === "ostrokrzew" || stage >= 5) {
        context.fillStyle = item.id === "ostrokrzew" ? accent : "#ffffff";
        for (let index = 0; index < 3 + stage; index += 1) {
          const angle = index * 2.3;
          ellipse(x + Math.cos(angle) * 6 * scale, crown + Math.sin(angle) * 4 * scale, 1.1 * scale, 1.1 * scale);
        }
      }
    },

    // Agawa: kolczasta rozeta; przy 5. etapie wysoki kwiatostan.
    rosette(item, x, top, scale, stage, time) {
      const { color, accent } = item;
      context.fillStyle = color;
      const spikes = 5 + stage;
      for (let index = 0; index < spikes; index += 1) {
        const angle = -Math.PI / 2 + (index - (spikes - 1) / 2) * 0.32;
        context.save();
        context.translate(x, top);
        context.rotate(angle + Math.PI / 2);
        context.beginPath();
        context.moveTo(-2.2 * scale, 0);
        context.lineTo(0, -(10 + stage * 2.5) * scale);
        context.lineTo(2.2 * scale, 0);
        context.closePath();
        context.fill();
        context.restore();
      }
      if (stage >= 5) {
        context.strokeStyle = "#7a8a4a";
        context.lineWidth = Math.max(1.5, 2 * scale);
        context.beginPath();
        context.moveTo(x, top);
        context.lineTo(x, top - 34 * scale);
        context.stroke();
        context.fillStyle = accent;
        ellipse(x, top - 36 * scale, 4 * scale, 3 * scale);
      }
    },

    // Kwiat (ciemiernik, gwiazdka): liście i kielichy kwiatów z jasnymi płatkami.
    flower(item, x, top, scale, stage, time) {
      const { color, accent } = item;
      context.fillStyle = color;
      for (let index = 0; index < 2 + stage; index += 1) {
        const angle = (index - (1 + stage) / 2) * 0.5 + sway(time, x, index);
        context.save();
        context.translate(x, top);
        context.rotate(angle);
        ellipse(0, -(6 + stage * 2) * scale, 2.8 * scale, (6 + stage * 2) * scale);
        context.restore();
      }
      const blooms = Math.min(4, 1 + Math.floor(stage / 2));
      for (let index = 0; index < blooms; index += 1) {
        const fx = x + (index - (blooms - 1) / 2) * 7 * scale;
        const fy = top - (14 + stage * 3 - (index % 2) * 3) * scale;
        context.fillStyle = accent;
        for (let petal = 0; petal < 5; petal += 1) {
          const angle = (petal / 5) * Math.PI * 2;
          ellipse(
            fx + Math.cos(angle) * 2.4 * scale,
            fy + Math.sin(angle) * 2.4 * scale,
            2.2 * scale,
            1.6 * scale,
            angle,
          );
        }
        context.fillStyle = "#f4c542";
        ellipse(fx, fy, 1.2 * scale, 1.2 * scale);
      }
    },

    // Liście na wodzie (grzybienie, wiktoria): płaskie okrągłe liście w misce z wodą i kwiat.
    pad(item, x, top, scale, stage, time) {
      const { color, accent } = item;
      context.fillStyle = "rgba(92, 200, 232, 0.8)";
      ellipse(x, top - 1 * scale, 13 * scale, 3 * scale);
      const pads = 1 + Math.min(3, Math.floor(stage / 2));
      for (let index = 0; index < pads; index += 1) {
        const px = x + (index - (pads - 1) / 2) * 8 * scale;
        const radius = (item.id === "wiktoria" ? 6 : 4.5) * scale * (0.8 + stage * 0.06);
        context.fillStyle = color;
        ellipse(px, top - 2 * scale, radius, radius * 0.38);
        if (item.id === "wiktoria") {
          context.fillStyle = "#2e8b57";
          ellipse(px, top - 2.6 * scale, radius * 0.9, radius * 0.28);
          context.fillStyle = color;
          ellipse(px, top - 3 * scale, radius * 0.85, radius * 0.25);
        }
      }
      context.fillStyle = accent;
      for (let petal = 0; petal < 6; petal += 1) {
        const angle = -Math.PI / 2 + (petal - 2.5) * 0.45;
        ellipse(
          x + Math.cos(angle) * 2 * scale,
          top - 5 * scale + Math.sin(angle) * 2 * scale,
          1.4 * scale,
          3 * scale,
          angle + Math.PI / 2,
        );
      }
    },

    // Figowiec: krótki pień, duże klapowane liście (po trzy płaty) i fioletowe figi od 2. etapu.
    fig(item, x, top, scale, stage, time) {
      const { color, accent } = item;
      const height = (8 + stage * 2) * scale;
      context.strokeStyle = "#8b5a2b";
      context.lineWidth = Math.max(2, 2.6 * scale);
      context.beginPath();
      context.moveTo(x, top);
      context.lineTo(x, top - height);
      context.stroke();
      context.fillStyle = color;
      const leaves = 2 + stage;
      for (let index = 0; index < leaves; index += 1) {
        const angle = (index - (leaves - 1) / 2) * 0.5 + sway(time, x, index);
        context.save();
        context.translate(x, top - height);
        context.rotate(angle);
        const length = (7 + stage * 1.5) * scale;
        ellipse(0, -length, 3 * scale, length * 0.55);
        ellipse(-2.6 * scale, -length * 0.8, 2.2 * scale, length * 0.4, -0.6);
        ellipse(2.6 * scale, -length * 0.8, 2.2 * scale, length * 0.4, 0.6);
        context.restore();
      }
      if (stage >= 2) {
        context.fillStyle = accent;
        for (let index = 0; index < stage; index += 1) {
          const angle = index * 2.1 + 0.4;
          ellipse(
            x + Math.cos(angle) * 6 * scale,
            top - height - 4 * scale + Math.sin(angle) * 3 * scale,
            1.8 * scale,
            2.2 * scale,
          );
        }
      }
    },

    // Księżycowa monstera: liście z wycięciami i świecącą poświatą.
    glow(item, x, top, scale, stage, time) {
      const { color, accent } = item;
      const glowRadius = (16 + stage * 3) * scale;
      const gradient = context.createRadialGradient(x, top - 12 * scale, 0, x, top - 12 * scale, glowRadius);
      gradient.addColorStop(0, "rgba(233, 255, 216, 0.5)");
      gradient.addColorStop(1, "rgba(233, 255, 216, 0)");
      context.fillStyle = gradient;
      ellipse(x, top - 12 * scale, glowRadius, glowRadius);
      context.fillStyle = color;
      const leaves = 2 + stage;
      for (let index = 0; index < leaves; index += 1) {
        const angle = (index - (leaves - 1) / 2) * 0.45 + sway(time, x, index);
        context.save();
        context.translate(x, top);
        context.rotate(angle);
        ellipse(0, -(9 + stage * 2.5) * scale, 4 * scale, (9 + stage * 2.5) * scale);
        context.fillStyle = accent;
        ellipse(1.2 * scale, -(8 + stage * 2) * scale, 0.8 * scale, 1.8 * scale);
        context.fillStyle = color;
        context.restore();
      }
    },

    // Gwiezdny kwiat: gwiazdy na łodyżkach, migoczą.
    star(item, x, top, scale, stage, time) {
      const { color, accent } = item;
      const stems = 1 + Math.min(3, Math.floor(stage / 2));
      for (let index = 0; index < stems; index += 1) {
        const sx = x + (index - (stems - 1) / 2) * 7 * scale;
        const height = (14 + stage * 3 + (index % 2) * 4) * scale;
        context.strokeStyle = "#5aa86a";
        context.lineWidth = Math.max(1.5, 1.8 * scale);
        context.beginPath();
        context.moveTo(sx, top);
        context.lineTo(sx, top - height);
        context.stroke();
        const radius = (4 + stage * 0.5) * scale * (0.9 + 0.1 * Math.sin(time * 3 + index));
        context.fillStyle = index % 2 ? accent : color;
        context.beginPath();
        for (let point = 0; point < 10; point += 1) {
          const angle = -Math.PI / 2 + (point * Math.PI) / 5;
          const r = point % 2 ? radius * 0.45 : radius;
          context.lineTo(sx + Math.cos(angle) * r, top - height + Math.sin(angle) * r);
        }
        context.closePath();
        context.fill();
      }
    },
  };
}
