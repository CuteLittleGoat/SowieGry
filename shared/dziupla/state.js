// Sowia Dziupla — stan (Analiza 7, rozdz. 6 i 9; etap D1): zapis w profilu (`profil.dziupla` — jedno nowe pole
// najwyższego poziomu, reguły Firestore bez zmian), liczenie odblokowanych ozdób z postępu (liczniki Sowiej Akademii,
// zakupy za piórka, Wypluffki, Galeria), miejsca na półce i roślinki z gier. Czyste funkcje — bez strony i rysowania.
// Odblokowanie wynika z postępu i nie jest zapisywane, więc ozdoba nie może „zniknąć” (liczniki tylko rosną).
import { achievementProgress, normalizeAcademy } from "../meta/academy.js";
import { ownedIds } from "../meta/wypluffki.js";
import { CHAPTERS as GARDEN_CHAPTERS, PLANTS as GARDEN_PLANTS } from "../../SowieOgrody/ogrod/config.js";
import { CHAINS, POT } from "../../LaczIHoduj/config.js";
import { DZIUPLA_VERSION, SHELF, SLOTS, decorById, slotById } from "./items.js";

const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

/** Klucz zakupu ozdoby za piórka w dzienniku Sowiego Butiku (`profil.shop.purchases`). */
export const decorPurchaseKey = (id) => `decor:${id}`;

export function defaultDziupla() {
  const placed = Object.fromEntries(SLOTS.filter((slot) => slot.default).map((slot) => [slot.id, slot.default]));
  return { version: DZIUPLA_VERSION, placed: { ...placed, ...SHELF.default }, seen: {} };
}

/**
 * `profil.dziupla` z bazy → stan: brak pola albo uszkodzone → domyślne; `placed` — mapa miejsce → identyfikator
 * (tekst albo `null` = „pusto”), `seen` — mapa „Nowe!” → czas obejrzenia. Nieznane miejsca i ozdoby zostają.
 */
export function normalizeDziupla(raw) {
  const base = defaultDziupla();
  if (!isObject(raw)) return base;
  const placed = { ...base.placed };
  for (const [key, value] of Object.entries(isObject(raw.placed) ? raw.placed : {})) {
    if (typeof value === "string" || value === null) placed[key] = value;
  }
  const seen = {};
  for (const [key, value] of Object.entries(isObject(raw.seen) ? raw.seen : {})) {
    if (Number.isFinite(Number(value))) seen[key] = Number(value);
  }
  return { ...raw, version: DZIUPLA_VERSION, placed, seen };
}

/**
 * Kontekst odblokowań z profilu i portfela: { academy (stan Akademii), feathers (zakupy ozdób za piórka), premium
 * (Wypluffki — `ownedIds`), photos (odblokowane zdjęcia Galerii), records (podsumowania gier) }.
 */
export function unlockContext({ profile = {}, wallet = null } = {}) {
  const purchases = isObject(profile?.shop?.purchases) ? Object.keys(profile.shop.purchases) : [];
  return {
    academy: normalizeAcademy(profile?.academy),
    feathers: new Set(purchases.filter((key) => key.startsWith("decor:")).map((key) => key.slice(6))),
    premium: ownedIds(wallet),
    photos: new Set(Array.isArray(profile?.gallery?.unlocked) ? profile.gallery.unlocked : ["owl-01"]),
    records: isObject(profile?.records) ? profile.records : {},
  };
}

/** Postęp warunku ozdoby: { done, share 0–1, goals } (bez warunku — gotowe). */
export function goalProgress(goals, context) {
  if (!goals?.length) return { done: true, share: 1, goals: [] };
  return achievementProgress({ goals }, context.academy);
}

/** Czy ozdoba jest odblokowana: od początku, z warunku, kupiona za piórka albo za Wypluffki. */
export function isUnlocked(item, context) {
  if (!item) return false;
  if (item.start) return true;
  if (item.premium) return context.premium.has(item.premium);
  if (item.goals && goalProgress(item.goals, context).done) return true;
  return Boolean(item.feathers) && context.feathers.has(item.id);
}

/** Liczba miejsc na półce: 3 + dodatkowe (za granie albo za Wypluffki). */
export function shelfSlots(context) {
  const extra = SHELF.extra.filter(
    (entry) => goalProgress(entry.goals, context).done || context.premium.has(entry.premium),
  ).length;
  return Math.min(SHELF.max, SHELF.base + extra);
}

// --- roślinki z gier na półce (Analiza 7, rozdz. 6.2) ----------------------------------------------------------

const GARDEN_CHAPTER = new Map(GARDEN_CHAPTERS.map((chapter, index) => [chapter.id, index]));

// Łącz i Hoduj: dorosła roślina (poziom 4), złota (5), diamentowa (6) i tęczowa (7).
export const LACZ_LEVELS = Object.freeze([4, 5, 6, 7]);

