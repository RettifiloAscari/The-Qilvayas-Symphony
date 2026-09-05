const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat,
        Table, TableRow, TableCell, WidthType, ShadingType, TableLayoutType } = require('docx');
const fs = require('fs');

const { stagePath } = require('./stage');
// ---------- helpers ----------
const P = (text, opts = {}) => new Paragraph({
  spacing: { after: 200 }, ...opts,
  children: [new TextRun({ text, ...(opts.run || {}) })]
});
const PS = (segs, opts = {}) => new Paragraph({
  spacing: { after: 200 }, ...opts,
  children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i, color: s.c }))
});
const DM = (t) => ({ t, b: true, c: "5B1F1F" });   // DM-only marker: bold book-red
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, keepNext: true, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, keepNext: true, children: [new TextRun(t)] });
const BULLET = (segs) => new Paragraph({
  numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 },
  children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i, color: s.c }))
});
const B = (lead, rest) => PS([{ t: lead + " ", b: true }, { t: rest }]);
const BUL = (lead, rest) => BULLET(lead ? [{ t: lead + " ", b: true }, { t: rest }] : [{ t: rest }]);
const NUMBERED = (segs, instance = 0) => new Paragraph({
  numbering: { reference: "numbers", level: 0, instance }, spacing: { after: 120 },
  children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i, color: s.c }))
});
// An enumerated list numbers itself. Writing the number into the text instead
// leaves the glyph in place beside it, which is what "1." next to a bullet is.
// Every list sharing an instance numbers straight through, so a second list in
// the same document needs a fresh one.
const NUM = (lead, rest, instance = 0) => NUMBERED(
  lead ? [{ t: lead + " ", b: true }, { t: rest }] : [{ t: rest }], instance);
const { Table: LTable, TableRow: LRow, TableCell: LCell, WidthType: LW, ShadingType: LS, TableLayoutType: LL } = require('docx');
// Column widths in twips. docx-js emits a dummy equal-width <w:tblGrid> when
// columnWidths is absent, and LibreOffice honours that grid over the per-cell
// percentages -- every table renders with evenly split columns. Passing the
// grid explicitly, with a fixed layout, is what makes the widths array mean
// anything. Proportions are what matter; tblW=100% governs the total.
const CW = (w) => { const t = w.reduce((a, b) => a + b, 0); return w.map((x) => Math.round(9026 * x / t)); };

const lcell = (text, opts = {}) => new LCell({ width: { size: opts.w || 20, type: LW.PERCENTAGE }, shading: opts.head ? { type: LS.CLEAR, fill: "E4DCCB" } : undefined, margins: { top: 50, bottom: 50, left: 45, right: 45 }, children: [new Paragraph({ spacing: { after: 0 }, alignment: AlignmentType.LEFT, indent: { firstLine: 0 }, children: [new TextRun({ text, bold: !!opts.head, size: 18 })] })] });
// Body rows may split across a column break. cantSplit here would stop the whole table
// from flowing into the next column, and LibreOffice answers that by dropping the rows
// that no longer fit -- silently, with the build reporting clean. The header row keeps
// cantSplit and repeats above the continuation instead.
const ltable = (headers, widths, rows) => new LTable({ width: { size: 100, type: LW.PERCENTAGE }, columnWidths: CW(widths), layout: LL.FIXED, rows: [ new LRow({ cantSplit: true, tableHeader: true, children: headers.map((h, i) => lcell(h, { head: true, w: widths[i] })) }), ...rows.map(r => new LRow({ children: r.map((v, i) => lcell(v, { w: widths[i] })) })) ] });


// Boxed read-aloud text
const BOX = (text) => new Paragraph({
  spacing: { after: 200 },
  shading: { type: ShadingType.CLEAR, fill: "EFEAE0" },
  indent: { left: 360, right: 360 },
  children: [new TextRun({ text, italics: true })]
});

// Stat block helpers
const mod = (v) => { const m = Math.floor((v - 10) / 2); return (m >= 0 ? "+" : "\u2212") + Math.abs(m); };
const abCell = (text, bold) => new TableCell({
  width: { size: 16.6, type: WidthType.PERCENTAGE },
  shading: bold ? { type: ShadingType.CLEAR, fill: "E4DCCB" } : undefined,
  children: [new Paragraph({
    keepNext: !!bold, alignment: AlignmentType.CENTER, spacing: { after: 40, before: 40 },
    children: [new TextRun({ text, bold: !!bold, size: 20 })]
  })]
});
const SB = (d) => {
  const out = [];
  out.push(new Paragraph({
    keepNext: true,
    spacing: { before: 240, after: 40 },
    children: [new TextRun({ text: d.name, bold: true, size: 26, color: "5B1F1F" })]
  }));
  out.push(PS([{ t: d.meta, i: true }], { keepNext: true, spacing: { after: 120 } }));
  out.push(B("Armor Class:", d.ac));
  out.push(B("Hit Points:", d.hp));
  out.push(B("Speed:", d.speed));
  out.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: CW([1, 1, 1, 1, 1, 1]),
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({ cantSplit: true, children: ["STR", "DEX", "CON", "INT", "WIS", "CHA"].map(h => abCell(h, true)) }),
      new TableRow({ cantSplit: true, children: [d.str, d.dex, d.con, d.int, d.wis, d.cha].map(v => abCell(v + " (" + mod(v) + ")")) })
    ]
  }));
  out.push(P("", { spacing: { after: 60 } }));
  if (d.skills) out.push(B("Skills:", d.skills));
  if (d.saves) out.push(B("Saving Throws:", d.saves));
  if (d.resist) out.push(B("Damage Resistances:", d.resist));
  if (d.vuln) out.push(B("Damage Vulnerabilities:", d.vuln));
  if (d.senses) out.push(B("Senses:", d.senses));
  if (d.langs) out.push(B("Languages:", d.langs));
  out.push(B("Challenge:", d.cr));
  (d.traits || []).forEach(t => out.push(PS([{ t: t.n + ". ", b: true, i: true }, { t: t.t }])));
  if (d.actions && d.actions.length) {
    out.push(PS([{ t: "ACTIONS", b: true }], { keepNext: true, spacing: { before: 80, after: 80 } }));
    d.actions.forEach(a => out.push(PS([{ t: a.n + ". ", b: true, i: true }, { t: a.t }])));
  }
  if (d.reactions && d.reactions.length) {
    out.push(PS([{ t: "REACTIONS", b: true }], { keepNext: true, spacing: { before: 80, after: 80 } }));
    d.reactions.forEach(a => out.push(PS([{ t: a.n + ". ", b: true, i: true }, { t: a.t }])));
  }
  return out;
};

const docShell = (children) => new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 280, hanging: 280 } } }
      }]
    }, {
      reference: "numbers",
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 280, hanging: 280 } } }
      }]
    }]
  },
  styles: {
    default: { document: { run: { font: "Georgia", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Georgia", color: "3B2F2F" },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 27, bold: true, font: "Georgia", color: "3B2F2F" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, italics: true, font: "Georgia", color: "3B2F2F" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } }
    ]
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    children
  }]
});

const title = (children, main, sub) => {
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [new TextRun({ text: main, bold: true, size: 40 })]
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 100 },
    children: [new TextRun({ text: "The Qilvayas Symphony", italics: true, size: 24 })]
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 360 },
    children: [new TextRun({ text: sub, italics: true, size: 22, color: "5B1F1F" })]
  }));
};

// ============================================================
// DOC A \u2014 SESSION 0 PRIMER
// ============================================================
const cA = [];
title(cA, "Session Zero: Foundations", "A table-setting primer for the Dungeon Master \u2014 4 to 6 players, characters starting at 3rd level");

cA.push(H1("Purpose of This Session"));
cA.push(P("Session Zero is played out of character. Its job is to produce five things before dice ever hit the table: a party with all three academy houses represented, a shared history that explains why these specific people trust each other, an admission story for each character that hands the DM a personal thread to pull later, a named mercenary company the players are invested in founding, and a common understanding of tone. Everything below serves one of those five outputs."));
cA.push(P("The party begins as final-year students at the Imperial Academy of the Lupine Throne, already a cohesive unit, currently away from the capital completing their final field exercise. Session Zero establishes how they became that unit; Session One opens with the exercise already underway."));

cA.push(H1("Character Creation Rules"));
cA.push(BUL("Level:", "3rd. This puts subclasses online for every class and lets the party absorb the Session One climax without a tuned kid-gloves encounter."));
cA.push(BUL("Ability Scores:", "27-point buy or standard array (15, 14, 13, 12, 10, 8), DM\u2019s preference. Avoid rolled stats for this campaign \u2014 the political and social pillars punish a party with a dump-stat face."));
cA.push(BUL("Hit Points:", "Maximum at 1st level, average (rounded up) at 2nd and 3rd."));
cA.push(BUL("Races and Sources:", "DM\u2019s discretion. Note that Drow carry imperial resonance in this setting \u2014 the Emperor himself is Drow \u2014 so a Drow PC is a statement, not just a stat line. Worth a conversation if anyone picks one."));
cA.push(BUL("Equipment:", "Standard class and background starting equipment, plus the Academy Field Kit: an academy uniform and house insignia, a student signet (functions as identification in imperial-loyal territory), a writing kit, and a 25 gp field stipend remaining from the exercise advance."));
cA.push(BUL("Advancement:", "Milestone leveling recommended. Suggested pace: 4th level after the meeting with the Seeress concludes (early Session Three); 5th at the close of the Proving (end of Session Four); 6th at the Second Seal (end of Session Six). XP totals are listed in the session documents for tables that prefer XP."));

cA.push(H1("House Selection and Party Balance"));
cA.push(P("Each character selects a primary house per the class placement guide in the campaign sourcebook (summarized below). Left entirely alone, most parties skew heavily toward House of the Craft, because it is deliberately the catch-all for casters and specialists. That skew will make Session One harder than it needs to be. Before backgrounds get locked, ask the table directly: who wants to be the one who fights, who wants to be the one who talks, who wants to be the one who notices things. Aim for at least one Sword-primary and one Seal-primary (or Seal-flavored) character in any group of four or more."));
cA.push(B("House of the Sword:", "Barbarian, Fighter, Monk. Paladins whose concept is a warrior shaped by faith."));
cA.push(B("House of the Seal:", "Paladins who see themselves as religious champions first; Clerics with a doctrinal or pastoral focus."));
cA.push(B("House of the Craft:", "Artificer, Bard, Cleric, Druid, Ranger, Rogue, Sorcerer, Warlock, Wizard."));
cA.push(P("Every character should also name one cross-training discipline from a house other than their primary \u2014 a single sentence is enough (\u201Ctook two years of siege engineering,\u201D \u201Cstudied contract law,\u201D \u201Ctrained with the legion quartermasters\u201D). This costs nothing mechanically. It exists so the DM can hand out moments of expertise later, and because cross-training is the academy\u2019s entire institutional philosophy."));

cA.push(H1("Admission Stories"));
cA.push(P("The capital academy admits through a lottery that is less fair than it appears. Each player chooses (or rolls d6) an admission story. Each one hands the DM a thread: a family, a patron, a debt, a home region, a resentment. Record these \u2014 they are the cheapest personal hooks the campaign will ever get. Anchor each story to a real place: the sourcebook\u2019s Atlas of the Fractured Empire names the regions (the loyalist Ostmark and Suthmark, the warlord Brekelands, the merchant delta of Velmareth, the See of Orlath, and the rest), and an admission story tied to a named territory becomes a plot hook the moment that territory enters play. One flag: a Drow character is now an even larger statement than before \u2014 the Drow are the Founder\u2019s Blood, the dynasty\u2019s own nearly-vanished people, and a Drow stranger will be read as dynastic kin, claimant, or something without a name (see the sourcebook, Peoples of the Empire, before allowing one). A character from Tarnovar is a statement of similar order, and worth a private conversation \u2014 the DM should read the Atlas entry\u2019s DM-only note before allowing it, and no Tarnovari character should begin play knowing anything their culture itself does not know."));
cA.push(NUM("Lottery Winner:", "A genuine winner. Talented, probably common-born, owes nobody anything \u2014 and is quietly resented by classmates who know how rare that is. Thread: the home community that celebrated them, and what it expects back."));
cA.push(NUM("The Donation:", "A wealthy family made a generous gift to the academy, and admission followed. The character knows it. Thread: the family\u2019s expectations, and whether the character intends to meet them."));
cA.push(NUM("The Hostage:", "A son or daughter of a border lord or ambitious noble, kept close to the capital to ensure a parent\u2019s good behavior. In law this is hostage-diplomacy, a formal category and emphatically not bondage: the character retains full legal personhood and is owed treatment as an honored, if constrained, guest (see the sourcebook, Law, Oath, and Bound Labor). Whether their actual experience has matched that standard is the character\u2019s to decide. Thread: the parent\u2019s politics, and what happens back home if relations with the throne sour."));
cA.push(NUM("The Prot\u00E9g\u00E9:", "A regional lord or power spotted talent and sponsored it, expecting a return on the investment. Thread: the patron, and the first favor they will eventually call in."));
cA.push(NUM("The True Believer:", "Sought admission out of genuine conviction \u2014 in the empire, the Lupine Matron, or the Emperor\u2019s restoration. Thread: what happens to faith when the institution disappoints it."));
cA.push(NUMBERED([{ t: "The Quiet Irregularity: ", b: true }, { t: "The paperwork says lottery. It wasn\u2019t \u2014 a forged record, a bribed clerk, a swapped name. The character may not even know who arranged it, or why. Thread: whoever did it, and what they wanted. (" }, DM("DM note: "), { t: "this one is a gift \u2014 it can be wired into any faction later.)" }]));

