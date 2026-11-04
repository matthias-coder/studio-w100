# Design: Influencer & Journalisten

Datum: 2026-11-04 · Status: Entwurf zur Freigabe

## 1. Warum

Bisher ist Hype eine anonyme Zahl. Er kommt aus Shop-Käufen („Influencer-Kampagne“), aus Ereigniskarten und aus anonymen Interviews. Die Presse besteht aus zwölf erfundenen Magazin-Namen ohne Gesicht.

Mit Influencern und Journalisten bekommt die Öffentlichkeit Gesichter: Parodie-Karten im Stil der Legenden-Karten, mit eigenen, verdeckten Geschmäckern. Das Studio soll lernen, wer was mag, und die Folgen seines Verhaltens spüren, also Finanzchaos, gebrochene Versprechen und Crunch, wenn ein Journalist nachbohrt.

Was der Nutzer festgelegt hat:
- Influencer sind vor allem für Hype zuständig, positiv wie negativ. Weitere Mechaniken kommen später.
- Man kann Influencer für Promo anheuern. Der Preis hängt davon ab, wie viel Bock sie auf das Spiel haben, und das entscheidet ein W100-Wurf.
- Jeder Influencer hat verdeckte Vorlieben und Abneigungen für Genres. Sie verschieben die Chancen und werden nach einer Zusammenarbeit aufgedeckt.
- Begegnungen gibt es als Überraschung und aktiv („beides“).
- Erik Zockrange (Gronkh-Parodie) ist ein Influencer mit eigener Mechanik, keine Legende.
- Journalisten machen Testberichte, Interviews und kritische Recherche. Die Recherche reagiert auf Finanzprobleme, gebrochene Versprechen, Crunch usw.

## 2. Ziele, Nicht-Ziele, Anti-Ziele

**Ziele**
- Influencer anheuern (aktiv) und Überraschungs-Streams (passiv), beide mit Hype-Folgen in beide Richtungen.
- Verdeckte Genre-Vorlieben, die man über mehrere Karrieren hinweg kennenlernt.
- Benannte Journalisten in den Release-Kritiken, als Interviewer und als Rechercheure.
- Eine kritische Recherche, die man durch eigenes Verhalten provoziert und mit einer Entscheidung beeinflusst.

**Nicht-Ziele**
- Influencer oder Journalisten als Game Director oder Lead. Es gibt kein Rekrutieren, auch wenn die Karte unten „RECRUIT“ zeigt.
- Weitere Influencer-Mechaniken (z. B. Sponsoring-Verträge, Shitstorm-Ketten). Die kommen später.
- Neue Bilder. Es werden nur Personen eingebaut, deren Bild existiert.

**Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft)**
- Hype wird zur Pflicht-Kaufschleife: Wer jede Runde Influencer kauft, gewinnt immer.
- Die Recherche trifft ein sauber geführtes Studio. Ohne Auslöser darf sie nie kommen.
- Vorlieben sind sichtbar, bevor man zusammengearbeitet hat. Dann gibt es nichts zu entdecken.
- Echte Namen oder Logos tauchen auf. Es gibt nur Parodie-Namen, wie auf den Karten.

## 3. Bestand, auf dem aufgebaut wird

- Projekt-Hype `S.res.hype` liegt zwischen 0 und 10. Studio-Ruf ist `C.studio.fame`.
- Interviews: `INTERVIEW_OUTLETS` (6 Medien mit `bias` pro Ton), `IV_TONES` (safe/honest/bold/joke), `startInterview`/`answerInterview`/`ivChance` in `js/game.js`. Höchstens zwei pro Projekt.
- Kritiken: `buildMetaReviews(meta)` zieht 7 von 12 `OUTLETS`. Jede Kritik wird so verschoben, dass der Durchschnitt genau `meta` ergibt.
- Shop-Eintrag `{id:'influencer',c:'Marketing',n:'Influencer-Kampagne',cost:6,eff:{hype:1,wl:2}}` in `js/data.js`.
- Zufallsbegegnungen in `afterMonth()`: Legende, dann Game-Dev-Messe (`fairDue`/`startFair`/`fairCard`), dann Interview. Die Messe ist das Vorbild für neue Kartenbegegnungen: eigene `kind`, Karte über `curCard()`, `getOpt`, `curTitle`, `afterResult` → `afterRandom()`.
- Auslöser, die es schon gibt: `openCrisis()`, Rettungsoptionen in `S.rescued` (u. a. `kredit`, `layoff`), `S.layoff`, `S.loan`, `S.promises`, `S.lootbox`, gekündigte Deals (`deal.status==='cancelled'` in `S.fund`), Kürzungen (`cutFeature`). Crunch läuft pro Schritt über `crunchOn(S)`, wird aber nicht gezählt.
- Bilder und Parodie-Namen, plus die Genre-Vorlieben der Influencer: `raw-assets/influencer/PROMPTS.md` (Zuordnungstabelle und je Person „Mag / Mag nicht“). Journalisten-Bilder liegen in `raw-assets/journalist/`.

