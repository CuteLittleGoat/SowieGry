// Sówka — jedna wspólna biblioteka wyglądu i animacji sowy dla wszystkich gier (Analiza 2, rozdz. 2.2).
// Klatki składane są z części SVG (assets/svg/sowa/) w pudełku 128 × 128; garderoba to nakładki w tym samym pudełku.
import { drawShadow } from "../engine/sprites.js";

export const OWL_BOX = 128;
// Punkt kotwicy: środek między stopami, na ziemi.
export const OWL_ANCHOR = [0.5, 122 / 128];
// Wysokość sowy w jednostkach świata (domyślna).
export const OWL_SIZE = 1.2;

const PIVOT_LEFT_WING = [34, 68];
const PIVOT_RIGHT_WING = [94, 68];
const PIVOT_LEFT_FOOT = [50, 117];
const PIVOT_RIGHT_FOOT = [78, 117];

// Pozy: body — przesunięcie tułowia w pionie, wings — obrót skrzydeł (stopnie, dodatni lewy = uniesione),
// feet — [dx, dy, obrót] każdej stopy, eyes — wariant oczu, pupils — przesunięcie źrenic (null = bez źrenic).
const RUN_BODY = [0, -3, -5, 0, -3, -5];
const RUN_WINGS = [15, 35, 20, 5, 30, 15];
const RUN_FEET = [
  [
    [-2, 0, -10],
    [2, -6, 15],
  ],
  [
    [0, -1, 0],
    [3, -8, 20],
  ],
  [
    [1, -3, 5],
    [1, -4, 10],
  ],
  [
    [-2, -6, -15],
    [2, 0, 10],
  ],
  [
    [-3, -8, -20],
    [0, -1, 0],
  ],
  [
    [-1, -4, -10],
    [-1, -3, -5],
  ],
];

export const OWL_POSES = Object.freeze({
  stoi: { body: 0, wings: 0, feet: null, eyes: "oczy", pupils: [0, 0] },
  mruga: { body: 0, wings: 0, feet: null, eyes: "oczy-zamkniete", pupils: null },
  ...Object.fromEntries(
    RUN_BODY.map((body, index) => [
      `bieg-${index + 1}`,
      { body, wings: RUN_WINGS[index], feet: RUN_FEET[index], eyes: "oczy", pupils: [3, 0] },
    ]),
  ),
  skok: {
    body: -2,
    wings: 60,
    feet: [
      [2, -6, -25],
      [-2, -6, 25],
    ],
    eyes: "oczy",
    pupils: [2, -3],
  },
  szybuje: {
    body: 0,
    wings: 95,
    feet: [
      [2, -5, -30],
      [-2, -5, 30],
    ],
    eyes: "oczy",
    pupils: [3, 1],
  },
  oszolomiona: {
    body: 0,
    wings: -12,
    feet: [
      [-3, 0, -10],
      [3, 0, 10],
    ],
    eyes: "oczy-oszolomione",
    pupils: null,
  },
  radosc: {
    body: -2,
    wings: 70,
    feet: [
      [0, 0, -10],
      [0, 0, 10],
    ],
    eyes: "oczy-radosc",
    pupils: null,
  },
});

// Warstwy klatki (kolejność rysowania: stopy → tułów → skrzydła → oczy → źrenice).
export function owlLayers(pose) {
  const [leftFoot, rightFoot] = pose.feet || [
    [0, 0, 0],
    [0, 0, 0],
  ];
  const layers = [
    { svg: "sowa/stopa-lewa.svg", dx: leftFoot[0], dy: leftFoot[1], rotate: leftFoot[2], pivot: PIVOT_LEFT_FOOT },
    { svg: "sowa/stopa-prawa.svg", dx: rightFoot[0], dy: rightFoot[1], rotate: rightFoot[2], pivot: PIVOT_RIGHT_FOOT },
    { svg: "sowa/cialo.svg", dy: pose.body },
    { svg: "sowa/skrzydlo-lewe.svg", dy: pose.body, rotate: pose.wings, pivot: PIVOT_LEFT_WING },
    { svg: "sowa/skrzydlo-prawe.svg", dy: pose.body, rotate: -pose.wings, pivot: PIVOT_RIGHT_WING },
    { svg: `sowa/${pose.eyes}.svg`, dy: pose.body },
  ];
  if (pose.pupils) layers.push({ svg: "sowa/zrenice.svg", dx: pose.pupils[0], dy: pose.body + pose.pupils[1] });
  return layers.map((layer) => Object.fromEntries(Object.entries(layer).filter(([, value]) => value !== 0)));
}

// Garderoba (klucze jak w SowiePlatform.COSMETICS) → nakładki: front (przed sową) i behind (za sową).
export const COSMETIC_SPRITES = Object.freeze({
  none: {},
  bow: { front: "garderoba-kokardka" },
  glasses: { front: "garderoba-okulary" },
  flowerCrown: { front: "garderoba-wianek" },
  gardenerHat: { front: "garderoba-kapelusz-ogrodnika" },
  cap: { front: "garderoba-czapka" },
  scarf: { front: "garderoba-szalik" },
  backpack: { behind: "garderoba-plecak", front: "garderoba-plecak-szelki" },
  bubbleTrail: { front: "garderoba-babelki" },
  crown: { front: "garderoba-korona" },
  bowTie: { front: "garderoba-muszka" },
  headphones: { front: "garderoba-sluchawki" },
  beanie: { front: "garderoba-czapka-zimowa" },
});

