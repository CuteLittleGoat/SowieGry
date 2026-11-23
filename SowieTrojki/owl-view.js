// Sowie Trójki — rysowanie Sówki z boku planszy (Analiza 5, rozdz. 8.7): wspólne `drawOwl` z atlasu (gatunek
// z Sowiego Butiku, strój z Garderoby) i przekształcenia reakcji z reżysera (owl-director.js): podskok ze
// „squash & stretch”, skrzydła w górę, podwójny skok, salto, lot nad planszą (animacja elementu płótna), przechylenie
// głowy, obrót, smutek, sen („zzz”), taniec; nowe oczy — gwiazdki, serduszka, smutne. Własne drobinki (serduszka,
// gwiazdki, konfetti, listki) na płótnie Sówki. Spokój: oddech, mruganie co 3–5 s, wodzenie wzrokiem.
import { COLORS, font } from "../shared/world/tokens.js";
import { drawOwl } from "../shared/world/owl.js";

const CONFETTI = [COLORS.serce, COLORS.zloto, COLORS.monstera, COLORS.niebieski, COLORS.fiolet, COLORS.pomaranczowy];

// Poza (nazwa grafiki w atlasie) dla reakcji i oczu.
function spriteFor(reaction, eyes, blinking) {
  if (eyes === "stars") return "sowa-zachwyt";
  if (eyes === "hearts") return "sowa-serduszka";
  if (eyes === "sad" || reaction === "sad" || reaction === "worried") return "sowa-smutek";
  if (reaction === "sleep") return "sowa-mruga";
  if (["wings", "double", "salto", "fly", "dance", "clap", "gift", "thumbs", "help"].includes(reaction)) {
    return "sowa-radosc";
  }
  if (reaction === "wave" || reaction === "lean") return "sowa-macha";
  if (reaction === "hop") return "sowa-skok";
  return blinking ? "sowa-mruga" : "sowa-stoi";
}

/**
 * createOwlView({ canvas, atlas, getDpr, cosmetic, reducedMotion, particleScale }) → `resize()`,
 * `draw(dt, reakcja, czas)`, `burst(rodzaj)`, `fly(cel)` (lot nad planszą — przesunięcie elementu), `head()`,
 * `state()`.
 */
