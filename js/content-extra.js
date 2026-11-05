/* ===================== Zusatzinhalte: Textvarianten, neue Zufallsereignisse, Interview-Fragen ===================== */

/* --- 1) Alternative Einleitungstexte (Variante 0 = Originaltext in events.js) --- */
const TEXT_VARIANTS={
 /* Phase 0 */
 'Der Pitch':[
  'Ein Publisher sitzt zwanzig Minuten lang in eurem Besprechungsraum. Danach wartet sein nächster Termin, und der hat Vorrang.',
  'Der Mann von der Publisher-Seite schaut schon bei der Begrüßung auf die Uhr. Ihr habt ein Zeitfenster, so groß wie eine Kaffeepause.'],
 'Die große Idee':[
  'Drei Stunden, ein Whiteboard, kalte Pizza. Am Ende muss ein einziger Satz dastehen, der euer Spiel erklärt.',
  'Das Whiteboard ist voll, die Pizza leer. Fehlt nur noch der Elevator-Pitch, der nicht länger als ein Aufzug dauert.'],
 'Das Team':[
  'Euer Studio ist für das Projekt zu klein. Auf dem Tisch liegen Bewerbungen, und im Handy blinkt der alte Uni-Chat.',
  'Ohne Verstärkung wird das nichts. Im Posteingang stapeln sich Lebensläufe, und ein paar Ex-Kommilitonen fragen verdächtig oft nach.'],
 'Das Büro':[
  'Das Studio braucht einen Ort. Der Makler zeigt euch ein Loft, in dem schon ein Tischkicker auf euch wartet.',
  'Miete, Weg zur Arbeit, Kaffeequalität: Wo soll euer Studio sitzen? Ein Makler schwärmt von Backstein und Kickertisch.'],
 'Server-Architektur':[
  'Euer Spiel funktioniert nur online. Jetzt muss jemand entscheiden, auf welchen Servern es läuft.',
  'Ohne Server kein Spiel. Die Frage ist nur, wem sie gehören und wer nachts um drei angerufen wird.'],
 'Vertrag mit dem Rechteinhaber':[
  'Die Lizenzgeber wollen jeden Entwurf vorab sehen und abnicken. Der Vertrag liegt auf dem Tisch.',
  'Der Rechteinhaber hat sehr genaue Vorstellungen von seiner Marke und besteht auf einem Freigabeverfahren für alle Designs.'],
 'Tech-Stack & Grafik-Ziel':[
  'Im Technik-Team wird hitzig über Licht-Pipeline und Build-Automatisierung gestritten. Jemand muss entscheiden.',
  'Das Tech-Team stellt eine Frage, die klingt wie Smalltalk, aber das halbe Projekt bestimmt: Wie bauen wir und wie schön soll es werden?'],

 /* Phase 1 */
 'Spaßfaktor null':[
  'Die erste spielbare Version ist da. Alle testen sie ernsthaft. Es herrscht bedrücktes Schweigen.',
  'Der Build läuft. Das Team spielt eine halbe Stunde. Dann räuspert sich jemand und sagt: „Also …“'],
 'Game Jam am Wochenende':[
  'Aus dem Team kommt der Vorschlag, zwei Tage lang im Büro an wilden Spielideen zu basteln. Freiwillig, sagt er.',
  'Samstag, Büro, Energydrinks: Ein Kollege möchte das Wochenende für einen internen Jam nutzen.'],
 'Der Praktikant und der Bug':[
  'Beim Testen ist dem Praktikanten ein Physikfehler aufgefallen. Der ist spaßiger als das, woran ihr eigentlich arbeitet.',
  'Der Praktikant meldet einen Bug, will ihn aber eigentlich nicht gemeldet haben. Er findet ihn nämlich richtig gut.'],
 'Die Investoren-Demo':[
  'Drei Investoren in teuren Jacketts besuchen euer Studio. Sie nennen es „einen kurzen Eindruck gewinnen“.',
  'Besuch von Geldgebern: Sie wollen etwas sehen, am liebsten etwas, das funktioniert.'],
 'Was die Fans wollen':[
  'Die Fangemeinde des Vorgängers hat ein Dokument mit 300 Wünschen verfasst. Es hat ein Inhaltsverzeichnis.',
  'Im Forum kursiert ein 40-seitiges Wunschpapier zum Nachfolger. Es ist besser strukturiert als euer Designdokument.'],
 'Ein Spiel ohne Namen':[
  'Eure Spielwelt hat Orte und Figuren, aber keine Namen dafür. „Ort 3“ und „Typ mit Hut“ sind keine Dauerlösung.',
  'In der Projektdatei heißt noch alles „Platzhalter_final_neu“. Zeit, der Welt Namen zu geben, die man sich merkt.'],
 'Vertical Slice für die Presse':[
  'Ein Journalist, mit dem ihr per Du seid, möchte ein kleines Stück vom Spiel sehen, bevor es öffentlich wird.',
  'Ein Redakteur fragt freundlich, ob er schon mal einen Blick auf das Spiel werfen darf. Für ihn ist das eine Frage, für euch eine Terminfrage.'],

 /* Phase 2 */
 'Feature Creep':[
  'Jemand mit Einfluss in der Firma hält Multiplayer für unverzichtbar. Heute sei ein Spiel ohne Mehrspielermodus nichts mehr wert.',
  'In der Besprechung fällt der Satz „Das kann man doch schnell …“ und zwar zu Multiplayer.'],
 'Hinter dem Zeitplan':[
  'Der Projektplan zeigt: sechs Wochen Rückstand. Der Plan hat bisher meistens recht gehabt.',
  'Ein Blick in die Planungsübersicht, und der Kaffee schmeckt gleich schlechter. Ihr seid etwa sechs Wochen zu spät.'],
 'Streit um den Artstyle':[
  'Die Art-Abteilung will einen Look wie ein Aquarell. Der Publisher will Realismus, bitte mit Charakter.',
  'Zwei Welten prallen aufeinander: handgemalte Texturen gegen „fotorealistisch, aber irgendwie speziell“.'],
 'Die Build-Maschine qualmt':[
  'Aus dem Serverraum riecht es verbrannt. Dann fällt euch ein, dass ihr das letzte Backup nie nachgesehen habt.',
  'Der Build-Server schaltet sich ab, begleitet von einem Geruch, der nicht in Rechenzentren gehört.'],
 'Der Soundtrack':[
  'Die Musik im Spiel stammt immer noch aus einer kostenlosen Sammlung. Sie fällt keinem auf, ihr aber schon.',
  'Seit Monaten läuft derselbe Fahrstuhl-Track, der „nur vorläufig“ gedacht war. Das Spiel braucht echte Musik.'],
 'Monetarisierung':[
  'Das Spiel ist gratis. Aber eure Miete ist es nicht. Wie kommt Geld rein?',
  'Free-to-play klingt schön, bis jemand nach den Einnahmen fragt.'],
 'Das Endgame':[
  'Wenn Spieler das Levelcap erreichen, geht der Spaß erst richtig los oder aber ganz schnell zu Ende.',
  'Level 60 ist erreicht, und die Spieler schauen euch erwartungsvoll an: „Und jetzt?“'],
 'KI-Assistenten in der Pipeline':[
  'Ein Softwareanbieter wirbt damit, dass seine KI Texturen und Nebenquests in doppelter Geschwindigkeit liefert.',
  'Das Angebot klingt gut: Generative KI übernimmt das Fleißige, ihr den Feinschliff. So sagt es zumindest die Vertriebsabteilung.'],

 /* Phase 3 */
 'Trailer für die große Messe':[
  'Ihr bekommt Bühne und Beamer auf einer großen Messe. Drei Minuten, in denen alle euch ansehen.',
  'Die Messeleitung hat euch einen Trailer-Slot vor großem Publikum gegeben. Die Uhr läuft ab dem ersten Bild.'],
 'Streamer-Anfrage':[
  'Ein großer Streamer fragt, ob er noch heute Abend live in eure Alpha reinspielen darf. Der Chat wartet schon.',
  'Eine Nachricht um 16 Uhr: Ein Streamer mit Millionenpublikum möchte eure Alpha ausprobieren. Um 20 Uhr geht er live.'],
 'Der Leak':[
  'Im Netz kursiert euer Alpha-Build. Jemand hat ihn auf einer Forenseite verlinkt.',
  'Ein Download-Link zu eurem unveröffentlichten Spiel wird gerade fleißig geteilt.'],
 'Crowdfunding':[
  'Fans wollen helfen und fragen, ob es einen Weg gibt, euch direkt Geld zu geben.',
  'In den Kommentaren wünschen sich Leute eine Crowdfunding-Kampagne. Manche haben schon ihre Kreditkarte in der Hand.'],
 'Demo-Festival':[
  'Ein großes Online-Festival sucht Demos von kleineren Studios. Die Einreichungsfrist läuft.',
  'Eine Plattform veranstaltet einen Demo-Tag und lädt kleine Teams zum Mitmachen ein.'],
 'Die Aktionäre':[
  'Das Quartal endet, und der Vorstand schaut auf die Zahlen. Es sollen mehr Einnahmen pro Spieler her.',
  'Die Aktionäre haben Wünsche. Die Wünsche haben Dollarzeichen. Jemand soll eine Idee liefern, wie man pro Spieler mehr verdient.'],
 'Geschlossene Beta':[
  'Der Online-Modus soll vor Release getestet werden. Die Frage ist nur: von wie vielen Leuten?',
  'Für die Beta liegen zigtausend Anmeldungen vor. Die Server sind eher auf dreihundert eingestellt.'],
 'Modding-Werkzeuge':[
  'Eure Community will mitbauen. Fraglich ist, wie viel Werkzeug ihr aus der Hand gebt.',
  'Fans wollen eigene Inhalte machen und fragen nach Werkzeugen. Ihr müsst entscheiden, wie weit die Tür aufgeht.'],
 'Early-Access-Roadmap':[
  'Ab nächstem Monat kann die Beta gekauft werden. Gekaufte Spieler wollen wissen, was als Nächstes kommt.',
  'Early Access steht vor der Tür. Auf dem Plan fehlt noch die Roadmap, und die Community fragt täglich danach.'],
 'Dokumentation im Studio':[
  'Ein Gaming-Magazin möchte euer Team über Monate mit Kamera begleiten und daraus eine Video-Doku machen.',
  'Ein Kamerateam steht vor der Tür. Es will wissen, wie Spiele wirklich entstehen. Viele Sachen sind dabei unvorteilhaft.'],

 /* Phase 4 */
 'Die Bug-Lawine':[
  'Das Ticketsystem zeigt 412 offene Fehler. Der erste lautet: „Spiel lässt sich nicht starten.“',
  'QA hat gezählt: 412 offene Bugs. Das Wort „kritisch“ taucht in der Liste auffällig oft auf.'],
 'Alle hassen Level 3':[
  'Die Testrunde ist sich bei einem Punkt erstaunlich einig: Level 3 gehört gestrichen, verbrannt und vergessen.',
  'In jedem Feedbackbogen steht dasselbe: Level 3 nervt. Manche haben es doppelt unterstrichen.'],
 'Konsolen-Zertifizierung':[
  'Die Plattformbetreiber prüfen jetzt euren Build anhand eines Regelwerks mit mehr als 200 Seiten.',
  'Der Zertifizierungs-Check naht. Der Katalog der Anforderungen ist lang und kennt keine Gnade.'],
 'Early Access':[
  'Die Community will das Spiel schon vor Release in die Hände bekommen, und sie würde sogar dafür bezahlen.',
  'Aus dem Forum kommt die Forderung: „Nehmt schon mal unser Geld.“ Jemand schreibt es in Großbuchstaben.'],
 'Playtest-Wochenende':[
  'Ein Wochenende lang dürfen 5.000 Wishlist-Spieler das Spiel testen, wenn ihr das erlaubt.',
  'Ihr könnt 5.000 Leute aus der Wunschliste zu einem Test-Wochenende einladen. Sie würden es tun.'],
 'Handheld-PC-Verifizierung':[
  'Tragbare Gaming-PCs sind gerade beliebt. Eine Verifizierung dafür bringt euch prominent in den Store.',
  'Handheld-Spieler suchen gezielt nach verifizierten Titeln. Ein Prüfsiegel würde euch dort sichtbar machen.'],

 /* Phase 5 */
 'Der Releasetermin':[
  'Acht Wochen bis zum Release. Nach realistischer Schätzung wären zwölf nötig.',
  'Der Kalender sagt: acht Wochen. Das Team sagt nichts, schaut aber ernst.'],
 'Day-One-Patch':[
  'Die finale Fassung ist raus zur Zertifizierung. Seitdem hat QA 60 neue Fehler entdeckt, ganz in Ruhe.',
  'Der Gold-Master ist abgegeben, und plötzlich hat jeder Tester Zeit gefunden, Bugs zu finden. 60 Stück.'],
 'Review-Codes':[
  'Die Presse fragt täglich nach Review-Keys. Sie fragen höflich, aber oft.',
  'In eurem Postfach liegen Dutzende Anfragen nach Testmustern. Der Ton wird langsam ungeduldig.'],
 'Vorbesteller-Boni':[
  'Mehrere Händler wollen Bonusinhalte, die es nur bei ihnen gibt, um Vorbestellungen anzukurbeln.',
  'Jeder Handelspartner hätte gerne etwas Exklusives. Am besten unterschiedlich. Der Marketingplan wird kompliziert.'],
 'Server-Kapazität zum Launch':[
  'Am Starttag wird der Ansturm kommen. Es ist offen, wie viele Server ihr dafür reserviert.',
  'Der Launch steht an. Die Frage lautet: Wie viel Serverkapazität buchen und wie viel Hoffnung?'],
 'Kopierschutz vor Release':[
  'Der Publisher wünscht einen harten Kopierschutz, zumindest in der ersten Verkaufswoche.',
  'Aus der Publisher-Zentrale kommt der Vorschlag, in der Startphase ein strenges DRM einzubauen.'],

 /* Zufallsereignisse */
 'Grippewelle':[
  'Im Büro wird gehustet, geschnieft und Tee getrunken. Die Teeküche sieht aus wie ein Lazarett.',
  'Montagmorgen: Von zwölf Stühlen sind vier besetzt. Der Rest liegt im Bett.'],
 'Förderbescheid':[
  'Eine freundliche Behörde schreibt euch, dass die Förderung für euer Projekt bewilligt wurde.',
  'Im Briefkasten liegt ein Bescheid der Games-Förderung. Ausnahmsweise ist er erfreulich.'],
 'Konkurrenz kündigt an':[
  'Ein Branchenriese zeigt ein Spiel, das euren Ideen auffällig ähnelt.',
  'Auf einer Pressekonferenz stellt ein großes Studio einen Titel vor, der bei euch eine Mischung aus Panik und Déjà-vu auslöst.'],
 'Viral auf TikTok':[
  'Ein kurzes Video aus eurem Spiel verbreitet sich rasend schnell: drei Millionen Aufrufe.',
  'Jemand hat zwölf Sekunden eurer Spielszenen hochgeladen, mit Musik drunter. Jetzt sind es drei Millionen Views.'],
 'Unitee ändert die Gebühren':[
  'Der Hersteller eurer Engine verkündet plötzlich eine Gebühr pro Installation.',
  'Die Entwickler eurer Engine haben ein neues Preismodell entdeckt. Es sieht aus wie eine Rechnung an euch.'],
 'Neue Engine-Version':[
  'Es gibt ein Surreal-Engine-Update mit besserer Beleuchtung. Verlockend, aber riskant.',
  'Die neue Surreal-Version verspricht beeindruckendes Licht und beeindruckende Kompatibilitätsprobleme.'],
 'Plugin verwaist':[
  'Der Entwickler des Godoh-Physik-Plugins meldet sich nicht mehr. Das Repository ist seit Monaten still.',
  'Das Physik-Plugin für Godoh bekommt keine Updates mehr. Der letzte Commit ist von vor langer Zeit.'],
 'Fehler im Engine-Kern':[
  'In eurer hauseigenen Engine versteckt sich ein Speicherleck. Es ist alt, und es wächst.',
  'Beim Profiling sieht der Speicherverbrauch aus wie eine Treppe, die nur nach oben führt. Der Grund liegt tief im Engine-Kern.'],
 'Abwerbeversuch':[
  'Ein Personalvermittler hat einen eurer Schlüsselspieler im Visier und bietet ein fürstliches Gehalt.',
  'Eine Konkurrenzfirma lockt einen eurer wichtigsten Leute mit einem Angebot, das schwer abzulehnen ist.'],
 'Gewitter':[
  'Ein Blitz schlägt in der Nähe ein und das Licht geht aus. Alle Monitore werden schwarz.',
  'Ein Unwetter zieht über die Stadt, und kurz darauf flackert das Licht im Studio und erlischt.'],
 'Hackerangriff':[
  'Jemand klopft nachts an die Tür eures Code-Repositories und probiert alle Schlüssel durch.',
  'Das Log zeigt tausend Anmeldeversuche. Kein Versuch kommt von eurem Team.'],
 'Award-Nominierung':[
  'Euer Spiel steht auf der Nominierungsliste für „Bestes kommendes Spiel“. Man hat euch das per Mail mitgeteilt.',
  'Ein Branchenpreis nominiert euch. Auf der Urkunde ist sogar euer Name richtig geschrieben.'],
 'Kaffeemaschine kaputt':[
  'Die Kaffeemaschine gibt nur noch ein klägliches Gurgeln von sich. Im Büro breitet sich Müdigkeit aus.',
  'Jemand hat ein „Außer Betrieb“-Schild an die Kaffeemaschine geklebt. Es ist ein schwarzer Tag.'],
 'Dev-Kits verspätet':[
  'Die bestellten Entwicklungsgeräte hängen irgendwo im Zoll fest. Die Sendungsverfolgung zeigt „unterwegs“.',
  'Das Paket mit den Dev-Kits liegt in einem Lagerhaus und füllt einen Zollantrag aus.'],
 'Speedrunner entdecken euch':[
  'Eine Speedrun-Community hat eure Demo entdeckt und bricht Rekorde. Dabei finden sie jeden Fehler.',
  'In wenigen Tagen wurde die Demo auf wenige Minuten gedrückt. Die Methoden sind wild und teils unvorhergesehen.'],
 'Großer Konkurrent am selben Tag':[
  'Ein Blockbuster legt seinen Starttermin exakt auf euren. Wahrscheinlich Zufall. Wahrscheinlich.',
  'Im Kalender steht jetzt neben eurem Release ein weiterer, viel größerer. Dasselbe Datum.'],
 'Main-Branch gelöscht':[
  'Beim Aufräumen hat der Praktikant den Haupt-Branch entfernt. „Der sah alt aus“, sagt er.',
  'Das Repository ist leer. Der Praktikant steht daneben und sagt: „Ich habe nur aufgeräumt.“'],
 'Elternzeit':[
  'Jemand aus dem Kernteam bekommt ein Kind. Das ist wunderbar. Und der Zeitplan weniger.',
  'Gute Nachrichten im Team: Nachwuchs. Schlechte Nachrichten im Projektplan: Elternzeit des Kernentwicklers.'],
 'Hitzewelle':[
  'Das Thermometer zeigt 36 Grad im Büro. Die Rechner pusten Hitze und Frust in den Raum.',
  'Draußen Hitzewarnung, drinnen Lüftergeräusche wie am Flughafen. Die Klimaanlage ist ein Gerücht.'],
 'Publisher-Fusion':[
  'Euer Publisher gehört bald zu einem größeren Konzern. Die Pressemitteilung klingt sehr nach „Synergien“.',
  'Die Firma, die euer Spiel finanziert, wird übernommen. In der Mail steht „nahtlos“ dreimal.'],
 'Fans bauen ein Wiki':[
  'Eure Fans haben ein Wiki gestartet und dokumentieren alles: jede Ankündigung, jedes Screenshot-Detail.',
  'Ein Fan-Wiki zu eurem noch unfertigen Spiel hat bereits mehr Seiten als euer Designdokument.'],
 'Game-Jam-Preis':[
  'Eine Kollegin hat mit einem Nebenprojekt einen Jam gewonnen. Das ganze Büro feiert mit Kuchen.',
  'Beim Wochenend-Jam hat jemand aus eurem Team den ersten Platz belegt. Mit einem Spiel über Toast.'],
 'Steuerprüfung':[
  'Das Finanzamt kündigt einen Besuch an. Ihr sucht eilig nach den Belegordnern.',
  'Ein Brief vom Finanzamt: Betriebsprüfung. Der erste Gedanke gilt dem Ordner mit der Aufschrift „Diverses“.'],
 'Review-Bombing':[
  'Wegen einer Exklusivvereinbarung mit einem Store bekommt das Spiel plötzlich massenhaft schlechte Bewertungen.',
  'Die Store-Exklusivität kommt bei vielen schlecht an, und sie sagen es mit einem Daumen nach unten.'],
 'Wo bleibt meine Sprache?':[
  'Eine große brasilianische Community fordert, dass das Spiel auf Portugiesisch erscheint.',
  'Aus Brasilien rollt eine Welle von Kommentaren: „Wann gibt es das Spiel auf Portugiesisch?“'],
 'DDoS-Angriff':[
  'Ein Schwarm aus Bots schickt gleichzeitig Millionen Anfragen an eure Server.',
  'Jemand findet es lustig, eure Server mit Datenmüll zu fluten. Die Auslastungskurve sieht aus wie eine Klippe.'],
 'Goldfarmer-Bots':[
  'In eurem Spiel laufen Bots, die Ingame-Währung sammeln, um sie gegen echtes Geld zu verhökern.',
  'Spieler melden verdächtig fleißige Charaktere, die nie schlafen und nie chatten. Sie farmen Gold im Akkord.'],
 'Serverrechnung explodiert':[
  'Die neue Abrechnung des Cloud-Anbieters sieht anders aus als im Angebot. Die Zahlen sind größer.',
  'Die Serverrechnung kommt, und die Null am Ende ist offenbar kein Zufall.'],
 'Kult-Mod':[
  'Ein Modder verwandelt eure Beta in einen komplett anderen Spielmodus. Das halbe Forum redet nur noch darüber.',
  'Eine Community-Mod macht aus eurem Spiel etwas Neues. Es ist besser als manches, was ihr selbst geplant hattet.'],
 'Mod mit Schadcode':[
  'In einer beliebten Mod steckt ein versteckter Krypto-Miner. Spielerrechner laufen auf Hochtouren.',
  'Jemand hat in eine häufig heruntergeladene Mod heimlich Mining-Software gepackt.'],
 'Early-Access-Rezensionen':[
  'Die ersten Store-Bewertungen zur Early-Access-Fassung kommen herein.',
  'Käufer der Beta haben erste Reviews geschrieben. Einige lang, einige sehr lang, einige in Versalien.'],
 'Filmstart verschoben':[
  'Das Filmstudio schiebt den Kinostart um ein halbes Jahr nach hinten. Euer Spiel hängt daran.',
  'Der Film zu eurem Lizenzspiel kommt später. Ihr erfahrt es aus einer Pressemitteilung.'],
 'Fans des Vorgängers':[
  'Der erste Teil läuft nun in einem großen Streaming-Abo. Plötzlich spielen ihn Leute, die ihn früher nie gesehen haben.',
  'Ein großer Abo-Dienst hat den Vorgänger ins Programm genommen. Die Spielerzahlen schnellen nach oben.'],
 'Kein Schadensmodell':[
  'Der Autokonzern erlaubt keine Dellen an seinen Fahrzeugen. Nicht mal winzige.',
  'Die Lizenzvorgaben des Herstellers sind eindeutig: Seine Autos gehen in eurem Spiel nicht kaputt.'],
 'Abstieg':[
  'Ein Verein, der auf eurem Cover abgebildet ist, steigt in die nächstniedrigere Liga ab.',
  'Die Saison endet bitter für einen Club auf eurer Spielverpackung. Das Cover ist plötzlich nicht mehr aktuell.'],
 'Song-Lizenz läuft aus':[
  'Das Musiklabel meldet sich: Die Lizenz für einen eurer Tracks kostet künftig deutlich mehr.',
  'Ein Titel eures Soundtracks soll plötzlich das Doppelte kosten. Der Song ist leider ziemlich gut.'],
 'Die Karte ist leer':[
  'Die Tester laufen stundenlang durch eure große Welt und finden nichts. Das ist ein Problem.',
  'Eure offene Welt ist riesig. Leider auch ziemlich leer. Nicht mal ein Busch hat etwas zu erzählen.'],
 'Nur sechs Stunden?':[
  'Durch einen Leak ist bekannt, wie kurz die Kampagne wirklich ist.',
  'Im Netz kursiert eine Zahl: Die Spielzeit liege bei etwa sechs Stunden. Stimmt sogar.'],
 'Der Hund frisst das Dev-Kit':[
  'Pixel, der Bürohund, hat sich über ein Kabel hergemacht, das nicht für ihn gedacht war.',
  'Im Büro hört man Kauen. Pixel sieht schuldbewusst aus. Das Dev-Kit auch.'],
 'Großinvestor klopft an':[
  'Ein Investmentfonds möchte sich mit einem Anteil am Studio beteiligen. Das Angebot ist freundlich, die Folgen weniger.',
  'Ein Fonds schlägt eine Beteiligung an eurem Studio vor. Das Wort „Skalierung“ fällt zwölfmal.'],
 'Spott über veraltete Engine-Grafik':[
  'Unter euren neuen Screenshots machen sich Leute über den angestaubten Look lustig.',
  'Ein Kommentar unter dem aktuellen Bild: „Das war schon vor zehn Jahren altmodisch.“ 5.000 Likes.'],
 'Lizenznehmer landet Überraschungshit!':[
  'Ein Studio, das eure Engine nutzt, hat damit überraschend einen Verkaufsschlager erzielt.',
  'Plötzlich ist ein Spiel auf Platz 1, gebaut mit eurer Engine. Der Lizenzzähler klingelt.'],
 'Notruf eines Engine-Lizenznehmers':[
  'Ein Kunde ruft panisch an: Ein Engine-Fehler bedroht kurz vor Release sein ganzes Projekt.',
  'Ein Lizenznehmer hat einen Bug in eurer Engine gefunden und nur noch wenige Tage bis zum Start.'],
 'Open-Source-Pull-Request':[
  'Ein Fremder schickt einen riesigen, erstaunlich sauberen Beitrag zu eurer offenen Engine.',
  'Im Repository landet ein Pull-Request mit tausenden Zeilen. Der Autor stellt sich nur mit einem Vornamen vor.'],
 'Technische Schulden holen euch ein':[
  'Der alte Code eurer Engine ist ein Dschungel. Jedes neue Feature bleibt darin hängen.',
  'Neue Gameplay-Funktionen scheitern an uraltem Code in der Engine. Niemand weiß mehr, warum er so geschrieben wurde.'],
 'Shader-Stottern im Preview-Build':[
  'Tester melden Ruckler, sobald ein neuer Raum geladen wird. Es fühlt sich an wie Zeitlupe.',
  'Beim Betreten neuer Bereiche hakt das Spiel kurz. Dann nochmal. Und nochmal.'],
 'Gehaltsforderung der Leads':[
  'Eure erfahrensten Leute kommen gemeinsam zum Gespräch. Sie haben Zahlen dabei und Marktvergleiche.',
  'Die Leads wünschen mehr Geld und haben ihre Argumente in einer Präsentation zusammengefasst. Mit Diagrammen.'],
 'Keynote auf der Entwicklerkonferenz':[
  'Einer eurer Leads soll auf einer Fachkonferenz einen Vortrag zu eurem Spiel halten.',
  'Eine Einladung zur Keynote geht an euer Studio. Der Lead will zusagen. Das Team will wissen, wer in der Zeit arbeitet.'],
 'Lead liebäugelt mit eigenem Studio':[
  'Ein erfahrener Lead trägt sich mit dem Gedanken, nach dem Projekt etwas Eigenes zu gründen.',
  'Im Flurfunk heißt es: Ein langjähriger Lead hat bereits ein Firmenlogo entworfen. Nicht für euch.'],
 'Ehemaliger Lead bringt Konkurrenzspiel heraus':[
  'Jemand, der früher bei euch gearbeitet hat, kündigt sein eigenes Spiel an. Die Presse stellt sofort Vergleiche an.',
  'Ein ehemaliger Kollege präsentiert sein Soloprojekt. Es sieht euch ähnlicher, als euch lieb ist.'],
 'Kreative Differenzen in der Führungsetage':[
  'Die Art Direction und der Technik-Chef streiten über die Partikeleffekte: schön oder schnell?',
  'Zwei Leads reden in der Besprechung gleichzeitig. Es geht um Explosionen. Im Detail um deren Aufwand.'],
 'Mieterhöhung & Nebenkostenabrechnung':[
  'Die Gewerbemiete steigt, und die Stromrechnung für die Server legt gleich mit zu.',
  'Der Vermieter schickt ein Schreiben mit der Überschrift „Anpassung“. Nichts daran ist für euch angenehm.'],
 'Middleware-Lizenz wird zum Abo':[
  'Ein Tool für Audio und Physik, das ihr schon ewig verwendet, wechselt auf ein Abo mit Gebühren pro Kopf.',
  'Euer Lieblings-Werkzeug verlangt künftig monatliche Zahlungen pro Mitarbeiter. Es steckt tief in eurem Projekt.'],
 'Zoll & Hardware-Knappheit':[
  'Grafikkarten und Testgeräte sind knapp und teuer. Eure Kalkulation sieht inzwischen zu optimistisch aus.',
  'Der Hardwarepreis hat sich verdoppelt, und die Lieferzeit auch. Beide Zahlen stehen im Budget nicht drin.'],
 'Berufsgenossenschaft & Arbeitsschutz-Prüfung':[
  'Ein Prüfer kommt vorbei und misst Stuhlhöhen, Beleuchtung und Fluchtwege.',
  'Der Arbeitsschutz kündigt sich an. Das Kabelgewirr unter den Schreibtischen wird plötzlich sehr interessant.'],
 'Dataminer leaken das Ende':[
  'Fans haben in den Demo-Dateien das gesamte Finale gefunden und im Netz zusammengesetzt.',
  'Dataminer durchkämmen die Demo und finden mehr, als drinstehen sollte: das komplette Ende.'],
 'Charity-Speedrun-Marathon':[
  'Ein Spenden-Stream möchte eure Spielwelt in eine Challenge einbauen. Für den guten Zweck.',
  'Ein Wohltätigkeitsmarathon lädt euch ein, eine eigene Speedrun-Challenge beizusteuern.'],
 'Modder fixt euren ältesten Bug':[
  'Ein Fan hat euren Code studiert und meldet im Forum, wo genau der älteste Fehler sitzt.',
  'Im Forum schreibt jemand: „Zeile 4.211, falsche Schleife.“ Er hat recht.'],
 'Kult-YouTuber entdeckt euer altes Spiel':[
  'Ein bekannter YouTuber hat euer älteres Spiel ausgegraben und feiert es in einem langen Video.',
  'Ein Video-Essay über euer früheres Werk wird millionenfach angeschaut. Der Titel: „Warum kennt das keiner?“'],
 'Speicherstand-Killer in der Beta':[
  'Ein seltener Bug löscht nach etwa zehn Spielstunden den Fortschritt einiger Tester.',
  'Einige Betaspieler melden, dass ihr Spielstand verschwunden ist. Nach zehn Stunden. Ausgerechnet.'],
 'Fan-Art-Wettbewerb eskaliert':[
  'Euer Aufruf zu Fan-Art zieht über 2.000 Einsendungen an. Das Beste soll als Easter Egg ins Spiel.',
  'Zeichnungen, Skulpturen, ein gehäkelter Endgegner: Der Wettbewerb ist viel größer geworden als erwartet.']
};

