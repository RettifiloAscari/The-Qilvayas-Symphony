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
const { Table: LTable, TableRow: LRow, TableCell: LCell, WidthType: LW, ShadingType: LS } = require('docx');
const lcell = (text, opts = {}) => new LCell({ width: { size: opts.w || 20, type: LW.PERCENTAGE }, shading: opts.head ? { type: LS.CLEAR, fill: "E4DCCB" } : undefined, margins: { top: 50, bottom: 50, left: 90, right: 90 }, children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text, bold: !!opts.head, size: 18 })] })] });
const ltable = (headers, widths, rows) => new LTable({ width: { size: 100, type: LW.PERCENTAGE }, rows: [ new LRow({ children: headers.map((h, i) => lcell(h, { head: true, w: widths[i] })) }), ...rows.map(r => new LRow({ children: r.map((v, i) => lcell(v, { w: widths[i] })) })) ] });

const BOX = (text) => new Paragraph({ spacing: { after: 200 }, shading: { type: ShadingType.CLEAR, fill: "EFEAE0" }, indent: { left: 360, right: 360 }, children: [new TextRun({ text, italics: true })] });
const mod = (v) => { const m = Math.floor((v - 10) / 2); return (m >= 0 ? "+" : "\u2212") + Math.abs(m); };
const abCell = (text, bold) => new TableCell({ width: { size: 16.6, type: WidthType.PERCENTAGE }, shading: bold ? { type: ShadingType.CLEAR, fill: "E4DCCB" } : undefined, children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40, before: 40 }, children: [new TextRun({ text, bold: !!bold, size: 20 })] })] });
const SB = (d) => {
  const out = [];
  out.push(new Paragraph({ spacing: { before: 240, after: 40 }, children: [new TextRun({ text: d.name, bold: true, size: 26, color: "5B1F1F" })] }));
  out.push(PS([{ t: d.meta, i: true }], { spacing: { after: 120 } }));
  out.push(B("Armor Class:", d.ac)); out.push(B("Hit Points:", d.hp)); out.push(B("Speed:", d.speed));
  out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    new TableRow({ children: ["STR", "DEX", "CON", "INT", "WIS", "CHA"].map(h => abCell(h, true)) }),
    new TableRow({ children: [d.str, d.dex, d.con, d.int, d.wis, d.cha].map(v => abCell(v + " (" + mod(v) + ")")) })
  ] }));
  out.push(P("", { spacing: { after: 60 } }));
  if (d.skills) out.push(B("Skills:", d.skills));
  if (d.saves) out.push(B("Saving Throws:", d.saves));
  if (d.resist) out.push(B("Damage Resistances:", d.resist));
  if (d.immune) out.push(B("Damage Immunities:", d.immune));
  if (d.condimmune) out.push(B("Condition Immunities:", d.condimmune));
  if (d.vuln) out.push(B("Damage Vulnerabilities:", d.vuln));
  if (d.senses) out.push(B("Senses:", d.senses));
  if (d.langs) out.push(B("Languages:", d.langs));
  out.push(B("Challenge:", d.cr));
  (d.traits || []).forEach(t => out.push(PS([{ t: t.n + ". ", b: true, i: true }, { t: t.t }])));
  if (d.actions && d.actions.length) { out.push(PS([{ t: "ACTIONS", b: true }], { spacing: { before: 80, after: 80 } })); d.actions.forEach(a => out.push(PS([{ t: a.n + ". ", b: true, i: true }, { t: a.t }]))); }
  if (d.reactions && d.reactions.length) { out.push(PS([{ t: "REACTIONS", b: true }], { spacing: { before: 80, after: 80 } })); d.reactions.forEach(a => out.push(PS([{ t: a.n + ". ", b: true, i: true }, { t: a.t }]))); }
  return out;
};

const c = [];
c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "Sessions Three & Four: The Proving Below", bold: true, size: 40 })] }));
c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "The Qilvayas Symphony", italics: true, size: 24 })] }));
c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 360 }, children: [new TextRun({ text: "A two-session dungeon module for 4\u20136 characters of 4th level \u2014 the tenth bell, the Undervault, and the examination nobody announced", italics: true, size: 22, color: "5B1F1F" })] }));

c.push(H1("Overview"));
c.push(P("Session Three opens at Vaelindra\u2019s table for the conversation she promised, and ends deep inside a dungeon the party believes is a rescue mission. Session Four finishes the dungeon, defeats or outwits its warden, and detonates the twist: the entire commission was staged. The Undervault is the academy\u2019s hidden proving ground, the missing survey team is faculty, the monsters were leashed, and the party has just passed the most consequential examination the empire offers \u2014 the Proving, a final test administered only to exceptional cohorts, and only ever revealed at its conclusion."));
c.push(P("One thing inside the dungeon, however, is not part of the test \u2014 a sealed pre-imperial door the staff\u2019s own maps omit, cold to the touch in a way one party member\u2019s pocket already understands. The Proving is a closed loop; the Cold Door is the campaign leaning in."));
c.push(P("Both sessions are designed for five hours. Session Three pacing budget: the tenth bell at Vaelindra\u2019s (60 minutes); the summons and briefing (40 minutes); Undervault Level One (90 minutes); Level Two (90 minutes), ending on the discovery of the Cold Door (20 minutes, unhurried \u2014 it is the cliffhanger). Session Four: recap and the door (30 minutes); finishing Level Two (30 minutes); Level Three and the trials (60 minutes); the Vault Warden (75 minutes); the Reveal (45 minutes); aftermath and hooks (60 minutes). The party reaches 4th level at the start of Session Three and 5th at the end of Session Four, when the Proving concludes."));

