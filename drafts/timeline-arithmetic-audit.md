# Design Draft — Timeline Arithmetic Audit

*The Qilvayas Symphony — full-corpus consistency pass, dates and elapsed years*

**Status: draft for review. No canon file has been modified.** Every item below is a
finding awaiting Josh's approve / redline / veto. Nothing folds into canon until signed off.

**Scope:** all 34 Markdown documents — `setting/` (24), `sessions/` (6), `reference/` (3),
`README.md`. Checked: absolute and relative dates, elapsed-year arithmetic, stated ages,
the "three years ago" cluster around Empress Nyreeza, and the session-level clocks.

**Method:** the corpus has no anchor year — the calendar deliberately leaves the Years of
the Reckoning figure soft (`setting/18:20`) — so every date in the corpus is relative to
"present day," defined as the party's final field exercise (`setting/19:3`). I rebuilt the
chronology from that anchor and tested every stated interval against it.

**Headline:** the spine holds. The three-year Nyreeza marker is correct in all nine places
it appears, the fifty-year Vaelindra marker in all six, and the disappearance → six-month
search → coronation chain closes exactly. The failures are at the edges, where two
separately-written figures were never multiplied against each other. Three are worth
fixing before the next expansion; the rest are cheap.

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

Three documents state the same countdown and none of them agree.

- `setting/19:3` — present day is "the party's final field exercise, **five weeks before
  commencement**." That is the corpus's anchor.
- `sessions/02:21` — "The journey to the capital takes **four days** by the imperial road."
- `sessions/02:59` — on arrival, the supervising instructor "reminds them **commencement is
  in five weeks**." It is four and a half. The instructor is repeating the anchor figure
  from four days and one province ago.
- `sessions/03-04:131` — after the Proving, "The Proven cohort graduates in a small,
  strangely moving ceremony within the week — **five weeks early**, by the Chancellor's
  privilege."

That last one is the real break. Sessions Three and Four run *after* the party has already
reached the capital, so by the ceremony there are at most four weeks left on the clock —
you cannot graduate five weeks early into a four-week window. As written, the Proven cohort
graduates before it sits the Proving.

This is the only finding a player can catch with a calendar and no cross-referencing, and
it is spoken aloud by an NPC.

**Recommendation.** Pick one figure and let the others move. Cleanest: make the anchor
**six weeks**, let the instructor say "five weeks" correctly on arrival, and let the
ceremony run "**four weeks early**." One number changes in the sourcebook, one in Session
Two, one in Sessions Three–Four.

> **SIGN-OFF FLAG H-1** — natural extension of approved canon; arithmetic only, no fiction
> changes. Three-file propagation.

## H-2. Aldrec came home to a kingdom that did not exist yet

`setting/15:47` (and verbatim in `reference/player-guide.md:211`):

> "at the Weeping Strait, **twenty years ago** … Aldrec survived, was denied the coastal
> command he had been promised, and **went home to find Ardven's expansion swallowing the
> fjords**."

But Ardven is five years younger than that homecoming:

- `setting/19:19` — "**~15 years ago:** Karvel begins the consolidation of the northern
  crowns into Ardven; the ship-clans lose their fjords over the following years and turn south."
- `setting/15:83` — Karvel's realm is "**fifteen years** of war, marriage, and administration."
- `reference/dm-reference-guide.md:20` — "Twelve crowns unified in 15 yrs."

At the Weeping Strait, Karvel had not started. There was no Ardven to find. The causal
chain that makes Aldrec the campaign's great persuadable — *the empire spent his people,
then let his home be taken* — currently runs backwards.

**Recommendation, in preference order:**

1. **Decouple the two events.** Aldrec comes home to fjords already under pressure from the
   northern crowns *as they then were*, and Karvel's consolidation, five years later,
   finishes what those crowns started. This costs one clause, keeps every date, and is
   arguably better fiction: Aldrec watched the wound open slowly instead of arriving to a
   fait accompli.
