// Katalog grafik „Sowiego Świata”: nazwa → warstwy SVG (assets/svg/) + rozmiar w jednostkach świata.
// Z katalogu Sowi Silnik buduje atlas (shared/engine/sprites.js). Napisy rysuje atlas czcionką Fredoka.
import { COLORS } from "./tokens.js";
import { OWL_ANCHOR, OWL_POSES, OWL_SIZE, owlLayers } from "./owl.js";

// Adres katalogu assets/svg/ (względem tego pliku, więc działa z każdej strony i w testach Node).
export const SVG_BASE = new URL("../../assets/svg/", import.meta.url).href;

const square = (svgList, size, anchor = [0.5, 0.5], extra = []) => ({
  box: [128, 128],
  size: [size, size],
  anchor,
  layers: [...svgList.map((svg) => ({ svg })), ...extra],
});

const owlSprites = Object.fromEntries(
  Object.entries(OWL_POSES).map(([name, pose]) => [
    `sowa-${name}`,
    { box: [128, 128], size: [OWL_SIZE, OWL_SIZE], anchor: OWL_ANCHOR, layers: owlLayers(pose) },
  ]),
);

const WARDROBE = {
  "garderoba-kokardka": "kokardka",
  "garderoba-okulary": "okulary",
  "garderoba-wianek": "wianek",
  "garderoba-kapelusz-ogrodnika": "kapelusz-ogrodnika",
  "garderoba-czapka": "czapka",
  "garderoba-szalik": "szalik",
  "garderoba-plecak": "plecak",
  "garderoba-plecak-szelki": "plecak-szelki",
  "garderoba-babelki": "babelki",
};

export const GOAT_KINDS = Object.freeze({
  sprezynka: { label: "Sprężynka", color: COLORS.zloto, effect: "super-skok" },
  tarcza: { label: "Tarcza", color: COLORS.niebieski, effect: "chroni przed 1 trafieniem" },
  magnes: { label: "Magnes", color: COLORS.fiolet, effect: "przyciąga liście" },
  turbo: { label: "Turbo", color: COLORS.pomaranczowy, effect: "sprint z nietykalnością" },
  podwajaczka: { label: "Podwajaczka", color: COLORS.monstera, effect: "podwójne liście" },
});

const GOAT_ANCHOR = [0.5, 116 / 128];
const goatSprites = Object.fromEntries(
  Object.keys(GOAT_KINDS).flatMap((kind) => [
    [`kozka-${kind}`, square(["kozki/koza.svg", `kozki/koza-${kind}.svg`], 1.2, GOAT_ANCHOR)],
    [`kozka-${kind}-skok`, square(["kozki/koza-skok.svg", `kozki/koza-${kind}.svg`], 1.2, GOAT_ANCHOR)],
  ]),
);

const text = (value, x, y, size, color, extra = {}) => ({ text: value, x, y, size, color, weight: 700, ...extra });

export const PRACU_VARIANTS = ["dymek", "telefon", "telefon-magda", "teczka", "mail", "tablica", "budzik"];
export const AMIC_VARIANTS = ["dystrybutor", "cysterna", "znak-cen", "wozek", "barierka", "kanister", "sterowiec"];
export const LEAF_KINDS = Object.freeze({
  zielony: { points: 10, leaves: 1 },
  zloty: { points: 50, leaves: 5 },
  teczowy: { points: 100, leaves: 1, fever: true },
});

export const SPRITES = Object.freeze({
  ...owlSprites,
  "sowa-gwiazdki": square(["sowa/gwiazdki.svg"], OWL_SIZE, [0.5, 14 / 128]),
  ...Object.fromEntries(
    Object.entries(WARDROBE).map(([name, file]) => [name, square([`garderoba/${file}.svg`], OWL_SIZE, OWL_ANCHOR)]),
  ),
  babelek: { box: [32, 32], size: [0.3, 0.3], anchor: [0.5, 0.5], layers: [{ svg: "garderoba/babelek.svg" }] },
  ...goatSprites,
  humbak: { box: [256, 128], size: [3.2, 1.6], anchor: [0.5, 0.5], layers: [{ svg: "humbak/humbak.svg" }] },
  plusk: square(["humbak/plusk.svg"], 1.6, [0.5, 1]),
  "pracu-dymek": square(
    ["pracu/dymek.svg"],
    1.2,
    [0.5, 0.5],
    [text("Pracu", 64, 56, 21, COLORS.pracu), text("pracu!", 64, 74, 21, COLORS.pracu)],
  ),
  "pracu-telefon": square(["pracu/telefon.svg"], 1.2),
  "pracu-telefon-magda": square(["pracu/telefon.svg"], 1.2, [0.5, 0.5], [text("Magda", 64, 31, 12, COLORS.pracu)]),
  "pracu-teczka": square(["pracu/teczka.svg"], 1.2, [0.5, 122 / 128]),
  "pracu-mail": square(["pracu/mail.svg"], 0.9),
  "pracu-tablica": square(
    ["pracu/tablica.svg"],
    1.4,
    [0.5, 124 / 128],
    [
      text("Przyjmiesz", 64, 52, 17, COLORS.pracu, { maxWidth: 94 }),
      text("zmianę?", 64, 69, 17, COLORS.pracu, { maxWidth: 94 }),
    ],
  ),
  "pracu-budzik": square(["pracu/budzik.svg"], 1.1, [0.5, 124 / 128]),
  "amic-dystrybutor": square(["amic/dystrybutor.svg"], 1.6, [0.5, 124 / 128], [text("Amic", 61, 22, 17, COLORS.bialy)]),
  "amic-cysterna": {
    box: [256, 128],
    size: [4, 2],
    anchor: [0.5, 122 / 128],
    layers: [{ svg: "amic/cysterna.svg" }, text("Amic", 170, 47, 26, COLORS.amicCzerwony)],
  },
  "amic-znak-cen": {
    box: [128, 256],
    size: [1.6, 3.2],
    anchor: [0.5, 254 / 256],
    layers: [
      { svg: "amic/znak-cen.svg" },
      text("Amic", 64, 27, 24, COLORS.bialy),
      text("95", 27, 66, 11, COLORS.bialy),
      text("ON", 27, 104, 11, COLORS.bialy),
      text("6,19", 74, 66, 24, COLORS.kontur),
      text("6,49", 74, 104, 24, COLORS.kontur),
    ],
  },
  "amic-wozek": square(["amic/wozek.svg"], 1.3, [0.5, 120 / 128]),
  "amic-barierka": square(["amic/barierka.svg"], 1.4, [0.5, 122 / 128]),
  "amic-kanister": square(["amic/kanister.svg"], 0.9),
  "amic-sterowiec": {
    box: [256, 128],
    size: [4, 2],
    anchor: [0.5, 0.5],
    layers: [{ svg: "amic/sterowiec.svg" }, text("Amic", 124, 54, 34, COLORS.amicCzerwony)],
  },
  "lisc-zielony": square(["liscie/zielony.svg"], 0.6),
  "lisc-zloty": square(["liscie/zloty.svg"], 0.6),
  "lisc-teczowy": square(["liscie/teczowy.svg"], 0.6),
  zycie: square(["interfejs/serduszko-doniczka.svg"], 0.6),
  "zycie-puste": square(["interfejs/serduszko-puste.svg"], 0.6),
});
