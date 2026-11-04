// Presse: Influencer und Journalisten (Daten, Aufdeck-Helfer). Spielbar sind nur Einträge mit Bild.
const _infImg=f=>f?'raw-assets/influencer/'+f+'.jpg':'';
const _jourImg=f=>'raw-assets/journalist/'+f+'.jpg';
const INFLUENCERS=(()=>{
  // id, Name, Titel (deutsch), Bild-ID, mag, mag nicht, Reichweite
  const R=[
    ['zockrange','Erik Zockrange','Der Survival-Entdecker','9723b98e-0f7d-4978-a5c0-44b559550473',['survival','adventure'],['sports'],3],
    ['pietschmiede','Die Pietschmiede','Die Let’s-Play-Schmiede','6d124bbe-6045-4558-b601-5e296b285c95',['survival','action'],['puzzle'],2],
    ['quack','Anni the Quack','Das Pixel-Entlein','ebcf2c61-e04b-4aa6-b93d-9798b6aaa0e9',['platformer','sim'],['actadv'],2],
    ['traimax','Traimax','Der Pack-Öffner','3dde6cf6-f7ec-4309-b9be-cd92dc0dffbd',['strategy','sports'],['adventure'],2],
    ['schrapnell','Schrapnell','Der Drop-Zone-Frischling','29ba9f88-f5bc-4032-897a-b95a2ab8306b',['action','survival'],['sim'],2],
    ['brawlstern','Lukas Brawlstern','Der Handy-Raufbold','35a7c4ec-10a7-446d-99bd-20d241e1b72b',['strategy','action'],['rpg'],2],
    ['blockbau','Basti Blockbau','Der Block-Champion','9afaef32-876c-455b-a0b1-fe9d162c0c4a',['survival','platformer'],['sports'],2],
    ['blech','Montana Blech','Die laute Legende','c6657ed2-cc5c-4c8a-89c4-a812739db21f',['action','sports'],['puzzle'],3],
    ['flood','Hand of Flood','Der Esport-Showman','18baf6e7-d734-4236-a495-31e1ff085e7e',['strategy','rpg'],['sim'],2],
    ['rundenbulle','Rundenbulle','Der Rundenzähler','513baf14-304e-4d52-97f5-e11dadcdf1ed',['strategy'],['action'],1],
    ['palooten','Pa-Looten','Der Abenteuer-Erzähler','d03fa945-6775-4cf3-8f0e-75c60cd7dd07',['survival','platformer'],['strategy'],2],
    ['papaplatine','Papaplatine','Der Platinen-Komiker','',['adventure','puzzle'],['sports'],2],
    ['knoss','Knoss Boss','Der Chat-Casino-König','89328439-7311-4d1b-bdbc-50deda9bca38',['sports','puzzle'],['actadv'],2],
    ['pewdiebrie','PewDieBrie','Der Käse-Kaiser','',['actadv','survival'],['sports'],3],
    ['markimulti','Markimultiplier','Der Horror-Multiplikator','',['actadv','adventure'],['strategy'],2],
    ['ninjoy','Ninjoy','Der Neon-Ninja','0d7b206f-a796-43fe-9865-20d36c0d4b24',['action'],['rpg'],3],
    ['shroudless','Shroudless','Das stille Zielfernrohr','c4bd5ee6-e8c0-4af4-903c-9697ad7f203e',['action','survival'],['adventure'],2],
    ['pokiwave','Pokiwave','Die Chat-Flüsterin','7cea79d7-180c-493c-8f27-58aae8d635ab',['sim','rpg'],['actadv'],3],
    ['asmonmold','Asmonmold','Der Raid-Kritiker','d51663e3-7157-4487-8f2f-b77bb9c6fdeb',['rpg','actadv'],['puzzle'],2],
    ['septicsky','Jack Septicsky','Der grüne Wirbelsturm','',['platformer','adventure'],['strategy'],2],
    ['germa','Jerma Germ-a','Der absurde Experimentator','',['adventure','sim'],['action'],2],
    ['bohnemann','Bernd Bohnemann','Der Spaß-Erbsenzähler','430aa330-c9ab-4f41-8f8e-141b6c9b4555',['actadv','adventure'],['sports'],2],
    ['garderobe','Etienne Garderobe','Der Prime-Time-Stratege','d44bd112-0b6c-4709-acd7-72875cb68a97',['rpg','strategy'],['platformer'],2],
    ['bombhoff','Nils Bombhoff','Der Studio-Sprengmeister','7f88c0f4-59af-4d15-9551-dfe5cddd2ce1',['action','survival'],['adventure'],2],
    ['kracher','Simon Kracher','Der ehrliche Hammer','194146cc-7245-4e83-bae5-cf8fbec3fa02',['actadv','action'],['sim'],2],
    ['pizzanth','Chris Pizzanth','Der nukleare Erzähler','9b2bd412-5d09-44ba-8438-ff5f3579f3c4',['rpg','adventure'],['sports'],1],
    ['nerdstah','Max Nerdstah','Der nerdige Rapper','2bd1043d-4d5e-4d5e-89a7-7171045e992d',['rpg','action'],['sim'],1],
    ['nanoschneider','Nano-Schneider','Die geerdete Stimme','c7f7eba8-3759-4681-bd5f-a89987f91d70',['strategy','adventure'],['survival'],1]
  ];
  const o={};
  for(const [id,n,tag,f,likes,dislikes,reach] of R)o[id]={n,tag,img:_infImg(f),likes,dislikes,reach};
  return o;
})();
const INF_KEYS=Object.keys(INFLUENCERS).filter(k=>INFLUENCERS[k].img);

