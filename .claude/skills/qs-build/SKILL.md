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

## Prerequisites

All checked by the build, and each has bitten one of the two campaigns. `PIPELINE_README.md`
carries the long form.

| Requirement | Install | Why |
|---|---|---|
| Node + `docx` | `npm install docx` | The generators |
| Python 3 | stdlib only | `transplant.py`, `normalize_pdf.py` |
| LibreOffice **Writer** | `apt-get install libreoffice-writer` | `libreoffice-core` alone loads *nothing* and every document fails with "source file could not be loaded" — a content-shaped error with an environment cause. Containers ship with core only. |
| Ghostscript | `apt-get install ghostscript` | Reproducible PDF |
| poppler-utils | `apt-get install poppler-utils` | `pdftotext`, `pdffonts`, `pdftoppm` |
| Alegreya SC, Alegreya Sans SC, Lato | TTFs into `~/.local/share/fonts`, then `fc-cache -f` | Missing fonts **substitute silently and change pagination**, so layout verified without them is meaningless. `fonts.google.com/download` is blocked here — pull the static TTFs from `raw.githubusercontent.com/google/fonts/main/ofl/{alegreyasc,alegreyasanssc,lato}/`. |

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

The apostrophe rule cannot tell a comment from a string, so it fires on `King's` in a
`//` line too. That is the right trade — the rule protects prose that reaches the PDF, and
the cost of keeping it strict is only that comments avoid apostrophes. Rephrase the
comment rather than loosening the pattern.

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

**Widening a column can silently delete rows.** Widths are a zero-sum hundred, so widening
one column narrows another, the narrowed column wraps to more lines, and the table gets
taller. A table that then meets a column or page break does not always continue on the
other side: LibreOffice can simply **drop the rows that no longer fit**, with no error and
no page-count change. The Gazetteer's Distances by Imperial Road table sits on that edge
today — its `Days` column is one twip-fraction too narrow for its own `Days` header, which
breaks as `Day`/`s`, and every attempt to widen it (from the prose column *or* from the
`To` column, at 11%, 12% and 13%) truncated the table after its first row, losing eleven
of twelve destinations and 232 words. The 10% is load-bearing; leave it alone.

Nothing in the pipeline catches this. `build.sh` reports thirteen documents "ok", the page
census is unchanged, and `check_columns.py` rates the surviving break *marginal*. **Compare
word counts before and after any width change**, against the previous PDF and against the
corpus, which is generated from the same run and never truncates:

```bash
pdftotext documents/<doc>.pdf - | wc -w      # vs the same for the pre-change PDF
```

A drop of more than a word or two is rows going missing, not reflow.

Table cells are left-aligned with the inherited first-line indent cleared; the
template otherwise centres and indents them. Dice columns want 11%, not 7.

**Tables must not tear.** `row()` sets `cantSplit` so a row's cells cannot be torn across
a column or page break; the header row is built by `headerRow()`, which adds `tableHeader`
so it repeats when a long table does span a break; and `abCell` sets `keepNext: !!bold`,
true only for the header row, which binds STR/DEX/CON forward to the values beneath it.
Without that binding a stat block can put its six labels at the foot of one column and its
six numbers in the next — which three blocks in this corpus were doing until it was ported
from the sister repository. `tools/check_tearing.py` reads glyph boxes and fails the build
if it happens again; reading order cannot detect it, because on a two-column page a torn
block looks contiguous and an intact one can look broken.

Single-column documents are exempt and are named in `tools/pipeline.conf`; here that is
`refguide.js`, whose value is wide scannable tables with the whole page to use.

**Prose after a table gets its gap from `transplant.py`, not the generator.** A table
carries no space-after in OOXML and body paragraphs are authored with `spacing.after` only,
so prose immediately following a table sits flush against its bottom border. Headings always
looked right because their style supplies `spacing.before`, which is why the defect only ever
appeared on table-then-prose. `gap_after_tables()` gives the first paragraph after each table
a 180-twip before-gap and skips three cases: headings, any paragraph whose author set a
`before` deliberately, and blank spacer paragraphs — an empty paragraph is already the gap,
and the stat-block helper pushes one after its ability table. That last test must be on the
text content, not on the presence of a `<w:t>` tag: docx-js emits an empty run as
`<w:t></w:t>` rather than omitting it. Fixing this in `transplant.py` rather than in
`table()` is deliberate — the helper returns a single Table, so a per-call fix would mean
touching every call site in every generator and remembering it forever after.

### Bullets need the `ListParagraph` style, and an indent sized to the column

Two defects, found together, and the first hid the second for the life of the corpus.

docx-js stamps `<w:pStyle w:val="ListParagraph"/>` on every numbered paragraph. The visual
template defines no such style, and LibreOffice answers the dangling reference by dropping
the numbering with it — no glyph, no hanging indent, the bullet rendering as an ordinary
body paragraph carrying the first-line indent `docDefaults` gives everything. All 352
bullets in all thirteen documents were doing this. `transplant.py`'s `ensure_list_style()`
injects the style so the numbering survives; it sets no left or hanging of its own, so the
measure stays where each generator declares it, and zeroes the inherited first-line indent,
which would otherwise push the glyph's own line out of the hang.

