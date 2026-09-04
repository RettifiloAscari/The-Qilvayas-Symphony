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
const row = (cells) => new TableRow({ children: cells, cantSplit: true });
// The header row repeats when a long table spans a column or page break.
const headerRow = (cells) => new TableRow({ children: cells, cantSplit: true, tableHeader: true });
const table = (headers, widths, rows) => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: CW(widths), layout: TableLayoutType.FIXED, rows: [ headerRow(headers.map((h, i) => cell(h, { head: true, w: widths[i] }))), ...rows.map(r => row(r.map((v, i) => cell(v, { w: widths[i] })))) ] });
const mod = (v) => { const m = Math.floor((v - 10) / 2); return (m >= 0 ? "+" : "\u2212") + Math.abs(m); };
const abCell = (text, bold) => new TableCell({ width: { size: 16.6, type: WidthType.PERCENTAGE }, shading: bold ? { type: ShadingType.CLEAR, fill: "E4DCCB" } : undefined, children: [new Paragraph({ keepNext: !!bold, alignment: AlignmentType.CENTER, spacing: { after: 40, before: 40 }, children: [new TextRun({ text, bold: !!bold, size: 20 })] })] });
const SB = (d) => { const out = []; out.push(new Paragraph({ spacing: { before: 240, after: 40 }, children: [new TextRun({ text: d.name, bold: true, size: 26, color: "5B1F1F" })] })); out.push(PS([{ t: d.meta, i: true }], { spacing: { after: 120 } })); out.push(B("Armor Class:", d.ac)); out.push(B("Hit Points:", d.hp)); out.push(B("Speed:", d.speed)); out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: CW([1, 1, 1, 1, 1, 1]), layout: TableLayoutType.FIXED, rows: [ new TableRow({ cantSplit: true, children: ["STR","DEX","CON","INT","WIS","CHA"].map(h => abCell(h, true)) }), new TableRow({ cantSplit: true, children: [d.str,d.dex,d.con,d.int,d.wis,d.cha].map(v => abCell(v + " (" + mod(v) + ")")) }) ] })); out.push(P("", { spacing: { after: 60 } })); if (d.saves) out.push(B("Saving Throws:", d.saves)); if (d.skills) out.push(B("Skills:", d.skills)); if (d.resist) out.push(B("Damage Resistances:", d.resist)); if (d.immune) out.push(B("Damage Immunities:", d.immune)); if (d.condimmune) out.push(B("Condition Immunities:", d.condimmune)); if (d.senses) out.push(B("Senses:", d.senses)); if (d.langs) out.push(B("Languages:", d.langs)); out.push(B("Challenge:", d.cr)); (d.traits||[]).forEach(t => out.push(PS([{ t: t.n + ". ", b: true, i: true }, { t: t.t }]))); if (d.actions && d.actions.length) { out.push(PS([{ t: "ACTIONS", b: true }], { spacing: { before: 80, after: 80 } })); d.actions.forEach(a => out.push(PS([{ t: a.n + ". ", b: true, i: true }, { t: a.t }]))); } if (d.reactions && d.reactions.length) { out.push(PS([{ t: "REACTIONS", b: true }], { spacing: { before: 80, after: 80 } })); d.reactions.forEach(a => out.push(PS([{ t: a.n + ". ", b: true, i: true }, { t: a.t }]))); } return out; };



// ---------- content ----------
const children = [];

children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 300 },
  children: [new TextRun({ text: "The Player\u2019s Companion", bold: true, size: 44 })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 120 },
  children: [new TextRun({ text: "The Qilvayas Symphony", italics: true, size: 26 })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 300 },
  children: [new TextRun({ text: "Backgrounds, names, faith, downtime, and everything else you need to build somebody who is actually from here", italics: true, size: 22, color: "5B1F1F" })]
}));

children.push(H1("A Note on This Book"));
children.push(P("Everything here is safe to read. There are no secrets in this volume, nothing withheld, and nothing that will spoil a scene your DM is planning. It is a book about being a person in this empire: where you were born, what you were trained to do, who your family swears to, what you say when a Prelate walks into the room, and what your character does with the four weeks between adventures."));
children.push(B("A note on the rules:", "this campaign runs on the 2014 edition of the fifth-edition rules: the Player\u2019s Handbook, Monster Manual, and Dungeon Master\u2019s Guide as they stood before the 2024 revision. If you learned the game from the newer books, most of what you know still applies, but a few things do not \u2014 there are no weapon masteries here, backgrounds and ancestries work the older way, and exhaustion, grappling, and a handful of spells follow the earlier text. Bring whichever books you own; the table will sort out the differences, and none of them change the story."));
children.push(P("Everything in this book is optional. A character built entirely out of the Player\u2019s Handbook works perfectly in this world. This volume exists so that a player who wants their character to have grown up somewhere specific has somewhere specific to have grown up."));

