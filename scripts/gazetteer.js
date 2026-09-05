const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat } = require('docx');
const fs = require('fs');

const { stagePath } = require('./stage');
// ---------- helpers ----------
const P = (text, opts = {}) => new Paragraph({
  spacing: { after: 200 },
  ...opts,
  children: [new TextRun({ text, ...(opts.run || {}) })]
});

// paragraph from segments: [{t: "text", b: bool, i: bool}]
const PS = (segs, opts = {}) => new Paragraph({
  spacing: { after: 200 },
  ...opts,
  children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i, color: s.c }))
});

const DM = (t) => ({ t, b: true, c: "5B1F1F" });   // DM-only marker: bold book-red
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, keepNext: true, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, keepNext: true, children: [new TextRun(t)] });

const BULLET = (segs) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 120 },
  children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i, color: s.c }))
});

const B = (lead, rest) => PS([{ t: lead + " ", b: true }, { t: rest }]);
const BUL = (lead, rest) => BULLET(lead ? [{ t: lead + " ", b: true }, { t: rest }] : [{ t: rest }]);
const { Table, TableRow, TableCell, WidthType, ShadingType, TableLayoutType } = require('docx');
// Column widths in twips. docx-js emits a dummy equal-width <w:tblGrid> when
// columnWidths is absent, and LibreOffice honours that grid over the per-cell
// percentages -- every table renders with evenly split columns. Passing the
// grid explicitly, with a fixed layout, is what makes the widths array mean
// anything. Proportions are what matter; tblW=100% governs the total.
const CW = (w) => { const t = w.reduce((a, b) => a + b, 0); return w.map((x) => Math.round(9026 * x / t)); };

const cell = (text, opts = {}) => new TableCell({ width: { size: opts.w || 20, type: WidthType.PERCENTAGE }, shading: opts.head ? { type: ShadingType.CLEAR, fill: "E4DCCB" } : undefined, margins: { top: 50, bottom: 50, left: 45, right: 45 }, children: [new Paragraph({ spacing: { after: 0 }, alignment: AlignmentType.LEFT, indent: { firstLine: 0 }, children: [new TextRun({ text, bold: !!opts.head, size: 18 })] })] });
// Body rows may split across a column break. cantSplit here would stop the whole table
// from flowing into the next column, and LibreOffice answers that by dropping the rows
// that no longer fit -- silently, with the build reporting clean. The header row keeps
// cantSplit and repeats above the continuation instead. The distances table below is the
// one that actually reached a break, and lost eleven of its twelve rows to this.
const row = (cells) => new TableRow({ children: cells });
// The header row repeats when a long table spans a column or page break.
const headerRow = (cells) => new TableRow({ children: cells, cantSplit: true, tableHeader: true });
const table = (headers, widths, rows) => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: CW(widths), layout: TableLayoutType.FIXED, rows: [ headerRow(headers.map((h, i) => cell(h, { head: true, w: widths[i] }))), ...rows.map(r => row(r.map((v, i) => cell(v, { w: widths[i] })))) ] });
const mod = (v) => { const m = Math.floor((v - 10) / 2); return (m >= 0 ? "+" : "\u2212") + Math.abs(m); };
const abCell = (text, bold) => new TableCell({ width: { size: 16.6, type: WidthType.PERCENTAGE }, shading: bold ? { type: ShadingType.CLEAR, fill: "E4DCCB" } : undefined, children: [new Paragraph({ keepNext: !!bold, alignment: AlignmentType.CENTER, spacing: { after: 40, before: 40 }, children: [new TextRun({ text, bold: !!bold, size: 20 })] })] });
const SB = (d) => { const out = []; out.push(new Paragraph({ keepNext: true, spacing: { before: 240, after: 40 }, children: [new TextRun({ text: d.name, bold: true, size: 26, color: "5B1F1F" })] })); out.push(PS([{ t: d.meta, i: true }], { keepNext: true, spacing: { after: 120 } })); out.push(B("Armor Class:", d.ac)); out.push(B("Hit Points:", d.hp)); out.push(B("Speed:", d.speed)); out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: CW([1, 1, 1, 1, 1, 1]), layout: TableLayoutType.FIXED, rows: [ new TableRow({ cantSplit: true, children: ["STR","DEX","CON","INT","WIS","CHA"].map(h => abCell(h, true)) }), new TableRow({ cantSplit: true, children: [d.str,d.dex,d.con,d.int,d.wis,d.cha].map(v => abCell(v + " (" + mod(v) + ")")) }) ] })); out.push(P("", { spacing: { after: 60 } })); if (d.saves) out.push(B("Saving Throws:", d.saves)); if (d.skills) out.push(B("Skills:", d.skills)); if (d.resist) out.push(B("Damage Resistances:", d.resist)); if (d.immune) out.push(B("Damage Immunities:", d.immune)); if (d.condimmune) out.push(B("Condition Immunities:", d.condimmune)); if (d.senses) out.push(B("Senses:", d.senses)); if (d.langs) out.push(B("Languages:", d.langs)); out.push(B("Challenge:", d.cr)); (d.traits||[]).forEach(t => out.push(PS([{ t: t.n + ". ", b: true, i: true }, { t: t.t }]))); if (d.actions && d.actions.length) { out.push(PS([{ t: "ACTIONS", b: true }], { keepNext: true, spacing: { before: 80, after: 80 } })); d.actions.forEach(a => out.push(PS([{ t: a.n + ". ", b: true, i: true }, { t: a.t }]))); } if (d.reactions && d.reactions.length) { out.push(PS([{ t: "REACTIONS", b: true }], { keepNext: true, spacing: { before: 80, after: 80 } })); d.reactions.forEach(a => out.push(PS([{ t: a.n + ". ", b: true, i: true }, { t: a.t }]))); } return out; };



// ---------- content ----------
const children = [];

// Title block
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 300 },
  children: [new TextRun({ text: "Gazetteer of the Fractured Empire", bold: true, size: 44 })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 120 },
  children: [new TextRun({ text: "The Qilvayas Symphony", italics: true, size: 26 })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 300 },
  children: [new TextRun({ text: "A DM\u2019s road-book: thirty settlements keyed for play, the roads between them, what happens on those roads, and what lives beside them", italics: true, size: 22, color: "5B1F1F" })]
}));

children.push(H1("How to Use This Book"));
children.push(P("The Campaign Setting says what the empire is. This book says what happens when the party goes there. It is drawn outward from that book\u2019s Regions in Depth and never rivals it: where the Gazetteer and the sourcebook disagree, the sourcebook wins. It is organized for the moment a DM most needs it: the players have announced they are riding to Ambervale, and the session is in four minutes."));
children.push(P("Every settlement entry has the same six lines, in the same order, so the eye learns where to land. What it is, in a sentence you can read aloud in paraphrase. Who runs it. What you can actually buy, priced against the sourcebook\u2019s commerce tables. Who to talk to, with a name and a want. The complication, which is the reason the place is in this book rather than on a map. And, where it earns one, a DM-only line."));
children.push(P("Names invented for this volume are flagged nowhere, because flagging them in the text would be useless at the table: they are all new, all minor, and all vetoable. Nothing here contradicts the sourcebook, and where a settlement was already named in canon, the canonical sentence is preserved and built outward from rather than replaced."));
children.push(PS([DM("DM Only: "), { t: "roughly one entry in four carries a thread that reaches something larger \u2014 the Undercourt, the Twin Clocks, Nyreeza\u2019s trail, the shadow\u2019s feeding. They are marked. None of them is load-bearing on its own; the campaign survives a party that never visits a single one. They exist so that a party who wanders is rewarded for wandering rather than parked." }]));

children.push(H1("The Road"));
children.push(P("The imperial roads are the empire\u2019s best surviving argument for itself. They were cut for legions, they are maintained by the Roads Commission where the Commission still functions, and along the loyalist trunk routes they are genuinely excellent: poplar-lined, stone-cambered, drained, and marked at every league with a stone bearing the distance to Aenodira and nothing else, because there was a time when that was the only distance that mattered. Past the Crownlands the surface holds and the maintenance does not. Past the loyalist provinces there is no Commission, and a road is whatever the last three generations have worn into the ground."));

children.push(H2("Travel Pace"));
children.push(P("Standard 2014 travel rules apply without amendment. The table below is the same rules with the empire\u2019s own furniture on them, so a DM can answer the two questions that actually come up: how long, and what does it cost."));
children.push(table(
  ["Pace", "Per Day", "Effect", "In the Empire"],
  [14, 16, 34, 36],
  [
    ["Fast", "30 miles", "Disadvantage on Perception; cannot use stealth", "The courier pace. Imperial post-riders change horses at every third league-stone on the trunk roads and hold this all day; nobody else does."],
    ["Normal", "24 miles", "None", "A merchant train, a legion on the march, a party with somewhere to be. Assume this unless told otherwise."],
    ["Slow", "18 miles", "May use stealth", "Pilgrims, refugees, anyone with a cart on a provincial road, and anyone who does not want the Watch counting them at the gate."]
  ]
));
children.push(B("Forced march.", "Beyond eight hours, a DC 10 Constitution save per additional hour or gain one level of exhaustion, on the 2014 ladder. Worth remembering that this empire\u2019s exhaustion has a cultural reading: a legionary who collapses on the march has broken nothing, but a legionary who falls out and does not rejoin has, and the difference is the whole of Book Six\u2019s desertion clause."));
children.push(B("Mounts and vehicles.", "A horse holds a gallop for one hour. A wagon on an imperial trunk road makes normal pace; on a provincial road it makes slow pace and throws a wheel on a 1 in 20 per day. River passage down the Ostrun runs faster than any road \u2014 Aenodira to Velmareth in ten days with the current, sixteen back against it \u2014 which is why the delta is rich and the Crownlands are not a port."));

children.push(H2("Distances by Imperial Road"));
children.push(P("From Aenodira, at normal pace, on the best surviving surface. Add a third to every figure in winter, half again in the Brekelands, and any number you like past the Fence."));
children.push(table(
  ["To", "Days", "Route and Condition"],
  [26, 12, 62],
  [
    ["Varn\u2019s Crossing", "1", "The eastern trunk road. Excellent surface, tolled at the bridge, patrolled twice daily."],
    ["Lupenna", "2", "The Matron\u2019s Road, walked not ridden. Excellent, crowded, and the only imperial road with a formal begging ordinance."],
    ["Whitequay", "2", "River road north. Good surface; barge traffic makes it faster to go by water in either direction."],
    ["Dravenna", "4", "The eastern trunk road past Varn\u2019s Crossing. Good to the Ostmark border, adequate after."],
    ["Kolvess", "6", "As Dravenna, then two days north on a legion spur. Maintained by the Third, which is to say patchily."],
    ["Caldessa", "7", "The southern road. Excellent the whole way; the Suthmark pays for its own upkeep and says so."],
    ["Ambervale", "6", "Southern road, then a day east on cart-track through vineyard country. Slow pace after the turn."],
    ["Velmareth", "10 down / 16 up", "By river. There is a road and nobody sane uses it."],
    ["Orlath", "16", "North road to the taiga edge, then the pilgrim way. The last four days are switchbacks and cannot be ridden."],
    ["Norr\u2019s Watch", "18", "West road through the Brekelands. The Brekeland stretch is the dangerous part; the Normere stretch is the best-maintained road in the world."],
    ["Kamenhold", "21", "West, then southwest into the highlands. Imperial road ends at the border; Tarnovari roads are stone, narrow, and older."],
    ["Karvholm", "26", "Overland through Orlath, or by sea from Velmareth in eleven days if the Skell are not out. They are usually out."]
  ]
));

