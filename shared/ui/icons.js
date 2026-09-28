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
    '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
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
});
