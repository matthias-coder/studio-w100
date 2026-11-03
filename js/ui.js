/* ===================== Darstellung & UI (W100 Command Center für Tablet & Desktop) ===================== */
let wsTab='board';
let dockTab='plan';

function dieSVG(n,cls=''){
  return `<svg class="d20 ${cls}" viewBox="0 0 100 100" aria-hidden="true"><polygon class="face" points="50,4 90,27 90,73 50,96 10,73 10,27"/><polygon points="50,24 78,66 22,66"/><line x1="50" y1="24" x2="50" y2="4"/><line x1="50" y1="24" x2="10" y2="27"/><line x1="50" y1="24" x2="90" y2="27"/><line x1="22" y1="66" x2="10" y2="27"/><line x1="22" y1="66" x2="10" y2="73"/><line x1="22" y1="66" x2="50" y2="96"/><line x1="78" y1="66" x2="90" y2="27"/><line x1="78" y1="66" x2="90" y2="73"/><line x1="78" y1="66" x2="50" y2="96"/><text x="50" y="50">${n}</text></svg>`;
}

const ACTIVE=['event','mand','lang','result','random','shop','crisis','roll','manual'];

/* ===================== Sticky HUD & Phasen-Track ===================== */
function renderHud(){
  const h=$('hud');
  if(!h)return;
  if(!S||!ACTIVE.concat(['launch']).includes(S.screen)){h.hidden=true;return}
  h.hidden=false;
  recalcQual();
  const r=S.res,rw=runway(),left=12-S.round;
  const crit=rw<1,low=rw<=3&&rw<left;
  h.classList.toggle('alarm',crit||r.budget<0);
  const bar=(pct,col)=>`<div class="hud-bar"><i style="width:${clamp(pct,0,100)}%;background:${col}"></i></div>`;
  const cell=(l,v,w,sub,barHtml='')=>`<div class="${w?'warn':''}"><span class="label">${l}</span><b>${v}</b>${sub?`<small>${sub}</small>`:''}${barHtml}</div>`;
  const moralCol=r.moral>=7?'var(--good)':r.moral>=4?'var(--gold)':'var(--bad)';
  h.innerHTML=`<div class="money ${crit||low||r.budget<0?'warn':''}"><span class="label">Restbudget</span><b>${money(r.budget)}</b><small>${money(monthSum())}/Monat · ${r.budget<0?'im Minus':rw>=left?'reicht bis Release':rw<1?'reicht < 1 Monat':'reicht '+rw+' Mon.'}</small></div>`
   +cell('Moral',r.moral+'/10',r.moral<=2,`${fmt(moralMod())} auf Würfe`,bar(r.moral*10,moralCol))
   +cell('Hype',r.hype+'/10',false,C?.trend?.hot===S.genre?'🔥 Trend-Genre':'',bar(r.hype*10,'var(--accent)'))
   +cell('Qualität',r.qual,false,`GP ${r.gp} · GFX ${r.gfx}`,bar(r.qual,'var(--good)'))
   +cell('Bugs',r.bugs,r.bugs>=15,r.bugs>=15?'Kritisch hoch':'Bekannte Fehler',bar(Math.min(100,r.bugs*4),r.bugs>=15?'var(--bad)':'var(--warn)'))
   +cell('Wishlists',nf(r.wl,0),false,S.ea?'Early Access aktiv':'Vorbesteller-Interesse')
   +cell('Zeit',r.zeit+' Mon.',r.zeit<0,S.round<12?'Monat '+(S.round+1)+'/12':'Release',bar((S.round/12)*100,'var(--c-pers)'));
}

function renderTrack(){
  const el=$('track');if(!el)return;
  if(!S){el.innerHTML='';return}
  const fin=['launch','sales','end'].includes(S.screen);
  const ph=Math.floor(Math.min(S.round,11)/2);
  el.innerHTML=PHASES.map((p,i)=>`<div class="${fin||i<ph?'done':i===ph?'now':''}">${i+1}. ${p}</div>`).join('');
}

function budgetAlert(){
  if(!S||S.res.budget<0)return '';
  const rw=runway(),left=12-S.round;
  if(rw>3||rw>=left)return '';
  const plan=Object.keys(PLAN).filter(k=>PLAN[k].cost[S.plan[k]]>0).map(k=>PLAN[k].n);
  const tip=plan.length?`Senke rechts im Budget-Dock ${plan.join(', ')}, nimm eine Auftragsarbeit an oder suche frisches Geld.`:'Der Budgetplan ist schon auf Minimum. Jetzt hilft eine Auftragsarbeit oder frisches Geld.';
  const btn=`<div class="row"><button class="btn small alt" id="finBtn">Jetzt Finanzierung suchen (+8 auf Würfe)</button></div>`;
  if(rw<1)return `<div class="alert" role="alert"><b>Achtung: Pleite droht</b><span>Mit ${money(S.res.budget)} könnt ihr den nächsten Monat (${money(monthSum())}) nicht mehr bezahlen. Am Monatsende kommt die Notlage. ${tip}</span>${btn}</div>`;
  return `<div class="alert ${rw>1?'mid':''}" role="status"><b>Das Geld wird knapp</b><span>Das Budget reicht nur noch für ${rw} Monat${rw>1?'e':''}, bis zum Release sind es noch ${left}. ${tip}</span>${btn}</div>`;
}
function bindFin(){const b=$('finBtn');if(b)b.onclick=()=>openCrisis('event')}

function spendBlock(){
  if(!S)return '';
  const tot=spendTotal();
  if(!tot)return `<p class="note" style="margin:0">Noch nichts ausgegeben. Kosten werden am Ende jedes Monats gebucht.</p>`;
  const keys=Object.keys(CAT).filter(k=>S.spend[k]>0);
  return `<div class="stack">${keys.map(k=>`<i style="width:${S.spend[k]/tot*100}%;background:var(${CAT[k][1]})" title="${CAT[k][0]}"></i>`).join('')}</div>
   <div class="legend">${keys.map(k=>`<div><s style="background:var(${CAT[k][1]})"></s><span>${CAT[k][0]}</span><span>${money(S.spend[k])}</span></div>`).join('')}<div><s></s><b>Gesamt</b><span><b>${money(tot)}</b></span></div></div>`;
}

function hallHTML(){
  if(!C||!C.hall.length)return '<p class="note" style="margin:0">Noch keine Spiele veröffentlicht.</p>';
  return `<div class="ledger"><table>${C.hall.map(h=>`<tr><td>${h.nr}. <b>${esc(h.title)}</b>${h.awards&&h.awards.length?` <span class="chip p">🏆 ${h.awards.length}× Award</span>`:''}<br><span class="note">${h.genre} · ${h.tier}${h.engine?' · '+esc(h.engine):''} · ${h.v}${h.dlc?' ('+esc(h.dlc)+')':''}</span></td><td>${h.meta!=null?`<b>${h.meta}</b> Pkt.${h.gp!=null?` <small class="note">(GP ${h.gp}/GFX ${h.gfx})</small>`:''}`:'–'}<br><span class="${h.erg>=0?'pos':'neg'}">${h.erg!=null?money(h.erg,true):''}</span></td></tr>`).join('')}</table></div>`;
}

function engineBlock(){
  if(!C||!C.studio.engine)return `<div class="blk"><span class="label">Eigene Studio-Engine</span><p class="note" style="margin:0">Noch keine eigene Engine gebaut. In Monat 2 eines Projekts könnt ihr eine eigene Studio-Engine entwickeln.</p></div>`;
  const eng=C.studio.engine;
  const ageInfo=getEngineAgeInfo(eng.age||0);
  const sc=S?T().scale:(C.studio.tier?TIERS[C.studio.tier].scale:1);
  return `<div class="blk">
    <span class="label">Eigene Studio-Engine</span>
    <div class="eng-box">
      <div class="eng-head">
        <b>${esc(eng.name)}</b>
        <span class="eng-ver">v${eng.version}.0</span>
      </div>
      <div class="chips">
        <span class="chip ${ageInfo.cls}">${ageInfo.label}</span>
        <span class="chip ${(eng.techPts||0)>0?'p':''}">🔬 ${eng.techPts||0} Forschungspkt.</span>
        ${eng.techDebt?`<span class="chip n">Tech-Schulden: ${eng.techDebt}</span>`:'<span class="chip p">Code sauber</span>'}
      </div>
      <div class="note">${ageInfo.desc} (Start-Effekt: ${fmt(ageInfo.gfx)} Grafik, ${fmt(ageInfo.gp)} Gameplay${ageInfo.rev?`, ${fmt(ageInfo.rev)} Kritiker`:''})</div>
      <div class="mini">
        <div><span>Gemeisterte Genres</span><span>${eng.genres.length?eng.genres.map(g=>GENRES[g]?.n||g).join(', '):'–'}</span></div>
        <div><span>Aktive Module</span><span>${eng.modules.length}/8 freigeschaltet</span></div>
      </div>
      <div class="field" style="margin-top:4px">
        <label class="label" for="engLicSel">Externe Lizenzierung</label>
        <select id="engLicSel">
          ${Object.entries(ENGINE_LIC_MODES).map(([k,v])=>`<option value="${k}" ${eng.licenseMode===k?'selected':''}>${v.n}${v.inc?` (+${money(Math.round(v.inc*eng.version*sc*ageInfo.licMult*10)/10)}/M)`:''}</option>`).join('')}
        </select>
        <span class="note">${ENGINE_LIC_MODES[eng.licenseMode]?.d||''}</span>
      </div>
      <button type="button" class="btn tiny ghost" data-goto-ws="engine">⚙️ Zum Engine-Tech-Tree (${eng.modules.length}/8)</button>
    </div>
  </div>`;
}

