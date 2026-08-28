const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat,
        Table, TableRow, TableCell, WidthType, ShadingType } = require('docx');
const fs = require('fs');

const P = (text, opts = {}) => new Paragraph({ spacing: { after: 160 }, ...opts, children: [new TextRun({ text, ...(opts.run || {}) })] });
const PS = (segs, opts = {}) => new Paragraph({ spacing: { after: 160 }, ...opts, children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i, color: s.c })) });
const DM = (t) => ({ t, b: true, c: "5B1F1F" });   // DM-only marker: bold book-red
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const BULLET = (segs) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 100 }, children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i, color: s.c })) });
const BUL = (lead, rest) => BULLET(lead ? [{ t: lead + " ", b: true }, { t: rest }] : [{ t: rest }]);

// Table cell helpers
const cell = (text, opts = {}) => new TableCell({
  width: { size: opts.w || 20, type: WidthType.PERCENTAGE },
  shading: opts.head ? { type: ShadingType.CLEAR, fill: "E4DCCB" } : undefined,
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
  children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text, bold: !!opts.head, italics: !!opts.i, size: 19 })] })]
});
const row = (cells) => new TableRow({ children: cells });
const table = (headers, widths, rows) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    row(headers.map((h, i) => cell(h, { head: true, w: widths[i] }))),
    ...rows.map(r => row(r.map((v, i) => cell(v, { w: widths[i] }))))
  ]
});

const c = [];
c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "DM Reference Guide", bold: true, size: 40 })] }));
c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "The Qilvayas Symphony", italics: true, size: 24 })] }));
c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "A quick-reference cheat sheet \u2014 Atlas, NPCs, and mythology at a glance", italics: true, size: 22, color: "5B1F1F" })] }));
c.push(PS([{ t: "Living document \u2014 update alongside the sourcebook. Current through the full Social Foundations program \u2014 imperial law, language and literacy, currency, and medicine and disease all closed; Marked personhood and the Grey-Gold Rising the two live threads, both resolving at Solacre Day. Sessions 0\u20138; the Undercourt descent is complete.", i: true, b: true }], { alignment: AlignmentType.CENTER, spacing: { after: 300 } }));

// ============ ATLAS ============
c.push(H1("The Atlas \u2014 Regions at a Glance"));
c.push(table(
  ["Region", "Ruler / Power", "Disposition", "Key Notes"],
  [16, 18, 14, 52],
  [
    ["The Crownlands", "Direct imperial rule", "Loyal (core)", "Aenodira and its river valley; imperial law at full strength here only. INLAND \u2014 river trade via Rivergate, no ocean harbor (nearest salt water: Velmareth, 10 days downriver). Race-day factions: the Golds and the Greys."],
    ["The Ostmark", "Legion garrisons; Magistrate Cassivar Ondrei (Dravenna); Marshal Gavric Dane", "Loyal (towns) / inertial (country)", "Colonel Aurel Dessen\u2019s grain scandal ongoing. Dane recovered the Ninth\u2019s lost standard \u2014 the legions\u2019 darling, the court\u2019s worry."],
    ["The Suthmark", "Duchess Emerenn Vasq (n\u00e9e Meldane)", "Loyal, devout, scarred", "Feeds the capital. Carries the Vintage Night (6 yrs ago) and the Greywell disappearances."],
    ["Principality of Tarnovar", "Voivode Ysavet Morn; Ban Dregan Morn (Eastmarch)", "Independent (100 yrs)", "DM ONLY: descended from Threnvos\u2019s people. Oath-culture; \u201CVosthren\u201D ballads. Dregan\u2019s Fence holds the Brekeland border. Do not spend early."],
    ["Velmareth / Delta Compact", "The Harborlords (incl. House Meldane)", "Neutral / disorder-preferring", "Merchant republic; Exchange delegations answer here. Meldane money reaches into the Suthmark."],
    ["The Brekelands", "Warlords Bettra Skarn & Ilmarch Voss (shrinking)", "Fractured / being absorbed", "Granary War produced the Halvenne refugees. Squeezed between Norr\u2019s Reckoning Book (west) and Dregan\u2019s Fence (east)."],
    ["The See of Orlath", "Saint-Regent Olvesa the Reconciled", "Schismatic \u2014 coronation pending", "Founded ~58 yrs ago by Olvesa. Preparing to crown Karvel Emperor of the True Rite this Solacre (~9 mo out)."],
    ["Kingdom of Ardven", "King Karvel", "Rival power (north)", "Twelve crowns unified in 15 yrs. Monastery schools, working restoration. Olvesa\u2019s grandson; coronation imminent."],
    ["The Skellvard", "Sea-King Aldrec the Landless", "Hostile \u2014 but persuadable", "Displaced ship-clans, pushed south by Ardven. Aldrec wants a march and a title; refused four times; dying slowly."],
    ["Duchy of Normere", "Duke Garvin Norr, the Bastard", "Rival power (west)", "Conquest + the Reckoning Book + personal oaths. Absorbing the Brekelands. Qilvayas\u2019s dark mirror. The Harrowing of the Weld, 4 yrs ago."]
  ]
));

c.push(H1("Imperial and Border Jurisdiction, at a Glance"));
c.push(table(
  ["Region", "Legal Status", "Who Enforces"],
  [22, 34, 44],
  [
    ["The Crownlands", "Direct Rule \u2014 imperial law at full strength", "Palatine Guard; imperial magistrates"],
    ["The Ostmark", "Loyalist Provincial \u2014 nominal, unevenly enforced", "Thin legion garrisons; Magistrate Ondrei\u2019s model"],
    ["The Suthmark", "Loyalist Provincial \u2014 genuinely loyal, ducal house", "Duchess Vasq\u2019s household authority + the Church"],
    ["Principality of Tarnovar", "Sovereign Treaty-Nation \u2014 imperial law N/A", "Oath-custom; the Voivode; Dregan\u2019s Fence (unsanctioned)"],
    ["Velmareth / Delta Compact", "Sovereign Treaty-Nation \u2014 own mercantile law; Marked hold legal standing here, uniquely", "The Harborlords; the Compact\u2019s own courts"],
    ["The Brekelands", "Contested / Warlord \u2014 statute unenforced", "Individual warlords; no appeal exists"],
    ["The See of Orlath", "Parallel Legal-Religious Authority", "Olvesa\u2019s See; its own rival Sanction"],
    ["Kingdom of Ardven", "Sovereign Treaty-Nation \u2014 independent crown", "King Karvel\u2019s own developing law"],
    ["The Skellvard", "Non-Territorial Customary Law", "Clan lawspeakers; tally-sticks record debts"],
    ["Duchy of Normere", "De Facto Replacement \u2014 claimed, superseded", "Norr\u2019s personal-oath system + the Reckoning Book"]
  ]
));
c.push(PS([{ t: "Marked (tiefling) personhood beyond Velmareth\u2019s exception: LIVE thread, not resolved by this pass \u2014 see Branch Ledger and Items/Threads. Book One\u2019s one clause the Commission hasn\u2019t closed; party action before the Solacre promulgation can tip it either way.", i: true }]));

