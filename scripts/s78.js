const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat,
        Table, TableRow, TableCell, WidthType, ShadingType } = require('docx');
const fs = require('fs');

const P = (text, opts = {}) => new Paragraph({ spacing: { after: 200 }, ...opts, children: [new TextRun({ text, ...(opts.run || {}) })] });
const PS = (segs, opts = {}) => new Paragraph({ spacing: { after: 200 }, ...opts, children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i, color: s.c })) });
const DM = (t) => ({ t, b: true, c: "5B1F1F" });   // DM-only marker: bold book-red
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const BULLET = (segs) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 }, children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i, color: s.c })) });
const B = (lead, rest) => PS([{ t: lead + " ", b: true }, { t: rest }]);
const BUL = (lead, rest) => BULLET(lead ? [{ t: lead + " ", b: true }, { t: rest }] : [{ t: rest }]);
const BOX = (text) => new Paragraph({ spacing: { after: 200 }, shading: { type: ShadingType.CLEAR, fill: "EFEAE0" }, indent: { left: 360, right: 360 }, children: [new TextRun({ text, italics: true })] });
const lcell = (text, opts = {}) => new TableCell({ width: { size: opts.w || 20, type: WidthType.PERCENTAGE }, shading: opts.head ? { type: ShadingType.CLEAR, fill: "E4DCCB" } : undefined, margins: { top: 50, bottom: 50, left: 90, right: 90 }, children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text, bold: !!opts.head, size: 18 })] })] });
const ltable = (headers, widths, rows) => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [ new TableRow({ children: headers.map((h, i) => lcell(h, { head: true, w: widths[i] })) }), ...rows.map(r => new TableRow({ children: r.map((v, i) => lcell(v, { w: widths[i] })) })) ] });
const mod = (v) => { const m = Math.floor((v - 10) / 2); return (m >= 0 ? "+" : "\u2212") + Math.abs(m); };
const abCell = (text, bold) => new TableCell({ width: { size: 16.6, type: WidthType.PERCENTAGE }, shading: bold ? { type: ShadingType.CLEAR, fill: "E4DCCB" } : undefined, children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40, before: 40 }, children: [new TextRun({ text, bold: !!bold, size: 20 })] })] });
const SB = (d) => {
  const out = [];
  out.push(new Paragraph({ spacing: { before: 240, after: 40 }, children: [new TextRun({ text: d.name, bold: true, size: 26, color: "5B1F1F" })] }));
  out.push(PS([{ t: d.meta, i: true }], { spacing: { after: 120 } }));
  out.push(B("Armor Class:", d.ac)); out.push(B("Hit Points:", d.hp)); out.push(B("Speed:", d.speed));
  out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    new TableRow({ children: ["STR","DEX","CON","INT","WIS","CHA"].map(h => abCell(h, true)) }),
    new TableRow({ children: [d.str,d.dex,d.con,d.int,d.wis,d.cha].map(v => abCell(v + " (" + mod(v) + ")")) })
  ] }));
  out.push(P("", { spacing: { after: 60 } }));
  if (d.saves) out.push(B("Saving Throws:", d.saves));
  if (d.skills) out.push(B("Skills:", d.skills));
  if (d.resist) out.push(B("Damage Resistances:", d.resist));
  if (d.immune) out.push(B("Damage Immunities:", d.immune));
  if (d.vuln) out.push(B("Damage Vulnerabilities:", d.vuln));
  if (d.condimmune) out.push(B("Condition Immunities:", d.condimmune));
  if (d.senses) out.push(B("Senses:", d.senses));
  if (d.langs) out.push(B("Languages:", d.langs));
  out.push(B("Challenge:", d.cr));
  (d.traits||[]).forEach(t => out.push(PS([{ t: t.n + ". ", b: true, i: true }, { t: t.t }])));
  if (d.actions && d.actions.length) { out.push(PS([{ t: "ACTIONS", b: true }], { spacing: { before: 80, after: 80 } })); d.actions.forEach(a => out.push(PS([{ t: a.n + ". ", b: true, i: true }, { t: a.t }]))); }
  if (d.reactions && d.reactions.length) { out.push(PS([{ t: "REACTIONS", b: true }], { spacing: { before: 80, after: 80 } })); d.reactions.forEach(a => out.push(PS([{ t: a.n + ". ", b: true, i: true }, { t: a.t }]))); }
  return out;
};
const docShell = (children) => new Document({
  numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  styles: { default: { document: { run: { font: "Georgia", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Georgia", color: "3B2F2F" }, paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 27, bold: true, font: "Georgia", color: "3B2F2F" }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, italics: true, font: "Georgia", color: "3B2F2F" }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } }
    ] },
  sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }]
});
const title = (ch, main, sub) => {
  ch.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: main, bold: true, size: 40 })] }));
  ch.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "The Qilvayas Symphony", italics: true, size: 24 })] }));
  ch.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 360 }, children: [new TextRun({ text: sub, italics: true, size: 22, color: "5B1F1F" })] }));
};

// ==========================================================
// SESSION 7 \u2014 THE TURNING AWAY
// ==========================================================
const c7 = [];
title(c7, "Session Seven: The Turning Away", "An adventure for 4\u20136 characters of 6th level \u2014 the price of the Seal, the rooms beneath the rooms, and the faces that would not look");