children.push(H1("The Peoples of the Empire, For Players"));
children.push(P("Every ancestry in the Player\u2019s Handbook exists here and none of them needs a mechanical change. What changes is what it means to walk into a room as one."));
children.push(table(
  ["Ancestry", "In This Empire"],
  [22, 78],
  [
    ["Drow", "The Founder\u2019s Blood, and the imperial dynasty\u2019s own. You are rare, you are conspicuous, and every stranger\u2019s first thought is a question about your family. Drow outside the dynasty exist in every province and are treated as minor nobility whether or not they own anything. The Matron\u2019s liturgies are sung at night and the Drow are held to be her first-favored children of the dark, which is either a great honor or a great deal of unwanted attention depending on the day."],
    ["Human", "Most of everyone, and regionally distinct enough that a Suthfolk accent in Kamenhold is a whole conversation before you have said anything. Ostfolk, Suthfolk, Crownlander, Velmarene, Brekelander, Tarnovari, Orlathine, Ardvenner, Normerine, Skell \u2014 pick one, and pick what it costs you."],
    ["Dwarf", "Two distinct communities. The masons' dwarves of the Crownlands hold hereditary charters and built most of what you are standing on. The Stonesworn of Tarnovar are a third of that nation, fully Tarnovari, and swear on stone with everyone else. Hill dwarf families in the eastern Suthmark have learned that the valley\u2019s law does not climb."],
    ["Elf", "Faded high-elf houses in the Crownlands with long memories and short money \u2014 excellent addresses, unheated. Wood-elf communities in Tarnovar\u2019s Old Wood and the Ardven wilds, who keep the eldest ballads and are politely uninterested in the empire\u2019s opinion of them."],
    ["Half-Elf", "Common in Velmareth to the point of unremarkability, and increasingly common anywhere trade goes. Chancellor Sorral is one; so is Archjurist Vhal. In the provinces you will be asked which half more often than is comfortable."],
    ["Halfling", "The Coppergate halflings of the capital run guilds, and the harvest-clans of the Suthmark run the south\u2019s actual food supply. Both communities are old, established, and extremely good at being underestimated on purpose."],
    ["Gnome", "The Craft\u2019s gnomes: thaumaturgy, mechanism, and the licensing paperwork thereof. A rock gnome with a Charter is a professional; a rock gnome without one is a suspect; the two are frequently the same person on different days."],
    ["Half-Orc", "The marches' respected veteran families, especially in the Ostmark, where three generations of legion service is an ordinary family history. Being half-orc in the Ostmark means being from a military family. Being half-orc in the Crownlands means explaining that."],
    ["Tiefling (the Marked)", "Legal standing in Velmareth and the Delta Compact, uniquely in the world. Everywhere else, an open question that the Zhuvedian Laws have not answered and are about to have to. You are not hunted. You are unfiled, which in this empire is its own kind of exposure."],
    ["Dragonborn", "Rare, foreign, and assumed to be from somewhere further away than you actually are. No settled community anywhere in the fractured empire, which means you have never once met a stranger who knew what to expect."]
  ]
));

children.push(H1("Backgrounds"));
children.push(P("Eight backgrounds native to this empire, in the 2014 format. Each gives two skill proficiencies, tools or languages, equipment, and a feature. Ideals and flaws are handled a little differently here \u2014 see The Six Ideals, below \u2014 because in a world where a sworn word has weight, what you believe is a more useful question than which alignment you picked."));

children.push(H2("Academy Cohort"));
children.push(P("You are a student of the Imperial Academy of the Lupine Throne, or you were. Three houses, five years, and a graduating cohort that will be scattered across the empire\u2019s institutions within a decade. You know the corridors, the requisition forms, and which professor can be woken before noon."));
children.push(BUL("Skill Proficiencies:", "History, and one of Arcana, Investigation, or Athletics, depending on your house."));
children.push(BUL("Languages:", "Old Imperial, plus one other of your choice."));
children.push(BUL("Equipment:", "A set of fine clothes bearing your house\u2019s colors, a student\u2019s writing kit, a letter of standing from your house, a set of common clothes, and a belt pouch containing 15 gp."));
children.push(BUL("Feature \u2014 The Cohort:", "The Academy places its graduates everywhere, and they remember each other. In any settlement of 2,000 or more in loyalist territory, you can find a former student of the Academy within a day of asking. They will hear you out, give you honest information within their competence, and expect nothing in return except that you do the same when it is your turn. They will not break a law for you, and they will remember if you ask."));

