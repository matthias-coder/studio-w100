# Etappe 1: Schrittmodell & Entwicklungsdauer – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed 12-month round loop with 13 phase steps across 5 new phases, with a selectable project duration per tier (Indie 12–24, AA 24–48, AAA 60–84 months), balance-neutral at the "normal" duration.

**Architecture:** A new `js/schedule.js` owns the step table and all time math. `S.round` stays the round counter, but it now means the *step index* (0–12). Each step has a weight `w = 12 × share/100 × dur/ref`, so the weights of one project add up to exactly 12 at the reference ("normal") duration. `monthEnd()` multiplies every per-month quantity by `w`: costs, accumulators, wishlists, income and the time buffer. Old content-phase indices (`E[].p`, `SHOP[].min`, `R[].min`, values 0–5) stay untouched and are reached through each step's `cp` field.

**Tech Stack:** Vanilla JS (browser globals, no build), Node 24 `node:test` + `vm` for logic tests, Python `http.server` preview (`.claude/launch.json` → `game`, port 8123).

**Spec:** `docs/superpowers/specs/2026-11-04-phasen-erlebnis-design.md` (sections 3, 9, 10.1, 12)

**Scope of this plan (Etappe 1 only):** step model, phases, duration choice, calendar counter, removal of every 12-month assumption, relocation of mandatory cards and event cards, save migration. **Not in scope:** sprint/capacity (Etappe 2), funders/pitch content (3), moving genre out of the wizard and the phase activities (4), business models/live ops (5), prototype lab (6), platforms (7). The Pitch steps reuse Konzept cards (`cp:0`) until Etappe 3 adds pitch cards.

## Global Constraints

- In-game text German, code/identifiers/commits English.
- No build step, no npm dependencies; tests run with `node --test tests/`.
- Careers (`C`) must survive every save migration; a running legacy project is aborted, and its remaining budget is refunded into `C.studio.kasse` (spec §12).
- Balance-neutral at the `normal` duration: one project's weights add up to exactly 12, the same number of "budget months" as today.
- Desktop, tablet and smartphone layouts keep working (existing responsive CSS, no new fixed widths).
- `sw.js` must precache every JS file, and its cache name must change whenever the file list changes.

## Review Focus

1. **Indie "Kurz" (12 months, 13 steps):** steps shorter than a month must be labelled in weeks, never "0 Monate", and every weight must be > 0. → test in Task 1.
2. **Legacy save with a running project:** loading must not crash, must refund the budget, and must show a one-time notice. The profile list (`ui.js:1918`) must cope with `S=null`. → test in Task 5.
3. **Thin card pools:** with `fits()` filtering (e.g. `f2p`, `aaa`), the 4 steps on `cp:0` can run out of cards. The deck must never contain `undefined`. → test in Task 2.
4. **Publisher signed late:** a publisher signed after `prod_beta` gets no milestone check (and no crash). One signed at or before `prod_fp` is checked at the end of `prod_fp`. → test in Task 3.
5. **Budget crisis mid-project:** after `openCrisis('month')` → `afterMonth()`, the game must resume at the right step, and launch exactly when `S.round>=STEPS.length`. Long AAA (84 months) must not drain the time buffer without delays. → test in Task 3.

---

### Task 1: Schedule module + test harness

**Files:**
- Create: `js/schedule.js`
- Create: `tests/harness.js`
- Create: `tests/schedule.test.js`
- Modify: `js/data.js:3` (delete old `PHASES`), `js/data.js:46-50` (add `dur` to each tier)
- Modify: `index.html:72-73` (load `js/schedule.js` right after `js/data.js`)
- Modify: `sw.js:4` (`CACHE='w100-v2'`), `sw.js:10-15` (add `'js/schedule.js'`)