## 4. Influencer

### 4.1 Daten

Eine Liste `INFLUENCERS` in `js/data.js` mit `id`, `n` (Name auf der Karte), `tag` (Kartentitel auf Deutsch), `img`, `likes`, `dislikes` (Haupt-Genre-Schlüssel aus `GENRES`) und `reach` (1–3).

Spielbar sind nur Einträge mit vorhandenem Bild, analog zu `LEGEND_KEYS`. Fünf Personen haben noch kein Bild: Papaplatine, PewDieBrie, Markimultiplier, Jack Septicsky und Jerma Germ-a. Sie dürfen als Daten vorbereitet sein, erscheinen aber nicht.

Die Vorlieben stammen aus `PROMPTS.md`. Klammerzusätze wie „(Horror)“ oder „(MOBA)“ sind dort Würze, gezählt wird nur das Haupt-Genre *(meine Entscheidung)*. Verglichen wird immer mit `S.genre`, das schon der Haupt-Genre-Schlüssel ist. Sub-Genre (`S.subGenre`) und Genre-Modifikator (`S.gmod`) zählen nicht. Die Klartext-Genres aus `PROMPTS.md` werden so auf `GENRES`-Schlüssel übersetzt:

| PROMPTS.md | Schlüssel |
|---|---|
| Action & Shooter | `action` |
| Action-Adventure | `actadv` |
| Adventure | `adventure` |
| Rollenspiel | `rpg` |
| Strategie | `strategy` |
| Simulation | `sim` |
| Sport & Rennen | `sports` |
| Survival & Sandbox | `survival` |
| Puzzle & Denkspiele | `puzzle` |
| Plattformer | `platformer` |

Die Zuordnung Person → Bild und die Datei-IDs stehen in der Tabelle in `PROMPTS.md`. Max Nerdstah ist `2bd1043d…`, Nano-Schneider ist `c7f7eba8…`.

- Reichweite *(meine Entscheidung)*: 3 haben Erik Zockrange, Montana Blech, Ninjoy, Pokiwave und PewDieBrie; 1 haben die Podcaster (Chris Pizzanth, Max Nerdstah, Nano-Schneider) und Rundenbulle; alle anderen haben 2.
- Fehlende Vorlieben *(meine Entscheidung)*:
  - Max Nerdstah mag Rollenspiel und Action, mag keine Simulation.
  - Nano-Schneider mag Strategie und Adventure, mag kein Survival.
- Erik Zockrange mag Survival & Sandbox und Adventure, mag nicht Sport & Rennen.

### 4.2 „Bock“ auf das Spiel

`infBock(id)` ergibt 0–100 und ist Grundlage für Preis und Wurf:
- 50 als Basis
- +25, wenn das Projekt-Genre zu den Vorlieben gehört
- −30, wenn es zu den Abneigungen gehört
- +2 pro Hype-Punkt
- +1 pro 25 Studio-Ruf
- Ergebnis auf 5–95 begrenzt

*(Alle Zahlen meine Entscheidung, Stellschrauben in einer Konstante `INF`.)*

### 4.3 Anheuern (aktiv)

Das ersetzt den Shop-Eintrag „Influencer-Kampagne“ *(meine Entscheidung; vorgeschlagen, der Nutzer hat nicht widersprochen)*. An dessen Stelle unter „Marketing“ steht „Influencer anfragen“.

1. Der Spieler sieht drei zufällige verfügbare Influencer. Die Auswahl wird pro Phase einmal gezogen und gespeichert, sonst könnte man durch Neuladen neu würfeln.
   - Bekannte Vorlieben stehen auf der Karte, unbekannte als „???“.
   - Jeder Influencer kann pro Projekt nur einmal angefragt werden.
2. Er fragt einen an. Das ist ein W100-Wurf ohne Werte-Bonus: W100 + (Bock − 50) gegen feste Preisstufen *(meine Entscheidung)*. Der Wurf zeigt einen Würfel wie die anderen W100-Würfe, ist aber kein Erfolg/Fehlschlag-Wurf. Er bestimmt nur den Preis.
   - ≥ 90: „Hat richtig Bock“. Kostenlos, volle Wirkung.
   - 60–89: Normalpreis.
   - 30–59: Doppelter Preis.
   - < 30: Absage, keine Kosten.