children.push(H2("Vigil-Keeper"));
children.push(P("You kept the Hall. Every town has one, most keepers are widowed or elderly, all of them are paid almost nothing, and every one of them knows exactly who in town has died owing what to whom. You have sat with more bodies than you can count and you have never once left one alone in the dark."));
children.push(BUL("Skill Proficiencies:", "Insight, Religion."));
children.push(BUL("Tools:", "Herbalism kit."));
children.push(BUL("Equipment:", "A vigil lamp and a month\u2019s oil, a set of common clothes, a mourning band, the parish register page recording the last Vigil you kept, and a belt pouch containing 8 gp."));
children.push(BUL("Feature \u2014 The Night Watch:", "Any Vigil Hall in the empire will take you in, feed you, and let you sleep, on the sole condition that you keep the watch if there is a watch to keep. This holds across every schism: the Sanctum\u2019s halls, Orlath\u2019s, the Suthmark\u2019s field-parishes, and any Ardven monastery-burgh will all honor it, because the Vigil is the one thing the fractured faith still agrees on. Vigil-keepers also talk to each other, and a keeper will tell you things they would tell no magistrate."));

children.push(H2("Chartered Apprentice"));
children.push(P("You served under a Chartered Thaumaturge of the House of the Craft \u2014 fetching, grinding, copying, and being blamed. You never got your own Charter, or you have not yet, and either way you know exactly how the licensing system works from the inside, which is worth more than most people\u2019s magic."));
children.push(BUL("Skill Proficiencies:", "Arcana, and one of Investigation or Persuasion."));
children.push(BUL("Tools:", "Calligrapher\u2019s supplies."));
children.push(BUL("Equipment:", "Calligrapher\u2019s supplies, a bound apprentice\u2019s commonplace book, a master\u2019s chop (a seal you are not strictly entitled to still be carrying), common clothes, and a belt pouch containing 12 gp."));
children.push(BUL("Feature \u2014 Knows the Forms:", "You can read a Charter and tell instantly what it permits, what it does not, and where it has been altered. Chartered thaumaturges will treat you as a colleague of lower rank rather than a member of the public, which gets you into workrooms and out of arguments. You also know which offices issue what, and how long each of them actually takes, which is a form of power nobody respects until they need it."));

children.push(H2("Tally-Keeper"));
children.push(P("You are Skell, or you were raised among them, and you keep the sticks. Every debt owed, every promise made, every promise broken, cut into wood and held against the day it is collected. Your people have nowhere to be buried and remember everything instead."));
children.push(BUL("Skill Proficiencies:", "History, and one of Perception or Athletics."));
children.push(BUL("Tools:", "Navigator\u2019s tools, or woodcarver\u2019s tools."));
children.push(BUL("Equipment:", "A set of tally-sticks recording your own family\u2019s outstanding debts, a knife, cold-weather clothing, navigator\u2019s tools, and a belt pouch containing 10 gp."));
children.push(BUL("Feature \u2014 The Reckoning:", "You remember obligations with perfect clarity and you can prove them. Any Skell who hears your recitation of a debt will accept it as accurate without argument, which can stop a raid. Outside the Skellvard, the habit reads as an unnerving memory for who owes what \u2014 and merchants, magistrates, and creditors of every nation will find you useful and will not entirely enjoy it."));

children.push(H2("Oathstone Carver"));
children.push(P("You are Tarnovari, and you cut the stones. Every family\u2019s oath stands in the high field at Kamenhold and somebody has to shape them, set them, and recut them when eighty winters have worn the words away. The work is slow, unpaid in any way an imperial would recognize, and taken with total seriousness."));
children.push(BUL("Skill Proficiencies:", "Insight, and one of History or Survival."));
children.push(BUL("Tools:", "Mason\u2019s tools."));
children.push(BUL("Equipment:", "Mason\u2019s tools, an Oathstone Charm, traveler\u2019s clothes, a carved token from an oath you witnessed, and a belt pouch containing 10 gp."));
children.push(BUL("Feature \u2014 The Word Kept:", "You can tell when someone is swearing an oath they intend to keep, as opposed to one they merely intend to say. This is not magic and it is not infallible \u2014 it is thirty years of watching people\u2019s hands at the stones. Once per day, when you hear a sworn statement, you may take a moment to consider it and ask the DM one yes-or-no question about the speaker\u2019s intention. Among Tarnovari, your judgment on such a matter is taken seriously by people who have no other reason to take you seriously at all."));

