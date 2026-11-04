# Influencer & Journalisten Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Influencer (hire with a W100 price roll, surprise stream) and named journalists (reviews, interviews, critical investigation) with hidden genre preferences that are revealed through collaboration.

**Architecture:** All new data and logic goes into a new browser-global script `js/press.js`, loaded after `content-extra.js` and before `storage.js`. The new encounters follow the `fair` pattern in `js/game.js`: each has its own `kind`/screen, a card built by a function, and hooks in `curCard`, `choose`, `getOpt`, `curTitle` and `afterResult`. UI changes go into `js/ui.js`, save defaults into `js/storage.js`.

**Tech Stack:** Vanilla JS (browser globals, no build), Node 24 `node:test` with the vm harness in `tests/harness.js`.

**Spec:** `docs/superpowers/specs/2026-11-04-influencer-journalisten-design.md`

## Global Constraints

- UI text in German, code, identifiers and commits in English.
- Use parody names only, exactly as on the cards. No real names or logos.
- The files use CRLF. Keep CRLF when editing (normalize to LF, edit, write back as CRLF).
- Run tests with `node --test` from the repo root, not `node --test tests/`. vm arrays are cross-realm, so spread them before `deepEqual`.
- Register a new script in all three places: `index.html`, the `CORE` list in `sw.js`, and `FILES` in `tests/harness.js`. Raise the cache to `w100-v8`.
- Only people with an image are playable (`img` non-empty). Data entries without an image may exist.
- Hype is clamped to 0–10 by the existing code. Studio reputation `C.studio.fame` never drops below 0.
- Everything must work at 375 px width without horizontal scrolling.
- Test in the browser only on `http://127.0.0.1:8123`, never on `localhost`, because that origin holds the user's profile.
- All numbers marked *(meine Entscheidung)* in the spec go into the constants `INF` and `PRESS`.

## Review Focus

1. **Reloading during an offer.** The three influencer offers and an open price offer must survive a save and reload unchanged. Reloading must never produce a new roll. Covered by a test in Task 2.
2. **Old saves.** A career without `C.known` and a project without `S.inf`, `S.crunchN`, `S.crisisSeen` or `S.probeSeen` must load and keep running. Covered by a test in Task 1.
3. **Manual dice mode.** When `manual` is on, the player enters their own W100 for the price roll. Covered by a test in Task 2 (`askInfluencer(id, r)`) and the UI in Task 3.
4. **Re-roll ability after a failed stream or investigation roll.** `unapply` must also reverse `fame`. Covered by a test in Task 6.
5. **Too little money for an accepted offer.** Accepting is impossible and the "Annehmen" button is disabled. Covered by tests in Tasks 2 and 3.

---

### Task 1: Press data, reveal helpers, save defaults

**Files:**
- Create: `js/press.js`
- Modify: `index.html`, `sw.js` (CORE + `w100-v8`), `tests/harness.js` (FILES, after `js/content-extra.js`), `js/storage.js` (`normalizeCareer`, `normalizeProject` including its early-return branch), `js/game.js` (`startGame` state init, `apply`/`unapply`/`chip` for `fame`)
- Test: `tests/press.test.js`

**Interfaces:**
- Produces:
  - `INFLUENCERS`: object `{id:{n,tag,img,likes:[genre],dislikes:[genre],reach}}`
  - `INF_KEYS`: ids with `img`
  - `JOURNALISTS`: object `{id:{n,tag,img,outlet,f,likes,dislikes,tone,topics}}`
  - `JOUR_KEYS`
  - `INF`: `{base:50,like:25,dislike:-30,perHype:2,famePer:25,min:5,max:95,free:90,normal:60,double:30,price:4,maxHired:2,offerN:3,streamChance:.08}`
  - `PRESS`: `{reviewN:3,prefShift:6,toneHit:10,probeStart:3,probePer:.05,probeMax:.3,probeDc:12,prCost:6,prBase:.25,prPer:.05,streamDc:13}`
  - `defaultInf()` returns `{offer:null,asked:[],hired:[],stream:false,pending:null}`
  - `infBock(id) → number`
  - `infLikes(id)` returns `1`, `0` or `-1` for `S.genre`; `jourLikes(id)` the same
  - `revealInf(id)`, `revealJour(id, part)` with `part` `'pref'` or `'tone'`
  - `infKnown(id) → bool`, `jourKnown(id, part) → bool`
  - `apply`/`unapply` understand key `fame` (changes `C.studio.fame`, clamped ≥ 0); the chip label is `Studio-Ruf`.

