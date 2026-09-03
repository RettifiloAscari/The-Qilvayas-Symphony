# QS Document Pipeline — How to Regenerate the Corpus

These files are the **actual production assets** for The Qilvayas Symphony. The published documents are *output*; the scripts here are the source of truth. Never hand-edit a published document — edit the script and regenerate.

**The deliverable is PDF.** The `.docx` that `transplant.py` produces is a build intermediate — it is rendered to PDF and discarded. PDF embeds its fonts, so it reads identically on any device (the `.docx` does not — see the note on the encoded template below), and the render is post-processed to be byte-reproducible so unchanged content never churns the repository.

## Files

| File | Role |
|---|---|
| `QS_Style_Template_encoded.md` | The /u/YaAlex-derived 5e visual template (Alegreya SC Medium headings in deep book-red, Alegreya Sans SC and Lato body text, A4, page-number footers), base64-encoded. **Project knowledge converts uploaded .docx files to plain text, destroying the binary — so the template ships encoded.** `transplant.py` decodes it automatically. |
| `transplant.py` | Applies the template to a generated .docx. Self-bootstrapping — extracts the template automatically on first run. |
| `campaign.js` | Generates the campaign setting sourcebook. |
| `sessions.js` | Generates Sessions 0, 1, and 2 (writes three files). |
| `session34.js` | Generates Sessions 3–4, *The Proving Below*. |
| `s56.js` | Generates Sessions 5 and 6 (writes two files). |
| `s78.js` | Generates Sessions 7 and 8 (writes two files). |
| `refguide.js` | Generates the DM Reference Guide. |
| `playerguide.js` | Generates the Player Guide. |

## Setup

Copy these files into the working directory, keeping `scripts/stage.js` alongside the generators — every one of them requires it. Several prerequisites are absent from a default sandbox and fail in ways that look like content bugs rather than environment problems — check all of them before generating:

```bash
npm install docx                              # generator dependency
apt-get install -y libreoffice-writer         # see note below — core alone is not enough
apt-get install -y ghostscript                # reproducible PDF rewrite (gs)
apt-get install -y poppler-utils              # pdftotext, pdffonts, pdftoppm
# scripts stage their .docx in <repo>/.stage, created automatically by scripts/stage.js
```

**LibreOffice Writer specifically.** `libreoffice-core` is often present without `libreoffice-writer`. In that state *no document format loads at all* — every conversion fails with `Error: source file could not be loaded`, including files that are perfectly valid. If conversion fails on a document you know is good, check this first.

### Fonts

The template requests exactly three families:

| Family | Used for |
|---|---|
| **Alegreya SC** (Medium) | Headings, in deep book-red |
| **Alegreya Sans SC** | Body |
| **Lato** | Body |

Install the TTFs from Google Fonts into `~/.local/share/fonts`, then `fc-cache -f`. Verify with `fc-match "Alegreya Sans SC"` — if it answers with DejaVu, the font is not really installed.

This matters more than it appears. Missing fonts do not error; they substitute silently, and substitution **changes line breaks, table fits, and total page count**. The same Player Guide renders at 10 pages with fonts missing and 9 pages with them present. Inspecting layout under substituted fonts tells you nothing about the document you will actually publish.

### A note on the template

`transplant.py` resolves the template in priority order: a genuine `.docx` if one is present (a chat upload retains binaries), otherwise the base64 carrier. It validates that any `.docx` it finds is a real zip archive, so a text-converted stub is skipped rather than causing a crash.

The encoded template has **embedded fonts stripped** to keep it small (58 KB rather than 2.2 MB — fonts were 97% of the original). Layout, styles, colors, and page setup are byte-identical to the original; only the font *binaries* are absent, which is why the three families above must be installed locally. If you need documents with fonts embedded for distribution to people who don't have them, attach the original `DnD_5e_StyleTemplate.docx` as a chat upload — `transplant.py` will prefer it automatically and the output will carry the fonts.

## Regenerating a document

In the repository, one command does everything below for all documents at once —
`tools/build.sh` regenerates the markdown corpus and the PDFs and verifies them. The
steps here are what it runs per document, useful when working one document at a time.

Generate the plain `.docx`, apply the template, render to PDF, then make the PDF
reproducible:

```bash
node campaign.js                                            # writes a plain .docx
python3 transplant.py <in>.docx <styled>.docx               # applies the template
soffice --headless --convert-to pdf --outdir . <styled>.docx
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.6 -dEmbedAllFonts=true \
   -dSubsetFonts=true -dNOPAUSE -dBATCH -dQUIET -o final.pdf <styled>.pdf
python3 normalize_pdf.py final.pdf                          # strips per-run randomness
```

The `.docx` is discarded once the PDF exists. The `gs` pass re-embeds the fonts and
collapses LibreOffice's nondeterministic font subsetting into a stable form;
`normalize_pdf.py` then zeroes the timestamps, IDs, checksum, and subset tags so the same
content always yields the same bytes.

**The DM Reference Guide is the one exception** — it stays single-column, because its value is wide scannable tables:

```bash
node refguide.js
python3 transplant.py QS_DM_Reference_Guide.docx out_RG.docx --single
# ...then the same soffice / gs / normalize_pdf.py steps
```

Everything else uses the default: full-width masthead, then continuous two-column body.

## Verify before publishing

Rendering bugs are invisible in the source. Always inspect the final PDF:

```bash
pdftotext final.pdf - | grep -c '\\u'     # MUST be 0 — escape-sequence leaks
pdffonts final.pdf | grep -c DejaVu       # MUST be 0 — a missing template font
pdftoppm -jpeg -r 80 final.pdf page       # then actually view several pages
```

**On the `grep` pattern:** the doubled backslash is required. Single-quoted `'\u'` matches the plain letter *u*, so it reports a hit on nearly every line of ordinary prose and can never return 0. Only `'\\u'` matches a literal `\u` escape.

The escape check catches the most common failure mode: double-escaped unicode (`\u2014`) rendering as literal text instead of an em-dash. It has happened more than once.

The `pdffonts` check catches the quieter one described under **Fonts** above — the render succeeds, looks plausible, and is laid out in the wrong typeface at the wrong measure.

## Known layout limitation

Wide tables with prose-bearing columns crowd badly in the two-column body. The commerce and price tables are worst affected — the Notes column wraps to one or two words per line, and long tables split awkwardly across column breaks. Letting wide tables span both columns is a structural change to the generators, not a formatting tweak. Treat it as a queued fix rather than patching individual tables.

## Versioning

The sourcebook is not version-numbered. It is a living document: edit `campaign.js` in place and rebuild, and let git history carry the record of what changed and when. Earlier revisions are recoverable from the log rather than kept as parallel files.

## Editing conventions

Every script shares the same helper set at the top: `P` (paragraph), `PS` (mixed runs), `H1`/`H2`/`H3`, `B` (bold lead-in), `BUL` (bullet with bold lead), `BOX` (shaded read-aloud text), `table`/`ltable`, and `SB` (stat block, with the ability-score table built in). Match the existing patterns when adding content.

Unicode is written as escapes in the source (`\u2014` for em-dash, `\u2019` for apostrophe). Write them **single-escaped**. If content is spliced between scripts programmatically, check for double-escaping afterward.

## Content splicing

Large passes are often built by generating a standalone design draft, then splicing approved sections into the canonical scripts with a Python string-replacement pass. This preserves exact wording between the reviewed draft and the final canon — no transcription drift. See prior work in the chat history for the pattern.
