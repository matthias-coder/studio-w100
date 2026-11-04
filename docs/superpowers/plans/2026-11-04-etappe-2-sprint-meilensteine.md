# Etappe 2: Sprint & Meilensteine – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every step gets a one-click sprint: the team has capacity points (team, leads, morale and step length), which a focus preset spreads across Gameplay, Grafik, Sound, Bugfixing and Marketing, with optional crunch and fine-tuning. Five milestones (Vertical Slice, First Playable, Alpha, Beta, Gold Master) check Ist against Soll and show the result on their own screen.

**Architecture:** Two new modules next to `js/schedule.js`. `js/sprint.js` holds the sprint numbers and pure functions: capacity, allocation and the expected effect of one step. `js/milestones.js` holds the milestone table, the targets, the check and the outcome effects. `monthEnd()` replaces the passive Director-polish quality growth and the `content` budget lever with the sprint result. At the end of a milestone step it stores `S.msResult`, and `afterMonth()` shows `S.screen='milestone'` before anything else. The existing publisher deal (`S.milestone`) no longer has its own targets. It pays or cancels based on the general milestone check. Stage 3 swaps `applyMsOutcome()` for the funder consequences.

**Tech Stack:** Vanilla JS (browser globals, no build), Node 24 `node:test` + `vm` (`tests/harness.js`), preview config `game` in `.claude/launch.json`.

**Spec:** `docs/superpowers/specs/2026-11-04-phasen-erlebnis-design.md` (sections 2, 4, 6, 10.2, 11, 12)

**Scope (stage 2 only):** capacity, work areas, crunch, focus presets, fine-tuning, contract uses up the step's capacity, milestones with visible Ist vs Soll, simple outcome effects. **Not in scope:** funders, renegotiation roll, rate cuts, feature cuts, ambitious-pitch target raise (stage 3); feature list, a „Features“ milestone check and a Content/Features work area (stage 4, the sprint gets that area once the feature list exists); live ops and prototype-lab capacity deductions (stages 5/6; `sprintCapacity().deduct` is the hook).

## Global Constraints

- In-game text German, code/identifiers/commits English.
- No build step, no npm dependencies. Tests: `node --test` from the repo root (not `node --test tests/` on Node 24).
- „Der Sprint muss mit einem Klick erledigt sein; Feintuning ist optional.“ The default is „wie letzte Runde“: `S.sprint` persists between steps; only crunch resets to off after each step.
- Anti-goal: a project must still be playable in 5–10 minutes. No extra mandatory click per step. The milestone screen is the only new screen, at most 5 per project.
- Careers must survive: a running v2 save (stage 1) loads without abort and gets sprint/milestone defaults in `normalizeProject()`. `S.v` stays `2`.
- Every new JS file goes into `index.html` (after `js/schedule.js`), into the `sw.js` precache list (with a new cache name) and into `FILES` in `tests/harness.js` (after `js/schedule.js`).
- Desktop, tablet and phone (375 px) without horizontal scrolling.

## Numbers (builder's choice, spec §11; all in one place for tuning)

| Constant | Value |
|---|---|
| Points per weight unit `SPRINT.base` | 10 (normal indie project ≈ 120 points total) |
| Lead bonus `SPRINT.leadBonus` | +8 % capacity per hired lead |
| Morale factor | `clamp(0.7 + 0.06 × moral, 0.7, 1.3)` |
| Director polish factor on gp/gfx/snd | `0.9 + 0.05 × D().s.polish` |
| Crunch | ×1.3 points, Moral −1, Bugs +2 per step; only when moral ≥ 2 |
| Rates per point | Gameplay/Grafik/Sound +0.3, Bugfixing −0.35 bugs, Marketing +0.08 hype |
| New bugs from building | +0.06 bugs per point spent on gp/gfx/snd |
| Contract (Auftragsarbeit) in this step | deducts the whole capacity |

Focus presets (percent gp/gfx/snd/bug/mkt): **Ausgewogen** = 70 split by `qualWeights()` / 15 / 15 · **Gameplay zuerst** 55/15/10/10/10 · **Look & Sound** 15/40/30/10/5 · **Bugs jagen** 10/5/5/70/10 · **Marketing-Push** 15/15/10/10/50 · **Meilenstein-Ziel** (dynamic, Task 3) · **Eigene Verteilung** (`S.sprint.custom`, 5 % steps).