c7.push(H1("Overview"));
c7.push(P("The party opens the Second Seal and descends into the Undercourt\u2019s deepest reach: three chambers of a sacred site built for a ceremony that two people were supposed to walk out of. This is not a dungeon crawl. It is an approach, and each chamber strips something away rather than throwing something at them \u2014 the practical wreckage of preparation, a corridor that makes them honest, and finally the Witness Hall, where several hundred people watched the empire\u2019s founding and chose to see nothing. The session ends on the frieze and what it means, with the party holding proof that could end houses."));
c7.push(P("Designed for a five-hour core. Pacing budget: the price of the Seal (45 minutes); the Vesting Room and Nyreeza\u2019s camp (60 minutes); the Long Approach and the memory pressure (60 minutes); the Witness Hall (90 minutes, including the Turned); the frieze and the implications (45 minutes). Optional content adds roughly 90 minutes. Combat is deliberately sparse \u2014 one encounter, and it is a puzzle wearing a fight\u2019s clothes. Milestone: the party reaches 7th level at the session\u2019s close."));

c7.push(H2("What Is Actually Happening (DM Only)"));
c7.push(P("The founding was witnessed. Several hundred people stood in the Witness Hall to see Zhuvedus and Threnvos swear the covenant that would make an empire \u2014 and when Zhuvedus broke it, the assembly turned away in unison. In this world\u2019s metaphysics that is not cowardice; it is mechanism. Oaths bind because they are witnessed (Tarnovari stone-oaths, marriage before a Church witness, Norr\u2019s landholders swearing before the assembled hall). When the assembly refused to see, they unwitnessed the covenant \u2014 and the unbinding is what made the betrayal possible rather than merely unpunished. Zhuvedus struck the blow. The witnesses made it a founding."));
c7.push(P("Two consequences run the rest of the campaign. First: the shadow does not feed only on broken oaths, it feeds on the silence around them \u2014 every institutional look-away in the empire is the same act as the Hall, which is why the Brekelands\u2019 ghoul density tracks unburied parley-breaches and not banditry. Second: witnessing starves it, and the Vigil \u2014 watched, lit, never left alone \u2014 is the counter-rite. The Vigil is penance. It was instituted by the witnesses or their children as an apology none of their descendants remember making, and it is the one practice that survives unchanged across every schism in the empire. The party already performed it correctly at Redwatch, for men they killed, for no reward, and nobody told them."));
c7.push(P("Third, and the piece that reframes the throne: the Golden Tablets were composed by the witnesses. The empire\u2019s sacred founding law is the self-exoneration document of the people who looked away \u2014 which is precisely what Nyreeza meant by \u201Cthe wound predates the Wall. The Tablets were written over it.\u201D The law was the cover-up, written first. Qilvayas is rewriting the Tablets right now, and a legal code that makes oaths enforceable, witnessed, and recorded is, in this metaphysics, a literal starvation regimen against the thing beneath his city. He built the only real weapon by institutional instinct, without any idea what he was doing. His Daily Draw \u2014 the one habit his clerks find inefficient \u2014 is him personally witnessing one citizen a day. It is the most important thing he does."));
c7.push(P("The scouring is a second crime and the same crime. Roughly two hundred years ago, as the fracture began, Emperor Vaskaren the Restorer went looking for why his empire was failing, found the Witness Hall, and had it methodically erased by masons working for weeks \u2014 an act of un-witnessing performed by the one family the founding had made. His restoration failed. Qilvayas is the second restorer of that line and does not know whether he is repeating the pattern or breaking it. Vaskaren\u2019s order survives in the dynastic archive; it is how Empress Nyreeza found the way down, and it is what waits, unopened, in her sealed dispatch case."));

c7.push(H1("Scene 1: The Price of the Seal"));
c7.push(BOX("The Seal has not changed since you left it. Twenty feet of black stone furred white in air that has never known winter, the carvings in an alphabet your educations do not contain, and at its foot the word a dead Empress scratched when her cipher stopped being enough. The cold is a pressure now, not a temperature. And behind the stone, slower than you remember it, something breathes."));
c7.push(P("The Seal is not a puzzle and not a check. It is a door built to be opened from the ceremonial side by two people speaking together \u2014 and there is one party, on the wrong side, two thousand years late. What opens it is an oath: a real one, spoken aloud by a player character in the place where sworn words carry, and meant. Not a password, not a formula. An actual commitment the campaign will hold them to."));
c7.push(BUL("Running it:", "Tell the players plainly that the door responds to sworn words. Do not tell them what to say. Let the table sit in the silence; it will be uncomfortable, and it should be. Whatever a character finally says, write it down verbatim. That promise is now load-bearing and the thing below heard it."));
c7.push(BUL("Weight, not wording:", "Any sincere oath opens the Seal. A joke, a hedge, or a deliberately trivial vow does nothing at all \u2014 the stone simply does not respond, and the failure is not a mechanic to be gamed but a mirror. A character who tries to cheat the door and then swears honestly gets in on the honest attempt."));
c7.push(BUL("What it costs:", "The oath is real. Record it in the Branch Ledger. The campaign should honor it \u2014 keeping it earns nothing mechanical, but breaking it, later, in front of the thing that heard it, is the single worst thing anyone in this party can do."));
c7.push(P("When the oath is spoken, the Seal does not grind or shudder. The frost sublimates off its face in one breath, the carvings run with condensation like a fever breaking, and it opens inward on a stair, and the smell comes up."));