const JOURNALISTS=(()=>{
  // id, Name, Titel, Bild-ID, Magazin, Schwerpunkt, mag, mag nicht, Ton, Themen
  const R=[
    ['heiko','Heiko Klingenmeister','Strategie-Chefredakteur','86640466-b209-45cc-b324-0592475792df','Spieleheld','gp',['strategy'],['sports'],'honest',[]],
    ['pixelheim','Graf von Pixelheim','4X-Monarch','fa8df142-e33f-4c37-a9a1-b2c17385b1ec','PC Gamma','gp',['strategy','sim'],['platformer'],'bold',[]],
    ['weber','Moritz von Weber','Mittelalter-Redner','27541af7-9526-4be8-9827-3c540dacad5c','Polygone','gp',['rpg','adventure'],['sports'],'joke',['versprechen']],
    ['hopfen','Jochen Hopfengebauer','Tresen-Philosoph','d3de8cd6-699e-4766-a4f7-26d96b93b1ef','Eurogamez','gp',['adventure','actadv'],['puzzle'],'honest',['versprechen']],
    ['peschkeller','André Peschkeller','Branchen-Spürhund','ef16fc7a-f745-4235-a55c-27285a1aaa83','5Spieler','gp',[],[],'honest',['finanzen','crunch','personal','monetarisierung']],
    ['zeitschmidt','Christian Zeitschmidt','Chronist','c1e56e2d-0953-4372-9260-997cfcd69bf0','Gamestern','gp',['strategy','adventure'],['survival'],'safe',[]],
    ['schotter','Dom Schotter','Gemütlicher Chronist','75889a4e-d8dd-48ad-89af-14be9643f1fa','Kotakuh','gfx',['sim','puzzle'],['action'],'joke',['crunch']],
    ['stangenfeuer','Sebastian Stangenfeuer','Benchmark-Veteran','dcd3224e-f9ce-4057-986d-3774f7c7deb7','IGM','gfx',['action','sports'],['adventure'],'safe',[]],
    ['flott','Gunnar Flott','Vintage-Stratege','86a1753f-314a-4b97-936a-f791b7052bd2','Retro Gamer Zone','gp',['strategy','platformer'],['survival'],'safe',['monetarisierung']],
    ['schnaeppchen','Fabian Schnäppchenkäufer','Konsolen-Archivar','11c3d986-ce27-4e00-8780-bfd9ed0929cc','Pixel World','gfx',['platformer','actadv'],['strategy'],'joke',[]],
    ['rpgheven','Gregorios RPG-Heven','JRPG-Orakel','61f570eb-01cb-496f-b4b1-0a1bea45ac66','Ohrwurm Magazin','snd',['rpg'],['sports'],'bold',['versprechen']]
  ];
  const o={};
  for(const [id,n,tag,f,outlet,fo,likes,dislikes,tone,topics] of R)o[id]={n,tag,img:_jourImg(f),outlet,f:fo,likes,dislikes,tone,topics};
  return o;
})();
const JOUR_KEYS=Object.keys(JOURNALISTS);

const INF={base:50,like:25,dislike:-30,perHype:2,famePer:25,min:5,max:95,free:90,normal:60,double:30,price:4,maxHired:2,offerN:3,streamChance:.08};
const PRESS={reviewN:3,prefShift:6,toneHit:10,probeStart:3,probePer:.05,probeMax:.3,probeDc:12,prCost:6,prBase:.25,prPer:.05,streamDc:13};

