# Design: Erlebbare Entwicklungsphasen

Datum: 2026-11-04 · Status: Entwurf zur Freigabe

## 1. Warum

Das Spielgefühl stimmt noch nicht: Alle Phasen spielen sich gleich (eine Ereigniskarte pro Monat, drei Optionen, ein W100-Wurf). Ob man gerade im Konzept oder in Beta & QA steckt, merkt man kaum. Ziel ist, dass sich jede Phase der echten Spieleentwicklung anders anfühlt und eigene, passende Aktivitäten hat. Dazu kommt Druck von außen durch Geldgeber und Meilensteine, eine realistischere Entwicklungsdauer und ein Geschäftsmodell, das über den Release hinaus wirkt.

Vorbild ist der reale Ablauf: Konzept → Pitch & Finanzierung → Pre-Production → Production → Polish/QA/Release → Post-Launch.

## 2. Ziele, Nicht-Ziele, Anti-Ziele

**Ziele**
- Jede Phase hat eine eigene Aktivität, die man nur dort macht.
- Zwei Sorten Entscheidungen: **wenige große** (prägen das Spiel: Genre, Engine, Multiplayer, Plattform …) und **viele kleine** (Details; das sind die bisherigen Ereigniskarten).
- **Meilensteine** mit Sollwerten (Gameplay, Grafik, Sound, Bugs, Features), deren Verfehlen echte Folgen hat: Geldentzug, Feature-Streichung, Vertragskündigung.
- **Geldgeber mit eigenem Charakter** (Publisher, Investoren, Förderung, Crowdfunding).
- **Realistische Dauer:** Triple-A dauert 5–7 Jahre, Indie deutlich kürzer.
- **Live Service** als Geschäftsmodell, **Abo** als Feature; beide laufen nach Release als Live-Betrieb weiter.
- **Prototyp-Labor:** Das nächste Spiel kann parallel vorbereitet werden und startet dann mit besseren Werten.

**Nicht-Ziele**
- Mehrere Spiele gleichzeitig in voller Production (zu aufwendig).
- Echte Kalendermonate als Runden.

**Anti-Ziele** (wäre ein Fehlschlag, selbst wenn es technisch funktioniert)
- Ein Projekt dauert in echter Spielzeit deutlich länger als **5–10 Minuten**.
- Tabellenpflege: Pro Runde viele Regler schieben müssen. Der Sprint muss mit einem Klick erledigt sein; Feintuning ist optional.
- Große Entscheidungen, die sich wie normale Ereigniskarten anfühlen.

## 3. Rundenmodell und Entwicklungsdauer

**Entschieden:**
- Eine Runde ist **kein Monat**, sondern ein **Schritt einer Phase** (z. B. Planung → Umsetzung → Abschluss).
- Ein Schritt umfasst je nach Projektgröße und gewählter Dauer mehrere Kalendermonate.
- Die Dauer ist realistisch: große Projekte 5–7 Jahre.

**Meine Vorschläge (Claudes Wahl, korrigierbar):**
- Dauer-Rahmen je Produktionsklasse, im Setup frei wählbar innerhalb des Rahmens: Indie 1–2 Jahre, Double-A 2–4 Jahre, Triple-A 5–7 Jahre. Damit ist der Roadmap-Punkt „Wählbare Entwicklungsdauer“ mit erledigt.
- Die Rundenzahl ist für alle Größen etwa gleich (ca. 14–16), damit die 5–10 Minuten halten.
- Die Kalenderzeit wirkt über die **Monate pro Schritt**:
  - Mehr Monate bringen mehr Sprint-Punkte, also mehr erreichbare Qualität.
  - Kosten pro Runde sind Monatskosten × Monate des Schritts.
  - Live-Betrieb und Prototyp-Labor laufen entsprechend mit.
  - Mehr Monate bringen auch mehr Marktrisiko (Trendwechsel) und lassen die Engine stärker altern.
- Im Studio läuft ein Kalender (Jahr/Monat). Er treibt GOTY-Jahre, Engine-Alterung, Trends und Live-Betrieb.
- Die Ressource `zeit` (heute 14 Monate Puffer) wird zu einem Zeitpuffer in Monaten bezogen auf die geplante Dauer. Verzögerungen kosten Monate, nicht ganze Runden.

**Phasenstruktur (Vorschlag):**