**Interfaces:**
- Produces (globals in `js/schedule.js`):
  - `PHASES: string[]` = `['Konzept','Pitch & Finanzierung','Pre-Production','Production','Polish, QA & Release']`
  - `CP_TO_PHASE: number[]` = `[0,2,3,3,4,4]` (old content phase → new phase index, for display only)
  - `DUR_KEYS = ['short','normal','long']`, `DUR_LABELS = {short:'Kurz',normal:'Normal',long:'Lang'}`
  - `STEPS: {id,ph,cp,n,share,hire?,mkt?,ea?,live?}[]` (table below)
  - `stepIndex(id:string): number` (−1 if unknown)
  - `durMonths(tier:string, durKey:string): number` → `TIERS[tier].dur[DUR_KEYS.indexOf(durKey)]`, falls back to the `normal` value
  - `refMonths(tier:string): number` → `TIERS[tier].dur[1]`
  - `stepMonths(i:number, s=S): number` → `s.dur*STEPS[i].share/100` (float)
  - `stepW(i=S.round, s=S): number` → `12*STEPS[i].share/100*s.dur/refMonths(s.tier)`
  - `totalW(s=S): number` → sum of `stepW` over all steps
  - `curStep(s=S)` → `STEPS[Math.min(s.round,STEPS.length-1)]`
  - `stepFlag(flag:string, i=S.round): boolean` → `!!STEPS[i]?.[flag]`
  - `costPerMonth(): number` → `monthSum()*12/refMonths(S.tier)` (real calendar month)
  - `stepCost(i=S.round): number` → `monthSum()*stepW(i)`
  - `monthsDone(s=S): number`, `monthsLeft(s=S): number` (sum of `stepMonths` before / from `s.round`)
  - `fmtSpan(m:number): string` → `m<1` → `"${Math.max(1,Math.round(m*4.3))} Wochen"`, otherwise `"${nf(m,m<10?1:0)} Monate"` (`"1 Monat"` when it rounds to 1)
  - `stepTag(i=S.round): string` → `"R${i+1}"` (log prefix, replaces `M${…}`)
  - `stepLabel(i=S.round): string` → `"${PHASES[st.ph]} · ${st.n} · Schritt ${i+1}/${STEPS.length} · ${fmtSpan(stepMonths(i))}"`
- `TIERS[k].dur`: indie `[12,18,24]`, aa `[24,36,48]`, aaa `[60,72,84]`

**Step table (exact values; shares add up to 100):**

| id | ph | cp | n | share | flags |
|---|---|---|---|---|---|
| con_ideas | 0 | 0 | Ideen sammeln | 4 | hire |
| con_lock | 0 | 0 | Konzept festlegen | 4 | |
| pit_meet | 1 | 0 | Pitch-Termine | 3 | |
| pit_mix | 1 | 0 | Finanzierung steht | 3 | |
| pre_tech | 2 | 1 | Engine & Pipeline | 6 | hire |
| pre_proto | 2 | 1 | Prototyp-Schleife | 6 | |
| pre_slice | 2 | 1 | Vertical Slice | 6 | |
| prod_plan | 3 | 2 | Produktionsplanung | 13 | hire |
| prod_fp | 3 | 2 | Bis First Playable | 13 | |
| prod_alpha | 3 | 3 | Bis Alpha | 13 | mkt, ea |
| prod_beta | 3 | 3 | Bis Beta | 13 | mkt, ea, live |
| pol_bugs | 4 | 4 | Bug-Jagd | 8 | mkt, ea, live |
| pol_ship | 4 | 5 | Zertifizierung & Release | 8 | mkt, live |

(Flag shares were picked to match today: EA ≈ 34 % of the project (old: months 8–11), server ≈ 29 % (old: from month 9), wishlist boost ≈ 42 % (old: from month 7).)

- [ ] **Step 1: Write `tests/harness.js`**

