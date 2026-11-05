/* ===================== Features: Katalog, Plan, Bau über den Sprint ===================== */
const FEAT={coreCost:5,optCost:3,coreVal:3,optVal:2,missRev:3,coreCutRev:2,creepChance:.3,creepMax:1,creepCost:3,creepVal:2,creepHype:1,creepDc:12};
const HUNT={runs:3,w:{crit:5,major:2,minor:1},dc:{crit:14,major:10,minor:6},certCrit:2,certHiCrit:4,certPen:8,certPenHi:15};
const SHIP={share:.1,minMonths:2,bugPerW:4,qualPerW:1.5,hype:-1,funderMoral:-1};
// [ic, n, a] – die ersten beiden sind Kern, das dritte optional
const GENRE_FEATS={
  action:[['🎯','Waffen-Feintuning','gp'],['💥','Zerstörbare Umgebung','gfx'],['🏁','Ranglisten-Modus','gp']],
  actadv:[['🧗','Kletter-System','gp'],['🌅','Tag-Nacht-Zyklus','gfx'],['🐎','Reittiere','gp']],
  adventure:[['🧩','Hinweis-System','gp'],['🎭','Vollvertonung','snd'],['📔','Tagebuch','gp']],
  rpg:[['🌳','Skill-Bäume','gp'],['💬','Dialogsystem','snd'],['⚒️','Crafting','gp']],
  strategy:[['🗺️','Gegner-KI','gp'],['📊','Wirtschaftssystem','gp'],['🎬','Wiederholungs-Kamera','gfx']],
  sim:[['🏗️','Bau-Editor','gp'],['📈','Statistik-Ansicht','gp'],['🌦️','Jahreszeiten','gfx']],
  sports:[['🏟️','Stadion-Atmosphäre','snd'],['🕹️','Karrieremodus','gp'],['📺','TV-Präsentation','gfx']],
  survival:[['🔥','Basisbau','gp'],['🌲','Prozedurale Welt','gfx'],['🐺','Tier-KI','gp']],
  puzzle:[['🧠','Level-Editor','gp'],['✨','Partikel-Effekte','gfx'],['🎵','Rätsel-Soundtrack','snd']],
  platformer:[['🦘','Präzise Steuerung','gp'],['🎨','Parallax-Welten','gfx'],['⏱️','Speedrun-Modus','gp']]
};
const OPT_FEATS=[['photo','📸','Fotomodus','gfx'],['ngplus','🔁','New Game Plus','gp'],['dynsnd','🎶','Dynamischer Soundtrack','snd'],['achieve','🏆','Erfolge','gp']];
const EXTRA_FEATS={mods:['🛠️','Mod-Editor','gp'],coopMode:['🤝','Koop-Netcode','gp'],crossplay:['☁️','Crossplay-Backend','gp'],soundtrack:['🎻','Orchester-Aufnahmen','snd']};
const CREEP_IDEAS=[['fish','🎣','Angel-Minispiel','gp'],['cat','🐱','Katzen streicheln','gfx'],['karaoke','🎤','Karaoke-Modus','snd'],
  ['toilet','🚽','Begehbare Toiletten','gfx'],['cards','🃏','Sammelkartenspiel im Spiel','gp'],['duck','🦆','Enten-Physik','gp']];