export function createOwlView({
  canvas,
  atlas,
  getDpr = () => Math.min(2, globalThis.devicePixelRatio || 1),
  cosmetic = () => "none",
  reducedMotion = () => false,
  particleScale = () => 1,
}) {
  const context = canvas.getContext("2d");
  let size = { width: 0, height: 0, ratio: 1 };
  let blinkIn = 3;
  let blinkLeft = 0;
  let lastReaction = null;
  let flying = null;
  const bits = [];
  const stats = { frames: 0, reaction: "idle" };

  function resize() {
    const box = canvas.getBoundingClientRect();
    const ratio = getDpr();
    size = { width: Math.max(1, Math.round(box.width)), height: Math.max(1, Math.round(box.height)), ratio };
    if (canvas.width !== Math.round(size.width * ratio)) canvas.width = Math.round(size.width * ratio);
    if (canvas.height !== Math.round(size.height * ratio)) canvas.height = Math.round(size.height * ratio);
  }

  // Sówka w spoczynku: stopy na gałęzi w (x, y), rozmiar `size` (CSS px w płótnie) — rysowanie i kotwica dymka.
  function restPose() {
    return {
      x: size.width / 2,
      y: size.height * 0.94,
      size: Math.min(size.height * 0.78, size.width * 0.9),
    };
  }

  function burst(kind) {
    if (!kind) return;
    const count = Math.round(
      { leaves: 3, sparkles: 6, hearts: 5, stars: 7, confetti: 22, drops: 8 }[kind] * particleScale(),
    );
    for (let index = 0; index < count; index += 1) {
      bits.push({
        kind,
        x: 0.5 + (Math.random() - 0.5) * 0.4,
        y: kind === "confetti" ? -0.05 : 0.45,
        vx: (Math.random() - 0.5) * 0.9,
        vy: kind === "confetti" ? 0.2 + Math.random() * 0.4 : -0.5 - Math.random() * 0.6,
        spin: Math.random() * 6,
        age: 0,
        life: kind === "confetti" ? 1.6 : 1,
        color: CONFETTI[index % CONFETTI.length],
      });
    }
    if (bits.length > 80) bits.splice(0, bits.length - 80);
  }

  /** Lot nad planszą (radość 5 i Sowia pomoc): element płótna leci do punktu `target` (px na stronie) i wraca. */
  function fly(target) {
    if (reducedMotion() || !target || typeof canvas.animate !== "function") return;
    const box = canvas.getBoundingClientRect();
    const dx = target.x - (box.left + box.width / 2);
    const dy = target.y - (box.top + box.height / 2);
    flying?.cancel?.();
    flying = canvas.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)" },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.7 - 40}px) rotate(-12deg)`, offset: 0.3 },
        { transform: `translate(${dx}px, ${dy}px) rotate(360deg)`, offset: 0.55 },
        { transform: `translate(${dx * 0.4}px, ${dy * 0.3}px) rotate(380deg)`, offset: 0.8 },
        { transform: "translate(0, 0) rotate(360deg)" },
      ],
      { duration: 1600, easing: "ease-in-out" },
    );
  }

  function draw(dt, reaction, time) {
    if (!size.width) resize();
    stats.frames += 1;
    context.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
    context.clearRect(0, 0, size.width, size.height);
    blinkIn -= dt;
    if (blinkIn <= 0) {
      blinkLeft = 0.13;
      blinkIn = 3 + Math.random() * 2;
    }
    blinkLeft = Math.max(0, blinkLeft - dt);
    const name = reaction?.reaction || "idle";
    if (reaction !== lastReaction && reaction) {
      burst(reaction.effects);
      lastReaction = reaction;
    }
    if (!reaction) lastReaction = null;
    stats.reaction = name;
    const local = reaction ? Math.min(1, (time - reaction.at) / reaction.duration) : 0;
    const rest = restPose();
    const owlSize = rest.size;
    let x = rest.x;
    let y = rest.y;
    let rotation = 0;
    let scaleX = 1;
    let scaleY = 1;
    const reduced = reducedMotion();
    if (name === "idle") {
      const breath = Math.sin(time * 2.4);
      scaleY += 0.015 * breath;
      scaleX -= 0.01 * breath;
      rotation = Math.sin(time * 0.7) * 0.03;
    } else if (name === "hop") {
      y -= Math.sin(local * Math.PI) * owlSize * 0.09;
      scaleY += Math.sin(local * Math.PI) * 0.06;
    } else if (name === "wings" || name === "gift" || name === "thumbs" || name === "clap") {
      y -= Math.abs(Math.sin(local * Math.PI * 2)) * owlSize * 0.12;
    } else if (name === "double") {
      y -= Math.abs(Math.sin(local * Math.PI * 2)) * owlSize * 0.18;
    } else if (name === "salto" && !reduced) {
      y -= Math.sin(local * Math.PI) * owlSize * 0.3;
      rotation = -local * Math.PI * 2;
    } else if (name === "fly") {
      y -= Math.sin(local * Math.PI) * owlSize * 0.08;
    } else if (name === "tilt" || name === "think") {
      rotation = Math.sin(Math.min(1, local * 3) * Math.PI * 0.5) * 0.22;
    } else if (name === "spin") {
      scaleX = Math.cos(local * Math.PI * 2);
    } else if (name === "sad") {
      y += owlSize * 0.02;
    } else if (name === "worried") {
      x += Math.sin(time * 14) * owlSize * 0.02;
    } else if (name === "lean" || name === "wave") {
      rotation = Math.sin(local * Math.PI) * 0.12;
    } else if (name === "dance") {
      y -= Math.abs(Math.sin(local * Math.PI * 4)) * owlSize * 0.14;
      scaleX = Math.sin(local * Math.PI * 4) >= 0 ? 1 : -1;
    } else if (name === "hug") {
      scaleX = 1 + Math.sin(local * Math.PI) * 0.06;
    } else if (name === "sleep") {
      scaleY += Math.sin(time * 1.6) * 0.02;
    }
    const sprite = spriteFor(name, reaction?.eyes, blinkLeft > 0);
    // Gałąź, na której siedzi Sówka (wyrasta z krawędzi).
    context.strokeStyle = COLORS.sowaCiemna;
    context.lineWidth = Math.max(4, owlSize * 0.08);
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(0, size.height * 0.95);
    context.quadraticCurveTo(size.width * 0.5, size.height * 0.9, size.width * 0.95, size.height * 0.97);
    context.stroke();
    context.fillStyle = COLORS.monstera;
    context.beginPath();
    context.ellipse(size.width * 0.86, size.height * 0.9, owlSize * 0.09, owlSize * 0.05, -0.5, 0, Math.PI * 2);
    context.fill();
    const state = {
      sprite,
      scaleX,
      scaleY,
      rotation,
      offsetY: 0,
      body: 0,
      stars: false,
      time,
    };
    if (rotation && name === "salto") {
      // Salto wokół środka sowy, nie wokół stóp.
      context.save();
      context.translate(x, y - owlSize * 0.45);
      context.rotate(rotation);
      context.translate(-x, -(y - owlSize * 0.45));
      drawOwl(context, atlas, x, y, { size: owlSize, cosmetic: cosmetic(), state: { ...state, rotation: 0 } });
      context.restore();
    } else {
      drawOwl(context, atlas, x, y, { size: owlSize, cosmetic: cosmetic(), state });
    }
    if (name === "sleep") {
      context.fillStyle = COLORS.szaryCiemny;
      context.font = font(Math.round(owlSize * 0.16));
      context.textAlign = "left";
      const lift = (time * 0.6) % 1;
      context.globalAlpha = 1 - lift;
      context.fillText("z", x + owlSize * 0.3, y - owlSize * (0.85 + lift * 0.2));
      context.fillText("z", x + owlSize * 0.4, y - owlSize * (1 + lift * 0.2));
      context.globalAlpha = 1;
    }
    if (name === "worried") {
      context.fillStyle = COLORS.woda;
      context.beginPath();
      context.ellipse(x + owlSize * 0.3, y - owlSize * 0.8, owlSize * 0.03, owlSize * 0.05, 0, 0, Math.PI * 2);
      context.fill();
    }
    // Drobinki.
    for (let index = bits.length - 1; index >= 0; index -= 1) {
      const bit = bits[index];
      bit.age += dt;
      if (bit.age >= bit.life) {
        bits.splice(index, 1);
        continue;
      }
      bit.x += bit.vx * dt;
      bit.y += bit.vy * dt;
      bit.vy += (bit.kind === "confetti" ? 0.2 : 0.6) * dt;
      const px = bit.x * size.width;
      const py = bit.y * size.height;
      context.globalAlpha = 1 - bit.age / bit.life;
      const r = owlSize * 0.05;
      if (bit.kind === "hearts") {
        context.fillStyle = COLORS.serce;
        context.font = font(Math.round(r * 3));
        context.fillText("♥", px, py);
      } else if (bit.kind === "stars" || bit.kind === "sparkles") {
        context.fillStyle = COLORS.zloto;
        context.beginPath();
        for (let point = 0; point < 10; point += 1) {
          const angle = -Math.PI / 2 + (point * Math.PI) / 5 + bit.spin;
          const radius = point % 2 ? r * 0.5 : r;
          context.lineTo(px + Math.cos(angle) * radius, py + Math.sin(angle) * radius);
        }
        context.closePath();
        context.fill();
      } else if (bit.kind === "leaves") {
        context.fillStyle = COLORS.monsteraJasna;
        context.beginPath();
        context.ellipse(px, py, r, r * 0.5, bit.spin + bit.age * 3, 0, Math.PI * 2);
        context.fill();
      } else if (bit.kind === "drops") {
        context.fillStyle = COLORS.woda;
        context.beginPath();
        context.arc(px, py, r * 0.6, 0, Math.PI * 2);
        context.fill();
      } else {
        context.fillStyle = bit.color;
        context.save();
        context.translate(px, py);
        context.rotate(bit.spin + bit.age * 5);
        context.fillRect(-r * 0.5, -r * 0.25, r, r * 0.5);
        context.restore();
      }
      context.globalAlpha = 1;
    }
  }

  return {
    resize,
    draw,
    burst,
    fly,
    /** Głowa Sówki w spoczynku (CSS px w płótnie): prawa krawędź i czubek — do ustawienia dymka obok. */
    head() {
      const rest = restPose();
      return { right: rest.x + rest.size * 0.4, top: rest.y - rest.size * 0.95, size: rest.size };
    },
    animating: () => bits.length > 0 || Boolean(flying && flying.playState === "running"),
    state: () => ({ ...stats, bits: bits.length }),
  };
}
