/* ===================== Grundsatzentscheidungen (mit Engine-Alterung, Grafik & Gameplay) ===================== */
const MAND_AT={con_lock:['world'],pit_mix:['license'],pre_tech:['engine'],prod_plan:['cast','platform'],prod_beta:['lang','age'],pol_ship:['price','china']};

function getMand(id){
  const p=T()?T().prices.map(x=>nf(x,2)+' €'):['','',''];
  const gKey=S?S.genre:'rpg';
  const gName=GENRES[gKey]?GENRES[gKey].n:'dieses Genre';
  const eng=C&&C.studio&&C.studio.engine?C.studio.engine:null;

  const eigenOpts=[];
  if(!eng){
    eigenOpts.push({
      l:'Eigene Engine von Grund auf bauen (v1.0)',
      st:'technik',dc:15,
      set:{engine:'eigen',engAction:'new'},
      sd:`Keine Lizenzabgaben, volle Kontrolle. Startet als Next-Gen-Engine, lernt ${gName} als erste Stärke und reift über künftige Spiele.`,
      s:{gfx:6,gp:5,bugs:-2},
      sx:`Eure eigene Engine v1.0 läuft! Sie beherrscht ab sofort ${gName} und liefert moderne Grafik & sauberes Gameplay.`,
      f:{bugs:6,zeit:-2,gfx:2,gp:1},
      fx:'Nach zwei Monaten rendert ihr: einen Würfel. Aber das Grundgerüst eurer eigenen Engine steht!'
    });
  }else{
    const ver=eng.version||1;
    const runs=eng.runs||1;
    const age=eng.age||0;
    const ageInfo=getEngineAgeInfo(age);
    const knows=eng.genres&&eng.genres.includes(gKey);
    const debt=eng.techDebt||0;

    // Routine-Bonus (wird mit Anzahl Läufe besser) vs. Alterungs-Effekt (schadet Grafik & Gameplay wenn nicht modernisiert!)
    const routineBugs=-Math.min(5,runs)-(eng.modules.includes('netcode')&&['action','survival','sports'].includes(gKey)?3:0)+debt*2;
    const modGfx=(eng.modules.includes('render3d')?6:0)+(eng.modules.includes('raytracing')?8:0)+(eng.modules.includes('editor')?2:0);
    const modGp=(eng.modules.includes('gameplay_kit')?6:0)+(eng.modules.includes('ai_sandbox')?7:0)+(eng.modules.includes('editor')?3:0)+Math.min(4,runs);
    // Genre-Spezialisierung aus einem Engine-Projekt
    const specBonus=eng.spec===gKey?4:0;
    const totalGfx=ageInfo.gfx+modGfx+specBonus;
    const totalGp=ageInfo.gp+modGp+specBonus;
    const zBonus=eng.modules.includes('editor')?1:0;

    if(knows){
      const safeEff={gfx:totalGfx,gp:totalGp,bugs:routineBugs};
      if(ageInfo.hype)safeEff.hype=ageInfo.hype;
      if(zBonus)safeEff.zeit=zBonus;
      eigenOpts.push({
        l:`${eng.name} v${ver}.0 unverändert einsetzen (${ageInfo.label})`,
        safe:safeEff,
        set:{engine:'eigen',engAction:'reuse'},
        sd:`Routine-Vorteil für ${gName}! Zustand: ${ageInfo.label} — ${ageInfo.desc} ${specBonus?'Spezialisiert auf dieses Genre (+4 Gameplay, +4 Grafik). ':''}${age>=2?'Die Engine veraltet weiter. Ein Generations-Upgrade gibt es nur als eigenes Engine-Projekt zwischen zwei Spielen.':''}`,
        sx:age>=2
          ?`${eng.name} v${ver}.0 spart dank Routine viel Zeit, aber Grafik und Gameplay wirken mittlerweile merklich angestaubt.`
          :`${eng.name} v${ver}.0 schnurrt wie ein Kätzchen: Moderne Technik und eingespielte Workflows!`
      });
    }else{
      const dcAdapt=Math.max(10,14-Math.floor(ver/2));
      eigenOpts.push({
        l:`${eng.name} v${ver}.0 (${ageInfo.label}) an ${gName} anpassen`,
        st:'technik',dc:dcAdapt,
        set:{engine:'eigen',engAction:'adapt'},
        sd:`Eure Engine kennt bisher ${eng.genres.map(x=>GENRES[x]?.n||x).join(', ')}. Passt Werkzeuge für ${gName} an (Zustand bleibt: ${ageInfo.label}).`,
        s:{gfx:totalGfx,gp:totalGp,bugs:routineBugs},
        sx:`Umbau gelungen! ${eng.name} beherrscht jetzt auch ${gName} dauerhaft.`,
        f:{gfx:totalGfx-3,gp:totalGp-3,bugs:4+debt,zeit:-1},
        fx:`Die Anpassung an ${gName} war zäh und hat einen Monat gekostet, aber die Engine lernt dazu.`
      });
    }
  }

  const M={
    engine:{t:'Welche Engine?',x:'Die Engine bestimmt Grafik-Power, Gameplay-Werkzeuge und Lizenzkosten. Nicht jede Engine passt zu jedem Genre — und eigene Engines veralten ohne Pflege nach einigen Läufen!',o:[
      ...eigenOpts,
      {l:'Surreal Engine',safe:{gfx:9,gp:2},set:{engine:'surreal'},sd:'Fotorealistische 3D-Grafik ab Werk (+9 Grafik, +2 Gameplay). Ab 1 Mio € Umsatz gehen 5 % an den Hersteller. Stark bei 3D/Action, klobig bei 2D & Mobile.',sx:'Das erste Licht im Editor sieht schon besser aus als euer letztes Spiel.'},
      {l:'Unitee',safe:{budget:-5,gfx:3,gp:4,zeit:1},set:{engine:'unitee'},sd:'Schnell eingerichtet (+1 Monat), riesiger Asset-Store, stark bei Indie, Aufbau, 2D & Mobile. Schwächelt bei riesigen Online-Welten.',sx:'Prototyp steht in einer Woche.'},
      {l:'Godoh (Open Source)',safe:{gfx:1,gp:4,bugs:1},set:{engine:'godoh'},sd:'Kostenlos und offen, perfekt für 2D, Point-and-Click & Cozy. Bei großen 3D-/Online-Projekten und Triple-A fehlt die Grafik-Power.',sx:'Kostet nichts, und die Community schickt euch Plugins.'}
    ]},
    world:{t:'Wie ist die Spielwelt aufgebaut?',x:'Die Struktur der Welt bestimmt Umfang, Kosten und was die Spieler erwarten.',o:[
      {l:'Open World',safe:{hype:2,gfx:4,gp:4,bugs:3,zeit:-2},set:{world:'open'},sd:'Riesige Karte, freie Erkundung. Kostet jeden Monat extra für Weltbau.',sx:'Ihr zeichnet eine Karte, die nicht auf den Tisch passt.'},
      {l:'Halboffene Hubs',safe:{hype:1,gfx:2,gp:3,zeit:-1},set:{world:'hub'},sd:'Mehrere offene Gebiete, verbunden durch Wege. Etwas Weltbau pro Monat.',sx:'Genug Freiheit, ohne sich zu verlaufen.'},
      {l:'Levelbasiert',safe:{gp:2},set:{world:'level'},sd:'Klassisch, planbar, gut zu testen.',sx:'Level für Level, sauber getrennt.'},
      {l:'Linearer Schlauch',safe:{bugs:-2,gfx:3},set:{world:'schlauch'},sd:'Eng geführt, cineastisch inszeniert und leicht zu polieren.',sx:'Jede Szene sitzt, jede Kamerafahrt ist geplant.'}]},
    cast:{t:'Wer spricht die Hauptrolle?',x:'Die Stimme eurer Hauptfigur prägt Trailer, Cover und Presse.',o:[
      {l:'Hollywood-Star',safe:{budget:-40,hype:3,gfx:3,gp:1},set:{cast:'star'},sd:'Gesicht, Stimme und Motion Capture. Sehr teuer.',sx:'Der Name steht groß auf dem Cover.'},
      {l:'Bekannte deutsche Synchronstimme',safe:{budget:-8,hype:1,snd:5},set:{cast:'synchro'},sd:'Die Stimme eines Actionstars. Mit deutscher Vertonung ein Verkaufsargument im deutschsprachigen Raum.',sx:'Beim ersten Satz bekommt das ganze Studio Gänsehaut.'},
      {l:'Streamer als Gastrolle',st:'business',dc:11,set:{cast:'streamer'},sd:'Bringt junge Spieler und Wishlists, wenn es klappt.',s:{hype:2,wl:3},sx:'Sein Clip aus dem Tonstudio geht viral.',f:{hype:-1},fx:'Er liest den Text ab, als wäre es ein Werbespot.'},
      {l:'Das Team spricht selbst',st:'team',dc:10,set:{cast:'team'},sd:'Kostet nichts. Kann charmant oder peinlich werden.',s:{moral:1,gp:3},sx:'Der Buchhalter ist ein verborgenes Talent.',f:{hype:-1},fx:'Ein Streamer schneidet die schlimmsten Zeilen zusammen.'}]},
    license:{t:'Offizielle Lizenzen',x:'Echte Marken machen ein Spiel glaubwürdiger. Und teurer.',o:[
      {l:'Echte Automarken',g:['sports.arcaderacer','sports.simracer'],safe:{budget:-25,hype:2,gfx:3},set:{lic:'auto'},sd:'Originalgetreue Autos von zwölf Herstellern. Verkäufe +25 %, aber die Hersteller reden mit.',sx:'Die Fahrzeugliste liest sich wie ein Autosalon.'},
      {l:'Offizielle Liga mit echten Vereinen',g:['sports.sim','sports.manager'],safe:{budget:-35,hype:3,gp:2},set:{lic:'liga'},sd:'Echte Vereine, Trikots und Spielernamen. Verkäufe +40 %, aber 10 % Umsatzabgabe.',sx:'Der Lieblingsverein jedes Spielers ist dabei.'},
      {l:'Bekannte Pen-&-Paper-Regelwerk-Lizenz',g:['rpg','adventure'],safe:{budget:-20,hype:2,gp:5},set:{lic:'ttrpg'},sd:'Kult-Universum mit tiefem Regelwerk. Verkäufe +20 %, aber 8 % Lizenzabgabe.',sx:'Die Rollenspiel-Community feiert euch ab Tag eins.'},
      {l:'Charthits im Soundtrack',safe:{budget:-15,hype:1,snd:8,gp:1},set:{lic:'musik'},sd:'Zehn bekannte Songs. Fühlt sich groß an, Streamer müssen aber stumm schalten.',sx:'Der Trailer mit dem Sommerhit läuft überall.'},
      {l:'Keine Lizenzen',safe:{},set:{lic:'none'},sd:'Erfundene Marken, erfundene Songs. Spart Geld.',sx:'Der „Volksflitzer GT“ sieht verdächtig bekannt aus.'}]},
    platform:{t:'Auf welchen Plattformen erscheint ihr?',x:'Jede Plattform bringt Käufer, aber auch Ports, Zertifizierungen und Ärger.',o:[
      {l:'Nur PC',safe:{gfx:2},set:{plat:'pc'},sd:'Ein Store, eine Plattform, wenig Aufwand.',sx:'Fokus auf das Wesentliche.'},
      {l:'PC und Konsolen',st:'technik',dc:12,set:{plat:'konsole'},sd:'PC, PlayStatus, Xbonk und Nintendu Swotch. Viel mehr Käufer.',s:{budget:-15,gp:2},sx:'Die Ports laufen. Vier Plattformen, viel mehr Zielgruppe.',f:{budget:-15,bugs:4,zeit:-1,gfx:-2},fx:'Die Swotch-Version läuft mit 12 Bildern pro Sekunde.'},
      {l:'Exklusiv für die PlayStatus',safe:{budget:40,hype:1,gfx:3},set:{plat:'exklusiv'},sd:'Der Plattformhalter zahlt eine Garantiesumme und hilft bei der Grafik-Optimierung. Dafür gibt es euch nur dort.',sx:'Euer Logo erscheint in der großen Konsolen-Show.'},
      {l:'Überall, auch Mobile',st:'technik',dc:15,set:{plat:'alle'},sd:'PC, alle Konsolen und Handy. Maximale Reichweite, maximaler Aufwand.',s:{budget:-25},sx:'Euer Spiel läuft überall, sogar auf dem Handy eurer Oma.',f:{budget:-25,bugs:6,zeit:-1,gp:-3},fx:'Die Touch-Steuerung ist eine Katastrophe.'}]},
    lang:{t:'Sprachen und Märkte',x:'In welchen Sprachen erscheint euer Spiel?',o:[]},
    age:{t:'Altersfreigabe',x:'Die USK prüft euer Spiel. Gewalt, Sprache und Glücksspiel-Mechaniken zählen.',o:[
      {l:'Für ab 12 entschärfen',g:VIOL,safe:{gfx:-3,gp:-2},set:{age:12},sd:'Weniger Blut, größere Zielgruppe.',sx:'USK 12. Die Kampfszenen wirken etwas zahmer.'},
      {l:'Wie geplant einreichen',g:VIOL,st:'business',dc:12,set:{age:16},fset:{age:18},sd:'Mit Glück USK 16, sonst USK 18 und weniger Käufer.',s:{},sx:'USK 16. Passt zu eurer Zielgruppe.',f:{},fx:'USK 18. Viele Händler stellen das Spiel nach hinten.'},
      {l:'Einreichen',ng:VIOL,safe:{},set:{age:6},sd:'Euer Spiel ist harmlos.',sx:'USK 6. Freigegeben für fast alle.'}]},
    price:{t:'Der Preis',x:'Was soll euer Spiel kosten? Der Preis entscheidet mit, wie viele Wishlists zu Käufen werden.',o:[
      {l:'Budget-Preis '+p[0],safe:{wl:2},set:{price:0},sd:'Mehr Leute greifen zu, Kritiker sind milder (+2).',sx:'Ein Impulskauf für fast alle.'},
      {l:'Mid-Price '+p[1],safe:{},set:{price:1},sd:'Der faire Mittelweg.',sx:'Fair für beide Seiten.'},
      {l:'Vollpreis '+p[2],st:'business',dc:12,set:{price:2},sd:'Mehr Geld pro Käufer, weniger Käufer, Kritiker −1.',s:{},sx:'Die Community akzeptiert den Preis für so viel Spiel.',f:{hype:-2},fx:p[2]+'? Der Preis wird zum Meme.'}]},
    china:{t:'Zulassung in China',x:'Euer Partner-Publisher reicht das Spiel bei der Behörde ein. Skelette, Blut und Spielzeiten für Jugendliche werden geprüft.',o:[
      {l:'Inhalte vorab anpassen',st:'business',dc:11,sd:'Kostet etwas Grafik-Detail, erhöht die Chance.',s:{gfx:-2},sx:'Zulassung erteilt. Ein riesiger Markt öffnet sich.',f:{gfx:-2},fx:'Die Prüfung dauert länger. China-Release frühestens nächstes Jahr.',sset:{china:'ok'},fset:{china:'fail'}},
      {l:'Unverändert einreichen',st:'business',dc:16,sd:'Keine Änderungen, aber schwer durchzubekommen.',s:{},sx:'Durchgewunken, unverändert.',f:{hype:-1},fx:'Abgelehnt. Die Fans in China sind enttäuscht.',sset:{china:'ok'},fset:{china:'fail'}}]}
  };
  return M[id];
}

