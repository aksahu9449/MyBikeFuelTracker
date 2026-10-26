const KEY='myBikeFuelTracker.entries.v1';
const $=id=>document.getElementById(id);
let entries=load();
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]').sort((a,b)=>a.odo-b.odo)}catch{return []}}
function persist(){entries.sort((a,b)=>a.odo-b.odo);localStorage.setItem(KEY,JSON.stringify(entries));render()}
function money(n){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(n)}
function nfmt(n,d=1){return Number(n).toLocaleString('en-IN',{maximumFractionDigits:d,minimumFractionDigits:0})}
function toast(s){const t=$('toast');t.textContent=s;t.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.style.display='none',2600)}
function fullEntries(){return entries.filter(e=>e.full).sort((a,b)=>a.odo-b.odo)}
function mileageFor(e){const fs=fullEntries();const i=fs.findIndex(x=>x.id===e.id);if(i<1)return null;const prev=fs[i-1];const dist=e.odo-prev.odo;return dist>0&&e.litres>0?dist/e.litres:null}
function distFor(e){const fs=fullEntries();const i=fs.findIndex(x=>x.id===e.id);return i<1?null:e.odo-fs[i-1].odo}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('date').value=new Date().toLocaleDateString('en-CA');
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id==='panel-'+b.dataset.tab));if(b.dataset.tab==='insights')drawChart()}));
$('fuelForm').addEventListener('submit',e=>{
 e.preventDefault();
 const date=$('date').value, odo=Number($('odo').value), litres=Number($('litres').value), price=Number($('price').value), full=$('fullTank').checked, note=$('note').value.trim();
 if(!date||!Number.isFinite(odo)||odo<0||!Number.isFinite(litres)||litres<=0||!Number.isFinite(price)||price<=0){toast('Please enter valid fuel details.');return}
 const latest=entries.reduce((m,x)=>Math.max(m,x.odo),-Infinity);
 if(odo<=latest){toast(`Odometer must be higher than the latest saved reading (${nfmt(latest)} km).`);return}
 entries.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),date,odo,litres,price,full,note,createdAt:Date.now()});
 persist();$('odo').value='';$('litres').value='';$('note').value='';$('date').value=new Date().toLocaleDateString('en-CA');toast('Fuel record saved on this device.');
});
function render(){
 const fs=fullEntries(), last=fs[fs.length-1], m=last?mileageFor(last):null;
 $('statMileage').textContent=m===null?'—':`${nfmt(m)} km/l`;
 $('statSpend').textContent=money(entries.reduce((s,e)=>s+e.litres*e.price,0));
 $('statRecords').textContent=`${entries.length} fuel record${entries.length===1?'':'s'}`;
 const span=entries.length>1?Math.max(...entries.map(e=>e.odo))-Math.min(...entries.map(e=>e.odo)):0;
 $('statDistance').textContent=`${nfmt(span,0)} km`;
 renderHistory();renderInsights();
}
function renderHistory(){
 const host=$('historyList');
 if(!entries.length){host.innerHTML='<div class="card empty">No fuel records yet.<br>Add your first refill to get started.</div>';return}
 host.innerHTML=[...entries].sort((a,b)=>b.odo-a.odo).map(e=>{
  const m=mileageFor(e), d=distFor(e);
  return `<article class="card record"><div class="recordtop"><div><strong>${escapeHtml(e.date)}</strong><div class="meta">Odometer: ${nfmt(e.odo)} km<br>Fuel: ${nfmt(e.litres,2)} L · ${money(e.litres*e.price)}<br>Price: ${money(e.price)}/L</div></div><div style="text-align:right">${e.full?'<span class="pill">FULL TANK</span>':'<span class="pill" style="background:#eef0f1;color:#58645d">PARTIAL</span>'}<div style="font-weight:800;color:var(--green);margin-top:8px">${m===null?'—':nfmt(m)+' km/l'}</div><div class="hint">${d===null?'Baseline':nfmt(d,0)+' km'}</div></div></div>${e.note?`<div class="meta">${escapeHtml(e.note)}</div>`:''}<div class="record-actions"><button class="danger" data-delete="${e.id}">Delete</button></div></article>`;
 }).join('');
 host.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>{if(confirm('Delete this fuel record?')){entries=entries.filter(e=>e.id!==b.dataset.delete);persist();toast('Record deleted.')}}));
}
function renderInsights(){
 const ms=fullEntries().map(e=>({e,m:mileageFor(e)})).filter(x=>x.m!==null);
 $('insightSummary').textContent=ms.length?`Average mileage: ${nfmt(ms.reduce((s,x)=>s+x.m,0)/ms.length)} km/l · Best: ${nfmt(Math.max(...ms.map(x=>x.m)))} km/l · ${ms.length} measured interval(s).`:'Add two full-tank records to see mileage statistics.';
 const spend=entries.reduce((s,e)=>s+e.litres*e.price,0), litres=entries.reduce((s,e)=>s+e.litres,0);
 $('spendingSummary').textContent=entries.length?`Total spent: ${money(spend)} · Fuel recorded: ${nfmt(litres,2)} L · Average recorded price: ${money(spend/litres)}/L.`:'No spending recorded yet.';
}
function drawChart(){
 const c=$('chart'),ctx=c.getContext('2d'),rect=c.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
 c.width=rect.width*dpr;c.height=rect.height*dpr;ctx.scale(dpr,dpr);
 const w=rect.width,h=rect.height;ctx.clearRect(0,0,w,h);
 const pts=fullEntries().map(e=>({date:e.date,m:mileageFor(e)})).filter(p=>p.m!==null);
 if(!pts.length){ctx.fillStyle='#6a7b73';ctx.font='13px system-ui';ctx.fillText('No mileage data yet',12,h/2);return}
 const pad={l:38,r:12,t:18,b:28}, min=Math.max(0,Math.floor(Math.min(...pts.map(p=>p.m))-3)),max=Math.ceil(Math.max(...pts.map(p=>p.m))+3)||10;
 ctx.font='10px system-ui';ctx.strokeStyle='#dce7e0';ctx.fillStyle='#6a7b73';ctx.lineWidth=1;
 for(let i=0;i<5;i++){const y=pad.t+(h-pad.t-pad.b)*i/4;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();ctx.fillText(String(Math.round(max-(max-min)*i/4)),2,y+3)}
 const xy=pts.map((p,i)=>({x:pts.length===1?(pad.l+w-pad.r)/2:pad.l+(w-pad.l-pad.r)*i/(pts.length-1),y:pad.t+(h-pad.t-pad.b)*(max-p.m)/(max-min),p}));
 ctx.strokeStyle='#087f5b';ctx.lineWidth=2.5;ctx.beginPath();xy.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
 xy.forEach(p=>{ctx.beginPath();ctx.fillStyle='#087f5b';ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill()});
 ctx.fillStyle='#6a7b73';ctx.fillText(pts[0].date,pad.l,h-8);if(pts.length>1){const last=pts[pts.length-1].date;const tw=ctx.measureText(last).width;ctx.fillText(last,w-pad.r-tw,h-8)}
}
function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('exportCsv').addEventListener('click',()=>{
 if(!entries.length){toast('No records to export.');return}
 const rows=[['Date','Odometer_km','Fuel_litres','Price_per_litre_INR','Cost_INR','Full_tank','Note','Distance_since_previous_full_km','Mileage_km_per_litre']];
 [...entries].sort((a,b)=>a.odo-b.odo).forEach(e=>rows.push([e.date,e.odo,e.litres,e.price,e.litres*e.price,e.full,e.note,distFor(e)??'',mileageFor(e)??'']));
 const csv=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n');download('my-bike-fuel-tracker.csv',csv,'text/csv;charset=utf-8');
});
$('exportJson').addEventListener('click',()=>download('my-bike-fuel-tracker-backup.json',JSON.stringify({version:1,exportedAt:new Date().toISOString(),entries},null,2),'application/json'));
$('importFile').addEventListener('change',async e=>{
 const f=e.target.files[0];if(!f)return;
 try{const obj=JSON.parse(await f.text()),arr=Array.isArray(obj)?obj:obj.entries;if(!Array.isArray(arr))throw Error('Invalid backup format');if(!confirm(`Import ${arr.length} records? This replaces current records.`))return;
  const cleaned=arr.map((x,i)=>({id:String(x.id||`import-${Date.now()}-${i}`),date:String(x.date||''),odo:Number(x.odo),litres:Number(x.litres),price:Number(x.price),full:Boolean(x.full),note:String(x.note||'')})).filter(x=>x.date&&Number.isFinite(x.odo)&&x.odo>=0&&x.litres>0&&x.price>0);
  if(cleaned.length!==arr.length)throw Error('Some records are invalid');const seen=new Set();for(const x of cleaned){if(seen.has(x.odo))throw Error('Duplicate odometer readings found');seen.add(x.odo)}
  entries=cleaned;persist();toast('Backup restored.');e.target.value='';
 }catch(err){alert('Could not restore backup: '+err.message)}
});
$('clearData').addEventListener('click',()=>{if(confirm('Permanently delete all fuel records from this browser? Export a backup first if needed.')){entries=[];persist();toast('All records deleted.')}});
window.addEventListener('resize',()=>{if($('panel-insights').classList.contains('active'))drawChart()});
if('serviceWorker' in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
