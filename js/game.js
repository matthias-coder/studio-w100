/* ===================== Spielzustand & Kern-Logik (W100-System + Tech-Tree + Aufträge + Rivalen/GOTY) ===================== */
let C=null,S=null,rolling=false,manual=false;
let uiDockTab='budget'; // 'budget' | 'team' | 'log'
let B={n:'',s:{vision:1,technik:1,fuehrung:1,business:1,hype:1,polish:1},perks:[],flaws:[]};

const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const d100=()=>1+Math.floor(Math.random()*100);
const dc100=dc=>dc<=25?(dc-1)*5:dc;
const critMin=()=>hasP('glueck')?91:96;
const fumbleMax=5;
const fmt=n=>(n>0?'+':n<0?'−':'±')+Math.abs(n);
const nf=(n,d=1)=>Number(n).toLocaleString('de-DE',{maximumFractionDigits:d,minimumFractionDigits:d===2?2:0});
function money(k,sign){const a=Math.abs(k);const s=a>=1000?nf(a/1000)+' Mio €':nf(a)+' k€';return (sign?(k>0?'+':k<0?'−':'±'):(k<0?'−':''))+s}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const T=()=>S?TIERS[S.tier]:null;
const D=()=>C?C.dir:null;
const hasP=p=>!!(C&&C.dir.perks.includes(p));
const hasF=f=>!!(C&&C.dir.flaws.includes(f));

const ptsLeft=()=>DPTS+B.flaws.reduce((a,f)=>a+FLAWS[f].c,0)-Object.values(B.s).reduce((a,b)=>a+b,0)-B.perks.reduce((a,p)=>a+PERKS[p].c,0);
const dirStatLine=s=>Object.keys(DSTAT).map(k=>DSTAT[k][0]+' '+s[k]).join(' · ');
const randTitle=()=>TA[Math.floor(Math.random()*TA.length)]+TB[Math.floor(Math.random()*TB.length)];

function winChance(dc,mod,adv=false){
  const target=dc100(dc);
  const cMin=critMin();
  let wins=0;
  for(let r=1;r<=100;r++){
    const isCrit=r>=cMin;
    const isFum=r<=fumbleMax;
    if(isCrit||(!isFum&&(r+mod)>=target))wins++;
  }
  const p=wins/100;
  const finalP=adv?(1-(1-p)*(1-p)):p;
  return Math.round(finalP*100);
}

/* ===================== Grafik & Gameplay -> Gesamtqualität ===================== */
function genreName(sObj=S){
  if(!sObj)return '';
  if(!sObj.genre)return 'Genre offen';
  const main=GENRES[sObj.genre]?.n||sObj.genre;
  const sub=subGenreOf(sObj.genre,sObj.subGenre)?.n;
  const mod=GENRE_MODS[sObj.gmod]?' + '+GENRE_MODS[sObj.gmod].n:'';
  return (sub?`${main} · ${sub}`:main)+mod;
}

// Welt-Vorlieben: Sub-Genre überschreibt das Hauptgenre
function worldFit(){
  const g=GENRES[S.genre],sub=subGenreOf(S.genre,S.subGenre);
  return {w:sub?.w||g.w,bad:sub?.bad||g.bad};
}

function gfxWeight(){
  if(!S)return 0.45;
  const mainW=GENRES[S.genre]?.gfxW??0.45;
  const subW=subGenreOf(S.genre,S.subGenre)?.gfxW;
  const base=subW!=null?(mainW*0.5+subW*0.5):mainW;
  const tierAdj=S.tier==='aaa'?0.08:S.tier==='indie'?-0.05:0;
  return clamp(base+tierAdj,0.25,0.65);
}

// Anteil von Sound & Musik an der Gesamtwertung, je nach Genre
const SND_W={'adventure':.2,'adventure.vn':.24,'adventure.narrative':.24,'adventure.interactive':.22,'actadv.horror':.26,'action.mphorror':.24,'sports.extreme':.2,'puzzle':.1,'strategy':.1,'sim':.1};
function sndWeight(){
  if(!S)return .15;
  let w=SND_W[S.genre+'.'+S.subGenre]??SND_W[S.genre]??.15;
  if(S.gmod==='horror')w+=.05;
  return clamp(w,.08,.3);
}
// Gewichte der drei Teilwertungen (Summe 1)
function qualWeights(){
  const s=sndWeight(),g=gfxWeight();
  return {gp:(1-g)*(1-s),gfx:g*(1-s),snd:s};
}
// Kritiker-Logik: gewichteter Schnitt, aber schwaches Gameplay und Ausreißer nach unten fallen stärker auf
function qualBreakdown(){
  const r=S.res,w=qualWeights();
  const gp=r.gp??20,gfx=r.gfx??20,snd=r.snd??Math.round((gp+gfx)/2);
  const avg=gp*w.gp+gfx*w.gfx+snd*w.snd;
  const gpGap=Math.max(0,avg-gp)*.3;
  // Schwachstelle zählt nur bei Bereichen, die im Genre wirklich Gewicht haben
  const lo=Math.min(gp,gfx,w.snd>=.2?snd:gp);
  const loGap=Math.max(0,avg-10-lo)*.2;
  const harmony=lo>=60&&Math.max(gp,gfx,snd)-lo<=15?3:0;
  return {w,avg:Math.round(avg),gpGap:Math.round(gpGap),loGap:Math.round(loGap),harmony,total:clamp(Math.round(avg-gpGap-loGap+harmony),0,100)};
}
function recalcQual(){
  if(!S||!S.res)return;
  if(S.res.gp===undefined)S.res.gp=S.res.qual||20;
  if(S.res.gfx===undefined)S.res.gfx=S.res.qual||20;
  if(S.res.snd===undefined)S.res.snd=Math.round((S.res.gp+S.res.gfx)/2);
  S.res.qual=qualBreakdown().total;
}
// Multiplayer-Spiele (für Ereignisse wie Feature Creep)
const MP_SUBS=['br','mmorpg','moba','mphorror','fighting','fps'];
function isMultiplayer(s){
  s=s||S;if(!s)return false;
  return !!s.mp||MP_SUBS.includes(s.subGenre)||s.gmod==='party'||s.model==='live'||(s.extras||[]).some(k=>k==='coopMode'||k==='crossplay');
}

/* ===================== Branchen-Trends & Rivalen ===================== */
function rollMarketTrend(){
  if(!C)return;
  const keys=Object.keys(GENRES);
  const hot=keys[Math.floor(Math.random()*keys.length)];
  const rest=keys.filter(k=>k!==hot);
  const cold=rest[Math.floor(Math.random()*rest.length)];
  C.trend={hot,cold};
}

function getAllRivals(){
  const list=[...BASE_RIVALS];
  if(C&&Array.isArray(C.studio?.exStaff)){
    C.studio.exStaff.forEach((ex,idx)=>{
      const last=ex.personName.split(' ').pop();
      list.push({
        id:'ex_'+idx,
        name:`${last} Interactive`,
        founder:`${ex.personName} (Ex-${STAFF[ex.id]?.n||'Lead'})`,
        fav:ex.id==='art'?'adventure':ex.id==='senior'?'action':'rpg',
        skill:64+(ex.level||1)*4,
        tag:`Gegründet von eurem abgewanderten Lead ${ex.personName}. Hochmotiviert, es euch zu beweisen!`,
        exLead:true
      });
    });
  }
  const last=C?.rivalLast||{};
  return list.map(rv=>last[rv.name]?{...rv,lastTitle:last[rv.name].title,lastMeta:last[rv.name].meta}:rv);
}

function simulateRivalReleases(){
  const rivals=getAllRivals();
  // 3 zufällige Rivalen veröffentlichen im selben Jahr ein großes Spiel
  const pool=[...rivals].sort(()=>Math.random()-0.5).slice(0,3);
  return pool.map(rv=>{
    const swing=Math.floor(Math.random()*18)-7;
    const meta=clamp(rv.skill+swing,52,94);
    const gp=clamp(meta+Math.floor(Math.random()*10)-4,48,96);
    const gfx=clamp(meta+Math.floor(Math.random()*10)-4,48,96);
    const title=randTitle();
    if(C){C.rivalLast=C.rivalLast||{};C.rivalLast[rv.name]={title,meta}}
    return {
      studio:rv.name,
      isEx:!!rv.exLead,
      title,
      genre:GENRES[rv.fav]?.n||'Action',
      meta,gp,gfx
    };
  });
}

/* ===================== Karriere-Kostenkurve & Schwierigkeit ===================== */
// Alles wird mit jedem veröffentlichten Spiel, jedem Lead und wachsendem Ruhm teurer
function careerCost(){
  if(!C)return 1;
  return Math.round((1+0.12*(C.dir.games||0)+0.06*C.studio.staff.length+(C.studio.fame||0)/250)*100)/100;
}
const costK=v=>Math.round(v*careerCost()*10)/10;
const shopCost=it=>costK(it.cost*T().scale);
const hireFee=()=>costK(4*T().scale);
const researchCost=()=>costK(20*T().scale);
const moduleCost=()=>costK(8*T().scale);
const legendHireCost=()=>Math.round(40*T().scale*careerCost());
const staffSalMult=()=>1+0.08*(C?.dir?.games||0);
// Presse-Skepsis gegenüber Newcomern: erste Spiele kommen kaum über 50 Punkte
const rookiePenalty=()=>Math.max(0,12-4*(C?.dir?.games||0));

// Namen der gewonnenen Awards (alte Spielstände speichern Strings statt Objekten)
function wonAwardNames(e){
  return (e?.awards||[]).filter(a=>typeof a==='string'||a.won).map(a=>typeof a==='string'?a:a.cat);
}

/* ===================== Lead-Personal Helfer ===================== */
function getStaff(id){
  if(!C||!C.studio||!Array.isArray(C.studio.staff))return null;
  return C.studio.staff.find(x=>x.id===id)||null;
}
function hasStaff(id){return !!getStaff(id)}
function staffLevel(id){const st=getStaff(id);return st?(st.level||1):0}

function checkStaffLevelUp(st){
  if(!st)return false;
  let leveled=false;
  while((st.level||1)<5&&(st.xp||0)>=STAFF_XP_THRESH[st.level||1]){
    st.level=(st.level||1)+1;
    st.sal=Math.round((st.sal||STAFF[st.id].sal)*1.22*10)/10;
    if(!S||S.plan.gehalt<2)st.loyalty=clamp((st.loyalty||7)-1,1,10);
    leveled=true;
    addLog(`<span>Karriere</span> ${esc(st.personName)} (${STAFF[st.id].n}) steigt auf <b>Stufe ${st.level} (${STAFF_TITLES[st.level-1]})</b> auf! Gehaltsanspruch steigt.`);
  }
  return leveled;
}

function handleLeadPoach(){
  if(!C||!C.studio.staff.length)return '';
  const sorted=[...C.studio.staff].sort((a,b)=>(a.loyalty-b.loyalty)-(b.level-a.level));
  const victim=sorted[0];
  const idx=C.studio.staff.findIndex(x=>x.id===victim.id);
  if(idx>=0)C.studio.staff.splice(idx,1);
  if(!C.studio.exStaff)C.studio.exStaff=[];
  C.studio.exStaff.push({...victim,leftGame:C.gameNo});
  return `${victim.personName} (${STAFF[victim.id].n}, St. ${victim.level}) verlässt euch und gründet ein eigenes Konkurrenz-Studio!`;
}

function rewardStaff(id,mode){
  const st=getStaff(id);if(!st||!S)return;
  const sc=T().scale;
  if(mode==='bonus'){
    const cost=Math.round(st.sal*1.5*sc*10)/10;
    if(S.res.budget<cost)return;
    S.res.budget-=cost;
    S.spend.staff=(S.spend.staff||0)+cost;
    st.loyalty=clamp((st.loyalty||6)+2,1,10);
    S.shopMsg={n:`Bonus für ${st.personName}`,ch:[['budget',-cost],['note',`${st.personName}: Loyalität +2 (jetzt ${st.loyalty}/10)`]],txt:'Die Wertschätzung kommt genau zur richtigen Zeit.'};
    addLog(`<span>Personal</span> Sonderbonus (${money(cost)}) an ${esc(st.personName)} gezahlt → Loyalität ${st.loyalty}/10`);
  }else if(mode==='raise'){
    st.sal=Math.round(st.sal*1.2*10)/10;
    st.loyalty=clamp((st.loyalty||6)+3,1,10);
    S.shopMsg={n:`Gehaltserhöhung für ${st.personName}`,ch:[['note',`Neues Gehalt: ${money(st.sal*sc)}/Monat · Loyalität +3 (${st.loyalty}/10)`]],txt:'Ein langfristiges Bekenntnis. Die Konkurrenz blitzt ab.'};
    addLog(`<span>Personal</span> Gehalt von ${esc(st.personName)} dauerhaft erhöht → Loyalität ${st.loyalty}/10`);
  }
  render();save();
}

/* ===================== Eigene Engine & Interaktiver Tech-Tree ===================== */
function unlockNextEngineModule(eng){
  if(!eng)return null;
  eng.techPts=(eng.techPts||0)+1;
  return '+1 Engine-Forschungspunkt';
}

function unlockEngineModule(modId){
  if(!C||!C.studio.engine)return;
  const eng=C.studio.engine;
  const mod=ENGINE_MODULES[modId];
  // Module werden nur während eines Projekts erforscht: kostet Geld und belastet das Team
  if(!S||!mod||eng.modules.includes(modId)||(eng.techPts||0)<=0)return;
  const cost=moduleCost();
  if(S.res.budget<cost)return;
  S.res.budget-=cost;
  S.spend.eng=(S.spend.eng||0)+cost;
  eng.techPts--;
  eng.modules.push(modId);
  const stress=apply({moral:-1});
  if(S.engine==='eigen'&&mod.eff){
    const ch=apply(mod.eff);
    S.engMsg={n:`Modul erforscht: ${mod.n}`,ch:[['budget',-cost],...stress,...ch],txt:mod.d};
  }else{
    S.engMsg={n:`Modul erforscht: ${mod.n}`,ch:[['budget',-cost],...stress,['note','Aktiv beim nächsten Einsatz eurer Engine']],txt:mod.d};
  }
  addLog(`<span>Engine</span> Modul „${esc(mod.n)}“ für ${money(cost)} erforscht (−1 Moral)`);
  render();save();
}

function buyEngineResearchPoint(){
  if(!C||!C.studio.engine||!S)return;
  const eng=C.studio.engine;
  const cost=researchCost();
  // Höchstens ein Forschungs-Sprint pro Projekt, und er geht an die Substanz
  if(S.researchSprint||S.res.budget<cost)return;
  S.researchSprint=true;
  S.res.budget-=cost;
  S.spend.eng=(S.spend.eng||0)+cost;
  eng.techPts=(eng.techPts||0)+1;
  const stress=apply({moral:-1,bugs:1});
  S.engMsg={n:'Engine-Forschungssprint finanziert',ch:[['budget',-cost],...stress,['note','+1 Engine-Forschungspunkt verfügbar']],txt:'Euer Tech-Team hat in Nachtschichten einen neuen Modul-Bauplan fertiggestellt.'};
  addLog(`<span>Engine</span> Forschungspunkt für ${money(cost)} gekauft (−1 Moral, +1 Bug)`);
  render();save();
}

