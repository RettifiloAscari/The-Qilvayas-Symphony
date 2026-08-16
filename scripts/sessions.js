const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat,
        Table, TableRow, TableCell, WidthType, ShadingType } = require('docx');
const fs = require('fs');

// ---------- helpers ----------
const P = (text, opts = {}) => new Paragraph({
  spacing: { after: 200 }, ...opts,
  children: [new TextRun({ text, ...(opts.run || {}) })]
});
const PS = (segs, opts = {}) => new Paragraph({
  spacing: { after: 200 }, ...opts,
  children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i }))
});
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const BULLET = (segs) => new Paragraph({
  numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 },
  children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i }))
});
const B = (lead, rest) => PS([{ t: lead + " ", b: true }, { t: rest }]);
const BUL = (lead, rest) => BULLET(lead ? [{ t: lead + " ", b: true }, { t: rest }] : [{ t: rest }]);
const { Table: LTable, TableRow: LRow, TableCell: LCell, WidthType: LW, ShadingType: LS } = require('docx');
const lcell = (text, opts = {}) => new LCell({ width: { size: opts.w || 20, type: LW.PERCENTAGE }, shading: opts.head ? { type: LS.CLEAR, fill: "E4DCCB" } : undefined, margins: { top: 50, bottom: 50, left: 90, right: 90 }, children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text, bold: !!opts.head, size: 18 })] })] });
const ltable = (headers, widths, rows) => new LTable({ width: { size: 100, type: LW.PERCENTAGE }, rows: [ new LRow({ children: headers.map((h, i) => lcell(h, { head: true, w: widths[i] })) }), ...rows.map(r => new LRow({ children: r.map((v, i) => lcell(v, { w: widths[i] })) })) ] });


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
    alignment: AlignmentType.CENTER, spacing: { after: 40, before: 40 },
    children: [new TextRun({ text, bold: !!bold, size: 20 })]
  })]
});
const SB = (d) => {
  const out = [];
  out.push(new Paragraph({
    spacing: { before: 240, after: 40 },
    children: [new TextRun({ text: d.name, bold: true, size: 26, color: "5B1F1F" })]
  }));
  out.push(PS([{ t: d.meta, i: true }], { spacing: { after: 120 } }));
  out.push(B("Armor Class:", d.ac));
  out.push(B("Hit Points:", d.hp));
  out.push(B("Speed:", d.speed));
  out.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: ["STR", "DEX", "CON", "INT", "WIS", "CHA"].map(h => abCell(h, true)) }),
      new TableRow({ children: [d.str, d.dex, d.con, d.int, d.wis, d.cha].map(v => abCell(v + " (" + mod(v) + ")")) })
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
    out.push(PS([{ t: "ACTIONS", b: true }], { spacing: { before: 80, after: 80 } }));
    d.actions.forEach(a => out.push(PS([{ t: a.n + ". ", b: true, i: true }, { t: a.t }])));
  }
  if (d.reactions && d.reactions.length) {
    out.push(PS([{ t: "REACTIONS", b: true }], { spacing: { before: 80, after: 80 } }));
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
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
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
cA.push(BUL("Ability Scores:", "27-point buy or standard array (15, 14, 13, 12, 10, 8), DM's preference. Avoid rolled stats for this campaign \u2014 the political and social pillars punish a party with a dump-stat face."));
cA.push(BUL("Hit Points:", "Maximum at 1st level, average (rounded up) at 2nd and 3rd."));
cA.push(BUL("Races and Sources:", "DM's discretion. Note that Drow carry imperial resonance in this setting \u2014 the Emperor himself is Drow \u2014 so a Drow PC is a statement, not just a stat line. Worth a conversation if anyone picks one."));
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
cA.push(BUL("1 \u2014 Lottery Winner:", "A genuine winner. Talented, probably common-born, owes nobody anything \u2014 and is quietly resented by classmates who know how rare that is. Thread: the home community that celebrated them, and what it expects back."));
cA.push(BUL("2 \u2014 The Donation:", "A wealthy family made a generous gift to the academy, and admission followed. The character knows it. Thread: the family\u2019s expectations, and whether the character intends to meet them."));
cA.push(BUL("3 \u2014 The Hostage:", "A son or daughter of a border lord or ambitious noble, kept close to the capital to ensure a parent\u2019s good behavior. In law this is hostage-diplomacy, a formal category and emphatically not bondage: the character retains full legal personhood and is owed treatment as an honored, if constrained, guest (see the sourcebook, Law, Oath, and Bound Labor). Whether their actual experience has matched that standard is the character\u2019s to decide. Thread: the parent\u2019s politics, and what happens back home if relations with the throne sour."));
cA.push(BUL("4 \u2014 The Prot\u00E9g\u00E9:", "A regional lord or power spotted talent and sponsored it, expecting a return on the investment. Thread: the patron, and the first favor they will eventually call in."));
cA.push(BUL("5 \u2014 The True Believer:", "Sought admission out of genuine conviction \u2014 in the empire, the Lupine Matron, or the Emperor\u2019s restoration. Thread: what happens to faith when the institution disappoints it."));
cA.push(BUL("6 \u2014 The Quiet Irregularity:", "The paperwork says lottery. It wasn\u2019t \u2014 a forged record, a bribed clerk, a swapped name. The character may not even know who arranged it, or why. Thread: whoever did it, and what they wanted. (DM note: this one is a gift \u2014 it can be wired into any faction later.)"));

cA.push(H1("Forging the Party"));
cA.push(P("The academy houses students in mixed residential halls by year and cohort, so the party plausibly shared a dormitory for four years. Do not just assert the bond \u2014 co-author it. Put these questions to the table and let players answer in any order, building on each other:"));
cA.push(BUL(null, "What incident in your first or second year turned you from hallmates into allies? (A hazing gone wrong, an unfair accusation one of you took the blame for, a house competition you conspired to win.)"));
cA.push(BUL(null, "Which earlier field exercise did you survive together, and what went wrong on it? (This is the party\u2019s shared war story. It should have gone badly enough to matter.)"));
cA.push(BUL(null, "Each player, name one thing you trust absolutely about the character to your left, and one habit of theirs that drives you mad."));
cA.push(BUL(null, "Who first said, out loud, \u201Cwe should do this for ourselves after graduation\u201D \u2014 and who took the most convincing?"));
cA.push(H2("The Company"));
cA.push(P("Have the players name their future mercenary company during Session Zero, before the campaign begins. This is deliberate. The company is the party\u2019s shared dream \u2014 the plan the vision is about to interrupt \u2014 and it lands much harder if it is their invention rather than a line of backstory. Let them argue about the name. Let them design a charter, a motto, a rule (\u201Cwe never work for slavers,\u201D \u201Cequal shares, always\u201D). Every rule they write is a promise \u2014 and in this campaign, promises are load-bearing. Write them all down."));

cA.push(H1("Tone Check"));
cA.push(P("Run a short, explicit conversation about tone. This campaign is built on moral complexity \u2014 an idealistic emperor whose methods may darken, factions with legitimate grievances on every side, and a central threat fed by betrayal. Confirm the table wants that, and establish lines and veils as normal. Two specific checks worth making: first, is the table comfortable with the campaign posing questions that have no clean answer (whether the empire should be restored at all is genuinely contestable); second, how much darkness is welcome around themes of institutional corruption, religious politics, and violence against civilians. Calibrate accordingly \u2014 the material flexes either direction."));

cA.push(H1("What the Players Should Not Know"));
cA.push(P("DM eyes only. The players should leave Session Zero knowing the setting material marked as public in the sourcebook: the empire\u2019s decline, the academy, the Emperor\u2019s restoration project, the Lupine Matron and the general shape of the faith, and the existence of theological dispute about the founder. They should know nothing of the Founding Myth\u2019s buried account \u2014 Threnvos, the broken oath, the Oathbreaker \u2014 nothing of the shadow\u2019s nature or its feeding mechanism, nothing of Vaelindra (she enters play in Session Two), and nothing about the truth of Empress Nyreeza\u2019s disappearance beyond the public mystery. Above all, they must never hear the word Proving: the academy\u2019s staged final examination (Sessions Three and Four) only works if no player has any reason to suspect the institution stages anything, ever. If a player builds a paladin or cleric, resist the urge to foreshadow early. Their moment comes later, and it will be worth the wait."));

cA.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "~", size: 24 })] }));
cA.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u201CWe are the Kin of Great Timberwolf\u201D", italics: true })] }));