Data:
- `INFLUENCERS`: all 28 people from `raw-assets/influencer/PROMPTS.md`, with these ids in table order: zockrange, pietschmiede, quack, traimax, schrapnell, brawlstern, blockbau, blech, flood, rundenbulle, palooten, papaplatine, knoss, pewdiebrie, markimulti, ninjoy, shroudless, pokiwave, asmonmold, septicsky, germa, bohnemann, garderobe, bombhoff, kracher, pizzanth, nerdstah, nanoschneider.
  - Name, image file and likes/dislikes come from `PROMPTS.md`. Map the plain-text genres with the table in spec §4.1. Erik Zockrange's preferences are under the image table.
  - `tag` is a short German version of the card title.
  - The 5 people without an image get `img:''`.
  - Reach as in spec §4.1. Nerdstah and Nanoschneider preferences as in spec §4.1.
- `JOURNALISTS`: ids heiko, pixelheim, weber, hopfen, peschkeller, zeitschmidt, schotter, stangenfeuer, flott, schnaeppchen, rpgheven. Values from the table in spec §5.1. Image files from `PROMPTS.md`.
  - `outlet`/`f`: heiko Spieleheld/gp, pixelheim PC Gamma/gp, weber Polygone/gp, hopfen Eurogamez/gp, peschkeller 5Spieler/gp, zeitschmidt Gamestern/gp, schotter Kotakuh/gfx, stangenfeuer IGM/gfx, flott Retro Gamer Zone/gp, schnaeppchen Pixel World/gfx, rpgheven Ohrwurm Magazin/snd.

- [ ] **Step 1: Write the failing tests**

```js
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('fs'),path=require('path');
const {load,newProject}=require('./harness');
test('press data is complete and images exist',()=>{const {run}=load();
  assert.equal(run('Object.keys(INFLUENCERS).length'),28);assert.equal(run('INF_KEYS.length'),23);
  assert.equal(run('JOUR_KEYS.length'),11);
  for(const [L,keys] of [['INFLUENCERS','INF_KEYS'],['JOURNALISTS','JOUR_KEYS']])for(const k of run(`[...${keys}]`)){
    const d=run(`${L}['${k}']`);assert.ok(fs.existsSync(path.join(__dirname,'..',d.img)),d.img);
    for(const g of [...d.likes,...d.dislikes])assert.ok(run(`!!GENRES['${g}']`),`${k}: ${g}`);}
  assert.deepEqual([...run(`INFLUENCERS.zockrange.likes`)].sort(),['adventure','survival']);
  assert.deepEqual([...run(`INFLUENCERS.zockrange.dislikes`)],['sports']);
  assert.equal(run('INFLUENCERS.zockrange.reach'),3);
  assert.ok(run(`JOURNALISTS.peschkeller.topics.includes('finanzen')`));});
test('bock follows genre, hype and fame',()=>{const {run}=load();newProject(run,{genre:'survival'});
  run('S.res.hype=0;C.studio.fame=0');assert.equal(run(`infBock('zockrange')`),75);
  run(`S.genre='sports'`);assert.equal(run(`infBock('zockrange')`),20);
  run(`S.genre='rpg';S.res.hype=5;C.studio.fame=50`);assert.equal(run(`infBock('zockrange')`),62);
  run(`S.genre='sports';S.res.hype=0;C.studio.fame=0`);run(`INFLUENCERS.zockrange.dislikes=['sports','rpg']`);
  run(`S.genre='survival';INFLUENCERS.zockrange.likes=['survival'];S.res.hype=10;C.studio.fame=1000`);
  assert.equal(run(`infBock('zockrange')`),95);});
test('reveal is per career and starts hidden',()=>{const {run}=load();newProject(run);
  assert.equal(run(`infKnown('zockrange')`),false);run(`revealInf('zockrange')`);assert.ok(run(`infKnown('zockrange')`));
  assert.equal(run(`jourKnown('heiko','tone')`),false);run(`revealJour('heiko','tone')`);
  assert.ok(run(`jourKnown('heiko','tone')`));assert.equal(run(`jourKnown('heiko','pref')`),false);});
test('fame effect applies, clamps and unapplies',()=>{const {run}=load();newProject(run);
  run('C.studio.fame=3');const ch=run('apply({fame:-5})');assert.equal(run('C.studio.fame'),0);
  run('C.studio.fame=3');const ch2=run('apply({fame:2})');assert.equal(run('C.studio.fame'),5);
  run(`unapply(${JSON.stringify([['fame',2]])})`);assert.equal(run('C.studio.fame'),3);
  assert.match(run(`chip(['fame',2])`),/Studio-Ruf/);});
test('old saves get press defaults',()=>{const {run}=load();newProject(run);
  run('delete C.known;delete S.inf;delete S.crunchN;delete S.crisisSeen;delete S.probeSeen');
  run('normalizeCareer(C);normalizeProject(S,C)');
  assert.deepEqual({...run('C.known.inf')},{});assert.equal(run('S.inf.hired.length'),0);
  assert.equal(run('S.crunchN'),0);assert.equal(run('S.probeSeen'),false);});
```