function setEngineLicense(mode){
  if(!C||!C.studio.engine||!ENGINE_LIC_MODES[mode])return;
  C.studio.engine.licenseMode=mode;
  render();save();
}

/* ===================== Engine-Projekt (eigenes Projekt zwischen zwei Spielen) ===================== */
const engProjScale=()=>C?.studio?.tier?TIERS[C.studio.tier].scale:1;
function engProjMonthCost(){
  const eng=C.studio.engine;
  const staffSal=C.studio.staff.reduce((a,st)=>a+(st.sal||STAFF[st.id].sal),0)*staffSalMult();
  return Math.round((8*(1+(C.studio.salaryDrift||0))+staffSal+2+(C.studio.overheadDrift||0)+0.4*eng.version+(eng.techDebt||0)*0.6)*engProjScale()*10)/10;
}
function engProjLicIncome(){
  const eng=C.studio.engine,lm=ENGINE_LIC_MODES[eng.licenseMode];
  if(!lm||!lm.inc)return 0;
  const bizMult=staffLevel('bizdev')>=5?1.3:staffLevel('bizdev')>=4?1.2:1;
  return Math.round(lm.inc*eng.version*engProjScale()*getEngineAgeInfo(eng.age||0).licMult*bizMult*10)/10;
}
const engProjCost=(goal,months)=>Math.round((engProjMonthCost()*months+costK(ENG_PROJECT_GOALS[goal].fee*engProjScale()))*10)/10;
const engProjTarget=(goal,months)=>Math.min(90,ENG_PROJECT_DURS[months].sg+(goal==='gen'?(C.studio.engine.version-1)*5:0));
const engProjMod=()=>(C.dir.s.technik-1)*4+staffLevel('senior')*4+(C.studio.engine.modules.includes('editor')?4:0);

function runEngineProject(goal,months,spec){
  const eng=C?.studio?.engine;
  if(S||!eng||!ENG_PROJECT_GOALS[goal]||!ENG_PROJECT_DURS[months])return;
  if(goal==='spec'&&!GENRES[spec])return;
  const cost=engProjCost(goal,months);
  if(C.studio.kasse<cost)return;
  const lic=Math.round(engProjLicIncome()*months*10)/10;
  C.studio.kasse=Math.round((C.studio.kasse-cost+lic)*10)/10;

  const r=d100(),mod=engProjMod(),target=engProjTarget(goal,months);
  const crit=r>=critMin(),fumble=r<=fumbleMax,ok=crit||(!fumble&&r+mod>=target);
  const dur=ENG_PROJECT_DURS[months],notes=[];
  const pts=n=>{eng.techPts=(eng.techPts||0)+n;if(n)notes.push(`+${n} Forschungspunkt${n>1?'e':''}`)};

  if(goal==='gen'){
    eng.version=(eng.version||1)+1;
    if(ok){eng.age=0;eng.techDebt=0;pts(1);notes.push(`${eng.name} v${eng.version}.0 ist Next-Gen`)}
    else{eng.age=1;eng.techDebt=(eng.techDebt||0)+2;notes.push(`v${eng.version}.0 läuft, aber mit Kinderkrankheiten (+2 Tech-Schulden)`)}
  }else if(goal==='spec'){
    eng.spec=spec;
    if(!eng.genres.includes(spec))eng.genres.push(spec);
    notes.push(`Spezialisiert auf ${GENRES[spec].n} (+4 Gameplay, +4 Grafik)`);
    if(!ok){eng.techDebt=(eng.techDebt||0)+1;notes.push('Unsauber umgesetzt: +1 Tech-Schulden')}
  }else{
    pts(ok?2:1);
  }
  if(ok){
    pts(dur.pts);
    if(months===12&&eng.techDebt){eng.techDebt=0;notes.push('Alle Tech-Schulden getilgt')}
  }
  if(fumble){eng.techDebt=(eng.techDebt||0)+1;notes.push('Patzer: ein Daten-Crash kostet Code (+1 Tech-Schulden)')}

  // Die Zeit vergeht: Leads sammeln Erfahrung, Gehälter steigen, der Markt dreht sich
  C.studio.staff.forEach(st=>{st.xp=(st.xp||0)+Math.floor(months/6);st.tenure=(st.tenure||0)+1;checkStaffLevelUp(st)});
  C.studio.salaryDrift=Math.round(((C.studio.salaryDrift||0)+0.03*months/6)*100)/100;
  if(months>=9)rollMarketTrend();
  const lt=liveTick(months);C.studio.kasse+=lt.net;notes.push(...lt.notes);
  advanceCalendar(months);
  C.engProjects=(C.engProjects||0)+1;
  C.engProj={goal,months,spec,r,mod,target,ok,crit,fumble,cost,lic,notes};
  render();save();
}

/* ===================== Auftragsarbeiten & Publisher-Meilensteine ===================== */
function startContract(id){
  if(rolling||!S)return;
  const ph=curPhase();
  if(!S.contractsPh)S.contractsPh=[];
  if(S.contractsPh.includes(ph))return;
  S.contractsPh.push(ph);
  S.contractStep=S.round;
  if(S.sprint)S.sprint.crunch=false;
  startRoll({kind:'contract',ev:id,adv:false});
}

function resolveContract(id,ok,crit){
  const c=CONTRACTS.find(x=>x.id===id);
  const sc=T().scale;
  const ch=[];
  if(ok){
    const pay=Math.round(c.pay*sc*(crit?1.35:1));
    S.res.budget+=pay;S.income+=pay;
    ch.push(['budget',pay]);
    if(c.sExtra)ch.push(...apply(c.sExtra));
  }else{
    const part=Math.round(c.pay*sc*0.3);
    S.res.budget+=part;S.income+=part;
    ch.push(['budget',part],...apply(c.f));
  }
  return {ch,txt:''};
}

const fameBonus=()=>C?Math.floor(((C.studio.fame||0)+(C.dir.fame||0))/15):0;
const fits=c=>(!c.tiers||c.tiers.includes(S.tier))&&(!c.models||c.models.some(m=>modelTags(S).includes(m)))&&(!c.ip||c.ip.includes(S.ip))&&(!c.mods||S.mods)&&(!c.noEA||!S.ea)&&(!c.ea||S.ea)&&(!c.cond||c.cond(S))&&(!c.flaw||hasF(c.flaw));
const optOk=o=>(!o.g||o.g.includes(S.genre)||o.g.includes(S.genre+'.'+S.subGenre))&&(!o.ng||!o.ng.includes(S.genre))&&(!o.cond||o.cond(S));
function addLog(t){if(!S)return;S.log.unshift(t);if(S.log.length>90)S.log.pop()}
function mandFor(i){const ids=[];for(let j=i-1;j>=0&&isSkipped(j);j--)ids.unshift(...(MAND_AT[STEPS[j].id]||[]));ids.push(...(MAND_AT[STEPS[i]?.id]||[]));return ids.filter(id=>!S.mdone.includes(id)&&(id!=='price'||S.model!=='f2p')&&(id!=='china'||(S.langs&&S.langs.zh)))}

/* ===================== Spielstart ===================== */
function startGame(o){
  if(!C.trend)rollMarketTrend();
  const t=TIERS[o.tier],dir=D();

  // Extras normalisieren (unterstützt Array o.extras sowie Legacy-Flags o.mods / o.ea)
  const extrasSet=new Set(Array.isArray(o.extras)?o.extras:[]);
  if(o.mods)extrasSet.add('mods');
  if(o.ea)extrasSet.add('ea');
  const extras=[...extrasSet].filter(k=>PROJECT_EXTRAS[k]&&(!PROJECT_EXTRAS[k].models||PROJECT_EXTRAS[k].models.includes(o.model)));

  let ip=o.ip,seq=null;if(ip.startsWith('seq:')){seq=C.hall[+ip.slice(4)];ip='franchise'}
  const first=C.gameNo===0;
  const budget=first?Math.round(220*t.scale*(dir.perks.includes('netz')?1.15:1)):Math.round(C.studio.kasse);

  const res={
    budget,
    moral:6,
    hype:2+t.hype,
    gp:20+(t.gp??t.qual),
    gfx:20+(t.gfx??t.qual),
    snd:20+Math.round(((t.gp??t.qual)+(t.gfx??t.qual))/2),
    qual:20+t.qual,
    bugs:5,
    zeit:0,
    wl:0
  };
  res.hype+=IPS[ip].hype;

  res.moral+=dir.s.fuehrung-1;
  res.hype+=dir.s.hype-1+(dir.flaws.includes('verspricht')?2:0);
  if(staffLevel('art')>=4)res.hype+=1;
  if(staffLevel('community')>=3)res.hype+=(staffLevel('community')>=5?2:1);
  if(C.studio.engine&&C.studio.engine.licenseMode==='opensource')res.hype+=1;

  res.hype+=Math.floor(C.studio.fame/25)+Math.floor(C.dir.fame/30);
  if(seq)res.hype+=clamp(Math.floor((seq.meta-60)/8),0,4);
  res.wl+=Math.round((C.studio.fame+C.dir.fame)*60*t.sales+(seq?seq.meta*40*t.sales:0));

  const scaledStats={};
  for(const k in STATS)scaledStats[k]=0;

  // Projekt-Extras anwenden (Start-Effekte, Vorabkosten & Stat-Boni)
  let upfrontExtraCost=0;
  extras.forEach(ek=>{
    const ex=PROJECT_EXTRAS[ek];
    if(!ex)return;
    if(ex.upfront)upfrontExtraCost+=Math.round(ex.upfront*t.scale);
    if(ex.statBonus){
      for(const [sk,sv] of Object.entries(ex.statBonus))scaledStats[sk]=(scaledStats[sk]||0)+sv;
    }
    if(ex.eff){
      for(const [rk,rv] of Object.entries(ex.eff)){
        if(rk==='wl')res.wl+=Math.round(rv*1000*t.sales);
        else res[rk]=(res[rk]||0)+rv;
      }
    }
  });

  // Start-Hype gedeckelt: Hype soll man sich im Projekt erarbeiten
  res.moral=clamp(res.moral,0,10);res.hype=clamp(res.hype,0,6);res.bugs=Math.max(0,res.bugs);
  const plan={};for(const k in PLAN)plan[k]=PLAN[k].def;

  const durKey=DUR_KEYS.includes(o.dur)?o.dur:'normal';
  S={v:2,durKey,dur:durMonths(o.tier,durKey),screen:'event',title:o.title||randTitle(),genre:null,subGenre:null,gmod:null,extras,tier:o.tier,model:o.model,ip,seq:seq?{title:seq.title,meta:seq.meta}:null,
     mods:extras.includes('mods'),ea:extras.includes('ea'),
     stats:scaledStats,res,start:budget,einlage:0,investIn:0,liveNet:0,round:0,deck:[],mdone:extras.includes('sportLic')?['license']:[],insp:2,log:[],adv:false,last:null,
     plan,acc:{},spend:{},income:0,payers:0,usedR:[],month:null,aff:0,promises:dir.flaws.includes('verspricht')?1:0,abUsed:false,works:false,
     shop:[],contractsPh:[],msDone:[],msResult:null,prod:{},recoup:0,publisher:false,pubExtra:0,loan:0,equity:0,layoff:false,rescued:[],langs:null,langDone:false,china:'none',
     feat:null,hunt:null,ship:null,delayM:0,engine:null,engAction:null,engAgeAtStart:0,world:null,cast:null,lic:null,plat:null,age:null,price:1,lootbox:false,algo:false,eaPenalty:0,dlcDone:false,
     trendHot:false,trendCold:false,concept:{...defaultConcept(!!GENRES[o.genre]),done:!!o.actsDone},proto:{n:0,fun:0,done:!!o.actsDone},usp:null,aud:'core',seed:Math.floor(Math.random()*1e9),sprint:defaultSprint(),contractStep:-1,fund:defaultFund(),skip:[],inf:defaultInf(),crunchN:0,crisisSeen:false,probeSeen:false};

  C.live?.forEach(g=>g.seasonAt=null);
  S.res.zeit=totalW(S)+2;
  if(o.genre)applyGenre(o.genre,o.subGenre||null,o.gmod||null);
  else recalcQual();
  const fee=(IPS[ip].fee*t.scale)+upfrontExtraCost;
  if(fee){S.res.budget-=fee;S.spend.projekt=fee}
  // Ein Ereignis pro Schritt: bevorzugt unbenutzt aus der Inhaltsphase, sonst Wiederholung, sonst Nachbarphase
  const poolOf=p=>E.map((e,i)=>i).filter(i=>E[i].p===p&&fits(E[i]));
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  STEPS.forEach(st=>{
    const all=poolOf(st.cp),fresh=all.filter(i=>!S.deck.includes(i));
    const pool=fresh.length?fresh:all.length?all:poolOf(st.cp+1).length?poolOf(st.cp+1):poolOf(st.cp-1);
    S.deck.push(pick(pool));
  });
  C.gameNo++;
  const exLabels=extras.map(k=>PROJECT_EXTRAS[k]?.n).filter(Boolean);
  addLog(`<span>Start</span> ${esc(C.studio.name)} beginnt „${esc(S.title)}“: ${t.n}, ${genreName(S)}${S.trendHot?' (Boom-Genre!)':S.trendCold?' (Übersättigt)':''}, ${IPS[ip].n}${seq?' von „'+esc(seq.title)+'“':''}, ${MODELS[o.model].n}${exLabels.length?' · Extras: '+exLabels.join(', '):''}, Director ${esc(dir.n)}, ${money(budget)} Budget`);
  goMonth();
}

/* Genre-abhängige Startwerte: bei Projektstart oder später im Konzept-Schritt */
function applyGenre(genre,sub,gmod){
  const g=GENRES[genre];if(!g||!S)return;
  const dir=D();
  const subKey=subGenreOf(genre,sub)?sub:defaultSub(genre);
  const subG=subGenreOf(genre,subKey);
  const gm=GENRE_MODS[gmod]?gmod:null;
  const res=S.res;const h0=res.hype;
  S.genre=genre;S.subGenre=subKey;S.gmod=gm;
  for(const k in g.b){
    if(k==='qual'){res.gp+=g.b[k];res.gfx+=g.b[k];res.snd+=g.b[k]}
    else res[k]=(res[k]||0)+g.b[k];
  }
  if(subG){
    for(const k in subG.b){
      const half=Math.round(subG.b[k]*0.5);
      if(k==='qual'){res.gp+=half;res.gfx+=half;res.snd+=half}
      else res[k]=(res[k]||0)+half;
    }
  }
  if(gm){
    const mb={...GENRE_MODS[gm].b},fitM=modFit(genre,subKey,gm);
    if(fitM==='syn')for(const k in MOD_SYN)mb[k]=(mb[k]||0)+MOD_SYN[k];
    if(fitM==='clash')for(const k in MOD_CLASH)mb[k]=(mb[k]||0)+MOD_CLASH[k];
    for(const k in mb)res[k]=(res[k]||0)+mb[k];
  }
  if((g.fit===S.model||(subG&&subG.fit===S.model))&&S.model!=='kauf')res.hype+=1;
  S.trendHot=!!(C.trend&&C.trend.hot===genre);
  S.trendCold=!!(C.trend&&C.trend.cold===genre);
  if(S.trendHot)res.hype+=1;
  const spez=dir.perks.includes('spezial');
  S.aff=(dir.aff[genre]||0)+(spez?1:0);
  res.gp+=S.aff*5+(spez?4:0);
  res.gfx+=S.aff*3;
  for(const k in STATS)S.stats[k]=(S.stats[k]||0)+(g.s[k]||0)*4+(subG?(subG.s[k]||0)*2:0);
  res.moral=clamp(res.moral,0,10);res.hype=clamp(res.hype,0,Math.max(6,h0));res.bugs=Math.max(0,res.bugs);
  recalcQual();
}

