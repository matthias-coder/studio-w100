# Etappe 4b: Feature-Liste, Feature Creep, Bug-Jagd & Release-Verschiebung – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Production gets a feature list: at „Produktionsplanung“ the player plans the game's features (genre features, extras, the USP feature, optional extras) on one big-decision screen. A new sprint area „Features“ builds them in list order; each finished feature adds quality to its area. Features can be moved up or cut; Alpha checks the core features, Beta all planned features; unfinished or cut features cost review points at release. During production a Feature-Creep card can sneak in a new feature. In „Bug-Jagd“ the bugs become a list with severity (Showstopper / Schwer / Leicht) and the player spends three QA rolls on chosen rows; certification fails on too many showstoppers. At „Zertifizierung & Release“ the player decides once: release on time or delay for polish at a cost.

**Architecture:** New module `js/features.js` (after `js/activities.js`) holds feature catalog, plan, build progress, creep card, bug list, QA rolls and the delay decision. `js/sprint.js` gains the area `feat` (its points feed the feature pool instead of a quality value). `js/milestones.js` adds a feature row to Alpha and Beta and a feature need to the „Meilenstein-Ziel“ focus. `cutOptions()`/`cutFeature()` in `js/funding.js` switch to the feature list once it exists. `goMonth()` routes to the new screens `'features'`, `'hunt'`, `'ship'` before the step's event card; `afterMonth()` can open the `'creep'` card like the stream card.

**Tech Stack:** Vanilla JS (browser globals, no build), Node 24 `node:test` + `vm` (`tests/harness.js`), preview config `game` in `.claude/launch.json`.

**Spec:** `docs/superpowers/specs/2026-11-04-phasen-erlebnis-design.md` (sections 4, 5 „Production“ and „Polish, QA & Release“, 6 „Meilensteine prüfen … Bugs und Features“, 10.4, 11)

**Scope (stage 4b only):** feature catalog and plan screen, sprint area Features, build/move/cut, milestone feature rows, funder cuts on features, release effects, Feature-Creep card, bug list with severity and QA rolls, showstopper certification, release delay, save migration, docs. **Not in scope:** pivot for big decisions, single platform selection and per-platform certification (stage 7), live ops / subscription extra (stage 5), multiplayer scope as a big decision.

## Global Constraints

- In-game text German, code/identifiers/commits English.
- No build step, no npm dependencies. Tests: `node --test` from the repo root (not `node --test tests/` on Node 24).
- „Tabellenpflege: Pro Runde viele Regler schieben müssen“ is an anti-goal; „Der Sprint muss mit einem Klick erledigt sein; Feintuning ist optional.“ Feature building happens through the sprint focus presets; the plan screen works with one click on the default plan; move/cut are optional.
- „Leitlinie: Jede Aktivität ist in wenigen Klicks erledigt.“ Bug-Jagd: at most 3–4 rolls; release decision: one click.
- „Große Entscheidungen bekommen eine eigene, auffällige Darstellung“ – plan screen and release decision use the `.big-decision` style from stage 4a.
- „Meilensteine prüfen Gameplay, Grafik und Sound, dazu Bugs und Features.“
- Careers must survive: running saves without a feature list keep the old behaviour (no feature rows, extras-based cuts, old certification rule). `S.v` stays `2`.
- New JS file goes into `index.html` (after `js/activities.js`), the `sw.js` precache list (cache `w100-v9` → `w100-v10`) and `FILES` in `tests/harness.js` (after `js/activities.js`).
- Desktop, tablet and phone (375 px) without horizontal scrolling.

## Numbers and copy (builder's choice, spec §11; all in `js/features.js`)

```js
const FEAT={coreCost:5,optCost:3,coreVal:3,optVal:2,missRev:3,coreCutRev:2,creepChance:.3,creepMax:1,creepCost:3,creepVal:2,creepHype:1,creepDc:12};
const HUNT={runs:3,w:{crit:5,major:2,minor:1},dc:{crit:14,major:10,minor:6},certCrit:2,certHiCrit:4,certPen:8,certPenHi:15};
const SHIP={share:.1,minMonths:2,bugPerW:4,qualPerW:1.5,hype:-1,funderMoral:-1};
```

Feature object: `{id,n,ic,a,cost,val,core,src,ex?,done:false,prog:0}` (`a` = `'gp'|'gfx'|'snd'`, `src` = `'genre'|'extra'|'usp'|'opt'|'creep'`, `ex` = extra id for extra features). Core cost/val = `coreCost`/`coreVal`, optional/extra = `optCost`/`optVal`, creep = `creepCost`/`creepVal`.

`GENRE_FEATS` (first two core, third optional):

| genre | features (ic n a) |
|---|---|
| action | 🎯 Waffen-Feintuning gp · 💥 Zerstörbare Umgebung gfx · 🏁 Ranglisten-Modus gp |
| actadv | 🧗 Kletter-System gp · 🌅 Tag-Nacht-Zyklus gfx · 🐎 Reittiere gp |
| adventure | 🧩 Hinweis-System gp · 🎭 Vollvertonung snd · 📔 Tagebuch gp |
| rpg | 🌳 Skill-Bäume gp · 💬 Dialogsystem snd · ⚒️ Crafting gp |
| strategy | 🗺️ Gegner-KI gp · 📊 Wirtschaftssystem gp · 🎬 Wiederholungs-Kamera gfx |
| sim | 🏗️ Bau-Editor gp · 📈 Statistik-Ansicht gp · 🌦️ Jahreszeiten gfx |
| sports | 🏟️ Stadion-Atmosphäre snd · 🕹️ Karrieremodus gp · 📺 TV-Präsentation gfx |
| survival | 🔥 Basisbau gp · 🌲 Prozedurale Welt gfx · 🐺 Tier-KI gp |
| puzzle | 🧠 Level-Editor gp · ✨ Partikel-Effekte gfx · 🎵 Rätsel-Soundtrack snd |
| platformer | 🦘 Präzise Steuerung gp · 🎨 Parallax-Welten gfx · ⏱️ Speedrun-Modus gp |