c7.push(H1("Scene 2: The Vesting Room"));
c7.push(BOX("You expected the grave. What you get is cedar smoke and resin \u2014 faint, cold, two thousand years stale, and unmistakably the smell of a rite: the incense of an oath-swearing, the scent of every formal room any of you have ever stood in. Your noses say temple. Your noses say celebration. Everything else says otherwise. The chamber is small and practical: stone benches, a dry basin, iron pegs along one wall. Preparation happened here. Two sets of everything \u2014 and one set is still laid out, folded, on the bench where it was left."));
c7.push(P("The room where the two of them prepared, and the room where the party understands what kind of place this is. The unused ceremonial vestments are the module\u2019s quietest artifact: someone folded them, set them out, and nobody ever put them on. They are undecayed \u2014 the cold has kept them \u2014 and they are the correct size for a Drow of ordinary build."));
c7.push(H3("Nyreeza\u2019s Camp"));
c7.push(P("In the corner, three years old and immediately recognizable: a bedroll, the ash of a small fire, a stub of surveyor\u2019s chalk, and a stack of notes weighted under a stone. She camped here. For some length of time \u2014 the notes suggest a week, perhaps more \u2014 an Empress of Zhuvedus sat alone in this room and worked. Give this discovery room to land; the party has been following her for six sessions and this is the first place she stayed."));
c7.push(BUL("The notes (readable, her cipher, and the party has the key):", "Measurements. Sketches of the paired architecture with the second figure\u2019s absence marked and re-marked. A list of nine names in the old orthography, seven crossed out. And one page that is not survey work at all: a draft of a letter to her son, begun four times and abandoned four times, the longest attempt reaching eleven words. \u201CQilvayas \u2014 there is a thing under our house that we\u201D and then nothing."));
c7.push(BUL("The archive citation:", "One marginal note references a dynastic archive shelf-mark, not a public one. If the party pursues it later, it leads to Vaskaren\u2019s scouring order \u2014 and to the fact that Nyreeza read it before she came down. She knew what she was looking for."));
c7.push(BUL("What is not here:", "A body. No blood, no struggle, no remains. She left this room walking. (Her fate remains open by design \u2014 do not resolve it here or anywhere else without deciding to.)"));

c7.push(H1("Scene 3: The Long Approach"));
c7.push(BOX("The corridor beyond is built for a crowd: forty feet wide, colonnaded, a processional way meant to carry two columns of witnesses walking in together. Your footsteps do not echo. Words go flat and short, swallowed within a pace or two, and you find yourselves standing closer than you meant to. The cold sharpens. It is not the cold of winter or of stone. Every one of you knows this cold from somewhere else: the corridor outside a sickroom, the moment before bad news, the specific chill of a place where something has just been lost. Your hands stay warm. Your chest aches."));
c7.push(P("Two systems govern this corridor, and neither is a trap in the mechanical sense."));
c7.push(H3("Sworn Words Carry"));
c7.push(P("Ordinary speech dies within a few feet. Sworn language does not. An oath, a vow, a promise \u2014 even a casual \u201CI swear\u201D \u2014 rings down the full length of the corridor with perfect clarity and keeps ringing a half-second longer than it should. The party will discover this by accident, almost certainly from someone saying something they did not mean formally. Do not explain it. Let them work it out, and let them start watching their language. A table that begins self-censoring their characters\u2019 speech out of superstition has arrived exactly where this dungeon wants them."));
c7.push(H3("The Memory Pressure"));
c7.push(P("The corridor does not attack. It makes people honest. As the party advances, each character surfaces an unkept promise of their own \u2014 not a vision, not an illusion, not a save: plain intrusive memory, the specific and personal kind that arrives unbidden at three in the morning. Ask each player, once, quietly, in whatever order feels right: \u201CWhat does your character remember that they\u2019d rather not?\u201D"));
c7.push(BUL("Handling the answers:", "Whatever they say becomes canon. Record it. This is the single most valuable thing the module produces \u2014 six sessions of established characters, and now the DM holds each one\u2019s worst unfinished business, volunteered by the player. It will feed personal arcs for the rest of the campaign."));
c7.push(BUL("If a player declines:", "Let them. \u201CYour character keeps it down\u201D is a legitimate answer and a characterful one. Do not push; the corridor is patient and so is the campaign."));
c7.push(BUL("Shadows:", "Somewhere along the corridor, an observant character (passive Perception 15, or anyone who thinks to check) notices that shadows fall toward the deep places rather than away from the light. Let the player who spots it be the one to say it aloud."));