cA.push(H1("Forging the Party"));
cA.push(P("The academy houses students in mixed residential halls by year and cohort, so the party plausibly shared a dormitory for four years. Do not just assert the bond \u2014 co-author it. Put these questions to the table and let players answer in any order, building on each other:"));
cA.push(BUL(null, "What incident in your first or second year turned you from hallmates into allies? (A hazing gone wrong, an unfair accusation one of you took the blame for, a house competition you conspired to win.)"));
cA.push(BUL(null, "Which earlier field exercise did you survive together, and what went wrong on it? (This is the party\u2019s shared war story. It should have gone badly enough to matter.)"));
cA.push(BUL(null, "Each player, name one thing you trust absolutely about the character to your left, and one habit of theirs that drives you mad."));
cA.push(BUL(null, "Who first said, out loud, \u201Cwe should do this for ourselves after graduation\u201D \u2014 and who took the most convincing?"));
cA.push(H2("The Company"));
cA.push(P("Have the players name their future mercenary company during Session Zero, before the campaign begins. This is deliberate. The company is the party\u2019s shared dream \u2014 the plan the vision is about to interrupt \u2014 and it lands much harder if it is their invention rather than a line of backstory. Let them argue about the name. Let them design a charter, a motto, a rule (\u201Cwe never work for slavers,\u201D \u201Cequal shares, always\u201D). Every rule they write is a promise \u2014 and in this campaign, promises are load-bearing. Write them all down."));


// ============ SESSION ZERO ADDITIONS ============
cA.push(H1("Running Session Zero: A Two-Hour Plan"));
cA.push(P("Session Zero is the only session in this campaign with no pacing budget, which is a gap, because it is the session most likely to sprawl. Two hours, six blocks. Everything below is in service of the five outputs named at the top."));
cA.push(ltable(["Block", "Minutes", "What Happens"], [26, 17, 57], [
  ["The pitch", "15", "The DM describes the setting in five sentences and the tone in three. Do not read the sourcebook aloud. Say: a fading empire, a young emperor trying to fix it, a school that trains its administrators, and a shared dream of the capital burning. Then stop talking."],
  ["Tone and lines", "20", "The safety and tone conversation below. Do this before anybody has a character they are attached to."],
  ["Houses and roles", "20", "Class, house, and the who-fights-who-talks-who-notices conversation. Aim for one Sword-primary and one Seal-flavored character in any group of four or more."],
  ["Admission stories", "25", "Roll or choose, and go round the table so each player hears the others'. This is the block most likely to run long and it is the block most worth letting run."],
  ["Forging the party", "30", "The four co-authoring questions. Answered aloud, in any order, building on each other."],
  ["The Company", "10", "Name it, describe the sign, and write it down where everyone can see it."]
]));
cA.push(P("The DM has one more thing to open tonight, and it is not a player-facing document: the standing sheet. Twelve factions, one number each from zero to five, all of them at zero this evening, moved once at the end of every session (see the sourcebook, Standing: What the Empire Remembers). Every session module closes with a note on what moved and why, and the whole system is a page of arithmetic that turns the campaign\u2019s politics from a thing the DM remembers into a thing the DM can read. Open it beside the Branch Ledger before Session One and fill in both at the same time, or neither will get filled in at all. One warning, kept from the players for as long as possible: the Office of Omens is the score they should want low, and its number will go up whether they earn it or not."));

cA.push(H1("Tone, Lines, and the Conversation Before the Campaign"));
cA.push(P("This campaign includes an empire that keeps people in bound labor, a church that conducts trials for lycanthropy, a massacre of worshippers at a festival, a district burned to end a rebellion, and a village where servant girls do not come home. All of it is written to be taken seriously rather than used for shock, and none of it works if somebody at the table is enduring it politely."));
cA.push(B("What to say.", "Name the heavy material out loud, before characters exist. The list above takes ninety seconds to read and it is the whole of the obligation. Then ask two questions and take the answers without discussion: is there anything here you would rather this campaign did not go near, and is there anything here you actively want it to. One further check belongs in the same breath and is easy to forget, because it is about the shape of the campaign rather than its content: this campaign poses questions with no clean answer, and whether the empire should be restored at all is genuinely contestable rather than rhetorical. A table that wants a clear villain will be unhappy for eight sessions and it is far kinder to find that out now."));
cA.push(B("The second question matters as much as the first.", "A player who says I want the bound-labor material to be real is telling the DM where to aim, and the campaign is far better for knowing. The Bound-Freed background in the Player\u2019s Companion exists because somebody will want it."));
cA.push(B("How to stop something mid-session.", "Agree one word, out loud, that any player including the DM can say to move the camera. It needs no explanation at the time and no discussion afterward unless the person wants one. Agree it now, in Session Zero, so that using it later is a procedure rather than an interruption."));
cA.push(B("What this campaign will not do.", "State it plainly so nobody has to wonder: sexual violence is not depicted, described, or implied on screen anywhere in this corpus, and the Greywell material is written specifically to be horror about disappearance and complicity rather than about what happens to the girls. Harm to children happens off screen and is referred to rather than shown. If the table wants either line drawn differently, that is the table\u2019s to decide, and Session Zero is when."));

cA.push(H1("What the Players Should Know, and What They Should Not"));
cA.push(P("Hand out the Player Guide and the Player\u2019s Companion before or at Session Zero. Both are written to be read by players and neither contains a spoiler. Everything a character would plausibly have learned in eighteen years of imperial life is in them."));
cA.push(B("Safe to know.", "The empire\u2019s history and its fracture. The Matron, the Aspects, the saints, the Vigil. The Atlas and the powers who hold each region. The calendar, the money, the titles, and how to address a Prelate without embarrassing yourself. The Academy, its houses, and the Proving\u2019s existence as a rumor students argue about."));
cA.push(B("Not to know, and worth guarding.", "The content of the Founding Myth beyond its official version. The binding site and what is under the Old Forum. That Tarnovar descends from Threnvos\u2019s people. That the Proving is real, and that it is coming. Anything about the shadow\u2019s mechanism \u2014 the campaign works because the players discover that broken oaths feed something, and a player who is told it in Session Zero has been robbed of the best thing this campaign does. And if a player builds a paladin or a cleric, resist the urge to foreshadow early. Their moment comes in the dark under the Old Forum, seven sessions out, and it will be worth the wait."));
cA.push(PS([DM("DM Only: "), { t: "the single most common way this campaign gets spoiled is a DM who is proud of the mechanism and cannot resist signposting it. Do not. Seed it constantly, confirm it never, and let the first player who says it out loud at the table have that moment entirely to themselves." }]));

cA.push(H1("Twelve Company Names, If the Table Stalls"));
cA.push(P("The Company block asks the players to name themselves and it is the one part of Session Zero that reliably deadlocks. Offer these only after ten minutes of genuine deadlock, and offer them as bad examples \u2014 a table will name itself instantly out of spite, which is the intended effect."));
cA.push(ltable(["d12", "Name", "d12", "Name"], [11, 39, 11, 39], [
  ["1", "The Lector\u2019s Seal", "7", "The Eleventh Cohort"],
  ["2", "The Patched Standard", "8", "Ondrei\u2019s Correspondents"],
  ["3", "The Cold Door Company", "9", "The Unlicensed"],
  ["4", "Three Houses", "10", "The Quiet Irregularity"],
  ["5", "The Redwatch Concern", "11", "Kin of Great Timberwolf"],
  ["6", "The Fourth Book", "12", "The Lamp Left Burning"]
]));
cA.push(B("A note on the sign.", "Whatever the company calls itself, decide what its sign looks like, because it will be painted on a door, stamped in wax, and eventually recognized across a street by somebody who wishes them harm. A company with a sign is a company the world can react to."));

cA.push(H1("The First Five Minutes of Session One"));
cA.push(P("End Session Zero by describing where Session One opens, so nobody arrives cold: the party is four days east of the capital, on a field exercise that has three days left to run, in a market town called Dravenna, and a magistrate is about to ask them for a favor he has no authority to ask. Nothing has gone wrong yet. That is the last time that sentence will be true."));

cA.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "~", size: 24 })] }));
cA.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u201CWe are the Kin of Great Timberwolf\u201D", italics: true })] }));

// ============================================================
// DOC B \u2014 SESSION 1: THE SILENT ROAD
// ============================================================
const cB = [];
title(cB, "Session One: The Silent Road", "An adventure for 4\u20136 characters of 3rd level \u2014 the final field exercise, and the night everything changes");

cB.push(H1("Overview"));
cB.push(P("The party\u2019s final field exercise: a provincial magistrate in the river town of Dravenna, in the loyalist eastern march called the Ostmark (see the sourcebook\u2019s Atlas), has requested academy assistance with a string of caravan disappearances on the Ostmark trade road. The season is Harvestide \u2014 early autumn, the tail of the Academy\u2019s traditional Hay\u2013Harvestide exercise window, with the Suthmark\u2019s harvest festival underway far to the south and the eastern roads in their last good weeks before Vinmoon turns them to mud. The culprits are deserters from a provincial legion \u2014 oath-breakers, in the campaign\u2019s most literal sense \u2014 holed up in a ruined watch-fort and increasingly desperate. The party investigates, tracks them down, and resolves the situation by steel or by parley. That night, celebrating a job well done, they receive the shared vision that changes everything."));
cB.push(P("Designed for a five-hour session. Suggested pacing budget: Dravenna and the briefing (40 minutes); the ambush site and Yanna (55 minutes); the trail and the scout picket (30 minutes); Redwatch \u2014 scouting the nine areas and choosing an approach (25 minutes) and the approach itself, however they take it (75 minutes); resolution and the celebration at the Gilded Ford (45 minutes); the Vision (30 minutes, unhurried). At this length both the looter encounter and the scout picket are standard content, not optional. If the table runs long anyway, the celebration and Vision must not be cut \u2014 compress the road instead."));
cB.push(B("Where the keyed fort fits.", "The twenty-five scouting minutes above are the whole of the Redwatch keying: a party that circles the fort and finds the well shaft, the fallen west wall-walk, and the horses in R3 has bought itself three plans, and the approach that follows is faster and far better for it. The signal-tower puzzle at R9 sits outside the core budget and runs 20 to 30 minutes \u2014 take it from the celebration if the table has gone quiet, or hold it for the return journey, where it lands just as hard."));

cB.push(H2("What Is Actually Happening (DM Only)"));
cB.push(P("Eight soldiers of the Third Provincial Legion deserted four months ago after their commander, Colonel Aurel Dessen, sold off the garrison\u2019s winter grain and blamed the shortfall on them. Led by Sergeant Varkos Dren, they fled east, turned to robbery to eat, and occupied the ruined imperial watch-fort called Redwatch. They have hit four caravans in six weeks. They have killed \u2014 twice, both times when a guard fought back \u2014 and the killings sit badly on most of them."));
cB.push(P("Here is the part the party cannot yet understand: since breaking their oaths of service, every one of them suffers the same recurring nightmare \u2014 storm clouds, a burning city they have never seen, and something vast moving behind the dark. The entity beneath the capital does not know them and has not chosen them; but broken oaths resonate with it, and the deserters have become faintly audible to something that has been listening for two thousand years. Dren, whose oath ran deepest \u2014 he defaced his own legion oath-medallion the night he fled \u2014 has it worst. He has barely slept in a month, and something of the dark has begun to bleed through him. None of this should be explained in this session. It exists so that when the party receives the same imagery in their vision hours later, the DM knows the echo is real \u2014 and so the campaign\u2019s central mechanism (betrayal feeds the shadow) is present from the very first fight, invisible and waiting to be rediscovered much later."));
cB.push(P("A quieter thing sits under the season, DM-only and never spelled out for players: it is Harvestide, and the calendar makes this an anniversary week twice over. The Vintage Night fell in Harvestide six years ago; Empress Nyreeza vanished in Harvestide three years ago. Neither is Dravenna\u2019s tragedy, but the Ostmark keeps the Matron\u2019s calendar like everyone else, and the season carries it: the Vigil Hall tolls a mourning peal at dusk for southern dead the town never knew, a widow or two keeps a candle no one asks about, and the older folk call this stretch of Harvestide \u201Cthe thin week\u201D without being able to say why. Seed it as weather, not clue. It is here so that when Vaelindra later dates the acceleration to \u201Cthree years ago, almost to the season,\u201D a player who was paying attention in Dravenna feels the floor move."));
cB.push(P("One more thing hangs in Dravenna\u2019s Vigil Hall, and it is not a secret \u2014 it is the oldest open joke in the Ostmark. On the north wall, in the row of saints\u2019 icons, there is a gap: a rectangle of unfaded plaster where something hung for two centuries, with a lamp still burning under it and fresh oil in the lamp. Ask, and you will be told cheerfully and at ordinary volume that it is Ovric\u2019s, that the Synod struck him from the canon ninety years ago, that the decree never said why, and that the Ostmark parishes never stopped keeping his light. Nobody in Dravenna thinks this is dangerous. It is simply what the parishes here do."));
cB.push(PS([{ t: "(" }, DM("DM Only: "), { t: "Ovric was struck because a Sanctum archivist working the deep stacks found what he had actually witnessed, and what he witnessed touches the Founding \u2014 see the sourcebook, Ovric, Struck from the Canon. The suppression file still exists, in the Imperial Archive\u2019s closed levels, which is precisely the sort of door a company holding the Lector\u2019s Seal can eventually reach (Session Four). Plant the blank wall in the campaign\u2019s first hour, let it be answered casually, and say nothing else about it. It is a corroborating door and never the first one, and a party that remembers a gap on a parish wall six sessions later has earned what is behind it.)" }]));

