# Handoff — The Qilvayas Symphony

Continuation of pipeline-rebuild and consistency-audit work. Read `CLAUDE.md` first — it
is canonical and covers role, canon rules, the sign-off cycle, and production practice.
This document covers only what that file doesn't: current state, what changed, how the
production environment actually behaves, and where the next deep-dive session should aim.

---

## Repository state

`github.com/RettifiloAscari/The-Qilvayas-Symphony` (private), branch `main`, currently at
commit `26c6017`. Working tree clean, nothing pending.

```
scripts/     — THE CANON. docx-js generators, transplant.py, encoded template, normalize_pdf.py.
corpus/      — generated Markdown, one file per document. Read this to check canon.
documents/   — generated PDF (fonts embedded, byte-reproducible). Committed deliberately.
tools/       — build.sh (regenerate + verify everything), docx-md-shim/, normalize_pdf.py.
reference/   — project-instructions.md, the mirrored Chat-project instructions.
drafts/      — design drafts awaiting sign-off. NOT canon.
README.md, PIPELINE_README.md, CLAUDE.md
```

`corpus/` and `documents/` are both generated from `scripts/` in the same `tools/build.sh`
run, so they cannot drift from each other or from canon. **Never hand-edit `corpus/` or
`documents/`** — edit the script and rebuild.

**Not in the repo, and shouldn't be:** the old `setting/`, `sessions/`, and `.docx`
directory layouts. Both were retired this cycle (see below). If you see them referenced
anywhere outside `archive/v10-markdown-import`, it's stale.

**Recovery branch:** `archive/v10-markdown-import` preserves the pre-rebuild v10 markdown
corpus, untouched, in case anything from that era is ever needed. It will never be merged
or updated — leave it alone.

---

## What changed this cycle (context for why things look the way they do)

1. **The repo was rebuilt around the generator scripts as sole source of truth.** It
   previously held markdown *exported from* the `.docx` output — a third-generation copy,
   one sourcebook version stale (v10, missing Sessions 7–8), carrying Word round-trip
   damage (`****`-split bold markers). That's gone. `scripts/` is canon now; `corpus/` and
   `documents/` are both build output.
2. **The deliverable switched from `.docx` to PDF.** The template ships with its fonts
   *stripped* (see Environment below), so a `.docx` opened without them installed silently
   substitutes fonts and its pagination lies. PDF embeds font subsets and reads identically
   everywhere. The `.docx` is now a build intermediate, rendered and discarded.
3. **The Chat-project mirror was retired.** There used to be a second copy of `scripts/`
   living in Claude Chat's project knowledge, kept "byte-identical" by hand so files could
   round-trip. That was killed because the duplicate drifted — exactly the failure this
   whole rebuild exists to prevent. The Chat project now reads the repo directly through
   its GitHub connector (repo visibility is public — see Environment). `reference/
   project-instructions.md` documents this; keep it mirrored to `CLAUDE.md` whenever either
   changes.
4. **A full timeline-arithmetic audit ran and closed.** Seventeen findings — three
   high-severity break points (a commencement clock that let students graduate before
   their own exam, a homecoming that referenced a kingdom five years from existing, and an
   archivist who'd filed three years of letters that hadn't been written), plus dynasty
   biography, and new DM-only shadow-mechanics canon. All applied to `scripts/`, rebuilt,
   verified, and merged to `main`. The resolved draft is at
   `drafts/timeline-arithmetic-audit.RESOLVED.md` — read it before starting new audits; it
   records what "clean" already looks like and what methodology worked.

---

## Environment — hard-won, don't rediscover these

A fresh sandbox is **not** pre-configured for this pipeline. `tools/build.sh` checks most
of this and refuses to run if it's missing, but if you're doing anything the build script
doesn't cover (manual `soffice` calls, spot-checking a single render), know these going in:

- **`libreoffice-core` alone loads nothing.** Every document conversion fails with
  `source file could not be loaded` — including a file that's perfectly valid — unless
  `libreoffice-writer` is also installed (`apt-get install -y libreoffice-writer`).
- **The template's actual fonts are Alegreya SC, Alegreya Sans SC, and Lato** — not
  "Alegreya Sans," which is a different family and was wrong in the docs for a while.
  Missing fonts don't error, they *substitute silently*, and substitution changes line
  breaks, table fits, and page count. Verifying layout without the real fonts verifies
  nothing. Install from Google Fonts into `~/.local/share/fonts`, then `fc-cache -f`.