function goMonth(){const m=mandFor(S.round);if(m.length){S.mcur=m[0];S.screen=m[0]==='lang'?'lang':'mand'}else S.screen=conceptDue()?'concept':protoDue()?'proto':(typeof featuresDue==='function'&&featuresDue())?'features':(typeof huntDue==='function'&&huntDue())?(openHunt(),'hunt'):(typeof shipDue==='function'&&shipDue())?'ship':(typeof pitchDue==='function'&&pitchDue())?'pitch':'event';render();save()}

/* ===================== W100 Würfel-Modifikatoren & Regeln ===================== */
function moralMod(){
  const m=S.res.moral;
  return m>=9?6:m>=7?3:m<=1?-10:m<=3?-5:0;
}

function modFor(st){
  const dm={design:'vision',technik:'technik',team:'fuehrung',business:'business'}[st];
  const d=D();
  let m=S.stats[st]
    +(st==='team'?T().teamMod:0)
    +(st==='design'?IPS[S.ip].design:0)
    +(d.s[dm]-1)*4
    +Math.sign(S.aff||0)*4
    +(hasP('spezial')&&S.aff>0?3:0);

  if(st==='technik'&&hasF('technikfern'))m-=8;
  if(st==='business'&&hasP('netz'))m+=5;

  if(st==='technik'&&hasStaff('senior'))m+=STAFF_STAT_BONUS[staffLevel('senior')];
  if(st==='technik'&&hasStaff('qalead'))m+=Math.floor(STAFF_STAT_BONUS[staffLevel('qalead')]*0.6);
  if(st==='design'&&hasStaff('art'))m+=STAFF_STAT_BONUS[staffLevel('art')];
  if(st==='team'&&hasStaff('producer'))m+=STAFF_STAT_BONUS[staffLevel('producer')];
  if(st==='business'&&hasStaff('bizdev'))m+=STAFF_STAT_BONUS[staffLevel('bizdev')];
  if(st==='business'&&hasStaff('community'))m+=Math.floor(STAFF_STAT_BONUS[staffLevel('community')]*0.7);

  const eng=C&&C.studio.engine;
  if(st==='technik'&&S.engine==='eigen'&&eng){
    if(eng.modules.includes('netcode')&&['action','survival','sports'].includes(S.genre))m+=5;
    if(eng.licenseMode==='seat'&&!hasStaff('senior'))m-=4;
  }
  if(st==='team'&&S.layoff)m-=6;
  if(st==='technik'&&S.engine==='godoh'&&S.tier==='aaa')m-=8;
  if(st==='technik'&&S.engine==='unitee'&&S.tier==='aaa')m-=4;
  return m;
}

function optMod(o){
  let bonus=0;
  if(hasStaff('audio')&&((o.s&&o.s.snd>0)||(o.f&&o.f.snd)))bonus+=STAFF_STAT_BONUS[staffLevel('audio')];
  const isEngOrPort=o.set&&(o.set.engine==='eigen'||['konsole','alle'].includes(o.set.plat))||o.l==='Eigene Server-Architektur';
  if(hasP('engine')&&isEngOrPort)bonus+=15;
  if(isEngOrPort&&staffLevel('senior')>=4)bonus+=(staffLevel('senior')>=5?10:6);
  if(o.set&&['konsole','alle'].includes(o.set.plat)&&S.engine==='eigen'&&C.studio.engine?.modules.includes('portkit'))bonus+=12;
  return modFor(o.st)+bonus;
}

function apply(eff){
  const out=[];if(!eff)return out;const sc=T().scale;
  if(eff.snd>=5&&staffLevel('audio')>=4)eff={...eff,snd:eff.snd+3};
  for(const k in eff){
    let v=eff[k];if(!v)continue;
    if(k==='payers'){S.payers+=v;out.push([k,v]);continue}
    if(k==='ea'){S.ea=true;out.push([k,v]);continue}
    if(k==='promise'){S.promises=Math.max(0,S.promises+v);out.push([k,v]);continue}
    if(k==='recoup'){S.recoup+=v*sc;S.publisher=true;out.push([k,v*sc]);continue}
    if(k==='wl'){v=Math.round(v*1000*T().sales*(D().s.hype>=3?1.15:1));S.res.wl+=v;out.push([k,v]);continue}
    if(k==='moral'&&v<0&&hasP('crunch')){v=Math.min(0,v+1);if(!v)continue}
    if(k==='zeit'&&v<0&&hasStaff('producer')){
      const ph=curPhase();
      const maxSave=staffLevel('producer')>=3?2:1;
      const used=S.prod[ph]||0;
      if(used<maxSave){
        S.prod[ph]=used+1;
        v+=1;
        out.push(['note',`${getStaff('producer').personName} (Producer) fängt Verzug ab`]);
        if(!v)continue;
      }
    }
    if(k==='fame'){const old=C.studio.fame||0;C.studio.fame=Math.max(0,old+v);if(C.studio.fame!==old)out.push([k,C.studio.fame-old]);continue}
    if(k==='budget'){v=v*sc;if(v<0)S.spend.projekt=(S.spend.projekt||0)-v;else S.income+=v;S.res.budget+=v;out.push([k,v]);continue}
    if(k==='qual'){
      S.res.gp=(S.res.gp||20)+v;
      S.res.gfx=(S.res.gfx||20)+v;
      S.res.snd=(S.res.snd??20)+v;
      out.push(['gp',v],['gfx',v],['snd',v]);
      continue;
    }
    // Hype steigt umso langsamer, je höher er schon ist (Rest wird angespart)
    if(k==='hype'&&v>0){
      S.acc=S.acc||{};
      S.acc.hypeG=(S.acc.hypeG||0)+v*Math.max(.15,Math.pow(1-S.res.hype/11,1.5));
      v=Math.floor(S.acc.hypeG);S.acc.hypeG-=v;
      if(!v)continue;
    }
    if(k==='gp'||k==='gfx'||k==='snd'){
      S.res[k]=(S.res[k]||20)+v;
      out.push([k,v]);
      continue;
    }
    S.res[k]+=v;out.push([k,v]);
  }
  normRes();return out;
}

function normRes(){
  S.res.moral=clamp(S.res.moral,0,10);
  S.res.hype=clamp(S.res.hype,0,10);
  S.res.gp=clamp(Math.round(S.res.gp??S.res.qual??20),0,100);
  S.res.gfx=clamp(Math.round(S.res.gfx??S.res.qual??20),0,100);
  S.res.snd=clamp(Math.round(S.res.snd??(S.res.gp+S.res.gfx)/2),0,100);
  recalcQual();
  S.res.bugs=Math.max(0,S.res.bugs);
  S.res.wl=Math.max(0,S.res.wl);
}

function unapply(ch){
  for(const [k,v] of ch){
    if(k==='budget'){S.res.budget-=v;if(v<0)S.spend.projekt-=-v;else S.income-=v}
    else if(k==='payers')S.payers-=v;else if(k==='promise')S.promises=Math.max(0,S.promises-v);else if(k==='recoup')S.recoup-=v;
    else if(k==='fame')C.studio.fame=Math.max(0,(C.studio.fame||0)-v);
    else if(k in S.res)S.res[k]-=v;
  }
  normRes();
}

function applySet(sp,ok){
  const st={...(sp.set||{}),...(ok===true?sp.sset||{}:{}),...(ok===false?sp.fset||{}:{})};
  const out=[];
  for(const k in st)S[k]=st[k];
  onSet(st,out,ok);
  return out;
}

// Krypto: Einsatz sofort abbuchen, Auflösung nach 1–2 Monaten
function cryptoInvest(pct,out){
  const amt=Math.round(Math.max(0,S.res.budget)*pct*10)/10;
  if(amt<=0){out.push(['note','Kein Geld zum Zocken da. Der Tech-Bro zieht weiter.']);return}
  S.res.budget-=amt;
  S.crypto={amt,due:S.round+1+(Math.random()<.5?1:2),done:false};
  out.push(['budget',-amt],['note',`🪙 ${money(amt)} in $MOONCAT, Auflösung Ende von Schritt ${S.crypto.due}`]);
}
const CRYPTO_OUT=[
  {p:.50,m:0,t:'Totalverlust: Der Coin hieß in Wahrheit RugPullToken. Der Tech-Bro ist auf den Bahamas.',moral:-1},
  {p:.20,m:.5,t:'Der Kurs hat sich halbiert. Ihr steigt mit einem blauen Auge aus.'},
  {p:.17,m:2,t:'Verdoppelt! Der Tech-Bro schickt euch ein Raketen-Emoji.'},
  {p:.10,m:10,t:'x10! $MOONCAT geht viral. Das Team will plötzlich auch einsteigen.'},
  {p:.03,m:100,t:'x100! Ihr seid Krypto-Millionäre. Fast jedenfalls.'}
];
function resolveCrypto(){
  const c=S.crypto;
  if(!c||c.done||S.round+1<c.due)return null;
  let r=Math.random(),o=CRYPTO_OUT[0];
  for(const x of CRYPTO_OUT){if(r<x.p){o=x;break}r-=x.p}
  const cap=Math.round(monthSum()*20*10)/10;
  let pay=Math.round(c.amt*o.m*10)/10,capped=false;
  if(pay>cap){pay=cap;capped=true}
  S.res.budget+=pay;S.income+=pay;
  c.done=true;c.mult=o.m;c.pay=pay;
  return {moral:o.moral||0,note:`🪙 Krypto: ${o.t} ${pay>0?`Auszahlung ${money(pay)}${capped?' (die Börse sperrt den Rest ein)':''}`:`${money(c.amt)} sind weg`}`};
}

function onSet(st,out,ok){
  if(st.cryptoPct){cryptoInvest(st.cryptoPct,out);delete S.cryptoPct}
  if(st.world){
    const g=worldFit();
    if(g.w.includes(st.world)){out.push(...apply({gp:3,gfx:2}),['note','Weltstruktur passt zum Genre'])}
    else if(g.bad.includes(st.world)){out.push(...apply({gp:-4,gfx:-2,bugs:2}),['note','Weltstruktur passt nicht zum Genre'])}
  }
  if(st.engine){
    if(st.engine==='eigen'){
      if(!C.studio.engine){
        const baseName=C.studio.name.split(' ')[0]||'Core';
        C.studio.engine={
          name:baseName+'-Engine',
          version:1,
          runs:1,
          age:0,
          techPts:1, // Startet mit 1 Forschungspunkt für den Tech-Tree!
          genres:[S.genre],
          modules:[],
          licenseMode:'none',
          techDebt:0
        };
        S.engAgeAtStart=0;
        out.push(['note',`${C.studio.engine.name} v1.0 gegründet (+1 Engine-Forschungspunkt im Tech-Tree verfügbar!)`]);
      }else{
        const eng=C.studio.engine;
        if(st.engAction==='adapt'){
          S.engAgeAtStart=eng.age||0;
          if(!eng.genres.includes(S.genre))eng.genres.push(S.genre);
          out.push(['note',`${eng.name} beherrscht jetzt auch ${GENRES[S.genre].n} (${getEngineAgeInfo(eng.age).label})`]);
        }else if(st.engAction==='upgrade'){
          eng.version=(eng.version||1)+1;
          eng.age=0;
          eng.techDebt=0;
          eng.techPts=(eng.techPts||0)+1;
          S.engAgeAtStart=0;
          if(!eng.genres.includes(S.genre))eng.genres.push(S.genre);
          out.push(['note',`${eng.name} auf v${eng.version}.0 (Next-Gen) erneuert · +1 Engine-Forschungspunkt im Tech-Tree!`]);
        }else if(st.engAction==='reuse'){
          S.engAgeAtStart=eng.age||0;
          const ageInfo=getEngineAgeInfo(eng.age||0);
          out.push(['note',`Engine-Zustand: ${ageInfo.label}`]);
          if((eng.techDebt||0)>0)out.push(['note',`Technische Schulden sorgen für +${eng.techDebt*2} Start-Bugs`]);
        }
      }
    }else{
      const ed=ENGINE_DEFS[st.engine];
      if(ed){
        if(ed.good.includes(S.genre)){
          out.push(...apply(ed.goodEff),['note',ed.goodNote]);
        }else if(ed.bad.includes(S.genre)){
          out.push(...apply(ed.badEff),['note',ed.badNote]);
        }
      }
    }
  }
  if(st.plat&&['konsole','alle'].includes(st.plat)&&S.engine==='eigen'&&C.studio.engine?.modules.includes('portkit')){
    const refund=Math.round((st.plat==='alle'?12:7)*T().scale);
    S.res.budget+=refund;S.spend.projekt=Math.max(0,(S.spend.projekt||0)-refund);
    out.push(['budget',refund],['note','Multi-Plattform-Compiler spart Portierungskosten']);
  }
  if(st.age&&S.lootbox)out.push(['note','Lootboxen: in Belgien und den Niederlanden nicht erhältlich']);
}

function chip([k,v]){
  if(k==='note')return `<span class="chip">${v}</span>`;
  if(k==='payers')return `<span class="chip ${v>0?'p':'n'}">${fmt(v)} % zahlende Spieler</span>`;
  if(k==='ea')return `<span class="chip p">Early Access ab Alpha</span>`;
  if(k==='promise')return `<span class="chip ${v<0?'p':'n'}">${fmt(v)} offenes Versprechen</span>`;
  if(k==='recoup')return `<span class="chip">Vorschuss ${money(v)} wird später verrechnet</span>`;
  if(k==='wl')return `<span class="chip ${v>0?'p':'n'}">${v>0?'+':'−'}${nf(Math.abs(v),0)} Wishlists</span>`;
  if(k==='budget')return `<span class="chip ${v>0?'p':'n'}">${money(v,true)}</span>`;
  const L={moral:'Moral',hype:'Hype',feat:'🧩 Feature-Punkte',qual:'Qualität',gp:'Gameplay',gfx:'Grafik',snd:'Sound',bugs:'Bugs',zeit:'Zeit',fame:'Studio-Ruf'};
  const good=k==='bugs'?v<0:v>0;
  return `<span class="chip ${good?'p':'n'}">${fmt(v)} ${L[k]||k}</span>`;
}
function chips(list){return list&&list.length?'<div class="chips">'+list.map(chip).join('')+'</div>':''}

