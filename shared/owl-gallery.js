(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src;
  const KEY = "sowieOwlGallery";
  const VERSION = 1;

  const PHOTOS = Object.freeze([
    {
      id: "owl-01",
      file: "sowa-01-puchata.jpg",
      title: "Puchata obserwatorka",
      alt: "Puchata sowa patrząca prosto w obiektyw.",
      photographer: "tkirkgoz",
      sourceUrl: "https://www.pexels.com/photo/13681325/",
      requirement: "Prezent powitalny — dostępna od początku.",
      unlockedBy: () => true,
    },
    {
      id: "owl-02",
      file: "sowa-02-lesna.jpg",
      title: "Leśna elegantka",
      alt: "Sowa siedząca na gałęzi w zielonym lesie.",
      photographer: "tkirkgoz",
      sourceUrl: "https://www.pexels.com/photo/17213746/",
      requirement: "Osiągnij 2. poziom Sowiej Akademii.",
      unlockedBy: (academy) => academy.level >= 2,
    },
    {
      id: "owl-03",
      file: "sowa-03-na-pniu.jpg",
      title: "Strażniczka pnia",
      alt: "Sowa siedząca na pniu drzewa.",
      photographer: "Erik Karits",
      sourceUrl: "https://www.pexels.com/photo/25559342/",
      requirement: "Przebiegnij 1000 m w SowaRunner.",
      unlockedBy: (academy) => Number(academy.metrics.runnerDistance || 0) >= 1000,
    },
    {
      id: "owl-04",
      file: "sowa-04-portret.jpg",
      title: "Wielkie spojrzenie",
      alt: "Zbliżenie kolorowej sowy o dużych oczach.",
      photographer: "Regan Dsouza",
      sourceUrl: "https://www.pexels.com/photo/29082522/",
      requirement: "Osiągnij wysokość 250 m w SowaJumper.",
      unlockedBy: (academy) => Number(academy.metrics.jumperHeight || 0) >= 250,
    },
    {
      id: "owl-05",
      file: "sowa-05-na-dachu.jpg",
      title: "Dachowa zwiadowczyni",
      alt: "Sowa obserwująca otoczenie z wysokiego punktu.",
      photographer: "Erik Karits",
      sourceUrl: "https://www.pexels.com/photo/10586311/",
      requirement: "Osiągnij combo 8 w Sowa3.",
      unlockedBy: (academy) => Number(academy.metrics.sowa3Combo || 0) >= 8,
    },
    {
      id: "owl-06",
      file: "sowa-06-zielone-tlo.jpg",
      title: "Zielona dama",
      alt: "Portret sowy na miękko rozmytym zielonym tle.",
      photographer: "tkirkgoz",
      sourceUrl: "https://www.pexels.com/photo/17103408/",
      requirement: "Kup 20 roślin lub ulepszeń w Sowich Ogrodach.",
      unlockedBy: (academy) => Number(academy.metrics.ogrodyBuys || 0) >= 20,
    },
    {
      id: "owl-07",
      file: "sowa-07-spojrzenie.jpg",
      title: "Profesor Piórko",
      alt: "Portret puchacza o intensywnym spojrzeniu.",
      photographer: "petraryan",
      sourceUrl: "https://www.pexels.com/photo/33228723/",
      requirement: "Zbuduj 4 pomieszczenia w Sowiej Szklarni.",
      unlockedBy: (academy) => Number(academy.metrics.szklarniaRooms || 0) >= 4,
    },
    {
      id: "owl-08",
      file: "sowa-08-na-trawie.jpg",
      title: "Mistrzyni Akademii",
      alt: "Sowa odpoczywająca na trawie i patrząca w stronę aparatu.",
      photographer: "Marian Havenga",
      sourceUrl: "https://www.pexels.com/photo/25728668/",
      requirement: "Osiągnij 5. poziom Akademii i zdobądź 30 piórek.",
      unlockedBy: (academy) => academy.level >= 5 && academy.feathers >= 30,
    },
  ]);

  let state = load();
  let modal = null;
  let previousFocus = null;
  let selectedId = null;

  function defaultState() {
    return {
      version: VERSION,
      unlocked: ["owl-01"],
      viewed: [],
      favorite: null,
      updatedAt: Date.now(),
    };
  }

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!raw || typeof raw !== "object") return defaultState();
      return {
        ...defaultState(),
        ...raw,
        version: VERSION,
        unlocked: Array.isArray(raw.unlocked) ? raw.unlocked.filter((id) => PHOTOS.some((photo) => photo.id === id)) : ["owl-01"],
        viewed: Array.isArray(raw.viewed) ? raw.viewed.filter((id) => PHOTOS.some((photo) => photo.id === id)) : [],
      };
    } catch (_error) {
      return defaultState();
    }
  }

  function save() {
    state.version = VERSION;
    state.updatedAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("sowie:gallery-changed", { detail: snapshot() }));
  }

  function academySnapshot() {
    return window.SowieAcademy?.snapshot?.() || { level: 1, feathers: 0, metrics: {} };
  }

  function photoUrl(photo) {
    if (!scriptUrl) return `../Obrazki/${photo.file}`;
    return new URL(`../Obrazki/${photo.file}`, scriptUrl).href;
  }

  function refreshUnlocks({ notify = false } = {}) {
    const academy = academySnapshot();
    const newlyUnlocked = [];
    for (const photo of PHOTOS) {
      if (!state.unlocked.includes(photo.id) && photo.unlockedBy(academy)) {
        state.unlocked.push(photo.id);
        newlyUnlocked.push(photo);
      }
    }
    if (newlyUnlocked.length) {
      save();
      if (notify) {
        window.SowieNotifications?.toast?.({
          title: "Nowa fotografia w Galerii Sów!",
          detail: newlyUnlocked.length === 1 ? newlyUnlocked[0].title : `Odblokowano ${newlyUnlocked.length} fotografie`,
          reward: "Otwórz Galerię przyciskiem 🖼️",
          kind: "important",
        });
      }
    }
    return newlyUnlocked;
  }

  function snapshot() {
    const unlocked = PHOTOS.filter((photo) => state.unlocked.includes(photo.id)).map((photo) => photo.id);
    return JSON.parse(JSON.stringify({
      ...state,
      total: PHOTOS.length,
      unlockedCount: unlocked.length,
      unlocked,
    }));
  }

  function focusableElements() {
    if (!modal) return [];
    return [...modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((element) => !element.hidden);
  }

  function trapFocus(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = focusableElements();
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

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("section");
    modal.className = "sowie-modal-backdrop sowie-gallery-backdrop";
    modal.hidden = true;
    modal.innerHTML = `
      <article class="sowie-modal-card sowie-gallery-modal" role="dialog" aria-modal="true" aria-labelledby="galleryTitle">
        <div class="sowie-gallery-heading">
          <div><p class="sowie-gallery-eyebrow">nagrody fotograficzne</p><h2 id="galleryTitle">🖼️ Galeria Sów</h2></div>
          <strong data-gallery-progress></strong>
        </div>
        <div data-gallery-content></div>
        <div class="sowie-modal-actions"><button type="button" data-gallery-close>Zamknij</button></div>
      </article>`;
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-gallery-close]")) close();
      const openButton = event.target.closest("[data-gallery-open]");
      if (openButton) openPhoto(openButton.dataset.galleryOpen);
      const backButton = event.target.closest("[data-gallery-back]");
      if (backButton) {
        selectedId = null;
        render();
      }
      const favoriteButton = event.target.closest("[data-gallery-favorite]");
      if (favoriteButton) toggleFavorite(favoriteButton.dataset.galleryFavorite);
    });
    modal.addEventListener("keydown", trapFocus);
    document.body.appendChild(modal);
    return modal;
  }

  function galleryCards() {
    return PHOTOS.map((photo, index) => {
      const unlocked = state.unlocked.includes(photo.id);
      const viewed = state.viewed.includes(photo.id);
      const favorite = state.favorite === photo.id;
      if (!unlocked) {
        return `<article class="sowie-gallery-card is-locked" data-gallery-photo="${photo.id}">
          <div class="sowie-gallery-lock" aria-hidden="true">🔒</div>
          <div><strong>Fotografia ${index + 1}</strong><p>${photo.requirement}</p></div>
        </article>`;
      }
      return `<article class="sowie-gallery-card" data-gallery-photo="${photo.id}">
        <button type="button" class="sowie-gallery-thumb" data-gallery-open="${photo.id}" aria-label="Otwórz fotografię: ${photo.title}">
          <img src="${photoUrl(photo)}" alt="${photo.alt}" loading="lazy" width="400" height="300" />
          <span>${favorite ? "⭐" : viewed ? "✓" : "NOWA"}</span>
        </button>
        <div><strong>${photo.title}</strong><p>Fot. ${photo.photographer}</p></div>
      </article>`;
    }).join("");
  }

  function detailView(photo) {
    const favorite = state.favorite === photo.id;
    return `<div class="sowie-gallery-detail">
      <button class="sowie-feature-button" type="button" data-gallery-back>← Wróć do kolekcji</button>
      <figure>
        <img src="${photoUrl(photo)}" alt="${photo.alt}" width="1200" height="900" />
        <figcaption>
          <h3>${photo.title}</h3>
          <p>${photo.alt}</p>
          <p>Fotografia: <strong>${photo.photographer}</strong> · źródło: <a href="${photo.sourceUrl}" target="_blank" rel="noopener noreferrer">Pexels</a></p>
        </figcaption>
      </figure>
      <button class="sowie-feature-button" type="button" data-gallery-favorite="${photo.id}">${favorite ? "⭐ Ulubiona fotografia" : "☆ Ustaw jako ulubioną"}</button>
    </div>`;
  }

  function render() {
    if (!modal) return;
    refreshUnlocks();
    const progress = modal.querySelector("[data-gallery-progress]");
    const content = modal.querySelector("[data-gallery-content]");
    const unlockedCount = state.unlocked.length;
    progress.textContent = `${unlockedCount}/${PHOTOS.length} odblokowanych`;
    const selected = PHOTOS.find((photo) => photo.id === selectedId && state.unlocked.includes(photo.id));
    content.innerHTML = selected
      ? detailView(selected)
      : `<p>Zdobywaj poziomy i realizuj cele w pięciu grach, aby odkrywać kolejne fotografie. Nagrody pozostają odblokowane na stałe.</p><div class="sowie-gallery-grid">${galleryCards()}</div>`;
  }

  function openPhoto(id) {
    if (!state.unlocked.includes(id)) return;
    selectedId = id;
    if (!state.viewed.includes(id)) {
      state.viewed.push(id);
      save();
      if (state.viewed.length === PHOTOS.length) {
        window.SowieAcademy?.award?.("gallery:complete", 100, 10, "Kompletna Galeria Sów");
      }
    }
    render();
    modal.querySelector("[data-gallery-back]")?.focus();
  }

  function toggleFavorite(id) {
    if (!state.unlocked.includes(id)) return;
    state.favorite = state.favorite === id ? null : id;
    save();
    render();
    modal.querySelector(`[data-gallery-favorite="${id}"]`)?.focus();
  }

  function open(trigger = document.activeElement) {
    refreshUnlocks({ notify: true });
    const node = ensureModal();
    previousFocus = trigger instanceof HTMLElement ? trigger : null;
    selectedId = null;
    render();
    node.hidden = false;
    node.querySelector("[data-gallery-close]").focus();
  }

  function close() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    selectedId = null;
    previousFocus?.focus?.();
    previousFocus = null;
  }

  function attachButton() {
    if (document.getElementById("galleryButton") || document.querySelector("[data-gallery-fab]")) return;
    const onMenu = Boolean(document.querySelector("[data-game-cards]"));
    const button = document.createElement("button");
    button.type = "button";
    button.title = "Galeria Sów";
    button.setAttribute("aria-label", "Otwórz Galerię Sów");
    if (onMenu) {
      button.id = "galleryButton";
      button.className = "sowie-gallery-button";
      button.textContent = "🖼️ Galeria Sów";
      const actions = document.querySelector(".sowie-header-actions") || document.querySelector("header") || document.body;
      actions.appendChild(button);
    } else {
      button.className = "sowie-tool-button";
      button.dataset.galleryFab = "true";
      button.textContent = "🖼️";
      (window.SowieGameGuides?.getDock?.() || document.body).appendChild(button);
    }
    button.addEventListener("click", () => open(button));
  }

  refreshUnlocks({ notify: Boolean(localStorage.getItem(KEY)) });
  window.addEventListener("sowie:academy-changed", () => refreshUnlocks({ notify: true }));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attachButton, { once: true });
  else attachButton();

  window.SowieOwlGallery = Object.freeze({
    PHOTOS,
    open,
    close,
    refreshUnlocks,
    snapshot,
  });
})();
