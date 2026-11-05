/* Aktivitäten der Konzeptphase: Ideenmixer (Kniff/Schauplatz/Twist), USP und Zielgruppe */
const CONCEPT={hand:3,rerolls:1,hype:1,hypeStrong:1,pitchPer:3,revPer:2};
const PROTO={dc:8,step:2,max:4,failZeit:.5,fumbleZeit:1,funStep:.08,maxFun:3};
const AUD={
  casual:{n:'Gelegenheitsspieler',d:'Großer Markt, aber Kritiker rümpfen die Nase.',sales:1.15,rev:-2,hype:0},
  core:{n:'Core-Gamer',d:'Die klassische Zielgruppe. Keine Überraschungen.',sales:1,rev:0,hype:0},
  hard:{n:'Hardcore-Fans',d:'Kleinere Zielgruppe, aber laut und kritikerfreundlich.',sales:.85,rev:2,hype:1}
};
const IDEA_SLOTS={hook:'Kniff',setting:'Schauplatz',twist:'Twist'};
const IDEAS={
  hook:[
    {id:'loop',ic:'⏳',n:'Zeitschleife',a:'gp',g:['adventure','puzzle','actadv']},
    {id:'physics',ic:'🧲',n:'Physik-Chaos',a:'gp',g:['puzzle','sim','platformer']},
    {id:'build',ic:'🧱',n:'Alles ist baubar',a:'gp',g:['survival','sim','strategy']},
    {id:'rhythm',ic:'🥁',n:'Kämpfe im Takt',a:'snd',g:['action','rpg','platformer']},
    {id:'weather',ic:'⛈️',n:'Lebendiges Wetter',a:'gfx',g:['actadv','sports','survival']},
    {id:'onebutton',ic:'🔘',n:'Ein-Knopf-Steuerung',a:'gp',g:['puzzle','platformer','sports']},
    {id:'dog',ic:'🐕',n:'Begleiter-Hund',a:'gfx',g:['actadv','adventure','rpg']},
    {id:'voice',ic:'🎙️',n:'Sprachsteuerung',a:'snd',g:['adventure','strategy','sim']}
  ],
  setting:[
    {id:'deepsea',ic:'🌊',n:'Unterwasserstadt',a:'gfx',g:['actadv','survival','adventure']},
    {id:'ruhr',ic:'🏭',n:'Ruhrpott 2099',a:'gfx',g:['action','rpg','strategy']},
    {id:'office',ic:'🗂️',n:'Mittelalterliches Großraumbüro',a:'gp',g:['sim','strategy','adventure']},
    {id:'cpu',ic:'💾',n:'Im Inneren eines Computers',a:'gfx',g:['puzzle','platformer','action']},
    {id:'jazz',ic:'🎷',n:'Jazzbar im All',a:'snd',g:['adventure','rpg','sim']},
    {id:'cake',ic:'🍰',n:'Welt aus Kuchen',a:'gfx',g:['platformer','puzzle','sim']},
    {id:'hotel',ic:'👻',n:'Geisterhotel',a:'snd',g:['adventure','actadv','survival']},
    {id:'moon',ic:'🌙',n:'Mondkolonie',a:'gp',g:['strategy','sim','survival']}
  ],
  twist:[
    {id:'villain',ic:'😈',n:'Du spielst den Bösewicht',a:'gp',g:['rpg','strategy','actadv']},
    {id:'liar',ic:'🗣️',n:'Der Erzähler lügt',a:'snd',g:['adventure','rpg','actadv']},
    {id:'dream',ic:'💭',n:'Alles nur geträumt?',a:'gfx',g:['adventure','platformer','puzzle']},
    {id:'aging',ic:'🕰️',n:'Die Welt altert mit',a:'gfx',g:['rpg','sim','survival']},
    {id:'permadeath',ic:'☠️',n:'Jede Entscheidung ist endgültig',a:'gp',g:['rpg','strategy','survival']},
    {id:'silent',ic:'🎞️',n:'Stummfilm-Look',a:'gfx',g:['platformer','adventure','puzzle']},
    {id:'strangers',ic:'🤝',n:'Koop mit Fremden',a:'gp',g:['action','survival','sports']},
    {id:'bossfriends',ic:'🫂',n:'Die Bosse werden Freunde',a:'snd',g:['action','rpg','platformer']}
  ]
};

function ideaById(slot,id){return (IDEAS[slot]||[]).find(c=>c.id===id)||null}
function drawHand(){
  const hand={};
  for(const slot in IDEA_SLOTS){
    const ids=IDEAS[slot].map(c=>c.id);
    hand[slot]=[];
    while(hand[slot].length<CONCEPT.hand&&ids.length)hand[slot].push(ids.splice(Math.floor(Math.random()*ids.length),1)[0]);
  }
  return hand;
}
function defaultConcept(lock){return {done:false,lock:!!lock,hand:drawHand(),rerolls:CONCEPT.rerolls}}
function rerollHand(){
  const c=S.concept;
  if(!c||!(c.rerolls>0))return false;
  c.hand=drawHand();c.rerolls--;
  return true;
}
function conceptDue(s=S){return !!s&&!!s.concept&&!s.concept.done&&STEPS[s.round]?.id==='con_ideas'}

