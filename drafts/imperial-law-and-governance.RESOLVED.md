# RESOLVED — applied to canon

All nine items (L-1 through L-9) were approved as drafted, with no redlines. Applied as a
single consolidated pass to `campaign_v11.js`, `refguide.js`, and `playerguide.js`; the
three opportunity findings (O-1 through O-3) were left as observations for whoever builds
the Grey-Gold Rising, per their own "no sign-off required" status — nothing further to
apply. Kept for the record; no longer pending.

---

# Design Draft — Imperial Law and Governance

*The Qilvayas Symphony — the Zhuvedian Laws, certification and the Sanction, the
Imperial/border jurisdiction map, military rank, and street-level justice*

**Status: draft for review. No canon has been modified.** Every proposal below is a
finding or an invention awaiting Josh's approve / redline / veto. Nothing folds into
canon until signed off. This is a script-edit pass on approval — see the propagation
plan at the end.

## Why this pass, and why now

The sourcebook's own roadmap names this as the next thing to build: *"3. The Twin
Clocks: Design the Zhuvedian Laws promulgation and the Grey-Gold Rising (the capital
crisis), and the Orlath coronation arc — the mid-campaign's hinge year"* (SB:1346). The
Laws are not a new idea — they're a marked gap in an already-approved plan. This draft
fills the legal half of that gap: what the Zhuvedian Laws actually say, how the empire's
existing certification doctrine (the Sanction, Chartered Thaumaturgy, stamped goods)
actually works as a system, where imperial law stops applying and what replaces it, and
two items already listed in `CLAUDE.md`'s open worldbuilding gaps that this pass
necessarily touches: military/institutional rank structure, and street-level law
enforcement.

This is explicitly **not** an attempt to write a legal code. Per your framing: laws and
customs an experienced table would plausibly already half-know, sized to produce
flavor and situations, not a rulebook. Every "Book" below is short enough to read aloud
and specific enough to adjudicate a scene with.

## How to read the citations

**SB** = `The_Qilvayas_Symphony_Campaign_Setting_v11.md` (fix in `campaign_v11.js`).
**PG** = `QS_Player_Guide.md` (fix in `playerguide.js`). **RG** = `QS_DM_Reference_Guide.md`
(fix in `refguide.js`). Session files cited by number (fix in `sessions.js`, `session34.js`,
`s56.js`, `s78.js` per the existing map — see the timeline audit draft for the full table).
Line numbers are current as of this pass; confirm against the script before editing.

---

# Part One — Audit: What the Corpus Already Says

Before proposing anything, here is everything already on the books, scattered across
six documents. This is the baseline every proposal below either extends or fills a gap
around. Nothing in this Part is new; it is a catalog with citations, and it is the
argument for why the proposals that follow are, for the most part, systematization
rather than invention.