/* ===================== Monatliche Kosten & Money Drains ===================== */
function monthLines(){
  const sc=T().scale;
  const L={};
  const add=(c,v)=>{if(v)L[c]=(L[c]||0)+v};

  const drift=1+(C?.studio?.salaryDrift||0);
  add('personal',(8*drift+PLAN.gehalt.cost[S.plan.gehalt])*sc*(S.layoff?.7:1));

  if(C&&C.studio.staff.length){
    add('staff',C.studio.staff.reduce((a,st)=>a+(st.sal||STAFF[st.id].sal),0)*sc*staffSalMult());
  }

  const fameOver=C?Math.floor((C.studio.fame||0)/25)*0.6:0;
  const over=(2+(C?.studio?.overheadDrift||0)+fameOver)*sc;
  add('buero',over);

  for(const k of ['mkt','qa','team','weiter','outs'])add(PLAN[k].cat,PLAN[k].cost[S.plan[k]]*sc);
  if(S.world==='open')add('welt',2*sc);else if(S.world==='hub')add('welt',1*sc);
  if((S.model!=='kauf'||hasPremium(S))&&stepFlag('live'))add('server',2*sc);
  if(S.mods)add('mods',1*sc);
  if(Array.isArray(S.extras)){
    S.extras.forEach(ek=>{
      if(ek==='mods')return; // bereits über S.mods erfasst
      const mCost=PROJECT_EXTRAS[ek]?.monthly||0;
      if(mCost)add('mods',mCost*sc);
    });
  }

  if(C&&C.studio.engine){
    const eng=C.studio.engine;
    const maint=(0.4*eng.version+(eng.techDebt||0)*0.6+(eng.age||0)*0.3)*sc;
    if(maint>0)add('eng',maint);
  }

  if(S.loan)add('zins',S.loan*.02);

  const prodDisc=staffLevel('producer')>=5?0.9:staffLevel('producer')>=4?0.95:1;
  const f=(hasF('kosten')?1.15:1)*(hasP('spar')?.9:1)*prodDisc;
  return Object.entries(L).map(([c,v])=>[c,Math.round(v*(c==='zins'?1:f)*10)/10]);
}

const monthSum=()=>monthLines().reduce((a,[,v])=>a+v,0);
function runway(){const m=costPerMonth();return m>0?Math.floor(S.res.budget/m):99}
const curPhase=()=>curStep().ph;
const curCP=()=>curStep().cp;
const spendTotal=()=>Object.values(S.spend).reduce((a,b)=>a+b,0);

/* ===================== Ablauf & W100-Würfeln ===================== */
function curCard(){return S.screen==='mand'?getMand(S.mcur):S.screen==='fair'?fairCard(S.fair):S.screen==='stream'?streamCard(S.stream):S.screen==='creep'?creepCard(S.creep):S.screen==='probe'?probeCard(S.probe.j):E[S.deck[S.round]]}

function choose(i){
  if(rolling)return;
  const kind=S.screen==='mand'?'mand':S.screen==='fair'?'fair':S.screen==='stream'?'stream':S.screen==='creep'?'creep':S.screen==='probe'?'probe':'card';
  const ev=kind==='mand'?S.mcur:kind==='fair'?S.fair:kind==='stream'?S.stream:kind==='creep'?S.creep:kind==='probe'?S.probe.j:S.deck[S.round];
  const o=curCard().o[i];
  const pre=o.set?applySet({set:o.set},null):[];
  if(o.safe){
    const ch=apply(o.safe);let txt=o.sx;
    if(o.onSafe){const x=o.onSafe();if(x){ch.push(...x.ch);if(x.txt)txt+=' '+x.txt}}
    S.last={kind,ev,oi:i,safe:true,ch,pre,txt,l:o.l};
    S.screen='result';
    addLog(`<span>${stepTag()}</span> ${curTitle(kind,ev)}: ${o.l}`);
    render();save();return;
  }
  S.preCh=pre;
  const adv=S.adv&&S.insp>0;
  if(adv)S.insp--;
  S.adv=false;
  startRoll({kind,ev,oi:i,adv});
}

function curTitle(kind,ev){
  return kind==='mand'?getMand(ev).t
    :kind==='card'?E[ev].t
    :kind==='rand'?R[ev].t
    :kind==='legend'?(DIRS[ev]?`Legendäre Begegnung: ${DIRS[ev].n}`:'Legendäre Begegnung')
    :kind==='fair'?fairCard(ev).t
    :kind==='stream'?streamCard(ev).t
    :kind==='creep'?creepCard(ev).t
    :kind==='probe'?probeCard(ev).t
    :kind==='shop'?SHOP.find(x=>x.id===ev).n
    :kind==='contract'?CONTRACTS.find(x=>x.id===ev).n
    :kind==='hire'?STAFF[ev].n
    :kind==='dlc'?DLC_OPTS.find(x=>x.id===ev).n
    :kind==='pitch'?'Pitch-Termine'
    :kind==='proto'?'Prototyp-Schleife'
    :kind==='hunt'?'Bug-Jagd'
    :kind==='renego'?'Nachverhandlung'
    :RESC.find(x=>x.id===ev).n;
}

function getOpt(p){
  if(p.kind==='card')return E[p.ev].o[p.oi];
  if(p.kind==='fair')return fairCard(p.ev).o[p.oi];
  if(p.kind==='stream')return streamCard(p.ev).o[p.oi];
  if(p.kind==='creep')return creepCard(p.ev).o[p.oi];
  if(p.kind==='probe')return probeCard(p.ev).o[p.oi];
  if(p.kind==='pitch'){const amb=pitchAmb();return {l:'Pitch',st:'business',dc:Math.min(...S.pitchSel.map(id=>FUNDERS[id].dc+(amb?FUND.ambDc:0))),s:{},f:{},bonusV:pitchBonus()}}
  if(p.kind==='proto')return {l:'Prototyp-Iteration',st:'design',dc:protoDc(S),s:{},f:{},bonusV:0};
  if(p.kind==='hunt')return {l:'QA-Runde',st:'technik',dc:HUNT.dc[p.ev],s:{},f:{}};
  if(p.kind==='renego')return {l:'Nachverhandeln',st:'business',dc:FUND.renegoDc,s:{},f:{},bonusV:fameBonus()};
  if(p.kind==='mand')return getMand(p.ev).o[p.oi];
  if(p.kind==='rand'){const r=R[p.ev];const adj=r.dcAdj?r.dcAdj(S):0;return {...r,l:'Rettungswurf',dc:dc100(r.dc)+adj*4}}
  if(p.kind==='legend'){
    const leg=DIRS[p.ev];
    const role=leg?.leadRole||'senior';
    const st=STAFF[role]?.stat||'design';
    return {
      l:leg?.encCollabLabel||`Gast-Session mit ${leg?.n||'Legende'}`,
      st,
      dc:78,
      s:leg?.encEff||{gp:5},
      f:{moral:-2},
      sx:`${leg?.n} ist begeistert von eurem Team, verbessert euer Projekt und steht ab sofort dauerhaft als freigeschalteter Game Director bereit!`,
      fx:`${leg?.n} schüttelt den Kopf über euren Prototyp und zieht weiter. Vielleicht klappt es beim nächsten Treffen!`,
      bonusV:fameBonus()
    };
  }
  if(p.kind==='shop'){const it=SHOP.find(x=>x.id===p.ev);return {...it,l:it.n}}
  if(p.kind==='contract'){const c=CONTRACTS.find(x=>x.id===p.ev);return {...c,l:c.n,s:{},f:{}}}
  if(p.kind==='hire'){const s=STAFF[p.ev];return {l:'Bewerbungsgespräch',st:'business',dc:50,s:{},f:{},sx:`${s.n} sagt zu und fängt nächste Woche an.`,fx:`Absage — die Konkurrenz hat mehr geboten. Die Agenturgebühr ist trotzdem weg.`,bonusV:fameBonus()}}
  if(p.kind==='dlc'){const d=DLC_OPTS.find(x=>x.id===p.ev);return {...d,l:d.n,s:{},f:{}}}
  const r=RESC.find(x=>x.id===p.ev);return {...r,l:r.n,s:{},f:r.id==='crowd'?{hype:-2}:{},bonusV:(r.bonus?r.bonus():0)+fameBonus()+(S.early?8:0)};
}

function startRoll(p){
  S.pending=p;
  if(manual){S.screen='manual';render();save();setTimeout(()=>{const m=$('mIn');m&&m.focus()},30);return}
  const rolls=p.adv?[d100(),d100()]:[d100()];
  animate(rolls,()=>resolve(rolls));
}

function animate(rolls,done,keep){
  if(!keep){S.screen='roll';render()}
  const els=[...document.querySelectorAll('#dice .d20')];
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!els.length){done();return}
  rolling=true;els.forEach(e=>e.classList.add('spin'));
  const iv=setInterval(()=>els.forEach(e=>e.querySelector('text').textContent=d100()),55);
  setTimeout(()=>{clearInterval(iv);rolling=false;done()},780);
}

function resolve(rolls){
  const p=S.pending;const o=getOpt(p);
  const target=dc100(o.dc);
  const r=Math.max(...rolls);const mod=optMod(o)+(o.bonusV||0);const mm=moralMod();const total=r+mod+mm;
  const crit=r>=critMin(),fumble=r<=fumbleMax;const ok=crit||(!fumble&&total>=target);
  const eff={...((ok?o.s:o.f)||{})};
  if(crit){
    eff.gp=(eff.gp||0)+2;eff.gfx=(eff.gfx||0)+2;eff.moral=(eff.moral||0)+1;S.insp=Math.min(3,S.insp+1);
    if(C&&C.studio.staff.length){
      C.studio.staff.filter(st=>STAFF[st.id].stat===o.st).forEach(st=>{st.xp=(st.xp||0)+1;checkStaffLevelUp(st)});
    }
  }
  if(fumble){eff.bugs=(eff.bugs||0)+2;eff.moral=(eff.moral||0)-1}
  const ch=apply(eff);let pre=S.preCh||[];S.preCh=null;let txt=(ok?o.sx:o.fx)||'';
  if(p.kind==='card'||p.kind==='mand')pre=pre.concat(applySet({sset:o.sset,fset:o.fset},ok));
  if(p.kind==='rescue'){const x=rescueDo(o.id,ok);pre=pre.concat(x.ch);if(x.txt)txt+=' '+x.txt}
  if(p.kind==='contract'){const x=resolveContract(o.id,ok,crit);pre=pre.concat(x.ch);if(x.txt)txt+=' '+x.txt}
  if(p.kind==='hire'&&ok&&!hasStaff(p.ev)){
    const pool=LEAD_NAMES[p.ev]||['Alex Novotny'];
    const usedNames=C.studio.staff.map(x=>x.personName);
    const avail=pool.filter(n=>!usedNames.includes(n));
    const personName=(avail.length?avail:pool)[Math.floor(Math.random()*(avail.length||pool.length))];
    const baseLoy=clamp(6+(D().s.fuehrung>=3?1:0)+(hasP('crunch')?1:0),1,10);
    C.studio.staff.push({id:p.ev,personName,level:1,xp:0,sal:STAFF[p.ev].sal,loyalty:baseLoy,tenure:0});
    txt=`${personName} (${STAFF[p.ev].n}) verstärkt ab sofort euer Führungsteam!`;
  }
  if(p.kind==='legend'&&ok){
    const leg=DIRS[p.ev];
    const newly=unlockChar(p.ev);
    if(newly)pre.push(['note',`🔓 Legende freigeschaltet: ${leg.n} (${leg.tag}) beim Start wählbar!`]);
  }
  if(p.kind==='dlc'){
    const x=resolveDlc(o.id,ok,crit);
    pre=pre.concat(x.ch);
    if(x.txt)txt+=' '+x.txt;
  }
  if(p.kind==='pitch'){const x=resolvePitch(total,crit,fumble);pre=pre.concat(x.ch);if(x.txt)txt+=' '+x.txt}
  if(p.kind==='proto'){const x=resolveProto(ok,crit,fumble);pre=pre.concat(x.ch);if(x.txt)txt+=' '+x.txt}
  if(p.kind==='hunt'){const x=resolveHunt(p.ev,ok,crit);pre=pre.concat(x.ch);if(x.txt)txt+=' '+x.txt}
  if(p.kind==='renego'){const x=resolveRenego(ok);pre=pre.concat(x.ch);if(x.txt)txt+=' '+x.txt}
  if(ok&&o.onOk){const x=o.onOk();if(x)txt+=' '+x}
  if(!ok&&o.onFail){const x=o.onFail();if(x)txt+=' '+x}
  S.last={...p,rolls,r,mod,mm,total,ok,crit,fumble,ch,pre,txt,dc:target,st:o.st,l:o.l};
  addLog(`<span>${stepTag()}</span> ${curTitle(p.kind,p.ev)}: ${o.l} · W100 ${rolls.join('/')} ${fmt(mod+mm)} = ${total} gegen SG ${target} → ${crit?'kritischer Erfolg':fumble?'Patzer':ok?'Erfolg':'Fehlschlag'}`);
  S.pending=null;S.screen='result';render();save();
}

function afterResult(k){
  if(k==='card')monthEnd();
  else if(k==='mand'){S.mdone.push(S.mcur);goMonth()}
  else if(k==='rand'||k==='legend'||k==='fair')afterRandom();
  else if(k==='probe'||k==='creep')afterRandom();
  else if(k==='stream'){if(S.last.oi!==2)revealInf(S.stream);afterRandom()}
  else if(k==='shop'||k==='hire'||k==='contract'){S.screen='shop';render();save()}
  else if(k==='pitch'||k==='proto')goMonth();
  else if(k==='hunt'){if(S.hunt&&S.hunt.done)huntLog();goMonth()}
  else if(k==='renego'){S.screen='milestone';render();save()}
  else if(k==='dlc'){S.screen='end';render();save()}
  else if(k==='rescue'){if(S.over)gameOver(S.over);else{S.screen='crisis';render();save()}}
}

/* ===================== Monatsabschluss ===================== */
const DELAYS=[
  'Ein Kern-Feature muss neu gebaut werden',
  'Die Build-Pipeline ist eine Woche lang kaputt',
  'Ein Lead fällt mit Grippe aus',
  'Der Asset-Zulieferer liefert zu spät',
  'Ein Engine-Update bricht die halbe Codebasis',
  'Die Vertonung muss nachproduziert werden',
  'Der Server-Umzug dauert länger als geplant',
  'Feature-Creep: der Director will „nur noch eine Sache“ einbauen',
  'Ein Datenverlust kostet zwei Wochen Arbeit',
  'Die Plattform ändert kurzfristig ihre Richtlinien'
];

