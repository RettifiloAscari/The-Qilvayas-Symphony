#!/usr/bin/env python3
"""Anchored edit: assert the anchor occurs exactly N times, then replace or insert.

A silent zero-match is the failure mode this exists to prevent. Editing a generator
with a plain sed or a bare string replace can quietly do nothing, the build still
passes, and the change is discovered missing three commits later. Every edit to a
file in scripts/ should go through this, or through an equivalent read/assert/write.

  tools/anchor.py replace FILE ANCHORFILE NEWFILE [--count N]
  tools/anchor.py before  FILE ANCHORFILE NEWFILE [--count N]
  tools/anchor.py after   FILE ANCHORFILE NEWFILE [--count N]

ANCHORFILE and NEWFILE are files rather than arguments on purpose: generator prose
contains quotes, backslashes and \\uXXXX escapes that do not survive a shell.

Two conveniences, both learned the hard way:

  * A heredoc-written anchor picks up a trailing newline. If that stops it matching,
    it is stripped.
  * A heredoc-written REPLACEMENT also picks up a trailing newline, and if the anchor
    sits inside a single-line construct -- a JS string literal, say -- that newline
    breaks the file. It is stripped when the anchor spans no newline of its own.

Exit status is non-zero on a count mismatch, and nothing is written.
"""
import sys


def main(argv):
    if len(argv) < 4:
        print(__doc__)
        return 2

    mode, path, anchor_path, new_path = argv[0], argv[1], argv[2], argv[3]
    want = 1
    if '--count' in argv:
        want = int(argv[argv.index('--count') + 1])

    src = open(path, encoding='utf-8').read()
    anchor = open(anchor_path, encoding='utf-8').read()
    new = open(new_path, encoding='utf-8').read()

    if anchor.endswith('\n') and anchor.rstrip('\n') in src and src.count(anchor) != want:
        anchor = anchor.rstrip('\n')

    if new.endswith('\n') and '\n' not in anchor:
        new = new.rstrip('\n')

    n = src.count(anchor)
    if n != want:
        sys.stderr.write('ANCHOR MISMATCH in %s: found %d, expected %d\n' % (path, n, want))
        sys.stderr.write('anchor was: %r\n' % anchor[:300])
        return 1

    if mode == 'replace':
        out = src.replace(anchor, new)
    elif mode == 'before':
        out = src.replace(anchor, new + anchor)
    elif mode == 'after':
        out = src.replace(anchor, anchor + new)
    else:
        sys.stderr.write('unknown mode %r (use replace, before or after)\n' % mode)
        return 2

    open(path, 'w', encoding='utf-8').write(out)
    print('%s: %s x%d ok (%+d bytes)' % (path, mode, n, len(out) - len(src)))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
