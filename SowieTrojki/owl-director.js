// Sowie Trójki — reżyser reakcji Sówki (Analiza 5, rozdz. 8): czysta logika bez rysowania. Dostaje zdarzenia gry
// (ruch z combo i mocami, zła zamiana, mieszanie, mało ruchów, cel, jajko, prezent, wygrana, przegrana, bezczynność,
// stuknięcie w Sówkę, start poziomu) i zwraca polecenie: `{ reaction, level, duration, priority, sound, bubble, eyes,
// effects }`. Zasady (8.1): zawsze życzliwa; radość rośnie z combo; ważniejsza reakcja przerywa słabszą, słabsza nie
// przerywa ważniejszej; dymek najwyżej raz na 2 s i nie ten sam dwa razy z rzędu; ciche „hu!” najwyżej co 1,5 s;
// przy ograniczeniu ruchu bez salta i lotu; przy wyłączonych komentarzach bez dymków.

// Skala radości (8.2): poziom → reakcja.
export const JOY_REACTIONS = Object.freeze({
  1: { reaction: "hop", duration: 0.45, priority: 1, sound: "hu", effects: "leaves", bubbles: [] },
  2: {
    reaction: "wings",
    duration: 0.8,
    priority: 2,
    sound: "huhu",
    effects: "sparkles",
    bubbles: ["Ładnie!", "Brawo!"],
  },
  3: {
    reaction: "double",
    duration: 1,
    priority: 3,
    sound: "huhuhu",
    effects: "hearts",
    bubbles: ["Super!", "Ale combo!"],
  },
  4: {
    reaction: "salto",
    duration: 1.2,
    priority: 4,
    sound: "trel",
    effects: "stars",
    eyes: "stars",
    bubbles: ["Ekstra!", "Sowiście!"],
  },
  5: {
    reaction: "fly",
    duration: 1.8,
    priority: 5,
    sound: "hura",
    effects: "confetti",
    eyes: "stars",
    bubbles: ["Hu-hu-hura!", "Niesamowite!"],
  },
});

// Pozostałe reakcje (8.3).
export const OTHER_REACTIONS = Object.freeze({
  invalid: { reaction: "tilt", duration: 0.7, priority: 1, bubbles: ["Hm?"] },
  shuffle: { reaction: "spin", duration: 0.9, priority: 3, bubbles: ["Pomieszam!"] },
  lowMoves: { reaction: "worried", duration: 1.4, priority: 3, bubbles: ["Ojej, mało ruchów!"], sound: "ojej" },
  half: { reaction: "lean", duration: 1, priority: 2, bubbles: ["Jeszcze trochę!"] },
  goal: { reaction: "thumbs", duration: 1, priority: 3, bubbles: ["Jest!"], sound: "huhu" },
  egg: { reaction: "hug", duration: 1.4, priority: 4, eyes: "hearts", effects: "hearts", bubbles: ["Moje pisklątko!"] },
  gift: { reaction: "gift", duration: 1.6, priority: 5, bubbles: ["Prawie! Masz ode mnie 3 ruchy!"], sound: "huhu" },
  cozy: {
    reaction: "gift",
    duration: 1.4,
    priority: 5,
    bubbles: ["Dokładam 5 ruchów — graj spokojnie!"],
    sound: "huhu",
  },
  finale: { reaction: "clap", duration: 1.2, priority: 4, bubbles: ["Humbaczy Finał!"], effects: "drops" },
  win: {
    reaction: "dance",
    duration: 2.2,
    priority: 6,
    effects: "confetti",
    bubbles: ["Brawo! Udało się!"],
    sound: "hura",
  },
  winThree: {
    reaction: "dance",
    duration: 2.4,
    priority: 6,
    eyes: "stars",
    effects: "confetti",
    bubbles: ["Trzy gwiazdki!"],
    sound: "hura",
  },
  lose: {
    reaction: "sad",
    duration: 1.6,
    priority: 6,
    eyes: "sad",
    bubbles: ["Spróbujmy jeszcze raz! Hu-hu!"],
    sound: "ojej",
  },
  think: { reaction: "think", duration: 1.6, priority: 1, bubbles: [] },
  sleep: { reaction: "sleep", duration: 600, priority: 0.5, bubbles: [], sound: "chrr" },
  giggle: { reaction: "spin", duration: 0.8, priority: 2, bubbles: ["Hi-hi!"], sound: "chichot" },
  help: { reaction: "fly", duration: 1.6, priority: 6, eyes: "stars", bubbles: ["Lecę z pomocą!"], sound: "hura" },
  helpReady: { reaction: "wings", duration: 1, priority: 3, bubbles: ["Mogę pomóc!"], effects: "sparkles" },
  start: { reaction: "wave", duration: 1.4, priority: 2, bubbles: [], sound: "huhu" },
});

