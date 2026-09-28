"""Buduje czcionki SowieGry z Fredoki (licencja SIL OFL 1.1, bez zastrzeżonej nazwy).

Fredoka z Google Fonts nie ma gotowych polskich liter z ogonkami i kreskami (ą ć ę ń ś ź ż),
ma za to znaki łączące (U+0301, U+0307, U+0328) i kotwice GPOS mark-to-base.
Skrypt:
  1. tworzy statyczne odmiany 500 i 700 (szerokość 100) z czcionki zmiennej,
  2. dokłada 14 polskich liter jako glify złożone (litera + znak) w miejscach z kotwic GPOS,
  3. zostawia tylko potrzebne znaki (łacina, polskie litery, typografia) i zapisuje WOFF2.

Uruchomienie (jednorazowo, wynik jest w repo):
  pip install fonttools brotli
  python3 scripts/make-fonts.py ścieżka/do/Fredoka[wdth,wght].ttf
Źródło: https://github.com/google/fonts/tree/main/ofl/fredoka
"""

import sys
from pathlib import Path

from fontTools.pens.recordingPen import DecomposingRecordingPen  # noqa: F401 (sprawdza instalację)
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphComponent
from fontTools.varLib.instancer import instantiateVariableFont

OUT = Path(__file__).resolve().parent.parent / "assets" / "fonts"
WEIGHTS = (500, 700)

# nazwa glifu: (kod, litera bazowa, znak łączący)
POLISH = {
    "aogonek": (0x0105, "a", "uni0328"),
    "cacute": (0x0107, "c", "acutecomb"),
    "eogonek": (0x0119, "e", "uni0328"),
    "nacute": (0x0144, "n", "acutecomb"),
    "sacute": (0x015B, "s", "acutecomb"),
    "zacute": (0x017A, "z", "acutecomb"),
    "zdotaccent": (0x017C, "z", "uni0307"),
    "Aogonek": (0x0104, "A", "uni0328"),
    "Cacute": (0x0106, "C", "acutecomb.case"),
    "Eogonek": (0x0118, "E", "uni0328"),
    "Nacute": (0x0143, "N", "acutecomb.case"),
    "Sacute": (0x015A, "S", "acutecomb.case"),
    "Zacute": (0x0179, "Z", "acutecomb.case"),
    "Zdotaccent": (0x017B, "Z", "uni0307.case"),
}

# Znaki zostawiane w czcionce: ASCII, Latin-1, polskie litery i typografia używana w interfejsie.
UNICODES = (
    list(range(0x20, 0x7F))
    + list(range(0xA0, 0x100))
    + [cp for cp, _, _ in POLISH.values()]
    + [0x0141, 0x0142, 0x2013, 0x2014, 0x2018, 0x2019, 0x201A, 0x201C, 0x201D, 0x201E, 0x2022, 0x2026, 0x20AC, 0x2212]
)


def anchor_offsets(font):
    """Zwraca {(baza, znak): (dx, dy)} z tabeli GPOS mark-to-base."""
    offsets = {}
    for lookup in font["GPOS"].table.LookupList.Lookup:
        if lookup.LookupType != 4:
            continue
        for sub in lookup.SubTable:
            marks = sub.MarkCoverage.glyphs
            bases = sub.BaseCoverage.glyphs
            for mark_index, mark in enumerate(marks):
                record = sub.MarkArray.MarkRecord[mark_index]
                mark_anchor = record.MarkAnchor
                for base_index, base in enumerate(bases):
                    base_anchor = sub.BaseArray.BaseRecord[base_index].BaseAnchor[record.Class]
                    if base_anchor is None:
                        continue
                    offsets.setdefault(
                        (base, mark), (base_anchor.XCoordinate - mark_anchor.XCoordinate, base_anchor.YCoordinate - mark_anchor.YCoordinate)
                    )
    return offsets


def add_polish(font):
    offsets = anchor_offsets(font)
    glyf = font["glyf"]
    hmtx = font["hmtx"]
    order = list(font.getGlyphOrder())
    for name, (codepoint, base, mark) in POLISH.items():
        if (base, mark) not in offsets:
            raise SystemExit(f"Brak kotwicy GPOS dla {base} + {mark}")
        dx, dy = offsets[(base, mark)]
        glyph = Glyph()
        glyph.numberOfContours = -1
        glyph.components = []
        for component_name, x, y in ((base, 0, 0), (mark, dx, dy)):
            component = GlyphComponent()
            component.glyphName = component_name
            component.x, component.y = x, y
            component.flags = 0x4  # ROUND_XY_TO_GRID (jak w gotowych literach Fredoki, np. aacute)
            glyph.components.append(component)
        glyph.components[0].flags |= 0x200  # USE_MY_METRICS
        glyf.glyphs[name] = glyph
        order.append(name)
        hmtx[name] = hmtx[base]
        glyph.recalcBounds(glyf)
        for table in font["cmap"].tables:
            if table.isUnicode():
                table.cmap[codepoint] = name
    font.setGlyphOrder(order)
    glyf.glyphOrder = order
    font["maxp"].numGlyphs = len(order)


def build(source, weight):
    font = TTFont(source)
    static = instantiateVariableFont(font, {"wght": weight, "wdth": 100}, updateFontNames=True)
    add_polish(static)
    options = Options()
    options.layout_features = ["kern", "liga", "mark", "mkmk", "ccmp"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    subsetter = Subsetter(options)
    subsetter.populate(unicodes=UNICODES)
    subsetter.subset(static)
    static.flavor = "woff2"
    target = OUT / f"fredoka-{weight}.woff2"
    static.save(target)
    print(f"{target.name}: {target.stat().st_size} B")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    for value in WEIGHTS:
        build(sys.argv[1], value)
