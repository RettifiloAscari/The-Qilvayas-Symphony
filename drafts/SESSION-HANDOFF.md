# Continuation Handoff — The Qilvayas Symphony

For a new Claude Code session picking this repository up. Written 2026-10-12, at
commit `6d9d8c3` on `main` — the go-live edition, finalized for Josh to run at the table.

**Read this for state and history. Do not read it for rules.** `CLAUDE.md` loads
automatically and holds the canon rules; the **`qs-build` skill** holds every production
mechanic and loads on demand. Both are the single copy of what they cover. If something
here ever contradicts them, they win and this file is stale.

---

## 0. Ask first

The corpus was finalized for Josh to run the campaign at the table. **Before writing
anything new, ask Josh how far the party has got and what they did.** The Branch Ledger in
the DM Reference Guide has a blank column for exactly this, and Sessions Nine and beyond
are built against it. Recording what happened at the table is the first job, and canon
written before it risks contradicting play.

---

## 1. Where the corpus stands

Thirteen documents, nine generators, **152 pages and about 127,000 words** (counted from
the PDFs as printed; `wc -w corpus/*.md` gives about 128,000). Everything builds clean and
byte-reproducible, and `tools/verify.sh --full` passed on the final commit.

| Document | Pages | Words |
|---|---:|---:|
| The Qilvayas Symphony Campaign Setting | 42 | 38,510 |
| Gazetteer of the Fractured Empire | 17 | 14,199 |
| QS DM Reference Guide | 13 | 6,733 |
| QS Player Guide | 12 | 9,543 |
| QS Player's Companion | 7 | 4,934 |
| Session 0, Primer | 4 | 2,626 |
| Session 1, The Silent Road | 9 | 7,149 |
| Session 2, The Road Back | 8 | 7,221 |
| Sessions 3–4, The Proving Below | 11 | 10,058 |
| Session 5, Dead Letters | 8 | 6,474 |
| Session 6, The Second Seal | 8 | 6,906 |
| Session 7, The Turning Away | 7 | 6,450 |
| Session 8, The Unkept Vigil | 6 | 5,958 |

**Measure it yourself before quoting it.** These figures go stale the moment anyone writes.

**Honest scale.** A published 5e setting book runs 224–320 pages; the sourcebook is 42.
Modules run 50–100; ours are 4–11. The *feature* gap against published 5e is closed; the
*volume* gap is not, and no single pass closes it. Do not tell Josh otherwise.

---

## 2. What happened since the last handoff

Eleven commits, `e2d5712` through `6d9d8c3`, all on `main`. Grouped:

1. **Readme and bullets (`e2d5712`, `8050792`, `bdeaefa`, `3190669`).** README leads with
   the documents; bullets got their glyphs back with an indent sized to the column; a
   polish pass the modules had never had.
2. **The bug check (`5b2149e`, `2d3c463`, `971a8bf`).** Text-layer fixes, arithmetic
   errors, columns that broke words. Every table may now break across a page; a table that
   could not break was silently eating rows at a column foot.
3. **Readability pass (`35bcf4a`).** Headings no longer strand at the foot of a column
   (`keep_lead_with_heading()` in `scripts/transplant.py`); numbered lists number themselves.
4. **Modules bound to later canon (`9f7bad4`, `678e39f`).** Every module checked against
   the sourcebook, Gazetteer and Companion written after it. Added: Coren the Unhurried as
   the Vigil's patron; Marek the Witness in Sessions 7–8; Ovric's blank icon on Dravenna's
   Vigil Hall wall in Session One (planted, never explained); Malich "of the Third"; Havel
   Corse at Varn's Crossing; Halvenne's unkept Vigil; the Dessen thread routed through
   Kolvess, Tallow and Thorne; faction Standing bullets in every module; a standing-sheet
   step in Session Zero. Session Zero's stranded duplicate sections removed.