2. Move the Weeping Strait to ~15 years ago. Cheap on paper, but see M-3 — it makes
   Aldrec's age worse, not better.
3. Move Karvel's consolidation to ~20 years ago. Rejected: it breaks the "fifteen years"
   figure in three documents and makes Karvel implausibly young at the start.

> **SIGN-OFF FLAG H-2** — Option 1 is a natural extension; Options 2–3 are structural
> changes to a Power's history and need explicit approval. Three-file propagation
> (sourcebook, Player Guide, and the timeline entry if the dates move).

## H-3. Vell archived three years of correspondence that had not been written

Stated twice, in two different sessions, both times as an emotional beat:

- `sessions/03-04:135` — "I archived **twelve years** of her academy correspondence."
- `sessions/06:21` — "he archived **twelve years** of this hand."

The arithmetic: Nyreeza "begins the academy revival" ~12 years ago (`setting/19:21`,
`reference/dm-reference-guide.md:196`, `reference/player-guide.md:402`), and
`setting/11:7` makes that revival the start of her academy involvement. She vanished 3
years ago. The correspondence therefore runs **nine years**, not twelve.

This one matters because it is load-bearing: Vell's authority to identify her hand on sight
rests on the volume, and the line is delivered twice at the two moments the Nyreeza trail
turns.

**Recommendation.** Change "twelve" to "**nine**" in both session lines — the smaller
number is, if anything, more affecting, because it is exactly the span of her reform and
her disappearance ends it. Alternative: move the revival to ~15 years ago, but that ripples
into three documents and buys nothing.

> **SIGN-OFF FLAG H-3** — natural extension; arithmetic only. Two-file propagation.

---

# MEDIUM

## M-1. The pre-Nyreeza dynasty is described three incompatible ways, and appears on no timeline

Three passages make claims about who ruled before Nyreeza. No two are compatible, and the
timeline is silent between "~200 years ago: the fracture begins" and "~60 years ago: the
Silvasse Disaster."

| Source | Claim |
| --- | --- |
| `setting/15:9` | Vaelindra "has lived in the capital long enough to have watched **three rulers come and go**, including Empress Nyreeza." |
| `setting/16:21`, `reference/player-guide.md:195` | Kessin is "a career bureaucrat who has **outlasted two regents**." |
| `setting/07:33` | "Empress Nyreeza ruled **in her own right, not as regent**." |
| `setting/10:5` | Qilvayas is "old enough to rule **without a regent**." |

Two problems compound. First, *regents* imply minority reigns — two of them, recent enough
for one bureaucrat to have outlasted both — which is a substantial piece of dynastic
history that exists nowhere else and sits oddly beside the Packlaw passage insisting the
dynasty's women ruled in their own right.

Second, the arithmetic. Vaelindra has been in the capital roughly fifty to fifty-five years
(H-8 below). Three *completed* reigns in that span, plus Qilvayas's current one, means Drow
monarchs of a race that lives some seven hundred and fifty years are averaging under twenty
years on the throne. That is a fact about the dynasty — either it is violent, or it is
sickly, or something else is eating it — and it is currently an accident of phrasing rather
than a decision.

It also bears directly on a deliberately-open thread: *whether Qilvayas ever names an heir*
reads very differently against a dynasty that has been burning through rulers.

**Recommendation.** This is the one finding that wants a decision rather than a correction.
Options:

- **(a) Soften both.** Vaelindra has watched "two rulers come and go"; Kessin has outlasted
  "two chamberlains and one attempted reform of his own office." Nothing is asserted, the
  gap stays clean, and the dynasty's recent history remains available.
- **(b) Keep the turnover and make it mean something.** Short imperial reigns become canon,
  the timeline gains one line covering the pre-Nyreeza century, and the dynasty's fragility
  becomes a live political fact the court does not discuss — which pairs well with Qilvayas
  having named no heir.