/* --- 2) Neue Zufallsereignisse --- */
R.push(
 {t:'Teamausflug in den Escape Room',x:'Das Team verbringt einen Abend in einem Escape Room. Ihr habt 60 Minuten für fünf Rätsel. Ausgerechnet ihr, die Spielemacher.',st:'team',dc:11,s:{moral:2},sx:'Ihr knackt den Raum mit 40 Sekunden Rest. Die Stimmung ist bestens.',f:{moral:-1,budget:-5},fx:'Nach 60 Minuten steht ihr noch im ersten Raum. Der Betreiber bietet euch ein Trostgetränk an.'},
 {t:'Cloud-Ausfall',x:'Der Anbieter eurer Build-Server meldet eine Störung. Die Statusseite ist selbst nicht erreichbar.',st:'technik',dc:13,s:{},sx:'Euer Notfall-Build auf dem Ersatzrechner läuft. Es ist 3 Uhr, aber es läuft.',f:{zeit:-1,bugs:2},fx:'Zwei Tage kein Build, kein Test, kein Merge. Danach fehlen die Nachtschichten-Commits.',min:1},
 {t:'Erwähnung im großen Podcast',x:'Ein bekannter Spiele-Podcast spricht eine halbe Stunde lang über euer Projekt. Einer der Hosts sagt: „Das könnte der Geheimtipp des Jahres werden.“',eff:{hype:1,wl:3},min:2},
 {t:'Entlassungswelle in der Branche',x:'Mehrere große Studios schicken Hunderte Leute nach Hause. Plötzlich liegen sehr gute Bewerbungen im Postfach.',st:'business',dc:12,s:{gp:3,gfx:3},sx:'Ihr stellt zwei hervorragende Leute ein, ohne das Gehaltsgefüge zu sprengen.',f:{budget:-10,moral:-1},fx:'Eure Leute fragen sich bang, ob sie die Nächsten sind. Das Gerücht frisst Konzentration.',min:1},
 {t:'Falsche Release-Gerüchte',x:'Ein Händler hat versehentlich ein falsches Release-Datum veröffentlicht. Foren und Videos rechnen schon damit.',st:'business',dc:12,s:{hype:1},sx:'Ihr stellt es mit Humor richtig. Die Aufmerksamkeit nutzt euch am Ende sogar.',f:{hype:-2},fx:'Viele Spieler fühlen sich getäuscht, obwohl ihr nichts dafür könnt.',min:3},
 {t:'Übersetzungspanne im Trailer',x:'Im internationalen Trailer steht in den Untertiteln ein Wort, das nicht ganz das bedeutet, was es sollte. Ein Screenshot kursiert.',eff:{hype:-1,wl:-2},min:3},
 {t:'Betriebssystem-Update zerschießt den Build',x:'Über Nacht installiert sich auf mehreren Rechnern ein System-Update. Danach startet der Editor nicht mehr.',st:'technik',dc:12,s:{},sx:'Ein Rollback, ein Neustart, ein Kaffee. Bis zum Mittag läuft alles wieder.',f:{zeit:-1,bugs:3},fx:'Drei Tage Treibersuche und halbfertige Builds. Etliche Bugs rutschen unbemerkt durch.',min:1},
 {t:'Store-Redaktion wird aufmerksam',x:'Jemand von der Redaktion eines großen Stores hat euer Spiel auf der Wunschliste. Er überlegt, es auf der Startseite zu zeigen.',st:'business',dc:14,s:{wl:6,hype:2},sx:'Euer Spiel erscheint als „Empfohlen“. Die Wunschlisten laufen heiß.',f:{},fx:'Die Redaktion entscheidet sich für ein Spiel mit mehr Dinosauriern.',min:2},
 {t:'Wasserschaden im Testlabor',x:'In der Etage über euch platzt ein Rohr. Das Wasser sucht sich seinen Weg, und der führt direkt durch eure Testgeräte-Ecke.',st:'technik',dc:12,s:{budget:-5},sx:'Ihr rettet die Geräte rechtzeitig. Nur die Pizza-Vorräte sind hin.',f:{budget:-20,zeit:-1,bugs:2},fx:'Drei Testgeräte sind Schrott, die Versicherung zahlt irgendwann.',min:1},
 {t:'Ein Fan schreibt ein Lied',x:'Auf Social Media taucht ein selbst geschriebener Song über euer Spiel auf. Er ist gut. Verdächtig gut.',eff:{hype:1,moral:1},min:2},
 {t:'Streit unter dem Screenshot',x:'Ein Charakterdesign aus eurem letzten Screenshot spaltet das Netz. Die einen lieben es, die anderen schreiben Aufsätze dagegen.',st:'business',dc:13,s:{hype:1,wl:2},sx:'Ihr reagiert gelassen und witzig. Der Streit wird zur kostenlosen Werbung.',f:{hype:-2,moral:-1},fx:'Die Debatte eskaliert, und euer Team liest sie auch noch mit.',min:3},
 {t:'Hauptsprecher fällt aus',x:'Die Stimme eures Protagonisten hat eine heftige Erkältung und ist noch drei Wochen heiser. Alle Sessions stehen still.',st:'team',dc:12,s:{gp:2},sx:'Ihr zieht die Aufnahmen anderer Rollen vor. Der Sprecher gibt danach noch bessere Takes ab.',f:{zeit:-1,budget:-8},fx:'Das Studio ist gebucht, die Stimme nicht da. Umplanen kostet Zeit und Geld.',min:3},
 {t:'Trendwende im Genre',x:'Ein neues, besonders gehyptes Spiel verschiebt die Aufmerksamkeit der Spieler in eine ganz andere Richtung als eure.',eff:{hype:-1,wl:-2},min:3},
 {t:'Abo-Müdigkeit',x:'Auf Social Media häufen sich Beiträge von Spielern, die ihre Abos zusammenstreichen. Und eures steht auf der Liste.',st:'business',dc:13,s:{wl:2},sx:'Ihr schnürt ein faires Einstiegspaket, das gut ankommt.',f:{wl:-4,budget:-8},fx:'Die Spieler kündigen schon, bevor sie angefangen haben.',cond:s=>hasPremium(s),min:3},
 {t:'Euer Bug wird zum Meme',x:'Ein Fehler in eurem Spiel lässt Figuren in der Luft schweben. Ein Clip davon geht herum, mit schrägen Kommentaren.',eff:{hype:2,wl:3,bugs:1},cond:s=>s.res.bugs>=8,min:3}
);

