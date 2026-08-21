# RESOLVED — applied to canon

Approved as drafted, no redlines. Applied to `campaign_v11.js` and `playerguide.js`; the
optional `refguide.js` cross-reference was left out (not requested). Kept for the record;
no longer pending.

---

# Design Draft — The Golden Tablets, in Fragment

*The Qilvayas Symphony — small exercise: actual quoted text from the Golden Tablets*

**Status: draft for review. No canon has been modified.**

## Why this needs sign-off despite its size

Small in word count, but it touches the Founding Myth's central DM-only secret directly
(SB, "The Turning Away": the Tablets were "composed BY the witnesses... the
self-exoneration document of the people who looked away"). This draft doesn't change
that truth — it dramatizes it for the first time as actual quotable text, and adds one
new detail (the colophon line below) that a sharp player could theoretically connect to
the Witness Hall before it's meant to be revealed. Per CLAUDE.md, anything touching the
Founding Myth gets proposed, not written straight to canon, regardless of length.

## The idea

Six short fragments, in an older, cruder, more proclamation-than-statute voice —
plausible as what a two-thousand-year-old sacred text sounds like next to Qilvayas's
new, procedural Zhuvedian Laws. Each is genuinely public: the kind of line a Seal-house
student memorizes, a priest quotes in a sermon, or a mason once carved over a courthouse
door. Nothing in the quotes themselves is a secret. What's DM-only is what they're all
conspicuously missing, and one line's second meaning.

**The fragments, with the source domain they precede in the Zhuvedian Laws:**

1. *(Preamble)* "By the will of the Lupine Matron and the true voice of her chosen son,
   Zhuvedus, is this Empire raised, and these words set down that all who come after may
   know the order of things."
2. *(precedes Book One, Of Persons)* "No free soul may be bound as chattel, for the wolf
   does not cage her cubs, and what can vow cannot be owned."
3. *(precedes Book Two, Of Oaths)* "Let every vow be kept, for a broken word is a wound
   upon the pack."
4. *(precedes Book Five, Of the Wolf)* "He who spills wolf-blood without cause shall
   answer to the pack's keeper, and the price shall be paid in full before the moon
   turns."
5. *(precedes the Denmother's Choice, under Marriage as Oath)* "The Throne descends to
   whom the sitting wolf names before the pack, living or dying, and the pack shall know
   no other law of blood."
6. *(colophon — the closing/attribution line)* "Set down in the year of the founding, by
   those who stood witness to the covenant of the Throne, that the memory of that day
   never fade."

**The DM-only annotation (does not appear in the Player Guide):** Read against the new
Laws, what the fragments never do is the point. Clause 3 says a vow should be kept and
never says how anyone would know it was made, or by whom, or prove it was broken — no
witness, no record, no venue. Book Two exists to close exactly that silence, and
Qilvayas has no idea why closing it matters. Clause 4 is the "older law only implied"
self-defense the sourcebook already promises exists (SB:256) — now with actual words,
and they still don't say "self-defense," because the Tablets never define what excuses
a wolf's death at all; they only set the price. And clause 6 is the quiet one: the
Tablets call their own authors "those who stood witness" — true, and the worst possible
word for what the Witness Hall's assembly actually did. Any Seal-house character who has
memorized the colophon their whole life is, without knowing it, quoting the exact
self-description of the people who un-witnessed a god's covenant. It should never be
explained at the table. Let a player notice it, or don't; either way it is already true
the moment the frieze is found (Session Seven) and lands harder for having been sitting
in a courtroom inscription the whole campaign.

**Placement.** A new short subsection, "The Golden Tablets, in Fragment," opening The
Zhuvedian Laws part — the six numbered quotes as a blockquote-style list, public and
unannotated, immediately followed by the DM Only annotation paragraph above (bracketed
DM Only, as the sourcebook already does elsewhere). Mirror the six quotes only (no
annotation) into the Player Guide's Zhuvedian Laws section as brief opening flavor — a
sentence introducing them as "lines every Academy student can still recite" plus the
quotes themselves is enough; the annotation stays sourcebook/DM Reference Guide only.

> **SIGN-OFF FLAG GT-1** — new invention, directly touching Founding Myth DM-only
> material (no change to the existing secret, one new supporting detail: the colophon's
> irony). `campaign_v11.js`, `playerguide.js`. Optional: one line in `refguide.js`'s
> Core Mythology section cross-referencing the colophon, at Josh's discretion.

## Propagation plan, on approval

1. `campaign_v11.js` — insert the new subsection at the top of the existing Zhuvedian
   Laws part, before Book One.
2. `playerguide.js` — insert the six quotes only (no annotation) at the top of the
   existing Zhuvedian Laws section.
3. `refguide.js` — optional one-line cross-reference in Core Mythology at a Glance,
   only if Josh wants the colophon's irony flagged for the DM's own quick lookup.
4. `tools/build.sh`, verify, scan the Player Guide for leakage, commit.

Estimated scope: one small addition to two scripts (three if the optional refguide line
is wanted). No other document needs to change.
