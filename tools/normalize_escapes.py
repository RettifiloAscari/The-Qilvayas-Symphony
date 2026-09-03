#!/usr/bin/env python3
"""Normalize typographic characters in the generator scripts to \\uXXXX escapes.

Compose prose in the generators with real characters -- curly quotes, em dashes,
ellipses, accents -- and run this afterward. Hand-escaping while writing is slow
and it is exactly where the doubled-backslash bug comes from: a run written as
\\\\u2019 compiles clean, passes the non-ASCII scanner, and leaks a literal
\\u2019 into the rendered PDF.

Three passes, in this order:

  1. Collapse an already-doubled escape (backslash backslash u + 4 hex) back to a
     single escape. This makes the tool idempotent and repairs the bug directly.
  2. Convert every non-ASCII character to its \\uXXXX escape.
  3. Convert a straight apostrophe BETWEEN TWO WORD CHARACTERS to \\u2019.

Pass 3 is deliberately narrow. A wider rule matches require('docx') and corrupts
the generator on the first line of the file; (\\w)'(\\w) cannot.

Usage:  tools/normalize_escapes.py scripts/*.js
        tools/normalize_escapes.py --check scripts/*.js   # report, do not write
"""
import re
import sys

DOUBLED = re.compile(r'\\\\u([0-9a-fA-F]{4})')
NONASCII = re.compile(r'[^\x00-\x7F]')
APOSTROPHE = re.compile(r'(\w)\'(\w)')


def normalize(text):
    counts = {'doubled': 0, 'nonascii': 0, 'apostrophe': 0}

    def _undouble(m):
        counts['doubled'] += 1
        return '\\u' + m.group(1)

    def _escape(m):
        counts['nonascii'] += 1
        return '\\u%04x' % ord(m.group(0))

    def _curl(m):
        counts['apostrophe'] += 1
        return m.group(1) + '\\u2019' + m.group(2)

    text = DOUBLED.sub(_undouble, text)
    text = NONASCII.sub(_escape, text)
    text = APOSTROPHE.sub(_curl, text)
    return text, counts


def main(argv):
    check = '--check' in argv
    paths = [a for a in argv if not a.startswith('--')]
    if not paths:
        print(__doc__)
        return 2

    dirty = 0
    for path in paths:
        with open(path, encoding='utf-8') as fh:
            original = fh.read()
        result, counts = normalize(original)
        if result == original:
            continue
        dirty += 1
        summary = ', '.join('%s %s' % (v, k) for k, v in counts.items() if v)
        print('%-28s %s%s' % (path, summary, '' if check else '  -> rewritten'))
        if not check:
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(result)

    if check and dirty:
        print('%d file(s) need normalizing' % dirty)
        return 1
    if not dirty:
        print('all clean')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
