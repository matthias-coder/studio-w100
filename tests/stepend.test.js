const test=require('node:test'),assert=require('node:assert');
const {load,newProject,CAREER}=require('./harness');
const noRandom=run=>run('Math.random=()=>0.999');
test('step cost equals monthSum × weight',()=>{const {run}=load();newProject(run);noRandom(run);
  const b0=run('S.res.budget'),cost=run('monthSum()*stepW(0)');
  run('monthEnd()');
  assert.ok(Math.abs(b0-run('S.res.budget')-cost)<0.2);assert.equal(run('S.round'),1);});
test('full normal project consumes exactly 12 time units',()=>{const {run}=load();newProject(run);noRandom(run);
  run('S.res.budget=1e9');const z0=run('S.res.zeit');
  for(let i=0;i<13;i++){run('monthEnd()');if(run('S.screen')==='milestone')run('closeMilestone()')}
  assert.ok(Math.abs(z0-run('S.res.zeit')-12)<1e-6);
  assert.equal(run('S.screen'),'launch');});
test('long AAA keeps 2 units of buffer without delays',()=>{const {run}=load();newProject(run,{tier:'aaa',dur:'long'});noRandom(run);
  run('S.res.budget=1e12');for(let i=0;i<13;i++){run('monthEnd()');if(run('S.screen')==='milestone')run('closeMilestone()')}
  assert.ok(Math.abs(run('S.res.zeit')-2)<1e-6);});
test('milestone fires at end of prod_fp',()=>{const {run}=load();newProject(run);noRandom(run);
  run(`S.res.budget=1e9;signDeal('pub',100)`);
  const fpIdx=run("stepIndex('prod_fp')");let paidBefore=null,outcome=null;
  for(let i=0;i<=fpIdx;i++){
    if(i===fpIdx){ // fixed "met" result right before the fp step
      const t=run("msTargets('fp')");
      run(`Object.assign(S.res,{gp:${t.gp+10},gfx:${t.gfx+10},snd:${t.snd+10},bugs:0})`);
      paidBefore=run("findDeal('pub').paid");
    }
    run('monthEnd()');
    if(run('S.screen')==='crisis')run('leaveCrisis()');
    if(run('S.screen')==='milestone'){if(i===fpIdx)outcome=run('S.msResult.outcome');run('closeMilestone()')}
  }
  assert.ok(run(`S.msDone.includes('fp')`));
  assert.equal(outcome,'met');
  assert.ok(run("!('fp' in findDeal('pub').rates)"));
  assert.equal(run("findDeal('pub').status"),'active');
  assert.ok(run("findDeal('pub').paid")>paidBefore,'fp rate was paid');});
test('crisis path resumes at next step',()=>{const {run}=load();newProject(run);noRandom(run);
  run('S.res.budget=-1;monthEnd()');assert.equal(run('S.round'),1);
  run('S.res.budget=1e9;afterMonth()');assert.notEqual(run('S.screen'),'launch');});
test('runway in real months',()=>{const {run}=load();newProject(run);
  run('S.res.budget=costPerMonth()*5.5');assert.equal(run('runway()'),5);});
test('early access keeps bugs integer at every step',()=>{const {run}=load();newProject(run);noRandom(run);
  run('S.ea=true;S.res.budget=1e9');
  for(let i=0;i<13;i++){run('monthEnd()');assert.ok(Number.isInteger(run('S.res.bugs')),'bugs='+run('S.res.bugs')+' after step '+i);}});
test('calendar and careerYear',()=>{const {run}=load();run(CAREER);
  assert.equal(run('careerYear()'),1);run('advanceCalendar(30)');assert.equal(run('careerYear()'),3);});
test('engine ages 1 for short, 2 for >=48 months',()=>{const {run}=load();
  newProject(run,{tier:'indie',dur:'normal'});
  run(`C.studio.engine={name:'E',age:1,genres:[],modules:[],version:1,runs:1};S.engine='surreal';applyEngineAging({})`);
  assert.equal(run('C.studio.engine.age'),2);
  newProject(run,{tier:'aa',dur:'long'});
  run(`C.studio.engine={name:'E',age:1,genres:[],modules:[],version:1,runs:1};S.engine='surreal';applyEngineAging({})`);
  assert.equal(run('C.studio.engine.age'),3);});
