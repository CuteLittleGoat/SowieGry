// Sowi Butik (Analiza 2, rozdz. 4.2; Analiza 3, E9c — zadanie 9.2): piórka z Sowiej Akademii wydaje się na stroje
// (dawne 8 z misji garderoby i 4 nowe), gatunki sów (tylko wygląd) i dłuższe działanie kózek w grach
// zręcznościowych. Zakupy są w profilu: stroje w `cosmetics.unlocked` (jak nagrody misji), a gatunki, poziom kózek
// i lista zakupów w `profil.shop`. Piórka odejmuje Akademia (`SowieAcademy.spend`).
import { DEFAULT_SPECIES, SPECIES, speciesById, speciesTransform } from "../world/species.js";

export const SHOP_VERSION = 1;

// Ceny strojów w piórkach. Dawne stroje można też nadal zdobyć misją garderoby (zakładka „Sowa”).
export const OUTFIT_PRICES = Object.freeze({
  glasses: 30,
  flowerCrown: 30,
  scarf: 30,
  cap: 35,
  backpack: 35,
  gardenerHat: 40,
  bubbleTrail: 40,
  bowTie: 30,
  beanie: 40,
  headphones: 50,
  crown: 80,
});

// Gatunki: cena w piórkach i najniższy poziom Akademii (Sówka jest od początku).
export const SPECIES_PRICES = Object.freeze({
  puszczyk: { price: 40, level: 1 },
  pojdzka: { price: 50, level: 2 },
  uszatka: { price: 60, level: 3 },
  plomykowka: { price: 70, level: 4 },
  sniezna: { price: 90, level: 5 },
  puchacz: { price: 120, level: 6 },
});

// Dłuższe działanie kózek (Sowia Ucieczka, Sowie Tory, Sowa w Chmurach): poziom → mnożnik czasu i cena.
export const GOAT_LEVELS = Object.freeze([
  { level: 1, factor: 1.2, price: 30 },
  { level: 2, factor: 1.4, price: 60 },
  { level: 3, factor: 1.6, price: 100 },
]);

const list = (value) => (Array.isArray(value) ? value.filter((item) => typeof item === "string") : []);

/** Stan Butiku z profilu (brak → domyślny): { version, species: { owned, selected }, goatLevel, purchases }. */
export function shopState(profile = {}) {
  const raw = profile?.shop && typeof profile.shop === "object" ? profile.shop : {};
  const owned = [...new Set([DEFAULT_SPECIES, ...list(raw.species?.owned).filter((id) => speciesById(id))])];
  const selected = owned.includes(raw.species?.selected) ? raw.species.selected : DEFAULT_SPECIES;
  const goatLevel = Math.max(0, Math.min(GOAT_LEVELS.length, Math.floor(Number(raw.goatLevel) || 0)));
  const purchases = raw.purchases && typeof raw.purchases === "object" ? { ...raw.purchases } : {};
  return { version: SHOP_VERSION, species: { owned, selected }, goatLevel, purchases };
}

/** Mnożnik czasu działania kózek z ulepszenia w Butiku (1 bez ulepszenia). */
export function goatTimeFactor(profile = {}) {
  const level = shopState(profile).goatLevel;
  return level ? GOAT_LEVELS[level - 1].factor : 1;
}

/** Wybrany gatunek sowy (identyfikator z shared/world/species.js). */
export const selectedSpecies = (profile = {}) => shopState(profile).species.selected;

/**
 * Oferta Butiku dla profilu i migawki Akademii: { feathers, level, outfits, species, goat }.
 * Pozycja: { id ("outfit:glasses" | "species:puszczyk" | "goat:2"), key, label, price, owned, level (wymagany),
 * locked (za niski poziom), affordable }.
 */
