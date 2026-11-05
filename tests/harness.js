const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..');
const FILES=['js/data.js','js/schedule.js','js/sprint.js','js/milestones.js','js/funding.js','js/activities.js','js/features.js','js/live.js','js/events.js','js/content-extra.js','js/press.js','js/storage.js','js/game.js'];
function el(){return {hidden:false,textContent:'',innerHTML:'',value:'',style:{},dataset:{},
  classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},
  querySelectorAll:()=>[],querySelector:()=>null,appendChild(){},setAttribute(){}}}
function load(o={}){
  const store={};
  const ctx={console,setTimeout,clearTimeout,Buffer,
    localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},
    document:{getElementById:el,querySelectorAll:()=>[],querySelector:()=>null,createElement:el,body:el(),addEventListener(){}},
    location:{search:'',hash:'',href:'',pathname:'/'},history:{replaceState(){}},navigator:{},
    btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary')};
  ctx.window=ctx;vm.createContext(ctx);
  vm.runInContext('var render=()=>{},renderMain=()=>{},updateProfileButton=()=>{};',ctx);
  for(const f of (o.ui?FILES.concat('js/ui.js'):FILES))vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
  if(o.ui)vm.runInContext('render=()=>{};',ctx);
  const run=code=>vm.runInContext(code,ctx);
  return {ctx,run,store};
}
const CAREER=`C={studio:{name:'Test',fame:0,kasse:0,staff:[],exStaff:[],engine:null,salaryDrift:0,overheadDrift:0},
 dir:{id:'custom',n:'T',tag:'',d:'',s:{vision:1,technik:1,fuehrung:1,business:1,hype:1,polish:1},aff:{},perks:[],flaws:[],ab:null,fame:0,wealth:0,games:0,xp:0,perkUnlocked:false},
 hall:[],gameNo:0,unlockedChars:[]}`;
function newProject(run,o={}){
  run(CAREER);
  run(`startGame(${JSON.stringify({title:'T',genre:'rpg',subGenre:null,gmod:null,actsDone:true,tier:'indie',model:'kauf',ip:'neu',extras:[],dur:'normal',...o})})`);
}
module.exports={load,newProject,CAREER};