children.push(H2("Inkhand"));
children.push(P("Rivergate, below the waterline, where the gray market in unlicensed scrollwork operates on the principle that the penalty structure has taught everyone to be very good or very quick. You were one or the other. You are still deciding which."));
children.push(BUL("Skill Proficiencies:", "Deception, Sleight of Hand."));
children.push(BUL("Tools:", "Forgery kit, thieves' tools."));
children.push(BUL("Equipment:", "A forgery kit, a set of dark common clothes with a hood, three blank sheets of good vellum, a chop of a guild you do not belong to, and a belt pouch containing 15 gp."));
children.push(BUL("Feature \u2014 Below the Waterline:", "In any city district where unlicensed work is done, you can find the people who do it within a few hours, and they will deal with you at trade rates rather than stranger\u2019s rates. You also know the etiquette: what you may ask, what you may not, and that bringing the Watch back with you \u2014 even accidentally \u2014 ends the relationship permanently and in one direction."));

children.push(H2("Bound-Freed"));
children.push(P("You were held under one of the four tiers, and you are not any more. Manumission, expiry, purchase, or a magistrate; it does not matter which, because the fact of it is written on your papers and your papers go everywhere with you. You know what an obligation actually costs, from the inside, in a way nobody who has only sworn one ever will."));
children.push(BUL("Skill Proficiencies:", "Insight, and one of Athletics, Sleight of Hand, or Persuasion."));
children.push(BUL("Tools:", "One artisan\u2019s tools of your choice \u2014 whatever you were made to learn."));
children.push(BUL("Equipment:", "Your release papers, sealed and registered, the tools of your former trade, common clothes, a token from whoever helped you, and a belt pouch containing 5 gp."));
children.push(BUL("Feature \u2014 The Papers:", "You carry sealed proof of your own status, and you have learned to read everyone else\u2019s. You can spot a forged or altered seal on any document of personal status at a glance, and you know, in any settlement, where the bound are kept, who holds them, and which of them are near the end of a term. Communities of the bound and the freed will shelter you without being asked twice."));

children.push(H2("Legion Orphan"));
children.push(P("Your parent marched, and did not come back, and the legion raised you the way legions raise their dead\u2019s children: badly, collectively, and without ever quite letting go. You grew up in a garrison town knowing every drill call before you could read."));
children.push(BUL("Skill Proficiencies:", "Athletics, Intimidation."));
children.push(BUL("Tools:", "One gaming set, and vehicles (land)."));
children.push(BUL("Equipment:", "Your parent\u2019s oath-medallion, a legion blanket, a gaming set, common clothes, and a belt pouch containing 10 gp."));
children.push(BUL("Feature \u2014 The Standard Remembers:", "The legions look after their own dead\u2019s children, and the obligation outlasts the unit. Present your parent\u2019s medallion at any legion post and you will be fed, sheltered, and heard \u2014 grudgingly by some, warmly by most, and never refused. Rank-and-file legionaries will speak to you candidly about things they would not tell an officer, because you are not a stranger; you are somebody\u2019s."));

children.push(H2("The Six Ideals"));
children.push(P("Instead of a separate ideals table per background, this setting uses six, because six is what the empire actually argues about. Roll or choose."));
children.push(table(
  ["d6", "Ideal", "What It Means"],
  [11, 19, 70],
  [
    ["1", "The Oath", "A word given is a thing that exists. Keeping it when it costs nothing is not keeping it. (Lawful)"],
    ["2", "The Den", "There are people behind me, and everything is permitted in front of them. (Any)"],
    ["3", "The Record", "What is written down survives us, and what is not written down did not happen. (Lawful)"],
    ["4", "Mercy", "The empire is a machine for producing correct outcomes, and I am here for the incorrect ones. (Good)"],
    ["5", "Ambition", "Something is going to be built out of this wreckage. I would like it to be mine. (Any)"],
    ["6", "The Road Out", "No throne, no see, no duke, no Book. I have seen what happens to the filed. (Chaotic)"]
  ]
));

