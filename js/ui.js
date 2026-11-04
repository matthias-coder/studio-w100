/* ===================== Darstellung & UI (W100 Command Center für Tablet & Desktop) ===================== */
let wsTab='board';
let dockTab='plan';

function dieSVG(n,cls=''){
  return `<svg class="d20 ${cls}" viewBox="0 0 100 100" aria-hidden="true"><polygon class="face" points="50,4 90,27 90,73 50,96 10,73 10,27"/><polygon points="50,24 78,66 22,66"/><line x1="50" y1="24" x2="50" y2="4"/><line x1="50" y1="24" x2="10" y2="27"/><line x1="50" y1="24" x2="90" y2="27"/><line x1="22" y1="66" x2="10" y2="27"/><line x1="22" y1="66" x2="10" y2="73"/><line x1="22" y1="66" x2="50" y2="96"/><line x1="78" y1="66" x2="90" y2="27"/><line x1="78" y1="66" x2="90" y2="73"/><line x1="78" y1="66" x2="50" y2="96"/><text x="50" y="50">${n}</text></svg>`;
}

const ACTIVE=['event','mand','lang','result','random','legend','interview','shop','crisis','roll','manual'];

/* ===================== Asset-Helfer (Porträts, Studio-Ansicht & Event-Szenen) ===================== */
function charPortraitHTML(img,isScene=false,size='md',locked=false,alt='Charakter'){
  if(!img)return '';
  return `<div class="char-crop ${size} ${isScene?'is-scene':''} ${locked?'locked':''}" ${!locked?`data-zoom-img="${esc(img)}" data-zoom-title="${esc(alt)}" title="Klicken für volle Sammelkarte" style="cursor:zoom-in"`:''}>
    <img src="${esc(img)}" alt="${esc(alt)}" loading="lazy">
    ${locked?'<span class="lock-ov" aria-hidden="true">🔒</span>':''}
  </div>`;
}

function getStudioArt(){
  if(!C)return STUDIO_IMAGES.garage;
  const tier=S?S.tier:(C.studio.tier||'indie');
  const hasMocap=S&&S.shop&&S.shop.includes('mocap');
  const hasHw=S&&S.shop&&(S.shop.includes('hardware')||S.shop.includes('pipeline'));
  if(tier==='aaa'&&(hasMocap||C.studio.fame>=45||(C.studio.engine?.version||0)>=2))return STUDIO_IMAGES.aaa;
  if(tier==='aa'||tier==='aaa')return STUDIO_IMAGES.aa;
  if(hasHw||C.hall.length>=1||(S&&S.round>=2))return STUDIO_IMAGES.loft;
  return STUDIO_IMAGES.garage;
}

function studioBannerHTML(){
  const art=getStudioArt();
  return `<div class="studio-banner">
    <img src="${esc(art.src)}" alt="${esc(art.label)}" loading="lazy">
    <div class="studio-banner-cap">
      <span>🏢 ${esc(art.label)}</span>
      ${C?`<span>Fame ${C.studio.fame}/100</span>`:''}
    </div>
  </div>`;
}

function eventBannerHTML(kind,ev){
  if(kind==='legend'){
    const leg=DIRS[ev];
    if(leg&&leg.isScene)return `<div class="enc-crop"><img src="${esc(leg.img)}" alt="${esc(leg.n)}" loading="lazy"></div>`;
    return '';
  }
  if(kind==='crisis')return `<div class="event-banner"><img src="${EVENT_IMAGES.boardroom}" alt="Finanzierungsrunde" loading="lazy"></div>`;
  if(kind==='launch'){
    const src=(S&&S.res.bugs>=10)?EVENT_IMAGES.bug_crash:EVENT_IMAGES.stage;
    return `<div class="event-banner"><img src="${src}" alt="Release-Tag" loading="lazy"></div>`;
  }
  if(kind==='sales'||kind==='end'){
    const meta=S?.end?.meta??0;
    const won=(S?.end?.awards||[]).some(a=>a.won);
    if(meta>=75||won)return `<div class="event-banner mag-banner"><img src="${EVENT_IMAGES.magazine}" alt="PIXEL WORLD Magazin-Titelstory" loading="lazy"></div>`;
    if(meta<52)return `<div class="event-banner"><img src="${EVENT_IMAGES.shitstorm}" alt="Vernichtende Kritiken" loading="lazy"></div>`;
    return `<div class="event-banner"><img src="${EVENT_IMAGES.stage}" alt="Release-Show" loading="lazy"></div>`;
  }
  if(kind==='mand'){
    if(ev==='engine')return `<div class="enc-crop"><img src="${EVENT_IMAGES.enc_kernel}" alt="Engine-Entscheidung" loading="lazy"></div>`;
    if(ev==='platform')return `<div class="enc-crop"><img src="${EVENT_IMAGES.enc_os}" alt="Plattform-Entscheidung" loading="lazy"></div>`;
    if(ev==='price'||ev==='license')return `<div class="event-banner"><img src="${EVENT_IMAGES.boardroom}" alt="Verhandlung" loading="lazy"></div>`;
    return '';
  }
  if(kind==='card'||kind==='rand'){
    const obj=kind==='card'?E[ev]:R[ev];
    if(!obj)return '';
    const t=(obj.t||'').toLowerCase();
    if(t.includes('open-source')||t.includes('pull-request'))return `<div class="enc-crop"><img src="${EVENT_IMAGES.enc_kernel}" alt="${esc(obj.t)}" loading="lazy"></div>`;
    if(t.includes('artstyle')||t.includes('kreative differenzen'))return `<div class="enc-crop"><img src="${EVENT_IMAGES.enc_critic}" alt="${esc(obj.t)}" loading="lazy"></div>`;
    if(t.includes('ki-assistent')||t.includes('kopierschutz')||t.includes('monetarisierung'))return `<div class="enc-crop"><img src="${EVENT_IMAGES.enc_data}" alt="${esc(obj.t)}" loading="lazy"></div>`;
    if(t.includes('tiktok')||t.includes('handheld')||t.includes('demo-festival'))return `<div class="enc-crop"><img src="${EVENT_IMAGES.enc_algo}" alt="${esc(obj.t)}" loading="lazy"></div>`;
    if(t.includes('unitee')||t.includes('middleware')||t.includes('rechteinhaber'))return `<div class="enc-crop"><img src="${EVENT_IMAGES.enc_os}" alt="${esc(obj.t)}" loading="lazy"></div>`;
    if(t.includes('pitch')||t.includes('investor')||t.includes('aktionär')||t.includes('fusion')||t.includes('crowdfunding'))return `<div class="event-banner"><img src="${EVENT_IMAGES.boardroom}" alt="${esc(obj.t)}" loading="lazy"></div>`;
    if(t.includes('trailer')||t.includes('messe')||t.includes('streamer')||t.includes('versprechen')||t.includes('keynote')||t.includes('dokumentation'))return `<div class="event-banner"><img src="${EVENT_IMAGES.stage}" alt="${esc(obj.t)}" loading="lazy"></div>`;
    if(t.includes('zeitplan')||t.includes('crunch')||t.includes('game jam')||t.includes('releasetermin')||t.includes('gut genug'))return `<div class="event-banner"><img src="${EVENT_IMAGES.crunch}" alt="${esc(obj.t)}" loading="lazy"></div>`;
    if(t.includes('bug')||t.includes('praktikant')||t.includes('engine-kern')||t.includes('speicherstand')||t.includes('patch')||t.includes('build-maschine'))return `<div class="event-banner"><img src="${EVENT_IMAGES.bug_crash}" alt="${esc(obj.t)}" loading="lazy"></div>`;
    if(t.includes('ddos')||t.includes('server')||t.includes('beta')||t.includes('playtest'))return `<div class="event-banner"><img src="${EVENT_IMAGES.ddos}" alt="${esc(obj.t)}" loading="lazy"></div>`;
    if(t.includes('hacker')||t.includes('main-branch')||t.includes('gewitter')||t.includes('leak')||t.includes('schadcode'))return `<div class="event-banner"><img src="${EVENT_IMAGES.ransomware}" alt="${esc(obj.t)}" loading="lazy"></div>`;
    if(t.includes('review-bombing')||t.includes('level 3')||t.includes('wutausbruch')||t.includes('nachts')||t.includes('rezension'))return `<div class="event-banner"><img src="${EVENT_IMAGES.shitstorm}" alt="${esc(obj.t)}" loading="lazy"></div>`;
    if(t.includes('vertical slice')||t.includes('review-codes')||t.includes('award'))return `<div class="event-banner mag-banner"><img src="${EVENT_IMAGES.magazine}" alt="${esc(obj.t)}" loading="lazy"></div>`;
  }
  return '';
}

function bindZoomTriggers(root){
  if(!root||!root.querySelectorAll)return;
  root.querySelectorAll('[data-zoom-img]').forEach(el=>{
    el.onclick=e=>{
      e.stopPropagation();
      openCardZoom(el.dataset.zoomImg,el.dataset.zoomTitle||'Sammelkarte');
    };
  });
}

function openCardZoom(src,title){
  const bd=$('profileModal');
  const box=$('profileModalBody');
  const hd=$('modalTitle');
  if(!bd||!box)return;
  if(hd)hd.textContent=title;
  bd.hidden=false;
  box.innerHTML=`
    <img class="zoom-card-img" src="${esc(src)}" alt="${esc(title)}">
    <p class="note" style="text-align:center;margin:0">Originale Pixel-Art-Sammelkarte (${esc(title)})</p>
  `;
}

/* ===================== Sticky HUD & Phasen-Track ===================== */
function renderHud(){
  const h=$('hud');
  if(!h)return;
  document.body.classList.toggle('in-project',!!S);
  if(!S||!ACTIVE.concat(['launch']).includes(S.screen)){h.hidden=true;return}
  h.hidden=false;
  h.onclick=()=>h.classList.toggle('expanded');
  recalcQual();
  const r=S.res,rw=runway(),left=monthsLeft();
  const crit=rw<1,low=rw<=3&&rw<left;
  h.classList.toggle('alarm',crit||r.budget<0);
  const bar=(pct,col)=>`<div class="hud-bar"><i style="width:${clamp(pct,0,100)}%;background:${col}"></i></div>`;
  const cell=(l,v,w,sub,barHtml='',cls='')=>`<div class="${w?'warn':''} ${cls}"><span class="label">${l}</span><b>${v}</b>${sub?`<small>${sub}</small>`:''}${barHtml}</div>`;
  const moralCol=r.moral>=7?'var(--good)':r.moral>=4?'var(--gold)':'var(--bad)';
  const fc=reviewForecast();
  const snd=r.snd??Math.round((r.gp+r.gfx)/2);
  h.innerHTML=`<div class="money ${crit||low||r.budget<0?'warn':''}"><span class="label">Restbudget</span><b>${money(r.budget)}</b><small>${money(costPerMonth())}/Monat · nächster Schritt ${money(stepCost())} · ${r.budget<0?'im Minus':rw>=left?'reicht bis Release':rw<1?'reicht < 1 Monat':'reicht '+rw+' Mon.'}</small></div>`
   +cell('Moral',r.moral+'/10',r.moral<=2,`${fmt(moralMod())} auf Würfe`,bar(r.moral*10,moralCol))
   +cell('Hype',r.hype+'/10',false,S.trendHot?'🔥 Trend-Genre':S.trendCold?'❄️ Übersättigt':r.hype>=7?'wächst nur noch langsam':'',bar(r.hype*10,'var(--accent)'))
   +cell('Qualität',r.qual,false,`🎮 ${r.gp} · 🎨 ${r.gfx} · 🎵 ${snd}`,bar(r.qual,'var(--good)'),'hx')
   +cell('Bugs',r.bugs,r.bugs>=15,r.bugs>=15?'Kritisch hoch':'Bekannte Fehler',bar(Math.min(100,r.bugs*4),r.bugs>=15?'var(--bad)':'var(--warn)'),'hx')
   +cell('Prognose',fc==null?'–':'≈ '+fc,false,fc==null?'':metaLabel(fc),bar(fc||0,fc>=75?'var(--good)':fc>=50?'var(--gold)':'var(--bad)'),'hx')
   +cell('Wishlists',nf(r.wl,0),false,S.ea?'Early Access aktiv':'Vorbesteller-Interesse','','hx')
   +cell('Zeit',Math.round(r.zeit*S.dur/12)+' Mon.',r.zeit<0,S.round<STEPS.length?'Schritt '+(S.round+1)+'/'+STEPS.length:'Release',bar(S.round/STEPS.length*100,'var(--c-pers)'))
   +`<div class="hud-q" aria-label="Stand des Spiels"><span title="Gameplay">🎮 <b>${r.gp}</b></span><span title="Grafik">🎨 <b>${r.gfx}</b></span><span title="Sound">🎵 <b>${snd}</b></span><span title="Bugs" class="${r.bugs>=15?'neg':''}">🐞 <b>${r.bugs}</b></span><span title="Wertungsprognose" class="${fc>=75?'pos':fc<50?'neg':''}">🎯 <b>≈${fc??'–'}</b></span></div>`;
}

function renderTrack(){
  const el=$('track');if(!el)return;
  if(!S){el.innerHTML='';return}
  const fin=['launch','sales','end'].includes(S.screen);
  const ph=curStep().ph;
  el.innerHTML=PHASES.map((p,i)=>`<div class="${fin||i<ph?'done':i===ph?'now':''}">${i+1}. ${p}</div>`).join('');
}

function budgetAlert(){
  if(!S||S.res.budget<0)return '';
  const rw=runway(),left=monthsLeft();
  if(rw>3||rw>=left)return '';
  const plan=Object.keys(PLAN).filter(k=>PLAN[k].cost[S.plan[k]]>0).map(k=>PLAN[k].n);
  const tip=plan.length?`Senke rechts im Budget-Dock ${plan.join(', ')}, nimm eine Auftragsarbeit an oder suche frisches Geld.`:'Der Budgetplan ist schon auf Minimum. Jetzt hilft eine Auftragsarbeit oder frisches Geld.';
  const btn=`<div class="row"><button class="btn small alt" id="finBtn">Jetzt Finanzierung suchen (+8 auf Würfe)</button></div>`;
  if(rw<1)return `<div class="alert" role="alert"><b>Achtung: Pleite droht</b><span>Mit ${money(S.res.budget)} könnt ihr den nächsten Schritt (${money(stepCost())}) nicht mehr bezahlen. Am Ende des Schritts kommt die Notlage. ${tip}</span>${btn}</div>`;
  return `<div class="alert ${rw>1?'mid':''}" role="status"><b>Das Geld wird knapp</b><span>Das Budget reicht nur noch für ${rw} Monat${rw>1?'e':''}, bis zum Release sind es noch ${left}. ${tip}</span>${btn}</div>`;
}
function bindFin(){const b=$('finBtn');if(b)b.onclick=()=>openCrisis('event')}

function spendBlock(){
  if(!S)return '';
  const tot=spendTotal();
  if(!tot)return `<p class="note" style="margin:0">Noch nichts ausgegeben. Kosten werden am Ende jedes Schritts gebucht.</p>`;
  const keys=Object.keys(CAT).filter(k=>S.spend[k]>0);
  return `<div class="stack">${keys.map(k=>`<i style="width:${S.spend[k]/tot*100}%;background:var(${CAT[k][1]})" title="${CAT[k][0]}"></i>`).join('')}</div>
   <div class="legend">${keys.map(k=>`<div><s style="background:var(${CAT[k][1]})"></s><span>${CAT[k][0]}</span><span>${money(S.spend[k])}</span></div>`).join('')}<div><s></s><b>Gesamt</b><span><b>${money(tot)}</b></span></div></div>`;
}