c.push(H1("Aenodira \u2014 Districts at a Glance"));
c.push(table(
  ["District", "Ring", "What\u2019s There", "Key Figure"],
  [14, 12, 46, 28],
  [
    ["Highcourt", "Inner", "Lupine Throne, ministries, the Long Course", "Lord Chamberlain Vareth Kessin"],
    ["The Sanctum", "Inner", "Great Temple, Office of Omens, clergy", "Matriarch Ilsevet Corvane"],
    ["The Old Forum", "Inner", "Ruins, Zhuvedus monument, catacombs", "DM ONLY: confirmed site \u2014 the binding lies beneath (Undercourt)"],
    ["Coppergate", "Middle", "Vaelindra\u2019s apartment, Ninth Lane", "Vaelindra of the Still Waters"],
    ["Scholar\u2019s Row", "Middle", "The Academy, restricted archives", "Archivist Dathenor Vell"],
    ["The Exchange", "Middle", "Guildhalls, merchant delegations", "Guildmaster Ptolan Vess"],
    ["The Garrison", "Middle", "Barracks, Palatine Guard HQ", "Legate Bruvasca Thorne"],
    ["The Archwork", "Outer", "Housing built into a bricked-up aqueduct", "\u2014 working-class, unnamed"],
    ["Farrowgate", "Outer", "Refugee/displaced quarter", "\u2014 where Halvenne\u2019s people land if not resettled"],
    ["Rivergate", "Outer", "Docks, river trade, document underworld", "\u2014 Odric Hale\u2019s seal-dealer thread"]
  ]
));

// ============ NPCs ============
c.push(H1("Key NPCs by Circle"));

c.push(H2("The Imperial Court"));
c.push(table(
  ["Name", "Role", "Notes"],
  [22, 22, 56],
  [
    ["Emperor Qilvayas", "110-yr-old Drow Emperor", "Precise, quietly relentless, never raises his voice. Daily Draw of petitions. Has not entered his mother\u2019s study in 3 years. Sealed dispatch case in her cipher (canon \u2014 unopened; keyed by \u201Cthe garden, not the grave\u201D)."],
    ["Lord Chamberlain Vareth Kessin", "Gatekeeper to the Emperor", "Career bureaucrat; served Nyreeza first. Opinion of Qilvayas vs. his mother never once stated."],
    ["Archjurist Senna Vhal", "Head, Law Commission", "Holds the pen on the Zhuvedian Laws. Battles Kessin over access, the provinces over every clause."],
    ["Legate Bruvasca Thorne", "Commander, Palatine Guard", "HISTORICAL KEY: Belisarius. The throne\u2019s one great commander (the Ashline, 800 vs. thousands). Beloved by the legions, mistrusted for it, never given the army she was made for. Husband Bram keeps the ledger of unkept promises. Holds Ondrei\u2019s complaint vs. Colonel Dessen."],
    ["Mistress Averil Shen", "Bureau of Correspondence (spymaster)", "Nyreeza\u2019s creature first. Only courtier who ran her own inquiry into the disappearance."],
    ["Hierophant Malzeth Corr", "Head, Keepers of the Ascent (imperial cult)", "Maintains the dynastic shrine at Highcourt; Qilvayas\u2019s relation to the cult is correct, not warm."]
  ]
));

c.push(H2("The Church"));
c.push(table(
  ["Name", "Role", "Notes"],
  [22, 22, 56],
  [
    ["Matriarch Ilsevet Corvane", "Voice of the Matron in Aenodira", "Church\u2019s public face, not necessarily its supreme authority. Institution first, truth second."],
    ["Prelate Sarvin Odell", "Head, Office of Omens", "ACTIVE ANTAGONIST (S5\u20136): surveillance, summons, then the Writ of Examination vs. Vaelindra. Beatable by law or politics, never by argument. The copyist below Vaelindra reports to him."]
  ]
));

c.push(H2("The Academy"));
c.push(table(
  ["Name", "Role", "Notes"],
  [22, 22, 56],
  [
    ["Archivist Dathenor Vell", "Keeper of restricted stacks", "Ancient, dry, volunteers nothing. Refers party to Vaelindra (Session 2). Knows why her Church career ended."],
    ["Professor Corvin Dail", "Master of Trials", "Designed the party\u2019s Proving. Praises by noting absence of error. Sat his own Proving 40 years ago."],
    ["Chancellor Emeth Sorral", "Head of the Academy", "Commencement-polish drops when surprised \u2014 the Cold Door does it. Knows the wards fail in the eastern stacks."],
    ["Instructor Liria Fenn", "House of the Craft (stagecraft)", "Plays \u201CMerla\u201D in the Proving. Warm and wicked once unmasked."]
  ]
));

c.push(H2("Vaelindra of the Still Waters \u2014 The Seeress"));
c.push(P("Elderly human, ex-Church functionary sidelined after a vision the Church couldn\u2019t tolerate. Lives above a copyist\u2019s shop, Coppergate, Ninth Lane. Reframes the shared vision as potential, not prophecy. DM ONLY: her career-ending vision showed fragments of the true founding \u2014 Zhuvedus, the broken oath, Threnvos. She and Nyreeza discussed this in their final meeting; she believes Nyreeza went looking for the site itself. She believes Qilvayas risks repeating his ancestor\u2019s exact error."));

