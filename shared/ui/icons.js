// Ikony interfejsu (inline SVG w kolorze tekstu — bez emoji, które wyglądają inaczej na każdym telefonie).

const icon = (body) =>
  `<svg class="sowie-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICONS = Object.freeze({
  pause: icon('<path d="M8.5 5.5v13M15.5 5.5v13" stroke-width="3.4"/>'),
  play: icon('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>'),
  restart: icon('<path d="M5.5 12a6.5 6.5 0 1 0 2-4.7"/><path d="M4.5 4.5v4.5H9"/>'),
  help: icon(
    '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.6"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>',
  ),
  settings: icon(
    '<path d="M12 3.4v2.4M12 18.2v2.4M3.4 12h2.4M18.2 12h2.4M5.9 5.9l1.7 1.7M16.4 16.4l1.7 1.7M5.9 18.1l1.7-1.7M16.4 7.6l1.7-1.7" stroke-width="3.8"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2.2"/>',
  ),
  wardrobe: icon(
    '<path d="M12 12 5 7.5v9L12 12l7 4.5v-9z" fill="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/>',
  ),
  home: icon('<path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10v9h11v-9"/><path d="M10.5 19v-4.5h3V19"/>'),
  close: icon('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'),
  back: icon('<path d="M14.5 5.5 8 12l6.5 6.5"/>'),
  star: icon(
    '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="currentColor" stroke-width="1.6"/>',
  ),
  // Menu główne (E3): zakładki, stan zapisu, galeria.
  games: icon(
    '<rect x="3" y="7" width="18" height="11" rx="5.5"/><path d="M8 10.5v4M6 12.5h4"/><circle cx="15.5" cy="11.5" r=".9" fill="currentColor"/><circle cx="17.5" cy="13.8" r=".9" fill="currentColor"/>',
  ),
  guide: icon(
    '<path d="M4 5.5c3-1.3 5.5-1 8 .8 2.5-1.8 5-2.1 8-.8v13c-3-1.3-5.5-1-8 .8-2.5-1.8-5-2.1-8-.8z"/><path d="M12 6.3v13"/>',
  ),
  gallery: icon(
    '<rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17l5-4.5 3.5 3 3-2.5 4.5 4"/>',
  ),
  owl: icon(
    '<path d="M6 7 4.5 3.5 9 5.5M18 7l1.5-3.5L15 5.5"/><path d="M5 11a7 7 0 0 1 14 0v3.5a7 7 0 0 1-14 0z"/><circle cx="9.3" cy="11" r="2"/><circle cx="14.7" cy="11" r="2"/><path d="M11 14.3l1 1.3 1-1.3"/>',
  ),
  cloud: icon('<path d="M7 18.5h10.5a4 4 0 0 0 .6-8 6 6 0 0 0-11.6 1.5A3.3 3.3 0 0 0 7 18.5z"/>'),
  cloudOk: icon(
    '<path d="M7 18.5h10.5a4 4 0 0 0 .6-8 6 6 0 0 0-11.6 1.5A3.3 3.3 0 0 0 7 18.5z"/><path d="M9.5 14l2 2 3.5-4"/>',
  ),
  cloudOff: icon(
    '<path d="M7 18.5h10.5a4 4 0 0 0 .6-8 6 6 0 0 0-11.6 1.5A3.3 3.3 0 0 0 7 18.5z"/><path d="M4 4l16 16"/>',
  ),
  heart: icon('<path d="M12 19.5s-7.5-4.4-7.5-10a4.2 4.2 0 0 1 7.5-2.6 4.2 4.2 0 0 1 7.5 2.6c0 5.6-7.5 10-7.5 10z"/>'),
  lock: icon('<rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
  next: icon('<path d="M9.5 5.5 16 12l-6.5 6.5"/>'),
  image: icon('<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M3.5 15.5l5-4 4 3 3-2.5 5 4"/>'),
  download: icon('<path d="M12 4.5v11M7.5 11l4.5 4.5 4.5-4.5"/><path d="M5 19.5h14"/>'),
  share: icon('<path d="M12 15V4.5M8 8.5l4-4 4 4"/><path d="M6 12.5v6.5h12v-6.5"/>'),
});
