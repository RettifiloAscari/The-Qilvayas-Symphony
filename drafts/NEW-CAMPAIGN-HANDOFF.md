# Handoff — Bootstrapping a Second Campaign

*Written from The Qilvayas Symphony, for a fresh Claude Code session starting a new
D&D 5e campaign in a different repository, on a different theme, using the same machinery.*

**Read this whole file before running anything.** It is the distillation of a working
pipeline plus the mistakes that were expensive to find. The lore does not transfer. The
machinery, the conventions, and the scar tissue do.

---

## 0. What this hands you

The Qilvayas Symphony repository (`RettifiloAscari/The-Qilvayas-Symphony`) contains a
complete, working, campaign-agnostic document pipeline: Node/docx-js generators →
styled `.docx` → PDF → byte-reproducible PDF, plus a Markdown shim that runs the same
generators to produce a diffable text corpus. One command rebuilds eleven documents and
fails the build on the two errors that are invisible in source.

That pipeline took a long time to get right. **Copy it; do not rebuild it.**

What you are *not* inheriting: the setting, the NPCs, the theme, the historical framing.
Those are Josh's to define fresh, and §7 lists what he needs to decide before you write
a line of content.

---

## 1. Copy these verbatim — they are campaign-agnostic

| File | Role | Changes needed |
| --- | --- | --- |
| `tools/docx-md-shim/index.js` + `package.json` | Stub of the `docx` package that emits Markdown instead of OOXML. This is what makes `corpus/` possible. | **None.** Zero campaign references. |
| `tools/normalize_pdf.py` | Strips per-run randomness (timestamps, trailer `/ID`, XMP UUIDs, font-subset tags) so an unchanged document rebuilds byte-identical. | **None.** Zero campaign references. Take the current version — see §5.6 for a bug fixed late. |
| `scripts/transplant.py` | Applies the visual template to a generated `.docx`. Self-bootstrapping. | **Four filename references** to the encoded template (lines ~31–33, ~52). If you rename the template, update all four. |
| `scripts/QS_Style_Template_encoded.md` | The base64-encoded visual template — the /u/YaAlex-derived 5e style: Alegreya SC Medium headings in deep book-red, Alegreya Sans SC + Lato body, A4, page-number footers. | **None to the content.** Rename the file if you like, but see the row above. |
| `tools/build.sh` | Regenerates `corpus/` and `documents/` together and verifies both. | **Two lines** — see §2. |
| The generator helper preamble (top ~40 lines of `scripts/campaign.js`) | The authoring kit: `P`, `PS`, `DM`, `H1/H2/H3`, `BULLET`, `B`, `BUL`, `cell/row/table`, `mod/abCell/SB`, and `BOX` in the session scripts. `SB()` renders a complete 5e stat block from a plain object. | **None.** This is the single most valuable portable asset after the pipeline itself. |

**Decide early whether to keep the same visual template.** A second campaign on a
different theme may want a different palette — the book-red `5B1F1F` is load-bearing in
both the template and the `DM()` helper. Changing it means changing both, plus every
generator's `DM` constant. Cheap now, tedious later.

---

## 2. What must change in `tools/build.sh`

Only two lines are campaign-specific:

```bash
GENERATORS=(campaign sessions session34 s56 s78 refguide playerguide)
SINGLE_COL_MATCH="QS_DM_Reference_Guide"
```

`GENERATORS` is the list of `scripts/<name>.js` to run, in order. `SINGLE_COL_MATCH` is a
substring of the one document that gets `--single` on the `transplant.py` step — the DM
Reference Guide, whose value is wide scannable tables and which reads badly in the
two-column body. Everything else in the script is generic.

One quirk to know rather than fix: **the generators write to a hardcoded `/home/claude`**
(`STAGE` in build.sh). It is a historical artifact from when the scripts round-tripped to
a second surface. `build.sh` accommodates the path rather than patching it out of seven
files. If you are starting clean you may prefer to parameterize it — just do it in *all*
generators at once, or the build silently produces a partial corpus.

---

## 3. Bootstrap sequence

