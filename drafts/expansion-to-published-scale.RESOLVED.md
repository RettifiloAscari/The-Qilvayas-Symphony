# Expansion to Published Scale — RESOLVED

**Resolved.** All four decisions applied, both volumes built, all nine modules deepened,
and the whole corpus rebuilt and verified. This header records what changed on contact
with the code; the draft below is unedited.

## What shipped

| | Before | After |
|---|---:|---:|
| Documents | 11 | **13** |
| Pages | 106 | **149** |
| Words | 86,142 | **128,912** |
| Generators | 7 | **9** |

- **D-1 Saints and Aspects** — applied. Seven Aspects mapped to the 2014 PHB domains, six
  more domains placed (including the two the empire deliberately has no Aspect for),
  three paladin oaths, fourteen saints with feasts on the existing calendar, four pilgrim
  roads. Strict monotheism preserved throughout.
- **D-2 Backgrounds and flavour** — applied. Eight 2014-format backgrounds, six shared
  Ideals, eight Flaws, ten naming cultures, downtime, etiquette, thirty trinkets, twenty
  character questions. No new feats, subclasses, or spells.
- **D-3 Two new volumes** — applied. `scripts/gazetteer.js` and `scripts/companion.js`.
- **D-4 Even module pass** — applied to all nine. Keyed areas (U1–U23, R1–R9, A1–A6,
  V1–V9, D1–D7, C1–C12), eight puzzles with several equal solutions each, five phased set
  pieces, nine trap/hazard blocks, seven encounter tables, eight handouts, and a corrected
  pacing budget in every module.
- **P-1 `columnWidths`** — applied, and larger than expected.

## What changed on contact with the code

1. **The `columnWidths` fix exposed a second problem.** With the widths finally honoured,
   columns authored below ~15% became *narrower* than the even split they had been
   silently rendering at, and started breaking words mid-syllable. Three tables had to be
   restructured rather than re-proportioned: the Factions table and the Canon of Saints
   became full-width prose entries (four columns do not fit a two-column body at all), and
   Appendix I's Roster went from five columns to four by merging Power Tier with Statted.
   Fifteen more tables were widened programmatically.

2. **A first attempt at that rebalance was wrong and was reverted.** Distributing the
   deficit proportionally to each column's slack gutted the prose columns — the saints'
   description column went 43% → 26% — because prose has short words and therefore
   measures as slack. The corrected rule only ever widens starved columns and takes the
   deficit from the widest column alone, with a 30% floor that refuses rather than
   mangles. Two tables hit that floor and were fixed structurally instead.

3. **A date collision was introduced and caught.** The dead-letter citations in Session
   Six were written as "eleven years ago", which is also when Archivist Vell's referral to
   Vaelindra ended badly — two unrelated events on one date, in a document a DM reads
   straight through, and the DM-only line made the false link explicit. The letters are
   Nyreeza's inquiry notes, which canon dates to twelve years ago; corrected to twelve, and
   Vell's line rewritten so it no longer echoes his own shame.

4. **`node --check` missed a real bug, exactly as CLAUDE.md warns.** A `c6.push` inside the
   Session Five block passed syntax checking and threw at build time.

5. **A heredoc's trailing newline landed inside a JS string literal**, breaking
   `campaign.js`. The edit helper now strips a trailing newline from any replacement whose
   anchor is single-line.

6. **`tools/normalize_escapes.py` is new**, and is the reason prose could be composed with
   real typographic characters. It caught 24 to 58 literal non-ASCII characters and up to
   164 straight apostrophes per generator, in text that would otherwise have compiled
   clean and leaked into the PDF.

## Verification

`node --check` and a real run of all nine generators; zero literal non-ASCII, zero
straight apostrophes between word characters, zero doubled escapes; `tools/build.sh` clean
on all thirteen; escapes and font substitution zero on every PDF; **byte-identical across
three consecutive builds, twice**; nine pages rendered to PNG and read; player-facing leak
scan clean on both shareable documents; refrains, timeline arithmetic, and cross-references
checked.

## Honest scale

A published 5e setting book runs 224–320 pages. The sourcebook is **42**. The line as a
whole is 149 pages across 13 documents — roughly half a published setting book's page
count spread over three volumes, plus nine modules that are now 6–11 pages each against a
published adventure's 50–100. This pass closed the *feature* gap against published 5e; it
did not close the *volume* gap, and no single pass honestly could.

---

# Expansion to Published Scale — Design Draft

**Status:** signed off in session, four decisions taken by multiple choice, building now.
**Scope:** the whole corpus. Two new volumes, a major sourcebook addition, a nine-module
depth pass, and one rendering defect fixed.

---

## Part 0 — What We Measured