3. Der Normalpreis ist 4 × `reach` × Klassen-Skalierung `T().scale`. Der Spieler nimmt das Angebot an oder lehnt ab. Ablehnen kostet nichts, die Anfrage ist trotzdem verbraucht.
4. Wirkung bei Annahme: Hype + `reach`, Wishlists + 2 × `reach` (über `apply`).
   - Mag er das Genre nicht, ist das Video lauwarm: halbe Wirkung, abgerundet, und nie weniger als null.
5. Nach Annahme werden die Vorlieben dieses Influencers dauerhaft aufgedeckt (Karriere-Ebene, siehe 6.).

Höchstens zwei angenommene Influencer pro Projekt *(meine Entscheidung, gegen die Kaufschleife)*.

### 4.4 Überraschungs-Stream (passiv)

Eine seltene Kartenbegegnung in `afterMonth()`, nach der Messe und vor dem Interview:
- höchstens einmal pro Projekt
- erst ab dem Schritt `prod_fp`, weil es dann eine spielbare Demo gibt
- 8 % pro Schritt *(meine Entscheidung)*
- Ein Influencer wird zufällig gewählt, Erik Zockrange doppelt gewichtet *(meine Entscheidung)*.

Text: „<Name> hat eure Demo entdeckt und will sie heute Abend live spielen.“ Drei Optionen, wie mit dem Nutzer vereinbart:

| Option | Ablauf | Erfolg | Fehlschlag |
|---|---|---|---|
| **Live dazuschalten** | W100 auf Business. Zusatzbonus (`bonusV`): roher Hype-Wert des Directors `D().s.hype` (0–4, ungeskaliert, wie in `ivChance`) × 4, plus (Bock − 50) / 5. SG 13 *(Werte meine Entscheidung)* | Hype + 2 × `reach`, Wishlists + 3 × `reach` | Verriss: Hype − `reach` − 1 |
| **Nur Key schicken** | Ohne Wurf | Mag das Genre: Hype + `reach`. Neutral: Hype + 1. Mag es nicht: nichts | – |
| **Absagen** | Ohne Wurf | nichts | – |

Bei „Live dazuschalten“ und „Nur Key schicken“ werden die Vorlieben aufgedeckt.

Hype wird nach jedem `apply` schon auf 0–10 begrenzt (`js/game.js`). Die Werte oben sind bewusst spürbar, weil der Stream höchstens einmal pro Projekt kommt. Gegen die Kaufschleife wirken Wurf, Anfrage-Limit und Annahme-Limit beim Anheuern (4.3).

### 4.5 Bilder

Die Karte des Influencers wird wie ein Legenden-Porträt gezeigt (`charPortraitHTML`). Ein eigenes Szenenbild gibt es nicht, das Porträt reicht.

## 5. Journalisten

### 5.1 Daten

Eine Liste `JOURNALISTS` mit `id`, `n`, `tag` (Kartentitel auf Deutsch), `img`, `outlet` (einer der `OUTLETS`-Namen), `f` (Schwerpunkt gp/gfx/snd), `likes`, `dislikes`, `tone` (Lieblings-Interviewton) und `topics` (Recherche-Themen, siehe 5.4).

Die Vorlieben sind *meine Entscheidung*, abgeleitet aus den Kartentiteln. Wie bei den Influencern zählen nur Haupt-Genre-Schlüssel (Tabelle in 4.1): „Sport“ ist `sports`, „Action-Adventure“ `actadv`, „Puzzle“ `puzzle`, „Plattformer“ `platformer`, „Simulation“ `sim`. Alle 11 Bilder liegen in `raw-assets/journalist/`, die Datei-IDs stehen in `PROMPTS.md`.

