# Design Draft — Timeline Arithmetic Audit

*The Qilvayas Symphony — full-corpus consistency pass, dates and elapsed years*

**Status: draft for review. No canon has been modified.** Every item below is a finding
awaiting Josh's approve / redline / veto. Nothing folds into canon until signed off, and
canon now means a generator script — see the propagation plan.

**This supersedes the earlier draft**, which was written against the old `setting/` and
`sessions/` directory layout that no longer exists. This pass is re-grounded in the
current structure: audited against the **v11 corpus** (`corpus/`), and it now covers
**Sessions Seven and Eight**, which the first audit never saw.

## How to read the citations

Canon lives in the **generator scripts**; the readable corpus is generated from them. So
every finding gives two things: where to **read** it (a `corpus/` file and line) and where
to **fix** it (the script that produces that file). The mapping is fixed:

| Read it in `corpus/` | Fix it in `scripts/` |
| --- | --- |
| `The_Qilvayas_Symphony_Campaign_Setting_v11.md` (cited below as **SB**) | `campaign_v11.js` |
| `QS_Session_0_Primer.md`, `_1_`, `_2_` | `sessions.js` |
| `QS_Sessions_3-4_The_Proving_Below.md` | `session34.js` |
| `QS_Session_5_Dead_Letters.md`, `QS_Session_6_The_Second_Seal.md` | `s56.js` |
| `QS_Session_7_The_Turning_Away.md`, `QS_Session_8_The_Unkept_Vigil.md` | `s78.js` |
| `QS_DM_Reference_Guide.md` | `refguide.js` |
| `QS_Player_Guide.md` | `playerguide.js` |

Line numbers drift as scripts are edited; treat them as "current as of this pass," and
confirm against the script before editing. After any fix, `tools/build.sh` regenerates the
corpus and the PDFs together.

**Method.** The corpus has no anchor year — the calendar leaves the Years of the Reckoning
figure deliberately soft (SB, *The Imperial Calendar*), and the timeline frames everything
as "years ago" to stay portable (SB:863). So every date is relative to "present day," the
party's final field exercise (SB:863). I rebuilt the chronology from that anchor and tested
every stated interval against it.

**Headline, re-confirmed against v11.** The spine holds. The three-year Nyreeza marker is
correct everywhere it appears — now in **eleven** places, counting two new payoffs in
Sessions Seven and Eight. The fifty-year Vaelindra marker holds; the disappearance →
six-month search → coronation chain still closes exactly. The failures are unchanged from
the first audit: they sit at the edges, where two separately-written figures were never
multiplied against each other. Sessions Seven and Eight introduce **no new arithmetic
contradictions**.

---

## Severity Key

| Tier | Meaning |
| --- | --- |
| **High** | A player can catch it at the table, or it breaks a causal chain in canon. Fix before the next pass. |
| **Medium** | Internally contradictory, but only a reader with two documents open will see it. Fix when convenient. |
| **Low** | Drift, imprecision, or an unanchored figure. Worth a line in a consolidated pass. |

---

# HIGH

## H-1. The commencement clock does not close

Three passages state the same countdown and none of them agree.

- **SB:863** — present day is "the party's final field exercise, **five weeks before
  commencement**." That is the anchor.
- **`QS_Session_2`:27** — "The journey to the capital takes **four days** by the imperial road."
- **`QS_Session_2`:65** — on arrival, the instructor "reminds them **commencement is in
  five weeks**." It is four and a half. The instructor repeats the anchor figure from four
  days and one province ago.
- **`QS_Sessions_3-4`:121** — after the Proving, the cohort "graduates … within the week —
  **five weeks early**, by the Chancellor's privilege."

That last one is the break. Sessions Three–Four run *after* the party reaches the capital,
so at most four weeks remain on the clock — you cannot graduate five weeks early into a
four-week window. As written, the Proven cohort graduates before it sits the Proving. This
is the only finding a player can catch with a calendar and no cross-referencing, and an NPC
says it aloud.

**Recommendation.** Make the anchor **six weeks**; let the instructor say "five weeks"
correctly on arrival; let the ceremony run "**four weeks early**." One figure in
`campaign_v11.js` (the timeline entry, SB:863), one in `sessions.js` (S2:65), one in
`session34.js` (the Proving-below ceremony, S3-4:121).

