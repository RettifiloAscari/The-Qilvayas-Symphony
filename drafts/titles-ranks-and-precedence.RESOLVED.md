# RESOLVED — applied to canon

Approved with one redline: sign-off 2 taken as option (b) — the Academy rank renamed
**Magister → Professor** (and *Magister Emeritus* → *Professor Emeritus*). *Preceptor* was
considered and rejected: it collides with **Prelate** worse than Magister collided with
Magistrate.

Two items changed on contact with the scripts, both noted in the delivery:

- **Sign-off 3 was a false positive.** Every Ferrin Odo reference in `scripts/` is already
  `Censor-Captain`; the bare "Captain Ferrin Odo" in the audit was the tail of the
  compound matching my own regex. No change was needed or made.
- **The player guide withholding on item 7** was applied as approved, but the stated
  rationale does not hold: the player guide already dates Karvel's coronation to this
  Solacre, so "the regency ends at the coronation" is a public inference, not a
  telegraph. Left withheld per sign-off; raised for a future call.

Applied to `campaign.js`, `refguide.js`, `playerguide.js`, `sessions.js`, `session34.js`,
`s56.js`, `CLAUDE.md`, and `reference/project-instructions.md`. Kept for the record; no
longer pending.

---

# Design Draft — Titles, Ranks, and Precedence

*The Qilvayas Symphony — a common vocabulary for who outranks whom*

**Status: draft for review. No canon has been modified.**

---

## The problem, stated plainly

The corpus currently assigns **27 distinct titles** across the sourcebook, the reference
guide, the player guide, and nine session modules. Exactly one of those ladders is
written down: the legions' rank table in Book Six — Of the March, added this year, which
also resolves the Marshal/Legate question and the "Captain" courtesy title.

Everything else a player meets at the table is unexplained. Nothing in the corpus says
whether a Voivode outranks a Duke, whether a Prelate answers to a Matriarch, what a Ban
is, or what any of them are to the Emperor. The information is *derivable* — most of it
is sitting in the Atlas and the Court section — but no player is going to derive it
mid-scene, and the DM currently has to rule on it live and stay consistent for four
sessions.

## What I am NOT proposing

I am not proposing a single numbered order of precedence with the Emperor at #1 and
everyone else beneath him. That would be wrong for this setting and it would flatten the
best thing about it.

The empire is *fractured*. Its central political fact is that several of these titles are
not rungs on the Lupine Throne's ladder at all — they are the styles of **rival
sovereignties** that the Throne's ladder does not reach. A Voivode does not outrank a
Duke or fall short of one; a Voivode holds a crown Aenodira has no writ over. Forcing
Ysavet Morn and Emerenn Vasq onto one scale would quietly assert the very imperial
supremacy the campaign is about the *loss* of.

So the proposal is **five parallel ladders plus a rule for how they cross**, which is
both truer to the fiction and more useful at the table.

---

## The Five Ladders

### 1. The Throne and the Court

Precedence here is **by access, not by rank** — which is already canon by implication and
is the single most useful thing to tell a player. This is why Lord Chamberlain Kessin,
who commands nothing and owns no land, is one of the most powerful people in Aenodira.

| Style | Office | Held by |
| --- | --- | --- |
| Emperor / Empress | The Lupine Throne | Qilvayas; Nyreeza (missing) |
| Lord Chamberlain | Gatekeeper of access to the Emperor | Vareth Kessin |
| Archjurist | Head of the Law Commission | Senna Vhal |
| Mistress / Master | Style of a non-noble head of a civil bureau | Averil Shen, Keeper of the Bureau of Correspondence |
| Magistrate | Judge and civil administrator in one office (Book Seven) | Cassivar Ondrei, Dravenna |

**SIGN-OFF 1 — the Mistress/Master rule.** Averil Shen is styled *Mistress* and holds the
office of *Keeper*. I propose formalizing that as the general rule: **Master/Mistress is
the style of a commoner who heads an imperial bureau**, distinguishing them from noble
officers of court. Natural extension — it is exactly how the corpus already uses it, just
never stated. Nothing changes about Shen.

**SIGN-OFF 2 — Magister vs. Magistrate.** These are two unrelated offices with nearly
identical names, and the corpus uses both heavily (Magister Dail at the Academy;
Magistrate Ondrei in Dravenna). At the table this *will* be misheard. Options:

- **(a)** Leave both, and add one clarifying line to canon distinguishing them. *(my
  recommendation — the collision is period-plausible, and both words are load-bearing)*
- **(b)** Rename the Academy rank (Preceptor, Doctor, Reader).
- **(c)** Rename the civil office (Justice, Judiciar, Assessor).

### 2. The Legions

**Already canon** (Book Six). No changes proposed. Reproduced here only so the master
reference is complete:

Legionary → Sergeant → Centurion → Colonel → Legate, with *Marshal* as an acclamation
outside the ladder and *Captain* as a courtesy title for irregular commanders.