function monthEnd(){
  const sc=T().scale;
  const w=stepW();
  const lines=monthLines();let sum=0;lines.forEach(([c,v])=>{v*=w;S.spend[c]=(S.spend[c]||0)+v;sum+=v});S.res.budget-=sum;
  const lt=liveTick(stepMonths(S.round));S.res.budget+=lt.net;S.liveNet=(S.liveNet||0)+lt.net;
  const d=D(),pe={},notes=[];const add=(k,v)=>{pe[k]=(pe[k]||0)+v};
  const acc=(key,v,f)=>{v*=w;S.acc[key]=(S.acc[key]||0)+v;while(S.acc[key]>=1-1e-9){S.acc[key]-=1;f(1)}while(S.acc[key]<=-1+1e-9){S.acc[key]+=1;f(-1)}};
  const tick=(key,v)=>{S.acc[key]=(S.acc[key]||0)+v;const n=Math.floor(S.acc[key]+1e-9);S.acc[key]-=n;return n};

  for(const k in PLAN){
    const P=PLAN[k];let v=P.val[S.plan[k]];
    if(k==='mkt')v*=Math.max(0,1+.25*(d.s.hype-1));
    if(P.key==='skill')acc('skill',v,x=>{
      if(x<0)return;
      const lo=Object.keys(STATS).sort((a,b)=>S.stats[a]-S.stats[b])[0];
      S.stats[lo]+=2;
      notes.push(`Weiterbildung: ${STATS[lo]} +2`);
      if(C.studio.staff.length){
        const st=C.studio.staff[Math.floor(Math.random()*C.studio.staff.length)];
        st.xp=(st.xp||0)+1;
        checkStaffLevelUp(st);
      }
    });
    else acc(k,v,x=>add(P.key,x));
  }

  const artGfx=[0,0.3,0.5,0.8,1.1,1.5][staffLevel('art')]||0;
  const eng=C&&C.studio.engine;
  const engDrag=(S.engine==='eigen'&&eng)?((eng.age||0)>=4?-0.4:(eng.age||0)===3?-0.2:0):0;

  acc('pol_gp',engDrag,x=>add('gp',x));
  acc('pol_gfx',artGfx+engDrag,x=>add('gfx',x));
  acc('pol_snd',.6+(AUDIO_SND[staffLevel('audio')]||0),x=>add('snd',x));
  // Sprint: Kapazität x Verteilung (Schrittlänge ist in sprintDelta schon enthalten, daher ohne x w)
  if(!S.sprint)S.sprint=defaultSprint();
  const sd=sprintDelta(),sApplied={pts:sd.pts,gp:0,gfx:0,snd:0,bugs:0,hype:0};
  const accN=(key,v,f)=>{S.acc[key]=(S.acc[key]||0)+v;while(S.acc[key]>=1-1e-9){S.acc[key]-=1;f(1)}while(S.acc[key]<=-1+1e-9){S.acc[key]+=1;f(-1)}};
  for(const k of ['gp','gfx','snd','bugs','hype'])accN('sp_'+k,sd[k],x=>{add(k,x);sApplied[k]+=x});
  if(sd.moral)add('moral',sd.moral);
  featBuild(sd.feat).forEach(n=>notes.push(n));
  if(crunchOn(S))S.crunchN=(S.crunchN||0)+1;
  S.sprint.crunch=false;
  C.live?.forEach(g=>{g.seasonAt=null}); // season share was applied above; the next step starts clean
  // Hype verfliegt langsam, wenn er hoch ist und nichts nachkommt
  if(S.res.hype>=6)acc('hype_decay',-(S.res.hype-5)*.2,x=>add('hype',x));

  const qaBug=[0,-0.5,-0.8,-1.2,-1.6,-2.2][staffLevel('qalead')]||0;
  const senBug=staffLevel('senior')>=5?-1.0:staffLevel('senior')>=3?-0.5:staffLevel('senior')===2?-0.3:0;
  const engBug=(S.engine==='eigen'&&eng)?((eng.modules.includes('qaauto')?-0.5:0)+(eng.licenseMode==='opensource'?-0.5:eng.licenseMode==='none'?-0.25:0)+(eng.techDebt||0)*0.3):0;

  acc('pbug',-(d.s.polish-1)*.25+(hasF('buggy')?1:0)+qaBug+senBug+engBug+(S.shop.includes('hardware')?-.25:0)+.25*S.plan.outs,x=>add('bugs',x));

  const nDiva3=hasF('diva')?tick('t_diva3',w/3):0;
  for(let i=0;i<nDiva3;i++)add('moral',-1);
  const nPerf=hasF('perfekt')?tick('t_perf4',w/4):0;
  for(let i=0;i<nPerf;i++){add('zeit',-1);add('gp',2);add('gfx',2);add('snd',2)}
  const nLoyDn=S.plan.gehalt===0?tick('t_loy3',w/3):0;
  const nLoyUp=S.plan.gehalt===2?tick('t_loy4',w/4):0;
  const nLowM=S.res.moral<=2?tick('t_lowm2',w/2):0;
  const nDiva4=(hasF('diva')&&!hasP('crunch'))?tick('t_diva4',w/4):0;

  if(C.studio.staff.length){
    C.studio.staff.forEach(st=>{
      const dl=-nLoyDn+nLoyUp-nLowM-nDiva4;
      if(dl)st.loyalty=clamp((st.loyalty||6)+dl,1,10);
    });
    const unhappy=C.studio.staff.find(st=>st.loyalty<=2&&Math.random()<0.35);
    if(unhappy){
      const msg=handleLeadPoach();
      if(msg){notes.push(msg);add('moral',-1)}
    }
  }

  let licInc=0;
  if(eng&&ENGINE_LIC_MODES[eng.licenseMode]?.inc>0){
    const ageMult=getEngineAgeInfo(eng.age||0).licMult;
    const bizMult=staffLevel('bizdev')>=5?1.3:staffLevel('bizdev')>=4?1.2:1;
    licInc=Math.round(ENGINE_LIC_MODES[eng.licenseMode].inc*eng.version*sc*ageMult*bizMult*w*10)/10;
    if(licInc>0){
      S.res.budget+=licInc;
      S.income+=licInc;
    }
  }

  let eaInc=0;
  if(S.ea&&stepFlag('ea')){
    eaInc=Math.round((2+S.res.hype)*1.2*sc*(hasP('ea')?1.5:1)*w*10)/10;
    S.res.budget+=eaInc;S.income+=eaInc;acc('ea_bugs',-1,x=>add('bugs',x));
  }

  const commMult=[1,1.1,1.18,1.25,1.32,1.4][staffLevel('community')]||1;
  const wlg=Math.round(Math.pow(S.res.hype,1.5)*90*T().sales*commMult*(stepFlag('mkt')?1.5:1)*(d.s.hype>=3?1.1:1)*w);
  S.res.wl+=wlg;

  if(!S.algo&&S.res.wl>=10000*T().sales){S.algo=true;add('hype',1);notes.push('Der Store-Algorithmus empfiehlt euch jetzt')}

  // Verzögerungen: Bugs, schlechte Moral, Open World und Outsourcing machen den Zeitplan wackelig
  const delayChance=0.10+Math.max(0,S.res.bugs-8)*0.006+(S.res.moral<=3?0.12:0)+(S.world==='open'?0.05:0)+0.03*S.plan.outs;
  if(Math.random()<1-Math.pow(1-delayChance,w)){add('zeit',-1);notes.push('Verzögerung: '+DELAYS[Math.floor(Math.random()*DELAYS.length)])}
  const cr=resolveCrypto();
  if(cr){notes.push(cr.note);if(cr.moral)add('moral',cr.moral)}
  const pc=apply(pe).filter(([k])=>k!=='note');
  S.res.zeit=Math.round((S.res.zeit-w)*1e6)/1e6;

  // Meilenstein dieses Schritts prüfen (inkl. Publisher-Deal)
  if(!S.msDone)S.msDone=[];
  const msHere=MILESTONES.find(m=>m.at===STEPS[S.round].id&&!S.msDone.includes(m.id));
  if(msHere){
    S.msDone.push(msHere.id);
    S.msResult=msCheck(msHere.id);
    notes.push(...applyMsOutcome(S.msResult));
  }

  S.prevRound=S.round;S.round=nextStep(S.round);
  S.month={sum,pc,sprint:sApplied,n:S.round,done:S.prevRound,ea:eaInc,lic:licInc,wl:wlg,notes,live:lt.net};
  notes.push(...lt.notes);
  addLog(`<span>${stepTag(lastStep())}</span> Abschluss „${STEPS[lastStep()].n}“: ${money(sum)} Kosten${eaInc?`, ${money(eaInc,true)} Early Access`:''}${licInc?`, ${money(licInc,true)} Engine-Lizenzen`:''}${lt.net?`, 📡 Live-Betrieb ${money(lt.net,true)}`:''}, +${nf(wlg,0)} Wishlists${pc.length?', '+pc.map(([k,v])=>fmt(v)+' '+({moral:'Moral',hype:'Hype',feat:'🧩 Feature-Punkte',qual:'Qualität',gp:'Gameplay',gfx:'Grafik',snd:'Sound',bugs:'Bugs',zeit:'Zeit'}[k]||k)).join(', '):''}${notes.length?' · '+notes.join(' · '):''}`);
  if(S.res.budget<0){openCrisis('month');return}
  afterMonth();
}

function closeMilestone(){
  if(S.fund&&(S.fund.renego||S.fund.cutPending))return;
  S.msResult=null;
  afterMonth();
}

function afterMonth(){
  if(S.res.moral<=0){gameOver('moral');return}
  if(S.msResult){S.screen='milestone';render();save();return}
  if(S.round>=STEPS.length){S.screen='launch';render();save();return}

  // Chance auf eine Legendäre Zufallsbegegnung (Priorität auf noch nicht freigeschaltete Legenden!)
  if(!S.seenLegends)S.seenLegends=[];
  const legCandidates=LEGEND_KEYS.filter(k=>{
    if(C&&C.dir&&C.dir.id===k)return false;
    if(S.seenLegends.includes(k))return false;
    if(C&&C.studio.staff.some(st=>st.legendId===k))return false;
    return true;
  });
  const lockedCandidates=legCandidates.filter(k=>!isCharUnlocked(k));
  const poolToUse=lockedCandidates.length?lockedCandidates:legCandidates;
  // Seltene Begegnung: nur zu Beginn einer Phase (alle 2 Monate), 15 % Chance, höchstens eine pro Projekt
  // Begegnungen erst, wenn mindestens eine Legende über einen Meilenstein freigeschaltet ist
  const phaseStart=S.round<STEPS.length&&STEPS[S.round].ph!==STEPS[lastStep()]?.ph;
  if(poolToUse.length&&phaseStart&&getUnlockedChars().length&&S.seenLegends.length===0&&Math.random()<0.15){
    const legKey=poolToUse[Math.floor(Math.random()*poolToUse.length)];
    S.seenLegends.push(legKey);
    S.curLegend=legKey;
    S.screen='legend';
    addLog(`<span>${stepTag(lastStep())}</span> 🌟 Legendäre Begegnung: ${DIRS[legKey].n} (${DIRS[legKey].tag}) schaut im Studio vorbei!`);
    render();save();return;
  }

  // Live-Betrieb: Season fällig (höchstens ein Screen pro Schritt)
  if(seasonDue()&&openSeason())return;

  // Game-Dev-Messe: höchstens einmal pro Projekt, nicht im ersten und letzten Schritt
  if(fairDue()&&startFair())return;

  // Überraschungs-Stream: einmal pro Projekt, ab First Playable
  if(streamDue()&&startStream())return;

  // Feature Creep: höchstens einmal pro Projekt, in der Produktion
  if(creepDue()&&startCreep())return;

  // Kritische Recherche: einmal pro Projekt
  if(probeDue()&&startProbe())return;

  // Interview: ab Monat 3, 20 % pro Monat, höchstens zwei pro Projekt
  if(ivAvail()&&S.round>=2&&(S.ivCount||0)<2&&Math.random()<0.2&&startInterview())return;

  const ph=curCP();
  const fpool=R.map((r,i)=>i).filter(i=>R[i].flaw&&i!==S.rnd&&fits(R[i]));
  const pool=R.map((r,i)=>i).filter(i=>!R[i].flaw&&!S.usedR.includes(i)&&(R[i].min||0)<=ph&&fits(R[i]));
  let pick=null;
  if(fpool.length&&Math.random()<.3)pick=fpool[Math.floor(Math.random()*fpool.length)];
  else if(pool.length&&Math.random()<.48)pick=pool[Math.floor(Math.random()*pool.length)];
  if(pick!==null){
    S.usedR.push(pick);S.rnd=pick;S.rndCh=null;
    if(R[pick].eff){S.rndCh=apply(R[pick].eff);addLog(`<span>${stepTag(lastStep())}</span> Zufall: ${R[pick].t}`)}
    S.screen='random';render();save();return;
  }
  goMonth();
}

/* ===================== Textvarianten ===================== */
// Pro Durchlauf stabile Auswahl einer Textvariante (TEXT_VARIANTS aus content-extra.js)
function vx(c){
  const vars=typeof TEXT_VARIANTS!=='undefined'&&TEXT_VARIANTS[c.t];
  if(!vars||!vars.length||!S)return c.x;
  let h=S.seed||0;for(const ch of c.t)h=(h*31+ch.charCodeAt(0))|0;
  const i=Math.abs(h)%(vars.length+1);
  return i?vars[i-1]:c.x;
}
function fillTxt(s){
  return String(s||'').replace(/\{title\}/g,S?.title||'euer Spiel').replace(/\{studio\}/g,C?.studio?.name||'euer Studio')
    .replace(/\{dir\}/g,C?.dir?.n||'der Director').replace(/\{genre\}/g,S?(subGenreOf(S.genre,S.subGenre)?.n||GENRES[S.genre]?.n):'Spiel');
}

