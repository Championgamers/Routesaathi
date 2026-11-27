/* ---------- UI STATE & HELPERS ---------- */
const M={train:{ic:svgi('train'),c:'#f5b700'},flight:{ic:svgi('flight'),c:'#64d2ff'},bus:{ic:svgi('bus'),c:'#ff9a5a'},car:{ic:svgi('car'),c:'#e68be8'}};
const mName=m=>tr('mNames')[m]||m;
const S={a:null,b:null,all:[],road:null,kind:'all',sort:'Best',rows:[],maxCost:Infinity,maxTime:Infinity,mapMode:'single',previewId:null,cultureNote:''};
const dur=m=>`${Math.floor(m/60)}h ${String(m%60).padStart(2,'0')}m`;
const rs=n=>'₹'+n.toLocaleString('en-IN');
const clock=m=>`${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}${m>=1440?` (+${Math.floor(m/1440)}d)`:''}`;
const riskInfo=lvl=>[tr('connLbl')[lvl],['var(--teal)','var(--amber)','var(--red)'][lvl],tr('connNote')[lvl]];
const SORT={Best:score,Cheapest:t=>t.cost,Fastest:t=>t.time,Safest:t=>t.miss.reduce((s,p)=>s+p,0)*100+t.legs.length*10+t.time/10000};
const order=list=>list.slice().sort((x,y)=>y.open-x.open||SORT[S.sort](x)-SORT[S.sort](y));
const title=t=>t.legs.length===1?(LANG==='hi'?`सीधी ${mName(t.kind)}`:`Direct ${mName(t.kind).toLowerCase()}`):`${t.modes.map(mName).join(' + ')} ${LANG==='hi'?'वाया':'via'} ${t.legs.slice(1).map(l=>l.a.n).join(', ')}`;
const link=(n,u)=>`<a href="${u}" target="_blank" rel="noopener">${n} ↗</a>`;

/* ---------- RECENT SEARCHES ---------- */
function getRecent(){try{return JSON.parse(localStorage.getItem('rs_recent')||'[]')}catch(e){return[]}}
function saveRecent(a,b){
 try{
  const list=getRecent().filter(x=>!(x[0]===a&&x[1]===b));
  list.unshift([a,b]);
  localStorage.setItem('rs_recent',JSON.stringify(list.slice(0,5)));
 }catch(e){}
 renderRecent();
}
function renderRecent(){
 const el=$('#recentBar'),list=getRecent();
 if(!list.length){el.hidden=true;return}
 el.hidden=false;
 el.innerHTML=`<span>${tr('recent')}</span>${list.map(([a,b])=>`<button type="button" data-pair="${a},${b}">${a} → ${b}</button>`).join('')}<button type="button" class="clr" id="clrRecent">${tr('clear')}</button>`;
}

/* ---------- SHAREABLE ITINERARY TEXT ---------- */
function itineraryText(t){
 let at=t.legs[0].dep;
 const lines=[`RouteSaathi Trip Plan: ${S.a.n} → ${S.b.n}`,`Date: ${day} | Passengers: ${PAX} | Train Class: ${CLASS_NAME[TCLASS]}`,`Route: ${title(t)}`,`Total: ${rs(t.cost)}${PAX>1?` (${rs(Math.round(t.cost/PAX))}/person)`:''} | Time: ${dur(t.time)} | On-time confidence: ${100-tripRisk(t)}%`,''];
 t.legs.forEach((l,j)=>{
  const s=at,e=s+l.mins;at=e+(t.waits[j]||0);
  lines.push(`${j+1}. ${mName(l.m)}: ${l.a.n} → ${l.b.n} (${clock(s)}–${clock(e)}, ${dur(l.mins)}, ${rs(l.fare)})`);
  if(j<t.waits.length)lines.push(`   ↳ Change at ${t.legs[j+1].a.n}: ${dur(t.waits[j])} buffer (${t.miss[j]}% miss chance)`);
 });
 return lines.join('\n');
}

/* ---------- RENDERING: RESULTS, TILES, TABLE, FILTER, MAP ---------- */
const drm=t=>{const p=tripRisk(t),r=rl(p);return `<div class="drm"><span>${LANG==='hi'?'देरी जोखिम':'Delay risk'}</span><div class="meter" style="--c:${r[1]}"><i style="--w:${Math.max(p,3)}%"></i></div><b style="color:${r[1]}">${r[0]} · ${p}%</b></div>`};

function srcBadge(legs){
 if(legs.some(l=>l.src==='live'))return `<span class="src-badge live">⚡ Live IRCTC</span>`;
 if(legs.some(l=>l.src==='verified'))return `<span class="src-badge">✓ Verified schedule</span>`;
 if(legs.some(l=>l.path))return `<span class="src-badge">✓ OSRM live road</span>`;
 return '';
}
function option(t,i,tags){
 const r=riskInfo(t.risk);
 const per=PAX>1?`<span class="per-pax">${rs(Math.round(t.cost/PAX))} / ${LANG==='hi'?'व्यक्ति':'person'}</span>`:'';
 const svcPreview=t.legs.length===1?`<div class="sub" style="grid-column:1/-1;margin:-4px 0 2px;font-size:.86rem">${t.legs[0].svc} · ${clock(t.legs[0].dep)} → ${clock(t.legs[0].dep+t.legs[0].mins)} (${dur(t.legs[0].mins)} ${t.legs[0].m==='flight'?'flight':'journey'})${srcBadge(t.legs)}</div>`:`<div class="sub" style="grid-column:1/-1;margin:-4px 0 2px;font-size:.86rem">${t.legs.map(l=>l.svc.split(' (')[0]).join(' + ')}${srcBadge(t.legs)}</div>`;
 return `<details data-i="${i}" data-id="${t.id}" class="card opt hov ${i===0&&t.open?'pick':''} ${S.previewId===t.id&&S.mapMode==='single'?'active-map':''}" style="animation-delay:${Math.min(i,8)*.06}s"><summary>
 <h3>${i===0&&t.open?'✦ ':''}${title(t)}</h3><span class="num">${dur(t.time)}</span><span class="num grad">${rs(t.cost)}${per}</span>
 ${svcPreview}
 <div class="path">${t.legs[0].a.n}${cityCodeTag(t.legs[0].a,t.legs[0].m)}${t.legs.map(l=>`<span class="line"><span>${M[l.m].ic}</span></span>${l.b.n}${cityCodeTag(l.b,l.m)}`).join('')}</div>
 <div class="tags">${t.open?'':`<span data-t="sold">${LANG==='hi'?'सीटें फुल':'Sold out'}</span>`}${(tags[t.id]||[]).map(x=>`<span data-t="${x[1]}">${x[0]}</span>`).join('')}${t.open&&t.legs.length>1?`<span data-t="risk${t.risk}">${r[0]}</span>`:''}<span class="more">${LANG==='hi'?'पूरी योजना व बुकिंग ▸':'Full plan & book ▸'}</span></div>${drm(t)}</summary></details>`;
}