**SIGN-OFF 3 — Ferrin Odo's style.** He appears as both "Censor-Captain Ferrin Odo" and
bare "Captain Ferrin Odo." Under Book Six those are two different things: Censor-Captain
is a real rank in the Office's military arm, while bare *Captain* is the courtesy title
for someone with no place in the ladder at all. Recommend standardizing on
**Censor-Captain** on first use in any scene, with bare "the Captain" acceptable
thereafter as in-scene shorthand. Housekeeping, not invention.

### 3. The Church of the Lupine Matron

| Style | Authority |
| --- | --- |
| Matriarch | Voice of the Matron in Aenodira; the Church's most senior *public* figure |
| Synod of the Grey | Council of senior clergy; advises and **constrains** the Matriarch |
| Prelate | Head of a Church office of jurisdiction — Sarvin Odell, Office of Omens |
| Hierophant | Head of the Keepers of the Ascent — **the imperial cult, a parallel body, not Church clergy** |

**SIGN-OFF 4 — who is supreme in the Church?** The sourcebook says Corvane is "the
Church's most senior public figure in Aenodira — *not its supreme authority*," and never
says who is. I do not think this is an oversight worth filling with a Pope. I propose
making it explicit and deliberate: **the Matriarchate is collegial — there is no single
supreme authority, and the Synod of the Grey exists precisely so that there is not one.**

This is a genuine invention, but a cheap and useful one: it explains why Odell can run an
aggressive Office of Omens policy the Matriarch has not endorsed and cannot simply
countermand, which the campaign already depends on in Sessions Five and Six.

**SIGN-OFF 5 — Prelate's line of report.** Follows from 4: a Prelate holds his
jurisdiction from the Synod, not from the Matriarch personally. Odell is not Corvane's
subordinate; he is her colleague with his own writ. Again — this is the arrangement the
existing sessions already play as. It just isn't written down.

### 4. The Imperial Academy

| Style | Role |
| --- | --- |
| Chancellor | Head of the Academy — Emeth Sorral |
| Magister | Senior faculty, may hold a named charge — Corvin Dail, Master of Trials |
| Magister Emeritus | Retired faculty, style retained — Pontellus Vorn |
| Instructor | Junior faculty — Liria Fenn, House of the Craft |
| Archivist | Keeper of the restricted stacks — Dathenor Vell |

Entirely derived from existing text. No sign-off needed unless you take option (b) above.

### 5. The Sovereign and Border Styles

These do not rank against each other or against the Throne. Each is the head of state of
whatever the fracture left behind, and the style records **what kind of thing it is**.

| Style | What it actually means | Held by |
| --- | --- | --- |
| King | A crown claiming full sovereignty | Karvel of Ardven |
| Sea-King | A king of a *people*, not a territory — no land, no fixed seat | Aldrec the Landless |
| Voivode | Tarnovar's elected-by-acclamation war-leader-turned-sovereign; absolute within her word | Ysavet Morn |
| Ban | A march-warden holding a frontier for a Voivode, with wide independent latitude | Dregan Morn, the Eastmarch |
| Duke / Duchess | An imperial ducal house — a title the Throne *granted*, whether or not it still obeys | Garvin Norr (Normere); the Suthmark house |
| Count / Countess | A landed noble beneath a ducal house | Velsanna Ory of Greywell |
| Lord | Generic style of any landholder with retainers and no better title | Ostrev |
| Saint-Regent | Unique to Olvesa; see below | Olvesa the Reconciled |
| Harborlord | One of Velmareth's ruling merchant-bankers; the Compact's sovereign class | the Meldane house among them |
| Guildmaster | Head of a chartered trade body | Ptolan Vess, Capital Merchants' Concord |

**The load-bearing point for players:** Duke Norr and Voivode Morn are not peers of
different rank — Norr holds an *imperial* title and is therefore, on paper, the Emperor's
subject conducting his own restoration, while Morn holds a *foreign* one and owes
Aenodira nothing at all. That asymmetry is the whole reason Normere is the more dangerous
of the two.

**SIGN-OFF 6 — the Suthmark's two ducal titles.** Emerenn Vasq is styled *Duchess* and
rules "in all but name," while her son Aldous is the actual reigning Duke. Recommend
stating plainly that **Emerenn is Dowager Duchess and holds no formal authority
whatsoever** — her power is entirely dower-lands, the Garland, and her sons' deference.
This sharpens her rather than diminishing her: everything she does, she does without a
single legal instrument backing it, which is far more interesting than a title.

**SIGN-OFF 7 — what is Olvesa regent OF? (the one real find)** She was widow-regent of a
northern principality sixty years ago. That regency is long over. The corpus never says
what "Saint-Regent" now means, and it currently reads as an honorific with no referent.

Proposal: **the See holds her as regent of the True Rite — placeholder for an Emperor
not yet crowned.** Sixty years of the See declaring the Lupine Throne vacant and
illegitimate, with Olvesa holding the seat in trust.