cB.push(H1("Scene 1: Dravenna"));
cB.push(BOX("Dravenna announces itself by smell before sight \u2014 river mud, tar, and fish \u2014 and then by sound: the groan of the great water-wheel at the ford. It is a town of perhaps two thousand, prosperous by border standards, its stone bridge and customs house relics of a time when imperial engineers built things to last. The imperial wolf-standard still flies over the magistrate\u2019s hall, though the flag is patched and the pole leans. People here look at your academy uniforms the way farmers look at rain clouds: potentially useful, potentially trouble."));
cB.push(H2("The Briefing"));
cB.push(P("Magistrate Cassivar Ondrei receives the party in a hall that doubles as courtroom and granary office. He is in his fifties, precise, visibly tired, and honest by the standards of provincial officials \u2014 which is to say he skims modestly and hates violence on his roads because it is bad for taxes. He lays out the facts:"));
cB.push(BUL(null, "Four caravans hit in six weeks on the Ostmark road, all within a day\u2019s ride east. Goods taken: food, coin, boots, medicine. Not luxuries \u2014 supplies."));
cB.push(BUL(null, "Two dead across the four attacks, both caravan guards who resisted. Drivers and merchants were bound, not harmed. \u201CDisciplined,\u201D Ondrei says, and the word clearly bothers him."));
cB.push(BUL(null, "The latest attack was two days ago. One survivor unaccounted for \u2014 a teamster named Yanna, who fled into the brush and has not come into town."));
cB.push(BUL(null, "Terms: 200 gp to the party for ending the attacks, plus a 25 gp bounty per bandit \u2014 payable equally for capture or proof of death. Ondrei prefers capture: \u201CDead men can\u2019t testify against whoever made them run.\u201D That line is deliberate \u2014 he already suspects deserters, and suspects their commander is the deeper rot."));
cB.push(H2("Rumors in Town (d6, or feed as desired)"));
cB.push(NUM(null, "\u201CThird Legion pay wagon never came through this spring. First time in nine years.\u201D (True; connects to the grain scandal.)"));
cB.push(NUM(null, "\u201CThe attacks are ghosts from old Redwatch. That fort\u2019s been cursed since the old wars.\u201D (False, but points at the right location.)"));
cB.push(NUM(null, "\u201CThey took a whole crate of poppy-milk off Serren\u2019s wagon. Somebody\u2019s hurt bad, or can\u2019t sleep.\u201D (True. Dren cannot sleep.)"));
cB.push(NUM(null, "\u201COne driver swears the leader talked in his sleep by their fire \u2014 begging somebody\u2019s pardon, over and over.\u201D (True.)"));
cB.push(NUM(null, "\u201CMagistrate\u2019s cousin runs the ferry and raised his rates the week the attacks started. Convenient.\u201D (True but unrelated \u2014 a red herring with local color.)"));
cB.push(NUM(null, "\u201CDogs won\u2019t go east past the old milestone anymore. Haven\u2019t for weeks.\u201D (True. Animals dislike what is bleeding through Dren.)"));

cB.push(H1("Scene 2: The Ambush Site"));
cB.push(P("Half a day east: an overturned wagon, scattered grain gone to birds, wheel ruts, and a burned cookfire. Investigation is tiered \u2014 every character who searches learns the DC 10 information automatically on a success; higher results stack additional detail."));
cB.push(BUL("DC 10 (Investigation or Survival):", "Eight to ten attackers on foot. They took food and supplies first, strongboxes second. Tracks lead northeast into the hills."));
cB.push(BUL("DC 13:", "Boot prints are legion-issue, uniform pattern and wear \u2014 these are soldiers, or were. The ambush used proper fire discipline and a bounding withdrawal: trained, coordinated, rehearsed."));
cB.push(BUL("DC 15:", "One set of prints is wrong. The stride is even but the weight is off, as though the man is lighter than his boots \u2014 and beside the cold cookfire, one patch of ground is scorched in a shape no fire makes: a long, thin shadow of a standing man, burned into the grass."));
cB.push(H2("Yanna"));
cB.push(P("A successful DC 12 Wisdom (Perception) or Survival check \u2014 or simply calling out peacefully \u2014 finds the missing teamster hiding in a culvert, dehydrated and terrified but unhurt. Yanna is in her twenties, practical, ashamed of having run. She gives the party three things if treated kindly: confirmation the attackers were soldiers (\u201Cthey moved like a wall, all together\u201D); the direction of their withdrawal (toward the Redwatch hills); and, reluctantly, one more thing she has told no one, because it sounds mad:"));
cB.push(BOX("\u201CTheir sergeant \u2014 the one giving orders. When he stood over me I looked down so he\u2019d think me no threat. And his shadow\u2026 sir, his shadow moved after he did. Just a half-beat behind. Like it was following him, not \u2014 not attached. I\u2019ve prayed on it every night since.\u201D"));
cB.push(P("Encounter: as the party finishes its investigation (or if it lingers past dusk), 4 Roadside Looters (6 for a party of five or six) arrive to pick over the wreck \u2014 local opportunists, not deserters. They flee at half strength. This is a warm-up fight and a tone-setter: the fractured empire produces scavengers, and not every armed stranger is the enemy the party is hunting."));

cB.push(H1("Scene 3: The Trail to Redwatch"));
cB.push(P("The trail runs a day northeast into dry hills. A DC 13 Wisdom (Survival) check follows it cleanly; failure costs hours and arrives at dusk rather than midday (raising the value of stealth or parley over assault). En route, the party crosses a deserter picket: 2 Deserter Scouts watching the approach from a rocky rise. The scouts\u2019 orders are to observe and report, not to fight \u2014 played well, the party can capture or bypass them; played badly, one escapes and the fort is alerted (deserters in Scene 4 cannot be surprised and begin behind their walls)."));
cB.push(P("A captured scout, questioned, is scared, exhausted, and closer to relief than defiance. He confirms the numbers (eight, counting the sergeant), the layout, and \u2014 if pressed about why they look so hollow \u2014 the nightmares: \u201CAll of us. Every night. The same burning city. Ask any man in that fort. It started when we ran.\u201D He will beg the party for mercy for the others: \u201CMost of us just didn\u2019t want to hang for the colonel\u2019s theft. Dren\u2019s the only one who\u2019s\u2026 gone somewhere we can\u2019t follow.\u201D"));

cB.push(H1("Scene 4: Redwatch"));
cB.push(BOX("Redwatch was built to watch a border that has since moved three times. What remains is a shell: a square curtain wall breached on the southern side, a gatehouse with no gate, and a single intact tower leaning against the sky like a tired sentry. Smoke rises thin from the courtyard. Somewhere inside, a man is shouting at someone \u2014 or at no one."));
cB.push(H2("The Situation Inside"));
cB.push(P("Seven deserters and Sergeant Dren occupy the fort. Morale is broken: they are sleepless, frightened of their own sergeant, and most would surrender to anyone offering terms that are not a rope. Dren is another matter. He has convinced himself that the nightmares are a hunt \u2014 that something is coming for oath-breakers \u2014 and that stopping, surrendering, or sleeping means being caught. He is, in the campaign\u2019s tragic irony, essentially correct about the first part and wrong about everything it implies. He will not surrender. He can be isolated from his men, but not saved."));
cB.push(H2("Three Approaches"));
cB.push(B("Parley:", "A party that approaches openly under peace-sign or academy colors is not fired upon \u2014 the deserters want a way out. A DC 13 Charisma (Persuasion) check (advantage if the party invokes Ondrei\u2019s capture-preference and testimony against the colonel, or if they captured a scout alive and treated him well) convinces the seven to stand down \u2014 but Dren, watching from the tower, will not have it. He attacks the parley himself, alone if he must, and any deserters not yet won over (on a failed check, all of them) fight beside him out of fear. On a successful parley, the climax becomes the party and seven grateful deserters against Dren and what comes out of him."));
cB.push(B("Stealth:", "The southern breach is unwatched at night (the deserters fear the dark now and cluster near fires). A DC 12 group Dexterity (Stealth) check reaches the courtyard undetected, allowing the party to isolate Dren in the tower or take sentries quietly. Each sentry removed before the alarm subtracts one deserter from the main fight."));
cB.push(B("Assault:", "A frontal approach means the full garrison behind walls: harder, louder, and the approach most likely to kill men who wanted to surrender. Let it be a fight; let the aftermath ask the question."));
cB.push(H2("The Climax and Scaling"));
cB.push(P("Baseline (4 characters): Sergeant Varkos Dren plus 3 Oathless Deserters, arriving in two waves (deserters first, Dren from the tower on round 2). For 5 characters: add 1 deserter. For 6: add 2 deserters, and Dren\u2019s Shadow-Touched trait activates from the start of combat rather than at half hit points. If the party negotiated the garrison down, replace the deserter allies of Dren with nothing \u2014 he fights alone, and activates Shadow-Touched immediately; the drama carries the encounter."));
cB.push(H2("When Dren Falls"));
cB.push(BOX("The sergeant drops to his knees, and for one heartbeat his face is only a tired man\u2019s face \u2014 relieved, almost. Then his shadow does not fall with him. It stays standing. It turns. Where its head should be there is nothing you can name, and from somewhere beneath the world you feel more than hear a sound: low, vast, patient \u2014 the echo of the roar from a nightmare you have not yet had. The shadow tears free of the dead man like cloth ripping, and it is hungry."));
cB.push(P("The Umbral Remnant (stat block below) attacks the nearest creature. It is a fragment, not the entity \u2014 a residue that accreted in Dren over months of resonance. It fights until reduced below half hit points or struck by radiant damage, then shrieks soundlessly and dissolves into the ground, flowing toward a crack in the earth \u2014 flowing, though no player can measure this, in the precise direction of the imperial capital. Surviving deserters flee or surrender at the sight of it; to a man, they say some version of the same thing afterward: \u201CThat\u2019s it. That\u2019s what\u2019s in the dream.\u201D"));
cB.push(H2("The Vigil at Redwatch"));
cB.push(P("Before the party leaves, there is a thing every Zhuvedian child knows and every academy graduate has been formally taught: no body goes into the ground, the water, or the stone before it has been kept through one full night\u2019s Vigil \u2014 watched, lit, never left alone \u2014 because the Matron watches the dead home, and she does it at night. It applies to deserters. It applies to oath-breakers. Doctrine is unambiguous and always has been: the Vigil is owed to the dead as dead, not as the good. The office even has a patron, and any devout character knows him without a check: Coren the Unhurried, who kept four thousand nights and refused ordination six times, shown as a short wick over a very large reservoir of oil (see the sourcebook, The Canon of Saints). A party that simply rides away from the bodies at Redwatch has done something their own training tells them is wrong, and the DM should let them feel the shape of that without lecturing \u2014 a character raised devout might simply start gathering firewood without announcing why."));
cB.push(PS([{ t: "If they keep it, give the Vigil ten quiet minutes and no dice: bodies laid out, a fire, a long night in a ruined fort, and the specific discomfort of watching over men they killed a few hours ago. This is the session\u2019s best opportunity for characters to say true things to one another, and it frequently lands harder than the fight did. Magistrate Ondrei, told of it afterward, thinks noticeably better of them \u2014 provincial magistrates notice who keeps the old forms when nobody is watching. (" }, DM("DM note: "), { t: "if a character carries Dren\u2019s medallion through the Vigil, it stays cold all night. Say nothing about it. Let them notice.)" }]));
cB.push(P("Aftermath details worth narrating: Dren\u2019s body is unnaturally light, like driftwood. Around his neck the party finds his legion oath-medallion, deliberately defaced with a knife \u2014 and cold. It stays cold, always, no matter how long it is carried. It is not magical to any detection the party can currently cast. Let a player keep it. It is the campaign\u2019s first artifact of the truth, and it will matter that someone chose to carry it."));