Ids: `${genre}_1`, `${genre}_2`, `${genre}_3`.

`OPT_FEATS` (optional, all genres): `photo` 📸 Fotomodus gfx · `ngplus` 🔁 New Game Plus gp · `dynsnd` 🎶 Dynamischer Soundtrack snd · `achieve` 🏆 Erfolge gp.

`EXTRA_FEATS` (one per extra in `S.extras`, not core, always planned): `mods` 🛠️ Mod-Editor gp · `coopMode` 🤝 Koop-Netcode gp · `crossplay` ☁️ Crossplay-Backend gp · `soundtrack` 🎻 Orchester-Aufnahmen snd. Ids `x_${extra}`.

USP feature (only with `S.usp`): id `usp`, `💡 ${hook card n}`, area `S.usp.area`, core.

`CREEP_IDEAS`: `fish` 🎣 Angel-Minispiel gp · `cat` 🐱 Katzen streicheln gfx · `karaoke` 🎤 Karaoke-Modus snd · `toilet` 🚽 Begehbare Toiletten gfx · `cards` 🃏 Sammelkartenspiel im Spiel gp · `duck` 🦆 Enten-Physik gp. Feature id `c_${idea}`.

Rules:
- **Default plan:** both genre core features, the USP feature, all extra features. Optional ones (genre third + `OPT_FEATS`) start unchecked. Order: USP, genre cores, extras, optional.
- **Sprint area `feat`:** `AREAS.feat={n:'Features',ic:'🧩',rate:0}`, appended to `AREA_KEYS`. Focus shares for `feat`: balanced 45 (added to its fn result), `gp` 10, `look` 5, `bugs` 5, `hype` 5; `defaultSprint().custom.feat=15`. When no planned feature is unfinished, `sprintAlloc` sets `feat` to 0 before normalising.
- **Building:** each step's feature points (`pts × alloc.feat/100`) go to the first unfinished planned feature (`prog += pts`); overflow continues to the next one. A feature with `prog >= cost` is `done` and adds `val` to `S.res[a]` (then `recalcQual()`). Happens in `monthEnd` right after the sprint delta; notes „🧩 Feature fertig: ${n}“.
- **Move/cut:** `featUp(id)` moves an unfinished feature one place up. `featCut(id)` removes an unfinished feature from the plan into `S.feat.cut` (no time cost when voluntary). A cut extra feature also removes the extra (same as stage 3: `S.extras`, `S.mods`, `S.ea`). Built features cannot be cut.
- **Milestones:** Alpha row `feat` „Kern-Features“: ist = built core features, soll = planned core features. Beta row `feat` „Features“: ist = built planned features, soll = all planned features. `ok` ⇔ ist ≥ soll; `gap = (soll − ist) × MS_NEAR` (one missing feature counts as „knapp“, two as „verfehlt“). Rows only when `S.feat.plan` exists. `msNeed` adds `feat` = remaining cost of the features the next milestone needs, spread like the other areas.
- **Funder cut:** with a feature list `cutOptions()` = unfinished planned features + `scope`; `cutFeature(id)` for a feature id calls `featCut` and keeps the stage-3 side effects (Zeit +`FUND.cutZeit`, crowd promise, `S.fund.cuts`, milestone note). Without a list: unchanged.
- **Release:** review − `missRev` per planned feature still unfinished, − `coreCutRev` per cut core feature. With a feature list, `uspKept` additionally needs the `usp` feature to be done.
- **Feature Creep card** (kind `'creep'`, like the stream card): due after a step when a feature plan exists, `stepIndex('prod_fp') <= S.round < stepIndex('pol_bugs')`, fewer than `creepMax` creeps so far and `Math.random() < creepChance`. Card text: title „Feature Creep: ${ic} ${n}“, „Im Daily schlägt jemand begeistert vor: ‚Wir bräuchten noch ${n}!‘ Das halbe Team nickt.“ Options: 1. „Einbauen“ – safe, adds the feature at the end of the plan, hype +`creepHype`. 2. „Dem Team ausreden“ – roll Team, SG `creepDc`, success: moral +1 („Das Team bleibt fokussiert.“), failure: feature added anyway („Es landet trotzdem im Build.“). 3. „Streng ablehnen“ – safe, moral −1 („Die Stimmung leidet.“).
- **Bug list:** when Bug-Jagd opens, `S.hunt={base:{crit,major,minor},runs,done:false}` from `S.res.bugs` = b: `crit=floor(b/10)`, `rest=b−5·crit`, `major=floor(rest/3)`, `minor=rest−2·major` (weights sum to b). `bugList(s)` reconciles base with the current `s.res.bugs`: extra bugs become minor; fewer bugs remove minor, then major (ceil of rest/2), then crit.
- **QA rolls:** runs = `HUNT.runs` + (`staffLevel('qalead')>=3` ? 1 : 0). Each run: pick a row with count > 0 → W100 Technik vs `HUNT.dc[sev]` (d20 scale). Success removes 1 of that severity (crit roll: 2, capped by count) → `S.res.bugs −= w[sev]` per bug and `base[sev]` decremented. Failure: nothing. (The generic fumble already adds 2 bugs.) „Fertig“ ends early.
- **Certification at launch** (only with `S.hunt`): showstoppers = `bugList(S).crit`; > `certCrit` fails with `certPen`, ≥ `certHiCrit` with `certPenHi` (hype −2, same text as today). Without `S.hunt`: today's rule (bugs ≥ 30 / ≥ 45).
- **Release delay** (screen at `pol_ship`, once): months `m = max(minMonths, round(S.dur × share))`, `w = m×12/refMonths(tier)`. „⏳ Um ${m} Monate verschieben“: budget − `monthSum() × w` (booked to `S.spend.verschiebung`), bugs − `round(bugPerW × w)`, gp/gfx/snd + `round(qualPerW × w)` each, hype + `SHIP.hype`, moral + `funderMoral` if an active `pub` or `inv` deal exists, `S.delayM = m`, log. Zeit is not touched. „🚀 Pünktlich releasen“: nothing. Budget below 0 afterwards → `openCrisis('rand')`.