```bash
# 1. New repo, cloned. Then pull the pipeline across:
mkdir -p scripts tools corpus documents drafts reference images
# copy from the Qilvayas repo:
#   tools/docx-md-shim/  tools/normalize_pdf.py  tools/build.sh
#   scripts/transplant.py  scripts/<template>_encoded.md

# 2. Toolchain (build.sh checks all of these and refuses to run without them)
npm install docx
apt-get install -y libreoffice-writer ghostscript poppler-utils
#   ^ libreoffice-writer, NOT libreoffice-core. See §5.1.

# 3. Fonts — install before you trust any layout. See §5.2.
mkdir -p ~/.local/share/fonts
# Alegreya SC, Alegreya Sans SC, Lato TTFs -> ~/.local/share/fonts
fc-cache -f

# 4. First generator, then:
tools/build.sh
```

**Copy the Qilvayas `.gitignore` wholesale** rather than reconstructing it — it covers
build scratch you will not think of (`scripts/work_tpl/`, `scripts/work_src/`,
`scripts/_template_decoded.docx`, all created and removed by `transplant.py` mid-build)
alongside the obvious `node_modules/` and `/export/`. The critical entry is `*.docx`: it is
a build intermediate and is **never** committed. `corpus/` and `documents/` **are**
committed deliberately, against the usual rule about build output, so the campaign opens on
any device without a build step.

---

## 4. The method — this is what actually made the first campaign work

The pipeline is the easy half. These practices are the reason the corpus stayed coherent
across a year of additions.

**4.1 The generator scripts are canon.** Nothing in `corpus/` or `documents/` is ever
hand-edited; the next build discards it. Every generated file carries a DO-NOT-EDIT
banner that `build.sh` stamps automatically. To change the campaign, change a script.

**4.2 Read before you write.** Ground in `corpus/` at the start of any task. Do not
generate against remembered canon — the whole point of a greppable corpus is that you can
check. This rule caught more errors than any other.

**4.3 Regenerate in the same commit as the script change.** `scripts/`, `corpus/`, and
`documents/` move together, always. A corpus that disagrees with its generator is worse
than no corpus.

**4.4 The sign-off cycle.** For any large pass — a region set, a systemic layer, an NPC
roster, a mechanical conversion — **do not write into canon directly.** Produce a design
draft in `drafts/` that: presents the proposal with reasoning; flags every item needing
approval; states plainly what is natural extension of approved canon versus genuine new
invention; and ends with a sign-off checklist and a propagation plan naming which scripts
change on approval. Josh approves, redlines, or vetoes. *Then* it folds into canon in one
consolidated pass, one commit. Rename the draft `*.RESOLVED.md` with a header recording
what was decided, including anything that changed on contact with the code.

This is not ceremony. It is what let a large corpus absorb systemic changes without
drifting, and the `.RESOLVED.md` files are a genuine decision log.

**4.5 Present forks as short multiple choice, not open questions.** Josh prefers choosing
between concrete directions with stated trade-offs. One decision at a time works well; a
multi-select is fine for a batch of independent small items.

**4.6 Consistency auditing.** Periodically, and always after a large pass, audit the whole
corpus: new systemic canon against existing session text; imported-game terminology that
clashes with established vocabulary; timeline arithmetic across documents; and — this one
pays — whether new canon creates **opportunities** in already-written scenes, not merely
contradictions to fix. Report findings by severity with recommended fixes; do not
regenerate without sign-off.

The opportunity half is underrated. In the Qilvayas audit it produced the best single item
in the pass: a new law about trade registration meant the party's own company charter
needed a register entry, which let them *live* the exact requirement that later triggers
the campaign's largest set piece — at a cost of two clauses, four sessions early.

**4.7 Mechanical validation against the SRD.** Build homebrew by feel, then check it.
Method in §6.

---

## 5. Environment — hard-won, do not rediscover these

**5.1 `libreoffice-core` alone loads nothing.** Every document fails with "source file
could not be loaded," which reads like a content bug and is not. Install
`libreoffice-writer`.

**5.2 Missing fonts do not error — they substitute, silently, and change pagination.**
Line breaks, table fits, and total page count all shift. A layout inspected under
substituted fonts is not the layout that will publish. `build.sh` refuses to run
verification if any of the three template fonts is absent, and the published check is
`pdffonts <pdf> | grep -c DejaVu`, which **must be 0**.