- **(c) Keep the regents and drop the contradiction.** The regencies were for *Nyreeza's*
  predecessors, not for her or her son; `setting/07:33`'s line stands unchanged because it
  is about Nyreeza specifically.

I'd take (a) unless Josh wants the dynasty's instability on the board, in which case (b) is
the more interesting campaign.

> **SIGN-OFF FLAG M-1** — **genuine new invention** under any option but (a). Structural
> worldbuilding touching the dynasty; requires explicit approval. Propagation: sourcebook
> (`07`, `10`, `15`, `16`, `19`), DM Reference Guide, Player Guide.

## M-2. Olvesa: fifteen undocumented years between the shrine and the See

The prose reads as one continuous movement:

> "with her vengeance complete … she walked into a mountain shrine of the Matron and did
> not come out for a year. **What came out was** the woman the north now calls the
> Reconciled: **founder of the See of Orlath**…" (`setting/15:77`)

The dates do not:

- Vengeance: **~60 years ago** (`setting/15:77`, `reference/player-guide.md:227`).
- Plus one year in the shrine → she emerges ~59 years ago.
- See of Orlath founded: **~45 years ago** (`setting/19:11`, `setting/03:35`,
  `reference/dm-reference-guide.md:19`, `reference/player-guide.md:65`).

Fourteen years unaccounted for, in the life of the character whose road from atrocity to
sanctity is the campaign's test of whether redemption is real.

Her stat block quietly takes the *later* anchor, which makes the gap worse:

- `setting/21:291` — Drevic "she has not spoken aloud in **sixty years**" (anchored to the vengeance).
- `setting/21:275` — "she has not worn armor in **forty-five years**" (anchored to the founding).
- `setting/21:295` — "She has been struck four times in **forty-five years**."

Read together, Olvesa stopped speaking her enemies' language the year she destroyed them,
but kept her armour on for another fifteen years after her conversion.

**Recommendation.** Fill the gap rather than close it — it is free characterization. A line
in the timeline entry: she came out of the shrine and spent those years as a penitent
without a church, walking the north, before the See was founded around her rather than by
her. That reconciles the armour (she was travelling rough country), deepens the sainthood
she accepts with visible distaste, and explains why the See's rite is "plain and rigorous."
Alternatively, move the founding to ~58 years ago and let the whole arc be one movement —
but that costs four documents and loses the better story.

> **SIGN-OFF FLAG M-2** — the fifteen penitent years are **new invention** about a Power's
> biography. Requires approval. Propagation: `setting/15`, `setting/19`, DM Reference Guide
> timeline, Player Guide timeline (if the founding date moves, also `setting/03` and
> `setting/21`).

## M-3. Aldrec was thirty-five in his "youth"

`setting/15:47` — "Aldrec, **in his fifties now**, served the empire **in his youth** … at
the Weeping Strait, **twenty years ago**."

Fifty-something minus twenty is thirty-something. A man in his mid-thirties, already a
veteran of the oar-benches, is not serving in his youth; he is mid-career, which is a
different and less pitiable story than the one the profile is telling. The DM note that he
is "dying slowly of an old wound gone bad" and that "the window closes with him" also wants
an older man than fifty-five.

This interacts with **H-2**: any fix that moves the Weeping Strait *later* makes his age
worse, and any fix that ages him up makes the "young oarsman spent as a distraction" image
work again.

**Recommendation.** Age him to "**in his sixties now**" — he was in his early forties at
the Strait's aftermath, which still works if the Strait ended a service that began in his
youth; or, better, keep him in his fifties and change "in his youth" to "**as a young
man**, and for twenty years after" so the service is a career the empire ended rather than
a single betrayal. The second option costs one clause and fixes the sentence in place.

> **SIGN-OFF FLAG M-3** — a Power's stated age. Requires approval. Two-file propagation
> (`setting/15`, Player Guide `211`).

## M-4. Archivist Vell is a dwarf everywhere except Session Two

Not strictly a date, but it surfaced from the age arithmetic and it fails the same way.

