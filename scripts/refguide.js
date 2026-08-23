const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat,
        Table, TableRow, TableCell, WidthType, ShadingType } = require('docx');
const fs = require('fs');

const P = (text, opts = {}) => new Paragraph({ spacing: { after: 160 }, ...opts, children: [new TextRun({ text, ...(opts.run || {}) })] });
const PS = (segs, opts = {}) => new Paragraph({ spacing: { after: 160 }, ...opts, children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i })) });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const BULLET = (segs) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 100 }, children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i })) });
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
c.push(PS([{ t: "Living document \u2014 update alongside the sourcebook. Current through the imperial law pass (the Zhuvedian Laws, certification, jurisdiction, rank, and street justice) and the language and literacy pass. Sessions 0\u20138; the Undercourt descent is complete. ", i: true, b: true }], { alignment: AlignmentType.CENTER, spacing: { after: 300 } }));

// ============ ATLAS ============
c.push(H1("The Atlas \u2014 Regions at a Glance"));
c.push(table(
  ["Region", "Ruler / Power", "Disposition", "Key Notes"],
  [16, 18, 14, 52],
  [
    ["The Crownlands", "Direct imperial rule", "Loyal (core)", "Aenodira and its river valley; imperial law at full strength here only. INLAND \u2014 river trade via Rivergate, no ocean harbor (nearest salt water: Velmareth, 10 days downriver). Race-day factions: the Golds and the Greys."],
    ["The Ostmark", "Legion garrisons; Magistrate Cassivar Ondrei (Dravenna); Marshal Gavric Dane", "Loyal (towns) / inertial (country)", "Colonel Aurel Dessen's grain scandal ongoing. Dane recovered the Ninth's lost standard \u2014 the legions' darling, the court's worry."],
    ["The Suthmark", "Duchess Emerenn Vasq (n\u00e9e Meldane)", "Loyal, devout, scarred", "Feeds the capital. Carries the Vintage Night (6 yrs ago) and the Greywell disappearances."],
    ["Principality of Tarnovar", "Voivode Ysavet Morn; Ban Dregan Morn (Eastmarch)", "Independent (100 yrs)", "DM ONLY: descended from Threnvos's people. Oath-culture; \"Vosthren\" ballads. Dregan's Fence holds the Brekeland border. Do not spend early."],
    ["Velmareth / Delta Compact", "The Harborlords (incl. House Meldane)", "Neutral / disorder-preferring", "Merchant republic; Exchange delegations answer here. Meldane money reaches into the Suthmark."],
    ["The Brekelands", "Warlords Bettra Skarn & Ilmarch Voss (shrinking)", "Fractured / being absorbed", "Granary War produced the Halvenne refugees. Squeezed between Norr's Reckoning Book (west) and Dregan's Fence (east)."],
    ["The See of Orlath", "Saint-Regent Olvesa the Reconciled", "Schismatic \u2014 coronation pending", "Founded ~58 yrs ago by Olvesa. Preparing to crown Karvel Emperor of the True Rite this Solacre (~9 mo out)."],
    ["Kingdom of Ardven", "King Karvel", "Rival power (north)", "Twelve crowns unified in 15 yrs. Monastery schools, working restoration. Olvesa's grandson; coronation imminent."],
    ["The Skellvard", "Sea-King Aldrec the Landless", "Hostile \u2014 but persuadable", "Displaced ship-clans, pushed south by Ardven. Aldrec wants a march and a title; refused four times; dying slowly."],
    ["Duchy of Normere", "Duke Garvin Norr, the Bastard", "Rival power (west)", "Conquest + the Reckoning Book + personal oaths. Absorbing the Brekelands. Qilvayas's dark mirror. The Harrowing of the Weld, 4 yrs ago."]
  ]
));

c.push(H1("Imperial and Border Jurisdiction, at a Glance"));
c.push(table(
  ["Region", "Legal Status", "Who Enforces"],
  [22, 34, 44],
  [
    ["The Crownlands", "Direct Rule \u2014 imperial law at full strength", "Palatine Guard; imperial magistrates"],
    ["The Ostmark", "Loyalist Provincial \u2014 nominal, unevenly enforced", "Thin legion garrisons; Magistrate Ondrei's model"],
    ["The Suthmark", "Loyalist Provincial \u2014 genuinely loyal, ducal house", "Duchess Vasq's household authority + the Church"],
    ["Principality of Tarnovar", "Sovereign Treaty-Nation \u2014 imperial law N/A", "Oath-custom; the Voivode; Dregan's Fence (unsanctioned)"],
    ["Velmareth / Delta Compact", "Sovereign Treaty-Nation \u2014 own mercantile law; Marked hold legal standing here, uniquely", "The Harborlords; the Compact's own courts"],
    ["The Brekelands", "Contested / Warlord \u2014 statute unenforced", "Individual warlords; no appeal exists"],
    ["The See of Orlath", "Parallel Legal-Religious Authority", "Olvesa's See; its own rival Sanction"],
    ["Kingdom of Ardven", "Sovereign Treaty-Nation \u2014 independent crown", "King Karvel's own developing law"],
    ["The Skellvard", "Non-Territorial Customary Law", "Clan lawspeakers; tally-sticks record debts"],
    ["Duchy of Normere", "De Facto Replacement \u2014 claimed, superseded", "Norr's personal-oath system + the Reckoning Book"]
  ]
));
c.push(PS([{ t: "Marked (tiefling) personhood generalized beyond Velmareth's exception: still open \u2014 not resolved by this pass.", i: true }]));

