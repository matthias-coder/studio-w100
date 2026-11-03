/* ===================== Grunddaten & Definitionen (W100-System) ===================== */
const STATS={design:'Design',technik:'Technik',team:'Team',business:'Business'};
const PHASES=['Konzept','Prototyp','Produktion','Marketing','Beta & QA','Gold'];
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

const TIERS={
  indie:{n:'Indie',d:'Fünf Leute, eine Vision, kein Sicherheitsnetz.',scale:1,team:5,prices:[9.99,19.99,29.99],sales:1,hype:0,qual:0,gp:2,gfx:0,review:2,teamMod:4,min:0,note:'Team-Würfe +4, Kritiker milder, Gameplay zählt stärker als Grafik'},
  aa:{n:'Double-A',d:'Mittelgroßes Studio mit Publisher im Rücken.',scale:10,team:35,prices:[19.99,39.99,59.99],sales:3,hype:1,qual:5,gp:5,gfx:5,review:0,teamMod:0,min:1500,note:'Ausgewogen, mehr Geld, höhere Erwartung an Grafik & Gameplay'},
  aaa:{n:'Triple-A',d:'Hunderte Leute, Aktionäre, riesige Erwartungen.',scale:100,team:300,prices:[29.99,49.99,79.99],sales:25,hype:3,qual:10,gp:8,gfx:12,review:-5,teamMod:-4,min:15000,note:'Team-Würfe −4, Kritiker strenger, Grafik & Präsentation extrem wichtig'}
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

const VIOL=['metroidvania','koop','mmorpg','br','rpg','horror'];

// gfxWeight bestimmt, wie stark Grafik (vs. Gameplay) in die Gesamtwertung des Genres einfließt
const GENRES={
  metroidvania:{n:'Metroidvania',d:'Verwinkelte Karte, Doppelsprung, viel Liebe zum Detail.',s:{design:2,technik:1,team:1,business:0},b:{gp:3},gfxW:0.35,fit:'kauf',w:['hub'],bad:['open']},
  aufbau:{n:'Aufbausimulation',d:'Produktionsketten, Tabellen, Siedler-Gefühl.',s:{design:1,technik:2,team:0,business:1},b:{gp:3},gfxW:0.35,fit:'kauf',w:['open','level'],bad:['schlauch']},
  koop:{n:'Koop-Shooter',d:'Vier Leute, ein Ziel, viel Netzwerkcode.',s:{design:0,technik:2,team:1,business:1},b:{hype:1,gfx:3},gfxW:0.50,fit:'kauf',w:['level','hub'],bad:[]},
  adventure:{n:'Point-and-Click',d:'Rätsel, Dialoge, ein sprechender Papagei.',s:{design:2,technik:0,team:1,business:1},b:{gp:6,gfx:2},gfxW:0.30,fit:'kauf',w:['level','schlauch','hub'],bad:['open']},
  mmorpg:{n:'Online-Rollenspiel',d:'Riesige Welt, Gilden, Raids. Und tausend Server-Probleme.',s:{design:1,technik:2,team:1,business:0},b:{hype:1,bugs:3},gfxW:0.45,fit:'abo',w:['open'],bad:['schlauch','level']},
  br:{n:'Battle Royale',d:'Hundert Leute, eine Insel, der Kreis wird kleiner.',s:{design:0,technik:2,team:1,business:1},b:{hype:1,gp:2},gfxW:0.45,fit:'f2p',w:['open'],bad:['schlauch']},
  racing:{n:'Rennspiel',d:'Strecken, Reifenabnutzung, Fotomodus.',s:{design:1,technik:2,team:0,business:1},b:{gfx:6},gfxW:0.60,fit:'kauf',w:['level','hub'],bad:[]},
  sport:{n:'Fußballspiel',d:'Flanken, Fallrückzieher, Transfermarkt.',s:{design:1,technik:1,team:1,business:1},b:{gp:2,gfx:2},gfxW:0.45,fit:'kauf',w:['level'],bad:['open','schlauch']},
  cozy:{n:'Cozy-Farming',d:'Rüben gießen, Hühner streicheln, Dorffest.',s:{design:2,technik:0,team:2,business:0},b:{moral:1,gp:3},gfxW:0.30,fit:'kauf',w:['hub','open'],bad:['schlauch']},
  mobile:{n:'Mobile-Puzzle',d:'Drei in einer Reihe, aber mit Geschichte.',s:{design:1,technik:1,team:0,business:2},b:{gp:2},gfxW:0.30,fit:'f2p',w:['level'],bad:['open']},
  rpg:{n:'Story-Rollenspiel',d:'Hundert Stunden Quests, Begleiter-Romanzen, dicke Dialogbäume.',s:{design:2,technik:1,team:1,business:0},b:{gp:4,gfx:3,bugs:2},gfxW:0.45,fit:'kauf',w:['open','hub'],bad:['schlauch']},
  horror:{n:'Survival-Horror',d:'Taschenlampe, wenig Munition, Geräusche im Flur.',s:{design:2,technik:1,team:0,business:1},b:{hype:1,gfx:5},gfxW:0.55,fit:'kauf',w:['schlauch','hub'],bad:['open']}
};

/* ===================== Engine-Matrix, Alterung & Eigene Engine ===================== */
// Alterungs-Stufen einer eigenen Engine (wenn sie über mehrere Spiele ohne Generations-Upgrade genutzt wird)
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
    good:['koop','mmorpg','br','racing','rpg','horror'],
    bad:['mobile','cozy','adventure','metroidvania'],
    goodEff:{gfx:6,gp:2,hype:1},
    badEff:{gfx:-2,gp:-6,bugs:4,zeit:-1},
    goodNote:'Surreal glänzt bei 3D-Präsentation (+6 Grafik, +2 Gameplay, +1 Hype)',
    badNote:'Surreal ist für dieses Genre viel zu klobig (−6 Gameplay, −2 Grafik, +4 Bugs, −1 Monat)'
  },
  unitee:{
    n:'Unitee',
    short:'Unitee',
    d:'Schnell eingerichtet, riesiger Asset-Store, stark bei Indie, 2D, Aufbau und Mobile. Schwächelt bei riesigen Online-Welten.',
    good:['metroidvania','aufbau','cozy','mobile','sport','adventure'],
    bad:['mmorpg','br'],
    goodEff:{gp:4,gfx:2,bugs:-1},
    badEff:{gfx:-4,gp:-3,bugs:5},
    goodNote:'Unitee passt ideal zum Genre (+4 Gameplay, +2 Grafik, −1 Bug)',
    badNote:'Unitee ächzt unter der Server- und Weltlast (−4 Grafik, −3 Gameplay, +5 Bugs)'
  },
  godoh:{
    n:'Godoh (Open Source)',
    short:'Godoh',
    d:'Kostenlos und offen, geliebt für 2D, Point-and-Click und Gameplay-Hits. Bei aufwendigen 3D-/Online-Projekten fehlt die Grafik-Power.',
    good:['metroidvania','adventure','cozy','mobile'],
    bad:['koop','mmorpg','br','racing','horror'],
    goodEff:{gp:6,gfx:1,moral:1},
    badEff:{gfx:-8,gp:-3,bugs:4,zeit:-1},
    goodNote:'Godoh ist wie gemacht für euer Gameplay (+6 Gameplay, +1 Grafik, +1 Moral)',
    badNote:'Godoh fehlen für dieses Genre 3D-Grafik & Netcode (−8 Grafik, −3 Gameplay, +4 Bugs, −1 Monat)'
  }
};