c.push(H2("What Is Actually Happening (DM Only)"));
c.push(P("The Proving is real academy tradition (see the sourcebook, The Proving, DM Only). The cohort\u2019s performance in the field \u2014 and something in how their exercise report read \u2014 moved the faculty to invoke it. The cover story is a silent survey team in the decommissioned Undervault; the truth is a controlled environment: constructs on training protocols, beasts on warded collars, faculty observing from concealed galleries, and mercy sigils throughout that translocate anyone reduced to 0 hit points to the infirmary. Nobody can die in the Proving. The faculty have run it eleven times in the current chancellor\u2019s tenure and are quietly proud of the safety record."));
c.push(P("Except: the Undervault\u2019s deepest wall touches the Undercourt \u2014 the pre-imperial stratum beneath Aenodira (see the sourcebook, Geography and Locations) \u2014 and one sealed black-stone door on Level Two predates the academy, the empire, and every map the staff possess. The mercy wards end ten feet from it; the wards will not anchor in that stone, a fact the enchanters papered over decades ago rather than explain. Hairline survey marks near its hinge, three years old, are in Empress Nyreeza\u2019s personal cipher \u2014 though nobody at the table can know that yet. Nothing attacks the party there. Nothing needs to. The door is doing its work by existing."));
c.push(P("Run the whole module playing it absolutely straight. The dungeon is real, the danger reads as real, and the DM\u2019s job is to be genuinely trying to make the party believe. If the players smell the staging early \u2014 the punch-pulling constructs, the suspiciously curriculum-shaped challenges \u2014 do not panic and do not confirm: the faculty\u2019s real question simply becomes whether the cohort finishes the job anyway, and that is a better test than the one they planned. Grace under deception is the Proving\u2019s true subject."));

c.push(H1("Part One \u2014 Session Three"));
c.push(H2("Scene 1: The Tenth Bell"));
c.push(BOX("The tea is already poured when you arrive, which means she watched you cross the square. The ledger is closed this morning. Vaelindra of the Still Waters looks like she has slept well and thought hard, in that order, and she waits until the door is latched before she speaks. \u201CSit. I have decided what you can carry, and it is more than I expected and less than you want.\u201D"));
c.push(P("What she gives them, in her own order and at her own pace:"));
c.push(BUL("The acceleration.", "Fragmentary visions \u2014 the storm, the wrong fire, the shape behind the sky \u2014 have reached her for fifty years, from strangers who never met. But the arrivals changed: \u201CThree years ago, almost to the season, they quickened. I mark my ledger by the bells. I do not believe in coincidence; I believe in causes.\u201D She does not say what else happened three years ago. If a player makes the connection to the Empress\u2019s disappearance aloud, she goes very still, then nods once, slowly, and moves on \u2014 confirmation without a word."));
c.push(BUL("The counsel.", "Do not go to the Office of Omens; do not let the Office come to them. Finish the academy, graduate, become unremarkable: \u201CNormalcy is armor. Wear it while it fits.\u201D Report to her anything strange \u2014 and anything cold."));
c.push(BUL("The medallion.", "Keep it, and keep it moving. \u201CThings like this are quieter in the pockets of people who keep their word. I do not fully know why. I have fifty years of ledger that says it is so.\u201D (This is the campaign\u2019s mechanism whispering; confirm nothing.)"));
c.push(BUL("The city beneath.", "Delivered last, almost as an afterthought, and worth its weight: \u201CEverything in Aenodira stands on something older. The academy most of all \u2014 scholars always build on bones. If your school ever sends you down \u2014 and it sends its best down, eventually; it always has \u2014 pay attention to what is cold.\u201D She will not elaborate. She is not omniscient; she has simply spent fifty years listening to people who went under the city and came back changed, or did not come back."));
c.push(P("What she withholds: everything touching the founding, Threnvos, and the content of her final meeting with Nyreeza. If pressed on the Empress directly: \u201CThat lady trusted me with things I will spend on the day they are needed and not one day sooner. You are not asking a small thing. You are asking whether I keep faith. Watch and find out.\u201D Milestone: the party reaches 4th level when this scene closes."));