**5.3 The escape convention, and the check that actually works.** All prose lives in JS
string literals as `\uXXXX` escapes — never literal typographic characters. Em-dash
`—`, right single quote `’`, and so on. Two verifications:

```bash
grep -Pc '[^\x00-\x7F]' scripts/*.js     # MUST be 0 — no literal non-ASCII in source
pdftotext final.pdf - | grep -c '\\u'    # MUST be 0 — catches escapes leaking to output
```

**Note the doubled backslash in the second one.** Single-quoted `'\u'` matches the plain
letter *u* and reports every ordinary word containing one, so it can never return 0 on
real prose. The check only works as `'\\u'`. This was in the docs for a reason and is
still the easiest verification to get wrong.

Inserting new prose is the moment literal characters sneak in. Normalize immediately after
any insertion, then re-run both greps.

**5.4 `node --check` is not enough.** It validates syntax, not identifiers. A generator
calling a helper that does not exist in *that file* passes `--check` and throws at build
time. **The helper sets genuinely differ between scripts** — in the Qilvayas repo,
`refguide.js` has no `B()` and no `H3()`; the session scripts have `BOX()` and `SB()` but
no `table()`. Before trusting an edit, grep for the helper's definition in the file you
edited, and actually run `node scripts/<file>.js`.

**5.5 Ghostscript is nondeterministic in more ways than you expect.** `normalize_pdf.py`
exists to make builds byte-reproducible so the git history does not churn. One failure
mode was found only after months: gs writes the trailer `/ID` as hex (`<abc123>`)
*usually*, but as an escaped literal string (`(\307V\\W8...)`) when the random bytes are
not hex-safe. The normalizer matched only the hex form, so that form sailed through and a
rebuild of unchanged content produced a different file — intermittently, which is worse
than always. **Take the current `normalize_pdf.py`, which handles both.**

The general lesson: verify reproducibility by building three times and comparing, not
once.

**5.6 The SRD database is behind the proxy.** `codeload.github.com/5e-bits/...` returns a
403 JSON error, not a tarball. Attach it first:

```
add_repo(owner="5e-bits", repo="5e-database", access="read")
GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 \
  https://github.com/5e-bits/5e-database /home/user/5e-bits/5e-database
```

Monster data at `src/2014/en/5e-SRD-Monsters.json`; other types follow
`src/2014/en/5e-SRD-<Type>.json`. Coverage is SRD-only — no Volo's, no Mordenkainen's.
Flag material drawing on those as unvalidated when precision matters.

**5.7 Editing method that held up.** Apply script edits with an anchor and an assertion:
read the file, `assert s.count(old) == 1`, replace, write. A silent zero-match or a
double-match is how a "successful" pass quietly does nothing or corrupts two places.

**5.8 `sed` ranges restart on repeated matches.** `sed -n '/Foo/,/^# /p'` will re-trigger
at every later `Foo` and print a jumbled superset that looks like a structural bug in the
document. It is not. Use explicit line numbers when inspecting a specific section.

---

## 6. Mechanical validation — how to do it so the answer is real

**Use the ruleset the campaign actually runs on.** Everything below assumes the 2014
SRD and the 2014 DMG, which is what `src/2014/en/...` gives you. If §7 chose 2024, the
paths, the monster table, and half the vocabulary change — settle that first.

**Do not judge stat blocks against the DMG's Monster Statistics by CR table alone.**
Measured that way, every humanoid NPC in the Qilvayas corpus looked badly under-tuned —
50 to 90 hit points and 15 to 60 damage below its CR band. That verdict was wrong. Official
SRD humanoids sit just as far below that table: a CR 3 Veteran has 58 hp where the table
says 101–115. **The table describes monsters; NPCs are people.** Always compare against
real SRD monsters at the same and neighbouring CR.

**Automated damage extraction will lie to you.** Parsing `Hit: N (` off attack lines
undercounted four of ten boss blocks by 50–100%, because their output lives in riders:
a radiant smite trait, a Sneak Attack line, a second damage type on the same weapon,
spellcasting. Hand-check anything above CR 3 or built as a boss.