const ENGINE_MODULES={
  render3d:{branch:'Grafik & Präsentation',n:'Next-Gen-Renderer',d:'+6 Grafik und +1 Hype beim Projektstart mit eigener Engine',eff:{gfx:6,hype:1}},
  raytracing:{branch:'Grafik & Präsentation',n:'Echtzeit-Licht & Globale Beleuchtung',d:'+8 Grafik und +2 Release-Wertung durch brillante Ausleuchtung',eff:{gfx:8}},
  gameplay_kit:{branch:'Gameplay & Welt',n:'Modulares Gameplay-Framework',d:'+6 Gameplay & schnelleres Prototyping beim Projektstart',eff:{gp:6}},
  ai_sandbox:{branch:'Gameplay & Welt',n:'Dynamische KI- & Physik-Sandbox',d:'+7 Gameplay und +1 Hype durch lebendige Spielwelten',eff:{gp:7,hype:1}},
  editor:{branch:'Gameplay & Welt',n:'Visueller Welt- & Quest-Editor',d:'+1 Monat Zeit, +3 Gameplay und +2 Grafik beim Projektstart',eff:{zeit:1,gp:3,gfx:2}},
  netcode:{branch:'Netzwerk & Pipeline',n:'Roll-Back-Netcode',d:'Perfekt für Koop, MMO & Battle Royale: −3 Bugs, +5 Technik bei Online-Spielen',eff:{bugs:-3,gp:2}},
  portkit:{branch:'Netzwerk & Pipeline',n:'Multi-Plattform-Compiler',d:'Plattform-Würfe +12, spart 50 % Portierungskosten und +2 Grafik',eff:{gfx:2}},
  qaauto:{branch:'Netzwerk & Pipeline',n:'Automatisierte Telemetrie-Suite',d:'Jeden Monat −0,5 Bugs durch automatische Crash-Analysen',eff:{bugs:-2}}
};

