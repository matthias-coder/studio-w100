/* ===================== Sprint: Kapazität, Verteilung & erwarteter Effekt pro Schritt ===================== */
const SPRINT={base:10,leadBonus:.08,moralBase:.7,moralStep:.06,crunchMult:1.3,crunchMoral:-1,crunchBugs:2,buildBugs:.06,minCrunchMoral:2};
const AREAS={
  gp:{n:'Gameplay',ic:'🎮',rate:.3},
  gfx:{n:'Grafik',ic:'🎨',rate:.3},
  snd:{n:'Sound',ic:'🎵',rate:.3},
  bug:{n:'Bugfixing',ic:'🐞',rate:-.35},
  mkt:{n:'Marketing',ic:'📣',rate:.08}
};
const AREA_KEYS=['gp','gfx','snd','bug','mkt'];
const FOCUS={
  balanced:{n:'Ausgewogen',fn:()=>{const w=qualWeights();return {gp:70*w.gp,gfx:70*w.gfx,snd:70*w.snd,bug:15,mkt:15}}},
  gp:{n:'Gameplay zuerst',a:{gp:55,gfx:15,snd:10,bug:10,mkt:10}},
  look:{n:'Look & Sound',a:{gp:15,gfx:40,snd:30,bug:10,mkt:5}},
  bugs:{n:'Bugs jagen',a:{gp:10,gfx:5,snd:5,bug:70,mkt:10}},
  hype:{n:'Marketing-Push',a:{gp:15,gfx:15,snd:10,bug:10,mkt:50}},
  custom:{n:'Eigene Verteilung',fn:s=>s.sprint.custom}
};
function defaultSprint(){return {focus:'balanced',custom:{gp:30,gfx:25,snd:15,bug:15,mkt:15},crunch:false}}
// Prozente auf ganze Zahlen mit Summe 100 (Largest-Remainder); leere Verteilung -> ausgewogen
function normAlloc(a){
  const v=AREA_KEYS.map(k=>Math.max(0,+(a&&a[k])||0)),sum=v.reduce((x,y)=>x+y,0);
  if(sum<=0)return normAlloc(FOCUS.balanced.fn());
  const raw=v.map(x=>x*100/sum),fl=raw.map(Math.floor);
  let left=100-fl.reduce((x,y)=>x+y,0);
  raw.map((r,i)=>[r-fl[i],i]).sort((p,q)=>q[0]-p[0]||p[1]-q[1]).slice(0,left).forEach(([,i])=>fl[i]++);
  const o={};AREA_KEYS.forEach((k,i)=>o[k]=fl[i]);return o;
}
function sprintAlloc(s=S){
  const sp=s.sprint||defaultSprint(),f=FOCUS[sp.focus]||FOCUS.balanced;
  return normAlloc(f.fn?f.fn({...s,sprint:sp}):f.a);
}
function canCrunch(s=S){return s.res.moral>=SPRINT.minCrunchMoral}
function crunchOn(s){return !!(s.sprint&&s.sprint.crunch)&&canCrunch(s)&&s.contractStep!==s.round}
function sprintCapacity(s=S){
  const base=SPRINT.base*stepW(s.round,s),parts=[];
  const leads=(C.studio.staff||[]).length;
  parts.push({n:'Leads',f:1+SPRINT.leadBonus*leads});
  parts.push({n:'Stimmung',f:clamp(SPRINT.moralBase+SPRINT.moralStep*s.res.moral,SPRINT.moralBase,1.3)});
  if(crunchOn(s))parts.push({n:'Crunch',f:SPRINT.crunchMult});
  const deduct=[];
  if(s.contractStep===s.round)deduct.push({n:'Auftragsarbeit',pts:base*parts.reduce((a,p)=>a*p.f,1)});
  const gross=base*parts.reduce((a,p)=>a*p.f,1)-deduct.reduce((a,d)=>a+d.pts,0);
  return {base,parts,deduct,total:Math.max(0,Math.round(gross))};
}
function sprintDelta(s=S){
  const pts=sprintCapacity(s).total,al=sprintAlloc(s),cr=crunchOn(s);
  const pol=.9+.05*((typeof D==='function'&&D()&&D().s.polish)||0);
  const pp=k=>pts*al[k]/100;
  return {pts,
    gp:pp('gp')*AREAS.gp.rate*pol*(typeof funMult==='function'?funMult(s):1),gfx:pp('gfx')*AREAS.gfx.rate*pol,snd:pp('snd')*AREAS.snd.rate*pol,
    bugs:(pp('gp')+pp('gfx')+pp('snd'))*SPRINT.buildBugs+pp('bug')*AREAS.bug.rate+(cr?SPRINT.crunchBugs:0),
    hype:pp('mkt')*AREAS.mkt.rate,
    moral:cr?SPRINT.crunchMoral:0};
}
