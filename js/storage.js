/* ===================== Multi-User Save System & Export (GitHub Pages / LocalStorage) ===================== */
const STORAGE_PROFILES_KEY='w20_profiles_v6';
const STORAGE_ACTIVE_KEY='w20_active_slot_v6';
const STORAGE_MANUAL_KEY='w20m';
const STORAGE_UNLOCKED_KEY='w100_unlocked_chars_v2';

let profiles=[];
let activeSlotId='slot_1';
let unlockedChars=[];

// Alle Legenden starten gesperrt: Freischaltung über Meilensteine und Begegnungen
function getUnlockedChars(){
  const fromC=(C&&Array.isArray(C.unlockedChars))?C.unlockedChars:[];
  const merged=Array.from(new Set([...unlockedChars,...fromC])).filter(k=>LEGEND_KEYS.includes(k));
  unlockedChars=merged;
  return merged;
}

function isCharUnlocked(id){
  if(!DIRS[id])return false;
  return getUnlockedChars().includes(id);
}

function unlockChar(id){
  if(!DIRS[id])return false;
  const list=getUnlockedChars();
  const isNew=!list.includes(id);
  if(isNew)list.push(id);
  unlockedChars=list;
  if(C){
    C.unlockedChars=Array.from(new Set([...(C.unlockedChars||[]),...list]));
  }
  try{localStorage.setItem(STORAGE_UNLOCKED_KEY,JSON.stringify(unlockedChars))}catch(e){}
  return isNew;
}

function encodeSaveString(obj){
  try{
    const json=JSON.stringify(obj);
    const b64=btoa(unescape(encodeURIComponent(json)));
    return 'W100-'+b64;
  }catch(e){return ''}
}

function decodeSaveString(str){
  try{
    const clean=String(str||'').trim().replace(/^W(20|100)-/i,'');
    const json=decodeURIComponent(escape(atob(clean)));
    const parsed=JSON.parse(json);
    if(parsed&&typeof parsed==='object'&&('C' in parsed||'studio' in parsed))return parsed;
    return null;
  }catch(e){return null}
}

function normalizeCareer(c){
  if(!c||!c.studio)return c;
  if(Array.isArray(c.studio.staff)){
    c.studio.staff=c.studio.staff.map(item=>{
      if(typeof item==='string'){
        const pool=LEAD_NAMES[item]||['Alex Novotny'];
        return {
          id:item,
          personName:pool[Math.floor(Math.random()*pool.length)],
          level:1,
          xp:0,
          sal:STAFF[item]?STAFF[item].sal:2,
          loyalty:7,
          tenure:0
        };
      }
      return {
        id:item.id,
        personName:item.personName||(LEAD_NAMES[item.id]?.[0]||'Lead'),
        level:item.level||1,
        xp:item.xp||0,
        sal:item.sal||(STAFF[item.id]?STAFF[item.id].sal:2),
        loyalty:item.loyalty??7,
        tenure:item.tenure||0,
        img:item.img||null,
        isScene:!!item.isScene,
        isLegend:!!item.isLegend,
        legendId:item.legendId||null
      };
    });
  }else{
    c.studio.staff=[];
  }
  if(c.studio.salaryDrift===undefined)c.studio.salaryDrift=0;
  if(c.studio.overheadDrift===undefined)c.studio.overheadDrift=0;
  if(!c.studio.exStaff)c.studio.exStaff=[];
  if(c.dir&&c.dir.id&&DIRS[c.dir.id]&&!c.dir.img){
    c.dir.img=DIRS[c.dir.id].img;
    c.dir.isScene=!!DIRS[c.dir.id].isScene;
  }
  if(Array.isArray(c.unlockedChars)){
    c.unlockedChars.forEach(k=>{if(!unlockedChars.includes(k))unlockedChars.push(k)});
  }
  c.unlockedChars=getUnlockedChars();
  if(c.studio.engine&&typeof c.studio.engine==='object'){
    c.studio.engine.version=c.studio.engine.version||1;
    c.studio.engine.age=c.studio.engine.age||0;
    c.studio.engine.genres=c.studio.engine.genres||[];
    c.studio.engine.modules=c.studio.engine.modules||[];
    c.studio.engine.licenseMode=c.studio.engine.licenseMode||'none';
    c.studio.engine.techDebt=c.studio.engine.techDebt||0;
    if(c.studio.engine.techPts===undefined)c.studio.engine.techPts=1;
  }
  if(!c.known)c.known={inf:{},jour:{}};
  if(!c.known.inf)c.known.inf={};
  if(!c.known.jour)c.known.jour={};
  if(!c.trend){
    const keys=Object.keys(GENRES);
    c.trend={hot:keys[0],cold:keys[1],note:'Branchen-Beobachtung aktiv'};
  }
  dropUnknownGenres(c);
  return c;
}