**Personhood and bound labor** (SB:428–434, PG:191, RG:152) — chattel slavery illegal
and doctrinally blasphemous empire-wide, grounded in oath-magic (a will capable of
swearing cannot be owned). Four categories: chattel slavery (illegal), oath-bound
personal service (legal — Norr's whole system), debt-bondage/indenture (legal,
time-limited), hostage-diplomacy (a separate category, full legal personhood retained
— the Academy's own admission practice). The empire's actual crisis is reach, not the
law: the Brekelands is where the gap between statute and enforcement is worst.

**Marriage, divorce, succession** (SB:278–284, RG:153) — marriage is a real, binding
oath, sworn before a Church witness (Crownlands/loyalist provinces) or at the standing
stones (Tarnovar). Divorce is a formal Release: mutual consent plus Church sanction, or
a magistrate/Church tribunal may grant it unilaterally on proven grave breach. Titled
succession follows the Denmother's Choice — named, revisable, not bound to birth order
or blood.

**The Wolf-Price and the wolf-killing statute** (SB:292–296, PG:115, RG:122) — two
separate reckonings. The legal one: self-defense is a full defense against a
wolf-killing charge if reported to a magistrate within three days with the body
produced or accounted for. The older, non-legal one: the Wolf-Price, a debt to the
nearest shrine-keeper (or whoever locally stands in for one), owed regardless of guilt,
its size at the keeper's judgment.

**The Sanction** (SB:244–246, PG:97) — the Church's asserted sole authority to license
who may lawfully channel, interpret, or minister divine power. A sanctioned cleric
carries a pewter warrant-medal. The See of Orlath issues a rival sanction; both
churches' clerics keep their spells, and neither institution will ever be told that in
so many words.

**Chartered Thaumaturgy** (SB:248–250, PG:99) — arcane practice is licensed. A Chartered
Thaumaturge of the House of the Craft holds a charter enumerating the schools and wards
they may practice/raise. Hedge-mages work below the Charter's notice, tolerated until
something goes wrong. Rivergate sells unlicensed scrollwork; the going penalty structure
(per SB:250) has "taught practitioners to be very good or very quick" — i.e., a real
but unspecified legal risk, not a stated punishment.

**Stamped and certified goods** (SB:176–199, PG:339–343) — stamped healing potions from
a Church almonry (the stamp *is* the Sanction — "possession of unstamped potions
invites questions," not an outright crime); spell scrolls sold through a "chartered
scriptorium, purchaser entered in the register"; Rivergate's gray market runs "Everything
Certified" — provenance flexible, quality genuine, the discount priced as the legal risk.
This is already a two-part system in embryo: a physical mark (stamp/seal) plus a written
record (register/ledger) that the mark alone doesn't replace — Part Two, Book Three
below just names what's already implied.

**Instruments of office, seals, and forgery** (Session Two: Encounter C, "The Toll
That Isn't"; Session Five: "Rivergate — Defunct & Antiquarian") — Odric Hale runs a
fraudulent bridge toll on a forged "Roads Commission" writ and a dead office's seal;
his strongbox holds "a forged-seal kit (evidence...)" and "toll receipts naming
payers — paper leverage." Escorted to "capital authorities," his seal supplier becomes
"discoverable evidence." Tirell Mosse of Rivergate deals in "the seals, signets, and
letterheads of abolished institutions" — legal to *own* as curios/theatrical hire,
legal question mark to *use*. The Eastern Circuit Roads Commission is named explicitly
as a defunct office ("sixty clerks, a wax formula they took to the grave"), confirming
a real Roads Commission once existed and issued genuine toll authority — which is
exactly what makes Odric's forgery a forgery rather than freelance banditry.

**Ecclesiastical process: the Writ** (Session Five, Session Six) — the Office of Omens'
escalation ladder against an unsanctioned claimant: surveillance, a summons, a formal
Writ of Examination, custody by Church soldiers (Office Examiners, a Censor-Captain in
command) who "always attack nonlethally" and "always announce their writ first." The
Writ is explicitly "legal," can be defeated "by law, by politics, or by the collapse of
his case," and a Highcourt marker can have it quashed as "obstruction" of "an open
imperial inquiry" — meaning secular and ecclesiastical process already interact in
established play. Prelate Odell is "beaten by law, by politics, or by the collapse of
his case — never by debate and worse than never by violence."

**Provincial justice in practice** (Session One) — Magistrate Cassivar Ondrei receives
the party "in a hall that doubles as courtroom and granary office" — judge and civil
administrator in one person, in one room, which is the Ostmark's actual justice
infrastructure. He can be written to by aggrieved citizens, and his letters carry real
if slow institutional weight (Ondrei's complaint against Colonel Dessen sits in Legate
Thorne's inbox across three later documents).

**Identification** (Session Zero, PG) — the Academy Field Kit includes "a student
signet (functions as identification in imperial-loyal territory)" — confirming personal
seals/signets are the empire's actual ID system, at least for the credentialed.

**Rank usage already in the text, uncodified** (catalogued across all eleven corpus
files): Colonel (Dessen — legion garrison commander), Legate (Thorne — Palatine Guard,
capital command), Marshal (Dane — an Ostmark field commander), Sergeant (Dren, Malich —
squad-level NCOs), Censor-Captain (Odo — Church soldier commanding Office Examiners),
Ban (Dregan — Tarnovari march-warden), Warden (also Dregan's style, and the title of the
Vault construct in the Proving), Warrant (both "Warrant of Access," an archival
authorization in the Proving, and "warrant-medal," the Sanction's badge — two unrelated
senses of the same word already coexisting in canon, worth noting so a future pass
doesn't collide with itself). No document currently states how these ranks relate to
each other. CLAUDE.md lists this explicitly as an open gap.

**Street-level justice, uncodified** (same catalog) — who arrests, who judges, what
happens next is never stated as a system, only shown once, in Ondrei's hall. CLAUDE.md
lists this explicitly as an open gap too, and the Writ process shows a *second*,
ecclesiastical track already running in parallel without anyone having named the
relationship between the two.

**Regional legal status, stated but not systematized** (SB: the Atlas, Regions in
Depth) — every region's write-up already characterizes its relationship to imperial
law in prose (Crownlands: "the only place imperial law functions at full strength";
Brekelands: "imperial administration simply stopped"; Tarnovar: "openly independent for
a century"; Velmareth: Marked have "actual legal standing" there; Normere: Norr's
personal oaths "bypass all intermediate lords"). Part Three below is a table version of
sentences that already exist, not new claims about any region's status.

---

# Part Two — The Zhuvedian Laws

Public framing (usable as read-aloud or a Long Course proclamation-crier's patter):
seven Books, promulgated together this coming Solacre, each covering one domain of
imperial life. Qilvayas's own words for the project already exist in canon — "forged by
the fires of justice and cast in molds of wisdom" (SB:416) — and Archjurist Vhal is
already established as the person who holds the pen (SB:404). Nothing below requires
either character to say anything new; it fills in what they've been working on.

**DM framing, never stated at the table:** every Book below either requires witnessed,
recorded oaths (Books Two and Four) or narrows where personal/informal power can
substitute for accountable process (Books One, Six, Seven). That is by design and
already-approved canon (SB:370, "a legal code that makes oaths enforceable, witnessed,
and recorded is... a starvation regimen against the thing beneath his city. He has
built the only real weapon by institutional instinct"). This draft does not add to that
mechanism or explain it further — it only makes sure the *statutes themselves*, which
were always going to need content, are the ones that actually do the starving. Players
never need to know why the Laws are shaped this way; they just need the Laws to be
usable at the table.

## Book One — Of Persons

Codifies the existing four-tier bound-labor framework (SB:428–434) as formal statute
for the first time, unchanged in substance. **New provision:** a registration
requirement — every oath-bound service agreement and every debt-bondage indenture
must be sworn before a witness empowered to record it (a Church witness, a magistrate,
or, in Tarnovar's case, a standing stone) to be enforceable in an imperial court. An
unwitnessed labor arrangement is not illegal, but it is not enforceable either — a
master with no recorded oath has no imperial recourse if the bound party simply walks.
This gives Book One real teeth against exactly the abuse the sourcebook already flags
(Brekelands warlord companies, "little better than bandits with armies") without
changing what's legal: it makes the *worst* practice unenforceable rather than illegal,
which is a very Justinian move and costs nothing in existing fiction.

**Explicitly deferred, not resolved here:** the legal personhood of the Marked
(tieflings). CLAUDE.md already flags this as its own gap with real dependencies on this
Book, and it deserves its own sign-off pass rather than being folded in as a rider.
What this draft *can* safely note without resolving the larger question: Velmareth
already grants the Marked "actual legal standing" (SB:103) that other jurisdictions do
not extend — which becomes Book One's one live open question, visible in Part Three's
jurisdiction table, and a clean hook for whoever runs that future draft.

> **SIGN-OFF FLAG L-1** — natural extension (bound-labor tiers unchanged) plus one new
> invention (the witness/registration requirement for enforceability). `campaign_v11.js`,
> `refguide.js`, `playerguide.js`.

## Book Two — Of Oaths and the Witness

States outright, as statute, what the setting's metaphysics has always implied but no
document has put in a magistrate's mouth: an oath is only actionable at law if it was
spoken before a witness empowered to record it. This is the legal skin over the Weight
of the Word (SB:242) and over Book One's registration rule, generalized: marriage
(already Church-witnessed, SB:278), Norr's personal oaths (already witnessed by his
assembled halls, SB:366), Tarnovar's standing stones (already the region's own witness
mechanism) all already comply without changing a word of existing text. **New
provision, purely procedural:** perjury — swearing falsely before a recognized witness
— is a distinct offense from ordinary lying, tried in the same venue the oath was sworn
in, and its penalty is always registration of the fact on the liar's own signet-record
(see Book Four) rather than a fine — a black mark that follows the person, not a debt
that can be paid off. This dovetails with the existing line "the law treats perjury as
blasphemy's cousin" (SB:242) by finally saying what that means procedurally.

Marriage/divorce/Denmother's Choice (SB:278–284) fold into this Book unchanged — they
are, after all, already the empire's most common witnessed oath.

> **SIGN-OFF FLAG L-2** — natural extension, formalizing existing metaphysics as
> statute; one new invention (perjury as signet-record, not fine). `campaign_v11.js`,
> `refguide.js`.

## Book Three — Of the Sanction and the Charter

This is the certification system in full — see Part Two-A immediately below for the
mechanism itself, which is long enough to deserve its own section.

## Book Four — Of Seals and Record

Formalizes forgery of an imperial instrument (a seal, a signet, a writ, a chartered
license) as a named offense — Odric Hale's toll scam (Session Two) and Rivergate's
document underworld (Session Five) already play this exactly as written; this Book just
gives the DM the word for it and a penalty range: restitution plus indenture (Book
One's tier two) scaled to the value of what was falsely authorized, escalating to exile
from the offending jurisdiction on a second offense. **New provision:** every chartered
or sanctioned license, and every signet issued as identification (the Academy signet,
SB:25/PG, is the clean existing example), is dual-recorded — the physical mark, and an
entry in the issuing body's register. A forger can copy wax; copying a Chartered
Scriptorium's register, an almonry's ledger, or the Academy's own roll is a different
and much harder crime — which is precisely why Rivergate's "Everything Certified"
gray market deals in *provenance*, not fabrication (SB:190–198 already says this; this
Book explains why it has to).

Retiring an office's seal (as happened to the Eastern Circuit Roads Commission,
Session Five) requires the seal's formal surrender to the Archive — explaining, for the
first time, how Tirell Mosse legitimately came to own forty dead institutions' worth of
instruments rather than having stolen them, and why his trade, while distasteful to
some, is not itself illegal.

> **SIGN-OFF FLAG L-3** — mostly new invention (the offense's name and penalty
> structure), grounded tightly in two already-played scenes. `campaign_v11.js`,
> `refguide.js`.

## Book Five — Of the Wolf

Codifies the wolf-killing statute (SB:292–296) as formal law, unchanged. No new
provisions — it is already complete as canon and simply belongs in the Laws' public
structure rather than floating as unattached doctrine.

> **SIGN-OFF FLAG L-4** — pure formalization, zero new content. `campaign_v11.js`.

## Book Six — Of the March (Military Law)

See Part Two-B (the rank ladder) for the structural content. Book Six's statutory
content is narrow and old: every subject owes the empire service in some form (already
canon, SB:548, "deliberately vague"); border-lord and warlord private forces are
tolerated as a fact of the fracture, not licensed by this Book; a legion officer who
defrauds his own men (Colonel Dessen's grain scandal, already in play) is triable by
Legate-level court-martial, appealable once to Aenodira — the mechanism Ondrei's
complaint against Dessen is, right now, quietly waiting on.

> **SIGN-OFF FLAG L-5** — new invention (court-martial venue), small and load-bearing
> for an existing loose thread (the Colonel's Reckoning hook, SB:828). `campaign_v11.js`.

## Book Seven — Of Judgment

See Part Two-C (street-level justice) for the full content — courts, magistrates,
appeal, and the secular/ecclesiastical jurisdiction split.

---

## Part Two-A — Certification and the Sanction, in Practice

This answers directly: *what does the Church's stamping of goods actually look like?*

**Three certifying authorities, three domains, already established:**

| Authority | Domain | Mark | Register |
| --- | --- | --- | --- |
| The Church (the Sanction) | Divine goods and practice — blessed potions, holy water, ordained clergy | Wax stamp (goods) or pewter warrant-medal (persons) | Parish/almonry ledger |
| The Charter (House of the Craft) | Arcane goods and practice — scrolls, wands, chartered thaumaturges | Charter seal, enumerating schools/wards | Chartered Scriptorium register |
| The Crown and guilds | Mundane trade, tolls, roads, weights and measures | Guild-stamp or Roads Commission seal | Guild rolls / Roads Commission ledger |

**The mechanism, stated plainly (new, but built entirely from Book Three/Four's
existing pieces above):** certification is always two things, never one — a physical
mark and a written entry. The mark alone proves nothing to a suspicious buyer or a
magistrate; what settles a dispute is whether the mark's matching register entry exists
and matches. This is why Rivergate's gray market can sell "genuine quality, flexible
provenance" (SB:194) — the goods are real, the *registration* is what's missing or
altered — and why forging a seal (Book Four) is a fundamentally different and harder
crime than forging a ledger entry, since the ledger usually lives somewhere the forger
never gets near.

**Consequence of unstamped/unlicensed goods or unlicensed practice — already canon,
now made explicit as a legal rule rather than a vibe:** possession or practice without
the matching mark is not, by itself, a crime. It shifts the burden: a magistrate,
Church tribunal, or Charter inspector may demand the seller or practitioner produce
their register entry on formal challenge, and failure to produce one is what actually
opens a case (for fraud, for unlicensed practice, or — if goods are involved — for
receiving something stolen or falsely marked). This is exactly the risk Rivergate
already prices into its 20% discount (SB:194) and exactly why an "unsanctioned healer
in Church lands is a theological problem" rather than an automatic criminal one
(SB:244) — the Office of Omens has to build a case, the same as anyone else.

> **SIGN-OFF FLAG L-6** — natural extension; systematizes several already-approved
> mechanics (stamps, registers, "invites questions") into one named rule, adds no new
> claim about what's legal or illegal. `campaign_v11.js`, `refguide.js`, `playerguide.js`.

---

## Part Two-B — Rank and Command

Fills the CLAUDE.md gap directly. Built entirely from ranks already in play; the only
new content is the ladder connecting them and one explanatory finding.

| Rank | Command | Body | Existing example |
| --- | --- | --- | --- |
| Legionary | Self | Imperial Legions | — |
| Sergeant | ~10 (a file) | Any regular force | Sgt. Petra Malich; the late Sgt. Varkos Dren |
| Centurion *(new)* | ~80–100 (a company) | Imperial Legions | — |
| Colonel | A garrison or single legion | Imperial Legions | Colonel Aurel Dessen, Third Provincial Legion |
| Legate | Multiple legions, or the capital's standing force; answers directly to the Throne | Imperial Legions / Palatine Guard | Legate Bruvasca Thorne |
| Censor / Censor-Captain | A detachment of Office Examiners | Office of Omens' military arm | Censor-Captain Ferrin Odo |

**Marshal is not a rung on this ladder — new finding, offered as an opportunity rather
than a correction.** Every existing text calls Gavric Dane "Marshal" while he commands
a single march's garrison — smaller, on paper, than what Legate Thorne commands.
Rather than reconcile this as an error, it resolves cleanly and *better* as a genuine
title distinction: Marshal is an acclamation the Throne grants a field commander for
extraordinary personal renown, not a step in the chain of command. Dane is a Colonel in
every functional sense (SB confirms he commands the Ostmark's garrison forces) who
has been *styled* Marshal by popular and imperial acclaim after recovering the Ninth's
standard — which is precisely why "the court hears that name and thinks of
succession" (SB:700) and precisely why it unsettles people that Qilvayas has "decorated
him twice" without ever formalizing a Legate's authority under him. The gap between
Dane's beloved title and his actual scope of command *is the court's anxiety about
him*, made structurally legible for the first time rather than left as an unexplained
tension between two documents. Costs nothing, adds a load-bearing detail to an
already-flagged thread (the Piso gun, SB:702).

**Provincial and warlord forces carry no standard rank** — "Captain" functions
empire-wide as a courtesy title for anyone commanding a company-sized irregular force
(a border lord's retinue, a warlord company, a Sarkanni mercenary contract-officer),
exactly as it already does for Odric Hale's four "professionals" and for the generic
military-Craft-track career path already listed at the Academy (SB:476, "personal
guards to nobility, mercenary company leaders"). This needs no new invention; it is
already how the text uses the word.

> **SIGN-OFF FLAG L-7** — mostly new invention (the ladder, Centurion), plus one
> opportunity finding (Marshal-as-acclamation) that resolves existing tension without
> contradicting anything. `campaign_v11.js`, `refguide.js`.

---

## Part Two-C — Street-Level Justice

Fills the CLAUDE.md gap directly, built from the one scene that already shows it in
play (Ondrei's hall, Session One) and the one parallel system already shown in play
(the Church's Writ, Sessions Five–Six).

**In the Crownlands and loyalist provincial towns:** there is no separate civilian
watch — order-keeping is a standing duty of whatever legion or garrison detachment is
posted locally (in Aenodira itself, the Palatine Guard). This is not a new invention so
much as the absence of one: no civilian police force appears anywhere in nine
documents, and a Byzantine-inspired empire running its garrisons double-duty as the
peace is the natural reading, not a gap needing an invented institution. A magistrate
— exactly Ondrei's model, judge and civil administrator combined in one office and
often one room — receives complaints, hears testimony (oath-testimony carries real
evidentiary weight per Book Two; a witness who swears falsely commits the more serious
offense), and rules. There is no jury. Sentencing is the magistrate's own judgment
within the Laws' ranges (fines, restitution, indenture per Book One, rarely worse).

**Appeal exists but is slow and it matters that it is slow:** a case can be escalated
to Aenodira — exactly the mechanism Ondrei's complaint against Colonel Dessen is
already using, three years and counting, still sitting in Legate Thorne's inbox
(SB:61, 802, 828). This is not a new rule; it is naming what the sourcebook already
depicts as normal and grinding.

**Two parallel tracks, not one — new, but only in the sense of naming a relationship
two already-written processes clearly have.** Secular justice (magistrates, garrison
custody, appeal to Aenodira) and ecclesiastical justice (the Office of Omens' Writ
process — surveillance, summons, Writ of Examination, nonlethal custody by Censors) run
side by side and can conflict. A Highcourt political favor can quash a Church writ as
"obstruction of an open imperial inquiry" (Session Six, already played) — meaning
secular authority *can* override ecclesiastical process when it musters enough
political weight, but only as an exceptional intervention, not a routine appeal. This
single sentence is the entire relationship; it needs no further mechanism, and it is
exactly what the table already showed working in Session Six.

**Outside the loyalist provinces, in thin country:** no resident magistrate at all in
much rural land — disputes fall to whoever locally holds informal authority: a village
elder, a shrine-keeper (the Wolf-Price's existing "old woman in a village with no
shrine at all who has simply always been the one people pay," SB:296, generalizes
cleanly to ordinary disputes, not just wolf-deaths — this is an opportunity finding,
not new invention, since the sourcebook's own wording already describes a general
customary-arbiter role and only applies it to one case).

**In the Brekelands, and anywhere warlord-held:** no magistrate, no appeal. The local
warlord or his captains are judge, jury, and enforcement, full stop — this is not new;
SB:434 already says imperial statute "has not reached everywhere," and this section
just states the practical consequence for a party standing in front of Skarn or Voss
with a grievance: there is no court to bring it to.

> **SIGN-OFF FLAG L-8** — mostly systematization; two small new inventions (garrison
> double-duty as the Watch; the secular/ecclesiastical override rule) built tightly
> from played scenes. `campaign_v11.js`, `refguide.js`.

---

# Part Three — Where Imperial Law Ends: The Jurisdiction Map

Every claim below is already stated in the Atlas prose (SB, Regions in Depth); this
table just gives the DM one page to check instead of ten. The five status categories
are new naming, not new claims — see the citation column.

| Region | Status | Who actually enforces | Cite |
| --- | --- | --- | --- |
| The Crownlands | **Direct Rule** — imperial law at full strength | Palatine Guard; imperial magistrates | SB:59 |
| The Ostmark | **Loyalist Provincial** — imperial law nominal, unevenly enforced | Thin legion garrisons; Magistrate Ondrei's model | SB:61 |
| The Suthmark | **Loyalist Provincial** — genuinely loyal, governed through the ducal house | Duchess Vasq's household authority + Church presence | SB:63 |
| Principality of Tarnovar | **Sovereign Treaty-Nation** — imperial law does not apply | Oath-custom; the Voivode; Ban Dregan's Fence (unsanctioned even internally) | SB:65 |
| Free City of Velmareth / Delta Compact | **Sovereign Treaty-Nation** — own mercantile law and council governance; Marked hold actual legal standing here, uniquely | Harborlords; the Compact's own courts | SB:69, 103 |
| The Brekelands | **Contested / Warlord** — imperial statute on the books, unenforced | Individual warlords; no appeal exists | SB:71, 107, 434 |
| The See of Orlath | **Parallel Legal-Religious Authority** — rejects both the Matriarchate and the Office of Omens; preparing its own coronation | Olvesa's See; its own rival Sanction | SB:73, 246 |
| Kingdom of Ardven | **Sovereign Treaty-Nation** — an independent, literate, expansionist crown | Karvel's own developing law | SB:75, 115 |
| The Skellvard | **Non-Territorial Customary Law** — no fixed land, no codified statute | Clan lawspeakers; tally-sticks record debts and broken promises | SB:77, 694, 1117 |
| The Duchy of Normere | **De Facto Replacement** — imperial law formally still claimed, functionally superseded | Duke Norr's personal-oath system + the Reckoning Book | SB:79, 736–738 |

**One explicit non-resolution, flagged so it isn't mistaken for an oversight:** this
table notes Velmareth's unique grant of legal standing to the Marked without expanding
it into a general doctrine of Marked personhood empire-wide. That is deliberately
deferred to its own future sign-off pass per CLAUDE.md's existing gap list — this table
only needed to be honest about where the one confirmed exception already sits.

> **SIGN-OFF FLAG L-9** — pure systematization; every cell cites existing prose, no new
> claims about any region's status. `campaign_v11.js`, `refguide.js`.

---

# Opportunities Surfaced Along the Way

**O-1. The Grey-Gold Rising now has a spark.** The sourcebook's own hook (SB:837) names
the trigger as "the Zhuvedian Laws' tax provisions" without specifying one. Book Four's
registration requirement for chartered goods is a clean, textured candidate: a new
wager-tax on Long Course betting, enforceable only through the same Charter/Guild
registry this draft already builds, is exactly the kind of provision race-day factions
would unite against — and ties the riot mechanically to the Laws being promulgated,
not just thematically. Offered as an option, not a commitment; the DM may prefer a
different provision when the arc is actually built.

> **No sign-off required** — observation only, does not alter this draft's other
> content whether adopted or not.

**O-2. Rivergate's tagline is no longer just color.** "Everything Certified" (SB:190)
reads, after Book Three/Four, as a precise and funny claim rather than a loose one: the
goods and the marks are both often genuine, since forging a register is the actually
hard crime.

> **No sign-off required** — observation only.

**O-3. Odric Hale's arrest, if it happens, is now a clean statute application.**
Session Two already asks the DM to adjudicate his toll scam; Book Four gives it a name
(forgery of an imperial instrument) and a penalty shape (restitution + indenture,
scaling to exile on repeat) without changing anything about how the scene already
plays.

> **No sign-off required** — observation only.

---

# Sign-Off Checklist

| # | Item | Kind | Scripts on approval |
| --- | --- | --- | --- |
| **L-1** | Book One — bound labor (unchanged) + witness/registration for enforceability | Extension + new invention | `campaign_v11.js`, `refguide.js`, `playerguide.js` |
| **L-2** | Book Two — the Witness requirement for oaths; perjury as signet-record | Extension + new invention | `campaign_v11.js`, `refguide.js` |
| **L-3** | Book Four — forgery of an imperial instrument; dual mark+register system; seal retirement to the Archive | New invention, tightly grounded | `campaign_v11.js`, `refguide.js` |
| **L-4** | Book Five — the Wolf-Price, formalized as statute | Pure formalization | `campaign_v11.js` |
| **L-5** | Book Six — court-martial venue for officer misconduct | New invention | `campaign_v11.js` |
| **L-6** | Part Two-A — certification mechanism (mark + register; burden-shift on challenge) | Systematization | `campaign_v11.js`, `refguide.js`, `playerguide.js` |
| **L-7** | Part Two-B — rank ladder (Centurion new); Marshal-as-acclamation finding | New invention + opportunity | `campaign_v11.js`, `refguide.js` |
| **L-8** | Part Two-C — street justice (garrison-as-Watch; appeal to Aenodira; secular/ecclesiastical override) | Systematization + small new invention | `campaign_v11.js`, `refguide.js` |
| **L-9** | Part Three — the jurisdiction map | Pure systematization | `campaign_v11.js`, `refguide.js` |
| **O-1–O-3** | Opportunities (Grey-Gold spark, Rivergate tagline, Odric's statute) | Observations | No script changes required; texture for future session-building |

Note on Book Three (Of the Sanction and the Charter): its content lives entirely in
Part Two-A above (flag L-6) — listed as its own Book for the Laws' public structure,
but there is no separate sign-off item; approving L-6 approves Book Three.

---

# Propagation Plan

On approval, one consolidated pass, one commit, per the project's batch discipline.

1. **`scripts/campaign_v11.js` first.** Add a new Part — "The Zhuvedian Laws" — placed
   after "Law, Oath, and Bound Labor" (SB:428) and before "The Mystery of Empress
   Nyreeza," since it belongs to the Qilvayas section and the existing bound-labor
   paragraph becomes Book One's lead-in rather than a standalone note. Add the
   certification mechanism (L-6) as a subsection near the existing Sanction/Charter
   material (SB:244–254). Add the rank table (L-7) near the Academy's House of the
   Sword material or as its own short subsection. Add street justice (L-8) near
   Geography and Locations or as part of the new Laws section. Add the jurisdiction
   table (L-9) as a table appended to "Atlas of the Fractured Empire" (SB:55).
2. **`scripts/refguide.js`.** Mirror all of the above as quick-lookup tables — this is
   exactly the kind of wide, scannable content the single-column DM Reference Guide
   exists for. Add the jurisdiction map, the rank ladder, and a compact Books
   One–Seven summary table.
3. **`scripts/playerguide.js`, authored not copied.** Expand the existing "Law and
   Bound Labor" section (PG:191) to mention the Witness requirement and the
   certification mechanism in player-facing language — both are safe: neither reveals
   DM-only material, and both give players concrete, usable facts ("an unwitnessed
   labor deal isn't enforceable," "an unstamped potion isn't illegal, just risky to
   carry"). The rank ladder and jurisdiction map are also safe for the Player Guide
   as written — nothing in either leaks DM-only material. Book Four's forgery
   provisions are safe as flavor. Skip Book Six's Colonel's Reckoning cross-reference
   if it's still being held as a background thread rather than run.
4. **`tools/build.sh`**, then verify: confirm the build's escape-leak and
   font-substitution checks pass, and scan the regenerated `QS_Player_Guide.md` for any
   DM-only string before calling the pass done.

Estimated scope: three scripts (sourcebook, reference guide, player guide), no session
module needs to change — every existing played scene (Ondrei's hall, the toll scam,
the Writ, the Wolf-Price) already conforms to this draft by construction, which was the
design goal throughout: fill the gaps around what's already been played, not rewrite
what's already been played.
