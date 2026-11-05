# Etappe 5: Geschäftsmodelle & Live-Betrieb – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The business models become *Kaufspiel*, *Free-to-Play* and the new *Live Service*; the old Abo model becomes the extra **Premium-Abo** (combinable with Kaufspiel and Live Service). Games with Live Service or Premium-Abo enter a new studio area **Live-Betrieb** after release: a player base that shrinks each month, monthly income and server costs, a fixed share of team capacity taken from the running project's sprint, a **Season** decision every few months, and **End of Service** at any time. Several live games at once add up.

**Architecture:** New module `js/live.js` (after `js/features.js`) holds the `LIVE` knobs, model helpers (`hasPremium`, `modelTags`, `liveFit`), release revenue for the new models, the live-game list `C.live`, the monthly tick, capacity share, seasons and End of Service. `js/data.js` loses `MODELS.abo` and `GENRE_MODS.live`, gains `MODELS.live` and `PROJECT_EXTRAS.premium`. `js/game.js` calls into it from `sales()`, `finishGame()`, `monthEnd()`, `afterMonth()`, `monthLines()` and `runEngineProject()`; `js/sprint.js` deducts the live share. Live money that flows during a project is booked in `S.liveNet` and treated like capital, so it changes the cash but not the project's result.

**Tech Stack:** Vanilla JS (browser globals, no build), Node 24 `node:test` + `vm` (`tests/harness.js`), preview config `game` in `.claude/launch.json`.

**Spec:** `docs/superpowers/specs/2026-11-04-phasen-erlebnis-design.md` (sections 2, 3 „Live-Betrieb läuft mit“, 5 „Post-Launch“, 7, 10.5, 11, 12 „Balancing … gehört zu Etappe 5“)

**Scope (stage 5 only):** models and extra, genre fit tags, event-card model tags, release revenue, live-game list, monthly tick, capacity deduction, seasons, End of Service, save migration, UI (wizard, season screen, live tab, sprint/step/ledger/end notes), docs. **Not in scope:** prototype lab (stage 6), single platform choice (stage 7), new event cards for live ops, DLC rework (DLC options stay as they are).

**Branch:** `feat/etappe-5-live` from `main` (9916e14). Workflow: feature branch → ff-merge to main → push only when the user says so.

## Global Constraints

- In-game text German, code/identifiers/commits English.
- No build step, no npm dependencies. Tests: `node --test` from the repo root (not `node --test tests/` on Node 24).
- „Live Service als Geschäftsmodell, Abo als Feature; beide laufen nach Release als Live-Betrieb weiter.“
- „Abo und Live Service binden auch nach dem Release Ressourcen und liefern dafür laufende Einnahmen.“
- „Der Genre-Modifikator `live` entfällt. Seine Wirkung geht im Geschäftsmodell auf, und die Genre-Synergien (`fit:'abo'` usw.) werden angepasst.“
- „Premium-Abo ist ein neues Extra und kombinierbar mit Kaufspiel und Live Service.“ – never with Free-to-Play.
- „Mehrere Live-Spiele gleichzeitig sind erlaubt, die Belastung summiert sich.“
- „Karrieren dürfen nicht verloren gehen.“ A saved model `abo` loads as Kaufspiel + Premium-Abo; a saved genre modifier `live` is dropped (spec §12). `S.v` stays `2`.
- One-click rule: the season decision is one click; the live tab is optional to visit.
- New JS file goes into `index.html` (after `js/features.js`), the `sw.js` precache list (cache `w100-v10` → `w100-v11`) and `FILES` in `tests/harness.js` (after `js/features.js`).
- Desktop, tablet and phone (375 px) without horizontal scrolling.
- Legends and unlocks do not depend on the Abo model (checked: no `abo` reference in legend code) – nothing to migrate there.

## Numbers and copy (builder's choice, spec §11; all in `js/live.js`)

```js
const LIVE={launchMult:.85,premiumSales:.9,kaufActive:.5,arpu:1.2,subShare:.2,fee:12.99,cut:.7,
  server:1,serverPer:.05,churn:.08,staleChurn:.06,synChurn:-.02,clashChurn:.03,metaChurn:.002,minChurn:.03,maxChurn:.3,
  capLive:.12,capPremium:.08,capMax:.6,seasonEvery:6,seasonCost:12,seasonBack:.3,seasonCap:.15,eosFame:2};
const LIVE_SYN=['rpg.mmorpg','action','strategy.moba','survival','sports.sim'];   // old GENRE_MODS.live.syn
const LIVE_CLASH=['adventure','puzzle.logic','platformer','rpg.crpg'];            // old GENRE_MODS.live.clash
```