## Review Focus

1. **Old save in production without a feature list:** no plan screen pops up after `prod_plan`, Alpha/Beta have no feature row, `cutOptions()` still offers extras, launch uses the old bug-30 rule, and the sprint never allocates to `feat`. → tests in Task 2 and Task 6.
2. **Everything cut / everything built:** with no unfinished planned feature `feat` gets 0 % and the „Meilenstein-Ziel“ focus does not divide by zero; Beta with zero planned features counts as met. → tests in Task 1 and Task 2.
3. **Bug count changes after the QA rolls** (sprint, event card, delay, EA bug reduction): `bugList` stays consistent with `S.res.bugs` (weights sum to the bug count, no negative counts) and certification uses the reconciled showstoppers. → test in Task 4.
4. **Reload on the new screens:** a save on `screen:'event'` at `prod_plan` without a plan, at `pol_bugs` with an open hunt, or at `pol_ship` without a decision comes back on `'features'`/`'hunt'`/`'ship'`. → test in Task 6.
5. **Delay with little money or an active publisher:** the crisis opens when the budget drops below 0, the moral hit applies only with an active pub/inv deal, and the delay can be taken only once. → test in Task 5.

---

### Task 1: Feature catalog, plan and sprint area

**Files:**
- Create: `js/features.js`
- Modify: `js/sprint.js` (`AREAS`, `AREA_KEYS`, `FOCUS`, `defaultSprint`, `sprintAlloc`, `sprintDelta` return), `js/game.js` (`monthEnd` after the sprint delta ~line 980; `startGame` S literal: `feat:null,hunt:null,ship:null,delayM:0`), `index.html`, `sw.js` (`w100-v10`), `tests/harness.js`
- Test: `tests/features.test.js` (new)

**Interfaces:**
- Produces: constants and catalogs from „Numbers and copy“; `featCandidates(s=S) -> Feature[]` (default plan order, `planned` flag per the default rule); `startPlan(ids:string[]) -> boolean` (sets `S.feat={plan:Feature[],cut:[],creepN:0}` from the candidates whose id is in `ids` – core/extra/usp ids not in `ids` go to `S.feat.cut` as cut at planning –, returns false if called twice); `featActive(s=S) -> boolean` (a planned feature is unfinished); `featBuild(pts:number) -> string[]` (notes); `featUp(id) -> boolean`; `featCut(id) -> boolean`; `featStats(s=S) -> {planned,built,core,coreBuilt,cutCore}`. `sprintDelta()` returns an extra `feat` = feature points. `monthEnd` calls `featBuild(sd.feat)` and pushes its notes.

- [ ] **Step 1: Write the failing tests**

