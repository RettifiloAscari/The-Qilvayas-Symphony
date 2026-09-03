# Continuation Handoff — The Qilvayas Symphony

For a new Claude Code session picking this repository up. Written 2026-09-03, at
commit `f4b8c3a`.

**Read this for state and history. Do not read it for rules.** `CLAUDE.md` loads
automatically and holds the canon rules; the **`qs-build` skill** holds every production
mechanic and loads on demand. Both are the single copy of what they cover. If something
here ever contradicts them, they win and this file is stale.

---

## 1. Where the corpus stands

Thirteen documents, nine generators, **150 pages and 129,037 words**, all building clean
and byte-reproducible.

| Document | Pages | Words |
|---|---:|---:|
| The Qilvayas Symphony Campaign Setting | 43 | 39,800 |
| Gazetteer of the Fractured Empire | 17 | 14,964 |
| QS DM Reference Guide | 13 | 7,443 |
| QS Player Guide | 12 | 9,958 |
| QS Player's Companion | 7 | 5,479 |
| Sessions 3–4, The Proving Below | 11 | 10,184 |
| Sessions 1, 2, 5, 6, 7, 8 | 6–8 each | ~38,500 total |
| Session 0, Primer | 4 | 2,713 |

**Measure it yourself before quoting it.** `tools/verify.sh` ends with a page census, and
`wc -w corpus/*.md` gives the words. These figures go stale the moment anyone writes.

**Honest scale.** A published 5e setting book runs 224–320 pages; the sourcebook is 43.
Modules run 50–100; ours are 6–11. The *feature* gap against published 5e is closed —
pantheon, gazetteer, faction standing, travel, hazards, encounter tables, downtime, names,
backgrounds, bestiary, keyed maps, puzzles, traps, handouts all exist. The *volume* gap is
not, and no single pass closes it. Do not tell Josh otherwise.

---

## 2. What happened in the last session

Eight commits, `b85bfac` through `f4b8c3a`. In order:

1. **`b85bfac` — the content pass.** Four decisions taken by multiple choice, all four to
   the recommended option: Saints and Aspects (strict monotheism preserved), backgrounds
   and flavour only with no new mechanics, two new volumes rather than one big book, and
   an even depth pass across all nine modules. Added the Doctrine of Aspects, seven Aspects
   mapped to the 2014 PHB domains, fourteen saints with feasts on the existing calendar,
   faction Standing, the Gazetteer, the Player's Companion, and keyed areas / puzzles /
   traps / handouts across every module. Decision record in
   `drafts/expansion-to-published-scale.RESOLVED.md`.
2. **`67f22b8`, `e692f00` — the dagger.** The `(†)` mark for non-SRD creatures now
   repeats its key under every table that uses one, and is bracketed so it reads as a
   reference rather than part of the creature's name.
3. **`666085c`, `a8739a6` — tooling.** Five authoring tools and `verify.sh`, the
   `qs-build` skill, and `tools/pipeline.conf`.
4. **`8130501` — torn stat blocks.** Three blocks were printing six ability labels at the
   foot of one column and six numbers in the next. Fixed and encoded in
   `tools/check_tearing.py`.
5. **`d473fbe` — `scripts/stage.js`.** The hardcoded `/home/claude` is gone.
6. **`f4b8c3a` — table spacing.** Prose after a table no longer butts against its border.

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

Canon states its own roadmap at the end of the sourcebook. In rough order of value:

**The obvious next content pass — regional depth.** The Gazetteer gives each of thirty
settlements about 200 words where a published gazetteer gives its major cities two pages.
Aenodira, Velmareth and Kamenhold would repay it most. This is the single largest step
toward published scale and needs no new decisions.

**Sessions Nine and beyond.** Built against the Branch Ledger in the DM Reference Guide,
which records what actually happened at Josh's table. **Ask him what the party did before
writing anything** — the ledger is the input, and it is blank until he fills it.

**The Greywell module.** Seeded in Session Five's optional Farrowgate client and in the
Gazetteer's Greywell-under-Hill entry. A self-contained gothic horror arc. Countess Ory's
blood-rite mechanism is deliberately undecided and needs sign-off at build time.

**Tarnovar.** Well advanced. Still wants the Vosthren ballad cycle in full and the
Voivode's court before the envoy thread matures into an arc.

**Two things deliberately not built,** and both need Josh's explicit go-ahead:

- *Setting feats and subclasses.* The Companion stops at backgrounds on purpose, entirely
  inside 2014 RAW, so nothing in it needs balancing. An Oath of the Witness and a Domain
  of the Vigil are the obvious candidates and both want real playtest.
- *Art in the published documents.* `images/` serves the repository, not the corpus.
  Getting artwork in means an image path added to both docx-js generation and the Markdown
  shim across nine generators. The Crusade repo has already solved this with an `IMG()`
  helper — port it rather than reinventing it.

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
  questions. He picks quickly and decisively.
- **Large passes go through a design draft first** in `drafts/`, with per-item sign-off
  flags, an explicit split between natural extension and new invention, and a propagation
  plan. Rename it `*.RESOLVED.md` afterward with a header recording what changed on contact
  with the code.
- **He notices layout.** The dagger reading as part of a creature's name, and prose butting
  against a table border, were both his catches, not the pipeline's. When he reports
  something visual, render the page and look before theorising.
- **He values honest scope reporting.** Say what was reached versus what was claimed, and
  say plainly what was left undecided and why.

---

## 7. The one thing most likely to go wrong

Working from memory instead of the file. The corpus is 129,000 words and no session holds
it. Every fabricated detail costs more to find and unpick than it saved. `grep` the corpus,
read the entry, then write.

The second most likely: assuming a check passed because the build did. `tools/build.sh`
catches escape leaks and font substitution. It does not catch a broken column, a torn stat
block, a spoiler in a player document, or a factually wrong rules claim. `tools/verify.sh`
catches the first three. Nothing but rendering the page and reading it catches the fourth.