c.push(H1("Aenodira \u2014 Districts at a Glance"));
c.push(table(
  ["District", "Ring", "What's There", "Key Figure"],
  [14, 12, 46, 28],
  [
    ["Highcourt", "Inner", "Lupine Throne, ministries, the Long Course", "Lord Chamberlain Vareth Kessin"],
    ["The Sanctum", "Inner", "Great Temple, Office of Omens, clergy", "Matriarch Ilsevet Corvane"],
    ["The Old Forum", "Inner", "Ruins, Zhuvedus monument, catacombs", "DM ONLY: confirmed site \u2014 the binding lies beneath (Undercourt)"],
    ["Coppergate", "Middle", "Vaelindra's apartment, Ninth Lane", "Vaelindra of the Still Waters"],
    ["Scholar's Row", "Middle", "The Academy, restricted archives", "Archivist Dathenor Vell"],
    ["The Exchange", "Middle", "Guildhalls, merchant delegations", "Guildmaster Ptolan Vess"],
    ["The Garrison", "Middle", "Barracks, Palatine Guard HQ", "Legate Bruvasca Thorne"],
    ["The Archwork", "Outer", "Housing built into a bricked-up aqueduct", "\u2014 working-class, unnamed"],
    ["Farrowgate", "Outer", "Refugee/displaced quarter", "\u2014 where Halvenne's people land if not resettled"],
    ["Rivergate", "Outer", "Docks, river trade, document underworld", "\u2014 Odric Hale's seal-dealer thread"]
  ]
));

// ============ NPCs ============
c.push(H1("Key NPCs by Circle"));

c.push(H2("The Imperial Court"));
c.push(table(
  ["Name", "Role", "Notes"],
  [22, 22, 56],
  [
    ["Emperor Qilvayas", "110-yr-old Drow Emperor", "Precise, quietly relentless, never raises his voice. Daily Draw of petitions. Has not entered his mother's study in 3 years. Sealed dispatch case in her cipher (canon \u2014 unopened; keyed by \"the garden, not the grave\")."],
    ["Lord Chamberlain Vareth Kessin", "Gatekeeper to the Emperor", "Career bureaucrat; served Nyreeza first. Opinion of Qilvayas vs. his mother never once stated."],
    ["Archjurist Senna Vhal", "Head, Law Commission", "Holds the pen on the Zhuvedian Laws. Battles Kessin over access, the provinces over every clause."],
    ["Legate Bruvasca Thorne", "Commander, Palatine Guard", "HISTORICAL KEY: Belisarius. The throne's one great commander (the Ashline, 800 vs. thousands). Beloved by the legions, mistrusted for it, never given the army she was made for. Husband Bram keeps the ledger of unkept promises. Holds Ondrei's complaint vs. Colonel Dessen."],
    ["Mistress Averil Shen", "Bureau of Correspondence (spymaster)", "Nyreeza's creature first. Only courtier who ran her own inquiry into the disappearance."],
    ["Hierophant Malzeth Corr", "Head, Keepers of the Ascent (imperial cult)", "Maintains the dynastic shrine at Highcourt; Qilvayas's relation to the cult is correct, not warm."]
  ]
));

c.push(H2("The Church"));
c.push(table(
  ["Name", "Role", "Notes"],
  [22, 22, 56],
  [
    ["Matriarch Ilsevet Corvane", "Voice of the Matron in Aenodira", "Church's public face, not necessarily its supreme authority. Institution first, truth second."],
    ["Prelate Sarvin Odell", "Head, Office of Omens", "ACTIVE ANTAGONIST (S5\u20136): surveillance, summons, then the Writ of Examination vs. Vaelindra. Beatable by law or politics, never by argument. The copyist below Vaelindra reports to him."]
  ]
));