```js
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..');
const FILES=['js/data.js','js/schedule.js','js/events.js','js/content-extra.js','js/storage.js','js/game.js'];
function el(){return {hidden:false,textContent:'',innerHTML:'',value:'',style:{},dataset:{},
  classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},
  querySelectorAll:()=>[],querySelector:()=>null,appendChild(){},setAttribute(){}}}
function load(){
  const store={};
  const ctx={console,setTimeout,clearTimeout,Buffer,
    localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},
    document:{getElementById:el,querySelectorAll:()=>[],querySelector:()=>null,createElement:el,body:el(),addEventListener(){}},
    location:{search:'',hash:'',href:'',pathname:'/'},history:{replaceState(){}},navigator:{},
    btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary')};
  ctx.window=ctx;vm.createContext(ctx);
  vm.runInContext('var render=()=>{},renderMain=()=>{},updateProfileButton=()=>{};',ctx);
  for(const f of FILES)vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
  const run=code=>vm.runInContext(code,ctx);
  return {ctx,run,store};
}
const CAREER=`C={studio:{name:'Test',fame:0,kasse:0,staff:[],exStaff:[],engine:null,salaryDrift:0,overheadDrift:0},
 dir:{id:'custom',n:'T',tag:'',d:'',s:{vision:1,technik:1,fuehrung:1,business:1,hype:1,polish:1},aff:{},perks:[],flaws:[],ab:null,fame:0,wealth:0,games:0,xp:0,perkUnlocked:false},
 hall:[],gameNo:0,unlockedChars:[]}`;
function newProject(run,o={}){
  run(CAREER);
  run(`startGame(${JSON.stringify({title:'T',genre:'rpg',subGenre:null,gmod:null,tier:'indie',model:'kauf',ip:'neu',extras:[],dur:'normal',...o})})`);
}
module.exports={load,newProject,CAREER};
```

If a script throws at load time because a browser global is missing, add a stub for it to `ctx`. Do not touch game code for this.

- [ ] **Step 2: Write `tests/schedule.test.js`**

```js
const test=require('node:test'),assert=require('node:assert');
const {load}=require('./harness');
test('step table: 13 steps, 5 phases, shares sum 100',()=>{const {run}=load();
  assert.equal(run('STEPS.length'),13);assert.equal(run('PHASES.length'),5);
  assert.equal(run('STEPS.reduce((a,s)=>a+s.share,0)'),100);
  assert.equal(run('new Set(STEPS.map(s=>s.id)).size'),13);});
test('weights sum to 12 at normal duration for every tier',()=>{const {run}=load();
  for(const t of ['indie','aa','aaa']){
    assert.ok(Math.abs(run(`totalW({tier:'${t}',dur:durMonths('${t}','normal'),round:0})`)-12)<1e-9);}});
test('long duration scales weights proportionally',()=>{const {run}=load();
  assert.ok(Math.abs(run(`totalW({tier:'aaa',dur:84,round:0})`)-14)<1e-9);});
test('indie short: all weights > 0, short steps labelled in weeks',()=>{const {run}=load();
  run(`S={tier:'indie',dur:durMonths('indie','short'),round:0}`);
  assert.equal(run('S.dur'),12);
  assert.ok(run('STEPS.every((s,i)=>stepW(i)>0)'));
  assert.match(run('fmtSpan(stepMonths(2))'),/Wochen/);
  assert.doesNotMatch(run('STEPS.map((s,i)=>fmtSpan(stepMonths(i))).join("|")'),/\b0 Monate/);});
test('stepIndex and flags',()=>{const {run}=load();
  assert.equal(run(`stepIndex('prod_fp')`),8);assert.equal(run(`stepIndex('nope')`),-1);
  assert.equal(run(`stepFlag('ea',stepIndex('prod_alpha'))`),true);
  assert.equal(run(`stepFlag('ea',stepIndex('pol_ship'))`),false);});
test('durMonths falls back to normal',()=>{const {run}=load();
  assert.equal(run(`durMonths('aa','bogus')`),36);});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `node --test tests/`
Expected: FAIL (`STEPS is not defined` / missing `js/schedule.js`)

- [ ] **Step 4: Implement `js/schedule.js`, add `TIERS[k].dur`, delete the old `PHASES` from `js/data.js`, wire up `index.html` and `sw.js`**

The old `PHASES` is still referenced as `PHASES[c.p]` / `PHASES[it.min]` in `ui.js`. Those calls are fixed in Task 6. Until then they show wrong names but do not crash.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test tests/`
Expected: PASS, 6 tests

- [ ] **Step 6: Commit**

```bash
git add js/schedule.js js/data.js index.html sw.js tests/
git commit -m "feat: add step schedule module and node test harness"
```

---

### Task 2: Project start on the step model

