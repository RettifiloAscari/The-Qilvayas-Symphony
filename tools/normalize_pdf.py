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

    # trailer /ID array: zero both hex strings (same length each)
    d = re.sub(rb'(/ID\s*\[\s*<)([0-9A-Fa-f]+)(>\s*<)([0-9A-Fa-f]+)(>)',
               lambda m: m.group(1) + b'0' * len(m.group(2)) + m.group(3)
                         + b'0' * len(m.group(4)) + m.group(5), d)

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
