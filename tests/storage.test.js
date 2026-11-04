const test=require('node:test'),assert=require('node:assert');
const {load,CAREER}=require('./harness');
test('legacy running project is aborted and refunded',()=>{const {run}=load();run(CAREER);
  const s=run(`normalizeProject({title:'Alt',genre:'rpg',subGenre:defaultSub('rpg'),round:5,res:{budget:40,gp:30,gfx:30}},C)`);
  assert.equal(s,null);assert.equal(run('C.studio.kasse'),40);assert.match(run('C.notice'),/Alt/);});
test('negative legacy budget refunds nothing',()=>{const {run}=load();run(CAREER);
  run(`normalizeProject({title:'X',round:2,res:{budget:-10}},C)`);assert.equal(run('C.studio.kasse'),0);});
test('v2 project survives',()=>{const {run}=load();require('./harness').newProject(run);
  assert.ok(run('normalizeProject(S,C)'));});
test('legacy profile in localStorage loads without crash',()=>{const {run,store}=load();
  store.w20_profiles_v6=JSON.stringify([{id:'slot_1',userName:'A',C:{studio:{name:'A',fame:0,kasse:5,staff:[],exStaff:[],engine:null},dir:{id:'custom',n:'D',s:{vision:1,technik:1,fuehrung:1,business:1,hype:1,polish:1},aff:{},perks:[],flaws:[],fame:0,wealth:0,games:1},hall:[],gameNo:1},
    S:{title:'Alt',genre:'rpg',round:3,res:{budget:20}}}]);
  run('initStorage()');assert.equal(run('S'),null);assert.equal(run('C.studio.kasse'),25);});
function twoSlots(store){const c=k=>({studio:{name:'A',fame:0,kasse:k,staff:[],exStaff:[],engine:null},dir:{id:'custom',n:'D',s:{vision:1,technik:1,fuehrung:1,business:1,hype:1,polish:1},aff:{},perks:[],flaws:[],fame:0,wealth:0,games:1},hall:[],gameNo:1});
  store.w20_profiles_v6=JSON.stringify([{id:'slot_1',userName:'A',C:c(5),S:{title:'Alt',genre:'rpg',round:3,res:{budget:20}}},{id:'slot_2',userName:'B',C:c(0),S:null}]);
  store.w20_active_v6&&delete store.w20_active_v6;}
test('refund is not applied twice when switching profiles',()=>{const {run,store}=load();twoSlots(store);
  run('initStorage()');assert.equal(run('C.studio.kasse'),25);
  run(`switchProfile('slot_2')`);run(`switchProfile('slot_1')`);
  assert.equal(run('C.studio.kasse'),25);assert.equal(run(`profiles.find(p=>p.id==='slot_1').S`),null);});
test('refund is not applied twice across reloads',()=>{const {run,store}=load();twoSlots(store);
  run('initStorage()');run('save()');run('initStorage()');
  assert.equal(run('C.studio.kasse'),25);});