c.push(H2("The Academy"));
c.push(table(
  ["Name", "Role", "Notes"],
  [22, 22, 56],
  [
    ["Archivist Dathenor Vell", "Keeper of restricted stacks", "Ancient, dry, volunteers nothing. Refers party to Vaelindra (Session 2). Knows why her Church career ended."],
    ["Magister Corvin Dail", "Master of Trials", "Designed the party's Proving. Praises by noting absence of error. Sat his own Proving 40 years ago."],
    ["Chancellor Emeth Sorral", "Head of the Academy", "Commencement-polish drops when surprised \u2014 the Cold Door does it. Knows the wards fail in the eastern stacks."],
    ["Instructor Liria Fenn", "House of the Craft (stagecraft)", "Plays \"Merla\" in the Proving. Warm and wicked once unmasked."]
  ]
));

c.push(H2("Vaelindra of the Still Waters \u2014 The Seeress"));
c.push(P("Elderly human, ex-Church functionary sidelined after a vision the Church couldn't tolerate. Lives above a copyist's shop, Coppergate, Ninth Lane. Reframes the shared vision as potential, not prophecy. DM ONLY: her career-ending vision showed fragments of the true founding \u2014 Zhuvedus, the broken oath, Threnvos. She and Nyreeza discussed this in their final meeting; she believes Nyreeza went looking for the site itself. She believes Qilvayas risks repeating his ancestor's exact error."));

c.push(H2("Session 1\u20132 NPCs (the Ostmark and the Road)"));
c.push(table(
  ["Name", "Location", "Notes"],
  [22, 20, 58],
  [
    ["Magistrate Cassivar Ondrei", "Dravenna, the Ostmark", "Precise, tired, provincial-honest. Renewable ally; his complaint re: the Third Legion colonel is now sitting with Thorne."],
    ["Yanna", "Dravenna / the road", "Teamster survivor. Recurring contact if treated kindly; hears things on the roads."],
    ["Sergeant Varkos Dren (deceased)", "Redwatch", "Session 1 antagonist \u2014 Oathbreaker deserter. His defaced, permanently cold medallion is now a party item."],
    ["Sgt. Petra Malich", "Varn's Crossing checkpoint", "Underpaid, privately ashamed of the illegal toll. Good soldier, bad arrangement."],
    ["Semya of Halvenne", "The road / Farrowgate or Dravenna", "Refugee matriarch; delivered the \"indrawn breath\" omen. Her people's fate tracks the party's choice to help or not."],
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
    ["Marshal Gavric Dane", "Ostmark \u2014 Germanicus", "\"The Young Wolf.\" Recovered the Ninth's standard. Beloved, ambitionless, watched by everyone. DM: the Piso gun \u2014 if he dies suddenly, the empire tears itself apart. Never broken an oath."],
    ["Ban Dregan Morn", "Tarnovar Eastmarch \u2014 Vlad III", "Ex-academy hostage. The Fence: impaled oath-breakers; safest roads in the west. DM: closest of anyone to guessing the shadow's nature from first principles."],
    ["Duchess Emerenn Vasq", "Suthmark \u2014 Catherine de' Medici", "Velmareth Meldane by birth. Rules through sons + the Garland (informant web). Vintage Night truth (canon): a limited arrest that cascaded; she chose to own it. Waiting for the Ory accusation to become profitable."],
    ["Countess Velsanna Ory", "Greywell, Suthmark \u2014 E. B\u00e1thory", "GENUINELY MONSTROUS (canon ruling): blood-rite youth, 40+ girls over two decades. NOT shadow-connected \u2014 pure gothic horror. The crown owes her money; power will move for the debt, not the dead."],
    ["Saint-Regent Olvesa the Reconciled", "See of Orlath \u2014 Olga of Kiev", "Four vengeances, then sainthood. Founder of the See. DM: her visions are TRUE and darkened 3 yrs ago \u2014 that's why the coronation is now. Karvel's grandmother."],
    ["King Karvel", "Ardven \u2014 Charlemagne", "Unified twelve northern crowns; monastery schools; a restoration that works. Coronation as Emperor of the True Rite pending within the year \u2014 privately ambivalent about it."],
    ["Duke Garvin Norr", "Normere \u2014 William the Conqueror", "The Bastard. Reckoning Book + personal oaths + the Harrowing. Absorbing the Brekelands. DM: largest concentration of kept oaths alive \u2014 a single great betrayal by him would feed the shadow beyond anything since the fracture."]
  ]
));

c.push(H2("Sessions 5\u20136 NPCs (the Capital Threads)"));
c.push(table(
  ["Name", "Location / Role", "Notes"],
  [22, 20, 58],
  [
    ["Clerk Ossian Pell", "Highcourt (Kessin's office)", "Gray, forgettable, the party's barometer for Kessin's regard. Carried the first commission."],
    ["Tirell Mosse", "Rivergate \u2014 Defunct & Antiquarian", "Dealer in dead-office seals; mourns abolished institutions. Cultivated = document-underworld door; burned = door closed."],
    ["Brune Halloc", "Rivergate docks \u2014 Inkhands boss", "Violence as customer-service failure. Arrangement = friendly docks."],
    ["The Widow Brakka", "Coppergate \u2014 company landlady", "Feeds everyone, fears nothing, beat a mimic in negotiation. Load-bearing texture; protect at all costs."],
    ["Censor-Captain Ferrin Odo", "The Sanctum \u2014 Office of Omens", "Church soldier executing the Writ; nonlethal always; winnable by lawful conduct."],
    ["Ilinca Verath", "Tarnovari envoy singer (optional)", "Performs the Vosthren lament without knowing its truth. Friendly face of the future Tarnovar arc."],
    ["Magister Emeritus Pontellus Vorn", "Roads / capital (optional, comic)", "Expelled from three academies \"for excessive rigor.\" Wrong about everything except one thing per appearance."]
  ]
));