c7.push(H1("Scene 4: The Witness Hall"));
c7.push(BOX("The corridor opens and the ceiling goes away. A hall the size of a cathedral, tiered on all four sides \u2014 stone benches rising in ranks, hundreds upon hundreds of places, each one worn in the particular way stone wears when someone has stood on it a long time. This room held an audience. At the center, below the tiers, a floor of pale inlaid stone waits for a ceremony. And every surface that once bore a face or a name has been scoured smooth \u2014 not smashed, not defaced in rage: ground down, methodically, by people who took their time and were paid for the work."));
c7.push(P("The Hall is the session\u2019s destination and the campaign\u2019s hinge. Run the discovery in three movements, and do not rush any of them."));
c7.push(H3("First Movement \u2014 the Scale of It"));
c7.push(P("Let the party simply understand the room. A DC 14 Intelligence (Investigation) or any Seal-house education establishes the seating capacity at several hundred; the wear patterns establish they stood rather than sat, and stood for a long time. Whatever happened here was public, formal, and attended. The empire\u2019s official account of the founding \u2014 a hero, a wilderness, a divine mandate \u2014 contains no mention of an audience at all."));
c7.push(H3("Second Movement \u2014 the Turned"));
c7.push(P("When the party moves onto the ceremonial floor, they wake. See the stat block. The Turned are what remains of witnesses who died having never looked back \u2014 faceless, not by mutilation but by absence, their heads permanently averted from whatever they are nearest to. They do not approach. They do not attack anyone who is looking at them. They move, and strike, only when unobserved."));
c7.push(BUL("The encounter is a puzzle wearing a fight\u2019s clothes.", "Killing them is possible and unsatisfying and the room gets colder for it. The solution is to look at them \u2014 specifically, for a character to hold their gaze on one and not stop, and say what they see. A Turned that is witnessed \u2014 truly attended to, named aloud as a person who was here and did nothing \u2014 stops. It turns. It has no face to show, but it turns, and then it is gone, and the cold in that part of the room eases. This is the party\u2019s first practical proof that witnessing is the counter-rite, and they will not have been told."));
c7.push(BUL("Scaling:", "Four characters: 4 Turned. Five: 5. Six: 6, and one of them is a Turned Elder (as Turned, but 68 hp and its Unobserved Strike deals an extra 1d8). If the party solves the witnessing trick early, do not punish the discovery by adding more \u2014 let them clear the room fast and feel clever. The scene\u2019s payload is the frieze, not the fight."));
c7.push(H3("Third Movement \u2014 the Frieze"));
c7.push(BOX("The scouring is thorough. It is thorough on the floor, on the plinths, on every tier your lantern reaches \u2014 and then, on the highest tier of the eastern gallery, forty feet up where the light barely goes and a man on a scaffold worked alone at the end of a long day, it stops. Two spans of frieze survive. Faces. Dozens of them, carved with the particularity of portraiture \u2014 this nose, this jaw, this braid, this house-sigil worked into a collar. They are not fleeing. They are not screaming. Every single face is turned away, deliberately, in the same instant, with the composure of people who have decided together and without a word to see nothing at all."));
c7.push(P("Give the table the silence. Then let them work out what they are looking at, and do not help them. The pieces are all present: an audience, a founding, a betrayal, and several hundred people who chose not to witness it. If nobody arrives at it, that is fine \u2014 the rubbing goes in their pack and the realization can land in Session Eight, or at Vaelindra\u2019s table, or three sessions later at the worst possible moment."));
c7.push(BUL("The rubbing:", "Taking one is the obvious move and the party has the technique (Session Three). It is the only record of the founding\u2019s true shape above ground, and the faces are identifiable \u2014 house-sigils, distinctive features, enough that a Crownlands noble could recognize an ancestor. Several of those houses currently hold seats at Qilvayas\u2019s court."));
c7.push(BUL("The trap the Hall sets:", "The party now holds proof that delegitimizes the throne mid-restoration, hands Orlath a weapon, vindicates Tarnovar, and probably breaks the Church. Keeping it quiet is safer for everyone \u2014 and keeping it quiet makes them the newest witnesses to turn away. The room has just finished teaching them what that costs. Do not state this. They will feel it, and the ones who do not will feel it later."));
c7.push(BUL("Evidence of the scourers:", "DC 15 Investigation on the floor beneath the surviving frieze: two centuries of dust, and under it, a rust-stain the shape of a scaffold foot, and a single broken mason\u2019s chisel of imperial make. Someone was paid to do this. The order has a name on it, and the name is in an archive the party can eventually reach."));
c7.push(P("End the session in the Hall, under the faces. The way onward \u2014 a low arch on the western side, unscoured because nothing there bore a name \u2014 is visible, and the breathing comes from it, and it is slower than it was. Milestone: 7th level."));

c7.push(H1("Optional Content (Beyond the Five-Hour Core)"));
c7.push(B("The Ninth Name (~40 minutes, in the Vesting Room):", "Nyreeza\u2019s list of nine names in old orthography, seven crossed out, is a genuine puzzle: they are the nine great houses that stood in the front rank of the Hall. Seven are extinct. Two are not. A party that works this out \u2014 Vell can help, so can a good History check against the surviving frieze sigils \u2014 learns which two families at court descend directly from the front row, and the DM gains a pair of NPCs with two thousand years of buried motive. (Which houses is the DM\u2019s call; choosing an existing court figure is recommended and delicious.)"));
c7.push(B("The Chisel\u2019s Maker (~30 minutes):", "The broken chisel bears a maker\u2019s stamp \u2014 a masons\u2019 guild mark still in use in Aenodira, because the guild is dwarven and dwarven guilds do not change their marks. The current guildmaster can date it within a decade and will, if approached respectfully, consult the guild\u2019s own work-ledgers: two centuries back, a large commission, paid from the imperial purse, its purpose left blank. Dwarven record-keeping outlasts imperial cover-ups, and the guild has never once been asked about it."));
c7.push(B("What the Vestments Fit (~20 minutes):", "A character who thinks to compare the unused ceremonial vestments against themselves learns they are cut for a Drow of ordinary build. In an empire where the Founder\u2019s Blood is nearly extinct and the dynasty is its last house, that is a fact with a very short list of implications \u2014 and the party may reach the correct one two sessions before anyone tells them the second champion\u2019s name."));

c7.push(H1("Diverging Paths (DM Only)"));
c7.push(P("Record outcomes in the Branch Ledger."));
c7.push(BUL("The Seal-oath, and who swore it:", "The character who opened the door is now personally bound in the campaign\u2019s central mechanism, and the thing below heard them. Note the exact words. If that character is ever pressured to break that specific promise \u2014 and the campaign should eventually arrange it \u2014 that is a session-defining crisis, not a moral quandary."));
c7.push(BUL("The memory pressure answers:", "Each character\u2019s volunteered unkept promise is now canon and is the seed of their personal arc. Players who declined keep the ambiguity; do not force it later, but the corridor remembers, and so does the DM."));
c7.push(BUL("The Turned \u2014 witnessed vs. destroyed:", "Witnessed: the party has practiced the counter-rite without being taught it, and Session Eight\u2019s Vigil will come to them intuitively. Destroyed: the Vigil is harder, the room is colder, and the DM should let the party notice \u2014 in Session Eight \u2014 that the ones they killed are still here, still turned, still waiting to be seen."));
c7.push(BUL("The rubbing, taken or left:", "Taken: the party carries a political bomb, and every faction that learns of it wants it. Left: the Hall stays a secret they merely know, which is safer and quietly corrosive \u2014 and the DM should note who argued for leaving it."));
c7.push(BUL("Told or untold:", "Whether the party ever shows the rubbing to Shen, Vaelindra, Vell, Orlath, Tarnovar, or the throne is the campaign\u2019s largest live decision from here forward. Every recipient is a different second half. Flag it prominently and do not rush them."));