c.push(H2("Session 1\u20132 NPCs (the Ostmark and the Road)"));
c.push(table(
  ["Name", "Location", "Notes"],
  [22, 20, 58],
  [
    ["Magistrate Cassivar Ondrei", "Dravenna, the Ostmark", "Precise, tired, provincial-honest. Renewable ally; his complaint re: the Third Legion colonel is now sitting with Thorne."],
    ["Yanna", "Dravenna / the road", "Teamster survivor. Recurring contact if treated kindly; hears things on the roads."],
    ["Sergeant Varkos Dren (deceased)", "Redwatch", "Session 1 antagonist \u2014 Oathbreaker deserter. His defaced, permanently cold medallion is now a party item."],
    ["Sgt. Petra Malich", "Varn\u2019s Crossing checkpoint", "Underpaid, privately ashamed of the illegal toll. Good soldier, bad arrangement."],
    ["Semya of Halvenne", "The road / Farrowgate or Dravenna", "Refugee matriarch; delivered the \u201Cindrawn breath\u201D omen. Her people\u2019s fate tracks the party\u2019s choice to help or not."],
    ["Odric Hale", "The road / Rivergate", "Racketeer with a dead Roads Commission seal. Thread points to a Rivergate seal-dealer."]
  ]
));

// ============ MYTHOLOGY ============
c.push(H2("The Powers of the Fractured Empire"));
c.push(table(
  ["Name", "Realm / Key", "Notes"],
  [22, 20, 58],
  [
    ["Sea-King Aldrec the Landless", "Skellvard \u2014 Alaric I", "Served the empire, betrayed at the Weeping Strait, refused a march four times. Wants IN. Dying slowly; the window closes with him. Tally-stick raids-as-collections."],
    ["Marshal Gavric Dane", "Ostmark \u2014 Germanicus", "\u201CThe Young Wolf.\u201D Recovered the Ninth\u2019s standard. Beloved, ambitionless, watched by everyone. DM: the Piso gun \u2014 if he dies suddenly, the empire tears itself apart. Never broken an oath."],
    ["Ban Dregan Morn", "Tarnovar Eastmarch \u2014 Vlad III", "Ex-academy hostage. The Fence: impaled oath-breakers; safest roads in the west. DM: closest of anyone to guessing the shadow\u2019s nature from first principles."],
    ["Duchess Emerenn Vasq", "Suthmark \u2014 Catherine de\u2019 Medici", "Velmareth Meldane by birth. Rules through sons + the Garland (informant web). Vintage Night truth (canon): a limited arrest that cascaded; she chose to own it. Waiting for the Ory accusation to become profitable."],
    ["Countess Velsanna Ory", "Greywell, Suthmark \u2014 E. B\u00e1thory", "GENUINELY MONSTROUS (canon ruling): blood-rite youth, 40+ girls over two decades. NOT shadow-connected \u2014 pure gothic horror. The crown owes her money; power will move for the debt, not the dead."],
    ["Saint-Regent Olvesa the Reconciled", "See of Orlath \u2014 Olga of Kiev", "Four vengeances, then sainthood. Founder of the See. DM: her visions are TRUE and darkened 3 yrs ago \u2014 that\u2019s why the coronation is now. Karvel\u2019s grandmother."],
    ["King Karvel", "Ardven \u2014 Charlemagne", "Unified twelve northern crowns; monastery schools; a restoration that works. Coronation as Emperor of the True Rite pending within the year \u2014 privately ambivalent about it."],
    ["Duke Garvin Norr", "Normere \u2014 William the Conqueror", "The Bastard. Reckoning Book + personal oaths + the Harrowing. Absorbing the Brekelands. DM: largest concentration of kept oaths alive \u2014 a single great betrayal by him would feed the shadow beyond anything since the fracture."]
  ]
));

c.push(H2("Sessions 5\u20136 NPCs (the Capital Threads)"));
c.push(table(
  ["Name", "Location / Role", "Notes"],
  [22, 20, 58],
  [
    ["Clerk Ossian Pell", "Highcourt (Kessin\u2019s office)", "Gray, forgettable, the party\u2019s barometer for Kessin\u2019s regard. Carried the first commission."],
    ["Tirell Mosse", "Rivergate \u2014 Defunct & Antiquarian", "Dealer in dead-office seals; mourns abolished institutions. Cultivated = document-underworld door; burned = door closed."],
    ["Brune Halloc", "Rivergate docks \u2014 Inkhands boss", "Violence as customer-service failure. Arrangement = friendly docks."],
    ["The Widow Brakka", "Coppergate \u2014 company landlady", "Feeds everyone, fears nothing, beat a mimic in negotiation. Load-bearing texture; protect at all costs."],
    ["Censor-Captain Ferrin Odo", "The Sanctum \u2014 Office of Omens", "Church soldier executing the Writ; nonlethal always; winnable by lawful conduct."],
    ["Ilinca Verath", "Tarnovari envoy singer (optional)", "Performs the Vosthren lament without knowing its truth. Friendly face of the future Tarnovar arc."],
    ["Professor Emeritus Pontellus Vorn", "Roads / capital (optional, comic)", "Expelled from three academies \u201Cfor excessive rigor.\u201D Wrong about everything except one thing per appearance."]
  ]
));

