/* ---------- OPTIONAL LIVE IRCTC RAPIDAPI CACHE ---------- */
const LIVE_IRCTC=new Map();
const getRapidKey=()=>{try{return localStorage.getItem('rs_rapid_key')||''}catch(e){return''}};
async function fetchLiveIRCTC(a,b){
 const key=getRapidKey().trim(),scA=stnCode(a),scB=stnCode(b);
 if(!key||!scA||!scB)return null;
 const ck=`${scA}|${scB}|${day}`;
 if(LIVE_IRCTC.has(ck))return LIVE_IRCTC.get(ck);
 try{
  const c=new AbortController(),t=setTimeout(()=>c.abort(),6000);
  const url=`https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${scA}&toStationCode=${scB}&dateOfJourney=${day}`;
  const r=await fetch(url,{signal:c.signal,headers:{'x-rapidapi-key':key,'x-rapidapi-host':'irctc1.p.rapidapi.com'}});
  clearTimeout(t);
  if(!r.ok)return null;
  const j=await r.json();
  const arr=(j.data||[]).slice(0,3).map(x=>{
   const toM=s=>{const [hh,mm]=String(s||'06:00').split(':').map(Number);return (hh||0)*60+(mm||0)};
   const dParts=String(x.duration||'10:00').split(':').map(Number);
   const durM=(dParts[0]||10)*60+(dParts[1]||0);
   return{num:x.train_number,name:x.train_name,dep:toM(x.from_std),mins:durM,src:'live'};
  });
  LIVE_IRCTC.set(ck,arr.length?arr:null);
  return arr.length?arr:null;
 }catch(e){return null}
}