children.push(H2("Papers, Tolls, and the Gate"));
children.push(P("The new Laws have made travel a documentary exercise, and Book Four\u2019s seal-and-register requirements are the single most common friction a party will meet on the road. A DM should have three answers ready."));
children.push(BUL("At a bridge or gate in loyalist territory:", "a toll (a Zhuven per wagon, two strands per walker at Varn\u2019s Crossing; less elsewhere), and, since Book Three, a look at your charter if you are carrying trade goods. A party\u2019s academy commission covers this. A party\u2019s academy commission covering this is itself worth a scene the first time it works."));
children.push(BUL("At a provincial gate:", "the toll is real and the paperwork is theatre. What the gate-sergeant actually wants is to know whether you are a problem. DC 12 Charisma (Persuasion), or a legion name, or a coin."));
children.push(BUL("Past the loyalist border:", "there is no toll, and that is not good news. Somebody is still collecting; they simply do it further along, without a gate, and there is no schedule of charges."));

children.push(H1("Hazards of the Road"));
children.push(P("Overland travel in the fractured empire is dangerous in three registers, and a DM who mixes them will never run a boring journey. There is weather, which is indifferent. There is banditry and its cousins, which is human and negotiable. And there is thin-written ground, which is neither."));

children.push(H2("Thin-Written Ground"));
children.push(P("Sites of oath-breaking at scale resist beneficial magic, sour divination, and hold cold. The sourcebook establishes the principle; this is how to run it without inventing a subsystem."));
children.push(table(
  ["Degree", "Where", "At the Table"],
  [16, 32, 52],
  [
    ["Faint", "An old parley-breach, a burned grange, a village that turned somebody out", "The party feels it and cannot say why. Divination in the area returns emotional impressions rather than answers. No mechanics."],
    ["Marked", "Halvenne\u2019s ashes, the Weld, a massacre-field under a parley sign", "Ritual casting takes twice as long and may simply fail. Long rests restore half the usual Hit Dice. Undead in the area are more numerous than the terrain explains."],
    ["Scarred", "The Cold Door, the deeps beneath the Old Forum", "Wards will not anchor. Divination returns grief. Cold that is not weather. Adjudicate as story, always; the moment it becomes a save it stops being frightening."]
  ]
));
children.push(PS([DM("DM Only: "), { t: "thin-written ground is the shadow\u2019s footprint and the party\u2019s most reliable instrument for finding it, which is why Dren\u2019s medallion works. Let them build the correlation themselves over sessions. The first time a player says the cold means something happened here, do not confirm it and do not deny it." }]));

children.push(H2("Weather and the Season"));
children.push(P("The imperial calendar is a working document for travel. Roads reopen in Thawtide and close in Greywane; a party that ignores this will spend Longdark discovering why the empire arranged its year the way it did."));
children.push(table(
  ["Season", "Months", "On the Road"],
  [18, 26, 56],
  [
    ["Deep winter", "Wolfmoon, Longdark, Threshold", "Northern passes closed. Trunk roads passable and miserable. DC 10 Constitution save each day of exposure without shelter or lose 1 Hit Die of healing on the next long rest. The Nine Winters Way is walked in this season on purpose, by people making a point."],
    ["Spring", "Thawtide, Sowmonth, Greening", "Mud. Wagons make slow pace regardless of road quality until Greening. River crossings above the fords are dangerous for three weeks."],
    ["Summer", "Solacre, Haymonth", "The best travel of the year and the worst company: every road is full. Ambush is less likely and every inn is taken."],
    ["Autumn", "Harvestide, Vinmoon, Fallowmonth", "Excellent until Fallowmonth, then the rains. The Suthmark roads are impassable with carts for ten days somewhere in Fallowmonth and nobody can predict which ten."]
  ]
));

children.push(H2("Six Road Hazards, With Mechanics"));
children.push(B("The Washed Culvert.", "A road-drain has collapsed under the camber and the surface above it is intact and hollow. First creature of Large size or heavier to cross: DC 13 Wisdom (Perception) to notice the drum-note underfoot, or the surface gives. The creature falls 10 feet (2d6 bludgeoning, DC 12 Dexterity save for half) into running water and must make a DC 12 Strength (Athletics) check to get out unaided. A wagon that goes in is a four-hour problem, or a lost wagon."));
children.push(B("The Toll That Is Not One.", "Three men at a rope across a provincial road, wearing enough of a uniform. They are deserters, they are frightened, and they will take a plausible refusal. DC 13 Insight reads the fear; DC 13 Intimidation or Persuasion ends it without a fight. If fought, they break at half strength and one of them will be a witness later. Use Bandit statistics; the point is the negotiation."));
children.push(B("Wolf-Sign.", "Wolves in this empire are read for omens, and the reading is a real social hazard rather than a monster. A pack crosses the road ahead and does not threaten. Whether they crossed left-to-right or right-to-left is a thing every carter, pilgrim, and legionary present will have an opinion about within one minute, and a party that dismisses it will be marked as capital people who do not know anything. DC 12 Religion or a Suthmark background reads it correctly. The pack is not the encounter. The other travelers are."));
children.push(B("The Sunken Milestone.", "A league-stone reading a distance that is wrong by nine miles. It is not wrong; the road was straightened two centuries ago and the stone was never moved, and the old line runs through a wood the current road avoids. DC 14 Intelligence (History) or a Seal education recognizes the discrepancy. Following the old line is a day lost and a discovery \u2014 a bridge abutment, a shrine, a burned posting-house that is faint thin-written ground."));
children.push(B("Fever Water.", "A well or stream carrying the Damp or its cousins. DC 12 Constitution save on drinking untreated; on a failure, the effects in the sourcebook\u2019s Medicine and Disease, onset at the next dawn. A healer\u2019s kit and a DC 13 Wisdom (Medicine) check identifies bad water before anyone drinks. This is the single most common cause of a ruined journey in the empire and the least dramatic, which is exactly why it should happen once."));
children.push(B("The Crossing Under Weight.", "A ford or a rope bridge that will hold a party or a party\u2019s mounts but not both at once, in front of an approaching problem \u2014 weather, a patrol, a pack. The hazard is the decision, not the DC. Give them three rounds and make them choose what stays behind."));

children.push(H1("Encounters on the Road"));
children.push(P("Each region below carries a d12 table. Roll once per travel day on a good road, twice on a bad one, and once more for any night spent outside a settlement. Roughly half of every table is not a fight, on purpose: an encounter table whose every entry is initiative teaches players that the world is a corridor with monsters in it."));
children.push(P("A name followed by a bracketed dagger \u2014 (\u2020) \u2014 is a Monster Manual creature outside the SRD: look its stat block up rather than pulling it from the open data, or substitute freely. Everything else is SRD. The key is repeated under every table that uses it."));

// ---------- settlement entry helper ----------
// Six lines, same order every time, so the eye learns where to land.
const LOC = (d) => {
  const out = [H3(d.name + " \u2014 " + d.kind)];
  out.push(PS([{ t: d.stat, i: true }]));
  out.push(B("What it is.", d.what));
  out.push(B("Who runs it.", d.runs));
  out.push(B("What you can get.", d.buy));
  out.push(B("Who to talk to.", d.talk));
  out.push(B("The complication.", d.comp));
  if (d.dm) out.push(PS([DM("DM Only: "), { t: d.dm }]));
  return out;
};

const ENC = (region, rows) => {
  const out = [
    PS([{ t: "Encounters \u2014 " + region + " (d12)", b: true }], { spacing: { before: 160, after: 100 } }),
    table(["d12", "What Happens"], [11, 89], rows)
  ];
  // A dagger marks a Monster Manual creature outside the SRD. Repeat the key under any
  // table that actually uses one: the legend at the front of the book is eight to eleven
  // pages away by the time a DM has flipped to the Normere table, and a bare symbol with
  // no key on the page reads as a corruption rather than a note.
  if (rows.some((r) => r.some((cellText) => cellText.indexOf("\u2020") >= 0))) {
    out.push(PS([{ t: "(\u2020) Monster Manual, outside the SRD \u2014 look the stat block up rather than pulling it from the open data, or substitute freely.", i: true }], { spacing: { after: 200 } }));
  }
  return out;
};

// ============ THE CROWNLANDS ============
children.push(H1("The Crownlands"));
children.push(P("The Ostrun\u2019s broad valley: terraced grain, cypress windbreaks, poplar-lined imperial roads, and the capital\u2019s three walls rising out of river haze. The only place in the world where imperial law functions at full strength, and the only place where everyone lives inside the restoration project whether they believe in it or not. Prosperous by current standards. Anxious by any other."));
children.push(P("The Crownlands are also where a party will spend most of the campaign\u2019s first arc, which makes the two days' ride to Lupenna and the one day to Varn\u2019s Crossing the most useful short journeys in this book: far enough to be out of the capital\u2019s eye, near enough to be back for the tenth bell."));

children.push(...LOC({
  name: "Varn\u2019s Crossing", kind: "toll town",
  stat: "Population 900. One day east of Aenodira on the eastern trunk road.",
  what: "A stone bridge older than the fracture, a customs house, four inns, and a town that exists entirely because everything going east must cross here. The bridge has three arches and the middle one is original imperial work; the Roads Commission has replaced the outer two twice and will not touch the middle, on the grounds that nobody now living knows how it was done.",
  runs: "The tollmaster, an imperial appointment, currently a tired and scrupulous man named Havel Corse who has held the post eleven years and has been offered a bribe on approximately four thousand occasions.",
  buy: "Anything a traveler forgot. Horse-hire and stabling at capital prices plus a third. A wheelwright who is genuinely excellent and knows it. No armor, no weapons above a hunting bow \u2014 the customs house takes a dim view of arms moving east in quantity, and it is watching.",
  talk: "Corse, if you want to know what has crossed the bridge and when, which he records obsessively and will share for the asking because nobody ever asks. Merrit Sabb at the Three Arches, a carter\u2019s-widow innkeeper who hears everything and repeats most of it.",
  comp: "Since Book Three\u2019s registration requirement, Corse has been instructed to record trade goods as well as tolls. He is doing it. The volume has tripled his workload, he is four weeks behind, and the backlog is a genuine vulnerability that at least three interested parties have noticed \u2014 an unregistered wagon is currently a very easy thing to be.",
  dm: "Odric Hale works this bridge when the capital is too warm for him. The toll-in-strands line the party heard on the road out is his."
}));