c.push(H1("Titles and Precedence at a Glance"));
c.push(P("Five ladders, not one. The empire keeps no single order of precedence \u2014 a Voivode and a Duke head different kinds of thing, not two rungs of one scale."));
c.push(table(["Ladder", "Top to bottom", "Note"], [18, 46, 36], [
  ["Throne & Court", "Emperor \u2192 Lord Chamberlain \u2192 Archjurist \u2192 Mistress/Master of a bureau \u2192 Magistrate", "Precedence here is by ACCESS, not rank. Kessin commands nothing and outweighs almost everyone."],
  ["Legions", "Legate \u2192 Colonel \u2192 Centurion \u2192 Sergeant \u2192 Legionary", "Book Six. Marshal is an acclamation outside the ladder; Captain is a courtesy for irregulars."],
  ["Church", "Matriarch + Synod of the Grey (collegial) | Prelate | Hierophant", "NO supreme authority, by design. A Prelate holds his writ from the Synod \u2014 Odell is Corvane\u2019s colleague, not her subordinate. There is no head to appeal over."],
  ["Academy", "Chancellor \u2192 Professor \u2192 Instructor; Archivist alongside", "Professor Emeritus is kept for life regardless of how the post ended (see Vorn)."],
  ["Sovereign / Border", "King, Sea-King, Voivode, Ban, Duke/Duchess, Count/Countess, Lord, Harborlord, Guildmaster, Saint-Regent", "These do not rank against each other at all. See below."]
]));
c.push(BUL("The distinction that matters:", "Norr\u2019s ducal title is IMPERIAL \u2014 granted by the Throne, making him on paper the Emperor\u2019s own subject running a rival restoration inside imperial law. Morn\u2019s Voivodate is FOREIGN and owes Aenodira nothing. A Voivode who defies the Throne is a neighbor; a Duke who does it is a precedent."));
c.push(BUL("When ladders collide:", "Court = by access. Provinces = by force. Shrine = by rite. What happens when those disagree is deliberately unwritten \u2014 rule situationally and stay consistent."));
c.push(BUL("Address:", "Emperor = Your Radiance / Majesty. King, Voivode, Sea-King, Duke, Duchess, Ban = Your Grace. Count, Countess, Lord = my lord / my lady. Matriarch = Your Voice. Prelate, Hierophant = Your Reverence. Olvesa = Mother (nothing grander, at her insistence). Legate, Marshal = the rank, plainly. Magistrate = Your Honor. Faculty = Professor / Instructor."));
c.push(PS([DM("DM Only: "), { t: "Saint-Regent is the one title with teeth in it. The See holds the Lupine Throne vacant, which leaves a seat someone must keep \u2014 Olvesa has kept it sixty years. Karvel\u2019s coronation therefore ENDS her regency, purpose discharged. Play her as completing her life\u2019s work, not grasping at a new one." }]));


c.push(H1("Magic & Faith at a Glance"));
c.push(BUL("The Weight of the Word:", "Sworn words have literal metaphysical weight \u2014 the setting\u2019s signature. No mechanics; pure adjudicated flavor. Oath-breaking at scale scars ground (thin-written places: wards fail, divination sours, cold holds)."));
c.push(BUL("The Sanction:", "The Church licenses divine practice (pewter warrant-medals); the Matron answers everyone sincere regardless. Orlath runs a rival sanction. Unsanctioned healers = Office of Omens business."));
c.push(BUL("Chartered Thaumaturgy:", "Arcane magic is credentialed and bureaucratic; hedge-mages tolerated till trouble; Rivergate sells unlicensed scrollwork. Sorcerers (\u2018the Kindled\u2019) suspect; warlocks (\u2018the Sworn\u2019) theologically radioactive \u2014 a pact is an oath that answered."));
c.push(BUL("Night iconography:", "The She-Wolf of the Night Sky \u2014 moon her eye, stars her pack, liturgies sung at night. The coronation prayer is theologically literal."));
c.push(BUL("Lycanthropy:", "Doctrine: profanation, hunted (wolf-trials). Folk belief: sometimes her mark. The gothic engine between the two is deliberate."));
c.push(BUL("Wildshape:", "Doctrine-clean \u2014 no wolf-trial jurisdiction; willed shape isn\u2019t profanation. Office of Omens keeps a quiet interest-file on frequent/public shapeshifters anyway: leverage without threat, not persecution."));
c.push(BUL("Wolf-Price:", "Self-defense = valid legal defense (report to a magistrate within 3 days, produce the body). Separate older custom: a debt to the local shrine-keeper regardless of guilt \u2014 reputation/plot hook, not legal jeopardy. Unpaid = worse than a magistrate\u2019s file, especially off the Crownlands."));
c.push(BUL("Companions:", "Befriended wolf = the Matron\u2019s visible favor (social standing + Office interest); Beast Master ranger w/ wolf = the permanent version (touched in the provinces, on file in the capital); druids get wildshape instead, per doctrine. Caged/collared wolf = profanation-scandal. DM: wolves refuse thin-written ground \u2014 a companion wolf is a living Wardstone, and none will enter the Old Forum district."));
c.push(BUL("Funerary custom:", "Universal night Vigil before disposal (doctrine-locked, every region \u2014 the Matron watches the dead home at night). After varies hard: Aenodira Bone Galleries (upper levels public; deep levels closed \u2018for consolidation\u2019 generations ago \u2014 keeps funerals clear of the Session 6 route), Suthmark harvest-calendar burial, Tarnovar oath-inheritance over body-burial, Velmareth reed-sea barges. Any ordinary town: a Vigil Hall, whose keepers are the best-informed people in town."));
c.push(BUL("Item economy:", "Arcana scarce/chartered; relics & blessed items flow through the faith (stamped potions 50 gp at almonries; false-relic trade in Rivergate). Wolves sacred everywhere; DM: Aenodira\u2019s wolves have been leaving the Old Forum for 3 years."));

c.push(H1("Peoples \u2014 Quick Reference"));
c.push(BUL("Drow \u2014 the Founder\u2019s Blood:", "Zhuvedus AND Threnvos both Drow (canon). Dynasty = his line, nearly alone. Any other Drow = enormous statement. OPEN: does Threnvos\u2019s line survive? (Do not spend early.)"));
c.push(BUL("Placement:", "Dwarves: Tarnovar (Stonesworn, ~1/3), Suthmark hills, capital masons. Wood elves: Old Wood + Ardven wilds. Half-orcs: Ostmark legion stock. Halflings: river trade/Coppergate. Gnomes: the Craft. Tieflings: the Marked (covenant-scarred lines). Dragonborn: Sarkanni mercenary lodges (contract-perfect, remarked upon)."));
c.push(BUL("Roster race calls:", "Vell hill dwarf; Mosse rock gnome; Halloc half-orc; Brakka dwarf; Vhal half-elf; Sorral half-elf (canon); Nyreeza Drow wizard. All Powers human; dynasty alone Drow."));