// Spielstände mit alten Genre-Schlüsseln werden nicht übernommen: Unbekanntes fliegt raus
function dropUnknownGenres(c){
  const eng=c.studio?.engine;
  if(eng){
    eng.genres=(eng.genres||[]).filter(k=>GENRES[k]);
    if(eng.spec&&!GENRES[eng.spec])eng.spec=null;
  }
  if(c.trend&&(!GENRES[c.trend.hot]||!GENRES[c.trend.cold]))c.trend=null;
  if(c.dir?.aff)c.dir.aff=Object.fromEntries(Object.entries(c.dir.aff).filter(([k])=>GENRES[k]));
}

function _pressDefaults(s){
  if(!s.inf)s.inf=defaultInf();
  if(s.crunchN===undefined)s.crunchN=0;
  if(s.crisisSeen===undefined)s.crisisSeen=false;
  if(s.probeSeen===undefined)s.probeSeen=false;
}

function normalizeProject(s,c){
  // Laufendes Projekt aus der Zeit vor dem Schrittmodell: abbrechen, Restbudget erstatten
  if(s&&s.v!==2&&(s.end||['sales','end','over','launch'].includes(s.screen))){
    // Abgeschlossenes Altprojekt: nichts erstatten (Budget ist bereits in der Kasse), nur minimal migrieren
    s.v=2;s.durKey='normal';s.dur=refMonths(s.tier||'indie');
    if(!s.fund){s.fund=defaultFund();s.fund.pitched=true}
    if(!s.skip)s.skip=[];
    _pressDefaults(s);
    if(s.round>=12)s.round=STEPS.length;
    return s;
  }
  if(s&&s.v!==2){
    const refund=Math.max(0,s.res?.budget||0);
    if(c?.studio)c.studio.kasse=(c.studio.kasse||0)+refund;
    if(c)c.notice='Euer laufendes Projekt „'+(s.title||'Unbenannt')+'“ stammt aus einer älteren Version und wurde beendet. Das Restbudget ('+money(refund)+') ist zurück in der Studiokasse.';
    return null;
  }
  if(!s||!s.res)return s;
  _pressDefaults(s);
  if(!s.sprint)s.sprint=defaultSprint();
  if(s.contractStep==null)s.contractStep=-1;
  if(!s.skip)s.skip=[];
  if(!s.fund){
    s.fund=defaultFund();
    s.fund.pitched=s.round>stepIndex('pit_meet');
    s.fund.self=s.fund.pitched&&!s.publisher;
  }
  if(s.milestone){
    if(!s.milestone.at)s.milestone.at=s.milestone.month<=6?'prod_fp':'prod_beta';
    const at=({prod_fp:'fp',prod_beta:'beta'})[s.milestone.at]||s.milestone.at;
    if(!s.milestone.done&&!s.fund.deals.some(d=>d.id==='pub')){
      const reward=s.milestone.reward||0;
      s.fund.deals.push({id:'pub',total:reward,paid:0,rates:{[at]:reward},misses:0,status:'active',pend:null});
    }
    delete s.milestone;
  }
  if(s.round===stepIndex('pit_meet')&&!s.fund.pitched&&s.screen==='event')s.screen='pitch';
  if(!s.msDone)s.msDone=MILESTONES.filter(m=>stepIndex(m.at)<s.round).map(m=>m.id);
  if(s.msResult===undefined)s.msResult=null;
  if(s.res.gp===undefined)s.res.gp=s.res.qual||20;
  if(s.res.gfx===undefined)s.res.gfx=s.res.qual||20;
  if(s.res.snd===undefined)s.res.snd=Math.round((s.res.gp+s.res.gfx)/2);
  // Laufendes Projekt mit altem Genre verwerfen
  if(!(s.genre==null&&s.concept&&!s.concept.done)&&!subGenreOf(s.genre,s.subGenre))return null;
  return s;
}

