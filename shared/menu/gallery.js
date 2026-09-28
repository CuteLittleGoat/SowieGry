// Zakładka „Galeria”: 30 zdjęć sów (window.SowieOwlGallery), filtry, zablokowane z wymaganiem i paskiem postępu,
// „Nowe!” z animacją odwrócenia oraz przeglądarka pełnoekranowa (przesuwanie, powiększanie, ulubione, tło menu).
import { ICONS } from "../ui/icons.js";
import { focusableIn } from "../ui/modal.js";

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  );

export function createGalleryTab({ root, gallery, academy, onSound = () => {}, onBackground = () => {} }) {
  const grid = root.querySelector("[data-gallery-grid]");
  const count = root.querySelector("[data-gallery-count]");
  const filters = root.querySelector("[data-gallery-filters]");
  let filter = "all";
  let announced = false;
  let viewer = null;

  const snapshot = () => gallery().snapshot();
  const photos = () => gallery().PHOTOS;
  const academySnapshot = () => academy()?.snapshot?.() || { level: 1, feathers: 0, metrics: {} };

  function tile(photo, state, index) {
    const unlocked = state.unlocked.includes(photo.id);
    const thumb = gallery().thumbUrl(photo, 400);
    const srcset = `${thumb} 400w, ${gallery().thumbUrl(photo, 600)} 600w`;
    const image = `<img src="${thumb}" srcset="${srcset}" sizes="(max-width: 767px) 46vw, (max-width: 1099px) 30vw, 200px" alt="${unlocked ? escapeHtml(photo.alt) : ""}" loading="lazy" decoding="async" width="400" height="300" />`;
    if (!unlocked) {
      const progress = gallery().progressOf(photo, academySnapshot());
      const percent = Math.round(progress.share * 100);
      return `<article class="menu-tile is-locked" data-photo="${photo.id}" aria-label="Zdjęcie ${index + 1} — zablokowane">
        <span class="menu-tile-photo">${image}<span class="menu-tile-lock"><span>${ICONS.lock}</span></span></span>
        <span class="menu-tile-need">${escapeHtml(photo.requirement)}</span>
        <span class="menu-progress" role="progressbar" aria-label="Postęp: ${percent}%" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span style="transform:scaleX(${progress.share})"></span></span>
      </article>`;
    }
    const isNew = !state.viewed.includes(photo.id);
    const favorite = state.favorite === photo.id;
    return `<button type="button" class="menu-tile${isNew ? " is-new" : ""}" data-photo="${photo.id}" data-open-photo="${photo.id}" aria-label="Otwórz zdjęcie: ${escapeHtml(photo.title)}${isNew ? " (nowe)" : ""}">
      <span class="menu-tile-photo">${image}${isNew ? '<span class="menu-tile-badge">Nowe!</span>' : ""}${favorite ? `<span class="menu-tile-heart" aria-label="Ulubione">${ICONS.heart}</span>` : ""}</span>
      <span class="menu-tile-title">${escapeHtml(photo.title)}</span>
    </button>`;
  }

  function render() {
    if (!gallery()?.isLoaded?.()) {
      count.textContent = "…";
      grid.innerHTML = "<p>Wczytuję galerię…</p>";
      return;
    }
    gallery().refreshUnlocks();
    const state = snapshot();
    count.textContent = `${state.unlockedCount} / ${state.total}`;
    const list = photos()
      .map((photo, index) => ({ photo, index, unlocked: state.unlocked.includes(photo.id) }))
      .filter(({ unlocked }) => filter === "all" || (filter === "unlocked" ? unlocked : !unlocked));
    grid.innerHTML = list.length
      ? list.map(({ photo, index }) => tile(photo, state, index)).join("")
      : `<p>${filter === "locked" ? "Wszystkie zdjęcia są już odblokowane!" : "Jeszcze nic tu nie ma."}</p>`;
    const newCount = state.unlocked.filter((id) => !state.viewed.includes(id)).length;
    if (newCount && !announced) {
      announced = true;
      onSound("hu-hu");
    }
  }

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    filter = button.dataset.filter;
    for (const other of filters.querySelectorAll("[data-filter]"))
      other.setAttribute("aria-pressed", String(other === button));
    render();
  });
  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-photo]");
    if (button) openViewer(button.dataset.openPhoto, button);
  });

  // ---------- Przeglądarka ----------

  function openViewer(id, trigger) {
    const state = snapshot();
    const unlocked = photos().filter((photo) => state.unlocked.includes(photo.id));
    let index = Math.max(
      0,
      unlocked.findIndex((photo) => photo.id === id),
    );
    const node = document.createElement("div");
    node.className = "menu-viewer";
    node.setAttribute("role", "dialog");
    node.setAttribute("aria-modal", "true");
    node.innerHTML = `
      <div class="menu-viewer-top">
        <span data-viewer-count></span>
        <button type="button" class="menu-icon-button" data-viewer="close" aria-label="Zamknij zdjęcie">${ICONS.close}</button>
      </div>
      <div class="menu-viewer-stage" data-viewer-stage>
        <img alt="" draggable="false" />
        <div class="menu-viewer-nav">
          <button type="button" class="menu-icon-button is-prev" data-viewer="prev" aria-label="Poprzednie zdjęcie">${ICONS.next}</button>
          <button type="button" class="menu-icon-button" data-viewer="next" aria-label="Następne zdjęcie">${ICONS.next}</button>
        </div>
      </div>
      <div class="menu-viewer-info">
        <h2 data-viewer-title></h2>
        <p data-viewer-credit></p>
        <div class="menu-viewer-actions">
          <button type="button" class="menu-button" data-viewer="favorite" aria-pressed="false">${ICONS.heart}<span>Ulubione</span></button>
          <button type="button" class="menu-button" data-viewer="background" aria-pressed="false">${ICONS.image}<span>Tło menu</span></button>
        </div>
      </div>`;
    document.body.appendChild(node);
    const image = node.querySelector("img");
    const stage = node.querySelector("[data-viewer-stage]");
    const transform = { scale: 1, x: 0, y: 0 };

    function apply(animate = false) {
      image.style.transition = animate ? "transform 180ms ease-out" : "none";
      image.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;
    }

    function show() {
      const photo = unlocked[index];
      const current = snapshot();
      Object.assign(transform, { scale: 1, x: 0, y: 0 });
      apply();
      // Najpierw miniatura (już w pamięci), potem pełne zdjęcie 1200 × 900.
      image.src = gallery().thumbUrl(photo, 600);
      const full = new Image();
      full.onload = () => {
        if (unlocked[index] === photo) image.src = full.src;
      };
      full.src = gallery().photoUrl(photo);
      image.alt = photo.alt;
      node.setAttribute("aria-label", `Zdjęcie: ${photo.title}`);
      node.querySelector("[data-viewer-count]").textContent = `${index + 1} / ${unlocked.length}`;
      node.querySelector("[data-viewer-title]").textContent = photo.title;
      node.querySelector("[data-viewer-credit]").innerHTML =
        `Fot. ${escapeHtml(photo.photographer)} · <a href="${escapeHtml(photo.sourceUrl)}" target="_blank" rel="noopener noreferrer">źródło: Pexels</a>`;
      node
        .querySelector('[data-viewer="favorite"]')
        .setAttribute("aria-pressed", String(current.favorite === photo.id));
      node
        .querySelector('[data-viewer="background"]')
        .setAttribute("aria-pressed", String(current.background === photo.id));
      node.querySelector('[data-viewer="prev"]').hidden = unlocked.length < 2;
      node.querySelector('[data-viewer="next"]').hidden = unlocked.length < 2;
      gallery().markViewed(photo.id);
    }

    function go(step) {
      if (unlocked.length < 2) return;
      index = (index + step + unlocked.length) % unlocked.length;
      show();
    }

    function close() {
      document.removeEventListener("keydown", onKey, true);
      node.remove();
      viewer = null;
      render();
      (grid.querySelector(`[data-open-photo="${unlocked[index]?.id}"]`) || trigger)?.focus?.({ preventScroll: true });
    }

    function onKey(event) {
      if (event.key === "Tab") {
        // Fokus zostaje w przeglądarce zdjęć.
        const nodes = focusableIn(node);
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (!node.contains(document.activeElement)) {
          event.preventDefault();
          first?.focus();
        }
        return;
      }
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else return;
      event.preventDefault();
      event.stopPropagation();
    }

    node.addEventListener("click", (event) => {
      const action = event.target.closest("[data-viewer]")?.dataset.viewer;
      const photo = unlocked[index];
      if (action === "close") close();
      else if (action === "next") go(1);
      else if (action === "prev") go(-1);
      else if (action === "favorite") {
        const on = gallery().setFavorite(photo.id);
        node.querySelector('[data-viewer="favorite"]').setAttribute("aria-pressed", String(on));
        if (on) onSound("klik");
      } else if (action === "background") {
        const current = snapshot().background === photo.id;
        gallery().setBackground(current ? null : photo.id);
        node.querySelector('[data-viewer="background"]').setAttribute("aria-pressed", String(!current));
        onBackground();
      }
    });

    // Gesty: przesunięcie w bok — następne / poprzednie, w dół — zamknij; dwa palce — powiększanie;
    // podwójne stuknięcie — powiększenie ×2,5 w miejscu stuknięcia.
    const pointers = new Map();
    let pinch = null;
    let swipe = null;
    let lastTap = 0;
    stage.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      try {
        stage.setPointerCapture?.(event.pointerId);
      } catch (_error) {
        // Zdarzenie bez prawdziwego wskaźnika (np. syntetyczne) — gest działa i bez przechwycenia.
      }
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale: transform.scale, x: transform.x, y: transform.y };
        swipe = null;
      } else if (pointers.size === 1) {
        swipe = { x: event.clientX, y: event.clientY, startX: transform.x, startY: transform.y, moved: false };
      }
    });
    stage.addEventListener("pointermove", (event) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        transform.scale = Math.min(4, Math.max(1, (pinch.scale * distance) / pinch.distance));
        if (transform.scale === 1) Object.assign(transform, { x: 0, y: 0 });
        apply();
      } else if (swipe) {
        const dx = event.clientX - swipe.x;
        const dy = event.clientY - swipe.y;
        if (Math.hypot(dx, dy) > 8) swipe.moved = true;
        if (transform.scale > 1) {
          transform.x = swipe.startX + dx;
          transform.y = swipe.startY + dy;
        } else {
          transform.x = Math.abs(dx) > Math.abs(dy) ? dx : 0;
          transform.y = dy > 0 && Math.abs(dy) > Math.abs(dx) ? dy : 0;
        }
        apply();
      }
    });
    const end = (event) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.delete(event.pointerId);
      if (pinch) {
        if (pointers.size < 2) pinch = null;
        return;
      }
      if (!swipe) return;
      const dx = event.clientX - swipe.x;
      const dy = event.clientY - swipe.y;
      const moved = swipe.moved;
      swipe = null;
      if (!moved) {
        // Podwójne stuknięcie: powiększenie ×2,5 w miejscu stuknięcia albo powrót do całego zdjęcia.
        const now = performance.now();
        if (now - lastTap < 320) {
          lastTap = 0;
          if (transform.scale > 1) Object.assign(transform, { scale: 1, x: 0, y: 0 });
          else {
            const rect = stage.getBoundingClientRect();
            transform.scale = 2.5;
            transform.x = (rect.left + rect.width / 2 - event.clientX) * 1.5;
            transform.y = (rect.top + rect.height / 2 - event.clientY) * 1.5;
          }
          apply(true);
          return;
        }
        lastTap = now;
        return;
      }
      if (transform.scale > 1) return;
      if (dx < -60 && Math.abs(dx) > Math.abs(dy)) go(1);
      else if (dx > 60 && Math.abs(dx) > Math.abs(dy)) go(-1);
      else if (dy > 90) {
        close();
        return;
      } else {
        Object.assign(transform, { x: 0, y: 0 });
        apply(true);
      }
    };
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);
    // Myszka: podwójne kliknięcie obsługują zdarzenia wskaźnika powyżej (bez zaznaczania tekstu).
    stage.addEventListener("dblclick", (event) => event.preventDefault());

    document.addEventListener("keydown", onKey, true);
    show();
    node.querySelector('[data-viewer="close"]').focus({ preventScroll: true });
    viewer = { node, close, state: () => ({ index, total: unlocked.length, ...transform }) };
    return viewer;
  }

  return { render, openViewer, viewer: () => viewer };
}