c.push(H1("Dragons of the Fractured Age"));
c.push(table(["Dragon","Where","The Short Version"],[20,18,62],[
 ["Vessarkath the Patient","Silvasse Weald","Ancient green; TRUE author of the Silvasse Disaster; sleeps on the lost eagles; let Dane\u2019s standard leave \u2014 why now settled (DM): she felt the Acceleration. Receives; never treats."],
 ["The Saltmaw","Weeping Strait","Dragon turtle; the Skell pay the salt-tithe. Adopted option: it is what the admiral\u2019s squadrons fled \u2014 Aldrec\u2019s people were spent as distraction."],
 ["The Fjell Whites","Ardven ranges","Young white brood, ranger-culled; adult matriarch unconfirmed \u2014 the north\u2019s quiet dread and a ready escalation near the coronation."]
]));

c.push(H1("Homebrew Items of Record"));
c.push(BUL("Dren\u2019s Oath-Medallion (uncommon, unique):", "Cold near oath-breaking, shadow-residue, thin-written ground. Quieter with oath-keepers."));
c.push(BUL("Oathstone Charm (common, Kamenhold 5 gp):", "1/day advantage on one Insight vs. a sworn statement."));
c.push(BUL("Pilgrim\u2019s Wolfstone (common, Lupenna):", "Wolves/dogs neutral; true north on clear nights. ~1 in 40 \u2019live\u2019; the Church insists otherwise."));
c.push(BUL("Wardstone Shard (common, unique source):", "Dim wolf-grey light 10 ft; gutters within 30 ft of Undercourt cold."));
c.push(BUL("The Lector\u2019s Seal (rare, unique):", "Company stamp; academy-archive documents sealed with it read as authorized; unforgeable; every use logged in the deep stacks."));

c.push(H1("Social Foundations at a Glance"));
c.push(BUL("The Packlaw:", "Church doctrine \u2014 the Matron leads by wisdom, not strength; authority runs through mothers as often as sires. Explains why nearly every SETTLED seat of power (Nyreeza, Vasq, Morn, Corvane, Olvesa, Thorne, Shen) is female, while still-climbing/unsettled power (Norr, Karvel, Aldrec, Dane, Dregan) skews male. Bars no man from rule \u2014 Qilvayas sits the throne. His own unnamed heir is a quiet loose thread, deliberately unresolved."));
c.push(BUL("Bound labor (4 tiers):", "(1) Chattel slavery: ILLEGAL + blasphemous empire-wide, tied to oath-magic (can\u2019t own what can swear). (2) Oath-bound service: legal (Norr\u2019s whole system). (3) Debt-bondage/indenture: legal, time-limited. (4) Hostage-diplomacy (incl. Academy admissions): separate category, NOT bondage, full legal personhood retained. Real crisis = enforcement gap in the Brekelands, not the law itself."));
c.push(BUL("Marriage & the Denmother\u2019s Choice:", "Marriage = real oath (Church witness / Tarnovari standing stones); unrepaired infidelity/abandonment = a small echo of Zhuvedus\u2019s crime. Divorce = a formal Release (counter-oath), not just separation. Titled succession is NAMED, not automatic-eldest \u2014 revisable, doesn\u2019t require blood. Makes Vasq\u2019s Aldous/Tavian succession a genuinely open question. Tarnovar: title follows whoever takes up the stone. Suthmark: inheritance settles at Fallowmonth\u2019s turn."));
c.push(BUL("The Marked\u2019s Legal Status:", "Feared/filed in Church lands, informally tolerated in Rivergate, full legal standing ONLY in Velmareth. Book One\u2019s one unresolved clause \u2014 deliberately LIVE, not closed. See Branch Ledger."));
c.push(BUL("Currency \u2014 the Zhuven:", "Formal name for the standard gold coin (Zhuvedus obverse, She-Wolf reverse); everyone actually says \u201Cwolf\u201D in Common. Silver strand, copper mote below it \u2014 inconsistent minting. Table pricing stays gp/sp/cp; Zhuven/strand/mote are just what the coins are called and look like in hand. Velmareth weighs rather than reads it; Norr restrikes captured coin with his own seal over the wolf; Tarnovar takes it same as anyone but trusts it less than a sworn word."));
c.push(BUL("Language and Literacy:", "Old Imperial (dead as a native tongue, purely administrative/liturgical) vs. Common (universal vernacular). Literacy tracks education/office, not province \u2014 the party is a fluent, literate elite moving through a mostly unlettered world. Ardven\u2019s subsidized literacy = ideological contrast; Tarnovar inverts the hierarchy (a spoken, witnessed oath outranks writing). Sharpened by the law pass: Books One\u2013Four run on witness/mark/register, so the unlettered are exposed exactly where the Laws should protect them. Marked mapping: deliberately deferred to its own pass."));
c.push(BUL("Medicine and Disease:", "Three certified tiers under Book Three (Sanction/divine, Charter/arcane, Crown-guild/mundane physicians) cover almost nobody \u2014 most of the empire relies on uncertified folk care (herbwife, bonesetter, midwife), same tolerance-tier as hedge-magic. Farrowgate\u2019s overcrowding breeds a chronic lung-ailment, the Damp \u2014 mundane, NOT shadow-connected (same ruling as Greywell). Church magic cures an active case instantly; it doesn\u2019t fix a drainage ditch. Rivergate sells patent quackery under forged Sanction marks."));
c.push(BUL("The Imperial Calendar:", "12 months, year begins Wolfmoon (Matron\u2019s month) \u2014 Thawtide, Sowmonth, Greening, Solacre, Haymonth, Harvestide (Vintage Night fell here), Vinmoon, Fallowmonth, Greywane, Longdark (Matron\u2019s 2nd month), Threshold (20-day year-end). Loyalists count Years of the Reckoning (YR) from the Founding; Orlath keeps a quiet second dating from the Reconciliation; Tarnovar counts by Voivodes\u2019 reigns."));

