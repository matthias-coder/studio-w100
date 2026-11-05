/* Etappe 5: Geschäftsmodelle & Live-Betrieb – Konstanten und Modell-Helfer */
const LIVE={launchMult:.85,premiumSales:.9,kaufActive:.5,arpu:1.2,subShare:.2,fee:12.99,cut:.7,
  server:1,serverPer:.05,churn:.08,staleChurn:.06,synChurn:-.02,clashChurn:.03,metaChurn:.002,minChurn:.03,maxChurn:.3,
  capLive:.12,capPremium:.08,capMax:.6,seasonEvery:6,seasonCost:12,seasonBack:.3,seasonCap:.15,eosFame:2};
const LIVE_SYN=['rpg.mmorpg','action','strategy.moba','survival','sports.sim'];
const LIVE_CLASH=['adventure','puzzle.logic','platformer','rpg.crpg'];
function hasPremium(s=S){return !!s&&(s.extras||[]).includes('premium')}
function modelTags(s=S){return [s.model,...(hasPremium(s)?['abo']:[])]}
function liveFit(genre,sub){
  const keys=[genre,...(sub?[genre+'.'+sub]:[])],has=l=>keys.some(k=>l.includes(k));
  return has(LIVE_SYN)?'syn':has(LIVE_CLASH)?'clash':null;
}
function modelRevenue(units,price){
  units=Math.round(units*(S.model==='live'?LIVE.launchMult:1)*(hasPremium(S)?LIVE.premiumSales:1));
  const rev=units*price*.6/1000,detail=[['Verkaufte Exemplare',nf(units,0)],['Preis',nf(price,2)+' €'],['Umsatz netto (60 % nach Plattform und Steuern)',money(rev)]];
  if(hasPremium(S))detail.push(['Premium-Abo','−10 % Verkäufe, Abo-Einnahmen im Live-Betrieb']);
  if(S.model==='live')detail.push(['Live Service','Launch ×0,85, danach laufende Einnahmen im Live-Betrieb']);
  return {units,rev,detail};
}
function liveAdd(e){
  if(S.model!=='live'&&!hasPremium(S))return null;
  const t=T(),players=S.model==='live'?e.units:Math.round(e.units*LIVE.kaufActive),h=C.hall[C.hall.length-1];
  const g={nr:h.nr,title:S.title,tier:t.n,scale:t.scale,model:S.model,premium:hasPremium(S),players,peak:players,meta:e.meta,user:e.user,
    fit:liveFit(S.genre,S.subGenre),months:0,since:0,stale:false,seasons:0,seasonAt:null,net:0,status:'on'};
  if(!Array.isArray(C.live))C.live=[];
  C.live.push(g);h.live={months:0,net:0,seasons:0,on:true};
  return g;
}
function liveOn(){return (C.live||[]).filter(g=>g.status==='on')}
function liveChurn(g){
  const f=g.fit==='syn'?LIVE.synChurn:g.fit==='clash'?LIVE.clashChurn:0;
  return clamp(LIVE.churn+(g.stale?LIVE.staleChurn:0)+f-(g.meta-70)*LIVE.metaChurn,LIVE.minChurn,LIVE.maxChurn);
}
function liveMonthly(g){
  const rev=g.players*((g.model==='live'?LIVE.arpu:0)+(g.premium?LIVE.subShare*LIVE.fee:0))*LIVE.cut/1000;
  const cost=LIVE.server*g.scale+g.players*LIVE.serverPer/1000;
  return {rev,cost,net:rev-cost};
}
function liveSync(g){
  const h=(C.hall||[]).find(x=>x.nr===g.nr);
  if(h)h.live={months:g.months,net:g.net,seasons:g.seasons,on:g.status==='on'};
}
function liveTick(months){
  let net=0;const notes=[];
  liveOn().forEach(g=>{
    let rem=months;
    while(rem>1e-9){
      const ch=Math.min(1,rem);rem-=ch;
      const n=liveMonthly(g).net*ch;g.net+=n;net+=n;
      g.players=Math.round(g.players*Math.pow(1-liveChurn(g),ch));g.months+=ch;g.since+=ch;
    }
    if(liveMonthly(g).net<0){
      g.status='eos';
      notes.push(`📡 ${g.title}: Die Server kosten mehr, als sie einbringen. Automatisches End of Service.`);
    }
    liveSync(g);
  });
  return {net,notes};
}
function liveGameCap(g){return (g.model==='live'?LIVE.capLive:0)+(g.premium?LIVE.capPremium:0)}
function liveCapShare(s=S){
  let t=0;
  liveOn().forEach(g=>{t+=liveGameCap(g)+(g.seasonAt===s.round?LIVE.seasonCap:0)});
  return Math.min(t,LIVE.capMax);
}
function seasonDue(s=S,c=C){
  if(!s||!c)return null;
  return (c.live||[]).find(g=>g.status==='on'&&g.since>=LIVE.seasonEvery)||null;
}
function seasonCost(g){return LIVE.seasonCost*g.scale}
function openSeason(){
  const g=seasonDue();if(!g)return false;
  S.season=g.nr;S.screen='season';render();save();return true;
}
function endService(nr,auto=false){
  const g=(C.live||[]).find(x=>x.nr===nr);
  if(!g||g.status!=='on')return false;
  g.status='eos';g.seasonAt=null;
  if(!auto)C.studio.fame=Math.max(0,(C.studio.fame||0)-LIVE.eosFame);
  liveSync(g);
  if(typeof S!=='undefined'&&S)addLog(`🔌 End of Service: „${g.title}“`);
  return true;
}
function decideSeason(choice){
  const g=(C.live||[]).find(x=>x.nr===S.season);
  S.season=null;
  if(!g||g.status!=='on'){afterRandom();return}
  if(choice==='run'){
    const cost=seasonCost(g);
    S.res.budget-=cost;S.liveNet=(S.liveNet||0)-cost;g.net-=cost;
    g.players=Math.min(g.peak,g.players+Math.round(g.peak*LIVE.seasonBack));
    g.stale=false;g.since=0;g.seasons++;g.seasonAt=S.round;
    liveSync(g);
    addLog(`📡 Season für „${g.title}“ gestartet`);
  }else if(choice==='skip'){
    g.stale=true;g.since=0;liveSync(g);
    addLog(`📡 Season für „${g.title}“ ausgelassen`);
  }else if(choice==='eos'){
    endService(g.nr);
  }
  afterRandom();
}
