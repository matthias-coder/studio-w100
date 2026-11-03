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
function gfxWeight(){
  if(!S)return 0.45;
  const base=GENRES[S.genre]?.gfxW??0.45;
  const tierAdj=S.tier==='aaa'?0.08:S.tier==='indie'?-0.05:0;
  return clamp(base+tierAdj,0.25,0.65);
}

function recalcQual(){
  if(!S||!S.res)return;
  if(S.res.gp===undefined)S.res.gp=S.res.qual||20;
  if(S.res.gfx===undefined)S.res.gfx=S.res.qual||20;
  const w=gfxWeight();
  S.res.qual=clamp(Math.round(S.res.gp*(1-w)+S.res.gfx*w),0,100);
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
        specialty:ex.id==='art'?'adventure':ex.id==='senior'?'koop':'rpg',
        strength:64+(ex.level||1)*4,
        desc:`Gegründet von eurem abgewanderten Lead ${ex.personName}. Hochmotiviert, es euch zu beweisen!`,
        isEx:true
      });
    });
  }
  return list;
}

function simulateRivalReleases(){
  const rivals=getAllRivals();
  // 3 zufällige Rivalen veröffentlichen im selben Jahr ein großes Spiel
  const pool=[...rivals].sort(()=>Math.random()-0.5).slice(0,3);
  return pool.map(rv=>{
    const swing=Math.floor(Math.random()*18)-7;
    const meta=clamp(rv.strength+swing,52,94);
    const gp=clamp(meta+Math.floor(Math.random()*10)-4,48,96);
    const gfx=clamp(meta+Math.floor(Math.random()*10)-4,48,96);
    return {
      studio:rv.name,
      isEx:!!rv.isEx,
      title:randTitle(),
      genre:GENRES[rv.specialty]?.n||'Action',
      meta,gp,gfx
    };
  });
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
  if(!mod||eng.modules.includes(modId)||(eng.techPts||0)<=0)return;
  eng.techPts--;
  eng.modules.push(modId);
  if(S&&S.engine==='eigen'&&mod.eff){
    const ch=apply(mod.eff);
    S.engMsg={n:`Modul erforscht: ${mod.n}`,ch,txt:mod.d};
    addLog(`<span>Engine</span> Modul „${esc(mod.n)}“ im Tech-Tree freigeschaltet!`);
  }else if(S){
    S.engMsg={n:`Modul erforscht: ${mod.n}`,ch:[['note','Aktiv beim nächsten Einsatz eurer Engine']],txt:mod.d};
  }
  render();save();
}

function buyEngineResearchPoint(){
  if(!C||!C.studio.engine||!S)return;
  const eng=C.studio.engine;
  const sc=T().scale;
  const cost=12*sc;
  if(S.res.budget<cost)return;
  S.res.budget-=cost;
  S.spend.eng=(S.spend.eng||0)+cost;
  eng.techPts=(eng.techPts||0)+1;
  S.engMsg={n:'Engine-Forschungssprint finanziert',ch:[['budget',-cost],['note','+1 Engine-Forschungspunkt verfügbar']],txt:'Euer Tech-Team hat einen neuen Modul-Bauplan fertiggestellt.'};
  addLog(`<span>Engine</span> Forschungspunkt für ${money(cost)} gekauft`);
  render();save();
}

function setEngineLicense(mode){
  if(!C||!C.studio.engine||!ENGINE_LIC_MODES[mode])return;
  C.studio.engine.licenseMode=mode;
  render();save();
}

/* ===================== Auftragsarbeiten & Publisher-Meilensteine ===================== */
function ensureMilestone(){
  if(!S||!S.publisher||S.milestone)return;
  const t=T();
  const targetMonth=S.round<6?6:10;
  const baseTarget=34+t.qual+(targetMonth===10?14:0);
  S.milestone={
    month:targetMonth,
    gp:baseTarget,
    gfx:baseTarget-2,
    reward:25*t.scale,
    done:false
  };
}