> **SIGN-OFF FLAG H-1** — natural extension; arithmetic only, no fiction changes. Three
> scripts: `campaign_v11.js`, `sessions.js`, `session34.js`.

## H-2. Aldrec came home to a kingdom that did not exist yet

**SB:692** (and verbatim in **`QS_Player_Guide`:217**):

> "at the Weeping Strait, **twenty years ago** … Aldrec … **went home to find Ardven's
> expansion swallowing the fjords**."

But Ardven is five years younger than that homecoming:

- **SB:872** — "**~15 years ago:** Karvel begins the consolidation of the northern crowns
  into Ardven."
- **SB:728** — Karvel's realm is "**fifteen years** of war, marriage, and administration."
- **`QS_DM_Reference_Guide`:177** — "~15 yrs ago | Karvel begins unifying Ardven."

At the Weeping Strait, Karvel had not started; there was no Ardven to come home to. The
causal chain that makes Aldrec the campaign's great persuadable — *the empire spent his
people, then let his home be taken* — runs backwards.

**Recommendation, in preference order:**

1. **Decouple the two events.** Aldrec comes home to fjords already under pressure from the
   northern crowns *as they then were*, and Karvel's consolidation, five years later,
   finishes what those crowns started. One clause in `campaign_v11.js` and `playerguide.js`;
   keeps every date; arguably better fiction, since he watched the wound open slowly.
2. Move the Weeping Strait to ~15 years ago — but see M-3; it makes his age worse.
3. Move Karvel's consolidation to ~20 years ago — rejected: breaks "fifteen years" in three
   places.

> **SIGN-OFF FLAG H-2** — Option 1 is a natural extension; Options 2–3 are structural
> changes to a Power's history and need explicit approval. `campaign_v11.js`,
> `playerguide.js` (and the timeline entry if dates move).

## H-3. Vell archived three years of correspondence that had not been written

Stated twice, in two sessions, both times as an emotional beat:

- **`QS_Sessions_3-4`:123** — "I archived **twelve years** of her academy correspondence."
- **`QS_Session_6`:27** — "he archived **twelve years** of this hand."

The arithmetic: Nyreeza "begins the academy revival" ~12 years ago (**SB:873**), and the
revival is the start of her academy involvement (SB, *The Imperial Academy*). She vanished
3 years ago (**SB:877**). The correspondence runs **nine years**, not twelve.

Load-bearing, because Vell's authority to identify her hand on sight rests on the volume,
and the line lands at the two moments the Nyreeza trail turns.

**Recommendation.** "Twelve" → "**nine**" in both places — the smaller number is more
affecting, being exactly the span of her reform. Fix in `session34.js` (S3-4:123) and
`s56.js` (S6:27).

> **SIGN-OFF FLAG H-3** — natural extension; arithmetic only. Two scripts.

---

# MEDIUM

## M-1. The pre-Nyreeza dynasty is described three incompatible ways

Three passages make claims about who ruled before Nyreeza; no two are compatible.

| Source | Claim |
| --- | --- |
| **SB:656** | Vaelindra "has … watched **three rulers come and go**, including Empress Nyreeza." |
| **SB:758**, **`QS_Player_Guide`:195** | Kessin has "**outlasted two regents**." |
| **SB:270** | "Empress Nyreeza ruled **in her own right, not as regent**." |
| **SB:388** | Qilvayas is "old enough to rule **without a regent**." |

Two problems compound. *Regents* imply minority reigns — two of them, recent enough for one
bureaucrat to outlast both — a substantial piece of dynastic history that exists nowhere
else and sits oddly beside the Packlaw passage insisting the dynasty's women ruled in their
own right. And the arithmetic: Vaelindra has been in the capital ~50–55 years (see L-1);
three *completed* reigns in that span, plus Qilvayas's, means Drow monarchs of a
~750-year-lived race are averaging under twenty years on the throne. Either the dynasty is
violent, or sickly, or something is eating it — currently an accident of phrasing rather
than a decision, and it bears directly on the deliberately-open thread of whether Qilvayas
ever names an heir.