| Phase | Schritte (= Runden) | Große Entscheidung | Meilenstein |
|---|---|---|---|
| Konzept | Ideen-Mixer → Konzept festlegen | Genre/Sub-Genre, Zielgruppe | – |
| Pitch & Finanzierung | Pitch-Termine → Finanzierungsmix | Welche Geldgeber | – |
| Pre-Production | Engine & Pipeline → Prototyp-Schleife → Vertical Slice | Engine, Multiplayer-Umfang | **Vertical Slice** |
| Production | Planung → Umsetzung I → Umsetzung II → Umsetzung III | Plattformen, Feature-Umfang | **First Playable**, **Alpha**, **Beta** |
| Polish, QA & Release | Bug-Jagd → Zertifizierung & Release | Pünktlich releasen oder verschieben | **Gold Master** |
| Post-Launch | Day-One-Patch, danach Übergang in den Live-Betrieb | Live-Betrieb weiterführen? | – |

Das ergibt rund 15 Runden pro Projekt. Die heutigen Pflichtkarten (`MAND_AT`: engine, world, cast, license, platform, lang, age, price, china) werden diesen Schritten zugeordnet. Die wirklich prägenden werden zu großen Entscheidungen, der Rest bleibt Pflichtkarte im passenden Schritt. Die heutigen Ereigniskarten mit `p:0–5` werden auf die neuen Phasen umgemappt.

**Setup-Assistent:** Genre, Multiplayer und weitere große Entscheidungen wandern vom Assistenten in die passende Phase. Im Assistenten bleiben nur Studio/Director, Produktionsklasse, Dauer, Marke (IP) und Geschäftsmodell. Was davon genau im Assistenten bleibt, entscheidet der Builder; Leitlinie: Alles, was in der echten Entwicklung erst später entschieden wird, kommt in die Phase.

## 4. Was in jeder Runde passiert

Jede Runde hat drei Ebenen:

1. **Sprint (das Tun).** Das Team hat Kapazität in Punkten (aus Teamgröße und Leads, × Monate des Schritts). Sie wird auf Baustellen verteilt: Gameplay, Grafik, Sound, Content/Features, Bugfixing, Marketing.
   - Bedienung mit einem Klick: Fokus-Vorschläge wie „Ausgewogen“, „Meilenstein-Ziel“ oder „Bugs jagen“. Standard ist „wie letzte Runde“. Feintuning ist optional.
   - **Crunch:** mehr Punkte, dafür weniger Moral und mehr Bugs.
   - Live-Betrieb und Prototyp-Labor ziehen vorher ihren Anteil an Kapazität ab, sichtbar angezeigt.
2. **Kleine Entscheidung:** eine Ereigniskarte aus dem Pool der aktuellen Phase, wie heute. Nicht jede Runde muss eine haben, falls der Pool zu dünn ist.
3. **Große Entscheidung oder Meilenstein,** nur in den dafür vorgesehenen Schritten (Tabelle oben). Große Entscheidungen bekommen eine eigene, auffällige Darstellung und wirken auf viele spätere Karten und Werte. Wer sie später ändern will, braucht einen teuren **Pivot** (Zeit, Geld, Moral).

Bestehende Aktionen (Shop, Personal, Auftragsarbeiten, Engine-Labor, Interviews) bleiben. Wo sie heute an Monate gebunden sind, hängen sie künftig an Schritte. Beispiele: „Neue Leads nur im ersten Monat“ wird zu „nur in Planungsschritten“, „Early Access ab Monat 8“ wird zu „ab Alpha“, „Serverkosten ab Runde 8“ wird zu „ab Beta“. Eine Auftragsarbeit verbraucht die Sprint-Kapazität einer Runde.

## 5. Phasen-Aktivitäten