c.push(H1("The Zhuvedian Laws \u2014 Quick Reference"));
c.push(PS([{ t: "Archjurist Vhal\u2019s Law Commission; promulgated together this coming Solacre on the Long Course. Seven Books:", i: true }]));
c.push(BUL("Book One \u2014 Of Persons:", "Bound labor unchanged (see above) + NEW: an oath-bound service/indenture must be witnessed and recorded to be enforceable. Unwitnessed = not illegal, just unenforceable. Marked personhood generalized beyond Velmareth: LIVE Branch Ledger thread \u2014 see Branch Ledger and Items/Threads."));
c.push(BUL("Book Two \u2014 Of Oaths and the Witness:", "States outright: an oath binds at law only if sworn before a recognized witness. Perjury = a distinct offense from lying, tried where the oath was sworn, penalized as a mark on the liar\u2019s own signet-record (Book Four), not a fine."));
c.push(BUL("Book Three \u2014 Of the Sanction and the Charter:", "Certification = mark + register, always both. Church (Sanction), Charter (House of the Craft), Crown/guilds (mundane trade) each keep their own register. Unstamped/unlicensed = not itself a crime; shifts the burden to produce the register entry on challenge."));
c.push(BUL("Book Four \u2014 Of Seals and Record:", "Forgery of an imperial instrument (seal/signet/writ/charter) = restitution + indenture, scaling to exile on repeat. A retired office must surrender its seal to the Archive before its authority lapses \u2014 how Mosse\u2019s trade is legitimate."));
c.push(BUL("Book Five \u2014 Of the Wolf:", "Formalizes the existing Wolf-Price statute (see Magic & Faith, above) as statute. No new content."));
c.push(BUL("Book Six \u2014 Of the March:", "Rank ladder: Legionary \u2192 Sergeant (~10) \u2192 Centurion (~80\u2013100, NEW) \u2192 Colonel (a garrison/legion) \u2192 Legate (multi-legion / capital force). Censor / Censor-Captain leads Office Examiners. MARSHAL IS NOT A RANK \u2014 it\u2019s a Throne acclamation for personal renown, independent of command size (why Dane outranks Thorne in title but not in actual command). Officer misconduct = court-martial at Legate level, appealable once to Aenodira."));
c.push(BUL("Book Seven \u2014 Of Judgment:", "No separate civilian watch \u2014 garrisons (Palatine Guard in Aenodira) double as the peace. Magistrates (Ondrei\u2019s model) are judge + civil administrator, no jury. Appeal to Aenodira exists but is slow. Secular process and the Church\u2019s Writ run in parallel and can conflict; a political favor can quash a writ as obstruction, but only as an exception. No magistrate, no appeal in warlord territory \u2014 the warlord\u2019s word is final."));

c.push(H1("Core Mythology at a Glance (DM Only)"));
c.push(BUL("Zhuvedus:", "Empire\u2019s founder. Was a paladin, Oath of Devotion (canon). Broke a sworn covenant with his rival Threnvos, killing him under the Matron\u2019s own witness, and fell to Oathbreaker in the same act \u2014 the power that let him found the empire alone."));
c.push(BUL("The Lupine Matron:", "The chief goddess, ancient, predates Zhuvedus and has guided many champions across history. Zhuvedus was simply the most successful. His own divinity is genuinely contested (three competing doctrines \u2014 see sourcebook)."));
c.push(BUL("Threnvos:", "Zhuvedus\u2019s rival and co-claimant, betrayed and destroyed. His people survive today as Tarnovar; \u201CVosthren\u201D in their ballads is his name, syllable-inverted by drift."));
c.push(BUL("The Shadow:", "Threnvos\u2019s dying essence fused with the impersonal force unleashed by the broken oath \u2014 personal grievance and impersonal hunger, born together. Fed since by every broken oath in the empire\u2019s 200-year fracture. NEVER state this to players; seed only in fragments."));
c.push(BUL("The Binding Site:", "CONFIRMED CANON: beneath the Old Forum, in the Undercourt\u2019s deepest reach, touching the Academy\u2019s Undervault. Sessions 5\u20136 carry the party to the Second Seal at its threshold. Full site design beyond the Seal still pending."));
c.push(BUL("Empress Nyreeza:", "Disappeared 3 years ago (timeline fixed). Working theory: she was investigating the true founding account and found the binding site, or evidence of it. Her cipher marks appear in the Undervault (Cold Door) and the wider Undercourt. Exact fate: still open by design."));
c.push(BUL("The Proving:", "Real academy tradition \u2014 a staged final exam mistaken for reality by the cohort undergoing it. Subject of Sessions 3\u20134. Players must never hear the word before it happens."));