**New in v11, and relevant:** Session Seven introduces **Emperor Vaskaren the Restorer**,
who "**roughly two hundred years ago**" scoured the Witness Hall (**`QS_Session_7`:27**;
also SB:374), with Qilvayas "the second restorer of that line." This furnishes the dynasty
with a named ancestor — but at 200 years' remove, it does nothing to resolve the *near-term*
turnover that Vaelindra and Kessin imply. If anything it raises the stakes of getting the
dynasty's shape deliberate: there is now canon dynastic history to be consistent with.

**Recommendation — a decision, not a correction:**

- **(a) Soften both.** Vaelindra watched "two rulers come and go"; Kessin "outlasted two
  chamberlains and one attempted reform." Nothing asserted, gap stays clean.
- **(b) Keep the turnover and make it mean something.** Short imperial reigns become canon;
  the timeline gains a line for the pre-Nyreeza century; the dynasty's fragility becomes a
  live political fact the court does not discuss — pairs well with the unnamed heir and with
  Vaskaren's failed restoration.
- **(c) Keep the regents, drop the contradiction.** The regencies were for Nyreeza's
  *predecessors*; SB:270 stands because it is about Nyreeza specifically.

I'd take (a) unless Josh wants the dynasty's instability on the board, in which case (b) is
the richer campaign and now has Vaskaren to hang on.

> **SIGN-OFF FLAG M-1** — **genuine new invention** under (b) or (c). Structural
> worldbuilding touching the dynasty; explicit approval required. `campaign_v11.js`
> (sections *Magic and the Word*, *Emperor Qilvayas*, *Key NPCs*, *Geography*, timeline),
> `refguide.js`, `playerguide.js`.

## M-2. Olvesa: fifteen undocumented years between the shrine and the See

The prose reads as one continuous movement (**SB:722**): vengeance, one year in the shrine,
"what came out was … founder of the See of Orlath." The dates do not:

- Vengeance: **~60 years ago** (SB:722, `QS_Player_Guide`:227).
- Plus a year in the shrine → she emerges ~59 years ago.
- See of Orlath founded: **~45 years ago** (SB:868, SB:73, `QS_DM_Reference_Guide`:173,
  `QS_Player_Guide`:65).

Fourteen years unaccounted for, in the life of the character whose road from atrocity to
sanctity is the campaign's test of whether redemption is real. Her stat block quietly takes
the *later* anchor, which sharpens the gap:

- **SB:1216** — Drevic "she has not spoken aloud in **sixty years**" (anchored to the vengeance).
- **SB:1200** — "she has not worn armor in **forty-five years**" (anchored to the founding).
- **SB:1220** — "struck four times in **forty-five years**."

So she stopped speaking her enemies' language the year she destroyed them, but kept her
armour on for fifteen years after her conversion.

**Recommendation.** Fill the gap rather than close it — free characterization. A timeline
line: she left the shrine and spent those years a penitent without a church, walking the
north, before the See was founded around her rather than by her. Reconciles the armour,
deepens the sainthood she wears with distaste, explains the See's "plain and rigorous"
rite. Fix in `campaign_v11.js`.

> **SIGN-OFF FLAG M-2** — the fifteen penitent years are **new invention** about a Power's
> biography. Approval required. `campaign_v11.js`, `refguide.js`, `playerguide.js`.

## M-3. Aldrec was thirty-five in his "youth"

**SB:692** — "Aldrec, **in his fifties now**, served the empire **in his youth** … at the
Weeping Strait, **twenty years ago**." Fifty-something minus twenty is thirty-something — a
veteran of the oar-benches in his mid-thirties is mid-career, not in his youth. The DM note
that he is "dying slowly of an old wound" and that "the window closes with him" also wants
an older man. Interacts with **H-2**: any fix moving the Strait *later* makes his age worse.

**Recommendation.** Keep him in his fifties and change "in his youth" to "**as a young man,
and for twenty years after**" — the service becomes a career the empire ended, not a single
betrayal, and the sentence fixes in place. Fix in `campaign_v11.js` and `playerguide.js`.

> **SIGN-OFF FLAG M-3** — a Power's stated age. Approval required. Two scripts.

## M-4. Archivist Vell is a dwarf everywhere except Session Two

Not a date, but it surfaced from the age arithmetic and fails the same way.