/* ===================== Monatskarten (6 Phasen) ===================== */
const E=[
 {p:0,t:'Die Generalprobe',x:'Bevor es ernst wird, pitcht ihr vor Freunden aus der Branche.',o:[
  {l:'Vor Publikum proben',st:'business',dc:12,s:{hype:1,moral:1},sx:'Das Feedback ist freundlich und ehrlich. Die Folien sitzen jetzt.',f:{moral:-1},fx:'Die Demo stürzt bei Folie 3 ab. Gut, dass es nur eine Probe war.'},
  {l:'Lieber weiterbauen',safe:{gp:2},sx:'Ihr spart euch die Folien und baut stattdessen am Spiel.'}]},
 {p:0,t:'Die große Idee',x:'Whiteboard, Pizza, drei Stunden. Ihr braucht den einen Satz, der euer Spiel erklärt.',o:[
  {l:'Etwas völlig Neues',st:'design',dc:14,s:{gp:12,gfx:4,hype:1},sx:'„Wie Tetris, aber mit Gefühlen.“ Alle sind sofort dabei.',f:{gp:3,zeit:-1},fx:'Nach zwei Wochen versteht immer noch niemand das Konzept.'},
  {l:'Bewährtes mit Twist',st:'design',dc:9,s:{gp:7,gfx:3},sx:'Solide Basis, eigener Dreh. Damit lässt sich arbeiten.',f:{gp:2,hype:-1},fx:'Ein Forum nennt euer Konzept schon jetzt „Klon mit Hut“.'}]},
 {p:0,t:'Das Team',x:'Ihr braucht noch Verstärkung. Auf dem Tisch liegen Lebensläufe und eine WhatsApp-Gruppe von früher.',o:[
  {l:'Erfahrene Seniors anwerben',st:'business',dc:11,s:{gp:5,gfx:5,budget:-15,moral:1},sx:'Profis, die schon drei Spiele fertig gemacht haben.',f:{budget:-25,moral:-1},fx:'Einer kommt, verlangt das Gehalt von zweien und geht nach drei Wochen.'},
  {l:'Freunde aus dem Studium',st:'team',dc:10,s:{moral:2,gp:4},sx:'Die Stimmung ist großartig. Die Commit-Messages auch.',f:{moral:-1,bugs:2},fx:'Freundschaft und Code-Reviews vertragen sich nicht so gut.'}]},
 {p:0,t:'Das Büro',x:'Wo soll das Studio sitzen? Der Makler schwärmt von einem Loft mit Tischkicker.',o:[
  {l:'Loft mit Tischkicker',safe:{budget:-20,moral:2},sx:'Backsteinwände, Siebträger, alle kommen gern zur Arbeit.'},
  {l:'Alles im Homeoffice',st:'team',dc:11,s:{moral:1,budget:5},sx:'Läuft. Und die Miete bleibt im Budget.',f:{moral:-1},fx:'Drei Zeitzonen, null Absprachen, viele Missverständnisse.'}]},
 {p:0,t:'Server-Architektur',x:'Euer Spiel lebt online. Wie soll die Infrastruktur aussehen?',models:['live','abo','f2p'],o:[
  {l:'Eigene Server-Architektur',st:'technik',dc:14,s:{gp:5,gfx:3,bugs:-2},sx:'Sauber skaliert, sauber dokumentiert.',f:{bugs:5,zeit:-1},fx:'Der Lasttest mit zehn Spielern bringt alles zum Stehen.'},
  {l:'Cloud-Dienst mieten',safe:{budget:-15,bugs:-1},sx:'Teuer im Monat, dafür schlaft ihr ruhig.'}]},
 {p:0,t:'Vertrag mit dem Rechteinhaber',x:'Der Filmverleih möchte jedes Design vorher freigeben.',ip:['lizenz'],o:[
  {l:'Mehr Freiheit aushandeln',st:'business',dc:14,s:{gp:6,moral:1},sx:'Ihr dürft die Geschichte erweitern, solange der Held nicht stirbt.',f:{zeit:-1,moral:-1},fx:'Jede Grafik braucht drei Freigaben in zwei Zeitzonen.'},
  {l:'Alle Vorgaben akzeptieren',safe:{hype:1,gp:-3},sx:'Sicher, aber eure Ideen landen im Schrank.'}]},
 {p:0,t:'Tech-Stack & Grafik-Ziel',x:'Euer Technik-Team diskutiert über Beleuchtungs-Pipeline und automatisierte Build-Server.',o:[
  {l:'Moderne Grafik- & Build-Pipeline aufsetzen',st:'technik',dc:12,s:{gfx:6,bugs:-3},sx:'Bessere Shader und automatische Tests ab Tag eins.',f:{zeit:-1,bugs:2},fx:'Die neue Pipeline testet vor allem die Geduld des Teams.'},
  {l:'Bewährten Workflow beibehalten',safe:{gp:2,gfx:1},sx:'Keine Experimente am ersten Tag.'}]},

 {p:1,t:'Spaßfaktor null',x:'Der erste spielbare Build. Alle spielen ihn. Niemand lacht. Niemand sagt etwas.',o:[
  {l:'Kernmechanik umbauen',st:'design',dc:13,s:{gp:12,zeit:-1},sx:'Ein kleiner Dreh am Gameplay, und plötzlich will keiner mehr aufhören.',f:{gp:2,zeit:-2,moral:-1},fx:'Jetzt ist es anders. Spaß macht es immer noch nicht.'},
  {l:'Weitermachen, wird schon',st:'team',dc:11,s:{gp:5,moral:1},sx:'Beim dritten Build fällt der Groschen.',f:{gp:-4,moral:-1},fx:'Es wird nicht.'}]},
 {p:1,t:'Game Jam am Wochenende',x:'Jemand schlägt vor, das ganze Wochenende im Büro an verrückten Gameplay-Ideen zu bauen.',o:[
  {l:'Alle ins Büro',st:'team',dc:12,s:{moral:2,gp:7,gfx:2},sx:'Am Sonntag steht ein Feature, das unbedingt ins Spiel muss.',f:{moral:-2},fx:'Freitag, 19 Uhr. Nur der Praktikant ist da.'},
  {l:'Wochenende ist Wochenende',safe:{moral:1},sx:'Alle kommen am Montag ausgeschlafen wieder.'}]},
 {p:1,t:'Der Praktikant und der Bug',x:'Der Praktikant hat einen Physik-Bug gefunden, der mehr Spaß macht als euer geplantes Feature.',o:[
  {l:'Bug zum Feature machen',st:'design',dc:12,s:{gp:9,hype:1},sx:'Wie damals der Rocket Jump. Das wird euer Gameplay-Markenzeichen.',f:{bugs:4},fx:'Jetzt gibt es den Bug offiziell, und drei neue dazu.'},
  {l:'Fixen, Plan ist Plan',st:'technik',dc:8,s:{bugs:-2},sx:'Sauber gefixt, Ticket zu.',f:{bugs:2,moral:-1},fx:'Der Fix macht zwei andere Dinge kaputt.'}]},
 {p:1,t:'Die Investoren-Demo',x:'Drei Leute in Anzügen wollen „mal sehen, was ihr so macht“.',o:[
  {l:'Live spielen',st:'technik',dc:13,s:{budget:40,hype:1},sx:'Butterweich. Einer der Anzüge will den Controller nicht mehr hergeben.',f:{hype:-1,moral:-1},fx:'Ladebildschirm. Ladebildschirm. Ladebildschirm.'},
  {l:'Gerendertes Grafik-Video zeigen',st:'business',dc:10,s:{budget:25,gfx:2},sx:'Schön geschnitten, ein Scheck ist drin.',f:{budget:5,hype:-1},fx:'Einer fragt, warum der Controller in deiner Hand nicht eingesteckt ist.'}]},
 {p:1,t:'Was die Fans wollen',x:'Die Community des Vorgängers hat eine Wunschliste mit 300 Punkten geschrieben.',ip:['franchise'],o:[
  {l:'Mutig neu erfinden',st:'design',dc:14,s:{gp:8,gfx:5,hype:1},sx:'Mutig und trotzdem vertraut. Die Fans sind begeistert.',f:{hype:-2},fx:'„Das ist nicht mehr unser Spiel.“ Petition mit 40.000 Unterschriften.'},
  {l:'Mehr vom Gleichen, nur hübscher',safe:{gfx:4,gp:2,hype:1},sx:'Bewährt. Die Kritiker gähnen ein bisschen.'}]},
 {p:1,t:'Ein Spiel ohne Namen',x:'Eure neue Welt braucht Namen für Orte und Figuren, die hängen bleiben.',ip:['neu'],o:[
  {l:'Community abstimmen lassen',st:'business',dc:11,s:{hype:2,wl:2},sx:'Zehntausende stimmen ab und fühlen sich als Teil des Projekts.',f:{hype:-1},fx:'Gewinner der Abstimmung: „Bossy McBossface“.'},
  {l:'Das Team entscheidet',st:'design',dc:10,s:{gp:4,moral:1},sx:'Die Namen passen perfekt.',f:{moral:-1},fx:'Drei Wochen Streit, am Ende ein Kompromiss, den keiner mag.'}]},
 {p:1,t:'Vertical Slice für die Presse',x:'Ein befreundeter Journalist fragt nach einem frühen Blick hinter die Kulissen.',o:[
  {l:'Polierten 15-Minuten-Abschnitt bauen',st:'design',dc:12,s:{hype:2,wl:3,gfx:4,gp:2},sx:'Die Titelstory im Heft gehört euch!',f:{zeit:-1,bugs:2},fx:'Die Kulisse sah toll aus, hat euch aber einen Monat vom echten Spiel gekostet.'},
  {l:'Noch unter Verschluss halten',safe:{gp:3},sx:'Ihr steckt die Zeit lieber in das echte Fundament.'}]},

 {p:2,t:'Der Tech-Bro',x:'Ein Typ in Patagonia-Weste steht plötzlich im Büro. „Bro, euer Budget liegt einfach rum? Steckt es in $MOONCAT. Das geht x100, garantiert.“',cond:s=>!s.crypto,o:[
  {l:'Ein bisschen zocken (10 % des Budgets)',safe:{},set:{cryptoPct:.1},sd:'Das Geld ist sofort weg. In ein bis zwei Schritten zeigt sich, was draus wird.',sx:'Ihr kauft $MOONCAT. Der Tech-Bro macht ein Foto mit euch für LinkedIn.'},
  {l:'Ordentlich rein (25 % des Budgets)',safe:{},set:{cryptoPct:.25},sd:'Hohes Risiko. Auflösung in ein bis zwei Schritten.',sx:'Der Chart zeigt nach oben. Noch.'},
  {l:'Diamond Hands (50 % des Budgets)',safe:{},set:{cryptoPct:.5},sd:'Die halbe Kasse auf einen Coin. Was soll schon schiefgehen?',sx:'Das Team schaut euch schweigend an, während ihr „to the moon“ murmelt.'},
  {l:'Freundlich rauswerfen',safe:{moral:1},sx:'Das Team applaudiert, als die Tür hinter ihm zufällt.'}]},

 {p:2,t:'Feature Creep',x:'Jemand Wichtiges findet: Ohne Multiplayer kauft das heute keiner mehr.',cond:s=>!isMultiplayer(s),o:[
  {l:'Multiplayer einbauen',st:'technik',dc:16,sset:{mp:true},s:{hype:2,gp:10,budget:-20},sx:'Netcode läuft. Ihr wisst selbst nicht genau, wie.',f:{bugs:8,zeit:-2,budget:-25},fx:'Desync. Überall Desync.'},
  {l:'Freundlich ablehnen',st:'business',dc:11,s:{moral:1,gp:2},sx:'Gute Argumente, der Fokus bleibt.',f:{hype:-1,budget:-10},fx:'Dann gibt es eben weniger Marketingbudget.'}]},
 {p:2,t:'Hinter dem Zeitplan',x:'Laut Plan seid ihr sechs Wochen im Verzug. Der Plan lügt selten.',o:[
  {l:'Crunch anordnen',st:'team',dc:14,s:{zeit:2,gp:3,gfx:3,moral:-2},sx:'Ihr holt auf, aber alle sehen müde aus.',f:{zeit:1,moral:-4,bugs:4},fx:'Übermüdete Leute schreiben übermüdeten Code.'},
  {l:'Scope kürzen',safe:{zeit:1,gp:-3,gfx:-2,moral:1},sx:'Zwei Level fliegen raus. Das Team atmet auf.'},
  {l:'Mehr Leute einstellen',st:'business',dc:12,s:{zeit:2,budget:-30},sx:'Die Neuen sind schnell eingearbeitet.',f:{budget:-30,moral:-1},fx:'Neun Leute machen ein Baby auch nicht in einem Monat.'}]},
 {p:2,t:'Streit um den Artstyle',x:'Der Art Director will handgemalten Stil. Der Publisher will „fotorealistisch, aber stylisch“.',o:[
  {l:'Art Director setzt sich durch',st:'design',dc:11,s:{gfx:8,hype:1,moral:1},sx:'Die Screenshots sehen sofort unverwechselbar aus.',f:{gfx:2,moral:-1},fx:'Es sieht gut aus, aber der Publisher schmollt.'},
  {l:'Kompromiss: Cel-Shading',st:'team',dc:10,s:{gfx:5,moral:1},sx:'Alle können damit leben, manche mögen es sogar.',f:{gfx:1,moral:-2},fx:'Niemand ist zufrieden, alle sind beleidigt.'}]},
 {p:2,t:'Die Build-Maschine qualmt',x:'Aus dem Serverschrank kommt Rauch. Das letzte Backup ist von … wann eigentlich?',o:[
  {l:'Selbst reparieren',st:'technik',dc:12,s:{moral:1},sx:'Neues Netzteil, Backup eingerichtet, Held des Tages.',f:{zeit:-1,bugs:3},fx:'Zwei Wochen Arbeit sind weg und müssen neu gebaut werden.'},
  {l:'Neue Hardware kaufen',safe:{budget:-15,gfx:2},sx:'Teuer, aber morgen läuft wieder alles.'}]},
 {p:2,t:'Der Soundtrack',x:'Die Musik ist bisher ein Platzhalter aus einer Gratis-Bibliothek.',o:[
  {l:'Live-Orchester aufnehmen',safe:{budget:-20,snd:14,gp:2,hype:1},sx:'Gänsehaut beim Titelthema.'},
  {l:'Komponistin aus dem Netz',st:'design',dc:11,s:{snd:9,gp:1},sx:'Sie trifft genau den Ton. Und ist bezahlbar.',f:{snd:2},fx:'Klingt wie ein Handy-Klingelton von 2006.'}]},
 {p:2,t:'Monetarisierung',x:'Womit verdient ihr Geld, wenn das Spiel nichts kostet?',models:['f2p'],o:[
  {l:'Nur Kosmetik',st:'design',dc:12,s:{payers:1,hype:1,gfx:2},sx:'Hübsche Skins, faire Preise. Die Community lobt euch.',f:{payers:0},fx:'Die Skins sehen aus wie Standardausrüstung in anderer Farbe.'},
  {l:'Booster und Lootboxen',st:'business',dc:10,set:{lootbox:true},s:{payers:2,hype:-1,gp:-2},sx:'Die Kasse klingelt, das Forum schäumt.',f:{payers:1,hype:-2,gp:-4},fx:'Ein Video „Pay-to-Win-Abzocke“ geht viral.'}]},
 {p:2,t:'Das Endgame',x:'Was machen Spieler, wenn sie das Maximallevel erreicht haben?',models:['live','abo'],o:[
  {l:'Raids für 20 Spieler',st:'design',dc:13,s:{gp:9,hype:1},sx:'Gilden planen schon ihre Strategien.',f:{bugs:4,zeit:-1},fx:'Der Endboss lässt sich mit einer Treppe austricksen.'},
  {l:'Tägliche Quests',safe:{gp:3},sx:'Beschäftigt die Leute. Begeistert sie nicht.'}]},
 {p:2,t:'KI-Assistenten in der Pipeline',x:'Ein Anbieter verspricht, mit generativer KI doppelt so schnell Texturen und Nebenquests zu erzeugen.',o:[
  {l:'Nur für interne Platzhalter nutzen',st:'technik',dc:11,s:{zeit:1,gp:3,gfx:2},sx:'Schnelles Prototyping, und jedes finale Kunstwerk stammt weiter von euren Artists.',f:{bugs:2,moral:-1,gfx:-2},fx:'Ein Platzhalter-Bild mit sieben Fingern rutscht in einen Screenshot.'},
  {l:'Strikt ablehnen — 100 % Handarbeit',safe:{moral:1,hype:1,gfx:2},sx:'Euer „Handcrafted by Humans“-Siegel kommt bei Spielern und im Team super an.'}]},

 {p:3,t:'Trailer für die große Messe',x:'Ihr habt einen Slot auf der großen Leinwand. Drei Minuten Ruhm.',o:[
  {l:'Echtes Gameplay zeigen',st:'design',dc:13,s:{hype:3,wl:3,gp:2},sx:'Die Halle jubelt beim Doppelsprung.',f:{hype:-1},fx:'Die Framerate ruckelt live auf der Großleinwand.'},
  {l:'CGI-Trailer',st:'business',dc:9,s:{hype:2,budget:-15},sx:'Sieht fantastisch aus und hat mit dem Spiel wenig zu tun.',f:{hype:1,budget:-20},fx:'Top-Kommentar: „Und wo ist das Gameplay?“'}]},
 {p:3,t:'Streamer-Anfrage',x:'Ein Streamer mit zwei Millionen Followern will die Alpha spielen. Live. Heute Abend.',o:[
  {l:'Zugang geben',st:'technik',dc:12,s:{hype:3,wl:4},sx:'Drei Stunden Stream, der Chat dreht durch.',f:{hype:-2},fx:'Vier Abstürze im Stream. Der Clip geht viral, aber nicht so, wie ihr wolltet.'},
  {l:'Lieber nicht',safe:{moral:1},sx:'Ihr arbeitet in Ruhe weiter.'}]},
 {p:3,t:'Der Leak',x:'Jemand hat eure Alpha in einem Forum hochgeladen.',o:[
  {l:'Offen damit umgehen',st:'business',dc:13,s:{hype:2,wl:1},sx:'Ein ehrlicher Post mit Humor. Die Community steht hinter euch.',f:{hype:-1,moral:-1},fx:'Der Post kommt schnippisch rüber. Shitstorm.'},
  {l:'Anwalt einschalten',safe:{budget:-10,hype:-1},sx:'Der Download ist weg, die Stimmung im Forum auch.'}]},
 {p:3,t:'Crowdfunding',x:'Die Community fragt, wie sie euch unterstützen kann.',tiers:['indie','aa'],o:[
  {l:'Kampagne starten',st:'business',dc:14,s:{budget:50,hype:2,wl:2},sx:'Finanziert in 48 Stunden. Stretch Goals fliegen.',f:{budget:10,moral:-1,zeit:-1},fx:'Knapp finanziert, aber ihr habt ein Haustier-System versprochen.'},
  {l:'Kein Crowdfunding',safe:{},sx:'Ihr bleibt bei eurem Plan.'}]},
 {p:3,t:'Demo-Festival',x:'Bei einem großen Online-Festival können Studios eine Demo zeigen.',tiers:['indie','aa'],o:[
  {l:'Demo einreichen',st:'technik',dc:11,s:{hype:2,wl:6},sx:'Auf Platz 4 der meistgespielten Demos. Die Wishlists schießen hoch.',f:{hype:-1},fx:'Die Demo startet nur auf Rechnern mit deutschem Tastaturlayout.'},
  {l:'Aussetzen',safe:{},sx:'Ihr spart euch den Stress.'}]},
 {p:3,t:'Die Aktionäre',x:'Die Quartalszahlen stehen an. Der Vorstand will mehr Einnahmen pro Spieler.',tiers:['aaa'],o:[
  {l:'Season Pass ankündigen',st:'business',dc:13,s:{budget:80,hype:-1},sx:'Der Aktienkurs steigt. Die Kommentare nicht.',f:{hype:-3,moral:-1},fx:'„Day-One-DLC für ein Spiel, das noch nicht fertig ist?“'},
  {l:'Dem Vorstand widersprechen',st:'team',dc:12,s:{moral:2},sx:'Das Team steht geschlossen hinter euch.',f:{budget:-30},fx:'Zur Strafe wird euer Marketingbudget gekürzt.'}]},
 {p:3,t:'Geschlossene Beta',x:'Wie viele Leute sollen den Online-Modus vorab testen?',models:['live','abo','f2p'],o:[
  {l:'Offene Beta für alle',st:'technik',dc:14,s:{hype:3,bugs:-3,wl:5},sx:'Hunderttausend Spieler, die Server halten.',f:{hype:-2,bugs:3},fx:'Warteschlange: 47.000. Geschätzte Wartezeit: 6 Stunden.'},
  {l:'Kleine Beta mit Einladungen',safe:{bugs:-2,hype:1,gp:2},sx:'Ausgewählte Tester, wertvolles Gameplay-Feedback.'}]},
 {p:3,t:'Modding-Werkzeuge',x:'Wie viel gebt ihr der Community in die Hand?',mods:true,o:[
  {l:'Den echten Editor rausgeben',st:'technik',dc:13,s:{hype:2,gp:4},sx:'Nach zwei Tagen gibt es die ersten 200 Mods.',f:{bugs:3},fx:'Der Editor stürzt bei jedem dritten Speichern ab.'},
  {l:'Nur einfache Skins und Karten',safe:{hype:1},sx:'Kleiner Umfang, kaum Ärger.'}]},
 {p:3,t:'Early-Access-Roadmap',x:'Ab nächstem Monat können Leute die Beta kaufen. Was versprecht ihr?',ea:true,o:[
  {l:'Monatliche Updates versprechen',st:'team',dc:13,s:{hype:2,moral:-1},sx:'Die Community feiert die Roadmap.',f:{hype:-2,moral:-1},fx:'Das erste Update ist schon drei Wochen zu spät.'},
  {l:'Vorsichtig bleiben',safe:{hype:1},sx:'Wenig Versprechen, wenig Enttäuschung.'}]},
 {p:3,t:'Dokumentation im Studio',x:'Ein bekanntes Gaming-Magazin möchte eine Video-Doku über eure Entwicklung drehen.',o:[
  {l:'Kameras überall zulassen',st:'team',dc:11,s:{hype:2,wl:4,moral:1},sx:'Sympathisch, ehrlich, nahbar. Die Doku knackt eine halbe Million Aufrufe.',f:{hype:-1,moral:-1},fx:'Im Hintergrund sieht man auf einem Whiteboard „Bosskampf = komplett kaputt“.'},
  {l:'Nur ein kurzes Interview geben',safe:{wl:1},sx:'Kontrolliert und ohne Risiko.'}]},

 {p:4,t:'Die Bug-Lawine',x:'QA meldet 412 offene Tickets. Ticket Nummer 1 heißt „Spiel startet nicht“.',o:[
  {l:'Alles fixen',st:'technik',dc:14,s:{bugs:-10,zeit:-1},sx:'Ticket-Count fällt wie ein Stein.',f:{bugs:-3,zeit:-2,moral:-1},fx:'Für jeden Fix kommen zwei neue Tickets.'},
  {l:'Nur die kritischen',st:'technik',dc:10,s:{bugs:-5},sx:'Die schlimmsten Brocken sind weg.',f:{bugs:-1},fx:'Ihr fixt den falschen Crash.'}]},
 {p:4,t:'Alle hassen Level 3',x:'Die Testspieler sind sich einig: Level 3 ist eine Zumutung.',o:[
  {l:'Level neu bauen',st:'design',dc:13,s:{gp:9,gfx:3,zeit:-1},sx:'Level 3 ist jetzt das Lieblingslevel der Tester.',f:{gp:2,zeit:-2},fx:'Jetzt hassen sie es aus anderen Gründen.'},
  {l:'Schwierigkeit senken',safe:{gp:3},sx:'Weniger Frust, aber auch weniger Erinnerung daran.'}]},
 {p:4,t:'Konsolen-Zertifizierung',x:'Die Plattformhalter prüfen euren Build. 200 Seiten Richtlinien.',cond:s=>s.plat&&s.plat!=='pc',o:[
  {l:'Einreichen',st:'technik',dc:13,s:{hype:1},sx:'Bestanden beim ersten Versuch.',f:{zeit:-1,bugs:-2},fx:'Abgelehnt, weil der Speicher-Hinweis drei Pixel zu klein ist.'},
  {l:'Konsolen-Versionen später nachreichen',safe:{hype:-1},set:{plat:'pc'},sx:'Erst mal nur PC. Die Konsolen folgen irgendwann.'}]},
 {p:4,t:'Early Access',x:'Spieler wollen jetzt schon rein und würden dafür zahlen.',models:['kauf','live'],noEA:true,o:[
  {l:'Early Access starten',st:'business',dc:12,s:{budget:40,bugs:-3,hype:1,ea:1},sx:'Ehrliche Roadmap, treue Community, zahlende Tester.',f:{budget:10,hype:-2},fx:'„Unfertig“ steht in jeder zweiten Bewertung.'},
  {l:'Erst zum fertigen Release',safe:{},sx:'Ihr wollt einen großen ersten Eindruck.'}]},
 {p:4,t:'Playtest-Wochenende',x:'Ihr könnt ein Wochenende lang 5.000 Wishlist-Spieler testen lassen.',o:[
  {l:'Playtest öffnen',st:'technik',dc:12,s:{wl:4,bugs:-3,gp:2},sx:'Die Tester lieben es und erzählen es weiter.',f:{hype:-1,bugs:2},fx:'Die Server brechen nach zehn Minuten zusammen.'},
  {l:'Lieber intern testen',safe:{bugs:-1},sx:'Ruhig und kontrolliert.'}]},
 {p:4,t:'Handheld-PC-Verifizierung',x:'Tragbare PC-Handhelds boomen. Mit dem grünen Häkchen landet ihr auf der Startseite des Stores.',o:[
  {l:'Steuerung, Schrift & Grafik-Preset optimieren',st:'technik',dc:12,s:{wl:4,gp:2,gfx:3,bugs:-2},sx:'Bestnote „Verifiziert“! Tausende Pendler setzen euch auf die Wunschliste.',f:{zeit:-1,bugs:1},fx:'Das Lüftergeräusch klingt wie ein startender Düsenjet.'},
  {l:'Standard-Konfiguration belassen',safe:{},sx:'Läuft irgendwie, wenn man die Lupe auspackt.'}]},

 {p:5,t:'Der Releasetermin',x:'Noch acht Wochen bis zum Release. Ehrlich gesagt bräuchtet ihr zwölf.',o:[
  {l:'Termin halten',st:'team',dc:12,s:{hype:1},sx:'Ihr schafft es. Knapp, aber ihr schafft es.',f:{bugs:4,moral:-1},fx:'Ihr schafft es. Das Spiel eher nicht.'},
  {l:'Zwei Monate verschieben',safe:{zeit:2,budget:-20,hype:-1,gp:3,gfx:2},sx:'Die Fans maulen kurz, das Spiel profitiert.'}]},
 {p:5,t:'Day-One-Patch',x:'Die finale Version ist eingereicht. Seitdem habt ihr 60 Fehler gefunden.',o:[
  {l:'Patch fahren',st:'technik',dc:11,s:{bugs:-5},sx:'Patch ist klein und sauber.',f:{bugs:2},fx:'Der Patch ist 40 GB groß und zerstört Spielstände.'},
  {l:'Kein Patch',safe:{},sx:'Was eingereicht ist, ist eingereicht.'}]},
 {p:5,t:'Review-Codes',x:'Die Fachpresse wartet auf Keys.',o:[
  {l:'Früh rausgeben',st:'business',dc:12,s:{hype:2,wl:2},sx:'Erste Previews sind begeistert.',f:{hype:-1},fx:'Ein früher Verriss setzt den Ton.'},
  {l:'Embargo bis zum Release',safe:{hype:-1},sx:'Das Netz rätselt, ob ihr etwas zu verbergen habt.'}]},
 {p:5,t:'Vorbesteller-Boni',x:'Händler wollen exklusive Boni für Vorbestellungen.',models:['kauf','live'],o:[
  {l:'Exklusive Händler-Boni',st:'business',dc:11,s:{hype:1,budget:15},sx:'Die Vorbestellungen ziehen an.',f:{hype:-1},fx:'Vier Editionen, sieben Boni, null Durchblick.'},
  {l:'Für alle dasselbe',safe:{moral:1},sx:'Fair und einfach.'}]},
 {p:5,t:'Server-Kapazität zum Launch',x:'Wie viele Server bucht ihr für den Starttag?',models:['live','abo','f2p'],o:[
  {l:'Großzügig vorsorgen',safe:{budget:-20,hype:1},sx:'Launch ohne Warteschlange. Selten genug.'},
  {l:'Knapp kalkulieren',st:'technik',dc:14,s:{},sx:'Es reicht ganz genau.',f:{hype:-3},fx:'Fehler 37. Ihr wisst, was das bedeutet.'}]},
 {p:5,t:'Kopierschutz vor Release',x:'Der Publisher schlägt einen strengen Kopierschutz für die Startwoche vor.',models:['kauf'],o:[
  {l:'Ohne DRM veröffentlichen',safe:{hype:1,moral:1},sx:'Die Community feiert euer Vertrauen.'},
  {l:'Strengen Kopierschutz einbauen',st:'technik',dc:13,s:{budget:10},sx:'Läuft unauffällig im Hintergrund.',f:{bugs:3,hype:-2,gfx:-2},fx:'Der Kopierschutz halbiert die Framerate bei ehrlichen Käufern.'}]}
];

