const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function showView(view){
  ['home','diag','results','routine','library','progress','guide'].forEach(id=>{
    const el = $('#view-'+id);
    if(!el) return;
    if(id===view){ el.classList.add('show'); el.style.display='block'; requestAnimationFrame(()=>el.classList.add('show')); }
    else { el.classList.remove('show'); el.style.display='none'; }
  });
  $$('.tab').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
  $$('.bottom-nav .btn').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
}

$$('.tab').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
$$('.bottom-nav .btn').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
$$('[data-nav]').forEach(b => b.addEventListener('click', () => showView('diag')));

// Elements
const ankleL=$('#ankleL'), ankleR=$('#ankleR');
const hipIRL=$('#hipIRL'), hipIRR=$('#hipIRR');
const hipIRLVal=$('#hipIRLVal'), hipIRRVal=$('#hipIRRVal');
const hipFlexL=$('#hipFlexL'), hipFlexR=$('#hipFlexR');

// Load/init
function load(){
  try{
    const d = JSON.parse(localStorage.getItem('mobilityData')||'{}');
    Object.keys(d).forEach(k=>{ const el=document.getElementById(k); if(el) el.value=d[k]; });
  }catch(e){}
  if(hipIRL&&hipIRLVal) hipIRLVal.textContent=hipIRL.value+'/10';
  if(hipIRR&&hipIRRVal) hipIRRVal.textContent=hipIRR.value+'/10';
  // Help
  const help = $('#testHelp');
  if(help && Array.isArray(window.TEST_GUIDE)){
    help.innerHTML='';
    window.TEST_GUIDE.forEach(g=>{
      const li=document.createElement('li');
      li.innerHTML = `<b>${g.title}</b><br><ul class="instructions"><li>${g.steps.join('</li><li>')}</li></ul><i>${(g.tips||[]).join(' · ')}</i>`;
      help.appendChild(li);
    });
  }
  const inter = $('#interpretation');
  if(inter && Array.isArray(window.INTERPRETATIONS)){
    inter.innerHTML = window.INTERPRETATIONS.map(x=>`<li>${x}</li>`).join('');
  }
}
load();

// Save/reset/pdf
$('#saveBtn').addEventListener('click',()=>{
  const data = {
    ankleL: ankleL?ankleL.value:'', ankleR: ankleR?ankleR.value:'',
    hipIRL: hipIRL?hipIRL.value:'', hipIRR: hipIRR?hipIRR.value:'',
    hipFlexL: hipFlexL?hipFlexL.value:'', hipFlexR: hipFlexR?hipFlexR.value:'',
    notes: $('#notes')?$('#notes').value:''
  };
  localStorage.setItem('mobilityData', JSON.stringify(data));
  alert('Données enregistrées.');
});
$('#resetBtn').addEventListener('click',()=>{
  if(confirm('Réinitialiser toutes les données ?')){
    localStorage.removeItem('mobilityData');
    localStorage.removeItem('mobilityHistory');
    localStorage.removeItem('mobilityFB');
    location.reload();
  }
});
$('#printPDF').addEventListener('click',()=>window.print());
if(hipIRL&&hipIRLVal) hipIRL.addEventListener('input',()=> hipIRLVal.textContent=hipIRL.value+'/10');
if(hipIRR&&hipIRRVal) hipIRR.addEventListener('input',()=> hipIRRVal.textContent=hipIRR.value+'/10');

// Scoring helpers
function gradeAnkle(cm){ if(!cm) return 0; cm=parseFloat(cm); return cm>=12?1: cm>=10?0.8: cm>=8?0.6: cm>=6?0.4: cm>=4?0.2:0 }
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function gradeIR(x){x=parseFloat(x||0); return clamp(x/10,0,1)}
function gradeFlex(x){const n=parseInt(x||0,10); return [0,.33,.66,1][n]||0}

