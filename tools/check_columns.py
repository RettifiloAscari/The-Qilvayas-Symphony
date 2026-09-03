#!/usr/bin/env python3
"""Find table columns too narrow to hold their own longest word.

Since the columnWidths fix, LibreOffice honours the widths arrays instead of
splitting every table evenly. That is what makes the tables legible -- and it also
means a column authored at 12% is now genuinely 12%, where before it silently got
an equal share. A column narrower than its longest unbreakable word gets split
mid-syllable: "Doma / in", "Wolfm / oon 1", "Noncombata / nt".

This reports those before a build rather than after a page render.

  tools/check_columns.py                 # every two-column document
  tools/check_columns.py scripts/foo.js  # one file

The estimate is deliberately conservative (0.058in per character at 9pt), so a
report within about 0.02in of fitting is inside the error bar -- render the page
with pdftoppm and look rather than widening on the strength of this alone.

Three fixes, in order of preference:

  1. Shorten the cell text. Usually the right answer; a table cell wants a label,
     not a sentence.
  2. Widen the column, taking the difference from the WIDEST column only. Never
     redistribute proportionally to slack: prose columns have short words, measure
     as slack, and get gutted.
  3. Restructure. Four columns do not fit a two-column body, and five certainly do
     not. Merge columns, or convert the table to full-width B() entries -- which is
     what the Factions list and the Canon of Saints became.

Single-column documents are exempt and are named in tools/pipeline.conf; their
tables get the full page width.
"""
import glob
import os
import re
import sys


def conf(key, default):
    """Read one value from tools/pipeline.conf, so this file stays identical
    across repositories and only the config differs."""
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pipeline.conf')
    try:
        for line in open(path, encoding='utf-8'):
            line = line.strip()
            if line.startswith(key + '='):
                return line.split('=', 1)[1].strip().strip('"').strip("'")
    except OSError:
        pass
    return default


# Usable text width of one column of the two-column body, in inches.
COL_IN = float(conf('COLUMN_WIDTH_IN', '3.30'))
PAD_IN = 0.06

# Measured from real glyph extents (pdftotext -bbox) on the published sourcebook:
# 9pt Lato runs a median 0.059in per character, with a long tail to 0.077 for
# capital- and m/w-heavy words. A single threshold therefore cannot be honest, so
# the report is banded by how far over the line a word actually is.
CHAR_IN = 0.059
CERTAIN = 1.25    # need/avail above this will break, every time
LIKELY = 1.05     # above this, probably breaks -- render the page and look

SINGLE_COLUMN = set(conf('SINGLE_COLUMN_GENERATORS', '').split())

# A line may break after any of these, so they end an unbreakable run.
BREAKABLE = re.compile(r'[\s\-\u2010-\u2015/]+')

TABLE_CALL = re.compile(
    r'l?table\(\s*(\[[^\]]*\])\s*,\s*(\[[\d,\s.]+\])\s*,\s*(\[.*?\n?\s*\])\s*\)', re.S)


def check(path):
    src = open(path, encoding='utf-8').read()
    findings = []
    for m in TABLE_CALL.finditer(src):
        try:
            headers = eval(m.group(1))
            widths = eval(m.group(2))
            rows = eval(m.group(3))
        except Exception:
            continue
        if len(widths) != len(headers):
            continue
        line = src.count('\n', 0, m.start()) + 1
        for ci, w in enumerate(widths):
            avail = COL_IN * w / 100.0 - PAD_IN
            cells = [headers[ci]] + [r[ci] for r in rows if len(r) > ci]
            # A line breaks at spaces AND at hyphens and dashes, so the unbreakable
            # unit is a run between them -- "Censor-Captain" wraps quite legally as
            # "Censor-" / "Captain". Splitting only on spaces flags those as breaks
            # and buries the real findings in noise.
            words = [x for c in cells for x in BREAKABLE.split(str(c)) if x]
            if not words:
                continue
            word = max(words, key=len)
            need = len(word) * CHAR_IN
            if need > avail:
                findings.append((line, ci, w, len(widths), word, need, avail))
    return findings


def band(ratio):
    if ratio >= CERTAIN:
        return 'BREAKS  '
    if ratio >= LIKELY:
        return 'likely  '
    return 'marginal'


def main(argv):
    verbose = '-v' in argv
    paths = [a for a in argv if not a.startswith('-')] or sorted(glob.glob('scripts/*.js'))
    breaks = likely = marginal = 0
    for path in paths:
        name = path.split('/')[-1]
        if name in SINGLE_COLUMN:
            continue
        for line, ci, w, ncols, word, need, avail in check(path):
            ratio = need / avail
            b = band(ratio)
            if b.startswith('BREAKS'):
                breaks += 1
            elif b.startswith('likely'):
                likely += 1
            else:
                marginal += 1
                if not verbose:
                    continue      # inside the measurement spread; noise by default
            wide = '  [%d columns: restructure, do not widen]' % ncols if ncols >= 4 else ''
            print('%s  %s:%d  col %d at %s%%: "%s" (%.2f of the width)%s'
                  % (b, name, line, ci, w, word, ratio, wide))

    if marginal and not verbose:
        print('%d marginal finding(s) suppressed - inside the measurement spread; '
              'pass -v to see them.' % marginal)
    if not (breaks or likely or marginal):
        print('no starved columns')

    # Only a certain break is a failure. "likely" is a prompt to render the page and
    # look, not a verdict -- a script that fails on findings the reader will dismiss
    # is a script the reader stops running.
    return 1 if breaks else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