- **SB** (*Peoples of the Empire*) and **SB** (Roster, Appendix I) — Vell is a **hill dwarf**.
- **`QS_DM_Reference_Guide`** (Academy NPCs) — "Vell hill dwarf."
- **`QS_Session_2`:67** — "Archivist Dathenor Vell — **half-elf**, ancient by human reckoning."

Session Two contradicts the sourcebook, and the age claims make it a timeline problem, not a
typo: Vell knew Vaelindra "when both were young functionaries," so his career reaches back
50+ years, and he has "outlasted four chancellors" in an institution where the *current*
chancellor's tenure alone has run twelve Provings. That's a career north of a century — a
hill dwarf carries it; a half-elf at eighty is barely middle-aged and not "ancient by human
reckoning." Chancellor Sorral is the canon half-elf, the likely source of the slip.

**Recommendation.** Correct Session Two to hill dwarf. Fix in `sessions.js` (S2:67).

> **SIGN-OFF FLAG M-4** — natural extension; the roster is canon and Session Two departs
> from it. One script.

---

# LOW

## L-1. Vaelindra was twenty-eight when she "built some of" the Office's methods

The fifty-year marker is consistent (SB:869 timeline; `QS_Session_2`; `QS_Sessions_3-4`;
`QS_Session_6`:15, :44, :46; `QS_DM_Reference_Guide`). Her stated age strains against it:
"**late seventies, perhaps older**" (**SB:656**) puts her ~28 at the career-ending vision.
Fine for "a minor functionary, bright and ambitious." Less fine for the Session Six line
where she says the Prelate's office is good at its work because "**I built some of its
methods**" — a twenty-eight-year-old junior functionary did not build the Office's methods.

**Recommendation.** Either push her age to "**past eighty, and vague about it**," or soften
the line to "I was *trained* in its methods, and I trained others." The second is cheaper
and sharper. Fix in `campaign_v11.js` (her age) or `s56.js` (the line).

> **SIGN-OFF FLAG L-1** — a major NPC's stated age or a spoken line. Approval required.

## L-2. Norr loses four years in the Player Guide

- **SB:734** (sourcebook): attempts "before the age of twenty," killed his last rival "at
  twenty-four," "and has spent **the two decades since**" → about forty-four.
- **`QS_Player_Guide`:241**: "survived three assassination attempts before the age of twenty
  **and has spent two decades since**…" — the rival-killing clause is gone, so "two decades
  since" now attaches to *before the age of twenty*. He reads as forty, and as having built
  his administrative state while still fighting for the duchy.

**Recommendation.** Restore the clause in `playerguide.js`, or re-anchor to "took Normere in
fact twenty years ago and has spent the two decades since." Nothing spoiler-bearing.

> **SIGN-OFF FLAG L-2** — natural extension. `playerguide.js`.

## L-3. Aenodira's three walls run the wrong way in time

**SB:742.** The rings are stated correctly — Founder's Wall oldest, Long Wall "right before
the fracture began." Then: "**Walking outward** from the palace is walking **backward**
through **two hundred years** … **until the confidence runs out**." Three inversions:
walking outward goes oldest → newest, which is *forward*; the span is roughly two *thousand*
years, not two hundred; and the outer wall is the empire's confidence at its *peak*, so
confidence doesn't run out at the edge — it runs out in the empty half-built districts
*behind* it (as the very next paragraph says).

**Recommendation.** "Walking outward … is walking **forward** through two thousand years …
**until you reach the wall it built for a city that never came**." Same cadence, correct
arrow, clean hand-off. Fix in `campaign_v11.js`.

> **SIGN-OFF FLAG L-3** — natural extension; prose fix. `campaign_v11.js`.

## L-4. Dregan's decade at a four-year academy

**SB:870** — "arrives at the capital academy as a hostage-student … **returns home a decade
later**." **SB:534** — "The standard academy program lasts **four years**." Defensible: a
hostage is a diplomatic guarantee, not a matriculation (SB, *Emperor Qilvayas*, frames
hostage-diplomacy as open-ended standing), but it's never said, and the six unexplained
years are exactly where "something broken behind the eyes" happened. The rest is exact —
arrives 40 years ago, home 30, "for thirty years he has held the Eastmarch" (**SB:704**).

