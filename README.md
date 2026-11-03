# 🎲 Studio W100 — Das Spielestudio-Aufbauspiel (Tablet & Desktop Command Center Edition)

Ein rundenbasiertes Tabletop- & Browser-Aufbauspiel rund um die Leitung eines eigenen Spielestudios — komplett auf Deutsch, mit **W100-Würfelsystem (1–100)**, **Gameplay/Grafik-Splitting**, **alternder & lizenzierbarer Eigenbau-Engine mit interaktivem Tech-Tree**, **aufsteigendem Lead-Personal**, **Branchen-Rivalen & Game of the Year (GOTY) Awards** sowie einem **loginlosen Multi-User-Speichersystem** für **GitHub Pages**.

---

## 🖥️ UI/UX Design-Überarbeitung (Tablet & Desktop Command Center)

- **3-Spalten-Widescreen-Cockpit (Desktop ab `1260px`)**:
  - **Links (`#sheet`)**: Projekt-Identität, visueller **Gameplay/Grafik-Split-Balken**, die 4 W100-Studiowerte, Inspiration, aktiver **Publisher-Meilenstein**, **Markt-Trend-Radar** und Game Director.
  - **Mitte (`#wsNav` + `#main`)**: Umschaltbarer Arbeitsbereich zwischen `🃏 Spieltisch (Monatskarte)`, `🛒 Shop, Leads & Aufträge`, `⚙️ Engine-Labor (Tech-Tree)` und `🏆 Liga & Rivalen`.
  - **Rechts (`#dock`)**: Kompaktes Management-Dock mit 3 Schnell-Reitern (`💰 Budget`, `👥 Leads & Engine`, `🎲 Live-Würfelprotokoll`), sodass alle monatlichen Regler und Personal-Aktionen ohne vertikales Scrollen erreichbar sind.
- **Touch-optimiertes 2-Spalten-Layout (Tablet `860px–1259px` & Mobile)**:
  - Große, fehlertolerante Touch-Targets (`38px–44px` Mindesthöhe) für alle Segmente, Buttons und Auswahlkarten.
  - **Sticky HUD (`.hud-wrap`)** mit integrierten Fortschrittsbalken für Moral, Hype, Qualität, Bugs und Projektzeit.
  - **Hell-/Dunkel-Modus (`🌓 Design`)**: Umschaltbar zwischen klassischem *Tabletop-Papierbogen* und kontrastreichem *Studio-Nachtschicht-Modus*.

---

## ✨ Spielmechaniken & Features

### 1. 🎯 W100-Regelsystem (1–100) mit exakter Erfolgschance
- **Prozentgenaue Würfe:** Jeder Punkt eines Director-Werts, Genres oder Lead-Mitarbeiters bringt spürbare Boni (`+4` bis `+15` auf den W100).
- **Transparente Chancen:** Jede Entscheidungsoption zeigt vor dem Klick den Schwierigkeitsgrad (**SG**) und die exakte prozentuale Erfolgschance (`z. B. SG 60 · 72 %`) — inklusive **Inspiration** (`2× W100` mit Vorteil).
- **Kritische Würfe:** `96–100` ist ein kritischer Erfolg (+Gameplay, +Grafik, +Moral, +1 Inspiration & Bonus-XP für Leads); `1–5` ist ein kritischer Patzer.

### 2. 🎨 Aufspaltung in Gameplay & Grafik
- Statt eines einzelnen Qualitätswerts sammelt jedes Projekt separat **Gameplay (`gp`)** und **Grafik (`gfx`)**.
- **Genre- & Klassen-Gewichtung:** Ein *Point-and-Click* oder *Aufbauspiel* gewichtet Gameplay deutlich stärker, während *Action-Abenteuer* oder *Triple-A*-Blockbuster hohe Grafik-Werte verlangen.

