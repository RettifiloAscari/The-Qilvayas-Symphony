#!/usr/bin/env python3
"""Make a Ghostscript-rewritten PDF reproducible.

LibreOffice and Ghostscript both stamp per-run randomness into a PDF —
timestamps, a trailer /ID, a /DocChecksum, XMP UUIDs, and random six-letter
font subset tags — so two builds of identical content differ byte-for-byte and
churn the git history for no reason. This rewrites each source of randomness to
a fixed value of identical byte length, leaving xref offsets valid, so the same
content always yields the same bytes.

Run it on the gs-normalized PDF (see tools/build.sh), not the raw LibreOffice
export: gs first collapses LibreOffice's nondeterministic font subsetting into a
stable form this can finish canonicalizing.
"""
import re, sys


def normalize(path):
    d = open(path, "rb").read()

    # PDF date literals: zero the digits, keep any timezone suffix and length
    d = re.sub(rb'(/(?:Creation|Mod)Date\(D:)(\d+)',
               lambda m: m.group(1) + b'0' * len(m.group(2)), d)

    # trailer /ID array: zero both strings. Ghostscript writes /ID either as hex
    # (<abc123>) or, when the random bytes are not hex-safe, as literal strings
    # with escapes. Matching only the hex form let the literal form through on
    # some runs, which silently broke reproducibility -- and because the two
    # forms differ in length, two builds of identical content could still differ
    # in size. So: canonicalize the trailer's /ID to one fixed 32-hex-digit pair
    # regardless of the form gs chose. That is length-changing, which is safe
    # *only* in a classic trailer, since startxref points back at the xref table
    # ahead of it; so it is applied only to an /ID followed by startxref. Any
    # other /ID (e.g. inside a cross-reference stream) is zeroed in place at its
    # original byte length, where changing the length would corrupt offsets.
    _STR = rb'(?:<[0-9A-Fa-f]*>|\((?:\\.|[^\\)])*\))'
    _ID = rb'/ID\s*\[\s*' + _STR + rb'\s*' + _STR + rb'\s*\]'
    _ZERO32 = b'0' * 32

    # 1. the trailer's /ID -> fixed canonical form
    d = re.sub(_ID + rb'(?=\s*>>\s*startxref)',
               b'/ID [<' + _ZERO32 + b'><' + _ZERO32 + b'>]', d, flags=re.S)

    # 2. any remaining /ID -> zeroed, same byte length
    def _zero_in_place(m):
        budget = len(m.group(0)) - len(b'/ID [<><>]')
        if budget < 2:
            return m.group(0)
        a, b = budget // 2, budget - budget // 2
        return b'/ID [<' + b'0' * a + b'><' + b'0' * b + b'>]'

    d = re.sub(_ID, _zero_in_place, d, flags=re.S)

    # trailer /DocChecksum hex hash (LibreOffice; harmless if absent)
    d = re.sub(rb'(/DocChecksum\s*/)([0-9A-Fa-f]+)',
               lambda m: m.group(1) + b'0' * len(m.group(2)), d)

    # XMP timestamps, if a metadata packet is present
    d = re.sub(rb'((?:xmp|xap):(?:Create|Modify|Metadata)Date>)([^<]+)(<)',
               lambda m: m.group(1) + b'0' * len(m.group(2)) + m.group(3), d)

    # XMP document/instance UUIDs (gs randomizes these): zero the hex, keep dashes
    d = re.sub(rb'uuid:[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}'
               rb'-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}',
               b'uuid:00000000-0000-0000-0000-000000000000', d)

    # Font subset tags: gs assigns a random six-letter prefix (ABCDEF+Font) per
    # run. Canonicalize to AAAAAA, AAAAAB, ... in order of first appearance. The
    # replacement is global so every reference to a tag moves together, keeping
    # /BaseFont and /FontName matched.
    seen = []
    for m in re.finditer(rb'([A-Z]{6})\+', d):
        if m.group(1) not in seen:
            seen.append(m.group(1))
    for i, tag in enumerate(seen):
        canon = ('AAAAA' + chr(65 + i)).encode()  # relies on <=26 subset fonts
        d = d.replace(tag + b'+', canon + b'+')

    open(path, "wb").write(d)


if __name__ == "__main__":
    for p in sys.argv[1:]:
        normalize(p)
