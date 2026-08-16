const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat } = require('docx');
const fs = require('fs');

const P = (text, opts = {}) => new Paragraph({ spacing: { after: 200 }, ...opts, children: [new TextRun({ text, ...(opts.run || {}) })] });
const PS = (segs, opts = {}) => new Paragraph({ spacing: { after: 200 }, ...opts, children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i })) });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const BULLET = (segs) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 }, children: segs.map(s => new TextRun({ text: s.t, bold: !!s.b, italics: !!s.i })) });
const B = (lead, rest) => PS([{ t: lead + " ", b: true }, { t: rest }]);
const BUL = (lead, rest) => BULLET(lead ? [{ t: lead + " ", b: true }, { t: rest }] : [{ t: rest }]);
const { Table, TableRow, TableCell, WidthType, ShadingType } = require('docx');
const cell = (text, opts = {}) => new TableCell({ width: { size: opts.w || 20, type: WidthType.PERCENTAGE }, shading: opts.head ? { type: ShadingType.CLEAR, fill: "E4DCCB" } : undefined, margins: { top: 50, bottom: 50, left: 90, right: 90 }, children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text, bold: !!opts.head, size: 18 })] })] });
const row = (cells) => new TableRow({ children: cells });
const table = (headers, widths, rows) => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [ row(headers.map((h, i) => cell(h, { head: true, w: widths[i] }))), ...rows.map(r => row(r.map((v, i) => cell(v, { w: widths[i] })))) ] });


const children = [];

children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: "The Qilvayas Symphony", bold: true, size: 44 })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "A Player's Guide to the Empire", italics: true, size: 26 })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "~", size: 24 })] }));
children.push(PS([{ t: "\u201CI gaze upon the night sky admiring the stars strewn across Heaven\u2019s field. Each one a testament of power, its light piercing through the void to shine upon us. And now to our dawn light I summon you. Lord, have mercy upon us sinful children of Zhuvedus. Give us your light, Lord\u2026and give me my destiny. I am Qilvayas, Emperor of the Zhuvedians. We are the Kin of Great Timberwolf.\u201D", i: true }]));
children.push(PS([{ t: "\u2014Prayer of Qilvayas on the eve of his coronation", i: true }], { spacing: { after: 400 } }));

children.push(H1("A Note on This Document"));
children.push(P("This is a companion for players, not the DM\u2019s working sourcebook. It collects what an educated person in the Empire of Zhuvedus \u2014 particularly a final-year student of the Imperial Academy \u2014 would generally know: the shape of the world, its history, its politics, its faith, and the figures who hold power in it. It leaves things out on purpose. Some mysteries in this world are mysteries to the characters who live in it, and this guide is written to respect that \u2014 you won\u2019t find spoilers here, and you shouldn\u2019t expect to. Treat it the way your character would treat a good education: a solid foundation, not the whole story."));

children.push(H1("Campaign Overview"));
children.push(P("The Qilvayas Symphony is a story of imperial ambition, prophetic omens, and moral complexity, set against the backdrop of a crumbling empire. Drawing on the tensions of real history\u2014particularly emperors who sought to restore a fading glory\u2014this is a world exploring legacy, power, the cost of idealism, and the gap between the dream of unity and the reality of a fractured world."));
children.push(P("Player characters are final-year students at the prestigious Imperial Academy of the Lupine Throne, completing their field exercises and planning their futures as independent adventurers. What happens next is for the table to discover."));

children.push(H1("Historical Background"));
children.push(H2("The Height of Empire"));
children.push(P("At its zenith, the Empire of Zhuvedus spanned nearly an entire continent. United under the Lupine Throne and guided by the principles of the Lupine Matron, the empire represented civilization, law, and order. The Golden Tablets\u2014sacred legal codes established by the empire\u2019s forefathers\u2014formed the foundation of Zhuvedian governance and culture. Trade flourished along imperial roads, justice was administered by trained magistrates, and the imperial legions defended the borders against external threats."));
children.push(P("The imperial capital, Aenodira, seat of the Lupine Throne, was the beating heart of this civilization\u2014a center of learning, culture, and power that drew the ambitious and talented from across the realm."));
children.push(H2("Two Centuries of Decline"));
children.push(P("The empire\u2019s decline was not sudden but gradual\u2014a slow erosion over two hundred years. Internal strife between noble houses weakened central authority. Corruption spread through the bureaucracy as distant provinces found ways to avoid imperial taxation and oversight. Military expeditions to reclaim lost territories or suppress rebellions failed, draining the treasury and damaging the legions\u2019 reputation. External powers, sensing weakness, pressed against the borders and even seized imperial territory."));
children.push(P("Most devastatingly, the empire fractured. What had been provinces became semi-independent \u201Cnations,\u201D each ruled by ambitious warlords, merchant councils, or noble houses who once swore fealty to the throne but now pursue their own interests. Some maintain the fiction of imperial loyalty while ignoring imperial law. Others have openly declared independence. Still others war among themselves."));
children.push(P("The imperial capital remains, and the Lupine Throne is still occupied, but the reach of imperial authority has shrunk dramatically. The empire exists more in memory and aspiration than in reality \u2014 until now."));

children.push(H1("The Empire Today"));
children.push(P("The empire today is a shadow of its former self, yet it persists. Aenodira and its surrounding territories remain under direct imperial control, and several regions still recognize the Lupine Throne\u2019s authority\u2014some genuinely, others opportunistically."));
children.push(B("Border Lords and Regional Powers:", "Former provincial governors, military commanders, and noble houses now rule territories as de facto independent states. Their relationship with the throne varies\u2014some maintain nominal loyalty while ignoring imperial edicts, others have declared independence outright, and a few actively work against reunification."));
children.push(B("Merchant Republics:", "Wealthy trading cities that broke away to avoid imperial taxation, now governed by councils of merchants and guild masters. They prefer the current disorder, which lets them play different powers against each other for commercial advantage."));
children.push(B("Warlord Territories:", "Regions held by military strongmen who rose to power during the empire\u2019s collapse. Some style themselves protectors of order; others are little better than bandits with armies."));
children.push(B("Imperial Loyalists:", "Territories that still genuinely support the throne, out of tradition, religious conviction, or pragmatic belief that a restored empire offers better stability than the current chaos."));
children.push(P("The borders are fluid and contested. Alliances shift, minor wars flare and sputter out, and ambitious lords constantly scheme for advantage. Into this volatile situation steps the young Emperor Qilvayas, with his vision of restoration."));

