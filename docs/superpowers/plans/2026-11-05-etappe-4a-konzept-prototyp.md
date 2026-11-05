# Etappe 4a: Ideen-Mixer, USP & Prototyp-Schleife – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Genre, Sub-Genre and genre modifier leave the setup wizard and are chosen in the first concept step on a new „Ideen-Mixer“ screen. On the same screen the player picks one idea card each for Kniff, Schauplatz and Twist, which form the game's USP, and a target audience. The USP gives start hype and a pitch bonus, and at release a critic bonus if it is kept (its quality area reaches the Gold Master target) or a penalty if it is broken. In pre-production the step „Prototyp-Schleife“ gets a push-your-luck screen: each iteration is one W100 roll, successes raise „Fun gefunden“ levels that multiply later gameplay progress from the sprint, failures cost time.

**Architecture:** New module `js/activities.js` (after `js/funding.js`) holds idea cards, audiences, USP math, concept confirmation and the prototype loop. `startGame()` in `js/game.js` no longer needs a genre: all genre-dependent start values move into `applyGenre(genre,sub,gmod)`, which runs at start only when a genre is passed (sequels, tests) and otherwise when the concept is confirmed. `goMonth()` routes to `'concept'` / `'proto'` before the step's event card. The USP hooks into `pitchBonus()`, `reviewScore()`, `sales()` and `sprintDelta()`.

**Tech Stack:** Vanilla JS (browser globals, no build), Node 24 `node:test` + `vm` (`tests/harness.js`), preview config `game` in `.claude/launch.json`.

**Spec:** `docs/superpowers/specs/2026-11-04-phasen-erlebnis-design.md` (sections 3 „Setup-Assistent“, 4, 5 „Konzept“ and „Pre-Production“, 10.4, 11, 12 „Genre erst im Konzept“)

**Scope (stage 4a only):** Ideen-Mixer with genre/sub-genre/modifier, idea cards, USP, Zielgruppe, removal of the genre step from the wizard, sequel genre lock, USP effects (hype, pitch, review), audience effects (sales, review, hype), prototype loop with fun multiplier, save migration. **Not in scope (stage 4b):** feature list and Feature Creep (extras stay in the wizard, `cutOptions()` unchanged), bug list / Bug-Jagd, release delay decision. Multiplayer scope stays the `coopMode` extra. Engine stays the mandatory card at `pre_tech`.

## Global Constraints

- In-game text German, code/identifiers/commits English.
- No build step, no npm dependencies. Tests: `node --test` from the repo root (not `node --test tests/` on Node 24).
- „Genre erst im Konzept: Das Projekt wird mit neutralen Platzhaltern angelegt. Alle genreabhängigen Startwerte (Synergien, Gewichtung, Start-Hype) werden in dem Konzept-Schritt berechnet, in dem das Genre gewählt wird.“
- „Im Assistenten bleiben nur Studio/Director, Produktionsklasse, Dauer, Marke (IP) und Geschäftsmodell.“ Extras stay in the wizard until stage 4b.
- „Leitlinie: Jede Aktivität ist in wenigen Klicks erledigt.“ Both screens work with one click on defaults (concept: „Konzept festlegen“; prototype: „Aufhören“).
- „Große Entscheidungen bekommen eine eigene, auffällige Darstellung“ – the concept screen is a big decision, not an event card.
- Careers must survive: running v2 saves (genre already set) load and play on without the concept screen. `S.v` stays `2`.
- New JS file goes into `index.html` (after `js/funding.js`), the `sw.js` precache list (cache `w100-v8` → `w100-v9`) and `FILES` in `tests/harness.js` (after `js/funding.js`).
- Desktop, tablet and phone (375 px) without horizontal scrolling.

## Numbers and copy (builder's choice, spec §11; all in `js/activities.js`)

```js
const CONCEPT={hand:3,rerolls:1,hype:1,hypeStrong:1,pitchPer:3,revPer:2};
const PROTO={dc:8,step:2,max:4,failZeit:.5,fumbleZeit:1,funStep:.08,maxFun:3};
const AUD={
  casual:{n:'Gelegenheitsspieler',d:'Großer Markt, aber Kritiker rümpfen die Nase.',sales:1.15,rev:-2,hype:0},
  core:{n:'Core-Gamer',d:'Die klassische Zielgruppe. Keine Überraschungen.',sales:1,rev:0,hype:0},
  hard:{n:'Hardcore-Fans',d:'Kleinere Zielgruppe, aber laut und kritikerfreundlich.',sales:.85,rev:2,hype:1}
};
const IDEA_SLOTS={hook:'Kniff',setting:'Schauplatz',twist:'Twist'};
```

