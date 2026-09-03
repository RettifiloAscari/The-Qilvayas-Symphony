---
name: qs-build
description: The Qilvayas Symphony production pipeline — editing the docx-js generators in scripts/, the escape and table conventions, and the build and verification loop. Use whenever a task will touch scripts/, run tools/build.sh, add a document to the corpus, or debug a rendering problem in documents/. Not needed for lore questions, canon discussion, or design drafts that write no code.
---

# The Qilvayas Symphony — Production Pipeline

`PIPELINE_README.md` is the full reference. This is the working set: the conventions
that are easy to violate silently, the tools that check them, and the order to do
things in. `CLAUDE.md` holds the canon rules; this holds the mechanics.

## The one-paragraph model

Nine generators in `scripts/` are the source of truth. `tools/build.sh` runs each one
twice — once through `tools/docx-md-shim/` to emit Markdown into `corpus/`, once
through real docx-js to emit `.docx`, which then goes through `transplant.py` (the
visual template), LibreOffice (PDF), Ghostscript, and `normalize_pdf.py` (byte
reproducibility). The `.docx` is an intermediate and is gitignored. Nothing in
`corpus/` or `documents/` is ever hand-edited; the next build silently discards it.

## Order of work

1. **Read the corpus first.** Never generate against remembered canon.
2. Edit `scripts/` with `tools/anchor.py` — read, assert, replace.
3. `python3 tools/normalize_escapes.py scripts/*.js`
4. `tools/verify.sh` (add `--full` before committing)
5. Render the pages you changed and **look at them**.
6. Commit `scripts/`, `corpus/`, and `documents/` **together**.

## Conventions that fail silently

### Compose in real characters, then normalize

Write prose with real typographic characters — curly quotes, em dashes, ellipses —
and run `tools/normalize_escapes.py` afterward. Hand-escaping while composing is slow
and is exactly where the doubled-backslash bug comes from: a run written `\\u2019`
compiles clean, passes the non-ASCII scanner, and leaks a literal `’` into the
PDF. The tool collapses a doubled escape, converts non-ASCII to `\uXXXX`, and curls a
straight apostrophe **only between two word characters** — `(\w)'(\w)`, narrow on
purpose, because any wider rule matches `require('docx')` and corrupts the generator
on its first line. It is idempotent; `--check` reports without writing.

### `node --check` is not sufficient

It validates syntax, not identifiers. A call to a helper the file does not define, or
a push onto the wrong document's array, passes `--check` and throws at build time.
Helper sets genuinely differ: `refguide.js` has no `B()` or `H3()`; the session
generators use `ltable`/`lcell` rather than `table`/`cell`. The multi-document
generators hold several arrays at once (`c5` and `c6` in `s56.js`, `c7`/`c8` in
`s78.js`, `cA`/`cB`/`cC` in `sessions.js`), so a `c6.push` inside the Session Five
block is a real and easy mistake. **Run every generator.** `verify.sh` does.

### Tables need `columnWidths`

docx-js emits a dummy equal-width `<w:tblGrid>` when a `Table` is built without it,
and LibreOffice honours that grid over the per-cell percentages — every table renders
with evenly split columns and the `widths` array is silently discarded. The `table()`
and `ltable()` helpers pass `columnWidths: CW(widths)` and
`layout: TableLayoutType.FIXED`. `CW` scales the widths to twips; proportions are what
matter, because `tblW=100%` governs the total. The stat-block ability tables pass a
literal `CW([1,1,1,1,1,1])` — they have no `widths` in scope. `TableLayoutType` must
also exist in `tools/docx-md-shim/index.js` or the Markdown half of the build throws.

Because the widths are now real, a column authored below about 15% is genuinely
narrow and will break words mid-syllable. `tools/check_columns.py` reports these,
banded: **BREAKS** is certain, **likely** wants a render, **marginal** is inside the
measurement spread and usually fine. Fix in this order:

1. **Shorten the cell text.** Usually right — a cell wants a label, not a sentence.
2. **Widen, taking the difference from the widest column only.** Never redistribute
   proportionally to slack: prose columns have short words, measure as slack, and get
   gutted. (Tried once; the saints' description column went 43% → 26%.)
3. **Restructure.** Four columns do not fit a two-column body and five certainly do
   not. Merge columns, or convert to full-width `B()` entries — which is what the
   Factions list and the Canon of Saints became.

Table cells are left-aligned with the inherited first-line indent cleared; the
template otherwise centres and indents them. Dice columns want 11%, not 7.

`refguide.js` is the one single-column document and is exempt from all of this.

### DM markers are bold book-red, never italic

`const DM = (t) => ({ t, b: true, c: "5B1F1F" })`, used inside `PS([...])`:

```js
PS([DM("DM Only: "), { t: "the note itself." }])
```

Colour is preattentive — a DM spots red without reading — and it leaves the body
roman, which matters because these notes run 100–200 words. **Colour the marker, not
the prose.** Italic is reserved for read-aloud, quotations, and epigraphs; overloading
it makes both signals ambiguous. Two rules follow from the Markdown shim, which
appends its own space after every bold run: the marker carries the trailing space
(`DM("DM Only: ")`) and the next segment never begins with one; and a bare
parenthetical absorbs its brackets (`DM("(DM only) ")`). Sections already titled
`(DM Only)` need no inline marker. Not covered: table cells and stat-block trait text,
whose helpers render a single unstyled run.

### Edit with an anchor and an assertion

```bash
printf 'children.push(H1("Magic and the Word"));\n' > /tmp/a.txt
tools/anchor.py before scripts/campaign.js /tmp/a.txt /tmp/new.js
```

A silent zero-match quietly does nothing and the build still passes. `anchor.py`
refuses on any count mismatch and writes nothing. It also strips a heredoc's trailing
newline from the replacement when the anchor is single-line — without that, the
newline lands inside a JS string literal and breaks the file.

## Verification

`tools/verify.sh` runs: every generator, the three escape greps, `check_columns.py`,
the build, a drift check, and the player-facing leak scan. `--full` adds three builds
and a byte comparison — the Ghostscript trailer failure mode is intermittent, which
is why three rather than two.

Then **render and look**. Layout and some content bugs are invisible in source and
invisible to every grep:

```bash
tools/find_page.py "Halvard of the Quiet Rite"
pdftoppm -r 110 -png -f 9 -l 9 documents/<doc>.pdf /tmp/page
```

Real bugs caught only by looking: a table breaking `Tarnov`/`ari` mid-word; a Turn
Undead ruling that was wrong on the page while every grep passed.

For a precise answer on whether something broke, read the glyph extents rather than
squinting: `pdftotext -bbox -f N -l N doc.pdf -` lists every word with its box, so a
word absent from that list is a word that got split.

The escape check must use a **doubled backslash** — `grep -c '\\u'`. The
single-quoted `'\u'` form matches the plain letter *u* and can never return zero on
real prose.

Fonts must be installed or verification is meaningless: the template requests Alegreya
SC, Alegreya Sans SC, and Lato, and missing fonts substitute silently, changing line
breaks, table fits, and page count. `build.sh` refuses to run without all three.

## Adding a document

1. New generator in `scripts/`, writing to `/home/claude/<Name>.docx`.
2. Add its basename to `GENERATORS=(...)` in `tools/build.sh`.
3. Add a row to the README index and a layout entry in `CLAUDE.md` **and** its mirror
   at `reference/project-instructions.md`, in the same pass.
4. If it is player-facing, add it to the leak-scan loop in `tools/verify.sh`.

The generators write to a hardcoded `/home/claude`. `build.sh` accommodates that path
rather than patching it out of nine scripts — a historical quirk, not worth disturbing.

## Reference

- `tools/anchor.py` — assert-then-edit
- `tools/normalize_escapes.py` — real characters in, `\uXXXX` out; `--check` to report
- `tools/check_columns.py` — starved table columns, banded by confidence
- `tools/find_page.py` — which PDF page a string is on
- `tools/verify.sh` — everything above in one call; `--full` adds reproducibility
- `tools/build.sh` — the build itself; `--no-verify` only when the render toolchain
  is genuinely unavailable