```js
const test=require('node:test'),assert=require('node:assert/strict');
const {load,newProject}=require('./harness');
const toPlan=run=>run(`S.round=stepIndex('prod_plan');S.res.budget=1e9;S.usp={ids:['loop','jazz','liar'],area:'gp',power:2,n:'x'}`);
test('default plan: USP, genre cores, extras',()=>{const {run}=load();newProject(run,{extras:['coopMode']});toPlan(run);
  const c=run('featCandidates()');assert.deepEqual(c.filter(f=>f.planned).map(f=>f.id),['usp','rpg_1','rpg_2','x_coopMode']);
  assert.ok(c.some(f=>f.id==='photo'&&!f.planned));assert.equal(c.find(f=>f.id==='usp').n,'💡 Zeitschleife');});
test('startPlan once, unplanned core counts as cut',()=>{const {run}=load();newProject(run);toPlan(run);
  assert.equal(run(`startPlan(['usp','rpg_1','photo'])`),true);assert.equal(run('S.feat.plan.length'),3);
  assert.deepEqual(run('S.feat.cut.map(f=>f.id)'),['rpg_2']);assert.equal(run(`startPlan(['usp'])`),false);});
test('feature points build in order with overflow and add quality',()=>{const {run}=load();newProject(run);toPlan(run);run(`startPlan(['usp','rpg_1'])`);
  const gp=run('S.res.gp');const n=run('featBuild(7)');assert.equal(run('S.feat.plan[0].done'),true);assert.equal(run('S.feat.plan[1].prog'),2);
  assert.equal(run('S.res.gp'),gp+3);assert.match(n[0],/Feature fertig/);});
test('feat share is zero without unfinished planned features',()=>{const {run}=load();newProject(run);
  assert.equal(run('sprintAlloc().feat'),0);toPlan(run);run(`startPlan(['usp'])`);assert.ok(run('sprintAlloc().feat')>0);
  run('featBuild(99)');assert.equal(run('sprintAlloc().feat'),0);});
test('move up and cut; built features cannot be cut; cutting an extra feature drops the extra',()=>{const {run}=load();newProject(run,{extras:['mods']});toPlan(run);
  run(`startPlan(['usp','rpg_1','x_mods'])`);assert.equal(run(`featUp('x_mods')`),true);assert.equal(run('S.feat.plan[1].id'),'x_mods');
  assert.equal(run(`featCut('x_mods')`),true);assert.equal(run('S.mods'),false);assert.ok(!run('S.extras').includes('mods'));
  run('featBuild(5)');assert.equal(run(`featCut('usp')`),false);});
test('monthEnd builds features from the sprint',()=>{const {run}=load();newProject(run);toPlan(run);run(`startPlan(['usp','rpg_1'])`);
  run(`S.sprint.focus='balanced';Math.random=()=>0.999;monthEnd()`);assert.ok(run('S.feat.plan[0].prog>0||S.feat.plan[0].done'));});
```

- [ ] **Step 2: Run** `node --test` — Expected: new tests FAIL (`featCandidates is not defined`).
- [ ] **Step 3: Implement** per the interface and the rules; register the file in `index.html`, `sw.js`, harness `FILES`. In `sprintDelta` compute `feat` from the allocation; the quality/bug/hype terms are unchanged. Existing tests that read the allocation must keep passing (the `feat` key is 0 before a plan exists).
- [ ] **Step 4: Run** `node --test` — Expected: all PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: feature list with a features sprint area"`

---

### Task 2: Milestones, funder cuts and release effects

**Files:**
- Modify: `js/milestones.js` (`msCheck`, `msNeed`), `js/funding.js` (`cutOptions`, `cutFeature`), `js/activities.js` (`uspKept`), `js/game.js` (`reviewScore`)
- Test: `tests/features.test.js`

**Interfaces:**
- Consumes: Task 1.
- Produces: `featRev(s=S) -> number` (in `js/features.js`; ≤ 0, `−missRev × unfinished planned − coreCutRev × cut core`; 0 without a plan) added to `reviewScore`; feature rows in `msCheck` (`k:'feat'`); `msNeed().feat`.

- [ ] **Step 1: Write the failing tests**

```js
test('alpha checks core features, beta all planned',()=>{const {run}=load();newProject(run);toPlan(run);run(`startPlan(['usp','rpg_1','photo'])`);
  run(`S.res.gp=S.res.gfx=S.res.snd=99;S.res.bugs=0`);
  let r=run(`msCheck('alpha')`);const fr=r.rows.find(x=>x.k==='feat');assert.equal(fr.soll,2);assert.equal(fr.ist,0);assert.equal(r.outcome,'miss');
  run('featBuild(5)');assert.equal(run(`msCheck('alpha').outcome`),'near');run('featBuild(5)');assert.equal(run(`msCheck('alpha').outcome`),'met');
  assert.equal(run(`msCheck('beta').rows.find(x=>x.k==='feat').soll`),3);});
test('no feature rows without a plan; beta with an empty plan is met',()=>{const {run}=load();newProject(run);
  assert.ok(!run(`msCheck('alpha').rows.some(x=>x.k==='feat')`));toPlan(run);run('startPlan([])');
  run(`S.res.gp=S.res.gfx=S.res.snd=99;S.res.bugs=0`);assert.equal(run(`msCheck('beta').outcome`),'met');});
test('Meilenstein-Ziel asks for feature points before alpha',()=>{const {run}=load();newProject(run);toPlan(run);run(`startPlan(['usp','rpg_1'])`);
  run(`S.round=stepIndex('prod_fp')`);assert.ok(run('msNeed().feat')>0);});
test('funder cut offers unfinished features, keeps stage-3 effects',()=>{const {run}=load();newProject(run);toPlan(run);run(`startPlan(['usp','rpg_1'])`);
  run('featBuild(5)');assert.deepEqual([...run('cutOptions().map(o=>o.id)')],['rpg_1','scope']);
  const z=run('S.res.zeit');run(`S.fund.cutPending=true;cutFeature('rpg_1')`);assert.equal(run('S.res.zeit'),z+1);assert.equal(run('S.feat.plan.length'),1);});
test('release: unfinished and cut core features cost review, USP feature needed',()=>{const {run}=load();newProject(run);toPlan(run);run(`startPlan(['usp','rpg_1'])`);
  assert.equal(run('featRev()'),-3*2-2);run(`S.res.gp=99;featBuild(5)`);assert.equal(run('uspKept()'),true);
  run(`featCut('rpg_1')`);assert.equal(run('featRev()'),-2*2);});
test('old save without plan keeps extras cut and zero featRev',()=>{const {run}=load();newProject(run,{extras:['ea']});
  assert.deepEqual([...run('cutOptions().map(o=>o.id)')],['ea','scope']);assert.equal(run('featRev()'),0);});
```