**Classify, do not correct.** Report each finding as *well-calibrated* / *intentional
design pattern* / *genuine error*. Deviations are frequently deliberate — support-role
NPCs, pack creatures, control-focused adversaries, custody-focused examiners whose threat
is a save DC and a jurisdiction rather than a mace. Identify those as design and leave
them alone. Homebrew stays homebrew; the numbers just need to hold up next to the baseline
players implicitly compare them to.

**Check the encounter, not only the block.** This is the step that found a real bug. Blocks
can each be correct while the encounter they compose is not. Compute adjusted XP against
DMG thresholds for 4, 5, and 6 characters at the intended level, and look at the *curve*:

> The Qilvayas Proving scaled from one boss (4 players) to boss-plus-two-minions (5
> players). That crossed the 1→3 monster encounter-multiplier boundary, doubling the
> multiplier: adding a single player took the fight from 90% of the deadly threshold to
> **176%** of it — harder than the six-player version. Fixed by adding one minion instead
> of two, giving 90 / 120 / 110 across party sizes.

Watch for multiplier boundaries at 2, 3, 7, 11, and 15 monsters, and remember that a party
of six shifts the multiplier down one step, which quietly makes most encounters *softer*
for large tables even as you add bodies.

---

## 7. What Josh needs to decide before content starts

Ask these as short multiple-choice where they fork. Do not assume answers from the first
campaign.

1. **The ruleset — confirm 2014, or decide otherwise deliberately.** The Qilvayas
   Symphony is built entirely on the **2014** D&D 5th Edition rules, and this pipeline's
   SRD validation reads `src/2014/en/...` on purpose. "D&D 5e" is ambiguous now that the
   2024 revision exists, so pin it before writing a stat block. If this campaign stays on
   2014, say so in `CLAUDE.md` as a standing constraint: *race* not *species*, no weapon
   masteries or Bastions or Epic Boons, no revised exhaustion or grapple rules, monster
   math from the 2014 DMG. If it moves to 2024, that is a different SRD path, a different
   monster table, and a different vocabulary — decide once, up front, because retrofitting
   is a migration across every stat block and every player-facing document.
2. **The repository.** Name, and whether it starts empty or as a fork of the Qilvayas
   structure.