function staffBlock(){
  if(!C)return '';
  const list=C.studio.staff||[];
  if(!list.length)return `<div class="blk"><span class="label">Lead-Personal (0/6)</span><p class="note" style="margin:0">Noch keine Leads eingestellt. Im Reiter „🛒 Shop & Aufträge“ kannst du Spezialisten anwerben, die bis Stufe 5 aufsteigen.</p></div>`;
  const sc=S?T().scale:(C.studio.tier?TIERS[C.studio.tier].scale:1);
  const canAct=S&&['event','shop'].includes(S.screen);
  return `<div class="blk">
    <span class="label">Lead-Personal (${list.length}/6)</span>
    <div class="staff-list">
      ${list.map(st=>{
        const def=STAFF[st.id];
        const lv=st.level||1;
        const nextXp=STAFF_XP_THRESH[lv]||null;
        const loy=st.loyalty??7;
        const risk=loy<=3?'risk':loy<=4?'warn':'';
        const loyColor=loy>=7?'var(--good)':loy>=4?'var(--warn)':'var(--bad)';
        const bonusCost=Math.round(st.sal*1.5*sc*10)/10;
        return `<div class="staff-card ${risk}">
          <div class="staff-top">
            <b>${esc(st.personName)}</b>
            <span class="staff-lvl">St. ${lv} · ${STAFF_TITLES[lv-1]}</span>
          </div>
          <div class="note">${def.n} · ${def.effDesc(lv)}</div>
          <div class="mini">
            <div><span>Erfahrung</span><span>${st.xp||0}${nextXp?' / '+nextXp+' XP':' XP (Max)'}</span></div>
            <div><span>Gehalt</span><span>${money(st.sal*sc)}/Monat</span></div>
            <div><span>Loyalität</span><span class="${loy<=3?'neg':loy>=7?'pos':''}">${loy}/10 ${loy<=3?'(Abwanderungsgefahr!)':''}</span></div>
          </div>
          <div class="loy-bar"><i style="width:${loy*10}%;background:${loyColor}"></i></div>
          ${canAct&&loy<10?`<div class="row" style="margin-top:4px">
            <button type="button" class="btn tiny alt" data-dock-bonus="${st.id}" ${S.res.budget<bonusCost?'disabled':''}>Bonus ${money(bonusCost)} (+2 Loy.)</button>
            <button type="button" class="btn tiny ghost" data-dock-raise="${st.id}">Gehalt +20% (+3 Loy.)</button>
          </div>`:''}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function dirBlock(){
  const d=D();
  return `<div class="blk"><span class="label">Game Director</span><div><b>${esc(d.n)}</b> <span class="note">${esc(d.tag)}</span></div>
    <div class="note">${dirStatLine(d.s)}</div>
    <div class="mini"><div><span>Fame</span><span>${C.dir.fame}/100</span></div><div><span>Privatkonto</span><span>${money(C.dir.wealth)}</span></div><div><span>Fertige Spiele</span><span>${C.dir.games}</span></div></div>
    <div class="traits">${d.perks.map(p=>`<div><b class="p">+ ${PERKS[p].n}</b><span>${PERKS[p].d}</span></div>`).join('')}${d.flaws.map(f=>`<div><b class="n">− ${FLAWS[f].n}</b><span>${FLAWS[f].d}</span></div>`).join('')}${S&&S.aff?`<div><b class="${S.aff>0?'p':'n'}">${S.aff>0?'+':'−'} Genre</b><span>${S.aff>0?'Liegt ihm':'Liegt ihm nicht'}: ${fmt(Math.sign(S.aff)*4+(hasP('spezial')&&S.aff>0?3:0))} auf alle Würfe</span></div>`:''}${S&&S.promises?`<div><b class="n">− Versprechen</b><span>${S.promises} offen, kostet ${2*S.promises} Wertungspunkte</span></div>`:''}</div>
    ${S&&d.ab?`<div class="row"><button class="btn small ${S.abUsed?'ghost':'alt'}" id="abBtn" ${abilityReady()?'':'disabled'}>${S.abUsed?'Eingesetzt: ':''}${ABIL[d.ab].n}</button></div><span class="note">${ABIL[d.ab].d}${S.abUsed?'':d.ab==='reroll'?' Verfügbar nach einem Fehlschlag.':' Einmal pro Spiel.'}</span>`:''}
    ${S&&C.dir.wealth>0&&ACTIVE.includes(S.screen)&&!['roll','manual'].includes(S.screen)?`<div class="row"><button class="btn small ghost" id="privBtn">Privatgeld zuschießen</button></div>`:''}</div>`;
}

function milestoneBlock(){
  if(!S)return '';
  ensureMilestone();
  const ms=S.milestone;
  if(!ms)return '';
  return `<div class="blk">
    <span class="label">Publisher- & Projekt-Meilenstein</span>
    <div class="ms-box">
      <div class="ms-top">
        <b>${esc(ms.label)}</b>
        <span class="chip ${ms.done?'p':''}">${ms.done?'Erreicht ✓':'Monat '+ms.month}</span>
      </div>
      <div class="note">Ziel bis Ende Monat ${ms.month}: <b>${esc(ms.desc)}</b></div>
      <div class="mini">
        <div><span>Prämie bei Erfolg</span><span class="pos">+${money(ms.reward)} & +1 Moral</span></div>
      </div>
    </div>
  </div>`;
}

function trendBlock(){
  if(!C||!C.trend)return '';
  const tr=C.trend;
  const hotG=GENRES[tr.hot]?.n||tr.hot;
  const coldG=GENRES[tr.cold]?.n||tr.cold;
  return `<div class="blk">
    <span class="label">Aktueller Markt-Trend</span>
    <div class="chips">
      <span class="chip p">🔥 Boom: ${hotG} (+25 % Verkäufe)</span>
      <span class="chip n">❄️ Übersättigt: ${coldG} (−15 % Verkäufe)</span>
    </div>
    <span class="note">${esc(tr.note||'Die Vorlieben der Spieler wandeln sich mit jedem Projekt.')}</span>
  </div>`;
}

/* ===================== Linke Spalte: Projekt- & Studio-Bogen (#sheet) ===================== */
function bindSheetEvents(sh){
  const ab=$('abBtn');if(ab)ab.onclick=useAbility;
  const pb=$('privBtn');if(pb)pb.onclick=privatZuschuss;
  sh.querySelectorAll('[data-xp]').forEach(b=>b.onclick=()=>{if(C.dir.xp<=0)return;const k=b.dataset.xp;if(C.dir.s[k]>=4)return;C.dir.s[k]++;C.dir.xp--;renderSheet();save()});
  sh.querySelectorAll('[data-perk]').forEach(b=>b.onclick=()=>{C.dir.perks.push(b.dataset.perk);C.dir.perkUnlocked=true;renderSheet();save()});
  sh.querySelectorAll('[data-goto-ws]').forEach(b=>b.onclick=()=>{wsTab=b.dataset.gotoWs;render()});
}

function renderSheet(){
  const sh=$('sheet');
  if(!sh)return;
  if(!S){
    if(!C){
      sh.innerHTML=`<h2>So läuft Studio W100</h2>
      <p class="note" style="margin:0">Ihr gründet ein Spielestudio und wählt einen Game Director. Jedes Spiel dauert zwölf Monate in sechs Phasen. Entscheidungen werden mit einem <b>W100</b> (1–100) plus Studiowert gegen einen Schwierigkeitsgrad (SG) gewürfelt. 96–100 ist ein kritischer Erfolg, 1–5 ein Patzer.</p>
      <div class="blk"><span class="label">Gameplay & Grafik</span><p class="note" style="margin:0">Eure Qualität setzt sich aus <b>Gameplay</b> (Design & Spielspaß) und <b>Grafik</b> (Technik & Präsentation) zusammen — je nach Genre und Klasse unterschiedlich gewichtet.</p></div>
      <div class="blk"><span class="label">Eigene Engine & Tech-Tree</span><p class="note" style="margin:0">Baut ihr eine eigene Engine, schaltet ihr im <b>Engine-Labor</b> bis zu 8 Spezial-Module frei und lizenziert sie an andere Studios. Doch Vorsicht: Ohne Generations-Upgrades veraltet sie nach einigen Spielen!</p></div>
      <div class="blk"><span class="label">Rivalen, Trends & GOTY-Awards</span><p class="note" style="margin:0">Beobachtet den Markt-Trend, messt euch bei den jährlichen <b>Game of the Year Awards</b> mit 5 KI-Rivalen — und haltet euer Lead-Personal bei Laune, sonst gründen Abwanderer ihr eigenes Konkurrenz-Studio!</p></div>`;
      return;
    }
    const d=D();
    sh.innerHTML=`<div><div class="label">Studio-Zentrale</div><h2>${esc(C.studio.name)}</h2></div>
      <div class="mini">
        <div><span>Studio-Fame</span><span>${C.studio.fame}/100</span></div>
        <div><span>Studiokasse</span><span class="${C.studio.kasse<0?'neg':''}">${money(C.studio.kasse)}</span></div>
        <div><span>Gehaltsspirale</span><span class="${(C.studio.salaryDrift||0)>0.2?'wrn':''}">+${Math.round((C.studio.salaryDrift||0)*100)} %</span></div>
        <div><span>Infrastruktur-Overhead</span><span>+${nf(C.studio.overheadDrift||0,1)}× Basis/M</span></div>
      </div>
      ${trendBlock()}
      ${dirBlock()}
      ${C.dir.xp>0?`<div class="blk"><span class="label">Erfahrung: ${C.dir.xp} Punkt${C.dir.xp>1?'e':''} verteilen</span>${Object.entries(DSTAT).map(([k,[n]])=>`<div class="bstat"><b>${n}</b><div class="step"><span>${d.s[k]}</span><button type="button" data-xp="${k}" aria-label="${n} erhöhen" ${d.s[k]>=4?'disabled':''}>+</button></div></div>`).join('')}</div>`:''}
      ${C.dir.games>=3&&!C.dir.perkUnlocked?`<div class="blk"><span class="label">Neuer Vorteil freischaltbar</span>${Object.entries(PERKS).filter(([k])=>!d.perks.includes(k)).map(([k,p])=>`<button class="opt" data-perk="${k}"><span class="t">${p.n}</span><span class="d">${p.d}</span></button>`).join('')}</div>`:''}
      <div class="blk"><span class="label">Ruhmeshalle (${C.hall.length})</span>${hallHTML()}</div>`;
    bindSheetEvents(sh);
    return;
  }

  recalcQual();
  const t=T();
  const wGfx=Math.round(gfxWeight()*100);
  const wGp=100-wGfx;
  sh.innerHTML=`<div>
      <div class="label">${t.n} · ${MODELS[S.model].n} · ${S.seq?'Fortsetzung':IPS[S.ip].n}</div>
      <h2>${esc(S.title)}</h2>
      <div class="note">${esc(C.studio.name)} · ${GENRES[S.genre].n} · ${t.team} Leute${C.studio.staff.length?' + '+C.studio.staff.length+' Leads':''}${S.mods?' · Mod-Support':''}${S.ea?' · Early Access':''}${S.model==='f2p'?` · ${clamp(4+S.payers,1,12)} % Zahlende`:''}</div>
      <div class="note">${[S.engine&&'Engine: '+(S.engine==='eigen'?(C.studio.engine?.name||'Eigenbau'):ENGINE_DEFS[S.engine]?.short),S.world&&'Welt: '+{open:'Open World',hub:'Hubs',level:'Level',schlauch:'Schlauch'}[S.world],S.plat&&'Plattform: '+{pc:'PC',konsole:'PC + Konsolen',exklusiv:'PlayStatus exklusiv',alle:'Überall'}[S.plat],S.age!=null&&'USK '+S.age].filter(Boolean).join(' · ')}</div>
    </div>
    <div class="qual-split">
      <div class="qual-split-head">
        <span style="color:var(--c-pers)">🎮 Gameplay: ${S.res.gp} (${wGp} %)</span>
        <span>Ø ${S.res.qual}</span>
        <span style="color:var(--c-tools)">🎨 Grafik: ${S.res.gfx} (${wGfx} %)</span>
      </div>
      <div class="qual-split-bar">
        <i class="gp" style="width:${clamp(S.res.gp,5,100)}%"></i>
        <i class="gfx" style="width:${clamp(S.res.gfx,5,100)}%"></i>
      </div>
    </div>
    <div class="stats">${Object.keys(STATS).map(k=>`<div class="stat"><b>${fmt(modFor(k)).replace('±','+')}</b><span>${STATS[k]}</span></div>`).join('')}</div>
    <div class="insp"><span class="label">Inspiration</span>${[0,1,2].map(i=>`<span class="pip ${i<S.insp?'on':''}"></span>`).join('')}<span class="note">Moral-Bonus ${fmt(moralMod())}</span></div>
    ${milestoneBlock()}
    ${trendBlock()}
    ${dirBlock()}`;
  bindSheetEvents(sh);
}

/* ===================== Rechte Spalte: Management-Dock (#dock) ===================== */
function renderDock(){
  const dk=$('dock');
  const legacyLog=$('log');
  if(legacyLog&&!dk){
    legacyLog.innerHTML=(S&&S.log.length?S.log:[]).map(l=>`<li>${l}</li>`).join('')||'<li class="note">Noch keine Würfe.</li>';
    return;
  }
  if(!dk)return;

  if(!C){
    dk.innerHTML=`<div class="blk">
      <span class="label">W100-Würfelsystem</span>
      <p class="note" style="margin:0">In <b>Studio W100</b> wird jede riskante Entscheidung prozentgenau mit einem 100-seitigen Würfel (1–100) ausgewürfelt.</p>
      <div class="mini">
        <div><span>Kritischer Erfolg</span><span class="pos">96–100 (+1 Insp. & Lead-XP)</span></div>
        <div><span>Kritischer Patzer</span><span class="neg">1–5 (Zusatzschaden)</span></div>
        <div><span>Inspiration</span><span>2× W100 (besseres Ergebnis)</span></div>
      </div>
    </div>
    <div class="blk">
      <span class="label">Branchen-Rivalen</span>
      <div class="note">Ihr tretet gegen 5 namhafte Studios um die jährlichen <b>Game of the Year Awards</b> an:</div>
      <div class="mini">
        ${BASE_RIVALS.map(r=>`<div><span><b>${esc(r.name)}</b></span><span>${GENRES[r.fav]?.n||r.fav}</span></div>`).join('')}
      </div>
    </div>`;
    return;
  }

  const editable=S&&['event','mand','lang','random','result','shop','crisis'].includes(S.screen);
  const t=S?T():(C.studio.tier?TIERS[C.studio.tier]:TIERS.indie);
  const logCount=S&&S.log?S.log.length:0;

  dk.innerHTML=`
    <div class="dock-tabs" role="tablist" aria-label="Studio-Management">
      <button type="button" class="dock-tab ${dockTab==='plan'?'active':''}" data-dtab="plan">💰 Budget</button>
      <button type="button" class="dock-tab ${dockTab==='team'?'active':''}" data-dtab="team">👥 Leads (${C.studio.staff.length})</button>
      <button type="button" class="dock-tab ${dockTab==='log'?'active':''}" data-dtab="log">🎲 Log (${logCount})</button>
    </div>
    ${dockTab==='plan'?`
      ${S?`
        <div class="blk"><span class="label">Budgetplan pro Monat</span>
          <div class="plan">${Object.entries(PLAN).map(([k,p])=>`<div class="prow"><span class="pn">${p.n}</span><div class="seg" role="group" aria-label="${p.n}">${p.lv.map((l,i)=>`<button type="button" data-pk="${k}" data-pl="${i}" aria-pressed="${S.plan[k]===i}" ${editable?'':'disabled'}>${l}</button>`).join('')}</div><span class="pd">${p.d} · ${money(p.cost[S.plan[k]]*t.scale,true)}</span></div>`).join('')}</div>
          <div class="legend">${monthLines().map(([c,v])=>`<div><s style="background:var(${CAT[c][1]})"></s><span>${CAT[c][0]}</span><span>${money(v)}</span></div>`).join('')}</div>
          <div class="burn"><span>Kosten pro Monat</span><span>${money(monthSum())}</span></div>
        </div>
        <div class="blk"><span class="label">Bisher ausgegeben</span>${spendBlock()}${S.income?`<div class="burn"><span>Vorab- & Auftrags-Einnahmen</span><span class="pos">${money(S.income,true)}</span></div>`:''}${S.loan?`<div class="burn"><span>Kredit offen</span><span class="neg">${money(S.loan)}</span></div>`:''}${S.recoup?`<div class="burn"><span>Vorschüsse zu verrechnen</span><span>${money(S.recoup)}</span></div>`:''}</div>
      `:`
        <div class="blk">
          <span class="label">Finanz-Status vor Projektstart</span>
          <div class="mini">
            <div><span>Verfügbare Studiokasse</span><b>${money(C.studio.kasse)}</b></div>
            <div><span>Gehaltsinflation</span><span>+${Math.round((C.studio.salaryDrift||0)*100)} %</span></div>
            <div><span>Infrastruktur-Stufe</span><span>+${nf(C.studio.overheadDrift||0,1)}× Basis</span></div>
            <div><span>Aktive Leads</span><span>${C.studio.staff.length} / 6</span></div>
          </div>
          <p class="note" style="margin:0">Sobald das neue Projekt startet, steuerst du hier die monatlichen Ausgaben für Personal, Überstunden, Büro, Tools, QA, Marketing und Community.</p>
        </div>
        ${engineBlock()}
      `}
    `:dockTab==='team'?`
      ${engineBlock()}
      ${staffBlock()}
    `:`
      <div class="blk">
        <span class="label">Live-Würfelprotokoll (W100)</span>
        <ol class="dock-log" id="log">${(S&&S.log.length?S.log:[]).map(l=>`<li>${l}</li>`).join('')||'<li class="note">Noch keine Würfe in diesem Projekt.</li>'}</ol>
      </div>
    `}
  `;

  dk.querySelectorAll('[data-dtab]').forEach(b=>b.onclick=()=>{dockTab=b.dataset.dtab;renderDock()});
  dk.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>{S.plan[b.dataset.pk]=+b.dataset.pl;renderDock();renderHud();if(S.screen==='event')renderMain();save()});
  const engSel=$('engLicSel');if(engSel)engSel.onchange=e=>setEngineLicense(e.target.value);
  dk.querySelectorAll('[data-goto-ws]').forEach(b=>b.onclick=()=>{wsTab=b.dataset.gotoWs;render()});
  dk.querySelectorAll('[data-dock-bonus]').forEach(b=>b.onclick=()=>rewardStaff(b.dataset.dockBonus,'bonus'));
  dk.querySelectorAll('[data-dock-raise]').forEach(b=>b.onclick=()=>rewardStaff(b.dataset.dockRaise,'raise'));
}