- `setting/20` (Roster) — "Archivist Dathenor Vell | **Hill dwarf** | Sage (archivist)."
- `setting/08:9` — "Archivist Vell is a **hill dwarf** (which quietly explains a career
  that has outlasted four chancellors)."
- `reference/dm-reference-guide.md:136` — "Vell **hill dwarf**."
- `sessions/02:61` — "Archivist Dathenor Vell — **half-elf**, ancient by human reckoning …
  who has outlasted four chancellors."

Session Two contradicts the roster, and the age claims are what make it a timeline problem
rather than a typo. Vell's career has to reach back at least fifty-five years — he knew
Vaelindra "when both were young functionaries" (`sessions/02:65`), and her career ended
fifty years ago — while also outlasting four chancellors, in an institution where the
*current* chancellor's tenure alone has run twelve Provings (`sessions/03-04:117`). That is
a career north of a century. A hill dwarf carries it comfortably. A half-elf at eighty is
barely middle-aged and is not "ancient by human reckoning" in any sense that flatters him.

**Recommendation.** Session Two is the outlier; correct it to hill dwarf. (Chancellor
Sorral is the canon half-elf — `sessions/03-04:351` — which is the likely source of the slip.)

> **SIGN-OFF FLAG M-4** — natural extension; the roster is canon and Session Two departs
> from it. One-file propagation.

---

# LOW

## L-1. Vaelindra was twenty-eight when she "built some of" the Office of Omens' methods

The fifty-year marker is admirably consistent — `setting/19:13`, `sessions/02:75`
(twice), `sessions/03-04:31`, `sessions/06:9`, `06:41`, `06:49`, `06:51`,
`reference/dm-reference-guide.md:192`. It is her stated age that strains against it.

She is "**late seventies, perhaps older**" (`setting/15:9`), which puts her at roughly
twenty-eight at the career-ending vision. Fine for a "minor functionary, bright and
ambitious." Less fine for the line she delivers in Session Six:

> "That is how I know your Prelate's office is very good at its work: **I built some of its
> methods.**" (`sessions/06:49`)

A twenty-eight-year-old junior functionary did not build the Office's methods.

**Recommendation.** Either push her age to "**past eighty, and vague about it**" — which
buys five to ten years and suits a woman "difficult to tell" — or soften the line to "I
was trained in its methods, and I trained others." The second is cheaper and arguably
sharper: she is a product of the machine, not its author.

> **SIGN-OFF FLAG L-1** — a major NPC's stated age or a spoken line. Requires approval.

## L-2. Norr loses four years in the Player Guide

- Sourcebook (`setting/15:89`): assassination attempts "before the age of twenty," killed
  his last trueborn rival "at twenty-four," "and has spent **the two decades since**
  building…" → he is about forty-four.
- Player Guide (`reference/player-guide.md:235`): "survived three assassination attempts
  before the age of twenty **and has spent two decades since** building…" → the
  rival-killing clause is gone, so "two decades since" now attaches to *before the age of
  twenty*. He reads as forty, and as having built his administrative state while still
  fighting for the duchy.

**Recommendation.** Restore the clause in the Player Guide, or re-anchor: "took Normere in
fact twenty years ago and has spent the two decades since…" Nothing spoiler-bearing in
either.

> **SIGN-OFF FLAG L-2** — natural extension. One-file propagation.

## L-3. Aenodira's three walls run the wrong way in time

`setting/16:5`. The rings are stated correctly: Founder's Wall innermost and oldest, High
Wall raised "at the height of imperial wealth," Long Wall outermost, "thrown up fast during
the empire's last great expansion — the one that came right before the fracture began." Then:

> "**Walking outward** from the palace is walking **backward** through **two hundred years**
> of the empire's confidence, ring by ring, **until the confidence runs out**."