c.push(H2("Scene 2: The Summons"));
c.push(P("The summons finds them before noon \u2014 an academy runner, slightly out of breath, with the seal of the Chancellery: report to Magister Corvin Dail, Master of Trials, immediately. In Dail\u2019s spare office (racked practice weapons, one chair, no comforts), the briefing is crisp:"));
c.push(BUL(null, "Five days ago, a three-person academy survey team descended into the Undervault \u2014 the sealed pre-imperial vault complex beneath the academy\u2019s oldest wing \u2014 to catalogue Vault Nine for the Law Commission\u2019s records inventory. They have not reported since. The Undervault\u2019s old wards defeat scrying."));
c.push(BUL(null, "The party\u2019s commission: descend, locate the team, render aid, and recover the Lector\u2019s Seal \u2014 the archival master-key the team carried, without which half the academy\u2019s deep records are inaccessible. Bring everyone home."));
c.push(BUL(null, "Why them and not faculty: \u201CBecause you are the cohort that cleared Redwatch, and because every instructor who can fight is examining first-years this week. Consider it a compliment with teeth.\u201D"));
c.push(BUL(null, "The compensation, delivered with a perfectly straight face: \u201CSucceed, and the chancellery will consider your final examinations satisfied.\u201D (Every word of the briefing is technically true. This line is the module\u2019s best joke, and nobody will get it for two sessions.)"));
c.push(P("Give them a preparation beat \u2014 equipment requisitions are approved with suspicious speed \u2014 and one detail for later: Dail\u2019s provided map of Levels One and Two is precise, professional, and has one drafting smudge on the eastern edge of Level Two, as though something was erased or never surveyed. A DC 15 Intelligence (Investigation) check on the map notices it now; otherwise it lands in retrospect."));

c.push(H2("Scene 3: Level One \u2014 The Archive Halls"));
c.push(BOX("The Undervault opens off a stair behind three locks, and the air changes on the fourth step \u2014 dry, cold, papery, old. Below, corridors run straight and square under barrel vaults, lined with iron shelf-cages of ledgers nobody has touched in a century. Your lanterns push the dark back exactly as far as lantern-light should, and no further. Somewhere below, metal scrapes on stone \u2014 once, deliberately, like something finishing a step."));
c.push(P("Run Level One as a classic corridor-and-chamber crawl \u2014 encourage a player to map. This level teaches the dungeon\u2019s vocabulary and stages the missing-team fiction:"));
c.push(BUL("The survey camp.", "Bedrolls, a cold lamp, a half-written catalogue page ending mid-line, and a scatter of dropped instruments \u2014 staged with real skill. DC 13 Investigation: the scene reads genuinely wrong-but-recent. DC 16: the lamp\u2019s oil level and the dust say the camp is older than five days \u2014 the first loose thread, if anyone pulls it."));
c.push(BUL("The cipher gate.", "A bronze door bearing a rotating-ring lock inscribed in Old Imperial legal shorthand \u2014 a House of the Seal education solves it outright (automatic for Seal-primary characters; DC 13 Intelligence (History) otherwise; a thief\u2019s tools attempt at DC 15 works but triggers a shrieking alarm glyph that costs surprise on this level). The lock\u2019s phrasing is, verbatim, a first-year contracts exercise. File that."));
c.push(BUL("Encounter \u2014 Drill Automatons.", "Two Drill Automatons (three for a party of five, four for six) patrol the halls \u2014 man-shaped training constructs of the old imperial pattern, animated and hostile. They fight competently and lose convincingly. Their tell, for observant players (DC 13 Wisdom (Insight) during combat): they check their swings against downed or badly wounded targets. They never deliver a finishing blow. The DM should play this completely deadpan."));
c.push(BUL("The healing font.", "A working restorative font in a side chapel (1d4 + 1 charges of cure wounds at 1st level, self-administered) \u2014 a gift with a question mark: fonts this old should not still be charged. (It was recharged last week.)"));