Read before writing, per CLAUDE.md. Every figure below is from the built corpus, not memory.

| Document | Pages | Words |
|---|---:|---:|
| The Qilvayas Symphony Campaign Setting | 39 | 35,302 |
| QS Player Guide | 11 | 9,209 |
| QS DM Reference Guide | 13 | 6,208 |
| QS Sessions 3–4 The Proving Below | 8 | 6,402 |
| QS Session 1 The Silent Road | 6 | 4,980 |
| QS Session 6 The Second Seal | 6 | 4,971 |
| QS Session 2 The Road Back | 6 | 4,659 |
| QS Session 5 Dead Letters | 5 | 4,638 |
| QS Session 7 The Turning Away | 5 | 4,189 |
| QS Session 8 The Unkept Vigil | 5 | 3,977 |
| QS Session 0 Primer | 2 | 1,607 |
| **Total** | **106** | **86,142** |

A published 5e setting book runs 224–320 pages; an adventure module 50–100. The sourcebook
is at roughly one-sixth of the first figure and the modules at one-tenth of the second.

Proper-noun extraction over the full corpus returned 1,984 distinct capitalised forms.
That roster was the check against duplication for every name invented in this pass.

---

## Part 1 — The Gap Audit

### Missing from the sourcebook

| # | Gap | Severity | Note |
|---|---|---|---|
| G-1 | **No pantheon or divine figures beyond the Matron** | High | Zero hits for *deity*, *pantheon*, *saint* as a canon category. A 5e cleric picks a domain and canon offers nothing to attach it to. |
| G-2 | **No gazetteer** | High | Thirty settlements are named; each gets one clause inside a regional paragraph. None is keyed, described, or runnable. |
| G-3 | **No faction standing** | High | One passing use of "renown". Eight-plus factions with no way to track a party's position. |
| G-4 | **No travel, hazard, or supply rules** | High | Distances are stated and then abandoned. No pace, no navigation, no overland hazards. |
| G-5 | **No random encounter tables** | Medium | The regions name their creatures in detail and then give the DM no way to deploy them. |
| G-6 | **No downtime system** | Medium | An academy, a licensing bureaucracy, a relic economy, and a Vigil custom — a downtime system the setting has already written and never collected. |
| G-7 | **No name lists** | Medium | Ten distinct naming cultures visible in the corpus, none extracted for use. |
| G-8 | **No character options** | High | No backgrounds, no trinkets, no ancestry guidance. The largest player-facing hole after G-1. |
| G-9 | **No native bestiary** | Medium | Regional creatures named, nothing statted outside the Powers and per-module blocks. |

### Missing from the modules

| # | Gap | Severity | Note |
|---|---|---|---|
| M-1 | **No keyed map areas** | High | The Undervault is three levels of bulleted encounters. No area numbers, no room text, no map to key against. Same for the Undercourt descent. |
| M-2 | **Puzzles are single checks** | High | The Vault Warden's three routes are the format done right and are close to the only instance. Most obstacles resolve on one DC. |
| M-3 | **No full-mechanics traps** | Medium | The Gauntlet Walk is the nearest thing and it is a paragraph, not a trap block. |
| M-4 | **No handouts** | Medium | The cipher rubbing, the dead letters, the Warrant of Access are all described and none reproduced. |
| M-5 | **No sidebars, no per-module encounter tables** | Medium | |
| M-6 | **Scene density too low for the stated length** | High | Five scenes across five hours in Sessions 5, 7 and 8. An hour per scene with nothing in reserve. |

### Verified clean

Timeline arithmetic, the titles ladders, terminology, and the Player Guide leak scan were
all audited pre-launch and remain clean; this pass re-verifies rather than re-audits them.

---

## Part 2 — One Real Defect

**Every table in the corpus renders with evenly-split columns.** `docx-js` 9.7.1 emits a
`w:tblGrid` of dummy equal values when the `Table` is constructed without `columnWidths`,
and LibreOffice honours that grid over the per-cell `tcW` percentages. Confirmed by A/B
render: an 18/82 table rendered 50/50 and wrapped a prose cell to four lines that fit in two.

The `widths` arrays in all seven generators are already correct. They have been silently
discarded for the life of the project. This is why the commerce tables "crowd badly" —
recorded as a known limitation in CLAUDE.md and misdiagnosed there as a two-column-body
problem.

**Fix:** pass `columnWidths` (widths converted to twips against the usable text width) and
`layout: TableLayoutType.FIXED` in `table()` and `ltable()` in every generator, and add
`TableLayoutType` to `tools/docx-md-shim/index.js` so the Markdown half of the build does
not throw on the new import.

---

## Part 3 — Decisions Taken