`IDEAS` = `{hook:[…],setting:[…],twist:[…]}`, each card `{id,n,ic,a,g}` (`a` = quality area `'gp'|'gfx'|'snd'`, `g` = genre keys it fits):

| slot | id | ic | n | a | g |
|---|---|---|---|---|---|
| hook | loop | ⏳ | Zeitschleife | gp | adventure, puzzle, actadv |
| hook | physics | 🧲 | Physik-Chaos | gp | puzzle, sim, platformer |
| hook | build | 🧱 | Alles ist baubar | gp | survival, sim, strategy |
| hook | rhythm | 🥁 | Kämpfe im Takt | snd | action, rpg, platformer |
| hook | weather | ⛈️ | Lebendiges Wetter | gfx | actadv, sports, survival |
| hook | onebutton | 🔘 | Ein-Knopf-Steuerung | gp | puzzle, platformer, sports |
| hook | dog | 🐕 | Begleiter-Hund | gfx | actadv, adventure, rpg |
| hook | voice | 🎙️ | Sprachsteuerung | snd | adventure, strategy, sim |
| setting | deepsea | 🌊 | Unterwasserstadt | gfx | actadv, survival, adventure |
| setting | ruhr | 🏭 | Ruhrpott 2099 | gfx | action, rpg, strategy |
| setting | office | 🗂️ | Mittelalterliches Großraumbüro | gp | sim, strategy, adventure |
| setting | cpu | 💾 | Im Inneren eines Computers | gfx | puzzle, platformer, action |
| setting | jazz | 🎷 | Jazzbar im All | snd | adventure, rpg, sim |
| setting | cake | 🍰 | Welt aus Kuchen | gfx | platformer, puzzle, sim |
| setting | hotel | 👻 | Geisterhotel | snd | adventure, actadv, survival |
| setting | moon | 🌙 | Mondkolonie | gp | strategy, sim, survival |
| twist | villain | 😈 | Du spielst den Bösewicht | gp | rpg, strategy, actadv |
| twist | liar | 🗣️ | Der Erzähler lügt | snd | adventure, rpg, actadv |
| twist | dream | 💭 | Alles nur geträumt? | gfx | adventure, platformer, puzzle |
| twist | aging | 🕰️ | Die Welt altert mit | gfx | rpg, sim, survival |
| twist | permadeath | ☠️ | Jede Entscheidung ist endgültig | gp | rpg, strategy, survival |
| twist | silent | 🎞️ | Stummfilm-Look | gfx | platformer, adventure, puzzle |
| twist | strangers | 🤝 | Koop mit Fremden | gp | action, survival, sports |
| twist | bossfriends | 🫂 | Die Bosse werden Freunde | snd | action, rpg, platformer |