function hallHTML(){
  if(!C||!C.hall.length)return '<p class="note" style="margin:0">Noch keine Spiele veröffentlicht.</p>';
  return `<div class="ledger"><table>${C.hall.map(h=>`<tr><td>${h.nr}. <b>${esc(h.title)}</b>${h.awards&&h.awards.length?` <span class="chip p">🏆 ${h.awards.length}× Award</span>`:''}<br><span class="note">${h.genre} · ${h.tier}${h.engine?' · '+esc(h.engine):''} · ${h.v}${h.dlc?' ('+esc(h.dlc)+')':''}</span></td><td>${h.meta!=null?`<b>${h.meta}</b> Pkt.${h.gp!=null?` <small class="note">(GP ${h.gp}/GFX ${h.gfx})</small>`:''}`:'–'}<br><span class="${h.erg>=0?'pos':'neg'}">${h.erg!=null?money(h.erg,true):''}</span></td></tr>`).join('')}</table></div>`;
}

let shopSubTab='invest'; // 'invest' | 'hire' | 'earn'
let shopCatFilter='all'; // 'all' | 'Marketing' | 'Qualität' | 'Studio' | 'Spekulativ'
let legendFilter='unlocked'; // 'unlocked' | 'locked' | 'all'

function engineBlock(){
  if(!C||!C.studio.engine)return `<div class="blk"><span class="label">Eigene Studio-Engine</span><p class="note" style="margin:0">Noch keine eigene Engine (in der Pre-Production baubar).</p></div>`;
  const eng=C.studio.engine;
  const ageInfo=getEngineAgeInfo(eng.age||0);
  const sc=S?T().scale:(C.studio.tier?TIERS[C.studio.tier].scale:1);
  return `<div class="blk">
    <div class="eng-box">
      <div class="eng-head">
        <b>⚙️ ${esc(eng.name)}</b>
        <span class="eng-ver">v${eng.version}.0</span>
      </div>
      <div class="chips">
        <span class="chip ${ageInfo.cls}">${ageInfo.label}</span>
        <span class="chip ${(eng.techPts||0)>0?'p':''}">🔬 ${eng.techPts||0} Pkt.</span>
        <span class="chip">${eng.modules.length}/8 Module</span>
        ${eng.techDebt?`<span class="chip n">Schulden: ${eng.techDebt}</span>`:''}
      </div>
      <button type="button" class="btn tiny ghost" data-goto-ws="engine">⚙️ Engine-Labor & Lizenzierung öffnen</button>
      <details class="fold">
        <summary>Engine-Details & Schnell-Lizenzierung</summary>
        <div class="fold-body">
          <div class="note">${ageInfo.desc} (${fmt(ageInfo.gfx)} GFX, ${fmt(ageInfo.gp)} GP${ageInfo.rev?`, ${fmt(ageInfo.rev)} Kritiker`:''})</div>
          <div class="mini">
            <div><span>Genres</span><span>${eng.genres.length?eng.genres.map(g=>GENRES[g]?.n||g).join(', '):'–'}</span></div>
          </div>
          <div class="field">
            <label class="label" for="engLicSel">Externe Lizenzierung</label>
            <select id="engLicSel">
              ${Object.entries(ENGINE_LIC_MODES).map(([k,v])=>`<option value="${k}" ${eng.licenseMode===k?'selected':''}>${v.n}${v.inc?` (+${money(Math.round(v.inc*eng.version*sc*ageInfo.licMult*10)/10)}/M)`:''}</option>`).join('')}
            </select>
          </div>
        </div>
      </details>
    </div>
  </div>`;
}

