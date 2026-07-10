(() => {
  "use strict";

  const GUIDES = Object.freeze({
    runner: {
      title: "SowaRunner",
      summary: "Biegnij jak najdalej, omijaj przeszkody i zbieraj liście. Tempo stale rośnie, więc liczą się rytm, obserwacja trasy i rozsądne używanie podwójnego skoku.",
      goal: "Zdobywaj punkty, bij rekord dystansu i kończ długie biegi z jak najmniejszą liczbą obrażeń.",
      controls: [
        "Kliknięcie, dotknięcie ekranu lub Spacja wykonują skok.",
        "Drugi skok można wykonać w powietrzu.",
        "Na ekranie tytułowym ten sam przycisk rozpoczyna bieg.",
      ],
      tips: [
        "Nie zużywaj drugiego skoku zbyt wcześnie — zachowaj go do korekty.",
        "Liście zwiększają serię i dają dodatkowe premie punktowe.",
        "Humbak uruchamia krótką minigrę bonusową.",
      ],
    },
    jumper: {
      title: "SowaJumper",
      summary: "Automatycznie odbijająca się sowa wspina się po platformach. Ty sterujesz wyłącznie ruchem poziomym i wybierasz najbezpieczniejszą drogę ku górze.",
      goal: "Wznieś się jak najwyżej, zbieraj liście i buduj serię precyzyjnych lądowań.",
      controls: [
        "←/→ lub A/D przesuwają sowę.",
        "Na ekranie dotykowym przytrzymaj lewą albo prawą połowę ekranu.",
        "Spacja lub tap na ekranie tytułowym rozpoczynają grę.",
      ],
      tips: [
        "Sowa przechodzi przez boczną krawędź i wraca z drugiej strony.",
        "Lądowanie blisko środka platformy podtrzymuje serię precyzji.",
        "Platformy Amic wybijają znacznie wyżej, a kruche rozpadają się po użyciu.",
      ],
    },
    sowa3: {
      title: "Sowa3",
      summary: "Trzytorowy runner, w którym sowa pędzi przez kolejne plansze. Zmieniaj tor, zbieraj liście i unikaj obiektów nadciągających z głębi ekranu.",
      goal: "Ukończ wszystkie plansze, osiągnij wysoki wynik i utrzymaj jak najdłuższe combo liści.",
      controls: [
        "←/→ albo A/D zmieniają tor.",
        "Na telefonie przesuń palcem w lewo lub prawo.",
        "Możesz także dotknąć lewej albo prawej części ekranu.",
      ],
      tips: [
        "Obserwuj horyzont, a nie samą sowę — daje to więcej czasu na reakcję.",
        "Kolejne liście bez kolizji zwiększają combo i premię punktową.",
        "Każda plansza ma własne przeszkody i rytm.",
      ],
    },
    ogrody: {
      title: "Sowie Ogrody",
      summary: "Gra idle/incremental o rozwijaniu ogrodu. Zbieraj liście, kupuj rośliny, odblokowuj strefy, podlewaj i stopniowo automatyzuj produkcję.",
      goal: "Zbuduj coraz wydajniejszy ogród, wykonuj kontrakty i przeprowadzaj Wielkie Przesadzanie, aby zdobywać trwałe premie.",
      controls: [
        "Przycisk „Zbierz liście” daje natychmiastowy dochód.",
        "Zakładki po prawej służą do kupowania roślin, ulepszeń, automatyzacji i prestiżu.",
        "Przycisk z gwiazdką otwiera kontrakty ogrodnicze.",
      ],
      tips: [
        "Najpierw kupuj rośliny z najlepszym stosunkiem produkcji do ceny.",
        "Podlewanie czasowo wzmacnia ogród.",
        "Gra zapisuje się automatycznie i nalicza część produkcji offline.",
      ],
    },
    szklarnia: {
      title: "Sowia Szklarnia",
      summary: "Botaniczna gra idle o budowaniu pomieszczeń, sadzeniu roślin, badaniach i tworzeniu hybryd. Kozy próbują podjadać kolekcję, więc trzeba je regularnie przeganiać.",
      goal: "Rozbuduj szklarnię, odkryj hybrydy, skompletuj album cech i utrzymuj wysoką radość sowy.",
      controls: [
        "Zakładki służą do budowy, sadzenia, krzyżowania, badań i zarządzania kozami.",
        "„Podlej wszystko” wzmacnia rośliny, jeśli masz wystarczająco dużo wody.",
        "„SIO! SIO!” przegania aktywną kozę i może dać nagrodę.",
      ],
      tips: [
        "Rozwijaj produkcję wody i nasion równolegle z liśćmi.",
        "Dojrzałe rośliny są potrzebne do krzyżowania.",
        "Przycisk z gwiazdką pokazuje cele laboratorium i odkryte cechy.",
      ],
    },
  });

  let modal = null;
  let previousFocus = null;

  function detectGameId() {
    const path = location.pathname.toLowerCase();
    if (path.includes("sowarunner")) return "runner";
    if (path.includes("sowajumper")) return "jumper";
    if (path.includes("sowa3")) return "sowa3";
    if (path.includes("sowieogrody")) return "ogrody";
    if (path.includes("sowiaszklarnia")) return "szklarnia";
    return null;
  }

  function getDock() {
    let dock = document.querySelector(".sowie-tool-dock");
    if (!dock) {
      dock = document.createElement("div");
      dock.className = "sowie-tool-dock";
      dock.setAttribute("aria-label", "Narzędzia gry");
      document.body.appendChild(dock);
    }
    return dock;
  }

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("section");
    modal.className = "sowie-modal-backdrop";
    modal.hidden = true;
    modal.innerHTML = `
      <article class="sowie-modal-card" role="dialog" aria-modal="true" aria-labelledby="sowieGuideTitle">
        <h2 id="sowieGuideTitle"></h2>
        <p class="sowie-guide-summary" data-guide-summary></p>
        <h3>Cel gry</h3>
        <p data-guide-goal></p>
        <h3>Jak grać</h3>
        <ol data-guide-controls></ol>
        <h3>Wskazówki</h3>
        <ul data-guide-tips></ul>
        <div class="sowie-modal-actions"><button type="button" data-guide-close>Rozumiem</button></div>
      </article>`;
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-guide-close]")) close();
    });
    modal.addEventListener("keydown", trapFocus);
    document.body.appendChild(modal);
    return modal;
  }

  function renderList(node, items) {
    node.replaceChildren(...items.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    }));
  }

  function open(gameId, trigger = document.activeElement) {
    const guide = GUIDES[gameId];
    if (!guide) return false;
    const node = ensureModal();
    previousFocus = trigger instanceof HTMLElement ? trigger : null;
    node.querySelector("#sowieGuideTitle").textContent = `Instrukcja — ${guide.title}`;
    node.querySelector("[data-guide-summary]").textContent = guide.summary;
    node.querySelector("[data-guide-goal]").textContent = guide.goal;
    renderList(node.querySelector("[data-guide-controls]"), guide.controls);
    renderList(node.querySelector("[data-guide-tips]"), guide.tips);
    node.hidden = false;
    document.body.classList.add("sowie-modal-open");
    node.querySelector("[data-guide-close]").focus();
    return true;
  }

  function close() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("sowie-modal-open");
    previousFocus?.focus?.();
    previousFocus = null;
  }

  function trapFocus(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")]
      .filter((element) => !element.disabled && !element.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function attachGameButton() {
    const gameId = detectGameId();
    if (!gameId || document.querySelector("[data-game-guide-fab]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sowie-tool-button";
    button.dataset.gameGuideFab = gameId;
    button.dataset.gameGuide = gameId;
    button.title = "Instrukcja gry";
    button.setAttribute("aria-label", `Instrukcja gry ${GUIDES[gameId].title}`);
    button.textContent = "❓";
    getDock().appendChild(button);
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-game-guide]");
    if (!trigger) return;
    event.preventDefault();
    open(trigger.dataset.gameGuide, trigger);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attachGameButton, { once: true });
  else attachGameButton();

  window.SowieGameGuides = Object.freeze({ GUIDES, open, close, detectGameId, getDock });
})();