Three things are inverted. Walking outward goes oldest → newest, which is *forward* in
time. The span from Founder's Wall to Long Wall is roughly two *thousand* years, not two
hundred. And the outer wall is the empire's confidence at its *peak* — the wall built for a
city that never grew to fill it — so confidence does not run out at the edge; it runs out
in the empty half-built districts *behind* it (which the very next paragraph, `16:9`, says
beautifully).

**Recommendation.** "Walking outward from the palace is walking **forward** through two
thousand years of the empire's confidence, ring by ring, **until you reach the wall it
built for a city that never came**." Same cadence, correct arrow, and it hands off cleanly
to the paragraph that follows.

> **SIGN-OFF FLAG L-3** — natural extension; prose fix. One-file propagation.

## L-4. Dregan's decade at a four-year academy

`setting/19:15` — "A young Dregan Morn arrives at the capital academy as a hostage-student
of Tarnovar; he **returns home a decade later**." `setting/11:97` — "The standard academy
program lasts **four years**."

Defensible: a hostage is a diplomatic guarantee, not a matriculation, and
`setting/10:47` explicitly frames hostage-diplomacy as an open-ended standing rather than a
course of study. But it is never said, and the six unexplained years are exactly where
"something broken behind the eyes" happened. Note also that the arithmetic is otherwise
*exact* — arrives 40 years ago, home 30 years ago, "for thirty years he has held the
Eastmarch" (`setting/15:59`) — which leaves him taking the frontier the year he got back,
at about twenty-eight.

**Recommendation.** One clause in the timeline entry: he remained past his studies, as
hostages do, at the throne's convenience. Free, and it sharpens the grievance.

> **SIGN-OFF FLAG L-4** — natural extension. One-file propagation.

## L-5. Dane's recovery of the Ninth's standard has a zero-width window, and no timeline entry

- Silvasse Disaster: ~60 years ago (`setting/19:9`).
- Vessarkath "let one standard leave her hoard, through channels, **sixty years after
  taking it**" (`setting/04:5`).
- Dane "recovered the wolf-standard of the Ninth from the Brekelands, **sixty years after**
  the Silvasse Disaster" (`setting/15:53`, `reference/player-guide.md:215`).

The dragon releases it and Dane recovers it in the same year, leaving no time for the
standard to travel through channels, reach the Brekelands warlords, be *known* to be there,
and be campaigned for by an expedition. Dane is also "not yet thirty-five," so the campaign
has to fit inside a short career.

Separately: the single most celebrated recent event in the empire — the one that made the
Young Wolf and gave the court its succession anxiety — appears on **neither** the sourcebook
timeline nor the DM Reference Guide's Timeline at a Glance.

**Recommendation.** Add two entries and open the window:

- **~3 years ago:** Vessarkath permits one eagle to leave her hoard; it surfaces among the
  Brekelands warlords. (Why is DM-only and open — see O-3.)
- **~1 year ago:** Marshal Dane recovers the Ninth's standard. The Ostmark's wound begins,
  sixty years on, to close.

> **SIGN-OFF FLAG L-5** — natural extension for the timeline entries themselves;
> **see O-3** for the dating choice, which is not. Propagation: `setting/19`, DM Reference
> Guide timeline, Player Guide timeline.

## L-6. Duchess Vasq's clock has no anchor

`setting/15:65` and `reference/player-guide.md:223` — "married young … **widowed at forty**,
and ruler in all but name **ever since** through her sons." Her current age is never given,
and the widowing is never dated. "Ever since" is therefore unmeasurable, and the Vintage
Night (6 years ago) cannot be placed against it.

That matters. A ruler of two years who loses control of an arrest order is a different woman
from a ruler of twenty who does — and the whole reading of "she chose to own it rather than
be seen to have lost control" turns on which.

**Recommendation.** One figure, anywhere: widowed roughly fifteen years ago, which makes her
mid-fifties now, gives Aldous time to grow into a "young Duke," and puts the Vintage Night
nine years into a rule she had every reason to believe was secure. Nothing else changes.

> **SIGN-OFF FLAG L-6** — a Power's biography. Requires approval. Two-file propagation.