- [ ] **Step 2:** Run `node --test`. Expect FAIL: `INFLUENCERS is not defined`.
- [ ] **Step 3: Implement the data and helpers in `js/press.js`, register the script, add the `fame` key to `apply`/`unapply`/`chip`, and add the defaults.**
  - `infBock`: `clamp(INF.base + like·INF.like + dislike·INF.dislike + S.res.hype·INF.perHype + floor(C.studio.fame/INF.famePer), INF.min, INF.max)`.
  - `C.known={inf:{},jour:{}}`.
  - `startGame` initializes `inf:defaultInf(),crunchN:0,crisisSeen:false,probeSeen:false`.
- [ ] **Step 4:** Run `node --test`. Expect all PASS (149 old + new).
- [ ] **Step 5:** Commit `feat: add press data, reveal helpers and save defaults`. Include the untracked folders `raw-assets/influencer/` (with `PROMPTS.md`) and `raw-assets/journalist/`, because the game loads these images.

### Task 2: Hiring influencers (logic)

**Files:**
- Modify: `js/press.js`, `js/data.js` (remove the SHOP entry `influencer`)
- Test: `tests/press.test.js`

**Interfaces:**
- Consumes: Task 1 (`INF`, `INF_KEYS`, `infBock`, `infLikes`, `revealInf`, `defaultInf`)
- Produces:
  - `infOffers() → string[]` (3 ids). Drawn once per `curPhase()` and stored in `S.inf.offer={ph,ids}`. Excludes ids in `S.inf.asked`.
  - `infPrice(id) → number`: `INF.price × reach × T().scale`
  - `askInfluencer(id, r?)`: r defaults to `d100()`. Sets `S.inf.pending={id,r,total,tier,price}` with tier `'free'|'normal'|'double'|'refuse'` and adds `id` to `S.inf.asked`. A refusal also clears `pending` right away and sets `S.shopMsg`. Returns the tier.
  - `acceptInfluencer() → bool`: false if no pending, budget < price or `hired.length >= INF.maxHired`.
  - `declineInfluencer()`
  - `infCanAsk(id) → bool`: not asked, `hired.length < maxHired`, no pending.

Price tier comes from `total = r + (infBock(id) − 50)`: ≥ 90 `free` (price 0), 60–89 `normal`, 30–59 `double` (2×), < 30 `refuse`.

Effect on accept:
- via `apply`: `{hype:reach, wl:2·reach}`; if `infLikes(id)===-1`, `{hype:floor(reach/2), wl:reach}`
- the price is deducted like a shop purchase (`S.res.budget`, `S.spend.invest`)
- `revealInf(id)`, add `id` to `S.inf.hired`, `S.shopMsg` with chips, `addLog`

- [ ] **Step 1: Write the failing tests**