Milestones (`base` → Soll gp = base + T().gp, gfx = base + T().gfx − 2, snd = base + round((T().gp+T().gfx)/2) − 4, minus 6 more when `sndWeight() < .2`; bug max fixed):

| id | after step | name | base | max bugs |
|---|---|---|---|---|
| vs | pre_slice | Vertical Slice | 30 | 12 |
| fp | prod_fp | First Playable | 36 | 14 |
| alpha | prod_alpha | Alpha | 42 | 16 |
| beta | prod_beta | Beta | 48 | 12 |
| gm | pol_bugs | Gold Master | 52 | 8 |

Outcome: **met** (all rows ok) → Moral +1 · **near** (every gap ≤ 4) → no effect, note „knapp verfehlt“ · **miss** → Moral −1. Publisher deal on its milestone: met → `reward`, miss → 40 % chance of cancellation with 50 % recoup repayment (today's numbers), near → nothing.

## Review Focus

1. **Low morale and crunch:** at moral 1, crunch would end the game through `moral<=0`. Crunch must be refused (`canCrunch()` false, button disabled), and a crunch flag left over from a save must be ignored. → test in Task 2.
2. **Zero capacity (contract step) with „Meilenstein-Ziel“:** no division by zero, no `NaN` in `S.res`, preview shows 0 points. → test in Task 3.
3. **Budget crisis on a milestone step:** `monthEnd()` → `openCrisis('month')` → `leaveCrisis()` → `afterMonth()` must still show the milestone screen, then continue at the next step. → test in Task 4.
4. **Stage-1 save mid-project (round 10, no `sprint`/`msDone`):** loads, gets defaults, milestones of steps already passed are marked done without evaluation (no retroactive moral loss). → test in Task 4.
5. **Custom distribution that does not add up to 100 (or all zero):** `normAlloc()` normalises to integer percent summing to 100; all zero falls back to „Ausgewogen“. → test in Task 1.

---

### Task 1: Sprint module (capacity, allocation, expected effect)

**Files:**
- Create: `js/sprint.js`
- Modify: `index.html:73` (script tag after schedule.js), `sw.js` (precache + cache name), `tests/harness.js:3` (`FILES`)
- Test: `tests/sprint.test.js`

**Interfaces:**
- Consumes: `stepW(i,s)` from schedule.js; `qualWeights()`, `D()`, `C.studio.staff` from game.js (call-time only).
- Produces:
  - `const SPRINT={base:10,leadBonus:.08,moralBase:.7,moralStep:.06,crunchMult:1.3,crunchMoral:-1,crunchBugs:2,buildBugs:.06,minCrunchMoral:2}`
  - `const AREAS={gp:{n:'Gameplay',ic:'🎮',rate:.3},gfx:{n:'Grafik',ic:'🎨',rate:.3},snd:{n:'Sound',ic:'🎵',rate:.3},bug:{n:'Bugfixing',ic:'🐞',rate:-.35},mkt:{n:'Marketing',ic:'📣',rate:.08}}`
  - `const FOCUS={balanced:{n:'Ausgewogen'},gp:{n:'Gameplay zuerst',a:{gp:55,gfx:15,snd:10,bug:10,mkt:10}},look:{…},bugs:{…},hype:{…},custom:{n:'Eigene Verteilung'}}`. Each entry may have `fn:s=>alloc` instead of `a`; Task 3 adds `ms`.
  - `defaultSprint() -> {focus:'balanced',custom:{gp:30,gfx:25,snd:15,bug:15,mkt:15},crunch:false}`
  - `normAlloc(a) -> {gp,gfx,snd,bug,mkt}`: integer percentages, sum 100 (largest-remainder rounding)
  - `sprintAlloc(s=S) -> {gp,gfx,snd,bug,mkt}`: normalised allocation for `s.sprint.focus`; unknown focus → balanced
  - `canCrunch(s=S) -> boolean`: `s.res.moral >= SPRINT.minCrunchMoral`
  - `sprintCapacity(s=S) -> {base:number, parts:[{n:string,f:number}], deduct:[{n:string,pts:number}], total:number}`: `base = SPRINT.base × stepW(s.round,s)`; parts are the lead, morale and crunch factors (crunch only if `s.sprint.crunch && canCrunch(s)`); deduct holds `{n:'Auftragsarbeit',pts:<all>}` when `s.contractStep===s.round`; `total` is a rounded integer ≥ 0
  - `sprintDelta(s=S) -> {pts,gp,gfx,snd,bugs,hype,moral}`: floats for this step; gp/gfx/snd use the rate × polish factor; bugs = build bugs + bugfix (+ crunch bugs); moral = crunch moral or 0

- [ ] **Step 1: Write the failing tests** in `tests/sprint.test.js` (use `load`/`newProject` from the harness):

```js
test('normal indie project has about 120 sprint points',()=>{const {run}=load();newProject(run);
  run('S.res.moral=5');let sum=0;for(let i=0;i<13;i++){run(`S.round=${i}`);sum+=run('sprintCapacity().total');}
  assert.ok(sum>=110&&sum<=130,'sum='+sum);});
test('leads and morale raise capacity, crunch multiplies by 1.3',()=>{const {run}=load();newProject(run);
  run('S.res.moral=5;S.round=7');const b=run('sprintCapacity().total');
  run('S.sprint.crunch=true');assert.ok(Math.abs(run('sprintCapacity().total')-b*1.3)<=1);
  run('S.sprint.crunch=false;S.res.moral=10');assert.ok(run('sprintCapacity().total')>b);});
test('normAlloc sums to 100 and falls back to balanced',()=>{const {run}=load();newProject(run);
  const a=run('normAlloc({gp:1,gfx:1,snd:1,bug:0,mkt:0})');assert.equal(a.gp+a.gfx+a.snd+a.bug+a.mkt,100);
  const z=run('normAlloc({gp:0,gfx:0,snd:0,bug:0,mkt:0})');assert.deepEqual(z,run(`sprintAlloc({...S,sprint:{...S.sprint,focus:'balanced'}})`));});
test('balanced split follows genre weights',()=>{const {run}=load();newProject(run);
  const a=run('sprintAlloc()');assert.equal(a.bug,15);assert.equal(a.mkt,15);assert.equal(a.gp+a.gfx+a.snd,70);});
test('bugs focus lowers bugs, gameplay focus raises gp',()=>{const {run}=load();newProject(run);run('S.round=7');
  run(`S.sprint.focus='bugs'`);assert.ok(run('sprintDelta().bugs')<0);
  run(`S.sprint.focus='gp'`);const d=run('sprintDelta()');assert.ok(d.gp>d.gfx&&d.gp>0);});
test('crunch is refused below moral 2',()=>{const {run}=load();newProject(run);run('S.round=7;S.sprint.crunch=true;S.res.moral=1');
  assert.equal(run('canCrunch()'),false);assert.equal(run('sprintDelta().moral'),0);});
```

- [ ] **Step 2: Run** `node --test` → the new tests FAIL with `ReferenceError` (`sprintCapacity is not defined`); all old tests still pass.
- [ ] **Step 3: Implement `js/sprint.js`** with the interfaces above and the numbers from the table. `newProject` sets no sprint yet: in this task `sprintAlloc`/`sprintCapacity` read `s.sprint||defaultSprint()`. Register the file in `index.html`, `sw.js` (bump cache name) and `tests/harness.js`.
- [ ] **Step 4: Run** `node --test` → all PASS.
- [ ] **Step 5: Commit** `feat: add sprint module with capacity, focus presets and step preview`

### Task 2: Sprint drives development in `monthEnd()`

**Files:**
- Modify: `js/game.js` (`startGame` ~485: `sprint:defaultSprint(),contractStep:-1`; `startContract` ~352: set `S.contractStep=S.round`; `monthEnd` 937–967: drop the `qual` plan branch and the Director-polish parts of `pol_gp/pol_gfx/pol_snd`, keep `artGfx`, `engDrag`, `AUDIO_SND` and the old `.6` sound base as passive accruals; apply `sprintDelta()`; reset `S.sprint.crunch=false` after the step; `monthLines` 753: remove `'content'`)
- Modify: `js/data.js:305` (remove `PLAN.content`)
- Modify: `js/storage.js` `normalizeProject` (`if(!s.sprint)s.sprint=defaultSprint()`, `if(s.contractStep==null)s.contractStep=-1`)
- Test: `tests/sprint.test.js`, existing `tests/stepend.test.js`

**Interfaces:**
- Consumes: `sprintDelta`, `defaultSprint`, `canCrunch` (Task 1).
- Produces: `S.sprint` always present on a running project; `S.month.sprint = {pts, gp, gfx, snd, bugs, hype}` (rounded change actually applied in this step, for the result line and the log); `S.contractStep:number`.

- [ ] **Step 1: Write the failing tests**

```js
test('a step applies sprint gains and logs them',()=>{const {run}=load();newProject(run);run('Math.random=()=>0.999;S.res.budget=1e9;S.round=7');
  run(`S.sprint.focus='gp'`);const g0=run('S.res.gp');run('monthEnd()');
  assert.ok(run('S.res.gp')>g0);assert.ok(run('S.month.sprint.pts')>0);});
test('crunch costs moral, adds bugs and resets',()=>{const {run}=load();newProject(run);run('Math.random=()=>0.999;S.res.budget=1e9;S.round=7;S.res.moral=6');
  run('S.sprint.crunch=true');run('monthEnd()');
  assert.equal(run('S.res.moral'),5);assert.equal(run('S.sprint.crunch'),false);});
test('crunch flag at moral 1 is ignored',()=>{const {run}=load();newProject(run);run('Math.random=()=>0.999;S.res.budget=1e9;S.round=7;S.res.moral=1;S.sprint.crunch=true');
  run('monthEnd()');assert.equal(run('S.res.moral'),1);});
test('contract step yields zero sprint points',()=>{const {run}=load();newProject(run);run('Math.random=()=>0.999;S.res.budget=1e9;S.round=7;S.contractStep=7');
  run('monthEnd()');assert.equal(run('S.month.sprint.pts'),0);});
test('balanced no-event indie project ends in a sane quality band',()=>{const {run}=load();newProject(run);run('Math.random=()=>0.999;S.res.budget=1e9;S.res.moral=5');
  const g0=run('S.res.gp'),b0=run('S.res.bugs');for(let i=0;i<13;i++)run('monthEnd()');
  const dg=run('S.res.gp')-g0;assert.ok(dg>=6&&dg<=16,'gp gain '+dg);assert.ok(run('S.res.bugs')<=b0+3);});
test('content lever is gone from costs and plan',()=>{const {run}=load();newProject(run);
  assert.equal(run(`'content' in PLAN`),false);});
```

- [ ] **Step 2: Run** `node --test` → new tests FAIL.
- [ ] **Step 3: Implement.** In `monthEnd`, add a local `accN(key,v,f)` (like `acc`, but without the `×w`, because `sprintDelta` already contains the step length) and feed `gp/gfx/snd/bugs/hype` through it with keys `sp_gp`, `sp_gfx`, `sp_snd`, `sp_bugs`, `sp_hype`; crunch moral goes through `add('moral',…)` so the `crunch` perk still softens it. `Math.random` must not be used in the sprint path.
- [ ] **Step 4: Run** `node --test` → all PASS, including the stage-1 tests in `stepend.test.js` (time buffer, step costs, EA integer bugs).
- [ ] **Step 5: Commit** `feat: sprint replaces passive polish growth and the content budget lever`

### Task 3: Milestone module (targets, check, milestone focus)

**Files:**
- Create: `js/milestones.js` (registered like Task 1, after `js/sprint.js`)
- Test: `tests/milestones.test.js`

**Interfaces:**
- Consumes: `STEPS`, `stepIndex`, `stepW` (schedule), `AREAS`, `FOCUS`, `normAlloc`, `sprintCapacity` (sprint), `T()`, `sndWeight()` (game).
- Produces:
  - `const MILESTONES=[{id:'vs',at:'pre_slice',n:'Vertical Slice',base:30,bugs:12},…]` (table above)
  - `msById(id) -> def`
  - `msTargets(id,s=S) -> {gp,gfx,snd,bugs}`
  - `nextMs(s=S) -> def|null`: first milestone with `stepIndex(at) >= s.round` and not in `s.msDone`
  - `msCheck(id,s=S) -> {id,n,outcome:'met'|'near'|'miss',rows:[{k:'gp'|'gfx'|'snd'|'bugs',n:string,ist:number,soll:number,ok:boolean,gap:number}]}`; for bugs `ok = ist <= soll`, `gap = ist − soll`
  - `msNeed(s=S) -> {gp,gfx,snd,bug}`: points this step needs, i.e. `(shortfall / |rate|) × stepW(now) / Σ stepW(now … milestone step)`; 0 when no next milestone
  - `FOCUS.ms={n:'Meilenstein-Ziel',fn:s=>…}`: needs first (proportionally cut when they exceed capacity), the rest by „Ausgewogen“; when the needs are all 0 or capacity is 0 → balanced allocation. Result via `normAlloc`.

- [ ] **Step 1: Write the failing tests**

```js
test('indie targets follow the table',()=>{const {run}=load();newProject(run,{tier:'indie'});
  const t=run(`msTargets('fp')`);assert.equal(t.gp,38);assert.equal(t.gfx,34);assert.equal(t.bugs,14);});
test('aaa targets are higher',()=>{const {run}=load();newProject(run,{tier:'indie'});const i=run(`msTargets('beta').gfx`);
  newProject(run,{tier:'aaa'});assert.ok(run(`msTargets('beta').gfx`)>i);});
test('nextMs skips done milestones',()=>{const {run}=load();newProject(run);
  assert.equal(run('nextMs().id'),'vs');run(`S.msDone=['vs']`);assert.equal(run('nextMs().id'),'fp');
  run(`S.round=STEPS.length-1`);assert.equal(run('nextMs()'),null);});
test('check outcomes met, near, miss',()=>{const {run}=load();newProject(run);const t=run(`msTargets('vs')`);
  run(`Object.assign(S.res,{gp:${t.gp},gfx:${t.gfx},snd:${t.snd},bugs:${t.bugs}})`);assert.equal(run(`msCheck('vs').outcome`),'met');
  run(`S.res.gp-=3`);assert.equal(run(`msCheck('vs').outcome`),'near');
  run(`S.res.bugs+=9`);assert.equal(run(`msCheck('vs').outcome`),'miss');});
test('milestone focus targets the biggest gap',()=>{const {run}=load();newProject(run);
  run(`S.round=stepIndex('pre_slice');S.res.gp=0;S.res.gfx=99;S.res.snd=99;S.res.bugs=0;S.sprint.focus='ms'`);
  const a=run('sprintAlloc()');assert.ok(a.gp>=50,'gp='+a.gp);});
test('milestone focus with zero capacity stays finite',()=>{const {run}=load();newProject(run);
  run(`S.round=7;S.contractStep=7;S.sprint.focus='ms'`);const d=run('sprintDelta()');
  assert.ok(Object.values(d).every(Number.isFinite));assert.equal(d.pts,0);});
```

- [ ] **Step 2: Run** `node --test` → new tests FAIL.
- [ ] **Step 3: Implement `js/milestones.js`** with the interfaces above. `newProject` gets `msDone:[]` only in Task 4; until then read `s.msDone||[]`.
- [ ] **Step 4: Run** `node --test` → all PASS.
- [ ] **Step 5: Commit** `feat: add milestone table, targets, checks and milestone sprint focus`

### Task 4: Milestones in the step flow, publisher on top

**Files:**
- Modify: `js/milestones.js` (add `applyMsOutcome`)
- Modify: `js/game.js` (`startGame`: `msDone:[],msResult:null`; `ensureMilestone` 338; `monthEnd` 1029–1046: replace the publisher check; `afterMonth` 1055: milestone screen first; new `closeMilestone()`)
- Modify: `js/storage.js` `normalizeProject` (defaults + mark passed milestones done; drop `gp/gfx` from an old `S.milestone` and map `at:'prod_fp'|'prod_beta'` → `'fp'|'beta'`)
- Test: `tests/milestones.test.js`; update `tests/stepend.test.js` (the two publisher tests)

**Interfaces:**
- Consumes: `msCheck`, `MILESTONES`, `msById` (Task 3).
- Produces:
  - `applyMsOutcome(r) -> string[]`: applies the effects from the Numbers section (moral via `S.res.moral=clamp(…,0,10)`; the publisher deal when `S.milestone?.at===r.id && !S.milestone.done`) and returns the notes for the log; sets `r.notes` to the same list
  - `S.milestone` (publisher only) = `{at:'fp'|'beta',reward:15*T().scale,done:false}`; `ensureMilestone()` picks the first of `fp`, `beta` whose step is ≥ `S.round` and not in `S.msDone`, else leaves `S.milestone` null
  - `S.msDone: string[]`, `S.msResult: msCheck-result|null`
  - `closeMilestone()`: clears `S.msResult`, then calls `afterMonth()`
  - `S.screen='milestone'` while `S.msResult` is set

- [ ] **Step 1: Write the failing tests** (and rewrite the two publisher tests in `stepend.test.js`: early → `S.milestone.at==='fp'`; `S.round=stepIndex('pol_bugs')` → `S.milestone===null`; `milestone fires at end of prod_fp` → after the `prod_fp` step `S.milestone.done===true` and `S.msDone` includes `'fp'`)

```js
test('milestone step shows the milestone screen once',()=>{const {run}=load();newProject(run);run('Math.random=()=>0.999;S.res.budget=1e9');
  run(`S.round=stepIndex('pre_slice')`);run('monthEnd()');
  assert.equal(run('S.screen'),'milestone');assert.equal(run('S.msResult.id'),'vs');assert.ok(run(`S.msDone.includes('vs')`));
  run('closeMilestone()');assert.notEqual(run('S.screen'),'milestone');assert.equal(run('S.msResult'),null);});
test('met raises moral, miss lowers it',()=>{const {run}=load();newProject(run);run('S.res.moral=5');
  run(`S.res.gp=99;S.res.gfx=99;S.res.snd=99;S.res.bugs=0;applyMsOutcome(msCheck('vs'))`);assert.equal(run('S.res.moral'),6);
  run(`S.res.gp=0;applyMsOutcome(msCheck('vs'))`);assert.equal(run('S.res.moral'),5);});
test('publisher pays on met milestone',()=>{const {run}=load();newProject(run);run('S.publisher=true;ensureMilestone()');
  const b=run('S.res.budget');run(`S.res.gp=99;S.res.gfx=99;S.res.snd=99;S.res.bugs=0;applyMsOutcome(msCheck('fp'))`);
  assert.equal(run('S.res.budget'),b+run('S.milestone.reward'));assert.equal(run('S.milestone.done'),true);});
test('crisis on a milestone step still shows the milestone',()=>{const {run}=load();newProject(run);run('Math.random=()=>0.999');
  run(`S.round=stepIndex('pre_slice');S.res.budget=-1`);run('monthEnd()');assert.equal(run('S.screen'),'crisis');
  run('S.res.budget=1e9;leaveCrisis()');assert.equal(run('S.screen'),'milestone');});
test('stage-1 save mid-project gets defaults and no retro checks',()=>{const {run}=load();newProject(run);
  run('S.round=10;delete S.sprint;delete S.msDone;delete S.msResult;S.res.moral=5');
  const s=run('normalizeProject(S,C)');assert.deepEqual(s.msDone,['vs','fp','alpha']);
  assert.equal(s.sprint.focus,'balanced');assert.equal(s.res.moral,5);});
```

- [ ] **Step 2: Run** `node --test` → new tests FAIL.
- [ ] **Step 3: Implement.** In `monthEnd`, before `S.round++`: when `MILESTONES` has an entry whose `at` is the current step id and it is not in `S.msDone`, push it to `S.msDone`, store `S.msResult=msCheck(id)` and push `...applyMsOutcome(S.msResult)` into `notes`. In `afterMonth`, after the `moral<=0` check and before the launch check: `if(S.msResult){S.screen='milestone';render();save();return}`. Remove the old block at 1029–1046 and the publisher's own gp/gfx targets.
- [ ] **Step 4: Run** `node --test` → all PASS.
- [ ] **Step 5: Commit** `feat: evaluate milestones at step end with their own screen; publisher uses them`

### Task 5: Sprint bar, milestone screen and milestone panel (UI)

**Files:**
- Modify: `js/ui.js` (event screen ~969: insert `sprintBar()` between `budgetAlert()` and the studio actions, then `bindSprint(m)`; `renderMain`: `if(sc==='milestone'){renderMilestone(m);return}`; replace `milestoneBlock()` 278 with `msBlock()`; result screen of a step end shows `S.month.sprint` as chips)
- Modify: `css/style.css` (sprint bar, focus chips, fine-tune grid, Ist/Soll table; phones: chips wrap, no fixed widths)
- Modify: `README.md` (short section „Sprint & Meilensteine“), `sw.js` cache name
- Test: `tests/ui.test.js` (create; `load({ui:true})`)

**Interfaces:**
- Consumes: everything above.
- Produces:
  - `sprintBar() -> html`: one line „Sprint · N Punkte“ + focus buttons (`data-focus`), crunch toggle (`data-crunch`, disabled when `!canCrunch()`, title explains the effect), expected effect as chips from `sprintDelta()` (gp/gfx/snd/bugs/hype rounded to 1 decimal), a `<details>` „Feintuning“ with ±5 buttons per area (`data-area`, `data-step`); a change there sets `focus='custom'`. Contract step: text „Auftragsarbeit: Das Team ist diesen Schritt ausgebucht.“
  - `bindSprint(m)`: writes `S.sprint`, then `renderMain();renderHud();save()`
  - `msBlock() -> html`: next milestone, „in N Schritten“, table Ist/Soll/✓✗ for gp, gfx, snd, bugs; publisher reward line when `S.milestone` targets it
  - `renderMilestone(m)`: big headline with the milestone name, outcome badge (Erreicht / Knapp verfehlt / Verfehlt), Ist/Soll table, `S.msResult.notes`, one button „Weiter“ → `closeMilestone()`

- [ ] **Step 1: Write the failing tests**

```js
test('sprint bar renders presets and points',()=>{const {run}=load({ui:true});require('./harness').newProject(run);
  const h=run('sprintBar()');assert.match(h,/Ausgewogen/);assert.match(h,/Meilenstein-Ziel/);assert.match(h,/Punkte/);});
test('crunch button disabled at moral 1',()=>{const {run}=load({ui:true});require('./harness').newProject(run);
  run('S.res.moral=1');assert.match(run('sprintBar()'),/data-crunch[^>]*disabled/);});
test('milestone screen lists Ist and Soll',()=>{const {run}=load({ui:true});require('./harness').newProject(run);
  run(`S.msResult=msCheck('vs');S.msResult.notes=['x'];S.screen='milestone'`);
  const h=run(`(()=>{const m={innerHTML:'',className:''};renderMilestone(m);return m.innerHTML})()`);
  assert.match(h,/Vertical Slice/);assert.match(h,/Soll/);});
```

- [ ] **Step 2: Run** `node --test` → new tests FAIL.
- [ ] **Step 3: Implement** the UI functions and CSS. Keep the event card as the visual focus: the sprint bar is a single compact row with a fold, not a second card.
- [ ] **Step 4: Run** `node --test` → all PASS.
- [ ] **Step 5: Verify in the preview** (`preview_start {name:'game'}`; create a **separate test profile**, never touch „Pixelpott Studios“): start an indie project and play to the Vertical Slice. Check that (a) one click on a focus updates points and chips, (b) crunch at moral 1 is disabled, (c) the milestone screen appears once after „Vertical Slice“ and „Weiter“ continues, (d) the sheet shows the next milestone, (e) at 375 px (`resize_window mobile`) there is no horizontal scrolling (`document.documentElement.scrollWidth<=innerWidth`), (f) no console errors. Take a screenshot of the sprint bar and the milestone screen.
- [ ] **Step 6: Commit** `feat(ui): sprint bar, milestone screen and next-milestone panel`

---

**After the plan:** playtest one indie and one AAA project for the 5–10-minute goal and for the quality band at the Gold Master. Tune only the constants in `SPRINT`, `AREAS` and `MILESTONES`. Update the memory note (stage 2 done, stage 3 next).
