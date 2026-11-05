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