children.push(H1("The Atlas \u2014 Realms and Regions"));
children.push(B("The Crownlands:", "The imperial core \u2014 Aenodira, its river valley, and the districts within a week\u2019s march \u2014 under direct rule and the only place imperial law functions at full strength. Capital culture runs on the race-days of the Long Course, where the city\u2019s two great factions \u2014 the Golds and the Greys, named for the stone of the walls they claim \u2014 turn sport into politics and politics into sport."));
children.push(B("The Ostmark:", "The eastern march, held by thin legion garrisons and thick tradition. Loyalist by conviction in the towns and by inertia in the countryside. The march\u2019s pride is Marshal Gavric Dane, the young commander who brought a lost wolf-standard home after sixty years lost to history."));
children.push(B("The Suthmark:", "The southern breadbasket, genuinely loyalist and deeply devout \u2014 the Matron\u2019s faith runs older and plainer here than in the capital: harvest processions, field-shrines, saints\u2019 days kept by planting calendars. Governed by Duchess Emerenn Vasq, Velmareth-born and iron beneath the mourning silk. The south carries two scars it does not discuss with outsiders: the Vintage Night, six years past, and the hill country around Castle Greywell, where servant girls have a way of not coming home."));
children.push(B("Principality of Tarnovar:", "A highland nation in the far west, openly independent for a century and pointedly uninterested in reunification. Tarnovari culture is built on the given word: oaths are sworn on standing stones rather than gods, oath-breaking is the one unforgivable crime, and their oldest ballads mourn a betrayed lord whose story no imperial scholar has ever bothered to trace. Their proverb for treating with the throne: \u201CNever again the wolf\u2019s word.\u201D Ruled by the aging, canny Voivode Ysavet Morn \u2014 whose word is absolute everywhere except the Eastmarch, where her kinsman Ban Dregan Morn keeps the border with the Brekelands by methods she has never sanctioned and never stopped."));
children.push(B("Free City of Velmareth and the Delta Compact:", "The great merchant republic of the river delta and the league of trading towns in its orbit. Rich, ostentatiously neutral, and quietly committed to the fractured status quo \u2014 disorder is margin."));
children.push(B("The Brekelands:", "The broken middle-west: a patchwork of warlord holdings where imperial administration simply stopped. The local trouble is the Granary War between warlords Bettra Skarn and Ilmarch Voss, which has produced refugees and burned villages this season. From the west, Duke Garvin Norr absorbs holding after holding into his Reckoning Book; along the eastern hills runs Ban Dregan\u2019s Fence, which no Brekeland company raids past twice."));
children.push(B("The See of Orlath:", "A breakaway patriarchate in the north claiming the purer doctrine of the Matron \u2014 founded nearly sixty years ago by Saint-Regent Olvesa the Reconciled. Orlath recognizes neither the Matriarchate\u2019s authority nor the Office of Omens\u2019 monopoly on the divine will, and refugees of conscience drift there still."));
children.push(B("Kingdom of Ardven:", "The young power of the far north: a dozen quarrelsome kingdoms and clan-lands hammered into one crown over fifteen years by King Karvel. Ardven is expansionist, literate, and increasingly confident \u2014 Karvel plants monastery schools the way other kings plant fortresses."));
children.push(B("The Skellvard:", "Sea-lords raiding the imperial coast in growing strength \u2014 but raiders is only half the truth. The Skell ship-clans are a displaced people, pushed from their northern harbors by Ardven\u2019s expansion, led by Sea-King Aldrec the Landless, who once served the empire and was cheated for it."));
children.push(B("The Duchy of Normere:", "The iron surprise of the west coast: a once-minor duchy forged into the most efficient state in the fractured empire by Duke Garvin Norr, the Bastard of Normere. Normere\u2019s instruments are famous and feared in equal measure \u2014 the Reckoning Book, a census of every hide of land and head of livestock the Duke rules, and the personal oath every landholder swears to Norr himself, bypassing all intermediate lords."));

children.push(H1("The Lupine Matron and the Imperial Faith"));
children.push(P("The Lupine Matron is the divine patron of the Zhuvedian Empire, represented as a great wolf\u2014wise, protective, and fierce. According to Zhuvedian theology, the Lupine Matron gave the empire\u2019s people their core virtues: loyalty, honor, wisdom, and the strength to endure hardship. The phrase \u201CWe are the Kin of Great Timberwolf\u201D references this divine connection and appears throughout imperial prayer and ceremony."));
children.push(P("The Matron\u2019s worship long predates the empire that now venerates her. Zhuvedian doctrine holds that she has guided many champions and many peoples across a span of time far longer than any dynasty\u2019s recorded history. Whether Zhuvedus, the empire\u2019s founder, ever attained true divinity himself is a matter of genuine and ongoing theological dispute:"));
children.push(B("Church Doctrine:", "The Church of the Lupine Matron teaches that Zhuvedus was a mortal hero, chosen and favored by the Matron but never divine himself\u2014virtuous in his triumphs, flawed in his failures, and mortal in his death. To the Church, only the Matron is properly divine."));
children.push(B("The Imperial Cult:", "A smaller, older priesthood tied to the imperial household teaches otherwise\u2014that Zhuvedus was elevated to divine or semi-divine status upon his death, and that the ruling bloodline carries a literal spark of his apotheosis. This doctrine underwrites the throne\u2019s claim to hereditary legitimacy."));
children.push(P("The capital Church is governed by the Matriarchate \u2014 Matriarch Ilsevet Corvane as the Voice of the Matron in Aenodira \u2014 advised by the Synod of the Grey, a council of senior clergy. Beneath them: the seminaries of the Sanctum, the parish structure reaching into every loyalist district, and the Office of Omens, headed by Prelate Sarvin Odell, which claims sole legal authority to receive, examine, and rule on visions, portents, and claims of divine contact. Independent interpreters are known to exist, operating quietly outside the Office\u2019s sanction \u2014 tolerated uneasily, never fully accepted, found (if at all) through networks rather than any public sign."));
children.push(P("The imperial cult\u2019s formal body, the Keepers of the Ascent, is small \u2014 perhaps forty priests, led by Hierophant Malzeth Corr, maintaining the dynastic shrine within Highcourt. The Church tolerates their existence, and both institutions understand exactly why."));