```js
test('offers are stable within a phase and skip asked ones',()=>{const {run}=load();newProject(run);
  const a=[...run('infOffers()')];assert.equal(a.length,3);
  assert.deepEqual([...run('infOffers()')],a);
  run(`S.inf=JSON.parse(JSON.stringify(S.inf))`);assert.deepEqual([...run('infOffers()')],a);});
test('price tiers follow roll plus bock',()=>{const {run}=load();newProject(run,{genre:'survival'});
  run('S.res.hype=0;C.studio.fame=0;S.res.budget=1e9');// bock 75 → total = r+25
  assert.equal(run(`askInfluencer('zockrange',70)`),'free');assert.equal(run('S.inf.pending.price'),0);
  run('S.inf=defaultInf()');assert.equal(run(`askInfluencer('zockrange',40)`),'normal');
  assert.equal(run('S.inf.pending.price'),run(`infPrice('zockrange')`));
  run('S.inf=defaultInf()');assert.equal(run(`askInfluencer('zockrange',10)`),'double');
  run(`S.inf=defaultInf();S.genre='sports'`);assert.equal(run(`askInfluencer('zockrange',30)`),'refuse');
  assert.equal(run('S.inf.pending'),null);assert.ok(run(`S.inf.asked.includes('zockrange')`));});
test('accepting applies reach and reveals',()=>{const {run}=load();newProject(run,{genre:'survival'});
  run(`S.res.hype=0;S.res.budget=1e9;askInfluencer('zockrange',99)`);
  assert.ok(run('acceptInfluencer()'));assert.equal(run('S.res.hype'),3);
  assert.ok(run(`infKnown('zockrange')`));assert.ok(run(`S.inf.hired.includes('zockrange')`));});
test('disliked genre halves the effect',()=>{const {run}=load();newProject(run,{genre:'sports'});
  run(`S.res.hype=0;S.res.budget=1e9;askInfluencer('zockrange',99);acceptInfluencer()`);
  assert.equal(run('S.res.hype'),1);});
test('accept fails without money and after two hires',()=>{const {run}=load();newProject(run);
  run(`S.res.budget=0;askInfluencer('blech',99)`);run(`S.inf.pending.price=5`);
  assert.equal(run('acceptInfluencer()'),false);
  run(`S.inf=defaultInf();S.inf.hired=['a','b']`);assert.equal(run(`infCanAsk('blech')`),false);});
test('pending offer survives a save round-trip',()=>{const {run}=load();newProject(run);
  run(`S.res.budget=1e9;askInfluencer('blech',50)`);const p=JSON.stringify(run('S.inf.pending'));
  run('save();load_()');assert.equal(JSON.stringify(run('S.inf.pending')),p);});
test('old influencer shop item is gone',()=>{const {run}=load();assert.equal(run(`SHOP.some(x=>x.id==='influencer')`),false);});
```

The save round-trip test calls the real save and load functions from `js/storage.js`. Replace `load_()` with the real name. If there is no load function without UI, serialize `S` through JSON and pass it to `normalizeProject`.

- [ ] **Step 2:** Run `node --test`. Expect FAIL: `infOffers is not defined`.
- [ ] **Step 3: Implement the functions above in `js/press.js` and remove the SHOP entry.**
  - Offer draw: random without replacement from `INF_KEYS` minus `asked`. If fewer than 3 remain, return all that remain.
- [ ] **Step 4:** Run `node --test`. Expect all PASS.
- [ ] **Step 5:** Commit `feat: hire influencers with a W100 price roll`.

### Task 3: Shop UI for influencers and the press album

**Files:**
- Modify: `js/ui.js` (`renderShop`, `renderLegendsView`, `legendFilter`)
- Test: `tests/press.test.js`

**Interfaces:**
- Consumes: Task 2 (`infOffers`, `infCanAsk`, `askInfluencer`, `acceptInfluencer`, `declineInfluencer`, `infPrice`), Task 1 (`infKnown`, `jourKnown`)
- Produces:
  - `infShopHTML() → string`, rendered in the shop "Investieren" tab when the filter is `Marketing` or `all`
  - `pressAlbumHTML() → string`
  - `legendFilter` value `'press'`

Shop block „📣 Influencer anfragen“:
- one card per offer, with:
  - the portrait (`charPortraitHTML(img,false,'sm',false,n)`)
  - name and `tag`
  - Reichweite as ★ × reach
  - known preferences as genre names, otherwise „Mag: ??? · Mag nicht: ???“
  - the normal price
- Button `data-infask="<id>"`, disabled when `!infCanAsk(id)`.
- When `manual` is on, an `<input type="number" min="1" max="100" id="infR">` appears next to it. Its value goes to `askInfluencer` as `r`. Invalid input: the button does nothing.
- With `S.inf.pending`, the block shows the roll (`W100 r + (Bock−50) = total`), the tier text („Hat richtig Bock – macht es kostenlos“ / „Normalpreis“ / „Will das Doppelte“), the price and the buttons `id="infAccept"` (disabled when budget < price) and `id="infDecline"`.
- Under the block: „Angeheuert: x / 2“.

Album:
- a fourth sub-tab `data-lfilt="press"` with the label „📰 Presse & Streamer“ in `renderLegendsView`
- shows all `INF_KEYS` and `JOUR_KEYS` as cards with portrait, name and tag
- preferences or „???“; for journalists also the „Lieblingston“ (`IV_TONES`) or „???“

- [ ] **Step 1: Write the failing tests**