cB.push(H1("Scene 5: Resolution"));
cB.push(P("Ondrei pays promptly and in full \u2014 200 gp plus bounties (25 gp per deserter, captured or accounted for; a full sweep of eight pays 200 gp more). If any deserters survived to testify, Ondrei is genuinely moved, and begins quiet proceedings against the Third Legion\u2019s colonel \u2014 a thread the DM can develop or leave as background texture of a system occasionally, imperfectly working. If the party mentions the shadow, Ondrei goes very still, thanks them formally, and writes none of it down. \u201CSome reports,\u201D he says, \u201Coutlive the men who file them. Enjoy the Gilded Ford tonight, on the town.\u201D"));
cB.push(P("The evening at the Gilded Ford inn should be warm and unhurried \u2014 give it real table time. The exercise is complete; graduation is weeks away; the company they named in Session Zero is almost real. Invite each player to narrate a small moment of celebration or reflection: a toast, a letter home, an argument about the company charter, a quiet look at a cold medallion. Let them be young and finished and proud. Then they go to bed."));

cB.push(H1("Scene 6: The Vision"));
cB.push(P("Run this as follows: ask each player, one at a time, what their character dreams about on a good night \u2014 let them answer in a sentence or two, unhurried. Then, whatever each answer was, continue: \u201CAnd then the dream opens beneath you, like a floor giving way.\u201D Read the following once all players have answered, addressing the whole table:"));
cB.push(BOX("You stand on a high place you have never stood, above a city you know from engravings and lecture halls: the imperial capital, seat of the Lupine Throne. It is night, and the city is burning. The flames are the color of a dying ember and they move wrongly \u2014 upward too slowly, sideways when no wind blows, clinging to stone that should not burn. You try to cry out. Nothing in you obeys. You are present the way a witness is present: permitted to see, and nothing else. Storm clouds turn above the city, vast and slow, and your gaze is dragged upward against your will \u2014 and there, behind the clouds, something moves. Not a shape. A displacement, as if the sky were cloth and something on the far side pressed against it. It is vast beyond vastness, and it is aware, and when it sounds \u2014 not a roar heard, but a roar felt, in teeth and bone and the base of the skull \u2014 you understand that it is not arriving. It has always been here. It is waking. The dark takes everything, and you wake drenched in sweat, heart hammering, with the taste of ash on your tongue."));
cB.push(P("Then go around the table one final time: each character wakes in their room at the Gilded Ford. Let the players find each other \u2014 do not prompt it \u2014 and let them discover in their own words that the vision was identical, down to the smallest details. Characters who fought the Umbral Remnant may make the connection to the sound it made; do not confirm or deny. When the unease has fully landed, end the session. Do not run the morning after. That is Session Two\u2019s opening, and this silence is the best cliffhanger the campaign will ever get for free."));


// ============ REDWATCH, KEYED ============
cB.push(H1("Redwatch, Keyed"));
cB.push(P("The scenes above are the session. This is the fort it ends in. Nine areas, drawn so a DM can sketch it in three minutes: a square curtain wall about eighty feet on a side, a gatehouse on the south face, a two-storey keep in the northwest corner with its upper floor collapsed, a well and a stable along the east wall, and a signal-tower stump on the north-west angle that used to be twice its current height."));
cB.push(B("Why key it.", "Because the three approaches in the scene text \u2014 the front door, the wall, and the parley \u2014 only mean anything if the fort has a geography the players can reason about. A party that scouts and finds that the postern is blocked from inside, that the well shaft goes down into a cistern with a grille, and that the signal-tower stump overlooks the yard has three plans instead of one, and every one of them is theirs."));
cB.push(B("R1. The Gate.", "Double doors, one hanging. Barred from within with a beam Dren\u2019s people put there, which means the front approach is loud by design. Murder-holes above are open to the sky now \u2014 the gatehouse roof is gone \u2014 so anything dropped from them can also be shot up at."));
cB.push(B("R2. The Yard.", "Forty feet across, cobbled, with a fire pit near the center that has been in use for weeks. Two carts and a great deal of stolen property under canvas. This is where the fight happens if the party come through the gate, and it is bad ground: open, overlooked from R6 and R8, with the only cover being the carts."));
cB.push(B("R3. The Stable Range.", "Along the east wall, roofed, holding six horses and the smell of six horses. The horses are the single best lever in the fort: freed or spooked, they empty the yard, and a party who thinks of this has found a way to win without killing anyone."));
cB.push(B("R4. The Well and Cistern.", "The well works. Thirty feet down it opens into a barrel-vaulted cistern under the yard, half full, with a rusted grille at the far end opening into R5. A climb (DC 12 Athletics with a rope) and a squeeze. Nobody in the fort has been down here; it is on none of their watch rotations."));
cB.push(B("R5. The Undercroft.", "Beneath the keep: stores, mostly empty, a rack of rotted spears, and the cistern grille. Comes up into R6 by a ladder. This is the quiet way in and it is genuinely available to anyone who looks at the well and asks the obvious question."));
cB.push(B("R6. The Keep, Ground Floor.", "One room, a hearth, a table, Dren\u2019s things. What passes for the band\u2019s business is done here. The stair to the upper floor is intact for eight feet and then is not."));
cB.push(B("R7. The Keep, Upper Floor (collapsed).", "Reachable only by rope from the wall-walk. Floor joists over open air; DC 12 Acrobatics to cross, or move at half speed and be fine. Holds a locked strongbox nobody has been able to get to, which is why it is still locked."));
cB.push(B("R8. The Wall-Walk.", "Runs the full circuit at fifteen feet, intact on three sides, fallen on the west. Two lookouts, when there are lookouts. The whole yard is in view from anywhere on it, which cuts both ways."));
cB.push(B("R9. The Signal-Tower Stump.", "The northwest angle, eight feet of what was twenty. A stone brazier-cradle, cold for sixty years. It is the highest point in the fort, it overlooks everything, and it is the one place in Redwatch that is about the empire rather than about the bandits."));

cB.push(H1("The Signal Chain (Puzzle)"));
cB.push(BOX("The brazier-cradle at the top of the stump is stone, waist-high, and packed with sixty years of rain-cemented ash. Set into its rim, worn but legible, are four notches at four points of the compass, each cut to a different depth, and beside them a line of shorthand: TO THE NEXT, AND THE NEXT, AND THE NEXT, AND HOME. Below, on the inner face where somebody had to lie down to carve it, in a different hand and much later: THEY DID NOT COME."));
cB.push(P("Redwatch was one of eleven forts in a signal chain, and the notches are the chain\u2019s grammar: depth of notch is duration of flame, direction is which fort you are calling. The system worked by fire seen at distance, and it has not been lit in sixty years, and lighting it is the puzzle."));
cB.push(B("What it does.", "A fire lit correctly in the cradle is visible from the two nearest surviving forts and from the Dravenna road. Nothing answers \u2014 the chain is dead. But the smoke is visible for fifteen miles, and everything within fifteen miles that can see it will come and look."));
cB.push(B("Solution one \u2014 read it.", "DC 13 Intelligence (History), or automatic for a character with a legion or Legion Orphan background: the notches encode duration and direction. Anyone who served, or whose parent did, knows the chain existed."));
cB.push(B("Solution two \u2014 dig it out.", "The cemented ash contains sixty years of stratigraphy, and at the bottom, the last fire. DC 12 Investigation over ten minutes turns up charred wood, a scrap of unburned cloth, and a legion button. Somebody lit this beacon at the end and nobody came, and the party is holding the proof."));
cB.push(B("Solution three \u2014 just light it.", "Fill it, light it, and let it burn. This works. It does not do what the notches would have done, and it summons everything within fifteen miles indiscriminately, which in this session means a legion patrol from the Dravenna road arriving in ninety minutes \u2014 which may be exactly what the party wants and may be a disaster, depending on what is happening in the yard at the time."));
cB.push(B("Solution four \u2014 do not.", "A party that reads the cradle, understands it, and chooses to leave it cold has understood the session. Give them the same credit."));
cB.push(PS([DM("DM Only: "), { t: "the inner-face carving is from the Silvasse years. Whoever lit the last fire at Redwatch was calling for help that had already been destroyed sixty miles west, and they knew it by the time they finished carving. This is not a clue to anything. It is the Ostmark\u2019s grief, at the scale of one man with a knife, and it is the first time this campaign shows a player what the fracture actually cost. Read the second line aloud slowly." }]));

cB.push(H1("Traps and Hazards at Redwatch"));
cB.push(B("The Barred Gate (R1).", "Not a trap; an obstacle with mechanics, because parties will try to force it. The beam is oak, four inches thick, seated in iron brackets. Battering: DC 20 Strength check, or 30 damage to the doors (AC 15, resistance to piercing). Every attempt is audible throughout the fort. A knock spell opens it silently and is the single most useful 2nd-level spell in this session."));
cB.push(B("The Fallen Wall-Walk (R8 west).", "Twenty feet of collapsed stone under a fifteen-foot drop. A creature moving along the west wall-walk without checking makes a DC 12 Dexterity save or falls: 1d6 bludgeoning and prone, in full view of the yard."));
cB.push(B("The Strongbox (R7).", "Mechanical trap. The box is iron, locked (DC 15 thieves' tools), and fitted with a spring-loaded needle in the escutcheon. Trigger: opening the lock without first depressing the plate beneath it. Effect: DC 12 Dexterity save or 1 piercing damage and DC 11 Constitution save against poison \u2014 2d6 poison damage on a failure, half on a success. Detect at DC 13 Investigation. It is sixty years old and the poison is half strength, which the party has no way of knowing and which is why they should be told the save DC only after they have decided."));
cB.push(B("What is in it.", "Eleven Zhuven in obsolete coin, a fort-commander\u2019s seal, and the muster roll of the garrison that died here \u2014 thirty-one names, with the last four added in a different hand. The seal is worth nothing and opens nothing. The muster roll is the Vigil\u2019s guest list."));

cB.push(H1("Encounters on the Eastern Road"));
cB.push(P("For the trail out from Dravenna, and for any return. Roll a d8 per half-day, or use these when the party is between beats."));
cB.push(ltable(["d8", "What Happens"], [11, 89], [
  ["1", "A carter with a shed load and a bad axle, four hours from anywhere, who will pay in information about who else is on this road."],
  ["2", "Wolves at a distance, pacing the road, unhurried. Everybody present has an opinion about which way they crossed."],
  ["3", "A legion patrol of four, under-supplied, who want news and a look at anything the party is carrying east."],
  ["4", "Two of Dren\u2019s scouts, out on picket, who have not yet been told the party is coming."],
  ["5", "An empty watch-fort on a height, one of the chain, with nothing in it but the same cold brazier-cradle."],
  ["6", "A pilgrim walking to Lupenna the long way round, on foot, for a reason he will explain at length."],
  ["7", "A dead horse, three days old, with the harness cut away and the brand burned out."],
  ["8", "Nothing, and the road is emptier than it should be for the season, and every local the party asks says so too."]
]));

cB.push(H1("Handouts \u2014 Session One"));
cB.push(H2("Handout A \u2014 Ondrei\u2019s Commission"));
cB.push(BOX("From the court of the Magistrate at Dravenna, in the Ostmark. To the bearers, being students of the Imperial Academy upon field exercise: you are asked, and not commanded, to determine what has become of the road traffic between this town and the eastern crossings, three trains being now overdue. You are not asked to fight anyone. You are asked to find out, and to come back, and the second of those is the part I care about. \u2014 C. ONDREI, Magistrate."));
cB.push(H2("Handout B \u2014 The Last Muster Roll (found at R7)"));
cB.push(BOX("REDWATCH, THE CHAIN, STATION SIX. Thirty-one names in a clerk\u2019s hand, ruled and dated. Below them, four more, written larger, with a different pen and no date: OSRIC. HALE THE YOUNGER. TOBB. THE BOY FROM SERREN\u2019S MILL, WHOSE NAME I DID NOT ASK."));
cB.push(P("Note for the DM: the last four were added by whoever carved THEY DID NOT COME. If the party keeps the Vigil at Redwatch, this roll is what they read the names from, and the fourth name is the one that will get somebody at the table."));
cB.push(H1("Stat Blocks"));
SB({ name: "Roadside Looter", meta: "Medium humanoid (any race), neutral",
  ac: "12 (leather armor)", hp: "11 (2d8 + 2)", speed: "30 ft.",
  str: 11, dex: 12, con: 12, int: 10, wis: 10, cha: 10,
  senses: "passive Perception 10", langs: "Common", cr: "1/8 (25 XP)",
  traits: [{ n: "Scavenger\u2019s Nerve", t: "The looter has disadvantage on saving throws against being frightened. It flees when reduced to half its hit points or when half its group has fallen." }],
  actions: [
    { n: "Club", t: "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 3 (1d4 + 1) bludgeoning damage." },
    { n: "Sling", t: "Ranged Weapon Attack: +3 to hit, range 30/120 ft., one target. Hit: 3 (1d4 + 1) bludgeoning damage." }
  ] }).forEach(x => cB.push(x));
