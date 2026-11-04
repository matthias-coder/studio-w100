/* ===================== Grunddaten & Definitionen (W100-System) ===================== */
const STATS={design:'Design',technik:'Technik',team:'Team',business:'Business'};
const CAT={
  personal:['Gehälter & Inflation','--c1'],
  staff:['Lead-Personal','--c1'],
  buero:['Büro & Infrastruktur','--c2'],
  mkt:['Marketing','--c3'],
  qa:['QA & Testing','--c4'],
  team:['Team & Weiterbildung','--c5'],
  welt:['Content, Grafik & Weltbau','--c7'],
  outs:['Outsourcing','--c7'],
  lok:['Lokalisierung','--c7'],
  server:['Server & Betrieb','--c2'],
  mods:['Mod-Tools','--c2'],
  eng:['Engine & Tech-Wartung','--c6'],
  zins:['Zinsen & Abgaben','--c2'],
  invest:['Investitionen','--c8'],
  projekt:['Projekt & Zwischenfälle','--c6']
};

/* ===================== Studio-, Event- & Encounter-Grafiken ===================== */
const STUDIO_IMAGES={
  garage:{src:'raw-assets/studio/d75a1b3d-44da-4d2d-aead-36e4dfd104c0.jpg',label:'Garagen-Studio (Röhrenmonitore, Pizza & Schlafsack)'},
  loft:{src:'raw-assets/studio/6c96502a-739f-4b77-a339-e8de00b6bd70.jpg',label:'Indie-Loft (Backstein, Siebträger & kurzen Wegen)'},
  aa:{src:'raw-assets/studio/972a2d7c-72d6-4a1b-9956-8eea0ce05505.jpg',label:'Professionelles Großstudio (Serverraum, Tonstudio & Konferenzsaal)'},
  aaa:{src:'raw-assets/studio/5eef54a8-8c87-46c6-b057-7fcd059da0e6.jpg',label:'High-Tech-Megastudio (Motion-Capture-Halle & Skyline-Penthouse)'}
};

const EVENT_IMAGES={
  ddos:'raw-assets/events/19ad0f91-55c7-4cc3-aa11-6cc581fc81fb.jpg',
  boardroom:'raw-assets/events/3ae7e030-a91d-4a65-b7ea-278924fc4500.jpg',
  shitstorm:'raw-assets/events/4a2becc1-b49b-4284-a483-9c3479b7faa5.jpg',
  ransomware:'raw-assets/events/675ce137-d63e-4561-963c-4d8e090f60cd.jpg',
  bug_crash:'raw-assets/events/7c8060d3-118c-4756-b0fb-944d397d7f95.jpg',
  crunch:'raw-assets/events/83862eb7-f19d-4a16-a691-b2b36e531657.jpg',
  magazine:'raw-assets/events/c4150caf-38fe-47ec-9a14-76b9da7a718c.jpg',
  stage:'raw-assets/events/f677f7c3-a50c-41e7-9372-16eb5ca4424b.jpg',
  enc_algo:'raw-assets/encounter/60ff21e1-1fa0-4a4b-8576-cf20e63c9dee.jpg',
  enc_critic:'raw-assets/encounter/71c5fb25-a250-434f-abff-601b6712e1bb.jpg',
  enc_data:'raw-assets/encounter/8217b3a2-e17c-4185-a44f-466a37d82a75.jpg',
  enc_os:'raw-assets/encounter/aef913b5-0ca2-4505-b3fb-285070a3599e.jpg',
  enc_kernel:'raw-assets/encounter/dc3ba1df-f5ec-4149-9121-7299c4a258c5.jpg'
};

const TIERS={
  indie:{n:'Indie',d:'Fünf Leute, eine Vision, kein Sicherheitsnetz.',dur:[12,18,24],scale:1,team:5,prices:[9.99,19.99,29.99],sales:1,hype:0,qual:0,gp:2,gfx:0,review:2,teamMod:4,min:0,note:'Team-Würfe +4, Kritiker milder, Gameplay zählt stärker als Grafik'},
  aa:{n:'Double-A',d:'Mittelgroßes Studio mit Publisher im Rücken.',dur:[24,36,48],scale:10,team:35,prices:[19.99,39.99,59.99],sales:3,hype:1,qual:5,gp:5,gfx:5,review:0,teamMod:0,min:1500,note:'Ausgewogen, mehr Geld, höhere Erwartung an Grafik & Gameplay'},
  aaa:{n:'Triple-A',d:'Hunderte Leute, Aktionäre, riesige Erwartungen.',dur:[60,72,84],scale:100,team:300,prices:[29.99,49.99,79.99],sales:25,hype:3,qual:10,gp:8,gfx:12,review:-5,teamMod:-4,min:15000,note:'Team-Würfe −4, Kritiker strenger, Grafik & Präsentation extrem wichtig'}
};

const MODELS={
  kauf:{n:'Kaufspiel',d:'Einmal kaufen, für immer spielen.',sales:'Verkaufs-Wurf'},
  abo:{n:'Abo-Modell',d:'Spiel kaufen plus 12,99 € im Monat. Server ab der Beta kosten jeden Monat.',sales:'Abonnenten-Wurf'},
  f2p:{n:'Free-to-Play',d:'Kostenlos, Geld kommt über den Shop. Viele Spieler, wenige zahlen.',sales:'Spieler-Wurf'}
};

const IPS={
  neu:{n:'Neue IP',d:'Eigene Welt, eigene Figuren. Niemand kennt euch.',note:'Design-Würfe +4',hype:0,sales:1,review:0,fee:0,cut:0,design:4},
  franchise:{n:'Fortsetzung',d:'Teil 2 eines bekannten Spiels.',note:'+2 Hype, 30 % mehr Verkäufe, Kritiker vergleichen (−2)',hype:2,sales:1.3,review:-2,fee:0,cut:0,design:0},
  lizenz:{n:'Lizenzspiel',d:'Das Spiel zum Film, zur Serie oder zum Comic.',note:'+3 Hype, Lizenzgebühr, 15 % Umsatzabgabe, Kritiker −3, Design −4',hype:3,sales:1.5,review:-3,fee:30,cut:.15,design:-4}
};

const VIOL=['action','actadv','rpg','survival'];