children.push(H1("Magic, As Lived"));
children.push(P("Every educated Zhuvedian knows the shape of magic in the empire, even if they cannot cast a cantrip. Folk belief \u2014 old, universal, and taken seriously even by people who claim not to \u2014 holds that sworn words have weight: an oath is a real thing once spoken, stone holds what air forgets, and there are places where too many broken promises have soured the ground itself. The Church neither confirms nor mocks this. The Church, notably, treats vows as sacraments."));
children.push(B("The Sanction:", "Divine magic flows from the Matron, and the Church licenses its lawful practice \u2014 a sanctioned cleric carries a pewter warrant-medal, and an unsanctioned healer in Church lands can expect a visit from the Office of Omens. The See of Orlath issues its own rival sanction, and the awkward, carefully undiscussed fact at the center of the schism is that the Matron\u2019s power answers both."));
children.push(B("Chartered Thaumaturgy:", "Arcane magic is a licensed profession. A Chartered Thaumaturge of the House of the Craft holds papers enumerating what they may practice; the Charter is prestige, employability, and legal cover in one document. Village hedge-mages work small magic below the Charter\u2019s notice \u2014 tolerated exactly as long as nothing goes wrong \u2014 and Rivergate sells what Rivergate sells."));
children.push(B("The Old Observance:", "The Matron\u2019s worship before there was an empire to license anything: field-shrines, first-fruits, the wolf-watch on winter roads. Druids and rangers keep it. The Church\u2019s official position is studied non-comment."));
children.push(B("The Sworn and the Kindled:", "Warlocks \u2014 the Sworn \u2014 are feared in Church lands, because a pact is an oath made to something that answered, and nobody licensed the something. Sorcerers \u2014 the Kindled \u2014 carry power without study, which the chartered call cheating and the Church calls a question. Velmareth, characteristically, calls both a market."));
children.push(B("The Night Liturgy:", "The Matron\u2019s iconography is the She-Wolf of the Night Sky \u2014 the moon her watching eye, the stars her pack, dawn her gift. The great liturgies are sung at night. The Emperor\u2019s coronation prayer, addressed to the stars, is theologically exact."));
children.push(B("The Wolf-Shape:", "Church doctrine holds lycanthropy to be profanation \u2014 the Matron\u2019s image stolen by a curse \u2014 and wolf-trials are a recognized (and recognizably abused) proceeding. Older folk belief holds that sometimes the shape is her mark, and that the difference shows in what the changed one does under the moon. Do not repeat this near clergy."));
children.push(B("The Packlaw:", "Church teaching holds that the Matron leads her pack by wisdom and endurance, not raw strength \u2014 and that a pack's survival runs through its mothers as often as its sires. It's why nobody in the empire remarks on a woman holding a duchy, a temple, or an army: settled authority answers to this doctrine as a matter of course. Authority still being fought for tends to skew male instead \u2014 a pack doesn't easily hand its trust to what hasn't yet proven it belongs."));
children.push(B("Marriage and the Denmother's Choice:", "A wedding vow is a real, binding oath, sworn before a Church witness or, in Tarnovar, at the standing stones \u2014 which means an unrepaired betrayal of it is taken very seriously indeed. Divorce exists, but it's a formal Release, not just a parting of ways. Titles and thrones don't simply pass to the eldest child: a ruling parent names their heir openly, and can change that naming during their own lifetime. It makes succession a live question in more than one court right now."));
children.push(B("Wildshape:", "Willed shape is not cursed shape \u2014 the wolf-trial has no claim on a druid\u2019s wolf-form, and doctrine says so plainly. Folk opinion goes further: villages that would never touch a stray wolf will touch a druid who\u2019s just changed back, for luck. The Office of Omens, naturally, still likes to know who can do it."));
children.push(B("The Wolf-Price:", "Self-defense is a real legal defense \u2014 report it to a magistrate within three days and the law is satisfied. The law was never the whole of it, though. Older custom says a dead wolf still leaves a debt, paid in coin or labor to whoever keeps the local shrine, guilt or no guilt. Pay it promptly and the story that follows you is a good one."));
children.push(B("The Chosen:", "A wolf that stays with you by its own will is read as the Matron\u2019s visible favor \u2014 expect blessings, nods, and pointed questions. A ranger whose beast-bond is a wolf lives this daily, and is treated accordingly \u2014 touched, in the provinces; noted, in the capital. A wolf caged or collared is profanation; no honest market in the empire sells a wolf-cage. Feed wild ones at the treeline if you must, and never call them in."));
children.push(B("Death and the Vigil:", "No Zhuvedian body goes into the ground, the water, or the stone before a full night\u2019s Vigil, watched and lit \u2014 that part never changes. Everything after does: the capital interns its dead in the Bone Galleries beneath the Old Forum (the public stairs serve the upper galleries; the deep levels closed generations ago), the Suthmark times burial to the harvest calendar, Tarnovar inherits a dead kinsman\u2019s oaths more than their body, and Velmareth sends its dead to the reed-sea on lit barges. Every town of any size keeps a Vigil Hall for the watching part."));
children.push(B("Relics and Mercy:", "Serious magic in the empire is mostly holy: the Church\u2019s almonries sell sanctioned healing at honest prices, and the great relic-treasuries hold wonders with provenance \u2014 a saint\u2019s femur in a mace-head, a standard that has never fallen. Arcane items are scarce, chartered, and papered. Rivergate\u2019s relic-stalls are almost always selling fakes. Almost."));

