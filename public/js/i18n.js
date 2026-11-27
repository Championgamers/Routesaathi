/* Global runtime error banner */
addEventListener('error',e=>{if(!e.message)return;let b=document.getElementById('oops');if(!b){b=document.createElement('div');b.id='oops';b.style.cssText='position:fixed;bottom:12px;left:12px;z-index:99;background:#7a1f35;color:#fff;padding:10px 14px;border-radius:10px;font-size:13px';document.body.append(b)}b.textContent='Error: '+e.message+' (line '+e.lineno+')'});

const $=s=>document.querySelector(s);
const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- I18N (EN / HINDI) ---------- */
let LANG=(()=>{try{return localStorage.getItem('rs_lang')||'en'}catch(e){return'en'}})();
const T={
 en:{
  navHome:'Search',navDelay:'Delay Check',navAbout:'About',navChat:'✦ Saathi AI',
  pill:'AI route intelligence',from:'From',to:'To',date:'Travel date',
  phFrom:'Village, town or city',phTo:'Anywhere in India',
  find:'✦ Find my route',locating:'Locating…',
  pax:'Passengers',cls:'Train class',weather:'Weather',
  wAuto:'Auto (by date)',wClear:'Clear weather',wFog:'Winter fog',wMonsoon:'Monsoon',
  recent:'Recent:',clear:'Clear',
  chkTitle:'What if your train is late?',
  chkSub:'Check any change of train, bus or flight before you book it.',
  cArr:'You arrive at',cDep:'Next one leaves at',cA:'You arrive by',cB:'Then you take',
  whyTitle:'Why RouteSaathi',
  why1H:'Another way, always',why2H:'One clear comparison',why2P:'Price and time for train, flight, bus and car, side by side — scaled for your group size and train class.',
  why3H:'Season & delay aware',why3P:'Every connection is scored for delay risk with winter fog and monsoon awareness, plus a live delay simulator.',
  mNames:{train:'Train',flight:'Flight',bus:'Bus',car:'Car',mix:'Mix it up'},
  riskLbl:['Low','Medium','High'],
  connLbl:['Safe connection','Careful connection','Risky connection'],
  connNote:['Enough time in hand.','A long delay could make you miss it.','Avoid this if you must reach on time.'],
  sortLbl:{Best:'Best',Cheapest:'Cheapest',Fastest:'Fastest',Safest:'Safest'},
  all:'All',mixed:'Mixed modes',
  compareH:'Compare at a glance',sideH:'Side-by-side comparison',routesH:'Your routes',
  maxBudget:'Max budget',maxTime:'Max duration',resetF:'Reset filters',
  mapPrev:'Selected route',mapAll:'Compare all modes',changeMode:'⇄ Change mode',
  pickStep:'Step 1 of 2 · Travel preference',pickH:'How do you want to travel?',
  copyBtn:'📋 Copy itinerary',copied:'✓ Copied!',waBtn:'💬 Share on WhatsApp',
  aboutH:'About <span class="grad">RouteSaathi</span>',
  quotes:[
   ["Sold out is not","the end of the road.","One search shows every other way across India."],
   ["Don't chase tickets.","Chase the smartest route.","Compare train, flight, bus and cab before you decide."],
   ["Late train?","We planned for it.","Every change is scored for seasonal delay risk, automatically."],
   ["India is big.","Your options are bigger.","Smart hub connections you may never have thought of."],
   ["Know the risk","before you book.","Test real-time delays with our interactive connection simulator."],
   ["One search.","Every way across India.","Train, flight, bus and cab — scaled for your group and class."],
   ["Plan B,","before you need it.","Smart alternatives the moment a direct train is full."],
   ["Travel calm.","Let the route do the thinking.","Enter two places anywhere in India. We handle the rest."]
  ]
 },
 hi:{
  navHome:'खोजें',navDelay:'देरी जांच',navAbout:'परिचय',navChat:'✦ साथी AI',
  pill:'एआई रूट इंटेलिजेंस',from:'कहाँ से',to:'कहाँ तक',date:'यात्रा की तिथि',
  phFrom:'गाँव, कस्बा या शहर',phTo:'भारत में कहीं भी',
  find:'✦ मेरा रास्ता खोजें',locating:'खोज रहे हैं…',
  pax:'यात्री',cls:'ट्रेन श्रेणी',weather:'मौसम',
  wAuto:'स्वतः (तिथि अनुसार)',wClear:'साफ़ मौसम',wFog:'सर्दियों का कोहरा',wMonsoon:'मानसून',
  recent:'हाल की खोजें:',clear:'हटाएँ',
  chkTitle:'अगर आपकी ट्रेन लेट हो जाए तो?',
  chkSub:'बुकिंग से पहले किसी भी ट्रेन, बस या फ्लाइट कनेक्शन का जोखिम जाँचें।',
  cArr:'आप पहुँचते हैं',cDep:'अगली सवारी छूटती है',cA:'आप आते हैं',cB:'अगली सवारी',
  whyTitle:'RouteSaathi क्यों?',
  why1H:'हमेशा एक बेहतर विकल्प',why2H:'एक स्पष्ट तुलना',why2P:'ट्रेन, फ्लाइट, बस और कार का समय और किराया एक साथ — आपके समूह और श्रेणी के अनुसार।',
  why3H:'मौसम व देरी के प्रति सजग',why3P:'हर कनेक्शन पर कोहरे और मानसून के हिसाब से देरी का जोखिम व लाइव सिम्युलेटर।',
  mNames:{train:'ट्रेन',flight:'फ्लाइट',bus:'बस',car:'कार',mix:'मिश्रित मोड'},
  riskLbl:['कम','मध्यम','अधिक'],
  connLbl:['सुरक्षित कनेक्शन','सावधान कनेक्शन','जोखिम भरा कनेक्शन'],
  connNote:['पर्याप्त समय उपलब्ध है।','ज्यादा देरी होने पर कनेक्शन छूट सकता है।','समय पर पहुँचना जरूरी हो तो इससे बचें।'],
  sortLbl:{Best:'सर्वश्रेष्ठ',Cheapest:'सबसे सस्ता',Fastest:'सबसे तेज़',Safest:'सबसे सुरक्षित'},
  all:'सभी',mixed:'मिश्रित मोड',
  compareH:'एक नज़र में तुलना',sideH:'विस्तृत तुलना',routesH:'आपके रूट विकल्प',
  maxBudget:'अधिकतम बजट',maxTime:'अधिकतम समय',resetF:'फ़िल्टर रीसेट',
  mapPrev:'चयनित रूट',mapAll:'सभी मोड देखें',changeMode:'⇄ मोड बदलें',
  pickStep:'चरण 1 / 2 · यात्रा का माध्यम',pickH:'आप कैसे यात्रा करना चाहते हैं?',
  copyBtn:'📋 विवरण कॉपी करें',copied:'✓ कॉपी हो गया!',waBtn:'💬 WhatsApp पर साझा करें',
  aboutH:'<span class="grad">RouteSaathi</span> के बारे में',
  quotes:[
   ["टिकट फुल है?","सफ़र अभी खत्म नहीं।","एक खोज में पूरे भारत के हर विकल्प देखें।"],
   ["टिकट के पीछे न भागें,","स्मार्ट रास्ता चुनें।","ट्रेन, फ्लाइट, बस और कैब की सीधी तुलना करें।"],
   ["ट्रेन लेट हुई?","हमने पहले ही सोचा है।","हर कनेक्शन पर मौसम के अनुसार देरी का सटीक अनुमान।"],
   ["भारत बड़ा है,","आपके विकल्प उससे भी बड़े।","प्रमुख जंक्शनों से जुड़े स्मार्ट कनेक्शन खोजें।"],
   ["बुकिंग से पहले","जोखिम जान लें।","लाइव स्लाइडर से जाँचें कि देरी पर कनेक्शन मिलेगा या नहीं।"],
   ["एक खोज,","भारत का हर रास्ता।","ट्रेन, फ्लाइट, बस और कैब — एक ही स्क्रीन पर।"]
  ]
 }
};
const tr=k=>T[LANG][k];
