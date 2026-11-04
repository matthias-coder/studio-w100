/* ===================== Geldgeber: Tabelle, Angebote, Deals & Zahlungen ===================== */
const FUND={ambMoney:1.3,ambDc:2,ambSoll:3,critBonus:.2,renegoDc:12,nearRate:.5,repay:.5,invShare:.2,invHype:3,lawsuitChance:.05,lawsuitShare:.5,cutZeit:1,cutGp:3};
const FUNDERS={
  pub:{n:'🏢 Publisher',ic:'🏢',share:.6,sign:.3,ms:['vs','fp','alpha','beta','gm'],dc:14,tiers:null,
    d:'Verpasst du einen Meilenstein, fällt die Rate weg und ein Feature muss gestrichen werden. Beim zweiten Mal kündigt er und will die Hälfte zurück.'},
  inv:{n:'💼 Investoren',ic:'💼',share:.4,sign:.5,ms:['fp','beta','gm'],dc:15,tiers:null,
    d:'Verpasst du einen Meilenstein, fällt die Rate weg. Beim zweiten Mal steigen sie aus, behalten aber ihren Gewinnanteil.'},
  grant:{n:'🏛️ Förderung',ic:'🏛️',share:.15,sign:.5,ms:['vs','gm'],dc:11,tiers:['indie','aa'],
    d:'Verpasst du einen Meilenstein, muss die Hälfte des bereits gezahlten Geldes zurück und die Förderung endet.'},
  crowd:{n:'🙌 Crowdfunding',ic:'🙌',share:null,sign:1,ms:[],dc:13,tiers:['indie','aa'],
    d:'Das Geld kommt sofort und ohne Meilensteine. Gestrichene Features brechen Stretch Goals und können eine Klage nach sich ziehen.'}
};
const r1=x=>Math.round(x*10)/10;
function defaultFund(){return {pitched:false,self:false,amb:false,deals:[],cuts:[],renego:false,cutPending:false}}
function projCost(s=S){return r1(monthSum()*totalW(s))}
function funderAvail(id,s=S){const f=FUNDERS[id];return !!f&&(!f.tiers||f.tiers.includes(s.tier))}
function funderOffer(id,amb=false,s=S){
  const f=FUNDERS[id],pc=projCost(s);
  const share=id==='crowd'?Math.min(.5,.05+.05*s.res.hype):f.share;
  const mult=amb&&(id==='pub'||id==='inv')?FUND.ambMoney:1;
  return r1(pc*share*mult);
}
function findDeal(id,s=S){return s.fund.deals.find(d=>d.id===id)}
function payDeal(deal,x){
  x=r1(x);
  if(deal.id==='pub'){S.recoup+=x;S.publisher=true}
  else if(deal.id==='inv')S.investIn+=x;
  else S.income+=x;
  S.res.budget+=x;deal.paid=r1(deal.paid+x);
  return x;
}
function signDeal(id,total){
  const f=FUNDERS[id];total=r1(total);
  const open=f.ms.filter(m=>!(S.msDone||[]).includes(m));
  let first=r1(total*f.sign);
  const rest=r1(total-first),rates={};
  if(open.length){
    const each=r1(rest/open.length);let used=0;
    open.forEach((m,i)=>{const v=i===open.length-1?r1(rest-used):each;rates[m]=v;used=r1(used+v)});
  }else first=total; // nothing left to wait for: pay everything now
  const deal={id,total,paid:0,rates,misses:0,status:'active',pend:null};
  S.fund.deals.push(deal);
  payDeal(deal,first);
  if(id==='inv')S.equity+=FUND.invShare;
  return deal;
}
function planText(id){
  const f=FUNDERS[id],pct=Math.round(f.sign*100);
  if(!f.ms.length)return `${pct} % bei Kampagnenende`;
  const names=f.ms.map(m=>msById(m).n);
  const list=names.length>2?`${names[0]} … ${names[names.length-1]}`:names.join(', ');
  return `${pct} % bei Unterschrift, Rest in ${names.length} ${names.length===1?'Rate':'Raten'} (${list})`;
}

/* ===================== Pitch: Auswahl, Wurf, Abschluss, Eigenfinanzierung ===================== */
function pitchDue(s=S){return !s.fund.pitched&&STEPS[s.round]?.id==='pit_meet'}
function pitchBonus(s=S){return (Math.floor(s.res.hype/2)+Math.floor((s.res.qual-30)/10))*4+fameBonus()}
function pitchMod(){return optMod({st:'business'})+pitchBonus()+moralMod()}
function pitchTarget(id,amb){return dc100(FUNDERS[id].dc+(amb?FUND.ambDc:0))}
function startPitch(ids,amb){
  const sel=(ids||[]).filter(id=>funderAvail(id));
  if(!sel.length)return;
  S.fund.amb=!!amb;S.pitchSel=sel;
  startRoll({kind:'pitch',ev:'pitch',adv:false});
}
function selfFund(){
  S.fund.pitched=true;S.fund.self=true;S.skip.push('pit_mix');
  addLog(`<span>${stepTag()}</span> Finanzierung: nur Eigenkapital`);
  goMonth();
}
function resolvePitch(total,crit,fumble){
  const amb=S.fund.amb,ch=[],won=[],lost=[];let got=0;
  (S.pitchSel||[]).filter(id=>funderAvail(id)).forEach(id=>{
    const ok=crit||(!fumble&&total>=pitchTarget(id,amb));
    if(!ok){lost.push(FUNDERS[id].n);return}
    const deal=signDeal(id,r1(funderOffer(id,amb)*(crit?1+FUND.critBonus:1)));
    got=r1(got+deal.paid);won.push(`${FUNDERS[id].n} (${money(deal.total)})`);
  });
  S.fund.pitched=true;
  if(!S.fund.deals.length&&!S.skip.includes('pit_mix'))S.skip.push('pit_mix');
  if(got)ch.push(['budget',got]);
  const txt=(won.length?`Zugesagt: ${won.join(', ')}. `:'')+(lost.length?`Abgesagt: ${lost.join(', ')}.`:'');
  return {ch,txt:txt.trim()};
}