function defaultInf(){return {offer:null,asked:[],hired:[],stream:false,pending:null}}

function _likeOf(d){
  if(!d)return 0;
  if(d.likes.includes(S.genre))return 1;
  if(d.dislikes.includes(S.genre))return -1;
  return 0;
}
function infLikes(id){return _likeOf(INFLUENCERS[id])}
function jourLikes(id){return _likeOf(JOURNALISTS[id])}
function infBock(id){
  const l=infLikes(id);
  return clamp(INF.base+(l>0?INF.like:0)+(l<0?INF.dislike:0)+S.res.hype*INF.perHype+Math.floor((C.studio.fame||0)/INF.famePer),INF.min,INF.max);
}

function _known(){
  if(!C.known)C.known={inf:{},jour:{}};
  if(!C.known.inf)C.known.inf={};
  if(!C.known.jour)C.known.jour={};
  return C.known;
}
function revealInf(id){_known().inf[id]=true}
function revealJour(id,part){
  const k=_known().jour;
  if(!k[id])k[id]={};
  k[id][part]=true;
}
function infKnown(id){return !!_known().inf[id]}
function jourKnown(id,part){const j=_known().jour[id];return !!(j&&j[part])}

function infOffers(){
  const ph=curPhase();
  if(!S.inf.offer||S.inf.offer.ph!==ph){
    const pool=INF_KEYS.filter(k=>!S.inf.asked.includes(k));
    const ids=[];
    while(ids.length<INF.offerN&&pool.length)ids.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
    S.inf.offer={ph,ids};
  }
  return S.inf.offer.ids.filter(k=>!S.inf.asked.includes(k));
}
function infPrice(id){return INF.price*INFLUENCERS[id].reach*T().scale}
function infCanAsk(id){return !S.inf.asked.includes(id)&&S.inf.hired.length<INF.maxHired&&!S.inf.pending}
function askInfluencer(id,r){
  if(r===undefined)r=d100();
  const total=r+(infBock(id)-50);
  const tier=total>=INF.free?'free':total>=INF.normal?'normal':total>=INF.double?'double':'refuse';
  const price=tier==='free'?0:infPrice(id)*(tier==='double'?2:1);
  S.inf.asked.push(id);
  if(tier==='refuse'){
    S.inf.pending=null;
    S.shopMsg={n:INFLUENCERS[id].n,ch:[],txt:INFLUENCERS[id].n+' winkt ab: kein Interesse an eurem Spiel.'};
    addLog(`<span>${stepTag()}</span> ${INFLUENCERS[id].n} lehnt die Kooperation ab`);
  }else S.inf.pending={id,r,total,tier,price};
  return tier;
}
function acceptInfluencer(){
  const p=S.inf.pending;
  if(!p||S.res.budget<p.price||S.inf.hired.length>=INF.maxHired)return false;
  const d=INFLUENCERS[p.id],reach=d.reach;
  S.res.budget-=p.price;S.spend.invest=(S.spend.invest||0)+p.price;
  const ch=apply(infLikes(p.id)===-1?{hype:Math.floor(reach/2),wl:reach}:{hype:reach,wl:2*reach});
  revealInf(p.id);S.inf.hired.push(p.id);S.inf.pending=null;
  S.shopMsg={n:d.n,ch:[['budget',-p.price],...ch],txt:d.n+' zeigt euer Spiel seiner Community.'};
  addLog(`<span>${stepTag()}</span> Influencer: ${d.n} für ${money(p.price)}`);
  return true;
}
function declineInfluencer(){S.inf.pending=null}

/* ===================== Überraschungs-Stream ===================== */
function streamDue(){return !!S&&!!S.inf&&!S.inf.stream&&S.round>=stepIndex('prod_fp')&&S.round<STEPS.length-1&&Math.random()<INF.streamChance}
function startStream(){
  const pool=INF_KEYS.concat('zockrange');
  const id=pool[Math.floor(Math.random()*pool.length)];
  S.stream=id;S.inf.stream=true;S.screen='stream';
  addLog(`<span>${stepTag(lastStep())}</span> 📺 Live-Stream: ${INFLUENCERS[id].n} hat eure Demo entdeckt`);
  render();save();return true;
}
function streamCard(id){
  const d=INFLUENCERS[id],r=d.reach,l=infLikes(id);
  return {t:`Live-Stream: ${d.n}`,
    x:`${d.n} hat eure Demo entdeckt und will sie heute Abend live spielen.`,
    o:[{l:'Live dazuschalten',st:'business',dc:PRESS.streamDc,bonusV:D().s.hype*4+Math.round((infBock(id)-50)/5),
        s:{hype:2*r,wl:3*r},f:{hype:-(r+1)},
        sx:`${d.n} streamt euer Spiel und der Chat feiert es.`,fx:`Der Stream läuft schlecht, ${d.n} verzieht das Gesicht und der Chat lacht.`},
       {l:'Nur Key schicken',safe:l>0?{hype:r}:l<0?{}:{hype:1},sx:`${d.n} bekommt einen Key und spielt in Ruhe.`},
       {l:'Absagen',safe:{},sx:'Ihr sagt höflich ab. Der Stream findet ohne euch statt.'}]};
}