/** Poziom radości ruchu (0–5) według combo, mocy i celu (rozdz. 8.2). */
export function joyLevel(move) {
  const combo = move.combo || 0;
  const created = move.created || [];
  const swap = move.comboSwap || "";
  let level = combo >= 1 || move.cleared > 0 ? 1 : 0;
  if (combo >= 2 || created.length) level = Math.max(level, 2);
  if (combo >= 3 || created.includes("babel") || move.goalsDone?.length) level = Math.max(level, 3);
  if (combo >= 4 || created.includes("teczowy") || swap) level = Math.max(level, 4);
  if (combo >= 6 || swap === "teczowy+teczowy" || swap === "babel+babel") level = 5;
  return level;
}

/**
 * createOwlDirector({ quips, reducedMotion, random }) → `handle(zdarzenie, czas)` → polecenie albo null,
 * `current(czas)` — trwająca reakcja (albo spokój), `last()` — ostatnie polecenie (testy).
 */
export function createOwlDirector({ quips = () => true, reducedMotion = () => false, random = Math.random } = {}) {
  let active = null;
  let lastBubbleAt = -Infinity;
  let lastBubble = "";
  let lastHuAt = -Infinity;
  let invalidCount = 0;
  let last = null;

  function pickBubble(options, time) {
    if (!quips() || !options.length || time - lastBubbleAt < 2) return null;
    const pool = options.length > 1 ? options.filter((text) => text !== lastBubble) : options;
    const text = pool[Math.floor(random() * pool.length)] || null;
    if (text) {
      lastBubble = text;
      lastBubbleAt = time;
    }
    return text;
  }

  function command(base, time, extra = {}) {
    let reaction = base.reaction;
    let effects = base.effects || null;
    if (reducedMotion()) {
      // Bez salta, lotu, wstrząsów i deszczu konfetti — oczy, mały podskok i dymek.
      if (reaction === "salto" || reaction === "fly") reaction = "wings";
      if (effects === "confetti") effects = "sparkles";
    }
    let sound = base.sound || null;
    if (sound === "hu") {
      if (time - lastHuAt < 1.5) sound = null;
      else lastHuAt = time;
    }
    const result = {
      reaction,
      level: extra.level ?? 0,
      duration: base.duration,
      priority: base.priority,
      sound,
      bubble: extra.bubble === undefined ? pickBubble(base.bubbles || [], time) : extra.bubble,
      eyes: base.eyes || null,
      effects,
      at: time,
    };
    return result;
  }

  // Ważniejsza reakcja przerywa słabszą; słabsza czeka (pomijana), dopóki ważniejsza trwa.
  function offer(result, time) {
    if (active && time < active.at + active.duration && active.priority > result.priority) return null;
    active = result;
    last = result;
    return result;
  }

  return {
    handle(event, time) {
      switch (event.type) {
        case "move":
        case "help": {
          if (event.type === "help") return offer(command(OTHER_REACTIONS.help, time), time);
          const level = joyLevel(event);
          if (!level) return null;
          const base = JOY_REACTIONS[level];
          const result = offer(command(base, time, { level }), time);
          return result;
        }
        case "invalid":
          invalidCount += 1;
          // „Hm?” raz na kilka prób, nie za każdym razem.
          if (invalidCount % 3 !== 1) return null;
          return offer(command(OTHER_REACTIONS.invalid, time), time);
        case "win":
          return null;
        case "won":
          return offer(command(event.stars >= 3 ? OTHER_REACTIONS.winThree : OTHER_REACTIONS.win, time), time);
        case "lose":
          return offer(command(OTHER_REACTIONS.lose, time), time);
        case "start":
          return offer(command(OTHER_REACTIONS.start, time, { bubble: quips() ? event.text || null : null }), time);
        default: {
          const base = OTHER_REACTIONS[event.type];
          return base ? offer(command(base, time), time) : null;
        }
      }
    },
    /** Trwająca reakcja w chwili `time` (albo null — spokój: oddech, mruganie, wodzenie wzrokiem). */
    current(time) {
      if (active && time >= active.at + active.duration) active = null;
      return active;
    },
    /** Koniec reakcji teraz (np. obudzenie ze snu stuknięciem). */
    stop() {
      active = null;
    },
    last: () => last,
  };
}