/* ===================== Auftragsarbeiten (Contracts für Zusatzgeld) ===================== */
const CONTRACTS=[
  {id:'port_job',n:'Konsolen-Portierung für Partnerstudio',d:'Ein anderes Studio braucht dringend Hilfe beim Portieren. Bringt schnelles Geld.',st:'technik',dc:55,pay:18,f:{bugs:2,moral:-1},sx:'Sauber abgeliefert! Der Scheck ist sofort auf dem Konto.',fx:'Der Port war widerspenstig. Es gibt nur eine Teilzahlung und müde Gesichter.'},
  {id:'ui_job',n:'UI- & Menü-Design für Großprojekt',d:'Eure Designer gestalten das Interface für eine fremde Produktion.',st:'design',dc:50,pay:14,f:{moral:-1},sx:'Schickes Layout, zufriedener Auftraggeber!',fx:'Drei Korrekturschleifen zu viel — kaum Gewinn, genervtes Team.'},
  {id:'shader_job',n:'Grafik-Benchmark & Tech-Showcase',d:'Ein Grafikkarten-Hersteller bestellt eine schicke Tech-Szene.',st:'technik',dc:65,pay:26,sExtra:{gfx:2},f:{zeit:-1,bugs:2},sx:'Die Szene läuft auf jeder Messe! Dickes Honorar und +2 Grafik für euer Spiel.',fx:'Treiber-Absturz bei der Präsentation. Das hat Zeit gekostet.'},
  {id:'pitch_consult',n:'Publisher-Beratung & Marktanalyse',d:'Ihr bewertet Prototypen für einen Investment-Fonds.',st:'business',dc:50,pay:15,f:{hype:-1},sx:'Schnell verdientes Beratungshonorar.',fx:'Ein Prototyp, den ihr abgelehnt habt, wird anderswo zum Hit.'},
  {id:'qa_help',n:'Notfall-Bugfixing auf Abruf',d:'Zwei Wochen Feuerwehreinsatz in fremdem Code.',st:'technik',dc:60,pay:20,f:{moral:-1,bugs:2},sx:'Kritischer Fehler gefunden, satte Prämie kassiert!',fx:'Ihr habt den fremden Code repariert, aber euren eigenen vernachlässigt.'}
];