**Recommendation.** One clause in the timeline entry: he remained past his studies, as
hostages do, at the throne's convenience. Free, and it sharpens the grievance. Fix in
`campaign_v11.js`.

> **SIGN-OFF FLAG L-4** — natural extension. `campaign_v11.js`.

## L-5. Dane's recovery has a zero-width window, and no timeline entry

- Silvasse Disaster: ~60 years ago (**SB:867**).
- Vessarkath "let one standard leave her hoard … **sixty years after taking it**"
  (**SB:129**).
- Dane "recovered the wolf-standard of the Ninth … **sixty years after** the Silvasse
  Disaster" (**SB:698**, `QS_Player_Guide`:221).

The dragon releases it and Dane recovers it in the same year, leaving no time for the
standard to travel through channels, reach the Brekelands warlords, be *known* to be there,
and be campaigned for. Dane is also "not yet thirty-five," so it must fit a short career.
Separately, the empire's most celebrated recent event — the one that made the Young Wolf —
appears on **neither** timeline (SB nor `QS_DM_Reference_Guide`).

**Recommendation.** Add two entries and open the window: **~3 years ago**, Vessarkath
permits one eagle to leave, and it surfaces among the warlords (why is DM-only — see O-3);
**~1 year ago**, Dane recovers it. Fix in `campaign_v11.js` and `refguide.js`.

> **SIGN-OFF FLAG L-5** — natural extension for the entries themselves; **see O-3** for the
> dating choice, which is not. `campaign_v11.js`, `refguide.js`, `playerguide.js`.

## L-6. Duchess Vasq's clock has no anchor

**SB:710**, `QS_Player_Guide`:229 — "married young … **widowed at forty**, and ruler in all
but name **ever since**." Her current age is never given, the widowing never dated, so "ever
since" is unmeasurable and the Vintage Night (6 years ago) can't be placed against it. It
matters: a ruler of two years who loses control of an arrest order is a different woman from
a ruler of twenty, and the whole reading of "she chose to own it rather than be seen to have
lost control" turns on which.

**Recommendation.** One figure, anywhere: widowed ~fifteen years ago, making her
mid-fifties, giving Aldous time to be a "young Duke," and putting the Vintage Night nine
years into a rule she believed secure. Fix in `campaign_v11.js` and `playerguide.js`.

> **SIGN-OFF FLAG L-6** — a Power's biography. Approval required. Two scripts.

---

# Verified Clean

Recorded so the next audit does not re-derive them.

| Check | Result |
| --- | --- |
| Nyreeza: disappearance (3 yrs) → six-month search → coronation (~2.5 yrs) | **Closes exactly.** |
| The "three years" cluster — now **eleven** documents including SB:688, SB:724, SB:836, `QS_DM_Reference_Guide`, `QS_Player_Guide`:191, `QS_Sessions_3-4`, `QS_Session_5`, `QS_Session_6`, **and two new payoffs**: Nyreeza's camp "three years old" (`QS_Session_7`:49) and the wolves "reversing three years of quiet exodus" (`QS_Session_8`:97) | **No drift.** Exemplary propagation. |
| Vaelindra's fifty years across sourcebook and sessions | **Consistent** (see L-1 on her age). |
| Dregan: arrives 40 → home a decade later → "thirty years" on the Eastmarch | **Closes** (see L-4). |
| Vintage Night (6 yrs) and Harrowing of the Weld (4 yrs) across SB, guides, Player Guide | **Match.** |
| Norr within the sourcebook: attempts before 20 → rivals dead at 24 → two decades → ~44 | **Closes** (Player Guide drifts — L-2). |
| Founding ~2,000 yrs against "twenty centuries of oral drift," "two thousand years" of the monument, and the **Session 7–8** refrain ("two thousand years late," `QS_Session_8`:15/23/67/91) | **Consistent throughout.** |
| Fracture ~200 yrs against "two centuries of decline," Tarnovar "independent for a century," and **Vaskaren's scouring "roughly two hundred years ago"** (`QS_Session_7`:27, SB:374) | **Consistent** — the new v11 material lands on the fracture anchor cleanly. |
| Sessions Seven and Eight, full pass | **No new arithmetic contradictions.** The only elapsed-time figures are the three-year payoffs above and "two thousand years," both correct. |
| Calendar vs. Session One's Harvestide season | **Correct** (and see O-1). |
| Countess Ory: church records at seventy, seen as forty, "40+ girls across two decades" (SB:716, :718) | **Internally consistent** — see O-4. |