/* ===================== Mittlere Spalte: Workspace-Navigation (#wsNav) ===================== */
function renderWsNav(){
  const nav=$('wsNav');
  if(!nav)return;
  if(!C){nav.hidden=true;return}
  nav.hidden=false;

  // Wenn ein modaler/erzwungener Screen läuft (Wurf, Notlage, Release), halten wir die Tabs informativ, erlauben aber den Wechsel zu Engine/Liga zur Einsicht
  const inShop=S&&S.screen==='shop';
  const activeTab=inShop&&wsTab==='board'?'shop':wsTab;
  const eng=C.studio.engine;
  const tpBadge=eng&&(eng.techPts||0)>0?`<span class="ws-badge">${eng.techPts}</span>`:'';
  const staffBadge=C.studio.staff.length?`<span class="ws-badge">${C.studio.staff.length}/6</span>`:'';
  const rivalsCount=getAllRivals().length;

  nav.innerHTML=`
    <button type="button" class="ws-btn ${activeTab==='board'?'active':''}" data-wstab="board">
      🃏 ${S?`Spieltisch (M${Math.min(S.round+1,12)})`:'Neues Projekt'}
    </button>
    ${S&&['event','shop'].includes(S.screen)?`
      <button type="button" class="ws-btn ${activeTab==='shop'?'active':''}" data-wstab="shop">
        🛒 Shop, Leads & Aufträge ${staffBadge}
      </button>
    `:''}
    <button type="button" class="ws-btn ${activeTab==='engine'?'active':''}" data-wstab="engine">
      ⚙️ Engine-Labor ${tpBadge}
    </button>
    <button type="button" class="ws-btn ${activeTab==='league'?'active':''}" data-wstab="league">
      🏆 Liga & Rivalen <span class="ws-badge">${rivalsCount}</span>
    </button>
  `;

  nav.querySelectorAll('[data-wstab]').forEach(b=>b.onclick=()=>{
    const target=b.dataset.wstab;
    wsTab=target;
    if(S){
      if(target==='shop'&&S.screen==='event'){S.shopMsg=null;S.screen='shop'}
      else if(target==='board'&&S.screen==='shop'){S.shopMsg=null;S.screen='event'}
    }
    render();
  });
}

/* ===================== Engine-Labor (Interaktiver Tech-Tree) ===================== */
function renderEngineLab(m){
  const eng=C.studio.engine;
  if(!eng){
    m.innerHTML=`<span class="stamp">⚙️ Engine-Labor</span>
      <h3>Noch keine eigene Studio-Engine</h3>
      <p>Euer Studio nutzt aktuell externe Engines (Unreal, Unity oder Godot). Sobald ihr in <b>Monat 2 eines Projekts</b> die Grundsatzentscheidung <b>„Eigene Engine im Haus bauen“</b> wählt, entsteht hier euer permanentes Engine-Forschungslabor!</p>
      <div class="alert mid">
        <b>Vorteile einer eigenen Studio-Engine</b>
        <span>• Schaltet bis zu <b>8 Spezial-Module</b> in 3 Technologie-Zweigen frei (Raytracing, KI-Sandbox, Rollback-Netcode, Auto-QA u.v.m.).<br>• Lizenziert eure Engine an andere Studios für monatliche Seat-Gebühren oder 5 % Umsatz-Royalties.<br>• Sammelt Genre-Routine (+5 Technik & +2 Gameplay für gemeisterte Genres).</span>
      </div>
      <div class="row"><button class="btn" id="backBoard">Zurück zum Spieltisch</button></div>`;
    $('backBoard').onclick=()=>{wsTab='board';render()};
    return;
  }

  const ageInfo=getEngineAgeInfo(eng.age||0);
  const sc=S?T().scale:(C.studio.tier?TIERS[C.studio.tier].scale:1);
  const ptCost=Math.round(14*sc);
  const cashAvail=S?S.res.budget:C.studio.kasse;
  const branches=['Grafik & Präsentation','Gameplay & Welt','Netzwerk & Pipeline'];

  m.innerHTML=`<span class="stamp">⚙️ Engine-Forschungslabor</span>
    <h3>${esc(eng.name)} <span class="eng-ver">v${eng.version}.0</span></h3>
    <p>Hier erforscht ihr permanente Architektur-Module für eure hauseigene Engine und steuert deren Lizenzierung. Jedes Generations-Upgrade in Monat 2 sowie ein gekaufter F&E-Sprint gewährt <b>+1 Forschungspunkt (🔬)</b>.</p>
    <div class="score">
      <div><span class="label">Zustand</span><b>${ageInfo.label}</b></div>
      <div><span class="label">Forschungspunkte</span><b>🔬 ${eng.techPts||0}</b></div>
      <div><span class="label">Aktive Module</span><b>${eng.modules.length} / 8</b></div>
      <div><span class="label">Tech-Schulden</span><b>${eng.techDebt||0}</b></div>
    </div>
    <div class="alert ${ageInfo.cls==='p'?'good':'mid'}">
      <b>Alterung & Leistung (${ageInfo.label})</b>
      <span>${ageInfo.desc} Start-Auswirkung bei neuen Spielen: <b>${fmt(ageInfo.gfx)} Grafik, ${fmt(ageInfo.gp)} Gameplay${ageInfo.rev?`, ${fmt(ageInfo.rev)} Kritiker`:''}</b>. Gemeisterte Genres: <b>${eng.genres.length?eng.genres.map(g=>GENRES[g]?.n||g).join(', '):'Noch keine'}</b>.</span>
      <div class="row">
        <button type="button" class="btn small alt" id="buyTechPtBtn" ${cashAvail<ptCost||eng.modules.length>=8?'disabled':''}>🔬 Forschungs-Sprint finanzieren (${money(ptCost)} → +1 Forschungspunkt)</button>
      </div>
    </div>
    ${branches.map(br=>`
      <div class="shopcat">
        <span class="label">Technologie-Zweig: ${br}</span>
        <div class="tech-grid">
          ${Object.entries(ENGINE_MODULES).filter(([,mod])=>mod.branch===br).map(([id,mod])=>{
            const unlocked=eng.modules.includes(id);
            const reqOk=!mod.req||eng.modules.includes(mod.req);
            const canUnlock=!unlocked&&reqOk&&(eng.techPts||0)>=(mod.costPts||1);
            return `<div class="tech-node ${unlocked?'unlocked':!reqOk?'locked':''}">
              <div class="tech-head">
                <b>${esc(mod.n)}</b>
                <span class="chip ${unlocked?'p':canUnlock?'':'n'}">${unlocked?'Aktiv ✓':mod.req&&!reqOk?`Benötigt: ${ENGINE_MODULES[mod.req]?.n}`:`${mod.costPts||1} 🔬 Punkt`}</span>
              </div>
              <span class="note">${esc(mod.d)}</span>
              ${!unlocked?`<div class="row" style="margin-top:4px">
                <button type="button" class="btn tiny ${canUnlock?'alt':'ghost'}" data-unlock-mod="${id}" ${canUnlock?'':'disabled'}>${canUnlock?'Jetzt freischalten (1 🔬)':!reqOk?'Vorstufe fehlt':'Forschungspunkt nötig'}</button>
              </div>`:''}
            </div>`;
          }).join('')}
        </div>
      </div>
    `).join('')}
    <div class="blk">
      <span class="label">Externe Lizenzierung & B2B-Geschäft</span>
      <div class="field">
        <select id="labLicSel">
          ${Object.entries(ENGINE_LIC_MODES).map(([k,v])=>`<option value="${k}" ${eng.licenseMode===k?'selected':''}>${v.n}${v.inc?` (+${money(Math.round(v.inc*eng.version*sc*ageInfo.licMult*10)/10)}/Monat)`:''}</option>`).join('')}
        </select>
        <span class="note">${ENGINE_LIC_MODES[eng.licenseMode]?.d||''}</span>
      </div>
    </div>
    <div class="row"><button class="btn" id="backBoard">Zurück zum Spieltisch</button></div>`;

  const buyBtn=$('buyTechPtBtn');
  if(buyBtn)buyBtn.onclick=()=>buyEngineResearchPoint();
  m.querySelectorAll('[data-unlock-mod]').forEach(b=>b.onclick=()=>unlockEngineModule(b.dataset.unlockMod));
  const licSel=$('labLicSel');
  if(licSel)licSel.onchange=e=>{setEngineLicense(e.target.value);renderEngineLab(m)};
  $('backBoard').onclick=()=>{wsTab='board';render()};
}