- [ ] **Step 2: Run** `node --test` — Expected: new tests FAIL.
- [ ] **Step 3: Implement** per the rules. In `cutFeature`, a feature id goes through `featCut` (forced, so the stage-3 Zeit cost applies), an extra id/`scope` keeps today's path. The milestone screen already renders rows generically; a `feat` row shows `≥`.
- [ ] **Step 4: Run** `node --test` — Expected: all PASS (incl. the existing funding test with `['ea','scope']`).
- [ ] **Step 5: Commit** `git commit -m "feat: features in milestones, funder cuts and reviews"`

---

### Task 3: Feature-Creep card

**Files:**
- Modify: `js/features.js`, `js/game.js` (`afterMonth` after the stream check; `curCard`, `choose`, `curTitle`, `getOpt`, `afterResult`)
- Test: `tests/features.test.js`

**Interfaces:**
- Consumes: Task 1 (`S.feat`, plan helpers), the card pattern of `streamCard`/`startStream` in `js/press.js`.
- Produces: `creepDue(s=S) -> boolean`; `startCreep() -> boolean` (picks an idea not yet in plan/cut, sets `S.creep=ideaId`, `S.feat.creepN++`, `S.screen='creep'`, render/save); `creepCard(id) -> {t,x,o:[…]}` per the copy; card kind `'creep'` wired through `curCard`/`choose`/`getOpt`/`curTitle` („Feature Creep“) and `afterResult('creep') → afterRandom()`.

- [ ] **Step 1: Write the failing tests**

```js
test('creep is due only in production with a plan and once',()=>{const {run}=load();newProject(run);run('Math.random=()=>0');
  run(`S.round=stepIndex('prod_fp')`);assert.equal(run('creepDue()'),false);toPlan(run);run(`startPlan(['usp']);S.round=stepIndex('prod_fp')`);
  assert.equal(run('creepDue()'),true);run(`S.round=stepIndex('pol_bugs')`);assert.equal(run('creepDue()'),false);
  run(`S.round=stepIndex('prod_alpha');startCreep()`);assert.equal(run('S.screen'),'creep');assert.equal(run('creepDue()'),false);});
test('creep options',()=>{const {run}=load();newProject(run);toPlan(run);run(`startPlan(['usp']);S.round=stepIndex('prod_fp');Math.random=()=>0;startCreep()`);
  const h=run('S.res.hype');run('choose(0)');assert.equal(run('S.feat.plan.at(-1).src'),'creep');assert.equal(run('S.res.hype'),Math.min(10,h+1));
  const o=run(`creepCard(S.creep).o`);assert.equal(o[1].st,'team');assert.equal(o[1].dc,12);assert.deepEqual({...o[2].safe},{moral:-1});});
```

- [ ] **Step 2: Run** `node --test` — Expected: FAIL.
- [ ] **Step 3: Implement**; the „Dem Team ausreden“ failure adds the feature via `onFail`, „Einbauen“ via `onSafe`.
- [ ] **Step 4: Run** `node --test` — Expected: all PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: feature creep card"`

---

### Task 4: Bug-Jagd – bug list, QA rolls, certification

**Files:**
- Modify: `js/features.js`, `js/game.js` (`goMonth`, `getOpt`, `resolve`, `afterResult`, `curTitle`, `launch` certification block ~1528)
- Test: `tests/features.test.js`

**Interfaces:**
- Produces: `bugSplit(b:number) -> {crit,major,minor}`; `bugList(s=S) -> {crit,major,minor}`; `huntDue(s=S) -> boolean` (`STEPS[s.round]?.id==='pol_bugs' && !(s.hunt&&s.hunt.done)`); `openHunt() -> void` (creates `S.hunt` once with `base=bugSplit(S.res.bugs)`, `runs`); `startHunt(sev) -> void` (no-op if no runs left or count 0; roll kind `'hunt'`, `ev:sev`); `resolveHunt(sev, ok, crit) -> {ch,txt}`; `endHunt() -> void` (done, log „🐞 Bug-Jagd beendet: ${crit} Showstopper, ${major} schwer, ${minor} leicht“, `goMonth()`); `certPenalty(s=S) -> number` (0, `certPen` or `certPenHi`; uses showstoppers with `s.hunt`, the old rule without). `goMonth` routes a due hunt to `S.screen='hunt'` (after mandatory cards; calls `openHunt()`); a hunt with 0 runs left is ended by `resolveHunt` (done, then `afterResult('hunt') → goMonth()`). `launch` uses `certPenalty(S)` (keep `S.works` bypass and the text).

- [ ] **Step 1: Write the failing tests**