function initStorage(){
  try{
    manual=localStorage.getItem(STORAGE_MANUAL_KEY)==='1';
    const rawUnl=localStorage.getItem(STORAGE_UNLOCKED_KEY);
    if(rawUnl){
      try{unlockedChars=JSON.parse(rawUnl)||[]}catch(e){unlockedChars=[]}
    }
    getUnlockedChars();
    const raw=localStorage.getItem(STORAGE_PROFILES_KEY);
    if(raw){
      profiles=JSON.parse(raw)||[];
    }
    if(!profiles.length){
      const old=JSON.parse(localStorage.getItem('w20v5')||'null');
      if(old&&(old.C||old.S)){
        const oldC=normalizeCareer(old.C);
        profiles.push({
          id:'slot_1',
          userName:old.C?.studio?.name||'Spieler 1',
          updatedAt:new Date().toISOString(),
          C:oldC,
          S:normalizeProject(old.S,oldC)
        });
      }else{
        profiles.push({
          id:'slot_1',
          userName:'Spieler 1',
          updatedAt:new Date().toISOString(),
          C:null,
          S:null
        });
      }
    }
    const savedActive=localStorage.getItem(STORAGE_ACTIVE_KEY);
    if(savedActive&&profiles.some(p=>p.id===savedActive)){
      activeSlotId=savedActive;
    }else{
      activeSlotId=profiles[0].id;
    }
    const cur=getActiveProfile();
    C=normalizeCareer(cur.C);
    cur.S=S=normalizeProject(cur.S,C);
    checkUrlImport();
  }catch(e){
    profiles=[{id:'slot_1',userName:'Spieler 1',updatedAt:new Date().toISOString(),C:null,S:null}];
    activeSlotId='slot_1';
  }
}

function getActiveProfile(){
  return profiles.find(p=>p.id===activeSlotId)||profiles[0];
}

function save(){
  try{
    const cur=getActiveProfile();
    if(cur){
      cur.C=C;
      cur.S=S;
      cur.updatedAt=new Date().toISOString();
    }
    localStorage.setItem(STORAGE_PROFILES_KEY,JSON.stringify(profiles));
    localStorage.setItem(STORAGE_ACTIVE_KEY,activeSlotId);
    localStorage.setItem(STORAGE_MANUAL_KEY,manual?'1':'0');
    localStorage.setItem(STORAGE_UNLOCKED_KEY,JSON.stringify(getUnlockedChars()));
    localStorage.setItem('w20v5',JSON.stringify({C,S}));
    if(typeof updateProfileButton==='function')updateProfileButton();
  }catch(e){}
}

function load(){
  initStorage();
}

function switchProfile(slotId){
  const target=profiles.find(p=>p.id===slotId);
  if(!target)return;
  activeSlotId=target.id;
  C=normalizeCareer(target.C);
  target.S=S=normalizeProject(target.S,C);
  save();
  render();
}

function createProfile(userName,initialC=null,initialS=null){
  const id='slot_'+Date.now()+'_'+Math.floor(Math.random()*1000);
  const name=(userName||'').trim()||('Spieler '+(profiles.length+1));
  const normalizedC=normalizeCareer(initialC);
  profiles.push({
    id,
    userName:name,
    updatedAt:new Date().toISOString(),
    C:normalizedC,
    S:normalizeProject(initialS,normalizedC)
  });
  switchProfile(id);
  return id;
}

function deleteProfile(slotId){
  if(profiles.length<=1){
    profiles[0].C=null;
    profiles[0].S=null;
    profiles[0].updatedAt=new Date().toISOString();
    C=null;S=null;
    save();render();
    return;
  }
  profiles=profiles.filter(p=>p.id!==slotId);
  if(activeSlotId===slotId){
    activeSlotId=profiles[0].id;
    C=normalizeCareer(profiles[0].C);
    profiles[0].S=S=normalizeProject(profiles[0].S,C);
  }
  save();render();
}

function checkUrlImport(){
  if(!location.hash||!location.hash.startsWith('#save='))return;
  const code=location.hash.slice(6);
  const data=decodeSaveString(code);
  history.replaceState(null,'',location.pathname+location.search);
  if(data&&('C' in data)){
    const uName=data.userName||(data.C?.studio?.name?data.C.studio.name+' (Import)':'Importierter Spielstand');
    createProfile(uName,data.C,data.S);
  }
}