children.push(H2("Eight Flaws Native to This Empire"));
children.push(table(
  ["d8", "Flaw"],
  [11, 89],
  [
    ["1", "I have never in my life failed to point out that I was right, and it has cost me two friendships and a post."],
    ["2", "I keep every promise I make, which is why I have learned to make almost none, and people notice."],
    ["3", "I cannot walk past a document I am not supposed to read."],
    ["4", "Authority makes me agreeable in the room and furious afterward, and the second one always comes out somewhere."],
    ["5", "I owe somebody something I have not told the others about."],
    ["6", "I assume the institution is lying, which is usually correct and occasionally catastrophic."],
    ["7", "I am afraid of dying unwatched, and it makes me reckless in ways that look like courage."],
    ["8", "I flinch at the sound of my own family name, and I have not explained why to anyone."]
  ]
));

children.push(H1("Names"));
children.push(P("Ten naming cultures, all of them visible in the corpus already. Pick a column and take whatever you like; nothing here is reserved. Family names work differently by region, and the second table says how."));

children.push(H2("Given Names"));
children.push(table(
  ["Culture", "Some Names"],
  [24, 76],
  [
    ["Crownlander", "Cassivar, Emeth, Vareth, Ossian, Ilsevet, Senna, Corvin, Dathenor, Liria, Merrit, Doria, Havel, Tobas, Anselm, Perisse, Yenna, Elleth, Marek, Coren"],
    ["Ostfolk", "Petra, Varkos, Gavric, Aurel, Wenna, Hobb, Alder, Bram, Kessin, Odric, Dren, Sarra, Malich, Bertic, Orell"],
    ["Suthfolk", "Aldous, Tavian, Emerenn, Velsanna, Corla, Ansel, Sesta, Bellara, Marra, Dovin, Perrine, Aldric, Yssa, Colm"],
    ["Tarnovari", "Ysavet, Dregan, Ilinca, Bavric, Dorna, Radek, Milena, Vosk, Anka, Stefan, Zorya, Lubek, Verica"],
    ["Velmarene", "Semele, Anneke, Ilvane, Pietro, Marisel, Donato, Roost, Vesna, Alessa, Caro, Nerida, Fausto"],
    ["Brekelander", "Bettra, Ilmarch, Coll, Semya, Halvenne, Rook, Danna, Grist, Weyl, Marn, Ottick"],
    ["Orlathine", "Olvesa, Vestan, Muriel, Tobrin, Anselma, Kry, Ovric, Serimund, Elke, Radomir, Vessa"],
    ["Ardvenner", "Karvel, Halvig, Torvald, Aske, Ingrith, Sigvard, Brenna, Roald, Astrid, Erlend, Gudrun"],
    ["Skell", "Aldrec, Sigrun, Orm, Hafl, Vandr, Thora, Kell, Ragna, Steinar, Yrsa, Bjol, Ingar"],
    ["Normerine", "Garvin, Adric, Hesta, Doorn, Penn, Marec, Wilhelmina, Bram, Oster, Lene, Vandel"]
  ]
));

children.push(H2("How Family Names Work"));
children.push(table(
  ["Culture", "The Convention", "Example"],
  [24, 50, 26],
  [
    ["Crownlander", "A house name, used from birth, and the older it is the less anyone explains it.", "Ilsevet Corvane"],
    ["Ostfolk", "A house name, or the village, or the legion your family served \u2014 often all three in a formal setting.", "Petra Malich of the Third"],
    ["Suthfolk", "House name for the gentry; for everyone else, the estate or the vineyard you were born on.", "Corla Bray of Ambervale"],
    ["Tarnovari", "The family, and then the oath-stone field it stands in. A Tarnovari introduced without their stone has been insulted.", "Bavric Halt, of the high field"],
    ["Velmarene", "The banking or trading house, if you have one; the parish, if you do not; and everybody knows which is which.", "Semele Drach of Meldane"],
    ["Brekelander", "Whatever you have left. Many Brekelanders use the name of a village that no longer exists, deliberately.", "Semya of Halvenne"],
    ["Orlathine", "A given name and a penitential epithet earned in adulthood, which you do not choose.", "Olvesa the Reconciled"],
    ["Ardvenner", "Patronymic in the old country style, increasingly a house name in the new towns, and the two mark a generation gap.", "Halvig Roaldsson"],
    ["Skell", "Patronymic, plus the ship. Always the ship.", "Orm Vandsson, of Sea-Grey"],
    ["Normerine", "A house name, and a Reckoning Book reference, which is not a joke and is used in legal documents.", "Adric Penn, Book IV.211"]
  ]
));