```js
test('bug split weights sum to the bug count',()=>{const {run}=load();
  for(const b of [0,1,7,12,30,45,57]){const x=run(`bugSplit(${b})`);assert.equal(x.crit*5+x.major*2+x.minor,b,String(b));}
  assert.deepEqual({...run('bugSplit(30)')},{crit:3,major:5,minor:5});});
test('bug list reconciles later bug changes',()=>{const {run}=load();newProject(run);run(`S.res.bugs=30;S.round=stepIndex('pol_bugs');openHunt()`);
  run('S.res.bugs=33');assert.deepEqual({...run('bugList()')},{crit:3,major:5,minor:8});
  run('S.res.bugs=21');const l=run('bugList()');assert.equal(l.crit*5+l.major*2+l.minor,21);assert.ok(l.minor>=0&&l.major>=0&&l.crit>=0);});
test('QA roll removes bugs of the chosen severity',()=>{const {run}=load();newProject(run);run(`S.res.bugs=30;S.round=stepIndex('pol_bugs');openHunt()`);
  run(`resolveHunt('crit',true,false)`);assert.equal(run('S.res.bugs'),25);assert.equal(run('bugList().crit'),2);
  run(`resolveHunt('crit',true,true)`);assert.equal(run('bugList().crit'),0);assert.equal(run('S.res.bugs'),15);});
test('runs end the hunt; qalead adds a run',()=>{const {run}=load();newProject(run);run(`S.res.bugs=30;S.round=stepIndex('pol_bugs');openHunt()`);
  assert.equal(run('S.hunt.runs'),3);for(let i=0;i<3;i++)run(`resolveHunt('minor',false,false)`);assert.equal(run('S.hunt.done'),true);
  const b=load();newProject(b.run);b.run(`C.studio.staff.push({id:'qalead',level:3,loyalty:6});S.round=stepIndex('pol_bugs');openHunt()`);assert.equal(b.run('S.hunt.runs'),4);});
test('pol_bugs opens the hunt screen',()=>{const {run}=load();newProject(run);run(`S.res.budget=1e9;S.round=stepIndex('pol_bugs');goMonth()`);assert.equal(run('S.screen'),'hunt');});
test('certification by showstoppers with a hunt, old rule without',()=>{const {run}=load();newProject(run);
  run('S.res.bugs=30');assert.equal(run('certPenalty()'),8);run(`S.round=stepIndex('pol_bugs');openHunt();resolveHunt('crit',true,false)`);
  assert.equal(run('certPenalty()'),0);run('S.res.bugs+=20');assert.equal(run('certPenalty()'),0);
  run(`S.hunt.base={crit:4,major:0,minor:0};S.res.bugs=20`);assert.equal(run('certPenalty()'),15);});
```

- [ ] **Step 2: Run** `node --test` — Expected: FAIL.
- [ ] **Step 3: Implement** per the rules (`getOpt` for `'hunt'`: `{l:'QA-Runde',st:'technik',dc:HUNT.dc[p.ev],s:{},f:{}}`; `curTitle` „Bug-Jagd“).
- [ ] **Step 4: Run** `node --test` — Expected: all PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: bug hunt with severity list and showstopper certification"`

---

### Task 5: Release decision

**Files:**
- Modify: `js/features.js`, `js/game.js` (`goMonth`)
- Test: `tests/features.test.js`

**Interfaces:**
- Produces: `shipDue(s=S) -> boolean` (`STEPS[s.round]?.id==='pol_ship' && !s.ship`); `delayMonths(s=S) -> number`; `delayCost(s=S) -> number`; `decideShip(delay:boolean) -> void` (sets `S.ship='ontime'|'delay'`, applies the delay effects once, logs „⏳ Release um ${m} Monate verschoben …“ / „🚀 Release bleibt pünktlich“, then crisis or `goMonth()`). `goMonth` routes a due decision to `S.screen='ship'` (after mandatory cards and the hunt check).

- [ ] **Step 1: Write the failing tests**

```js
const toShip=run=>run(`S.res.budget=1e9;S.round=stepIndex('pol_ship');S.mdone.push('price','china')`);
test('pol_ship opens the release decision',()=>{const {run}=load();newProject(run);toShip(run);run('goMonth()');assert.equal(run('S.screen'),'ship');});
test('delay: cost, polish, hype, months; only once',()=>{const {run}=load();newProject(run);toShip(run);
  assert.equal(run('delayMonths()'),2);run('S.res.bugs=10');const b=run('S.res.budget'),gp=run('S.res.gp'),h=run('S.res.hype'),c=run('delayCost()');
  run('decideShip(true)');assert.equal(run('S.res.budget'),b-c);assert.equal(run('S.res.bugs'),10-5);assert.equal(run('S.res.gp'),gp+2);
  assert.equal(run('S.res.hype'),Math.max(0,h-1));assert.equal(run('S.delayM'),2);assert.equal(run('shipDue()'),false);});
test('delay hurts moral only with publisher or investor',()=>{const a=load();newProject(a.run);toShip(a.run);const m=a.run('S.res.moral');a.run('decideShip(true)');assert.equal(a.run('S.res.moral'),m);
  const b=load();newProject(b.run);toShip(b.run);b.run(`signDeal('pub',100)`);const m2=b.run('S.res.moral');b.run('decideShip(true)');assert.equal(b.run('S.res.moral'),m2-1);});
test('delay into negative budget opens the crisis',()=>{const {run}=load();newProject(run);toShip(run);run('S.res.budget=1;decideShip(true)');assert.equal(run('S.screen'),'crisis');});
test('on time changes nothing',()=>{const {run}=load();newProject(run);toShip(run);const s=JSON.stringify(run('S.res'));run('decideShip(false)');assert.equal(JSON.stringify(run('S.res')),s);assert.equal(run('S.ship'),'ontime');});
```

(`signDeal(id,amount)` exists in `js/funding.js`; check its signature and adapt the call if needed.)