---

# Verified Clean

Recorded so the next audit does not re-derive them.

| Check | Result |
| --- | --- |
| Nyreeza: disappearance (3 yrs) → six-month search → coronation (~2.5 yrs) | **Closes exactly.** |
| The "three years" cluster — wolves leaving the Old Forum (`08:23`, `03:49`, DM guide `128`), cipher marks (`16:39`, `03-04:19`), the sealed study (`10:11`, DM guide `45`), Olvesa's darkening (`15:79`, `17:25`, DM guide `92`), Vaelindra's ledger (`03-04:31`), Shen's three years of wondering (`05:63`), the survey chalk (`06:227`), the First Seal breach (`06:15`, `06:63`), the oiled hinges (`06:57`) | **Nine documents, no drift.** Exemplary propagation. |
| Vaelindra's fifty years — six passages across three documents | **Consistent** (but see L-1 on her age). |
| Dregan: arrives 40 yrs ago → home a decade later → "thirty years" on the Eastmarch | **Closes exactly** (but see L-4). |
| Vell's last referral: 11 years ago (`19:23`) vs. "Eleven years ago" (`02:65`) | **Match.** |
| Vintage Night (6 yrs) and Harrowing of the Weld (4 yrs) across sourcebook, sessions, DM guide, Player Guide | **Match in all four.** |
| Sorral: "run it eleven times in the current chancellor's tenure" (`03-04:19`) vs. "the twelfth cohort in my tenure" (`03-04:117`) | **Correct.** Eleven prior plus this one. |
| Norr, within the sourcebook: attempts before 20 → rivals dead at 24 → two decades → ~44 now, against "~20 years ago … takes Normere in fact" (`19:17`) | **Closes** (Player Guide drifts — L-2). |
| Silvasse Disaster (~60 yrs) against "sixty years on" and Vessarkath's "eight centuries" of tenure in the wood | **Internally consistent** (but see L-5 on the window). |
| Fracture at ~200 years against "two centuries of decline," Tarnovar "independent for a century," and "law has not reached everywhere in two hundred years" | **Consistent throughout.** |
| Founding at ~2,000 years against "twenty centuries of oral drift" (`03:29`), "two thousand years of hands" (`16:31`, `06:57`), "two thousand years of attention" (`15:85`), "listening for two thousand years" (`01:17`) | **Consistent throughout.** |
| Countess Ory: church records at seventy, seen as forty, "40+ girls across two decades" | **Internally consistent** — and see O-4. |
| Calendar against Session One's season: field exercises "traditionally run Hay–Harvestide" (`18:12`), Session One is Harvestide (`01:9`) | **Correct.** |

---

# Opportunities the Arithmetic Opens

Per the consistency-audit brief: what the dates make *available*, not only what they break.
These are additive and cost nothing but ink.

## O-1. Session One opens on a double anniversary, and nothing says so

Three separate facts, none of them written down together:

- Session One's season is **Harvestide** (`sessions/01:9`).
- The Vintage Night "fell in **Harvestide**" (`setting/18:13`), **six years ago**.
- Vaelindra dates the quickening to "**three years ago, almost to the season**"
  (`sessions/03-04:31`) — so the Empress vanished in Harvestide too.

The campaign therefore opens on the sixth anniversary of the massacre and the third of the
disappearance, in the same week. That is free, and it is thematically exact for a campaign
about the weight of things sworn and broken.

What it makes available at no structural cost: mourning bells in the Ostmark towns of
Session One; Orlathine kin among Semya's refugees keeping a roadside Vigil on the road home
in Session Two; and — the quiet one — the capital's flat official silence about the
Empress's anniversary while an Emperor who has not entered a room in three years walks the
Long Course alone at dawn. The party does not need to understand any of it in Session Two.
It should simply be there, so that when Vaelindra says "almost to the season" in Session
Three, a player who was paying attention gets to go cold.