c.push(H1("Magic & Faith at a Glance"));
c.push(BUL("The Weight of the Word:", "Sworn words have literal metaphysical weight \u2014 the setting's signature. No mechanics; pure adjudicated flavor. Oath-breaking at scale scars ground (thin-written places: wards fail, divination sours, cold holds)."));
c.push(BUL("The Sanction:", "The Church licenses divine practice (pewter warrant-medals); the Matron answers everyone sincere regardless. Orlath runs a rival sanction. Unsanctioned healers = Office of Omens business."));
c.push(BUL("Chartered Thaumaturgy:", "Arcane magic is credentialed and bureaucratic; hedge-mages tolerated till trouble; Rivergate sells unlicensed scrollwork. Sorcerers (\u2018the Kindled\u2019) suspect; warlocks (\u2018the Sworn\u2019) theologically radioactive \u2014 a pact is an oath that answered."));
c.push(BUL("Night iconography:", "The She-Wolf of the Night Sky \u2014 moon her eye, stars her pack, liturgies sung at night. The coronation prayer is theologically literal."));
c.push(BUL("Lycanthropy:", "Doctrine: profanation, hunted (wolf-trials). Folk belief: sometimes her mark. The gothic engine between the two is deliberate."));
c.push(BUL("Wildshape:", "Doctrine-clean \u2014 no wolf-trial jurisdiction; willed shape isn\u2019t profanation. Office of Omens keeps a quiet interest-file on frequent/public shapeshifters anyway: leverage without threat, not persecution."));
c.push(BUL("Wolf-Price:", "Self-defense = valid legal defense (report to a magistrate within 3 days, produce the body). Separate older custom: a debt to the local shrine-keeper regardless of guilt \u2014 reputation/plot hook, not legal jeopardy. Unpaid = worse than a magistrate\u2019s file, especially off the Crownlands."));
c.push(BUL("Companions:", "Befriended wolf = the Matron\u2019s visible favor (social standing + Office interest); Beast Master ranger w/ wolf = the permanent version (touched in the provinces, on file in the capital); druids get wildshape instead, per doctrine. Caged/collared wolf = profanation-scandal. DM: wolves refuse thin-written ground \u2014 a companion wolf is a living Wardstone, and none will enter the Old Forum district."));
c.push(BUL("Funerary custom:", "Universal night Vigil before disposal (doctrine-locked, every region \u2014 the Matron watches the dead home at night). After varies hard: Aenodira Bone Galleries (upper levels public; deep levels closed \u2018for consolidation\u2019 generations ago \u2014 keeps funerals clear of the Session 6 route), Suthmark harvest-calendar burial, Tarnovar oath-inheritance over body-burial, Velmareth reed-sea barges. Any ordinary town: a Vigil Hall, whose keepers are the best-informed people in town."));
c.push(BUL("Item economy:", "Arcana scarce/chartered; relics & blessed items flow through the faith (stamped potions 50 gp at almonries; false-relic trade in Rivergate). Wolves sacred everywhere; DM: Aenodira's wolves have been leaving the Old Forum for 3 years."));

c.push(H1("Peoples \u2014 Quick Reference"));
c.push(BUL("Drow \u2014 the Founder's Blood:", "Zhuvedus AND Threnvos both Drow (canon). Dynasty = his line, nearly alone. Any other Drow = enormous statement. OPEN: does Threnvos's line survive? (Do not spend early.)"));
c.push(BUL("Placement:", "Dwarves: Tarnovar (Stonesworn, ~1/3), Suthmark hills, capital masons. Wood elves: Old Wood + Ardven wilds. Half-orcs: Ostmark legion stock. Halflings: river trade/Coppergate. Gnomes: the Craft. Tieflings: the Marked (covenant-scarred lines). Dragonborn: Sarkanni mercenary lodges (contract-perfect, remarked upon)."));
c.push(BUL("Roster race calls:", "Vell hill dwarf; Mosse rock gnome; Halloc half-orc; Brakka dwarf; Vhal half-elf; Sorral half-elf (canon); Nyreeza Drow wizard. All Powers human; dynasty alone Drow."));