- **Konzept – Ideen-Mixer:** Man zieht Ideenkarten (Hook, Setting, Twist) und kombiniert sie zu einem **Alleinstellungsmerkmal (USP)**. Das gibt Start-Hype und einen Kritikerbonus beim Release, wenn das Spiel den USP einlöst (z. B. Mindestwert im passenden Qualitätswert oder das zugehörige Feature ist nicht gestrichen). Wird er nicht eingelöst, wirkt er wie ein gebrochenes Versprechen. Hier fallen auch Genre/Sub-Genre und Zielgruppe.
- **Pitch & Finanzierung – Pitch-Termine:** Man wählt Geldgeber und würfelt den Pitch. Konzeptqualität, USP, Ruf und ein vorhandener Prototyp aus dem Labor senken den SG. Ergebnis ist der **Finanzierungsmix** (siehe 6).
- **Pre-Production – Prototyp-Schleife (Push your Luck):** Jede Iteration ist ein W100-Wurf. Ein Erfolg bringt „Fun gefunden“-Stufen, die als Multiplikator auf späteren Gameplay-Fortschritt wirken. Ein Patzer kostet Zeit. Man hört auf, wann man will. Hier fallen Engine und Multiplayer-Umfang. Abschluss ist der Meilenstein **Vertical Slice**.
- **Production – Sprints und Feature-Liste:** Das Spiel hat eine **Feature-Liste**, gespeist aus Genre/Sub-Genre, den Extras und den großen Entscheidungen. Jedes Feature kostet Sprint-Punkte und trägt zu Gameplay, Grafik, Sound oder Content bei. Features lassen sich bauen, verschieben oder **streichen**. Ereigniskarten können **Feature Creep** auslösen. Marketing (Trailer, Store-Seite/Wishlists, Messe) läuft als Sprint-Baustelle parallel. Hier fällt die Plattform-Entscheidung. Meilensteine: **First Playable, Alpha, Beta**.
- **Polish, QA & Release – Bug-Jagd:** Bugs werden als Liste mit Schweregrad dargestellt und mit QA-Punkten abgearbeitet. Dazu kommen Zertifizierung pro Plattform, Altersfreigabe (USK) und Lokalisierung. Große Entscheidung: **pünktlich releasen oder verschieben**, also mehr Polish gegen Kosten und Geldgeberdruck. Abschluss ist der **Gold Master**.
- **Post-Launch:** Day-One-Patch und Hotfixes als kurzer Schritt. Danach geht das Spiel in den Live-Betrieb über, falls es Live Service oder Abo hat (siehe 7).

Wie stark die einzelnen Aktivitäten belohnen und bestrafen (Zahlen, SGs), entscheidet der Builder. Leitlinie: Jede Aktivität ist in wenigen Klicks erledigt.

## 6. Geldgeber und Meilensteine

**Entschieden:**
- **Publisher, Investoren und Förderung** knüpfen ihr Geld an Meilensteine. Werden diese verfehlt, kürzen oder streichen sie Raten, erzwingen Feature-Streichungen oder kündigen.
- **Crowdfunding-Backer** können nichts zurückziehen. Nur bei einem **extrem unwahrscheinlichen** Patzer droht eine **Klage**.
- Meilensteine prüfen Gameplay, Grafik und Sound, dazu Bugs und Features.

**Meine Vorschläge (Claudes Wahl):**
- Mehrere Geldgeber gleichzeitig sind möglich. Jeder hat eigene Sollwerte an den Meilensteinen und zahlt in Raten pro Meilenstein.
- Charakter der Geldgeber:
  - **Publisher:** viel Geld, Recoup vom Umsatz, harte Sollwerte, kann Features streichen lassen und bei Kündigung Vorschuss zurückfordern. Das bestehende Publisher-System wird darin aufgelöst.
  - **Investoren:** Geld gegen Gewinnbeteiligung. Sie achten neben Qualität auch auf Hype und Wishlists.
  - **Förderung:** wenig Geld, nicht rückzahlbar, verlangt aber Nachweise zu festen Meilensteinen. Wer sie verfehlt, muss teilweise zurückzahlen.
  - **Crowdfunding:** Die Höhe hängt von Pitch und Hype ab. Dafür versprochene Features (Stretch Goals) wirken wie Versprechen auf die Nutzerwertung. Klage nur bei einem kritischen Patzer in einer seltenen Konstellation, z. B. versprochenes Kernfeature gestrichen **und** zusätzlich kritischer Fehlwurf, Größenordnung ≤ 1 % pro Projekt.
  - **Eigenkapital** aus der Studiokasse bleibt ohne Auflagen.
- Meilenstein-Ausgang: **erreicht** gibt die volle Rate plus etwas Moral. **Knapp verfehlt** ermöglicht Nachverhandeln per W100-Wurf. **Klar verfehlt** heißt je nach Geldgeber: Rate kürzen, Feature streichen (Spieler wählt welches) oder Kündigung.
- Die Sollwerte skalieren mit Produktionsklasse und Meilenstein. Sie sind vor jedem Meilenstein sichtbar (Ist gegen Soll), damit der Sprint gezielt darauf hinarbeiten kann.

## 7. Geschäftsmodelle, Live-Betrieb und Prototyp-Labor