function tiles(){
 const best=['train','flight','bus','car'].map(m=>{const uses=S.all.filter(t=>t.kind===m);return{m,uses,ok:uses.filter(t=>t.open).sort((a,b)=>score(a)-score(b))[0],direct:uses.find(t=>t.legs.length===1)}});
 const maxC=Math.max(1,...best.map(x=>x.ok?x.ok.cost:0)),maxT=Math.max(1,...best.map(x=>x.ok?x.ok.time:0));
 return best.map(({m,uses,ok,direct},i)=>{
  const status=!ok?(direct?(LANG==='hi'?'सीटें फुल':'Sold out'):(LANG==='hi'?'उपलब्ध नहीं':'Not available here')):ok.legs.length>1?`${direct?(LANG==='hi'?'सीधी ट्रेन फुल · ':'Direct sold out. '):''}${ok.legs.length-1} ${LANG==='hi'?'बदलाव':'change'}, ${riskInfo(ok.risk)[0].split(' ')[0].toLowerCase()}`:(LANG==='hi'?'सीधा रूट':'Direct');
  return `<button class="card tile" data-kind="${m}" style="--c:${M[m].c};animation-delay:${i*.08}s" aria-pressed="${S.kind===m}" ${uses.length?'':'disabled'}><span class="ic">${M[m].ic}</span><b>${mName(m)}</b>
  ${ok?`<span class="num" data-n="${ok.cost}">${rs(ok.cost)}</span>${PAX>1?`<small>${rs(Math.round(ok.cost/PAX))}/${LANG==='hi'?'व्यक्ति':'person'}</small>`:''}<div class="meter"><i style="--w:${ok.cost/maxC*100}%"></i></div><b>${dur(ok.time)}</b><div class="meter"><i style="--w:${ok.time/maxT*100}%"></i></div>`:'<span class="num">—</span>'}<small>${status}</small></button>`}).join('');
}

