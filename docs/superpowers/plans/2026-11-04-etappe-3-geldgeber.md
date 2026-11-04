# Etappe 3: Geldgeber & Pitch – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The step „Pitch-Termine“ gets its own screen: the player picks funders (Publisher, Investoren, Förderung, Crowdfunding) or „Nur Eigenkapital“ in one click, rolls one pitch, and gets a funding mix. Each funder pays in rates at its milestones and reacts to the milestone result in its own way: full rate, renegotiation roll, rate cut, forced feature cut, repayment or cancellation. The old publisher deal (`S.milestone`, `ensureMilestone`) is dissolved into this system.

**Architecture:** New module `js/funding.js` (after `js/milestones.js`) holds the funder table, offers, pitch math, deal bookkeeping, milestone consequences, feature cuts and the crowdfunding lawsuit. `js/schedule.js` learns to skip steps (`S.skip`): „Nur Eigenkapital“ or a pitch without any deal skips `pit_mix`. `applyMsOutcome()` keeps the morale effect and calls `applyFundingOutcome()`. Renegotiation and feature cut are decided on the milestone screen; „Weiter“ stays disabled until both are settled. Money flows reuse the existing fields: publisher money → `S.recoup` + `S.publisher`, investor money → `S.investIn` + `S.equity`, grant/crowd → `S.income`; the release settlement stays as it is.

**Tech Stack:** Vanilla JS (browser globals, no build), Node 24 `node:test` + `vm` (`tests/harness.js`), preview config `game` in `.claude/launch.json`.

**Spec:** `docs/superpowers/specs/2026-11-04-phasen-erlebnis-design.md` (sections 2, 5 „Pitch & Finanzierung“, 6, 10.3, 11, 12)

**Scope (stage 3 only):** pitch screen, funder choice, one pitch roll, funding mix, ambitious pitch, rates per milestone, renegotiation, rate cut, feature cut, repayment, cancellation/exit, crowdfunding lawsuit, „Nur Eigenkapital“ skipping `pit_mix`, save migration. **Not in scope:** feature list (stage 4 – until then a feature cut removes a project extra or cuts scope; `cutOptions()` is the hook), USP and prototype pitch bonus (stages 4/6; `pitchBonus()` is the hook), new pitch event cards (stage 7), changing the tier gates in the setup wizard.

## Global Constraints

- In-game text German, code/identifiers/commits English.
- No build step, no npm dependencies. Tests: `node --test` from the repo root (not `node --test tests/` on Node 24).
- „Pitch bei Eigenfinanzierung: Die Phase bleibt Pflicht. ‚Nur Eigenkapital‘ ist eine Ein-Klick-Option im Pitch-Schritt, und die Phase zählt dann als eine Runde.“
- „Geldgeber springt ab: Das Projekt stirbt nicht direkt. Fehlt Geld, greift das bestehende Krisensystem (`openCrisis`) …“ – no new game-over path.
- „Crowdfunding-Backer können nichts zurückziehen. Nur bei einem extrem unwahrscheinlichen Patzer droht eine Klage“, „Größenordnung ≤ 1 % pro Projekt“.
- „Eigenkapital aus der Studiokasse bleibt ohne Auflagen.“
- Anti-goal 5–10 minutes: the pitch is one screen + one roll; renegotiation/cut appear only on a near/missed funded milestone.
- Careers must survive: a running v2 save loads without abort; `normalizeProject()` fills funding defaults. `S.v` stays `2`.
- New JS file goes into `index.html` (after `js/milestones.js`), the `sw.js` precache list (cache name `w100-v5` → `w100-v6`) and `FILES` in `tests/harness.js` (after `js/milestones.js`).
- Desktop, tablet and phone (375 px) without horizontal scrolling.

## Numbers (builder's choice, spec §11; all in `js/funding.js`)