**Entschieden:**
- Das **Abo-Modell** ist kein Geschäftsmodell mehr, sondern ein **Feature**.
- Neues Geschäftsmodell **Live Service**.
- Abo und Live Service **binden auch nach dem Release Ressourcen** und liefern dafür **laufende Einnahmen**.
- **Keine parallelen Spiele**, aber eine **parallel laufende Pre-Production** (Prototyp-Labor), deren Ergebnis später als Basis eines echten Projekts dient und dessen Startwerte verbessert.

**Meine Vorschläge (Claudes Wahl):**
- Geschäftsmodelle: *Kaufspiel*, *Free-to-Play*, *Live Service*. Der Genre-Modifikator `live` entfällt. Seine Wirkung geht im Geschäftsmodell auf, und die Genre-Synergien (`fit:'abo'` usw.) werden angepasst.
- **Premium-Abo** ist ein neues Extra und kombinierbar mit Kaufspiel und Live Service. Es bringt eine monatliche Gebühr und verlangt laufend Content.
- **Live-Betrieb** ist ein neuer Studio-Bereich für Spiele mit Live Service oder Abo nach dem Release:
  - Die Spielerbasis startet mit Verkäufen und Wertung und schrumpft danach pro Monat.
  - Es gibt monatliche Einnahmen aus der Spielerbasis und laufende Serverkosten.
  - Der Betrieb bindet einen festen Anteil Team-Kapazität. Im laufenden Projekt fehlen diese Sprint-Punkte.
  - Alle paar Monate steht eine **Season** bzw. ein Content-Update zur Wahl. Sie kostet Kapazität und Geld und holt Spieler zurück. Wird sie ausgelassen, wandern die Spieler schneller ab.
  - **End of Service** ist jederzeit möglich. Das kostet etwas Ruf und macht die Kapazität frei.
  - Mehrere Live-Spiele gleichzeitig sind erlaubt, die Belastung summiert sich.
- **Prototyp-Labor** ist ein neuer Studio-Bereich mit genau einem Platz:
  - Während ein Projekt in Production oder später ist, kann ein Teil der Kapazität Konzept und Prototyp des nächsten Spiels vorbereiten.
  - Ein Prototyp sammelt Fortschritt (USP, „Fun gefunden“, Genre festgelegt).
  - Ein Projekt, das auf einem Prototyp startet, verkürzt oder überspringt Konzept und Pre-Production, startet mit Bonus auf die Grundwerte und bekommt einen Pitch-Bonus.
  - Ein Prototyp kann liegen bleiben, verliert dann aber langsam an Wert.

## 8. Plattformen

- Die Plattformwahl wird eine große Entscheidung in der Production. Plattformen werden **einzeln angekreuzt**, statt wie heute vier Pakete zu wählen. Jede hat eigene Portierungskosten, Reichweite, Zielgruppen-Passung und Zertifizierung. Exklusiv-Deals bleiben als Option.
- Bestehende Parodien bleiben: *PlayStatus*, *Xbonk*, *Nintendu Swotch*.
- **Neu:** eine Parodie Richtung **XCUBE** und eine weitere witzige Switch-Variante. Namensvorschläge (Claudes Wahl, korrigierbar): **„Kjubox X“** (würfelförmige Retro-Konsole) und **„Nintendu Snitch“** (Hybrid-Handheld). Ob sie zusätzliche Plattformen sind oder Generationen bestehender, entscheidet der Builder.

## 9. Randbedingungen

- Vanilla JS ohne Build-Schritt, PWA mit `sw.js`. Daten liegen in `js/data.js`, `js/events.js` und `js/content-extra.js`, Logik in `js/game.js`, Oberfläche in `js/ui.js`, Speicherstände in `js/storage.js`.
- Bedienbar auf Desktop, Tablet und Smartphone, wie bisher.
- Texte im Spiel auf Deutsch, Code und Commits auf Englisch.
- **Karrieren dürfen nicht verloren gehen.** Bestehende Speicherstände (Karriere `C`) müssen geladen werden können. Für ein laufendes altes Projekt (`S`) entscheidet der Builder, ob es best-effort umgemappt oder mit einer Meldung neu gestartet wird. Karriere, Studio, Kasse und Legenden bleiben in jedem Fall erhalten.
- Die 12-Monats-Annahme steckt an vielen Stellen, u. a. `S.round>=8`, `S.round<12`, `S.round>=12`, `targetMonth` in `ensureMilestone`, `MAND_AT`, Phase per `Math.floor(S.round/2)`, „Monat x/12“ in der Oberfläche und `zeit:14`. Diese Stellen werden alle auf das neue Schrittmodell umgestellt.
- Die Anzahl der Ereigniskarten pro Phase ist heute ungleich (Konzept 7, Prototyp 13, Produktion 36, Marketing 27, Beta & QA 15, Gold 11). Neue Phasen wie Pitch & Finanzierung brauchen eigene Karten.