function mkFeat(id,ic,n,a,core,src,ex){
  const f={id,n:ic+' '+n,ic,a,cost:core?FEAT.coreCost:FEAT.optCost,val:core?FEAT.coreVal:FEAT.optVal,core,src,done:false,prog:0};
  if(ex)f.ex=ex;return f;
}
// Alle wählbaren Features in Plan-Reihenfolge (USP, Kern, Extras, optional); planned = Standardplan
function featCandidates(s=S){
  const out=[],g=GENRE_FEATS[s.genre];
  if(s.usp){const h=ideaById('hook',s.usp.ids[0]);out.push({...mkFeat('usp','💡',h?h.n:'Idee',s.usp.area,true,'usp'),planned:true})}
  if(g)g.slice(0,2).forEach((x,i)=>out.push({...mkFeat(`${s.genre}_${i+1}`,x[0],x[1],x[2],true,'genre'),planned:true}));
  (s.extras||[]).forEach(e=>{const x=EXTRA_FEATS[e];if(x)out.push({...mkFeat('x_'+e,x[0],x[1],x[2],false,'extra',e),planned:true})});
  if(g)out.push({...mkFeat(`${s.genre}_3`,g[2][0],g[2][1],g[2][2],false,'genre'),planned:false});
  OPT_FEATS.forEach(x=>out.push({...mkFeat(x[0],x[1],x[2],x[3],false,'opt'),planned:false}));
  return out;
}
function startPlan(ids){
  if(S.feat)return false;
  const strip=f=>{const o={...f};delete o.planned;return o};
  const plan=[],cut=[];
  featCandidates(S).forEach(f=>{
    if(ids.includes(f.id))plan.push(strip(f));
    else if(f.core||f.src==='extra')cut.push(strip(f));
  });
  S.feat={plan,cut,creepN:0};
  return true;
}
function featActive(s=S){return !!(s&&s.feat&&s.feat.plan&&s.feat.plan.some(f=>!f.done))}
function featBuild(pts){
  const notes=[];
  if(!S.feat||!S.feat.plan)return notes;
  for(const f of S.feat.plan){
    if(pts<=0)break;
    if(f.done)continue;
    f.prog+=pts;pts=0;
    if(f.prog>=f.cost){
      pts=f.prog-f.cost;f.prog=f.cost;f.done=true;
      S.res[f.a]=(S.res[f.a]||0)+f.val;recalcQual();
      notes.push(`🧩 Feature fertig: ${f.n}`);
    }
  }
  return notes;
}
// Ein unfertiges Feature eine Stelle nach oben (nicht über fertige hinweg)
function featUp(id){
  if(!S.feat||!S.feat.plan)return false;
  const p=S.feat.plan,i=p.findIndex(f=>f.id===id);
  if(i<1||p[i].done||p[i-1].done)return false;
  [p[i-1],p[i]]=[p[i],p[i-1]];return true;
}
function featCut(id){
  if(!S.feat||!S.feat.plan)return false;
  const p=S.feat.plan,i=p.findIndex(f=>f.id===id);
  if(i<0||p[i].done)return false;
  const [f]=p.splice(i,1);S.feat.cut.push(f);
  if(f.src==='extra'&&f.ex){
    S.extras=(S.extras||[]).filter(x=>x!==f.ex);
    if(f.ex==='mods')S.mods=false;
    if(f.ex==='ea')S.ea=false;
  }
  return true;
}
function featStats(s=S){
  const p=(s.feat&&s.feat.plan)||[],cut=(s.feat&&s.feat.cut)||[];
  return {planned:p.length,built:p.filter(f=>f.done).length,core:p.filter(f=>f.core).length,coreBuilt:p.filter(f=>f.core&&f.done).length,cutCore:cut.filter(f=>f.core).length};
}
// Review-Malus: unfertige geplante und gestrichene Kern-Features (0 ohne Plan)
function featRev(s=S){
  if(!s.feat||!s.feat.plan)return 0;
  const st=featStats(s);
  return -FEAT.missRev*(st.planned-st.built)-FEAT.coreCutRev*st.cutCore;
}

/* ===================== Feature Creep ===================== */
function creepDue(s=S){
  return !!s&&!!s.feat&&!!s.feat.plan&&s.round>=stepIndex('prod_fp')&&s.round<stepIndex('pol_bugs')
    &&s.feat.creepN<FEAT.creepMax&&Math.random()<FEAT.creepChance;
}
function creepPool(s=S){
  const used=[...s.feat.plan,...s.feat.cut].map(f=>f.id);
  return CREEP_IDEAS.filter(x=>!used.includes('c_'+x[0]));
}
function startCreep(){
  const pool=creepPool();
  if(!pool.length)return false;
  const x=pool[Math.floor(Math.random()*pool.length)];
  S.creep=x[0];S.feat.creepN++;S.screen='creep';
  addLog(`<span>${stepTag(lastStep())}</span> 🧩 Feature Creep: ${x[2]}`);
  render();save();return true;
}
function creepUndo(id){S.feat.plan=S.feat.plan.filter(f=>f.id!=='c_'+id)}
function creepAdd(id){
  if(S.feat.plan.some(f=>f.id==='c_'+id))return;
  const x=CREEP_IDEAS.find(i=>i[0]===id);
  S.feat.plan.push(mkFeat('c_'+id,x[1],x[2],x[3],false,'creep'));
  const f=S.feat.plan[S.feat.plan.length-1];f.cost=FEAT.creepCost;f.val=FEAT.creepVal;
}
function creepCard(id){
  const x=CREEP_IDEAS.find(i=>i[0]===id);
  return {t:`Feature Creep: ${x[1]} ${x[2]}`,
    x:`Im Daily schlägt jemand begeistert vor: ‚Wir bräuchten noch ${x[2]}!‘ Das halbe Team nickt.`,
    o:[{l:'Einbauen',safe:{hype:FEAT.creepHype},sx:'Das Feature wandert ans Ende der Liste.',onSafe:()=>{creepAdd(id);return null}},
       {l:'Dem Team ausreden',st:'team',dc:FEAT.creepDc,s:{moral:1},f:{},bonusV:0,
        sx:'Das Team bleibt fokussiert.',fx:'Es landet trotzdem im Build.',onFail:()=>{creepAdd(id)}},
       {l:'Streng ablehnen',safe:{moral:-1},sx:'Die Stimmung leidet.'}]};
}