// ============================================================
// DOC B \u2014 SESSION 1: THE SILENT ROAD
// ============================================================
const cB = [];
title(cB, "Session One: The Silent Road", "An adventure for 4\u20136 characters of 3rd level \u2014 the final field exercise, and the night everything changes");

cB.push(H1("Overview"));
cB.push(P("The party\u2019s final field exercise: a provincial magistrate in the river town of Dravenna, in the loyalist eastern march called the Ostmark (see the sourcebook\u2019s Atlas), has requested academy assistance with a string of caravan disappearances on the Ostmark trade road. The season is Harvestide \u2014 early autumn, the tail of the Academy\u2019s traditional Hay\u2013Harvestide exercise window, with the Suthmark\u2019s harvest festival underway far to the south and the eastern roads in their last good weeks before Vinmoon turns them to mud. The culprits are deserters from a provincial legion \u2014 oath-breakers, in the campaign\u2019s most literal sense \u2014 holed up in a ruined watch-fort and increasingly desperate. The party investigates, tracks them down, and resolves the situation by steel or by parley. That night, celebrating a job well done, they receive the shared vision that changes everything."));
cB.push(P("Designed for a five-hour session. Suggested pacing budget: Dravenna and the briefing (45 minutes); the ambush site and Yanna (60 minutes); the trail and the scout picket (30 minutes); Redwatch, by whatever approach (90 minutes); resolution and the celebration at the Gilded Ford (45 minutes); the Vision (30 minutes, unhurried). At this length both the looter encounter and the scout picket are standard content, not optional. If the table runs long anyway, the celebration and Vision must not be cut \u2014 compress the road instead."));