// ============ TIMELINE ============
c.push(H1("Timeline at a Glance"));
c.push(P("DM-only anchor (computational baseline; the in-world Reckoning figure stays soft and never appears player-facing): present day \u2248 YR 2000, the founding at YR 0 \u2014 so every \u2019~N years ago\u2019 resolves to YR (2000 \u2212 N)."));
c.push(table(
  ["When", "Event"],
  [22, 78],
  [
    ["~2,000 yrs ago", "The founding. Zhuvedus breaks the oath, destroys Threnvos. Binding site sealed. Threnvos\u2019s people scatter west \u2192 Tarnovar."],
    ["~200 yrs ago", "The fracture begins; two centuries of provinces peeling away, feeding the shadow."],
    ["Across the 2 centuries", "The Lupine Throne turns over faster than a Drow line should \u2014 fever, faction, twice to child-heirs and their regents; the court names a cause for each and never counts them. Nyreeza (own right, no regent) is the first steadiness in generations. DM: The Throne\u2019s Short Reigns."],
    ["~60 yrs ago", "The Silvasse Disaster: three legions and their standards lost in the west."],
    ["~60\u201358 yrs ago", "Olvesa\u2019s lord murdered; her four vengeances; her conversion; the See of Orlath founding itself around her (~58)."],
    ["~50 yrs ago", "Vaelindra\u2019s career-ending vision; quiet removal from the Church."],
    ["~40 yrs ago", "Dregan Morn arrives at the academy as a Tarnovari hostage-student; stays past his studies, returns home a decade later."],
    ["~20 yrs ago", "The Weeping Strait (Aldrec\u2019s betrayal). Norr takes Normere in fact."],
    ["~15 yrs ago", "Karvel begins unifying Ardven; the Skell clans lose their fjords and turn south."],
    ["~12 yrs ago", "Nyreeza begins the academy revival and institutional reforms."],
    ["11 yrs ago", "Vell\u2019s last referral to Vaelindra \u2014 ended badly; hasn\u2019t presumed on her since."],
    ["6 yrs ago", "The Vintage Night (Suthmark massacre of Orlathines; Vasq owns it)."],
    ["4 yrs ago", "The Harrowing of the Weld (Norr ends a rebellion, and a district)."],
    ["3 yrs ago", "Nyreeza\u2019s final meeting with Vaelindra; disappearance. Visions accelerate \u2014 Vaelindra\u2019s AND Olvesa\u2019s (which sets the coronation moving)."],
    ["~3 yrs ago (DM)", "Vessarkath lets one wolf-standard leave her hoard \u2014 she felt the stir under the capital; the Ninth\u2019s eagle starts its slow way home via the Brekelands."],
    ["~2.5 yrs ago", "Qilvayas\u2019s coronation; restoration begins in earnest."],
    ["~1 yr ago", "Marshal Dane recovers the Ninth\u2019s standard, nearly 60 yrs after Silvasse. The Ostmark\u2019s wound starts to close; the empire gets its Young Wolf."],
    ["This Solacre (~9 mo)", "TWO CLOCKS, ONE SEASON: Zhuvedian Laws promulgation (Aenodira) + Karvel\u2019s coronation as Emperor of the True Rite (Orlath)."],
    ["Present day", "Party\u2019s field exercise \u2192 vision \u2192 return to Aenodira \u2192 the Proving."]
  ]
));

// ============ ITEMS & THREADS ============
c.push(H1("Items and Threads Currently in Play"));
c.push(BUL("Dren\u2019s oath-medallion:", "Defaced, permanently cold, non-detectable as magical. First physical artifact of the truth. (Session 1)"));
c.push(BUL("The Cold Door rubbing:", "Charcoal rubbing of cipher marks at the Undervault\u2019s sealed door \u2014 now the only copy in existence; the wing was re-sealed after. (Sessions 3\u20134)"));
c.push(BUL("The Lector\u2019s Seal housing:", "Gifted to the party as their mercenary company\u2019s official sealing-stamp. (Sessions 3\u20134)"));
c.push(BUL("Forty witnesses (Halvenne):", "If resettled in Dravenna, a standing, grateful contact network. If not, they surface later in Farrowgate. (Session 2)"));
c.push(BUL("Ondrei\u2019s complaint vs. the Third Legion colonel:", "Currently sitting in Legate Thorne\u2019s inbox \u2014 background thread, can be developed or left as texture."));
c.push(BUL("Solacre Day:", "The promulgation, the Marked ruling, the Grey-Gold Rising, and word of Karvel\u2019s coronation all converge on one day, not just one season. See The Coronation Clock and The Grey-Gold Rising, below."));
c.push(BUL("The Coronation Clock:", "Karvel\u2019s crowning in Orlath, landing the same day as the Laws\u2019 promulgation \u2014 not merely the same year. The campaign\u2019s second structural clock."));
c.push(BUL("The Landless King\u2019s Fifth Petition:", "Aldrec\u2019s final overture to the throne \u2014 a closing window tied to his failing health."));
c.push(BUL("The Girls of Greywell:", "A Farrowgate family\u2019s missing daughter \u2192 Castle Greywell. Pure gothic horror, deliberately non-shadow."));
c.push(BUL("The Grey-Gold Rising:", "Trigger reconciled: Book Three\u2019s registration requirement, extended over Long Course commerce \u2014 not a new tax. Golds (inner-wall patron money) and Greys (outer-wall trade) unite against enforcement that lands hardest on the Greys. Qilvayas\u2019s Nika moment. Mercy-or-massacre outcome LIVE, tracked on the Branch Ledger like Marked personhood \u2014 see Branch Ledger."));
c.push(BUL("The Book and the Fence:", "Norr\u2019s surveyors approaching Dregan\u2019s stakes \u2014 the west\u2019s coming collision."));
c.push(BUL("The Shen Alliance:", "Formed, discounted, or refused in Sessions 5\u20136 \u2014 defines the party\u2019s intelligence landscape. Shen holds Nyreeza\u2019s final filing; the party holds the rubbing; Vell holds the key."));
c.push(BUL("The Empress\u2019s Last Words:", "Translated in Session 6: \u201Cthe wound predates the Wall. The Tablets were written over it. He must not follow me. Tell him the garden, not the grave.\u201D The last line keys the sealed dispatch case."));
c.push(BUL("The Writ\u2019s Aftermath:", "Vaelindra\u2019s status post-Session 6 (free/hidden/custody per branch) and every favor owed or spent to get there."));
c.push(BUL("Marked Personhood \u2014 the Live Clause:", "Vhal\u2019s Commission hasn\u2019t settled Book One\u2019s treatment of the Marked; Velmareth\u2019s standing exception is the model on the table. Whatever the party brings to bear before the Solacre promulgation can tip the final language. If they never engage it, the Commission settles it without them."));
c.push(BUL("The Second Seal:", "Reached, not opened, end of Session 6. The word FORGIVE. The campaign\u2019s fixed landmark going forward."));