// gfxWeight bestimmt, wie stark Grafik (vs. Gameplay) in die Gesamtwertung des Genres einfließt
const GENRES={
  action:{n:'Action & Shooter',d:'Schnelle Reflexe, Gunplay, Combos. Riesiger Markt, harte Konkurrenz.',s:{design:0,technik:2,team:1,business:1},b:{hype:1,gfx:3},gfxW:0.55,fit:'kauf',w:['level','open'],bad:[],subs:{
    fps:{n:'Ego-Shooter (FPS)',d:'Präzises Zielen, Taktik- und Hero-Maps, Ranglisten.',s:{technik:2},b:{gp:4},gfxW:0.55},
    looter:{n:'Looter- & Extraction-Shooter',d:'Beute, Builds, Raids und das Risiko beim Rausgehen.',s:{business:2},b:{hype:2,bugs:2},gfxW:0.55,w:['open','hub']},
    br:{n:'Battle Royale',d:'Hundert Leute, eine Insel, der Kreis wird kleiner.',s:{business:2},b:{hype:2,bugs:4},gfxW:0.45,fit:'f2p',w:['open'],bad:['schlauch','level']},
    hackslay:{n:'Hack & Slay',d:'Stilwertung, Combos, absurde Bosse.',s:{design:2},b:{gp:4},gfxW:0.50,w:['level','schlauch']},
    fighting:{n:'Prügelspiel',d:'2D, 3D oder Plattform-Fighter: Frame-Daten, Combos, Turniere.',s:{team:2},b:{gp:4,hype:2},gfxW:0.45,w:['level'],bad:['open','schlauch']}
  }},
  actadv:{n:'Action-Adventure',d:'Erkunden, Kämpfen, Entdecken. Die großen Blockbuster-Bühnen.',s:{design:1,technik:2,team:1,business:0},b:{gp:2,gfx:4},gfxW:0.55,fit:'kauf',w:['open','hub'],bad:[],subs:{
    openworld:{n:'Open World',d:'Eine riesige Welt und hundert Nebenaufgaben.',s:{technik:2},b:{gfx:6,bugs:4},gfxW:0.60,w:['open'],bad:['schlauch','level']},
    metroidvania:{n:'Metroidvania',d:'Verwinkelte Karte, Doppelsprung, Abkürzungen.',s:{design:2},b:{gp:6},gfxW:0.35,w:['hub'],bad:['open']},
    soulslike:{n:'Soulslike',d:'Ausdauerleiste, Lagerfeuer, berüchtigte Bosse.',s:{design:1,team:1},b:{gp:4,hype:2},gfxW:0.50,w:['hub','open']},
    horror:{n:'Survival-Horror',d:'Taschenlampe, wenig Munition, Geräusche im Flur.',s:{design:2},b:{hype:2,gfx:4},gfxW:0.55,w:['schlauch','hub'],bad:['open']},
    stealth:{n:'Stealth & Immersive Sim',d:'Schleichen, Hacken, zehn Wege durch jedes Level.',s:{technik:1,design:1},b:{gp:6,bugs:2},gfxW:0.45,w:['hub','level']}
  }},
  adventure:{n:'Adventure',d:'Geschichte, Rätsel und Atmosphäre. Langlebig und dankbar für Nischen.',s:{design:2,technik:0,team:1,business:1},b:{gp:4},gfxW:0.40,fit:'kauf',w:['hub','schlauch','level'],bad:['open'],subs:{
    pnc:{n:'Point & Click',d:'Rätsel, Dialoge, ein sprechender Papagei.',s:{design:2},b:{gp:6},gfxW:0.30},
    vn:{n:'Visual Novel',d:'Verzweigte Geschichte und unvergessliche Figuren.',s:{team:2},b:{gp:4,bugs:-4},gfxW:0.25},
    narrative:{n:'Erzähl-Erkundung',d:'Wandern, lauschen, Briefe finden. Ein Walking Simulator mit Herz.',s:{design:2},b:{gfx:6},gfxW:0.55,w:['schlauch','hub']},
    interactive:{n:'Interaktiver Film',d:'Entscheidungen, Schauspieler, Motion-Capture.',s:{technik:2},b:{gfx:6,hype:2},gfxW:0.65,w:['schlauch']},
    puzzleadv:{n:'Puzzle-Adventure & Escape Room',d:'Ein Raum, hundert Hinweise, ein Ausgang.',s:{team:2},b:{gp:6},gfxW:0.35,w:['level','hub']}
  }},
  rpg:{n:'Rollenspiel',d:'Charakterentwicklung, Quests, Beute. Spieler bleiben jahrelang.',s:{design:2,technik:1,team:1,business:0},b:{gp:4,gfx:2,bugs:2},gfxW:0.45,fit:'kauf',w:['open','hub'],bad:['schlauch'],subs:{
    crpg:{n:'Klassisches RPG (CRPG)',d:'Würfelproben, Dialogbäume, Begleiter-Romanzen.',s:{design:2},b:{gp:6},gfxW:0.35,w:['hub','open']},
    arpg:{n:'Action-RPG',d:'Loot, Bosse und Builds in Echtzeit.',s:{technik:2},b:{gfx:4,hype:2}},
    jrpg:{n:'JRPG',d:'Rundenkämpfe, eine bunte Party und eine epische Geschichte.',s:{team:2},b:{gp:4,hype:2},w:['hub','level']},
    mmorpg:{n:'MMORPG',d:'Gilden, Raids und tausend Server-Probleme.',s:{business:2},b:{hype:2,bugs:6},fit:'abo',w:['open'],bad:['schlauch','level']},
    monster:{n:'Monster-Sammeln',d:'Fangen, entwickeln, tauschen.',s:{design:1,business:1},b:{gp:4,hype:2},gfxW:0.40}
  }},
  strategy:{n:'Strategie',d:'Planen, Bauen, Erobern. Auf dem PC eine treue Langzeit-Nische.',s:{design:1,technik:2,team:0,business:1},b:{gp:4},gfxW:0.30,fit:'kauf',w:['open','level'],bad:['schlauch'],subs:{
    rts:{n:'Echtzeit-Strategie (RTS)',d:'Basenbau, Einheiten, Klick-Geschwindigkeit.',s:{technik:2},b:{gp:4}},
    tbs:{n:'Rundenstrategie',d:'Taktikgitter und „nur noch eine Runde“.',s:{design:2},b:{gp:6},gfxW:0.25,w:['level','hub']},
    grand:{n:'4X & Grand Strategy',d:'Erkunden, Expandieren, Ausbeuten, Auslöschen. Über Jahrhunderte.',s:{business:1,design:1},b:{gp:8,bugs:4},gfxW:0.25,w:['open']},
    towerdef:{n:'Tower Defense',d:'Türme bauen, Wellen überleben.',s:{design:2},b:{gp:4,bugs:-2},w:['level']},
    moba:{n:'MOBA & Auto Battler',d:'Drei Lanes, hundert Helden, eine anstrengende Community.',s:{business:2},b:{hype:2,bugs:4},gfxW:0.40,fit:'f2p',w:['level']}
  }},
  sim:{n:'Simulation',d:'Bauen, Verwalten, Optimieren. Riesige, treue Fangemeinden.',s:{design:1,technik:1,team:0,business:2},b:{gp:4},gfxW:0.35,fit:'kauf',w:['open','hub'],bad:['schlauch'],subs:{
    citybuild:{n:'Aufbau & Tycoon',d:'Produktionsketten, Tabellen, Siedler-Gefühl.',s:{technik:2},b:{gp:6},w:['open','level']},
    life:{n:'Lebenssimulation',d:'Häuser bauen, Leben ruinieren, Pool ohne Leiter.',s:{design:2},b:{gp:4,hype:2}},
    cozy:{n:'Farming & Cozy',d:'Rüben gießen, Hühner streicheln, Dorffest.',s:{team:2},b:{gp:4,moral:2},gfxW:0.30},
    factory:{n:'Factory & Colony Sim',d:'Förderbänder optimieren, Kolonisten retten.',s:{technik:2},b:{gp:8,bugs:4},gfxW:0.20,w:['open']},
    job:{n:'Job- & Fahrzeug-Sim',d:'Trucks, Traktoren, Hochdruckreiniger. Seltsam entspannend.',s:{business:2},b:{hype:2},gfxW:0.45,w:['open','level']}
  }},
  sports:{n:'Sport & Rennen',d:'Stadion, Strecke, Saison. Fans wollen Echtheit oder Spaß, nicht beides halb.',s:{design:1,technik:2,team:0,business:1},b:{gp:2,gfx:4},gfxW:0.50,fit:'kauf',w:['level','hub'],bad:['schlauch'],subs:{
    sim:{n:'Sportsimulation',d:'Lizenzen, Motion-Capture, echte Kader.',s:{technik:2},b:{gfx:6},gfxW:0.55,bad:['open','schlauch']},
    manager:{n:'Sportmanager',d:'Taktiktafel, Transfermarkt, Tabellen.',s:{business:2},b:{gp:8},gfxW:0.20},
    arcaderacer:{n:'Arcade- & Fun-Racer',d:'Drift, Nitro, Bananenschalen.',s:{design:2},b:{gp:4,hype:2},gfxW:0.45},
    simracer:{n:'Rennsimulation',d:'Reifenabnutzung, Setup-Menüs, Lenkrad-Support.',s:{technik:2},b:{gfx:4},gfxW:0.65},
    extreme:{n:'Extremsport',d:'Skateparks, Tricks, Punkrock-Soundtrack.',s:{team:2},b:{gp:4,hype:2},gfxW:0.45,w:['level','open']}
  }},
  survival:{n:'Survival & Sandbox',d:'Sammeln, Bauen, Überleben. Lebt von Updates und Streamern.',s:{design:1,technik:2,team:1,business:0},b:{gp:4,bugs:2},gfxW:0.40,fit:'kauf',w:['open'],bad:['schlauch','level'],subs:{
    crafting:{n:'Survival-Crafting',d:'Holz hacken, Basis bauen, nachts überleben.',s:{technik:2},b:{gp:4}},
    sandbox:{n:'Sandbox',d:'Blöcke, Kreativmodus, eine unendliche Welt.',s:{design:2},b:{gp:6,gfx:-2},gfxW:0.25},
    mphorror:{n:'Multiplayer-Horror',d:'Vier Freunde, ein Monster, viel Geschrei im Voice-Chat.',s:{team:2},b:{hype:4},gfxW:0.45,w:['level','hub'],bad:[]}
  }},
  puzzle:{n:'Puzzle & Denkspiele',d:'Kleine Teams, klare Ideen. Auf dem Handy ein Dauerbrenner.',s:{design:2,technik:0,team:1,business:1},b:{gp:3},gfxW:0.30,fit:'kauf',w:['level'],bad:['open'],subs:{
    logic:{n:'Logik & Rätsel',d:'Saubere Regeln, ein Aha-Moment pro Level.',s:{design:2},b:{gp:6}},
    physics:{n:'Physik-Puzzle',d:'Portale, Seilzüge, Kettenreaktionen.',s:{technik:2},b:{gp:4,bugs:2},gfxW:0.35},
    match:{n:'Match-3 & Casual',d:'Drei in einer Reihe, tägliche Belohnungen, fürs Handy gemacht.',s:{business:2},b:{hype:2},fit:'f2p',mobile:true},
    cards:{n:'Karten & Deckbuilder',d:'Synergien, Seltenheiten, eine Karte zu viel auf der Hand.',s:{design:1,business:1},b:{gp:6},gfxW:0.25}
  }},
  platformer:{n:'Plattformer',d:'Springen, Timing, Leveldesign. Gameplay schlägt alles.',s:{design:2,technik:1,team:1,business:0},b:{gp:4},gfxW:0.40,fit:'kauf',w:['level'],bad:['open'],subs:{
    p2d:{n:'2D-Plattformer',d:'Pixelgenaue Sprünge und handgezeichnete Welten.',s:{design:2},b:{gp:4},gfxW:0.35},
    p3d:{n:'3D-Plattformer',d:'Kamera, Sammelobjekte, verspielte Welten.',s:{technik:2},b:{gfx:6},gfxW:0.50,w:['level','hub']},
    precision:{n:'Precision-Platformer',d:'Tausend Tode, ein perfekter Lauf.',s:{team:2},b:{gp:6,hype:2},gfxW:0.30}
  }}
};
// Sub-Genre-Definition eines Projekts (oder null)
const subGenreOf=(g,sub)=>GENRES[g]?.subs?.[sub]||null;
const defaultSub=g=>Object.keys(GENRES[g]?.subs||{})[0]||null;

/* Genre-übergreifende Modifikatoren: optional, einer pro Projekt.
   syn/clash: Hauptgenre ('rpg') oder Sub-Genre ('rpg.mmorpg') mit Synergie bzw. Reibung */
const GENRE_MODS={
  roguelike:{n:'Roguelike-Elemente',d:'Prozedurale Runs und permanente Freischaltungen. Hoher Wiederspielwert.',b:{gp:4},sales:1.05,
    syn:['actadv','platformer','action.hackslay','puzzle.cards','strategy.towerdef'],clash:['adventure','sim.life','rpg.mmorpg']},
  horror:{n:'Horror-Stimmung',d:'Dunkle Atmosphäre und Schockmomente, egal in welchem Genre.',b:{hype:2,gfx:2},sales:1,
    syn:['adventure','survival','actadv'],clash:['sim.cozy','sports','puzzle.match','platformer.p3d']},
  live:{n:'Live Service',d:'Saisons, Battle Pass, laufende Updates. Teuer im Betrieb, stark mit Free-to-Play oder Abo.',b:{hype:2,bugs:4},monthly:1,sales:{kauf:1.05,abo:1.25,f2p:1.3},
    syn:['rpg.mmorpg','action','strategy.moba','survival','sports.sim'],clash:['adventure','puzzle.logic','platformer','rpg.crpg']},
  party:{n:'Party & Couch-Koop',d:'Für vier auf dem Sofa: kurze Runden, viel Chaos.',b:{hype:2,gp:2},sales:1.1,
    syn:['platformer','sports.arcaderacer','action.fighting','puzzle'],clash:['rpg','strategy.grand','adventure.vn','sim.factory']},
  vr:{n:'VR-Fassung',d:'Mittendrin statt nur dabei. Kleinerer Markt, aber viel Aufmerksamkeit.',b:{hype:3,gfx:-4,bugs:4},sales:0.6,
    syn:['actadv','sim.job','puzzle.physics','sports.simracer','adventure.narrative'],clash:['strategy','sim.factory','puzzle.cards']}
};
const MOD_SYN={gp:4,hype:1},MOD_CLASH={gp:-4,bugs:3};

// Metakritik: fiktive Testmagazine mit Schwerpunkt (gp/gfx/snd) und Strenge (b)
const OUTLETS=[
  {n:'IGM',f:'gfx',b:1},{n:'GameSprot',f:'gp',b:-2},{n:'Polygone',f:'gp',b:0},{n:'PC Gamma',f:'gfx',b:-1},
  {n:'Eurogamez',f:'gp',b:-3},{n:'Spieleheld',f:'gp',b:2},{n:'Pixel World',f:'gfx',b:3},{n:'Kotakuh',f:'snd',b:-2},
  {n:'Ohrwurm Magazin',f:'snd',b:1},{n:'5Spieler',f:'gp',b:-4},{n:'Gamestern',f:'gfx',b:0},{n:'Retro Gamer Zone',f:'snd',b:2}
];
const REVIEW_QUOTES={
  gp:{hi:['Spielt sich wie aus einem Guss.','Die Steuerung ist butterweich.','Wir kamen nicht mehr vom Controller los.'],
      lo:['Das Spieldesign wirkt unfertig.','Nach zwei Stunden wiederholt sich alles.','Die Steuerung kämpft gegen uns.']},
  gfx:{hi:['Optisch eine Wucht.','Jeder Screenshot ein Hintergrundbild.','Der Artstyle ist unverwechselbar.'],
       lo:['Die Texturen laden gefühlt nie.','Technisch eine Generation zurück.','Hässlich, aber mit Charme. Meistens.']},
  snd:{hi:['Der Soundtrack bleibt im Ohr.','Das Sounddesign ist eine Klasse für sich.','Kopfhörer auf, Gänsehaut an.'],
       lo:['Die Musik nervt nach zehn Minuten.','Die Soundeffekte klingen wie aus einer Gratis-Bibliothek.','Wir haben den Ton irgendwann ausgemacht.']}
};
const REVIEW_VERDICT=[
  ['Finger weg.','Ein Fall für den Grabbeltisch.','Leider ein Totalausfall.'],
  ['Nur für Fans des Genres.','Mit Patches könnte das was werden.','Solide, aber vergessenswert.'],
  ['Klare Empfehlung.','Ein starkes Spiel.','Kaufen, wenn das Genre passt.'],
  ['Ein Meilenstein.','Pflichtkauf.','Das Spiel des Jahres?']
];
// 'syn', 'clash' oder null für die Kombination aus Genre, Sub-Genre und Modifikator
function modFit(g,sub,mod){
  const m=GENRE_MODS[mod];if(!m)return null;
  const hit=list=>list.includes(g)||list.includes(g+'.'+sub);
  return hit(m.syn)?'syn':hit(m.clash)?'clash':null;
}
const modSales=(mod,model)=>{const v=GENRE_MODS[mod]?.sales;return typeof v==='object'?(v[model]||1):(v||1)};