**Files:**
- Modify: `js/game.js:381` (`mandFor`), `js/game.js:384-494` (`startGame`), `js/game.js:496` (`goMonth`)
- Modify: `js/events.js:2` (`MAND_AT`)
- Test: `tests/project.test.js`

**Interfaces:**
- Consumes: `STEPS`, `stepIndex`, `durMonths`, `totalW`, `curStep` (Task 1)
- Produces:
  - `startGame(o)` accepts `o.dur` (`'short'|'normal'|'long'`, default `'normal'`) and sets `S.v=2`, `S.durKey`, `S.dur` (months), `S.res.zeit = totalW(S)+2`
  - `S.deck: number[]` of length `STEPS.length`, `S.deck[i]` is an index into `E`
  - `MAND_AT` keyed by step id: `{con_lock:['world'],pit_mix:['license'],pre_tech:['engine'],prod_plan:['cast','platform'],prod_beta:['lang','age'],pol_ship:['price','china']}`
  - `mandFor(i:number)` looks up `MAND_AT[STEPS[i]?.id]` (filters unchanged)

- [ ] **Step 1: Write `tests/project.test.js`**

```js
const test=require('node:test'),assert=require('node:assert');
const {load,newProject}=require('./harness');
test('new project uses step model',()=>{const {run}=load();newProject(run,{dur:'long'});
  assert.equal(run('S.v'),2);assert.equal(run('S.dur'),24);assert.equal(run('S.durKey'),'long');
  assert.equal(run('S.round'),0);
  assert.ok(Math.abs(run('S.res.zeit')-(run('totalW(S)')+2))<1e-9);});
test('deck has one valid card per step matching its content phase',()=>{const {run}=load();newProject(run);
  assert.equal(run('S.deck.length'),run('STEPS.length'));
  assert.ok(run('S.deck.every(i=>Number.isInteger(i)&&E[i])'));});
test('thin pools never yield undefined (f2p, aaa)',()=>{const {run}=load();
  for(let k=0;k<20;k++){newProject(run,{model:'f2p',tier:'aaa'});
    assert.ok(run('S.deck.every(i=>Number.isInteger(i)&&E[i])'));}});
test('mandatory cards keyed by step',()=>{const {run}=load();newProject(run);
  assert.deepEqual([...run('mandFor(0)')],[]);
  assert.deepEqual([...run(`mandFor(stepIndex('pre_tech'))`)],['engine']);
  assert.deepEqual([...run(`mandFor(stepIndex('prod_plan'))`)],['cast','platform']);});
test('missing dur defaults to normal',()=>{const {run}=load();newProject(run,{dur:undefined,tier:'indie'});
  assert.equal(run('S.dur'),18);});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/project.test.js`
Expected: FAIL (`S.v` undefined, deck length 12)

- [ ] **Step 3: Implement**

