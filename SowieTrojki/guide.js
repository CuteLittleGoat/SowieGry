// Sowie Trójki — instrukcja „Jak grać?” (Analiza 5, rozdz. 13: Cel gry, Ruch, Moce, Przeszkody, Sówka i Sowia pomoc,
// Gwiazdki). Format jak w shared/meta/guides-data.js (karty z obrazkiem z atlasu i pokazem gestu). Po włączeniu gry
// do menu (etap M5) instrukcja przejdzie do guides-data.js pod kluczem `trojki`.
export const GUIDE = Object.freeze({
  id: "trojki",
  title: "Sowie Trójki",
  summary:
    "Zamieniaj sąsiednie kafelki, żeby ułożyć trzy takie same w rzędzie albo w kolumnie. Sówka kibicuje Ci z gałęzi!",
  cards: [
    {
      id: "cel",
      title: "Cel poziomu",
      text: "U góry widać cel (np. „Zbierz 20 truskawek”) i liczbę ruchów. Zrób cel, zanim skończą się ruchy.",
      sprite: "trojki-truskawka",
    },
    {
      id: "ruch",
      title: "Ruch",
      text: "Przesuń kafelek palcem na sąsiednie pole albo stuknij dwa sąsiednie kafelki po kolei.",
      sprite: "lisc-zielony",
      gesture: "swipe-right",
      tip: "Ruch bez trójki wraca na miejsce i nie zabiera ruchu.",
    },
    {
      id: "moce",
      title: "Moce",
      text: "4 w linii — Pióro (cały rząd), kwadrat — Pisklę (leci do celu), L albo T — Bąbel (wszystko dookoła), 5 w linii — Tęczowy liść (wszystkie takie same). Stuknij moc albo ją przesuń; dwie moce razem robią coś wielkiego!",
      sprite: "trojki-pioro",
      gesture: "tap",
    },
    {
      id: "przeszkody",
      title: "Pracu Pracu i Amic",
      text: "Karteczki Pracu zerwiesz trójkami obok, skrzynie Amic rozbijesz tak samo. Kanister Amic rozbijesz tylko mocą, a telefon Pracu dokleja karteczki, gdy go nie trafiasz.",
      sprite: "pracu-telefon",
    },
    {
      id: "jajka",
      title: "Jajka i gniazda",
      text: "Sprowadź jajko na dół do gniazda — wykluje się pisklę i poleci do Sówki.",
      sprite: "trojki-jajko",
    },
    {
      id: "sowka",
      title: "Sówka i Sowia pomoc",
      text: "Im większe combo, tym bardziej Sówka się cieszy. Gdy pasek „Radość Sówki” jest pełny, stuknij Sówkę — zrzuci 3 Pióra, a ruch nie przepadnie.",
      sprite: "sowa-zachwyt",
      gesture: "tap",
    },
    {
      id: "gwiazdki",
      title: "Gwiazdki i Humbaczy Finał",
      text: "Za wygraną jest gwiazdka, za dużo punktów — dwie albo trzy. Pozostałe ruchy humbak zamienia w Pióra. Bez żyć i czekania — przegrany poziom grasz od razu jeszcze raz.",
      sprite: "humbak",
    },
  ],
});