children.push(H1("Peoples of the Empire"));
children.push(B("The Founder\u2019s Blood:", "The dynasty is Drow \u2014 the old blood of the founding, the Matron\u2019s first-favored children of her night, and nearly gone: a scattering of ancient houses claiming distant kinship, and the throne itself. A Drow stranger in the empire is a sensation, and will be read as dynastic kin, dynastic claimant, or something nobody has words for."));
children.push(B("Humans:", "The great majority everywhere, in proud regional cultures \u2014 Zhuvedians, Ostfolk, Suthfolk, Tarnovari, Brekelanders, Velmarenes, Orlathines, Ardvenners, the Skell, Normerines."));
children.push(B("Dwarves:", "The Stonesworn are a third of Tarnovar and fully Tarnovari; hill-dwarf families work the Suthmark\u2019s eastern hills; the capital\u2019s masons\u2019 guild is theirs."));
children.push(B("Elves:", "Wood elves keep the deep forests \u2014 Tarnovar\u2019s Old Wood, the Ardven wilds \u2014 and the eldest ballads. High-elf blood persists in a handful of faded capital houses, more portraits than people now. Half-elves are the empire\u2019s courtier class and Velmareth\u2019s natural children."));
children.push(B("Half-Orcs:", "Respected legion veteran stock of the Ostmark marches \u2014 families who earned the rolls the hard way."));
children.push(B("Halflings:", "The river-trade people: Coppergate\u2019s copyists and landlords, the barge families, Velmareth\u2019s middle guilds. Collectively the best-informed civilians in the empire."));
children.push(B("Gnomes:", "The House of the Craft\u2019s natural constituency \u2014 instrument-makers, ward-wrights, archival engineers."));
children.push(B("The Marked:", "Tieflings \u2014 bloodlines said to carry an ancestor\u2019s bargain made flesh. Feared in Church lands, filed by the Office, tolerated in Velmareth and Rivergate at the usual rates."));
children.push(B("The Sarkanni:", "Dragonborn mercenary companies from across the southern sea \u2014 superb, expensive, and contract-scrupulous: a Sarkanni company has never broken terms in living memory, which in this empire is remarked upon."));
children.push(B("The Wolves:", "Sacred everywhere. Killing one is terrible luck and worse law. Their behavior is read the way other lands read birds."));

children.push(H1("The Regions: What a Traveler Sees"));
children.push(B("The Crownlands:", "The Ostrun\u2019s terraced valley \u2014 cypress windbreaks, poplar roads, the capital\u2019s three walls in river haze. The Garrison keeps the empire\u2019s last three griffons; the riders\u2019 hall keeps every empty saddle oiled."));
children.push(B("The Ostmark:", "Big-sky plains breaking into wooded hills, watch-forts on the heights (many empty \u2014 travelers give the failed ones a wide berth after dark, and are right to). Wolf packs are read for omens; ankhegs plague the grain flats."));
children.push(B("The Suthmark:", "Gold grain, vineyard terraces, chalk downs \u2014 and eastward, the grey Greywell hills, where the light arrives late. Harvest effigies are shaped like ankhegs, for good reason. The fey of the old orchards are real, and the Church politely does not discuss them."));
children.push(B("Tarnovar:", "The empire\u2019s deep wilderness: montane mist-forest, standing-stone rings on the bald summits, and the Old Wood \u2014 the largest unbroken forest in the world, where travelers\u2019 time is said to run strange. Owlbears are a fact of the roads. So is hospitality: guest-right in Tarnovar is sacred, sworn, and absolutely not to be tested."));
children.push(B("Velmareth & the Delta:", "Reed-seas and the lagoon city on its ten thousand pilings \u2014 bridges, salt-stained marble, money. Giant crocodiles own the reed-sea; the Compact pays a \u2018channel-toll\u2019 to something in the outer waters and does not describe it in the ledgers."));
children.push(B("The Brekelands:", "Broken hill country \u2014 wild hedgerows between burned granges, roads that fork around dead villages. Gnoll packs follow the burnings; the old folk say gnolls are what hunger prays to. Wyverns take cattle and, occasionally, tax-collectors, to no one\u2019s great grief."));
children.push(B("The See of Orlath:", "Fell-country pilgrim roads, prayer-cairns at every false summit, the mountain city\u2019s carved galleries. Orlath feeds the winter wolves at pilgrim stations \u2014 the Matron\u2019s northern honor guard, they say \u2014 a practice the Sanctum calls heresy and the wolves call dinner."));
children.push(B("Kingdom of Ardven:", "Fjords and pine steeps, longhouse towns turning to slate-roofed monastery burghs \u2014 the north mid-transformation. The high ranges are dragon-country: white wings over the fells, and ranger companies whose silence about what else is up there is its own answer."));
children.push(B("The Skellvard:", "Not a land \u2014 the cold sea, island anchorages, and the clan-fleets. Beneath the Weeping Strait dwells the Saltmaw, to which the clans pay the salt-tithe; its interventions are weather to them. Skell kings are buried under rivers, in secret."));
children.push(B("Normere:", "Rain-lashed headlands and drained polders behind the Duke\u2019s dikes; slate towns of ruthless neatness. The coast drills monthly against merrow and sahuagin, attendance recorded. The Weld is on the maps and off the itineraries; do not ask locals about it twice."));