- `startGame`: set `v:2,durKey,dur` on `S`. Set `zeit` after `S` exists (`S.res.zeit=totalW(S)+2`).
- Replace the deck loop at `game.js:489`: for each step `i`, pick a random `E` index with `E[j].p===STEPS[i].cp && fits(E[j])` that is not already in `S.deck`. If none is left, allow repeats from the same `cp`. If that pool is empty too, take any card that fits from `cp+1`, then `cp-1`.
- Change `MAND_AT` and `mandFor` as in Interfaces.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/game.js js/events.js tests/project.test.js
git commit -m "feat: start projects on the step model with duration choice"
```

---

### Task 3: Step end, weighted economy, milestone and launch

**Files:**
- Modify: `js/game.js:337-349` (`ensureMilestone`), `js/game.js:351-357` (`startContract`), `js/game.js:556-560` (producer time save in `apply`), `js/game.js:727-771` (`monthLines` flag checks only, `runway`), `js/game.js:917-1035` (`monthEnd`), `js/game.js:1037-1078` (`afterMonth`)
- Test: `tests/stepend.test.js`

**Interfaces:**
- Consumes: `stepW`, `stepFlag`, `stepIndex`, `curStep`, `costPerMonth` (Task 1); `S.deck`, `S.dur` (Task 2)
- Produces:
  - `monthEnd()` keeps its name and its `S.month` summary (`{sum,pc,n,ea,lic,wl,notes}`) and now handles one step: `sum = monthSum()*w`, `S.res.zeit -= w`, `S.round++`
  - `S.milestone = {at:stepId, gp, gfx, reward, done}` (`month` replaced by `at`)
  - `runway(): number` = whole real months the budget covers: `Math.floor(S.res.budget/costPerMonth())`, `99` if the cost is 0
  - `curPhase(): number` = `curStep().ph` (replaces every `Math.floor(S.round/2)` used as a phase key)
  - `curCP(): number` = `curStep().cp` (replaces `Math.floor(S.round/2)` used against `R[].min` / `SHOP[].min`)

**Changes inside `monthEnd` (w = `stepW()` of the step being closed):**
- Costs: each `monthLines()` value × `w` (both for `S.spend` and for the budget).
- Every `acc(key, v, f)` call passes `v*w`.
- Calendar cadence: replace each `mNo%k===0` check with a tick counter `const tick=(key,v)=>{S.acc[key]=(S.acc[key]||0)+v;const n=Math.floor(S.acc[key]);S.acc[key]-=n;return n}`, called as `tick('t_diva3',w/3)`. The effect runs `n` times. This applies to diva (`/3`, `/4`), perfectionist (`/4`), salary loyalty (`/3`, `/4`) and low morale (`/2`).
- License income, EA income and wishlist gain are × `w`.
- EA condition: `S.ea && stepFlag('ea')`. Wishlist ×1.5: `stepFlag('mkt')`. In `monthLines`, server costs use `stepFlag('live')` and the genre-mod monthly cost (`game.js:755`) uses `stepFlag('live')`.
- Delay: chance `1-Math.pow(1-delayChance,w)`. The effect stays `add('zeit',-1)`.
- Milestone check runs before `S.round++`: `if(S.milestone&&!S.milestone.done&&STEPS[S.round].id===S.milestone.at)`. The body stays unchanged.
- `ensureMilestone`: `at = S.round<=stepIndex('prod_fp') ? 'prod_fp' : 'prod_beta'`, base target `+14` when `at==='prod_beta'`.
- `afterMonth`: launch when `S.round>=STEPS.length`. Legend `phaseStart` is `S.round<STEPS.length && STEPS[S.round].ph!==STEPS[S.round-1]?.ph`. The random pool uses `curCP()`. The interview gate stays `S.round>=2`.
- `startContract` and the producer save in `apply`: key by `curPhase()`.

- [ ] **Step 1: Write `tests/stepend.test.js`**

```js
const test=require('node:test'),assert=require('node:assert');
const {load,newProject}=require('./harness');
const noRandom=run=>run('Math.random=()=>0.999');
test('step cost equals monthSum × weight',()=>{const {run}=load();newProject(run);noRandom(run);
  const b0=run('S.res.budget'),cost=run('monthSum()*stepW(0)');
  run('monthEnd()');
  assert.ok(Math.abs(b0-run('S.res.budget')-cost)<0.2);assert.equal(run('S.round'),1);});
test('full normal project consumes exactly 12 time units',()=>{const {run}=load();newProject(run);noRandom(run);
  run('S.res.budget=1e9');const z0=run('S.res.zeit');
  for(let i=0;i<13;i++)run('monthEnd()');
  assert.ok(Math.abs(z0-run('S.res.zeit')-12)<1e-6);
  assert.equal(run('S.screen'),'launch');});
test('long AAA keeps 2 units of buffer without delays',()=>{const {run}=load();newProject(run,{tier:'aaa',dur:'long'});noRandom(run);
  run('S.res.budget=1e12');for(let i=0;i<13;i++)run('monthEnd()');
  assert.ok(Math.abs(run('S.res.zeit')-2)<1e-6);});
test('publisher early → milestone at prod_fp; late → none',()=>{const {run}=load();newProject(run);
  run('S.publisher=true;ensureMilestone()');assert.equal(run('S.milestone.at'),'prod_fp');
  newProject(run);run(`S.round=stepIndex('pol_bugs');S.publisher=true;ensureMilestone()`);
  assert.equal(run('S.milestone.at'),'prod_beta');
  noRandom(run);run('S.res.budget=1e9');run('monthEnd();monthEnd()');
  assert.equal(run('S.milestone.done'),false);});
