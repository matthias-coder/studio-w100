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