children.push(...LOC({
  name: "Lupenna", kind: "pilgrim town",
  stat: "Population 2,100, tripling on feast days. Two days on foot from Aenodira along the Matron\u2019s Road.",
  what: "The town that grew around the Matron\u2019s first roadside shrine, and the closest thing the empire has to a place made entirely of devotion and commerce in the same act. Candle-stalls the length of the approach, a relic market that operates with the Church\u2019s blessing and the Church\u2019s careful non-inspection, and at the center a shrine that is genuinely, quietly moving \u2014 a low stone hearth under a roof, and a bowl set outside a door.",
  runs: "Prior of the Shrine, an office of the Sanctum, held by a succession of clergy who arrive believing they will reform the relic market and leave having made peace with it.",
  buy: "Pilgrim\u2019s Wolfstones by the thousand (see the sourcebook\u2019s items of record; roughly one in forty is live and the Church insists they all are). Certified relics with provenance documents at ruinous prices. Uncertified relics with better stories at any price you like. Healer\u2019s kits, walking staves, and the best cheap boots in the Crownlands.",
  talk: "Doria Quenn, who sells uncertified relics from a stall she has held for thirty years, has never knowingly sold a fake, and can tell you the provenance of every fragment in the market including the ones the Church certified.",
  comp: "The relic market\u2019s uncertified half is technically in breach of Book Four\u2019s register requirement and has been since the Laws were drafted. Everyone knows. The Prior has not enforced it because enforcing it would end the town. Somebody, eventually, is going to make that a test case."
}));

children.push(...LOC({
  name: "Whitequay", kind: "river town",
  stat: "Population 3,400. Two days north of Aenodira; faster by barge.",
  what: "The valley\u2019s grain port, and a town that remembers when it shipped ten times more. Long stone quays built for a volume of traffic that has not existed in two centuries, half of them now used for drying nets and the other half working hard. The granaries are enormous and two thirds empty, which is the single most eloquent fact about the Crownlands economy.",
  runs: "A Concord factor and a harbor-reeve who dislike each other productively.",
  buy: "Bulk anything. River passage in either direction, cheap. Rope, canvas, pitch, and the services of people who can move heavy objects, which is more useful than it sounds.",
  talk: "Tobas Grell, a bargemaster who runs the Aenodira\u2013Velmareth route four times a year and has done since he was twelve. He knows the river\u2019s every mood and every landing between here and the delta, and he will take passengers for the company.",
  comp: "The empty granaries are collateral for loans the town cannot service, and the paper is held in Velmareth. Whitequay is, technically and quietly, owned by Harborlords who have never seen it."
}));

children.push(...ENC("the Crownlands", [
  ["1", "An imperial post-rider at the gallop, changing horses at the league-stone. He will not stop. What he is carrying is worth a Perception check."],
  ["2", "A pilgrim family bound for Lupenna, one of them genuinely ill and hoping. They will share food and want company as far as the shrine."],
  ["3", "A Watch patrol, four strong, checking charters since Book Three. Polite, thorough, and bored. Papers or a plausible story."],
  ["4", "Wolves \u2014 four, crossing the road, unhurried. Sacred and protected. The encounter is the other travelers' reaction, not the wolves."],
  ["5", "A Concord wagon train, twelve wagons, hiring guards for the eastern leg at fair rates. They have been robbed once already this season."],
  ["6", "A surveyor\u2019s stake driven into a field, and two farmers arguing about it. The Law Commission is remeasuring, and somebody is going to lose land."],
  ["7", "Bandits (4 Bandits, 1 Bandit Captain) working a wooded stretch. They are second-season deserters, not professionals, and they will take a good offer."],
  ["8", "A Long Course racing team exercising horses on a straight, wearing Gold or Grey. Cheerful, arrogant, and spoiling to be admired or fought."],
  ["9", "Giant rats (2d4) in a culvert, disturbed. Trivial \u2014 and Rivergate\u2019s wererat rumor makes any rat encounter near the capital worth one nervous beat."],
  ["10", "A body at the roadside, kept: someone has laid it out and lit a lamp and left, because the Vigil must be kept and they could not stay. Somebody has to keep the night now."],
  ["11", "A chartered thaumaturge and two apprentices raising a boundary ward, badly, and glad of an excuse to stop. Free identification of one item for the conversation."],
  ["12", "Something has died of nothing, in a field, with frost on it, in the wrong season. Faint thin-written ground. No fight. Take the note."]
]));

// ============ THE OSTMARK ============
children.push(H1("The Ostmark"));
children.push(P("Big-sky plains breaking into wooded hills eastward, watch-forts on the heights standing mostly empty, and the trade road running through all of it like a nerve. Loyal by conviction in the towns and by inertia in the countryside, which is a distinction that has never been tested and is about to be."));

children.push(...LOC({
  name: "Dravenna", kind: "market town, provincial seat",
  stat: "Population 6,000. Four days east of Aenodira.",
  what: "The Ostmark\u2019s administrative heart and the party\u2019s first town in the campaign. A walled market town gone comfortable, with a magistrate\u2019s court that works, a grain exchange that matters, and an inn on the square that has been the same inn for two hundred years under four names.",
  runs: "Magistrate Cassivar Ondrei, whose court is the model the Law Commission keeps citing and whose complaint about Colonel Dessen\u2019s grain is still somewhere in a capital inbox.",
  buy: "Everything on the sourcebook\u2019s general and adventuring tables at listed prices. Martial weapons and up to half plate. Horses. A competent physician certified under Book Three, and three uncertified ones who are cheaper and, in one case, better.",
  talk: "Ondrei himself, who will see anyone with a legitimate matter and is a far better source on the Ostmark than his rank suggests. Sergeant Petra Malich, if she is in town.",
  comp: "The grain scandal has curdled. Dessen is still in post at Kolvess, the men who fled are still officially deserters, and Ondrei\u2019s complaint has been in the capital for eleven months. The town has begun to conclude that the empire does not answer letters, which is a small thing that becomes a large one."
}));

children.push(...LOC({
  name: "Kolvess", kind: "garrison town",
  stat: "Population 2,800, plus a legion cohort at roughly half strength.",
  what: "The Third Provincial Legion\u2019s garrison town, two days north of Dravenna on a legion spur road. A place organized entirely around soldiers: barracks, a drill field, four times the number of taverns the civilian population justifies, and a quartermaster\u2019s yard where a great deal of the empire\u2019s property quietly changes hands.",
  runs: "Colonel Aurel Dessen, in law. In practice the town runs on the quartermaster\u2019s yard and the arrangements around it.",
  buy: "Military equipment at prices that should be impossible, with no questions and no paperwork. Horses of legion quality. Repairs by armorers who are very good and very cheap because they are being paid twice.",
  talk: "Hobb Tallow, the quartermaster\u2019s clerk, who keeps two sets of books, is terrified, and has been waiting three years for somebody trustworthy to ask him a direct question.",
  comp: "Dessen\u2019s name is said carefully here. The men who fled his garrison are legally deserters under Book Six, which carries the wolf-price; several of them are living within thirty miles under other names, and the town knows exactly where. Anyone who pulls this thread pulls a small war.",
  dm: "Tallow\u2019s second set of books is real, complete, and would end Dessen. He will hand it over to a party who convinces him they can survive having it \u2014 which is the actual difficulty, because Dessen has patrons in the capital and Tallow knows their names."
}));

children.push(...LOC({
  name: "Serren\u2019s Mill", kind: "crossroads village",
  stat: "Population 400.",
  what: "A village at a road-fork with a working mill, a shrine, a Vigil Hall, and a reputation for two things: poppy-milk, which it grows and processes legally under an old license nobody has reviewed in forty years, and minding its own business, which it does with a thoroughness that is almost aggressive.",
  runs: "Nobody, formally. Alder Prask, the miller, in every way that matters.",
  buy: "Poppy-milk, in quantity, cheaply, and legally. Food, shelter, and a complete absence of curiosity.",
  talk: "The vigil-keeper, an elderly woman who has kept the Hall forty years and is, per the sourcebook\u2019s observation about her profession, the best-informed person in the village about who has died owing what to whom.",
  comp: "The poppy license is worth a great deal and it is the only asset the village has. Two separate parties are interested in acquiring it: a Concord factor with paperwork, and somebody else without any. The village has decided not to notice yet."
}));

children.push(...LOC({
  name: "Redwatch", kind: "watch-fort (ruined, reoccupied)",
  stat: "Garrison: none. One of a chain of eleven; four still stand.",
  what: "The fort from the party\u2019s first field exercise, and by any later visit a place with a history they made. Stone curtain wall, a keep with a collapsed upper floor, a well that still works, and a view east that explains why somebody put a fort here.",
  runs: "Whoever is in it. This is the point of Redwatch.",
  buy: "Nothing. Redwatch is a place to hold, not a place to shop.",
  talk: "Depends entirely on the Branch Ledger.",
  comp: "The chain of watch-forts was a system, and a system with seven holes in it is not a system. Somebody at some point is going to propose regarrisoning them, and the Ostmark will discover what that costs.",
  dm: "If the party kept the Vigil at Redwatch, the fort is faintly and positively marked \u2014 the opposite of thin-written, and the only such site in the corpus. Do not explain this. Let a cleric notice it and be unable to account for it."
}));

children.push(...ENC("the Ostmark", [
  ["1", "A wolf pack shadowing the road at a distance for an hour, then gone. Read for omens by everyone present; a Suthmark or Ostmark background reads it as a good sign, which it is."],
  ["2", "A legion patrol, six strong, under-supplied and asking rather than demanding. They want news, food, or a look at your papers, in that order of sincerity."],
  ["3", "Worgs (2d3), descended from the old auxiliary kennels gone feral. Intelligent, cruel, and they will talk before they fight if it gains them anything."],
  ["4", "An empty watch-fort on a height, with smoke coming from it. Could be refugees, deserters, or the fourth thing."],
  ["5", "An ankheg in the grain flats \u2014 a farmer\u2019s ruined field, and a farmer who cannot pay but will offer everything he has."],
  ["6", "A grain wagon under legion escort, going the wrong way, at the wrong time of year, escorted by too many men."],
  ["7", "Ogres (1d2) in the hill country, working a stretch of road as a toll they have invented and are very pleased with."],
  ["8", "A griffon on the crags, hunting. It will not engage a group. A party that watches it is watching something the empire used to ride."],
  ["9", "A hedge-priest walking a circuit of four villages, glad of company, and carrying news from all four."],
  ["10", "Wights (\u2020) in a failed watch-fort \u2014 a dead garrison that never stood down. They will not leave the fort. Something has made them restless this season."],
  ["11", "A funeral party on the road with a body and no lamp, having run out of oil. They will pay anything. It is nearly dark."],
  ["12", "Two men fighting on the road over a boundary, with a third holding the horses and no intention of stopping it."]
]));