test('milestone fires at end of prod_fp',()=>{const {run}=load();newProject(run);noRandom(run);
  run('S.res.budget=1e9;S.publisher=true;ensureMilestone()');
  for(let i=0;i<=8;i++)run('monthEnd()');
  assert.equal(run('S.milestone.done'),true);});
test('crisis path resumes at next step',()=>{const {run}=load();newProject(run);noRandom(run);
  run('S.res.budget=-1;monthEnd()');assert.equal(run('S.round'),1);
  run('S.res.budget=1e9;afterMonth()');assert.notEqual(run('S.screen'),'launch');});
test('runway in real months',()=>{const {run}=load();newProject(run);
  run('S.res.budget=costPerMonth()*5.5');assert.equal(run('runway()'),5);});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/stepend.test.js`
Expected: FAIL (no launch after 13 steps, `milestone.at` undefined)

- [ ] **Step 3: Implement the changes listed above**

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/game.js tests/stepend.test.js
git commit -m "feat: weight step end economy by step duration"
```

---

### Task 4: Calendar and engine aging at release

**Files:**
- Modify: `js/game.js:1622-1648` (engine aging inside `finishGame`), `js/game.js:295-332` (`runEngineProject`)
- Test: add to `tests/stepend.test.js`

**Interfaces:**
- Produces:
  - `advanceCalendar(months:number): void` → `C.months=(C.months||0)+months`. Called once in `finishGame()` with `S.dur`, and in `runEngineProject` with `months`.
  - `careerYear(): number` = `Math.floor((C.months||0)/12)+1`
  - `applyEngineAging(e:object): void`: the block at `game.js:1622-1648` moved verbatim out of `finishGame` (which now calls it at the same spot). Wherever it does `eng.age=(eng.age||0)+1`, it adds `S.dur>=48?2:1` instead (spec: longer projects age the engine more). The `eng.age=1` resets for new/upgrade stay unchanged.

- [ ] **Step 1: Add tests**

```js
const {CAREER}=require('./harness');
test('calendar and careerYear',()=>{const {run}=load();run(CAREER);
  assert.equal(run('careerYear()'),1);run('advanceCalendar(30)');assert.equal(run('careerYear()'),3);});
test('engine ages 1 for short, 2 for ≥48 months',()=>{const {run}=load();
  newProject(run,{tier:'indie',dur:'normal'});
  run(`C.studio.engine={name:'E',age:1,genres:[],modules:[],version:1,runs:1};S.engine='surreal';applyEngineAging({})`);
  assert.equal(run('C.studio.engine.age'),2);
  newProject(run,{tier:'aa',dur:'long'});
  run(`C.studio.engine={name:'E',age:1,genres:[],modules:[],version:1,runs:1};S.engine='surreal';applyEngineAging({})`);
  assert.equal(run('C.studio.engine.age'),3);});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/`
Expected: FAIL (`careerYear` undefined)

- [ ] **Step 3: Implement**

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/game.js tests/stepend.test.js
git commit -m "feat: career calendar and duration-based engine aging"
```

---

### Task 5: Save migration

**Files:**
- Modify: `js/storage.js:127-135` (`normalizeProject`), call sites `js/storage.js:157,177,215,228,247`, `js/storage.js:323` (chronicle line)
- Test: `tests/storage.test.js`

**Interfaces:**
- Produces: `normalizeProject(s, c): object|null`. If `s && s.v!==2`: add `Math.max(0, s.res?.budget||0)` to `c.studio.kasse` (when `c?.studio` exists), set `c.notice = 'Euer laufendes Projekt „<title>“ stammt aus einer älteren Version und wurde beendet. Das Restbudget (<money>) ist zurück in der Studiokasse.'` and return `null`. All existing normalization stays for `v===2`.
- Every call site passes the matching career: the already-normalized `old.C`, `C`, `target.C`, `initialC`, `profiles[0].C`. Normalize `C` before `S` at each site.
- Chronicle line: `**Schritt:** ${S.round+1}/${STEPS.length} (${PHASES[curStep(S).ph]})`.

- [ ] **Step 1: Write `tests/storage.test.js`**

```js
const test=require('node:test'),assert=require('node:assert');
const {load,CAREER}=require('./harness');
test('legacy running project is aborted and refunded',()=>{const {run}=load();run(CAREER);
  const s=run(`normalizeProject({title:'Alt',genre:'rpg',subGenre:defaultSub('rpg'),round:5,res:{budget:40,gp:30,gfx:30}},C)`);
  assert.equal(s,null);assert.equal(run('C.studio.kasse'),40);assert.match(run('C.notice'),/Alt/);});