- **PDF reproducibility needs Ghostscript, not just LibreOffice.** LibreOffice's font
  subsetting is nondeterministic between runs even with identical input. The pipeline is
  `docx-js → transplant.py → LibreOffice (PDF) → Ghostscript (re-embed, stable subsetting)
  → normalize_pdf.py (zero timestamps/IDs/checksums/UUIDs/subset-tag names)`. Skip any
  stage and rebuilds will churn every file's bytes even when nothing changed.
- **`poppler-utils`** supplies `pdftotext`, `pdffonts`, `pdftoppm` — needed for the
  escape-leak and font-substitution checks `build.sh` runs after every build.
- **The escape-leak grep needs a doubled backslash.** `grep -c '\\u'` is correct;
  `grep -c '\u'` matches the literal letter *u* and will never return zero on real prose.
  This bug lived in the project's own documented verification command for a while — if
  you ever see the single-backslash form anywhere, it's wrong, fix it on sight.
- **The prose lives inside JS string literals, escaped, not literal Unicode.** Em dash is
  `—`, en dash `–`, right single quote `’`, curly quotes `“`/`”` —
  all as literal ASCII backslash-u sequences in the `.js` source (confirm with
  `grep -c '[^\x00-\x7F]' scripts/*.js` — should be ~0). When editing scripts
  programmatically, build the escape sequences at runtime (e.g. Python
  `EM = "\\u2014"`) rather than pasting a literal em dash — a literal character silently
  breaks the file's self-consistency and won't be caught by `--check` syntax validation.
  **Before any bulk edit**, grep the target anchor phrase and confirm an exact, unique
  match — line numbers drift, anchor phrases don't. Apply edits with a script that
  asserts a count of exactly 1 per anchor before writing; abort on mismatch rather than
  guessing.
- **The generator scripts write to a hardcoded `/home/claude`.** `tools/build.sh`
  accommodates this rather than patching seven scripts — leave it; it's harmless.
- **This sandbox's git proxy silently refuses two operations:** pushing tags (`403`,
  looks like a permissions issue but isn't fixable by retrying) and deleting remote
  branches (hangs, `fatal: the remote end hung up unexpectedly`). Tags: use a same-commit
  branch instead (e.g. `archive/...`) if you need a permanent pointer. Branch deletion:
  either ask the user to delete it from the GitHub UI, or don't worry about it — a merged
  branch pointing at an already-merged commit is inert clutter, not a risk.
- **The repo is currently public**, changed mid-cycle to unblock the Chat project's
  GitHub connector (private-repo access needed an app-installation scope the connector
  didn't have selected). If repo privacy matters again, that's the first thing to check —
  don't assume it's still private.

**Standard build command**, once the above is installed:

```bash
npm install docx
tools/build.sh              # generates corpus/ + documents/, applies template, verifies
tools/build.sh --no-verify  # skip the render/verify pass (only if the toolchain is unavailable)
```

---

## Working conventions that matter

- **Never write directly to canon for anything above trivial fixes.** Per `CLAUDE.md`'s
  sign-off cycle: produce a standalone design draft in `drafts/`, flag every item needing
  approval, mark natural-extension vs. genuine-invention, wait for Josh's decision, *then*
  apply as one consolidated pass. The timeline audit is the working template for this —
  look at how `drafts/timeline-arithmetic-audit.RESOLVED.md` was structured (severity
  tiers, sign-off flags per item, a propagation plan naming exactly which scripts each
  fix touches) and at how the approval brief that came back mapped 1:1 onto script edits.
- **Batch discipline.** Hold small fixes; don't publish a pass per finding. Josh says
  when to execute.
- **Propagate in one pass.** A canon change that touches the sourcebook touches the DM
  Reference Guide and the Player Guide too, same commit. The Player Guide is *authored*
  to its own voice per the spoiler rules in `CLAUDE.md` — never produced by deleting DM
  material from the sourcebook text. Scan the regenerated Player Guide markdown for
  `DM Only`, `DM:`, `DM note`, character/place names that are meant to stay hidden,
  before calling a pass done.
- **Mechanical validation against SRD data** uses the GitHub-hosted 5e database
  (`codeload.github.com/5e-bits/5e-database`) preferentially over the live API — see
  `CLAUDE.md`'s Mechanical Validation section for the exact paths and when to use each.

---

## Where the next deep dive should point

Two independent tracks, per `CLAUDE.md`'s own instructions — pick based on what the
corpus needs right now (depth vs. correctness):

### Track A — Consistency Auditing (structural, like the timeline pass)

`CLAUDE.md`'s Consistency Auditing section calls for periodic passes checking:

- **New systemic canon against existing session text** — does anything recently added
  (the Imperial Calendar, Packlaw, bound-labor tiers, the dynasty's short-reigns material
  from this cycle) contradict language already written in a session module?
- **Terminology imported from other games** clashing with established vocabulary (the
  project's own example: "tenday" would conflict with the canonical seven-day week — scan
  for anything similar that crept in unnoticed).
- **Timeline arithmetic** — the just-closed audit was thorough but scoped to years/ages/
  the three-years-ago cluster. A follow-up could check *geographic* consistency (travel
  times against the map, described distances against stated timeframes) or *encounter
  math* (stated CRs/DCs against the DMG tables, per the Mechanical Validation section —
  this has apparently never been run as a dedicated pass).
- **Opportunities, not just contradictions** — the timeline audit's "O-" findings (the
  Harvestide double-anniversary, Solacre pinning both clocks) were free narrative texture
  the dates already implied but nobody had written down. Worth hunting for more of these
  deliberately, not just as a byproduct of fixing breaks.