children.push(H1("Emperor Qilvayas and the Lupine Throne"));
children.push(H2("The Young Emperor"));
children.push(P("Qilvayas is a 110-year-old Drow\u2014young by the standards of his long-lived race, but old enough to rule without a regent. He ascended to the Lupine Throne following the mysterious disappearance of his mother, Empress Nyreeza. Raised within the imperial palace, he received the finest education available in history, law, military strategy, theology, and statecraft, and studied the empire\u2019s decline intimately."));
children.push(P("His youth gives him energy and idealism, but also makes him somewhat untested. He has never commanded armies in the field, never navigated the brutal realities of imperial politics at the highest level, and never faced the compromises that restoring an empire might demand. His vision is clear, his ambition genuine, and his belief in the righteousness of his cause unshakeable."));
children.push(H2("The Man Behind the Crown"));
children.push(P("In person, Qilvayas is precise, courteous, and quietly relentless. He speaks softly and in the cadences of law\u2014clauses, provisos, careful definitions\u2014and he never raises his voice. He works brutal hours and sleeps little even by Drow standards. His court has learned to read three habits: he walks the Long Course alone at dawn twice a week; he answers one petition from a commoner personally each day, chosen at random from the pile (the Daily Draw); and he has never, in three years, entered his mother\u2019s study. It is cleaned weekly, by his order. Nothing in it may be moved."));
children.push(H2("The Vision of Restoration"));
children.push(P("Qilvayas\u2019s plan for imperial restoration rests on several pillars:"));
children.push(B("Legal Reform:", "He seeks to rewrite the Golden Tablets, creating a new comprehensive legal code\u2014the \u201CZhuvedian Laws\u201D\u2014that will modernize governance, eliminate corruption, and provide a unifying framework for all imperial territories. Their promulgation is anticipated this coming Solacre, some nine months out."));
children.push(B("Administrative Revival:", "He is rebuilding imperial institutions that have atrophied or disappeared. The Imperial Academy is central to this effort."));
children.push(B("Diplomatic Reunification:", "Where possible, Qilvayas prefers to bring fractured territories back into the fold through negotiation, offering stability, legal protection, and the prestige of the empire in exchange for renewed loyalty."));
children.push(B("Military Force When Necessary:", "While he prefers peaceful methods, Qilvayas is prepared to use force against those who threaten imperial stability or refuse reasonable terms."));
children.push(H2("Law and Bound Labor"));
children.push(P("Zhuvedian law is old and clear on the worst of it: owning a person outright is illegal and doctrinally blasphemous throughout the empire \u2014 the same principle that makes a sworn oath binding also makes chattel slavery incoherent, since the law holds that only a will capable of making a vow can be owned by no one but itself. What the law does recognize is more complicated: oath-bound personal service (the foundation of Duke Norr's rule in Normere), ordinary time-limited debt-bondage, and hostage-diplomacy \u2014 a full guest's legal standing, not bondage at all, and the basis for the Academy's own admission practices. The empire's real trouble isn't the law; it's that the law hasn't reached every corner of the fractured territories in two hundred years, and the Brekelands are where that gap shows worst."));
children.push(H2("The Mystery of Empress Nyreeza"));
children.push(P("Qilvayas\u2019s mother, Empress Nyreeza, disappeared three years ago under circumstances that remain unclear. She was the one who began revitalizing the Imperial Academy and took the first steps toward institutional reform. Her sudden absence created a power vacuum that Qilvayas filled, but it also left questions the capital still asks quietly: Was her disappearance natural, political, or something more sinister? Did she flee, was she taken, or is she dead? Does the Emperor know more than he admits? No answer has ever been confirmed. Her loss landed the harder because of what she had been. For a line as long-lived as the Founder\u2019s Blood, the Lupine Throne has been an unlucky seat: within living memory its rulers turned over surprisingly fast \u2014 fever, faction, a pair of child-heirs and the regents who ruled for them \u2014 and Nyreeza, holding it in her own right until a grown son could follow her, was the steadiest the empire had known in generations. That the throne now rests on Qilvayas alone, with no heir yet named, is a thing the capital discusses only in low voices."));
children.push(H2("The Court"));
children.push(B("Lord Chamberlain Vareth Kessin:", "Gatekeeper of access to the Emperor. A career bureaucrat who has outlasted two regents; served Nyreeza first."));
children.push(B("Archjurist Senna Vhal:", "Head of the Law Commission drafting the Zhuvedian Laws \u2014 brilliant, exhausted, and the person who actually holds the pen on the empire\u2019s new foundation."));
children.push(B("Legate Bruvasca Thorne:", "Commander of the Palatine Guard, and by any honest reckoning the finest field commander the throne possesses. Her name was made at the Ashline, where she broke a Skellvard raid with eight hundred men against five times that number. The soldiers love her; the court has never quite decided whether her loyalty is a fact or a fortune it hasn\u2019t had to spend. Her husband Bram, a retired quartermaster, manages her correspondence and is widely underestimated."));
children.push(B("Mistress Averil Shen:", "Keeper of the Bureau of Correspondence \u2014 small, underfunded, and, by reputation the court prefers not to discuss too loudly, rather more than a postal service."));
children.push(B("Hierophant Malzeth Corr:", "Head of the imperial cult. Present at court for every rite and most councils."));