c7.push(H1("Stat Blocks"));
SB({ name: "The Turned", meta: "Medium undead, neutral",
  ac: "14 (grave-formal dress, hardened)", hp: "52 (8d8 + 16)", speed: "30 ft.",
  str: 14, dex: 14, con: 15, int: 8, wis: 12, cha: 6,
  resist: "necrotic, cold; bludgeoning, piercing, and slashing from nonmagical attacks",
  condimmune: "charmed, exhaustion, frightened, prone",
  senses: "blindsight 60 ft. (it has no eyes and does not need them), passive Perception 11",
  langs: "understands Old Imperial; cannot speak", cr: "3 (700 XP)",
  traits: [
    { n: "Averted", t: "The Turned has no face. Its head is permanently averted from whatever it is nearest to, and it cannot be made to look by force, damage, or magic \u2014 only by being witnessed." },
    { n: "Only When Unobserved", t: "The Turned can move and attack only while no creature is looking directly at it. A creature that spends its action watching one Turned (declared openly) freezes that Turned entirely for the duration. This is the encounter\u2019s core tension: attention costs actions, and there are more of them than there are of you." },
    { n: "Witnessed", t: "If a creature holds its attention on a single Turned for one full round AND describes aloud what it sees \u2014 naming the Turned as a person who stood here and did nothing \u2014 the Turned turns to face the speaker, is laid to rest, and vanishes. No check. No damage. This is the intended solution and the module's whole thesis." },
    { n: "The Colder Room", t: "Each Turned destroyed by damage rather than witnessed lowers the temperature of the Hall by a degree the party can feel, and the DM should say so, every time, without explanation." }
  ],
  actions: [
    { n: "Unobserved Strike", t: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target that cannot currently see it. Hit: 14 (3d6 + 4) necrotic damage. The Turned cannot make this attack against a creature that is looking at it." }
  ] }).forEach(x => c7.push(x));
c7.push(P("Turned Elder (six-character parties): as the Turned, but 68 hit points, and its Unobserved Strike deals an extra 4 (1d8) necrotic damage. It is the one at the front."));

c7.push(H1("Loot and Found Rewards \u2014 Session Seven"));
c7.push(ltable(["Find","Value / Effect"],[40,60],[
 ["The unused ceremonial vestments","Undecayed, cold-preserved, cut for a Drow of ordinary build. Not magical. Worth more than anything the party owns."],
 ["Nyreeza\u2019s working notes","Her measurements, the nine names, the four abandoned letters to her son, and a dynastic archive shelf-mark that leads to Vaskaren\u2019s order."],
 ["The frieze rubbing","The only above-ground record of the founding\u2019s true shape. Identifiable faces and house-sigils. A political weapon and a moral test."],
 ["The broken mason\u2019s chisel","Imperial make, guild-stamped, two centuries old. The physical thread to the scouring order."],
 ["Nyreeza\u2019s surveyor\u2019s chalk (second stub)","Mundane. Half-used. Free. Put it next to the first one."]
]));
c7.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "~", size: 24 })] }));
c7.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u201CThey are not fleeing. They are not screaming. They have decided, together and without a word, to see nothing at all.\u201D", italics: true })] }));

// ==========================================================
// SESSION 8 \u2014 THE UNKEPT VIGIL
// ==========================================================
const c8 = [];
title(c8, "Session Eight: The Unkept Vigil", "An adventure for 4\u20136 characters of 7th level \u2014 the rite floor, the last champion, and the funeral that never happened");

c8.push(H1("Overview"));
c8.push(P("Beyond the Witness Hall lies the Rite Floor, and on it, still speaking his half of a covenant into the dark, Threnvos. He is present, responsive, and worn past everything except the ceremony \u2014 two thousand years of grief have taken language, memory, and self, and left only the words he was saying when it happened. He cannot answer questions. He says his part, and waits for a response that never came, and begins again."));
c8.push(P("The session\u2019s work is the Vigil: someone sits, someone watches, someone speaks the responses nobody spoke. It takes the whole night \u2014 which means the party must commit to remaining in the dark until a dawn they cannot see. The hunger that shares his grave will try to stop them, because the Vigil is the only thing that can take anything away from it. And when the Vigil is kept, the grief goes out of the room, and the room gets colder, and what remains does not grieve, does not remember, and wants nothing except more."));
c8.push(P("Designed for a five-hour core. Pacing budget: the arch and the first hearing (30 minutes); the Rite Floor and Threnvos (60 minutes); understanding what he needs (45 minutes); the Vigil, in three watches with interruptions (120 minutes); the parting and the ascent (45 minutes). Optional content adds roughly 60 minutes. Milestone: 8th level at the Vigil\u2019s completion."));

c8.push(H2("What Is Actually Happening (DM Only)"));
c8.push(P("Threnvos was killed by his sworn brother under the Matron\u2019s own witness and buried under a wall, under a forum, under a founding myth \u2014 with no Vigil, no watching, no light, and nobody to see him home. In a culture where doctrine holds that the Matron watches the dead home and does it at night, and that the Vigil is owed to the dead as dead and not as the good, that is not merely a cruelty. It is the wound. The thing beneath Aenodira is an unkept vigil two thousand years long, and it has been waiting in the dark for someone to sit with it."));
c8.push(P("The entity has two fused components: Threnvos\u2019s grief, which is a person and can be laid to rest, and the impersonal hunger the broken covenant unleashed, which is not and cannot. Keeping the Vigil separates them. It is a real victory and it is not the victory: the grief goes quiet because it was the only part a funeral could touch, and what is left is hunger, fed for two centuries by an empire that keeps breaking its word and looking away. The party should feel this as loss \u2014 something recognizably personal leaves the world, and what remains is worse for being emptier. The nastiest implication is one they will reach on their own, probably on the walk up: the part they just gave peace to was the part that could, in principle, have been reasoned with."));
c8.push(P("This is the campaign\u2019s pivot from dungeon problem to civilization problem. What remains is fed by Norr\u2019s oath-web if he ever breaks it, by Vasq\u2019s unspoken order, by Karvel\u2019s coronation covenant sworn in the wrong direction, by every deserter at every Redwatch, and by every institution that looks away. Either the empire learns to keep its word, or the thing beneath it never stops eating \u2014 which makes the Zhuvedian Laws the actual weapon, and the Grey-Gold Rising considerably more than a set piece."));
c8.push(P("On the Matron: she may well be down here, and may always have been, keeping the vigil nobody else would. Divine magic works normally in the deep reach; clerics who pray receive. But there is never a form, never a voice, never a confirmation, and no amount of investigation resolves it \u2014 the ambiguity is permanent and deliberate. What sells it is the quality of the answer: two thousand years of doctrine about the She-Wolf who watches the dead home, and none of it prepares a devout character for the fact that what answers in this room is grieving."));