/* ===================== Engine-Matrix, Alterung & Eigene Engine ===================== */
const ENGINE_AGE_STATES=[
  {age:0,label:'Next-Gen (Brandaktuell)',cls:'p',gfx:8,gp:4,hype:1,rev:0,licMult:1.2,desc:'Moderne Grafik-Pipeline und frische Gameplay-Systeme.'},
  {age:1,label:'Aktuell & Eingespielt',cls:'p',gfx:5,gp:4,hype:0,rev:0,licMult:1.0,desc:'Der Sweetspot: Noch modern und das Team kennt jeden Handgriff.'},
  {age:2,label:'Angestaubt (Letzte Gen)',cls:'w',gfx:-3,gp:0,hype:0,rev:-1,licMult:0.6,desc:'Man sieht der Engine ihr Alter bei Beleuchtung und Animationen langsam an.'},
  {age:3,label:'Veraltet (Grafik & Physik)',cls:'n',gfx:-9,gp:-5,hype:-1,rev:-3,licMult:0.25,desc:'Matschige Texturen, steife Physik: Grafik und Gameplay verlieren deutlich Punkte!'},
  {age:4,label:'Steinzeit-Engine (Fossil)',cls:'n',gfx:-16,gp:-10,hype:-2,rev:-6,licMult:0,desc:'Technisch aus der Zeit gefallen. Massive Abzüge auf Grafik, Gameplay und Kritiken!'}
];

function getEngineAgeInfo(age){
  const idx=Math.min(Math.max(0,age||0),ENGINE_AGE_STATES.length-1);
  return ENGINE_AGE_STATES[idx];
}

const ENGINE_DEFS={
  eigen:{
    n:'Eigene Engine',
    short:'Eigenbau',
    d:'Volle Kontrolle, keine Lizenzabgaben. Steigert mit jedem Einsatz die Team-Routine (weniger Bugs), veraltet aber nach einigen Läufen technisch, wenn sie nicht modernisiert wird!',
    good:[],
    bad:[]
  },
  surreal:{
    n:'Surreal Engine',
    short:'Surreal',
    d:'Fotorealistische 3D-Grafik ab Werk (+10 Grafik). Ab 1 Mio € Umsatz gehen 5 % an den Hersteller. Für kleine 2D-/Mobile-Spiele viel zu schwerfällig.',
    good:['action','actadv','rpg','sports','survival'],
    bad:['puzzle'],
    goodEff:{gfx:6,gp:2,hype:1},
    badEff:{gfx:-2,gp:-6,bugs:4,zeit:-1},
    goodNote:'Surreal glänzt bei 3D-Präsentation (+6 Grafik, +2 Gameplay, +1 Hype)',
    badNote:'Surreal ist für dieses Genre viel zu klobig (−6 Gameplay, −2 Grafik, +4 Bugs, −1 Monat)'
  },
  unitee:{
    n:'Unitee',
    short:'Unitee',
    d:'Schnell eingerichtet, riesiger Asset-Store, stark bei Indie, 2D, Aufbau und Mobile. Schwächelt bei riesigen Online-Welten.',
    good:['puzzle','adventure','sim','platformer','strategy'],
    bad:['survival'],
    goodEff:{gp:4,gfx:2,bugs:-1},
    badEff:{gfx:-4,gp:-3,bugs:5},
    goodNote:'Unitee passt ideal zum Genre (+4 Gameplay, +2 Grafik, −1 Bug)',
    badNote:'Unitee ächzt unter der Server- und Weltlast (−4 Grafik, −3 Gameplay, +5 Bugs)'
  },
  godoh:{
    n:'Godoh (Open Source)',
    short:'Godoh',
    d:'Kostenlos und offen, geliebt für 2D, Point-and-Click und Gameplay-Hits. Bei aufwendigen 3D-/Online-Projekten fehlt die Grafik-Power.',
    good:['puzzle','adventure','platformer','strategy'],
    bad:['action','actadv','sports'],
    goodEff:{gp:6,gfx:1,moral:1},
    badEff:{gfx:-8,gp:-3,bugs:4,zeit:-1},
    goodNote:'Godoh ist wie gemacht für euer Gameplay (+6 Gameplay, +1 Grafik, +1 Moral)',
    badNote:'Godoh fehlen für dieses Genre 3D-Grafik & Netcode (−8 Grafik, −3 Gameplay, +4 Bugs, −1 Monat)'
  }
};

const ENGINE_MODULES={
  render3d:{branch:'Grafik & Präsentation',n:'Next-Gen-Renderer',d:'+6 Grafik und +1 Hype beim Projektstart mit eigener Engine',costPts:1,eff:{gfx:6,hype:1}},
  raytracing:{branch:'Grafik & Präsentation',n:'Echtzeit-Licht & Globale Beleuchtung',d:'+8 Grafik und +2 Release-Wertung durch brillante Ausleuchtung',costPts:1,req:'render3d',eff:{gfx:8}},
  gameplay_kit:{branch:'Gameplay & Welt',n:'Modulares Gameplay-Framework',d:'+6 Gameplay & schnelleres Prototyping beim Projektstart',costPts:1,eff:{gp:6}},
  ai_sandbox:{branch:'Gameplay & Welt',n:'Dynamische KI- & Physik-Sandbox',d:'+7 Gameplay und +1 Hype durch lebendige Spielwelten',costPts:1,req:'gameplay_kit',eff:{gp:7,hype:1}},
  editor:{branch:'Gameplay & Welt',n:'Visueller Welt- & Quest-Editor',d:'+1 Monat Zeit, +3 Gameplay und +2 Grafik beim Projektstart',costPts:1,eff:{zeit:1,gp:3,gfx:2}},
  netcode:{branch:'Netzwerk & Pipeline',n:'Roll-Back-Netcode',d:'Perfekt für Koop, MMO & Battle Royale: −3 Bugs, +5 Technik bei Online-Spielen',costPts:1,eff:{bugs:-3,gp:2}},
  portkit:{branch:'Netzwerk & Pipeline',n:'Multi-Plattform-Compiler',d:'Plattform-Würfe +12, spart 50 % Portierungskosten und +2 Grafik',costPts:1,eff:{gfx:2}},
  qaauto:{branch:'Netzwerk & Pipeline',n:'Automatisierte Telemetrie-Suite',d:'Jeden Monat −0,5 Bugs durch automatische Crash-Analysen',costPts:1,req:'portkit',eff:{bugs:-2}}
};

/* ===================== Auftragsarbeiten (Contracts für Zusatzgeld) ===================== */
const CONTRACTS=[
  {id:'port_job',n:'Konsolen-Portierung für Partnerstudio',d:'Ein anderes Studio braucht dringend Hilfe beim Portieren. Bringt schnelles Geld.',st:'technik',dc:55,pay:12,f:{bugs:2,moral:-1},sx:'Sauber abgeliefert! Der Scheck ist sofort auf dem Konto.',fx:'Der Port war widerspenstig. Es gibt nur eine Teilzahlung und müde Gesichter.'},
  {id:'ui_job',n:'UI- & Menü-Design für Großprojekt',d:'Eure Designer gestalten das Interface für eine fremde Produktion.',st:'design',dc:50,pay:9,f:{moral:-1},sx:'Schickes Layout, zufriedener Auftraggeber!',fx:'Drei Korrekturschleifen zu viel — kaum Gewinn, genervtes Team.'},
  {id:'shader_job',n:'Grafik-Benchmark & Tech-Showcase',d:'Ein Grafikkarten-Hersteller bestellt eine schicke Tech-Szene.',st:'technik',dc:65,pay:17,sExtra:{gfx:2},f:{zeit:-1,bugs:2},sx:'Die Szene läuft auf jeder Messe! Dickes Honorar und +2 Grafik für euer Spiel.',fx:'Treiber-Absturz bei der Präsentation. Das hat Zeit gekostet.'},
  {id:'pitch_consult',n:'Publisher-Beratung & Marktanalyse',d:'Ihr bewertet Prototypen für einen Investment-Fonds.',st:'business',dc:50,pay:10,f:{hype:-1},sx:'Schnell verdientes Beratungshonorar.',fx:'Ein Prototyp, den ihr abgelehnt habt, wird anderswo zum Hit.'},
  {id:'qa_help',n:'Notfall-Bugfixing auf Abruf',d:'Zwei Wochen Feuerwehreinsatz in fremdem Code.',st:'technik',dc:60,pay:13,f:{moral:-1,bugs:2},sx:'Kritischer Fehler gefunden, satte Prämie kassiert!',fx:'Ihr habt den fremden Code repariert, aber euren eigenen vernachlässigt.'}
];

/* ===================== Konkurrenz-Studios (Rivalen & GOTY-Rennen) ===================== */
const BASE_RIVALS=[
  {id:'nordlicht',name:'Nordlicht Interactive',fav:'rpg',skill:68,tag:'Skandinavische Rollenspiel-Schmiede mit riesiger Fangemeinde'},
  {id:'aether',name:'AetherWorks',fav:'action',skill:72,tag:'Technik-Gigant, bekannt für spektakuläre 3D-Grafik und Shooter'},
  {id:'valkyrie',name:'Valkyrie Soft',fav:'actadv',skill:66,tag:'Kult-Studio für messerscharfes Gameplay und knackige Bosse'},
  {id:'redsun',name:'Red Sun Digital',fav:'sports',skill:70,tag:'Perfektionisten für Tempo, Physik und glänzende Karosserien'},
  {id:'alpenhorn',name:'Alpenhorn Games',fav:'sim',skill:65,tag:'Meister komplexer Wirtschaftskreisläufe und gemütlicher Welten'}
];

/* ===================== Interviews (Fragenpool INTERVIEW_QS in content-extra.js) ===================== */
// bias: Bonus/Malus auf die Erfolgschance je Antwort-Ton, passend zum Format
const INTERVIEW_OUTLETS=[
  {n:'PIXEL WORLD Magazin',k:'Print-Interview',bias:{honest:10,bold:-5}},
  {n:'Couchkoop-Podcast',k:'Podcast',bias:{joke:10,honest:5}},
  {n:'Livestream bei „xKaiserLP“',k:'Livestream',bias:{bold:10,joke:5,safe:-10}},
  {n:'Kulturzeit am Abend',k:'TV-Beitrag',bias:{safe:10,bold:-10}},
  {n:'GameTech Daily',k:'Online-Portal',bias:{honest:5,joke:-5}},
  {n:'Hauptbühne der Spielemesse',k:'Live auf der Bühne',bias:{bold:5,joke:5,safe:-5}}
];
const IV_TONES={safe:'🛡️ Sicher',honest:'🤝 Ehrlich',bold:'🔥 Mutig',joke:'😄 Witzig'};

/* ===================== Engine-Projekte (zwischen zwei Spielen) ===================== */
// Das ganze Team arbeitet 6–12 Monate nur an der Engine: kostet laufende Gehälter, bringt kein Spiel
const ENG_PROJECT_GOALS={
  gen:{n:'🖥️ Generations-Upgrade',d:'Neuer Renderer, neue Beleuchtung, modernisierter Gameplay-Kern. Die Engine springt auf die nächste Version und ist wieder Next-Gen. Je höher die Version, desto schwerer.',fee:25},
  spec:{n:'🎯 Genre-Spezialisierung',d:'Die Engine wird gezielt auf ein Genre zugeschnitten: Werkzeuge, Vorlagen, Animationssysteme. Spiele dieses Genres bekommen dauerhaft +4 Gameplay und +4 Grafik.',fee:12},
  research:{n:'🔬 Forschungsoffensive',d:'Grundlagenforschung für neue Module im Tech-Tree. Bringt bei Erfolg 2 Forschungspunkte, sonst einen.',fee:8}
};
const ENG_PROJECT_DURS={
  6:{n:'6 Monate · Crunch-Sprint',sg:70,pts:0,d:'Schnell fertig, aber riskant.'},
  9:{n:'9 Monate · Solide Planung',sg:55,pts:1,d:'Ausgewogen: +1 Forschungspunkt obendrauf.'},
  12:{n:'12 Monate · Gründlich',sg:40,pts:2,d:'Teuer, aber sicher: +2 Forschungspunkte und alle Tech-Schulden getilgt.'}
};