children.push(H1("The Powers of the Fractured Empire"));
children.push(P("The rulers and commanders who define the territories of the Atlas."));
children.push(H3("Sea-King Aldrec the Landless \u2014 Lord of the Skellvard Clans"));
children.push(P("Aldrec, in his fifties now, served the empire as a young man, and for twenty years after \u2014 Skell oarsmen and shock-fighters were cheap, and at the Weeping Strait, twenty years ago, an imperial admiral spent three thousand of them to save his own squadrons and logged it as victory. Aldrec survived, was denied the coastal command he had been promised, and went home to find the fjords already under pressure from the northern crowns as they then were; Karvel\u2019s consolidation of them into Ardven, some five years later, only finished it. He has led the ship-clans ever since as a king without a country, raiding the coast of the empire he would rather serve. His demands have never changed: a coastal march to hold, a title to hold it by, and his people\u2019s names entered in the empire\u2019s rolls as subjects rather than vermin. He speaks fluent, formal Imperial \u2014 better than most courtiers\u2019 \u2014 which unsettles people who expected a savage. Skell kings are buried under rivers, in secret, so that no enemy may ever stand on a Skell king\u2019s grave."));
children.push(H3("Marshal Gavric Dane \u2014 the Young Wolf of the Ostmark"));
children.push(P("Not yet thirty-five and already the most beloved soldier in the empire: the man who led the expedition that recovered the wolf-standard of the Ninth from the Brekelands little more than a year ago, nearly sixty years after the Silvasse Disaster swallowed three legions and every banner they carried. He weeps openly at soldiers\u2019 funerals, remembers the names of privates\u2019 children, and has never once expressed an ambition beyond his command. The legions call him the Young Wolf. The court hears that name and thinks of succession."));
children.push(H3("Ban Dregan Morn \u2014 Warden of the Eastmarch, Lord of the Fence"));
children.push(P("Kinsman to Voivode Ysavet Morn, sent to the capital academy as a hostage-student in his youth, returned to Tarnovar with perfect Imperial manners and something broken behind the eyes. For thirty years he has held the Eastmarch and made it the safest road in the fractured west by a method the whole continent knows: the Fence, a mile of stakes along the border hills, and on the stakes, oath-breakers. Merchants bless his name. Peasants cross the border toward him. The Voivode has never sanctioned the Fence and never dismantled it."));
children.push(H3("Duchess Emerenn Vasq, n\u00e9e Meldane \u2014 the Dowager of the Suthmark"));
children.push(P("Born to Velmareth\u2019s great Meldane banking house, married young into the Suthmark\u2019s ducal line, widowed at forty some fifteen years ago, and ruler in all but name ever since through her sons. The devout south never fully accepted the merchant\u2019s daughter, and she never asked it to; she governs through the Garland, her web of ladies-in-waiting, priests\u2019 housekeepers, and wine-factors, which knows what the Suthmark is thinking before the Suthmark does. Six years ago, Orlathine congregations were massacred in three Suthmark towns during the harvest festival \u2014 the Vintage Night. What she ordered, and what it became, are not agreed upon even now; she has never corrected the record, and the south fears her for it."));
children.push(H3("Saint-Regent Olvesa the Reconciled \u2014 Founder of the See of Orlath"));
children.push(P("Sixty years ago she was the young widow-regent of a northern principality whose lord had been murdered under guest-right \u2014 and what she did about it is still told in the north in four terrible movements. Then, vengeance complete, she walked into a mountain shrine of the Matron and did not come out for a year. What came out was the woman the north now calls the Reconciled: founder of the See of Orlath and the nearest thing the fractured world has to a living saint \u2014 a title she accepts with visible distaste."));
children.push(H3("King Karvel of Ardven"));
children.push(P("Grandson of Saint-Regent Olvesa, king of a realm he assembled himself: fifteen years of war, marriage, and administration that turned a dozen northern crowns and clan-lands into Ardven. Karvel is broad, loud, semi-lettered and obsessed with letters \u2014 he reads slowly and has founded forty monastery schools; he sleeps four hours and audits his reeves personally. This coming Solacre, if nothing intervenes, his grandmother\u2019s church intends to crown him Emperor of the True Rite \u2014 a second empire, sanctified by a second church, in direct denial of the Lupine Throne\u2019s mandate."));
children.push(H3("Duke Garvin Norr \u2014 the Bastard of Normere"));
children.push(P("Baseborn son of the old Duke of Normere, acknowledged but never legitimized, who survived three assassination attempts before the age of twenty, took Normere in fact some twenty years ago, and has spent the two decades since building the most ruthlessly administered state west of Aenodira. Norr\u2019s conquest of the Brekelands proceeds warlord by warlord, and it is not pillage \u2014 it is absorption: every conquered holding is surveyed into the Reckoning Book, every landholder swears a personal oath to Norr himself, and every obligation is recorded, audited, and enforced to the letter. Where submission is refused \u2014 the Harrowing of the Weld, four years ago, ended a district\u2019s rebellion by ending, for a generation, the district. He styles his conquest \u201Cthe restoration of lawful administration,\u201D which has the special insolence of being partly true."));

children.push(H1("The Imperial Academy of the Lupine Throne"));
children.push(H2("Purpose and History"));
children.push(P("The Imperial Academy was founded during the empire\u2019s golden age to train the administrators, officers, and specialists needed to govern and defend such a vast realm. Empress Nyreeza began its revival in the years before her disappearance; Emperor Qilvayas has continued and expanded the effort, seeing the academy as essential to his restoration plans."));
children.push(P("Today, multiple Imperial Academies exist across loyalist territories, but the capital academy in Aenodira remains the most prestigious. Graduation from it opens doors that provincial schools cannot match."));
children.push(H2("Admission and Student Body"));
children.push(P("The empire maintains a policy of universal education\u2014in theory, any subject can seek admission. In practice, admission operates through a lottery that is less fair than it appears: wealthy families make generous \u201Cdonations,\u201D local lords ensure favored prot\u00E9g\u00E9s are selected, and some slots are reserved for hostage-diplomacy arrangements. But enough legitimate lottery winners make it through that the system maintains its legitimacy, and the student body remains genuinely diverse \u2014 privilege beside scholarship, hostages beside true believers, ambitious commoners beside nobility."));
children.push(H2("The Three Houses"));
children.push(H3("House of the Sword"));
children.push(P("Trains officers, strategists, and those serving in martial capacities: tactics, logistics, leadership, fortification, and command. Typical classes: Barbarian, Fighter, Monk (Paladins of a martial bent may also claim this house)."));
children.push(H3("House of the Seal"));
children.push(P("Administration, law, theology, and governance \u2014 the civilian machinery that keeps an empire functioning: imperial law, doctrine, rhetoric, diplomacy, fiscal policy, and record-keeping. Typical classes: Paladins with a doctrinal calling, and Clerics of a pastoral focus."));
children.push(H3("House of the Craft"));
children.push(P("The most diverse house, for anyone whose skills serve the empire without fitting neatly into command or administration \u2014 engineering, medicine, alchemy, cartography, codes, arcane theory, and trade. Most arcane and divine casters study here, magic being treated as a specialized skill like any other. Typical classes: Artificer, Bard, Cleric, Druid, Ranger, Rogue, Sorcerer, Warlock, Wizard."));
children.push(P("Cross-training between houses is common and often required \u2014 the empire needs soldiers who understand law, administrators who respect military realities, and specialists who can work with both."));
children.push(H2("Dormitories and Program Structure"));
children.push(P("Students live in mixed residential halls by year and cohort rather than by house, deliberately building cross-disciplinary friendships and rivalries alike. The standard program lasts four years, culminating in a fourth-year field exercise \u2014 a real-world assignment, often in small mixed-house teams, that proves a student can apply their training outside the academy\u2019s walls."));
children.push(H2("Life After the Academy"));
children.push(P("All subjects of the empire are expected to serve, though enforcement is uneven in the fractured realm. Graduates take direct imperial commissions, return home to regional service, join guilds and civic organizations, or strike out independently as adventurers, mercenaries, and specialists \u2014 often reasoning that protecting imperial citizens and interests counts as service enough."));