c8.push(H1("Scene 1: The Arch, and the First Hearing"));
c8.push(BOX("The western arch was never scoured, because nothing on it bore a name. Beyond it the stair goes down only a little further, and then the smell of cedar and resin is suddenly strong \u2014 the incense of a rite, in the moments before it begins \u2014 and under it, for the first time, you hear words. A voice. Not the breathing: a voice, speaking slowly and clearly in a language none of you know, in the cadence every one of you recognizes, because you have all sworn oaths in that cadence. It reaches the end of a phrase. It stops. It waits. The silence goes on a beat too long, and then a beat too long again, and then it begins the same phrase from the start."));
c8.push(P("Let the party listen. They will work out the shape before they understand a word: this is someone swearing an oath and pausing for a response that does not come. A DC 15 Intelligence (History), or any character with Old Imperial or academy liturgical training, recognizes the *form* \u2014 an antiphonal covenant-rite, the oldest kind, where two parties alternate lines. Nobody at the table can translate the words yet. That is correct and intentional."));

c8.push(H1("Scene 2: The Rite Floor"));
c8.push(BOX("The chamber is not large. After the Hall it feels almost domestic \u2014 a room built for two people to stand close together in front of witnesses far above. Everything in it is paired: twin plinths, twin basins, two low stone seats, an approach from either side converging at the center. It is still set. Two thousand years and the vessels are still in place, the cloths still folded, the ceremony still laid out and waiting. And at the center, facing a place where no one stands, is what is left of the second champion."));
c8.push(P("On Threnvos\u2019s presentation: do not make him a monster and do not make him a ghost of the tragic-noble kind. He is a shape that the eye keeps failing to finish \u2014 tall, robed in the vestments\u2019 twin, features that resolve for half a second at a time and are Drow, and old, and unbearably tired. He does not menace. He does not notice the party at first. He is mid-rite and has been for two millennia."));
c8.push(H3("What He Can and Cannot Do"));
c8.push(BUL("He speaks only the ceremony.", "Grief has worn away language, memory, and self, and left the covenant \u2014 the way severe aphasia can take speech but leave a song known since childhood. He cannot answer questions, cannot explain the founding, cannot name Zhuvedus. Do not let him become an exposition dispenser; the truth comes from Vaelindra\u2019s names, the Tarnovari ballad cycle, and Nyreeza\u2019s documents, which is where it belongs."));
c8.push(BUL("He is a participant, not a recording.", "He must demonstrably respond to the party specifically, or the whole scene reads as scripted. Three beats to deploy as they land: he goes silent and still if anyone speaks a sworn word aloud in this room, and waits, and then resumes when it is not the response; he turns toward whoever carries Dren\u2019s medallion and does not turn away again; and if a character who has broken an oath in play comes within ten feet, he stops mid-phrase, and something like recognition crosses whatever he has instead of a face, and it is not accusation \u2014 it is company."));
c8.push(BUL("He cannot be fought, and should not be.", "He has no stat block by design. Attacks pass through him with the sensation of putting one\u2019s hand into cold water. If a party insists on hostility, the room grows colder and he keeps going, and eventually the players will feel the shape of what they are doing to a man who is trying to finish a wedding."));
c8.push(H3("Understanding What He Needs"));
c8.push(P("The party has every piece required. They have kept a Vigil (Session One, if they did \u2014 and if they did not, this is where that omission returns). They know the doctrine: watched, lit, never left alone, owed to the dead as dead. They have just spent a session learning that witnessing lays the unquiet to rest (the Turned). And they are standing in front of a man who never got any of it. Let them assemble it. Nudges if needed, in escalating order: the ceremony pauses for a response; the second set of vestments in their pack; a devout character\u2019s training; and finally, if the table is truly stuck, a cleric who prays receives \u2014 not words, just the certainty of what is owed here, and the distinct impression that whatever answered is already doing it and has been for a very long time."));

