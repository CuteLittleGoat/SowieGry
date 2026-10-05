// Galeria Sów: 30 fotografii odblokowywanych celami Akademii. Stan w profilu (profil.gallery) przez SowieCloud.
(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src;
  const cloud = window.SowieCloud;
  const VERSION = 2;

  // goals: lista celów [źródło, próg] — źródło to level, achievements (liczba osiągnięć), feathers albo metryka
  // Sowiej Akademii; zdjęcie odblokowuje się, gdy wszystkie cele są osiągnięte (pusta lista = od początku).
  // Od E9d (Analiza 3, zadanie 9.3) żadne zdjęcie nie wymaga salda piórek — piórka wydaje się w Sowim Butiku;
  // zamiast tego osiągnięcia i liczniki z całych biegów (liście, kózki, uniki, humbak).
  const PHOTOS = Object.freeze([
    {
      id: "owl-01",
      file: "sowa-01-puchata.jpg",
      title: "Puchata obserwatorka",
      alt: "Puchata sowa patrząca prosto w obiektyw.",
      photographer: "tkirkgoz",
      sourceUrl: "https://www.pexels.com/photo/13681325/",
      requirement: "Prezent powitalny — dostępna od początku.",
      goals: [],
    },
    {
      id: "owl-02",
      file: "sowa-02-lesna.jpg",
      title: "Leśna elegantka",
      alt: "Sowa siedząca na gałęzi w zielonym lesie.",
      photographer: "tkirkgoz",
      sourceUrl: "https://www.pexels.com/photo/17213746/",
      requirement: "Osiągnij 2. poziom Sowiej Akademii.",
      goals: [["level", 2]],
    },
    {
      id: "owl-03",
      file: "sowa-03-na-pniu.jpg",
      title: "Strażniczka pnia",
      alt: "Sowa siedząca na pniu drzewa.",
      photographer: "Erik Karits",
      sourceUrl: "https://www.pexels.com/photo/25559342/",
      requirement: "Przebiegnij 1000 m w Sowiej Ucieczce.",
      goals: [["runnerDistance", 1000]],
    },
    {
      id: "owl-04",
      file: "sowa-04-portret.jpg",
      title: "Wielkie spojrzenie",
      alt: "Zbliżenie kolorowej sowy o dużych oczach.",
      photographer: "Regan Dsouza",
      sourceUrl: "https://www.pexels.com/photo/29082522/",
      requirement: "Osiągnij wysokość 250 m w Sowie w Chmurach.",
      goals: [["jumperHeight", 250]],
    },
    {
      id: "owl-05",
      file: "sowa-05-na-dachu.jpg",
      title: "Dachowa zwiadowczyni",
      alt: "Sowa obserwująca otoczenie z wysokiego punktu.",
      photographer: "Erik Karits",
      sourceUrl: "https://www.pexels.com/photo/10586311/",
      requirement: "Osiągnij combo 8 w Sowich Torach.",
      goals: [["sowa3Combo", 8]],
    },
    {
      id: "owl-06",
      file: "sowa-06-zielone-tlo.jpg",
      title: "Zielona dama",
      alt: "Portret sowy na miękko rozmytym zielonym tle.",
      photographer: "tkirkgoz",
      sourceUrl: "https://www.pexels.com/photo/17103408/",
      requirement: "Kup 20 roślin lub ulepszeń w Sowich Ogrodach.",
      goals: [["ogrodyBuys", 20]],
    },
    {
      id: "owl-07",
      file: "sowa-07-spojrzenie.jpg",
      title: "Profesor Piórko",
      alt: "Portret puchacza o intensywnym spojrzeniu.",
      photographer: "petraryan",
      sourceUrl: "https://www.pexels.com/photo/33228723/",
      requirement: "Odnów 4 pomieszczenia w Łącz i Hoduj.",
      goals: [["szklarniaRooms", 4]],
    },
    {
      id: "owl-08",
      file: "sowa-08-na-trawie.jpg",
      title: "Mistrzyni Akademii",
      alt: "Sowa odpoczywająca na trawie i patrząca w stronę aparatu.",
      photographer: "Marian Havenga",
      sourceUrl: "https://www.pexels.com/photo/25728668/",
      requirement: "Zdobądź 3 osiągnięcia Sowiej Akademii.",
      goals: [["achievements", 3]],
    },
    {
      id: "owl-09",
      file: "sowa-09-w-koszyku.jpg",
      title: "Koszykowa kruszynka",
      alt: "Puchata młoda sowa siedząca w plecionym koszyku.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/5237476/",
      requirement: "Osiągnij 3. poziom Sowiej Akademii.",
      goals: [["level", 3]],
    },
    {
      id: "owl-10",
      file: "sowa-10-na-galezi.jpg",
      title: "Gałązkowa ciekawska",
      alt: "Młoda sówka siedząca na gałęzi pośród zielonych liści.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/23654842/",
      requirement: "Zbierz 300 liści w grach zręcznościowych.",
      goals: [["leaves", 300]],
    },
    {
      id: "owl-11",
      file: "sowa-11-dwie-uszate.jpg",
      title: "Uszate rodzeństwo",
      alt: "Dwie młode uszatki siedzące razem na konarze.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/4823989/",
      requirement: "Zdobądź 1800 punktów w Sowiej Ucieczce.",
      goals: [["runnerScore", 1800]],
    },
    {
      id: "owl-12",
      file: "sowa-12-dwie-puchate.jpg",
      title: "Puchaty duet",
      alt: "Dwie puchate młode sowy przytulone na gałęzi.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/4823986/",
      requirement: "Zbierz 5 liści z rzędu bez trafienia w Sowiej Ucieczce.",
      goals: [["runnerLeafChain", 5]],
    },
    {
      id: "owl-13",
      file: "sowa-13-mloda-puszczykowata.jpg",
      title: "Leśna młodziutka",
      alt: "Młoda puszczykowata sowa wspinająca się po pniu.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/27067203/",
      requirement: "Zdobądź 1200 punktów w Sowie w Chmurach.",
      goals: [["jumperScore", 1200]],
    },
    {
      id: "owl-14",
      file: "sowa-14-w-promieniach.jpg",
      title: "Promyk puszczyka",
      alt: "Młody puszczyk oświetlony miękkim światłem w lesie.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/17817497/",
      requirement: "Wyląduj idealnie 4 razy z rzędu w Sowie w Chmurach.",
      goals: [["jumperStreak", 4]],
    },
    {
      id: "owl-15",
      file: "sowa-15-w-zieleni.jpg",
      title: "Zielony kamuflaż",
      alt: "Młoda brązowa sowa ukryta pośród zielonych liści.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/23490342/",
      requirement: "Zdobądź 1500 punktów w Sowich Torach.",
      goals: [["sowa3Score", 1500]],
    },
    {
      id: "owl-16",
      file: "sowa-16-keila.jpg",
      title: "Cicha obserwatorka",
      alt: "Młoda sowa spokojnie obserwująca las z gałęzi.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/15994322/",
      requirement: "Ukończ kampanię Sowich Torów.",
      goals: [["sowa3Finishes", 1]],
    },
    {
      id: "owl-17",
      file: "sowa-17-uralska.jpg",
      title: "Mała uralska",
      alt: "Puchata młoda sowa uralska odpoczywająca na konarze.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/3848270/",
      requirement: "Zbierz liście ręcznie 75 razy w Sowich Ogrodach.",
      goals: [["ogrodyClicks", 75]],
    },
    {
      id: "owl-18",
      file: "sowa-18-na-konarku.jpg",
      title: "Konarkowa dama",
      alt: "Młody puszczyk siedzący na cienkim konarze.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/24012047/",
      requirement: "Posiadaj 18 roślin w Sowich Ogrodach.",
      goals: [["ogrodyPlants", 18]],
    },
    {
      id: "owl-19",
      file: "sowa-19-puszczyk.jpg",
      title: "Puszczyk o zmierzchu",
      alt: "Puszczyk w miękkim leśnym świetle.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/19892683/",
      requirement: "Podlej ogród 8 razy.",
      goals: [["ogrodyWatering", 8]],
    },
    {
      id: "owl-20",
      file: "sowa-20-na-trawie.jpg",
      title: "Trawiasta kulka",
      alt: "Puchata młoda sowa o żółtych oczach siedząca na trawie.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/19065539/",
      requirement: "Zbierz 5000 liści łącznie w Sowich Ogrodach.",
      goals: [["ogrodyLeaves", 5000]],
    },
    {
      id: "owl-21",
      file: "sowa-21-ciekawska.jpg",
      title: "Ciekawska zza gałęzi",
      alt: "Młoda sowa wyglądająca ciekawie spomiędzy gałęzi.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/31330685/",
      requirement: "Miej 6 roślin na półkach w Łącz i Hoduj.",
      goals: [["szklarniaPlants", 6]],
    },
    {
      id: "owl-22",
      file: "sowa-22-mloda-w-lesie.jpg",
      title: "Leśny podlot",
      alt: "Młoda sowa siedząca na gałęzi w jasnym lesie.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/23654832/",
      requirement: "Użyj 3 kózek-pomocnic w Łącz i Hoduj.",
      goals: [["szklarniaGoats", 3]],
    },
    {
      id: "owl-23",
      file: "sowa-23-uszata-na-ziemi.jpg",
      title: "Uszata na spacerze",
      alt: "Puchata młoda uszatka stojąca na leśnej ziemi.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/19065545/",
      requirement: "Wyhoduj pierwszą hybrydę w Łącz i Hoduj.",
      goals: [["szklarniaHybrids", 1]],
    },
    {
      id: "owl-24",
      file: "sowa-24-lesny-maluch.jpg",
      title: "Leśny maluszek",
      alt: "Mała sowa stojąca na leśnym podłożu pośród zieleni.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/7190228/",
      requirement: "Osiągnij 5. poziom Sowiej Akademii.",
      goals: [["level", 5]],
    },
    {
      id: "owl-25",
      file: "sowa-25-biala-w-koszyku.jpg",
      title: "Biała koszykarka",
      alt: "Jasna młoda płomykówka odpoczywająca w koszyku.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/5237543/",
      requirement: "Złap 10 skaczących kózek.",
      goals: [["goatsCaught", 10]],
    },
    {
      id: "owl-26",
      file: "sowa-26-mloda-z-bliska.jpg",
      title: "Portret młodej sowy",
      alt: "Bliski portret młodej brązowej sowy o spokojnym spojrzeniu.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/23490352/",
      requirement: "Odwiedź każdą z pięciu gier przynajmniej raz.",
      goals: [["runnerVisits", 1], ["jumperVisits", 1], ["sowa3Visits", 1], ["ogrodyVisits", 1], ["szklarniaVisits", 1]],
    },
    {
      id: "owl-27",
      file: "sowa-27-kolumbijska.jpg",
      title: "Kolumbijska maskotka",
      alt: "Młoda sowa ukryta w bujnych kolumbijskich liściach.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/28699294/",
      requirement: "Zrób 20 uników „O włos!” i 3 razy wybierz się na przygodę z humbakiem.",
      goals: [["nearMisses", 20], ["whaleRides", 3]],
    },
    {
      id: "owl-28",
      file: "sowa-28-puszczykowata-na-drzewie.jpg",
      title: "Puszczykowata strażniczka",
      alt: "Młoda puszczykowata sowa siedząca wysoko na drzewie.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/24012038/",
      requirement: "Przebiegnij 2500 m w Sowiej Ucieczce i wznieś się na 400 m w Sowie w Chmurach.",
      goals: [["runnerDistance", 2500], ["jumperHeight", 400]],
    },
    {
      id: "owl-29",
      file: "sowa-29-norkowa-na-lace.jpg",
      title: "Łąkowa norka",
      alt: "Mała sowa ziemna stojąca w słonecznej trawie.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/5651223/",
      requirement: "Osiągnij combo 12 w Sowich Torach i wykonaj pierwsze przesadzanie Ogrodów.",
      goals: [["sowa3Combo", 12], ["ogrodyPrestiges", 1]],
    },
    {
      id: "owl-30",
      file: "sowa-30-wiosenna-rodzina.jpg",
      title: "Wiosenna rodzina",
      alt: "Kilka uroczych sów siedzących razem pośród wiosennych gałęzi.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/31922777/",
      requirement: "Zdobądź 8 osiągnięć i osiągnij 8. poziom Sowiej Akademii.",
      goals: [["achievements", 8], ["level", 8]],
    },
  ]);

  // Wartość źródła celu w migawce Akademii.
  function goalValue(academy, source) {
    if (source === "level") return Number(academy.level || 1);
    if (source === "feathers") return Number(academy.feathers || 0);
    if (source === "achievements") return Object.keys(academy.achievements || {}).length;
    return Number(academy.metrics?.[source] || 0);
  }

  // Czy zdjęcie jest do odblokowania (wszystkie cele osiągnięte).
  function goalsMet(photo, academy) {
    return photo.goals.every(([source, target]) => goalValue(academy, source) >= target);
  }

  // Postęp do odblokowania: udział 0–1 (średnia z celów) i szczegóły każdego celu.
  function progressOf(photoOrId, academy = academySnapshot()) {
    const photo = typeof photoOrId === "string" ? PHOTOS.find((entry) => entry.id === photoOrId) : photoOrId;
    if (!photo) return null;
    const goals = photo.goals.map(([source, target]) => {
      const value = goalValue(academy, source);
      return { source, target, value: Math.min(value, target), done: value >= target };
    });
    const share = goals.length ? goals.reduce((sum, goal) => sum + goal.value / goal.target, 0) / goals.length : 1;
    return { share, goals, done: goals.every((goal) => goal.done) };
  }

  let state = defaultState();
  let loaded = false;

  function defaultState() {
    return {
      version: VERSION,
      unlocked: ["owl-01"],
      viewed: [],
      favorite: null,
      background: null,
      updatedAt: Date.now(),
    };
  }

  // Stan z profilu w chmurze (kopia robocza; zapis przez save()).
  function load() {
    const raw = cloud?.profile?.().gallery;
    if (!raw || typeof raw !== "object") return defaultState();
    return JSON.parse(
      JSON.stringify({
        ...defaultState(),
        ...raw,
        version: VERSION,
        unlocked: Array.isArray(raw.unlocked)
          ? raw.unlocked.filter((id) => PHOTOS.some((photo) => photo.id === id))
          : ["owl-01"],
        viewed: Array.isArray(raw.viewed) ? raw.viewed.filter((id) => PHOTOS.some((photo) => photo.id === id)) : [],
        background: PHOTOS.some((photo) => photo.id === raw.background) ? raw.background : null,
      }),
    );
  }

  function save() {
    if (!loaded) return;
    state.version = VERSION;
    state.updatedAt = Date.now();
    const stored = JSON.parse(JSON.stringify(state));
    cloud.updateProfile((profile) => {
      profile.gallery = stored;
    });
    window.dispatchEvent(new CustomEvent("sowie:gallery-changed", { detail: snapshot() }));
  }

  function academySnapshot() {
    return window.SowieAcademy?.snapshot?.() || { level: 1, feathers: 0, metrics: {} };
  }

  function photoUrl(photo) {
    if (!scriptUrl) return `../Obrazki/${photo.file}`;
    return new URL(`../Obrazki/${photo.file}`, scriptUrl).href;
  }

  // Miniatura WebP (assets/gallery-thumbs/, szerokość 400 albo 800 px).
  function thumbUrl(photo, width = 400) {
    const name = `assets/gallery-thumbs/${photo.file.replace(/\.jpg$/, "")}-${width}.webp`;
    if (!scriptUrl) return `../${name}`;
    return new URL(`../${name}`, scriptUrl).href;
  }

  function refreshUnlocks({ notify = false } = {}) {
    if (!loaded) return [];
    const academy = academySnapshot();
    const newlyUnlocked = [];
    for (const photo of PHOTOS) {
      if (!state.unlocked.includes(photo.id) && goalsMet(photo, academy)) {
        state.unlocked.push(photo.id);
        newlyUnlocked.push(photo);
      }
    }
    if (newlyUnlocked.length) {
      save();
      if (notify) {
        window.SowieNotifications?.toast?.({
          title: "Nowa fotografia w Galerii Sów!",
          detail:
            newlyUnlocked.length === 1 ? newlyUnlocked[0].title : `Odblokowano ${newlyUnlocked.length} fotografie`,
          reward: "Zobacz w zakładce Galeria",
          kind: "important",
        });
      }
    }
    return newlyUnlocked;
  }

  function snapshot() {
    const unlocked = PHOTOS.filter((photo) => state.unlocked.includes(photo.id)).map((photo) => photo.id);
    return JSON.parse(
      JSON.stringify({
        ...state,
        total: PHOTOS.length,
        unlockedCount: unlocked.length,
        unlocked,
      }),
    );
  }

  // Oznacza zdjęcie jako obejrzane (po obejrzeniu wszystkich 30 — nagroda Akademii).
  function markViewed(id) {
    if (!loaded || !state.unlocked.includes(id) || state.viewed.includes(id)) return false;
    state.viewed.push(id);
    save();
    if (state.viewed.length === PHOTOS.length) {
      window.SowieAcademy?.award?.("gallery:complete", 100, 10, "Kompletna Galeria Sów");
    }
    return true;
  }

  // Ulubione zdjęcie (jedno) — ponowne wybranie zdejmuje wyróżnienie.
  function setFavorite(id) {
    if (!loaded || !state.unlocked.includes(id)) return false;
    state.favorite = state.favorite === id ? null : id;
    save();
    return state.favorite === id;
  }

  // Tło menu głównego: odblokowane zdjęcie albo null (domyślne niebo).
  function setBackground(id) {
    if (!loaded || (id !== null && !state.unlocked.includes(id))) return false;
    state.background = id;
    save();
    return true;
  }

  function loadFromCloud() {
    state = load();
    loaded = true;
    refreshUnlocks({ notify: true });
  }

  cloud?.ready.then(loadFromCloud);
  cloud?.onProfileReload(loadFromCloud);
  window.addEventListener("sowie:academy-changed", () => refreshUnlocks({ notify: true }));

  window.SowieOwlGallery = Object.freeze({
    PHOTOS,
    refreshUnlocks,
    snapshot,
    progressOf,
    markViewed,
    setFavorite,
    setBackground,
    photoUrl,
    thumbUrl,
    isLoaded: () => loaded,
  });
})();
