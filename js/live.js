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
