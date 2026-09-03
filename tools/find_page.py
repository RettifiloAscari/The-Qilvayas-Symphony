#!/usr/bin/env python3
"""Find which PDF page a string lands on, so it can be rendered and looked at.

Rendering bugs are invisible in source and the escape and font checks in build.sh
cannot see them. The only way to catch a table breaking words mid-syllable, or a
DM marker that came out italic, is to render the page and look:

  tools/find_page.py "Halvard of the Quiet Rite"
  pdftoppm -r 110 -png -f 9 -l 9 documents/<doc>.pdf /tmp/page

Searches every published document unless one is named:

  tools/find_page.py "Revenants" Gazetteer
"""
import glob
import subprocess
import sys


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    needle = argv[0]
    which = argv[1] if len(argv) > 1 else ''

    hits = 0
    for pdf in sorted(glob.glob('documents/*.pdf')):
        name = pdf.split('/')[-1][:-4]
        if which and which.lower() not in name.lower():
            continue
        try:
            text = subprocess.run(['pdftotext', pdf, '-'],
                                  capture_output=True, text=True, check=True).stdout
        except Exception as exc:
            sys.stderr.write('could not read %s: %s\n' % (pdf, exc))
            continue
        pages = text.split('\f')
        for i, page in enumerate(pages, 1):
            if needle in page:
                print('%-52s page %-4d  pdftoppm -r 110 -png -f %d -l %d %s out'
                      % (name, i, i, i, pdf))
                hits += 1
    if not hits:
        print('not found in any published document')
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