/* ===================== Zufallsereignisse ===================== */
const R=[
 {t:'Grippewelle',x:'Das halbe Büro hustet.',st:'team',dc:12,s:{},sx:'Alle bleiben brav zu Hause und kurieren sich aus. Kaum Verzug.',f:{zeit:-1,moral:-1},fx:'Zwei Wochen fällt das halbe Team aus.'},
 {t:'Förderbescheid',x:'Der Antrag bei der Games-Förderung wurde bewilligt.',eff:{budget:30},tiers:['indie','aa']},
 {t:'Konkurrenz kündigt an',x:'Ein großes Studio stellt ein Spiel vor, das eurem verdächtig ähnlich sieht.',st:'business',dc:13,s:{hype:1},sx:'Ihr nutzt den Vergleich und zeigt, was euch anders macht.',f:{hype:-2},fx:'Die Presse nennt euch nur noch „das kleine Ding, das so ähnlich ist“.'},
 {t:'Viral auf TikTok',x:'Ein 12-Sekunden-Clip aus eurem Spiel hat drei Millionen Aufrufe.',eff:{hype:2,wl:5},min:2},
 {t:'Unitee ändert die Gebühren',x:'Der Hersteller eurer Engine kündigt Gebühren pro Installation an.',st:'business',dc:12,s:{},sx:'Ihr verhandelt einen Altvertrag. Puh.',f:{budget:-20,moral:-1},fx:'Die neuen Gebühren treffen euch voll.',cond:s=>s.engine==='unitee',min:1},
 {t:'Neue Engine-Version',x:'Surreal Engine 6 ist erschienen, mit noch schönerem Licht.',st:'technik',dc:13,s:{gfx:6},sx:'Upgrade gelungen, die Grafik sieht noch besser aus.',f:{bugs:4,zeit:-1},fx:'Nach dem Upgrade ist jedes zweite Material lila.',cond:s=>s.engine==='surreal',min:2},
 {t:'Plugin verwaist',x:'Das Godoh-Plugin für eure Physik wird nicht mehr gepflegt.',st:'technik',dc:12,s:{gp:2},sx:'Ihr übernehmt die Pflege selbst und verbessert es gleich.',f:{bugs:3,zeit:-1},fx:'Die Physik spinnt, Kisten fliegen durch Wände.',cond:s=>s.engine==='godoh',min:1},
 {t:'Fehler im Engine-Kern',x:'Tief in eurer eigenen Engine steckt ein Speicherleck.',st:'technik',dc:13,s:{},sx:'Gefunden und gefixt in einer Nacht.',f:{bugs:4},fx:'Das Spiel stürzt nach genau 47 Minuten ab.',cond:s=>s.engine==='eigen',min:2},
 {t:'Abwerbeversuch',x:'Ein Headhunter bietet einem eurer wichtigsten Köpfe ein Spitzengehalt bei der Konkurrenz.',st:'team',dc:13,dcAdj:s=>s.plan.gehalt===2?-3:s.plan.gehalt===0?3:0,s:{moral:1},sx:'Sie bleiben aus Überzeugung — und bringen am Montag Kuchen mit.',f:{gp:-4,gfx:-3,zeit:-1},fx:'Schmerzhafter Abgang mitten im Projekt.',onFail:()=>handleLeadPoach()},
 {t:'Gewitter',x:'Blitzeinschlag in der Nachbarschaft, der Strom ist weg.',st:'technik',dc:10,s:{},sx:'Die USV hält, alles ist gespeichert.',f:{bugs:3},fx:'Ungespeicherte Arbeit ist verloren, ein Build ist kaputt.'},
 {t:'Hackerangriff',x:'Jemand versucht, in euer Repository einzudringen.',st:'technik',dc:14,s:{},sx:'Die Firewall hält. Der Angreifer erbeutet nur den Kantinenplan.',f:{budget:-15,hype:-1,bugs:2},fx:'Quellcode-Teile tauchen im Netz auf.'},
 {t:'Award-Nominierung',x:'Euer Spiel ist als „bestes kommendes Spiel“ nominiert.',eff:{hype:1,moral:1,wl:2},min:2},
 {t:'Kaffeemaschine kaputt',x:'Die Produktivität sinkt messbar.',eff:{moral:-1,budget:-1}},
 {t:'Dev-Kits verspätet',x:'Die Entwicklungskonsolen stecken beim Zoll fest.',st:'business',dc:11,s:{},sx:'Ein Anruf, ein Formular, sie sind da.',f:{zeit:-1},fx:'Drei Wochen ohne Testhardware.'},
 {t:'Speedrunner entdecken euch',x:'Die Demo wird in Rekordzeit durchgespielt.',eff:{hype:1,bugs:2,wl:2},min:3},
 {t:'Großer Konkurrent am selben Tag',x:'Ein Blockbuster verschiebt seinen Release genau auf euren Termin.',st:'business',dc:14,s:{hype:1},sx:'Ihr zieht eine Woche vor und habt die Bühne für euch.',f:{hype:-2},fx:'Niemand redet mehr über euch.',min:4},
 {t:'Main-Branch gelöscht',x:'Der Praktikant hat versehentlich den Haupt-Branch gelöscht.',st:'technik',dc:11,s:{},sx:'Ein Befehl, und alles ist wieder da.',f:{zeit:-1,moral:-1},fx:'Das letzte Backup ist zwei Wochen alt.'},
 {t:'Elternzeit',x:'Aus eurem Kernteam verabschiedet sich jemand in die Elternzeit. Glückwunsch! Der Plan wackelt trotzdem.',eff:{zeit:-1,moral:1}},
 {t:'Hitzewelle',x:'36 Grad im Büro, die Rechner drehen durch.',st:'team',dc:10,s:{moral:1},sx:'Ventilatoren, Eis und kurze Hosen. Alle machen das Beste draus.',f:{moral:-1},fx:'Die Stimmung kocht mit.'},
 {t:'Publisher-Fusion',x:'Euer Publisher wird von einem Konzern übernommen.',st:'business',dc:13,s:{budget:20},sx:'Das neue Management liebt euer Projekt.',f:{budget:-25,hype:-1},fx:'Das neue Management streicht Budget und Marketing.',cond:s=>s.publisher},
 {t:'Fans bauen ein Wiki',x:'Die Community dokumentiert jedes Detail eurer Ankündigungen.',eff:{hype:1,wl:2},min:3},
 {t:'Game-Jam-Preis',x:'Eine Kollegin gewinnt mit einem Nebenprojekt einen Preis.',eff:{moral:1,gp:3}},
 {t:'Steuerprüfung',x:'Das Finanzamt kündigt sich an.',st:'business',dc:12,s:{},sx:'Alle Belege sind sauber abgelegt.',f:{budget:-12,zeit:-1},fx:'Zwei Wochen Ordner suchen und eine saftige Nachzahlung.'},
 {t:'Review-Bombing',x:'Wegen einer Store-Exklusivität hagelt es negative Bewertungen.',st:'business',dc:12,s:{},sx:'Eine klare Erklärung beruhigt die Lage.',f:{hype:-2},fx:'Der Shitstorm hält eine Woche an.',min:3,cond:s=>s.plat==='exklusiv'},
 {t:'Wo bleibt meine Sprache?',x:'Spieler aus Brasilien fordern eine Übersetzung.',st:'business',dc:12,s:{hype:1},sx:'Ihr kündigt die Übersetzung als Update an.',f:{hype:-2},fx:'Tausende negative Bewertungen auf Portugiesisch.',cond:s=>s.langDone&&!s.langs.pt,min:4},
 {t:'DDoS-Angriff',x:'Die Server werden mit Anfragen geflutet.',st:'technik',dc:13,s:{},sx:'Der Schutz greift, die Spieler merken nichts.',f:{hype:-2,budget:-10},fx:'Ein Wochenende lang ist der Online-Modus nicht erreichbar.',models:['live','abo','f2p'],min:3},
 {t:'Goldfarmer-Bots',x:'Bots farmen Ingame-Währung und verkaufen sie für echtes Geld.',st:'technik',dc:12,s:{gp:2},sx:'Eine Bann-Welle säubert die Server.',f:{gp:-4,hype:-1},fx:'Die Wirtschaft im Spiel ist ruiniert.',models:['live','abo','f2p'],min:4},
 {t:'Serverrechnung explodiert',x:'Der Cloud-Anbieter rechnet anders ab als gedacht.',st:'business',dc:12,s:{},sx:'Ein Gespräch, ein Rabatt.',f:{budget:-15},fx:'Die Rechnung ist dreimal so hoch wie geplant.',models:['live','abo','f2p'],min:4},
 {t:'Kult-Mod',x:'Ein Modder baut aus eurer Beta einen völlig neuen Spielmodus. Alle reden darüber.',eff:{hype:2,wl:3,gp:2},mods:true,min:3},
 {t:'Mod mit Schadcode',x:'Eine beliebte Mod enthält einen Krypto-Miner.',st:'technik',dc:12,s:{},sx:'Ihr sperrt sie sofort und baut eine Prüfung ein.',f:{hype:-2},fx:'Tausende Rechner sind betroffen, die Presse fragt bei euch nach.',mods:true,min:3},
 {t:'Early-Access-Rezensionen',x:'Die ersten Store-Bewertungen zur Beta trudeln ein.',st:'design',dc:12,s:{hype:1,gp:3},sx:'„Sehr positiv“. Die Wünsche der Spieler sind gute Ideen.',f:{hype:-2},fx:'„Ausgeglichen“. Das schreckt Käufer ab.',ea:true,min:4},
 {t:'Filmstart verschoben',x:'Der Film zu eurem Lizenzspiel kommt ein halbes Jahr später ins Kino.',st:'business',dc:13,s:{},sx:'Ihr erscheint trotzdem gemeinsam mit dem Trailer, das reicht.',f:{hype:-2},fx:'Euer Spiel erscheint ohne Rückenwind.',ip:['lizenz'],min:2},
 {t:'Fans des Vorgängers',x:'Der erste Teil ist plötzlich in einem großen Abo-Dienst.',eff:{hype:2,wl:3},ip:['franchise'],min:2},
 {t:'Kein Schadensmodell',x:'Ein Autohersteller verbietet, dass seine Wagen Beulen bekommen.',st:'business',dc:13,s:{},sx:'Ihr einigt euch auf Kratzer statt Beulen.',f:{gfx:-3,gp:-2},fx:'Alle Autos bleiben makellos. Die Community spottet.',cond:s=>s.lic==='auto',min:2},
 {t:'Abstieg',x:'Ein Traditionsverein von eurem Cover steigt ab.',st:'business',dc:12,s:{hype:1},sx:'Ihr tauscht das Cover rechtzeitig.',f:{hype:-1,budget:-5},fx:'Das Cover muss neu gedruckt werden.',cond:s=>s.lic==='liga',min:2},
 {t:'Song-Lizenz läuft aus',x:'Ein Label will für einen eurer Songs plötzlich das Doppelte.',st:'business',dc:12,s:{},sx:'Nachverhandelt, der Song bleibt.',f:{budget:-6,snd:-3},fx:'Ihr zahlt zähneknirschend.',cond:s=>s.lic==='musik',min:2},
 {t:'Die Karte ist leer',x:'Tester beschweren sich: Die riesige Welt hat zu wenig zu tun.',st:'design',dc:13,s:{gp:4},sx:'Ihr streut Nebenquests und Geheimnisse über die Karte.',f:{gp:-4,hype:-1},fx:'„Hübsch, aber leer“ wird zum geflügelten Wort.',cond:s=>s.world==='open',min:2},
 {t:'Nur sechs Stunden?',x:'Ein Leak verrät die Spielzeit.',st:'business',dc:12,s:{},sx:'Ihr erklärt überzeugend, warum sechs gute Stunden besser sind als sechzig leere.',f:{hype:-2},fx:'Das Forum rechnet Euro pro Spielstunde.',cond:s=>s.world==='schlauch',min:3},
 {t:'Der Hund frisst das Dev-Kit',x:'Pixel hat das Kabel des Entwicklungsgeräts durchgekaut.',eff:{budget:-3,moral:1},cond:s=>s.shop.includes('hund')},
 {t:'Großinvestor klopft an',x:'Ein Fonds will Anteile an eurem Studio kaufen.',st:'business',dc:14,s:{budget:60,moral:-1},sx:'Viel Geld, aber jetzt sitzt jemand im Beirat, der Excel liebt.',f:{},fx:'Die Verhandlungen platzen in letzter Minute.',tiers:['indie','aa']},

 /* === Neue Events: Eigene Engine, Alterung & Lizenzierung === */
 {t:'Spott über veraltete Engine-Grafik',x:'Unter eurem neuesten Screenshot kommentieren Tausende: „Sieht aus wie auf der vorletzten Konsolengeneration!“',st:'technik',dc:13,s:{gfx:3,hype:1},sx:'Ihr rüstet kurzfristig moderne Post-Processing-Shader nach und dreht die Stimmung.',f:{gfx:-5,gp:-2,hype:-1},fx:'Der Vergleich mit modernen Konkurrenten schmerzt sichtbar.',cond:s=>s.engine==='eigen'&&C&&C.studio.engine&&(C.studio.engine.age||0)>=2,min:2},
 {t:'Lizenznehmer landet Überraschungshit!',x:'Ein externes Studio hat mit eurer lizenzierten Engine einen Indie-Hit gelandet.',eff:{budget:35,hype:1},cond:()=>C&&C.studio.engine&&['royalty','seat'].includes(C.studio.engine.licenseMode)&&(C.studio.engine.age||0)<=2,min:1},
 {t:'Notruf eines Engine-Lizenznehmers',x:'Ein Partnerstudio droht kurz vor deren Release an einem Bug in eurer Engine zu scheitern.',st:'technik',dc:13,s:{budget:15,hype:1},sx:'Euer Tech-Team löst das Problem per Fernwartung. Euer Ruf als Engine-Anbieter wächst!',f:{zeit:-1,budget:-10},fx:'Ihr müsst eure eigenen Programmierer zwei Wochen lang abstellen.',cond:()=>C&&C.studio.engine&&['royalty','seat'].includes(C.studio.engine.licenseMode),min:2},
 {t:'Open-Source-Pull-Request',x:'Ein unbekannter Programmierer aus Finnland schickt 4.000 Zeilen hochoptimierten Engine-Code.',eff:{bugs:-4,gfx:3,gp:2},cond:()=>C&&C.studio.engine&&C.studio.engine.licenseMode==='opensource',min:1},
 {t:'Technische Schulden holen euch ein',x:'Alter Spaghetti-Code in eurer eigenen Engine blockiert neue Gameplay-Features.',st:'technik',dc:14,s:{bugs:-2,gp:2},sx:'Mit einem mutigen Wochenende-Refactoring zieht ihr den Karren aus dem Dreck.',f:{bugs:5,gp:-3,zeit:-1},fx:'Jede Änderung bricht drei alte Systeme.',cond:s=>s.engine==='eigen'&&C&&C.studio.engine&&(C.studio.engine.techDebt||0)>0,min:2},
 {t:'Shader-Stottern im Preview-Build',x:'PC-Tester klagen über Ruckler beim Betreten neuer Räume.',st:'technik',dc:12,s:{gfx:3,bugs:-2},sx:'Vorab-Kompilierung im Hauptmenü eingebaut — butterweich!',f:{hype:-1,gfx:-3,bugs:3},fx:'Digital Foundry widmet eurer Ruckel-Orgie ein eigenes Video.',min:3},

 /* === Neue Events: Lead-Personal, Erfahrung & Gehaltsspirale === */
 {t:'Gehaltsforderung der Leads',x:'Eure erfahrensten Köpfe verweisen auf gestiegene Lebenshaltungskosten und ihren Marktwert.',st:'business',dc:13,dcAdj:s=>s.plan.gehalt===2?-2:s.plan.gehalt===0?2:0,s:{moral:1},sx:'Ihr einigt euch auf einen erfolgsabhängigen Bonus nach Release.',f:{budget:-12,moral:-1},fx:'Um eine Kündigungswelle zu verhindern, müsst ihr sofort nachlegen.',cond:()=>C&&C.studio.staff.length>0,onFail:()=>{C.studio.salaryDrift=(C.studio.salaryDrift||0)+0.06;return 'Die Grundgehälter steigen dauerhaft.'}},
 {t:'Keynote auf der Entwicklerkonferenz',x:'Einer eurer Leads wurde eingeladen, auf einer großen Fachkonferenz über euer Spiel zu sprechen.',st:'design',dc:11,s:{hype:1,wl:3,moral:1},sx:'Voller Saal, Standing Ovations und +1 XP für euer Lead-Personal!',f:{zeit:-1},fx:'Die Reise und Vorbereitung haben fast zwei Wochen gekostet.',cond:()=>C&&C.studio.staff.length>0,onOk:()=>{if(C.studio.staff.length){const st=C.studio.staff[Math.floor(Math.random()*C.studio.staff.length)];st.xp=(st.xp||0)+1;checkStaffLevelUp(st);}}},
 {t:'Lead liebäugelt mit eigenem Studio',x:'Ein langjähriger Lead überlegt, sich nach diesem Projekt mit eigenem Indie-Studio selbstständig zu machen.',st:'team',dc:13,s:{moral:1},sx:'Ihr gebt mehr kreative Freiheit — die Kündigung landet im Papierkorb!',f:{moral:-1},fx:'Die innere Kündigung ist spürbar, die Loyalität sinkt stark.',cond:()=>C&&C.studio.staff.some(x=>(x.level||1)>=2),onFail:()=>{const hi=C.studio.staff.find(x=>(x.level||1)>=2)||C.studio.staff[0];if(hi){hi.loyalty=Math.max(1,(hi.loyalty||6)-3);return `${hi.personName} (${STAFF[hi.id].n}) verliert deutlich an Loyalität.`}}},
 {t:'Ehemaliger Lead bringt Konkurrenzspiel heraus',x:'Ein früheres Teammitglied zeigt sein eigenes Spiel — und die Presse vergleicht euch direkt.',st:'design',dc:12,s:{hype:1,gp:3,gfx:2},sx:'Der gesunde Wettbewerb spornt euer ganzes Team zu Höchstleistungen an!',f:{hype:-1,moral:-1},fx:'Im direkten Vergleich wirkt euer Build plötzlich etwas altbacken.',cond:()=>C&&C.studio.exStaff&&C.studio.exStaff.length>0,min:2},
 {t:'Kreative Differenzen in der Führungsetage',x:'Art Direction und Tech-Lead streiten lautstark über das Partikelsystem: Optik gegen Framerate.',st:'team',dc:12,s:{gfx:3,gp:2,bugs:-1},sx:'Ihr moderiert klug: Schöne Effekte UND stabile 60 FPS.',f:{moral:-2,bugs:2},fx:'Beide Abteilungen mauern zwei Wochen lang.',cond:()=>hasStaff('senior')&&hasStaff('art')},

 /* === Neue Events: Money Drains, Infrastruktur & Branche === */
 {t:'Mieterhöhung & Nebenkostenabrechnung',x:'Der Vermieter erhöht die Gewerbemiete und die Strompreise für eure Serverräume ziehen kräftig an.',st:'business',dc:12,s:{budget:-5},sx:'Ihr verhandelt eine Deckelung gegen längere Laufzeit.',f:{budget:-18},fx:'Die Nachzahlung reißt ein empfindliches Loch in die Kasse.',min:1},
 {t:'Middleware-Lizenz wird zum Abo',x:'Das Audio- und Physik-Tool, das ihr seit Jahren nutzt, stellt auf teure Pro-Kopf-Gebühren um.',st:'technik',dc:13,s:{gp:2},sx:'Ihr ersetzt das Tool an einem Wochenende durch eigenen Code.',f:{budget:-14},fx:'Mitten in der Produktion könnt ihr nicht wechseln — ihr müsst zahlen.',min:2},
 {t:'Zoll & Hardware-Knappheit',x:'Grafikkarten und Testgeräte sind plötzlich doppelt so teuer wie kalkuliert.',eff:{budget:-10,bugs:1},min:1},
 {t:'Berufsgenossenschaft & Arbeitsschutz-Prüfung',x:'Ein Prüfer misst Tischhöhen, Lichtwerte und Kabelkanäle im Studio nach.',st:'business',dc:11,s:{moral:1},sx:'Alles vorbildlich. Das Team freut sich über neue ergonomische Stühle.',f:{budget:-12,zeit:-1},fx:'Bußgeld und zwei Wochen Umbau im laufenden Betrieb.'},
 {t:'Dataminer leaken das Ende',x:'Aus den Dateien eurer Demo haben Fans das komplette Finale rekonstruiert.',st:'design',dc:13,s:{hype:2,gp:3},sx:'Ihr baut einen cleveren Twist ein, der selbst die Leaker überrascht!',f:{hype:-2},fx:'Spoiler-Warnungen überschwemmen sämtliche Foren.',min:3},
 {t:'Charity-Speedrun-Marathon',x:'Ein Wohltätigkeits-Stream fragt, ob ihr eine Spezial-Challenge eures Spiels beisteuern wollt.',st:'team',dc:11,s:{hype:2,wl:3,moral:1},sx:'Hunderttausende schauen zu, und für den guten Zweck springen 50.000 € Spenden heraus.',f:{zeit:-1},fx:'Der Sonder-Build stürzt leider beim ersten Boss ab.',min:2},
 {t:'Modder fixt euren ältesten Bug',x:'Ein Fan postet im Forum die exakte Code-Zeile, die eure Ladezeiten halbiert.',eff:{bugs:-3,gfx:2,gp:1,hype:1},min:3},
 {t:'Kult-YouTuber entdeckt euer altes Spiel',x:'Ein zweistündiges Video-Essay feiert euer früheres Werk als „verkanntes Meisterwerk“.',eff:{hype:1,wl:4,budget:12},cond:()=>C&&C.hall&&C.hall.length>0,min:1},
 {t:'Speicherstand-Killer in der Beta',x:'Ein seltener Fehler löscht nach zehn Spielstunden das Inventar der Tester.',st:'technik',dc:13,s:{bugs:-3,moral:1},sx:'Ihr stellt die Spielstände wieder her und legt ein Entschuldigungs-Item obendrauf.',f:{hype:-2,bugs:3},fx:'Die Tester sind stinksauer und warnen auf Social Media.',min:4},
 {t:'Fan-Art-Wettbewerb eskaliert',x:'Eure Community reicht über 2.000 Kunstwerke ein — das beste soll als Easter Egg ins Spiel.',eff:{hype:1,wl:3,gfx:2},min:2},

 /* === Macken des Directors === */
 {t:'Eine neue Idee',x:'Der Director kommt aus dem Wochenende zurück: Das Spiel braucht unbedingt ein Angelsystem.',st:'team',dc:13,s:{gp:3},sx:'Das Team überzeugt ihn, es als kleines Minispiel umzusetzen.',f:{zeit:-1,budget:-10,gp:4},fx:'Das Angelsystem kommt. Mit Wetter, Ködern und Fischlexikon.',flaw:'creep'},
 {t:'Die Vision wächst',x:'In einem Livestream zeigt der Director Konzeptbilder für drei neue Planeten.',eff:{hype:1,zeit:-1},flaw:'creep'},
 {t:'Noch nicht gut genug',x:'Der Director lässt ein fertiges Level komplett neu bauen.',st:'team',dc:12,s:{gp:3,gfx:2},sx:'Ihr einigt euch auf gezielte Verbesserungen.',f:{zeit:-1,gp:4,gfx:2,moral:-1},fx:'Vier Wochen Arbeit landen im Papierkorb. Besser ist es jetzt trotzdem.',flaw:'perfekt'},
 {t:'Wutausbruch im Meeting',x:'Der Director wirft einen Whiteboard-Marker an die Wand.',st:'team',dc:12,s:{},sx:'Eine ehrliche Entschuldigung am nächsten Morgen rettet die Stimmung.',f:{moral:-2},fx:'Zwei Leute lassen sich in ein anderes Team versetzen.',flaw:'diva'},
 {t:'Streit mit dem Publisher',x:'Der Director will die Schlussszene auf zwölf Minuten verlängern.',st:'business',dc:13,s:{gfx:3,gp:1},sx:'Der Publisher gibt nach. Die Szene ist großartig.',f:{budget:-15,hype:-1},fx:'Der Streit landet in der Fachpresse.',flaw:'diva'},
 {t:'Recherchereise',x:'Für Referenzfotos war das halbe Team eine Woche auf Island.',eff:{budget:-12,gfx:4},flaw:'kosten'},
 {t:'Der Post um drei Uhr nachts',x:'Der Director antwortet einem Troll. Ausführlich.',st:'business',dc:13,s:{hype:2},sx:'Die Antwort ist so witzig, dass sie zum Meme wird.',f:{hype:-2},fx:'Der Shitstorm dauert drei Tage.',flaw:'social'},
 {t:'Was ist ein Branch?',x:'Der Director hat selbst etwas im Code geändert.',st:'technik',dc:11,s:{},sx:'Ein Code-Review fängt es rechtzeitig ab.',f:{bugs:3},fx:'Die Änderung landet direkt im Presse-Build.',flaw:'technikfern'},
 {t:'Ein großes Versprechen',x:'Auf der Bühne kündigt der Director an, dass jeder Baum im Spiel in Echtzeit wächst.',eff:{hype:2,promise:1,wl:2},flaw:'verspricht'},
 {t:'Das Versprechen einlösen',x:'Die Fans fragen nach den versprochenen Features.',st:'technik',dc:14,s:{promise:-1,gp:3,gfx:2},sx:'Ihr liefert, was versprochen wurde.',f:{zeit:-1},fx:'Ihr versucht es, und es frisst einen Monat.',flaw:'verspricht',cond:s=>s.promises>0},
 {t:'Das fliegende Pferd',x:'In eurem Trailer fliegt ein Pferd quer durchs Bild.',eff:{hype:1,bugs:2},flaw:'buggy'}
];