- [ ] **Step 2: Run** `node --test` — Expected: FAIL.
- [ ] **Step 3: Implement** per the rules.
- [ ] **Step 4: Run** `node --test` — Expected: all PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: release on time or delay for polish"`

---

### Task 6: Save migration

**Files:**
- Modify: `js/storage.js` (`normalizeProject`, next to the stage-4a defaults)
- Test: `tests/features.test.js`

**Interfaces:**
- Produces: missing `feat` → `null`; missing `hunt` → `null`; missing `ship` → `s.round>stepIndex('pol_ship')?'ontime':null`; missing `delayM` → 0; missing `creep` ignored. A save whose round is past `prod_plan` and has no `feat` gets `feat:{plan:null,legacy:true}` so no plan screen appears; all feature helpers treat `plan:null` like no plan. Screen restore on `'event'`: `featuresDue` → `'features'`, `huntDue` → `'hunt'` (and `openHunt()` if `hunt` is null), `shipDue` → `'ship'`. `featuresDue(s=S)` (in `js/features.js`): `STEPS[s.round]?.id==='prod_plan' && !s.feat`; `goMonth` routes it to `S.screen='features'` (after mandatory cards, before the hunt/ship checks).

- [ ] **Step 1: Write the failing tests**

```js
test('prod_plan opens the plan screen, legacy save past it does not',()=>{const {run}=load();newProject(run);run(`S.res.budget=1e9;S.round=stepIndex('prod_plan');S.mdone.push('cast','platform');goMonth()`);
  assert.equal(run('S.screen'),'features');
  run(`S.round=stepIndex('prod_fp');delete S.feat;delete S.hunt;delete S.ship`);const s=run('normalizeProject(JSON.parse(JSON.stringify(S)),C)');
  assert.equal(s.feat.plan,null);assert.equal(s.hunt,null);assert.equal(s.ship,null);});
test('legacy save gets no feature allocation and no feature rows',()=>{const {run}=load();newProject(run);run(`S.round=stepIndex('prod_alpha');delete S.feat`);
  run('S=normalizeProject(S,C)');assert.equal(run('sprintAlloc().feat'),0);assert.ok(!run(`msCheck('alpha').rows.some(x=>x.k==='feat')`));});
test('reload restores features, hunt and ship screens',()=>{const {run}=load();newProject(run);
  run(`S.round=stepIndex('prod_plan');S.feat=null;S.screen='event'`);assert.equal(run('normalizeProject(JSON.parse(JSON.stringify(S)),C)').screen,'features');
  run(`S.round=stepIndex('pol_bugs');S.feat={plan:[],cut:[],creepN:0};S.hunt=null;S.screen='event'`);const h=run('normalizeProject(JSON.parse(JSON.stringify(S)),C)');
  assert.equal(h.screen,'hunt');assert.ok(h.hunt);
  run(`S.round=stepIndex('pol_ship');S.hunt={base:{crit:0,major:0,minor:0},runs:0,done:true};S.ship=null;S.screen='event'`);
  assert.equal(run('normalizeProject(JSON.parse(JSON.stringify(S)),C)').screen,'ship');});
```

(`normalizeProject` runs outside the live `S` – `openHunt` must work on the passed save object, e.g. via a helper that takes `s`.)

- [ ] **Step 2: Run** `node --test` — Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `node --test` — Expected: all PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: migrate saves for features, bug hunt and release decision"`

---

### Task 7: UI – plan screen, feature panel, creep card

**Files:**
- Modify: `js/ui.js` (`ACTIVE`, `renderMain`, `headFor`, event screen block ~1209, `sprintBar` fine rows), `css/style.css` only if needed
- Test: `tests/ui.test.js`

**Interfaces:**
- Consumes: Tasks 1–3, 6.
- Produces: `renderFeatures(m)` (module-level `featDraft` = set of checked ids, initialised from the default plan); `featPanelHTML() -> string` (empty without a plan) with bindings for `[data-fup]` and `[data-fcut]`; creep card rendered like the stream card (`m.className='card rnd'`, `headFor('creep',S.creep)` + `optsHTML(creepCard(S.creep))`).

Screen contents:
- **Plan screen** (`.big-decision`, title „Feature-Umfang: Was kommt ins Spiel?“): one row per candidate (`opt` button with `aria-pressed`, `ic n`, area icon, „Kern“/„Extra“/„Optional“, cost in points, „+val Gameplay/Grafik/Sound“). Core rows show „Streichen kostet −2 Wertung“ when unchecked; extra rows are locked on with the note „Gestrichen wird über die Feature-Liste“. Summary: „Geplant: ${n} Features · ${cost} Punkte · Erwartet bis Beta: ~${est} Feature-Punkte (Ausgewogen)“ where `est` = sum over steps `prod_plan…prod_beta` of the balanced sprint's feature points (helper `featEstimate()` in `js/features.js`, add it in this task with a test). Button „🧩 Plan übernehmen“ → `startPlan([...featDraft])`, `featDraft=null`, `goMonth()`.
- **Feature panel** on the event screen below the sprint bar (only with a plan): `<details class="fold">` summary „🧩 Features ${built}/${planned} · nächstes: ${n} ${prog}/${cost}“; body lists planned features (done ✓, unfinished with „⬆“ and „✂ Streichen“ buttons; „✂“ asks no confirmation but shows the consequence in its title: Kern −2 Wertung, USP gebrochen, Extra entfällt).
- **Sprint fine rows:** hide the `feat` row while `!featActive()`.
- `headFor('creep')` stamp „Production“; `ACTIVE` gains `'features','creep'`.