---

# Opportunities the Arithmetic Opens

Additive, cost nothing but ink. Per the consistency-audit brief: what the dates make
*available*, not only what they break.

## O-1. Session One opens on a double anniversary, and nothing says so

- Session One's season is **Harvestide** (`QS_Session_1`).
- The Vintage Night "fell in Harvestide" (SB, *Imperial Calendar*), **six years ago**.
- Vaelindra dates the quickening to "**three years ago, almost to the season**"
  (`QS_Sessions_3-4`) — so the Empress vanished in Harvestide too.

The campaign opens on the sixth anniversary of the massacre and the third of the
disappearance, in the same week. Free, and thematically exact for a campaign about the
weight of things sworn and broken. Available at no structural cost: mourning bells in the
Ostmark of Session One; Orlathine kin keeping a roadside Vigil in Session Two; the capital's
flat official silence about the anniversary while an Emperor who has not entered a room in
three years walks the Long Course alone at dawn. When Vaelindra says "almost to the season,"
a player who was paying attention gets to go cold.

> **SIGN-OFF FLAG O-1** — texture only; but it writes into two already-run modules
> (`sessions.js`), so it needs approval rather than free-latitude invention.

## O-2. Solacre already pins both clocks

SB, *Imperial Calendar* — "the Zhuvedian Laws are **slated for a Solacre reading**." Solacre
is early summer, month five. From a Harvestide start, that is **nine to ten months out** —
and Karvel's coronation is "the same season" (SB:863 region; SB:728). The timeline says only
"within the coming year," vague for the campaign's first structural clock. The calendar
already made the decision.

**Recommendation.** Restate as "**Solacre, nine months out**" in `campaign_v11.js` and
`refguide.js`. Nothing invented — already canon in two places not multiplied together.

> **SIGN-OFF FLAG O-2** — natural extension; recommend approve.

## O-3. Date Vessarkath's release into the acceleration window

Why an ancient green let one standard leave is "DM-only and deliberately open" (SB:129). The
open question and L-5's zero-width window solve each other. If the release is dated to ~3
years ago rather than "sixty years after taking it," it lands inside the post-Nyreeza
acceleration — alongside the wolves leaving, Vaelindra's quickening, Olvesa's darkening,
Dregan's worsening dreams. A creature patient for eight centuries chose *that* season to
move: it felt what every other true-seeing thing on the continent felt. Costs nothing,
closes L-5's window, hands a deliberately-open question an answer that is available without
being forced.

> **SIGN-OFF FLAG O-3** — **touches the shadow's mechanics and a deliberately-open
> question.** Explicit sign-off required. Veto-safe: L-5's entries work with any date; only
> the *meaning* of the date needs approval.

## O-4. Countess Ory's rite already has a start date

"Forty girls across two decades" (SB:718), church records at **seventy**, seen as **forty**
(SB:716). The arithmetic puts the rite's beginning ~**twenty years ago, at roughly age
fifty** — exactly when a famously beautiful woman would first have reason to look for one. A
fixed point available free when the Greywell mechanism is chosen (still open by design).

> **No sign-off required** — observation only.

---

# Structural Note: The Missing Anchor

Every finding except M-4 and L-3 has the same root cause. The corpus has no anchor year —
the calendar leaves the Reckoning figure "deliberately soft," and the timeline frames dates
as "years ago" to stay portable. That was the right call for the fiction: an empire that has
lost count of its own age is better than one with a tidy calendar. But it means no document
can check itself. "Twelve years of correspondence" and "the revival began twelve years ago"
are both individually correct and jointly wrong, and nothing in the pipeline can catch it,
because there is no year to subtract from.

**Recommendation.** Adopt a **DM-only anchor** — a single internal year for the present,
recorded once in the DM Reference Guide's timeline header (`refguide.js`) and nowhere else.
The in-world figure stays soft; no player-facing text changes; every "N years ago" becomes
checkable against a number. It costs one line and makes this audit repeatable mechanically
instead of by hand.