SB({ name: "Deserter Scout", meta: "Medium humanoid (any race), neutral",
  ac: "13 (leather armor)", hp: "16 (3d8 + 3)", speed: "30 ft.",
  str: 11, dex: 14, con: 12, int: 11, wis: 13, cha: 11,
  skills: "Nature +4, Perception +5, Stealth +6, Survival +5",
  senses: "passive Perception 15", langs: "Common", cr: "1/2 (100 XP)",
  traits: [{ n: "Keen Hearing and Sight", t: "The scout has advantage on Wisdom (Perception) checks that rely on hearing or sight." },
           { n: "Sleepless", t: "The scout has disadvantage on saving throws against being frightened, and against effects that would put it to sleep it instead automatically fails. (It has not truly slept in weeks; part of it wants to.)" }],
  actions: [
    { n: "Multiattack", t: "The scout makes two shortsword attacks or two shortbow attacks." },
    { n: "Shortsword", t: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage." },
    { n: "Shortbow", t: "Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage." }
  ] }).forEach(x => cB.push(x));
SB({ name: "Oathless Deserter", meta: "Medium humanoid (any race), neutral",
  ac: "14 (worn chain shirt)", hp: "19 (3d8 + 6)", speed: "30 ft.",
  str: 14, dex: 12, con: 14, int: 10, wis: 11, cha: 10,
  skills: "Athletics +4, Perception +2",
  senses: "passive Perception 12", langs: "Common", cr: "1/2 (100 XP)",
  traits: [{ n: "Legion Discipline", t: "While within 5 feet of another Oathless Deserter, the deserter has a +1 bonus to AC (drilled shield-line habits die hard)." },
           { n: "Haunted", t: "The deserter has disadvantage on saving throws against being frightened. If it witnesses the Umbral Remnant, it must succeed on a DC 13 Wisdom saving throw or drop its weapons and flee or surrender." }],
  actions: [
    { n: "Multiattack", t: "The deserter makes two spear attacks." },
    { n: "Spear", t: "Melee or Ranged Weapon Attack: +4 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 5 (1d6 + 2) piercing damage, or 6 (1d8 + 2) piercing damage if used with two hands to make a melee attack." }
  ] }).forEach(x => cB.push(x));
SB({ name: "Sergeant Varkos Dren", meta: "Medium humanoid (human), neutral evil (by despair, not design)",
  ac: "15 (studded leather, shield fragments)", hp: "58 (9d8 + 18)", speed: "30 ft.",
  str: 16, dex: 14, con: 14, int: 11, wis: 9, cha: 12,
  saves: "Str +5, Con +4", skills: "Athletics +5, Intimidation +3, Perception +1",
  senses: "passive Perception 11", langs: "Common", cr: "3 (700 XP)",
  traits: [{ n: "Shadow-Touched", t: "While Dren is below half his hit point maximum (or from the start of combat, for a party of six), his weapon attacks deal an extra 3 (1d6) necrotic damage, and his shadow visibly moves a half-beat behind his body." },
           { n: "No Way Back", t: "Dren has advantage on saving throws against being frightened and against any effect that would charm him into standing down. He cannot be talked into surrender \u2014 only into fighting alone." },
           { n: "Final Tearing", t: "When Dren is reduced to 0 hit points, the Umbral Remnant erupts from his body in his space and rolls initiative. Dren cannot be returned to life by any means available at this tier; the body is unnaturally light." }],
  actions: [
    { n: "Multiattack", t: "Dren makes two longsword attacks." },
    { n: "Longsword", t: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) slashing damage, or 8 (1d10 + 3) slashing damage if used with two hands." },
    { n: "Heavy Crossbow", t: "Ranged Weapon Attack: +4 to hit, range 100/400 ft., one target. Hit: 7 (1d10 + 2) piercing damage." }
  ],
  reactions: [
    { n: "Parry", t: "Dren adds 2 to his AC against one melee attack that would hit him. To do so, he must see the attacker and be wielding a melee weapon." }
  ] }).forEach(x => cB.push(x));
SB({ name: "Umbral Remnant", meta: "Medium undead (residue), chaotic evil",
  ac: "12", hp: "16 (weakened fragment; see Dissolution)", speed: "40 ft.",
  str: 6, dex: 14, con: 13, int: 6, wis: 10, cha: 8,
  skills: "Stealth +4 (+6 in dim light or darkness)",
  resist: "acid, cold, fire, lightning, thunder; bludgeoning, piercing, and slashing from nonmagical attacks",
  vuln: "radiant",
  senses: "darkvision 60 ft., passive Perception 10", langs: "\u2014", cr: "1/2 (100 XP)",
  traits: [{ n: "Amorphous", t: "The remnant can move through a space as narrow as 1 inch wide without squeezing." },
           { n: "Dissolution", t: "When the remnant is reduced below half its hit points, or the first time it takes radiant damage, it emits a soundless shriek every creature within 60 feet feels in its teeth, then dissolves into the ground and is gone. It flows, unerringly, in the direction of the imperial capital \u2014 though no character can know this yet." }],
  actions: [
    { n: "Umbral Touch", t: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 9 (2d6 + 2) necrotic damage, and the target must succeed on a DC 12 Wisdom saving throw or be frightened of the remnant until the end of its next turn." }
  ] }).forEach(x => cB.push(x));

cB.push(H1("NPC Profiles"));
cB.push(H3("Magistrate Cassivar Ondrei"));
cB.push(P("Human, 50s, precise, tired, provincial-honest. Speech pattern: short declaratives, dislikes adjectives, pauses before anything that costs money. Wants his roads safe and the deserters\u2019 colonel exposed. Will remember the party \u2014 favorably or otherwise \u2014 and provincial magistrates write letters. He is a small, renewable ally if treated well, and the first entry in the party\u2019s reputation ledger."));
cB.push(H3("Yanna"));
cB.push(P("Human teamster, 20s, practical, ashamed of surviving by running. If the party treats her kindly, she turns up again \u2014 the campaign can use a recurring teamster who owes the party her life and hears everything on the roads. Speech pattern: hedges everything (\u201CI don\u2019t say it was, I say it looked like\u201D) except the one thing she is certain of: the shadow moved wrong."));

cB.push(H1("Optional Content (Beyond the Five-Hour Core)"));
cB.push(B("The Cellar Problem (~30 minutes):", "The Gilded Ford\u2019s proprietor, hearing the party are academy-trained, sheepishly asks for help with the haunted cellar \u2014 scratching in the walls, bottles knocked over, \u201Ca cold presence.\u201D It is a badger. A large, indignant badger that has tunneled in behind the wine racks and regards the cellar as conquered territory. Play the investigation absolutely straight; let paranoia bloom; let the reveal be ridiculous. Design function beyond the laugh: it teaches the table, one session before it matters, that not every strange thing is the metaplot \u2014 a calibration the campaign will quietly rely on. Reward: free lodging for life at the Gilded Ford, and a story the party will retell for years."));
cB.push(H1("Diverging Paths (DM Only)"));
cB.push(P("Outcomes here echo forward. Record them in the DM Reference Guide\u2019s Branch Ledger."));
cB.push(BUL("Deserters spared vs. killed:", "Survivors who testify give Ondrei a real case against Colonel Dessen \u2014 the Colonel\u2019s Reckoning hook fires with strength, and the party gains standing witnesses in the Ostmark. A full-lethality resolution guts the case: Dessen likely survives his inquiry, remains in grade, and remembers who ruined his quiet arrangement, and either way he learns the party\u2019s names. Where the thread runs next is Kolvess, two days north on the legion spur: Dessen is still in post there, and the quartermaster\u2019s clerk Hobb Tallow keeps a second set of books that would end him and has spent three years waiting for somebody trustworthy to ask a direct question (see the Gazetteer, Kolvess). Ondrei\u2019s own complaint is eleven months old \u2014 he wrote it about the grain long before the men ran, which is exactly why he takes the desertion personally \u2014 and it is sitting unanswered on Legate Bruvasca Thorne\u2019s desk in the capital. That is the true shape of the Colonel\u2019s Reckoning: not a villain to corner, but a letter nobody has read, and a party who can now make somebody read it."));
cB.push(BUL("Parley vs. assault at Redwatch:", "A parley resolution seeds the party\u2019s reputation as problem-solvers rather than killers \u2014 word travels ahead of them on the roads (advantage on first-impression Persuasion with Ostmark commonfolk). An assault reputation closes some doors and opens others: certain warlords\u2019 recruiters take notice."));
cB.push(BUL("Yanna\u2019s treatment:", "Treated kindly, she becomes a recurring road-contact and, much later, a witness whose testimony about \u201Cthe sergeant\u2019s shadow\u201D matters. Dismissed or frightened, she vanishes into the teamster circuits and the campaign loses its only civilian eyewitness to the first manifestation."));
cB.push(BUL("The medallion:", "If no player chooses to carry Dren\u2019s medallion, do not force it \u2014 but note that Vaelindra\u2019s Session Two question (\u201Chas anything cold come into your possession?\u201D) lands differently, and the Session Three and Six cold-resonance beats need an alternate carrier (Ondrei forwards it to the capital as evidence, where it can resurface)."));
cB.push(BUL("Standing moved this session:", "The Ostmark is where this party stops being nobody, and the moves are small on purpose. The Imperial Legions rise if the party stood where they said they would and brought men back rather than bodies \u2014 that faction\u2019s whole rule is that you stayed, and a full-lethality sweep of eight men who wanted to surrender does not raise it and may not move it at all. The Church of the Lupine Matron rises a tier if the Vigil was kept at Redwatch, and it is the cheapest tier in the campaign: no clergy witnessed it, nobody was told, and provincial parishes hear everything anyway. The Law Commission stays at Unknown for now; Ondrei\u2019s case against Dessen is the road to it. Nothing rises with the Office of Omens tonight, which is the correct number and the last time it will be."));
cB.push(H1("Loot and Found Rewards \u2014 Session One \u2014 Redwatch"));
cB.push(ltable(["Find","Value / Effect"],[40,60],[
  ["The deserters\u2019 cache (robbed caravans)","87 gp mixed coin, 30 gp trade goods \u2014 returnable to Dravenna\u2019s merchants; returning it is worth more than keeping it (reputation, and Ondrei notices)"],
  ["Legion medical stores","2 potions of healing \u2014 old stock, Church-stamped, still good"],
  ["Dren\u2019s medallion","Canon \u2014 now formalized as a homebrew item (below)"],
  ["Dren\u2019s legion shortsword","Mundane, masterwork-kept, unit-engraved \u2014 evidence for the Dessen case, and a soldier\u2019s effects owed to somebody"]
]));

cB.push(H2("Encounter Heat \u2014 DM Awareness (Validation Pass)"));
cB.push(P("Two flags from the mechanical audit, for awareness rather than revision: the Oathless Deserters deal 10\u201312 damage per round \u2014 CR 1-grade output at a CR 1/2 label \u2014 so the Redwatch climax runs hotter than its adjusted-hard budget suggests for a fresh 3rd-level table; and the Deserter Scouts are glass cannons (high damage, 16 hp) whose Pack Tactics amplify hard when they focus fire. Neither needs changing \u2014 the yield thresholds and parley paths are the pressure valves \u2014 but know the stove is on."));
cB.push(H1("Rewards and Advancement"));
cB.push(P("Coin: 200 gp contract + up to 200 gp in bounties + 34 gp in scattered strongbox recoveries at Redwatch. Items: Dren\u2019s defaced oath-medallion (cold, nonmagical to current detection, significant later); a legion-issue map of the border district (grants advantage on navigation checks in the region); the recovered poppy-milk crate (worth 40 gp to an apothecary, or goodwill if returned to its owner). XP for tables using it: roughly 1,450\u20131,900 depending on encounters run \u2014 in either system, the party should remain 3rd level tonight and reach 4th early in Session Three, after the Seeress."));

cB.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "~", size: 24 })] }));
cB.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u201CThat\u2019s it. That\u2019s what\u2019s in the dream.\u201D", italics: true })] }));

// ============================================================
// DOC C \u2014 SESSION 2: THE ROAD BACK
// ============================================================
const cC = [];
title(cC, "Session Two: The Road Back", "An adventure for 4\u20136 characters of 3rd level \u2014 the journey to the capital, and the woman with the still waters");