/* ===================== Liga, Rivalen & Branchen-Charts ===================== */
function renderLeagueView(m){
  const rivals=getAllRivals();
  const tr=C.trend||{hot:'rpg',cold:'sport',note:''};
  const lastAwards=C.lastAwards||[];

  m.innerHTML=`<span class="stamp">🏆 Branchen-Liga, Trends & Ruhmeshalle</span>
    <h3>Konkurrenz-Studios & Markt-Radar</h3>
    <p>Ihr teilt euch den Markt mit etablierten Rivalen — und mit ehemaligen Leads eures Studios, die nach einer Abwerbung ihre eigene Firma gegründet haben. Bei jedem Release werden die <b>Game of the Year Awards</b> vergeben!</p>

    <div class="alert mid">
      <b>Aktueller Markt-Trend der Saison</b>
      <span>🔥 <b>Boom-Genre: ${GENRES[tr.hot]?.n||tr.hot}</b> (+25 % Verkäufe & +1 Start-Hype) · ❄️ <b>Übersättigt: ${GENRES[tr.cold]?.n||tr.cold}</b> (−15 % Verkäufe).<br>${esc(tr.note||'')}</span>
    </div>

    ${lastAwards.length?`
      <div class="award-box">
        <span class="label">Letzte Game of the Year (GOTY) Verleihung</span>
        ${lastAwards.map(a=>`<div class="mini"><div><span><b>${esc(a.cat)}</b></span><span class="${a.won?'pos':''}">${esc(a.winner)} (${a.score} Pkt.) ${a.won?'🏆 EUER SIEG!':''}</span></div></div>`).join('')}
      </div>
    `:''}

    <div class="shopcat">
      <span class="label">Aktive Konkurrenz-Studios (${rivals.length})</span>
      <div class="rival-grid">
        ${rivals.map(r=>`<div class="rival-card ${r.exLead?'ex-lead':''}">
          <div class="staff-top">
            <b>${esc(r.name)}</b>
            <span class="chip ${r.exLead?'n':''}">${r.exLead?'Ex-Lead-Rivale!':'Basis-Wertung ~'+r.skill}</span>
          </div>
          <div class="note">${esc(r.tag)} · Spezialgebiet: <b>${GENRES[r.fav]?.n||r.fav}</b></div>
          ${r.lastTitle?`<div class="mini"><div><span>Letzter Release</span><span>„${esc(r.lastTitle)}“ (<b>${r.lastMeta}</b>/100)</span></div></div>`:'<div class="note">Arbeitet aktuell am nächsten Titel …</div>'}
        </div>`).join('')}
      </div>
    </div>

    <div class="shopcat">
      <span class="label">Eure Studio-Ruhmeshalle (${C.hall.length} veröffentlichte Spiele)</span>
      ${hallHTML()}
    </div>
    <div class="row"><button class="btn" id="backBoard">Zurück zum Spieltisch</button></div>`;

  $('backBoard').onclick=()=>{wsTab='board';render()};
}

/* ===================== Karten, Optionen & Entscheidungen ===================== */
function previewSafe(eff){
  const sc=T().scale;
  return Object.entries(eff).filter(([,v])=>v).map(([k,v])=>[k,k==='budget'?v*sc:k==='wl'?Math.round(v*1000*T().sales):v]);
}

function optHint(o){
  const hints=[];
  if(o.set&&o.set.world){
    const g=GENRES[S.genre];
    if(g.w.includes(o.set.world))hints.push('<span class="chip p">Welt passt zum Genre (+3 GP, +2 GFX)</span>');
    else if(g.bad.includes(o.set.world))hints.push('<span class="chip n">Welt passt nicht zum Genre (−4 GP, −2 GFX, +2 Bugs)</span>');
  }
  if(o.set&&o.set.engine){
    const engId=o.set.engine;
    if(engId==='eigen'&&C&&C.studio.engine){
      const age=o.set.engAction==='upgrade'?0:(C.studio.engine.age||0);
      const info=getEngineAgeInfo(age);
      hints.push(`<span class="chip ${info.cls}">${info.label}: ${fmt(info.gfx)} Grafik, ${fmt(info.gp)} Gameplay${o.set.engAction==='upgrade'?' (+1 🔬 Forschungspunkt)':''}</span>`);
    }else if(ENGINE_DEFS[engId]){
      const ed=ENGINE_DEFS[engId];
      if(ed.good.includes(S.genre))hints.push(`<span class="chip p">${ed.goodNote}</span>`);
      else if(ed.bad.includes(S.genre))hints.push(`<span class="chip n">${ed.badNote}</span>`);
    }
  }
  return hints.length?`<div class="chips">${hints.join('')}</div>`:'';
}

function optsHTML(card){
  return `<div class="opts">${card.o.map((o,i)=>{
    if(!optOk(o))return '';
    const target=o.safe?0:dc100(o.dc);
    const mod=o.safe?0:(optMod(o)+moralMod());
    const pct=o.safe?100:winChance(target,mod,S.adv&&S.insp>0);
    return `<button class="opt" data-i="${i}">
      <span class="t">${o.l}</span>
      ${o.safe?'<span class="check safe">ohne Wurf</span>':`<span class="check">${STATS[o.st]} · SG ${target} (${pct} %)</span>`}
      <span class="d">${o.sd?o.sd+' ':''}${o.safe?(o.sd?'':'Sicherer Weg mit festen Folgen.'):`Du brauchst ${target} oder mehr mit W100 ${fmt(mod)} (Erfolgschance: ${pct} %).`}</span>
      ${o.safe?chips(previewSafe(o.safe))+(o.safe.budget<0&&S.res.budget+o.safe.budget*T().scale<monthSum()?'<div class="chips"><span class="chip n">Danach reicht das Geld nicht für den nächsten Monat</span></div>':''):''}
      ${optHint(o)}
    </button>`;
  }).join('')}</div>
  <label class="advbox"><input type="checkbox" id="adv" ${S.adv?'checked':''} ${S.insp>0?'':'disabled'}> Inspiration einsetzen (2× W100 mit Vorteil würfeln)${S.insp>0?'':' · keine übrig'}</label>`;
}

function bindOpts(m){
  m.querySelectorAll('.opt[data-i]').forEach(b=>b.onclick=()=>choose(+b.dataset.i));
  const a=$('adv');if(a)a.onchange=()=>{S.adv=a.checked;renderMain();save()};
}

function monthNote(){
  if(!S.month||S.month.n!==S.round)return '';
  const M=S.month;
  const L={moral:'Moral',hype:'Hype',qual:'Qualität',gp:'Gameplay',gfx:'Grafik',bugs:'Bugs',zeit:'Zeit'};
  return `<div class="monthnote">Monat ${M.n} abgerechnet: ${money(M.sum)} Kosten${M.ea?' · '+money(M.ea,true)+' Early Access':''}${M.lic?' · '+money(M.lic,true)+' Engine-Lizenzen':''} · +${nf(M.wl,0)} Wishlists${M.pc.length?' · '+M.pc.map(([k,v])=>fmt(v)+' '+(L[k]||k)).join(' · '):''}${M.notes.length?' · '+M.notes.join(' · '):''}</div>`;
}

function headFor(kind,ev){
  if(kind==='card'){const c=E[ev];return monthNote()+`<span class="label">Monat ${S.round+1} von 12 · ${PHASES[c.p]}</span><h3>${c.t}</h3><p>${c.x}</p>`}
  if(kind==='mand'){const c=getMand(ev);return `<span class="stamp">Grundsatzentscheidung · Monat ${S.round+1}</span><h3>${c.t}</h3><p>${c.x}</p>`}
  if(kind==='rand'){const rv=R[ev];return `<span class="stamp">${rv.flaw?'Macke des Directors':'Zufallsereignis'} · Ende Monat ${S.round}</span><h3>${rv.t}</h3><p>${rv.x}</p>`}
  if(kind==='shop'){const it=SHOP.find(x=>x.id===ev);return `<span class="stamp">Studio-Shop</span><h3>${it.n}</h3><p>${it.d}</p>`}
  if(kind==='hire'){const s=STAFF[ev];return `<span class="stamp">Personal</span><h3>${s.n}</h3><p>${s.d}</p>`}
  if(kind==='contract'){const ct=CONTRACTS.find(x=>x.id===ev)||{n:'Auftragsarbeit',d:''};return `<span class="stamp">Auftragsarbeit</span><h3>${ct.n}</h3><p>${ct.d}</p>`}
  if(kind==='dlc'){const d=DLC_OPTS.find(x=>x.id===ev);return `<span class="stamp">Post-Release</span><h3>${d.n}</h3><p>${d.d}</p>`}
  const r=RESC.find(x=>x.id===ev);return `<span class="stamp">Notlage</span><h3>${r.n}</h3><p>${r.d}</p>`;
}

function manualForm(){
  const o=getOpt(S.pending);
  const target=dc100(o.dc);
  return `<p><b>${o.l}</b> · ${STATS[o.st]} · SG ${target} · Bonus ${fmt(optMod(o)+(o.bonusV||0)+moralMod())}</p><p class="note">Wirf deinen echten W100 (1–100)${S.pending.adv?' zweimal und trage den höheren Wert ein':''}.</p><form class="manual" id="mf"><input id="mIn" type="number" min="1" max="100" inputmode="numeric" required aria-label="Gewürfelte Zahl (1-100)"><button class="btn" type="submit">Eintragen</button></form>`;
}

function resultBlock(L){
  const dice=L.rolls.map(r=>dieSVG(r,(r===L.r&&r>=critMin()?'crit':r===L.r&&r<=fumbleMax?'fumble':'')+(L.rolls.length>1&&r!==L.r?' lo':''))).join('');
  return `<div class="tray"><div class="dice">${dice}</div><div class="calc"><span class="label">${L.l} (W100)</span><span class="big">${L.r} ${fmt(L.mod)} ${STATS[L.st]}${L.mm?` ${fmt(L.mm)} Moral`:''} = ${L.total}</span><span>gegen SG ${L.dc} (Krit ab ${critMin()}, Patzer 1–${fumbleMax})</span></div></div>
    <div class="verdict ${L.ok?'ok':'no'}">${L.crit?'Kritischer Erfolg!':L.fumble?'Patzer!':L.ok?'Erfolg':'Fehlschlag'}</div><p>${L.txt}${L.crit?' Das Team ist beflügelt (+1 Inspiration, Lead-XP).':L.fumble?' Und dabei ging noch mehr kaputt.':''}</p>${chips((L.pre||[]).concat(L.ch))}`;
}