/* ===================== Interviews ===================== */
const ivAvail=()=>typeof INTERVIEW_QS!=='undefined'&&INTERVIEW_QS.length>0;
function ivChance(a){
  const o=INTERVIEW_OUTLETS[S.iv.o];
  return clamp(a.p+(D().s.hype-1)*6+(o.bias[a.tone]||0)+(S.res.hype>=6?5:0)-(S.res.bugs>=20?5:0)+(S.iv.j&&JOURNALISTS[S.iv.j]&&a.tone===JOURNALISTS[S.iv.j].tone?PRESS.toneHit:0),5,95);
}
function startInterview(){
  S.ivUsed=S.ivUsed||[];
  const pool=INTERVIEW_QS.map((q,i)=>i).filter(i=>!S.ivUsed.includes(i)&&(!INTERVIEW_QS[i].cond||INTERVIEW_QS[i].cond(S)));
  if(pool.length<3)return false;
  pool.sort(()=>Math.random()-.5);
  const qs=pool.slice(0,3);
  S.ivUsed.push(...qs);
  S.ivCount=(S.ivCount||0)+1;
  S.iv={o:Math.floor(Math.random()*INTERVIEW_OUTLETS.length),qs,i:0,res:[],j:JOUR_KEYS[Math.floor(Math.random()*JOUR_KEYS.length)]};
  S.screen='interview';
  addLog(`<span>${stepTag(lastStep())}</span> 🎙️ Interview: ${INTERVIEW_OUTLETS[S.iv.o].n} (${INTERVIEW_OUTLETS[S.iv.o].k})`);
  render();save();
  return true;
}
function answerInterview(ai){
  if(!S||!S.iv||S.iv.i>=S.iv.qs.length)return;
  const qi=S.iv.qs[S.iv.i],q=INTERVIEW_QS[qi],a=q.a[ai];
  if(!a)return;
  const pct=ivChance(a),r=d100(),ok=r<=pct;
  const ch=apply(ok?a.s:a.f);
  S.iv.res.push({qi,ai,ok,r,pct,ch});
  S.iv.i++;
  addLog(`<span>${stepTag(lastStep())}</span> Interview-Antwort „${esc(fillTxt(a.l))}“ (${IV_TONES[a.tone]||a.tone}, ${pct} %) · W100 ${r} → ${ok?'kommt gut an':'geht nach hinten los'}`);
  render();save();
}
function finishInterview(){
  if(!S)return;
  if(S.iv&&S.iv.j)revealJour(S.iv.j,'tone');
  S.iv=null;
  afterRandom();
}

function chooseLegendAction(mode){
  if(rolling||!S||!S.curLegend)return;
  const legKey=S.curLegend;
  const leg=DIRS[legKey];
  if(!leg)return;
  const role=leg.leadRole||'senior';
  const hireCost=legendHireCost();

  if(mode==='hire'){
    if(S.res.budget<hireCost)return;
    S.res.budget-=hireCost;
    S.spend.invest=(S.spend.invest||0)+hireCost;
    const ch=[['budget',-hireCost],...apply(leg.encEff||{})];
    const existing=getStaff(role);
    if(existing){
      existing.personName=leg.n;
      existing.level=Math.min(5,Math.max(2,(existing.level||1)+1));
      existing.xp=STAFF_XP_THRESH[existing.level-1]||2;
      existing.loyalty=clamp((existing.loyalty||7)+2,1,10);
      existing.img=leg.img;
      existing.isScene=!!leg.isScene;
      existing.isLegend=true;
      existing.legendId=legKey;
    }else{
      C.studio.staff.push({
        id:role,
        personName:leg.n,
        level:2,
        xp:2,
        sal:STAFF[role].sal,
        loyalty:8,
        tenure:0,
        img:leg.img,
        isScene:!!leg.isScene,
        isLegend:true,
        legendId:legKey
      });
    }
    const newly=unlockChar(legKey);
    const pre=[['note',`🌟 ${leg.n} verstärkt euch als ${STAFF[role].n} (Stufe 2)!`]];
    if(newly)pre.push(['note',`🔓 Dauerhaft freigeschaltet: ${leg.n} ist ab sofort auch bei Spielstart als Game Director wählbar!`]);
    S.last={
      kind:'legend',
      ev:legKey,
      safe:true,
      ch,
      pre,
      l:`${leg.n} als Star-Lead verpflichtet`,
      txt:`${leg.n} (${leg.tag}) unterschreibt bei ${C.studio.name}, krempelt sofort die Ärmel hoch und steht euch ab jetzt dauerhaft in der Legenden-Auswahl zur Verfügung!`
    };
    addLog(`<span>${stepTag(lastStep())}</span> 🌟 ${leg.n} (${leg.tag}) als Star-Lead eingestellt & dauerhaft freigeschaltet!`);
    S.screen='result';
    render();save();
    return;
  }

  if(mode==='collab'){
    startRoll({kind:'legend',ev:legKey,adv:false});
    return;
  }

  // mode === 'pass'
  const ch=apply(leg.encPassEff||{moral:1});
  S.last={
    kind:'legend',
    ev:legKey,
    safe:true,
    ch,
    pre:[],
    l:leg.encPassLabel||'Autogramm & Kaffeepause',
    txt:`Ihr entscheidet euch für euren eigenen Weg im Gespräch mit ${leg.n}. Das Team zieht motiviert mit, und vielleicht kreuzen sich eure Wege bald wieder.`
  };
  addLog(`<span>${stepTag(lastStep())}</span> Kaffeepause mit ${leg.n} (+1 Moral)`);
  S.screen='result';
  render();save();
}

/* ===================== Game-Dev-Messe ===================== */
function fairDue(){return !!S&&!S.fairSeen&&S.round>=2&&S.round<STEPS.length-1&&Math.random()<FAIR.chance}
function fairPool(){
  return LEGEND_KEYS.filter(k=>!(C&&C.dir&&C.dir.id===k)&&!(C&&C.studio.staff.some(st=>st.legendId===k))&&k!==S.curLegend);
}
function startFair(){
  const pool=fairPool();if(!pool.length)return false;
  const k=pool[Math.floor(Math.random()*pool.length)];
  S.fair=k;S.fairSeen=true;S.screen='fair';
  addLog(`<span>${stepTag(lastStep())}</span> 🎪 Game-Dev-Messe: ${DIRS[k].n} gibt euch einen Tipp`);
  render();save();return true;
}
function fairCard(k){
  const leg=DIRS[k]||{n:'Eine Legende',tag:'',leadRole:'senior'};
  const role=leg.leadRole||'senior',tip=FAIR_TIPS[role]||FAIR_TIPS.senior;
  return {t:`Game-Dev-Messe: ${leg.n}`,
    x:`Auf der Entwicklermesse bleibt ${leg.n} (${leg.tag}) an eurem Stand stehen, spielt fünf Minuten eure Demo und sagt: „${tip.q}“`,
    o:[{l:'Den Tipp umsetzen',st:STAFF[role]?.stat||'design',dc:FAIR.dc,s:tip.s,f:tip.f,sx:tip.sx,fx:tip.fx},
       {l:'Höflich danken und weiterziehen',safe:{},sx:'Ihr bedankt euch, holt ein Autogramm und bleibt bei eurem Plan.'}]};
}
function afterRandom(){if(S.res.budget<0){openCrisis('rand');return}if(S.res.moral<=0){gameOver('moral');return}goMonth()}
function openCrisis(from){if(S.res.budget<0)S.crisisSeen=true;S.crisisFrom=from;S.prevScreen=S.screen;S.early=S.res.budget>=0;S.crisisMsg=null;S.screen='crisis';render();save()}
function leaveCrisis(){if(S.crisisFrom==='month')afterMonth();else if(S.crisisFrom==='rand')goMonth();else{S.screen=S.prevScreen==='crisis'?'event':(S.prevScreen||'event');render();save()}}

function gameOver(reason){
  S.over=reason;S.screen='over';
  if(!S.overDone){
    S.overDone=true;
    C.hall.push({nr:C.hall.length+1,title:S.title,genre:genreName(S),gk:S.genre,sk:S.subGenre,tier:T().n,meta:null,units:0,erg:null,v:reason==='moral'?'Team gekündigt':'Insolvenz'});
    C.dir.fame=Math.max(0,C.dir.fame-10);
    C.studio.fame=0;C.studio.kasse=-1;
  }
  render();save();
}

/* ===================== Notlage ===================== */
function rescueAvail(r){return !S.rescued.includes(r.id)&&(!r.tiers||r.tiers.includes(S.tier))&&(!r.avail||r.avail())}
function rescueChoose(id){
  if(rolling)return;
  const r=RESC.find(x=>x.id===id);
  S.rescued.push(id);
  if(!r.st){
    const x=rescueDo(id,true);
    S.crisisMsg={n:r.n,ch:x.ch,txt:x.txt};
    addLog(`<span>Notlage</span> ${r.n}`);
    render();save();return;
  }
  startRoll({kind:'rescue',ev:id,adv:false});
}

function rescueDo(id,ok){
  const sc=T().scale;
  const need=Math.max(0,-S.res.budget)+2*monthSum();
  const ch=[];let txt='';
  const gain=a=>{a=Math.round(a*10)/10;S.res.budget+=a;ch.push(['budget',a]);return a};
  if(id==='privat'){const a=Math.min(C.dir.wealth,need);C.dir.wealth-=a;S.einlage+=gain(a);txt='Der Director überweist aus eigener Tasche.'}
  else if(id==='downsize'){
    C.studio.salaryDrift=Math.round((C.studio.salaryDrift||0)*50)/100;
    C.studio.overheadDrift=Math.round((C.studio.overheadDrift||0)*5)/10;
    C.studio.fame=Math.max(0,C.studio.fame-5);
    ch.push(...apply({moral:-2}),['note','Verwaltung & Gehaltsspirale halbiert (−5 Studio-Fame)']);
    txt='Ihr zieht in kleinere Räume und streicht teure Extras.';
  }
  else if(id==='layoff'){
    S.layoff=true;
    C.studio.staff.forEach(st=>{st.loyalty=clamp((st.loyalty||6)-2,1,10)});
    ch.push(...apply({moral:-3}),['note','Loyalität aller Leads −2']);
    txt='Schwere Gespräche. Die Gehälter sinken dauerhaft um 30 %.';
  }
  else if(id==='ea'){S.ea=true;S.eaPenalty=3;const a=gain((2+S.res.hype)*3*sc);S.income+=a;txt='Die Beta ist ab sofort käuflich.'}
  else if(ok){
    if(id==='publisher'){const a=gain(need);S.recoup+=a;S.publisher=true;S.pubExtra+=.1;if(S.ip==='neu'){S.ipLost=true;txt='Die Rechte an eurer neuen Welt gehören jetzt dem Publisher.'}}
    else if(id==='kredit'){const a=gain(need);S.loan+=a}
    else if(id==='investor'){const a=gain(need);S.investIn+=a;S.equity+=.25}
    else if(id==='crowd'){const a=gain(need);S.income+=a}
    else if(id==='haus'){const a=gain(need);S.einlage+=a;ch.push(...apply({moral:2}))}
  }else if(id==='haus'){S.over='haus'}
  return {ch,txt};
}

/* ===================== Shop & Personal ===================== */
function buy(id){
  if(rolling)return;
  const it=SHOP.find(x=>x.id===id);
  const cost=shopCost(it);
  if(S.shop.includes(id)||S.res.budget<cost)return;
  S.res.budget-=cost;S.spend.invest=(S.spend.invest||0)+cost;S.shop.push(id);
  addLog(`<span>${stepTag()}</span> Shop: ${it.n} für ${money(cost)}`);
  if(it.id==='reise')C.studio.staff.forEach(st=>{st.loyalty=clamp((st.loyalty||6)+1,1,10)});
  if(it.id==='refactoring'&&C.studio.engine){
    C.studio.engine.techDebt=0;
    C.studio.engine.age=Math.max(0,(C.studio.engine.age||0)-1);
  }
  if(it.st){startRoll({kind:'shop',ev:id,adv:false});return}
  const ch=apply(it.eff);
  S.shopMsg={n:it.n,ch:[['budget',-cost],...ch],txt:it.sx};
  render();save();
}

function hire(id){
  if(rolling)return;
  const fee=hireFee();
  // Neue Leads nur im ersten Entwicklungsmonat (Legenden kommen über Begegnungen dazu)
  if(!stepFlag('hire')||S.res.budget<fee||hasStaff(id))return;
  S.res.budget-=fee;S.spend.invest=(S.spend.invest||0)+fee;
  startRoll({kind:'hire',ev:id,adv:false});
}

function fire(id){
  const st=getStaff(id);if(!st)return;
  C.studio.staff=C.studio.staff.filter(x=>x.id!==id);
  const ch=apply({moral:-1});
  S.shopMsg={n:`${st.personName} (${STAFF[id].n}) entlassen`,ch,txt:'Das Team ist geschockt.'};
  render();save();
}

function privatZuschuss(){
  const a=Math.min(C.dir.wealth,Math.max(3*monthSum(),-S.res.budget+2*monthSum()));
  if(a<=0)return;
  C.dir.wealth-=a;S.res.budget+=a;S.einlage+=a;
  addLog(`<span>Director</span> schießt ${money(a)} Privatgeld zu`);
  render();save();
}

/* ===================== Fähigkeiten ===================== */
// Sofort-Effekte der Director-Fähigkeiten (reroll und works haben eigene Logik)
const ABIL_EFF={
  cash:{budget:40,hype:1,zeit:-1},
  rewrite:{bugs:-8,gfx:5},
  promi:{hype:3,wl:3},
  tiefe:{gp:10,gfx:3},
  ankuend:{hype:4,promise:1,wl:4},
  tisch:{gp:10,gfx:6,zeit:-2},
  fans:{budget:30,hype:1},
  community:{moral:3,bugs:-3},
  works:{},
  shred:{gp:7,hype:3,bugs:2},
  sim:{gp:9,gfx:2},
  sale:{budget:35,wl:5},
  excel:{gp:8,bugs:-4},
  vent:{gp:9,bugs:-3},
  noir:{gp:7,gfx:5},
  insult:{gp:8,moral:2},
  fairytale:{gp:7,gfx:4,hype:1},
  occult:{gp:8,gfx:4},
  chaos:{gp:6,gfx:5,hype:2},
  kolonie:{gp:8,moral:2},
  monopol:{budget:45,wl:3,bugs:2},
  minimal:{gfx:9,hype:3,moral:-1},
  kernel:{bugs:-10,gfx:4,moral:-1},
  telemetry:{budget:40,bugs:-3,hype:-1},
  pagerank:{wl:6,hype:2},
  overture:{snd:10,gp:2,hype:1},
  whale:{budget:45,hype:-2},
  wusel:{gp:7,zeit:1},
  margin:{budget:50,moral:-2},
  sidchip:{snd:9,bugs:-2},
  kindly:{gp:9,hype:2,zeit:-1},
  tank:{gp:8,snd:3,hype:2},
  solo:{bugs:-7,gp:4,snd:3,gfx:3},
  firstcontact:{gp:6,bugs:-5,hype:1},
  djent:{snd:10,hype:3,moral:-1}
};
function abilityReady(){
  if(!S||!C||!D().ab||S.abUsed)return false;
  if(D().ab==='reroll')return S.screen==='result'&&S.last&&!S.last.safe&&!S.last.ok&&S.last.kind!=='renego';
  return ['event','launch','mand'].includes(S.screen);
}
function useAbility(){
  if(rolling||!abilityReady())return;
  const id=D().ab;
  if(id==='reroll'){
    const L=S.last;unapply(L.ch);
    if(L.kind==='rescue'){S.over=null;S.rescued=S.rescued.filter(x=>x!==L.ev);S.rescued.push(L.ev)}
    if(L.kind==='creep')creepUndo(L.ev);
    if(L.kind==='hunt'){S.hunt.runs++;S.hunt.done=false}
    S.abUsed=true;
    addLog(`<span>Director</span> ${ABIL[id].n}: Wurf wird wiederholt`);
    startRoll({kind:L.kind,ev:L.ev,oi:L.oi,adv:L.adv});
    return;
  }
  if(id==='works')S.works=true;
  if(id==='noir')S.insp=Math.min(3,S.insp+1);
  const M=ABIL_EFF[id]||{gp:6};
  S.abUsed=true;apply(M);
  addLog(`<span>Director</span> Fähigkeit ${ABIL[id].n} eingesetzt`);
  render();save();
}