c8.push(H1("Scene 3: The Vigil"));
c8.push(P("The Vigil requires the full night: light kept burning, the dead attended, never left alone, and \u2014 here \u2014 the responses spoken. Structure it as three watches, and put a real interruption in each. The hunger cannot stop them by force; it can only try to make them stop themselves."));
c8.push(H3("Running the Watches"));
c8.push(BUL("Watch One \u2014 the Cold.", "The temperature drops hard enough to matter. Each character makes a DC 13 Constitution save at the watch\u2019s midpoint; failure means one level of exhaustion. Fire helps and the party will think of it. What the scene is really asking is whether they will spend resources on a corpse\u2019s comfort. (DM: the cold is not an attack. It is the room resisting being warmed. Describe it as reluctance, not malice.)"));
c8.push(BUL("Watch Two \u2014 the Unwitnessed.", "The hunger sends the only thing it has: four Unwitnessed (five for five characters, six for six), the shapeless residue of things that happened here and were not seen. They do not want to kill the party \u2014 they want the Vigil broken, and they target light sources, the vestments, and whoever is speaking the responses. A party that fights them while maintaining the Vigil (at least one character continuously attending, light kept) wins the encounter in the way that matters. A party that abandons the Vigil to fight cleanly must begin the watch again."));
c8.push(BUL("Watch Three \u2014 the Offer.", "The subtlest and the best. In the small hours, the hunger stops attacking and starts talking \u2014 not aloud, and not to everyone: to one character, in the voice of the person whose promise they confessed in the Long Approach. It is not an illusion and not a charm, and it does not lie. It simply offers, with perfect sincerity, to let them go back and keep that promise instead. No save; nothing compels. The DM asks the player what their character does, and the answer is the character\u2019s. If they leave the Vigil, the others can complete it without them \u2014 and that character carries something for the rest of the campaign."));
c8.push(H3("The Responses"));
c8.push(P("Speaking Threnvos\u2019s missing half is the Vigil\u2019s substance, and no character knows the words. This is intentional. The party must improvise \u2014 whatever a character says, in whatever language, in the pauses he leaves. It does not need to be correct. It needs to be a response, offered in good faith, in the right place. Let the players write the second half of the founding covenant themselves, out loud, at the table."));
c8.push(BOX("Near dawn \u2014 you have no way to know it is dawn, and every one of you knows it anyway \u2014 he reaches the end of a phrase, and stops, and someone answers, and he does not begin again. For the first time in two thousand years the rite goes forward. He turns. He has no face to show you and he turns anyway, and something in the shape of him settles, the way a man sets down a weight he has carried so long he had stopped calling it a weight. He is not grateful. He is not at peace, exactly. He is finished. And then he is not there, and the vestments in your pack are suddenly, ordinarily warm, and the cold in the room that was grief is gone entirely \u2014 and the room is colder than it has ever been."));

c8.push(H1("Scene 4: What Remains"));
c8.push(P("Give this its full time. The Vigil is complete, a man is at rest, and every instinct the party has says they have won. Then let them notice, one detail at a time, that the thing beneath Aenodira is still here \u2014 and that it is worse."));
c8.push(BUL(null, "The breathing has not stopped. It has changed: no longer slow and sleeping, but shallow and attentive, the sound of something that has just lost something and has not yet decided what that means."));
c8.push(BUL(null, "Dren\u2019s medallion is colder than it has ever been \u2014 and for the first time since Redwatch, whoever carries it can feel it *listening*."));
c8.push(BUL(null, "A character who prays receives, still. And whatever answers is no longer grieving. It is simply present, and waiting, and the difference between those two things is the entire back half of this campaign."));
c8.push(P("The party has separated a murdered man from the appetite that wore his grief as a face. What is left does not remember Threnvos, does not want justice, and cannot be reasoned with, because the part that could have been reasoned with is the part they just laid to rest. It has been fed for two hundred years by an empire that breaks its word and looks away, and it will keep eating as long as that continues. There is no monster to kill at the bottom of this hole. There is a civilization to fix."));
c8.push(P("The way out is the way they came. The Second Seal will not close behind them \u2014 the frost does not re-form. Let them notice that too."));

c8.push(H1("Scene 5: The Ascent, and Who to Tell"));
c8.push(P("They come up into Aenodira with the vestments, the rubbing, Nyreeza\u2019s notes, an archive shelf-mark, and the knowledge of what the empire is standing on. The session\u2019s last forty-five minutes belong to the decision that shapes the campaign\u2019s second half: who learns any of this."));
c8.push(BUL("Vaelindra:", "She promised them the names when they came back alive. She keeps that promise \u2014 Zhuvedus, Threnvos, the Oathbreaker\u2019s fall, all of it \u2014 and she is the only person who can tell them the funeral was real and insufficient without it sounding like defeat. If they tell anyone, tell her first."));
c8.push(BUL("Shen:", "Gets them the archive. The dynastic shelf-mark is beyond a mercenary company and routine for the Bureau of Correspondence. She will also, correctly, identify the rubbing as the most dangerous object in the empire, and ask a question the party may not want to answer: what do you intend to do with it?"));
c8.push(BUL("Vell:", "Can date the frieze, read the old orthography of the nine names, and will be the first person to say aloud that the Golden Tablets postdate the Hall. He will need to sit down."));
c8.push(BUL("The throne:", "Nyreeza\u2019s last instruction was do not follow, and the party now knows why \u2014 and also knows the Laws are the weapon. Telling Qilvayas is no longer a betrayal of her wishes; it may be the completion of them. This remains the campaign\u2019s largest gate. Handle deliberately."));
c8.push(BUL("Nobody:", "Also a choice. The Hall taught them exactly what it costs, and they will make it anyway if they are frightened enough, which is the most human ending this arc has."));
c8.push(P("Milestone: 8th level. The first arc of the campaign is closed: students, vision, Seeress, Proving, dead letters, the Seal, the Hall, and a funeral two thousand years late. The second arc is the empire itself."));

c8.push(H1("Optional Content (Beyond the Five-Hour Core)"));
c8.push(B("The Vestments Returned (~30 minutes):", "The party carries the second champion\u2019s unworn ceremonial dress. Options with weight: burn them properly with a Vigil of their own at any shrine; carry them to Tarnovar, where a Voivode who does not know why will nonetheless know exactly what she is being handed; or give them to Qilvayas, which is either the kindest or the cruelest thing anyone has ever done to that man. No wrong answer; every answer is a scene."));
c8.push(B("What the Wolves Knew (~20 minutes):", "In the days after, the wolves of Aenodira begin returning to the Old Forum district \u2014 slowly, family by family, reversing three years of quiet exodus. Nobody in the city can explain it. A party with a companion wolf notices first, and a party that pays attention learns something true and unspoken: something down there is at rest that was not before. It is the only unambiguous good news this arc produces, and it arrives without commentary."));
c8.push(B("The Fourth Letter (~30 minutes):", "Nyreeza\u2019s abandoned drafts to her son can be finished \u2014 by the party, in her hand or their own, and delivered. The scene is not about whether Qilvayas believes it. It is about whether they choose to give a grieving man eleven words his mother could not finish. If the campaign ever opens the sealed dispatch case, this is the beat it will be measured against."));