> **SIGN-OFF FLAG O-1** — texture only, no new canon; but it writes into two already-run
> modules, so it needs approval rather than free-latitude invention.

## O-2. Solacre already pins both clocks

`setting/18:11` — "the Zhuvedian Laws are **slated for a Solacre reading**." Solacre is
early summer, month five. From a Harvestide start, that is **nine to ten months out** — and
Karvel's coronation is "the same season" (`setting/19:33`, `setting/15:85`).

The timeline currently says only "within the coming year," which is vague in a campaign
whose first structural clock is supposed to create pressure. The calendar already made the
decision; the timeline just hasn't picked it up.

**Recommendation.** Restate the entry as "**Solacre, nine months out**" in the sourcebook
timeline and the DM Reference Guide. Nothing is invented — it is already canon in two
places that have not been multiplied together.

> **SIGN-OFF FLAG O-2** — natural extension of approved canon; recommend approve.

## O-3. Date Vessarkath's release into the acceleration window

Why an ancient green who has slept on three legions' eagles for sixty years let one leave
is "DM-only and deliberately open" (`setting/04:5`). The open question and the zero-width
window in **L-5** solve each other.

If the release is dated to roughly three years ago rather than "sixty years after taking
it," it lands inside the post-Nyreeza acceleration — alongside the wolves leaving the Old
Forum, Vaelindra's quickening ledger, Olvesa's darkening, and Dregan's worsening border
dreams. A creature that has been patient for eight centuries in that wood chose *that*
season to move. She felt the same thing every other true-seeing thing on the continent felt,
and she did something about it, and the only creature in the world who could tell Marshal
Dane why his legend exists is the one that gave it to him.

This costs nothing, closes L-5's window, and hands a deliberately-open question an answer
that is available without being forced.

> **SIGN-OFF FLAG O-3** — **touches the shadow's mechanics and a deliberately-open
> question.** Explicit sign-off required. Veto-safe: L-5's timeline entries work with any
> date; only the *meaning* of the date needs approval.

## O-4. Countess Ory's rite already has a start date

"The count of the missing runs past **forty girls across two decades**" (`setting/15:73`),
church records make her **seventy**, and travelers describe **forty** (`setting/15:71`). The
arithmetic puts the rite's beginning about **twenty years ago, at roughly age fifty** —
which is exactly when a famously beautiful woman would first have had reason to look for
one.

Recorded here as a fixed point available free when the Greywell mechanism is chosen
(hag-bargain, fiendish compact, or inherited rite — still open by design).

> **No sign-off required** — observation only, nothing proposed.

---

# Structural Note: The Missing Anchor

Every finding above except M-4 and L-3 has the same root cause. The corpus has no anchor
year — `setting/18:20` leaves the Years of the Reckoning figure "deliberately soft," and
`setting/19:3` states outright that dates are framed as "years ago" to stay portable.

That was the right call for the fiction. In-world, an empire that has lost count of its own
age is better than one with a tidy calendar, and the softness is doing real work.

But it means no document can check itself. "Twelve years of correspondence" and "the revival
began twelve years ago" are both individually correct and jointly wrong, and nothing in the
production pipeline can catch it, because there is no year to subtract from.

**Recommendation.** Adopt a DM-only anchor — a single internal year for the campaign's
present, recorded once in the DM Reference Guide's timeline header and nowhere else. The
in-world figure stays soft; no player-facing text changes; every "N years ago" in the corpus
becomes checkable against a number. It costs one line and makes this audit repeatable
mechanically instead of by hand.

> **SIGN-OFF FLAG SN-1** — a production-practice change, not canon. Recommend approve.

---

# Sign-Off Checklist