c.push(H1("Dragons of the Fractured Age"));
c.push(table(["Dragon","Where","The Short Version"],[20,18,62],[
 ["Vessarkath the Patient","Silvasse Weald","Ancient green; TRUE author of the Silvasse Disaster; sleeps on the lost eagles; let Dane's standard leave \u2014 why now settled (DM): she felt the Acceleration. Receives; never treats."],
 ["The Saltmaw","Weeping Strait","Dragon turtle; the Skell pay the salt-tithe. Adopted option: it is what the admiral's squadrons fled \u2014 Aldrec's people were spent as distraction."],
 ["The Fjell Whites","Ardven ranges","Young white brood, ranger-culled; adult matriarch unconfirmed \u2014 the north's quiet dread and a ready escalation near the coronation."]
]));

c.push(H1("Homebrew Items of Record"));
c.push(BUL("Dren's Oath-Medallion (uncommon, unique):", "Cold near oath-breaking, shadow-residue, thin-written ground. Quieter with oath-keepers."));
c.push(BUL("Oathstone Charm (common, Kamenhold 5 gp):", "1/day advantage on one Insight vs. a sworn statement."));
c.push(BUL("Pilgrim's Wolfstone (common, Lupenna):", "Wolves/dogs neutral; true north on clear nights. ~1 in 40 'live'; the Church insists otherwise."));
c.push(BUL("Wardstone Shard (common, unique source):", "Dim wolf-grey light 10 ft; gutters within 30 ft of Undercourt cold."));
c.push(BUL("The Lector's Seal (rare, unique):", "Company stamp; academy-archive documents sealed with it read as authorized; unforgeable; every use logged in the deep stacks."));

c.push(H1("Social Foundations at a Glance"));
c.push(BUL("The Packlaw:", "Church doctrine \u2014 the Matron leads by wisdom, not strength; authority runs through mothers as often as sires. Explains why nearly every SETTLED seat of power (Nyreeza, Vasq, Morn, Corvane, Olvesa, Thorne, Shen) is female, while still-climbing/unsettled power (Norr, Karvel, Aldrec, Dane, Dregan) skews male. Bars no man from rule \u2014 Qilvayas sits the throne. His own unnamed heir is a quiet loose thread, deliberately unresolved."));
c.push(BUL("Bound labor (4 tiers):", "(1) Chattel slavery: ILLEGAL + blasphemous empire-wide, tied to oath-magic (can't own what can swear). (2) Oath-bound service: legal (Norr's whole system). (3) Debt-bondage/indenture: legal, time-limited. (4) Hostage-diplomacy (incl. Academy admissions): separate category, NOT bondage, full legal personhood retained. Real crisis = enforcement gap in the Brekelands, not the law itself."));
c.push(BUL("Marriage & the Denmother's Choice:", "Marriage = real oath (Church witness / Tarnovari standing stones); unrepaired infidelity/abandonment = a small echo of Zhuvedus's crime. Divorce = a formal Release (counter-oath), not just separation. Titled succession is NAMED, not automatic-eldest \u2014 revisable, doesn't require blood. Makes Vasq's Aldous/Tavian succession a genuinely open question. Tarnovar: title follows whoever takes up the stone. Suthmark: inheritance settles at Fallowmonth's turn."));
c.push(BUL("Language and Literacy:", "Old Imperial (dead as a native tongue, purely administrative/liturgical) vs. Common (universal vernacular). Literacy tracks education/office, not province \u2014 the party is a fluent, literate elite moving through a mostly unlettered world. Ardven's subsidized literacy = ideological contrast; Tarnovar inverts the hierarchy (a spoken, witnessed oath outranks writing). Sharpened by the law pass: Books One\u2013Four run on witness/mark/register, so the unlettered are exposed exactly where the Laws should protect them. Marked mapping: deliberately deferred to its own pass."));
c.push(BUL("The Imperial Calendar:", "12 months, year begins Wolfmoon (Matron's month) \u2014 Thawtide, Sowmonth, Greening, Solacre, Haymonth, Harvestide (Vintage Night fell here), Vinmoon, Fallowmonth, Greywane, Longdark (Matron's 2nd month), Threshold (20-day year-end). Loyalists count Years of the Reckoning (YR) from the Founding; Orlath keeps a quiet second dating from the Reconciliation; Tarnovar counts by Voivodes' reigns."));