/* ===================== Fortschritts-Export (Chronik & Backup) ===================== */
function generateChronicleText(){
  const p=getActiveProfile();
  if(!C){
    return `# Studio W100 — Spielstand (${p?.userName||'Unbekannt'})\nNoch keine aktive Karriere gestartet.`;
  }
  const st=C.studio;
  const d=C.dir;
  const eng=st.engine;
  const lines=[];
  lines.push(`# 🎲 STUDIO W100: GOLDSTATUS (Das Gamedev-RPG) — STUDIO-CHRONIK: ${st.name.toUpperCase()}`);
  lines.push(`Spieler-Profil: ${p?.userName||'Standard'} | Exportiert am: ${new Date().toLocaleDateString('de-DE')}`);
  lines.push('');
  lines.push(`## 🏢 Studio-Übersicht`);
  lines.push(`- **Studioname:** ${st.name}`);
  lines.push(`- **Studio-Fame:** ${st.fame}/100`);
  lines.push(`- **Studiokasse:** ${money(st.kasse)}`);
  lines.push(`- **Veröffentlichte Spiele:** ${C.hall.length}`);
  lines.push(`- **Gehaltsinflation:** +${Math.round((st.salaryDrift||0)*100)} % | **Infrastruktur-Stufe:** +${nf(perMonth(st.overheadDrift||0,S||{tier:'indie'}),1)}/Monat`);
  lines.push('');
  lines.push(`## 🎬 Game Director: ${d.n} (${d.tag})`);
  lines.push(`- **Werte:** ${dirStatLine(d.s)}`);
  lines.push(`- **Director-Fame:** ${d.fame}/100 | **Privatvermögen:** ${money(d.wealth)}`);
  if(d.perks.length)lines.push(`- **Vorteile:** ${d.perks.map(k=>PERKS[k]?.n||k).join(', ')}`);
  if(d.flaws.length)lines.push(`- **Macken:** ${d.flaws.map(k=>FLAWS[k]?.n||k).join(', ')}`);
  lines.push('');
  lines.push(`## ⚙️ Eigene Studio-Engine`);
  if(eng){
    const ageInfo=getEngineAgeInfo(eng.age||0);
    lines.push(`- **Name & Version:** ${eng.name} v${eng.version}.0 (${ageInfo.label})`);
    lines.push(`- **Gemeisterte Genres:** ${eng.genres.length?eng.genres.map(g=>GENRES[g]?.n||g).join(', '):'Noch keine'}`);
    lines.push(`- **Module:** ${eng.modules.length?eng.modules.map(m=>ENGINE_MODULES[m]?.n||m).join(', '):'Basis-Kern'}`);
    lines.push(`- **Lizenzmodell:** ${ENGINE_LIC_MODES[eng.licenseMode]?.n||'Intern'} | **Technische Schulden:** ${eng.techDebt||0}`);
  }else{
    lines.push(`- Noch keine eigene Studio-Engine entwickelt.`);
  }
  lines.push('');
  lines.push(`## 👥 Lead-Personal (${st.staff.length})`);
  if(st.staff.length){
    st.staff.forEach(m=>{
      const def=STAFF[m.id];
      lines.push(`- **${m.personName}** — ${def.n} (${STAFF_TITLES[(m.level||1)-1]} · St. ${m.level||1}, ${m.xp||0} XP) | Loyalität: ${m.loyalty}/10 | Gehaltfaktor: ${nf(m.sal,2)}× (${def.effDesc(m.level||1)})`);
    });
  }else{
    lines.push(`- Kein festes Lead-Personal angestellt.`);
  }
  lines.push('');
  lines.push(`## 🏆 Ruhmeshalle (${C.hall.length} Spiele)`);
  if(C.hall.length){
    C.hall.forEach(h=>{
      const subScores=(h.gp!=null&&h.gfx!=null)?` (Gameplay ${h.gp} / Grafik ${h.gfx})`:'';
      const aw=(h.awards&&h.awards.length)?` | 🏆 ${h.awards.join(', ')}`:'';
      lines.push(`${h.nr}. **${h.title}** (${h.genre} · ${h.tier}${h.engine?' · '+h.engine:''}) — Wertung: **${h.meta!=null?h.meta+'/100':'Abgebrochen'}**${subScores} | ${h.v} | Ergebnis: ${h.erg!=null?money(h.erg,true):'–'}${h.dlc?' | inkl. '+h.dlc:''}${aw}`);
    });
  }else{
    lines.push(`- Noch keine Spiele veröffentlicht.`);
  }
  if(S){
    lines.push('');
    lines.push(`## 🚧 Aktuelles Projekt in Entwicklung: „${S.title}“`);
    lines.push(`- **Genre & Klasse:** ${GENRES[S.genre]?.n||'Genre offen'} (${TIERS[S.tier]?.n}) | **Schritt:** ${Math.min(S.round+1,STEPS.length)}/${STEPS.length} (${S.round>=STEPS.length?'Release':PHASES[curStep(S).ph]})`);
    lines.push(`- **Status:** Budget ${money(S.res.budget)} | Gesamt-Qualität ${S.res.qual} (Gameplay ${S.res.gp} · Grafik ${S.res.gfx} · Sound ${S.res.snd??'–'}) | Bugs ${S.res.bugs} | Hype ${S.res.hype}/10 | Moral ${S.res.moral}/10 | Wishlists ${nf(S.res.wl,0)}`);
  }
  return lines.join('\n');
}

function downloadFile(filename,content,mime='text/plain;charset=utf-8'){
  const blob=new Blob([content],{type:mime});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url)},150);
}