test('negative legacy budget refunds nothing',()=>{const {run}=load();run(CAREER);
  run(`normalizeProject({title:'X',round:2,res:{budget:-10}},C)`);assert.equal(run('C.studio.kasse'),0);});
test('v2 project survives',()=>{const {run}=load();require('./harness').newProject(run);
  assert.ok(run('normalizeProject(S,C)'));});
test('legacy profile in localStorage loads without crash',()=>{const {run,store}=load();
  store.w20_profiles_v6=JSON.stringify([{id:'slot_1',userName:'A',C:{studio:{name:'A',fame:0,kasse:5,staff:[],exStaff:[],engine:null},dir:{id:'custom',n:'D',s:{vision:1,technik:1,fuehrung:1,business:1,hype:1,polish:1},aff:{},perks:[],flaws:[],fame:0,wealth:0,games:1},hall:[],gameNo:1},
    S:{title:'Alt',genre:'rpg',round:3,res:{budget:20}}}]);
  run('initStorage()');assert.equal(run('S'),null);assert.equal(run('C.studio.kasse'),25);});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/storage.test.js`
Expected: FAIL

- [ ] **Step 3: Implement**

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/storage.js tests/storage.test.js
git commit -m "feat: migrate legacy saves by aborting old running projects"
```

---

### Task 6: UI – duration choice, step labels, texts

**Files:**
- Modify: `js/ui.js` (lines below), `js/data.js:863` (EA extra name), `README.md`, `ROADMAP.md`

**Interfaces:**
- Consumes: everything from Tasks 1–5.
- Wizard: `setupDraft.dur` (default `'normal'`), passed into `cfg.dur` at `ui.js:1403-1414`. In wizard step 2 (`ui.js:1640-1647`), right after "Produktionsklasse", add a field "Entwicklungsdauer" with radio group `name="dur"` and three choices built from `DUR_KEYS`. Each choice shows `DUR_LABELS[k]` plus the months of the currently selected tier (`TIERS[tier].dur[i]`, shown as years when ≥24: `nf(m/12,1)+' Jahre'`), with the note "Länger = mehr Qualität möglich, aber teurer". Follow the event wiring of the existing `name="t"` radios. The tier tag `~${money(13*t.scale)}/M` becomes the cost per real month at normal duration: `~${money(13*t.scale*12/t.dur[1])}/Monat`.
- `C.notice`: when set, render it once as `<div class="alert mid" role="status">…</div>` at the top of the setup screen, then delete `C.notice` and `save()`.

**Text and logic replacements in `ui.js`:**