/* ===================== Bug-Jagd ===================== */
function bugSplit(b){
  const crit=Math.floor(b/10),rest=b-HUNT.w.crit*crit,major=Math.floor(rest/3);
  return {crit,major,minor:rest-HUNT.w.major*major};
}
// Basis der Jagd, abgeglichen mit dem aktuellen Bugstand (Zuwachs = leicht, Abbau von leicht nach schwer)
function bugList(s=S){
  const b=Math.max(0,s.res.bugs);
  if(!s.hunt)return bugSplit(b);
  const w=HUNT.w;let {crit,major,minor}=s.hunt.base;
  const diff=b-(crit*w.crit+major*w.major+minor*w.minor);
  if(diff>0)minor+=diff;
  else if(diff<0){
    let need=-diff;
    const m=Math.min(minor,need);minor-=m;need-=m;
    if(need>0){const n=Math.min(major,Math.ceil(need/w.major));major-=n;need-=n*w.major;if(need<0){minor+=-need;need=0}}
    if(need>0){const n=Math.min(crit,Math.ceil(need/w.crit));crit-=n;need-=n*w.crit;if(need<0)minor+=-need}
  }
  return {crit,major,minor};
}
function huntDue(s=S){return STEPS[s.round]?.id==='pol_bugs'&&!(s.hunt&&s.hunt.done)}
function openHunt(){
  if(S.hunt)return;
  S.hunt={base:bugSplit(S.res.bugs),runs:HUNT.runs+(staffLevel('qalead')>=3?1:0),done:false};
}
function startHunt(sev){
  if(!S.hunt||S.hunt.done||S.hunt.runs<=0||!(bugList()[sev]>0))return;
  startRoll({kind:'hunt',ev:sev,oi:0});
}
function huntLog(){
  if(S.hunt.logged)return;
  S.hunt.logged=true;
  const l=bugList();
  addLog(`🐞 Bug-Jagd beendet: ${l.crit} Showstopper, ${l.major} schwer, ${l.minor} leicht`);
}
function resolveHunt(sev,ok,crit){
  const ch=[];let txt='';
  S.hunt.base=bugList();S.hunt.runs--;
  if(ok){
    const n=Math.min(crit?2:1,S.hunt.base[sev]),d=Math.min(S.res.bugs,n*HUNT.w[sev]);
    S.hunt.base[sev]-=n;S.res.bugs-=d;
    if(d)ch.push(['bugs',-d]);
    txt=n?`${n} ${sev==='crit'?'Showstopper':sev==='major'?'schwere':'leichte'} Bug${n>1?'s':''} behoben.`:'';
  }
  if(S.hunt.runs<=0)S.hunt.done=true;
  return {ch,txt};
}
function endHunt(){S.hunt.done=true;huntLog();goMonth()}
function certPenalty(s=S){
  if(!s.hunt)return s.res.bugs>=45?HUNT.certPenHi:s.res.bugs>=30?HUNT.certPen:0;
  const c=bugList(s).crit;
  return c>=HUNT.certHiCrit?HUNT.certPenHi:c>HUNT.certCrit?HUNT.certPen:0;
}