function updateMap(skipZoom=false){
 const cv=$('#routeMap');if(!cv)return;
 const cap=$('#mapCap'),legEl=$('#mapLegend');
 if(S.mapMode==='all'){
  const best4=['train','flight','bus','car'].map(m=>S.all.filter(t=>t.kind===m&&t.open).sort((a,b)=>score(a)-score(b))[0]).filter(Boolean);
  if(best4.length){
   drawMap(cv,best4,{skipZoom,allEqual:true});
   if(cap)cap.textContent=`${best4.length} ${LANG==='hi'?'मोड की तुलना':'modes compared'}`;
   if(legEl){legEl.hidden=false;legEl.innerHTML=best4.map(t=>`<span><i style="background:${COL[t.kind]}"></i>${mName(t.kind)} (${dur(t.time)})</span>`).join('')}
  }
 }else{
  const target=S.rows.find(t=>t.id===S.previewId)||S.rows.find(t=>t.open)||S.rows[0];
  if(target){
   S.previewId=target.id;
   drawMap(cv,[target],{skipZoom});
   if(cap)cap.textContent=title(target);
   if(legEl)legEl.hidden=true;
  }
 }
 document.querySelectorAll('.map-tabs button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.map===S.mapMode));
 document.querySelectorAll('#list .opt').forEach(el=>el.classList.toggle('active-map',S.mapMode==='single'&&el.dataset.id===S.previewId));
}

function list(skipMapZoom=false){
 const open=S.all.filter(t=>t.open),tags={};
 const mark=(n,k,f)=>{const w=open.slice().sort((x,y)=>f(x)-f(y))[0];if(w)(tags[w.id]=tags[w.id]||[]).push([n,k])};
 mark(LANG==='hi'?'सर्वश्रेष्ठ':'Best overall','best',score);
 mark(LANG==='hi'?'सबसे सस्ता':'Cheapest','cheap',t=>t.cost);
 mark(LANG==='hi'?'सबसे तेज़':'Fastest','fast',t=>t.time);
 mark(LANG==='hi'?'सबसे लंबा':'Longest','long',t=>-t.time);
 mark(LANG==='hi'?'सबसे महंगा':'Most expensive','exp',t=>-t.cost);
 const byKind=order(S.all.filter(t=>S.kind==='all'||t.kind===S.kind));
 const rows=byKind.filter(t=>t.cost<=S.maxCost&&t.time<=S.maxTime);
 S.rows=rows;
 const cnt=$('#fCount');
 if(cnt)cnt.textContent=LANG==='hi'?`${byKind.length} में से ${rows.length} रूट`:`Showing ${rows.length} of ${byKind.length} routes`;
 $('#list').innerHTML=rows.map((t,i)=>option(t,i,tags)).join('')||`<div class="card" style="padding:20px"><p style="margin:0">${LANG==='hi'?'इन फ़िल्टर से कोई रूट नहीं मिला। बजट या समय बढ़ाएँ या "सभी" चुनें।':'No routes match these filters. Increase budget/duration or reset filters.'}</p></div>`;
 if(!rows.some(t=>t.id===S.previewId))S.previewId=rows.find(t=>t.open)?.id||rows[0]?.id||null;
 updateMap(skipMapZoom);
}

function compare(){
 const R=['train','flight','bus','car'].map(m=>({m,t:S.all.filter(t=>t.kind===m&&t.open).sort((a,b)=>score(a)-score(b))[0]})),has=R.filter(x=>x.t);
 if(!has.length)return'';
 const low=f=>Math.min(...has.map(x=>f(x.t))),nm=(f,b)=>mName(has.find(x=>f(x.t)===b).m),km1=km(S.a,S.b)*1.3,ppk=t=>Math.round((t.cost/PAX)/km1*10)/10;
 const row=(lab,f,fmt)=>{const b=low(f);return `<tr><th>${lab}</th>${R.map(x=>x.t?`<td class="${f(x.t)===b?'win':''}">${fmt(x.t)}${f(x.t)===b?` <em>${LANG==='hi'?'श्रेष्ठ':'Best'}</em>`:''}</td>`:'<td>—</td>').join('')}</tr>`};
 return `<p class="sec-sub">${LANG==='hi'?'सबसे सस्ता':'Cheapest'}: <b>${nm(t=>t.cost,low(t=>t.cost))}</b> · ${LANG==='hi'?'सबसे तेज़':'Fastest'}: <b>${nm(t=>t.time,low(t=>t.time))}</b> · ${LANG==='hi'?'सबसे कम जोखिम':'Lowest delay risk'}: <b>${nm(tripRisk,low(tripRisk))}</b></p><div class="tbl rv"><table><thead><tr><th></th>${R.map(x=>`<th><span>${M[x.m].ic}</span>${mName(x.m)}</th>`).join('')}</tr></thead><tbody>
 ${row(LANG==='hi'?`कुल किराया (${PAX} यात्री)`:`Total price (${PAX} pax, door-to-door)`,t=>t.cost,t=>rs(t.cost))}${row(LANG==='hi'?'प्रति किमी / व्यक्ति':'Price per km / person',ppk,t=>'₹'+ppk(t))}${row(LANG==='hi'?'कुल समय':'Total time',t=>t.time,t=>dur(t.time))}${row(LANG==='hi'?'बदलाव':'Changes',t=>t.legs.length-1,t=>t.legs.length-1||(LANG==='hi'?'सीधा':'Direct'))}
 ${row(LANG==='hi'?'देरी जोखिम':'Delay risk',tripRisk,t=>{const p=tripRisk(t),r=rl(p);return `<span style="color:${r[1]}">${r[0]} · ${p}%</span><div class="meter" style="--c:${r[1]}"><i style="--w:${Math.max(p,3)}%"></i></div>`})}
 </tbody></table></div>`;
}

/* ---------- UPGRADED FULL PLAN MODAL (WITH LIVE DELAY DRAG SIMULATOR + SHARE/COPY) ---------- */
function plan(t){
 let at=t.legs[0].dep;const p=tripRisk(t),r=rl(p),g=(v,c)=>`<div class="gauge" style="--p:${v};--c:${c}"><i>${v}%</i></div>`;
 const rows=t.legs.map((l,j)=>{const s=at,e=s+l.mins;at=e+(t.waits[j]||0);let cx='';
  if(j<t.waits.length){
   const w=t.waits[j],y=t.legs[j+1],need=needed(l.m,y.m),pm=t.miss[j],rr=riskInfo(level(pm)),slack=w-need;
   const firstNm=mName(l.m).toLowerCase(),nextNm=mName(y.m).toLowerCase();
   cx=`<div class="cx" style="--c:${rr[1]}">${g(100-pm,rr[1])}<div><b>${rr[0]} · ${y.a.n}</b>
   <div class="sub">${dur(w)} buffer, ~${need} min needed. ${100-pm}% chance you catch the next ${nextNm}.</div>
   <div class="sc">${[15,30,60,120].map(d=>{const ok=d<=slack;return `<div class="${ok?'ok':'no'}"><b>+${d}m</b>${ok?(LANG==='hi'?'मिलेगा ✓':'Catch ✓'):(LANG==='hi'?'छूटेगा ✗':'Miss ✗')}</div>`}).join('')}</div>
   <label class="sim">${LANG==='hi'?`लाइव सिम्युलेटर: यदि ${firstNm} लेट हो? स्लाइडर खींचें`:`Live delay simulator: what if your ${firstNm} is late?`}
    <input type="range" min="0" max="300" step="5" value="0" data-slack="${slack}" data-next="${nextNm}" aria-label="Delay in minutes">
    <output style="color:${slack>=0?'var(--teal)':'var(--red)'}">${slack>=0?(LANG==='hi'?`समय पर: आप अगली ${nextNm} पकड़ लेंगे (${slack} मि. अतिरिक्त)।`:`On time: you catch the next ${nextNm} (${slack} min spare).`):(LANG==='hi'?'समय पर भी बदलाव के लिए पर्याप्त समय नहीं।':'Even on time, this buffer is too tight to change.')}</output>
   </label></div></div>`;
  }
  const tagSrc=l.src==='live'?'<span class="src-badge live">⚡ Live IRCTC</span>':l.src==='verified'?'<span class="src-badge">✓ Verified timetable</span>':l.path?'<span class="src-badge">✓ OSRM live road</span>':'<span class="src-badge est">~ Estimated</span>';
  const extraNote=l.m==='flight'?' · +60m airport check-in in door-to-door total':l.m==='train'?' · +30m station buffer in door-to-door total':'';
  return `<div class="leg"><i>${M[l.m].ic}</i><div style="flex:1;min-width:0"><b>${l.a.n}${cityCodeTag(l.a,l.m)} → ${l.b.n}${cityCodeTag(l.b,l.m)}</b>${tagSrc}<div class="sub">${l.svc} · ${clock(s)} → ${clock(e)} · ${dur(l.mins)} · ${rs(l.fare)}${l.m==='car'?'':l.seats>=PAX?` · ${l.seats} seats`:' · <b style="color:var(--red)">WL / Full</b>'}</div><div class="sub">${lateMore(l,30)}% chance of &gt;30m delay${extraNote}</div><div class="leg-acts">${legLinks(l)}</div></div></div>${cx}`}).join('');

 const txt=itineraryText(t),waUrl=`https://wa.me/?text=${encodeURIComponent(txt)}`;
 $('#modal').innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="Journey plan"><button id="mx" aria-label="Close">✕</button>
 <h2 style="margin:0 0 4px;font-size:1.6rem">${title(t)}</h2>
 <p class="sub">${S.a.n} → ${S.b.n} · ${dur(t.time)} · ${rs(t.cost)}${PAX>1?` (${rs(Math.round(t.cost/PAX))}/person)`:''} · ${PAX} pax · ${CLASS_NAME[TCLASS]}</p>
 <div class="cx" style="--c:${r[1]}">${g(100-p,r[1])}<div><b>${100-p}% on-time confidence · ${r[0]} delay risk</b><div class="sub">${activeSeason(S.a,S.b).icon} ${activeSeason(S.a,S.b).label}. ${t.legs.length>1?'Chance that every connection works out.':'Chance this ride runs less than 30 min late.'}</div></div></div>
 ${t.open?'':'<p class="alert">Not enough seats available in the demo data.</p>'}
 ${rows}
 <p class="sub"><b>Plan B:</b> ${t.legs.length>1?`if a connection is missed, look for the next ${mName(t.legs[1].m).toLowerCase()} or a bus from ${t.legs[1].a.n} to ${S.b.n}, keeping about ${rs(t.legs[1].fare)} spare.`:'if this service is full or delayed, switch to another mode from the comparison grid.'} Total includes ${t.local?rs(t.local)+' for local transfers at both ends':'estimated fuel, toll and cab charges'}.</p>
 <div class="acts">
  <button type="button" id="copyTrip">${tr('copyBtn')}</button>
  <a class="wa-btn" href="${waUrl}" target="_blank" rel="noopener">${tr('waBtn')} ↗</a>
  ${link('🗺 Maps Transit',`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(S.a.n)}&destination=${encodeURIComponent(S.b.n)}&travelmode=transit`)}
  ${link('🚗 Maps Driving',`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(S.a.n)}&destination=${encodeURIComponent(S.b.n)}&travelmode=driving`)}
 </div></div>`;

 $('#copyTrip').onclick=()=>{
  const btn=$('#copyTrip');
  const done=()=>{btn.textContent=tr('copied');setTimeout(()=>btn.textContent=tr('copyBtn'),2200)};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done).catch(done);
  else{const ta=document.createElement('textarea');ta.value=txt;document.body.append(ta);ta.select();try{document.execCommand('copy')}catch(e){}ta.remove();done()}
 };
 $('#modal').hidden=false;document.body.style.overflow='hidden';$('#mx').focus();
}
const closeM=()=>{$('#modal').hidden=true;document.body.style.overflow=''};

function results(skipMapZoom=false){
 const direct=S.all.find(t=>t.legs.length===1&&t.kind==='train'),open=S.all.filter(t=>t.open),best=order(open)[0]||S.all[0];
 const maxC=Math.max(1000,...S.all.map(t=>t.cost)),minC=Math.min(...S.all.map(t=>t.cost));
 const maxH=Math.max(2,Math.ceil(Math.max(...S.all.map(t=>t.time))/60));
 const minH=Math.max(1,Math.floor(Math.min(...S.all.map(t=>t.time))/60));
 S.maxCost=maxC;S.maxTime=maxH*60;
 const se=activeSeason(S.a,S.b);

 $('#results').innerHTML=`<div class="top rise" id="head"><div class="card">
  <h2>${S.a.n} <span class="grad">→</span> ${S.b.n}</h2>
  <p class="sub" style="margin:0">${new Date(day).toLocaleDateString(LANG==='hi'?'hi-IN':'en-IN',{weekday:'long',day:'numeric',month:'long'})} · ~${Math.round(S.road?S.road.km:km(S.a,S.b)*1.3)} km${S.road?' (OSRM)':' (est.)'} · ${PAX} ${LANG==='hi'?'यात्री':(PAX>1?'passengers':'passenger')} · ${CLASS_NAME[TCLASS]}</p>
  <div class="meta-pills">
   <button type="button" class="season-pill" id="cycleSeason" title="Click to test Clear / Winter Fog / Monsoon delay risk">${se.icon} ${se.label} ↻</button>
   ${S.cultureNote?`<span class="culture-pill">🪔 ${S.cultureNote}</span>`:''}
  </div>
  <p style="margin:4px 0"><b>✦ ${LANG==='hi'?'हमारी पसंद':'Our pick'}:</b> ${title(best)}, ${rs(best.cost)}${PAX>1?` (${rs(Math.round(best.cost/PAX))}/${LANG==='hi'?'व्यक्ति':'person'})`:''} in ${dur(best.time)}. Best balance of time, cost and delay risk across ${open.length} available plans.</p>
  ${direct&&!direct.open?`<div class="alert">${LANG==='hi'?'सीधी ट्रेन में सीटें उपलब्ध नहीं हैं। नीचे दिए स्मार्ट विकल्प आपको पहुँचा देंगे।':'The direct train is sold out. The smart alternatives below still get you there.'}</div>`:''}
  <div class="top-actions">
   <button type="button" id="rePick">${tr('changeMode')}</button>
   <button type="button" id="jumpDelay">⏱ ${tr('navDelay')}</button>
  </div>
 </div>
 <div class="mapbox">
  <div class="map-bar">
   <div class="map-tabs">
    <button type="button" data-map="single" aria-pressed="${S.mapMode==='single'}">${tr('mapPrev')}</button>
    <button type="button" data-map="all" aria-pressed="${S.mapMode==='all'}">${tr('mapAll')}</button>
   </div>
   <span class="map-cap" id="mapCap"></span>
  </div>
  <canvas id="routeMap" role="img" aria-label="India map showing selected route"></canvas>
  <div class="map-legend" id="mapLegend" hidden></div>
 </div></div>
 <h2>${tr('compareH')}</h2><div class="tiles">${tiles()}</div>
 <h2>${tr('sideH')}</h2>${compare()}
 <h2>${tr('routesH')}</h2>
 <div class="sort"><button data-kind="all">${tr('all')}</button><button data-kind="mix">${tr('mixed')}</button><span style="width:8px"></span>${Object.keys(SORT).map(k=>`<button data-sort="${k}">${tr('sortLbl')[k]}</button>`).join('')}</div>
 <div class="card filter-bar">
  <div class="f-ctrl"><label><span>${tr('maxBudget')}</span><b id="fCostVal">${rs(maxC)}</b></label><input type="range" id="fCost" min="${minC}" max="${maxC}" step="50" value="${maxC}"></div>
  <div class="f-ctrl"><label><span>${tr('maxTime')}</span><b id="fTimeVal">${maxH}h</b></label><input type="range" id="fTime" min="${minH}" max="${maxH}" step="1" value="${maxH}"></div>
  <div class="f-meta"><span id="fCount"></span><button type="button" id="fReset">${tr('resetF')}</button></div>
 </div>
 <div id="list"></div>`;

 mark();list(skipMapZoom);countUp();$('#homeExtra').classList.remove('force-show');
 window.dispatchEvent(new CustomEvent('rs:context-change'));
}

function countUp(){
 if(calm)return;document.querySelectorAll('[data-n]').forEach(e=>{const n=+e.dataset.n,s=performance.now();
  const step=now=>{const p=Math.max(0,Math.min(1,(now-s)/850));e.textContent=rs(Math.round(n*p));if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)});
}

/* ---------- LOADING FLY-THROUGH & TRANSPORT PICKER ---------- */
let timers=[],finish=null;
function loading(done){
 const MODE_TXT={train:['Checking train availability','Finding the best rail corridor','Applying seasonal delay model','Plotting your train route'],flight:['Checking flight corridors','Finding connecting airports','Estimating transfer buffers','Plotting your flight path'],bus:['Checking highway services','Measuring bus corridors','Estimating seasonal road time','Plotting your bus route'],car:['Measuring real road distance','Optimizing highway route','Calculating cab & toll estimate','Plotting your road trip'],mix:['Checking trains, flights & buses','Building smart hub connections','Scoring every transfer for delay risk','Plotting your multi-modal route']};
 const el=$('#loader'),total=calm?500:3200;el.hidden=false;document.body.style.overflow='hidden';
 $('#ldTitle').textContent=`${S.a.n} → ${S.b.n}`;
 const seen=new Set(),sample=order(S.all.filter(t=>t.open&&(S.kind==='all'||t.kind===S.kind))).filter(t=>!seen.has(t.kind+t.legs.length)&&seen.add(t.kind+t.legs.length)).slice(0,5);
 drawMap($('#ldMap'),sample);
 (MODE_TXT[S.kind]||MODE_TXT.mix).forEach((s,i)=>timers.push(setTimeout(()=>$('#ldStep').textContent=s,i*total/4)));
 $('#ldBar').animate([{width:'0%'},{width:'100%'}],{duration:total,fill:'forwards',easing:'ease-in-out'});
 finish=()=>{timers.forEach(clearTimeout);timers=[];finish=null;el.hidden=true;document.body.style.overflow='';cancelAnimationFrame($('#ldMap').raf);done()};
 timers.push(setTimeout(finish,total));$('#skip').focus();
}
$('#skip').onclick=()=>finish&&finish();

function chooseMode(go){
 const has=m=>S.all.some(t=>t.open&&t.kind===m),el=$('#pick');
 const opts=[['train',mName('train'),`Rail · ${CLASS_NAME[TCLASS]}`],['flight',mName('flight'),'Fastest over distance'],['bus',mName('bus'),'Highway & overnight'],['car',mName('car'),`Private cab (${Math.ceil(PAX/4)} car${Math.ceil(PAX/4)>1?'s':''})`],['mix',mName('mix'),'Best multi-modal combination']];
 el.innerHTML=`<div class="pk" role="dialog" aria-modal="true" aria-labelledby="pkT"><button type="button" class="pkx" aria-label="Close">✕</button><span class="step-pill">${tr('pickStep')}</span><h2 id="pkT">${tr('pickH')}</h2><p class="sub">${S.a.n} → ${S.b.n} · ${PAX} ${PAX>1?'passengers':'passenger'} · ${CLASS_NAME[TCLASS]}</p><div class="pkg">${opts.map(([k,n,d],i)=>`<button type="button" class="pko" data-m="${k}" style="animation-delay:${i*65}ms" ${has(k)?'':'disabled'}><span class="pki">${k==='mix'?['train','flight','bus'].map(svgi).join(''):svgi(k)}</span><b>${n}</b><small>${has(k)?d:'Not available here'}</small></button>`).join('')}</div></div>`;
 el.hidden=false;document.body.style.overflow='hidden';
 const close=()=>{el.hidden=true;document.body.style.overflow=''};
 el.onclick=e=>{const b=e.target.closest('button');if(b&&b.dataset.m){close();go(b.dataset.m)}else if(b&&b.classList.contains('pkx')||e.target===el)close()};
 const f=el.querySelector('.pko:not([disabled])');f&&f.focus();
}

/* ---------- SEARCH EXECUTION & RECOMPUTE ---------- */
function recomputeActive(skipZoom=true){
 if(!S.a||!S.b)return;
 S.all=journeys(S.a,S.b,S.road);
 results(skipZoom);
}

let busy=false;
async function run(){
 if(busy)return;busy=true;const btn=$('.go'),label=tr('find');
 const fv=$('#from').value,tv=$('#to').value;btn.textContent=tr('locating');$('#err').textContent='';
 try{
  const [a,b]=await Promise.all([resolvePlace(fv),resolvePlace(tv)]);
  let err='';
  if(!fv.trim()||!tv.trim())err='Enter both a starting place and a destination.';
  else if(!a||!b)err=`Could not find "${!a?fv:tv}". Check the spelling and your internet connection.`;
  else if(a===b||km(a,b)<2)err='Choose two different places.';
  let all=[],road=null;day=$('#date').value||$('#date').min;
  if(!err){
   S.a=a;S.b=b;
   const [rd]=await Promise.all([a.island||b.island?null:roadRoute(a,b),fetchLiveIRCTC(a,b)]);
   road=rd;
   all=journeys(a,b,road);
   if(!all.some(t=>t.open))err='No workable journey was found between these two places.';
  }
  $('#err').textContent=err;
  if(err){$('#results').innerHTML='';highlightCulturalDoodles(null,null);return}
  const cNote=highlightCulturalDoodles(a,b);
  saveRecent(a.n,b.n);
  Object.assign(S,{a,b,all,road,kind:'all',sort:'Best',mapMode:'single',previewId:null,cultureNote:cNote});
  document.activeElement.blur();
  chooseMode(k=>{S.kind=k;loading(()=>{results(false);$('#head').scrollIntoView({behavior:'smooth'})})});
 }finally{busy=false;btn.textContent=label}
}

/* ---------- STANDALONE CONNECTION CHECKER (NOW FULLY VISIBLE!) ---------- */
function check(){
 const mins=v=>{const [h,m]=v.split(':').map(Number);return h*60+m};
 if(!$('#cArr').value||!$('#cDep').value){$('#cOut').innerHTML='<p class="sub">Enter both times.</p>';return}
 const wait=(mins($('#cDep').value)-mins($('#cArr').value)+1440)%1440,a=$('#cA').value,b=$('#cB').value;
 const p=missChance({m:a,mins:480},{m:b},wait),r=riskInfo(level(p)),need=needed(a,b);
 $('#cOut').innerHTML=`<div class="verdict"><span class="num">${p}%</span><b>${LANG==='hi'?'कनेक्शन छूटने का जोखिम':'chance of missing it'} · ${r[0]}</b><p>${LANG==='hi'?`आपके पास ${dur(wait)} हैं और बदलने में लगभग ${need} मि. लगेंगे। ${wait<need?'समय पर पहुँचने पर भी यह पर्याप्त नहीं है।':'आपकी पहली सवारी '+String(wait-need)+' मि. तक लेट हो सकती है। '+r[2]}`:`You have ${dur(wait)} and need about ${need} min to transfer. ${wait<need?'This is not enough even if you arrive on time. Choose a later service.':`Your ${mName(a).toLowerCase()} can be up to ${wait-need} min late. ${r[2]}`}`}</p></div>`;
}
['cArr','cDep','cA','cB'].forEach(id=>$('#'+id).addEventListener('input',check));

/* ---------- TYPE-AHEAD AUTOCOMPLETE ---------- */
for(const id of['from','to']){
 const input=$('#'+id),box=document.createElement('div');box.className='sug';box.hidden=true;input.after(box);let on=0,hits=[];
 const paint=()=>{box.innerHTML=hits.map((c,i)=>`<button type="button" tabindex="-1" class="${i===on?'on':''}" style="animation-delay:${i*40}ms"><span class="pin">${svgi(c.air?'flight':c.rail?'train':'bus')}</span><b>${c.n}</b><small>${c.ext?'Village / town':[c.air?'Airport':'',c.rail?'Rail':'No rail',c.hub?'Hub':''].filter(Boolean).join(' · ')}</small></button>`).join('');box.hidden=!hits.length};
 const choose=c=>{input.value=c.n;hits=[];paint()};
 input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase(),al=Object.keys(ALIAS).filter(k=>q&&k.startsWith(q)).map(k=>BY[ALIAS[k]]);
  clearTimeout(input.timer);
  hits=q?[...new Set([...CITIES.filter(c=>c.n.toLowerCase().startsWith(q)),...al,...CITIES.filter(c=>c.n.toLowerCase().includes(q))])].slice(0,6):[];on=0;paint();
  if(q.length>=3)input.timer=setTimeout(async()=>{try{const found=await onlinePlaces(q);
   if(input.value.trim().toLowerCase()!==q||document.activeElement!==input)return;
   const have=new Set(hits.map(c=>c.n.toLowerCase()));
   found.forEach(p=>EXTRA.set(p.n.toLowerCase(),p));
   hits=[...hits.slice(0,4),...found.filter(p=>!have.has(p.n.split(',')[0].toLowerCase()))].slice(0,8);paint()}catch(e){}},450)});
 input.addEventListener('keydown',e=>{if(box.hidden)return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();on=(on+(e.key==='ArrowDown'?1:-1)+hits.length)%hits.length;paint()}
  else if(e.key==='Enter'){e.preventDefault();choose(hits[on])}else if(e.key==='Escape'){hits=[];paint()}});
 box.addEventListener('pointerdown',e=>{e.preventDefault();const i=[...box.children].indexOf(e.target.closest("button"));if(i>=0)choose(hits[i])});
 box.addEventListener('click',e=>e.preventDefault());
 input.addEventListener('blur',()=>{clearTimeout(input.timer);hits=[];paint()});
}

/* ---------- THEME, LANGUAGE & ABOUT PAGE ---------- */
function applyTheme(th){
 document.documentElement.dataset.theme=th;
 try{localStorage.setItem('rs_theme',th)}catch(e){}
 $('#themeBtn').textContent=th==='night'?'☀️ Day':'🌙 Night';
}
applyTheme((()=>{try{return localStorage.getItem('rs_theme')||'day'}catch(e){return'day'}})());
$('#themeBtn').onclick=()=>applyTheme(document.documentElement.dataset.theme==='night'?'day':'night');

let qi=-1;
function nextQuote(){
 const Q=tr('quotes');let last=NaN;try{last=+localStorage.getItem('rq')}catch(e){}
 let k;do{k=Math.floor(Math.random()*Q.length)}while((k===last||k===qi)&&Q.length>1);
 qi=k;try{localStorage.setItem('rq',k)}catch(e){}
 const q=Q[k],h=$('#hq'),p=$('#hs');
 h.innerHTML=`${q[0]}<br><span class="grad">${q[1]}</span>`;p.textContent=q[2].trim();
 [h,p].forEach(e=>{e.classList.remove('swap');void e.offsetWidth;e.classList.add('swap')});
}

function renderAbout(){
 const card=(h,items)=>`<div class="card hov rise"><h3>${h}</h3><ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul></div>`;
 $('#aboutTitle').innerHTML=tr('aboutH');
 $('#aboutBody').innerHTML=`
 <h2>System Architecture</h2>
 <div class="arch">
  <div class="card arch-step hov"><span class="arch-num">01</span><h3>Place &amp; Road Engine</h3><p class="sub">Offline 300+ Indian city graph combined with live OpenStreetMap Photon geocoding &amp; OSRM road geometry.</p></div>
  <div class="card arch-step hov"><span class="arch-num">02</span><h3>Multi-Modal Routing</h3><p class="sub">Direct, 1-change &amp; 2-change hub synthesis with Dijkstra shortest-path fallback across Train, Flight, Bus &amp; Cab.</p></div>
  <div class="card arch-step hov"><span class="arch-num">03</span><h3>Seasonal Risk Model</h3><p class="sub">Exponential delay distribution adjusted for North India winter fog, monsoon highways, and luggage transfer buffers.</p></div>
  <div class="card arch-step hov"><span class="arch-num">04</span><h3>Interactive Canvas Map</h3><p class="sub">Web Mercator satellite fly-through with hover route preview, multi-mode comparison arcs, and live delay simulation.</p></div>
 </div>
 <h2>Project Overview</h2>
 <div class="about">
  ${card('Problem statement',['Confirmed direct railway tickets are frequently waitlisted or sold out across major Indian corridors','Travellers manually jump between multiple apps to piece together alternate journeys','A single delayed train or flight can break an entire multi-leg trip if transfer buffers are too tight'])}
  ${card('Key capabilities',['Four-way comparison across Train, Flight, Bus, and Private Cab scaled for group size (1–6) and train class (SL / 3AC / 2AC / CC)','Automatic hub-based connecting routes with Dijkstra fallback and village-to-hub last-mile links','Seasonal delay intelligence (Winter Fog, Monsoon, Festive peak) with an interactive drag-to-test delay simulator','Bilingual English & हिन्दी interface, Day / Royal Night theme, and WhatsApp-ready shareable itineraries'])}
  ${card('Technology stack & AI integration',['Frontend: Modular HTML5, CSS3 Custom Properties, Vanilla JavaScript (ES6+), HTML5 2D Canvas','AI Chatbot Backend: Vercel Serverless Function (/api/chat) connected to Google Gemini API with context injection & error handling','Mapping & Geospatial: OpenStreetMap Photon API, OSRM Driving Router, Esri World Imagery Tiles','AI Tools Used in Development: Google Gemini, Claude, ChatGPT, and Cursor / GitHub Copilot (documented in docs/PROMPTS.md)'])}
  ${card('Project credits',['Course: Prompt Engineering — Final Project (Third Semester, Second-Year Engineering)','Team Members: Arpit Ganeshaanand (25BCON2339), Madhur Kumar (25BCON2463), Sarthak Gupta (25BCON2424)','Institution: Department of CSE, JECRC University, Jaipur','Project Type: AI-Powered Multi-Modal Route & Delay Intelligence Web Application'])}
 </div>`;
}

function applyLang(){
 $('#langBtn').textContent=LANG==='en'?'हिन्दी':'EN';
 $('#nHome').textContent=tr('navHome');
 $('#nDelay').textContent=tr('navDelay');
 $('#nAbout').textContent=tr('navAbout');
 $('#heroPillTxt').textContent=tr('pill');
 $('#lblFrom').textContent=tr('from');
 $('#lblTo').textContent=tr('to');
 $('#lblDate').textContent=tr('date');
 $('#from').placeholder=tr('phFrom');
 $('#to').placeholder=tr('phTo');
 $('.go').textContent=tr('find');
 $('#lblPax').textContent=tr('pax');
 $('#lblCls').textContent=tr('cls');
 $('#lblWeather').textContent=tr('weather');
 $('#weatherSel').options[0].text=tr('wAuto');
 $('#weatherSel').options[1].text=tr('wClear');
 $('#weatherSel').options[2].text=tr('wFog');
 $('#weatherSel').options[3].text=tr('wMonsoon');
 $('#chkH').textContent=tr('chkTitle');
 $('#chkSub').textContent=tr('chkSub');
 $('#lblCArr').textContent=tr('cArr');
 $('#lblCDep').textContent=tr('cDep');
 $('#lblCA').textContent=tr('cA');
 $('#lblCB').textContent=tr('cB');
 $('#whyH').textContent=tr('whyTitle');
 $('#why1H').textContent=tr('why1H');
 $('#why2H').textContent=tr('why2H');
 $('#why2P').textContent=tr('why2P');
 $('#why3H').textContent=tr('why3H');
 $('#why3P').textContent=tr('why3P');
 $('#count').textContent=LANG==='hi'?`भारत का कोई भी गाँव या शहर टाइप करें। ${CITIES.length} प्रमुख स्थान बिना इंटरनेट भी चलते हैं।`:`Type any village or town in India. ${CITIES.length} major places also work without internet.`;
 if($('#chatNavBtn'))$('#chatNavBtn').textContent=tr('navChat');
 nextQuote();renderRecent();check();renderAbout();
 if(S.a&&S.b&&$('#results').innerHTML)results(true);
 window.dispatchEvent(new CustomEvent('rs:context-change'));
}
$('#langBtn').onclick=()=>{
 LANG=LANG==='en'?'hi':'en';
 try{localStorage.setItem('rs_lang',LANG)}catch(e){}
 applyLang();
};

/* ---------- GLOBAL INTERACTIONS & EVENTS ---------- */
const mark=()=>document.querySelectorAll('[data-kind],[data-sort]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.kind?x.dataset.kind===S.kind:x.dataset.sort===S.sort));
const show=about=>{$('#home').hidden=about;$('#about').hidden=!about;scrollTo(0,0)};
$('#nHome').onclick=()=>{show(false);nextQuote()};
$('.logo').onclick=()=>{show(false);$('#results').innerHTML='';highlightCulturalDoodles(null,null);nextQuote()};
$('#nAbout').onclick=()=>show(true);
$('#nDelay').onclick=()=>{
 show(false);
 $('#homeExtra').classList.add('force-show');
 $('#checkerSec').scrollIntoView({behavior:'smooth'});
};

const startSearch=()=>{nextQuote();run()};
$('#form').addEventListener('submit',e=>e.preventDefault());
$('.go').addEventListener('click',startSearch);
for(const id of['from','to','date'])$('#'+id).addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.defaultPrevented){e.preventDefault();startSearch()}});
$('#swap').onclick=e=>{
 [$('#from').value,$('#to').value]=[$('#to').value,$('#from').value];
 const b=e.currentTarget;b.classList.remove('spin');void b.offsetWidth;b.classList.add('spin');
};

/* Passengers, Train Class, Weather selectors */
$('#paxDec').onclick=()=>{if(PAX>1){PAX--;$('#paxVal').textContent=PAX;if(S.a&&S.b&&$('#results').innerHTML)recomputeActive(true)}};
$('#paxInc').onclick=()=>{if(PAX<6){PAX++;$('#paxVal').textContent=PAX;if(S.a&&S.b&&$('#results').innerHTML)recomputeActive(true)}};
$('#clsSel').onchange=e=>{TCLASS=e.target.value;if(S.a&&S.b&&$('#results').innerHTML)recomputeActive(true)};
$('#weatherSel').onchange=e=>{WEATHER=e.target.value;if(S.a&&S.b&&$('#results').innerHTML)recomputeActive(true)};

/* Delegated clicks across cards, modals, tiles, map tabs, season cycle */
document.addEventListener('click',e=>{
 const s=e.target.closest('summary');
 if(s&&s.closest('.opt')){e.preventDefault();plan(S.rows[+s.parentElement.dataset.i]);return}
 if(e.target.id==='modal'||e.target.closest('#mx')){closeM();return}
 if(e.target.id==='clrRecent'){try{localStorage.removeItem('rs_recent')}catch(e){}renderRecent();return}
 if(e.target.id==='rePick'){chooseMode(k=>{S.kind=k;results(false)});return}
 if(e.target.id==='jumpDelay'){$('#homeExtra').classList.add('force-show');$('#checkerSec').scrollIntoView({behavior:'smooth'});return}
 if(e.target.id==='cycleSeason'){
  const seq=['auto','clear','fog','monsoon'];
  WEATHER=seq[(seq.indexOf(WEATHER)+1)%seq.length];
  $('#weatherSel').value=WEATHER;
  recomputeActive(true);return;
 }
 if(e.target.id==='fReset'){
  const fc=$('#fCost'),ft=$('#fTime');
  if(fc){fc.value=fc.max;S.maxCost=+fc.max;$('#fCostVal').textContent=rs(S.maxCost)}
  if(ft){ft.value=ft.max;S.maxTime=+ft.max*60;$('#fTimeVal').textContent=ft.max+'h'}
  list(true);return;
 }
 const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.pair){[$('#from').value,$('#to').value]=d.pair.split(',');run()}
 if(d.kind){S.kind=S.kind===d.kind?'all':d.kind;mark();list(true)}
 if(d.sort){S.sort=d.sort;mark();list(true)}
 if(d.map){S.mapMode=d.map;updateMap(true)}
});

/* Hover-to-preview route on the live map */
document.addEventListener('pointerover',e=>{
 const opt=e.target.closest('#list .opt');
 if(opt&&S.mapMode==='single'&&opt.dataset.id&&opt.dataset.id!==S.previewId){
  S.previewId=opt.dataset.id;
  updateMap(true);
 }
});

/* Range sliders: Modal Live Delay Simulator + Results Budget/Time Filters */
document.addEventListener('input',e=>{
 const i=e.target;if(i.type!=='range')return;
 if(i.id==='fCost'){S.maxCost=+i.value;$('#fCostVal').textContent=rs(S.maxCost);list(true);return}
 if(i.id==='fTime'){S.maxTime=+i.value*60;$('#fTimeVal').textContent=i.value+'h';list(true);return}
 const v=+i.value,slack=+i.dataset.slack,o=i.nextElementSibling,ok=v<=slack;
 o.textContent=LANG==='hi'
  ?`${v} मि. देरी: ${ok?`आप अगली ${i.dataset.next} पकड़ लेंगे (${slack-v} मि. अतिरिक्त)।`:`अगली ${i.dataset.next} छूटने की संभावना है।`}`
  :`+${v} min late: ${ok?`you will still catch the next ${i.dataset.next}, with ${slack-v} min to spare.`:`you will likely miss the next ${i.dataset.next}.`}`;
 o.style.color=ok?'var(--teal)':'var(--red)';
});

addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modal').hidden)closeM()});

/* ---------- LIVE DATA & BOOKING APPS CONNECTOR MODAL ---------- */
function openApiModal(){
 const hasKey=!!getRapidKey().trim();
 $('#apiModal').innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="Live Data and Booking Connectors">
  <button type="button" id="apiClose" style="float:right;padding:6px 13px" aria-label="Close">✕</button>
  <h2 style="margin:0 0 6px;font-size:1.55rem">⚡ Live Data &amp; Booking Connections</h2>
  <p class="sub" style="margin:0 0 12px">RouteSaathi combines live geospatial APIs, verified Indian corridor timetables, and pre-filled deep-links directly into official booking apps.</p>
  <div class="api-grid">
   <div class="api-item"><div><b>OpenStreetMap Photon + OSRM Road Engine</b><small>Live village/city geocoding + real highway distances &amp; driving times</small></div><span class="api-dot on">● Live</span></div>
   <div class="api-item"><div><b>Esri World Satellite Imagery</b><small>Live satellite map tiles aligned to Web Mercator routes</small></div><span class="api-dot on">● Live</span></div>
   <div class="api-item"><div><b>Verified Indian Rail / Air / Bus Timetables</b><small>Real train numbers (12951 Rajdhani, 12393 Sampoorna Kranti, 20977 Vande Bharat, 12396 Ziyarat), airlines &amp; bus operators with IRCTC/IATA codes</small></div><span class="api-dot on">● Active</span></div>
   <div class="api-item"><div><b>Pre-filled Booking App Deep-Links</b><small>One-click handoff with station/airport codes, date, class &amp; passengers to ixigo, IRCTC, ConfirmTkt Live Status, Google Flights, MakeMyTrip, Skyscanner, redBus, AbhiBus &amp; Google Maps</small></div><span class="api-dot on">● Connected</span></div>
   <div class="api-item"><div><b>Optional: Live IRCTC Train API (RapidAPI)</b><small>IRCTC has no public browser API without a key. Paste your RapidAPI key for <code>irctc1.p.rapidapi.com</code> to fetch live train lists right inside RouteSaathi.</small></div><span class="api-dot ${hasKey?'on':'opt'}">${hasKey?'● Key Saved':'Optional'}</span></div>
  </div>
  <div class="api-key-box">
   <label>Optional RapidAPI Key (IRCTC Trains-Between-Stations)
    <div class="api-key-row">
     <input type="password" id="rapidKeyIn" placeholder="Paste RapidAPI key (stored only in your browser)" value="${getRapidKey().replace(/"/g,'&quot;')}">
     <button type="button" id="saveRapidKey" class="go" style="padding:10px 18px;font-size:.82rem">Save Key</button>
     ${hasKey?'<button type="button" id="clearRapidKey" style="padding:10px 14px;font-size:.8rem">Remove</button>':''}
    </div>
   </label>
   <p class="sub" id="apiMsg" style="margin:8px 0 0;font-size:.84rem"></p>
  </div>
 </div>`;
 $('#apiModal').hidden=false;document.body.style.overflow='hidden';
 const closeApi=()=>{$('#apiModal').hidden=true;document.body.style.overflow=''};
 $('#apiClose').onclick=closeApi;
 $('#apiModal').onclick=e=>{if(e.target.id==='apiModal')closeApi()};
 $('#saveRapidKey').onclick=()=>{
  const v=$('#rapidKeyIn').value.trim();
  try{localStorage.setItem('rs_rapid_key',v)}catch(e){}
  LIVE_IRCTC.clear();
  $('#apiMsg').textContent=v?'✓ RapidAPI key saved! Next train search will query live IRCTC data automatically.':'Key cleared — using verified timetables & deep-links.';
  setTimeout(openApiModal,900);
 };
 if($('#clearRapidKey'))$('#clearRapidKey').onclick=()=>{
  try{localStorage.removeItem('rs_rapid_key')}catch(e){}
  LIVE_IRCTC.clear();openApiModal();
 };
}
$('#apiBtn').onclick=openApiModal;
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#apiModal').hidden){$('#apiModal').hidden=true;document.body.style.overflow=''}});


/* Scroll reveal, progress bar, parallax doodles, hover spotlight */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});
new MutationObserver(()=>document.querySelectorAll('.rv:not(.in)').forEach(x=>io.observe(x))).observe(document.body,{childList:true,subtree:true});
document.querySelectorAll('.rv:not(.in)').forEach(x=>io.observe(x));
$('.logo').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('.logo').click()}});