> **SIGN-OFF FLAG SN-1** — a production-practice change, not canon. Recommend approve.

---

# Sign-Off Checklist

| # | Item | Kind | Severity | Scripts on approval |
| --- | --- | --- | --- | --- |
| **H-1** | Commencement clock: reanchor to six weeks | Extension | High | `campaign_v11.js`, `sessions.js`, `session34.js` |
| **H-2** | Aldrec's homecoming vs. Ardven's founding (Opt. 1 rec.) | Extension / **Structural** | High | `campaign_v11.js`, `playerguide.js` |
| **H-3** | Vell's "twelve years" → nine | Extension | High | `session34.js`, `s56.js` |
| **M-1** | Pre-Nyreeza dynasty: three incompatible claims | **New invention** under (b)/(c) | Medium | `campaign_v11.js`, `refguide.js`, `playerguide.js` |
| **M-2** | Olvesa's fifteen penitent years | **New invention** | Medium | `campaign_v11.js`, `refguide.js`, `playerguide.js` |
| **M-3** | Aldrec's age at the Weeping Strait | Biography | Medium | `campaign_v11.js`, `playerguide.js` |
| **M-4** | Vell is a hill dwarf, not a half-elf | Extension | Medium | `sessions.js` |
| **L-1** | Vaelindra's age vs. "I built some of its methods" | NPC age or line | Low | `campaign_v11.js` or `s56.js` |
| **L-2** | Norr's two decades in the Player Guide | Extension | Low | `playerguide.js` |
| **L-3** | The three walls run backward in time | Extension | Low | `campaign_v11.js` |
| **L-4** | Dregan's decade at a four-year academy | Extension | Low | `campaign_v11.js` |
| **L-5** | Dane's recovery: two timeline entries | Extension | Low | `campaign_v11.js`, `refguide.js`, `playerguide.js` |
| **L-6** | Vasq's widowing: anchor the date | Biography | Low | `campaign_v11.js`, `playerguide.js` |
| **O-1** | The Harvestide double anniversary | Texture into run modules | — | `sessions.js` |
| **O-2** | Pin both clocks to Solacre | Extension | — | `campaign_v11.js`, `refguide.js` |
| **O-3** | Vessarkath's release inside the acceleration | **Shadow mechanics — explicit approval** | — | `campaign_v11.js` |
| **SN-1** | Adopt a DM-only anchor year | Production practice | — | `refguide.js` (timeline header) |

---

# Propagation Plan

On approval, this executes as **one consolidated pass, one commit** — the batch discipline
the project runs on. Because canon is the scripts, the whole pass is script edits followed
by a single `tools/build.sh`, which regenerates `corpus/` and `documents/` together so they
cannot drift.

1. **`scripts/campaign_v11.js` first** — the sourcebook is the anchor document. Apply H-1's
   six weeks to the timeline entry, H-2/M-3/L-6 (Aldrec, Vasq), M-1/M-2 as approved,
   L-3 (the walls), L-4 (Dregan's clause), L-5's two entries, O-2's Solacre pinning, O-3's
   dating, and L-1 if the age route is chosen.
2. **The session scripts** — `sessions.js` (M-4, H-1's instructor line, O-1's texture),
   `session34.js` (H-1's "four weeks early," H-3's nine years), `s56.js` (H-3's nine years,
   L-1 if the line route is chosen).
3. **`refguide.js`** — mirror every timeline change (its Timeline at a Glance tracks the
   sourcebook line for line), add L-5's entries, and add SN-1's anchor year to the header.
4. **`playerguide.js` last, authored not copied** — L-2 (Norr), M-3 (Aldrec), H-2, L-6, and
   the timeline entries from L-5/O-2. Per the authoring rules, O-3's dating is **DM-only and
   does not appear** — the Player Guide gets Dane's recovery as a dated triumph and nothing
   about why a dragon let it go.
5. **`tools/build.sh`**, then verify: the build fails on escape leaks or font substitution
   and confirms the PDFs are reproducible. Scan the regenerated `QS_Player_Guide.md` for
   DM-only leakage before finishing.

Estimated scope: five scripts, one build, one commit. No finding requires structural change
to a generator — every fix is a figure, a clause, or a table row.

---

*Nothing in this draft has been applied. Awaiting review.*