/* ===================== Faktoren & Release (W100 + GOTY-Awards) ===================== */
function marketFactor(sel,assumeChina){
  sel=sel||S.langs||{en:2,de:1,fr:1,es:1};let sum=0;
  for(const k in sel){
    const lv=sel[k];if(!lv)continue;
    let w=LANGS[k].m*(lv===2?1.1:1);
    if(k==='de'&&lv===2&&S.cast==='synchro')w*=1.3;
    if(k==='zh'){if(!assumeChina&&S.china!=='ok')continue;w*=.5}
    sum+=w;
  }
  return sum/.68;
}
function langCost(sel){let c=0;for(const k in sel){if(k==='en'||!sel[k])continue;c+=sel[k]===2?8:3;if(k==='zh')c+=5}return c*T().scale}
function platFactor(){const mob=!!subGenreOf(S.genre,S.subGenre)?.mobile;return {pc:mob?.6:1,konsole:mob?1.3:1.7,exklusiv:1.05,alle:mob?2.6:1.9}[S.plat]||1}
function ageFactor(){return ({0:1.1,6:1.1,12:1.05,16:1,18:.85}[S.age]??1)*(S.lootbox?.92:1)}
function licFactor(){return {auto:1.25,liga:1.4,ttrpg:1.2,musik:1.05}[S.lic]||1}
function ipSales(){return S.seq?1.3+(S.seq.meta-70)/100:IPS[S.ip].sales}

// Kritikerwertung für einen W100-Wurf r (r=50 → Prognose)
function reviewScore(r,certPen=0){
  recalcQual();
  const pr=S.model==='f2p'?0:[2,0,-1][S.price??1];
  const qaRevBonus=staffLevel('qalead')>=5?3:staffLevel('qalead')===4?2:staffLevel('qalead')===3?1:0;
  const rtBonus=(S.engine==='eigen'&&C.studio.engine?.modules.includes('raytracing'))?2:0;
  const engAgeRev=(S.engine==='eigen'&&C.studio.engine)?getEngineAgeInfo(S.engAgeAtStart||0).rev:0;
  const extraRevBonus=(S.extras||[]).reduce((acc,ek)=>acc+(PROJECT_EXTRAS[ek]?.reviewBonus||0),0);
  return clamp(Math.round(S.res.qual*.75+25-(S.works?0:S.res.bugs)*1.2+(r-50)*.16+T().review+IPS[S.ip].review+engAgeRev+rtBonus+extraRevBonus-(S.ea?(S.eaPenalty||2):0)+(hasP('kritik')?4:0)+qaRevBonus-2*S.promises+(S.shop.includes('a11y')?2:0)+pr-Math.floor(C.dir.fame/40)-rookiePenalty()+uspRev(S)+audRev(S)+featRev(S)-certPen),15,98);
}
// Prognose während der Entwicklung: Wertung bei mittlerem Wurf, inkl. absehbarem Verzug
function reviewForecast(){
  if(!S||!S.res)return null;
  const b=S.res.bugs,late=S.res.zeit<0?Math.round(-S.res.zeit*3):0;
  S.res.bugs=b+late;
  const v=reviewScore(50);
  S.res.bugs=b;
  return v;
}

/* ===================== Metakritik: Einzelkritiken & Nutzerwertung ===================== */
function metaLabel(v){return v>=90?'Universeller Beifall':v>=75?'Überwiegend positiv':v>=50?'Gemischt':v>=20?'Überwiegend negativ':'Vernichtend'}
function metaCls(v){return v>=75?'mc-g':v>=50?'mc-y':'mc-r'}
function userCls(v){return v>=7.5?'mc-g':v>=5?'mc-y':'mc-r'}
function buildMetaReviews(meta){
  const r=S.res,q=r.qual||meta;
  const dims={gp:r.gp,gfx:r.gfx,snd:r.snd??q};
  const jours=[...JOUR_KEYS].sort(()=>Math.random()-.5).slice(0,PRESS.reviewN);
  const taken=jours.map(id=>JOURNALISTS[id].outlet);
  const pool=[...OUTLETS.filter(o=>!taken.includes(o.n)).sort(()=>Math.random()-.5).slice(0,7-jours.length),
    ...jours.map(id=>{const J=JOURNALISTS[id];return {n:J.outlet,f:J.f,b:OUTLETS.find(o=>o.n===J.outlet)?.b||0,j:id}})].sort(()=>Math.random()-.5);
  let list=pool.map(o=>({n:o.n,f:o.f,j:o.j,v:meta+o.b+(dims[o.f]-q)*.35+(Math.random()*12-6)}));
  const shift=meta-list.reduce((a,c)=>a+c.v,0)/list.length;
  list=list.map(c=>{
    const v=clamp(Math.round(c.v+shift+(c.j?jourLikes(c.j)*PRESS.prefShift:0)),10,100);
    const band=v>=85?3:v>=70?2:v>=50?1:0;
    const hi=dims[c.f]>=60,good=band>=2;
    const pool=REVIEW_QUOTES[c.f][hi?'hi':'lo'];
    const join=hi===good?' ':hi?' Unterm Strich aber: ':' Trotzdem: ';
    const e={n:c.n,v,q:pool[Math.floor(Math.random()*pool.length)]+join+REVIEW_VERDICT[band][Math.floor(Math.random()*REVIEW_VERDICT[band].length)]};
    if(c.j)e.j=c.j;
    return e;
  }).sort((a,b)=>b.v-a.v);
  const metascore=Math.round(list.reduce((a,c)=>a+c.v,0)/list.length);
  // Nutzerwertung: Spieler strafen Bugs, Lootboxen und enttäuschten Hype härter ab als die Presse
  const bugs=S.works?0:r.bugs;
  const overhype=Math.max(0,r.hype*10-meta);
  let user=meta/10-bugs*.05-overhype*.03+(S.mods?.3:0)-(S.lootbox?.8:0)-(S.model!=='f2p'&&S.price===2?.3:0)+((r.snd??0)>=70?.2:0)+(Math.random()*.8-.4);
  user=Math.round(clamp(user,.5,9.7)*10)/10;
  const notes=[];
  if(overhype>=15)notes.push('Enttäuschte Erwartungen: Der Hype war größer als das Spiel.');
  if(bugs>=15)notes.push('Bug-Videos dominieren die Nutzerkritiken.');
  if(S.lootbox)notes.push('Lootboxen sorgen für Review-Bombing.');
  if(user*10>=meta+8)notes.push('Die Spieler mögen das Spiel mehr als die Presse.');
  return {metascore,critics:list,user,notes};
}
function revealCritics(critics){(critics||[]).forEach(c=>{if(c.j)revealJour(c.j,'pref')})}
const userSalesMult=u=>.94+(u??5)*.012;

function launch(){
  if(rolling)return;
  const r=d100();
  animate([r],()=>{
    let late='';
    if(S.res.zeit<0){
      const z=Math.round(-S.res.zeit*1e6)/1e6,zm=Math.max(1,Math.round(z*refMonths(S.tier)/12));
      S.res.bugs=Math.round(S.res.bugs+z*3);
      S.res.hype=clamp(Math.round(S.res.hype-z),0,10);
      late=`Ihr wart ${zm} Monat${zm>1?'e':''} zu spät dran. Das hat Bugs und Hype gekostet. `;
    }
    // Fail-State: zu viele Bugs → Plattform-Zertifizierung fällt durch
    let certPen=0;
    if(!S.works&&certPenalty(S)>0){
      certPen=certPenalty(S);
      S.res.hype=clamp(S.res.hype-2,0,10);
      late+=`Die Plattform-Zertifizierung ist durchgefallen: Notfall-Patches, verschobene Konsolenfassung und Spott in den Foren (−${certPen} Wertung, −2 Hype). `;
    }
    recalcQual();
    const engAgeRev=(S.engine==='eigen'&&C.studio.engine)?getEngineAgeInfo(S.engAgeAtStart||0).rev:0;
    if(engAgeRev<0){
      late+=`Die Tester bemängeln die angestaubte Technik eurer Engine (${fmt(engAgeRev)} Wertung). `;
    }
    const mc=buildMetaReviews(reviewScore(r,certPen));
    const meta=mc.metascore;
    if(rookiePenalty()>0)late+=`Die Presse kennt euch kaum und bewertet streng (Newcomer-Skepsis −${rookiePenalty()}). `;
    const rivalGames=simulateRivalReleases();
    // GOTY-Awards Auswertung gegen die Konkurrenz!
    const awards=[['Spiel des Jahres (GOTY)','meta',meta],['Bestes Gameplay','gp',S.res.gp],['Beste Grafik & Technik','gfx',S.res.gfx]].map(([cat,k,own])=>{
      const best=rivalGames.reduce((a,b)=>b[k]>a[k]?b:a);
      const won=own>=75&&own>=best[k];
      return {cat,won,winner:won?S.title:best.studio,score:won?own:best[k]};
    });
    C.lastAwards=awards;

    S.end={r,meta,gp:S.res.gp,gfx:S.res.gfx,snd:S.res.snd,late,rivalGames,awards,critics:mc.critics,user:mc.user,mcNotes:mc.notes,qb:qualBreakdown()};
    revealCritics(S.end.critics);
    S.screen='sales';
    const won=wonAwardNames(S.end);
    addLog(`<span>Release</span> Review-Wurf W100 ${r} → Metascore ${meta}, Nutzer ${nf(mc.user)} (GP ${S.res.gp} · GFX ${S.res.gfx} · Sound ${S.res.snd})${won.length?' · 🏆 '+won.join(', '):''}`);
    render();save();
  },true);
}

function sales(){
  if(rolling)return;
  const r=d100();
  animate([r],()=>{
    const t=T(),e=S.end,pi=S.price??1,price=t.prices[pi];
    const b=S.res.hype*2;
    const roll20=Math.max(2,Math.round((r+b)/5));
    // Wertung wirkt spürbar, aber nicht mehr kubisch (Wertung 40 vs. 80: ×4,6 statt ×8)
    const organic=Math.pow(e.meta/10,2.2)*4.7*(S.res.hype+2)*(roll20+5)*.45*t.sales;
    const conv=clamp(.07+(e.meta-50)/400+[.06,.03,0][pi],.03,.4);
    const uMult=userSalesMult(e.user);
    const trendMult=S.trendHot?1.15:S.trendCold?0.90:1;
    const awardMult=1+wonAwardNames(e).length*0.08;
    const exList=S.extras||[];
    const sportFit=S.genre==='sports';
    const extraSalesMult=modSales(S.gmod,S.model)*(exList.includes('sportLic')?(sportFit?1.25:1.10):1)
      *(exList.includes('coopMode')?1.15:1)
      *(exList.includes('crossplay')?1.10:1)
      *(exList.includes('collectors')?(S.model!=='f2p'?1.15:1.05):1)
      *(exList.includes('antiCheat')?1.10:1);
    const mult=uMult*marketFactor()*platFactor()*ageFactor()*licFactor()*ipSales()*trendMult*awardMult*extraSalesMult*(S.mods?(S.model==='f2p'?1.15:1.25):1)*(S.ea?.85:1)*(S.shop.includes('awards')&&e.meta>=80?1.1:1)*audSales(S);
    let units=Math.round((organic*[1.5,1,.7][pi]+S.res.wl*conv)*mult);
    let rev=0,detail=[];
    detail.push(['Wishlists beim Release',nf(S.res.wl,0)+' ('+nf(conv*100,0)+' % kaufen sofort)']);
    if(S.model==='kauf'||S.model==='live'){
      const mr=modelRevenue(units,price);
      units=mr.units;rev=mr.rev;e.units=units;detail.push(...mr.detail);
    }else{
      const players=Math.round(units*14*(.5+S.res.hype/10)),rate=clamp(4+S.payers,1,12);
      rev=players*(rate/100)*45*.7/1000;e.units=players;
      detail.push(['Spieler im ersten Jahr',nf(players,0)],['Davon zahlend',rate+' %'],['Shop-Umsatz netto',money(rev)]);
    }
    const mods=[];
    if(e.user!=null)mods.push('Nutzerwertung ×'+nf(uMult,2));
    if(S.langs)mods.push('Sprachen ×'+nf(marketFactor(),2));
    if(S.plat)mods.push('Plattformen ×'+nf(platFactor(),2));
    if(S.lic&&S.lic!=='none')mods.push('Lizenzen ×'+nf(licFactor(),2));
    if(extraSalesMult>1.001)mods.push('Projekt-Extras ×'+nf(extraSalesMult,2));
    if(S.age!=null)mods.push('USK '+S.age+' ×'+nf(ageFactor(),2));
    if(S.trendHot)mods.push('Boom-Genre ×1,15');
    if(modSales(S.gmod,S.model)!==1)mods.push(GENRE_MODS[S.gmod].n+' ×'+nf(modSales(S.gmod,S.model),2));
    if(S.trendCold)mods.push('Übersättigt ×0,90');
    if(wonAwardNames(e).length)mods.push(`Awards ×${nf(awardMult,2)}`);
    if(mods.length)detail.push(['Marktfaktoren',mods.join(' · ')]);
    if(S.china==='ok')detail.push(['China','zugelassen, Partner bekommt die Hälfte']);
    else if(S.china==='fail')detail.push(['China','keine Zulassung im ersten Jahr']);

    const ded=[];
    const cut=IPS[S.ip].cut+(S.lic==='liga'?.1:S.lic==='ttrpg'?.08:0);
    if(cut)ded.push([`Lizenzabgaben (${Math.round(cut*100)} %)`,-rev*cut]);
    if(S.engine==='surreal'&&rev>1000)ded.push(['Surreal-Engine-Gebühr (5 % über 1 Mio €)',-(rev-1000)*.05]);
    let net=rev+ded.reduce((a,[,v])=>a+v,0);

    if(S.publisher){
      const bizSave=staffLevel('bizdev')>=5?0.08:staffLevel('bizdev')>=3?0.05:staffLevel('bizdev')===2?0.03:0;
      const ps=Math.max(0.15,.3+S.pubExtra-bizSave);
      const pv=net*ps;
      ded.push([`Publisher-Anteil (${Math.round(ps*100)} %)`,-pv]);
      net-=pv;
      const rc=Math.min(S.recoup,Math.max(0,net));
      if(rc>0){ded.push(['Recoup: Vorschüsse werden verrechnet',-rc]);net-=rc}
    }

    const bizMerchMult=staffLevel('bizdev')>=5?1.3:staffLevel('bizdev')>=4?1.2:1;
    e.merch=S.shop.includes('merch')?Math.round((e.meta>=75?30:3)*t.scale*bizMerchMult):0;

    e.engRoyalty=0;
    if(C.studio.engine&&C.studio.engine.licenseMode==='royalty'){
      const ageMult=getEngineAgeInfo(C.studio.engine.age||0).licMult;
      e.engRoyalty=Math.round((8+(r/5)*1.5)*C.studio.engine.version*t.scale*ageMult*bizMerchMult);
    }

    e.sr=r;e.sb=b;e.rev=rev;e.detail=detail;e.ded=ded;e.net=net;
    finishGame();
  },true);
}