/* ---------- SMART PRE-FILLED DEEP-LINKS TO REAL APPS & GOOGLE MAPS ---------- */
const slug=s=>s.split(',')[0].trim().toLowerCase().replace(/[^a-z0-9]+/g,'-');
const fmtDate=(d,mode)=>{
 const [Y,M0,D]=(d||day||'2026-11-28').split('-');
 const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+M0-1]||'Nov';
 if(mode==='ddmmyyyy')return `${D}${M0}${Y}`;
 if(mode==='slash')return `${D}/${M0}/${Y}`;
 if(mode==='redbus')return `${D}-${MON}-${Y}`;
 if(mode==='yymmdd')return `${Y.slice(2)}${M0}${D}`;
 return `${Y}-${M0}-${D}`;
};
function legLinks(l){
 const aNm=l.a.n.split(',')[0],bNm=l.b.n.split(',')[0];
 const scA=stnCode(l.a),scB=stnCode(l.b),acA=airCode(l.a),acB=airCode(l.b);
 const links=[];
 if(l.m==='train'){
  const ixUrl=(scA&&scB)?`https://www.ixigo.com/search/result/train/${scA}/${scB}/${fmtDate(day,'ddmmyyyy')}//1/0/0/0/${TCLASS}`:'https://www.ixigo.com/trains';
  links.push(`<a href="${ixUrl}" target="_blank" rel="noopener">🚆 ixigo (${scA&&scB?`${scA}→${scB}`:'Trains'}) ↗</a>`);
  links.push(`<a href="https://www.irctc.co.in/nget/train-search" target="_blank" rel="noopener">🎫 IRCTC ↗</a>`);
  if(l.trainNo)links.push(`<a class="status-lk" href="https://www.confirmtkt.com/train-running-status/${l.trainNo}" target="_blank" rel="noopener">📍 Live Status #${l.trainNo} ↗</a>`);
  else links.push(`<a class="status-lk" href="https://www.confirmtkt.com/rbooking/" target="_blank" rel="noopener">✓ ConfirmTkt ↗</a>`);
  links.push(`<a class="maps-lk" href="https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(aNm+' Railway Station')}&destination=${encodeURIComponent(bNm+' Railway Station')}&travelmode=transit" target="_blank" rel="noopener">🗺 Maps Transit ↗</a>`);
 }else if(l.m==='flight'){
  const fA=acA||aNm,fB=acB||bNm;
  const gfUrl=`https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${fA} to ${fB} on ${day} oneway`)}&curr=INR`;
  links.push(`<a href="${gfUrl}" target="_blank" rel="noopener">✈️ Google Flights (${fA}→${fB}) ↗</a>`);
  if(acA&&acB){
   const mmtUrl=`https://www.makemytrip.com/flight/search?itinerary=${acA}-${acB}-${fmtDate(day,'slash')}&tripType=O&paxType=A-${PAX}_C-0_I-0&intl=false&cabinClass=E&ccde=IN&lang=eng`;
   links.push(`<a href="${mmtUrl}" target="_blank" rel="noopener">🛫 MakeMyTrip ↗</a>`);
   const skyUrl=`https://www.skyscanner.co.in/transport/flights/${acA.toLowerCase()}/${acB.toLowerCase()}/${fmtDate(day,'yymmdd')}/?adults=${PAX}`;
   links.push(`<a href="${skyUrl}" target="_blank" rel="noopener">🔎 Skyscanner ↗</a>`);
  }else links.push(`<a href="https://www.makemytrip.com/flights/" target="_blank" rel="noopener">🛫 MakeMyTrip ↗</a>`);
 }else if(l.m==='bus'){
  const rbUrl=`https://www.redbus.in/bus-tickets/${slug(aNm)}-to-${slug(bNm)}?fromCityName=${encodeURIComponent(aNm)}&toCityName=${encodeURIComponent(bNm)}&onward=${fmtDate(day,'redbus')}`;
  const abUrl=`https://www.abhibus.com/bus-tickets/${slug(aNm)}-to-${slug(bNm)}`;
  links.push(`<a href="${rbUrl}" target="_blank" rel="noopener">🚌 redBus (${aNm}→${bNm}) ↗</a>`);
  links.push(`<a href="${abUrl}" target="_blank" rel="noopener">🚌 AbhiBus ↗</a>`);
  links.push(`<a class="maps-lk" href="https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(aNm)}&destination=${encodeURIComponent(bNm)}&travelmode=transit" target="_blank" rel="noopener">🗺 Maps Transit ↗</a>`);
 }else{
  links.push(`<a class="maps-lk" href="https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(aNm)}&destination=${encodeURIComponent(bNm)}&travelmode=driving" target="_blank" rel="noopener">🗺 Google Maps Live Traffic ↗</a>`);
  links.push(`<a href="https://www.makemytrip.com/cabs/" target="_blank" rel="noopener">🚕 Book Outstation Cab ↗</a>`);
 }
 return links.join('');
}


/* ---------- PASSENGERS, TRAIN CLASS & SEASONAL DELAY MODEL ---------- */
const CLASS_MULT={SL:1, '3A':2.35, '2A':3.4, CC:1.65};
const CLASS_NAME={SL:'Sleeper (SL)', '3A':'3AC (3A)', '2A':'2AC (2A)', CC:'Chair Car (CC)'};
let PAX=1, TCLASS='SL', WEATHER='auto';