```js
const html=(run,fn)=>run(`(()=>{const m={innerHTML:'',className:'',querySelectorAll:()=>[]};${fn}(m);return m.innerHTML})()`);
test('shop shows influencer offers with hidden prefs',()=>{const {run}=load({ui:true});newProject(run);
  const h=run('infShopHTML()');assert.equal((h.match(/data-infask=/g)||[]).length,3);assert.match(h,/\?\?\?/);});
test('pending offer shows accept disabled without money',()=>{const {run}=load({ui:true});newProject(run);
  run(`S.res.budget=1e9;askInfluencer('blech',50);S.res.budget=0;S.inf.pending.price=5`);
  assert.match(run('infShopHTML()'),/id="infAccept"[^>]*disabled/);});
test('manual mode shows a roll input',()=>{const {run}=load({ui:true});newProject(run);
  run('manual=true');assert.match(run('infShopHTML()'),/id="infR"/);});
test('press album lists streamers and journalists',()=>{const {run}=load({ui:true});newProject(run);
  run(`revealInf('zockrange')`);const h=run('pressAlbumHTML()');
  assert.match(h,/Erik Zockrange/);assert.match(h,/André Peschkeller/);assert.match(h,/Survival/);});
```

If `manual` is not assignable from the vm (a `let` in `ui.js`), use the setter that already exists. Otherwise add a small `setManual(v)` and use it in the test.

- [ ] **Step 2:** Run `node --test`. Expect FAIL: `infShopHTML is not defined`.
- [ ] **Step 3:** Implement and wire the click handlers in `renderShop` (`data-infask`, `infAccept`, `infDecline` → then `render();save()`). Add the album sub-tab.
- [ ] **Step 4:** Run `node --test`. Expect all PASS. Then open the browser on `http://127.0.0.1:8123`:
  - Shop/Marketing: ask, accept, decline at desktop width and at 375 px. No horizontal scrolling.
  - Check the album tab.
- [ ] **Step 5:** Commit `feat: influencer shop block and press album`.

### Task 4: Surprise stream encounter

**Files:**
- Modify: `js/press.js`, `js/game.js` (`afterMonth`, `curCard`, `choose`, `getOpt`, `curTitle`, `afterResult`), `js/ui.js` (`ACTIVE`, `editable` list, `headFor`, screen routing, `rnd` class lists, `resultNextLabel`)
- Test: `tests/press.test.js`

**Interfaces:**
- Consumes: Task 1 (`INF_KEYS`, `infBock`, `infLikes`, `revealInf`)
- Produces:
  - `streamDue() → bool`: `!S.inf.stream && S.round>=stepIndex('prod_fp') && S.round<STEPS.length-1 && Math.random()<INF.streamChance`
  - `startStream() → bool`: picks from `INF_KEYS`, with `zockrange` in the pool twice. Sets `S.stream=id`, `S.inf.stream=true`, `S.screen='stream'`.
  - `streamCard(id)` returns `{t,x,o:[live,key,pass]}`
  - kind/screen `'stream'`

Card (spec §4.4):
- `t`: „Live-Stream: <n>“. `x`: „<n> hat eure Demo entdeckt und will sie heute Abend live spielen.“
- `o[0]` „Live dazuschalten“: `{st:'business',dc:PRESS.streamDc,bonusV:D().s.hype*4+Math.round((infBock(id)-50)/5),s:{hype:2*reach,wl:3*reach},f:{hype:-(reach+1)}}`. `getOpt` uses `bonusV` already (check `optMod`/`resolve`; if not, add it to the stream option the same way as for `legend`).
- `o[1]` „Nur Key schicken“: `safe` is `{hype:reach}` when liked, `{hype:1}` when neutral, `{}` when disliked.
- `o[2]` „Absagen“: `safe:{}`.
- `afterResult('stream')`: if `S.last.oi!==2`, call `revealInf(S.stream)`. Then `afterRandom()`.
- In `afterMonth`, the order is: legend, fair, `if(streamDue()&&startStream())return;`, then the investigation (Task 6), then the interview.
- `headFor('stream',id)`: stamp „📺 Live-Stream · Ende <Schritt>“, portrait, name, tag and `x`.

- [ ] **Step 1: Write the failing tests**

