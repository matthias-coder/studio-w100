/* ===================== Multi-User Save System & Export (GitHub Pages / LocalStorage) ===================== */
const STORAGE_PROFILES_KEY='w20_profiles_v6';
const STORAGE_ACTIVE_KEY='w20_active_slot_v6';
const STORAGE_MANUAL_KEY='w20m';
const STORAGE_UNLOCKED_KEY='w100_unlocked_chars_v1';

let profiles=[];
let activeSlotId='slot_1';
let unlockedChars=[];

function getStarterChars(){
  return Object.keys(DIRS).filter(k=>DIRS[k].starter);
}

function getUnlockedChars(){
  const starters=getStarterChars();
  const fromC=(C&&Array.isArray(C.unlockedChars))?C.unlockedChars:[];
  const merged=Array.from(new Set([...starters,...unlockedChars,...fromC])).filter(k=>DIRS[k]);
  unlockedChars=merged;
  return merged;
}

function isCharUnlocked(id){
  if(!DIRS[id])return false;
  if(DIRS[id].starter)return true;
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
  if(!c.trend){
    const keys=Object.keys(GENRES);
    c.trend={hot:keys[0],cold:keys[1],note:'Branchen-Beobachtung aktiv'};
  }
  return c;
}

function normalizeProject(s){
  if(!s||!s.res)return s;
  if(s.res.gp===undefined)s.res.gp=s.res.qual||20;
  if(s.res.gfx===undefined)s.res.gfx=s.res.qual||20;
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
        profiles.push({
          id:'slot_1',
          userName:old.C?.studio?.name||'Spieler 1',
          updatedAt:new Date().toISOString(),
          C:normalizeCareer(old.C),
          S:normalizeProject(old.S)
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
    S=normalizeProject(cur.S);
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
  S=normalizeProject(target.S);
  save();
  render();
}

function createProfile(userName,initialC=null,initialS=null){
  const id='slot_'+Date.now()+'_'+Math.floor(Math.random()*1000);
  const name=(userName||'').trim()||('Spieler '+(profiles.length+1));
  profiles.push({
    id,
    userName:name,
    updatedAt:new Date().toISOString(),
    C:normalizeCareer(initialC),
    S:normalizeProject(initialS)
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
    S=normalizeProject(profiles[0].S);
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
  lines.push(`- **Gehaltsinflation:** +${Math.round((st.salaryDrift||0)*100)} % | **Infrastruktur-Stufe:** +${nf(st.overheadDrift||0,1)}/Monat`);
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
    lines.push(`- **Genre & Klasse:** ${GENRES[S.genre]?.n} (${TIERS[S.tier]?.n}) | **Monat:** ${Math.min(S.round+1,12)}/12`);
    lines.push(`- **Status:** Budget ${money(S.res.budget)} | Gesamt-Qualität ${S.res.qual} (Gameplay ${S.res.gp} · Grafik ${S.res.gfx}) | Bugs ${S.res.bugs} | Hype ${S.res.hype}/10 | Moral ${S.res.moral}/10 | Wishlists ${nf(S.res.wl,0)}`);
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