// ============ THE SUTHMARK ============
children.push(H1("The Suthmark"));
children.push(P("Golden grain to the horizon, vineyard terraces, chalk downs, and eastward the grey hollows of the Greywell hills where the light arrives late and leaves early. The empire\u2019s breadbasket, genuinely loyal, and devout in the older and plainer way \u2014 harvest processions, field-shrines, saints' days kept by the planting calendar rather than the Sanctum\u2019s."));
children.push(P("The south is also the region that carries two scars it will not discuss with outsiders, and a party that spends time here will feel the shape of both long before anyone names them."));

children.push(...LOC({
  name: "Caldessa", kind: "ducal seat",
  stat: "Population 11,000. Seven days south of Aenodira on an excellent road.",
  what: "Wine, mourning-silk, and the ducal palace, which is a working administrative building pretending to be a monument. The town below it is prosperous, orderly, and watched: the Dowager Duchess\u2019s household staff are the best-informed servants in the empire, and the Garland \u2014 her network of them \u2014 has quiet ears in every kitchen worth listening in.",
  runs: "Duke Aldous Vasq in law, from a sickroom. The Dowager Duchess Emerenn in fact, from everywhere.",
  buy: "The best wine in the world at the source. Fine clothing, mourning-silk especially. Good horses. Any service the Church provides, at a standard the capital would recognize. Weapons and armor at ordinary prices, with the seller writing your name down.",
  talk: "Tavian Vasq, the Duke\u2019s younger brother, who has no office, considerable charm, and an increasingly obvious opinion about how the duchy is being run. He is easy to meet and impossible to leave.",
  comp: "Every conversation in Caldessa is being reported to somebody. This is not sinister; it is administrative. It becomes sinister the moment the party has something to hide, and they will not know when that moment arrives.",
  dm: "The Vintage Night\u2019s order came from this building six years ago. Emerenn maintains she did not mean what was done. She is telling the truth, and she has never once said so in public, because the alternative to being feared here is being tested."
}));

children.push(...LOC({
  name: "Ambervale", kind: "harvest town",
  stat: "Population 4,200, doubling at Harvestide.",
  what: "The south\u2019s great festival town, and the reason Harvestide 2 is a working holiday in half the empire. Saint Bellara\u2019s feast is kept here with a procession that has run for four hundred years, an overturned grain measure carried at its head, and enough wine to float a barge.",
  runs: "A council of vintners and the Prior of Saint Bellara\u2019s, jointly, badly, and to everyone\u2019s satisfaction.",
  buy: "Wine below cost during the festival and above it the rest of the year. Every foodstuff on the sourcebook\u2019s tables. Casks, presses, and cooperage. Almost no adventuring equipment; this is not that kind of town.",
  talk: "Vintner Corla Bray, who runs the festival\u2019s route committee and has run it for eleven years, which is to say since the year after.",
  comp: "The procession\u2019s route changed six years ago. It now avoids three streets. Nobody will tell an outsider why, the official reason is drainage, and the actual reason is that the Vintage Night happened on those streets and the town has decided the way to survive it is to walk around it.",
  dm: "Ambervale was one of the three towns. The families of the killed still live here, alongside the families of the men who did it, and both attend the same feast. That is not a plot; it is a place, and it is one of the most quietly horrifying rooms in the campaign."
}));

children.push(...LOC({
  name: "Greywell-under-Hill", kind: "estate village",
  stat: "Population 300.",
  what: "The village at Castle Greywell\u2019s feet, in a hollow where the light arrives late and leaves early. The wages are good. The wages are conspicuously good. The castle takes servant girls into household service on generous terms, and has done for two generations, and the village has grown quietly rich on it.",
  runs: "Countess Velsanna Ory, from the castle, at a distance.",
  buy: "Very little, and the village is not interested in your custom. A bed, food, and a strong preference that you move on in the morning.",
  talk: "Widow Sesta Vane, who has lost a granddaughter to household service and is the only person in the village who will say a word about it \u2014 and who will say it exactly once, quietly, and then deny it.",
  comp: "Girls go into service at the castle and do not come home. The village has a hundred explanations, all of them reasonable, all of them offered too quickly. The parish record of departures exists and is not complete.",
  dm: "This is the seed for the Greywell module and it should be walked past, not solved. Do not let a party resolve Greywell as a side trip; the Countess is beyond their tier and the horror needs its own arc. If they push, the castle is hospitable, and that is worse."
}));

children.push(...ENC("the Suthmark", [
  ["1", "A harvest procession crossing the road, three hundred people and a saint\u2019s icon. Nobody may pass until it has gone by. It takes forty minutes."],
  ["2", "An ankheg in a wheat field, and the whole village turned out to deal with it with billhooks, which is going as well as you would expect."],
  ["3", "A field-shrine of the Old Observance with fresh offerings, and a Church examiner fifty yards away pretending not to have seen it."],
  ["4", "Giant boars (1d3) in the vineyard terraces, doing catastrophic damage. The vintner will pay in wine, which is worth more than he thinks."],
  ["5", "A wedding, mid-oath, in a field. The party has arrived at the exact moment the vow is spoken, and it is customary for strangers present to be counted as witnesses."],
  ["6", "Blights (2d3) in an old orchard nobody has pruned since the Vintage Night, because the family who owned it is gone."],
  ["7", "A carter with a broken axle and a cargo of festival wine, four hours from a deadline that matters more than he can explain."],
  ["8", "A green hag\u2019s boundary: a stile with a knot tied in the hedge beside it. Crossing is safe. Untying the knot is not."],
  ["9", "Two Orlathine pilgrims traveling south, moving quickly, not stopping, and unwilling to say where they are bound."],
  ["10", "A dryad grove of the Old Observance, and a party of Church surveyors measuring the road that would go through it."],
  ["11", "A Vigil Hall with its lamp out at dusk, and the keeper nowhere. Somebody must keep the night, and the body inside is a stranger."],
  ["12", "A grey hollow where the road dips: cold in high summer, birds silent, and the horses will not walk it. Faint thin-written ground, eleven miles from Greywell."]
]));

// ============ TARNOVAR ============
children.push(H1("Principality of Tarnovar"));
children.push(P("Montane mist-forest rising to bare stone, standing-stone rings on the bald summits, valleys where noon looks like evening, and at its heart the Old Wood \u2014 the largest unbroken forest in the fractured world. A nation built on the given word, openly independent for a century, and pointedly uninterested in reunification."));
children.push(P("Nothing in this region is bought. Everything in it is agreed. A party that treats a Tarnovari negotiation as a transaction will fail it without ever learning why."));

children.push(...LOC({
  name: "Kamenhold", kind: "the Voivode\u2019s seat",
  stat: "Population 7,000. Twenty-one days west of Aenodira; the last five on Tarnovari stone roads.",
  what: "Dry-stone built into a mountainside in terraces, so that the whole city is a staircase and every roof is somebody\u2019s yard. Above it, the high field: the oath-stones of every Tarnovari family, thousands of them, standing in rows in the wind. It is the single most impressive sight in the fractured world and no imperial traveler has described it accurately in a hundred years, because they all try to compare it to something.",
  runs: "Voivode Ysavet Morn, whose word is absolute everywhere except the Eastmarch.",
  buy: "Oathstone Charms, openly (see the sourcebook\u2019s items of record). Stonesworn work of extraordinary quality: masonry, but also tools, locks, and mechanisms. Mountain provisions. No arcane services of any kind \u2014 the Charter means nothing here and hedge-work is done by people who would be offended by the word.",
  talk: "Bavric Halt, a Stonesworn oath-carver in the high field, who will explain the customs to a respectful stranger at length and for free, and who is a considerably better route to the Voivode\u2019s court than any embassy.",
  comp: "An imperial party in Kamenhold is a diplomatic event whether they want to be or not. Everything they do is read as the empire\u2019s position. A small courtesy kept is worth more here than a large gift; a small promise broken is worth more than a large insult, in the wrong direction.",
  dm: "The Lament cycle is sung here on certain nights. Vosthren appears in it by name. A party who hears it and has been to the Cold Door is being handed a piece of the Founding, and will not know it for months."
}));

children.push(...LOC({
  name: "Fencegate", kind: "border fort",
  stat: "Garrison 200 under Ban Dregan Morn. On the Eastmarch, facing the Brekelands.",
  what: "A stone fort at the mouth of the only wagon pass between Tarnovar and the Brekelands, and the near end of Ban Dregan\u2019s Fence. The Fence itself begins about a mile east and is exactly what has been described elsewhere and worse in person.",
  runs: "Ban Dregan Morn, by methods the Voivode has never sanctioned and never stopped.",
  buy: "Nothing is sold at Fencegate. Food and shelter are given, freely, to anyone who asks, and refused to nobody. This is not generosity; it is a demonstration.",
  talk: "The Ban himself, who receives travelers personally, is unfailingly courteous, and asks each of them one question about an oath they have kept or broken. He remembers the answers.",
  comp: "Every Brekeland company that has raided past Fencegate twice is on the Fence. Every one that raided past once is alive. The system works, it is monstrous, and no Tarnovari will hear a word against it.",
  dm: "Dregan spent a decade in the capital as a hostage-student and came home changed. He knows the empire\u2019s manners perfectly and uses them like a knife. If the party has broken any oath he can learn about, he will know before they arrive."
}));

children.push(...LOC({
  name: "Verath", kind: "Old Wood village",
  stat: "Population 250. Deep in the Old Wood, four days off any road.",
  what: "A village of singers, and the place where the Lament cycle is kept whole. Wood-elf and Tarnovari families mixed for so long the distinction has stopped being interesting to anyone living there. Longhouses under the canopy; no stone building; no shrine of any recognized faith.",
  runs: "Nobody. Precedence in Verath is by how much of the cycle you can sing.",
  buy: "Nothing, for money. Hospitality, for a song, a story, or news \u2014 and the exchange rate is real and taken seriously.",
  talk: "Ilinca Verath, ballad-keeper, who carries more of the cycle than anyone alive and had never been further from the village than Kamenhold until the trade delegation came through asking the village for a singer. If the party met her in the capital (Session Six, optional content), she is home again by any later visit and remembers them; if they did not, she has never left.",
  comp: "The Old Wood\u2019s heart is a day further in, where the Hollow Hills stand and travelers' time runs strange. Verath does not go there and does not stop anyone else, and is genuinely puzzled by the question of why not.",
  dm: "Ilinca does not know what she is carrying. The Lament\u2019s oldest verses are a survivor\u2019s account of the Founding, worn down by twenty centuries of transmission into a song about a betrayed lord called Vosthren. She will sing it to anyone who earns it. This is the single largest lore payload in the setting outside the Undercourt, and it is available to a party who is polite to a village."
}));