// Analyze
function analyze(){
  const L=parseFloat(ankleL&&ankleL.value||0), R=parseFloat(ankleR&&ankleR.value||0);
  const asym = Math.abs((L||0)-(R||0));
  const kAsym=$('#kAsym'); if(kAsym) kAsym.textContent=isNaN(asym)?'–':asym.toFixed(1);
  const kHipL=$('#kHipL'), kHipR=$('#kHipR');
  if(kHipL) kHipL.textContent=(hipIRL&&hipIRL.value||'-')+'/10';
  if(kHipR) kHipR.textContent=(hipIRR&&hipIRR.value||'-')+'/10';

  const gAnk=(gradeAnkle(L)+gradeAnkle(R))/2;
  const gHip=(gradeIR(hipIRL&&hipIRL.value)+gradeIR(hipIRR&&hipIRR.value))/2;
  const gFlex=(gradeFlex(hipFlexL&&hipFlexL.value)+gradeFlex(hipFlexR&&hipFlexR.value))/2;

  const fbMem = JSON.parse(localStorage.getItem('mobilityFB')||'{}');
  const wAnk = (fbMem && fbMem.heels===false)?0.5:0.35;
  const wHip = 0.45; const wFlex = 1 - (wAnk+wHip);
  const global=(gAnk*wAnk)+(gHip*wHip)+(gFlex*wFlex);
  const globalBar=$('#globalBar'); if(globalBar) globalBar.style.width=(global*100).toFixed(0)+'%';

  const pri=[];
  if(L<10||R<10) pri.push('Mobilité cheville insuffisante → dorsiflexion < 10 cm ('+(L<R?'G':'D')+')');
  if(asym>=3) pri.push('Asymétrie cheville élevée (Δ≥3 cm)');
  if((hipIRL&&hipIRL.value||0)<=3) pri.push('Rotation interne hanche gauche très limitée');
  if((hipIRR&&hipIRR.value||0)<=3) pri.push('Rotation interne hanche droite très limitée');
  if((hipFlexL&&hipFlexL.value||2)<2 || (hipFlexR&&hipFlexR.value||2)<2) pri.push('Flexion de hanche limitée');

  const container=$('#priority');
  if(container){
    container.innerHTML='';
    if(!pri.length){ container.innerHTML='<div class="item">✅ Pas de point bloquant majeur. Entretien.</div>'; }
    else pri.forEach(t=>{const div=document.createElement('div');div.className='item';div.textContent=t;container.appendChild(div)});
  }

  const plan = buildPlan({L,R,irL:hipIRL&&hipIRL.value, irR:hipIRR&&hipIRR.value, flexL:hipFlexL&&hipFlexL.value, flexR:hipFlexR&&hipFlexR.value, asym, fb:fbMem});
  sessionStorage.setItem('todayPlan', JSON.stringify(plan));
  showView('results');
}
const analyzeBtn=$('#analyzeBtn'); if(analyzeBtn) analyzeBtn.addEventListener('click', analyze);