export const OWL_ACTIONS = ["stoi", "bieg", "skok", "szybowanie", "oszolomienie", "radosc"];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Animacja sowy: mruganie co 3–5 s, bieg (6 klatek), skok ze squash & stretch, szybowanie,
 * oszołomienie (gwiazdki), radość (zmrużone oczy). update(dt) w sekundach, state() → co narysować.
 */
export function createOwlAnimator({ random = Math.random, runFps = 12 } = {}) {
  let action = "stoi";
  let time = 0;
  let actionTime = 0;
  let blinkIn = 3 + random() * 2;
  let blinkLeft = 0;
  let squash = 0;
  let stretch = 0;

  return {
    set(next) {
      if (!OWL_ACTIONS.includes(next)) throw new Error(`Nieznana akcja sowy: ${next}`);
      if (next !== action) {
        action = next;
        actionTime = 0;
      }
    },
    action: () => action,
    // Lądowanie: spłaszczenie (squash) proporcjonalne do siły 0–1.
    land(strength = 1) {
      squash = clamp(strength, 0, 1);
    },
    blink() {
      blinkLeft = 0.12;
    },
    update(dt, { vy = 0 } = {}) {
      time += dt;
      actionTime += dt;
      blinkIn -= dt;
      if (blinkIn <= 0) {
        blinkLeft = 0.12;
        blinkIn = 3 + random() * 2;
      }
      blinkLeft = Math.max(0, blinkLeft - dt);
      squash = Math.max(0, squash - dt / 0.18);
      // vy w jednostkach świata na sekundę (ujemne = w górę): rozciągnięcie przy wybiciu, lekkie spłaszczenie przy opadaniu.
      stretch = action === "skok" ? clamp(-vy * 0.02, -0.08, 0.16) : 0;
    },
    state() {
      let sprite = "sowa-stoi";
      let scaleX = 1;
      let scaleY = 1;
      let rotation = 0;
      let offsetY = 0;
      let stars = false;
      if (action === "stoi") {
        sprite = blinkLeft > 0 ? "sowa-mruga" : "sowa-stoi";
        const breath = Math.sin(time * 2.5);
        scaleY += 0.015 * breath;
        scaleX -= 0.01 * breath;
      } else if (action === "bieg") {
        sprite = `sowa-bieg-${(Math.floor(actionTime * runFps) % 6) + 1}`;
        rotation = 0.08;
      } else if (action === "skok") {
        sprite = "sowa-skok";
        scaleY += stretch;
        scaleX -= stretch * 0.6;
      } else if (action === "szybowanie") {
        sprite = "sowa-szybuje";
        offsetY = Math.sin(time * 3) * 3;
        rotation = 0.04 * Math.sin(time * 1.5);
      } else if (action === "oszolomienie") {
        sprite = "sowa-oszolomiona";
        stars = true;
        rotation = Math.sin(time * 6) * 0.06;
      } else if (action === "radosc") {
        sprite = "sowa-radosc";
        offsetY = -Math.abs(Math.sin(time * 6)) * 8;
      }
      scaleY *= 1 - 0.22 * squash;
      scaleX *= 1 + 0.22 * squash;
      const pose = OWL_POSES[sprite.slice(5)] || OWL_POSES.stoi;
      return { sprite, scaleX, scaleY, rotation, offsetY, body: pose.body, stars, time };
    },
  };
}

/**
 * Rysuje sowę (z cieniem i garderobą) w punkcie (x, y) = ziemia pod stopami, w jednostkach kontekstu.
 * options: state (z animatora), size, cosmetic, flipX, alpha, lift (0–1, wysokość nad ziemią dla cienia), shadow.
 */
export function drawOwl(context, atlas, x, y, options = {}) {
  const { size = OWL_SIZE, cosmetic = "none", flipX = false, alpha, lift = 0, shadow = true } = options;
  const state = options.state || {
    sprite: "sowa-stoi",
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    offsetY: 0,
    body: 0,
    stars: false,
    time: 0,
  };
  const unit = size / OWL_BOX;
  const extra = COSMETIC_SPRITES[cosmetic] || COSMETIC_SPRITES.none;
  if (shadow) drawShadow(context, x, y, size * 0.7, { lift });
  context.save();
  context.translate(x, y + state.offsetY * unit);
  if (state.rotation) context.rotate(state.rotation);
  context.scale(state.scaleX * (flipX ? -1 : 1), state.scaleY);
  if (alpha !== undefined) context.globalAlpha *= alpha;
  const layer = { width: size };
  if (extra.behind) atlas.draw(context, extra.behind, 0, state.body * unit, layer);
  atlas.draw(context, state.sprite, 0, 0, layer);
  if (extra.front) atlas.draw(context, extra.front, 0, state.body * unit, layer);
  if (state.stars) {
    atlas.draw(context, "sowa-gwiazdki", 0, (14 - 122 + state.body) * unit, {
      width: size,
      rotation: Math.sin(state.time * 4) * 0.2,
    });
  }
  context.restore();
}