children.push(...ENC("Tarnovar", [
  ["1", "A standing-stone ring on a bald summit, and a family at it, swearing something. Strangers are witnesses if they stay and nothing if they go, and both are acceptable."],
  ["2", "Owlbear, hunting. It has right of way and knows it."],
  ["3", "Ettercaps and webs across a pine defile (2 Ettercaps, 2d4 Giant Spiders). The webs are the encounter; the ettercaps are the complication."],
  ["4", "A Stonesworn survey party recutting weathered oath-stones, eleven years into a forty-year job, and glad of the conversation."],
  ["5", "Elk, then giant elk, then the understanding that the second was watching the party watch the first."],
  ["6", "A green hag at the fey margin, offering a fair bargain. It is genuinely fair. That is the trap."],
  ["7", "Winter wolves (1d4) on a high pass, hunting cooperatively and speaking Common badly on purpose."],
  ["8", "A boundary of the Old Wood\u2019s fey-touched heart: mist, and the party\u2019s own tracks arriving from the wrong direction. No combat. A lost hour, or a lost day."],
  ["9", "A Tarnovari rider carrying an oath-token to a family three valleys away, on the eleventh day of a fourteen-day errand nobody paid him for."],
  ["10", "A ballad-singer at a crossroads shrine that is not a shrine, singing something in old Tarnovari that a wood-elf character half understands."],
  ["11", "Ban Dregan\u2019s men, four of them, off the Eastmarch and a long way from it, doing something the Voivode has not sanctioned."],
  ["12", "A cairn with a name on it in imperial letters, forty years old, in a country that does not bury its dead this way."]
]));

// ============ VELMARETH ============
children.push(H1("Free City of Velmareth and the Delta Compact"));
children.push(P("The Ostrun\u2019s delta: reed-seas, tidal channels, and the lagoon city on its ten thousand pilings \u2014 all bridges, salt-stained marble, and money. Rich, ostentatiously neutral, and quietly committed to the fractured status quo, because disorder is margin."));

children.push(...LOC({
  name: "Velmareth", kind: "free city, merchant republic",
  stat: "Population 90,000 \u2014 the largest city in the fractured world, larger than Aenodira and careful never to say so.",
  what: "A city with no ground. Everything stands on pilings driven into delta mud, everything is reached by water or by bridge, and every building is either newer than it looks or falling into the lagoon. The Exchange occupies a converted temple nobody will say which god was thrown out of. The Marked have quarters here with actual legal standing, unique in the world.",
  runs: "The Harborlords \u2014 ruling merchant-bankers, of whom the Meldane house is first among nominal equals.",
  buy: "Anything. Genuinely anything, including several things illegal in every other jurisdiction described in this book. Full arms and armor without registration. Arcane services from thaumaturges chartered by the Compact rather than the empire, which the empire does not recognize and cannot prevent. Passage anywhere there is water.",
  talk: "Factor Semele Drach, a mid-rank Meldane agent who handles Suthmark accounts, is bored by them, and would very much like something interesting to happen. Pilot Anneke Roost, who knows every channel in the delta and every reason a ship might not want to use the marked ones.",
  comp: "Everything in Velmareth is for sale including the party\u2019s confidences, and the Compact\u2019s courts will enforce a contract against a stranger with beautiful, ruinous impartiality. A party that signs anything here should read it, and a party that reads it should still assume they have lost.",
  dm: "The Meldane connection runs directly to the Dowager Duchess Emerenn, who was born into this house. Anything the party does in Velmareth that touches Meldane money is known in Caldessa within three weeks."
}));

children.push(...LOC({
  name: "Saltmark", kind: "toll town",
  stat: "Population 3,000. At the delta mouth, where the river becomes the sea.",
  what: "The Compact\u2019s customs town, and the place where the fiction of Velmarene neutrality is maintained by being scrupulously applied to everyone. Warehouses, a tide-mill, a lighthouse the Compact maintains at ruinous expense because a wreck in the channel would cost more.",
  runs: "The Compact\u2019s own customs service, which is honest to a degree that shocks imperial visitors and which is honest because dishonesty would be more expensive.",
  buy: "Bonded goods at wholesale. Ship\u2019s stores. Passage out.",
  talk: "The lighthouse-keeper, who is a lay devotee of Saint Ilvane, has kept the Lamp Left Burning for twenty years, and is the only person in the delta who will say what he actually thinks about the Harborlords.",
  comp: "The channel-toll the Compact pays and does not describe in its ledgers is paid from Saltmark, at night, in the outer channels, to the merrow. Everyone in town knows. It is the town\u2019s one unmentionable, and it works."
}));

children.push(...LOC({
  name: "Reedhaven", kind: "stilt-village",
  stat: "Population 600, and no census has ever been accurate.",
  what: "A village on stilts in the reed-sea, three hours from the city by shallow boat, populated by pilots and smugglers who are frequently the same families and always the same people at different hours.",
  runs: "Six families, by agreement, renegotiated whenever somebody dies.",
  buy: "Passage into or out of the delta without passing Saltmark. Silence. Local knowledge that is genuinely irreplaceable.",
  talk: "Any of the Roost family, who have piloted the delta for nine generations and regard the marked channels as a courtesy to strangers.",
  comp: "Reedhaven\u2019s usefulness to a party is exactly its usefulness to everyone else. Whoever the party is avoiding has probably also hired somebody here."
}));

children.push(...ENC("the Delta and Velmareth", [
  ["1", "A funeral barge, lit, going out into the reed-sea. Custom requires every vessel it passes to shut its lamps for the duration."],
  ["2", "Giant crocodiles (1d3) in a channel the pilot swore was clear, and the pilot\u2019s face when he sees them."],
  ["3", "A Compact writ-server, polite and implacable, serving papers on somebody standing next to the party."],
  ["4", "A water elemental bound as a harbor-engine, working a dredge, and a chartered thaumaturge visibly worried about the binding."],
  ["5", "Merrow (1d4) in the outer channels, who have come for a toll that is late and who will negotiate, in Aquan, coldly."],
  ["6", "Two Marked in Compact livery conducting entirely ordinary legal business, which is a sight no imperial character has ever seen."],
  ["7", "A bridge collapse. Four people in the water, a crowd, and nobody in charge because in Velmareth nobody is ever in charge of a bridge."],
  ["8", "Swarms of insects off the reed-sea at dusk, thick enough to be a hazard: DC 12 Constitution or disadvantage on all checks for an hour."],
  ["9", "A dredge-team paid triple, refusing to go back down, and refusing to say what is in the cellar."],
  ["10", "An auction of a cargo whose owner has not been seen in a month, conducted with impeccable legality by people who look pleased."],
  ["11", "A Sarkanni mercenary lodge recruiting openly for a contract in the Brekelands, at rates that indicate somebody expects casualties."],
  ["12", "A drowned quarter cellar at low water, open, and older than the city that stands on it."]
]));

// ============ THE BREKELANDS ============
children.push(H1("The Brekelands"));
children.push(P("Broken hill country. Hedgerows gone wild between burned granges, mill-streams turning no wheels, roads that fork around the ruins of the villages that were the reason for the roads. Imperial administration did not withdraw from the Brekelands; it simply stopped, one office at a time, over sixty years, and nobody has ever written down the date."));
children.push(PS([DM("DM Only: "), { t: "the ghoul-density at parley-breach sites here is not natural and it is rising. The Brekelands are the shadow\u2019s best-fed province outside the capital, and a party who maps the burnings will be mapping something else without knowing it." }]));

children.push(...LOC({
  name: "Millbreak", kind: "neutral market town",
  stat: "Population 1,800. Between Skarnhold and Vosskeep, and paying both.",
  what: "The Brekelands in one village: a market town that has survived sixty years of warlord country by being useful to everyone and loyal to no one. It pays tribute to Skarn and to Voss, in different currencies, on different days, and has never once been burned.",
  runs: "A council of four, elected annually by a process designed to ensure nobody powerful ever holds the office.",
  buy: "Everything, at bad prices, with no questions. Food, remounts, repairs, and information about who currently holds what \u2014 which is the real trade here and is repriced weekly.",
  talk: "Reeve Coll Braith, the current first of the four, who is exhausted, competent, and running the most sophisticated neutrality policy in the fractured world out of a room above a granary.",
  comp: "Millbreak\u2019s neutrality is a performance requiring constant maintenance, and a party that is seen to favor anyone endangers the whole town. Braith will say this plainly, once, and then hold the party to it."
}));

children.push(...LOC({
  name: "Skarnhold", kind: "warlord seat",
  stat: "Population 2,400, plus roughly 400 under arms.",
  what: "A hill fort grown a town around it, held by Bettra Skarn, who is convinced she is the reasonable one in the Granary War and is not entirely wrong. Palisade, hall, and a genuine attempt at a market that keeps failing because nobody trusts the roads.",
  runs: "Warlord Bettra Skarn, in person, at close range, all the time.",
  buy: "Arms, remounts, and mercenary contracts. Nothing refined. Skarn pays well for competent strangers and pays late.",
  talk: "Skarn herself, who is direct, funny, and will hire the party inside ten minutes of meeting them.",
  comp: "The Granary War is a dispute neither side remembers clearly and both have now buried too many people to abandon. Skarn knows this. She has known it for four years. She cannot say it out loud, and a party that says it for her has either made an ally or a mortal enemy on a coin-flip."
}));

children.push(...LOC({
  name: "Vosskeep", kind: "warlord seat",
  stat: "Population 2,100, plus roughly 350 under arms.",
  what: "The mirror of Skarnhold, down to the failing market, and Ilmarch Voss is also convinced he is the reasonable one. The one real difference: Voss has started taking Normere money, and has not told his own captains.",
  runs: "Warlord Ilmarch Voss, increasingly not.",
  buy: "As Skarnhold, at slightly better prices, because Voss has a subsidy.",
  talk: "Voss, who is charming and frightened. His steward, who is neither and who knows about the subsidy.",
  comp: "Duke Norr is not paying Voss to win the Granary War. He is paying Voss to keep it going for another two seasons while the Reckoning Book\u2019s surveyors finish measuring the western Brekelands.",
  dm: "This is the party\u2019s best early evidence that Norr is conducting his own reunification, and it is available at the level of a bribed steward rather than a strategic revelation. Let them find it small."
}));

children.push(...LOC({
  name: "Halvenne", kind: "burned village",
  stat: "Population: none. Formerly 400.",
  what: "Ashes and hedges, one season old, and the reason forty families were walking the imperial road in the party\u2019s second session. The wells are intact. The Vigil Hall\u2019s stone foundation is intact. Nothing else is.",
  runs: "Nothing.",
  buy: "Nothing.",
  talk: "Semya of Halvenne, if the party knows where she went \u2014 and she will want to know what they saw.",
  comp: "Nobody kept the Vigil at Halvenne. There was nobody left to keep it and nowhere to keep it, and the bodies went into the ground unwatched, which by every doctrine in the empire is a wound rather than a burial.",
  dm: "Halvenne is Marked thin-written ground, and it is getting worse, not better. Ghouls here are numerous beyond what the burning explains. A party returning a second time should find the boundary of the cold has moved outward by a field\u2019s width. Do not explain. This is the shadow eating, made visible at village scale."
}));