const ENGINE_LIC_MODES={
  none:{n:'Nur intern nutzen',d:'Kein Support-Aufwand für Fremdstudios. Voller Fokus auf eigene Spiele (−0,25 Bugs/Monat).',inc:0},
  seat:{n:'Seat-Lizenz (Monatsgebühr)',d:'Andere Studios zahlen monatlich für eure Engine (abhängig von Aktualität!). Kostet etwas Tech-Fokus.',inc:1.8},
  royalty:{n:'5 % Umsatzbeteiligung (Royalty)',d:'Kleine Grundgebühr, aber Chance auf dicke Tantiemen am Jahresende, solange die Engine nicht veraltet ist.',inc:0.6},
  opensource:{n:'Open-Source-Ökosystem',d:'Keine Lizenzgebühren, aber die weltweite Community fixt Bugs (−0,5 Bugs/Monat) und bringt +3 Studio-Fame pro Spiel.',inc:0}
};

/* ===================== Budgetplan & Sprachen ===================== */
const PLAN={
  mkt:{n:'Marketing',d:'Anzeigen, Trailer, Community',lv:['Wenig','Normal','Viel'],cost:[0,1.5,4],key:'hype',val:[0,.34,.75],cat:'mkt',def:1},
  qa:{n:'QA & Testing',d:'Tester, Testgeräte, Crash-Reporting',lv:['Wenig','Normal','Viel'],cost:[0,1,3],key:'bugs',val:[1,0,-1.5],cat:'qa',def:1},
  team:{n:'Team-Extras',d:'Obst, Teamabende, gute Stühle',lv:['Wenig','Normal','Viel'],cost:[0,.5,1.5],key:'moral',val:[-.25,0,.34],cat:'team',def:1},
  gehalt:{n:'Gehälter',d:'Unter Markt spart, über Markt hält die Leute & Leads',lv:['Unter','Markt','Über'],cost:[-1.5,0,2.5],key:'moral',val:[-.34,0,.25],cat:'personal',def:1},
  content:{n:'Content & Polish',d:'Mehr Level, Quests, Grafik-Details & Gameplay-Feinschliff',lv:['Aus','Klein','Groß'],cost:[0,1.5,4],key:'qual',val:[0,.6,1.4],cat:'welt',def:0},
  weiter:{n:'Weiterbildung',d:'Hebt Studiowerte (+2) & gibt Lead-Personal schneller XP',lv:['Aus','Etwas','Viel'],cost:[0,1,2.5],key:'skill',val:[0,.2,.4],cat:'team',def:0},
  outs:{n:'Outsourcing',d:'Externe Studios sparen Zeit, bringen aber Bugs',lv:['Aus','Etwas','Viel'],cost:[0,2,5],key:'zeit',val:[0,.25,.5],cat:'outs',def:0}
};

const LANGS={
  en:{n:'Englisch',m:.45},
  de:{n:'Deutsch',m:.08},
  fr:{n:'Französisch',m:.07},
  es:{n:'Spanisch',m:.08},
  it:{n:'Italienisch',m:.04},
  pt:{n:'Portugiesisch (Brasilien)',m:.05},
  ja:{n:'Japanisch',m:.07},
  ko:{n:'Koreanisch',m:.04},
  zh:{n:'Chinesisch',m:.17}
};

/* ===================== Lead-Personal (W100-Boni, Level 1-5 & Abwanderungsrisiko) ===================== */
const LEAD_NAMES={
  senior:['Dr. Mara Lindqvist','Karim Al-Mansoor','Svenja Kowalski','Tomasz Nowak','Linnea Bergström','Hannes Richter'],
  art:['Yuki Takahashi','Clara von Stephan','Mateo Rossi','Freja Lindholm','Noémie Laurent','David Krenz'],
  producer:['Hannah Goldmann','Marcus Vance','Elena Rostova','Tobias Mertens','Priya Nair','Lukas Bach'],
  community:['Jules Weber','Mia Chen','Sami Petrov','Nina Sonnenschein','Robin Kästner','Tara Novak'],
  qalead:['Viktor Sokolov','Anja Brückner','Darius Mehdi','Katrin Falk','Simon Vestergaard','Bastian Krug'],
  bizdev:['Victoria Sterling','Henrik Lind','Dr. Cornelius Graf','Sabrina Moretti','Leonard Sterling','Nadia Gauthier']
};

const STAFF_XP_THRESH=[0,2,5,9,14]; // XP für Level 1..5
const STAFF_TITLES=['Lead','Senior Lead','Principal','Director','Branchen-Legende'];
const STAFF_STAT_BONUS=[0,3,5,8,11,15]; // W100-Bonus für Stufe 1..5 (+3% bis +15%)
const AUDIO_SND=[0,0.5,0.8,1.2,1.6,2.0]; // Sound pro Monat durch den Audio Director

const STAFF={
  senior:{
    n:'Lead Programmer',
    d:'Kennt jeden Speichertrick, hält Engine & Framerate zusammen.',
    sal:2.5,
    stat:'technik',
    effDesc:lv=>`Technik +${STAFF_STAT_BONUS[lv]}${lv>=2?`, −${lv>=5?1.0:lv>=3?0.5:0.3} Bugs/M`:''}${lv>=4?`, Engine +${lv===5?10:6}`:''}`
  },
  art:{
    n:'Art Director',
    d:'Prägt Stil, Beleuchtung und Animationen für starke Grafik-Werte.',
    sal:2.5,
    stat:'design',
    effDesc:lv=>`Design +${STAFF_STAT_BONUS[lv]}, +${[0,0.3,0.5,0.8,1.1,1.5][lv]} Grafik/M${lv>=4?', Start-Hype +1':''}`
  },
  audio:{
    n:'Audio Director',
    d:'Komponiert, mischt und vertont: verantwortet Soundtrack und Sounddesign.',
    sal:2.5,
    stat:'design',
    effDesc:lv=>`+${nf(AUDIO_SND[lv])} Sound/M, Sound-Würfe +${STAFF_STAT_BONUS[lv]}${lv>=4?', Sound-Ereignisse +3 Sound':''}`
  },
  producer:{
    n:'Executive Producer',
    d:'Hält Zeitpläne zusammen und sagt bei Feature Creep auch mal Nein.',
    sal:2,
    stat:'team',
    effDesc:lv=>`${lv>=3?2:1}× Verzug/Phase abfangen, Team +${STAFF_STAT_BONUS[lv]}${lv>=4?`, Kosten −${lv===5?10:5} %`:''}`
  },
  community:{
    n:'Community Director',
    d:'Discord, Social Media, Creator-Events und Krisenkommunikation.',
    sal:1.5,
    stat:'business',
    effDesc:lv=>`Wishlists +${[0,10,18,25,32,40][lv]} %/M, Business +${Math.floor(STAFF_STAT_BONUS[lv]*0.7)}${lv>=3?`, Start-Hype +${lv===5?2:1}`:''}`
  },
  qalead:{
    n:'QA-Director',
    d:'Baut Test-Pipelines, findet Bugs und sichert saubere Gameplay-Mechaniken.',
    sal:2,
    stat:'technik',
    effDesc:lv=>`−${[0,0.5,0.8,1.2,1.6,2.2][lv]} Bugs/M, Technik +${Math.floor(STAFF_STAT_BONUS[lv]*0.6)}${lv>=3?`, Release-Wertung +${lv-2}`:''}`
  },
  bizdev:{
    n:'Head of Business',
    d:'Verhandelt mit Publishern, Plattformen und Engine-Lizenznehmern.',
    sal:2,
    stat:'business',
    effDesc:lv=>`Business +${STAFF_STAT_BONUS[lv]}${lv>=2?`, Publisher-Abgabe −${lv>=5?8:lv>=3?5:3} %`:''}${lv>=4?`, Lizenzen/Merch +${lv===5?30:20} %`:''}`
  }
};

/* ===================== Studio-Shop ===================== */
const SHOP=[
  {id:'messe',c:'Marketing',n:'Messestand',d:'Eigener Stand auf einer großen Spielemesse.',cost:8,min:2,st:'business',dc:11,s:{hype:2,wl:3},sx:'Lange Schlangen am Stand, die Demo kommt an.',f:{hype:1,wl:1},fx:'Euer Stand liegt direkt neben den Toiletten.'},
  {id:'showcase',c:'Marketing',n:'Trailer in einer Showcase-Show',d:'Zwei Minuten in der großen Sommer-Show.',cost:25,min:2,st:'design',dc:13,s:{hype:4,wl:6},sx:'Der Chat explodiert, euer Spiel trendet weltweit.',f:{hype:1,wl:1},fx:'Zwischen zwei Blockbustern geht ihr unter.'},
  {id:'influencer',c:'Marketing',n:'Influencer-Kampagne',d:'Bezahlte Videos bei fünf großen Kanälen.',cost:6,eff:{hype:1,wl:2},sx:'Fünf Videos, Hunderttausende Aufrufe.'},
  {id:'plakate',c:'Marketing',n:'Plakate am Bahnhof',d:'Großflächen in fünf Städten.',cost:4,eff:{hype:1},sx:'Euer Logo hängt neben der Werbung für Bausparverträge.'},
  {id:'tv',c:'Marketing',n:'TV-Spot zur Primetime',d:'Dreißig Sekunden vor dem Samstagabend-Krimi.',cost:40,tiers:['aaa'],eff:{hype:3,wl:5},sx:'Sogar eure Eltern haben es gesehen.'},
  {id:'fokus',c:'Qualität',n:'Fokusgruppen-Playtest',d:'Echte Spieler testen das Gameplay, ihr schaut durch die Scheibe.',cost:5,st:'design',dc:10,s:{gp:7},sx:'Die Tester finden genau die Stellen im Spielfluss, die euch nie aufgefallen sind.',f:{gp:3},fx:'Die Gruppe will vor allem mehr Pausen.'},
  {id:'extqa',c:'Qualität',n:'Externe QA-Firma',d:'Fünfzig Tester für einen Monat.',cost:8,eff:{bugs:-6},sx:'Hunderte Tickets, sauber sortiert.'},
  {id:'orchester',c:'Qualität',n:'Orchesteraufnahme',d:'Ein echtes Orchester spielt euren Soundtrack ein.',cost:15,eff:{snd:12,gp:1,hype:1},sx:'Gänsehaut beim Titelthema.'},
  {id:'foley',c:'Qualität',n:'Foley- & Sounddesign-Studio',d:'Schritte, Schwerter, Regen: Jeder Klang wird echt aufgenommen.',cost:6,eff:{snd:7},sx:'Selbst das Menü klingt jetzt satt.'},
  {id:'mocap',c:'Qualität',n:'Motion-Capture-Studio',d:'Echte Schauspieler-Bewegungen statt Handanimation.',cost:12,eff:{gfx:7,gp:2},sx:'Die Figuren bewegen sich endlich wie echte Menschen.'},
  {id:'a11y',c:'Qualität',n:'Barrierefreiheits-Audit',d:'Untertitel, Farbmodi, frei belegbare Tasten.',cost:5,eff:{gp:3},sx:'Mehr Menschen können euer Spiel spielen. Wertung +2 beim Release.'},
  {id:'hardware',c:'Studio',n:'Neue Workstations',d:'Schnellere Builds, weniger Abstürze.',cost:6,eff:{gfx:2},sx:'Ab jetzt −0,25 Bugs pro Monat und flüssigere Grafik-Tests.'},
  {id:'pipeline',c:'Studio',n:'Bessere Tools und Pipeline',d:'Automatische Builds und Tests.',cost:8,eff:{zeit:1,bugs:-2},sx:'Der Build läuft jetzt in zwölf statt neunzig Minuten.'},
  {id:'reise',c:'Studio',n:'Teamreise',d:'Drei Tage Ostsee mit dem ganzen Team.',cost:6,eff:{moral:2},sx:'Sonnenbrand, Fischbrötchen, neue Ideen (+1 Loyalität bei allen Leads).'},
  {id:'hund',c:'Studio',n:'Bürohund',d:'Ein Labrador namens Pixel.',cost:1,eff:{moral:1},sx:'Pixel liegt unter dem Tisch des Lead-Programmierers.'},
  {id:'refactoring',c:'Studio',n:'Engine-Grafik- & Tech-Frischzellenkur',d:'Baut Technische Schulden ab und verjüngt eure eigene Engine um 1 Alterungs-Stufe.',cost:12,eff:{bugs:-3,gfx:4,gp:2},sx:'Der Renderer glänzt wieder: Technische Schulden weg und Engine verjüngt!'},
  {id:'merch',c:'Spekulativ',n:'Merchandise vorproduzieren',d:'Shirts, Tassen, Figuren. Verkauft sich nur, wenn das Spiel ankommt.',cost:10,eff:{},sx:'Der Keller ist voller Kartons. Ab Wertung 75 werden sie zu Geld.'},
  {id:'awards',c:'Spekulativ',n:'Award-Einreichungen',d:'Euer Spiel wird bei mehreren Preisen eingereicht.',cost:3,eff:{},sx:'Ab Wertung 80 bringen Preise 10 % mehr Verkäufe.'}
];

