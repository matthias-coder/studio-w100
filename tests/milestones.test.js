const test=require('node:test'),assert=require('node:assert/strict');
const {load,newProject}=require('./harness');
test('indie targets follow the table',()=>{const {run}=load();newProject(run,{tier:'indie'});
  const t=run(`msTargets('fp')`);assert.equal(t.gp,36);assert.equal(t.gfx,25);assert.equal(t.bugs,14);});
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
test('milestone step shows the milestone screen once',()=>{const {run}=load();newProject(run);run('Math.random=()=>0.999;S.res.budget=1e9');
  run(`S.round=stepIndex('pre_slice');monthEnd()`);
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
  const s=run('normalizeProject(S,C)');assert.deepEqual([...s.msDone],['vs','fp','alpha']);
  assert.equal(s.sprint.focus,'balanced');assert.equal(s.res.moral,5);});
test('gold master flow ends in the launch screen',()=>{const {run}=load();newProject(run);run('Math.random=()=>0.999;S.res.budget=1e9');
  run(`S.round=stepIndex('pol_bugs');monthEnd()`);assert.equal(run('S.screen'),'milestone');
  run('closeMilestone()');
  if(run('S.screen')==='mand'){run(`S.mdone.push(...mandFor(S.round));goMonth()`)}
  if(run('S.screen')==='event'){run('S.res.budget=1e9;monthEnd()')}
  assert.equal(run('S.screen'),'launch');});
test('targets follow the genre weights',()=>{const {run}=load();newProject(run,{tier:'indie'});const rpg=run(`msTargets('gm')`);
  newProject(run,{tier:'indie',genre:'action',subGenre:'fps'});const fps=run(`msTargets('gm')`);
  assert.ok(fps.gfx>rpg.gfx&&fps.gp<rpg.gp);});
test('balanced sprint without cards loses at most 2 moral to milestones',()=>{
  for(const tier of ['indie','aa','aaa'])for(const [genre,subGenre] of [['rpg',null],['action','fps'],['adventure','vn']]){
    const {run}=load();newProject(run,{tier,genre,subGenre});
    run(`Math.random=()=>0.999;S.res.budget=1e12;S.res.moral=5;S.sprint.focus='balanced'`);
    for(let i=0;i<13;i++){run('monthEnd()');if(run('S.screen')==='milestone')run('closeMilestone()');if(run('S.screen')==='crisis')run('leaveCrisis()');}
    assert.ok(run('S.res.moral')>=3,tier+' '+genre+' moral='+run('S.res.moral'));}});
test('balanced sprint with average card effects meets at least 3 of 5 milestones',()=>{
  for(const tier of ['indie','aa','aaa'])for(const [genre,subGenre] of [['rpg',null],['action','fps'],['adventure','vn']]){
    const {run}=load();newProject(run,{tier,genre,subGenre});
    run(`Math.random=()=>0.999;S.res.budget=1e12;S.res.moral=5;S.sprint.focus='balanced'`);
    const tot=run('totalW()');let met=0;
    for(let i=0;i<13;i++){const w=run('stepW()')/tot;run(`S.res.gp+=${15*w};S.res.gfx+=${8*w};S.res.snd+=${2*w}`);
      run('monthEnd()');if(run('S.screen')==='milestone'){if(run('S.msResult.outcome')==='met')met++;run('closeMilestone()');}
      if(run('S.screen')==='crisis')run('leaveCrisis()');}
    assert.ok(met>=3,tier+' '+genre+' met='+met);}});