c.push(H2("Scene 4: Level Two \u2014 The Menagerie Stacks"));
c.push(BOX("The second level is wetter and older \u2014 the shelving gives way to crate-vaults and barred alcoves, and the dark has a smell now: animal, musk and straw, wrong for a place sealed for lifetimes. Something pads pace-for-pace with you behind the eastern shelves, claws clicking a patient rhythm on stone. It is not trying very hard to be quiet."));
c.push(P("Level Two escalates the fiction and hides the module\u2019s two most important discoveries:"));
c.push(BUL("Encounter \u2014 Vault Hounds.", "Three Vault Hounds (four for five characters, five for six) \u2014 lean, gray, wolf-sized beasts with bronze collars \u2014 hunt the party through the stacks in coordinated pack rushes. The collars are the point: DC 12 Intelligence (Arcana) in combat identifies binding runes; the collars can be targeted (AC 15, 10 hp) or removed from a restrained hound (DC 13 Dexterity check). A hound freed of its collar disengages immediately, shakes itself like a wet dog, and becomes entirely docile \u2014 it was compelled, not cruel. Freed hounds follow the party amiably. (They are the academy kennels\u2019 wardbeasts, and they know perfectly well the party is not prey; the collars made them perform otherwise.)"));
c.push(BUL("\u201CMerla.\u201D", "Huddled in a locked records cage: a terrified junior archivist, the survey team\u2019s \u201Csole remaining member\u201D \u2014 dehydrated, tearful, and desperate to be escorted out immediately, abandoning the mission and the other two \u201Csurvivors.\u201D She is Instructor Liria Fenn of the House of the Craft (rhetoric and stagecraft), in light disguise and giving the performance of her career. Her function is to test the party\u2019s triage: Do they split the group? Abandon the objective? How do they treat a helpless stranger who is costing them time? She resists direct magical detection with a warded amulet (the faculty are not amateurs); a DC 18 Wisdom (Insight) may notice her terror never quite reaches her breathing. If unmasked early, she breaks character with remarkable good humor \u2014 see the Reveal for guidance \u2014 and the Proving continues around her."));
c.push(BUL("The Custodian.", "A room-filling translucent ooze methodically scouring a spill of ancient preservative from the flagstones. The Custodian Ooze is real, ancient, and harmless unless attacked or interfered with \u2014 it is, functionally, the Undervault\u2019s janitor, and it has been down here longer than the academy has stood above. It ignores creatures and consumes messes. Parties who watch it work learn something true; parties who attack everything learn something too, and the faculty note both."));
c.push(BUL("Bartleby.", "A treasure chest sits implausibly alone in a cleared alcove, lit almost theatrically. It is a mimic \u2014 a real one, old and fat and semi-tame, kept and fed by generations of Undervault staff, and it is the single least subtle test in the Proving: the faculty want to know who checks. Poke it, feed it, or greet it and it burbles amiably and returns to being furniture; grab the \u201Cgold\u201D and it grapples the offender with the enthusiasm of a creature that thinks wrestling is a love language. It stops on a word from anyone it has tasted food from. Its name is Bartleby. The staff will deny this, and then Dail will absolutely say it during the Reveal."));
c.push(H3("The Cold Door \u2014 Ending Session Three"));
c.push(BOX("Behind the collapsed shelving in the eastern stacks \u2014 the stretch the hounds would not enter, where the map goes smudged \u2014 the brickwork of the vault simply stops, and older stone begins: black, roughly hewn, fitted without mortar, the same stone as the Founder\u2019s Wall a mile above. Set into it is a door. No handle. No keyhole. No seam wide enough for a knife. The iron of its face is furred with frost in a corridor where nothing else is even damp, and the cold reaches you a full pace before your hand \u2014 the exact cold, one of you realizes, that rides in a certain pocket, that has ridden there since Redwatch. Along the hinge-line, faint as scratches on ice: rows of tiny, deliberate marks. Someone stood exactly here, in the cold, and wrote something \u2014 carefully, and not long ago."));
c.push(PS([{ t: "Let them investigate: the marks are a cipher no one can read tonight (a charcoal rubbing is the obvious move \u2014 let them think of it); the door does not open by any means available at this tier; the frost re-forms as they watch. Whoever carries Dren\u2019s medallion feels it grow noticeably colder within ten feet of the door \u2014 the module\u2019s single loudest clue, delivered in complete silence. End the session here, at the door, in the cold. (" }, DM("DM note: "), { t: "the mercy wards end ten feet behind the party. Nothing here will hurt them. Do not tell them that.)" }]));

c.push(H1("Part Two \u2014 Session Four"));
c.push(H2("Scene 5: The Door, By Morning Logic"));
c.push(P("Open with the party still below (the Undervault has no morning) and let them resolve the door on their own terms: rubbing taken, position marked on their map \u2014 correcting the official map\u2019s smudge \u2014 theories argued. Characters proposing to force it find good reasons to fail; the module\u2019s honest answer is not yet. When they disengage and press on, the hounds (if any were freed) visibly relax the moment the door is out of sight."));

c.push(H2("Scene 6: Level Three \u2014 The Vault Proper"));
c.push(BOX("The final stair descends into engineered dark: a processional corridor of paired columns, and at its end, doors of green-black bronze standing twelve feet tall, relief-carved with the wolf-standard of an empire two centuries younger than it is now. From behind them, a voice \u2014 vast, level, neither kind nor unkind \u2014 speaks a challenge that has waited a very long time to be answered: \u201CPRESENT THE WARRANT OF ACCESS. UNWARRANTED ENTRY IS DEFENDED.\u201D"));
c.push(P("The corridor itself is the third house\u2019s trial (the Seal had the cipher gate, the Craft has had a level of machines and bindings; the Sword gets its own): the Gauntlet Walk, a forty-foot stretch of alternating pressure plates and arrow-loops built for formation drill. A party that advances in disciplined formation \u2014 shields forward, called steps; any Sword-primary character can direct it (grant the group advantage) \u2014 crosses with a group DC 12 Dexterity save (2d6 piercing on failure, half on success, nonlethal by ward though it does not feel that way). A disorganized rush faces DC 14 and disadvantage. The corridor is, transparently in hindsight, a drill yard."));
c.push(P("Beyond the doors: Vault Nine, a domed rotunda, empty shelving radiating from a central plinth where the Lector\u2019s Seal rests in a shaft of pale wardlight \u2014 and the Vault Warden between them and it: a nine-foot construct of blackened bronze in the pattern of the old imperial honor guard, halberd grounded, waiting. It repeats its demand once. Then it defends."));
c.push(H3("Three Ways Past the Warden"));
c.push(BUL("The Warrant.", "A genuine Warrant of Access exists, folded inside the staged survey camp\u2019s half-written catalogue (Level One) \u2014 findable there, or its existence deducible from the Warden\u2019s own phrasing (the faculty consider retrieving it the perfect score). Presented, the Warden grounds its halberd, steps aside, and bows. Full marks."));
c.push(BUL("The Phrase.", "The plinth inscriptions (readable during combat with a DC 15 Intelligence (History) check as an action, or before it by a party that scouts) include the archivists\u2019 old stand-down formula in Old Imperial. Spoken loudly and correctly, it ends the fight at once."));
c.push(BUL("The Yield.", "The Warden fights to half its hit points, then \u2014 per a protocol no intruder would expect \u2014 grounds its weapon, kneels, and speaks: \u201CSUFFICIENT.\u201D (Its instructions were always to test, not to kill; it has been testing people since before the fracture.)"));
c.push(H3("Scaling the Warden"));
c.push(P("Baseline (4 characters): the Vault Warden alone. Five characters: two Drill Automatons enter from alcoves on round 2. Six characters: two automatons from round 1, and the Warden\u2019s Bulwark trait is active until both automatons fall. The encounter is deliberately hot for the tier \u2014 that is what the yield protocol, the warrant, the phrase, and (unknown to the players) the mercy wards are for. Let it feel dangerous. It is allowed to be, because it cannot actually be."));