/* ===================== Legenden-Meilensteine ===================== */
// Erste Legende beim ersten Top-Erfolg, eine weitere beim ersten AA/AAA-Release
function unlockRandomLegend(){
  const pool=LEGEND_KEYS.filter(k=>!isCharUnlocked(k)&&C.dir.id!==k);
  if(!pool.length)return null;
  const k=pool[Math.floor(Math.random()*pool.length)];
  unlockChar(k);
  return k;
}

function legendMilestones(e){
  if(!C.legendMs)C.legendMs={};
  const notes=[];
  const grant=(key,why)=>{
    if(C.legendMs[key])return;
    C.legendMs[key]=true;
    const k=unlockRandomLegend();
    if(!k)return;
    notes.push(`${why}: ${DIRS[k].n} (${DIRS[k].tag}) ist freigeschaltet und ab sofort im Legenden-Album. In einer neuen Karriere könnt ihr sie als Game Director wählen.`);
    addLog(`🔓 Legende freigeschaltet: ${DIRS[k].n}`);
  };
  if(e.meta>=80||e.ratio>=1)grant('top','Top-Erfolg');
  if(S.tier!=='indie')grant('aa',`Erstes ${TIERS[S.tier].n}-Projekt veröffentlicht`);
  return notes;
}

function advanceCalendar(months){C.months=(C.months||0)+months}
function careerYear(){return Math.floor((C.months||0)/12)+1}
function applyEngineAging(e){
  const ageStep=S.dur>=48?2:1;
  if(C.studio.engine){
    const eng=C.studio.engine;
    if(S.engine==='eigen'){
      eng.runs=(eng.runs||1)+1;
      if(!eng.genres.includes(S.genre))eng.genres.push(S.genre);
      if(S.engAction==='new'){
        eng.age=1;
        if(e.meta>=70)eng.techPts=(eng.techPts||0)+1;
        e.engNote=`${eng.name} v1.0 hat ihre Feuertaufe bestanden (Zustand: ${getEngineAgeInfo(eng.age).label})${e.meta>=70?' · +1 Engine-Forschungspunkt!':''}`;
      }else if(S.engAction==='upgrade'){
        eng.age=1;
        e.engNote=`${eng.name} v${eng.version}.0 hat sich im Einsatz bewährt (Zustand: ${getEngineAgeInfo(eng.age).label}).`;
      }else{
        eng.age=(eng.age||0)+ageStep;
        const ageInfo=getEngineAgeInfo(eng.age);
        e.engNote=`${eng.name} v${eng.version}.0 hat mehr Team-Routine (${eng.runs} Spiele), altert technisch aber auf „${ageInfo.label}“ (${fmt(ageInfo.gfx)} Grafik, ${fmt(ageInfo.gp)} Gameplay beim nächsten Einsatz)!`;
      }
      if(S.engAction==='reuse'&&!S.shop.includes('refactoring')){
        eng.techDebt=(eng.techDebt||0)+1;
        e.engNote+=(e.engNote?' ':'')+'+1 Technische Schuld durch Wiederverwendung.';
      }
    }else{
      eng.age=(eng.age||0)+ageStep;
      e.engNote=`Eure eigene Engine (${eng.name}) wurde nicht genutzt und ist auf „${getEngineAgeInfo(eng.age).label}“ gealtert.`;
    }
  }
}

function finishGame(){
  const e=S.end,t=T();
  e.live=S.model==='f2p'?36*t.scale:0;
  if(e.live)S.spend.server=(S.spend.server||0)+e.live;
  e.lawsuit=crowdLawsuit();
  if(e.lawsuit>0)addLog(`<span>Geldgeber</span> Sammelklage der Backer: ${money(-e.lawsuit)}`);
  e.kasseEnd=S.res.budget-e.live+e.net+e.merch+(e.engRoyalty||0)-S.loan-e.lawsuit;
  e.capital=S.start+S.einlage+S.investIn+(S.liveNet||0);
  e.erg=e.kasseEnd-e.capital;
  e.ratio=e.erg/Math.max(1,spendTotal());
  e.v=e.ratio>=3&&e.meta>=85?['Kultklassiker','In zehn Jahren macht jemand einen Podcast über euer Spiel.']
     :e.ratio>=1?['Hit','Das nächste Projekt ist finanziert, und alle bekommen einen Bonus.']
     :e.ratio>=0?['Schwarze Null','Reicht für Miete, Pizza und ein zweites Spiel. Knapp.']
     :e.ratio>=-.5?['Flop','Immerhin habt ihr viel gelernt. Sagt man so.']
     :['Desaster','Die Kaffeemaschine wird versteigert.'];
  e.legNotes=legendMilestones(e);

  if(e.erg>0){
    const inv=e.erg*S.equity,rest=e.erg-inv;
    const taxRate=rest>2500*t.scale?0.22:0.15;
    const bonusRate=0.25;
    const keepRate=1-taxRate-bonusRate;
    e.dist={inv,tax:rest*taxRate,bonus:rest*bonusRate,keep:rest*keepRate};
    e.kasseNew=e.capital+e.dist.keep;
  }else{
    e.dist=null;e.kasseNew=e.kasseEnd;
  }

  let fd=clamp(Math.round((e.meta-65)/2.5+(e.ratio>=1?6:e.ratio>=0?2:-6)),-15,20);
  if(S.seq&&e.meta<S.seq.meta-10)fd-=5;
  if(C.studio.engine&&C.studio.engine.licenseMode==='opensource')fd+=3;
  fd+=wonAwardNames(e).length*3;
  e.fd=fd;

  C.studio.fame=clamp(C.studio.fame+fd,0,100);
  C.dir.fame=clamp(C.dir.fame+fd,0,100);
  if(e.dist)C.dir.wealth+=e.dist.bonus;
  C.dir.games++;C.dir.xp++;

  // 1. Eigene Engine: Gewinnt Routine & Forschungspunkte, altert aber ohne Upgrade!
  e.engNote='';
  advanceCalendar(projMonths());
  applyEngineAging(e);

  // 2. Lead-Personal
  e.staffNotes=[];
  if(C.studio.staff.length){
    C.studio.staff.forEach(st=>{
      st.tenure=(st.tenure||0)+1;
      st.xp=(st.xp||0)+(e.meta>=80?2:1);
      const up=checkStaffLevelUp(st);
      if(up)e.staffNotes.push(`${st.personName} (${STAFF[st.id].n}) ist auf Stufe ${st.level} aufgestiegen!`);
      if(e.ratio<0)st.loyalty=clamp((st.loyalty||6)-2,1,10);
      else if(st.tenure>=2&&S.plan.gehalt<2)st.loyalty=clamp((st.loyalty||6)-1,1,10);
    });
  }

  // 3. Money Drains
  const salInc=(e.ratio>=1?0.10:0.06)*(hasP('spar')?0.75:1);
  C.studio.salaryDrift=Math.round(((C.studio.salaryDrift||0)+salInc)*100)/100;
  C.studio.overheadDrift=Math.round(((C.studio.overheadDrift||0)+(e.ratio>=1?0.8:0.4))*10)/10;

  C.studio.kasse=e.kasseNew;
  C.studio.tier=S.tier;
  const engLabel=S.engine==='eigen'?(C.studio.engine?.name||'Eigenbau'):ENGINE_DEFS[S.engine]?.short||'';
  C.hall.push({nr:C.hall.length+1,title:S.title,genre:genreName(S),gk:S.genre,sk:S.subGenre,tier:t.n,engine:engLabel,meta:e.meta,user:e.user,gp:S.res.gp,gfx:S.res.gfx,snd:S.res.snd,units:e.units,erg:e.erg,v:e.v[0],awards:wonAwardNames(e),ipLost:!!S.ipLost||S.ip==='lizenz'});
  e.liveG=liveAdd(e);
  rollMarketTrend(); // Neuer Markttrend für das Folgejahr!
  addLog(`<span>Release</span> ${MODELS[S.model].sales} W100 ${e.sr} +${e.sb} → ${nf(e.units,0)} ${S.model==='f2p'?'Spieler':'Käufer'}, Ergebnis ${money(e.erg,true)}`);
  S.screen='end';render();save();
}

/* ===================== Post-Release DLC / Add-on Phase ===================== */
function startDlc(id){
  if(rolling||S.dlcDone)return;
  const d=DLC_OPTS.find(x=>x.id===id);if(!d)return;
  const cost=Math.round(monthSum()*d.costMonths);
  if(C.studio.kasse<cost)return;
  C.studio.kasse-=cost;
  S.dlcCost=cost;
  startRoll({kind:'dlc',ev:id,adv:false});
}

function resolveDlc(id,ok,crit){
  const e=S.end;
  const cost=S.dlcCost||0;
  const ch=[['budget',-cost]];
  let txt='';
  const hallEntry=C.hall[C.hall.length-1];

  if(id==='story_dlc'){
    const factor=crit?0.55:ok?0.38:0.15;
    const rev=Math.round(Math.max(cost*(ok?1.4:0.8),e.net*factor));
    const profit=rev-cost;
    C.studio.kasse+=rev;
    e.kasseNew=C.studio.kasse;
    e.erg+=profit;
    if(hallEntry){hallEntry.erg=e.erg;hallEntry.dlc='Story-Add-on'}
    if(ok){C.studio.fame=clamp(C.studio.fame+4,0,100);C.dir.fame=clamp(C.dir.fame+3,0,100)}
    ch.push(['budget',rev],['note',`DLC-Netto-Ergebnis: ${money(profit,true)}`]);
  }else if(id==='patch20'){
    const bonusSales=ok?Math.round(Math.max(cost*1.25,e.net*0.28)):Math.round(cost*0.5);
    const profit=bonusSales-cost;
    C.studio.kasse+=bonusSales;
    e.kasseNew=C.studio.kasse;
    e.erg+=profit;
    if(ok){
      e.meta=clamp(e.meta+(crit?7:5),15,98);
      C.studio.fame=clamp(C.studio.fame+6,0,100);
      if(hallEntry){hallEntry.meta=e.meta;hallEntry.erg=e.erg;hallEntry.dlc='Update 2.0'}
      ch.push(['budget',bonusSales],['note',`Wertung steigt auf ${e.meta} · Studio-Fame +6`]);
    }else{
      if(hallEntry){hallEntry.erg=e.erg;hallEntry.dlc='Patch 2.0'}
      ch.push(['budget',bonusSales]);
    }
  }else if(id==='cosmetic_pass'){
    const rev=ok?Math.round(cost*(crit?2.6:1.9)):Math.round(cost*0.7);
    const profit=rev-cost;
    C.studio.kasse+=rev;
    e.kasseNew=C.studio.kasse;
    e.erg+=profit;
    if(!ok)C.studio.fame=Math.max(0,C.studio.fame-2);
    if(hallEntry){hallEntry.erg=e.erg;hallEntry.dlc='Supporter-Pack'}
    ch.push(['budget',rev],['note',`Gewinn: ${money(profit,true)}${!ok?' · −2 Studio-Fame':''}`]);
  }else if(id==='engine_upgrade'){
    const eng=C.studio.engine;
    if(eng){
      eng.techDebt=0;
      if(ok){
        eng.version=(eng.version||1)+1;
        eng.age=0;
        eng.techPts=(eng.techPts||0)+1;
        ch.push(['note',`${eng.name} v${eng.version}.0 ist wieder Next-Gen (Alterung = 0) · +1 Forschungspunkt im Tech-Tree!`]);
      }else{
        eng.age=Math.max(0,(eng.age||0)-1);
        ch.push(['note',`${eng.name}: Technische Schulden abgebaut und um 1 Stufe verjüngt`]);
      }
    }
  }
  S.dlcDone=true;
  return {ch,txt};
}

/* ===================== Handtuch werfen: Studio verkaufen & neu gründen ===================== */
// Erlös für den Director: halbe Studiokasse plus Verkaufswert der eigenen Engine
function towelPayout(){
  const sc=C.studio.tier?TIERS[C.studio.tier].scale:1;
  const eng=C.studio.engine?15*C.studio.engine.version*sc:0;
  return Math.round((Math.max(0,C.studio.kasse)*0.5+eng)*10)/10;
}
// Ein sehr loyaler Lead (Loyalität ≥ 8) folgt dem Director ins neue Studio
function towelFollower(){
  return [...C.studio.staff].filter(st=>(st.loyalty||0)>=8).sort((a,b)=>b.loyalty-a.loyalty||(b.level||1)-(a.level||1))[0]||null;
}
function throwTowel(name){
  if(S||!C)return;
  const old=C.studio,pay=towelPayout(),fol=towelFollower();
  C.formerStudios=[...(C.formerStudios||[]),{name:old.name,games:C.dir.games-(C.studioGamesStart||0),fame:old.fame}];
  C.dir.wealth=Math.round((C.dir.wealth+pay)*10)/10;
  C.dir.fame=Math.max(0,Math.round(C.dir.fame*0.85));
  C.studio={name:(name||'').trim()||'Neustart Studios',fame:0,kasse:Math.round((C.dir.wealth+80)*10)/10,
    staff:fol?[{...fol,loyalty:clamp(fol.loyalty-1,1,10)}]:[],exStaff:old.exStaff||[],engine:null,salaryDrift:0,overheadDrift:0};
  C.dir.wealth=0;
  C.studioGamesStart=C.dir.games;
  C.engProj=null;
  C.towel={old:old.name,pay,follower:fol?`${fol.personName} (${STAFF[fol.id].n})`:null};
  rollMarketTrend();render();save();
}

function refound(name){
  const inv=Math.round(C.dir.wealth);
  const oldEng=C.studio.engine?{...C.studio.engine,techDebt:0,licenseMode:'none'}:null;
  C.formerStudios=[...(C.formerStudios||[]),{name:C.studio.name,games:C.dir.games-(C.studioGamesStart||0),fame:C.studio.fame,broke:true}];
  C.studio={name:(name||'').trim()||C.studio.name,fame:0,kasse:inv+80,staff:[],exStaff:C.studio.exStaff||[],engine:oldEng,salaryDrift:0,overheadDrift:0};
  C.studioGamesStart=C.dir.games;
  C.dir.wealth=0;S=null;setupDraft=null;rollMarketTrend();render();save();
}

// Ruhestand: Karriere endet mit einer Bilanz, danach beginnt eine neue Karriere
function retire(){
  if(!C)return;
  const metas=C.hall.map(h=>h.meta).filter(x=>x!=null);
  C.retired={games:C.dir.games,best:metas.length?Math.max(...metas):null,
    awards:C.hall.reduce((a,h)=>a+(h.awards?.length||0),0),wealth:Math.round(C.dir.wealth),
    studios:(C.formerStudios||[]).length+1};
  S=null;render();save();
}