/* ===================== Notlage / Finanzierung ===================== */
const RESC=[
  {id:'privat',n:'Privatgeld des Directors',d:'Ohne Wurf, solange das Privatkonto reicht.',avail:()=>C.dir.wealth>0},
  {id:'publisher',n:'Publisher um Nachschuss bitten',st:'business',dc:15,bonus:()=>(Math.floor(S.res.hype/3)+Math.floor(S.res.qual/30)-Math.floor(S.res.bugs/10))*4,d:'Hype und Qualität helfen, Bugs schaden. Kostet 10 % mehr Umsatzanteil, bei einer neuen IP gehen die Rechte an den Publisher.',sx:'Der Publisher glaubt an euch und überweist.',fx:'Der Publisher legt einfach auf.'},
  {id:'kredit',n:'Bankkredit',st:'business',dc:14,bonus:()=>(Math.floor(S.res.qual/30)-(S.loan?3:0))*4,d:'Qualität zählt als Sicherheit, ein laufender Kredit erschwert es. 2 % Zinsen pro Monat, Rückzahlung bei der Abrechnung.',sx:'Die Bank gibt den Kredit frei.',fx:'Die Bank versteht nicht, was ein Indie-Spiel ist.'},
  {id:'investor',n:'Investor suchen',st:'business',dc:15,bonus:()=>(Math.floor(S.res.hype/2)+Math.floor(S.res.wl/(8000*T().sales)))*4,d:'Hype und Wishlists zählen. Der Investor bekommt 20 % vom Gewinn.',sx:'Ein Fonds steigt ein.',fx:'Der Investor will lieber in Pflanzenmilch investieren.'},
  {id:'crowd',n:'Notruf an die Community',st:'business',dc:15,tiers:['indie','aa'],bonus:()=>(S.res.hype-3)*4,d:'Hängt fast nur am Hype. Scheitert es, wirkt es verzweifelt: −2 Hype.',sx:'Die Fans retten euch in 72 Stunden.',fx:'Die Kampagne wird zum Mitleids-Meme.'},
  {id:'ea',n:'Notfall-Early-Access',avail:()=>!S.ea&&S.model!=='f2p',d:'Sofort Geld aus Vorab-Verkäufen. Die Kritiker ziehen später 3 Punkte ab.'},
  {id:'downsize',n:'Büro & Verwaltung verschlanken',avail:()=>C.studio.overheadDrift>0||C.studio.salaryDrift>0,d:'Ohne Wurf. Baut angehäufte Gehalts- und Infrastruktur-Inflation um die Hälfte ab, kostet aber −2 Moral und −5 Studio-Fame.'},
  {id:'layoff',n:'Stellen abbauen',d:'Ohne Wurf. Gehälter dauerhaft −30 %, Moral −3, Loyalität aller Leads −2, Team-Würfe −6.'},
  {id:'haus',n:'Der Director verpfändet sein Haus',st:'team',dc:14,d:'Führungs-Wurf. Klappt es, gibt es Geld und das Team zieht mit (+2 Moral). Klappt es nicht, ist das Studio am Ende.',sx:'Die Bank akzeptiert. Das Team ist sprachlos und legt sich ins Zeug.',fx:'Die Bank lehnt ab. Das war die letzte Karte.'}
];

/* ===================== Post-Release DLC / Live-Update Optionen ===================== */
const DLC_OPTS=[
  {
    id:'story_dlc',
    n:'Große Story-Erweiterung (Add-on)',
    d:'Ein vollwertiges Add-on mit neuem Gebiet und Bossen. Kostet 2,5 Monatsbudgets, verkauft sich an treue Fans.',
    costMonths:2.5,
    st:'design',
    dc:12,
    sx:'Die Erweiterung begeistert Fans und Presse! Starke Zusatzverkäufe und +4 Fame.',
    fx:'Nett, aber zu kurz. Ein paar Fans kaufen es trotzdem, die Kosten kommen knapp rein.'
  },
  {
    id:'patch20',
    n:'Kostenloses „Version 2.0“-Rettungs-Update',
    d:'Komplettüberholung für ein holpriges Spiel. Kostet 2 Monatsbudgets, bringt späte Käufe, Wertungs-Bonus (+5) und stellt euren Ruf wieder her.',
    costMonths:2.0,
    st:'technik',
    dc:12,
    sx:'„Das Comeback des Jahres!“ Die Reviews drehen auf Positiv, neue Käufer strömen herein (+6 Fame).',
    fx:'Viele Bugs sind weg, aber die meisten Spieler sind schon weitergezogen.'
  },
  {
    id:'cosmetic_pass',
    n:'Supporter-Pack & Kosmetik-DLC',
    d:'Goldene Skins, Artbook und Soundtrack-Paket. Geringer Aufwand (1 Monatsbudget), schnelles Geld.',
    costMonths:1.0,
    st:'business',
    dc:11,
    sx:'Die treuesten Fans greifen sofort zu. Hohe Marge für die Studiokasse!',
    fx:'„Pferderüstung 2.0“ spottet das Forum. Wenig Umsatz und −2 Studio-Fame.'
  },
  {
    id:'engine_upgrade',
    n:'Next-Gen Engine-Overhaul zwischen den Projekten',
    d:'Das Tech-Team nutzt die Pause nach dem Release, um eure eigene Engine komplett auf den neuesten Grafik- & Gameplay-Stand zu bringen (2 Monatsbudgets).',
    costMonths:2.0,
    st:'technik',
    dc:11,
    cond:()=>C&&C.studio.engine,
    sx:'Durchbruch! Eure eigene Engine ist wieder Next-Gen (Alterung auf 0), steigt eine Version auf und erhält ein neues Modul.',
    fx:'Solide Modernisierung: Die Engine verjüngt sich deutlich und alle Technischen Schulden sind abgebaut.'
  }
];

/* ===================== Directors & Freischaltbare Branchen-Legenden (W100-Skala) ===================== */
const DSTAT={
  vision:['Vision','Design-Würfe (+4 pro Punkt über 1)'],
  technik:['Technik','Technik-Würfe (+4 pro Punkt über 1)'],
  fuehrung:['Führung','Team-Würfe (+4), Start-Moral & Lead-Loyalität'],
  business:['Geschäftssinn','Business-Würfe (+4 pro Punkt über 1)'],
  hype:['Hype-Magnet','Start-Hype, Marketing und Wishlists'],
  polish:['Polish','Grafik & Gameplay pro Monat und weniger Bugs']
};

const ABIL={
  reroll:{n:'Nur noch eine Runde',d:'Einen misslungenen Wurf wiederholen.'},
  cash:{n:'Raumschiff-JPEG verkaufen',d:'Die Community zahlt sofort: +40 Budget und +1 Hype, aber −1 Monat.'},
  rewrite:{n:'Assembler-Nachtschicht',d:'Ein Wochenende allein mit dem Code: −8 Bugs und +5 Grafik.'},
  promi:{n:'Hollywood-Cameo',d:'Ein Filmstar im 40-Minuten-Trailer: +3 Hype und +3.000× Wishlists.'},
  tiefe:{n:'Giftiger Sumpf & Geheimlore',d:'Masochistische Tiefe: +10 Gameplay und +3 Grafik.'},
  ankuend:{n:'Der Magische Eichenbaum',d:'Gigantisches Versprechen auf der Bühne: +4 Hype, +4.000× Wishlists, aber +1 offenes Versprechen.'},
  works:{n:'It just works!',d:'Selbst auf einem Toaster: Beim Review-Wurf zählen die Bugs nicht.'},
  tisch:{n:'Den Teetisch umwerfen',d:'Kompletter Neustart für den Spielspaß: +10 Gameplay, +6 Grafik, −2 Monate.'},
  fans:{n:'Crowd-Charme & Zeitreise-Spülung',d:'Die Fans finanzieren mit: +30 Budget und +1 Hype.'},
  community:{n:'Voxel-Community-Jam',d:'Spieler und Team bauen zusammen: +3 Moral, −3 Bugs.'},
  shred:{n:'Hair-Metal-Deathmatch',d:'90er-Rocker-Energie im Büro: +7 Gameplay, +3 Hype, +2 Bugs.'},
  sim:{n:'Pool-Leiter entfernen',d:'Emergente System-Simulation: +9 Gameplay, +2 Grafik.'},
  sale:{n:'90-%-Sommer-Sale-Segen',d:'Der Store-Patriarch öffnet die Geldbörsen: +35 Budget, +5.000× Wishlists.'},
  excel:{n:'Bratwurst & Master-Tabelle',d:'Perfekte Balance-Formel: +8 Gameplay, −4 Bugs.'},
  vent:{n:'Lüftungsschacht 0451',d:'Jedes Problem hat drei Lösungswege: +9 Gameplay, −3 Bugs.'},
  noir:{n:'Doppelter Espresso im Regen',d:'Finnische Meta-Poesie: +7 Gameplay, +5 Grafik, +1 Inspiration.'},
  insult:{n:'Gummihuhn mit Seilrolle',d:'Beleidigungs-Fechten lockert das Team auf: +8 Gameplay, +2 Moral.'},
  fairytale:{n:'Goldene Märchenfeder',d:'Atmosphärische Erzählkunst: +7 Gameplay, +4 Grafik, +1 Hype.'},
  occult:{n:'Schattenjagd in New Orleans',d:'Düstere Mysterien & historische Tiefe: +8 Gameplay, +4 Grafik.'},
  chaos:{n:'Hasen-Polizei-Slapstick',d:'Völlig durchgeknallte Action: +6 Gameplay, +5 Grafik, +2 Hype.'},
  kolonie:{n:'Erzbaron-Schichtwechsel',d:'Rauer Charme & Scavenger-Spieß: +8 Gameplay, +2 Moral.'},
  monopol:{n:'Exklusiver OS-Vorvertrag',d:'Auf jedem Büro-PC vorinstalliert: +45 Budget, +3.000× Wishlists, +2 Bugs.'},
  minimal:{n:'Ein-Knopf-Design-Purismus',d:'Alles Überflüssige fliegt raus: +9 Grafik, +3 Hype, −1 Moral.'},
  kernel:{n:'Grimmiger Kernel-Rewrite',d:'4.000 Zeilen sauberer Code: −10 Bugs, +4 Grafik, −1 Moral.'},
  telemetry:{n:'Metaverse-Telemetrie-Deal',d:'Daten gegen Bargeld: +40 Budget, −3 Bugs, −1 Hype.'},
  pagerank:{n:'Rollerskate-Suchalgorithmus',d:'Platz 1 in allen Suchmaschinen: +6.000× Wishlists, +2 Hype.'}
};

const PERKS={
  engine:{n:'Engine-Flüsterer',c:2,d:'Würfe für eigene Engine, Server und Plattform-Ports +15'},
  kritik:{n:'Kritikerliebling',c:3,d:'Wertung beim Release +4'},
  netz:{n:'Netzwerker',c:2,d:'Startbudget +15 %, Business-Würfe +5'},
  spezial:{n:'Genre-Spezialist',c:2,d:'Genre-Bonus +5 und +4 Start-Gameplay im gewählten Genre'},
  crunch:{n:'Crunch-frei',c:2,d:'Jeder Moralverlust fällt um 1 geringer aus, Leads sind loyaler'},
  glueck:{n:'Glückspilz',c:3,d:'Kritischer Erfolg beim W100 schon ab 91 statt 96'},
  spar:{n:'Sparfuchs',c:2,d:'Monatliche Kosten −10 % und geringere Gehaltsinflation'},
  ea:{n:'Early-Access-Profi',c:2,d:'Early-Access-Einnahmen +50 %'}
};