cB.push(H2("What Is Actually Happening (DM Only)"));
cB.push(P("Eight soldiers of the Third Provincial Legion deserted four months ago after their commander, Colonel Aurel Dessen, sold off the garrison\u2019s winter grain and blamed the shortfall on them. Led by Sergeant Varkos Dren, they fled east, turned to robbery to eat, and occupied the ruined imperial watch-fort called Redwatch. They have hit four caravans in six weeks. They have killed \u2014 twice, both times when a guard fought back \u2014 and the killings sit badly on most of them."));
cB.push(P("Here is the part the party cannot yet understand: since breaking their oaths of service, every one of them suffers the same recurring nightmare \u2014 storm clouds, a burning city they have never seen, and something vast moving behind the dark. The entity beneath the capital does not know them and has not chosen them; but broken oaths resonate with it, and the deserters have become faintly audible to something that has been listening for two thousand years. Dren, whose oath ran deepest \u2014 he defaced his own legion oath-medallion the night he fled \u2014 has it worst. He has barely slept in a month, and something of the dark has begun to bleed through him. None of this should be explained in this session. It exists so that when the party receives the same imagery in their vision hours later, the DM knows the echo is real \u2014 and so the campaign\u2019s central mechanism (betrayal feeds the shadow) is present from the very first fight, invisible and waiting to be rediscovered much later."));
cB.push(P("A quieter thing sits under the season, DM-only and never spelled out for players: it is Harvestide, and the calendar makes this an anniversary week twice over. The Vintage Night fell in Harvestide six years ago; Empress Nyreeza vanished in Harvestide three years ago. Neither is Dravenna\u2019s tragedy, but the Ostmark keeps the Matron\u2019s calendar like everyone else, and the season carries it: the Vigil Hall tolls a mourning peal at dusk for southern dead the town never knew, a widow or two keeps a candle no one asks about, and the older folk call this stretch of Harvestide \u201Cthe thin week\u201D without being able to say why. Seed it as weather, not clue. It is here so that when Vaelindra later dates the acceleration to \u201Cthree years ago, almost to the season,\u201D a player who was paying attention in Dravenna feels the floor move."));

cB.push(H1("Scene 1: Dravenna"));
cB.push(BOX("Dravenna announces itself by smell before sight \u2014 river mud, tar, and fish \u2014 and then by sound: the groan of the great water-wheel at the ford. It is a town of perhaps two thousand, prosperous by border standards, its stone bridge and customs house relics of a time when imperial engineers built things to last. The imperial wolf-standard still flies over the magistrate\u2019s hall, though the flag is patched and the pole leans. People here look at your academy uniforms the way farmers look at rain clouds: potentially useful, potentially trouble."));
cB.push(H2("The Briefing"));
cB.push(P("Magistrate Cassivar Ondrei receives the party in a hall that doubles as courtroom and granary office. He is in his fifties, precise, visibly tired, and honest by the standards of provincial officials \u2014 which is to say he skims modestly and hates violence on his roads because it is bad for taxes. He lays out the facts:"));
cB.push(BUL(null, "Four caravans hit in six weeks on the Ostmark road, all within a day\u2019s ride east. Goods taken: food, coin, boots, medicine. Not luxuries \u2014 supplies."));
cB.push(BUL(null, "Two dead across the four attacks, both caravan guards who resisted. Drivers and merchants were bound, not harmed. \u201CDisciplined,\u201D Ondrei says, and the word clearly bothers him."));
cB.push(BUL(null, "The latest attack was two days ago. One survivor unaccounted for \u2014 a teamster named Yanna, who fled into the brush and has not come into town."));
cB.push(BUL(null, "Terms: 200 gp to the party for ending the attacks, plus a 25 gp bounty per bandit \u2014 payable equally for capture or proof of death. Ondrei prefers capture: \u201CDead men can\u2019t testify against whoever made them run.\u201D That line is deliberate \u2014 he already suspects deserters, and suspects their commander is the deeper rot."));
cB.push(H2("Rumors in Town (d6, or feed as desired)"));
cB.push(BUL("1.", "\u201CThird Legion pay wagon never came through this spring. First time in nine years.\u201D (True; connects to the grain scandal.)"));
cB.push(BUL("2.", "\u201CThe attacks are ghosts from old Redwatch. That fort\u2019s been cursed since the old wars.\u201D (False, but points at the right location.)"));
cB.push(BUL("3.", "\u201CThey took a whole crate of poppy-milk off Serren\u2019s wagon. Somebody\u2019s hurt bad, or can\u2019t sleep.\u201D (True. Dren cannot sleep.)"));
cB.push(BUL("4.", "\u201COne driver swears the leader talked in his sleep by their fire \u2014 begging somebody\u2019s pardon, over and over.\u201D (True.)"));
cB.push(BUL("5.", "\u201CMagistrate\u2019s cousin runs the ferry and raised his rates the week the attacks started. Convenient.\u201D (True but unrelated \u2014 a red herring with local color.)"));
cB.push(BUL("6.", "\u201CDogs won\u2019t go east past the old milestone anymore. Haven\u2019t for weeks.\u201D (True. Animals dislike what is bleeding through Dren.)"));

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
cB.push(P("Before the party leaves, there is a thing every Zhuvedian child knows and every academy graduate has been formally taught: no body goes into the ground, the water, or the stone before it has been kept through one full night\u2019s Vigil \u2014 watched, lit, never left alone \u2014 because the Matron watches the dead home, and she does it at night. It applies to deserters. It applies to oath-breakers. Doctrine is unambiguous and always has been: the Vigil is owed to the dead as dead, not as the good. A party that simply rides away from the bodies at Redwatch has done something their own training tells them is wrong, and the DM should let them feel the shape of that without lecturing \u2014 a character raised devout might simply start gathering firewood without announcing why."));
cB.push(P("If they keep it, give the Vigil ten quiet minutes and no dice: bodies laid out, a fire, a long night in a ruined fort, and the specific discomfort of watching over men they killed a few hours ago. This is the session\u2019s best opportunity for characters to say true things to one another, and it frequently lands harder than the fight did. Magistrate Ondrei, told of it afterward, thinks noticeably better of them \u2014 provincial magistrates notice who keeps the old forms when nobody is watching. (DM note: if a character carries Dren\u2019s medallion through the Vigil, it stays cold all night. Say nothing about it. Let them notice.)"));
cB.push(P("Aftermath details worth narrating: Dren\u2019s body is unnaturally light, like driftwood. Around his neck the party finds his legion oath-medallion, deliberately defaced with a knife \u2014 and cold. It stays cold, always, no matter how long it is carried. It is not magical to any detection the party can currently cast. Let a player keep it. It is the campaign\u2019s first artifact of the truth, and it will matter that someone chose to carry it."));