| Journalist | Titel | Mag | Mag nicht | Ton | Themen |
|---|---|---|---|---|---|
| Heiko Klingenmeister | Strategie-Chefredakteur | Strategie | Sport | honest | – |
| Graf von Pixelheim | 4X-Monarch | Strategie, Simulation | Plattformer | bold | – |
| Moritz von Weber | Mittelalter-Redner | Rollenspiel, Adventure | Sport | joke | versprechen |
| Jochen Hopfengebauer | Tresen-Philosoph | Adventure, Action-Adventure | Puzzle | honest | versprechen |
| André Peschkeller | Branchen-Spürhund | – | – | honest | finanzen, crunch, personal, monetarisierung |
| Christian Zeitschmidt | Chronist | Strategie, Adventure | Survival | safe | – |
| Dom Schotter | Gemütlicher Chronist | Simulation, Puzzle | Action | joke | crunch |
| Sebastian Stangenfeuer | Benchmark-Veteran | Action, Sport | Adventure | safe | – |
| Gunnar Flott | Vintage-Stratege | Strategie, Plattformer | Survival | safe | monetarisierung |
| Fabian Schnäppchenkäufer | Konsolen-Archivar | Plattformer, Action-Adventure | Strategie | joke | – |
| Gregorios RPG-Heven | JRPG-Orakel | Rollenspiel | Sport | bold | versprechen |

Die Moritz-von-Weber-Karte zeigt „109“, wahrscheinlich ein Tippfehler. Das ist egal, weil Kartenwerte nicht ins Spiel übernommen werden.

### 5.2 Testberichte

In `buildMetaReviews` werden 3 der 7 Kritiken durch Journalisten ersetzt *(meine Entscheidung)*. Sie bekommen Name, Porträt-Miniatur und Magazin statt nur Magazin.
- Vorlieben wirken bewusst nach der Durchschnitts-Verschiebung, also nach der Stelle, an der heute der Durchschnitt auf `meta` gesetzt wird: mag das Genre +6, mag es nicht −6. Danach wird wie bisher auf 10–100 begrenzt und der Metascore neu gemittelt. Die alte Regel „Durchschnitt = `meta`“ gilt damit absichtlich nicht mehr genau. Die Abweichung ist gewollt und beträgt höchstens ±3, weil drei Kritiker × 6 / 7 ≈ 2,6 sind *(meine Entscheidung)*. So bleiben die Vorlieben spürbar, ohne die Wertung zu kippen.
- Nach dem Release werden die Vorlieben der drei Kritiker aufgedeckt.
- Die übrigen 4 Kritiken bleiben anonyme Magazine.

### 5.3 Interviews

`startInterview` wählt zusätzlich einen Journalisten als Interviewer. Das Medium bleibt wie bisher.
- In `ivChance` kommt +10 dazu, wenn der Ton der Antwort `tone` des Journalisten trifft.
- Der Lieblingston wird nach dem Interview aufgedeckt.
- Der Interview-Screen zeigt das Porträt und „im Gespräch mit <Name> (<Magazin>)“.

### 5.4 Kritische Recherche

**Auslöser.** Jeder zählt einen Punkt im Risiko-Wert `probeScore()` des laufenden Projekts. Thema in Klammern.
- Notlage geöffnet oder Bankkredit in diesem Projekt (finanzen). Beides wird als dauerhafte Markierung gezählt, auch wenn das Konto später wieder im Plus ist: ein neues Feld `S.crisisSeen`, gesetzt in `openCrisis`, bzw. `S.rescued.includes('kredit')`. Ein zurückgezahlter Kredit löscht den Punkt nicht.
- Ein Geldgeber hat einen Deal gekündigt (finanzen)
- Mindestens 2 offene Versprechen in `S.promises` zum Zeitpunkt der Prüfung (versprechen). Gehaltene Versprechen zählen bewusst nicht mehr.
- Eine Crowdfunding-Funktion wurde gestrichen (versprechen)
- Mindestens 3 Crunch-Schritte (crunch). Dafür braucht es einen neuen Zähler `S.crunchN`. Er steigt genau einmal pro Schritt in `monthEnd()` (`js/game.js`), dort wo `sprintDelta()` angewendet wird, wenn in diesem Moment `crunchOn(S)` gilt. Weder in `afterMonth` noch beim Umschalten des Crunch-Knopfs.
- Stellenabbau (`S.layoff`) (personal)
- Lootboxen (`S.lootbox`) (monetarisierung)

**Auftreten.**
- höchstens einmal pro Projekt
- nicht vor dem 4. Schritt
- in `afterMonth()` nach dem Stream, vor dem Interview
- Chance 5 % × `probeScore()` pro Schritt, maximal 30 % *(meine Entscheidung)*
- Bei Punktzahl 0 nie.

**Wer recherchiert.** Es zählt das Thema mit den meisten Punkten, bei Gleichstand in der Reihenfolge finanzen, versprechen, crunch, personal, monetarisierung. Daraus wird zufällig ein Journalist mit diesem Thema in `topics` gewählt. Finanzen und Personal fallen so immer auf André Peschkeller, Crunch auf ihn oder Dom Schotter, Versprechen auf einen von drei Kritikern. Das ist gewollt: André ist der Spürhund. Findet sich für ein Thema kein Journalist, übernimmt André.