const chip=[['Mumbai','Delhi'],['Patna','Delhi'],['Jaipur','Patna'],['Mumbai','Goa'],['Delhi','Manali'],['Kolkata','Bengaluru'],['Chennai','Srinagar'],['Jaipur','Delhi'],['Jaipur','Agra']].map(p=>`<button type="button" data-pair="${p}">${p.join(' → ')}</button>`).join('');
$('#chips').innerHTML=chip+chip;
document.querySelectorAll('[data-ic]').forEach(e=>e.innerHTML=svgi(e.dataset.ic));

const n=new Date();$('#date').value=$('#date').min=new Date(n-n.getTimezoneOffset()*6e4).toISOString().slice(0,10);day=$('#date').value;
applyLang();

addEventListener('scroll',()=>{
 document.documentElement.style.setProperty('--sy',scrollY);
 $('#prog').style.width=(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)*100)+'%';
},{passive:true});
document.addEventListener('pointermove',e=>{
 const c=e.target.closest&&e.target.closest('.hov,.tile');
 if(c){const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}
},{passive:true});

/* ---------- v10: 10 PRINCIPLES OF UI MOTION HOOKS ---------- */
function pulseClass(el,cls,ms=460){
 if(!el||calm)return;
 el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);
 setTimeout(()=>el.classList.remove(cls),ms);
}
function spawnRing(x,y){
 if(calm||!x&&!y)return;
 const r=document.createElement('span');
 r.className='fx-ring';r.style.left=x+'px';r.style.top=y+'px';
 document.body.append(r);
 setTimeout(()=>r.remove(),540);
}
/* 08. Secondary Action + 01. Squash & Stretch on clicks */
document.addEventListener('click',e=>{
 const btn=e.target.closest('button');
 if(!btn||btn.disabled)return;
 if(btn.classList.contains('go')||btn.id==='themeBtn'||btn.id==='langBtn'||btn.id==='copyTrip'||btn.id==='apiBtn'||btn.id==='swap'){
  spawnRing(e.clientX,e.clientY);
  pulseClass(btn,'anim-squash',440);
 }
 if(btn.id==='paxDec'||btn.id==='paxInc')pulseClass($('#paxVal'),'num-bump',360);
 /* 07. Moving in Arcs when swapping From/To */
 if(btn.id==='swap'){
  pulseClass($('#from'),'arc-r',450);
  pulseClass($('#to'),'arc-l',450);
 }
});
/* 10. Exaggerated Feedback: shake error banner whenever an error message appears */
new MutationObserver(()=>{
 const err=$('#err');
 if(err&&err.textContent.trim())pulseClass(err,'anim-shake',460);
}).observe($('#err'),{childList:true,characterData:true,subtree:true});
/* 08. Secondary Action: bump verdict percentage when standalone delay checker updates */
new MutationObserver(()=>{
 const vn=$('#cOut .num');
 if(vn)pulseClass(vn,'num-bump',360);
}).observe($('#cOut'),{childList:true});