children.push(H1("Faith, For a Believer"));
children.push(P("Your character grew up in this. Here is what they know without having to look it up."));
children.push(B("The Matron is one.", "She is a great wolf, she is the empire\u2019s patron and older than the empire by a very long way, and she watches the dead home. The one thing every schism in the world agrees on is the Vigil: nobody is burned, buried, or given to the water before they have been kept through at least one full night \u2014 watched, lit, and never left alone."));
children.push(B("She has offices, not parts.", "The Aspects are the different things she does. Saying the Matron in her Hunt is correct. Saying the Matron of the Hunt, as though there were another Matron somewhere doing something else, is a heresy with a name, and the name is Division, and a village priest will correct you gently and a Sanctum examiner will write it down."));
children.push(table(
  ["Aspect", "For a Cleric", "Who Serves It"],
  [24, 21, 55],
  [
    ["The Watch at the Threshold", "Life", "Vigil-keepers, hospitallers, almoners, midwives. The most ordinary calling in the empire."],
    ["The Long Hunt", "War", "Legion chaplains and the Church militant. Endurance rather than fury; the Matron does not sprint, she arrives."],
    ["The Long Memory", "Knowledge", "Archivists, jurists, scriptoria. She remembers every promise made in her hearing."],
    ["The Lamp Left Burning", "Light", "Light kept through the night rather than sunrise \u2014 dawn is her gift, not her element."],
    ["The Elder Range", "Nature", "The Old Observance: field-shrines, first-fruits, the wolf-watch on winter roads. Older than the Church and never quite reconciled to it."],
    ["The Winter Voice", "Tempest", "The northern liturgies. The Sanctum finds it provincial and the north finds the Sanctum soft."],
    ["The Limping Bitch", "Trickery", "The she-wolf who feigns a broken leg to lead the hunter away from the den. Never recognized. Never suppressed. Painted on half the barn doors in the Suthmark."]
  ]
));
children.push(B("The Sanction is a license, not a source.", "The Church claims sole authority to say who may lawfully channel, interpret, and minister. It does not claim to be the source of the power, because it plainly is not: the See of Orlath issues a rival sanction and its clerics keep their spells, and the Matron has conspicuously declined to rule. A sanctioned cleric carries a pewter warrant-medal stamped on the reverse with their Aspect\u2019s mark. An unsanctioned healer in Church lands is a problem the Office of Omens exists to solve, politely."));
children.push(B("Paladins swear, and it shows.", "Devotion is the Crown-sworn and the Church\u2019s Oathwards. The Ancients is the Green Watch \u2014 the Old Observance\u2019s paladins, sworn at field-shrines, holding warrants nobody issued. Vengeance is the Wolf-Price made a vocation, respectable in the provinces where blood debt is a legal category and awkward at court."));

children.push(H2("The Saints, and Their Feasts"));
children.push(P("Fourteen names carry the empire\u2019s devotion. A literate Zhuvedian can recite them badly; a village priest, perfectly. Feast days are working holidays in the parishes that keep them."));
children.push(table(
  ["Feast", "Saint", "Patron Of"],
  [26, 28, 46],
  [
    ["Wolfmoon 1", "Lupenna of the First Shrine", "Hospitality, guest-right, roadside shrines. Her feast opens the year."],
    ["Wolfmoon 4", "Ivessa of the Ford", "Rearguards, ferrymen, and anyone who says go on without me."],
    ["Thawtide 11", "Coren the Unhurried", "Vigil-keepers, night-workers, and the patient."],
    ["Sowmonth 8", "Yenna Corvane", "Advocates and the badly represented."],
    ["Sowmonth 27", "Perisse the Milkless", "Foundlings, nurses, and the bound-freed."],
    ["Haymonth 9", "Vosk the Field-Cutter", "Surgeons, medics, and their consciences."],
    ["Harvestide 2", "Bellara of Ambervale", "Harvests, almoners, and honest thieves."],
    ["Vinmoon 3", "Ilvane the Sea-Kept", "Pilots, harbor-hands, and merchants who honor a bad contract."],
    ["Fallowmonth 21", "Halvard of the Quiet Rite", "Stonewrights, record-keepers, and unglamorous fidelity."],
    ["Greywane 14", "Tobrin Ashfall", "The falsely accused."],
    ["Greywane 30", "Elleth of the Grey Gate", "Gatekeepers, quarantine wardens, and the unforgivable choice."],
    ["Longdark 19", "Odarr of the Nine Winters", "Winter travelers, the maimed, and the stubborn."],
    ["Threshold 6", "Marek the Witness", "Witnesses, oath-keepers, and inconvenient truth."],
    ["\u2014 (suppressed)", "Ovric, Struck from the Canon", "Nothing, officially. Removed by decree ninety years ago; the Ostmark parishes never stopped."]
  ]
));