```js
test('stream waits for first playable and comes once',()=>{const {run}=load();newProject(run);
  run(`Math.random=()=>0;S.round=stepIndex('prod_fp')-1`);assert.equal(run('streamDue()'),false);
  run(`S.round=stepIndex('prod_fp')`);assert.ok(run('streamDue()'));
  run('startStream()');assert.equal(run('S.screen'),'stream');assert.equal(run('streamDue()'),false);
  run(`S.inf.stream=false;S.round=STEPS.length-1`);assert.equal(run('streamDue()'),false);});
test('stream options follow the spec',()=>{const {run}=load();newProject(run,{genre:'survival'});
  const o=run(`streamCard('zockrange').o`);
  assert.deepEqual({...o[0].s},{hype:6,wl:9});assert.deepEqual({...o[0].f},{hype:-4});assert.equal(o[0].st,'business');
  assert.deepEqual({...o[1].safe},{hype:3});assert.deepEqual({...o[2].safe},{});
  run(`S.genre='sports'`);assert.deepEqual({...run(`streamCard('zockrange').o[1].safe`)},{});
  run(`S.genre='rpg'`);assert.deepEqual({...run(`streamCard('zockrange').o[1].safe`)},{hype:1});});
test('key reveals, pass does not',()=>{const {run}=load();newProject(run);
  run(`S.stream='blech';S.inf.stream=true;S.screen='stream';S.res.budget=1e9`);run('choose(2)');
  run(`Math.random=()=>0.999;afterResult('stream')`);assert.equal(run(`infKnown('blech')`),false);
  run(`S.stream='blech';S.screen='stream'`);run('choose(1)');run(`afterResult('stream')`);assert.ok(run(`infKnown('blech')`));});
test('live roll resolves through the normal roll',()=>{const {run}=load();newProject(run);
  run(`S.stream='blech';S.res.hype=0;S.pending={kind:'stream',ev:'blech',oi:0};resolve([99])`);
  assert.ok(run('S.last.ok'));assert.ok(run('S.res.hype')>0);assert.match(run(`curTitle('stream','blech')`),/Montana Blech/);});
test('stream screen renders portrait and options',()=>{const {run}=load({ui:true});newProject(run);
  assert.ok(run(`ACTIVE.includes('stream')`));
  const h=run(`headFor('stream','blech')+optsHTML(streamCard('blech'))`);
  assert.match(h,/Montana Blech/);assert.match(h,/data-i="2"/);});
```

- [ ] **Step 2:** Run `node --test`. Expect FAIL: `streamDue is not defined`.
- [ ] **Step 3:** Implement following the `fair` pattern (compare `fairCard`/`startFair` in `js/game.js`).
- [ ] **Step 4:** Run `node --test`. Expect all PASS. Browser: set `S.stream='zockrange';S.screen='stream';render()`, then go through roll, result and Weiter.
- [ ] **Step 5:** Commit `feat: surprise stream encounter`.

### Task 5: Journalists in reviews and interviews

**Files:**
- Modify: `js/game.js` (`buildMetaReviews`, `startInterview`, `ivChance`, `finishInterview`, and the release spot that stores `S.end.critics`), `js/ui.js` (`metaBlock` critic list, `renderInterview` header)
- Test: `tests/press.test.js`

**Interfaces:**
- Consumes: Task 1 (`JOURNALISTS`, `JOUR_KEYS`, `jourLikes`, `revealJour`, `PRESS`)
- Produces:
  - Critic entries get an optional field `j` (journalist id).
  - `S.iv.j` (journalist id) in the interview.

Reviews:
- `buildMetaReviews` draws `PRESS.reviewN` journalists from `JOUR_KEYS`.
- They replace 3 of the 7 pool entries: the pool is 4 `OUTLETS` entries whose name is not the outlet of any drawn journalist, plus 3 entries `{n:J.outlet,f:J.f,b:<b of that outlet>,j:id}`.
- After the existing shift to `meta`, journalist entries get `+PRESS.prefShift` if they like the genre and `−PRESS.prefShift` if they dislike it, then the existing clamp to 10–100. The metascore is the new mean.
- After the release, call `revealJour(j,'pref')` for every `j` in the critics.
- `metaBlock` shows a small portrait and „<Name> · <Magazin>“ for entries with `j`.

Interview:
- `startInterview` sets `S.iv.j` to a random journalist.
- `ivChance` adds `+PRESS.toneHit` when `a.tone===JOURNALISTS[S.iv.j].tone`. Old interviews without `j` add nothing.
- `finishInterview` calls `revealJour(S.iv.j,'tone')`.
- The header in `renderInterview` reads „im Gespräch mit <Name> (<Magazin des Interviews>)“ plus a portrait.

- [ ] **Step 1: Write the failing tests**