c.push(H1("The Zhuvedian Laws \u2014 Quick Reference"));
c.push(PS([{ t: "Archjurist Vhal's Law Commission; promulgated together this coming Solacre on the Long Course. Seven Books:", i: true }]));
c.push(BUL("Book One \u2014 Of Persons:", "Bound labor unchanged (see above) + NEW: an oath-bound service/indenture must be witnessed and recorded to be enforceable. Unwitnessed = not illegal, just unenforceable. Marked personhood generalized beyond Velmareth: still open."));
c.push(BUL("Book Two \u2014 Of Oaths and the Witness:", "States outright: an oath binds at law only if sworn before a recognized witness. Perjury = a distinct offense from lying, tried where the oath was sworn, penalized as a mark on the liar's own signet-record (Book Four), not a fine."));
c.push(BUL("Book Three \u2014 Of the Sanction and the Charter:", "Certification = mark + register, always both. Church (Sanction), Charter (House of the Craft), Crown/guilds (mundane trade) each keep their own register. Unstamped/unlicensed = not itself a crime; shifts the burden to produce the register entry on challenge."));
c.push(BUL("Book Four \u2014 Of Seals and Record:", "Forgery of an imperial instrument (seal/signet/writ/charter) = restitution + indenture, scaling to exile on repeat. A retired office must surrender its seal to the Archive before its authority lapses \u2014 how Mosse's trade is legitimate."));
c.push(BUL("Book Five \u2014 Of the Wolf:", "Formalizes the existing Wolf-Price statute (see Magic & Faith, above) as statute. No new content."));
c.push(BUL("Book Six \u2014 Of the March:", "Rank ladder: Legionary \u2192 Sergeant (~10) \u2192 Centurion (~80\u2013100, NEW) \u2192 Colonel (a garrison/legion) \u2192 Legate (multi-legion / capital force). Censor / Censor-Captain leads Office Examiners. MARSHAL IS NOT A RANK \u2014 it's a Throne acclamation for personal renown, independent of command size (why Dane outranks Thorne in title but not in actual command). Officer misconduct = court-martial at Legate level, appealable once to Aenodira."));
c.push(BUL("Book Seven \u2014 Of Judgment:", "No separate civilian watch \u2014 garrisons (Palatine Guard in Aenodira) double as the peace. Magistrates (Ondrei's model) are judge + civil administrator, no jury. Appeal to Aenodira exists but is slow. Secular process and the Church's Writ run in parallel and can conflict; a political favor can quash a writ as obstruction, but only as an exception. No magistrate, no appeal in warlord territory \u2014 the warlord's word is final."));

c.push(H1("Core Mythology at a Glance (DM Only)"));
c.push(BUL("Zhuvedus:", "Empire's founder. Was a paladin, Oath of Devotion (canon). Broke a sworn covenant with his rival Threnvos, killing him under the Matron's own witness, and fell to Oathbreaker in the same act \u2014 the power that let him found the empire alone."));
c.push(BUL("The Lupine Matron:", "The chief goddess, ancient, predates Zhuvedus and has guided many champions across history. Zhuvedus was simply the most successful. His own divinity is genuinely contested (three competing doctrines \u2014 see sourcebook)."));
c.push(BUL("Threnvos:", "Zhuvedus's rival and co-claimant, betrayed and destroyed. His people survive today as Tarnovar; \"Vosthren\" in their ballads is his name, syllable-inverted by drift."));
c.push(BUL("The Shadow:", "Threnvos's dying essence fused with the impersonal force unleashed by the broken oath \u2014 personal grievance and impersonal hunger, born together. Fed since by every broken oath in the empire's 200-year fracture. NEVER state this to players; seed only in fragments."));
c.push(BUL("The Binding Site:", "CONFIRMED CANON: beneath the Old Forum, in the Undercourt's deepest reach, touching the Academy's Undervault. Sessions 5\u20136 carry the party to the Second Seal at its threshold. Full site design beyond the Seal still pending."));
c.push(BUL("Empress Nyreeza:", "Disappeared 3 years ago (timeline fixed). Working theory: she was investigating the true founding account and found the binding site, or evidence of it. Her cipher marks appear in the Undervault (Cold Door) and the wider Undercourt. Exact fate: still open by design."));
c.push(BUL("The Proving:", "Real academy tradition \u2014 a staged final exam mistaken for reality by the cohort undergoing it. Subject of Sessions 3\u20134. Players must never hear the word before it happens."));