children.push(H1("Downtime"));
children.push(P("Time between adventures is measured in weeks, and this empire gives a character plenty to do with them. Each activity below states its cost per week, what it takes, and what you get. Your DM decides how much downtime you have; these are the things worth spending it on here."));
children.push(table(
  ["Activity", "Cost / Week", "What Happens"],
  [25, 18, 57],
  [
    ["Keep a Vigil", "Free (you are fed)", "Sit the night watch at a local Hall. At the end of a week you have the trust of that parish, one genuinely useful piece of local information, and a standing welcome. Vigil-keepers talk to each other across the whole empire."],
    ["Sit an Examination", "5 gp in fees", "Present yourself for a certification \u2014 Charter, Sanction, physician\u2019s ticket under Book Three, a guild\u2019s letter. DC 15 check with the relevant skill, one attempt per week, and the paperwork takes a further week after you pass."],
    ["Petition a Court", "10 gp", "File and pursue a matter before a magistrate. One week to file, 1d4 weeks to be heard, and a Persuasion or relevant knowledge check when you are. The empire\u2019s courts genuinely work; they are simply slow, and Book Four wants everything sealed."],
    ["Work the Charter", "Earns 1 gp/day", "Practice a licensed trade under your own or a master\u2019s Charter. Covers a modest lifestyle and builds standing with the Craft, the Concord, or whichever body licenses you."],
    ["Race Week", "15 gp", "The Long Course, on a side, in the stands. Make a DC 15 Charisma check: on a success, you have made a contact and heard something worth hearing. On a failure, you have made a contact and heard something worth hearing, and also a rival, and also you owe somebody money."],
    ["Pilgrimage", "5 gp", "Walk one of the four roads \u2014 the Matron\u2019s Road, the Penitent\u2019s Stair, the Nine Winters Way, the Three Fords. Two to five weeks. You arrive with a story, a token, and the goodwill of every shrine on the route."],
    ["Study", "20 gp", "Access to a library \u2014 the Academy\u2019s open stacks, Lettervik\u2019s scriptorium, a Concord archive. Each week grants proficiency in one language or one tool after ten weeks total, per the standard rules, and a chance at one specific answer you are looking for."],
    ["Craft", "Half the item\u2019s cost", "The standard 5e crafting rules. In this empire, crafting anything that requires a Charter without one is a Book Three offense, and the fine is larger than the item."],
    ["Recuperate", "Lifestyle cost", "Three days of rest ends one disease or one effect of the Damp, or removes one level of exhaustion beyond what a long rest handles. A certified physician halves the time; an uncertified one costs a tenth as much and is a coin-flip."],
    ["Carouse", "Lifestyle cost", "Standard results, with a Zhuvedian twist: on a very good roll you are invited to witness somebody\u2019s oath, which is a real relationship and a real obligation, and it will come back."]
  ]
));

children.push(H1("Etiquette: What to Say"));
children.push(P("The empire has five parallel ladders of rank and no single order of precedence, which means the practical skill is not knowing who outranks whom. It is knowing what to call them."));
children.push(table(
  ["Speaking To", "Say", "Do Not"],
  [30, 26, 44],
  [
    ["The Emperor", "Your Majesty, then Sire", "Do not speak first. Do not turn your back leaving the room."],
    ["The Matriarch", "Your Radiance", "Do not call her Mother; that is for a Prelate\u2019s parish clergy and it will read as either ignorance or mockery."],
    ["A Prelate", "Your Reverence", "Do not assume he answers to the Matriarch. He holds his writ from the Synod."],
    ["A Duke or Duchess", "Your Grace", "Do not use it for a Count. It is a specific rank and correcting you is free entertainment."],
    ["A Voivode", "Your Voice", "Do not use any imperial style at all. She is not an imperial subject and the mistake is heard as a claim."],
    ["A Magistrate, in court", "Your Honor", "Do not use it outside court. Ondrei will be embarrassed for you."],
    ["An Academy Professor", "Professor", "Not Magister. That collided with Magistrate and was abolished; using it dates you by twenty years."],
    ["A Legate", "Legate, then sir or ma\u2019am", "Do not salute unless you have the right to."],
    ["A Harborlord", "Harborlord, then your name", "Do not offer a title you were not given. Velmareth reads that as an opening bid."],
    ["A Ban", "Ban, and then very little", "Do not make a promise in his hearing that you are not certain of."]
  ]
));

