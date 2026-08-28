# RESOLVED — applied to canon

Signed off item by item and applied as a single consolidated pass (see the commit that
closes the pre-launch audit). **Fourteen items decided; twelve applied, two deliberately
not.**

| Item | Decision |
| --- | --- |
| **H-1** Solacre Day | Applied — both timeline rows now read TWO CLOCKS, ONE DAY and carry the full convergence |
| **H-2** Vasq | Applied — law-vs-fact propagated to the Atlas and jurisdiction tables in all three documents; SB profile repaired (duplicate "sickly" cut, the Player Guide's connective carried across) |
| **M-1** Vessarkath | Applied — "sixty years past" |
| **M-2** Aldous / Tavian | Applied — new subsection *The Suthmark's Sons*, two Roster rows, one ref guide row. Absorbs **L-2** |
| **M-3** Currency | Applied — Odric takes the toll in Zhuven; a carter supplies "a wolf, he means a wolf" |
| **M-4 / O-3** Charter | Applied — Concord register entry in Session 3–4 (Optional Content), register receipt on the wall in Session 5 |
| **M-5** Scaling | Applied — per-encounter lines for the Odric bridge and the Halloc dock |
| **L-1** Olvesa's sixty years | **No change** — deliberate rounding, per decision |
| **L-3** Double space | Applied |
| **O-1** Farrowgate's Damp | Applied — S5 client coughs; S6 callback notes it came back |
| **O-2** Odric's writ | Applied — Book Three register challenge added to the anachronism check |
| **O-4** Semya's witnesses | Applied — Book Two framing in the Diverging Paths entry |
| **Part IV** Mechanical validation | **Run.** 32 blocks, zero genuine errors. No script changes arose |
| **S7 / S8 NPC profiles** | Applied — *NPC Notes — What Is Down There* added to both |

## One error found and fixed during the build

The first draft of the Session Seven note claimed a cleric "finds nothing there to turn."
**That was wrong.** The Turned are typed undead, and while they are immune to the
*frightened* condition, Turn Undead does not inflict frightened — RAW it works on them
normally. Caught by visual inspection of the rendered page, before commit. The published
text now says Turn Undead functions exactly as written and accomplishes nothing, which is
both mechanically correct and better fiction: the Church's instrument for the restless dead
does not reach these ones, because they are not restless. They are waiting.

## Still open after this pass

- **No maps or player handouts** exist anywhere in the corpus. Out of scope for these
  generators; a DM running Session One draws Redwatch themselves.
- **The campaign ends at Session Eight** (~40 hours). The Twin Clocks arc is designed and
  now internally consistent, but not built.
- **The sourcebook's own "Closed since" changelog** and the ref guide's header line do not
  yet mention this audit. One line each, unapproved and therefore not written.

---

# Design Draft — Full Pre-Launch Consistency Audit

*The Qilvayas Symphony — every document, cross-referenced, before the campaign runs*

**Status: draft for review. No canon has been modified.** No file in `scripts/` was
edited, `tools/build.sh` was not run, and `corpus/` and `documents/` are untouched. Every
item below is a finding awaiting Josh's approve / redline / veto. Nothing folds into canon
until signed off, and canon means a generator script — see the Propagation Plan.

**Scope.** All eleven documents: the sourcebook, the nine session modules (Sessions 0–2,
3–4 combined, 5–6, 7–8), the DM Reference Guide, and the Player Guide — cross-referenced
against each other and against the seven generator scripts.

**Part IV (Mechanical Validation) has not been run.** Per the brief, it is optional and
needs confirmation before starting. It is stubbed below with what it would cover.

## How to read the citations

Canon lives in the **generator scripts**; the readable corpus is generated from them. So
every finding gives two things: where to **read** it (a `corpus/` file and line) and where
to **fix** it (the script that produces that file). The mapping is fixed:

| Read it in `corpus/` | Fix it in `scripts/` |
| --- | --- |
| `The_Qilvayas_Symphony_Campaign_Setting.md` (cited below as **SB**) | `campaign.js` |
| `QS_Session_0_Primer.md`, `_1_`, `_2_` | `sessions.js` |
| `QS_Sessions_3-4_The_Proving_Below.md` | `session34.js` |
| `QS_Session_5_Dead_Letters.md`, `QS_Session_6_The_Second_Seal.md` | `s56.js` |
| `QS_Session_7_The_Turning_Away.md`, `QS_Session_8_The_Unkept_Vigil.md` | `s78.js` |
| `QS_DM_Reference_Guide.md` (cited as **RG**) | `refguide.js` |
| `QS_Player_Guide.md` (cited as **PG**) | `playerguide.js` |

Line numbers drift as scripts are edited; treat them as "current as of this pass," and
confirm against the script before editing.

## Severity Key

| Tier | Meaning |
| --- | --- |
| **High** | A player can catch it at the table, or it breaks a causal chain in canon. Fix before the next pass. |
| **Medium** | Internally contradictory, but only a reader with two documents open will see it. Fix when convenient. |
| **Low** | Drift, imprecision, or an unanchored figure. Worth a line in a consolidated pass. |

**Headline.** The corpus is in good shape for launch. The timeline spine holds; the
Magister→Professor rename is complete; every NPC's race agrees across every document;
the Player Guide is clean. The failures cluster in one place and have one cause: **the two
most recent passes — Twin Clocks and Titles — were written into their own sections and
did not propagate outward to the summary tables and Atlas entries that restate the same
facts.** Both High findings are that failure. Neither is deep; both are visible.

---

# PART I — TIMELINE ARITHMETIC (REFRESH)

The prior audit (`drafts/timeline-arithmetic-audit.RESOLVED.md`) closed clean through
Session Eight. **Its fixes are intact** — see Verified Clean. What follows extends the
same method to everything written since.

## H-1. Solacre Day is "one day" in the design and "one season" in the timeline

This is the campaign's central structural clock, and the corpus states it two ways.

- **SB:1052** (*Plot Hooks — Solacre Day*) — "The promulgation isn't three developments
  that happen to share a season — **it's one convergent day.**"
- **SB:1054** (*The Coronation Clock*) — Orlath crowns Karvel "**the same day, not merely
  the same season**, as the Laws' promulgation."
- **RG:250** (*Items and Threads*) — "all converge on **one day, not just one season**."
- **SB:1100** (*Timeline*) — "**Two clocks, one season:** the planned promulgation … and
  the coronation of Karvel."
- **RG:240** (*Timeline at a Glance*) — "**TWO CLOCKS, ONE SEASON:** Zhuvedian Laws
  promulgation (Aenodira) + Karvel's coronation (Orlath)."

The Twin Clocks pass sharpened "same season" to "same day" and wrote that into the Plot
Hooks and the Items-and-Threads list, but the two timeline entries still carry the older,
looser framing — in both documents, in the row a DM actually reads when planning.

Why this is High rather than Medium: the Twin Clocks module is the next thing to be built,
and it would be built off the timeline row. "One season" and "one day" are different set
pieces. Same season is three developments a DM can stage across several sessions; same day
is one bell, one afternoon, and the party physically able to be in only one place — which
is the entire dramatic point of the design.

**Recommendation.** Restate both timeline rows as **"TWO CLOCKS, ONE DAY"** and let the
entry carry the convergence: the promulgation, the Marked ruling, the Rising's trigger,
and word from Orlath. Fix in `campaign.js` (SB:1100) and `refguide.js` (RG:240).

> **SIGN-OFF FLAG H-1** — natural extension; the Plot Hooks section is the newer and more
> specific statement, and the timeline rows simply were not updated with it. Two scripts.
> Recommend approve.

## M-1. Vessarkath's eagles lose three years

- **SB:148** (*Vessarkath*) — "**sixty years ago**, three legions marched into her wood …
  Vessarkath let one standard leave her hoard … some **fifty-seven years after taking
  it**." Correct: taken 60 years ago, released 3 years ago.
- **RG:237** — "~3 yrs ago (DM): Vessarkath lets one wolf-standard leave her hoard."
  Correct.
- **SB:905** (*DM Only — The Acceleration*) — "the ancient green Vessarkath, still couched
  on the eagles **she took fifty-seven years past**, chose that same season to let one
  leave her hoard."

SB:905 applies the 57 to the wrong event. Fifty-seven is the *interval between taking and
release*, not the age of the taking. As written, the Acceleration paragraph dates the
Silvasse Disaster to 57 years ago, against 60 everywhere else — including the timeline and
Dane's "nearly sixty years after Silvasse," which the whole Young Wolf legend rests on.

**Recommendation.** SB:905 → "the eagles she took **sixty years past**." One word, one
script (`campaign.js`).

> **SIGN-OFF FLAG M-1** — natural extension; a transposed figure, not a design choice.
> Recommend approve.

## L-1. Olvesa's regency is sixty years long and fifty-eight years old

The Titles pass gave Saint-Regent its referent — she keeps the vacant seat of the True
Rite — and dated the keeping:

- **SB:939**, **SB:73**, **RG:147** — "for **sixty years**" / "Olvesa's **sixty-year
  regency**" / "Olvesa has kept it **sixty years**."
- **RG:25** — the See "**Founded ~58 yrs ago** by Olvesa."
- **SB:73**, **PG:71** — the See "founded **nearly sixty years ago**."
- **Timeline (SB / RG)** — "~60–58 yrs ago: Olvesa's lord murdered; her four vengeances;
  her conversion; the See of Orlath founding itself around her (~58)."

Two small problems. The regency can't predate the See that holds the throne vacant, so it
runs from ~58 years ago, not 60 — and 60 is where the *vengeances* sit, before her
conversion. And "sixty-year regency" against "founded nearly sixty years ago" is
round-number drift in the same sentence at SB:73.

This is my own material from the Titles pass, and it is Low because nobody will ever catch
it: "sixty years" reads as the round figure it is. Flagged for completeness.

**Recommendation.** Either leave it as deliberate rounding (defensible — the empire would
round it too), or tighten to "**for fifty-eight years**" / "**her fifty-eight-year
regency**" in `campaign.js` and `refguide.js`. Recommend leaving it; the round number is
better prose and the corpus already says "nearly sixty" for the See itself.

> **SIGN-OFF FLAG L-1** — housekeeping; recommend **no change**, noted so the next audit
> doesn't re-derive it.

## Verified Clean — Part I

| Check | Result |
| --- | --- |
| **H-1 of the prior audit** — commencement reanchored to six weeks (SB:1081), instructor says five weeks after a four-day journey (S2:69), Proving graduates "four weeks early" (S3-4:121) | **Closes exactly.** |
| **M-4 of the prior audit** — Archivist Vell a hill dwarf in SB (*Peoples*, Roster SB:1130), RG:166, and S2:71 | **Fixed and consistent.** |
| **SN-1 of the prior audit** — the DM-only anchor year (present ≈ YR 2000) | **Present**, RG header to the Timeline. |
| "**Nine months out**" to Solacre | **Correct.** From mid-Harvestide (month 7) to the following Solacre (month 5) is 275 days ≈ 9.2 months, given Threshold's 20-day length. Stated identically at SB:1100, PG:187, PG:471, RG:25/240. |
| The season anchor — Harvestide, stated at S1:15 and used as the double anniversary at S1:25, S2:49, S2:65 | **Consistent**, and O-1 of the prior audit landed. |
| Grey-Gold Rising against the racing calendar — the Rising fires at Solacre (month 5); the Long Course season opens at Greening (month 4) and closes at Greywane (month 10) | **The Course is open on Solacre Day.** No conflict. |
| The three-year Nyreeza cluster, the fifty-year Vaelindra marker, the two-thousand-year founding, the two-century fracture | **No drift**, unchanged from the prior audit. |
| Dane: standard recovered ~1 yr ago, "nearly sixty years after Silvasse" (~60 yrs ago) = 59 | **Closes.** |
| Vessarkath's release (~3 yrs ago) → Brekelands warlords → Dane's recovery (~1 yr ago) | **Closes** — two years in warlord hands (see M-1 for the one bad figure). |
| Karvel: "~15 yrs ago begins unifying Ardven" against "fifteen years of war, marriage, and administration" (SB:945, PG:269) | **Closes.** |
| Dregan: arrives ~40 yrs ago → home a decade later → thirty years on the Eastmarch | **Closes.** |
| The law, currency, literacy, and medicine passes | **No new arithmetic.** These passes are structural, not dated; they introduce no elapsed-time claims to test. |
| The two new Branch Ledger rows (Marked personhood; Grey-Gold Rising), both keyed "TBD (Twin Clocks)" | **Present and correctly keyed**, RG:307–308. |

---

# PART II — TITLES, RANKS, AND PEOPLES

## H-2. Duchess Vasq both governs the Suthmark and holds a style with no authority

The Titles pass established that Vasq is a **Dowager** Duchess and that her son reigns. It
wrote that into her Powers entry and her Player Guide entry, and nowhere else — so the
Atlas, the jurisdiction table, and the reference guide still describe her as the Suthmark's
ruler.

Against her:

- **SB:927** — "widowed at forty some fifteen years ago, and Dowager Duchess ever since —
  **a style that carries no authority whatever. The Suthmark's duke is her sickly elder
  son; every instrument of rule is his.**"
- **PG:261** — "Dowager Duchess ever since — **a style carrying no authority at all. The
  Suthmark's duke is her elder son; every instrument of rule is his**, and she has governed
  through her sons regardless."

For her:

- **SB:63** (*Atlas — the Suthmark*) — "**Governed by Duchess Emerenn Vasq**."
- **PG:63** (*Atlas — the Suthmark*) — "**Governed by Duchess Emerenn Vasq**."
- **SB:89** / **RG:36** (jurisdiction) — "**Duchess Vasq's household authority**, alongside
  the Church."
- **RG:21** — the Suthmark's entry lists her as the region's holder outright.

**The Player Guide contradicts itself twenty pages apart, in the document players read.**
PG:63 says she governs the Suthmark; PG:261 says her style carries no authority at all and
every instrument of rule is her son's. That is catchable by one attentive player with one
document, which is the definition of High.

There is a second, smaller defect inside SB:927 itself. The inserted sentence says "her
**sickly** elder son," and the very next sentence says "the **sickly** young Duke Aldous" —
the same adjective twice in twelve words, with the inserted sentence duplicating
information the following sentence already carried better, with names. And "every
instrument of rule is his" runs straight into "She governs through her sons" with no
connective. The Player Guide got the connective ("**and she has governed through her sons
regardless**"); the sourcebook did not. The sourcebook is the weaker text of the two on the
same fact.

**Recommendation.** The fiction is not in doubt — the Dowager framing is right, and it is
better than what it replaced. What is needed is propagation and one line of repair:

1. **SB:927** — cut the duplicated "sickly," and carry the Player Guide's connective into
   the sourcebook so the two sentences resolve instead of colliding.
2. **SB:63 / PG:63** — "Governed by **the ducal house of Vasq — the young Duke Aldous in
   law, and his mother the Dowager Duchess Emerenn in fact**," or similar. The distinction
   is the point, and it is better texture than the flat statement it replaces.
3. **SB:89 / RG:36 / RG:21** — the jurisdiction tables should say the ducal house, with
   Vasq's household authority named as what it actually is: informal, and stronger for it.

Note that the *Sovereign and Border Styles* table (SB:619 region) already gets this right —
its "Held by" column says "Garvin Norr of Normere; **the Suthmark house**," carefully
declining to name Vasq. That is the model the other entries should follow.

> **SIGN-OFF FLAG H-2** — natural extension of the Titles pass, which Josh approved; this
> is that decision reaching the documents it never got propagated to. But it **changes a
> player-facing fact** (who governs the Suthmark), so it needs explicit sign-off rather
> than free-latitude repair. Four scripts: `campaign.js`, `refguide.js`, `playerguide.js`.

## M-2. Duke Aldous now rules a great province and is filed as a background name

The Titles pass promoted him from "the sickly young Duke Aldous," a detail inside his
mother's profile, to the man in whom "every instrument of rule" of the empire's breadbasket
resides. The corpus has not caught up:

- **SB:927** is the **only** line in the entire corpus that names him. He appears in no
  other document.
- **SB:1145** (Roster, Appendix I) files him in the catch-all row — "*Marshal Dane's analog
  gap — Yanna, Semya, Vorn, Tobble, Bram, Tavian, Aldous | Human | Commoners / Nobles*."
- He appears **nowhere in the DM Reference Guide** — not in the Atlas table, not in NPCs by
  Circle.
- The *Sovereign and Border Styles* table names holders for every other style (Karvel,
  Aldrec, Ysavet Morn, Dregan, Norr, Ory, Ostrev, Olvesa) and says only "the Suthmark
  house" for his.

A DM running a Suthmark scene has a reigning duke with one adjective ("sickly"), a brother
with one ("ambitious"), and no line to give either of them.

**Recommendation.** A short entry — two or three sentences apiece for Aldous and Tavian —
in the sourcebook near Vasq, a Roster row of their own, and an RG line. This is minor-NPC
work, normally free latitude, except that it defines the succession of a great province and
Tavian's ambition is a loaded gun in a campaign about broken oaths.

> **SIGN-OFF FLAG M-2** — **genuine new invention** (their characters do not exist yet),
> constrained by approved canon (they exist, their birth order, their two adjectives).
> Recommend a proposal pass rather than writing them straight in. Three scripts.

## L-2. The Suthmark's succession is the one place the Denmother's Choice should bite

Not an error — an unwritten consequence, recorded here so it isn't lost. **SB:301**
establishes that titled succession runs by the Denmother's Choice: the ruling parent names
an heir by open declaration, revisable over their lifetime, not necessarily the eldest. The
Suthmark has a sickly reigning duke and an ambitious younger brother, and their mother is
the Dowager. Who named Aldous, whether it can be revised, and by whom, is the sharpest
available use of that custom anywhere in the corpus — and no document connects them.

> **SIGN-OFF FLAG L-2** — observation only; folds into M-2 if that is approved.

## Verified Clean — Part II

| Check | Result |
| --- | --- |
| **Magister → Professor**, everywhere | **Complete.** Zero occurrences in `scripts/` or `corpus/`. The only surviving instances are the canon line in `CLAUDE.md` and `reference/project-instructions.md` that *records* the rename ("never Magisters"), and the resolved Titles draft. Correct in all four cases. |
| Faculty styles — Chancellor, Professor, Professor Emeritus, Instructor, Archivist | **Consistent** across SB:614 region, RG:87/129/140, S3-4:46/109/328, S5:71/73, PG:282. |
| **Corvin Dail** — "Professor Corvin Dail" in full, "Professor Dail" / "Dail" short | **Consistent.** No first-name/surname confusion. |
| **Marshal as acclamation, never a Book Six rung** | **Consistent and well-propagated** — SB:564 (with the Dane/Thorne worked example), SB:596, RG:138, PG:223, PG:280. Book Six's ladder never lists it. |
| **Saint-Regent** — the See's regency of the True Rite, unique to Olvesa | **Consistent** — SB:632, SB:939, RG:141/147, PG:265, PG:283. |
| **Collegial Matriarchate** — no supreme authority; Prelate holds from the Synod, not the Matriarch | **Consistent** — SB:598 region and the paragraph following it; RG and PG agree; Session 5–6's Odell arc depends on exactly this and does not contradict it. |
| **Every named NPC's race**, cross-checked across sourcebook Roster, RG:166 race-calls, and all nine modules | **No contradictions.** Vell (hill dwarf), Mosse (rock gnome), Halloc (half-orc), Brakka (hill dwarf), Vhal (half-elf), Sorral (half-elf), Nyreeza and Qilvayas (Drow), Verath (human Tarnovari), and all Powers human. The M-4 class of error does not recur. |
| **Ferrin Odo** — styled Censor-Captain | **Consistent** in every occurrence. (Flagged as a possible split in the Titles draft; that was a false positive of a regex matching the compound's tail.) |
| The five ladders, and the deliberate silence at *When the Ladders Meet* | **Intact**, SB:638. |

---

# PART III — QUEST AND TERMINOLOGY CONSISTENCY

## M-3. The empire's coin is named everywhere except in the mouths of the people using it

The currency pass named the Zhuven and established the register: *"everyone actually says
**wolf** in Common"* (RG:190, SB:341–345). The pass reached the sourcebook, the reference
guide, and the Player Guide's price-table note (PG:378). **It did not reach a single
session module.** The one place a player hears money named in-fiction is boxed read-aloud:

- **S2:53** — Odric Hale, working his fraudulent bridge toll:
  > *"Bridge maintenance assessment," he says. "**One gold the wagon, two silver the
  > walker.** All proper. I have the writ."*

"One gold the wagon" is the generic-fantasy phrasing the currency pass exists to replace.
The canonical line is "**one wolf the wagon, two strands the walker**" — and it is a
strictly better line, because a fraudster's fluency in the vernacular is characterization,
and because this is the party's first contact with imperial money as a thing people say
rather than a number on a sheet.

To be clear about what is *not* a finding: the gp/sp/cp figures in loot and price tables
are correct and sanctioned — "Table pricing stays gp/sp/cp; Zhuven/strand/mote are just
what the coins are called and look like in hand" (RG:190). Only spoken and read-aloud prose
is in scope. Sweeping all nine modules, this is the sole in-fiction instance. Two further
uses are correct as they stand: the mimic's fake "gold" (S3-4:75, a description of bait)
and "this session pays in relationships, not gold" (S2:246, DM-facing metagame).

**Recommendation.** Rewrite the toll line in `sessions.js`. One line, one script.

> **SIGN-OFF FLAG M-3** — natural extension; the currency pass simply never swept the
> modules. It **changes read-aloud text in an already-designed module**, so it takes
> sign-off rather than free latitude. Recommend approve.

## M-4. The party's own company is chartered and never registered

Book Three is unambiguous: *"certification is two things, never one: a physical mark …
**and** a matching written entry in the certifying body's own register. … The mark alone
proves nothing"* (SB:535). Three registers exist — the Church's Sanction, the House of the
Craft's Charter, and the Crown and guilds over mundane trade.

The party's mercenary company holds a mark and no register:

- **S3-4:122** — "The chancellery **countersigns their mercenary charter** as its
  graduation gift."
- **S5:15** — "The party are graduates now: **chartered**, marked in sealed records as
  Proven, and open for business."
- **S5:29** — "revisit the company name and charter from Session Zero — **hang the charter
  on the wall**."

Two problems, one cosmetic and one structural. Cosmetic: "charter" now carries a specific
technical sense (the House of the Craft's arcane certification), and a mercenary company is
mundane trade — Crown-and-guild business. The corpus already uses "chartered" generically
elsewhere ("a chartered license," "chartered trade body," SB:541), so this is a readability
hazard rather than an outright error. Structural, and the real finding: **an Academy
chancellery is not one of the three registers.** Under Book Three the party's charter is a
mark with no entry behind it — precisely the defect that, per SB:535, "proves nothing to a
suspicious buyer or a sitting magistrate."

This matters more than it looks. Session Five is *about* the document underworld. The party
spends it investigating dead seals and forged provenance while carrying an instrument with
the same weakness, and nobody says so.

**Recommendation.** One clause in Session 3–4 putting the company in the Crown-guild
register alongside the chancellery countersignature — the Academy vouches, the guild
records — and one line in Session Five's office scene making the register entry a physical
object in the room. See **O-3**, which is the same fix used as an opportunity rather than a
patch.

> **SIGN-OFF FLAG M-4** — natural extension of the approved law pass into modules written
> before it. Two scripts: `session34.js`, `s56.js`.

## M-5. Sessions Two and Five carry no scaling notes

Outside the strict brief for this Part, but it surfaced during the module sweep and belongs
somewhere. The standing spec: *"**Always include scaling notes** for 4, 5, and 6
characters."*

| Module | Optional Content | Diverging Paths | Pacing budget | **Scaling** |
| --- | --- | --- | --- | --- |
| Session 0 | — | — | — | — (primer; exempt) |
| Session 1 | yes | yes | yes | **yes** |
| **Session 2** | yes | yes | yes | **none** |
| Sessions 3–4 | yes | yes | yes | **yes** |
| **Session 5** | yes | yes | yes | **none** |
| Session 6 | yes | yes | yes | **yes** |
| Session 7 | yes | yes | yes | **yes** |
| Session 8 | yes | yes | yes | **yes** |

Session Two carries four stat blocks (S2:89 ff. — Malich, an enforcer with a *Paid, Not
Owned* morale trait, Odric Hale) and Session Five carries four more (S5:87 ff. — Halloc
with *Hold Fast*, an enforcer with *Professional Standards*). Both have real combat with
real morale rules. Session Two's overview does say "None is primarily a combat" (S2:27),
which explains the omission without satisfying the spec — a table of six that picks the
fight still needs the numbers.

**Recommendation.** Add a scaling line to each module's climax or encounter block, matching
the pattern already used at S1 and S8 ("four Unwitnessed — five for five characters, six
for six"). Two scripts: `sessions.js`, `s56.js`.

> **SIGN-OFF FLAG M-5** — natural extension; spec compliance, no fiction touched.
> Recommend approve.

## Opportunities the New Passes Open

Per the standing protocol: what the new canon makes *available* in already-written scenes,
not only what it breaks. All four are additive and none contradicts anything.

### O-1. Farrowgate's Damp is missing from the Farrowgate scenes

The medicine pass established the Damp as Farrowgate's signature chronic lung ailment, bred
by overcrowding, "**mundane, NOT shadow-connected**" (RG:192) — a deliberate refusal to make
every wound in the campaign metaphysical. The two scenes where it would land are already
written and do not mention it:

- **S5:75** — *The Farrowgate Client:* "A knock after hours: a Farrowgate mother … "
- **S6:82** — *The Plums Come Back:* she returns.

A Farrowgate mother who coughs, and stops, and apologizes for it, and whom the party can do
nothing structural about, is the medicine pass doing its work at the table in ten seconds.
The Damp is curable instantly by Church magic and unfixable in general — "Church magic cures
an active case instantly; it doesn't fix a drainage ditch" (RG:192) — so a party that heals
her has helped exactly one person and changed nothing, which is the campaign's whole thesis
in miniature.

> **SIGN-OFF FLAG O-1** — texture into two written modules. `s56.js`.

### O-2. Odric Hale's writ is a Book Three test, not just an anachronism

**S2:55** currently resolves on spotting the fraud: "*A DC 13 Intelligence (History or
Investigation) check — or any Seal-house character who handles the writ, automatically —
spots the anachronism instantly.*" His seal is genuine, from an office abolished sixty years
ago.

Book Three's actual test is sharper and now canon: the mark proves nothing; **demand the
register entry**. "A magistrate, a Church tribunal, or a Charter inspector may demand the
seller or practitioner produce their register entry on formal challenge, and it is the
failure to produce one … that opens a case" (SB:537). Odric can't produce one, because the
office that kept the register is dead.

This upgrades the beat the module already calls "a gift of a moment for a law-focused
character: the first time their education simply wins." Right now the win is trivia
recognition. With Book Three it's procedure — the character doesn't merely notice, they
*do the thing the Laws are for*, and Odric folds because the machinery worked. It also
plants mark-and-register before Session Five needs the party to understand it.

> **SIGN-OFF FLAG O-2** — extension into a written module. `sessions.js`.

### O-3. Make the company's own charter the lesson — and the Rising's fuse

This is M-4 turned around. If the party must register their own company in Session
Three–Four (guild entry, a fee, a clerk, a queue), then:

- Book Three stops being a sourcebook paragraph and becomes an afternoon they lived.
- Session Five's document underworld lands harder, because they know what a real entry
  costs and what a missing one is worth.
- **The Grey-Gold Rising's trigger is the same requirement.** The Rising fires because
  Book Three's registration is extended over Long Course commerce, hauling stables,
  tipsters, and small bookmakers before a magistrate "for lacking an entry they never knew
  to make" (SB:1053). A party that stood in that queue with a chancellery countersignature
  and a clean guild entry will understand instantly what it means for people who have
  neither — and the Rising becomes something they have standing to feel, rather than a riot
  they read about.

Cost: two clauses. Payoff: the campaign's largest set piece gets its foundation laid nine
months and four sessions early.

> **SIGN-OFF FLAG O-3** — natural extension, and the strongest item in this audit.
> Recommend approve. `session34.js`, `s56.js`.

### O-4. Semya's forty witnesses are now a legal instrument

**S2:231** — "Resettled in Dravenna: **forty grateful witnesses** and a standing Ostmark
listening post." Written before the law pass. Book Two now states outright that "an oath
binds at law only if sworn before a recognized witness" (RG:200), and the literacy pass
established that the unlettered are exposed exactly where Books One–Four run on
witness-mark-register.

Forty people who owe the party their resettlement, in a world where witnessed oaths are the
enforcement mechanism and most people cannot read, is not a warm epilogue — it is a
resource. The Forty Witnesses hook already exists; the law pass silently made it three times
more valuable, and nothing says so.

> **SIGN-OFF FLAG O-4** — observation; costs one line in the Diverging Paths entry, or
> nothing at all if Josh would rather it stay implicit. `sessions.js`.

## Verified Clean — Part III

| Check | Result |
| --- | --- |
| **Imported-game terminology** — tenday, sennight, fortnight, Faerûn, Waterdeep, Toril, Greyhawk, "gold pieces" as in-fiction speech | **Zero occurrences** across all eleven documents. The canonical seven-day week is uncontradicted. |
| **Currency in loot and price tables** — gp/sp/cp shorthand | **Correct and sanctioned** (RG:190, PG:378). Not a finding. |
| **Magistrates** — judge and civil administrator in one office, no jury, no separate civilian watch | **Consistent.** Session One's Ondrei (S1:33, "a hall that doubles as courtroom and granary office") is the model Book Seven was written from, and does not contradict it. |
| **Church Writ vs. secular process running in parallel** | **Consistent.** Session Six's four-branch writ challenge (S6:41) is built on exactly Book Seven's parallel-jurisdiction rule. |
| **Book Six's chain of command** — Dessen a Colonel, complaint to Legate Thorne, court-martial at Legate level | **Consistent** (S1:107, SB:572). |
| **Book Four's provenance logic** — "Copying wax is easy. Copying a register is fundamentally harder — which is exactly why Rivergate deals in provenance rather than fabrication" (SB:541) | **Session Five's entire Rivergate arc already runs on this**, written before the law pass and requiring no change. Notably good propagation. |
| **Module format spec** — Optional Content, Diverging Paths, pacing budget | **Present in all eight** playable modules (Session Zero exempt). See M-5 for scaling. |
| **The Vigil, the Wolf-Price, the Willing Shape, the Packlaw** in module text | **No contradictions** with the social-foundations canon. |

---

# PART IV — MECHANICAL VALIDATION

**Run.** Approved and executed against the 5e-bits SRD database (`5e-bits/5e-database`,
commit `ce47a18`), checking all **32 homebrew stat blocks** — 22 module blocks plus the ten
Powers of Appendix II — against the DMG's Monster Statistics by Challenge Rating table
*and* against SRD monsters at the same and neighboring CR, plus every spell reference and
every SRD-derived price in the commerce tables.

## Headline: no genuine errors, in any of the 32 blocks.

That result needs one methodological caveat stated up front, because it reverses a first
impression. Measured against the **DMG table alone**, every humanoid block in the corpus
looks badly under-tuned — the Powers sit 50–90 hit points and 15–60 damage below their
CR band. Measured against **actual SRD monsters**, they are correct, because official
SRD humanoids sit just as far below that table. A CR 3 Veteran has 58 HP where the DMG
table says 101–115. The table describes monsters; these are people.

A second caveat on method: automated damage extraction **undercounted four of the ten
Powers by 50–100%**, because their output lives in riders rather than the base attack line.
Every classification below uses the hand-checked figure.

| Power | Parsed DPR | Actual DPR | Why |
| --- | --- | --- | --- |
| Ban Dregan Morn | 27 | **54** | Sanction of the Broken Word adds 2d8 radiant per hit — and the block itself notes that against "bandits, deserters, and most of the fractured world's soldiery, everyone qualifies" |
| Emperor Qilvayas | 16 | **34** | Vigil's 2d8 radiant rider, plus a 45 hp healing pool |
| Mistress Averil Shen | 14 | **31** | Sneak Attack 5d6 (+17), once per turn |
| Saint-Regent Olvesa | 3 | **~40+** | The walking stick is not the weapon; *spirit guardians* and *flame strike* are |

## Findings by classification

**Well-calibrated (24 blocks).** Several are near-exact ports of their SRD analog, which is
the strongest possible evidence of careful grounding:

| Homebrew block | SRD analog | Match |
| --- | --- | --- |
| Provincial Soldier (CR 1/8) | Guard | AC 16 / HP 11 / +3 — identical |
| Umbral Remnant (CR 1/2) | Shadow | AC 12 / HP 16 / +4 / 9 dmg — identical |
| Bartleby, Elder Mimic (CR 2) | Mimic | AC 12 / HP 58 / +5 — identical |
| Sergeant Varkos Dren (CR 3) | Veteran | HP 58 / +5; AC 15 vs. 17 — softer, correct for a deserter in worn kit |
| Vault Warden (CR 5) | Bulette | AC 17/94/+7/30 vs. AC 17/90/+8/30 — within a point |
| Marshal Dane, Sea-King Aldrec (CR 7) | Oni | AC 16/HP 110/+7/DPR 30 — both land on it |
| Ban Dregan Morn (CR 9) | Fire Giant | DPR 54 vs. 58 with the Sanction counted |
| Saint-Regent Olvesa (CR 10) | Archmage (CR 12) | 117 HP and DC 17 vs. 99 HP and DC 17 — if anything **under**-labeled |

**Intentional design pattern (8 blocks)** — deviations that are the design working, not
failing. Per the protocol these are identified, not corrected:

- **Prelate Sarvin Odell (CR 5)** — 3 damage per round against a CR 5 band of 33–38. The
  protocol names custody-focused Church examiners as a deliberate pattern, and this is that
  block. His threat is a DC 17 save and a jurisdiction, not a mace.
- **Duke Garvin Norr (CR 8)** — 27 DPR against a band of 51–56. The block is a
  mastermind-general; the sourcebook says outright that his power is armies.
- **Emperor Qilvayas (CR 9)** — 34 DPR and a healing pool he spends "on others. Always on
  others." At most one CR high, and defensive by design.
- **Olvesa's *The Reconciled*** — *sanctuary* made permanent and self-only, which RAW
  cannot be, and which does not break when she acts. Deliberate: she has been struck four
  times in sixty years.
- **Qilvayas's *divination*** — not on the paladin list (it is cleric/druid 4th). Framed as
  a Crown Oath gift rather than a spell slot, and the block says the Matron answers. Correct
  as flavor; noted so it isn't mistaken for a slip.
- **Yield and Warrant Protocols** (Vault Warden), **Hold Fast** (Halloc), **Professional
  Standards** (Inkhand Enforcer), **Paid, Not Owned** (Bridge Enforcer) — explicit morale
  and stand-down clauses, exactly per the design spec's requirement that combats carry
  credible nonviolent resolutions.

**The one standing flag, re-examined.** S1:325 records that "the Oathless Deserters deal
10–12 damage per round — CR 1-grade output at a CR 1/2 label." Against the DMG table that
is true (CR 1/2 = 6–8). Against the SRD it is **normal**: a Lizardfolk is CR 1/2 with two
attacks for 10, and an Orc is CR 1/2 hitting for 9 at +5. The flag is accurate about the
table and over-cautious about play, and its own conclusion — "Neither needs changing — the
yield thresholds and parley paths are the pressure valves" — is right.

> **Recommendation: leave S1:325 as written.** It is honest, it is marked "for awareness
> rather than revision," and a DM is better served by a warning that proved conservative
> than by no warning.

**Spells (12 checked).** *sanctuary, spirit guardians, flame strike, heal, greater
restoration, divination, command, zone of truth, dispel magic, bless, hold person, sending*
— all exist in the SRD at the levels and with the effects the corpus describes. Olvesa's
13th-level cleric access correctly reaches *heal* (6th). Dregan's *zone of truth* at DC 15
is arithmetically correct for his Charisma and proficiency.

**Equipment and prices.** Every SRD-derived price in the commerce tables matches the SRD
**exactly** — backpack 2 gp, bedroll 1 gp, hooded lantern 5 gp, torch 1 cp, chain 5 gp,
healer's kit 5 gp, shortsword 10 gp, longsword 15 gp, shield 10 gp, chain shirt 50 gp,
breastplate 400 gp, holy water 25 gp, spellbook 50 gp, component pouch 25 gp, ink 10 gp,
paper 2 sp, rations 5 sp, waterskin 2 sp, tinderbox 5 sp, oil 1 sp, and the rest. Twenty-six
checked, twenty-six correct.

Deliberate premiums are marked as such in the tables themselves and are not errors: Potion
of Greater Healing at 200 gp "requires standing with a parish, or a pilgrim's writ," and the
spell scrolls carry Chartered Scriptorium registration. In-world pricing, correctly flagged.

## Verified Clean — Part IV

| Check | Result |
| --- | --- |
| All 32 homebrew stat blocks vs. DMG CR table **and** SRD analogs | **No genuine errors.** |
| The ten Powers (CR 5–10) — the brief's stated priority | **Well-calibrated or intentional.** Olvesa is arguably under-labeled; Qilvayas at most one CR high. |
| Attack bonuses vs. CR baseline | **In band throughout.** The single outlier is the Vault Warden's +8 against a CR 5 baseline of +6 — one point above Bulette's +7, on a construct with two explicit stand-down clauses. |
| Save DCs vs. CR baseline | **Consistent.** DC 12–15 at low CR, 15–17 at CR 5–10. |
| Spell references | **12 of 12 correct** in level, list, and effect. |
| SRD equipment prices | **26 of 26 exact.** |
| Morale / nonviolent resolution per the design spec | **Present in every combat block that needed one.** |

> **No script changes arise from Part IV.** The production pass proceeds with the fourteen
> consistency items only.

---

# PART V — EDITORIAL AND LAYOUT POLISH

## L-3. A double space in the Olvesa entry

**SB:939** — "regent of the True Rite, placeholder for an emperor not yet crowned, for
sixty years.**  **She rejects the capital Church…" Two spaces after the full stop, at the
seam where the Titles pass appended its sentence. The only instance of its kind in the
corpus.

**Recommendation.** Single space, `campaign.js`.

> **SIGN-OFF FLAG L-3** — housekeeping, no approval really needed; listed for the
> consolidated pass.

## Wide-table crowding — confirmed by inspection, partially resolved

The brief asked me to flag this as needing visual confirmation on the next build rather
than assume it from source. That turned out to be unnecessary: **`documents/` holds the
current build output, generated from these exact scripts at the last commit**, so it could
be inspected directly without building anything. I rendered and looked at the commerce
pages.

**Finding: substantially improved, not fully resolved.** The catastrophic failure the
production notes describe — prose columns "wrapping to one or two words per line" — is
gone. The two-column `Item | Price | Item | Price` tables (The Exchange, the Garrison
Quartermaster) render cleanly. But the three-column tables with a prose `Notes` or
`Specialty` column still wrap tight, at roughly three to six words per line, producing tall
ragged rows:

- *Scholar's Row & the Church Almonry* — the Holy Water row runs seven lines in a
  three-word column.
- *Rivergate Gray Market* — the "'Relic' of a named saint" row runs eight.
- *Regional Signature Vendors* — the worst remaining case; both the Vendor and Specialty
  columns break awkwardly ("Ostwatch / Outfitters (Yanna's / cousin's house)").

This is readable, which the previous state reportedly was not. It is still not good
typography, and the structural fix — letting wide tables span both columns — remains the
real answer.

> **SIGN-OFF FLAG V-1** — **no change proposed in this pass.** The structural fix is a
> generator change, correctly queued rather than patched. Recorded here with evidence so the
> queue entry has a current assessment attached instead of a stale one.

## Verified Clean — Part V

| Check | Result |
| --- | --- |
| **Escape convention in scripts** — literal non-ASCII, which must be zero (prose lives as `\uXXXX`) | **0 in all seven scripts.** |
| **Escape leaks in corpus** — `grep -c '\\u'`, doubled backslash per the production note | **0 in all eleven documents.** |
| **Em-dash spacing** — spaced em-dashes throughout | **Clean.** The only unspaced instances are epigraph attributions (`*—Pontellus Vorn`), which is correct form. |
| **Space before punctuation** | **Zero instances.** |
| **Double spaces** | **One instance** — see L-3. |
| **DM-marker convention** — bold book-red `DM()` segments, never italic | **Consistent** in all seven generators; no whole-paragraph italic DM notes. |

---

# PART VI — PLAYER GUIDE LEAK CHECK

**The Player Guide is clean.** This is the strongest result in the audit, and it is worth
saying plainly: the authoring rule — that it is written as its own document rather than
produced by deleting paragraphs — is working.

## Verified Clean — Part VI

| Check | Result |
| --- | --- |
| **DM-only strings** — "DM Only", "DM note", "DM:", "(DM)", "behind the screen" | **Zero.** |
| **The `DM()` helper in `playerguide.js`** | **Never called.** The leak is structurally impossible, not merely absent. |
| **Mechanical asides** — DCs, CRs, hit points, damage dice, saving throws, initiative, stat blocks | **Zero.** |
| **Vaelindra omitted by design** — findable only by referral | **Intact. Zero mentions**, including in the Powers section and the timeline. |
| **The Vintage Night as disputed public tragedy, not confirmed truth** | **Correct.** PG:261 "What she ordered, and what it became, are not agreed upon even now"; PG:466 "still disputed, still unexplained." The canon truth (a limited arrest that cascaded) appears only in SB:929 and RG:113, both DM-side. |
| **The shadow, the binding site, the Undercourt, Threnvos, Zhuvedus's oathbreaking** | **Absent.** The Old Forum appears (PG:352) purely as a tourist landmark — "worn smooth by two thousand years of hands touching it for luck" — with no hint of what is beneath it. Exactly the intended effect. |
| **The Founding Myth** | **Correctly rendered as contested doctrine** (PG:85/87): the Church's mortal-hero teaching against the Imperial Cult's apotheosis, with the actual truth nowhere on the page. |
| **Vessarkath as the true author of Silvasse; the Acceleration; Countess Ory's rite** | **Absent.** Silvasse appears as a military disaster (PG:461); Greywell survives as unresolved dread — "servant girls have a way of not coming home" (PG:63) — which is a hook, not a spoiler, and correctly kept. |
| **Olvesa's visions being true, and why the coronation is now** | **Absent.** PG:265 gives the shrine year and the sainthood, never the visions' validity. |
| **Marked personhood** | **Correctly framed** as a live public question (PG:215), matching its Branch Ledger status without disclosing that the party is the mechanism. |

**One carryover, not a leak.** H-2's contradiction is player-facing and lives in this
document: PG:63 says Vasq governs the Suthmark, PG:261 says her style carries no authority
at all. That is a consistency defect rather than a spoiler, and it is counted once, under
H-2.

---

# Sign-Off Checklist

| # | Item | Kind | Severity | Scripts on approval |
| --- | --- | --- | --- | --- |
| **H-1** | Solacre Day: timeline rows say "one season," design says "one day" | Extension | **High** | `campaign.js`, `refguide.js` |
| **H-2** | Vasq governs the Suthmark / holds a style with no authority | Extension — **changes a player-facing fact** | **High** | `campaign.js`, `refguide.js`, `playerguide.js` |
| **M-1** | Vessarkath's eagles "fifty-seven years past" → sixty | Extension | Medium | `campaign.js` |
| **M-2** | Duke Aldous and Tavian need entries | **New invention** | Medium | `campaign.js`, `refguide.js` |
| **M-3** | Odric's toll line: "one gold" → "one wolf, two strands" | Extension — read-aloud text | Medium | `sessions.js` |
| **M-4** | The company's charter has no Book Three register entry | Extension | Medium | `session34.js`, `s56.js` |
| **M-5** | Sessions Two and Five lack 4/5/6 scaling notes | Spec compliance | Medium | `sessions.js`, `s56.js` |
| **L-1** | Olvesa's "sixty-year" regency vs. a See founded ~58 years ago | Housekeeping | Low | **Recommend no change** |
| **L-2** | Suthmark succession and the Denmother's Choice | Observation | Low | folds into M-2 |
| **L-3** | Double space at SB:939 | Housekeeping | Low | `campaign.js` |
| **O-1** | Farrowgate's Damp in the two Farrowgate scenes | Texture into written modules | — | `s56.js` |
| **O-2** | Odric's writ as a Book Three register challenge | Extension | — | `sessions.js` |
| **O-3** | Register the party's own company — the Rising's fuse, laid early | Extension — **recommended** | — | `session34.js`, `s56.js` |
| **O-4** | Semya's forty witnesses as a Book Two instrument | Observation | — | `sessions.js` |
| **V-1** | Wide-table crowding: partially resolved, structural fix still queued | Production practice | — | **No change proposed** |
| **IV** | Run Part IV (Mechanical Validation) | Go / no-go | — | none — read-only audit |

---

# Propagation Plan

On approval this executes as **one consolidated pass, one commit** — the batch discipline
the project runs on. Because canon is the scripts, the whole pass is script edits followed
by a single `tools/build.sh`, which regenerates `corpus/` and `documents/` together so they
cannot drift.

1. **`scripts/campaign.js` first** — the sourcebook is the anchor. Apply H-1's timeline row,
   H-2's Atlas and jurisdiction entries plus the repair inside SB:927, M-1's transposed
   figure, M-2's new entries and Roster rows if approved, and L-3's double space. L-1 only
   if Josh overrides the recommendation.
2. **The session scripts** — `sessions.js` (M-3's toll line, M-5's Session Two scaling,
   O-2's register challenge, O-4's ledger line), `session34.js` (M-4 / O-3's guild entry),
   `s56.js` (M-4 / O-3's Session Five beat, M-5's Session Five scaling, O-1's Damp).
3. **`refguide.js`** — mirror every canon change: H-1's timeline row, H-2's Atlas and
   jurisdiction rows, M-2's NPC lines. The reference guide tracks the sourcebook line for
   line, and a stale one is worse than none.
4. **`playerguide.js` last, authored not copied** — H-2's Atlas entry only. Per the
   authoring rules, nothing else from this pass is player-facing: M-4's register logic, O-1's
   Damp, and O-3's fuse are all table material, and the Marked and Rising threads stay framed
   as open public questions rather than mechanisms.
5. **`tools/build.sh`**, then verify:
   - `pdftotext … | grep -c '\\u'` must be **0** on all eleven PDFs — doubled backslash, per
     the production note; the single-quoted `'\u'` form matches the letter *u* and can never
     return zero on real prose.
   - `pdffonts … | grep -c DejaVu` must be **0** — nonzero means Alegreya SC, Alegreya Sans
     SC, or Lato is missing and the layout inspected is not the layout that will publish.
   - Render and **actually look at** the changed pages: the sourcebook's Atlas and Powers
     spreads, the reference guide's timeline, the Player Guide's Atlas.
   - Rescan the regenerated `QS_Player_Guide.md` for DM-only strings and mechanical asides
     before finishing.
   - Rebuild once more and confirm all eleven PDFs are byte-identical, which proves the
     normalization passes are still doing their job.

Estimated scope: six scripts, one build, one commit. **No finding requires a structural
change to a generator** — every fix is a figure, a clause, a table row, or a line of
read-aloud. V-1's wide-table fix is the one genuinely structural item, and it stays queued.

---

*Nothing in this draft has been applied. `scripts/`, `corpus/`, and `documents/` are
untouched. Awaiting review.*