/* ===================== Konkurrenz-Studios (Rivalen & GOTY-Rennen) ===================== */
const BASE_RIVALS=[
  {id:'nordlicht',name:'Nordlicht Interactive',specialty:'rpg',strength:68,desc:'Skandinavische Rollenspiel-Schmiede mit riesiger Fangemeinde.'},
  {id:'aether',name:'AetherWorks',specialty:'koop',strength:72,desc:'Technik-Gigant, bekannt für spektakuläre 3D-Grafik und Shooter.'},
  {id:'valkyrie',name:'Valkyrie Soft',specialty:'metroidvania',strength:66,desc:'Kult-Studio für messerscharfes Gameplay und knackige Bosse.'},
  {id:'redsun',name:'Red Sun Digital',specialty:'racing',strength:70,desc:'Perfektionisten für Tempo, Physik und glänzende Karosserien.'},
  {id:'alpenhorn',name:'Alpenhorn Games',specialty:'aufbau',strength:65,desc:'Meister komplexer Wirtschaftskreisläufe und gemütlicher Welten.'}
];

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
  art:['Yuki Takahashi','Clara von स्टेफन','Mateo Rossi','Freja Lindholm','Noémie Laurent','David Krenz'],
  producer:['Hannah Goldmann','Marcus Vance','Elena Rostova','Tobias Mertens','Priya Nair','Lukas Bach'],
  community:['Jules Weber','Mia Chen','Sami Petrov','Nina Sonnenschein','Robin Kästner','Tara Novak'],
  qalead:['Viktor Sokolov','Anja Brückner','Darius Mehdi','Katrin Falk','Simon Vestergaard','Bastian Krug'],
  bizdev:['Victoria Sterling','Henrik Lind','Dr. Cornelius Graf','Sabrina Moretti','Leonard Sterling','Nadia Gauthier']
};

const STAFF_XP_THRESH=[0,2,5,9,14]; // XP für Level 1..5
const STAFF_TITLES=['Lead','Senior Lead','Principal','Director','Branchen-Legende'];
const STAFF_STAT_BONUS=[0,3,5,8,11,15]; // W100-Bonus für Stufe 1..5 (+3% bis +15%)

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
  {id:'influencer',c:'Marketing',n:'Influencer-Kampagne',d:'Bezahlte Videos bei fünf großen Kanlen.',cost:6,eff:{hype:1,wl:2},sx:'Fünf Videos, Hunderttausende Aufrufe.'},
  {id:'plakate',c:'Marketing',n:'Plakate am Bahnhof',d:'Großflächen in fünf Städten.',cost:4,eff:{hype:1},sx:'Euer Logo hängt neben der Werbung für Bausparverträge.'},
  {id:'tv',c:'Marketing',n:'TV-Spot zur Primetime',d:'Dreißig Sekunden vor dem Samstagabend-Krimi.',cost:40,tiers:['aaa'],eff:{hype:3,wl:5},sx:'Sogar eure Eltern haben es gesehen.'},
  {id:'fokus',c:'Qualität',n:'Fokusgruppen-Playtest',d:'Echte Spieler testen das Gameplay, ihr schaut durch die Scheibe.',cost:5,st:'design',dc:10,s:{gp:7},sx:'Die Tester finden genau die Stellen im Spielfluss, die euch nie aufgefallen sind.',f:{gp:3},fx:'Die Gruppe will vor allem mehr Pausen.'},
  {id:'extqa',c:'Qualität',n:'Externe QA-Firma',d:'Fünfzig Tester für einen Monat.',cost:8,eff:{bugs:-6},sx:'Hunderte Tickets, sauber sortiert.'},
  {id:'orchester',c:'Qualität',n:'Orchesteraufnahme',d:'Ein echtes Orchester spielt euren Soundtrack ein.',cost:15,eff:{gfx:4,gp:3,hype:1},sx:'Gänsehaut beim Titelthema.'},
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
  {id:'publisher',n:'Publisher um Nachschuss bitten',st:'business',dc:13,bonus:()=>(Math.floor(S.res.hype/3)+Math.floor(S.res.qual/30)-Math.floor(S.res.bugs/10))*4,d:'Hype und Qualität helfen, Bugs schaden. Kostet 10 % mehr Umsatzanteil, bei einer neuen IP gehen die Rechte an den Publisher.',sx:'Der Publisher glaubt an euch und überweist.',fx:'Der Publisher legt einfach auf.'},
  {id:'kredit',n:'Bankkredit',st:'business',dc:12,bonus:()=>(Math.floor(S.res.qual/30)-(S.loan?3:0))*4,d:'Qualität zählt als Sicherheit, ein laufender Kredit erschwert es. 2 % Zinsen pro Monat, Rückzahlung bei der Abrechnung.',sx:'Die Bank gibt den Kredit frei.',fx:'Die Bank versteht nicht, was ein Indie-Spiel ist.'},
  {id:'investor',n:'Investor suchen',st:'business',dc:13,bonus:()=>(Math.floor(S.res.hype/2)+Math.floor(S.res.wl/(8000*T().sales)))*4,d:'Hype und Wishlists zählen. Der Investor bekommt 20 % vom Gewinn.',sx:'Ein Fonds steigt ein.',fx:'Der Investor will lieber in Pflanzenmilch investieren.'},
  {id:'crowd',n:'Notruf an die Community',st:'business',dc:14,tiers:['indie','aa'],bonus:()=>(S.res.hype-3)*4,d:'Hängt fast nur am Hype. Scheitert es, wirkt es verzweifelt: −2 Hype.',sx:'Die Fans retten euch in 72 Stunden.',fx:'Die Kampagne wird zum Mitleids-Meme.'},
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