**Karte.** „<Name> recherchiert über euer Studio“. Der Text nennt das Thema, z. B. „… fragt nach eurer Finanzierung“.

| Option | Ablauf | Erfolg | Fehlschlag |
|---|---|---|---|
| **Offen Stellung nehmen** | W100 auf Team, SG 12 + 1 je Risikopunkt über 1 *(meine Entscheidung)* | Entschärft: Hype + 1, Studio-Ruf + 2 | Verschlimmert: Hype − 3, Studio-Ruf − 4 |
| **Kein Kommentar** | Ohne Wurf | Hype − 2, Studio-Ruf − 2 | – |
| **Abwiegeln mit PR-Agentur** | Kostet 6 × `T().scale`. Ein verdeckter Zufall entscheidet: 25 % + 5 % je Risikopunkt, dass es auffliegt | Nichts passiert | Fliegt auf: Hype − 4, Studio-Ruf − 6 |

Studio-Ruf darf nicht unter 0 fallen. Die Werte des Journalisten werden durch die Recherche nicht aufgedeckt.

## 6. Speichern und Aufdecken

- Karriere-Ebene: `C.known={inf:{<id>:true},jour:{<id>:{pref:true,tone:true}}}`. `normalize` in `js/storage.js` legt es für alte Spielstände leer an.
- Projekt-Ebene:
  - `S.inf={offer:{ph,ids},asked:[],hired:[],stream:false}`
  - `S.crunchN`
  - `S.probeSeen`
  - `S.stream` / `S.probe` für die laufende Karte
- Alte Spielstände bekommen leere Werte. Kein Spielstand darf beim Laden abstürzen.
- Ein Spielstand mit gekauftem `influencer` im alten Shop-Eintrag (`S.shop`) bleibt gültig. Der alte Eintrag verschwindet nur aus dem Angebot. Außer dem Eintrag selbst in `js/data.js` verweist kein Code und kein Test auf `'influencer'`.

## 7. Oberfläche

- Neue Screens `stream` und `probe` nach dem Muster `fair`: Porträt plus `optsHTML`. Beide stehen in `ACTIVE`, haben die Klasse `rnd` und einen Weiter-Text.
- Shop „Marketing“: Liste der drei Angebote mit Porträt, Reichweite und bekannten Vorlieben oder „???“, Knopf „Anfragen“, danach Angebot mit Preis und den Knöpfen „Annehmen“ und „Ablehnen“.
- Ein Album-Tab „Presse & Streamer“ neben dem Legenden-Album zeigt alle Karten mit aufgedeckten Vorlieben *(meine Entscheidung)*, sonst „???“.
- Die Kritiken-Liste zeigt bei Journalisten Miniatur-Porträt und Namen.
- Alles muss bei 375 px Breite ohne horizontales Scrollen funktionieren.

## 8. Was dem Builder überlassen ist

- Die genaue Aufteilung auf Dateien. Vorschlag: `js/press.js` für Influencer und Journalisten, registriert in `index.html`, `sw.js` und `tests/harness.js`, Cache-Version anheben.
- Texte der Karten (Deutsch, humorvoll, im Ton der bestehenden Ereignisse), Tag-Übersetzungen der Kartentitel.
- Alle mit *(meine Entscheidung)* markierten Zahlen sind Stellschrauben und gehören in Konstanten `INF` und `PRESS`.
- Reihenfolge der Umsetzung. Sinnvoll sind drei Etappen: Influencer, Journalisten in Kritiken und Interviews, Recherche.

## 9. Was getestet werden muss

- Bock-Formel: Vorliebe, Abneigung und Hype verschieben den Wert, Grenzen 5–95.
- Preisstufen aus Wurf + Bock, Absage kostet nichts, maximal zwei Annahmen, jede Person nur einmal pro Projekt.
- Aufdecken: nach Annahme oder Stream sichtbar, vorher nie.
- Stream: nicht vor `prod_fp`, höchstens einmal, alle drei Optionen mit den Werten aus 4.4.
- Kritiken: genau 3 Journalisten unter 7 Kritiken, Metascore weicht höchstens ±3 von `meta` ab.
- Interview: Tontreffer gibt +10.
- Recherche: Punktzahl 0 löst nie aus, jede Auslöserart zählt, Themenwahl wählt passenden Journalisten, alle drei Optionen, Ruf nie unter 0.
- Alte Spielstände ohne die neuen Felder laden und laufen weiter.