cB.push(H1("Scene 5: Resolution"));
cB.push(P("Ondrei pays promptly and in full \u2014 200 gp plus bounties (25 gp per deserter, captured or accounted for; a full sweep of eight pays 200 gp more). If any deserters survived to testify, Ondrei is genuinely moved, and begins quiet proceedings against the Third Legion\u2019s colonel \u2014 a thread the DM can develop or leave as background texture of a system occasionally, imperfectly working. If the party mentions the shadow, Ondrei goes very still, thanks them formally, and writes none of it down. \u201CSome reports,\u201D he says, \u201Coutlive the men who file them. Enjoy the Gilded Ford tonight, on the town.\u201D"));
cB.push(P("The evening at the Gilded Ford inn should be warm and unhurried \u2014 give it real table time. The exercise is complete; graduation is weeks away; the company they named in Session Zero is almost real. Invite each player to narrate a small moment of celebration or reflection: a toast, a letter home, an argument about the company charter, a quiet look at a cold medallion. Let them be young and finished and proud. Then they go to bed."));

cB.push(H1("Scene 6: The Vision"));
cB.push(P("Run this as follows: ask each player, one at a time, what their character dreams about on a good night \u2014 let them answer in a sentence or two, unhurried. Then, whatever each answer was, continue: \u201CAnd then the dream opens beneath you, like a floor giving way.\u201D Read the following once all players have answered, addressing the whole table:"));
cB.push(BOX("You stand on a high place you have never stood, above a city you know from engravings and lecture halls: the imperial capital, seat of the Lupine Throne. It is night, and the city is burning. The flames are the color of a dying ember and they move wrongly \u2014 upward too slowly, sideways when no wind blows, clinging to stone that should not burn. You try to cry out. Nothing in you obeys. You are present the way a witness is present: permitted to see, and nothing else. Storm clouds turn above the city, vast and slow, and your gaze is dragged upward against your will \u2014 and there, behind the clouds, something moves. Not a shape. A displacement, as if the sky were cloth and something on the far side pressed against it. It is vast beyond vastness, and it is aware, and when it sounds \u2014 not a roar heard, but a roar felt, in teeth and bone and the base of the skull \u2014 you understand that it is not arriving. It has always been here. It is waking. The dark takes everything, and you wake drenched in sweat, heart hammering, with the taste of ash on your tongue."));
cB.push(P("Then go around the table one final time: each character wakes in their room at the Gilded Ford. Let the players find each other \u2014 do not prompt it \u2014 and let them discover in their own words that the vision was identical, down to the smallest details. Characters who fought the Umbral Remnant may make the connection to the sound it made; do not confirm or deny. When the unease has fully landed, end the session. Do not run the morning after. That is Session Two\u2019s opening, and this silence is the best cliffhanger the campaign will ever get for free."));

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
cB.push(BUL("Deserters spared vs. killed:", "Survivors who testify give Ondrei a real case against Colonel Dessen \u2014 the Colonel\u2019s Reckoning hook fires with strength, and the party gains standing witnesses in the Ostmark. A full-lethality resolution guts the case: Dessen likely survives his inquiry, remains in grade, and remembers who ruined his quiet arrangement. Either way he learns the party\u2019s names."));
cB.push(BUL("Parley vs. assault at Redwatch:", "A parley resolution seeds the party\u2019s reputation as problem-solvers rather than killers \u2014 word travels ahead of them on the roads (advantage on first-impression Persuasion with Ostmark commonfolk). An assault reputation closes some doors and opens others: certain warlords\u2019 recruiters take notice."));
cB.push(BUL("Yanna\u2019s treatment:", "Treated kindly, she becomes a recurring road-contact and, much later, a witness whose testimony about \u201Cthe sergeant\u2019s shadow\u201D matters. Dismissed or frightened, she vanishes into the teamster circuits and the campaign loses its only civilian eyewitness to the first manifestation."));
cB.push(BUL("The medallion:", "If no player chooses to carry Dren\u2019s medallion, do not force it \u2014 but note that Vaelindra\u2019s Session Two question (\u201Chas anything cold come into your possession?\u201D) lands differently, and the Session Three and Six cold-resonance beats need an alternate carrier (Ondrei forwards it to the capital as evidence, where it can resurface)."));
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
cC.push(P("Designed for a five-hour session, which comfortably fits all three road encounters \u2014 run them all, in any order. Suggested pacing budget: the morning after (45 minutes); the road encounters (50 minutes each, 150 total); arrival at the capital (20 minutes); the academy and the archivist (45 minutes); finding Vaelindra (40 minutes). The Vaelindra scene must end the session on her confirmation, not her explanation \u2014 hold the full conversation for Session Three\u2019s opening. If time runs short, trim the toll bridge to its reveal-and-fold beat rather than cutting it entirely; its thematic note is worth thirty seconds even in passing."));