export function shopOffer(profile = {}, academy = {}, cosmetics = {}) {
  const state = shopState(profile);
  const feathers = Math.max(0, Number(academy?.feathers) || 0);
  const level = Math.max(1, Number(academy?.level) || 1);
  const unlocked = new Set(list(profile?.cosmetics?.unlocked));
  const item = (id, key, label, price, owned, required = 1) => ({
    id,
    key,
    label,
    price,
    owned,
    level: required,
    locked: !owned && level < required,
    affordable: !owned && level >= required && feathers >= price,
  });
  const outfits = Object.entries(OUTFIT_PRICES).map(([key, price]) =>
    item(`outfit:${key}`, key, cosmetics[key]?.label || key, price, unlocked.has(key)),
  );
  const species = SPECIES.map((entry) => {
    const offer = SPECIES_PRICES[entry.id] || { price: 0, level: 1 };
    return {
      ...item(
        `species:${entry.id}`,
        entry.id,
        entry.label,
        offer.price,
        state.species.owned.includes(entry.id),
        offer.level,
      ),
      text: entry.text,
      colors: entry.colors,
      selected: state.species.selected === entry.id,
    };
  });
  const next = GOAT_LEVELS[state.goatLevel] || null;
  const goat = {
    level: state.goatLevel,
    max: GOAT_LEVELS.length,
    factor: goatTimeFactor(profile),
    next: next ? item(`goat:${next.level}`, String(next.level), `Kózki ×${next.factor}`, next.price, false) : null,
  };
  return { feathers, level, outfits, species, goat };
}

/**
 * Zakup: buy(id, { cloud, academy, cosmetics, now }) → { ok: true } albo { ok: false, reason: "owned" | "level" |
 * "feathers" | "unknown" | "offline" }. Piórka odejmuje `academy.spend(cena)`, potem jedna zmiana profilu.
 */
export function buy(id, { cloud, academy, cosmetics = {}, now = () => Date.now() } = {}) {
  if (!cloud?.updateProfile || !academy?.spend || !cloud.isReady?.()) return { ok: false, reason: "offline" };
  const offer = shopOffer(cloud.profile(), academy.snapshot?.(), cosmetics);
  const entry = [...offer.outfits, ...offer.species, ...(offer.goat.next ? [offer.goat.next] : [])].find(
    (item) => item.id === id,
  );
  if (!entry)
    return { ok: false, reason: offer.goat.level >= offer.goat.max && id.startsWith("goat:") ? "owned" : "unknown" };
  if (entry.owned) return { ok: false, reason: "owned" };
  if (entry.locked) return { ok: false, reason: "level" };
  if (!academy.spend(entry.price)) return { ok: false, reason: "feathers" };
  const [kind, key] = id.split(":");
  cloud.updateProfile((profile) => {
    const state = shopState(profile);
    state.purchases[id] = now();
    if (kind === "outfit") {
      profile.cosmetics ||= { unlocked: ["none"], selected: "none" };
      profile.cosmetics.unlocked = [...new Set([...list(profile.cosmetics.unlocked), key])];
    } else if (kind === "species") {
      state.species.owned = [...new Set([...state.species.owned, key])];
      state.species.selected = key;
    } else if (kind === "goat") {
      state.goatLevel = Number(key);
    }
    profile.shop = state;
  });
  changed();
  return { ok: true };
}

/** Wybór posiadanego gatunku (Sówka zawsze). → true, gdy zmieniono. */
export function selectSpecies(id, { cloud } = {}) {
  const state = shopState(cloud?.profile?.());
  if (!state.species.owned.includes(id) || state.species.selected === id || !cloud?.updateProfile) return false;
  cloud.updateProfile((profile) => {
    const next = shopState(profile);
    next.species.selected = id;
    profile.shop = next;
  });
  changed();
  return true;
}

function changed() {
  globalThis.dispatchEvent?.(new CustomEvent("sowie:shop-changed"));
}

/**
 * Gatunek sowy w grafikach strony: po wczytaniu chmury, przeładowaniu profilu i zmianie w Butiku atlas dostaje
 * przekolorowanie wybranego gatunku (`atlas.setTransform`); `onChange()` po przebudowie (np. przerysowanie menu).
 * → funkcja odłączająca.
 */
export function linkSpecies(atlas, { getCloud = () => globalThis.SowieCloud, onChange = () => {} } = {}) {
  let current = DEFAULT_SPECIES;
  let active = true;
  const apply = () => {
    if (!active) return;
    const species = selectedSpecies(getCloud()?.profile?.());
    if (species === current) return;
    current = species;
    atlas
      .setTransform(speciesTransform(species))
      .then((replaced) => {
        if (replaced && active) onChange(species);
      })
      .catch(() => {});
  };
  const cloud = getCloud();
  cloud?.ready?.then(apply);
  cloud?.onProfileReload?.(apply);
  globalThis.addEventListener?.("sowie:shop-changed", apply);
  return () => {
    active = false;
    globalThis.removeEventListener?.("sowie:shop-changed", apply);
  };
}