function uspArea(ids){
  const a=['hook','setting','twist'].map((slot,i)=>ideaById(slot,ids[i])?.a);
  for(const x of a)if(a.filter(y=>y===x).length>=2)return x;
  return a[0];
}
function uspPower(ids,genre){
  const cards=['hook','setting','twist'].map((slot,i)=>ideaById(slot,ids[i])).filter(Boolean);
  const shared=cards.some(c=>cards.filter(d=>d.a===c.a).length>=2);
  return 1+(shared?1:0)+(cards.some(c=>c.g.includes(genre))?1:0);
}

function confirmConcept({genre,sub,gmod,picks,aud}={}){
  const c=S.concept;
  if(!c||!picks||!AUD[aud])return false;
  const slots=Object.keys(IDEA_SLOTS);
  if(!slots.every(k=>c.hand&&c.hand[k]&&c.hand[k].includes(picks[k])&&ideaById(k,picks[k])))return false;
  if(!c.lock&&!GENRES[genre])return false;
  const ids=slots.map(k=>picks[k]);
  if(!c.lock)applyGenre(genre,sub||null,gmod||null);
  const area=uspArea(ids),power=uspPower(ids,S.genre);
  const n=slots.map((k,i)=>ideaById(k,ids[i]).n).join(' · ');
  S.usp={ids,area,power,n};
  S.aud=aud;
  S.res.hype=clamp(S.res.hype+CONCEPT.hype+(power===3?CONCEPT.hypeStrong:0)+AUD[aud].hype,0,10);
  c.done=true;
  addLog(`<span>${stepTag()}</span> 💡 Konzept steht: ${genreName(S)}${S.trendHot?' (Boom-Genre!)':S.trendCold?' (Übersättigt)':''} · USP „${esc(n)}“ (${AREAS[area].n}, Stärke ${power}) · Zielgruppe ${AUD[aud].n}`);
  goMonth();
  return true;
}

/* Wirkung von USP und Zielgruppe */
function uspTarget(s=S){return s.usp?msTargets('gm',s)[s.usp.area]:0}
function uspKept(s=S){
  if(!s.usp||!(s.res[s.usp.area]>=uspTarget(s)))return false;
  if(s.feat&&s.feat.plan){
    if(s.feat.cut.some(f=>f.id==='usp'))return false;
    const f=s.feat.plan.find(x=>x.id==='usp');if(f&&!f.done)return false;
  }
  return true;
}
function uspRev(s=S){return s.usp?(uspKept(s)?1:-1)*CONCEPT.revPer*s.usp.power:0}
function audSales(s=S){return AUD[s.aud]?.sales??1}
function audRev(s=S){return AUD[s.aud]?.rev??0}

/* ===================== Prototyp-Schleife ===================== */
function protoDue(s=S){return !!s.proto&&!s.proto.done&&STEPS[s.round]?.id==='pre_proto'&&!isSkipped(s.round,s)}
function protoDc(s=S){return PROTO.dc+PROTO.step*s.proto.n}
function funMult(s=S){return 1+PROTO.funStep*((s.proto&&s.proto.fun)||0)}
function startProto(){
  if(!S.proto||S.proto.done)return;
  startRoll({kind:'proto',ev:'proto',adv:false});
}
function resolveProto(ok,crit,fumble){
  const p=S.proto,ch=[];let txt='';
  p.n++;
  if(ok){
    p.fun=Math.min(PROTO.maxFun,p.fun+(crit?2:1));
    txt=`Fun gefunden! Stufe ${p.fun}`;
  }else{
    const lose=fumble?PROTO.fumbleZeit:PROTO.failZeit;
    ch.push(...apply({zeit:-lose}));
    if(fumble)p.fun=Math.max(0,p.fun-1);
    txt=`Sackgasse – ${fmtSpan(lose*refMonths(S.tier)/12)} verloren${fumble?`, Fun-Stufe ${p.fun}`:''}`;
  }
  if(p.n>=PROTO.max){p.done=true;addLog(`🧪 Prototyp abgeschlossen: Fun-Stufe ${p.fun}`)}
  return {ch,txt};
}
function endProto(){
  if(S.proto&&!S.proto.done){
    S.proto.done=true;
    addLog(`🧪 Prototyp abgeschlossen: Fun-Stufe ${S.proto.fun}`);
  }
  goMonth();
}