This is the failure mode the corpus cannot show you. The Markdown shim reads the numbering
property off the paragraph object and emits `- ` whichever way the PDF renders, so
`corpus/` said "bullet" and the page said "paragraph" for as long as both existed.
**A count of `^- ` in the corpus is not evidence that a bullet rendered.** Count the glyph
on the page instead — `pdftotext doc.pdf - | grep -c '•'` should equal the corpus count:

```bash
for f in documents/*.pdf; do b=$(basename "$f" .pdf)
  printf '%-52s md:%3s pdf:%3s\n' "$b" \
    "$(grep -c '^- ' corpus/$b.md)" "$(pdftotext "$f" - | grep -o '•' | wc -l)"; done
```

The indent is the second defect, and restoring the numbering is what would have exposed it.
Every generator carried docx-js's default `indent: { left: 720, hanging: 360 }` — half an
inch, sized for a 6.5in single-column sheet. Against the measured two-column column of
4840 twips that is **15% of the line**, on every line of every bullet. Derive it from the
body type instead: the glyph sits at the text margin and the text about one em in, so
`left` and `hanging` are equal and near 1.3em of the body size.

| Generators | Body | Em | Value | Share of measure |
|---|---|---|---|---|
| the eight two-column documents | `size: 22` = 11pt | 220tw | `left: 280, hanging: 280` | 5.8% of 4840tw |
| `refguide.js`, single-column | `size: 20` = 10pt | 200tw | `left: 260, hanging: 260` | 2.6% of 10040tw |

The two differ **because their body type differs**, not because their measure does. The
hang's job is to relate a glyph to its own text, which is a function of type size; what the
column width changes is the *cost* of getting it wrong, not the right answer. Rendered at
360 on the wide single-column measure the gap reads as a well with nothing in it, and 260
does not read as mean — so a wide measure is not a reason to indent further.

### Suspect the inherited measurement before the writing

The bullet indent is the third full-page default caught sitting in a 3.36in column, after
table `columnWidths` and table cell padding. The pattern is worth naming, because all three
looked like prose problems and none of them was: **a library's default is sized for a 6.5in
single-column sheet, and this book sets a 3.36in measure, so every inherited number is
roughly twice the fraction of the line it was designed to be.** When a two-column page
reads loose, cramped, or held at arm's length, price the defaults against the measure
before touching a sentence.

Where the other two stand here:

- **`columnWidths`** — already fixed; every generator passes `CW(widths)` with
  `TableLayoutType.FIXED`, documented above.
- **Cell padding** — fixed, but not uniformly, and worth a deliberate pass rather than a
  silent one. The sourcebook family (`campaign`, `companion`, `gazetteer`, `playerguide`)
  uses `left: 45, right: 45`; the four session generators use `90`; `refguide` uses `100`.
  None is Word's raw 108 default, so none is untouched — but two two-column documents
  disagreeing by 2× is not a decision anyone made, and `pipeline.conf`'s `COLUMN_WIDTH_IN`
  subtracts 0.06in for cell margins, which assumes the 45. `check_columns.py` therefore
  reads the session tables as very slightly wider than they are. Left as a finding.

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

For the source scan use `grep -Pl` (list offending files) rather than `-Pc`: with nine
generators, `-Pc` prints a `file:count` line per script and there is no single number to
read.

The escape check must use a **doubled backslash** — `grep -c '\\u'`. The
single-quoted `'\u'` form matches the plain letter *u* and can never return zero on
real prose.

Fonts must be installed or verification is meaningless: the template requests Alegreya
SC, Alegreya Sans SC, and Lato, and missing fonts substitute silently, changing line
breaks, table fits, and page count. `build.sh` refuses to run without all three.

## Adding a document

1. New generator in `scripts/`, writing via `stagePath("<Name>.docx")` from
   `require('./stage')`. Never hardcode a stage directory.
2. Add its basename to `GENERATORS=(...)` in `tools/build.sh`.
3. Add a row to the README index and a layout entry in `CLAUDE.md` **and** its mirror
   at `reference/project-instructions.md`, in the same pass.
4. If it is player-facing, add it to the leak-scan loop in `tools/verify.sh`.

**Output path.** Never hardcode a stage directory:

```js
const { stagePath } = require('./stage');
fs.writeFileSync(stagePath("The_Qilvayas_Symphony_Campaign_Setting.docx"), buf);
```

`stagePath` resolves `$QS_STAGE` (set by `build.sh`) and falls back to `<repo>/.stage`, so
a generator runs standalone from any working directory. `.stage/` is gitignored scratch and
`build.sh` clears it each run. This was a hardcoded `/home/claude` in all nine generators
until it was ported from the sister repository: a constant repeated in nine files can only
be changed in nine files at once, and a generator missed in that pass writes somewhere
nothing reads and drops out of the corpus silently.

## Reference

Everything repository-specific lives in `tools/pipeline.conf` — the single-column
generator, the column measure, and which documents are player-facing. The five tools below
are byte-identical to their copies in The King's Crusade, so a fix to one is a copy rather
than a re-derivation.

- `tools/anchor.py` — assert-then-edit
- `tools/normalize_escapes.py` — real characters in, `\uXXXX` out; `--check` to report
- `tools/check_columns.py` — starved table columns, banded by confidence
- `tools/find_page.py` — which PDF page a string is on
- `tools/check_tearing.py` — stat-block ability rows torn from their header
- `tools/verify.sh` — everything above in one call; `--full` adds reproducibility
- `tools/build.sh` — the build itself; `--no-verify` only when the render toolchain
  is genuinely unavailable