Rules:
- **USP area** = the area at least two of the three cards share; if all three differ, the hook's area.
- **USP power** (1–3) = 1 + (at least two cards share the area ? 1 : 0) + (at least one card's `g` contains the chosen genre ? 1 : 0).
- **USP name** = `"${hook.n} · ${setting.n} · ${twist.n}"`.
- **On confirm:** hype + `CONCEPT.hype` + (power 3 ? `CONCEPT.hypeStrong` : 0) + `AUD[aud].hype`, clamped 0–10.
- **Pitch:** `pitchBonus()` + `CONCEPT.pitchPer × power`.
- **Kept** ⇔ `S.res[usp.area] >= msTargets('gm')[usp.area]` (Gold Master target of that area). Review: kept → `+CONCEPT.revPer × power`, broken → `−CONCEPT.revPer × power`. No USP (legacy save) → 0.
- **Audience:** sales × `AUD[aud].sales`, review + `AUD[aud].rev`; missing `S.aud` counts as `core`.
- **Prototype:** iteration SG (d20 scale) = `PROTO.dc + PROTO.step × n` (n = iterations done) → W100 35/45/55/65, stat Design. Success: fun +1 (crit +2), capped at `maxFun`. Failure: Zeit −`failZeit`. Fumble: Zeit −`fumbleZeit` and fun −1 (min 0). After `max` iterations the loop ends by itself. Sprint gameplay gain × `1 + funStep × fun`.

## Review Focus

1. **Old running save with a genre:** loads, concept counts as done, prototype counts as done once the save is past `pre_proto`, no new screen pops up; a save with `genre:null` and a pending concept is **not** discarded by the genre check in `normalizeProject`. → tests in Task 1 and Task 4.
2. **Reload on the concept or prototype screen:** a save standing on `screen:'event'` at `con_ideas` with a pending concept (or at `pre_proto` with a pending loop) comes back on that screen. → test in Task 4.
3. **Rendering before a genre exists:** HUD, sidebar (`qualPanel`, `reviewForecast`), `genreName()` and the export line work with `S.genre===null`. → test in Task 5.
4. **Sequels:** a sequel of a game whose hall entry has `gk` starts with that genre locked (concept screen shows it, cannot change it); an old hall entry without `gk` gives a free choice. → tests in Task 1 and Task 5.
5. **Prototype edges:** fumble at fun 0 stays at 0, crit at fun 2 caps at 3, the 4th iteration ends the loop, a skipped `pre_proto` (`S.skip`) never opens the screen. → tests in Task 3.

---

### Task 1: Genre-free project start (`applyGenre`)

**Files:**
- Modify: `js/game.js` (`startGame` 373–492, `genreName` 40–46, `gameOver` hall push ~1269, `finishGame` hall push ~1753)
- Modify: `js/storage.js` (`normalizeProject`, genre check ~178; export line ~372)
- Modify: `tests/harness.js` (`newProject`)
- Test: `tests/activities.test.js` (new)

**Interfaces:**
- Produces: `applyGenre(genre:string, sub:string|null, gmod:string|null) -> void` (mutates `S`: `genre`, `subGenre`, `gmod`, `res`, `stats`, `aff`, `trendHot`, `trendCold`; calls `recalcQual()`; adds a log line). `startGame(o)` accepts a missing `o.genre`; then `S.genre=S.subGenre=S.gmod=null`, `S.aff=0`, `S.trendHot=S.trendCold=false`. New start option `o.actsDone` (tests only): marks concept and prototype as done. `S.concept` (shape from Task 2; in this task create it as `{done:!!o.actsDone, lock:!!o.genre}` and let Task 2 extend it), `S.proto={n:0,fun:0,done:!!o.actsDone}`, `S.usp=null`, `S.aud='core'`. Hall entries get `gk` (genre key) and `sk` (sub-genre key).

- [ ] **Step 1: Write the failing tests** in `tests/activities.test.js`

```js
const test=require('node:test'),assert=require('node:assert/strict');
const {load,newProject,CAREER}=require('./harness');
const start=(run,o={})=>{run(CAREER);run(`startGame(${JSON.stringify({title:'T',tier:'indie',model:'kauf',ip:'neu',extras:[],dur:'normal',...o})})`)};
test('project starts without a genre',()=>{const {run}=load();start(run);
  assert.equal(run('S.genre'),null);assert.equal(run('S.aff'),0);assert.equal(run('S.res.gp'),22);assert.equal(run('genreName(S)'),'Genre offen');});
test('applyGenre adds the same start values as a genre passed at start',()=>{
  const a=load();a.run('Math.random=()=>0.5');start(a.run,{genre:'rpg',subGenre:'crpg',gmod:'roguelike'});
  const b=load();b.run('Math.random=()=>0.5');start(b.run);b.run(`applyGenre('rpg','crpg','roguelike')`);
  for(const k of ['gp','gfx','snd','hype','bugs','qual'])assert.equal(b.run(`S.res.${k}`),a.run(`S.res.${k}`),k);
  assert.deepEqual({...b.run('S.stats')},{...a.run('S.stats')});assert.equal(b.run('S.subGenre'),'crpg');});
test('normalizeProject keeps a pending concept without genre',()=>{const {run}=load();start(run);
  assert.notEqual(run('normalizeProject(JSON.parse(JSON.stringify(S)),C)'),null);});
test('hall entry stores genre keys',()=>{const {run}=load();newProject(run);run(`gameOver('moral')`);
  assert.equal(run('C.hall[0].gk'),'rpg');});
```

(`Math.random` is pinned so trend rolls match; if `rollMarketTrend` makes the two runs differ, pin `C.trend` to the same object in both instead.)

- [ ] **Step 2: Run** `node --test` — Expected: the four new tests FAIL (`applyGenre is not defined`, genre not null).

- [ ] **Step 3: Implement.** Move every genre-dependent part of `startGame` into `applyGenre`: genre/sub-genre `b` bonuses, modifier with `MOD_SYN`/`MOD_CLASH`, model-fit hype, trend hot/cold hype and flags, director affinity (`aff`, its gp/gfx bonus, `spezial` perk), genre/sub-genre `stats`, then clamp hype 0–10, `recalcQual()`, log `<span>${stepTag()}</span> Konzept: ${genreName(S)}…`. `startGame` keeps non-genre stats (extras `statBonus`) and calls `applyGenre` only when `o.genre` is given; the start-hype cap (0–6) stays in `startGame` before that call. `genreName` returns `'Genre offen'` when `sObj.genre` is falsy. Both hall pushes use `genreName(S)` and add `gk:S.genre,sk:S.subGenre`. `normalizeProject`: skip the „Laufendes Projekt mit altem Genre verwerfen“ check when `s.genre==null && s.concept && !s.concept.done`. Export line: `GENRES[S.genre]?.n||'Genre offen'`. Harness `newProject` adds `actsDone:true` to the defaults (overridable).

- [ ] **Step 4: Run** `node --test` — Expected: all tests PASS (old 188 + new).

- [ ] **Step 5: Commit** `git commit -m "refactor: apply genre start values separately from project start"`

---

### Task 2: Activities module – idea cards, USP, audience, concept confirmation

**Files:**
- Create: `js/activities.js`
- Modify: `index.html` (script after `js/funding.js`), `sw.js` (precache + `w100-v9`), `tests/harness.js` (`FILES`)
- Modify: `js/game.js` (`goMonth` 494, `startGame` concept init)
- Test: `tests/activities.test.js`

**Interfaces:**
- Consumes: `applyGenre` (Task 1), `msTargets(id,s)` (milestones.js), `STEPS`, `goMonth`.
- Produces (all in `js/activities.js`): constants from „Numbers and copy“; `defaultConcept(lock:boolean) -> {done:false,lock,hand:{hook:string[],setting:string[],twist:string[]},rerolls:number}` (hand = `CONCEPT.hand` distinct random ids per slot); `ideaById(slot,id) -> card|null`; `rerollHand() -> boolean` (redraws all slots if `S.concept.rerolls>0`, decrements); `conceptDue(s=S) -> boolean` (`!s.concept.done && STEPS[s.round]?.id==='con_ideas'`); `uspArea(ids:[h,s,t]) -> 'gp'|'gfx'|'snd'`; `uspPower(ids, genre) -> 1|2|3`; `confirmConcept({genre,sub,gmod,picks:{hook,setting,twist},aud}) -> boolean` (returns false and changes nothing if a pick is not in the hand, the genre is unknown, or `aud` is not in `AUD`; with `S.concept.lock` the passed genre is ignored; otherwise calls `applyGenre`; sets `S.usp={ids,area,power,n}`, `S.aud`, adds hype, `S.concept.done=true`, logs, calls `goMonth()`); `uspTarget(s=S) -> number`; `uspKept(s=S) -> boolean`; `uspRev(s=S) -> number`; `audSales(s=S) -> number`; `audRev(s=S) -> number`. `goMonth` sends a due concept to `S.screen='concept'` (after mandatory cards, before the pitch check). `startGame` sets `S.concept=defaultConcept(!!o.genre)` and `S.concept.done=!!o.actsDone`.

- [ ] **Step 1: Write the failing tests**

```js
test('new project opens the concept screen with a drawn hand',()=>{const {run}=load();start(run);
  assert.equal(run('S.screen'),'concept');for(const k of ['hook','setting','twist'])assert.equal(run(`new Set(S.concept.hand.${k}).size`),3);});
test('USP area and power',()=>{const {run}=load();
  assert.equal(run(`uspArea(['rhythm','jazz','liar'])`),'snd');assert.equal(run(`uspArea(['weather','office','liar'])`),'gfx');
  assert.equal(run(`uspPower(['rhythm','jazz','liar'],'rpg')`),3);assert.equal(run(`uspPower(['weather','office','liar'],'puzzle')`),1);});
test('confirmConcept applies genre, USP, audience and hype',()=>{const {run}=load();start(run);
  run(`S.concept.hand={hook:['rhythm','loop','dog'],setting:['jazz','moon','cake'],twist:['liar','dream','aging']};S.res.hype=2`);
  assert.equal(run(`confirmConcept({genre:'rpg',sub:'jrpg',gmod:null,picks:{hook:'rhythm',setting:'jazz',twist:'liar'},aud:'hard'})`),true);
  assert.equal(run('S.genre'),'rpg');assert.equal(run('S.usp.area'),'snd');assert.equal(run('S.usp.power'),3);
  assert.ok(run('S.res.hype')>=2+1+1+1);assert.equal(run('S.concept.done'),true);assert.equal(run('S.screen'),'event');});
test('confirmConcept rejects a card outside the hand',()=>{const {run}=load();start(run);
  run(`S.concept.hand.hook=['loop','dog','voice']`);
  assert.equal(run(`confirmConcept({genre:'rpg',sub:null,gmod:null,picks:{hook:'rhythm',setting:S.concept.hand.setting[0],twist:S.concept.hand.twist[0]},aud:'core'})`),false);
  assert.equal(run('S.genre'),null);});
test('locked genre ignores the passed genre',()=>{const {run}=load();start(run,{genre:'puzzle',subGenre:'logic'});
  const h=run('S.concept.hand');run(`confirmConcept({genre:'rpg',sub:'jrpg',gmod:null,picks:{hook:'${h.hook[0]}',setting:'${h.setting[0]}',twist:'${h.twist[0]}'},aud:'core'})`);
  assert.equal(run('S.genre'),'puzzle');});
test('reroll only once',()=>{const {run}=load();start(run);assert.equal(run('rerollHand()'),true);assert.equal(run('rerollHand()'),false);});
test('USP kept or broken changes the review',()=>{const {run}=load();newProject(run);
  run(`S.usp={ids:['weather','deepsea','dream'],area:'gfx',power:3,n:'x'}`);
  run(`S.res.gfx=uspTarget()`);const kept=run('reviewScore(50)');
  run(`S.res.gfx=uspTarget()-1`);const broken=run('reviewScore(50)');
  assert.equal(run('uspRev()'),-6);assert.ok(kept-broken>=11);});
test('audience multiplies sales and shifts the review',()=>{const {run}=load();newProject(run);
  run(`S.aud='casual'`);assert.equal(run('audSales()'),1.15);assert.equal(run('audRev()'),-2);
  run(`delete S.aud`);assert.equal(run('audSales()'),1);});
```

- [ ] **Step 2: Run** `node --test` — Expected: new tests FAIL (`uspArea is not defined`, screen `'event'`).

- [ ] **Step 3: Implement** `js/activities.js` per the interface and the „Numbers and copy“ table; register the file in `index.html`, `sw.js` (bump to `w100-v9`) and harness `FILES`. Wire `goMonth`. Add `uspRev(S)+audRev(S)` to the sum in `reviewScore` (`js/game.js` ~1454) and `audSales(S)` to `mult` in `sales()` (~1570). Confirm log text: `<span>${stepTag()}</span> 💡 Konzept steht: ${genreName(S)} · USP „${n}“ (${AREAS[area].n}, Stärke ${power}) · Zielgruppe ${AUD[aud].n}`.

- [ ] **Step 4: Run** `node --test` — Expected: all PASS.

- [ ] **Step 5: Commit** `git commit -m "feat: idea mixer with USP and target audience"`

---

### Task 3: Prototype loop and fun multiplier

**Files:**
- Modify: `js/activities.js`
- Modify: `js/game.js` (`getOpt` ~817, `resolve` ~900, `afterResult` ~909, `curTitle` ~800, `goMonth`)
- Modify: `js/sprint.js` (`sprintDelta` gp term)
- Modify: `js/funding.js` (`pitchBonus` line 63)
- Test: `tests/activities.test.js`

**Interfaces:**
- Consumes: `startRoll`, `resolve`, `goMonth` (game.js); `S.usp` (Task 2).
- Produces: `protoDue(s=S) -> boolean` (`!s.proto.done && STEPS[s.round]?.id==='pre_proto' && !isSkipped(s.round,s)`); `protoDc(s=S) -> number`; `startProto() -> void` (no-op when done); `resolveProto(ok, crit, fumble) -> {ch:[string,number][], txt:string}`; `endProto() -> void` (sets done, logs `🧪 Prototyp abgeschlossen: Fun-Stufe ${fun}`, calls `goMonth()`); `funMult(s=S) -> number`. Roll kind `'proto'` (`getOpt` → `{l:'Prototyp-Iteration',st:'design',dc:protoDc(S),s:{},f:{},bonusV:0}`, `curTitle` → `'Prototyp-Schleife'`, `afterResult('proto')` → `goMonth()`). `goMonth` routes a due loop to `S.screen='proto'` (after mandatory cards). `pitchBonus` adds `s.usp?CONCEPT.pitchPer*s.usp.power:0`.

- [ ] **Step 1: Write the failing tests**

```js
const toProto=run=>run(`S.res.budget=1e9;S.round=stepIndex('pre_proto');S.proto={n:0,fun:0,done:false};goMonth()`);
test('pre_proto opens the prototype screen',()=>{const {run}=load();newProject(run);toProto(run);assert.equal(run('S.screen'),'proto');});
test('skipped pre_proto never opens it',()=>{const {run}=load();newProject(run);run(`S.skip=['pre_proto']`);toProto(run);assert.notEqual(run('S.screen'),'proto');});
test('iteration SG rises',()=>{const {run}=load();newProject(run);run(`S.proto={n:2,fun:0,done:false}`);assert.equal(run('dc100(protoDc())'),55);});
test('success, crit cap, fumble floor, time loss',()=>{const {run}=load();newProject(run);
  run(`S.proto={n:0,fun:2,done:false};resolveProto(true,true,false)`);assert.equal(run('S.proto.fun'),3);
  run(`S.proto={n:0,fun:0,done:false};S.res.zeit=5;resolveProto(false,false,true)`);assert.equal(run('S.proto.fun'),0);assert.equal(run('S.res.zeit'),4);
  run(`S.res.zeit=5;resolveProto(false,false,false)`);assert.equal(run('S.res.zeit'),4.5);});
test('fourth iteration ends the loop',()=>{const {run}=load();newProject(run);run(`S.proto={n:3,fun:1,done:false};resolveProto(true,false,false)`);
  assert.equal(run('S.proto.done'),true);});
test('fun multiplies sprint gameplay',()=>{const {run}=load();newProject(run);run(`S.sprint.focus='gp';S.proto={n:0,fun:0,done:true}`);
  const a=run('sprintDelta().gp');run('S.proto.fun=3');assert.ok(Math.abs(run('sprintDelta().gp')-a*1.24)<1e-9);});
test('USP raises the pitch bonus',()=>{const {run}=load();newProject(run);const a=run('pitchBonus()');
  run(`S.usp={ids:[],area:'gp',power:2,n:'x'}`);assert.equal(run('pitchBonus()'),a+6);});
```

- [ ] **Step 2: Run** `node --test` — Expected: new tests FAIL.

- [ ] **Step 3: Implement** per the interface and the „Prototype“ rule. `resolveProto` increments `n`, applies fun/Zeit, sets `done` when `n>=PROTO.max`, returns notes like `Fun gefunden! Stufe ${fun}` / `Sackgasse – ${fmtSpan(...)} verloren`. In `sprintDelta` multiply only the gp term by `funMult(s)` (guard `typeof funMult==='function'`).

- [ ] **Step 4: Run** `node --test` — Expected: all PASS.

- [ ] **Step 5: Commit** `git commit -m "feat: prototype loop with fun levels"`

---

### Task 4: Save migration

**Files:**
- Modify: `js/storage.js` (`normalizeProject`)
- Test: `tests/activities.test.js`

**Interfaces:**
- Consumes: `defaultConcept`, `stepIndex`, `conceptDue`, `protoDue`.
- Produces: `normalizeProject` fills missing `concept` (genre set → `{done:true,lock:true,hand:{hook:[],setting:[],twist:[]},rerolls:0}`), `proto` (`{n:0,fun:0,done:s.round>stepIndex('pre_proto')}`), `usp` (`null`), `aud` (`'core'`); a pending concept/loop on `screen:'event'` becomes `'concept'`/`'proto'`.

- [ ] **Step 1: Write the failing tests**

```js
test('legacy save with genre counts the concept as done',()=>{const {run}=load();newProject(run);
  run(`S.round=stepIndex('pre_slice');delete S.concept;delete S.proto;delete S.usp;delete S.aud`);
  const s=run('normalizeProject(JSON.parse(JSON.stringify(S)),C)');
  assert.equal(s.concept.done,true);assert.equal(s.proto.done,true);assert.equal(s.usp,null);assert.equal(s.aud,'core');});
test('legacy save before pre_proto can still run the loop',()=>{const {run}=load();newProject(run);
  run(`S.round=stepIndex('pre_tech');delete S.proto`);assert.equal(run('normalizeProject(JSON.parse(JSON.stringify(S)),C)').proto.done,false);});
test('reload on a pending concept or loop restores the screen',()=>{const {run}=load();start(run);
  run(`S.screen='event'`);assert.equal(run('normalizeProject(JSON.parse(JSON.stringify(S)),C)').screen,'concept');
  newProject(run);run(`S.round=stepIndex('pre_proto');S.proto={n:1,fun:1,done:false};S.screen='event'`);
  assert.equal(run('normalizeProject(JSON.parse(JSON.stringify(S)),C)').screen,'proto');});
```

- [ ] **Step 2: Run** `node --test` — Expected: new tests FAIL.
- [ ] **Step 3: Implement** in `normalizeProject` next to the existing funding defaults (before the genre check from Task 1).
- [ ] **Step 4: Run** `node --test` — Expected: all PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: migrate saves for concept and prototype state"`

---

### Task 5: UI – concept screen, prototype screen, wizard without genre step

**Files:**
- Modify: `js/ui.js` (`ACTIVE` line 9, `renderMain` ~1201, `headFor` ~1063, `qualPanel` ~430, `renderSetup` steps 1777–2107, `launchSetupProject` 1647–1659, `ensureSetupDraft`)
- Modify: `css/*.css` only if existing classes (`opts`, `opt`, `choices`, `choice`, `alert`, `row`) do not suffice
- Test: `tests/ui.test.js`

**Interfaces:**
- Consumes: everything from Tasks 1–3.
- Produces: `renderConcept(m)` and `renderProto(m)` (same calling convention as `renderPitch(m)`); module-level `conceptDraft` (`{genre,sub,gmod,picks,aud}` or `null`, initialised from `S` on first render: locked genre or `'rpg'`/default sub, first card of each hand, `aud:'core'`); `uspLine() -> string` (HTML, empty without `S.usp`).

Screen contents:
- **Concept** (`stepLabel()`, title „Ideen-Mixer: Worum geht es?“, highlighted as a big decision with the existing `alert` style): 1. Genre and sub-genre radios and modifier radios – move the markup of wizard step 3 here (hot/cold/engine marks, synergy tags); with `S.concept.lock` show the genre as fixed text „Fortsetzung: Genre steht fest“. 2. Three rows Kniff / Schauplatz / Twist, each three `opt` buttons with `ic n` and area icon, `aria-pressed` for the pick, plus „🔀 Neu mischen (noch ${rerolls}×)“. 3. Live USP preview: name, area, power stars, „Ziel zum Release: ${AREAS[area].n} ≥ ${target}“ (use `msTargets('gm')` with the draft genre applied only after confirm – show the target as „wird nach dem Festlegen berechnet“ while genre is not applied). 4. Audience: three `choice` radios with `n`, `d`, effects. 5. Button „💡 Konzept festlegen“ → `confirmConcept(conceptDraft)`, then `conceptDraft=null`.
- **Prototype** (title „Prototyp-Schleife“): fun level as „Fun gefunden: ●●○“, iterations „${n}/${PROTO.max}“, next SG with `winChance(protoDc(),optMod({st:'design'}))` %, buttons „🎲 Weiter iterieren“ (`startProto`) and „✅ Aufhören“ (`endProto`), note „Jede Fun-Stufe: +8 % Gameplay aus jedem Sprint“.
- `headFor('proto')` → stamp „Pre-Production“, title „Prototyp-Iteration“. `ACTIVE` gains `'concept'`, `'proto'`.
- `qualPanel` appends `uspLine()`: `💡 USP: ${n} · ${AREAS[area].n} ${S.res[area]}/${uspTarget()} ${kept?'✓':'✗'}`.
- **Wizard:** remove step 3 (genre), renumber to 3 steps („Schritt x von 3“, labels and `wizNext`/`wizPrev` texts), summary row „Genre & Ausrichtung“ → „Genre: wird im Konzept festgelegt“ (sequel with `gk`: show it). `launchSetupProject` passes no `genre`/`subGenre`/`gmod`, except for a sequel (`ip` `seq:i`) whose `C.hall[i].gk` exists: then `genre:gk, subGenre:sk`. Keep the draft's `engSpec` for the engine project.

- [ ] **Step 1: Write the failing tests** in `tests/ui.test.js`

```js
const {CAREER}=require('./harness');
const startRaw=(run,o={})=>{run(CAREER);run(`startGame(${JSON.stringify({title:'T',tier:'indie',model:'kauf',ip:'neu',extras:[],dur:'normal',...o})})`)};
const html=(run,fn)=>run(`(()=>{const m={innerHTML:'',className:'',querySelectorAll:()=>[]};${fn}(m);return m.innerHTML})()`);
test('concept screen shows genre, idea rows and audience',()=>{const {run}=load({ui:true});startRaw(run);
  const h=html(run,'renderConcept');assert.match(h,/Ideen-Mixer/);assert.match(h,/Kniff/);assert.match(h,/Schauplatz/);assert.match(h,/Twist/);
  assert.match(h,/Rollenspiel/);assert.match(h,/Hardcore-Fans/);assert.match(h,/Konzept festlegen/);});
test('locked sequel genre is shown as fixed',()=>{const {run}=load({ui:true});startRaw(run,{genre:'puzzle',subGenre:'logic'});
  assert.match(html(run,'renderConcept'),/Genre steht fest/);});
test('sidebar and HUD render before a genre exists',()=>{const {run}=load({ui:true});startRaw(run);
  assert.doesNotThrow(()=>run('qualPanel();renderHud();reviewForecast()'));});
test('prototype screen shows fun and both buttons',()=>{const {run}=load({ui:true});newProject(run);
  run(`S.round=stepIndex('pre_proto');S.proto={n:1,fun:1,done:false}`);const h=html(run,'renderProto');
  assert.match(h,/Weiter iterieren/);assert.match(h,/Aufhören/);assert.match(h,/1\/4/);});
test('wizard has three steps and no genre step',()=>{const {run}=load({ui:true});run('C=null;setupDraft=null');
  const h=html(run,'renderSetup');assert.match(h,/Schritt 1 von 3/);assert.doesNotMatch(h,/Genre & Sub-Genre/);});
```

(Adjust the `html` stub if a render function touches more of `m`; `renderHud` may need the DOM stubs the harness already provides.)

- [ ] **Step 2: Run** `node --test` — Expected: new UI tests FAIL.
- [ ] **Step 3: Implement** the screens, wizard change and `uspLine` as described.
- [ ] **Step 4: Run** `node --test` — Expected: all PASS.
- [ ] **Step 5: Browser check** with preview `game` at `http://127.0.0.1:8123` in a fresh profile (not the user's „Pixelpott Studios“): new career → wizard has 3 steps → concept screen (pick cards, reroll, audience, confirm) → event card of „Ideen sammeln“ → … → `pre_proto` loop (iterate, stop) → sprint shows higher gameplay gain. Check 375 px width for horizontal scroll. Check the console for errors.
- [ ] **Step 6: Commit** `git commit -m "feat(ui): idea mixer and prototype screens, genre leaves the wizard"`

---

### Task 6: Docs

**Files:**
- Modify: `README.md` (project start / phases section), `ROADMAP.md` (stage line: 4a done, 4b open; knobs `CONCEPT`/`PROTO`/`AUD` to tune after playtest; Zielgruppe-dependent cards as content idea for stage 7)

- [ ] **Step 1:** Update both files in German, short.
- [ ] **Step 2: Run** `node --test` — Expected: all PASS.
- [ ] **Step 3: Commit** `git commit -m "docs: describe idea mixer and prototype loop (stage 4a)"`