cC.push(H1("Overview"));
cC.push(P("The morning after the vision, the party must return to the capital regardless of what they decide about the dream \u2014 their field exercise concludes with a formal report to the academy, and graduation is weeks away. The road home becomes a tour of the fractured empire at ground level: a checkpoint that answers to no one in particular, refugees from a war nobody declared, and a toll collected on forged authority. In the capital, an old archivist points them toward the only person who might explain what happened to them \u2014 and the session ends in a modest apartment with blue shutters, across a table from Vaelindra of the Still Waters."));
cC.push(P("Designed for a five-hour session, which comfortably fits all three road encounters \u2014 run them all, in any order. Suggested pacing budget: the morning after (40 minutes); the road encounters (45 minutes each, 135 total); the approach to Aenodira, run as its six beats (30 minutes); the academy and the archivist, including the catalogue (55 minutes); finding Vaelindra (40 minutes). The Vaelindra scene must end the session on her confirmation, not her explanation \u2014 hold the full conversation for Session Three\u2019s opening. If time runs short, trim the toll bridge to its reveal-and-fold beat rather than cutting it entirely; its thematic note is worth thirty seconds even in passing."));
cC.push(B("A note on the two expanded scenes.", "The approach is thirty minutes that used to be twenty, and it earns the difference: everything the campaign later does to this city depends on the players having loved it once. The archivist\u2019s catalogue is fifty-five minutes that used to be forty-five, and the extra ten are the search itself \u2014 do not resolve it on a single check to save them. If the whole session is running hot, the road encounters are the compressible part; the capital is not."));

cC.push(H1("Scene 1: The Morning After"));
cC.push(P("Open at the Gilded Ford\u2019s common room at dawn. Do not summarize \u2014 let the party have the conversation. Useful questions to let hang in the air: Do they tell anyone? (Their exercise supervisor expects a report; does the dream go in it?) Do they still graduate and found the company as planned? Does anyone try to rationalize it \u2014 shared meal, shared stress, the thing at Redwatch preying on their minds? A character proposing the rational explanation should be allowed to \u2014 and should privately notice it does not survive contact with the details: six people do not dream the same engraving-perfect view of a city most have never visited, down to the count of the towers."));
cC.push(P("Academy characters know (no check needed) that prophecy and omens are Church jurisdiction \u2014 and that reporting a shared apocalyptic vision through official channels means clergy, questions, and possibly a heresy inquiry into whether they invited it. That institutional chill is worth making explicit early: it explains why the road to answers will run through quiet referrals instead of official ones."));

cC.push(H1("Scene 2: The Road \u2014 Three Encounters"));
cC.push(P("The journey to the capital takes four days by the imperial road. These encounters are modular and reorderable. None is primarily a combat encounter; each is the fractured empire teaching the party what restoration is actually up against. Combat statistics are provided in case the party chooses steel \u2014 the empire will not stop them from learning things the hard way."));

cC.push(H2("Encounter A: The Checkpoint at Varn\u2019s Crossing"));
cC.push(BOX("The imperial road narrows at a stone bridge, and across it stands a barrier of sharpened stakes that is definitely not imperial engineering. Soldiers in half-familiar colors \u2014 imperial cut, but the wolf on their tabards has been re-stitched over with a black elk \u2014 wave wagons into a queue. A hand-painted board reads: ROAD LEVY. 5 SILVER THE HEAD. BY ORDER OF LORD OSTREV, PROTECTOR OF THE CROSSING."));
cC.push(P("Sergeant Petra Malich commands twelve Provincial Soldiers. Lord Ostrev is a minor border lord, nominally loyal to the throne, who has decided that \u201Cprotecting\u201D this stretch of imperial road entitles him to tax it \u2014 a legal fiction with no imperial authorization whatsoever. Malich knows it, hates it, and enforces it, because her men have not been paid in anything but Ostrev\u2019s scrip for a year."));
cC.push(P("She introduces herself in the Ostmark manner, which gives the party the whole of it in four words if anyone is listening: Petra Malich, of the Third. She is the same legion the deserters at Redwatch belonged to, and she is standing on this bridge for the same reason they ran \u2014 the Third\u2019s pay stopped coming, a colonel sold what it was owed, and the men who did not desert took a border lord\u2019s scrip instead because scrip is not nothing. A party who heard the pay-wagon rumor in Dravenna four days ago (rumor 1) can put this together at the table with no check at all, and it changes the whole encounter: the woman collecting an unlawful toll is the other half of last session, the half that stayed. Say so out loud to her and she will not thank the party for it, and she will also not deny it, and she will want to know what happened at Redwatch. Tell her the truth about the seven who wanted to surrender and she has to stand there and hold that in front of her men."));
cC.push(PS([{ t: "(" }, DM("DM Only: "), { t: "this is the connective tissue between the first two sessions and it is free. Malich is the Dessen scandal\u2019s living cost, and if the party is later in a position to break Dessen \u2014 Tallow\u2019s second books at Kolvess, Ondrei\u2019s eleven-month-old complaint on Legate Thorne\u2019s desk \u2014 she is the witness who makes it stick, and the only one who gains anything from it. She will not volunteer. She will answer if asked directly, once, by people who kept faith with her at the crossing.)" }]));
cC.push(P("The interesting choice: academy signets exempt students from provincial tolls on imperial roads \u2014 by law. Invoking that law is legally airtight and socially explosive: Malich\u2019s face hardens, the queue of farmers watches students in capital uniforms walk free of a toll the farmers must pay, and the party gets its first taste of what imperial privilege looks like from underneath. Paying quietly, arguing the law, negotiating for the whole queue, or making a scene are all valid \u2014 there is no clean answer, which is the point. A DC 14 Charisma (Persuasion) check gets Malich talking honestly if the party is respectful: about pay, about Ostrev, about the last imperial inspector who came through (\u201Cfour years ago; he took notes and a bribe, in that order\u201D). Fighting twelve soldiers is possible and foolish; Malich\u2019s orders are to collect, not to die, and she yields the crossing rather than lose men \u2014 then reports it, and the party has made an enemy of a lord."));
cC.push(P("What almost no party thinks to do is walk the fifty yards to the customs house. Varn\u2019s Crossing has a real one, and a real imperial tollmaster in it: Havel Corse, eleven years in post, scrupulous to the point of tedium, four weeks behind on the trade registration Book Three added to his workload and painfully aware of it (see the Gazetteer, Varn\u2019s Crossing). He has watched Ostrev\u2019s stakes go up on his bridge and he has no soldiers. What he has is eleven years of obsessive record: every crossing, every wagon, every day, including the day the levy started and every coin taken since. He will copy it out for anyone who asks, because nobody has ever asked, and he will not carry it to the capital himself, because his family lives here. A party that thinks of the building rather than the barricade leaves this encounter holding a dated, signed, documented case against a lord \u2014 which is exactly what the Law Commission eats (see the sourcebook, Standing: it rises when you produce evidence that survives contact with a hearing). It fixes nothing today. It is a far better weapon than the sword they did not draw, and it is the third answer to a scene built to look like it only has two."));

cC.push(H2("Encounter B: The People from Halvenne"));
cC.push(BOX("You smell the woodsmoke before you see them: forty-odd people camped in the ditch-shadow of the imperial road, in the organized misery of people who have done this before. Cookfires, bundles, a mule that has been asked for too much. An old woman sits on a milestone as though it were a throne, watching you approach with the unhurried attention of someone who has already seen everything she was afraid of."));
cC.push(P("Refugees from Halvenne, a market village in the Brekelands two weeks west, burned in a skirmish between the companies of the warlords Bettra Skarn and Ilmarch Voss \u2014 the Granary War, as the sourcebook\u2019s Atlas has it: not a war, nothing so organized; a dispute over a granary that became a fire that became forty homeless families. They are walking to the capital because the old woman, Semya, remembers her grandmother saying the throne feeds its own. Nobody has the heart to tell her how long ago that was."));
cC.push(P("What this encounter is for: charity with real texture (the party has money now; what does it buy, and what can\u2019t it?), information (Semya\u2019s people passed three other burned villages this season \u2014 the border situation is worse than capital dispatches admit), and one quiet seed, delivered unprompted if the party is kind. Semya says:"));
cC.push(BOX("\u201CYou\u2019re young for whatever\u2019s riding you. I\u2019ll tell you what I told the priest at Halvenne, before it burned: the dogs have been howling at nothing since the spring. The wells taste of ash where no fire\u2019s been. My grandmother had a word for a season like this one. She called it an indrawn breath.\u201D"));
cC.push(P("Semya knows nothing concrete \u2014 she is not a seer, just old and paying attention. That is precisely why she matters: the world itself has begun registering what the party saw in the vision. If the party helps her people (coin, escort for a day, a letter to Ondrei recommending Dravenna take them in \u2014 that last is the elegant solution, and he will), Semya blesses them in the old country way and the campaign gains forty grateful witnesses in whatever place they land. If the party does nothing, the Halvenne refugees reach Aenodira anyway and disappear into Farrowgate, the district along the Long Wall where the fractured empire\u2019s displaced accumulate \u2014 and the party may meet them there again, in worse circumstances, wondering if anyone could have helped."));
cC.push(P("DM texture (optional, unremarked): a few among the band keep the northern rite, and at dusk they hold a brief roadside Vigil \u2014 a ring of small stones, a shared candle, a plain Orlathine cadence the party has no reason to recognize. It is Harvestide, and they are keeping the season\u2019s dead the way the north does. If asked, Semya says only, \u201CWe lost people in the south, some years back. This is the week for it.\u201D She means the Vintage Night, six years gone this week, and will not say the name to strangers. Players need not connect it to anything; it is the same season tolling under a different roof."));
cC.push(P("There is a second thing under that roadside rite, and Semya will say it plainly to anyone who sits down with them: nobody kept the Vigil at Halvenne. There was no one left to keep it and nothing left to keep it in, and their dead went into the ground unwatched, which by every doctrine in the empire is a wound rather than a burial. It is why she keeps the ditch-side rite so exactly, weeks later and a hundred miles on, for people she has already buried \u2014 she is paying an arrears she knows cannot be paid. She does not ask the party for anything. She is simply the first person in this campaign to say out loud what an unkept Vigil costs."));
cC.push(PS([{ t: "(" }, DM("DM Only: "), { t: "she is right, and she is right literally. Halvenne is thin-written ground and getting worse \u2014 the cold boundary moves outward by a field\u2019s width a season, and the ghouls there are far past what a burning explains (see the Gazetteer, Halvenne). This is the campaign\u2019s entire mechanism at village scale, delivered in Session Two by an old woman with no idea she is describing it. Do not explain it and do not let anyone else. A party that kept the Vigil at Redwatch three days ago and hears this now holds both halves of the thesis, and will not put them together for six sessions, which is exactly right.)" }]));

cC.push(H2("Encounter C: The Toll That Isn\u2019t"));
cC.push(BOX("The last river crossing before the capital district is a fine old imperial bridge \u2014 and a new chain across it, and a table, and a man in very good clothes behind the table, flanked by four professionals whose knuckles say they were not hired for their handwriting. The man smiles like a document with a seal on it. \u201CBridge maintenance assessment,\u201D he says. \u201COne Zhuven the wagon, two strands the walker. All proper. I have the writ.\u201D"));
cC.push(P("A carter waiting behind them, not quite under his breath: \u201CA wolf. He means a wolf.\u201D Nobody who handles coin for a living calls it a Zhuven, and the correction is the first thing about this bridge that is genuinely true."));
cC.push(P("Odric Hale is a racketeer with excellent paperwork. His writ is real parchment with a real wax seal \u2014 of the Office of the Imperial Roads Commission, Eastern Circuit, an office abolished sixty years ago. He bought the dead seal from a dealer in such things and has been farming this bridge for a season. A DC 13 Intelligence (History or Investigation) check \u2014 or any Seal-house character who handles the writ, automatically \u2014 spots the anachronism instantly. But the sharper move is the one the Zhuvedian Laws actually provide, and a Seal-house character knows it cold: the seal proves nothing on its own. Book Three\u2019s test is the register \u2014 challenge him to produce the entry that matches the mark, and he cannot, because the office that kept the register has been dead for sixty years. This is a gift of a moment for a law-focused character: the first time their education simply wins, and it wins by procedure rather than by trivia. Plant it here; Session Five is built on the same rule."));
cC.push(P("Confronted, Odric calculates: he folds instantly before force or credible legal threat (DC 12 Intimidation or Persuasion once the writ is exposed \u2014 he is a businessman, not a soldier), offers a 20 gp \u201Cadministrative apology,\u201D and decamps to try again elsewhere unless the party escorts him to capital authorities, which they can. His enforcers fight only if the party attacks first, and abandon him at half strength. Scaling, if it does come to blows: baseline (4 characters) is Odric plus 3 Bridge Enforcers. For 5 characters, add 1 enforcer. For 6, add 2, and Odric retreats behind the bridge-house door rather than folding on the first failed check \u2014 he has more to lose and better cover. The thematic note, worth a beat at the table: sixty years on, the empire\u2019s dead institutions still have power \u2014 as costumes. A broken seal still opens purses. Authority outlives the thing that granted it. File that thought; the campaign will rhyme with it."));