cC.push(H1("Scene 1: The Morning After"));
cC.push(P("Open at the Gilded Ford\u2019s common room at dawn. Do not summarize \u2014 let the party have the conversation. Useful questions to let hang in the air: Do they tell anyone? (Their exercise supervisor expects a report; does the dream go in it?) Do they still graduate and found the company as planned? Does anyone try to rationalize it \u2014 shared meal, shared stress, the thing at Redwatch preying on their minds? A character proposing the rational explanation should be allowed to \u2014 and should privately notice it does not survive contact with the details: six people do not dream the same engraving-perfect view of a city most have never visited, down to the count of the towers."));
cC.push(P("Academy characters know (no check needed) that prophecy and omens are Church jurisdiction \u2014 and that reporting a shared apocalyptic vision through official channels means clergy, questions, and possibly a heresy inquiry into whether they invited it. That institutional chill is worth making explicit early: it explains why the road to answers will run through quiet referrals instead of official ones."));

cC.push(H1("Scene 2: The Road \u2014 Three Encounters"));
cC.push(P("The journey to the capital takes four days by the imperial road. These encounters are modular and reorderable. None is primarily a combat encounter; each is the fractured empire teaching the party what restoration is actually up against. Combat statistics are provided in case the party chooses steel \u2014 the empire will not stop them from learning things the hard way."));

cC.push(H2("Encounter A: The Checkpoint at Varn\u2019s Crossing"));
cC.push(BOX("The imperial road narrows at a stone bridge, and across it stands a barrier of sharpened stakes that is definitely not imperial engineering. Soldiers in half-familiar colors \u2014 imperial cut, but the wolf on their tabards has been re-stitched over with a black elk \u2014 wave wagons into a queue. A hand-painted board reads: ROAD LEVY. 5 SILVER THE HEAD. BY ORDER OF LORD OSTREV, PROTECTOR OF THE CROSSING."));
cC.push(P("Sergeant Petra Malich commands twelve Provincial Soldiers. Lord Ostrev is a minor border lord, nominally loyal to the throne, who has decided that \u201Cprotecting\u201D this stretch of imperial road entitles him to tax it \u2014 a legal fiction with no imperial authorization whatsoever. Malich knows it, hates it, and enforces it, because her men have not been paid in anything but Ostrev\u2019s scrip for a year."));
cC.push(P("The interesting choice: academy signets exempt students from provincial tolls on imperial roads \u2014 by law. Invoking that law is legally airtight and socially explosive: Malich\u2019s face hardens, the queue of farmers watches students in capital uniforms walk free of a toll the farmers must pay, and the party gets its first taste of what imperial privilege looks like from underneath. Paying quietly, arguing the law, negotiating for the whole queue, or making a scene are all valid \u2014 there is no clean answer, which is the point. A DC 14 Charisma (Persuasion) check gets Malich talking honestly if the party is respectful: about pay, about Ostrev, about the last imperial inspector who came through (\u201Cfour years ago; he took notes and a bribe, in that order\u201D). Fighting twelve soldiers is possible and foolish; Malich\u2019s orders are to collect, not to die, and she yields the crossing rather than lose men \u2014 then reports it, and the party has made an enemy of a lord."));