function rerollBtn(){return abilityReady()?`<button class="btn alt" id="rr">${ABIL.reroll.n}: Wurf wiederholen</button>`:''}
function bindRR(){const b=$('rr');if(b)b.onclick=useAbility}

function renderMain(){
  const m=$('main');if(!m)return;
  m.className='card';

  // Wenn ein Spezial-Reiter (Engine-Labor oder Liga) ausgewählt ist, zeige diesen
  if(C&&wsTab==='engine'){renderEngineLab(m);return}
  if(C&&wsTab==='league'){renderLeagueView(m);return}

  if(!S){renderSetup(m);return}
  const sc=S.screen;
  if(sc==='event'){
    const ev=E[S.deck[S.round]];
    m.innerHTML=monthNote()+budgetAlert()+`<span class="label">Monat ${S.round+1} von 12 · ${PHASES[ev.p]}</span><h3>${ev.t}</h3><p>${ev.x}</p>`+optsHTML(ev)+`<div class="row"><button class="btn small ghost" id="shopBtn">🛒 Shop, Leads & Auftragsarbeiten (${C.studio.staff.length}/6 Leads)</button></div>`;
    bindOpts(m);bindFin();
    $('shopBtn').onclick=()=>{S.shopMsg=null;S.screen='shop';wsTab='shop';render();save()};
    return;
  }
  if(sc==='mand'){const c=getMand(S.mcur);m.innerHTML=headFor('mand',S.mcur)+optsHTML(c);bindOpts(m);return}
  if(sc==='lang'){renderLang(m);return}
  if(sc==='roll'){
    const p=S.pending;
    m.className='card'+(['rand','rescue'].includes(p.kind)?' rnd':'');
    m.innerHTML=headFor(p.kind,p.ev)+`<div class="tray"><div class="dice" id="dice">${Array.from({length:p.adv?2:1},()=>dieSVG('?')).join('')}</div><div class="calc"><span class="label">Der W100 rollt …</span></div></div>`;
    return;
  }
  if(sc==='manual'){
    const p=S.pending;
    m.innerHTML=headFor(p.kind,p.ev)+manualForm();
    $('mf').onsubmit=e=>{e.preventDefault();const v=+$('mIn').value;if(v>=1&&v<=100)resolve([v])};
    return;
  }
  if(sc==='result'){
    const L=S.last;
    m.className='card'+(['rand','rescue'].includes(L.kind)?' rnd':'');
    const body=L.safe?`<p><b>${L.l}</b></p><p>${L.txt||''}</p>${chips((L.pre||[]).concat(L.ch))||'<p class="note">Keine Änderungen.</p>'}`:resultBlock(L);
    const nx={card:'Monat abschließen',mand:'Weiter',rand:`Weiter zu Monat ${S.round+1}`,shop:'Zurück zum Shop',hire:'Zurück zum Shop',contract:'Zurück zum Shop',dlc:'Zurück zur Abrechnung',rescue:S.over?'Weiter':'Zurück zur Notlage'}[L.kind];
    m.innerHTML=headFor(L.kind,L.ev)+body+`<div class="row"><button class="btn" id="nx">${nx}</button>${rerollBtn()}</div>`;
    $('nx').onclick=()=>afterResult(L.kind);bindRR();
    return;
  }
  if(sc==='random'){
    m.className='card rnd';
    const rv=R[S.rnd];
    if(rv.eff){
      m.innerHTML=budgetAlert()+headFor('rand',S.rnd)+chips(S.rndCh)+`<button class="btn" id="nx">Weiter zu Monat ${S.round+1}</button>`;
      $('nx').onclick=afterRandom;bindFin();return;
    }
    const o=getOpt({kind:'rand',ev:S.rnd});
    const target=dc100(o.dc);
    const mod=optMod(o)+moralMod();
    const pct=winChance(target,mod,false);
    m.innerHTML=headFor('rand',S.rnd)+`<p><b>Rettungswurf:</b> ${STATS[o.st]} gegen SG ${target}. Du brauchst ${target} oder mehr mit W100 ${fmt(mod)} (Erfolgschance: ${pct} %).</p><button class="btn" id="go">W100 Rettungswurf</button>`;
    $('go').onclick=()=>{if(!rolling)startRoll({kind:'rand',ev:S.rnd,adv:false})};
    return;
  }
  if(sc==='shop'){renderShop(m);return}
  if(sc==='crisis'){renderCrisis(m);return}
  if(sc==='over'){renderOver(m);return}
  if(sc==='launch'){
    recalcQual();
    const wGfx=Math.round(gfxWeight()*100);
    m.innerHTML=`<span class="label">Release-Tag</span><h3>„${esc(S.title)}“ ist fertig. Mehr oder weniger.</h3>
      <p>Gesamt-Qualität <b>${S.res.qual}</b> (Gameplay <b>${S.res.gp}</b> [${100-wGfx} %] · Grafik <b>${S.res.gfx}</b> [${wGfx} %]), ${S.res.bugs} bekannte Bugs, Hype ${S.res.hype}/10, ${nf(S.res.wl,0)} Wishlists${S.res.zeit<0?`, und ihr seid ${-S.res.zeit} Monat(e) über dem Zeitplan`:''}. Jetzt entscheiden die Kritiker per W100.${S.promises?` Offene Versprechen: ${S.promises} (−${2*S.promises} Wertung).`:''}${S.works?' It just works: Die Bugs zählen diesmal nicht.':''}${S.engine==='eigen'&&C.studio.engine&&(S.engAgeAtStart||0)>=2?` Achtung: Eure Engine galt bei Projektstart als „${getEngineAgeInfo(S.engAgeAtStart).label}“.`:''}</p>
      <div class="tray" id="dice">${dieSVG('?')}</div>
      <button class="btn" id="go">W100 Review-Wurf</button>`;
    $('go').onclick=launch;
    return;
  }
  if(sc==='sales'){
    const e=S.end;
    m.innerHTML=`<span class="label">Die Reviews & GOTY-Nominierungen sind da</span>
      <div class="score">
        <div><span class="label">Wertungsschnitt</span><b>${e.meta}</b></div>
        <div><span class="label">Gameplay</span><b>${e.gp??S.res.gp}</b></div>
        <div><span class="label">Grafik</span><b>${e.gfx??S.res.gfx}</b></div>
        <div><span class="label">Wishlists</span><b>${nf(S.res.wl,0)}</b></div>
      </div>
      <p>${e.late}${e.meta>=85?'Die Presse überschlägt sich vor Begeisterung!':e.meta>=70?'Gute bis sehr gute Kritiken.':e.meta>=50?'Gemischte Kritiken. „Mit Patches könnte das noch was werden.“':'Verrisse. Ein YouTuber macht ein 40-minütiges Video über eure Technik.'}</p>
      ${e.awards&&e.awards.length?`<div class="award-box">
        <span class="label">🏆 Game of the Year (GOTY) Verleihung</span>
        ${e.awards.map(a=>`<div class="mini"><div><span><b>${esc(a.cat)}</b></span><span class="${a.won?'pos':''}">${esc(a.winner)} (${a.score} Pkt.) ${a.won?'🏆 GEWONNEN!':''}</span></div></div>`).join('')}
      </div>`:''}
      <div class="tray" id="dice">${dieSVG(e.r)}</div>
      <p class="note">${MODELS[S.model].sales}: W100 + doppelter Hype (+${S.res.hype*2})${C.trend?.hot===S.genre?' · 🔥 Trend-Bonus (+25 %)':C.trend?.cold===S.genre?' · ❄️ Übersättigtes Genre (−15 %)':''}</p>
      <button class="btn" id="go">${MODELS[S.model].sales}</button>`;
    $('go').onclick=sales;
    return;
  }
  if(sc==='end'){renderEnd(m);return}
}

function renderLang(m){
  const sel=S.langSel||(S.langSel={en:2,de:1,fr:1,es:1});
  const cost=langCost(sel);
  const voiced=Object.keys(sel).filter(k=>k!=='en'&&sel[k]===2).length;
  m.innerHTML=headFor('mand','lang')+`<div>${Object.entries(LANGS).map(([k,L])=>`<div class="lrow"><b>${L.n}</b>${k==='en'?'<span class="check safe">immer dabei, vertont</span>':`<div class="seg" role="group" aria-label="${L.n}">${['Keine','Text','Vertont'].map((x,i)=>`<button type="button" data-lg="${k}" data-lv="${i}" aria-pressed="${(sel[k]||0)===i}">${x}</button>`).join('')}</div>`}<span class="note">${Math.round(L.m*100)} % des Weltmarkts${k==='zh'?' · nur mit Partner-Publisher (bekommt die Hälfte) und Zulassung in der Gold-Phase':''}${k==='de'&&S.cast==='synchro'?' · eure Synchronstimme wirkt nur vertont':''}</span></div>`).join('')}</div>
   <div class="mini"><div><span>Kosten Übersetzung und Vertonung</span><span>${money(cost)}</span></div><div><span>Marktgröße</span><span>×${nf(marketFactor(sel,true),2)}</span></div><div><span>Gameplay & Atmosphäre durch Vertonung</span><span>+${Math.min(4,voiced)}</span></div></div>
   ${S.res.budget<cost?'<p class="err">Das kostet mehr, als ihr gerade habt. Am Monatsende droht die Notlage.</p>':''}
   <button class="btn" id="go">Sprachen festlegen</button>`;
  m.querySelectorAll('[data-lg]').forEach(b=>b.onclick=()=>{sel[b.dataset.lg]=+b.dataset.lv;renderLang(m);save()});
  $('go').onclick=()=>{
    const c=langCost(sel);S.res.budget-=c;S.spend.lok=(S.spend.lok||0)+c;S.langs={...sel};S.langDone=true;
    const ch=[['budget',-c]];if(voiced)ch.push(...apply({gp:Math.min(4,voiced)}));if(sel.zh)ch.push(['note','China: Zulassung wird in der Gold-Phase beantragt']);
    S.last={kind:'mand',ev:'lang',safe:true,ch,pre:[],l:'Sprachen festgelegt',txt:'Das Spiel erscheint auf '+Object.keys(sel).filter(k=>sel[k]).map(k=>LANGS[k].n).join(', ')+'.'};
    addLog(`<span>M${S.round+1}</span> Sprachen: ${Object.keys(sel).filter(k=>sel[k]).map(k=>LANGS[k].n+(sel[k]===2?' (vertont)':'')).join(', ')} für ${money(c)}`);
    S.screen='result';render();save();
  };
}

