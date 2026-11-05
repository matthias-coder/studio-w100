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
