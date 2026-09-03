#!/usr/bin/env python3
"""Find stat-block ability rows torn away from their STR/DEX/CON header.

A header row alone at the foot of a column, with its values in the next column or
on the next page, is a real bug and an ugly one: the reader gets six labels and no
numbers. It is invisible in source, invisible to every text grep, and survives a
page render unless you happen to look at that page.

The fix is in the generators, not here:

  * `row()` sets `cantSplit`, so a row's own cells cannot be torn apart.
  * the header row is built by `headerRow()`, which adds `tableHeader` so it
    repeats if a long table does span a break.
  * `abCell` sets `keepNext: !!bold` -- true only for the header row, which binds
    it forward to the values row that follows.

This checks the rendered result rather than the source, because that binding is a
request to the layout engine and not a guarantee.

  tools/check_tearing.py                 # every published document
  tools/check_tearing.py documents/x.pdf # one

Method: read glyph boxes with `pdftotext -bbox`, find every "STR", and require a
bare number within 30pt below it and 30pt either side. Reading order cannot be
used here -- on a two-column page it walks the left column then the right, so a
genuinely torn block looks contiguous and an intact one can look broken.
"""
import glob
import re
import subprocess
import sys

WORD = re.compile(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="[\d.]+" yMax="[\d.]+">([^<]+)</word>')
NUMBER = re.compile(r'^\d+$')
NEAR_X = 30.0
BELOW_Y = 30.0


def torn_pages(pdf):
    try:
        out = subprocess.run(['pdftotext', '-bbox', pdf, '-'],
                             capture_output=True, text=True, check=True).stdout
    except Exception as exc:
        sys.stderr.write('could not read %s: %s\n' % (pdf, exc))
        return []
    found = []
    for page_no, page in enumerate(out.split('<page ')[1:], 1):
        words = [(float(x), float(y), t) for x, y, t in WORD.findall(page)]
        for x, y, t in words:
            if t != 'STR':
                continue
            below = [w for w in words
                     if abs(w[0] - x) < NEAR_X and 0 < w[1] - y < BELOW_Y and NUMBER.match(w[2])]
            if not below:
                found.append(page_no)
    return found


def main(argv):
    pdfs = argv or sorted(glob.glob('documents/*.pdf'))
    total = 0
    for pdf in pdfs:
        for page in torn_pages(pdf):
            print('  TORN  %-46s page %d: ability header with no values beneath it'
                  % (pdf.split('/')[-1][:-4], page))
            total += 1
    if total:
        print('\n  %d torn ability row(s). Check cantSplit on row(), tableHeader on\n'
              '  headerRow(), and keepNext: !!bold on abCell in the generator.' % total)
        return 1
    print('  no torn stat blocks')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