// Sowie Trójki: roślinki z kafelków — Truskawka po pierwszej wygranej, Storczyk z sowią buzią po rozdziale 1.
export const TROJKI_PLANTS = Object.freeze([
  Object.freeze({
    id: "trojki:truskawka",
    label: "Truskawka",
    goals: [["trojkiLevels", 1]],
    text: "Wygraj poziom w Sowich Trójkach",
  }),
  Object.freeze({
    id: "trojki:storczyk",
    label: "Storczyk z sowią buzią",
    goals: [["trojkiLevels", 15]],
    text: "Ukończ rozdział „Sowia Łąka” w Sowich Trójkach",
  }),
]);

/**
 * Wszystkie roślinki na półkę: [{ id, game, label, available, text }]. Sowie Ogrody — gatunki z rozdziałów, do
 * których gracz doszedł (`ogrodyChapters` — ukończone rozdziały; rozdziały zostają po Wielkim Przesadzaniu); Łącz
 * i Hoduj — łańcuchy odblokowane liczbą połączeń (`records.szklarnia.merges`, od D1 w podsumowaniu gry) na poziomie
 * dorosłym, a złote, diamentowe i tęczowe po wyhodowaniu takiego poziomu (`szklarniaBest`); Sowie Trójki — z postępu.
 */
export function shelfPlants(context) {
  const metrics = context.academy.metrics || {};
  const chapters = Number(metrics.ogrodyChapters) || 0;
  const best = Number(metrics.szklarniaBest) || 0;
  const merges = Number(context.records?.szklarnia?.merges) || 0;
  const garden = GARDEN_PLANTS.map((plant) => {
    const index = GARDEN_CHAPTER.get(plant.chapter) ?? 0;
    return {
      id: `ogrody:${plant.id}`,
      game: "ogrody",
      label: plant.name,
      available: index <= chapters,
      text: `Sowie Ogrody — rozdział ${index + 1} (${GARDEN_CHAPTERS[index]?.name || ""})`,
    };
  });
  const lacz = POT.chains.flatMap((entry) =>
    LACZ_LEVELS.map((level) => ({
      id: `lacz:${entry.chain}:${level}`,
      game: "szklarnia",
      label: CHAINS[entry.chain].levels[level - 1],
      available: merges >= entry.unlock && (level === 4 || best >= level),
      text:
        level === 4
          ? `Łącz i Hoduj — ${entry.unlock} połączeń`
          : `Łącz i Hoduj — wyhoduj poziom ${level} (${CHAINS[entry.chain].levels[level - 1]})`,
    })),
  );
  const trojki = TROJKI_PLANTS.map((plant) => ({
    id: plant.id,
    game: "trojki",
    label: plant.label,
    available: goalProgress(plant.goals, context).done,
    text: plant.text,
  }));
  return [...garden, ...lacz, ...trojki];
}

/**
 * Co stoi w pokoju: miejsce → identyfikator do narysowania. Wybrana ozdoba musi być znana, z tego miejsca
 * i odblokowana — inaczej domyślna (zapis się nie zmienia; nieznana ozdoba z nowszej wersji wróci, gdy ta wersja ją
 * pozna). „Pusto” (`null`) tylko tam, gdzie wolno. Obrazek — odblokowane zdjęcie Galerii. Półka — tylko dostępne
 * miejsca i dostępne roślinki.
 */
export function resolvePlaced(dziupla, context) {
  const state = normalizeDziupla(dziupla);
  const result = {};
  for (const slot of SLOTS) {
    const chosen = state.placed[slot.id];
    if (chosen === null || chosen === undefined) {
      result[slot.id] = slot.empty && chosen === null ? null : slot.default;
      continue;
    }
    if (slot.photo) {
      result[slot.id] = context.photos.has(chosen) ? chosen : slot.default;
      continue;
    }
    const item = decorById(chosen);
    result[slot.id] = item && item.slot === slot.id && isUnlocked(item, context) ? chosen : slot.default;
  }
  const plants = new Map(shelfPlants(context).map((plant) => [plant.id, plant]));
  const count = shelfSlots(context);
  for (let index = 1; index <= SHELF.max; index += 1) {
    const key = `polka-${index}`;
    const chosen = state.placed[key];
    result[key] = index <= count && plants.get(chosen)?.available ? chosen : null;
  }
  return result;
}

/**
 * Zmiana w profilu (do `cloud.updateProfile`): ustawia jedno miejsce — zapis klucz po kluczu, więc dwa telefony
 * zmieniające różne miejsca nie nadpisują sobie zmian. `id = null` — „pusto”. → true, gdy zmieniono.
 */
export function placeDecor(profile, slotId, id) {
  const isShelf = /^polka-[1-5]$/.test(slotId);
  if (!isShelf && !slotById(slotId)) return false;
  const state = normalizeDziupla(profile.dziupla);
  if (state.placed[slotId] === id) return false;
  profile.dziupla = { ...state, placed: { ...state.placed, [slotId]: id } };
  return true;
}

/** „Nowe!” obejrzane: zapis czasu dla klucza „miejsce:ozdoba” (mapa, nie tablica — lekcja z uwagi G3). */
export function markSeen(profile, key, at = Date.now()) {
  const state = normalizeDziupla(profile.dziupla);
  if (state.seen[key]) return false;
  profile.dziupla = { ...state, seen: { ...state.seen, [key]: at } };
  return true;
}