```js
test('three of seven critics are journalists',()=>{const {run}=load();newProject(run);
  run('recalcQual()');const r=run('buildMetaReviews(70)');
  assert.equal(r.critics.length,7);assert.equal([...r.critics].filter(c=>c.j).length,3);
  const names=[...r.critics].map(c=>c.n);assert.equal(new Set(names).size,7);});
test('preferences move the metascore by at most 3',()=>{const {run}=load();newProject(run,{genre:'strategy'});
  run('recalcQual()');for(let i=0;i<40;i++){const m=run('buildMetaReviews(70).metascore');assert.ok(Math.abs(m-70)<=3,String(m));}});
test('tone hit adds ten and old interviews still work',()=>{const {run}=load();newProject(run);
  run(`INTERVIEW_OUTLETS[0].bias={};S.iv={o:0,qs:[],i:0,res:[],j:'heiko'}`);const a={p:50,tone:'honest'},b={p:50,tone:'safe'};
  const d=run(`ivChance(${JSON.stringify(a)})-ivChance(${JSON.stringify({...a,tone:'x'})})`);
  assert.equal(d,10);run('delete S.iv.j');assert.equal(run(`ivChance(${JSON.stringify(a)})`),run(`ivChance(${JSON.stringify({...a,tone:'x'})})`));});
test('interview reveals the tone, release reveals prefs',()=>{const {run}=load();newProject(run);
  run(`S.iv={o:0,qs:[],i:0,res:[],j:'heiko'};Math.random=()=>0.999;finishInterview()`);
  assert.ok(run(`jourKnown('heiko','tone')`));});
```

Heiko's `tone` is `honest` (spec §5.1). Add a test for the release reveal at the spot that stores `S.end.critics`: after that function runs, `jourKnown(j,'pref')` is true for every `j` in `S.end.critics`.

- [ ] **Step 2:** Run `node --test`. Expect FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `node --test`. Expect all PASS. Browser: finish an interview and a release, then check the critic list with portraits at 375 px.
- [ ] **Step 5:** Commit `feat: named journalists in reviews and interviews`.

### Task 6: Critical investigation, docs

**Files:**
- Modify: `js/press.js`, `js/game.js` (`monthEnd` crunch counter before `S.sprint.crunch=false`, `openCrisis` sets `S.crisisSeen=true`, `afterMonth`, card hooks as in Task 4, `choose` hook `onSafe`), `js/ui.js` (screen `probe` like `stream`), `README.md`, `ROADMAP.md`
- Test: `tests/press.test.js`

**Interfaces:**
- Consumes: Tasks 1 and 4 (pattern), `JOURNALISTS`, `PRESS`, `apply` with `fame`
- Produces:
  - `probePoints() → {finanzen,versprechen,crunch,personal,monetarisierung}` (numbers)
  - `probeScore() → number` (sum)
  - `probeTopic() → string`
  - `probeJournalist(topic) → id`
  - `probeDue() → bool`, `startProbe() → bool`
  - `probeCard(id)`
  - kind/screen `'probe'`
  - `S.probe={j,topic,score}`

Points, one each:
- finanzen: `S.crisisSeen`, `S.rescued.includes('kredit')`, and a deal with `status==='cancelled'` in `S.fund.deals`
- versprechen: `S.promises>=2`, and a cut (`S.fund.cuts.length`) while a `crowd` deal exists
- crunch: `S.crunchN>=3`
- personal: `S.layoff`
- monetarisierung: `S.lootbox`

Rules:
- `probeTopic`: the topic with the most points, ties broken in the order finanzen, versprechen, crunch, personal, monetarisierung.
- `probeJournalist`: random from `JOUR_KEYS` with the topic in `topics`, otherwise `peschkeller`.
- `probeDue`: `!S.probeSeen && S.round>=PRESS.probeStart && S.round<STEPS.length-1 && score>0 && Math.random()<Math.min(PRESS.probeMax,PRESS.probePer*score)`.
- `S.crunchN` goes up in `monthEnd` exactly once when `crunchOn(S)` holds, before `S.sprint.crunch=false`.

Card (spec §5.4):
- `t`: „<n> recherchiert über euer Studio“. `x` names the topic, e.g. „… fragt nach eurer Finanzierung“.
- `o[0]` „Offen Stellung nehmen“: `{st:'team',dc:PRESS.probeDc+Math.max(0,score-1),s:{hype:1,fame:2},f:{hype:-3,fame:-4}}`
- `o[1]` „Kein Kommentar“: `safe:{hype:-2,fame:-2}`
- `o[2]` „Abwiegeln mit PR-Agentur“: `safe:{budget:-PRESS.prCost}` (`apply` already scales budget by `T().scale`) plus `onSafe()`.
  - With probability `PRESS.prBase+PRESS.prPer*score`, `onSafe` applies `{hype:-4,fame:-6}` and returns the changes and the text „Es fliegt auf: …“.
  - Otherwise it returns no changes and „Die Agentur hält dicht.“
- `choose()`: after `apply(o.safe)`, if `o.onSafe`, append its changes to `ch` and its text to `txt`.
- `afterResult('probe')` → `afterRandom()`.
- In `afterMonth`, after the stream: `if(probeDue()&&startProbe())return;`