5. **Go-live audit (`6d9d8c3`).** The first arc is Sessions 1–8 everywhere, in three
   *movements* (Academy, capital threads, Undercourt). Level milestones now run to 8th:
   4th early in Session Three, 5th at the Proving's close, 6th at the Second Seal, 7th in
   the Witness Hall, 8th when the Vigil is kept. Session Five's pacing budget fixed to 300
   minutes. Session Zero again forbids the word *Proving* at the table. Session Two gained
   its What Is Actually Happening section; Sessions Seven and Eight gained Rewards and
   Advancement (milestone governs; the Undercourt's XP does not reach those levels). Seven
   dead "Part N" references repointed; two HP formulas fixed (Custodian Ooze, Duke Norr);
   typography and American spelling normalized. Read-aloud boxes of 650 characters or
   fewer under a heading are now kept whole so the heading travels with them (documented
   in the skill and `PIPELINE_README.md`).

**Decided since, not to be reopened:** Josh reviewed Ovric, Struck from the Canon
(invented in `b85bfac`; what he witnessed "touches the Founding" and is deliberately
unstated) and kept it exactly as written.

---

## 3. The sister repository

`RettifiloAscari/the-kings-crusade` is a second campaign on the same pipeline, worked in
its own sessions. **Do not edit it unless Josh asks.**

Six tools are **byte-identical across both repos** — `anchor.py`,
`normalize_escapes.py`, `check_columns.py`, `check_tearing.py`, `find_page.py`,
`verify.sh` — with everything repo-specific in `tools/pipeline.conf`. A fix to any of them
should be copied across, not re-derived. Improvements have genuinely flowed both ways: the
tearing protections, `stage.js`, and three pipeline notes came *from* the Crusade repo.

---

## 4. What to work on

After the Branch Ledger (section 0), in rough order of value:

**Sessions Nine and beyond** — the second arc, built against the ledger.

**Regional depth.** Each of the Gazetteer's thirty settlements gets about 200 words where a
published gazetteer gives a major city two pages. Aenodira, Velmareth and Kamenhold repay
it most. Needs no new decisions.

**The Greywell module.** Seeded in Session Five's optional Farrowgate client and the
Gazetteer's Greywell-under-Hill. Countess Ory's blood-rite mechanism needs sign-off at
build time.

**Tarnovar.** Still wants the Vosthren ballad cycle and the Voivode's court.

**Known, left alone on purpose** (raise only if Josh asks or a pass touches them):

- Long H1s (Optional Content, the Loot titles) wrap to two or three lines at 22pt in the
  two-column measure. A type-size decision for Josh, not a bug.
- Session Zero, Session One and Session Five close on a short last page carrying the final
  paragraph and the epigraph. Not worth cutting content for.
- Vosk/Voss and Marec/Marek sit close in the name lists by cultural design.
- A feast-day legal delay for the Writ was considered and not added: the sourcebook does
  not grant feasts that legal force.

**Still needing Josh's explicit go-ahead:** setting feats and subclasses (an Oath of the
Witness, a Domain of the Vigil), and art in the published documents (port the Crusade
repo's `IMG()` helper rather than reinventing it).

---

## 5. What is deliberately open

These are unresolved **by design**. Do not close one without Josh saying so.

Empress Nyreeza's exact fate. Countess Ory's blood-rite mechanism. The coronation's
metaphysical consequence. Whether the Piso gun over Marshal Dane ever fires. Whether any
line of Threnvos survives. Whether Qilvayas ever names an heir. Warlock patron design — at
least one option may trace to the thing beneath Aenodira. And the legal personhood of the
Marked, which is *live* rather than open: it is tracked on the Branch Ledger and resolves
through play at the Twin Clocks' Solacre promulgation.

---

## 6. How Josh works

From `CLAUDE.md`, and borne out in practice:

- **Present forks as short multiple choice** with a stated recommendation, not open
  questions. Josh picks quickly and decisively.
- **Large passes go through a design draft first** in `drafts/`, with per-item sign-off
  flags, an explicit split between natural extension and new invention, and a propagation
  plan. Rename it `*.RESOLVED.md` afterward with a header recording what changed on contact
  with the code.
- **Josh notices layout.** The dagger reading as part of a creature's name, and prose butting
  against a table border, were both Josh's catches, not the pipeline's. When Josh reports
  something visual, render the page and look before theorising.
- **Josh values honest scope reporting.** Say what was reached versus what was claimed, and
  say plainly what was left undecided and why.

---

## 7. The one thing most likely to go wrong

Working from memory instead of the file. The corpus is about 127,000 words and no session holds
it. Every fabricated detail costs more to find and unpick than it saved. `grep` the corpus,
read the entry, then write.

The second most likely: assuming a check passed because the build did. `tools/build.sh`
catches escape leaks and font substitution. It does not catch a broken column, a torn stat
block, a spoiler in a player document, or a factually wrong rules claim. `tools/verify.sh`
catches the first three. Nothing but rendering the page and reading it catches the fourth.