const FLAWS={
  creep:{n:'Feature Creep',c:3,d:'Ständig neue Ideen. Eigene Ereignisse kosten Zeit und Geld.'},
  perfekt:{n:'Perfektionist',c:2,d:'Alle 4 Monate −1 Monat Zeit, dafür +2 Gameplay & +2 Grafik.'},
  diva:{n:'Diva',c:2,d:'Alle 3 Monate −1 Moral, belastet die Loyalität der Leads.'},
  kosten:{n:'Kostenexplosion',c:2,d:'Monatliche Kosten +15 %, teure Extratouren.'},
  social:{n:'Social-Media-Ausraster',c:1,d:'Nächtliche Posts sorgen für Hype oder Ärger.'},
  technikfern:{n:'Technikfern',c:2,d:'Technik-Würfe −8, fummelt selbst im Code herum.'},
  verspricht:{n:'Versprecher',c:2,d:'Startet mit +2 Hype und einem Versprechen. Jedes offene Versprechen kostet 2 Wertungspunkte.'},
  buggy:{n:'Großzügig mit Bugs',c:2,d:'+1 Bug pro Monat.'}
};

/*
  Branchen-Legenden (spielbar sind nur die mit Porträt in raw-assets/chars, siehe LEGEND_KEYS):
  - Zu Beginn ist keine Legende freigeschaltet, der erste Director ist immer ein eigener.
  - Freischaltung: eine zufällige Legende beim ersten Top-Erfolg, eine beim ersten AA/AAA-Release.
  - Danach tauchen Legenden als Zufallsbegegnung auf. Angeworben (oder in einer Gast-Session
    überzeugt) sind sie dauerhaft freigeschaltet und in neuen Karrieren als Game Director wählbar.
*/
const DIRS={
  // === Die ersten 6 Legenden ===
  sid:{
    n:'Sid Onemoreturn',
    tag:'Der Hexagon-Professor',
    img:'raw-assets/chars/24002de1-051f-4de4-9feb-47c48c842065.jpg',
    leadRole:'producer',
    d:'Meister der Rundenstrategie mit Taschenuhr und leuchtenden Hexfeld-Kacheln. Wenn er am Spieltisch sitzt, sagt das ganze Büro um drei Uhr nachts: „Nur noch eine Runde …“',
    encStory:'Ein freundlicher Herr in Strickweste legt eine leuchtende sechseckige Geländekachel auf euren Konferenztisch und blickt auf seine goldene Taschenuhr: „Eurer Spielschleife fehlt die magische ‚Nur-noch-eine-Runde‘-Formel. Wollt ihr, dass ich euren Spielfluss überarbeite?“',
    encEff:{gp:8,bugs:-2},
    s:{vision:3,technik:2,fuehrung:2,business:1,hype:0,polish:3},
    aff:{sim:2,rpg:1},perks:['spezial'],flaws:['perfekt'],ab:'reroll'
  },
  trainmag:{
    n:'Jon Framerack',
    tag:'Der Engine-Hexenmeister',
    img:'raw-assets/chars/8f1d7feb-17d6-4ddd-92db-cbe95f5f638c.jpg',
    leadRole:'senior',
    d:'Optimierungs-Gott mit VR-Brille und Raketendüse unterm Arm. Schreibt 3D-Renderer in reinem Assembler und hält Handlung in Spielen für völlig überflüssig.',
    encStory:'Ein Mann mit Brille, VR-Headset um den Hals und einer Raketendüse unterm Arm starrt auf euren Monitor: „Eure Framerate schwankt um 0,4 Millisekunden. Gebt mir eine Kiste Diät-Cola und ein Wochenende, dann schreibe ich euch den Renderer in Assembler neu.“',
    encEff:{gfx:8,bugs:-6},
    s:{vision:1,technik:4,fuehrung:0,business:1,hype:1,polish:2},
    aff:{action:2,actadv:1,sports:1},perks:['engine'],flaws:[],ab:'rewrite'
  },
  kojimba:{
    n:'Hideo Cutscenima',
    tag:'Der Kino-Autorenfilmer',
    img:'raw-assets/chars/ad8fa7ee-22a4-42ac-a12e-831bfacb9811.jpg',
    leadRole:'art',
    d:'Trägt Filmklappe und leuchtende Inkubator-Kapsel mit sich herum. Jede Zwischensequenz dauert 45 Minuten, und im Vorspann steht siebenmal sein eigener Name.',
    encStory:'Im Flur steht plötzlich ein Herr im Trenchcoat mit Filmklappe und einer gelb leuchtenden Kapsel: „Eurem Spiel fehlt das existenziell-filmische Strand-Phänomen! Lasst mich Regie, Schnitt, Drehbuch und Catering übernehmen.“',
    encEff:{gfx:6,hype:3,wl:3},
    s:{vision:4,technik:2,fuehrung:2,business:1,hype:4,polish:2},
    aff:{adventure:1,actadv:1,rpg:1},perks:['netz'],flaws:['kosten','diva'],ab:'promi'
  },
  molynox:{
    n:'Peter Promiseux',
    tag:'Der Hype-Beschwörer',
    img:'raw-assets/chars/7b6e442d-884b-40c0-9506-59c1c6c66639.jpg',
    leadRole:'community',
    d:'Beschwört auf Pressekonferenzen goldene Eicheln, aus denen in Echtzeit ganze Königreiche wachsen sollen — während hinter ihm heimlich die Feature-Liste geschreddert wird.',
    encStory:'Mit wehendem Schal und leuchtender goldener Eichel in der Hand stürmt Peter Promiseux in euer Büro: „Freunde! Wenn der Spieler diesen Samen pflanzt, spürt er den Wind der Ewigkeit! Lasst mich mit der Presse reden — sie werden weinen vor Glück!“',
    encEff:{hype:4,wl:4,gp:2},
    s:{vision:4,technik:1,fuehrung:2,business:1,hype:4,polish:0},
    aff:{sim:1,rpg:1},perks:[],flaws:['verspricht'],ab:'ankuend'
  },
  williams:{
    n:'Roberta Willowisp',
    tag:'Die Märchen-Chronistin',
    img:'raw-assets/chars/5dd8f2d7-6800-425f-81ea-66a5d401dd73.jpg',
    leadRole:'art',
    d:'Schreibt mit goldener Feder viktorianische Märchen-Adventures voller Zauberwälder — in denen unvorsichtige Spieler alle drei Meter an einer giftigen Beere sterben.',
    encStory:'Eine Dame in bestickter viktorianischer Weste schlägt ein dickes Märchenbuch mit goldener Schreibfeder auf: „Eure Welt braucht mehr Poesie, Königsschlösser — und mindestens zwanzig überraschende Wege, wie der Held aus Versehen eine Klippe hinunterstürzt!“',
    encEff:{gp:7,gfx:4},
    s:{vision:4,technik:1,fuehrung:2,business:1,hype:1,polish:2},
    aff:{adventure:2,rpg:1,sim:1},perks:['kritik'],flaws:['perfekt'],ab:'fairytale'
  },
  persson:{
    n:'Markus Blocksson',
    tag:'Der Voxel-Eremit',
    img:'raw-assets/chars/e02d6364-762a-496d-8bf0-0492236029e0.jpg',
    leadRole:'senior',
    d:'Das schüchterne Indie-Genie mit Filzhut und Pixel-Spitzhacke, das aus simplen Erd- und Grasblöcken im Alleingang ein Weltimperium zimmerte.',
    encStory:'Ein bärtiger Entwickler mit Filzhut hält schüchtern einen leuchtenden Gras-Würfel und eine Pixel-Spitzhacke hoch: „Ich rede nicht gern vor großen Gruppen, aber ich habe heute Nacht einen prozeduralen Voxel-Generator für euch gecodet.“',
    encEff:{gp:7,bugs:-3,wl:2},
    s:{vision:3,technik:3,fuehrung:1,business:1,hype:1,polish:2},
    aff:{sim:2,actadv:1},perks:['ea'],flaws:[],ab:'community'
  },

  // === Weitere Legenden ===
  robert:{
    n:'Chris Roadmap',
    tag:'Der Crowdfund-Admiral',
    img:'raw-assets/chars/adb53794-5f8c-482c-881c-146a3ca82a56.jpg',
    leadRole:'bizdev',
    d:'Trägt Raumanzug im Büro und verkauft virtuelle Raumschiff-JPEGs für Tausende Euro, während der Release-Termin gemütlich Richtung Jahr 2999 wandert.',
    encStory:'In einem glänzenden Raumanzug schwebt der „Crowdfund-Admiral“ herein und projiziert ein holografisches Raumschiff an die Wand: „Warum ein fertiges Spiel verkaufen, wenn eure Fans heute schon für 800 Euro Konzeptzeichnungen von Raumschiff-Bettwäsche kaufen würden?“',
    encEff:{budget:35,hype:2,zeit:-1},
    s:{vision:4,technik:1,fuehrung:1,business:3,hype:4,polish:0},
    aff:{action:1,rpg:2,sports:1},perks:['netz'],flaws:['creep','kosten'],ab:'cash'
  },
  romero:{
    n:'Johnny Doomero',
    tag:'Der Hair-Metal-Slayer',
    img:'raw-assets/chars/6f231d56-fbc1-45c3-bb5f-4abd7e8ea487.jpg',
    leadRole:'art',
    d:'90er-Rockstar mit wallender schwarzer Mähne, Sonnenbrille und Nietenweste. Baut pfeilschnelle Action-Level und zertrümmert beim Deathmatch die Büro-Tastaturen.',
    encStory:'Heavy-Metal-Riffs dröhnen aus dem Flur! Ein langhaariger Designer mit Sonnenbrille und Nietenweste lehnt lässig am brennenden Arcade-Automaten: „Euer Spiel ist viel zu brav, Leute. Lasst mich ein paar geheime Raketenwerfer-Arenen und 90er-Attitüde einbauen!“',
    encEff:{gp:7,hype:3,bugs:1},
    s:{vision:3,technik:2,fuehrung:1,business:1,hype:4,polish:0},
    aff:{action:2,actadv:1},perks:['spezial'],flaws:['diva','social'],ab:'shred'
  },
  mizaki:{
    n:'Hidetaka Gitguda',
    tag:'Der Giftsumpf-Architekt',
    img:'raw-assets/chars/1493afdb-5aa5-4764-b0e6-ba244a78194b.jpg',
    leadRole:'art',
    d:'Lächelt höflich im dunklen Anzug, während er knöcheltief im grünen Giftsumpf steht und den Spielern einen leuchtenden „DU BIST GESTORBEN“-Grabstein überreicht.',
    encStory:'Ein überaus höflicher Herr im Anzug steht plötzlich im Konferenzraum — unter seinen Schuhen blubbert eine giftgrüne Pfütze: „Entschuldigung, aber wäre Ihr drittes Kapitel nicht viel berührender, wenn der Spieler dort langsam vergiftet wird und ein riesiges Schwert ihn zermalmt?“',
    encEff:{gp:9,gfx:4},
    s:{vision:4,technik:2,fuehrung:2,business:1,hype:1,polish:4},
    aff:{actadv:2,rpg:2,sim:-1,puzzle:-1},perks:['kritik'],flaws:['perfekt'],ab:'tiefe'
  },
  wright:{
    n:'Will Antwright',
    tag:'Der Ameisenfarm-Bürgermeister',
    img:'raw-assets/chars/80db9d46-86d3-4f02-9789-6abc3c3f129b.jpg',
    leadRole:'senior',
    d:'Trägt Hawaiihemd unterm grünen Kristall-Diamanten, hält eine Ameisenfarm in der Hand und entfernt zu Testzwecken gerne mal die Leiter aus dem Swimmingpool.',
    encStory:'Ein gut gelaunter Tüftler im roten Hawaiihemd stellt eine gläserne Ameisenfarm und ein Modell-Hochhaus auf euren Schreibtisch: „Was passiert eigentlich in eurer KI, wenn wir einen Tornado loslassen und gleichzeitig die Pool-Leiter löschen? Lasst es uns herausfinden!“',
    encEff:{gp:8,gfx:3},
    s:{vision:4,technik:3,fuehrung:2,business:1,hype:1,polish:2},
    aff:{sim:2,puzzle:1},perks:['spezial'],flaws:['creep'],ab:'sim'
  },
  newell:{
    n:'Gabe Neverthree',
    tag:'Der Store-Patriarch',
    img:'raw-assets/chars/bab929b3-c14f-4ed6-8d57-111e06d86c5d.jpg',
    leadRole:'bizdev',
    d:'Der weißbärtige Gott der Sommer-Sales mit roter Brechstange und „−90 %“-Preisschild. Beherrscht den digitalen Weltmarkt, kann aber partout nicht bis Drei zählen.',
    encStory:'Ein gemütlicher Herr mit Vollbart, roter Brechstange und einem leuchtenden „−90 % RABATT“-Schild lehnt am Tresor: „Ich kann euch zwar nicht bei einem dritten Teil helfen — diese Zahl existiert für mich nicht —, aber ich kann euer Spiel auf die Startseite des nächsten Mega-Sales setzen.“',
    encEff:{budget:30,wl:5,hype:2},
    s:{vision:2,technik:2,fuehrung:3,business:4,hype:3,polish:2},
    aff:{action:2,rpg:1},perks:['netz','ea'],flaws:['perfekt'],ab:'sale'
  },
  miyamotto:{
    n:'Shigeru Mushroomoto',
    tag:'Der Spielzeug-Sensei',
    img:'raw-assets/chars/c63e15b1-bbb0-44fe-a5c6-cda34c5f1c0b.jpg',
    leadRole:'producer',
    d:'Der weißhaarige Altmeister in bunter Bastelschürze mit Aufzieh-Roboter und Riesen-Bleistift. Ein verschobenes Spiel wird irgendwann gut, ein schlechtes bleibt für immer schlecht.',
    encStory:'Ein strahlender Altmeister in bunter Bastelschürze zieht einen kleinen Blech-Roboter auf eurem Schreibtisch auf: „Wenn sich das Springen schon ohne Grafik nach purem Glück anfühlt, habt ihr gewonnen! Sollen wir gemeinsam am Spielgefühl feilen?“',
    encEff:{gp:10,gfx:4,moral:1},
    s:{vision:4,technik:2,fuehrung:3,business:1,hype:2,polish:4},
    aff:{actadv:2,sim:2,sports:1,adventure:1},perks:['kritik'],flaws:['perfekt'],ab:'tisch'
  },
  gates:{
    n:'Billi Torweg',
    tag:'Der OS-Baron',
    isScene:true,
    img:'raw-assets/encounter/aef913b5-0ca2-4505-b3fb-285070a3599e.jpg',
    leadRole:'bizdev',
    d:'Der bebrillte 90er-Software-Monopolist im Strickpullunder. Wedelt mit 3,5-Zoll-Disketten und Exklusiv-Verträgen, während im Hintergrund die Monitore blau aufleuchten.',
    encStory:'Ein verschmitzt grinsender Tech-Mogul im Musterpullunder legt einen dicken Stapel Lizenzverträge und eine blaue Diskette auf den Tisch, während hinter ihm drei Monitore einen Blue Screen zeigen: „Unterschreibt für mein Betriebssystem, und ich mache euch reich!“',
    encCollabLabel:'💾 Exklusiv-Vertrag für sein Betriebssystem verhandeln',
    encPassLabel:'🐧 Ablehnen & unabhängig bleiben (+1 Moral, +1 Hype)',
    encPassEff:{moral:1,hype:1},
    encEff:{budget:40,wl:3,bugs:2},
    s:{vision:2,technik:3,fuehrung:1,business:4,hype:2,polish:0},
    aff:{sim:2,sports:1,rpg:1},perks:['netz','spar'],flaws:['buggy'],ab:'monopol'
  },
  jobs:{
    n:'Stefan Obst',
    tag:'Der Rollkragen-Prophet',
    isScene:true,
    img:'raw-assets/encounter/71c5fb25-a250-434f-abff-601b6712e1bb.jpg',
    leadRole:'art',
    d:'Radikaler Design-Purist und theatralischer Interface-Kritiker. Duldet keine Menüs mit mehr als einem einzigen Knopf und nennt alles andere eine Beleidigung für das Auge.',
    encStory:'Ein dramatischer Design-Purist stürmt ins Studio, deutet entsetzt auf euer HUD und ruft: „Sacré bleu! Das ist ein Überfall auf die menschliche Netzhaut! Weg mit den siebzehn Untermenüs — wir brauchen Eleganz, Weißraum und abgerundete Ecken!“',
    encCollabLabel:'✨ Komplettes Interface nach seiner Design-Vision umbauen',
    encPassLabel:'🙅‍♂️ Seinen Wutausbruch höflich ignorieren (+1 Moral)',
    encPassEff:{moral:1},
    encEff:{gfx:9,gp:3,moral:-1},
    s:{vision:4,technik:1,fuehrung:1,business:3,hype:4,polish:3},
    aff:{puzzle:2,sports:1,adventure:1},perks:['kritik'],flaws:['diva','perfekt'],ab:'minimal'
  },
  torvalds:{
    n:'Linus Tundravalds',
    tag:'Der Kernel-Pinguin',
    isScene:true,
    img:'raw-assets/encounter/dc3ba1df-f5ec-4149-9121-7299c4a258c5.jpg',
    leadRole:'senior',
    d:'Der bärtige Open-Source-Guru im grünen Flanellhemd und Wollsocken, mit einem kleinen Pinguin auf der Schulter. Hasst unsauberen Code, repariert aber jeden Server-Kernel.',
    encStory:'Ein bärtiger Programmierer in Wollsocken und grünem Flanellhemd — mit einem kleinen Pinguin auf der Schulter — haut im Serverraum auf das blinkende Rack: „Wer hat diesen Speicher-Müll verbrochen?! Lasst mich sofort an die Konsole, bevor mir der Kragen platzt!“',
    encCollabLabel:'🐧 Ihn den kompletten Engine-Kernel reparieren lassen',
    encPassLabel:'🛡️ Euren eigenen Code verteidigen (+1 Moral, +2 Gameplay)',
    encPassEff:{moral:1,gp:2},
    encEff:{bugs:-9,gfx:4,moral:-1},
    s:{vision:1,technik:4,fuehrung:0,business:1,hype:1,polish:4},
    aff:{rpg:2,action:2,sim:1},perks:['engine'],flaws:['diva'],ab:'kernel'
  },
  zuckerberg:{
    n:'Markus Zuckerborg',
    tag:'Der Social-Android',
    isScene:true,
    img:'raw-assets/encounter/8217b3a2-e17c-4185-a44f-466a37d82a75.jpg',
    leadRole:'bizdev',
    d:'Tritt ohne mit der Wimper zu zucken im grauen T-Shirt aus einem Daten-Portal. Kennt jede Klick-Metrik eurer Spieler und will aus allem ein soziales Metaverse bauen.',
    encStory:'Ein blasser, verdächtig ruhig blinzelnder Tech-CEO im grauen Shirt tritt aus einem leuchtenden Binärcode-Portal im Serverraum und hält einen Geldsack hoch: „Hallo, menschliche Entwickler. Wenn ihr meine Telemetrie-Schnittstelle einbaut, finanziere ich eure Server.“',
    encCollabLabel:'📡 Telemetrie-Deal für Server-Finanzierung eingehen',
    encPassLabel:'🔒 Privatsphäre der Spieler schützen (+1 Moral, +1 Hype)',
    encPassEff:{moral:1,hype:1},
    encEff:{budget:35,bugs:-3,hype:-1},
    s:{vision:1,technik:3,fuehrung:1,business:4,hype:1,polish:1},
    aff:{puzzle:2,action:2,rpg:1},perks:['netz'],flaws:['social'],ab:'telemetry'
  },
  pagebrin:{
    n:'Lars Seite & Sergej Brille',
    tag:'Das Algorithmus-Duo',
    isScene:true,
    img:'raw-assets/encounter/60ff21e1-1fa0-4a4b-8576-cf20e63c9dee.jpg',
    leadRole:'community',
    d:'Zwei überdrehte Stanford-Mathegenies auf Rollerskates mit riesiger Lupe und bunten 90er-Windbreakern. Ihr Such-Algorithmus lässt die Wishlists explodieren.',
    encStory:'Scheppernd rollen zwei junge Forscher auf Inlineskates mit einer überdimensionalen Lupe und fliegenden Aktenstapeln mitten in euer Büro: „Wir indizieren das gesamte Netz! Wollt ihr unseren neuen Ranking-Algorithmus testen, damit jeder Spieler euch sofort findet?“',
    encCollabLabel:'🔍 Spiel für ihren neuen Such-Algorithmus optimieren',
    encPassLabel:'🎮 Lieber auf Spielspaß & Mundpropaganda setzen (+2 Gameplay, +1 Moral)',
    encPassEff:{gp:2,moral:1},
    encEff:{wl:6,hype:3},
    s:{vision:3,technik:4,fuehrung:1,business:3,hype:3,polish:1},
    aff:{puzzle:2,sim:1,rpg:1},perks:['engine','glueck'],flaws:['creep'],ab:'pagerank'
  },
  koehler:{
    n:'Gerd Tabellenkalk',
    tag:'Der Excel-Taktiker',
    img:'raw-assets/chars/096fa61d-5554-4120-8dc5-9e7b5c45a924.jpg',
    leadRole:'qalead',
    d:'Der deutsche Fußballmanager-Pionier mit Aktenordner, Kaffeebecher und Stadion-Bratwurst im Brötchen. Berechnet Spielspaß auf drei Nachkommastellen in gigantischen Tabellen.',
    encStory:'Mit einem dicken Leitz-Ordner unterm Arm und einer frisch gegrillten Stadion-Bratwurst in der Hand schaut Gerd Tabellenkalk auf eure Bildschirme: „Kinder, eure Wirtschaftskurve hat in Monat 7 einen Knick! Ich hab euch mal schnell ein Makro mit 40.000 Zeilen gebaut.“',
    encEff:{gp:8,bugs:-4},
    s:{vision:2,technik:3,fuehrung:2,business:3,hype:0,polish:3},
    aff:{sports:2,sim:2},perks:['spar','spezial'],flaws:[],ab:'excel'
  },
  spector:{
    n:'Warren Inspector',
    tag:'Der Entscheidungs-Architekt',
    img:'raw-assets/chars/eaf1662f-4c9e-4cdb-aa26-8a0b413219cc.jpg',
    leadRole:'senior',
    d:'Vater der Immersive Sims mit runder Brille, Trenchcoat, Schraubenschlüssel und Keycard. Jede verschlossene Tür im Spiel hat garantiert einen Lüftungsschacht daneben.',
    encStory:'Aus dem Lüftungsschacht über eurer Kaffeemaschine klettert ein bärtiger Herr im Trenchcoat mit Schraubenschlüssel und Keycard: „Warum zwingt ihr den Spieler durch die Vordertür? Gebt ihm drei Wege, vier moralische Grauzonen und den Zahlencode 0451!“',
    encEff:{gp:9,bugs:-2},
    s:{vision:4,technik:2,fuehrung:2,business:1,hype:1,polish:3},
    aff:{rpg:2,actadv:2,adventure:1},perks:['spezial'],flaws:['creep'],ab:'vent'
  },
  hauard:{
    n:'Todd Justworks',
    tag:'Der Lederjacken-Portierer',
    img:'raw-assets/chars/98e03cec-e4d8-479e-9037-621e47b9a050.jpg',
    leadRole:'bizdev',
    d:'Trägt eine ikonische braune Lederjacke, deutet auf schneebedeckte Berge („Ihr könnt dort hinaufklettern!“) und bringt euer Spiel notfalls sogar auf einem Toaster zum Laufen.',
    encStory:'In einer schicken braunen Lederjacke stellt Todd Justworks einen leuchtenden „Fantasy“-Spielekarton und einen umgebauten Küchen-Toaster auf den Tisch: „Seht ihr diesen Berg im Hintergrund? Man kann hinaufgehen. Und ich habe euer Spiel gerade auf diesen Toaster portiert!“',
    encEff:{hype:3,wl:4,gp:4,bugs:2},
    s:{vision:2,technik:2,fuehrung:2,business:3,hype:4,polish:0},
    aff:{rpg:2,sim:1},perks:['netz'],flaws:['buggy','verspricht'],ab:'works'
  },
  lake:{
    n:'Sam Darklake',
    tag:'Der Kaffee-Noir-Poet',
    img:'raw-assets/chars/08cefc3e-6ccd-451c-b6c8-8e837cb6fb69.jpg',
    leadRole:'art',
    d:'Finnischer Story-Meister im Nadelstreifenanzug mit dampfender Kaffeetasse im nächtlichen Regen. Berühmt für verkniffene Detektiv-Gesichter, Zeitlupe und irre Musical-Einlagen.',
    encStory:'Draußen prasselt der Regen ans Fenster, als ein finnischer Autor mit dampfender Kaffeetasse und losen Manuskriptblättern sein markantes Detektiv-Grinsen aufsetzt: „Die Dunkelheit schreibt die Geschichte um. Ich habe drei Seiten Meta-Drehbuch und sehr viel Kaffee mitgebracht.“',
    encEff:{gp:7,gfx:5,hype:1},
    s:{vision:4,technik:1,fuehrung:2,business:1,hype:3,polish:2},
    aff:{actadv:2,adventure:2,rpg:1},perks:['kritik'],flaws:['perfekt'],ab:'noir'
  },
  gilbert:{
    n:'Ron Grogbert',
    tag:'Der Beleidigungs-Freibeuter',
    img:'raw-assets/chars/634b0100-8b2a-4023-a4db-99649dde0047.jpg',
    leadRole:'qalead',
    d:'Piratenkapitän mit Brille, Degen und einem Gummihuhn mit Karabinerhaken in der Mitte. Gewinnt jedes Entwickler-Meeting durch pointiertes Beleidigungs-Fechten.',
    encStory:'Mit gezücktem Piratensäbel und einem Gummihuhn mit Seilrolle springt Ron Grogbert auf euren Schreibtisch: „Eure Dialoge kämpfen wie ein dummer Bauer! Lasst mich eure Rätsel-Ketten und den Humor auf Vordermann bringen, ihr Landratten!“',
    encEff:{gp:8,moral:2},
    s:{vision:4,technik:1,fuehrung:2,business:1,hype:2,polish:3},
    aff:{adventure:2,actadv:1,sim:1},perks:['spezial','crunch'],flaws:[],ab:'insult'
  },
  schafer:{
    n:'Tim Shearer',
    tag:'Der Cartoon-Zeitbieger',
    img:'raw-assets/chars/bd627e57-cb0b-4dcf-b8af-aeaabac7af79.jpg',
    leadRole:'community',
    d:'Lockenkopf im schrillen 90er-Hemd, der mit einer Zeitreise-Campingtoilette und einem lila Tentakel um den Arm die absurdesten Kult-Adventures der Welt entwirft.',
    encStory:'Aus einer hölzernen „Chron-o-John“-Zeitreise-Kabine stolpert ein gut gelaunter Designer im 90er-Musterhemd, während ein lila Tentakel nach seiner Schulter greift: „Keine Panik! Ich komme aus der Zukunft — wenn wir jetzt mehr schrägen Cartoon-Humor einbauen, wird das Spiel ein Klassiker!“',
    encEff:{gp:7,moral:2,zeit:1},
    s:{vision:4,technik:1,fuehrung:3,business:1,hype:2,polish:1},
    aff:{adventure:2,sim:1,actadv:1},perks:['crunch'],flaws:['kosten'],ab:'fans'
  },
  jensen:{
    n:'Jane Jinxen',
    tag:'Die Okkult-Detektivin',
    img:'raw-assets/chars/a6101eb3-3f6c-4e52-9fbc-90b4d860809d.jpg',
    leadRole:'art',
    d:'Schattenjägerin im schwarzen Ledermantel mit roten Handschuhen und Diktiergerät. Verwebt Voodoo-Mysterien in New Orleans und bayerische Schlösser zu packenden Thrillern.',
    encStory:'Im Schein einer Straßenlaterne lehnt Jane Jinxen mit roten Lederhandschuhen, Kassettenrekorder und einem in Leder gebundenen Okkultismus-Folianten: „Eurer Geschichte fehlt das echte historische Fundament und ein Hauch Gänsehaut. Sollen wir in den Archiven graben?“',
    encEff:{gp:8,gfx:4},
    s:{vision:4,technik:1,fuehrung:2,business:1,hype:2,polish:3},
    aff:{adventure:2,actadv:2,rpg:1},perks:['kritik'],flaws:['perfekt'],ab:'occult'
  },
  purcell:{
    n:'Steve Scribble',
    tag:'Der Chaos-Vollstrecker',
    img:'raw-assets/chars/2627886b-daed-4505-8b90-b71350e97fa1.jpg',
    leadRole:'art',
    d:'Comic-Zeichner im Trenchcoat mit überdimensionalem Revolver, Zeichenfeder und einem völlig durchgeknallten weißen Hasen auf der Schulter. Meister des anarchischen Slapsticks.',
    encStory:'Ein breit grinsender Illustrator im Trenchcoat — mit einem manisch lachenden weißen Hasen auf der Schulter — wirbelt einen riesigen Cartoon-Revolver und eine Zeichenfeder durch die Luft: „Braucht euer Projekt zufällig mehr Slapstick-Explosionen, Highway-Verfolgungsjagden und bissige Sprüche?“',
    encEff:{gfx:6,gp:6,hype:1},
    s:{vision:3,technik:1,fuehrung:2,business:1,hype:3,polish:2},
    aff:{adventure:2,action:1,sports:1},perks:['glueck'],flaws:['creep'],ab:'chaos'
  },
  pankratz:{
    n:'Björn Erzbaron',
    tag:'Der Kolonie-Veteran',
    img:'raw-assets/chars/5b2f8867-6436-4961-a32d-353fb304fb29.jpg',
    leadRole:'producer',
    d:'Trägt abgewetzte Lederweste, Spitzhacke und eine saftige Scavenger-Keule unterm Arm. Niemand baut dichtere Lagerfeuer-Atmosphäre und rauere Ruhrpott-Dialoge („Steck die Waffe weg!“).',
    encStory:'Am Eingang eurer Büroküche brät ein bärtiger Veteran in Lederweste eine riesige Fleischkeule über dem Toaster und winkt mit der Spitzhacke: „Hör mal zu, Kleiner: In deiner offenen Welt fehlt noch ordentlich Dreck, rauer Ton und eine magische Barriere. Lass mich mal ran!“',
    encEff:{gp:8,moral:2,wl:2},
    s:{vision:3,technik:1,fuehrung:3,business:1,hype:2,polish:1},
    aff:{rpg:2,actadv:1,sim:1},perks:['spezial','crunch'],flaws:['buggy'],ab:'kolonie'
  }
};