cC.push(H2("Encounter B: The People from Halvenne"));
cC.push(BOX("You smell the woodsmoke before you see them: forty-odd people camped in the ditch-shadow of the imperial road, in the organized misery of people who have done this before. Cookfires, bundles, a mule that has been asked for too much. An old woman sits on a milestone as though it were a throne, watching you approach with the unhurried attention of someone who has already seen everything she was afraid of."));
cC.push(P("Refugees from Halvenne, a market village in the Brekelands two weeks west, burned in a skirmish between the companies of the warlords Bettra Skarn and Ilmarch Voss \u2014 the Granary War, as the sourcebook\u2019s Atlas has it: not a war, nothing so organized; a dispute over a granary that became a fire that became forty homeless families. They are walking to the capital because the old woman, Semya, remembers her grandmother saying the throne feeds its own. Nobody has the heart to tell her how long ago that was."));
cC.push(P("What this encounter is for: charity with real texture (the party has money now; what does it buy, and what can\u2019t it?), information (Semya\u2019s people passed three other burned villages this season \u2014 the border situation is worse than capital dispatches admit), and one quiet seed, delivered unprompted if the party is kind. Semya says:"));
cC.push(BOX("\u201CYou\u2019re young for whatever\u2019s riding you. I\u2019ll tell you what I told the priest at Halvenne, before it burned: the dogs have been howling at nothing since the spring. The wells taste of ash where no fire\u2019s been. My grandmother had a word for a season like this one. She called it an indrawn breath.\u201D"));
cC.push(P("Semya knows nothing concrete \u2014 she is not a seer, just old and paying attention. That is precisely why she matters: the world itself has begun registering what the party saw in the vision. If the party helps her people (coin, escort for a day, a letter to Ondrei recommending Dravenna take them in \u2014 that last is the elegant solution, and he will), Semya blesses them in the old country way and the campaign gains forty grateful witnesses in whatever place they land. If the party does nothing, the Halvenne refugees reach Aenodira anyway and disappear into Farrowgate, the district along the Long Wall where the fractured empire\u2019s displaced accumulate \u2014 and the party may meet them there again, in worse circumstances, wondering if anyone could have helped."));
cC.push(P("DM texture (optional, unremarked): a few among the band keep the northern rite, and at dusk they hold a brief roadside Vigil \u2014 a ring of small stones, a shared candle, a plain Orlathine cadence the party has no reason to recognize. It is Harvestide, and they are keeping the season\u2019s dead the way the north does. If asked, Semya says only, \u201CWe lost people in the south, some years back. This is the week for it.\u201D She means the Vintage Night, six years gone this week, and will not say the name to strangers. Players need not connect it to anything; it is the same season tolling under a different roof."));

cC.push(H2("Encounter C: The Toll That Isn\u2019t"));
cC.push(BOX("The last river crossing before the capital district is a fine old imperial bridge \u2014 and a new chain across it, and a table, and a man in very good clothes behind the table, flanked by four professionals whose knuckles say they were not hired for their handwriting. The man smiles like a document with a seal on it. \u201CBridge maintenance assessment,\u201D he says. \u201COne gold the wagon, two silver the walker. All proper. I have the writ.\u201D"));
cC.push(P("Odric Hale is a racketeer with excellent paperwork. His writ is real parchment with a real wax seal \u2014 of the Office of the Imperial Roads Commission, Eastern Circuit, an office abolished sixty years ago. He bought the dead seal from a dealer in such things and has been farming this bridge for a season. A DC 13 Intelligence (History or Investigation) check \u2014 or any Seal-house character who handles the writ, automatically \u2014 spots the anachronism instantly. This is a gift of a moment for a law-focused character: the first time their education simply wins."));
cC.push(P("Confronted, Odric calculates: he folds instantly before force or credible legal threat (DC 12 Intimidation or Persuasion once the writ is exposed \u2014 he is a businessman, not a soldier), offers a 20 gp \u201Cadministrative apology,\u201D and decamps to try again elsewhere unless the party escorts him to capital authorities, which they can. His enforcers fight only if the party attacks first, and abandon him at half strength. The thematic note, worth a beat at the table: sixty years on, the empire\u2019s dead institutions still have power \u2014 as costumes. A broken seal still opens purses. Authority outlives the thing that granted it. File that thought; the campaign will rhyme with it."));