Data changes (`js/data.js`):
- `MODELS` = `kauf` (unchanged), `f2p` (unchanged), `live:{n:'Live Service',d:'Kaufen und dann dabeibleiben: Seasons, Battle Pass, laufende Updates. Nach dem Release laufende Einnahmen, aber Server und ein Teil des Teams bleiben gebunden.',sales:'Launch-Wurf'}`. Key order: `kauf`, `f2p`, `live`. `abo` is removed.
- `PROJECT_EXTRAS.premium={n:'💳 Premium-Abo',d:'Eine Monatsgebühr für Bonus-Inhalte und eigene Server. Bringt nach dem Release laufende Einnahmen, verlangt aber regelmäßig neuen Content.',code:'Nur Kaufspiel & Live Service · −10 % Verkäufe · nach Release: Abo-Einnahmen, Server, 8 % Team-Kapazität',upfront:0,monthly:0,eff:{},models:['kauf','live']}`.
- `GENRE_MODS.live` is removed. Fit tags: `rpg.subs.mmorpg.fit='live'`, `action.subs.looter.fit='live'`, `sports.subs.sim.fit='live'` (others unchanged).
- Features (stage 4b `EXTRA_FEATS`): add `premium` 💳 Abo-Backend gp (id `x_premium`).

Rules:
- **Model tags:** `modelTags(s)` = `[s.model]` plus `'abo'` when `hasPremium(s)`. `fits()` matches `c.models` against these tags. Event tags in `js/events.js`: every `['abo','f2p']` → `['live','abo','f2p']`; `['abo']` → `['live','abo']`; `['kauf','abo']` → `['kauf','live']`. „Abo-Müdigkeit“ in `js/content-extra.js`: `cond:s=>hasPremium(s)`.
- **Multiplayer:** `isMultiplayer` treats `s.model==='live'` like the old `gmod:'live'`.
- **Beta servers:** `monthLines()` adds `server 2×scale` on `live` steps when `S.model!=='kauf'||hasPremium(S)`; the old `GENRE_MODS[S.gmod].monthly` line is removed.
- **Release revenue** (`modelRevenue(units,price)` for `kauf`/`live`; F2P stays inline): `kauf`: units × (premium ? `premiumSales` : 1), revenue = units × price × .6 / 1000. `live`: units × `launchMult` × (premium ? `premiumSales` : 1), same box formula. The F2P lump `e.live = 36×scale` stays only for F2P (ledger label „inkl. erstem Server-Jahr“); `live`/premium pay servers in live ops instead.
- **Live entry** (`liveAdd(e)` in `finishGame` after the hall push, only for `live` or premium; `nr` = the last hall entry's `nr`): `{nr,title,tier,scale,model,premium,players,peak,meta,user,fit,months:0,since:0,stale:false,seasons:0,seasonAt:null,net:0,status:'on'}`; `players = model==='live' ? e.units : round(e.units × kaufActive)`; `peak = players`; `fit = liveFit(S.genre,S.subGenre)`; hall entry gets `live:{months:0,net:0,seasons:0,on:true}`.
- **Churn per month:** `clamp(churn + (stale?staleChurn:0) + (fit==='syn'?synChurn:fit==='clash'?clashChurn:0) − (meta−70)×metaChurn, minChurn, maxChurn)`.
- **Monthly money** (`liveMonthly(g)` → `{rev,cost,net}` in k€): `rev = players × ((model==='live'?arpu:0) + (premium?subShare×fee:0)) × cut / 1000`; `cost = server × scale + players × serverPer / 1000`.
- **Tick** (`liveTick(months)` → `{net,notes}`): for each `on` game, in chunks of ≤ 1 month: add `liveMonthly(g).net × chunk` to `g.net`, then `players = round(players × (1−churn)^chunk)`, `months += chunk`, `since += chunk`. After the loop: if `liveMonthly(g).net < 0` → automatic End of Service without fame loss, note „📡 ${title}: Die Server kosten mehr, als sie einbringen. Automatisches End of Service.“ Clears every `seasonAt`. Syncs the hall entry. Returns the summed net.
- **Capacity:** `liveCapShare(s)` = Σ over `on` games of (`model==='live'?capLive:0`) + (`premium?capPremium:0`) + (`seasonAt===s.round?seasonCap:0`), capped at `capMax`. `sprintCapacity` pushes `{n:'Live-Betrieb',pts:gross×share}` into `deduct` (not on a contract step, which already takes everything).
- **Season due:** first `on` game with `since >= seasonEvery`. Checked in `afterMonth` after the legend encounter and before the fair (`if(seasonDue()&&openSeason())return;`). One season screen per step at most.
- **Season choices** (`decideSeason(choice)`): `'run'`: cost `seasonCost × g.scale` k€ from `S.res.budget`, booked as `S.liveNet −= cost` and `g.net −= cost`; `players = min(peak, players + round(peak × seasonBack))`; `stale=false`, `since=0`, `seasons++`, `seasonAt=S.round` (extra capacity in the coming step). `'skip'`: `stale=true`, `since=0`. `'eos'`: `endService(g.nr)`. Then `afterRandom()` (crisis on negative budget, else `goMonth()`).
- **End of Service** (`endService(nr,auto=false)`): `status='eos'`; unless `auto`: `C.studio.fame −= eosFame` (clamped ≥ 0); hall `live.on=false`; log line when `S` exists. Possible from the season screen and from the live tab at any time.
- **Money flow:** in `monthEnd`, after the cost lines: `lt=liveTick(stepMonths(S.round))`, `S.res.budget += lt.net`, `S.liveNet += lt.net`, notes appended, `S.month.live = lt.net`. In `finishGame`: `e.capital = S.start + S.einlage + S.investIn + (S.liveNet||0)`. In `runEngineProject`: `C.studio.kasse += liveTick(months).net`.
- **Copy:** season screen title „Season für „${title}“?“; options „🎉 Season starten · ${money(cost)}“ / „⏭️ Diesmal auslassen“ / „🔌 End of Service“ with the details listed in Task 4. Live tab „📡 Live-Betrieb (${n})“.

## Review Focus

1. **Old save with the Abo model** (running project, end screen, or setup draft): it loads as Kaufspiel + Premium-Abo, nothing reads `MODELS.abo`, a saved `gmod:'live'` becomes `null`, and `C.live` exists as `[]`. → test in Task 5.
2. **Live costs drive the cash below zero mid-project:** the tick runs before the budget check, so the crisis screen opens as usual; a season bought on low cash also opens the crisis. → tests in Task 3 and Task 4.
3. **Project result stays honest:** income from other live games changes the cash (`kasseEnd`) but not `e.erg`, the verdict, taxes or bonuses of the project being released. → test in Task 3.
4. **Several live games and a season step:** shares add up, are capped at 60 %, a contract step still yields 0 points, and the season's extra share applies only to the coming step. → test in Task 3 and Task 4.
5. **Reload on the season screen:** a save on `screen:'season'` comes back on the season screen while a season is due, otherwise on `'event'`. → test in Task 5.

---

### Task 1: Business models, Premium-Abo extra and model tags

**Files:**
- Create: `js/live.js` (constants, `hasPremium`, `modelTags`, `liveFit`)
- Modify: `js/data.js` (`MODELS`, `PROJECT_EXTRAS`, `GENRE_MODS`, fit tags), `js/features.js` (`EXTRA_FEATS.premium`), `js/events.js` (model tags), `js/content-extra.js` („Abo-Müdigkeit“ cond), `js/game.js` (`fits` ~line 368, `isMultiplayer` ~line 100, `monthLines` ~lines 754/764, `startGame` extras filter ~line 382), `index.html`, `sw.js` (`w100-v11`), `tests/harness.js`
- Test: `tests/live.test.js` (new)

**Interfaces:**
- Produces: `LIVE`, `LIVE_SYN`, `LIVE_CLASH`; `hasPremium(s=S) -> boolean` (`(s.extras||[]).includes('premium')`); `modelTags(s=S) -> string[]`; `liveFit(genre:string, sub:string|null) -> 'syn'|'clash'|null` (matches `genre` or `genre.sub` against the lists). `startGame` drops `premium` when `o.model` is not in `PROJECT_EXTRAS.premium.models`.

- [ ] **Step 1: Write the failing tests**

```js
const test=require('node:test'),assert=require('node:assert/strict');
const {load,newProject}=require('./harness');
test('models are kauf, f2p, live; no abo model, no live genre mod',()=>{const {run}=load();
  assert.deepEqual(run('Object.keys(MODELS)'),['kauf','f2p','live']);
  assert.equal(run('GENRE_MODS.live'),undefined);assert.equal(run('GENRES.rpg.subs.mmorpg.fit'),'live');
  assert.equal(run(`Object.values(GENRES).flatMap(g=>[g.fit,...Object.values(g.subs).map(s=>s.fit)]).filter(f=>f&&!MODELS[f]).length`),0);});
test('premium only with kauf or live',()=>{const {run}=load();
  newProject(run,{model:'f2p',extras:['premium']});assert.equal(run('hasPremium()'),false);
  newProject(run,{model:'live',extras:['premium']});assert.equal(run('hasPremium()'),true);});
test('premium counts as abo tag for cards',()=>{const {run}=load();
  newProject(run,{extras:['premium']});assert.deepEqual(run('modelTags()'),['kauf','abo']);assert.equal(run(`fits({models:['abo']})`),true);
  newProject(run);assert.equal(run(`fits({models:['abo']})`),false);
  newProject(run,{model:'live'});assert.equal(run(`fits({models:['live','abo','f2p']})`),true);});
test('every card model tag is known and live has cards',()=>{const {run}=load();
  assert.equal(run(`[...E,...R].flatMap(c=>c.models||[]).filter(m=>!['kauf','f2p','live','abo'].includes(m)).length`),0);
  assert.ok(run(`E.filter(c=>(c.models||[]).includes('live')).length`)>=4);});
test('beta servers for live and premium only',()=>{const {run}=load();
  const srv=o=>{newProject(run,o);run(`S.round=stepIndex('prod_beta')`);return run(`monthLines().some(([c])=>c==='server')`)};
  assert.equal(srv({}),false);assert.equal(srv({extras:['premium']}),true);assert.equal(srv({model:'live'}),true);});
test('live fit and multiplayer',()=>{const {run}=load();
  assert.equal(run(`liveFit('rpg','mmorpg')`),'syn');assert.equal(run(`liveFit('action','fps')`),'syn');
  assert.equal(run(`liveFit('adventure','pnc')`),'clash');assert.equal(run(`liveFit('sim','cozy')`),null);
  assert.equal(run(`isMultiplayer({model:'live',extras:[]})`),true);});
test('premium has an extra feature',()=>{const {run}=load();newProject(run,{extras:['premium']});
  run(`S.round=stepIndex('prod_plan')`);assert.ok(run(`featCandidates().some(f=>f.id==='x_premium'&&f.planned)`));});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test`
Expected: FAIL in `tests/live.test.js` (`hasPremium is not defined`, `MODELS` keys differ).

- [ ] **Step 3: Implement**

Create `js/live.js` with the constants and the three helpers; register it in `index.html`, `sw.js` (bump cache to `w100-v11`) and `tests/harness.js`. Apply the data changes and event tags from „Numbers and copy“. In `fits`: `(!c.models||c.models.some(m=>modelTags(S).includes(m)))`. In `isMultiplayer`: replace `['live','party'].includes(s.gmod)` by `s.gmod==='party'||s.model==='live'`. In `monthLines`: server condition as above, delete the `GENRE_MODS[S.gmod]?.monthly` line. In `startGame`: filter `extras` by `PROJECT_EXTRAS[k].models` when present.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test`
Expected: all tests PASS (existing suites included; fix any existing test that referenced `abo` or `gmod:'live'` by switching it to `extras:['premium']` / `model:'live'`).

- [ ] **Step 5: Commit**

```bash
git add js/live.js js/data.js js/features.js js/events.js js/content-extra.js js/game.js index.html sw.js tests/harness.js tests/live.test.js
git commit -m "feat: live service model and premium subscription extra"
```

---

### Task 2: Release revenue and entering live ops

**Files:**
- Modify: `js/live.js` (`modelRevenue`, `liveAdd`), `js/game.js` (`sales` model branches ~lines 1597–1608, `finishGame` ~lines 1714–1718 and after the `C.hall.push`), `js/storage.js` (`normalizeCareer`: `if(!Array.isArray(c.live))c.live=[]`)
- Test: `tests/live.test.js`

**Interfaces:**
- Consumes: `hasPremium`, `liveFit`, `LIVE` (Task 1).
- Produces: `modelRevenue(units:number, price:number) -> {units:number, rev:number, detail:[string,string][]}` for `S.model` `kauf`/`live`; `liveAdd(e) -> object|null` (pushes the live entry into `C.live`, returns it, `null` for plain Kaufspiel/F2P); `C.live` always an array (created lazily in `liveAdd` and in `normalizeCareer`); `e.liveG` = the new entry (for the end screen).

- [ ] **Step 1: Write the failing tests**

```js
test('release revenue per model',()=>{const {run}=load();
  newProject(run);assert.equal(run('modelRevenue(1000,20).rev'),12);
  newProject(run,{extras:['premium']});assert.equal(run('modelRevenue(1000,20).units'),900);
  newProject(run,{model:'live'});assert.equal(run('modelRevenue(1000,20).units'),850);
  newProject(run,{model:'live',extras:['premium']});assert.equal(run('modelRevenue(1000,20).units'),765);});
test('live service and premium games enter live ops',()=>{const {run}=load();
  newProject(run,{model:'live',genre:'rpg',subGenre:'mmorpg'});run(`C.hall.push({nr:1});S.end={units:10000,meta:80,user:8}`);
  const g=run('liveAdd(S.end)');assert.equal(g.players,10000);assert.equal(g.fit,'syn');assert.equal(g.status,'on');
  assert.equal(run('C.live.length'),1);assert.equal(run('C.hall[0].live.on'),true);
  newProject(run,{extras:['premium']});run(`C.hall.push({nr:2});S.end={units:10000,meta:70,user:7}`);
  assert.equal(run('liveAdd(S.end).players'),5000);
  newProject(run);run(`S.end={units:10000,meta:70,user:7}`);assert.equal(run('liveAdd(S.end)'),null);});
test('f2p keeps the first server year, live does not',()=>{const {run}=load();
  for(const [model,exp] of [['f2p',36],['live',0]]){newProject(run,{model});
    run(`S.end={meta:70,user:7,net:100,merch:0,engRoyalty:0,units:1000,awards:[]};finishGame()`);assert.equal(run('S.end.live'),exp);}});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test`
Expected: FAIL (`modelRevenue is not defined`).

- [ ] **Step 3: Implement**

`sales()`: replace the `kauf` and `abo` branches by one call to `modelRevenue(units,price)` for `kauf`/`live` (sets `e.units`, `rev`, `detail`); keep the F2P branch. Detail rows: `['Verkaufte Exemplare',…]`, `['Preis',…]`, `['Umsatz netto (60 % nach Plattform und Steuern)',…]`, plus `['Premium-Abo','−10 % Verkäufe, Abo-Einnahmen im Live-Betrieb']` with premium and `['Live Service','Launch ×0,85, danach laufende Einnahmen im Live-Betrieb']` for `live`. `finishGame()`: `e.live=S.model==='f2p'?36*t.scale:0`; after `C.hall.push(...)`: `e.liveG=liveAdd(e)`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add js/live.js js/game.js js/storage.js tests/live.test.js
git commit -m "feat: release revenue for live service and premium, games enter live ops"
```

---

### Task 3: Monthly live tick, capacity share and money flow

**Files:**
- Modify: `js/live.js` (`liveChurn`, `liveMonthly`, `liveTick`, `liveCapShare`, `liveSync`), `js/sprint.js` (`sprintCapacity`), `js/game.js` (`monthEnd` after the cost lines ~line 957 and `S.month` ~line 1066; `finishGame` `e.capital`; `runEngineProject` before `advanceCalendar`; `startGame` S literal `liveNet:0` and `C.live?.forEach(g=>g.seasonAt=null)`)
- Test: `tests/live.test.js`

**Interfaces:**
- Consumes: `C.live`, `liveAdd` (Task 2).
- Produces: `liveChurn(g) -> number`; `liveMonthly(g) -> {rev,cost,net}` (k€/month); `liveTick(months:number) -> {net:number, notes:string[]}`; `liveCapShare(s=S) -> number` (0…`capMax`); `liveOn() -> object[]` (games with `status==='on'`); `S.liveNet` (k€); `S.month.live` (net of the step).

- [ ] **Step 1: Write the failing tests**

```js
const liveGame=(o={})=>`C.live=[{nr:1,title:'L',tier:'indie',scale:1,model:'live',premium:false,players:20000,peak:20000,meta:70,user:7,fit:null,months:0,since:0,stale:false,seasons:0,seasonAt:null,net:0,status:'on',...${JSON.stringify(o)}}]`;
test('churn reacts to stale, fit and rating',()=>{const {run}=load();newProject(run);run(liveGame());
  assert.equal(run('liveChurn(C.live[0])'),0.08);run('C.live[0].stale=true');assert.ok(Math.abs(run('liveChurn(C.live[0])')-0.14)<1e-9);
  run(`C.live[0].stale=false;C.live[0].fit='syn';C.live[0].meta=90`);assert.ok(Math.abs(run('liveChurn(C.live[0])')-0.03)<1e-9);});
test('monthly money for live and premium',()=>{const {run}=load();newProject(run);run(liveGame());
  const m=run('liveMonthly(C.live[0])');assert.ok(Math.abs(m.rev-16.8)<1e-9);assert.ok(Math.abs(m.cost-2)<1e-9);
  run(`C.live[0].model='kauf';C.live[0].premium=true`);assert.ok(Math.abs(run('liveMonthly(C.live[0]).rev')-36.372)<1e-6);});
test('tick shrinks players, books money and ends unprofitable games',()=>{const {run}=load();newProject(run);run(liveGame());
  const r=run('liveTick(2)');assert.ok(r.net>0);assert.equal(run('C.live[0].players'),Math.round(Math.round(20000*.92)*.92));
  assert.equal(run('C.live[0].since'),2);
  run(`C.live[0].players=500;C.studio.fame=10`);const r2=run('liveTick(1)');assert.equal(run('C.live[0].status'),'eos');
  assert.equal(run('C.studio.fame'),10);assert.match(r2.notes[0],/Automatisches End of Service/);});
test('capacity share adds up and is capped',()=>{const {run}=load();newProject(run);run(liveGame({premium:true}));
  assert.ok(Math.abs(run('liveCapShare()')-0.2)<1e-9);
  const before=run('sprintCapacity().total');run('C.live=[]');assert.ok(run('sprintCapacity().total')>before);
  run(liveGame());run('for(let i=0;i<9;i++)C.live.push({...C.live[0],nr:i+2})');assert.equal(run('liveCapShare()'),0.6);
  run('S.contractStep=S.round');assert.equal(run('sprintCapacity().total'),0);});
test('monthEnd books live net into budget and liveNet, crisis on negative cash',()=>{const {run}=load();newProject(run);run(liveGame());
  run(`Math.random=()=>0.999;S.res.budget=1e6;monthEnd()`);assert.ok(run('S.liveNet')>0);assert.equal(run('S.month.live'),run('S.liveNet'));
  newProject(run);run(liveGame({players:3000,premium:true,model:'kauf'}));run(`S.res.budget=0.1;Math.random=()=>0.999;monthEnd()`);
  assert.equal(run('S.screen'),'crisis');});
test('live income of other games is not project profit',()=>{const {run}=load();newProject(run);
  run(`S.liveNet=50;S.end={meta:70,user:7,net:100,merch:0,engRoyalty:0,units:1000,awards:[]};finishGame()`);
  assert.equal(run('S.end.capital'),run('S.start+S.einlage+S.investIn+50'));});
```

(In the second `monthEnd` case the step costs alone push the budget below zero; the test pins that the live tick runs before the budget check and does not swallow the crisis.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test`
Expected: FAIL (`liveChurn is not defined`).

- [ ] **Step 3: Implement**

Formulas from „Numbers and copy“. `sprintCapacity`: compute `gross0=base×Πparts`; if not a contract step and `liveCapShare(s)>0`, push `{n:'Live-Betrieb',pts:gross0×share}`. `liveSync(g)` writes `{months,net,seasons,on}` into the hall entry with `nr===g.nr`. `monthEnd`: tick right after `S.res.budget-=sum` (before the budget check at the end), log `📡 Live-Betrieb ${money(net,true)}` in the step log line when non-zero, `S.month.live=lt.net`. `runEngineProject`: `C.studio.kasse+=liveTick(months).net` before `advanceCalendar`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add js/live.js js/sprint.js js/game.js tests/live.test.js
git commit -m "feat: monthly live ops tick, capacity share and live money flow"
```

---

### Task 4: Seasons and End of Service

**Files:**
- Modify: `js/live.js` (`seasonDue`, `openSeason`, `seasonCost`, `decideSeason`, `endService`), `js/game.js` (`afterMonth`: after the legend block, before `fairDue()`)
- Test: `tests/live.test.js`

**Interfaces:**
- Consumes: `liveOn`, `liveSync`, `liveCapShare` (Task 3).
- Produces: `seasonDue(s=S, c=C) -> object|null` (the due game); `openSeason() -> boolean` (sets `S.season=g.nr`, `S.screen='season'`, render, save); `seasonCost(g) -> number` (k€); `decideSeason(choice:'run'|'skip'|'eos') -> void`; `endService(nr:number, auto=false) -> boolean`.

- [ ] **Step 1: Write the failing tests**

```js
test('season due after six months, screen opens from afterMonth',()=>{const {run}=load();newProject(run);run(liveGame({since:5}));
  assert.equal(run('seasonDue()'),null);run('C.live[0].since=6');assert.equal(run('seasonDue().nr'),1);
  run(`S.round=3;Math.random=()=>0.999;afterMonth()`);assert.equal(run('S.screen'),'season');assert.equal(run('S.season'),1);});
test('running a season costs money, brings players back, adds capacity load for one step',()=>{const {run}=load();newProject(run);
  run(liveGame({since:6,players:10000}));run('S.res.budget=1000;openSeason()');const cap=run('liveCapShare()');
  run(`decideSeason('run')`);assert.equal(run('S.res.budget'),988);assert.equal(run('S.liveNet'),-12);
  assert.equal(run('C.live[0].players'),16000);assert.equal(run('C.live[0].since'),0);assert.equal(run('C.live[0].seasons'),1);
  assert.ok(Math.abs(run('liveCapShare()')-cap-0.15)<1e-9);run('liveTick(1)');assert.equal(run('C.live[0].seasonAt'),null);});
test('skipping makes the game stale until the next season',()=>{const {run}=load();newProject(run);run(liveGame({since:6}));
  run(`openSeason();decideSeason('skip')`);assert.equal(run('C.live[0].stale'),true);assert.equal(run('C.live[0].since'),0);
  run(`C.live[0].since=6;openSeason();S.res.budget=1000;decideSeason('run')`);assert.equal(run('C.live[0].stale'),false);});
test('end of service costs fame and frees capacity',()=>{const {run}=load();newProject(run);run(liveGame({since:6}));
  run(`C.hall.push({nr:1,live:{on:true}});C.studio.fame=10;openSeason();decideSeason('eos')`);
  assert.equal(run('C.live[0].status'),'eos');assert.equal(run('C.studio.fame'),8);assert.equal(run('liveCapShare()'),0);
  assert.equal(run('C.hall[0].live.on'),false);assert.equal(run('endService(1)'),false);});
test('a season on low cash opens the crisis',()=>{const {run}=load();newProject(run);run(liveGame({since:6}));
  run(`S.res.budget=5;openSeason();decideSeason('run')`);assert.equal(run('S.screen'),'crisis');});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test`
Expected: FAIL (`seasonDue is not defined`).

- [ ] **Step 3: Implement**

Rules from „Numbers and copy“. `decideSeason` reads the game via `S.season`, ignores unknown or no-longer-`on` games (then just `afterRandom()`), clears `S.season`, logs `📡 Season für „${title}“ gestartet` / `ausgelassen`, and ends with `afterRandom()`. `endService` returns `false` for unknown or already ended games; when `S` exists it logs `🔌 End of Service: „${title}“`. In `afterMonth`: `if(seasonDue()&&openSeason())return;`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add js/live.js js/game.js tests/live.test.js
git commit -m "feat: seasons and end of service for live games"
```

---

### Task 5: Save migration

**Files:**
- Modify: `js/storage.js` (`normalizeCareer`, `normalizeProject` – both the finished-legacy branch and the running branch), `js/ui.js` (`ensureSetupDraft`: unknown `setupDraft.model` → `'kauf'`)
- Test: `tests/storage.test.js`

**Interfaces:**
- Consumes: `seasonDue(s,c)` (Task 4), `PROJECT_EXTRAS.premium` (Task 1).
- Produces: `migrateModel(s) -> void` in `js/storage.js` (`abo` → `kauf` + `premium` in `s.extras`; `gmod:'live'` → `null`; `liveNet` default `0`), called for every loaded `S`.

- [ ] **Step 1: Write the failing tests**

```js
test('abo project loads as kauf with premium, live mod dropped',()=>{const {run}=load();newProject(run);
  run(`S.model='abo';S.gmod='live';delete S.liveNet;S=normalizeProject(S,C)`);
  assert.equal(run('S.model'),'kauf');assert.ok(run('S.extras').includes('premium'));assert.equal(run('S.gmod'),null);assert.equal(run('S.liveNet'),0);});
test('career without live list gets one',()=>{const {run}=load();newProject(run);
  run('delete C.live;C=normalizeCareer(C)');assert.deepEqual(run('C.live'),[]);});
test('season screen survives reload only while due',()=>{const {run}=load();newProject(run);
  run(`C.live=[{nr:1,title:'L',scale:1,model:'live',premium:false,players:9000,peak:9000,meta:70,fit:null,months:6,since:6,stale:false,seasons:0,seasonAt:null,net:0,status:'on'}];S.screen='season';S.season=1`);
  assert.equal(run('normalizeProject(S,C).screen'),'season');
  run(`C.live[0].since=0`);assert.equal(run('normalizeProject(S,C).screen'),'event');});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test`
Expected: FAIL (`S.model` still `'abo'`).

- [ ] **Step 3: Implement**

`migrateModel(s)` runs at the start of both branches of `normalizeProject` that keep `s`. `normalizeCareer`: `C.live` default `[]`. Running branch: `if(s.screen==='season'&&!seasonDue(s,c))s.screen='event'` before the existing `screen==='event'` re-routing.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add js/storage.js js/ui.js tests/storage.test.js
git commit -m "feat: migrate abo saves to premium extra and add live list"
```

---

### Task 6: UI – wizard, season screen, live tab and notes

**Files:**
- Modify: `js/ui.js` (setup step 4 extras ~lines 2110–2135 and handlers ~2204–2212; `ACTIVE` line 9 + router near line 1394: `'season'` → `renderSeason(m)`; `renderSeason` next to `renderShip`; ws nav ~line 867: tab `live` + `renderLiveView(m)` routed near line 1366; `sprintBar` note; `monthNote` `M.live`; ledger ~lines 1682–1689; `renderEnd` live alert), `js/storage.js` (`generateChronicleText`: `| Live: ${months} Mon., ${money(net,true)}`), `css/*` only if a new class is needed (reuse `.big-decision`, `.opts`, `.opt`, `.alert`, `.mini`)
- Test: `tests/ui.test.js`

**Interfaces:**
- Consumes: everything from Tasks 1–4.
- Produces: `renderSeason(m)`, `renderLiveView(m)`; the wizard keeps `setupDraft.extras` free of `premium` while the model is `f2p`.

Screen contents:
- **Wizard:** the Premium-Abo checkbox is `disabled` with note „Nur mit Kaufspiel oder Live Service“ while `setupDraft.model==='f2p'`; switching the model to `f2p` removes `premium` from `setupDraft.extras`.
- **Season screen** (`m.className='card big-decision'`): label „📡 Live-Betrieb“, title „Season für „${title}“?“, note `${nf(players,0)} Spieler (Spitze ${nf(peak,0)}) · ${money(liveMonthly(g).net,true)}/Monat · seit ${nf(since,0)} Monaten ohne neue Inhalte`. Buttons `#seasonRun` „🎉 Season starten · ${money(seasonCost(g))}“ (d: „+${nf(back,0)} Spieler zurück · nächster Schritt −15 % Team-Kapazität“), `#seasonSkip` „⏭️ Diesmal auslassen“ (d: „Spart Geld, aber Spieler wandern schneller ab.“), `#seasonEos` „🔌 End of Service“ (d: „Server aus, Kapazität frei · −2 Fame“).
- **Live tab** (only when `C.live` has entries; badge = number of `on` games): one card per `on` game with model label (`Live Service`, `Premium-Abo` or both), players / peak, `money(net,true)` per month, capacity share in %, „nächste Season in X Monaten“ or „Season fällig“, „⚠️ ohne neue Inhalte“ when stale, a `[data-eos="nr"]` button „🔌 End of Service“ (confirm via `confirm()` when available, then `endService(nr)`; render, save). Ended games in a `<details class="fold">` „Beendete Live-Spiele“ with months, seasons and total net.
- **Sprint bar:** when `liveCapShare()>0`: `<div class="note">📡 Live-Betrieb bindet ${Math.round(share*100)} % des Teams</div>` (desktop and phone variants).
- **Step note:** `monthNote` appends `· 📡 ${money(M.live,true)} Live-Betrieb` when `M.live`.
- **Ledger:** row „Live-Betrieb anderer Spiele (zählt nicht zum Projektergebnis)“ with `money(S.liveNet,true)` when non-zero; F2P server label „(inkl. erstem Server-Jahr)“.
- **End screen:** with `e.liveG`: `<div class="alert mid"><b>📡 Geht in den Live-Betrieb</b><span>${nf(players,0)} Spieler · ca. ${money(net,true)}/Monat · bindet ${pct} % des Teams. Alle ${LIVE.seasonEvery} Monate steht eine Season an.</span></div>`.

- [ ] **Step 1: Write the failing tests**

```js
const liveC=`C.live=[{nr:1,title:'Raid Nacht',scale:1,model:'live',premium:true,players:9000,peak:12000,meta:70,fit:null,months:6,since:6,stale:true,seasons:0,seasonAt:null,net:40,status:'on'}]`;
test('season screen shows three choices',()=>{const {run}=load({ui:true});newProject(run);run(liveC+`;S.season=1;S.screen='season'`);
  const h=run(`(()=>{const m={innerHTML:'',className:''};renderSeason(m);return m.innerHTML})()`);
  assert.match(h,/Raid Nacht/);assert.match(h,/id="seasonRun"/);assert.match(h,/id="seasonSkip"/);assert.match(h,/id="seasonEos"/);
  assert.ok(run(`ACTIVE.includes('season')`));});
test('live tab lists running games with end of service',()=>{const {run}=load({ui:true});newProject(run);run(liveC);
  const h=run(`(()=>{const m={innerHTML:'',className:''};renderLiveView(m);return m.innerHTML})()`);
  assert.match(h,/Raid Nacht/);assert.match(h,/data-eos="1"/);assert.match(h,/ohne neue Inhalte/);});
test('sprint bar and step note mention live ops',()=>{const {run}=load({ui:true});newProject(run);run(liveC);
  assert.match(run('sprintBar()'),/Live-Betrieb bindet 20 %/);
  run(`S.round=1;S.month={sum:1,pc:[],n:1,done:0,wl:0,notes:[],live:3.5}`);assert.match(run('monthNote()'),/Live-Betrieb/);});
test('wizard drops premium for free-to-play',()=>{const {run}=load({ui:true});run(CAREER);
  run(`ensureSetupDraft();setupDraft.extras=['premium'];setupDraft.model='f2p';setupModel('f2p')`);assert.deepEqual(run('setupDraft.extras'),[]);});
```

(`setupModel(k)` is the small helper the model radio handler calls: sets `setupDraft.model=k` and removes extras whose `models` exclude `k`. Import `CAREER` from the harness in this test file if not yet imported.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test`
Expected: FAIL (`renderSeason is not defined`).

- [ ] **Step 3: Implement the screens and notes as listed above**

Bind handlers with `$()` or `m.querySelectorAll?.(…)` (as in the concept screen), so the tests' plain `{innerHTML,className}` object renders without errors.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test`
Expected: all PASS.

- [ ] **Step 5: Check in the browser**

Start preview `game`, open `http://127.0.0.1:8123` (separate localStorage origin – the user's „Pixelpott Studios“ profile on localhost stays untouched). Start an Indie Live-Service game with Premium-Abo, play to release (fast clicks), check the end-screen alert, start the next project, verify: sprint bar note, step note with live money, season screen after ~6 months, live tab with End of Service, phone width 375 px without horizontal scroll. No console errors.

- [ ] **Step 6: Commit**

```bash
git add js/ui.js js/storage.js tests/ui.test.js
git commit -m "feat(ui): season decision, live ops tab and live notes"
```

---

### Task 7: Docs

**Files:**
- Modify: `README.md` (Highlights: models Kaufspiel / Free-to-Play / Live Service, Premium-Abo extra, Live-Betrieb with seasons and End of Service), `ROADMAP.md` (stage 5 done, knobs `LIVE` to tune after playtest)

- [ ] **Step 1: Update both files in German, short and in the existing style**

- [ ] **Step 2: Run the full suite once more**

Run: `node --test`
Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add README.md ROADMAP.md
git commit -m "docs: describe live service, premium subscription and live ops (stage 5)"
```