| # | Item | Kind | Severity | Files on approval |
| --- | --- | --- | --- | --- |
| **H-1** | Commencement clock: reanchor to six weeks | Extension | High | `setting/19`, `sessions/02`, `sessions/03-04` |
| **H-2** | Aldrec's homecoming vs. Ardven's founding (Option 1 recommended) | Extension (Opt. 1) / **Structural** (Opts. 2–3) | High | `setting/15`, Player Guide; `setting/19` if dates move |
| **H-3** | Vell's "twelve years" → nine | Extension | High | `sessions/03-04`, `sessions/06` |
| **M-1** | Pre-Nyreeza dynasty: three incompatible claims | **New invention** under (b)/(c) | Medium | `setting/07`, `10`, `15`, `16`, `19`, DM Guide, Player Guide |
| **M-2** | Olvesa's fifteen penitent years | **New invention** | Medium | `setting/15`, `19`, DM Guide, Player Guide (+ `03`, `21` if founding moves) |
| **M-3** | Aldrec's age at the Weeping Strait | Biography change | Medium | `setting/15`, Player Guide |
| **M-4** | Vell is a hill dwarf, not a half-elf | Extension | Medium | `sessions/02` |
| **L-1** | Vaelindra's age vs. "I built some of its methods" | NPC age or line | Low | `setting/15` or `sessions/06` |
| **L-2** | Norr's two decades in the Player Guide | Extension | Low | Player Guide |
| **L-3** | The three walls run backward in time | Extension | Low | `setting/16` |
| **L-4** | Dregan's decade at a four-year academy | Extension | Low | `setting/19` |
| **L-5** | Dane's recovery: two timeline entries | Extension | Low | `setting/19`, DM Guide, Player Guide |
| **L-6** | Vasq's widowing: anchor the date | Biography change | Low | `setting/15`, Player Guide |
| **O-1** | The Harvestide double anniversary | Texture into run modules | — | `sessions/01`, `sessions/02` |
| **O-2** | Pin both clocks to Solacre | Extension | — | `setting/19`, DM Guide |
| **O-3** | Vessarkath's release inside the acceleration | **Shadow mechanics — explicit approval** | — | `setting/04`, `setting/19`, DM Guide |
| **SN-1** | Adopt a DM-only anchor year | Production practice | — | DM Guide (header only) |

---

# Propagation Plan

On approval, this executes as **one consolidated pass, one commit** — not item by item.

1. **Sourcebook first.** `setting/19` (the timeline) is the anchor document and changes
   before anything else: H-1's six weeks, L-4's clause, L-5's two new entries, O-2's Solacre
   pinning, and whichever of M-1/M-2 survive review. Then the dependent sections —
   `setting/15` (Aldrec, Olvesa, Vasq), `setting/16` (the walls, Kessin), `setting/04`
   (Vessarkath), `setting/07` and `10` (regency language), `setting/21` (Olvesa's stat-block
   durations, only if M-2 moves the founding).
2. **DM Reference Guide in the same pass.** Its Timeline at a Glance mirrors `setting/19`
   line for line and must not lag. Add SN-1's anchor year to the timeline header. Update the
   Atlas rows for Orlath and Normere if their dates move.
3. **Session modules.** `sessions/02` (M-4, H-1's instructor line, O-1's Vigil texture),
   `sessions/03-04` (H-1's "four weeks early," H-3's nine years), `sessions/06` (H-3's nine
   years, L-1's line if that option is taken), `sessions/01` (O-1's mourning bells).
4. **Player Guide last, authored not copied.** L-2's Norr clause, M-3's Aldrec, the timeline
   entries from L-5 and O-2, and the regency language from M-1. Per the authoring rules, the
   O-3 dating is **DM-only and does not appear** — the Player Guide gets Dane's recovery as
   a dated triumph and nothing about why a dragon let it go. Re-run the DM-string scan before
   publishing.
5. **Regenerate and verify.** Both documents through the template pipeline, converted to PDF
   and inspected for escape-sequence artifacts and broken tables before publication.

Estimated scope of the full pass: eleven files, one commit. Nothing here requires a
regeneration of any module's structure — every fix is a figure, a clause, or a table row.

---

*Nothing in this draft has been applied. Awaiting review.*