children.push(H1("Aenodira \u2014 the Imperial Capital"));
children.push(P("Aenodira sits where the Ostrun bends into a wide horseshoe against its northern approach, grown ring by ring to fill everything the river\u2019s curve allows and then some. Three walls circle it, each raised in a different age of the empire and each still wearing the color of the age that built it: the Founder\u2019s Wall, innermost and oldest, dark and roughly hewn; the High Wall, pale gold limestone raised at the height of imperial wealth; and the Long Wall, outermost, red brick thrown up fast during the empire\u2019s last great expansion \u2014 the one that came right before the fracture began."));
children.push(P("The capital is inland \u2014 river trade through Rivergate, but no ocean harbor; the nearest salt water is Velmareth\u2019s delta, ten days downriver. Travelers arrive by road (four days from the Ostmark, two weeks from the Brekelands, three weeks from Tarnovar) or up the river itself, and each road teaches its own lessons about the empire before the walls ever come into view."));
children.push(H2("The Inner City"));
children.push(B("Highcourt:", "The palace district. Holds the Lupine Throne, the ministries, and the townhouses of whatever nobility still maintains a capital residence. The Long Course, its ceremonial avenue, is where the legions parade and new laws are read aloud."));
children.push(B("The Sanctum:", "Climbs the city\u2019s second hill toward the golden dome of the Great Temple of the Matron \u2014 visible from every ring of the city. Administrative halls, seminaries, and the Office of Omens spread around the Temple proper."));
children.push(B("The Old Forum:", "The oldest surviving corner of the city \u2014 foundation-stones, half-buried columns, and a weathered monument to Zhuvedus himself, worn smooth by two thousand years of hands touching it for luck."));
children.push(H2("The Middle City"));
children.push(B("Coppergate:", "Copyists, instrument-makers, retired functionaries, laundry strung between balconies. Comfortable and unglamorous."));
children.push(B("Scholar\u2019s Row:", "Home to the Imperial Academy \u2014 swept courts, ringing bells, and the smaller tutoring houses and lodging-halls that cluster around any institution full of young people with stipends."));
children.push(B("The Exchange:", "Aenodira\u2019s guildhalls, counting-houses, and covered markets, where what remains of the empire\u2019s trade actually changes hands. Merchant Republic delegations keep permanent offices here."));
children.push(B("The Garrison:", "Barracks, drill yards, and the administrative offices of the capital\u2019s legion elements \u2014 a smaller and more ceremonial presence than the empire once kept here."));
children.push(H2("The Outer City"));
children.push(P("The Long Wall was built expecting a population that never arrived. The result is an outer city unevenly occupied \u2014 half-finished districts standing empty beside others crammed well past sensible density."));
children.push(B("The Archwork:", "An old imperial aqueduct crosses the outer city on high stone arches, several sections long since bricked up and converted into housing. Working-class and unglamorous."));
children.push(B("Farrowgate:", "The newest and least planned district, populated overwhelmingly by displaced people from the fractured territories. Established Aenodirans use the name without much affection; the people who live there increasingly use it themselves."));
children.push(B("Rivergate:", "The docks and river trade quarter, where goods \u2014 and a fair amount that isn\u2019t quite goods \u2014 move in and out of the capital. Less regulated than the Exchange, and considerably more interesting to anyone asking questions the empire\u2019s official record doesn\u2019t want to answer."));