/* ===================== Kritische Recherche ===================== */
const PROBE_TOPICS=['finanzen','versprechen','crunch','personal','monetarisierung'];
function probePoints(){
  const s=S,f=s.fund||{};
  const deals=f.deals||[];
  return {
    finanzen:(s.crisisSeen?1:0)+((s.rescued||[]).includes('kredit')?1:0)+(deals.some(d=>d.status==='cancelled')?1:0),
    versprechen:(s.promises>=2?1:0)+((f.cuts||[]).length&&deals.some(d=>d.id==='crowd')?1:0),
    crunch:(s.crunchN||0)>=3?1:0,
    personal:s.layoff?1:0,
    monetarisierung:s.lootbox?1:0
  };
}
function probeScore(){const p=probePoints();return PROBE_TOPICS.reduce((a,k)=>a+p[k],0)}
function probeTopic(){
  const p=probePoints();let best=PROBE_TOPICS[0];
  for(const k of PROBE_TOPICS)if(p[k]>p[best])best=k;
  return best;
}
function probeJournalist(topic){
  const pool=JOUR_KEYS.filter(k=>JOURNALISTS[k].topics.includes(topic));
  return pool.length?pool[Math.floor(Math.random()*pool.length)]:'peschkeller';
}
function probeDue(){
  if(!S||S.probeSeen||S.round<PRESS.probeStart||S.round>=STEPS.length-1)return false;
  const sc=probeScore();
  return sc>0&&Math.random()<Math.min(PRESS.probeMax,PRESS.probePer*sc);
}
function startProbe(){
  const topic=probeTopic(),j=probeJournalist(topic);
  S.probe={j,topic,score:probeScore()};S.probeSeen=true;S.screen='probe';
  addLog(`<span>${stepTag(lastStep())}</span> 📣 ${JOURNALISTS[j].n} recherchiert über euer Studio`);
  render();save();return true;
}
const PROBE_TEXT={
  finanzen:'fragt nach eurer Finanzierung',
  versprechen:'fragt nach euren gebrochenen Versprechen',
  crunch:'fragt nach den Arbeitszeiten in eurem Team',
  personal:'fragt nach den Entlassungen im Studio',
  monetarisierung:'fragt nach den Lootboxen in eurem Spiel'
};
function probeCard(id){
  const d=JOURNALISTS[id],score=S.probe?S.probe.score:probeScore(),topic=S.probe?S.probe.topic:probeTopic();
  return {t:`${d.n} recherchiert über euer Studio`,
    x:`${d.n} (${d.outlet}) ${PROBE_TEXT[topic]}. Die Antwort steht bald im Netz.`,
    o:[{l:'Offen Stellung nehmen',st:'team',dc:PRESS.probeDc+Math.max(0,score-1),s:{hype:1,fame:2},f:{hype:-3,fame:-4},
        sx:'Ihr legt alles offen. Der Artikel ist fair und die Leser honorieren die Ehrlichkeit.',fx:'Das Statement geht nach hinten los und der Artikel zerpflückt euch.'},
       {l:'Kein Kommentar',safe:{hype:-2,fame:-2},sx:'Ihr schweigt. Im Artikel steht nur „auf Anfrage nicht geantwortet“.'},
       {l:'Abwiegeln mit PR-Agentur',safe:{budget:-PRESS.prCost},sx:'Die Agentur verschickt eine glatte Erklärung.',
        onSafe:()=>{
          if(Math.random()<PRESS.prBase+PRESS.prPer*score){
            const ch=apply({hype:-4,fame:-6});
            return {ch,txt:`Es fliegt auf: ${d.n} deckt die Agentur-Mail auf und der Skandal wächst.`};
          }
          return {ch:[],txt:'Die Agentur hält dicht.'};
        }}]};
}
