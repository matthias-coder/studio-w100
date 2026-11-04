const test=require('node:test'),assert=require('node:assert'),fs=require('fs'),path=require('path');
const {load,newProject,CAREER}=require('./harness');
const noRandom=run=>run('Math.random=()=>0.999');
const TIERS=['indie','aa','aaa'],DURS=['short','normal','long'];

// C1
test('C1 helpers never throw at round 13',()=>{const {run}=load();newProject(run);run('S.round=STEPS.length');
  assert.equal(run('stepCost()'),0);assert.doesNotThrow(()=>run('stepW();stepMonths(13);stepLabel(13)'));});
test('C1 renderHud works on the launch screen (ui.js loaded)',()=>{const {run}=load({ui:true});newProject(run);
  run(`S.round=STEPS.length;S.screen='launch'`);assert.doesNotThrow(()=>run('renderHud()'));});
test('C1 renderHud and budgetAlert work in a normal step',()=>{const {run}=load({ui:true});newProject(run);
  assert.doesNotThrow(()=>run('renderHud();budgetAlert()'));});

// I1
for(const t of TIERS)for(const d of DURS)test(`I1 zeit exactly 2 after 13 steps ${t}/${d}`,()=>{const {run}=load();newProject(run,{tier:t,dur:d});noRandom(run);
  run('S.res.budget=1e12');for(let i=0;i<13;i++)run('monthEnd()');assert.strictEqual(run('S.res.zeit'),2);});
test('I1 two forced delays leave zeit exactly 0',()=>{const {run}=load();newProject(run,{tier:'aaa',dur:'long'});
  run('S.res.budget=1e12');
  for(let i=0;i<13;i++){run(i<2?'Math.random=()=>0':'Math.random=()=>0.999');run('monthEnd()');}
  assert.strictEqual(run('S.res.zeit'),0);});

// I2/I3
test('I2 budget alert is step based',()=>{const {run}=load({ui:true});newProject(run,{tier:'aaa'});
  run('S.res.budget=stepCost()*0.9');assert.match(run('budgetAlert()'),/Pleite droht/);
  run('S.res.budget=stepCost()+stepCost(1)*0.9');assert.match(run('budgetAlert()'),/knapp/);
  run('S.res.budget=1e12');assert.equal(run('budgetAlert()'),'');});
test('I3 no raw float in warning',()=>{const {run}=load({ui:true});newProject(run,{tier:'aaa'});
  run('S.res.budget=stepCost()+stepCost(1)*0.9');assert.doesNotMatch(run('budgetAlert()'),/\d\.\d{3,}/);});

// I4
const legacy=extra=>`Object.assign({title:'Alt',genre:'rpg',subGenre:defaultSub('rpg'),tier:'indie',round:12,res:{budget:40,gp:30,gfx:30}},${JSON.stringify(extra)})`;
test('I4 finished legacy end screen keeps kasse and migrates',()=>{const {run}=load();run(CAREER);run('C.studio.kasse=77');
  const s=run(`normalizeProject(${legacy({screen:'end',end:{}})},C)`);
  assert.ok(s);assert.equal(run('C.studio.kasse'),77);assert.equal(s.v,2);assert.equal(s.round,13);assert.equal(s.durKey,'normal');assert.ok(s.dur>0);});
test('I4 legacy over screen keeps kasse',()=>{const {run}=load();run(CAREER);run('C.studio.kasse=-1');
  const s=run(`normalizeProject(${legacy({screen:'over',round:5})},C)`);
  assert.ok(s);assert.equal(run('C.studio.kasse'),-1);});

// M1: the real acc/tick definitions from game.js, rate 1 over a full AAA long project
test('M1 acc rate 1 over AAA long yields 14 ticks',()=>{const {run}=load();newProject(run,{tier:'aaa',dur:'long'});
  const src=fs.readFileSync(path.join(__dirname,'../js/game.js'),'utf8');
  const m=src.match(/const acc=\(key,v,f\)=>\{[^\n]*\n/);assert.ok(m);
  const n=run(`(()=>{let c=0,w;${m[0]}for(let i=0;i<13;i++){w=stepW(i);acc('x',1,()=>c++)}return c})()`);
  assert.strictEqual(n,14);});

// M3 / M6
test('M6 milestone without at is backfilled',()=>{const {run}=load();newProject(run);
  run('S.milestone={month:4,done:false}');assert.equal(run('normalizeProject(S,C).milestone.at'),'prod_fp');
  run('S.milestone={month:9,done:false}');assert.equal(run('normalizeProject(S,C).milestone.at'),'prod_beta');});
test('M3 chronicle clamps step after release',()=>{const {run}=load();newProject(run);run('S.round=STEPS.length');
  const t=run('generateChronicleText()');
  assert.doesNotMatch(String(t),/14\/13/);assert.match(String(t),/13\/13/);});