Four forks put to Josh as multiple choice, per CLAUDE.md. All four resolved to the
recommended option.

### D-1. Theology → **Saints and Aspects**

Strict monotheism is preserved. The Matron remains alone. What is added:

- **The Doctrine of Aspects** — the offices the Matron holds, not gods she is divided into.
  Orthodoxy is precise on this and the distinction is doctrinally load-bearing.
- **Seven Aspects** mapped to the 2014 PHB cleric domains, plus guidance for the domains
  outside the PHB and one deliberate absence.
- **A canon of saints** with feast days keyed to the existing twelve-month calendar,
  patronage, iconography, and — for several — a barb the Church would rather not discuss.
- **Paladin oaths** mapped to existing canon institutions.
- **Pilgrimage roads and the great shrines.**

*Natural extension of approved canon:* the Aspects and the domain mapping. The corpus
already establishes lunar iconography, the Vigil, the Old Observance, the Packlaw, and the
Sanction; the Aspects name what is already implied and give a cleric somewhere to stand.

*Genuine invention:* the saints themselves — fourteen named people who did not exist
before this pass — and their feast days. Flagged as such. None contradicts an existing
name; all fourteen were checked against the 1,984-entry proper-noun roster.

*Deliberately not decided:* whether any saint was ever a lycanthrope; whether the Matron
has ever contradicted a canonisation. Both left open as hooks.

### D-2. Character options → **Backgrounds and flavour, no new mechanics**

2014-format backgrounds only. No new feats, no new subclasses, no new spells. Everything
sits inside 2014 RAW and needs no balance testing. Name lists, trinkets, and ancestry
guidance accompany them.

*Deliberately not decided:* setting feats and subclasses. Named as a future pass requiring
playtest, not built here.

### D-3. Structure → **Two new volumes**

- **Gazetteer of the Fractured Empire** — DM-facing. Keyed settlements for all ten regions,
  travel and the road, overland hazards, regional encounter tables, and a native bestiary.
- **QS Player's Companion** — player-facing and fully shareable. Backgrounds, names, the
  faith as a worshipper meets it, the ancestries in this world, downtime, and kit.

The sourcebook keeps the lore and gains the Saints, the Aspects, and faction standing.

*Propagation:* both volumes are new generators, new corpus files, new PDFs, new README rows,
new `GENERATORS` entries in `build.sh`, and new layout entries in CLAUDE.md and its mirror.

*Spoiler discipline:* the Companion is authored player-facing from the first word, never by
deleting from a DM document — the same rule the Player Guide already follows. It is scanned
for DM-only strings before publishing.

### D-4. Modules → **Even pass across all nine**

Every module gets: keyed map areas where there is a location to key; at least one real
puzzle with several genuinely equal solutions and DM notes saying so; a set piece run in
phases with a decision at each transition; a trap block with full mechanics; a handout; a
sidebar or two; an encounter table; and a **corrected pacing budget** covering the new
material. New content that is not in the budget is a continuity bug.

---

## Part 4 — Build Order

Dependency order, per the propagation rule. One commit.

1. Pipeline: the `columnWidths` fix and the shim.
2. Core canon: sourcebook — Saints and Aspects, faction standing.
3. New volumes: Gazetteer, Player's Companion.
4. Modules: all nine.
5. Reference and player-facing: DM Reference Guide, Player Guide.
6. README.
7. CLAUDE.md and `reference/project-instructions.md`, in the same pass.

---

## Part 5 — Sign-Off Checklist

| # | Item | Decision |
|---|---|---|
| D-1 | Saints and Aspects, strict monotheism preserved | Approved |
| D-2 | Backgrounds and flavour only, no new mechanics | Approved |
| D-3 | Two new volumes — Gazetteer and Player's Companion | Approved |
| D-4 | Even depth pass across all nine modules | Approved |
| P-1 | `columnWidths` rendering fix | Pipeline defect, no sign-off needed |

## Part 6 — Deliberately Not Decided

Carried forward untouched, and explicitly not resolved by this pass:

- Empress Nyreeza's exact fate.
- Countess Ory's blood-rite mechanism.
- The coronation's metaphysical consequence.
- Whether the Piso gun over Marshal Dane ever fires.
- Whether any line of Threnvos survives.
- Whether Qilvayas ever names an heir.
- Warlock patron design.
- The legal personhood of the Marked — live on the Branch Ledger, resolution handed to play.

Added to that list by this pass:

- **Setting feats and subclasses.** D-2 deliberately stopped short. An Oath of the Witness
  and a Domain of the Vigil are the obvious candidates and both need playtest.
- **Whether the Matron has ever refused a canonisation.** The saints' canon is written so
  that at least two entries would change meaning if she had.