Docs:
- README: in feature section 2, or as its own section „### 10. 📣 Influencer & Presse“, add short bullets for hiring, stream, journalists and investigation.
- ROADMAP: remove the item „Influencer & Journalisten“, and note the 5 missing influencer images as open.

- [ ] **Step 1: Write the failing tests**

```js
test('clean studio never gets investigated',()=>{const {run}=load();newProject(run);
  run('Math.random=()=>0;S.round=5');assert.equal(run('probeScore()'),0);assert.equal(run('probeDue()'),false);});
test('each trigger counts and picks the topic',()=>{const {run}=load();newProject(run);
  run('S.crisisSeen=true');assert.equal(run('probePoints().finanzen'),1);
  run(`S.rescued.push('kredit')`);assert.equal(run('probePoints().finanzen'),2);
  run('S.promises=2');assert.equal(run('probePoints().versprechen'),1);
  run('S.crunchN=3;S.layoff=true;S.lootbox=true');
  assert.equal(run('probeScore()'),6);assert.equal(run('probeTopic()'),'finanzen');
  assert.equal(run(`probeJournalist('finanzen')`),'peschkeller');
  assert.ok(run(`JOURNALISTS[probeJournalist('versprechen')].topics.includes('versprechen')`));});
test('crunch counter rises once per crunched step',()=>{const {run}=load();newProject(run);
  run('Math.random=()=>0.999;S.res.budget=1e9;S.res.moral=9;S.sprint.crunch=true');const n=run('S.crunchN');
  run('monthEnd()');assert.equal(run('S.crunchN'),n+1);});
test('probe timing and chance cap',()=>{const {run}=load();newProject(run);
  run('S.crisisSeen=true;Math.random=()=>0;S.round=2');assert.equal(run('probeDue()'),false);
  run('S.round=3');assert.ok(run('probeDue()'));run('startProbe()');assert.equal(run('probeDue()'),false);
  run('S.probeSeen=false;probeScore=()=>8;Math.random=()=>0.29');assert.ok(run('probeDue()'));
  run('Math.random=()=>0.31');assert.equal(run('probeDue()'),false);});
test('probe options and fame floor',()=>{const {run}=load();newProject(run);
  run(`S.crisisSeen=true;S.promises=2;C.studio.fame=1`);const o=run(`probeCard('peschkeller').o`);
  assert.equal(o[0].st,'team');assert.equal(o[0].dc,13);assert.deepEqual({...o[1].safe},{hype:-2,fame:-2});
  run(`S.probe={j:'peschkeller',topic:'finanzen',score:2};S.screen='probe';choose(1)`);assert.equal(run('C.studio.fame'),0);});
test('PR agency costs money and may blow up',()=>{const {run}=load();newProject(run);
  run(`S.crisisSeen=true;S.res.hype=8;C.studio.fame=20;S.probe={j:'peschkeller',topic:'finanzen',score:1};S.screen='probe'`);
  const b=run('S.res.budget');run('Math.random=()=>0;choose(2)');
  assert.ok(run('S.res.budget')<b);assert.equal(run('S.res.hype'),4);assert.equal(run('C.studio.fame'),14);
  run(`S.res.hype=8;S.screen='probe';Math.random=()=>0.99;choose(2)`);assert.equal(run('S.res.hype'),8);});
test('re-roll after a failed probe roll restores fame',()=>{const {run}=load();newProject(run);
  run(`C.studio.fame=10;S.crisisSeen=true;S.probe={j:'peschkeller',topic:'finanzen',score:1};S.pending={kind:'probe',ev:'peschkeller',oi:0};resolve([2])`);
  assert.equal(run('S.last.ok'),false);assert.equal(run('C.studio.fame'),6);
  run(`unapply(S.last.ch)`);assert.equal(run('C.studio.fame'),10);});
```

The `probeCard`/`ev` key: `S.probe.j` is the `ev` of the card. `curCard()` builds `probeCard(S.probe.j)` on screen `probe`. `probeCard` reads `score` from `S.probe` when it is set, otherwise from `probeScore()`.

- [ ] **Step 2:** Run `node --test`. Expect FAIL.
- [ ] **Step 3:** Implement and update the docs.
- [ ] **Step 4:** Run `node --test`. Expect all PASS. Browser: trigger the investigation with `S.crisisSeen=true;S.probe=…;S.screen='probe';render()` and go through all three options. Check at 375 px.
- [ ] **Step 5:** Commit `feat: critical press investigation`.