/* --- 3) Interview-Fragen --- */
const INTERVIEW_QS=[
 {q:'Eine Frage, die alle brennend interessiert: Wann erscheint {title} nun wirklich?',a:[
  {l:'Wir verkünden den Termin, sobald er hundertprozentig steht.',tone:'safe',p:80,s:{hype:1},f:{hype:-1},sx:'Besonnen und professionell. Das Publikum nickt.',fx:'Zu vorsichtig. Im Netz heißt es: „Die wissen es selbst nicht.“'},
  {l:'Ehrlich gesagt: Der Plan ist knapp. Wir tun alles, aber garantieren können wir nichts.',tone:'honest',p:62,s:{hype:1,moral:1},f:{hype:-1},sx:'Ehrlichkeit kommt gut an. Das Team fühlt sich ernst genommen.',fx:'„Knapp“ wird zum Schlagwort. Manche sehen darin Panik.'},
  {l:'Auf den Tag genau. Das verspreche ich hier und jetzt.',tone:'bold',p:42,s:{hype:2,wl:4,promise:1},f:{hype:-2,promise:1},sx:'Applaus im Studio. Jeder zitiert euren Satz.',fx:'Das Versprechen steht im Raum, und die Skepsis auch.'}]},
 {q:'Wie wahrscheinlich ist es, dass {title} noch einmal verschoben wird?',a:[
  {l:'Aktuell sind wir im Zeitplan. Mehr kann ich heute nicht sagen.',tone:'safe',p:80,s:{hype:1},f:{hype:-1},sx:'Ruhig und glaubwürdig.',fx:'„Aktuell“ klingt verdächtig nach „bald nicht mehr“.'},
  {l:'Es kann passieren. Gute Spiele brauchen manchmal länger. Wir sagen es euch rechtzeitig.',tone:'honest',p:60,s:{moral:1,hype:1},f:{hype:-1},sx:'Das Publikum honoriert die klare Ansage.',fx:'Zwei Schlagzeilen: „Verschiebung angedeutet“ und „Studio nervös“.'},
  {l:'Verschoben wird nur, wenn der Hund ein Level aufgefressen hat.',tone:'joke',p:45,s:{hype:2,wl:3},f:{hype:-2,moral:-1},sx:'Der Saal lacht. Das Zitat landet auf T-Shirts.',fx:'Der Witz kommt als Ausflucht an. „Wieder keine klare Antwort.“'}]},
 {q:'Es heißt, bei {studio} sei die Stimmung angespannt. Gibt es Crunch?',a:[
  {l:'Wir achten auf unsere Leute. Überstunden sind die Ausnahme und werden ausgeglichen.',tone:'safe',p:78,s:{moral:1},f:{moral:-1,hype:-1},sx:'Das Team liest das Interview und fühlt sich gesehen.',fx:'Ein anonymer Beitrag widerspricht euch noch am selben Abend.'},
  {l:'Wir haben intensive Wochen. Das stimmt. Aber niemand wird dazu gezwungen.',tone:'honest',p:60,s:{hype:1,moral:1},f:{moral:-1},sx:'Ehrlich und fair. Die Branche applaudiert leise.',fx:'„Intensive Wochen“ wird als Euphemismus für Crunch gedeutet.'},
  {l:'Crunch? Wir nennen das „Produktivitätsurlaub mit Pizza“.',tone:'joke',p:36,s:{hype:1,wl:2},f:{moral:-2,hype:-2},sx:'Selbstironisch und sympathisch. Die Antwort wird geteilt.',fx:'Das Netz zerlegt den Spruch. Das Team schweigt betroffen.'}]},
 {q:'Wird es in {title} Mikrotransaktionen geben?',cond:s=>s.model!=='f2p',a:[
  {l:'Alles, was ihr braucht, steckt im Spiel. Mehr müsst ihr nicht bezahlen.',tone:'safe',p:80,s:{hype:1},f:{hype:-1},sx:'Kein Zusatzkaufzwang. Das Publikum atmet auf.',fx:'Zu glatt formuliert. Das Misstrauen bleibt.'},
  {l:'Kosmetische Extras prüfen wir, aber nichts, was Vorteile verschafft.',tone:'honest',p:62,s:{hype:1,wl:1},f:{hype:-1},sx:'Klare Linie, das gefällt den meisten.',fx:'Allein das Wort „prüfen“ reicht dem Forum für einen Thread.'},
  {l:'Niemals. Nicht einen Cent extra. Lest meine Lippen.',tone:'bold',p:42,s:{hype:2,wl:5,promise:1},f:{hype:-2,promise:1},sx:'Das Zitat geht um die Welt. Eure Fans schwören auf euch.',fx:'Die Aussage wird archiviert, mit Zeitstempel, für alle Fälle.'}]},
 {q:'In Free-to-play-Spielen gibt es oft Lootboxen. Was sagen Sie dazu bei {title}?',cond:s=>s.model==='f2p',a:[
  {l:'Wir setzen auf Fairness. Alles ist transparent und direkt kaufbar.',tone:'safe',p:80,s:{hype:1},f:{hype:-1},sx:'Sachlich, klar, verständlich. Kein Aufreger.',fx:'Ein Experte nennt die Antwort „Marketing-Prosa“.'},
  {l:'Zufallsmechaniken reizen uns finanziell. Wir wägen das Risiko ehrlich ab.',tone:'honest',p:58,s:{wl:1,hype:1},f:{hype:-2},sx:'Euer Mut zur Offenheit wird anerkannt.',fx:'Aus „wägen ab“ wird in der Überschrift „plant Lootboxen“.'},
  {l:'Lootboxen? Bei uns gibt es nur Überraschungen, die man sich verdient.',tone:'bold',p:40,s:{hype:2,wl:4,promise:1},f:{hype:-2,moral:-1,promise:1},sx:'Clever aus der Affäre gezogen. Das Netz lobt eure Haltung.',fx:'Der Spruch klingt wie ein Dementi, das kein Dementi ist. Das Echo ist kritisch.'}]},
 {q:'Was ist wichtiger für {title}: Grafik oder Gameplay?',a:[
  {l:'Beides gehört zusammen. Gutes Spiel braucht beides.',tone:'safe',p:82,s:{hype:1},f:{hype:-1},sx:'Ausgewogen. Keine Schlagzeile, keine Kritik.',fx:'Eine Antwort, die jeder Politiker so geben würde.'},
  {l:'Gameplay. Die schönste Grafik rettet kein langweiliges Spiel.',tone:'honest',p:60,s:{gp:2,hype:1},f:{gfx:-2,hype:-1},sx:'Das Gameplay-Team nickt zufrieden. Die Community auch.',fx:'Die Grafikfans nehmen es persönlich und posten Screenshots der Konkurrenz.'},
  {l:'Grafik! Gameplay ist ohnehin nur Kulisse für schöne Pixel.',tone:'joke',p:38,s:{gfx:3,hype:2},f:{gp:-2,hype:-2,moral:-1},sx:'Der Satz sorgt für Gelächter und Gesprächsstoff.',fx:'Das Design-Team nimmt den Witz leider wörtlich und ist beleidigt.'}]},
 {q:'Ein anderes Studio bringt ein ganz ähnliches {genre}-Spiel heraus. Haben Sie Angst vor der Konkurrenz?',a:[
  {l:'Wettbewerb belebt das Geschäft. Wir konzentrieren uns auf unser Spiel.',tone:'safe',p:80,s:{hype:1},f:{hype:-1},sx:'Souverän und gelassen. Das macht Eindruck.',fx:'Gelassenheit, die nach Schulterzucken aussieht.'},
  {l:'Ja, ein bisschen. Das ist ein starkes Spiel. Wir müssen sehr gut sein.',tone:'honest',p:62,s:{moral:1,hype:1},f:{moral:-1},sx:'Die Ehrlichkeit macht euch sympathisch.',fx:'Das Team liest „Angst“ in der Überschrift und wird nervös.'},
  {l:'Die sollen ruhig kommen. Am Ende erinnert sich nur an das Original: an uns.',tone:'bold',p:40,s:{hype:2,wl:4},f:{hype:-2,moral:-1},sx:'Selbstbewusst bis zur Frechheit. Der Clip läuft in Dauerschleife.',fx:'Der Satz wird dem Konkurrenten zugespielt. Dessen Antwort ist besser.'}]},
 {q:'Nutzen Sie KI-Werkzeuge bei der Entwicklung von {title}?',a:[
  {l:'Nur für interne Hilfsmittel. Alle Inhalte, die ihr seht, stammen von unserem Team.',tone:'safe',p:80,s:{hype:1,moral:1},f:{hype:-1},sx:'Klare Trennung, klare Worte. Das Team ist erleichtert.',fx:'Jemand findet im Netz einen Platzhalter mit sechs Fingern. Peinlich.'},
  {l:'Ja, an einigen Stellen. Wir sehen es als Werkzeug, nicht als Ersatz für Menschen.',tone:'honest',p:58,s:{hype:1,wl:2},f:{hype:-2,moral:-1},sx:'Differenziert und ehrlich. Das wird als erwachsene Antwort gelesen.',fx:'Die Überschrift lautet: „Studio gibt KI-Einsatz zu“. Der Rest geht unter.'},
  {l:'KI? Wir haben Praktikanten. Die funktionieren ähnlich, nur mit Kaffee.',tone:'joke',p:38,s:{hype:2,wl:3},f:{hype:-2,moral:-2},sx:'Gelächter im Saal, und die Praktikanten lachen mit.',fx:'Die Praktikanten lachen nicht. Die Branche auch nicht.'}]},
 {q:'Wie läuft die Zusammenarbeit mit Ihrem Publisher? Gibt es Einmischung?',cond:s=>s.publisher,a:[
  {l:'Wir arbeiten sehr partnerschaftlich zusammen. Alle ziehen am selben Strang.',tone:'safe',p:80,s:{hype:1},f:{hype:-1,moral:-1},sx:'Das klingt harmonisch. Der Publisher bedankt sich per Mail.',fx:'Ein Insider widerspricht anonym. Peinlich für alle Beteiligten.'},
  {l:'Es gibt Reibung, wie in jeder guten Beziehung. Am Ende sind wir uns einig.',tone:'honest',p:60,s:{hype:1,moral:1},f:{hype:-1,budget:-10},sx:'Wahrhaftig und sympathisch. Beide Seiten bleiben gelassen.',fx:'Der Publisher liest „Reibung“ und ruft am nächsten Morgen an.'},
  {l:'Der Publisher darf zahlen. Alles andere entscheiden wir.',tone:'bold',p:36,s:{hype:2,moral:2,wl:3},f:{hype:-2,budget:-15},sx:'Das Team jubelt. Die Presse liebt den Mut.',fx:'Der Publisher ist nicht amüsiert. Das Marketingbudget schrumpft.'}]},
 {q:'Wie lang ist {title} eigentlich? Was bekomme ich für mein Geld?',a:[
  {l:'Genug, um euch ein paar schöne Abende zu bescheren.',tone:'safe',p:78,s:{hype:1},f:{hype:-1},sx:'Vage, aber freundlich. Man nickt.',fx:'„Ein paar Abende.“ Das Forum rechnet sofort nach.'},
  {l:'Ungefähr zehn bis zwölf Stunden. Dafür ohne Leerlauf.',tone:'honest',p:62,s:{hype:1,wl:2},f:{hype:-1,wl:-2},sx:'Klare Zahl, klare Worte. Das beruhigt.',fx:'Die Zahl wird gegen den Preis aufgerechnet. Der Schnitt fällt nicht freundlich aus.'},
  {l:'200 Stunden Inhalt. Ihr werdet das Spiel nicht mehr verlassen.',tone:'bold',p:38,s:{hype:2,wl:5,promise:1},f:{hype:-2,promise:1},sx:'Der Saal staunt. Die Wunschlisten füllen sich.',fx:'Spieler zählen mit der Stoppuhr. Die Zahl wird eingefordert.'}]},
 {q:'Es kursieren Videos von {title}, in denen vieles noch ziemlich buggy aussieht. Beunruhigt Sie das?',cond:s=>s.res.bugs>=15,a:[
  {l:'Das ist ein früher Entwicklungsstand. Bis zum Release wird noch viel poliert.',tone:'safe',p:78,s:{hype:1},f:{hype:-1,bugs:1},sx:'Plausibel erklärt. Die meisten glauben es.',fx:'„Früher Stand“ sagt jeder. Misstrauen bleibt.'},
  {l:'Ja, das beschäftigt uns. Wir haben ein Bug-Team und viel Arbeit vor uns.',tone:'honest',p:62,s:{moral:1,bugs:-2,hype:1},f:{hype:-2,bugs:1},sx:'Ehrliche Worte. Spieler bieten sogar Hilfe beim Testen an.',fx:'Aus „Wir arbeiten dran“ wird „Spiel ist kaputt“. Titelzeile folgt.'},
  {l:'Das sind keine Bugs, das sind Features mit Persönlichkeit.',tone:'joke',p:36,s:{hype:2,wl:3},f:{hype:-2,bugs:2,moral:-1},sx:'Der Humor entschärft die Lage. Die Clips werden zu Memes.',fx:'Die Spieler finden den Witz nicht lustig, die Bugs aber schon.'}]},
 {q:'Warum sollte ich für {title} den vollen Preis zahlen?',cond:s=>s.model==='kauf',a:[
  {l:'Weil wir ein Spiel liefern, das sein Geld wert ist. Überzeugt euch selbst.',tone:'safe',p:80,s:{hype:1},f:{hype:-1},sx:'Selbstsicher, ohne anzugeben. Gute Antwort.',fx:'Die Antwort beantwortet die Frage nicht, sagt ein Kommentar.'},
  {l:'Weil wir viel Herzblut investiert haben. Und wenn es euch nicht gefällt, wartet auf den Sale.',tone:'honest',p:62,s:{hype:1,wl:2},f:{hype:-1,wl:-2},sx:'Ehrliches Understatement. Das kommt gut an.',fx:'„Wartet auf den Sale“ ist jetzt die Schlagzeile. Autsch.'},
  {l:'Weil ich für einen Latte macchiato auch mehr bezahle als für Wasser. Und unser Spiel ist besser.',tone:'joke',p:40,s:{hype:2,wl:3},f:{hype:-2,moral:-1},sx:'Der Vergleich zündet. Er wird tausendfach geteilt.',fx:'Zeitungen schreiben: „Studio vergleicht Kunden mit Kaffeetrinkern.“'}]},
 {q:'Planen Sie schon eine Fortsetzung zu {title}?',a:[
  {l:'Wir konzentrieren uns jetzt zu hundert Prozent auf dieses Spiel.',tone:'safe',p:82,s:{hype:1},f:{hype:-1},sx:'Fokussiert und bescheiden. Das passt.',fx:'Zu bescheiden. Das Publikum möchte mehr Ehrgeiz sehen.'},
  {l:'Ideen gibt es viele. Aber erst muss das Spiel zeigen, ob es ankommt.',tone:'honest',p:62,s:{hype:1,moral:1},f:{hype:-1},sx:'Pragmatisch und nahbar. Die Fans freuen sich auf mehr.',fx:'„Wenn es ankommt“ klingt ein bisschen nach Zweifel.'},
  {l:'Teil zwei, drei und vier sind schon skizziert. Es wird eine Reihe.',tone:'bold',p:40,s:{hype:2,wl:4,promise:1},f:{hype:-2,promise:1},sx:'Der Ausblick lässt die Fans jubeln.',fx:'Man wirft euch vor, Teil zwei zu verkaufen, bevor Teil eins fertig ist.'}]},
 {q:'Wie sehr hören Sie bei {title} auf das Feedback der Community?',a:[
  {l:'Wir lesen alles. Nicht alles können wir umsetzen, aber alles wird gehört.',tone:'safe',p:80,s:{hype:1,moral:1},f:{hype:-1},sx:'Das Forum fühlt sich ernst genommen.',fx:'Die Aussage liest sich wie ein Textbaustein.'},
  {l:'Manches ist Gold wert, manches Unsinn. Am Ende entscheiden wir.',tone:'honest',p:60,s:{hype:1,gp:2},f:{hype:-2},sx:'Eine klare Haltung. Respekt von Fans und Team.',fx:'„Unsinn“ wird zitiert, ohne Kontext. Der Thread wächst.'},
  {l:'Die Community entscheidet alles. Wir bauen genau das, was ihr wollt.',tone:'bold',p:42,s:{hype:2,wl:5,promise:1},f:{hype:-1,moral:-1,promise:1},sx:'Frenetischer Jubel. Das Forum stellt schon die Wunschlisten zusammen.',fx:'Jetzt wollen die Leute drei einander widersprechende Dinge zugleich.'}]},
 {q:'Persönliche Frage an {dir}: Wann hatten Sie zuletzt Urlaub oder ein freies Wochenende?',a:[
  {l:'Ich nehme mir regelmäßig Zeit zum Abschalten, danke der Nachfrage.',tone:'safe',p:78,s:{moral:1},f:{moral:-1},sx:'Kein Skandal, kein Drama. Das Team schmunzelt.',fx:'Kurz darauf taucht ein Foto auf: ihr, nachts, im Büro. Die Antwort wirkt weniger glaubwürdig.'},
  {l:'Ehrlich? Vor vier Monaten. Das ist nicht gesund, und ich arbeite daran.',tone:'honest',p:60,s:{moral:1,hype:1},f:{moral:-1,hype:-1},sx:'Sympathisch. Plötzlich bekommt ihr Mails mit Urlaubstipps.',fx:'„Direktor arbeitet sich kaputt“ wird zur Story. Das Team macht sich Sorgen.'},
  {l:'Urlaub ist, wenn ein Bug länger als eine Stunde offen bleibt.',tone:'joke',p:42,s:{hype:1,wl:2},f:{moral:-2,hype:-1},sx:'Das Publikum lacht. Der Spruch wird zum Büro-Mem.',fx:'Das Team sieht in dem Witz eine Anweisung. Niemand lacht.'}]},
 {q:'Ihr Spiel wurde schon als Klon bezeichnet. Wie viel davon ist denn tatsächlich geklaut?',a:[
  {l:'Wir lassen uns inspirieren wie jeder andere. Jedes Spiel baut auf anderen auf.',tone:'safe',p:76,s:{hype:1},f:{hype:-1},sx:'Eine geübte Antwort, die den Moment übersteht.',fx:'Die Antwort wirkt einstudiert und weicht aus.'},
  {l:'Die Grundidee kennt ihr. Aber wir haben eigene Mechaniken, die es sonst nirgends gibt.',tone:'honest',p:58,s:{hype:1,gp:2},f:{hype:-2},sx:'Klar benannt und selbstbewusst. Das überzeugt die Skeptiker.',fx:'„Die Grundidee kennt ihr“ wird zum Beweis der Kritiker.'},
  {l:'Nur 38 Prozent. Dafür sind die anderen 62 Prozent komplett neu erfunden.',tone:'joke',p:36,s:{hype:2,wl:4},f:{hype:-3,moral:-1},sx:'Der Saal tobt. „38 Prozent“ wird zum Running Gag.',fx:'Mit der Zahl wird jetzt jede Besprechung von euch eröffnet. Ironisch gemeint? Man weiß es nicht.'}]},
 {q:'Ist das {genre}-Genre nicht längst totgespielt? Warum noch ein Spiel dieser Art?',a:[
  {l:'Gute Spiele sterben nie aus. Wir geben dem Genre einen frischen Dreh.',tone:'safe',p:80,s:{hype:1},f:{hype:-1},sx:'Selbstbewusst und freundlich. Der Interviewer lächelt.',fx:'Die Antwort wirkt ein wenig schablonenhaft.'},
  {l:'Weil wir selbst Fans sind. Wir bauen das Spiel, das wir gern spielen würden.',tone:'honest',p:62,s:{hype:1,moral:1},f:{hype:-1},sx:'Leidenschaft kommt an. Die Fans fühlen sich verstanden.',fx:'„Wir sind Fans“ klingt in diesem Zusammenhang nach Hobbyprojekt.'},
  {l:'Totgespielt? Wir haben die Leiche gefunden und wiederbelebt. Jetzt tanzt sie.',tone:'bold',p:38,s:{hype:2,wl:4},f:{hype:-2,gp:-1},sx:'Mutig und witzig. Die Szene bekommt ihren eigenen Clip.',fx:'Der Spruch ist stärker als das Spiel. Der Hype fällt in sich zusammen.'}]},
 {q:'Sie bieten {title} im Early Access an. Warum soll ich für ein unfertiges Spiel bezahlen?',cond:s=>s.ea,a:[
  {l:'Weil ihr den Weg mitgestalten könnt. Die Roadmap ist transparent und öffentlich.',tone:'safe',p:78,s:{hype:1},f:{hype:-1},sx:'Das klingt wie ein fairer Deal.',fx:'Man erinnert an andere Projekte, bei denen die Roadmap leer blieb.'},
  {l:'Muss niemand. Wer lieber auf die fertige Version wartet, tut dasselbe zum selben Preis.',tone:'honest',p:62,s:{hype:1,wl:2},f:{hype:-1,wl:-2},sx:'Das ist erfrischend ehrlich. Die Reaktionen sind erstaunlich warm.',fx:'Die Antwort wird als Eingeständnis gelesen, nicht fertig zu sein.'},
  {l:'Weil Early Access der einzige Moment ist, in dem ihr noch alles ändern könnt. Ich meine alles.',tone:'bold',p:40,s:{hype:2,wl:4,promise:1},f:{hype:-2,promise:1},sx:'Fans haben schon Änderungswünsche eingereicht.',fx:'Jetzt will jeder alles ändern. Und jeder besteht auf seinem Versprechen.'}]}
];