`pc = projCost()` = `monthSum() × totalW(S)` (estimated running cost of the whole project at today's levers), rounded to 0.1.

| id | Name | Offer | At signing | Rates at milestones | Pitch SG (d20 scale) | Tiers | On „miss“ |
|---|---|---|---|---|---|---|---|
| pub | 🏢 Publisher | 0.6 × pc | 30 % | vs, fp, alpha, beta, gm | 14 | all | rate withheld + forced feature cut; 2nd miss → cancels, wants 50 % of paid money back |
| inv | 💼 Investoren | 0.4 × pc | 50 % | fp, beta, gm | 15 | all | rate withheld; 2nd miss → exit (no more rates, keeps profit share) |
| grant | 🏛️ Förderung | 0.15 × pc | 50 % | vs, gm | 11 | indie, aa | 50 % of paid money repaid, grant ends |
| crowd | 🙌 Crowdfunding | min(0.5, 0.05 + 0.05 × hype) × pc | 100 % | – | 13 | indie, aa | – |

`const FUND={ambMoney:1.3,ambDc:2,ambSoll:3,critBonus:.2,renegoDc:12,nearRate:.5,repay:.5,invShare:.2,invHype:3,lawsuitChance:.05,lawsuitShare:.5,cutZeit:1,cutGp:3}`

- Rest after signing is split equally over the funder's milestones that are not in `S.msDone`.
- Booking per payment `x`: pub → `S.recoup+=x; S.publisher=true` · inv → `S.investIn+=x` · grant/crowd → `S.income+=x`; always `S.res.budget+=x; deal.paid+=x`. Investor signing adds `S.equity+=FUND.invShare`.
- Pitch: one W100 roll, Business stat. Modifier = `optMod({st:'business'}) + pitchBonus() + moralMod()`. `pitchBonus(s) = (floor(hype/2) + floor((qual−30)/10)) × 4 + fameBonus()`. Each chosen funder signs if `crit || (!fumble && total ≥ dc100(dc + (amb ? FUND.ambDc : 0)))`. Crit: every offer × (1 + `critBonus`). Fumble: no deal.
- Ambitious pitch (only with at least one funder chosen): pub and inv offers × `ambMoney`, every funder's SG + `ambDc`, every milestone Soll for gp/gfx/snd + `ambSoll`.
- Milestone result per active deal with a rate at this milestone (investor: outcome one level worse when `hype < invHype`): **met** → pay rate · **near** → pending; renegotiation roll Business SG `renegoDc` (success full rate, failure `nearRate` × rate) or one click „halbe Rate akzeptieren“ · **miss** → column „On miss“.
- Feature cut options: every project extra in `S.extras` + always „Umfang kürzen“ (`scope`: Gameplay −`cutGp`). Each cut: Zeit +`cutZeit`; removing an extra drops it from `S.extras` (and clears `S.mods`/`S.ea` for `mods`/`ea`), so its monthly cost and later bonuses end. With a crowd deal every cut adds `S.promises+=1` (broken stretch goal).
- Lawsuit at release: only with a crowd deal **and** at least one cut, `Math.random() < lawsuitChance` → pay `lawsuitShare` × crowd money (≈ 20 % cut rate × 5 % ≈ 1 % per project).

## Review Focus

1. **Grant repayment drives the budget negative on a milestone step:** crisis first, then the milestone screen, and a pending renegotiation from the same milestone is still resolvable afterwards. → test in Task 4.
2. **Skipped `pit_mix`:** the mandatory „license“ card moves to `pre_tech`, the project's months/time units exclude the skipped step, and the log names „Pitch-Termine“ (not „Finanzierung steht“) as the finished step. → test in Task 2.
3. **Reload during the pitch or with an open renegotiation/cut:** the screen and the pending flags survive `save()`/load; a v2 save standing on the `pit_meet` event screen without `S.fund` shows the pitch screen. → test in Task 5.
4. **Pitch extremes:** nothing selected → `startPitch([])` does nothing; all funders fail or fumble → no deal and `pit_mix` skipped; crit → offers +20 %. → test in Task 3.
5. **Feature cut when nothing is left to cut or EA is already selling:** `scope` is always offered; cutting `ea` stops Early-Access income from the next step on. → test in Task 4.

---

### Task 1: Funding module (table, offers, deals, payments)

**Files:**
- Create: `js/funding.js`
- Modify: `index.html` (script tag after `js/milestones.js`), `sw.js` (precache + `w100-v6`), `tests/harness.js` (`FILES` after `js/milestones.js`), `js/game.js` `startGame` (~480: add `fund:defaultFund(),skip:[]` to `S`)
- Test: `tests/funding.test.js`

**Interfaces:**
- Consumes: `monthSum()`, `T()`, `fameBonus()` (game.js), `totalW()` (schedule.js), `S.msDone`, `MILESTONES` (call-time only).
- Produces:
  - `const FUND={…}` and `const FUNDERS={pub:{n,ic,share,sign,ms:[…],dc,tiers,d},inv:{…},grant:{…},crowd:{…}}` with the numbers above (`tiers:null` = all; crowd `share` is computed). `d` is the one-line German condition text shown on the pitch screen.
  - `defaultFund() -> {pitched:false,self:false,amb:false,deals:[],cuts:[],renego:false,cutPending:false}`
  - `projCost(s=S) -> number`
  - `funderAvail(id,s=S) -> boolean` (tier check)
  - `funderOffer(id,amb=false,s=S) -> number` (rounded to 0.1)
  - `findDeal(id,s=S) -> deal|undefined`; a deal is `{id,total,paid,rates:{[msId]:number},misses,status:'active'|'cancelled'|'exited',pend:null|msId}`
  - `payDeal(deal,x) -> number` (books per funder, returns the rounded amount)
  - `signDeal(id,total) -> deal` (pushes to `S.fund.deals`, pays the signing share, spreads the rest, adds investor equity)
  - `planText(id) -> string` e.g. „30 % bei Unterschrift, Rest in 5 Raten (Vertical Slice … Gold Master)“

- [ ] **Step 1: Write the failing tests** in `tests/funding.test.js`:

```js
const test=require('node:test'),assert=require('node:assert/strict');
const {load,newProject}=require('./harness');
test('offers scale with project cost',()=>{const {run}=load();newProject(run);const pc=run('projCost()');
  assert.ok(pc>0);assert.ok(Math.abs(run(`funderOffer('pub')`)-pc*.6)<=.1);
  assert.ok(Math.abs(run(`funderOffer('pub',true)`)-pc*.6*1.3)<=.1);
  assert.equal(run(`funderOffer('grant',true)`),run(`funderOffer('grant')`));});
test('crowd offer follows hype and is capped',()=>{const {run}=load();newProject(run);
  run('S.res.hype=2');const a=run(`funderOffer('crowd')`);run('S.res.hype=20');
  assert.ok(Math.abs(run(`funderOffer('crowd')`)-run('projCost()')*.5)<=.1);assert.ok(a<run(`funderOffer('crowd')`));});
test('grant and crowd are not offered to AAA',()=>{const {run}=load();newProject(run,{tier:'aaa'});
  assert.equal(run(`funderAvail('grant')`),false);assert.equal(run(`funderAvail('crowd')`),false);assert.equal(run(`funderAvail('pub')`),true);});
test('publisher signing pays 30 % and spreads the rest over 5 milestones',()=>{const {run}=load();newProject(run);
  const b=run('S.res.budget');run(`signDeal('pub',100)`);
  assert.equal(run('S.res.budget'),b+30);assert.equal(run('S.recoup'),30);assert.equal(run('S.publisher'),true);
  assert.deepEqual(Object.keys(run(`findDeal('pub').rates`)),['vs','fp','alpha','beta','gm']);
  assert.equal(run(`Object.values(findDeal('pub').rates).reduce((a,b)=>a+b,0)`),70);});
test('late signing only uses open milestones',()=>{const {run}=load();newProject(run);
  run(`S.msDone=['vs','fp'];signDeal('pub',100)`);assert.deepEqual(Object.keys(run(`findDeal('pub').rates`)),['alpha','beta','gm']);});
test('investor books capital and equity, grant books income',()=>{const {run}=load();newProject(run);
  run(`signDeal('inv',40);signDeal('grant',10)`);
  assert.equal(run('S.investIn'),20);assert.equal(run('S.equity'),.2);assert.equal(run('S.income'),5);});
```

- [ ] **Step 2: Run** `node --test` → new tests FAIL (`projCost is not defined`); all old tests pass.
- [ ] **Step 3: Implement** `js/funding.js` with the interfaces above, register it in `index.html`, `sw.js`, `tests/harness.js`, and add `fund:defaultFund(),skip:[]` in `startGame`.
- [ ] **Step 4: Run** `node --test` → all PASS.
- [ ] **Step 5: Commit** `feat: add funding module with funder table, offers and deal payments`

### Task 2: Skippable steps

**Files:**
- Modify: `js/schedule.js` (`stepMonths`, `stepW`, new helpers), `js/game.js` (`monthEnd` ~1033: advance with `nextStep`, log/notes use the finished step; `mandFor` ~378; `finishGame` ~1665: `advanceCalendar(projMonths())`), `js/game.js`/`js/ui.js` every `S.round-1` that means „the step just finished“ → `lastStep()` (grep `S.round-1`)
- Test: `tests/schedule.test.js`

**Interfaces:**
- Produces:
  - `isSkipped(i,s=S) -> boolean` (`(s.skip||[]).includes(STEPS[i]?.id)`); `stepMonths`/`stepW` return 0 for skipped steps
  - `nextStep(i,s=S) -> number`: first index > i that is not skipped (may be `STEPS.length`)
  - `lastStep(s=S) -> number`: `s.prevRound ?? s.round-1`; `monthEnd` sets `S.prevRound` to the step it just finished
  - `projMonths(s=S) -> number`: sum of `stepMonths` over all steps
  - `mandFor(i)` also returns the not-done mandatory cards of skipped steps directly before `i`

- [ ] **Step 1: Write the failing tests**

```js
test('skipped pit_mix: no months, no time, license moves to pre_tech',()=>{const {run}=load();newProject(run);
  run('Math.random=()=>0.999;S.res.budget=1e9');const m0=run('projMonths()'),z0=run('S.res.zeit');
  run(`S.skip=['pit_mix'];S.round=stepIndex('pit_meet')`);
  assert.ok(run('projMonths()')<m0);run('monthEnd()');
  assert.equal(run('S.round'),run(`stepIndex('pre_tech')`));assert.equal(run('lastStep()'),run(`stepIndex('pit_meet')`));
  assert.ok(run(`mandFor(S.round).includes('license')`));
  assert.match(run('S.log[S.log.length-1]'),/Pitch-Termine/);});
test('full project with skip ends at launch with the right time use',()=>{const {run}=load();newProject(run);
  run(`Math.random=()=>0.999;S.res.budget=1e9;S.skip=['pit_mix']`);const z0=run('S.res.zeit'),w=run('totalW()');
  for(let i=0;i<13&&run('S.screen')!=='launch';i++){run('monthEnd()');if(run('S.screen')==='milestone')run('closeMilestone()')}
  assert.equal(run('S.screen'),'launch');assert.ok(Math.abs(z0-run('S.res.zeit')-w)<1e-6);});
```

(Adapt the log assertion to how `addLog` stores entries; the check is that the finished-step name is „Pitch-Termine“.)

- [ ] **Step 2: Run** `node --test` → FAIL (`projMonths is not defined`).
- [ ] **Step 3: Implement** the helpers and the `monthEnd`/`mandFor`/`finishGame`/`S.round-1` changes.
- [ ] **Step 4: Run** `node --test` → all PASS (existing 13-step loops unchanged because `S.skip` is empty).
- [ ] **Step 5: Commit** `feat: allow skipping phase steps`

### Task 3: Pitch flow (roll, signing, self-funding)

**Files:**
- Modify: `js/funding.js` (pitch functions), `js/game.js` (`goMonth` 502, `getOpt` 817, `curTitle` 805, `resolve` 859 hook, `afterResult` 905), `js/events.js:114-117` (rewrite card „Der Pitch“ without `recoup`)
- Test: `tests/funding.test.js`

**Interfaces:**
- Consumes: Task 1 (`signDeal`, `funderOffer`, `funderAvail`, `FUNDERS`, `FUND`), Task 2 (`S.skip`), `startRoll`, `optMod`, `moralMod`, `dc100`.
- Produces:
  - `pitchDue(s=S) -> boolean`: `!s.fund.pitched && STEPS[s.round]?.id==='pit_meet'`; `goMonth()`: mandatory cards first, then `S.screen='pitch'` if due, else `'event'`
  - `pitchBonus(s=S) -> number`, `pitchMod() -> number` (whole modifier incl. stat and morale, for the UI chance)
  - `pitchTarget(id,amb) -> number` (W100 target, `dc100(FUNDERS[id].dc+(amb?FUND.ambDc:0))`)
  - `startPitch(ids:string[],amb:boolean)`: ignores unavailable ids; empty → no-op; stores `S.fund.amb=amb`, `S.pitchSel=ids`; `startRoll({kind:'pitch',ev:'pitch',adv:false})`
  - `selfFund()`: `S.fund.pitched=true; S.fund.self=true; S.skip.push('pit_mix')`; log line; `goMonth()`
  - `resolvePitch(total,crit,fumble) -> {ch:[…],txt:string}`: signs each funder that wins (offers × crit bonus), sets `S.fund.pitched=true`, pushes `'pit_mix'` to `S.skip` when no deal was signed; `txt` lists signed and declined funders
  - roll kinds: `getOpt({kind:'pitch'})` → `{l:'Pitch',st:'business',dc:<lowest chosen SG>,s:{},f:{},bonusV:pitchBonus()}`; `curTitle('pitch')` → „Pitch-Termine“; `resolve()` calls `resolvePitch` for `kind==='pitch'`; `afterResult('pitch')` → `goMonth()`
  - Card „Der Pitch“ becomes „Die Generalprobe“ („Bevor es ernst wird, pitcht ihr vor Freunden aus der Branche.“): „Vor Publikum proben“ Business SG 12, success `{hype:1,moral:1}`, failure `{moral:-1}`; „Lieber weiterbauen“ safe `{gp:2}`

- [ ] **Step 1: Write the failing tests**

```js
const toPitch=run=>{run(`Math.random=()=>0.999;S.res.budget=1e9;S.round=stepIndex('pit_meet');goMonth()`)};
test('pit_meet opens the pitch screen once',()=>{const {run}=load();newProject(run);toPitch(run);
  assert.equal(run('S.screen'),'pitch');run('selfFund()');assert.equal(run('S.screen'),'event');
  assert.ok(run(`S.skip.includes('pit_mix')`));assert.equal(run('pitchDue()'),false);});
test('empty selection does nothing',()=>{const {run}=load();newProject(run);toPitch(run);run('startPitch([],false)');assert.equal(run('S.screen'),'pitch');});
test('winning pitch signs funders and keeps pit_mix',()=>{const {run}=load();newProject(run);toPitch(run);
  run(`S.fund.amb=false;S.pitchSel=['pub','grant']`);const x=run('resolvePitch(999,false,false)');
  assert.ok(run(`findDeal('pub')&&findDeal('grant')`));assert.equal(run(`S.skip.includes('pit_mix')`),false);assert.match(x.txt,/Publisher/);});
test('crit raises offers by 20 %',()=>{const {run}=load();newProject(run);toPitch(run);
  const o=run(`funderOffer('grant')`);run(`S.pitchSel=['grant'];resolvePitch(999,true,false)`);
  assert.ok(Math.abs(run(`findDeal('grant').total`)-o*1.2)<=.1);});
test('fumble or total miss signs nothing and skips pit_mix',()=>{const {run}=load();newProject(run);toPitch(run);
  run(`S.pitchSel=['pub','inv'];resolvePitch(999,false,true)`);assert.equal(run('S.fund.deals.length'),0);
  assert.ok(run(`S.skip.includes('pit_mix')`));assert.equal(run('S.fund.pitched'),true);});
test('ambitious pitch is harder',()=>{const {run}=load();newProject(run);assert.equal(run(`pitchTarget('pub',true)-pitchTarget('pub',false)`),10);});
test('pitch card no longer creates a publisher',()=>{const {run}=load();newProject(run);
  assert.equal(run(`E.some(e=>e.o.some(o=>o.s&&o.s.recoup))`),false);});
```

- [ ] **Step 2: Run** `node --test` → FAIL (`pitchDue is not defined`).
- [ ] **Step 3: Implement** the interfaces above.
- [ ] **Step 4: Run** `node --test` → all PASS.
- [ ] **Step 5: Commit** `feat: pitch step with funder choice, one pitch roll and self-funding`

### Task 4: Milestone consequences, renegotiation and feature cut

**Files:**
- Modify: `js/funding.js` (outcome functions), `js/milestones.js` (`msTargets` + ambitious raise; `applyMsOutcome`: keep morale lines, replace the publisher block with `notes.push(...applyFundingOutcome(r))`), `js/game.js` (delete `ensureMilestone` and `S.milestone` from `startGame`; `apply()` `recoup` branch 559 without `ensureMilestone`; rescue `publisher` 1269 without `ensureMilestone`; `closeMilestone` guard; roll kind `renego` in `getOpt`/`curTitle`/`resolve`/`afterResult`)
- Modify tests: `tests/milestones.test.js` („publisher pays on met milestone“ → deal-based), `tests/stepend.test.js` (delete „publisher early → milestone at fp; late → none“; rewrite „milestone fires at end of prod_fp“ with `signDeal('pub',100)` and assert the `fp` rate was paid)
- Test: `tests/funding.test.js`

**Interfaces:**
- Consumes: Tasks 1–3, `msCheck`, `S.msResult`.
- Produces:
  - `dealOutcome(deal,outcome,s=S) -> 'met'|'near'|'miss'` (investor hype downgrade)
  - `applyFundingOutcome(r) -> string[]`: handles every active deal with `rates[r.id]`, sets `r.deals=[{id,n,outcome,amount,txt}]`, sets `S.fund.renego`/`deal.pend` for near, `S.fund.cutPending` for a publisher's first miss
  - `resolveRenego(ok:boolean) -> {ch,txt}`: pays full or `nearRate` share of every pending rate, clears `pend` and `S.fund.renego`; also called directly (ok=false) by „halbe Rate akzeptieren“
  - `cutOptions(s=S) -> [{id,n}]`, `cutFeature(id) -> string[]` (notes; clears `S.fund.cutPending`)
  - roll kind `renego`: `getOpt` → `{l:'Nachverhandeln',st:'business',dc:FUND.renegoDc,s:{},f:{},bonusV:fameBonus()}`; `curTitle` → „Nachverhandlung“; `afterResult('renego')` → `S.screen='milestone'`
  - `closeMilestone()` returns without effect while `S.fund.renego||S.fund.cutPending`
  - `msTargets()` adds `FUND.ambSoll` to gp/gfx/snd when `s.fund?.amb`

- [ ] **Step 1: Write the failing tests**

```js
const setRes=(run,id,d=0)=>{const t=run(`msTargets('${id}')`);run(`Object.assign(S.res,{gp:${t.gp+d},gfx:${t.gfx+d},snd:${t.snd+d},bugs:${t.bugs}})`)};
test('met pays the rate',()=>{const {run}=load();newProject(run);run(`signDeal('pub',100)`);setRes(run,'vs');
  const b=run('S.res.budget');run(`applyMsOutcome(msCheck('vs'))`);assert.equal(run('S.res.budget'),b+14);});
test('near blocks Weiter until renegotiated',()=>{const {run}=load();newProject(run);run(`signDeal('pub',100)`);setRes(run,'vs',-3);
  run(`S.msResult=msCheck('vs');applyMsOutcome(S.msResult);S.screen='milestone'`);assert.equal(run('S.fund.renego'),true);
  run('closeMilestone()');assert.equal(run('S.screen'),'milestone');
  const b=run('S.res.budget');run('resolveRenego(false)');assert.equal(run('S.res.budget'),b+7);assert.equal(run('S.fund.renego'),false);});
test('publisher: first miss withholds rate and demands a cut, second miss cancels',()=>{const {run}=load();newProject(run);
  run(`signDeal('pub',100)`);setRes(run,'vs',-20);const b=run('S.res.budget');
  run(`applyMsOutcome(msCheck('vs'))`);assert.equal(run('S.res.budget'),b);assert.equal(run('S.fund.cutPending'),true);
  run(`cutFeature('scope')`);setRes(run,'fp',-20);run(`applyMsOutcome(msCheck('fp'))`);
  assert.equal(run(`findDeal('pub').status`),'cancelled');assert.equal(run('S.publisher'),false);assert.equal(run('S.res.budget'),b-15);});
test('investor downgrades when hype is low',()=>{const {run}=load();newProject(run);run(`signDeal('inv',40);S.res.hype=1`);
  assert.equal(run(`dealOutcome(findDeal('inv'),'met')`),'near');assert.equal(run(`dealOutcome(findDeal('inv'),'near')`),'miss');});
test('grant miss repays half and can trigger the crisis before the milestone screen',()=>{const {run}=load();newProject(run);
  run(`Math.random=()=>0.999;signDeal('grant',20);signDeal('pub',100);S.round=stepIndex('pre_slice')`);
  const t=run(`msTargets('vs')`);run(`Object.assign(S.res,{gp:${t.gp-3},gfx:${t.gfx},snd:${t.snd},bugs:${t.bugs+30},budget:0})`);
  run('monthEnd()');assert.equal(run('S.screen'),'crisis');assert.equal(run(`findDeal('grant').status`),'cancelled');
  run('S.res.budget=1e9;leaveCrisis()');assert.equal(run('S.screen'),'milestone');});
test('cut options always include scope; cutting ea stops early access',()=>{const {run}=load();newProject(run,{extras:['ea']});
  assert.deepEqual(run('cutOptions().map(o=>o.id)'),['ea','scope']);run(`S.fund.cutPending=true;cutFeature('ea')`);
  assert.equal(run('S.ea'),false);assert.equal(run(`S.extras.includes('ea')`),false);assert.equal(run('S.fund.cutPending'),false);
  run(`Math.random=()=>0.999;S.res.budget=1e9;S.round=stepIndex('prod_alpha');monthEnd()`);assert.equal(run('S.month.ea'),0);});
test('crowd deal turns a cut into a broken promise',()=>{const {run}=load();newProject(run);run(`signDeal('crowd',10);const p=S.promises;cutFeature('scope');S._d=S.promises-p`);assert.equal(run('S._d'),1);});
test('ambitious pitch raises targets by 3',()=>{const {run}=load();newProject(run);const a=run(`msTargets('fp').gp`);run('S.fund.amb=true');assert.equal(run(`msTargets('fp').gp`),a+3);});
test('ensureMilestone is gone',()=>{const {run}=load();newProject(run);assert.equal(run(`typeof ensureMilestone`),'undefined');});
```

(In the grant test the publisher's near/miss also lands on the same screen; the check is crisis → milestone order.)

- [ ] **Step 2: Run** `node --test` → FAIL.
- [ ] **Step 3: Implement** the interfaces above; rewrite the two old publisher tests as listed.
- [ ] **Step 4: Run** `node --test` → all PASS, including the stage-2 balance tests (ambition off by default).
- [ ] **Step 5: Commit** `feat: funder consequences at milestones with renegotiation, rate cuts and feature cuts`

### Task 5: Release settlement, lawsuit and save migration

**Files:**
- Modify: `js/funding.js` (`crowdLawsuit()`), `js/game.js` `finishGame` (~1630: `e.lawsuit=crowdLawsuit()`, subtract from `e.kasseEnd`), `js/storage.js` `normalizeProject`
- Test: `tests/funding.test.js`

**Interfaces:**
- Produces:
  - `crowdLawsuit(s=S) -> number` (0 or `lawsuitShare` × crowd `paid`, rounded 0.1), `e.lawsuit` on the end record
  - `normalizeProject`: `s.fund` missing → `defaultFund()` with `pitched = s.round > stepIndex('pit_meet')` (and `self = !s.publisher`); `s.skip` missing → `[]`; an open legacy `s.milestone` (`!done`) → pub deal `{id:'pub',total:reward,paid:0,rates:{[at]:reward},misses:0,status:'active',pend:null}`; `delete s.milestone`; `s.round===stepIndex('pit_meet') && !s.fund.pitched && s.screen==='event'` → `s.screen='pitch'`

- [ ] **Step 1: Write the failing tests**

```js
test('lawsuit only with crowd deal and a cut',()=>{const {run}=load();newProject(run);run('Math.random=()=>0');
  run(`signDeal('crowd',10)`);assert.equal(run('crowdLawsuit()'),0);run(`cutFeature('scope')`);assert.equal(run('crowdLawsuit()'),5);
  run('Math.random=()=>0.999');assert.equal(run('crowdLawsuit()'),0);});
test('v2 save without fund at pit_meet shows the pitch',()=>{const {run}=load();newProject(run);
  run(`S.round=stepIndex('pit_meet');S.screen='event';delete S.fund;delete S.skip`);const s=run('normalizeProject(S,C)');
  assert.equal(s.screen,'pitch');assert.equal(s.fund.pitched,false);assert.deepEqual([...s.skip],[]);});
test('v2 save later in the project counts as pitched, old publisher bonus becomes a deal',()=>{const {run}=load();newProject(run);
  run(`S.round=8;delete S.fund;S.publisher=true;S.milestone={at:'beta',reward:15,done:false}`);const s=run('normalizeProject(S,C)');
  assert.equal(s.fund.pitched,true);assert.equal(s.milestone,undefined);assert.equal(s.fund.deals[0].rates.beta,15);});
test('pending renegotiation survives save and load',()=>{const {run}=load();newProject(run);
  run(`S.fund.renego=true;S.screen='milestone'`);const s=run('normalizeProject(JSON.parse(JSON.stringify(S)),C)');
  assert.equal(s.fund.renego,true);assert.equal(s.screen,'milestone');});
```

- [ ] **Step 2: Run** `node --test` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `node --test` → all PASS.
- [ ] **Step 5: Commit** `feat: crowdfunding lawsuit at release and funding save migration`

### Task 6: User interface

**Files:**
- Modify: `js/ui.js` – new `renderPitch(m)` (dispatch `sc==='pitch'` in `renderMain`, add `'pitch'` to `ACTIVE`); `headFor` for kinds `pitch` and `renego`; `renderMilestone` (deal lines, renegotiation and cut controls, `#msNext` disabled while pending); `msBlock` (rates at stake instead of `S.milestone`); dock money panel ~524 (one line per deal); end screen ~1320 (rows Publisher-Raten, Förderung, Crowdfunding, Rückzahlungen, Sammelklage); `css/*` only if a new class is needed
- Test: `tests/ui.test.js`

**Interfaces:**
- Consumes: everything from Tasks 1–5.
- Produces (DOM contract used by tests and bindings):
  - pitch screen: one button per available funder `data-fd="<id>"` with `aria-pressed`, showing name, `money(funderOffer(id,amb))`, `planText(id)`, `FUNDERS[id].d`, „SG x (y %)“ via `winChance`; checkbox `#pitchAmb` („Ambitionierter Pitch: +30 % Geld von Publisher und Investoren, SG +2, Meilenstein-Soll +3“); `#pitchGo` „🎤 Pitch halten (1 Wurf)“ disabled with no selection; `#pitchSelf` „Nur Eigenkapital“. Header line: „Geschätzte Projektkosten {projCost} · Budget {budget}“. Selection lives in a ui-level `pitchDraft={sel:[],amb:false}`, reset after `startPitch`/`selfFund`.
  - milestone screen: per `r.deals` entry one line `{ic} {n}: {txt}`; when `S.fund.renego`: `#renegoGo` „Nachverhandeln (Business SG {dc100(FUND.renegoDc)} · {chance} %)“ and `#renegoAccept` „Halbe Rate akzeptieren“; when `S.fund.cutPending`: label „Der Publisher verlangt eine Streichung“ and one button `data-cut="<id>"` per `cutOptions()`.

- [ ] **Step 1: Write the failing tests**

```js
const html=(run,fn)=>run(`(()=>{const m={innerHTML:'',className:''};${fn}(m);return m.innerHTML})()`);
test('pitch screen lists funders and both buttons',()=>{const {run}=load({ui:true});newProject(run);
  run(`S.round=stepIndex('pit_meet');S.screen='pitch'`);const h=html(run,'renderPitch');
  assert.match(h,/data-fd="pub"/);assert.match(h,/data-fd="crowd"/);assert.match(h,/id="pitchSelf"/);assert.match(h,/id="pitchGo"[^>]*disabled/);});
test('AAA pitch hides grant and crowd',()=>{const {run}=load({ui:true});newProject(run,{tier:'aaa'});
  run(`S.round=stepIndex('pit_meet');S.screen='pitch'`);assert.doesNotMatch(html(run,'renderPitch'),/data-fd="grant"/);});
test('pitch is an active screen',()=>{const {run}=load({ui:true});assert.ok(run(`ACTIVE.includes('pitch')`));});
test('milestone screen blocks Weiter during renegotiation',()=>{const {run}=load({ui:true});newProject(run);
  run(`signDeal('pub',100);S.msResult=msCheck('vs');applyMsOutcome(S.msResult);S.fund.renego=true;S.screen='milestone'`);
  const h=html(run,'renderMilestone');assert.match(h,/id="renegoGo"/);assert.match(h,/id="msNext"[^>]*disabled/);});
test('cut buttons appear when a cut is pending',()=>{const {run}=load({ui:true});newProject(run);
  run(`S.msResult=msCheck('vs');S.msResult.notes=[];S.fund.cutPending=true;S.screen='milestone'`);assert.match(html(run,'renderMilestone'),/data-cut="scope"/);});
test('next-milestone panel shows the rate at stake',()=>{const {run}=load({ui:true});newProject(run);
  run(`signDeal('pub',100)`);assert.match(run('msBlock()'),/Publisher/);});
```

- [ ] **Step 2: Run** `node --test` → FAIL.
- [ ] **Step 3: Implement** the UI per the DOM contract. Reuse existing classes (`opt`, `check`, `btn`, `mini`, `note`, `alert`).
- [ ] **Step 4: Run** `node --test` → all PASS.
- [ ] **Step 5: Verify in the browser** (`preview_start` name `game`, **separate test profile**, never the „Pixelpott Studios“ profile): play an indie project to the pitch, take Publisher + Förderung, reach Vertical Slice; check the pitch screen and a milestone with a deal at 375 px and desktop width (no horizontal scroll), then a second project with „Nur Eigenkapital“ (one pitch round, license card at „Engine & Pipeline“). Screenshot both screens.
- [ ] **Step 6: Commit** `feat(ui): pitch screen, funder lines and milestone decisions`

### Task 7: Docs and wrap-up

**Files:**
- Modify: `README.md` (funding/pitch section), `ROADMAP.md` (stage 3 done, open tuning knobs: offer shares, pitch SGs, `invHype`)

- [ ] **Step 1:** Update both files in German.
- [ ] **Step 2: Run** `node --test` → all PASS.
- [ ] **Step 3: Commit** `docs: describe funders and pitch (stage 3)`