- **Player Guide leak-scanning** as its own pass, independent of any content change — a
  systematic sweep rather than the just-in-case check that happens after every canon
  edit.

### Track B — New worldbuilding (generative, needs sign-off before canon)

`CLAUDE.md`'s "Remaining Worldbuilding Gaps," unresolved as of this handoff:

- **Medicine and disease** — mundane vs. chartered/blessed healing and who can afford
  which; sharpened by Farrowgate's overcrowding, which is already-written texture this
  would connect to.
- **Language and literacy** — Old Imperial vs. Common, liturgical tongues, who can read
  and what that gates in a bureaucratic empire.
- **Currency** — the coin still has no name. Smallest of the six; possibly a good
  low-stakes first exercise in the draft→sign-off cycle for a new session.
- **Military and institutional rank structures** — Colonel, Sergeant, Legate, Marshal,
  Captain used ad hoc with no defined ladder.
- **Law enforcement and justice at street level** — who arrests, who judges, what happens
  next, and how Crownlands practice differs from the provinces.
- **Legal personhood of the Marked** (tieflings) — connects directly to the existing
  four-tier bound-labor framework, so this one has real structural dependencies to
  respect rather than being freestanding.

Also still open **by design, not as gaps** — do not resolve these without Josh explicitly
deciding to: Empress Nyreeza's exact fate, Countess Ory's blood-rite mechanism, the
coronation's metaphysical consequence, whether the Piso gun over Marshal Dane ever fires,
whether any line of Threnvos survives, whether Qilvayas ever names an heir, and warlock
patron design. The timeline audit's M-1 finding *touched* the heir question (framed the
dynasty's short reigns as the pressure behind it) but deliberately left it unresolved —
know that context before going near it again.

---

## Suggested first actions for the next session

1. Confirm the environment (fonts, LibreOffice Writer, Ghostscript, poppler-utils) before
   assuming `tools/build.sh` will just work — see Environment above.
2. Run `tools/build.sh` once with no changes, confirm 11/11 documents verify clean and the
   build is idempotent (rebuild again, diff `documents/*.pdf` — should be byte-identical).
   This is the fastest way to confirm the environment is sound before doing any real work.
3. Ask Josh which track (A or B) the corpus needs right now, per the framing in
   `CLAUDE.md`: "offer these when the corpus needs depth rather than plot" for gaps, vs.
   "always after a large pass" for consistency audits — the timeline audit *was* a large
   pass, so a consistency sweep is arguably due regardless.
4. Whichever track: produce the draft in `drafts/`, get the sign-off brief back (the
   pattern from this cycle — a structured decision document mapping findings to specific
   script edits — worked well and is worth repeating), apply as one script-edit pass,
   `tools/build.sh`, verify, present diff for approval, commit only after approval.