// ============ TIMELINE ============
c.push(H1("Timeline at a Glance"));
c.push(P("DM-only anchor (computational baseline; the in-world Reckoning figure stays soft and never appears player-facing): present day \u2248 YR 2000, the founding at YR 0 \u2014 so every '~N years ago' resolves to YR (2000 \u2212 N)."));
c.push(table(
  ["When", "Event"],
  [22, 78],
  [
    ["~2,000 yrs ago", "The founding. Zhuvedus breaks the oath, destroys Threnvos. Binding site sealed. Threnvos's people scatter west \u2192 Tarnovar."],
    ["~200 yrs ago", "The fracture begins; two centuries of provinces peeling away, feeding the shadow."],
    ["Across the 2 centuries", "The Lupine Throne turns over faster than a Drow line should \u2014 fever, faction, twice to child-heirs and their regents; the court names a cause for each and never counts them. Nyreeza (own right, no regent) is the first steadiness in generations. DM: The Throne's Short Reigns."],
    ["~60 yrs ago", "The Silvasse Disaster: three legions and their standards lost in the west."],
    ["~60\u201358 yrs ago", "Olvesa's lord murdered; her four vengeances; her conversion; the See of Orlath founding itself around her (~58)."],
    ["~50 yrs ago", "Vaelindra's career-ending vision; quiet removal from the Church."],
    ["~40 yrs ago", "Dregan Morn arrives at the academy as a Tarnovari hostage-student; stays past his studies, returns home a decade later."],
    ["~20 yrs ago", "The Weeping Strait (Aldrec's betrayal). Norr takes Normere in fact."],
    ["~15 yrs ago", "Karvel begins unifying Ardven; the Skell clans lose their fjords and turn south."],
    ["~12 yrs ago", "Nyreeza begins the academy revival and institutional reforms."],
    ["11 yrs ago", "Vell's last referral to Vaelindra \u2014 ended badly; hasn't presumed on her since."],
    ["6 yrs ago", "The Vintage Night (Suthmark massacre of Orlathines; Vasq owns it)."],
    ["4 yrs ago", "The Harrowing of the Weld (Norr ends a rebellion, and a district)."],
    ["3 yrs ago", "Nyreeza's final meeting with Vaelindra; disappearance. Visions accelerate \u2014 Vaelindra's AND Olvesa's (which sets the coronation moving)."],
    ["~3 yrs ago (DM)", "Vessarkath lets one wolf-standard leave her hoard \u2014 she felt the stir under the capital; the Ninth's eagle starts its slow way home via the Brekelands."],
    ["~2.5 yrs ago", "Qilvayas's coronation; restoration begins in earnest."],
    ["~1 yr ago", "Marshal Dane recovers the Ninth's standard, nearly 60 yrs after Silvasse. The Ostmark's wound starts to close; the empire gets its Young Wolf."],
    ["This Solacre (~9 mo)", "TWO CLOCKS, ONE SEASON: Zhuvedian Laws promulgation (Aenodira) + Karvel's coronation as Emperor of the True Rite (Orlath)."],
    ["Present day", "Party's field exercise \u2192 vision \u2192 return to Aenodira \u2192 the Proving."]
  ]
));

// ============ ITEMS & THREADS ============
c.push(H1("Items and Threads Currently in Play"));
c.push(BUL("Dren's oath-medallion:", "Defaced, permanently cold, non-detectable as magical. First physical artifact of the truth. (Session 1)"));
c.push(BUL("The Cold Door rubbing:", "Charcoal rubbing of cipher marks at the Undervault's sealed door \u2014 now the only copy in existence; the wing was re-sealed after. (Sessions 3\u20134)"));
c.push(BUL("The Lector's Seal housing:", "Gifted to the party as their mercenary company's official sealing-stamp. (Sessions 3\u20134)"));
c.push(BUL("Forty witnesses (Halvenne):", "If resettled in Dravenna, a standing, grateful contact network. If not, they surface later in Farrowgate. (Session 2)"));
c.push(BUL("Ondrei's complaint vs. the Third Legion colonel:", "Currently sitting in Legate Thorne's inbox \u2014 background thread, can be developed or left as texture."));
c.push(BUL("The Coronation Clock:", "Karvel's crowning in Orlath, same year as the Laws' promulgation. The campaign's second structural clock."));
c.push(BUL("The Landless King's Fifth Petition:", "Aldrec's final overture to the throne \u2014 a closing window tied to his failing health."));
c.push(BUL("The Girls of Greywell:", "A Farrowgate family's missing daughter \u2192 Castle Greywell. Pure gothic horror, deliberately non-shadow."));
c.push(BUL("The Grey-Gold Rising:", "Proposed capital riot when the Laws' tax provisions post \u2014 Qilvayas's Nika moment. Unscheduled."));
c.push(BUL("The Book and the Fence:", "Norr's surveyors approaching Dregan's stakes \u2014 the west's coming collision."));
c.push(BUL("The Shen Alliance:", "Formed, discounted, or refused in Sessions 5\u20136 \u2014 defines the party's intelligence landscape. Shen holds Nyreeza's final filing; the party holds the rubbing; Vell holds the key."));
c.push(BUL("The Empress's Last Words:", "Translated in Session 6: \"the wound predates the Wall. The Tablets were written over it. He must not follow me. Tell him the garden, not the grave.\" The last line keys the sealed dispatch case."));
c.push(BUL("The Writ's Aftermath:", "Vaelindra's status post-Session 6 (free/hidden/custody per branch) and every favor owed or spent to get there."));
c.push(BUL("The Second Seal:", "Reached, not opened, end of Session 6. The word FORGIVE. The campaign's fixed landmark going forward."));