function startContract(id){
  if(rolling||!S)return;
  const ph=Math.floor(S.round/2);
  if(!S.contractsPh)S.contractsPh=[];
  if(S.contractsPh.includes(ph))return;
  S.contractsPh.push(ph);
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
const fits=c=>(!c.tiers||c.tiers.includes(S.tier))&&(!c.models||c.models.includes(S.model))&&(!c.ip||c.ip.includes(S.ip))&&(!c.mods||S.mods)&&(!c.noEA||!S.ea)&&(!c.ea||S.ea)&&(!c.cond||c.cond(S))&&(!c.flaw||hasF(c.flaw));
const optOk=o=>(!o.g||o.g.includes(S.genre))&&(!o.ng||!o.ng.includes(S.genre))&&(!o.cond||o.cond(S));
function addLog(t){if(!S)return;S.log.unshift(t);if(S.log.length>90)S.log.pop()}
function mandFor(r){return (MAND_AT[r]||[]).filter(id=>!S.mdone.includes(id)&&(id!=='price'||S.model!=='f2p')&&(id!=='china'||(S.langs&&S.langs.zh)))}

/* ===================== Spielstart ===================== */
function startGame(o){
  if(!C.trend)rollMarketTrend();
  const g=GENRES[o.genre],t=TIERS[o.tier],dir=D();
  let ip=o.ip,seq=null;if(ip.startsWith('seq:')){seq=C.hall[+ip.slice(4)];ip='franchise'}
  const first=C.gameNo===0;
  const budget=first?Math.round(220*t.scale*(dir.perks.includes('netz')?1.15:1)):Math.round(C.studio.kasse);

  const res={
    budget,
    moral:6,
    hype:2+t.hype,
    gp:20+(t.gp??t.qual),
    gfx:20+(t.gfx??t.qual),
    qual:20+t.qual,
    bugs:5,
    zeit:14,
    wl:0
  };
  for(const k in g.b){
    if(k==='qual'){res.gp+=g.b[k];res.gfx+=g.b[k]}
    else res[k]=(res[k]||0)+g.b[k];
  }
  if(g.fit===o.model&&o.model!=='kauf')res.hype+=1;
  if(C.trend&&C.trend.hot===o.genre)res.hype+=1;
  res.hype+=IPS[ip].hype;if(o.mods)res.bugs+=1;
  const aff=(dir.aff[o.genre]||0)+(dir.perks.includes('spezial')?1:0);
  res.gp+=aff*5+(dir.perks.includes('spezial')?4:0);
  res.gfx+=aff*3;
  res.moral+=dir.s.fuehrung-1;
  res.hype+=dir.s.hype-1+(dir.flaws.includes('verspricht')?2:0);
  if(staffLevel('art')>=4)res.hype+=1;
  if(staffLevel('community')>=3)res.hype+=(staffLevel('community')>=5?2:1);
  if(C.studio.engine&&C.studio.engine.licenseMode==='opensource')res.hype+=1;

  res.hype+=Math.floor(C.studio.fame/25)+Math.floor(C.dir.fame/30);
  if(seq)res.hype+=clamp(Math.floor((seq.meta-60)/8),0,4);
  res.wl=Math.round((C.studio.fame+C.dir.fame)*60*t.sales+(seq?seq.meta*40*t.sales:0));
  res.moral=clamp(res.moral,0,10);res.hype=clamp(res.hype,0,10);
  const plan={};for(const k in PLAN)plan[k]=PLAN[k].def;

  const scaledStats={};
  for(const k in STATS)scaledStats[k]=(g.s[k]||0)*4;

  S={screen:'event',title:o.title||randTitle(),genre:o.genre,tier:o.tier,model:o.model,ip,seq:seq?{title:seq.title,meta:seq.meta}:null,mods:o.mods,ea:o.ea,
     stats:scaledStats,res,start:budget,einlage:0,investIn:0,round:0,deck:[],mdone:[],insp:2,log:[],adv:false,last:null,
     plan,acc:{},spend:{},income:0,payers:0,usedR:[],month:null,aff,promises:dir.flaws.includes('verspricht')?1:0,abUsed:false,works:false,
     shop:[],contractsPh:[],milestone:null,prod:{},recoup:0,publisher:false,pubExtra:0,loan:0,equity:0,layoff:false,rescued:[],langs:null,langDone:false,china:'none',
     engine:null,engAction:null,engAgeAtStart:0,world:null,cast:null,lic:null,plat:null,age:null,price:1,lootbox:false,algo:false,eaPenalty:0,dlcDone:false,
     trendHot:C.trend?.hot===o.genre,trendCold:C.trend?.cold===o.genre};

  recalcQual();
  const fee=IPS[ip].fee*t.scale;if(fee){S.res.budget-=fee;S.spend.projekt=fee}
  for(let p=0;p<6;p++){const pool=E.map((e,i)=>i).filter(i=>E[i].p===p&&fits(E[i]));pool.sort(()=>Math.random()-.5);S.deck.push(pool[0],pool[1]??pool[0])}
  C.gameNo++;
  addLog(`<span>Start</span> ${esc(C.studio.name)} beginnt „${esc(S.title)}“: ${t.n}, ${g.n}${S.trendHot?' (Boom-Genre!)':S.trendCold?' (Übersättigt)':''}, ${IPS[ip].n}${seq?' von „'+esc(seq.title)+'“':''}, ${MODELS[o.model].n}, Director ${esc(dir.n)}, ${money(budget)} Budget`);
  goMonth();
}

function goMonth(){const m=mandFor(S.round);if(m.length){S.mcur=m[0];S.screen=m[0]==='lang'?'lang':'mand'}else S.screen='event';render();save()}

/* ===================== W100 Würfel-Modifikatoren & Regeln ===================== */
function moralMod(){
  const m=S.res.moral;
  return m>=9?6:m>=7?3:m<=1?-10:m<=3?-5:0;
}

function modFor(st){
  const dm={design:'vision',technik:'technik',team:'fuehrung',business:'business'}[st];
  const d=D();
  const baseStat=S.stats[st]<=3&&S.round===0?S.stats[st]*4:S.stats[st];
  let m=baseStat
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
    if(eng.modules.includes('netcode')&&['koop','mmorpg','br'].includes(S.genre))m+=5;
    if(eng.licenseMode==='seat'&&!hasStaff('senior'))m-=4;
  }
  if(st==='team'&&S.layoff)m-=6;
  if(st==='technik'&&S.engine==='godoh'&&S.tier==='aaa')m-=8;
  if(st==='technik'&&S.engine==='unitee'&&S.tier==='aaa')m-=4;
  return m;
}