/* ===================== Directors (W100-Skala) ===================== */
const DSTAT={
  vision:['Vision','Design-Würfe (+4 pro Punkt über 1)'],
  technik:['Technik','Technik-Würfe (+4 pro Punkt über 1)'],
  fuehrung:['Führung','Team-Würfe (+4), Start-Moral & Lead-Loyalität'],
  business:['Geschäftssinn','Business-Würfe (+4 pro Punkt über 1)'],
  hype:['Hype-Magnet','Start-Hype, Marketing und Wishlists'],
  polish:['Polish','Grafik & Gameplay pro Monat und weniger Bugs']
};

const ABIL={
  reroll:{n:'Noch eine Runde',d:'Einen misslungenen Wurf wiederholen.'},
  cash:{n:'Neues Raumschiff verkaufen',d:'Die Community zahlt sofort: Geld und +1 Hype, aber −1 Monat.'},
  rewrite:{n:'Wochenend-Rewrite',d:'Ein Wochenende allein mit dem Code: −8 Bugs und +3 Grafik.'},
  promi:{n:'Promi-Auftritt',d:'Ein Hollywood-Star im Trailer: +3 Hype.'},
  tiefe:{n:'Versteckte Tiefe',d:'Geheime Gebiete und Lore: +10 Gameplay.'},
  ankuend:{n:'Die große Ankündigung',d:'+4 Hype, aber ein neues Versprechen.'},
  works:{n:'It just works',d:'Beim Review-Wurf zählen die Bugs nicht.'},
  tisch:{n:'Tisch umwerfen',d:'Großer Umbau: +10 Gameplay, +6 Grafik, −2 Monate.'},
  fans:{n:'Fan-Kampagne',d:'Die Fans finanzieren mit: Geld und +1 Hype.'},
  community:{n:'Community-Abend',d:'Spieler und Team feiern zusammen: +3 Moral, −3 Bugs.'}
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

const DIRS={
  sid:{n:'Sid Meiser',tag:'Der Strategie-Tüftler',d:'Erfinder rundenbasierter Weltreiche. Keiner hört nach einer Runde auf.',s:{vision:3,technik:2,fuehrung:2,business:1,hype:0,polish:3},aff:{aufbau:2},perks:[],flaws:['perfekt'],ab:'reroll'},
  robert:{n:'Christian Robert',tag:'Der Ewig-Visionär',d:'Baut seit Jahren am größten Weltraumspiel aller Zeiten. Fast fertig.',s:{vision:4,technik:1,fuehrung:1,business:3,hype:4,polish:0},aff:{koop:1,mmorpg:1},perks:[],flaws:['creep','kosten'],ab:'cash'},
  trainmag:{n:'Jon Trainmag',tag:'Der Engine-Magier',d:'Schreibt Grafik-Engines vor dem Frühstück. Meetings eher nicht.',s:{vision:1,technik:4,fuehrung:0,business:1,hype:1,polish:2},aff:{koop:2,br:1,horror:1},perks:['engine'],flaws:[],ab:'rewrite'},
  kojimba:{n:'Hideo Kojimba',tag:'Der Auteur',d:'Jede Zwischensequenz ein Kinofilm, jeder Abspann ein Kunstwerk.',s:{vision:4,technik:2,fuehrung:2,business:1,hype:4,polish:2},aff:{adventure:1,horror:1},perks:['netz'],flaws:['kosten','diva'],ab:'promi'},
  mizaki:{n:'Hidetaka Mizaki',tag:'Der Souls-Meister',d:'Brutal schwer, unfassbar gut. Die Geschichte steht in den Itembeschreibungen.',s:{vision:4,technik:2,fuehrung:2,business:1,hype:1,polish:4},aff:{metroidvania:2,rpg:2,cozy:-1,mobile:-1},perks:[],flaws:['perfekt'],ab:'tiefe'},
  molynox:{n:'Peter Molynox',tag:'Der Versprecher',d:'Kündigt Bäume an, die wachsen, während man spielt.',s:{vision:4,technik:1,fuehrung:2,business:1,hype:4,polish:0},aff:{aufbau:1,rpg:1},perks:[],flaws:['verspricht'],ab:'ankuend'},
  hauard:{n:'Todd Hauard',tag:'Der Open-World-Baumeister',d:'Riesige Welten, viele Bugs, alle kaufen es trotzdem.',s:{vision:2,technik:2,fuehrung:2,business:2,hype:4,polish:0},aff:{mmorpg:1,aufbau:1,rpg:2},perks:[],flaws:['buggy'],ab:'works'},
  miyamotto:{n:'Shigeru Miyamotto',tag:'Der Spielspaß-Meister',d:'Wirft ein Projekt lieber noch einmal um, als etwas Mittelmäßiges abzuliefern.',s:{vision:4,technik:2,fuehrung:3,business:1,hype:2,polish:4},aff:{metroidvania:1,cozy:1,racing:1},perks:[],flaws:['perfekt'],ab:'tisch'},
  schaefer:{n:'Tim Schäfer',tag:'Der Adventure-Humorist',d:'Sprechende Schädel, Gummihühner und eine Crowdfunding-Legende.',s:{vision:3,technik:1,fuehrung:3,business:2,hype:2,polish:1},aff:{adventure:2},perks:[],flaws:['kosten'],ab:'fans'},
  vinke:{n:'Swen Vinke',tag:'Der Community-Rollenspieler',d:'Lässt die Spieler jahrelang mitentwickeln und erscheint erst, wenn es fertig ist.',s:{vision:3,technik:2,fuehrung:3,business:2,hype:1,polish:2},aff:{mmorpg:1,adventure:1,rpg:2},perks:['ea'],flaws:['perfekt'],ab:'community'}
};

const DPTS=10;
const TA=['Neon','Echo','Rost','Nebel','Sternen','Glut','Funken','Eisen','Kristall','Mond','Schatten','Wolken','Asche','Äther','Runen','Cyber'];
const TB=['protokoll','saga','ritter','fabrik','hafen','garten','pfad','chronik','kolonie','arena','wächter','fieber','legende','schmiede','requiem','odyssee'];