function staffBlock(){
  if(!C)return '';
  const list=C.studio.staff||[];
  if(!list.length)return `<div class="blk"><span class="label">Lead-Personal (0/${Object.keys(STAFF).length})</span><p class="note" style="margin:0">Noch keine Leads eingestellt. Über „👥 Personal“ oder 🌟 Zufallsbegegnungen rekrutierbar.</p></div>`;
  const sc=S?T().scale:(C.studio.tier?TIERS[C.studio.tier].scale:1);
  const canAct=S&&['event','shop'].includes(S.screen);
  return `<div class="blk">
    <span class="label">Lead-Personal (${list.length}/${Object.keys(STAFF).length})</span>
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
          <div class="dir-row">
            ${st.img?charPortraitHTML(st.img,st.isScene,'sm',false,st.personName):''}
            <div class="dir-info">
              <div class="staff-top">
                <b>${st.isLegend?'🌟 ':''}${esc(st.personName)}</b>
                <span class="staff-lvl">St.${lv}</span>
              </div>
              <div class="note">${def.n} · ${def.effDesc(lv)} · ${money(st.sal*sc*staffSalMult())}/M</div>
            </div>
          </div>
          <div class="loy-bar" title="Loyalität ${loy}/10 · XP ${st.xp||0}/${nextXp||'Max'}"><i style="width:${loy*10}%;background:${loyColor}"></i></div>
          ${canAct&&loy<10?`<div class="row" style="margin-top:2px">
            <button type="button" class="btn tiny alt" data-dock-bonus="${st.id}" ${S.res.budget<bonusCost?'disabled':''}>Bonus ${money(bonusCost)}</button>
            <button type="button" class="btn tiny ghost" data-dock-raise="${st.id}">Gehalt +20%</button>
          </div>`:''}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function dirBlock(){
  const d=D();
  const img=d.img||(DIRS[d.id]?.img)||null;
  const isScene=!!(d.isScene||DIRS[d.id]?.isScene);
  return `<div class="blk">
    <span class="label">Game Director</span>
    <div class="dir-row">
      ${img?charPortraitHTML(img,isScene,'sm',false,d.n):''}
      <div class="dir-info">
        <div><b>${esc(d.n)}</b> <span class="note">${esc(d.tag)}</span></div>
        <div class="note">${dirStatLine(d.s)}</div>
      </div>
    </div>
    ${S&&d.ab&&ABIL[d.ab]?`<div class="row"><button class="btn small ${S.abUsed?'ghost':'alt'}" id="abBtn" title="${esc(ABIL[d.ab].d)}" ${abilityReady()?'':'disabled'}>⚡ ${S.abUsed?'Eingesetzt: ':''}${ABIL[d.ab].n}</button>${S&&C.dir.wealth>0&&ACTIVE.includes(S.screen)&&!['roll','manual'].includes(S.screen)?`<button class="btn small ghost" id="privBtn">Privatgeld (${money(C.dir.wealth)})</button>`:''}</div>`:S&&C.dir.wealth>0&&ACTIVE.includes(S.screen)&&!['roll','manual'].includes(S.screen)?`<div class="row"><button class="btn small ghost" id="privBtn">Privatgeld zuschießen (${money(C.dir.wealth)})</button></div>`:''}
    <details class="fold">
      <summary>📋 Director-Details (Fame ${C.dir.fame} · ${d.perks.length} Vorteile · ${d.flaws.length} Macken)</summary>
      <div class="fold-body">
        ${S&&d.ab&&ABIL[d.ab]?`<div class="note"><b>${ABIL[d.ab].n}:</b> ${ABIL[d.ab].d}</div>`:''}
        <div class="mini"><div><span>Fame</span><span>${C.dir.fame}/100</span></div><div><span>Privatkonto</span><span>${money(C.dir.wealth)}</span></div><div><span>Fertige Spiele</span><span>${C.dir.games}</span></div></div>
        <div class="traits">${d.perks.map(p=>`<div><b class="p">+ ${PERKS[p].n}</b><span>${PERKS[p].d}</span></div>`).join('')}${d.flaws.map(f=>`<div><b class="n">− ${FLAWS[f].n}</b><span>${FLAWS[f].d}</span></div>`).join('')}${S&&S.aff?`<div><b class="${S.aff>0?'p':'n'}">${S.aff>0?'+':'−'} Genre</b><span>${S.aff>0?'Liegt ihm':'Liegt ihm nicht'}: ${fmt(Math.sign(S.aff)*4+(hasP('spezial')&&S.aff>0?3:0))} auf alle Würfe</span></div>`:''}${S&&S.promises?`<div><b class="n">− Versprechen</b><span>${S.promises} offen (−${2*S.promises} Wertung)</span></div>`:''}</div>
      </div>
    </details>
  </div>`;
}

function milestoneBlock(){
  if(!S)return '';
  ensureMilestone();
  const ms=S.milestone;
  if(!ms)return '';
  return `<details class="fold">
    <summary>🎯 Meilenstein M${ms.month}: ${esc(ms.label)} ${ms.done?'(✓)':''}</summary>
    <div class="fold-body">
      <div class="note">Ziel bis Ende „${STEPS[stepIndex(ms.at)].n}“: <b>${esc(ms.desc)}</b></div>
      <div class="mini"><div><span>Prämie</span><span class="pos">+${money(ms.reward)} & +1 Moral</span></div></div>
    </div>
  </details>`;
}

function trendBlock(){
  if(!C||!C.trend)return '';
  const tr=C.trend;
  const hotG=GENRES[tr.hot]?.n||tr.hot;
  const coldG=GENRES[tr.cold]?.n||tr.cold;
  return `<div class="chips" title="${esc(tr.note||'Markttrend der aktuellen Saison')}">
    <span class="chip p">🔥 Boom: ${hotG} (+15%)</span>
    <span class="chip n">❄️ Kalt: ${coldG} (−10%)</span>
  </div>`;
}

/* ===================== Linke Spalte: Projekt- & Studio-Bogen (#sheet) ===================== */
function bindSheetEvents(sh){
  const ab=$('abBtn');if(ab)ab.onclick=useAbility;
  const pb=$('privBtn');if(pb)pb.onclick=privatZuschuss;
  sh.querySelectorAll('[data-xp]').forEach(b=>b.onclick=()=>{if(C.dir.xp<=0)return;const k=b.dataset.xp;if(C.dir.s[k]>=4)return;C.dir.s[k]++;C.dir.xp--;renderSheet();save()});
  sh.querySelectorAll('[data-perk]').forEach(b=>b.onclick=()=>{C.dir.perks.push(b.dataset.perk);C.dir.perkUnlocked=true;renderSheet();save()});
  sh.querySelectorAll('[data-goto-ws]').forEach(b=>b.onclick=()=>{wsTab=b.dataset.gotoWs;render()});
  bindZoomTriggers(sh);
}

// Stand des Spiels: drei Teilwertungen, Gewichte, Abzüge und Prognose
function qualPanel(){
  const qb=qualBreakdown(),r=S.res,fc=reviewForecast();
  const row=(ic,n,v,sub,col,pct)=>`<div class="qp-row"><span>${ic} ${n}</span><div class="hud-bar"><i style="width:${clamp(pct??v,2,100)}%;background:${col}"></i></div><b>${v}</b><small>${sub}</small></div>`;
  const adj=[qb.gpGap?`schwaches Gameplay −${qb.gpGap}`:'',qb.loGap?`Schwachstelle −${qb.loGap}`:'',qb.harmony?`rundes Paket +${qb.harmony}`:''].filter(Boolean);
  return `<div class="qual-panel">
    <div class="qp-head"><span class="label">Stand des Spiels</span><span class="mc ${metaCls(fc)}" title="Wertungsprognose bei durchschnittlichem Review-Wurf">≈ ${fc}</span></div>
    ${row('🎮','Gameplay',r.gp,Math.round(qb.w.gp*100)+' %','var(--c-pers)')}
    ${row('🎨','Grafik',r.gfx,Math.round(qb.w.gfx*100)+' %','var(--c-tools)')}
    ${row('🎵','Sound',r.snd??qb.avg,Math.round(qb.w.snd*100)+' %','var(--accent)')}
    ${row('🐞','Bugs',r.bugs,S.works?'zählen nicht':'−'+Math.round(r.bugs*1.2)+' Wertung',r.bugs>=15?'var(--bad)':'var(--warn)',r.bugs*4)}
    <div class="note">Qualität <b>${r.qual}</b> = gewichteter Schnitt ${qb.avg}${adj.length?' · '+adj.join(' · '):''}. Prognose: ${metaLabel(fc)}.</div>
  </div>`;
}

function cryptoBlock(){
  const c=S.crypto;if(!c)return '';
  if(!c.done)return `<div class="alert mid"><b>🪙 Krypto-Position: ${money(c.amt)}</b><span>$MOONCAT · Auflösung am Ende von Schritt ${c.due}</span></div>`;
  return `<div class="note">🪙 Krypto: ${money(c.amt)} eingesetzt → ${c.pay>0?money(c.pay)+' ausgezahlt (×'+nf(c.pay/c.amt,1)+')':'Totalverlust'}</div>`;
}

function renderSheet(){
  const sh=$('sheet');
  if(!sh)return;
  if(!S){
    if(!C){
      const unlCount=getUnlockedChars().length;
      const totCount=LEGEND_KEYS.length;
      sh.innerHTML=`
      ${studioBannerHTML()}
      <h2>So läuft Studio W100</h2>
      <p class="note" style="margin:0">Gründet euer Studio, wählt einen Game Director und führt euer Projekt durch fünf Phasen vom Konzept bis zum Release mit <b>W100-Proben</b> (Krit ab 96, Patzer 1–5).</p>
      <details class="fold" open>
        <summary>🌟 ${totCount} Branchen-Legenden (${unlCount}/${totCount})</summary>
        <div class="fold-body"><p class="note" style="margin:0">Zu Beginn ist keine Legende freigeschaltet. Die erste gibt es beim ersten <b>Top-Erfolg</b> (Wertung ab 80 oder Hit), eine weitere beim ersten <b>Double-A- oder Triple-A-Release</b>. Danach tauchen Legenden als <b>Zufallsbegegnung</b> auf und werden durch Anwerben dauerhaft freigeschaltet.</p></div>
      </details>
      <details class="fold">
        <summary>⚙️ Engine-Labor, Rivalen & GOTY</summary>
        <div class="fold-body"><p class="note" style="margin:0">Baut ab der Pre-Production eine eigene Engine mit 8 Modulen im Tech-Tree, lizenziert sie extern (Vorsicht vor Alterung!) und tretet bei den jährlichen <b>GOTY-Awards</b> gegen 5 KI-Rivalen an.</p></div>
      </details>`;
      return;
    }
    const d=D();
    sh.innerHTML=`
      ${studioBannerHTML()}
      <div><div class="label">Studio-Zentrale</div><h2>${esc(C.studio.name)}</h2></div>
      <div class="mini">
        <div><span>Studio-Fame</span><span>${C.studio.fame}/100</span></div>
        <div><span>Studiokasse</span><span class="${C.studio.kasse<0?'neg':''}">${money(C.studio.kasse)}</span></div>
        <div><span>Gehaltsspirale</span><span class="${(C.studio.salaryDrift||0)>0.2?'wrn':''}">+${Math.round((C.studio.salaryDrift||0)*100)} %</span></div>
        <div><span>Infrastruktur</span><span>+${nf(C.studio.overheadDrift||0,1)}× Basis/M</span></div>
      </div>
      ${trendBlock()}
      ${dirBlock()}
      ${C.dir.xp>0?`<div class="blk"><span class="label">Erfahrung: ${C.dir.xp} Punkt${C.dir.xp>1?'e':''} verteilen</span>${Object.entries(DSTAT).map(([k,[n]])=>`<div class="bstat"><b>${n}</b><div class="step"><span>${d.s[k]}</span><button type="button" data-xp="${k}" aria-label="${n} erhöhen" ${d.s[k]>=4?'disabled':''}>+</button></div></div>`).join('')}</div>`:''}
      ${C.dir.games>=3&&!C.dir.perkUnlocked?`<details class="fold" open><summary>⭐ Neuer Vorteil freischaltbar!</summary><div class="fold-body">${Object.entries(PERKS).filter(([k])=>!d.perks.includes(k)).map(([k,p])=>`<button class="opt" data-perk="${k}"><span class="t">${p.n}</span><span class="d">${p.d}</span></button>`).join('')}</div></details>`:''}
      <details class="fold"><summary>🏆 Ruhmeshalle (${C.hall.length} Spiele)</summary><div class="fold-body">${hallHTML()}</div></details>`;
    bindSheetEvents(sh);
    return;
  }

  recalcQual();
  const t=T();
  sh.innerHTML=`
    ${studioBannerHTML()}
    <div>
      <div class="label">${t.n} · ${MODELS[S.model].n} · ${S.seq?'Fortsetzung':IPS[S.ip].n}</div>
      <h2>${esc(S.title)}</h2>
      <div class="note">${esc(C.studio.name)} · ${genreName(S)} · ${t.team} Leute${C.studio.staff.length?' + '+C.studio.staff.length+' Leads':''}${(S.extras&&S.extras.length)?' · '+S.extras.map(k=>PROJECT_EXTRAS[k]?.n.replace(/^[^\s]+\s/,'')).filter(Boolean).join(', '):(S.mods?' · Mod-Support':'')+(S.ea?' · Early Access':'')}${S.model==='f2p'?` · ${clamp(4+S.payers,1,12)} % Zahlende`:''}</div>
      <div class="note">${[S.engine&&'Engine: '+(S.engine==='eigen'?(C.studio.engine?.name||'Eigenbau'):ENGINE_DEFS[S.engine]?.short),S.world&&'Welt: '+{open:'Open World',hub:'Hubs',level:'Level',schlauch:'Schlauch'}[S.world],S.plat&&'Plattform: '+{pc:'PC',konsole:'PC + Konsolen',exklusiv:'PlayStatus exklusiv',alle:'Überall'}[S.plat],S.age!=null&&'USK '+S.age].filter(Boolean).join(' · ')}</div>
    </div>
    ${qualPanel()}
    <div class="stats">${Object.keys(STATS).map(k=>`<div class="stat"><b>${fmt(modFor(k)).replace('±','+')}</b><span>${STATS[k]}</span></div>`).join('')}</div>
    <div class="insp"><span class="label">Inspiration</span>${[0,1,2].map(i=>`<span class="pip ${i<S.insp?'on':''}"></span>`).join('')}<span class="note">Moral ${fmt(moralMod())}</span></div>
    ${trendBlock()}
    ${milestoneBlock()}
    ${cryptoBlock()}
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
    const unl=getUnlockedChars().length;
    const tot=LEGEND_KEYS.length;
    dk.innerHTML=`<div>
      <span class="label">W100-Kurzreferenz</span>
      <div class="mini" style="margin-top:6px">
        <div><span>Kritischer Erfolg</span><span class="pos">96–100 (+1 Insp.)</span></div>
        <div><span>Kritischer Patzer</span><span class="neg">1–5 (Zusatzschaden)</span></div>
        <div><span>Vorteil (Inspiration)</span><span>2× W100 (besserer zählt)</span></div>
        <div><span>Entdeckte Legenden</span><span class="pos">${unl} / ${tot}</span></div>
      </div>
    </div>
    <details class="fold">
      <summary>🏆 5 KI-Rivalen (GOTY-Konkurrenz)</summary>
      <div class="fold-body">
        <div class="mini">
          ${BASE_RIVALS.map(r=>`<div><span><b>${esc(r.name)}</b></span><span>${GENRES[r.fav]?.n||r.fav}</span></div>`).join('')}
        </div>
      </div>
    </details>`;
    return;
  }

  const editable=S&&['event','mand','lang','random','legend','result','shop','crisis'].includes(S.screen);
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
        <div class="blk" style="padding-top:4px;border-top:0">
          <div class="burn"><span>Monatliche Gesamtkosten</span><b>${money(costPerMonth())}/Monat</b></div>
          <div class="plan">${Object.entries(PLAN).map(([k,p])=>`<div class="prow" title="${esc(p.d)}"><span class="pn">${p.n} <small class="note">(${money(p.cost[S.plan[k]]*t.scale,true)})</small></span><div class="seg" role="group" aria-label="${p.n}">${p.lv.map((l,i)=>`<button type="button" data-pk="${k}" data-pl="${i}" aria-pressed="${S.plan[k]===i}" ${editable?'':'disabled'}>${l}</button>`).join('')}</div></div>`).join('')}</div>
        </div>
        <details class="fold">
          <summary>📊 Kosten-Aufschlüsselung (${money(monthSum())}/M)</summary>
          <div class="fold-body">
            <div class="legend">${monthLines().map(([c,v])=>`<div><s style="background:var(${CAT[c][1]})"></s><span>${CAT[c][0]}</span><span>${money(v)}</span></div>`).join('')}</div>
          </div>
        </details>
        <details class="fold">
          <summary>🧾 Bisherige Ausgaben (${money(spendTotal())})</summary>
          <div class="fold-body">
            ${spendBlock()}
            ${S.income?`<div class="burn"><span>Vorab-/Auftrags-Einnahmen</span><span class="pos">${money(S.income,true)}</span></div>`:''}
            ${S.loan?`<div class="burn"><span>Kredit offen</span><span class="neg">${money(S.loan)}</span></div>`:''}
            ${S.recoup?`<div class="burn"><span>Vorschüsse (Recoup)</span><span>${money(S.recoup)}</span></div>`:''}
          </div>
        </details>
      `:`
        <div class="blk" style="padding-top:4px;border-top:0">
          <span class="label">Finanz-Status vor Projektstart</span>
          <div class="mini">
            <div><span>Verfügbare Studiokasse</span><b>${money(C.studio.kasse)}</b></div>
            <div><span>Gehaltsinflation</span><span>+${Math.round((C.studio.salaryDrift||0)*100)} %</span></div>
            <div><span>Infrastruktur-Stufe</span><span>+${nf(C.studio.overheadDrift||0,1)}× Basis</span></div>
            <div><span>Aktive Leads</span><span>${C.studio.staff.length} / 6</span></div>
          </div>
        </div>
        ${engineBlock()}
      `}
    `:dockTab==='team'?`
      ${staffBlock()}
      ${engineBlock()}
    `:`
      <div class="blk" style="padding-top:4px;border-top:0">
        <span class="label">Live-Würfelprotokoll (W100)</span>
        <ol class="log-list" id="log">${(S&&S.log.length?S.log:[]).map(l=>`<li>${l}</li>`).join('')||'<li class="note">Noch keine Würfe in diesem Projekt.</li>'}</ol>
      </div>
    `}
  `;

  dk.querySelectorAll('[data-dtab]').forEach(b=>b.onclick=()=>{dockTab=b.dataset.dtab;renderDock()});
  dk.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>{S.plan[b.dataset.pk]=+b.dataset.pl;renderDock();renderHud();if(S.screen==='event')renderMain();save()});
  const engSel=$('engLicSel');if(engSel)engSel.onchange=e=>setEngineLicense(e.target.value);
  dk.querySelectorAll('[data-goto-ws]').forEach(b=>b.onclick=()=>{wsTab=b.dataset.gotoWs;render()});
  dk.querySelectorAll('[data-dock-bonus]').forEach(b=>b.onclick=()=>rewardStaff(b.dataset.dockBonus,'bonus'));
  dk.querySelectorAll('[data-dock-raise]').forEach(b=>b.onclick=()=>rewardStaff(b.dataset.dockRaise,'raise'));
  bindZoomTriggers(dk);
}

/* ===================== Mittlere Spalte: Workspace-Navigation (#wsNav) ===================== */
/* ===================== Handy: Overlays für Studio, Budget und Mehr-Menü ===================== */
let mobOv=null;
function syncMobBar(){
  document.querySelectorAll('[data-mob]').forEach(b=>{
    const t=b.dataset.mob;
    b.classList.toggle('on',mobOv?mobOv===t:(t==='main'&&wsTab==='board'));
  });
}
function setMobOv(v){
  mobOv=v;
  document.body.dataset.ov=v||'';
  syncMobBar();
  if(v==='sheet'||v==='dock'){const el=$(v);if(el)el.scrollTop=0}
}
function mobNav(t){
  if(t==='main'){
    setMobOv(null);
    if(wsTab!=='board'||(S&&S.screen==='shop')){
      wsTab='board';
      if(S&&S.screen==='shop'){S.shopMsg=null;S.screen='event'}
      render();
    }
    window.scrollTo({top:0});
    return;
  }
  setMobOv(mobOv===t?null:t);
}
function renderMobMore(nav,activeTab,eng){
  const mm=$('mobMore'),btn=$('mobMoreBtn');
  if(!mm)return;
  const tools=[['tgProfile','👤 Spieler'],['tgExport','📜 Export'],['tgTheme','🌓 Design'],['tgManual',manual?'🎲 Echter W100 (an)':'🎲 Echter W100'],['tgNew','↺ Karriere neu']];
  mm.innerHTML=`<div class="mm-head"><span class="label">Bereiche</span><button type="button" class="btn tiny ghost" data-mmclose>Schließen</button></div>
    <div class="mm-grid">${nav.innerHTML}<button type="button" class="ws-tab" data-mmlog>🎲 Würfel-Log</button></div>
    <span class="label">Einstellungen</span>
    <div class="mm-grid">${tools.map(([id,l])=>`<button type="button" class="ws-tab" data-mmtool="${id}">${l}</button>`).join('')}</div>`;
  mm.querySelector('[data-mmclose]').onclick=()=>setMobOv(null);
  mm.querySelector('[data-mmlog]').onclick=()=>{dockTab='log';renderDock();setMobOv('dock')};
  mm.querySelectorAll('[data-mmtool]').forEach(b=>b.onclick=()=>{setMobOv(null);const t=$(b.dataset.mmtool);if(t)t.click()});
  if(btn)btn.classList.toggle('has-dot',!!(eng&&(eng.techPts||0)>0));
  syncMobBar();
}

function renderWsNav(){
  const nav=$('wsNav');
  if(!nav)return;
  nav.hidden=false;

  const inShop=S&&S.screen==='shop';
  const activeTab=inShop&&wsTab==='board'?'shop':wsTab;
  const eng=C?.studio?.engine;
  const tpBadge=eng&&(eng.techPts||0)>0?`<span class="dot">${eng.techPts}</span>`:'';
  const staffBadge=C?`<span class="dot">${C.studio.staff.length}/${Object.keys(STAFF).length}</span>`:'';
  const rivalsCount=C?getAllRivals().length:BASE_RIVALS.length;
  const unlCount=getUnlockedChars().length;
  const totCount=LEGEND_KEYS.length;

  nav.innerHTML=`
    <button type="button" class="ws-tab ${activeTab==='board'?'active':''}" data-wstab="board">
      🃏 ${S?`Spieltisch (${stepTag()})`:C?'Neues Projekt':'Studio gründen'}
    </button>
    ${S?(()=>{
      const canShop=['event','shop'].includes(S.screen);
      const lock=canShop?'':` disabled title="Nur zu Beginn eines Schritts verfügbar"`;
      return `
      <button type="button" class="ws-tab ${activeTab==='shop'&&shopSubTab==='invest'?'active':''}" data-wstab="shop" data-sub="invest"${lock}>
        🛒 Investieren
      </button>
      <button type="button" class="ws-tab ${activeTab==='shop'&&shopSubTab==='hire'?'active':''}" data-wstab="shop" data-sub="hire"${lock}>
        👥 Personal ${staffBadge}
      </button>
      <button type="button" class="ws-tab ${activeTab==='shop'&&shopSubTab==='earn'?'active':''}" data-wstab="shop" data-sub="earn"${lock}>
        💼 Geld verdienen
      </button>`;
    })():''}
    ${C?`
      <button type="button" class="ws-tab ${activeTab==='engine'?'active':''}" data-wstab="engine">
        ⚙️ Engine-Labor ${tpBadge}
      </button>
      <button type="button" class="ws-tab ${activeTab==='league'?'active':''}" data-wstab="league">
        🏆 Liga (${rivalsCount})
      </button>
    `:''}
    <button type="button" class="ws-tab ${activeTab==='legends'?'active':''}" data-wstab="legends">
      🌟 Legenden (${unlCount}/${totCount})
    </button>
  `;

  renderMobMore(nav,activeTab,eng);
  document.querySelectorAll('#wsNav [data-wstab],#mobMore [data-wstab]').forEach(b=>b.onclick=()=>{
    setMobOv(null);
    const target=b.dataset.wstab;
    if(b.dataset.sub)shopSubTab=b.dataset.sub;
    wsTab=target;
    if(S){
      if(target==='shop'&&S.screen==='event'){S.shopMsg=null;S.screen='shop'}
      else if(target==='board'&&S.screen==='shop'){S.shopMsg=null;S.screen='event'}
    }
    render();
  });
}

/* ===================== Legenden-Album (Mit Filter-Tabs gegen langes Scrollen) ===================== */
function renderLegendsView(m){
  const unl=getUnlockedChars();
  const allEntries=Object.entries(DIRS).filter(([k])=>LEGEND_KEYS.includes(k));
  const filtered=legendFilter==='unlocked'?allEntries.filter(([k])=>isCharUnlocked(k))
    :legendFilter==='locked'?allEntries.filter(([k])=>!isCharUnlocked(k))
    :allEntries;

  m.innerHTML=`<div class="staff-top">
      <span class="stamp">🌟 Halle der Branchen-Legenden (${unl.length} / ${allEntries.length})</span>
      <button class="btn small ghost" id="backBoard">← Zurück zum Spieltisch</button>
    </div>
    <p class="note" style="margin:0">Zu Beginn sind alle ${allEntries.length} Legenden gesperrt. Die erste gibt es beim ersten Top-Erfolg (Wertung ab 80 oder Hit), eine weitere beim ersten Double-A- oder Triple-A-Release, danach über Zufallsbegegnungen. <i>(Klick auf ein Porträt vergrößert die Sammelkarte.)</i></p>
    <div class="sub-tabs" role="tablist">
      <button type="button" class="sub-tab ${legendFilter==='unlocked'?'active':''}" data-lfilt="unlocked">⭐ Freigeschaltet (${unl.length})</button>
      <button type="button" class="sub-tab ${legendFilter==='locked'?'active':''}" data-lfilt="locked">🔒 Unentdeckt (${allEntries.length-unl.length})</button>
      <button type="button" class="sub-tab ${legendFilter==='all'?'active':''}" data-lfilt="all">Alle (${allEntries.length})</button>
    </div>
    ${filtered.length?'':`<p class="note">${legendFilter==='unlocked'?'Noch keine Legende freigeschaltet.':'Alle Legenden sind freigeschaltet.'}</p>`}
    <div class="legend-grid">
      ${filtered.map(([k,o])=>{
        const ok=isCharUnlocked(k);
        const roleName=STAFF[o.leadRole]?.n||'Spezialist';
        if(!ok){
          return `<div class="legend-card locked">
            ${charPortraitHTML(o.img,o.isScene,'sm',true,o.n)}
            <div class="dir-info">
              <b>🔒 ${esc(o.tag)}</b>
              <div class="note">Rolle: ${roleName} · Zufallsbegegnung im Spiel</div>
            </div>
          </div>`;
        }
        return `<div class="legend-card">
          ${charPortraitHTML(o.img,o.isScene,'md',false,o.n)}
          <div class="dir-info">
            <div class="staff-top">
              <b>${esc(o.n)}</b>
              <span class="chip p">Freigeschaltet ✓</span>
            </div>
            <div class="note"><b>${esc(o.tag)}</b> · Lead-Rolle: ${roleName}</div>
            <code style="font:500 11px var(--f-mono)">${dirStatLine(o.s)}</code>
            <details class="fold">
              <summary>Biografie & Spezialfähigkeit (${ABIL[o.ab]?.n||o.ab})</summary>
              <div class="fold-body">
                <div class="note">${esc(o.d)}</div>
                <div class="note"><b>${ABIL[o.ab]?.n||o.ab}:</b> ${ABIL[o.ab]?.d||''}</div>
              </div>
            </details>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  bindZoomTriggers(m);
  m.querySelectorAll('[data-lfilt]').forEach(b=>b.onclick=()=>{legendFilter=b.dataset.lfilt;renderLegendsView(m)});
  $('backBoard').onclick=()=>{wsTab='board';render()};
}

/* ===================== Engine-Labor (Interaktiver Tech-Tree) ===================== */
function renderEngineLab(m){
  const eng=C.studio.engine;
  if(!eng){
    m.innerHTML=`<span class="stamp">⚙️ Engine-Labor</span>
      <h3>Noch keine eigene Studio-Engine</h3>
      <p>Euer Studio nutzt aktuell externe Engines (Unreal, Unity oder Godot). Sobald ihr in der <b>Pre-Production eines Projekts</b> (Schritt „Engine & Pipeline“) die Grundsatzentscheidung <b>„Eigene Engine im Haus bauen“</b> wählt, entsteht hier euer permanentes Engine-Forschungslabor!</p>
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
  const ptCost=S?researchCost():0;
  const modCost=S?moduleCost():0;
  const cashAvail=S?S.res.budget:C.studio.kasse;
  const branches=['Grafik & Präsentation','Gameplay & Welt','Netzwerk & Pipeline'];

  m.innerHTML=`<span class="stamp">⚙️ Engine-Forschungslabor</span>
    <h3>${esc(eng.name)} <span class="eng-ver">v${eng.version}.0</span></h3>
    <p>Hier erforscht ihr permanente Architektur-Module für eure hauseigene Engine und steuert deren Lizenzierung. Forschungspunkte (🔬) gibt es durch einen F&E-Sprint während eines Spiels, Top-Wertungen und vor allem durch <b>Engine-Projekte</b> zwischen zwei Spielen. Dort findet auch das Generations-Upgrade statt.</p>
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
        <button type="button" class="btn small alt" id="buyTechPtBtn" ${!S||S.researchSprint||cashAvail<ptCost||eng.modules.length>=8?'disabled':''}>🔬 Forschungs-Sprint finanzieren (${S?S.researchSprint?'in diesem Projekt schon genutzt':money(ptCost)+' · −1 Moral · +1 Bug → +1 Forschungspunkt':'nur während eines Projekts'})</button>
      </div>
    </div>
    ${branches.map(br=>`
      <div class="shopcat">
        <span class="label">Technologie-Zweig: ${br}</span>
        <div class="tech-grid">
          ${Object.entries(ENGINE_MODULES).filter(([,mod])=>mod.branch===br).map(([id,mod])=>{
            const unlocked=eng.modules.includes(id);
            const reqOk=!mod.req||eng.modules.includes(mod.req);
            const canUnlock=!!S&&!unlocked&&reqOk&&(eng.techPts||0)>=(mod.costPts||1)&&cashAvail>=modCost;
            return `<div class="tech-node ${unlocked?'unlocked':!reqOk?'locked':''}">
              <div class="tech-head">
                <b>${esc(mod.n)}</b>
                <span class="chip ${unlocked?'p':canUnlock?'':'n'}">${unlocked?'Aktiv ✓':mod.req&&!reqOk?`Benötigt: ${ENGINE_MODULES[mod.req]?.n}`:`${mod.costPts||1} 🔬 Punkt`}</span>
              </div>
              <span class="note">${esc(mod.d)}</span>
              ${!unlocked?`<div class="row" style="margin-top:4px">
                <button type="button" class="btn tiny ${canUnlock?'alt':'ghost'}" data-unlock-mod="${id}" ${canUnlock?'':'disabled'}>${canUnlock?`Freischalten (1 🔬 · ${money(modCost)} · −1 Moral)`:!reqOk?'Vorstufe fehlt':!S?'Nur während eines Projekts':(eng.techPts||0)<1?'Forschungspunkt nötig':'Budget reicht nicht'}</button>
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
  const tr=C.trend||{hot:'rpg',cold:'sports',note:''};
  const lastAwards=C.lastAwards||[];

  m.innerHTML=`<span class="stamp">🏆 Branchen-Liga, Trends & Ruhmeshalle</span>
    <h3>Konkurrenz-Studios & Markt-Radar</h3>
    <p>Ihr teilt euch den Markt mit etablierten Rivalen — und mit ehemaligen Leads eures Studios, die nach einer Abwerbung ihre eigene Firma gegründet haben. Bei jedem Release werden die <b>Game of the Year Awards</b> vergeben!</p>

    <div class="alert mid">
      <b>Aktueller Markt-Trend der Saison</b>
      <span>🔥 <b>Boom-Genre: ${GENRES[tr.hot]?.n||tr.hot}</b> (+15 % Verkäufe & +1 Start-Hype) · ❄️ <b>Übersättigt: ${GENRES[tr.cold]?.n||tr.cold}</b> (−10 % Verkäufe).<br>${esc(tr.note||'')}</span>
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
    const g=worldFit();
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
  const L={moral:'Moral',hype:'Hype',qual:'Qualität',gp:'Gameplay',gfx:'Grafik',snd:'Sound',bugs:'Bugs',zeit:'Zeit'};
  return `<div class="monthnote" onclick="this.classList.toggle('open')">Monat ${STEPS[M.n-1]?.n} abgerechnet: ${money(M.sum)} Kosten${M.ea?' · '+money(M.ea,true)+' Early Access':''}${M.lic?' · '+money(M.lic,true)+' Engine-Lizenzen':''} · +${nf(M.wl,0)} Wishlists${M.pc.length?' · '+M.pc.map(([k,v])=>fmt(v)+' '+(L[k]||k)).join(' · '):''}${M.notes.length?' · '+M.notes.join(' · '):''}</div>`;
}

function headFor(kind,ev){
  const banner=eventBannerHTML(kind,ev);
  if(kind==='card'){const c=E[ev];return monthNote()+banner+`<span class="label">${stepLabel()}</span><h3>${c.t}</h3><p class="evx" onclick="this.classList.toggle('open')">${vx(c)}</p>`}
  if(kind==='mand'){const c=getMand(ev);return banner+`<span class="stamp">Grundsatzentscheidung · ${stepLabel()}</span><h3>${c.t}</h3><p class="evx" onclick="this.classList.toggle('open')">${c.x}</p>`}
  if(kind==='rand'){const rv=R[ev];return banner+`<span class="stamp">${rv.flaw?'Macke des Directors':'Zufallsereignis'} · Ende ${STEPS[S.round-1]?.n||''}</span><h3>${rv.t}</h3><p class="evx" onclick="this.classList.toggle('open')">${vx(rv)}</p>`}
  if(kind==='legend'){
    const leg=DIRS[ev]||{n:'Branchen-Legende',tag:'',encStory:''};
    return banner+`<span class="stamp">🌟 Legendäre Begegnung · Ende ${STEPS[S.round-1]?.n||''}</span>
      <div class="legend-enc">
        ${charPortraitHTML(leg.img,leg.isScene,'lg',false,leg.n)}
        <div class="dir-info">
          <h3>${esc(leg.n)} <small class="note">(${esc(leg.tag)})</small></h3>
          <p style="margin:4px 0">${esc(leg.encStory||leg.d)}</p>
        </div>
      </div>`;
  }
  if(kind==='shop'){const it=SHOP.find(x=>x.id===ev);return `<span class="stamp">Studio-Shop</span><h3>${it.n}</h3><p>${it.d}</p>`}
  if(kind==='hire'){const s=STAFF[ev];return `<span class="stamp">Personal</span><h3>${s.n}</h3><p>${s.d}</p>`}
  if(kind==='contract'){const ct=CONTRACTS.find(x=>x.id===ev)||{n:'Auftragsarbeit',d:''};return `<span class="stamp">Auftragsarbeit</span><h3>${ct.n}</h3><p>${ct.d}</p>`}
  if(kind==='dlc'){const d=DLC_OPTS.find(x=>x.id===ev);return `<span class="stamp">Post-Release</span><h3>${d.n}</h3><p>${d.d}</p>`}
  const r=RESC.find(x=>x.id===ev);return banner+`<span class="stamp">Notlage</span><h3>${r.n}</h3><p>${r.d}</p>`;
}

function renderInterview(m){
  const iv=S.iv;
  if(!iv){goMonth();return}
  const o=INTERVIEW_OUTLETS[iv.o];
  const past=iv.res.map((x,n)=>{
    const q=INTERVIEW_QS[x.qi],a=q.a[x.ai];
    return `<div class="iv-past ${x.ok?'ok':'bad'}">
      <span class="note">Frage ${n+1}: ${esc(fillTxt(q.q))}</span>
      <b>„${esc(fillTxt(a.l))}“</b>
      <span>${x.ok?'✅':'❌'} W100 ${x.r} (brauchte ≤ ${x.pct}) · ${esc(fillTxt(x.ok?a.sx:a.fx))}</span>
      ${chips(x.ch)}
    </div>`;
  }).join('');
  const done=iv.i>=iv.qs.length;
  let body='';
  if(done){
    const good=iv.res.filter(x=>x.ok).length;
    body=`<div class="alert ${good>=2?'good':'mid'}"><b>Interview beendet: ${good} von ${iv.res.length} Antworten kamen gut an</b><span>${good===3?'Das Interview wird überall geteilt.':good===0?'Der Clip mit euren Antworten macht als Meme die Runde.':'Ein solider Auftritt mit ein paar Wacklern.'}</span></div>
      <button class="btn" id="ivDone">Weiter zu „${curStep().n}“</button>`;
  }else{
    const q=INTERVIEW_QS[iv.qs[iv.i]];
    body=`<span class="label">Frage ${iv.i+1} von ${iv.qs.length}</span><h3>„${esc(fillTxt(q.q))}“</h3>
      <div class="opts">${q.a.map((a,ai)=>`<button class="opt" data-iva="${ai}">
        <span class="t">„${esc(fillTxt(a.l))}“</span>
        <span class="check ${a.tone==='safe'?'safe':''}">${IV_TONES[a.tone]||a.tone} · ${ivChance(a)} %</span>
        <span class="d">Bei Erfolg: ${chips(previewSafe(a.s||{}))||'kaum Wirkung'} Bei Misserfolg: ${chips(previewSafe(a.f||{}))||'kaum Wirkung'}</span>
      </button>`).join('')}</div>`;
  }
  m.innerHTML=`<span class="stamp">🎙️ Interview · ${esc(o.k)} · Ende ${STEPS[S.round-1]?.n||''}</span>
    <h3>${esc(o.n)} will mit ${esc(C.dir.n)} über „${esc(S.title)}“ sprechen</h3>
    <p class="note" style="margin:0">Drei Fragen, jede Antwort ist ein W100-Wurf. Der Hype-Wert des Directors, der aktuelle Hype und das Format beeinflussen die Chancen.</p>
    ${past}${body}`;
  m.querySelectorAll('[data-iva]').forEach(b=>b.onclick=()=>answerInterview(+b.dataset.iva));
  const d=$('ivDone');if(d)d.onclick=finishInterview;
}

function renderLegendEncounter(m){
  m.className='card rnd';
  const legKey=S.curLegend;
  const leg=DIRS[legKey];
  if(!leg){goMonth();return}
  const sc=T().scale;
  const hireCost=legendHireCost();
  const role=leg.leadRole||'senior';
  const roleDef=STAFF[role];
  const o=getOpt({kind:'legend',ev:legKey});
  const target=dc100(o.dc);
  const mod=optMod(o)+(o.bonusV||0)+moralMod();
  const pct=winChance(target,mod,false);
  const alreadyUnlocked=isCharUnlocked(legKey);

  m.innerHTML=budgetAlert()+headFor('legend',legKey)+`
    <div class="alert ${alreadyUnlocked?'good':'mid'}">
      <b>${alreadyUnlocked?'🌟 Bekannte Branchen-Ikone':'🔒 Noch unentdeckte Branchen-Legende!'}</b>
      <span>${alreadyUnlocked?`Du hast ${esc(leg.n)} bereits freigeschaltet — du kannst ihn/sie jetzt als Star-Lead (${roleDef.n}, Stufe 2) für dieses Projekt verpflichten!`:`Wenn du <b>${esc(leg.n)}</b> als Star-Lead einstellst oder in der Gast-Session überzeugst, wird diese Legende <b>dauerhaft als Game Director für alle zukünftigen Spiele freigeschaltet</b>!`}</span>
    </div>
    <div class="opts">
      <button class="opt" id="legHireBtn" ${S.res.budget<hireCost?'disabled':''}>
        <span class="t">🌟 Als Star-Lead (${roleDef.n}, St. 2) einstellen ${!alreadyUnlocked?'& dauerhaft freischalten':''}</span>
        <span class="check safe">Handgeld ${money(hireCost)} · ohne Wurf</span>
        <span class="d">Tritt eurem Studio sofort auf Stufe 2 bei (${roleDef.effDesc(2)}), bringt seinen/ihren Signatur-Boost mit und wird dauerhaft im Legenden-Album freigeschaltet!</span>
        ${chips(previewSafe(leg.encEff||{}))}
      </button>
      <button class="opt" id="legCollabBtn">
        <span class="t">${leg.encCollabLabel?`${esc(leg.encCollabLabel)} (${!alreadyUnlocked?'schaltet bei Erfolg frei!':'Sofort-Boost'})`:`🤝 Gemeinsame Gast-Session im Studio (${!alreadyUnlocked?'schaltet bei Erfolg frei!':'Sofort-Boost'})`}</span>
        <span class="check">${STATS[o.st]} · SG ${target} (${pct} %)</span>
        <span class="d">Kein Handgeld nötig: Überzeugt ${esc(leg.n)} im Fachgespräch mit W100 ${fmt(mod)} gegen SG ${target}, um den vollen Effekt ${!alreadyUnlocked?'und die dauerhafte Freischaltung ':''}zu erhalten!</span>
        ${chips(previewSafe(leg.encEff||{}))}
      </button>
      <button class="opt" id="legPassBtn">
        <span class="t">${leg.encPassLabel?esc(leg.encPassLabel):'☕ Freundlich plaudern & Autogramm holen'}</span>
        <span class="check safe">ohne Wurf</span>
        <span class="d">Keine Kosten, kein Risiko. Das Team freut sich über den hohen Besuch.</span>
        ${leg.encPassEff?chips(previewSafe(leg.encPassEff)):''}
      </button>
    </div>`;

  bindFin();
  bindZoomTriggers(m);
  const hb=$('legHireBtn');if(hb)hb.onclick=()=>chooseLegendAction('hire');
  const cb=$('legCollabBtn');if(cb)cb.onclick=()=>chooseLegendAction('collab');
  const pb=$('legPassBtn');if(pb)pb.onclick=()=>chooseLegendAction('pass');
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

  // Spezial-Reiter (Legenden-Album, Engine-Labor oder Liga)
  if(wsTab==='legends'){renderLegendsView(m);return}
  if(C&&wsTab==='engine'){renderEngineLab(m);return}
  if(C&&wsTab==='league'){renderLeagueView(m);return}

  if(!S&&C?.retired){renderRetirement(m);return}
  if(!S){renderSetup(m);return}
  const sc=S.screen;
  if(sc==='event'){
    const evIdx=S.deck[S.round];
    const ev=E[evIdx];
    m.innerHTML=monthNote()+budgetAlert()+`<div class="studio-actions">
      <span class="label">Diesen Monat außerdem</span>
      <button class="btn tiny ghost" id="shopBtn" data-opensub="invest">🛒 Investieren<span class="hide-sm"> & Equipment</span></button>
      <button class="btn tiny ghost" data-opensub="hire">👥 Personal${S.round===0?'<span class="hide-sm"> einstellen</span>':''} (${C.studio.staff.length}/${Object.keys(STAFF).length})</button>
      <button class="btn tiny ghost" data-opensub="earn">💼 Geld verdienen ${(S.contractsPh||[]).includes(curPhase())?'(✓)':''}</button>
    </div>`+eventBannerHTML('card',evIdx)+`<span class="label">${stepLabel()}</span><h3>${ev.t}</h3><p class="evx" onclick="this.classList.toggle('open')">${vx(ev)}</p>`+optsHTML(ev);
    bindOpts(m);bindFin();
    m.querySelectorAll('[data-opensub]').forEach(b=>b.onclick=()=>{
      shopSubTab=b.dataset.opensub;
      S.shopMsg=null;S.screen='shop';wsTab='shop';render();save();
    });
    return;
  }
  if(sc==='mand'){const c=getMand(S.mcur);m.innerHTML=headFor('mand',S.mcur)+optsHTML(c);bindOpts(m);return}
  if(sc==='lang'){renderLang(m);return}
  if(sc==='legend'){renderLegendEncounter(m);return}
  if(sc==='interview'){renderInterview(m);return}
  if(sc==='roll'){
    const p=S.pending;
    m.className='card'+(['rand','rescue','legend'].includes(p.kind)?' rnd':'');
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
    m.className='card'+(['rand','rescue','legend'].includes(L.kind)?' rnd':'');
    const body=L.safe?`<p><b>${L.l}</b></p><p>${L.txt||''}</p>${chips((L.pre||[]).concat(L.ch))||'<p class="note">Keine Änderungen.</p>'}`:resultBlock(L);
    const nx={card:'Schritt abschließen',mand:'Weiter',rand:`Weiter zu „${curStep().n}“`,legend:`Weiter zu „${curStep().n}“`,shop:'Zurück zum Shop',hire:'Zurück zum Shop',contract:'Zurück zum Shop',dlc:'Zurück zur Abrechnung',rescue:S.over?'Weiter':'Zurück zur Notlage'}[L.kind];
    m.innerHTML=headFor(L.kind,L.ev)+body+`<div class="row"><button class="btn" id="nx">${nx}</button>${rerollBtn()}</div>`;
    bindZoomTriggers(m);
    $('nx').onclick=()=>afterResult(L.kind);bindRR();
    return;
  }
  if(sc==='random'){
    m.className='card rnd';
    const rv=R[S.rnd];
    if(rv.eff){
      m.innerHTML=budgetAlert()+headFor('rand',S.rnd)+chips(S.rndCh)+`<button class="btn" id="nx">Weiter zu „${curStep().n}“</button>`;
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
    m.innerHTML=eventBannerHTML('launch')+`<span class="label">Release-Tag</span><h3>„${esc(S.title)}“ ist fertig. Mehr oder weniger.</h3>
      ${qualPanel()}
      <p>${S.res.bugs} bekannte Bugs, Hype ${S.res.hype}/10, ${nf(S.res.wl,0)} Wishlists${S.res.zeit<0?`, und ihr seid ${Math.round(-S.res.zeit*S.dur/12)} Monat(e) über dem Zeitplan`:''}. Jetzt entscheiden die Kritiker per W100.${S.promises?` Offene Versprechen: ${S.promises} (−${2*S.promises} Wertung).`:''}${S.works?' It just works: Die Bugs zählen diesmal nicht.':''}${S.engine==='eigen'&&C.studio.engine&&(S.engAgeAtStart||0)>=2?` Achtung: Eure Engine galt bei Projektstart als „${getEngineAgeInfo(S.engAgeAtStart).label}“.`:''}</p>
      <div class="tray" id="dice">${dieSVG('?')}</div>
      <button class="btn" id="go">W100 Review-Wurf</button>`;
    $('go').onclick=launch;
    return;
  }
  if(sc==='sales'){
    const e=S.end;
    m.innerHTML=eventBannerHTML('sales')+`<span class="label">Die Reviews & GOTY-Nominierungen sind da</span>
      ${metaBlock(e)}
      <p>${e.late}${e.meta>=85?'Die Presse überschlägt sich vor Begeisterung — ihr landet auf dem Cover der PIXEL WORLD!':e.meta>=70?'Gute bis sehr gute Kritiken.':e.meta>=50?'Gemischte Kritiken. „Mit Patches könnte das noch was werden.“':'Verrisse. Ein YouTuber macht ein 40-minütiges Video über eure Technik.'}</p>
      ${(e.awards||[]).some(a=>typeof a==='object')?`<div class="award-box">
        <span class="label">🏆 Game of the Year (GOTY) Verleihung</span>
        ${e.awards.filter(a=>typeof a==='object').map(a=>`<div class="mini"><div><span><b>${esc(a.cat)}</b></span><span class="${a.won?'pos':''}">${esc(a.winner)} (${a.score} Pkt.) ${a.won?'🏆 GEWONNEN!':''}</span></div></div>`).join('')}
      </div>`:''}
      <div class="tray" id="dice">${dieSVG(e.r)}</div>
      <p class="note">${MODELS[S.model].sales}: W100 + doppelter Hype (+${S.res.hype*2})${S.trendHot?' · 🔥 Trend-Bonus (+15 %)':S.trendCold?' · ❄️ Übersättigtes Genre (−10 %)':''}</p>
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
    addLog(`<span>${stepTag()}</span> Sprachen: ${Object.keys(sel).filter(k=>sel[k]).map(k=>LANGS[k].n+(sel[k]===2?' (vertont)':'')).join(', ')} für ${money(c)}`);
    S.screen='result';render();save();
  };
}

function renderShop(m){
  const sc=T().scale,ph=curCP();
  const cats=['Marketing','Qualität','Studio','Spekulativ'];
  const contractThisPhase=(S.contractsPh||[]).includes(curPhase());
  const shopItems=SHOP.filter(it=>(!it.tiers||it.tiers.includes(S.tier))&&(shopCatFilter==='all'||it.c===shopCatFilter));

  m.innerHTML=`
    <div class="staff-top">
      <span class="stamp">${shopSubTab==='invest'?'🛒 Studio-Investitionen':shopSubTab==='hire'?'👥 Lead-Personal & Team':'💼 Auftragsarbeiten & Finanzierung'}</span>
      <button class="btn small ghost" id="back">← Zurück zur Monatskarte</button>
    </div>
    <div class="sub-tabs" role="tablist" aria-label="Bereich wählen">
      <button type="button" class="sub-tab ${shopSubTab==='invest'?'active':''}" data-stsub="invest">🛒 Investieren (${S.shop.length}/${SHOP.length})</button>
      <button type="button" class="sub-tab ${shopSubTab==='hire'?'active':''}" data-stsub="hire">👥 Personal anwerben (${C.studio.staff.length}/${Object.keys(STAFF).length})</button>
      <button type="button" class="sub-tab ${shopSubTab==='earn'?'active':''}" data-stsub="earn">💼 Geld verdienen ${contractThisPhase?'(✓)':''}</button>
    </div>
    ${S.shopMsg?`<div class="alert mid"><b>${esc(S.shopMsg.n)}</b><span>${esc(S.shopMsg.txt||'')}</span>${chips(S.shopMsg.ch)}</div>`:''}

    <!-- TAB 1: INVESTIEREN (MAßNAHMEN) -->
    <div id="shopPanel-invest" ${shopSubTab==='invest'?'':'hidden'}>
      <div class="cat-pills" style="margin-bottom:8px">
        <button type="button" class="cat-pill ${shopCatFilter==='all'?'active':''}" data-cfilt="all">Alle (${SHOP.filter(it=>!it.tiers||it.tiers.includes(S.tier)).length})</button>
        ${cats.map(c=>`<button type="button" class="cat-pill ${shopCatFilter===c?'active':''}" data-cfilt="${c}">${c}</button>`).join('')}
      </div>
      <div class="opts-grid">
        ${shopItems.map(it=>{
          const cost=shopCost(it),bought=S.shop.includes(it.id),early=it.min&&ph<it.min;
          const noEng=it.id==='refactoring'&&(!C.studio.engine||S.engine!=='eigen');
          const dis=bought||S.res.budget<cost||early||noEng;
          const target=it.st?dc100(it.dc):0;
          return `<button class="opt" data-buy="${it.id}" ${dis?'disabled':''}>
            <span class="t">${it.n}</span>
            <span class="check ${it.st?'':'safe'}">${bought?'Gekauft ✓':money(cost)}</span>
            <span class="d"><small class="note">[${it.c}]</small> ${it.d}${it.st?` (${STATS[it.st]} SG ${target})`:''}${early?' · Ab Phase '+PHASES[CP_TO_PHASE[it.min]]:''}${noEng?' · Eigene Engine nötig':''}</span>
            ${!it.st&&it.eff?chips(previewSafe(it.eff)):''}
          </button>`;
        }).join('')}
      </div>
    </div>

    <!-- TAB 2: PERSONAL ANWERBEN & PFLEGEN -->
    <div id="shopPanel-hire" ${shopSubTab==='hire'?'':'hidden'}>
      <p class="note" style="margin:0 0 8px">${!stepFlag('hire')?'<b>🔒 Neue Leads könnt ihr nur in Planungsschritten anwerben.</b> Entlassen geht jederzeit. ':''}Agenturgebühr beim Anwerben: <b>${money(hireFee())}</b> (Business-Wurf gegen SG 50). Eingestellte Leads steigen durch Projekterfolge und kritische Würfe im Level auf.</p>
      <div class="opts-grid">
        ${Object.entries(STAFF).map(([k,s])=>{
          const st=getStaff(k);
          const has=!!st;
          const bonusCost=has?Math.round(st.sal*1.5*sc*10)/10:0;
          return `<div class="opt" style="cursor:default">
            <span class="t">${has?`${st.isLegend?'🌟 ':''}${esc(st.personName)} (St.${st.level})`:s.n}</span>
            <span class="check ${has?'':'safe'}">${has?`Loy. ${st.loyalty}/10 · ${money(st.sal*sc*staffSalMult())}/M`:money(s.sal*sc*staffSalMult())+'/M'}</span>
            <span class="d"><b>${s.n}:</b> ${s.effDesc(has?st.level:1)}.</span>
            <div class="row" style="grid-column:1/-1;margin-top:4px">
              ${has?`
                <button class="btn tiny alt" data-bonus="${k}" ${S.res.budget<bonusCost||st.loyalty>=10?'disabled':''}>Bonus ${money(bonusCost)} (+2 Loy.)</button>
                <button class="btn tiny ghost" data-raise="${k}" ${st.loyalty>=10?'disabled':''}>Gehalt +20% (+3 Loy.)</button>
                <button class="btn tiny ghost" data-fire="${k}">Entlassen</button>
              `:`<button class="btn small alt" data-hire="${k}" ${!stepFlag('hire')||S.res.budget<hireFee()?'disabled':''}>${!stepFlag('hire')?'Nur in Planungsschritten':'Anwerben (SG 50)'}</button>`}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- TAB 3: GELD VERDIENEN (AUFTRÄGE & FINANZIERUNG) -->
    <div id="shopPanel-earn" ${shopSubTab==='earn'?'':'hidden'}>
      <div class="staff-top" style="margin-bottom:8px">
        <span class="note">${contractThisPhase?'✅ Ihr habt in dieser Phase bereits eine Auftragsarbeit erledigt. Die nächste ist ab der nächsten Phase möglich.':'Ihr könnt 1 Auftragsarbeit pro Phase erledigen, um frisches Geld in die Kasse zu spülen.'}</span>
        <button type="button" class="btn tiny ghost" id="openFinFromShop">🏦 Weitere Finanzierung / Kredit prüfen</button>
      </div>
      <div class="opts-grid">
        ${CONTRACTS.map(ct=>{
          const dis=contractThisPhase;
          const pay=Math.round(ct.pay*sc);
          const mod=modFor(ct.st)+moralMod();
          const pct=winChance(ct.dc,mod,false);
          return `<button class="opt" data-contract="${ct.id}" ${dis?'disabled':''}>
            <span class="t">${ct.n}</span>
            <span class="check">${dis?'Diese Phase erledigt ✓':`+${money(pay)} · ${STATS[ct.st]} SG ${ct.dc} (${pct}%)`}</span>
            <span class="d">${ct.d}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;

  m.querySelectorAll('[data-stsub]').forEach(b=>b.onclick=()=>{shopSubTab=b.dataset.stsub;render()});
  m.querySelectorAll('[data-cfilt]').forEach(b=>b.onclick=()=>{shopCatFilter=b.dataset.cfilt;renderShop(m)});
  const finBtn=$('openFinFromShop');if(finBtn)finBtn.onclick=()=>openCrisis('event');
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
  m.innerHTML=eventBannerHTML('crisis')+`<span class="stamp">${neg?'Notlage':'Finanzierung'}</span><h3>${neg?'Das Konto ist leer':'Frisches Geld suchen'}</h3>
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

/* Pleite: neues Studio mit Privatkapital gründen oder in den Ruhestand gehen */
function brokeChoiceHTML(){
  return `<div class="alert mid">
    <b>Wie geht es für ${esc(C.dir.n)} weiter?</b>
    <span>Privatkapital ${money(C.dir.wealth)} + Gründerzuschuss ${money(80)} = Startkapital ${money(Math.round(C.dir.wealth)+80)} für ein neues Studio. Oder ${esc(C.dir.n)} setzt sich zur Ruhe und die Karriere endet mit einer Bilanz.</span>
    <div class="field" style="margin:0">
      <label class="label" for="reName">Name des neuen Studios</label>
      <input id="reName" type="text" maxlength="40" placeholder="z. B. Phönix Games">
    </div>
    <div class="row">
      <button class="btn" id="re">🏢 Neues Studio gründen</button>
      <button class="btn ghost" id="retire">🌅 Zur Ruhe setzen</button>
    </div>
  </div>`;
}
function bindBrokeChoice(){
  $('re').onclick=()=>refound($('reName').value);
  $('retire').onclick=retire;
  const q=$('quit');if(q)q.remove();
}
function renderRetirement(m){
  const r=C.retired;
  m.innerHTML=`<span class="stamp">🌅 Ruhestand</span>
    <h3>${esc(C.dir.n)} setzt sich zur Ruhe</h3>
    <p>Nach ${r.games} veröffentlichten Spiel${r.games===1?'':'en'} in ${r.studios} Studio${r.studios===1?'':'s'} ist Schluss. Die Branche erinnert sich${r.best!=null&&r.best>=80?' an echte Meisterwerke':r.best!=null&&r.best>=60?' an solide Arbeit':' vor allem an den Mut, es versucht zu haben'}.</p>
    <div class="score">
      <div><span class="label">Spiele</span><b>${r.games}</b></div>
      <div><span class="label">Beste Wertung</span><b>${r.best??'–'}</b></div>
      <div><span class="label">Awards</span><b>${r.awards}</b></div>
      <div><span class="label">Privatvermögen</span><b>${money(r.wealth)}</b></div>
    </div>
    ${C.hall.length?`<details class="fold"><summary>📜 Ruhmeshalle</summary><div class="fold-body">${hallHTML()}</div></details>`:''}
    <p class="note">Freigeschaltete Legenden bleiben für die nächste Karriere erhalten.</p>
    <div class="row">
      <button class="btn small ghost" id="expChron">Chronik exportieren</button>
      <button class="btn" id="newCareer">Neue Karriere beginnen</button>
    </div>`;
  $('expChron').onclick=()=>openProfileModal('chronicle');
  $('newCareer').onclick=()=>{C=null;S=null;setupDraft=null;setupStep=1;wsTab='board';render();save()};
}

function renderOver(m){
  const t={budget:['Insolvenz','Das Konto ist leer. Der Insolvenzverwalter verkauft die Rechte, das Spiel erscheint nie.'],haus:['Alles verloren','Die Bank hat abgelehnt. Studio und Haus sind weg.'],moral:['Das Team ist weg','Die Moral ist auf null. Am Montag liegen die Kündigungen auf dem Tisch.']}[S.over]||['Ende',''];
  m.innerHTML=`<span class="label">Ende ${STEPS[S.round-1]?.n||''}</span><h3>${t[0]}</h3><p>${t[1]}</p><p class="note">Bei einer Neugründung startet der Studio-Fame bei null und das Personal ist weg. Die eigene Engine und alle freigeschalteten Legenden bleiben erhalten.</p>
   <div class="ledger">${ledger(null)}</div>${brokeChoiceHTML()}`;
  bindBrokeChoice();
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
  if(S.income)R2('Vorab-, Auftrags- & Lizenz-Einnahmen'+(S.crypto?.pay?' (inkl. Krypto)':''),money(S.income,true));
  if(S.crypto)R2('🪙 Krypto-Einsatz $MOONCAT',money(-S.crypto.amt));
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
  return '<table>'+rows.map(r=>r[0]==='head'?`<tr class="head"><td colspan="2">${r[1]}</td></tr>`:`<tr class="${r[0]}${String(r[2]).replace(/<[^>]+>/g,'').length>16?' long':''}"><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')+'</table>';
}

const uScore=u=>Number(u).toFixed(1).replace('.',',');
function metaBlock(e){
  const crit=e.critics||[];
  return `<div class="meta-box">
    <div class="meta-top">
      <div class="meta-main"><b class="mc big ${metaCls(e.meta)}">${e.meta}</b><div><span class="label">Metakritik · Metascore</span><strong>${metaLabel(e.meta)}</strong><span class="note">${crit.length?crit.length+' Kritiken':'Wertungsschnitt'}</span></div></div>
      ${e.user!=null?`<div class="meta-main"><b class="mc big round ${userCls(e.user)}">${uScore(e.user)}</b><div><span class="label">Nutzerwertung</span><strong>${metaLabel(e.user*10)}</strong></div></div>`:''}
    </div>
    <div class="meta-sub"><span>🎮 Gameplay <b>${e.gp??S.res.gp}</b></span><span>🎨 Grafik <b>${e.gfx??S.res.gfx}</b></span>${e.snd!=null?`<span>🎵 Sound <b>${e.snd}</b></span>`:''}<span>❤️ Wishlists <b>${nf(S.res.wl,0)}</b></span></div>
    ${(e.mcNotes||[]).length?`<div class="note">${e.mcNotes.map(esc).join(' ')}</div>`:''}
    ${crit.length?`<details class="fold"><summary>📰 Alle Kritiken lesen</summary><div class="fold-body crit-list">${crit.map(c=>`<div class="crit"><b class="mc ${metaCls(c.v)}">${c.v}</b><div><strong>${esc(c.n)}</strong><span>„${esc(c.q)}“</span></div></div>`).join('')}</div></details>`:''}
  </div>`;
}

function renderEnd(m){
  const e=S.end;
  const broke=e.kasseNew<0;
  const dlcAvail=!broke&&!S.dlcDone&&e.meta>=45;
  const mBurn=monthSum();
  const wonAwards=(e.awards||[]).filter(a=>a.won);
  m.innerHTML=eventBannerHTML('end')+`<span class="label">Abrechnung „${esc(S.title)}“</span><h3>${e.v[0]}</h3>
   <div class="score">
     <div><span class="label">Metascore</span><b class="mc ${metaCls(e.meta)}">${e.meta}</b></div>
     ${e.user!=null?`<div><span class="label">Nutzer</span><b class="mc ${userCls(e.user)}">${uScore(e.user)}</b></div>`:''}
     <div><span class="label">Gameplay</span><b>${e.gp??S.res.gp}</b></div>
     <div><span class="label">Grafik</span><b>${e.gfx??S.res.gfx}</b></div>
     ${e.snd!=null?`<div><span class="label">Sound</span><b>${e.snd}</b></div>`:''}
     <div><span class="label">${S.model==='f2p'?'Spieler':'Käufer'}</span><b>${nf(e.units,0)}</b></div>
     <div><span class="label">Ergebnis</span><b class="${e.erg>=0?'pos':'neg'}">${money(e.erg,true)}</b></div>
   </div>
   <p>${e.v[1]}</p>
   ${wonAwards.length?`<div class="award-box"><b>🏆 Gewonnene Auszeichnungen (${wonAwards.length}×)</b><div class="chips">${wonAwards.map(a=>`<span class="chip p">🏆 ${esc(a.cat)}</span>`).join('')}</div><span class="note">Prestige: Verkäufe ×${nf(1+wonAwards.length*0.08,2)} & +${wonAwards.length*3} Fame!</span></div>`:''}
   ${e.legNotes&&e.legNotes.length?`<div class="alert good"><b>🔓 Neue Legende</b><span>${e.legNotes.map(esc).join('<br>')}</span></div>`:''}
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
     <div class="opts-grid">
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
   <details class="fold">
     <summary>📊 Detaillierte Jahresbilanz & Gewinnverteilung aufklappen (Neue Kasse: ${money(e.kasseNew)})</summary>
     <div class="fold-body">
       <div class="ledger">${ledger(e)}</div>
     </div>
   </details>
   ${broke?brokeChoiceHTML():''}
   <div class="row">${broke?'':'<button class="btn" id="nextP">Nächstes Projekt planen</button><button class="btn ghost" id="towelP">🏳️ Handtuch werfen</button>'}<button class="btn small ghost" id="expChron">Chronik exportieren</button><button class="btn ghost" id="quit">Karriere beenden</button></div>`;
  m.querySelectorAll('[data-dlc]').forEach(b=>b.onclick=()=>startDlc(b.dataset.dlc));
  if(broke)bindBrokeChoice();else{
    $('nextP').onclick=()=>{S=null;setupDraft=null;setupStep=2;wsTab='board';render();save()};
    $('towelP').onclick=()=>{S=null;setupDraft=null;ensureSetupDraft();setupDraft.mode='towel';wsTab='board';render();save()};
  }
  $('expChron').onclick=()=>openProfileModal('chronicle');
  const q=$('quit');if(q)q.onclick=()=>{C=null;S=null;setupDraft=null;setupStep=1;wsTab='board';render();save()};
}

/* ===================== 4-Schritte-Assistent: Gründung & Projektplanung ===================== */
let setupStep=1;
let setupDraft=null;
let showLockedSetupDirs=false;

function ensureSetupDraft(){
  const first=!C;
  const tag=first?'new':('g'+C.gameNo);
  if(setupDraft&&setupDraft._tag===tag)return;
  const unl=getUnlockedChars();
  const defDir=first?(unl[0]||'custom'):(C.dir.id||'keep');
  setupDraft={
    _tag:tag,
    studioName:first?'Pixelpott Studios':C.studio.name,
    dir:first?defDir:'keep',
    title:randTitle(),
    tier:'indie',
    ip:'neu',
    dur:'normal',
    model:'kauf',
    genre:'rpg',
    subGenre:defaultSub('rpg'),
    gmod:'none',
    extras:[],
    mode:'game',
    engGoal:'gen',
    engMonths:9,
    engSpec:C?.studio?.engine?.genres?.[0]||'rpg'
  };
  setupStep=first?1:2;
}

function launchSetupProject(){
  ensureSetupDraft();
  const first=!C;
  const err=$('setupErr');
  if(first){
    const k=setupDraft.dir;
    let dir;
    if(k==='custom'){
      if(ptsLeft()<0){
        setupStep=1;renderMain();
        const e2=$('setupErr');
        if(e2){e2.hidden=false;e2.textContent=`Dein Director hat ${-ptsLeft()} Punkte zu viel. Senke einen Wert, streiche einen Vorteil oder nimm eine Macke.`}
        return;
      }
      dir={id:'custom',n:B.n.trim()||'Namenloser Director',tag:'Eigener Director',d:'',s:{...B.s},aff:{},perks:[...B.perks],flaws:[...B.flaws],ab:null};
    }else{
      const dKey=LEGEND_KEYS.includes(k)?k:LEGEND_KEYS[0];
      dir={id:dKey,...DIRS[dKey],s:{...DIRS[dKey].s},perks:[...DIRS[dKey].perks],flaws:[...DIRS[dKey].flaws],aff:{...DIRS[dKey].aff}};
    }
    C={
      studio:{name:(setupDraft.studioName||'').trim()||'Pixelpott Studios',fame:0,kasse:0,staff:[],exStaff:[],engine:null,salaryDrift:0,overheadDrift:0},
      dir:{...dir,fame:0,wealth:0,games:0,xp:0,perkUnlocked:false},
      hall:[],gameNo:0,unlockedChars:getUnlockedChars()
    };
    rollMarketTrend();
  }
  const cfg={
    title:(setupDraft.title||'').trim()||randTitle(),
    genre:setupDraft.genre,
    subGenre:subGenreOf(setupDraft.genre,setupDraft.subGenre)?setupDraft.subGenre:defaultSub(setupDraft.genre),
    gmod:GENRE_MODS[setupDraft.gmod]?setupDraft.gmod:null,
    tier:(first&&setupDraft.tier!=='indie')||(!first&&C.studio.kasse<TIERS[setupDraft.tier].min)?'indie':setupDraft.tier,
    dur:setupDraft.dur,
    model:setupDraft.model,
    ip:setupDraft.ip,
    extras:[...setupDraft.extras],
    mods:setupDraft.extras.includes('mods'),
    ea:setupDraft.extras.includes('ea')
  };
  setupDraft=null;
  wsTab='board';
  if(C){C.engProj=null;C.towel=null}
  startGame(cfg);
}

/* ===================== Engine-Projekt zwischen zwei Spielen ===================== */
function setupModeBar(){
  if(!C)return '';
  const mode=setupDraft.mode;
  return `<div class="sub-tabs" role="tablist" aria-label="Nächstes Projekt">
    <button type="button" class="sub-tab ${mode==='game'?'active':''}" data-setmode="game">🎮 Neues Spiel entwickeln</button>
    ${C.studio.engine?`<button type="button" class="sub-tab ${mode==='engine'?'active':''}" data-setmode="engine">⚙️ Engine-Projekt (6–12 Monate)</button>`:''}
    <button type="button" class="sub-tab ${mode==='towel'?'active':''}" data-setmode="towel">🏳️ Handtuch werfen</button>
  </div>`;
}
function towelResultHTML(){
  const t=C?.towel;
  if(!t)return '';
  return `<div class="alert good"><b>🏢 ${esc(C.studio.name)} ist gegründet</b><span>„${esc(t.old)}“ wurde verkauft (Erlös ${money(t.pay)}). Startkapital: ${money(C.studio.kasse)}.${t.follower?` ${esc(t.follower)} kommt mit ins neue Studio.`:''}</span></div>`;
}
function renderTowel(m){
  const pay=towelPayout(),fol=towelFollower(),start=Math.round((C.dir.wealth+pay+80)*10)/10;
  const tiers=Object.entries(TIERS).map(([k,t])=>`<div><span>${t.n}</span><span class="${start>=t.min?'pos':'neg'}">${start>=t.min?'✓ möglich':'ab '+money(t.min)}</span></div>`).join('');
  m.innerHTML=setupModeBar()+`
    <span class="stamp">🏳️ Handtuch werfen</span>
    <h3>${esc(C.studio.name)} verkaufen und ein neues Studio gründen</h3>
    <p class="note" style="margin:0">${esc(C.dir.n)} verkauft das Studio samt Engine und Team und fängt woanders neu an. Erfahrung, Werte, Vorteile und freigeschaltete Legenden bleiben, der Ruf leidet etwas.</p>
    <div class="mini">
      <div><span>Erlös aus dem Verkauf (½ Kasse${C.studio.engine?' + Engine':''})</span><span class="pos">${money(pay,true)}</span></div>
      <div><span>Privatvermögen des Directors</span><span>${money(C.dir.wealth)}</span></div>
      <div><span>Gründerzuschuss</span><span>${money(80)}</span></div>
      <div><span><b>Startkapital des neuen Studios</b></span><span><b>${money(start)}</b></span></div>
      <div><span>Director-Fame</span><span class="neg">${C.dir.fame} → ${Math.max(0,Math.round(C.dir.fame*0.85))}</span></div>
      <div><span>Mitkommender Lead</span><span>${fol?esc(fol.personName)+' ('+STAFF[fol.id].n+')':'niemand (Loyalität 8+ nötig)'}</span></div>
    </div>
    <div class="mini"><span class="label">Mögliche Produktionsklasse</span>${tiers}</div>
    <div class="field">
      <label class="label" for="towelName">Name des neuen Studios</label>
      <input id="towelName" type="text" maxlength="40" value="${esc(setupDraft.towelName||'')}" placeholder="z. B. Zweite Chance Games">
    </div>
    <p class="err" id="towelErr" hidden></p>
    <div class="wiz-nav">
      <span class="note">Studio, Engine, übriges Personal und Studio-Fame bleiben beim alten Studio.</span>
      <button type="button" class="btn" id="towelGo">🏳️ Verkaufen & neu gründen</button>
    </div>`;
  bindSetupMode(m);
  const nm=$('towelName');nm.oninput=e=>{setupDraft.towelName=e.target.value};
  $('towelGo').onclick=()=>{
    const name=(setupDraft.towelName||'').trim();
    if(!name||name===C.studio.name){const e=$('towelErr');e.hidden=false;e.textContent='Gebt dem neuen Studio einen eigenen Namen.';return}
    const b=$('towelGo');
    if(!b.dataset.c){b.dataset.c='1';b.textContent='Wirklich verkaufen?';setTimeout(()=>{if(b.isConnected){delete b.dataset.c;b.textContent='🏳️ Verkaufen & neu gründen'}},3000);return}
    throwTowel(name);setupDraft=null;
    render();
  };
}
function bindSetupMode(m){
  m.querySelectorAll('[data-setmode]').forEach(b=>b.onclick=()=>{setupDraft.mode=b.dataset.setmode;renderMain()});
}
function engProjResultHTML(){
  const p=C?.engProj;
  if(!p)return '';
  const g=ENG_PROJECT_GOALS[p.goal];
  return `<div class="alert ${p.ok?'good':'mid'}">
    <b>${p.ok?'✅':'⚠️'} Engine-Projekt abgeschlossen: ${g.n} (${p.months} Monate)</b>
    <span>W100 ${p.r} ${fmt(p.mod)} = ${p.r+p.mod} gegen SG ${p.target} → ${p.crit?'kritischer Erfolg':p.fumble?'Patzer':p.ok?'Erfolg':'Fehlschlag'} · Kosten ${money(p.cost)}${p.lic?` · Lizenzeinnahmen ${money(p.lic,true)}`:''}<br>${p.notes.map(esc).join(' · ')}</span>
  </div>`;
}
function renderEngineProject(m){
  const eng=C.studio.engine,d=setupDraft;
  const goal=d.engGoal,months=+d.engMonths;
  const cost=engProjCost(goal,months),lic=Math.round(engProjLicIncome()*months*10)/10;
  const target=engProjTarget(goal,months),mod=engProjMod(),pct=winChance(target,mod,false);
  const ageInfo=getEngineAgeInfo(eng.age||0);
  const canPay=C.studio.kasse>=cost;
  m.innerHTML=engProjResultHTML()+setupModeBar()+`
    <span class="stamp">⚙️ Engine-Projekt</span>
    <h3>${esc(eng.name)} v${eng.version}.0 weiterentwickeln</h3>
    <p class="note" style="margin:0">Das ganze Team arbeitet nur an der Engine. In dieser Zeit entsteht kein Spiel und es fließt kein Umsatz. Die Gehälter laufen weiter und werden aus der Studiokasse bezahlt.</p>
    <div class="mini">
      <div><span>Zustand</span><span class="${ageInfo.cls==='p'?'pos':ageInfo.cls==='n'?'neg':'wrn'}">${ageInfo.label}</span></div>
      <div><span>Tech-Schulden · Forschungspunkte</span><span>${eng.techDebt||0} · 🔬 ${eng.techPts||0}</span></div>
      <div><span>Spezialisierung</span><span>${eng.spec?GENRES[eng.spec]?.n:'keine'}</span></div>
      <div><span>Studiokasse</span><span>${money(C.studio.kasse)}</span></div>
    </div>
    <div class="field">
      <span class="label">Ziel</span>
      <div class="choices">
        ${Object.entries(ENG_PROJECT_GOALS).map(([k,g])=>`<label class="choice"><input type="radio" name="eg" value="${k}" ${goal===k?'checked':''}><b>${g.n}</b><span>${g.d}</span></label>`).join('')}
      </div>
    </div>
    ${goal==='spec'?`<div class="field">
      <label class="label" for="egSpec">Genre für die Spezialisierung</label>
      <select id="egSpec">${Object.entries(GENRES).map(([k,g])=>`<option value="${k}" ${d.engSpec===k?'selected':''}>${g.n}</option>`).join('')}</select>
    </div>`:''}
    <div class="field">
      <span class="label">Dauer</span>
      <div class="choices">
        ${Object.entries(ENG_PROJECT_DURS).map(([k,v])=>`<label class="choice"><input type="radio" name="em" value="${k}" ${months===+k?'checked':''}><b>${v.n}</b><span>${v.d}</span><code>${money(engProjCost(goal,+k))} · SG ${engProjTarget(goal,+k)}</code></label>`).join('')}
      </div>
    </div>
    <div class="alert ${canPay?'mid':'bad'}">
      <b>Kosten ${money(cost)} · Technik-Wurf W100 ${fmt(mod)} gegen SG ${target} (${pct} %)</b>
      <span>${money(engProjMonthCost())} laufende Kosten pro Monat plus Hardware & Lizenzen.${lic?` Engine-Lizenzen bringen in der Zeit ${money(lic,true)}.`:''} Auch ein Fehlschlag liefert ein Ergebnis, aber mit Tech-Schulden.${canPay?'':' <b>Die Studiokasse reicht nicht.</b>'}</span>
    </div>
    <div class="wiz-nav">
      <span class="note">Leads sammeln in der Zeit Erfahrung, die Gehälter steigen leicht${months>=9?', der Markt-Trend dreht sich':''}.</span>
      <button type="button" class="btn" id="engGo" ${canPay?'':'disabled'}>⚙️ Engine-Projekt starten</button>
    </div>`;
  bindSetupMode(m);
  m.querySelectorAll('input[name=eg]').forEach(r=>r.onchange=()=>{if(r.checked){d.engGoal=r.value;renderMain()}});
  m.querySelectorAll('input[name=em]').forEach(r=>r.onchange=()=>{if(r.checked){d.engMonths=+r.value;renderMain()}});
  const sp=$('egSpec');if(sp)sp.onchange=()=>{d.engSpec=sp.value};
  $('engGo').onclick=()=>{d.mode='game';runEngineProject(goal,months,d.engSpec)};
}

function renderSetup(m){
  ensureSetupDraft();
  const first=!C;
  if(!first&&C.studio.engine&&setupDraft.mode==='engine'){renderEngineProject(m);return}
  if(!first&&setupDraft.mode==='towel'){renderTowel(m);return}
  const kasse=first?null:C.studio.kasse;
  const seqs=first?[]:C.hall.map((h,i)=>[h,i]).filter(([h])=>h.meta!=null&&h.meta>=70&&!h.ipLost);
  const tr=C?.trend;
  const unlList=getUnlockedChars();
  const allDirs=Object.entries(DIRS).filter(([k])=>LEGEND_KEYS.includes(k)).sort((a,b)=>(isCharUnlocked(b[0])?1:0)-(isCharUnlocked(a[0])?1:0));
  const shownDirs=showLockedSetupDirs?allDirs:allDirs.filter(([k])=>isCharUnlocked(k));

  const stepLabels=[
    [1,'1. Studio & Director'],
    [2,'2. Klasse & Modell'],
    [3,'3. Genre & Sub-Genre'],
    [4,'4. Extras & Start']
  ];

  const stepsBar=`<div class="wiz-steps" role="tablist" aria-label="Projekt-Assistent">
    ${stepLabels.map(([n,lbl])=>`<button type="button" class="wiz-step ${setupStep===n?'active':setupStep>n?'done':''}" data-wstep="${n}">
      <span class="num">${setupStep>n?'✓':n}</span>
      <span>${lbl}</span>
    </button>`).join('')}
  </div>`;

  let bodyHTML='';

  if(setupStep===1&&!first){
    bodyHTML=`
      <h3>Schritt 1: Studio & Game Director</h3>
      <p class="note" style="margin:0">Studioname und Game Director stehen seit der Gründung fest. Freigeschaltete Legenden könnt ihr als Director wählen, wenn ihr eine neue Karriere mit einem neuen Studio startet.</p>
      <div class="legend-grid">
        <div class="choice dir-choice" style="cursor:default">
          ${C.dir.img?charPortraitHTML(C.dir.img,C.dir.isScene,'sm',false,C.dir.n):''}
          <div class="dir-body">
            <b>🏢 ${esc(C.studio.name)} · ${esc(C.dir.n)}</b>
            <span>${esc(C.dir.tag||'Euer erfahrener Director')} · ${C.dir.games} Spiele veröffentlicht · Fame ${C.dir.fame}/100</span>
            <code>${dirStatLine(C.dir.s)}</code>
          </div>
        </div>
      </div>
      <div class="wiz-nav">
        <span class="note">Schritt 1 von 4</span>
        <div class="row">
          <button type="button" class="btn" id="wizNext">Weiter: Klasse & Modell →</button>
        </div>
      </div>`;
  }else if(setupStep===1){
    bodyHTML=`
      <h3>Schritt 1: ${first?'Gründet euer Studio':'Studio & Game Director'}</h3>
      <p class="note" style="margin:0">${first?'Gebt eurem neuen Entwicklerstudio einen Namen und wählt euren Game Director. Branchen-Legenden sind noch gesperrt: Die erste gibt es beim ersten Top-Erfolg, eine weitere beim ersten Double-A- oder Triple-A-Release.':`Euer Studio <b>${esc(C.studio.name)}</b> plant das nächste Projekt. Ihr könnt euren bisherigen Director behalten oder zu einer freigeschalteten Legende wechseln.`}</p>
      <div class="field">
        <label class="label" for="nm">Studioname</label>
        <input id="nm" type="text" value="${esc(setupDraft.studioName)}" maxlength="40">
      </div>
      <div class="field">
        <div class="staff-top" style="flex-wrap:wrap;gap:6px">
          <span class="label">Game Director wählen (${unlList.length} / ${allDirs.length} Legenden freigeschaltet)</span>
          <button type="button" class="btn tiny ghost" id="togLockedDirs">${showLockedSetupDirs?`Nur Freigeschaltete zeigen (${unlList.length})`:`🔒 Alle ${allDirs.length} Legenden anzeigen`}</button>
        </div>
        <div class="legend-grid">
          ${!first?`<label class="choice dir-choice">
            <input type="radio" name="dir" value="keep" ${setupDraft.dir==='keep'?'checked':''}>
            ${C.dir.img?charPortraitHTML(C.dir.img,C.dir.isScene,'sm',false,C.dir.n):''}
            <div class="dir-body">
              <b>⭐ Aktuell: ${esc(C.dir.n)} behalten</b>
              <span>${esc(C.dir.tag||'Euer erfahrener Director')} · ${C.dir.games} Spiele veröffentlicht · Fame ${C.dir.fame}/100</span>
              <code>${dirStatLine(C.dir.s)}</code>
            </div>
          </label>`:''}
          ${shownDirs.map(([k,o])=>{
            const ok=isCharUnlocked(k);
            return `<label class="choice dir-choice ${ok?'':'locked'}">
              <input type="radio" name="dir" id="d-${k}" value="${k}" ${setupDraft.dir===k?'checked':''} ${ok?'':'disabled'}>
              ${charPortraitHTML(o.img,o.isScene,'sm',!ok,o.n)}
              <div class="dir-body">
                <b>${ok?esc(o.n):'🔒 '+esc(o.tag)}</b>
                <span>${ok?esc(o.tag):'Freischaltbar durch Top-Erfolg, AA/AAA-Release oder Begegnung'}</span>
                ${ok?`
                  <code>${dirStatLine(o.s)}</code>
                  <span class="more">${esc(o.d)}<br><b>Fähigkeit:</b> ${ABIL[o.ab]?.n||o.ab}${o.perks.length?' · <b>Vorteil:</b> '+o.perks.map(p=>PERKS[p].n).join(', '):''}${o.flaws.length?' · <b>Macke:</b> '+o.flaws.map(f=>FLAWS[f].n).join(', '):''}${Object.keys(o.aff).length?'<br><b>Genres:</b> '+Object.entries(o.aff).map(([g,v])=>GENRES[g].n+' '+fmt(v*4)).join(', '):''}</span>
                `:''}
              </div>
            </label>`;
          }).join('')}
          ${first?`<label class="choice"><input type="radio" name="dir" id="d-custom" value="custom" ${setupDraft.dir==='custom'?'checked':''}><b>🛠️ Eigener Director</b><span>Werte mit ${DPTS} Punkten frei verteilen.</span></label>`:''}
        </div>
        <div id="builder" ${first&&setupDraft.dir==='custom'?'':'hidden'}></div>
      </div>
      <p class="err" id="setupErr" hidden></p>
      <div class="wiz-nav">
        <span class="note">Schritt 1 von 4 · Tipp: Klick auf eine Karte zeigt alle Details</span>
        <div class="row">
          <button type="button" class="btn" id="wizNext">Weiter: Klasse & Modell →</button>
        </div>
      </div>`;
  }else if(setupStep===2){
    bodyHTML=`
      <h3>Schritt 2: Produktionsklasse, Marke & Geschäftsmodell</h3>
      ${!first?`<p class="note" style="margin:0">Studiokasse: <b>${money(kasse)}</b>.${C.studio.engine?` Eure <b>${esc(C.studio.engine.name)} v${C.studio.engine.version}.0</b> hat den Zustand: <b>${getEngineAgeInfo(C.studio.engine.age||0).label}</b>.`:''}</p>`:''}
      <div class="field">
        <label class="label" for="tt">Arbeitstitel des Spiels</label>
        <div class="inrow">
          <input id="tt" type="text" value="${esc(setupDraft.title)}" maxlength="40">
          <button type="button" class="btn small ghost" id="ttR">🎲 Anderer Vorschlag</button>
        </div>
      </div>
      <div class="field">
        <span class="label">Produktionsklasse</span>
        <div class="choices compact">${Object.entries(TIERS).map(([k,t])=>{
          // Neue Studios starten immer als Indie; größere Klassen erst mit genug Studiokapital
          const ok=first?k==='indie':kasse>=t.min;
          return `<label class="choice"><input type="radio" name="t" id="t-${k}" value="${k}" ${setupDraft.tier===k?'checked':''} ${ok?'':'disabled'}><b>${ok?'':'🔒 '}${t.n}</b><code>${first?(ok?'Start '+money(220*t.scale)+' · ':'erst mit '+money(t.min)+' Studiokapital · '):'mind. '+money(t.min)+' · '}${t.team} Leute · ~${money(13*t.scale*12/t.dur[1])}/Monat</code><span class="more">${t.d} · Preise: ${t.prices.map(p=>nf(p,2)).join(' / ')} € · ${t.note}</span></label>`;
        }).join('')}</div>
      </div>
      <div class="field">
        <span class="label">Entwicklungsdauer</span>
        <div class="choices compact">${DUR_KEYS.map((k,i)=>{const mo=(TIERS[setupDraft.tier]||TIERS.indie).dur[i];return `<label class="choice"><input type="radio" name="dur" id="dur-${k}" value="${k}" ${setupDraft.dur===k?'checked':''}><b>${DUR_LABELS[k]}</b><code>${mo>=24?nf(mo/12,1)+' Jahre':mo+' Monate'}</code><span>Länger = mehr Qualität möglich, aber teurer</span></label>`}).join('')}</div>
      </div>
      <div class="field">
        <span class="label">Marke (IP)</span>
        <div class="choices compact">
          <label class="choice"><input type="radio" name="ip" id="ip-neu" value="neu" ${setupDraft.ip==='neu'?'checked':''}><b>${IPS.neu.n}</b><code>${IPS.neu.note}</code><span class="more">${IPS.neu.d}</span></label>
          ${seqs.map(([h,i])=>`<label class="choice"><input type="radio" name="ip" id="ip-seq${i}" value="seq:${i}" data-st="${esc(h.title)}" ${setupDraft.ip===`seq:${i}`?'checked':''}><b>Fortsetzung: „${esc(h.title)}“</b><code>+${clamp(Math.floor((h.meta-60)/8),0,4)} Hype · ×${nf(1.3+(h.meta-70)/100,2)} Verkäufe</code><span class="more">Vorgänger-Wertung ${h.meta}. Fans und Kritiker erinnern sich.</span></label>`).join('')}
          ${first?`<label class="choice"><input type="radio" name="ip" id="ip-franchise" value="franchise" ${setupDraft.ip==='franchise'?'checked':''}><b>${IPS.franchise.n}</b><code>${IPS.franchise.note}</code><span class="more">${IPS.franchise.d}</span></label>`:''}
          <label class="choice"><input type="radio" name="ip" id="ip-lizenz" value="lizenz" ${setupDraft.ip==='lizenz'?'checked':''}><b>${IPS.lizenz.n}</b><code>${IPS.lizenz.note}</code><span class="more">${IPS.lizenz.d}</span></label>
        </div>
      </div>
      <div class="field">
        <span class="label">Geschäftsmodell</span>
        <div class="choices compact">${Object.entries(MODELS).map(([k,o])=>`<label class="choice"><input type="radio" name="m" id="m-${k}" value="${k}" ${setupDraft.model===k?'checked':''}><b>${o.n}</b><span>${o.d}</span></label>`).join('')}</div>
      </div>
      <div class="wiz-nav">
        <button type="button" class="btn ghost" id="wizPrev">← Zurück: Studio & Director</button>
        <button type="button" class="btn" id="wizNext">Weiter: Genre & Sub-Genre →</button>
      </div>`;
  }else if(setupStep===3){
    const mainG=GENRES[setupDraft.genre]||GENRES.rpg;
    const subKey=subGenreOf(setupDraft.genre,setupDraft.subGenre)?setupDraft.subGenre:defaultSub(setupDraft.genre);
    const subG=subGenreOf(setupDraft.genre,subKey);
    const blendGfxW=subG?.gfxW!=null?(mainG.gfxW*0.5+subG.gfxW*0.5):mainG.gfxW;
    const combinedStats=Object.keys(STATS).map(sk=>`${STATS[sk]} +${(mainG.s[sk]||0)*4+(subG?.s?.[sk]||0)*2}`).join(' · ');
    const bonus=Object.entries(subG?.b||{}).map(([k,v])=>chip([k,Math.round(v*0.5)])).join('');
    const fit=subG?.fit||mainG.fit;
    const gm=GENRE_MODS[setupDraft.gmod]?setupDraft.gmod:null;
    const gmFit=gm?modFit(setupDraft.genre,subKey,gm):null;
    const fitTag=k=>{const f=modFit(setupDraft.genre,subKey,k);return f==='syn'?' <span class="pos">✓ Synergie</span>':f==='clash'?' <span class="neg">✗ beißt sich</span>':''};
    const modEff=gm?Object.entries({...GENRE_MODS[gm].b}).map(e=>chip(e)).join(''):'';

    bodyHTML=`
      <h3>Schritt 3: Genre & Sub-Genre</h3>
      ${tr?`<div class="chips"><span class="chip p">🔥 Boom-Genre: ${GENRES[tr.hot]?.n} (+15% Verkäufe, +1 Hype)</span><span class="chip n">❄️ Übersättigt: ${GENRES[tr.cold]?.n} (−10% Verkäufe)</span></div>`:''}
      <div class="field">
        <span class="label">1. Hauptgenre</span>
        <div class="choices compact">${Object.entries(GENRES).map(([k,g])=>{
          const engKnows=C&&C.studio.engine&&C.studio.engine.genres.includes(k);
          const isHot=tr&&tr.hot===k;
          const isCold=tr&&tr.cold===k;
          return `<label class="choice"><input type="radio" name="g" id="g-${k}" value="${k}" ${setupDraft.genre===k?'checked':''}><b>${g.n} ${isHot?'🔥':isCold?'❄️':''}${engKnows?'★':''}</b><code>${Object.entries(g.s).filter(([,v])=>v>0).map(([sk,v])=>STATS[sk]+' +'+(v*4)).join(' · ')}</code><span class="more">${esc(g.d)}</span></label>`;
        }).join('')}</div>
      </div>
      <div class="field">
        <span class="label">2. Sub-Genre von ${esc(mainG.n)}</span>
        <div class="choices compact">${Object.entries(mainG.subs).map(([k,sg])=>`<label class="choice"><input type="radio" name="subg" value="${k}" ${subKey===k?'checked':''}><b>${esc(sg.n)}</b><code>${Object.entries(sg.s||{}).map(([sk,v])=>STATS[sk]+' +'+(v*2)).join(' · ')}${sg.fit&&sg.fit!=='kauf'?' · passt zu '+MODELS[sg.fit].n:''}</code><span class="more">${esc(sg.d)}</span></label>`).join('')}</div>
      </div>
      <div class="field">
        <span class="label">3. Optionaler Modifikator</span>
        <div class="choices compact">
          <label class="choice"><input type="radio" name="gmod" value="none" ${!gm?'checked':''}><b>Keiner</b><span class="more">Klassisch, ohne genreübergreifende Zutat.</span></label>
          ${Object.entries(GENRE_MODS).map(([k,md])=>`<label class="choice"><input type="radio" name="gmod" value="${k}" ${gm===k?'checked':''}><b>${esc(md.n)}${fitTag(k)}</b><code>${typeof md.sales==='object'?'Verkäufe ×'+nf(md.sales.kauf,2)+' bis ×'+nf(md.sales.f2p,2):md.sales!==1?'Verkäufe ×'+nf(md.sales,2):'Verkäufe ±0'}${md.monthly?' · Serverkosten ab Beta':''}</code><span class="more">${esc(md.d)}</span></label>`).join('')}
        </div>
      </div>
      <div class="synergy-box ${gmFit==='syn'?'dream':gmFit==='clash'?'wild':''}">
        <b>🎯 ${esc(mainG.n)} · ${esc(subG?.n||'')}${gm?' + '+esc(GENRE_MODS[gm].n):''}</b>
        <span class="note">${esc(subG?.d||mainG.d)}</span>
        <div class="chips">
          <span class="chip">${combinedStats}</span>
          <span class="chip">🎮 Gameplay ${Math.round((1-blendGfxW)*100)} % · 🎨 Grafik ${Math.round(blendGfxW*100)} %</span>
          ${fit!=='kauf'?`<span class="chip">Passt zu ${MODELS[fit].n} (+1 Hype)</span>`:''}
          ${bonus}${modEff}
          ${gmFit==='syn'?`<span class="chip p">Synergie: +${MOD_SYN.gp} Gameplay, +${MOD_SYN.hype} Hype</span>`:gmFit==='clash'?`<span class="chip n">Reibung: ${MOD_CLASH.gp} Gameplay, +${MOD_CLASH.bugs} Bugs</span>`:''}
        </div>
      </div>
      <div class="wiz-nav">
        <button type="button" class="btn ghost" id="wizPrev">← Zurück: Klasse & Modell</button>
        <button type="button" class="btn" id="wizNext">Weiter: Extras & Lizenzen →</button>
      </div>`;
  }else{
    const t=TIERS[setupDraft.tier]||TIERS.indie;
    const sc=t.scale;
    const selDir=first?(setupDraft.dir==='custom'?{n:B.n||'Eigener Director',perks:B.perks}:(DIRS[setupDraft.dir]||DIRS.sid)):C.dir;
    const startBudget=first?Math.round(220*sc*(selDir.perks?.includes('netz')?1.15:1)):Math.round(C.studio.kasse);
    const ipKey=setupDraft.ip.startsWith('seq:')?'franchise':setupDraft.ip;
    const ipFee=Math.round((IPS[ipKey]?.fee||0)*sc);
    const extraUpfront=setupDraft.extras.reduce((acc,ek)=>acc+Math.round((PROJECT_EXTRAS[ek]?.upfront||0)*sc),0);
    const extraMonthly=setupDraft.extras.reduce((acc,ek)=>acc+Math.round((PROJECT_EXTRAS[ek]?.monthly||0)*sc),0);
    const netStartBudget=startBudget-ipFee-extraUpfront;
    const isSportGenre=setupDraft.genre==='sports';

    bodyHTML=`
      <h3>Schritt 4: Extras, Lizenzen & Projektstart</h3>
      <div class="field">
        <span class="label">Optionale Projekt-Extras & Lizenzen (${setupDraft.extras.length} gewählt — Klick wählt an/ab)</span>
        <div class="choices compact">
          ${Object.entries(PROJECT_EXTRAS).map(([ek,ex])=>{
            const checked=setupDraft.extras.includes(ek);
            const upCost=ex.upfront?Math.round(ex.upfront*sc):0;
            const mCost=ex.monthly?Math.round(ex.monthly*sc):0;
            const sportHint=(ek==='sportLic'&&isSportGenre)?'<span class="pos">⚽ +25 % Sport-Synergie!</span>':'';
            return `<label class="choice">
              <input type="checkbox" data-extra="${ek}" id="ek-${ek}" ${checked?'checked':''}>
              <b>${ex.n}</b>
              <code>${upCost?`Vorab −${money(upCost)} · `:''}${mCost?`−${money(mCost)}/M · `:''}${ex.code}</code>
              <span class="more">${ex.d}</span>
              ${sportHint}
            </label>`;
          }).join('')}
        </div>
      </div>
      <div class="setup-summary">
        <span class="label">Projekt-Zusammenfassung vor dem Start</span>
        <div class="mini">
          <div><span>Studio & Director</span><span><b>${esc(setupDraft.studioName)}</b> · ${esc(selDir.n)}</span></div>
          <div><span>Spiel & Rahmen</span><span><b>„${esc(setupDraft.title)}“</b> · ${t.n} · ${IPS[ipKey]?.n||'Fortsetzung'} · ${MODELS[setupDraft.model]?.n}</span></div>
          <div><span>Genre & Ausrichtung</span><span><b>${GENRES[setupDraft.genre]?.n}${subGenreOf(setupDraft.genre,setupDraft.subGenre)?' · '+subGenreOf(setupDraft.genre,setupDraft.subGenre).n:''}${GENRE_MODS[setupDraft.gmod]?' + '+GENRE_MODS[setupDraft.gmod].n:''}</b></span></div>
          <div><span>Startkapital / Kasse</span><span>${money(startBudget)}</span></div>
          ${(ipFee+extraUpfront)>0?`<div><span>Abzgl. Vorabkosten (Lizenz & Extras)</span><span class="neg">−${money(ipFee+extraUpfront)}</span></div>`:''}
          <div><span><b>Verfügbares Budget in Monat 1</b></span><span class="${netStartBudget<40*sc?'neg':'pos'}"><b>${money(netStartBudget)}</b>${extraMonthly?` (zzgl. ${money(extraMonthly)}/M für Extras)`:''}</span></div>
        </div>
        ${netStartBudget<35*sc?`<div class="alert"><b>Warnung: Sehr knappes Startbudget!</b><span>Nach Abzug der Vorabkosten bleiben nur ${money(netStartBudget)}. Wählt im Zweifel ein teures Extra weniger!</span></div>`:''}
      </div>
      <p class="err" id="setupErr" hidden></p>
      <div class="wiz-nav">
        <button type="button" class="btn ghost" id="wizPrev">← Zurück: Genre & Mix</button>
        <button type="button" class="btn" id="go">🚀 ${first?'Studio gründen & Projekt starten':'Projekt jetzt starten'}</button>
      </div>`;
  }

  let noticeHTML="";
  if(C&&C.notice){noticeHTML=`<div class="alert mid" role="status">${esc(C.notice)}</div>`;delete C.notice;save()}
  m.innerHTML=noticeHTML+towelResultHTML()+engProjResultHTML()+setupModeBar()+stepsBar+bodyHTML;
  bindZoomTriggers(m);
  bindSetupMode(m);

  // Step-Tabs Navigation
  m.querySelectorAll('[data-wstep]').forEach(b=>b.onclick=()=>{
    setupStep=+b.dataset.wstep;
    renderMain();
  });

  const nmIn=$('nm');
  if(nmIn)nmIn.oninput=e=>{setupDraft.studioName=e.target.value};

  const togLock=$('togLockedDirs');
  if(togLock)togLock.onclick=()=>{showLockedSetupDirs=!showLockedSetupDirs;renderMain()};

  m.querySelectorAll('input[name=dir]').forEach(r=>r.onchange=()=>{
    if(r.checked){
      setupDraft.dir=r.value;
      const bld=$('builder');
      if(bld){
        bld.hidden=r.value!=='custom';
        if(r.value==='custom')renderBuilder();
      }
    }
  });
  if(first&&setupDraft.dir==='custom'&&$('builder'))renderBuilder();

  const ttIn=$('tt');
  if(ttIn)ttIn.oninput=e=>{setupDraft.title=e.target.value};
  const ttR=$('ttR');
  if(ttR)ttR.onclick=()=>{setupDraft.title=randTitle();if($('tt'))$('tt').value=setupDraft.title};

  m.querySelectorAll('input[name=t]').forEach(r=>r.onchange=()=>{if(r.checked){setupDraft.tier=r.value;renderMain()}});
  m.querySelectorAll('input[name=ip]').forEach(r=>r.onchange=()=>{
    if(r.checked){
      setupDraft.ip=r.value;
      if(r.dataset.st){
        const base=r.dataset.st.replace(/ (\d+)$/,'');
        const n=(+((r.dataset.st.match(/ (\d+)$/)||[])[1]||1))+1;
        setupDraft.title=base+' '+n;
        if($('tt'))$('tt').value=setupDraft.title;
      }
    }
  });
  m.querySelectorAll('input[name=dur]').forEach(r=>r.onchange=()=>{if(r.checked)setupDraft.dur=r.value});
  m.querySelectorAll('input[name=m]').forEach(r=>r.onchange=()=>{if(r.checked)setupDraft.model=r.value});

  m.querySelectorAll('input[name=g]').forEach(r=>r.onchange=()=>{
    if(r.checked){
      setupDraft.genre=r.value;
      setupDraft.subGenre=defaultSub(r.value);
      renderMain();
    }
  });
  m.querySelectorAll('input[name=gmod]').forEach(r=>r.onchange=()=>{if(r.checked){setupDraft.gmod=r.value;renderMain()}});
  m.querySelectorAll('input[name=subg]').forEach(r=>r.onchange=()=>{
    if(r.checked){
      setupDraft.subGenre=r.value;
      renderMain();
    }
  });

  m.querySelectorAll('[data-extra]').forEach(chk=>chk.onchange=()=>{
    const ek=chk.dataset.extra;
    if(chk.checked){
      if(!setupDraft.extras.includes(ek))setupDraft.extras.push(ek);
    }else{
      setupDraft.extras=setupDraft.extras.filter(x=>x!==ek);
    }
    renderMain();
  });

  const prevBtn=$('wizPrev');
  if(prevBtn)prevBtn.onclick=()=>{setupStep=Math.max(1,setupStep-1);renderMain()};
  const nextBtn=$('wizNext');
  if(nextBtn)nextBtn.onclick=()=>{
    if(setupStep===1&&first&&setupDraft.dir==='custom'&&ptsLeft()<0){
      const err=$('setupErr');
      if(err){err.hidden=false;err.textContent=`Dein Director hat ${-ptsLeft()} Punkte zu viel. Senke einen Wert, streiche einen Vorteil oder nimm eine Macke.`}
      return;
    }
    setupStep=Math.min(4,setupStep+1);
    renderMain();
  };

  const goBtn=$('go');
  if(goBtn)goBtn.onclick=launchSetupProject;
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
  const hd=$('modalTitle');
  if(!bd)return;
  if(hd)hd.textContent='Spieler-Profile & Fortschritts-Export';
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
              <div class="slot-meta">${esc(stName)} · ${games} Spiele · Kasse: ${kasse}${p.C?` · Jahr ${Math.floor((p.C.months||0)/12)+1}`:''}${p.S?` · Laufend: „${esc(p.S.title)}“ (${stepTag(p.S.round)})`:''}</div>
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