c.push(H2("Scene 7: The Reveal"));
c.push(BOX("The Seal is barely in your hands when the sound begins \u2014 stone grinding on stone, but vast, orchestral, everywhere at once. The rotunda\u2019s far wall splits along seams you would have sworn were solid, and folds outward, and beyond it: light. Tiered galleries. Chairs. People. The entire senior faculty of the Imperial Academy of the Lupine Throne, rising to their feet \u2014 and applauding. Magister Dail stands at the rail with his arms crossed, wearing the first unguarded expression you have ever seen on him. Beside him, the \u201Cmissing\u201D survey team, in perfect health, clapping hardest of all. And stepping down toward you, arms spread, commencement-voice already unfurling: the Chancellor of the academy. \u201CCongratulations, graduates. Be at ease \u2014 and be proud. You are the twelfth cohort in my tenure to undergo the Proving, and the first to \u2014 \u201D and here the polish cracks, just slightly, into something real \u2014 \u201C \u2014 well. We will discuss what you found. Sit. All of you. You have earned every chair in this room.\u201D"));
c.push(P("Run the Reveal in three movements, and give it the full forty-five minutes:"));
c.push(BUL("The mechanics, disclosed.", "Chancellor Emeth Sorral and Dail lay it out plainly: the Proving\u2019s tradition and secrecy; the training constructs and their checked swings; the collars; the mercy sigils (\u201Cno student has ever died in the Proving; several have woken very surprised in the infirmary\u201D); Fenn peeling off Merla\u2019s scarf with a bow (if unmasked early, she leads the applause and cheerfully itemizes exactly when each player\u2019s suspicion showed); Dail scolding Bartleby by name if anyone mentions the chest. Dail then delivers his critique \u2014 personalized to the table\u2019s actual choices, praising by noting the absence of error, and treating a bloodless run (freed hounds, presented warrant, spoken phrase) as the highest possible marks."));
c.push(BULLET([{ t: "The feelings, honored. ", b: true }, { t: "Then let the party react \u2014 and let it be complicated. They were deceived, skillfully, by an institution they trust, for reasons that institution believes justify the method, and they are simultaneously being celebrated. Some characters will be elated; some will be furious; the most interesting tables will be both at once. Sorral does not apologize and does not gloat: \u201CYou are owed the truth of why. An examination you know is an examination measures your preparation. Only a test you believe is real measures what you are. We needed to know what you are. Now we do \u2014 and so, I think, do you.\u201D (" }, DM("DM note: "), { t: "this is the campaign\u2019s thematic rhyme \u2014 benevolent deception inside an empire founded on a lie \u2014 and it must never be lampshaded. If a player connects it, even half-formed, give it silence and let it ring.)" }]));
c.push(BUL("The door, deflected.", "When \u2014 not if \u2014 the party raises the Cold Door, Dail waves it off with genuine unconcern: \u201COlder than our lease. It was sealed before your grandparents; it stays sealed; it is not on the syllabus.\u201D Sorral is another matter. The commencement-polish stops entirely. He asks exactly one question \u2014 \u201CYou say there were marks. Recent marks?\u201D \u2014 listens to the answer without moving, thanks them with complete formality, and changes the subject with the smoothness of a man closing a ledger. He does not ask a second question. That is the tell. (Within days, the party can notice masons re-sealing the eastern stacks. The rubbing in their possession is now the only copy of whatever was written there.)"));

c.push(H2("Scene 8: Aftermath"));
c.push(P("The Proving concluded, events move quickly, and each beat below deserves table time in the closing hour:"));
c.push(BUL("Commencement, early.", "The Proven cohort graduates in a small, strangely moving ceremony within the week \u2014 four weeks early, by the Chancellor\u2019s privilege. Their sealed records now carry a designation almost nobody can read and certain offices in Highcourt absolutely can."));
c.push(BUL("The company, chartered.", "The chancellery countersigns their mercenary charter as its graduation gift \u2014 the company they named in Session Zero is now a legal entity of the empire \u2014 and grants a founding purse of 300 gp. If the party thinks to use the Lector\u2019s Seal\u2019s recovery as their first \u201Ccompleted contract\u201D on the company\u2019s ledger, allow it with delight; Sorral formally gifts them the Seal\u2019s worn original housing as their company\u2019s sealing-stamp, which means the party\u2019s promises will henceforth literally be closed under a seal recovered from beneath the city. Say none of this aloud."));
c.push(BUL("The rubbing, read \u2014 partly.", "Brought to Archivist Vell, the cipher stops him mid-motion, ledger half-closed. He identifies the hand in one sentence and will not be drawn further in the academy\u2019s walls: \u201CThat is the Empress\u2019s personal shorthand. I archived nine years of her academy correspondence. You will not repeat that in this building, and you will tell me \u2014 elsewhere \u2014 exactly where you found it.\u201D Translation of the fragment itself is a future thread: partial, tantalizing, and the natural bridge to the Nyreeza trail. (Suggested partial reading, when the time comes: a survey notation \u2014 a depth, a bearing, and the single legible phrase \u201Ccolder past the second seal.\u201D)"));
c.push(BUL("Vaelindra, told.", "If the party reports to Coppergate \u2014 and after her tenth-bell counsel, they should think of it \u2014 she listens to the whole account without interrupting, and answers with the module\u2019s closing line. See the epigraph. What she now knows, and they do not: Nyreeza went beneath the city through the academy at least once \u2014 which means the Empress\u2019s trail and the party\u2019s school have been the same building all along."));
c.push(BUL("Milestone.", "The party reaches 5th level. The first arc of the campaign \u2014 students, vision, Seeress, Proving \u2014 is complete. They are graduates, chartered, marked by Highcourt, holding a dead man\u2019s cold medallion and a dead-or-worse Empress\u2019s cipher. The campaign proper is now open in every direction."));