| Line | New behavior |
|---|---|
| 119, 148 | `left = monthsLeft()` (real months, used in alert texts with `fmtSpan`) |
| 127 | `${money(costPerMonth())}/Monat · nächster Schritt ${money(stepCost())}` |
| 134 | Zeit cell: value `Math.round(r.zeit*S.dur/12)+' Mon.'` (buffer in real months). Sub-label `S.round<STEPS.length?'Schritt '+(S.round+1)+'/'+STEPS.length:'Release'`. Bar `S.round/STEPS.length*100`. |
| 142-143 | phase bar: `ph = curStep().ph`, finished state unchanged, list `PHASES` (5 entries) |
| 153 | condition and text against `stepCost()` ("den nächsten Schritt") |
| 548 | `Spieltisch (${stepTag()})` |
| 832, 972 | label `stepLabel()` instead of `Monat x von 12 · PHASES[c.p]` |
| 833 | `Grundsatzentscheidung · ${stepLabel()}` |
| 834, 837, 881, 1230 | `Ende ${STEPS[S.round-1]?.n||''}` instead of `Ende Monat ${S.round}` |
| 871, 1000, 1010 | `Weiter zu „${curStep().n}“` instead of `Weiter zu Monat …`; `card:'Schritt abschließen'` |
| 827 | `${STEPS[M.n-1]?.n} abgerechnet:` |
| 285 | `Ziel bis Ende „${STEPS[stepIndex(ms.at)].n}“` |
| 329 | `Auflösung am Ende von Schritt ${c.due}` |
| 1028 | late text in real months: `Math.round(-S.res.zeit*S.dur/12)` |
| 1071, 1103 | `ph=curCP()`; shop lock text `'Ab Phase '+PHASES[CP_TO_PHASE[it.min]]` |
| 1112, 1127 | hire allowed iff `stepFlag('hire')`; button text `'Nur in Planungsschritten'`; note text updated |
| 1137 | contract text: "pro Phase eine Auftragsarbeit" (no "alle 2 Monate") |
| 177, 654 | "in der Pre-Production (Schritt „Engine & Pipeline“)" instead of "Monat 2" |
| 343, 350 | intro: "durch fünf Phasen vom Konzept bis zum Release" instead of "12 Monate"; engine "ab der Pre-Production" |
| 439, 443 | `/Monat` stays, value `costPerMonth()` |
| 552 | "Nur zu Beginn eines Schritts verfügbar" |
| 1918 | `(${stepTag(p.S.round)})`; add `· Jahr ${Math.floor((p.C?.months||0)/12)+1}` after the Kasse |

Also replace all remaining `` `<span>M${…}</span>` `` log prefixes in `game.js`/`ui.js` with `` `<span>${stepTag()}</span>` `` (closing step: `stepTag(S.round-1)`). `data.js:863`: `'🧪 Early-Access-Phase (ab Alpha)'`.

- [ ] **Step 1: Run the static check for leftovers**

Run: `grep -nE "/12|von 12|Monat \\$\\{S\\.round|round/2|S\\.round(<|>=)(6|7|8|10|11|12)\\b" js/*.js`
Expected before the change: many hits. Note them.

- [ ] **Step 2: Implement the wizard field, notice and replacements**

- [ ] **Step 3: Re-run the static check**

Run: same grep
Expected: no hits except `storage.js` base64 code and engine-project durations (`months/6`, `months>=9`, which are unrelated)

- [ ] **Step 4: Run the unit tests**

Run: `node --test tests/`
Expected: PASS

- [ ] **Step 5: Browser verification**

Start preview `game` (port 8123). In a fresh profile (new slot):
1. Found a studio and choose Indie + "Kurz". The wizard shows 12 / 18 / 24 months.
2. The first card label reads `Konzept · Ideen sammeln · Schritt 1/13 · … Wochen`.
3. The phase bar shows 5 phases.
4. Play 13 steps through to launch. The engine choice appears in step 5, platform and cast in step 8, price in step 13.
5. Hiring is possible in step 1, disabled in step 2.
6. No console errors (`read_console_messages onlyErrors`).
7. Repeat steps 1–6 at mobile width (`resize_window mobile`). The wizard and the HUD do not overflow horizontally.
8. Plant a legacy save: in the console, set the active profile's `S` to `{title:'Alt',genre:'rpg',round:3,res:{budget:20}}` and reload. The notice appears once and the cash goes up by 20.

Take a screenshot of the step label and of the wizard duration field as proof.

- [ ] **Step 6: Update the docs**

- `README.md`: replace "zwölf nervenaufreibende Entwicklungsmonate" and the other 12-month wording with the 5 phases / 13 steps and the duration ranges. Change the legend encounter wording to "zu Beginn einer Phase".
- `ROADMAP.md`: remove "Wählbare Entwicklungsdauer" from "Später" (done). Add the link to the spec under "Als Nächstes": "Erlebbare Phasen, Etappen 2–7 (siehe docs/superpowers/specs/2026-11-04-phasen-erlebnis-design.md)".

- [ ] **Step 7: Commit**

```bash
git add js/ui.js js/game.js js/data.js README.md ROADMAP.md
git commit -m "feat(ui): duration choice, step labels and phase bar for the step model"
```