function renderShop(m){
  const sc=T().scale,ph=Math.floor(S.round/2);
  const cats=['Marketing','Qualität','Studio','Spekulativ'];
  const contractsDone=S.contractsDone||[];
  const contractThisMonth=S.contractMonth===S.round;

  m.innerHTML=`<span class="stamp">🛒 Studio-Shop, Personal & Auftragsarbeiten</span><h3>Investieren, Anwerben oder Geld verdienen</h3><p>Kauft Maßnahmen, werbt Lead-Spezialisten an oder übernehmt eine bezahlte Auftragsarbeit (max. 1 Auftrag pro Monat), um eure Kasse aufzubessern.</p>
   ${S.shopMsg?`<div class="alert mid"><b>${esc(S.shopMsg.n)}</b><span>${esc(S.shopMsg.txt||'')}</span>${chips(S.shopMsg.ch)}</div>`:''}

   <div class="shopcat"><span class="label">💼 Auftragsarbeiten für Fremdfirmen (${contractThisMonth?'Diesen Monat bereits erledigt':'Sofort-Einnahmen gegen W100-Wurf'})</span>
   ${CONTRACTS.map(ct=>{
     const done=contractsDone.includes(ct.id);
     const dis=done||contractThisMonth;
     const pay=Math.round(ct.pay*sc);
     const mod=modFor(ct.st)+moralMod();
     const pct=winChance(ct.dc,mod,false);
     return `<button class="opt" data-contract="${ct.id}" ${dis?'disabled':''}>
       <span class="t">${ct.n}</span>
       <span class="check">${done?'Erledigt ✓':`+${money(pay)} · ${STATS[ct.st]} SG ${ct.dc} (${pct} %)`}</span>
       <span class="d">${ct.d}</span>
     </button>`;
   }).join('')}</div>

   <div class="shopcat"><span class="label">👥 Lead-Personal (Agenturgebühr ${money(2*sc)}, danach Gehalt pro Monat)</span>
   ${Object.entries(STAFF).map(([k,s])=>{
     const st=getStaff(k);
     const has=!!st;
     const bonusCost=has?Math.round(st.sal*1.5*sc*10)/10:0;
     return `<div class="opt" style="cursor:default">
       <span class="t">${has?`${esc(st.personName)} — ${s.n} (St. ${st.level})`:s.n}</span>
       <span class="check ${has?'':'safe'}">${has?`Loyalität ${st.loyalty}/10 · ${money(st.sal*sc)}/M`:money(s.sal*sc)+'/Monat'}</span>
       <span class="d">${s.d} <b>Effekt:</b> ${s.effDesc(has?st.level:1)}.</span>
       <div class="row" style="grid-column:1/-1">
         ${has?`
           <button class="btn tiny alt" data-bonus="${k}" ${S.res.budget<bonusCost||st.loyalty>=10?'disabled':''}>Sonderbonus ${money(bonusCost)} (+2 Loyalität)</button>
           <button class="btn tiny ghost" data-raise="${k}" ${st.loyalty>=10?'disabled':''}>Gehalt +20 % (+3 Loyalität)</button>
           <button class="btn tiny ghost" data-fire="${k}">Entlassen (−1 Moral)</button>
         `:`<button class="btn small alt" data-hire="${k}" ${S.res.budget<2*sc?'disabled':''}>Anwerben (Business-Wurf SG 50)</button>`}
       </div>
     </div>`;
   }).join('')}</div>

   ${cats.map(c=>`<div class="shopcat"><span class="label">${c}</span>${SHOP.filter(it=>it.c===c&&(!it.tiers||it.tiers.includes(S.tier))).map(it=>{
     const cost=it.cost*sc,bought=S.shop.includes(it.id),early=it.min&&ph<it.min;
     const noEng=it.id==='refactoring'&&(!C.studio.engine||S.engine!=='eigen');
     const dis=bought||S.res.budget<cost||early||noEng;
     const target=it.st?dc100(it.dc):0;
     return `<button class="opt" data-buy="${it.id}" ${dis?'disabled':''}><span class="t">${it.n}</span><span class="check ${it.st?'':'safe'}">${bought?'gekauft':money(cost)}</span><span class="d">${it.d} ${it.st?`${STATS[it.st]}-Wurf gegen SG ${target}.`:''}${early?' Ab der Phase '+PHASES[it.min]+'.':''}${noEng?' (Nur mit eigener Engine im Einsatz)':''}</span>${!it.st&&it.eff?chips(previewSafe(it.eff)):''}</button>`;
   }).join('')}</div>`).join('')}
   <button class="btn" id="back">Zurück zur Monatskarte</button>`;

  m.querySelectorAll('[data-contract]').forEach(b=>b.onclick=()=>startContract(b.dataset.contract));
  m.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buy(b.dataset.buy));
  m.querySelectorAll('[data-hire]').forEach(b=>b.onclick=()=>hire(b.dataset.hire));
  m.querySelectorAll('[data-fire]').forEach(b=>b.onclick=()=>fire(b.dataset.fire));
  m.querySelectorAll('[data-bonus]').forEach(b=>b.onclick=()=>rewardStaff(b.dataset.bonus,'bonus'));
  m.querySelectorAll('[data-raise]').forEach(b=>b.onclick=()=>rewardStaff(b.dataset.raise,'raise'));
  $('back').onclick=()=>{S.shopMsg=null;S.screen='event';wsTab='board';render();save()};
}

function renderCrisis(m){
  m.className='card rnd';
  const neg=S.res.budget<0;
  const opts=RESC.filter(rescueAvail);
  m.innerHTML=`<span class="stamp">${neg?'Notlage':'Finanzierung'}</span><h3>${neg?'Das Konto ist leer':'Frisches Geld suchen'}</h3>
   <p>${neg?`Euch fehlen ${money(-S.res.budget)}. Ohne Rettung ist das Studio insolvent. Jede Maßnahme geht nur einmal pro Spiel.`:`Noch habt ihr ${money(S.res.budget)}. Wer früh verhandelt, verhandelt besser: +8 auf alle Rettungswürfe.`}</p>
   ${S.crisisMsg?`<div class="alert mid"><b>${S.crisisMsg.n}</b><span>${S.crisisMsg.txt||''}</span>${chips(S.crisisMsg.ch)}</div>`:''}
   <div class="opts">${opts.map(r=>{
     const o=getOpt({kind:'rescue',ev:r.id});
     const target=r.st?dc100(o.dc):0;
     const mod=r.st?(optMod(o)+o.bonusV+moralMod()):0;
     const pct=r.st?winChance(target,mod,false):100;
     return `<button class="opt" data-rs="${r.id}"><span class="t">${r.n}</span>${r.st?`<span class="check">${STATS[r.st]} · SG ${target} (${pct} %)</span>`:'<span class="check safe">ohne Wurf</span>'}<span class="d">${r.d}${r.st?` Du brauchst ${target} oder mehr mit W100 ${fmt(mod)}.`:''}${r.id==='privat'?' Verfügbar: '+money(C.dir.wealth)+'.':''}</span></button>`;
   }).join('')||'<p class="note">Keine Rettung mehr übrig.</p>'}</div>
   <div class="row">${!neg?`<button class="btn" id="cont">${S.crisisFrom==='event'?'Zurück zur Karte':'Weiter'}</button>`:''}${neg?'<button class="btn ghost" id="quit">Insolvenz anmelden</button>':''}</div>`;
  m.querySelectorAll('[data-rs]').forEach(b=>b.onclick=()=>rescueChoose(b.dataset.rs));
  const c=$('cont');if(c)c.onclick=leaveCrisis;
  const q=$('quit');if(q)q.onclick=()=>gameOver('budget');
}

function renderOver(m){
  const t={budget:['Insolvenz','Das Konto ist leer. Der Insolvenzverwalter verkauft die Rechte, das Spiel erscheint nie.'],haus:['Alles verloren','Die Bank hat abgelehnt. Studio und Haus sind weg.'],moral:['Das Team ist weg','Die Moral ist auf null. Am Montag liegen die Kündigungen auf dem Tisch.']}[S.over]||['Ende',''];
  m.innerHTML=`<span class="label">Ende Monat ${S.round}</span><h3>${t[0]}</h3><p>${t[1]}</p><p>${esc(C.dir.n)} kann mit ${money(C.dir.wealth)} Privatgeld und einem Gründerzuschuss von ${money(80)} ein neues Indie-Studio gründen. Studio-Fame startet bei null, das Personal ist weg (eure eigene Engine bleibt euch erhalten).</p>
   <div class="ledger">${ledger(null)}</div><div class="row"><button class="btn" id="re">Neues Studio gründen</button><button class="btn ghost" id="quit">Karriere beenden</button></div>`;
  $('re').onclick=refound;
  $('quit').onclick=()=>{C=null;S=null;render();save()};
}