c.push(H1("Optional Content (Beyond the Five-Hour Cores)"));
c.push(B("Bartleby\u2019s Feast (~20 minutes, Session Three):", "If the party befriends rather than fights the mimic, it follows them at a respectful waddle for the remainder of Level Two, imitating furniture badly whenever anyone looks at it directly \u2014 a chest with visible breathing, a barrel with an anxious quality. It expects to be fed at intervals and produces, from somewhere within itself, a perfectly preserved eighty-year-old cheese wheel as a reciprocal gift. The cheese is genuinely excellent. Do not explain the cheese."));
c.push(B("The Betting Pool (~10 minutes, Session Four):", "During the Reveal, a party that asks the right questions \u2014 or simply reads the room \u2014 discovers the faculty ran a formal betting pool on their Proving: time to completion, casualties, whether anyone would feed the mimic, whether the warrant would be found. Instructor Fenn holds the book. Dail, it emerges, bet on them heavily and against the house consensus, a fact he will deny with visible pride. Let the players hear their own performance recounted as sports commentary; it is the fastest way to make the faculty feel human after the deception lands."));
c.push(H1("Diverging Paths (DM Only)"));
c.push(P("Outcomes here echo forward. Record them in the Branch Ledger."));
c.push(BUL("Bloodless vs. bloody Proving:", "A bloodless run (freed hounds, presented warrant or spoken phrase, no destroyed constructs) earns Dail\u2019s highest marks, and the sealed Proven designation carries an additional notation certain Highcourt readers weight heavily \u2014 Session Five\u2019s commission arrives faster and with better terms. A demolition run still passes, but Kessin\u2019s office reads the report differently: useful, and dangerous, and priced accordingly."));
c.push(BUL("The freed hounds:", "Hounds freed of their collars imprint on the party. The academy kennels will, if asked, formally gift one as a company animal \u2014 a living, tail-wagging consequence of mercy, and a quiet alarm system that reacts to Undercourt cold before any instrument the party owns."));
c.push(BUL("Fenn unmasked early vs. late:", "Unmasked early, Fenn\u2019s post-Proving notes become a standing offer: informal tutoring in reading institutional deception \u2014 mechanically, occasional advantage on Insight against official lies, at the cost of Fenn knowing the party\u2019s tells. Deceived to the end, she is kinder about it than anyone expects, and more dangerous: she knows exactly which lies each character believed."));
c.push(BUL("The door, disclosed vs. withheld:", "What the party tells the faculty about the Cold Door shapes Sorral. Full disclosure (marks, cold, the medallion\u2019s reaction): he re-seals the wing within days and begins his own quiet inquiry \u2014 a potential ally or leak later. Partial disclosure: the re-sealing happens anyway (the observation galleries saw them find it), but Sorral does not know about the rubbing, which stays the party\u2019s sole advantage. If anyone shows him the rubbing itself, he goes very still and asks to keep it \u2014 do not let the players miss that refusing the Chancellor of the academy is a choice."));
c.push(H1("Stat Blocks"));
SB({ name: "Drill Automaton", meta: "Medium construct, unaligned",
  ac: "15 (natural armor)", hp: "27 (5d8 + 5)", speed: "30 ft.",
  str: 14, dex: 10, con: 12, int: 3, wis: 8, cha: 1,
  immune: "poison, psychic", condimmune: "charmed, exhaustion, frightened, poisoned",
  senses: "darkvision 60 ft., passive Perception 9", langs: "understands Old Imperial commands", cr: "1 (200 XP)",
  traits: [{ n: "Training Protocol", t: "The automaton cannot reduce a creature below 1 hit point unless that creature has attacked it since the start of its last turn; against downed or unconscious creatures it visibly checks its swing and re-targets. A creature that observes this in combat may make a DC 13 Wisdom (Insight) check to register that the behavior is deliberate." },
           { n: "Antique Joints", t: "If the automaton takes a critical hit, its speed is halved until the end of its next turn as servos grind." }],
  actions: [
    { n: "Multiattack", t: "The automaton makes two padded-mace attacks." },
    { n: "Padded Mace", t: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) bludgeoning damage." }
  ] }).forEach(x => c.push(x));