cC.push(H1("Scene 3: The Capital"));
cC.push(BOX("You crest the pilgrim hill at the hour the light goes bronze, and there it is \u2014 the city from a thousand engravings, the city from your nightmare. It is vast beyond the drawings: ring on ring of walls in three colors of stone from three ages of empire, the river bent around it like a guard\u2019s arm, and above the haze of a hundred thousand cookfires, the two summits every schoolchild knows \u2014 the golden dome of the Great Temple of the Matron, and the white mass of the imperial palace, holding up the Lupine Throne. It is magnificent. And because you have seen it burning \u2014 seen these exact towers, this exact skyline, wrapped in fire that moved wrong \u2014 your first sight of the capital arrives with a shadow already on it. The bells begin the evening peal, and every one of you, without meaning to, counts the towers. The count matches the dream."));
cC.push(P("(DM note: the capital is Aenodira \u2014 use the name freely in read-aloud and dialogue from this point forward. See the sourcebook\u2019s Geography and Locations section for the ring structure and district layout referenced below.) Keep the arrival to broad, textural strokes ahead of full street-level detail: grandeur next to strain. Triumphal columns with scaffolding on them; a great aqueduct arch bricked up and rented out as housing in the Archwork; imperial banners bright and new over gates whose stonework is patched. The Emperor\u2019s restoration is visible \u2014 fresh paint, work crews, official proclamations of the coming Zhuvedian Laws posted at crossroads and along the Long Course \u2014 and so is everything it is up against."));
cC.push(P("(DM-only atmosphere, for a party that lingers or returns at dawn: the court keeps no public mourning for the Empress \u2014 there is no body, no confirmed death, and an interregnum the throne would rather forget, so the anniversary of her disappearance passes officially unmarked. What a sharp-eyed party might notice, and never be told the meaning of, is that on one grey Harvestide dawn the Emperor walks the Long Course alone, his guards held at a distance, longer than his usual circuit, and the proclamation-criers do not cry that morning. It is the third year. He has entered no room of hers in any of them. None of this is offered to the players; it is the season keeping its own accounts.)"));

cC.push(H1("Scene 4: The Academy and the Archivist"));
cC.push(P("The Imperial Academy of the Lupine Throne, in Scholar\u2019s Row, is the one place in Aenodira that feels fully ordered: swept courts, ringing bells, first-years drilling. The party files its exercise report (Ondrei\u2019s letter of commendation, if earned, raises eyebrows approvingly), and unless they volunteer the vision, the report closes routinely. Their supervising instructor notes they seem tired, congratulates them, and reminds them commencement is in five weeks."));
cC.push(P("The path to Vaelindra runs through Archivist Dathenor Vell \u2014 hill dwarf, ancient by human reckoning, keeper of the academy\u2019s restricted stacks, and precisely the kind of institutional fixture who has outlasted four chancellors by knowing everything and volunteering nothing. Any party that starts researching shared visions, omens, or prophetic phenomena in the library lands in his domain within the hour; alternatively, any trusted instructor, asked discreetly, sends them to him. Vell listens to whatever the party is willing to say \u2014 he does not push \u2014 and then does something he almost never does: he closes the ledger in front of him."));
cC.push(BOX("\u201CI will tell you three true things, and then I will tell you an address, and then we will agree this conversation was about overdue books. First: what you are describing is not in any collection I keep, and I keep the collections that officially do not exist. Second: the Church\u2019s Office of Omens would receive you politely, question you separately, and resolve you into a file. I recommend against becoming a file. Third: there is a woman in the Coppergate district who was doing what the Office of Omens pretends to do before your instructors were born. She sees people who are referred, and she has not accepted a referral from me in eleven years. Tell her the archivist still keeps her letters. The house with the blue shutters, above the copyist\u2019s shop, Ninth Lane off the Coppergate fountain. Go in daylight. She distrusts people who prefer the dark \u2014 and lately, my young colleagues, so do I.\u201D"));
cC.push(P("(DM note: Vell knew Vaelindra when both were young functionaries \u2014 he in the imperial archives, she in the Church \u2014 and he is one of perhaps three people who know why her Church career actually ended. He will not say so. His referral phrase, \u201Cthe archivist still keeps her letters,\u201D is genuine: he does, and she will know instantly that he means it. Eleven years ago he sent her someone whose vision ended badly; he has been ashamed to presume on her since. He is a superb recurring resource \u2014 research, restricted stacks, institutional memory \u2014 and his protectiveness of Vaelindra is real and mutual.)"));