children.push(...ENC("the Brekelands", [
  ["1", "Gnolls (2d3), famine-born, following a burning. The old folk say gnolls are what hunger prays to, and the old folk are describing something real."],
  ["2", "A refugee column, forty strong, going the way the party came, with a story about what is ahead."],
  ["3", "Ghouls (1d4+1) at a burn site under a parley sign that is still standing. The sign is the encounter\u2019s meaning."],
  ["4", "A wyvern in the high crags, taking cattle, and a farmer who has decided to do something about it alone."],
  ["5", "Skarn\u2019s riders and Voss\u2019s riders, meeting on the road, both wanting the party\u2019s help, neither willing to be first to fight."],
  ["6", "A manticore that has learned to follow armies and is disappointed by the party\u2019s size."],
  ["7", "An intact village that has survived by a method the party will not like when they learn it."],
  ["8", "A Normere surveyor, alone, measuring, with excellent papers and no escort, forty miles inside somebody else\u2019s country."],
  ["9", "A well-preserved imperial milestone in the middle of nowhere, reading a distance to a road that no longer exists."],
  ["10", "A deserter who wants to surrender to somebody, anybody, with authority, and the party is the closest thing available."],
  ["11", "Ghasts (1d3) in a grange whose family were killed under a truce. Cold, and the cold is wrong for the season."],
  ["12", "Nothing at all, for a whole day, on a road that should carry traffic. That is the encounter."]
]));

// ============ THE SEE OF ORLATH ============
children.push(H1("The See of Orlath"));
children.push(P("Taiga edge and fell-country: pilgrim roads switchbacking to the mountain city, prayer-cairns at every false summit, and above the treeline the Reconciliation Shrine where Olvesa spent her year. A breakaway patriarchate claiming the purer doctrine, penitent, rigorous, and warmer than its liturgy."));
children.push(P("What the capital has not understood is that Orlath is no longer a schism. It is a coronation waiting nine months for its date."));

children.push(...LOC({
  name: "Orlath", kind: "see-city",
  stat: "Population 14,000. Sixteen days north of Aenodira; the last four cannot be ridden.",
  what: "A city carved in switchback galleries into a mountain face, so that its streets are stairs and its cathedral is a cavity rather than a building. The Second Treasury of Relics is here, holding a rival set the Sanctum considers fraudulent and has never been permitted to inspect.",
  runs: "Saint-Regent Olvesa the Reconciled, who has held a regency for fifty-eight years for a throne she keeps deliberately vacant, and who is about to fill it.",
  buy: "Relics, candles, and warm clothing, which is roughly the whole economy. Church services from clergy holding a Sanction the empire does not recognize and the Matron plainly does. Northern provisions and gear rated for real cold.",
  talk: "Almoner Vestan Kry, who runs the pilgrim hospice, has fed everyone who has come up that stair for thirty years, and is the least political person in the city \u2014 which makes him the best-informed.",
  comp: "An imperial party in Orlath is not in danger and is entirely visible. The See is courteous, curious, and taking notes, and Olvesa herself will grant an audience to anyone interesting, which is more dangerous than a refusal.",
  dm: "Olvesa\u2019s visions darkened three years ago, the same season Nyreeza vanished, and that correlation is real and is the reason the coronation is happening now. She does not know why. She would very much like to talk to Vaelindra and has no way to arrange it."
}));

children.push(...LOC({
  name: "Penitent\u2019s Stair", kind: "pilgrim town",
  stat: "Population 1,100, and up to 5,000 in pilgrim season.",
  what: "The last town before the Shrine, with an economy consisting almost entirely of candles, crutches, and confessions. Crutches are left at the top of the Stair by those who no longer need them; the town collects, repairs, and resells them, which is either the most cynical trade in the empire or the most practical piety, and the town has decided it is both.",
  runs: "The Stairkeeper, an office of the See, currently Muriel Oss, who has climbed the Stair eleven thousand times.",
  buy: "Candles. Crutches. Cold-weather gear. A hot bath, which after four days of switchbacks is worth more than any magic item on the sourcebook\u2019s tables.",
  talk: "Oss, who has watched forty years of pilgrims and can tell within a hundred yards which ones will make the top.",
  comp: "The Stair is a genuine physical ordeal: four hours of ascent, DC 10 Constitution save at the halfway station or one level of exhaustion. Nobody is permitted to be carried. This is doctrine, and it is enforced by people who will help you and will not carry you."
}));

children.push(...LOC({
  name: "Drevholm", kind: "clan-land town",
  stat: "Population 900.",
  what: "A quiet town on the old Drevic clan-lands, where nobody sings. There is no ordinance against it. There has simply been no singing in Drevholm for fifty-eight years.",
  runs: "A See-appointed prior and a town council that predates the See and outlasts each prior.",
  buy: "Ordinary provisions, sold correctly, without warmth.",
  talk: "Almost nobody. Drevholm answers questions and does not ask them.",
  comp: "Olvesa\u2019s four vengeances fell here. The town\u2019s surviving families are the families of the people she killed, and they have lived under her See for fifty-eight years, and they attend her liturgy, and they do not sing.",
  dm: "The banshees on the Drevic moors are the clan-lands' unfinished grief and they are not hostile to anyone who comes without a weapon drawn. A party that treats them as a monster will learn nothing. A party that treats them as mourners will learn what Olvesa did, from the only witnesses left."
}));

children.push(...ENC("the See of Orlath", [
  ["1", "Winter wolves (1d4) at a pilgrim station, being fed by the station-keeper, who considers this normal and is correct locally."],
  ["2", "A pilgrim who has failed the Stair three times and is going up again, and would like company for the fourth."],
  ["3", "A clergy refugee from the Sanctum, newly arrived, still in imperial vestments, and not yet sure what he has done."],
  ["4", "Ice mephits (1d4+1) in the shrine-heights, more nuisance than threat, and genuinely funny if played as such."],
  ["5", "A prayer-cairn at a false summit with a fresh stone on it, and the person who placed it visible a mile above."],
  ["6", "A troll in a ravine, which the See\u2019s rangers manage rather than kill, on a schedule, with fire."],
  ["7", "Saber-toothed tigers (1d2) on the high fells, hunting the same pilgrims the wolves are protecting."],
  ["8", "A relic procession coming down the road, and the question of whether to kneel."],
  ["9", "A banshee (\u2020) on the Drevic moors, mourning, not hunting, and the difference is entirely in how the party opens."],
  ["10", "Polar bear on a fell shoulder, unbothered, immense, and directly on the only path."],
  ["11", "Two Ardvenner scribes traveling to Orlath on Karvel\u2019s business, cheerful, indiscreet, and carrying a sealed case."],
  ["12", "The Reconciliation Shrine at dusk, empty, and the extraordinary quality of the silence in it."]
]));

// ============ ARDVEN ============
children.push(H1("Kingdom of Ardven"));
children.push(P("Fjords and pine-clad steeps, longhouse towns turning to slate-roofed monastery burghs as Karvel\u2019s new order spreads. The north mid-transformation: timber to stone, saga to script, and a king who plants schools the way other kings plant fortresses."));

children.push(...LOC({
  name: "Karvholm", kind: "royal capital",
  stat: "Population 12,000 and rising fast. Twenty-six days overland, eleven by sea if the Skell are not out.",
  what: "Half longhouse, half cathedral, all ambition. A capital being built around a court that outgrew its hall fifteen years ago and has been improvising since. Scaffolding everywhere. Scholars everywhere. A king who is visibly enjoying himself.",
  runs: "King Karvel, in person, with a court that is astonishingly accessible by imperial standards.",
  buy: "Northern arms and armor of high quality. Books \u2014 actual books, newly copied, at prices that would make an Aenodiran archivist weep. Passage. Ship\u2019s stores.",
  talk: "Almost anyone. Karvel\u2019s court hosts scholars the empire\u2019s academies lost to poverty or politics, and several of them remember the Imperial Academy with complicated feelings and considerable candor.",
  comp: "Karvel is going to be crowned Emperor of the True Rite in nine months and everybody in Karvholm knows it except, apparently, the empire. A party from Aenodira asking questions here is the first imperial notice the north has had, and how they behave will be reported to a king who is about to matter enormously.",
  dm: "Karvel is Olvesa\u2019s grandson. This is not secret and is also not advertised, and a party that works it out has understood the coronation better than the imperial court has."
}));

children.push(...LOC({
  name: "Lettervik", kind: "monastery town",
  stat: "Population 3,000, of whom perhaps 900 can write.",
  what: "The monastery town where forty schools' worth of scribes are teaching the north to write. The scriptorium is the largest single room north of Aenodira and it is full, at all hours, of people learning their letters at every age from six to sixty.",
  runs: "The Abbot-Rector, a royal appointment, and in practice the senior scribes.",
  buy: "Copying, translation, and fair copies of almost anything. Ink, vellum, and instruments. A scribe\u2019s services for a journey, which is worth more to a party than they will expect.",
  talk: "Scribe-Brother Halvig, who runs the copying floor, is fascinated by Old Imperial, and would trade a great deal for a look at a genuine pre-fracture document.",
  comp: "Ardven is building literacy from nothing in one generation, and the empire \u2014 which has been losing it for two centuries \u2014 has not noticed the reversal. A party carrying imperial documents will find Lettervik far more capable of reading them than they expected.",
  dm: "Halvig can translate Old Imperial legal shorthand competently, and would do it for the privilege. If the party\u2019s dead letters or the Cold Door rubbing ever need a second opinion outside the empire\u2019s reach, he is it \u2014 and he is nineteen days away, which is exactly the right distance."
}));

children.push(...LOC({
  name: "Fjellgard", kind: "ranger town",
  stat: "Population 1,400. Under the dragon-fells.",
  what: "Quietly the toughest place in the kingdom: the town under the high ranges where the Fjell Whites den, and where Karvel\u2019s rangers cull young dragons like wolves-of-state. Everything here is built low, thick, and with a stone roof.",
  runs: "Ranger-Captain Torvald Aske, who holds a royal commission and a great deal of latitude.",
  buy: "Cold-weather everything. Heavy crossbows and ballista bolts. Guides, at high prices, who are worth it.",
  talk: "Aske, who will talk about dragons all night and will not answer one specific question.",
  comp: "The rangers cull juveniles. There has never been a confirmed adult. When asked directly whether there is a matriarch in the high ranges, Aske changes the subject, and he does it the same way every time, and everyone in Fjellgard has noticed.",
  dm: "There is a matriarch. The rangers know. Karvel knows. The policy is to cull the young and never provoke the old, and it has held for fifteen years, and it is the single most fragile arrangement in the north."
}));