cC.push(H1("Scene 3: The Capital"));
cC.push(BOX("You crest the pilgrim hill at the hour the light goes bronze, and there it is \u2014 the city from a thousand engravings, the city from your nightmare. It is vast beyond the drawings: ring on ring of walls in three colors of stone from three ages of empire, the river bent around it like a guard\u2019s arm, and above the haze of a hundred thousand cookfires, the two summits every schoolchild knows \u2014 the golden dome of the Great Temple of the Matron, and the white mass of the imperial palace, holding up the Lupine Throne. It is magnificent. And because you have seen it burning \u2014 seen these exact towers, this exact skyline, wrapped in fire that moved wrong \u2014 your first sight of the capital arrives with a shadow already on it. The bells begin the evening peal, and every one of you, without meaning to, counts the towers. The count matches the dream."));
cC.push(PS([{ t: "(" }, DM("DM note: "), { t: "the capital is Aenodira \u2014 use the name freely in read-aloud and dialogue from this point forward. See the sourcebook\u2019s Geography and Locations section for the ring structure and district layout referenced below.) Keep the arrival to broad, textural strokes ahead of full street-level detail: grandeur next to strain. Triumphal columns with scaffolding on them; a great aqueduct arch bricked up and rented out as housing in the Archwork; imperial banners bright and new over gates whose stonework is patched. The Emperor\u2019s restoration is visible \u2014 fresh paint, work crews, official proclamations of the coming Zhuvedian Laws posted at crossroads and along the Long Course \u2014 and so is everything it is up against." }]));
cC.push(P("(DM-only atmosphere, for a party that lingers or returns at dawn: the court keeps no public mourning for the Empress \u2014 there is no body, no confirmed death, and an interregnum the throne would rather forget, so the anniversary of her disappearance passes officially unmarked. What a sharp-eyed party might notice, and never be told the meaning of, is that on one grey Harvestide dawn the Emperor walks the Long Course alone, his guards held at a distance, longer than his usual circuit, and the proclamation-criers do not cry that morning. It is the third year. He has entered no room of hers in any of them. None of this is offered to the players; it is the season keeping its own accounts.)"));

cC.push(H1("Scene 4: The Academy and the Archivist"));
cC.push(P("The Imperial Academy of the Lupine Throne, in Scholar\u2019s Row, is the one place in Aenodira that feels fully ordered: swept courts, ringing bells, first-years drilling. The party files its exercise report (Ondrei\u2019s letter of commendation, if earned, raises eyebrows approvingly), and unless they volunteer the vision, the report closes routinely. Their supervising instructor notes they seem tired, congratulates them, and reminds them commencement is in five weeks."));
cC.push(P("The path to Vaelindra runs through Archivist Dathenor Vell \u2014 hill dwarf, ancient by human reckoning, keeper of the academy\u2019s restricted stacks, and precisely the kind of institutional fixture who has outlasted four chancellors by knowing everything and volunteering nothing. Any party that starts researching shared visions, omens, or prophetic phenomena in the library lands in his domain within the hour; alternatively, any trusted instructor, asked discreetly, sends them to him. Vell listens to whatever the party is willing to say \u2014 he does not push \u2014 and then does something he almost never does: he closes the ledger in front of him."));
cC.push(BOX("\u201CI will tell you three true things, and then I will tell you an address, and then we will agree this conversation was about overdue books. First: what you are describing is not in any collection I keep, and I keep the collections that officially do not exist. Second: the Church\u2019s Office of Omens would receive you politely, question you separately, and resolve you into a file. I recommend against becoming a file. Third: there is a woman in the Coppergate district who was doing what the Office of Omens pretends to do before your instructors were born. She sees people who are referred, and she has not accepted a referral from me in eleven years. Tell her the archivist still keeps her letters. The house with the blue shutters, above the copyist\u2019s shop, Ninth Lane off the Coppergate fountain. Go in daylight. She distrusts people who prefer the dark \u2014 and lately, my young colleagues, so do I.\u201D"));
cC.push(PS([{ t: "(" }, DM("DM note: "), { t: "Vell knew Vaelindra when both were young functionaries \u2014 he in the imperial archives, she in the Church \u2014 and he is one of perhaps three people who know why her Church career actually ended. He will not say so. His referral phrase, \u201Cthe archivist still keeps her letters,\u201D is genuine: he does, and she will know instantly that he means it. Eleven years ago he sent her someone whose vision ended badly; he has been ashamed to presume on her since. He is a superb recurring resource \u2014 research, restricted stacks, institutional memory \u2014 and his protectiveness of Vaelindra is real and mutual.)" }]));

cC.push(H1("Scene 5: The Still Waters"));
cC.push(P("Coppergate is a middle district: copyists, instrument-makers, retired functionaries, laundry between balconies. The blue-shuttered house is exactly where Vell said. A copyist\u2019s shop occupies the ground floor; a side stair leads up. The woman who answers the door is small, silver-haired, and entirely unremarkable except for the quality of her attention, which arrives like a hand on the shoulder."));
cC.push(P("Run the scene by her rules, which she states pleasantly and does not bend: she asks the questions first. Before she will hear one word of the vision, she seats the party, makes tea with unhurried thoroughness, and interviews them \u2014 names later, first: Who sent you? (The letters phrase visibly lands; something in her posture sets down a weight.) When did it happen \u2014 the hour, as precisely as you can? Had you shed blood that day? (She asks it evenly. The Redwatch answer interests her greatly.) Has anything cold come into your possession? (If the party carries Dren\u2019s medallion and produces it, she goes still for three full seconds \u2014 the only crack in her composure all evening \u2014 then asks, quietly, to be allowed to not touch it.)"));
cC.push(P("Only then does she hear the vision \u2014 and she takes it like a physician taking a history: no gasps, no mysticism, a pen moving in a ledger of her own shorthand, one clarifying question per detail. Which direction did the flames lean? Did the sound arrive before or after your gaze was pulled upward? How many towers did you count? When the account is complete, she sets down the pen, and the session ends on the following, delivered with the calm of a woman who has waited a long time to be wrong and has just learned she is not:"));
cC.push(BOX("\u201CI am going to tell you three things tonight, and none of them is a comfort, and the rest will wait for daylight, because you are exhausted and this next part deserves your whole mind. The first thing: your vision is real. It is not stress, not shared fancy, not something you ate. I have taken accounts like a physician takes histories for fifty years, and yours has the pulse of the true ones. The second thing: it is not yours alone. I have heard these images before \u2014 not this vision, but its relatives. Fragments. Edges. The storm, the wrong-colored fire, the thing behind the sky. They have been arriving for a long time, from people who had never met, and lately they arrive more often. Whatever this is, it did not begin with you, and it is already in motion. The third thing \u2014 and hold to this one, because it is the only mercy I have for you tonight: in fifty years, I have never known a shared vision to show what must happen. They show what is coming if nothing changes. Nothing changes, that is, unless someone changes it. Go and sleep, if you can. Come back at the tenth bell. And children \u2014 \u201D she glances, once, at the pocket where the cold thing rides, \u201C \u2014 walk in the light on your way home.\u201D"));
cC.push(P("End the session there. Do not play the walk home. Session Three opens at the tenth bell, with tea going cold and Vaelindra deciding \u2014 based on everything the party said and did tonight \u2014 how much of the truth they can carry."));


// ============ SESSION TWO ADDITIONS ============
cC.push(H1("The Approach to Aenodira, Keyed"));
cC.push(P("Scene 3 is the party\u2019s first sight of the capital and it deserves more than a paragraph, because everything the campaign will later do to this city depends on the players having loved it once. Six beats along the last four miles, each one a stop rather than a description. Run them in order; the whole sequence is thirty minutes and it is the best thirty minutes in the session."));
cC.push(B("A1. The Milestone.", "Four miles out, a league-stone worn smooth, reading only AENODIRA and a number. Every stone on every imperial road gives the distance to this one place and nothing else, because there was a time when that was the only distance that mattered. Somebody has left a coin on top of it. There are always coins on top of it."));
cC.push(B("A2. The First Sight.", "The road crests and the valley opens: three walls in ascending rings, the golden dome, the Long Course\u2019s oval, and the river coming in from the north through haze. Give this its own moment and do not rush anyone through it."));
cC.push(B("A3. The Traffic.", "A mile of it: carts, pilgrims, a Concord train, three separate arguments, a man selling water, a Watch post checking nothing in particular. The capital is loud before it is visible in detail, and the party will not have heard this much human noise in weeks."));
cC.push(B("A4. The Outer Gate.", "The Long Wall, and a queue. Papers, or an academy letter, or a coin. Twenty minutes of standing in it, which is the correct amount of time to spend teaching players that this city processes people."));
cC.push(B("A5. Rivergate at the Waterline.", "The road in runs past the district the campaign will spend Session Five in. Ink, cheap paper, wet stone, and a smell. Somebody watches the party go past and the party will not know until later that somebody always does."));
cC.push(B("A6. The Middle Gate and Scholar\u2019s Row.", "Up, through the second wall, and the noise changes register: students, booksellers, and the Patched Standard\u2019s darned banner. This is home. They have been away six weeks and it is exactly as they left it, and that is the last time in this campaign that will be true."));

cC.push(H1("The Archivist\u2019s Catalogue (Puzzle)"));
cC.push(P("Scene 4 sends the party to Archivist Vell, and as written the scene resolves on a conversation. It should resolve on a search, because the Imperial Archive is the first genuinely interesting room in the campaign and because what the party learns to do here they will do again in Sessions Five, Six, and Eight."));
cC.push(BOX("Vell does not fetch things. Vell explains the catalogue, once, in about ninety seconds, in a tone suggesting he has done this nine thousand times and remains willing to do it again. Shelf-marks run in four parts: the Book, the Hand, the Year, and the Leaf. The Book is what kind of thing it is. The Hand is who wrote it down, not who wrote it. The Year is the year it was deposited, not the year it happened. And the Leaf is where it physically is, which changes, which is why the Leaf is written in pencil. Then he goes back to his work and lets them get on with it."));
cC.push(P("The party want records of Redwatch, the signal chain, or the standard \u2014 whatever they came in holding. The puzzle is that the obvious search fails, and it fails informatively."));
cC.push(B("Why it fails.", "Searching under Redwatch as a place returns nothing, because a fort is not a Book. Searching under the Hand of the clerk who filed the muster roll returns everything that clerk ever filed, which is four hundred items across sixty years, one of which is what they want. The trick is that the Year is the deposit year, not the event year, so the Silvasse material was filed decades after Silvasse \u2014 by the people who came back."));
cC.push(B("Solution one \u2014 ask Vell a better question.", "He will not fetch, but he will answer precisely what he is asked. What Book would a dead garrison be in? gets an immediate, useful answer. A party that works out that the archivist is a search interface rather than an obstacle has learned the most valuable skill in the campaign."));
cC.push(B("Solution two \u2014 work the Hand.", "DC 14 Intelligence (Investigation) to realize the clerk\u2019s hand is the index. Then an hour, and the four hundred items, and the one that matters."));
cC.push(B("Solution three \u2014 work the Year.", "DC 15 Intelligence (History): the deposit year for anything Silvasse-related will be decades after the event, because it took that long for anyone to file it. Search the right decade and the volume of material collapses to something manageable."));
cC.push(B("Solution four \u2014 the Leaf, in pencil.", "A character who notices the pencil and asks why can be told by Vell that the collection is re-shelved every few years and that he keeps a working list of what has moved recently. That list is three pages and one of the entries is a thing that moved twelve years ago and has not been seen since. It is not what they came for. Note it."));
cC.push(PS([DM("DM Only: "), { t: "the item that moved twelve years ago and was never re-shelved was pulled by Empress Nyreeza, during the years of her private inquiry. Vell does not know that; he knows only that a Leaf entry went stale and he has been mildly annoyed about it for over a decade. This is the campaign\u2019s earliest available Nyreeza thread and it is available in Session Two to a party who asked about a pencil." }]));

cC.push(H1("Traps and Hazards on the Road Back"));
cC.push(B("The Ford at Height.", "Environmental hazard, usable in any of the three road encounters. The first rains before Vinmoon have the crossing running fast and thigh-deep. DC 12 Strength (Athletics) to cross on foot; failure means swept 20 feet downstream and a second check or drop what you are carrying. Mounted crossing is DC 10. A rope belayed across drops both DCs by 5, takes one character ten minutes, and is the correct answer."));
cC.push(B("The Rotted Bridge.", "Mechanical hazard on a provincial spur. Planking sound at the edges and rotten in the middle third. DC 13 Perception spots the discoloration. A creature of Medium size or larger crossing the middle without testing: DC 12 Dexterity save or a plank gives \u2014 1d6 bludgeoning, and a leg through the deck, and a DC 12 Strength check to get free. A wagon that tries it loses a wheel through the deck, which is four hours and a genuinely funny scene."));
cC.push(B("Nightfall Without a Vigil.", "Not a hazard with a saving throw. If the party is carrying anyone\u2019s dead and camp falls without a lamp lit and a watch kept, every Zhuvedian NPC who learns of it afterward will treat them differently, and the DM should let that consequence arrive weeks later, from a stranger, without warning."));