// Routine builder
function EXO_SVG(kind){
  const map = {
    ankle:'M50 10 v80 M20 70 h60 M35 70 q15-30 30 0',
    calf:'M30 20 v60 M70 20 v60 M20 80 h60',
    calfEcc:'M20 80 h60 M40 60 l10 20 l10 -20',
    "9090":'M20 70 h30 v-30 h-30 M70 40 h-20 v30 h20',
    lunge:'M20 70 h30 v-20 h20 v-15',
    cossack:'M20 70 h60 M30 70 l20 -20 l20 20',
    bridge:'M20 70 h60 M20 70 q30 -30 60 0',
    squat:'M20 70 h60 M30 70 v-25 h40 v25',
    frog:'M20 70 h60 M30 70 q20 -25 40 0',
    wall:'M70 20 v60 M30 70 h40',
    car:'M30 60 q20 -30 40 0'
  };
  const d = map[kind] || 'M10 10 h80 v80 h-80 z';
  return `<svg viewBox="0 0 100 100" width="100" height="90"><rect x="1" y="1" width="98" height="98" rx="10" fill="#0b142a" stroke="#2a3b66"/><path d="${d}" stroke="#7dd3fc" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
}

function addTask(container, exo, override){
  if(!container||!exo) return;
  override = override || {};
  const div=document.createElement('div');div.className='item';
  const dose = override.long || exo.dose;
  const cues = (exo.cues||[]).map(c=>`<li>${c}</li>`).join('');
  const errors = (exo.errors||[]).join(' · ');
  div.innerHTML=`<div class="ex">
    <div class="svgbox">${EXO_SVG(exo.svg)}</div>
    <div>
      <label class="row" style="justify-content:space-between;gap:12px">
        <span><b>${override.title||exo.name}</b><br><span class="instructions">${override.how||exo.how}</span></span>
        <span class="badge">${dose}</span>
        <input type="checkbox" data-check="${exo.id}">
      </label>
      <details><summary>Consignes</summary>
        <ul class="instructions">${cues}</ul>
        <p class="instructions"><b>Erreurs :</b> ${errors}</p>
      </details>
    </div>
  </div>`;
  container.appendChild(div);
}

function buildPlan(s){
  const plan=[];
  if(s.L<10 || s.R<10){
    const side = s.L<s.R? 'gauche':'droite';
    plan.push(Object.assign({}, EXOS.ankleRock, {name:`Rocking cheville ${side}`}));
    plan.push(Object.assign({}, EXOS.calfPNF, {name:`Étirement mollet/soléaire ${side}`}));
    plan.push(Object.assign({}, EXOS.eccCalf, {name:`Mollet excentrique ${side}`}));
    plan.push(Object.assign({}, EXOS.ankleWallCar, {name:`Dorsiflexion au mur ${side}`}));
  }
  if(Math.abs(s.L - s.R) >= 3){
    const weak = s.L<s.R? 'gauche':'droite';
    plan.push(Object.assign({}, EXOS.wallSquat, {name:`Wall squat drill (favorise cheville ${weak})`}));
  }
  if(parseFloat(s.irL)<=3){ plan.push(EXOS["9090LiftL"]); plan.push(EXOS.psoasL); }
  if(parseFloat(s.irR)<=3){ plan.push(EXOS["9090LiftR"]); plan.push(EXOS.psoasR); }
  if(s.fb && s.fb.heels===false){ plan.push(Object.assign({}, EXOS.deepHold, {name:'Deep squat assisté (prioritaire)', dose:'3×1min'})); }
  plan.push(EXOS.cossack); plan.push(EXOS.bridge); plan.push(EXOS.frog);
  if(!s.fb || s.fb.heels!==false){ plan.push(EXOS.deepHold); }

  const cont = $('#plan'); if(cont){ cont.innerHTML=''; plan.forEach(p=>addTask(cont,p)); }
  return plan;
}

// Timer & feedback
let t=30, itv=null;
function renderT(){ const m=Math.floor(t/60).toString().padStart(2,'0'); const s=(t%60).toString().padStart(2,'0'); const tv=$('#tVal'); if(tv) tv.textContent=`${m}:${s}` } renderT();
$('#tPlus').addEventListener('click',()=>{t+=10;renderT()});
$('#tMinus').addEventListener('click',()=>{t=Math.max(0,t-10);renderT()});
$('#tStart').addEventListener('click',()=>{ if(itv) return; itv=setInterval(()=>{ t=Math.max(0,t-1); renderT(); if(t===0){ clearInterval(itv); itv=null; try{ new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAAAAACAgICAgA==').play(); }catch(e){} } },1000)});
$('#tStop').addEventListener('click',()=>{ clearInterval(itv); itv=null });
const finishBtn=$('#finishBtn'); if(finishBtn) finishBtn.addEventListener('click',()=>{
  const done=Array.from(document.querySelectorAll('[data-check]')).filter(x=>x.checked).length;
  const total=Array.from(document.querySelectorAll('[data-check]')).length;
  const fb={ ease: $('#fbEase').checked, heels: $('#fbHeels').checked, sym: $('#fbSym').checked, date: new Date().toISOString() };
  const hist=JSON.parse(localStorage.getItem('mobilityHistory')||'[]');
  const d=JSON.parse(localStorage.getItem('mobilityData')||'{}');
  hist.push({done,total,fb,metrics:d});
  localStorage.setItem('mobilityHistory',JSON.stringify(hist));
  localStorage.setItem('mobilityFB',JSON.stringify(fb));
  if(fb.ease===false){ t=Math.max(20, t-10); } else { t=Math.min(120, t+10); }
  renderT();
  const log=$('#log'); if(log) log.textContent=`Session enregistrée (${done}/${total}). Confort ${fb.ease?'OK':'—'}, talons ${fb.heels?'OK':'—'}, sym ${fb.sym?'OK':'—'}.`;
});

// Library & Guide
function renderLib(){
  const lib=$('#lib'); if(!lib || !window.EXOS) return; lib.innerHTML='';
  Object.values(EXOS).forEach(e=>{
    const cues=(e.cues||[]).map(c=>`<li>${c}</li>`).join('');
    const errors=(e.errors||[]).join(' · ');
    const div=document.createElement('div'); div.className='item';
    div.innerHTML = `<div class="ex">
      <div class="svgbox">${EXO_SVG(e.svg)}</div>
      <div>
        <b>${e.name}</b> <span class="badge">${e.area}</span> <span class="badge">Dosage: ${e.dose}</span>
        <p class="instructions">${e.how}</p>
        <details><summary>Consignes & erreurs</summary>
          <ul class="instructions">${cues}</ul>
          <p class="instructions"><b>Erreurs :</b> ${errors}</p>
        </details>
      </div>
    </div>`;
    lib.appendChild(div);
  });
}
function renderGuide(){
  const host=$('#guideContent'); if(!host || !window.TEST_GUIDE) return; host.innerHTML='';
  TEST_GUIDE.forEach(g=>{
    const el=document.createElement('div'); el.className='item';
    el.innerHTML = `<b>${g.title}</b><ul class="instructions"><li>${g.steps.join('</li><li>')}</li></ul><i>${(g.tips||[]).join(' · ')}</i>`;
    host.appendChild(el);
  });
  const add=document.createElement('div'); add.className='item';
  add.innerHTML='<b>Rythme recommandé</b><p class="instructions">4–5 séances/semaine, 15–20 minutes. Rester en deçà de 3/10 douleur.</p>';
  host.appendChild(add);
}

// Progress + CSV
function renderProgress(){
  const charts=$('#charts'), tableBody=$('#historyTable tbody'); if(!charts||!tableBody) return;
  const hist=JSON.parse(localStorage.getItem('mobilityHistory')||'[]');
  charts.innerHTML=''; tableBody.innerHTML='';
  hist.slice().reverse().forEach(h=>{
    const tr=document.createElement('tr');
    const pct = h.total? Math.round(100*h.done/h.total) : 0;
    const date = new Date(h.fb && h.fb.date || new Date()).toLocaleString();
    tr.innerHTML = `<td>${date}</td><td>${h.done||0}</td><td>${h.total||0} (${pct}%)</td><td>${h.fb && h.fb.ease?'OK':'—'}</td><td>${h.fb && h.fb.heels?'OK':'—'}</td><td>${h.fb && h.fb.sym?'OK':'—'}</td>`;
    tableBody.appendChild(tr);
  });
  const points = hist.map(h=>h.metrics||{});
  const series = [
    {key:'ankleL', label:'Cheville G (cm)'},
    {key:'ankleR', label:'Cheville D (cm)'},
    {key:'hipIRL', label:'Hanche G RI (/10)'},
    {key:'hipIRR', label:'Hanche D RI (/10)'}
  ];
  series.forEach(s=>{
    const vals = points.map(p=>parseFloat(p[s.key]||0));
    const w=520,h=160,pad=20;
    const max = Math.max(1, ...vals);
    const step = (w - 2*pad) / Math.max(1, vals.length-1);
    let d='';
    vals.forEach((v,i)=>{ const x=pad+i*step; const y=h-pad-(v/max)*(h-2*pad); d += (i===0?`M${x},${y}`:` L${x},${y}`); });
    const svg = `<div class="chart" aria-label="${s.label}">
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%">
        <rect x="0" y="0" width="${w}" height="${h}" fill="none" />
        <path d="${d}" fill="none" stroke="#7dd3fc" stroke-width="2" />
        <text x="${pad}" y="${pad+10}" fill="#7dd3fc" font-size="12">${s.label}</text>
      </svg>
    </div>`;
    charts.insertAdjacentHTML('beforeend', svg);
  });
}

function buildCSV(){
  const hist=JSON.parse(localStorage.getItem('mobilityHistory')||'[]');
  const header = ['date','done','total','pct','ease','heels','sym','ankleL','ankleR','hipIRL','hipIRR','hipFlexL','hipFlexR','notes'];
  const rows = hist.map(h=>{
    const d = h.metrics||{};
    const pct = h.total? Math.round(100*h.done/h.total) : 0;
    return [
      h.fb && h.fb.date || '',
      h.done || 0,
      h.total || 0,
      pct,
      h.fb && h.fb.ease ? 1 : 0,
      h.fb && h.fb.heels ? 1 : 0,
      h.fb && h.fb.sym ? 1 : 0,
      d.ankleL||'',
      d.ankleR||'',
      d.hipIRL||'',
      d.hipIRR||'',
      d.hipFlexL||'',
      d.hipFlexR||'',
      (d.notes||'').toString().replace(/\n/g,' ')
    ].join(',');
  });
  return [header.join(','), ...rows].join('\n');
}
function downloadCSV(){
  const csv = buildCSV();
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'autodiag_history.csv'; a.click();
  URL.revokeObjectURL(url);
}
$('#exportCSV').addEventListener('click', downloadCSV);
$('#exportCSV2').addEventListener('click', downloadCSV);