- [ ] **Step 1: Write the failing tests** (reuse the `html` helper in `tests/ui.test.js`)

```js
test('plan screen lists candidates and the estimate',()=>{const {run}=load({ui:true});newProject(run);run(`S.round=stepIndex('prod_plan');S.usp={ids:['loop','jazz','liar'],area:'gp',power:2,n:'x'}`);
  const h=html(run,'renderFeatures');assert.match(h,/Feature-Umfang/);assert.match(h,/Skill-Bäume/);assert.match(h,/Fotomodus/);assert.match(h,/Plan übernehmen/);assert.match(h,/Erwartet bis Beta/);});
test('feature panel shows progress and actions',()=>{const {run}=load({ui:true});newProject(run);run(`S.round=stepIndex('prod_plan');startPlan(['rpg_1','rpg_2']);featBuild(5)`);
  const h=run('featPanelHTML()');assert.match(h,/Features 1\/2/);assert.match(h,/data-fcut="rpg_2"/);assert.doesNotMatch(h,/data-fcut="rpg_1"/);});
test('creep card renders',()=>{const {run}=load({ui:true});newProject(run);run(`S.round=stepIndex('prod_plan');startPlan(['rpg_1']);S.round=stepIndex('prod_fp');Math.random=()=>0;startCreep()`);
  assert.equal(run('S.screen'),'creep');assert.match(run(`headFor('creep',S.creep)`),/Feature Creep/);
  assert.match(run('optsHTML(creepCard(S.creep))'),/Einbauen/);});
test('featEstimate is positive and grows with duration',()=>{const a=load();newProject(a.run,{dur:'short'});const b=load();newProject(b.run,{dur:'long'});
  assert.ok(a.run('featEstimate()')>0);assert.ok(b.run('featEstimate()')>a.run('featEstimate()'));});
```

- [ ] **Step 2: Run** `node --test` — Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `node --test` — Expected: all PASS.
- [ ] **Step 5: Commit** `git commit -m "feat(ui): feature plan screen, feature panel and creep card"`

---

### Task 8: UI – Bug-Jagd and release decision screens

**Files:**
- Modify: `js/ui.js` (`ACTIVE`, `renderMain`, `headFor`, `msBlock`/milestone rows if needed)
- Test: `tests/ui.test.js`

**Interfaces:**
- Produces: `renderHunt(m)`, `renderShip(m)`.

Screen contents:
- **Bug-Jagd** (title „Bug-Jagd“): three rows from `bugList()` – „🔴 Showstopper ×${crit}“, „🟠 Schwer ×${major}“, „🟡 Leicht ×${minor}“ – each an `opt` button `data-hunt="crit|major|minor"` with „SG ${dc100(dc)} (${winChance} %) · −${w} Bugs je Treffer“, disabled when the count is 0 or no runs are left. Line „QA-Runden: ${runs} übrig“. Certification prognosis: „Zertifizierung: ✓ voraussichtlich bestanden“ when showstoppers ≤ `certCrit`, else „✗ durchgefallen (−${pen} Wertung)“. Button „✅ Fertig“ → `endHunt()`.
- **Release decision** (`.big-decision`, title „Release: Jetzt oder später?“): current Prognose (`reviewForecast()`), bugs, showstopper status; two `opt` buttons: „🚀 Pünktlich releasen“ and „⏳ Um ${m} Monate verschieben · ${money(delayCost())}“ with the effect line „−${bugs} Bugs · +${q} Gameplay/Grafik/Sound · −1 Hype${funder?' · Geldgeber murren (−1 Moral)':''}“.
- `headFor('hunt')` stamp „Polish & QA“, title „QA-Runde“. `ACTIVE` gains `'hunt','ship'`.
- Step 5 (browser check) is done by the controller.

- [ ] **Step 1: Write the failing tests**

```js
test('hunt screen shows severities and certification',()=>{const {run}=load({ui:true});newProject(run);run(`S.res.bugs=30;S.round=stepIndex('pol_bugs');openHunt()`);
  const h=html(run,'renderHunt');assert.match(h,/Showstopper ×3/);assert.match(h,/QA-Runden: 3/);assert.match(h,/durchgefallen/);assert.match(h,/Fertig/);});
test('ship screen offers both choices with cost',()=>{const {run}=load({ui:true});newProject(run);run(`S.round=stepIndex('pol_ship')`);
  const h=html(run,'renderShip');assert.match(h,/Pünktlich releasen/);assert.match(h,/Um 2 Monate verschieben/);});
```

- [ ] **Step 2: Run** `node --test` — Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `node --test` — Expected: all PASS.
- [ ] **Step 5: Commit** `git commit -m "feat(ui): bug hunt and release decision screens"`

---

### Task 9: Docs

**Files:**
- Modify: `README.md` (phases/production section), `ROADMAP.md` (4b done; knobs `FEAT`/`HUNT`/`SHIP` and the balanced feature share 45 to tune after playtest; milestone targets may need recalibration because the balanced sprint now spends part on features)

- [ ] **Step 1:** Update both files in German, short.
- [ ] **Step 2: Run** `node --test` — Expected: all PASS.
- [ ] **Step 3: Commit** `git commit -m "docs: describe feature list, bug hunt and release decision (stage 4b)"`