function activeSeason(a,b){
 if(WEATHER==='clear')return{id:'clear',mult:{train:1,flight:1,bus:1,car:1},icon:'☀️',label:LANG==='hi'?'साफ़ मौसम (सामान्य जोखिम)':'Standard weather'};
 if(WEATHER==='fog')return{id:'fog',mult:{train:1.5,flight:1.32,bus:1.25,car:1.2},icon:'🌫️',label:LANG==='hi'?'कोहरा प्रभाव सक्रिय (+50% रेल देरी)':'Winter Fog Adjustment Active'};
 if(WEATHER==='monsoon')return{id:'monsoon',mult:{train:1.18,flight:1.15,bus:1.38,car:1.35},icon:'🌧️',label:LANG==='hi'?'मानसून सड़क प्रभाव सक्रिय':'Monsoon Season Adjustment Active'};
 const m=new Date(day||Date.now()).getMonth();
 const north=(a&&a.lat>=23.5)||(b&&b.lat>=23.5);
 if((m===11||m===0)&&north)return{id:'fog',mult:{train:1.45,flight:1.3,bus:1.22,car:1.18},icon:'🌫️',label:LANG==='hi'?'उत्तर भारत कोहरा प्रभाव सक्रिय':'North India Winter Fog Adjustment Active'};
 if(m>=6&&m<=8)return{id:'monsoon',mult:{train:1.15,flight:1.12,bus:1.35,car:1.32},icon:'🌧️',label:LANG==='hi'?'मानसून देरी प्रभाव सक्रिय':'Monsoon Season Delay Adjustment Active'};
 if(m===9||m===10)return{id:'festive',mult:{train:1.18,flight:1.1,bus:1.15,car:1.12},icon:'🪔',label:LANG==='hi'?'त्योहारी सीज़न मांग सक्रिय':'Festive Peak Season Adjustment Active'};
 return{id:'clear',mult:{train:1,flight:1,bus:1,car:1},icon:'☀️',label:LANG==='hi'?'सामान्य मौसम':'Standard weather'};
}

const LATE={train:[25,6],bus:[20,4],flight:[18,5],car:[15,3]};
const avgLate=l=>{
 const se=activeSeason(S.a||l.a,S.b||l.b);
 return (LATE[l.m][0]+LATE[l.m][1]*l.mins/60)*(se.mult[l.m]||1);
};
const needed=(x,y)=>x==='flight'||y==='flight'?90:x===y?(x==='train'?25:20):45;
const lateMore=(l,mins)=>mins<=0?100:Math.round(100*Math.exp(-mins/avgLate(l)));
const missChance=(x,y,wait)=>Math.min(99,lateMore(x,wait-needed(x.m,y.m)));
const level=p=>p<10?0:p<30?1:2;
const tripRisk=t=>t.legs.length>1?Math.round(100*(1-t.miss.reduce((s,p)=>s*(1-p/100),1))):lateMore(t.legs[0],30);
const rl=p=>p<10?[tr('riskLbl')[0],'var(--teal)']:p<30?[tr('riskLbl')[1],'var(--amber)']:[tr('riskLbl')[2],'var(--red)'];

