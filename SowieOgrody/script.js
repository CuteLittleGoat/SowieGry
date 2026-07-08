(() => {
  "use strict";

  const KEY = "sowieOgrodySave";
  const VERSION = 2;
  const core = window.SowieCore;
  const $ = (id) => document.getElementById(id);

  const canvas = $("gardenCanvas");
  const ctx = canvas.getContext("2d");
  const panel = $("panelContent");
  const tabsNode = $("tabBar");
  const logNode = $("gardenLog");
  const waterButton = $("waterButton");
  const prestigeButton = $("prestigeButton");
  const offlineModal = $("offlineModal");
  const offlineText = $("offlineText");
  const prestigeModal = $("prestigeModal");
  const prestigeText = $("prestigeText");
  const hud = {
    leaves: $("leavesValue"),
    lps: $("lpsValue"),
    water: $("waterValue"),
    wps: $("wpsValue"),
    zone: $("zoneValue"),
    save: $("saveValue"),
  };

  const ZONES = [
    { id: "parapet", name: "Parapet", leaves: 0, water: 0, prestige: 0 },
    { id: "balcony", name: "Balkon", leaves: 1000, water: 0, prestige: 0 },
    { id: "plot", name: "Działka", leaves: 50000, water: 0, prestige: 0 },
    { id: "pool", name: "Basen", leaves: 250000, water: 0, prestige: 0 },
    { id: "greenhouse", name: "Szklarnia", leaves: 2000000, water: 1000, prestige: 0 },
    { id: "center", name: "Centrum", leaves: 50000000, water: 0, prestige: 0 },
    { id: "arboretum", name: "Arboretum", leaves: 0, water: 0, prestige: 1 },
  ];

  const PLANTS = [
    { id: "monstera", name: "Monstera", zone: "parapet", icon: "🌿", cost: 10, prod: 0.1, grow: 1.12, color: "#55a96b" },
    { id: "pilea", name: "Pilea", zone: "parapet", icon: "🪴", cost: 75, prod: 0.8, grow: 1.13, color: "#72bd68" },
    { id: "fern", name: "Paproć", zone: "balcony", icon: "🌱", cost: 450, prod: 4, grow: 1.14, color: "#4b9e72" },
    { id: "alocasia", name: "Alokazja", zone: "balcony", icon: "🍃", cost: 2500, prod: 18, grow: 1.15, color: "#417b64" },
    { id: "cactus", name: "Kaktus Pracu", zone: "plot", icon: "🌵", cost: 15000, prod: 90, grow: 1.15, color: "#5ba760" },
    { id: "orchid", name: "Storczyk pluskowy", zone: "pool", icon: "🌸", cost: 120000, prod: 650, grow: 1.16, color: "#d96faf" },
    { id: "bonsai", name: "Bonsai cierpliwości", zone: "greenhouse", icon: "🌳", cost: 1000000, prod: 5000, grow: 1.16, color: "#3f8b5b" },
    { id: "mutant", name: "Mutant monstera", zone: "greenhouse", icon: "🪴", cost: 8000000, prod: 42000, grow: 1.17, color: "#276f4f" },
    { id: "goldTree", name: "Drzewko złotych liści", zone: "center", icon: "🍂", cost: 75000000, prod: 420000, grow: 1.18, color: "#caa34a" },
  ];

  const UPGRADES = [
    { id: "softGloves", group: "click", icon: "🧤", name: "Miękkie rękawiczki", cost: 25, desc: "Kliknięcia x2.", effect: { click: 2 } },
    { id: "leafBasket", group: "click", icon: "🧺", name: "Koszyk na liście", cost: 250, req: ["softGloves"], desc: "Kliknięcia x3.", effect: { click: 3 } },
    { id: "fastBeak", group: "click", icon: "🦉", name: "Szybki dzióbek", cost: 2000, req: ["leafBasket"], desc: "Kliknięcia x5.", effect: { click: 5 } },
    { id: "gardenRhythm", group: "click", icon: "🎵", name: "Rytm ogrodu", cost: 20000, req: ["fastBeak"], desc: "Kliknięcie daje 1% LPS.", effect: { clickLps: 0.01 } },
    { id: "betterSoil", group: "production", icon: "🟫", name: "Lepsza ziemia", cost: 150, desc: "Wszystkie rośliny x1.5.", effect: { global: 1.5 } },
    { id: "cuteLabels", group: "production", icon: "🏷️", name: "Urocze etykietki", cost: 1000, req: ["betterSoil"], desc: "Monstera i Pilea x2.", effect: { plant: { monstera: 2, pilea: 2 } } },
    { id: "balconyShelves", group: "production", icon: "🪟", name: "Półki balkonowe", cost: 8000, zone: "balcony", req: ["cuteLabels"], desc: "Rośliny balkonowe x2.", effect: { zoneMult: { balcony: 2 } } },
    { id: "compostBox", group: "production", icon: "🪱", name: "Kompostownik", cost: 45000, zone: "plot", req: ["balconyShelves"], desc: "Globalna produkcja x2.", effect: { global: 2 } },
    { id: "greenhouseLamps", group: "production", icon: "💡", name: "Lampy szklarniowe", cost: 1500000, zone: "greenhouse", req: ["compostBox"], desc: "Szklarnia x3.", effect: { zoneMult: { greenhouse: 3 } } },
    { id: "monsterFertilizer", group: "production", icon: "✨", name: "Nawóz monster", cost: 12000000, zone: "greenhouse", req: ["greenhouseLamps"], desc: "Globalna produkcja x2.", effect: { global: 2 } },
    { id: "wateringCan", group: "water", icon: "🚿", name: "Konewka sowy", cost: 300, desc: "Odblokowuje podlewanie. Sowa w szklarni nosi słomkowy kapelusz.", effect: { can: 1 } },
    { id: "smallSprinkler", group: "water", icon: "💧", name: "Mały zraszacz", cost: 5000, zone: "balcony", req: ["wateringCan"], desc: "+0.1 wody/s i ładowanie konewki.", effect: { wps: 0.1, canRegen: 0.018 } },
    { id: "bigSprinkler", group: "water", icon: "💦", name: "Duży zraszacz", cost: 80000, zone: "plot", req: ["smallSprinkler"], desc: "+1 wody/s i lepszy offline.", effect: { wps: 1, off: 0.15, cap: 14400, canRegen: 0.05 } },
    { id: "whalePool", group: "water", icon: "🐋", name: "Basen humbaka", cost: 250000, zone: "pool", req: ["bigSprinkler"], desc: "+2 wody/s i event plusku.", effect: { wps: 2, whale: 1 } },
    { id: "autoHarvestI", group: "automation", icon: "🪣", name: "Pomocna konewka", cost: 3500, zone: "balcony", desc: "Auto-zbiory co 5 s.", effect: { harvest: 5 } },
    { id: "autoHarvestII", group: "automation", icon: "🌧️", name: "Pracowity zraszacz", cost: 65000, zone: "plot", req: ["autoHarvestI"], desc: "Auto-zbiory co 2 s.", effect: { harvest: 2 } },
    { id: "autoClicker", group: "automation", icon: "⏱️", name: "Sowie tykanie", cost: 120000, zone: "plot", req: ["autoHarvestII"], desc: "Auto-kliknięcie 1/s.", effect: { autoClick: 1 } },
    { id: "goatAssistant", group: "automation", icon: "🐐", name: "Koza asystentka", cost: 420000, zone: "plot", req: ["autoClicker"], desc: "Zbiera część złotych liści.", effect: { goat: 0.5 } },
    { id: "deliveryManager", group: "automation", icon: "🚚", name: "Kierownik dostaw Amic", cost: 9000000, zone: "center", req: ["goatAssistant"], desc: "Odbiera zwykłe dostawy.", effect: { delivery: 1 } },
    { id: "smartBuyerPlants", group: "automation", icon: "🛒", name: "Sowa zakupowa", cost: 18000000, zone: "greenhouse", req: ["deliveryManager"], desc: "Auto-buy opłacalnych roślin.", effect: { autobuy: 1 } },
    { id: "offlineGardeners", group: "automation", icon: "🌙", name: "Nocni ogrodnicy", cost: 25000000, zone: "greenhouse", req: ["smartBuyerPlants"], desc: "Offline +25%, limit +4 h.", effect: { off: 0.25, cap: 14400 } },
  ];

  const PRESTIGE_TREE = [
    { id: "roots", branch: "Korzenie", icon: "🌳", name: "Starożytne korzenie", cost: 1, max: 20, desc: "+25% globalnej produkcji za poziom.", effect: "+25% produkcji / poziom" },
    { id: "fastStart", branch: "Korzenie", icon: "🌱", name: "Szybszy parapet", cost: 3, max: 5, req: ["roots"], desc: "Nowy cykl startuje z roślinami i liśćmi.", effect: "mocniejszy start" },
    { id: "seedMemory", branch: "Korzenie", icon: "🌰", name: "Pamięć nasion", cost: 6, max: 10, req: ["fastStart"], desc: "Więcej nasion z kolejnych prestiży.", effect: "+8% nasion / poziom" },
    { id: "waterMemory", branch: "Woda", icon: "💧", name: "Pamięć plusku", cost: 2, max: 20, desc: "+20% produkcji wody za poziom.", effect: "+20% wody / poziom" },
    { id: "waterStart", branch: "Woda", icon: "🚿", name: "Zapisana konewka", cost: 4, max: 5, req: ["waterMemory"], desc: "Konewka ładuje się szybciej i ma większy zapas po prestiżu.", effect: "lepsza konewka" },
    { id: "whaleEcho", branch: "Woda", icon: "🐋", name: "Echo humbaka", cost: 7, max: 6, req: ["waterStart"], desc: "Pluski humbaka są częstsze i mocniejsze.", effect: "mocniejsze pluski" },
    { id: "sleepy", branch: "Idle", icon: "🌙", name: "Senni ogrodnicy", cost: 2, max: 20, desc: "+10% skuteczności offline za poziom.", effect: "+10% offline / poziom" },
    { id: "deepSleep", branch: "Idle", icon: "🛌", name: "Głęboki sen ogrodu", cost: 4, max: 10, req: ["sleepy"], desc: "Wydłuża limit offline po prestiżu.", effect: "+2h limitu / poziom" },
    { id: "nightShift", branch: "Idle", icon: "🦉", name: "Nocna zmiana sowy", cost: 8, max: 5, req: ["deepSleep"], desc: "Auto-zbiory działają lepiej po powrocie.", effect: "większy offline harvest" },
    { id: "goatWisdom", branch: "Auto", icon: "🐐", name: "Mądrość kozy", cost: 5, max: 10, desc: "Koza skuteczniej zbiera eventy.", effect: "+10% auto-eventów / poziom" },
    { id: "amic", branch: "Auto", icon: "🚚", name: "Stała umowa Amic", cost: 5, max: 10, req: ["goatWisdom"], desc: "Dostawy pojawiają się częściej.", effect: "częstsze dostawy" },
    { id: "smartRoots", branch: "Auto", icon: "🛒", name: "Pamięć zakupów", cost: 9, max: 5, req: ["amic"], desc: "Auto-buy jest skuteczniejszy w nowych cyklach.", effect: "lepszy auto-buy" },
  ];

  const TABS = [
    ["plants", "Rośliny", "🌿"],
    ["upgrades", "Rozwój", "✨"],
    ["automation", "Auto", "⚙️"],
    ["prestige", "Prestiż", "🌰"],
    ["stats", "Statystyki", "📊"],
  ];

  let state = load();
  let tab = "plants";
  let paused = false;
  let dirty = true;
  let last = performance.now();
  let hudTimer = 0;
  let autoTimer = 0;
  let saveTimer = 0;
  let eventTimer = 0;
  let pulse = 0;
  let particles = [];
  let texts = [];
  let events = [];
  let meter = null;

  function defaultSave() {
    const now = Date.now();
    return {
      version: VERSION,
      createdAt: now,
      lastSavedAt: now,
      leaves: 0,
      water: 0,
      prestigeSeeds: 0,
      lifetimeLeaves: 0,
      lifetimeWater: 0,
      currentRunLeaves: 0,
      currentRunWater: 0,
      zone: "parapet",
      unlocked: ["parapet"],
      plants: {},
      upgrades: {},
      prestige: {},
      automation: { autoBuy: false },
      effects: { fever: 0, watered: 0, pracu: 0, penalty: 0 },
      can: { charges: 3, max: 3, progress: 0 },
      stats: { clicks: 0, buys: 0, offlineLeaves: 0, offlineWater: 0, golden: 0, deliveries: 0, watering: 0, prestiges: 0, bestLps: 0, totalPrestigeSeeds: 0 },
      achievements: {},
    };
  }

  function mergeSave(raw) {
    const base = defaultSave();
    if (!raw || typeof raw !== "object") return base;
    const merged = { ...base, ...raw, plants: { ...base.plants, ...(raw.plants || {}) }, upgrades: { ...base.upgrades, ...(raw.upgrades || {}) }, prestige: { ...base.prestige, ...(raw.prestige || {}) }, automation: { ...base.automation, ...(raw.automation || {}) }, effects: { ...base.effects, ...(raw.effects || {}) }, can: { ...base.can, ...(raw.can || {}) }, stats: { ...base.stats, ...(raw.stats || {}) }, achievements: { ...base.achievements, ...(raw.achievements || {}) }, unlocked: Array.isArray(raw.unlocked) ? raw.unlocked : base.unlocked, version: VERSION };
    if (!Number.isFinite(merged.currentRunLeaves)) merged.currentRunLeaves = merged.lifetimeLeaves || 0;
    if (!Number.isFinite(merged.currentRunWater)) merged.currentRunWater = merged.lifetimeWater || 0;
    return merged;
  }

  function load() { try { return mergeSave(JSON.parse(localStorage.getItem(KEY) || "null")); } catch (_error) { return defaultSave(); } }
  function save(reason = "auto") { state.lastSavedAt = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(state)); hud.save.textContent = reason === "manual" ? "Zapisano ręcznie" : "Zapisano"; } catch (_error) { hud.save.textContent = "Błąd zapisu"; } }
  function queueSave(reason = "auto") { hud.save.textContent = "Zapisywanie…"; clearTimeout(saveTimer); saveTimer = setTimeout(() => save(reason), 250); }

  function hasUpgrade(id) { return Boolean(state.upgrades[id]); }
  function prestigeLevel(id) { return Number(state.prestige[id] || 0); }
  function unlockedZone(id) { return state.unlocked.includes(id); }
  function zoneById(id) { return ZONES.find((zone) => zone.id === id) || ZONES[0]; }
  function zoneName(id = state.zone) { return zoneById(id).name; }
  function plantById(id) { return PLANTS.find((plant) => plant.id === id); }
  function upgradeById(id) { return UPGRADES.find((upgrade) => upgrade.id === id); }
  function prestigeById(id) { return PRESTIGE_TREE.find((upgrade) => upgrade.id === id); }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return "0";
    const sign = value < 0 ? "-" : "";
    let amount = Math.abs(value);
    if (amount < 1000) return sign + (amount < 10 && amount % 1 ? amount.toFixed(1) : Math.floor(amount));
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    let index = 0;
    while (amount >= 1000 && index < suffixes.length - 1) { amount /= 1000; index += 1; }
    return sign + amount.toFixed(amount >= 100 ? 0 : amount >= 10 ? 1 : 2).replace(/\.0+$/, "") + suffixes[index];
  }

  function formatTime(seconds) {
    const value = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    if (hours) return `${hours}h ${minutes}m`;
    if (minutes) return `${minutes}m ${value % 60}s`;
    return `${value}s`;
  }

  function plantCost(id, amount = 1) { const plant = plantById(id); let owned = state.plants[id] || 0, total = 0; for (let index = 0; index < amount; index += 1) total += plant.cost * Math.pow(plant.grow, owned + index); return Math.floor(total); }
  function maxAffordablePlant(id) { let amount = 0, total = 0; while (amount < 1000 && plantCost(id, amount + 1) <= state.leaves) { amount += 1; total = plantCost(id, amount); } return { amount, cost: total }; }
  function milestoneMultiplier(owned) { let multiplier = 1; if (owned >= 10) multiplier *= 2; if (owned >= 25) multiplier *= 2; if (owned >= 50) multiplier *= 1.5; if (owned >= 100) multiplier *= 3; if (owned >= 200) multiplier *= 1.5; if (owned >= 300) multiplier *= 2; if (owned >= 500) multiplier *= 2; return multiplier; }
  function upgradeAvailable(upgrade) { if (upgrade.zone && !unlockedZone(upgrade.zone)) return false; return (upgrade.req || []).every(hasUpgrade); }
  function prestigeAvailable(upgrade) { return (upgrade.req || []).every((id) => prestigeLevel(id) > 0); }
  function prestigeCost(upgrade) { return Math.ceil(upgrade.cost * Math.pow(1.55, prestigeLevel(upgrade.id))); }

  function metrics() {
    let globalMultiplier = 1, clickMultiplier = 1, clickLps = 0, waterPerSecond = 0, offlineEfficiency = 0.25, offlineCap = 7200, canRegen = 0.006, harvestInterval = 0, autoClick = 0, goat = 0, delivery = 0, autobuy = 0;
    const plantMultipliers = {}, zoneMultipliers = {};
    for (const upgrade of UPGRADES) {
      if (!hasUpgrade(upgrade.id)) continue;
      const effect = upgrade.effect;
      if (effect.global) globalMultiplier *= effect.global;
      if (effect.click) clickMultiplier *= effect.click;
      if (effect.clickLps) clickLps += effect.clickLps;
      if (effect.wps) waterPerSecond += effect.wps;
      if (effect.off) offlineEfficiency += effect.off;
      if (effect.cap) offlineCap += effect.cap;
      if (effect.canRegen) canRegen += effect.canRegen;
      if (effect.harvest) harvestInterval = harvestInterval ? Math.min(harvestInterval, effect.harvest) : effect.harvest;
      if (effect.autoClick) autoClick += effect.autoClick;
      if (effect.goat) goat += effect.goat;
      if (effect.delivery) delivery += effect.delivery;
      if (effect.autobuy) autobuy += effect.autobuy;
      if (effect.plant) for (const [id, value] of Object.entries(effect.plant)) plantMultipliers[id] = (plantMultipliers[id] || 1) * value;
      if (effect.zoneMult) for (const [id, value] of Object.entries(effect.zoneMult)) zoneMultipliers[id] = (zoneMultipliers[id] || 1) * value;
    }
    globalMultiplier *= 1 + prestigeLevel("roots") * 0.25;
    globalMultiplier *= 1 + prestigeLevel("fastStart") * 0.08;
    waterPerSecond *= 1 + prestigeLevel("waterMemory") * 0.2;
    waterPerSecond += prestigeLevel("waterStart") * 0.2;
    canRegen += prestigeLevel("waterStart") * 0.015;
    offlineEfficiency += prestigeLevel("sleepy") * 0.1;
    offlineCap += prestigeLevel("deepSleep") * 7200;
    goat += prestigeLevel("goatWisdom") * 0.1;
    delivery += prestigeLevel("amic") ? 1 : 0;
    autobuy += prestigeLevel("smartRoots") ? 1 : 0;
    const now = Date.now();
    if (state.effects.fever > now) globalMultiplier *= 3;
    if (state.effects.watered > now) globalMultiplier *= 2;
    if (state.effects.pracu > now) globalMultiplier *= 4;
    if (state.effects.penalty > now) globalMultiplier *= 0.5;
    const perPlant = {};
    let leavesPerSecond = 0;
    for (const plant of PLANTS) {
      const owned = state.plants[plant.id] || 0;
      const production = owned * plant.prod * globalMultiplier * (plantMultipliers[plant.id] || 1) * (zoneMultipliers[plant.zone] || 1) * milestoneMultiplier(owned);
      perPlant[plant.id] = production;
      leavesPerSecond += production;
    }
    return { globalMultiplier, leavesPerSecond, waterPerSecond, clickPower: Math.max(1, clickMultiplier + leavesPerSecond * clickLps), harvestInterval, autoClick, goat: Math.min(0.98, goat), delivery, autobuy, offlineEfficiency: Math.min(1.75, offlineEfficiency), offlineCap, canRegen, perPlant };
  }

  function unlockZones() { let changed = false; for (const zone of ZONES) { const canUnlock = state.lifetimeLeaves >= zone.leaves && state.lifetimeWater >= zone.water && state.stats.prestiges >= zone.prestige; if (canUnlock && !unlockedZone(zone.id)) { state.unlocked.push(zone.id); log(`Odblokowano: ${zone.name}!`); changed = true; } } const best = state.unlocked[state.unlocked.length - 1] || "parapet"; if (best !== state.zone) { state.zone = best; changed = true; } if (changed) { dirty = true; queueSave("unlock"); } }
  function buyPlant(id, amount = 1) { if (amount === "max") amount = maxAffordablePlant(id).amount; const plant = plantById(id); if (!plant || !unlockedZone(plant.zone) || amount <= 0) return; const price = plantCost(id, amount); if (state.leaves < price) return log("Za mało liści."); state.leaves -= price; state.plants[id] = (state.plants[id] || 0) + amount; state.stats.buys += amount; pop(`+${amount} ${plant.name}`, 0.62, 0.37, plant.color); core?.play?.("leaf"); dirty = true; queueSave("plant"); }
  function buyUpgrade(id) { const upgrade = upgradeById(id); if (!upgrade || hasUpgrade(id) || !upgradeAvailable(upgrade)) return; if (state.leaves < upgrade.cost) return log("Za mało liści na ulepszenie."); state.leaves -= upgrade.cost; state.upgrades[id] = 1; state.stats.buys += 1; if (id === "wateringCan") state.can.max = Math.max(state.can.max, 3 + prestigeLevel("waterStart")); log(`Kupiono: ${upgrade.name}.`); core?.play?.("unlock"); dirty = true; queueSave("upgrade"); }
  function buyPrestigeUpgrade(id) { const upgrade = prestigeById(id); if (!upgrade || !prestigeAvailable(upgrade)) return; if (prestigeLevel(id) >= upgrade.max) return log("To ulepszenie jest już na maksymalnym poziomie."); const price = prestigeCost(upgrade); if (state.prestigeSeeds < price) return log("Za mało nasion prestiżu."); state.prestigeSeeds -= price; state.prestige[id] = prestigeLevel(id) + 1; log(`Stałe ulepszenie: ${upgrade.name} poz. ${prestigeLevel(id)}.`); core?.play?.("unlock"); dirty = true; queueSave("prestigeUpgrade"); }
  function addLeaves(amount) { state.leaves += amount; state.lifetimeLeaves += amount; state.currentRunLeaves += amount; }
  function addWater(amount) { state.water += amount; state.lifetimeWater += amount; state.currentRunWater += amount; }
  function manualClick(isManual = true) { const current = meter || metrics(); const gain = current.clickPower; addLeaves(gain); if (isManual) { state.stats.clicks += 1; core?.play?.("leaf"); } pulse = 1; pop(`+${formatNumber(gain)}`, 0.5, 0.42, "#3f8b5b"); burst(0.5, 0.46, 8, "#8fd36b"); dirty = true; }
  function waterPlants() { if (!hasUpgrade("wateringCan")) return log("Najpierw kup konewkę sowy."); if (state.can.charges < 1 && state.water < 10) return log("Konewka jest pusta."); if (state.can.charges >= 1) state.can.charges -= 1; else state.water -= 10; state.effects.watered = Date.now() + 45000; state.stats.watering += 1; pop("Podlane! x2", 0.5, 0.34, "#2784a5"); burst(0.52, 0.38, 24, "#55c7dd"); log("Sowa podlała rośliny konewką. Produkcja x2 przez 45 s."); core?.play?.("splash"); dirty = true; queueSave("water"); }

  function productionTick(delta) { meter = metrics(); const leaves = meter.leavesPerSecond * delta, water = meter.waterPerSecond * delta; addLeaves(leaves); addWater(water); state.stats.bestLps = Math.max(state.stats.bestLps, meter.leavesPerSecond); state.can.max = Math.max(3, 3 + prestigeLevel("waterStart")); state.can.progress += delta * meter.canRegen; while (state.can.progress >= 1 && state.can.charges < state.can.max) { state.can.progress -= 1; state.can.charges += 1; } unlockZones(); }
  function automationTick(delta) { const current = meter || metrics(); autoTimer += delta; if (current.autoClick) addLeaves(current.clickPower * current.autoClick * delta); if (current.harvestInterval && autoTimer >= current.harvestInterval) { const gain = current.leavesPerSecond * (5 + prestigeLevel("nightShift")); addLeaves(gain); pop(`Auto +${formatNumber(gain)}`, 0.58, 0.48, "#58a76a"); autoTimer = 0; } if ((current.autobuy || state.automation.autoBuy) && autoTimer < 0.1) autoBuyPlant(); if (current.goat) for (const event of events) if (event.type === "golden" && Math.random() < current.goat * delta * 0.35) collectEvent(event.id, true); if (current.delivery) for (const event of events) if (event.type === "delivery") collectEvent(event.id, true); }
  function autoBuyPlant() { let best = null; for (const plant of PLANTS) { if (!unlockedZone(plant.zone)) continue; const price = plantCost(plant.id, 1); if (price > state.leaves) continue; const value = plant.prod * milestoneMultiplier((state.plants[plant.id] || 0) + 1) / price; if (!best || value > best.value) best = { plant, value }; } if (best) buyPlant(best.plant.id, 1); }

  function spawnEvent(delta) { eventTimer += delta; const interval = Math.max(6, 20 / (1 + prestigeLevel("amic") * 0.15 + prestigeLevel("whaleEcho") * 0.08)); if (eventTimer < interval) return; eventTimer = 0; const roll = Math.random(); let type = roll < 0.43 ? "golden" : roll < 0.57 ? "rainbow" : roll < 0.72 && hasUpgrade("whalePool") ? "splash" : roll < 0.88 && unlockedZone("center") ? "delivery" : unlockedZone("plot") ? "goat" : "golden"; if ((meter || metrics()).leavesPerSecond > 1000000 && Math.random() < 0.12) type = "pracu"; if (events.some((event) => event.type === type) && type !== "golden") return; events.push({ id: `${type}_${Date.now()}_${Math.random().toString(16).slice(2)}`, type, end: Date.now() + (type === "delivery" || type === "pracu" ? 22000 : 9000), x: 0.2 + Math.random() * 0.6, y: 0.23 + Math.random() * 0.45 }); dirty = true; }
  function eventColor(type) { return { golden: "#f2c94c", rainbow: "#c477ff", splash: "#55c7dd", delivery: "#39a949", goat: "#8fd36b", pracu: "#ff5f82" }[type] || "#8fd36b"; }
  function eventIcon(type) { return { golden: "🍂", rainbow: "🌈", splash: "🐋", delivery: "🚚", goat: "🐐", pracu: "📱" }[type] || "✨"; }
  function collectEvent(id, autoCollect = false) { const event = events.find((item) => item.id === id); if (!event) return; const current = meter || metrics(); if (event.type === "golden") { const gain = Math.max(50, current.leavesPerSecond * 30) * (autoCollect ? 0.8 : 1); addLeaves(gain); state.stats.golden += 1; pop(`Złoty +${formatNumber(gain)}`, event.x, event.y, "#caa34a"); core?.play?.("combo"); } else if (event.type === "rainbow") { state.effects.fever = Date.now() + 20000; pop("Gorączka monster!", event.x, event.y, "#b45ad6"); core?.play?.("unlock"); } else if (event.type === "splash") { const water = Math.max(20, current.waterPerSecond * 60) * (1 + prestigeLevel("whaleEcho") * 0.2); const leaves = current.leavesPerSecond * 15; addWater(water); addLeaves(leaves); pop(`Plusk +${formatNumber(water)} wody`, event.x, event.y, "#2784a5"); core?.play?.("splash"); } else if (event.type === "delivery") { const leaves = current.leavesPerSecond * 120 + 1000; const water = Math.max(25, current.waterPerSecond * 120); addLeaves(leaves); addWater(water); state.stats.deliveries += 1; pop(`Amic +${formatNumber(leaves)}`, event.x, event.y, "#39a949"); core?.play?.("mission"); } else if (event.type === "goat") { state.effects.watered = Math.max(state.effects.watered, Date.now() + 30000); pop("Koza pomogła!", event.x, event.y, "#6c9f4a"); core?.play?.("goat"); } else if (event.type === "pracu") { state.effects.pracu = Date.now() + 60000; state.effects.penalty = Date.now() + 90000; pop("Pracu x4!", event.x, event.y, "#ff5f82"); core?.play?.("phone"); } burst(event.x, event.y, 18, eventColor(event.type)); events = events.filter((item) => item.id !== id); dirty = true; queueSave("event"); }

  function potentialPrestigeSeeds() { if (state.currentRunLeaves < 100000000) return 0; const base = Math.floor(Math.sqrt(state.currentRunLeaves / 10000000)); const bonus = 1 + prestigeLevel("seedMemory") * 0.08; return Math.max(0, Math.floor(base * bonus)); }
  function openPrestige() { const gain = potentialPrestigeSeeds(); if (gain <= 0) return log("Prestiż wymaga 100M liści w obecnym cyklu."); prestigeText.innerHTML = `Ten cykl wypracował <strong>${formatNumber(gain)}</strong> nasion prestiżu.<br><br>Resetujesz zwykłe rośliny, zwykłe ulepszenia, liście, wodę i aktywne eventy. Zachowujesz <strong>drzewko prestiżu</strong>, nasiona, osiągnięcia i statystyki lifetime. Nowy cykl zacznie się szybciej dzięki stałym ulepszeniom.`; prestigeModal.hidden = false; }
  function performPrestige() { const gain = potentialPrestigeSeeds(); if (gain <= 0) return; const keep = { prestigeSeeds: state.prestigeSeeds + gain, prestige: { ...state.prestige }, stats: { ...state.stats, prestiges: state.stats.prestiges + 1, totalPrestigeSeeds: (state.stats.totalPrestigeSeeds || 0) + gain }, achievements: { ...state.achievements }, lifetimeLeaves: state.lifetimeLeaves, lifetimeWater: state.lifetimeWater }; state = defaultSave(); state.prestigeSeeds = keep.prestigeSeeds; state.prestige = keep.prestige; state.stats = { ...state.stats, ...keep.stats }; state.achievements = keep.achievements; state.lifetimeLeaves = keep.lifetimeLeaves; state.lifetimeWater = keep.lifetimeWater; const fastStart = prestigeLevel("fastStart"); if (fastStart) { state.leaves = 25 * fastStart; state.plants.monstera = fastStart; state.plants.pilea = Math.max(0, fastStart - 2); } if (prestigeLevel("waterStart")) { state.upgrades.wateringCan = 1; state.can.max = 3 + prestigeLevel("waterStart"); state.can.charges = state.can.max; } events = []; prestigeModal.hidden = true; log(`Wielkie Przesadzanie! +${gain} nasion prestiżu.`); burst(0.5, 0.5, 80, "#d6a94a"); save("prestige"); dirty = true; }
  function applyOfflineProgress() { const elapsed = Math.max(0, (Date.now() - (state.lastSavedAt || Date.now())) / 1000); if (elapsed < 60) return; const current = metrics(); const used = Math.min(elapsed, current.offlineCap); const leaves = current.leavesPerSecond * used * current.offlineEfficiency; const water = current.waterPerSecond * used * Math.min(1, current.offlineEfficiency * 0.6); addLeaves(leaves); addWater(water); state.stats.offlineLeaves += leaves; state.stats.offlineWater += water; offlineText.innerHTML = `Sowa doglądała ogrodu przez <strong>${formatTime(elapsed)}</strong>.<br>Zebrano <strong>${formatNumber(leaves)}</strong> liści i <strong>${formatNumber(water)}</strong> wody.<br>Skuteczność offline: <strong>${Math.round(current.offlineEfficiency * 100)}%</strong>. Limit: <strong>${formatTime(current.offlineCap)}</strong>.`; offlineModal.hidden = false; save("offline"); }
  function checkAchievements() { const list = [["firstPlant", "Pierwszy listek", Object.values(state.plants).some(Boolean)], ["auto", "Nie klikam, samo rośnie", hasUpgrade("autoHarvestI")], ["goat", "Koza pracownik miesiąca", hasUpgrade("goatAssistant")], ["whale", "Humbak podlewacz", hasUpgrade("whalePool")], ["prestige", "Przesadzanie bez strachu", state.stats.prestiges > 0]]; for (const [id, label, ok] of list) if (ok && !state.achievements[id]) { state.achievements[id] = Date.now(); log(`Osiągnięcie: ${label}`); core?.play?.("mission"); } core?.recordStat?.("ogrodyLeaves", state.lifetimeLeaves, "max"); core?.recordStat?.("ogrodyGardenLevel", state.unlocked.length, "max"); }

  function render() { tabsNode.innerHTML = TABS.map(([id, label, icon]) => `<button type="button" data-tab="${id}" class="${tab === id ? "is-active" : ""}"><span>${icon}</span>${label}</button>`).join(""); if (tab === "plants") renderPlants(); else if (tab === "upgrades") renderUpgrades(); else if (tab === "automation") renderAutomation(); else if (tab === "prestige") renderPrestige(); else renderStats(); }
  function renderPlants() { const current = meter || metrics(); panel.innerHTML = `<div class="panel-intro"><strong>Rośliny produkują liście samodzielnie.</strong><span>Kupuj generatory, pilnuj progów i później pozwól automatyzacji działać za Ciebie.</span></div><div class="shop-grid">${PLANTS.map((plant) => { const isUnlocked = unlockedZone(plant.zone); const owned = state.plants[plant.id] || 0; const price = plantCost(plant.id); const max = maxAffordablePlant(plant.id); const next = [10, 25, 50, 100, 150, 200, 300, 500].find((value) => owned < value) || "max"; return `<article class="shop-card ${isUnlocked ? "" : "is-locked"}"><div class="card-title"><span>${plant.icon}</span><strong>${plant.name}</strong><em>${owned}</em></div><div class="mini-table"><span>Produkcja</span><strong>${formatNumber(current.perPlant[plant.id] || 0)}/s</strong><span>Koszt</span><strong>${formatNumber(price)}</strong><span>Próg</span><strong>${next}</strong></div><div class="button-row"><button data-buy-plant="${plant.id}" data-amount="1" ${!isUnlocked || state.leaves < price ? "disabled" : ""}>Kup 1</button><button data-buy-plant="${plant.id}" data-amount="10" ${!isUnlocked || state.leaves < plantCost(plant.id, 10) ? "disabled" : ""}>Kup 10</button><button data-buy-plant="${plant.id}" data-amount="max" ${!isUnlocked || max.amount < 1 ? "disabled" : ""}>Max</button></div></article>`; }).join("")}</div>`; }
  function renderUpgradeCard(upgrade) { const bought = hasUpgrade(upgrade.id), available = upgradeAvailable(upgrade); const missing = (upgrade.req || []).filter((id) => !hasUpgrade(id)).map((id) => upgradeById(id)?.name || id); const lockText = available ? "Dostępne" : missing.length ? `Wymaga: ${missing.join(", ")}` : `Wymaga: ${zoneName(upgrade.zone)}`; return `<article class="skill-node ${bought ? "is-bought" : ""} ${available ? "" : "is-locked"}"><div class="card-title"><span>${upgrade.icon}</span><strong>${upgrade.name}</strong></div><p>${upgrade.desc}</p><div class="mini-table"><span>Koszt</span><strong>${formatNumber(upgrade.cost)}</strong><span>Status</span><strong>${bought ? "Kupione" : lockText}</strong></div><button data-buy-upgrade="${upgrade.id}" ${bought || !available || state.leaves < upgrade.cost ? "disabled" : ""}>${bought ? "Kupione" : "Kup"}</button></article>`; }
  function renderUpgrades() { const groups = [["click", "Drzewko ręcznych zbiorów"], ["production", "Drzewko produkcji"], ["water", "Drzewko konewki i wody"], ["automation", "Drzewko automatyzacji cyklu"]]; panel.innerHTML = `<div class="panel-intro"><strong>Zwykłe drzewka rozwoju działają tylko w obecnym cyklu.</strong><span>Wielkie Przesadzanie resetuje te skille, ale stałe drzewko prestiżu zostaje.</span></div>${groups.map(([group, title]) => `<section class="upgrade-section"><h3>${title}</h3><div class="skill-tree">${UPGRADES.filter((upgrade) => upgrade.group === group).map(renderUpgradeCard).join("")}</div></section>`).join("")}`; }
  function renderAutomation() { const current = meter || metrics(); panel.innerHTML = `<div class="panel-intro"><strong>Automatyzacja to główna nagroda progresji.</strong><span>Ogród stopniowo przechodzi od clickera do idle management.</span></div><div class="data-table"><div><span>Auto-zbiory</span><strong>${current.harvestInterval ? `co ${current.harvestInterval}s` : "brak"}</strong></div><div><span>Auto-kliknięcia</span><strong>${formatNumber(current.autoClick)}/s</strong></div><div><span>Koza zbiera eventy</span><strong>${Math.round(current.goat * 100)}%</strong></div><div><span>Auto-dostawy</span><strong>${current.delivery ? "tak" : "nie"}</strong></div><div><span>Auto-buy roślin</span><strong>${current.autobuy || state.automation.autoBuy ? "aktywny" : "brak"}</strong></div></div><div class="button-row wide"><button data-toggle-autobuy ${!hasUpgrade("smartBuyerPlants") && !prestigeLevel("smartRoots") ? "disabled" : ""}>${state.automation.autoBuy ? "Wyłącz auto-buy" : "Włącz auto-buy"}</button><button data-save-manual>Zapisz teraz</button></div><div class="skill-tree">${UPGRADES.filter((upgrade) => upgrade.group === "automation").map(renderUpgradeCard).join("")}</div>`; }
  function renderPrestigeNode(upgrade) { const level = prestigeLevel(upgrade.id), available = prestigeAvailable(upgrade), maxed = level >= upgrade.max, price = prestigeCost(upgrade); const missing = (upgrade.req || []).filter((id) => prestigeLevel(id) <= 0).map((id) => prestigeById(id)?.name || id); return `<article class="prestige-node ${level ? "is-bought" : ""} ${available ? "" : "is-locked"}"><div class="card-title"><span>${upgrade.icon}</span><strong>${upgrade.name}</strong><em>${level}/${upgrade.max}</em></div><p>${upgrade.desc}</p><div class="mini-table"><span>Gałąź</span><strong>${upgrade.branch}</strong><span>Efekt</span><strong>${upgrade.effect}</strong><span>Koszt</span><strong>${maxed ? "max" : `${price} 🌰`}</strong><span>Status</span><strong>${available ? maxed ? "Maks." : "Dostępne" : `Wymaga: ${missing.join(", ")}`}</strong></div><button data-buy-prestige="${upgrade.id}" ${!available || maxed || state.prestigeSeeds < price ? "disabled" : ""}>${maxed ? "Maks." : "Kup stały poziom"}</button></article>`; }
  function renderPrestige() { const gain = potentialPrestigeSeeds(); const branches = [...new Set(PRESTIGE_TREE.map((upgrade) => upgrade.branch))]; panel.innerHTML = `<div class="panel-intro"><strong>Drzewko prestiżu zostaje na zawsze.</strong><span>Ten cykl da teraz ${formatNumber(gain)} nasion. Posiadasz ${formatNumber(state.prestigeSeeds)} nasion. Zwykłe drzewka rozwoju zostaną zresetowane po przesadzaniu.</span></div><button class="danger-action" data-open-prestige ${gain <= 0 ? "disabled" : ""}>Wielkie Przesadzanie</button>${branches.map((branch) => `<section class="upgrade-section"><h3>Gałąź: ${branch}</h3><div class="prestige-tree">${PRESTIGE_TREE.filter((upgrade) => upgrade.branch === branch).map(renderPrestigeNode).join("")}</div></section>`).join("")}`; }
  function renderStats() { const current = meter || metrics(); const achievements = [["Pierwszy listek", "firstPlant"], ["Nie klikam, samo rośnie", "auto"], ["Koza pracownik miesiąca", "goat"], ["Humbak podlewacz", "whale"], ["Przesadzanie bez strachu", "prestige"]].map(([label, id]) => `<div><span>${label}</span><strong>${state.achievements[id] ? "✅" : "—"}</strong></div>`).join(""); panel.innerHTML = `<div class="panel-intro"><strong>Statystyki ogrodu.</strong><span>Dane są w kompaktowych tabelach i mieszczą się na ekranie.</span></div><div class="data-table"><div><span>Liście lifetime</span><strong>${formatNumber(state.lifetimeLeaves)}</strong></div><div><span>Liście cyklu</span><strong>${formatNumber(state.currentRunLeaves)}</strong></div><div><span>Woda lifetime</span><strong>${formatNumber(state.lifetimeWater)}</strong></div><div><span>Najlepsze LPS</span><strong>${formatNumber(state.stats.bestLps)}/s</strong></div><div><span>Kliknięcia ręczne</span><strong>${formatNumber(state.stats.clicks)}</strong></div><div><span>Offline liście</span><strong>${formatNumber(state.stats.offlineLeaves)}</strong></div><div><span>Podlania konewką</span><strong>${formatNumber(state.stats.watering)}</strong></div><div><span>Prestiże</span><strong>${formatNumber(state.stats.prestiges)}</strong></div><div><span>Nasiona łącznie</span><strong>${formatNumber(state.stats.totalPrestigeSeeds || 0)}</strong></div><div><span>Potencjał prestiżu</span><strong>${formatNumber(potentialPrestigeSeeds())}</strong></div><div><span>Offline limit</span><strong>${formatTime(current.offlineCap)}</strong></div></div><h3>Osiągnięcia</h3><div class="data-table">${achievements}</div>`; }
  function renderHud() { const current = meter || metrics(); hud.leaves.textContent = formatNumber(state.leaves); hud.lps.textContent = `${formatNumber(current.leavesPerSecond)}/s`; hud.water.textContent = formatNumber(state.water); hud.wps.textContent = `${formatNumber(current.waterPerSecond)}/s`; hud.zone.textContent = zoneName(); waterButton.querySelector("strong").textContent = `Podlej (${Math.floor(state.can.charges)}/${state.can.max})`; waterButton.disabled = !hasUpgrade("wateringCan") || (state.can.charges < 1 && state.water < 10); prestigeButton.hidden = potentialPrestigeSeeds() <= 0; }

  function bindEvents() { tabsNode.addEventListener("click", (event) => { const button = event.target.closest("[data-tab]"); if (!button) return; tab = button.dataset.tab; dirty = true; }); panel.addEventListener("click", (event) => { const plantButton = event.target.closest("[data-buy-plant]"); if (plantButton) return buyPlant(plantButton.dataset.buyPlant, plantButton.dataset.amount === "max" ? "max" : Number(plantButton.dataset.amount)); const upgradeButton = event.target.closest("[data-buy-upgrade]"); if (upgradeButton) return buyUpgrade(upgradeButton.dataset.buyUpgrade); const prestigeUpgradeButton = event.target.closest("[data-buy-prestige]"); if (prestigeUpgradeButton) return buyPrestigeUpgrade(prestigeUpgradeButton.dataset.buyPrestige); if (event.target.closest("[data-open-prestige]")) return openPrestige(); if (event.target.closest("[data-toggle-autobuy]")) { state.automation.autoBuy = !state.automation.autoBuy; dirty = true; queueSave("autobuy"); } if (event.target.closest("[data-save-manual]")) save("manual"); }); $("clickButton").addEventListener("click", () => manualClick(true)); waterButton.addEventListener("click", waterPlants); prestigeButton.addEventListener("click", openPrestige); $("offlineClose").addEventListener("click", () => { offlineModal.hidden = true; }); $("prestigeCancel").addEventListener("click", () => { prestigeModal.hidden = true; }); $("prestigeConfirm").addEventListener("click", performPrestige); canvas.addEventListener("pointerdown", (event) => { const rect = canvas.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width; const y = (event.clientY - rect.top) / rect.height; const activeEvent = events.find((item) => Math.abs(item.x - x) < 0.12 && Math.abs(item.y - y) < 0.13); if (activeEvent) collectEvent(activeEvent.id); else manualClick(true); }, { passive: true }); document.addEventListener("visibilitychange", () => { if (document.hidden) save("hidden"); }); window.addEventListener("pagehide", () => save("pagehide")); window.addEventListener("resize", resizeCanvas); }
  function log(text) { logNode.textContent = text; core?.toast?.(text); }
  function pop(text, x, y, color) { texts.push({ text, x, y, color, life: 1.1, age: 0 }); }
  function burst(x, y, amount, color) { const count = core?.settings?.().reducedEffects ? Math.ceil(amount / 3) : amount; for (let index = 0; index < count; index += 1) particles.push({ x, y, vx: (Math.random() - 0.5) * 0.18, vy: -0.05 - Math.random() * 0.18, age: 0, life: 0.7 + Math.random() * 0.5, color }); }
  function resizeCanvas() { const scale = Math.min(2, window.devicePixelRatio || 1); const rect = canvas.getBoundingClientRect(); canvas.width = Math.max(480, Math.floor(rect.width * scale)); canvas.height = Math.max(320, Math.floor(rect.height * scale)); ctx.setTransform(scale, 0, 0, scale, 0, 0); }
  function roundedRect(x, y, w, h, r, fill = true) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); if (fill) ctx.fill(); else ctx.stroke(); }
  function draw() { const w = canvas.clientWidth, h = canvas.clientHeight; ctx.clearRect(0, 0, w, h); drawBackground(w, h); drawGarden(w, h); drawEvents(w, h); drawEffects(w, h); drawBadges(w, h); }
  function drawBackground(w, h) { const greenhouse = ["greenhouse", "center", "arboretum"].includes(state.zone); const gradient = ctx.createLinearGradient(0, 0, 0, h); gradient.addColorStop(0, greenhouse ? "#dfffee" : "#fff4fa"); gradient.addColorStop(0.55, state.zone === "pool" ? "#bfe7ff" : greenhouse ? "#b9efd3" : "#dff6ff"); gradient.addColorStop(1, "#e7ffe6"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h); if (greenhouse) drawGreenhouse(w, h); else if (state.zone === "balcony") drawBalcony(w, h); else if (["plot", "pool"].includes(state.zone)) drawPlot(w, h); else drawWindow(w, h); }
  function drawWindow(w, h) { ctx.fillStyle = "rgba(255,255,255,.72)"; roundedRect(w * 0.15, h * 0.08, w * 0.7, h * 0.42, 28); ctx.strokeStyle = "rgba(86,120,150,.28)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.09); ctx.lineTo(w * 0.5, h * 0.5); ctx.moveTo(w * 0.16, h * 0.3); ctx.lineTo(w * 0.84, h * 0.3); ctx.stroke(); ctx.fillStyle = "#f4d7a0"; roundedRect(w * 0.08, h * 0.58, w * 0.84, h * 0.13, 18); }
  function drawBalcony(w, h) { ctx.fillStyle = "rgba(255,255,255,.55)"; for (let index = 0; index < 6; index += 1) roundedRect(index * w / 5 - 20, h * 0.12, 80, 120, 10); ctx.fillStyle = "#cad6e5"; roundedRect(w * 0.05, h * 0.55, w * 0.9, h * 0.18, 18); ctx.strokeStyle = "rgba(66,82,100,.45)"; ctx.lineWidth = 3; for (let x = w * 0.09; x < w * 0.93; x += 42) { ctx.beginPath(); ctx.moveTo(x, h * 0.54); ctx.lineTo(x, h * 0.74); ctx.stroke(); } }
  function drawPlot(w, h) { ctx.fillStyle = "#a0d47b"; roundedRect(w * 0.05, h * 0.42, w * 0.9, h * 0.28, 26); ctx.fillStyle = "#cda974"; roundedRect(w * 0.08, h * 0.62, w * 0.84, h * 0.18, 22); if (unlockedZone("pool")) drawPool(w, h); }
  function drawGreenhouse(w, h) { ctx.fillStyle = "rgba(255,255,255,.48)"; roundedRect(w * 0.08, h * 0.09, w * 0.84, h * 0.56, 34); ctx.strokeStyle = "rgba(78,130,105,.42)"; ctx.lineWidth = 3; for (let x = w * 0.15; x <= w * 0.85; x += w * 0.14) { ctx.beginPath(); ctx.moveTo(x, h * 0.12); ctx.lineTo(x, h * 0.66); ctx.stroke(); } for (let y = h * 0.22; y <= h * 0.6; y += h * 0.12) { ctx.beginPath(); ctx.moveTo(w * 0.1, y); ctx.lineTo(w * 0.9, y); ctx.stroke(); } ctx.fillStyle = "rgba(160,212,123,.58)"; roundedRect(w * 0.05, h * 0.55, w * 0.9, h * 0.22, 24); }
  function drawPool(w, h) { ctx.fillStyle = "#7aaed4"; ctx.beginPath(); ctx.ellipse(w * 0.78, h * 0.58, w * 0.12, h * 0.055, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#66d1e7"; ctx.beginPath(); ctx.ellipse(w * 0.78, h * 0.57, w * 0.105, h * 0.042, 0, 0, Math.PI * 2); ctx.fill(); }
  function drawGarden(w, h) { PLANTS.filter((plant) => state.plants[plant.id] > 0).forEach((plant, index) => drawPlant(w * (0.18 + (index % 6) * 0.115), h * 0.62 - Math.floor(index / 6) * 48, Math.min(1.8, 0.7 + Math.log10((state.plants[plant.id] || 0) + 1) * 0.45), plant)); if (unlockedZone("plot")) drawGoat(w, h); if (hasUpgrade("whalePool")) drawWhale(w, h); if (unlockedZone("center")) drawTruck(w, h); drawOwl(w, h); }
  function drawPlant(x, y, scale, plant) { const owned = state.plants[plant.id] || 0; ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.fillStyle = "#b87b4c"; roundedRect(-17, 16, 34, 24, 7); ctx.fillStyle = plant.color; for (let index = 0; index < Math.min(8, 3 + Math.floor(Math.log10(owned + 1) * 4)); index += 1) { ctx.save(); ctx.rotate((index - 3) * 0.27); ctx.beginPath(); ctx.ellipse(0, -6 - index * 4, 7, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.font = "12px system-ui"; ctx.textAlign = "center"; ctx.fillText(plant.icon, 0, 36); ctx.restore(); }
  function drawOwl(w, h) { const x = w * 0.5, y = h * 0.45 + pulse * 6, hat = ["greenhouse", "center", "arboretum"].includes(state.zone); ctx.save(); ctx.translate(x, y); ctx.fillStyle = "#8d6e63"; ctx.beginPath(); ctx.ellipse(0, 12, 42, 54, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#f2d09b"; ctx.beginPath(); ctx.ellipse(0, 18, 27, 35, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-15, -8, 13, 0, Math.PI * 2); ctx.arc(15, -8, 13, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#2b2733"; ctx.beginPath(); ctx.arc(-15, -8, 5, 0, Math.PI * 2); ctx.arc(15, -8, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#ffd65a"; ctx.beginPath(); ctx.moveTo(0, 3); ctx.lineTo(-8, 13); ctx.lineTo(8, 13); ctx.fill(); if (hat) drawStrawHat(); else core?.drawCanvasCosmetic?.(ctx, 0, -42, 0.72, 0); ctx.restore(); pulse = Math.max(0, pulse - 0.08); }
  function drawStrawHat() { ctx.fillStyle = "#e7c46b"; ctx.beginPath(); ctx.ellipse(0, -43, 48, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-24, -63, 48, 20); ctx.beginPath(); ctx.ellipse(0, -63, 24, 9, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = "#7fbf62"; ctx.fillRect(-26, -49, 52, 6); }
  function drawGoat(w, h) { ctx.save(); ctx.translate(w * 0.2, h * 0.58); ctx.fillStyle = "#fff6e8"; roundedRect(-28, -18, 56, 35, 16); ctx.fillStyle = "#f6e7d1"; roundedRect(20, -36, 28, 28, 12); ctx.fillStyle = "#2b2733"; ctx.beginPath(); ctx.arc(31, -25, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  function drawWhale(w, h) { ctx.save(); ctx.translate(w * 0.79, h * 0.55); ctx.fillStyle = "#508cc0"; ctx.beginPath(); ctx.ellipse(0, -12, 54, 25, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#e4f8ff"; ctx.beginPath(); ctx.ellipse(5, -4, 35, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#2b2733"; ctx.beginPath(); ctx.arc(-22, -19, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  function drawTruck(w, h) { ctx.save(); ctx.translate(w * 0.82, h * 0.72); ctx.fillStyle = "#f9fbf8"; roundedRect(-50, -32, 82, 40, 8); ctx.fillStyle = "#39a949"; ctx.fillRect(-50, -6, 82, 10); ctx.fillStyle = "#d62f3d"; ctx.font = "bold 13px sans-serif"; ctx.fillText("amic", -38, -13); ctx.fillStyle = "#2b2733"; ctx.beginPath(); ctx.arc(-30, 12, 9, 0, Math.PI * 2); ctx.arc(18, 12, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  function drawEvents(w, h) { for (const event of events) { const scale = 1 + Math.sin(performance.now() / 180) * 0.08; ctx.save(); ctx.translate(event.x * w, event.y * h); ctx.scale(scale, scale); ctx.fillStyle = eventColor(event.type); ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "22px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(eventIcon(event.type), 0, 1); ctx.restore(); } }
  function drawEffects(w, h) { for (const particle of particles) { particle.age += 0.016; particle.x += particle.vx; particle.y += particle.vy; particle.vy += 0.004; ctx.globalAlpha = Math.max(0, 1 - particle.age / particle.life); ctx.fillStyle = particle.color; ctx.beginPath(); ctx.arc(particle.x * w, particle.y * h, 4, 0, Math.PI * 2); ctx.fill(); } particles = particles.filter((particle) => particle.age < particle.life); for (const text of texts) { text.age += 0.016; ctx.globalAlpha = Math.max(0, 1 - text.age / text.life); ctx.fillStyle = text.color; ctx.font = "900 18px system-ui"; ctx.textAlign = "center"; ctx.fillText(text.text, text.x * w, (text.y - text.age * 0.08) * h); } texts = texts.filter((text) => text.age < text.life); ctx.globalAlpha = 1; }
  function drawBadges(w, _h) { const now = Date.now(); const badges = []; if (state.effects.fever > now) badges.push(["🌈 Gorączka monster", "#b45ad6"]); if (state.effects.watered > now) badges.push(["🚿 Podlane x2", "#2784a5"]); if (state.effects.pracu > now) badges.push(["📱 Pracu x4", "#ff5f82"]); badges.forEach(([label, color], index) => { ctx.fillStyle = "rgba(255,255,255,.86)"; roundedRect(14, 14 + index * 38, Math.min(190, w - 28), 30, 15); ctx.fillStyle = color; ctx.font = "800 13px system-ui"; ctx.textAlign = "left"; ctx.fillText(label, 26, 34 + index * 38); }); }

  function step(now) { const delta = Math.min(0.08, (now - last) / 1000 || 0); last = now; if (!paused) { hudTimer += delta; productionTick(delta); automationTick(delta); spawnEvent(delta); events = events.filter((event) => event.end > Date.now()); checkAchievements(); if (hudTimer > 0.25) { renderHud(); hudTimer = 0; } if (dirty) { render(); dirty = false; } } draw(); core?.setDebugData?.({ leaves: formatNumber(state.leaves), lps: `${formatNumber((meter || metrics()).leavesPerSecond)}/s`, water: formatNumber(state.water), zone: state.zone, events: events.length, prestige: potentialPrestigeSeeds() }); requestAnimationFrame(step); }
  function init() { resizeCanvas(); bindEvents(); render(); renderHud(); applyOfflineProgress(); unlockZones(); log("Sowie Ogrody gotowe. Klikaj, sadź, podlewaj i automatyzuj!"); core?.registerGame?.({ getPaused: () => paused, setPaused: (value) => { paused = Boolean(value); }, musicTheme: () => state.zone === "greenhouse" ? "flowers" : "market" }); setInterval(() => queueSave("interval"), 5000); requestAnimationFrame(step); }

  init();
})();