SB({ name: "Vault Hound", meta: "Medium beast, unaligned (compelled)",
  ac: "13 (natural armor)", hp: "26 (4d8 + 8)", speed: "40 ft.",
  str: 15, dex: 14, con: 14, int: 4, wis: 12, cha: 6,
  skills: "Perception +3, Stealth +4",
  senses: "darkvision 60 ft., passive Perception 13", langs: "\u2014", cr: "1 (200 XP)",
  traits: [{ n: "Pack Tactics", t: "The hound has advantage on attack rolls against a creature if at least one of the hound\u2019s allies is within 5 feet of the creature and the ally isn\u2019t incapacitated." },
           { n: "Binding Collar", t: "A bronze collar (AC 15, 10 hp, immune to poison and psychic damage) compels the hound\u2019s aggression. If the collar is destroyed, or removed from a restrained hound with a successful DC 13 Dexterity check, the hound immediately ends all hostility, becomes docile, and thereafter treats its liberators as pack. A DC 12 Intelligence (Arcana) check identifies the collar\u2019s runes as compulsion binding." }],
  actions: [
    { n: "Bite", t: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) piercing damage, and if the target is a creature it must succeed on a DC 12 Strength saving throw or be knocked prone." }
  ] }).forEach(x => c.push(x));
SB({ name: "Custodian Ooze", meta: "Large ooze, unaligned",
  ac: "6", hp: "50 (6d10 + 17)", speed: "15 ft.",
  str: 14, dex: 3, con: 16, int: 1, wis: 6, cha: 1,
  immune: "acid, slashing (splits it into two smaller custodians of half remaining hit points each, which continue cleaning)",
  condimmune: "blinded, charmed, deafened, exhaustion, frightened, prone",
  senses: "blindsight 60 ft. (blind beyond this radius), passive Perception 8", langs: "\u2014", cr: "2 (450 XP)",
  traits: [{ n: "Sanitation Directive", t: "The Custodian does not attack creatures unless attacked first or physically obstructed while consuming a mess. It pursues spills, decay, and debris with single-minded diligence, including any carried open food or unstoppered oil a creature is foolish enough to hold near it." },
           { n: "Transparent", t: "Even when in plain sight, a creature that hasn\u2019t witnessed the Custodian move must succeed on a DC 14 Wisdom (Perception) check to notice it." }],
  actions: [
    { n: "Dissolving Pseudopod", t: "Melee Weapon Attack: +4 to hit, reach 10 ft., one target. Hit: 10 (3d6) acid damage, and nonmagical leather or cloth worn by the target is stained pristinely clean." }
  ] }).forEach(x => c.push(x));
SB({ name: "Bartleby (Elder Mimic)", meta: "Medium monstrosity (shapechanger), neutral (food-motivated)",
  ac: "12 (natural armor)", hp: "58 (9d8 + 18)", speed: "15 ft.",
  str: 17, dex: 12, con: 15, int: 7, wis: 13, cha: 8,
  skills: "Stealth +5",
  immune: "acid", condimmune: "prone",
  senses: "darkvision 60 ft., passive Perception 11", langs: "\u2014 (recognizes roughly forty words, most of them foods)", cr: "2 (450 XP)",
  traits: [{ n: "Shapechanger", t: "Bartleby can use its action to polymorph into an object or back into its amorphous form. Its statistics are the same in each form. It reverts if it dies, or if offered something demonstrably delicious." },
           { n: "Adhesive (Object Form Only)", t: "Bartleby adheres to anything that touches it. A Huge or smaller creature adhered to it is also grappled (escape DC 13)." },
           { n: "Semi-Tame", t: "Bartleby releases any grapple and returns to furniture-shape on a stern word from any creature that has ever fed it, or on presentation of food. It has been fed by four generations of Undervault staff and considers grappling a form of enthusiastic greeting." }],
  actions: [
    { n: "Pseudopod", t: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) bludgeoning damage plus the Adhesive trait." },
    { n: "Bite", t: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) piercing damage plus 4 (1d8) acid damage." }
  ] }).forEach(x => c.push(x));
SB({ name: "Vault Warden", meta: "Large construct, lawful neutral",
  ac: "17 (plated bronze)", hp: "90 (12d10 + 24)", speed: "30 ft.",
  str: 20, dex: 8, con: 15, int: 6, wis: 12, cha: 5,
  saves: "Con +5, Wis +4",
  immune: "poison, psychic", resist: "bludgeoning, piercing, and slashing from nonmagical attacks",
  condimmune: "charmed, exhaustion, frightened, paralyzed, poisoned",
  senses: "darkvision 120 ft., passive Perception 14", langs: "Old Imperial, Common", cr: "5 (1,800 XP)",
  traits: [{ n: "Warrant Protocol", t: "The Warden stands down permanently if presented a valid Warrant of Access, or if the archivists\u2019 stand-down formula is spoken to it in Old Imperial (discoverable via the plinth inscriptions, DC 15 Intelligence (History), usable as an action)." },
           { n: "Yield Protocol", t: "When reduced below half its hit point maximum, the Warden grounds its weapon, kneels, and ends all hostility, announcing \u201CSUFFICIENT.\u201D Its purpose has always been to test, not to destroy." },
           { n: "Bulwark (Six-Character Parties Only)", t: "While at least one allied Drill Automaton is active, the Warden has a +2 bonus to AC." },
           { n: "Sentinel Stance", t: "When the Warden hits a creature with an opportunity attack, the creature\u2019s speed becomes 0 for the rest of the turn." }],
  actions: [
    { n: "Multiattack", t: "The Warden makes two halberd attacks." },
    { n: "Halberd", t: "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 15 (3d6 + 5) slashing damage." },
    { n: "Warding Sweep (Recharge 5\u20136)", t: "The Warden sweeps its halberd in a 15-foot cone. Each creature in the cone must succeed on a DC 15 Dexterity saving throw or take 14 (4d6) bludgeoning damage and be knocked prone; on a success, half damage and the creature is not knocked prone." }
  ],
  reactions: [
    { n: "Grounded Guard", t: "When a creature the Warden can see attacks the plinth or the Lector\u2019s Seal, the Warden moves up to half its speed toward the attacker without provoking opportunity attacks." }
  ] }).forEach(x => c.push(x));

