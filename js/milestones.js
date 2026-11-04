/* ===================== Meilensteine: Zielwerte, Prüfung & Meilenstein-Fokus ===================== */
const MILESTONES=[
  // Basiswerte je Bereich bei Standardgewichten (Gameplay .55, Grafik .30, Sound .15); k = Ausschlag pro 1.0 Gewichtsabweichung des Genres
  {id:'vs',at:'pre_slice',n:'Vertical Slice',gp:31,gfx:21,snd:22,k:{gp:21,gfx:25,snd:10},bugs:12},
  {id:'fp',at:'prod_fp',n:'First Playable',gp:34,gfx:25,snd:25,k:{gp:27,gfx:30,snd:14},bugs:14},
  {id:'alpha',at:'prod_alpha',n:'Alpha',gp:36,gfx:26,snd:26,k:{gp:31,gfx:36,snd:17},bugs:16},
  {id:'beta',at:'prod_beta',n:'Beta',gp:46,gfx:28,snd:28,k:{gp:34,gfx:36,snd:18},bugs:12},
  {id:'gm',at:'pol_bugs',n:'Gold Master',gp:48,gfx:28,snd:28,k:{gp:36,gfx:38,snd:20},bugs:8}
];
const MS_NEAR=4;
const MS_REF_W={gp:.55,gfx:.30,snd:.15};
function msById(id){return MILESTONES.find(m=>m.id===id)}
// Ziele folgen dem, was der ausgewogene Sprint im Genre aufbaut: Tier-Niveau + Basis + Genre-Gewichtung
function msTargets(id,s=S){
  const m=msById(id),t=T(),w=qualWeights();
  const adj=k=>Math.round(m.k[k]*(w[k]-MS_REF_W[k]));
  return {gp:m.gp+t.gp+adj('gp'),gfx:m.gfx+t.gfx+adj('gfx'),snd:m.snd+Math.round((t.gp+t.gfx)/2)+adj('snd'),bugs:m.bugs};
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
// Wendet das Ergebnis einer Meilenstein-Prüfung an (Moral, ggf. Publisher-Deal) und liefert die Log-Notizen
function applyMsOutcome(r){
  const notes=[],n=r.n;
  if(r.outcome==='met'){S.res.moral=clamp(S.res.moral+1,0,10);notes.push(`Meilenstein „${n}“ erreicht (+1 Moral)`)}
  else if(r.outcome==='near')notes.push(`Meilenstein „${n}“ knapp verfehlt`);
  else{S.res.moral=clamp(S.res.moral-1,0,10);notes.push(`Meilenstein „${n}“ verfehlt (−1 Moral)`)}
  const pm=S.milestone;
  if(pm&&pm.at===r.id&&!pm.done){
    pm.done=true;
    if(r.outcome==='met'){
      S.res.budget+=pm.reward;S.income+=pm.reward;
      notes.push(`Publisher-Meilenstein erreicht (+${money(pm.reward)})!`);
    }else if(r.outcome==='miss'&&Math.random()<0.4){
      const repay=Math.round(S.recoup*0.5*10)/10;
      S.res.budget-=repay;S.publisher=false;S.recoup=Math.max(0,S.recoup-repay);
      notes.push(`Der Publisher kündigt den Vertrag und fordert ${money(repay)} Vorschuss zurück!`);
    }
  }
  r.notes=notes;
  return notes;
}
