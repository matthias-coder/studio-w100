const test=require('node:test'),assert=require('node:assert/strict');
const {load,newProject}=require('./harness');
test('normal indie project has about 120 sprint points',()=>{const {run}=load();newProject(run);run('S.sprint=defaultSprint()');
  run('S.res.moral=5');let sum=0;for(let i=0;i<13;i++){run(`S.round=${i}`);sum+=run('sprintCapacity().total');}
  assert.ok(sum>=110&&sum<=130,'sum='+sum);});
test('leads and morale raise capacity, crunch multiplies by 1.3',()=>{const {run}=load();newProject(run);run('S.sprint=defaultSprint()');
  run('S.res.moral=5;S.round=7');const b=run('sprintCapacity().total');
  run('S.sprint.crunch=true');assert.ok(Math.abs(run('sprintCapacity().total')-b*1.3)<=1);
  run('S.sprint.crunch=false;S.res.moral=10');assert.ok(run('sprintCapacity().total')>b);});
test('normAlloc sums to 100 and falls back to balanced',()=>{const {run}=load();newProject(run);run('S.sprint=defaultSprint()');
  const a=run('normAlloc({gp:1,gfx:1,snd:1,bug:0,mkt:0})');assert.equal(a.gp+a.gfx+a.snd+a.bug+a.mkt,100);
  const z=run('normAlloc({gp:0,gfx:0,snd:0,bug:0,mkt:0})');assert.deepEqual(z,run(`sprintAlloc({...S,sprint:{...S.sprint,focus:'balanced'}})`));});
test('balanced split follows genre weights',()=>{const {run}=load();newProject(run);run('S.sprint=defaultSprint()');
  const a=run('sprintAlloc()');assert.equal(a.bug,15);assert.equal(a.mkt,15);assert.equal(a.gp+a.gfx+a.snd,70);});
test('bugs focus lowers bugs, gameplay focus raises gp',()=>{const {run}=load();newProject(run);run('S.sprint=defaultSprint()');run('S.round=7');
  run(`S.sprint.focus='bugs'`);assert.ok(run('sprintDelta().bugs')<0);
  run(`S.sprint.focus='gp'`);const d=run('sprintDelta()');assert.ok(d.gp>d.gfx&&d.gp>0);});
test('crunch is refused below moral 2',()=>{const {run}=load();newProject(run);run('S.sprint=defaultSprint()');run('S.round=7;S.sprint.crunch=true;S.res.moral=1');
  assert.equal(run('canCrunch()'),false);assert.equal(run('sprintDelta().moral'),0);});
