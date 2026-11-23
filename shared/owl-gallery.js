// Galeria Sów: 58 fotografii (sowy, kozy, humbaki i rośliny ozdobne) odblokowywanych celami Akademii. Stan w profilu
// (profil.gallery) przez SowieCloud.
(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src;
  const cloud = window.SowieCloud;
  // Wersja demo (E10): bez Galerii Sów.
  if (cloud?.demo) return;
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
      file: "sowa-02-zlota-plomykowka.jpg",
      title: "Złota płomykówka",
      alt: "Płomykówka o białej, sercowatej twarzy siedząca na pniu.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/1526404/",
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
      file: "sowa-12-plomykowki-w-budce.jpg",
      title: "Płomykówki w budce",
      alt: "Dwie płomykówki wyglądające z drewnianej budki.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/5653375/",
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
      file: "sowa-22-sowka-na-blekicie.jpg",
      title: "Sówka na błękicie",
      alt: "Mała sówka w białe kropki na gałęzi na tle nieba.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/18972508/",
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
      file: "sowa-25-sniezna-na-polu.jpg",
      title: "Śnieżna na polu",
      alt: "Biała sowa śnieżna siedząca na ziemi.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/18529618/",
      requirement: "Złap 10 skaczących kózek.",
      goals: [["goatsCaught", 10]],
    },
    {
      id: "owl-26",
      file: "sowa-26-w-dziupli.jpg",
      title: "Rudy syczek w dziupli",
      alt: "Rudy syczek wyglądający z dziupli w starym pniu.",
      photographer: "Anne-Marie Gionet-Lavoie",
      sourceUrl: "https://www.pexels.com/photo/19898940/",
      // Od M5 (2026-11-23) także Sowie Trójki — odblokowane zdjęcie zostaje odblokowane (profil.gallery.unlocked).
      requirement: "Odwiedź każdą z sześciu gier przynajmniej raz.",
      goals: [
        ["runnerVisits", 1], ["jumperVisits", 1], ["sowa3Visits", 1],
        ["ogrodyVisits", 1], ["szklarniaVisits", 1], ["trojkiVisits", 1],
      ],
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
    // Fotografie 31–40 (uwaga G4, 2026-11-02) — wymagania z nowych treści: krainy ponad Kosmosem w Sowie w Chmurach,
    // nowe rozdziały Sowich Ogrodów, diamentowe i tęczowe rośliny oraz nowe pomieszczenia w Łącz i Hoduj.
    {
      id: "owl-31",
      file: "sowa-31-oczy-puchacza.jpg",
      title: "Oczy puchacza",
      alt: "Zbliżenie pyska puchacza plamistego z wielkimi pomarańczowymi oczami.",
      photographer: "Jean van der Meulen",
      sourceUrl: "https://www.pexels.com/photo/1543417/",
      requirement: "Wznieś się na 1900 m w Sowie w Chmurach — do Mgławicy.",
      goals: [["jumperHeight", 1900]],
    },
    {
      id: "owl-32",
      file: "sowa-32-plomykowka-w-locie.jpg",
      title: "Płomykówka w locie",
      alt: "Płomykówka z rozpostartymi skrzydłami na tle błękitnego nieba.",
      photographer: "Mark A Jenkins",
      sourceUrl: "https://www.pexels.com/photo/24035369/",
      requirement: "Doleć do Olimpu — 3100 m w Sowie w Chmurach.",
      goals: [["jumperHeight", 3100]],
    },
    {
      id: "owl-33",
      file: "sowa-33-puchacz-nad-laka.jpg",
      title: "Puchacz nad łąką",
      alt: "Puchacz w locie nisko nad zieloną łąką, za nim drewniany płot.",
      photographer: "Manuel Torres Garcia",
      sourceUrl: "https://www.pexels.com/photo/27043544/",
      requirement: "Dotrzyj do Sowich Zaświatów — 5100 m w Sowie w Chmurach.",
      goals: [["jumperHeight", 5100]],
    },
    {
      id: "owl-34",
      file: "sowa-34-zza-pnia.jpg",
      title: "Zza pnia",
      alt: "Mała sówka zerkająca zza pnia drzewa.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/12232364/",
      requirement: "Ukończ 6 rozdziałów Sowich Ogrodów — do Arboretum włącznie.",
      goals: [["ogrodyChapters", 6]],
    },
    {
      id: "owl-35",
      file: "sowa-35-sowka-w-cieniu.jpg",
      title: "Sówka w cieniu",
      alt: "Mała cętkowana sówka w cieniu ciemnych liści.",
      photographer: "Kalidasan Gopi",
      sourceUrl: "https://www.pexels.com/photo/19182794/",
      requirement: "Ukończ 9 rozdziałów Sowich Ogrodów — do Ogrodu japońskiego włącznie.",
      goals: [["ogrodyChapters", 9]],
    },
    {
      id: "owl-36",
      file: "sowa-36-kto-tam.jpg",
      title: "Kto tam?",
      alt: "Sowa wyglądająca jednym okiem z otworu w gliniastej skale.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/31338878/",
      requirement: "Ukończ 14 rozdziałów Sowich Ogrodów — do Księżycowego ogrodu włącznie.",
      goals: [["ogrodyChapters", 14]],
    },
    {
      id: "owl-37",
      file: "sowa-37-czarno-biala.jpg",
      title: "Czarno-biała płomykówka",
      alt: "Czarno-białe zdjęcie płomykówki z rozłożonymi skrzydłami.",
      photographer: "Stuart Robinson",
      sourceUrl: "https://www.pexels.com/photo/33615139/",
      requirement: "Wyhoduj diamentową roślinę w Łącz i Hoduj.",
      goals: [["szklarniaBest", 6]],
    },
    {
      id: "owl-38",
      file: "sowa-38-puchacz-wirginijski.jpg",
      title: "Puchacz wirginijski",
      alt: "Puchacz wirginijski z uszkami z piór siedzący wśród gałęzi.",
      photographer: "Leonardo Merlo",
      sourceUrl: "https://www.pexels.com/photo/28794105/",
      requirement: "Wyhoduj tęczową roślinę w Łącz i Hoduj.",
      goals: [["szklarniaBest", 7]],
    },
    {
      id: "owl-39",
      file: "sowa-39-dwie-pojdzki.jpg",
      title: "Dwie pójdźki",
      alt: "Dwie małe sówki przytulone na sękatej gałęzi.",
      photographer: "Twórca w serwisie Pexels",
      sourceUrl: "https://www.pexels.com/photo/7002648/",
      requirement: "Odnów 12 pomieszczeń w Łącz i Hoduj.",
      goals: [["szklarniaRooms", 12]],
    },
    {
      id: "owl-40",
      file: "sowa-40-norkowa-na-kamieniu.jpg",
      title: "Norkowa na kamieniu",
      alt: "Sowa norkowa patrząca znad kamienia.",
      photographer: "Stefan Messing",
      sourceUrl: "https://www.pexels.com/photo/3622695/",
      requirement: "Odnów wszystkie 16 pomieszczeń w Łącz i Hoduj i osiągnij 10. poziom Sowiej Akademii.",
      goals: [["szklarniaRooms", 16], ["level", 10]],
    },
    // Fotografie 41–55 (uwaga G7, 2026-11-23): nowe sowy (gatunki, których w Galerii nie było), kozy, humbaki
    // i rośliny ozdobne (Monstery i storczyki) — pole `kind` (filtr rodzaju w zakładce „Galeria”). Wymagania
    // z kózek, humbaków i roślin we wszystkich grach; zdjęcia za Sowie Trójki dojdą z kartą gry w menu.
    {
      id: "owl-41",
      kind: "sowa",
      file: "sowa-41-puszczak-mszarny.jpg",
      title: "Puszczak mszarny",
      alt: "Puszczak mszarny z żółtymi oczami siedzący na omszałym pniu na skraju lasu.",
      photographer: "Alexas Fotos",
      sourceUrl: "https://www.pexels.com/photo/10768565/",
      requirement: "Osiągnij 12. poziom Sowiej Akademii.",
      goals: [["level", 12]],
    },
    {
      id: "owl-42",
      kind: "sowa",
      file: "sowa-42-syczek-w-rozwidleniu.jpg",
      title: "Syczek w rozwidleniu",
      alt: "Mała sówka syczek ukryta w rozwidleniu jasnego, łuskowatego pnia.",
      photographer: "Bitnik Gao",
      sourceUrl: "https://www.pexels.com/photo/30345313/",
      requirement: "Zdobądź 12 osiągnięć Sowiej Akademii.",
      goals: [["achievements", 12]],
    },
    {
      id: "owl-43",
      kind: "sowa",
      file: "sowa-43-sniezna-z-bliska.jpg",
      title: "Śnieżna z bliska",
      alt: "Sowa śnieżna z bliska — białe pióra w czarne kropki i bursztynowe oczy na ciemnym tle.",
      photographer: "Charles Pragnell",
      sourceUrl: "https://www.pexels.com/photo/2524403/",
      requirement: "Ukończ 11 rozdziałów Sowich Ogrodów — do Ogrodu zimowego włącznie.",
      goals: [["ogrodyChapters", 11]],
    },
    {
      id: "owl-44",
      kind: "koza",
      file: "koza-44-usmiechniete-kozlatko.jpg",
      title: "Uśmiechnięte koźlątko",
      alt: "Czarne koźlątko leżące na piasku — wygląda, jakby się uśmiechało.",
      photographer: "BLAXTAR ESSENTIALS",
      sourceUrl: "https://www.pexels.com/photo/9733333/",
      requirement: "Złap 40 skaczących kózek w grach zręcznościowych.",
      goals: [["goatsCaught", 40]],
    },
    {
      id: "owl-45",
      kind: "koza",
      file: "koza-45-mala-wspinaczka.jpg",
      title: "Mała wspinaczka",
      alt: "Biało-brązowe koźlątko wdrapuje się na kłodę i patrzy prosto w obiektyw.",
      photographer: "David Selbert",
      sourceUrl: "https://www.pexels.com/photo/7516858/",
      requirement: "Wznieś się na 2500 m w Sowie w Chmurach.",
      goals: [["jumperHeight", 2500]],
    },
    {
      id: "owl-46",
      kind: "koza",
      file: "koza-46-kozia-rodzina.jpg",
      title: "Kozia rodzina",
      alt: "Mama koza czule pochyla się nad koźlątkami w ciepłym, popołudniowym świetle.",
      photographer: "waqed walid",
      sourceUrl: "https://www.pexels.com/photo/15323161/",
      requirement: "Skorzystaj 15 razy z pomocy kózek w Łącz i Hoduj.",
      goals: [["szklarniaGoats", 15]],
    },
    {
      id: "owl-47",
      kind: "koza",
      file: "koza-47-laciata-na-lace.jpg",
      title: "Łaciata na łące",
      alt: "Łaciata koza skubie wysoką trawę na zielonej łące z mleczami.",
      photographer: "Thomas P",
      sourceUrl: "https://www.pexels.com/photo/17047218/",
      requirement: "Złap 80 skaczących kózek w grach zręcznościowych.",
      goals: [["goatsCaught", 80]],
    },
    {
      id: "owl-48",
      kind: "humbak",
      file: "humbak-48-w-skoku.jpg",
      title: "Humbak w skoku",
      alt: "Humbak wyskakuje wysoko nad szare morze, rozchlapując wodę.",
      photographer: "Andre Estevez",
      sourceUrl: "https://www.pexels.com/photo/3309869/",
      requirement: "Popłyń z humbakiem 15 razy w grach zręcznościowych.",
      goals: [["whaleRides", 15]],
    },
    {
      id: "owl-49",
      kind: "humbak",
      file: "humbak-49-kto-tu-plywa.jpg",
      title: "Kto tu pływa?",
      alt: "Humbak wynurza głowę z morza i macha długą, białą płetwą.",
      photographer: "Andre Estevez",
      sourceUrl: "https://www.pexels.com/photo/3309785/",
      requirement: "Ukończ kampanię Sowich Torów 3 razy.",
      goals: [["sowa3Finishes", 3]],
    },
    {
      id: "owl-50",
      kind: "humbak",
      file: "humbak-50-mama-i-maluch.jpg",
      title: "Mama i maluch",
      alt: "Mama humbak i młody humbak płyną tuż pod powierzchnią błękitnego oceanu.",
      photographer: "Elianne Dipp",
      sourceUrl: "https://www.pexels.com/photo/4802101/",
      requirement: "Popłyń z humbakiem 30 razy w grach zręcznościowych.",
      goals: [["whaleRides", 30]],
    },
    {
      id: "owl-51",
      kind: "humbak",
      file: "humbak-51-ogon-nad-oceanem.jpg",
      title: "Ogon nad oceanem",
      alt: "Ogon humbaka unosi się nad granatowym oceanem pod jasnym niebem.",
      photographer: "Stefanie Klenner",
      sourceUrl: "https://www.pexels.com/photo/4786532/",
      requirement: "Popłyń z humbakiem 50 razy w grach zręcznościowych.",
      goals: [["whaleRides", 50]],
    },
    {
      id: "owl-52",
      kind: "roslina",
      file: "roslina-52-monstera-albo.jpg",
      title: "Monstera albo",
      alt: "Biało-zielone liście pstrej Monstery albo przy podporze z mchu.",
      photographer: "Huy Phan",
      sourceUrl: "https://www.pexels.com/photo/8284916/",
      requirement: "Ukończ 18 rozdziałów Sowich Ogrodów — do Smoczej doliny włącznie.",
      goals: [["ogrodyChapters", 18]],
    },
    {
      id: "owl-53",
      kind: "roslina",
      file: "roslina-53-monstera-w-wazonie.jpg",
      title: "Monstera w wazonie",
      alt: "Dwa liście Monstery w szklanym wazonie na parapecie, za oknem ogród.",
      photographer: "Lisa Fotios",
      sourceUrl: "https://www.pexels.com/photo/1831126/",
      requirement: "Wyhoduj 8 hybryd w Łącz i Hoduj.",
      goals: [["szklarniaHybrids", 8]],
    },
    {
      id: "owl-54",
      kind: "roslina",
      file: "roslina-54-rozowy-storczyk.jpg",
      title: "Różowy storczyk",
      alt: "Różowe kwiaty storczyka falenopsis w zielonej szklarni.",
      photographer: "Emil Mondoa",
      sourceUrl: "https://www.pexels.com/photo/12701202/",
      requirement: "Ukończ 20 rozdziałów Sowich Ogrodów — do Łąki wróżek włącznie.",
      goals: [["ogrodyChapters", 20]],
    },
    {
      id: "owl-55",
      kind: "roslina",
      file: "roslina-55-bukiet-storczykow.jpg",
      title: "Bukiet storczyków",
      alt: "Bukiet różowych, purpurowych i białych storczyków w pełnym rozkwicie.",
      photographer: "Miguel Marmolejos Fernández",
      sourceUrl: "https://www.pexels.com/photo/4607177/",
      requirement: "Ukończ wszystkie 22 rozdziały Sowich Ogrodów i odnów wszystkie 16 pomieszczeń w Łącz i Hoduj.",
      goals: [["ogrodyChapters", 22], ["szklarniaRooms", 16]],
    },
    // Fotografie 56–58 (M5 Sowich Trójek, 2026-11-23): pisklęta, gwiazdki i wszystkie poziomy Sowich Trójek.
    {
      id: "owl-56",
      kind: "sowa",
      file: "sowa-56-piskle-puszczyka.jpg",
      title: "Pisklę puszczyka",
      alt: "Puchate pisklę puszczyka kreskowanego siedzące wśród wiosennych gałązek.",
      photographer: "Andrew Patrick Photo",
      sourceUrl: "https://www.pexels.com/photo/23897177/",
      requirement: "Wykluj 10 piskląt w Sowich Trójkach.",
      goals: [["trojkiOwlets", 10]],
    },
    {
      id: "owl-57",
      kind: "roslina",
      file: "roslina-57-fioletowy-storczyk.jpg",
      title: "Fioletowy storczyk",
      alt: "Kwiat fioletowego storczyka z bliska — płatki i żółty środek.",
      photographer: "Giovana Spiller",
      sourceUrl: "https://www.pexels.com/photo/13617457/",
      requirement: "Zbierz 60 gwiazdek w Sowich Trójkach.",
      goals: [["trojkiStars", 60]],
    },
    {
      id: "owl-58",
      kind: "koza",
      file: "koza-58-koziol-z-profilu.jpg",
      title: "Kozioł z profilu",
      alt: "Kozioł z długimi rogami i brodą, z profilu, na tle zielonej łąki.",
      photographer: "Michelle Chadwick",
      sourceUrl: "https://www.pexels.com/photo/30672371/",
      requirement: "Ukończ wszystkie 45 poziomów Sowich Trójek.",
      goals: [["trojkiLevels", 45]],
    },
  ]);

  // Rodzaje zdjęć (filtr w zakładce „Galeria”); zdjęcie bez pola `kind` to sowa (fotografie 1–40).
  const KINDS = Object.freeze([
    { id: "sowa", label: "Sowy" },
    { id: "koza", label: "Kozy" },
    { id: "humbak", label: "Humbaki" },
    { id: "roslina", label: "Rośliny" },
  ]);
  const kindOf = (photo) => photo?.kind || "sowa";

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
        // Identyfikatory zostają także nieznane tej wersji (np. zdjęcia dodane w nowszej wersji, otwartej na innym
        // urządzeniu) — zapis ich nie gubi; liczniki i lista Galerii biorą tylko znane zdjęcia (`snapshot`).
        unlocked: Array.isArray(raw.unlocked)
          ? [...new Set(raw.unlocked.filter((id) => typeof id === "string"))]
          : ["owl-01"],
        viewed: Array.isArray(raw.viewed) ? [...new Set(raw.viewed.filter((id) => typeof id === "string"))] : [],
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

  // Oznacza zdjęcie jako obejrzane (po obejrzeniu wszystkich — nagroda Akademii, przyznawana raz).
  function markViewed(id) {
    if (!loaded || !state.unlocked.includes(id) || state.viewed.includes(id)) return false;
    state.viewed.push(id);
    save();
    if (PHOTOS.every((photo) => state.viewed.includes(photo.id))) {
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
    KINDS,
    kindOf,
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