children.push(...ENC("Ardven", [
  ["1", "A young white dragon\u2019s kill on the fell \u2014 a horse, frozen solid, three hours old."],
  ["2", "A ranger patrol on skis, fast, professional, and openly curious about southerners."],
  ["3", "Frost giant (1) on tribute business, traveling under a truce Karvel finds humiliating and keeps anyway."],
  ["4", "A monastery school on the road: forty children, two brothers, and a wagon of slates, walking to a new foundation."],
  ["5", "Trolls (1d2) in a ravine, and the local method for dealing with them, which involves considerable pre-arranged fire."],
  ["6", "Mammoths on the tundra edge, and a herding party who will trade for anything metal."],
  ["7", "Giant eagles (1d2), and Karvel\u2019s half-revived mews trying to get a line back on them."],
  ["8", "Winter wolves (1d4), which here are hunted rather than fed, and which know the difference between an Orlathine road and this one."],
  ["9", "A saga-singer and a scribe arguing furiously about whether writing a saga down kills it. Both are right."],
  ["10", "A newly-cut royal road ending abruptly in forest, with the survey stakes running on ahead into the trees."],
  ["11", "A Skell longship beached for repair in a fjord it has no business being in, and a crew who would rather not fight today."],
  ["12", "The high ranges, at dawn, clear, and something very large moving between two peaks a long way off."]
]));

// ============ THE SKELLVARD ============
children.push(H1("The Skellvard"));
children.push(P("Not land. The cold sea itself, island anchorages, whale-roads, and the drowned fjords the clans lost to Ardven\u2019s expansion. The Skell live aboard; the fleets are the nation; and their kings are buried beneath rivers, in secret, so that no enemy may ever stand on a Skell king\u2019s grave."));
children.push(P("A party will meet the Skellvard on a beach or a deck, almost never in a town, and the difference between a raid and a negotiation is a tally-stick."));

children.push(...LOC({
  name: "The Gathering Roads", kind: "fleet-moot",
  stat: "A city of perhaps 20,000 that exists two months a year, in the lee of the Broken Isles.",
  what: "The great fleet-moot: every clan that can reach it, rafted together in the lee of an island chain, for the two months of the year the northern sea permits it. Lawspeaking, marriages, debt-settlement, shipbuilding, and an amount of drinking that has entered the sagas of two other nations.",
  runs: "Sea-King Aldrec the Landless, by acclamation, renewed every moot, and never yet refused.",
  buy: "Anything taken from anywhere, sold without provenance and often without enthusiasm. Ships. Crew. Passage to places that do not appear on imperial charts.",
  talk: "Tally-Keeper Sigrun Hafl, who holds the debt-sticks for four clans and can recite, from memory and in order, every promise the empire has broken to the Skell in forty years.",
  comp: "The Skell do not raid at random. Every raid is recorded, clan by clan, as a collection against a specific debt. A party who learns to ask which debt will find the raids stop being random violence and start being an argument \u2014 one the empire has never troubled to answer.",
  dm: "Aldrec wants a march and a title. He has asked four times and been refused four times. The fifth petition is what Session content can hang on, and the empire\u2019s answer is genuinely open \u2014 this is one of the few Powers a party can turn."
}));

children.push(...LOC({
  name: "Wrecksalt Isle", kind: "beaching-ground and shipyard",
  stat: "Permanent population 700; ten times that when a fleet is in.",
  what: "The beaching-ground, the shipwright\u2019s yard, and the closest thing a landless people have to holy ground. Every hull the Skell float has been on this beach. No king is buried here. That is the point of it, and a stranger who suggests otherwise has committed an insult he will not understand.",
  runs: "The shipwright families, who are not a clan and answer to no Sea-King, by an arrangement older than the kingship.",
  buy: "Ship repair to a standard the empire cannot match. Rope, sail, and timber. Nothing else.",
  talk: "Orm Vandsson, master shipwright, third of his name in the trade, who will assess anyone\u2019s seamanship in one glance and say so.",
  comp: "Skell hospitality on Wrecksalt is absolute and its rules are unwritten. Break one \u2014 refuse a cup, praise a hull\u2019s speed to its builder\u2019s rival, ask where the kings are \u2014 and the correction will be immediate, public, and survivable exactly once."
}));

children.push(...ENC("the Skellvard and the northern sea", [
  ["1", "A longship shadowing at the horizon for six hours, neither closing nor leaving. It is counting."],
  ["2", "Hunter sharks (1d4) in the wake, which the Skell read as an omen and will tell you which."],
  ["3", "A killer whale pod running alongside, which is the good omen, and the crew\u2019s reaction to it."],
  ["4", "Merrow war-band (1d4+2), old enemies under an old treaty, and the treaty\u2019s terms matter more than initiative."],
  ["5", "Harpies (1d4) on a guano stack near a channel every ship must take."],
  ["6", "A herded plesiosaurus breed the clans call sea-elk, driven past the bow by four small boats."],
  ["7", "A wreck, fresh, with survivors, and the tally-stick question of who owes whom for the rescue."],
  ["8", "A becalming: three days, no wind, water rationing, and the Weeping Strait forty miles south."],
  ["9", "A Skell burial party going up a river mouth at night with no lights, and the extremely bad idea of following them."],
  ["10", "An imperial squadron on patrol, undermanned, whose captain would dearly like the party to have seen nothing."],
  ["11", "Ice, out of season, in a channel that should be open, and cold that is not weather."],
  ["12", "Something under the keel at the Weeping Strait, very large, unhurried, and not interested. The Saltmaw, and it is not an encounter at this tier."]
]));

// ============ NORMERE ============
children.push(H1("The Duchy of Normere"));
children.push(P("Rain-lashed headlands, drained polder-fields behind the Duke\u2019s dikes, slate towns of ruthless neatness, and castles placed like arguments. The iron surprise of the west coast: the most efficient state in the fractured empire, and the one conducting its own restoration."));

children.push(...LOC({
  name: "Norr\u2019s Watch", kind: "ducal seat",
  stat: "Population 9,000. Eighteen days west of Aenodira, the last third on the best road in the world.",
  what: "A slate town of unsettling tidiness around a castle that is a filing system with walls. The Reckoning Book\u2019s hall is open to any sworn subject of the Duke, who may walk in and read the entry for his own holding, his neighbor\u2019s, and the Duke\u2019s. This is either the most transparent government in the fractured world or the largest threat ever bound in vellum, and Normere has decided not to choose.",
  runs: "Duke Garvin Norr, the Bastard of Normere, through a personal oath sworn to him directly by every landholder, bypassing all intermediate lords.",
  buy: "Anything on the sourcebook\u2019s tables, at listed price, with a receipt, recorded. Excellent tools and drainage engineering. Nothing at all without your name being written down somewhere.",
  talk: "Surveyor Adric Penn, who measures for the Reckoning Book, has done it eleven years, and is proud of it in a way a party will find either admirable or chilling depending on the hour.",
  comp: "Everything in Normere is recorded, and the record is public to the sworn. A party can look almost anything up. So can everyone else, about them.",
  dm: "The Book has one entry with no numbers in it. Any party reading systematically will hit it, and the clerk on duty will turn the page for them without being asked."
}));

children.push(...LOC({
  name: "Slateharrow", kind: "naval port",
  stat: "Population 5,500.",
  what: "Normere\u2019s shipyard and naval station, drilling monthly against merrow and sahuagin raids with an attendance record kept in the Reckoning Book. The most competent coastal defense in the fractured world, run by a duchy that has no imperial commission to have one.",
  runs: "A ducal shore-warden, and the drill roll.",
  buy: "Ships, ship\u2019s stores, and passage north or south. Crossbows in quantity.",
  talk: "Sluice-Master Hesta Doorn, who maintains the dike sluices, understands the polder system better than anyone alive, and will explain at any length that the sea is patient and the Duke is more so.",
  comp: "The shore-levy drills are compulsory, recorded, and universal, which means Normere can put four thousand trained men on a beach in a day. Nobody in Aenodira has done this arithmetic."
}));

children.push(...LOC({
  name: "The Weld", kind: "burned district",
  stat: "Former population 2,000. Current population disputed.",
  what: "On the maps and off the itineraries. Four years ago a district rebelled; the Harrowing ended the rebellion and the district. The fields are still fenced. The roads are still maintained. Nobody lives there and the roads are still maintained, which is the most frightening sentence in this book.",
  runs: "Nothing, officially. The surveyors go around.",
  buy: "Nothing.",
  talk: "Nobody living.",
  comp: "Norr\u2019s surveyors map the pre-ducal barrows elsewhere and build around them, to the letter of an old accommodation nobody writes down. In the Weld they do not survey at all.",
  dm: "The Harrowing left revenants (\u2020) \u2014 vengeance-oath dead \u2014 walking the burned district. Norr knows. The Weld is the one entry in the Reckoning Book with no numbers in it, and the one place his personal oath-web has a hole in it. The shadow has noticed the hole. This is Marked-to-Scarred thin-written ground and it is the western mirror of Halvenne: a party who has seen both has seen the mechanism twice and can name it."
}));

children.push(...ENC("Normere", [
  ["1", "A shore-levy drill in progress: four hundred farmers with crossbows, and a clerk recording attendance."],
  ["2", "A surveyor with a chain and a boy, measuring a field, who will explain the Reckoning Book at length and with enthusiasm."],
  ["3", "Sahuagin (1d4+2) on a headland at low tide, which the levy is already responding to and does not need help with, and will resent being helped with."],
  ["4", "A sluice gate failing, and forty people running toward it, and the arithmetic of how long the polder has."],
  ["5", "A pre-ducal barrow with a surveyed boundary marked around it and a road that bends politely away."],
  ["6", "Wights (1d3) at a barrow whose boundary somebody has recently crossed, and the tracks are a child\u2019s."],
  ["7", "A ducal court in session in a barn: a landholder, his oath, and the Duke\u2019s man reading it back to him."],
  ["8", "Merrow (1d3) in the shallows, testing, as they test the coast every month, and finding the drill roll again."],
  ["9", "A road crew resurfacing a road that is already perfect, on schedule, because it is on the schedule."],
  ["10", "A Brekeland refugee family who have crossed into Normere and are being processed, kindly, thoroughly, and permanently."],
  ["11", "The Weld\u2019s boundary at dusk: fenced fields, maintained road, and no lamp anywhere in twelve miles."],
  ["12", "Revenants (\u2020) at the Weld\u2019s edge, walking the old district line, who will not pursue past it and who are looking for somebody specific."]
]));

// ============ BESTIARY ============
children.push(H1("A Bestiary of the Fractured Empire"));
children.push(P("The regions above name mostly SRD creatures, and that is deliberate \u2014 a DM should be able to run this world out of the Monster Manual. What follows are the eight things the empire has that the manual does not, built by feel and then checked against SRD creatures at the same and neighboring Challenge Ratings rather than against the DMG\u2019s Monster Statistics table, which describes monsters and consistently overstates people."));