function optMod(o){
  let bonus=0;
  const isEngOrPort=o.set&&(o.set.engine==='eigen'||['konsole','alle'].includes(o.set.plat))||o.l==='Eigene Server-Architektur';
  if(hasP('engine')&&isEngOrPort)bonus+=15;
  if(isEngOrPort&&staffLevel('senior')>=4)bonus+=(staffLevel('senior')>=5?10:6);
  if(o.set&&['konsole','alle'].includes(o.set.plat)&&S.engine==='eigen'&&C.studio.engine?.modules.includes('portkit'))bonus+=12;
  return modFor(o.st)+bonus;
}

function apply(eff){
  const out=[];if(!eff)return out;const sc=T().scale;
  for(const k in eff){
    let v=eff[k];if(!v)continue;
    if(k==='payers'){S.payers+=v;out.push([k,v]);continue}
    if(k==='ea'){S.ea=true;out.push([k,v]);continue}
    if(k==='promise'){S.promises=Math.max(0,S.promises+v);out.push([k,v]);continue}
    if(k==='recoup'){S.recoup+=v*sc;S.publisher=true;ensureMilestone();out.push([k,v*sc]);continue}
    if(k==='wl'){v=Math.round(v*1000*T().sales*(D().s.hype>=3?1.15:1));S.res.wl+=v;out.push([k,v]);continue}
    if(k==='moral'&&v<0&&hasP('crunch')){v=Math.min(0,v+1);if(!v)continue}
    if(k==='zeit'&&v<0&&hasStaff('producer')){
      const ph=Math.floor(S.round/2);
      const maxSave=staffLevel('producer')>=3?2:1;
      const used=S.prod[ph]||0;
      if(used<maxSave){
        S.prod[ph]=used+1;
        v+=1;
        out.push(['note',`${getStaff('producer').personName} (Producer) fängt 1 Monat Verzug ab`]);
        if(!v)continue;
      }
    }
    if(k==='budget'){v=v*sc;if(v<0)S.spend.projekt=(S.spend.projekt||0)-v;else S.income+=v;S.res.budget+=v;out.push([k,v]);continue}
    if(k==='qual'){
      S.res.gp=(S.res.gp||20)+v;
      S.res.gfx=(S.res.gfx||20)+v;
      out.push(['gp',v],['gfx',v]);
      continue;
    }
    if(k==='gp'||k==='gfx'){
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
  recalcQual();
  S.res.bugs=Math.max(0,S.res.bugs);
  S.res.wl=Math.max(0,S.res.wl);
}

function unapply(ch){
  for(const [k,v] of ch){
    if(k==='budget'){S.res.budget-=v;if(v<0)S.spend.projekt-=-v;else S.income-=v}
    else if(k==='payers')S.payers-=v;else if(k==='promise')S.promises=Math.max(0,S.promises-v);else if(k==='recoup')S.recoup-=v;
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

function onSet(st,out,ok){
  if(st.world){
    const g=GENRES[S.genre];
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
  if(k==='ea')return `<span class="chip p">Early Access ab Monat 8</span>`;
  if(k==='promise')return `<span class="chip ${v<0?'p':'n'}">${fmt(v)} offenes Versprechen</span>`;
  if(k==='recoup')return `<span class="chip">Vorschuss ${money(v)} wird später verrechnet</span>`;
  if(k==='wl')return `<span class="chip ${v>0?'p':'n'}">${v>0?'+':'−'}${nf(Math.abs(v),0)} Wishlists</span>`;
  if(k==='budget')return `<span class="chip ${v>0?'p':'n'}">${money(v,true)}</span>`;
  const L={moral:'Moral',hype:'Hype',qual:'Qualität',gp:'Gameplay',gfx:'Grafik',bugs:'Bugs',zeit:'Zeit'};
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
    add('staff',C.studio.staff.reduce((a,st)=>a+(st.sal||STAFF[st.id].sal),0)*sc);
  }

  const fameOver=C?Math.floor((C.studio.fame||0)/25)*0.6:0;
  const over=(2+(C?.studio?.overheadDrift||0)+fameOver)*sc;
  add('buero',over);

  for(const k of ['mkt','qa','team','content','weiter','outs'])add(PLAN[k].cat,PLAN[k].cost[S.plan[k]]*sc);
  if(S.world==='open')add('welt',2*sc);else if(S.world==='hub')add('welt',1*sc);
  if(S.model!=='kauf'&&S.round>=8)add('server',2*sc);
  if(S.mods)add('mods',1*sc);

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
function runway(){const m=monthSum();return m>0?Math.floor(S.res.budget/m):99}
const spendTotal=()=>Object.values(S.spend).reduce((a,b)=>a+b,0);

/* ===================== Ablauf & W100-Würfeln ===================== */
function curCard(){return S.screen==='mand'?getMand(S.mcur):E[S.deck[S.round]]}

function choose(i){
  if(rolling)return;
  const kind=S.screen==='mand'?'mand':'card';
  const ev=kind==='mand'?S.mcur:S.deck[S.round];
  const o=curCard().o[i];
  const pre=o.set?applySet({set:o.set},null):[];
  if(o.safe){
    const ch=apply(o.safe);
    S.last={kind,ev,oi:i,safe:true,ch,pre,txt:o.sx,l:o.l};
    S.screen='result';
    addLog(`<span>M${S.round+1}</span> ${curTitle(kind,ev)}: ${o.l}`);
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
    :kind==='shop'?SHOP.find(x=>x.id===ev).n
    :kind==='contract'?CONTRACTS.find(x=>x.id===ev).n
    :kind==='hire'?STAFF[ev].n
    :kind==='dlc'?DLC_OPTS.find(x=>x.id===ev).n
    :RESC.find(x=>x.id===ev).n;
}

function getOpt(p){
  if(p.kind==='card')return E[p.ev].o[p.oi];
  if(p.kind==='mand')return getMand(p.ev).o[p.oi];
  if(p.kind==='rand'){const r=R[p.ev];const adj=r.dcAdj?r.dcAdj(S):0;return {...r,l:'Rettungswurf',dc:dc100(r.dc)+adj*4}}
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
  if(p.kind==='dlc'){
    const x=resolveDlc(o.id,ok,crit);
    pre=pre.concat(x.ch);
    if(x.txt)txt+=' '+x.txt;
  }
  if(ok&&o.onOk){const x=o.onOk();if(x)txt+=' '+x}
  if(!ok&&o.onFail){const x=o.onFail();if(x)txt+=' '+x}
  S.last={...p,rolls,r,mod,mm,total,ok,crit,fumble,ch,pre,txt,dc:target,st:o.st,l:o.l};
  addLog(`<span>M${Math.min(S.round+1,12)}</span> ${curTitle(p.kind,p.ev)}: ${o.l} · W100 ${rolls.join('/')} ${fmt(mod+mm)} = ${total} gegen SG ${target} → ${crit?'kritischer Erfolg':fumble?'Patzer':ok?'Erfolg':'Fehlschlag'}`);
  S.pending=null;S.screen='result';render();save();
}

function afterResult(k){
  if(k==='card')monthEnd();
  else if(k==='mand'){S.mdone.push(S.mcur);goMonth()}
  else if(k==='rand')afterRandom();
  else if(k==='shop'||k==='hire'||k==='contract'){S.screen='shop';render();save()}
  else if(k==='dlc'){S.screen='end';render();save()}
  else if(k==='rescue'){if(S.over)gameOver(S.over);else{S.screen='crisis';render();save()}}
}

/* ===================== Monatsabschluss ===================== */
function monthEnd(){
  const sc=T().scale;
  const lines=monthLines();let sum=0;lines.forEach(([c,v])=>{S.spend[c]=(S.spend[c]||0)+v;sum+=v});S.res.budget-=sum;
  const d=D(),pe={},notes=[];const add=(k,v)=>{pe[k]=(pe[k]||0)+v};
  const acc=(key,v,f)=>{S.acc[key]=(S.acc[key]||0)+v;while(S.acc[key]>=1){S.acc[key]-=1;f(1)}while(S.acc[key]<=-1){S.acc[key]+=1;f(-1)}};

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
    else if(P.key==='qual'){
      const eng=C&&C.studio.engine;
      const agePen=(S.engine==='eigen'&&eng&&(eng.age||0)>=3)?0.75:1;
      acc('content_gp',v*0.6*agePen,x=>add('gp',x));
      acc('content_gfx',v*0.5*agePen,x=>add('gfx',x));
    }
    else acc(k,v,x=>add(P.key,x));
  }

  const artGfx=[0,0.3,0.5,0.8,1.1,1.5][staffLevel('art')]||0;
  const eng=C&&C.studio.engine;
  const engDrag=(S.engine==='eigen'&&eng)?((eng.age||0)>=4?-0.4:(eng.age||0)===3?-0.2:0):0;

  acc('pol_gp',d.s.polish*.35+engDrag,x=>add('gp',x));
  acc('pol_gfx',d.s.polish*.30+artGfx+engDrag,x=>add('gfx',x));

  const qaBug=[0,-0.5,-0.8,-1.2,-1.6,-2.2][staffLevel('qalead')]||0;
  const senBug=staffLevel('senior')>=5?-1.0:staffLevel('senior')>=3?-0.5:staffLevel('senior')===2?-0.3:0;
  const engBug=(S.engine==='eigen'&&eng)?((eng.modules.includes('qaauto')?-0.5:0)+(eng.licenseMode==='opensource'?-0.5:eng.licenseMode==='none'?-0.25:0)+(eng.techDebt||0)*0.3):0;

  acc('pbug',-(d.s.polish-1)*.25+(hasF('buggy')?1:0)+qaBug+senBug+engBug+(S.shop.includes('hardware')?-.25:0)+.25*S.plan.outs,x=>add('bugs',x));

  const mNo=S.round+1;
  if(hasF('diva')&&mNo%3===0)add('moral',-1);
  if(hasF('perfekt')&&mNo%4===0){add('zeit',-1);add('gp',2);add('gfx',2)}

  if(C.studio.staff.length){
    C.studio.staff.forEach(st=>{
      if(S.plan.gehalt===0&&mNo%3===0)st.loyalty=clamp((st.loyalty||6)-1,1,10);
      if(S.plan.gehalt===2&&mNo%4===0)st.loyalty=clamp((st.loyalty||6)+1,1,10);
      if(S.res.moral<=2&&mNo%2===0)st.loyalty=clamp((st.loyalty||6)-1,1,10);
      if(hasF('diva')&&mNo%4===0&&!hasP('crunch'))st.loyalty=clamp((st.loyalty||6)-1,1,10);
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
    licInc=Math.round(ENGINE_LIC_MODES[eng.licenseMode].inc*eng.version*sc*ageMult*bizMult*10)/10;
    if(licInc>0){
      S.res.budget+=licInc;
      S.income+=licInc;
    }
  }

  let eaInc=0;
  if(S.ea&&S.round>=7&&S.round<11){
    eaInc=Math.round((2+S.res.hype)*1.2*sc*(hasP('ea')?1.5:1)*10)/10;
    S.res.budget+=eaInc;S.income+=eaInc;add('bugs',-1);
  }

  const commMult=[1,1.1,1.18,1.25,1.32,1.4][staffLevel('community')]||1;
  const wlg=Math.round(Math.pow(S.res.hype,1.5)*90*T().sales*commMult*(S.round>=6?1.5:1)*(d.s.hype>=3?1.1:1));
  S.res.wl+=wlg;

  if(!S.algo&&S.res.wl>=10000*T().sales){S.algo=true;add('hype',1);notes.push('Der Store-Algorithmus empfiehlt euch jetzt')}
  const pc=apply(pe).filter(([k])=>k!=='note');
  S.res.zeit-=1;S.round++;

  // Publisher-Meilenstein prüfen!
  if(S.milestone&&!S.milestone.done&&S.round===S.milestone.month){
    S.milestone.done=true;
    if(S.res.gp>=S.milestone.gp&&S.res.gfx>=S.milestone.gfx){
      S.res.budget+=S.milestone.reward;
      S.income+=S.milestone.reward;
      S.res.moral=clamp(S.res.moral+1,0,10);
      notes.push(`Publisher-Meilenstein erreicht (+${money(S.milestone.reward)}, +1 Moral)!`);
    }else{
      S.res.moral=clamp(S.res.moral-1,0,10);
      notes.push(`Publisher-Meilenstein verfehlt (−1 Moral, kein Bonus)`);
    }
  }

  S.month={sum,pc,n:S.round,ea:eaInc,lic:licInc,wl:wlg,notes};
  addLog(`<span>M${S.round}</span> Monatsabschluss: ${money(sum)} Kosten${eaInc?`, ${money(eaInc,true)} Early Access`:''}${licInc?`, ${money(licInc,true)} Engine-Lizenzen`:''}, +${nf(wlg,0)} Wishlists${pc.length?', '+pc.map(([k,v])=>fmt(v)+' '+({moral:'Moral',hype:'Hype',qual:'Qualität',gp:'Gameplay',gfx:'Grafik',bugs:'Bugs',zeit:'Zeit'}[k]||k)).join(', '):''}${notes.length?' · '+notes.join(' · '):''}`);
  if(S.res.budget<0){openCrisis('month');return}
  afterMonth();
}

function afterMonth(){
  if(S.res.moral<=0){gameOver('moral');return}
  if(S.round>=12){S.screen='launch';render();save();return}
  const ph=Math.floor(S.round/2);
  const fpool=R.map((r,i)=>i).filter(i=>R[i].flaw&&i!==S.rnd&&fits(R[i]));
  const pool=R.map((r,i)=>i).filter(i=>!R[i].flaw&&!S.usedR.includes(i)&&(R[i].min||0)<=ph&&fits(R[i]));
  let pick=null;
  if(fpool.length&&Math.random()<.3)pick=fpool[Math.floor(Math.random()*fpool.length)];
  else if(pool.length&&Math.random()<.48)pick=pool[Math.floor(Math.random()*pool.length)];
  if(pick!==null){
    S.usedR.push(pick);S.rnd=pick;S.rndCh=null;
    if(R[pick].eff){S.rndCh=apply(R[pick].eff);addLog(`<span>M${S.round}</span> Zufall: ${R[pick].t}`)}
    S.screen='random';render();save();return;
  }
  goMonth();
}

function afterRandom(){if(S.res.budget<0){openCrisis('rand');return}if(S.res.moral<=0){gameOver('moral');return}goMonth()}
function openCrisis(from){S.crisisFrom=from;S.prevScreen=S.screen;S.early=S.res.budget>=0;S.crisisMsg=null;S.screen='crisis';render();save()}
function leaveCrisis(){if(S.crisisFrom==='month')afterMonth();else if(S.crisisFrom==='rand')goMonth();else{S.screen=S.prevScreen==='crisis'?'event':(S.prevScreen||'event');render();save()}}

function gameOver(reason){
  S.over=reason;S.screen='over';
  if(!S.overDone){
    S.overDone=true;
    C.hall.push({nr:C.hall.length+1,title:S.title,genre:GENRES[S.genre].n,tier:T().n,meta:null,units:0,erg:null,v:reason==='moral'?'Team gekündigt':'Insolvenz'});
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
    if(id==='publisher'){const a=gain(need);S.recoup+=a;S.publisher=true;ensureMilestone();S.pubExtra+=.1;if(S.ip==='neu'){S.ipLost=true;txt='Die Rechte an eurer neuen Welt gehören jetzt dem Publisher.'}}
    else if(id==='kredit'){const a=gain(need+monthSum());S.loan+=a}
    else if(id==='investor'){const a=gain(need+monthSum());S.investIn+=a;S.equity+=.2}
    else if(id==='crowd'){const a=gain(need);S.income+=a}
    else if(id==='haus'){const a=gain(need);S.einlage+=a;ch.push(...apply({moral:2}))}
  }else if(id==='haus'){S.over='haus'}
  return {ch,txt};
}

/* ===================== Shop & Personal ===================== */
function buy(id){
  if(rolling)return;
  const it=SHOP.find(x=>x.id===id);
  const cost=it.cost*T().scale;
  if(S.shop.includes(id)||S.res.budget<cost)return;
  S.res.budget-=cost;S.spend.invest=(S.spend.invest||0)+cost;S.shop.push(id);
  addLog(`<span>M${S.round+1}</span> Shop: ${it.n} für ${money(cost)}`);
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
  const fee=2*T().scale;
  if(S.res.budget<fee||hasStaff(id))return;
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
function abilityReady(){
  if(!S||!C||!D().ab||S.abUsed)return false;
  if(D().ab==='reroll')return S.screen==='result'&&S.last&&!S.last.safe&&!S.last.ok;
  return ['event','launch','mand'].includes(S.screen);
}
function useAbility(){
  if(rolling||!abilityReady())return;
  const id=D().ab;
  if(id==='reroll'){
    const L=S.last;unapply(L.ch);
    if(L.kind==='rescue'){S.over=null;S.rescued=S.rescued.filter(x=>x!==L.ev);S.rescued.push(L.ev)}
    S.abUsed=true;
    addLog(`<span>Director</span> ${ABIL[id].n}: Wurf wird wiederholt`);
    startRoll({kind:L.kind,ev:L.ev,oi:L.oi,adv:L.adv});
    return;
  }
  if(id==='works')S.works=true;
  const M={cash:{budget:40,hype:1,zeit:-1},rewrite:{bugs:-8,gfx:3},promi:{hype:3,wl:3},tiefe:{gp:10},ankuend:{hype:4,promise:1,wl:4},tisch:{gp:10,gfx:6,zeit:-2},fans:{budget:30,hype:1},community:{moral:3,bugs:-3},works:{}}[id];
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
function platFactor(){const mob=S.genre==='mobile';return {pc:mob?.6:1,konsole:mob?1.3:1.7,exklusiv:1.05,alle:mob?2.6:1.9}[S.plat]||1}
function ageFactor(){return ({0:1.1,6:1.1,12:1.05,16:1,18:.85}[S.age]??1)*(S.lootbox?.92:1)}
function licFactor(){return {auto:1.25,liga:1.4,ttrpg:1.2,musik:1.05}[S.lic]||1}
function ipSales(){return S.seq?1.3+(S.seq.meta-70)/100:IPS[S.ip].sales}

function launch(){
  if(rolling)return;
  const r=d100();
  animate([r],()=>{
    let late='';
    if(S.res.zeit<0){
      const z=-S.res.zeit;
      S.res.bugs+=z*3;
      S.res.hype=clamp(S.res.hype-z,0,10);
      late=`Ihr wart ${z} Monat${z>1?'e':''} zu spät dran. Das hat Bugs und Hype gekostet. `;
    }
    recalcQual();
    const pr=S.model==='f2p'?0:[2,0,-1][S.price];
    const qaRevBonus=staffLevel('qalead')>=5?3:staffLevel('qalead')===4?2:staffLevel('qalead')===3?1:0;
    const rtBonus=(S.engine==='eigen'&&C.studio.engine?.modules.includes('raytracing'))?2:0;
    const engAgeRev=(S.engine==='eigen'&&C.studio.engine)?getEngineAgeInfo(S.engAgeAtStart||0).rev:0;
    if(engAgeRev<0){
      late+=`Die Tester bemängeln die angestaubte Technik eurer Engine (${fmt(engAgeRev)} Wertung). `;
    }
    const meta=clamp(Math.round(S.res.qual*.75+25-(S.works?0:S.res.bugs)*1.2+(r-50)*.16+T().review+IPS[S.ip].review+engAgeRev+rtBonus-(S.ea?(S.eaPenalty||2):0)+(hasP('kritik')?4:0)+qaRevBonus-2*S.promises+(S.shop.includes('a11y')?2:0)+pr-Math.floor(C.dir.fame/40)),15,98);
    const rivalGames=simulateRivalReleases();
    // GOTY-Awards Auswertung gegen die Konkurrenz!
    const bestRivalMeta=Math.max(...rivalGames.map(x=>x.meta));
    const bestRivalGp=Math.max(...rivalGames.map(x=>x.gp));
    const bestRivalGfx=Math.max(...rivalGames.map(x=>x.gfx));
    const awards=[];
    if(meta>=75&&meta>=bestRivalMeta)awards.push('Spiel des Jahres (GOTY)');
    if(S.res.gp>=75&&S.res.gp>=bestRivalGp)awards.push('Bestes Gameplay');
    if(S.res.gfx>=75&&S.res.gfx>=bestRivalGfx)awards.push('Beste Grafik & Technik');

    S.end={r,meta,gp:S.res.gp,gfx:S.res.gfx,late,rivalGames,awards};
    S.screen='sales';
    addLog(`<span>Release</span> Review-Wurf W100 ${r} → Wertungsschnitt ${meta} (GP ${S.res.gp} · GFX ${S.res.gfx})${awards.length?' · 🏆 '+awards.join(', '):''}`);
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
    const organic=Math.pow(e.meta/10,3)*(S.res.hype+2)*(roll20+5)*.45*t.sales;
    const conv=clamp(.06+(e.meta-50)/250+[.06,.03,0][pi],.02,.4);
    const trendMult=S.trendHot?1.15:S.trendCold?0.90:1;
    const awardMult=1+(e.awards?.length||0)*0.08;
    const mult=marketFactor()*platFactor()*ageFactor()*licFactor()*ipSales()*trendMult*awardMult*(S.mods?(S.model==='f2p'?1.15:1.25):1)*(S.ea?.85:1)*(S.shop.includes('awards')&&e.meta>=80?1.1:1);
    const units=Math.round((organic*[1.5,1,.7][pi]+S.res.wl*conv)*mult);
    let rev=0,detail=[];
    detail.push(['Wishlists beim Release',nf(S.res.wl,0)+' ('+nf(conv*100,0)+' % kaufen sofort)']);
    if(S.model==='kauf'){
      rev=units*price*.6/1000;e.units=units;
      detail.push(['Verkaufte Exemplare',nf(units,0)],['Preis',nf(price,2)+' €'],['Umsatz netto (60 % nach Plattform und Steuern)',money(rev)]);
    }else if(S.model==='abo'){
      const buyers=Math.round(units*.7),box=price*.6,months=clamp(2+(e.meta-50)/8+S.res.hype/3,1,12);
      const rB=buyers*box*.6/1000,rS=buyers*12.99*months*.7/1000;rev=rB+rS;e.units=buyers;
      detail.push(['Käufer zum Start',nf(buyers,0)],['Startpreis inkl. erstem Monat',nf(box,2)+' €'],['Ø Abo-Monate im ersten Jahr',nf(months)],['Umsatz Verkauf netto',money(rB)],['Umsatz Abos netto',money(rS)]);
    }else{
      const players=Math.round(units*14*(.5+S.res.hype/10)),rate=clamp(4+S.payers,1,12);
      rev=players*(rate/100)*45*.7/1000;e.units=players;
      detail.push(['Spieler im ersten Jahr',nf(players,0)],['Davon zahlend',rate+' %'],['Shop-Umsatz netto',money(rev)]);
    }
    const mods=[];
    if(S.langs)mods.push('Sprachen ×'+nf(marketFactor(),2));
    if(S.plat)mods.push('Plattformen ×'+nf(platFactor(),2));
    if(S.lic&&S.lic!=='none')mods.push('Lizenzen ×'+nf(licFactor(),2));
    if(S.age!=null)mods.push('USK '+S.age+' ×'+nf(ageFactor(),2));
    if(S.trendHot)mods.push('Boom-Genre ×1,15');
    if(S.trendCold)mods.push('Übersättigt ×0,90');
    if(e.awards?.length)mods.push(`Awards ×${nf(awardMult,2)}`);
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

function finishGame(){
  const e=S.end,t=T();
  e.live=S.model!=='kauf'?36*t.scale:0;
  if(e.live)S.spend.server=(S.spend.server||0)+e.live;
  e.kasseEnd=S.res.budget-e.live+e.net+e.merch+(e.engRoyalty||0)-S.loan;
  e.capital=S.start+S.einlage+S.investIn;
  e.erg=e.kasseEnd-e.capital;
  e.ratio=e.erg/Math.max(1,spendTotal());
  e.v=e.ratio>=3&&e.meta>=85?['Kultklassiker','In zehn Jahren macht jemand einen Podcast über euer Spiel.']
     :e.ratio>=1?['Hit','Das nächste Projekt ist finanziert, und alle bekommen einen Bonus.']
     :e.ratio>=0?['Schwarze Null','Reicht für Miete, Pizza und ein zweites Spiel. Knapp.']
     :e.ratio>=-.5?['Flop','Immerhin habt ihr viel gelernt. Sagt man so.']
     :['Desaster','Die Kaffeemaschine wird versteigert.'];

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
  fd+=(e.awards?.length||0)*3;
  e.fd=fd;

  C.studio.fame=clamp(C.studio.fame+fd,0,100);
  C.dir.fame=clamp(C.dir.fame+fd,0,100);
  if(e.dist)C.dir.wealth+=e.dist.bonus;
  C.dir.games++;C.dir.xp++;

  // 1. Eigene Engine: Gewinnt Routine & Forschungspunkte, altert aber ohne Upgrade!
  e.engNote='';
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
        eng.age=(eng.age||0)+1;
        const ageInfo=getEngineAgeInfo(eng.age);
        e.engNote=`${eng.name} v${eng.version}.0 hat mehr Team-Routine (${eng.runs} Spiele), altert technisch aber auf „${ageInfo.label}“ (${fmt(ageInfo.gfx)} Grafik, ${fmt(ageInfo.gp)} Gameplay beim nächsten Einsatz)!`;
      }
      if(S.engAction==='reuse'&&!S.shop.includes('refactoring')){
        eng.techDebt=(eng.techDebt||0)+1;
        e.engNote+=(e.engNote?' ':'')+'+1 Technische Schuld durch Wiederverwendung.';
      }
    }else{
      eng.age=(eng.age||0)+1;
      e.engNote=`Eure eigene Engine (${eng.name}) wurde nicht genutzt und ist auf „${getEngineAgeInfo(eng.age).label}“ gealtert.`;
    }
  }

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
  C.hall.push({nr:C.hall.length+1,title:S.title,genre:GENRES[S.genre].n,tier:t.n,engine:engLabel,meta:e.meta,gp:S.res.gp,gfx:S.res.gfx,units:e.units,erg:e.erg,v:e.v[0],awards:e.awards||[],ipLost:!!S.ipLost||S.ip==='lizenz'});
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

function refound(){
  const inv=Math.round(C.dir.wealth);
  const oldEng=C.studio.engine?{...C.studio.engine,techDebt:0,licenseMode:'none'}:null;
  C.studio={name:C.studio.name,fame:0,kasse:inv+80,staff:[],exStaff:C.studio.exStaff||[],engine:oldEng,salaryDrift:0,overheadDrift:0};
  C.dir.wealth=0;S=null;rollMarketTrend();render();save();
}