c.push(H1("The Undercourt Revelations (DM Only \u2014 Sessions 7\u20138)"));
c.push(BUL("Un-witnessing:", "Oaths bind because they are WITNESSED. The founding assembly turned away in unison \u2014 that unbinding is what made the betrayal possible. The shadow feeds on broken oaths AND the silence around them. Every institutional look-away is the same act."));
c.push(BUL("The Vigil = the counter-rite:", "Witnessing starves it. The Vigil (watched, lit, never alone) is PENANCE, instituted by the witnesses' descendants \u2014 which is why it survives every schism unchanged. The party performed it correctly at Redwatch without being told."));
c.push(BUL("The Golden Tablets:", "Composed BY the witnesses \u2014 the self-exoneration document of the people who looked away. \"The Tablets were written over it.\" The law was the cover-up, written first."));
c.push(BUL("Qilvayas's Laws = the weapon:", "A code making oaths enforceable, witnessed, and recorded is literal starvation for the entity. He built it by instinct, unknowing. The Daily Draw is the Emperor personally witnessing one citizen a day."));
c.push(BUL("The Scouring \u2014 Emperor Vaskaren the Restorer (~200 yrs ago):", "Sought why the empire was failing, found the Hall, erased it. Second crime = same crime (un-witnessing by the founding's own family). His restoration failed; Qilvayas is the second restorer of that line. His order survives in the dynastic archive \u2014 how Nyreeza found the way down, and what waits in her sealed dispatch case."));
c.push(BUL("The surviving frieze:", "Two spans missed on the eastern gallery's top tier. Identifiable faces + house-sigils; several of those houses sit at court today. The rubbing is a political bomb \u2014 publishing delegitimizes the throne, arms Orlath, vindicates Tarnovar, breaks the Church. Keeping quiet makes the party the newest witnesses to turn away."));
c.push(BUL("Threnvos:", "Never received a Vigil. Present on the Rite Floor, speaks ONLY his half of the covenant \u2014 cannot answer questions, is not exposition. No stat block by design. Laying him to rest SEPARATES grief from hunger: real victory, not the victory."));
c.push(BUL("What remains:", "The impersonal hunger \u2014 doesn't grieve, doesn't remember, can't be reasoned with (that part is now at rest). Fed by every broken word and averted eye. Campaign pivots from dungeon problem to civilization problem."));
c.push(BUL("The Matron:", "May be down there keeping the vigil nobody else would. Divine magic works; clerics receive. NEVER a form, voice, or confirmation. Ambiguity is permanent and deliberate."));

c.push(H1("Branch Ledger \u2014 Record the Party's Divergences"));
c.push(P("Every session module now carries a Diverging Paths section. Track outcomes here as they resolve; Sessions Seven and beyond are built against this ledger."));
c.push(table(
  ["Divergence", "Session", "Outcome at Your Table / Effects"],
  [30, 12, 58],
  [
    ["Deserters spared vs. killed (Dessen case strength)", "1", ""],
    ["Parley vs. assault reputation", "1", ""],
    ["Medallion carried, and by whom", "1", ""],
    ["Semya's people: Dravenna vs. Farrowgate", "2", ""],
    ["Malich respected vs. Ostrev's enmity", "2", ""],
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
    ["Seal forced (\"the Seal has heard them\")?", "6", ""],
    ["Envoy engaged (Tarnovar warmth)?", "6", ""],
    ["The Seal-oath \u2014 who swore it, and the exact words", "7", ""],
    ["Memory pressure \u2014 each character's unkept promise", "7", ""],
    ["The Turned \u2014 witnessed vs. destroyed", "7", ""],
    ["The frieze rubbing \u2014 taken or left; who argued", "7", ""],
    ["The Vigil \u2014 kept / broken / refused", "8", ""],
    ["Watch Three \u2014 who took the offer", "8", ""],
    ["The covenant's second half \u2014 the players' words, verbatim", "8", ""],
    ["WHO THEY TOLD (largest branch in the campaign)", "8", ""]
  ]
));

// ============ OPEN PLACEHOLDERS ============
c.push(H1("Deliberately Open \u2014 By Design (Not Gaps)"));
c.push(BUL(null, "Nyreeza's exact fate \u2014 dead, transformed, or trapped: to be discovered through play. (The word FORGIVE at the Second Seal is her last known mark.)"));
c.push(BUL(null, "Countess Ory's blood-rite mechanism \u2014 decide when the Greywell module is built (hag-bargain / fiendish compact / inherited rite)."));
c.push(BUL(null, "The coronation's metaphysical consequence \u2014 a founding covenant sworn while the shadow listens: design when the arc approaches."));
c.push(BUL(null, "The Piso gun \u2014 whether Marshal Dane's sudden death ever occurs is a standing DM option, never an obligation."));
c.push(BUL(null, "The throne's short reigns \u2014 the Lupine line cannot hold its throne; mundane on the surface (fever, faction, regency), any deeper cause open by design. Do not resolve at the table."));
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
