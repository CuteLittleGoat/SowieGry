(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src;
  const KEY = "sowieOwlGallery";
  const VERSION = 2;

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
    {
    id: "owl-09",
    file: "sowa-09-w-koszyku.jpg",
    title: "Koszykowa kruszynka",
    alt: "Puchata młoda sowa siedząca w plecionym koszyku.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/5237476/",
    requirement: "Osiągnij 3. poziom Sowiej Akademii.",
    unlockedBy: (academy) => academy.level >= 3,
  },
  {
    id: "owl-10",
    file: "sowa-10-na-galezi.jpg",
    title: "Gałązkowa ciekawska",
    alt: "Młoda sówka siedząca na gałęzi pośród zielonych liści.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/23654842/",
    requirement: "Zdobądź 12 piórek w Sowiej Akademii.",
    unlockedBy: (academy) => academy.feathers >= 12,
  },
  {
    id: "owl-11",
    file: "sowa-11-dwie-uszate.jpg",
    title: "Uszate rodzeństwo",
    alt: "Dwie młode uszatki siedzące razem na konarze.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/4823989/",
    requirement: "Zdobądź 1800 punktów w SowaRunner.",
    unlockedBy: (academy) => Number(academy.metrics.runnerScore || 0) >= 1800,
  },
  {
    id: "owl-12",
    file: "sowa-12-dwie-puchate.jpg",
    title: "Puchaty duet",
    alt: "Dwie puchate młode sowy przytulone na gałęzi.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/4823986/",
    requirement: "Zbuduj serię 5 liści w SowaRunner.",
    unlockedBy: (academy) => Number(academy.metrics.runnerLeafChain || 0) >= 5,
  },
  {
    id: "owl-13",
    file: "sowa-13-mloda-puszczykowata.jpg",
    title: "Leśna młodziutka",
    alt: "Młoda puszczykowata sowa wspinająca się po pniu.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/27067203/",
    requirement: "Zdobądź 1200 punktów w SowaJumper.",
    unlockedBy: (academy) => Number(academy.metrics.jumperScore || 0) >= 1200,
  },
  {
    id: "owl-14",
    file: "sowa-14-w-promieniach.jpg",
    title: "Promyk puszczyka",
    alt: "Młody puszczyk oświetlony miękkim światłem w lesie.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/17817497/",
    requirement: "Wykonaj serię 4 precyzyjnych lądowań w SowaJumper.",
    unlockedBy: (academy) => Number(academy.metrics.jumperStreak || 0) >= 4,
  },
  {
    id: "owl-15",
    file: "sowa-15-w-zieleni.jpg",
    title: "Zielony kamuflaż",
    alt: "Młoda brązowa sowa ukryta pośród zielonych liści.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/23490342/",
    requirement: "Zdobądź 1500 punktów w Sowa3.",
    unlockedBy: (academy) => Number(academy.metrics.sowa3Score || 0) >= 1500,
  },
  {
    id: "owl-16",
    file: "sowa-16-keila.jpg",
    title: "Cicha obserwatorka",
    alt: "Młoda sowa spokojnie obserwująca las z gałęzi.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/15994322/",
    requirement: "Ukończ przynajmniej jedną trasę w Sowa3.",
    unlockedBy: (academy) => Number(academy.metrics.sowa3Finishes || 0) >= 1,
  },
  {
    id: "owl-17",
    file: "sowa-17-uralska.jpg",
    title: "Mała uralska",
    alt: "Puchata młoda sowa uralska odpoczywająca na konarze.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/3848270/",
    requirement: "Zbierz liście ręcznie 75 razy w Sowich Ogrodach.",
    unlockedBy: (academy) => Number(academy.metrics.ogrodyClicks || 0) >= 75,
  },
  {
    id: "owl-18",
    file: "sowa-18-na-konarku.jpg",
    title: "Konarkowa dama",
    alt: "Młody puszczyk siedzący na cienkim konarze.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/24012047/",
    requirement: "Posiadaj 18 roślin w Sowich Ogrodach.",
    unlockedBy: (academy) => Number(academy.metrics.ogrodyPlants || 0) >= 18,
  },
  {
    id: "owl-19",
    file: "sowa-19-puszczyk.jpg",
    title: "Puszczyk o zmierzchu",
    alt: "Puszczyk w miękkim leśnym świetle.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/19892683/",
    requirement: "Podlej ogród 8 razy.",
    unlockedBy: (academy) => Number(academy.metrics.ogrodyWatering || 0) >= 8,
  },
  {
    id: "owl-20",
    file: "sowa-20-na-trawie.jpg",
    title: "Trawiasta kulka",
    alt: "Puchata młoda sowa o żółtych oczach siedząca na trawie.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/19065539/",
    requirement: "Zbierz 5000 liści łącznie w Sowich Ogrodach.",
    unlockedBy: (academy) => Number(academy.metrics.ogrodyLeaves || 0) >= 5000,
  },
  {
    id: "owl-21",
    file: "sowa-21-ciekawska.jpg",
    title: "Ciekawska zza gałęzi",
    alt: "Młoda sowa wyglądająca ciekawie spomiędzy gałęzi.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/31330685/",
    requirement: "Posiadaj 6 roślin w Sowiej Szklarni.",
    unlockedBy: (academy) => Number(academy.metrics.szklarniaPlants || 0) >= 6,
  },
  {
    id: "owl-22",
    file: "sowa-22-mloda-w-lesie.jpg",
    title: "Leśny podlot",
    alt: "Młoda sowa siedząca na gałęzi w jasnym lesie.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/23654832/",
    requirement: "Przegoń 3 kozy w Sowiej Szklarni.",
    unlockedBy: (academy) => Number(academy.metrics.szklarniaGoats || 0) >= 3,
  },
  {
    id: "owl-23",
    file: "sowa-23-uszata-na-ziemi.jpg",
    title: "Uszata na spacerze",
    alt: "Puchata młoda uszatka stojąca na leśnej ziemi.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/19065545/",
    requirement: "Odkryj pierwszą hybrydę w Sowiej Szklarni.",
    unlockedBy: (academy) => Number(academy.metrics.szklarniaHybrids || 0) >= 1,
  },
  {
    id: "owl-24",
    file: "sowa-24-lesny-maluch.jpg",
    title: "Leśny maluszek",
    alt: "Mała sowa stojąca na leśnym podłożu pośród zieleni.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/7190228/",
    requirement: "Osiągnij 5. poziom Sowiej Akademii.",
    unlockedBy: (academy) => academy.level >= 5,
  },
  {
    id: "owl-25",
    file: "sowa-25-biala-w-koszyku.jpg",
    title: "Biała koszykarka",
    alt: "Jasna młoda płomykówka odpoczywająca w koszyku.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/5237543/",
    requirement: "Zdobądź 40 piórek w Sowiej Akademii.",
    unlockedBy: (academy) => academy.feathers >= 40,
  },
  {
    id: "owl-26",
    file: "sowa-26-mloda-z-bliska.jpg",
    title: "Portret młodej sowy",
    alt: "Bliski portret młodej brązowej sowy o spokojnym spojrzeniu.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/23490352/",
    requirement: "Odwiedź każdą z pięciu gier przynajmniej raz.",
    unlockedBy: (academy) => ["runnerVisits", "jumperVisits", "sowa3Visits", "ogrodyVisits", "szklarniaVisits"].every((metric) => Number(academy.metrics[metric] || 0) >= 1),
  },
  {
    id: "owl-27",
    file: "sowa-27-kolumbijska.jpg",
    title: "Kolumbijska maskotka",
    alt: "Młoda sowa ukryta w bujnych kolumbijskich liściach.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/28699294/",
    requirement: "Osiągnij 6. poziom Akademii i zdobądź 50 piórek.",
    unlockedBy: (academy) => academy.level >= 6 && academy.feathers >= 50,
  },
  {
    id: "owl-28",
    file: "sowa-28-puszczykowata-na-drzewie.jpg",
    title: "Puszczykowata strażniczka",
    alt: "Młoda puszczykowata sowa siedząca wysoko na drzewie.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/24012038/",
    requirement: "Przebiegnij 2500 m w Runnerze i osiągnij 400 m w Jumperze.",
    unlockedBy: (academy) => Number(academy.metrics.runnerDistance || 0) >= 2500 && Number(academy.metrics.jumperHeight || 0) >= 400,
  },
  {
    id: "owl-29",
    file: "sowa-29-norkowa-na-lace.jpg",
    title: "Łąkowa norka",
    alt: "Mała sowa ziemna stojąca w słonecznej trawie.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/5651223/",
    requirement: "Osiągnij combo 12 w Sowa3 i wykonaj pierwsze przesadzanie Ogrodów.",
    unlockedBy: (academy) => Number(academy.metrics.sowa3Combo || 0) >= 12 && Number(academy.metrics.ogrodyPrestiges || 0) >= 1,
  },
  {
    id: "owl-30",
    file: "sowa-30-wiosenna-rodzina.jpg",
    title: "Wiosenna rodzina",
    alt: "Kilka uroczych sów siedzących razem pośród wiosennych gałęzi.",
    photographer: "Twórca w serwisie Pexels",
    sourceUrl: "https://www.pexels.com/photo/31922777/",
    requirement: "Osiągnij 8. poziom Akademii, zdobądź 80 piórek i zbuduj 5 pomieszczeń Szklarni.",
    unlockedBy: (academy) => academy.level >= 8 && academy.feathers >= 80 && Number(academy.metrics.szklarniaRooms || 0) >= 5,
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