/* ---------- ESTIMATE ENGINE ---------- */
const LAST={train:[30,150],flight:[60,400],bus:[30,150],car:[0,0]};
let day='';
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const km=(a,b)=>{const r=Math.PI/180,x=Math.sin((b.lat-a.lat)*r/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin((b.lon-a.lon)*r/2)**2;return 12742*Math.asin(Math.sqrt(x))};
const r10=n=>Math.round(n/10)*10;
const SV={
 train:["Superfast Express","Humsafar Express","Jan Shatabdi Exp","Intercity SF Exp"],
 bus:["IntrCity SmartBus Volvo","Zingbus Maxx AC Sleeper","NueGo Electric AC","State RTC Volvo AC"],
 flight:["IndiGo Non-stop","Air India Non-stop","Akasa Air Non-stop","Air India Express"],
 car:["Private Outstation Sedan / SUV"]
};

function regionalBusOp(a,b,h){
 const s=(a.n+' '+b.n).toLowerCase();
 if(/jaipur|jodhpur|udaipur|ajmer|kota|bikaner/.test(s))return ['RSRTC Volvo AC','Zingbus Maxx AC Sleeper','IntrCity SmartBus'][h%3];
 if(/mumbai|pune|nashik|goa|nagpur/.test(s))return ['MSRTC Shivneri AC','NueGo Electric AC','IntrCity SmartBus Volvo'][h%3];
 if(/bengaluru|mysuru|mangaluru|chennai|hyderabad|kochi/.test(s))return ['KSRTC Airavat Club','NueGo Electric AC','IntrCity SmartBus'][h%3];
 if(/manali|shimla|chandigarh|dharamshala|dehradun/.test(s))return ['HRTC Himsuta Volvo','Zingbus Maxx Volvo','FlixBus India AC'][h%3];
 if(/lucknow|varanasi|agra|kanpur|prayagraj|patna/.test(s))return ['UPSRTC Janrath AC','Zingbus AC Sleeper','IntrCity SmartBus'][h%3];
 return SV.bus[h%SV.bus.length];
}

function leg(m,a,b){
 const d=km(a,b),road=d*1.3,h=hash(day+m+a.n+b.n);
 let mins,fare,svc,dep=300+hash('d'+day+m+a.n+b.n)%1080,trainNo='',src='est';
 if(m!=='flight'&&(a.island||b.island)&&!(a.island&&b.island&&d<200))return null;

 const ck=`${a.n.toLowerCase()}|${b.n.toLowerCase()}`;
 const cor=REAL_CORRIDORS[ck];

 /* 1. Check Live IRCTC RapidAPI data first (if user configured an API key) */
 const liveKey=`${stnCode(a)}|${stnCode(b)}|${day}`;
 const liveList=m==='train'?LIVE_IRCTC.get(liveKey):null;
 if(liveList&&liveList.length){
  const t0=liveList[0],railKm=d*1.22;
  trainNo=t0.num;svc=`${t0.num} ${t0.name} (${TCLASS})`;dep=t0.dep;mins=t0.mins;src='live';
  const baseSL=Math.max(145,railKm*0.52+45);
  fare=baseSL*CLASS_MULT[TCLASS]*PAX;
  const seats=2+h%42;
  return{m,a,b,svc,trainNo,src,mins:Math.round(mins),fare:r10(fare),seats,dep};
 }

 /* 2. Check Verified Indian Corridor Timetables */
 if(cor&&cor[m]&&cor[m].length){
  const rec=cor[m][0];
  src='verified';
  if(m==='train'){
   const [num,nm,dMin,durM,baseSL,noSL,forceFull]=rec;
   trainNo=num;dep=dMin;mins=durM;
   const effCls=(noSL&&TCLASS==='SL')?'3A':TCLASS;
   svc=`${num} ${nm} (${effCls})`;
   const mult=effCls==='SL'?1:effCls==='3A'?2.35:effCls==='2A'?3.4:1.65;
   fare=(noSL?baseSL*(effCls==='2A'?1.42:effCls==='CC'?0.92:1.15):baseSL*mult)*PAX;
   let seats=forceFull?0:6+h%42;
   return{m,a,b,svc,trainNo,src,mins:Math.round(mins),fare:r10(fare),seats,dep};
  }
  if(m==='flight'){
   const [flt,air,dMin,durM,baseEco]=rec;
   svc=`${flt} · ${air}`;dep=dMin;mins=durM;fare=baseEco*PAX;
   return{m,a,b,svc,trainNo:'',src,mins:Math.round(mins),fare:r10(fare),seats:8+h%24,dep};
  }
  if(m==='bus'){
   const [op,dMin,durM,baseF]=rec;
   svc=op;dep=dMin;mins=durM;fare=baseF*PAX;
   return{m,a,b,svc,trainNo:'',src,mins:Math.round(mins),fare:r10(fare),seats:5+h%28,dep};
  }
 }

 /* 3. Realistic Indian Slab Fallback for all other 300+ city pairs */
 if(m==='train'){
  if(!a.rail||!b.rail||d<25||d>2600)return null;
  const railKm=d*1.22;
  mins=railKm/62*60+20;
  const baseSL=Math.max(125,railKm*0.52+45);
  fare=baseSL*CLASS_MULT[TCLASS]*PAX;
  svc=`${SV.train[h%SV.train.length]} (${TCLASS})`;
 }
 if(m==='bus'){
  if(road>1400)return null;
  mins=road/(a.rail&&b.rail?50:36)*60+20;
  fare=Math.max(90,road*1.45)*PAX;
  svc=regionalBusOp(a,b,h);
 }
 if(m==='flight'){
  if(!a.air||!b.air||d<220||!(a.hub||b.hub||a.island||b.island))return null;
  mins=d/740*60+38;
  fare=(2350+d*2.95)*PAX;
  svc=SV.flight[h%SV.flight.length];
 }
 if(m==='car'){
  if(road>3600)return null;
  mins=road/56*60;
  fare=road*12.5*Math.ceil(PAX/4);
  svc=SV.car[0];
 }
 let seats=m==='car'?4*Math.ceil(PAX/4):2+h%46;
 if(m==='train'&&d>350&&h%100<28)seats=0;
 if(m==='train'&&a.n==='Patna'&&b.n==='Delhi')seats=0;
 return{m,a,b,svc,trainNo,src,mins:Math.round(mins),fare:r10(fare),seats,dep};
}
function trip(legs){
 let time=legs[0].mins,risk=0;const waits=[],miss=[];
 for(let i=1;i<legs.length;i++){
  const w=10+hash(day+legs[i-1].a.n+legs[i].b.n+legs[i].m)%290;
  waits.push(w);time+=w+legs[i].mins;const p=missChance(legs[i-1],legs[i],w);miss.push(p);risk=Math.max(risk,level(p));
 }
 const f0=legs[0],l0=legs[legs.length-1],first=f0.m,last=l0.m,lMult=Math.ceil(PAX/3);
 const local=((f0.local?0:LAST[first][1])+(l0.local?0:LAST[last][1]))*lMult;
 const main=legs.filter(l=>!l.local),modes=[...new Set((main.length?main:legs).map(l=>l.m))];
 return{legs,waits,miss,modes,local,risk,time:time+(f0.local?0:LAST[first][0])+(l0.local?0:LAST[last][0]),cost:legs.reduce((s,l)=>s+l.fare,0)+local,
  open:legs.every(l=>l.seats>=PAX),kind:modes.length>1?'mix':modes[0],id:legs.map(l=>l.m+l.a.n+l.b.n).join()};
}
const score=t=>t.time+(t.cost/PAX)*.35+(t.legs.length-1)*90+t.miss.reduce((s,p)=>s+p,0)*9;

function dijkstra(a,b,modes){
 const nodes=[...new Set([a,b,...CITIES.filter(c=>c.hub||km(c,a)<350||km(c,b)<350)])];
 const best=new Map([[a,0]]),prev=new Map(),done=new Set();
 for(;;){
  let u=null;for(const [n,v] of best)if(!done.has(n)&&(!u||v<best.get(u)))u=n;
  if(!u)return null;if(u===b)break;done.add(u);
  for(const v of nodes){if(v===u||done.has(v))continue;
   for(const m of modes){const l=leg(m,u,v);if(!l||l.seats<PAX)continue;
    const c=best.get(u)+l.mins+(l.fare/PAX)*.35+150;
    if(!best.has(v)||c<best.get(v)){best.set(v,c);prev.set(v,l)}}}
 }
 const legs=[];for(let n=b;n!==a;n=prev.get(n).a)legs.unshift(prev.get(n));
 return trip(legs);
}
function search(a,b){
 const direct=['train','flight','bus','car'].map(m=>leg(m,a,b)).filter(Boolean).map(l=>trip([l]));
 const d=km(a,b),M3=['train','bus','flight'],pool=[];
 for(const h of CITIES){
  if(h===a||h===b)continue;const p=km(a,h),q=km(h,b);
  if(p<45||q<45||p+q>d*1.5+120)continue;
  for(const m1 of M3)for(const m2 of M3){const x=leg(m1,a,h),y=leg(m2,h,b);if(x&&y&&x.seats>=PAX&&y.seats>=PAX)pool.push(trip([x,y]))}
 }
 if(d>500){const hubs=CITIES.filter(c=>c.hub);
  for(const h1 of hubs)for(const h2 of hubs){
   if(h1===h2||h1===a||h1===b||h2===a||h2===b)continue;
   const p=km(a,h1),q=km(h1,h2),r=km(h2,b);
   if(p<80||q<80||r<80||p+q+r>d*1.3+100)continue;
   for(const m1 of M3)for(const m2 of M3)for(const m3 of M3){const x=leg(m1,a,h1),y=leg(m2,h1,h2),z=leg(m3,h2,b);if(x&&y&&z&&x.seats>=PAX&&y.seats>=PAX&&z.seats>=PAX)pool.push(trip([x,y,z]))}}}
 pool.sort((p,q)=>score(p)-score(q));
 const picked=[],seen=new Set(),per={};let three=0;
 for(const t of pool){
  const k=t.legs.map(l=>l.m).join('+'),v=t.legs.slice(1).map(l=>l.a.n).join('>');
  if(seen.has(v))continue;
  if(t.legs.length>2){if(three>=5)continue}else if((per[k]=(per[k]||0)+1)>(k==='train+train'?6:3))continue;
  seen.add(v);if(t.legs.length>2)three++;picked.push(t);if(picked.length>=20)break;
 }
 const all=[...direct,...picked];
 for(const modes of[['train','bus'],['train','bus','flight']])
  if(!all.some(t=>t.open&&t.kind!=='car')){const t=dijkstra(a,b,modes);if(t&&!all.some(o=>o.id===t.id))all.push(t)}
 return all;
}

/* ---------- ANY PLACE IN INDIA: OpenStreetMap (Photon) & OSRM ---------- */
const EXTRA=new Map();
async function getJSON(url){const c=new AbortController(),t=setTimeout(()=>c.abort(),6000);
 try{const r=await fetch(url,{signal:c.signal});if(!r.ok)throw 0;return await r.json()}finally{clearTimeout(t)}}
async function onlinePlaces(q){
 const j=await getJSON(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=12&lang=en&bbox=68,6,97.5,37.5`);
 const seen=new Set();
 return j.features.filter(f=>f.properties.countrycode==='IN'&&f.properties.osm_key==='place'&&f.properties.name).map(f=>{
  const p=f.properties,[lon,lat]=f.geometry.coordinates,district=p.county||p.district||p.city||'';
  const clean=s=>String(s||'').replace(/[<>&"'`]/g,'');
  const label=[p.name,district!==p.name?district:'',p.state].filter(Boolean).map(clean).join(', ');
  return{n:label,lat:+lat,lon:+lon,air:false,rail:false,hub:false,ext:true,island:/Andaman|Lakshadweep/.test(p.state)};
 }).filter(p=>!seen.has(p.n)&&seen.add(p.n));
}
async function resolvePlace(text){
 const v=text.trim();if(!v)return null;
 const known=find(v)||EXTRA.get(v.toLowerCase());if(known)return known;
 const guess=v.length>=3?CITIES.find(c=>c.n.toLowerCase().startsWith(v.toLowerCase())):null;
 try{const [p]=await onlinePlaces(v);if(p){EXTRA.set(v.toLowerCase(),p);EXTRA.set(p.n.toLowerCase(),p)}return p||guess||null}catch(e){return guess||null}
}
async function roadRoute(a,b){
 try{const j=await getJSON(`https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=simplified&geometries=geojson`),r=j.routes[0];
  return{km:r.distance/1000,mins:r.duration/60,path:r.geometry.coordinates}}catch(e){return null}
}
const nearest=(p,ok)=>CITIES.filter(c=>c!==p&&ok(c)&&!c.island===!p.island).sort((x,y)=>km(p,x)-km(p,y))[0];
function localLeg(a,b){
 const road=km(a,b)*1.3,cab=road<15;
 return{m:cab?'car':'bus',local:true,a,b,svc:cab?'Shared auto or cab':'Local bus',mins:Math.round(road/30*60+15),fare:r10(Math.max(20,road*(cab?12*Math.ceil(PAX/3):1.5*PAX))),seats:20,dep:360+hash(day+a.n+b.n)%600};
}
function journeys(a,b,road){
 let out;
 if(!a.ext&&!b.ext)out=search(a,b);
 else{
  out=['bus','car'].filter(m=>m==='car'||km(a,b)<250).map(m=>leg(m,a,b)).filter(Boolean).map(l=>trip([l]));
  const gates=p=>!p.ext?[p]:[...new Set([nearest(p,c=>c.rail),nearest(p,c=>c.air)].filter(c=>c&&km(p,c)<450))];
  const seen=new Set();
  for(const A of gates(a))for(const B of gates(b)){
   if(A===B)continue;
   for(const t of search(A,B)){
    if(t.kind==='car')continue;
    const legs=[...t.legs];
    if(a.ext&&km(a,A)>3)legs.unshift(localLeg(a,A));else legs[0]={...legs[0],a};
    if(b.ext&&km(B,b)>3)legs.push(localLeg(B,b));else legs[legs.length-1]={...legs[legs.length-1],b};
    const n=trip(legs);if(!seen.has(n.id)){seen.add(n.id);out.push(n)}
   }
  }
  out.sort((x,y)=>y.open-x.open||score(x)-score(y));
  const per={};out=out.filter(t=>(per[t.kind]=(per[t.kind]||0)+1)<=8);
 }
 if(road){
  out=out.map(t=>{const l=t.legs[0];if(t.legs.length>1||(l.m!=='car'&&l.m!=='bus'))return t;
   return trip([{...l,path:road.path,mins:Math.round(road.mins*(l.m==='bus'?1.3:1.1)),fare:r10(Math.max(60,road.km*(l.m==='car'?12*Math.ceil(PAX/4):1.4*PAX)))}])});
 }
 return out;
}