function ledger(e){
  const rows=[];const R2=(a,b,c='')=>rows.push([c,a,b]);
  if(e){
    rows.push(['head','Erstes Jahr nach Release']);
    e.detail.forEach(d=>R2(d[0],d[1]));
    e.ded.forEach(d=>R2(d[0],money(d[1])));
    R2('Bei euch kommt an',money(e.net));
    if(e.merch)R2('Merchandise',money(e.merch,true));
    if(e.engRoyalty)R2('Externe Engine-Royalties (5 %)',money(e.engRoyalty,true));
    if(e.awardBonus)R2('🏆 GOTY-Award Preisgelder',money(e.awardBonus,true));
  }
  rows.push(['head','Entwicklung']);
  R2('Startbudget',money(S.start));
  if(S.einlage)R2('Privatgeld des Directors',money(S.einlage,true));
  if(S.investIn)R2('Investorengeld',money(S.investIn,true));
  if(S.loan)R2('Kredit aufgenommen',money(S.loan,true));
  if(S.income)R2('Vorab-, Auftrags- & Lizenz-Einnahmen',money(S.income,true));
  Object.keys(CAT).forEach(k=>{if(S.spend[k]>0)R2(CAT[k][0]+(k==='server'&&e&&e.live?' (inkl. erstem Live-Jahr)':''),money(-S.spend[k]))});
  if(e){
    if(S.loan)R2('Kredit-Rückzahlung',money(-S.loan));
    R2('Kasse nach dem ersten Jahr',money(e.kasseEnd),'sum');
    R2('Ergebnis (Kasse minus eingesetztes Kapital)',`<span class="${e.erg>=0?'pos':'neg'}">${money(e.erg,true)}</span>`,'sum');
    if(e.dist){
      rows.push(['head','Gewinnverteilung']);
      if(e.dist.inv)R2('Investor (20 %)',money(e.dist.inv));
      R2('Steuern & Abgaben',money(e.dist.tax));
      R2('Bonus für den Director (25 %)',money(e.dist.bonus));
      R2('Bleibt im Studio',money(e.dist.keep));
    }
    R2('Studiokasse für das nächste Projekt',`<span class="${e.kasseNew>=0?'pos':'neg'}">${money(e.kasseNew)}</span>`,'sum');
  }else R2('Ausgaben gesamt',money(-spendTotal()),'sum');
  return '<table>'+rows.map(r=>r[0]==='head'?`<tr class="head"><td colspan="2">${r[1]}</td></tr>`:`<tr class="${r[0]}"><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')+'</table>';
}

function renderEnd(m){
  const e=S.end;
  const broke=e.kasseNew<0;
  const dlcAvail=!broke&&!S.dlcDone&&e.meta>=45;
  const mBurn=monthSum();
  const wonAwards=(e.awards||[]).filter(a=>a.won);
  m.innerHTML=`<span class="label">Abrechnung „${esc(S.title)}“</span><h3>${e.v[0]}</h3>
   <div class="score">
     <div><span class="label">Wertung</span><b>${e.meta}</b></div>
     <div><span class="label">Gameplay</span><b>${e.gp??S.res.gp}</b></div>
     <div><span class="label">Grafik</span><b>${e.gfx??S.res.gfx}</b></div>
     <div><span class="label">${S.model==='f2p'?'Spieler':'Käufer'}</span><b>${nf(e.units,0)}</b></div>
     <div><span class="label">Ergebnis</span><b class="${e.erg>=0?'pos':'neg'}">${money(e.erg,true)}</b></div>
   </div>
   <p>${e.v[1]}</p>
   ${wonAwards.length?`<div class="award-box"><b>🏆 Gewonnene Auszeichnungen (${wonAwards.length}×)</b><div class="chips">${wonAwards.map(a=>`<span class="chip p">🏆 ${esc(a.cat)}</span>`).join('')}</div><span class="note">Preisgeld & Prestige: +${money(e.awardBonus||0)} Umsatz & +${wonAwards.length*2} Fame!</span></div>`:''}
   ${e.engNote?`<div class="alert mid"><b>Engine-Entwicklung & Alterung</b><span>${esc(e.engNote)}</span></div>`:''}
   ${e.staffNotes&&e.staffNotes.length?`<div class="alert good"><b>Lead-Personal</b><span>${e.staffNotes.map(esc).join(' · ')}</span></div>`:''}
   <div class="mini">
     <div><span>Fame für Studio und Director</span><span class="${e.fd>=0?'pos':'neg'}">${fmt(e.fd)}</span></div>
     <div><span>Privatkonto des Directors</span><span>${money(C.dir.wealth)}</span></div>
     <div><span>Erfahrungspunkte zum Verteilen</span><span>${C.dir.xp}</span></div>
     <div><span>Neue Gehaltsinflation im Studio</span><span>+${Math.round((C.studio.salaryDrift||0)*100)} %</span></div>
     ${S.ipLost?'<div><span>Rechte an der Marke</span><span class="neg">beim Publisher, keine Fortsetzung</span></div>':''}
   </div>
   ${dlcAvail?`<div class="blk">
     <span class="label">Optional: Post-Release-Phase (1 Aktion vor dem nächsten Projekt)</span>
     <div class="opts">
       ${DLC_OPTS.filter(d=>!d.cond||d.cond()).map(d=>{
         const cost=Math.round(mBurn*d.costMonths);
         const target=dc100(d.dc);
         const mod=modFor(d.st)+moralMod();
         const pct=winChance(target,mod,false);
         return `<button class="opt" data-dlc="${d.id}" ${C.studio.kasse<cost?'disabled':''}>
           <span class="t">${d.n}</span>
           <span class="check">${money(cost)} · ${STATS[d.st]} SG ${target} (${pct} %)</span>
           <span class="d">${d.d}</span>
         </button>`;
       }).join('')}
     </div>
   </div>`:''}
   ${broke?`<div class="alert"><b>Die Schulden sind zu hoch</b><span>Die Studiokasse steht bei ${money(e.kasseNew)}. Das Studio muss schließen.</span></div>`:''}
   <div class="ledger">${ledger(e)}</div>
   <div class="row">${broke?'<button class="btn" id="re">Neues Studio gründen</button>':'<button class="btn" id="nextP">Nächstes Projekt planen</button>'}<button class="btn small ghost" id="expChron">Chronik exportieren</button><button class="btn ghost" id="quit">Karriere beenden</button></div>`;
  m.querySelectorAll('[data-dlc]').forEach(b=>b.onclick=()=>startDlc(b.dataset.dlc));
  if(broke)$('re').onclick=refound;else $('nextP').onclick=()=>{S=null;wsTab='board';render();save()};
  $('expChron').onclick=()=>openProfileModal('chronicle');
  $('quit').onclick=()=>{C=null;S=null;wsTab='board';render();save()};
}

/* ===================== Gründung & Projektplanung ===================== */
function renderSetup(m){
  const first=!C;
  const kasse=first?null:C.studio.kasse;
  const seqs=first?[]:C.hall.map((h,i)=>[h,i]).filter(([h])=>h.meta!=null&&h.meta>=70&&!h.ipLost);
  const tr=C?.trend;
  m.innerHTML=`<h3>${first?'Gründet euer Studio':'Das nächste Projekt'}</h3>
   ${first?'':`<p>Studiokasse: <b>${money(kasse)}</b>. Das ist euer Budget für das nächste Spiel. Fame gibt euch Start-Hype und Wishlists.${C.studio.engine?` Eure <b>${esc(C.studio.engine.name)} v${C.studio.engine.version}.0</b> hat aktuell den Zustand: <b>${getEngineAgeInfo(C.studio.engine.age||0).label}</b>.`:''}</p>`}
   ${tr?`<div class="alert mid"><b>Markt-Radar für das nächste Spiel</b><span>🔥 <b>Boom-Genre: ${GENRES[tr.hot]?.n}</b> (+25 % Verkäufe, +1 Hype) · ❄️ <b>Übersättigt: ${GENRES[tr.cold]?.n}</b> (−15 % Verkäufe). ${esc(tr.note||'')}</span></div>`:''}
   <div class="field"><label class="label" for="nm">Studioname</label><input id="nm" type="text" value="${esc(first?'Pixelpott Studios':C.studio.name)}" maxlength="40"></div>
   <div class="field"><label class="label" for="tt">Spieltitel</label><div class="inrow"><input id="tt" type="text" value="${esc(randTitle())}" maxlength="40"><button type="button" class="btn small ghost" id="ttR">Anderer Vorschlag</button></div></div>
   <div class="field"><span class="label">Produktionsklasse</span><div class="choices">${Object.entries(TIERS).map(([k,t],i)=>{const ok=first||kasse>=t.min;return `<label class="choice"><input type="radio" name="t" id="t-${k}" value="${k}" ${i===0?'checked':''} ${ok?'':'disabled'}><b>${t.n}</b><span>${t.d}</span><code>${first?'Start '+money(220*t.scale)+' · ':'mind. '+money(t.min)+' · '}${t.team} Leute · ca. ${money(13*t.scale)}/Monat<br>Preise ${t.prices.map(p=>nf(p,2)).join(' / ')} €</code><span>${t.note}</span></label>`}).join('')}</div></div>
   <div class="field"><span class="label">Marke</span><div class="choices">
     <label class="choice"><input type="radio" name="ip" id="ip-neu" value="neu" checked><b>${IPS.neu.n}</b><span>${IPS.neu.d}</span><code>${IPS.neu.note}</code></label>
     ${seqs.map(([h,i])=>`<label class="choice"><input type="radio" name="ip" id="ip-seq${i}" value="seq:${i}" data-st="${esc(h.title)}"><b>Fortsetzung von „${esc(h.title)}“</b><span>Wertung ${h.meta}. Fans und Kritiker erinnern sich.</span><code>+${clamp(Math.floor((h.meta-60)/8),0,4)} Hype zusätzlich, Verkäufe ×${nf(1.3+(h.meta-70)/100,2)}, Start-Wishlists</code></label>`).join('')}
     ${first?`<label class="choice"><input type="radio" name="ip" id="ip-franchise" value="franchise"><b>${IPS.franchise.n}</b><span>${IPS.franchise.d}</span><code>${IPS.franchise.note}</code></label>`:''}
     <label class="choice"><input type="radio" name="ip" id="ip-lizenz" value="lizenz"><b>${IPS.lizenz.n}</b><span>${IPS.lizenz.d}</span><code>${IPS.lizenz.note}</code></label></div></div>
   <div class="field"><span class="label">Geschäftsmodell</span><div class="choices">${Object.entries(MODELS).map(([k,o],i)=>`<label class="choice"><input type="radio" name="m" id="m-${k}" value="${k}" ${i===0?'checked':''}><b>${o.n}</b><span>${o.d}</span></label>`).join('')}</div></div>
   <div class="field"><span class="label">Genre (bestimmt Studiowerte & Grafik/Gameplay-Gewichtung)</span><div class="choices">${Object.entries(GENRES).map(([k,g],i)=>{
     const engKnows=C&&C.studio.engine&&C.studio.engine.genres.includes(k);
     const isHot=tr&&tr.hot===k;
     const isCold=tr&&tr.cold===k;
     return `<label class="choice"><input type="radio" name="g" id="g-${k}" value="${k}" ${i===0?'checked':''}><b>${g.n}</b><span>${g.d}</span><code>${Object.keys(STATS).map(s=>STATS[s]+' +'+(g.s[s]*4)).join(' · ')}<br>Gameplay ${Math.round((1-g.gfxW)*100)} % · Grafik ${Math.round(g.gfxW*100)} %</code>${isHot?'<span class="pos">🔥 Aktuelles Boom-Genre (+25 % Verkäufe, +1 Hype)</span>':''}${isCold?'<span class="neg">❄️ Aktuell übersättigt (−15 % Verkäufe)</span>':''}${engKnows?'<span class="pos">★ Eigene Engine beherrscht dieses Genre</span>':''}${g.fit!=='kauf'?`<span>Passt zu ${MODELS[g.fit].n}: +1 Hype</span>`:''}</label>`;
   }).join('')}</div></div>
   <div class="field"><span class="label">Extras</span><div class="choices">
     <label class="choice"><input type="checkbox" id="xMods"><b>Mod-Support</b><span>Editor und Schnittstellen für die Community. Kostet monatlich, verlängert das Leben des Spiels.</span><code>+25 % Verkäufe (F2P +15 %)</code></label>
     <label class="choice"><input type="checkbox" id="xEA"><b>Early Access</b><span>Die Beta ist ab Monat 8 käuflich. Bringt Geld und Bug-Meldungen, aber der Release wirkt weniger neu.</span><code>Einnahmen, −1 Bug pro Monat, Kritiker −2</code></label></div></div>
   ${first?`<div class="field"><span class="label">Game Director</span><div class="choices">${Object.entries(DIRS).map(([k,o],i)=>`<label class="choice"><input type="radio" name="dir" id="d-${k}" value="${k}" ${i===0?'checked':''}><b>${o.n}</b><span>${o.tag}. ${o.d}</span><code>${dirStatLine(o.s)}</code><span>Fähigkeit: ${ABIL[o.ab].n}${o.perks.length?' · Vorteil: '+o.perks.map(p=>PERKS[p].n).join(', '):''} · Macke: ${o.flaws.map(f=>FLAWS[f].n).join(', ')||'keine'}</span>${Object.keys(o.aff).length?`<span>Genres: ${Object.entries(o.aff).map(([g,v])=>GENRES[g].n+' '+fmt(v*4)).join(', ')}</span>`:''}</label>`).join('')}<label class="choice"><input type="radio" name="dir" id="d-custom" value="custom"><b>Eigener Director</b><span>Werte mit ${DPTS} Punkten kaufen, Vorteile wählen, Macken für Extrapunkte nehmen.</span></label></div><div id="builder" hidden></div></div>`:`<p class="note">Director: <b>${esc(C.dir.n)}</b>. Erfahrungspunkte und neue Vorteile verteilst du links im Bogen.</p>`}
   <p class="err" id="setupErr" hidden></p>
   <button class="btn" id="go">${first?'Studio gründen':'Projekt starten'}</button>`;
  $('ttR').onclick=()=>{$('tt').value=randTitle()};
  m.querySelectorAll('input[name=ip]').forEach(r=>r.onchange=()=>{if(r.checked&&r.dataset.st){const base=r.dataset.st.replace(/ (\d+)$/,'');const n=(+((r.dataset.st.match(/ (\d+)$/)||[])[1]||1))+1;$('tt').value=base+' '+n}});
  if(first)m.querySelectorAll('input[name=dir]').forEach(r=>r.onchange=()=>{const c=$('d-custom').checked;$('builder').hidden=!c;if(c)renderBuilder()});
  $('go').onclick=()=>{
    const err=$('setupErr');const val=n=>document.querySelector(`input[name=${n}]:checked`).value;
    if(first){
      const k=val('dir');let dir;
      if(k==='custom'){
        if(ptsLeft()<0){err.hidden=false;err.textContent=`Dein Director hat ${-ptsLeft()} Punkte zu viel. Senke einen Wert, streiche einen Vorteil oder nimm eine Macke.`;return}
        dir={id:'custom',n:B.n.trim()||'Namenloser Director',tag:'Eigener Director',d:'',s:{...B.s},aff:{},perks:[...B.perks],flaws:[...B.flaws],ab:null};
      }else{
        dir={id:k,...DIRS[k],s:{...DIRS[k].s},perks:[...DIRS[k].perks],flaws:[...DIRS[k].flaws],aff:{...DIRS[k].aff}};
      }
      C={studio:{name:$('nm').value.trim()||'Pixelpott Studios',fame:0,kasse:0,staff:[],exStaff:[],engine:null,salaryDrift:0,overheadDrift:0},dir:{...dir,fame:0,wealth:0,games:0,xp:0,perkUnlocked:false},hall:[],gameNo:0};
      rollMarketTrend();
    }else C.studio.name=$('nm').value.trim()||C.studio.name;
    wsTab='board';
    startGame({title:$('tt').value.trim(),genre:val('g'),tier:val('t'),model:val('m'),ip:val('ip'),mods:$('xMods').checked,ea:$('xEA').checked});
  };
}

function renderBuilder(){
  const left=ptsLeft();const el=$('builder');
  el.innerHTML=`<div class="bld"><div class="field"><label class="label" for="bn">Name deines Directors</label><input id="bn" type="text" maxlength="30" placeholder="Dein Director" value="${esc(B.n)}"></div>
   <div class="pts ${left<0?'neg':''}" aria-live="polite">Punkte übrig: ${left}</div>
   <div><span class="label">Werte (1 = neutral, jeder Punkt über 1 gibt +4 auf W100-Würfe)</span>${Object.entries(DSTAT).map(([k,[n,d]])=>`<div class="bstat"><b>${n}</b><div class="step"><button type="button" data-st="${k}" data-d="-1" aria-label="${n} senken" ${B.s[k]<=0?'disabled':''}>−</button><span>${B.s[k]}</span><button type="button" data-st="${k}" data-d="1" aria-label="${n} erhöhen" ${B.s[k]>=4?'disabled':''}>+</button></div><span class="pd">${d} · Wirkung ${fmt((B.s[k]-1)*4)}</span></div>`).join('')}</div>
   <div><span class="label">Vorteile (kosten Punkte)</span>${Object.entries(PERKS).map(([k,p])=>`<label class="tick"><input type="checkbox" data-pk2="${k}" ${B.perks.includes(k)?'checked':''}><span>${p.n}<small>${p.d}</small></span><code>−${p.c}</code></label>`).join('')}</div>
   <div><span class="label">Macken (bringen Punkte, höchstens zwei)</span>${Object.entries(FLAWS).map(([k,f])=>`<label class="tick"><input type="checkbox" data-fl="${k}" ${B.flaws.includes(k)?'checked':''} ${!B.flaws.includes(k)&&B.flaws.length>=2?'disabled':''}><span>${f.n}<small>${f.d}</small></span><code>+${f.c}</code></label>`).join('')}</div></div>`;
  $('bn').oninput=e=>{B.n=e.target.value};
  el.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{const k=b.dataset.st;B.s[k]=clamp(B.s[k]+(+b.dataset.d),0,4);renderBuilder()});
  el.querySelectorAll('[data-pk2]').forEach(c=>c.onchange=()=>{const k=c.dataset.pk2;B.perks=c.checked?[...B.perks,k]:B.perks.filter(x=>x!==k);renderBuilder()});
  el.querySelectorAll('[data-fl]').forEach(c=>c.onchange=()=>{const k=c.dataset.fl;B.flaws=c.checked?[...B.flaws,k]:B.flaws.filter(x=>x!==k);renderBuilder()});
  const e=$('setupErr');if(e&&left>=0)e.hidden=true;
}

/* ===================== Multi-User Profile & Export Modal ===================== */
function updateProfileButton(){
  const btn=$('tgProfile');
  if(!btn)return;
  const p=getActiveProfile();
  btn.innerHTML=`👤 ${esc(p?.userName||'Spieler 1')} <span class="badge">${profiles.length}</span>`;
}

function openProfileModal(defaultTab='profiles'){
  const bd=$('profileModal');
  if(!bd)return;
  bd.hidden=false;
  renderProfileModal(defaultTab);
}

function closeProfileModal(){
  const bd=$('profileModal');
  if(bd)bd.hidden=true;
}

function renderProfileModal(tab='profiles',msg=''){
  const box=$('profileModalBody');
  if(!box)return;
  const cur=getActiveProfile();
  const saveCode=encodeSaveString({userName:cur.userName,C,S});
  const shareUrl=location.origin+location.pathname+'#save='+saveCode;
  const chronicle=generateChronicleText();

  box.innerHTML=`
    <div class="tabs">
      <button type="button" class="tab-btn ${tab==='profiles'?'active':''}" data-tab="profiles">👤 Spieler-Profile (${profiles.length})</button>
      <button type="button" class="tab-btn ${tab==='backup'?'active':''}" data-tab="backup">💾 Speichercode & Datei-Backup</button>
      <button type="button" class="tab-btn ${tab==='chronicle'?'active':''}" data-tab="chronicle">📜 Studio-Chronik exportieren</button>
    </div>
    ${msg?`<div class="alert good"><b>Hinweis</b><span>${esc(msg)}</span></div>`:''}
    ${tab==='profiles'?`
      <p class="note" style="margin:0">Mehrere Personen (oder verschiedene Karrieren) können hier komplett ohne Login eigene Profile anlegen und jederzeit wechseln.</p>
      <div class="slot-grid">
        ${profiles.map(p=>{
          const isAct=p.id===activeSlotId;
          const stName=p.C?.studio?.name||'Neues Studio';
          const games=p.C?.hall?.length||0;
          const kasse=p.C?.studio?money(p.C.studio.kasse):'–';
          return `<div class="slot-row ${isAct?'active':''}">
            <div>
              <b>${esc(p.userName)}</b> ${isAct?'<span class="chip p">Aktiv</span>':''}
              <div class="slot-meta">${esc(stName)} · ${games} Spiele · Kasse: ${kasse}${p.S?` · Laufend: „${esc(p.S.title)}“ (M${p.S.round+1})`:''}</div>
            </div>
            <div class="row">
              ${!isAct?`<button class="btn tiny alt" data-switch="${p.id}">Laden</button>`:''}
              <button class="btn tiny ghost" data-del="${p.id}">${profiles.length<=1?'Zurücksetzen':'Löschen'}</button>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="field" style="padding-top:8px;border-top:1px dashed var(--line)">
        <label class="label" for="newProfName">Neues Spieler-Profil anlegen</label>
        <div class="inrow">
          <input id="newProfName" type="text" placeholder="Name des Spielers / Slots" maxlength="30">
          <button type="button" class="btn small" id="btnAddProf">Neues Profil starten</button>
        </div>
      </div>
    `:tab==='backup'?`
      <p class="note" style="margin:0">Kopiere deinen kompakten <b>W100-Speichercode</b> oder lade eine JSON-Datei herunter, um deinen Fortschritt auf GitHub Pages zwischen Geräten oder mit Freunden zu teilen.</p>
      <div class="field">
        <label class="label" for="expCodeArea">Aktueller Speichercode (${esc(cur.userName)})</label>
        <textarea id="expCodeArea" readonly>${esc(saveCode)}</textarea>
        <div class="row">
          <button type="button" class="btn small" id="btnCopyCode">Speichercode kopieren</button>
          <button type="button" class="btn small ghost" id="btnCopyLink">Direkt-Link (#save) kopieren</button>
          <button type="button" class="btn small alt" id="btnDlJson">Als .JSON herunterladen</button>
        </div>
      </div>
      <div class="field" style="padding-top:10px;border-top:1px dashed var(--line)">
        <label class="label" for="impCodeArea">Speichercode oder JSON-Datei importieren</label>
        <textarea id="impCodeArea" placeholder="W100-... Code hier einfügen"></textarea>
        <div class="row">
          <button type="button" class="btn small" id="btnImpCode">Code als neues Profil importieren</button>
          <label class="btn small ghost" style="cursor:pointer">JSON-Datei laden <input type="file" id="impJsonFile" accept=".json" hidden></label>
        </div>
      </div>
    `:`
      <p class="note" style="margin:0">Exportiere einen übersichtlichen Bericht über dein Studio, deine eigene Engine, dein Lead-Personal und deine Ruhmeshalle (z. B. für Discord, Foren oder als Text-Chronik).</p>
      <div class="field">
        <label class="label" for="chronArea">Studio-Chronik (Markdown / Text)</label>
        <textarea id="chronArea" style="min-height:220px" readonly>${esc(chronicle)}</textarea>
        <div class="row">
          <button type="button" class="btn small" id="btnCopyChron">Chronik kopieren</button>
          <button type="button" class="btn small alt" id="btnDlChron">Als .MD / Textdatei speichern</button>
        </div>
      </div>
    `}
  `;

  box.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>renderProfileModal(b.dataset.tab));
  box.querySelectorAll('[data-switch]').forEach(b=>b.onclick=()=>{switchProfile(b.dataset.switch);renderProfileModal('profiles','Profil geladen!')});
  box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{deleteProfile(b.dataset.del);renderProfileModal('profiles','Profil entfernt bzw. zurückgesetzt.')});

  const btnAdd=$('btnAddProf');
  if(btnAdd)btnAdd.onclick=()=>{
    const nm=$('newProfName').value.trim()||('Spieler '+(profiles.length+1));
    createProfile(nm);
    renderProfileModal('profiles',`Profil „${nm}“ wurde erstellt und aktiviert!`);
  };

  const btnCopyCode=$('btnCopyCode');
  if(btnCopyCode)btnCopyCode.onclick=()=>{
    navigator.clipboard?.writeText(saveCode);
    renderProfileModal('backup','Speichercode in die Zwischenablage kopiert!');
  };

  const btnCopyLink=$('btnCopyLink');
  if(btnCopyLink)btnCopyLink.onclick=()=>{
    navigator.clipboard?.writeText(shareUrl);
    renderProfileModal('backup','Direkt-Link in die Zwischenablage kopiert!');
  };

  const btnDlJson=$('btnDlJson');
  if(btnDlJson)btnDlJson.onclick=()=>{
    const safeName=(C?.studio?.name||cur.userName||'studio').toLowerCase().replace(/[^a-z0-9_-]+/g,'-');
    downloadFile(`studio-w100-${safeName}.json`,JSON.stringify({userName:cur.userName,exportedAt:new Date().toISOString(),C,S},null,2),'application/json');
  };

  const btnImpCode=$('btnImpCode');
  if(btnImpCode)btnImpCode.onclick=()=>{
    const raw=$('impCodeArea').value.trim();
    const data=decodeSaveString(raw);
    if(!data){renderProfileModal('backup','Ungültiger Speichercode!');return}
    const nm=data.userName||(data.C?.studio?.name?data.C.studio.name+' (Import)':'Import');
    createProfile(nm,data.C,data.S);
    renderProfileModal('profiles',`Spielstand „${nm}“ erfolgreich als neues Profil importiert!`);
  };

  const fileIn=$('impJsonFile');
  if(fileIn)fileIn.onchange=e=>{
    const f=e.target.files?.[0];if(!f)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(data&&('C' in data)){
          const nm=data.userName||(data.C?.studio?.name?data.C.studio.name+' (JSON)':'JSON-Import');
          createProfile(nm,data.C,data.S);
          renderProfileModal('profiles',`JSON-Spielstand „${nm}“ erfolgreich importiert!`);
        }
      }catch(err){renderProfileModal('backup','JSON-Datei konnte nicht gelesen werden.')}
    };
    reader.readAsText(f);
  };

  const btnCopyChron=$('btnCopyChron');
  if(btnCopyChron)btnCopyChron.onclick=()=>{
    navigator.clipboard?.writeText(chronicle);
    renderProfileModal('chronicle','Studio-Chronik in die Zwischenablage kopiert!');
  };

  const btnDlChron=$('btnDlChron');
  if(btnDlChron)btnDlChron.onclick=()=>{
    const safeName=(C?.studio?.name||cur.userName||'chronik').toLowerCase().replace(/[^a-z0-9_-]+/g,'-');
    downloadFile(`studio-w100-chronik-${safeName}.md`,chronicle,'text/markdown;charset=utf-8');
  };
}

function render(){
  renderHud();
  renderTrack();
  renderSheet();
  renderWsNav();
  renderMain();
  renderDock();
  const tm=$('tgManual');
  if(tm)tm.setAttribute('aria-pressed',manual);
  updateProfileButton();
}