c.push(H1("NPC Profiles"));
c.push(H3("Magister Corvin Dail, Master of Trials"));
c.push(P("Human, 60s, ex-legion drillmaster turned educator, House of the Sword to the bone. Speech pattern: parade-ground cadence, economy of words, praises by noting the absence of error (\u201CNobody died. Nobody split the group past recovery. Acceptable.\u201D). He designed the party\u2019s Proving personally and considers it his finest; his critique at the Reveal is the closest thing to a love letter he is capable of writing. Thread: Dail sat the Proving himself, forty years ago \u2014 and has never told anyone what his cohort found, or did not find, in the eastern stacks. If the party ever asks him about the door outside academy walls, over a drink, he goes quiet in a way that is not dismissal."));
c.push(H3("Chancellor Emeth Sorral"));
c.push(P("Half-elf, elegantly old, political to the fingertips and a genuine educator underneath it \u2014 the ordering of those two facts is the open question of his character. Speech pattern: commencement polish that drops away entirely when he is surprised, which almost nothing achieves. The Cold Door achieves it. Thread: Sorral knows something about the eastern stacks \u2014 at minimum that the wards fail there and that the Empress once requested, and was granted, unaccompanied access to the Undervault \u201Cfor the records inventory.\u201D Whether he connects those facts, and what he owes to whom regarding them, is deliberately unresolved: he can develop into ally, obstacle, or casualty as the campaign needs."));
c.push(H3("Instructor Liria Fenn"));
c.push(P("Human, 40s, House of the Craft \u2014 rhetoric, stagecraft, and the propaganda arts \u2014 and the academy\u2019s best actress by a distance no one contests. As \u201CMerla\u201D she will cost the party time, tears, and at least one hard argument; as herself she is warm, wickedly funny, and merciless in her post-Proving notes on exactly which lies each character believed and why. Thread: Fenn\u2019s classroom subject is, precisely, how institutions make people believe things \u2014 which makes her either the most useful ally the party could recruit for the campaign ahead, or the first person to notice when they start lying."));

c.push(H1("Loot and Found Rewards \u2014 Sessions Three\u2013Four \u2014 the Proving Below"));
c.push(ltable(["Find","Value / Effect"],[40,60],[
  ["Graduation grant & the Lector\u2019s Seal","Canon (300 gp; the Seal formalized below)"],
  ["Undervault staged finds (if searched)","Scroll of mage armor; scroll of comprehend languages \u2014 with the module\u2019s best DM note: Nyreeza\u2019s cipher is personal shorthand, not a language, and the scroll explicitly does NOT crack it (let a player discover this; it teaches how deep the Empress buried her trail)"],
  ["The survey team\u2019s kit","Fine cartographer\u2019s tools (25 gp) \u2014 and the faculty let the party keep them, which is its own message"],
  ["Bartleby\u2019s cheese","Priceless. Do not explain the cheese"]
]));
c.push(H1("Rewards and Advancement"));
c.push(P("Coin and goods: the 300 gp founding purse; the Lector\u2019s Seal housing as the company\u2019s official sealing-stamp; free graduate access to the academy\u2019s open collections for life (the restricted stacks remain Vell\u2019s to grant); and Bartleby\u2019s sincere affection, redeemable in the Undervault for morale purposes only. The charcoal rubbing of the Cold Door cipher \u2014 now the only copy in existence \u2014 is the arc\u2019s true treasure, and should be treated with exactly as much narrative weight as the party gives it. XP for tables using it: roughly 2,300\u20132,900 across both sessions depending on route and resolutions (award full value for the bloodless solutions; they are the harder path and the better marks). Milestone: 5th level when the Proving concludes and the arc closes."));

c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "~", size: 24 })] }));
c.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u201CSo the school sent you down after all. And you paid attention to what was cold. Good. Now sit, children, and tell me about the door \u2014 and I will tell you why the Empress\u2019s hand shakes in that cipher.\u201D", italics: true })] }));

const doc = new Document({
  numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  styles: {
    default: { document: { run: { font: "Georgia", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Georgia", color: "3B2F2F" }, paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 27, bold: true, font: "Georgia", color: "3B2F2F" }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, italics: true, font: "Georgia", color: "3B2F2F" }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } }
    ]
  },
  sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children: c }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/claude/QS_Sessions_3-4_The_Proving_Below.docx", buf);
  console.log("Written.");
});