### 3. ⚙️ Eigene Studio-Engine: Interaktiver Tech-Tree, Alterung & Lizenzierung
- **Permanenter Eigenbau:** Einmal in Monat 2 entwickelt, bleibt eure Studio-Engine über die gesamte Karriere erhalten.
- **Interaktives Engine-Forschungslabor (`⚙️ Engine-Labor`):**
  - Verdient **Forschungspunkte (`🔬`)** durch den Bau eurer Engine, Generations-Upgrades, Top-Wertungen oder bezahlte F&E-Sprints.
  - Schaltet **8 Spezial-Module** in 3 Technologie-Zweigen frei:
    - *Grafik & Präsentation*: **3D-PBR-Pipeline** → **Echtzeit-Raytracing & GI**, **Prozedurales Sound-System**
    - *Gameplay & Welt*: **Visueller Node-Editor** → **Dynamische KI- & Physik-Sandbox**, **Gameplay-Framework**
    - *Netzwerk & Pipeline*: **Rollback-Netcode**, **Multi-Plattform-Compiler & Auto-QA**
- **Engine-Alterung (Obsoleszenz):** Ohne ein **Generations-Upgrade (`v2.0`, `v3.0` …)** veraltet eure Engine über mehrere Projekte (*Next-Gen → Aktuell → Angestaubt → Veraltet → Fossil*) und zieht Grafik, Gameplay, Hype und Kritikerwertungen herunter.
- **Externe Lizenzierung:** Vermietet eure Engine per **Seat-Lizenz** (feste Monatseinnahmen), **5 %-Umsatzbeteiligung (Royalties)** oder als **Open-Source-Community-Edition**.

### 4. 🏆 Branchen-Rivalen, Markt-Trends & Game of the Year (GOTY) Awards
- **Dynamische Markt-Trends:** Jede Saison gibt es ein **🔥 Boom-Genre** (`+25 % Verkäufe, +1 Hype`) und ein **❄️ übersättigtes Genre** (`−15 % Verkäufe`).
- **5 KI-Konkurrenzstudios + Ex-Lead-Rivalen:** Messt euch mit Studios wie *Nordlicht Interactive* oder *PixelSchmiede Berlin*. Werden unzufriedene Leads eures Studios abgeworben, gründen sie ihr eigenes Konkurrenz-Studio!
- **Jährliche GOTY-Verleihung:** Beim Release tretet ihr in den Kategorien **🏆 Spiel des Jahres (GOTY)**, **🎮 Bestes Game Design** und **🎨 Beste Grafik & Technik** gegen die Releases der Konkurrenz an.

### 5. 💼 Auftragsarbeiten & Publisher-Meilensteine
- **Auftragsarbeiten (`CONTRACTS`):** Im Shop könnt ihr pro Monat bis zu einen bezahlten Fremdauftrag (*Konsolen-Portierung*, *QA-Stresstest*, *Shader-Optimierung*, *Orchester-Abmischung*, *Prototyp-Coaching*) per W100-Wurf absolvieren, um sofort frisches Geld in die Kasse zu spülen.
- **Publisher-Meilensteine:** Erreicht ihr bis Monat 4, 8 oder 12 das vereinbarte Gameplay-/Grafik-Ziel, zahlt der Publisher eine satte **Meilenstein-Prämie** (+Moral).

### 6. 👥 Lebendiges Lead-Personal & Dynamische Kosten-Drains
- **6 Spezialisten-Rollen mit eigenen Namen, XP & Stufen (1–5):** *Senior Engine Architect*, *Art Director*, *Audio Director*, *Head of QA*, *Community Managerin* und *Executive Producer*.
- **Loyalität & Abwerbungsrisiko:** Bei niedriger Loyalität droht Abwerbung — haltet euer Kernteam mit Sonderboni oder Gehaltserhöhungen.
- **Laufende Kosten-Drains:** Steigende Gehaltsinflation (`salaryDrift`), wachsender Büro-Overhead (`overheadDrift`), monatliche Engine-Wartung und progressive Gewinnsteuern verhindern einen Selbstläufer-Snowball.

### 7. 💾 Loginloses Multi-User-Speichersystem & Chronik-Export
- Mehrere Spieler-Profile im Browser (`👤 Spieler`), teilbare **`W100-...`-Speichercodes**, Direkt-Links (`#save=...`), `.json`-Backups und ein **Markdown-Chronik-Generator (`📜 Export`)**.

---

## 🚀 Starten & auf GitHub Pages veröffentlichen

1. Öffne [`index.html`](index.html) direkt im Browser oder über einen lokalen Webserver.
2. Für **GitHub Pages**: Lade den Projektordner (`index.html`, `css/`, `js/`) in ein GitHub-Repository hoch und aktiviere unter **Settings → Pages** den Branch `main`.
