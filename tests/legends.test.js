const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('fs'),path=require('path');
const {load,newProject}=require('./harness');
const NEW=['uematsu','weidemann','wertich','kotick','huelsbeck','levine','mikami','barone','baer','gordon'];

test('new legends are playable and complete',()=>{const {run}=load();
  for(const k of NEW){
    assert.ok(run(`LEGEND_KEYS.includes('${k}')`),k);
    const d=run(`DIRS['${k}']`);
    assert.ok(fs.existsSync(path.join(__dirname,'..',d.img)),d.img);
    for(const f of ['n','tag','d','encStory','leadRole','ab'])assert.ok(d[f],`${k}.${f}`);
    assert.ok(run(`!!STAFF['${d.leadRole}']`),`${k} role`);
    for(const st of ['vision','technik','fuehrung','business','hype','polish'])assert.equal(typeof d.s[st],'number',`${k}.s.${st}`);
    for(const g of Object.keys(d.aff))assert.ok(run(`!!GENRES['${g}']`),`${k} aff ${g}`);
    for(const p of d.perks)assert.ok(run(`!!PERKS['${p}']`),`${k} perk ${p}`);
    for(const f of d.flaws)assert.ok(run(`!!FLAWS['${f}']`),`${k} flaw ${f}`);
  }});
test('every legend ability has a name and an effect',()=>{const {run}=load();
  for(const k of run('[...LEGEND_KEYS]')){
    const ab=run(`DIRS['${k}'].ab`);
    assert.ok(run(`!!ABIL['${ab}']`),`${k}: ABIL.${ab}`);
    if(ab!=='reroll'&&ab!=='works')assert.ok(run(`!!ABIL_EFF['${ab}']`),`${k}: ABIL_EFF.${ab}`);
  }});
test('new ability applies its own effect',()=>{const {run}=load();newProject(run);
  run(`C.dir.ab='overture';S.screen='event';S.abUsed=false`);
  const snd=run('S.res.snd');run('useAbility()');
  assert.ok(run('S.res.snd')>snd);assert.ok(run('S.abUsed'));});

test('fair picks a legend other than the director and staff',()=>{const {run}=load();newProject(run);
  run(`C.dir.id='uematsu';C.studio.staff.push({id:'audio',legendId:'gordon'})`);
  for(let i=0;i<30;i++){run('S.fairSeen=false');assert.ok(run('startFair()'));
    const k=run('S.fair');assert.notEqual(k,'uematsu');assert.notEqual(k,'gordon');}
  assert.equal(run('S.screen'),'fair');});
test('fair triggers at most once per project',()=>{const {run}=load();newProject(run);
  run(`Math.random=()=>0;S.round=3`);assert.ok(run('fairDue()'));
  run('startFair()');assert.equal(run('fairDue()'),false);});
test('fair does not trigger on the first two or last step',()=>{const {run}=load();newProject(run);
  run(`Math.random=()=>0;S.round=1`);assert.equal(run('fairDue()'),false);
  run(`S.round=STEPS.length-1`);assert.equal(run('fairDue()'),false);});
test('fair tip matches the legend lead role',()=>{const {run}=load();newProject(run);
  const o=run(`fairCard('huelsbeck').o[0]`);
  assert.equal(o.st,'design');assert.deepEqual({...o.s},{snd:7});
  assert.deepEqual({...run(`getOpt({kind:'fair',ev:'huelsbeck',oi:0}).s`)},{snd:7});
  assert.match(run(`curTitle('fair','huelsbeck')`),/Chris Pieptonbeck/);});
test('declining the tip changes nothing and moves on',()=>{const {run}=load();newProject(run);
  run(`S.fair='baer';S.fairSeen=true;S.screen='fair';S.res.budget=1e9`);
  const before=JSON.stringify(run('S.res'));run('choose(1)');
  assert.equal(run('S.screen'),'result');assert.equal(run('S.last.kind'),'fair');assert.equal(JSON.stringify(run('S.res')),before);
  run(`Math.random=()=>0.999;afterResult('fair')`);assert.notEqual(run('S.screen'),'fair');});
test('a successful tip applies the bonus',()=>{const {run}=load();newProject(run);
  run(`S.fair='barone';S.fairSeen=true;S.screen='fair';S.res.bugs=10`);
  run(`S.pending={kind:'fair',ev:'barone',oi:0};resolve([99])`);
  assert.ok(run('S.last.ok'));assert.ok(run('S.res.bugs')<10);});

const html=(run,fn)=>run(`(()=>{const m={innerHTML:'',className:''};${fn}(m);return m.innerHTML})()`);
test('fair screen shows banner, legend and both options',()=>{const {run}=load({ui:true});newProject(run);
  run(`S.fair='levine';S.screen='fair'`);
  assert.ok(run(`ACTIVE.includes('fair')`));
  const h=run(`headFor('fair','levine')+optsHTML(fairCard('levine'))`);
  assert.ok(h.includes(run('EVENT_IMAGES.fair')));assert.match(h,/Ken Rapturine/);
  assert.match(h,/data-i="0"/);assert.match(h,/data-i="1"/);});
test('pitch and milestone screens show their scene images',()=>{const {run}=load({ui:true});newProject(run);
  run(`S.round=stepIndex('pit_meet');S.screen='pitch'`);
  assert.ok(html(run,'renderPitch').includes(run('EVENT_IMAGES.pitch')));
  run(`S.msResult=msCheck('vs');S.screen='milestone'`);
  assert.ok(html(run,'renderMilestone').includes(run('EVENT_IMAGES.audit')));
  for(const k of ['pitch','audit','fair'])assert.ok(fs.existsSync(path.join(__dirname,'..',run(`EVENT_IMAGES.${k}`))),k);});