c8.push(H1("Diverging Paths (DM Only)"));
c8.push(P("Record outcomes in the Branch Ledger."));
c8.push(BUL("The Vigil kept, broken, or refused:", "Kept: Threnvos is at rest permanently, the hunger is exposed and alone, and the campaign proceeds as designed. Broken and resumed: the same outcome, one night later, with the party knowing they faltered. Refused entirely: Threnvos remains, the entity stays fused, and the campaign keeps a monster that can still be spoken to \u2014 a genuinely different and viable second half. Do not force the funeral."));
c8.push(BUL("Watch Three \u2014 who took the offer:", "A character who left the Vigil to chase a kept promise carries it forward: they know they were offered their worst regret and reached for it, in front of everyone. No mechanical penalty. Considerable narrative weight, and the entity now knows exactly what that character is worth."));
c8.push(BUL("The responses, verbatim:", "Whatever the players improvised as the covenant\u2019s missing half is now canon \u2014 the actual second voice of the founding rite, spoken two thousand years late by people who were not there. Write it down. If the campaign ever needs a counter-oath, a binding, or words to end things with, use theirs."));
c8.push(BUL("Who they told:", "The single largest branch in the campaign. Vaelindra opens the mythology; Shen opens the archive and the politics; Vell opens the scholarship and the scandal; the throne opens everything at once and cannot be closed; nobody preserves the status quo at a cost the Hall already named. Sessions Nine onward are built from this answer."));
c8.push(BUL("Did they keep the Redwatch Vigil (Session One)?", "If yes, the party arrives at the solution here intuitively and the DM should reward the callback openly. If no, make the omission felt \u2014 not punitively, but the realization that they have done this wrong once before, to eight men in a ruined fort, should land somewhere in this session."));

c8.push(H1("Stat Blocks"));
SB({ name: "The Unwitnessed", meta: "Medium undead (residue), chaotic evil",
  ac: "13", hp: "45 (7d8 + 14)", speed: "0 ft., fly 30 ft. (hover)",
  str: 8, dex: 16, con: 14, int: 6, wis: 10, cha: 12,
  resist: "cold, necrotic; bludgeoning, piercing, and slashing from nonmagical attacks",
  immune: "poison", vuln: "radiant",
  condimmune: "charmed, exhaustion, frightened, grappled, paralyzed, petrified, poisoned, prone, restrained",
  senses: "darkvision 60 ft., passive Perception 10", langs: "\u2014", cr: "3 (700 XP)",
  traits: [
    { n: "Residue", t: "The Unwitnessed are the shapeless remainder of things that happened in this place and were not seen. They have no faces because they never had witnesses \u2014 not the same condition as the Turned, and a scholar will notice the difference." },
    { n: "Break the Watch", t: "The Unwitnessed prioritize, in order: open flames and light sources, the ceremonial vestments, and whoever is currently speaking the responses. They will pass up an easy kill to snuff a lantern. They are not trying to win a fight; they are trying to end a funeral." },
    { n: "Incorporeal Movement", t: "Can move through creatures and objects as difficult terrain, taking 5 (1d10) force damage if it ends its turn inside an object." }
  ],
  actions: [
    { n: "Smothering Touch", t: "Melee Spell Attack: +5 to hit, reach 5 ft., one target. Hit: 13 (3d6 + 3) necrotic damage. If the target is holding a light source, it must succeed on a DC 13 Dexterity saving throw or the light is extinguished." },
    { n: "Quench (Recharge 6)", t: "All nonmagical light within 20 feet gutters and dies. Magical light of 3rd level or lower is suppressed for 1 round. The dark is the point." }
  ] }).forEach(x => c8.push(x));
c8.push(P("Threnvos has no stat block, by design. He cannot be fought, damaged, banished, turned, or compelled. If a DM ever needs a number for him, the number is the Vigil."));

c8.push(H1("Loot and Found Rewards \u2014 Session Eight"));
c8.push(ltable(["Find","Value / Effect"],[40,60],[
 ["The completed Vigil","No mechanical reward. The DM should offer none and the party should not ask."],
 ["The vestments, warm","After the Vigil the second champion\u2019s dress is ordinary cloth, ordinary temperature, two thousand years old and perfectly preserved. Whatever the party does with it is a scene (see Optional Content)."],
 ["The covenant\u2019s second half","Whatever the players improvised, now canon and recorded. Arguably the most valuable object the campaign will ever produce."],
 ["The Rite Floor vessels","Pre-imperial ceremonial silver, paired, undecayed \u2014 400 gp to a collector, and the party will not sell them, and the DM should let them not sell them."],
 ["The wolves\u2019 return","Not an item. Not a reward. The only unambiguous good news in this arc (see Optional Content)."]
]));
c8.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "~", size: 24 })] }));
c8.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u201CThere is no monster to kill at the bottom of this hole. There is a civilization to fix.\u201D", italics: true })] }));

Promise.all([
  Packer.toBuffer(docShell(c7)).then(b => fs.writeFileSync("/home/claude/QS_Session_7_The_Turning_Away.docx", b)),
  Packer.toBuffer(docShell(c8)).then(b => fs.writeFileSync("/home/claude/QS_Session_8_The_Unkept_Vigil.docx", b))
]).then(() => console.log("Both written."));