/* ---------- ROUTE-AWARE DYNAMIC CULTURAL DOODLES ---------- */
function highlightCulturalDoodles(a,b){
 const els=document.querySelectorAll('.doodles .dd');
 if(!a||!b){els.forEach(e=>e.classList.remove('region-hit','region-dim'));return''}
 const syms=new Set(),names=[];
 const add=(s,lbl)=>{s.forEach(x=>syms.add(x));if(lbl&&!names.includes(lbl))names.push(lbl)};
 for(const p of [a,b]){
  const n=p.n.toLowerCase();
  if(/jaipur|jodhpur|udaipur|ajmer|pushkar|bikaner|jaisalmer|kota|alwar|rajasthan/.test(n))add(['d-hawamahal','d-peacock','d-elephant','d-jhumka'],'Hawa Mahal & Royal Peacock');
  else if(/mumbai|pune|thane|nashik|goa|nagpur|maharashtra/.test(n))add(['d-gateway','d-auto','d-bangles'],'Gateway of India');
  else if(/agra|lucknow|varanasi|ayodhya|prayagraj|kanpur|mathura|uttar pradesh/.test(n))add(['d-taj','d-sitar','d-tabla','d-diya'],'Taj Mahal & Classical Heritage');
  else if(/delhi|gurugram|noida|faridabad|chandigarh|amritsar/.test(n))add(['d-ashoka','d-auto','d-chai'],'Ashoka Chakra & Capital Heritage');
  else if(/patna|gaya|bodh gaya|muzaffarpur|darbhanga|bihar|kolkata|bhubaneswar/.test(n))add(['d-ashoka','d-lotus-mandala','d-diya','d-marigold'],'Ashoka Chakra & Sacred Lotus');
  else if(/ahmedabad|surat|vadodara|rajkot|bhuj|gujarat/.test(n))add(['d-kite','d-paisley','d-jhumka'],'Festive Patang & Paisley');
  else if(p.lat<17.5)add(['d-bharatanatyam','d-gopuram','d-rangoli'],'Bharatanatyam & Temple Gopuram');
  else add(['d-ashoka','d-peacock','d-lotus-mandala'],'Indian Heritage Motifs');
 }
 els.forEach(e=>{
  const hit=syms.has(e.dataset.sym);
  e.classList.toggle('region-hit',hit);
  e.classList.toggle('region-dim',!hit);
 });
 return names.slice(0,2).join(' · ');
}