cC.push(H1("Encounters Between Dravenna and the Capital"));
cC.push(P("The three written road encounters are the spine of Scene 2. These are for the gaps between them, or for a table that wants a fourth. Roll a d8 per travel day."));
cC.push(ltable(["d8", "What Happens"], [11, 89], [
  ["1", "A Concord wagon train that will hire the party for the last two days at fair rates, and whose factor talks the entire time."],
  ["2", "Refugees from the Brekelands, going the wrong way, who have been turned back at a gate and are trying a different road."],
  ["3", "An imperial post-rider at the gallop. He does not stop. What he is carrying is worth a Perception check and the party will never find out."],
  ["4", "A wayside shrine to the Watch at the Threshold with a lamp burning and no keeper in sight."],
  ["5", "A wolf pack crossing the road, and a carter who stops his team and waits, and will explain why to anyone who asks nicely."],
  ["6", "Two students of the Academy, a year below, on their own field exercise, going the other way and very pleased with themselves."],
  ["7", "A body at the roadside, laid out, lamp lit, nobody there. Somebody has to keep the night."],
  ["8", "A merchant who recognizes the party\u2019s academy colors and wants, urgently, to talk about the new registration requirement, at length, without pausing."]
]));

cC.push(H1("Handout \u2014 Session Two"));
cC.push(H2("The Shelf-Mark"));
cC.push(BOX("BOOK: MUSTERS AND ROLLS OF THE PROVINCIAL LEGIONS.   HAND: OSSIAN PELL THE ELDER, CLERK.   YEAR OF DEPOSIT: [a year forty-one years after Silvasse].   LEAF: (in pencil, twice crossed out, third entry current) IX.4.tertius."));
cC.push(P("Hand this over when the party solves the catalogue. The crossed-out Leaf entries are the collection moving twice in sixty years. It is also, quietly, the first time this campaign shows a player that the record and the truth are two different objects, which is the whole of Session Five."));
cC.push(H1("Stat Blocks"));
SB({ name: "Provincial Soldier", meta: "Medium humanoid (any race), lawful neutral",
  ac: "16 (chain shirt, shield)", hp: "11 (2d8 + 2)", speed: "30 ft.",
  str: 13, dex: 12, con: 12, int: 10, wis: 11, cha: 10,
  skills: "Perception +2",
  senses: "passive Perception 12", langs: "Common", cr: "1/8 (25 XP)",
  traits: [{ n: "Unpaid and Unenthusiastic", t: "The soldier has disadvantage on saving throws against being frightened while Sergeant Malich is incapacitated, and will accept any face-saving surrender offered." }],
  actions: [
    { n: "Spear", t: "Melee or Ranged Weapon Attack: +3 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 4 (1d6 + 1) piercing damage, or 5 (1d8 + 1) piercing damage if used with two hands to make a melee attack." }
  ] }).forEach(x => cC.push(x));
SB({ name: "Sergeant Petra Malich", meta: "Medium humanoid (human), lawful neutral",
  ac: "17 (splint)", hp: "32 (5d8 + 10)", speed: "30 ft.",
  str: 15, dex: 11, con: 14, int: 11, wis: 13, cha: 12,
  skills: "Athletics +4, Insight +3, Perception +3",
  senses: "passive Perception 13", langs: "Common", cr: "1 (200 XP)",
  traits: [{ n: "Not Dying for Scrip", t: "If reduced below half her hit points, or if three of her soldiers fall, Malich orders a withdrawal and yields the crossing. She fights to protect her men, not the toll." }],
  actions: [
    { n: "Multiattack", t: "Malich makes two longsword attacks." },
    { n: "Longsword", t: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) slashing damage, or 7 (1d10 + 2) slashing damage if used with two hands." }
  ] }).forEach(x => cC.push(x));
SB({ name: "Bridge Enforcer", meta: "Medium humanoid (any race), neutral",
  ac: "11 (leather armor)", hp: "32 (5d8 + 10)", speed: "30 ft.",
  str: 15, dex: 11, con: 14, int: 10, wis: 10, cha: 11,
  skills: "Intimidation +2",
  senses: "passive Perception 10", langs: "Common", cr: "1 (200 XP)",
  traits: [{ n: "Pack Tactics", t: "The enforcer has advantage on attack rolls against a creature if at least one of the enforcer\u2019s allies is within 5 feet of the creature and the ally isn\u2019t incapacitated." },
           { n: "Paid, Not Owned", t: "The enforcer abandons Odric Hale if reduced below half hit points or if half the enforcers have fallen." }],
  actions: [
    { n: "Multiattack", t: "The enforcer makes two mace attacks." },
    { n: "Mace", t: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) bludgeoning damage." }
  ] }).forEach(x => cC.push(x));
SB({ name: "Odric Hale", meta: "Medium humanoid (human), neutral evil",
  ac: "14 (fine studded leather)", hp: "22 (4d8 + 4)", speed: "30 ft.",
  str: 10, dex: 14, con: 12, int: 14, wis: 11, cha: 15,
  skills: "Deception +6, Insight +2, Persuasion +4",
  senses: "passive Perception 10", langs: "Common, plus two regional dialects", cr: "1/2 (100 XP)",
  traits: [{ n: "A Businessman, Not a Soldier", t: "Odric surrenders immediately when personally endangered or when his writ is credibly exposed before witnesses. He fights only if cornered with no offer on the table." }],
  actions: [
    { n: "Rapier", t: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) piercing damage." },
    { n: "Honeyed Misdirection (Recharge 5\u20136)", t: "Odric targets one creature within 30 feet that can hear him. The target must succeed on a DC 12 Wisdom saving throw or have disadvantage on its next attack roll or ability check before the end of its next turn, as Odric\u2019s patter momentarily convinces it of some procedural irregularity." }
  ] }).forEach(x => cC.push(x));

cC.push(H1("NPC Quick Reference"));
cC.push(B("Sgt. Petra Malich:", "Competent, underpaid, privately ashamed of the toll. Speech: clipped, formal, thaws only if respected. Thread: a good soldier serving a bad arrangement \u2014 exactly the person a restored empire would need, and exactly the person it is currently losing."));
cC.push(B("Semya of Halvenne:", "Old, unhurried, unfrightened \u2014 she has already lost the things fear protects. Speech: proverbs and weather. Thread: her people\u2019s resettlement (Dravenna, if the party thinks of it) becomes a small living consequence of the party\u2019s choices."));
cC.push(B("Odric Hale:", "Charming parasite with perfect paperwork. Speech: bureaucratic honorifics deployed like weapons. Thread: if escorted to justice, his dead-seal supplier is a loose end pointing into Rivergate, the capital\u2019s under-regulated river quarter and the natural home of its document underworld \u2014 useful later (see the sourcebook\u2019s Plot Hooks: The Seal Dealer of Rivergate)."));
cC.push(B("Archivist Dathenor Vell:", "Ancient, dry, precise; volunteers nothing, forgets nothing. Speech: numbered lists, then silence. Thread: the party\u2019s door into restricted institutional memory \u2014 and one of three living people who know why Vaelindra\u2019s Church career truly ended."));
cC.push(B("Vaelindra of the Still Waters:", "Full profile in the campaign sourcebook. This session uses only the surface of her: the method, the tea, the ledger, the three things. Everything she is holding back \u2014 Nyreeza, the founding, her decision about the party \u2014 is Session Three\u2019s material and beyond."));

cC.push(H1("Optional Content (Beyond the Five-Hour Core)"));
cC.push(B("The Wandering Lecturer (~40 minutes):", "At a waypoint inn, one Professor Emeritus Pontellus Vorn \u2014 expelled from three provincial academies, by his own proud account \u201Cfor excessive rigor\u201D \u2014 delivers an unsolicited evening lecture on the capital\u2019s three walls, wrong in nearly every particular and magnificent in all of them. Let an academy-trained party squirm, correct him, or bait him. Comic texture with one buried gift: among his nonsense, one claim is true \u2014 \u201Cthe Long Wall was built for a city that never came\u201D \u2014 and a party that fact-checks him later discovers the strange experience of the fool being right once. Vorn is a renewable comic NPC; he will resurface in Aenodira, lecturing pigeons if no one else will listen."));
cC.push(H1("Diverging Paths (DM Only)"));
cC.push(P("Outcomes here echo forward. Record them in the Branch Ledger."));
cC.push(BUL("Semya\u2019s people:", "Resettled in Dravenna: forty grateful witnesses and a standing Ostmark listening post; the Forty Witnesses hook fires warm. Worth more than it looks under the new Laws: Book Two makes a witnessed oath the thing that binds at law, and most of the empire cannot read \u2014 so forty people willing to stand up and say what they saw is a legal instrument, not just goodwill. Left to the road: they land in Farrowgate, and the Session Five optional client \u2014 the family whose daughter went to Greywell \u2014 lands among them, harder and angrier. Both branches work; they change the temperature of every later Farrowgate scene."));
cC.push(BUL("Sergeant Malich:", "Respected: a quiet friend inside a border lord\u2019s garrison \u2014 and if Lord Ostrev\u2019s toll ever reaches an imperial court, a conscience deciding which way to testify. She is also the Dessen case\u2019s best witness, being of the Third herself and unpaid by it for a year, and the Colonel\u2019s Reckoning is materially easier to close with her than without her. Humiliated before her men or forced to yield the crossing: Ostrev hears of it, and the party has a minor lord\u2019s durable enmity plus a checkpoint that remembers them on every future eastern journey."));
cC.push(BUL("Odric Hale:", "Escorted to capital authorities: his dead-seal supplier becomes discoverable evidence \u2014 Session Five\u2019s Rivergate investigation begins with a live lead and Tirell Mosse already nervous. Released with his \u201Capology\u201D: he resurfaces working a different bridge under a different dead office, and Mosse\u2019s shop has had time to tidy its ledgers. Killed: the supplier thread survives, but colder."));
cC.push(BUL("The report and the vision:", "If the party volunteers the shared vision in their official exercise report, it enters academy records \u2014 and the Office of Omens\u2019 Session Five attention arrives with documentary teeth instead of rumor. Discretion here is armor later; indiscretion is not fatal, merely expensive."));
cC.push(BUL("Standing moved this session:", "The Capital Merchants\u2019 Concord rises if Odric\u2019s bridge was cleared or he was walked to authority: their rule is a route made safer or a contract made enforceable, and the party did both before lunch. The Church rises again if Semya\u2019s band were fed, escorted, or written to Dravenna for \u2014 charity offered in front of people keeping a rite counts twice. The Imperial Academy rises for a clean exercise report, more if Ondrei\u2019s commendation is pinned to it. Weigh the checkpoint rather than scoring it: invoking the signet exemption is lawful and costs the party nothing with any faction on the list, and that is exactly the point of the scene \u2014 the empire keeps no tier for what the farmers in that queue saw."));
cC.push(H1("Loot and Found Rewards \u2014 Session Two \u2014 the Road Back"));
cC.push(ltable(["Find","Value / Effect"],[40,60],[
  ["Odric\u2019s strongbox","45 gp, a forged-seal kit (evidence; worth 25 gp to exactly the wrong people), and toll receipts naming payers \u2014 paper leverage in the Ostrev matter"],
  ["The dead Roads Commission seal","Story item \u2014 the thread to Mosse (Session Five)"],
  ["Semya\u2019s gratitude","A blessing in the old country way. Not an item. Worth more than most items"]
]));
cC.push(H1("Rewards and Advancement"));
cC.push(P("Coin: modest \u2014 Odric\u2019s 20 gp \u201Capology\u201D and up to 35 gp recovered from his strongbox if the bridge ends in force; this session pays in relationships, not gold. Reputation: Malich, Semya\u2019s forty witnesses, Vell, and Vaelindra are all ledger entries whose value compounds. XP for tables using it: roughly 500\u2013800 depending on encounters run and how they resolved (award full encounter value for nonviolent resolutions \u2014 they are the harder path). Advancement: the party reaches 4th level at the start of Session Three, after the tenth-bell conversation with Vaelindra concludes."));

cC.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "~", size: 24 })] }));
cC.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u201CWalk in the light on your way home.\u201D", italics: true })] }));

// ---------- write all three ----------
Promise.all([
  Packer.toBuffer(docShell(cA)).then(b => fs.writeFileSync(stagePath("QS_Session_0_Primer.docx"), b)),
  Packer.toBuffer(docShell(cB)).then(b => fs.writeFileSync(stagePath("QS_Session_1_The_Silent_Road.docx"), b)),
  Packer.toBuffer(docShell(cC)).then(b => fs.writeFileSync(stagePath("QS_Session_2_The_Road_Back.docx"), b))
]).then(() => console.log("All three written."));