children.push(...SB({
  name: "Vigil-Wight",
  meta: "Medium undead, neutral evil \u2014 a body buried without its Vigil",
  ac: "12 (natural armor)", hp: "45 (6d8 + 18)", speed: "30 ft.",
  str: 13, dex: 14, con: 16, int: 8, wis: 13, cha: 9,
  skills: "Perception +3, Stealth +4",
  senses: "darkvision 60 ft., passive Perception 13",
  langs: "the languages it knew in life, spoken only at night",
  cr: "3 (700 XP)",
  traits: [
    { n: "Unwatched", t: "The Vigil-Wight has disadvantage on attack rolls while any creature within 60 feet is holding a lit lamp, candle, or torch that has burned continuously for at least one hour. It is not afraid of fire. It is afraid of being watched." },
    { n: "Sunlight Sensitivity", t: "While in sunlight, the wight has disadvantage on attack rolls and on Wisdom (Perception) checks that rely on sight." },
    { n: "Grave Cold", t: "The ground within 10 feet of the wight is cold to the touch, and frost forms on metal. This has no mechanical effect and gives it away every time." }
  ],
  actions: [
    { n: "Multiattack", t: "The wight makes two Cold Grasp attacks." },
    { n: "Cold Grasp", t: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) cold damage, and the target\u2019s hit point maximum is reduced by an amount equal to the damage taken. This reduction lasts until the creature finishes a long rest during which someone else keeps watch over it." },
    { n: "Ask (1/day)", t: "The wight speaks the name of the person who should have kept its Vigil and did not. Each creature within 30 feet that can hear it must succeed on a DC 12 Wisdom saving throw or be frightened of the wight for 1 minute. A creature that has itself failed to keep a Vigil makes this save with disadvantage." }
  ]
}));
children.push(PS([DM("DM Only: "), { t: "the Vigil-Wight is the setting\u2019s signature undead and it is a moral instrument rather than a monster. It can be laid to rest without a fight: keep its Vigil properly \u2014 a full night, lit, watched, never left alone \u2014 and at dawn it is simply gone. Every party will fight the first one. The good ones will only fight one." }]));

children.push(...SB({
  name: "Oath-Fed Ghoul",
  meta: "Medium undead, chaotic evil \u2014 what feeds at a parley-breach",
  ac: "13", hp: "39 (6d8 + 12)", speed: "30 ft.",
  str: 14, dex: 16, con: 14, int: 7, wis: 10, cha: 6,
  senses: "darkvision 60 ft., passive Perception 10",
  langs: "understands the language of the oath that was broken here",
  cr: "2 (450 XP)",
  traits: [
    { n: "Pack of the Broken Word", t: "The ghoul has advantage on attack rolls against a creature if at least one of the ghoul\u2019s allies is within 5 feet of the creature and the ally isn\u2019t incapacitated." },
    { n: "Bound to the Site", t: "The ghoul cannot willingly move more than 300 feet from the place where the oath was broken. It is not a wandering monster. It is a stain." }
  ],
  actions: [
    { n: "Bite", t: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 9 (2d6 + 2) piercing damage." },
    { n: "Claws", t: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) slashing damage. If the target is a creature other than an elf or undead, it must succeed on a DC 12 Constitution saving throw or be paralyzed for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success." }
  ]
}));

children.push(...SB({
  name: "Fence-Crow",
  meta: "Small beast, unaligned \u2014 the Eastmarch\u2019s carrion bird, and its postal service",
  ac: "12", hp: "7 (2d6)", speed: "10 ft., fly 50 ft.",
  str: 6, dex: 15, con: 10, int: 4, wis: 14, cha: 6,
  skills: "Perception +6",
  senses: "passive Perception 16",
  langs: "\u2014",
  cr: "0 (10 XP)",
  traits: [
    { n: "Keen Sight", t: "The crow has advantage on Wisdom (Perception) checks that rely on sight." },
    { n: "Mimicry", t: "The crow can mimic simple sounds it has heard, including short phrases in any language. A creature that hears the sounds can tell they are imitations with a successful DC 10 Wisdom (Insight) check. The Fence-Crows of the Eastmarch have learned perhaps forty words, all of them from men on the Fence, and all of them the same forty words." }
  ],
  actions: [
    { n: "Beak", t: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 2 (1d4) piercing damage." }
  ]
}));
children.push(PS([DM("DM Only: "), { t: "the Fence-Crow is CR 0 and is one of the most effective horror devices in this book. A party riding the Eastmarch hears a bird say please in a man\u2019s voice, and then hears three more birds say it, and there is nothing to fight." }]));

children.push(...SB({
  name: "Thin-Written Echo",
  meta: "Medium undead, unaligned \u2014 not a ghost; the shape of an event",
  ac: "13", hp: "22 (5d8)", speed: "0 ft., fly 30 ft. (hover)",
  str: 1, dex: 16, con: 10, int: 6, wis: 12, cha: 15,
  senses: "darkvision 60 ft., passive Perception 11",
  langs: "repeats what was said; understands nothing",
  cr: "1 (200 XP)",
  traits: [
    { n: "Incorporeal Movement", t: "The echo can move through other creatures and objects as difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object." },
    { n: "Not a Person", t: "The echo cannot be turned, communicated with, or laid to rest. Spells that affect undead minds have no effect on it. It is a recording, and it is playing." },
    { n: "Bound to the Moment", t: "The echo repeats one action from the event that made it, over and over, and only becomes hostile if that action is interrupted." }
  ],
  actions: [
    { n: "Grief Touch", t: "Melee Spell Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (3d6) psychic damage, and the target must succeed on a DC 12 Wisdom saving throw or spend its next turn doing what the echo is doing." }
  ]
}));

children.push(...SB({
  name: "Kennel-Worg of the Old Auxiliaries",
  meta: "Large monstrosity, neutral evil \u2014 a legion asset gone feral sixty years ago",
  ac: "14 (natural armor)", hp: "34 (4d10 + 12)", speed: "50 ft.",
  str: 16, dex: 13, con: 16, int: 7, wis: 11, cha: 8,
  skills: "Perception +4",
  senses: "darkvision 60 ft., passive Perception 14",
  langs: "Worgish, and about thirty words of legion Common",
  cr: "1/2 (100 XP)",
  traits: [
    { n: "Keen Hearing and Smell", t: "The worg has advantage on Wisdom (Perception) checks that rely on hearing or smell." },
    { n: "Kennel Discipline", t: "The worg still knows the legion\u2019s recall and stand-down commands. A creature who knows one and delivers it correctly (DC 13 Charisma (Intimidation), or automatic for a character with a legion background) ends the worg\u2019s attack this round. It will not work twice on the same worg." }
  ],
  actions: [
    { n: "Bite", t: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) piercing damage. If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone." }
  ]
}));

children.push(...SB({
  name: "Harvest Effigy",
  meta: "Large construct, unaligned \u2014 a Suthmark ankheg-effigy that somebody woke",
  ac: "13 (natural armor)", hp: "52 (7d10 + 14)", speed: "30 ft., burrow 15 ft.",
  str: 17, dex: 10, con: 15, int: 3, wis: 10, cha: 1,
  senses: "tremorsense 30 ft., passive Perception 10",
  langs: "\u2014",
  cr: "3 (700 XP)",
  traits: [
    { n: "Straw and Twine", t: "The effigy is vulnerable to fire damage and immune to poison and psychic damage." },
    { n: "Harvest Bound", t: "The effigy attacks only creatures standing on worked farmland, and stops at the field boundary. It has been given one instruction and it is following it." }
  ],
  actions: [
    { n: "Multiattack", t: "The effigy makes two Flail attacks." },
    { n: "Flail", t: "Melee Weapon Attack: +5 to hit, reach 10 ft., one target. Hit: 12 (2d8 + 3) bludgeoning damage." }
  ]
}));

children.push(...SB({
  name: "Channel-Merrow Toll-Taker",
  meta: "Large monstrosity, neutral evil \u2014 the Compact\u2019s unwritten line item",
  ac: "13 (natural armor)", hp: "60 (8d10 + 16)", speed: "10 ft., swim 40 ft.",
  str: 18, dex: 15, con: 15, int: 8, wis: 10, cha: 9,
  skills: "Perception +2",
  senses: "darkvision 60 ft., passive Perception 12",
  langs: "Aquan, Common (mercantile vocabulary only, learned entirely from negotiations)",
  cr: "3 (700 XP)",
  traits: [
    { n: "Amphibious", t: "The toll-taker can breathe air and water." },
    { n: "The Arrangement", t: "The toll-taker will not initiate combat against any vessel flying a Compact paid-mark. It knows what the mark looks like, it checks, and it has never once been wrong." }
  ],
  actions: [
    { n: "Multiattack", t: "The toll-taker makes two attacks: one with its bite and one with its harpoon." },
    { n: "Bite", t: "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) piercing damage." },
    { n: "Harpoon", t: "Melee or Ranged Weapon Attack: +6 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 11 (2d6 + 4) piercing damage, and the target must succeed on a DC 14 Strength saving throw or be pulled up to 20 feet toward the toll-taker." }
  ]
}));

children.push(...SB({
  name: "Reckoning Clerk",
  meta: "Medium humanoid (any race), lawful neutral \u2014 statted because a party will try to fight one and should not",
  ac: "11", hp: "16 (3d8 + 3)", speed: "30 ft.",
  str: 10, dex: 11, con: 12, int: 16, wis: 14, cha: 12,
  skills: "History +5, Insight +4, Investigation +7, Perception +4",
  senses: "passive Perception 14",
  langs: "Common, Old Imperial, one other",
  cr: "1/8 (25 XP)",
  traits: [
    { n: "The Record", t: "The clerk can recall, without notes, any entry they have personally made in the last eleven years. They have made about forty thousand." },
    { n: "Nothing Happens Here", t: "Violence against a Reckoning Clerk inside Normere is recorded, investigated by people with the Duke\u2019s authority, and answered. The clerk knows this and behaves accordingly, which is why they are unarmed and unafraid." }
  ],
  actions: [
    { n: "Chain (surveyor\u2019s)", t: "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 2 (1d4) bludgeoning damage. The clerk will apologize." }
  ]
}));
children.push(P("Design note: the eight blocks above were checked against SRD creatures at the same and neighboring Challenge Ratings rather than against the DMG\u2019s Monster Statistics by Challenge Rating table. The Vigil-Wight sits beside the SRD Wight (CR 3, AC 14, 45 hp) and trades its life-drain longbow for a slower, colder attrition and a nonviolent solution. The Oath-Fed Ghoul is the SRD Ghoul with its speed traded for pack tactics and a leash. The Kennel-Worg is the SRD Worg with a social off-switch. The Reckoning Clerk is a Commoner with a title, statted only so a DM has something to hold up when a player asks what happens if I hit him."));
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: "\u2022",
        alignment: AlignmentType.LEFT,
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
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(stagePath("Gazetteer_of_the_Fractured_Empire.docx"), buf);
  console.log("Written.");
});