c.push(H1("The Undercourt Revelations (DM Only \u2014 Sessions 7\u20138)"));
c.push(BUL("Un-witnessing:", "Oaths bind because they are WITNESSED. The founding assembly turned away in unison \u2014 that unbinding is what made the betrayal possible. The shadow feeds on broken oaths AND the silence around them. Every institutional look-away is the same act."));
c.push(BUL("The Vigil = the counter-rite:", "Witnessing starves it. The Vigil (watched, lit, never alone) is PENANCE, instituted by the witnesses\u2019 descendants \u2014 which is why it survives every schism unchanged. The party performed it correctly at Redwatch without being told."));
c.push(BUL("The Golden Tablets:", "Composed BY the witnesses \u2014 the self-exoneration document of the people who looked away. \u201CThe Tablets were written over it.\u201D The law was the cover-up, written first."));
c.push(BUL("Qilvayas\u2019s Laws = the weapon:", "A code making oaths enforceable, witnessed, and recorded is literal starvation for the entity. He built it by instinct, unknowing. The Daily Draw is the Emperor personally witnessing one citizen a day."));
c.push(BUL("The Scouring \u2014 Emperor Vaskaren the Restorer (~200 yrs ago):", "Sought why the empire was failing, found the Hall, erased it. Second crime = same crime (un-witnessing by the founding\u2019s own family). His restoration failed; Qilvayas is the second restorer of that line. His order survives in the dynastic archive \u2014 how Nyreeza found the way down, and what waits in her sealed dispatch case."));
c.push(BUL("The surviving frieze:", "Two spans missed on the eastern gallery\u2019s top tier. Identifiable faces + house-sigils; several of those houses sit at court today. The rubbing is a political bomb \u2014 publishing delegitimizes the throne, arms Orlath, vindicates Tarnovar, breaks the Church. Keeping quiet makes the party the newest witnesses to turn away."));
c.push(BUL("Threnvos:", "Never received a Vigil. Present on the Rite Floor, speaks ONLY his half of the covenant \u2014 cannot answer questions, is not exposition. No stat block by design. Laying him to rest SEPARATES grief from hunger: real victory, not the victory."));
c.push(BUL("What remains:", "The impersonal hunger \u2014 doesn\u2019t grieve, doesn\u2019t remember, can\u2019t be reasoned with (that part is now at rest). Fed by every broken word and averted eye. Campaign pivots from dungeon problem to civilization problem."));
c.push(BUL("The Matron:", "May be down there keeping the vigil nobody else would. Divine magic works; clerics receive. NEVER a form, voice, or confirmation. Ambiguity is permanent and deliberate."));

c.push(H1("Branch Ledger \u2014 Record the Party\u2019s Divergences"));
c.push(P("Every session module now carries a Diverging Paths section. Track outcomes here as they resolve; Sessions Seven and beyond are built against this ledger."));
c.push(table(
  ["Divergence", "Session", "Outcome at Your Table / Effects"],
  [30, 12, 58],
  [
    ["Deserters spared vs. killed (Dessen case strength)", "1", ""],
    ["Parley vs. assault reputation", "1", ""],
    ["Medallion carried, and by whom", "1", ""],
    ["Semya\u2019s people: Dravenna vs. Farrowgate", "2", ""],
    ["Malich respected vs. Ostrev\u2019s enmity", "2", ""],
    ["Odric escorted vs. released (Mosse lead)", "2", ""],
    ["Vision in the official report?", "2", ""],
    ["Bloodless vs. bloody Proving (Highcourt read)", "3\u20134", ""],
    ["Hound(s) freed / company animal", "3\u20134", ""],
    ["Cold Door: what Sorral was told; rubbing shown?", "3\u20134", ""],
    ["Kessin report: truth / cover / silence", "5", ""],
    ["Odell interview: clean / attributed / registered / defied", "5", ""],
    ["Mosse cultivated vs. burned; Inkhands arrangement", "5", ""],
    ["Farrowgate client taken? (Greywell arc posture)", "5", ""],
    ["The Writ: A law / B politics / C vanishing / D surrender / violence", "6", ""],
    ["Translation shared with Shen: full / partial / none", "6", ""],
    ["Throne told anything? (MAJOR GATE)", "6", ""],
    ["Seal forced (\u201Cthe Seal has heard them\u201D)?", "6", ""],
    ["Envoy engaged (Tarnovar warmth)?", "6", ""],
    ["The Seal-oath \u2014 who swore it, and the exact words", "7", ""],
    ["Memory pressure \u2014 each character\u2019s unkept promise", "7", ""],
    ["The Turned \u2014 witnessed vs. destroyed", "7", ""],
    ["The frieze rubbing \u2014 taken or left; who argued", "7", ""],
    ["The Vigil \u2014 kept / broken / refused", "8", ""],
    ["Watch Three \u2014 who took the offer", "8", ""],
    ["The covenant\u2019s second half \u2014 the players\u2019 words, verbatim", "8", ""],
    ["WHO THEY TOLD (largest branch in the campaign)", "8", ""],
    ["Marked personhood \u2014 Book One\u2019s final language", "TBD (Twin Clocks)", ""],
    ["The Grey-Gold Rising \u2014 mercy or massacre", "TBD (Twin Clocks)", ""]
  ]
));

// ============ OPEN PLACEHOLDERS ============
c.push(H1("Deliberately Open \u2014 By Design (Not Gaps)"));
c.push(BUL(null, "Nyreeza\u2019s exact fate \u2014 dead, transformed, or trapped: to be discovered through play. (The word FORGIVE at the Second Seal is her last known mark.)"));
c.push(BUL(null, "Countess Ory\u2019s blood-rite mechanism \u2014 decide when the Greywell module is built (hag-bargain / fiendish compact / inherited rite)."));
c.push(BUL(null, "The coronation\u2019s metaphysical consequence \u2014 a founding covenant sworn while the shadow listens: design when the arc approaches."));
c.push(BUL(null, "The Piso gun \u2014 whether Marshal Dane\u2019s sudden death ever occurs is a standing DM option, never an obligation."));
c.push(BUL(null, "The throne\u2019s short reigns \u2014 the Lupine line cannot hold its throne; mundane on the surface (fever, faction, regency), any deeper cause open by design. Do not resolve at the table."));
c.push(BUL(null, "What lies past the Second Seal \u2014 the next major build (see Roadmap)."));

c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300, after: 100 }, children: [new TextRun({ text: "~", size: 24 })] }));
c.push(PS([{ t: "Update this guide whenever the sourcebook, session modules, or canon rulings change.", i: true }], { alignment: AlignmentType.CENTER }));

const doc = new Document({
  numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  styles: {
    default: { document: { run: { font: "Georgia", size: 20 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, font: "Georgia", color: "3B2F2F" }, paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: "Georgia", color: "3B2F2F" }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } }
    ]
  },
  sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children: c }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/claude/QS_DM_Reference_Guide.docx", buf);
  console.log("Written.");
});