Which means: **her regency ends at the Solacre coronation.** The moment Karvel is
crowned Emperor of the True Rite, Olvesa's title dissolves — she has been keeping a chair
warm for six decades for the grandson she is about to seat in it. It reframes the
coronation as the completion of her life's work rather than merely her grandson's
ambition, and it gives the Twin Clocks arc a second personal stake at no cost.

This is genuine invention and the only item here I would call structurally significant.
Veto cleanly if you'd rather "Saint-Regent" stay an unexplained honorific.

---

## Cross-ranking: the one rule

When ladders meet — and they meet constantly, since a Prelate, a Legate, and a Duchess
have no common scale — the practical answer the empire actually runs on:

> **Precedence at court is by access. Precedence in the provinces is by force.
> Precedence in a shrine is by rite. Nobody has ever written down what happens when
> those disagree, and the Zhuvedian Laws are conspicuously silent on it.**

That silence is thematically correct — it is exactly the sort of thing a fracturing
empire stops being able to answer — and it hands the DM a legitimate in-world reason to
rule situationally without feeling arbitrary.

**SIGN-OFF 8.** Approve the rule as written, including the deliberate silence.

---

## Forms of Address (player-facing)

The genuinely useful table for the group. All natural extension; no sign-off needed.

| Speaking to | Say |
| --- | --- |
| The Emperor | *Your Radiance* (formal), *Majesty* (court shorthand) |
| A King, Voivode, or Sea-King | *Your Grace* |
| A Duke, Duchess, or Ban | *Your Grace* |
| A Count, Countess, or Lord | *My lord / my lady* |
| The Matriarch | *Your Voice* |
| A Prelate or Hierophant | *Your Reverence* |
| Saint-Regent Olvesa | *Mother* — the See uses no honorific grander, at her insistence |
| A Legate or Marshal | *Legate / Marshal*, plainly; the legions do not embroider |
| A Magistrate | *Your Honor* |
| Academy faculty | *Magister / Instructor*, plainly |

Olvesa's entry does real characterization work in one line, which is why I'd keep it.

---

## Discrepancies found in the audit

Everything the sweep turned up, for the record:

1. **Ferrin Odo styled two ways** — Sign-off 3. Minor.
2. **Two ducal titles in the Suthmark** — Sign-off 6. Never contradictory, just never explained.
3. **Magister / Magistrate collision** — Sign-off 2. Deliberate-looking but unstated.
4. **"Saint-Regent" has no referent** — Sign-off 7. The only real gap.
5. **Church supremacy unstated** — Sign-off 4. Reads as omission; better as design.
6. **"Warden of the Eastmarch"** — Dregan's, and it functions as description rather than
   as a distinct rank from *Ban*. Recommend leaving as is; no canon change.
7. **False positives, excluded:** *Custodian* Ooze (a monster), *Canon* (a homebrew item).

**No contradictions found.** Everything above is under-specification, not error — which
is a good sign for a corpus this size.

---

## Checklist of items needing sign-off

| # | Item | Kind |
| --- | --- | --- |
| 1 | Master/Mistress = style of a non-noble bureau head | Natural extension |
| 2 | Magister vs. Magistrate — pick (a), (b), or (c) | Housekeeping / choice |
| 3 | Standardize Censor-Captain Odo on first use | Housekeeping |
| 4 | The Matriarchate is collegial; no supreme authority | **New invention** |
| 5 | Prelates hold jurisdiction from the Synod, not the Matriarch | Follows from 4 |
| 6 | Emerenn Vasq is Dowager Duchess with no formal authority | Natural extension |
| 7 | Saint-Regent = regent of the True Rite; dissolves at the coronation | **New invention, structural** |
| 8 | The cross-ranking rule, including its deliberate silence | **New invention** |

## Propagation plan on approval

One consolidated pass, all in the same commit:

- **`scripts/campaign.js`** — new H1 **Titles, Ranks, and Precedence**, placed after
  *The Zhuvedian Laws* (it is the natural companion to Book Six's rank table and Book
  Seven's magistrates). Carries the five ladders, the cross-ranking rule, and the
  forms-of-address table. Plus small edits at each affected site: the Court section
  (1), *The Church in Practice* (4, 5), Duchess Vasq's Powers profile (6), and
  Saint-Regent Olvesa's profile and the Atlas's See of Orlath entry (7).
- **`scripts/refguide.js`** — a **Titles at a Glance** single-page table under *Key NPCs
  by Circle*, keyed to the five ladders. Single-column format suits it well.
- **`scripts/playerguide.js`** — the ladders and the forms-of-address table, minus the
  DM-only framing on 7 (players get "Saint-Regent, regent of the True Rite"; they do not
  get the note that her regency dissolves at Solacre, which telegraphs the coronation's
  timing).
- **`CLAUDE.md`** and **`reference/project-instructions.md`** — one line added to the
  established-canon list.

If 7 is vetoed, the sourcebook and player guide edits for it drop out and nothing else
in the pass changes.