3. **The core theme, and its historical spine if it has one.** Qilvayas ran on Byzantine
   imperial decline with major NPCs keyed to historical models (Justinian, Olga of Kiev,
   Charlemagne, Vlad III, Catherine de' Medici). That framing did enormous work — it made
   NPCs coherent, gave their politics internal logic, and made research productive. A
   different campaign may want a different spine or none, but decide deliberately.
4. **The document set.** Qilvayas runs: a sourcebook, session modules, a DM Reference
   Guide (single-column, wide tables), and a sanitized Player Guide. The Player Guide is
   authored as its own document, never produced by deleting paragraphs from the sourcebook
   — spoiler-safety lives in how sections are *written*. That split is worth keeping.
5. **Party size, starting level, session length, advancement.** Qilvayas: 4–6 players,
   3rd level, five-hour sessions, milestone advancement.
6. **Visual template** — reuse, restyle, or replace. See §1.
7. **Tone.** Write it down explicitly in `CLAUDE.md`. Qilvayas: "grandeur next to strain,
   institutions outliving their purpose, moral complexity with no clean answers." That one
   sentence steered hundreds of decisions.

---

## 8. `CLAUDE.md` for the new repo

Write this early; a Claude Code session loads it automatically at startup and it is the
highest-leverage file in the repository. Take the Qilvayas `CLAUDE.md` as the skeleton and
rewrite the content sections. Structure that worked:

- **Repository layout** — what each directory is, and explicitly which ones are generated.
- **Working in this repository** — read before you write; never hand-edit generated output;
  regenerate in the same commit; canon changes propagate in one pass; commit at meaningful
  boundaries with messages describing what changed *in the fiction*, not the mechanics of
  the edit.
- **Role and tone.**
- **Canon and sources of truth** — plus a *Deliberately Open* list, which matters more than
  it sounds: it separates "unresolved by design" from "gap to be filled," and stops later
  sessions helpfully closing a question that was left open on purpose.
- **Creative latitude** — what to invent freely (minor NPCs, place names, encounters, DCs,
  read-aloud, treasure) versus what needs explicit sign-off (core mythology, major NPC
  fates, structural worldbuilding, changes to player-facing facts or anything already run
  at the table).
- **Session and encounter design specs.**
- **Divergence tracking** — a Branch Ledger in the reference guide, recording every tracked
  divergence with a blank column for what actually happened at the table. This is what
  keeps a campaign replayable rather than a railroad with scenery.
- **Mechanical validation** and **consistency auditing** protocols (§4.6, §6).
- **Production practice** — the pipeline summary and the verification commands.

Mirror it to `reference/project-instructions.md` if a Claude Chat project will read the
repo through the GitHub connector, and **update both in the same pass**; they drift
otherwise, which is the failure the mirroring rule exists to prevent.

---

## 9. Limitations you are inheriting

- **Wide prose-bearing tables crowd in the two-column body.** Substantially improved from
  where it started, but three-column tables with a prose `Notes` column still wrap to three
  to six words per line. The real fix — letting wide tables span both columns — is a
  structural change to the generators and remains unbuilt. Design around it or budget for
  it early, before there are seven generators to change.
- **No image path in the pipeline.** Artwork cannot currently reach the published
  documents: the generators emit `.docx` via docx-js and the Markdown shim has no image
  support. Adding it means extending both sides. If the new campaign wants art in the
  documents from the start, **build this before writing content**, not after.
- **Stat-block trait text and table cells render as a single unstyled run**, so the
  book-red DM marker convention cannot reach inside them.

---

## 10. Authoring conventions worth carrying

- **DM-only markers are bold book-red, never italic.** `const DM = (t) => ({ t, b: true,
  c: "5B1F1F" })`, used as `PS([DM("DM Only: "), { t: "the note." }])`. Colour is
  preattentive — a DM spots red without reading — and it leaves the body roman, which
  matters because these notes run 100–200 words. **Colour the marker, not the prose.**
  Italic is reserved for read-aloud, quotations, and epigraphs; overloading it makes both
  signals ambiguous. Two rules follow from the Markdown shim appending a space after every
  bold run: the marker carries its own trailing space, and the following segment never
  begins with one. Sections already titled `(DM Only)` need no inline marker.
- **Every module carries the same skeleton:** overview with a pacing budget; "What Is
  Actually Happening (DM Only)"; numbered scenes with boxed read-aloud; tiered skill DCs;
  full stat blocks; NPC profiles with speech patterns and threads; **Optional Content**
  (standard, not rare, explicitly outside the core session length); **Diverging Paths (DM
  Only)**; loot; closing epigraph.
- **Always include scaling for 4, 5, and 6 characters** — and check the curve (§6).
- **Every combat gets a credible nonviolent or partial resolution where the fiction
  supports one, plus explicit morale** — when they flee, fold, or surrender.
- **Levity is deliberate.** A serious campaign needs relief valves: taverns, bureaucratic
  absurdity, recurring comic NPCs. Plan them in rather than hoping they emerge.
- **Verify by looking.** Rendering bugs are invisible in source, and so are some content
  bugs. In the final Qilvayas pass, a factually wrong rules claim about Turn Undead was
  caught by rendering the page to PNG and reading it — after every grep-based check had
  passed clean.

---

## 11. Suggested first message to the new session

> We are starting a new D&D 5e campaign in this repository, using the document pipeline
> and working method from `RettifiloAscari/The-Qilvayas-Symphony`. Read
> `drafts/NEW-CAMPAIGN-HANDOFF.md` in full first — it names what to copy verbatim, what to
> rewrite, and the environment gotchas that are expensive to rediscover.
>
> Before writing any content, walk me through the decisions in §7 as short multiple-choice
> questions, one at a time. Then stand up the pipeline per §3 and prove it end to end with
> one throwaway document — a single page, built, rendered, and verified — before we write a
> word of canon. I want to see `tools/build.sh` come back clean and byte-identical on a
> rebuild before we trust it.

That last instruction matters. **Prove the pipeline on a throwaway document before writing
content.** Debugging LibreOffice, fonts, and Ghostscript reproducibility is much easier
when the document is one page and you do not yet care about it.

---

*Nothing in this file is canon for The Qilvayas Symphony. It is a portable record of how
that campaign is built and what it cost to learn.*