## 10. Empfohlene Bau-Reihenfolge

Das ist ein großes Vorhaben. Es wird zusammen entworfen und in spielbaren Etappen gebaut:

1. **Gerüst:** Schrittmodell, neue Phasen, Dauer-Wahl, Kalender, Umbau aller 12-Monats-Stellen, Umzug der Pflichtkarten und Ereigniskarten. Speicherstand-Migration.
2. **Sprint und Meilensteine:** Kapazität, Baustellen, Crunch, Meilensteine mit Ist gegen Soll.
3. **Geldgeber:** Pitch-Phase, Finanzierungsmix, Folgen verfehlter Meilensteine, Feature-Streichung.
4. **Phasen-Aktivitäten:** Ideen-Mixer/USP, Prototyp-Schleife, Feature-Liste und Feature Creep, Bug-Jagd, Release-Verschiebung.
5. **Geschäftsmodelle und Live-Betrieb:** Live Service, Premium-Abo-Extra, Seasons, End of Service.
6. **Prototyp-Labor.**
7. **Plattformen und Content:** Einzelauswahl, neue Parodie-Namen, neue Ereigniskarten (v. a. Pitch und Pre-Production).

## 11. Dem Builder überlassen

- Alle Zahlen: Kapazitätsformel, SGs, Sollwerte, Raten, Abwanderung, Season-Wirkung, Prototyp-Bonus.
- Genaue Oberfläche der Sprint-Ansicht, großer Entscheidungen und der Meilenstein-Prüfung, solange die Ein-Klick-Regel hält.
- Wie viele Ideenkarten, Feature-Typen und Bug-Schweregrade es gibt.
- Umgang mit laufenden alten Projekten im Speicherstand (siehe 9).
- Wie die README angepasst wird.

## 12. Klärungen nach dem Review (Claudes Wahl, korrigierbar)

- **Alte Speicherstände:** Ein laufendes altes Projekt wird beim Laden mit einer Meldung abgebrochen. Sein Restbudget geht zurück in die Studiokasse. Karriere, Studio, Legenden und Engine bleiben erhalten. Das `S`-Schema darf in Etappe 1 frei umgebaut werden. Ein gespeicherter Genre-Modifikator `live` wird beim Laden verworfen.
- **5–10 Minuten** sind das Ziel für einen geübten Spieler. Werden sie überschritten, darf der Builder Schritte zusammenlegen (z. B. Konzept und Pitch in je einer Runde) oder kleine Karten seltener ziehen. Die Phasenreihenfolge bleibt dabei erhalten.
- **Pitch bei Eigenfinanzierung:** Die Phase bleibt Pflicht. „Nur Eigenkapital“ ist eine Ein-Klick-Option im Pitch-Schritt, und die Phase zählt dann als eine Runde. Die Phasenlogik muss von Anfang an Schritte überspringen oder verkürzen können.
- **Start aus dem Prototyp-Labor:** Konzept entfällt komplett, weil Genre und USP schon feststehen. Die Pre-Production schrumpft auf den Schritt Vertical Slice. Pitch & Finanzierung bleibt.
- **Geldgeber springt ab:** Das Projekt stirbt nicht direkt. Fehlt Geld, greift das bestehende Krisensystem (`openCrisis`: Notfinanzierung, Privateinlage …), und erst danach droht wie heute die Pleite.
- **Bezug der Meilenstein-Sollwerte:** Die Basis richtet sich nach der Produktionsklasse. Ein ambitionierter Pitch (höhere Versprechen, mehr Geld) hebt die Sollwerte an.
- **Genre erst im Konzept:** Das Projekt wird mit neutralen Platzhaltern angelegt. Alle genreabhängigen Startwerte (Synergien, Gewichtung, Start-Hype) werden in dem Konzept-Schritt berechnet, in dem das Genre gewählt wird.
- **Balancing** der umgebauten Geschäftsmodelle und Genre-`fit`-Tags gehört zu Etappe 5. Legenden und Freischaltungen hängen nach aktuellem Stand nicht am Abo-Modell; das prüft der Builder.
