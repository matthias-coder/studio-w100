/* ===================== Meilensteine: Zielwerte, Prüfung & Meilenstein-Fokus ===================== */
const MILESTONES=[
  {id:'vs',at:'pre_slice',n:'Vertical Slice',base:30,bugs:12},
  {id:'fp',at:'prod_fp',n:'First Playable',base:36,bugs:14},
  {id:'alpha',at:'prod_alpha',n:'Alpha',base:42,bugs:16},
  {id:'beta',at:'prod_beta',n:'Beta',base:48,bugs:12},
  {id:'gm',at:'pol_bugs',n:'Gold Master',base:52,bugs:8}
];
const MS_NEAR=4;
function msById(id){return MILESTONES.find(m=>m.id===id)}
function msTargets(id,s=S){
  const m=msById(id),t=T();
  let snd=m.base+Math.round((t.gp+t.gfx)/2)-4;
  if(sndWeight()<.2)snd-=6;
  return {gp:m.base+t.gp,gfx:m.base+t.gfx-2,snd,bugs:m.bugs};
}
function nextMs(s=S){
  const done=s.msDone||[];
  return MILESTONES.find(m=>stepIndex(m.at)>=s.round&&!done.includes(m.id))||null;
}
function msCheck(id,s=S){
  const m=msById(id),t=msTargets(id,s);
  const rows=[['gp','Gameplay'],['gfx','Grafik'],['snd','Sound']].map(([k,n])=>{
    const ist=s.res[k],soll=t[k];return {k,n,ist,soll,ok:ist>=soll,gap:soll-ist};
  });
  rows.push({k:'bugs',n:'Bugs',ist:s.res.bugs,soll:t.bugs,ok:s.res.bugs<=t.bugs,gap:s.res.bugs-t.bugs});
  const outcome=rows.every(r=>r.ok)?'met':rows.every(r=>r.gap<=MS_NEAR)?'near':'miss';
  return {id,n:m.n,outcome,rows};
}
// Punkte, die dieser Schritt in jeden Bereich stecken muss, um das Ziel gleichmäßig bis zum Meilensteinschritt zu erreichen
function msNeed(s=S){
  const out={gp:0,gfx:0,snd:0,bug:0},m=nextMs(s);
  if(!m)return out;
  const end=stepIndex(m.at);let tot=0;
  for(let i=s.round;i<=end;i++)tot+=stepW(i,s);
  const now=stepW(s.round,s);
  if(!(tot>0)||!(now>0))return out;
  const f=now/tot,t=msTargets(m.id,s);
  ['gp','gfx','snd'].forEach(k=>{out[k]=Math.max(0,t[k]-s.res[k])/AREAS[k].rate*f});
  out.bug=Math.max(0,s.res.bugs-t.bugs)/Math.abs(AREAS.bug.rate)*f;
  return out;
}
(function(){
  const c=FOCUS.custom;delete FOCUS.custom; // Reihenfolge: ... hype, ms, custom
  FOCUS.ms={n:'Meilenstein-Ziel',fn:s=>{
    const bal=normAlloc(FOCUS.balanced.fn()),cap=sprintCapacity(s).total,need=msNeed(s);
    const sum=AREA_KEYS.reduce((a,k)=>a+(need[k]||0),0);
    if(!(cap>0)||!(sum>0))return bal;
    const sc=sum>cap?cap/sum:1,o={};let used=0;
    AREA_KEYS.forEach(k=>{o[k]=(need[k]||0)*sc*100/cap;used+=o[k]});
    const rest=Math.max(0,100-used);
    AREA_KEYS.forEach(k=>{o[k]+=bal[k]*rest/100});
    return o;
  }};
  FOCUS.custom=c;
})();
