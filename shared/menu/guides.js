// Zakładka „Jak grać”: wszystkie instrukcje z shared/meta/guides-data.js — najpierw „Poznaj Sowi Świat”, potem gry.
// Karty przewijane w bok (shared/ui/guide-view.js); obrazki postaci z atlasu, gdy jest gotowy.
import { GUIDE_ORDER, guideFor } from "../meta/guides-data.js";
import { renderGuide } from "../ui/guide-view.js";
import { SPRITES } from "../world/catalog.js";

export function renderGuidesTab({ root, atlas = null }) {
  root.replaceChildren(
    ...GUIDE_ORDER.map((id) => {
      const guide = guideFor(id);
      const section = document.createElement("section");
      section.className = "menu-guide";
      section.id = `jak-grac-${id}`;
      section.dataset.guide = id;
      section.setAttribute("aria-labelledby", `jak-grac-${id}-title`);
      const title = document.createElement("h3");
      title.id = `jak-grac-${id}-title`;
      title.textContent = guide.title;
      section.append(title, renderGuide(guide, { atlas, sprites: SPRITES, headingLevel: 4 }));
      return section;
    }),
  );
}