children.push(H1("Thirty Things In Your Pocket"));
children.push(P("Roll a d30, or pick. Every one of these is ordinary in this empire and none of them is magical."));
children.push(table(
  ["d30", "Item", "d30", "Item"],
  [11, 39, 11, 39],
  [
    ["1", "A pewter warrant-medal with the Aspect mark filed off", "16", "A league-stone rubbing from a road that no longer exists"],
    ["2", "Three tally-sticks, two of them yours", "17", "A pressed flower from a Suthmark field-shrine"],
    ["3", "A Long Course betting slip, Greys, unredeemed, four years old", "18", "A child\u2019s drawing of a wolf, folded very small"],
    ["4", "A Pilgrim\u2019s Wolfstone that has never once done anything", "19", "A key to a door in a district that burned"],
    ["5", "Half a vigil candle, kept", "20", "A vintner\u2019s cork stamped with a year everyone remembers"],
    ["6", "A legion button, wrong regiment", "21", "A page of Old Imperial you cannot read and will not throw away"],
    ["7", "A letter you have carried for two years and not delivered", "22", "A tooth, not yours, not human"],
    ["8", "An Oathstone Charm with the cord replaced twice", "23", "A Concord factor\u2019s chop, expired"],
    ["9", "A bone die that rolls a little high", "24", "Ferry-fare for two, in strands, kept separate from everything else"],
    ["10", "A splinter of Second Treasury relic, uncertified, magnificent story", "25", "A ration of Serren\u2019s Mill poppy-milk, unopened"],
    ["11", "A ring sized for somebody else", "26", "A funeral band from a Vigil you did not finish"],
    ["12", "A folded chart of the delta channels, three years out of date", "27", "A copper wolf-token from a Lupenna candle-stall"],
    ["13", "A cracked mirror in a case, for signaling", "28", "The lock of hair a bound-freed keeps from the house they left"],
    ["14", "A ledger page with one entry circled", "29", "A whistle carved from a Fence-Crow\u2019s leg bone"],
    ["15", "Somebody else\u2019s release papers, sealed, and you have never opened them", "30", "A stone from the Penitent\u2019s Stair, carried down, which is against the rules"]
  ]
));

children.push(H1("Twenty Questions for a Zhuvedian"));
children.push(P("Answer five and you have a character. Answer all twenty and you have somebody your DM can build a session around."));
children.push(BUL(null, "What oath have you sworn that you still keep, and who witnessed it?"));
children.push(BUL(null, "What oath have you broken? Was it Released properly, or does it still sit there?"));
children.push(BUL(null, "Whose Vigil have you kept? Whose did you miss?"));
children.push(BUL(null, "Which Aspect does your family address, and do you agree with them?"));
children.push(BUL(null, "Which saint\u2019s feast does your household actually keep, as opposed to the ones it says it keeps?"));
children.push(BUL(null, "What is written about you in a register somewhere, and is it accurate?"));
children.push(BUL(null, "Gold or Grey? And did you inherit it, or choose it, and does your family know?"));
children.push(BUL(null, "Who in your family served, and did they come back?"));
children.push(BUL(null, "What can you not afford any more that your grandparents could?"));
children.push(BUL(null, "Have you ever been out of the Crownlands? What surprised you?"));
children.push(BUL(null, "What did the Academy teach you that you have decided is wrong?"));
children.push(BUL(null, "Which of the other player characters did you know before this, and what do you know about them that they have not told the others?"));
children.push(BUL(null, "What are you afraid somebody will write down?"));
children.push(BUL(null, "Who taught you to read, if anyone?"));
children.push(BUL(null, "What do you owe, and to whom, and in what currency?"));
children.push(BUL(null, "What would make you break your word? Be specific."));
children.push(BUL(null, "Where do you want to be buried, and who have you told?"));
children.push(BUL(null, "What does your family say about the fracture \u2014 that it was somebody\u2019s fault, or that it was weather?"));
children.push(BUL(null, "Do you believe the restoration will work? Does saying so out loud cost you anything?"));
children.push(BUL(null, "What is the one thing you would not do, for any price, and has anyone ever offered?"));
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
  fs.writeFileSync(stagePath("QS_Players_Companion.docx"), buf);
  console.log("Written.");
});
