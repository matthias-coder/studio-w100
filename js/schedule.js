/* ===================== Zeitplan: Phasen, Schritte & Zeitrechnung ===================== */
const PHASES=['Konzept','Pitch & Finanzierung','Pre-Production','Production','Polish, QA & Release'];
const CP_TO_PHASE=[0,2,3,3,4,4]; // alte Content-Phase -> neue Phase (nur Anzeige)
const DUR_KEYS=['short','normal','long'];
const DUR_LABELS={short:'Kurz',normal:'Normal',long:'Lang'};
const STEPS=[
  {id:'con_ideas',ph:0,cp:0,n:'Ideen sammeln',share:4,hire:true},
  {id:'con_lock',ph:0,cp:0,n:'Konzept festlegen',share:4},
  {id:'pit_meet',ph:1,cp:0,n:'Pitch-Termine',share:3},
  {id:'pit_mix',ph:1,cp:0,n:'Finanzierung steht',share:3},
  {id:'pre_tech',ph:2,cp:1,n:'Engine & Pipeline',share:6,hire:true},
  {id:'pre_proto',ph:2,cp:1,n:'Prototyp-Schleife',share:6},
  {id:'pre_slice',ph:2,cp:1,n:'Vertical Slice',share:6},
  {id:'prod_plan',ph:3,cp:2,n:'Produktionsplanung',share:13,hire:true},
  {id:'prod_fp',ph:3,cp:2,n:'Bis First Playable',share:13},
  {id:'prod_alpha',ph:3,cp:3,n:'Bis Alpha',share:13,mkt:true,ea:true},
  {id:'prod_beta',ph:3,cp:3,n:'Bis Beta',share:13,mkt:true,ea:true,live:true},
  {id:'pol_bugs',ph:4,cp:4,n:'Bug-Jagd',share:8,mkt:true,ea:true,live:true},
  {id:'pol_ship',ph:4,cp:5,n:'Zertifizierung & Release',share:8,mkt:true,live:true}
];
function stepIndex(id){return STEPS.findIndex(s=>s.id===id)}
function durMonths(tier,durKey){const d=TIERS[tier].dur,i=DUR_KEYS.indexOf(durKey);return d[i<0?1:i]}
function refMonths(tier){return TIERS[tier].dur[1]}
function stepMonths(i,s=S){return s.dur*STEPS[i].share/100}
function stepW(i=S.round,s=S){return 12*STEPS[i].share/100*s.dur/refMonths(s.tier)}
function totalW(s=S){return STEPS.reduce((a,_,i)=>a+stepW(i,s),0)}
function curStep(s=S){return STEPS[Math.min(s.round,STEPS.length-1)]}
function stepFlag(flag,i=S.round){return !!STEPS[i]?.[flag]}
function costPerMonth(){return monthSum()*12/refMonths(S.tier)}
function stepCost(i=S.round){return monthSum()*stepW(i)}
function perMonth(v,s=S){return v*12/refMonths(s.tier)}
function monthsDone(s=S){let m=0;for(let i=0;i<Math.min(s.round,STEPS.length);i++)m+=stepMonths(i,s);return m}
function monthsLeft(s=S){let m=0;for(let i=Math.max(0,s.round);i<STEPS.length;i++)m+=stepMonths(i,s);return m}
function fmtSpan(m){
  if(m<1)return `${Math.max(1,Math.round(m*4.3))} Wochen`;
  const t=nf(m,m<10?1:0);
  return t==='1'?'1 Monat':`${t} Monate`;
}
function stepTag(i=S.round){return `R${i+1}`}
function stepLabel(i=S.round){const st=STEPS[i];return `${PHASES[st.ph]} · ${st.n} · Schritt ${i+1}/${STEPS.length} · ${fmtSpan(stepMonths(i))}`}