// ==================== PART VII: COMMERCE ====================
children.push(H1("Commerce: Where to Spend Your Stipend"));
children.push(P("All mundane prices pulled from the SRD equipment data (exact book values). Magic availability per the approved economy: Church almonries sell sanctioned mercy openly; arcane material is chartered, scarce, and papered; Rivergate discounts everything including the truth."));
children.push(H3("The Exchange, Aenodira \u2014 General Outfitting (book prices)"));
children.push(table(["Item","Price","Item","Price"],[30,20,30,20],[
  ["Backpack","2 gp","Rope, hempen (50 ft.)","1 gp"],
  ["Bedroll","1 gp","Rations (1 day)","5 sp"],
  ["Lantern, hooded","5 gp","Oil (flask)","1 sp"],
  ["Torch","1 cp","Tinderbox","5 sp"],
  ["Crowbar","2 gp","Grappling hook","2 gp"],
  ["Chain (10 ft.)","5 gp","Waterskin","2 sp"],
  ["Mirror, steel","5 gp","Caltrops (bag)","1 gp"],
  ["Healer\u2019s Kit","5 gp","Climber\u2019s Kit","25 gp"]
]));
children.push(H3("The Garrison Quartermaster \u2014 Arms & Armor (license inspected, prices book)"));
children.push(table(["Item","Price","Item","Price"],[30,20,30,20],[
  ["Shortsword","10 gp","Longsword","15 gp"],
  ["Shield","10 gp","Chain Shirt","50 gp"],
  ["Breastplate","400 gp","Crossbow, light","25 gp"],
  ["Arrows (20)","1 gp","Spear","1 gp"]
]));
children.push(H3("Scholar\u2019s Row & the Church Almonry \u2014 the Sanctioned Trade"));
children.push(table(["Item","Price","Notes"],[34,16,50],[
  ["Potion of Healing (stamped)","50 gp","Church almonry; the stamp is the Sanction \u2014 possession of unstamped potions invites questions"],
  ["Potion of Greater Healing","200 gp","Requires standing with a parish, or a pilgrim\u2019s writ"],
  ["Holy water (flask)","25 gp","Book price; Orlathine-blessed flasks trade at a premium or a discount depending on the buyer\u2019s politics"],
  ["Spell scroll, 1st level","100 gp","Chartered scriptorium; purchaser entered in the register"],
  ["Spell scroll, 2nd level","300 gp","As above, plus a thaumaturgical reference"],
  ["Component pouch","25 gp","Book price"],
  ["Ink (1 oz.) / Paper (sheet)","10 gp / 2 sp","Book prices; Scholar\u2019s Row runs on both"],
  ["Spellbook (blank, bound)","50 gp","Book price"],
  ["Blessed taper (homebrew, common)","5 gp","Burns 1 hour; its light counts as the light of a shrine for purposes of the Old Observance \u2014 mostly bought for funerals and promises"]
]));
children.push(H3("Rivergate Gray Market \u2014 \u2018Everything Certified\u2019"));
children.push(table(["Item","Price","Notes"],[34,16,50],[
  ["Any Exchange-list item","\u221220%","Provenance flexible; quality genuine (the Inkhands guarantee it \u2014 their ledgers are their honor)"],
  ["Unstamped healing potion","35 gp","Works fine. The discount is the legal risk, priced honestly"],
  ["Unlicensed scrollwork, 1st","60\u201380 gp","roughly a 1-in-6 chance of a flawed casting \u2014 the scribe\u2019s risk, priced in; the good scribes cost Exchange prices anyway"],
  ["\u2018Relic\u2019 of a named saint","10\u2013500 gp","Almost always false. Almost. (See Part I: the false-relic trade, and the terrifying occasional exception)"],
  ["Dead-office seals & instruments","Negotiable","Mosse\u2019s shop \u2014 see Session Five; prices are sentimental"]
]));
children.push(H3("Regional Signature Vendors"));
children.push(table(["Vendor","Where","Specialty & Sample Prices"],[26,18,56],[
  ["Ostwatch Outfitters (Yanna\u2019s cousin\u2019s house)","Dravenna","Road & cold-weather gear at book; caravan intelligence free with purchase; wolf-charms 1 sp (\u2018for luck, and it\u2019s bad luck not to\u2019)"],
  ["The Stonewright\u2019s Yard","Kamenhold","Dwarven-forged tools +10% (worth it); Oathstone Charms 5 gp (see Part VIII homebrew); dry-stone masonry consulting, priced in favors"],
  ["The Vintners\u2019 Hall","Caldessa","Suthmark vintages 1\u201350 gp; mourning-silk; and the Garland hears every order placed"],
  ["The Letter-House","Lettervik","Books 25 gp+, maps of the north 10 gp, copying services; Karvel\u2019s subsidy makes literacy cheap \u2014 the point is the point"],
  ["The Tithe-Factor","Saltmark","Ship passage, cargo insurance (Saltmaw exclusions in small print), Skell tally-sticks as negotiable instruments"]
]));


children.push(H1("The Imperial Calendar"));
children.push(P("Twelve months, beginning at Wolfmoon in deep winter \u2014 the Matron's own month \u2014 and running the ordinary agricultural year most people actually live by."));
children.push(table(
  ["Month", "Season", "Known For"],
  [20, 24, 56],
  [
    ["Wolfmoon", "Deep winter (year begins)", "The Matron's high month; the year turns in her keeping."],
    ["Thawtide", "Late winter", "Roads reopen for the year."],
    ["Sowmonth", "Early spring", "Planting begins in the Suthmark."],
    ["Greening", "Mid-spring", "Long Course racing season opens."],
    ["Solacre", "Early summer", "The court's busiest season."],
    ["Haymonth", "Midsummer", "Academy field exercises traditionally run through here."],
    ["Harvestide", "Early autumn", "The Suthmark's great harvest festival."],
    ["Vinmoon", "Mid-autumn", "Grape harvest; Suthmark wines are dated by Vinmoon year."],
    ["Fallowmonth", "Late autumn", "Fields rest; many estates settle inheritance here."],
    ["Greywane", "Early winter", "Racing season closes; days shorten."],
    ["Longdark", "Deep winter", "The Matron's second high month."],
    ["Threshold", "Year's end", "A short 20-day month \u2014 old debts settled before the year turns."]
  ]
));
children.push(P("Most of loyalist territory counts Years of the Reckoning from the Founding. A seven-day week \u2014 a market day, a rest day, five working days \u2014 rounds out the everyday structure."));

children.push(H1("A Brief Timeline"));
children.push(BUL("~2,000 years ago:", "The founding of the empire by Zhuvedus, first of the Lupine Throne \u2014 still celebrated, and still argued about by scholars."));
children.push(BUL("~200 years ago:", "The fracture begins; two centuries of provinces peeling away follow."));
children.push(BUL("~60 years ago:", "The Silvasse Disaster: three legions and their standards lost in the western woods."));
children.push(BUL("~60\u201345 years ago:", "In the north: Olvesa\u2019s vengeance against her lord\u2019s murderers, her year of penance, and the founding of the See of Orlath."));
children.push(BUL("~20 years ago:", "The Weeping Strait, and Aldrec\u2019s betrayal by the throne he served."));
children.push(BUL("~15 years ago:", "Karvel begins unifying the northern crowns into Ardven."));
children.push(BUL("~12 years ago:", "Empress Nyreeza begins the academy revival and the first institutional reforms."));
children.push(BUL("6 years ago:", "The Vintage Night in the Suthmark \u2014 still disputed, still unexplained."));
children.push(BUL("4 years ago:", "The Harrowing of the Weld, in the Brekelands."));
children.push(BUL("3 years ago:", "Empress Nyreeza disappears without explanation."));
children.push(BUL("~2.5 years ago:", "Qilvayas\u2019s coronation; the restoration begins in earnest."));
children.push(BUL("~1 year ago:", "Marshal Dane recovers the Ninth\u2019s standard from the Brekelands \u2014 the empire\u2019s Young Wolf, and its first clear good news in a long while."));
children.push(BUL("This Solacre (nine months out):", "Two anticipated events, watched closely across the fractured empire: the promulgation of the Zhuvedian Laws in Aenodira, and the coronation of King Karvel as Emperor of the True Rite in Orlath."));

children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "~", size: 24 })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u201CWe are the Kin of Great Timberwolf\u201D", italics: true })] }));

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
  sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/claude/QS_Player_Guide.docx", buf);
  console.log("Written.");
});