const DPTS=10;
const TA=['Neon','Echo','Rost','Nebel','Sternen','Glut','Funken','Eisen','Kristall','Mond','Schatten','Wolken','Asche','Äther','Runen','Cyber'];
const TB=['protokoll','saga','ritter','fabrik','hafen','garten','pfad','chronik','kolonie','arena','wächter','fieber','legende','schmiede','requiem','odyssee'];

/* ===================== Erweiterte Projekt-Extras & Lizenzen (Setup Screen 4) ===================== */
const PROJECT_EXTRAS={
  mods:{
    n:'🛠️ Mod-Support & Workshop',
    d:'Editor und Skript-Schnittstellen für die Community. Kostet monatlich Pflege, verlängert das Leben des Spiels enorm.',
    code:'+1× Kosten/Monat · +1 Start-Bug · +25 % Verkäufe (F2P +15 %)',
    upfront:0,monthly:1,eff:{bugs:1}
  },
  ea:{
    n:'🧪 Early-Access-Phase (ab Monat 8)',
    d:'Die Beta ist ab Monat 8 käuflich. Bringt Vorab-Einnahmen und Bug-Meldungen, nimmt dem Release aber etwas Überraschung.',
    code:'Vorab-Einnahmen & −1 Bug/Monat ab M8 · −2 Kritiker · ×0,85 Release-Spitze',
    upfront:0,monthly:0,eff:{}
  },
  sportLic:{
    n:'⚽ Offizielle Sport-, Liga- & Markenlizenz',
    d:'Echte Vereinswappen, Original-Stadien, lizenzierte Rennwagen oder Marken-Ausrüstung statt „FC Nordstadt“ und „Roter Flitzer“.',
    code:'Vorab 14× Klasse · +2 Start-Hype · +3.000× Wishlists · +25 % Verkäufe bei Sport/Rennspiel (+10 % sonst)',
    upfront:14,monthly:0,eff:{hype:2,wl:3}
  },
  coopMode:{
    n:'🤝 Koop- & Multiplayer-Modus',
    d:'Gemeinsam statt einsam: Ein zusätzlicher 2–4-Spieler-Koop-Modus begeistert Streamer, fordert aber Netcode und QA.',
    code:'+1× Kosten/Monat · +5 Gameplay · +1 Hype · +2 Start-Bugs · +15 % Verkäufe',
    upfront:0,monthly:1,eff:{gp:5,hype:1,bugs:2}
  },
  crossplay:{
    n:'☁️ Crossplay & Cloud-Saves',
    d:'Nahtloses Zusammenspiel und Spielstand-Synchronisation über PC, Konsole und Handhelds hinweg.',
    code:'Vorab 8× Klasse · +4 Technik-Wurfbonus · +2.000× Wishlists · +10 % Verkäufe',
    upfront:8,monthly:0,statBonus:{technik:4},eff:{wl:2}
  },
  soundtrack:{
    n:'🎻 Orchester-Soundtrack & Stargast-Synchro',
    d:'Ein echtes Symphonieorchester und prominente Synchronsprecher sorgen schon im ersten Trailer für Gänsehaut.',
    code:'Vorab 10× Klasse · +12 Sound · +2 Grafik/Präsentation · +1 Hype · +2 Kritikerwertung',
    upfront:10,monthly:0,eff:{snd:12,gfx:2,hype:1},reviewBonus:2
  },
  collectors:{
    n:'📦 Physische Collector’s Edition',
    d:'Limitierte Sammlerbox mit 25-cm-Figur, gebundenem Artbook, Stoffkarte und Steelbook für treue Fans.',
    code:'Vorab 9× Klasse · +1 Start-Hype · +15 % Zusatz-Erlös bei Kauf- & Abo-Spielen',
    upfront:9,monthly:0,eff:{hype:1}
  },
  antiCheat:{
    n:'🛡️ Kernel-Anti-Cheat & Kopierschutz',
    d:'Schützt vor Raubkopien im Launch-Fenster und hält Cheater aus Online-Lobbys fern — sorgt in Foren aber für Debatten.',
    code:'Vorab 6× Klasse · −2 Start-Bugs · −1 Start-Moral · +10 % Verkäufe',
    upfront:6,monthly:0,eff:{bugs:-2,moral:-1}
  }
};

/* ===================== Genre-Mix Synergien (Setup Screen 3) ===================== */
// Nur Legenden mit Porträt im Ordner raw-assets/chars sind spielbar (Begegnungen, Director-Wahl, Album)
const LEGEND_KEYS=Object.keys(DIRS).filter(k=>(DIRS[k].img||'').includes('/chars/'));