cC.push(H1("Scene 5: The Still Waters"));
cC.push(P("Coppergate is a middle district: copyists, instrument-makers, retired functionaries, laundry between balconies. The blue-shuttered house is exactly where Vell said. A copyist\u2019s shop occupies the ground floor; a side stair leads up. The woman who answers the door is small, silver-haired, and entirely unremarkable except for the quality of her attention, which arrives like a hand on the shoulder."));
cC.push(P("Run the scene by her rules, which she states pleasantly and does not bend: she asks the questions first. Before she will hear one word of the vision, she seats the party, makes tea with unhurried thoroughness, and interviews them \u2014 names later, first: Who sent you? (The letters phrase visibly lands; something in her posture sets down a weight.) When did it happen \u2014 the hour, as precisely as you can? Had you shed blood that day? (She asks it evenly. The Redwatch answer interests her greatly.) Has anything cold come into your possession? (If the party carries Dren\u2019s medallion and produces it, she goes still for three full seconds \u2014 the only crack in her composure all evening \u2014 then asks, quietly, to be allowed to not touch it.)"));
cC.push(P("Only then does she hear the vision \u2014 and she takes it like a physician taking a history: no gasps, no mysticism, a pen moving in a ledger of her own shorthand, one clarifying question per detail. Which direction did the flames lean? Did the sound arrive before or after your gaze was pulled upward? How many towers did you count? When the account is complete, she sets down the pen, and the session ends on the following, delivered with the calm of a woman who has waited a long time to be wrong and has just learned she is not:"));
cC.push(BOX("\u201CI am going to tell you three things tonight, and none of them is a comfort, and the rest will wait for daylight, because you are exhausted and this next part deserves your whole mind. The first thing: your vision is real. It is not stress, not shared fancy, not something you ate. I have taken accounts like a physician takes histories for fifty years, and yours has the pulse of the true ones. The second thing: it is not yours alone. I have heard these images before \u2014 not this vision, but its relatives. Fragments. Edges. The storm, the wrong-colored fire, the thing behind the sky. They have been arriving for a long time, from people who had never met, and lately they arrive more often. Whatever this is, it did not begin with you, and it is already in motion. The third thing \u2014 and hold to this one, because it is the only mercy I have for you tonight: in fifty years, I have never known a shared vision to show what must happen. They show what is coming if nothing changes. Nothing changes, that is, unless someone changes it. Go and sleep, if you can. Come back at the tenth bell. And children \u2014 \u201D she glances, once, at the pocket where the cold thing rides, \u201C \u2014 walk in the light on your way home.\u201D"));
cC.push(P("End the session there. Do not play the walk home. Session Three opens at the tenth bell, with tea going cold and Vaelindra deciding \u2014 based on everything the party said and did tonight \u2014 how much of the truth they can carry."));

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
cC.push(B("The Wandering Lecturer (~40 minutes):", "At a waypoint inn, one Magister Emeritus Pontellus Vorn \u2014 expelled from three provincial academies, by his own proud account \u201Cfor excessive rigor\u201D \u2014 delivers an unsolicited evening lecture on the capital\u2019s three walls, wrong in nearly every particular and magnificent in all of them. Let an academy-trained party squirm, correct him, or bait him. Comic texture with one buried gift: among his nonsense, one claim is true \u2014 \u201Cthe Long Wall was built for a city that never came\u201D \u2014 and a party that fact-checks him later discovers the strange experience of the fool being right once. Vorn is a renewable comic NPC; he will resurface in Aenodira, lecturing pigeons if no one else will listen."));
cC.push(H1("Diverging Paths (DM Only)"));
cC.push(P("Outcomes here echo forward. Record them in the Branch Ledger."));
cC.push(BUL("Semya\u2019s people:", "Resettled in Dravenna: forty grateful witnesses and a standing Ostmark listening post; the Forty Witnesses hook fires warm. Left to the road: they land in Farrowgate, and the Session Five optional client \u2014 the family whose daughter went to Greywell \u2014 lands among them, harder and angrier. Both branches work; they change the temperature of every later Farrowgate scene."));
cC.push(BUL("Sergeant Malich:", "Respected: a quiet friend inside a border lord\u2019s garrison \u2014 and if Lord Ostrev\u2019s toll ever reaches an imperial court, a conscience deciding which way to testify. Humiliated before her men or forced to yield the crossing: Ostrev hears of it, and the party has a minor lord\u2019s durable enmity plus a checkpoint that remembers them on every future eastern journey."));
cC.push(BUL("Odric Hale:", "Escorted to capital authorities: his dead-seal supplier becomes discoverable evidence \u2014 Session Five\u2019s Rivergate investigation begins with a live lead and Tirell Mosse already nervous. Released with his \u201Capology\u201D: he resurfaces working a different bridge under a different dead office, and Mosse\u2019s shop has had time to tidy its ledgers. Killed: the supplier thread survives, but colder."));
cC.push(BUL("The report and the vision:", "If the party volunteers the shared vision in their official exercise report, it enters academy records \u2014 and the Office of Omens\u2019 Session Five attention arrives with documentary teeth instead of rumor. Discretion here is armor later; indiscretion is not fatal, merely expensive."));
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
  Packer.toBuffer(docShell(cA)).then(b => fs.writeFileSync("/home/claude/QS_Session_0_Primer.docx", b)),
  Packer.toBuffer(docShell(cB)).then(b => fs.writeFileSync("/home/claude/QS_Session_1_The_Silent_Road.docx", b)),
  Packer.toBuffer(docShell(cC)).then(b => fs.writeFileSync("/home/claude/QS_Session_2_The_Road_Back.docx", b))
]).then(() => console.log("All three written."));
